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
# 실행 단계 총량 캡. 셀당 타임아웃만 있으면 17셀 × 25분 = 7시간이 된다.
# 랩에 마감은 없지만 상한은 있어야 한다. 캡에 걸리면 남은 셀을 건너뛰고
# 거기까지의 데이터로 분석한다 — 분석이 status 를 partial 로 적는다.
LAB_EXEC_BUDGET_SEC="${LAB_EXEC_BUDGET_SEC:-9000}"   # 2시간 30분
LAB_CELL_TIMEOUT_SEC="${LAB_CELL_TIMEOUT_SEC:-180}"  # 런 하나의 상한

export HOME="${HOME:-/Users/jangwook}"
export PATH="/Users/jangwook/.nvm/versions/node/v22.22.0/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
export TELEGRAM_BOT_TOKEN=""
cd "$PROJECT_DIR" || exit 1

LOG_DIR="$HOME/.jangwook-net/logs"
mkdir -p "$LOG_DIR" "$LABS_DIR"
LOG_FILE="$LOG_DIR/lab.log"
log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] lab: $*" | tee -a "$LOG_FILE" >&2; }

# 랩끼리만 배타. 발행 파이프라인과는 겹쳐도 된다. 랩은 data/labs 아래만 쓰고
# git 을 만지지 않으므로 column-brief 계열 상태를 공유하지 않는다.
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

# ── 2. execute: bash 가 돌리고 agy 가 판정한다 ─────────────────────────
# 명령 실행을 에이전트에게 맡겼더니 codex 가 agy 안에서
# "failed to load configuration" 으로 죽었다(2026-08-16). 같은 명령을 bash 에서
# 돌리면 멀쩡하다. 중첩 에이전트는 환경을 온전히 물려주지 않는다.
# 그래서 실행은 결정적인 bash 가 하고, agy 는 원시 출력을 읽어 observe 기준으로
# hit/miss 를 판정한다. 손발은 그대로 agy 다. 다만 손이 잡는 것이 셸이 아니라 판정이다.
run_with_timeout() {
  local secs="$1"; shift
  "$@" & local pid=$!
  ( sleep "$secs"; kill -TERM "$pid" 2>/dev/null ) & local killer=$!
  wait "$pid" 2>/dev/null; local rc=$?
  kill -TERM "$killer" 2>/dev/null; wait "$killer" 2>/dev/null
  [ "$rc" -eq 143 ] && rc=124
  return $rc
}

CELL_FIELDS_PY='import json,shlex,sys; c=json.loads(sys.argv[1]); print("\n".join(f"CELL_{k.upper()}={shlex.quote(str(c.get(k) or d))}" for k,d in (("id","cell"),("setup",""),("command",""),("observe",""),("repeats","3"))))'

FAILED=0
SKIPPED=0
EXEC_START=$(date +%s)
for i in $(seq 0 $((CELL_COUNT - 1))); do
  ELAPSED=$(( $(date +%s) - EXEC_START ))
  if [ "$ELAPSED" -ge "$LAB_EXEC_BUDGET_SEC" ]; then
    SKIPPED=$((CELL_COUNT - i))
    log "실행 예산 소진 (${ELAPSED}s ≥ ${LAB_EXEC_BUDGET_SEC}s) — 남은 ${SKIPPED}셀 건너뜀"
    break
  fi

  CELL_JSON=$(/usr/bin/python3 -c "import json;print(json.dumps(json.load(open('$LAB_DIR/plan.json'))['cells'][$i], ensure_ascii=False))")
  eval "$(/usr/bin/python3 -c "$CELL_FIELDS_PY" "$CELL_JSON")"

  CELL_DIR="$(mktemp -d "${TMPDIR:-/tmp}/jangwook-lab-cell.XXXXXX")"
  log "phase execute cell=$CELL_ID ($((i + 1))/$CELL_COUNT, bash × ${CELL_REPEATS})"

  RUN_RCS=""
  for r in $(seq 1 "$CELL_REPEATS"); do
    RAW_FILE="$RAW_DIR/$CELL_ID-$r.txt"
    : > "$RAW_FILE"
    # setup 은 반복마다 다시 돈다. 명령이 상태를 소비하는 셀이 있다.
    find "${CELL_DIR:?}" -mindepth 1 -delete 2>/dev/null || true
    if [ -n "$CELL_SETUP" ]; then
      run_with_timeout 60 bash -c "cd '$CELL_DIR' && $CELL_SETUP" >>"$RAW_FILE" 2>&1
    fi
    run_with_timeout "$LAB_CELL_TIMEOUT_SEC" bash -c "cd '$CELL_DIR' && $CELL_COMMAND" >>"$RAW_FILE" 2>&1
    RC=$?
    RUN_RCS="$RUN_RCS $RC"
    [ "$RC" -ne 0 ] && FAILED=$((FAILED + 1))
  done
  rm -rf "$CELL_DIR"
  log "cell=$CELL_ID 실행 종료 rc:${RUN_RCS}"

  # agy 가 원시 출력을 읽고 observe 기준으로 판정한다.
  JUDGE_PROMPT="$(sed -e "s#{{RAW_DIR}}#$RAW_DIR#g" \
                      -e "s#{{CELL_ID}}#$CELL_ID#g" \
                      -e "s#{{REPEATS}}#$CELL_REPEATS#g" \
                      -e "s#{{EXIT_CODES}}#${RUN_RCS# }#g" \
                      -e "s#{{RESULTS_JSONL}}#$RESULTS_JSONL#g" \
                      "$PROMPT_DIR/lab-judge.md")"
  JUDGE_PROMPT="${JUDGE_PROMPT/\{\{OBSERVE\}\}/$CELL_OBSERVE}"
  "$AGY_BIN" --print "$JUDGE_PROMPT" --model "$AGY_MODEL" \
    --dangerously-skip-permissions --print-timeout 5m </dev/null >>"$LOG_FILE" 2>&1 \
    || log "cell=$CELL_ID 판정 실패 — 이 셀은 results.jsonl 에 안 남는다"
done

RECORDED=$(wc -l < "$RESULTS_JSONL" | tr -d ' ')
log "실행 완료 — 기록된 셀 ${RECORDED}/${CELL_COUNT}, 실패한 런 ${FAILED}, 건너뜀 ${SKIPPED}"
if [ "$SKIPPED" -gt 0 ]; then
  printf '{"_note":"실행 예산 소진으로 %s셀 미실행. status 는 partial 이어야 하고 results.md 에 어느 셀이 빠졌는지 적어야 한다"}\n' "$SKIPPED" >> "$RESULTS_JSONL"
fi

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
