#!/bin/bash
# daily-post 파이프라인 — 엔진 분리 (2026-08-15)
#
#   판단(주제 선정·플랜·발행) : claude opus
#   집필(4개 언어 본문)       : agy gemini-3.7-flash-medium  (기본)
#     └ 폴백                 : claude opus / effort xhigh  (집필 실패 시 언어 단위)
#   편집(언어별 삭감 패스)     : 집필과 다른 모델. 사실을 더하지 않고 20~30% 줄인다
#   리뷰                      : 1차(집필과 다른 모델) → claude opus / effort xhigh
#
# 집필 모델을 medium 으로 두는 이유는 §CODEX_EFFORT 주석과 같다. 추론량을 올릴수록
# 산문이 균일해지고, 그 균일함이 독자에게 AI 문체로 읽힌다. 대조·삭제가 일인
# 리뷰·편집 단계만 high 를 쓴다(AGY_REVIEW_MODEL).
#
# 집필 엔진 교체:
#   scripts/daily-post-pipeline.sh --writer codex      (gpt-5.6-luna, effort high)
#   scripts/daily-post-pipeline.sh --writer claude     (opus xhigh, 폴백 없음)
#   WRITER=codex scripts/daily-post-pipeline.sh        (환경변수도 동작)
# 1차 리뷰어·편집자는 집필 엔진과 겹치지 않게 자동으로 고른다.
#
# 동시 실행 금지: data/fact-core.md·seal-check.md·write-engines.txt 를 공유한다.
# 두 슬러그를 같이 돌리면 서로의 상태를 덮는다.
#
# 단계:
#   1. core           claude → data/fact-core.md  (slug + 취재 재료. 본문 금지)
#   2. lang ko/ja/en/zh  writer → src/content/blog/<lang>/<slug>.md  (각 1 프로세스)
#   3. polish         집필과 다른 모델 → 같은 파일 20~30% 감량 (비치명)
#   4. review-1       집필과 다른 모델 → data/review-gemini.md  (비치명)
#   5. seal-check     claude xhigh → data/seal-check.md (OK | REWRITE: ja,zh)
#   6. (조건부) 재집필  writer → REWRITE 로 지목된 언어만 다시 쓴다 (폴백 동일)
#   7. seal-publish   claude → 커밋·푸시·Telegram
#
# 리뷰가 둘인 이유: flash 는 싸고 빨라 사실·링크·메타데이터 같은 기계적 오류를
# 훑는 데 쓰고, opus xhigh 가 그 메모를 받아 문체와 H2 독립성을 판정한다.
# 판정(REWRITE 여부)은 opus 만 내린다. 리뷰어가 둘이어도 결정권은 하나다.
#
# 언어 격리: grok 의 `--deny Read(...)` 에 해당하는 기능이 codex 에 없다.
# 대신 각 언어 프로세스를 돌리기 직전, 오늘 slug 의 다른 언어 파일을 레포 밖
# 임시 디렉터리로 옮긴다. 번역할 원본이 디스크에 없으면 번역이 불가능하다.
# trap 으로 어떤 종료 경로에서도 원위치한다.
#
# 호출: scripts/jangwook-scheduler.sh (launchd)
#
# redo 모드:
#   scripts/daily-post-pipeline.sh --redo <slug>
# 이미 발행된 글을 이 로직으로 다시 만든다. core 대신 claude 가 기존 4개 파일에서
# FACT CORE 를 복원하고(취재는 끝나 있다), 기존 본문 4개를 레포 밖으로 치운 뒤
# codex 가 백지에서 다시 쓴다. 기존 본문은 아카이브에 남는다.
set -uo pipefail

PROJECT_DIR="${PROJECT_DIR:-/Users/jangwook/workspace/www.jangwook.net}"
CONTROLLER_DIR="${CONTROLLER_DIR:-/Users/jangwook/workspace/claude-controller}"
PROMPT_DIR="$PROJECT_DIR/scripts/prompts"
FACT_CORE="$PROJECT_DIR/data/fact-core.md"
SEAL_CHECK="$PROJECT_DIR/data/seal-check.md"
GEMINI_REVIEW="$PROJECT_DIR/data/review-gemini.md"
ENGINE_LOG="$PROJECT_DIR/data/write-engines.txt"

