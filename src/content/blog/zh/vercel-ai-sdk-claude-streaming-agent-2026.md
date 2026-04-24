---
title: 用Vercel AI SDK构建Claude流式代理
description: >-
  使用Vercel AI SDK v6 + @ai-sdk/anthropic在Next.js App
  Router中实现Claude流式聊天和工具调用代理的实战指南。通过代码学习streamText、generateObject和工具循环模式。
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
  prompt: '你好，流式测试',
});

for await (const chunk of result.textStream) {
  process.stdout.write(chunk);
}
```

第一次运行这段代码时感觉很奇妙。不是因为Claude能逐字输出文本感到惊讶，而是这仅用5行代码就实现了让我有点意外。和直接使用Anthropic SDK相比，设置代码减少了一半以上。

我第一次接触Vercel AI SDK是通过工作群里有人分享的链接。通常"10分钟用Next.js实现AI聊天"这类标题在实际操作时，在安装依赖包的阶段就会遇到问题。我半信半疑地试了一下，结果确实很快。从那以后，我在做原型开发时经常用它。

认真用了一段时间Vercel AI SDK之后，优缺点变得很明显。这篇文章在解释"如何使用"的同时，也会诚实地说明在哪些地方遇到了麻烦。如果你已经用过了，可以直接跳到"工具调用"和"生产环境注意事项"部分。

## 为什么选择Vercel AI SDK — 与其他选择的直接比较

我先试了其他方案。直接使用Anthropic SDK、LangChain.js，然后是Vercel AI SDK。

<strong>直接使用Anthropic SDK</strong>最为灵活，但将流式响应传递给前端的样板代码比预期的多。SSE格式处理、前端hook实现、错误处理都需要手动编写。功能本身简单，但代码行数不必要地增多。

```typescript
// 直接使用Anthropic SDK时的流式配置 — 实际会更长
const stream = await anthropic.messages.stream({
  model: 'claude-sonnet-4-6',
  max_tokens: 1024,
  messages: [{ role: 'user', content: prompt }],
});

// 手动构建SSE响应
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

加上前端解析代码，代码量会相当可观。当需要精细控制时这是正确的方式，但为了构建一个聊天应用这种开销过大。

<strong>LangChain.js</strong>用到一半放弃了。版本间API变更频繁，文档与实际行为不符的情况发生了好几次。翻GitHub Issues经常看到"此功能已删除"的回答。对于复杂管道可能合适，但不适合快速原型开发。

Vercel AI SDK的实际优势有三点：

第一，`streamText()` + `useChat()` 的组合让服务端到客户端的流式连接在10行以内完成。第二，Claude、OpenAI、Gemini、Mistral之间的切换只需改一行provider代码——这实际上非常有用，可以用同样的代码比较不同模型的输出。第三，`generateObject()` 配合Zod schema验证，结构化输出处理简洁清晰。

缺点也有。它针对Vercel平台进行了优化，在其他部署环境中会产生限制。当需要对代理循环进行精细控制时，灵活性不如直接使用Anthropic SDK。这一点稍后会具体说明。

[与直接构建Claude Managed Agents相比](/zh/blog/zh/claude-managed-agents-production-deployment-guide)，Managed Agents在没有基础设施的情况下更容易上手，但自定义限制很明显。Vercel AI SDK处于两者之间——比原始SDK更抽象，比Managed Agents控制权更多。

## 环境设置 — 从安装包开始

<strong>前提条件</strong>：
- Node.js 20+
- Anthropic API密钥（`ANTHROPIC_API_KEY`）
- Next.js 15（App Router）

```bash
# 新建项目
npx create-next-app@latest my-claude-app --typescript --app
cd my-claude-app

# 安装AI SDK核心包
npm install ai @ai-sdk/anthropic zod
```

在`.env.local`中添加API密钥：

```bash
ANTHROPIC_API_KEY=sk-ant-api03-...
```

实际操作时遇到了一个情况：`@ai-sdk/anthropic`安装正常，但出现了TypeScript类型错误。`tsconfig.json`中的`moduleResolution`需要是`bundler`或`node16`以上。使用`create-next-app`创建的项目默认配置已经处理了这个问题。

目录结构这样设置：

```
app/
├── api/
│   ├── chat/
│   │   └── route.ts      # 流式聊天API
│   └── extract/
│       └── route.ts      # generateObject API
├── page.tsx              # 聊天UI
└── components/
    └── Message.tsx
```

看起来不复杂是正确的。这个结构实际上足以创建一个功能完整的聊天应用。

## 用streamText实现Claude流式输出

先创建服务端API路由。

`app/api/chat/route.ts`：

