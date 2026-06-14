---
title: 用TypeScript构建自己的MCP服务器 — @modelcontextprotocol/sdk实战教程
description: >-
  用@modelcontextprotocol/sdk v1.29.0和Zod v4从零构建TypeScript
  MCP服务器的实战教程。逐步讲解工具注册、InMemoryTransport测试、公共API集成，30分钟内完成一个可运行的服务器。
pubDate: '2026-05-31'
heroImage: ../../../assets/blog/mcp-server-typescript-sdk-step-by-step-2026-hero.png
tags:
  - MCP
  - TypeScript
  - 教程
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
  - question: "如何用TypeScript构建MCP服务器?"
    answer: "安装@modelcontextprotocol/sdk和Zod后，只需三个步骤。创建McpServer实例，用server.tool()注册基于Zod模式的工具，然后连接传输层。理解这个模式后，就能在30分钟内完成一个可运行的服务器。"
  - question: "@modelcontextprotocol/sdk如何开始使用?"
    answer: "用npm install @modelcontextprotocol/sdk zod安装，此时会装入SDK 1.29.0和Zod 4.4.3。由于SDK以ESM模块形式发布，需要在package.json中指定type: module，并在tsconfig.json中将module设为ESNext，导入路径才能正确解析。"
  - question: "stdio传输与HTTP/SSE传输有什么区别?"
    answer: "stdio(StdioServerTransport)是连接Claude Desktop或Cursor的标准本地部署方式，配置简单。HTTP/SSE传输用于团队共享或部署到云端，但需要另外处理认证、HTTPS、CORS和会话管理。如果只是内部工具，stdio要简单得多。"
  - question: "MCP工具中的错误该如何处理?"
    answer: "MCP的惯例是把错误信息放进content数组返回，而不是抛出异常，因为不同客户端处理抛出异常的方式各不相同。在响应中加上isError: true标志，客户端就能把该响应当作错误处理。"
---

```typescript
// 就这一行代码
const server = new McpServer({ name: "my-server", version: "1.0.0" });
server.tool("get_book_info", "查询图书信息", { isbn: z.string() }, async ({ isbn }) => { ... });
```

第一次决定尝试构建MCP服务器时，我说实话，惊讶于它比想象中容易得多。虽然经常听说MCP（Model Context Protocol）正在成为AI平台之间的标准，但"自己构建服务器"这个说法总让人觉得复杂、门槛很高。然而，只需安装一个`@modelcontextprotocol/sdk`包和Zod，就能在30分钟内完成一个可运行的MCP服务器。

于是我自己动手做了一个。下面出现的全是我亲手跑过的代码，以及当时返回的真实输出。我在公共API（Open Library）上搭了一个用ISBN查图书信息的工具，目的就是靠双手把MCP服务器到底怎么运转这件事弄明白，而不是停留在文档层面。

## 为什么现在要亲手构建MCP服务器

Claude、Cursor、Windsurf、Zed等主流AI编码工具都已将MCP作为标准集成协议采用。这意味着构建一个MCP服务器，就可以不依赖特定AI平台，在多个AI工具中使用相同的功能。

过去如果要开发自己的API，还需要为每个AI平台单独开发插件或集成，而MCP让"构建一次，处处可用"成为可能。我关注这一点的理由很简单。将公司内部数据库查询、内部文档搜索、特定业务自动化脚本用MCP工具包装一次，就可以在Claude和Cursor中同样使用。

当然，生态系统还没有完全成熟。但正如在MCP开放标准与Linux Foundation参与中所确认的，这个方向已经在成为行业标准。

## 环境配置与包安装

首先初始化Node.js项目并安装所需包。

```bash
mkdir my-mcp-server && cd my-mcp-server
npm init -y
npm install @modelcontextprotocol/sdk zod
```

实际运行结果如下：

```
$ mkdir test-project && cd test-project && npm init -y
$ npm install @modelcontextprotocol/sdk zod
added 92 packages, and audited 93 packages in 2s
found 0 vulnerabilities
```

