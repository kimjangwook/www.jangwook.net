---
title: 'GPT-5.4发布 — 原生计算机使用和1M上下文窗口将改变工程团队'
description: >-
  OpenAI于2026年3月5日发布GPT-5.4。在OSWorld基准测试中超越人类（75% vs 72.4%）的计算机使用能力、1M令牌上下文窗口、工具搜索节省47%令牌 — 工程管理者必知的核心影响分析。
pubDate: '2026-03-13'
heroImage: ../../../assets/blog/gpt54-computer-use-1m-context-engineering-impact-hero.png
tags:
  - openai
  - gpt-5
  - computer-use
  - engineering-management
  - llm
relatedPosts:
  - slug: gpt53-codex-rollout-pause
    score: 0.93
    reason:
      ko: GPT-5 시리즈 이전 버전 이슈를 분석한 포스트로 GPT-5.4 컨텍스트 이해에 필수적입니다.
      ja: GPT-5シリーズの前バージョンの問題を分析した投稿で、GPT-5.4のコンテキスト理解に不可欠です。
      en: Analyzes issues with previous GPT-5 versions, essential for understanding GPT-5.4 context.
      zh: 分析了GPT-5系列前版本的问题，对理解GPT-5.4的背景至关重要。
  - slug: gpt52-theoretical-physics-discovery
    score: 0.90
    reason:
      ko: GPT-5 시리즈의 발전 흐름을 보여주는 시리즈 포스트로 함께 읽으면 좋습니다.
      ja: GPT-5シリーズの発展の流れを示す連続投稿で、合わせて読むことをお勧めします。
      en: Shows the progression of the GPT-5 series, best read alongside this post.
      zh: 展示了GPT-5系列的发展历程，适合与本文一起阅读。
  - slug: context-engineering-production-ai-agents
    score: 0.85
    reason:
      ko: 1M 컨텍스트 윈도우를 실무에 활용하는 방법을 심층적으로 다루는 관련 포스트입니다.
      ja: 1Mコンテキストウィンドウを実務で活用する方法を深く掘り下げた関連投稿です。
      en: Deep dive into how to leverage large context windows in production agents.
      zh: 深入探讨如何在生产环境中利用大上下文窗口的相关文章。
  - slug: ai-agent-observability-production-guide
    score: 0.80
    reason:
      ko: GPT-5.4의 컴퓨터 사용 에이전트를 모니터링하는 데 필요한 옵저버빌리티 가이드입니다.
      ja: GPT-5.4のコンピュータ使用エージェントを監視するために必要なオブザーバビリティガイドです。
      en: Observability guide needed for monitoring GPT-5.4 computer use agents.
      zh: 监控GPT-5.4计算机使用代理所需的可观测性指南。
draft: true
---

## GPT-5.4为何与众不同

2026年3月5日，OpenAI正式发布了GPT-5.4。这次发布不是简单的版本升级，而是首个同时具备三项能力的通用模型：**原生计算机使用（Computer Use）**、**1M令牌上下文窗口**和**工具搜索**。

如果说GPT-5.2展示了在理论物理学中的科学发现能力，GPT-5.3揭示了Codex推出暂停背后的平台可靠性问题，那么GPT-5.4则标志着AI代理真正达到了能够"工作"的水平。

## 三大核心升级

### 1. 原生计算机使用 — 超越人类表现

GPT-5.4在OSWorld-Verified基准测试中达到了**75.0%**。对比数据如下：

| 模型 / 基准 | OSWorld得分 |
|---|---|
| GPT-5.4 | **75.0%** |
| 人类基准 | 72.4% |
| Claude Opus 4.6 | 74.7% (Terminal-Bench 2.0) |
| Gemini 3.1 Pro | 78.4% (Terminal-Bench 2.0) |
| GPT-5.2 | 47.3% |

GPT-5.4能通过截图、鼠标移动和键盘输入直接操控真实的计算机环境。它能自主执行网站导航、文件管理以及跨软件系统的多步骤工作流程。

