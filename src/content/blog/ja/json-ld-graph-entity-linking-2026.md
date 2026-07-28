---
title: 'JSON-LDを一つの@graphに束ねる — 散らばった構造化データを検索とAIが読むエンティティモデルへ'
description: '自分のページのJSON-LDを検証ツールにかけたら、三つの島にバラバラだった。@idのノード参照でOrganization・WebSite・Articleを一つの@graphに繋ぎ、jsonldで連結性を実測。3コンポーネントが1つに統合される過程と、Googleが保証しない点まで。'
pubDate: '2026-07-05'
heroImage: '../../../assets/blog/json-ld-graph-entity-linking-2026/hero.png'
tags:
  - 構造化データ
  - JSON-LD
  - SEO
  - GEO
  - Web開発
relatedPosts:
  - slug: localbusiness-structured-data-server-side-vs-js-2026
    score: 0.72
    reason:
      ko: 그 글이 "크롤러가 마크업을 보긴 하는가(SSR vs JS)"였다면, 이 글은 "본 마크업이 서로 이어져 있는가"다. 같은 구조화 데이터를 렌더링과 연결성이라는 다른 축에서 짚는다.
      ja: あちらが「クローラーがマークアップを見るか(SSR vs JS)」なら、この記事は「見たマークアップが互いに繋がっているか」だ。同じ構造化データをレンダリングと連結性という別の軸で扱う。
      en: If that post asked "does the crawler even see the markup (SSR vs JS)," this one asks "is the markup it saw connected to itself." Same structured data, a different axis — rendering versus linkage.
      zh: 如果那篇问的是「爬虫到底看不看得到标记(SSR vs JS)」，这篇问的是「它看到的标记彼此连没连起来」。同一批结构化数据，换成渲染与连通两条不同的轴。
  - slug: hreflang-reciprocity-audit-multilingual-2026
    score: 0.6
    reason:
      ko: 그 글은 hreflang을 30줄 스크립트로 직접 감사해 어긋난 링크를 잡아냈다. 이 글이 jsonld로 연결 컴포넌트를 세는 것과 같은 "문서 말고 직접 검증" 태도를 다국어 SEO에서 보여준다.
      ja: あちらはhreflangを30行スクリプトで自ら監査し、ずれたリンクを捕まえた。本記事がjsonldで連結コンポーネントを数えるのと同じ「ドキュメントではなく自分で検証」の姿勢を、多言語SEOで示す。
      en: That post audited hreflang with a 30-line script and caught the mismatched link. It shows the same "verify it yourself, not the docs" stance this article takes with jsonld's component count, applied to multilingual SEO.
      zh: 那篇用 30 行脚本亲自审计 hreflang，抓出了不对称的链接。它把本文用 jsonld 数连通分量的"不信文档、自己验证"态度，用在了多语言 SEO 上。
  - slug: ai-crawler-control-robots-txt-llms-txt-2026
    score: 0.55
    reason:
      ko: robots.txt가 "누구에게 읽게 할 것인가"라면, @graph 연결은 "읽게 허용한 크롤러에게 무엇을 어떻게 이해시킬 것인가"다. 두 글이 AI 크롤러 대응의 앞뒤를 이룬다.
      ja: robots.txtが「誰に読ませるか」なら、@graph連結は「読ませると許可したクローラーに何をどう理解させるか」だ。二つの記事がAIクローラー対応の前後を成す。
      en: If robots.txt is "who gets to read it," @graph linkage is "what the allowed crawler understands and how." The two form the before-and-after of handling AI crawlers.
      zh: 如果 robots.txt 是「让谁来读」，@graph 连接就是「让获准的爬虫理解什么、怎么理解」。两篇构成应对 AI 爬虫的前后两半。
---

自分のマークアップを`jsonld`ライブラリで`flatten`すると、ある数字が出てくる。連結コンポーネントの数だ。ほとんどのサイトでは、これが2か3になる。`Organization`が一つ、`WebSite`が一つ、`Article`が一つ。それぞれ孤立した島だ。