安装了`@modelcontextprotocol/sdk` 1.29.0版本和`zod` 4.4.3版本。依赖项增加到92个包，但没有漏洞。如果使用TypeScript，还需要添加开发依赖：

```bash
npm install -D typescript @types/node tsx
npx tsc --init
```

在`tsconfig.json`中设置`"module": "ESNext"`和`"moduleResolution": "bundler"`（或`"node16"`）非常重要。这是因为SDK以ESM模块方式分发。

### package.json配置

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

`"type": "module"`设置是必须的。没有它，SDK的导入路径（`@modelcontextprotocol/sdk/server/mcp.js`）就无法正确解析。

## 创建McpServer实例: 核心三步模式

通过实际实验确认的核心是三个步骤。

1. 创建`McpServer`实例
2. 用`server.tool()`注册基于Zod schema的工具
3. 连接传输层

理解了这个模式，就掌握了MCP服务器开发的90%。

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { z } from "zod";

// 第一步：创建服务器实例
const server = new McpServer({ name: "demo-server", version: "1.0.0" });
```

`McpServer`构造函数接收`name`和`version`两个字段。这些信息在MCP客户端识别服务器时使用。

### 注册工具：server.tool()

```typescript
// 第二步：注册工具
server.tool(
  "get_book_info",                               // 工具名称
  "Fetch book metadata from Open Library by ISBN", // 工具描述（AI判断何时使用的依据）
  { isbn: z.string().describe("ISBN-13 or ISBN-10") }, // Zod schema
  async ({ isbn }) => {                           // 执行处理器
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

清楚理解`server.tool()`的参数结构非常重要：

- <strong>第一个参数</strong>：工具名称（AI调用时使用的标识符）
- <strong>第二个参数</strong>：工具描述（AI模型判断何时应使用此工具的自然语言描述）
- <strong>第三个参数</strong>：Zod schema对象（输入值类型和描述）
- <strong>第四个参数</strong>：异步处理器函数

第二个参数"工具描述"是AI模型读取的提示词。描述越具体，AI在合适的情况下使用工具就越准确。"get info"这样模糊的描述远不如"Fetch book metadata from Open Library by ISBN"好。

### 响应格式：MCP标准结构

处理器返回的格式也有标准：

```typescript
return {
  content: [
    { type: "text", text: "响应文本" }
  ]
};
```

`content`数组中的每个项目包含`type`和该类型对应的数据。除文本外，也可以返回图片（`type: "image"`）或资源（`type: "resource"`），但大多数情况下文本就足够了。

即使发生错误，MCP惯例也是不抛出异常，而是将错误信息包装在`content`中返回。抛出异常会导致不同客户端的处理方式不同。

## 使用InMemoryTransport在同一进程中测试

在将MCP服务器连接到实际的Claude或Cursor之前，有一种方法可以在同一进程内测试服务器-客户端往返通信。只需使用`InMemoryTransport`。

```typescript
// 第三步：连接传输层
const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

// 连接服务器
await server.connect(serverTransport);

// 连接客户端
const client = new Client({ name: "test-client", version: "1.0.0" });
await client.connect(clientTransport);
```

`InMemoryTransport.createLinkedPair()`返回一对互相连接的客户端传输层和服务器传输层。无需配置stdio或HTTP服务器，直接在内存中通信。

现在用客户端查询并调用服务器的工具列表：

```typescript
// 查询已注册的工具列表
const { tools } = await client.listTools();
console.log("=== Tools registered ===");
tools.forEach(t => console.log(`  - ${t.name}: ${t.description}`));

// 调用工具
const result = await client.callTool({
  name: "get_book_info",
  arguments: { isbn: "9780132350884" }
});

console.log("\n=== Result ===");
console.log(result.content[0].text);

await client.close();
```

实际运行结果：

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

从Open Library的公共API成功获取了真实数据并正常输出。由于使用的是无需API密钥的公共REST API，不需要额外的认证配置。

### 完整可运行代码（mcp-demo.mjs）

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

## 使用StdioServerTransport与Claude实际集成

`InMemoryTransport`非常适合测试和开发调试，但要连接到实际的Claude Desktop或Cursor，需要切换到`StdioServerTransport`。这是MCP服务器的标准部署方式。

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

// 以stdio传输层启动
const transport = new StdioServerTransport();
await server.connect(transport);
```

现在在`Claude Desktop`的MCP配置文件（`~/Library/Application Support/Claude/claude_desktop_config.json`）中注册服务器：

```json
{
  "mcpServers": {
    "book-server": {
      "command": "node",
      "args": ["/绝对路径/my-mcp-server/dist/server.js"]
    }
  }
}
```

如果用TypeScript编写，构建后指向`dist/server.js`，或者使用`tsx`：

```json
{
  "mcpServers": {
    "book-server": {
      "command": "npx",
      "args": ["tsx", "/绝对路径/my-mcp-server/src/server.ts"]
    }
  }
}
```

重启Claude Desktop后，在对话中提到ISBN时，会自动使用`get_book_info`工具。

### 注册多个工具

多次调用`server.tool()`可以添加更多工具：

```typescript
// 添加图书搜索工具
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

在Zod schema中使用`.default(5)`可以使参数变为可选，当AI没有明确提供值时使用默认值。

## 设计工具时需要注意的问题

实际使用后，发现了几个陷阱。

<strong>第一，需要注意工具名称和描述。</strong>由于AI模型选择工具的依据是工具描述，如果描述模糊（如"get info"），AI可能不会在合适的情况下使用工具，或者使用错误。在描述中包含具体的动作、输入和输出非常重要。

<strong>第二，Zod v4的API与v3不同。</strong>在Zod 4.4.3中，部分API发生了变化。直接复制粘贴原有的Zod v3代码可能会出现类型错误。特别是`.optional()`和`.nullable()`的组合方式，以及`z.union()`的行为方式都有所改变。如果现有项目中使用了Zod，需要检查是否存在版本冲突。

<strong>第三，错误处理需要谨慎。</strong>我早期犯的错误是在网络错误时直接抛出异常。在MCP标准中，将工具执行错误也包装在`content`中返回更为安全。因为不同客户端处理异常的方式不同：

```typescript
async ({ isbn }) => {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      return {
        content: [{ type: "text", text: `API error: ${res.status} ${res.statusText}` }],
        isError: true  // 明确标记为错误
      };
    }
    // ... 正常处理
  } catch (error) {
    return {
      content: [{ type: "text", text: `Network error: ${error instanceof Error ? error.message : String(error)}` }],
      isError: true
    };
  }
}
```

添加`isError: true`标志后，客户端可以将响应识别为错误。

<strong>第四，需要截断过长的响应。</strong>AI的上下文窗口是有限的。工具响应过长会导致AI丢失之前的对话，或出现上下文超出错误。对搜索结果或列表类数据，限制最大条目数是明智之举。

## 使用MCP Inspector进行调试

开发过程中，我大量使用了`MCP Inspector`。这是一个基于浏览器的GUI，可以查看MCP服务器的工具列表并直接调用。

```bash
npx @modelcontextprotocol/inspector node dist/server.js
```

在浏览器中打开`http://localhost:5173`，可以可视化地查看服务器注册的工具列表和每个工具的Zod schema。输入参数并执行后，实际响应会以JSON格式输出。

需要注意的是，MCP Inspector需要单独的Node.js 18+环境。而且Inspector本身也需要安装npm包，首次运行可能需要数十秒。

## 资源与提示词：除工具外的MCP功能

MCP规范除了工具（Tools）外，还提供资源（Resources）和提示词（Prompts）两种功能。

<strong>资源</strong>是AI可读取的数据源。将文件、数据库表、API响应等作为资源暴露，AI就可以将其作为上下文读取：

```typescript
server.resource(
  "book-catalog",
  "books://catalog",
  async (uri) => ({
    contents: [
      {
        uri: uri.href,
        mimeType: "text/plain",
        text: "图书目录内容..."
      }
    ]
  })
);
```

<strong>提示词</strong>是可复用的提示词模板。可以为复杂任务定义多步骤提示词，让客户端轻松调用。

说实话，最初我不太清楚资源和提示词功能在实际中用得有多多。在大多数实际使用场景中，仅靠工具就已足够。资源在提供大量上下文数据时有用，提示词在标准化工作流程时有用。

## 用Zod v4处理复杂Schema

除了简单的`z.string()`外，还可以将各种Zod schema用作工具参数：

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
    // 实现...
    return { content: [{ type: "text", text: "结果..." }] };
  }
);
```

组合使用`z.object()`、`z.enum()`、`.optional()`、`.default()`等，可以以类型安全的方式定义复杂的工具接口。AI会将这个schema转换为JSON Schema格式，从而理解应该如何填写参数。

注意：在Zod v4中，`.describe()`应在`.optional()`之前添加。`z.string().optional().describe()`可能会导致类型推断不符合预期。正确顺序是`z.string().describe("描述").optional()`。

## HTTP/SSE传输层：部署为远程MCP服务器

到目前为止都是本地stdio方式。如果需要运营全团队共享的MCP服务器，或部署到云端，就需要HTTP/SSE传输层。

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
    // ... 相同的实现
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

以这种方式部署后，Cursor或Claude Desktop可以将`http://localhost:3000/sse`注册为MCP服务器URL。不过HTTP方式配置更复杂，安全（认证、HTTPS）处理也需要单独进行。如果只是团队内部工具，stdio要简单得多。

