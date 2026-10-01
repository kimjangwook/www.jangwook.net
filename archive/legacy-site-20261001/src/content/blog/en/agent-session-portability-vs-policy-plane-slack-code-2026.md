---
title: "Treat the Session as Cache. Move the Policy Plane. Lock-in Becomes a Mapping Problem."
description: "Session migration preserves useful work context. But auth, hooks, policy, MCP connections, and runtime config stay with the client. The durable answer is to put approval and audit outside the agent harness entirely."
pubDate: 2026-08-26
heroImage: "../../../assets/blog/agent-session-portability-vs-policy-plane-slack-code-2026/hero.png"
tags:
  - AI Agents
  - Engineering Leadership
  - Governance
  - Vendor Lock-in
relatedPosts:
  - slug: "mcp-builtin-vs-external-harness-cost-28x-measured-2026"
    score: 0.88
    reason:
      ko: "MCP를 에이전트 내부에 둘지 외부 하네스로 분리할지의 비용과 운영 경계를 함께 검토할 수 있습니다."
      ja: "MCP をエージェント内に置くか外部ハーネスとして分離するか、そのコストと運用境界を合わせて検討できます。"
      en: "It examines the cost and operating boundary between built-in MCP and an external harness."
      zh: "本文可帮助评估将 MCP 内置于代理还是置于外部编排层时的成本与运营边界。"
  - slug: "claude-md-vs-skill-vs-subagent-same-rule-three-layers-measured-2026"
    score: 0.85
    reason:
      ko: "에이전트 규칙을 세션, 프로젝트, 하위 에이전트 중 어느 층에 고정할지 판단하는 데 연결됩니다."
      ja: "エージェントのルールをセッション、プロジェクト、サブエージェントのどの層に固定すべきかを判断する材料になります。"
      en: "It helps determine which layer should own agent rules: session, project, or subagent."
      zh: "它有助于判断代理规则应固定在会话、项目还是子代理层。"
  - slug: "mcp-roadmap-doc-read-agent-identity-progressive-discovery-2026"
    score: 0.82
    reason:
      ko: "도구 연결과 에이전트 정체성을 점진적으로 발견하게 설계하는 방식은 정책 평면 분리의 다음 단계입니다."
      ja: "ツール接続とエージェントのアイデンティティを段階的に発見させる設計は、ポリシープレーン分離の次の段階です。"
      en: "Progressive discovery of tool access and agent identity is the next step after separating the policy plane."
      zh: "让工具访问和代理身份逐步发现，是分离策略平面后的下一步。"
---

# Treat the Session as Cache. Move the Policy Plane. Lock-in Becomes a Mapping Problem.

Does migrating a coding-agent session to another vendor actually reduce lock-in, or does it just create the illusion that "well, we *could* move, if we ever needed to"? I wanted to find the exact boundary by hand. I froze one Claude Code session and pushed it through session-migrate 0.8.0 into seven target formats. The conversation and tool-call context transferred reasonably well. Not one of the organizational controls that make this agent work safe in production came along.

That single sentence is the whole article. The thing a CTO should be optimizing for is not the portability of a developer's local chat log. It is the portability of approval and audit.

## The Operational Problem Is Not Where the Log Lives

Three months after an agent made a change that touched production, where do you find the justification for that change? The dangerous answer is "somewhere in someone's local session file." One engineer keeps context in a JSONL. Another pasted fragments into a PR description. A third already cleaned up their directory. Fine for a personal experiment. The moment the change touches auth, payments, member data, or production access, it is an operational defect, not a preference.

The reverse risk moves with it. A session file carries production log fragments, schema details, attached artifacts, sometimes real data samples. A command that rewrites that file into another vendor's native format is not a convenience feature. It is one more data-exfiltration path.

So I do not frame agent-session portability as a developer-productivity question. It is a data-governance question wearing a CLI feature's face.

Slack Code starts from the opposite direction and lands on the same conclusion. You mention a coding agent, a dedicated code channel appears, the right people gather, diffs and plan documents and live HTML previews accumulate inside it, and when the work is done the channel archives as a searchable record. The durable work artifact moves from a personal workstation to a shared operational surface.

