---
title: 'TypeScript MCP 클라이언트 만들기 — @modelcontextprotocol/sdk v1.29'
description: >-
  @modelcontextprotocol/sdk v1.29.0을 직접 설치해 TypeScript MCP 클라이언트를 만들어봤다.
  Claude Desktop 없이 MCP 서버의 tool을 프로그래밍으로 호출하고 resource를 읽는 실전 가이드.
  실제 실행 로그와 에러 처리 패턴 포함.
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
  - question: "MCP 클라이언트와 MCP 서버는 무엇이 다른가?"
    answer: "MCP 서버는 tool과 resource를 외부에 노출하는 쪽이고, 클라이언트는 그 서버에 연결해 tool을 호출하고 resource를 읽는 쪽이다. Claude Desktop이나 Cursor가 바로 클라이언트(정확히는 호스트) 역할을 한다. 이 글에서는 `@modelcontextprotocol/sdk`의 `Client` 클래스로 그 클라이언트를 직접 구현했다."
  - question: "TypeScript SDK는 어떤 transport를 지원하나?"
    answer: "stdio와 HTTP 계열(SSE, Streamable HTTP) 두 종류를 지원한다. 이 글에서는 `StdioClientTransport`로 서버 프로세스를 직접 스폰하는 stdio 방식만 다뤘다. 원격 서버에 붙으려면 `StreamableHTTPClientTransport`나 `SSEClientTransport`를 쓰며, 설정 방식이 조금 달라진다."
  - question: "클라이언트에서 tool을 호출하거나 resource를 읽으려면?"
    answer: "연결 후 `client.listTools()`로 도구 목록을 받고, `client.callTool({ name, arguments })`로 실행한다. resource는 `client.listResources()`로 나열하고 `client.readResource({ uri })`로 읽는다. 반환값의 `content` 배열은 항목마다 `type` 필드가 달라 `text` 외에 `image`, `resource`도 올 수 있으니 타입을 먼저 확인해야 한다."
  - question: "에러는 어떻게 처리하나? exception이 발생하나?"
    answer: "도구 실행 에러는 exception으로 던져지지 않고 응답 객체의 `isError: true` 필드로 돌아온다. `try/catch` 대신 `result.isError`를 확인하는 패턴이 맞다. 이는 MCP 스펙에서 의도된 설계로, 도구 실행 에러와 프로토콜 에러를 구분하기 위함이다."
---

Claude Desktop나 Cursor가 MCP 서버에 연결할 때 내부적으로 무슨 일이 벌어지는지 궁금했다. 그냥 "stdio로 연결한다"는 말은 들었는데, 코드 레벨에서 실제로 어떻게 구현되는지는 직접 짜봐야 이해가 된다. 그래서 오늘은 `@modelcontextprotocol/sdk`를 설치해서 TypeScript MCP 클라이언트를 처음부터 만들어봤다.

결론부터 말하면, 생각보다 훨씬 쉬웠다. 그리고 한 가지 예상 못 한 동작이 있었는데, 에러 처리 방식이 내가 알던 것과 달랐다.

## Claude Desktop이 하는 일을 직접 해보자는 발상

MCP(Model Context Protocol)는 AI 에이전트가 외부 도구와 데이터에 접근하는 표준 방식이다. 지금까지 MCP 관련 글에서 서버 만들기를 많이 다뤘다. [TypeScript로 MCP 서버를 만드는 방법](/ko/blog/ko/mcp-server-typescript-sdk-step-by-step-2026)도 썼고, [Python FastMCP로 30분 만에 서버 올리기](/ko/blog/ko/fastmcp-python-mcp-server-build-guide-2026)도 해봤다. 그런데 클라이언트 측을 직접 구현하는 글은 써본 적이 없었다.

프로덕션 사용 사례를 생각해보면 커스텀 MCP 클라이언트가 필요한 순간이 분명히 있다.

- CI/CD 파이프라인에서 MCP 서버의 도구를 자동으로 호출해야 할 때
- 자체 에이전트 레이어를 개발하면서 MCP 서버와 직접 연동할 때
- 기존 Python/TypeScript 코드에서 MCP 서버의 기능을 라이브러리처럼 쓰고 싶을 때

Claude Desktop이나 Claude Code가 없어도 된다. `@modelcontextprotocol/sdk`에는 클라이언트 구현에 필요한 모든 것이 들어 있다.

## SDK 설치와 핵심 클래스 두 개

```bash
npm install @modelcontextprotocol/sdk zod
```

설치되는 버전은 오늘 기준 `1.29.0`이다. SDK 안에 서버와 클라이언트 구현이 모두 들어 있다.

MCP 클라이언트를 만드는 데 핵심이 되는 클래스는 딱 두 개다.

