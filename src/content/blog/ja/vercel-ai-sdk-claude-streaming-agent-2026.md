---
title: Vercel AI SDKでClaudeストリーミングエージェントを作る
description: >-
  Vercel AI SDK v6 + @ai-sdk/anthropicでNext.js App
  RouterからClaudeストリーミングチャットとツール呼び出しエージェントを実装する実践ガイド。streamText、generateObject、ツールループパターンをコードで学ぶ。
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
  prompt: 'こんにちは、ストリーミングテストです',
});

for await (const chunk of result.textStream) {
  process.stdout.write(chunk);
}
```

このコードを初めて実行したときの感覚が意外と複雑だった。Claudeからテキストが一文字ずつ出力されることが驚きではなく、これが5行で実現できるという事実に戸惑った。Anthropic SDKを直接使う場合と比べると、設定コードが半分以下だ。

Vercel AI SDKを初めて知ったのは、社内のSlackで誰かがシェアしたリンクだった。「Next.jsでAIチャットを10分で」という類いのタイトルだったが、実際にやってみると依存パッケージのインストール段階でつまずくことが多い。半信半疑で試してみたら、実際に速かった。それ以来、プロトタイピング時によく使うようになった。

Vercel AI SDKを本格的に使ってみると、長所と短所がはっきりしていた。この記事では「どう使うか」を説明しながら、詰まった部分も正直に書く。すでに使っている方は「ツール呼び出し」と「本番環境での考慮事項」のセクションから読むといいだろう。

## なぜVercel AI SDKなのか — 他の選択肢と直接比較

他の方法を先に試した。Anthropic SDKの直接使用、LangChain.js、そしてVercel AI SDK。

<strong>Anthropic SDKの直接使用</strong>は最も柔軟だが、ストリーミングレスポンスをフロントエンドに送るボイラープレートが予想より多い。SSEフォーマット処理、フロントエンドフックの実装、エラー処理まですべて手書きが必要だ。機能自体はシンプルなのに、コード行数が不必要に増える。

```typescript
// Anthropic SDKを直接使う場合のストリーミング設定 — これより長くなる
const stream = await anthropic.messages.stream({
  model: 'claude-sonnet-4-6',
  max_tokens: 1024,
  messages: [{ role: 'user', content: prompt }],
});

// SSEレスポンスを手動で構成
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

これをフロントでパースするコードも加えると、かなりの量になる。細かい制御が必要な場合はこれが正しい方法だが、チャットアプリ一つ作るにはオーバーヘッドが大きすぎる。

<strong>LangChain.js</strong>は使ってみて途中でやめた。バージョン間でAPIの変更が多く、ドキュメントが実際の動作と違うケースが何度もあった。GitHubのIssueを調べると「この機能は削除されました」という回答がよく出てくる。複雑なパイプラインには合うかもしれないが、素早いプロトタイピングには向いていない。

Vercel AI SDKの実質的なメリットは三つだ：

第一に、`streamText()` + `useChat()` の組み合わせで、サーバー・クライアント間のストリーミング接続が10行以内で完成する。第二に、Claude以外にもOpenAI、Gemini、Mistralへの切り替えがproviderの一行変更でできる。これは思ったより便利で、同じコードでモデル間の結果を比較できる。第三に、`generateObject()` でZodスキーマベースの構造化出力処理がすっきりしている。

デメリットもある。Vercelプラットフォームに最適化されているため、他のデプロイ環境では制約が生じる。エージェントループの細かい制御が必要な場合、Anthropic SDKを直接使うより拡張性が落ちる部分がある。この点については後で具体的に説明する。

[Claude Managed Agentsを直接構築する方法](/ja/blog/ja/claude-managed-agents-production-deployment-guide)と比べると、Managed Agentsはインフラなしで始めやすいが、カスタマイズの限界が明確だった。Vercel AI SDKはその中間にある — 直接実装より抽象化されていて、Managed Agentsより制御権が多い。

