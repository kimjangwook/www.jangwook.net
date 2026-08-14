---
title: '本番robots.txtがgitより長い日のGEO作業'
description: '公式ガイドはllms.txtを無視すると書く。今日測ったのは本番106行と、コードレビューに乗らないプロパティ制御だ。'
pubDate: '2026-08-14'
updatedDate: '2026-08-14'
heroImage: '../../../assets/blog/official-geo-subtraction-gsc-control-2026/hero.png'
tags:
  - SEO
  - GEO
  - AIO
  - Search-Console
faq:
  - question: 'llms.txtを置けばAI Overviewに有利か'
    answer: 'ならない。Search Centralの生成AI最適化ガイドは、Google Searchがこのファイルを無視し、作っても可視性や順位に得も損もないと書いている。別のサービスが読むなら残してよいが、Google Searchの作業ではない。'
  - question: '生成検索専用のschema.orgはあるか'
    answer: '公式文書はないとしている。構造化データはリッチリザルトの資格には今も使う。生成検索のための専用マークアップを足す必要はなく、順位や引用を保証もしない。'
  - question: 'Search Consoleの生成AI制御を切ると通常検索からも落ちるか'
    answer: 'ヘルプは、この制御が特定の生成AI機能の表示にだけ効き、検索の他の部分の順位・掲載シグナルではないと書く。学習制限はGoogle-Extended、検索全体からの除外はnoindex。制御UIはまだ一部プロパティへの段階公開だ。'
relatedPosts:
  - slug: robots-snippet-controls-ai-overviews-2026
    score: 0.88
    reason:
      ko: 페이지에 nosnippet을 심으면 AI Overview 입력에서 빠진다. 오늘은 그 위층, Search Console 속성에 생긴 스위치를 본다.
      ja: ページに nosnippet を置くと AI Overview の入力から外れる。今日はその上、Search Console プロパティに付いたスイッチを見る。
      en: nosnippet takes a page out of AI Overview input. This one looks at the switch that landed above that, on the Search Console property.
      zh: 页面加上 nosnippet，就会从 AI Overview 的输入里拿掉。这篇看的是更上面那层：Search Console 资源上的开关。
  - slug: ai-crawler-control-robots-txt-llms-txt-2026
    score: 0.86
    reason:
      ko: 학습 봇과 검색 봇을 가르는 설계는 그쪽에 있다. 오늘은 그 robots.txt가 라이브에서 CDN 접두를 입고 길어진 상태를 잰다.
      ja: 学習ボットと検索ボットを分ける設計はあちらにある。今日はその robots.txt がライブで CDN 接頭辞を着て長くなった状態を測る。
      en: Splitting training bots from search bots is that post. This one measures the live file after a CDN prefix made it longer than git.
      zh: 训练爬虫和搜索爬虫怎么分开，写在那篇。这篇量的是线上 robots.txt 被 CDN 前缀拉长之后。
  - slug: faqpage-deprecation-ai-citation-2026
    score: 0.74
    reason:
      ko: 검증기를 통과한 FAQPage가 리치 결과에서는 이미 끝났다. 생성형 검색용 스키마를 하나 더 얹는 일도 같은 함정이다.
      ja: 検証を通った FAQPage はリッチリザルトではもう終わっている。生成検索用スキーマを足すのも同じ穴だ。
      en: A valid FAQPage already stopped producing a rich result. Adding a schema just for generative search is the same hole.
      zh: 通过校验的 FAQPage，富结果这边已经收场了。再为生成式搜索加一种 schema，是同一个坑。
  - slug: validate-structured-data-ci-jsonld-2026
    score: 0.7
    reason:
      ko: CI에서 JSON-LD를 막는 일은 리치 결과 쪽 일이다. 공식은 그 마크업을 생성형 검색의 입장권으로 보지 않는다.
      ja: CI で JSON-LD を止める仕事はリッチリザルト側だ。公式はそのマークアップを生成検索の入場券にしていない。
      en: Blocking bad JSON-LD in CI is still a rich-result job. Official text does not treat that markup as a ticket into generative search.
      zh: 在 CI 里拦住坏 JSON-LD，仍是富结果的事。官方没把这套标记当成生成式搜索的门票。
  - slug: json-ld-graph-entity-linking-2026
    score: 0.64
    reason:
      ko: 엔티티를 @graph로 묶는 작업은 남는다. 이유를 "AI Overview 전용 최적화"로 쓰면 공식 문서와 어긋난다.
      ja: エンティティを @graph で結ぶ仕事は残る。理由を「AI Overview 専用最適化」と書くと公式とずれる。
      en: Linking entities in an @graph still makes sense. Calling it an AI Overview-only optimization does not match the official guide.
      zh: 用 @graph 串实体，这件事还在。但若写成“AI Overview 专用优化”，就和官方指南拧着。
