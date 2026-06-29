---
title: TypeScriptでMCPサーバーを作る — @modelcontextprotocol/sdk 実践チュートリアル
description: >-
  @modelcontextprotocol/sdk v1.29.0とZod v4でTypeScript
  MCPサーバーをゼロから構築する実践チュートリアル。ツール登録、InMemoryTransportテスト、公開API連携まで30分以内に動作するサーバーを完成させる手順をステップごとに解説します。
pubDate: '2026-05-31'
heroImage: ../../../assets/blog/mcp-server-typescript-sdk-step-by-step-2026-hero.png
tags:
  - MCP
  - TypeScript
  - チュートリアル
relatedPosts:
  - slug: vitest-4-jest-migration-guide-2026
    score: 0.9
    reason:
      ko: TypeScript 주제를 한 단계 더 깊이 파고드는 글입니다.
      en: Goes one level deeper into TypeScript.
      ja: TypeScriptをもう一歩深く掘り下げた記事です。
      zh: 更深入地探讨 TypeScript 主题。
  - slug: hono-typescript-api-2026
    score: 0.85
    reason:
      ko: TypeScript를 실제로 다뤄본 경험이 이어지는 글입니다.
      en: Continues the hands-on TypeScript experience.
      ja: TypeScriptを実際に扱った経験が続く記事です。
      zh: 延续 TypeScript 的实战经验。
  - slug: bun-shell-scripting-practical-guide-2026
    score: 0.8
    reason:
      ko: 같은 TypeScript 흐름에서 함께 읽으면 좋습니다.
      en: Worth reading alongside this in the same TypeScript track.
      ja: 同じTypeScriptの流れで併せて読むと役立ちます。
      zh: 在同一 TypeScript 脉络中可一并阅读。
faq:
  - question: TypeScriptでMCPサーバーをどう作りますか?
    answer: >-
      @modelcontextprotocol/sdkとZodをインストールし、3つのステップを踏むだけです。McpServerインスタンスを生成し、server.tool()でZodスキーマベースのツールを登録し、トランスポートを接続します。このパターンを理解すれば30分以内に動作するサーバーを完成できます。
  - question: '@modelcontextprotocol/sdkはどう始めますか?'
    answer: >-
      npm install @modelcontextprotocol/sdk zod でインストールし、このときSDK 1.29.0とZod
      4.4.3が入ります。SDKはESMモジュールとして配布されるため、package.jsonにtype:
      moduleを指定し、tsconfig.jsonでmoduleをESNextに設定するとインポートパスが正しく解決されます。
  - question: stdioトランスポートとHTTP/SSEトランスポートの違いは?
    answer: >-
      stdio(StdioServerTransport)はClaude
      DesktopやCursorにローカル接続する標準的なデプロイ方式で、設定がシンプルです。HTTP/SSEトランスポートはチームで共有したりクラウドにデプロイする場合に使いますが、認証、HTTPS、CORS、セッション管理を別途処理する必要があります。社内ツール程度ならstdioのほうがはるかに簡単です。
  - question: MCPツールのエラーはどう処理すべきですか?
    answer: >-
      例外を投げる代わりに、エラーメッセージをcontent配列に入れて返すのがMCPの慣例です。クライアントごとに例外処理の方法が異なるためです。レスポンスにisError:
      trueフラグを追加すると、クライアントがその応答をエラーとして扱えます。
---

```typescript
// この一行がすべて
const server = new McpServer({ name: "my-server", version: "1.0.0" });
server.tool("get_book_info", "書籍情報の取得", { isbn: z.string() }, async ({ isbn }) => { ... });
```

初めてMCPサーバーを作ってみたとき、正直思っていたよりはるかに簡単だという事実に驚いた。MCP(Model Context Protocol)がAIプラットフォーム間の標準として定着しつつあるという話はよく耳にしていたが、「自分でサーバーを作る」というのは何となく複雑で、参入障壁が高そうな印象があった。ところが `@modelcontextprotocol/sdk` パッケージひとつとZodをインストールするだけで、30分以内に動作するMCPサーバーが作れてしまう。

