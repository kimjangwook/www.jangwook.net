---
draft: true
title: '用 Vitest 4 测试 AI 代理 — LLM 调用模拟、流式响应测试实战模式'
description: '我在 Vitest 4.1.7 中直接验证了模拟 Anthropic SDK messages.create() 和流式响应的实战模式。涵盖 vi.fn().mockImplementation(function(){...}) 与箭头函数的区别、用 async function* 生成器重现 SSE 流的方法，以及 9 个测试在 142ms 内通过的完整过程。'
pubDate: '2026-06-01'
heroImage: '../../../assets/blog/vitest-4-ai-agent-testing-patterns-2026/vitest-4-ai-agent-testing-patterns-2026-hero.png'
tags: ['Vitest', 'AI代理', 'TypeScript']
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

写 AI 代理代码到某个节点时，测试就会陷入停滞。没有 `ANTHROPIC_API_KEY` 根本跑不起来，有的话每次测试都要消耗 API 费用。流式响应又该怎么测试？就在这种两难之间，大多数开发者放弃了给代理代码写测试覆盖。

这篇文章整理了解决这些问题的实战模式。我在沙盒中以 Vitest 4.1.7 和 `@anthropic-ai/sdk 0.100.1` 为基准，亲手跑代码验证。结论先说：9 个测试**不调用任何 API，142ms 内全部通过**。

## AI 代理测试为何棘手

调用 LLM 的代码与普通函数有几处本质差异。

第一，**依赖外部状态。** 相同输入可能产生不同输出。单元测试最基本的前提——"同输入→同输出"——在这里不成立。第二，**流式响应是 `AsyncIterable`。** 用 `for await...of` 消费的对象，普通的 `mockResolvedValue()` 无法模拟。第三，**SDK 的默认导出是一个类。** `new Anthropic()` 创建实例时，用 `vi.mock()` 拦截有一个特定陷阱。

下面逐一解决这三个问题。

## 项目结构

在沙盒中确认的最小配置：

```
my-agent/
├── package.json          # "type": "module" 必填
├── src/
│   ├── agent.js          # 测试对象：封装 Anthropic SDK 的代理
│   └── __tests__/
│       └── agent.test.js # Vitest 测试文件
└── node_modules/
```

没有 `"type": "module"` 的话，`vi.mock()` 的提升（hoisting）在某些情况下不会按预期工作。

```bash
npm install vitest@4 @anthropic-ai/sdk --save-dev
# 安装 Vitest 4.1.7，@anthropic-ai/sdk 0.100.1
```

## 模式 1 — 正确模拟类构造函数的方法

这是最常遇到的卡点。用 `vi.mock()` 模拟 Anthropic 类时，**必须使用 `function` 关键字。** 用箭头函数会报如下错误：

```
TypeError: () => ({ ... }) is not a constructor
```

JavaScript 中箭头函数没有 prototype，无法用 `new` 调用。在 `vi.fn().mockImplementation()` 里传入箭头函数，调用 `new Anthropic()` 时就会报运行时错误。

```javascript
// ❌ 这样会 TypeError
vi.mock("@anthropic-ai/sdk", () => {
  const MockAnthropic = vi.fn().mockImplementation(() => ({
    messages: { create: mockCreate }
  }));
  return { default: MockAnthropic };
});

// ✅ function 关键字允许 new 调用
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

在 `vi.mock()` 外部声明 `mockCreate` 和 `mockStream`，每个测试用 `beforeEach(() => vi.clearAllMocks())` 重置，可以复用同一引用。

## 模式 2 — 简单 API 调用测试

测试 `messages.create()` 的最基本模式：

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

也可以验证传给 API 的参数：

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

## 模式 3 — 用 async function* 生成器模拟流式响应

这是本文的核心。Anthropic SDK 的 `messages.stream()` 返回 `AsyncIterable<MessageStreamEvent>`。这无法用 `mockResolvedValue()` 重现。

![流式响应模拟代码 — async function* 生成器模式](../../../assets/blog/vitest-4-ai-agent-testing-patterns-2026/vitest-4-ai-agent-testing-patterns-2026-stream-mock.png)

解决方案是 `async function*` 生成器函数。用 `mockReturnValue(fakeStream())` 返回生成器实例，`for await...of` 就能精确消费所需的事件。

```javascript
it("yields only text_delta chunks from the stream", async () => {
  // 精确再现 Anthropic SSE 流的 async generator
  async function* fakeStream() {
    yield { type: "message_start", message: { usage: { input_tokens: 10 } } };
    yield { type: "content_block_start", content_block: { type: "text", text: "" } };
    yield { type: "content_block_delta", delta: { type: "text_delta", text: "Hello" } };
    yield { type: "content_block_delta", delta: { type: "text_delta", text: " world" } };
    yield { type: "content_block_delta", delta: { type: "text_delta", text: "!" } };
    yield { type: "message_delta", delta: { stop_reason: "end_turn" } };
    yield { type: "message_stop" };
  }

  mockStream.mockReturnValue(fakeStream());  // 用 mockReturnValue，不是 mockResolvedValue

  const agent = createAgent("test-key");
  const chunks = [];

  for await (const chunk of agent.stream("Stream test")) {
    chunks.push(chunk);
  }

  expect(chunks).toEqual(["Hello", " world", "!"]);
  expect(chunks.join("")).toBe("Hello world!");
});
```

注意：必须用 `mockReturnValue(fakeStream())`，用 `mockResolvedValue()` 会导致 `for await...of` 尝试消费 Promise 而报类型错误。

过滤也可以测试。真实的 Anthropic 流中混有 `text_delta` 之外的事件（图片、工具调用等），验证代理是否正确过滤至关重要。

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

  expect(chunks).toEqual(["Text only"]); // image_delta 被过滤掉
});
```

