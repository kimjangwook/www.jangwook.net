#!/bin/bash
# daily-post 파이프라인 — 엔진 분리 (2026-08-15)
#
#   판단(주제 선정·플랜·발행) : claude opus
#   집필(4개 언어 본문)       : sdk — Agent SDK 편집부, sonnet (기본)
#                             편집장 medium 이 writer low·편집자 2(medium)를 위임
#     └ 폴백                 : claude opus / effort medium  (집필 실패 시 언어 단위)
#   편집(언어별 삭감 패스)     : 집필과 다른 모델. 사실을 더하지 않고 20~30% 줄인다
#   리뷰                      : 1차(집필과 다른 모델) → claude opus / effort xhigh
#
# 집필 모델을 medium 으로 두는 이유는 §CODEX_EFFORT 주석과 같다. 추론량을 올릴수록
# 산문이 균일해지고, 그 균일함이 독자에게 AI 문체로 읽힌다. 대조·삭제가 일인
# 리뷰·편집 단계만 high 를 쓴다(AGY_REVIEW_MODEL).
#
# 집필 엔진 교체:
#   scripts/daily-post-pipeline.sh --writer codex      (gpt-5.6-luna, effort high)
#   scripts/daily-post-pipeline.sh --writer claude     (opus, CLAUDE_WRITE_EFFORT, 폴백 없음)
#   WRITER=codex scripts/daily-post-pipeline.sh        (환경변수도 동작)
# 1차 리뷰어·편집자는 집필 엔진과 겹치지 않게 자동으로 고른다.
#
# 동시 실행 금지: data/column-brief.md·seal-check.md·write-engines.txt 를 공유한다.
# 두 슬러그를 같이 돌리면 서로의 상태를 덮는다.
#
# 단계:
#   1. brief          claude → data/column-brief.md
#                     레인 b(기본): daily-post-brief.md 가 data/topic-pick.md 를 읽고
#                     LOCKED(잠긴 사실) / OPEN(집필자가 늘려도 되는 재료) 두 블록을 쓴다.
#                     레인 a: daily-post-core-lab.md 가 data/labs/ 의 미소비 데이터셋을 쓴다.
#                     어느 레인이든 여기서 새로 실험하지 않는다.
#   1.5 hero          claude → data/hero-spec.json → render-hero.py (실패 시 Gemini)
#   2. lang ko/ja/en/zh  writer → src/content/blog/<lang>/<slug>.md  (각 1 프로세스)
#   3. polish         집필과 다른 모델 → 같은 파일 20~30% 감량 (비치명)
#   4. review-1       집필과 다른 모델 → data/review-gemini.md  (비치명)
#   5. seal-check     claude xhigh → data/seal-check.md (OK | REWRITE: ja,zh)
#   5.5 insight-gate  claude xhigh → data/insight-gate.md (PUBLISH | HOLD)
#                     HOLD 면 발행하지 않고 랩 데이터셋을 미소비로 남긴다.
#   6. (조건부) 재집필  writer → REWRITE 로 지목된 언어만 다시 쓴다 (폴백 동일)
#   7. seal-publish   claude → 커밋·푸시·Telegram, 그리고 랩 consumed 표시
#
# 발행은 매일 한 편이다. 2026-08-16 에 월·수·금으로 줄였다가 2026-08-18 에 되돌렸다 —
# 줄인 이유였던 "한 편의 두께"는 발행 빈도가 아니라 브리프 스키마의 문제였다.
# 실험은 주제가 정해진 뒤에 그 주제를 겨냥해서만 돈다(scout-and-probe.sh).
#
# 리뷰가 둘인 이유: flash 는 싸고 빨라 사실·링크·메타데이터 같은 기계적 오류를
# 훑는 데 쓰고, opus medium 이 그 메모를 받아 종합 판정한다.

PROJECT_DIR="/Users/jangwook/workspace/www.jangwook.net"
CONTROLLER_DIR="/Users/jangwook/workspace/claude-controller"
PROMPT_DIR="$PROJECT_DIR/scripts/prompts"
BRIEF="$PROJECT_DIR/data/column-brief.md"
SEAL_CHECK="$PROJECT_DIR/data/seal-check.md"
GEMINI_REVIEW="$PROJECT_DIR/data/review-gemini.md"
ENGINE_LOG="$PROJECT_DIR/data/write-engines.txt"

CLAUDE_SDK="${CLAUDE_SDK:-/Users/jangwook/workspace/life-manager/src/cli/claude-sdk-llm.ts}"  # 2026-08-21 CLI 퇴출
CLAUDE_MODEL="opus"
CLAUDE_EFFORT="medium"          # 판단 단계 기본 (과잉 생각 방지)
CLAUDE_WRITE_MODEL="fable"      # 집필 1순위
# 집필은 low — effort 를 올릴수록 산문이 균일해지고 그 균일함이 AI 문체로 읽힌다.
CLAUDE_WRITE_EFFORT="low"
CLAUDE_FALLBACK_MODEL="opus"     # 집필 폴백
CLAUDE_FALLBACK_EFFORT="low"
CLAUDE_REVIEW_EFFORT="medium" # 리뷰/판정 (과도한 추론으로 인한 사소한 트집/과잉 검열 방지)
CODEX_BIN="/opt/homebrew/bin/codex"
CODEX_MODEL="gpt-5.6-terra"
CODEX_EFFORT="medium"
AGY_BIN="/Users/jangwook/.local/bin/agy"
# 집필 모델 (gemini-3.7-flash-medium). 군더더기 없고 명쾌한 산문과 자연스러운 번역 생성
AGY_MODEL="gemini-3.7-flash-medium"
# 리뷰·편집 단계도 medium으로 과도한 피로도와 사소한 트집 방지
AGY_REVIEW_MODEL="gemini-3.7-flash-medium"

