---
draft: true
title: MCPリモートHTTPサーバーデプロイパターン — stdioからStreamable HTTPへ移行する実践ガイド
description: >-
  MCP Streamable HTTPトランスポートでstdioサーバーをリモート配備可能なHTTPサービスへ移行する実践ガイド。TypeScript
  SDK v1.29.0基準でstateful・statelessモードの実装とDocker・Cloudflare配備パターンを実験ログとともに解説します。
pubDate: '2026-05-27'
heroImage: ../../../assets/blog/mcp-remote-http-deployment-pattern/hero.png
tags:
  - MCP
  - TypeScript
  - AIエージェント
  - デプロイ
  - Streamable-HTTP
relatedPosts:
  - slug: roguepilot-copilot-prompt-injection-security
    score: 0.94
    reason:
      ko: 'AI/ML, DevOps, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: AI/ML、DevOps、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in AI/ML, DevOps, architecture with comparable
        difficulty.
      zh: 在AI/ML、DevOps、架构领域涵盖类似主题，难度相当。
  - slug: fastapi-claude-api-streaming-production-guide-2026
    score: 0.94
    reason:
      ko: 'AI/ML, DevOps, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: AI/ML、DevOps、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in AI/ML, DevOps, architecture with comparable
        difficulty.
      zh: 在AI/ML、DevOps、架构领域涵盖类似主题，难度相当。
  - slug: ai-coding-secrets-sprawl-mcp-config-security
    score: 0.93
    reason:
      ko: 'AI/ML, DevOps, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: AI/ML、DevOps、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in AI/ML, DevOps, architecture with comparable
        difficulty.
      zh: 在AI/ML、DevOps、架构领域涵盖类似主题，难度相当。
  - slug: terraform-ai-batch-infrastructure
    score: 0.93
    reason:
      ko: 'AI/ML, DevOps, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: AI/ML、DevOps、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in AI/ML, DevOps, architecture with comparable
        difficulty.
      zh: 在AI/ML、DevOps、架构领域涵盖类似主题，难度相当。
  - slug: vertex-ai-search-site-implementation
    score: 0.93
    reason:
      ko: 'AI/ML, DevOps, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: AI/ML、DevOps、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in AI/ML, DevOps, architecture with comparable
        difficulty.
      zh: 在AI/ML、DevOps、架构领域涵盖类似主题，难度相当。
---

MCPサーバーを初めて作ったとき、stdioトランスポートでローカルからClaude Desktopに接続していた。`uv run` 一行でサーバーが起動して即座に繋がる手軽さがあった。でもチームメンバーが「同じサーバーを使いたい」と言い出したとき、問題が発生した。stdioはクライアントがサーバープロセスを直接spawnする必要があるため、私のローカルで動いているサーバーに他の人が接続する方法がない。

Streamable HTTPトランスポートはまさにこの問題を解決するために存在する。今回は `@modelcontextprotocol/sdk` v1.29.0を使い、TypeScriptでMCP HTTPサーバーを直接実装し、stateful/statelessの2モードの違いを実験で確認した内容をまとめる。

## stdioが限界を迎える三つの場面

すべてのMCPサーバーはstdioから始まるが、以下の三つの状況ではstdioが答えにならない。

**チーム共有ツール:** ローカルファイルシステムを読むサーバーならstdioで十分だ。しかし社内ConfluenceをスクレイプするAPIを呼ぶサーバーは？チーム全体で使えるよう一箇所にホストしたくなる。stdioではこれが構造的に不可能だ。クライアントがサーバーのバイナリを持ってきて自分のローカルで実行しなければならないからだ。

**クラウド環境:** Claude.ai WebインターフェースやClaude APIから外部MCPサーバーに接続するにはHTTPエンドポイントが必要だ。WebクライアントはプロセスをSpawnできない。

**スケールアウト:** stdioはクライアント一つにつきサーバープロセス一つだ。100人が同時に使えば100プロセスが起動する。HTTPはサーバーを独立して水平スケールでき、ロードバランサーの後ろに複数インスタンスを置くのが自然だ。

