---
title: Vercel AI SDK로 Claude 스트리밍 에이전트 만들기
description: >-
  Vercel AI SDK v6 + @ai-sdk/anthropic으로 Next.js App Router에서 Claude 스트리밍 채팅과 도구
  호출 에이전트를 구현하는 실전 가이드. streamText, generateObject, 도구 루프 패턴을 실제 코드로 익힌다.
pubDate: '2026-04-23'
heroImage: ../../../assets/blog/vercel-ai-sdk-claude-streaming-agent-2026-hero.jpg
tags:
  - vercel-ai-sdk
  - claude
  - nextjs
  - typescript
relatedPosts:
  - slug: webmcp-chrome-146-ai-tool-server
    score: 0.92
    reason:
      ko: Vercel AI SDK로 서버 사이드 도구 호출을 구현했다면, 브라우저 자체를 AI 도구 서버로 만드는 WebMCP 패턴도 자연스러운 다음 단계다.
      ja: Vercel AI SDKでサーバーサイドのツール呼び出しを実装したなら、ブラウザ自体をAIツールサーバーにするWebMCPパターンも次のステップとして自然だ。
      en: After implementing server-side tool calls with Vercel AI SDK, making the browser itself an AI tool server via WebMCP is a natural next step.
      zh: 用Vercel AI SDK实现了服务端工具调用后，将浏览器本身作为AI工具服务器的WebMCP模式是自然的下一步。
  - slug: mcp-apps-interactive-ui-agent-ux
    score: 0.89
    reason:
      ko: useChat 훅으로 채팅 UI를 만든 이후에는, AI가 생성하는 인터랙티브 UI 컴포넌트 패턴이 Claude와 Next.js 조합의 다음 진화 방향이다.
      ja: useChatフックでチャットUIを作った後は、AIが生成するインタラクティブUIコンポーネントパターンがClaudeとNext.jsの組み合わせの次の進化方向だ。
      en: After building chat UI with the useChat hook, AI-generated interactive UI components are the next evolution for Claude + Next.js combinations.
      zh: 用useChat钩子构建聊天UI之后，AI生成的交互式UI组件是Claude与Next.js组合的下一个演进方向。
  - slug: production-grade-ai-agent-design-principles
    score: 0.85
    reason:
      ko: streamText로 기본 에이전트를 만들었다면, 프로덕션에서 실제로 신뢰할 수 있는 에이전트를 설계하는 9가지 원칙을 알아야 한다.
      ja: streamTextで基本的なエージェントを作ったなら、本番環境で実際に信頼できるエージェントを設計する9つの原則を知っておく必要がある。
      en: If you've built a basic agent with streamText, the 9 design principles for truly reliable production agents are the essential next read.
      zh: 用streamText构建了基础代理后，需要了解在生产环境中真正可靠的代理设计9大原则。
  - slug: individual-developer-ai-saas-journey
    score: 0.82
    reason:
      ko: Vercel AI SDK + Claude로 프로토타입을 만들었다면, 실제로 AI 기반 SaaS를 혼자 3일 만에 프로덕션까지 가져간 경험기가 다음에 읽을 만하다.
      ja: Vercel AI SDK + Claudeでプロトタイプを作ったなら、実際にAIベースのSaaSを1人で3日間でプロダクションまで持っていった経験談が次に読む価値がある。
      en: If you've prototyped with Vercel AI SDK + Claude, the account of shipping an AI-based SaaS solo to production in 3 days is worth reading next.
      zh: 用Vercel AI SDK + Claude做出了原型后，一个人用3天把AI SaaS推向生产环境的经历值得一读。
  - slug: context-engineering-production-ai-agents
    score: 0.80
    reason:
      ko: generateObject로 구조화 출력을 추출할 때 품질이 낮으면, 컨텍스트 엔지니어링이 실제로 무엇인지 이해하면 즉각적인 개선이 가능하다.
      ja: generateObjectで構造化出力を抽出するときに品質が低ければ、コンテキストエンジニアリングが実際に何かを理解することで即座の改善が可能だ。
      en: If generateObject output quality isn't where you need it, understanding what context engineering actually means will give you immediate improvements.
      zh: 如果generateObject的输出质量不理想，理解上下文工程的实际含义能带来立竿见影的改善。
