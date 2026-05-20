---
title: '用Next.js 16 + Claude API构建流式AI聊天应用 — App Router完整指南'
description: '在Next.js 16 App Router中连接Claude API流式传输的实战指南。通过实际构建的代码和日志，详细介绍Route Handler、SSE和React 19客户端集成。'
pubDate: '2026-05-20'
heroImage: '../../../assets/blog/nextjs-16-claude-api-streaming-guide-2026-hero.png'
tags: ["Next.js", "Claude API", "TypeScript", "流式传输"]
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

2026年了，搜索"Next.js AI聊天"还是Vercel AI SDK占据主导。SDK本身没什么问题，但用SDK的结果往往是对底层原理一知半解——流式传输到底怎么工作的？Route Handler里发生了什么？

这次我在沙盒里只用Anthropic SDK从零开始构建了一遍。整个流程：`create-next-app`创建项目、添加`@anthropic-ai/sdk`、实现Route Handler。比想象中简单。大约50行代码就能搭好一个可以生产部署的流式聊天后端。

还有一个发现：`create-next-app@latest`现在安装的是**Next.js 16**。网上大多数教程还是基于Next.js 14或15。这篇文章反映的是2026年5月实际安装的结果。

## 要构建的内容：基于App Router的Claude流式聊天

应用结构如下：

- **Next.js 16.2.6** + App Router
- Route Handler（`/api/chat`）在服务端调用Claude API
- SSE（Server-Sent Events）将流式响应推送给客户端
- React 19的`"use client"`组件实时渲染流式内容

最关键的一点：**API密钥只在服务端读取，绝不会包含在客户端bundle中。** 这得益于Next.js App Router对服务端和客户端代码的隔离设计。

沙盒中的实际构建输出：

```
▲ Next.js 16.2.6 (Turbopack)
✓ Compiled successfully in 1874ms

Route (app)
┌ ○ /           (Static)  prerendered as static content
└ ƒ /api/chat   (Dynamic) server-rendered on demand
```

![Next.js 16 + Claude API架构图](../../../assets/blog/nextjs-16-claude-api-streaming-guide-2026-architecture.png)

## 最终项目结构

完成后的结构如下。核心只有两个文件，其余都由`create-next-app`自动生成。

```
nextjs-claude-chat/
├── src/
│   └── app/
│       ├── api/
│       │   └── chat/
│       │       └── route.ts    ← Claude API流式端点（核心）
│       ├── page.tsx             ← 聊天UI（核心）
│       ├── layout.tsx           ← 自动生成
│       └── globals.css          ← 自动生成
├── .env.local                   ← ANTHROPIC_API_KEY放这里
├── package.json
└── tsconfig.json
```

两个文件搞定。`route.ts`是服务端代码，`page.tsx`是客户端代码。`api/chat/route.ts`只会进入服务端bundle，而带有`"use client"`指令的`page.tsx`则进入客户端bundle。这种分离正是API密钥安全性的基础。

## 前置条件

- Node.js 18+
- Anthropic API密钥（`sk-ant-...`）— 在[console.anthropic.com](https://console.anthropic.com)申请
- TypeScript基础知识
- Next.js App Router基本了解（没有也能跟上）

## Step 1: 创建项目并安装依赖

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

2026年5月，`create-next-app@latest`安装的是**Next.js 16.2.6**，React也升至19.2.4。

安装后`package.json`的主要依赖：

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

## Step 2: 实现Claude API Route Handler

核心文件。创建`src/app/api/chat/route.ts`：

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

有两点值得注意。

<strong>第一，`client.messages.stream()`返回`AsyncIterableStream`。</strong> `for await...of`逐个接收chunk并推送给客户端。流结束时发送`[DONE]`信号并关闭控制器。

<strong>第二，`ReadableStream` + `TextEncoder`是Web Streams API标准。</strong> Next.js Route Handler使用Web Streams而非Node.js的`stream`模块。这就是为什么代码看起来与[FastAPI流式传输](/zh/blog/zh/fastapi-claude-api-streaming-production-guide-2026)或Express实现不同。这个模式在Cloudflare Workers、Deno、Bun等现代JavaScript运行时中也完全适用。

## Step 3: 环境变量与安全配置

在项目根目录创建`.env.local`文件：

```bash
ANTHROPIC_API_KEY=sk-ant-在这里填写真实密钥
```

**绝对不能加`NEXT_PUBLIC_`前缀。** 这是Next.js安全性的核心。

| 变量名格式 | 可访问位置 | 用途 |
|---|---|---|
| `ANTHROPIC_API_KEY` | 仅服务端（Route Handler, Server Component） | ✓ API密钥 |
| `NEXT_PUBLIC_API_KEY` | 客户端公开（包含在浏览器bundle中） | ✗ 绝不用于API密钥 |

带`NEXT_PUBLIC_`的变量在构建时会直接内联进JavaScript bundle，任何人都可以通过浏览器开发者工具看到。

## Step 4: 实现客户端聊天UI

在`src/app/page.tsx`中实现实时渲染流式响应的聊天界面：

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
          <div key={i} className={`p-3 rounded-lg ${
            msg.role === "user"
              ? "bg-blue-100 ml-auto max-w-xs"
              : "bg-gray-100 mr-auto max-w-md"
          }`}>
            <span className="text-xs text-gray-500 block mb-1">
              {msg.role === "user" ? "你" : "Claude"}
            </span>
            <p className="whitespace-pre-wrap">{msg.content}</p>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="输入消息..."
          className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={sendMessage}
          disabled={isLoading || !input.trim()}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg disabled:opacity-50"
        >
          发送
        </button>
      </div>
    </main>
  );
}
```

SSE解析逻辑中有两个细节很重要：`line !== "data: [DONE]"`检查防止解析终止信号；`setMessages((prev) => ...)`函数式更新确保在异步循环中始终引用最新状态。

## Step 5: 构建并运行

```bash
npm run dev
# ▲ Next.js 16.2.6 (Turbopack)
# ✓ Ready in 337ms