CLAUDE_BIN="${CLAUDE_BIN:-/opt/homebrew/bin/claude}"
CLAUDE_MODEL="${CLAUDE_MODEL:-opus}"
CLAUDE_EFFORT="${CLAUDE_EFFORT:-high}"          # 판단 단계 기본
CLAUDE_WRITE_EFFORT="${CLAUDE_WRITE_EFFORT:-xhigh}"   # codex 폴백 집필
CLAUDE_REVIEW_EFFORT="${CLAUDE_REVIEW_EFFORT:-xhigh}" # 리뷰/판정
CODEX_BIN="${CODEX_BIN:-/opt/homebrew/bin/codex}"
CODEX_MODEL="${CODEX_MODEL:-gpt-5.6-luna}"
# effort=max 는 "빠짐없이 균일하게 덮는" 산문을 만든다. 그 균일함이 곧 AI 문체다.
# 2026-08-15 ko 단일언어 A/B: 프롬프트를 고정하고 max→high 만 바꿨을 때
# 설명성 괄호 18→8, 유보 4→2, 소요 18분→6분. high 를 기본으로 둔다.
CODEX_EFFORT="${CODEX_EFFORT:-high}"
AGY_BIN="${AGY_BIN:-/Users/jangwook/.local/bin/agy}"
# 집필 기본 모델. high 가 아니라 medium 이다 — effort 를 올릴수록 산문이
# 균일해지고, 그 균일함이 AI 문체로 읽힌다 (2026-08-15 ko A/B).
AGY_MODEL="${AGY_MODEL:-gemini-3.7-flash-medium}"
# 리뷰·편집처럼 대조와 삭제가 일인 단계는 추론을 더 줘도 문체가 상하지 않는다.
AGY_REVIEW_MODEL="${AGY_REVIEW_MODEL:-gemini-3.7-flash-high}"

export HOME="${HOME:-/Users/jangwook}"
export PATH="/Users/jangwook/.nvm/versions/node/v22.22.0/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
# 헤드리스 run 은 인바운드 Telegram 이 불필요하다. 빈 토큰이면 플러그인이 즉시
# exit 해 고아 bun 폴러가 뜨지 않는다 (scheduler 와 동일 정책).
export TELEGRAM_BOT_TOKEN=""
cd "$PROJECT_DIR" || exit 1

LANGS="ko ja en zh"

# 집필 엔진. 기본 agy(gemini-3.7-flash-medium). 실패하면 claude opus xhigh 로 폴백한다.
WRITER="${WRITER:-agy}"
REDO_SLUG=""
while [ $# -gt 0 ]; do
  case "$1" in
    --redo)
      REDO_SLUG="${2:-}"
      [ -n "$REDO_SLUG" ] || { echo "usage: $0 [--writer codex|agy|claude] --redo <slug>" >&2; exit 2; }
      shift 2
      ;;
    --writer)
      WRITER="${2:-}"
      [ -n "$WRITER" ] || { echo "usage: $0 --writer codex|agy|claude" >&2; exit 2; }
      shift 2
      ;;
    *)
      echo "unknown arg: $1" >&2; exit 2
      ;;
  esac
done
case "$WRITER" in
  codex|agy|claude) ;;
  *) echo "unknown writer: $WRITER (codex|agy|claude)" >&2; exit 2 ;;
esac

# 편집자는 집필자와 다른 모델이어야 한다. 자기 문장에서 자기 군더더기는 잘 안 보인다.
# POLISH=0 으로 편집 패스를 끌 수 있다.
if [ -z "${POLISH_ENGINE:-}" ]; then
  if [ "$WRITER" = "agy" ]; then POLISH_ENGINE="codex"; else POLISH_ENGINE="agy"; fi
fi

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] pipeline: $*"; }

# ── 엔진 래퍼 ──────────────────────────────────────────────────────────
# claude: 판단·폴백 집필. 컨트롤러 레포(스킬 원본)를 읽어야 하므로 --add-dir.
# $1=effort, $2=prompt
run_claude() {
  local effort="$1" prompt="$2"
  "$CLAUDE_BIN" -p "$prompt" \
    --dangerously-skip-permissions \
    --model "$CLAUDE_MODEL" \
    --effort "$effort" \
    --add-dir "$CONTROLLER_DIR" \
    </dev/null
}

