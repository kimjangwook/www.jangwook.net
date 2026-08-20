const { Server } = require("@modelcontextprotocol/sdk/server/index.js");
const { StreamableHTTPServerTransport } = require("@modelcontextprotocol/sdk/server/streamableHttp.js");
const { ListToolsRequestSchema, CallToolRequestSchema } = require("@modelcontextprotocol/sdk/types.js");
const express = require("express");
const { randomUUID } = require("crypto");

const PORT = 3001;
const sessions = new Map();

function createMcpServer() {
  const server = new Server(
    { name: "lab-tools", version: "1.0.0" },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      {
        name: "greet",
        description: "사람 이름을 받아 인사 메시지 반환",
        inputSchema: {
          type: "object",
          properties: { name: { type: "string" } },
          required: ["name"],
        },
      },
      {
        name: "add",
        description: "두 숫자 덧셈",
        inputSchema: {
          type: "object",
          properties: { a: { type: "number" }, b: { type: "number" } },
          required: ["a", "b"],
        },
      },
    ],
  }));

  server.setRequestHandler(CallToolRequestSchema, async (req) => {
    const { name, arguments: args } = req.params;
    if (name === "greet") {
      return { content: [{ type: "text", text: `안녕하세요, ${args.name}! (HTTP 연결)` }] };
    }
    if (name === "add") {
      return { content: [{ type: "text", text: `${args.a} + ${args.b} = ${args.a + args.b}` }] };
    }
    throw new Error(`알 수 없는 도구: ${name}`);
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
    console.log(`[session] 신규: ${transport.sessionId}`);
  }
});

app.get("/mcp", async (req, res) => {
  const sessionId = req.headers["mcp-session-id"];
  const transport = sessions.get(sessionId);
  if (!transport) { res.status(404).json({ error: "세션 없음" }); return; }
  await transport.handleRequest(req, res);
});

app.delete("/mcp", async (req, res) => {
  const sessionId = req.headers["mcp-session-id"];
  const transport = sessions.get(sessionId);
  if (!transport) { res.status(404).json({ error: "세션 없음" }); return; }
  await transport.handleRequest(req, res);
});

app.listen(PORT, "127.0.0.1", () => {
  console.log(`✅ MCP Streamable HTTP 서버: http://127.0.0.1:${PORT}/mcp`);
});
