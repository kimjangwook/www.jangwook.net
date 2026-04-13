---
title: 'Stripe Minions — How a Slack Emoji Triggers 1,300 PRs a Week'
description: >-
  How Stripe produces over 1,300 PRs weekly with autonomous coding agents called
  Minions. An analysis of the Blueprint architecture, sandboxed VMs, and 3-tier
  feedback loop behind the system.
pubDate: '2026-04-03'
heroImage: ../../../assets/blog/stripe-minions-autonomous-coding-agents-1300-prs-hero.jpg
tags:
  - ai-agent
  - stripe
  - autonomous-coding
  - mcp
  - ci-cd
  - engineering
relatedPosts:
  - slug: mcp-servers-toolkit-introduction
    score: 0.94
    reason:
      ko: '자동화, AI/ML, DevOps, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、DevOps、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, DevOps, architecture with
        comparable difficulty.
      zh: 在自动化、AI/ML、DevOps、架构领域涵盖类似主题，难度相当。
  - slug: claude-agent-teams-guide
    score: 0.93
    reason:
      ko: '다음 단계 학습으로 적합하며, 자동화, AI/ML, DevOps, 아키텍처 주제에서 연결됩니다.'
      ja: 次のステップの学習に適しており、自動化、AI/ML、DevOps、アーキテクチャのトピックで繋がります。
      en: >-
        Suitable as a next-step learning resource, connecting through
        automation, AI/ML, DevOps, architecture topics.
      zh: 适合作为下一步学习资源，通过自动化、AI/ML、DevOps、架构主题进行连接。
  - slug: claude-code-insights-usage-analysis
    score: 0.93
    reason:
      ko: '자동화, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, architecture with comparable
        difficulty.
      zh: 在自动化、AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: effiflow-automation-analysis-part3
    score: 0.93
    reason:
      ko: '다음 단계 학습으로 적합하며, 자동화, AI/ML, DevOps, 아키텍처 주제에서 연결됩니다.'
      ja: 次のステップの学習に適しており、自動化、AI/ML、DevOps、アーキテクチャのトピックで繋がります。
      en: >-
        Suitable as a next-step learning resource, connecting through
        automation, AI/ML, DevOps, architecture topics.
      zh: 适合作为下一步学习资源，通过自动化、AI/ML、DevOps、架构主题进行连接。
  - slug: openclaw-opus-4-6-setup-guide
    score: 0.93
    reason:
      ko: '자동화, AI/ML, DevOps 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、DevOps分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, DevOps with comparable
        difficulty.
      zh: 在自动化、AI/ML、DevOps领域涵盖类似主题，难度相当。
---

Drop an emoji on a bug report in Slack, and 10 seconds later a sandboxed VM spins up, fixes the code, runs the tests, and opens a PR. Humans just review. That's how "Minions" works — an internal system Stripe publicly disclosed in February this year.

Over 1,300 PRs per week. Every single one with zero human-written code. At a company processing over $1 trillion in annual payment volume.

When I first saw those numbers, I was skeptical. Not so much about the 1,300 figure itself, but the idea that autonomous agents are writing production code for payment infrastructure. So I dug pretty deep into Stripe's engineering blog and related materials.

## What Minions Actually Is

In one line: an autonomous coding agent that goes from a Slack message or bug ticket all the way to a merged PR, with no human-written code.

The core concept is an orchestration pattern called **Blueprint** — a structure that alternates between deterministic code nodes and LLM agent loops. Fixed scripts handle things like git checkout and linting, while the LLM decides "how to fix this bug." Stripe calls these "contained boxes" — the philosophy being that putting LLMs into controlled boxes compounds into system-wide reliability gains.

The agent base is a fork of Block's (formerly Square) open-source coding agent Goose, customized with Stripe's internal tools and context connected via [MCP (Model Context Protocol)](/en/blog/en/mcp-server-build-practical-guide-2026). Their internal Toolshed server hosts over 400 MCP tools.

## The Sandbox: Constraints as Freedom

Every Minion runs in an isolated VM — the same dev environment human engineers use, but pre-loaded with code and services so it spins up in 10 seconds.