---

```typescript
const result = streamText({
  model: anthropic('claude-sonnet-4-6'),
  prompt: '안녕, 스트리밍 테스트야',
});

for await (const chunk of result.textStream) {
  process.stdout.write(chunk);
}
```

이 코드를 처음 실행했을 때 느낌이 의외로 묘했다. Claude에서 텍스트가 한 글자씩 출력되는 게 신기한 게 아니라, 이게 5줄로 된다는 사실이 좀 당황스러웠다. Anthropic SDK를 직접 쓸 때와 비교하면 설정 코드가 절반 이하다.

Vercel AI SDK를 처음 접한 건 회사 슬랙에서 누군가 공유한 링크였다. "Next.js에서 AI 채팅 10분 만에" 류의 제목이었는데, 보통 이런 류의 글은 실제로 해보면 의존성 설치 단계에서부터 막힌다. 그래서 반신반의하며 따라 해봤는데 실제로 빨랐다. 그 이후로 프로토타이핑할 때 자주 쓰게 됐다.

Vercel AI SDK를 진지하게 써봤더니 장단이 명확했다. 이 글은 "어떻게 쓰는가"를 설명하되, 어디서 막혔는지도 적는다. 이미 써본 사람이라면 "도구 호출"과 "프로덕션 고려사항" 섹션부터 읽으면 된다.

## 왜 Vercel AI SDK인가 — 다른 선택지와 직접 비교

다른 방법들을 먼저 써봤다. Anthropic SDK 직접 사용, LangChain.js, 그리고 Vercel AI SDK.

<strong>Anthropic SDK 직접 사용</strong>은 가장 유연하지만 스트리밍 응답을 프론트엔드로 넘기는 보일러플레이트가 생각보다 많다. SSE 포맷 처리, 프론트엔드 훅 직접 구현, 에러 처리까지 전부 손으로 짜야 한다. 기능 자체는 단순한데 코드 라인 수가 불필요하게 많아진다.

```typescript
// Anthropic SDK 직접 사용 시 스트리밍 설정 — 이것보다 더 길어진다
const stream = await anthropic.messages.stream({
  model: 'claude-sonnet-4-6',
  max_tokens: 1024,
  messages: [{ role: 'user', content: prompt }],
});

// SSE 응답 직접 구성
const encoder = new TextEncoder();
const readable = new ReadableStream({
  async start(controller) {
    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk.delta.text)}\n\n`));
      }
    }
    controller.close();
  },
});
```

이걸 프론트에서 파싱하는 코드까지 더하면 꽤 길어진다. 직접 제어가 필요한 경우라면 이게 맞는 방법이지만, 채팅 앱 하나 만드는 데 이 정도 보일러플레이트는 과하다.

<strong>LangChain.js</strong>는 써보다가 포기했다. 버전 간 API 변경이 잦고, 문서가 실제 동작과 다른 경우가 여러 번 있었다. GitHub 이슈를 뒤지다 보면 "이 기능은 삭제됐습니다" 류의 답변이 자주 나온다. 복잡한 파이프라인에는 맞을 수 있지만, 빠른 프로토타이핑에는 맞지 않는다.

Vercel AI SDK의 실질적 장점은 세 가지다:

첫째, `streamText()` + `useChat()` 조합으로 서버-클라이언트 스트리밍 연결이 10줄 이내로 끝난다. 둘째, Claude뿐 아니라 OpenAI, Gemini, Mistral 전환이 provider 한 줄 변경으로 된다. 이게 생각보다 유용하다 — 같은 코드로 모델별 결과를 비교할 수 있다. 셋째, `generateObject()`로 Zod 스키마 기반 구조화 출력 처리가 깔끔하다.

단점도 있다. Vercel 플랫폼에 최적화되어 있어서 다른 배포 환경에서는 제약이 생긴다. 에이전트 루프의 세세한 제어가 필요할 때 Anthropic SDK 직접 쓰는 것보다 확장성이 떨어지는 부분도 있다. 이 부분은 뒤에서 구체적으로 얘기한다.

[Claude Managed Agents를 직접 구축하는 방법](/ko/blog/ko/claude-managed-agents-production-deployment-guide)과 비교하면, Managed Agents는 인프라 없이 시작하기 편하지만 커스터마이징 한계가 명확했다. Vercel AI SDK는 그 중간 어딘가다 — 직접 구현보다는 추상화되어 있고, Managed Agents보다는 제어권이 많다.

## 환경 설정 — 패키지 설치부터

<strong>전제조건</strong>:
- Node.js 20+
- Anthropic API 키 (`ANTHROPIC_API_KEY`)
- Next.js 15 (App Router)

```bash
# 새 프로젝트 시작
npx create-next-app@latest my-claude-app --typescript --app
cd my-claude-app

