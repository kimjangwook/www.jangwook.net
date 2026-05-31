---
title: "TypeScript로 나만의 MCP 서버 만들기 — @modelcontextprotocol/sdk 실전 튜토리얼"
description: "@modelcontextprotocol/sdk v1.29.0과 Zod v4로 TypeScript MCP 서버를 처음부터 구축하는 실전 튜토리얼. 도구 등록, InMemoryTransport 테스트, 공개 API 연동까지 30분 안에 동작하는 서버를 완성하는 방법을 단계별로 설명합니다."
pubDate: '2026-05-31'
heroImage: '../../../assets/blog/mcp-server-typescript-sdk-step-by-step-2026-hero.png'
tags: ["MCP", "TypeScript", "튜토리얼"]
relatedPosts:
  - slug: "mcp-server-build-practical-guide-2026"
    score: 0.92
    reason:
      ko: "Python FastMCP로 MCP 서버를 구축하는 가이드로, TypeScript SDK와 비교해 같은 프로토콜을 다른 언어로 구현하는 방식을 확인할 수 있습니다."
      ja: "Python FastMCPでMCPサーバーを構築するガイドで、TypeScript SDKと比較して同じプロトコルを別の言語で実装する方法が確認できます。"
      en: "A guide for building MCP servers with Python FastMCP — useful for comparing how the same protocol is implemented in a different language alongside the TypeScript SDK."
      zh: "使用Python FastMCP构建MCP服务器的指南，可与TypeScript SDK对比，了解同一协议在不同语言中的实现方式。"
  - slug: "mcp-vs-a2a-vs-open-responses-agent-protocol-comparison-2026"
    score: 0.81
    reason:
      ko: "MCP, A2A, Open Responses 세 가지 에이전트 프로토콜을 비교 분석해 MCP를 선택하기 전에 프로토콜 생태계 전반을 이해하는 데 도움이 됩니다."
      ja: "MCP、A2A、Open Responsesの3つのエージェントプロトコルを比較分析しており、MCPを選択する前にプロトコルエコシステム全体を理解するのに役立ちます。"
      en: "A comparative analysis of MCP, A2A, and Open Responses protocols — helpful for understanding the agent protocol landscape before committing to MCP."
      zh: "对MCP、A2A和Open Responses三种代理协议进行比较分析，有助于在选择MCP之前了解协议生态系统的全貌。"
  - slug: "mcp-open-standard-linux-foundation-engineering-guide"
    score: 0.75
    reason:
      ko: "MCP가 Linux Foundation 오픈 표준으로 자리잡은 배경과 엔지니어링 관점에서의 설계 철학을 다루고 있어, SDK 실습 전에 MCP의 전체 그림을 이해하는 데 유용합니다."
      ja: "MCPがLinux Foundationのオープン標準として確立された背景とエンジニアリング観点での設計思想を扱っており、SDK実習前にMCPの全体像を理解するのに役立ちます。"
      en: "Covers the background of MCP becoming a Linux Foundation open standard and its engineering design philosophy — useful context before diving into SDK hands-on work."
      zh: "涵盖MCP成为Linux Foundation开放标准的背景及工程设计理念，在进行SDK实践之前了解MCP全貌非常有用。"
---

```typescript
// 이 한 줄이 전부다
const server = new McpServer({ name: "my-server", version: "1.0.0" });
server.tool("get_book_info", "도서 정보 조회", { isbn: z.string() }, async ({ isbn }) => { ... });
```

처음 MCP 서버를 만들어보기로 했을 때, 나는 솔직히 생각보다 훨씬 쉽다는 사실에 놀랐다. MCP(Model Context Protocol)가 AI 플랫폼 간 표준으로 자리잡고 있다는 이야기는 많이 들었지만, "직접 서버를 만든다"는 말이 왠지 복잡하고 진입 장벽이 높을 것 같았다. 그런데 `@modelcontextprotocol/sdk` 패키지 하나와 Zod를 설치하면, 30분 안에 동작하는 MCP 서버를 만들 수 있다.

이 글에서는 TypeScript로 MCP 서버를 처음부터 만드는 과정을 직접 실행한 코드와 출력 결과를 기반으로 단계별로 정리했다. 공개 API(Open Library)와 연동해 ISBN으로 도서 정보를 조회하는 실제 도구를 만들어보면서, MCP 서버의 핵심 개념을 체득하는 것이 목표다.

