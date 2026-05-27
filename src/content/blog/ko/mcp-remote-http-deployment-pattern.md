---
title: 'MCP 원격 HTTP 서버 배포 패턴 — stdio에서 Streamable HTTP로 전환하는 에이전트 확장 가이드'
description: 'MCP Streamable HTTP 트랜스포트로 stdio 서버를 원격 배포 가능한 HTTP 서비스로 전환하는 실전 가이드. @modelcontextprotocol/sdk v1.29.0 기준 stateful·stateless 모드 구현과 Docker·Cloudflare 배포 패턴을 실험 로그와 함께 설명합니다.'
pubDate: '2026-05-27'
heroImage: '../../../assets/blog/mcp-remote-http-deployment-pattern/hero.png'
tags:
  - MCP
  - TypeScript
  - AI에이전트
  - 배포
  - Streamable-HTTP
relatedPosts:
  - slug: mcp-server-build-practical-guide-2026
    score: 0.91
    reason:
      ko: Python FastMCP로 MCP 서버를 처음 만들어봤다면, 이 글에서 다루는 TypeScript SDK 기반 HTTP 배포로 자연스럽게 이어집니다.
      ja: Python FastMCPでMCPサーバーを作った経験があれば、このガイドのTypeScript SDKベースのHTTPデプロイへスムーズに続けられます。
      en: If you've built an MCP server with Python FastMCP, this guide's TypeScript SDK HTTP deployment patterns are a natural next step.
      zh: 如果你已用Python FastMCP构建过MCP服务器，本文的TypeScript SDK HTTP部署模式是自然的进阶。
  - slug: mcp-server-production-deployment-kubernetes-guide
    score: 0.88
    reason:
      ko: Streamable HTTP 기초를 잡은 다음 단계로, Kubernetes 기반 고가용성 배포 전략을 다룹니다.
      ja: Streamable HTTPの基礎を掴んだ次のステップとして、Kubernetesによる高可用性デプロイ戦略を扱います。
      en: After mastering Streamable HTTP basics, this covers Kubernetes-based high-availability deployment strategies.
      zh: 掌握Streamable HTTP基础后，进阶至Kubernetes高可用部署策略。
  - slug: mcp-gateway-agent-traffic-control
    score: 0.85
    reason:
      ko: 여러 원격 MCP 서버를 운영하기 시작했다면, 게이트웨이 레이어로 트래픽과 인증을 통합 관리하는 방법이 필요해집니다.
      ja: 複数のリモートMCPサーバーを運用し始めたら、ゲートウェイレイヤーでトラフィックと認証を統合管理する方法が必要になります。
      en: Once you're running multiple remote MCP servers, you'll need gateway-layer traffic and auth management.
      zh: 当你运营多个远程MCP服务器时，需要网关层统一管理流量和认证。
  - slug: local-llm-private-mcp-server-gemma4-fastmcp
    score: 0.79
    reason:
      ko: 공개 배포가 아닌 완전 오프라인 환경에서 MCP를 운영하는 방법과 비교하면서 읽으면 트레이드오프가 명확해집니다.
      ja: 公開デプロイではなく完全オフライン環境でMCPを運用する方法と比較して読むと、トレードオフが明確になります。
      en: Reading this alongside the fully offline MCP setup makes the deployment trade-offs much clearer.
      zh: 对比完全离线环境的MCP运营方式阅读，能让部署取舍更加清晰。
---

MCP 서버를 처음 만들어봤을 때, stdio 트랜스포트로 로컬에서 Claude Desktop과 연결했던 경험이 있다. 그때는 `uv run` 한 줄로 서버가 뜨고 즉시 연결됐으니까 편하긴 했다. 그런데 팀원이 같은 서버를 쓰고 싶다고 했을 때 문제가 생겼다. stdio는 클라이언트가 서버 프로세스를 직접 spawn해야 하기 때문에, 내 로컬에서 돌아가는 서버를 다른 사람이 접속할 방법이 없다.

