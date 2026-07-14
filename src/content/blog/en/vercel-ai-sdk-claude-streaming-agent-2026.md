---
title: Building a Claude Streaming Agent with Vercel AI SDK
description: >-
  Build Claude streaming and tool-calling agents in Next.js App Router using
  Vercel AI SDK v6. Master streamText, generateObject, and tool loop patterns.
pubDate: '2026-04-23'
heroImage: ../../../assets/blog/vercel-ai-sdk-claude-streaming-agent-2026-hero.jpg
tags:
  - vercel-ai-sdk
  - claude
  - nextjs
  - typescript
relatedPosts:
  - slug: adsense-rejection-ai-analysis-improvement
    score: 0.95
    reason:
      ko: '웹 개발, AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: Web開発、AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in web development, AI/ML with comparable
        difficulty.
      zh: 在Web开发、AI/ML领域涵盖类似主题，难度相当。
  - slug: webmcp-chrome-146-ai-tool-server
    score: 0.95
    reason:
      ko: '웹 개발, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: Web開発、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in web development, AI/ML, architecture with
        comparable difficulty.
      zh: 在Web开发、AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: aeo-implementation-experience
    score: 0.94
    reason:
      ko: '웹 개발, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: Web開発、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in web development, AI/ML, architecture with
        comparable difficulty.
      zh: 在Web开发、AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: mcp-apps-interactive-ui-agent-ux
    score: 0.94
    reason:
      ko: '웹 개발, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: Web開発、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in web development, AI/ML, architecture with
        comparable difficulty.
      zh: 在Web开发、AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: ux-psychology-frontend-design-skill
    score: 0.93
    reason:
      ko: '웹 개발, AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: Web開発、AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in web development, AI/ML with comparable
        difficulty.
      zh: 在Web开发、AI/ML领域涵盖类似主题，难度相当。
---

```typescript
const result = streamText({
  model: anthropic('claude-sonnet-4-6'),
  prompt: 'Hello, streaming test',
});

for await (const chunk of result.textStream) {
  process.stdout.write(chunk);
}
```

The first time I ran this, I had an odd reaction. Not amazed that Claude was outputting text character by character — surprised that this actually worked in 5 lines. Compared to writing the Anthropic SDK directly, the setup code is less than half.

I first heard about Vercel AI SDK from a Slack link someone shared at work. The usual "AI chat in 10 minutes with Next.js" type of title — and usually these fall apart at the dependency installation step. I tried it skeptically and it actually worked quickly. I've been reaching for it during prototyping ever since.

After using Vercel AI SDK seriously for a while, the tradeoffs became clear. This post explains how to use it while being honest about where it gets complicated. If you've already used it, jump to the "Tool Calling" and "Production Considerations" sections.

## Why Vercel AI SDK — A Direct Comparison

I tried the alternatives first. Direct Anthropic SDK, LangChain.js, then Vercel AI SDK.

<strong>Direct Anthropic SDK</strong> is most flexible, but the boilerplate for getting streaming responses to the frontend is more than expected. You're writing SSE format handling, frontend hooks, and error handling from scratch. The underlying capability is simple, but the code length grows unnecessarily.

```typescript
// Direct Anthropic SDK streaming setup — gets longer than this
const stream = await anthropic.messages.stream({
  model: 'claude-sonnet-4-6',
  max_tokens: 1024,
  messages: [{ role: 'user', content: prompt }],
});

// Manually construct SSE response
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

Add the frontend parsing code and you're looking at real volume. This is right when you need fine-grained control, but it's too much overhead for building a single chat app.

<strong>LangChain.js</strong> — I gave up on this one. Frequent API changes between versions, documentation that doesn't match actual behavior. Digging through GitHub issues often turns up "this feature has been removed" answers. Might work for complex pipelines, but not right for fast prototyping.

Vercel AI SDK's practical advantages come down to three things:

First, `streamText()` + `useChat()` gets server-to-client streaming wired up in under 10 lines. Second, switching between Claude, OpenAI, Gemini, and Mistral is a single provider line change — which turns out to be genuinely useful for comparing model outputs on the same code. Third, `generateObject()` with Zod schema validation gives you clean structured output handling.

The downsides: it's optimized for Vercel's platform, which creates friction in other deployment environments. When you need fine-grained control over the agent loop, you lose some flexibility compared to the Anthropic SDK directly. More on that later.

[Compared to building directly with Claude Managed Agents](/en/blog/en/claude-managed-agents-production-deployment-guide), Managed Agents are easier to start without infrastructure but hit customization ceilings quickly. Vercel AI SDK sits between the two — more abstracted than raw SDK, more controllable than Managed Agents.

## Environment Setup

<strong>Prerequisites</strong>:
- Node.js 20+
- Anthropic API key (`ANTHROPIC_API_KEY`)
- Next.js 15 (App Router)

```bash
# New project
npx create-next-app@latest my-claude-app --typescript --app
cd my-claude-app

