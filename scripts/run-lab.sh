#!/bin/bash
# run-lab.sh — 하루 한 번, 깊은 실험 하나를 돌려 data/labs/ 에 데이터셋을 남긴다.
#
# 역할 분담이 이 스크립트의 요점이다.
#   claude  지시와 판단. 질문을 고르고, 행렬을 설계하고, 끝나고 해석한다.
#   agy     손발. 설계된 셀을 하나씩 실제로 돌리고 원시 출력을 남긴다.
# 실행이 손이 많이 가는 일이라 값싸고 빠른 쪽에 맡기고, 무엇을 왜 재는지는
# 비싼 쪽이 정한다. 셀 하나가 실패해도 나머지는 계속 돈다.
#
# 발행과 분리된 잡이라 마감이 없다. 발행 파이프라인(월·수·금)이
# data/labs/index.json 에서 consumed=false 인 것 중 하나를 골라 쓴다.
set -uo pipefail

PROJECT_DIR="${PROJECT_DIR:-/Users/jangwook/workspace/www.jangwook.net}"
CONTROLLER_DIR="${CONTROLLER_DIR:-/Users/jangwook/workspace/claude-controller}"
PROMPT_DIR="$PROJECT_DIR/scripts/prompts"
LABS_DIR="$PROJECT_DIR/data/labs"

CLAUDE_BIN="${CLAUDE_BIN:-/opt/homebrew/bin/claude}"
CLAUDE_MODEL="${LAB_MODEL:-opus}"
CLAUDE_EFFORT="${LAB_EFFORT:-xhigh}"
AGY_BIN="${AGY_BIN:-/Users/jangwook/.local/bin/agy}"
AGY_MODEL="${LAB_AGY_MODEL:-gemini-3.7-flash-medium}"

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

for b in "$CLAUDE_BIN" "$AGY_BIN"; do
  [ -x "$b" ] || { log "FATAL: 실행 파일 없음 $b"; exit 1; }
done
[ -f "$LABS_DIR/index.json" ] || echo "[]" > "$LABS_DIR/index.json"

notify() { "$CONTROLLER_DIR/sh/send-telegram.sh" "$1" >/dev/null 2>&1 || true; }

ready_count() {
  /usr/bin/python3 - "$LABS_DIR/index.json" <<'PY' 2>/dev/null || echo "?"
import json, sys
try:
    rows = json.load(open(sys.argv[1]))
except Exception:
    rows = []
print(sum(1 for r in rows if r.get("status") == "complete" and not r.get("consumed")))
PY
}

# ── 1. plan (claude): 질문 선정과 행렬 설계 ────────────────────────────
LAB_ID="${LAB_ID:-$(date +%Y-%m-%d)-$$}"
LAB_DIR="$LABS_DIR/$LAB_ID"
RAW_DIR="$LAB_DIR/raw"
RESULTS_JSONL="$LAB_DIR/results.jsonl"
mkdir -p "$RAW_DIR"
: > "$RESULTS_JSONL"

log "phase plan (claude/$CLAUDE_MODEL effort=$CLAUDE_EFFORT) → $LAB_ID"
PLAN_PROMPT="$(sed -e "s#{{LAB_DIR}}#$LAB_DIR#g" -e "s#{{LAB_ID}}#$LAB_ID#g" "$PROMPT_DIR/lab-plan.md")"
"$CLAUDE_BIN" -p "$PLAN_PROMPT" \
  --dangerously-skip-permissions --model "$CLAUDE_MODEL" --effort "$CLAUDE_EFFORT" \
  --add-dir "$CONTROLLER_DIR" </dev/null >>"$LOG_FILE" 2>&1
PLAN_RC=$?

if [ "$PLAN_RC" -ne 0 ] || [ ! -s "$LAB_DIR/plan.json" ]; then
  log "설계 실패 rc=$PLAN_RC — plan.json 없음"
  notify "🧪 [jangwook.net] 랩 설계 실패 (rc=${PLAN_RC})
발행 대기 재고: $(ready_count)개
로그: ~/.jangwook-net/logs/lab.log"
  rm -rf "$LAB_DIR"
  exit 1
fi

