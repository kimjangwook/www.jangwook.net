---
title: 'Building a TypeScript MCP Client — @modelcontextprotocol/sdk v1.29'
description: >-
  I built a TypeScript MCP client with @modelcontextprotocol/sdk v1.29.0: calling server tools
  and reading resources programmatically, without Claude Desktop.
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
  - slug: claude-agent-sdk-tool-use-complete-guide-2026
    score: 0.75
    reason:
      ko: Claude Agent SDK로 AI 에이전트에 직접 tool을 붙이는 방법이다. MCP 클라이언트를 에이전트 레이어에 통합할 때 참고가 된다.
      ja: Claude Agent SDKでAIエージェントに直接ツールを付ける方法だ。MCPクライアントをエージェントレイヤーに統合するときに参考になる。
      en: How to attach tools directly to an AI agent via the Claude Agent SDK — useful when integrating an MCP client into the agent layer.
      zh: 介绍如何通过 Claude Agent SDK 直接为 AI 智能体附加工具，在将 MCP 客户端集成到智能体层时可供参考。
faq:
  - question: "What is the difference between an MCP client and an MCP server?"
    answer: "An MCP server exposes tools and resources to the outside world, while a client connects to that server to call its tools and read its resources. Hosts like Claude Desktop and Cursor act as clients. In this guide I built the client myself using the `Client` class from `@modelcontextprotocol/sdk`."
  - question: "What transport options does the TypeScript SDK support (stdio vs HTTP/SSE)?"
    answer: "The SDK supports both stdio and HTTP-based transports (SSE and Streamable HTTP). This guide covers only stdio via `StdioClientTransport`, which spawns the server process directly. To connect to a remote server you'd use `StreamableHTTPClientTransport` or `SSEClientTransport`, with slightly different setup."
  - question: "How do you call a tool or list resources from the client?"
    answer: "After connecting, call `client.listTools()` to get the tool list and `client.callTool({ name, arguments })` to execute one. For resources, use `client.listResources()` and `client.readResource({ uri })`. The returned `content` array can hold `text`, `image`, or `resource` items, so check each item's `type` field before accessing `.text`."
  - question: "How does error handling work — does callTool throw?"
    answer: "Tool execution errors don't throw an exception; they come back on the response object as `isError: true`. Instead of `try/catch`, you check `result.isError`. This is intentional in the MCP spec, separating tool execution errors from protocol-level errors."
---

I've always been curious what Claude Desktop does internally when it connects to an MCP server. "It connects via stdio" is the short answer, but I needed to see the code to actually understand it. So today I installed `@modelcontextprotocol/sdk`, built a TypeScript MCP client from scratch, and ran it against a server I wrote myself.

The verdict: it's a lot simpler than I expected. There was also one behavior that surprised me — error handling works differently from what I assumed.

## The idea: do what Claude Desktop does, manually

MCP (Model Context Protocol) is the standard interface for AI agents to access external tools and data. I've written a lot about building MCP servers — including [how to build one in TypeScript](/en/blog/en/mcp-server-typescript-sdk-step-by-step-2026) and [spinning one up with Python FastMCP in 30 minutes](/en/blog/en/fastmcp-python-mcp-server-build-guide-2026). But I've never written about implementing the client side myself.

Thinking about production use cases, there are clear situations where a custom MCP client makes sense:

- Calling MCP server tools automatically from a CI/CD pipeline
- Integrating an MCP server into a custom agent layer you're building yourself
- Using MCP server capabilities as a library inside existing Python or TypeScript code

You don't need Claude Desktop or Claude Code. The `@modelcontextprotocol/sdk` package contains everything needed to build a client.

## Installing the SDK — two classes are all you need

```bash
npm install @modelcontextprotocol/sdk zod
```

The installed version is `1.29.0` as of today. The SDK includes both server and client implementations.

There are two core classes for building an MCP client.

**`Client`** — Manages the logical connection to a server. Provides methods like `listTools()`, `callTool()`, `listResources()`, and `readResource()`.

**`StdioClientTransport`** — The transport layer for communicating with stdio-based MCP servers. It spawns the server process directly using `command` and `args`.

To connect to remote MCP servers (HTTP/SSE), you'd use a different Transport class. This guide covers stdio only.

## Setting up the demo — server and client, both from scratch