# AI SDK 핵심 패키지 설치
npm install ai @ai-sdk/anthropic zod
```

패키지를 설치하고 나면 `.env.local` 파일을 만들어 API 키를 넣는다:

```bash
ANTHROPIC_API_KEY=sk-ant-api03-...
```

직접 해봤을 때 `@ai-sdk/anthropic` 설치는 바로 됐는데, TypeScript 타입이 맞지 않는다는 에러가 하나 나왔다. `tsconfig.json`에서 `moduleResolution`이 `bundler` 또는 `node16` 이상이어야 한다. `create-next-app`으로 만들었다면 기본 설정에서 이미 해결되어 있다.

디렉토리 구조는 이렇게 잡았다:

```
app/
├── api/
│   ├── chat/
│   │   └── route.ts      # 스트리밍 채팅 API
│   └── extract/
│       └── route.ts      # generateObject API
├── page.tsx              # 채팅 UI
└── components/
    └── Message.tsx       # 메시지 컴포넌트
```

복잡해 보이지 않는 게 맞다. 실제로 이 구조로 충분히 기능하는 채팅 앱이 만들어진다.

## streamText로 Claude 스트리밍 구현하기

서버사이드 API 라우트를 먼저 만든다.

`app/api/chat/route.ts`:

```typescript
import { streamText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: anthropic('claude-sonnet-4-6'),
    system: `당신은 친절한 기술 블로그 어시스턴트입니다.
코드 질문에 실용적으로 답변하고, 모르는 내용은 솔직하게 말합니다.
답변은 간결하게 유지하되 핵심 내용을 빠뜨리지 않습니다.`,
    messages,
    maxTokens: 2048,
    temperature: 0.7,
  });

  return result.toUIMessageStreamResponse();
}
```

`toUIMessageStreamResponse()`가 핵심이다. 이 메서드 하나가 SSE 헤더 설정, 청크 포맷팅, 스트림 종료 처리를 전부 담당한다. Anthropic SDK를 직접 쓸 때 이 부분을 직접 구현하면 20줄은 기본이다.

프론트엔드 `app/page.tsx`:

```tsx
'use client';

import { useChat } from 'ai/react';
import { useEffect, useRef } from 'react';

