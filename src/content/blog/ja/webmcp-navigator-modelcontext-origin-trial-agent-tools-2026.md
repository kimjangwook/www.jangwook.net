---
title: 'WebMCPがオリジントライアルに入った — provideContextが半年で消えた理由'
description: WebMCPがChrome 149のオリジントライアルとして実際に配備された。だが2月に紹介されたAPIはもう変わっている。navigator.modelContextはdocument.modelContextへ移り、provideContextはセキュリティ上の理由で削除された。公式文書と仕様Issueを根拠に、今登録すべきツールの形と安全のためのアノテーションを整理する。
pubDate: '2026-07-26'
heroImage: ../../../assets/blog/webmcp-navigator-modelcontext-origin-trial-agent-tools-2026/hero.png
tags:
  - WebMCP
  - AI-Agent
  - Chrome
  - web-development
  - security
relatedPosts:
  - slug: webmcp-chrome-146-ai-tool-server
    score: 0.82
    reason:
      ko: 저 글이 "브라우저가 툴 서버가 된다"는 개념을 소개한 2월 기록이라면, 이 글은 그 API가 오리진 트라이얼에서 실제로 어떻게 바뀌었는지를 추적한다. 같은 기술의 개념편과 배포편으로 이어 읽으면 좋다.
      ja: あちらが「ブラウザがツールサーバになる」という概念を紹介した2月の記録なら、本記事はそのAPIがオリジントライアルで実際にどう変わったかを追う。同じ技術の概念編と配備編として続けて読める。
      en: If that post introduced the concept that "the browser becomes a tool server" back in February, this one tracks how that API actually shifted once it hit the origin trial. Read them as the concept and the shipping chapters of the same technology.
      zh: 那篇是二月介绍"浏览器成为工具服务器"这一概念的记录，本文则追踪该API进入origin trial后实际发生了怎样的变化。可作为同一技术的概念篇与落地篇连读。
  - slug: mcp-vs-a2a-vs-open-responses-agent-protocol-comparison-2026
    score: 0.66
    reason:
      ko: WebMCP는 MCP를 브라우저 안으로 끌어온 것이다. 서버사이드 MCP·A2A·Open Responses가 어떻게 갈리는지 먼저 잡아두면, 브라우저판 툴 노출이 전체 프로토콜 지형에서 어디에 놓이는지 보인다.
      ja: WebMCPはMCPをブラウザの中へ持ち込んだものだ。サーバサイドのMCP・A2A・Open Responsesの違いを先に押さえておくと、ブラウザ版のツール公開がプロトコル地形のどこに座るか見えてくる。
      en: WebMCP pulls MCP into the browser. Once you have the server-side split between MCP, A2A, and Open Responses in your head, it's clearer where in-browser tool exposure sits on the protocol map.
      zh: WebMCP把MCP搬进了浏览器。先厘清服务端MCP、A2A与Open Responses的分野，就能看清浏览器端的工具暴露在整个协议版图中的位置。
  - slug: mcp-apps-interactive-ui-agent-ux
    score: 0.6
    reason:
      ko: 에이전트가 페이지의 툴을 호출하기 시작하면 UI가 곧 에이전트의 인터페이스가 된다. 인터랙티브 UI를 에이전트 UX로 다룬 저 글이 WebMCP 이후의 화면 설계 고민과 이어진다.
      ja: エージェントがページのツールを呼び始めると、UIはそのままエージェントのインターフェースになる。インタラクティブUIをエージェントUXとして扱ったあの記事が、WebMCP以後の画面設計の悩みに繋がる。
      en: Once agents start calling a page's tools, the UI effectively becomes the agent's interface. That post on interactive UI as agent UX connects to the screen-design questions WebMCP raises.
      zh: 一旦智能体开始调用页面的工具，UI就成了智能体的接口。那篇把交互式UI当作智能体UX来讨论的文章，正好接上WebMCP之后的界面设计问题。
---

一つのページにスクリプトが二つあるとしよう。片方は自分が置いた決済ヘルパー、もう片方は広告タグが引き込んだサードパーティだ。2月ドラフトのAPIなら、二つ目のスクリプトがこの一行を実行した瞬間、自分のツールは静かに消える。

```js
// 旧ドラフトAPI — 現在は削除済み
navigator.modelContext.provideContext({ tools: [ /* この配列が全部を上書きする */ ] });
```

