#!/bin/bash
# jangwook-scheduler.sh — launchd wrapper for jangwook.net automation
# Usage: jangwook-scheduler.sh <task-name> <agent-args...>
#
# Engines by task (2026-08-15):
#   daily-post  → scripts/daily-post-pipeline.sh
#                 판단(주제 선정·플랜·검수·발행) claude opus
#                 집필(ko/ja/en/zh 본문)        agy gemini-3.7-flash-medium
#   그 외        → grok 단일 프로세스. Claude-style flags
#                 (--dangerously-skip-permissions, --model opus) 를
#                 grok (--yolo, --model grok-4.6) 로 매핑한다.

set -uo pipefail

# PATH setup (launchd doesn't inherit shell PATH)
# Must include: grok CLI, nvm node (validate/build), homebrew, system
export PATH="/Users/jangwook/.grok/bin:/Users/jangwook/.nvm/versions/node/v22.22.0/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
export HOME="/Users/jangwook"

GROK_BIN="${GROK_BIN:-/Users/jangwook/.grok/bin/grok}"
GROK_MODEL="${GROK_MODEL:-grok-4.6}"
GROK_PREFLIGHT_MODEL="${GROK_PREFLIGHT_MODEL:-grok-4.6}"

# Project directory
PROJECT_DIR="/Users/jangwook/workspace/www.jangwook.net"
cd "$PROJECT_DIR"

# Load environment variables (API keys, Telegram credentials)
if [ -f "$PROJECT_DIR/.env" ]; then
    set -a
    source "$PROJECT_DIR/.env"
    set +a
fi

# 인증은 구독 OAuth 뿐. 부모 셸이나 .env 에서 올라온 API 키가 있으면 claude 가
# "Invalid API key" 로 즉사한다 (2026-08-25 seal-check). 여기서 벗겨 낸다.
unset ANTHROPIC_API_KEY ANTHROPIC_AUTH_TOKEN

# Claude Telegram 플러그인 MCP(bun server.ts) 차단 (2026-07-21).
# 헤드리스 run 은 인바운드 텔레그램이 불필요(알림은 TG_BOT_TOKEN+curl 경로)한데,
# 같은 머신의 다른 claude 잡이 남긴 고아 bun 폴러가 CPU 를 점유할 수 있다.
# 빈 값이면 플러그인이 토큰 검사에서 즉시 exit(1) 해 폴러 자체가 뜨지 않는다.
export TELEGRAM_BOT_TOKEN=""

# 이전 세션이 남긴 고아 bun 폴러 정리. 플러그인(0.0.6) 자체 워치독은 ppid 변화만
# 검사하는데, server.ts 의 부모는 bun run 래퍼라 에이전트가 죽어도
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

map_claude_model() {
    case "$1" in
        opus|opus-*|sonnet|sonnet-*|claude*)
            printf '%s' "$GROK_MODEL"
            ;;
        haiku|haiku-*)
            printf '%s' "$GROK_PREFLIGHT_MODEL"
            ;;
        *)
            printf '%s' "$1"
            ;;
    esac
}

# Translate Claude-style flags and always inject launchd-safe grok flags.
# Result is stored in GROK_ARGS. Avoids bash-4 array slices (macOS /bin/bash is 3.2).
build_grok_args() {
    local mapped=()
    local saw_model=0
    while [ $# -gt 0 ]; do
        case "$1" in
            --dangerously-skip-permissions|--always-approve|--yolo|--no-auto-update)
                shift
                ;;
            --chrome)
                shift
                ;;
            --model)
                shift
                if [ $# -eq 0 ]; then
                    echo "build_grok_args: --model requires a value" >&2
                    return 1
                fi
                saw_model=1
                mapped+=(--model "$(map_claude_model "$1")")
                shift
                ;;
            *)
                mapped+=("$1")
                shift
                ;;
        esac
    done
    if [ "$saw_model" -eq 0 ]; then
        GROK_ARGS=(--yolo --no-auto-update --model "$GROK_MODEL")
    else
        GROK_ARGS=(--yolo --no-auto-update)
    fi
    if [ "${#mapped[@]}" -gt 0 ]; then
        GROK_ARGS+=("${mapped[@]}")
    fi
}

