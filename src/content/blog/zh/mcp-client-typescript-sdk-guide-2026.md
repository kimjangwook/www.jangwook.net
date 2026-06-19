---
title: '用 TypeScript 亲手构建 MCP 客户端 — @modelcontextprotocol/sdk v1.29 实战指南'
description: >-
  我亲自安装了 @modelcontextprotocol/sdk v1.29.0，构建了一个 TypeScript MCP 客户端。
  不依赖 Claude Desktop，通过编程方式调用 MCP 服务器工具和读取资源的实战指南，包含真实运行日志和错误处理模式。
pubDate: '2026-06-19'
heroImage: ../../../assets/blog/mcp-client-typescript-sdk-guide-2026/hero.png
tags:
  - MCP
  - TypeScript
  - AI Agent
  - Claude
relatedPosts:
  - slug: mcp-server-typescript-sdk-step-by-step-2026
    score: 0.92
    reason:
      ko: 서버를 직접 만들어봤다면, 다음은 그 서버를 프로그래밍으로 호출하는 클라이언트 차례다. 이 글과 한 쌍을 이룬다.
      ja: サーバーを自作したなら、次はそのサーバーをプログラムで呼び出すクライアントの番だ。この記事と一対になる。
      en: If you've built the server, the next step is a client that calls it programmatically. The two posts are a pair.
      zh: 如果你已经搭建了服务器，下一步就是用程序调用它的客户端。两篇文章相辅相成。
  - slug: fastmcp-python-mcp-server-build-guide-2026
    score: 0.85
    reason:
      ko: Python FastMCP로 서버를 30분 만에 올리는 법을 다룬다. 이 글에서 만든 TypeScript 클라이언트가 그 서버를 호출할 수 있다.
      ja: Python FastMCPで30分でサーバーを立ち上げる方法を扱う。この記事で作ったTypeScriptクライアントがそのサーバーを呼び出せる。
      en: Covers spinning up a FastMCP Python server in 30 minutes — and the TypeScript client built here can call it.
      zh: 介绍用 Python FastMCP 在30分钟内搭建服务器的方法。这篇文章中构建的 TypeScript 客户端可以调用该服务器。
  - slug: mcp-gateway-agent-traffic-control
    score: 0.78
    reason:
      ko: 여러 MCP 클라이언트가 하나의 게이트웨이를 통해 서버와 통신하는 아키텍처를 다룬다. 스케일업이 필요한 시점의 다음 단계다.
      ja: 複数のMCPクライアントが一つのゲートウェイを介してサーバーと通信するアーキテクチャを扱う。スケールアップが必要な時の次のステップだ。
      en: Covers an architecture where multiple MCP clients communicate with servers through a gateway — the next step when you need to scale.
      zh: 介绍多个 MCP 客户端通过网关与服务器通信的架构，是需要扩展时的下一步。
  - slug: claude-agent-sdk-tool-use-complete-guide-2026
    score: 0.75
    reason:
      ko: Claude Agent SDK로 AI 에이전트에 직접 tool을 붙이는 방법이다. MCP 클라이언트를 에이전트 레이어에 통합할 때 참고가 된다.
      ja: Claude Agent SDKでAIエージェントに直接ツールを付ける方法だ。MCPクライアントをエージェントレイヤーに統合するときに参考になる。
      en: How to attach tools directly to an AI agent via the Claude Agent SDK — useful when integrating an MCP client into the agent layer.
      zh: 介绍如何通过 Claude Agent SDK 直接为 AI 智能体附加工具，在将 MCP 客户端集成到智能体层时可供参考。