export HOME="/Users/jangwook"
export PATH="/Users/jangwook/.nvm/versions/node/v22.22.0/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
# 헤드리스 run 은 인바운드 Telegram 이 불필요하다. 빈 토큰이면 플러그인이 즉시
# exit 해 고아 bun 폴러가 뜨지 않는다 (scheduler 와 동일 정책).
export TELEGRAM_BOT_TOKEN=""
cd "$PROJECT_DIR" || exit 1

LANGS="en ko ja zh"

# 집필 엔진. 기본 sdk — Agent SDK 편집부(sonnet). 2026-08-19 claude-md-at-import
# redo 실전(4개 언어 재발행, seal-check·insight-gate 통과)을 보고 fable 에서
# 전환했다. 실패하면 claude opus medium 으로 폴백한다.
# 집필 엔진: 기본 sdk — Agent SDK 편집부(sonnet). 2026-08-21 LLM CLI 금지 결정으로
# hybrid(영어=codex CLI, 번역=agy CLI)에서 되돌렸다. codex·agy 는 더 쓰지 않는다.
WRITER="sdk"
WRITER_EN="sdk"
WRITER_TRANS="sdk"
REDO_SLUG=""
RESUME_SLUG=""
RESUME_SLUG_ARG=""
RESUME_FROM="check"
# 레인 b 가 기본이다. 레인 a(랩 주도)는 죽이지 않고 소수 경로로 남긴다 —
# 랩이 배신하는 결과를 냈을 때 그것만으로 한 편이 서는 경우가 아직 있다.
LANE="${LANE:-b}"
while [ $# -gt 0 ]; do
  case "$1" in
    --lane)
      LANE="${2:-}"
      case "$LANE" in a|b) ;; *) echo "usage: $0 --lane a|b" >&2; exit 2 ;; esac
      shift 2
      ;;
    --resume)
      # 뒷단(seal-check 이후)만 다시 돈다. 앞단 산출물은 그대로 쓴다.
      #
      # 2026-08-18 에 필요해졌다. 92분을 돌아 4개 언어를 다 쓰고 폴리시까지 끝낸 뒤
      # seal-check 첫 호출에서 세션 한도에 걸렸다.
      #   You've hit your session limit · resets 7:40pm (Asia/Tokyo)
      # 그때 할 수 있는 것이 "처음부터 다시"뿐이었다. 그러면 이미 규격 안에 착지한
      # 네 편을 버리고, 브리프도 새로 만들어 다른 숫자 위에 다시 쓰게 된다.
      RESUME_SLUG="pending"
      shift
      ;;
    --slug)
      RESUME_SLUG_ARG="${2:-}"
      [ -n "$RESUME_SLUG_ARG" ] || { echo "usage: $0 --resume [--slug <s>] [--from check|publish]" >&2; exit 2; }
      shift 2
      ;;
    --from)
      # 어느 단부터 이어 갈지. 기본 check.
      #   check    seal-check 부터 (판정 → 조건부 재집필 → insight-gate → 발행)
      #   publish  발행만. 판정이 이미 끝났고 마지막 단만 실패했을 때
      #
      # publish 를 나눈 이유. 2026-08-18 에 seal-publish 가 529 로 두 번 떨어졌는데,
      # 그때마다 --resume 이 seal-check 를 5분씩 다시 돌렸다. 그 판정은 이미 났고
      # insight-gate 도 PUBLISH 를 냈다.
      case "${2:-}" in
        check|publish) RESUME_FROM="$2" ;;
        *) echo "usage: $0 --resume [--slug <s>] [--from check|publish]" >&2; exit 2 ;;
      esac
      shift 2
      ;;
    --redo)
      REDO_SLUG="${2:-}"
      [ -n "$REDO_SLUG" ] || { echo "usage: $0 [--writer hybrid|gpt-flash|fable|codex|agy|flash|claude|sdk] --redo <slug>" >&2; exit 2; }
      shift 2
      ;;
    --writer)
      WRITER="${2:-}"
      [ -n "$WRITER" ] || { echo "usage: $0 --writer hybrid|gpt-flash|fable|codex|agy|flash|claude|sdk" >&2; exit 2; }
      shift 2
      ;;
    *)
      echo "unknown arg: $1" >&2; exit 2
      ;;
  esac
done
# --resume 대상 확정. --slug 를 안 주면 브리프에서 읽는다.
#
# 원장(life-manager)이 이 스크립트를 고정 명령으로 들고 있어야 하는데, 슬러그가
# 필수면 그 명령을 미리 적을 수 없다. 재개 대상은 언제나 "직전에 실패한 그 글"이고
# 그 정체는 data/column-brief.md 에 있다.
if [ "$RESUME_SLUG" = "pending" ]; then
  if [ -n "$RESUME_SLUG_ARG" ]; then
    RESUME_SLUG="$RESUME_SLUG_ARG"
  else
    RESUME_SLUG="$(awk -F': *' '/^slug:/{gsub(/[" ]/, "", $2); print $2; exit}' \
                    "$PROJECT_DIR/data/column-brief.md" 2>/dev/null)"
    [ -n "$RESUME_SLUG" ] || {
      echo "재개할 대상을 못 찾았다 — data/column-brief.md 에 slug: 이 없다" >&2
      exit 2
    }
  fi
elif [ -n "$RESUME_SLUG_ARG" ]; then
  echo "--slug 는 --resume 과 함께만 쓴다" >&2; exit 2
fi

case "$WRITER" in
  hybrid|gpt-flash|fable|codex|agy|flash|claude|sdk) ;;
  *) echo "unknown writer: $WRITER (hybrid|gpt-flash|fable|codex|agy|flash|claude|sdk)" >&2; exit 2 ;;
esac

