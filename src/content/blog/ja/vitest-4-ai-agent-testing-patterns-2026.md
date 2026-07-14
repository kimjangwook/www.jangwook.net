---
title: 'Vitest 4でAIエージェントをテストする — LLM呼び出しモック、ストリーミングレスポンステストの実践パターン'
description: 'Vitest 4.1.7でAnthropic SDKのmessages.create()とストリーミングレスポンスをモッキングする実践パターンを直接検証した。vi.fn().mockImplementation(function(){...})がアロー関数と異なる理由、async function*ジェネレーターでSSEストリームを再現する方法まで、9テストが142ms以内に通過する過程をステップバイステップで解説する。'
pubDate: '2026-06-01'
heroImage: '../../../assets/blog/vitest-4-ai-agent-testing-patterns-2026/vitest-4-ai-agent-testing-patterns-2026-hero.png'
tags: ['Vitest', 'AIエージェント', 'TypeScript']
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

AIエージェントのコードを書いていると、あるタイミングでテストが止まる。`ANTHROPIC_API_KEY`がなければそもそも実行できないし、あればAPIコストがかかる。ストリーミングレスポンスはどうテストするのか。そう思った瞬間にテスト作成を諦めてしまうことが多い。

この記事はその問題を解決する実践パターンをまとめたものだ。Vitest 4.1.7と`@anthropic-ai/sdk 0.100.1`を基準に、実際にサンドボックスでコードを動かして確認した内容だ。結論から言うと: 9つのテストが**APIコールなし、142ms**で通過する。

## なぜAIエージェントのテストが難しいのか

LLMを呼び出すコードには、通常の関数とは異なる特性がいくつかある。

第一に、**外部状態に依存する。** 同じ入力でも応答が変わりうる。ユニットテストの最も基本的な前提である「同じ入力→同じ出力」が成立しない。第二に、**ストリーミングレスポンスは`AsyncIterable`だ。** `for await...of`で消費するオブジェクトをVitestでモッキングするには、通常の`mockResolvedValue()`では足りない。第三に、**SDKのデフォルトエクスポートはクラスだ。** `new Anthropic()`でインスタンスを生成するが、これを`vi.mock()`でインターセプトするには一つ落とし穴がある。

この3つの問題を順番に解決していく。

## プロジェクト構造

サンドボックスで確認した最小構成だ。

```
my-agent/
├── package.json          # "type": "module" 必須
├── src/
│   ├── agent.js          # テスト対象: Anthropic SDKをラップするエージェント
│   └── __tests__/
│       └── agent.test.js # Vitestテストファイル
└── node_modules/
```

`"type": "module"`がないと`vi.mock()`のホイスティングが期待通りに動かないケースがある。

```bash
npm install vitest@4 @anthropic-ai/sdk --save-dev
# Vitest 4.1.7, @anthropic-ai/sdk 0.100.1 インストール
```

## パターン1 — クラスコンストラクタを正しくモッキングする方法

これが最もよく詰まるポイントだ。`vi.mock()`でAnthropicクラスをモッキングするとき、**必ず`function`キーワードを使わなければならない。** アロー関数で書くと以下のエラーが出る。

```
TypeError: () => ({ ... }) is not a constructor
```

JavaScriptではアロー関数にはprototypeがないため、`new`で呼び出すことができない。`vi.fn().mockImplementation()`の中にアロー関数を渡すと、`new Anthropic()`の瞬間にランタイムエラーが発生する。

```javascript
// ❌ これだとTypeError
vi.mock("@anthropic-ai/sdk", () => {
  const MockAnthropic = vi.fn().mockImplementation(() => ({
    messages: { create: mockCreate }
  }));
  return { default: MockAnthropic };
});

// ✅ functionキーワードならnewで呼び出せる
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

`mockCreate`と`mockStream`を`vi.mock()`の外で宣言しておけば、各テストで`beforeEach(() => vi.clearAllMocks())`で初期化しながら再利用できる。

## パターン2 — 単純なAPI呼び出しテスト

`messages.create()`をテストする最も基本的なパターンだ。

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

引数の検証も追加できる。

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

## パターン3 — async function* ジェネレーターでストリーミングレスポンスをモッキング

これがこの記事の核心だ。Anthropic SDKの`messages.stream()`は`AsyncIterable<MessageStreamEvent>`を返す。これは`mockResolvedValue()`では再現できない。

![ストリーミングレスポンスモッキングコード — async function* ジェネレーターパターン](../../../assets/blog/vitest-4-ai-agent-testing-patterns-2026/vitest-4-ai-agent-testing-patterns-2026-stream-mock.png)

解決策は`async function*`ジェネレーター関数だ。`mockReturnValue(fakeStream())`でジェネレーターインスタンスを返すと、`for await...of`が正確に望むイベントを消費する。

```javascript
it("yields only text_delta chunks from the stream", async () => {
  // Anthropic SSEストリームを正確に再現するasync generator
  async function* fakeStream() {
    yield { type: "message_start", message: { usage: { input_tokens: 10 } } };
    yield { type: "content_block_start", content_block: { type: "text", text: "" } };
    yield { type: "content_block_delta", delta: { type: "text_delta", text: "Hello" } };
    yield { type: "content_block_delta", delta: { type: "text_delta", text: " world" } };
    yield { type: "content_block_delta", delta: { type: "text_delta", text: "!" } };
    yield { type: "message_delta", delta: { stop_reason: "end_turn" } };
    yield { type: "message_stop" };
  }

  mockStream.mockReturnValue(fakeStream());  // ResolvedではなくmockReturn

  const agent = createAgent("test-key");
  const chunks = [];

  for await (const chunk of agent.stream("Stream test")) {
    chunks.push(chunk);
  }

  expect(chunks).toEqual(["Hello", " world", "!"]);
  expect(chunks.join("")).toBe("Hello world!");
});
```

注意点: `mockReturnValue(fakeStream())`を使う必要がある。`mockResolvedValue()`を使うと`for await...of`がPromiseを消費しようとして型エラーになる。

フィルタリングもテストできる。

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

  expect(chunks).toEqual(["Text only"]); // image_deltaはフィルタリングされる
});
```

