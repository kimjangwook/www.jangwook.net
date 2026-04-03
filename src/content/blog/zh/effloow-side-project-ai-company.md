---
title: Effloow — 用14个AI Agent运营公司的Side Project
description: 基于Paperclip搭建了由14个AI Agent组成的内容业务。分享Laravel、Markdown、Git驱动的站点自动化架构与Day 1的实战经验。
pubDate: '2026-04-02'
heroImage: ../../../assets/blog/effloow-side-project-ai-company-hero.png
tags:
  - side-project
  - ai-agents
  - paperclip
relatedPosts:
  - slug: adding-chinese-support
    score: 0.95
    reason:
      ko: '자동화, 웹 개발, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、Web開発、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, web development, AI/ML,
        architecture with comparable difficulty.
      zh: 在自动化、Web开发、AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: ai-agent-notion-mcp-automation
    score: 0.95
    reason:
      ko: '자동화, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, architecture with comparable
        difficulty.
      zh: 在自动化、AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: llm-blog-automation
    score: 0.95
    reason:
      ko: '자동화, 웹 개발, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、Web開発、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, web development, AI/ML,
        architecture with comparable difficulty.
      zh: 在自动化、Web开发、AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: agent-effi-flow-pivot-omotenashi-bot
    score: 0.94
    reason:
      ko: '자동화, 웹 개발, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、Web開発、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, web development, AI/ML,
        architecture with comparable difficulty.
      zh: 在自动化、Web开发、AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: claude-code-plugins-complete-guide
    score: 0.94
    reason:
      ko: '자동화, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, architecture with comparable
        difficulty.
      zh: 在自动化、AI/ML、架构领域涵盖类似主题，难度相当。
---

上一篇文章里，我安装并试运行了Paperclip这个AI Agent编排平台。从雇佣Agent、分配Issue到提交代码，整个流程都跑通了——但停在这里实在太可惜了。

所以我干脆造了一家真正的公司。

## Effloow是什么

