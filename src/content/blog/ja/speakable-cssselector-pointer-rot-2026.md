---
title: '「ここを読み上げて」が13段落を指していた: speakableセレクタ実測'
description: 'speakableのcssSelectorをビルド成果物に対して実際に走らせた。四つのうち一つは1,332ページで何も掴んでおらず、リード段落一つを狙ったはずのセレクタは1ページあたり13段落を掴んでいた。値を持つマークアップとDOMを指すマークアップは壊れ方がまるで違う。検証器は0件だけを重大扱いする。'
pubDate: '2026-08-11'
heroImage: '../../../assets/blog/speakable-cssselector-pointer-rot-2026/hero.png'
tags:
  - 構造化データ
  - SEO
  - JSON-LD
  - Web開発
  - CSS
faq:
  - question: 'speakableは今もGoogleがサポートしている構造化データですか。'
    answer: 'Search Galleryの一覧には今も載っています。ただし公式ドキュメントは冒頭にベータ表記を置き、対象は英語で発信するパブリッシャーと、英語設定のGoogle Homeを使う米国内のユーザーだと明記しています。一覧に載っていることと、自分のサイトがその対象であることは別の話です。'
  - question: 'cssSelectorが何も掴まないとどうなりますか。'
    answer: 'schema.orgのSchema Markup Validatorにかけると、errorTypeがNO_MATCHES_FOUND、isSevereがtrueで返ってきます。私のライブページでも実際にこの1件が検出されました。逆に掴みすぎている場合は仕様上まったく正当なので、検証器は何も言いません。'
  - question: 'p:first-of-typeは文書の最初の段落を選ぶのではないのですか。'
    answer: '違います。:first-of-typeは同じ親の下にいる兄弟のうち、その型の最初の一つを選びます。段落を持つ親がarticleの中に複数あれば、その親ごとに一つずつ拾われます。私の標本では1ページあたり中央値13個が拾われ、そのうち本文のリードは一つだけでした。'
  - question: 'この種の不具合はビルドで自動的に止められますか。'
    answer: '止められます。ビルド成果物のHTMLを開いてセレクタを実行し、マッチ0なら失敗、段落セレクタが上限を超えたら失敗にすればよいだけです。スキーマ検証では後者が絶対に見えないので、断言は自分のパイプラインに置く必要があります。'
relatedPosts:
  - slug: validate-structured-data-ci-jsonld-2026
    score: 0.86
    reason:
      ko: 그 글의 CI 검증은 JSON-LD 문법과 필수 속성을 봤다. 이번 건은 문법이 완벽한 채로 실패했으니, 같은 파이프라인에 무엇을 더 얹을지로 곧장 이어진다.
      ja: あの記事で組んだCI検証は、JSON-LDの構文と必須プロパティを見るものだった。今回は構文が完璧なまま失敗した例なので、同じパイプラインに何を足すかという話に直結する。
      en: The CI check from that post validates JSON-LD syntax and required properties. This failure was syntactically flawless, which makes it a direct argument about what else that pipeline must assert.
      zh: 那篇搭的 CI 校验看的是 JSON-LD 语法和必填属性。这次恰恰是语法完全正确却失败，正好接上同一条流水线还该断言什么。
  - slug: text-fragment-citation-deep-link-audit-2026
    score: 0.81
    reason:
      ko: 텍스트 프래그먼트도 문서 속 한 지점을 문자열로 가리키는 주소였고, 코드 블록에서 15개 중 14개가 끊겼다. 포인터와 대상이 따로 움직일 때의 두 번째 자료다.
      ja: テキストフラグメントも文書内の一点を文字列で指すアドレスで、コードブロックでは15本中14本が外れた。指す側と指される側が別々に動くときの二例目にあたる。
      en: Text fragments are the same kind of address, and 14 of 15 broke inside code blocks. It is the second data point on pointers and targets drifting apart.
      zh: 文本片段是同一类地址，那次在代码块里 15 条断了 14 条。这是"指针与目标各自漂移"的第二组数据。
  - slug: json-ld-graph-entity-linking-2026
    score: 0.74
    reason:
      ko: 이 사이트의 JSON-LD를 하나의 @graph로 묶은 글이고, 이번에 문제가 된 WebPage 노드가 그 그래프 안에 있다. 잘 짠 그래프도 헛것을 가리키는 노드를 품는다.
      ja: このサイトのJSON-LDを一つの@graphにまとめた記事で、今回問題になったWebPageノードはそのグラフの中にいる。よく組まれたグラフでも、空を指すノードは紛れ込む。
      en: That post merged this site's JSON-LD into one @graph, and the WebPage node that failed here sits inside it. Even a tidy graph can hold a node aimed at nothing.
      zh: 那篇把本站 JSON-LD 并成一个 @graph，这次出问题的 WebPage 节点就在图里。图理得再好也可能混着指向空处的节点。
  - slug: faqpage-deprecation-ai-citation-2026
    score: 0.7
    reason:
      ko: FAQ 리치 결과가 끝났을 때는 "기능이 끝나도 어휘는 남는다"가 결론이었다. speakable은 그 거울상이라 판단 기준을 바꿔야 했다.
      ja: FAQリッチリザルトが終わったときの結論は「機能が終わっても語彙は残る」だった。speakableはその鏡像で、残すか消すかを別の物差しで決める必要があった。
      en: When the FAQ rich result ended, the conclusion was that vocabulary outlives the feature. speakable is the mirror case and needed a different keep-or-delete test.
      zh: FAQ 富媒体结果下线时的结论是"功能没了词汇还在"。speakable 正好相反，去留得换一把尺子。