# 편집자는 집필자와 다른 모델이어야 한다. 자기 문장에서 자기 군더더기는 잘 안 보인다.
# POLISH=0 으로 편집 패스를 끌 수 있다.
# 2026-08-21 agy 퇴출 — 편집 패스는 claude (opus, SDK 러너 경유).
# sdk 편집부(sonnet)와 모델이 달라 "집필자 ≠ 편집자" 원칙은 유지된다.
if [ -z "${POLISH_ENGINE:-}" ]; then
  POLISH_ENGINE="claude"
fi

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] pipeline: $*"; }

# ── 엔진 래퍼 ──────────────────────────────────────────────────────────
# claude: 판단·폴백 집필. 컨트롤러 레포(스킬 원본)를 읽어야 하므로 --add-dir.
# $1=effort, $2=prompt
run_claude() {
  # 2026-08-21: claude CLI → Claude Agent SDK 러너. LLM 은 CLI 로 부르지 않는다.
  local effort="$1" prompt="$2" model="${3:-$CLAUDE_MODEL}"
  node "${CLAUDE_SDK:-/Users/jangwook/workspace/life-manager/src/cli/claude-sdk-llm.ts}" \
    --model "$model" \
    --effort "$effort" \
    --cwd "$PROJECT_DIR" \
    --add-dir "$CONTROLLER_DIR" \
    "$prompt" </dev/null
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

# sdk: Agent SDK 편집부(sonnet). 편집장 세션 하나가 Task 로 서브에이전트
# (writer low / editor-style·editor-pattern medium)를 위임 호출하고 라운드(최대 2)를
# 스스로 판정한다. 프롬프트는 인자 길이 한계를 피해 파일로 넘긴다.
# $1=lang, $2=prompt
run_sdk_team() {
  local lang="$1" prompt="$2" pfile rc
  pfile="$(mktemp "${TMPDIR:-/tmp}/dp-sdk-prompt.XXXXXX")" || return 1
  printf '%s' "$prompt" > "$pfile"
  node "$PROJECT_DIR/scripts/daily-post-write-sdk.mjs" \
    --lang "$lang" --slug "$SLUG" --prompt-file "$pfile"
  rc=$?
  rm -f "$pfile"
  return "$rc"
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

# local: 100% 무료 로컬 LLM (Qwen 27B/38B). 0원 방어용 윤문/스카우트 래퍼.
run_local() {
  local prompt="$1"
  node "$PROJECT_DIR/../life-manager/src/cli/local-llm.ts" \
    --model "mtplx-qwen38-27b-optimized-quality" \
    --temperature 0.2 \
    --max-tokens 4096 \
    "$prompt" \
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
    # 영어가 마스터 아티클이므로, ko/ja/zh 번역 집필 시 영어를 가리지 않고 참조할 수 있도록 보존한다.
    [ "$other" = "en" ] && continue
    if [ -f "$PROJECT_DIR/src/content/blog/$other/$SLUG.md" ]; then
      mv "$PROJECT_DIR/src/content/blog/$other/$SLUG.md" "$HOLD_DIR/$other.md" || return 1
    fi
  done
  return 0
}

# 한 언어를 쓴다. 기본 fable(low), 실패하면 claude opus medium 으로 폴백.
# 폴백은 언어 단위다. ko 가 codex 로 나오고 ja 만 claude 로 나오는 상태가 정상이며,
# 어느 언어를 누가 썼는지는 $ENGINE_LOG 에 남아 Telegram 까지 간다.
# $1=lang, $2=추가 지시(없으면 빈 문자열)
write_lang() {
  local lang="$1" extra="${2:-}" prompt_file prompt rc target wlabel cur_writer
  prompt_file="$PROMPT_DIR/daily-post-lang-$lang.md"

  cur_writer="$WRITER"
  if [ "$cur_writer" = "hybrid" ] || [ "$cur_writer" = "gpt-flash" ]; then
    if [ "$lang" = "en" ]; then
      cur_writer="$WRITER_EN"
    else
      cur_writer="$WRITER_TRANS"
    fi
  fi
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
    fable)  run_claude "$CLAUDE_WRITE_EFFORT" "$prompt" "$CLAUDE_WRITE_MODEL"; rc=$?
            wlabel="claude/$CLAUDE_WRITE_MODEL:$CLAUDE_WRITE_EFFORT" ;;
    codex)  run_codex "$prompt"; rc=$?; wlabel="codex/$CODEX_MODEL:$CODEX_EFFORT" ;;
    sdk)    run_sdk_team "$lang" "$prompt"; rc=$?
            wlabel="sdk/sonnet:chief+3" ;;
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
  # 지우고 브리프 에서 다시 시작한다.
  if [ "$WRITER" = "claude" ]; then
    log "lang=$lang claude 집필 실패 rc=$rc (폴백 대상 없음)"
    restore_holds
    return 1
  fi
  if [ "$rc" -ne 0 ]; then
    log "lang=$lang $WRITER failed rc=$rc — claude/$CLAUDE_FALLBACK_MODEL effort=$CLAUDE_FALLBACK_EFFORT 로 폴백"
  else
    # fable 은 사용량 한도에 걸려도 종료코드 0 을 준다. 종료코드로는 못 잡고
    # 산출물 부재로만 잡힌다. 그래서 이 분기가 폴백의 주 경로다.
    log "lang=$lang $WRITER rc=0 이나 $lang/$SLUG.md 없음 (한도 소진 가능) — claude 폴백"
  fi
  rm -f "$target"

  run_claude "$CLAUDE_FALLBACK_EFFORT" "$prompt" "$CLAUDE_FALLBACK_MODEL"
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
  record_engine "$lang" "claude/$CLAUDE_FALLBACK_MODEL:$CLAUDE_FALLBACK_EFFORT ($WRITER fallback)"
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
# 본문 분량 — frontmatter 만 뺀다. 코드는 본문이다.
#
# 두 지표를 같이 내는 이유: `wc -w` 는 일본어·중국어에서 무의미하다. 참조 6편을
# 실측하면 ja 107~578, zh 114~564 단어로 나온다. 띄어쓰기가 없으니 한 편이 통째로
# 몇 단어로 세어진다. 그래서 ko·en 은 단어, ja·zh 는 공백 제외 글자수로 잰다.
#
# 코드블록은 빼지 않는다. 빼면 ko 대표글이 2,033 → 1,800 단어로 떨어지는데,
# 재현 명령과 측정 출력이 이 블로그가 파는 것이라 본문 밖으로 밀어낼 것이 아니다.
body_metrics() {
  /usr/bin/python3 - "$1" <<'PYBM' 2>/dev/null || echo "0 0"
import re, sys
t = open(sys.argv[1], encoding='utf-8').read()
t = re.sub(r'\A---.*?^---\s*$', '', t, count=1, flags=re.S | re.M)
print(len(t.split()), len(re.sub(r'\s', '', t)))
PYBM
}

