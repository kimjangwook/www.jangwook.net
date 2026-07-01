---
title: 'LocalBusiness構造化データ、JSで入れてもいいがサーバーサイドの方が確実な理由'
description: '店舗検索ページのLocalBusiness JSON-LDをJSで注入すると、生のHTMLにはブロックが0個。サーバーサイド出力と直接比較し、Google公式見解と順位の限界まで整理した。'
pubDate: '2026-07-01'
heroImage: '../../../assets/blog/localbusiness-structured-data-server-side-vs-js-2026/hero.png'
tags:
  - SEO
  - 構造化データ
  - MEO
  - JSON-LD
  - Web開発
relatedPosts:
  - slug: llm-seo-aeo-practical-implementation
    score: 0.74
    reason:
      ko: SEO/AEO를 실무 로드맵으로 정리한 글이다. 이 글은 그 로드맵의 한 조각인 "구조화 데이터를 어떻게 확실히 크롤러에 전달하는가"를 코드 레벨로 파고든 셈이다.
      ja: SEO/AEOを実務ロードマップとして整理した記事だ。本記事はそのロードマップの一片である「構造化データをどう確実にクローラーへ届けるか」をコードレベルで掘り下げた形になる。
      en: That post lays out SEO/AEO as a practical roadmap. This one drills into one piece of it at the code level, on how to actually get structured data to the crawler reliably.
      zh: 那篇文章把SEO/AEO整理成实务路线图。本文则在代码层面深入其中一环——如何把结构化数据可靠地送达爬虫。
  - slug: astro-scheduled-publishing
    score: 0.6
    reason:
      ko: 정적 사이트가 빌드 시점에 HTML을 확정해 내보내는 구조를 다룬 글이다. 구조화 데이터를 서버사이드로 "미리 박아 두는" 이 글의 원리와 뿌리가 같다.
      ja: 静的サイトがビルド時にHTMLを確定して出力する仕組みを扱った記事だ。構造化データをサーバーサイドで「あらかじめ埋め込む」本記事の原理と根が同じだ。
      en: That post covers how a static site finalizes HTML at build time. It shares a root with this piece's idea of baking structured data into the server output ahead of time.
      zh: 那篇文章讲静态站点在构建时就确定并输出HTML。它与本文"预先把结构化数据写入服务端输出"的原理同源。
  - slug: metadata-based-recommendation-optimization
    score: 0.53
    reason:
      ko: 메타데이터를 어떻게 구조화해 다루느냐가 시스템 전체 효율을 바꾼 사례다. 페이지 메타를 기계가 읽기 좋게 명시한다는 점에서 구조화 데이터 설계와 문제의식이 겹친다.
      ja: メタデータをどう構造化して扱うかがシステム全体の効率を変えた事例だ。ページのメタを機械が読みやすく明示するという点で、構造化データ設計と問題意識が重なる。
      en: A case where how metadata is structured changed a whole system's efficiency. Making page meta explicit for machines overlaps with the mindset behind structured-data design.
      zh: 一个"如何组织元数据"改变整个系统效率的案例。让页面元信息对机器清晰可读，与结构化数据设计的思路相通。
faq:
  - question: 'JSで入れた構造化データはGoogleに読まれないのですか？'
    answer: '読まれます。GoogleはJavaScriptでDOMに注入されたJSON-LDもレンダリング後に処理すると公式文書で明示しています。ただしレンダリングは資源に依存する二次処理で、生のHTML（一次クロール）にはそのブロックが存在しません。同じマークアップを二方式で作り生のHTMLだけを解析したところ、サーバーサイドはld+jsonブロック1個、JS注入は0個でした。'
  - question: 'では必ずサーバーサイドが正解ですか？'
    answer: 'いいえ。JS注入も間違いではなくGoogleが対応しています。ただし店舗名・住所・電話（NAP）のように正確さと一貫性が信頼の根拠になる値なら、レンダリング成功に毎回賭けるより、サーバーが最初から出力する方が防御的で予測可能です。頻繁に変わる値についてGoogle自身も動的マークアップは頻度が下がり信頼性が下がりうると述べています。'
  - question: '構造化データを入れると検索順位は上がりますか？'
    answer: '上がりません。Googleは構造化データがリッチリザルト表示の「資格」を与えるだけで、表示や順位を保証しないと文書で明言しています。ローカル順位の実際の原動力はGoogleビジネスプロフィール（GBP）の運用・口コミ・カテゴリの正確さで、サイトのマークアップはクローラーの理解を助ける補助にとどまります。'
  - question: 'デプロイ後は何で確認しますか？'
    answer: 'リッチリザルトテストとSearch ConsoleのURL検査ツールで、生とレンダリング両方を確認します。特にJS注入方式なら「レンダリング済みHTML」に実際にld+jsonが載るかを見ます。そしてマークアップの値が画面表示やGBP登録情報と食い違っていないか照合します。不一致は役立つどころか信頼を損ないます。'
---

