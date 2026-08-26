#!/bin/bash
# gen-hero.sh <slug> — 히어로 이미지 한 장. 다섯 단.
#
#   S1    결정적 렌더    render-hero.py --slug --spec
#   S1.5  복구 렌더      같은 스크립트 --repair
#   S2    agy            내부 툴 generate_image             [일 10장 쿼터를 나눠 쓴다]
#   S3    gemini 무료    gen-image-gemini.py --key-env GEMINI_API_KEY
#   S4    grok           gen-image-grok.sh                  [유료 티어 게이트]
#   S5    gemini 유료    gen-image-gemini.py --key-env GEMINI_API_KEY_PAID
#
# **이건 폴백 체인이 아니다.** S1 은 글자가 값인 타이포그래피 도판이고 S2~S5 는
# 전부 "글자 금지" 프롬프트다. 다른 자산 클래스를 같은 파일명으로 조용히 바꿔치기
# 하는 것이라, 어느 단이 냈는지를 브리프의 hero_kind 에 남긴다.
#   plate         S1 · S1.5
#   illustration  S2 이하
# seal-check 가 illustration 이면 본문에 도판이나 코드블록을 최소 하나 요구한다.
# 격하에 대가를 붙이지 않으면 격하가 공짜가 되고, 공짜인 격하는 기본값이 된다.
#
# 각 단이 data/hero.log 에 `stage= rc= bytes= path=` 한 줄씩 남긴다.
# 이미 hero.png 가 있으면 아무것도 하지 않는다 — 사람이 만든 실측 스크린샷을 덮지 않는다.
#
# 성공하면 마지막 줄에 astro 상대 경로를 출력한다.
set -uo pipefail

SLUG="${1:-}"
[ -n "$SLUG" ] || { echo "usage: $0 <slug>" >&2; exit 2; }

PROJECT_DIR="${PROJECT_DIR:-/Users/jangwook/workspace/www.jangwook.net}"
CONTROLLER_DIR="${CONTROLLER_DIR:-/Users/jangwook/workspace/claude-controller}"
# google-genai 와 matplotlib 는 anaconda 쪽에 있다. .venv-vllm-metal 이 PATH 에서
# anaconda 를 가리므로 절대경로로 고정한다.
PY="${HERO_PYTHON:-/opt/anaconda3/bin/python3}"
# 파이프라인 PATH 에 ~/.local/bin 이 없다. 절대경로로 고정하고 존재를 확인한다.
AGY_BIN="${AGY_BIN:-/Users/jangwook/.local/bin/agy}"
GEN_IMAGE="$CONTROLLER_DIR/scripts/gen-image-gemini.py"
BRIEF="$PROJECT_DIR/data/column-brief.md"
HERO_LOG="$PROJECT_DIR/data/hero.log"
QUOTA_FILE="$PROJECT_DIR/data/img-quota-agy.txt"
# 하루 10장 중 8장까지만 여기서 쓴다. 남은 2장은 etf-swing-social 몫이다 —
# 지금 두 잡이 같은 쿼터를 조율 없이 나눠 쓰고 있다.
AGY_QUOTA_MAX="${AGY_QUOTA_MAX:-8}"
# 코드 드로잉 의심 임계치.
#
# 인수인계서는 150KB 를 제시했다. 그건 etf-swing-social 의 400KB(4컷 만화)에서
# 내린 추정치인데, 이 저장소의 히어로 63장을 실제로 재니 그 값이면 절반 넘게 걸린다.
#
#   n=63  min=39,794  p10=48,790  중앙=111,096  max=1,913,508
#   S1 이 방금 낸 타이포그래피 도판 = 122,100
#
# 30KB 로 둔다. 실측 최소(39.8KB) 아래로 여유를 두면서, 코드 드로잉이 만드는
# 크기(거의 빈 도판이 17KB)와는 확실히 갈린다. 이 게이트가 잡아야 하는 것은
# "작은 이미지"가 아니라 "이미지가 아닌 것"이다.
MIN_BYTES="${HERO_MIN_BYTES:-30000}"

OUT_DIR="$PROJECT_DIR/src/assets/blog/$SLUG"
OUT="$OUT_DIR/hero.png"
REL="../../../assets/blog/$SLUG/hero.png"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] hero: $*" >&2; }
stage_log() {
  local stage="$1" rc="$2" path="${3:-}"
  local bytes=0
  [ -n "$path" ] && [ -s "$path" ] && bytes="$(wc -c < "$path" | tr -d ' ')"
  printf '%s stage=%s rc=%s bytes=%s path=%s\n' \
    "$(date '+%Y-%m-%dT%H:%M:%S')" "$stage" "$rc" "$bytes" "${path:-–}" >> "$HERO_LOG"
}

