#!/bin/bash
# scout.sh [x|web] — 재료를 모으기만 한다. 판단하지 않는다.
#
# 수집과 판정을 나눈 이유. 한 모델에게 "찾아서 좋은 걸 골라라"라고 시키면
# 무엇을 봤는지가 남지 않는다. 여기는 본 것을 전부 뱉고, 살아 있는지는
# verify-urls.sh 가, 무엇을 쓸지는 topic-pick 이 정한다.
#
# 출력  data/scout/<date>/harvest.json   {"items":[{url, points_to, claim, ...}]}
#
# 수집 실패는 비치명이다. x 가 쿼터로 죽어도 web 만으로 하루는 돈다.
set -uo pipefail

MODE="${1:-web}"
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CONTROLLER_DIR="/Users/jangwook/workspace/claude-controller"
DATE="$(date +%F)"
OUT_DIR="$PROJECT_DIR/data/scout/$DATE"
mkdir -p "$OUT_DIR"

GROK_BIN="${GROK_BIN:-/Users/jangwook/.grok/bin/grok}"
GEMINI_LLM="${GEMINI_LLM:-/Users/jangwook/workspace/life-manager/src/cli/gemini-llm.ts}"
CLAUDE_BIN="${CLAUDE_BIN:-/Users/jangwook/.local/bin/claude}"

log() { printf '%s scout[%s] %s\n' "$(date '+%H:%M:%S')" "$MODE" "$*" >&2; }

# ── x 모드 ─────────────────────────────────────────────────────────────
# X 는 레퍼런스가 아니라 단서다. 그래서 points_to(그 게시물이 가리키는 1차 출처)를
# 반드시 받는다. 그게 없는 항목은 verify-urls.sh 가 떨어뜨린다 —
# x.com 자신은 봇에 403 을 주므로 확인할 방법이 없다.
#
# grok CLI 에 X 전용 검색 도구는 없다. web_search + 자연어 지시에 의존한다.
scout_x() {
  [ -x "$GROK_BIN" ] || { log "grok 없음 $GROK_BIN — 건너뜀"; return 0; }

  local prompt
  prompt='X(Twitter) を検索し、直近48時間で【バズ量・エンゲージメント(RT/いいね/引用)が高く、開発者やCTOの間で大きな議論を呼んでいる話題】を中心に、「Webアーキテクチャ・エンタープライズ刷新・CDP/DSR/会員基盤・技術SEO・Core Web Vitals・AIエージェント(MCP、ハーネス設計、コンテキスト最適化)」に関する、一次情報を指している高バズ投稿を12件選べ。

選定基準:
① その投稿が公式ドキュメント・リリースノート・仕様・GitHub リポジトリ・計測結果のいずれかを指していること
② エンジニアコミュニティで高い関心・リツイート・議論を集めているバイラルな話題を最優先
③ 情報商材・SEO業者の宣伝・根拠のない断定は除外
④ 「感想だけ」で一次情報を指していない投稿は除外

各項目について、その投稿が指している一次情報の URL を points_to に必ず入れる。
見つからなければその項目を出力しない。投稿自体の URL は url に入れる。

出力は次のJSON配列のみ。コードブロックなし、説明なし:
[{"url":"https://x.com/...","points_to":"https://<一次情報のURL>","author":"@...","claim":"その投稿が主張していること1行","observed_at":"YYYY-MM-DD"}]'

  # 402 가드. wbai/scripts/x_scout.sh 41~49행 이식.
  # 소진 판정은 xAI 오류 메시지 고유 문구로만 한다 — 본문에 우연히 섞인 "402" 오탐을 막는다.
  local out rc
  out="$("$GROK_BIN" -p "$prompt" 2>&1)"; rc=$?
  if printf '%s' "$out" | grep -qiE "usage balance exhausted|status 402 Payment Required|Payment Required.*402"; then
    log "QUOTA_EXHAUSTED — web 모드만으로 진행한다"
    echo "[]"
    return 0
  fi
  if [ "$rc" -ne 0 ]; then
    log "grok rc=$rc — 빈 결과로 둔다"
    echo "[]"
    return 0
  fi
  printf '%s' "$out"
}

