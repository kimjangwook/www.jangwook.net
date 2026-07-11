---
title: 'JSON-LD vs Microdata vs RDFa — 構造化データの構文、いつどれを使うか(実測比較)'
description: '同じProductエンティティを三つの構文で書き、パーサーに通してバイト数と壊れやすさを実測した。Googleは三つを同等に扱う。ならJSON-LDを勧める本当の理由は順位ではなく、リデザインで生き残る結合度だった。公式ドキュメントと再現ログで整理する選択基準。'
pubDate: '2026-07-11'
heroImage: '../../../assets/blog/structured-data-syntax-comparison-jsonld-microdata-rdfa-2026/hero.png'
tags:
  - 構造化データ
  - JSON-LD
  - SEO
  - Web開発
relatedPosts:
  - slug: localbusiness-structured-data-server-side-vs-js-2026
    score: 0.74
    reason:
      ko: 이 글이 "어떤 문법으로 쓸까"라면, 그 글은 "그 마크업을 크롤러가 실제로 보긴 하는가(SSR vs JS)"다. 문법을 정했다면 다음은 그게 서버에서 확실히 나가는지다.
      ja: この記事が「どの構文で書くか」なら、あちらは「そのマークアップをクローラーが実際に見るのか(SSR vs JS)」だ。構文を決めたら次はそれが確実にサーバーから出るかだ。
      en: This post picks the syntax; that one asks whether the crawler even sees the markup you wrote (SSR vs JS). Once you've chosen JSON-LD, the next question is getting it out server-side.
      zh: 这篇选的是"用哪种语法写"，那篇问的是"爬虫到底看不看得到你写的标记(SSR vs JS)"。语法定了，下一步就是让它从服务端确实输出。
  - slug: json-ld-graph-entity-linking-2026
    score: 0.7
    reason:
      ko: 문법으로 JSON-LD를 골랐다면, 그 다음 과제는 흩어진 JSON-LD 블록을 @graph 하나로 잇는 것이다. 그 글이 바로 그 연결성을 jsonld로 실측한다.
      ja: 構文でJSON-LDを選んだなら、次の課題は散らばったJSON-LDブロックを@graph一つに繋ぐことだ。あちらはその連結性をjsonldで実測する。
      en: If you chose JSON-LD as the syntax, the next task is wiring the scattered blocks into a single @graph. That post measures exactly that connectivity with jsonld.
      zh: 语法上选了 JSON-LD，下一课题就是把散落的 JSON-LD 块连成一个 @graph。那篇正是用 jsonld 实测这种连通性。
  - slug: ai-crawlers-dont-render-javascript-csr-2026
    score: 0.58
    reason:
      ko: 구조화 데이터를 JS로 심으면 AI 크롤러는 못 본다. 문법 못지않게 그게 raw HTML에 실려 나가는지가 관건이라는 걸 그 글이 샌드박스로 보여준다.
      ja: 構造化データをJSで差し込むとAIクローラーは見ない。構文と同じくらい、それがraw HTMLに載って出るかが要だと、あちらはサンドボックスで示す。
      en: Inject structured data via JS and AI crawlers miss it. That post shows in a sandbox why shipping it in the raw HTML matters as much as the syntax you chose.
      zh: 用 JS 注入结构化数据，AI 爬虫看不到。那篇用沙箱证明：它能否随 raw HTML 输出，和你选哪种语法一样关键。
---

コードレビューでこの論争を何度も見てきた。片方は「マークアップは目に見えるHTMLに載ってこそ本物だ」とMicrodataを推す。もう片方は「`<script>`ブロックを一つ放り込めば済む」とJSON-LDを推す。そして大抵、結論が出ないまま「まあ動くしどっちでも」で終わる。

その「どっちでも」が、半年後に静かにツケを払わせる。今日は同じ商品を三つの構文で実際に書き、パーサーに通してみた。バイト数を測り、リデザインが起きたとき何が生き残り何が音もなく壊れるかも再現した。以下のログはすべてそのサンドボックスから出た実出力だ。先に言ってしまうと、これはSEO性能の話ではなかった。<strong>結合度</strong>の話だった。

## 構造化データとは何か、なぜ構文が三つもあるのか

