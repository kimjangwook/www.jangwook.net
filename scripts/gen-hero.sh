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
set -a
[ -f "$CONTROLLER_DIR/.env" ] && . "$CONTROLLER_DIR/.env"
[ -f "$PROJECT_DIR/.env" ] && . "$PROJECT_DIR/.env"
set +a

[ -x "$PY" ] || { log "FATAL: python 없음 $PY"; exit 1; }
mkdir -p "$OUT_DIR" "$(dirname "$HERO_LOG")"

SPEC="$PROJECT_DIR/data/hero-spec.json"

# ── S1. 결정적 렌더 ────────────────────────────────────────────────────
if [ -s "$SPEC" ]; then
  "$PY" "$PROJECT_DIR/scripts/render-hero.py" --slug "$SLUG" --spec "$SPEC" \
    >/dev/null 2>"$PROJECT_DIR/data/hero-render.err"
  RC=$?
  [ "$RC" -eq 0 ] && [ -s "$OUT" ] && finish S1 plate
  stage_log S1 "$RC"
  log "S1 실패 — $(tail -n 2 "$PROJECT_DIR/data/hero-render.err" 2>/dev/null | tr '\n' ' ')"

  # ── S1.5. 복구 렌더 ──────────────────────────────────────────────────
  # S1 실패의 대부분은 스펙 불량(항목 초과, left.items 누락)이다.
  # 클램프하고 다시 그린다. 이 한 단이 S2 진입의 대부분을 없앤다.
  "$PY" "$PROJECT_DIR/scripts/render-hero.py" --slug "$SLUG" --spec "$SPEC" --repair \
    >/dev/null 2>"$PROJECT_DIR/data/hero-repair.err"
  RC=$?
  [ "$RC" -eq 0 ] && [ -s "$OUT" ] && finish S1.5 plate
  stage_log S1.5 "$RC"
  log "S1.5 실패 — $(tail -n 2 "$PROJECT_DIR/data/hero-repair.err" 2>/dev/null | tr '\n' ' ')"
else
  stage_log S1 2
  log "hero-spec.json 없음 — 생성형으로 간다"
fi

# ── 여기서부터 illustration ────────────────────────────────────────────
SUBJECT="$(awk -F': *' '/^slug:/{print $2; exit}' "$BRIEF" 2>/dev/null | tr '-' ' ')"
[ -n "$SUBJECT" ] || SUBJECT="$(echo "$SLUG" | tr '-' ' ')"

PROMPT="A flat editorial illustration for a software engineering blog post about ${SUBJECT}.
Cream paper background #fbfaf7. Dark ink #1c1f26. One muted accent, deep red or deep green.
Abstract shapes only. Two grouped sets of small rounded rectangles, one set marked with a cross, the other with a plus.
No text, no letters, no numbers, no logos, no people, no photorealism, no 3D, no gradients, no drop shadows.
Thin even line weight, generous whitespace, calm and technical.
16:9 aspect ratio."

# ── S2. agy ────────────────────────────────────────────────────────────
# CLI 플래그가 아니라 에이전트 내부 툴 generate_image 다. 모델은 바이너리에
# 고정돼 있고 접근은 -p 뿐이다.
agy_quota_used() {
  local today; today="$(date +%F)"
  [ -s "$QUOTA_FILE" ] || { echo 0; return; }
  awk -v d="$today" '$1 == d { print $2; found=1 } END { if (!found) print 0 }' "$QUOTA_FILE" | tail -n 1
}
agy_quota_bump() {
  local today used; today="$(date +%F)"; used="$(agy_quota_used)"
  local tmp; tmp="$(mktemp)"
  awk -v d="$today" '$1 != d' "$QUOTA_FILE" 2>/dev/null > "$tmp"
  printf '%s %s\n' "$today" "$(( used + 1 ))" >> "$tmp"
  # 30일치만 둔다. 회계 파일이 무한히 자랄 이유가 없다.
  tail -n 30 "$tmp" > "$QUOTA_FILE"; rm -f "$tmp"
}

run_agy_image() {
  # 코드 드로잉 방지. 2026-07-29 에 agy 가 SVG 로 그려서 가짜 결과물이 나왔다.
  # 이 문구는 축자로 박는다.
  "$AGY_BIN" -p "Generate an image and save it to ${OUT}, using your image GENERATION tool only (code/SVG drawing forbidden).

${PROMPT}" \
    --dangerously-skip-permissions \
    --add-dir "$OUT_DIR" \
    --print-timeout 12m </dev/null >/dev/null 2>&1
}

if [ ! -x "$AGY_BIN" ]; then
  stage_log S2 127
  log "S2 건너뜀 — agy 없음 $AGY_BIN"
elif [ "$(agy_quota_used)" -ge "$AGY_QUOTA_MAX" ]; then
  stage_log S2 3
  log "S2 건너뜀 — 오늘 쿼터 $(agy_quota_used)/$AGY_QUOTA_MAX (남은 2장은 etf-swing-social 몫)"
else
  for attempt in 1 2; do
    log "S2 agy 시도 $attempt (포그라운드. 5~10분)"
    rm -f "$OUT"
    run_agy_image
    RC=$?
    agy_quota_bump
    # **타임아웃 ≠ 실패.** 응답 타임아웃이 나도 파일은 저장되는 경우가 있다.
    # rc 를 보지 않고 산출물을 본다.
    if [ -s "$OUT" ]; then
      BYTES="$(wc -c < "$OUT" | tr -d ' ')"
      if [ "$BYTES" -ge "$MIN_BYTES" ]; then
        finish S2 illustration
      fi
      log "S2 산출물이 작다 ${BYTES} < ${MIN_BYTES} — 코드 드로잉 의심"
      stage_log "S2.small.$attempt" "$RC" "$OUT"
      rm -f "$OUT"
      continue
    fi
    stage_log "S2.$attempt" "$RC"
    log "S2 산출물 없음 (rc=$RC)"
    break
  done
fi

# ── S3. gemini 무료 ────────────────────────────────────────────────────
gemini_stage() {
  local stage="$1" key="$2"
  [ -f "$GEN_IMAGE" ] || { log "$stage 건너뜀 — $GEN_IMAGE 없음"; stage_log "$stage" 127; return 1; }
  if [ -z "$(eval "echo \"\${$key:-}\"")" ]; then
    log "$stage 건너뜀 — $key 없음"
    stage_log "$stage" 3
    return 1
  fi
  log "$stage 시도"
  rm -f "$OUT"
  "$PY" "$GEN_IMAGE" --out "$OUT" --prompt "$PROMPT" --aspect 16:9 --key-env "$key" >&2
  local rc=$?
  [ "$rc" -eq 0 ] && [ -s "$OUT" ] && return 0
  stage_log "$stage" "$rc"
  log "$stage 실패 rc=$rc"
  rm -f "$OUT"
  return 1
}

gemini_stage S3 GEMINI_API_KEY && finish S3 illustration

# ── S4. grok ───────────────────────────────────────────────────────────
log "S4 시도"
rm -f "$OUT"
bash "$PROJECT_DIR/scripts/gen-image-grok.sh" "$OUT" "$PROMPT" >&2
RC=$?
if [ "$RC" -eq 0 ] && [ -s "$OUT" ]; then
  finish S4 illustration
fi
stage_log S4 "$RC"
rm -f "$OUT"

# ── S5. gemini 유료 ────────────────────────────────────────────────────
gemini_stage S5 GEMINI_API_KEY_PAID && finish S5 illustration

stage_log none 1
log "다섯 단 전부 실패 — 이미지 없이 진행한다. data/hero.log 확인"
exit 1
