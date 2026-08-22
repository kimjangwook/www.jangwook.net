---
title: "We Standardized the Harness Before Cutting MCP, and It Became the Bigger Cost Lever"
description: "A controlled MCP versus CLI study shows that agent scaffolding, not the interface alone, can dominate cost and operational outcomes in mature CLI domains."
pubDate: 2026-08-22
lane: "b"
hero: "../../../assets/blog/mcp-vs-cli-scaffolding-dominates-cost-2026/hero.png"
heroKind: "plate"
tags:
  - AI agents
  - MCP
  - CLI
  - engineering management
  - platform architecture
relatedPosts:
  - slug: "mcp2cli-token-cost-optimization"
    reason:
      ko: "MCP 호출을 CLI 경로로 바꿀 때 토큰 비용을 어떻게 진단해야 하는지 이어서 다룬다."
      ja: "MCP呼び出しをCLI経路へ置き換える際、トークンコストをどう診断すべきかを扱う。"
      en: "It examines how to diagnose token cost when moving MCP calls onto CLI paths."
      zh: "本文继续讨论将 MCP 调用迁移到 CLI 路径时，应该如何诊断令牌成本。"
  - slug: "llm-coding-harness-optimization"
    reason:
      ko: "에이전트 성능과 비용을 좌우하는 하네스 설계의 운영 원칙을 다룬다."
      ja: "エージェントの性能とコストを左右するハーネス設計の運用原則を扱う。"
      en: "It covers operating principles for harness design that shapes agent performance and cost."
      zh: "本文讨论影响智能体性能和成本的 harness 设计与运营原则。"
  - slug: "anthropic-code-execution-mcp"
    reason:
      ko: "코드 실행과 MCP를 함께 도입할 때 권한 경계와 실행 통제를 어떻게 설계할지 연결한다."
      ja: "コード実行とMCPを併用する際の権限境界と実行統制の設計につなげる。"
      en: "It connects MCP and code execution to the design of authorization boundaries and runtime controls."
      zh: "本文关联 MCP 与代码执行，并讨论授权边界和运行时控制的设计。"
---

I wanted to know whether removing MCP was the fastest way to reduce AI agent cost. The controlled evidence says no: I would standardize the agent harness first, then use CLI-only execution wherever a mature CLI already exists. In the tested git-repository task, scaffolding dominated the economics, while MCP versus CLI was not a stable standalone cost comparison.

That matters because an agent budget can look like a model-pricing problem while the real source of variance is a team’s ungoverned execution layer; my call is simple: make the harness the managed platform, and treat new MCP servers as exceptions that must justify their existence.

## The expensive mistake is diagnosing the wrong layer

I see the same request from two directions. A modernization team wants an agent to edit repositories, run builds, inspect pull requests, and operate deployment tooling. A data-service team wants an agent to retrieve member records, profile attributes, consent history, or operational audit trails. In both cases, the reflex is often identical: stand up an MCP server.

That response treats connectivity as the architecture. It is not.

For git, GitHub operations, containers, cluster management, and build toolchains, a mature command-line interface already carries decades of operational behavior: scripts, logs, exit codes, permissions, CI integration, and failure handling. Adding an MCP server can introduce another service to maintain and another tool surface for the agent to navigate without creating a new business capability.

The data-service case is fundamentally different. An internal customer-data query or a consent-history mutation is not merely a command that happens to lack a CLI wrapper. Its authorization decision may depend on identity, purpose, tenancy, retention policy, and immutable audit requirements. Turning that into a local command-line convenience can move a sensitive control outside the boundary where it belongs.

The architectural question is therefore not, “MCP or CLI?” It is, “Where does the authoritative authorization decision execute?” If the answer is inside a mutable agent harness, the organization has guidance, not control.

> “The harness guides what an agent tries. The infrastructure controls what an agent can do. Both are necessary; only one is authoritative.”

