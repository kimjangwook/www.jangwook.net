#!/bin/bash
# X 정보 수집 — Kim Jangwook(@Kim_Jangwook) 상호작용용 (Grok CLI X 검색, 1일 3회)
# 사용법: x-scout.sh replies|follows|likes
# 페르소나 전제 (docs/persona-kim-jangwook.md): 실측주의 웹 개발자·EM. 일본어 웹개발/
# 技術SEO/a11y/GEO/프론트엔드 클러스터와 교류. 스팸·정보상재·과장 마케팅 계열 제외.
# wbai/scripts/x_scout.sh 모델 이식 (2026-07-18).
set -euo pipefail
export PATH="$HOME/.grok/bin:$PATH"

MODE="${1:-replies}"

case "$MODE" in
replies)
    PROMPT='
X(Twitter)内を検索し、日本語のWeb開発クラスタ(技術SEO・アクセシビリティ/a11y・Core Web Vitals・構造化データ・GEO/AI検索・フロントエンド)で直近12時間のエンゲージメント上位投稿を6件選べ。
選定基準: ①いいね50以上(このニッチは投資クラスタより小さい) ②話題が「Web最適化の実務・検索/AI検索の変化・a11y・パフォーマンス・開発現場の悩み」のいずれか ③情報商材・SEO業者の宣伝・根拠のない断定(「これで順位爆上げ」等)は除外。
各投稿に、実測主義のWeb開発者(自分のサイトで測ってから語る人、韓国人で日本語発信、謙虚だが実データを持っている)が誠実に一言添えられる「切り口」を1行で考えよ。実体験・実測データに繋がる切り口を優先。
さらに各投稿を "reply"(会話に一言添える) か "quote"(引用して自分の実測・経験を重ねる論評にする) に分類せよ。
出力は次のJSON配列のみ(コードブロックなし、説明なし):
[{"url":"https://x.com/...","author":"@...","summary":"投稿要旨1行","likes":概数,"angle":"切り口1行","type":"reply|quote"}]'
    ;;
follows)
    PROMPT='
X(Twitter)内を検索し、日本語のWeb開発クラスタで「実測主義のWeb開発者・EM」がフォローすべきアカウントを5件選べ。
選定基準: ①技術SEO・a11y・Web標準・パフォーマンス・AI検索(GEO/AIO)など実務コンテンツを継続発信 ②直近1週間もアクティブ ③SEO業者の集客アカウント・情報商材・「フォロバ100」系は除外 ④大型(フォロワー1万+、リプライで認知を得る先)と中堅(数千、相互交流が見込める先)を混ぜる。
出力は次のJSON配列のみ(コードブロックなし、説明なし):
[{"handle":"@...","followers":概数,"focus":"発信内容1行","reason":"フォローすべき理由1行"}]'
    ;;
likes)
    PROMPT='
X(Twitter)内を検索し、日本語のWeb開発クラスタで直近12時間の投稿から「実測・実務に根ざした良質な投稿」を8件選べ。
対象: 実際に測ったパフォーマンス改善・a11yの実践知見・検索/AI検索の一次情報共有・開発現場の正直な失敗談。宣伝・煽り・無根拠な断定は除外。
これは「いいね」を付けに行くリストである(リプライ不要の軽い交流)。
出力は次のJSON配列のみ(コードブロックなし、説明なし):
[{"url":"https://x.com/...","author":"@...","summary":"投稿要旨1行"}]'
    ;;
*)
    echo "usage: x-scout.sh replies|follows|likes" >&2; exit 1
    ;;
esac

grok -p "$PROMPT" 2>/dev/null