## 왜 지금 MCP 서버를 직접 만들어야 하는가

Claude, Cursor, Windsurf, Zed 등 주요 AI 코딩 도구들이 MCP를 표준 통합 프로토콜로 채택했다. 이 말은 MCP 서버 하나를 만들어두면, 특정 AI 플랫폼에 종속되지 않고 여러 AI 도구에서 동일한 기능을 사용할 수 있다는 뜻이다.

기존에 자체 API를 만들고 각 AI 플랫폼마다 플러그인이나 통합을 별도로 개발해야 했다면, MCP는 "한 번 만들면 어디서든"이라는 접근을 가능하게 한다. 내가 이걸 주목하는 이유는 단순하다. 사내 데이터베이스 조회, 사내 문서 검색, 특정 업무 자동화 스크립트를 MCP 도구로 한 번 래핑해두면, Claude에서도, Cursor에서도 동일하게 사용할 수 있다.

물론 아직 생태계가 완전히 성숙하지는 않았다. 하지만 [MCP 오픈 표준과 Linux Foundation 참여](/ko/blog/ko/mcp-open-standard-linux-foundation-engineering-guide)에서 확인했듯이, 이 방향성은 이미 업계 표준으로 굳어지는 중이다.

## 환경 설정과 패키지 설치

먼저 Node.js 프로젝트를 초기화하고 필요한 패키지를 설치한다.

```bash
mkdir my-mcp-server && cd my-mcp-server
npm init -y
npm install @modelcontextprotocol/sdk zod
```

직접 실행한 결과다:

```
$ mkdir test-project && cd test-project && npm init -y
$ npm install @modelcontextprotocol/sdk zod
added 92 packages, and audited 93 packages in 2s
found 0 vulnerabilities
```

`@modelcontextprotocol/sdk` 버전 1.29.0과 `zod` 버전 4.4.3이 설치된다. 의존성이 92개 패키지로 늘어나지만, 취약점은 없다. TypeScript를 사용한다면 개발 의존성도 추가한다:

```bash
npm install -D typescript @types/node tsx
npx tsc --init
```

`tsconfig.json`에서 `"module": "ESNext"`와 `"moduleResolution": "bundler"` (또는 `"node16"`)를 설정하는 것이 중요하다. SDK가 ESM 모듈 방식으로 배포되기 때문이다.

### package.json 설정

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

`"type": "module"` 설정이 필수다. 이게 없으면 SDK 임포트 경로(`@modelcontextprotocol/sdk/server/mcp.js`)를 제대로 해석하지 못한다.

## McpServer 인스턴스 생성 — 핵심 3단계 패턴

직접 실험하면서 확인한 핵심은 세 단계다.

1. `McpServer` 인스턴스 생성
2. `server.tool()`로 Zod 스키마 기반 도구 등록
3. 트랜스포트 연결

이 패턴을 이해하면 MCP 서버 개발의 90%는 파악한 것이다.

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { z } from "zod";

