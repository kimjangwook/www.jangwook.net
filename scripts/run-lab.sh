#!/bin/bash
# run-lab.sh — 하루 한 번, 깊은 실험 하나를 돌려 data/labs/ 에 데이터셋을 남긴다.
#
# 발행과 분리된 잡이다. 여기에는 마감이 없다. 발행 파이프라인이 단일 실행 안에서
# 끝내야 해서 걸려 있던 깊이 상한(25셀 → 9셀 같은 축소)이 이 잡에는 없다.
# 대신 이 잡은 글을 쓰지 않고 커밋하지 않는다. 데이터만 쌓는다.
#
# 발행 파이프라인(주 3회)이 data/labs/index.json 에서 consumed=false 인 것 중
# 논지가 가장 센 것을 골라 쓴다.
set -uo pipefail

PROJECT_DIR="${PROJECT_DIR:-/Users/jangwook/workspace/www.jangwook.net}"
CONTROLLER_DIR="${CONTROLLER_DIR:-/Users/jangwook/workspace/claude-controller}"
PROMPT_DIR="$PROJECT_DIR/scripts/prompts"
LABS_DIR="$PROJECT_DIR/data/labs"

CLAUDE_BIN="${CLAUDE_BIN:-/opt/homebrew/bin/claude}"
CLAUDE_MODEL="${LAB_MODEL:-opus}"
CLAUDE_EFFORT="${LAB_EFFORT:-xhigh}"

export HOME="${HOME:-/Users/jangwook}"
export PATH="/Users/jangwook/.nvm/versions/node/v22.22.0/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
export TELEGRAM_BOT_TOKEN=""
cd "$PROJECT_DIR" || exit 1

LOG_DIR="$HOME/.jangwook-net/logs"
mkdir -p "$LOG_DIR" "$LABS_DIR"
LOG_FILE="$LOG_DIR/lab.log"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] lab: $*" | tee -a "$LOG_FILE" >&2; }

# 랩끼리만 배타. 발행 파이프라인과는 겹쳐도 된다. 랩은 data/labs 아래만 쓰고
# git 을 만지지 않으므로 fact-core 계열 상태를 공유하지 않는다.
LOCK_DIR="$LABS_DIR/.lab.lock"
if ! mkdir "$LOCK_DIR" 2>/dev/null; then
  OTHER="$(cat "$LOCK_DIR/pid" 2>/dev/null || echo '?')"
  if [ "$OTHER" != "?" ] && kill -0 "$OTHER" 2>/dev/null; then
    log "다른 랩이 실행 중이다 (pid=$OTHER) — 오늘은 건너뛴다"
    exit 0
  fi
  rm -rf "$LOCK_DIR"; mkdir "$LOCK_DIR" || { log "FATAL: 잠금 회수 실패"; exit 1; }
fi
echo "$$" > "$LOCK_DIR/pid"
trap 'rm -rf "$LOCK_DIR"' EXIT INT TERM

if [ ! -x "$CLAUDE_BIN" ]; then
  log "FATAL: claude 없음 $CLAUDE_BIN"
  exit 1
fi

[ -f "$LABS_DIR/index.json" ] || echo "[]" > "$LABS_DIR/index.json"

BEFORE=$(ls -1d "$LABS_DIR"/*/ 2>/dev/null | wc -l | tr -d ' ')
log "시작 (기존 데이터셋 ${BEFORE}개, model=$CLAUDE_MODEL effort=$CLAUDE_EFFORT)"

PROMPT="$(cat "$PROMPT_DIR/lab-experiment.md")"
"$CLAUDE_BIN" -p "$PROMPT" \
  --dangerously-skip-permissions \
  --model "$CLAUDE_MODEL" \
  --effort "$CLAUDE_EFFORT" \
  --add-dir "$CONTROLLER_DIR" \
  </dev/null >>"$LOG_FILE" 2>&1
RC=$?

AFTER=$(ls -1d "$LABS_DIR"/*/ 2>/dev/null | wc -l | tr -d ' ')
NEW=$(( AFTER - BEFORE ))
log "종료 rc=$RC, 새 데이터셋 ${NEW}개"

# 미소비 데이터셋 재고를 보고한다. 이 재고가 0이면 다음 발행일에 SKIP 이 난다.
READY=$(/usr/bin/python3 - "$LABS_DIR/index.json" <<'PY' 2>/dev/null || echo "?"
import json, sys
try:
    rows = json.load(open(sys.argv[1]))
except Exception:
    rows = []
print(sum(1 for r in rows if r.get("status") == "complete" and not r.get("consumed")))
PY
)

if [ "$RC" -ne 0 ] || [ "$NEW" -lt 1 ]; then
  "$CONTROLLER_DIR/sh/send-telegram.sh" "🧪 [jangwook.net] 실험 랩 이상
종료코드 ${RC}, 새 데이터셋 ${NEW}개
발행 대기 재고: ${READY}개
로그: ~/.jangwook-net/logs/lab.log" >/dev/null 2>&1 || true
  exit "$RC"
fi

LATEST=$(ls -1td "$LABS_DIR"/*/ 2>/dev/null | head -1)
HEADLINE=$(/usr/bin/python3 -c "
import json,sys
try: print(json.load(open('$LATEST/lab.json')).get('headline',''))
except Exception: print('')
" 2>/dev/null)

"$CONTROLLER_DIR/sh/send-telegram.sh" "🧪 [jangwook.net] 실험 완료
$(basename "$LATEST")
${HEADLINE}
발행 대기 재고: ${READY}개" >/dev/null 2>&1 || true

exit 0
