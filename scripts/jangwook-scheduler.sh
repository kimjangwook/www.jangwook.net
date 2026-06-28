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
is_transient_failure() {
    tail -n 120 "$LOG_FILE" | grep -qiE 'Invalid authentication|Failed to authenticate|API Error: (401|429|500|503|529)|overloaded_error|Too Many Requests|ETIMEDOUT|ECONNRESET|rate.?limit'
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
if [ "$EXIT_CODE" -ne 0 ] && is_transient_failure; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] claude 일시적 실패(인증/과부하 추정) 감지 — 120초 후 1회 재시도" >> "$LOG_FILE"
    tg_send "[jangwook.net] ${TASK_NAME}: 일시적 실패 감지, 120초 후 1회 재시도"
    sleep 120
    claude "$@" >> "$LOG_FILE" 2>&1
    EXIT_CODE=$?
fi

# Kill watchdog
kill $WATCHDOG_PID 2>/dev/null || true
wait $WATCHDOG_PID 2>/dev/null || true

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
            echo "[$(date '+%Y-%m-%d %H:%M:%S')] crosspost: $cpslug" >> "$LOG_FILE"
            node scripts/crosspost.js "$cpslug" >> "$LOG_FILE" 2>&1 \
                || echo "[$(date '+%Y-%m-%d %H:%M:%S')] crosspost 비치명 실패: $cpslug (로그/crosspost-log.json 확인)" >> "$LOG_FILE"
        done <<< "$NEW_EN_POSTS"
        # 크로스포스트 후 로그(data/crosspost-log.json) 변경분만 커밋 (있을 때만)
        if ! git diff --quiet -- data/crosspost-log.json 2>/dev/null; then
            git add data/crosspost-log.json 2>/dev/null || true
            git commit -m "chore(crosspost): log cross-post results" >> "$LOG_FILE" 2>&1 || true
            git push origin main >> "$LOG_FILE" 2>&1 || true
        fi
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