## 環境設定 — パッケージインストールから

<strong>前提条件</strong>：
- Node.js 20+
- Anthropic APIキー（`ANTHROPIC_API_KEY`）
- Next.js 15（App Router）

```bash
# 新規プロジェクト
npx create-next-app@latest my-claude-app --typescript --app
cd my-claude-app

# AISDKコアパッケージをインストール
npm install ai @ai-sdk/anthropic zod
```

`.env.local`にAPIキーを追加する：

```bash
ANTHROPIC_API_KEY=sk-ant-api03-...
```

実際に試したとき、`@ai-sdk/anthropic`のインストールは問題なかったが、TypeScriptの型エラーが一つ出た。`tsconfig.json`の`moduleResolution`が`bundler`または`node16`以上である必要がある。`create-next-app`で作成した場合はデフォルト設定で解決されている。

ディレクトリ構造はこのように設定した：

```
app/
├── api/
│   ├── chat/
│   │   └── route.ts      # ストリーミングチャットAPI
│   └── extract/
│       └── route.ts      # generateObject API
├── page.tsx              # チャットUI
└── components/
    └── Message.tsx
```

複雑に見えないのが正しい。実際にこの構造で十分機能するチャットアプリが完成する。

## streamTextでClaudeストリーミングを実装する

サーバーサイドのAPIルートを先に作る。

`app/api/chat/route.ts`：

```typescript
import { streamText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: anthropic('claude-sonnet-4-6'),
    system: `あなたは親切な技術ブログアシスタントです。
コードの質問に実用的に回答し、わからないことは正直に言います。
回答は簡潔に保ちながら、重要な内容は漏らしません。`,
    messages,
    maxTokens: 2048,
    temperature: 0.7,
  });

  return result.toUIMessageStreamResponse();
}
```

`toUIMessageStreamResponse()`がポイントだ。このメソッド一つがSSEヘッダー設定、チャンクフォーマット、ストリーム終了処理をすべて担う。Anthropic SDKを直接使う場合にこの部分を実装すると20行は必要になる。

