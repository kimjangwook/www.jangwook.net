---
title: 'GEO対策を削り、Search Consoleの制御点だけを測った'
description: '公開 robots.txt は106行、リポジトリは45行だった。llms.txt は404で Google Search は使わないと書く。Search Console の生成AIスイッチはプルリクに出ない。公式GEO案内を公開URL八枚の生バイトと突き合わせ、差分61行を記録した実測メモである。'
pubDate: '2026-08-14'
heroImage: '../../../assets/blog/official-geo-subtraction-gsc-control-2026/hero.png'
tags: ['geo', 'google-search-console', 'robots-txt', 'seo', 'web-development']
relatedPosts:
  - slug: robots-snippet-controls-ai-overviews-2026
    score: 0.9
    reason:
      ko: '검색 결과 스니펫을 줄이는 robots 지시자와 이번 글의 Search Console 생성형 AI 제어를 함께 비교할 수 있습니다.'
      ja: '検索スニペットを制御するrobots指示子と、今回のSearch Console生成AI設定を並べて確認できる。'
      en: 'Compares robots snippet directives with the Search Console generative AI control examined here.'
      zh: '将控制搜索摘要的 robots 指令与本文检查的 Search Console 生成式 AI 设置放在一起比较。'
  - slug: ai-crawler-control-robots-txt-llms-txt-2026
    score: 0.86
    reason:
      ko: 'robots.txt와 llms.txt가 실제 크롤러 제어에서 어떤 역할을 하는지 이어서 확인할 수 있습니다.'
      ja: 'robots.txtとllms.txtが実際のクローラー制御で何を担うかを続けて確認できる。'
      en: 'Continues the examination of what robots.txt and llms.txt actually control for crawlers.'
      zh: '继续检查 robots.txt 和 llms.txt 在爬虫控制中实际负责什么。'
  - slug: faqpage-deprecation-ai-citation-2026
    score: 0.68
    reason:
      ko: '구조화 데이터와 AI 검색 노출을 같은 것으로 취급하면 안 되는 경계를 다룹니다.'
      ja: '構造化データとAI検索での露出を同じものとして扱えない境界に続く。'
      en: 'Extends the boundary between structured data and visibility in AI search.'
      zh: '延伸结构化数据与 AI 搜索可见性之间不能混为一谈的境界。'
  - slug: validate-structured-data-ci-jsonld-2026
    score: 0.62
    reason:
      ko: 'HTML과 JSON-LD를 실제로 파싱해 검증 결과와 검색 기능의 차이를 확인합니다.'
      ja: 'HTMLとJSON-LDを実際に解析し、検証結果と検索機能の差を確認する記事。'
      en: 'Checks HTML and JSON-LD directly to separate validation results from search features.'
      zh: '直接解析 HTML 和 JSON-LD，区分校验结果与搜索功能之间的差异。'
  - slug: json-ld-graph-entity-linking-2026
    score: 0.58
    reason:
      ko: 'JSON-LD의 타입이 존재한다는 사실과 검색 시스템이 이를 어떻게 쓰는지는 별개라는 점을 잇습니다.'
      ja: 'JSON-LDの型が存在することと、検索システムがそれをどう使うかは別だと確認できる。'
      en: 'Connects the presence of JSON-LD types with the separate question of how search systems use them.'
      zh: '把 JSON-LD 类型的存在与搜索系统如何使用它这个独立问题连接起来。'
---

`public/robots.txt` は45行だった。公開URLを叩くと106行返ってきた。

2026年8月14日朝、ログインなしで `jangwook.net` を測った。Gitの差分で済むと思っていた。

```bash
$ wc -l public/robots.txt
45 public/robots.txt

$ curl -sL https://jangwook.net/robots.txt | wc -l
106
```

行数で61行、サイズも1,101バイトと2,937バイトで食い違う。<strong>差分の対象を間違えていた</strong>。レビューしたGitのファイルと、クローラーが読むCDN越しの応答は別だった。

## Gitの45行とライブの106行が分かれた

ライブ先頭にはリポジトリにないCDNが付与した接頭部があった。

```text
User-agent: *
Content-Signal: search=yes,ai-train=no,use=reference
```

学習・拡張ボット向け `Disallow: /` が加わり、Google-Extended の拒否グループはライブで2回、Gitで1回現れた。

`Content-Signal` をGooglebotが解釈するかは当時のSearch Central文書で確認できなかった。ファイルへの存在とGooglebotの消費は別だ。

リポジトリの編集だけでは決まらない。CDN接頭部を把握しないプルリクエストは公開状態を表さず、GEO制御の報告も実態を欠く。

## 最初に開いたGEO項目は404だった