# 언어별 바닥선 — 파손 감지용이지 분량 목표가 아니다 (2026-08-19).
# 원래는 참조 6편 실측 하한(ko 1600w 등)이었는데, sonnet 편집부(WRITER=sdk)가
# 밀도 있게 짧게 쓰는 경향이라 정상 글(ko 1301w)이 게이트에 막혔다. 분량은
# 내용이 정한다로 규범을 바꾸고, 여기는 "산출물이 잘려 나갔다"(엔진 중도 사망,
# polish 폭주)만 잡는 선으로 내렸다. validate-publishing.mjs 의 min 과 같아야
# 한다 — 두 곳이 갈리면 경고 없이 빌드에서 죽는 글이 생긴다.
polish_floor() {
  case "$1" in
    ko) echo "words 700" ;;
    en) echo "words 650" ;;
    ja) echo "chars 2400" ;;
    zh) echo "chars 2000" ;;
    *)  echo "words 0" ;;
  esac
}

polish_lang() {
  local lang="$1" pfile prompt rc before after
  pfile="$PROMPT_DIR/daily-post-polish-$lang.md"
  [ -f "$pfile" ] || { log "polish 프롬프트 없음 lang=$lang — 건너뜀"; return 0; }
  [ "${POLISH:-1}" = "1" ] || return 0

  local target="$PROJECT_DIR/src/content/blog/$lang/$SLUG.md"
  [ -s "$target" ] || return 0
  before=$(wc -c < "$target" | tr -d ' ')
  read -r bw bc <<<"$(body_metrics "$target")"
  read -r unit floor <<<"$(polish_floor "$lang")"
  prompt="$(sed "s/{{SLUG}}/$SLUG/g" "$pfile")"

  log "phase polish lang=$lang (editor=$POLISH_ENGINE)"
  case "$POLISH_ENGINE" in
    local) run_local "$prompt"; rc=$? ;;
    codex) run_codex "$prompt"; rc=$? ;;
    agy)   run_agy "$prompt" "$AGY_REVIEW_MODEL"; rc=$? ;;
    *)     run_claude "$CLAUDE_EFFORT" "$prompt"; rc=$? ;;
  esac

  if [ "$rc" -ne 0 ] || [ ! -s "$target" ]; then
    log "polish lang=$lang 실패(rc=$rc) — 초고 유지"
    return 0
  fi
  after=$(wc -c < "$target" | tr -d ' ')
  read -r aw ac <<<"$(body_metrics "$target")"
  log "polish lang=$lang ${before} → ${after} bytes / ${bw} → ${aw} words / ${bc} → ${ac} chars"
  # 바닥선은 프롬프트가 지키는 것이라 여기서 되돌리지 않는다. 다만 뚫렸다는 사실은 남긴다 —
  # 안 남기면 "왜 요즘 글이 짧지"가 몇 주 뒤에야 사람 눈에 띈다.
  local now
  case "$unit" in words) now="$aw" ;; *) now="$ac" ;; esac
  if [ "$floor" -gt 0 ] && [ "$now" -lt "$floor" ]; then
    log "polish lang=$lang WARN 바닥선 미달 ${now} ${unit} < ${floor}"
  fi
  return 0
}

# ── 사전 점검 ──────────────────────────────────────────────────────────
if [ ! -f "$CLAUDE_SDK" ]; then
  log "FATAL: claude-sdk-llm missing at $CLAUDE_SDK"
  exit 1
fi
if [ "$WRITER" = "codex" ] && [ ! -x "$CODEX_BIN" ]; then
  log "FATAL: codex missing at $CODEX_BIN"
  exit 1
fi

if [ ! -x "$AGY_BIN" ]; then
  log "WARN: agy missing at $AGY_BIN — Gemini 리뷰 없이 진행한다"
fi

mkdir -p "$PROJECT_DIR/data"

# 동시 실행 잠금. data/column-brief.md 등을 공유하므로 두 런이 겹치면 서로를 덮는다.
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

# 언어 격리용 임시 디렉터리. **분기 앞에 만든다.**
#
# 2026-08-18 에 여기서 데였다. 이 줄이 --resume 이 건너뛰는 블록 안에 있었고,
# 그래서 resume 경로에서 HOLD_DIR 가 빈 문자열이었다. 재집필이 hold_siblings 를
# 부르는 순간 `mv ... "$HOLD_DIR/ko.md"` 가 `/ko.md` 가 됐다.
#
#   mv: fastcopy: open() failed (to): /ko.md: Read-only file system
#
# 루트가 읽기 전용이라 실패로 끝났지만, 쓸 수 있는 경로였다면 원고를 엉뚱한 데
# 옮겨 놓고 그 사실을 아무도 몰랐을 것이다.
HOLD_DIR="$(mktemp -d "${TMPDIR:-/tmp}/daily-post-hold.XXXXXX")"

