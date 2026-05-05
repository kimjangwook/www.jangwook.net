---
title: Anthropic Batches API 実践ガイド — LLMコストを50%削減する方法
description: >-
  Anthropic Message Batches
  APIで最大100,000件のリクエストを単一バッチで処理し、コストを50%削減する方法をコード例とともに解説。Prompt
  Cachingとの組み合わせで最大95%削減も可能。
pubDate: '2026-04-28'
heroImage: ../../../assets/blog/anthropic-message-batches-api-production-guide-hero.png
tags:
  - Claude API
  - LLMコスト最適化
  - Anthropic
relatedPosts:
  - slug: mcp-server-build-practical-guide-2026
    score: 0.95
    reason:
      ko: 'AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: 'Covers similar topics in AI/ML, architecture with comparable difficulty.'
      zh: 在AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: claude-mythos-preview-glasswing-ai-cybersecurity
    score: 0.94
    reason:
      ko: 'AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: 'Covers similar topics in AI/ML, architecture with comparable difficulty.'
      zh: 在AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: greptile-ai-coding-report-2025-review
    score: 0.94
    reason:
      ko: AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.
      ja: AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: Covers similar topics in AI/ML with comparable difficulty.
      zh: 在AI/ML领域涵盖类似主题，难度相当。
  - slug: anthropic-claude-performance-decline-controversy-april-2026
    score: 0.94
    reason:
      ko: 'AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: 'Covers similar topics in AI/ML, architecture with comparable difficulty.'
      zh: 在AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: llm-api-pricing-comparison-2026-gpt5-claude-gemini-deepseek
    score: 0.94
    reason:
      ko: 'AI/ML, DevOps 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: AI/ML、DevOps分野で類似したトピックを扱い、同程度の難易度です。
      en: 'Covers similar topics in AI/ML, DevOps with comparable difficulty.'
      zh: 在AI/ML、DevOps领域涵盖类似主题，难度相当。
---

LLM APIのコストが過小評価されるのは、たいていスケールが大きくなった時だ。小規模のPOCでは見えなかったコストが、月数十万件のリクエストが積み重なると請求書で初めて正確に見えてくる。AnthropicのMessage Batches APIは、まさにその問題を狙い撃ちにした機能だ。単一のAPI呼び出しで最大100,000件のリクエストをまとめ、コストを半分に引き下げる。

初めてこの機能に触れたとき、「結局は非同期キューをAPIにしたもの」と思った。その判断は半分正しく、半分間違いだった。設計上のいくつかの決定が、単純なキューとは異なる挙動をする。この記事でその違いを整理し、実際に使えるコードとともに解説する。

## Message Batches APIとは何か

Anthropic Message Batches APIは、複数の独立したClaudeメッセージリクエストをまとめて非同期で処理するインターフェースだ。REST APIと公式SDK（Python、TypeScript/Node.js）の両方が対応している。

**エンドポイント構造:**

```
POST /v1/messages/batches          → バッチ作成
GET  /v1/messages/batches/{id}     → ステータス確認
GET  /v1/messages/batches/{id}/results → 結果ストリーミング
POST /v1/messages/batches/{id}/cancel  → キャンセル
GET  /v1/messages/batches          → 一覧取得（ページネーション）
```

**コスト**: 入力・出力トークンとも標準料金の**50%割引**が適用される。全対応モデルに一律適用。

| モデル | Batch入力 | Batch出力 | 標準入力 | 標準出力 |
|------|-----------|-----------|---------|---------|
| Claude Opus 4.7 | $2.50/MTok | $12.50/MTok | $5.00/MTok | $25.00/MTok |
| Claude Sonnet 4.6 | $1.50/MTok | $7.50/MTok | $3.00/MTok | $15.00/MTok |
| Claude Haiku 4.5 | $0.50/MTok | $2.50/MTok | $1.00/MTok | $5.00/MTok |

**処理時間**: ほとんどのバッチは1時間以内に完了する。最大タイムアウトは24時間。タイムアウトを超えた場合、期限切れのリクエストは**課金されない**。

**スケール制限**: バッチあたり最大100,000件または256MB、どちらか先に達した方が上限。結果は作成後29日間保存される。

## いつBatches APIが正解か

このAPIが適した場面とそうでない場面がはっきりしている。誤って適用するとUXが悪化する。

**Batches APIが適した場面:**

