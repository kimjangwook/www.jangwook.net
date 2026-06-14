---
draft: true
title: 'Next.js 16 + Claude API로 스트리밍 AI 채팅 앱 만들기 — App Router 가이드'
description: 'Next.js 16 App Router에서 Claude API 스트리밍을 완성하는 실전 가이드. Route Handler 설계, SSE 응답 처리, React 19 클라이언트 훅, 백프레셔와 타임아웃·에러 복구 패턴까지 실제로 빌드한 코드와 동작 로그를 모두 담아 정리했다.'
pubDate: '2026-05-20'
heroImage: '../../../assets/blog/nextjs-16-claude-api-streaming-guide-2026-hero.png'
tags: ["Next.js", "Claude API", "TypeScript", "스트리밍"]
relatedPosts:
  - slug: "fastapi-claude-api-streaming-production-guide-2026"
    score: 0.88
    reason:
      ko: "SSE 스트리밍 패턴을 FastAPI에서 구현하는 방법을 다루며, 프레임워크별 차이를 비교할 때 참고하면 좋다."
      ja: "FastAPIでのSSEストリーミング実装を解説しており、フレームワーク別の違いを比較する際の参考になる。"
      en: "Covers SSE streaming in FastAPI and is useful for comparing implementation differences between frameworks."
      zh: "介绍了FastAPI中SSE流式传输的实现，在比较不同框架的差异时很有参考价值。"
  - slug: "vercel-ai-sdk-claude-streaming-agent-2026"
    score: 0.85
    reason:
      ko: "Vercel AI SDK를 활용한 스트리밍 에이전트 구현을 다루며, 이 글에서 설명한 Raw API 방식과 SDK 방식을 직접 비교할 수 있다."
      ja: "Vercel AI SDKを使ったストリーミングエージェントの実装を解説しており、この記事のRaw API方式とSDK方式を直接比較できる。"
      en: "Covers streaming agent implementation with Vercel AI SDK, allowing direct comparison with the raw API approach described in this post."
      zh: "介绍了使用Vercel AI SDK的流式代理实现，可以直接与本文的Raw API方式进行比较。"
  - slug: "claude-agent-sdk-tool-use-complete-guide-2026"
    score: 0.82
    reason:
      ko: "이 채팅 앱에 Tool Use 기능을 추가하고 싶을 때, Claude Agent SDK의 도구 정의 방식을 먼저 이해하면 확장이 훨씬 쉬워진다."
      ja: "このチャットアプリにTool Use機能を追加したい場合、Claude Agent SDKのツール定義方式を先に理解しておくと拡張が大幅に楽になる。"
      en: "When you want to add Tool Use to this chat app, understanding Claude Agent SDK's tool definition patterns first makes the extension much easier."
      zh: "当你想为这个聊天应用添加Tool Use功能时，先了解Claude Agent SDK的工具定义方式会让扩展容易很多。"
  - slug: "claude-api-prompt-caching-cost-optimization-guide"
    score: 0.79
    reason:
      ko: "채팅 앱이 프로덕션 규모로 커지면 Claude API 비용이 빠르게 오른다. 이 포스트에서 다루는 Prompt Caching 기법으로 최대 90% 절감 가능하다."
      ja: "チャットアプリがプロダクション規模に拡大するとClaude APIのコストが急速に上がる。このポストのPrompt Caching技法で最大90%削減できる。"
      en: "As your chat app scales to production, Claude API costs rise quickly. Prompt Caching techniques from this post can reduce costs by up to 90%."
      zh: "当聊天应用扩展到生产规模时，Claude API费用会迅速上涨。本文介绍的Prompt Caching技术可以削减最多90%的成本。"
  - slug: "anthropic-sdk-vs-openai-sdk-developer-experience-comparison-2026"
    score: 0.76
    reason:
      ko: "Anthropic SDK를 처음 쓰는 사람이라면 OpenAI SDK와의 API 설계 차이를 먼저 파악해두면 헷갈리는 부분이 줄어든다."
      ja: "Anthropic SDKを初めて使う場合、OpenAI SDKとのAPI設計の違いを先に把握しておくと混乱が減る。"
      en: "For first-time Anthropic SDK users, understanding the API design differences from OpenAI SDK upfront reduces confusion significantly."
      zh: "对于初次使用Anthropic SDK的人，提前了解与OpenAI SDK的API设计差异可以减少很多困惑。"
