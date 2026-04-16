---
title: 亲测Claude Managed Agents — 无需基础设施，30分钟部署AI智能体
description: >-
  对Anthropic于4月公开测试的Claude Managed
  Agents的真实评测。涵盖API三步链路、$0.08/小时的实际成本计算以及供应商锁定风险。
pubDate: '2026-04-16'
heroImage: >-
  ../../../assets/blog/claude-managed-agents-production-deployment-guide-hero.jpg
tags:
  - claude
  - managed-agents
  - ai-agent
  - anthropic
relatedPosts:
  - slug: claude-agent-teams-guide
    score: 0.95
    reason:
      ko: Managed Agents가 단일 에이전트 관리형 실행에 집중하는 반면, 이 글은 여러 에이전트를 tmux로 직접 오케스트레이션하는 방법을 다룬다. 두 접근법을 비교하면 어떤 상황에서 무엇을 선택해야 하는지 판단하기 쉬워진다.
      ja: Managed Agentsが単一エージェントの管理型実行に集中する一方、この記事はtmuxで複数エージェントを直接オーケストレーションする方法を扱う。両アプローチを比較することで、どの状況で何を選択すべきか判断しやすくなる。
      en: Where Managed Agents focuses on managed single-agent execution, this post covers directly orchestrating multiple agents with tmux. Comparing both approaches makes it easier to decide which fits your situation.
      zh: Managed Agents专注于单智能体托管执行，而这篇文章介绍了使用tmux直接编排多个智能体的方法。对比两种方法，更容易判断在什么情况下选择哪种方案。
  - slug: ai-agent-cost-reality
    score: 0.94
    reason:
      ko: Managed Agents의 $0.08/시간 요금이 실제로 합리적인지 판단하려면, 이 글에서 다룬 에이전트 운영 비용 vs 인건비 비교 분석이 실질적인 기준이 된다.
      ja: Managed Agentsの$0.08/時間の料金が実際に合理的かどうか判断するには、この記事で扱ったエージェント運用コストvs人件費の比較分析が実質的な基準になる。
      en: To judge whether Managed Agents' $0.08/hr pricing is actually reasonable, the agent operating cost vs. human labor comparison in this post serves as a practical benchmark.
      zh: 要判断Managed Agents的$0.08/小时费用是否实际合理，这篇文章中分析的智能体运营成本与人力成本比较是实用的参考标准。
  - slug: claude-code-agentic-workflow-patterns-5-types
    score: 0.93
    reason:
      ko: Managed Agents의 단일 에이전트 모델을 이해했다면, 이 글에서 다룬 5가지 오케스트레이션 패턴과 비교해봐야 한다. Managed Agents가 어떤 패턴에 맞는 도구인지 파악하는 데 직접적인 도움이 된다.
      ja: Managed Agentsの単一エージェントモデルを理解したなら、この記事で扱った5つのオーケストレーションパターンと比較してみる価値がある。Managed Agentsがどのパターンに適したツールかを把握するのに直接役立つ。
      en: Once you understand Managed Agents' single-agent model, compare it against the 5 orchestration patterns in this post. It directly helps you figure out which pattern Managed Agents actually fits.
      zh: 理解了Managed Agents的单智能体模型后，应该与这篇文章介绍的5种编排模式进行比较。这直接有助于判断Managed Agents适合哪种模式。
  - slug: nvidia-nemoclaw-openclaw-enterprise-agent-platform
    score: 0.92
    reason:
      ko: Anthropic의 관리형 에이전트 서비스와 대조적으로, NVIDIA NemoClaw는 엔터프라이즈 자체 인프라 위에서 에이전트를 실행하는 방향이다. 벤더 락인이 걱정된다면 이 방향도 살펴볼 만하다.
      ja: AnthropicのManaged Agentsとは対照的に、NVIDIA NemoClawはエンタープライズ自社インフラ上でエージェントを実行する方向だ。ベンダーロックインが心配なら、この方向も検討する価値がある。
      en: In contrast to Anthropic's managed service, NVIDIA NemoClaw takes the direction of running agents on enterprise-owned infrastructure. If vendor lock-in worries you, this is worth looking into.
      zh: 与Anthropic的托管服务相反，NVIDIA NemoClaw采用在企业自有基础设施上运行智能体的方向。如果供应商锁定让你担忧，这个方向值得了解。
  - slug: context-engineering-production-ai-agents
    score: 0.91
    reason:
      ko: Managed Agents로 에이전트를 배포할 수 있게 됐다면, 실제로 잘 작동하게 만드는 핵심은 컨텍스트 엔지니어링이다. 이 글은 프로덕션 AI 에이전트의 컨텍스트 설계 원리를 다룬다.
      ja: Managed Agentsでエージェントをデプロイできるようになったら、実際にうまく動かす鍵はコンテキストエンジニアリングだ。この記事はプロダクションAIエージェントのコンテキスト設計原理を扱う。
      en: Once you can deploy agents with Managed Agents, what actually makes them work well is context engineering. This post covers the context design principles for production AI agents.
      zh: 一旦能够通过Managed Agents部署智能体，真正让它们运作良好的关键是上下文工程。这篇文章涵盖了生产AI智能体的上下文设计原则。