---

`article p:first-of-type`。これで段落が一つ選ばれると思っていた。実際には十三個だった。

標本の中央値が13で、最も多いページでは24個。しかもこのセレクタはスタイルシートの中にいたわけではない。構造化データの中にいて、このページを読み上げる機械に対して「ここを音声で読め」と指示していた。

## 値を運ぶマークアップと、DOMを指すマークアップ

構造化データを付けるという作業は、たいてい値を書き込む作業だ。`headline`にタイトル文字列、`datePublished`に日付、`author`に名前。書いたものがそのまま出ていくので、間違えれば表に出る。タイトルが空なら空のまま配信されるし、日付の形式が崩れれば検証器が形式エラーを返す。

`speakable`はその作りではない。schema.orgの`SpeakableSpecification`は読み上げるテキストを一切持たない。持っているのは`cssSelector`か`xPath`、つまり<strong>文書内の位置を指す住所</strong>だけだ。値はDOM側にあり、マークアップは住所しか握っていない。音声アシスタントがページを読み上げるとき、どこを読ませるかを筆者が指定する。設計としては筋が通っている。

ただ、住所を握るマークアップは値を握るマークアップとリスク構造が違う。指す先が消えても、マークアップ自体はぴんぴんしている。JSON構文は正しい。型も正しい。必須プロパティも揃っている。クラス名を一つリファクタした日から指示は空を指し始めるが、ビルドは緑のままで、テストも全部通る。この関係を見張っている仕組みは、普通のパイプラインには存在しない。Googleが文書化している構造化データのうち、この性質を持つのは実質`speakable`だけだ。

そしてポインタの腐り方には二方向ある。何も指さなくなるか、指しすぎるか。私のサイトでは両方が同時に起きていた。

## 公式ドキュメントがspeakableに掛けている条件

