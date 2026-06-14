---
title: 'Mastra.ai 実践ガイド — TypeScriptでAIエージェントを5分で動かす方法'
description: 'Mastra.ai TypeScript AIエージェントフレームワークを実際にインストールしてGoogle Geminiと連携し、天気エージェントを作ってみた。インストールから実際のツール呼び出しまでの実験記録。'
pubDate: '2026-06-14'
heroImage: '../../../assets/blog/mastra-ai-typescript-agent-framework-guide-2026-hero.jpg'
tags: ['mastra', 'typescript', 'ai-agent', 'gemini', 'llm']
relatedPosts:
  - slug: 'pydantic-ai-type-safe-agent-tutorial-2026'
    score: 0.87
    reason:
      ko: 'PydanticAIが Python でタイプセーフエージェントを実装する方式と Mastra の TypeScript アプローチを比較すると、両フレームワークの設計哲学の違いが明確になる。'
      ja: 'PydanticAIのPythonアプローチとMastraのTypeScript設計を比較すると、両フレームワークの哲学的な違いが見えてくる。'
      en: 'Comparing PydanticAI''s Python approach with Mastra''s TypeScript design reveals the philosophical differences between these two type-safe agent frameworks.'
      zh: '将PydanticAI的Python方式与Mastra的TypeScript设计进行比较，可以清楚地看出两个框架的设计哲学差异。'
  - slug: 'google-adk-vs-langgraph-agent-framework-comparison-2026'
    score: 0.82
    reason:
      ko: 'Google ADKとLangGraphを直接比較した経験があれば、MastraがTypeScriptエコシステムでどう差別化しているかが見えやすい。'
      ja: 'Google ADKとLangGraphを比較した経験があれば、MastraがTypeScriptエコシステムでどう差別化しているかが見えやすい。'
      en: 'Having compared Google ADK and LangGraph directly helps understand how Mastra differentiates itself in the TypeScript ecosystem.'
      zh: '如果你曾比较过Google ADK和LangGraph，就能更好地理解Mastra在TypeScript生态中的差异化定位。'
  - slug: 'python-ai-agent-library-comparison-2026'
    score: 0.79
    reason:
      ko: 'PythonエージェントライブラリをMastraの視点から見ると、TypeScript陣営での同様の試みがどれほど成熟しているかが分かる。'
      ja: 'PythonエージェントライブラリをMastraの視点から見ると、TypeScript陣営での同様の試みがどれほど成熟しているかが分かる。'
      en: 'Viewing Mastra through the lens of Python agent library comparisons helps gauge how mature the TypeScript equivalent has become.'
      zh: '从Python代理库比较的角度来看Mastra，可以衡量TypeScript阵营的类似尝试成熟程度。'
  - slug: 'ai-agent-framework-comparison-2026-langgraph-crewai-dapr-production'
    score: 0.75
    reason:
      ko: 'LangGraph、CrewAI、DaprをプロダクションObserveの観点で比較した場合、Mastraが同じ基準でどの段階にあるかを判断するのに役立つ。'
      ja: 'LangGraph、CrewAI、Daprをプロダクションの観点で比較した場合、Mastraが同じ基準でどの段階にあるかを判断するのに役立つ。'
      en: 'If you''ve compared LangGraph, CrewAI, and Dapr from a production standpoint, this gives useful context for where Mastra stands.'
      zh: '如果你从生产角度比较过LangGraph、CrewAI和Dapr，对于判断Mastra目前处于哪个阶段很有帮助。'
  - slug: 'vercel-ai-sdk-claude-streaming-agent-2026'
    score: 0.72
    reason:
      ko: 'Vercel AI SDKはMastraの基盤レイヤーの一つだ。AI SDKを直接使った経験があればMastraがその上に何を加えているかが理解しやすい。'
      ja: 'Vercel AI SDKはMastraの基盤レイヤーの一つだ。AI SDKを直接使った経験があればMastraがその上に何を加えているかが理解しやすい。'
      en: 'Vercel AI SDK is one of the foundation layers beneath Mastra. Experience with AI SDK directly makes it easier to see what Mastra adds on top.'
      zh: 'Vercel AI SDK是Mastra的基础层之一。有直接使用AI SDK的经验，更容易理解Mastra在其上添加了什么。'
---

JavaScriptエコシステムでAIエージェントを作るとき、「TypeScript開発者ならLangChain.jsかVercel AI SDKくらいしか選択肢がない」という話をよく聞く。自分もそう思っていたが、今年1月にYC W25バッチから$13Mの調達を完了してv1.0をリリースしたMastra.aiを知った。

名前は聞いたことがあったが実際に使ったことはなかった。今日は実際にインストールしてGoogle Geminiと連携し、ツール呼び出しができるエージェントを動かしてみた。「5分で動く」という売り文句が本当かどうか確かめるのが目的だ。

## Mastra.aiとは何か

MastraはGatsby.jsチームが作ったTypeScript-first AIエージェントフレームワークだ。2024年10月に公開され、15ヶ月でGitHub stars 22,000個、週次npmダウンロード30万件を超え、2026年1月にv1.0をリリースした。