`provideContext`は「このページのツール一覧は今からこれだ」とまるごと宣言する方式だった。便利に見える。だが複数のスクリプトが一つのドキュメントを共有する現実のウェブでは、上書きはそのまま乗っ取りになる。このメソッドは半年もたずに仕様から外れた。WebMCPがChrome 149のオリジントライアルとして実際に配備されたことで、2月に紹介されていたインターフェースはすでに二度変わっている。本記事は、何がどう変わり、今どうコードを書くべきかを公式文書に沿って整理した記録だ。

## WebMCPとは何で、なぜ今また見るのか

WebMCP(Web Model Context Protocol)は、ウェブページが自分の機能をAIエージェントへ「呼び出し可能なツール」として公開するブラウザ標準だ。サーバサイドMCPがローカルアプリやリモートサーバをエージェントに繋いだのに対し、WebMCPはその接続点をブラウザの中、ドキュメントそのものへ移す。ページが「商品フィルタ」「カートに追加」といった動作を構造化ツールとして登録すれば、ブラウザに接続したエージェントがそのツールをスキーマ通りに呼ぶ。人がクリックしていたボタンを、エージェントが関数のように呼ぶわけだ。

発想自体は新しくない。W3C Web Machine Learning Community Groupが2026年2月10日、Google・Microsoftのエンジニアを中心に初公開し、私もその頃に[ブラウザがエージェントのツールサーバになる仕組み](/ja/blog/ja/webmcp-chrome-146-ai-tool-server)を概念中心に一度扱った。あれはドラフトだった。今は違う。Chrome公式文書は「Join the WebMCP origin trial from Chrome 149」と明記し、オリジントライアルのトークンを取って本番ドメインで有効化できる段階へ進んだ。概念が実物になると必ず、設計図と施工結果がずれる箇所が出る。そのずれこそが本記事の核だ。

なぜブラウザの中でなければならないのか、という問いが残る。サーバサイドMCPだけでもエージェントにツールは渡せるからだ。答えは状態にある。ログインセッション、カート、いま画面に出ているフィルタ条件——こうしたものはブラウザタブの中でしか完全に成立しない。サーバツールがその状態へ届くには、別途の認証と同期をまた積み上げる必要がある。一方、ページが自分のツールを直に公開すれば、エージェントはユーザーが既にログイン済みのそのセッションのまま動作を呼ぶ。ローカルアプリのインストールも、別のAPIキー交換もいらない。この「既に開いている文脈をそのまま使う」点がWebMCPの存在理由であり、同時に次節で見るセキュリティ緊張の源でもある。

先に期待値を下げておく。オリジントライアルは正式標準ではない。いつでも変わりうるし、実際すでに二度変わった。だから以下のコードを「確定API」として覚えず、「今この時点の形であり、次の四半期にまた動きうるもの」として受け取るほうが安全だ。

## 2月ドラフトと現行配備版が分かれた二箇所

変わったのは大きく二つ。一つはAPIがぶら下がる場所、もう一つはツールを登録するやり方だ。

| 項目 | 初期ドラフト(2月頃) | 現行オリジントライアル |
|---|---|---|
| エントリポイント | `navigator.modelContext` | `document.modelContext`(Chrome 150から`navigator.modelContext`はdeprecated) |
| ツール登録 | `provideContext({ tools })`で一覧をまるごと宣言 | `registerTool(tool, { signal })`で一つずつ追加 |
| ツール削除 | `clearContext()` | 登録時に渡した`AbortSignal`を`abort()` |
| 名前衝突 | provideContextが既存ツールを先に消して上書き | 同名が既にあれば`registerTool`がエラーを投げる |

まずエントリポイントの移動から。仕様文書は「each Document object has an associated ModelContext」と書いており、`document.modelContext`が正本だ。ところがオリジントライアル初期のChromeは`navigator.modelContext`で載せて出した。現在のChrome開発者文書の命令型APIの例は`document.modelContext`を使い、`navigator.modelContext`はChrome 150でdeprecatedと明示された。つまり仕様と実装がしばらく別の場所を指したあと、実装が仕様側へ追いついた過渡期だ。2月ドラフトの例をそのままコピペしていたなら、今のChromeではエントリポイントから食い違う。

登録方式の変化のほうが重い。`provideContext`は「全置換」モデル、`registerTool`は「個別追加」モデルだ。この違いは利便性の話ではなく、セキュリティ設計の帰結である。