チェックリストで推奨されやすい `llms.txt` の有無を確認した。

```bash
$ curl -sI https://jangwook.net/llms.txt | head -n 1
HTTP/2 404
```

`www` ホストや大文字の `LLMs.txt` も404で、ファイルは存在しない。

Googleの生成AI最適化ガイドの記述だ。

> “Doing so will neither harm nor help your site's visibility or rankings in Google Search, as Google Search ignores them.” ([Google Search Central](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide))

作らないと決めた。外部リストに追従してファイルを増やす必要はない。Google検索に対して公式文書は効果を約束していない。[robots.txtとllms.txtをクローラー制御として分けた記録](/ja/blog/ja/ai-crawler-control-robots-txt-llms-txt-2026/)と同じ層だ。今回はGoogleが検索に使わないと書いた文を、公開URLの404と並べた。

## 入口を閉じる設定はプルリクに出てこない

Search Consoleの `Settings > Search generative AI` で選べる状態は `include`、`exclude`、親からの `inherit` の3つで、初期値は `include` だ。

`exclude` を選ぶと、AI Overviews、AI Mode、Discoverの生成AI機能でリンクや根拠に使われず、表示回数や流入も途絶える。ヘルプは制御範囲を限定している。

> “This control only affects whether your content can appear in certain Search generative AI features; this control isn't used as a ranking or inclusion signal affecting other parts of Search.” ([Search Console Help](https://support.google.com/webmasters/answer/16908024))

順位の保護ではなく、特定機能への露出を遮断するスイッチだ。

ここは実測値ではない。未ログインのためメニューの表示や選択状態は未確認だ。機能は順次展開中で、画面が見えないこと自体は除外の証拠にならない。

## 8ページを読ませても専用の札はなかった

HTML側を測った。トップ、言語トップ、一覧、記事3本、問い合わせページの8ページを取得し、すべてHTTP 200だった。

```text
pages fetched: 8
HTTP 200: 8
meta name="robots": 0
data-nosnippet: 0
body text containing "nosnippet": 1
```

`nosnippet` の1件は指示子ではなく本文の単語だった。[robots metaがheadの外へ落ちる着地点](/ja/blog/ja/robots-meta-head-body-parser-placement-2026/)を測ったあとの再集計である。対象はパーサー用フィクスチャではなく公開8枚の生HTMLだ。JSON-LDにはトップの `Organization`、`ImageObject`、`Person`、`WebSite`、言語トップの `FAQPage`、記事の `WebPage`、`SpeakableSpecification`、`BreadcrumbList`、`BlogPosting` があった。

専用の生成AIタグはなく、構造化データの型も引用や表示を保証しない。Google公式も追加要件を置いていない。

> “There are no additional requirements to appear in AI Overviews or AI Mode, nor other special optimizations necessary.” ([Google Search Central](https://developers.google.com/search/docs/appearance/ai-features))

JSON-LDを足しても掲載は保証されない。分かったのは、8ページが応答し、`meta robots` と `data-nosnippet` がなかったことまでだ。[スニペット指示子がAI Overviewへの入力を切る経路](/ja/blog/ja/robots-snippet-controls-ai-overviews-2026/)は、このページ層に属する。8枚にその指示子はなかった。

## 測っていない数字を報告書から外した

Search Consoleの生成AIパフォーマンスレポートは表示回数を数え、クリック数や順位、Search Labsデータは含まない。レポートを開いていないため、表示回数もクリックも引用数も書けない。

順位、インプレッション、引用、クリック、滞在時間、コンバージョン。6項目すべて未計測だ。`include` でスニペットを許可しインデックスされても、引用枠は保証されない。

必要なのは作業報告ではなく露出や流入の変化だ。今回の調査で答えられる数字はない。チケットの完了条件に置くべきは、対応したという言葉ではなく、測った対象と未計測の境界だ。

## 明日も同じサイトを測れるコマンド

再現するなら、まずライブとGitを突き合わせる。Search Consoleのスイッチはコマンドで見えないため、ヘルプ仕様と実際の設定を分けて記録する。

```bash
curl -sI https://example.com/llms.txt | head -n 1
curl -sL https://example.com/robots.txt > /tmp/live-robots.txt
diff -u public/robots.txt /tmp/live-robots.txt
```

HTMLを読むときはHTTP 200、`meta name="robots"`、`data-nosnippet`、構造化データの型を記録する。順位や引用は推定しない。

確定したのは、ライブrobots.txtが106行、Gitが45行、`llms.txt` が404、8ページが200だったことだ。Search Consoleの設定は未確認のままだ。ここを埋めるまでGEO対応済みとは書かない。