これが問題だと、長いこと気づかなかった。ページごとに`<script type="application/ld+json">`を二つ三つ埋め込み、Rich Results Testで緑のチェックが出れば終わりだと思っていた。実際、各ブロックは単体では有効だ。文法も正しく、必須プロパティも埋まっている。だが、検索エンジンやAIクローラーが「この記事を公開した組織」「書いた人」「その人が所属する会社」を一つに繋いで理解できるかは、まったく別の話だ。断片が互いを知らなければ、繋がらない。

今回は口だけで済ませず、実際に測ってみた。散らばった版と、`@id`で束ねた`@graph`版を同じ情報で作り、W3CのJSON-LDプロセッサで展開・平坦化して「いくつの島に割れるか」を数字で出した。以下のログと表は、すべてそのサンドボックスの実出力だ。

## なぜ「断片化したJSON-LD」が今こそ問題なのか

数年前なら、断片化したマークアップでもさほど問題なかった。検索エンジンはページ単位でリッチリザルトを抽出し、`Article`が一つきちんとあれば記事カードが出た。ところが検索がエンティティ中心に移り、そこにAI検索(生成エンジン)が乗ったことで、様相が変わった。

AI Overviewやチャットボット型検索は、ページ一つだけを見るのではなく、<strong>エンティティ同士の関係</strong>を読もうとする。「この記事の著者は誰で、その著者はどの組織に属し、その組織の公式サイトは何か」。この関係がマークアップに明示されていれば、機械は推論せずそのまま受け取る。逆に`Article`の`author`がただ`{"@type": "Person", "name": "Jane Doe"}`と書いてあるだけなら、そのJane Doeがサイトの`Organization`とどう関係するかは、マークアップのどこにも書かれていない。機械が勝手に繋いでくれるのを願うしかない。

ここで開発者がやるべきことは明確だと思う。推論に頼らず、関係を明示的に書き下すこと。それこそが`@graph`と`@id`の存在理由だ。AIクローラーに何をどう見せるかは[robots.txtで学習と引用を分けて制御する戦略](/ja/blog/ja/ai-crawler-control-robots-txt-llms-txt-2026)で扱ったが、この記事はその次の段階だ。読むことを許可したクローラーに、<strong>正確なエンティティモデル</strong>を手渡す方法。

## @idとノード参照 — W3Cが定義した繋ぎ方

主役の道具は二つ。`@graph`と`@id`だ。

`@graph`は複数のエンティティを一つの配列に収めるコンテナだ。ページに`<script>`ブロックを三つ散らす代わりに、一つのスクリプト内に`@graph`配列で全エンティティを入れる。ここまでは単なる整理整頓。本命は`@id`だ。

`@id`は各エンティティに一意な識別子を付ける。W3CのJSON-LD仕様は、`@id`だけを持つオブジェクトを<strong>ノード参照(node reference)</strong>と呼ぶ。「文書内の別の場所にあるノードオブジェクトへの参照となりうる、`@id`プロパティのみを含むノードオブジェクト」という定義だ。つまり`Article`の`publisher`に組織全体を書き直す代わりに、`{"@id": "https://example.com/#org"}`の一行だけ書けば「上で定義したあの組織」を指す。

識別子の値には慣習がある。ドメイン+フラグメント(`#org`、`#website`、`#article`)の形だ。肝心なのは、このURIが実際に開けるページである必要はないという点。`@id`はURLではなく<strong>識別子</strong>だ。役割はただ一つ、文書のどこであれ同じエンティティを指すときに常に同じ値を使うこと。逆に別々のエンティティに同じ`@id`を使うと、プロセッサが両者を一つに統合してしまうので避ける。

Googleもこの方式をサポートする。公式ドキュメントはJSON-LDを推奨形式と明記し、複数のエンティティが一つの`@graph`内で互いを参照する構造を問題なく読む。一つ添えておくと、これはGoogle独自のルールではなくW3C標準だ。だからGoogleやBingだけでなく、標準に従うどのJSON-LDプロセッサでも同じように解釈される。

## 実際にやってみた: 散らばった断片 vs 一つの@graph