---

```python
agent = client.beta.agents.create(
    name="code-review-agent",
    model="claude-sonnet-4-6",
    system="You review Python code for security and performance.",
    tools=[{"type": "agent_toolset_20260401"}],
)
```

就这些。智能体创建完成。

当然，如果这一行代码就是全部，那这篇文章就没有写的必要了。真正的问题在后面。环境配置、会话管理、流式事件处理，以及最关键的——"这东西放到生产环境，实际要花多少钱。"从这里开始，事情变得复杂了。

Anthropic于4月8日开放了Claude Managed Agents公开测试版。这是一项托管服务，不需要自己搭建智能体基础设施。如果你亲手写过智能体循环，就会明白这句话的分量。我就是其中之一，所以直接接入了API来测试。结论先说——基础设施自由是真的，但这份自由附带的价格标签得仔细看。

## 写过智能体循环的人都知道这个服务为什么会出现

提到构建智能体，大多数人想到的是模型调用 → 工具执行 → 结果返回 → 再次调用模型这样的循环。看起来很简单。但实际上简单的也就到此为止了。

一旦上到生产环境，就进入了另一个世界。工具执行结果回传给模型的循环状态管理、网络中断时的恢复策略、上下文窗口快满时该丢弃哪些消息保留哪些的压缩逻辑、API超时处理，以及防止智能体执行 `rm -rf /` 之类命令的沙箱隔离。这些全是在"构建智能体"之前就要解决的基础设施问题。

根据我的经验，实际的智能体逻辑——比如"找出这个PR中的安全漏洞"这样的业务代码——远没有这些周边基础设施代码耗时。后者至少多花3倍时间。在[Claude Code的5种智能体工作流模式](/zh/blog/zh/claude-code-agentic-workflow-patterns-5-types)中我介绍过编排器-子智能体模式，但无论模式设计得多么清晰，把它转化为可维护的代码完全是另一回事。尤其是错误处理简直是噩梦。工具调用失败时要重试、要询问用户、还是直接跳过——写了几十个这样的分支之后，智能体逻辑就被埋在了条件判断的丛林里。

Managed Agents就是Anthropic宣布接管这个基础设施层的声明。你只管写业务逻辑。

## 工作原理：Agent → Environment → Session 三步链路

核心概念有三个。<strong>智能体（Agent）</strong>、<strong>环境（Environment）</strong>、<strong>会话（Session）</strong>。

智能体是系统提示词 + 允许工具集的可复用定义。创建一次后可以通过ID反复调用。环境是智能体运行的隔离容器。网络访问范围、文件系统挂载等运行条件在这里设定。会话是实际的执行单元——在智能体 + 环境组合之上运行的单个任务。

```python
from anthropic import Anthropic

client = Anthropic()

# 第1步：定义智能体（创建一次，可复用）
agent = client.beta.agents.create(
    name="code-review-agent",
    model="claude-sonnet-4-6",
    system="You review Python code for security issues and performance problems.",
    tools=[{"type": "agent_toolset_20260401"}],
)

# 第2步：创建执行环境
environment = client.beta.environments.create(
    name="prod-env",
    config={
        "type": "cloud",
        "networking": {"type": "unrestricted"},
    },
)

# 第3步：开始会话（实际执行单元）
session = client.beta.sessions.create(
    agent=agent.id,
    environment_id=environment.id,
    title="Review PR #482",
)
```

会话创建后，通过SSE（Server-Sent Events）流进行消息收发。这是与传统Messages API最大的不同之处。不是请求-响应模式，而是实时事件流。

```python
with client.beta.sessions.events.stream(session.id) as stream:
    client.beta.sessions.events.send(
        session.id,
        events=[{
            "type": "user.message",
            "content": [{"type": "text", "text": "帮我检查这个Python文件: ..."}],
        }],
    )
    for event in stream:
        if event.type == "agent.message":
            print(event.content)
```

实际接入后立刻感受到一个特点。会话在连接断开后依然存活。笔记本合上再打开，会话还在运行；重新连接流之后，可以继续接收这段时间的事件。对于长时间运行的智能体任务，这是相当有意义的功能。我自己写的智能体循环中，这部分是最脆弱的——WebSocket一断开，就得单独写代码把状态存到Redis然后恢复。