核心となるポジションは「エージェント、ワークフロー、メモリ、オブザーバビリティを1つのSDKで」提供するというものだ。LangChainが様々なパッケージの組み合わせだとすれば、Mastraは単一スタックで完結するアプローチを選んだ。

対応LLMプロバイダはOpenAI、Anthropic、Google Gemini、Meta Llamaなど、Vercel AI SDKがサポートするほぼ全てのモデルだ。内部でVercel AI SDKを基盤として使っているため、[Vercel AI SDKでClaudeストリーミングエージェントを作った経験](/ja/blog/ja/vercel-ai-sdk-claude-streaming-agent-2026)があれば、基盤レイヤーはすでに知っている計算になる。

### なぜ今TypeScriptエージェントフレームワークが出てきたのか

正直に言うと、Pythonエージェントライブラリと比べてTypeScript側は常に2〜3年遅れている感じがしていた。LangGraph、CrewAI、PydanticAIはPythonエコシステムで急速に成熟したが、TypeScript陣営はVercel AI SDKレベルに留まっていた。

MastraはそのギャップをTypeScriptで埋めようとする試みだ。過大評価かもしれないと思っていたが、実際に使ってみると思ったより完成度が高かった。もちろん惜しいところもある。

## インストール: `npm create mastra@latest`

公式ドキュメントのクイックスタートに従って進めた。使用環境はNode.js v22.22.0。

```bash
npm create mastra@latest mastra-lab -- --components agents,tools --llm google --example
```

`--components agents,tools`でエージェントとツールコンポーネントを含め、`--llm google`でGoogle GeminiをLLMプロバイダに指定した。`--example`は天気エージェントのサンプルを含む。

インストール完了まで約2〜3分かかった。CLIが次のステップを順番に進めてくれる:

```
◇  Project structure created
◇  npm dependencies installed
◇  Mastra CLI installed
◇  Mastra dependencies installed
◇  .gitignore added
└  Project created successfully

◇  Mastra initialized successfully!

   Rename .env.example to .env
   and add your GOOGLE_API_KEY
```

生成された`package.json`の主要依存関係:

```json
{
  "dependencies": {
    "@mastra/core": "^1.42.0",
    "@mastra/memory": "^1.20.3",
    "@mastra/libsql": "^1.13.0",
    "@mastra/observability": "^1.14.1",
    "zod": "^4.4.3"
  },
  "devDependencies": {
    "typescript": "^6.0.3"
  }
}
```

TypeScript 6.0.3とZod v4を使っている点が目を引く。どちらも2026年上半期にメジャーバージョンを上げたパッケージで、Mastraが最新バージョンを追いかけているのは良いサインだ。

## 生成されたプロジェクト構造

```
mastra-lab/
├── src/
│   └── mastra/
│       ├── index.ts          # Mastraインスタンスの初期化
│       ├── agents/
│       │   └── weather-agent.ts  # エージェント定義
│       └── tools/
│           └── weather-tool.ts   # ツール定義
├── .env.example
├── package.json
└── tsconfig.json
```

レイヤーが明確に分離されている。`agents/`はエージェント定義、`tools/`は外部APIやデータソースとのインターフェース、`index.ts`はそれらを組み合わせたMastraインスタンスだ。

## コード構造: エージェントとツール

生成されたコードを見るとMastraの設計哲学が分かる。

### ツール定義

```typescript
// src/mastra/tools/weather-tool.ts
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

export const weatherTool = createTool({
  id: 'get-weather',
  description: 'Get current weather for a location',
  inputSchema: z.object({
    location: z.string().describe('City name'),
  }),
  outputSchema: z.object({
    temperature: z.number(),
    feelsLike: z.number(),
    humidity: z.number(),
    windSpeed: z.number(),
    conditions: z.string(),
    location: z.string(),
  }),
  execute: async (inputData) => {
    return await getWeather(inputData.location);
  },
});
```

ZodスキーマでI/Oの型を定義する方式は、[PydanticAIのタイプセーフエージェント](/ja/blog/ja/pydantic-ai-type-safe-agent-tutorial-2026)でPydantic BaseModelを使うのと構造的に似ている。言語は違うが「型がすなわちドキュメントであり検証ロジック」という哲学は同じだ。

天気ツールが使うOpen-Meteo APIは無料でAPIキーが不要なのが良い。geocodingで都市名→緯経度に変換し、天気予報APIで現在の天気を取得する仕組みだ。

### エージェント定義

```typescript
// src/mastra/agents/weather-agent.ts
import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { weatherTool } from '../tools/weather-tool';

export const weatherAgent = new Agent({
  id: 'weather-agent',
  name: 'Weather Agent',
  instructions: `You are a helpful weather assistant...`,
  model: 'google/gemini-2.5-pro',
  tools: { weatherTool },
  memory: new Memory(),
});
```

`model`フィールドに`'google/gemini-2.5-pro'`のような文字列を書けば、Mastraが対応するプロバイダのSDKを自動で使う。内部では`@ai-sdk/google`が動いている。