正如在MCP vs A2A vs Open Responses协议比较中讨论的，远程MCP服务器架构在成熟度和安全方面还有很多需要整理的地方。如果现在计划远程部署，认证令牌、CORS和会话管理是必须认真考虑的问题。

## 实际可用的工具创意

读到这里，应该已经充分理解了MCP服务器的结构。以下是我考虑过的一些实用工具创意：

<strong>内部系统集成</strong>：
- Jira/Linear问题查询（`get_issue`、`create_issue`、`list_my_issues`）
- Confluence/Notion文档搜索（`search_docs`、`get_page`）
- Slack消息搜索（`search_messages`、`get_channel_history`）

<strong>开发工作流</strong>：
- GitHub PR列表和评审（`list_prs`、`get_pr_diff`、`add_review_comment`）
- 部署状态检查（`get_deployment_status`、`rollback_deployment`）
- 日志查询（`search_logs`、`get_error_trace`）

<strong>数据分析</strong>：
- SQL查询执行（只读权限）（`run_query`、`list_tables`）
- 指标仪表板数据查询（`get_metrics`、`get_alert_status`）

以上任何一个，用`server.tool()`模式包装一下，30分钟内就能变成MCP服务器。

## 总结：我认为这将成为AI工具部署的现实标准

通过这次实验，我确认了MCP服务器开发的门槛比想象的低得多。`@modelcontextprotocol/sdk`的`McpServer` API清晰明了，用Zod定义类型安全的schema也很直观。

但局限也很明显。<strong>要与实际的Claude或Cursor客户端集成，需要切换到StdioServerTransport</strong>，这个过程中还涉及部署环境、绝对路径配置、Node.js版本兼容性等额外设置。另外，Zod v4相比v3部分API有所变化，现有代码不能直接使用的情况也存在。

尽管如此，能够在无需API密钥的情况下，在30分钟内完成一个从公共REST API包装到实际数据查询的端到端可运行管道，这显然是有吸引力的。在Claude、Cursor、Windsurf等已将MCP作为标准采用的情况下，MCP服务器是将自己的工具同时暴露给多个AI平台的最现实方式。

下一步，建议选择一个实际的内部系统，尝试将其包装为MCP工具。代码结构就是本文所涉及的全部内容。剩下的，就是理解那个系统的API了。

---

<strong>参考链接</strong>：
- [Model Context Protocol官方文档](https://modelcontextprotocol.io)
- [@modelcontextprotocol/sdk npm](https://www.npmjs.com/package/@modelcontextprotocol/sdk)
- [Open Library API](https://openlibrary.org/developers/api)
- [MCP Inspector](https://github.com/modelcontextprotocol/inspector)