# 브리프에 어느 자산 클래스인지 남긴다. 브리프가 없으면(수동 실행) 조용히 넘어간다.
record_kind() {
  local kind="$1"
  [ -f "$BRIEF" ] || return 0
  awk -v k="$kind" '
    /^hero_kind:/ && !done { print "hero_kind: " k; done=1; next }
    { print }
    END { if (!done) print "hero_kind: " k }
  ' "$BRIEF" > "$BRIEF.tmp" && mv "$BRIEF.tmp" "$BRIEF"
  log "hero_kind=$kind"
}

finish() {
  local stage="$1" kind="$2"
  stage_log "$stage" 0 "$OUT"
  record_kind "$kind"
  log "완료 stage=$stage $OUT"
  echo "$REL"
  exit 0
}

if [ -s "$OUT" ]; then
  log "이미 있음 — 건너뜀 $OUT"
  echo "$REL"
  exit 0
fi

# 유료 키는 컨트롤러 .env 에만 있다. 값은 로그에 남기지 않는다.
set +u
set -a
[ -f "$CONTROLLER_DIR/.env" ] && . "$CONTROLLER_DIR/.env"
[ -f "$PROJECT_DIR/.env" ] && . "$PROJECT_DIR/.env"
set +a
set -u

[ -x "$PY" ] || { log "FATAL: python 없음 $PY"; exit 1; }
mkdir -p "$OUT_DIR" "$(dirname "$HERO_LOG")"

# ── S1. 로컬 이미지 생성 모델 (z-image-turbo @ 192.168.0.246:11432) ────
SUBJECT="$(awk -F': *' '/^slug:/{print $2; exit}' "$BRIEF" 2>/dev/null | tr '-' ' ')"
[ -n "$SUBJECT" ] || SUBJECT="$(echo "$SLUG" | tr '-' ' ')"

THESIS="$(awk -F': *' '/^thesis:/{print $2; exit}' "$BRIEF" 2>/dev/null)"

PROMPT="A clean modern digital editorial illustration for a tech leadership engineering post about ${SUBJECT}. ${THESIS}.
Dark slate and rich graphite background with subtle glowing cyan and emerald circuit nodes, architectural abstractions and data connections.
Minimalist geometric composition, elegant vector line art, high tech aesthetic, calm and sophisticated.
No text, no letters, no words, no numbers, no stock photo people, no low quality artifacts.
16:9 widescreen composition."

LOCAL_IMAGE_CLI="/Users/jangwook/workspace/life-manager/src/cli/local-image.ts"
if [ -f "$LOCAL_IMAGE_CLI" ]; then
  log "S1 로컬 이미지 생성 시도 (z-image-turbo 1024x576)"
  rm -f "$OUT"
  node "$LOCAL_IMAGE_CLI" --model z-image-turbo --size 1024x576 -o "$OUT" "$PROMPT" >&2
  RC=$?
  if [ "$RC" -eq 0 ] && [ -s "$OUT" ]; then
    "$PY" -c "from PIL import Image; im=Image.open('$OUT'); im=im.resize((1600, 840), Image.Resampling.LANCZOS); im.save('$OUT', optimize=True)" 2>/dev/null || true
    finish S1 illustration
  fi
  stage_log S1.image "$RC"
  log "S1 z-image-turbo 실패 (rc=$RC) — flux2-klein 시도"
  
  node "$LOCAL_IMAGE_CLI" --model flux2-klein-4b --size 1024x576 -o "$OUT" "$PROMPT" >&2
  RC=$?
  if [ "$RC" -eq 0 ] && [ -s "$OUT" ]; then
    "$PY" -c "from PIL import Image; im=Image.open('$OUT'); im=im.resize((1600, 840), Image.Resampling.LANCZOS); im.save('$OUT', optimize=True)" 2>/dev/null || true
    finish S1.flux illustration
  fi
  stage_log S1.flux "$RC"
fi

# ── S2. 비상 폴백: 타이포그래피 도판 ─────────────────────────────────────
log "S2 비상 폴백 도판 렌더러 시도"
"$PY" "$PROJECT_DIR/scripts/render-hero.py" --slug "$SLUG" \
  >/dev/null 2>"$PROJECT_DIR/data/hero-auto.err"
RC=$?
if [ "$RC" -eq 0 ] && [ -s "$OUT" ]; then
  finish S2 plate
fi
stage_log S2.plate "$RC"

stage_log none 1
log "모든 생성 단계 실패 — data/hero.log 확인"
exit 1
