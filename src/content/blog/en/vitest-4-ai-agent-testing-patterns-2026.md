---
title: 'Testing AI Agents with Vitest 4 — Mocking LLM Calls and Streaming Responses in Practice'
description: 'I verified practical patterns for mocking Anthropic SDK messages.create() and streaming responses in Vitest 4.1.7. This covers why vi.fn().mockImplementation(function(){...}) differs from arrow functions, how to reproduce SSE streams with async function* generators, and how 9 tests pass in 142ms without a single API call.'
pubDate: '2026-06-01'
heroImage: '../../../assets/blog/vitest-4-ai-agent-testing-patterns-2026/vitest-4-ai-agent-testing-patterns-2026-hero.png'
tags: ['Vitest', 'AI Agent', 'TypeScript']
relatedPosts:
  - slug: 'vitest-4-jest-migration-guide-2026'
    score: 0.93
    reason:
      ko: 'Jest에서 Vitest로 넘어온 뒤 AI 에이전트 코드를 테스트해야 한다면, 마이그레이션 과정에서 달라진 모킹 API부터 확인하는 것이 순서다.'
      ja: 'JestからVitestに移行した後でAIエージェントのコードをテストするなら、マイグレーションで変わったモッキングAPIを先に確認するのが順番だ。'
      en: 'If you migrated from Jest to Vitest and now need to test AI agent code, checking the updated mocking API from the migration guide is the right first step.'
      zh: '从 Jest 迁移到 Vitest 之后需要测试 AI 代理代码，先了解迁移中变化的 mocking API 是正确的顺序。'
  - slug: 'vercel-ai-sdk-claude-streaming-agent-2026'
    score: 0.82
    reason:
      ko: 'Vercel AI SDK로 스트리밍 에이전트를 구현했다면, 이 글에서 다루는 async function* 모킹 패턴으로 스트리밍 응답을 테스트하는 방법이 바로 필요해진다.'
      ja: 'Vercel AI SDKでストリーミングエージェントを実装したなら、この記事のasync function*モッキングパターンでストリーミングレスポンスをテストする方法がすぐ必要になる。'
      en: 'Once you build a streaming agent with Vercel AI SDK, the async function* mocking pattern in this article for testing streaming responses becomes immediately relevant.'
      zh: '用 Vercel AI SDK 实现流式代理后，这篇文章的 async function* 模拟模式来测试流式响应就立即派上用场了。'
  - slug: 'claude-agent-sdk-tool-use-complete-guide-2026'
    score: 0.78
    reason:
      ko: 'Tool Use 에이전틱 루프를 구현했다면, 도구 호출 시퀀스를 모킹하여 단위 테스트하는 패턴이 이 글에서 다루는 classifyIntent 테스트와 같은 구조를 따른다.'
      ja: 'Tool Useエージェンティックループを実装したなら、ツール呼び出しシーケンスをモッキングして単体テストするパターンが、この記事のclassifyIntentテストと同じ構造になる。'
      en: 'If you implemented a Tool Use agentic loop, the pattern for mocking tool call sequences in unit tests follows the same structure as the classifyIntent tests in this article.'
      zh: '实现 Tool Use 代理循环后，用模拟工具调用序列进行单元测试的模式，与这篇文章中 classifyIntent 测试的结构相同。'
  - slug: 'mcp-server-typescript-sdk-step-by-step-2026'
    score: 0.71
    reason:
      ko: 'MCP 서버를 TypeScript로 만들었다면, 도구 핸들러 함수도 Vitest로 단위 테스트할 수 있다. 이 글의 모킹 패턴을 MCP 도구 핸들러에 그대로 적용하면 된다.'
      ja: 'TypeScriptでMCPサーバーを作ったなら、ツールハンドラー関数もVitestで単体テストできる。この記事のモッキングパターンをMCPツールハンドラーにそのまま適用すればよい。'
      en: 'If you built an MCP server in TypeScript, the tool handler functions can be unit tested with Vitest. The mocking patterns in this article apply directly to MCP tool handlers.'
      zh: '如果用 TypeScript 构建了 MCP 服务器，工具处理函数也可以用 Vitest 进行单元测试。这篇文章的模拟模式可以直接应用于 MCP 工具处理程序。'
