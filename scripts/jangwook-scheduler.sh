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
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] Resetting to origin/main..." >> "$LOG_FILE"
        git fetch origin >> "$LOG_FILE" 2>&1
        git reset --hard origin/main >> "$LOG_FILE" 2>&1
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

# Run Claude Code
claude "$@" >> "$LOG_FILE" 2>&1
EXIT_CODE=$?

# Kill watchdog
kill $WATCHDOG_PID 2>/dev/null || true
wait $WATCHDOG_PID 2>/dev/null || true

ELAPSED=$(( $(date +%s) - START_TIME ))
echo "[$(date '+%Y-%m-%d %H:%M:%S')] DONE: $TASK_NAME (exit: $EXIT_CODE, ${ELAPSED}s)" >> "$LOG_FILE"
exit $EXIT_CODE