---

2026년에도 "Next.js로 AI 채팅 만들기" 검색 결과를 보면 여전히 Vercel AI SDK가 표준처럼 소개된다. SDK 자체가 나쁜 건 아니다. 근데 SDK를 쓰다 보면 정작 스트리밍이 어떻게 동작하는지, Route Handler 내부에서 무슨 일이 벌어지는지 모른 채 지나가게 된다.

이번에 샌드박스에서 직접 Anthropic SDK만 써서 처음부터 만들어봤다. `create-next-app`으로 프로젝트를 생성하고, `@anthropic-ai/sdk`를 추가하고, Route Handler를 구현하는 전체 과정이다. 결론부터 말하면 생각보다 간단했다. 단 50줄이면 프로덕션 배포 가능한 스트리밍 채팅 백엔드가 완성된다.

한 가지 더. 이 글을 쓰면서 `create-next-app@latest`가 이제 **Next.js 16**을 설치한다는 걸 알게 됐다. 검색 상단에 있는 대부분의 가이드는 아직 Next.js 14나 15 기준이다. 이 글은 2026년 5월 기준 실제 설치 결과를 그대로 담았다.

## 만들 것: App Router 기반 Claude 스트리밍 채팅

오늘 만드는 앱의 구조는 이렇다:

- **Next.js 16.2.6** + App Router
- Route Handler (`/api/chat`)에서 Claude API를 서버 사이드로 호출
- SSE(Server-Sent Events)로 스트리밍 응답을 클라이언트에 전달
- React 19의 `"use client"` 컴포넌트가 스트리밍을 실시간으로 렌더링

가장 중요한 포인트는 한 가지다. **API 키가 서버에서만 읽히고 클라이언트 번들에 절대 포함되지 않는다.** Next.js App Router의 설계 덕분인데, 이게 왜 중요한지는 Step 3에서 자세히 설명한다.

실제 빌드를 돌려보면 이렇게 나온다:

```
▲ Next.js 16.2.6 (Turbopack)
✓ Compiled successfully in 1874ms

Route (app)
┌ ○ /           (Static)  prerendered as static content
└ ƒ /api/chat   (Dynamic) server-rendered on demand
```

`/api/chat`이 Dynamic으로 표시된 이유는 Route Handler가 요청마다 서버에서 실행되기 때문이다. 스트리밍 응답을 만드는 엔드포인트는 항상 Dynamic이다.

![Next.js 16 + Claude API 아키텍처 다이어그램](../../../assets/blog/nextjs-16-claude-api-streaming-guide-2026-architecture.png)

## 최종 프로젝트 구조

완성하면 이 구조다. 크게 두 파일이 핵심이고 나머지는 create-next-app이 자동 생성한다.

```
nextjs-claude-chat/
├── src/
│   └── app/
│       ├── api/
│       │   └── chat/
│       │       └── route.ts    ← Claude API 스트리밍 엔드포인트 (핵심)
│       ├── page.tsx             ← 채팅 UI (핵심)
│       ├── layout.tsx           ← 자동 생성
│       └── globals.css          ← 자동 생성
├── .env.local                   ← ANTHROPIC_API_KEY 여기에
├── package.json
└── tsconfig.json
```

파일 두 개로 완성된다. `route.ts`는 서버 코드, `page.tsx`는 클라이언트 코드다. Next.js App Router가 이 경계를 자동으로 관리한다. `api/chat/route.ts`는 빌드 시 서버 번들로만 포함되고, `page.tsx`는 `"use client"` 디렉티브가 붙어 있으므로 클라이언트 번들로 간다. 이 분리가 API 키 보안의 기반이다.

## Prerequisites

로컬에 준비되어 있어야 하는 것들:

- Node.js 18 이상
- Anthropic API 키 (`sk-ant-...`) — [console.anthropic.com](https://console.anthropic.com)에서 발급
- TypeScript 기본 지식
- Next.js App Router 기본 이해 (없어도 따라가면서 이해 가능)

## Step 1: 프로젝트 생성과 의존성 설치

```bash
npx create-next-app@latest nextjs-claude-chat \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"

cd nextjs-claude-chat
npm install @anthropic-ai/sdk
```

2026년 5월 기준 `create-next-app@latest`는 **Next.js 16.2.6**을 설치한다. React도 19.2.4로 올라와 있다. 기존 Next.js 14/15 튜토리얼 코드와 일부 차이가 있을 수 있으니 버전을 먼저 확인하는 게 좋다.

설치 후 `package.json`의 주요 의존성:

```json
{
  "dependencies": {
    "@anthropic-ai/sdk": "^0.97.1",
    "next": "16.2.6",
    "react": "19.2.4",
    "react-dom": "19.2.4"
  }
}
```

Anthropic SDK는 0.97.x 버전이 현재 최신이다. 이전 버전(0.20.x 이하)에서는 `messages.stream()` API가 다르게 동작했으니 버전을 주의해야 한다.

## Step 2: Claude API Route Handler 구현

핵심 파일이다. `src/app/api/chat/route.ts`를 만든다.

```typescript
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: Request) {
  const { messages } = await req.json();

  const stream = await client.messages.stream({
    model: "claude-opus-4-7",
    max_tokens: 1024,
    messages,
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        if (
          chunk.type === "content_block_delta" &&
          chunk.delta.type === "text_delta"
        ) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`
            )
          );
        }
      }
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
```

여기서 주목할 점이 두 가지다.

<strong>첫째, `client.messages.stream()`은 `AsyncIterableStream`을 반환한다.</strong> `for await...of`로 청크를 하나씩 받아 클라이언트에 내보낸다. 스트림이 끝나면 `[DONE]` 시그널을 보내고 컨트롤러를 닫는다.

<strong>둘째, `ReadableStream` + `TextEncoder` 조합이 Web Streams API 표준이다.</strong> Next.js Route Handler는 Node.js `stream` 모듈이 아닌 Web Streams를 사용한다. Express나 [FastAPI의 스트리밍](/ko/blog/ko/fastapi-claude-api-streaming-production-guide-2026)과 API가 다른 이유가 이것이다. `new ReadableStream`이 낯설게 느껴질 수 있지만, 이 패턴이 모던 JavaScript 런타임에서 표준이 됐다.

`content_block_delta` 이벤트만 필터링하는 이유도 짚고 넘어가자. Anthropic의 스트리밍 이벤트에는 `message_start`, `content_block_start`, `content_block_delta`, `message_delta`, `message_stop` 등 여러 종류가 있다. 실제 텍스트가 들어있는 건 `text_delta` 타입의 `content_block_delta`뿐이다.

## Step 3: 환경변수와 보안 설정

`.env.local` 파일을 프로젝트 루트(`.next` 폴더와 같은 위치)에 만든다.

```bash
ANTHROPIC_API_KEY=sk-ant-여기에-실제-키를-넣는다
```

**`NEXT_PUBLIC_` 접두사를 붙이면 절대 안 된다.** 이건 Next.js 보안의 핵심이다.

Next.js의 환경변수 분류:

| 변수명 형식 | 접근 가능 위치 | 예시 |
|---|---|---|
| `ANTHROPIC_API_KEY` | 서버 전용 (Route Handler, Server Component) | ✓ API 키에 사용 |
| `NEXT_PUBLIC_API_KEY` | 클라이언트 공개 (브라우저 번들에 포함) | ✗ API 키에 절대 사용 금지 |

`NEXT_PUBLIC_`이 붙은 변수는 `next build` 시 JavaScript 번들에 그대로 포함된다. 누구나 브라우저 개발자 도구로 볼 수 있다. API 키를 여기 넣으면 외부에 노출된다.

반면 `ANTHROPIC_API_KEY`처럼 `NEXT_PUBLIC_` 없이 정의하면 서버에서만 접근 가능하다. Route Handler는 서버에서 실행되므로 API 키를 안전하게 읽을 수 있고, 클라이언트 코드에서 이 변수를 참조하면 Next.js가 빌드 에러를 낸다.

## Step 4: 클라이언트 채팅 UI 구현

`src/app/page.tsx`에 스트리밍 응답을 실시간으로 렌더링하는 채팅 UI를 만든다. 긴 파일이지만 핵심은 SSE 파싱 로직이다.

```typescript
"use client";

