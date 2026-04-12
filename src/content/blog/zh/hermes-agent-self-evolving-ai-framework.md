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
      ko: Hermes의 스킬 자동 생성이 흥미로웠다면, 프레젠테이션 자동화에서도 비슷한 반복 작업 제거 패턴을 확인할 수 있습니다.
      ja: Hermesのスキル自動生成に興味を持ったなら、プレゼン自動化でも類似の反復タスク削減パターンが見られます。
      en: If Hermes's auto-skill generation caught your eye, presentation automation shows a similar pattern of eliminating repetitive tasks.
      zh: 如果Hermes的技能自动生成引起了你的兴趣，演示自动化中也有类似的消除重复任务模式。
  - slug: claude-code-insights-usage-analysis
    score: 0.94
    reason:
      ko: 본문에서 비교한 Claude Code의 CLAUDE.md 패턴을 실제 사용 데이터로 분석한 글입니다. 에이전트 학습 방식의 차이를 더 깊이 이해할 수 있습니다.
      ja: 本文で比較したClaude CodeのCLAUDE.mdパターンを実際の使用データで分析した記事です。エージェント学習方式の違いをより深く理解できます。
      en: Analyzes the Claude Code CLAUDE.md pattern with real usage data — the same pattern compared in this post. Deepens understanding of different agent learning approaches.
      zh: 用实际使用数据分析了本文中比较的Claude Code CLAUDE.md模式，帮助更深入理解不同的代理学习方式。
  - slug: multi-agent-swe-bench-verdent
    score: 0.94
    reason:
      ko: Hermes가 단일 에이전트의 자기 진화라면, 이 글은 멀티 에이전트가 협업할 때 벤치마크 성능이 어떻게 바뀌는지 다룹니다.
      ja: Hermesが単一エージェントの自己進化なら、この記事はマルチエージェント協業時のベンチマーク性能変化を扱います。
      en: While Hermes focuses on single-agent self-evolution, this post covers how benchmark performance changes when multiple agents collaborate.
      zh: Hermes是单代理的自我进化，这篇文章则讨论多代理协作时基准测试性能的变化。
  - slug: hindsight-mcp-agent-memory-learning
    score: 0.93
    reason:
      ko: Hermes의 플러그인 메모리와 다른 접근인 MCP 기반 에이전트 메모리를 비교해볼 수 있습니다. 에이전트 기억 아키텍처에 관심 있다면 필독.
      ja: Hermesのプラグインメモリとはアプローチの異なるMCPベースのエージェントメモリを比較できます。エージェント記憶アーキテクチャに関心があれば必読。
      en: Compare Hermes's plugin memory with a different approach — MCP-based agent memory. Essential reading if you're interested in agent memory architecture.
      zh: 可以将Hermes的插件化内存与不同方法——基于MCP的代理内存进行比较。如果对代理记忆架构感兴趣，必读。
  - slug: gemma-4-local-agent-edge-ai
    score: 0.94
    reason:
      ko: Hermes의 백엔드 모델로 Gemma 4를 로컬에서 쓸 수 있을까? 이 글에서 Gemma 4의 실제 성능과 함수 호출 능력을 확인할 수 있습니다.
      ja: HermesのバックエンドモデルとしてGemma 4をローカルで使えるか？この記事でGemma 4の実際の性能と関数呼び出し能力を確認できます。
      en: Could Gemma 4 work as Hermes's backend model locally? This post tests Gemma 4's real-world performance and function-calling capabilities.
      zh: Gemma 4能作为Hermes的本地后端模型吗？这篇文章测试了Gemma 4的实际性能和函数调用能力。
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

这个模式让我觉得有趣的原因是，它在结构上与我每天使用的Claude Code的CLAUDE.md相似。在CLAUDE.md中写下"在这个项目中遵循这些规则"，下次会话时代理就会读取并据此行动。Hermes只是将这个过程自动化了。

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

**LangChain/CrewAI** — 工作流编排能力强，但没有"代理自主成长"的概念。按预定义图执行。

**Hermes Agent** — 作为通用代理，自我改进是核心。比起编码，更适合日常自动化、研究和通信枢纽。多平台支持特别强。

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
