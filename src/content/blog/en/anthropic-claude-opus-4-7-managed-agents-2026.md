---
draft: true
title: "Anthropic's April Double Release — How Opus 4.7 and Managed Agents Change Agent Development"
description: "Claude Opus 4.7 (April 16) and Managed Agents beta (April 8) landed in the same month. Benchmarks are record-breaking but the community reaction is split. I break down the new tokenizer cost shock, task_budget, and what the $0.08-per-session model actually means for engineers."
pubDate: '2026-05-01'
heroImage: '../../../assets/blog/anthropic-claude-opus-4-7-managed-agents-2026-hero.png'
tags: ['Claude', 'AI Agents', 'Anthropic', 'LLM']
relatedPosts:
  - slug: 'claude-managed-agents-production-deployment-guide'
    score: 0.92
    reason:
      ko: 'Managed Agents 개요를 여기서 읽었다면, 실제 배포 절차와 트러블슈팅은 이 글에 더 자세히 정리돼 있다.'
      ja: 'Managed Agentsの概要を把握したら、実際のデプロイ手順とトラブルシューティングはこちらの記事が詳しい。'
      en: "If this overview sparked interest in Managed Agents, the deployment walkthrough and troubleshooting are covered in depth in this companion post."
      zh: '了解了Managed Agents概述后，实际部署步骤和故障排除在这篇文章中有更详细的介绍。'
  - slug: 'anthropic-claude-performance-decline-controversy-april-2026'
    score: 0.88
    reason:
      ko: '4월 Opus 4.7 커뮤니티 논란은 이전 달 성능 저하 논쟁의 연장선이다. 두 글을 함께 읽으면 Anthropic의 품질 딜레마가 선명하게 보인다.'
      ja: '4月のOpus 4.7コミュニティ論争は、前月の性能低下論争の延長線上にある。両記事を合わせて読むとAnthropicの品質ジレンマがよく見える。'
      en: "The April Opus 4.7 community backlash is a continuation of the prior month's performance decline debate — reading both reveals the pattern."
      zh: '4月Opus 4.7的社区争议是上个月性能下降争论的延伸。两篇文章结合阅读，能更清晰地看到Anthropic的质量困境。'
  - slug: 'ai-agent-cost-reality'
    score: 0.82
    reason:
      ko: 'Opus 4.7 토큰나이저 비용 충격을 실제 에이전트 운용 비용 시뮬레이션과 연결해서 읽으면 예산 계획에 직접 활용할 수 있다.'
      ja: 'Opus 4.7のトークナイザーコスト衝撃を、実際のエージェント運用コストシミュレーションと組み합わせて読むと予算計画に直接活用できる。'
      en: "Pair the Opus 4.7 tokenizer cost shock with the agent cost simulation in this post for a concrete budget planning framework."
      zh: '将Opus 4.7分词器成本冲击与实际Agent运营成本模拟结合阅读，可以直接用于预算规划。'
  - slug: 'claude-code-agentic-workflow-patterns-5-types'
    score: 0.77
    reason:
      ko: 'task_budget로 제어하려는 에이전트가 어떤 패턴 위에서 동작하는지 이해하면 파라미터 설정이 훨씬 직관적으로 된다.'
      ja: 'task_budgetで制御するエージェントがどのパターンで動作しているかを理解すると、パラメータ設定がずっと直感的になる。'
      en: "Understanding which agentic pattern is running under your task_budget constraint makes tuning the parameter far more intuitive."
      zh: '了解task_budget控制的Agent运行在哪种模式之上，参数设置会更加直观。'
---

I refreshed the Anthropic blog twice in the second week of April. Managed Agents public beta on April 8th, Claude Opus 4.7 on April 16th. In the same month, they shipped upgrades to both the "infrastructure layer" and the "model layer."

My first reaction was genuine excitement. SWE-bench Pro at 64.3% represents roughly a 10.9-point improvement over the previous version, and Managed Agents promised to take the session infrastructure I've been maintaining by hand and let Anthropic run it. Then I started reading the community reaction, and the picture got complicated.

## What Opus 4.7 Actually Changed

Four changes were announced at the April 16 launch.

<strong>Benchmark numbers</strong>: SWE-bench Pro at 64.3% (+10.9 points from 4.6), CursorBench at 70% (+12 points). For coding agents, this is a genuine improvement.

<strong>High-resolution image support</strong>: Up to 2576px, 3.75MP — expanded from the previous 1568px/1.15MP. For UI testing automation agents or screenshot-based workflows, this is a real upgrade.