# codex: 집필 단계. 사용자 config 가 바뀌어도 모델/추론량이 흔들리지 않게 명시한다.
run_codex() {
  local prompt="$1"
  "$CODEX_BIN" exec "$prompt" \
    --model "$CODEX_MODEL" \
    -c model_reasoning_effort="$CODEX_EFFORT" \
    --dangerously-bypass-approvals-and-sandbox \
    --cd "$PROJECT_DIR" \
    </dev/null
}

# agy: Antigravity CLI. gemini-cli 개인 티어는 2026-08 기준 IneligibleTierError 라
# Gemini 계열은 agy 로만 헤드리스가 된다. 모델 슬러그에 추론량이 붙어 있어
# --effort 를 따로 주지 않는다.
run_agy() {
  local prompt="$1" model="${2:-$AGY_MODEL}"
  "$AGY_BIN" --print "$prompt" \
    --model "$model" \
    --dangerously-skip-permissions \
    --add-dir "$CONTROLLER_DIR" \
    --print-timeout 20m \
    </dev/null
}

# ── 언어 격리 ──────────────────────────────────────────────────────────
HOLD_DIR=""
restore_holds() {
  [ -n "$HOLD_DIR" ] && [ -d "$HOLD_DIR" ] || return 0
  local other
  for other in $LANGS; do
    if [ -f "$HOLD_DIR/$other.md" ]; then
      mv -f "$HOLD_DIR/$other.md" "$PROJECT_DIR/src/content/blog/$other/$SLUG.md" 2>/dev/null \
        && log "hold restore $other"
    fi
  done
}
cleanup() {
  restore_holds
  [ -n "$HOLD_DIR" ] && rm -rf "$HOLD_DIR"
  command -v release_lock >/dev/null 2>&1 && release_lock
}

hold_siblings() {
  local keep="$1" other
  for other in $LANGS; do
    [ "$other" = "$keep" ] && continue
    if [ -f "$PROJECT_DIR/src/content/blog/$other/$SLUG.md" ]; then
      mv "$PROJECT_DIR/src/content/blog/$other/$SLUG.md" "$HOLD_DIR/$other.md" || return 1
    fi
  done
  return 0
}

# 한 언어를 쓴다. 기본 codex, 실패하면 claude opus xhigh 로 폴백.
# 폴백은 언어 단위다. ko 가 codex 로 나오고 ja 만 claude 로 나오는 상태가 정상이며,
# 어느 언어를 누가 썼는지는 $ENGINE_LOG 에 남아 Telegram 까지 간다.
# $1=lang, $2=추가 지시(없으면 빈 문자열)
write_lang() {
  local lang="$1" extra="${2:-}" prompt_file prompt rc target wlabel
  prompt_file="$PROMPT_DIR/daily-post-lang-$lang.md"
  if [ ! -f "$prompt_file" ]; then
    log "missing prompt $prompt_file"
    return 1
  fi
  target="$PROJECT_DIR/src/content/blog/$lang/$SLUG.md"
  prompt="$(sed "s/{{SLUG}}/$SLUG/g" "$prompt_file")"
  [ -n "$extra" ] && prompt="$prompt

$extra"

  hold_siblings "$lang" || { log "hold failed lang=$lang"; return 1; }

  case "$WRITER" in
    codex)  run_codex "$prompt"; rc=$?; wlabel="codex/$CODEX_MODEL:$CODEX_EFFORT" ;;
    agy)    run_agy "$prompt";   rc=$?; wlabel="agy/$AGY_MODEL" ;;
    claude) run_claude "$CLAUDE_WRITE_EFFORT" "$prompt"; rc=$?; wlabel="claude/$CLAUDE_MODEL:$CLAUDE_WRITE_EFFORT" ;;
  esac

  if [ "$rc" -eq 0 ] && [ -f "$target" ]; then
    polish_lang "$lang"
    restore_holds
    record_engine "$lang" "$wlabel"
    return 0
  fi

  # 폴백. 집필 엔진이 비정상 종료했으면 반쯤 쓰인 파일이 남아 있을 수 있다.
  # 그 파일을 이어 고치게 두면 어디까지가 누구 문장인지 알 수 없다.
  # 지우고 FACT CORE 에서 다시 시작한다.
  if [ "$WRITER" = "claude" ]; then
    log "lang=$lang claude 집필 실패 rc=$rc (폴백 대상 없음)"
    restore_holds
    return 1
  fi
  if [ "$rc" -ne 0 ]; then
    log "lang=$lang $WRITER failed rc=$rc — claude/$CLAUDE_MODEL effort=$CLAUDE_WRITE_EFFORT 로 폴백"
  else
    log "lang=$lang $WRITER rc=0 이나 $lang/$SLUG.md 없음 — claude 폴백"
  fi
  rm -f "$target"

  run_claude "$CLAUDE_WRITE_EFFORT" "$prompt"
  rc=$?

  if [ "$rc" -ne 0 ]; then
    restore_holds
    log "lang=$lang claude 폴백도 실패 rc=$rc"
    return "$rc"
  fi
  if [ ! -f "$target" ]; then
    restore_holds
    log "missing $lang/$SLUG.md ($WRITER·claude 모두 산출 없음)"
    return 1
  fi
  # 편집도 hold 창 안에서. 편집자에게도 다른 언어를 보여주지 않는다.
  polish_lang "$lang"
  restore_holds
  record_engine "$lang" "claude/$CLAUDE_MODEL:$CLAUDE_WRITE_EFFORT ($WRITER fallback)"
  return 0
}