# ── R. --resume: 뒷단만 다시 돈다 ──────────────────────────────────────
#
# 앞단 산출물을 지우기 **전에** 분기한다. 아래 rm 이 브리프를 지우므로
# 순서를 바꾸면 이어서 돌 것이 없어진다.
if [ -n "$RESUME_SLUG" ]; then
  SLUG="$RESUME_SLUG"
  log "phase resume slug=$SLUG — seal-check 부터 다시 돈다"

  # 이어서 돌 수 있는 상태인지 먼저 본다. 없는 것을 있다고 가정하고 진행하면
  # seal-check 가 빈 재료로 판정하고, 그 판정이 발행까지 간다.
  MISSING=""
  [ -s "$BRIEF" ] || MISSING="$MISSING $(basename "$BRIEF")"
  BRIEF_SLUG="$(awk -F': *' '/^slug:/{gsub(/[" ]/, "", $2); print $2; exit}' "$BRIEF" 2>/dev/null)"
  if [ -n "$BRIEF_SLUG" ] && [ "$BRIEF_SLUG" != "$SLUG" ]; then
    log "FATAL: 브리프의 slug 는 '$BRIEF_SLUG' 인데 --resume 은 '$SLUG' 다."
    log "       다른 주제의 브리프로 판정하면 인용과 본문이 갈린다."
    exit 2
  fi
  for L in $LANGS; do
    [ -s "$PROJECT_DIR/src/content/blog/$L/$SLUG.md" ] || MISSING="$MISSING $L"
  done
  if [ -n "$MISSING" ]; then
    log "FATAL: 이어서 돌 수 없다 — 없는 것:$MISSING"
    log "       처음부터 돌리려면 --resume 없이 실행한다."
    exit 2
  fi
  log "resume 확인: 브리프 + 4개 언어 모두 있다"

  # ★ 판정을 미리 지우지 않는다.
  #
  # 첫 판이 `rm -f "$SEAL_CHECK"` 로 시작했다. 그 뒤 seal-check 가 529 로 실패하니
  # 이전 판정이 사라지고 없는 상태가 됐다 — 지우고 못 만든 것이다.
  # 그러면 `--resume <slug> publish` 로 발행만 이어 갈 수도 없다.
  #
  # seal-check 는 산출물을 덮어쓰므로 미리 지울 이유가 없다. 대신 이전 것을
  # 옆에 남겨 둔다 — 재판정이 실패했을 때 사람이 무엇을 잃었는지 볼 수 있게.
  if [ -s "$SEAL_CHECK" ] && [ "$RESUME_FROM" = "check" ]; then
    cp "$SEAL_CHECK" "$SEAL_CHECK.prev" 2>/dev/null || true
    log "resume: 이전 판정을 $(basename "$SEAL_CHECK").prev 로 남긴다"
  fi
  trap 'cleanup' EXIT INT TERM
else

# insight-gate 도 지운다. 목록에서 빠져 있어서 실패한 회차의 낡은 판정이 남았다 —
# 2026-08-18 에 17:52 자 파일이 19:07 까지 살아 있었다. 판정 파일이 이전 회차 것인지
# 이번 것인지는 mtime 을 봐야만 알 수 있고, 그건 사람이 안 본다.
rm -f "$BRIEF" "$SEAL_CHECK" "$GEMINI_REVIEW" "$ENGINE_LOG" "$PROJECT_DIR/data/insight-gate.md"

# ── 0. topic-pick (claude): 오늘 무엇을 쓸지 ───────────────────────────
# 레인 b 만. 레인 a 는 랩 데이터셋이 주제를 정한다.
#
# 셸이 규칙 1을 다시 계산해 모델의 답과 대조한다. 프롬프트만으로는 부족하다 —
# 하드 블록·우선순위 0 으로 지정해도 4주 연속 밀린 기록이 있다.
# 프롬프트는 이유를 주고 집행은 여기서 한다.
TOPIC_PICK="$PROJECT_DIR/data/topic-pick.md"
if [ -z "$REDO_SLUG" ] && [ "$LANE" = "b" ]; then
  # 09:10 의 scout-and-probe.sh 가 오늘 것을 이미 골랐으면 그것을 쓴다.
  #
  # 다시 고르면 안 된다. 09:10 프로브가 그 슬러그를 겨냥해 셀을 돌려 놨는데
  # 여기서 다른 주제를 고르면 그 실험 결과가 통째로 버려지고, 브리프의
  # tested[] 는 다른 주제의 측정으로 채워진다.
  PICK_REUSED=0
  if [ -s "$TOPIC_PICK" ] && [ "$(date -r "$TOPIC_PICK" +%F 2>/dev/null)" = "$(date +%F)" ]; then
    PICK_REUSED=1
    log "topic-pick 재사용 (09:10 산출물) $(awk -F': *' '/^slug:/{print $2; exit}' "$TOPIC_PICK")"
  else
    rm -f "$TOPIC_PICK"
  fi

  # 수집물이 없으면 여기서 모은다. 09:10 잡이 죽었거나 아직 안 붙었을 때다.
  HARVEST_DIR="$PROJECT_DIR/data/scout/$(date +%F)"
  if [ "$PICK_REUSED" -eq 0 ] && [ ! -s "$HARVEST_DIR/harvest.verified.json" ]; then
    log "phase scout (수집물 없음 — 임시 경로)"
    bash "$PROJECT_DIR/scripts/scout.sh" web >/dev/null 2>&1 || log "scout web 실패 — 비치명"
    bash "$PROJECT_DIR/scripts/scout.sh" x    >/dev/null 2>&1 || log "scout x 실패 — 비치명"
    if [ -s "$HARVEST_DIR/harvest.json" ]; then
      bash "$PROJECT_DIR/scripts/verify-urls.sh" "$HARVEST_DIR/harvest.json" \
        >/dev/null 2>&1 || log "verify-urls 실패 — 비치명"
    fi
    if [ -s "$HARVEST_DIR/harvest.verified.json" ]; then
      node "$PROJECT_DIR/scripts/backlog-merge.mjs" "$HARVEST_DIR/harvest.verified.json" \
        --out "$PROJECT_DIR/data/backlog-slate.json" >/dev/null 2>&1 \
        || log "backlog-merge 실패 — 비치명"
    fi
  fi

  if [ "$PICK_REUSED" -eq 1 ]; then
    PICK_RC=0
  else
    log "phase topic-pick (claude/$CLAUDE_MODEL)"
    run_claude "$CLAUDE_EFFORT" "$(cat "$PROMPT_DIR/topic-pick.md")"
    PICK_RC=$?
  fi
  if [ "$PICK_RC" -ne 0 ] || [ ! -s "$TOPIC_PICK" ]; then
    log "topic-pick 실패(rc=$PICK_RC) — 브리프가 백로그에서 직접 고른다"
    rm -f "$TOPIC_PICK"
  elif grep -q '^SKIP' "$TOPIC_PICK"; then
    log "SKIP $(head -n 1 "$TOPIC_PICK")"
    exit 0
  else
    # 규칙 1 재계산. 게이트를 못 읽으면 닫는다 — 파싱 버그가 곧 잘못된 주제다.
    if ! /usr/bin/python3 "$PROJECT_DIR/scripts/check-forced-slug.py" \
           --pick "$TOPIC_PICK" \
           --priority "$PROJECT_DIR/data/priority-slugs.json" \
           --backlog "$PROJECT_DIR/data/topic-backlog.json" \
           --posts "$PROJECT_DIR/src/content/blog/ko"; then
      log "규칙 1 위반 — 강제 슬러그를 건너뛰었다. 멈춘다"
      exit 1
    fi
    log "topic-pick $(awk -F': *' '/^slug:/{print $2; exit}' "$TOPIC_PICK") ($(awk -F': *' '/^pick-source:/{print $2; exit}' "$TOPIC_PICK"))"
  fi