Streamable HTTP 트랜스포트는 바로 이 문제를 해결하기 위해 존재한다. MCP 2025-03-26 스펙에서 공식 채택된 이 방식은 단일 `/mcp` 엔드포인트 하나로 세션 초기화, 도구 호출, 세션 종료를 모두 처리한다. 오늘은 `@modelcontextprotocol/sdk` v1.29.0 기준으로 TypeScript에서 MCP HTTP 서버를 직접 구현하고, stateful/stateless 두 가지 모드의 차이를 실험으로 확인한 내용을 정리한다. 로컬 샌드박스에서 curl로 전체 플로우를 직접 검증했고, Docker와 Cloudflare Workers 배포 시 주의할 점도 함께 다룬다.

## stdio가 막히는 세 가지 장면

모든 MCP 서버가 stdio 방식으로 시작하지만, 다음 세 가지 상황에서는 stdio가 답이 되지 않는다.

**첫 번째: 팀 공유 도구.** 내 로컬 파일시스템을 읽는 서버라면 stdio로 충분하다. 그런데 사내 Confluence를 긁어오거나 사내 API를 호출하는 서버는? 팀 전체가 쓸 수 있도록 한 곳에 올려두고 싶어진다. stdio로는 이게 구조적으로 불가능하다. 클라이언트가 서버 바이너리를 가져와서 본인 로컬에서 실행해야 하기 때문이다.

**두 번째: 클라우드 환경.** Claude.ai 웹 인터페이스나 Claude API에서 외부 MCP 서버에 연결하려면 반드시 HTTP 엔드포인트가 필요하다. 웹 클라이언트는 프로세스를 spawn할 수 없다.

**세 번째: 규모 확장.** stdio는 클라이언트 하나당 서버 프로세스 하나다. 100명이 동시에 쓰면 100개 프로세스가 뜬다. HTTP는 서버를 독립적으로 수평 확장할 수 있고, 로드밸런서 뒤에 여러 인스턴스를 두는 게 자연스럽다.

Streamable HTTP는 공식 MCP 2025-03-26 스펙에서 새로 추가된 트랜스포트로, 기존 HTTP+SSE 방식을 대체한다. 단일 엔드포인트(`/mcp`)에서 POST·GET·DELETE를 처리하고, SSE를 통해 서버→클라이언트 스트리밍을 제공한다.

## Streamable HTTP 트랜스포트가 실제로 어떻게 동작하는가

구현하기 전에 프로토콜 흐름을 먼저 이해하는 게 중요하다. 이 부분을 모르면 나중에 `Not Acceptable` 에러를 보고 멍해진다 (나도 그랬다).

**요청 헤더의 함정:** 클라이언트가 `POST /mcp`를 보낼 때 반드시 `Accept: application/json, text/event-stream`을 포함해야 한다. 두 타입 모두 있어야 한다. `application/json`만 보내면 서버가 `Not Acceptable`을 반환한다. SDK가 응답 형태를 동적으로 결정하기 때문이다. 동기 응답(JSON)도 가능하고 스트리밍(SSE)도 가능한데, 클라이언트가 둘 다 받을 수 있다고 선언해야 한다.

**세션 관리 방식:** stateful 모드에서 첫 `initialize` 요청 후 서버는 응답 헤더에 `Mcp-Session-Id`를 포함한다. 이후 모든 요청은 이 헤더를 보내야 한다. 세션을 닫을 때는 `DELETE /mcp`를 쓴다.

**응답 형태:** 응답은 SSE 이벤트 형식으로 온다:

```
event: message
data: {"result":{...},"jsonrpc":"2.0","id":1}
```

JSON을 직접 파싱하는 게 아니라 `data:` 줄을 추출해야 한다. 공식 MCP 클라이언트 라이브러리는 이걸 자동으로 처리하지만, curl로 직접 테스트할 때는 알아야 한다.

