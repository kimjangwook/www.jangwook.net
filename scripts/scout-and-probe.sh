#!/bin/bash
# scout-and-probe.sh — 09:10. 오늘 쓸 주제를 정하고, 그 주제를 겨냥해 실험한다.
#
# 예전 09:10 잡(run-lab.sh 단독)과 다른 점은 순서다. 랩이 먼저 궁금해하고
# 발행이 그 재고에서 고르던 것을, 주제를 먼저 세우고 실험이 그것을 따라가게 바꿨다.
#
#   scout          모은다 (x + web). 판단하지 않는다
#   verify-urls    살아 있는지 확인한다. 모델이 아니라 셸이 한다
#   backlog-merge  백로그와 조인한다
#   topic-pick     오늘 무엇을 쓸지 정한다  → data/topic-pick.md
#   probe          그 주제를 반증·확인할 셀 3~6개를 25분 안에 돌린다
#
# 어느 단계가 실패해도 다음이 돈다. 15:23 파이프라인은 여기 산출물이 없어도
# 스스로 만들 수 있다 — 여기는 그것을 미리 해 두는 자리이지 관문이 아니다.
set -uo pipefail

PROJECT_DIR="${PROJECT_DIR:-/Users/jangwook/workspace/www.jangwook.net}"
CONTROLLER_DIR="${CONTROLLER_DIR:-/Users/jangwook/workspace/claude-controller}"
PROMPT_DIR="$PROJECT_DIR/scripts/prompts"
CLAUDE_BIN="${CLAUDE_BIN:-/opt/homebrew/bin/claude}"
CLAUDE_MODEL="${SCOUT_MODEL:-opus}"
CLAUDE_EFFORT="${SCOUT_EFFORT:-high}"

export HOME="${HOME:-/Users/jangwook}"
export PATH="/Users/jangwook/.nvm/versions/node/v22.22.0/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
cd "$PROJECT_DIR" || exit 1

LOG_DIR="$HOME/.jangwook-net/logs"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/scout.log"
log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] scout: $*" | tee -a "$LOG_FILE" >&2; }

# 15:23 파이프라인과 topic-pick.md 를 공유한다. 둘이 겹치면 서로를 덮는다.
LOCK_DIR="$PROJECT_DIR/data/.scout.lock"
if ! mkdir "$LOCK_DIR" 2>/dev/null; then
  OTHER="$(cat "$LOCK_DIR/pid" 2>/dev/null || echo '?')"
  if [ "$OTHER" != "?" ] && kill -0 "$OTHER" 2>/dev/null; then
    log "다른 scout 이 실행 중이다 (pid=$OTHER) — 건너뛴다"
    exit 0
  fi
  rm -rf "$LOCK_DIR"; mkdir "$LOCK_DIR" || { log "FATAL: 잠금 회수 실패"; exit 1; }
fi
echo "$$" > "$LOCK_DIR/pid"
trap 'rm -rf "$LOCK_DIR"' EXIT INT TERM

DATE="$(date +%F)"
HARVEST_DIR="$PROJECT_DIR/data/scout/$DATE"
TOPIC_PICK="$PROJECT_DIR/data/topic-pick.md"

# ── 1. 수집 ────────────────────────────────────────────────────────────
log "phase scout web"
bash "$PROJECT_DIR/scripts/scout.sh" web >/dev/null 2>>"$LOG_FILE" || log "web 실패 — 비치명"
log "phase scout x"
bash "$PROJECT_DIR/scripts/scout.sh" x   >/dev/null 2>>"$LOG_FILE" || log "x 실패 — 비치명"

if [ ! -s "$HARVEST_DIR/harvest.json" ]; then
  log "수집물이 없다 — topic-pick 이 백로그만으로 고른다"
else
  log "phase verify-urls"
  bash "$PROJECT_DIR/scripts/verify-urls.sh" "$HARVEST_DIR/harvest.json" \
    >>"$LOG_FILE" 2>&1 || log "verify-urls 실패 — 비치명"
fi

# ── 2. 백로그 조인 ─────────────────────────────────────────────────────
if [ -s "$HARVEST_DIR/harvest.verified.json" ]; then
  log "phase backlog-merge"
  node "$PROJECT_DIR/scripts/backlog-merge.mjs" "$HARVEST_DIR/harvest.verified.json" \
    --out "$PROJECT_DIR/data/backlog-slate.json" >>"$LOG_FILE" 2>&1 \
    || log "backlog-merge 실패 — 비치명"
fi

# ── 3. 주제 선정 ───────────────────────────────────────────────────────
rm -f "$TOPIC_PICK"
log "phase topic-pick (claude/$CLAUDE_MODEL effort=$CLAUDE_EFFORT)"
"$CLAUDE_BIN" -p "$(cat "$PROMPT_DIR/topic-pick.md")" \
  --dangerously-skip-permissions --model "$CLAUDE_MODEL" --effort "$CLAUDE_EFFORT" \
  --add-dir "$CONTROLLER_DIR" </dev/null >>"$LOG_FILE" 2>&1
PICK_RC=$?

if [ "$PICK_RC" -ne 0 ] || [ ! -s "$TOPIC_PICK" ]; then
  log "topic-pick 실패(rc=$PICK_RC) — 15:23 파이프라인이 다시 시도한다"
  rm -f "$TOPIC_PICK"
  exit 0
fi
if grep -q '^SKIP' "$TOPIC_PICK"; then
  log "SKIP $(head -n 1 "$TOPIC_PICK") — 프로브 없이 끝낸다"
  exit 0
fi

# 규칙 1을 여기서도 집행한다. 09:10 에 잘못 고른 것을 15:23 이 그대로 쓰면
# 게이트가 그때 닫히고, 그때는 고칠 시간이 없다.
if ! /usr/bin/python3 "$PROJECT_DIR/scripts/check-forced-slug.py" \
       --pick "$TOPIC_PICK" \
       --priority "$PROJECT_DIR/data/priority-slugs.json" \
       --backlog "$PROJECT_DIR/data/topic-backlog.json" \
       --posts "$PROJECT_DIR/src/content/blog/ko" >>"$LOG_FILE" 2>&1; then
  log "규칙 1 위반 — topic-pick 을 버린다. 15:23 이 다시 고른다"
  rm -f "$TOPIC_PICK"
  exit 0
fi

SLUG="$(awk -F': *' '/^slug:/{gsub(/[" ]/, "", $2); print $2; exit}' "$TOPIC_PICK")"
TESTABLE="$(awk -F': *' '/^testable:/{print $2; exit}' "$TOPIC_PICK")"
log "topic-pick $SLUG (testable: ${TESTABLE:-없음})"

# ── 4. 프로브 ──────────────────────────────────────────────────────────
case "$TESTABLE" in
  no*|No*|NO*|'')
    log "잴 것이 없다 — 프로브 생략. 빈 tested[] 로 글은 나간다"
    exit 0
    ;;
esac

log "phase probe $SLUG"
bash "$PROJECT_DIR/scripts/probe.sh" "$SLUG" >>"$LOG_FILE" 2>&1 \
  || log "probe 실패 — 비치명. 빈 tested[] 로 글은 나간다"

log "done slug=$SLUG"
exit 0