fi

# ── 1. brief (claude): 취재 플랜 ───────────────────────────────────────
if [ -n "$REDO_SLUG" ]; then
  log "phase refact slug=$REDO_SLUG (claude/$CLAUDE_MODEL)"
  CORE_PROMPT="$(sed "s/{{SLUG}}/$REDO_SLUG/g" "$PROMPT_DIR/daily-post-refact.md")"
else
  case "$LANE" in
    a) CORE_PROMPT_FILE="$PROMPT_DIR/daily-post-core-lab.md" ;;
    *) CORE_PROMPT_FILE="$PROMPT_DIR/daily-post-brief.md" ;;
  esac
  log "phase brief lane=$LANE (claude/$CLAUDE_MODEL) prompt=$(basename "$CORE_PROMPT_FILE")"
  CORE_PROMPT="$(cat "$CORE_PROMPT_FILE")"
fi
run_claude "$CLAUDE_EFFORT" "$CORE_PROMPT"
CORE_RC=$?
if [ "$CORE_RC" -ne 0 ]; then
  log "core claude failed rc=$CORE_RC"
  exit "$CORE_RC"
fi
if [ ! -f "$BRIEF" ]; then
  log "브리프 missing after core phase"
  exit 1
fi
if grep -q '^SKIP' "$BRIEF"; then
  log "SKIP $(head -n 1 "$BRIEF")"
  exit 0
fi

SLUG="$(awk -F': *' '/^slug:/{gsub(/[" ]/, "", $2); print $2; exit}' "$BRIEF")"
if [ -z "$SLUG" ]; then
  log "브리프 has no slug:"
  head -n 20 "$BRIEF"
  exit 1
fi
log "slug=$SLUG"

if [ -n "$REDO_SLUG" ] && [ "$SLUG" != "$REDO_SLUG" ]; then
  log "refact returned slug=$SLUG but --redo asked for $REDO_SLUG"
  exit 1
fi

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
# 언어 집필보다 먼저 만든다. 브리프 의 hero: 가 실제 경로가 된 뒤에 네 언어가
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

# 브리프 의 hero: 줄을 실제 경로로 바꾼다. TODO 로 남으면 네 언어가 각자
# 다른 값을 적거나 heroImage 를 통째로 빠뜨린다.
if [ -n "$HERO_REL" ]; then
  awk -v rel="$HERO_REL" '
    /^hero:/ && !done { print "hero: \x27" rel "\x27"; done=1; next }
    { print }
    END { if (!done) print "hero: \x27" rel "\x27" }
  ' "$BRIEF" > "$BRIEF.tmp" && mv "$BRIEF.tmp" "$BRIEF"
  log "브리프 hero → $HERO_REL"
fi

# ── 2. Master English 집필 → 다국어 번역/현지화 (ko ja zh) ─────────────────
# 영어(en)를 먼저 마스터 아티클로 완성하고, 이를 정본으로 삼아
# ko, ja, zh로 전문 번역 및 현지화(transcreation)를 진행한다.
for LANG in $LANGS; do
  log "phase lang=$LANG (writer=$WRITER)"
  write_lang "$LANG" "" || exit 1
done

# ── 3. 1차 리뷰: 비치명 ────────────────────────────────────────────────
# 싸고 빠른 모델에게 사실·인용·링크·frontmatter 같이 기계적으로 대조 가능한
# 층을 훑게 하고, 문체 판정은 다음 단계 opus 에 맡긴다.
# 1차 리뷰어는 집필 엔진과 달라야 한다. 자기 문장을 자기가 읽으면 덜 걸린다.
# 2026-08-21: agy 퇴출 — 리뷰는 항상 claude sonnet (SDK 러너 경유).
REVIEWER1="claude"
if [ "$REVIEWER1" = "agy" ] && [ -x "$AGY_BIN" ]; then
  log "phase review-1 (reviewer=$REVIEWER1, writer=$WRITER)"
  GEMINI_PROMPT="$(sed "s/{{SLUG}}/$SLUG/g" "$PROMPT_DIR/daily-post-review-gemini.md")"
  run_agy "$GEMINI_PROMPT" "$AGY_REVIEW_MODEL"; REVIEW1_RC=$?; REVIEWER1_LABEL="$AGY_REVIEW_MODEL"
  if [ "$REVIEW1_RC" -ne 0 ] || [ ! -f "$GEMINI_REVIEW" ]; then
    log "review-1 실패(rc=$REVIEW1_RC) 또는 산출 없음 — opus 단독 리뷰로 진행"
    rm -f "$GEMINI_REVIEW"
  fi