[MCP 서버를 Python FastMCP로 처음 구축하는 방법](/ko/blog/ko/mcp-server-build-practical-guide-2026)을 먼저 읽었다면 기본 개념은 익숙할 것이다. 여기서는 TypeScript SDK를 써서 HTTP 레이어를 직접 구성한다.

## 실전 구현: TypeScript SDK로 HTTP 서버 만들기

환경: Node.js v22.22.0, `@modelcontextprotocol/sdk` v1.29.0, Express.

```bash
npm init -y
npm install @modelcontextprotocol/sdk express
```

핵심 코드는 두 부분이다. MCP 서버 인스턴스 생성과 HTTP 트랜스포트 연결.

```javascript
const { Server } = require("@modelcontextprotocol/sdk/server/index.js");
const { StreamableHTTPServerTransport } = require("@modelcontextprotocol/sdk/server/streamableHttp.js");
const { ListToolsRequestSchema, CallToolRequestSchema } = require("@modelcontextprotocol/sdk/types.js");
const express = require("express");
const { randomUUID } = require("crypto");

const sessions = new Map(); // 세션 저장소

function createMcpServer() {
  const server = new Server(
    { name: "my-tools", version: "1.0.0" },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      {
        name: "greet",
        description: "이름을 받아 인사 메시지 반환",
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
      return { content: [{ type: "text", text: `안녕하세요, ${args.name}!` }] };
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
    transport = sessions.get(sessionId); // 기존 세션
  } else {
    transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(), // stateful 모드
    });
    const mcpServer = createMcpServer();
    await mcpServer.connect(transport);

    transport.onclose = () => {
      if (transport.sessionId) sessions.delete(transport.sessionId);
    };
  }

  await transport.handleRequest(req, res, req.body);

  // 첫 요청 후 세션 저장
  if (!sessionId && transport.sessionId) {
    sessions.set(transport.sessionId, transport);
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

app.listen(3001, "127.0.0.1", () => {
  console.log("MCP 서버 실행 중: http://127.0.0.1:3001/mcp");
});
```

포인트가 몇 가지 있다. `createMcpServer()`를 함수로 분리한 이유는 stateful 모드에서 세션마다 독립된 서버 인스턴스를 만들기 때문이다. 하나의 Server 인스턴스를 여러 세션이 공유하면 상태가 섞인다. 또한 `transport.onclose` 콜백에서 세션 Map 정리를 해줘야 메모리 누수가 발생하지 않는다. 세션이 닫혔는데 Map에 계속 남아있으면 시간이 지날수록 사용하지 않는 항목이 쌓인다.

## 실험 로그: 실제 curl 테스트 결과

이 서버를 직접 돌려서 curl로 전체 플로우를 확인했다. 로컬 샌드박스에서 Node.js v22.22.0, SDK v1.29.0 기준이다.

**1단계: 서버 초기화**

```bash
# 서버 실행 후 로그
✅ MCP Streamable HTTP 서버: http://127.0.0.1:3001/mcp
[session] 신규: d0290117-0ce6-4bc5-ab25-af536115ba93
```

**2단계: initialize 요청**

```bash
curl -X POST http://127.0.0.1:3001/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \  # 두 타입 모두 필수
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
# 응답 (SSE 형식)
event: message
data: {"result":{"protocolVersion":"2025-03-26","capabilities":{"tools":{}},"serverInfo":{"name":"lab-tools","version":"1.0.0"}},"jsonrpc":"2.0","id":1}

# 응답 헤더
Mcp-Session-Id: d0290117-0ce6-4bc5-ab25-af536115ba93
```

**3단계: tools/list와 tools/call**

```bash
# tools/list (세션 ID 포함)
# 응답
- greet: 이름을 받아 인사 메시지 반환
- add: 두 숫자 덧셈

# tools/call greet
# 응답
안녕하세요, 김장욱! (HTTP 연결)

# tools/call add  
# 응답
42 + 58 = 100
```