**`Client`** — 서버와의 논리적 연결을 관리한다. `listTools()`, `callTool()`, `listResources()`, `readResource()` 같은 메서드를 제공한다.

**`StdioClientTransport`** — stdio 기반 MCP 서버와 통신하는 전송 레이어다. `command`와 `args`로 서버 프로세스를 직접 스폰한다.

SSE 또는 Streamable HTTP 서버에 연결할 때는 다른 Transport 클래스를 쓴다. 오늘은 stdio만 다룬다.

## 실습 환경 구성 — 서버와 클라이언트 모두 직접 만든다

데모를 위해 간단한 MCP 서버를 하나 만들었다. 기능은 두 가지: 사칙연산을 수행하는 `calculate` 도구와 텍스트를 변환하는 `transform_text` 도구다.

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

서버를 따로 실행할 필요가 없다. 클라이언트가 `StdioClientTransport`를 통해 서버 프로세스를 자동으로 스폰하기 때문이다.

## 클라이언트 구현 — listTools, callTool, listResources 순서로

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

`client.connect(transport)`를 호출하는 순간 `node server.mjs` 프로세스가 스폰된다. 이후 클라이언트와 서버는 stdin/stdout 파이프를 통해 JSON-RPC 2.0 메시지를 주고받는다.

연결이 완료되면 세 가지 작업을 순서대로 실행했다.

**1. 도구 목록 조회**

```javascript
const { tools } = await client.listTools();
for (const t of tools) {
  const params = Object.keys(t.inputSchema?.properties ?? {}).join(", ");
  console.log(`  • ${t.name}(${params}) — ${t.description}`);
}
```

**2. 도구 호출**

```javascript
const result = await client.callTool({
  name: "calculate",
  arguments: { operation: "multiply", a: 42, b: 7 },
});
console.log(result.content[0].text);
```

**3. 리소스 조회 및 읽기**

```javascript
const { resources } = await client.listResources();
const info = await client.readResource({ uri: "mcp://demo/info" });
console.log(info.contents[0].text);
```

실제로 실행한 결과다.

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

서버를 별도 터미널에서 실행하지 않았다. 클라이언트가 `node server.mjs`를 직접 스폰했고, 통신이 끝난 후 `client.close()`로 프로세스를 함께 종료했다.

## 에러는 exception이 아니라 isError 필드로 돌아온다

MCP 에러 처리 방식이 내가 처음 예상했던 것과 달랐다. 없는 도구를 호출해보니 exception이 발생하지 않았다.

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

`try/catch`로 감쌀 필요가 없다. 대신 응답 객체의 `isError` 필드를 확인해야 한다.

```javascript
async function callToolSafe(client, name, args) {
  const result = await client.callTool({ name, arguments: args });
  if (result.isError) {
    throw new Error(result.content[0]?.text ?? "Unknown MCP error");
  }
  return result.content[0]?.text;
}
```

이 동작은 MCP 스펙에서 의도된 설계다. 도구 실행 에러와 프로토콜 에러를 구분하기 위해 에러를 콘텐츠로 반환한다. 클라이언트 측에서는 이 패턴을 인식하고 처리해야 한다.

실제로 이 점이 Claude 에이전트가 도구 실행 실패를 "텍스트 메시지"로 받아서 이어서 추론하는 방식과 일치한다. 에이전트가 tool call 결과를 다시 LLM에 넘길 때 오류 내용도 컨텍스트로 포함되기 때문이다. 그리고 그 결과를 어떤 포맷으로 직렬화해 넘기느냐가 곧 입력 토큰 비용이 된다. [같은 데이터도 포맷에 따라 토큰이 62%까지 차이 나기](/ko/blog/ko/llm-token-cost-data-format-experiment) 때문에, 평탄한 결과는 JSON보다 CSV·TSV로 돌려주는 작은 결정이 에이전트 전체 비용을 바꾼다.

## Promise.all로 병렬 호출 — 4개 동시 실행이 1ms

단일 호출뿐 아니라 병렬 호출도 실험해봤다.

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
console.log(`${ops.length}개 병렬 호출 완료: ${Date.now() - start}ms`);
```

실행 결과:

```
Parallel calls (4 ops) in 1ms:
  1 add 1 = 2
  12 multiply 12 = 144
  100 subtract 37 = 63
  144 divide 12 = 12