## パターン4 — LLMベースの分類器(Classifier)テスト

LLMを分類器として使うパターンは一般的だ。「このユーザーメッセージは質問か、命令か」といった判断をモデルに委ねる方式だが、これがテストの難易度が一番高い。LLMの出力が常に予測可能ではないからだ。

[Vercel AI SDKでストリーミングエージェントを実装する過程](/ja/blog/ja/vercel-ai-sdk-claude-streaming-agent-2026)でも似た問題を扱ったが、核心は分類器ロジックをLLM呼び出しと切り離して、それぞれをテストすることだ。

```javascript
// エージェントコード: LLM出力を大文字に変換し有効値のみ許可
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

3つのケースを独立してテストできる。

```javascript
// ケース1: 正常な分類
it("returns QUESTION for a question-type intent", async () => {
  mockCreate.mockResolvedValue({
    content: [{ type: "text", text: "QUESTION" }],
    usage: { input_tokens: 30, output_tokens: 1 },
  });

  const agent = createAgent("test-key");
  const category = await agent.classifyIntent("What is the weather today?");

  expect(category).toBe("QUESTION");
});

// ケース2: 小文字の正規化
it("normalizes lowercase classifier output to uppercase", async () => {
  mockCreate.mockResolvedValue({
    content: [{ type: "text", text: "command" }],
    usage: { input_tokens: 25, output_tokens: 1 },
  });

  const agent = createAgent("test-key");
  const category = await agent.classifyIntent("Run the tests");

  expect(category).toBe("COMMAND");
});

// ケース3: 想定外の出力へのフォールバック
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

このパターンが気に入っているのは、**LLMが予期しないフォーマットで応答してもシステムが壊れないよう**防御ロジックを書かせるからだ。テストがなければフォールバックケースを見落とした可能性が高い。

## 実行結果

サンドボックスで実際に動かした結果だ。

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

APIコールなし、環境変数なし、142ms。実際のClaude API呼び出しはネットワークレイテンシを含めて最低数百msから数秒かかるが、ユニットテストの段階ではそれは不要だ。

## このアプローチの限界

このモッキング手法が持つ限界についても正直に言っておく必要がある。

**実際のAPI動作との乖離が生まれる可能性がある。** SDKの内部実装が変わると`fakeStream()`が再現するイベント構造も更新する必要がある。実際に[Claude Agent SDK Tool Use実践ガイド](/ja/blog/ja/claude-agent-sdk-tool-use-complete-guide-2026)で確認したように、SDKバージョンが上がるとストリームイベントフォーマットが少し変わることがある。

**エッジケースはE2Eテストで補う必要がある。** レートリミット、ネットワークタイムアウト、トークン超過といったケースはモッキングでは完全に再現しにくい。ユニットテストはビジネスロジックの検証に集中し、実際のAPIを使う統合テストを別途用意するのが現実的だ。

**`vi.mock()`のホイスティング順序を常に意識する必要がある。** Vitestは`vi.mock()`をファイルの先頭に引き上げる。モッキング変数の宣言位置と`vi.mock()`呼び出しの順序がずれると、予期しない`undefined`参照が発生する。

## まとめ

Vitest 4でAnthropic SDKをモッキングするときに覚えておくべき核心3点だ。

1. **`vi.fn().mockImplementation(function() {...})`** — `new`で呼び出されるクラスモッキングは必ず`function`キーワード
2. **`async function*`ジェネレーター** — ストリーミングレスポンスのモッキングは`mockReturnValue(fakeStream())`
3. **`beforeEach(() => vi.clearAllMocks())`** — テスト間の状態汚染防止は必須

TypeScriptを使っているなら[MCPサーバーTypeScript実践チュートリアル](/ja/blog/ja/mcp-server-typescript-sdk-step-by-step-2026)とこの記事のパターンを組み合わせることで、MCPツールハンドラーを含むAIエージェント全体をユニットテストの下に置くことができる。

AIエージェントコードにテストがない最大の理由が「どうモッキングするかわからない」という場合が多い。上のパターンがその参入障壁を下げることを願っている。