elif [ "$REVIEWER1" = "claude" ] && [ -f "$CLAUDE_SDK" ]; then
  log "phase review-1 (reviewer=$REVIEWER1/sonnet, writer=$WRITER)"
  GEMINI_PROMPT="$(sed "s/{{SLUG}}/$SLUG/g" "$PROMPT_DIR/daily-post-review-gemini.md")"
  run_claude "low" "$GEMINI_PROMPT" "sonnet"; REVIEW1_RC=$?; REVIEWER1_LABEL="claude/sonnet"
  if [ "$REVIEW1_RC" -ne 0 ] || [ ! -f "$GEMINI_REVIEW" ]; then
    log "review-1 실패(rc=$REVIEW1_RC) 또는 산출 없음 — opus 단독 리뷰로 진행"
    rm -f "$GEMINI_REVIEW"
  fi
fi
REVIEWER1_LABEL="${REVIEWER1_LABEL:-none}"

fi   # --resume 분기 끝. 여기부터는 두 경로가 합류한다.

# --resume 은 앞단의 리뷰 산출물을 그대로 쓴다. 지난 회차의 review-gemini.md 가
# 남아 있으면 그것이 이번 판정의 입력이 된다 — 같은 슬러그의 같은 본문에 대한
# 메모라 유효하다. 없으면 seal-check 가 단독 리뷰로 넘어간다.
if [ -n "$RESUME_SLUG" ]; then
  REVIEWER1_LABEL="${REVIEWER1_LABEL:-이전 회차}"
  if [ -f "$GEMINI_REVIEW" ]; then
    log "resume: 이전 회차의 review-1 메모를 쓴다 ($(date -r "$GEMINI_REVIEW" +%H:%M))"
  else
    log "resume: review-1 메모가 없다 — seal-check 단독 리뷰"
  fi
fi

if [ "$RESUME_FROM" = "publish" ]; then
  # 판정을 건너뛴다. 다만 **판정이 실제로 있었는지는 확인한다** —
  # 없는 판정을 통과로 가정하고 발행하면 게이트가 있으나 마나다.
  [ -s "$SEAL_CHECK" ] || { log "FATAL: $SEAL_CHECK 가 없다. --resume <slug> check 로 판정부터 받는다"; exit 2; }
  GATE_FILE="$PROJECT_DIR/data/insight-gate.md"
  [ -s "$GATE_FILE" ] || { log "FATAL: insight-gate 판정이 없다. --resume <slug> check 로 받는다"; exit 2; }
  # 제목 줄이 먼저 오는 경우가 있어 앞 20줄에서 판정을 찾는다 (아래 게이트와 같은 규칙).
  GATE_LINE="$(head -n 20 "$GATE_FILE" | /usr/bin/grep -m1 -E '^(PUBLISH|REWRITE|HOLD)' || true)"
  if [ -z "$GATE_LINE" ]; then
    log "FATAL: insight-gate 의 판정 줄을 못 읽었다 — --resume <slug> check 로 다시 받는다"
    exit 2
  fi
  case "$GATE_LINE" in
    PUBLISH*) ;;
    *) log "FATAL: insight-gate 가 PUBLISH 가 아니다 — $GATE_LINE"; exit 2 ;;
  esac
  log "resume publish: seal-check($(date -r "$SEAL_CHECK" +%H:%M)) · insight-gate PUBLISH($(date -r "$GATE_FILE" +%H:%M)) 확인 — 발행만 한다"
else

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

# ── 5.5 insight-gate (claude xhigh): 발행할 값이 있는가 ────────────────
# 앞의 게이트들은 "틀렸는가"를 본다. 이 게이트만 "쓸 값이 있는가"를 본다.
# HOLD 면 발행하지 않고 랩 데이터셋을 미소비 상태로 남겨 다음 주기로 넘긴다.
# 정확하지만 할 말이 없는 글이 나가는 것을 막는 유일한 장치다.
INSIGHT_GATE="$PROJECT_DIR/data/insight-gate.md"
rm -f "$INSIGHT_GATE"
log "phase insight-gate (claude/$CLAUDE_MODEL effort=$CLAUDE_REVIEW_EFFORT)"
GATE_PROMPT="$(sed "s/{{SLUG}}/$SLUG/g" "$PROMPT_DIR/daily-post-insight-gate.md")"
run_claude "$CLAUDE_REVIEW_EFFORT" "$GATE_PROMPT"
GATE_RC=$?

if [ "$GATE_RC" -ne 0 ] || [ ! -s "$INSIGHT_GATE" ]; then
  # 게이트가 답을 못 내면 통과시키지 않는다. 판정 없는 발행은 게이트가 없는 것과 같다.
  log "insight-gate 판정 없음(rc=$GATE_RC) — 발행 보류"
  "$CONTROLLER_DIR/sh/send-telegram.sh" "⏸ [jangwook.net] ${SLUG}
통찰 게이트가 판정을 내지 못해 발행을 보류했다(rc=${GATE_RC}).
랩 데이터셋은 미소비로 남는다. data/insight-gate.md 확인." >/dev/null 2>&1 || true
  exit 1
fi