npm run build
# ✓ Compiled successfully in 1874ms
# ƒ /api/chat  (Dynamic)
```

Turbopack让开发服务器在0.3秒内启动。生产构建也会自动运行TypeScript检查。

## 当前实现的局限性

坦率地说，这段代码不应该直接用于生产环境。

<strong>没有错误处理。</strong> Claude API调用失败时（限流、网络错误、无效密钥），客户端什么都收不到，流直接断掉。实际服务需要`try/catch`块，并在出错时发送错误SSE事件。

<strong>没有对话长度限制。</strong> 每次请求都把全部对话历史发给API。对话变长后会超出上下文窗口或大幅提高成本。生产应用需要只发最近N条消息，或管理token数量。

<strong>没有并发请求管理。</strong> 用户快速发送多条消息会导致流式传输冲突。缺少用AbortController取消前一个请求的逻辑。

## 部署到Vercel的注意事项

**环境变量**：需要在Vercel的Project Settings → Environment Variables中添加`ANTHROPIC_API_KEY`。`.env.local`是本地专用的，不会上传到Vercel服务器。

**运行时选择**：在Route Handler中明确指定Node.js Runtime：

```typescript
export const runtime = 'nodejs';
```

**函数超时**：Vercel Hobby计划有10秒限制。如需更长响应时间，在`vercel.json`中配置：

```json
{
  "functions": {
    "src/app/api/chat/route.ts": {
      "maxDuration": 60
    }
  }
}
```

## SSE的工作原理

Server-Sent Events是运行在普通HTTP之上的单向流式协议。与WebSocket不同，它无需特殊处理就能穿越代理、CDN和防火墙。

SSE消息格式：
```
data: {"text": "你好"}\n\n
data: {"text": "，世界"}\n\n
data: [DONE]\n\n
```

`TextEncoder`/`TextDecoder`负责字符串和`Uint8Array`（字节）之间的转换。这个模式在Next.js、Cloudflare Workers、Deno、Bun等现代JavaScript运行时中通用。

## Raw API与Vercel AI SDK的对比

| 方面 | Raw Anthropic SDK | Vercel AI SDK |
|---|---|---|
| 代码量 | 较多（约50行Route Handler） | 较少（`useChat`一行） |
| 自定义程度 | 完全自由 | SDK抽象范围内 |
| 可调试性 | SSE流程透明 | 内部逻辑难以追踪 |
| 学习价值 | 需理解Web Streams和SSE | 可立即使用 |

我的建议是先用原始API实现一遍，再使用SDK。了解SDK替你做了什么，才能正确使用SDK。[用Vercel AI SDK构建Claude流式代理](/zh/blog/zh/vercel-ai-sdk-claude-streaming-agent-2026)可以直接对比两种方式。

## 下一步

1. **添加Tool Use** — 赋予Claude函数调用能力 → [Claude Agent SDK实战指南](/zh/blog/zh/claude-agent-sdk-tool-use-complete-guide-2026)
2. **Prompt Caching** — API成本降低最多90% → [Claude API Prompt Caching实战](/zh/blog/zh/claude-api-prompt-caching-cost-optimization-guide)
3. **强化错误处理** — AbortController、重试逻辑、错误SSE事件
4. **流取消** — 允许用户中途停止生成的取消按钮
5. **Vercel部署** — 应用上述注意事项后上线