<strong>The task_budget parameter</strong>: This is the change I'm most interested in, even though it launched in beta. You can now set a token budget for the entire agent loop. Activate it with the `task-budgets-2026-03-13` header; the minimum is 20k tokens. It's advisory, not a hard cap — when the budget approaches its limit, the model tries to finish within budget rather than stopping abruptly.

<strong>xhigh effort level</strong>: A new tier above high, for tasks that benefit from deeper reasoning passes.

Here's how task_budget looks in practice:

```python
import anthropic

client = anthropic.Anthropic()

response = client.messages.create(
    model="claude-opus-4-7",
    max_tokens=4096,
    extra_headers={
        "anthropic-beta": "task-budgets-2026-03-13"
    },
    # task_budget: token budget for the entire agent loop
    # minimum 20000, advisory (not a hard cap)
    task_budget=50000,
    messages=[
        {
            "role": "user",
            "content": "Find all deprecated API calls in this repository's Python files and replace them with the current versions."
        }
    ]
)
```

I couldn't run this directly without an Anthropic API key. The code above is based on official documentation and release notes. The advisory behavior is something I've been exploring alongside [Managed Agents production deployment](/en/blog/en/claude-managed-agents-production-deployment-guide).

## What Makes Managed Agents Different

Claude Managed Agents, which moved to public beta on April 8th, is conceptually straightforward. The agent execution environment you used to manage yourself — sandboxes, session state, permission validation, long-running containers — is now operated by Anthropic's platform.

Core features per the official documentation:

- <strong>Isolated sandbox</strong>: Bash commands, file operations, web search, and MCP server execution run in an isolated environment
- <strong>Session state persistence</strong>: Filesystem and conversation context are preserved across tasks that run for minutes or hours
- <strong>Credential security</strong>: API keys and secrets are handled through permission delegation, not direct agent exposure
- <strong>Multi-agent coordination</strong>: In research preview, but allows multiple agents to collaborate on workflows

Pricing is $0.08 per session-hour plus standard Claude API token costs. The docs explicitly note that idle time is included.

Notion, Rakuten, and Sentry are named as early production adopters. Notion reported 90% cost reduction and 85% latency improvement; Rakuten claimed 97% error reduction across 70+ business units; Sentry shipped a patch agent in "weeks." These are impressive numbers — though I'd note they compare against previously unstable self-managed infrastructure, so take them as upper-bound estimates.

## The Good: Real Reduction in Agent Infrastructure Overhead

Running this blog's automation system myself, I know exactly how tedious agent session management gets. The code defending against session drops, context loss, and silent failures in long-running tasks often outweighs the actual business logic. At some point, you're spending more engineering hours on plumbing than on what the agent is supposed to do.

If Managed Agents genuinely removes that burden — and Sentry's "weeks to ship" story is real — the value proposition is clear.

The [five agentic workflow patterns](/en/blog/en/claude-code-agentic-workflow-patterns-5-types) I've written about map naturally onto Managed Agents. Running an orchestrator-subagent structure on top of Managed Agents means the platform handles state recovery and context synchronization that you'd otherwise code yourself.

task_budget also points in the right direction. Letting the model self-prioritize within a budget tends to produce better completion rates than hard cutoffs that leave tasks in broken intermediate states.

## The Bad: Benchmark-to-Practice Gap and Hidden Costs

Then the 24-hour post-launch community feedback arrived. I found a worrying pattern.

Based on developer feedback aggregated at byteiota.com, some power users described Opus 4.7 as "legendarily bad." The specific complaints converge on three things.

<strong>Safety overfitting</strong>: The threshold for detecting malicious code patterns apparently got tightened to the point where standard network calls and ordinary library usage were being refused. This works fine in a controlled benchmark environment where conservative behavior correlates with accuracy — but in real workflows, it's friction.

<strong>Literal instruction parsing</strong>: The model seems to interpret instructions more literally than 4.6, prioritizing explicit compliance over flexible reasoning. People who rely on inferring intent from context are finding it less cooperative.

<strong>Output style shift</strong>: A stronger preference for bullet-point formatting over prose. Some people prefer this; others find it harmful for creative or nuanced tasks.

The hidden cost I care about most isn't a behavior issue. It's the <strong>new tokenizer</strong>. Opus 4.7 ships a new tokenizer that uses 1〜1.35× more tokens for the same text. Published pricing didn't change, but real cost can increase up to 35%.

