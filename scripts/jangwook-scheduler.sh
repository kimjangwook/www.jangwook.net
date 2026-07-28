#!/bin/bash
# jangwook-scheduler.sh — launchd wrapper for Claude Code automation
# Based on effloow-scheduler.sh pattern
# Usage: jangwook-scheduler.sh <task-name> <claude-args...>

set -uo pipefail

# PATH setup (launchd doesn't inherit shell PATH)
# Must include: claude CLI (cmux.app), nvm node, homebrew, system
export PATH="/Applications/cmux.app/Contents/Resources/bin:/Users/jangwook/.nvm/versions/node/v22.22.0/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
export HOME="/Users/jangwook"

# Project directory
PROJECT_DIR="/Users/jangwook/Documents/workspace/www.jangwook.net"
cd "$PROJECT_DIR"

# Load environment variables (API keys, Telegram credentials)
if [ -f "$PROJECT_DIR/.env" ]; then
    set -a
    source "$PROJECT_DIR/.env"
    set +a
fi

# Claude Telegram 플러그인 MCP(bun server.ts) 차단 (2026-07-21).
# 헤드리스 run 은 인바운드 텔레그램이 불필요(알림은 TG_BOT_TOKEN+curl 경로)한데,
# claude 비정상 종료(SIGKILL/EINTR 행업 사망) 시 bun 폴러가 고아로 남아 CPU 를 점유한다.
# 빈 값이면 플러그인이 토큰 검사에서 즉시 exit(1) 해 폴러 자체가 뜨지 않는다.
export TELEGRAM_BOT_TOKEN=""

# 이전 세션이 남긴 고아 bun 폴러 정리. 플러그인(0.0.6) 자체 워치독은 ppid 변화만
# 검사하는데, server.ts 의 부모는 claude 가 아니라 bun run 래퍼라 claude 가 죽어도
# ppid 가 안 바뀌어 발동하지 않는다. 래퍼가 launchd(pid 1)로 재부모화된 체인만 죽인다.
cleanup_orphan_telegram_bun() {
    local pid ppid gppid
    for pid in $(pgrep -f 'bun server\.ts' 2>/dev/null); do
        ppid=$(ps -o ppid= -p "$pid" 2>/dev/null | tr -d ' ')
        [ -n "$ppid" ] || continue
        gppid=$(ps -o ppid= -p "$ppid" 2>/dev/null | tr -d ' ')
        if [ "$ppid" = "1" ] || [ "$gppid" = "1" ]; then
            echo "[$(date '+%Y-%m-%d %H:%M:%S')] orphan telegram bun 정리: pid=$pid wrapper=$ppid" >> "${LOG_FILE:-/dev/null}" 2>/dev/null || true
            kill "$pid" "$ppid" 2>/dev/null || true
        fi
    done
}
cleanup_orphan_telegram_bun

# Telegram notification function
tg_send() {
    local message="$1"
    if [ -n "${TG_BOT_TOKEN:-}" ] && [ -n "${TG_CHAT_ID:-}" ]; then
        curl -s -X POST "https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage" \
            -d chat_id="${TG_CHAT_ID}" \
            --data-urlencode "text=${message}" \
            -d disable_web_page_preview=true \
            -o /dev/null -w "" 2>/dev/null || true
    fi
}

should_run_publishing_gate() {
    case "$TASK_NAME" in
        *daily*|*publish*|*post*|*blog*|*write*)
            return 0
            ;;
        *)
            return 1
            ;;
    esac
}

# Task name
TASK_NAME="${1:?Usage: jangwook-scheduler.sh <task-name> <claude-args...>}"
shift

# Logging
LOG_DIR="$HOME/.jangwook-net/logs"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/${TASK_NAME}.log"

# Rotate log if > 1MB
if [ -f "$LOG_FILE" ] && [ "$(stat -f%z "$LOG_FILE" 2>/dev/null || echo 0)" -gt 1048576 ]; then
    mv "$LOG_FILE" "$LOG_FILE.prev"
fi

START_TIME=$(date +%s)

