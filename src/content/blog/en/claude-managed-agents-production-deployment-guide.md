---
title: I Tried Claude Managed Agents — Deploy AI Agents in 30 Minutes
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
      ko: '자동화, AI/ML, DevOps, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、DevOps、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, DevOps, architecture with
        comparable difficulty.
      zh: 在自动化、AI/ML、DevOps、架构领域涵盖类似主题，难度相当。
  - slug: claude-code-cli-migration-guide
    score: 0.95
    reason:
      ko: '자동화, AI/ML, DevOps, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、DevOps、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, DevOps, architecture with
        comparable difficulty.
      zh: 在自动化、AI/ML、DevOps、架构领域涵盖类似主题，难度相当。
  - slug: dena-perl-go-migration-ai-agents
    score: 0.95
    reason:
      ko: '자동화, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, architecture with comparable
        difficulty.
      zh: 在自动化、AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: nvidia-nemoclaw-openclaw-enterprise-agent-platform
    score: 0.95
    reason:
      ko: '자동화, AI/ML, DevOps, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、DevOps、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, DevOps, architecture with
        comparable difficulty.
      zh: 在自动化、AI/ML、DevOps、架构领域涵盖类似主题，难度相当。
  - slug: ai-agent-cost-reality
    score: 0.94
    reason:
      ko: '자동화, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, architecture with comparable
        difficulty.
      zh: 在自动化、AI/ML、架构领域涵盖类似主题，难度相当。
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

Of course, if that single snippet were the whole story, there'd be no reason to write this post. The real issues start right after. Environment configuration, session management, streaming event handling, and above all: "What does this actually cost in production?" That's where things get complicated.

Anthropic opened the Claude Managed Agents public beta on April 8. It's a managed service that lets you skip building your own agent infrastructure. If you've ever hand-rolled an agent loop yourself, that statement hits differently. I'm one of those people, so I went ahead and wired up the API. Bottom line: the infrastructure freedom is real, but you need to read the price tag attached to that freedom very carefully.

## If You've Built an Agent Loop, You Already Know Why This Service Exists

When people talk about building an agent, they usually picture the loop: model call -> tool execution -> return results -> model call again. Sounds simple. And it is simple -- up to that point.

The moment you push it to production, you enter a different world. State management for the loop that feeds tool execution results back into the model. Recovery strategies for when the network drops mid-run. Compression logic for deciding which messages to keep and which to discard when the context window fills up. API timeout handling. And sandboxing to prevent the agent from executing something like `rm -rf /`. All of this is infrastructure you have to solve <strong>before</strong> you even get to "building an agent."

In my experience, the surrounding infrastructure code -- not the actual agent logic like "find security vulnerabilities in this PR" -- took roughly three times longer. I covered the orchestrator-subagent pattern in [5 Claude Code Agentic Workflow Patterns](/ko/blog/ko/claude-code-agentic-workflow-patterns-5-types), but no matter how clean the pattern looks on paper, turning it into maintainable production code is an entirely different challenge. Error handling was particularly brutal. When a tool call fails, do you retry? Ask the user? Just skip it? After writing dozens of these branches, the actual agent logic ends up buried under conditionals.

Managed Agents is Anthropic declaring: we'll own the infrastructure layer. You just write the business logic.

## How It Works: The Agent -> Environment -> Session 3-Step Chain

There are three core concepts: <strong>Agent</strong>, <strong>Environment</strong>, and <strong>Session</strong>.

An agent is a reusable definition of system prompt + allowed tool set. Create it once, then call it repeatedly by ID. An environment is the isolated container where the agent runs. You define execution conditions here -- network access scope, file system mounts, and so on. A session is the actual execution unit -- a single task running on top of an agent + environment combination.

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

Once a session is created, you exchange messages via an SSE (Server-Sent Events) stream. This is the biggest difference from the standard Messages API. It's not request-response -- it's a real-time event stream.

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

One thing I noticed immediately when testing: sessions survive disconnections. Close your laptop lid, reopen it, and the session is still running. Reconnect the stream and you pick up events from where you left off. For long-running agent tasks, this is a genuinely meaningful feature. In my own hand-rolled agent loops, this was always the weakest link -- when the WebSocket dropped, I had to write separate code to save state to Redis and handle recovery.

All endpoints require the `managed-agents-2026-04-01` beta header, but the Python SDK handles this automatically through the `client.beta.*` namespace.

## Anatomy of the Built-in Toolset: What's Inside agent_toolset_20260401

When you create an agent and pass `agent_toolset_20260401` to the `tools` parameter, it activates the entire built-in toolset in one shot. This is both the convenient part and the slightly unnerving part.