# 언어당 한 줄만 남긴다. 재집필이 걸리면 그 언어 줄을 덮어쓴다.
# append 로 두면 재집필한 언어가 두 번 찍혀 Telegram 알림에 그대로 나간다.
record_engine() {
  local lang="$1" label="$2" tmp
  tmp="$ENGINE_LOG.tmp"
  if [ -f "$ENGINE_LOG" ]; then
    grep -v "^$lang=" "$ENGINE_LOG" > "$tmp" 2>/dev/null || true
  else
    : > "$tmp"
  fi
  echo "$lang=$label" >> "$tmp"
  sort -o "$ENGINE_LOG" "$tmp"
  rm -f "$tmp"
}

# 집필 직후 같은 파일에 편집 패스를 한 번 돌린다. hold 창 안에서 돌아서
# 편집자도 다른 언어를 볼 수 없다.
#
# 집필과 편집을 한 프롬프트에 섞지 않는 이유: 요구사항이 늘수록 준수율이 떨어진다
# (arXiv:2505.13360, 약 19%). 집필 프롬프트는 짧게 두고, 삭제 규칙은 여기에 둔다.
# 편집자는 사실을 더하지 않는다. 짧게 만들 뿐이다. 실패해도 초고는 살아 있으므로
# 비치명으로 둔다.
polish_lang() {
  local lang="$1" pfile prompt rc before after
  pfile="$PROMPT_DIR/daily-post-polish-$lang.md"
  [ -f "$pfile" ] || { log "polish 프롬프트 없음 lang=$lang — 건너뜀"; return 0; }
  [ "${POLISH:-1}" = "1" ] || return 0

  local target="$PROJECT_DIR/src/content/blog/$lang/$SLUG.md"
  [ -s "$target" ] || return 0
  before=$(wc -c < "$target" | tr -d ' ')
  prompt="$(sed "s/{{SLUG}}/$SLUG/g" "$pfile")"

  log "phase polish lang=$lang (editor=$POLISH_ENGINE)"
  case "$POLISH_ENGINE" in
    codex) run_codex "$prompt"; rc=$? ;;
    agy)   run_agy "$prompt" "$AGY_REVIEW_MODEL"; rc=$? ;;
    *)     run_claude "$CLAUDE_EFFORT" "$prompt"; rc=$? ;;
  esac

  if [ "$rc" -ne 0 ] || [ ! -s "$target" ]; then
    log "polish lang=$lang 실패(rc=$rc) — 초고 유지"
    return 0
  fi
  after=$(wc -c < "$target" | tr -d ' ')
  log "polish lang=$lang ${before} → ${after} bytes"
  return 0
}