echo "" >> "$LOG_FILE"
echo "========================================" >> "$LOG_FILE"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] START: $TASK_NAME" >> "$LOG_FILE"
echo "========================================" >> "$LOG_FILE"

# ── claude 헤드리스 새니티 프리플라이트 (2026-07-29 ⑥) ──
# 07-26~27 행업 9건 전례: claude-code 자동 업데이트 후 Documents(TCC) 권한 미부여 또는
# 세션·인증 문제로 claude 가 무응답이면, 워치독이 20분 이상 낭비되고 작업은 0 진척으로 끝난다.
# 본 작업 전 60초 핑으로 즉시 판별 → 실패 시 경보 후 종료(다음 주기 자동 재시도).
run_timeout() {
    local secs="$1"; shift
    "$@" &
    local cmd_pid=$!
    ( sleep "$secs"; kill -TERM "$cmd_pid" 2>/dev/null ) &
    local killer_pid=$!
    wait "$cmd_pid" 2>/dev/null
    local rc=$?
    kill -TERM "$killer_pid" 2>/dev/null
    wait "$killer_pid" 2>/dev/null
    [ "$rc" -eq 143 ] && rc=124
    return $rc
}

claude_preflight() {
    local tmp rc
    tmp="$(mktemp -t claude-preflight 2>/dev/null || echo /tmp/claude-preflight.$$)"
    run_timeout 60 claude -p 'Reply with exactly: OK' --model haiku </dev/null >"$tmp" 2>&1
    rc=$?
    if [ "$rc" -eq 0 ] && grep -qi 'OK' "$tmp"; then
        rm -f "$tmp"; return 0
    fi
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] PREFLIGHT: claude 무응답(rc=${rc}): $(tr '\n' ' ' < "$tmp" 2>/dev/null | tail -c 300)" >> "$LOG_FILE"
    rm -f "$tmp"; return 1
}

if ! claude_preflight; then
    tg_send "[jangwook.net] ${TASK_NAME}: claude 헤드리스 무응답(60초 프리플라이트 실패)
원인 후보: claude-code 업데이트 후 Documents(TCC) 권한 미부여 / 세션·인증 문제.
조치: 이번 주기 건너뜀(다음 주기 자동 재시도). 반복 시 터미널에서 claude 1회 실행해 접근 허용,
또는 /bin/bash 에 전체 디스크 접근 권한 부여."
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] PREFLIGHT ABORT: claude 무응답 — 작업 스킵" >> "$LOG_FILE"
    exit 1
fi

# Sync with remote before running
if ! git pull --rebase origin main >> "$LOG_FILE" 2>&1; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] git pull --rebase failed, attempting recovery..." >> "$LOG_FILE"

    git rebase --abort >> "$LOG_FILE" 2>&1 || true
    git stash >> "$LOG_FILE" 2>&1 || true
    if ! git pull --rebase origin main >> "$LOG_FILE" 2>&1; then
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] Remote sync failed; refusing destructive reset." >> "$LOG_FILE"
        tg_send "[jangwook.net] 원격 동기화 실패
작업: ${TASK_NAME}
상태: git pull --rebase 실패
조치: 수동 확인 필요"
        exit 1
    fi
    git stash pop >> "$LOG_FILE" 2>&1 || true

    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Sync recovered" >> "$LOG_FILE"
fi

# --- Watchdog: alert if claude hangs for over 1 hour ---
(
    sleep 3600
    ELAPSED=$(( $(date +%s) - START_TIME ))
    if [ $ELAPSED -ge 3600 ]; then
        tg_send "[jangwook.net] 스케줄 지연 경고
작업: ${TASK_NAME}
경과: $((ELAPSED / 60))분 이상
상태: Claude 프로세스가 1시간 넘게 실행 중
조치: 프로세스 점검 필요"
    fi
) &
WATCHDOG_PID=$!