---

At some point when writing AI agent code, testing comes to a halt. Without an `ANTHROPIC_API_KEY`, the code won't even run. With one, every test run costs money. And how do you test streaming responses at all? That moment of uncertainty is exactly when most developers abandon test coverage for their agent code.

This article collects the patterns that solve those problems. I verified everything in a sandbox against Vitest 4.1.7 and `@anthropic-ai/sdk 0.100.1`. The result: 9 tests pass **without a single API call, in 142ms**.

## Why Testing AI Agents Is Tricky

Code that calls an LLM has a few characteristics that differ from ordinary functions.

First, it **depends on external state.** The same input can produce different outputs. The most basic assumption of unit testing — "same input → same output" — doesn't hold. Second, **streaming responses are `AsyncIterable`.** An object consumed with `for await...of` can't be faked with a simple `mockResolvedValue()`. Third, **the SDK's default export is a class.** `new Anthropic()` creates an instance, and intercepting that with `vi.mock()` has one specific trap.

Let me work through all three in order.

## Project Structure

The minimal setup I confirmed in the sandbox:

```
my-agent/
├── package.json          # "type": "module" is required
├── src/
│   ├── agent.js          # Subject under test: agent wrapping Anthropic SDK
│   └── __tests__/
│       └── agent.test.js # Vitest test file
└── node_modules/
```

Without `"type": "module"`, `vi.mock()` hoisting may not behave as expected in certain setups.

```bash
npm install vitest@4 @anthropic-ai/sdk --save-dev
# Installs Vitest 4.1.7, @anthropic-ai/sdk 0.100.1
```

## Pattern 1 — The Right Way to Mock a Class Constructor

This is the most common sticking point. When mocking the Anthropic class with `vi.mock()`, you **must use the `function` keyword.** Using an arrow function triggers this error:

```
TypeError: () => ({ ... }) is not a constructor
```

JavaScript arrow functions have no prototype, so they can't be called with `new`. If you pass an arrow function to `vi.fn().mockImplementation()`, calling `new Anthropic()` crashes at runtime.

```javascript
// ❌ This gives TypeError
vi.mock("@anthropic-ai/sdk", () => {
  const MockAnthropic = vi.fn().mockImplementation(() => ({
    messages: { create: mockCreate }
  }));
  return { default: MockAnthropic };
});

// ✅ function keyword allows new to work
const mockCreate = vi.fn();
const mockStream = vi.fn();

vi.mock("@anthropic-ai/sdk", () => {
  const MockAnthropic = vi.fn().mockImplementation(function () {
    this.messages = {
      create: mockCreate,
      stream: mockStream,
    };
  });
  return { default: MockAnthropic };
});
```

Declaring `mockCreate` and `mockStream` outside `vi.mock()` lets each test reset them with `beforeEach(() => vi.clearAllMocks())` while reusing the same references.

## Pattern 2 — Testing a Simple API Call

The most basic pattern for testing `messages.create()`:

```javascript
it("returns content and token counts from the API", async () => {
  mockCreate.mockResolvedValue({
    content: [{ type: "text", text: "Hello, I am an AI assistant." }],
    usage: { input_tokens: 15, output_tokens: 8 },
  });

  const agent = createAgent("test-key");
  const result = await agent.chat("Say hello");

  expect(result.content).toBe("Hello, I am an AI assistant.");
  expect(result.inputTokens).toBe(15);
  expect(result.outputTokens).toBe(8);
  expect(mockCreate).toHaveBeenCalledOnce();
});
```

You can also verify the arguments passed to the API:

```javascript
it("passes the system prompt correctly to the API", async () => {
  mockCreate.mockResolvedValue({
    content: [{ type: "text", text: "Arrr, I be a pirate!" }],
    usage: { input_tokens: 20, output_tokens: 6 },
  });

  const agent = createAgent("test-key");
  await agent.chat("Who are you?", "You are a pirate. Respond in pirate speak.");

  const callArgs = mockCreate.mock.calls[0][0];
  expect(callArgs.system).toBe("You are a pirate. Respond in pirate speak.");
  expect(callArgs.messages[0].content).toBe("Who are you?");
  expect(callArgs.model).toBe("claude-haiku-4-5-20251001");
});
```

