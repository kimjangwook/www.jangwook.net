---
draft: true
title: 'MCP Remote HTTP: Convert stdio Servers to Streamable HTTP'
description: >-
  Convert MCP stdio servers to remote Streamable HTTP services. Covers stateful
  vs stateless session modes, Docker and Cloudflare Workers deployment patterns,
  with real experiment logs using TypeScript SDK v1.29.0.
pubDate: '2026-05-27'
heroImage: ../../../assets/blog/mcp-remote-http-deployment-pattern/hero.png
tags:
  - MCP
  - TypeScript
  - AI-Agents
  - Deployment
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

When I first built an MCP server, I used stdio transport and connected it directly to Claude Desktop locally. `uv run` one line, server is up, connection established — simple enough. But when a teammate asked to use the same server, things broke down fast. stdio requires the client to spawn the server process directly, which means there's no way for someone else to connect to a server running on my machine.

Streamable HTTP transport exists to solve exactly this problem. In this post, I'll walk through implementing an MCP HTTP server in TypeScript using `@modelcontextprotocol/sdk` v1.29.0, verify both stateful and stateless session modes through actual curl experiments, and cover real deployment considerations for Docker, Cloud Run, and Cloudflare Workers.

## Three Situations Where stdio Falls Short

Every MCP server starts with stdio, but there are three scenarios where it stops working:

**Team-shared tooling.** A server that reads your local filesystem is fine on stdio. But a server that calls your company's internal APIs or scrapes your Confluence? You want it hosted somewhere the whole team can reach. That's structurally impossible with stdio — every client would need to pull the binary and run it locally.

**Cloud clients.** If you're connecting from Claude.ai's web interface or from the Claude API, you need an HTTP endpoint. Web clients can't spawn processes.

**Scaling out.** stdio is one process per client. 100 concurrent users means 100 processes. HTTP lets you scale the server independently, run multiple instances behind a load balancer, and reuse connections efficiently.

Streamable HTTP was introduced in the MCP 2025-03-26 spec, replacing the older HTTP+SSE approach. It uses a single endpoint (`/mcp`) for POST, GET, and DELETE, and delivers server-to-client streaming via SSE.

## How Streamable HTTP Actually Works

Before building anything, the protocol flow is worth understanding. Skip this and you'll hit a `Not Acceptable` error and not know why (I did).

**The Accept header trap.** When a client sends `POST /mcp`, it must include `Accept: application/json, text/event-stream` — both content types. Sending only `application/json` gets you a `Not Acceptable` response. The SDK dynamically decides whether to respond with synchronous JSON or an SSE stream, and it needs the client to declare it can handle both.

**Session management.** In stateful mode, after the first `initialize` request, the server returns an `Mcp-Session-Id` in the response headers. Every subsequent request must include this header. Closing a session is done via `DELETE /mcp`.

**Response format.** Responses come as SSE events:

```
event: message
data: {"result":{...},"jsonrpc":"2.0","id":1}
```

You're not parsing JSON directly — you extract the `data:` line. Official MCP client libraries handle this automatically, but if you're testing with curl you need to know this.

If you've read the guide on [building an MCP server from scratch with Python FastMCP](/en/blog/en/mcp-server-build-practical-guide-2026), the core concepts will be familiar. Here we're using the TypeScript SDK and wiring up the HTTP layer directly.

## Implementation: Building the HTTP Server with TypeScript SDK

Environment: Node.js v22.22.0, `@modelcontextprotocol/sdk` v1.29.0, Express.

```bash
npm init -y
npm install @modelcontextprotocol/sdk express
```

The implementation has two moving parts: creating MCP server instances and connecting them to the HTTP transport.

```javascript
const { Server } = require("@modelcontextprotocol/sdk/server/index.js");
const { StreamableHTTPServerTransport } = require("@modelcontextprotocol/sdk/server/streamableHttp.js");
const { ListToolsRequestSchema, CallToolRequestSchema } = require("@modelcontextprotocol/sdk/types.js");
const express = require("express");
const { randomUUID } = require("crypto");

const sessions = new Map();

function createMcpServer() {
  const server = new Server(
    { name: "my-tools", version: "1.0.0" },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      {
        name: "greet",
        description: "Returns a greeting for a given name",
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
      return { content: [{ type: "text", text: `Hello, ${args.name}! (connected via HTTP)` }] };
    }
    throw new Error(`Unknown tool: ${name}`);
  });

  return server;
}

const app = express();
app.use(express.json());

app.post("/mcp", async (req, res) => {
  const sessionId = req.headers["mcp-session-id"];
  let transport;

  if (sessionId && sessions.has(sessionId)) {
    transport = sessions.get(sessionId);
  } else {
    transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
    });
    const mcpServer = createMcpServer();
    await mcpServer.connect(transport);

    transport.onclose = () => {
      if (transport.sessionId) sessions.delete(transport.sessionId);
    };
  }

  await transport.handleRequest(req, res, req.body);

  if (!sessionId && transport.sessionId) {
    sessions.set(transport.sessionId, transport);
  }
});

app.get("/mcp", async (req, res) => {
  const sessionId = req.headers["mcp-session-id"];
  const transport = sessions.get(sessionId);
  if (!transport) { res.status(404).json({ error: "Session not found" }); return; }
  await transport.handleRequest(req, res);
});

app.delete("/mcp", async (req, res) => {
  const sessionId = req.headers["mcp-session-id"];
  const transport = sessions.get(sessionId);
  if (!transport) { res.status(404).json({ error: "Session not found" }); return; }
  await transport.handleRequest(req, res);
});

app.listen(3001, "127.0.0.1", () => {
  console.log("MCP server running: http://127.0.0.1:3001/mcp");
});
```

