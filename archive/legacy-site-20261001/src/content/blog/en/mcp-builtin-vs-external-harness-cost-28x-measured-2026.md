---
title: "We Examined the 28x Agent-Cost Result and Found the Harness Is the Decision Layer"
description: "MCP is not the main cost lever for AI agents. A controlled study of seven harnesses and five models, plus measured tool payloads, shows which layer sets cost."
pubDate: 2026-08-22
heroImage: '../../../assets/blog/mcp-builtin-vs-external-harness-cost-28x-measured-2026/hero.png'
tags:
  - ai-agents
  - mcp
  - engineering-management
  - unit-economics
  - platform-security
relatedPosts:
  - slug: anthropic-code-execution-mcp
    score: 0.86
    reason:
      ko: MCP가 코드 실행 환경과 만날 때 필요한 실행 경계와 운영 통제를 함께 볼 수 있습니다.
      ja: MCPとコード実行環境を組み合わせる際に必要な実行境界と運用統制を確認できます。
      en: See how MCP changes the execution boundary when agents need to run code and access operational tools.
      zh: 了解当 MCP 连接代码执行环境时，如何设计执行边界与运营控制。
  - slug: ai-agent-cost-reality
    score: 0.82
    reason:
      ko: 에이전트 비용을 모델 단가가 아닌 전체 실행 구조와 실패 비용으로 보는 관점을 확장합니다.
      ja: モデル単価ではなく、実行構造全体と失敗コストからエージェント費用を見る視点を広げます。
      en: Extend the cost discussion from model pricing to execution architecture, retries, and failed work.
      zh: 将智能体成本讨论从模型单价扩展到执行架构、重试和失败工作成本。
---

An AI-agent team wants to know whether removing MCP will reduce operating cost. I examined a controlled MCP-versus-CLI study alongside a direct measurement of MCP tool-definition payloads. The result is clear: MCP can add recurring context weight, but the harness determines the cost structure, and changing interfaces alone will not reliably recover that cost.

For CTOs approving an agent platform and engineering leaders operating one, the immediate call is to benchmark harnesses before standardizing tools, then put access control below the harness where it can actually be enforced.

## The expensive decision is usually made before a tool is called

The recurring management failure in agent adoption is treating the model, the tool protocol, and the execution system as one procurement decision. They are not one layer.

A model produces tokens. An interface such as CLI or MCP expresses available actions. The harness decides which instructions, tool schemas, conversation history, retries, approval steps, file reads, and verification loops are present on every turn. That makes the harness the layer that turns a promising demo into either a controlled operating system or an unpredictable cost center.

The controlled study covered one fixed software task: six operations against a private online git repository, across seven agent scaffoldings and five language models. Completion was verified through repository state, not through the agent claiming it had finished. That distinction matters. Teams that count self-reported completion are not measuring delivered work; they are measuring an unverified statement produced by the same system under evaluation.

The paper’s central conclusion is direct:

