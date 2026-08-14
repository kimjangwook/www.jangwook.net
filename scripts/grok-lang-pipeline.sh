#!/bin/bash
# Split daily-post into isolated grok processes so one language cannot
# translate another. Called by jangwook-scheduler.sh.
set -uo pipefail

PROJECT_DIR="${PROJECT_DIR:-/Users/jangwook/workspace/www.jangwook.net}"
SKILL_DIR="/Users/jangwook/workspace/claude-controller/.claude/skills/daily-tech-blog"
PROMPT_DIR="$PROJECT_DIR/scripts/prompts"
FACT_CORE="$PROJECT_DIR/data/fact-core.md"
GROK_BIN="${GROK_BIN:-/Users/jangwook/.grok/bin/grok}"
GROK_MODEL="${GROK_MODEL:-grok-4.6}"
export HOME="${HOME:-/Users/jangwook}"
export PATH="/Users/jangwook/.grok/bin:/Users/jangwook/.nvm/versions/node/v22.22.0/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
unset XAI_API_KEY
cd "$PROJECT_DIR"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] pipeline: $*"; }

run_grok() {
  local prompt="$1"
  shift
  "$GROK_BIN" -p "$prompt" --yolo --no-auto-update --model "$GROK_MODEL" "$@"
}

if [ ! -x "$GROK_BIN" ]; then
  log "FATAL: grok missing at $GROK_BIN"
  exit 1
fi

mkdir -p "$PROJECT_DIR/data"
rm -f "$FACT_CORE"

log "phase core"
CORE_PROMPT="$(cat "$PROMPT_DIR/daily-post-core.md")"
run_grok "$CORE_PROMPT" \
  --deny "Edit($PROJECT_DIR/src/content/blog/**)" \
  --deny "Write($PROJECT_DIR/src/content/blog/**)"
CORE_RC=$?
if [ "$CORE_RC" -ne 0 ]; then
  log "core grok failed rc=$CORE_RC"
  exit "$CORE_RC"
fi
if [ ! -f "$FACT_CORE" ]; then
  log "FACT CORE missing after core phase"
  exit 1
fi
if grep -q '^SKIP' "$FACT_CORE"; then
  log "SKIP $(head -n 1 "$FACT_CORE")"
  exit 0
fi

SLUG="$(awk -F': *' '/^slug:/{gsub(/[" ]/, "", $2); print $2; exit}' "$FACT_CORE")"
if [ -z "$SLUG" ]; then
  log "FACT CORE has no slug:"
  head -n 20 "$FACT_CORE"
  exit 1
fi
log "slug=$SLUG"

for LANG in ko ja en zh; do
  log "phase lang=$LANG"
  LANG_PROMPT="$(sed "s/{{LANG}}/$LANG/g; s/{{SLUG}}/$SLUG/g" "$PROMPT_DIR/daily-post-lang.md")"
  DENY_ARGS=()
  for OTHER in ko ja en zh; do
    if [ "$OTHER" != "$LANG" ]; then
      DENY_ARGS+=(--deny "Read($PROJECT_DIR/src/content/blog/$OTHER/**)")
      DENY_ARGS+=(--deny "Edit($PROJECT_DIR/src/content/blog/$OTHER/**)")
      DENY_ARGS+=(--deny "Write($PROJECT_DIR/src/content/blog/$OTHER/**)")
    fi
  done
  run_grok "$LANG_PROMPT" "${DENY_ARGS[@]}"
  LANG_RC=$?
  if [ "$LANG_RC" -ne 0 ]; then
    log "lang=$LANG grok failed rc=$LANG_RC"
    exit "$LANG_RC"
  fi
  if [ ! -f "$PROJECT_DIR/src/content/blog/$LANG/$SLUG.md" ]; then
    log "missing $LANG/$SLUG.md"
    exit 1
  fi
done

log "phase seal"
SEAL_PROMPT="$(sed "s/{{SLUG}}/$SLUG/g" "$PROMPT_DIR/daily-post-seal.md")"
run_grok "$SEAL_PROMPT"
SEAL_RC=$?
if [ "$SEAL_RC" -ne 0 ]; then
  log "seal grok failed rc=$SEAL_RC"
  exit "$SEAL_RC"
fi

log "done slug=$SLUG"
exit 0
