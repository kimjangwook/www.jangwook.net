---
title: 【緊急】OpenClawにClaude Opus 4.6を設定する方法
description: Claude Opus 4.6をOpenClawで使うための設定方法を解説。100万トークンコンテキスト、128K出力を活かすための設定をそのまま使えます。
pubDate: '2026-02-06'
heroImage: ../../../assets/blog/openclaw-opus-4-6-setup-guide-hero.jpg
tags:
  - openclaw
  - claude-opus
  - ai-tools
  - configuration
relatedPosts:
  - slug: claude-code-insights-usage-analysis
    score: 0.94
    reason:
      ko: '자동화, AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: 'Covers similar topics in automation, AI/ML with comparable difficulty.'
      zh: 在自动化、AI/ML领域涵盖类似主题，难度相当。
  - slug: greptile-ai-coding-report-2025-review
    score: 0.94
    reason:
      ko: '자동화, AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: 'Covers similar topics in automation, AI/ML with comparable difficulty.'
      zh: 在自动化、AI/ML领域涵盖类似主题，难度相当。
  - slug: mcp-servers-toolkit-introduction
    score: 0.94
    reason:
      ko: '자동화, AI/ML, DevOps 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、DevOps分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, DevOps with comparable
        difficulty.
      zh: 在自动化、AI/ML、DevOps领域涵盖类似主题，难度相当。
  - slug: openai-agentkit-tutorial-part1
    score: 0.94
    reason:
      ko: '자동화, AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: 'Covers similar topics in automation, AI/ML with comparable difficulty.'
      zh: 在自动化、AI/ML领域涵盖类似主题，难度相当。
  - slug: anthropic-agent-skills-practical-guide
    score: 0.92
    reason:
      ko: '다음 단계 학습으로 적합하며, 자동화, AI/ML, DevOps 주제에서 연결됩니다.'
      ja: 次のステップの学習に適しており、自動化、AI/ML、DevOpsのトピックで繋がります。
      en: >-
        Suitable as a next-step learning resource, connecting through
        automation, AI/ML, DevOps topics.
      zh: 适合作为下一步学习资源，通过自动化、AI/ML、DevOps主题进行连接。
---

## なぜ「緊急」なのか

2026年2月5日、AnthropicがClaude Opus 4.6をリリースした。<strong>100万トークンコンテキスト</strong>、<strong>128Kトークン出力</strong>、強化された計画力と自己修正能力。

OpenClawユーザーなら、今すぐ設定して使い始めたいはずだ。

この記事では、<strong>設定ファイルをそのままコピペして即座に動かせる</strong>最短手順を紹介する。

## 前提条件

- OpenClawがインストール済み（`npm install -g openclaw@latest`）
- Anthropic APIキーが設定済み（`claude setup-token`）

まだの場合は[公式ドキュメント](https://docs.openclaw.ai/start/getting-started)を参照。

## 設定ファイルの編集

`~/.openclaw/openclaw.json` を開き、以下の2つのセクションを追加・変更する。

### 1. models — Opus 4.6モデルの定義

```json
"models": {
  "mode": "merge",
  "providers": {
    "anthropic": {
      "baseUrl": "https://api.anthropic.com",
      "api": "anthropic-messages",
      "models": [
        {
          "id": "claude-opus-4-6",
          "name": "Claude Opus 4.6",
          "reasoning": true,
          "input": ["text", "image"],
          "contextWindow": 1000000,
          "maxTokens": 128000
        }
      ]
    }
  }
}
```

<strong>ポイント</strong>:
- `mode: "merge"` — OpenClawの組み込みモデルカタログに<strong>追加</strong>する（置き換えではない）
- `reasoning: true` — Opus 4.6の推論モードを有効化
- `contextWindow: 1000000` — 100万トークンのフルコンテキスト
- `maxTokens: 128000` — 128Kトークンのロング出力

### 2. agents — デフォルトモデルの指定

```json
"agents": {
  "defaults": {
    "model": {
      "primary": "anthropic/claude-opus-4-6",
      "fallbacks": [
        "anthropic/claude-opus-4-5"
      ]
    },
    "contextTokens": 1000000
  }
}
```

<strong>ポイント</strong>:
- `primary` — すべてのセッションでOpus 4.6をデフォルト使用
- `fallbacks` — Opus 4.6が利用不可時にOpus 4.5にフォールバック
- `contextTokens: 1000000` — エージェントが100万トークンのコンテキストをフル活用

## 設定の適用

設定を保存したら、<strong>2つのステップ</strong>が必要だ。

### Step 1: Gatewayを再起動

```bash
openclaw gateway restart
```

これで設定ファイルが再読み込みされる。

### Step 2: 新しいセッションを開始

既存のセッションには旧モデル設定が残っている。チャットで以下を送信：

```
/new
```

または `/reset` でもOK。<strong>新しいセッションを開始しないと、新モデルが適用されない。</strong>

## 設定の確認

正しく設定されたか確認する：

```bash
openclaw models status
```

`anthropic/claude-opus-4-6` がprimaryモデルとして表示されれば成功。

チャット内からも確認可能：

```
/model status
```

## まとめ

1. `openclaw.json` の `models` と `agents` セクションを編集
2. `openclaw gateway restart` で再起動
3. `/new` で新セッション開始
4. `openclaw models status` で確認

以上。100万トークンコンテキストの世界へようこそ。

## 参考資料

- [OpenClaw公式ドキュメント — Models](https://docs.openclaw.ai/concepts/models)
- [OpenClaw公式ドキュメント — Model Providers](https://docs.openclaw.ai/concepts/model-providers)
- [OpenClaw GitHub](https://github.com/openclaw/openclaw)
- [Anthropic公式 — Claude Opus 4.6](https://www.anthropic.com)