> Because Slack Code inherits Slack's existing permissions and admin controls, IT does not need to build new configuration or audit. Critical changes route directly to an approver inside the channel, preserving review confidence while keeping automation speed.
> — [Slack Code: Where Teams and AI Agents Build Together](https://slack.com/intl/ja-jp/blog/news/slack-code-channels-for-agents)

The inheritance structure matters more than the product details. Instead of asking IT to stand up a new permission model for every new agent workflow, the agent inherits the ACL that already exists. Slack's existing ACL decides which channel, which people, which data the agent can touch. Swap the harness; that layer does not move.

## What Actually Survived the Migration

I set up a Python 3.12 venv on macOS and installed session-migrate 0.8.0. The README lists Python 3.11+ and Linux as the supported range, but install and boot both worked without issue. The official support boundary did not change; a controlled format-conversion experiment did not need it to.

The source was one frozen Claude Code session: 341,646 bytes, 90 records, 20 tool-use blocks, 20 tool-result blocks, 11 thinking blocks. The freeze was the critical step. On my first attempt, the live session file kept growing mid-run, so each target received a different population.

I sent the same frozen session to Codex, Pi, GitHub Copilot CLI, Qwen Code, Kimi Code, Muse Code, and Mistral Vibe. All target homes were isolated under `/tmp` so no real config directory was touched. Resulting record counts ranged from 33 to 50. That does not mean different amounts of information were preserved. The target formats simply chunk the same content into different record units.

The useful result was on the loss-manifest side. Total drops landed between 54 and 57 across all seven targets. Thinking-block drops were fixed at 9. What dropped repeatedly: source-side metadata records, tool-reference records, and private reasoning traces. Codex dropped one additional session title. Vibe retained two tool-reference records that every other target discarded.

This pattern is far more useful than a generic compatibility claim. The loss did not move when I changed the target. What can enter the intermediate model is determined by the source session's event vocabulary, not by the destination.

The project documents the conversion path like this:

> native session → validated event timeline → native target → resume
> — [session-migrate — Migrate your sessions to any harness](https://github.com/xhluca/session-migrate)

The middle timeline is deliberately small. Ordered conversation events pass through. Client-resident configuration does not. The source session is never mutated. Omissions and transformations are tallied by count in a content-free migration manifest.

## The Lock-in Boundary Is the Policy Plane, Not the Log

The tool supports 12 harness formats and enumerates 144 ordered routes, including same-format portable rewrites. User and assistant messages are preserved in order across every route. This is not a plaintext export with a migration label. It is real, meaningful portability.

> Every listed format can be a source or target: 144 ordered routes, including same-format portable rewrites.
> — [session-migrate README — Compatibility](https://raw.githubusercontent.com/xhluca/session-migrate/main/README.md)

But the same compatibility document states the decisive limit:

> Auth, hooks, policies, MCP, and runtime config | No | These remain with the source client
> — [session-migrate — Migrate your sessions to any harness](https://github.com/xhluca/session-migrate)

This is the architectural fact an executive needs in a vendor negotiation. The team can move the work narrative, the tool calls, a substantial amount of usable context. One session file does not move the execution environment.

Auth is bound to the client. Hooks are bound to the client. Policy config, MCP connections, runtime settings all stay with the client. This is not a case of picking the wrong target format and losing something. These items were never members of the migratable event timeline to begin with.

The Antigravity and Cursor conversions failed, which proves the same boundary from the other side. Both adapters immediately require the native binaries `agy` and `cursor-agent`. Neither was installed on my machine. These adapters are not standalone file translators. They need native state that cannot be reconstructed from an exported session alone, so they operate attached to the client.

A solo developer can live with that. An organization cannot. The real replacement cost is rebuilding permission mappings, hooks, policy, and approved tool access on the new harness. Not the two seconds it takes to move a session file. The several weeks that follow.

## The Strongest Counterargument Is Narrow but Correct Where It Applies

The strongest objection: "The body of resume cost is session context." A solo developer who must continue a long implementation session across a tool switch, or a small team that operates inside a single vendor, is exactly right. If a 90-record session's conversation flow and tool-call chain breaks, the agent must re-infer "where am I right now," and that token and time cost is real. In the range where session context dominates resume cost, portability *is* productivity.

But attach the conditions under which that argument holds, and the range narrows. Single vendor. Single project. Single developer. Session measured in hours. Break any one of those, and the body of resume cost is no longer context. It is reconstructing the execution environment: "Can this agent call this tool, with this permission, under this policy, in this repository?" When an auditor three months later asks "who made this change, under what approval, with what data access?" and the answer is "some developer's local JSONL, 90 records," the organization does not meet its operational bar no matter how cleanly the session migrated.

## So I Treat the Session as Cache

The practical conclusion this experiment gave me is simple. An agent session is disposable cache. Conversation context, tool-call history, reasoning traces—all of it is an intermediate artifact: restore it if you resume the same task, otherwise start over. session-migrate supporting 144 routes and transparently reporting 54-to-57 record losses in a manifest means this cache layer is genuinely portable.

But something sits above the cache. Whether this agent can push to this repository. Whether it can reach this MCP server. Which approver signs when this hook fires. What data classification this session's output carries. That layer is client-resident. It is vendor-bound. It is not in the session file.

The moment you lift that layer out of the agent harness and onto the organization's existing permission and audit system, a vendor switch stops being "two seconds to move a session" and becomes "several weeks to map the policy plane's ACL to the new harness." And those several weeks are work the organization already performs, repeatedly, for every other system. Slack Code inheriting Slack's ACL. MCP connections isolated into an external harness. Approval and audit as a standalone service outside the agent process. The reason this direction keeps repeating: while the policy plane is glued to the client, vendor lock-in is not solved by session portability.

The session is cache. You can drop it. You can rebuild it. The policy is not. Once you set it, every session is born under it, every tool is called under it, every change is approved under it. The moment that layer lives inside the client, a vendor switch means the session transfers but the answer to "what is this agent allowed to do, in this organization?" vanishes.

So I report session-file portability as a developer-productivity metric, and policy-plane portability as an operational-risk metric. Different cadence. Different owner. Lumping both under the single word "vendor lock-in" lets a clean session-migration result paper over a policy-plane gap.

## References

- [Slack Code: Channels for Agents](https://slack.com/intl/ja-jp/blog/news/slack-code-channels-for-agents)
- [session-migrate — Migrate your sessions to any harness](https://github.com/xhluca/session-migrate)
- [session-migrate README — Compatibility Matrix](https://raw.githubusercontent.com/xhluca/session-migrate/main/README.md)