summarize_grok_args() {
    local out=() a next_is_prompt=0
    for a in "${GROK_ARGS[@]}"; do
        if [ "$next_is_prompt" -eq 1 ]; then
            out+=("<prompt>")
            next_is_prompt=0
            continue
        fi
        case "$a" in
            -p|--single|--prompt-file|--prompt-json)
                out+=("$a")
                next_is_prompt=1
                ;;
            *)
                out+=("$a")
                ;;
        esac
    done
    printf '%s' "${out[*]}"
}

# Task name
TASK_NAME="${1:?Usage: jangwook-scheduler.sh <task-name> <agent-args...>}"
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

echo "" | tee -a "$LOG_FILE"
echo "========================================" | tee -a "$LOG_FILE"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] START: $TASK_NAME" | tee -a "$LOG_FILE"
echo "========================================" | tee -a "$LOG_FILE"

# daily-post 만 엔진이 다르다: 판단은 claude, 집필은 native sdk (sonnet 편집부).
# 나머지 작업(daily-closing, sunday-strategy 등)은 그대로 grok 단일 프로세스.
if [ "$TASK_NAME" = "daily-post" ]; then
    TASK_ENGINE="pipeline"
else
    TASK_ENGINE="grok"
fi

if [ "$TASK_ENGINE" = "grok" ]; then
    if [ ! -x "$GROK_BIN" ]; then
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] FATAL: grok not executable: $GROK_BIN" | tee -a "$LOG_FILE"
        tg_send "[jangwook.net] ${TASK_NAME}: grok 바이너리 없음
경로: ${GROK_BIN}
조치: ~/.grok/bin/grok 설치 확인"
        exit 1
    fi

    build_grok_args "$@" || exit 1
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] AGENT: $GROK_BIN $(summarize_grok_args)" | tee -a "$LOG_FILE"
else
    # plist 가 넘긴 grok 플래그는 파이프라인에서 쓰지 않는다. 로그에만 남긴다.
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] AGENT: daily-post-pipeline (claude=plan / sdk=write), ignored args: $*" | tee -a "$LOG_FILE"
fi

# ── grok 헤드리스 새니티 프리플라이트 ──
# 인증·바이너리·네트워크가 죽으면 워치독이 1시간을 낭비하고 작업은 0 진척으로 끝난다.
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

grok_preflight() {
    local tmp rc
    tmp="$(mktemp -t grok-preflight 2>/dev/null || echo /tmp/grok-preflight.$$)"
    run_timeout 60 "$GROK_BIN" -p 'Reply with exactly: OK' --yolo --no-auto-update \
        --model "$GROK_PREFLIGHT_MODEL" </dev/null >"$tmp" 2>&1
    rc=$?
    if [ "$rc" -eq 0 ] && grep -qi 'OK' "$tmp"; then
        rm -f "$tmp"; return 0
    fi
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] PREFLIGHT: grok 무응답(rc=${rc}): $(tr '\n' ' ' < "$tmp" 2>/dev/null | tail -c 300)" | tee -a "$LOG_FILE"
    rm -f "$tmp"; return 1
}

CLAUDE_BIN="${CLAUDE_BIN:-/opt/homebrew/bin/claude}"

# claude 프리플라이트. 시작 전에 claude 엔진이 정상 응답하는지 확인한다.
claude_preflight() {
    local tmp rc
    tmp="$(mktemp -t claude-preflight 2>/dev/null || echo /tmp/claude-preflight.$$)"
    # 2026-08-21: claude CLI → SDK 러너 (LLM 은 CLI 로 부르지 않는다)
    run_timeout 90 node "${CLAUDE_SDK:-/Users/jangwook/workspace/life-manager/src/cli/claude-sdk-llm.ts}" --model sonnet --max-turns 1 \
        'Reply with exactly: OK' </dev/null >"$tmp" 2>&1
    rc=$?
    if [ "$rc" -eq 0 ] && grep -qi 'OK' "$tmp"; then
        rm -f "$tmp"; return 0
    fi
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] PREFLIGHT: claude 무응답(rc=${rc}): $(tr '\n' ' ' < "$tmp" 2>/dev/null | tail -c 300)" | tee -a "$LOG_FILE"
    rm -f "$tmp"; return 1
}