# ── 사전 점검 ──────────────────────────────────────────────────────────
if [ ! -x "$CLAUDE_BIN" ]; then
  log "FATAL: claude missing at $CLAUDE_BIN"
  exit 1
fi
if [ ! -x "$CODEX_BIN" ]; then
  log "FATAL: codex missing at $CODEX_BIN"
  exit 1
fi

if [ ! -x "$AGY_BIN" ]; then
  log "WARN: agy missing at $AGY_BIN — Gemini 리뷰 없이 진행한다"
fi

mkdir -p "$PROJECT_DIR/data"

# 동시 실행 잠금. data/fact-core.md 등을 공유하므로 두 런이 겹치면 서로를 덮는다.
# mkdir 은 원자적이라 별도 도구 없이 잠금이 된다.
LOCK_DIR="$PROJECT_DIR/data/.pipeline.lock"
if ! mkdir "$LOCK_DIR" 2>/dev/null; then
  OTHER_PID="$(cat "$LOCK_DIR/pid" 2>/dev/null || echo '?')"
  if [ "$OTHER_PID" != "?" ] && kill -0 "$OTHER_PID" 2>/dev/null; then
    log "FATAL: 다른 파이프라인이 실행 중이다 (pid=$OTHER_PID). 동시 실행은 서로의 data/ 를 덮는다."
    exit 1
  fi
  log "잠금이 남아 있으나 pid=$OTHER_PID 는 죽어 있다 — 회수한다"
  rm -rf "$LOCK_DIR"
  mkdir "$LOCK_DIR" || { log "FATAL: 잠금 회수 실패"; exit 1; }
fi
echo "$$" > "$LOCK_DIR/pid"
release_lock() { rm -rf "$LOCK_DIR"; }
# SLUG 확정 전에 죽어도 잠금은 반드시 푼다. 뒤에서 trap 을 cleanup 으로 덮어쓰며,
# cleanup 도 release_lock 을 부른다.
trap release_lock EXIT INT TERM

rm -f "$FACT_CORE" "$SEAL_CHECK" "$GEMINI_REVIEW" "$ENGINE_LOG"

# ── 1. core (claude): 주제 선정 + 취재 플랜 ────────────────────────────
if [ -n "$REDO_SLUG" ]; then
  log "phase refact slug=$REDO_SLUG (claude/$CLAUDE_MODEL)"
  CORE_PROMPT="$(sed "s/{{SLUG}}/$REDO_SLUG/g" "$PROMPT_DIR/daily-post-refact.md")"
else
  log "phase core (claude/$CLAUDE_MODEL)"
  CORE_PROMPT="$(cat "$PROMPT_DIR/daily-post-core.md")"
fi
run_claude "$CLAUDE_EFFORT" "$CORE_PROMPT"
CORE_RC=$?
if [ "$CORE_RC" -ne 0 ]; then
  log "core claude failed rc=$CORE_RC"
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

if [ -n "$REDO_SLUG" ] && [ "$SLUG" != "$REDO_SLUG" ]; then
  log "refact returned slug=$SLUG but --redo asked for $REDO_SLUG"
  exit 1
fi

HOLD_DIR="$(mktemp -d "${TMPDIR:-/tmp}/daily-post-hold.XXXXXX")"
trap cleanup EXIT INT TERM

# redo: 기존 본문 4개를 아카이브로 옮겨 백지에서 다시 쓰게 한다.
# hold 와 달리 되돌리지 않는다. 옛 원고를 남겨야 롤백과 비교가 가능하다.
if [ -n "$REDO_SLUG" ]; then
  ARCHIVE_DIR="$PROJECT_DIR/data/redo-archive/$SLUG-$(date +%Y%m%d-%H%M%S)"
  mkdir -p "$ARCHIVE_DIR"
  for LANG in $LANGS; do
    if [ -f "$PROJECT_DIR/src/content/blog/$LANG/$SLUG.md" ]; then
      mv "$PROJECT_DIR/src/content/blog/$LANG/$SLUG.md" "$ARCHIVE_DIR/$LANG.md" || exit 1
    fi
  done
  log "redo archive → $ARCHIVE_DIR"
