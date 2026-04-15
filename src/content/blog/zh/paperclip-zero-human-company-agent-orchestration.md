---
title: Paperclip — 像管理员工一样管理AI Agent的开源平台，我装了试试
description: >-
  以员工方式管理AI Agent的开源平台Paperclip亲测体验。Linear风格仪表板、Org Chart、费用追踪、多种Agent适配器一网打尽
  — 用Claude Code雇佣Agent组织化运营的实战经验与真实评价。
pubDate: '2026-04-02'
heroImage: ../../../assets/blog/paperclip-zero-human-company-agent-orchestration-hero.png
tags:
  - ai-agents
  - open-source
  - orchestration
relatedPosts:
  - slug: anthropic-agent-skills-standard
    score: 0.95
    reason:
      ko: '자동화, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, architecture with comparable
        difficulty.
      zh: 在自动化、AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: claude-skills-implementation-guide
    score: 0.95
    reason:
      ko: '자동화, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, architecture with comparable
        difficulty.
      zh: 在自动化、AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: mcp-open-standard-linux-foundation-engineering-guide
    score: 0.95
    reason:
      ko: '자동화, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, architecture with comparable
        difficulty.
      zh: 在自动化、AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: claude-cowork-enterprise-productivity-platform
    score: 0.95
    reason:
      ko: '자동화, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, architecture with comparable
        difficulty.
      zh: 在自动化、AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: anthropic-agent-skills-practical-guide
    score: 0.94
    reason:
      ko: '자동화, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, architecture with comparable
        difficulty.
      zh: 在自动化、AI/ML、架构领域涵盖类似主题，难度相当。
---

你有没有同时开过20个Claude Code终端？我有。用4种语言写博客文章的时候，同时跑Research Agent、图片生成Agent、翻译Agent，某个瞬间就会开始迷糊——"现在谁在干什么来着？"靠终端标签名来区分终究有局限，各个Agent的费用也不一样，月底算账的时候很麻烦。如果想用Git Worktree更系统地管理并行Claude Code会话，[用Git Worktree运营Claude Code并行会话](/zh/blog/zh/claude-code-parallel-sessions-git-worktree)值得一读。