「繋がる」というのが抽象論では腑に落ちなかったので、二つの版を作って実際にプロセッサにかけた。

一つ目は、よく見る散らばった版だ。`Organization`、`WebSite`、`Article`の三つの断片が、それぞれ`@context`を付けて別々に存在する。`Article`の`author`と`publisher`はインラインで名前だけ書いてある。

```json
[
  { "@context": "https://schema.org", "@type": "Organization", "name": "Acme Bakery", "url": "https://example.com" },
  { "@context": "https://schema.org", "@type": "WebSite", "name": "Acme Bakery", "url": "https://example.com" },
  { "@context": "https://schema.org", "@type": "Article", "headline": "Sourdough at 4am",
    "author": { "@type": "Person", "name": "Jane Doe" },
    "publisher": { "@type": "Organization", "name": "Acme Bakery" } }
]
```

二つ目は、同じ情報を一つの`@graph`に入れて`@id`で繋いだ。`Article`は`author`に`{"@id": ".../#jane"}`、`publisher`に`{"@id": ".../#org"}`を参照し、`Person`は`worksFor`で再び`Organization`を指す。`WebPage`が`WebSite`の一部であること、`BreadcrumbList`がその`WebPage`に属することを明示する。

```json
{
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Organization", "@id": "https://example.com/#org", "name": "Acme Bakery", "url": "https://example.com" },
    { "@type": "WebSite", "@id": "https://example.com/#website", "url": "https://example.com",
      "publisher": { "@id": "https://example.com/#org" } },
    { "@type": "WebPage", "@id": "https://example.com/blog/sourdough#webpage",
      "isPartOf": { "@id": "https://example.com/#website" },
      "breadcrumb": { "@id": "https://example.com/blog/sourdough#breadcrumb" } },
    { "@type": "Article", "@id": "https://example.com/blog/sourdough#article", "headline": "Sourdough at 4am",
      "isPartOf": { "@id": "https://example.com/blog/sourdough#webpage" },
      "author": { "@id": "https://example.com/#jane" },
      "publisher": { "@id": "https://example.com/#org" } },
    { "@type": "Person", "@id": "https://example.com/#jane", "name": "Jane Doe",
      "worksFor": { "@id": "https://example.com/#org" } }
  ]
}
```

続いて短いNodeスクリプトを書いた。`jsonld`ライブラリで両文書をそれぞれ`flatten`し、ノード間の`@id`参照を無向グラフとみなして連結コンポーネント数を数える。コンポーネントが1なら全エンティティが一塊に繋がっており、複数ならその数だけ島に割れている。

```javascript
const flat = await jsonld.flatten(doc);
const graph = flat['@graph'] || flat;
// 各ノードの値のうち、他ノードの@idを指す参照をエッジとして計算し、
// 無向グラフの連結コンポーネント数を数える(DFS)。
```

実行結果だ。加工せずそのまま載せる。

```text
[disconnected islands]
  total nodes (after flatten): 5
  nodes with a stable @id:     0
  @id reference edges:         2
  connected components:        3  => 3 disconnected islands

[connected @graph]
  total nodes (after flatten): 10
  nodes with a stable @id:     7
  @id reference edges:         11
  connected components:        1  => ONE entity graph
```

数字は明快だ。散らばった版は<strong>三つの島</strong>に割れ、安定した`@id`を持つノードは0だった。インラインで書いた`author`と`publisher`は、プロセッサが匿名の空白ノードにしてしまうので、`Article`の`publisher`が上の`Organization`と同じ存在かどうか、マークアップだけでは分からない。一方`@graph`版は参照エッジ11本で全ノードが<strong>一つのコンポーネント</strong>に繋がり、安定識別子を持つノードは7だった。

![Disconnected islands versus connected @graph: 測定した連結コンポーネント数を可視化した図](../../../assets/blog/json-ld-graph-entity-linking-2026/graph-comparison.png)