I wrote about [the actual economics of running AI agents](/en/blog/en/ai-agent-cost-reality) and a tokenizer change of this magnitude requires completely redoing cost projections. Anthropic not foregrounding this in the launch announcement deserves criticism.

## Cost Reality: How Much Did It Actually Go Up?

Working from available numbers, here's a rough scenario comparison:

| Scenario | Opus 4.6 baseline | Opus 4.7 estimate (tokens +25%) |
|---------|------------------|---------------------------------|
| Simple Q&A (1K tokens) | $0.005 | ~$0.006 |
| Code review (10K tokens) | $0.05 | ~$0.063 |
| Long-running agent (100K tokens) | $0.50 | ~$0.625 |

Add Managed Agents session cost ($0.08/hour) on top of that. A one-hour agent task means adding $0.08 to whatever the token bill comes to. For short batch tasks, that's expensive. For multi-hour complex tasks where you'd otherwise pay an engineer to manage the infrastructure, it may come out cheaper.

## Why task_budget Matters Now

task_budget is the quietest feature in this release. The press covered benchmark numbers and flashy Managed Agents case studies, but for developers running agents over extended periods, this parameter might be the most practically significant change.

The problem it solves: you can't reliably predict how long a complex refactoring agent will run or how many tokens it'll consume. max_tokens limits the length of a single response, not the total cost of a multi-turn agent loop. task_budget fills that gap.

The advisory mechanism is the interesting design choice. Rather than hard-stopping at the limit, the model adjusts its own priorities as the budget approaches — skipping lower-priority exploration to focus on core tasks. Whether this works reliably in practice is something I want to test with my daily-post agent, which currently has no budget guardrail.

## Managed Agents and the Development Process

When I first heard about Managed Agents, I assumed it was "Claude API with a sandbox attached." The documentation changed my mind.

The biggest shift is state management. Running agent sessions yourself, you keep hitting the same three problems: context loss when tools chain across multiple turns; restart costs when a session unexpectedly terminates; credential security when an agent needs access to GitHub, DBs, or external APIs without direct key exposure.

Managed Agents handles all three at the platform layer. Sessions that get interrupted resume with filesystem state intact. Credentials go through permission delegation. Context persists across long-running tasks.

Sentry's "weeks to ship" story might not be an exaggeration — some teams spend months building this infrastructure layer themselves.

The limitation worth naming: you're locked into Claude models. Teams running mixed-provider agent fleets will accumulate Anthropic dependency without a clean exit path.

## Who Should and Shouldn't Use Opus 4.7

Community feedback and official docs together make the fit assessment fairly clear.

**Where Opus 4.7 earns its keep**: Complex multi-file refactoring, full-codebase analysis agents, legacy migration work, automated test coverage expansion. Tasks that take a long time to complete and genuinely benefit from deeper reasoning over many steps. High-res image workflows.

**Where Opus 4.7 creates friction**: Everyday coding assistance. Asking it to "fix this type error" or "refactor this function" is wasteful — Claude Sonnet 4.6 is faster and cheaper for that. Any workflow where conservative safety filtering could cause unexpected refusals. Creative writing or open-ended reasoning where rigid literal interpretation gets in the way.

## The Bigger Picture for April's Releases

Reading April's Anthropic releases as a single narrative is interesting. [Last month's performance-decline controversy](/en/blog/en/anthropic-claude-performance-decline-controversy-april-2026) shook community confidence; Anthropic came back one month later with benchmark numbers and a new infrastructure offering.

But developer reactions are maturing toward "benchmarks matter less than real-world behavior." SWE-bench Pro doesn't guarantee performance on your specific codebase, and "legendarily bad" feedback from power users is hard to dismiss.

My conclusion: Opus 4.7 is a genuine coding benchmark improvement, but I'm not doing a wholesale migration until the safety-overfitting reports clarify. task_budget and xhigh are tools I want to experiment with immediately. Managed Agents is my default infrastructure choice for any new agent project starting from scratch — but not worth migrating existing stable systems to. And the tokenizer cost impact needs to be explicitly calculated for every team's budget.

In one month, Anthropic answered "how do we build agents" at both the model layer and the infrastructure layer simultaneously. The answers aren't perfect. But the question is right.

---

**Executability assessment (Source Review basis)**

The task_budget code example and Managed Agents feature descriptions in this post are based on official documentation at `platform.claude.com/docs` and release notes. I was unable to configure a direct execution environment without an Anthropic API key, so the actual advisory behavior of task_budget and session billing mechanics were not directly verified. Everything here is based on documented design and public case studies — not first-hand execution logs.
