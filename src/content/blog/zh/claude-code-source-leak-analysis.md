---
title: >-
  Claude Code源码泄露 — 从51万行代码解读Agent架构内幕
description: >-
  Anthropic因npm包发布失误导致Claude Code全部源码曝光。从Agent循环、内存系统到成本优化策略，梳理泄露代码中开发者可借鉴的设计模式。
pubDate: '2026-04-05'
heroImage: ../../../assets/blog/claude-code-source-leak-analysis-hero.jpg
tags:
  - claude-code
  - anthropic
  - ai-agent
  - source-code
  - security
relatedPosts:
  - slug: claude-code-hooks-workflow
    score: 0.91
    reason:
      ko: 유출 코드에서 발견된 에이전트 아키텍처를 이해했다면, Claude Code 훅 시스템의 실제 활용법도 함께 보면 좋다.
      ja: 流出コードで発見されたエージェントアーキテクチャを理解したなら、Claude Codeフックシステムの実践的な活用法も併せて読むと良い。
      en: If you understood the agent architecture from the leaked code, the practical hook system usage guide pairs well with it.
      zh: 如果你理解了泄露代码中的Agent架构，那么Claude Code Hook系统的实际应用指南也值得一读。
  - slug: claude-code-plugins-complete-guide
    score: 0.88
    reason:
      ko: 유출된 코드의 44개 피처 플래그 중 일부는 이미 플러그인으로 공식 출시됐다. 공식 기능과 미출시 기능의 차이를 비교해볼 수 있다.
      ja: 流出コードの44個のフィーチャーフラグの一部はすでにプラグインとして公式リリースされた。公式機能と未リリース���能の違いを比較できる。
      en: Some of the 44 leaked feature flags have already shipped as official plugins. Compare official features with unreleased ones.
      zh: 泄露代码中44个功能标志的一部分已作为插件正式发布。可以比较官方功能与未发布功���的差异。
  - slug: ai-coding-secrets-sprawl-mcp-config-security
    score: 0.90
    reason:
      ko: 유출 사건의 보안 시사점과 직접 연결된다. MCP 설정과 시크릿 관리의 위험성을 다룬 글이다.
      ja: 流出事件のセキュリティ上の示唆と直接つながる。MCP設定とシークレット管理のリスクを扱った記事だ。
      en: Directly connected to the security implications of the leak. Covers MCP config and secret management risks.
      zh: 与泄露事件的安全影响直接相关。讨论了MCP配置和密钥管理的风险。
  - slug: litellm-supply-chain-attack-ai-dependency-security
    score: 0.87
    reason:
      ko: npm 소스맵 유출도 결국 공급망 보안 문제다. AI 도구의 의존성 보안을 다른 각도에서 분석한 글이다.
      ja: npmソースマップ流出も結局サプライチェーンセキュリティの問題だ。AIツールの依存関係セキュリティを別の角度から分析した記事。
      en: The npm source map leak is ultimately a supply chain security issue. Analyzes AI tool dependency security from a different angle.
      zh: npm source map泄露归根结底也是供应链安全问题。从不同角度分析了AI工具依赖安全。
  - slug: production-grade-ai-agent-design-principles
    score: 0.85
    reason:
      ko: 유출된 에이전트 루프와 메모리 설계를 참고하려면, 프로덕션급 AI 에이전트의 설계 원칙도 함께 읽어야 한다.
      ja: 流出されたエージェントループとメモリ設計を参考にするなら、プロダクショングレードAIエージェントの設計原則も一緒に読むべきだ。
      en: If you want to reference the leaked agent loop and memory design, read this alongside for production-grade AI agent design principles.
      zh: 如果要参考泄露的Agent循环和内存设计，也应该一起阅读生产级AI Agent的设计原则。
---

3月31日，Anthropic在npm上发布了Claude Code v2.1.88。本应只是一次普通的补丁更新，但这个包里夹带了一个59.8MB的`.map` source map文件。安全研究员Chaofan Shou在X上曝光后，几小时内在GitHub上被fork了8.4万次。

1,906个TypeScript文件。约51万行代码。Claude Code的整个客户端Agent harness就这样完整暴露了。

我亲自研读了这份源码，发现了其中几个耐人寻味的设计决策。比起"泄露"这个词带来的刺激感，我更想聚焦于这份代码库中Agent开发者真正可以参考的模式。

## 泄露是怎么发生的

