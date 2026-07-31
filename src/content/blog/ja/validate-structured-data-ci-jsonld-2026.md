---
title: '構造化データはデプロイ前に落とす — JSON-LDをCIで自動検証する'
description: 'JSON-LDパーサーが通しても検索エンジンには読めないマークアップがある。schema.orgの@vocabのせいで、タイポも大文字小文字の誤りも正常なJSON-LDとして展開される。60行のスキーマ対応バリデーターを書き、CIでデプロイ前に捕まえた実測記録。'
pubDate: '2026-07-13'
heroImage: '../../../assets/blog/validate-structured-data-ci-jsonld-2026/hero.png'
tags:
  - 構造化データ
  - JSON-LD
  - CI
  - SEO
relatedPosts:
  - slug: structured-data-syntax-comparison-jsonld-microdata-rdfa-2026
    score: 0.78
    reason:
      ko: 그 글이 "어떤 문법으로 쓸까"를 정했다면, 이 글은 "그렇게 쓴 JSON-LD가 실제로 맞게 쓰였는지 어떻게 매일 자동으로 확인할까"다.
      ja: あちらが「どの構文で書くか」を決めるなら、この記事は「そう書いたJSON-LDが本当に正しいかを毎日どう自動確認するか」。構文選択の次の運用段階だ。
      en: That post picks the syntax; this one asks how you keep verifying, every commit, that the JSON-LD you wrote is actually correct.
      zh: 那篇决定"用哪种语法写"，这篇问的是"你写的 JSON-LD 到底对不对，怎么每次提交都自动验证"。
  - slug: axe-core-ci-a11y-jsdom-vs-browser-2026
    score: 0.72
    reason:
      ko: 접근성을 CI에 넣었더니 color-contrast만 조용히 빠지던 그 이야기와 골격이 같다.
      ja: アクセシビリティをCIに入れたらcolor-contrastだけ静かに抜けた——あの話と骨格が同じ。自動検査が「何を検査しないか」を知らねば緑を誤読する。
      en: Same skeleton as the a11y-in-CI story where color-contrast silently dropped out.
      zh: 和"把无障碍放进 CI 后只有 color-contrast 悄悄消失"那篇骨架相同。
  - slug: json-ld-graph-entity-linking-2026
    score: 0.66
    reason:
      ko: 이 글의 검증기가 노드 단위로 타입과 속성을 본다면, 그 글은 그 노드들을 @graph 하나로 잇는 문제를 다룬다.
      ja: この記事の検証器がノード単位で型と属性を見るなら、あちらはそのノードを@graph一つに繋ぐ問題を扱う。検証の次は連結だ。
      en: This post's validator inspects types and properties node by node; that one wires those nodes into a single @graph.
      zh: 这篇的验证器逐节点检查类型和属性，那篇处理的是把这些节点连成一个 @graph。
  - slug: ai-crawlers-dont-render-javascript-csr-2026
    score: 0.6
    reason:
      ko: 검증을 통과한 JSON-LD도 JS로만 심으면 AI 크롤러 눈엔 없는 것과 같다.
      ja: 検証を通ったJSON-LDもJSでしか差し込まなければAIクローラーには存在しない。この記事が「正しく書いたか」なら、あちらは「載って出るか」だ。
      en: Even validated JSON-LD is invisible to AI crawlers if it's injected only by JS.
      zh: 通过验证的 JSON-LD，若只用 JS 注入，在 AI 爬虫眼里等于不存在。
---

デプロイパイプラインの構造化データ検証が緑になっている。その緑が証明しているのは一つだけ。あなたのJSON-LDが<strong>構文として壊れていない</strong>こと。Googleがその中のフィールドを一つでも読めるという意味ではない。この二つは別の問いなのに、多くのチームは一つだと思い込んでいる。

これを痛感したのは、`@type`を小文字の`article`と書き間違えたマークアップが、パーサーを何の音もなく通過するのを見たときだ。JSON-LDプロセッサーからすれば完璧に有効。Googleからすればただの未知の型で、黙って無視される。その間には何もない。警告も、エラーも、赤信号も。半年後、Search Consoleでリッチリザルトがなぜ出ないのか掘り返して、ようやく気づく。

## 検証には層が二つある

構造化データを「検証する」と言うとき、実は別々の二つを指している。