# Core AI SDK packages
npm install ai @ai-sdk/anthropic zod
```

Add your API key to `.env.local`:

```bash
ANTHROPIC_API_KEY=sk-ant-api03-...
```

One thing I ran into: `@ai-sdk/anthropic` installed fine, but a TypeScript type error appeared. The `moduleResolution` in `tsconfig.json` needs to be `bundler` or `node16` or higher. `create-next-app` handles this in the default config.

Directory structure:

```
app/
├── api/
│   ├── chat/
│   │   └── route.ts      # Streaming chat API
│   └── extract/
│       └── route.ts      # generateObject API
├── page.tsx              # Chat UI
└── components/
    └── Message.tsx
```

Not complex by design — this structure is actually sufficient for a functional chat app.

## Implementing Claude Streaming with streamText

Start with the server-side API route.

`app/api/chat/route.ts`:

```typescript
import { streamText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: anthropic('claude-sonnet-4-6'),
    system: `You are a helpful technical blog assistant.
Answer code questions practically, and be honest when you don't know something.
Keep responses concise but complete.`,
    messages,
    maxTokens: 2048,
    temperature: 0.7,
  });

  return result.toUIMessageStreamResponse();
}
```

`toUIMessageStreamResponse()` is the key piece. This single method handles SSE header setup, chunk formatting, and stream termination. Doing this manually with the Anthropic SDK takes 20+ lines minimum.

Frontend `app/page.tsx`:

```tsx
'use client';

import { useChat } from 'ai/react';
import { useEffect, useRef } from 'react';

export default function ChatPage() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: '/api/chat',
  });
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto p-4">
      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {messages.length === 0 && (
          <p className="text-gray-400 text-center mt-8">
            How can I help you?
          </p>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`p-3 rounded-lg max-w-[85%] ${
              m.role === 'user' ? 'bg-blue-100 ml-auto' : 'bg-gray-100'
            }`}
          >
            <p className="text-xs text-gray-400 mb-1">
              {m.role === 'user' ? 'You' : 'Claude'}
            </p>
            <div className="whitespace-pre-wrap text-sm">
              {m.content as string}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="bg-gray-100 p-3 rounded-lg text-gray-400 text-sm">
            Claude is typing...
          </div>
        )}
        {error && (
          <div className="text-red-500 text-sm p-2 bg-red-50 rounded">
            Error: {error.message}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 mt-4 border-t pt-4">
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Type a message..."
          className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
```

`useChat` handles message state, streaming updates, loading state, and error handling. Building this from scratch means writing `useState`, `useRef`, `AbortController`, SSE parsing, and retry logic.

Run `npm run dev` and the chat works at `localhost:3000`. Claude's response streams in character by character.

## Tool Calling — Making Claude Actually Do Things

To go beyond chat and let Claude call external tools, add the `tools` option with `maxSteps`.

```typescript
import { streamText, tool } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { z } from 'zod';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: anthropic('claude-sonnet-4-6'),
    system: 'You are an assistant that manages weather info and todo lists.',
    messages,
    maxSteps: 5,
    tools: {
      getWeather: tool({
        description: 'Gets the current weather for a specific city',
        parameters: z.object({
          city: z.string().describe('City name to get weather for'),
          unit: z.enum(['celsius', 'fahrenheit']).default('celsius'),
        }),
        execute: async ({ city, unit }) => {
          // Real implementation would call a weather API
          return {
            city,
            temperature: unit === 'celsius' ? 22 : 72,
            condition: 'Sunny',
            humidity: 65,
            feelsLike: unit === 'celsius' ? 20 : 68,
          };
        },
      }),
      addTodo: tool({
        description: 'Adds a new item to the todo list',
        parameters: z.object({
          title: z.string().describe('Todo title'),
          priority: z.enum(['low', 'medium', 'high']).default('medium'),
          dueDate: z.string().optional().describe('Due date (YYYY-MM-DD)'),
        }),
        execute: async ({ title, priority, dueDate }) => {
          const id = Math.random().toString(36).slice(2);
          return { id, title, priority, dueDate, created: new Date().toISOString() };
        },
      }),
    },
  });

  return result.toUIMessageStreamResponse();
}
```

`maxSteps: 5` matters. Without it, Claude receives tool results but doesn't loop back to generate another response. The SDK handles this loop automatically — `maxSteps` caps the maximum iterations.

[The pattern of agents combining multiple tools to solve problems](/en/blog/en/ai-agent-collaboration-patterns) depends heavily on `maxSteps` and the quality of each tool's `description`. Vague descriptions mean Claude can't decide when to use which tool. I had an early version where weather and todos were getting mixed up — adding explicit usage scenarios to the system prompt fixed it.

Real-time tool call progress in the frontend:

```tsx
{messages.map((m) => (
  <div key={m.id}>
    {m.role === 'assistant' &&
      Array.isArray(m.toolInvocations) &&
      m.toolInvocations.map((ti) => (
        <div key={ti.toolCallId} className="text-xs text-gray-400 italic mb-1">
          {ti.state === 'call' && `⚙ Calling ${ti.toolName}...`}
          {ti.state === 'result' && `✓ ${ti.toolName} complete`}
        </div>
      ))
    }
    <div className="text-sm">{m.content as string}</div>
  </div>
))}
```

## Extracting Structured Output with generateObject

Separate from streaming chat, use `generateObject()` when you need to pull specific structured data out of Claude's response.

```typescript
// app/api/extract/route.ts
import { generateObject } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { z } from 'zod';