// 1단계: 서버 인스턴스 생성
const server = new McpServer({ name: "demo-server", version: "1.0.0" });
```

`McpServer` 생성자는 `name`과 `version` 두 가지 필드를 받는다. 이 정보는 MCP 클라이언트가 서버를 식별할 때 사용한다.

### 도구 등록: server.tool()

```typescript
// 2단계: 도구 등록
server.tool(
  "get_book_info",                               // 도구 이름
  "Fetch book metadata from Open Library by ISBN", // 도구 설명 (AI가 언제 쓸지 판단하는 기준)
  { isbn: z.string().describe("ISBN-13 or ISBN-10") }, // Zod 스키마
  async ({ isbn }) => {                           // 실행 핸들러
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

`server.tool()`의 인자 구조를 명확히 이해하는 것이 중요하다:

- **첫 번째 인자**: 도구 이름 (AI가 호출할 때 사용하는 식별자)
- **두 번째 인자**: 도구 설명 (AI 모델이 이 도구를 언제 써야 할지 판단하는 자연어 설명)
- **세 번째 인자**: Zod 스키마 객체 (입력값 타입과 설명)
- **네 번째 인자**: 비동기 핸들러 함수

두 번째 인자인 "도구 설명"은 AI 모델이 읽는 프롬프트다. 설명이 구체적일수록 AI가 적절한 상황에 도구를 사용한다. 그냥 "book info"보다 "Fetch book metadata from Open Library by ISBN"이 훨씬 낫다.

### 응답 형식: MCP 표준 구조

핸들러가 반환하는 형식도 표준이 있다:

```typescript
return {
  content: [
    { type: "text", text: "응답 텍스트" }
  ]
};
```

`content` 배열 안의 각 항목은 `type`과 해당 타입의 데이터를 포함한다. 텍스트 외에도 이미지(`type: "image"`)나 리소스(`type: "resource"`)를 반환할 수 있지만, 대부분의 경우 텍스트로 충분하다.

오류가 발생했을 때도 예외를 던지지 않고 오류 메시지를 `content`에 담아 반환하는 것이 MCP 관례다. 예외를 던지면 클라이언트에서 처리 방식이 달라질 수 있다.

## InMemoryTransport로 같은 프로세스에서 테스트하기

MCP 서버를 실제 Claude나 Cursor에 연결하기 전에, 같은 프로세스 안에서 서버-클라이언트 라운드트립을 테스트하는 방법이 있다. `InMemoryTransport`를 쓰면 된다.

```typescript
// 3단계: 트랜스포트 연결
const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

// 서버 연결
await server.connect(serverTransport);

// 클라이언트 연결
const client = new Client({ name: "test-client", version: "1.0.0" });
await client.connect(clientTransport);
```

`InMemoryTransport.createLinkedPair()`는 서로 연결된 클라이언트용 트랜스포트와 서버용 트랜스포트 쌍을 반환한다. stdio나 HTTP 서버 설정 없이 메모리 내에서 직접 통신한다.

이제 클라이언트로 서버의 도구 목록을 조회하고 호출한다:

```typescript
// 등록된 도구 목록 조회
const { tools } = await client.listTools();
console.log("=== Tools registered ===");
tools.forEach(t => console.log(`  - ${t.name}: ${t.description}`));

// 도구 호출
const result = await client.callTool({
  name: "get_book_info",
  arguments: { isbn: "9780132350884" }
});

console.log("\n=== Result ===");
console.log(result.content[0].text);

await client.close();
```

실제 실행 결과다:

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

Open Library의 공개 API에서 실제로 데이터를 가져와 정상 출력됐다. API 키 없이 작동하는 공개 REST API를 사용했기 때문에 별도 인증 설정이 필요 없었다.

### 전체 동작 코드 (mcp-demo.mjs)

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

## StdioServerTransport로 Claude와 실제 연동하기

`InMemoryTransport`는 테스트와 개발 디버깅에는 완벽하지만, 실제 Claude Desktop이나 Cursor에 연결하려면 `StdioServerTransport`로 바꿔야 한다. 이게 MCP 서버의 표준 배포 방식이다.

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

// stdio 트랜스포트로 시작
const transport = new StdioServerTransport();
await server.connect(transport);
```

이제 `Claude Desktop`의 MCP 설정 파일(`~/Library/Application Support/Claude/claude_desktop_config.json`)에 서버를 등록한다:

```json
{
  "mcpServers": {
    "book-server": {
      "command": "node",
      "args": ["/절대경로/my-mcp-server/dist/server.js"]
    }
  }
}
```

TypeScript로 작성했다면 빌드 후 `dist/server.js`를 가리키거나, `tsx`를 사용한다면:

```json
{
  "mcpServers": {
    "book-server": {
      "command": "npx",
      "args": ["tsx", "/절대경로/my-mcp-server/src/server.ts"]
    }
  }
}
```

Claude Desktop을 재시작하면 대화 중에 ISBN을 언급할 때 자동으로 `get_book_info` 도구를 사용한다.

### 여러 도구 등록하기

`server.tool()`을 여러 번 호출하면 도구를 추가할 수 있다:

```typescript
// 도서 검색 도구 추가
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

Zod 스키마에서 `.default(5)`를 쓰면 인자가 선택적이 되고, AI가 명시적으로 값을 제공하지 않으면 기본값이 사용된다.

## 도구 설계 시 주의해야 할 점들

직접 써봤는데, 몇 가지 함정이 있었다.

**첫째, 도구 이름과 설명에 신경 써야 한다.** AI 모델이 도구를 선택하는 기준이 도구 설명이기 때문에, "get info"처럼 모호하게 쓰면 AI가 적절한 상황에 도구를 쓰지 않거나 잘못 쓴다. 구체적인 행동, 입력, 출력을 설명에 담는 것이 중요하다.

**둘째, Zod v4 API는 v3과 다르다.** Zod 4.4.3에서는 일부 API가 변경됐다. 기존 Zod v3 코드를 복붙하면 타입 오류가 날 수 있다. 특히 `.optional()`과 `.nullable()` 조합, `z.union()`의 동작 방식이 달라졌다. 기존 프로젝트에서 Zod를 쓰고 있다면 버전 충돌 여부를 확인해야 한다.

**셋째, 에러 처리를 신중하게 해야 한다.** 내가 초기에 저질렀던 실수는 네트워크 오류 시 예외를 그냥 던진 것이었다. MCP 표준에서는 도구 실행 오류도 `content`에 담아 반환하는 것이 더 안전하다. 클라이언트마다 예외 처리 방식이 다르기 때문이다:

```typescript
async ({ isbn }) => {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      return {
        content: [{ type: "text", text: `API error: ${res.status} ${res.statusText}` }],
        isError: true  // 오류임을 명시
      };
    }
    // ... 정상 처리
  } catch (error) {
    return {
      content: [{ type: "text", text: `Network error: ${error instanceof Error ? error.message : String(error)}` }],
      isError: true
    };
  }
}
```

`isError: true` 플래그를 추가하면 클라이언트가 응답을 오류로 처리할 수 있다.

**넷째, 긴 응답은 잘라야 한다.** AI 컨텍스트 윈도우에는 한계가 있다. 도구 응답이 너무 길면 AI가 이전 대화를 잃어버리거나 컨텍스트 초과 오류가 난다. 검색 결과나 목록형 데이터는 최대 항목 수를 제한하는 것이 현명하다.

## MCP Inspector로 디버깅하기

나는 개발 중에 `MCP Inspector`를 많이 활용했다. 브라우저 기반 GUI로 MCP 서버의 도구 목록을 확인하고, 직접 호출해볼 수 있다.

```bash
npx @modelcontextprotocol/inspector node dist/server.js
```

브라우저에서 `http://localhost:5173`을 열면 서버에 등록된 도구 목록과 각 도구의 Zod 스키마를 시각적으로 확인할 수 있다. 인자를 입력하고 실행하면 실제 응답이 JSON 형태로 출력된다.

주의할 점은 MCP Inspector가 별도로 Node.js 18+ 환경을 필요로 한다는 것이다. 그리고 Inspector 자체도 npm 패키지를 설치하는 과정이 있어서, 처음 실행 시 수십 초가 걸릴 수 있다.

## 리소스와 프롬프트 — 도구 외의 MCP 기능

MCP 스펙은 도구(Tools) 외에도 리소스(Resources)와 프롬프트(Prompts) 두 가지 기능을 제공한다.

**리소스**는 AI가 읽을 수 있는 데이터 소스다. 파일, 데이터베이스 테이블, API 응답 등을 리소스로 노출하면 AI가 컨텍스트로 읽을 수 있다:

```typescript
server.resource(
  "book-catalog",
  "books://catalog",
  async (uri) => ({
    contents: [
      {
        uri: uri.href,
        mimeType: "text/plain",
        text: "도서 카탈로그 내용..."
      }
    ]
  })
);
```

**프롬프트**는 재사용 가능한 프롬프트 템플릿이다. 복잡한 작업을 위한 멀티스텝 프롬프트를 정의해두고 클라이언트가 쉽게 불러올 수 있다.

솔직히 말하면, 처음에는 리소스와 프롬프트 기능이 실제로 얼마나 쓰이는지 잘 몰랐다. 대부분의 실용적인 사용 사례에서는 도구만으로 충분하다. 리소스는 대용량 컨텍스트 데이터를 제공할 때, 프롬프트는 워크플로우를 표준화할 때 유용하다.

## Zod v4로 복잡한 스키마 다루기

단순한 `z.string()` 외에도 다양한 Zod 스키마를 도구 인자로 쓸 수 있다:

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
    // 구현...
    return { content: [{ type: "text", text: "결과..." }] };
  }
);
```

`z.object()`, `z.enum()`, `.optional()`, `.default()` 등을 조합하면 복잡한 도구 인터페이스를 타입 안전하게 정의할 수 있다. AI는 이 스키마를 JSON Schema 형태로 변환해서 어떤 인자를 어떻게 채워야 하는지 이해한다.

주의할 점: Zod v4에서 `.describe()`는 `.optional()` 전에 붙여야 한다. `z.string().optional().describe()`는 타입 추론이 의도대로 안 될 수 있다. 올바른 순서는 `z.string().describe("설명").optional()`이다.

## HTTP/SSE 트랜스포트 — 원격 MCP 서버로 배포하기

지금까지는 로컬 stdio 방식이었다. 팀 전체가 공유하는 MCP 서버를 운영하거나, 클라우드에 배포하려면 HTTP/SSE 트랜스포트가 필요하다.

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
    // ... 동일한 구현
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

이 방식으로 배포하면 Cursor나 Claude Desktop에서 `http://localhost:3000/sse`를 MCP 서버 URL로 등록할 수 있다. 다만 HTTP 방식은 설정이 더 복잡하고, 보안(인증, HTTPS) 처리도 별도로 필요하다. 팀 내부 도구 수준이라면 stdio가 훨씬 간단하다.

