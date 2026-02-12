---
title: 【紧急】在OpenClaw中配置Claude Opus 4.6的方法
description: 如何在OpenClaw中配置Claude Opus 4.6。100万token上下文、128K输出的完整配置，直接复制使用。
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

## 为什么是"紧急"

2026年2月5日，Anthropic发布了Claude Opus 4.6。<strong>100万token上下文</strong>、<strong>128K token输出</strong>、增强的规划能力和自我修正能力。

如果你是OpenClaw用户，你一定想立刻配置并开始使用。

这篇文章提供<strong>可以直接复制粘贴就能运行的</strong>最短路径。

## 前提条件

- OpenClaw已安装（`npm install -g openclaw@latest`）
- Anthropic API密钥已配置（`claude setup-token`）

如果还没有，请参考[官方文档](https://docs.openclaw.ai/start/getting-started)。

## 编辑配置文件

打开 `~/.openclaw/openclaw.json`，添加或修改以下两个部分。

### 1. models — 定义Opus 4.6模型

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

<strong>要点</strong>:
- `mode: "merge"` — <strong>追加</strong>到OpenClaw内置模型目录（不是替换）
- `reasoning: true` — 启用Opus 4.6推理模式
- `contextWindow: 1000000` — 100万token完整上下文
- `maxTokens: 128000` — 128K token长输出

### 2. agents — 设置默认模型

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

<strong>要点</strong>:
- `primary` — 所有会话默认使用Opus 4.6
- `fallbacks` — Opus 4.6不可用时回退到Opus 4.5
- `contextTokens: 1000000` — 让代理充分利用100万token上下文

## 应用配置

保存后，需要<strong>两个步骤</strong>。

### Step 1: 重启Gateway

```bash
openclaw gateway restart
```

这将重新加载配置文件。

### Step 2: 开始新会话

现有会话保留旧的模型配置。在聊天中发送：

```
/new
```

或者 `/reset` 也可以。<strong>不开始新会话，新模型不会生效。</strong>

## 验证配置

确认配置是否正确：

```bash
openclaw models status
```

如果 `anthropic/claude-opus-4-6` 显示为primary模型，就成功了。

也可以在聊天中确认：

```
/model status
```

## 总结

1. 编辑 `openclaw.json` 的 `models` 和 `agents` 部分
2. `openclaw gateway restart` 重启
3. `/new` 开始新会话
4. `openclaw models status` 确认

完毕。欢迎来到100万token上下文的世界。

## 参考资料

- [OpenClaw官方文档 — Models](https://docs.openclaw.ai/concepts/models)
- [OpenClaw官方文档 — Model Providers](https://docs.openclaw.ai/concepts/model-providers)
- [OpenClaw GitHub](https://github.com/openclaw/openclaw)
- [Anthropic官方 — Claude Opus 4.6](https://www.anthropic.com)
