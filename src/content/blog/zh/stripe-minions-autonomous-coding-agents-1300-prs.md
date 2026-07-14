---
title: 'Stripe Minions — 一个 Slack 表情触发每周 1,300 个 PR 的编码 Agent'
description: >-
  Stripe 如何通过自主编码 Agent Minions 每周生产超过 1,300 个 PR。分析 Blueprint 架构、沙箱 VM
  和三层反馈循环背后的实际工程实践。
pubDate: '2026-04-03'
heroImage: ../../../assets/blog/stripe-minions-autonomous-coding-agents-1300-prs-hero.jpg
tags:
  - ai-agent
  - stripe
  - autonomous-coding
  - mcp
  - ci-cd
  - engineering
relatedPosts:
  - slug: mcp-servers-toolkit-introduction
    score: 0.94
    reason:
      ko: '자동화, AI/ML, DevOps, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、DevOps、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, DevOps, architecture with
        comparable difficulty.
      zh: 在自动化、AI/ML、DevOps、架构领域涵盖类似主题，难度相当。
  - slug: claude-agent-teams-guide
    score: 0.93
    reason:
      ko: '다음 단계 학습으로 적합하며, 자동화, AI/ML, DevOps, 아키텍처 주제에서 연결됩니다.'
      ja: 次のステップの学習に適しており、自動化、AI/ML、DevOps、アーキテクチャのトピックで繋がります。
      en: >-
        Suitable as a next-step learning resource, connecting through
        automation, AI/ML, DevOps, architecture topics.
      zh: 适合作为下一步学习资源，通过自动化、AI/ML、DevOps、架构主题进行连接。
  - slug: claude-code-insights-usage-analysis
    score: 0.93
    reason:
      ko: '자동화, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, architecture with comparable
        difficulty.
      zh: 在自动化、AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: effiflow-automation-analysis-part3
    score: 0.93
    reason:
      ko: '다음 단계 학습으로 적합하며, 자동화, AI/ML, DevOps, 아키텍처 주제에서 연결됩니다.'
      ja: 次のステップの学習に適しており、自動化、AI/ML、DevOps、アーキテクチャのトピックで繋がります。
      en: >-
        Suitable as a next-step learning resource, connecting through
        automation, AI/ML, DevOps, architecture topics.
      zh: 适合作为下一步学习资源，通过自动化、AI/ML、DevOps、架构主题进行连接。
  - slug: openclaw-opus-4-6-setup-guide
    score: 0.93
    reason:
      ko: '자동화, AI/ML, DevOps 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、DevOps分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, DevOps with comparable
        difficulty.
      zh: 在自动化、AI/ML、DevOps领域涵盖类似主题，难度相当。
---

在 Slack 中对一个 Bug 报告加个表情，10 秒后沙箱 VM 启动，修复代码，运行测试，创建 PR。人类只负责 Review。这就是 Stripe 今年 2 月公开的内部系统"Minions"的工作方式。

每周超过 1,300 个 PR。全部是零人工编写的代码。在一家年处理超过 1 万亿美元支付的公司里。

第一次看到这个数字时，我半信半疑。比起 1,300 这个数字本身，更让我难以置信的是"在支付基础设施中让自主 Agent 编写生产代码"这件事。所以我相当深入地研究了 Stripe 的工程博客和相关资料。

## Minions 是什么

一句话概括：从 Slack 消息或 Bug 工单开始，到 PR 合并为止，人类不写一行代码的自主编码 Agent。

核心概念是叫做 **Blueprint** 的编排模式——交替执行确定性代码节点和 LLM Agent 循环的结构。git checkout 和 lint 之类的操作由固定脚本处理，而"如何修复这个 Bug"由 LLM 判断。Stripe 将此称为"contained boxes"——将 LLM 放入受控盒子中，系统整体的可靠性会以复利方式提升。

Agent 的基础是 Block（原 Square）的开源编码 Agent Goose 的 fork 版本，通过 [MCP（Model Context Protocol）](/zh/blog/zh/mcp-server-build-practical-guide-2026)连接了 Stripe 内部工具和上下文。内部的 Toolshed 服务器托管了超过 400 个 MCP 工具。

## 沙箱：约束即自由

每个 Minion 都在隔离的 VM 中运行。与人类工程师使用的开发环境相同，但代码和服务已预加载，10 秒即可启动。

