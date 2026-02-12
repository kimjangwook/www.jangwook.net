---
title: 'URGENT: How to Set Up Claude Opus 4.6 on OpenClaw'
description: >-
  Configure Claude Opus 4.6 on OpenClaw with copy-paste settings. Unlock 1M
  token context and 128K output for your AI assistant.
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

## Why "URGENT"

On February 5, 2026, Anthropic released Claude Opus 4.6. <strong>1 million token context</strong>, <strong>128K token output</strong>, enhanced planning and self-correction capabilities.

If you're an OpenClaw user, you want to set this up right now.

This post gives you the <strong>shortest path to a working setup — copy, paste, and go.</strong>

## Prerequisites

- OpenClaw installed (`npm install -g openclaw@latest`)
- Anthropic API key configured (`claude setup-token`)

If not, see the [official docs](https://docs.openclaw.ai/start/getting-started).

## Editing the Config File

Open `~/.openclaw/openclaw.json` and add or modify these two sections.

### 1. models — Define Opus 4.6

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

<strong>Key points</strong>:
- `mode: "merge"` — <strong>adds</strong> to OpenClaw's built-in model catalog (doesn't replace it)
- `reasoning: true` — enables Opus 4.6 reasoning mode
- `contextWindow: 1000000` — full 1M token context
- `maxTokens: 128000` — 128K token long output

### 2. agents — Set the Default Model

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

<strong>Key points</strong>:
- `primary` — uses Opus 4.6 as default for all sessions
- `fallbacks` — falls back to Opus 4.5 when Opus 4.6 is unavailable
- `contextTokens: 1000000` — lets the agent use the full 1M context

## Applying the Config

After saving, <strong>two steps</strong> are required.

### Step 1: Restart the Gateway

```bash
openclaw gateway restart
```

This reloads the config file.

### Step 2: Start a New Session

Existing sessions retain the old model config. Send this in chat:

```
/new
```

Or `/reset`. <strong>The new model won't apply until you start a new session.</strong>

## Verify the Setup

Check if the config is correct:

```bash
openclaw models status
```

If `anthropic/claude-opus-4-6` shows as the primary model, you're good.

You can also check from within chat:

```
/model status
```

## Summary

1. Edit the `models` and `agents` sections in `openclaw.json`
2. Run `openclaw gateway restart`
3. Start a new session with `/new`
4. Verify with `openclaw models status`

That's it. Welcome to the world of 1 million token context.

## References

- [OpenClaw Docs — Models](https://docs.openclaw.ai/concepts/models)
- [OpenClaw Docs — Model Providers](https://docs.openclaw.ai/concepts/model-providers)
- [OpenClaw GitHub](https://github.com/openclaw/openclaw)
- [Anthropic — Claude Opus 4.6](https://www.anthropic.com)