faq:
  - question: "MCP 客户端和 MCP 服务器有什么区别?"
    answer: "MCP 服务器是向外部暴露 tool 和 resource 的一方，客户端则是连接该服务器、调用 tool 并读取 resource 的一方。Claude Desktop 和 Cursor 正是扮演客户端（准确说是宿主）的角色。本文用 `@modelcontextprotocol/sdk` 的 `Client` 类亲手实现了这个客户端。"
  - question: "TypeScript SDK 支持哪些 transport?"
    answer: "SDK 同时支持 stdio 和 HTTP 系（SSE、Streamable HTTP）两种。本文只介绍了用 `StdioClientTransport` 直接生成服务器进程的 stdio 方式。连接远程服务器需要使用 `StreamableHTTPClientTransport` 或 `SSEClientTransport`，配置方式略有不同。"
  - question: "如何从客户端调用 tool 或读取 resource?"
    answer: "连接后，用 `client.listTools()` 获取工具列表，用 `client.callTool({ name, arguments })` 执行。resource 则用 `client.listResources()` 列出、用 `client.readResource({ uri })` 读取。返回值的 `content` 数组中每个元素的 `type` 字段不同，除 `text` 外还可能是 `image` 或 `resource`，因此需先检查类型。"
  - question: "错误如何处理? callTool 会抛出异常吗?"
    answer: "工具执行错误不会抛出异常，而是以响应对象的 `isError: true` 字段返回。应当检查 `result.isError` 而非使用 `try/catch`。这是 MCP 规范中的有意设计，用于区分工具执行错误和协议层错误。"
---

Claude Desktop 连接 MCP 服务器时，内部究竟发生了什么？我一直很好奇。"通过 stdio 连接"这个说法我听过，但要在代码层面真正理解，还是得自己写一遍。所以今天我安装了 `@modelcontextprotocol/sdk`，从零开始构建了一个 TypeScript MCP 客户端。

结论是：比我预期的简单得多。同时还发现了一个意外行为——错误处理方式和我原本以为的不一样。

## 亲自做一遍 Claude Desktop 所做的事

MCP（Model Context Protocol）是 AI 智能体访问外部工具和数据的标准接口。此前我写了很多关于构建 MCP 服务器的文章，包括[用 TypeScript 构建 MCP 服务器](/zh/blog/zh/mcp-server-typescript-sdk-step-by-step-2026)和[用 Python FastMCP 在30分钟内搭建服务器](/zh/blog/zh/fastmcp-python-mcp-server-build-guide-2026)。但我从没写过自己实现客户端的文章。

考虑生产场景，明确需要自定义 MCP 客户端的情况确实存在：

- 在 CI/CD 流水线中自动调用 MCP 服务器的工具
- 开发自有智能体层时与 MCP 服务器直接集成
- 在现有 Python/TypeScript 代码中像库一样使用 MCP 服务器的功能

不需要 Claude Desktop 或 Claude Code。`@modelcontextprotocol/sdk` 包含构建客户端所需的一切。

## 安装 SDK — 核心只有两个类

```bash
npm install @modelcontextprotocol/sdk zod
```

截至今日安装的版本是 `1.29.0`。SDK 内同时包含服务器和客户端实现。

构建 MCP 客户端的核心类只有两个：

**`Client`** — 管理与服务器的逻辑连接，提供 `listTools()`、`callTool()`、`listResources()`、`readResource()` 等方法。

**`StdioClientTransport`** — 与 stdio 型 MCP 服务器通信的传输层，通过 `command` 和 `args` 直接生成服务器进程。

连接 SSE 或 Streamable HTTP 服务器时需要使用不同的 Transport 类。本文仅介绍 stdio。

## 搭建实验环境 — 服务器和客户端都从头写

为了演示，我构建了一个简单的 MCP 服务器，功能包含两个工具：执行四则运算的 `calculate` 和转换文本的 `transform_text`。

```javascript
// server.mjs
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({ name: "demo-tools", version: "1.0.0" });

server.tool(
  "calculate",
  "Basic arithmetic: add, subtract, multiply, divide",
  {
    operation: z.enum(["add", "subtract", "multiply", "divide"]),
    a: z.number(),
    b: z.number(),
  },
  async ({ operation, a, b }) => {
    const ops = {
      add: a + b, subtract: a - b,
      multiply: a * b, divide: b === 0 ? null : a / b,
    };
    const result = ops[operation];
    return {
      content: [{
        type: "text",
        text: result === null ? "Error: division by zero" : `${a} ${operation} ${b} = ${result}`,
      }],
    };
  }
);

server.tool(
  "transform_text",
  "Text transformation: uppercase, lowercase, reverse, word_count",
  { text: z.string(), op: z.enum(["uppercase", "lowercase", "reverse", "word_count"]) },
  async ({ text, op }) => {
    const results = {
      uppercase: text.toUpperCase(), lowercase: text.toLowerCase(),
      reverse: [...text].reverse().join(""),
      word_count: `Word count: ${text.trim().split(/\s+/).length}`,
    };
    return { content: [{ type: "text", text: results[op] }] };
  }
);

server.resource(
  "server-info", "mcp://demo/info",
  async (uri) => ({
    contents: [{ uri: uri.href, mimeType: "text/plain", text: "MCP demo server v1.0.0 — stdio transport" }],
  })
);

const transport = new StdioServerTransport();
await server.connect(transport);
```