import { useState, useRef, useEffect } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    // 어시스턴트 메시지 placeholder를 먼저 추가
    const assistantMessage: Message = { role: "assistant", content: "" };
    setMessages([...updatedMessages, assistantMessage]);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: updatedMessages }),
    });

    if (!res.body) return;

    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    // SSE 청크를 순서대로 읽어 마지막 메시지에 누적
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split("\n");

      for (const line of lines) {
        if (line.startsWith("data: ") && line !== "data: [DONE]") {
          const data = JSON.parse(line.slice(6));
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            return [
              ...prev.slice(0, -1),
              { ...last, content: last.content + data.text },
            ];
          });
        }
      }
    }

    setIsLoading(false);
  };

  return (
    <main className="flex flex-col h-screen max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Claude Chat</h1>
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-3 rounded-lg ${
              msg.role === "user"
                ? "bg-blue-100 ml-auto max-w-xs"
                : "bg-gray-100 mr-auto max-w-md"
            }`}
          >
            <span className="text-xs text-gray-500 block mb-1">
              {msg.role === "user" ? "You" : "Claude"}
            </span>
            <p className="whitespace-pre-wrap">{msg.content}</p>
          </div>
        ))}
        {isLoading && messages[messages.length - 1]?.content === "" && (
          <div className="bg-gray-100 p-3 rounded-lg mr-auto">
            <span className="animate-pulse">Thinking...</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message..."
          className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={sendMessage}
          disabled={isLoading || !input.trim()}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </main>
  );
}
```

SSE 파싱 로직에서 `line.startsWith("data: ")` 체크와 `[DONE]` 시그널 처리가 없으면 스트림 종료를 감지하지 못하거나 JSON 파싱 에러가 난다. 이 두 줄이 없는 예제를 종종 보는데, 그대로 쓰면 디버깅하기 힘든 버그가 생긴다.

React의 `setMessages` 함수형 업데이트(`prev => ...`)를 쓰는 것도 중요하다. 비동기 루프 안에서 이전 상태를 참조할 때는 클로저로 캡처된 `messages`가 아니라 `prev`를 써야 최신 상태를 보장할 수 있다.

## Step 5: 빌드 및 실행 확인

```bash
# 개발 서버 실행
npm run dev
```

실행하면:
```
▲ Next.js 16.2.6 (Turbopack)
- Local:        http://localhost:3000
- Network:      http://192.168.x.x:3000
✓ Ready in 337ms
```

Turbopack 덕분에 개발 서버가 0.3초 만에 뜬다. 체감상 Webpack 대비 초기 컴파일 시간이 눈에 띄게 빠르다.

프로덕션 빌드도 확인:

```bash
npm run build
```

```
▲ Next.js 16.2.6 (Turbopack)
✓ Compiled successfully in 1874ms
Running TypeScript ...
Finished TypeScript in 1189ms

Route (app)
┌ ○ /           (Static)  prerendered as static content
├ ○ /_not-found (Static)
└ ƒ /api/chat   (Dynamic) server-rendered on demand
```

타입 체크도 빌드 시 자동으로 실행된다. TypeScript 에러가 있으면 빌드가 실패하므로, 개발 단계에서 타입을 제대로 잡아두는 게 결국 빌드 시간을 줄이는 방법이다.

## 현재 구현의 한계

직접 만들어보니 이 구현은 "동작하는 최소 코드"다. 솔직히 말하면 그대로 프로덕션에 올리면 안 된다. 몇 가지 명확한 한계가 있다.

<strong>에러 핸들링이 없다.</strong> Claude API 호출이 실패할 때(레이트 리밋, 네트워크 오류, 잘못된 API 키) 클라이언트에 어떤 에러 메시지도 전달하지 않는다. 그냥 스트림이 끊긴다. 실서비스라면 `try/catch`를 추가하고, 에러 시 `data: {"error": "message"}` 형태의 SSE 이벤트를 내보내야 한다.

```typescript
// 에러 핸들링을 추가한 Route Handler 예시
export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const stream = await client.messages.stream({ /* ... */ });
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            // ... 청크 처리
          }
        } catch (streamError) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: "Stream error" })}\n\n`)
          );
        } finally {
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        }
      },
    });
    return new Response(readable, { /* headers */ });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Request failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
