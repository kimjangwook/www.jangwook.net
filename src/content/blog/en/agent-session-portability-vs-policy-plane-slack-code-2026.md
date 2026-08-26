---
title: "I Treated Agent Sessions as Portable Cache and Moved Control to a Policy Plane: Vendor Lock-In Became Manageable"
description: "Session migration preserves useful work context, but authentication, hooks, policies, MCP connections, and runtime controls stay behind. The durable answer is to place approval and audit controls outside the agent harness."
pubDate: 2026-08-26
heroImage: '../../../assets/blog/agent-session-portability-vs-policy-plane-slack-code-2026/hero.png'
tags:
  - AI Agents
  - Engineering Leadership
  - Governance
  - Vendor Lock-in
  - Slack Code
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

I wanted to know whether portable coding-agent sessions materially reduce vendor lock-in, or merely make a future migration look easier than it is. I froze one real Claude Code session, inspected it, and transferred it into seven target formats with session-migrate 0.8.0. The useful conversation and tool context traveled surprisingly well, but the controls that make agent work safe in an organization did not move at all.

That distinction matters because a CTO should optimize for portability of approval and audit, not portability of a developer’s local transcript.

## The operational problem is not where the chat history lives

In renewal programs and data-platform work, the same question eventually reaches engineering leadership: “Three months from now, where can we see why this agent made that change?”

The dangerous answer is usually “somewhere in a developer’s local session files.” One engineer has the context in a JSONL file, another copied fragments into a PR description, and a third has already cleaned the directory. That is tolerable for a private experiment. It is an operational defect when the change touches identity, payments, member data, or production access.

There is a second risk moving in the opposite direction. Session files can contain production-log fragments, schema details, attached artifacts, and sometimes samples of real data. A command that converts such a session into another vendor’s native format is not just a convenience feature. It opens another route for data export.

This is why I do not treat agent-session portability as a simple developer-productivity question. It is a data-governance question disguised as a CLI feature.

Slack Code points in the opposite direction from session migration but arrives at the same architectural conclusion. Slack says that mentioning a coding agent can create a dedicated code channel, gather relevant people, collect code diffs, planning documents, and live HTML previews, then archive the completed channel as a searchable record. That moves the durable work record away from a single workstation and into a shared operating surface.