CELL_COUNT=$(/usr/bin/python3 -c "
import json;print(len(json.load(open('$LAB_DIR/plan.json')).get('cells',[])))" 2>/dev/null || echo 0)
log "설계 완료 — ${CELL_COUNT}셀"
if [ "$CELL_COUNT" -lt 1 ]; then
  log "셀이 없다 — 중단"; rm -rf "$LAB_DIR"; exit 1
fi

# ── 2. execute (agy): 셀을 하나씩 실제로 돌린다 ────────────────────────
# 셀 하나가 죽어도 나머지는 계속 간다. 실패한 셀도 데이터다.
FAILED=0
for i in $(seq 0 $((CELL_COUNT - 1))); do
  CELL_JSON=$(/usr/bin/python3 -c "
import json;print(json.dumps(json.load(open('$LAB_DIR/plan.json'))['cells'][$i], ensure_ascii=False))")
  CELL_ID=$(/usr/bin/python3 -c "
import json,sys;print(json.loads(sys.argv[1]).get('id','cell-$i'))" "$CELL_JSON")
  CELL_DIR="$(mktemp -d "${TMPDIR:-/tmp}/jangwook-lab-cell.XXXXXX")"

  log "phase execute cell=$CELL_ID ($((i + 1))/$CELL_COUNT, agy/$AGY_MODEL)"
  EXEC_PROMPT="$(sed -e "s#{{CELL_DIR}}#$CELL_DIR#g" \
                     -e "s#{{RAW_DIR}}#$RAW_DIR#g" \
                     -e "s#{{CELL_ID}}#$CELL_ID#g" \
                     -e "s#{{RESULTS_JSONL}}#$RESULTS_JSONL#g" \
                     "$PROMPT_DIR/lab-execute.md")"
  # 셀 JSON 은 sed 로 넣으면 특수문자에서 깨진다. 프롬프트 끝에 붙인다.
  EXEC_PROMPT="${EXEC_PROMPT/\{\{CELL_JSON\}\}/$CELL_JSON}"

  ( cd "$CELL_DIR" && "$AGY_BIN" --print "$EXEC_PROMPT" \
      --model "$AGY_MODEL" --dangerously-skip-permissions \
      --print-timeout 25m </dev/null ) >>"$LOG_FILE" 2>&1
  RC=$?
  [ "$RC" -ne 0 ] && { FAILED=$((FAILED + 1)); log "cell=$CELL_ID rc=$RC"; }
  rm -rf "$CELL_DIR"
done

RECORDED=$(wc -l < "$RESULTS_JSONL" | tr -d ' ')
log "실행 완료 — 기록된 셀 ${RECORDED}/${CELL_COUNT}, 실패 ${FAILED}"

if [ "$RECORDED" -lt 1 ]; then
  log "기록된 셀이 없다 — 분석 생략"
  notify "🧪 [jangwook.net] 랩 실행 전멸
${LAB_ID} — ${CELL_COUNT}셀 중 0셀 기록
발행 대기 재고: $(ready_count)개"
  exit 1
fi

# ── 3. analyze (claude): 해석과 데이터셋 확정 ──────────────────────────
log "phase analyze (claude/$CLAUDE_MODEL effort=$CLAUDE_EFFORT)"
ANALYZE_PROMPT="$(sed -e "s#{{LAB_DIR}}#$LAB_DIR#g" -e "s#{{LAB_ID}}#$LAB_ID#g" "$PROMPT_DIR/lab-analyze.md")"
"$CLAUDE_BIN" -p "$ANALYZE_PROMPT" \
  --dangerously-skip-permissions --model "$CLAUDE_MODEL" --effort "$CLAUDE_EFFORT" \
  --add-dir "$CONTROLLER_DIR" </dev/null >>"$LOG_FILE" 2>&1
ANALYZE_RC=$?

if [ "$ANALYZE_RC" -ne 0 ] || [ ! -s "$LAB_DIR/lab.json" ]; then
  log "분석 실패 rc=$ANALYZE_RC — 원시 데이터는 $LAB_DIR 에 남긴다"
  notify "🧪 [jangwook.net] 랩 분석 실패 (rc=${ANALYZE_RC})
${LAB_ID} — 원시 데이터는 남아 있다
발행 대기 재고: $(ready_count)개"
  exit 1
fi

HEADLINE=$(/usr/bin/python3 -c "
import json
d=json.load(open('$LAB_DIR/lab.json'))
print(f\"{d.get('status','?')} · {d.get('cells','?')}셀 {d.get('runs','?')}런 · surprised={d.get('surprised')}\n{d.get('headline','')}\")" 2>/dev/null)

log "완료 $LAB_ID"
notify "🧪 [jangwook.net] 실험 완료
${LAB_ID}
${HEADLINE}
발행 대기 재고: $(ready_count)개"
exit 0