- **大規模評価（evals）パイプライン**: 数千のテストケースを夜間バッチで実行する場合
- **オフラインコンテンツ生成**: 商品説明10万件、記事要約5万件のような大量処理
- **データ分析・分類**: ユーザー生成コンテンツの大量処理、感情分析
- **夜間ETLパイプライン**: 翌朝に結果が必要なログ分析
- **モデル出力比較**: A/Bテスト目的の大規模実験

**Batches APIが適さない場面:**

- ユーザーがリアルタイムで応答を待つチャットインターフェース
- ストリーミング（SSE）が必要な場合 — Batches APIはストリーミング非対応
- 数十msのレイテンシが必要なリアルタイム推薦システム

判断基準をひとつの質問にまとめると：「このレスポンスを24時間以内に受け取れれば十分か？」そうならBatches APIを検討する価値がある。

## 実践コード: Node.js SDKでバッチ実装

サンドボックスで`@anthropic-ai/sdk`をインストールし、構造を検証した。APIキーなしで実行すると`AuthenticationError (401)`が返ってきた — エンドポイントが実在し、リクエストが実際にサーバーに届いていることを意味する。

```bash
$ npm install @anthropic-ai/sdk
```

### バッチ作成

```javascript
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const batchRequests = products.map((p) => ({
  custom_id: p.id,          // 重要: 結果マッピングに使用する一意のID
  params: {
    model: "claude-haiku-4-5",
    max_tokens: 200,
    system: "You are a concise product copywriter.",
    messages: [
      {
        role: "user",
        content: `Write a 2-sentence description for: ${p.name}`,
      },
    ],
  },
}));

const batch = await client.messages.batches.create({
  requests: batchRequests,
});

console.log(`Batch created: ${batch.id}`);
// → msgbatch_01ABCDEF...
console.log(`Request counts:`, batch.request_counts);
// → { processing: 3, succeeded: 0, errored: 0, canceled: 0, expired: 0 }
```

`custom_id`は見た目は地味だが、実際には最も重要な設計上の決定のひとつだ。**結果の順序は保証されない**。1,000件送ると結果が任意の順序で返ってくる。配列インデックスでリクエストと結果をマッピングすると、データが静かに混在する。`custom_id`だけが安全だ。

### ポーリングで完了を待つ

```javascript
async function waitForBatch(client, batchId) {
  while (true) {
    const batch = await client.messages.batches.retrieve(batchId);
    const { processing, succeeded, errored, expired } = batch.request_counts;
    
    console.log(
      `[${new Date().toISOString()}] status=${batch.processing_status}` +
      ` | processing=${processing} succeeded=${succeeded}`
    );
    
    if (batch.processing_status === "ended") return batch;
    await new Promise((r) => setTimeout(r, 30_000)); // 30秒間隔
  }
}
```

### 結果ストリーミング処理

```javascript
async function processResults(client, batchId) {
  const results = new Map();
  
  for await (const result of await client.messages.batches.results(batchId)) {
    if (result.result.type === "succeeded") {
      results.set(result.custom_id, {
        text: result.result.message.content[0].text,
        usage: result.result.message.usage,
      });
    } else if (result.result.type === "errored") {
      console.error(`Error: ${result.custom_id}`, result.result.error);
    } else if (result.result.type === "expired") {
      console.warn(`Expired (not billed): ${result.custom_id}`);
    }
  }
  
  return results;
}
```

`client.messages.batches.results()`はJSONLストリームをメモリに全部ロードせず、1行ずつ処理する。100,000件の結果を一度に配列で受け取ると数百MBになりかねない。ストリーミング方式が正しい選択だ。

## コスト計算: 実際にいくら節約できるか

![Batches API処理フローとコスト削減構造](../../../assets/blog/anthropic-message-batches-api-flow-diagram.png)

**シナリオ**: Claude Haiku 4.5で商品説明10万件を生成。リクエストあたり平均200入力トークン + 150出力トークン。

```
標準API:
  入力: 100,000 × 200t = 20 MTok × $1.00 = $20.00
  出力: 100,000 × 150t = 15 MTok × $5.00 = $75.00
  合計: $95.00

Batches API:
  入力: 20 MTok × $0.50 = $10.00
  出力: 15 MTok × $2.50 = $37.50
  合計: $47.50

節約額: $47.50（50.0%）
```

Prompt Cachingと組み合わせると、キャッシュヒットした入力トークンにさらに90%割引が適用される。[Prompt Cachingガイド](/ja/blog/ja/claude-api-prompt-caching-cost-optimization-guide)で紹介した手法と組み合わせると、Batch割引（50%）+ キャッシュ割引（90%）で**最大95%削減**も現実的だ。