const ArticleMetaSchema = z.object({
  title: z.string().describe('Post title (under 60 chars)'),
  summary: z.string().max(300).describe('3-4 sentence summary'),
  tags: z.array(z.string()).min(2).max(5).describe('Related technology tags'),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  estimatedReadTime: z.number().int().describe('Estimated read time in minutes'),
  hasCodeExamples: z.boolean(),
  mainTopics: z.array(z.string()).max(3).describe('Up to 3 main topics'),
});

export async function POST(req: Request) {
  const { content } = await req.json();

  try {
    const { object } = await generateObject({
      model: anthropic('claude-sonnet-4-6'),
      schema: ArticleMetaSchema,
      prompt: `Analyze the following technical blog post and extract metadata.
Primary readers are backend and fullstack developers.

---
${content}
---`,
    });

    return Response.json(object);
  } catch (error) {
    return Response.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
```

The response comes back as a type-safe object matching the Zod schema. No JSON parse errors or type mismatches to handle separately.

This pattern works well for: automated blog post tagging, user input classification, structured information extraction from documents, and form auto-completion.

I'm using a similar pattern for this blog's category score extraction. Writing good `describe()` text on Zod schema fields is the key to better output quality. [Good context engineering](/en/blog/en/context-engineering-production-ai-agents) means schema design and prompt quality determine 80% of extraction accuracy.

`streamObject()` is also available — useful when you want fields in a large schema to appear progressively in the UI without waiting for the full response.

## Production Issues I've Encountered

After enough use, a few constraints surface.

<strong>Edge Runtime Limitations</strong>

Running on Vercel Edge Functions means no Node.js-specific packages. `@ai-sdk/anthropic` works on Edge, but importing Node.js packages inside tool functions breaks deployment.

```typescript
// Explicitly declare at top of route.ts
export const runtime = 'nodejs'; // Use Node.js runtime, not Edge
```

For most cases, setting `runtime = 'nodejs'` is the practical choice.

<strong>Serverless Timeout</strong>

Vercel's free tier serverless function timeout is 10 seconds. Long Claude outputs or complex tool loops can exceed this. Pro tier raises it to 60 seconds.

For longer-running tasks, the architecture needs to change. [Building a separate MCP server to offload long-running work](/en/blog/en/mcp-server-build-practical-guide-2026) is one approach.

<strong>Context Accumulation Cost</strong>

As conversations grow, the full message history accumulates in context, and token costs climb fast. Check usage from the `streamText` result:

```typescript
const result = streamText({ ... });

result.usage.then((usage) => {
  const inputCost = (usage.promptTokens / 1_000_000) * 3.0;
  const outputCost = (usage.completionTokens / 1_000_000) * 15.0;
  console.log(`Tokens: ${usage.promptTokens} in, ${usage.completionTokens} out`);
  console.log(`Cost: $${(inputCost + outputCost).toFixed(5)}`);
});
```

A real service needs a context management strategy. Simplest approach: only pass the last N turns.

```typescript
const recentMessages = messages.slice(-20); // last 10 turns each direction

const result = streamText({
  model: anthropic('claude-sonnet-4-6'),
  messages: recentMessages,
});
```

<strong>Rate Limits</strong>

Hitting Anthropic API rate limits returns `429 Too Many Requests`. Multi-user environments need request queuing or backoff logic. The `ai` package doesn't include retry logic, so you'll build it or add middleware.

## When Should You Use This?

Vercel AI SDK fits well when:

- You want to add AI chat to a Next.js app quickly
- You want to test Claude, OpenAI, and Gemini on the same codebase
- You want `useChat` to handle frontend state management
- You're deploying to Vercel and the timeout limits aren't a bottleneck for your scale

Skip it when:

- You need full control over the agent loop internals — use Anthropic SDK directly
- You have a Python backend — this SDK is TypeScript only
- Your service baseline is long conversations with dozens of turns per user — context management becomes a significant architecture concern

Personally, I reach for it when validating new AI feature ideas. Going from idea to working prototype in under 30 minutes is real. Where it falls short is when you need fine-grained production control — at that point, you're either using Anthropic SDK directly or building abstractions on top of the AI SDK.

Vercel AI SDK made a tradeoff between convenience and flexibility. That tradeoff fits a lot of use cases, just not all of them. "Start with this, migrate when needed" is the realistic mental model.

---

What I want to test next is the human-in-the-loop tool approval flow added in AI SDK 6. The idea is that an agent can pause before calling certain tools and wait for human approval. Whether this is reliable enough for production is something I haven't fully validated yet. Finding the right balance between fully autonomous agents and manual workflows is one of the core challenges in agent development right now.