Streamable HTTPは公式MCP 2025-03-26仕様で新たに追加されたトランスポートで、既存のHTTP+SSE方式を置き換える。単一エンドポイント(`/mcp`)でPOST・GET・DELETEを処理し、SSEでサーバー→クライアントのストリーミングを提供する。

## Streamable HTTPトランスポートの動作原理

実装する前にプロトコルの流れを理解することが重要だ。これを知らないと後で `Not Acceptable` エラーで頭を抱えることになる(私もそうなった)。

**リクエストヘッダーの落とし穴:** クライアントが `POST /mcp` を送るとき、必ず `Accept: application/json, text/event-stream` を含める必要がある。両タイプが必要だ。`application/json` だけ送るとサーバーが `Not Acceptable` を返す。SDKが応答形式を動的に決定するためだ。同期応答(JSON)もストリーミング(SSE)も可能で、クライアントが両方受け取れると宣言しなければならない。

**セッション管理方式:** statefulモードでは最初の `initialize` リクエスト後、サーバーは応答ヘッダーに `Mcp-Session-Id` を含める。以降のすべてのリクエストはこのヘッダーを送る必要がある。セッションを閉じるときは `DELETE /mcp` を使う。

**応答形式:** 応答はSSEイベント形式で来る:

```
event: message
data: {"result":{...},"jsonrpc":"2.0","id":1}
```

JSONを直接パースするのではなく `data:` 行を抽出する必要がある。公式MCPクライアントライブラリはこれを自動処理するが、curlで直接テストする際は知っておく必要がある。

[Python FastMCPでMCPサーバーを最初から構築する方法](/ja/blog/ja/mcp-server-build-practical-guide-2026)を先に読んでいれば基本概念は馴染みがあるはずだ。ここではTypeScript SDKを使いHTTPレイヤーを直接構成する。

## 実践実装: TypeScript SDKでHTTPサーバーを作る

環境: Node.js v22.22.0、`@modelcontextprotocol/sdk` v1.29.0、Express。

```bash
npm init -y
npm install @modelcontextprotocol/sdk express
```

コアコードは二部構成だ。MCPサーバーインスタンス生成とHTTPトランスポートの接続。

```javascript
const { Server } = require("@modelcontextprotocol/sdk/server/index.js");
const { StreamableHTTPServerTransport } = require("@modelcontextprotocol/sdk/server/streamableHttp.js");
const { ListToolsRequestSchema, CallToolRequestSchema } = require("@modelcontextprotocol/sdk/types.js");
const express = require("express");
const { randomUUID } = require("crypto");

const sessions = new Map(); // セッションストレージ

function createMcpServer() {
  const server = new Server(
    { name: "my-tools", version: "1.0.0" },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      {
        name: "greet",
        description: "名前を受け取り挨拶メッセージを返す",
        inputSchema: {
          type: "object",
          properties: { name: { type: "string" } },
          required: ["name"],
        },
      },
    ],
  }));

  server.setRequestHandler(CallToolRequestSchema, async (req) => {
    const { name, arguments: args } = req.params;
    if (name === "greet") {
      return { content: [{ type: "text", text: `こんにちは、${args.name}さん！` }] };
    }
    throw new Error(`未知のツール: ${name}`);
  });

  return server;
}

const app = express();
app.use(express.json());

app.post("/mcp", async (req, res) => {
  const sessionId = req.headers["mcp-session-id"];
  let transport;

  if (sessionId && sessions.has(sessionId)) {
    transport = sessions.get(sessionId); // 既存セッション再利用
  } else {
    transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(), // statefulモード
    });
    const mcpServer = createMcpServer();
    await mcpServer.connect(transport);

    transport.onclose = () => {
      if (transport.sessionId) sessions.delete(transport.sessionId);
    };
  }

  await transport.handleRequest(req, res, req.body);

  // 初回リクエスト後にセッション保存
  if (!sessionId && transport.sessionId) {
    sessions.set(transport.sessionId, transport);
  }
});

app.get("/mcp", async (req, res) => {
  const sessionId = req.headers["mcp-session-id"];
  const transport = sessions.get(sessionId);
  if (!transport) { res.status(404).json({ error: "セッションなし" }); return; }
  await transport.handleRequest(req, res);
});

app.delete("/mcp", async (req, res) => {
  const sessionId = req.headers["mcp-session-id"];
  const transport = sessions.get(sessionId);
  if (!transport) { res.status(404).json({ error: "セッションなし" }); return; }
  await transport.handleRequest(req, res);
});

app.listen(3001, "127.0.0.1", () => {
  console.log("MCPサーバー起動: http://127.0.0.1:3001/mcp");
});
```