The critical detail: these VMs have **no internet access and no production access**. Complete sandbox. This constraint paradoxically eliminates the need for permission checks and enables unlimited parallelization. From a security standpoint, it's clean — there's simply [no pathway for the agent to leak anything externally](/en/blog/en/mcp-gateway-agent-traffic-control).

I think this design decision is the smartest part of Minions. Most AI agent projects push toward "give agents more permissions," but Stripe went the opposite direction. They severely restricted permissions while maximizing autonomy within those restrictions.

## The 3-Tier Feedback Loop

The quality verification process after code generation is equally systematic.

**Tier 1 — Local lint (under 5 seconds)**: Catches typos and formatting errors immediately. The agent fixes them on the spot.

**Tier 2 — Selective CI**: Stripe has over 3 million tests. Running all of them would take too long, so only tests relevant to changed files are selected and executed. Failures with available autofixes are applied automatically.

**Tier 3 — Retry cap**: If CI fails, the error gets sent back to the agent for fixing. But **only up to 2 times**. Stripe's reasoning: "diminishing marginal returns for an LLM to run many rounds."

This 2-round cap struck me as a very pragmatic engineering decision. Infinite retries are costly, and in practice, if an agent can't fix something in 2 attempts, the odds of succeeding on the 3rd are low. Better to hand it off to a human.

## What They Actually Do

The range of tasks Minions handles is broader than you might expect:

- Takes bug reports from Slack, fixes the code, and generates a PR
- Writes new code based on feature requests
- Detects flaky tests and auto-creates tickets with a "minion-fix" button
- Pulls context from internal docs, feature flags, and code intelligence (Sourcegraph)

There are multiple entry points. Slack is the primary interface, plus CLI, web UI, and buttons in internal platforms. The system follows a "one-shot" philosophy — designed to complete a task end-to-end from a single instruction. No iterative conversational refinement; it delivers the result in one go, and humans modify on top if needed.

## Does This Actually Work?

Honestly, a few things still nag at me.

First, the **nature** of those 1,300 PRs. Are they all meaningful feature changes, or do mechanical tasks like lint fixes and dependency updates make up a significant portion? Stripe's blog doesn't disclose this ratio. If 80% is type corrections and import cleanup, it's still impressive but changes the context.

Second, the **review burden**. 1,300 PRs per week going up means reviewers need to look at 1,300 PRs. Reviewing AI-written code differs from human-written code — agents follow conventions well but the "why did it do this" intent can be opaque. Stripe's engineering org can handle this, but a 50-person startup trying to replicate it might find review bottlenecks becoming the new problem.

Third, the specificity of Stripe's tech stack — Ruby + Sorbet. Agents work well in their environment because they built hundreds of millions of lines of codebase-specific MCP tools and rules. Whether this is a universally portable pattern or requires Stripe-level infrastructure investment is a separate question.

## What You Can Take Away

Even without Stripe's scale, there are useful lessons here.

**"The walls matter more than the model"** — Steve Kaliski, Stripe engineer. I agree. What determines an agent's effectiveness isn't the LLM's capability but the quality of constraints and tools surrounding it. Good sandboxes, well-built MCP tools, and clear Blueprints make the model interchangeable.

The Blueprint pattern — alternating deterministic nodes and agent loops — is worth applying at smaller scales too. When our team builds automations with [Claude Code](/en/blog/en/claude-code-parallel-sessions-git-worktree), we use a similar structure, and clearly separating "fixed steps" from "LLM judgment steps" makes debugging significantly easier.

Selective CI that picks related tests from 3 million to run is also a solid idea. It's an approach worth adopting in regular development processes too, not just for agents — something I plan to investigate separately.

---

Whether Stripe Minions is "a template every company can follow" remains unclear. 400 MCP tools, rules purpose-built for hundreds of millions of lines of code, sandboxed VMs that spin up in 10 seconds — this is a product built on years of developer infrastructure investment.

But the core idea — reducing agent permissions and controlling the environment actually increases reliability — holds regardless of scale. And if this direction is right, what matters going forward isn't "smarter models" but "better walls."