ここで一つ誤解を正しておく。「三つの島」は「構造化データが無効」という意味ではない。散らばった版も各断片は有効で、Googleは別々のスクリプトブロックを複数でもちゃんと読む。私が測ったのは有効性ではなく<strong>関係の明示性</strong>だ。断片化したマークアップはエンティティ関係を機械の推論に委ね、繋がった`@graph`はそれを釘打ちして手渡す。[LocalBusinessマークアップをサーバーサイドで確実に出す問題](/ja/blog/ja/localbusiness-structured-data-server-side-vs-js-2026)が「クローラーがそもそもマークアップを見るか」だったなら、この記事は「見たマークアップが互いに繋がっているか」だ。

## Googleが保証すること、しないこと

ここは正直に線を引かねばならない。`@graph`でエンティティを繋げば順位が上がる? そんなことは言わない。言えない。

Google公式ドキュメント(General Structured Data Guidelines、Intro to Structured Data)の表現をそのまま移すとこうだ。構造化データはある機能を<strong>表示可能に</strong>するだけで、表示を保証しない。Googleのアルゴリズムは検索履歴、位置、デバイスなど多くの変数を見て、その都度最適と判断する形を選ぶ。リッチリザルトが出ることも、ただのテキスト結果の方が良いこともある。さらに構造化データ関連の手動対策は、リッチリザルトの<strong>表示資格</strong>を失わせるだけで、ウェブ検索の順位そのものには影響しないと明記している。つまり構造化データと中核のランキングは別軸だ。

だから`@graph`連結の価値は「順位上昇」ではなく別のところにある。第一に、リッチリザルトの<strong>表示資格</strong>を安定して確保する(必須プロパティが正しいエンティティに正確に付くから)。第二に、エンティティ関係が明示されていることで、検索エンジンやAIがサイトの知識モデルを誤解なく構築する余地が広がる。この第二点は、私が<strong>断言できない</strong>領域だ。AI検索が私のマークアップを正確にどう消化するかは公開されていない。だから「AIはこう読む」ではなく「標準どおり関係を明示しておけば、読む側が推論する負担が減る」までに留めるのが正しい。それ以上は参考値(公式ではない)として回る業界の主張だ。

## よくある間違い4つと避け方

自分で書きながら、そして他人のマークアップを見ながら、繰り返し引っかかった箇所だ。

<strong>間違い1。同じエンティティをページごとに違う`@id`で書く。</strong> 組織はサイト全体で一つだ。全ページで`https://example.com/#org`に統一して初めて、検索エンジンが「同じ組織」と認識する。ページごとに`#org1`、`#org2`と割れると繋がらない。

<strong>間違い2。`@id`を開けるURLと勘違いして実際のアンカーを作る。</strong> `@id`は識別子でありリンクではない。`#org`のようなフラグメントが実際のページ要素を指す必要はない。一意で一貫していればよい。

<strong>間違い3。インライン重複でエンティティを何個も作る。</strong> `author`に人物オブジェクトを丸ごと書き、別の記事でもまた丸ごと書くと、プロセッサからすれば毎回新しい空白ノードだ。一度`Person`を`@id`付きで定義し、以降は`{"@id": ".../#jane"}`で参照する。

<strong>間違い4。`@graph`に入れるだけで参照を張らない。</strong> 配列に入れても自動では繋がらない。同じ配列にあっても`@id`参照がなければ依然として島だ。私の測定で連結を作ったのは配列ではなく、11本の参照エッジだった。

## 静的サイトで@graphを一度だけ組み立てる方法

理論はいい、実サイトでどう保守するかが肝だ。手で毎ページ`@graph`を組むと`@id`がずれやすい。私はエンティティを二層に分けて管理する。

<strong>サイト全体のエンティティ</strong>は一箇所に固定する。`Organization`、`WebSite`、代表著者の`Person`のように、サイト全体で不変のものはレイアウト(または共通ヘルパー)で一度だけ定義し、`@id`を定数に置く。こうすればサイト内の全ページが同じ`#org`、`#website`を指す。間違い1が根本から断たれる。

<strong>ページ別のエンティティ</strong>は各ページで作る。`WebPage`、`Article`、`BreadcrumbList`はページごとに違うのでローカルで生成するが、全体エンティティを丸ごと書き直さず、`@id`参照だけを張る。組み立て関数はだいたいこんな形だ。