## 模式 4 — 基于 LLM 的分类器测试

将 LLM 用作分类器是常见模式——比如把"这条用户消息是问题还是命令"的判断委托给模型。这是测试难度最高的场景，因为 LLM 输出并不总是可预测的。

我在[用 Vercel AI SDK 构建流式代理](/zh/blog/zh/vercel-ai-sdk-claude-streaming-agent-2026)的过程中遇到了类似问题。核心在于把分类器逻辑与 LLM 调用分离，分别独立测试。

```javascript
// 代理代码：将 LLM 输出转为大写，只允许有效值
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

这种结构可以独立测试三种情况：

```javascript
// 情况 1：正常分类
it("returns QUESTION for a question-type intent", async () => {
  mockCreate.mockResolvedValue({
    content: [{ type: "text", text: "QUESTION" }],
    usage: { input_tokens: 30, output_tokens: 1 },
  });

  const agent = createAgent("test-key");
  const category = await agent.classifyIntent("What is the weather today?");

  expect(category).toBe("QUESTION");
});

// 情况 2：小写标准化
it("normalizes lowercase classifier output to uppercase", async () => {
  mockCreate.mockResolvedValue({
    content: [{ type: "text", text: "command" }],  // LLM 有时会用小写回复
    usage: { input_tokens: 25, output_tokens: 1 },
  });

  const agent = createAgent("test-key");
  const category = await agent.classifyIntent("Run the tests");

  expect(category).toBe("COMMAND");
});

// 情况 3：意外输出的回退
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

我喜欢这个模式的原因是，它**强制你写防御逻辑**，确保 LLM 返回意外格式时系统不会崩溃。没有测试的话，很容易遗漏回退情况。

## 实际运行结果

沙盒中的直接输出：

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

无 API 调用，无环境变量，142ms。真实 Claude API 调用含网络延迟至少需要数百毫秒到数秒，在单元测试阶段完全没必要承担这些开销。

## 这种方式的局限

关于这种模拟方法的局限，也需要坦诚说明。

**可能与真实 API 行为产生偏差。** SDK 内部实现改变时，`fakeStream()` 重现的事件结构也需要更新。正如我在[Claude Agent SDK Tool Use 实战指南](/zh/blog/zh/claude-agent-sdk-tool-use-complete-guide-2026)中发现的，SDK 版本升级时流事件格式会有细微变化。

**边缘情况需要 E2E 测试补充。** 限速、网络超时、Token 超额等情况很难用模拟完全再现。让单元测试专注于业务逻辑验证，另外维护一套使用真实 API 的集成测试，是比较现实的做法。

**必须时刻注意 `vi.mock()` 的提升顺序。** Vitest 会把 `vi.mock()` 提升到文件顶部。如果模拟变量的声明位置和 `vi.mock()` 调用顺序错位，会出现意外的 `undefined` 引用。

## 总结

用 Vitest 4 模拟 Anthropic SDK 时，需要记住的三个核心点：

1. **`vi.fn().mockImplementation(function() {...})`** — 用 `new` 调用的类模拟，必须用 `function` 关键字
2. **`async function*` 生成器** — 流式响应模拟用 `mockReturnValue(fakeStream())`
3. **`beforeEach(() => vi.clearAllMocks())`** — 防止测试间状态污染是必须的

如果你在用 TypeScript，结合 [MCP 服务器 TypeScript 实战教程](/zh/blog/zh/mcp-server-typescript-sdk-step-by-step-2026)中的模式和这篇文章的模式，可以把包括 MCP 工具处理函数在内的整个 AI 代理代码库置于单元测试覆盖之下。

AI 代理代码没有测试，最常见的原因就是"不知道怎么模拟"。希望这些模式能降低这道门槛。