if [ "$TASK_ENGINE" = "grok" ]; then
    if ! grok_preflight; then
        tg_send "[jangwook.net] ${TASK_NAME}: grok 헤드리스 무응답(60초 프리플라이트 실패)
원인 후보: ~/.grok/auth.json 만료 / XAI_API_KEY 미설정 / 네트워크.
조치: 이번 주기 건너뜀(다음 주기 자동 재시도). 반복 시 터미널에서 grok login,
또는 .env 에 XAI_API_KEY 를 넣는다."
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] PREFLIGHT ABORT: grok 무응답 — 작업 스킵" | tee -a "$LOG_FILE"
        exit 1
    fi
else
    if [ ! -f "${CLAUDE_SDK:-/Users/jangwook/workspace/life-manager/src/cli/claude-sdk-llm.ts}" ]; then
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] FATAL: claude($CLAUDE_BIN) 없음" | tee -a "$LOG_FILE"
        tg_send "[jangwook.net] ${TASK_NAME}: claude 바이너리 없음
경로: ${CLAUDE_BIN}"
        exit 1
    fi
    if ! claude_preflight; then
        tg_send "[jangwook.net] ${TASK_NAME}: claude 헤드리스 무응답(90초 프리플라이트 실패)
원인 후보: 로그인 만료 / 사용량 한도 / 네트워크.
조치: 이번 주기 건너뜀(다음 주기 자동 재시도)."
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] PREFLIGHT ABORT: claude 무응답 — 작업 스킵" | tee -a "$LOG_FILE"
        exit 1
    fi
fi

# Sync with remote before running
if ! git pull --rebase origin main >> "$LOG_FILE" 2>&1; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] git pull --rebase failed, attempting recovery..." | tee -a "$LOG_FILE"

    git rebase --abort >> "$LOG_FILE" 2>&1 || true
    git stash >> "$LOG_FILE" 2>&1 || true
    if ! git pull --rebase origin main >> "$LOG_FILE" 2>&1; then
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] Remote sync failed; refusing destructive reset." | tee -a "$LOG_FILE"
        tg_send "[jangwook.net] 원격 동기화 실패
작업: ${TASK_NAME}
상태: git pull --rebase 실패
조치: 수동 확인 필요"
        exit 1
    fi
    git stash pop >> "$LOG_FILE" 2>&1 || true

    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Sync recovered" | tee -a "$LOG_FILE"
fi

# daily-post runs 6+ isolated agent processes (claude core/seal, codex ×4).
# Give it a longer hang alert.
WATCHDOG_SECS=3600
if [ "$TASK_NAME" = "daily-post" ]; then
    WATCHDOG_SECS=10800
fi

# --- Watchdog: alert if grok hangs ---
(
    sleep "$WATCHDOG_SECS"
    ELAPSED=$(( $(date +%s) - START_TIME ))
    if [ "$ELAPSED" -ge "$WATCHDOG_SECS" ]; then
        tg_send "[jangwook.net] 스케줄 지연 경고
작업: ${TASK_NAME}
경과: $((ELAPSED / 60))분 이상
상태: ${TASK_ENGINE} 에이전트가 $((WATCHDOG_SECS / 60))분 넘게 실행 중
조치: 프로세스 점검 필요"
    fi
) &
WATCHDOG_PID=$!

