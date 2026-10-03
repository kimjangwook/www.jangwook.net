#!/bin/bash
# gen-image-grok.sh <out.png> <prompt> — grok 내부 툴 image_gen(xAI Imagine API).
#
# 다섯 단 중 4단. 유료 티어(SuperGrok) 전용이라 실패가 잦고, 실패 방식이 특이하다.
#
# 세 가지가 이 스크립트의 모양을 정한다.
#
# 1. **호출 1회.** 실패하면 바이너리가 `Do not retry this tool` 을 지시한다.
#    재시도가 비용만 쌓는다. 402 나 그 문구를 만나면 센티넬을 쓰고 7일간 건너뛴다.
#
# 2. **--out 이 없다.** 세션 상대경로 `images/N.jpg` 에 저장하고 절대경로를 반환한다.
#    그래서 스크래치 디렉터리에서 cd 후 실행하고, 회수는 **독립적인 두 경로**로 한다.
#    문서화되지 않은 출력 포맷을 정규식 하나로 믿으면 언젠가 깨진다.
#
# 3. **JPG 로 나온다.** sips(macOS 내장, 의존성 0)로 PNG 로 바꾸고 규격을 맞춘다.
set -uo pipefail

OUT="${1:-}"
PROMPT="${2:-}"
[ -n "$OUT" ] && [ -n "$PROMPT" ] || { echo "usage: $0 <out.png> <prompt>" >&2; exit 2; }

PROJECT_DIR="${PROJECT_DIR:-/Users/jangwook/workspace/www.jangwook.net}"
GROK_BIN="${GROK_BIN:-/Users/jangwook/.grok/bin/grok}"
SENTINEL="$PROJECT_DIR/data/img-grok-disabled.txt"
DISABLE_DAYS=7
WIDTH=1600
HEIGHT=840

log() { echo "[$(date '+%H:%M:%S')] grok-img: $*" >&2; }

# ── 티어 게이트 ────────────────────────────────────────────────────────
if [ -s "$SENTINEL" ]; then
  SINCE="$(head -n 1 "$SENTINEL" | tr -d ' \n')"
  SINCE_TS="$(date -j -f '%Y-%m-%d' "$SINCE" '+%s' 2>/dev/null || echo 0)"
  if [ "$SINCE_TS" -gt 0 ]; then
    AGE_DAYS=$(( ( $(date +%s) - SINCE_TS ) / 86400 ))
    if [ "$AGE_DAYS" -lt "$DISABLE_DAYS" ]; then
      log "티어 게이트 닫힘 ($SINCE 부터 ${AGE_DAYS}일, ${DISABLE_DAYS}일간) — 건너뜀"
      exit 1
    fi
    log "센티넬 만료 (${AGE_DAYS}일) — 다시 시도한다"
    rm -f "$SENTINEL"
  fi
fi

if [ ! -x "$GROK_BIN" ]; then
  log "grok 없음 $GROK_BIN"
  exit 1
fi

# ── 호출 ───────────────────────────────────────────────────────────────
SCRATCH="$PROJECT_DIR/data/.grok-img/$(basename "$(dirname "$OUT")")"
rm -rf "$SCRATCH"; mkdir -p "$SCRATCH" || { log "스크래치 생성 실패"; exit 1; }

# 호출 시각. 두 번째 회수 경로가 이 값보다 새로운 파일을 찾는다.
MARKER="$SCRATCH/.started"
: > "$MARKER"

log "호출 (1회. 실패해도 재시도하지 않는다)"
RAW="$(cd "$SCRATCH" && "$GROK_BIN" \
  --cwd "$SCRATCH" \
  --always-approve \
  --tools "image_gen" \
  --max-turns 4 \
  -p "Generate one image with your image_gen tool. $PROMPT" 2>&1)"
RC=$?

# ── 사용 불가 판정을 종료코드보다 먼저 본다 ────────────────────────────
# exit 0 으로 한도 문구만 찍는 경우가 있다. rc 부터 보면 빈 결과로 다음 단계가 진행된다.
if printf '%s' "$RAW" | grep -qiE "Do not retry this tool|status 402 Payment Required|usage balance exhausted|SuperGrok|not available on your (plan|tier)"; then
  date +%F > "$SENTINEL"
  log "티어 거부 — 센티넬 기록. ${DISABLE_DAYS}일간 이 단을 건너뛴다"
  exit 1
fi
if [ "$RC" -ne 0 ]; then
  log "rc=$RC — 실패"
  exit 1
fi

# ── 회수 경로 ①. stdout 의 마지막 이미지 경로 ─────────────────────────
SRC="$(printf '%s' "$RAW" | grep -oE '[A-Za-z0-9._/-]+\.(jpg|jpeg|png)' | tail -n 1)"
if [ -n "$SRC" ] && [ "${SRC#/}" = "$SRC" ]; then
  SRC="$SCRATCH/$SRC"
fi

# ── 회수 경로 ②. 호출 시각보다 새로운 파일 ────────────────────────────
# 문서화되지 않은 출력 포맷을 정규식 하나로 믿지 않는다.
if [ -z "$SRC" ] || [ ! -s "$SRC" ]; then
  SRC="$(find "$SCRATCH" -type f \( -name '*.jpg' -o -name '*.jpeg' -o -name '*.png' \) \
           -newer "$MARKER" 2>/dev/null | head -n 1)"
  [ -n "$SRC" ] && log "경로 ① 실패 — find 로 회수 $SRC"
fi

if [ -z "$SRC" ] || [ ! -s "$SRC" ]; then
  log "산출물을 못 찾았다"
  exit 1
fi

# ── JPG → PNG + 규격 ──────────────────────────────────────────────────
mkdir -p "$(dirname "$OUT")"
if ! sips -s format png "$SRC" --out "$OUT" >/dev/null 2>&1; then
  log "sips 변환 실패 $SRC"
  exit 1
fi
sips -z "$HEIGHT" "$WIDTH" "$OUT" >/dev/null 2>&1 || log "규격 조정 실패 — 원본 비율로 둔다"

[ -s "$OUT" ] || { log "변환 후 파일이 비었다"; exit 1; }
log "생성 완료 $OUT ($(wc -c < "$OUT" | tr -d ' ') bytes)"
rm -rf "$SCRATCH"
exit 0