```javascript
// グローバル定数。サイトのどこでも同一
const ORG_ID = 'https://example.com/#org';
const SITE_ID = 'https://example.com/#website';

function buildGraph({ pageUrl, article }) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      globalOrganization,          // @id: ORG_ID (一度だけ定義)
      globalWebSite,               // publisher -> { '@id': ORG_ID }
      buildWebPage(pageUrl),       // isPartOf -> { '@id': SITE_ID }
      buildBreadcrumb(pageUrl),
      buildArticle(article, pageUrl), // author/publisher -> @id参照
    ],
  };
}
```

肝は全体エンティティを<strong>値ではなく参照で再利用</strong>することだ。このブログのようにAstroでビルドする静的サイトなら、`buildGraph`をコンポーネントにして`<head>`に単一の`ld+json`スクリプトとして出力すればいい。クローラーがJS実行なしでHTMLから直接読む形なので、レンダリング方式のせいでマークアップが欠ける問題も避けられる。

## 今日から適用するチェックリスト

自分のサイトに今日適用するなら、この順でやればいい。

1. ページの`<script type="application/ld+json">`ブロックを<strong>一つの`@graph`</strong>にまとめる。
2. 再利用されるエンティティ(`Organization`、`WebSite`、著者`Person`)に、サイト全域で<strong>不変の`@id`</strong>を与える。
3. `WebSite.publisher`、`Article.author`、`Article.publisher`、`Person.worksFor`などを、インラインオブジェクトではなく<strong>`{"@id": ...}`参照</strong>に置き換える。
4. ページ階層を繋ぐ。`WebPage.isPartOf` → `WebSite`、`BreadcrumbList` → `WebPage.breadcrumb`。
5. マークアップを[Schema Markup Validator](https://validator.schema.org/)とGoogle Rich Results Testにかけ、有効性を確認する。
6. (任意)`jsonld`で`flatten`した後、連結コンポーネントが<strong>1</strong>かをスクリプトで検証する。2以上ならどこかで参照が抜けている。多言語サイトなら、同じ「ドキュメントではなく自分で検証」の姿勢で[hreflangの相互参照を30行スクリプトで監査した方法](/ja/blog/ja/hreflang-reciprocity-audit-multilingual-2026)も併せて回してみるとよい。連結の検査を通っても、各ノードの値が正しい保証はない。値の層の穴は[飲食店の営業時間を3層で検証した記録](/ja/blog/ja/restaurant-jsonld-opening-hours-validation-2026)で別途扱った。

ここまでが「関係を明示した」の実測可能な終点だ。順位保証はない。だがリッチリザルトの資格を安定させ、サイトのエンティティモデルを機械が誤解なく読む土台ができる。私は構造化データの中でこれが最も過小評価された作業だと思う。皆が新しいスキーマ型の追加に集中する一方、すでに入れた断片を<strong>互いに繋ぐ</strong>仕事は飛ばしてしまう。

<strong>2026-07-06 追記</strong>: この処方を当ブログにそのまま適用した。分かれていたJSON-LDブロックを一つの`@graph`に統合し（Organization・Person・WebSite・WebPage・BreadcrumbList・BlogPostingの6ノード）、author・publisher・isPartOf・breadcrumbをすべて`@id`参照に置き換えた。チェックリスト6項の連結性検査の結果：記事ページ基準で未解決参照0、連結コンポーネント<strong>1個</strong> — 三つの断片が一つのグラフになった。

構造化データをサーバーサイドで確実に出したい、あるいは既存サイトのJSON-LDを一つのエンティティグラフに整理したい、という点検をお考えなら、個人的に相談と実装のご依頼を承ります。こうした実測をもとに診断します。

---

本記事のようなAI引用・GEOの実測は、noteの連載[「AIに引用されるブログの作り方」](https://note.com/jw_effloow/n/n91d7682a8aff)でも扱っている。検索露出56万回・AI引用19.6万回という当ブログの生データから始まる日本語シリーズだ（一部有料）。
