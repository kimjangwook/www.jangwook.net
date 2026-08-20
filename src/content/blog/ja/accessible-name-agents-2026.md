---
title: アクセシブルネームがずれると、音声操作もAIエージェントもボタンを押せない
description: >-
  ボタンにaria-labelを付けたのに、アクセシビリティツリーは画面に出ていない文字を読んでいる。WCAG
  2.5.3 Label in Nameの違反をサンドボックスで再現してツリーで確認し、Lighthouse
  13.3.0の新カテゴリAgentic Browsingで0点が100点に変わる過程を実測した。
pubDate: '2026-07-10'
heroImage: ../../../assets/blog/accessible-name-agents-2026/hero.png
tags:
  - a11y
  - wcag
  - accessibility
  - geo
  - web-development
relatedPosts:
  - slug: a11y-lighthouse-audit-fix-2026
    score: 0.82
    reason:
      ko: "Lighthouse로 접근성 위반을 잡아 고치는 전체 흐름이 궁금하다면 이 글이 출발점이다. 여기서는 그중 accessible name 하나만 깊게 판다."
      ja: "Lighthouseでアクセシビリティ違反を捕まえて直す全体像はこの記事が出発点。本稿はそのうちaccessible nameだけを深掘りする。"
      en: "For the full flow of catching and fixing a11y violations with Lighthouse, start there; this post drills into just the accessible name."
      zh: "想了解用Lighthouse抓取并修复无障碍问题的完整流程，那篇是起点；本文只深入讲accessible name这一项。"
  - slug: axe-core-ci-a11y-jsdom-vs-browser-2026
    score: 0.8
    reason:
      ko: "여기서 손으로 확인한 접근성 트리 검사를, CI에서 axe-core로 자동화하려면 브라우저 실행 여부가 결과를 가른다는 걸 다룬 글이다."
      ja: "本稿で手動確認したアクセシビリティツリー検査を、CIでaxe-coreに自動化する際、ブラウザ実行の有無が結果を分ける話。"
      en: "This checks the accessibility tree by hand; that post shows why running axe-core in a real browser vs jsdom changes the result in CI."
      zh: "本文手动检查无障碍树；那篇讲在CI里用axe-core时，跑真实浏览器还是jsdom会左右结果。"
  - slug: ai-crawlers-dont-render-javascript-csr-2026
    score: 0.74
    reason:
      ko: "AI 크롤러가 raw HTML만 읽는다는 그 글과 짝이 된다. 크롤러는 텍스트를, 에이전트는 접근성 트리를 읽는다 — 둘 다 서버가 내보낸 마크업이 전부다."
      ja: "AIクローラーがraw HTMLしか読まないという記事と対になる。クローラーはテキストを、エージェントはアクセシビリティツリーを読む。"
      en: "A companion to the post on AI crawlers reading only raw HTML: crawlers read text, agents read the accessibility tree — both live off your markup."
      zh: "与「AI爬虫只读raw HTML」那篇互为一对：爬虫读文本，智能体读无障碍树，两者都只吃你输出的标记。"
  - slug: localbusiness-structured-data-server-side-vs-js-2026
    score: 0.68
    reason:
      ko: "접근성 이름을 서버가 확실히 내보내야 하듯, LocalBusiness 구조화 데이터도 JS가 아니라 서버 응답에 있어야 한다는 걸 실측한 글이다."
      ja: "アクセシブルネームをサーバーで確実に出すのと同じく、LocalBusiness構造化データもJSではなくサーバー応答に載せるべきだと実測した記事。"
      en: "Just as accessible names must ship from the server, this post measures why LocalBusiness structured data belongs in the server response, not JS."
      zh: "正如无障碍名称要从服务端稳稳输出，这篇实测了LocalBusiness结构化数据也该放在服务器响应里，而不是靠JS注入。"
---

あるボタンに `aria-label="Submit order"` を付けた。親切心だった。画面には「Send」としか出ていないので、スクリーンリーダー利用者にはもう少していねいに「注文を送信」と読ませたかった。ところが、このボタンのアクセシビリティツリーを開くとこう出る。

```text
button "Submit order"
```

目に見える文字は「Send」、機械が読む名前は「Submit order」。ずれている。このずれ一つで、音声操作の利用者が「Send を押して」と言っても何も起きない。ここまではアクセシビリティを少しかじった人なら知っている話だ。新しいのは三人目の被害者のほうだ。Lighthouse 13.3.0 を走らせたら、`Agentic Browsing` という見慣れないカテゴリがスコア表に並んでいて、私のアイコンボタンはそこで <strong>0点</strong>だった。アクセシビリティツリーが、いまやAIエージェントの読むインターフェースになっているからだ。