フロントエンド `app/page.tsx`：

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
            何かお手伝いできますか？
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
              {m.role === 'user' ? '自分' : 'Claude'}
            </p>
            <div className="whitespace-pre-wrap text-sm">
              {m.content as string}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="bg-gray-100 p-3 rounded-lg text-gray-400 text-sm">
            Claudeが入力中...
          </div>
        )}
        {error && (
          <div className="text-red-500 text-sm p-2 bg-red-50 rounded">
            エラー: {error.message}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 mt-4 border-t pt-4">
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="メッセージを入力してください..."
          className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg disabled:opacity-50"
        >
          送信
        </button>
      </form>
    </div>
  );
}
```

`useChat`がメッセージ状態管理、ストリーミング更新、ローディング状態、エラー処理をすべて担う。直接実装すると`useState`、`useRef`、`AbortController`、SSEパース、リトライロジックなど相当な量になる。

`npm run dev`を実行すると`localhost:3000`でチャットが動く。Claudeがタイピングするようにテキストが流れてくる。

## ツール呼び出し — Claudeに実際に何かをさせる

チャット以上のことをさせたい場合、`tools`オプションと`maxSteps`を追加する。

```typescript
import { streamText, tool } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { z } from 'zod';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: anthropic('claude-sonnet-4-6'),
    system: '天気情報とToDoリストを管理するアシスタントです。',
    messages,
    maxSteps: 5,
    tools: {
      getWeather: tool({
        description: '特定の都市の現在の天気を取得します',
        parameters: z.object({
          city: z.string().describe('天気を取得する都市名'),
          unit: z.enum(['celsius', 'fahrenheit']).default('celsius'),
        }),
        execute: async ({ city, unit }) => {
          // 実際の実装では天気APIを呼び出す
          return {
            city,
            temperature: unit === 'celsius' ? 22 : 72,
            condition: '晴れ',
            humidity: 65,
            feelsLike: unit === 'celsius' ? 20 : 68,
          };
        },
      }),
      addTodo: tool({
        description: 'ToDoリストに新しい項目を追加します',
        parameters: z.object({
          title: z.string().describe('ToDoのタイトル'),
          priority: z.enum(['low', 'medium', 'high']).default('medium'),
          dueDate: z.string().optional().describe('期限（YYYY-MM-DD）'),
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

`maxSteps: 5`が重要だ。ツール呼び出しの結果を受け取った後、Claudeが再び応答を生成するループを回すために必要だ。設定しないと、ツール呼び出し結果を受け取ってもClaudeがそれ以上応答を生成しない。

[AIエージェントが複数のツールを組み合わせて作業するパターン](/ja/blog/ja/ai-agent-collaboration-patterns)は、`maxSteps`設定と各ツールの`description`の品質に大きく依存する。ツールの説明が曖昧だと、Claudeがいつどのツールを使うべきか判断できない。実際に最初は天気とToDoが混乱するケースがあったが、システムプロンプトに各ツールの使用シナリオを明記したら安定した。

フロントエンドでツール呼び出しの進行状況をリアルタイムで表示することもできる：

```tsx
{messages.map((m) => (
  <div key={m.id}>
    {m.role === 'assistant' &&
      Array.isArray(m.toolInvocations) &&
      m.toolInvocations.map((ti) => (
        <div key={ti.toolCallId} className="text-xs text-gray-400 italic mb-1">
          {ti.state === 'call' && `⚙ ${ti.toolName} 呼び出し中...`}
          {ti.state === 'result' && `✓ ${ti.toolName} 完了`}
        </div>
      ))
    }
    <div className="text-sm">{m.content as string}</div>
  </div>
))}
```

## generateObjectで構造化出力を抽出する

ストリーミングチャットとは別に、Claudeのレスポンスから特定の構造のデータを抽出する場合は`generateObject()`を使う。

```typescript
// app/api/extract/route.ts
import { generateObject } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { z } from 'zod';

const ArticleMetaSchema = z.object({
  title: z.string().describe('記事タイトル（60字以内）'),
  summary: z.string().max(300).describe('3〜4文の要約'),
  tags: z.array(z.string()).min(2).max(5).describe('関連技術タグ'),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  estimatedReadTime: z.number().int().describe('推定読了時間（分）'),
  hasCodeExamples: z.boolean(),
  mainTopics: z.array(z.string()).max(3).describe('主要トピック3つ以内'),
});

export async function POST(req: Request) {
  const { content } = await req.json();

  try {
    const { object } = await generateObject({
      model: anthropic('claude-sonnet-4-6'),
      schema: ArticleMetaSchema,
      prompt: `以下の技術ブログ記事を分析し、メタデータを抽出してください。
主な読者はバックエンド/フルスタック開発者です。

---
${content}
---`,
    });

    return Response.json(object);
  } catch (error) {
    return Response.json({ error: '分析失敗' }, { status: 500 });
  }
}
```

レスポンスはZodスキーマに合わせて型が保証されたオブジェクトとして返ってくる。JSONパースエラーや型不一致を別途処理する必要がない。

このパターンが適している場面：
- ブログ記事の自動タグ付けとメタデータ生成
- ユーザー入力の分類
- 長いドキュメントからの構造化情報抽出
- フォームの自動入力

このブログのカテゴリスコア抽出で実際に同様のパターンを使っている。Zodスキーマに`describe()`をしっかり書くことが出力品質を上げるための鍵だ。[コンテキストエンジニアリングをきちんと適用すれば](/ja/blog/ja/context-engineering-production-ai-agents)、スキーマ設計とプロンプト品質が抽出精度の80%を決める。

## 本番環境で遭遇した問題

ある程度使っていると、いくつかの制約が出てくる。

<strong>Edgeランタイムの制限</strong>

Vercel Edge Functionsで動かすと、Node.js専用パッケージが使えない。`@ai-sdk/anthropic`はEdgeで動くが、ツール関数内でNode.js専用パッケージをインポートするとデプロイ時にエラーになる。

```typescript
// route.tsの先頭に明示的に宣言
export const runtime = 'nodejs'; // EdgeではなくNode.jsランタイムを使用
```

ほとんどの場合、`runtime = 'nodejs'`にしておくのが楽だ。

<strong>サーバーレスのタイムアウト</strong>

Vercel無料プランでサーバーレス関数のタイムアウトは10秒だ。Claudeが長いテキストを生成したり、複雑なツールループを回したりすると超過することがある。Proプラン以上なら60秒まで延びる。

これより長い作業が必要なら構造自体を変える必要がある。[MCPサーバーを別途構築して長時間実行タスクを分離する方法](/ja/blog/ja/mcp-server-build-practical-guide-2026)が一つの代替案だ。

<strong>コンテキストの累積コスト</strong>

会話が長くなるにつれて、コンテキストにすべてのメッセージ履歴が入るためトークンコストが急増する。`streamText`の結果から使用量を確認できる：

```typescript
const result = streamText({ ... });

result.usage.then((usage) => {
  const inputCost = (usage.promptTokens / 1_000_000) * 3.0;
  const outputCost = (usage.completionTokens / 1_000_000) * 15.0;
  console.log(`トークン: 入力 ${usage.promptTokens}, 出力 ${usage.completionTokens}`);
  console.log(`コスト: $${(inputCost + outputCost).toFixed(5)}`);
});
```

実際のサービスではコンテキスト管理戦略が必要だ。最も単純な方法は最近のN件だけ保持すること：

```typescript
// 最近10ターンだけ渡す
const recentMessages = messages.slice(-20);

const result = streamText({
  model: anthropic('claude-sonnet-4-6'),
  messages: recentMessages,
});
```

<strong>レートリミット</strong>

Anthropic APIのレートリミットに引っかかると`429 Too Many Requests`エラーが出る。複数ユーザーが同時に使う環境ではリクエストキューやバックオフロジックが必要だ。`ai`パッケージ自体にリトライロジックはないため、直接実装するかミドルウェアが必要になる。

## どんな状況で使うべきか

Vercel AI SDKが向いている場合：

- Next.jsベースでAIチャット機能を素早く追加したいとき
- Claude、OpenAI、Geminiなど複数のモデルを同じコードでテストしたいとき
- `useChat`フックでフロントの状態管理を最小化したいとき
- Vercelにデプロイ予定で、タイムアウト制限が問題にならない規模のとき

使わない方がいい場合：

- エージェントループの細かい動作を完全に制御する必要があるとき — Anthropic SDKの直接使用が良い
- Pythonバックエンドと連携する必要があるとき — このSDKはTypeScript専用だ
- ユーザーごとに数十ターン以上の長期会話が基本となるサービス — コンテキスト管理戦略が必須

個人的には、新しいAI機能アイデアを検証するスピードが速いという点でよく使う。アイデアを30分以内に動くプロトタイプにできることは確かなメリットだ。ただし、本番環境レベルになると細かい制御が必要な部分が必ず出てくる。そのときはAnthropic SDKを直接使うか、このSDKの上にレイヤーを追加する選択が必要になる。

Vercel AI SDKは利便性と柔軟性のトレードオフを選択した。そのトレードオフが多くのユースケースに合うが、すべてに合うわけではない。「これで始めて、必要なら変える」という姿勢が現実的だ。

---

次に試したいのはAI SDK 6で追加されたhuman-in-the-loopのツール承認フローだ。エージェントが特定のツールを呼び出す前に人間が承認できる構造で、これが実際に本番環境でどれほど信頼できるかはまだ確認が必要だ。完全自律エージェントと手動作業の中間点を見つけることが、2026年のエージェント開発の核心課題の一つだ。