## registerToolの実際の形

今登録すべきツールはこう見える。Chrome命令型API文書に基づく。

```js
const controller = new AbortController();

await document.modelContext.registerTool(
  {
    name: "filter_products",
    description: "Filter the product list by category and max price.",
    inputSchema: {
      type: "object",
      properties: {
        category: { type: "string", description: "Product category" },
        maxPrice: { type: "number", minimum: 0, description: "Upper price bound" }
      },
      required: ["category"]
    },
    annotations: { readOnlyHint: true, untrustedContentHint: false },
    async execute({ category, maxPrice }) {
      // 実際のDOM操作・状態変更はここで、クライアントJSで
      applyFilter(category, maxPrice);
      return `Filtered by ${category}` + (maxPrice ? ` under ${maxPrice}` : "");
    }
  },
  { signal: controller.signal }
);

// このツールをこれ以上公開したくないとき
controller.abort();
```

構成要素を解く。`name`はツール識別子、`description`はエージェントがいつこのツールを呼ぶか判断するための自然言語説明、`inputSchema`はJSON Schemaで書いた入力契約だ。`execute`は非同期コールバックで、入力を受け取り実際の動作をクライアントJavaScriptで行い、結果文字列を返す。`annotations`は任意だが実務では事実上必須で、その理由は次節で扱う。

注目すべきはツール削除の作法だ。独立した`unregisterTool`メソッドは文書に見当たらない。代わりに登録時、第二引数として`{ signal }`を渡し、あとで`controller.abort()`を呼んで取り外す。ページのルーティングに応じてツールを出し入れするなら、各ルートでコントローラを新たに作って管理するパターンが自然だ。反対側のエージェント側コードは`getTools({ fromOrigins: [...] })`で公開ツールを照会し、`executeTool(tool, '{"category":"shoes"}', { signal })`で呼び出す。

`inputSchema`をJSON Schemaで強制する点は、サーバサイドMCPを触った人には馴染むはずだ。[MCP・A2A・Open Responsesがそれぞれどうツールを記述するか](/ja/blog/ja/mcp-vs-a2a-vs-open-responses-agent-protocol-comparison-2026)を比べておくと、WebMCPがなぜわざわざブラウザの中で同じスキーマ契約を求めるかの文脈が掴める。契約が同じだからこそ、エージェントはサーバのツールでもページのツールでも同じ手順で扱える。

Chrome文書はこの命令型(imperative)方式のほかに、宣言型(declarative)方式も併せて紹介する。既存のHTMLフォームに`toolname`・`tooldescription`といった属性を付けるだけでツールを公開する方法だ。JSで`execute`を書く代わりに、既存マークアップにエージェントが読めるヒントを乗せる。フォームのフィールドがそのままツールのパラメータになる。どちらが合うかは状況次第だ。すでにサーバレンダリングされたフォームとリンクで動くサイトなら宣言型のほうがコードを増やさず、クライアント状態を細かく操作する動作なら命令型`registerTool`が制御力をくれる。私は多くの実サイトが両方を混ぜて使うようになると見る。照会系の動作は宣言型で軽く、状態を変える動作は命令型でアノテーションまで付けて。

## provideContextはなぜ削除されたのか

ここが本記事で一番言いたいところだ。`provideContext`が消えたのは整理のためのリファクタリングではなく、明白なセキュリティ欠陥のためだった。

W3C WebMCPリポジトリのIssue #101は問題をこう書いた。「While the `navigator.modelContext.registerTool()` method throws an error if a tool with the same name already exists, this security mechanism is bypassed with `navigator.modelContext.provideContext()` that first clears the existing tools before registering new ones.」つまり、`registerTool`は同名ツールが既にあればエラーを投げて上書きを防ぐのに、`provideContext`は登録前に既存ツールをすべて消すため、その防御が無効化される。

問題は、この防御が無効化されたとき何が起きるかだ。Issueの脅威モデルはこう説明する。「a malicious or accidental third-party script can overwrite it. This could allow the third party to proxy tool calls, effectively observing the entire agent-user interaction, which may include private data.」オンラインストアのように、ファーストパーティとサードパーティのスクリプトが一つのページに混じる環境を思い浮かべればいい。悪意であれ事故であれ、サードパーティのスクリプトが自分の決済ツールを自分のものに差し替えれば、そのサードパーティはエージェントとユーザーの間のすべてのツール呼び出しを中継して覗ける。そこには個人情報が混じる。