I built a simple MCP server for the demo. It has two tools: `calculate` (basic arithmetic) and `transform_text` (string transformations).

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
      add: a + b,
      subtract: a - b,
      multiply: a * b,
      divide: b === 0 ? null : a / b,
    };
    const result = ops[operation];
    return {
      content: [{
        type: "text",
        text: result === null
          ? "Error: division by zero"
          : `${a} ${operation} ${b} = ${result}`,
      }],
    };
  }
);

server.tool(
  "transform_text",
  "Text transformation: uppercase, lowercase, reverse, word_count",
  {
    text: z.string(),
    op: z.enum(["uppercase", "lowercase", "reverse", "word_count"]),
  },
  async ({ text, op }) => {
    const results = {
      uppercase: text.toUpperCase(),
      lowercase: text.toLowerCase(),
      reverse: [...text].reverse().join(""),
      word_count: `Word count: ${text.trim().split(/\s+/).length}`,
    };
    return { content: [{ type: "text", text: results[op] }] };
  }
);

server.resource(
  "server-info",
  "mcp://demo/info",
  async (uri) => ({
    contents: [{
      uri: uri.href,
      mimeType: "text/plain",
      text: "MCP demo server v1.0.0 — stdio transport",
    }],
  })
);

const transport = new StdioServerTransport();
await server.connect(transport);
```

There's no need to run the server separately. The client's `StdioClientTransport` spawns the server process automatically.

## Client implementation — listTools, callTool, listResources

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

The moment `client.connect(transport)` is called, `node server.mjs` is spawned as a subprocess. The client and server then exchange JSON-RPC 2.0 messages over stdin/stdout pipes.

Once connected, I ran three operations in sequence.

**1. List available tools**

```javascript
const { tools } = await client.listTools();
for (const t of tools) {
  const params = Object.keys(t.inputSchema?.properties ?? {}).join(", ");
  console.log(`  • ${t.name}(${params}) — ${t.description}`);
}
```

**2. Call a tool**

```javascript
const result = await client.callTool({
  name: "calculate",
  arguments: { operation: "multiply", a: 42, b: 7 },
});
console.log(result.content[0].text);
```

**3. List and read resources**

```javascript
const { resources } = await client.listResources();
const info = await client.readResource({ uri: "mcp://demo/info" });
console.log(info.contents[0].text);
```

Here's the actual output from the sandbox run:

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

The server was never started separately. The client spawned `node server.mjs`, communicated with it, and terminated both processes cleanly when `client.close()` was called.

## Errors come back as isError, not as exceptions

This is the behavior that surprised me. When you call a tool that doesn't exist, `callTool()` doesn't throw — it returns a response object with `isError: true`.

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

No need for `try/catch` around tool calls. Instead, check `result.isError` in every tool call handler.

```javascript
async function callToolSafe(client, name, args) {
  const result = await client.callTool({ name, arguments: args });
  if (result.isError) {
    throw new Error(result.content[0]?.text ?? "Unknown MCP error");
  }
  return result.content[0]?.text;
}
```

This is intentional per the MCP spec. Tool execution errors and protocol errors are kept separate: protocol-level errors might throw, but tool-level errors come back in the content. Once I understood this, it made sense — it matches how Claude agents receive tool output. Even when a tool fails, the LLM gets the error text as part of the context and can reason about it.

## Parallel callTool — 4 calls in 1ms

I also tested parallel calls with `Promise.all`.

```javascript
const start = Date.now();
const ops = [
  ["add", 1, 1],
  ["multiply", 12, 12],
  ["subtract", 100, 37],
  ["divide", 144, 12],
];
const results = await Promise.all(
  ops.map(([op, a, b]) =>
    client.callTool({ name: "calculate", arguments: { operation: op, a, b } })
  )
);
console.log(`${ops.length} parallel calls completed in ${Date.now() - start}ms`);
```

Output:

```
Parallel calls (4 ops) in 1ms:
  1 add 1 = 2
  12 multiply 12 = 144
  100 subtract 37 = 63
  144 divide 12 = 12