export default function ChatPage() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: '/api/chat',
  });
  const bottomRef = useRef<HTMLDivElement>(null);

  // 자동 스크롤
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto p-4">
      {/* 메시지 목록 */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {messages.length === 0 && (
          <p className="text-gray-400 text-center mt-8">
            무엇을 도와드릴까요?
          </p>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`p-3 rounded-lg max-w-[85%] ${
              m.role === 'user'
                ? 'bg-blue-100 ml-auto text-right'
                : 'bg-gray-100'
            }`}
          >
            <p className="text-xs text-gray-400 mb-1">
              {m.role === 'user' ? '나' : 'Claude'}
            </p>
            <div className="whitespace-pre-wrap text-sm">
              {m.content as string}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="bg-gray-100 p-3 rounded-lg max-w-[85%] text-gray-400 text-sm">
            Claude가 입력 중...
          </div>
        )}
        {error && (
          <div className="text-red-500 text-sm p-2 bg-red-50 rounded">
            오류: {error.message}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* 입력창 */}
      <form onSubmit={handleSubmit} className="flex gap-2 mt-4 border-t pt-4">
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="메시지를 입력하세요..."
          className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg disabled:opacity-50 hover:bg-blue-600 transition-colors"
        >
          전송
        </button>
      </form>
    </div>
  );
}
```

`useChat`이 메시지 상태 관리, 스트리밍 업데이트, 로딩 상태, 에러 처리까지 전부 담당한다. 직접 구현하면 `useState`, `useRef`, `AbortController`, SSE 파싱, 재시도 로직 등 상당한 양이 된다.

`npm run dev`를 실행하면 `localhost:3000`에서 채팅이 동작한다. Claude가 타이핑하듯 텍스트가 흘러나온다. 여기까지가 기본 구현이고, 이 상태로도 데모나 프로토타입으로 충분히 쓸 만한 UI가 된다.

## 도구 호출 — Claude가 실제로 뭔가를 하게 만들기

채팅 수준에서 더 나아가 Claude가 외부 도구를 쓸 수 있게 하려면 `tools` 옵션과 `maxSteps`를 추가한다.

```typescript
import { streamText, tool } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { z } from 'zod';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: anthropic('claude-sonnet-4-6'),
    system: '날씨 정보와 할 일 목록을 관리하는 어시스턴트입니다.',
    messages,
    maxSteps: 5,
    tools: {
      getWeather: tool({
        description: '특정 도시의 현재 날씨를 가져옵니다',
        parameters: z.object({
          city: z.string().describe('날씨를 조회할 도시명'),
          unit: z.enum(['celsius', 'fahrenheit']).default('celsius'),
        }),
        execute: async ({ city, unit }) => {
          // 실제 구현에서는 날씨 API 호출
          // 예: const res = await fetch(`https://api.weatherapi.com/v1/current.json?key=${KEY}&q=${city}`)
          return {
            city,
            temperature: unit === 'celsius' ? 22 : 72,
            condition: '맑음',
            humidity: 65,
            feelsLike: unit === 'celsius' ? 20 : 68,
          };
        },
      }),
      addTodo: tool({
        description: '할 일 목록에 새 항목을 추가합니다',
        parameters: z.object({
          title: z.string().describe('할 일 제목'),
          priority: z.enum(['low', 'medium', 'high']).default('medium'),
          dueDate: z.string().optional().describe('마감일 (YYYY-MM-DD)'),
        }),
        execute: async ({ title, priority, dueDate }) => {
          // 실제 DB 저장 로직
          const id = Math.random().toString(36).slice(2);
          return { id, title, priority, dueDate, created: new Date().toISOString() };
        },
      }),
    },
  });

  return result.toUIMessageStreamResponse();
}
```

`maxSteps: 5`가 중요하다. 도구 호출 결과를 받은 후 Claude가 다시 응답을 생성하는 루프를 돌리는데, 이 숫자가 최대 반복 횟수를 결정한다. 설정하지 않으면 도구 호출 결과를 받아도 Claude가 더 이상 응답을 생성하지 않는다.

프론트엔드에서 도구 호출 진행 상황을 실시간으로 표시하는 것도 간단하다:

```tsx
{messages.map((m) => (
  <div key={m.id}>
    {m.role === 'assistant' &&
      Array.isArray(m.toolInvocations) &&
      m.toolInvocations.map((ti) => (
        <div key={ti.toolCallId} className="text-xs text-gray-400 italic mb-1 flex items-center gap-1">
          {ti.state === 'call' && (
            <>
              <span className="animate-spin">⚙</span>
              <span>{ti.toolName} 호출 중...</span>
            </>
          )}
          {ti.state === 'result' && (
            <>
              <span>✓</span>
              <span>{ti.toolName} 완료</span>
            </>
          )}
        </div>
      ))
    }
    <div className="text-sm">{m.content as string}</div>
  </div>
))}
```

"서울 날씨 알려주고, 저녁 운동 할 일 추가해줘"라고 입력하면 Claude가 `getWeather`와 `addTodo`를 순서대로 또는 병렬로 호출하고, 결과를 조합해서 자연어로 답변한다.

[AI 에이전트가 여러 도구를 조합해서 작업을 수행하는 패턴](/ko/blog/ko/ai-agent-collaboration-patterns)은 `maxSteps` 설정과 각 도구의 `description` 품질에 크게 의존한다. 도구 설명이 모호하면 Claude가 언제 어떤 도구를 써야 할지 판단하지 못한다. 실제로 처음에는 날씨와 할 일이 섞이는 경우가 있었는데, 시스템 프롬프트에 각 도구 사용 시나리오를 명시했더니 안정적으로 동작했다.

## generateObject로 구조화된 출력 추출하기

스트리밍 채팅과는 별개로, Claude 응답에서 특정 구조의 데이터를 추출해야 할 때 `generateObject()`를 쓴다.

```typescript
// app/api/extract/route.ts
import { generateObject } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { z } from 'zod';