## 実際の実行: ソウルと東京の天気比較

エージェントを実際に動かしてみた。Memoryの設定にはストレージバックエンドが必要なので、まず基本エージェントだけでテストした。

```typescript
const agent = new Agent({
  id: 'weather-agent',
  name: 'Weather Agent',
  instructions: '簡潔に天気情報を提供するアシスタント',
  model: 'google/gemini-2.5-flash',
  tools: { weatherTool },
});

const result = await agent.generate(
  'Compare the current weather in Seoul and Tokyo. Which city is hotter right now?'
);
console.log(result.text);
```

**実行結果（2026-06-14、応答時間: 5866ms）:**

```
It is 27.3°C and feels like 30.1°C in Seoul with mainly clear conditions.
In Tokyo, it is 25.6°C and feels like 27.1°C with overcast conditions.
Seoul is hotter right now.
```

エージェントが2都市に対してそれぞれ`get-weather`ツールを呼び出し、結果をまとめて比較回答を作った。約6秒以内に2回の外部API呼び出しとLLM推論を完了した。

ツール呼び出し自体は正確だった。心配していた点の一つが「都市名を正しく処理できるか」だったが、Seoulをソウルの緯経度（37.566、126.978）に正確に変換した。

### 実行中に遭遇したエラー: Memoryストレージ設定

最初にMemoryを含めて実行すると、このようなエラーが出た:

```
MastraError: Memory requires a storage provider to function.
Add a storage configuration to Memory or to your Mastra instance.
https://mastra.ai/en/docs/memory/overview
```

公式サンプルにはMemoryが含まれているが、Memoryを使うにはLibSQLやDuckDBのようなストレージバックエンドを別途設定する必要がある。このエラーメッセージは初めて使う人には直感的ではない。

## Mastraアーキテクチャの構成要素

![Mastraアーキテクチャ図](../../../assets/blog/mastra-ai-architecture-diagram.png)

Mastraの全体構造は大きく4レイヤーに分かれる:

**1. Agentレイヤー**
LLMを呼び出し、ツール実行の判断をする。一度の`generate()`呼び出しで内部的に複数回LLMとツールを往復できる。

**2. Tools/Integrations**
外部API、データベース、ファイルシステムとのインターフェース。Zodスキーマで型を定義すると、LLMが正しい形式で引数を埋める。

**3. Memoryシステム**
会話履歴、セマンティック検索、ワーキングメモリを管理する。LibSQLやPostgreSQLをストレージとして使う。

**4. Observability**
OpenTelemetryベースでエージェント実行のトレース、スパン、ログを記録する。

## 他フレームワークとの比較

TypeScriptエコシステムでMastraと最も近いのはVercel AI SDKだ。Vercel AI SDKがLLM呼び出しとストリーミングに特化しているなら、Mastraはそのうえにエージェントのライフサイクル管理、メモリ、オブザーバビリティを加えたレイヤーだ。

[Google ADK vs LangGraph比較](/ja/blog/ja/google-adk-vs-langgraph-agent-framework-comparison-2026)では両方ともPython中心だったが、MastraはそのポジションをTypeScriptで狙っている。

| | Mastra | Vercel AI SDK | LangGraph.js |
|---|---|---|---|
| 言語 | TypeScript | TypeScript | TypeScript |
| エージェントループ | ✅ 内蔵 | ⚠️ 手動実装 | ✅ 内蔵 |
| メモリ | ✅ 内蔵（ストレージ必要） | ❌ | ⚠️ 手動実装 |
| ワークフロー | ✅ グラフベース | ❌ | ✅ グラフベース |
| Observability | ✅ OpenTelemetry | ❌ | ⚠️ 外部ツール必要 |
| 学習コスト | 中程度 | 低い | 高い |

## 惜しい点2つ

一つ目はMemoryの設定ハードルだ。先述のようにエージェント単体でMemoryを含めると即座にエラーになる。初めて使う人にはこのエラーメッセージが直感的ではない。公式サンプルコードと実際の単独実行コードの間にギャップがある。

二つ目はMastra Studioがまだプロダクションデプロイの概念と分離している点だ。Studioは開発ツールだが、エージェントを本番にデプロイする方法のドキュメントがまだ薄い。

## まとめ: 今この時点でMastraを試す価値はあるか

個人的にはYesと思う。ただし条件付きだ。

TypeScriptで新しいエージェントプロジェクトを始めるなら、Mastraは確実に検討する価値がある。インストールから最初のエージェント実行まで5〜10分で十分で、フレームワーク構造も明確だ。

しかしプロダクションに今すぐ投入するにはエコシステムがまだ薄い。v1リリースから半年も経っていないため、API安定性を完全に信頼するのは早い。サイドプロジェクトや社内ツールなら今すぐ使っていい。プロダクションサービスならv1.5あたりで再評価する、というのが今の判断だ。

```bash
# 始め方
npm create mastra@latest my-agent-app -- --components agents,tools --llm google --example
cd my-agent-app
# .envにGOOGLE_API_KEYを追加
npm run dev
# → http://localhost:4111 でMastra Studioが開く
```
