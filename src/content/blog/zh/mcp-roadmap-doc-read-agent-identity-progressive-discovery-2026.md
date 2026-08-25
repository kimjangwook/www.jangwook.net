---
title: "我把 MCP 路线图当运营计划读了一遍，然后改掉了本季度的建设清单"
description: "MCP 路线图不是交付排期表。目录规模的经济账、文档所在的层级、以及可替换的身份边界，才是技术决策者在下一份规范正式落地之前真正该动手的地方。"
pubDate: 2026-08-25
heroImage: '../../../assets/blog/mcp-roadmap-doc-read-agent-identity-progressive-discovery-2026/hero.png'
tags:
  - MCP
  - AI 智能体
  - 工程管理
  - 架构治理
  - 协议策略
relatedPosts:
  - slug: mcp-builtin-vs-external-harness-cost-28x-measured-2026
    score: 0.88
    reason:
      ko: MCP 실행 경로를 선택할 때 비용 구조와 운영 통제권을 함께 판단하는 기준을 다룹니다.
      ja: MCPの実行経路を選ぶ際に、コスト構造と運用上の制御権をどう評価するかを解説します。
      en: It examines how to evaluate cost structure and operational control when choosing an MCP execution path.
      zh: 它讨论了在选择 MCP 执行路径时，如何同时评估成本结构与运营控制权。
  - slug: mcp-vs-a2a-vs-open-responses-agent-protocol-comparison-2026
    score: 0.85
    reason:
      ko: MCP, A2A, Open Responses를 같은 역할로 오해하지 않기 위한 프로토콜 경계와 선택 기준을 설명합니다.
      ja: MCP、A2A、Open Responsesを同じ役割のものとして扱わないための、プロトコル境界と選定基準を説明します。
      en: It clarifies protocol boundaries and selection criteria so MCP, A2A, and Open Responses are not treated as interchangeable.
      zh: 它说明了协议边界与选择标准，避免将 MCP、A2A 和 Open Responses 误认为可以互换。
  - slug: context-engineering-production-ai-agents
    score: 0.80
    reason:
      ko: 프로덕션 에이전트에서 컨텍스트를 예산과 운영 자산으로 다루는 방법을 다룹니다.
      ja: 本番エージェントにおいて、コンテキストを予算と運用資産として扱う方法を解説します。
      en: It explains how to manage context as both a budget and an operational asset in production agents.
      zh: 它解释了如何在生产级智能体中，将上下文视为预算和运营资产来管理。
---

我想弄清楚一件事：MCP 的路线图，到底会不会改变一个工程团队本季度该建什么。于是我把路线图跟已发布的 schema、官方指南，以及本地受控环境里的目录加载行为放在一起对了一遍。结论很清楚。目录规模和身份边界这两件事在你自己手里，现在就该动手；而那些还没进规范的路线图条目，不该进交付计划。

这个区分之所以重要，是因为一个 AI 集成会在标准化流程给出答案之前很久，就开始积累成本和访问控制风险。先量你的目录，再收紧它，同时把身份实现留成可替换的。

## 路线图是优先级地图，不是发布合同

管理层第一个容易犯的错，是把协议路线图当成供应商的发货日历来读。

MCP 的路线图讲的是维护者打算在接下来一段时间里优先投入哪些方向。这是有价值的情报，它告诉架构负责人，评审精力、工作组和未来的互操作性大概会集中在哪里。但它不代表某个被点名的特性已经可以拿来开发，也不代表它现在的形态能活着走完标准化。

> This roadmap reflects current thinking rather than firm commitments. Priorities may shift, some items may be delivered differently than described or deferred, and work not listed here may still be included in the release.