[Effloow](https://www.effloow.com)是一个打着"完全由AI Agent运营的内容业务"旗号的Side Project。听起来很厉害，实际是这样的：

- 一个基于Laravel的网站
- 通过Paperclip连接的14个AI Agent
- 每个Agent把Markdown文件push到Git，站点自动渲染

没有CMS。没有管理后台。Agent们创建`.md`文件并提交，Laravel读取后渲染成HTML。就这么简单。

![Effloow首页 — 内容自动渲染](../../../assets/blog/effloow-side-project-ai-company-home.png)

## 为什么要做这个

安装完Paperclip之后，我想的是"得实际做点东西才能真正理解它"。在CLI里跑一个Agent和像组织一样运营14个，是完全不同的事情。

而且我很好奇：<strong>公司能不能仅靠AI运转？</strong>收入为零也没关系，只要内容能生产、站点能维护、质量能管控——这个循环能不能在无人参与的情况下运行。

## 组织架构：5个团队，14个Agent

Effloow的Agent分为5个业务单元。

![Paperclip Agent列表 — CEO下方14个Agent按层级排列](../../../assets/blog/effloow-side-project-ai-company-agents.png)

<strong>Media Team</strong> — 在Blog上发布运营日志、周报和公司动态。Editor-in-Chief负责统筹，Publisher像DevOps一样负责发布部署。

<strong>Content Factory</strong> — 生产面向SEO的长文。Trend Scout挖掘选题，Writer撰写初稿，Lead Researcher负责事实核查。

<strong>Tool Forge</strong> — 开发免费Web工具。目前已上线的是twMerge Playground——一个调试Tailwind CSS类名冲突的交互式工具，由Builder Agent负责。

<strong>Experiment Lab</strong> — 进行变现实验。本来是为了A/B测试AdSense、联盟链接之类的，但目前实验数为零。

<strong>Web Dev</strong> — 管理站点本身。路由、SEO、部署Pipeline，以及GA4集成。

在Paperclip Dashboard上看起来是这样的：

![Paperclip Issue Board — 12个Issue的创建和处理记录](../../../assets/blog/effloow-side-project-ai-company-issues.png)

## 技术栈的有趣之处

Effloow架构中我最喜欢的部分是"Markdown就是数据库"这一点。

Agent写文章时做的事情就是这个：

```markdown
---
title: "How We Built a Company Powered by 14 AI Agents"
slug: "how-we-built-ai-company"
category: articles
tags: [ai, paperclip, orchestration]
---

正文内容...
```

把这个`.md`文件提交到Git就完事了。Laravel的`ContentController`解析frontmatter生成列表，渲染正文。因为基于Blade模板，交互式工具也在同一架构下运行——只要在frontmatter里加上`blade: tools.twmerge-playground`键，就会路由到对应的Blade视图。

这种架构的好处在于，对Agent来说"创建一个文件就等于完成部署"。不需要调用API，不需要数据库迁移。Git push即部署。

## Live Dashboard：实时查看公司状态

有一个`/live`页面，实时展示访客数、Lighthouse分数和内容数量。

![Live Dashboard — 通过GA4集成一览访客、性能和内容状况](../../../assets/blog/effloow-side-project-ai-company-live.png)

目前访客数是0。这很正常，毕竟昨天才刚搭建。GA4集成由Web Dev Lead Agent实现，Lighthouse测量通过`proc_open()`调用CLI来完成。这也是Agent自己写的代码，值得注意的是它用了数组参数方式来防止shell injection。换作我自己写，估计就直接拼字符串凑合了。

## Day 1实际发生了什么

在Paperclip上创建了12个Issue并分配给Agent。结果如下：

- <strong>EFF-1</strong>（内容渲染系统）：Agent确认我已经实现了，直接关闭了Issue
- <strong>EFF-3</strong>（基于Blade的工具系统）：将交互式工具整合到与Markdown相同的架构中，在`ContentService.list()`中添加`blade`键
- <strong>EFF-8</strong>（第一篇文章）：Writer Agent写了一篇"How We Built a Company Powered by 14 AI Agents"
- <strong>EFF-11</strong>（AdSense页面）：创建了Contact和Privacy Policy页面
- <strong>EFF-12</strong>（Live Dashboard数据采集）：GA4 API集成、Lighthouse CLI集成

12个Issue中10个在一天内处理完毕。人类介入的只有EFF-1（我之前已经实现的）和EFF-3（我抢先写了代码）。

## 还差什么

要称之为"公司"，还缺很多东西。

<strong>收入为零。</strong>AdSense审批还没通过，也没有流量。Experiment Lab应该进行变现实验，但目前连实验本身都没有。

<strong>缺乏内容质量审核。</strong>Writer写的文章谁来Review？虽然设定了Lead Researcher负责事实核查，但实际上Writer的初稿几乎原封不动就发布了。看来还是需要人工审核一遍。

<strong>Agent间协作有限。</strong>Paperclip的Issue系统是"一个Agent处理一个Issue"的结构。两个Agent就同一个Issue进行讨论或互相Code Review，目前还做不到。

对我来说最困扰的是<strong>Agent自主性与控制之间的平衡</strong>。Issue写得太具体，跟我自己写代码没区别；写得太抽象，又会跑偏方向。我说"请添加AdSense审批所需的页面"，它就在Contact页面填了我的邮箱并生成了Privacy Policy。方向没错，但内容比较单薄。

## 从这个项目中学到的

运行一天后的感受是，用AI Agent搭建"公司"在技术上是可行的，但<strong>管理成本并没有消失，只是改变了形态</strong>。

管理人的时候要做1on1和Code Review。管理Agent的时候要精心撰写Issue并验收产出。后者确实更快，但"写好一个Issue花10分钟"累积起来，最终花费的时间也差不多。

但有一点是确定的：<strong>初期搭建速度碾压式地快</strong>。一天之内就搞出了网站 + 内容 + 工具 + GA4集成 + Live Dashboard。一个人做的话至少得一周。

我打算继续运营Effloow。下一个目标是让Agent自主创建Issue——Trend Scout发现选题，Board创建Issue，自动分配给Writer的循环。目前还是我手动创建Issue，离真正的"无人公司"还有距离。

代码暂未开源，但站点可以在[effloow.com](https://www.effloow.com)查看。我计划每周通过Effloow Weekly记录进展。
