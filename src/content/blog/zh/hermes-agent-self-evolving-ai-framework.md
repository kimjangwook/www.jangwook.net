---
title: Hermes Agent — 每完成一个任务就自我进化的开源AI代理
description: >-
  安装了NousResearch的Hermes Agent v0.7.0。它在每次任务完成后自动生成技能文档，
  并在下次运行时引用。记录了自我进化循环是否真的有效。
pubDate: '2026-04-12'
heroImage: ../../../assets/blog/hermes-agent-self-evolving-ai-framework-hero.jpg
tags:
  - ai-agent
  - open-source
  - self-evolution
  - nous-research
  - automation
relatedPosts:
  - slug: ai-presentation-automation
    score: 0.94
    reason:
      ko: '자동화, AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: 'Covers similar topics in automation, AI/ML with comparable difficulty.'
      zh: 在自动化、AI/ML领域涵盖类似主题，难度相当。
  - slug: claude-code-insights-usage-analysis
    score: 0.94
    reason:
      ko: '자동화, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, architecture with comparable
        difficulty.
      zh: 在自动化、AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: multi-agent-swe-bench-verdent
    score: 0.94
    reason:
      ko: '자동화, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, architecture with comparable
        difficulty.
      zh: 在自动化、AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: sora-shutdown-ai-video-market-reshaping-veo4
    score: 0.94
    reason:
      ko: '자동화, AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: 'Covers similar topics in automation, AI/ML with comparable difficulty.'
      zh: 在自动化、AI/ML领域涵盖类似主题，难度相当。
  - slug: gemma-4-local-agent-edge-ai
    score: 0.94
    reason:
      ko: '자동화, AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: 'Covers similar topics in automation, AI/ML with comparable difficulty.'
      zh: 在自动化、AI/ML领域涵盖类似主题，难度相当。
---

运行`pip install hermes-agent`三十分钟后，我觉得"这个确实不一样"。

AI代理框架几乎每天都在冒出来，Hermes Agent能在GitHub Trending周榜连续两周保持Top 5，这不只是营销。核心是**自我进化循环（self-evolution loop）** — 每次完成任务，代理都会自动生成技能文档，下次遇到类似任务时引用该文档，实现更快更准确的处理。

## Hermes Agent是什么

这是NousResearch以MIT许可证开源的AI代理框架。2026年2月首次发布后两个月内，达到了GitHub Star 33,000、Fork 4,200、贡献者142名。4月3日发布了v0.7.0"The Resilience Release"。

三个核心概念：

- **技能自动生成**：完成复杂任务后自动创建可复用的技能文档
- **插件化内存**：跨会话保持记忆，后端可替换的插件架构
- **多平台支持**：CLI、Telegram、Discord、Slack、WhatsApp、Signal、Email全部支持

说实话，光看功能列表会觉得"又是一个代理框架"。我一开始也这么想。

## 安装体验

安装过程意外地干净。

```bash
# 一键安装 — 自动处理Python、Node.js、ripgrep、ffmpeg等依赖
curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash

# 或者直接pip安装
pip install hermes-agent

# 首次运行
hermes
```

安装器一次性搞定Python虚拟环境、依赖项和全局`hermes`命令。LLM提供者配置在首次运行时交互式询问，选择OpenRouter就能立即使用200多个模型。`hermes model`命令可以切换模型，无需修改代码就能在Nous Portal、OpenAI、Kimi、MiniMax等之间自由切换。

## 自我进化循环真的有效吗

这是核心问题。很多代理框架声称会"学习"，但实际上通常只是提示缓存或对话历史。

Hermes的方法不同：

1. 完成复杂任务后，代理自动将过程整理为**技能文档**
2. 技能文档保存在`~/.hermes/plugins/`或`.hermes/plugins/`
3. 下次收到类似任务时，在工具发现阶段引用这些文档

这个模式让我觉得有趣的原因是，它在结构上与我每天使用的Claude Code的CLAUDE.md相似。在CLAUDE.md中写下"在这个项目中遵循这些规则"，下次会话时代理就会读取并据此行动。Hermes只是将这个过程自动化了。关于代理如何跨会话保持上下文的不同方法，可以在[Hindsight MCP代理内存架构分析](/zh/blog/zh/hindsight-mcp-agent-memory-learning)中对比。

但说实话，"自动生成的技能文档质量"还不够稳定。简单的文件操作或API调用能产生相当好用的技能，但高度依赖上下文的复杂任务有时会遗漏关键点。v0.7.0在NousResearch/hermes-agent-self-evolution仓库中加入了基于DSPy + GEPA的进化式自我改进，但这还处于实验阶段。

## 架构概览

核心结构比想象的简单：

```
run_agent.py    → AIAgent — 核心对话循环
cli.py          → HermesCLI — 终端UI
model_tools.py  → 工具发现与分发
hermes_state.py → SQLite会话/状态DB（FTS5全文搜索）
```

工具发现从三个来源获取：
- `~/.hermes/plugins/` — 用户插件
- `.hermes/plugins/` — 项目级插件
- pip entry points — 通过包安装的插件

v0.7.0最大的变化是内存变成了插件系统。之前会话结束时上下文会重置，现在可以替换内存后端、在代理间共享内存、或自建自定义内存提供者。

## v0.7.0的变化

| 变更 | 说明 |
|------|------|
| 插件化内存 | 内存后端可替换和共享 |
| 按钮式审批UI | 危险操作执行前确认 |
| 内联diff预览 | 文件修改前显示变更 |
| API服务器会话持久化 | 网关重启后会话保留 |
| Camofox浏览器 | 内置浏览器代理 |

## 与其他框架的比较

我不认为这是取代一切的银弹。对比来看：

**Claude Code/OpenClaw** — 编码专精，IDE集成强。CLAUDE.md式项目规则虽然手动，但更可控。如果主要目的是写代码，Claude Code仍然更好。

**LangChain/CrewAI** — 工作流编排能力强，但没有"代理自主成长"的概念。按预定义图执行。多代理协作如何影响基准测试性能，可参考[SWE-bench多代理性能分析](/zh/blog/zh/multi-agent-swe-bench-verdent)。

**Hermes Agent** — 作为通用代理，自我改进是核心。比起编码，更适合日常自动化、研究和通信枢纽。多平台支持特别强。企业级代理部署的实际案例，可看[Stripe自主编码代理处理1,300个PR的案例研究](/zh/blog/zh/stripe-minions-autonomous-coding-agents-1300-prs)。

坦白说，我觉得"自我进化"这个词可能有些被高估了。目前的水平更接近"把任务记录文档化后复用"，而非像人类从经验中学习那样本质性地改变。但"文档化自动化"本身已经具有相当大的价值，这点不得不承认。

## 适合谁用

- 想在多个聊天平台上用一个代理处理任务的个人开发者
- 想自动化重复工作、但不想每次重写提示词的团队
- 想自定义代理框架、但觉得LangChain的抽象层过度的人
- 用Claude Code写代码、但想把非编码自动化交给别的代理的人

MIT许可证和零模型锁定也很加分。仅用OpenRouter就能使用200多个模型，成本优化很灵活。

## 结语

我不会说Hermes Agent是"革命性的"或者"改变了范式"。但在框架层面自动化"任务 → 技能生成 → 复用"循环，这确实有意义。两个月达到33K Star是有原因的。

个人最期待v0.7.0的插件化内存系统。代理间的内存共享一旦真正成熟，或许能突破现在"一个聊天窗口 = 一个上下文"的限制。当然，到那时这个项目能否保持势头才是关键。
