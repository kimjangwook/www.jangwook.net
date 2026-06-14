---
draft: true
title: MCP远程HTTP服务器部署模式 — 从stdio迁移到Streamable HTTP的实践指南
description: >-
  使用MCP Streamable HTTP传输将stdio服务器转变为可远程部署的HTTP服务的实战指南。基于TypeScript SDK
  v1.29.0，通过实验日志详解stateful与stateless模式实现及Docker、Cloudflare部署模式。
pubDate: '2026-05-27'
heroImage: ../../../assets/blog/mcp-remote-http-deployment-pattern/hero.png
tags:
  - MCP
  - TypeScript
  - AI智能体
  - 部署
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

最初构建MCP服务器时，我用stdio传输在本地与Claude Desktop连接。`uv run` 一行命令，服务器启动，连接建立，简单直接。但当团队成员想使用同一个服务器时，问题出现了。stdio要求客户端直接spawn服务器进程，这意味着在我本地运行的服务器没有办法让其他人连接。

Streamable HTTP传输正是为解决这个问题而存在的。本文基于 `@modelcontextprotocol/sdk` v1.29.0，用TypeScript直接实现MCP HTTP服务器，通过实际实验验证stateful/stateless两种模式的差异，并整理在Docker、Cloud Run和Cloudflare Workers上的部署要点。

## stdio遇到瓶颈的三个场景

所有MCP服务器都从stdio开始，但以下三种情况下stdio不是答案：

**团队共享工具。** 读取本地文件系统的服务器用stdio够了。但调用公司内部API或抓取Confluence内容的服务器呢？你希望把它托管在一个地方，让整个团队都能访问。这在结构上是stdio无法实现的——每个客户端必须获取二进制文件并在本地运行。

**云端客户端。** 如果从Claude.ai的Web界面或Claude API连接外部MCP服务器，必须有HTTP端点。Web客户端无法spawn进程。

**横向扩展。** stdio是每个客户端对应一个服务器进程。100个并发用户就是100个进程。HTTP可以独立扩展服务器，在负载均衡器后面运行多个实例，高效复用连接。

Streamable HTTP在MCP 2025-03-26规范中引入，替代了原有的HTTP+SSE方式。它使用单一端点(`/mcp`)处理POST、GET和DELETE，通过SSE提供服务器到客户端的流式传输。

## Streamable HTTP的实际工作原理

在实现之前，理解协议流程很重要。跳过这部分，你会遇到 `Not Acceptable` 错误而不知所措（我就这样吃过亏）。

**Accept请求头的陷阱。** 客户端发送 `POST /mcp` 时，必须包含 `Accept: application/json, text/event-stream`——两种类型都需要。只发送 `application/json` 会得到 `Not Acceptable` 响应。SDK动态决定响应格式（同步JSON或SSE流），客户端必须声明两者都能接受。

**会话管理方式。** 在stateful模式下，第一个 `initialize` 请求后，服务器在响应头中返回 `Mcp-Session-Id`。后续所有请求必须包含此头部。关闭会话使用 `DELETE /mcp`。

**响应格式。** 响应以SSE事件格式返回：

```
event: message
data: {"result":{...},"jsonrpc":"2.0","id":1}
```

不是直接解析JSON，而是提取 `data:` 行。官方MCP客户端库会自动处理这部分，但用curl直接测试时需要了解这一点。

如果已读过[用Python FastMCP从零构建MCP服务器](/zh/blog/zh/mcp-server-build-practical-guide-2026)的指南，基本概念应该已经熟悉。这里使用TypeScript SDK直接构建HTTP层。

## 实践实现：用TypeScript SDK构建HTTP服务器

环境：Node.js v22.22.0、`@modelcontextprotocol/sdk` v1.29.0、Express。

```bash
npm init -y
npm install @modelcontextprotocol/sdk express
```

核心代码分两部分：创建MCP服务器实例和连接HTTP传输。

```javascript
const { Server } = require("@modelcontextprotocol/sdk/server/index.js");
const { StreamableHTTPServerTransport } = require("@modelcontextprotocol/sdk/server/streamableHttp.js");
const { ListToolsRequestSchema, CallToolRequestSchema } = require("@modelcontextprotocol/sdk/types.js");
const express = require("express");
const { randomUUID } = require("crypto");

const sessions = new Map(); // 会话存储

function createMcpServer() {
  const server = new Server(
    { name: "my-tools", version: "1.0.0" },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      {
        name: "greet",
        description: "接收名字并返回问候消息",
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
      return { content: [{ type: "text", text: `你好，${args.name}！（通过HTTP连接）` }] };
    }
    throw new Error(`未知工具: ${name}`);
  });

  return server;
}

const app = express();
app.use(express.json());

app.post("/mcp", async (req, res) => {
  const sessionId = req.headers["mcp-session-id"];
  let transport;

  if (sessionId && sessions.has(sessionId)) {
    transport = sessions.get(sessionId); // 复用现有会话
  } else {
    transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(), // stateful模式
    });
    const mcpServer = createMcpServer();
    await mcpServer.connect(transport);

    transport.onclose = () => {
      if (transport.sessionId) sessions.delete(transport.sessionId);
    };
  }

  await transport.handleRequest(req, res, req.body);

  // 首次请求后保存会话
  if (!sessionId && transport.sessionId) {
    sessions.set(transport.sessionId, transport);
  }
});

app.get("/mcp", async (req, res) => {
  const sessionId = req.headers["mcp-session-id"];
  const transport = sessions.get(sessionId);
  if (!transport) { res.status(404).json({ error: "会话不存在" }); return; }
  await transport.handleRequest(req, res);
});

app.delete("/mcp", async (req, res) => {
  const sessionId = req.headers["mcp-session-id"];
  const transport = sessions.get(sessionId);
  if (!transport) { res.status(404).json({ error: "会话不存在" }); return; }
  await transport.handleRequest(req, res);
});

app.listen(3001, "127.0.0.1", () => {
  console.log("MCP服务器运行中：http://127.0.0.1:3001/mcp");
});
```