所有端点都需要 `managed-agents-2026-04-01` beta header，但Python SDK通过 `client.beta.*` 命名空间自动处理了这一点。

## 内置工具集解析：agent_toolset_20260401里有什么

创建智能体时在 `tools` 参数中传入 `agent_toolset_20260401`，内置工具集就会一次性全部激活。这既是方便之处，同时也让人不太放心。

根据官方文档，包含以下工具：

- <strong>Bash</strong> —— 执行Shell命令。可以安装包、运行测试、调用CLI
- <strong>文件操作</strong> —— 读取、写入、修改、搜索（grep）、模式匹配（glob）
- <strong>网页搜索</strong> —— 实时网页搜索（单独计费：$10/1,000次）
- <strong>网页抓取</strong> —— 从URL获取内容
- <strong>代码执行</strong> —— 在沙箱中运行Python/JS代码

实际使用中最好用的是Bash + 文件操作的组合。"克隆这个仓库，跑一下测试，分析失败的测试用例"——这种请求一个会话就能搞定。以前要做这类工作，得逐个定义工具schema、编写执行结果的解析逻辑、加上错误处理。这整个过程现在全省了。

有一点需要注意。<strong>网页搜索是单独计费的</strong>。虽然包含在agent_toolset中，但每次使用都会额外产生$10/1,000次的费用。如果智能体在做研究任务时过度调用网页搜索，费用会迅速攀升。我一开始忽略了这点，结果在一个测试会话中发现搜索了47次，着实吓了一跳。在系统提示词中加上"仅在确实需要时才使用网页搜索"之类的约束是比较现实的做法。

另外，官方发布中提到的<strong>Computer Use（屏幕操作）</strong>和<strong>多智能体协调</strong>不包含在公开测试版中。需要另外申请研究预览权限。这部分下面会详细讨论。

## 成本现实：用三个场景亲自算了一遍

单看$0.08/小时这个数字，似乎很便宜。但实际上是运行时费用 + Token费用 + 网页搜索费用分开计算的结构。运行时按毫秒计量，只在会话状态为"running"时才计费——这倒还好。用三个场景算了一下。

<strong>场景1：代码审查智能体（按需调用）</strong>

每天10个PR审查。每个会话平均5分钟，使用Sonnet 4.6。

| 项目 | 计算 | 月费用 |
|------|------|--------|
| 运行时 | 50分钟/天 × 22天 = 约18小时 | $1.44 |
| Token（输入） | ~5K tokens/会话 × 220次 × $3/1M | $3.30 |
| Token（输出） | ~2K tokens/会话 × 220次 × $15/1M | $6.60 |
| 网页搜索 | 不使用 | $0 |
| <strong>合计</strong> | | <strong>~$11/月</strong> |

这个价格相当合理。如果把它看作节省了一名初级开发人员的代码审查时间，投入产出比很明确。

<strong>场景2：研究智能体（每周3次批量运行）</strong>

每周3次技术趋势研究。每个会话平均20分钟，含网页搜索，使用Opus 4.6。

| 项目 | 计算 | 月费用 |
|------|------|--------|
| 运行时 | 20分钟 × 12次 = 4小时 | $0.32 |
| Token（输入） | ~20K tokens/会话 × 12 × $5/1M | $1.20 |
| Token（输出） | ~10K tokens/会话 × 12 × $25/1M | $3.00 |
| 网页搜索 | ~30次/会话 × 12 × $10/1000 | $3.60 |
| <strong>合计</strong> | | <strong>~$8/月</strong> |

注意网页搜索费用几乎和Token费用持平。研究类智能体如果不控制搜索次数，这里的成本会爆炸。

<strong>场景3：监控智能体（7×24全天候运行）</strong>

24小时运行，Sonnet 4.6，每10分钟检查一次。

| 项目 | 计算 | 月费用 |
|------|------|--------|
| 运行时 | 24h × 30天 = 720小时 | $57.60 |
| Token（输入） | ~1K tokens × 4,320次 × $3/1M | $12.96 |
| Token（输出） | ~500 tokens × 4,320次 × $15/1M | $32.40 |
| <strong>合计</strong> | | <strong>~$103/月</strong> |

全天候运行的费用确实不低。光运行时就是每月$58，Token费用还要叠加在上面。这种情况下，必须采用事件驱动架构——仅在需要时创建会话并立即关闭。

还有一点——<strong>Batch API折扣不适用于Managed Agents</strong>。如果你之前一直在用Batch API享受50%的折扣，迁移到Managed Agents后这个折扣就没了。这在官方文档中有明确说明，但写在了很不起眼的位置。

## 优点：确实节省时间的部分