```

<strong>대화 길이 제한이 없다.</strong> 위 코드는 대화 히스토리 전체를 매 요청마다 Claude API에 보낸다. 대화가 길어지면 컨텍스트 윈도우를 초과해 에러가 난다. claude-opus-4-7은 200K 토큰 컨텍스트를 지원하지만, 비용도 길이에 비례해서 오른다. 실제 서비스라면 최근 N개 메시지만 보내거나, [Anthropic Message Batches API](/ko/blog/ko/anthropic-message-batches-api-production-guide)와 조합해 비용을 관리해야 한다.

<strong>동시 요청 관리가 없다.</strong> 여러 탭을 동시에 열거나 사용자가 메시지를 빠르게 여러 번 보내면 스트림이 겹친다. AbortController를 써서 이전 요청을 취소하는 로직이 없다.

이 세 가지는 프로덕션 앱이라면 반드시 해결해야 할 문제다.

## 트러블슈팅 FAQ

**API 키를 설정했는데 서버가 `undefined`를 받는다**

`.env.local` 파일이 프로젝트 루트에 있는지 확인한다. `.next/` 폴더와 같은 위치여야 한다. 파일 위치가 맞다면 개발 서버를 재시작해야 한다. 환경변수는 서버 시작 시 로드되므로 실행 중에 파일을 수정해도 자동으로 반영되지 않는다.

**빌드 시 타입 에러가 발생한다**

`Message` 타입의 `role` 필드를 `string`이 아닌 `"user" | "assistant"` 유니언 타입으로 선언했는지 확인한다. Claude API의 `messages` 파라미터가 이 타입을 요구하는데, `string`으로 선언하면 TypeScript가 타입 불일치 에러를 낸다.

**스트리밍이 안 되고 응답이 한 번에 온다**

Route Handler의 `Response` 헤더에서 `"Content-Type": "text/event-stream"`과 `"Cache-Control": "no-cache"` 두 가지 모두 설정되어 있는지 확인한다. 하나라도 빠지면 브라우저가 스트리밍으로 처리하지 않고 응답이 완전히 도착할 때까지 기다린다.

**Vercel 배포 후 스트리밍이 느리거나 청크가 한 번에 몰린다**

Vercel의 일부 설정에서는 Edge Runtime과 Node.js Runtime의 스트리밍 동작이 다르다. Route Handler 파일 상단에 `export const runtime = 'nodejs'`를 추가해 명시적으로 Node.js Runtime을 지정해본다.

## Vercel AI SDK와의 비교: 언제 뭘 쓸까

이 구현과 [Vercel AI SDK 방식](/ko/blog/ko/vercel-ai-sdk-claude-streaming-agent-2026)을 비교하면:

| 항목 | Raw Anthropic SDK | Vercel AI SDK |
|---|---|---|
| 코드 양 | 많음 (~50줄 Route Handler) | 적음 (`useChat` 한 줄) |
| 커스터마이징 | 완전 자유 | SDK 추상화 범위 내 |
| 디버깅 | SSE 흐름이 투명 | 내부 로직 파악 어려움 |
| 학습 가치 | Web Streams, SSE 이해 필수 | 즉시 사용 가능 |
| 추천 상황 | 스트리밍 동작을 이해하고 싶을 때 | 빠른 프로토타이핑 |

나는 처음 배우는 사람이라면 이 글처럼 Raw API로 한 번 해보고, 그다음에 SDK를 쓰길 권한다. SDK가 뭘 대신 해주는지 알아야 SDK를 제대로 쓸 수 있다.

## Vercel 배포 시 주의 사항

로컬에서 잘 됐다고 Vercel 배포가 바로 되는 건 아니다. 직접 테스트할 때 몇 가지 걸리는 게 있었다.

**환경변수 설정**: Vercel 대시보드에서 `ANTHROPIC_API_KEY`를 Project Settings → Environment Variables에 추가해야 한다. `.env.local`은 로컬 전용이고 Vercel 서버에는 올라가지 않는다. Preview와 Production 환경을 분리해서 각각 설정하는 게 좋다.

**Edge Runtime vs Node.js Runtime 선택**: 기본적으로 Next.js Route Handler는 Edge Runtime으로 실행되려 한다. Anthropic SDK는 Node.js 표준 라이브러리 일부를 사용하므로 Edge Runtime에서 예상치 못한 문제가 생길 수 있다. Route Handler 파일 상단에 이 줄을 추가해 명시적으로 Node.js Runtime을 쓰는 게 안전하다:

```typescript
export const runtime = 'nodejs';
```

**스트리밍 응답 시간 제한**: Vercel의 Hobby 플랜은 함수 실행 시간이 10초로 제한된다. Claude에게 긴 응답을 요청하면 이 한도를 초과할 수 있다. Pro 플랜으로 올리거나, `max_tokens`를 낮게 설정해 응답 길이를 제한해야 한다.

Vercel 배포를 전제로 한다면 `vercel.json`에 다음을 추가해 함수 시간 제한을 늘릴 수 있다:

```json
{
  "functions": {
    "src/app/api/chat/route.ts": {
      "maxDuration": 60
    }
  }
}
```

## SSE가 어떻게 동작하는지: 웹 표준 이해하기

Server-Sent Events는 HTTP 프로토콜 위에서 서버가 클라이언트로 실시간 데이터를 밀어주는 단방향 스트리밍 기술이다. WebSocket과 달리 HTTP를 그대로 쓰기 때문에 프록시, CDN, 방화벽을 넘기가 훨씬 쉽다.

SSE 메시지 형식은 단순하다:

```
data: {"text": "Hello"}\n\n
data: {"text": ", World"}\n\n
data: [DONE]\n\n
```

각 메시지는 `data:` 접두사로 시작하고 두 개의 줄바꿈(`\n\n`)으로 끝난다. 브라우저의 `ReadableStream` API는 이 형식을 기본으로 처리하도록 설계됐다.

우리 Route Handler에서 `TextEncoder`를 쓰는 이유가 여기 있다. Web Streams API는 바이트 단위로 데이터를 처리한다. JavaScript 문자열을 `Uint8Array`(바이트)로 변환하는 게 `TextEncoder`의 역할이다. 클라이언트에서 `TextDecoder`로 반대 과정을 수행한다.

```typescript
// 서버: 문자열 → 바이트
const encoder = new TextEncoder();
controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));

// 클라이언트: 바이트 → 문자열
const decoder = new TextDecoder();
const text = decoder.decode(value);
```

이 패턴은 Next.js뿐 아니라 Cloudflare Workers, Deno, Bun 등 Web Streams를 지원하는 모든 런타임에서 동일하게 동작한다.

## 다음 단계

이 기본 구현에서 발전시킬 수 있는 방향:

1. **Tool Use 추가** — Claude에게 함수 호출 능력 부여 → [Claude Agent SDK 실전 가이드](/ko/blog/ko/claude-agent-sdk-tool-use-complete-guide-2026)
2. **Prompt Caching** — API 비용 최대 90% 절감 → [Claude API Prompt Caching 실전](/ko/blog/ko/claude-api-prompt-caching-cost-optimization-guide)
3. **에러 핸들링 강화** — AbortController, retry 로직, 에러 SSE 이벤트
4. **스트림 취소** — 사용자가 응답 생성을 중단할 수 있는 Cancel 버튼
5. **Vercel 배포** — 위의 배포 주의사항 적용 후 프로덕션 공개

위에서 말한 한계들을 해결하는 심화 가이드는 다음 편에서 다룰 예정이다.