不需要单独启动服务器。客户端的 `StdioClientTransport` 会自动生成服务器进程。

## 客户端实现 — listTools → callTool → listResources

```javascript
// client.mjs
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const transport = new StdioClientTransport({
  command: "node",
  args: ["server.mjs"],
  cwd: process.cwd(),
});

const client = new Client(
  { name: "demo-client", version: "1.0.0" },
  { capabilities: {} }
);

await client.connect(transport);
```

调用 `client.connect(transport)` 的瞬间，`node server.mjs` 进程被生成。之后客户端和服务器通过 stdin/stdout 管道交换 JSON-RPC 2.0 消息。

连接完成后，我按顺序执行了三个操作并查看了实际输出：

```
=== MCP Client Demo — @modelcontextprotocol/sdk v1.29.0 ===

✓ Connected to MCP server

Found 2 tool(s):
  • calculate(operation, a, b) — Basic arithmetic: add, subtract, multiply, divide
  • transform_text(text, op) — Text transformation: uppercase, lowercase, reverse, word_count

--- calculate tool ---
  42 multiply 7 = 294
  100 divide 4 = 25
  999 add 1 = 1000

--- transform_text tool ---
  "Model Context Protocol" → MODEL CONTEXT PROTOCOL
  "BUILD ONCE RUN EVERYWHERE" → build once run everywhere
  "hello world from MCP" → Word count: 4

Found 1 resource(s): mcp://demo/info
  Content: MCP demo server v1.0.0 — stdio transport

✓ Client closed cleanly.
```

我没有在单独的终端中启动服务器。客户端直接生成了 `node server.mjs`，通信结束后通过 `client.close()` 同时终止了两个进程。

## 错误以 isError 字段返回，而非抛出异常

MCP 的错误处理方式出乎我的意料。调用不存在的工具时，并不会抛出异常：

```javascript
const result = await client.callTool({
  name: "nonexistent_tool",
  arguments: {},
});
console.log(result);
// {
//   content: [{ type: "text", text: "MCP error -32602: Tool nonexistent_tool not found" }],
//   isError: true
// }
```

不需要 `try/catch`。而是要检查响应对象的 `isError` 字段。

```javascript
async function callToolSafe(client, name, args) {
  const result = await client.callTool({ name, arguments: args });
  if (result.isError) {
    throw new Error(result.content[0]?.text ?? "Unknown MCP error");
  }
  return result.content[0]?.text;
}
```

这是 MCP 规范中的有意设计。工具执行错误通过内容返回，而非抛出异常。这与 Claude 智能体将工具执行失败作为"文本消息"接收并继续推理的方式完全吻合。

## Promise.all 并行调用 — 4个请求仅需 1ms

我也测试了并行调用：

```javascript
const start = Date.now();
const ops = [
  ["add", 1, 1], ["multiply", 12, 12], ["subtract", 100, 37], ["divide", 144, 12]
];
const results = await Promise.all(
  ops.map(([op, a, b]) =>
    client.callTool({ name: "calculate", arguments: { operation: op, a, b } })
  )
);
```

输出：

```
Parallel calls (4 ops) in 1ms:
  1 add 1 = 2
  12 multiply 12 = 144
  100 subtract 37 = 63
  144 divide 12 = 12
```

即使是 stdio 传输，SDK 内部也处理了请求多路复用。4个请求同时发出，响应被正确匹配。不过 stdio 模式下服务器仍可能顺序处理，如果工具处理成本较高，并行调用的收益可能有限。

## 自定义 MCP 客户端真正有价值的三个场景

实现之后，我对它的应用场景有了更清晰的认识。

**从自动化脚本调用 MCP 工具**

当 MCP 服务器提供代码检查、文件转换、外部 API 查询等工具时，可以从 GitHub Actions 或本地脚本中自动调用，一个简单的 Node.js 脚本就能搞定。

