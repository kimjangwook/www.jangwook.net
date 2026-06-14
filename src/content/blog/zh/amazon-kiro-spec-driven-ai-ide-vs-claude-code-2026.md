---
draft: true
title: 'Amazon Kiro 实战分析 — 规格驱动AI IDE能取代Claude Code吗？'
description: '通过官方文档和社区评测深度分析AWS开发的规格驱动AI IDE Kiro。涵盖EARS记法需求生成、Agent Hooks、Steering Files的实际价值，以及与Claude Code的关键差异的坦诚评估。'
pubDate: '2026-06-05'
heroImage: ../../../assets/blog/amazon-kiro-spec-driven-ai-ide-vs-claude-code-2026/hero.png
tags:
  - kiro
  - claude-code
  - ai-ide
  - spec-driven
  - aws
relatedPosts:
  - slug: cursor-3-vs-claude-code-vs-windsurf-2026
    score: 0.91
    reason:
      ko: AI IDE 비교 시리즈의 전편. Cursor, Claude Code, Windsurf를 비교한 뒤 Kiro를 함께 읽으면 2026년 AI IDE 지형 전체가 보인다.
      ja: AI IDE比較シリーズの前編。Cursor、Claude Code、Windsurfを比較してからKiroを読むと、2026年のAI IDE全体像が見えてくる。
      en: The companion piece to this article. Read the Cursor/Claude Code/Windsurf comparison first to see the full 2026 AI IDE landscape.
      zh: AI IDE比较系列的前篇。先读Cursor、Claude Code和Windsurf的比较，再结合本文，可以全面了解2026年AI IDE格局。
  - slug: specification-driven-development
    score: 0.87
    reason:
      ko: 스펙 주도 개발 방법론의 철학적 배경을 다룬다. Kiro가 이 철학을 어떻게 도구화했는지 이해하는 데 좋은 사전 독서다.
      ja: スペック駆動開発の哲学的背景を扱う。KiroがこのアプローチをどうIDEに組み込んだか理解するのに役立つ事前読書だ。
      en: Covers the philosophical background of spec-driven development. Good pre-reading to understand how Kiro operationalizes this approach in an IDE.
      zh: 讲解规格驱动开发的哲学背景。有助于理解Kiro如何将这种方法论工具化的前置阅读。
  - slug: claude-code-hooks-workflow
    score: 0.83
    reason:
      ko: Claude Code의 Hooks 시스템을 심층 분석한 글. Kiro의 Agent Hooks와 비교해서 읽으면 두 도구의 자동화 철학 차이가 명확해진다.
      ja: Claude CodeのHooksシステムを詳しく分析。KiroのAgent Hooksと比べて読むと、両ツールの自動化哲学の違いがよく分かる。
      en: Deep dive into Claude Code's Hooks system. Read alongside Kiro's Agent Hooks to clearly see the difference in automation philosophy between the two tools.
      zh: 深入分析Claude Code的Hooks系统。与Kiro的Agent Hooks对比阅读，可以清楚看出两款工具自动化哲学的区别。
  - slug: openai-codex-api-release-vs-claude-code-comparison-may-2026
    score: 0.79
    reason:
      ko: OpenAI Codex API vs Claude Code 비교 분析. 세 도구를 함께 놓고 보면 2026년 AI 코딩 도구 선택의 전체 맥락이 잡힌다.
      ja: OpenAI Codex API vs Claude Code比較。3つのツールを並べて見ると、2026年のAIコーディングツール選択の全体像が掴める。
      en: OpenAI Codex API vs Claude Code comparison. Viewing all three tools together gives the full picture for AI coding tool selection in 2026.
      zh: OpenAI Codex API与Claude Code的比较分析。三款工具放在一起看，可以把握2026年AI编码工具选择的完整背景。
  - slug: claude-code-agentic-workflow-patterns-5-types
    score: 0.76
    reason:
      ko: Claude Code의 에이전트 워크플로우 5가지 패턴을 정리한 글. Kiro의 스펙 주도 方式이 Claude Code의 어떤 패턴을 대체하고 어떤 걸 보완하는지 비교할 수 있다.
      ja: Claude Codeの5種類のエージェントワークフローパターンをまとめた記事。KiroのSpec駆動方式がClaude Codeのどのパターンを代替し、補完するかを比較できる。
      en: Covers Claude Code's 5 agentic workflow patterns. Helps compare which patterns Kiro's spec-driven approach replaces and which it complements.
      zh: 整理了Claude Code的5种智能体工作流模式。可以对比Kiro的规格驱动方式替代了哪些模式、补充了哪些模式。
---

AI编码工具市场来了一个新玩家。亚马逊2025年7月公开发布的Kiro，不是简单的AI自动补全，而是建立在"写代码之前先写规格"这一理念之上的IDE。作为每天使用Claude Code的人，我想弄清楚这在实践中究竟意味着什么。