## Pattern 3 — Mocking Streaming Responses with async function* Generators

This is the core of the article. Anthropic SDK's `messages.stream()` returns `AsyncIterable<MessageStreamEvent>`. There's no way to reproduce that with `mockResolvedValue()`.

![Streaming response mocking code — async function* generator pattern](../../../assets/blog/vitest-4-ai-agent-testing-patterns-2026/vitest-4-ai-agent-testing-patterns-2026-stream-mock.png)

The solution is an `async function*` generator. Pass `mockReturnValue(fakeStream())` to return a generator instance, and `for await...of` will consume exactly the events you want.

```javascript
it("yields only text_delta chunks from the stream", async () => {
  // async generator that accurately reproduces the Anthropic SSE stream
  async function* fakeStream() {
    yield { type: "message_start", message: { usage: { input_tokens: 10 } } };
    yield { type: "content_block_start", content_block: { type: "text", text: "" } };
    yield { type: "content_block_delta", delta: { type: "text_delta", text: "Hello" } };
    yield { type: "content_block_delta", delta: { type: "text_delta", text: " world" } };
    yield { type: "content_block_delta", delta: { type: "text_delta", text: "!" } };
    yield { type: "message_delta", delta: { stop_reason: "end_turn" } };
    yield { type: "message_stop" };
  }

  mockStream.mockReturnValue(fakeStream());  // mockReturnValue, not mockResolvedValue

  const agent = createAgent("test-key");
  const chunks = [];

  for await (const chunk of agent.stream("Stream test")) {
    chunks.push(chunk);
  }

  expect(chunks).toEqual(["Hello", " world", "!"]);
  expect(chunks.join("")).toBe("Hello world!");
});
```

One detail: use `mockReturnValue(fakeStream())`, not `mockResolvedValue()`. Using the latter causes `for await...of` to try consuming a Promise and fail.

Filtering works the same way. A real Anthropic stream contains events beyond `text_delta` (images, tool calls, etc.), so verifying that the agent filters them correctly matters.

```javascript
it("filters out non-text-delta events from the stream", async () => {
  async function* fakeStream() {
    yield { type: "content_block_delta", delta: { type: "text_delta", text: "Text only" } };
    yield { type: "content_block_delta", delta: { type: "image_delta", data: "base64..." } };
    yield { type: "message_stop" };
  }

  mockStream.mockReturnValue(fakeStream());

  const agent = createAgent("test-key");
  const chunks = [];

  for await (const chunk of agent.stream("Non-text events test")) {
    chunks.push(chunk);
  }

  expect(chunks).toEqual(["Text only"]); // image_delta is filtered out
});
```

## Pattern 4 — Testing an LLM-Based Classifier

Using an LLM as a classifier is a common pattern — things like "is this user message a question or a command?" delegated to the model. This is the hardest to test because LLM output isn't always predictable.

I ran into a similar problem while [building a streaming agent with Vercel AI SDK](/en/blog/en/vercel-ai-sdk-claude-streaming-agent-2026). The key is separating the classifier logic from the LLM call, then testing each independently.

```javascript
// Agent code: normalize LLM output to uppercase, only allow known values
async function classifyIntent(text) {
  const result = await chat(
    `Classify: "${text}". Return only: QUESTION, COMMAND, FEEDBACK, OTHER.`,
    "You are an intent classifier."
  );

  const category = result.content.trim().toUpperCase();
  const validCategories = ["QUESTION", "COMMAND", "FEEDBACK", "OTHER"];
  return validCategories.includes(category) ? category : "OTHER";
}
```

This structure lets you test three cases independently:

```javascript
// Case 1: Normal classification
it("returns QUESTION for a question-type intent", async () => {
  mockCreate.mockResolvedValue({
    content: [{ type: "text", text: "QUESTION" }],
    usage: { input_tokens: 30, output_tokens: 1 },
  });

  const agent = createAgent("test-key");
  const category = await agent.classifyIntent("What is the weather today?");

  expect(category).toBe("QUESTION");
});

// Case 2: Lowercase normalization
it("normalizes lowercase classifier output to uppercase", async () => {
  mockCreate.mockResolvedValue({
    content: [{ type: "text", text: "command" }],  // LLMs sometimes respond in lowercase
    usage: { input_tokens: 25, output_tokens: 1 },
  });

  const agent = createAgent("test-key");
  const category = await agent.classifyIntent("Run the tests");

  expect(category).toBe("COMMAND");
});

// Case 3: Fallback for unexpected output
it("falls back to OTHER for unrecognized classifier output", async () => {
  mockCreate.mockResolvedValue({
    content: [{ type: "text", text: "I cannot determine the category." }],
    usage: { input_tokens: 30, output_tokens: 8 },
  });

  const agent = createAgent("test-key");
  const category = await agent.classifyIntent("some ambiguous text");

  expect(category).toBe("OTHER");
});
```

What I like about this pattern is that it **forces you to write defensive logic** so the system doesn't break when the LLM responds in an unexpected format. Without tests, the fallback case is easy to overlook.

## Actual Run Output

From my sandbox:

```bash
$ npx vitest run --reporter=verbose

 RUN  v4.1.7 /tmp/jangwook-blog-lab

 ✓ Agent.chat() › returns content and token counts from the API        1ms
 ✓ Agent.chat() › passes the system prompt correctly to the API        0ms
 ✓ Agent.chat() › handles empty content array gracefully               0ms
 ✓ Agent.stream() › yields only text_delta chunks from the stream      1ms
 ✓ Agent.stream() › filters out non-text-delta events from the stream  0ms
 ✓ Agent.stream() › handles an empty stream                            0ms
 ✓ Agent.classifyIntent() › returns QUESTION for question intent       0ms
 ✓ Agent.classifyIntent() › normalizes lowercase to uppercase          0ms
 ✓ Agent.classifyIntent() › falls back to OTHER for unknown output     0ms

 Test Files  1 passed (1)
      Tests  9 passed (9)
   Start at  15:25:23
   Duration  142ms
```

No API calls, no environment variables, 142ms. Real Claude API calls take at minimum a few hundred milliseconds including network latency — none of that overhead is necessary at the unit test level.

## Limits of This Approach

I should be honest about the limitations too.

**Divergence from real API behavior is possible.** If SDK internals change, the event structure that `fakeStream()` reproduces needs to be updated. As I found when working through the [Claude Agent SDK Tool Use guide](/en/blog/en/claude-agent-sdk-tool-use-complete-guide-2026), stream event formats shift slightly as SDK versions increment.

**Edge cases need E2E tests.** Rate limits, network timeouts, and token overflows are hard to reproduce accurately with mocks. Keeping unit tests focused on business logic while maintaining a separate integration test suite using the real API is the practical approach.

**`vi.mock()` hoisting order requires attention.** Vitest hoists `vi.mock()` to the top of the file. If the declaration position of mocking variables and the position of `vi.mock()` calls are misaligned, you'll get unexpected `undefined` references.

## Summary

Three things to remember when mocking the Anthropic SDK with Vitest 4:

1. **`vi.fn().mockImplementation(function() {...})`** — For class mocks called with `new`, the `function` keyword is non-negotiable
2. **`async function*` generator** — For streaming response mocks, use `mockReturnValue(fakeStream())`
3. **`beforeEach(() => vi.clearAllMocks())`** — Preventing state pollution between tests is essential

If you're using TypeScript, combining the [MCP server TypeScript tutorial](/en/blog/en/mcp-server-typescript-sdk-step-by-step-2026) patterns with the ones in this article puts your entire AI agent codebase — including MCP tool handlers — under unit test coverage.

The most common reason AI agent code has no tests is simply "I didn't know how to mock this." I hope these patterns lower that barrier.
