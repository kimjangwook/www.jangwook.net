---
title: Mastra.ai 実践ガイド — TypeScriptでAIエージェントを5分で動かす方法
description: >-
  Mastra.ai TypeScript AIエージェントフレームワークを実際にインストールしてGoogle
  Geminiと連携し、天気エージェントを作ってみた。インストールから実際のツール呼び出しまでの実験記録。
pubDate: '2026-06-14'
heroImage: ../../../assets/blog/mastra-ai-typescript-agent-framework-guide-2026-hero.jpg
tags:
  - mastra
  - typescript
  - ai-agent
  - gemini
  - llm
relatedPosts:
  - slug: ai-agent-cost-reality
    score: 0.9
    reason:
      ko: ai-agent 주제를 한 단계 더 깊이 파고드는 글입니다.
      en: Goes one level deeper into ai-agent.
      ja: ai-agentをもう一歩深く掘り下げた記事です。
      zh: 更深入地探讨 ai-agent 主题。
  - slug: dena-llm-study-part1-fundamentals
    score: 0.85
    reason:
      ko: LLM를 실제로 다뤄본 경험이 이어지는 글입니다.
      en: Continues the hands-on LLM experience.
      ja: LLMを実際に扱った経験が続く記事です。
      zh: 延续 LLM 的实战经验。
  - slug: dena-llm-study-part3-model-training
    score: 0.8
    reason:
      ko: 같은 LLM 흐름에서 함께 읽으면 좋습니다.
      en: Worth reading alongside this in the same LLM track.
      ja: 同じLLMの流れで併せて読むと役立ちます。
      zh: 在同一 LLM 脉络中可一并阅读。
faq:
  - question: "Mastra.aiはどんなフレームワークですか?"
    answer: "Gatsby.jsチームが作ったTypeScript-firstのAIエージェントフレームワークで、エージェント・ワークフロー・メモリ・オブザーバビリティを単一のSDKで提供します。内部ではVercel AI SDKを基盤に動作し、2026年1月にv1.0をリリースしました。"
  - question: "本当に5分でエージェントを動かせますか?"
    answer: "npm create mastra@latestでのインストールは約2〜3分、最初のエージェント実行まで含めても5〜10分程度です。Google Gemini連携の天気エージェントはソウルと東京の天気比較を約5.8秒で返しました。"
  - question: "MastraでMemoryを使うには何が必要ですか?"
    answer: "MemoryにはLibSQLやDuckDBといったストレージバックエンドの設定が必須です。エージェントを単独で使いながらMemoryを含めると、Memory requires a storage providerというエラーが発生します。"
  - question: "どのLLMプロバイダーに対応していますか?"
    answer: "OpenAI、Anthropic、Google Gemini、Meta LlamaなどVercel AI SDKが対応するほぼすべてのモデルを使えます。modelフィールドの文字列を変えるだけでプロバイダーが切り替わるので、google/gemini-2.5-flashをanthropic/claude-sonnet-4-6に差し替えても動きます。"
---

「TypeScript開発者ならLangChain.jsかVercel AI SDKくらいしか選択肢がない」。JavaScriptでAIエージェントを作ろうとするたびに、この話を聞かされてきた。自分もとくに疑わずに受け入れていた。そんなとき今年1月にMastra.aiを知った。YC W25バッチから$13Mを調達してv1.0をリリースしたフレームワークだ。

名前だけは知っていたが、実際に触ったことはなかった。今日、思い切ってインストールした。Google Geminiと連携させて、ツール呼び出しができるエージェントを動かしてみた。「5分で動く」という売り文句、本当かどうかが気になっていた。

## Mastra.aiとは何か

MastraはGatsby.jsチームが作ったTypeScript-first AIエージェントフレームワークだ。2024年10月に公開され、15ヶ月でGitHub stars 22,000個、週次npmダウンロード30万件を超え、2026年1月にv1.0をリリースした。

核心となるポジションは「エージェント、ワークフロー、メモリ、オブザーバビリティを1つのSDKで」提供するというものだ。LangChainが様々なパッケージの組み合わせだとすれば、Mastraは単一スタックで完結するアプローチを選んだ。

対応LLMプロバイダはOpenAI、Anthropic、Google Gemini、Meta Llamaなど、Vercel AI SDKがサポートするほぼ全てのモデルだ。内部でVercel AI SDKを基盤として使っているため、Vercel AI SDKでClaudeストリーミングエージェントを作った経験があれば、基盤レイヤーはすでに知っている計算になる。

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

## 今この時点でMastraを試す価値はあるか

個人的にはYesと思う。ただし条件付きだ。

TypeScriptで新しいエージェントプロジェクトを始めるなら、Mastraは確実に検討する価値がある。インストールから最初のエージェント実行まで5〜10分。フレームワーク構造も迷うところがない。

しかしプロダクションに今すぐ投入するにはエコシステムがまだ薄い。v1リリースから半年も経っていないため、API安定性を完全に信頼するのは早い。サイドプロジェクトや社内ツールなら今すぐ使っていい。プロダクションサービスならv1.5あたりで再評価する、というのが今の判断だ。

```bash
# 始め方
npm create mastra@latest my-agent-app -- --components agents,tools --llm google --example
cd my-agent-app
# .envにGOOGLE_API_KEYを追加
npm run dev
# → http://localhost:4111 でMastra Studioが開く
```