一つ目は<strong>構文の検証</strong>。このJSON-LDはパースできるか。波括弧が閉じていて、`@context`があり、JSON-LD 1.1プロセッサーがこれをグラフに展開できるか。これは`jsonld`のようなライブラリが完璧にやってくれる。

二つ目は<strong>スキーマ意味の検証</strong>。型名はschema.org語彙に実在する綴り・大文字小文字か。プロパティ名にタイポはないか。日付はISO 8601か。URLフィールドは絶対パスか。Googleがその型に推奨するフィールドが入っているか。これはパーサーが<strong>やってくれない</strong>。

落とし穴はここ。二つ目が失敗しても、一つ目は平然と通る。しかもGoogle公式の検証ツールであるRich Results TestとSchema Markup Validator(validator.schema.org)は、どちらも<strong>ブラウザでURLかコードを貼り付ける手動ツール</strong>だ。あなたのビルドパイプラインの中にはない。誰かが手で開いて確かめない限り、壊れたスキーマはそのまま本番まで流れていく。

[JSON-LD・Microdata・RDFaのどれをいつ使うか](/ja/blog/ja/structured-data-syntax-comparison-jsonld-microdata-rdfa-2026/)を決めたなら、次の問いはこれ。選んだ構文で毎日書くマークアップが、コミットのたびに正しく書けているか、誰が確かめるのか。

## なぜこの隙間が今より高くつくのか

以前は構造化データが静かに壊れても、損害はリッチリザルトのスニペット一つ程度だった。今は違う。検索の重心が移りつつあり、AI概要や生成系の回答を作るクローラーが、ページの意味を掴むときに構造化データへ寄せる比重が増えた。しかもこうしたクローラーの多くは[JavaScriptを実行せず、raw HTMLだけを取っていく](/ja/blog/ja/ai-crawlers-dont-render-javascript-csr-2026/)。つまりサーバーが吐いたJSON-LDが、彼らの見るほぼすべてだ。

そのJSON-LDの`@type`が小文字の`article`だったら? 人の目にはページは正常、パーサーも通す。だが読む機械からすれば、著者も公開日もない正体不明のノードだ。ミス一つの代償が「スニペットを取り逃す」から「AIがこのページを誤解する」へと大きくなった。デプロイ前に落とすことが、それだけ割に合うようになったということだ。

## なぜパーサーはタイポを捕まえないのか

言葉だけでは信じてもらえない気がして、サンドボックスで再現した。Node v22、`jsonld` 8.x。よくあるミスを五つわざと仕込んだ`broken.json`を作った。

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "article",
      "headline": "Broken sample",
      "datePublished": "07/13/2026",
      "authour": "Kim Jangwook",
      "image": "hero.png"
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "name": "Blog", "item": "https://example.com/blog" }
      ]
    }
  ]
}
```

小文字の`article`、タイポの`authour`、米国式の日付`07/13/2026`、相対パスの`hero.png`、`position`が抜けた`ListItem`。これを`jsonld.expand()`に通すと、プロセッサーが各用語をどのIRIに解決するかが見える。

```text
$ node expand-demo.mjs

===== broken.json — jsonld.expand() =====
resolved @type IRIs : http://schema.org/article, http://schema.org/BreadcrumbList, ...
resolved term IRIs  : http://schema.org/article, http://schema.org/authour,
                      http://schema.org/datePublished, http://schema.org/headline, ...
```

肝心なのはここ。`article`は`http://schema.org/article`に、`authour`は`http://schema.org/authour`に<strong>きれいに展開される</strong>。エラーなし。警告なし。捨てられもしない。

理由は、schema.orgが配布するJSON-LDコンテキストが`@vocab`を`https://schema.org/`に設定しているから。`@vocab`があると、プロセッサーは定義されていない文字列を何であれその接頭辞に<strong>そのまま連結する</strong>。`authour`というプロパティがschema.orgに存在するかは確かめない。存在しないIRIを作るだけで、それはJSON-LDの構文上まったく合法だ。パーサーが見るのは構文であって、語彙ではない。

だから「JSON-LDが有効」と「Googleが読める」の間に隙間ができる。この隙間は[散らばったブロックを@graphに繋ぐ問題](/ja/blog/ja/json-ld-graph-entity-linking-2026/)にも地続きだ。連結を語る前に、ノード一つ一つがそもそも有効な型・プロパティで書かれているかが担保されていないといけない。