```

stdio 트랜스포트라도 MCP SDK 내부에서 request multiplexing을 처리한다. 4개 호출을 동시에 날려도 응답을 올바르게 매핑한다. 다만 stdio 기반이라 실제 처리는 서버 측에서 순서대로 일어날 수 있다. 서버 측 처리 비용이 높은 도구라면 병렬 호출의 이점이 제한적일 수 있다.

## 커스텀 MCP 클라이언트가 실제로 유용한 세 가지 상황

직접 구현해보고 나서 이게 어디에 쓸만한지 좀 더 구체적으로 그려졌다.

**자동화 스크립트에서 MCP 도구 호출**

MCP 서버에 코드 린팅, 파일 변환, 외부 API 조회 같은 도구가 있을 때, 이를 GitHub Actions나 로컬 스크립트에서 자동으로 호출하고 싶을 수 있다. `node client.mjs`처럼 간단한 Node.js 스크립트로 해결된다.

**자체 에이전트 프레임워크 개발**

LangGraph나 LlamaIndex 같은 프레임워크 없이 직접 에이전트를 짜는 경우, MCP 서버가 제공하는 도구를 에이전트 루프 안에 통합할 수 있다. `listTools()`로 도구 목록을 가져와 LLM 프롬프트에 주입하고, LLM의 응답에서 도구 호출 파라미터를 파싱해 `callTool()`로 실행하는 패턴이다. [Claude Agent SDK로 AI 에이전트에 tool을 붙이는 완전 가이드](/ko/blog/ko/claude-agent-sdk-tool-use-complete-guide-2026)에서 이 패턴을 더 체계적으로 확인할 수 있다.

**테스트 및 디버깅**

MCP 서버를 개발할 때 Claude Desktop 없이 서버의 도구 동작을 빠르게 검증하는 용도로도 쓸 수 있다. `listTools()` 결과로 inputSchema를 확인하고, 다양한 파라미터로 `callTool()`을 호출해보는 식이다.

## 한계와 솔직한 평가

이 정도로 쉽게 동작한다는 게 좋았지만, 몇 가지 아쉬운 점도 있었다.

**타입스크립트 타입이 얇다.** `callTool()`의 반환 타입이 `{ content: Content[], isError?: boolean }` 수준으로 generic하다. 실제 content 타입(text, image, resource 등)을 좁히려면 직접 타입 가드를 써야 한다. 런타임에서 `content[0].type === "text"`를 확인해야 안전하게 `.text`에 접근할 수 있다.

**SSE/HTTP Transport는 별도 패키지가 필요하다.** stdio만 쓴다면 이 글의 예제로 충분하다. 하지만 원격 MCP 서버(HTTP/SSE)에 연결하려면 `StreamableHTTPClientTransport`나 `SSEClientTransport`를 써야 하는데, 설정이 다소 달라진다.

**연결 유지 비용을 고려해야 한다.** `StdioClientTransport`는 호출 때마다 새 프로세스를 스폰하지 않는다. 연결이 유지되는 동안 서버 프로세스가 살아 있다. 단발성 스크립트라면 `client.close()`를 꼭 호출해야 프로세스가 제대로 종료된다.

**zod v4 스키마 경고.** `@modelcontextprotocol/sdk`가 내부적으로 `zod`를 사용하는데, zod v4와의 호환성 경고가 뜰 수 있다. 위 예제에서는 zod v4.4.3과 SDK 1.29.0을 조합했고 문제없이 동작했다.

## 나는 이게 생각보다 낮게 평가받고 있다고 본다

MCP 생태계에서 서버 구현에 대한 글은 많다. 하지만 커스텀 클라이언트 구현, 즉 Claude Desktop이나 Cursor가 하는 일을 직접 하는 방법에 대한 글은 거의 없다.

이 기술이 실제로 유용한 상황이 분명히 있다. AI 에이전트 파이프라인을 직접 구축하는 개발자, 기존 코드베이스에 MCP를 통합하려는 팀, MCP 서버 동작을 테스트하려는 사람 모두에게 해당된다. `@modelcontextprotocol/sdk`의 Client 클래스는 충분히 안정적이고 API도 간결하다.

단 70줄의 TypeScript로 MCP 서버에 연결하고, 도구를 나열하고, 호출하고, 리소스를 읽고, 깨끗하게 종료할 수 있다. 이게 처음부터 공식 문서에 예제로 있었으면 좋았을 텐데 없어서 직접 만들어봤다.

다음으로는 실제 MCP 서버(파일시스템 서버나 GitHub MCP 서버)에 이 클라이언트를 붙여서 자동화 스크립트를 만들어볼 생각이다.

## 실전 패턴 — 간단한 에이전트 루프 만들기

MCP 클라이언트를 실제로 응용하는 가장 자연스러운 형태는 "에이전트 루프"다. LLM에게 사용 가능한 도구 목록을 주고, LLM이 어떤 도구를 쓸지 결정하면 클라이언트가 실제로 실행해주는 구조다.

아래는 Claude API 없이도 흐름을 이해할 수 있는 단순화된 예시다. 실제로는 이 부분에 LLM 호출이 들어간다.

```javascript
// agent-loop.mjs (개념 예시)
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

