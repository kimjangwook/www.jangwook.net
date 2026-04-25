---
title: Gemini 3.1 Flash Liveでリアルタイム音声エージェントを作る — 使ってみた感想
description: >-
  Googleが公開したGemini 3.1 Flash
  Liveのリアルタイム音声・映像エージェント構築機能を分析します。API構造、ツール呼び出し、90言語対応など、開発者視点で可能性と限界を探ります。
pubDate: '2026-03-28'
heroImage: ../../../assets/blog/gemini-31-flash-live-realtime-voice-agent-hero.jpg
tags:
  - ai
  - google
  - voice-agent
  - realtime
  - gemini
  - api
relatedPosts:
  - slug: data-driven-pm-framework
    score: 0.95
    reason:
      ko: 'AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: 'Covers similar topics in AI/ML, architecture with comparable difficulty.'
      zh: 在AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: meta-ai-agent-platform-sierra-avocado
    score: 0.95
    reason:
      ko: '자동화, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, architecture with comparable
        difficulty.
      zh: 在自动化、AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: ai-agent-kpi-ethics
    score: 0.94
    reason:
      ko: 'AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: 'Covers similar topics in AI/ML, architecture with comparable difficulty.'
      zh: 在AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: ai-agent-persona-analysis
    score: 0.94
    reason:
      ko: 'AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: 'Covers similar topics in AI/ML, architecture with comparable difficulty.'
      zh: 在AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: anthropic-agent-skills-standard
    score: 0.94
    reason:
      ko: '자동화, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, architecture with comparable
        difficulty.
      zh: 在自动化、AI/ML、架构领域涵盖类似主题，难度相当。
draft: true
---

Google AI Studioで新しいモデル名が目に入りました。`gemini-3.1-flash-live-preview`。「また一つ出たか」とスルーしようとしてスペックシートを開き、手が止まりました。音声入力を受けて音声で直接応答するモデルで、しかもツール呼び出し（function calling）がリアルタイム会話中にできるとのこと。3月26日に公開されたこのモデルを1日触ってみた感想をまとめます。

## 何が変わったのか

前モデルの2.5 Flash Native Audioと比較して、核心的な変化は3つです。

**第一に、レイテンシが大幅に減少しました。** Googleは具体的な数値を公開していませんが、「fewer awkward pauses」と表現しており、実際に使ってみると応答開始までの体感遅延が明らかに短くなっています。

**第二に、会話コンテキストが2倍に拡大しました。** 入力トークン131,072個。長い会議の録音を丸ごと入れてリアルタイムで質問するシナリオが現実的になりました。

**第三に、ツール呼び出しがリアルタイム会話中に動作します。** ComplexFuncBench Audioベンチマークで90.8%を記録しました。音声で「今日の東京の天気を教えて」と言えば、モデルが関数を呼び出し、結果を音声で返す流れが一つのストリーム内で完結します。

## API構造の概要

| 項目 | スペック |
|------|---------|
| モデルID | `gemini-3.1-flash-live-preview` |
| 入力 | テキスト、画像、音声、動画 |
| 出力 | テキスト、音声 |
| 入力トークン | 131,072 |
| 出力トークン | 65,536 |
| Function Calling | 対応 |
| Thinking | 対応 (minimal/low/medium/high) |
| Search Grounding | 対応 |
| 対応言語 | 90以上 |

`thinkingLevel`パラメータが面白いです。`minimal`に設定するとレイテンシを最小化し、`high`にすると複雑な推論が可能になる代わりに応答が遅くなります。音声エージェントの特性上、デフォルトが`minimal`なのも合理的です。

## 実際に触ってみた感想

Google AI StudioでLive APIを有効にし、マイクを接続すればすぐに会話が可能です。私が最も印象的だったのは、別途インフラなしにブラウザで音声エージェントのプロトタイプをすぐに作れるという点です。日本語で話してみましたが、認識率はかなり良好でした。ただし、長い文で時々途中が切れる現象があり、バックグラウンドノイズのフィルタリングは確実に以前より改善されていました。

Function callingを組み合わせて簡単な天気APIを連携してみました。音声でリクエストすると関数が呼び出され、結果が音声で返ってきます。このプロセスが一つのWebSocketセッション内でシームレスに行われるのが核心です。ただし、非同期関数呼び出しはまだサポートされていません。外部APIの応答が遅いと、ユーザーは沈黙に耐えなければなりません。[Vercel AI SDKでストリーミングエージェントを構築](/ja/blog/ja/vercel-ai-sdk-claude-streaming-agent-2026)する際も、非同期ツール呼び出しの処理がUXの核心課題の一つです。

## 2.5からの移行時の注意点

既存の2.5 Flash Native Audioを使っていたプロジェクトをアップグレードする際、いくつかの変更があります。

- モデル文字列の更新（`gemini-3.1-flash-live-preview`）
- Thinking設定方式の変更（`thinkingLevel`パラメータを使用）
- サーバーイベント一つに複数のcontent partが含まれる可能性 — パース処理の修正が必要
- 非同期function callingは引き続き未対応

## 正直な限界

正直に言って、いくつか残念な点があります。

**Structured Output非対応。** 音声エージェントといっても、バックエンドではJSONで受け取りたいケースが多いです。現在はテキスト＋音声出力のみ可能で、後処理が必要です。

**キャッシング非対応。** リアルタイム会話の特性上、同じ質問が繰り返されることがありますが、キャッシングができないとコストが積み重なります。プロダクションでは前段に独自キャッシュレイヤーを設ける必要があるでしょう。

**プレビュー段階の不安定性。** Rate limitがいくらなのか、価格がいくらなのか、まだ明確ではありません。プロダクションに投入するには時期尚早です。

**競合状況。** OpenAIのRealtime APIもすでに類似機能を提供しており、Anthropicも音声インターフェースを準備中という噂があります。Flash Liveが「最も優れている」と断定できる比較ベンチマークがまだ不足しています。[AIエージェント通信プロトコルの比較](/ja/blog/ja/mcp-vs-a2a-vs-open-responses-agent-protocol-comparison-2026)と同様に、最適なスタックはユースケースによって異なります。

## どこで使えるか

現実的にすぐ適用可能なシナリオ：

- **社内音声FAQボット**: 営業チームが製品スペックを音声で質問すればすぐに回答。Function callingで社内DB連携。[MetaがSierraと構築するエンタープライズエージェントプラットフォーム](/ja/blog/ja/meta-ai-agent-platform-sierra-avocado)が目指す方向とも重なります。
- **多言語カスタマーサポート**: 90言語対応なのでグローバルサービスの一次対応に有用。ただし品質は言語ごとにばらつきがあるでしょう。
- **リアルタイム会議アシスタント**: 長いコンテキストウィンドウを活用し、会議中にリアルタイムで要約やアクションアイテム抽出。

一方、医療相談や金融取引のような高信頼性シナリオにはまだ無理があります。プレビューモデルのハルシネーションリスクを受け入れるべき領域ではありません。

## まとめ

Gemini 3.1 Flash Liveは「音声エージェントを作るハードル」をかなり下げてくれたモデルです。特にツール呼び出しがリアルタイム音声ストリームに統合された点は、前世代との決定的な違いです。ただし、プレビュー段階のため価格・安定性・制約事項がまだ不透明で、structured outputやキャッシングといったプロダクション必須機能が欠けています。

私はこのモデルが「音声AIエージェントのプロトタイピングツール」としては現時点で最もアクセスしやすい選択肢だと考えています。プロダクションはGA以降に再評価すべきですが、今すぐGoogle AI Studioでマイクをオンにして可能性を確認してみる価値は十分にあります。