# 일시적 실패(인증/과부하/네트워크) 감지 — 이 run 의 로그 꼬리에서만 확인.
# 빌드 진행 카운터 "(401/798)" 같은 오탐을 피하려 정밀 패턴 사용.
# 2026-07-01 daily-closing: claude 가 출력 0으로 ~3.9h 행업 후 "An internal error occurred (EINTR)"
# 로 사망했으나 이 패턴에 없어 재시도가 발동하지 않았다 → CLI 내부 오류도 transient 로 포함.
is_transient_failure() {
    tail -n 120 "$LOG_FILE" | grep -qiE 'Invalid authentication|Failed to authenticate|API Error: (401|429|500|503|529)|overloaded_error|Too Many Requests|ETIMEDOUT|ECONNRESET|rate.?limit|An internal error occurred|EINTR'
}

# 실패 원인을 사람이 읽을 라벨로 추정(알림 가시성). 세션 한도는 120초 재시도가
# 무의미(고정 시각 리셋)하므로 transient 에 넣지 않고 여기서 명시만 한다.
failure_cause() {
    local t; t="$(tail -n 120 "$LOG_FILE")"
    if printf '%s' "$t" | grep -qiE "session limit|usage limit|hit your (session|usage)"; then
        echo "Claude 세션/사용량 한도 도달 — opus 사용량 점검 권장(다음 주기 자동 재실행)"
    elif printf '%s' "$t" | grep -qiE "Invalid authentication|Failed to authenticate|API Error: 401"; then
        echo "인증 실패(401)"
    elif printf '%s' "$t" | grep -qiE "overloaded|529|Too Many Requests|429|rate.?limit"; then
        echo "API 과부하/레이트리밋"
    elif printf '%s' "$t" | grep -qiE "An internal error occurred|EINTR"; then
        echo "claude CLI 내부 오류(행업 후 EINTR 등) — 재시도로 복구 시도됨"
    elif printf '%s' "$t" | grep -qiE "validate:publishing|astro -- check|npm run build"; then
        echo "발행 검증/빌드 실패"
    else
        echo "원인 미상 — 로그 확인 필요"
    fi
}

# Run Claude Code
claude "$@" >> "$LOG_FILE" 2>&1
EXIT_CODE=$?

# 일시적 실패면 1회만 재시도. 인증/과부하 실패는 claude 가 실제 작업 전에 죽으므로
# (2026-06-20 daily-post 401 사례) 재시도해도 중복 발행 위험이 없다. 발행 게이트
# 실패는 claude 가 이미 작업한 경우라 여기서 재시도하지 않는다(아래 게이트에서 처리).
# 2026-07-02: 529 장애 창이 ~20분 지속돼 120초 단일 재시도가 창 안에서 소진되는 사례 확인
# (effloow 동일 시간대 2스텝 연속 실패) → 백오프 재시도(120초 → 600초, 최대 2회)로 확장.
for RETRY_DELAY in 120 600; do
    if [ "$EXIT_CODE" -ne 0 ] && is_transient_failure; then
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] claude 일시적 실패(인증/과부하 추정) 감지 — ${RETRY_DELAY}초 후 재시도" >> "$LOG_FILE"
        tg_send "[jangwook.net] ${TASK_NAME}: 일시적 실패 감지, ${RETRY_DELAY}초 후 재시도"
        sleep "$RETRY_DELAY"
        claude "$@" >> "$LOG_FILE" 2>&1
        EXIT_CODE=$?
    else
        break
    fi
done

# Kill watchdog
kill $WATCHDOG_PID 2>/dev/null || true
wait $WATCHDOG_PID 2>/dev/null || true

# claude 종료 직후 고아 bun 폴러 재점검 (비정상 종료 대비 백스톱)
cleanup_orphan_telegram_bun

if [ "$EXIT_CODE" -eq 0 ] && should_run_publishing_gate; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Publishing validation gate..." >> "$LOG_FILE"
    if ! npm run validate:publishing >> "$LOG_FILE" 2>&1; then
        EXIT_CODE=1
        tg_send "[jangwook.net] 발행 검증 실패
작업: ${TASK_NAME}
상태: npm run validate:publishing 실패
조치: 로그 확인 필요"
    elif [ "${PUBLISHING_BUILD_GATE:-0}" = "1" ]; then
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] Optional Astro check gate..." >> "$LOG_FILE"
        if ! npm run astro -- check >> "$LOG_FILE" 2>&1; then
            EXIT_CODE=1
            tg_send "[jangwook.net] Astro 체크 실패