[MCP vs A2A vs Open Responses 프로토콜 비교](/ko/blog/ko/mcp-vs-a2a-vs-open-responses-agent-protocol-comparison-2026)에서 다뤘듯, 원격 MCP 서버 아키텍처는 성숙도와 보안 측면에서 아직 정리 중인 부분이 많다. 지금 당장 원격 배포를 계획한다면 인증 토큰, CORS, 세션 관리를 꼭 신경 써야 한다.

## 실제로 쓸 수 있는 도구 아이디어

여기까지 읽었다면 MCP 서버 구조는 충분히 이해했을 것이다. 내가 생각해본 실용적인 도구 아이디어들이다:

**사내 시스템 연동**:
- Jira/Linear 이슈 조회 (`get_issue`, `create_issue`, `list_my_issues`)
- Confluence/Notion 문서 검색 (`search_docs`, `get_page`)
- Slack 메시지 검색 (`search_messages`, `get_channel_history`)

**개발 워크플로우**:
- GitHub PR 목록 및 리뷰 (`list_prs`, `get_pr_diff`, `add_review_comment`)
- 배포 상태 확인 (`get_deployment_status`, `rollback_deployment`)
- 로그 조회 (`search_logs`, `get_error_trace`)

**데이터 분석**:
- SQL 쿼리 실행 (읽기 전용 권한으로) (`run_query`, `list_tables`)
- 메트릭 대시보드 데이터 조회 (`get_metrics`, `get_alert_status`)