# 일시적 실패(인증/과부하/네트워크) 감지 — 이 run 의 로그 꼬리에서만 확인.
# 빌드 진행 카운터 "(401/798)" 같은 오탐을 피하려 정밀 패턴 사용.
is_transient_failure() {
    # 셸이 깨진 것은 일시적 실패가 아니다. 재시도해도 같은 자리에서 죽고,
    # 그 사이 앞단(집필·윤문)을 통째로 다시 돌려 이미 나온 원고를 버린다.
    # 2026-08-25: 파이프라인이 실행 중 편집돼 무너졌는데, 로그 꼬리에 남아 있던
    # gemini 503 문구가 이 판정을 통과시켜 50분치 작업이 브리프부터 재시작됐다.
    if tail -n 120 "$LOG_FILE" | grep -qE 'daily-post-pipeline[^:]*\.sh: line [0-9]+:|syntax error near unexpected token'; then
        return 1
    fi
    tail -n 120 "$LOG_FILE" | grep -qiE 'Invalid authentication|Failed to authenticate|Authentication failed|API Error: (401|429|500|503|529)|overloaded_error|Too Many Requests|ETIMEDOUT|ECONNRESET|rate.?limit|An internal error occurred|EINTR'
}

# 실패 원인을 사람이 읽을 라벨로 추정(알림 가시성). 세션 한도는 120초 재시도가
# 무의미(고정 시각 리셋)하므로 transient 에 넣지 않고 여기서 명시만 한다.
failure_cause() {
    local t; t="$(tail -n 120 "$LOG_FILE")"
    if printf '%s' "$t" | grep -qiE "session limit|usage limit|hit your (session|usage)"; then
        echo "에이전트 세션/사용량 한도 도달 — 다음 주기 자동 재실행"
    elif printf '%s' "$t" | grep -qiE "Invalid authentication|Failed to authenticate|Authentication failed|API Error: 401"; then
        echo "인증 실패(401) — ${TASK_ENGINE} 엔진 로그인 확인 (grok login / codex login / claude)"
    elif printf '%s' "$t" | grep -qiE "overloaded|529|Too Many Requests|429|rate.?limit"; then
        echo "API 과부하/레이트리밋"
    elif printf '%s' "$t" | grep -qiE "An internal error occurred|EINTR"; then
        echo "CLI 내부 오류(행업 후 EINTR 등) — 재시도로 복구 시도됨"
    elif printf '%s' "$t" | grep -qiE "validate:publishing|astro -- check|npm run build"; then
        echo "발행 검증/빌드 실패"
    else
        echo "원인 미상 — 로그 확인 필요"
    fi
}

run_agent() {
    if [ "$TASK_ENGINE" = "pipeline" ]; then
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] AGENT: daily-post-pipeline (claude core/seal + native sdk sonnet ko/ja/en/zh)" | tee -a "$LOG_FILE"
        # ★ 스냅샷 사본으로 돈다. bash 는 스크립트를 바이트 오프셋으로 이어 읽어서,
        #   실행 중에 원본 길이가 바뀌면 그 지점부터 잘린 토큰을 읽는다.
        #   2026-08-25 에 두 번 죽었다 — 다른 세션이 파이프라인을 커밋하는 사이
        #   2시간 30분짜리 실행이 `line 935: hen: command not found` /
        #   `line 938: syntax error near unexpected token 'fi'` 로 무너졌고,
        #   원고 4편은 발행 직전에 버려졌다. 파일 자체는 bash -n 을 통과한다 —
        #   즉 코드에는 증거가 남지 않는다.
        local snapshot
        # macOS mktemp 는 X 가 템플릿 **끝**에 있어야 치환한다. 확장자를 붙이면
        # 그대로 고정 경로가 돼 동시 실행이 서로의 사본을 덮어쓴다. -t 를 쓴다.
        snapshot="$(mktemp -t daily-post-pipeline)"
        cp "$PROJECT_DIR/scripts/daily-post-pipeline.sh" "$snapshot"
        bash "$snapshot"
        local rc=$?
        rm -f "$snapshot"
        return $rc
    else
        "$GROK_BIN" "${GROK_ARGS[@]}"
    fi
}