将 `createMcpServer()` 抽离为函数，是因为在stateful模式下每个会话需要独立的服务器实例。多个会话共用一个Server实例会导致状态混乱。

## 实验日志：curl完整流程测试结果

在本地沙箱中实际运行了该服务器，用curl验证了完整协议流程。Node.js v22.22.0，SDK v1.29.0。

**初始化请求：**

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
# 响应（SSE格式）
event: message
data: {"result":{"protocolVersion":"2025-03-26","capabilities":{"tools":{}},"serverInfo":{"name":"lab-tools","version":"1.0.0"}},"jsonrpc":"2.0","id":1}

# 响应头
Mcp-Session-Id: d0290117-0ce6-4bc5-ab25-af536115ba93
```

**工具调用：**

```
tools/list  → greet、add 两个工具确认
tools/call greet  → "你好，金长旭！（通过HTTP连接）"
tools/call add    → "42 + 58 = 100"
```

**会话终止：**

```
DELETE /mcp → HTTP 200
相同会话重新访问 → HTTP 400 Bad Request（不是404）
```

收到400而非404出乎意料。SDK似乎将删除后的访问解释为"未初始化"而非"会话不存在"。对客户端来说，无论哪种，重新连接的信号是一样的。

## stateful vs stateless：如何选择模式

SDK支持两种模式，选择主要取决于部署环境。

**Stateful模式：**

```javascript
new StreamableHTTPServerTransport({
  sessionIdGenerator: () => randomUUID(),
})
```

发放会话ID，服务器在内存中维护每个会话的状态。适合多轮对话、工具执行中间状态保存和基于订阅的SSE流。

**Stateless模式：**

```javascript
new StreamableHTTPServerTransport({
  sessionIdGenerator: undefined,
})
```

每个请求独立。无会话跟踪，无内存开销，水平扩展简单。

我的判断原则：**部署位置决定使用哪种模式。**

单实例VM或容器用stateful很方便。进程持续运行，会话Map稳定存在。而Serverless环境（AWS Lambda、Cloudflare Workers）每次请求都重置执行上下文——内存会话Map无法持久化。这种情况必须使用stateless模式。将stateful部署到Serverless，会话ID会被发放，但第二次请求命中全新实例，不知道这个ID，返回404或400。看起来像SDK的bug，实际上是架构不匹配。

坦率地说，即使在长期运行的实例上，stateful模式的内存会话Map也有可靠性问题。服务器重启、实例替换、崩溃恢复——任何一种都会清空会话Map。持有有效会话ID的客户端突然收到"会话不存在"。解决这个问题需要Redis等外部会话存储，而SDK并不开箱即提供。

## 各部署环境的选择标准

**Docker / Cloud Run — 推荐：stateful**

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
EXPOSE 3001
CMD ["node", "mcp-server.js"]
```

接受PORT环境变量——Cloud Run会自动设置：

```javascript
const PORT = process.env.PORT || 3001;
app.listen(PORT, "0.0.0.0");
```

Cloud Run注意事项：除非将最小实例数设为1，否则每次冷启动都会重置会话Map。这种情况下stateless反而更简单。

**Cloudflare Workers — 必须：stateless + WebStandard传输**

Workers使用Web Standard API而非Node.js HTTP API。SDK同时提供两种：

```javascript
const { WebStandardStreamableHTTPServerTransport } = require(
  "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js"
);

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

[MCP服务器在Kubernetes上的稳定运营方法](/zh/blog/zh/mcp-server-production-deployment-kubernetes-guide)一文中也涉及同样的核心问题：在哪个层面管理会话状态？这个决定决定了上层所有架构。

## 已知局限

坦诚说明粗糙的地方：

**内存会话的脆弱性。** Node.js内存中的Map不能在重启、实例替换或崩溃后存活。生产环境需要Redis等外部会话存储。SDK提供了 `EventStore` 接口，但与Redis的连接需要自行实现。

**负载均衡器兼容性问题。** Stateful模式在多实例间需要粘性路由。轮询负载均衡器会将相同会话ID路由到不同实例，导致404。MCP 2026路线图计划通过"协议层无状态"来解决这个问题，但规范尚未发布。

**SSE调试不便。** `event: message\ndata: {...}` 格式使标准工具操作复杂。无法直接将输出管道到 `jq`。建议为测试会话准备小型辅助脚本，或使用MCP Inspector工具。

[用MCP网关集中管理智能体流量](/zh/blog/zh/mcp-gateway-agent-traffic-control)一文中介绍了在网关层抽象会话管理复杂性的方案——运营多个MCP服务器时这也是有效的解决思路。

## 可行性评估

截至SDK v1.29.0，Streamable HTTP传输已达到生产可用水平。与Express的集成运作良好，stateless模式部署到Serverless也没有问题。

我的实际感受是：**stateful模式适合本地开发和单实例部署。规模稍大时，stateless加外部会话存储的组合更现实。**

最常见的第一个错误是将stateful模式部署到Serverless环境。每次冷启动都会重置会话Map，客户端持有的ID服务器不再认识。看起来像SDK的bug，追查后才发现是部署架构不匹配。

如果是第一次构建TypeScript MCP服务器，建议从stdio开始，在需要团队共享或远程访问时切换到Streamable HTTP。传输层的替换比想象中简单，业务逻辑不需要改动。