Per the official docs, the included tools are:

- <strong>Bash</strong> -- Shell command execution. Package installation, test runs, CLI calls -- all fair game.
- <strong>File operations</strong> -- Read, write, edit, search (grep), pattern matching (glob)
- <strong>Web search</strong> -- Real-time web search (billed separately: $10/1,000 queries)
- <strong>Web fetch</strong> -- Fetch content from URLs
- <strong>Code execution</strong> -- Run Python/JS code in a sandbox

The combination I found most useful was Bash + file operations. A request like "clone this repo, run the tests, and analyze the failures" can be handled in a single session. Previously, this required defining tool schemas one by one, writing result parsing logic, and adding error handling for each. That entire process just disappears.

One thing to watch out for: <strong>web search is billed separately</strong>. It's included in the agent_toolset, but each use adds $10/1,000 queries on top of everything else. If your agent is doing research work and fires off web searches aggressively, costs can escalate fast. I overlooked this at first and was surprised to see 47 search queries from a single test session. Adding something like "only use web search when absolutely necessary" to the system prompt is the practical move.

Also worth noting: <strong>Computer Use (screen interaction)</strong> and <strong>multi-agent coordination</strong>, both mentioned in the official announcement, are not included in the public beta. You need to apply for separate research preview access. More on that below.

## The Cost Reality: I Ran the Numbers on Three Scenarios

$0.08/hour sounds cheap at first glance. But in practice, it's runtime cost + token cost + web search cost, all billed separately. The good news is that runtime is measured in milliseconds and only charges while the session state is "running." I ran the numbers on three scenarios.

<strong>Scenario 1: Code Review Agent (On-Demand)</strong>

10 PR reviews per day. Average 5 minutes per session, using Sonnet 4.6.

| Item | Calculation | Monthly Cost |
|------|------------|-------------|
| Runtime | 50 min/day x 22 days = ~18 hours | $1.44 |
| Tokens (input) | ~5K tokens/session x 220 sessions x $3/1M | $3.30 |
| Tokens (output) | ~2K tokens/session x 220 sessions x $15/1M | $6.60 |
| Web search | Not used | $0 |
| <strong>Total</strong> | | <strong>~$11/mo</strong> |

This is quite reasonable. If you think of it as saving a junior developer's code review time, the ROI is clear.

<strong>Scenario 2: Research Agent (Batch, 3x per Week)</strong>

Tech trend research 3 times a week. Average 20 minutes per session, with web search, using Opus 4.6.

| Item | Calculation | Monthly Cost |
|------|------------|-------------|
| Runtime | 20 min x 12 sessions = 4 hours | $0.32 |
| Tokens (input) | ~20K tokens/session x 12 x $5/1M | $1.20 |
| Tokens (output) | ~10K tokens/session x 12 x $25/1M | $3.00 |
| Web search | ~30 queries/session x 12 x $10/1000 | $3.60 |
| <strong>Total</strong> | | <strong>~$8/mo</strong> |

Notice that web search costs rival the token costs. For research agents, if you don't control search frequency, this is where costs explode.

<strong>Scenario 3: Monitoring Agent (24/7 Always-On)</strong>

Running 24 hours, Sonnet 4.6, checking every 10 minutes.

| Item | Calculation | Monthly Cost |
|------|------------|-------------|
| Runtime | 24h x 30 days = 720 hours | $57.60 |
| Tokens (input) | ~1K tokens x 4,320 checks x $3/1M | $12.96 |
| Tokens (output) | ~500 tokens x 4,320 checks x $15/1M | $32.40 |
| <strong>Total</strong> | | <strong>~$103/mo</strong> |

Always-on gets expensive. Runtime alone is $58/month, with tokens stacking on top. For this use case, an event-driven architecture where you create sessions only when needed and terminate them immediately is essential.

One more thing -- <strong>Batch API discounts do not apply to Managed Agents</strong>. If you've been getting the 50% discount through the Batch API, that discount vanishes the moment you move to Managed Agents. This is stated in the official docs, but it's tucked away in a spot that's easy to miss.

## The Good: Where It Actually Saves You Time

After leading with the cost breakdown, I might come across as negative. But there are parts that are genuinely good once you start using it.

<strong>Zero infrastructure code.</strong> The code you'd normally write for tool execution -> result parsing -> model re-invocation -> state management -> error recovery just disappears entirely. By my estimate, 800〜1,000 lines of infrastructure code gets replaced by those few API calls above.