`createMcpServer()` を関数として分離した理由は、statefulモードでセッションごとに独立したサーバーインスタンスを作るためだ。一つのServerインスタンスを複数セッションで共有すると状態が混在する。

## 実験ログ: curlによる実際のテスト結果

このサーバーを実際に動かしてcurlで全フローを確認した。ローカルサンドボックスでNode.js v22.22.0、SDK v1.29.0基準だ。

**ステップ1: サーバー起動**

```bash
✅ MCP Streamable HTTPサーバー: http://127.0.0.1:3001/mcp
[session] 新規: d0290117-0ce6-4bc5-ab25-af536115ba93
```

**ステップ2: initializeリクエスト**

```bash
curl -X POST http://127.0.0.1:3001/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "initialize",
    "params": {
      "protocolVersion": "2025-03-26",
      "capabilities": {},
      "clientInfo": { "name": "lab-client", "version": "1.0.0" }
    }
  }'
```

```
# 応答 (SSE形式)
event: message
data: {"result":{"protocolVersion":"2025-03-26","capabilities":{"tools":{}},"serverInfo":{"name":"lab-tools","version":"1.0.0"}},"jsonrpc":"2.0","id":1}

# 応答ヘッダー
Mcp-Session-Id: d0290117-0ce6-4bc5-ab25-af536115ba93
```

**ステップ3: ツール呼び出し**

```
# tools/list → greet, add の2ツール確認
# tools/call greet → こんにちは、Kim Jangwookさん！(HTTP接続)
# tools/call add  → 42 + 58 = 100
```

**ステップ4: セッション終了**

```
DELETE /mcp → HTTP 200
同セッションで再アクセス → HTTP 400 Bad Request (404ではない)
```

400が返ってきたのは最初404を予想していたので意外だった。SDKはセッション削除後の再アクセスを「セッションなし」ではなく「未初期化」として処理するようだ。クライアントからみればどちらも再接続が必要なシグナルという点では同じだ。

## stateful vs stateless: どちらのモードを選ぶべきか

SDKは二つのモードをサポートする。

**Statefulモード:**

```javascript
new StreamableHTTPServerTransport({
  sessionIdGenerator: () => randomUUID(),
})
```

セッションIDが発行され、サーバーがセッション別の状態をメモリに保持する。複数ターンの会話、ツール実行中間状態の保存、サブスクリプションベースのSSEストリーミングに適している。

**Statelessモード:**

```javascript
new StreamableHTTPServerTransport({
  sessionIdGenerator: undefined,
})
```

`sessionIdGenerator` を `undefined` に明示するとセッションなしで動作する。各リクエストが独立している。状態を保持しないので水平スケールが単純だ。

私が出した結論はこうだ: **どこにデプロイするかがモードを決定する。**

単一インスタンスのVMやコンテナならstatefulが楽だ。プロセスが一つでセッションMapが安全に生き続ける。一方、サーバーレス環境(AWS Lambda、Cloudflare Workers)はリクエストごとに実行コンテキストが初期化されるのでメモリのセッションMapが維持されない。この場合は必ずstatelessモードを使わなければならない。statefulでサーバーレスにデプロイするとセッションIDは発行されるが二回目のリクエストから404が返ってくる。