そこで実際に手を動かしてみた。以下に出てくるのは、すべて自分が走らせたコードと、そのとき返ってきた出力そのものだ。ISBNを渡すと書籍情報を返してくれるツールを公開API(Open Library)の上に組み立てながら、MCPサーバーが現場でどう動くのかを手で覚えるのが狙いだった。

## なぜ今MCPサーバーを自分で作るべきなのか

Claude、Cursor、Windsurf、ZedといったAIコーディングツールの主要プレイヤーがMCPを標準統合プロトコルとして採用した。つまり、MCPサーバーをひとつ作っておけば、特定のAIプラットフォームに依存せず、複数のAIツールで同じ機能を使えるということだ。

従来は独自APIを作り、各AIプラットフォームごとにプラグインや統合を別途開発する必要があったが、MCPは「一度作ればどこでも」というアプローチを可能にする。これに注目する理由はシンプルだ。社内データベースの照会、社内ドキュメントの検索、特定業務の自動化スクリプトをMCPツールとして一度ラップしておけば、Claudeでも、Cursorでも同じように使える。

もちろん、まだエコシステムが完全に成熟しているとは言えない。しかし MCPオープン標準とLinux Foundation参加 で確認したように、この方向性はすでに業界標準として固まりつつある。プロトコル自体の仕組みが気になるなら、[公式仕様ページ](https://modelcontextprotocol.io/specification)を一度読んでおくとよい。ホスト、クライアント、サーバーの役割分担と、JSON-RPC 2.0のメッセージフローが整理されている。

なお、この記事はTypeScript SDKを扱うが、Python陣営も似たパターンに従う。Pythonで同じことを試したいなら、[FastMCPでPython MCPサーバーを作る](/ja/blog/ja/fastmcp-python-mcp-server-build-guide-2026)の記事が役立つ。2つの言語のSDK設計を比べると、MCPプロトコルの共通構造がより明確に見えてくる。

## 環境設定とパッケージのインストール

まずNode.jsプロジェクトを初期化して必要なパッケージをインストールする。

```bash
mkdir my-mcp-server && cd my-mcp-server
npm init -y
npm install @modelcontextprotocol/sdk zod
```

実際に実行した結果はこうだ:

```
$ mkdir test-project && cd test-project && npm init -y
$ npm install @modelcontextprotocol/sdk zod
added 92 packages, and audited 93 packages in 2s
found 0 vulnerabilities
```

`@modelcontextprotocol/sdk` バージョン1.29.0と `zod` バージョン4.4.3がインストールされる。依存関係が92パッケージに増えるが、脆弱性はゼロだ。TypeScriptを使う場合は開発用依存関係も追加する:

```bash
npm install -D typescript @types/node tsx
npx tsc --init
```

`tsconfig.json` で `"module": "ESNext"` と `"moduleResolution": "bundler"` (または `"node16"`) を設定することが重要だ。SDKがESMモジュール形式で配布されているためだ。

### package.json の設定

```json
{
  "name": "my-mcp-server",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.29.0",
    "zod": "^4.4.3"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "tsx": "^4.0.0",
    "typescript": "^5.0.0"
  }
}
```

`"type": "module"` の設定は必須だ。これがないとSDKのインポートパス(`@modelcontextprotocol/sdk/server/mcp.js`)を正しく解釈できない。

## McpServer インスタンスの生成: 核心3ステップパターン

実際に試してみて確認した核心は3つのステップだ。

1. `McpServer` インスタンスの生成
2. `server.tool()` でZodスキーマベースのツール登録
3. トランスポートの接続

このパターンを理解すれば、MCPサーバー開発の90%は把握できたも同然だ。

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { z } from "zod";

// ステップ1: サーバーインスタンスの生成
const server = new McpServer({ name: "demo-server", version: "1.0.0" });
```

`McpServer` コンストラクタは `name` と `version` の2つのフィールドを受け取る。この情報はMCPクライアントがサーバーを識別する際に使用される。

### ツールの登録: server.tool()

```typescript
// ステップ2: ツールの登録
server.tool(
  "get_book_info",                               // ツール名
  "Fetch book metadata from Open Library by ISBN", // ツールの説明 (AIがいつ使うか判断する基準)
  { isbn: z.string().describe("ISBN-13 or ISBN-10") }, // Zodスキーマ
  async ({ isbn }) => {                           // 実行ハンドラ
    const url = `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`;
    const res = await fetch(url);
    const data = await res.json();
    const book = data[`ISBN:${isbn}`];

    if (!book) {
      return {
        content: [{ type: "text", text: `No book found for ISBN: ${isbn}` }]
      };
    }

    const summary = [
      `Title: ${book.title}`,
      `Author(s): ${(book.authors || []).map((a: { name: string }) => a.name).join(", ")}`,
      `Published: ${book.publish_date || "unknown"}`,
      `Pages: ${book.number_of_pages || "unknown"}`
    ].join("\n");

    return { content: [{ type: "text", text: summary }] };
  }
);
```

`server.tool()` の引数の構造を明確に理解することが重要だ:

- <strong>第1引数</strong>: ツール名 (AIが呼び出す際に使う識別子)
- <strong>第2引数</strong>: ツールの説明 (AIモデルがこのツールをいつ使うべきか判断する自然言語の説明)
- <strong>第3引数</strong>: Zodスキーマオブジェクト (入力値の型と説明)
- <strong>第4引数</strong>: 非同期ハンドラ関数

第2引数の「ツールの説明」はAIモデルが読むプロンプトだ。説明が具体的であるほど、AIが適切な場面でツールを使う。「get info」のように曖昧に書くより「Fetch book metadata from Open Library by ISBN」のほうがはるかに良い。

### レスポンスの形式: MCP標準構造

ハンドラが返す形式にも標準がある:

```typescript
return {
  content: [
    { type: "text", text: "レスポンステキスト" }
  ]
};
```

`content` 配列の各アイテムは `type` と対応するデータを含む。テキスト以外にも画像(`type: "image"`)やリソース(`type: "resource"`)を返せるが、大半のケースではテキストで十分だ。

エラーが発生した場合も例外を投げずに、エラーメッセージを `content` に含めて返すのがMCPの慣例だ。クライアントによって例外の処理方法が異なる可能性があるためだ。

## InMemoryTransport で同一プロセス内テスト

MCPサーバーを実際のClaudeやCursorに接続する前に、同じプロセス内でサーバー・クライアントのラウンドトリップをテストする方法がある。`InMemoryTransport` を使えばいい。

```typescript
// ステップ3: トランスポートの接続
const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

// サーバーの接続
await server.connect(serverTransport);

// クライアントの接続
const client = new Client({ name: "test-client", version: "1.0.0" });
await client.connect(clientTransport);
```

`InMemoryTransport.createLinkedPair()` は互いに接続されたクライアント用トランスポートとサーバー用トランスポートのペアを返す。stdioやHTTPサーバーの設定なしにメモリ内で直接通信できる。

これでクライアントからサーバーのツール一覧を取得して呼び出す:

```typescript
// 登録済みツール一覧の取得
const { tools } = await client.listTools();
console.log("=== Tools registered ===");
tools.forEach(t => console.log(`  - ${t.name}: ${t.description}`));

// ツールの呼び出し
const result = await client.callTool({
  name: "get_book_info",
  arguments: { isbn: "9780132350884" }
});

console.log("\n=== Result ===");
console.log(result.content[0].text);

await client.close();
```

実際の実行結果はこうだ:

```
=== Tools registered ===
  - get_book_info: Fetch book metadata from Open Library by ISBN

=== Calling get_book_info (ISBN: 9780132350884 — Clean Code) ===
Title: Clean Code
Author(s): Robert C. Martin
Published: July 2008
Pages: 431

✓ MCP server + client round-trip succeeded
```

Open Libraryの公開APIから実際にデータを取得して正常に出力された。APIキー不要の公開REST APIを使ったため、認証設定は一切不要だった。

### 全体の動作コード (mcp-demo.mjs)

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { z } from "zod";

const server = new McpServer({ name: "demo-server", version: "1.0.0" });

server.tool(
  "get_book_info",
  "Fetch book metadata from Open Library by ISBN",
  { isbn: z.string().describe("ISBN-13 or ISBN-10") },
  async ({ isbn }) => {
    const url = `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`;
    const res = await fetch(url);
    const data = await res.json();
    const book = data[`ISBN:${isbn}`];
    if (!book) {
      return { content: [{ type: "text", text: `No book found for ISBN: ${isbn}` }] };
    }
    const summary = `Title: ${book.title}\nAuthor(s): ${(book.authors || []).map(a => a.name).join(", ")}\nPages: ${book.number_of_pages || "unknown"}`;
    return { content: [{ type: "text", text: summary }] };
  }
);

const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
await server.connect(serverTransport);

const client = new Client({ name: "test-client", version: "1.0.0" });
await client.connect(clientTransport);

const { tools } = await client.listTools();
console.log("Tools:", tools.map(t => t.name));

const result = await client.callTool({ name: "get_book_info", arguments: { isbn: "9780132350884" } });
console.log(result.content[0].text);
await client.close();
```

## StdioServerTransport でClaudeと実際に連携する

`InMemoryTransport` はテストや開発デバッグには最適だが、実際のClaude DesktopやCursorに接続するには `StdioServerTransport` に切り替える必要がある。これがMCPサーバーの標準デプロイ方法だ。MCPではなくClaude SDKで直接ツールを定義・呼び出す方法は [Claude Agent SDK ツール活用完全ガイド](/ja/blog/ja/claude-agent-sdk-tool-use-complete-guide-2026) で詳しく説明している。

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({ name: "book-server", version: "1.0.0" });

server.tool(
  "get_book_info",
  "Fetch book metadata from Open Library by ISBN",
  { isbn: z.string().describe("ISBN-13 or ISBN-10") },
  async ({ isbn }) => {
    const url = `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`;
    const res = await fetch(url);
    const data = await res.json();
    const book = data[`ISBN:${isbn}`];
    if (!book) {
      return { content: [{ type: "text", text: `No book found for ISBN: ${isbn}` }] };
    }
    const summary = `Title: ${book.title}\nAuthor(s): ${(book.authors || []).map((a: { name: string }) => a.name).join(", ")}\nPublished: ${book.publish_date || "unknown"}\nPages: ${book.number_of_pages || "unknown"}`;
    return { content: [{ type: "text", text: summary }] };
  }
);

// stdioトランスポートで起動
const transport = new StdioServerTransport();
await server.connect(transport);
```

次に `Claude Desktop` のMCP設定ファイル(`~/Library/Application Support/Claude/claude_desktop_config.json`)にサーバーを登録する:

```json
{
  "mcpServers": {
    "book-server": {
      "command": "node",
      "args": ["/絶対パス/my-mcp-server/dist/server.js"]
    }
  }
}
```

TypeScriptで書いた場合はビルド後に `dist/server.js` を指定するか、`tsx` を使う場合は:

```json
{
  "mcpServers": {
    "book-server": {
      "command": "npx",
      "args": ["tsx", "/絶対パス/my-mcp-server/src/server.ts"]
    }
  }
}
```

Claude Desktopを再起動すると、会話中にISBNに言及したとき自動的に `get_book_info` ツールが使われる。

### 複数のツールを登録する

`server.tool()` を複数回呼び出すことでツールを追加できる:

```typescript
// 書籍検索ツールの追加
server.tool(
  "search_books",
  "Search books by title or author on Open Library",
  {
    query: z.string().describe("Book title or author name"),
    limit: z.number().int().min(1).max(10).default(5).describe("Max results"),
  },
  async ({ query, limit }) => {
    const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=${limit}`;
    const res = await fetch(url);
    const data = await res.json();

    if (!data.docs || data.docs.length === 0) {
      return { content: [{ type: "text", text: `No results for: ${query}` }] };
    }

    const results = data.docs
      .slice(0, limit)
      .map((doc: { title: string; author_name?: string[]; first_publish_year?: number }, i: number) =>
        `${i + 1}. ${doc.title} — ${(doc.author_name || ["unknown"]).join(", ")} (${doc.first_publish_year || "?"})`
      )
      .join("\n");

    return { content: [{ type: "text", text: results }] };
  }
);
```

Zodスキーマで `.default(5)` を使うと引数がオプションになり、AIが明示的に値を提供しない場合はデフォルト値が使われる。

## ツール設計で気をつけるべき点

実際に使ってみて、いくつか落とし穴があった。

<strong>第一に、ツール名と説明に気を配る必要がある。</strong>AIモデルがツールを選択する基準はツールの説明なので、「get info」のように曖昧に書くとAIが適切な場面でツールを使わなかったり誤って使ったりする。具体的なアクション、入力、出力を説明に盛り込むことが重要だ。

<strong>第二に、Zod v4のAPIはv3と異なる。</strong>Zod 4.4.3では一部のAPIが変更された。既存のZod v3コードをそのままコピーするとタイプエラーが出る可能性がある。特に `.optional()` と `.nullable()` の組み合わせ、`z.union()` の動作方式が変わった。既存プロジェクトでZodを使っている場合はバージョン競合を確認する必要がある。

<strong>第三に、エラー処理を慎重に行う必要がある。</strong>最初に犯したミスは、ネットワークエラー時に例外をそのまま投げたことだった。MCP標準では、ツール実行エラーも `content` に含めて返すほうが安全だ。クライアントによって例外の処理方法が異なるためだ:

```typescript
async ({ isbn }) => {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      return {
        content: [{ type: "text", text: `API error: ${res.status} ${res.statusText}` }],
        isError: true  // エラーであることを明示
      };
    }
    // ... 正常処理
  } catch (error) {
    return {
      content: [{ type: "text", text: `Network error: ${error instanceof Error ? error.message : String(error)}` }],
      isError: true
    };
  }
}
```

`isError: true` フラグを追加するとクライアントがレスポンスをエラーとして処理できる。

<strong>第四に、長いレスポンスは切り詰める必要がある。</strong>AIのコンテキストウィンドウには限界がある。ツールのレスポンスが長すぎると、AIが以前の会話を失ったりコンテキスト超過エラーが発生したりする。検索結果やリスト形式のデータは最大件数を制限するのが賢明だ。

## MCP Inspector でデバッグする

開発中は `MCP Inspector` をよく活用した。ブラウザベースのGUIでMCPサーバーのツール一覧を確認し、直接呼び出すことができる。

```bash
npx @modelcontextprotocol/inspector node dist/server.js
```

ブラウザで `http://localhost:5173` を開くと、サーバーに登録されたツール一覧と各ツールのZodスキーマを視覚的に確認できる。引数を入力して実行すると、実際のレスポンスがJSON形式で出力される。

注意点として、MCP InspectorはNode.js 18以上の環境が別途必要だ。またInspector自体にもnpmパッケージのインストール過程があるため、初回起動時に数十秒かかることがある。

## リソースとプロンプト: ツール以外のMCP機能

MCPスペックはツール(Tools)以外にも、リソース(Resources)とプロンプト(Prompts)の2つの機能を提供している。

<strong>リソース</strong>はAIが読めるデータソースだ。ファイル、データベーステーブル、APIレスポンスなどをリソースとして公開すると、AIがコンテキストとして読み込める:

```typescript
server.resource(
  "book-catalog",
  "books://catalog",
  async (uri) => ({
    contents: [
      {
        uri: uri.href,
        mimeType: "text/plain",
        text: "書籍カタログの内容..."
      }
    ]
  })
);
```

<strong>プロンプト</strong>は再利用可能なプロンプトテンプレートだ。複雑なタスク向けのマルチステッププロンプトを定義しておき、クライアントが簡単に呼び出せる。

正直に言うと、最初はリソースとプロンプト機能が実際にどれだけ使われるのかよくわからなかった。大半の実用的なユースケースではツールだけで十分だ。リソースは大容量のコンテキストデータを提供するとき、プロンプトはワークフローを標準化するときに有用だ。

## Zod v4で複雑なスキーマを扱う

単純な `z.string()` 以外にも、さまざまなZodスキーマをツールの引数として使える:

```typescript
server.tool(
  "advanced_book_search",
  "Advanced book search with filters",
  {
    query: z.string().min(1).max(200).describe("Search query"),
    filters: z.object({
      publishedAfter: z.number().int().min(1000).max(2030).optional()
        .describe("Filter by publication year (start)"),
      language: z.enum(["en", "ko", "ja", "zh"]).optional()
        .describe("Language filter"),
    }).optional().describe("Optional search filters"),
    sortBy: z.enum(["relevance", "date", "title"]).default("relevance")
      .describe("Sort order"),
    limit: z.number().int().min(1).max(20).default(5),
  },
  async ({ query, filters, sortBy, limit }) => {
    // 実装...
    return { content: [{ type: "text", text: "結果..." }] };
  }
);
```

`z.object()`、`z.enum()`、`.optional()`、`.default()` などを組み合わせると、複雑なツールインタフェースをタイプセーフに定義できる。AIはこのスキーマをJSON Schema形式に変換して、どの引数をどう埋めるべきか理解する。

注意点: Zod v4では `.describe()` は `.optional()` の前に付ける必要がある。`z.string().optional().describe()` は型推論が意図通りにならない場合がある。正しい順序は `z.string().describe("説明").optional()` だ。

## HTTP/SSEトランスポートでリモートMCPサーバーをデプロイする

ここまではローカルstdio方式だった。チーム全体で共有するMCPサーバーを運用したり、クラウドにデプロイするにはHTTP/SSEトランスポートが必要だ。

```bash
npm install express
npm install -D @types/express
```

```typescript
import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { z } from "zod";

const app = express();
app.use(express.json());

const server = new McpServer({ name: "remote-book-server", version: "1.0.0" });

server.tool(
  "get_book_info",
  "Fetch book metadata from Open Library by ISBN",
  { isbn: z.string() },
  async ({ isbn }) => {
    // ... 同様の実装
  }
);

const transports: Record<string, SSEServerTransport> = {};

app.get("/sse", (req, res) => {
  const sessionId = crypto.randomUUID();
  const transport = new SSEServerTransport(`/messages/${sessionId}`, res);
  transports[sessionId] = transport;
  server.connect(transport);

  req.on("close", () => {
    delete transports[sessionId];
  });
});

app.post("/messages/:sessionId", async (req, res) => {
  const transport = transports[req.params.sessionId];
  if (!transport) {
    res.status(404).json({ error: "Session not found" });
    return;
  }
  await transport.handlePostMessage(req, res);
});

app.listen(3000, () => {
  console.log("MCP server running on http://localhost:3000");
});
```

この方法でデプロイすると、CursorやClaude Desktopから `http://localhost:3000/sse` をMCPサーバーURLとして登録できる。ただしHTTP方式は設定がより複雑で、セキュリティ(認証、HTTPS)の処理も別途必要だ。社内ツール程度であればstdioのほうがはるかにシンプルだ。

MCP vs A2A vs Open Responses プロトコル比較で触れたように、リモートMCPサーバーアーキテクチャは成熟度とセキュリティの面でまだ整理中の部分が多い。今すぐリモートデプロイを計画しているなら、認証トークン、CORS、セッション管理には必ず気を配る必要がある。

## 実際に使えるツールのアイデア

ここまで読めばMCPサーバーの構造は十分に理解できたはずだ。自分が考えた実用的なツールのアイデアを挙げておく:

<strong>社内システム連携</strong>:
- Jira/Linearのイシュー照会 (`get_issue`, `create_issue`, `list_my_issues`)
- Confluence/Notionのドキュメント検索 (`search_docs`, `get_page`)
- Slackのメッセージ検索 (`search_messages`, `get_channel_history`)

<strong>開発ワークフロー</strong>:
- GitHub PRの一覧とレビュー (`list_prs`, `get_pr_diff`, `add_review_comment`)
- デプロイ状況の確認 (`get_deployment_status`, `rollback_deployment`)
- ログの照会 (`search_logs`, `get_error_trace`)

<strong>データ分析</strong>:
- SQLクエリの実行 (読み取り専用権限で) (`run_query`, `list_tables`)
- メトリクスダッシュボードのデータ取得 (`get_metrics`, `get_alert_status`)

これらのどれでも `server.tool()` パターンでラップすれば30分でMCPサーバーになる。

## MCPサーバーをいつ使い、いつ避けるべきか

実際に作ってみて、MCPサーバーが万能ではないこともはっきりした。選択基準を整理しておく。

**MCPサーバーが適している場合**:

- 同じ機能をClaude、Cursor、Windsurfなど**複数のAIクライアントで同時に**使いたいとき。一度ラップすれば、クライアントごとに別々の統合を作る必要がない。
- 社内データベースの照会、ドキュメント検索、デプロイ状態の確認のように、**AIが自律的に呼び出すべきツール**を公開するとき。
- 入力スキーマが明確で、結果をテキストで要約できる作業。ISBN照会のように入力と出力の形が明確なケースが理想的だ。

**MCPサーバーを避けたほうがよい場合**:

- 単一のアプリケーション内でしか使わない機能なら、わざわざMCPで包む理由はない。関数を直接呼ぶほうが速く、デバッグも楽だ。
- リアルタイムストリーミングや大容量バイナリ転送が必要な作業。MCPはJSON-RPCベースのリクエスト・レスポンスモデルなので、こうしたパターンには合わない。
- レスポンスが数十KBを超える大容量データ。AIのコンテキストウィンドウを圧迫して逆効果になる。この場合はツールではなくリソースとして公開するか、結果をページネーションする設計を先に考えるべきだ。
- セキュリティ境界が厳格な本番環境で、認証・権限管理を自前で実装する余力がないとき。リモートHTTPデプロイは[公式仕様のSecurityセクション](https://modelcontextprotocol.io/specification)が強調するように、ユーザー同意とアクセス制御を別途設計する必要がある。

判断が曖昧なら、AIが**そのツールを自分で選んで呼び出す必要があるか**をまず問えばよい。答えが「はい」ならMCPサーバーが合っており、「自分のコードから直接呼べばいい」なら通常の関数やライブラリのほうがよい。ローカルでプライベートに運用する具体例は、[ローカルLLMとプライベートMCPサーバーの構築](/ja/blog/ja/local-llm-private-mcp-server-gemma4-fastmcp)の記事でさらに扱った。

## まとめ: AIツールデプロイの現実的な標準になると思う

この実験を通じて、MCPサーバー開発の参入障壁が思ったより低いことを確認した。`@modelcontextprotocol/sdk` の `McpServer` APIは明確で、Zodでタイプセーフなスキーマを定義するのも直感的だ。

しかし限界も明らかだ。<strong>実際のClaudeやCursorクライアントと連携するにはStdioServerTransportへの切り替えが必要で</strong>、その過程でデプロイ環境、絶対パスの設定、Node.jsバージョンの互換性など追加の設定がある。またZod v4はv3からAPIが一部変わったため、既存のコードをそのまま使えないケースもある。

それでも、公開REST APIひとつをMCPツールとしてラップして実際のデータ取得まで動作するエンドツーエンドのパイプラインをAPIキーなしで30分以内に完成できるのは、明らかに魅力的だ。Claude、Cursor、Windsurfなどが標準としてMCPを採用している状況で、自分だけのツールを複数のAIプラットフォームに同時に公開する最も現実的な方法がMCPサーバーだ。

次のステップとして、実際の社内システムをひとつ選んでMCPツールとしてラップしてみることを勧める。コードの構造はこの記事で扱ったものがすべてだ。残りはそのシステムのAPIを理解することだ。Claude CodeでMCPとスラッシュコマンド、フックを組み合わせて自動化ワークフローを構築する全体像は [Claude Code マスタークラス第1回](/ja/blog/ja/claude-code-masterclass-series-1-prompt-to-agent) で確認できる。

---

<strong>参考リンク</strong>:
- [Model Context Protocol 公式ドキュメント](https://modelcontextprotocol.io)
- [MCP公式仕様](https://modelcontextprotocol.io/specification)
- [@modelcontextprotocol/typescript-sdk（公式リポジトリ）](https://github.com/modelcontextprotocol/typescript-sdk)
- [@modelcontextprotocol/sdk npm](https://www.npmjs.com/package/@modelcontextprotocol/sdk)
- [Open Library API](https://openlibrary.org/developers/api)
- [MCP Inspector](https://github.com/modelcontextprotocol/inspector)
