---
title: 'I Tried Claude Managed Agents — Deploy AI Agents in 30 Minutes'
description: >-
  An honest review of Anthropic's Claude Managed Agents, launched in public beta
  on April 8, 2026. Covers the 3-step API chain, real cost calculations at
  $0.08/hr, and vendor lock-in risks.
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

That's it. Agent created.

If that one line were truly all there is to it, this post wouldn't need to exist. The real questions come next — environment setup, session management, streaming event handling, and most importantly: what does this actually cost in production?

Anthropic launched Claude Managed Agents in public beta on April 8, 2026. It's a fully managed service where you don't build your own agent runtime. If you've ever hand-rolled an agent loop, you know how much that means. I'm one of those people, so I went ahead and wired up the API directly.

## What Happens When You Build Agent Loops From Scratch

Routing tool execution results back to the model, retry logic on failure, deciding what to do when the context window fills up, timeout handling, sandboxing. This is all infrastructure you solve *before* you write the actual agent logic. In my experience, this surrounding code takes longer than the agent itself.

I covered the orchestrator-subagent pattern in [5 Claude Code Agentic Workflow Patterns](/en/blog/en/claude-code-agentic-workflow-patterns-5-types), but even when the pattern is clear, implementing and maintaining it in production code is a different challenge.

Managed Agents is Anthropic saying: we'll take that part off your plate.

## How It Works: Three Concepts Are All You Need

The core model has three pieces: **Agent**, **Environment**, and **Session**.

An agent is a reusable bundle of system prompt + allowed tools. An environment is the isolated sandbox where the agent runs. A session is the actual execution unit.

```python
from anthropic import Anthropic

client = Anthropic()

# Step 1: Define your agent (create once, reuse)
agent = client.beta.agents.create(
    name="code-review-agent",
    model="claude-sonnet-4-6",
    system="You review Python code for security issues and performance problems.",
    tools=[{"type": "agent_toolset_20260401"}],
)

# Step 2: Create an execution environment
environment = client.beta.environments.create(
    name="prod-env",
    config={
        "type": "cloud",
        "networking": {"type": "unrestricted"},
    },
)

# Step 3: Start a session (the actual execution unit)
session = client.beta.sessions.create(
    agent=agent.id,
    environment_id=environment.id,
    title="Review PR #482",
)
```

Once a session is live, you send messages and receive responses via SSE stream.

```python
with client.beta.sessions.events.stream(session.id) as stream:
    client.beta.sessions.events.send(
        session.id,
        events=[{
            "type": "user.message",
            "content": [{"type": "text", "text": "Review this Python file: ..."}],
        }],
    )
    for event in stream:
        if event.type == "agent.message":
            print(event.content)
```

All endpoints require the `managed-agents-2026-04-01` beta header, though the Python SDK sets this automatically.

What struck me when I actually wired this up: the interface is cleaner than I expected. The `agent_toolset_20260401` built-in toolset activates file reading, web search, and code execution in one shot. Compare that to defining tools one by one in a custom loop — the difference is noticeable.

## The Costs: You Have to Do the Math Yourself

$0.08 per hour sounds cheap at first glance. Run it 24 hours and that's $1.92. Run it all month and that's $57.60 — before token costs.

A code review agent handling 10 sessions per day looks like this:
- 5 minutes average per session × 10 sessions = 50 minutes/day
- Monthly runtime: ~25 hours → $2
- Sonnet 4.6 token cost per session: ~$0.05–$0.15
- <strong>Estimated monthly total: $20–50</strong>

That's reasonable. The problem is always-on agents. 24/7 means $58/month just in runtime, with token costs stacking on top. If your workload isn't batch-predictable, design for event-driven sessions — open them only when needed.

## Two Things That Still Bother Me

I think this is useful, but two things haven't left my head.

<strong>Vendor lock-in.</strong> Your agent config, session format, and environment container specs are all tied to Anthropic's implementation. Migrating to another model or infrastructure later means re-implementation. This month alone, Anthropic changed policy to cut off third-party tool access for Claude Pro/Max subscribers. Handing over your infrastructure means you're also accepting their future decisions.

<strong>The actual scope of the public beta.</strong> The most interesting features in the announcement — multi-agent coordination and self-evaluation — aren't in the public beta. They require a separate research preview request. Compared to [directly configuring and running agent teams yourself](/en/blog/en/claude-agent-teams-guide), what you get today in Managed Agents is essentially managed execution for single agents.

## When It Makes Sense

If your team doesn't have engineering bandwidth to invest in agent infrastructure, this is worth trying now. A two-person team spending time maintaining an agent loop is paying a high opportunity cost — managed is the right call.

On the other hand, if you're running a multi-model strategy or already have custom orchestration logic, there's no rush. Wait for the public beta to reach GA, when multi-agent features go generally available, and evaluate again then.

Wiring up the API takes 30 minutes. Existing API customers get free beta access. The production decision can wait.