まず土台から。構造化データは、検索エンジンやAIクローラーがページの意味を機械的に読めるように付ける標準のラベルだ。「このテキストは商品名」「これは価格」「これは評価」と明示すれば、クローラーは推測ではなく確定として理解する。語彙(vocabulary)は[schema.org](https://schema.org)が提供する。`Product`、`Offer`、`AggregateRating`といった型やプロパティはそこから来ている。

ここで混同されがちな点がある。schema.orgは「何を言うか」(語彙)を定義するが、それをHTMLに「どう書くか」(構文、syntax)は別の話だ。同じ語彙を三つの構文で書ける。

- **JSON-LD**: ページのどこかに`<script type="application/ld+json">`ブロックを置き、その中にJSONでエンティティを丸ごと記述する。画面には出ない。
- **Microdata**: 見えるHTMLタグに`itemscope`、`itemtype`、`itemprop`属性を直接載せてマークアップする。
- **RDFa**: 同じく見えるHTMLに`vocab`、`typeof`、`property`属性を載せる。RDFaは元々schema.org専用ではなく、任意の語彙を扱う汎用標準だ。

[Google公式ドキュメント](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data)はこの三つをすべてサポートし、その中でJSON-LDを推奨している。ところが同じページはこうも言う。「三つの形式は正しく実装されればGoogleにとって同等に問題ない(equally fine)」。この二文を並べて読むのが肝心だ。推奨はするが、三つのどれを使っても検索で損はしない、という意味になる。ならば推奨の根拠は順位ではなく別のところにある、という話だ。

## 同じ商品を三度書いた

抽象論で終わらせたくなかったので、サンドボックスを作った。Node v22、パーサーは実際のクローラーが使う系統のオープンソース(`web-auto-extractor`、`microdata-node`、`jsonld`)。対象はありふれた商品を一つ。名前、ブランド、価格・通貨・在庫、評価とレビュー数を入れた。

JSON-LDはこうなる。

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Aeropress Go",
  "brand": {"@type": "Brand", "name": "Aeropress"},
  "offers": {"@type": "Offer", "price": "39.95", "priceCurrency": "USD",
             "availability": "https://schema.org/InStock"},
  "aggregateRating": {"@type": "AggregateRating", "ratingValue": "4.8",
                      "reviewCount": "1027"}
}
</script>
```

同じ内容をMicrodataに移すと、プロパティが見えるタグごとに散らばる。

```html
<div itemscope itemtype="https://schema.org/Product">
  <h1 itemprop="name">Aeropress Go</h1>
  <span itemprop="brand" itemscope itemtype="https://schema.org/Brand">
    <span itemprop="name">Aeropress</span>
  </span>
  <div itemprop="offers" itemscope itemtype="https://schema.org/Offer">
    <span itemprop="price">39.95</span>
    <meta itemprop="priceCurrency" content="USD">
    <link itemprop="availability" href="https://schema.org/InStock">
  </div>
  <div itemprop="aggregateRating" itemscope itemtype="https://schema.org/AggregateRating">
    <span itemprop="ratingValue">4.8</span>
    <span itemprop="reviewCount">1027</span>
  </div>