原因是Bun。Claude Code运行在Bun runtime上而非Node.js，而Bun存在一个[已知bug](https://github.com/oven-sh/bun/issues/28001)——即使在生产构建中也会附带source map。这个issue早在3月11日就已被报告，但在泄露发生时仍未修复。

Anthropic方面向CNBC和VentureBeat表示，"这是部署打包过程中的人为失误，并非安全入侵"。声称不涉及客户数据或认证信息。

然而这已经是第二次了。几天前，由于CMS配置错误，与未公开模型"Mythos"相关的内部文档也曾泄露。在传闻正筹备IPO的时间节点上，运营安全做到这个程度，实在令人担忧。

## Agent循环 — 比想象中复杂

泄露代码中最先引起注意的是Agent循环结构。

本质上，Claude Code是一个响应式系统。用户发送消息，它做出回应。到这里都很常规。但代码中存在一个名为`PROACTIVE`的feature flag，开启后会激活`KAIROS`模式。KAIROS通过心跳机制周期性地评估"现在有没有值得做的事？"，即使没有用户输入也能自主行动。

简单来说，就是一个7x24小时在后台运行的守护进程模式，自主判断"要不要整理内存？""要不要建议重构这段代码？"。

我在这个架构中最关注的一点是"initiative（决定做什么）"和"execution（实际执行）"的明确分离。即使KAIROS判断"这件事值得做"，执行权限仍需通过独立的gate验证。构建自主Agent时最危险的场景就是"AI自作主张导致出了大问题"，这种分离设计在一定程度上缓解了这个风险。

由于这是尚未发布的功能，实际运行效果如何尚不得知。

## Prompt缓存 — 省钱的技术

用过Claude Code的人应该知道token成本不低。从泄露代码来看，Anthropic对此也极为重视。

核心是`SYSTEM_PROMPT_DYNAMIC_BOUNDARY`这个模式。它将system prompt拆分为"不变的前半部分"和"每次变化的后半部分"。前半部分放入缓存复用，从而降低昂贵的prompt处理成本。

```typescript
// 泄露代码中发现的模式（简化版）
const systemPrompt = [
  STATIC_INSTRUCTIONS,        // 缓存 — 工具定义、行为规则等
  SYSTEM_PROMPT_DYNAMIC_BOUNDARY,  // 边界标记
  DYNAMIC_CONTEXT              // 每次更新 — 当前文件状态、git信息等
];
```

Reddit r/ClaudeAI上有人基于泄露代码找到了"缓存失效bug"，据报告将token消耗降低了10〜20倍。Theo Browne等开发者批评这个缓存失效bug将不必要的成本转嫁给了用户。

这个模式本身在我的项目中也可以使用。调用LLM API时将system prompt的静态部分分离，利用prompt caching，尤其在长对话会话中能显著降低成本。

## 三层内存 — 为什么Claude Code能记住上下文

内存架构令人印象深刻，采用三层设计：

<strong>第一层 — 轻量索引指针</strong>：常驻内存。仅充当目录角色，告知"关于某个主题的记忆存储在哪里"。

<strong>第二层 — 主题文件</strong>：按需加载。按项目和主题分离的实际记忆内容。

<strong>第三层 — 会话记录</strong>：仅通过grep操作访问。存储完整的历史对话，但仅在搜索时引用。

此外还有一个名为`autoDream`的进程。在空闲状态时整理内存、去重并合并。"autoDream"这个名字很有趣——就像人在睡眠时整理记忆一样，Agent也在空闲时整理记忆，这是一个精妙的隐喻。

看到这个设计，我恍然大悟：我在CLAUDE.md中记录项目上下文后Claude Code能很好地利用它，原来背后是这套内存结构在起作用。第一层索引持有"关于这个项目的信息在CLAUDE.md中"的指针，需要时从第二层加载实际内容。

## Undercover模式 — 这有点令人不适

泄露代码中有一个名为`undercover.ts`的90行文件。它的作用是：当Claude Code向外部开源项目贡献代码时，擦除Anthropic的痕迹。

System prompt中包含这样的内容：

> "You are operating UNDERCOVER... Your commit messages... MUST NOT contain ANY Anthropic-internal information. Do not blow your cover."

它会从commit message中移除内部代号（Capybara、Numbat、Fennec、Tengu）和Slack频道名，同时删除"由Claude Code编写"的标记。据称是不可逆的抑制。

这让人感到不适。在开源社区中AI参与贡献本身不是问题，但刻意隐瞒就是另一回事了。故意隐藏贡献来源，与开源的透明性原则相悖。除非Anthropic解释为什么要开发这个功能，否则会损害信任。

当然，仅从代码无法判断这是实际使用中的功能还是实验性开发后未启用的功能。由feature flag管理，可能处于未激活状态。

## 竞争对手防御机制

源码中还发现了几个针对竞争对手的防御装置。

<strong>Anti-distillation</strong>：在API请求中加入`anti_distillation: ['fake_tools']`标志，注入虚假的工具定义。当竞争对手截获流量用作训练数据时，这些虚假数据会混入其中。`CONNECTOR_TEXT`这个服务端机制在摘要助手输出时嵌入加密签名，防止完整推理链被捕获。

<strong>DRM</strong>：API请求中包含`cch=ed1b0`等占位符值，Bun的基于Zig的HTTP栈会在发送前将其替换为计算后的哈希值。由于在JavaScript runtime层之下运行，无法通过runtime patching绕过。

据我调查，在客户端代码中嵌入这种级别的anti-distillation防御，这是我首次见到的模式。通常这类处理不是放在服务端吗？放在客户端的话，一旦代码泄露（就像现在这样），机制会完全暴露。

## 隐藏功能 — 44个Feature Flag

共发现44个未发布的feature flag。其中几个：

- <strong>后台Agent</strong>：7x24小时持续运行。一个Claude协调多个worker Claude的多Agent编排。
- <strong>Cron调度</strong>：在预设时间自动执行。
- <strong>语音指令模式</strong>：通过语音下达指令。
- <strong>Playwright浏览器自动化</strong>：直接操控浏览器。
- <strong>自愈Agent</strong>：sleep后自动恢复。
- <strong>子Agent执行模型三种</strong>：fork、teammate、worktree。

还有一些像玩笑一样的东西。`buddy/companion.ts`文件中实现了一个饲养18种虚拟宠物的"Buddy系统"。有稀有等级tier，1%概率出闪光（shiny）宠物。这是宝可梦吗？

这些功能中有一部分已在最近的Claude Code更新中正式发布。后台Agent和Cron调度等功能给人一种在泄露后被快速公开化的感觉。泄露是否加速了发布进程？

## 从安全角度需要关注的问题

比泄露本身更严重的问题是：CVE-2025-59536、CVE-2026-21852等漏洞已被识别，源码公开使得利用这些漏洞变得更加容易。

具体而言：
- 克隆包含恶意`.claude/`配置文件的仓库可实现任意代码执行（RCE）
- 通过MCP服务器或环境变量窃取API密钥

据BleepingComputer报道，GitHub上已发现以"Claude Code泄露分析"为诱饵分发信息窃取恶意软件的案例。查看泄露代码本身不会被攻击，但需要警惕那些自称是"泄露代码分析工具"的仓库。

我认为，代码公开本身从长远来看可能有利于安全——因为更多人可以审查代码。问题在于这是"非计划性公开"。Anthropic在毫无准备的情况下代码外泄，如果攻击者在此期间率先发现了漏洞，那就很危险了。

## 开发者可以借鉴什么

直接fork泄露代码使用存在DMCA风险，不建议这样做。Anthropic已对GitHub上8,100多个仓库发起了DMCA takedown。但参考架构模式是另一回事。

我认为最值得借鉴的几点：

<strong>Prompt缓存策略</strong>。将system prompt拆分为静态/动态部分的模式适用于所有使用LLM API的项目。利用Anthropic API的prompt caching功能，可以大幅降低重复调用的成本。

<strong>三层内存设计</strong>。索引 → 主题 → 原始数据的层级结构可直接应用于RAG系统或需要长期记忆的Agent。其中"始终驻留内存"与"按需加载"的分离是关键。

<strong>Initiative与Execution的分离</strong>。构建自主Agent时，将"决定做什么的模块"与"实际执行的模块"分离，中间设置权限gate的模式。这对减少生产环境Agent的事故有直接帮助。

## Anthropic接下来怎么办？

一位名叫Sigrid Jin的开发者使用OpenAI Codex将泄露的TypeScript代码重写为Python，创建了"claw-code"项目。2小时内GitHub star达到5万，目前已达10.5万。AI重写的代码是否适用著作权，在法律上尚无定论。

Anthropic通过DMCA takedown进行了应对，但一旦代码在互联网上传播，就无法消除。分析结果已散布在数十个博客、wiki和论坛上。从某种意义上说，这已经成为了"强制开源"。

一个疑问是，这起事件是否会影响Anthropic的开源战略。在代码已全部公开的情况下，坚持闭源是否还有意义？或许正式转向开源、接受社区贡献才是更好的选择。当然，Anthropic大概不愿公开anti-distillation等竞争防御机制。

这起事件最大的教训可能不在于技术层面。它提醒我们：发布到npm的包要再检查一下`.map`文件。`files`字段或`.npmignore`中是否明确排除了source map——我自己的项目也该检查一下了。

## 参考资料

- [Engineer's Codex — Diving into Claude Code's Source Code Leak](https://read.engineerscodex.com/p/diving-into-claude-codes-source-code)
- [Kilo Blog — Claude Code Source Leak: A Timeline](https://blog.kilo.ai/p/claude-code-source-leak-a-timeline)
- [Fortune — Anthropic leaks its own AI coding tool's source code](https://fortune.com/2026/03/31/anthropic-source-code-claude-code-data-leak-second-security-lapse-days-after-accidentally-revealing-mythos/)
- [VentureBeat — Claude Code's source code appears to have leaked](https://venturebeat.com/technology/claude-codes-source-code-appears-to-have-leaked-heres-what-we-know)
- [SecurityWeek — Critical Vulnerability in Claude Code Emerges Days After Source Leak](https://www.securityweek.com/critical-vulnerability-in-claude-code-emerges-days-after-source-leak/)
- [Kir Shatrov — Reverse engineering Claude Code](https://kirshatrov.com/posts/claude-code-internals)
- [BleepingComputer — Claude Code leak used to push infostealer malware](https://www.bleepingcomputer.com/news/security/claude-code-leak-used-to-push-infostealer-malware-on-github/)