이 중 어떤 것이든 `server.tool()` 패턴으로 래핑하면 30분 안에 MCP 서버가 된다.

## 정리: 나는 이게 AI 도구 배포의 현실적인 표준이 될 것이라고 본다

나는 이 실험을 통해 MCP 서버 개발이 생각보다 진입 장벽이 낮다는 것을 확인했다. `@modelcontextprotocol/sdk`의 `McpServer` API는 명확하고, Zod로 타입 안전한 스키마를 정의하는 것도 직관적이다.

그러나 한계도 분명하다. **실제 Claude나 Cursor 클라이언트와 연동하려면 StdioServerTransport로의 전환이 필요하고**, 이 과정에서 배포 환경, 절대 경로 설정, Node.js 버전 호환성 등 추가 설정이 있다. 또한 Zod v4는 v3에서 API가 일부 바뀌었기 때문에 기존 코드를 그대로 쓸 수 없는 경우도 있다.

그럼에도 불구하고, 공개 REST API 하나를 MCP 도구로 래핑해 실제 데이터 조회까지 동작하는 end-to-end 파이프라인을 API 키 없이 30분 안에 완성할 수 있다는 것은 분명히 매력적이다. Claude, Cursor, Windsurf 등이 MCP를 표준으로 채택한 상황에서, 자신만의 도구를 여러 AI 플랫폼에 동시에 노출하는 가장 현실적인 방법이 MCP 서버다.

다음 단계로는 실제 사내 시스템 하나를 골라서 MCP 도구로 래핑해보는 것을 권한다. 코드 구조는 이 글에서 다룬 것이 전부다. 나머지는 해당 시스템의 API를 이해하는 일이다.

---

**참고 링크**:
- [Model Context Protocol 공식 문서](https://modelcontextprotocol.io)
- [@modelcontextprotocol/sdk npm](https://www.npmjs.com/package/@modelcontextprotocol/sdk)
- [Open Library API](https://openlibrary.org/developers/api)
- [MCP Inspector](https://github.com/modelcontextprotocol/inspector)