先说结论：Kiro和Claude Code并不是直接竞争关系。它们解决的是不同的问题。但如果不理解这种差异，两者都可能被误用。

关于这篇文章的性质：这是Source Review分析。由于Kiro是GUI IDE，我尝试了CLI安装，但它本质上是一个macOS应用，自动化沙盒测试受到限制。我分析了官方文档、发布说明、GitHub Issues和社区评测，并在本文中重现了`.kiro/`目录结构。没有实际运行的功能，我不会声称已经测试过。

## Kiro试图解决的问题："随感编码"的陷阱

Kiro的官方口号是"Beyond Vibe Coding"——超越随感编码。要理解这意味着什么，需要先看看随感编码会产生什么问题。

现在很多团队是这样使用AI编码工具的：输入"做一个用户认证功能"，智能体生成代码，代码能跑，项目继续推进。两个月后，没有人能解释为什么要这样设计。没有需求文档，设计决策只是口头传达，测试是事后添加的。这就是随感编码的典型后果。

Kiro的答案是：不要从提示词直接跳到代码。先生成需求文档，审查技术设计，组织任务列表，然后再写代码。开发者需要审批每个阶段才能进入下一步。

[我之前写过规格驱动开发的哲学](/zh/blog/zh/specification-driven-development)，在特定场景下这种方法确实有价值。多名开发者共同开发复杂功能时，需求频繁变动需要可追溯性时，这种结构化的工作流程实际上很有帮助。

## 规格驱动开发工作流程：实际结构

Kiro的规格系统在`.kiro/specs/`目录下按序生成三个文件。

```
.kiro/
├── steering/
│   ├── product.md      # 产品做什么，谁在使用
│   ├── tech.md         # 技术栈、框架、依赖关系
│   └── structure.md    # 目录结构、架构规则
├── specs/
│   └── user-auth/
│       ├── requirements.md    # EARS记法需求
│       ├── design.md          # 技术设计、时序图
│       └── tasks.md           # 具体实现任务列表
└── hooks/
    └── on-save.json    # 文件保存时的自动执行动作
```

其中`requirements.md`是核心。Kiro使用EARS（Easy Approach to Requirements Syntax，需求语法简易方法）记法来结构化需求。示例如下：

```markdown
## 用户故事：为任务分配负责人

WHEN 项目经理将任务分配给开发人员时
THE SYSTEM SHALL 更新负责人并发送通知
SO THAT 开发人员能够了解新的任务分配

**验收标准：**
- WHEN task.assignee_id被更新 THEN 通知前一个负责人
- WHEN task.assignee_id为null THEN 任务变为未分配状态
- IF assignee_id不存在 THEN 返回HTTP 404
```

这种格式的优点很明确：需求读起来像自然语言，但结构化程度足以减少AI的误解空间，开发者也更容易审查。

`design.md`包含技术实现设计：时序图、数据库架构变更、API端点设计等。`tasks.md`将其分解为具体的实现步骤清单。

```markdown
# 实现任务

- [ ] 1. 向Task模型添加assignee_id字段（需要迁移）
- [ ] 2. 创建PATCH /tasks/{task_id}/assign端点
- [ ] 3. 实现通知服务
- [ ] 4. 编写边缘情况测试（null、无效用户ID）
- [ ] 5. 更新OpenAPI文档
```

点击"Run all Tasks"后，Kiro会分析任务依赖关系，并行执行独立任务。根据官方文档，这能显著减少大多数功能规格的执行时间。

## Agent Hooks和Steering Files：Kiro真正领先的地方

![Kiro规格驱动工作流程图](../../../assets/blog/amazon-kiro-spec-driven-ai-ide-vs-claude-code-2026/kiro-spec-workflow.png)

这部分我认为真的很有趣。Claude Code和Kiro都有Hooks概念，但实现方式不同。

[Claude Code的Hooks系统](/zh/blog/zh/claude-code-hooks-workflow)是将shell命令绑定到Claude Code执行事件的方式。功能强大，但配置需要JSON和shell脚本，存在一定技术门槛。

Kiro的Agent Hooks则不同。可以用自然语言定义Hook行为：

> "每次保存React组件时：1) 如果`__tests__`目录中没有对应的测试文件，则创建一个基本渲染测试。2) 如果存在，则更新以覆盖新的props或函数。3) 运行测试确认通过。"

这是官方文档中的实际示例。可以将这类AI驱动的动作绑定到文件保存、文件创建、文件删除等事件上。不需要写任何脚本就能自动化团队的代码质量门控。对于希望自动化执行规范但不想深入工具配置的团队来说，这是实质性的优势。