async function runAgentLoop(userRequest) {
  const transport = new StdioClientTransport({
    command: "node",
    args: ["server.mjs"],
    cwd: process.cwd(),
  });
  const client = new Client({ name: "agent", version: "1.0.0" }, { capabilities: {} });
  await client.connect(transport);

  // 1단계: 사용 가능한 도구 목록 조회
  const { tools } = await client.listTools();
  
  // 2단계: LLM에게 도구 목록과 사용자 요청을 전달 (여기선 하드코딩)
  // 실제로는: const llmResponse = await callLLM(userRequest, tools);
  const llmDecision = {
    tool: "calculate",
    arguments: { operation: "multiply", a: 7, b: 6 },
  };

  // 3단계: LLM이 선택한 도구를 실행
  const result = await client.callTool({
    name: llmDecision.tool,
    arguments: llmDecision.arguments,
  });

  // 4단계: 결과를 다시 LLM에 전달해 최종 응답 생성
  const toolOutput = result.isError
    ? `오류: ${result.content[0]?.text}`
    : result.content[0]?.text;

  console.log(`사용자 요청: ${userRequest}`);
  console.log(`실행 도구: ${llmDecision.tool}`);
  console.log(`도구 결과: ${toolOutput}`);

  await client.close();
}

await runAgentLoop("7 곱하기 6은?");
```

이 패턴에서 클라이언트는 단순히 "도구 실행 레이어" 역할을 한다. LLM이 결정하고 클라이언트가 실행한다. 이것이 Claude Desktop이나 Claude Code가 내부적으로 하는 일과 구조적으로 동일하다.

## 기존 MCP 서버에 연결하기

지금까지는 내가 만든 서버에 연결했다. 실제로는 `@modelcontextprotocol/server-filesystem` 같은 공개된 MCP 서버 패키지를 바로 활용할 수 있다.

```bash
npm install @modelcontextprotocol/server-filesystem
```

그리고 클라이언트의 transport 설정만 바꾸면 된다.

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

이렇게 하면 파일시스템 MCP 서버의 `read_file`, `write_file`, `list_directory` 같은 도구를 `callTool()`로 직접 호출할 수 있다. Claude Desktop의 설정 파일에 있는 `command`/`args`를 그대로 `StdioClientTransport`에 넣으면 된다.

여러 서버에 동시에 연결하고 싶다면 각 서버마다 별도의 `Client` 인스턴스를 만들면 된다. 클라이언트와 서버 사이는 1:1 관계다.

## Content 타입 안전하게 처리하기

`callTool()`과 `readResource()`의 반환 타입에서 한 가지 주의할 점이 있다. `content` 배열의 각 항목은 `type` 필드에 따라 구조가 달라진다.

```typescript
for (const item of result.content) {
  if (item.type === "text") {
    // item.text 접근 가능
    console.log(item.text);
  } else if (item.type === "image") {
    // item.data (base64), item.mimeType 접근 가능
    console.log(`Image: ${item.mimeType}`);
  } else if (item.type === "resource") {
    // item.resource.uri, item.resource.text 등 접근 가능
    console.log(`Resource: ${item.resource.uri}`);
  }
}
```

이미지나 임베딩된 리소스를 반환하는 도구도 있다. `text` 타입만 있다고 가정하면 런타임에 `undefined`를 만나게 된다. 특히 외부 MCP 서버를 붙일 때는 `type` 필드를 항상 먼저 확인하는 습관을 들이는 게 좋다.

SDK의 타입 정의 파일(`.d.ts`)을 직접 열어보면 `TextContent`, `ImageContent`, `EmbeddedResource` 타입이 분리되어 있다. TypeScript를 쓴다면 이 타입을 import해서 타입 좁히기(type narrowing)를 명시적으로 작성하는 게 낫다.

## 참고자료

- [Model Context Protocol 공식 사이트](https://modelcontextprotocol.io) — MCP의 개념, 아키텍처, 클라이언트/서버 빌드 가이드를 모아둔 공식 문서 사이트.
- [MCP 클라이언트 빌드 가이드](https://modelcontextprotocol.io/docs/develop/build-client) — 공식 문서 중 클라이언트 구현을 다루는 튜토리얼. 이 글의 TypeScript 예제와 비교해보면 좋다.
- [@modelcontextprotocol/typescript-sdk (GitHub)](https://github.com/modelcontextprotocol/typescript-sdk) — 이 글에서 사용한 SDK의 공식 저장소. `Client`, `StdioClientTransport` 등의 구현과 이슈를 확인할 수 있다.
- [@modelcontextprotocol/sdk (npm)](https://www.npmjs.com/package/@modelcontextprotocol/sdk) — 실제로 설치하는 npm 패키지. 버전 히스토리와 의존성(zod peer dependency)을 확인할 수 있다.