> — [Where Security Fits in an AI Agent Stack](https://developer.nvidia.com/blog/where-security-fits-in-an-ai-agent-stack)

## What the controlled comparison actually established

The study behind this discussion fixed one software task: six operations against a private online git repository. It ran that task across seven agent scaffoldings and five language models. More importantly, it verified completion by inspecting repository state rather than accepting an agent’s own claim that it had finished.

That verification decision should make every engineering leader pause. In production dashboards, it is still common to count an agent’s final message, a tool-success event, or a workflow-complete flag as success. None of those proves that the intended repository diff exists, tests pass, required files changed, or the resulting state is deployable.

The researchers also found that agents frequently ignored the interface they had been assigned. An experiment that says it compared MCP and CLI but does not verify actual behavior may be measuring a mixture of both. That is not a minor experimental footnote. It is the difference between making a procurement decision from evidence and making one from a mislabeled telemetry stream.

> “The dominant effect was the scaffolding. Two of the seven ship no MCP support at all; they completed every run using only the CLI, which shows that MCP is unnecessary for this class of work, and they were 5.0x to 28x cheaper than the five scaffoldings that do support MCP, comparing CLI runs alone with no MCP server attached anywhere.”

> — [The Scaffolding Matters More Than the Interface](https://arxiv.org/abs/2608.08654)

The result does not prove that MCP itself adds a fixed multiple to every agent workflow. It proves something more useful for operators: changing the surrounding harness can move cost by 5.0x to 28x even when comparing CLI runs with no MCP server attached. For one local 27-billion-parameter model, cost varied by 139x across scaffoldings while the task was completed under all of them.

That is a platform-governance finding, not an interface benchmark.

## Cost reporting must separate three variables

Most executive reporting puts model name at the center: one vendor, one model version, one token price, one monthly total. That grouping is too coarse to reveal the lever an engineering organization can actually control.

There are three distinct axes:

1. **Interface**: MCP versus CLI. In the study, strictly paired interface ratios ranged from 0.43x to 29x. That spread is too unstable to support a universal claim that one interface is inherently a given multiple cheaper.
2. **Scaffolding**: the harness that gathers context, selects and invokes tools, manages approvals, compresses history, retries work, and carries state forward. This was the dominant observed axis.
3. **Model**: the language model receiving and producing tokens. Smaller models may be particularly sensitive to harness behavior; the 27-billion-parameter result illustrates the scale of that sensitivity without explaining its mechanism.

The operational order of control should be scaffolding first, interface second, model third. Most organizations are doing the reverse because model procurement is visible, while harness behavior is buried inside developer tooling, framework defaults, agent plugins, and teams’ local conventions.

The unit-economics consequence is direct. If two teams perform comparable work but use different harnesses, their apparent model cost can diverge sharply even when they selected the same model. Finance sees volatile AI spend. Engineering responds by swapping models. The structural cause remains in place.

There is a second metric that belongs on the executive dashboard: money spent without completed work. The study found that 12.9% of spending on MCP runs bought no completed work, compared with 2.2% for CLI runs, even though failures were equally common. Success rate alone concealed the difference. Failure cost exposed it.

For a CTO, this is not just token hygiene. It is a margin and forecasting issue. An agent that fails at the same frequency but burns substantially more budget before failure changes the cost of every engineering workflow that depends on it.

## Standardize adoption before expanding the tool catalog

A platform team does not need a long policy document to act on this. It needs three enforceable gates.

First, standardize on one harness per governed operating environment and pin its version. Teams can still experiment in a sandbox, but production reporting cannot have harness choice as an uncontrolled variable. If every squad selects a different agent framework, tool-calling policy, retry strategy, and context-management approach, no cost comparison is interpretable.

Second, require a one-page review for every proposed MCP server. The review should answer two questions:

- Does a mature CLI already exist for the intended operation?
- Does authorization execute outside the agent harness, in an infrastructure-controlled boundary?

If a mature CLI exists, the default should be CLI-only execution. If authorization remains inside the harness or a model-directed plugin, move that control into the underlying service or infrastructure layer before approving broader access.

Third, make completion verification part of CI and operational telemetry. For code work, validate repository diffs, test results, build artifacts, schema checks, and deployment conditions. For data workflows, validate authorized query scope, audit events, and state transitions. Do not use agent self-report as the completion signal.

This changes team behavior because it changes what teams are measured on. A dashboard that reports model, tokens, and self-declared completion will optimize for activity. A dashboard grouped by harness, workflow class, verified completion, and failed-work spend will optimize for dependable output.

## The strongest objection is right more often than MCP critics admit

The central objection is that the task favored CLI from the beginning. It was one fixed task involving six private git-repository operations, an area where command-line tools have been refined for decades. Saying CLI performed well in a CLI-mature domain is not a universal verdict on MCP.

There is a more precise criticism. The headline 5.0x to 28x difference compares two scaffoldings without MCP support against five that support it, while all compared runs used CLI and had no MCP server attached. It is a scaffolding-group comparison, not a pure interface comparison. The study’s thirteen strictly paired MCP-to-CLI ratios ranged from 0.43x to 29x, with outliers in both directions. Anyone presenting the 5.0x to 28x figure as a clean statement about MCP’s intrinsic cost is overstating the evidence.

That objection applies fully in three conditions.

First, it applies where no CLI equivalent should exist: internal data platforms, identity systems, consent services, and high-value APIs with contextual authorization. Here, MCP or an equivalent controlled integration layer may be the correct interface because the problem is not command invocation. It is secure, auditable access.

Second, it applies where the organization cannot select its harness. A centrally approved environment may be mandated by security, procurement, or platform standards. Teams in that position should not create shadow tooling merely to pursue benchmark economics.

Third, it applies to long-running multi-service orchestration, interactive approval workflows, and task shapes far removed from six git operations. Interface design may determine user experience, audit quality, and coordination reliability more than it determines cost.

The counterargument does not weaken the operating decision for mature CLI domains. It narrows it correctly. Do not remove MCP everywhere. Stop adding it by reflex where the CLI is already the stronger operational interface.

## Harness design is now an executive architecture concern

The idea that scaffolding can dominate outcomes is not isolated to one research paper. OpenAI reports that retained reasoning and context compaction changed a model’s ARC-AGI-3 score from 13.3% to 38.3% while reducing output tokens sixfold.

> “Harness design can materially change results: on ARC-AGI-3, retained reasoning and context compaction raised GPT-5.6 Sol's score from 13.3% to 38.3% while reducing output tokens sixfold.”

> — [Codex as a platform: build on the open agent harness](https://developers.openai.com/blog/codex-as-a-platform)

The mechanism matters to an engineering leader. A harness decides what context is collected, how much prior state is retained, when history is compacted, which tools are visible, how approvals are requested, how retries happen, and whether work can continue across turns. Each decision affects latency, token volume, error recovery, and the probability that an agent reaches a verifiable end state.

Some teams will infer that MCP-capable harnesses are expensive because they keep tool schemas, discovery information, or approval plumbing active in context. That may be plausible, but the controlled study did not decompose the observed variance into turn count, per-turn input tokens, retries, or context retransmission. The 139x variation for the local model is an observed outcome, not a proven causal breakdown.

That distinction is essential in management. We should act on what is established: harness selection can dominate cost. We should not manufacture a false technical certainty about why each harness behaves as it does.

## The decision rule for CEOs and CTOs

For work centered on mature operational CLIs, make CLI-only execution the default and standardize the harness around it. This includes repository management, builds, linting, container workflows, cloud operations, and cluster administration where command history and CI already provide an auditable operational path.

For internal systems without a legitimate CLI equivalent, retain MCP or a comparable integration layer, but place authorization and audit enforcement outside the harness. The harness can request an action. Infrastructure must decide whether the action is allowed.

Then change the next cost review. Group spend by harness name before model name. Add verified completion as the denominator. Put failed-work spend beside success rate. Require every new MCP request to state the existing CLI alternative and the location of the authoritative permission check.

My position is not that MCP is the wrong technology. It is that unmanaged harness diversity is the more expensive organizational mistake, and mature CLI domains should not pay for an extra integration layer without a specific capability or control reason.

I would change that call if controlled evidence across multi-service, non-CLI-native workflows showed interface choice consistently outweighing a fixed harness in verified completion cost.

## References

1. [The Scaffolding Matters More Than the Interface: A Controlled Comparison of MCP and CLI Tool Use Across Seven Agent Scaffoldings, Five Language Models, and One Software Task](https://arxiv.org/abs/2608.08654) — arXiv

2. [Where Security Fits in an AI Agent Stack](https://developer.nvidia.com/blog/where-security-fits-in-an-ai-agent-stack) — NVIDIA Developer Blog

3. [Codex as a platform: build on the open agent harness](https://developers.openai.com/blog/codex-as-a-platform) — OpenAI Developers Blog
