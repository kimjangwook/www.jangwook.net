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

当然，如果这一行代码就是全部，这篇文章就没有存在的必要了。真正的问题在后面——环境配置、会话管理、流式事件处理，以及最重要的："在生产环境中使用这个，实际需要花多少钱？"

Anthropic于4月8日开放了Claude Managed Agents公开测试版。这是一项托管服务，无需自行构建智能体运行时。如果你曾经手动实现过智能体循环，就会明白这句话的分量。我就是其中之一，所以我直接接入了API进行测试。

## 从头搭建智能体循环时会发生什么

将工具执行结果回传给模型的循环、失败时的重试策略、上下文窗口填满时如何压缩、超时处理、沙箱环境隔离……这些都是在编写实际智能体逻辑之前需要解决的基础设施问题。根据我的经验，这些周边代码花费的时间往往比智能体本身还多。

我在[Claude Code的5种智能体工作流模式](/zh/blog/zh/claude-code-agentic-workflow-patterns-5-types)中介绍过编排器-子智能体模式，但即使模式清晰，在实际代码中实现和维护它又是另一回事。

Managed Agents就是Anthropic宣布承担这部分基础设施工作的声明。

## 工作原理：三个概念就够了

核心概念有三个：**智能体（Agent）**、**环境（Environment）**、**会话（Session）**。

智能体是系统提示词与允许工具集的可复用组合。环境是智能体运行的隔离沙箱。会话是实际的执行单元。

```python
from anthropic import Anthropic

client = Anthropic()

# 第一步：定义智能体（创建一次，可复用）
agent = client.beta.agents.create(
    name="code-review-agent",
    model="claude-sonnet-4-6",
    system="You review Python code for security issues and performance problems.",
    tools=[{"type": "agent_toolset_20260401"}],
)

# 第二步：创建执行环境
environment = client.beta.environments.create(
    name="prod-env",
    config={
        "type": "cloud",
        "networking": {"type": "unrestricted"},
    },
)

# 第三步：开始会话（实际执行单元）
session = client.beta.sessions.create(
    agent=agent.id,
    environment_id=environment.id,
    title="Review PR #482",
)
```

会话创建后，通过SSE流进行消息收发。

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

所有端点都需要`managed-agents-2026-04-01`测试版请求头，但Python SDK会自动处理。

实际接入API后的感受是：界面比预期的简洁。`agent_toolset_20260401`内置工具集一次性激活了文件读取、网页搜索和代码执行。与之前逐一定义工具相比，体验差异明显。

## 成本：需要自己算

$0.08/小时初看起来很便宜。但运行24小时就是$1.92，一个月就是$57.6，还不包括令牌费用。

以每天处理10个代码审查会话为例：
- 平均每个会话5分钟 × 10个 = 50分钟/天
- 月运行时长：约25小时 → $2
- 每个会话Sonnet 4.6令牌费用：约$0.05〜0.15
- <strong>预计月总成本：$20〜50左右</strong>

这个范围是可以接受的。问题在于全天候运行的智能体。24/7运行意味着仅运行时费用就达到月$58，令牌费用还要叠加在上面。如果工作负载无法预测，应采用事件驱动设计——仅在需要时开启会话，这是控制成本的关键。

## 两个仍然让我担忧的问题

我认为这个服务有价值，但有两件事一直困扰着我。

<strong>供应商锁定。</strong>智能体配置、会话格式、环境容器规格全部绑定到Anthropic的实现方式。日后若要迁移到其他模型或基础设施，需要重新实现。就在这个月，Anthropic已经修改了策略，切断了Claude Pro/Max订阅用户的第三方工具访问权限。将基础设施托管出去，意味着也要接受他们未来的决策。

<strong>公开测试版的实际范围。</strong>发布公告中最令人期待的多智能体协调和自我评估功能并不在公开测试版中，需要单独申请研究预览权限。与[直接配置和运行智能体团队](/zh/blog/zh/claude-agent-teams-guide)相比，目前的Managed Agents核心是单个智能体的托管执行。

## 什么时候值得使用

如果团队没有足够的工程资源投入智能体基础设施，现在就值得尝试。两人团队花时间维护智能体循环，机会成本太高——托管服务是正确的选择。

反之，如果你已在使用多模型策略，或者已有自定义编排逻辑，则无需着急。等公开测试版升级为正式版、多智能体功能普遍可用时再重新评估也不迟。

接入API只需30分钟。现有API用户可免费使用测试版。生产环境的决策可以之后再做。