```

Even over stdio, the SDK handles request multiplexing internally. Four concurrent calls go out and get matched to their responses correctly. Keep in mind that with stdio the server still processes them one at a time — if your tools are CPU-heavy, parallel calling has limited upside.

## Three real-world situations where a custom client is useful

Implementing this clarified where a custom client actually makes sense.

**Automation scripts calling MCP tools**

If your MCP server exposes code linting, file conversion, or external API lookups, you can invoke those tools from GitHub Actions or a local shell script — just a small Node.js program running `node client.mjs`. No GUI required.

**Building a custom agent framework**

If you're writing your own agent loop without LangGraph or LlamaIndex, a custom MCP client slots in as the tool execution layer. Pull the tool list with `listTools()`, inject it into your LLM prompt, parse the model's tool call decision, and run it with `callTool()`. For a more complete treatment of attaching tools to an AI agent, the [Claude Agent SDK tool use guide](/en/blog/en/claude-agent-sdk-tool-use-complete-guide-2026) covers this pattern in depth.

**Testing and debugging MCP servers**

During MCP server development, a custom client lets you verify tool behavior quickly without Claude Desktop. Call `listTools()` to check the generated `inputSchema`, then fire `callTool()` with various parameter combinations.

## Connecting to an existing public MCP server

So far I've only connected to my own server. The same client works with any public MCP server package.

```bash
npm install @modelcontextprotocol/server-filesystem
```

Then update the transport:

```javascript
const transport = new StdioClientTransport({
  command: "npx",
  args: [
    "-y",
    "@modelcontextprotocol/server-filesystem",
    "/path/to/allowed/directory",
  ],
});
```

With this you can call `read_file`, `write_file`, and `list_directory` tools via `callTool()`. The `command`/`args` in Claude Desktop's config file maps directly to what `StdioClientTransport` accepts — copy and paste and it works.

If you need multiple servers, create a separate `Client` instance per server. Client-to-server is a 1:1 relationship.

## Handling content types safely

One thing to be careful about: `callTool()` and `readResource()` return a `content` array where each item's structure depends on its `type` field.

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

If you blindly access `content[0].text` without checking `type`, you'll get `undefined` when the tool returns an image or embedded resource. With third-party MCP servers, always check the `type` field first.

The SDK's `.d.ts` files define `TextContent`, `ImageContent`, and `EmbeddedResource` as separate types. In TypeScript, importing and using these for explicit type narrowing is cleaner than relying on runtime checks alone.

## Honest limitations

A few friction points I ran into:

**Thin TypeScript generics.** The return type of `callTool()` is `{ content: Content[], isError?: boolean }` — `Content` being a union type. Narrowing it to `TextContent` requires explicit checks. Not a blocker, but not ergonomic.

**SSE/HTTP needs a different transport.** For remote MCP servers (HTTP-based), you'll need `StreamableHTTPClientTransport` or `SSEClientTransport`. The setup differs slightly and isn't covered in as many examples.

**Process lifecycle management.** `StdioClientTransport` doesn't spawn a new process per call — the server process stays alive for the duration of the connection. Always call `client.close()` at the end of a script, or use `process.on('exit', ...)` to clean up, otherwise the server process lingers.

**zod v4 compatibility warnings.** The SDK uses zod internally, and mixing it with zod v4 in your project may produce deprecation warnings. With SDK 1.29.0 and zod 4.4.3 everything ran fine for me, but it's worth watching.

## My take: the client side is underrepresented

There's a lot of content about building MCP servers. Custom client implementations — doing what Claude Desktop does programmatically — are far less documented.

The use cases are real. Developers building AI agent pipelines from scratch, teams integrating MCP into existing code, engineers debugging server behavior without a GUI. The `Client` class in `@modelcontextprotocol/sdk` is stable and the API is clean.

Seventy lines of TypeScript is enough to connect to an MCP server, list its tools, call them, read its resources, and close cleanly. I wish this had been in the official docs as a worked example from the start. Since it wasn't, here it is.

Next up: attaching this client to a real-world MCP server — probably the filesystem one or the GitHub MCP server — and building a small automation script around it.

## References

- [Model Context Protocol official site](https://modelcontextprotocol.io) — The official docs hub covering MCP concepts, architecture, and build guides for both clients and servers.
- [Build an MCP client (official guide)](https://modelcontextprotocol.io/docs/develop/build-client) — The official client-building tutorial. Worth comparing against the TypeScript example in this post.
- [@modelcontextprotocol/typescript-sdk on GitHub](https://github.com/modelcontextprotocol/typescript-sdk) — The official repo for the SDK used here. Source for `Client`, `StdioClientTransport`, and the issue tracker.
- [@modelcontextprotocol/sdk on npm](https://www.npmjs.com/package/@modelcontextprotocol/sdk) — The package you actually install. Check version history and the zod peer dependency here.