## 知っておくべき制約と落とし穴

**結果の順序は保証されない。**
必ず`custom_id`でマッピングすること。

```javascript
// ❌ 間違い — インデックス依存
const textsArray = [];
for await (const result of await client.messages.batches.results(batchId)) {
  textsArray.push(result.result.message.content[0].text);
}
// textsArray[0]が最初のリクエストの結果とは限らない

// ✅ 正しい方法 — custom_idベースのMap
const resultsMap = new Map();
for await (const result of await client.messages.batches.results(batchId)) {
  if (result.result.type === "succeeded") {
    resultsMap.set(result.custom_id, result.result.message.content[0].text);
  }
}
```

**処理中のバッチは変更不可。**
送信後に変更するにはキャンセルして再送信が必要。事前に小規模テスト（10件以下）で構造を確認してから大規模に拡張するのが安全。

**キュー上限はリクエスト数基準。**
Tier 1は最大100,000件、Tier 2は200,000件、Tier 3は300,000件、Tier 4は500,000件が処理中キューに入れられる。

**期限切れリクエストは課金されない。**
24時間を超えると`expired`状態になり、コストは発生しない。ただし結果もないため再処理が必要。ピーク時間帯は2,000〜5,000件単位に分割が安全。

**結果保存は29日間。**
29日後は結果ファイルにアクセスできなくなる。完了直後に別のストレージ（S3、DB等）にコピーしておくこと。

**Webhookがない。**
これが最もストレスポイントだ。バッチ完了を通知するコールバックがなく、ポーリングでしか状態を確認できない。TemporalやAirflowのようなワークフローオーケストレーターと連携すると、この問題をきれいに解決できる。

## 高度な使い方: 300K出力トークンBeta

2026年3月に静かに追加された機能だ。`anthropic-beta: output-300k-2026-03-24`ヘッダーを付けると、レスポンスあたり最大300,000トークンまで生成できる。標準Messages APIではまだ不可能で、**Batches APIのみ対応**。

```javascript
const batch = await client.messages.batches.create(
  {
    requests: [{
      custom_id: "long-doc",
      params: {
        model: "claude-sonnet-4-6",
        max_tokens: 300_000,
        messages: [{ role: "user", content: "Write a comprehensive technical spec..." }],
      },
    }],
  },
  { headers: { "anthropic-beta": "output-300k-2026-03-24" } }
);
```

ただし300Kトークンの生成には**1時間以上**かかる可能性がある。本の1章分に相当する技術文書の生成や大規模なコードスキャフォールディングに有用だ。

## いつ使い、いつ使わないか — 私の判断

```
リアルタイムレスポンスが必要か?
  → YES: 標準Messages API
  → NO: バッチサイズが100件以上か?
          → YES: 24時間の遅延が許容できるか?
                    → YES: Batches API
                    → NO: 標準API（順次実行）
          → NO: 標準API（オーバーヘッドに見合わない）
```

100件未満のバッチは正直あまり効果がない。ポーリングのオーバーヘッドがあるため、処理量が少ない場合は標準APIをそのまま順次実行する方が速いこともある。

[異種LLMフリートコスト最適化](/ja/blog/ja/heterogeneous-llm-agent-fleet-cost-optimization)で紹介したように、高価なモデル（Opus）はバッチで夜間処理し、安価で高速なモデル（Haiku）はリアルタイムで使うハイブリッド戦略が効果的だ。私が実際にプロジェクトで推薦するパターンでもある。

Webhookの不在と進捗ダッシュボードの欠如は引き続きストレスだが、プロダクションに使い始めても十分に安定している。

## まとめ

Anthropic Message Batches APIは「あれば便利」な機能ではなく、大量LLM処理があるプロジェクトならほぼ必須で検討すべきインフラツールだ。設計もシンプルで、SDK対応も充実しており、50%削減がすぐに反映される。

注意すべき点は`custom_id`ベースのマッピングとWebhookの不在だ。この2点を設計段階で適切に考慮すれば、残りはドキュメントとSDKで十分にカバーされる。

次のステップとして、Prompt CachingとBatches APIを組み合わせて実際のパイプラインに適用してみることを勧める。両方の手法を同時に適用すると、コスト削減幅がバッチ単体のときより期待以上に出る。