**构建自定义智能体框架**

不使用 LangGraph 或 LlamaIndex，直接写自己的智能体时，MCP 客户端可以作为工具执行层嵌入智能体循环。用 `listTools()` 获取工具列表注入 LLM 提示词，解析模型响应后用 `callTool()` 执行。[通过 MCP Gateway 控制智能体流量](/zh/blog/zh/mcp-gateway-agent-traffic-control)是这一场景的自然延伸。

**测试和调试 MCP 服务器**

开发 MCP 服务器时，无需 Claude Desktop 就能快速验证工具行为。用 `listTools()` 检查生成的 `inputSchema`，再用不同参数调用 `callTool()`。

## 连接已有的公开 MCP 服务器

目前只连接了自己的服务器。同一个客户端也可以连接公开的 MCP 服务器包。

```bash
npm install @modelcontextprotocol/server-filesystem
```

只需修改 transport 配置：

```javascript
const transport = new StdioClientTransport({
  command: "npx",
  args: ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/directory"],
});
```

这样就可以通过 `callTool()` 直接调用文件系统 MCP 服务器的 `read_file`、`write_file`、`list_directory` 等工具。Claude Desktop 配置文件中的 `command`/`args` 可以直接粘贴到 `StdioClientTransport` 中使用。

## 安全处理内容类型

`callTool()` 和 `readResource()` 的返回值中，`content` 数组的每个元素结构取决于其 `type` 字段：

```typescript
for (const item of result.content) {
  if (item.type === "text") {
    console.log(item.text);
  } else if (item.type === "image") {
    console.log(`Image: ${item.mimeType}`);
  } else if (item.type === "resource") {
    console.log(`Resource: ${item.resource.uri}`);
  }
}
```

不检查 `type` 直接访问 `content[0].text` 时，若工具返回图片或嵌入资源，会得到 `undefined`。连接第三方 MCP 服务器时，始终先检查 `type` 字段是个好习惯。

## 坦率的局限性评估

**TypeScript 类型较宽泛。** `callTool()` 的返回类型在泛型层面较为通用，需要显式类型守卫才能缩窄到 `TextContent`。

**SSE/HTTP 需要不同的 Transport。** 远程 MCP 服务器需要 `StreamableHTTPClientTransport` 或 `SSEClientTransport`，配置稍有不同。

**注意连接生命周期。** `StdioClientTransport` 不会每次调用都生成新进程，连接期间服务器进程持续存活。脚本结束时务必调用 `client.close()`。

## 我的判断：客户端实现被严重低估了

关于 MCP 服务器构建的文章很多。但关于自定义客户端实现——也就是用编程方式做 Claude Desktop 所做的事——的文章几乎没有。

这项技术的实际用途是真实存在的。自主构建 AI 智能体流水线的开发者、想把 MCP 集成到现有代码的团队、需要在没有 GUI 的情况下验证服务器行为的工程师，都能从中受益。`@modelcontextprotocol/sdk` 的 `Client` 类足够稳定，API 也很简洁。

70行 TypeScript 就够了：连接 MCP 服务器、列出工具、调用工具、读取资源、干净地关闭。希望官方文档从一开始就把这个作为示例放出来。既然没有，我就自己来写。

下一步：把这个客户端连接到真实的 MCP 服务器（文件系统服务器或 GitHub MCP 服务器），围绕它构建一个小型自动化脚本。

## 参考资料

- [Model Context Protocol 官方网站](https://modelcontextprotocol.io) — 汇集 MCP 概念、架构以及客户端/服务器构建指南的官方文档站点。
- [构建 MCP 客户端指南](https://modelcontextprotocol.io/docs/develop/build-client) — 官方文档中讲解客户端实现的教程。与本文的 TypeScript 示例对照阅读会更有收获。
- [@modelcontextprotocol/typescript-sdk (GitHub)](https://github.com/modelcontextprotocol/typescript-sdk) — 本文所用 SDK 的官方仓库，可查看 `Client`、`StdioClientTransport` 的实现及 issue。
- [@modelcontextprotocol/sdk (npm)](https://www.npmjs.com/package/@modelcontextprotocol/sdk) — 实际安装的 npm 包，可查看版本历史和 zod peer dependency。