## 60行のスキーマ対応バリデーター

パーサーが捕まえないなら、スキーマを知る検査を自分で足せばいい。大げさなものはいらない。検査する型の語彙の一部と、ルール五つがあれば足りる。

```javascript
const VOCAB = {
  Article: {
    props: ['headline','datePublished','dateModified','author','image','description'],
    // GoogleはArticleに「必須」プロパティがない(推奨のみ)。headline強制はチーム方針だ。
    recommended: ['headline'],
    urlProps: ['image'], dateProps: ['datePublished','dateModified'],
  },
  BreadcrumbList: { props: ['itemListElement'], required: ['itemListElement'] },
  ListItem: { props: ['position','name','item'], required: ['position','name'], urlProps: ['item'] },
};
const KNOWN = Object.keys(VOCAB);
const ISO = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2})?([+-]\d{2}:\d{2}|Z)?)?$/;
const ABS = /^https?:\/\//;

function checkNode(node, errors) {
  let t = node['@type'];
  if (!KNOWN.includes(t)) {
    const near = KNOWN.find(k => k.toLowerCase() === String(t).toLowerCase());
    if (near) { errors.push(`@type "${t}" 大小文字の誤り → "${near}"`); t = near; }
    else return;
  }
  const spec = VOCAB[t];
  for (const key of Object.keys(node)) {
    if (key.startsWith('@')) continue;
    if (!spec.props.includes(key)) {
      const near = spec.props.find(p => p.toLowerCase() === key.toLowerCase());
      errors.push(`${t}.${key}: 無効なプロパティ${near ? ` → "${near}"?` : ''}`);
    }
  }
  for (const r of (spec.required || [])) if (!(r in node)) errors.push(`${t}: 必須フィールド "${r}" 欠落`);
  for (const d of (spec.dateProps || [])) if (node[d] && !ISO.test(node[d])) errors.push(`${t}.${d}: ISO 8601ではない`);
  for (const u of (spec.urlProps || [])) { const v = node[u]; if (v && !ABS.test(v)) errors.push(`${t}.${u}: 絶対URLではない`); }
  for (const v of Object.values(node))
    (Array.isArray(v) ? v : [v]).forEach(x => x && typeof x === 'object' && x['@type'] && checkNode(x, errors));
}
```

大文字小文字の誤りに出会ったら、エラーを投げて終わりにせず、正しい型に<strong>復旧して検査を続ける</strong>。そうすれば`article`が間違っていることと、そのノード内の`authour`・日付・URLの問題まで一度に全部見える。最初に作ったときこの復旧を入れず、型エラー一つだけ報告して残り四つを取りこぼした。CIで一度に全部見せてこそ往復が減る。

Articleに`required`ではなく`recommended`と書いたのに注目してほしい。Google公式ドキュメントでは<strong>Articleに必須プロパティはない</strong>。`author`、`datePublished`、`dateModified`、`headline`、`image`はすべて「推奨」にすぎない。だからheadlineを強制するのはGoogleのルールではなく、うちのチームの編集方針だ。バリデーターとは、まさにそこ——「公式の推奨の上に自組織が立てた最低基準」——をコードに刻む場所だ。

## 実際に走らせた結果

`good.json`(正常なArticle + 2段のBreadcrumbList)と`broken.json`を同じバリデーターに通した。

![構造化データバリデーターの実際のCI実行ログ。good.jsonはPASS 0 problems、broken.jsonはFAIL 5 problemsで大小文字・タイポ・日付・URL・必須フィールド欠落をすべて捕まえ、exit 1でビルドを止める](../../../assets/blog/validate-structured-data-ci-jsonld-2026/ci-run-log.png)

```text
===== good.json =====
PASS — 0 problems

===== broken.json =====
FAIL — 5 problems
  x @type "article" is wrong casing → "Article"
  x Article.authour: not a valid property → "author"
  x Article.datePublished: "07/13/2026" is not ISO 8601
  x Article.image: "hero.png" must be an absolute URL
  x ListItem: missing Google-required field "position"
process exit code = 1
```