> Slack Code は Slack 既存の権限と管理者コントロールを継承するため、IT 部門が新たな設定や監査を行う必要はありません。重要な変更はチャンネル内でそのまま担当者による迅速な承認フローに回すことができ、レビューの安心感を保ちながら自動化のスピードを実現します。  
> — [Slack Code: チームと AI エージェントが共に作り上げる場所](https://slack.com/intl/ja-jp/blog/news/slack-code-channels-for-agents)

The product detail matters less than the mechanism: it inherits an existing permission and administration plane rather than asking IT to reconstruct one inside every new agent workflow.

## What the migration test actually preserved

I installed session-migrate 0.8.0 in a Python 3.12 virtual environment on macOS, despite the README stating support for Python 3.11+ and Linux. Installation and startup worked. That does not change the published support boundary, but it was sufficient for a controlled format-conversion test.

The source was one frozen Claude Code session: 341,646 bytes, 90 records, with 20 tool-use blocks, 20 tool-result blocks, and 11 thinking blocks. Freezing was essential. A live session file continued to grow during the first attempt, which meant each target conversion was being compared against a different source population.

I then transferred the same frozen session into Codex, Pi, GitHub Copilot CLI, Qwen Code, Kimi Code, Muse Code, and Mistral Vibe, with each target home isolated under `/tmp`. The targets produced 33 to 50 records. That spread does not indicate materially different information preservation; target formats split equivalent content into different record units.

The important result was the loss manifest. Dropped totals clustered tightly between 54 and 57 across all seven targets, while the dropped-thinking count stayed fixed at 9. The recurring omissions were source-side metadata records, tool-reference records, and private thinking. Codex additionally dropped one session title; Vibe retained two tool-reference records that the other targets dropped.

This pattern is more useful than a generic compatibility claim. Changing the target did not materially change the loss. The source session’s event vocabulary determined what could enter the intermediate model.

The project describes the conversion path this way:

> native session → validated event timeline → native target → resume  
> — [session-migrate — Migrate your sessions to any harness](https://github.com/xhluca/session-migrate)

That intermediate timeline is intentionally small: ordered conversation events can pass through it, but client-resident configuration cannot. The source session remains untouched, and omissions or transformations are counted in a content-free migration manifest.

## The lock-in boundary is the policy plane, not the transcript

The migration tool supports 12 harness formats and describes 144 ordered routes, including same-format portable rewrites. User and assistant messages are preserved in order on every route. This is meaningful portability, not plain-text export dressed up as a migration.

> Every listed format can be a source or target: 144 ordered routes, including same-format portable rewrites.  
> — [session-migrate README — Compatibility](https://raw.githubusercontent.com/xhluca/session-migrate/main/README.md)

But the same compatibility documentation states the decisive limitation:

> Auth, hooks, policies, MCP, and runtime config | No | These remain with the source client  
> — [session-migrate — Migrate your sessions to any harness](https://github.com/xhluca/session-migrate)

This is the architectural fact executives need to use in vendor discussions. A team can migrate the work narrative, tool calls, and much of the usable context. It cannot migrate the enforcement environment merely by moving a session file.

Authentication stays bound to the client. Hooks stay bound to the client. Policy configuration, MCP connections, and runtime configuration stay bound to the client. Those are not missing because a target format was chosen poorly; they were never part of the transferable event timeline.

The failed Antigravity and Cursor conversions reinforced the same boundary. Both adapters immediately required their native executables, `agy` and `cursor-agent`, which were not installed. These are not independent file translators. They attach to a client because some native state cannot be reconstructed from an exported session alone.

For an individual developer, this may be acceptable. For an organization, it means the real switching cost is the work of rebuilding access mappings, hooks, policies, and approved tool connectivity across the new harness.

## The strongest counter-argument is right in a narrow but important range

The strongest objection is that session context is the real cost of switching. That objection deserves more respect than it usually gets.

For a developer carrying one long-running implementation session across changing tools, reconstructing context can be expensive. The test supports that view: the source session’s ordered conversation, tool-use history, and tool-result history were not simply discarded. The migration tool gives a practical route to retain the work narrative rather than restarting from an empty prompt.

This is especially valuable for an unregulated individual or a small team that frequently changes harnesses and has no need to centralize approval records. In that environment, 144 migration routes are not a marketing number. They can reduce the friction of experimentation and preserve accumulated context.

It would be wrong to say that policy does not migrate, therefore session migration is useless. The session remains a valuable continuity asset.

My call still stands outside that range. A migrated session resumes without the original client’s authentication, hooks, policies, MCP connections, and runtime configuration. For teams handling audited systems, the safety controls are not optional context around the work. They are part of the work.

The more people, repositories, environments, and regulatory constraints involved, the less the saved session context dominates the economics. Rebuilding policy controls, validating permissions, proving approval paths, and reviewing new data-export routes consume the migration budget.

## Make sessions disposable cache and make governance durable

The operating model I recommend has three gates.

First, declare sessions to be cache, not the system of record. Decisions, evidence, and rollback procedures must exist in the PR body, the approved work channel, or both. Add one line to the review checklist: “Is the basis for this judgment available outside the agent session?”

This sounds small, but it changes behavior. It prevents the team from treating a local transcript as an audit artifact simply because it contains a detailed conversation. A transcript can disappear with a laptop replacement, an employee departure, or routine cleanup of a local agent directory.

Second, require an export review for audited repositories. When session migration is necessary, attach the dry-run migration manifest to the work ticket before export. A content-free manifest that reports categories and counts of omissions is better suited to review than a raw session dump. The reviewer can assess what is leaving and what will be lost without spreading the underlying content to another audience.

Third, choose one enforcement point for approvals, access, and archival: a channel or CI. Not both by default, and not a separate enforcement model inside every agent CLI. Teams that already have strong code-owner and CI approval controls should not add a parallel chat-based approval system merely because an agent product makes it available. Two approval planes create ambiguity about which decision is authoritative.

The onboarding instruction can be direct: choose the CLI that helps you work, but approvals happen here and records live here.

That preserves local tool choice without allowing tool choice to fragment governance.

## Slack Code is a policy-plane product, not merely an agent integration

Slack Code is available for teams using integrations with Claude, Devin, GitHub Copilot, and Vercel, with ChatGPT described as forthcoming. Its product promise is not that every agent thinks alike or stores state alike. Its promise is that work can begin from a shared channel and inherit the organization’s existing Slack controls.

The official claim that more than 70% of code channels complete from idea to merged pull request within a day should be treated only as a vendor reference point. Slack does not disclose the methodology, population, or measurement period. It is not sufficient evidence for a business case on its own.

Still, the workflow design is strategically sound. Product, design, engineering, and operations can observe the same request, review the same artifacts, and see the resulting decision without each participant needing access to a developer’s local harness. The channel can become an archive of the human approval boundary even if the agent backend changes.

Slack has also described visibility into an agent’s reasoning process as future work rather than a released capability. That is consistent with session migration’s deliberate omission of private or signed thinking traces. The part of an agent’s work that most needs explaining is structurally the least portable, because it is bound to the model provider.

The practical audit target is therefore narrower and more dependable: what was requested, what changed, what evidence was reviewed, and who approved it.

## What CEOs and CTOs should put into the vendor-switching model

Do not estimate agent vendor switching cost by asking whether session history can be exported. That produces a deceptively low number.

The right model asks whether the organization’s enforcement plane exists outside the harness:

- Can approval rules survive a CLI replacement?
- Can access and MCP connectivity be rebuilt from centrally owned configuration?
- Can an auditor find the rationale and approval record without reading a developer’s local session?
- Can a team revoke access or halt a workflow from one administrative surface?
- Can the organization assess what data leaves when a session is moved?

If the answer is yes, the agent harness becomes closer to a replaceable execution tool. That improves negotiating leverage. Procurement can pressure vendors on price, quality, and integration because the organization does not need to rebuild its governance model every time it changes a model or CLI.

If the answer is no, the vendor owns more than an interface. It owns embedded approval logic, access patterns, and operating memory. Its price is then much harder to discipline because replacement creates organizational risk, not merely developer inconvenience.

This also clarifies where to invest as agent usage grows. Buying additional licenses scales activity. Increasing the throughput and clarity of the audit plane scales the organization. The latter is what prevents agent adoption from becoming a collection of unreviewable local automations.

## Where this recommendation does not fit

A Slack-centered enforcement model does not fit teams whose collaboration standard is not Slack. The principle remains valid, but the policy plane must be implemented in the organization’s actual shared workflow system.

It also does not fit teams that already enforce approval effectively through CI and code owners. Adding channels as a second approval authority can make the system worse by splitting the evidence trail.

Organizations prohibited from retaining conversation logs in third-party SaaS need a different archive design. Teams with only a handful of agent requests per day may find automatically created channels generate more archive overhead than operating value. And teams that require private reasoning traces as audit evidence should recognize that neither a portable session nor a channel archive presently solves that requirement.

My position is clear: use session migration as an individual continuity tool, but do not elevate it into the team’s governance standard. Put approval, audit, archival, and revocation into one tool-neutral enforcement plane; I would change that position only if session formats begin to carry portable, centrally verifiable policy and identity state alongside the conversation.

## References

1. [Slack Code: チームと AI エージェントが共に作り上げる場所 — Slack](https://slack.com/intl/ja-jp/blog/news/slack-code-channels-for-agents)
2. [session-migrate — Migrate your sessions to any harness — GitHub / xhluca](https://github.com/xhluca/session-migrate)
3. [session-migrate README — Compatibility — GitHub / xhluca](https://raw.githubusercontent.com/xhluca/session-migrate/main/README.md)