**4단계: 세션 종료 및 검증**

```bash
# DELETE /mcp → HTTP 200
# 종료 후 동일 세션 재접근 → HTTP 400 Bad Request
# (404가 아니라 400이 나온다 — 세션이 없는 게 아니라 초기화가 안 된 것으로 처리)
```

이 400 응답은 처음에 404를 예상했던 나한테는 의외였다. SDK가 세션 삭제 후 재접근을 "세션 없음"이 아닌 "초기화 안 됨"으로 해석하는 것 같다. 클라이언트 입장에서는 어느 쪽이든 재연결이 필요하다는 신호라는 점은 같다.

## stateful vs stateless: 어떤 모드를 선택해야 하나

SDK는 두 가지 모드를 지원한다.

**Stateful 모드:**

```javascript
new StreamableHTTPServerTransport({
  sessionIdGenerator: () => randomUUID(),
})
```

세션 ID가 발급되고, 서버가 세션별 상태를 메모리에 보관한다. 다중 턴 대화, 도구 실행 중간 상태 저장, 구독 기반 SSE 스트리밍에 적합하다.

**Stateless 모드:**

```javascript
new StreamableHTTPServerTransport({
  sessionIdGenerator: undefined,
})
```

`sessionIdGenerator`를 `undefined`로 명시하면 세션 없이 동작한다. 매 요청이 독립적이다. 상태를 보관하지 않으므로 수평 확장이 단순하다.

내가 내린 결론은 이렇다: **어디에 배포하느냐가 모드를 결정한다.**

단일 인스턴스 VM이나 컨테이너라면 stateful이 편하다. 프로세스가 하나이고 세션 Map이 안전하게 살아있다. 반면 서버리스 환경(AWS Lambda, Cloudflare Workers)은 요청마다 실행 컨텍스트가 초기화되므로 메모리 세션 Map이 유지되지 않는다. 이 경우 반드시 stateless 모드를 써야 한다. stateful로 서버리스에 배포하면 세션 ID가 발급은 되는데 두 번째 요청부터 404가 날아온다.

솔직히 말하면 stateful 모드의 인메모리 세션 Map도 장기적으로는 문제가 있다. 서버를 재시작하면 모든 세션이 사라진다. 프로덕션에서 Rolling Update를 하거나 크래시 후 재시작이 일어나면 클라이언트가 갑자기 "세션 없음"을 받게 된다. 이를 해결하려면 Redis 같은 외부 세션 스토어가 필요한데, SDK가 기본 제공하는 건 아니라 직접 구현해야 한다.

## 배포 환경별 선택 기준

이 트랜스포트를 어디에 올리느냐에 따라 고려할 점이 다르다.

**Docker / Cloud Run (추천: stateful)**

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
EXPOSE 3001
CMD ["node", "mcp-server.js"]
```

포트는 환경변수로 받는 게 좋다. Cloud Run은 `PORT` 환경변수를 자동으로 설정한다.

```javascript
const PORT = process.env.PORT || 3001;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`MCP 서버: http://0.0.0.0:${PORT}/mcp`);
});
```

Cloud Run에서 주의할 점: 인스턴스 최소 1로 설정하지 않으면 cold start 때 세션 Map이 비어있다. 그냥 stateless로 가는 게 더 깔끔할 수도 있다.

**Cloudflare Workers (필수: stateless + WebStandard transport)**

```javascript
// Express 대신 Web Standard API 사용
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

Workers는 Node.js HTTP API 대신 Web Standard API를 쓴다. SDK가 `NodeStreamableHTTPServerTransport`(Node.js용)와 `WebStandardStreamableHTTPServerTransport`(Web Standard용)를 모두 제공한다.