[Paperclip](https://github.com/paperclipai/paperclip)正面解决了这个问题。它的口号很大胆——"Open-source orchestration for zero-human companies." 把Agent当员工管理，把Agent组当公司来运营。

我亲自装了跑了一下。

## 安装：比想象中简单

```bash
git clone https://github.com/paperclipai/paperclip.git
cd paperclip
pnpm install
pnpm build
pnpm dev:once
```

只要有Node 20以上和pnpm 9.x就行。构建大约30秒，启动后内置PostgreSQL会自动运行。不需要单独配置数据库这点很不错。不设置`DATABASE_URL`的话会使用本地嵌入式Postgres，生产环境可以连接外部Postgres。

访问`http://127.0.0.1:3100`会出现引导向导。

## 引导流程：4步向导

Company → Agent → Task → Launch。就是这个顺序。

输入公司名称和使命，创建一个Agent，分配任务，然后执行。我创建了一个叫"Jangwook Blog Automation"的公司，雇佣了一个名为"Writer"的Claude Code Agent。

Agent适配器种类很多。Claude Code和Codex标记为"Recommended"，展开还有Gemini CLI、OpenCode、Pi、Cursor、Hermes Agent、OpenClaw Gateway。README里写着"If it can receive a heartbeat, it's hired"，看到实际支持这么多运行时，感觉不算夸张。

## 仪表盘：明显参考了Linear

![Paperclip仪表盘——Agent、任务、费用、审批状态一目了然](../../../assets/blog/paperclip-zero-human-company-agent-orchestration-hero.png)

第一次看到仪表盘的想法是"这不就是Linear吗？"深色主题、侧边栏导航、Issue Tracker结构都很熟悉。不是贬义——意思是开发者可以立刻上手。

侧边栏结构如下：
- <strong>WORK</strong>：Issues、Routines(Beta)、Goals
- <strong>PROJECTS</strong>：按项目分组的Issues
- <strong>AGENTS</strong>：Agent列表 + 实时状态
- <strong>COMPANY</strong>：Org、Skills、Costs、Activity、Settings

看起来像任务管理器，但底层有组织架构、预算、治理。README里说的"It looks like a task manager — but under the hood it has org charts, budgets, governance"是准确的描述。

## 实际运行：实时流式输出印象深刻

创建任务点击Launch后，Writer Agent立刻开始调用Claude Code。侧边栏出现"1 live"标识，在Issue页面上STDOUT实时流式输出。

![Issue详情页——Writer Agent正在实时执行。可以看到STDOUT流式输出和Properties面板](../../../assets/blog/paperclip-zero-human-company-agent-orchestration-issue.png)

不过我这边执行结果是"failed"。原因很简单——在`_sandbox/`里运行时，Claude Code的API密钥配置似乎没有正确设置。这不是Paperclip的问题，Agent适配器是调用本地CLI的结构，所以环境配置必须正确。引导流程中有"Adapter environment check"测试按钮，但即使测试通过，实际任务仍可能失败，这点有些遗憾。

## 组织架构图：Agent像员工卡片一样展示

![组织架构图——Writer Agent以CEO头衔显示的组织图](../../../assets/blog/paperclip-zero-human-company-agent-orchestration-org.png)

每个Agent以姓名、职位、负责的Issue数量的卡片形式展示。创建多个Agent后可以搭建层级结构。CEO Agent把任务委派给CTO Agent，CTO再委派给工程师Agent，以此类推。

坦白说，只用一个Agent的话就是杀鸡用牛刀。Paperclip团队也承认这一点，README里明确写着"Not for single agents"。3个以上的Agent同时管理时才开始有意义。

## 费用管理：这是我真正需要的功能

![Costs页面——可以按时间段查看推理费用、预算、财务状况](../../../assets/blog/paperclip-zero-human-company-agent-orchestration-costs.png)

Costs页面相当详细。可以按时间段（Month to Date、Last 7 Days、Last 30 Days等）查看Inference Spend、Budget、Finance Net、Finance Events，还能为每个Agent设置Token预算。

我写博客时最想知道的就是"这个月Agent费用花了多少？"，目前只能一条条翻终端日志来计算。用一个仪表盘展示这些，确实有价值。

## 我的评价

<strong>优点：</strong>

内置PostgreSQL让安装很简单。`pnpm dev:once`一行命令就能启动服务器。UI完成度高，熟悉Linear的人几乎没有学习成本。Agent适配器种类丰富，不只是Claude Code，Codex、Cursor、Gemini CLI都能在同一屋檐下管理。Routines(Beta)功能还支持定时执行。

<strong>不足：</strong>

只用一个Agent的人没有使用理由。多学一个任务管理器，如果Agent只有1〜2个，直接在终端管理更快。而且"zero-human company"这个口号与实际情况有差距。根据我的使用经验，Agent失败了最终还是要人来调试，任务定义也需要人来做。这是"管理Agent的工具"，而不是"替代人的工具"——至少目前还不是。

还有一点需要理解的是，Paperclip本身<strong>不是</strong>Agent框架或Prompt管理器。它不是帮你创建Agent的工具，而是把已有的Agent组织化的工具。Claude Code、Codex这样的CLI Agent已经在运行，它才有意义。想了解哪种工作流模式适合自己，可以参考[Claude Code 5种工作流模式](/zh/blog/zh/claude-code-agentic-workflow-patterns-5-types)。

## 谁应该用

- 同时管理5个以上Claude Code终端的人
- 想要追踪每个Agent的费用并设置预算的人
- 将多个Agent（Claude + Codex + Cursor等）投入同一项目的团队

我暂时还没有采用。我的博客自动化流水线用一个Claude Code就够了，等到需要同时运行3个以上Agent的时候再拿出来用。届时大概会分别注册Writer、Researcher、SEO Optimizer作为Agent，在Paperclip中进行编排。

下一步想做的事：用Routines功能设置每天早上自动执行趋势调研。有结果的话会写后续文章。