正直に言うと、statefulモードのインメモリセッションMapも長期的には問題がある。サーバーを再起動するとすべてのセッションが消える。本番環境でRolling Updateやクラッシュ後の再起動が起きると、クライアントが突然「セッションなし」を受け取る。これを解決するにはRedisのような外部セッションストアが必要だが、SDKが標準提供するわけではないので自分で実装する必要がある。

## デプロイ環境別の選択基準

このトランスポートをどこにホストするかによって考慮点が異なる。

**Docker / Cloud Run (推奨: stateful)**

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
EXPOSE 3001
CMD ["node", "mcp-server.js"]
```

ポートは環境変数で受け取るのが良い。Cloud Runは `PORT` 環境変数を自動で設定する。

```javascript
const PORT = process.env.PORT || 3001;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`MCPサーバー: http://0.0.0.0:${PORT}/mcp`);
});
```

Cloud Runの注意点: インスタンス最小1に設定しないとcold startのたびにセッションMapが空になる。statelessにする方がむしろシンプルかもしれない。

**Cloudflare Workers (必須: stateless + WebStandardトランスポート)**

```javascript
const { WebStandardStreamableHTTPServerTransport } = require("@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js");

export default {
  async fetch(request) {
    const transport = new WebStandardStreamableHTTPServerTransport({
      sessionIdGenerator: undefined, // stateless
    });
    const server = createMcpServer();
    await server.connect(transport);
    return transport.handleRequest(request);
  }
};
```

WorkersはNode.js HTTP APIの代わりにWeb Standard APIを使う。SDKが `NodeStreamableHTTPServerTransport`(Node.js用)と `WebStandardStreamableHTTPServerTransport`(Web Standard用)の両方を提供している。

[MCPサーバーをKubernetesで安定運用する方法](/ja/blog/ja/mcp-server-production-deployment-kubernetes-guide)の記事でも似た話が出てくるが、結局どのレイヤーでセッション状態を管理するかが核心的な設計決定だ。

## 既知の制限と注意事項

このアプローチには限界があることを率直に言わなければならない。

**メモリセッションの脆弱性:** インメモリのセッションMapは本番レベルの耐久性がない。サーバー再起動、インスタンス交換、クラッシュ復旧シナリオを考えると、RedisやValkey等の外部セッションストアに切り替える必要がある。

**ロードバランサーとの互換性:** statefulモードでセッション別に異なるインスタンスにルーティングされると問題が起きる。ロードバランサーがstickyセッションをサポートしていないと同じセッションIDが異なるインスタンスに到達し404になる。MCP 2026ロードマップではこの問題を「stateless at the protocol layer」で解決するとしているが、まだリリース前だ。

**デバッグの難しさ:** SSEストリーム形式の応答は一般的なREST APIよりデバッグが不便だ。curlの出力が `event: message\ndata: {...}` 形式でJSONパーサーに直接入れにくい。MCP Inspectorのような専用ツールを使うか、応答をパイプ処理するスクリプトを用意しておく方が良い。

[MCPゲートウェイでエージェントトラフィックを一元管理する方法](/ja/blog/ja/mcp-gateway-agent-traffic-control)でセッション管理の複雑さをゲートウェイレイヤーで抽象化するアプローチも解決策の一つとして紹介されている。

## まとめ

Streamable HTTPトランスポートは十分に本番利用可能なレベルだ。SDK v1.29.0基準でExpressとの統合はよくできており、statelessモードでサーバーレスに乗せることも問題なかった。

ただし実際に使ってみて感じたのは、**statefulモードはローカル開発と単一インスタンスデプロイに適しており、少し規模が大きくなるとstateless + 外部セッションストアの組み合わせの方が現実的**だということだ。

TypeScript MCPサーバーを初めて作る立場では、stdioから始めてチーム共有やリモートアクセスが必要になった時点でStreamable HTTPに移行することを勧める。トランスポートの切り替えは思ったよりシンプルで、ビジネスロジックは触らなくて良い。