关键在于这些 VM **既没有互联网访问权限，也没有生产环境访问权限**。完全的沙箱。正是这个约束带来了一个悖论——不再需要权限检查，并且可以无限并行化。从安全角度来看也很干净——[Agent 根本没有向外泄露任何东西的路径](/zh/blog/zh/mcp-gateway-agent-traffic-control)。

我认为这个设计决策是 Minions 中最聪明的部分。大多数 AI Agent 项目都朝着"给 Agent 更多权限"的方向发展，而 Stripe 走了完全相反的路。极度限制权限，同时在限制范围内最大化自主性。

## 三层反馈循环

代码编写后的质量验证流程同样系统化。

**Tier 1 — 本地 lint（不到 5 秒）**：立即捕获拼写错误和格式问题。Agent 当场修复。

**Tier 2 — 选择性 CI**：Stripe 拥有超过 300 万个测试。全部运行耗时太长，因此只选择与变更文件相关的测试执行。可自动修复的失败会自动应用。

**Tier 3 — 重试上限**：如果 CI 失败，错误会返回给 Agent 进行修复。但**最多 2 次**。Stripe 团队的判断是"LLM 多轮运行的边际收益递减严重"。

这个 2 次上限让我觉得是非常务实的工程决策。无限重试不仅成本高，而且实际上如果 2 次修不好，第 3 次能修好的概率也很低。不如交给人类。

## 实际在做什么

Minions 处理的任务比想象的要多样：

- 接收 Slack 上的 Bug 报告，修复代码并生成 PR
- 根据功能需求编写新代码
- 检测到 flaky 测试后自动创建工单并添加"minion-fix"按钮
- 从内部文档、Feature Flag、代码智能（Sourcegraph）等获取上下文

入口点也有多个。Slack 是主要接口，此外还有 CLI、Web UI、内部平台按钮等。系统遵循"One-shot"理念，设计为通过一次指令完成端到端的任务。不是迭代式的对话修改，而是一次性交付结果，需要时人类在此基础上修改。

## 这真的行得通吗？

说实话，有几点我仍然存疑。

第一，那 1,300 个 PR 的**性质**。是否全部是有意义的功能变更，还是 lint 修复、依赖更新等机械性工作占了相当比例？Stripe 的博客没有具体披露这个比例。如果 80% 是类型修正和 import 整理，虽然依然令人印象深刻，但上下文就有所不同了。

第二，**Review 负担**。每周 1,300 个 PR 上来，意味着 Reviewer 也需要看 1,300 个 PR。Review AI 编写的代码与人类编写的不同——Agent 很好地遵循了代码规范，但"为什么这样做"的意图可能不透明。Stripe 规模的工程组织能够应对，但如果一个 50 人的创业公司去模仿，Review 瓶颈可能成为新的问题。

第三，Stripe 技术栈的特殊性——Ruby + Sorbet。数亿行代码库、强类型 Ruby、大量自研库的环境中 Agent 能良好运行，是因为他们针对这个环境精心打造了 MCP 工具和规则。这是否是一个通用可移植的模式，还是以 Stripe 级别的基础设施投资为前提，是另一个问题。

## 可以带走的东西

即使没有 Stripe 的规模，也有值得学习的地方。

**"墙比模型更重要"** —— Stripe 工程师 Steve Kaliski 的话，我也同意。决定 Agent 效能的不是 LLM 的能力，而是围绕 Agent 的约束和工具的质量。好的沙箱、精良的 MCP 工具、清晰的 Blueprint，有了这些，模型是可替换的。

Blueprint 模式——确定性节点与 Agent 循环交替——在小规模场景中也值得应用。我们团队用 [Claude Code](/zh/blog/zh/claude-code-parallel-sessions-git-worktree) 构建自动化时也使用类似结构，明确分离"固定步骤"和"LLM 判断步骤"后，调试变得容易很多。

从 300 万个测试中选择相关测试运行的 Selective CI 也是个好主意。这种方法不仅适用于 Agent，在常规开发流程中也值得引入，这个我打算另外研究一下。

---

Stripe Minions 是否是"所有公司都能效仿的模板"，目前还不确定。400 个 MCP 工具、数亿行代码库专用规则、10 秒启动的沙箱 VM——这是建立在多年开发基础设施投资之上的成果。

但核心理念——减少 Agent 的权限并控制环境，反而能提高可靠性——无论规模大小都适用。如果这个方向是对的，那么未来真正重要的不是"更聪明的模型"，而是"更好的墙"。
