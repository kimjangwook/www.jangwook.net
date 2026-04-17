---
title: Dapr Agents v1.0 GA — How to Make AI Agents Survive in Kubernetes
description: >-
  Analyzing Dapr Agents v1.0 announced at KubeCon Europe 2026 — its durable
  workflows, automatic recovery, and scale-to-zero — and how it differs from
  existing agent frameworks.
pubDate: '2026-03-24'
heroImage: ../../../assets/blog/dapr-agents-v1-cncf-production-ai-framework-hero.png
tags:
  - ai-agent
  - kubernetes
  - cloud-native
  - dapr
  - production
relatedPosts:
  - slug: claude-agent-teams-guide
    score: 0.94
    reason:
      ko: '자동화, AI/ML, DevOps, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、DevOps、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, DevOps, architecture with
        comparable difficulty.
      zh: 在自动化、AI/ML、DevOps、架构领域涵盖类似主题，难度相当。
  - slug: claude-code-cli-migration-guide
    score: 0.94
    reason:
      ko: '자동화, AI/ML, DevOps, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、DevOps、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, DevOps, architecture with
        comparable difficulty.
      zh: 在自动化、AI/ML、DevOps、架构领域涵盖类似主题，难度相当。
  - slug: terraform-ai-batch-infrastructure
    score: 0.94
    reason:
      ko: '자동화, AI/ML, DevOps, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、DevOps、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, DevOps, architecture with
        comparable difficulty.
      zh: 在自动化、AI/ML、DevOps、架构领域涵盖类似主题，难度相当。
  - slug: github-agentic-workflows-cicd-ai
    score: 0.94
    reason:
      ko: '자동화, AI/ML, DevOps, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、DevOps、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, DevOps, architecture with
        comparable difficulty.
      zh: 在自动化、AI/ML、DevOps、架构领域涵盖类似主题，难度相当。
  - slug: openai-promptfoo-ai-agent-devsecops
    score: 0.94
    reason:
      ko: 'AI/ML, DevOps, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: AI/ML、DevOps、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in AI/ML, DevOps, architecture with comparable
        difficulty.
      zh: 在AI/ML、DevOps、架构领域涵盖类似主题，难度相当。
---

Yesterday, Dapr Agents v1.0 GA was announced at KubeCon Europe 2026 in Amsterdam.

Honestly, my first reaction was "yet another agent framework?" LangGraph, CrewAI, AutoGen, OpenClaw — we're in an era where counting the number of agent frameworks is itself pointless. But when I looked more closely at the Dapr Agents announcement, this one feels different. **It focuses not on agent "intelligence" but on agent "survival."** The core idea is that even if a process dies, a node restarts, or the network drops, the agent picks up right where it left off.

## Why Yet Another Framework

Most agent frameworks focus on LLM call logic. Prompt chaining, tool calling, [multi-agent conversation](/en/blog/en/claude-agent-teams-guide) — it's all about "what should the agent do." But if you've ever run agents in production, you've probably experienced something like this:

- A timeout mid-LLM API call that tanks the entire workflow
- An agent that processed steps 1 and 2 out of 3, then the Pod restarted and it ran everything from scratch
- Spinning up 10 agents simultaneously and blowing up memory

Dapr Agents solves these problems using Dapr runtime's infrastructure building blocks. Dapr, a CNCF project with 34K+ GitHub stars, has already proven distributed system patterns in microservices — state management, pub/sub, service invocation — and Dapr Agents applies them directly to agents.

## The Core: What Is a Durable Agent

The most eye-catching feature is the `DurableAgent` class. What makes it different from a regular agent is that every LLM call and tool execution is saved as a **checkpoint**. If you kill the process mid-workflow, it resumes from the last saved point upon restart.

```python
from dapr_agents import DurableAgent
from dapr_agents.workflow.runners import AgentRunner

weather_agent = DurableAgent(
    name="WeatherAgent",
    role="Weather Assistant",
    instructions=["Help users with weather information"],
    tools=[get_weather],
    llm=DaprChatClient(component_name="llm-provider"),
)

runner = AgentRunner()
runner.serve(weather_agent, port=8001)
```

Run it with the Dapr CLI:

```bash
dapr run --app-id weather-agent --app-port 8001 \
  --resources-path ./components -- python agent.py
```

Under the hood, it runs on Dapr's **Virtual Actor model**. Each agent is represented as an Actor, and Actors are thread-safe and automatically placed across distributed environments. You can run thousands of agents on a single machine or distribute them across a Kubernetes cluster.

I think this approach is quite sensible. Instead of agent frameworks reinventing distributed systems on their own, it builds on top of [already-proven infrastructure](/en/blog/en/deep-agents-architecture-optimization). While LangGraph implements custom checkpointing and CrewAI builds its own memory system, Dapr Agents just plugs into whatever you're already running — Redis, PostgreSQL, DynamoDB — with support for 30+ databases as state stores out of the box.

## Scale-to-Zero and Performance

The most attractive part of the Virtual Actor model is scale-to-zero. When an agent is idle, it's unloaded from memory but retains its state. When called again, it activates within milliseconds. According to Diagrid's benchmarks, Actor activation latency is ~3ms at tp90 and ~6.2ms at tp99.

With existing frameworks, keeping 100 agents on standby eats up a ton of memory, but with Dapr Agents, they activate only when a request comes in and disappear when done. It works like a serverless function without losing state.

## So How Do You Choose a Framework

| | Dapr Agents | LangGraph | CrewAI |
|---|---|---|---|
| **Core Strength** | Infrastructure durability | Complex workflow graphs | Role-based team composition |
| **Failure Recovery** | Automatic (durable workflow) | Manual checkpointing | Limited |
| **Kubernetes** | Native (sidecar) | Separate setup | Separate setup |
| **Scaling** | Scale-to-zero, automatic | Manual | Manual |
| **State Management** | 30+ DB plugins | In-memory/custom | In-memory |
| **Learning Curve** | Medium (Dapr knowledge required) | High (graph theory) | Low |
| **Language** | Python only | Python | Python |

Let me be honest — Dapr Agents is not a silver bullet.

**It only supports Python.** It's v1.0 and there's still no C# or Java SDK. If your team runs JVM-based systems in an enterprise setting, adopting it right now is tough. It's sitting at around 630 GitHub stars, so the community is still small. Compared to LangGraph or CrewAI ecosystems, plugins and examples are lacking.

And **depending on the Dapr runtime is a double-edged sword.** If your team already uses Dapr, you can naturally integrate agents into your existing infrastructure. But if you're new to Dapr, you'll need to learn sidecar architecture, component YAMLs, and the Dapr CLI just to spin up a single agent. You can easily end up with "10 lines of agent logic + 100 lines of infra config."

## My Personal Take

I think Dapr Agents has carved out a unique position in the "agent framework wars." While most frameworks focus on making "smarter agents," Dapr Agents focuses on making "agents that don't die." If you've actually operated agents in production, this direction resonates.

It was impressive that ZEISS presented a case study at the KubeCon keynote where they used Dapr Agents to extract optical parameter documentation. It shows just how important agent "not dying" is in business-critical workloads.

That said, if you're considering adoption right now, two conditions need to be met. First, your team should already be running Kubernetes. Second, your agents need to run long-lived durable workflows, not just fire-and-forget. For simple RAG pipelines or one-off tool calls, LangGraph or CrewAI are much lighter.

The official CNCF backing, and the fact that it's built on Dapr, a proven runtime — these two things will be Dapr Agents' biggest competitive advantages in the long run. Agent frameworks are a dime a dozen, but a cloud-native agent runtime? This is the only one so far.