店舗検索ページを作るとき、開発者が最も後回しにし、最も雑に扱うのが構造化データだ。画面に見える地図と営業時間さえ合っていれば終わった気がするからだ。ところがローカル検索（Googleマップ・ローカルパック）で自店がきちんと拾われるかは、目に見える画面ではなく、クローラーが読み取るマークアップで決まる。そしてそのマークアップをJavaScriptで後から描き込むか、サーバーが最初から出力するかが、思った以上に大きな差を生む。

まず誤解を一つ解いておこう。「JSで構造化データを入れるとGoogleが読めない」という話は間違いだ。

## Google公式の立場：JS構造化データは対応されている

Googleは明示的に対応していると述べている。公式文書の表現をそのまま引くと、

> "Google can read JSON-LD data when it is dynamically injected into the page's contents, such as by JavaScript code or embedded widgets."
> — Google Search Central, *Intro to Structured Data*

つまり`document.createElement('script')`で`application/ld+json`ブロックを後から付けても、Googleはレンダリング後のDOMからそれを読む。ここまでなら「ならJSで入れてもいい」で正しい。問題は、いつ、どれだけ確実に読まれるかだ。

## 直接検証：生のHTMLに何が残るか

クローラーはページを二度見る。最初は生のHTMLをそのまま取得し（一次）、資源が許すときにヘッドレスChromiumでJSを実行して再度見る（二次）。だから一次時点の生のHTMLに構造化データが既にあるかが、実質的な差になる。

同じLocalBusinessマークアップを二方式で用意した。一方はサーバーが出力した静的HTML、もう一方はJSがランタイムで注入する方式だ。

```html
<!-- (A) サーバーサイド：生のHTMLにそのまま存在 -->
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"LocalBusiness","name":"明るい目メガネ店 渋谷店"}
</script>

<!-- (B) JS注入：生のHTMLには無く、実行後にのみ生成 -->
<script>
  const ld = document.createElement('script');
  ld.type = 'application/ld+json';
  ld.textContent = JSON.stringify({ "@type": "LocalBusiness", name: "明るい目メガネ店 渋谷店" });
  document.head.appendChild(ld);
</script>
```

JSを実行していない生のHTMLから、実際の`<script type="application/ld+json">`ブロックだけを解析してみた。

```
[A] サーバーサイド：ld+jsonブロック 1個、@type=['LocalBusiness']
[B] JS注入：      ld+jsonブロック 0個、@type=[]
```

サーバーサイドは一次クロールが取得する生のHTMLに既にブロックがある。JS注入方式は生のHTMLにブロックが0個だ。そのブロックはブラウザがJSを実行した後にしかDOMに現れない。クローラーからすれば、二次レンダリングを待って初めて存在するデータだ。

## なぜこの差がローカルで特に重要か

Googleも動的生成マークアップのリスクを認めている。EC文脈の案内だが原理は同じだ。

> "dynamically-generated markup can make Shopping crawls less frequent and less reliable, which can be an issue for fast-changing content."
> — Google Search Central, *Generate Structured Data with JavaScript*

レンダリングキューは常に資源に依存する。二次レンダリングが遅れたり、JS実行中に外部スクリプトの読み込みが失敗したりすると、その日そのページのJSON-LDはそもそも生成されない。店舗名・住所・電話（NAP）のように正確さと一貫性が信頼の根拠になるデータを、毎回レンダリング成功に賭ける理由はない。サーバーサイド出力にはその依存がない。

## 正直な限界 — 構造化データは順位を上げない

ここで必ず押さえておくことがある。構造化データをサーバーサイドで完璧に出力しても、それ自体で検索順位は上がらない。Googleは構造化データがリッチリザルト表示の資格を与えるだけで、表示や順位を保証しないと文書で明言している。ローカル順位の実際の原動力はGoogleビジネスプロフィール（GBP）の運用、口コミ、カテゴリの正確さの側だ。サイトのマークアップはその効果を補助するにとどまる。

もう一つ。構造化データは画面に見える内容を忠実に反映しなければならない。

> "don't add structured data about information that is not visible to the user, even if the information is accurate."
> — Google Search Central

GBPに登録した住所とページのマークアップの住所が食い違えば、役立つどころか信頼を削るだけだ。

## 開発者が今日できること

- 店舗のNAPと座標、URLをサーバーサイド（ルート／テンプレート）で静的に出力する。JS注入に依存しない。
- その値をGBPと正確に一致させる。不一致・ダミー・未検証の値（偽のSNS URLなど）は入れない。
- 画面に見えない情報はマークアップしない。
- デプロイ後、リッチリザルトテストとURL検査ツールで生とレンダリング両方を確認する。「JSで入れたから大丈夫だろう」で終わらせない。
- 順位効果を約束しない。マークアップはクローラーの理解を助ける補助だという線を守る。

まとめると、JS構造化データは間違った方法ではない。ただしローカル店舗情報のように確実性がそのまま信頼になるデータなら、レンダリングキューに運を委ねるより、サーバーが最初から出力する方が防御的で予測可能だ。

---

店舗検索ページの構造化データをサーバーサイドで確実に出力したい、あるいは既存サイトのローカルSEO・マークアップ構造を点検したいなら、個人的に相談・実装のご依頼を受けています。jangwook.netのプロフィールの連絡先から気軽にどうぞ。
