---
title: "TypeScriptで自分だけのMCPサーバーを作る — @modelcontextprotocol/sdk 実践チュートリアル"
description: "@modelcontextprotocol/sdk v1.29.0とZod v4でTypeScript MCPサーバーをゼロから構築する実践チュートリアル。ツール登録、InMemoryTransportテスト、公開API連携まで30分以内に動作するサーバーを完成させる手順をステップごとに解説します。"
pubDate: '2026-05-31'
heroImage: '../../../assets/blog/mcp-server-typescript-sdk-step-by-step-2026-hero.png'
tags: ["MCP", "TypeScript", "チュートリアル"]
relatedPosts:
  - slug: "mcp-server-build-practical-guide-2026"
    score: 0.92
    reason:
      ko: "Python FastMCPでMCPサーバーを構築するガイドで、TypeScript SDKと比較して同じプロトコルを別の言語で実装する方法が確認できます。"
      ja: "Python FastMCPでMCPサーバーを構築するガイドで、TypeScript SDKと比較して同じプロトコルを別の言語で実装する方法が確認できます。"
      en: "A guide for building MCP servers with Python FastMCP — useful for comparing how the same protocol is implemented in a different language alongside the TypeScript SDK."
      zh: "使用Python FastMCP构建MCP服务器的指南，可与TypeScript SDK对比，了解同一协议在不同语言中的实现方式。"
  - slug: "mcp-vs-a2a-vs-open-responses-agent-protocol-comparison-2026"
    score: 0.81
    reason:
      ko: "MCP、A2A、Open Responsesの3つのエージェントプロトコルを比較分析しており、MCPを選択する前にプロトコルエコシステム全体を理解するのに役立ちます。"
      ja: "MCP、A2A、Open Responsesの3つのエージェントプロトコルを比較分析しており、MCPを選択する前にプロトコルエコシステム全体を理解するのに役立ちます。"
      en: "A comparative analysis of MCP, A2A, and Open Responses protocols — helpful for understanding the agent protocol landscape before committing to MCP."
      zh: "对MCP、A2A和Open Responses三种代理协议进行比较分析，有助于在选择MCP之前了解协议生态系统的全貌。"
  - slug: "mcp-open-standard-linux-foundation-engineering-guide"
    score: 0.75
    reason:
      ko: "MCPがLinux Foundationのオープン標準として確立された背景とエンジニアリング観点での設計思想を扱っており、SDK実習前にMCPの全体像を理解するのに役立ちます。"
      ja: "MCPがLinux Foundationのオープン標準として確立された背景とエンジニアリング観点での設計思想を扱っており、SDK実習前にMCPの全体像を理解するのに役立ちます。"
      en: "Covers the background of MCP becoming a Linux Foundation open standard and its engineering design philosophy — useful context before diving into SDK hands-on work."
      zh: "涵盖MCP成为Linux Foundation开放标准的背景及工程设计理念，在进行SDK实践之前了解MCP全貌非常有用。"
---

```typescript
// この一行がすべて
const server = new McpServer({ name: "my-server", version: "1.0.0" });
server.tool("get_book_info", "書籍情報の取得", { isbn: z.string() }, async ({ isbn }) => { ... });
```

初めてMCPサーバーを作ってみたとき、正直思っていたよりはるかに簡単だという事実に驚いた。MCP(Model Context Protocol)がAIプラットフォーム間の標準として定着しつつあるという話はよく耳にしていたが、「自分でサーバーを作る」というのは何となく複雑で、参入障壁が高そうな印象があった。ところが `@modelcontextprotocol/sdk` パッケージひとつとZodをインストールするだけで、30分以内に動作するMCPサーバーが作れてしまう。

この記事では、TypeScriptでMCPサーバーをゼロから作る過程を、実際に実行したコードと出力結果をもとにステップごとにまとめた。公開API(Open Library)と連携してISBNで書籍情報を取得する実際のツールを作りながら、MCPサーバーの核心的な概念を身につけることが目標だ。

## なぜ今MCPサーバーを自分で作るべきなのか

Claude、Cursor、Windsurf、ZedといったAIコーディングツールの主要プレイヤーがMCPを標準統合プロトコルとして採用した。つまり、MCPサーバーをひとつ作っておけば、特定のAIプラットフォームに依存せず、複数のAIツールで同じ機能を使えるということだ。

従来は独自APIを作り、各AIプラットフォームごとにプラグインや統合を別途開発する必要があったが、MCPは「一度作ればどこでも」というアプローチを可能にする。これに注目する理由はシンプルだ。社内データベースの照会、社内ドキュメントの検索、特定業務の自動化スクリプトをMCPツールとして一度ラップしておけば、Claudeでも、Cursorでも同じように使える。

もちろん、まだエコシステムが完全に成熟しているとは言えない。しかし [MCPオープン標準とLinux Foundation参加](/ja/blog/ja/mcp-open-standard-linux-foundation-engineering-guide) で確認したように、この方向性はすでに業界標準として固まりつつある。

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

## McpServer インスタンスの生成 — 核心3ステップパターン

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

`InMemoryTransport` はテストや開発デバッグには最適だが、実際のClaude DesktopやCursorに接続するには `StdioServerTransport` に切り替える必要がある。これがMCPサーバーの標準デプロイ方法だ。

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

## リソースとプロンプト — ツール以外のMCP機能

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

## HTTP/SSEトランスポート — リモートMCPサーバーとしてデプロイする

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

[MCP vs A2A vs Open Responses プロトコル比較](/ja/blog/ja/mcp-vs-a2a-vs-open-responses-agent-protocol-comparison-2026) で触れたように、リモートMCPサーバーアーキテクチャは成熟度とセキュリティの面でまだ整理中の部分が多い。今すぐリモートデプロイを計画しているなら、認証トークン、CORS、セッション管理には必ず気を配る必要がある。

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

## まとめ: AIツールデプロイの現実的な標準になると思う

この実験を通じて、MCPサーバー開発の参入障壁が思ったより低いことを確認した。`@modelcontextprotocol/sdk` の `McpServer` APIは明確で、Zodでタイプセーフなスキーマを定義するのも直感的だ。

しかし限界も明らかだ。<strong>実際のClaudeやCursorクライアントと連携するにはStdioServerTransportへの切り替えが必要で</strong>、その過程でデプロイ環境、絶対パスの設定、Node.jsバージョンの互換性など追加の設定がある。またZod v4はv3からAPIが一部変わったため、既存のコードをそのまま使えないケースもある。

それでも、公開REST APIひとつをMCPツールとしてラップして実際のデータ取得まで動作するエンドツーエンドのパイプラインをAPIキーなしで30分以内に完成できるのは、明らかに魅力的だ。Claude、Cursor、Windsurfなどが標準としてMCPを採用している状況で、自分だけのツールを複数のAIプラットフォームに同時に公開する最も現実的な方法がMCPサーバーだ。

次のステップとして、実際の社内システムをひとつ選んでMCPツールとしてラップしてみることを勧める。コードの構造はこの記事で扱ったものがすべてだ。残りはそのシステムのAPIを理解することだ。

---

<strong>参考リンク</strong>:
- [Model Context Protocol 公式ドキュメント](https://modelcontextprotocol.io)
- [@modelcontextprotocol/sdk npm](https://www.npmjs.com/package/@modelcontextprotocol/sdk)
- [Open Library API](https://openlibrary.org/developers/api)
- [MCP Inspector](https://github.com/modelcontextprotocol/inspector)