Steering Files更简单但很实用。在`.kiro/steering/`下的Markdown文件中写好项目上下文，Kiro会在所有后续对话中记住这些信息。不必每次再重复"这个项目使用FastAPI和PostgreSQL"。Claude Code的`CLAUDE.md`也有类似功能，但Kiro将其规范地分成了三个文件（`product.md`、`tech.md`、`structure.md`）。

说实话，这两个功能是Claude Code没有或尚未完善的地方。Hooks的自然语言定义方式和Steering Files的结构化设计，是Kiro真正做得好的部分。

## 定价与现实局限

目前Kiro的定价：

| 套餐 | 价格 | 积分 | 实际使用量 |
|------|------|------|----------|
| Free | 免费 | 50 | 活跃编码约1〜2小时 |
| Pro | $20/月 | 1,000 | 日常开发 |
| Pro+ | $40/月 | 2,000 | 重度用户 |
| Power | $200/月 | 10,000 | 团队/企业 |

免费版的50积分足够体验工作流程，但不够日常使用——很快就会用完。Pro版$20/月、1000积分是普通开发者的现实起点。

与Claude Code Max的$100/月相比，Kiro Pro便宜得多。但由于工作方式根本不同，直接比较没有太大意义。

MCP（Model Context Protocol）Kiro也支持，通过`.kiro/mcp.json`配置，与其他MCP客户端方式相同。但正如[OpenAI Codex和Claude Code的比较](/zh/blog/zh/openai-codex-api-release-vs-claude-code-comparison-may-2026)中提到的，Claude Code生态系统中MCP服务器的数量和成熟度处于不同量级。

一个坦率的不足：Kiro是VS Code的分支。优点是可以直接使用VS Code生态系统的扩展。缺点是对于VS Code以外的工作流——尤其是终端中心型开发者——并不适合。如果像我一样偏好Neovim或终端优先的工作流，很难将Kiro作为主力工具。

## Kiro和Claude Code的本质区别

最常收到的问题："Kiro能取代Claude Code吗？"

我的答案是否定的——至少现在不能。具体原因如下：

**模型性能**：Kiro使用Claude Sonnet + Amazon Nova。Claude Code可以直接使用Claude Opus 4。在复杂推理和多步骤任务上，Opus 4的性能差距是客观存在的。

**速度和灵活性**：Claude Code跳过规格阶段直接执行。对于小型bug修复、快速重构和探索性编码，Claude Code快得多。Kiro的规格生成过程有价值，但需要时间。10分钟的修改还要先做规格，那就是额外负担了。

**工作流集成**：[Claude Code的智能体工作流模式](/zh/blog/zh/claude-code-agentic-workflow-patterns-5-types)已经成熟。通过MCP连接GitHub、Jira、Slack和内部API无需自定义配置。Kiro也支持MCP，但生态系统成熟度不同。

**方法论哲学**：这是最根本的区别。Claude Code说"我来帮你实现想要的功能"。Kiro说"我们先理清需求、审查设计，然后再实现"。前者选择速度，后者选择严谨。两者都没有错，只是优化方向不同。

从社区实际使用模式来看，许多资深开发者同时使用两款工具：复杂新功能的规划用Kiro，实际实现和迭代修改用Claude Code。这目前可能是最合理的组合。

## 我的坦诚评估：适合谁用

我不认为Kiro被过度炒作。它要解决的问题确实存在，方法也合理。但有几点需要明确。

**Kiro真正发挥价值的场景：**
- 多名开发者协作开发复杂功能时
- 需求频繁变动、可追溯性很重要时
- 想要自动化代码质量门控但不想写脚本时
- 已经以VS Code为主力编辑器时

**Kiro不适合的场景：**
- 独立工作且速度优先时
- 偏好终端中心的工作流时
- 已经熟练使用Claude Code或Cursor且不想改变工作方式时
- 80%的工作是修改现有代码或修复bug时

我认为规格优先的开发方式可能是AI编码工具未来的方向。现在这种智能体随意生成代码的模式，在规模扩大后会变得难以维护。规格在前、代码在后的方式长期来看更可持续。

不过，"长期更可持续"并不意味着"现在就应该切换"。用免费版的50积分亲身体验一下，判断规格工作流是否符合自己的思维方式。一次体验就足以知道这个工具是否适合你。

最后值得一提的一点：亚马逊为Kiro向Anthropic购买了Claude的使用授权。这意味着在AWS基础设施上、用Anthropic的模型运行的IDE。AI工具生态系统正在以令竞争分析变得有趣的方式相互缠绕。

---

**参考资料：**
- [Kiro官方文档](https://kiro.dev/docs/)
- [Kiro发布博客](https://kiro.dev/blog/introducing-kiro/)
- [AWS re:Post — Kiro架构分析](https://repost.aws/articles/AROjWKtr5RTjy6T2HbFJD_Mw/)
- [InfoQ — Kiro规格驱动AI IDE](https://www.infoq.com/news/2025/08/aws-kiro-spec-driven-agent/)