```typescript
import { streamText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: anthropic('claude-sonnet-4-6'),
    system: `你是一个友善的技术博客助手。
对代码问题给出实用的回答，不懂的地方诚实说明。
保持回答简洁同时不遗漏重要内容。`,
    messages,
    maxTokens: 2048,
    temperature: 0.7,
  });

  return result.toUIMessageStreamResponse();
}
```

`toUIMessageStreamResponse()`是关键。这个方法单独处理SSE头部设置、数据块格式化和流终止。用Anthropic SDK手动实现这部分需要20行以上。

前端`app/page.tsx`：

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
          <p className="text-gray-400 text-center mt-8">有什么我可以帮助的吗？</p>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`p-3 rounded-lg max-w-[85%] ${
              m.role === 'user' ? 'bg-blue-100 ml-auto' : 'bg-gray-100'
            }`}
          >
            <p className="text-xs text-gray-400 mb-1">
              {m.role === 'user' ? '我' : 'Claude'}
            </p>
            <div className="whitespace-pre-wrap text-sm">
              {m.content as string}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="bg-gray-100 p-3 rounded-lg text-gray-400 text-sm">
            Claude正在输入...
          </div>
        )}
        {error && (
          <div className="text-red-500 text-sm p-2 bg-red-50 rounded">
            错误：{error.message}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 mt-4 border-t pt-4">
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="输入消息..."
          className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg disabled:opacity-50"
        >
          发送
        </button>
      </form>
    </div>
  );
}
```

`useChat`处理消息状态管理、流式更新、加载状态和错误处理。自己实现的话需要`useState`、`useRef`、`AbortController`、SSE解析等相当多的代码。

运行`npm run dev`，聊天就在`localhost:3000`上工作了。Claude的回复像打字一样逐字流出。

## 工具调用 — 让Claude真正做些什么

要超越聊天让Claude调用外部工具，需要添加`tools`选项和`maxSteps`。

```typescript
import { streamText, tool } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { z } from 'zod';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: anthropic('claude-sonnet-4-6'),
    system: '你是一个管理天气信息和待办列表的助手。',
    messages,
    maxSteps: 5,
    tools: {
      getWeather: tool({
        description: '获取特定城市的当前天气',
        parameters: z.object({
          city: z.string().describe('要查询天气的城市名'),
          unit: z.enum(['celsius', 'fahrenheit']).default('celsius'),
        }),
        execute: async ({ city, unit }) => {
          // 实际实现中调用天气API
          return {
            city,
            temperature: unit === 'celsius' ? 22 : 72,
            condition: '晴天',
            humidity: 65,
            feelsLike: unit === 'celsius' ? 20 : 68,
          };
        },
      }),
      addTodo: tool({
        description: '向待办列表添加新项目',
        parameters: z.object({
          title: z.string().describe('待办事项标题'),
          priority: z.enum(['low', 'medium', 'high']).default('medium'),
          dueDate: z.string().optional().describe('截止日期（YYYY-MM-DD）'),
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

`maxSteps: 5`很重要。没有它，Claude收到工具结果后不会继续生成响应。SDK自动处理这个循环——`maxSteps`限制最大迭代次数。

[AI代理组合多个工具解决问题的模式](/zh/blog/zh/ai-agent-collaboration-patterns)在很大程度上依赖于`maxSteps`设置和每个工具`description`的质量。描述不清晰，Claude就无法判断何时使用哪个工具。早期版本中天气和待办事项会混淆，在系统提示中明确说明各工具使用场景后就稳定了。

在前端实时显示工具调用进度：

```tsx
{messages.map((m) => (
  <div key={m.id}>
    {m.role === 'assistant' &&
      Array.isArray(m.toolInvocations) &&
      m.toolInvocations.map((ti) => (
        <div key={ti.toolCallId} className="text-xs text-gray-400 italic mb-1">
          {ti.state === 'call' && `⚙ 正在调用 ${ti.toolName}...`}
          {ti.state === 'result' && `✓ ${ti.toolName} 完成`}
        </div>
      ))
    }
    <div className="text-sm">{m.content as string}</div>
  </div>
))}
```

## 用generateObject提取结构化输出

与流式聊天分开，当需要从Claude的响应中提取特定结构的数据时，使用`generateObject()`。

```typescript
// app/api/extract/route.ts
import { generateObject } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { z } from 'zod';

const ArticleMetaSchema = z.object({
  title: z.string().describe('文章标题（60字以内）'),
  summary: z.string().max(300).describe('3〜4句话摘要'),
  tags: z.array(z.string()).min(2).max(5).describe('相关技术标签'),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  estimatedReadTime: z.number().int().describe('预计阅读时间（分钟）'),
  hasCodeExamples: z.boolean(),
  mainTopics: z.array(z.string()).max(3).describe('最多3个主要话题'),
});

export async function POST(req: Request) {
  const { content } = await req.json();

  try {
    const { object } = await generateObject({
      model: anthropic('claude-sonnet-4-6'),
      schema: ArticleMetaSchema,
      prompt: `请分析以下技术博客文章并提取元数据。
主要读者是后端/全栈开发者。

---
${content}
---`,
    });

    return Response.json(object);
  } catch (error) {
    return Response.json({ error: '分析失败' }, { status: 500 });
  }
}
```

响应以符合Zod schema的类型安全对象返回。不需要单独处理JSON解析错误或类型不匹配。

适合这个模式的场景：
- 博客文章自动标签和元数据生成
- 用户输入分类
- 从长文档中提取结构化信息
- 表单自动填充

这个博客的分类分数提取中实际使用了类似模式。在Zod schema字段上写好`describe()`是提升输出质量的关键。[做好上下文工程](/zh/blog/zh/context-engineering-production-ai-agents)意味着schema设计和提示质量决定了提取准确度的80%。

`streamObject()`也可用——当你想在UI中渐进式显示大型schema中的字段而不需要等待完整响应时很有用。

## 生产环境遇到的问题

用一段时间后，会出现几个限制。

<strong>Edge运行时限制</strong>

在Vercel Edge Functions上运行意味着无法使用Node.js专用包。`@ai-sdk/anthropic`在Edge上运行，但在工具函数内部导入Node.js专用包会导致部署错误。

```typescript
// 在route.ts顶部明确声明
export const runtime = 'nodejs'; // 使用Node.js运行时而非Edge
```

大多数情况下，设置`runtime = 'nodejs'`是实用的选择。

<strong>Serverless超时</strong>

Vercel免费版serverless函数超时为10秒。Claude生成长文本或运行复杂工具循环可能会超时。Pro版可延长至60秒。

对于需要更长时间的任务，架构本身需要改变。[单独构建MCP服务器来分离长时间运行任务](/zh/blog/zh/mcp-server-build-practical-guide-2026)是一种方案。

<strong>上下文累积成本</strong>

随着对话增长，完整消息历史累积在上下文中，token成本迅速增加。可以从`streamText`结果中查看使用量：

```typescript
const result = streamText({ ... });

result.usage.then((usage) => {
  const inputCost = (usage.promptTokens / 1_000_000) * 3.0;
  const outputCost = (usage.completionTokens / 1_000_000) * 15.0;
  console.log(`Token：输入 ${usage.promptTokens}，输出 ${usage.completionTokens}`);
  console.log(`费用：$${(inputCost + outputCost).toFixed(5)}`);
});
```

实际服务需要上下文管理策略。最简单的方法是只保留最近N轮：

```typescript
const recentMessages = messages.slice(-20); // 最近10轮

const result = streamText({
  model: anthropic('claude-sonnet-4-6'),
  messages: recentMessages,
});
```

<strong>速率限制</strong>

触及Anthropic API速率限制会返回`429 Too Many Requests`错误。多用户并发环境需要请求队列或退避逻辑。`ai`包本身没有重试逻辑，需要自己实现或添加中间件。

## 什么情况下适合使用

Vercel AI SDK适合的情况：

- 想要快速在Next.js应用中添加AI聊天功能
- 想用同一套代码测试Claude、OpenAI和Gemini
- 想用`useChat`钩子最小化前端状态管理
- 计划部署到Vercel且超时限制在当前规模下不是瓶颈

不适合的情况：

- 需要完全控制代理循环内部 — 直接使用Anthropic SDK更好
- 有Python后端需要集成 — 这个SDK是TypeScript专用的
- 服务基准是每用户数十轮以上的长对话 — 上下文管理成为重要架构考虑

个人而言，在验证新AI功能想法时经常用到它。能在30分钟内把想法变成能运行的原型是实实在在的优势。短板在于当你需要精细化生产控制时——这时要么直接用Anthropic SDK，要么在AI SDK之上构建抽象层。

Vercel AI SDK在便利性和灵活性之间做出了取舍。这个取舍适合很多用例，但不是所有情况。"先用这个，需要时再迁移"是现实的思维模式。

---

接下来想测试的是AI SDK 6中新增的human-in-the-loop工具审批流程。代理在调用特定工具前可以暂停等待人工审批。这在生产环境中有多可靠，还需要更多验证。在完全自主代理和手动工作流之间找到正确平衡，是2026年代理开发的核心挑战之一。