手を入れる前に[speakableのドキュメント](https://developers.google.com/search/docs/appearance/structured-data/speakable)を読み直した。冒頭から条件が置かれている。

> This feature is in beta and subject to change. We're currently developing this feature and you may see changes in requirements or guidelines.

対象範囲は、多くの人が思っているより狭い。

> The `speakable` property works for users in the U.S. that have Google Home devices set to English, and publishers that publish content in English.

英語で発信するパブリッシャー、英語設定のGoogle Homeを持つ米国内のユーザー。日本語・韓国語・中国語・英語の四版を並べて出す個人の技術ブログは、この一文のどこにも入らない。セレクタの使い方についての指示は一行だけだ。

> Use either `cssSelector` or `xPath`; don't use both.

そして保証の話。ここは言い換えずに引いておく。

> Google does not guarantee that features that consume structured data will show up in search results.

一方で[Search Gallery](https://developers.google.com/search/docs/appearance/structured-data/search-gallery)のサポート型一覧には、Speakableが今も載っている。この二つは別々の事実だ。混ぜて読むと「公式一覧にあるのだから付けておけばいつか得をする」という漠然とした期待だけが残る。ちなみにGoogleはここ数年、サポート型を増やすより減らしてきた。[ドキュメント更新ログ](https://developers.google.com/search/updates)を見れば、2026-05-08にFAQリッチリザルトへサポート終了の告知が付き（"This feature will no longer appear in Google Search starting May 7, 2026."）、2026-06-15に関連ドキュメントが削除されている。練習問題（practice problem）型のドキュメントも2026-01-06に消えた。FAQが終わったとき私は[Q&Aマークアップは消すなという結論](/ja/blog/ja/faqpage-deprecation-ai-citation-2026)を出したが、それは語彙が値を抱えていて、他のパーサーが読み続けられるからだった。ポインタにはその理屈が通らない。指す先が無ければ、誰が読んでも無い。

## セレクタを読むのではなく、走らせてみた

私のページが吐き出していたのはこれだ。

```json
{
  "@type": "SpeakableSpecification",
  "cssSelector": [
    "article h1",
    "article h2",
    "article p:first-of-type",
    ".article-summary"
  ]
}
```

タイトル、見出し、リード段落。意図ははっきりしている。だが配信されるのは意図ではない。そこでビルド済みHTMLをjsdomで開き、四つのセレクタを実際に実行した。Node 22.22、jsdom 29.1.1、2026-08-11時点の`dist`。ブログページ1,336枚のうち1,332枚が`SpeakableSpecification`を載せており、そこから4言語×5枚の計20枚を抜いてDOMを組んだ。

| セレクタ | 1ページあたりのマッチ（中央値） | 標本20枚の合計 | 判定 |
|---|---:|---:|---|
| `article h1` | 1 | 24 | 4枚でh1が2個 |
| `article h2` | 9 | 229 | 見出しを全部 |
| `article p:first-of-type` | 13 | 272 | 指しすぎ |
| `.article-summary` | 0 | 0 | 何も無い |

`.article-summary`が0の理由は拍子抜けするほど単純で、そんなクラスを使うコンポーネントが無い。かつて存在したのか、構想だけで終わったのかは、コミットログからも確定できなかった。確かなのは、このセレクタが1,332枚に載って出ていった間、一度も何かを指したことがないということだ。

ここに面白い罠がある。`dist`全体を`article-summary`でgrepすると1,332枚すべてがヒットする。だから「ちゃんとあるじゃないか」と流してしまう。開いてみると、その文字列は1ページに一度しか現れない。JSON-LDの中の、セレクタの値そのものだ。

```
...akableSpecification","cssSelector":["article h1","article h2",
"article p:first-of-type",".article-summary"]},"url":"https://jangwo...
```

<strong>ポインタが自分の名前でgrepに引っかかる状態。</strong>文字列検索ではこの種の腐りは絶対に捕まらない。セレクタは走らせて初めて分かる。

![speakableのcssSelectorが実際に到達するノード数。意図した1個との比較](../../../assets/blog/speakable-cssselector-pointer-rot-2026/hero.png)

## 272個の段落はどこに住んでいたのか

0より13のほうが気になった。マッチした段落を親要素で分類してみる。

![マッチした272段落の親要素の内訳。本文のリードは20個だけ](../../../assets/blog/speakable-cssselector-pointer-rot-2026/paragraph-owners.png)

| 親要素 | マッチした段落数 | 実体 |
|---|---:|---|
| `li` | 73 | リスト項目の中の段落 |
| `div.item-content` | 60 | 関連記事カード |
| `blockquote` | 59 | 引用ブロック |
| `header.article-shell__header` | 20 | 記事ヘッダー |
| `div.article-prose` | 20 | 本文のリード |
| `div.text-center` | 20 | レイアウト部品 |
| `div.flex-1` | 20 | レイアウト部品 |

狙っていたのは272個のうち20個。原因は特殊なことではなく、セレクタの定義そのものにある。`:first-of-type`は「文書で最初に現れるその型」ではなく、<strong>「同じ親の下の兄弟のうち、その型の最初の一つ」</strong>だ。深さを問わず走査する子孫結合子と組み合わせれば、段落を抱えるコンテナのすべてが一つずつ献上する。

刺さったのは`div.item-content`の60個だった。関連記事カードの推薦理由、つまり機械が書いたナビゲーション文言である。もし読み上げる音声面が実在してこの指示に従っていたら、記事の書き出し一段落と<strong>同じ資格で推薦文が三つ読み上げ候補に並んでいた</strong>ことになる。自分の主張が自分のサイドバーに負けていた。

この形には見覚えがある。[テキストフラグメントの引用ディープリンクを測ったとき](/ja/blog/ja/text-fragment-citation-deep-link-audit-2026)、コードブロックで15本中14本が外れた。同じ種類の不具合だ。ポインタは書いた瞬間ではなく、<strong>周りが動いたとき</strong>に壊れる。

## 各ツールに見えるもの、見えないもの

schema.orgのSchema Markup Validatorは、空を指すセレクタを捕まえた。ライブURLを投げると3オブジェクト中エラー1件、`NO_MATCHES_FOUND`、`isSevere: true`で`.article-summary`を名指しした。構文だけ見ているのではなく、<strong>取得した文書に対してセレクタを実行している</strong>ということだ。地味だが強い機能で、使い切っている人は少ないと思う。

一方で13には何も言わなかった。当然で、多数マッチはエラーではない。`speakable`は配列を受け取り、複数の対象を指す使い方が仕様として認められている。不正ではない。ただ間違っているだけだ。

| 失敗の型 | スキーマ検証器 | ビルド | 文字列grep | 実際に止められるもの |
|---|---|---|---|---|
| マッチ0 | 捕まえる（severe） | 素通り | 素通り | デプロイゲート |
| 指しすぎ | 素通り | 素通り | 素通り | 自作の個数上限 |
| 対象範囲外での使用 | 素通り | 素通り | 素通り | 人間の判断 |

三行目に道具の答えは無い。米国の英語Google Home利用者向けと明記された機能を、多言語の個人ブログが載せるべきかどうかを決めてくれるlinterは存在しない。

## 直したセレクタと、それを守らせる断言

四つを二つに減らし、それぞれ一つだけ掴むよう範囲を絞った。

```js
// src/components/BaseHead.astro
const speakableSchema = articleData ? {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  'speakable': {
    '@type': 'SpeakableSpecification',
    'cssSelector': ['.article-shell__header h1', '.article-prose > p:first-of-type']
  },
  'url': canonicalURL.toString()
} : null;
```

効いているのは子結合子への変更だ。`.article-prose > p:first-of-type`は本文コンテナの直接の子だけを見るので、リストや引用の中の段落はそもそも候補に上がらない。同じ20枚で測り直した。

| セレクタ | マッチしたページ | 1ページあたりのノード数 |
|---|---:|---:|
| `.article-shell__header h1` | 20 / 20 | 1 |
| `.article-prose > p:first-of-type` | 20 / 20 | 1 |

そのうえで、再び静かに腐らないようpostbuildに断言を一つ置いた。成果物を開いてセレクタを実行し、0なら失敗、段落セレクタが上限を超えたら失敗。

```js
// scripts/validate-speakable.mjs（要点）
for (const selector of selectors) {
  const count = dom.window.document.querySelectorAll(selector).length;
  if (count === 0) {
    failures.push(`${file}: "${selector}" は何もマッチしない`);
  } else if (/\bp\b|paragraph/.test(selector) && count > MAX_PARAGRAPH_MATCHES) {
    failures.push(`${file}: "${selector}" が${count}個にマッチ`);
  }
}
```

修正前の`dist`に向けると、20枚×不良セレクタ2本でちょうど40件落ちる。

```
❌ validate-speakable 失敗（40件）
  - dist/en/blog/en/45-day-analytics-report-2025-11/index.html:
      "article p:first-of-type" が24個にマッチ（上限2）
  - dist/en/blog/en/45-day-analytics-report-2025-11/index.html:
      ".article-summary" は何もマッチしない
  ...
```

[JSON-LDをCIで検証する仕組み](/ja/blog/ja/validate-structured-data-ci-jsonld-2026)を作ったとき、私が見ていたのは構文と必須プロパティだった。あの検査はこのマークアップを毎日通していたはずだ。構文は完璧だったのだから。ポインタ型のプロパティには、<strong>解決結果が何個か</strong>という質問を別に立てる必要がある。

正直に線を引いておく。この修正で検索露出が良くなるとは主張しない。私は米国の英語Google Home利用者に向けた英語ニュースパブリッシャーではないし、Googleは構造化データが結果への露出を保証しないと明記している。LLMのクローラーが`speakable`を読んでいるという根拠も私は確認できていないので、読んでいるかのようには書かない。直したのは<strong>自分のサイトが機械に対して行う言明の正確さ</strong>だ。誤った言明を1,332枚に載せて配るより、正しい二行のほうがいい。標本は20枚で全数ではない、という点も併記しておく。

## 住所を持つマークアップを出す前に

- 構造化データの中に`cssSelector`と`xPath`が無いか先に探す。値ではなく住所を持つプロパティは別枠で管理する。
- セレクタはgrepではなく実行で確かめる。セレクタ文字列は必ず自分自身にヒットする。
- `:first-of-type`、`:first-child`、子孫結合子を見かけたらマッチ数を数える。意図が1個なのに二桁なら、結合子を`>`に締める。
- スキーマ検証器はマッチ0をsevereで止めるが、指しすぎは素通りさせる。上限は自分で書く。
- クラス名をリファクタするときはJSON-LDも一緒に検索する。スタイルとJSON-LDが同じクラス名に依存していることを教えてくれるlinterは無い。
- 型を足す前に対象範囲を読む。ベータ表記と地域・言語の制限は、たいていドキュメントの最初の段落にある。

一つ答えが出ていない。対象範囲の外だと分かったうえで、この二行を残す判断が正しいのかどうか。消せば保守対象が減る。残せば「このページの核はタイトルと最初の一段落だ」という機械可読の言明が一つ残る。今はゲートがその言明の正しさを保証してくれるので残すほうを選んだが、半年後も同じ答えかは分からない。

構造化データをデプロイゲートに縛り付ける作業は、私が仕事として扱っている領域だ。連絡先はプロフィールにある。