# ── web 모드 ───────────────────────────────────────────────────────────
# 소스 목록은 SKILL.md 의 레인 B 목록을 축자로 박는다. 참조로 두면
# 모델이 안 열고, 안 열었다는 사실이 출력에 안 남는다.
scout_web() {
  local prompt
  prompt='WebSearch を使って、直近7日間で【検索需要・Hacker News・GitHub Trending・Reddit (r/LocalLLaMA, r/webdev) で話題性とバズ量が最も高い一次情報】を12件集めよ。判断はするな。集めるだけだ。

対象ソース(この一覧の中から探す):
- GitHub Trending で急上昇している AI/Web フレームワーク・ツール・MCP 実装リポジトリ
- Google Search Central / Chrome DevRel の最新発表(AI Overview, Core Web Vitals, クロール)
- W3C / WAI(WCAG、ARIA、a11y 標準の変更)
- モデル提供元の一次文書: Anthropic・OpenAI・Google のツール定義、コンテキスト管理、エージェント設計文書とリリースノート
- エージェント CLI(Claude Code・Codex ほか)の CHANGELOG、ハーネス設計、コンテキスト最適化の実践知
- エンタープライズ Web 刷新、CDP・DSR(データプライバシー)、会員・認証基盤のアーキテクチャ議論
- 評価・測定: プロンプトやハーネスの変更を数値で測った公開実験

除外: ニュースサイトの二次記事、まとめ記事、ベンダーのマーケティング資料。
一次情報そのものの URL を出す。それを紹介した記事の URL ではない。

各項目:
- url          一次情報そのもの
- points_to    null(web モードでは url が既に一次情報だ)
- claim        そこに書いてあること1行。要約であって評価ではない
- publisher    出した組織
- observed_at  その文書に載っている日付。なければ null

出力は次のJSON配列のみ。コードブロックなし、説明なし:
[{"url":"...","points_to":null,"claim":"...","publisher":"...","observed_at":"YYYY-MM-DD"}]'

  # LLM 은 CLI 로 부르지 않는다 (2026-08-21 규칙) — claude CLI·agy 모두 제거,
  # Gemini API(genai) 직호출. Key 1 실패 시 Key 2 로 폴백.
  local out rc
  out="$(node "$GEMINI_LLM" \
    --env-file "$CONTROLLER_DIR/.env" \
    --api-key-env GEMINI_API_KEY_FREE \
    --model gemini-3.7-flash --thinking high \
    "$prompt" </dev/null 2>&1)"; rc=$?

  if [ "$rc" -ne 0 ] || [ -z "${out// }" ]; then
    log "scout_web Key 1 failed (rc=$rc) — Key 2 로 폴백"
    out="$(node "$GEMINI_LLM" \
      --env-file "$CONTROLLER_DIR/.env" \
      --api-key-env GEMINI_API_KEY_FREE_2 \
      --model gemini-3.7-flash --thinking high \
      "$prompt" </dev/null 2>&1)"; rc=$?
    [ "$rc" -eq 0 ] || { log "gemini Key 2 fallback rc=$rc"; echo "[]"; return 0; }
  fi
  printf '%s' "$out"
}

case "$MODE" in
  x)   RAW="$(scout_x)" ;;
  web) RAW="$(scout_web)" ;;
  *)   echo "usage: $0 x|web" >&2; exit 2 ;;
esac

# 모델은 JSON 만 내라고 해도 코드펜스와 인사말을 붙인다. 첫 '[' 부터 마지막 ']' 까지만 취한다.
# 파싱에 실패하면 빈 배열이다 — 반쯤 읽힌 JSON 을 다음 단계로 넘기지 않는다.
# heredoc 이 stdin 을 차지하므로 원문은 파일로 넘긴다.
RAW_FILE="$OUT_DIR/.raw-$MODE.txt"
printf '%s' "$RAW" > "$RAW_FILE"

/usr/bin/python3 - "$OUT_DIR/harvest.json" "$MODE" "$RAW_FILE" <<'PY'
import json, re, sys
path, mode, raw_file = sys.argv[1], sys.argv[2], sys.argv[3]
raw = open(raw_file, encoding='utf-8', errors='replace').read()
items = []
m = re.search(r'\[.*\]', raw, re.S)
if m:
    try:
        parsed = json.loads(m.group(0))
        if isinstance(parsed, list):
            items = [i for i in parsed if isinstance(i, dict) and i.get('url')]
    except json.JSONDecodeError as e:
        print(f'scout: JSON 파싱 실패 {e}', file=sys.stderr)
for i in items:
    i.setdefault('points_to', None)
    i['source_mode'] = mode
try:
    old = json.load(open(path))
    prev = old.get('items', [])
except Exception:
    prev = []
seen = {i['url'] for i in prev}
merged = prev + [i for i in items if i['url'] not in seen]
json.dump({'items': merged}, open(path, 'w'), ensure_ascii=False, indent=2)
print(f'scout[{mode}]: {len(items)}건 수집, 누적 {len(merged)}건 → {path}', file=sys.stderr)
PY