今日はこれを言葉で済ませず、サンドボックスで実際に再現した。ありふれたボタンを六つ、わざと違うマークアップで並べてツリーを開き、Lighthouseでアクセシビリティ点とAgentic Browsing点を横に並べて測った。以下のログと数字は、すべてその実験から出た本物の出力だ。

## アクセシブルネームとは何か、なぜ三者が一度に巻き込まれるのか

まず土台から。<strong>アクセシブルネーム(accessible name)</strong>とは、あるUI要素を機械が呼ぶときの名前だ。ボタン、リンク、入力欄といったインタラクティブ要素には、この名前が一つずつ計算されて付く。計算の規則はW3Cの[Accessible Name and Description Computation](https://www.w3.org/TR/accname-1.2/)という別の標準が定めている。おおまかな優先順位はこうだ。

1. `aria-labelledby` が指す要素のテキスト
2. `aria-label` の値
3. 要素本来の名前ソース(`<label for>` でつないだラベル、画像の `alt`、ボタン内のテキストなど)
4. `title` 属性(最後のよりどころ)

肝心なのは、<strong>上のものが下を上書きする</strong>という点だ。`aria-label` を付けると、ボタン内に見えている文字は名前の計算から外れる。これが冒頭の落とし穴だった。親切のつもりの `aria-label` が、画面の「Send」を消してしまったわけだ。

こうして集まった名前が作るのが<strong>アクセシビリティツリー(accessibility tree)</strong>だ。ブラウザはDOMをそのまま渡さない。視覚情報をそぎ落とし、役割(role)と名前と状態だけを残した別のツリーを組み、支援技術に渡す。ここで大事な事実が一つ。このツリーを消費する側が、いま三つに増えた。

- <strong>スクリーンリーダー</strong>:視覚障害の利用者が聞く名前が、このツリーの名前そのものだ。
- <strong>音声操作</strong>:利用者が「OKを押して」と言えば、ソフトはアクセシブルネームが「OK」のコントロールを探す。
- <strong>AIエージェント</strong>:ブラウザ内でページを操作するエージェントは、ピクセルではなくこのツリーを読み、「押せるもの」の一覧を作る。

だからマークアップが名前を誤らせると、三者が同時に崩れる。これはアクセシビリティが「善行」から「実務機能」へ移った合図だと私は見ている。以前は「スクリーンリーダー利用者のために」名前を整えた。いまは「音声インターフェースとAIエージェントがこのボタンを押せないから」整える。同じ作業、増えた理由。

AIクローラーが[JavaScriptを実行せずraw HTMLしか読まない話](/ja/blog/ja/ai-crawlers-dont-render-javascript-csr-2026/)は前に扱ったが、エージェントはそこからもう一歩踏み込む。クローラーがテキストをかき集めるなら、エージェントはツリーから「クリック可能なコントロール」を選び、実際に操作を試みる。どちらも結局、サーバーが送り出したマークアップがすべてだという点は同じだ。

## 同じボタン、違う名前 — ツリーを直接のぞいた

理屈はここまで。一時サンドボックスに静的HTMLを一枚作り、よく見るコントロールを六つ、わざと違うマークアップにした。そしてChromeのアクセシビリティツリーをスナップショットで取った。実際の出力はこうだ。

```text
button "Submit order"          ← 画面テキストは "Send"(不一致)
button "Send order to warehouse"  ← 画面テキスト "Send order" を含む(合格)
button                         ← アイコンだけのボタン、名前なし
button "Send message"          ← アイコンボタンに名前を付与(合格)
StaticText "Delete"            ← divで作ったボタン:そもそもコントロールではない
textbox "Search"               ← placeholder から引いた名前(もろい)
```

一行ずつ見ると、現場で毎日出くわすミスがそのまま並んでいる。

<strong>一行目</strong>が先ほどのLabel in Name違反だ。`aria-label` が画面テキストを上書きし、見える文字と読まれる名前が割れた。

<strong>三行目</strong>は名前が丸ごと空だ。アイコンだけのボタンで、SVGに `aria-hidden="true"` をかけて装飾扱いにしたので、ボタン本体には名前ソースが一つも残らない。スクリーンリーダーはこれをただ「ボタン」とだけ読む。何のボタンかは誰にもわからない。

いちばん印象的なのは<strong>五行目</strong>だ。`<div class="btn">Delete</div>` で作った削除ボタンは、ツリーでは `button` ではなく `StaticText` として出る。つまりコントロールとして<strong>存在しない</strong>。見た目はボタンでも、スクリーンリーダーにも音声操作にもAIエージェントにも、これはただの文字の断片だ。キーボードフォーカスも当たらない。この削除ボタンは、マウスを使う人だけが押せる。

六行目の `textbox "Search"` は合格に見えて落とし穴だ。名前を `placeholder` から引いている。placeholderはラベルではない。入力を始めれば消えるし、一部の支援技術はこれを名前として認めない。画面にラベルが出ていない検索欄が、アクセシビリティの観点では名前なし入力と変わらなくなる瞬間だ。

この六行が大事なのは、ブラウザ開発者ツールのアクセシビリティパネルやツリーのスナップショットが、<strong>点数ではなく実際の名前</strong>を見せてくれるからだ。Lighthouse 100点を見ても油断できない理由がここにある。点数は合否を要約するだけで、「このボタンが正確に何と読まれるか」はツリーを直接見ないとわからない。

## WCAG 2.5.3 Label in Name — aria-labelが画面の文字を覆うとき

一行目の不一致は、勘ではなく明文化された基準の違反だ。W3Cの[Understanding SC 2.5.3: Label in Name](https://www.w3.org/WAI/WCAG22/Understanding/label-in-name)は、これを<strong>レベルA</strong>、つまり最も基本の等級に据える。公式の一文はこうだ。

> 2.5.3を満たすには、目に見えるラベルを構成する文字列が、アクセシブルネームの中に<strong>そっくりそのまま</strong>現れなければならない。

W3Cが挙げる理由は明快だ。音声入力の利用者は、画面に見える文字を声に出してコントロールを操る。「Send」と書かれたボタンを押すには「Send」と言うのに、アクセシブルネームが「Submit order」ならソフトはマッチに失敗する。利用者が見て口にしたその単語が、名前の中にないからだ。

ここでよくある誤解を一つ正したい。`aria-label` は「もっと親切な説明」を足す道具ではない。名前そのものを<strong>差し替える</strong>命令だ。だから画面にテキストがすでにあるコントロールなら、`aria-label` を安易に付けないのが安全だ。どうしても補強が要るなら、W3Cの勧告どおり<strong>見えるラベルを先頭に置いて</strong>後ろに足す。二行目の「Send order to warehouse」がその例だ。画面の「Send order」をそのまま抱えているから2.5.3を通る。

現場で見るこの違反のいちばん多い出どころは、アイコン+テキストのボタンだ。デザインシステムのコンポーネントが `aria-label` をpropで受け取り、開発者がそこに画面テキストと違う文言を入れる。翻訳ファイルでラベルとaria-labelを別管理していて、片方だけ変わることも多い。目では絶対に捕まらない。ツリーを開くか、自動検査を回さないと見えない。

## Lighthouseがついに「Agentic Browsing」を採点する

ここからが今日の実験の本当の驚きどころだ。同じページにLighthouse 13.3.0を走らせたら、見慣れたAccessibilityの隣に `Agentic Browsing` というカテゴリが新しく付いていた。その中の監査項目名は `agent-accessibility-tree`、説明にはこう書いてある。

> よく構成されたアクセシビリティツリーは、AIエージェントがページを探索し操作する助けになる。

GoogleのLighthouseチームが「アクセシビリティツリー = AIエージェントのインターフェース」という命題を、監査項目そのものに組み込んだのだ。私がこの記事で主張しようとしていたことを、ツールのほうが先に採点していた。壊れたページと直したページを並べて測った結果がこれだ。

| カテゴリ | 壊れた版 | 直した版 |
|---|---|---|
| Accessibility | 90 | 100 |
| Agentic Browsing | 0 | 100 |
| SEO | 75 | 100 |
| Best Practices | 100 | 100 |

![修正したサンドボックスページ — すべてのコントロールが名前を持ち、divは本物のボタンになった](../../../assets/blog/accessible-name-agents-2026/fixed-page.png)

アクセシビリティ点は90から100へ10点上がっただけだが、Agentic Browsingは<strong>0から100</strong>へ跳ねた。自動検査が失敗として捕らえたアクセシビリティ項目は三つだった。

- `label-content-name-mismatch` — 一行目の2.5.3違反。失敗ノードとして `<button aria-label="Submit order">` を正確に指した。
- `button-name` — 名前のないアイコンボタン。
- `landmark-one-main` — `<main>` ランドマークの不在。

直した版でやったことは特別ではない。`aria-label` を画面テキストを含む文言に変え、アイコンボタンに名前を与え、`<div class="btn">` を本物の `<button>` にし、入力に `<label for>` をつなぎ、本文を `<main>` で包んだ。マークアップ数行。だがその数行が、三種類の消費者すべてにページを開く。[Lighthouseでアクセシビリティ違反を捕まえて直す全体の流れ](/ja/blog/ja/a11y-lighthouse-audit-fix-2026/)は別にまとめてあるので、今回は名前一つに絞る。

正直に言うと、私はこのAgentic Browsingカテゴリがうれしくもあり、慎重にも見ている。うれしいのは、「アクセシビリティを整えておけばAI時代にも有利だ」という主張に、ようやくツールの裏づけができたからだ。慎重な理由は次で述べる。

## 正直な限界 — 100点はアクセシビリティの完成ではない

まずいちばん大事な限界。<strong>Lighthouseのアクセシビリティ100点は「このページはアクセシブルだ」という証明ではない。</strong>これはaxeとLighthouseの公式ドキュメントが自ら認めている。自動検査は、規則で捕まえられる違反しか捕まえない。実際にスクリーンリーダーで流れをたどって意味が通るか、フォーカス順が自然か、名前が<strong>文脈の中で</strong>理解できるかは、人が確かめるしかない。100点は床を越えた印であって、天井に届いた印ではない。

二つ目、Agentic Browsingカテゴリは<strong>新しく実験的</strong>だ。採点の方式や重みは、この先いくらでも変わりうる。だからこの点数を「AIエージェントが確実にうちのページを操作する」保証と読んではいけない。一つの信号にすぎない。このカテゴリにまつわる具体的な数値は、<strong>参考値(公式の保証ではない)</strong>として扱うのが正しい。

三つ目、アクセシブルネームを直したからといって、検索順位やAI引用が上がる保証はない。そんな保証はどこにもない。アクセシビリティは順位を買う小技ではなく、すでに訪れた(あるいは操作しようとする)利用者とエージェントが、ページをきちんと使えるための土台だ。効果を順位に換算して売った瞬間、それはアクセシビリティではなくうたい文句になる。

四つ目、placeholderを名前に使う六行目のような場合、Lighthouseは合格のように見せることがある。だが前述のとおりplaceholderはラベルではなく、支援技術ごとに扱いが違う。ツールが通したから安全、ではないことを示すもう一つの例だ。自動検査と実際のアクセシビリティの隔たりはCIでもそのまま問題になる。[axe-coreをブラウザで回すかjsdomで回すかで結果が割れる理由](/ja/blog/ja/axe-core-ci-a11y-jsdom-vs-browser-2026/)も同じ筋の話だ。

## 開発者が今日すぐやるチェックリスト

講釈はここまでにして、実際にコードで変えるものだ。アクセシブルネームを崩すミスは、いくつかに絞られる。

<strong>1. 画面にテキストがあるなら、aria-labelで覆うな。</strong>どうしても要るなら、見えるラベルを先頭に置いて拡張する。

```html
<!-- 避ける:画面の文字と名前がずれる(2.5.3違反) -->
<button aria-label="Submit order">Send</button>

<!-- やる:名前を明示しなくていい。ボタンのテキストがそのまま名前 -->
<button type="button">Send order</button>

<!-- 補強が要るなら見えるラベルを先頭に -->
<button aria-label="Send order to warehouse">Send order</button>
```

<strong>2. アイコンだけのコントロールには必ず名前を。</strong>装飾SVGは `aria-hidden` で隠し、名前はボタンに付ける。

```html
<button aria-label="Send message">
  <svg aria-hidden="true" viewBox="0 0 24 24"><path d="…" /></svg>
</button>
```

<strong>3. div/spanにonclickを付けず、本物のbutton/aを使え。</strong>これがツリーからコントロールを丸ごと消す最大の原因だ。キーボードフォーカス、Enter/Spaceの動作、役割まで、ただで付いてくる。

<strong>4. 入力には `<label for>` をつなぐ。</strong>placeholderはラベルではない。

```html
<label for="q">検索</label>
<input id="q" type="text">
```

<strong>5. ランドマークを入れる。</strong>本文は `<main>` で包む。スクリーンリーダー利用者もエージェントも、この構造でページをたどる。

<strong>6. 点数ではなくツリーを見る。</strong>Chrome開発者ツールのAccessibilityパネルで、各コントロールの計算済みアクセシブルネーム(Computed name)を直接見る。画面に見える文字と、実際に読まれる名前が同じかを目で照らし合わせるこの30秒が、Lighthouse 100点より多くを教えてくれる。

この六つは大した技術ではない。それでも一つずれるだけで、スクリーンリーダー利用者、音声操作の利用者、そしていまやAIエージェントまで、三者が同時にボタンの前で止まる。AI時代のウェブ開発だからといって、急に新しいことを覚える必要はない。古くからのアクセシビリティ原則が、消費者が一つ増えたぶんだけ重くなっただけだ。

構造化データをサーバーサイドで確実に出したい、既存サイトのアクセシビリティツリーやGEO/AIO対応を点検したい、という方には、個人的に相談と実装の依頼を受けている。プロフィールの問い合わせ経路から連絡してほしい。派手なリブランディングより、ボタン一つが三者にきちんと読まれるかを一緒に見るほうが、たいてい先だ。