提案された解決は、provideContextを名前衝突時に失敗させるか、strictフラグを付けるか、事前点検用の照会APIを公開するかの三筋だった。結果としてIssue #101はPR #132でクローズされ、現行実装は`provideContext`/`clearContext`を取り払い`registerTool`中心へ収束した。「全置換」という便利メソッド一つが、共有スクリプト環境では乗っ取りベクタになるという判断だ。私はこの決定は正しいと見る。ブラウザAPIで「既存を全部消して自分ので埋める」動作は、ほぼ常に誰かの罠になる。

## 確認できたことと、できなかったこと

正直に線を引く。オリジントライアルを実際のエージェントで最後まで回すには、Chrome 149以上とオリジントライアルのトークン、そしてこのAPIを消費するエージェントが要る。本記事を書く環境でブラウザ・エージェント往復までは再現していない。だから私が検証した範囲は「ツールの入力契約が実際に成立するか」までだ。

`inputSchema`がJSON Schemaである以上、エージェントが送る引数はそのスキーマで検証される。そこで上の例のスキーマをNodeでAjvにコンパイルし、いくつかの引数を通してみた。

```
{"category":"shoes","maxPrice":120} => PASS
{"maxPrice":120}                     => FAIL ["must have required property 'category'"]
{"category":"shoes","maxPrice":-5}   => FAIL ["must be >= 0"]
description length: 50 (within 500 budget)
```

`required`に入れた`category`が欠ければ弾かれ、`minimum: 0`を破った負数も弾かれる。当たり前に見えるが、実際に回すと一つはっきりする。`execute`コールバックの中で入力を再防御する必要は減るが、スキーマを緩く書けばその分だけ検証も緩む、ということだ。`maxPrice`に`minimum`を掛けていなければ、負の価格がそのまま`execute`まで入ってくる。スキーマがそのまま防御線になる。

限界も明確にしておく。これはブラウザ往復ではなく、スキーマ契約だけを検証したものだ。実際のエージェントがdescriptionを見てこのツールを正しく選ぶか、複数ツールの間で混同しないかは別問題で、それはオリジントライアルを付けた実サイトで測り直すしかない。

## 今、開発者がやること

まとめる。WebMCPは「いつか」ではなく、オリジントライアル段階の「今、有効化して試せる」技術になった。ただしAPIはまだ動いており、その動きの向きは一貫して「セキュリティ」だ。すぐ手を付ける人のためのチェックリストで締める。

- **エントリポイントは`document.modelContext`へ。** 2月の例の`navigator.modelContext`はChrome 150でdeprecatedだ。旧コードをコピーしたなら、まずここを直す。
- **ツールは個別登録・個別解除で設計する。** `registerTool` + `AbortSignal`の組み合わせが正本だ。「全置換」の発想は捨てる。
- **名前は一意に、衝突はエラーで受ける。** `registerTool`は重複名にエラーを投げる。これを回避しようとせず、名前空間を接頭辞で管理する。
- **アノテーションは必ず付ける。** ユーザー生成・外部流入のデータを扱うツールには`untrustedContentHint`、状態を変えない照会ツールには`readOnlyHint`。Chromeセキュリティ文書の明示的な推奨だ。
- **オリジンを信頼の基準にする。** 文書は「Only expose your tools to origins that you trust」と釘を刺す。特にユーザーデータを触るツールほど。
- **文字予算を守る。** ツール説明500字、パラメータ説明150字、ツール出力1.5Kが推奨値だ。

最後に、Chrome文書自身が認める限界を引いておく。「it's impossible to guarantee safety inside of a large language model (LLM).」ツールをうまく設計しても、LLM内部の安全は保証されない。WebMCPのセキュリティアノテーションとオリジン制限は、リスクを消す装置ではなく減らす装置だ。この前提を敷いて設計するのと、これを忘れて「標準が勝手に防いでくれる」と信じるのとでは、差は大きい。

エージェントが呼べるようサイトのツールを設計したり、サードパーティスクリプトの混じるページでWebMCP公開のセキュリティ境界を点検したいなら、個人で相談・実装の依頼を受けている。プロフィールの問い合わせ経路から連絡してほしい。