<strong>Session persistence.</strong> I mentioned this earlier, but it's worth emphasizing. Sessions keep running even when the client disconnects. You can hand off a 30-minute code analysis task to the agent and go do something else. Come back, reconnect the stream, and you'll receive all the events that occurred in the meantime.

<strong>Sandbox isolation.</strong> The fact that an agent can execute Bash commands is terrifying from a security perspective. Managed Agents runs each environment in an isolated container, and you can restrict network access scope in the environment configuration. To build this yourself, you'd need to set up Docker + network policies + file system mount controls. This alone is worth the price of admission.

## The Not-So-Good: Vendor Lock-In Risk and Beta Limitations

If the positives were all there was to it, "just use it" would be the obvious answer. Reality is more nuanced.

<strong>Vendor lock-in runs deep.</strong> The agent definition, environment configuration, and session management APIs are all Anthropic-proprietary. They're not compatible with OpenAI's Assistants API, and they don't plug directly into frameworks like LangChain or CrewAI. If you later want to migrate to Gemini or GPT-based infrastructure, you'll need to reimplement your agent logic from scratch.

This isn't a theoretical risk. Just this month, Anthropic changed their policy on third-party tool access for Claude Pro/Max subscribers. Handing over your infrastructure means accepting these kinds of policy changes along with it. It's no coincidence that alternatives like NVIDIA NemoClaw -- [an enterprise agent platform that runs on your own infrastructure](/ko/blog/ko/nvidia-nemoclaw-openclaw-enterprise-agent-platform) -- are emerging in this context.

<strong>Multi-agent coordination is missing.</strong> The most exciting feature from the announcement -- agents spawning other agents and distributing work in parallel -- isn't in the public beta. You need to apply for separate research preview access, and how long approval takes is anyone's guess. As it stands, Managed Agents is limited to managed execution of a single agent. Compared to [directly assembling and running agent teams yourself](/ko/blog/ko/claude-agent-teams-guide), the functional scope is narrow.

<strong>Batch API discount doesn't apply.</strong> If you've been using the Batch API for bulk processing, pay attention. Token consumption within Managed Agents sessions doesn't get the Batch API's 50% discount. Migrating batch workloads to Managed Agents could double your token costs.

<strong>Prompt caching becomes less effective.</strong> Because it's session-based, even if you reuse the same system prompt, cache warming has to start over each time a new session is created. For patterns that frequently spin up short-lived sessions, the cost savings from prompt caching diminish. Even if cache read costs are 10% of the base input price, frequent cache misses make that irrelevant.

## Who Should Try It Now, and Who Should Wait

<strong>Worth trying now:</strong>

- Teams of 2〜5 without an engineer to dedicate to agent infrastructure. You can redirect infrastructure maintenance time toward product development.
- Tasks that a single agent can handle -- code reviews, document generation, data analysis, and similar independent tasks.
- Situations where you need to stand up an agent POC (proof of concept) fast. You can have a working prototype in 30 minutes.
- Existing API customers can use the beta for free (you only pay runtime + token costs).

<strong>No need to rush:</strong>

- Teams running a multi-model strategy or who don't want to be locked into a specific vendor.
- Cases where you already have custom agent orchestration code that's working well.
- Cases where multi-agent coordination is a core requirement -- it's still not in the public beta.
- Pipelines that rely on Batch API discounts for bulk processing.

I'm not using it in production yet myself. The reason is straightforward: the agents I run use a [tmux-based setup for running multiple agents simultaneously](/ko/blog/ko/claude-agent-teams-guide), and the current Managed Agents public beta only supports single agents. When multi-agent capabilities become generally available, I'll reevaluate.

## What I'm Trying Next

I've applied for research preview access. I want to see firsthand whether multi-agent coordination is actually production-ready or just a polished demo. If I get approved, the plan is to run the same workloads I currently handle with tmux-based workflows through Managed Agents' multi-agent system and compare cost, speed, and reliability side by side.

There's one more thing I'm curious about: how long Anthropic will hold this pricing. Whether the $0.08/hour from the public beta will survive GA, or whether it'll go up. AWS Lambda set a precedent -- capturing the market with low initial pricing, then raising rates later. Before you deepen your infrastructure dependency, this is worth keeping an eye on.

## References

- [Claude Managed Agents Official Docs](https://platform.claude.com/docs/en/managed-agents/overview)
- [Managed Agents Quickstart](https://platform.claude.com/docs/en/managed-agents/quickstart)
- [Tools Reference](https://platform.claude.com/docs/en/managed-agents/tools)
- [Anthropic Official Announcement](https://claude.com/blog/claude-managed-agents)