先讲了成本可能显得有些负面，但实际用下来确实有明显的好处。

<strong>基础设施代码归零。</strong>自己写智能体循环时，工具执行 → 结果解析 → 模型重新调用 → 状态管理 → 错误恢复的代码全部消失了。体感上800〜1,000行的基础设施代码被上面几行API调用替代了。

<strong>会话持久性。</strong>上面提过但值得再强调一次。客户端连接断开后会话仍然继续运行。把一个30分钟的代码分析任务交给智能体，然后去做别的事。回来重新连接流，就能接收到这段时间的事件。

<strong>沙箱隔离。</strong>智能体能执行Bash命令这件事从安全角度来说是可怕的。Managed Agents将每个环境运行在隔离容器中，网络访问范围也可以在环境配置中限制。要自己实现这些，得配置Docker + 网络策略 + 文件系统挂载控制。光是这部分就很有价值。

## 不足之处：供应商锁定风险与Beta的局限

如果只有优点，"直接用就完了"就是答案了，但现实并非如此。

<strong>供应商锁定程度很深。</strong>智能体定义、环境配置、会话管理API全部是Anthropic专属的。与OpenAI Assistants API不兼容，与LangChain、CrewAI等框架也无法直接对接。日后如果想迁移到Gemini或GPT，就得重新实现智能体逻辑。

这不是理论上的风险。就在这个月，Anthropic修改了Claude Pro/Max订阅用户的第三方工具访问策略。把基础设施托管出去，意味着也要接受这类策略变更。NVIDIA NemoClaw这样的[自有基础设施智能体平台](/zh/blog/zh/nvidia-nemoclaw-openclaw-enterprise-agent-platform)作为替代方案出现，也正是这个背景。

<strong>多智能体协调缺席。</strong>发布会上最令人兴奋的功能——智能体创建其他智能体并行分配任务——不在公开测试版中。需要另外申请研究预览权限，审批要多久也不确定。当前的Managed Agents只支持单个智能体的托管执行。与[直接组建智能体团队运作的方式](/zh/blog/zh/claude-agent-teams-guide)相比，功能范围要窄得多。

<strong>Batch API折扣不适用。</strong>如果之前在用Batch API做大批量处理，需要注意。Managed Agents会话内的Token消耗不享受Batch API的50%折扣。把批处理任务迁移到Managed Agents，Token成本可能翻倍。

<strong>Prompt缓存的效果下降。</strong>由于是基于会话的模式，即使反复使用相同的系统提示词，每次新建会话都需要重新预热缓存。在频繁创建短会话的模式下，Prompt缓存的成本节约效果会大打折扣。即便缓存读取成本只是基础输入价格的10%，缓存未命中频繁的话也没有意义。

## 适合谁，谁应该再等等

<strong>现在值得尝试的情况：</strong>

- 没有工程师投入智能体基础设施的2〜5人团队。可以把基础设施维护时间转移到产品开发上。
- 单个智能体能搞定的任务——代码审查、文档生成、数据分析等独立任务
- 需要快速搭建智能体POC（概念验证）的场景。30分钟就能出一个可运行的原型。
- 现有API客户可以免费使用Beta版（只需支付运行时 + Token费用）

<strong>不急着用的情况：</strong>

- 正在使用多模型策略，或者不想被绑定到特定供应商的团队
- 已经有自研的智能体编排代码并且运行良好的情况
- 多智能体协调是核心需求的情况——公开测试版暂不支持
- 依赖Batch API折扣的大批量处理管道

我目前还没有在生产环境中使用。原因很简单。我运行的智能体是[基于tmux同时运行多个的架构](/zh/blog/zh/claude-agent-teams-guide)，而Managed Agents目前的公开测试版只支持单个智能体。等多智能体功能正式开放后会重新评估。

## 接下来打算做什么

已经申请了研究预览权限。想亲自验证多智能体协调到底是达到了实用水平，还是仅停留在营销演示的程度。审批通过后，计划用Managed Agents的多智能体功能复现目前基于tmux的工作流，从成本、速度、稳定性三个维度进行对比。

还有一个好奇的点是，Anthropic会把Managed Agents的价格维持多久。公开测试期间的$0.08/小时在正式版（GA）时是否还能保持，还是会涨价。AWS Lambda就有过初期低价抢市场后来涨价的先例。在加深基础设施依赖之前，这一点需要持续关注。

## 参考资料

- [Claude Managed Agents官方文档](https://platform.claude.com/docs/en/managed-agents/overview)
- [Managed Agents快速入门](https://platform.claude.com/docs/en/managed-agents/quickstart)
- [工具参考](https://platform.claude.com/docs/en/managed-agents/tools)
- [Anthropic官方公告](https://claude.com/blog/claude-managed-agents)