fi

# ── 1.5 히어로 이미지 ──────────────────────────────────────────────────
# 언어 집필보다 먼저 만든다. FACT CORE 의 hero: 가 실제 경로가 된 뒤에 네 언어가
# 같은 값을 frontmatter 에 적어야, 나중에 네 파일을 따로 고치는 일이 없다.
# 실패해도 글은 나간다. 다만 supporting asset 이 없으면 seal-check 가 잡는다.
HERO_REL=""
if [ -s "$PROJECT_DIR/src/assets/blog/$SLUG/hero.png" ]; then
  HERO_REL="../../../assets/blog/$SLUG/hero.png"
  log "hero 이미 있음 — 생성 건너뜀"
else
  log "phase hero-spec (claude/$CLAUDE_MODEL)"
  rm -f "$PROJECT_DIR/data/hero-spec.json"
  HERO_PROMPT="$(sed "s/{{SLUG}}/$SLUG/g" "$PROMPT_DIR/hero-spec.md")"
  run_claude "$CLAUDE_EFFORT" "$HERO_PROMPT" || log "hero-spec 실패 — Gemini 폴백에 맡긴다"

  log "phase hero-render"
  HERO_REL="$(bash "$PROJECT_DIR/scripts/gen-hero.sh" "$SLUG" 2>>"$PROJECT_DIR/data/hero.log" | tail -n 1)"
  if [ -n "$HERO_REL" ] && [ -s "$PROJECT_DIR/src/assets/blog/$SLUG/hero.png" ]; then
    log "hero 생성 완료 $HERO_REL"
  else
    HERO_REL=""
    log "hero 생성 실패 — data/hero.log 확인. 이미지 없이 계속한다"
  fi
fi

# FACT CORE 의 hero: 줄을 실제 경로로 바꾼다. TODO 로 남으면 네 언어가 각자
# 다른 값을 적거나 heroImage 를 통째로 빠뜨린다.
if [ -n "$HERO_REL" ]; then
  awk -v rel="$HERO_REL" '
    /^hero:/ && !done { print "hero: \x27" rel "\x27"; done=1; next }
    { print }
    END { if (!done) print "hero: \x27" rel "\x27" }
  ' "$FACT_CORE" > "$FACT_CORE.tmp" && mv "$FACT_CORE.tmp" "$FACT_CORE"
  log "FACT CORE hero → $HERO_REL"
fi

# ── 2. lang × 4: 언어별 독립 초고 ──────────────────────────────────────
for LANG in $LANGS; do
  log "phase lang=$LANG (writer=$WRITER)"
  write_lang "$LANG" "" || exit 1
done

# ── 3. 1차 리뷰: 비치명 ────────────────────────────────────────────────
# 싸고 빠른 모델에게 사실·인용·링크·frontmatter 같이 기계적으로 대조 가능한
# 층을 훑게 하고, 문체 판정은 다음 단계 opus 에 맡긴다.
# 1차 리뷰어는 집필 엔진과 달라야 한다. 자기 문장을 자기가 읽으면 덜 걸린다.
# 기본은 agy(gemini). 집필이 agy 였으면 codex 로 바꾼다.
if [ "$WRITER" = "agy" ]; then
  REVIEWER1="codex"
else
  REVIEWER1="agy"
fi
if { [ "$REVIEWER1" = "agy" ] && [ -x "$AGY_BIN" ]; } || { [ "$REVIEWER1" = "codex" ] && [ -x "$CODEX_BIN" ]; }; then
  log "phase review-1 (reviewer=$REVIEWER1, writer=$WRITER)"
  GEMINI_PROMPT="$(sed "s/{{SLUG}}/$SLUG/g" "$PROMPT_DIR/daily-post-review-gemini.md")"
  if [ "$REVIEWER1" = "agy" ]; then
    run_agy "$GEMINI_PROMPT" "$AGY_REVIEW_MODEL"; REVIEW1_RC=$?; REVIEWER1_LABEL="$AGY_REVIEW_MODEL"
  else
    run_codex "$GEMINI_PROMPT"; REVIEW1_RC=$?; REVIEWER1_LABEL="$CODEX_MODEL"
  fi
  if [ "$REVIEW1_RC" -ne 0 ] || [ ! -f "$GEMINI_REVIEW" ]; then
    log "review-1 실패(rc=$REVIEW1_RC) 또는 산출 없음 — opus 단독 리뷰로 진행"
    rm -f "$GEMINI_REVIEW"
  fi