在API中，GPT-5.4与Codex集成，**融合了Codex的顶尖编码能力**，同时扩展为可处理电子表格、演示文稿和文档工作的通用代理。

### 2. 1M令牌上下文窗口

这是OpenAI历史上最大的上下文窗口。长文本上下文基准测试表现如下：

- 0〜128K范围：Graphwalks BFS **93.0%**
- 256K〜1M范围：**21.4%**（极高难度区间）

1M令牌在实际工作中意味着什么？整个代码仓库、数百条客户支持日志、数年的项目文档——这些都可以在<strong>单一上下文中</strong>处理。多步骤代理终于拥有了足够的上下文容量来规划、执行和验证整个长期任务流程。

### 3. 工具搜索 — 节省47%令牌

在传统MCP配置中，随着活跃工具数量增加，每轮都需要注入所有工具的schema。在Scale的MCP Atlas基准测试中（36个MCP服务器，250个任务），GPT-5.4的工具搜索实现了：

- **总令牌使用量减少47%**
- 准确率保持不变

工具搜索使代理能够按需动态发现所需工具，而不是提前注入所有schema。在大型企业MCP环境中，节省成本的效果尤为显著。关于在生产环境部署MCP服务器的实践指南，请参考[MCP服务器构建实战指南2026](/zh/blog/zh/mcp-server-build-practical-guide-2026)。

## GPT-5.4 Thinking与Pro的区别

此次发布包含两个变体。

**GPT-5.4 Thinking**：在响应前先提出计划。如果AI遗漏了关键细节，用户可以在任务中途介入调整方向。对于复杂的多步骤任务，透明度和控制权大幅提升。

**GPT-5.4 Pro**：高性能优化版本。在专业知识工作（电子表格建模、文档解析、演示文稿设计）中表现突出。

## 工程管理者视角：团队将发生什么变化

### 重复性工作的大规模自动化成为可能

计算机使用能力超越人类水平，意味着<strong>需要点击操作的遗留工作流程也可以现实地自动化</strong>了。没有API的内部系统、基于GUI的管理面板、电子表格操作——代理都可以直接操控。

### 上下文工程范式转变

以128K为基准设计的代理架构扩展到1M。不再需要复杂的RAG管道，"将所需内容全部放入上下文"也成为现实可行的选项。但需注意，256K〜1M范围的准确率（21.4%）仍然有限。关于如何在生产AI代理中高效设计上下文，请参考[生产AI代理的上下文工程](/zh/blog/zh/context-engineering-production-ai-agents)。

### 工具成本优化

MCP服务器数量越多，工具搜索的价值就越大。如果企业环境中运行着30个以上的MCP服务器，仅引入工具搜索就可能将API成本削减近一半。

### 需要持续监控竞争态势

在Terminal-Bench 2.0上，Gemini 3.1 Pro（78.4%）在某些领域超过GPT-5.4。模型选择必须综合考虑<strong>具体任务类型和成本结构</strong>，而不仅仅是单一基准指标。

## 立即行动事项

首先，列出当前未能自动化的基于GUI的内部流程清单。这些是计算机使用代理的第一批候选对象。

其次，识别真正需要1M上下文的任务。问题不是上下文是否足够长，而是长上下文在特定情况下是否在准确率和成本方面具有实质性优势。

最后，如果MCP服务器数量超过10个，请评估引入工具搜索的可行性。47%的令牌节省是一个难以忽视的数字。关于与这些功能配合使用的AI代理工作流模式，请参考[Claude Code智能工作流5种模式](/zh/blog/zh/claude-code-agentic-workflow-patterns-5-types)。

## 结语

GPT-5.2向我们展示了"AI进行科学研究"的可能性，GPT-5.3揭示了"AI平台可靠性管理"这一关键课题，而GPT-5.4则宣告"AI代理正在真实计算机环境中工作"的时代已经到来。

超越人类的计算机使用能力、可容纳整个代码库的上下文窗口、大规模MCP部署的成本节约——三个维度同时进入生产环境的时刻已经到来。

对于工程管理者而言，方向很明确：立刻识别你的团队中哪些工作流程应该因这一变革而率先改变。