작업: ${TASK_NAME}
상태: npm run astro -- check 실패
조치: 로그 확인 필요"
        fi

        if [ "$EXIT_CODE" -eq 0 ]; then
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] Optional publishing build gate..." >> "$LOG_FILE"
        if ! npm run build >> "$LOG_FILE" 2>&1; then
            EXIT_CODE=1
            tg_send "[jangwook.net] 발행 빌드 실패
작업: ${TASK_NAME}
상태: npm run build 실패
조치: 로그 확인 필요"
        fi
        fi
    fi
fi

# --- 크로스포스트 결정적 enforcement (2026-06-28) ---
# 배경: daily-post 에이전트 프롬프트/SKILL 에 "crosspost.js 호출"이 있으나 긴 자율 실행
# 끝의 소프트 스텝이라 조용히 누락 → crosspost-log 가 2026-05-21 이후 6주 공백.
# 에이전트 재량에 맡기지 않고 스케줄러가 직접 실행한다.
# 대상: '오늘 새로 추가된'(--diff-filter=A) 영문 글만 → 과거 글 백필(스팸) 방지.
# 안전: crosspost.js 의 dedup 가드가 2차 방어, 본 단계는 완전 비치명적(EXIT_CODE 불변).
if [ "$EXIT_CODE" -eq 0 ] && should_run_publishing_gate; then
    NEW_EN_POSTS=$(git log --since="$(date +%Y-%m-%d)T00:00:00" --diff-filter=A \
        --name-only --pretty=format: -- 'src/content/blog/en/*.md' 2>/dev/null \
        | grep '\.md$' | sort -u)
    if [ -n "$NEW_EN_POSTS" ]; then
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] Crosspost gate: 신규 영문 글 감지" >> "$LOG_FILE"
        while IFS= read -r enfile; do
            [ -z "$enfile" ] && continue
            cpslug=$(basename "$enfile" .md)
            echo "[$(date '+%Y-%m-%d %H:%M:%S')] crosspost: $cpslug (platform=${CROSSPOST_PLATFORMS:-devto})" >> "$LOG_FILE"
            # Hashnode 는 2026-06 정책변경으로 GraphQL API 가 Pro 구독 전용(gql.hashnode.com → 공지 301).
            # 자동화 기본은 작동하는 dev.to 만. Hashnode Pro 업그레이드 후 plist 에 CROSSPOST_PLATFORMS=all 설정.
            node scripts/crosspost.js "$cpslug" --platform="${CROSSPOST_PLATFORMS:-devto}" >> "$LOG_FILE" 2>&1 \
                || echo "[$(date '+%Y-%m-%d %H:%M:%S')] crosspost 비치명 실패: $cpslug (로그/crosspost-log.json 확인)" >> "$LOG_FILE"
        done <<< "$NEW_EN_POSTS"
        # crosspost-log.json 은 data/ 가 .gitignore 라 커밋하지 않음(로컬 상태로 dedup 충분, launchd 동일 머신).
    fi
fi

ELAPSED=$(( $(date +%s) - START_TIME ))
echo "[$(date '+%Y-%m-%d %H:%M:%S')] DONE: $TASK_NAME (exit: $EXIT_CODE, ${ELAPSED}s)" >> "$LOG_FILE"

# claude 자체 실패는 그동안 Telegram 알림이 없어 조용히 묻혔다(2026-06-20 401).
# 최종 종료코드가 0이 아니면 항상 알림을 보내 실패가 가시화되도록 한다.
if [ "$EXIT_CODE" -ne 0 ]; then
    tg_send "[jangwook.net] 작업 실패
작업: ${TASK_NAME}
종료코드: ${EXIT_CODE}
추정 원인: $(failure_cause)
소요: $((ELAPSED / 60))분
조치: ~/.jangwook-net/logs/${TASK_NAME}.log 확인 필요"
fi

exit $EXIT_CODE