const ArticleMetaSchema = z.object({
  title: z.string().describe('포스트 제목 (60자 이내)'),
  summary: z.string().max(300).describe('3〜4문장 핵심 요약'),
  tags: z.array(z.string()).min(2).max(5).describe('관련 기술 태그'),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  estimatedReadTime: z.number().int().describe('예상 읽기 시간 (분)'),
  hasCodeExamples: z.boolean(),
  mainTopics: z.array(z.string()).max(3).describe('핵심 주제 3개 이내'),
});

export async function POST(req: Request) {
  const { content } = await req.json();

  try {
    const { object } = await generateObject({
      model: anthropic('claude-sonnet-4-6'),
      schema: ArticleMetaSchema,
      prompt: `다음 기술 블로그 글을 분석하고 메타데이터를 추출해주세요.
글의 주요 독자는 백엔드/풀스택 개발자입니다.

---
${content}
---`,
    });

    return Response.json(object);
  } catch (error) {
    return Response.json({ error: '분석 실패' }, { status: 500 });
  }
}
```

응답은 Zod 스키마에 맞게 타입이 보장된 객체로 나온다. JSON 파싱 에러나 타입 불일치를 따로 처리하지 않아도 된다. `generateObject`가 내부적으로 Claude에게 JSON으로 응답하도록 지시하고 Zod로 검증한다.

이 패턴이 잘 맞는 상황:

- 블로그 포스트 자동 태깅 및 메타데이터 생성
- 사용자 입력 분류 (지원서, 피드백 등)
- 긴 문서에서 구조화된 정보 추출
- 폼 자동 완성

이 블로그의 카테고리 스코어 추출에서 실제로 유사한 패턴을 쓰고 있다. Zod 스키마에 `describe()`를 잘 작성하는 게 출력 품질을 올리는 핵심이다. [컨텍스트 엔지니어링을 제대로 적용하면](/ko/blog/ko/context-engineering-production-ai-agents) 스키마 설계와 프롬프트 품질이 추출 정확도의 80%를 결정한다.

`streamObject()`도 있다. 대형 스키마에서 필드가 하나씩 채워지는 걸 실시간으로 보여줄 때 쓴다. 분석 결과를 로딩 없이 점진적으로 표시하고 싶을 때 유용하다.

## 프로덕션에서 마주친 문제들

어느 정도 쓰다 보면 몇 가지 제약이 나온다.

<strong>에지 런타임 제약</strong>

Vercel Edge Functions에서 돌리면 Node.js 전용 패키지를 쓸 수 없다. `@ai-sdk/anthropic`은 Edge에서 동작하지만, 도구 함수 내부에서 Node.js 전용 패키지를 임포트하면 배포 시 에러가 난다.

```typescript
// route.ts 상단에 명시적으로 선언
export const runtime = 'nodejs'; // Edge 대신 Node.js 런타임 사용
```

대부분의 경우 `runtime = 'nodejs'`로 두는 게 편하다. Edge 배포가 필요하다면 도구 내부 로직도 Edge 호환으로 짜야 한다.

<strong>서버리스 타임아웃</strong>

Vercel 무료 플랜에서 서버리스 함수 타임아웃은 10초다. Claude가 긴 텍스트를 생성하거나 복잡한 도구 루프를 돌리면 초과할 수 있다. Pro 이상이면 60초까지 늘어난다.

이보다 오래 걸리는 작업이 필요하면 구조 자체를 바꿔야 한다. [MCP 서버를 별도로 구축해서 장시간 실행 작업을 분리하는 방법](/ko/blog/ko/mcp-server-build-practical-guide-2026)이 하나의 대안이다.

<strong>컨텍스트 누적 비용</strong>

대화가 길어질수록 컨텍스트에 모든 메시지 히스토리가 들어가서 토큰 비용이 급격히 올라간다. `streamText` 결과에서 사용량을 확인할 수 있다:

```typescript
const result = streamText({ ... });