---

リポジトリの `public/robots.txt` を直したつもりだった。本番に `curl` したら行数が違った。45行と106行。バイトは 1,101 と 2,937。

Search Console には入っていない。公開面だけ見た。

![公式GEOは引き算リストとスイッチ一つ](../../../assets/blog/official-geo-subtraction-gsc-control-2026/hero.png)

## 子が追従する条件

親ドメインのプロパティで誰かが「除外」を押すと、個別設定していない URL-prefix の子はそれに従う。ブログを `https://example.com/blog/` に分けていても、親が先に手を入れれば子は既定で追従する。

HTMLをいくら整えても、robots.txtをいくら分けても、そこの値が切れていれば生成機能の資格はその層で終わる。Search Console の [Search generative AI control](https://support.google.com/webmasters/answer/16908024)。経路は Settings > Search generative AI。

選択肢は三つ。含める。除外する。親に従う。含めが全プロパティの既定値。除外すると AI Overview、AI Mode、Discover の生成機能からリンクもグラウンディング入力も消える。その機能からのインプレッションとトラフィックも消える。

> This control only affects whether your content can appear in certain Search generative AI features; this control isn't used as a ranking or inclusion signal affecting other parts of Search.

出典: [Search generative AI control](https://support.google.com/webmasters/answer/16908024)

学習を絞るなら [Google-Extended](https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers#google-extended)。検索全体から外すなら `noindex`。反映は制御が生きてからおおむね1〜2日。キャッシュで延びることがある。

制御もレポートも、まだ一部サイトへの段階公開だ。2026年6月3日の [生成AIパフォーマンスレポート発表](https://developers.google.com/search/blog/2026/06/gen-ai-performance-reports) も一部プロパティから。数字はインプレッションであり、クリックでも順位でもない。Search Labs の実験データは入らない。画面が無いから除外されている、とは限らない。配信対象外か、生成機能のインプレッションがまだ足りないだけかもしれない。

自分のプロパティにそのメニューがあるかは断言しない。断言できるのは、文書上の既定値が含めであることと、継承が書いてあることだ。

チームなら順番を入れ替える。先に親ドメインの現在値を見る。子の URL-prefix が継承中か、手動で上書きしたかを書く。そのあとでテンプレートの robots meta と本番の robots.txt を見る。逆にすると、マークアップを一週間直しても生成機能から丸ごと抜けている状態を説明できない。変えた日の午後にレポートが動かないからといって戻す判断は早い。

マークアップを触る人と Search Console の所有者が別チームなら、この層はコードレビューに乗らない。

![資格は三層](../../../assets/blog/official-geo-subtraction-gsc-control-2026/three-layers.png)

## 本番だけが長い robots.txt

```bash
curl -sI https://jangwook.net/llms.txt
# HTTP/2 404

curl -sL https://jangwook.net/robots.txt | wc -l
# 106
```

`LLMs.txt` も `www` ホストも 404。Google Search が無視すると書いたファイルを、このサイトは置いていない。

git 側は学習ボット（`GPTBot`、`ClaudeBot`、`CCBot`、`Google-Extended`）を止め、検索ボットと `*` には交差言語 URL だけを隠す。本番は手前に CDN の接頭辞が付く。`User-agent: *` に `Content-Signal: search=yes,ai-train=no,use=reference` があり、学習・拡張ボットへの `Disallow: /` がもう一度ある。Google-Extended の遮断グループは本番で二つ見える。リポジトリ本文はその後ろに続く。

![gitのrobots.txtとライブ応答の行数](../../../assets/blog/official-geo-subtraction-gsc-control-2026/robots-live-vs-git.png)

`Content-Signal` は、今日読んだ Search Central の robots.txt 案内では対応ルールとして確認できなかった。ファイルに書いてあることと、Googlebot がそのトークンを使うことは別だ。後者は断言しない。

ページ8枚（`/`、`/ko/`、`/en/`、`/ko/blog/`、記事3本、`/ko/contact/`）はすべて HTTP 200。`<meta name="robots">` は0。`data-nosnippet` も0。本文に `nosnippet` という語が出るページはあったが、指示子ではなかった。`noindex` を付けたページだけタグを出す今のテンプレートと合う。

ホームの JSON-LD は `Organization`・`ImageObject`・`Person`・`WebSite`。`/ko/` と `/en/` には `FAQPage` がもう一つ付く。記事はそこに `WebPage`・`SpeakableSpecification`・`BreadcrumbList`・`BlogPosting` が乗る。今日の公式文では、そのマークアップは生成検索の入場券ではない。リッチリザルトとエンティティ整理の側に残る。[FAQPage のリッチリザルトが終わったあとも Q&A マークアップを残した理由](/ja/blog/ja/faqpage-deprecation-ai-citation-2026) と同じ線だ。

GEO の作業を「リポジトリにファイルを足す」だと捉えると、クローラーがすでに読んでいるファイルはリポジトリの外で伸びている。見るべきは `public/robots.txt` の diff ではなく、デプロイされた URL だ。

## ガイドが不要だと書いた作業

Google Search Central は 2026年5月15日に [生成AI機能の最適化ガイド](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) を出し、7月10日に直した。市販のチェックリストが先頭に置く `llms.txt` を、その文書は無視すると書く。

> From Google Search's perspective, optimizing for generative AI search is optimizing for the search experience, and thus still SEO.

出典: [Optimizing your website for generative AI features](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)

バックログから落とす行は四つ。

`llms.txt` と専用の AI ファイル。Google Search は使わない。作っても可視性や順位に得も損もない。Google Search 用には作らない。別のシステムが読むなら、その目的だけ残す。

モデルのために文章を細かく割る。要求していない。一つのページの複数トピックを理解すると書いてある。長さは読者基準で決める。

AI だけを狙った言い換え。同義語と意味は理解するので、ロングテールごとにページを増やす必要はない。人向けの下書きを保つ。量産は [scaled content](https://developers.google.com/search/docs/essentials/spam-policies#scaled-content) とぶつかる。

生成検索専用の schema.org。要らない。専用マークアップもない。リッチリザルト用は残し、「AI Overview 用スキーマ」は新しく敷かない。

LLMS.txt の一文はさらに短い。

> Doing so will neither harm nor help your site's visibility or rankings in Google Search, as Google Search ignores them.

出典: 同じ [最適化ガイド](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) の LLMS.txt 項目

[robots.txt と llms.txt でクローラーを分ける記事](/ja/blog/ja/ai-crawler-control-robots-txt-llms-txt-2026) で学習用と検索用をすでに分けてあるなら、今日消す勘違いは一つ。Google がこのファイルを読む、という話だ。本番の robots.txt にはその記事 URL がコメントで残っている。指示子ではない。

偽の言及をウェブに埋めることも、公式は役に立たないと見ている。第三者ツールが「内部指標」を見るという主張も同じ文書が切っている。内部の順位や AI システムに入る第三者ツールはない。[第三者 SEO 助言の評価ガイド](https://developers.google.com/search/docs/fundamentals/third-party-seo) は AEO・GEO の助言を公式文書と照合しろと書く。ツールをワークフローに使うこと自体は止めていない。その数字を Google の数字として扱うな、という話だ。

## リッチリザルト用の型は残す

構造化データの節は二度読んだ。生成検索に必須ではなく、専用タイプもない。リッチリザルトの資格にはそのまま使うので、SEO の一部としては残せとある。自分はそれを「JSON-LD を消せ」とは読まなかった。「生成検索があるから型を一つ足すな」と読んだ。順位保証も、引用保証も、もともと無い。

生成機能のリンクや根拠になるには、ページがインデックスされ、スニペットを出せる必要がある。[AI features and your website](https://developers.google.com/search/docs/appearance/ai-features) の文はこうだ。

> There are no additional requirements to appear in AI Overviews or AI Mode, nor other special optimizations necessary.

出典: [AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)

技術要件とスパムポリシーと、人向けコンテンツのガイドはそのまま。それを守ってもクロール・インデックス・掲載は保証されない。検索がもともと持っていた留保だ。

スニペット側は一度測ってある。`nosnippet` と `max-snippet:0` が AI Overview・AI Mode の直接入力まで止める定義は [robots スニペット指示子の実測](/ja/blog/ja/robots-snippet-controls-ai-overviews-2026) にある。今日はそのパーサを回さない。上にプロパティの値が乗ったからだ。

## 見た目のボタンはツリーに残らない

ガイドの末尾はブラウザエージェントだ。予約、仕様比較。検索の引用とは筋が違う。触る表面は同じ。[web.dev の agent-friendly 案内](https://web.dev/articles/ai-agent-site-ux) は経路を三つ書く。スクリーンショット、生の HTML、アクセシビリティツリー。

アクセシビリティツリーは役割・名前・状態を残し、飾りを捨てる。スクリーンリーダーが使う木と同じだ。`div` をボタンに見せかけると、DOM だけ読む側はボタンを見ず、スクリーンショットだけ見る側は位置は分かっても動作は分からない。

最適化ガイドもセマンティック HTML を「完璧なコード」ではなく、可読性と支援技術のパースの側で説明する。ウェブ全体が妥当な HTML ではなく、Google はそれを理解すると書いてある。それでも `button` と `a` を使う理由は、検索クローラーだけではない。

残る実装は地味だ。入力には `label for`。透明オーバーレイでクリック領域を隠さない。カテゴリごとにレイアウトが大きく跳ねないようにする。WCAG を書き直す仕事でもあり、エージェント用の新しいフォーマットを作る仕事ではない。

web.dev はスクリーンショットだけを信じる経路が遅くて高いと書く。構造が濁ったときの補助だ。主経路をツリーと DOM に置くと、クローラーが読むテキストとエージェントが読む役割が同じマークアップから出る。検索用の隠しテキストを一つ足す仕事とは逆だ。

## スタンドアップで聞く一行

```bash
curl -sI https://example.com/llms.txt | head -n 1

curl -sL https://example.com/robots.txt > /tmp/live-robots.txt
diff -u public/robots.txt /tmp/live-robots.txt
```

この二行では Search Console の値は見えない。その層はプロパティ設定にある。

スプリントから落とすもの。Google Search 用の新しい `llms.txt`、専用の AI マークダウン、生成検索専用の schema.org、モデル用の段落分割、クエリごとのページ増殖、第三者の「内部指標」をデプロイゲートの数字にすること。

残すもの。インデックスとスニペットの資格、本番 robots.txt と git の diff、親と子のプロパティの生成AI制御、セマンティック HTML、リッチリザルト用 JSON-LD の目的欄を「生成検索必須」ではなく「リッチリザルト資格」に書き直すこと。

含めのままでも、スニペットが開いていても、インデックスされていても、Google がそのページを拾う約束は文書のどこにも無い。今日測ったのは資格がどこで切れるかだ。効果の大きさではない。

本番の robots.txt とプロパティの値が食い違う地点を揃える仕事は、自分の実務だ。連絡先はプロフィールにある。

---
*出典: Google Search Central の [生成AI機能の最適化ガイド](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)（2026-07-10 更新）、[AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)、[第三者SEO助言ガイド](https://developers.google.com/search/docs/fundamentals/third-party-seo)、[生成AIパフォーマンスレポート発表](https://developers.google.com/search/blog/2026/06/gen-ai-performance-reports)（2026-06-03）、Search Console ヘルプの [Search generative AI control](https://support.google.com/webmasters/answer/16908024)・[Generative AI performance report](https://support.google.com/webmasters/answer/16984139)、web.dev の [Build agent-friendly websites](https://web.dev/articles/ai-agent-site-ux)（いずれも公式）。本文の英語ブロック引用4件は各原文ページを取得し空白を畳んで対照した文字列で、引用の脇に原文リンクを置いた。ライブ測定: 2026-08-14、`https://jangwook.net` の robots.txt・llms.txt・ページ8枚、curl + HTML パース。原資料は `data/official-geo-gsc-control-probe-2026.json`、図は `scripts/chart-official-geo-gsc-control.py`。Search Console にはログインしていない。Content-Signal はライブ robots.txt に存在するだけで、Google Search Central の robots.txt 対応ルールとしては確認できなかった。構造化データとこの制御は順位を保証しない。*