`createMcpServer()` is factored into a function because in stateful mode, each session gets its own server instance. Sharing a single Server across sessions mixes state in unexpected ways.

## Experiment Log: Full Flow Test with curl

I ran this server locally and walked through the complete protocol flow with curl. Node.js v22.22.0, SDK v1.29.0.

**Initialize request:**

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
# Response (SSE format)
event: message
data: {"result":{"protocolVersion":"2025-03-26","capabilities":{"tools":{}},"serverInfo":{"name":"lab-tools","version":"1.0.0"}},"jsonrpc":"2.0","id":1}

# Response header
Mcp-Session-Id: d0290117-0ce6-4bc5-ab25-af536115ba93
```

**Tool calls:**

```
tools/list  → greet, add (two tools confirmed)
tools/call greet  → "Hello, Kim Jangwook! (connected via HTTP)"
tools/call add    → "42 + 58 = 100"
```

**Session termination:**

```
DELETE /mcp  → HTTP 200
Accessing same session again → HTTP 400 Bad Request (not 404)
```

The 400 on re-access was surprising — I expected 404. The SDK appears to interpret post-deletion access as "not initialized" rather than "session not found." Either way, the client needs to reconnect.

## stateful vs stateless: Which Mode to Pick

The SDK supports two modes, and the choice is mostly determined by where you're deploying.

**Stateful mode:**

```javascript
new StreamableHTTPServerTransport({
  sessionIdGenerator: () => randomUUID(),
})
```

Session IDs are issued, and the server keeps per-session state in memory. Good for multi-turn conversations, mid-execution state, and SSE subscription streams.

**Stateless mode:**

```javascript
new StreamableHTTPServerTransport({
  sessionIdGenerator: undefined,
})
```

Each request is independent. No session tracking, no memory overhead, easy horizontal scaling.

My rule of thumb: **where you deploy determines which mode you use.**

Single-instance VM or container? Stateful works fine. The process stays alive, the session Map persists. Serverless (AWS Lambda, Cloudflare Workers)? The execution context resets per request — an in-memory session Map doesn't survive. Use stateless mode, full stop. If you deploy stateful to serverless, the session ID gets issued but the second request hits a fresh instance that has no record of it. You get a 404 (or 400), and it'll look like an SDK bug until you trace it back to the architecture mismatch.

I'll also be honest that stateful mode's in-memory session Map has production-level reliability problems even on long-running instances. Server restarts, rolling updates, crash recovery — any of these wipe the session Map. Clients holding valid session IDs suddenly get "session not found." Solving this properly requires an external session store like Redis, which isn't something the SDK provides out of the box.

## Deployment Patterns by Environment

**Docker / Cloud Run — recommended: stateful**

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
EXPOSE 3001
CMD ["node", "mcp-server.js"]
```

Accept the `PORT` environment variable — Cloud Run sets it automatically:

```javascript
const PORT = process.env.PORT || 3001;
app.listen(PORT, "0.0.0.0");
```

Cloud Run caveat: unless you set minimum instances to 1, cold starts reset the session Map. At that point stateless is actually simpler.

**Cloudflare Workers — required: stateless + WebStandard transport**

Workers uses Web Standard APIs, not Node.js HTTP. The SDK ships both:

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

**Adding OAuth 2.1 authentication**

MCP 2.1 ships with built-in OAuth 2.1 support. The SDK provides a pre-configured Express app factory:

```javascript
const { createMcpExpressApp } = require("@modelcontextprotocol/sdk/server/express.js");

// Automatically enables DNS rebinding protection for localhost bindings
const app = createMcpExpressApp({
  host: "0.0.0.0",
  allowedHosts: ["my-mcp-server.example.com"]
});
```

DNS rebinding protection activates automatically when binding to localhost. For `0.0.0.0`, explicitly pass `allowedHosts`.

The article on [running MCP servers on Kubernetes](/en/blog/en/mcp-server-production-deployment-kubernetes-guide) digs into the same core question: at which layer do you manage session state? The answer shapes everything above it.

## Known Limitations

Being straightforward about the rough edges:

**In-memory session fragility.** A Map in Node.js memory doesn't survive restarts, instance replacements, or crashes. For production, you need an external session store. The SDK exposes an `EventStore` interface, but wiring it to Redis is on you.

**Load balancer compatibility.** Stateful sessions on multiple instances require sticky routing. Round-robin load balancers will route the same session ID to different instances, getting 404s. The MCP 2026 roadmap targets "stateless at the protocol layer" to eliminate this problem, but that spec isn't released yet.

**SSE debugging friction.** The `event: message\ndata: {...}` format makes standard tooling awkward. You can't pipe the output directly into `jq`. Worth having a small helper script for test sessions, or using MCP Inspector.

[MCP Gateway for centralized agent traffic management](/en/blog/en/mcp-gateway-agent-traffic-control) covers abstracting session complexity at the gateway layer — another valid approach once you're running multiple MCP servers.

## Feasibility Assessment

Streamable HTTP transport is production-ready as of SDK v1.29.0. The Express integration works cleanly, and stateless mode deploys to serverless without issues.

My honest take: **stateful mode is fine for local development and single-instance deployments. Anything beyond that, stateless with an external session store is more realistic.**

The first mistake I'd watch out for is deploying stateful mode to a serverless environment. The session Map resets on every cold start, and the client holds an ID the server no longer recognizes. It looks like an SDK bug until you realize it's a deployment architecture mismatch.

If you're starting fresh with TypeScript MCP servers, begin with stdio. Switch to Streamable HTTP when you need team sharing or remote access. The transport swap is simpler than it looks — business logic stays untouched.