// 스트리밍 완료 후 사용량 로깅
result.usage.then((usage) => {
  const inputCost = (usage.promptTokens / 1_000_000) * 3.0;  // claude-sonnet-4-6 기준 $3/1M
  const outputCost = (usage.completionTokens / 1_000_000) * 15.0;
  console.log(`토큰: 입력 ${usage.promptTokens}, 출력 ${usage.completionTokens}`);
  console.log(`비용: $${(inputCost + outputCost).toFixed(5)}`);
});
```

실제 서비스라면 컨텍스트 관리 전략이 필요하다. 가장 단순한 방법은 최근 N턴만 유지하는 것:

```typescript
// 최근 10턴만 전달
const recentMessages = messages.slice(-20); // user/assistant 각 10턴

const result = streamText({
  model: anthropic('claude-sonnet-4-6'),
  messages: recentMessages,
  // ...
});
```

더 정교하게는 이전 대화를 요약해서 시스템 프롬프트에 포함시키는 방법이 있다. 이건 별도 구현이 필요하지만 긴 대화에서 비용을 크게 줄여준다.

<strong>레이트 리밋</strong>

Anthropic API 레이트 리밋에 걸리면 `429 Too Many Requests` 에러가 나온다. 여러 사용자가 동시에 쓰는 환경이라면 요청 큐나 백오프 로직이 필요하다. `ai` 패키지 자체에는 재시도 로직이 없어서 직접 구현하거나 별도 미들웨어를 써야 한다.

## 어떤 상황에 쓸 만한가

Vercel AI SDK가 잘 맞는 경우:

- Next.js 기반으로 AI 채팅 기능을 빠르게 붙이고 싶을 때
- Claude, OpenAI, Gemini 등 여러 모델을 같은 코드로 테스트해보고 싶을 때
- `useChat` 훅으로 프론트 상태 관리를 최소화하고 싶을 때
- Vercel에 배포할 예정이고 타임아웃 제약이 문제가 되지 않는 규모일 때

쓰지 말아야 할 경우:

- 에이전트 루프의 세부 동작을 완전히 제어해야 할 때 — Anthropic SDK 직접 사용이 낫다
- Python 백엔드와 연동해야 할 때 — 이 SDK는 TypeScript 전용이다
- 사용자당 수십 턴 이상의 장기 대화가 기본인 서비스 — 컨텍스트 관리 전략이 필수

개인적으로는 새로운 AI 기능 아이디어를 검증하는 속도가 빠르다는 점에서 자주 쓴다. 아이디어를 30분 안에 동작하는 프로토타입으로 만들 수 있다는 건 확실한 장점이다. 그런데 프로덕션 수준으로 가면 세부 제어가 필요한 부분이 반드시 나온다. 그때는 Anthropic SDK를 직접 쓰거나 이 SDK 위에 레이어를 얹는 선택을 해야 한다.

Vercel AI SDK는 편의성과 유연성 사이에서 타협을 했다. 그 타협점이 많은 사용 사례에 맞지만, 모든 경우에 맞지는 않는다는 걸 처음부터 인식하고 시작하면 기대치 관리가 된다. "이걸로 시작해서 필요하면 바꾼다"는 접근이 현실적이다.

---

다음으로 실험해보고 싶은 건 AI SDK 6에서 추가된 human-in-the-loop 도구 승인 흐름이다. 에이전트가 특정 도구를 호출하기 전에 사람이 승인할 수 있는 구조인데, 이게 실제로 프로덕션에서 얼마나 신뢰할 수 있는지는 아직 확인이 필요하다. 완전 자율 에이전트와 수동 작업 사이의 중간 지점을 찾는 게 2026년 에이전트 개발의 핵심 과제 중 하나다.