五つ全部を捕まえ、`broken.json`でプロセスが<strong>exit 1</strong>で終わった。この終了コードがすべてだ。`good.json`はexit 0。この一行があれば、CIは追加設定なしにビルドを止める。

`ListItem`の`position`欠落だけが「Google-required」と表示されている点に注目。これは正確だ。BreadcrumbListは最低二つのListItemを要求し、各ListItemは`position`と`name`を実際に要求する(公式)。一方、Article側の四つのエラーには「必須」の札が一つもない。バリデーターが公式ルールとチーム方針を区別して語っているわけだ。

## CIゲートに掛ける

終了コードがすでに1なのだから、残りは配管作業だ。`package.json`にスクリプトを一行。

```json
{ "scripts": { "validate:schema": "node scripts/validate-schema.mjs" } }
```

そしてGitHub Actionsのジョブにステップを一つ。

```yaml
- name: Validate structured data
  run: npm run validate:schema
```

バリデーターが失敗すればジョブが失敗し、壊れたスキーマを含むPRはマージされない。サイト全体を舐めたいなら、ビルドされたHTMLから`<script type="application/ld+json">`ブロックを抜き出し、同じ`checkNode`に流し込めばいい。原理は同じだ。[アクセシビリティ検査をCIに載せた](/ja/blog/ja/axe-core-ci-a11y-jsdom-vs-browser-2026/)ときと骨格は変わらない。人が毎回手で確かめていたものを、失敗すれば赤くなる決定的なゲートに置き換える。

## このバリデーターにできないこと

正直に線を引かないと、この記事は嘘になる。

<strong>これはRich Results Testの代わりではない。</strong>手で選んだ語彙の一部(Article、BreadcrumbList、ListItem、Person)しか知らない。実務ではschema.orgの公開ダンプから型・プロパティ一覧を生成して埋めないと、全体のカバレッジは出ない。ここで見せたのは概念実証であって、完成品ではない。

<strong>検証を通ってもリッチリザルトが出る保証はない。</strong>これは私の意見ではなくGoogle公式の立場だ。一般構造化データガイドラインはこう明言する。「構造化データを使うと機能が<strong>現れうる</strong>ようになるだけで、現れることを保証はしない」。マークアップが完璧でも、Googleのアルゴリズムがユーザー・デバイス・場所に応じて、ただのテキスト結果のほうが良いと判断することがある。さらに「構造化データそれ自体は一般的なランキング要因ではない」とも明記されている。バリデーターが通すのは「形式が正しい」までで、「リッチリザルトが出る」でも「順位が上がる」でもない。そもそもリッチリザルトの資格自体が取り下げられるタイプもある。FAQPageがそうだったが、だからといってマークアップを消すのが答えではなかった。その判断の根拠は[FAQPageのリッチリザルトは終わった。それでもQ&Aマークアップを消すな](/ja/blog/ja/faqpage-deprecation-ai-citation-2026/)に書いてある。

<strong>パーサーの展開は構文しか見ない。</strong>上で見たとおり`@vocab`のせいでタイポも有効なIRIに展開される。だから展開が成功した事実を検証と取り違えてはいけない。二つの層は互いを代替しない。構文はパーサーに、意味はスキーマ対応の検査に任せる。

## 開発者が今日やること

- ビルド成果物のJSON-LDを一度はRich Results Testに手で入れ、基準線を取る。それからその検査をコードに移す。
- よく使う型(たいていArticle/BlogPosting、BreadcrumbList、Organization、WebSite)の語彙とルールから`VOCAB`に入れる。全部埋めようとせず、よく間違えるものから。
- 大文字小文字・タイポ・日付形式・相対URLの四つは必ず検査する。パーサーが絶対に捕まえないものだ。
- Googleの「必須」とチームの「方針」をコードで分けて表記する。あとでなぜこのフィールドを強制するのか迷わない。
- 終了コード1をCIステップに繋ぐ。レポートを出すだけで通せば、誰も見ない。

構造化データをサーバーサイドで確実に出したい、あるいは既存サイトのスキーマ・アクセシビリティ・クローラー対応をデプロイパイプラインの次元で点検したい——そんなときは個人的に相談と実装の依頼を受けている。プロフィールの問い合わせ経路から連絡してほしい。緑の裏に何が残っているかを一緒に覗く、そういう仕事をしている。