# Run Grok Build (headless). daily-post uses one process per language.
run_agent >> "$LOG_FILE" 2>&1
EXIT_CODE=$?

# 일시적 실패면 백오프 재시도(120초 → 600초, 최대 2회).
# 인증/과부하 실패는 실제 작업 전에 죽으므로 재시도해도 중복 발행 위험이 없다.
# 발행 게이트 실패는 이미 작업한 경우라 여기서 재시도하지 않는다.
for RETRY_DELAY in 120 600; do
    if [ "$EXIT_CODE" -ne 0 ] && is_transient_failure; then
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] grok 일시적 실패(인증/과부하 추정) 감지 — ${RETRY_DELAY}초 후 재시도" | tee -a "$LOG_FILE"
        tg_send "[jangwook.net] ${TASK_NAME}: 일시적 실패 감지, ${RETRY_DELAY}초 후 재시도"
        sleep "$RETRY_DELAY"
        run_agent >> "$LOG_FILE" 2>&1
        EXIT_CODE=$?
    else
        break
    fi
done

# Kill watchdog
kill $WATCHDOG_PID 2>/dev/null || true
wait $WATCHDOG_PID 2>/dev/null || true

# 종료 직후 고아 bun 폴러 재점검 (같은 머신의 claude 잡 대비 백스톱)
cleanup_orphan_telegram_bun

if [ "$EXIT_CODE" -eq 0 ] && should_run_publishing_gate; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Publishing validation gate..." | tee -a "$LOG_FILE"
    if ! npm run validate:publishing >> "$LOG_FILE" 2>&1; then
        EXIT_CODE=1
        tg_send "[jangwook.net] 발행 검증 실패
작업: ${TASK_NAME}
상태: npm run validate:publishing 실패
조치: 로그 확인 필요"
    elif [ "${PUBLISHING_BUILD_GATE:-0}" = "1" ]; then
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] Optional Astro check gate..." | tee -a "$LOG_FILE"
        if ! npm run astro -- check >> "$LOG_FILE" 2>&1; then
            EXIT_CODE=1
            tg_send "[jangwook.net] Astro 체크 실패
작업: ${TASK_NAME}
상태: npm run astro -- check 실패
조치: 로그 확인 필요"
        fi

        if [ "$EXIT_CODE" -eq 0 ]; then
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] Optional publishing build gate..." | tee -a "$LOG_FILE"
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
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] Crosspost gate: 신규 영문 글 감지" | tee -a "$LOG_FILE"
        while IFS= read -r enfile; do
            [ -z "$enfile" ] && continue
            cpslug=$(basename "$enfile" .md)
            echo "[$(date '+%Y-%m-%d %H:%M:%S')] crosspost: $cpslug (platform=${CROSSPOST_PLATFORMS:-devto})" | tee -a "$LOG_FILE"
            # Hashnode 는 2026-06 정책변경으로 GraphQL API 가 Pro 구독 전용(gql.hashnode.com → 공지 301).
            # 자동화 기본은 작동하는 dev.to 만. Hashnode Pro 업그레이드 후 plist 에 CROSSPOST_PLATFORMS=all 설정.
            node scripts/crosspost.js "$cpslug" --platform="${CROSSPOST_PLATFORMS:-devto}" >> "$LOG_FILE" 2>&1 \
                || echo "[$(date '+%Y-%m-%d %H:%M:%S')] crosspost 비치명 실패: $cpslug (로그/crosspost-log.json 확인)" >> "$LOG_FILE"
        done <<< "$NEW_EN_POSTS"
        # crosspost-log.json 은 data/ 가 .gitignore 라 커밋하지 않음(로컬 상태로 dedup 충분, launchd 동일 머신).
    fi
fi

ELAPSED=$(( $(date +%s) - START_TIME ))
echo "[$(date '+%Y-%m-%d %H:%M:%S')] DONE: $TASK_NAME (exit: $EXIT_CODE, ${ELAPSED}s)" | tee -a "$LOG_FILE"

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