> “The dominant effect was the scaffolding.”
>
> — [The Scaffolding Matters More Than the Interface](https://arxiv.org/abs/2608.08654)

For organizations whose agent workload lives on mature CLI surfaces such as git, builds, filesystems, linters, package managers, and image conversion, this changes the starting point. Do not begin by registering MCP servers. Begin with a small harness comparison against the same real task and the same state-based acceptance criteria.

## Why harness policy multiplies spend across every turn

The unit economics are straightforward even when the implementation is not.

Per-turn input cost is driven by the system prompt, persistent tool definitions, accumulated conversation history, and any repeated context the harness elects to resend. Total cost then multiplies that input by the number of turns required to complete, retry, inspect, and verify work.

The harness governs all of those terms:

- whether tool schemas remain resident on every turn;
- whether history is replayed in full or compacted;
- whether the agent rereads the same files;
- whether a failed action triggers a narrow repair loop or a broad rediscovery loop;
- whether completion is checked once against system state or repeatedly inferred from model output.

The tool interface changes one expression within that system. It does not determine the policy that repeatedly carries the expression forward.

I ran a minimal JSON-RPC stdio probe on two MCP servers, sending `initialize`, `notifications/initialized`, and `tools/list`, then measuring the bytes of the minimally serialized `tools` array. One server exposed two tools in 1,451 bytes. Another exposed 29 tools in 23,257 bytes. That is a 16x difference in persistent tool-definition bytes from registering one server rather than another. I recorded how instruction files get re-read each turn in a measured comparison of AGENTS.md and CLAUDE.md loading.

The absolute token estimates are approximate because they use character count divided by four rather than a production tokenizer. The byte ratio is not subject to that approximation. More importantly, this is not a reproduction of the study’s seven-by-five matrix. It isolates one operational fact that platform teams can immediately control: tool schemas are not abstract metadata when they are included in every request. They are recurring input inventory.

That is why MCP failures can be financially different even if failures are no more frequent. In the study, failures occurred equally often across the two interfaces, including repetitions. Yet 12.9% of money spent on MCP runs bought no completed work, compared with 2.2% for CLI runs. The difference was the cost accumulated before the system reached failure. For where agent spend actually goes outside model pricing, see [my accounting from running eight agents against human labor cost](/en/blog/en/ai-agent-cost-reality).

A platform dashboard that shows total spend and success rate but omits spend tied to failed work will hide exactly this pattern.

## The 28x number is real, but it is often cited incorrectly

The most tempting headline from the study is the 5.0x to 28x cost difference. It should not be used as evidence that MCP itself is 28x more expensive than CLI.

That comparison was between two harnesses without MCP support and five harnesses with MCP support, using CLI runs alone, with no MCP server attached anywhere. It is evidence that harness choice can create enormous cost variation even when the interface is held to CLI. It is not evidence for removing MCP.

The stronger harness finding is the local 27-billion-parameter model result. Its cost varied by 139x across harnesses while it completed the task under every harness. Same model class, same task, completed outcome, radically different execution economics.

There were also 13 strictly paired MCP-to-CLI ratios. They ranged from 0.43x to 29x, with outliers in both directions. The authors explicitly describe the interface comparison as unstable. That is the appropriate interpretation for an executive decision: do not put an interface-level claim into an investment memo when the paired evidence does not produce a stable direction.

There is another methodological warning worth carrying into every internal benchmark. Agents frequently ignored the interface they were assigned. A report labeled “MCP run” or “CLI run” is not useful unless actual behavior was verified. Otherwise, a team is measuring an unknown mixture of available tools, fallback behavior, prompt interpretation, and harness policy.

## The strongest objection is right about MCP, but wrong about where to look next

The strongest counter-argument deserves to stand intact.

The task was six git operations. Git is among the most mature CLI surfaces in engineering. It has decades of command conventions, composable output, predictable exit codes, rich documentation, and established operational habits. Finding that agents can complete this class of work through CLI is not a general verdict on MCP. It is a result shaped by a domain where CLI is already exceptionally capable.

The 5.0x to 28x figure also cannot support an MCP-removal program because it did not compare MCP-attached runs with CLI-only runs. No MCP server was attached in that comparison. Any executive presentation that calls this “proof that MCP costs 28x more” is misreading the evidence.

This objection is correct for every broad claim about interface superiority. One task is not a general tool economy. A CLI-mature software repository is not a customer-data system, a proprietary SaaS workflow, a design platform, or a governed business-data environment. The unstable paired ratios reinforce that limit.

But the objection does not erase the harness result. The dominant scaffolding effect remains after interface labels are set aside. The 139x result remains a harness-level variation under a fixed task and a completed outcome. That is the decision signal worth acting on.

For a team working only with git, build systems, filesystem operations, and package management, starting without MCP is reasonable because a viable CLI path already exists. For a team whose agent must query consent history, customer segments, internal records, or proprietary SaaS objects with no meaningful CLI, MCP may be the only usable path. In that case, the question is not whether MCP is philosophically elegant. The question is whether its schema footprint, authorization design, and failure-cost profile have been budgeted and controlled.

## Standardize the adoption workflow before standardizing the protocol

The first platform decision should be a repeatable evaluation process, not a tool catalog.

Start by selecting two or three harnesses and running the same representative task through each one. Keep the model, acceptance criteria, permissions, and available data constant. Verify completion through repository state, database rows, response codes, or other independently inspectable state. Do not let an agent’s final sentence become the success criterion.

The study released its harness, task, verification method, and complete dataset as open source. That matters operationally because teams do not need to wait for a vendor benchmark to begin. They can adopt the discipline: fixed task, controlled configuration, state verification, and retained execution evidence.

Then make MCP registration a governed engineering change.

Every MCP server registration PR should disclose the `tools/list` payload size and tool count. CI can run the same basic probe used above and enforce server-level and repository-level payload budgets. The goal is not to ban large tool surfaces categorically. It is to require an owner to justify why a persistent set of 29 tools belongs in every agent context rather than being split, scoped, or loaded only when needed. The security half of that review matters too, as [the 29 million secrets leaked through MCP config files](/en/blog/en/ai-coding-secrets-sprawl-mcp-config-security) showed.

Add a failed-work spend ratio to the operating dashboard. Success rate alone cannot distinguish a cheap early failure from an expensive failure after repeated context expansion, tool calls, and retries. This is a direct unit-economics measure: what share of agent spend failed to purchase completed work?

Finally, separate tool availability from execution permission. An MCP server can describe a useful action. That does not mean every agent, task, environment, or delegated subagent should be allowed to perform it.

## Security controls cannot live in the layer designed to be changed

The harness is the right layer for task policy, context policy, approval workflow, and user experience. It is the wrong layer for the final security guarantee.

A harness is programmable by design. Teams modify it to add tools, alter prompts, adjust retries, support new agents, and improve throughput. That flexibility is valuable, but it means the harness cannot be the authority that proves a sensitive action was impossible.

NVIDIA’s agent-stack framing makes the implication explicit:

> “This programmability makes the harness a poor place for a security guarantee: a layer designed to be modified cannot reliably enforce controls against its own modification.”
>
> — [Where Security Fits in an AI Agent Stack](https://developer.nvidia.com/blog/where-security-fits-in-an-ai-agent-stack)

This is especially important when agents move beyond a repository and into customer, member, financial, or consent-related data. A prompt saying “do not access restricted fields” can guide behavior, but it cannot enforce behavior. A tool the agent may choose not to call is not a control either. The enforcement point must sit in a runtime or infrastructure boundary that applies ceilings the agent and harness cannot exceed.

In practical terms, access policy should be attached to credentials, data scopes, network paths, execution identities, and runtime policy. Delegated agents should receive child runtimes with narrower ceilings than the orchestrator. Audit records should show which identity accessed which resource under which policy, not merely which instruction appeared in a harness configuration.

This is not a security add-on. It is the difference between a workflow that can be demonstrated and one that can survive an audit.

## MCP is still necessary where the business surface has no CLI

Removing MCP from a mature engineering workflow can reduce moving parts. Removing it from a business workflow without an alternative can simply remove the only path to useful automation.

Most enterprise data surfaces were built for humans through applications, dashboards, approval flows, and domain-specific APIs. They do not expose a coherent CLI that an agent can safely compose. Customer-data lookup, consent review, internal SaaS operations, and design-system workflows often fall into this category.

OpenAI’s platform direction reflects that reality. It positions Codex as a reusable harness responsible for context management, tool use, and approval workflows, while MCP tools are owned by the application.

> “Codex can then use the application's MCP tools to fetch current data before recommending.”
>
> — [Codex as a platform](https://developers.openai.com/blog/codex-as-a-platform)

For these teams, MCP is not a cost optimization target. It is an integration route. The disciplined decision is to accept that route while governing its cost and risk:

- scope tool definitions to the smallest operational surface;
- avoid registering broad tool collections by default;
- measure recurring schema payload before production rollout;
- verify outcomes against authoritative system state;
- track failed-work spend separately from completed-work spend;
- enforce data access and action limits in runtime and infrastructure layers.

That is a materially different strategy from “MCP everywhere” and from “MCP nowhere.” It starts with the business surface, then applies architecture discipline.

## What CEOs and CTOs should change in the next review cycle

First, move harness selection ahead of model renegotiation in the operating agenda. A model contract matters, but the measured 139x harness variation shows why model selection cannot be the only cost lever under executive review. The execution layer decides how often the model receives context, how much context it receives, and how many expensive turns precede verification.

Second, make failed-work spend an approval metric for agent pilots. A pilot that reports high completion while silently consuming a large share of budget on unsuccessful runs is not ready to scale. Completion rate answers whether the system sometimes works. Failed-work spend answers whether its operating model is economically durable.

Third, treat MCP registration as capacity planning. A server’s tool definitions consume context capacity just as a service dependency consumes latency and reliability budget. The right governance artifact is a PR with measured payload, ownership, justification, access scope, and rollback conditions.

Fourth, fund enforcement at the runtime boundary rather than in editable harness instructions. This is where compliance investment becomes auditable operational capability rather than a collection of well-intentioned prompt text.

My call is simple: for CLI-mature engineering work, register no MCP servers until a same-task harness comparison proves the added surface is justified; for business surfaces without a CLI, use MCP but manage it as a metered, runtime-governed integration layer.

I would change that call if controlled, state-verified benchmarks across non-CLI enterprise tasks showed that MCP-attached configurations consistently reduced completed-work cost after harness policy, tool payload, and runtime permissions were held constant.

## References

1. [The Scaffolding Matters More Than the Interface: A Controlled Comparison of MCP and CLI Tool Use Across Seven Agent Scaffoldings, Five Language Models, and One Software Task — arXiv](https://arxiv.org/abs/2608.08654)
2. [Where Security Fits in an AI Agent Stack — NVIDIA Developer Blog](https://developer.nvidia.com/blog/where-security-fits-in-an-ai-agent-stack)
3. [Codex as a platform — OpenAI Developers](https://developers.openai.com/blog/codex-as-a-platform)