fi
REVIEWER1_LABEL="${REVIEWER1_LABEL:-none}"

# ── 4. seal-check (claude xhigh): 판정. 본문 산문은 고치지 않는다 ──────
log "phase seal-check (claude/$CLAUDE_MODEL effort=$CLAUDE_REVIEW_EFFORT)"
CHECK_PROMPT="$(sed "s/{{SLUG}}/$SLUG/g" "$PROMPT_DIR/daily-post-seal-check.md")"
if [ -f "$GEMINI_REVIEW" ]; then
  CHECK_PROMPT="$CHECK_PROMPT

A first reviewer (${REVIEWER1_LABEL}) already went through the four files and left notes in \`data/review-gemini.md\`. It is a different model from the one that wrote the prose (${WRITER}). Read the notes. They are input, not a verdict — confirm each claim against the file before you act on it, and say so when you disagree. The decision is yours alone."
else
  CHECK_PROMPT="$CHECK_PROMPT

The first-pass reviewer did not run today. You are the only review. Widen the metadata sweep accordingly."
fi
run_claude "$CLAUDE_REVIEW_EFFORT" "$CHECK_PROMPT"
CHECK_RC=$?
if [ "$CHECK_RC" -ne 0 ]; then
  log "seal-check claude failed rc=$CHECK_RC"
  exit "$CHECK_RC"
fi
if [ ! -f "$SEAL_CHECK" ]; then
  log "seal-check produced no $SEAL_CHECK"
  exit 1
fi

# ── 5. (조건부) 재집필 (codex, 실패 시 claude): 검수가 지목한 언어만 ───
REWRITE_LANGS="$(awk -F': *' '/^REWRITE:/{print $2; exit}' "$SEAL_CHECK" | tr ',' ' ')"
if [ -n "${REWRITE_LANGS// /}" ]; then
  FIX_NOTE="$(cat "$PROMPT_DIR/daily-post-lang-fix.md" 2>/dev/null || true)"
  CHECK_BODY="$(cat "$SEAL_CHECK")"
  for LANG in $REWRITE_LANGS; do
    case " $LANGS " in
      *" $LANG "*) ;;
      *) log "seal-check named unknown lang=$LANG — 무시"; continue ;;
    esac
    log "phase rewrite lang=$LANG (writer=$WRITER)"
    write_lang "$LANG" "$FIX_NOTE

검수 결과 (data/seal-check.md):
$CHECK_BODY" || exit 1
  done
fi

# ── 6. seal-publish (claude): 커밋·푸시·알림 ───────────────────────────
log "phase seal-publish (claude/$CLAUDE_MODEL)"
log "engines: $(tr '\n' ' ' < "$ENGINE_LOG" 2>/dev/null)"
PUBLISH_PROMPT="$(sed "s/{{SLUG}}/$SLUG/g" "$PROMPT_DIR/daily-post-seal-publish.md")"
PUBLISH_PROMPT="$PUBLISH_PROMPT

Which engine wrote which language (data/write-engines.txt):
$(cat "$ENGINE_LOG" 2>/dev/null || echo '(기록 없음)')

If any language says \`codex fallback\`, the Telegram message must say so. A silent fallback is how a broken codex auth goes unnoticed for a week."
if [ -n "$REDO_SLUG" ]; then
  PUBLISH_PROMPT="$PUBLISH_PROMPT

This is a redo. The post was already published and its four files were rewritten in place. Keep the original pubDate. Say redo in the commit subject and in the Telegram message."
fi
run_claude "$CLAUDE_EFFORT" "$PUBLISH_PROMPT"
PUBLISH_RC=$?
if [ "$PUBLISH_RC" -ne 0 ]; then
  log "seal-publish claude failed rc=$PUBLISH_RC"
  exit "$PUBLISH_RC"
fi

log "done slug=$SLUG"
exit 0