# 판정 줄을 찾는다.
#
# 프롬프트는 "First line is exactly one of" 라고 지시하는데, 모델은 제목 줄을 먼저 쓴다.
# 2026-08-18 실물이 그랬다.
#
#   1: # insight-gate — gsc-platform-properties-...
#   2:
#   3: PUBLISH
#
# `head -n 1` 로 읽으면 판정이 제목이 되고, 그 값은 ^REWRITE 도 ^HOLD 도 아니라
# **두 분기를 모두 통과해 발행까지 간다.** 이번에는 3행이 PUBLISH 라 결과가 맞았지만,
# 3행이 HOLD 였어도 똑같이 발행했다. 게이트가 fail-open 이었다.
#
# 앞 20줄에서 판정으로 읽히는 첫 줄을 찾는다. 없으면 **닫는다** —
# 게이트 출력을 못 읽으면 통과시키지 않는다.
GATE_VERDICT="$(head -n 20 "$INSIGHT_GATE" | /usr/bin/grep -m1 -E '^(PUBLISH|REWRITE|HOLD)' || true)"
if [ -z "$GATE_VERDICT" ]; then
  log "insight-gate 판정 줄을 못 읽었다 — 발행하지 않는다"
  log "  앞 5줄: $(head -n 5 "$INSIGHT_GATE" | tr '\n' '|')"
  "$CONTROLLER_DIR/sh/send-telegram.sh" "⏸ [jangwook.net] ${SLUG}
통찰 게이트의 판정 줄(PUBLISH|REWRITE|HOLD)을 찾지 못해 발행을 보류했다.
data/insight-gate.md 확인." >/dev/null 2>&1 || true
  exit 0
fi
log "insight-gate 판정: $GATE_VERDICT"

# REWRITE — 재료는 있는데 초고가 안 썼다. 지목된 언어만 다시 쓰고 한 번 더 판정한다.
# 재판정은 한 번뿐이다. 게이트와 집필이 서로를 물고 도는 것을 막는다.
if printf '%s' "$GATE_VERDICT" | grep -q '^REWRITE'; then
  GATE_LANGS="$(printf '%s' "$GATE_VERDICT" | sed -E 's/^REWRITE: *//; s/ *—.*//' | tr ',' ' ')"
  GATE_BODY="$(cat "$INSIGHT_GATE")"
  log "insight-gate $GATE_VERDICT — 지목 언어 재집필"
  for LANG in $GATE_LANGS; do
    case " $LANGS " in
      *" $LANG "*) ;;
      *) log "insight-gate 가 모르는 언어 지목=$LANG — 무시"; continue ;;
    esac
    log "phase insight-rewrite lang=$LANG (writer=$WRITER)"
    write_lang "$LANG" "$(cat "$PROMPT_DIR/daily-post-lang-fix.md" 2>/dev/null || true)

통찰 게이트가 이 언어를 되돌렸다. 지시는 실행형이다. 그대로 따른다.
$GATE_BODY" || exit 1
  done

  log "phase insight-gate 재판정 (claude/$CLAUDE_MODEL effort=$CLAUDE_REVIEW_EFFORT)"
  rm -f "$INSIGHT_GATE"
  run_claude "$CLAUDE_REVIEW_EFFORT" "$GATE_PROMPT"
  if [ ! -s "$INSIGHT_GATE" ]; then
    log "재판정 산출 없음 — 발행 보류"
    "$CONTROLLER_DIR/sh/send-telegram.sh" "⏸ [jangwook.net] ${SLUG}
재집필 후 통찰 게이트가 판정을 내지 못해 보류했다." >/dev/null 2>&1 || true
    exit 1
  fi
  GATE_VERDICT="$(head -n 1 "$INSIGHT_GATE")"
  # 두 번째도 REWRITE 면 더 돌리지 않는다. 초고가 못 고치는 문제라는 뜻이다.
  if printf '%s' "$GATE_VERDICT" | grep -q '^REWRITE'; then
    GATE_VERDICT="HOLD: 재집필 후에도 통찰 게이트가 REWRITE — 초고로 못 메우는 문제"
  fi
fi

if printf '%s' "$GATE_VERDICT" | grep -q '^HOLD'; then
  log "insight-gate $GATE_VERDICT — 발행하지 않는다"
  "$CONTROLLER_DIR/sh/send-telegram.sh" "⏸ [jangwook.net] ${SLUG} 발행 보류
${GATE_VERDICT}

네 언어 초고는 작업트리에 남아 있고 랩 데이터셋은 미소비 상태다.
판정 근거: data/insight-gate.md" >/dev/null 2>&1 || true
  exit 0
fi
# 여기 오면 REWRITE 도 HOLD 도 아니었다는 뜻이고, 판정 줄이 없으면 위에서 이미 나갔다.
log "insight-gate 통과 ($GATE_VERDICT)"

fi   # RESUME_FROM=publish 분기 끝

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

# 쓴 랩 데이터셋을 소비 처리한다. 안 하면 다음 발행일에 같은 실험이 다시 뽑힌다.
# 발행이 성공한 뒤에만 표시한다. HOLD 나 실패로 끝나면 미소비로 남아 다음 주기가 쓴다.
LAB_IDS="$(awk '/^lab:/{f=1;next} f && /^ *- /{gsub(/^ *- */,""); print; next} f && !/^ *- /{f=0}' "$BRIEF" 2>/dev/null)"
if [ -n "$LAB_IDS" ]; then
  for LID in $LAB_IDS; do
    /usr/bin/python3 - "$PROJECT_DIR/data/labs/index.json" "$LID" "$SLUG" <<'PY' 2>/dev/null || true
import json, sys
path, lab_id, slug = sys.argv[1], sys.argv[2], sys.argv[3]
try:
    rows = json.load(open(path))
except Exception:
    rows = []
hit = False
for r in rows:
    if r.get("id") == lab_id:
        r["consumed"] = True
        r["consumed_by"] = slug
        hit = True
if hit:
    json.dump(rows, open(path, "w"), ensure_ascii=False, indent=2)
PY
    log "lab consumed → $LID"
  done
fi

log "done slug=$SLUG"
exit 0