</div>
```

RDFaも構造は近い。`itemprop`の代わりに`property`、`itemtype`の代わりに`typeof`を使う。三つのファイルをパーサーに通して正規化したところ、三つの結果は完全に同一のエンティティになった。name、brand、offers、aggregateRatingが一つも欠けず同じ形で復元された。ここまでは予想どおり。構文が何であれ意味は同じだからだ。

## バイト数が最初に分かれた地点

パース結果は同じでも、マークアップ自体の重さは違った。同じProductエンティティを表現するのに要したバイト数だ。

![三つの構文のマークアップバイト数比較 — JSON-LD 477B、RDFa 594B、Microdata 698B](../../../assets/blog/structured-data-syntax-comparison-jsonld-microdata-rdfa-2026/bytes-comparison.png)

| 構文 | バイト数 | Googleの立場 | 存在する場所 |
|------|---------|------------|------------|
| JSON-LD | 477 B | 推奨 | 独立した`<script>`ブロック |
| RDFa | 594 B | サポート | 見えるHTMLにインライン |
| Microdata | 698 B | サポート | 見えるHTMLにインライン |

MicrodataはJSON-LDより約46%重かった。理由は単純だ。インライン構文は値一つひとつを包むタグと、繰り返される`itemscope`/`itemtype`宣言を要する。価格を見えないように入れるために`<meta>`や`<link>`といった迂回タグまで動員する。

正直、この数字そのものは決め手ではない。200バイトの差で性能は変わらない。だがこの数値は、もっと重要な事実の症状だ。インライン構文は意味を表現するためにDOM構造に乗っている、ということ。その「乗っている」ことが、次の実験で本当の代償を見せる。

## リデザイン一回で評価が消えた

実務でマークアップが壊れる形は、構文エラーではない。リデザインだ。デザイナーが評価ウィジェットを商品本文からサイドバーへ移す。画面上は何の問題もない。星は相変わらずきれいに出る。ところがMicrodataでは、その瞬間`aggregateRating`がProductの子ではなくなる。`itemprop`はDOMの入れ子構造で所属を判断するからだ。

再現してみた。評価ブロックを`<aside>`に移した「リデザイン後」のHTMLを再びパースした。

```text
Product after redesign has aggregateRating? -> false
Keys: @context, @type, name, brand, offers
```

Productから評価がまるごと剥がれ落ちた。`name`、`brand`、`offers`だけが残った。検索結果の星のリッチリザルトが静かに消えるシナリオだ。誰も構文を間違えていない。`itemprop="aggregateRating"`は今もページのどこかに無事にある。ただ親を失っただけだ。しかもこれはビルドが壊れないので、レビューでも捕まらない。

JSON-LDならどうか。評価ウィジェットをサイドバーへ移そうがフッターへ送ろうが、`<script>`ブロックはそのままだ。意味がDOM位置と切り離されているので、リデザインは手を出せない。これがGoogleがJSON-LDを推奨する本当の理由だ。順位ではなく「保守が楽だ」ということ。公式ドキュメントの表現そのままに「実装と保守が最も簡単」。私はこの一文が実務で何を意味するのか、今日その目で確かめた。リデザインで生き残る、という意味だ。この結合度の問題は、[構造化データをサーバーサイドで確実に出す問題](/ja/blog/ja/localbusiness-structured-data-server-side-vs-js-2026)ともつながる。構文を決めたら、それがクローラーに実際に届くかが次の関門だ。

## それでも有効なマークアップがリッチリザルトを保証するわけではない

ここで必ず押さえるべき限界。構文をうまく選んでも、マークアップが完璧に有効でも、リッチリザルトや順位上昇は保証されない。これは私の意見ではなく、[Googleの構造化データポリシー](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)の公式見解だ。有効な構造化データはリッチリザルトへの「資格を与えるだけ(eligible)」で、表示を確定しない。Googleは品質、ページの状態、複数のシグナルを併せて見る。

だからJSON-LDを選んだから星が出る、という話ではない。構文選びは「リッチリザルトが出る確率を上げる」仕事ではなく、「いったん出たリッチリザルトがリデザインでも壊れないよう守る」仕事に近い。この区別を曖昧にしてはいけない。構文選びをSEO性能最適化として売る記事は、まさにこの地点で誠実さを欠く、と私は見ている。

JSON-LDが意味的にも問題ないかも確かめた。`jsonld`ライブラリでRDFに展開すると14個のトリプルが出た。構文ごとにパースできるだけでなく、標準のRDFグラフとして丸ごと解けるという意味だ。

```text
JSON-LD expands to 14 RDF triples
_:b0 <http://schema.org/aggregateRating> _:b1 .
_:b0 <http://schema.org/brand> _:b2 .
_:b0 <http://schema.org/name> "Aeropress Go" .
_:b0 <http://schema.org/offers> _:b3 .
```

## JSON-LDの唯一の弱点、そしてそれが罠である理由

JSON-LDを推す記事があまり触れない弱点が一つある。目に見えない、という点だ。`<script>`ブロックは画面と切り離されているので、開発者はJSON-LDの値と実際にページに見える値を別々に管理することになる。価格を39.95と表示しながら、JSON-LDには更新前の34.95が残っている事故はここから出る。Microdataはそもそも見えるテキストをマークアップするので、こういうズレが構造的に起きにくい。

問題は、これが実際にGoogleポリシー違反だということだ。構造化データはユーザーに見えるコンテンツと一致していなければならない。見えない情報をマークアップしたり、画面の値と違う値を入れたりすると、リッチリザルトの資格を失うか手動対策を受けることがある。だからJSON-LDの「分離」は諸刃だ。リデザインには強いが、値の真実性を人間が別途保証しなければならない。

私の対処は単純だ。JSON-LDを手で書かない。ページをレンダリングするまさにそのデータソースからJSON-LDも一緒に生成する。価格を描く変数とJSON-LDの`price`が同じ変数を参照すれば、そもそもズレようがない。これがサーバーサイド生成が単なる便利さではなく整合性の仕組みである理由だ。手で管理するJSON-LDは、Microdataの脆さを別の形で買い戻すのと同じだ。

## ではいつどれを使うか(決定基準)

三つの構文がGoogleに同等なら、選択は検索性能ではなくエンジニアリングの基準で下すべきだ。私が使う決定基準はこうだ。

- **基本はJSON-LD。** 99%のケースで正解だ。サーバーでオブジェクト一つとして生成し、ページごとにブロック一つで管理し、ユニットテストで検証できる。DOMと分離しているのでリデザインに強い。
- **Microdata/RDFaは`<script>`を入れられないときだけ。** ロックされたCMS、テンプレート編集権限が限られた環境、スクリプト挿入が塞がれたメールHTMLなど。このときは見えるタグに載せるインライン構文が唯一の選択肢だ。
- **RDFaはschema.org外の語彙まで混ぜるとき。** 純粋なschema.orgだけならRDFaの汎用性に実益はない。行政や図書館のデータのように、複数の語彙をRDFで相互運用する特殊な状況でだけ値を出す。

避けるべきことも明確だ。**同じページで同じエンティティを二つの構文で重複マークアップするな。** JSON-LDでProductを書きながら同じものをMicrodataでも載せると、クローラーが重複や矛盾として読むことがある。一つだけ選んで一貫して進める。

そしてどの構文であれ、**CIで検証しろ。** 私はビルド段階でJSON-LDをRDFに展開し、トリプル数と連結成分を確認する。今日の実験で見たとおり、マークアップは構文エラーなしに静かに意味を失うことがある。人の目では捕まらない。この「散らばった断片を一つに繋いで検証する」話は、[JSON-LDを@graphでまとめる記事](/ja/blog/ja/json-ld-graph-entity-linking-2026)でさらに深く扱った。そしてそもそもこのマークアップが[AIクローラーが実行しないJSに埋もれていないか](/ja/blog/ja/ai-crawlers-dont-render-javascript-csr-2026)も併せて点検すべき問題だ。

## 実務でよく出る質問

**すでにMicrodataでサイトを組み終えた。今JSON-LDに変えるべき?** 急がない。ちゃんと動いていてリデザインの予定がなければ、そのままでもGoogleは問題視しない。ただ次の大規模なテンプレート改修のときにJSON-LDへ移すのをロードマップに入れておけばいい。改修はどのみちインラインマークアップが最も壊れやすい瞬間なので、そこが移行の好機だ。

**二つを混ぜてはなぜダメ? バックアップのように安全では?** 安全ではない。同じエンティティを二つの構文で書くと、値が食い違ったときクローラーがどちらを信じるか分からない。バックアップではなく、矛盾の地点を一つ増やすことだ。構文はエンティティごとに一つに統一する。

**検証はRich Results Testを回せば十分?** それも必要だが、オンラインツールは一ページずつ手で回すものなので回帰を捕まえられない。私はビルドパイプラインでJSON-LDをパース・展開して必須プロパティの存在と連結性を自動確認する。今日再現した「リデザインで評価が静かに抜ける」事故は、こういうCIゲートがあってこそ次のデプロイ前に捕まる。

## 今日確かめた結論

構文論争は最初から間違った問いだった。「どれがSEOに有利か」と問えば答えはない。Googleが三つを同等に扱うからだ。正しい問いは「どれが自分たちのコードベースで半年後も壊れないか」だ。その問いには答えが明確だ。意味をDOMから引き剥がして独立したブロックで管理するJSON-LDだ。

測定でまとめるとこうなる。三つの構文はパース結果が同じ(同一エンティティを復元)だが、バイトはJSON-LDが最も軽く(477対594対698)、リデザインの脆さでインライン構文は音もなくデータを失う(評価脱落を再現)。Google公式は三つを同等に見つつ、保守性を理由にJSON-LDを勧める。有効なマークアップもリッチリザルトを保証しないという限界はそのまま残る。

構造化データをサーバーサイドで確実に出したい、あるいはリデザインでも壊れないよう既存サイトのマークアップ構造と検証パイプラインを点検したいなら、個人的に相談と実装の依頼を受けている。プロフィールの問い合わせ経路から気軽に連絡してほしい。
