#!/bin/bash
# gen-hero.sh <slug> — 히어로 이미지 한 장을 만든다.
#
# 1순위. data/hero-spec.json 을 matplotlib 으로 렌더한다. 이 블로그의 히어로는
#        타이포그래피 도판이라 글자가 또렷해야 한다. 생성형 이미지 모델은 글자를
#        뭉개므로 결정적 렌더러가 먼저다.
# 2순위. 렌더가 실패하면 Gemini 이미지 API 로 넘어간다. 키 체인은
#        GEMINI_API_KEY(무료) → GEMINI_API_KEY_PAID(유료) 이고,
#        레이트리밋일 때만 다음 키로 간다(scripts/gemini_keys.py).
#
# 이미 hero.png 가 있으면 아무것도 하지 않는다. 사람이 만든 실측 스크린샷을
# 자동 생성물로 덮지 않기 위해서다.
#
# 성공하면 마지막 줄에 astro 상대 경로를 출력한다.
set -uo pipefail

SLUG="${1:-}"
if [ -z "$SLUG" ]; then
  echo "usage: $0 <slug>" >&2
  exit 2
fi

PROJECT_DIR="${PROJECT_DIR:-/Users/jangwook/workspace/www.jangwook.net}"
CONTROLLER_DIR="${CONTROLLER_DIR:-/Users/jangwook/workspace/claude-controller}"
# google-genai 와 matplotlib 는 anaconda 쪽에 있다. .venv-vllm-metal 이 PATH 에서
# anaconda 를 가리므로 절대경로로 고정한다.
PY="${HERO_PYTHON:-/opt/anaconda3/bin/python3}"
GEN_IMAGE="$CONTROLLER_DIR/scripts/gen-image-gemini.py"

OUT_DIR="$PROJECT_DIR/src/assets/blog/$SLUG"
OUT="$OUT_DIR/hero.png"
REL="../../../assets/blog/$SLUG/hero.png"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] hero: $*" >&2; }

if [ -s "$OUT" ]; then
  log "이미 있음 — 건너뜀 $OUT"
  echo "$REL"
  exit 0
fi

# 유료 키는 컨트롤러 .env 에만 있다. 무료 키만으로도 동작하지만, 폴백을 쓰려면
# 두 파일을 모두 읽어야 한다. 값은 로그에 남기지 않는다.
set -a
[ -f "$CONTROLLER_DIR/.env" ] && . "$CONTROLLER_DIR/.env"
[ -f "$PROJECT_DIR/.env" ] && . "$PROJECT_DIR/.env"
set +a

if [ ! -x "$PY" ]; then
  log "FATAL: python 없음 $PY"
  exit 1
fi

mkdir -p "$OUT_DIR"

# ── 1순위. 결정적 렌더 ────────────────────────────────────────────────
SPEC="$PROJECT_DIR/data/hero-spec.json"
if [ -s "$SPEC" ]; then
  if "$PY" "$PROJECT_DIR/scripts/render-hero.py" --slug "$SLUG" --spec "$SPEC" >/dev/null 2>"$PROJECT_DIR/data/hero-render.err"; then
    if [ -s "$OUT" ]; then
      log "렌더 성공 $OUT"
      echo "$REL"
      exit 0
    fi
  fi
  log "렌더 실패 — $(tail -n 3 "$PROJECT_DIR/data/hero-render.err" 2>/dev/null | tr '\n' ' ')"
else
  log "hero-spec.json 없음 — Gemini 폴백으로 간다"
fi

# ── 2순위. Gemini 이미지 (무료 키 → 유료 키) ──────────────────────────
if [ ! -f "$GEN_IMAGE" ]; then
  log "FATAL: $GEN_IMAGE 없음"
  exit 1
fi
if [ -z "${GEMINI_API_KEY:-}${GEMINI_API_KEY_PAID:-}" ]; then
  log "FATAL: GEMINI_API_KEY / GEMINI_API_KEY_PAID 둘 다 없음"
  exit 1
fi

# 제목 한 줄만 뽑아 쓴다. 이미지 모델에 긴 문장을 주면 글자를 그리려다 뭉갠다.
SUBJECT="$(awk -F': *' '/^slug:/{print $2; exit}' "$PROJECT_DIR/data/column-brief.md" 2>/dev/null | tr '-' ' ')"
[ -n "$SUBJECT" ] || SUBJECT="$(echo "$SLUG" | tr '-' ' ')"

PROMPT="A flat editorial illustration for a software engineering blog post about ${SUBJECT}.
Cream paper background #fbfaf7. Dark ink #1c1f26. One muted accent, deep red or deep green.
Abstract shapes only. Two grouped sets of small rounded rectangles, one set marked with a cross, the other with a plus.
No text, no letters, no numbers, no logos, no people, no photorealism, no 3D, no gradients, no drop shadows.
Thin even line weight, generous whitespace, calm and technical."

log "Gemini 폴백 시도 (키 $( [ -n "${GEMINI_API_KEY_PAID:-}" ] && echo '2개' || echo '1개' ))"
if "$PY" "$GEN_IMAGE" --out "$OUT" --prompt "$PROMPT" --aspect 16:9 >&2; then
  if [ -s "$OUT" ]; then
    log "Gemini 생성 성공 $OUT"
    echo "$REL"
    exit 0
  fi
fi

log "히어로 생성 실패 — 이미지 없이 진행한다"
exit 1