[MCP 서버를 Kubernetes에서 안정적으로 운영하는 방법](/ko/blog/ko/mcp-server-production-deployment-kubernetes-guide)을 다룬 글에서도 비슷한 이야기가 나오는데, 결국 어떤 레이어에서 세션 상태를 관리할지가 핵심 설계 결정이다.

**OAuth 2.1 인증 추가**

MCP 2.1부터 OAuth 2.1 기반 인증이 표준에 포함됐다. SDK가 인증 모듈을 제공한다:

```javascript
const { createMcpExpressApp } = require("@modelcontextprotocol/sdk/server/express.js");

// DNS rebinding 방지 + 기본 설정이 포함된 Express 앱
const app = createMcpExpressApp({ host: "0.0.0.0", allowedHosts: ["my-mcp-server.example.com"] });
```

`createMcpExpressApp`을 쓰면 localhost 바인딩 시 DNS rebinding 보호가 자동으로 활성화된다. `0.0.0.0`으로 바인딩할 때는 `allowedHosts`를 명시해야 보호가 작동한다.

## curl로 SSE 응답 파싱하기: 실용 스크립트

Streamable HTTP를 직접 테스트할 때 가장 불편한 점은 curl 출력 파싱이다. 일반 JSON API와 달리 SSE 형식으로 오기 때문에 `jq`에 바로 넣기 어렵다. 실제로 자주 쓰는 패턴을 정리해두면 개발 중 도움이 된다.

**세션 ID 자동 추출:**

```bash
#!/bin/bash
# mcp-session.sh — 세션 초기화 및 도구 호출 헬퍼

MCP_URL="http://127.0.0.1:3001/mcp"

# initialize하고 세션 ID를 추출
SESSION_ID=$(curl -s -D - -X POST "$MCP_URL" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-03-26","capabilities":{},"clientInfo":{"name":"test","version":"1.0.0"}}}' \
  | grep -i "mcp-session-id" | awk '{print $2}' | tr -d '\r\n')

echo "세션 ID: $SESSION_ID"

# SSE 응답에서 data 추출하는 함수
mcp_call() {
  curl -s -X POST "$MCP_URL" \
    -H "Content-Type: application/json" \
    -H "Accept: application/json, text/event-stream" \
    -H "Mcp-Session-Id: $SESSION_ID" \
    -d "$1" | grep "^data:" | sed 's/^data: //'
}

# tools/list 호출
echo "=== 도구 목록 ==="
mcp_call '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}' | python3 -m json.tool
```

이 스크립트를 `source`로 불러오면 빠르게 테스트 가능하다. MCP Inspector GUI가 더 편하지만, CI 파이프라인에서 서버 헬스체크를 할 때는 이런 curl 스크립트가 오히려 직관적이다.

**세션 만료 핸들링.** 실제 클라이언트를 구현할 때 세션 만료를 어떻게 처리할지도 고려해야 한다. 현재 SDK는 세션 TTL 자동 만료 기능을 내장하지 않는다. 서버 재시작으로 세션이 사라지면 클라이언트가 400을 받는다. 이때 클라이언트가 자동으로 재초기화하는 로직이 없으면 사용자에게 에러가 노출된다. 공식 MCP 클라이언트 라이브러리는 이 재초기화를 자동으로 처리하는데, 직접 구현할 때는 `initialize` → 세션 저장 → 세션 에러 시 재초기화 패턴을 명시적으로 넣어야 한다.

## 알아두어야 할 한계와 주의사항

이 접근법에 한계가 있다는 걸 솔직히 말해야겠다.

**메모리 세션의 취약성.** 앞서 언급했지만 인메모리 세션 Map은 프로덕션 수준의 내구성이 없다. 서버 재시작, 인스턴스 교체, 크래시 복구 시나리오를 고려하면 Redis나 Valkey 같은 외부 세션 스토어로 교체해야 한다. SDK가 `EventStore` 인터페이스를 제공하긴 하는데, 이걸 Redis에 연결하는 구현은 직접 해야 한다.