> — [Roadmap — SEP Prioritization](https://modelcontextprotocol.io/development/roadmap)

这段话应该改变 CTO 的运营模型。一个路线图条目该进的是技术观察清单、标准参与计划和能力风险台账，而不是自动进入已承诺的产品依赖。

差别在文档所处的层级上看得最清楚。`subscriptions/listen`、`nextCursor`、`structuredContent` 都有已发布 schema 的证据。Tasks 曾出现在早前的核心 schema 里，后来从当前核心 schema 中消失，转而走扩展路径等待最终纳入。DPoP、ID-JAG、webhooks 和渐进式发现，在我核对的四个 schema 版本里都没有出现：2025-06-18、2025-11-25、2026-07-28 和 draft。

一套共用的词汇把这些差别藏起来了。路线图给它们相同的视觉分量。工程计划不能这么给。

## 我测了目录加载，成本随工具数量线性上涨

眼下真正在花钱的运营问题，没有智能体身份那么好听，但它已经在计费了。

我在本地起了一个 MCP 服务器，暴露 200 个合成工具，每页 20 个，接入 Claude 2.1.241。三次完全相同的运行里，客户端都发起了 10 次 `tools/list` 调用，一路跟着游标从 `none` 走到 `180`，在用户提出任何有意义的问题之前，就已经接收了 62,708 字节。

20 个工具的基线只需要一次 list 调用，6,235 字节。工具从 20 个增加到 200 个，目录规模变成 10 倍，传输字节数变成 10.06 倍。

这不是一个 token 计价模型。它比计价更靠底层：它测的是在任务相关的工作开始之前，系统就已经放进来的载荷。真实的 token 与延迟影响取决于客户端、模型、工具定义长度、缓存行为和传输路径。但架构上的方向已经能看清了。暴露的工具越多，首轮目录载荷越大。

官方的客户端指南，在更大的目录规模上描述的是同一类问题。

> Once the tool definitions take up a significant part of the available context window, clients should switch to progressive discovery. We recommend that clients implement thresholds to determine when to switch:

> — [Client Best Practices (2026-07-28)](https://modelcontextprotocol.io/docs/2026-07-28/develop/clients/client-best-practices)

对决策层来说，相关的单位经济学不止于模型 token。一个不加筛选的大目录，还会推高提示词审查成本、工具选择的歧义、回归测试范围，以及一项敏感能力仅仅因为恰好挂在同一个网关后面就被暴露出去的概率。

集中化能减少集成面。它同样能把一条干净的领域边界，变成一坨臃肿的首轮载荷。这个取舍需要一个负责人和一份预算。

## 分页不等于渐进式发现

很容易说一句：分页不是已经解决了吗。并没有。

`nextCursor` 从 2025-06-18 起就存在于已发布的 MCP schema 里。协议告诉客户端如何识别结果集的末尾，如何同时支持分页和非分页的流程。它没有要求客户端在取完一页之后停下来，也没有传达下一页是否相关、是否昂贵、是否涉及特权、是否可以安全地延后。

> Clients **SHOULD**: * Treat a missing `nextCursor` as the end of results * Support both paginated and non-paginated flows

> — [Server Utilities — Pagination (2026-07-28)](https://modelcontextprotocol.io/specification/2026-07-28/server/utilities/pagination)

在我测的这套环境里，客户端跟完了每一个游标。那是客户端策略，不是分页的要求。当游标只说了一句"还有更多结果"，全量拉取就是最保守的策略：客户端无从知道它需要的那个工具是不是躺在没看过的那一页上。

所以渐进式发现不是换了个好听名字的分页。它需要相关性信号，也需要一套决策策略。客户端得拿到足够的信息，才能只要一个更窄的能力集合，而不至于悄无声息地让某个必需的工具变得够不着。

路线图承认了这个缺口。

> **Progressive discovery**: Core Primitives WG. Clients learn a server's tools and resources as they need them instead of ingesting the full catalog up front, with a defined interaction with the caching work under [HTTP-Native Transport Unification and Hardening](#2-http-native-transport-unification-and-hardening).

> — [Roadmap — Progressive discovery](https://modelcontextprotocol.io/development/roadmap)

协议设计还开着口子。业务问题不会等它。

## 把目录规模变成一道工程控制

如果团队在运营内部 MCP 网关，我会立三道交付关卡。

第一，把目录规模做成 CI 里的预算项。测四个数：工具数量、序列化后的工具定义字节数、一次连接内的 `tools/list` 调用次数、以及累计响应字节数。当一个服务器越过约定阈值，就必须给出明确的架构决定：按业务能力拆分、收窄会话内可见的集合，或者为额外预算给出理由。

这不是官僚流程。它把那场本来会在事故复盘时才发生的讨论提前了：为什么一个智能体看得到跟任务无关的能力，为什么平台团队要等到采用规模上来之后，才发现自己的首轮上下文成本是多少。

第二，要求团队在内部文档里，每写一条 MCP 能力主张，就在旁边标注它的出处层级。来自 `/specification/` 的特性，和 `/docs/` 下的指南、工作组章程、`/development/roadmap` 的条目，工程含义完全不同。这条很小的文档规矩，能挡住一个常见的失效模式：开发者在官方域名下读到一句路线图的措辞，转手就把它当成了平台保证。

第三，把身份的获取和验证收进同一个适配器边界之内。别让 token 解析、audience 选择、委托规则和授权假设散落在每一个工具处理函数里。这条边界今天可以直接沿用组织现有的 OAuth 姿态，同时留下一个受控的落点，将来采纳新的身份标准时只改这一处。

这些控制手段，是把一个否则只能一台服务器一台服务器、一个 PR 一个 PR、最后一个例外一个例外去处理的问题，变成制度。

## 最有力的反对意见，对小目录是成立的

最强的那条反驳，值得比它通常得到的更多尊重。

一个还没进 schema 的条目，也许恰恰因为没有存量实现要顾及，反而跑得最快。如果一个团队现在自己发明一套渐进式发现的约定，标准化落地时这些工作可能就白做了。MCP 为这类演进留了实验性扩展路径。过早自造私有协议，会带来迁移工作量、互操作缺口，以及一种"已经做完了"的错觉。

对工具只有几十个、目录载荷很小的团队，这条反驳是对的。在我的基线里，20 个工具产生 6,235 字节。对很多部署场景来说，这点量级相比设计、运营、编写文档、日后再替换掉一套发现机制的复杂度，只是噪声。等待的代价很小，自造行为的重写代价是实打实的。

这条反驳在内部整合把目录推到几百个的时候失效。这种情形在企业环境里很常见：客户数据、授权、运营流程、报表分属不同系统，因为集中化承诺了治理和复用，它们被统一收到一个面向智能体的网关后面。于是网关暴露的是这些系统能力的总和。

到了这一步，"等规范"就不是一个中性决定了。它是在接受目录载荷和工具选择面的线性增长。

我的主张不是去造一套跟 MCP 竞争的协议，而是用好宿主和网关持有者手上已经有的控制手段：按角色做服务器切分、用策略限制会话内的工具集、给目录设预算。就算未来的发现原语长成另一个样子，这几项也仍然是站得住的架构决定。

## 身份要在标准化之前就做成可替换的

路线图在身份方向上的意图有战略价值，但它还不构成把一套新认证模型写死进代码的理由。

> **DPoP**: Agent Identity WG (forming during this roadmap period). Finalize the specification for Demonstrating Proof of Possession (DPoP) and focus on getting widespread adoption.

> — [Roadmap — DPoP / Agent identity and delegation](https://modelcontextprotocol.io/development/roadmap)

"forming during this roadmap period"这半句话，是关键的架构信号。它的意思是决策者应该为变化做准备，而不是假装终点已经是一个可实现的目标。

这一点在智能体以委托权限调用工具、或者创建下级智能体的时候最要紧。这类流程里，系统必须精确回答几个难题：是哪个主体发起了这次动作，正在执行的是哪个智能体，token 可以交给哪个 audience，以及被委托的权限是否比父级权限更窄。

把这些答案直接嵌进工具代码的平台，等于给未来所有服务埋下一次迁移。把它们隔在单一身份适配器后面的平台，可以继续用现有的授权基础设施，同时把最终的替换范围收在一条受控的接缝上。

这条接缝是风险缓释，不是投机式的过度设计。它保护的是数据完整性：在标准演进的过程中，授权决策始终可被审查、保持一致。

## 决策层要做的，是把可控的工作和标准风险分开

对 CEO 和 CTO 来说，要决定的不是 MCP 会不会成熟，而是你的交付计划是不是在指望外部标准化去解决一个你自家架构正在制造的问题。

现在就把目录管起来。给工具数量和定义载荷配一份有人负责的预算。趁一个网关还没变成一份无法治理的特权动作清单之前，按能力和归属边界把服务器拆开。

现在就把身份设计成可替换的。集中适配器，保留既有控制，别把跟营收直接相关的流程绑到一个在已发布 schema 里还找不到痕迹的路线图条目上。

在影响你经济结构和风险画像的地方，参与到路线图流程里去。路线图明说了维护者的评审时间稀缺，优先级范围之外的工作要排更长的队，也要过更高的举证门槛。对一个大型平台运营方而言，这是治理信号：影响力是可以拿到的，但只给那些带着具体运营证据、而不是带着抽象偏好来的团队。

短期内正确的姿态很明确：目录纪律和可替换的身份接缝立刻落地，同时把渐进式发现和智能体身份标准当作未来的集成目标，而不是当下的依赖。

有一种情况会让我改变这个判断：受控测量表明，在没有宿主侧限制的前提下，大目录在真实客户端的上下文、延迟和运营成本上仍然是有界的。

## 参考资料

1. [Roadmap](https://modelcontextprotocol.io/development/roadmap)
2. [Roadmap — Progressive discovery](https://modelcontextprotocol.io/development/roadmap)
3. [Roadmap — DPoP / Agent identity and delegation](https://modelcontextprotocol.io/development/roadmap)
4. [Roadmap — SEP Prioritization](https://modelcontextprotocol.io/development/roadmap)
5. [Client Best Practices (2026-07-28)](https://modelcontextprotocol.io/docs/2026-07-28/develop/clients/client-best-practices)
6. [Server Utilities — Pagination (2026-07-28)](https://modelcontextprotocol.io/specification/2026-07-28/server/utilities/pagination)
7. [schema.json](https://github.com/modelcontextprotocol/modelcontextprotocol/tree/main/schema)
8. [The next generation of MCP](https://blog.cloudflare.com/mcp-v2/)