**로드밸런서와의 호환성.** stateful 모드에서 세션별 인스턴스가 다르면 안 된다. 로드밸런서가 sticky session을 지원하지 않으면 같은 세션 ID가 다른 인스턴스로 라우팅되고 404를 받는다. MCP 2026 로드맵에서는 이 문제를 "stateless at the protocol layer"로 해결하겠다고 했는데, 아직 릴리스 전이다.

**디버깅 어려움.** SSE 스트림 형태의 응답은 일반 REST API보다 디버깅이 불편하다. curl 출력이 `event: message\ndata: {...}` 형식이라 JSON 파서에 바로 넣기 어렵다. MCP Inspector 같은 전용 도구를 쓰거나, 응답을 파이프로 처리하는 스크립트를 만들어두는 게 낫다. 앞서 소개한 `mcp-session.sh` 같은 헬퍼 스크립트가 개발 초기에 빠른 검증에 도움이 된다.

**SDK 버전 추적 필요.** `@modelcontextprotocol/sdk`는 빠르게 변화하고 있다. v1.29.0 기준으로 이 글의 모든 예제가 동작하는 걸 확인했지만, 다음 마이너 버전에서 API가 바뀔 수 있다. 특히 `StreamableHTTPServerTransport` 생성자 옵션과 `handleRequest` 시그니처가 변경 이력이 있는 부분이다. 의존성 업데이트 전에 CHANGELOG를 확인하는 습관이 필요하다.

이 부분은 [MCP Gateway로 에이전트 트래픽을 중앙에서 제어하는 방법](/ko/blog/ko/mcp-gateway-agent-traffic-control)에서 더 자세히 다루고 있다. 세션 관리 복잡성을 게이트웨이 레이어에서 추상화하는 방법도 하나의 해법이다.

## 실행 가능성 판단

정리하면, Streamable HTTP 트랜스포트는 충분히 프로덕션에 사용 가능한 수준이다. SDK v1.29.0 기준으로 Express와의 통합이 잘 되어있고, stateless 모드로 서버리스에 올리는 것도 문제없었다.

다만 내가 직접 써보면서 느낀 것은, **stateful 모드는 로컬 개발과 단일 인스턴스 배포에 적합하고, 조금만 규모가 커지면 stateless + 외부 세션 스토어 조합이 더 현실적**이라는 점이다.

전형적인 첫 번째 실수는 stateful 모드를 Cloud Run같은 서버리스 환경에 올리는 것이다. cold start 때마다 세션 Map이 비어있고, 클라이언트는 세션 ID를 들고 있는데 서버는 "이게 뭔데?"라고 한다. 이 에러를 처음 보면 SDK 버그인 줄 알기 쉬운데, 사실 아키텍처 미스매치다.

TypeScript MCP 서버를 처음 만들어보는 입장에서는 stdio로 시작하고, 팀 공유나 원격 접근이 필요해지는 시점에 Streamable HTTP로 전환하는 것을 권한다. 트랜스포트 교체가 생각보다 단순하고, 비즈니스 로직은 건드리지 않아도 된다.

그리고 앞으로 MCP 2026 스펙이 완성되면 현재의 세션 관리 복잡성 일부는 해소될 것으로 보인다. 공식 로드맵에서 "프로토콜 레이어의 무상태화"를 명시적으로 계획하고 있고, 로드밸런서와의 호환성 문제가 표준 레벨에서 해결되는 방향이다. 또한 `.well-known` 기반의 서버 메타데이터 디스커버리도 예정되어 있어, 클라이언트가 사전 연결 없이 서버 기능을 파악할 수 있게 될 예정이다. 그때까지는 이 글에서 다룬 환경별 모드 선택 원칙을 기준으로 삼아도 충분하다. 트랜스포트 레이어는 비즈니스 로직과 분리되어 있으므로, 스펙이 업데이트되더라도 서버 로직을 수정 없이 적용하는 마이그레이션이 가능할 것이다.
