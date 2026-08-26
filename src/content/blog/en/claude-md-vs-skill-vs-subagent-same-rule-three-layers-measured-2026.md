---
title: "CLAUDE.md vs Skills vs Subagents: Cost Is Not the Boundary"
description: "CLAUDE.md, SKILL.md, and subagents solve different reach and lifecycle problems. The boundary that matters is enforcement, and none of them is a control plane."
pubDate: 2026-08-24
heroImage: '../../../assets/blog/claude-md-vs-skill-vs-subagent-same-rule-three-layers-measured-2026/hero.png'
tags:
  - AI Engineering
  - Agent Architecture
  - Developer Productivity
relatedPosts: []
---

I wanted to know whether moving the same rule from CLAUDE.md to a skill, then to a subagent, actually lowers its context cost. I traced the documented loading paths and ran a controlled Claude CLI command to validate the measurement harness before trusting any token result. The conclusion is that layer choice is primarily a decision about reach, lifecycle, isolation, and enforceability—not a simple cost-reduction move.

That matters because teams are turning agent instructions into production operating procedures; my call is simple: define placement rules, remove duplicate guidance, and move non-negotiable controls into hooks.

## The operational problem is not where to write a rule

In architecture modernization work, the question arrives in a familiar form: where should we put this instruction so the agent follows it?

A project rule gets added to CLAUDE.md. It grows. Someone moves the long procedure into SKILL.md. Then a dedicated subagent appears because the procedure still seems unreliable. After several iterations, the same instruction exists in three places, nobody can say which copy was present in a given run, and a later edit introduces a contradiction.

That is not merely a token-efficiency problem. In systems handling identity, financial records, or personal data, it becomes an auditability problem. "Do not write PII to logs" being present in context is not evidence that the action was prevented. A rule placed in a prompt is an attempt to influence behavior. A control that blocks an action is a different kind of system component.

Claude Code documents that distinction plainly:

> "Both are loaded at the start of every conversation. Claude treats them as context, not enforced configuration. To block an action regardless of what Claude decides, use a PreToolUse hook instead."

> — [How Claude remembers your project](https://code.claude.com/docs/en/memory)

For an EM, this changes the review question. Do not ask only whether an instruction is well written. Ask whether the business is relying on it as advice, workflow guidance, isolation, or an actual preventative control.

## The three layers are loaded through different paths

CLAUDE.md is resident context. It is loaded at the beginning of a session and consumes tokens alongside the conversation.

> "CLAUDE.md files are loaded into the context window at the start of every session, consuming tokens alongside your conversation."

> — [How Claude remembers your project](https://code.claude.com/docs/en/memory)

That makes CLAUDE.md appropriate for compact, stable project facts: repository conventions, non-negotiable architectural constraints, and the small number of rules genuinely needed throughout work. It is not a system prompt, though. The documentation says its contents are delivered as a user message after the system prompt, which means it is context rather than forced configuration.

Skills have a different cost shape. Their descriptions are available so the agent can discover them, while full instructions load only when invoked.

> "Unlike CLAUDE.md content, a skill's body loads only when it's used, so long reference material costs almost nothing until you need it."

> — [Extend Claude with skills](https://code.claude.com/docs/en/skills)

That is progressive disclosure, and it is valuable. But "almost nothing until you need it" does not mean "almost nothing after you need it." Once invoked, the rendered skill content remains in the conversation for the rest of the session. The documentation is explicit about the economic consequence:

> "Once a skill loads, its content stays in context across turns, so every line is a recurring token cost."

> — [Extend Claude with skills](https://code.claude.com/docs/en/skills)

A skill is therefore not intrinsically cheap. It postpones when a cost begins. For compaction, Claude Code re-attaches the most recent invocation of each skill after the summary, retaining the first 5,000 tokens of each skill within a combined 25,000-token budget. Older skills can be dropped entirely when many have been invoked.

Subagents are another category again. They begin with isolated context rather than inheriting the parent conversation.

> "Each subagent starts with a fresh, isolated context window. It doesn't see your conversation history, the skills you've already invoked, or the files Claude has already read."

> — [Subagents](https://code.claude.com/docs/en/sub-agents)

That isolation is useful when a task would otherwise pollute the main working context. It does not mean the subagent starts empty.

## The optimization breaks where inheritance begins

The common migration story says: CLAUDE.md is expensive, skills are lazy, and subagents are isolated. Therefore, move instructions downward and cost falls.

The official mechanics do not support that as a general rule.

A non-fork subagent starts with its own task message and system context, but it also receives the CLAUDE.md hierarchy that the main conversation loads. What that hierarchy actually resolves to in unattended runs is something I tested across 21 runs with @import and symlinks. That includes user-level, project, local, and managed policy files. The built-in Explore and Plan agents are the stated exceptions.

The startup path also changes the meaning of a preloaded skill. In a regular session, a skill can remain undisclosed until needed. For a subagent configured with a skill, the full skill content is injected at startup.

> "Subagents with preloaded skills work differently: the full skill content is injected at startup."

> — [Extend Claude with skills](https://code.claude.com/docs/en/skills)

This is the architectural point leaders should retain: progressive disclosure is not a property of a file format. It is a property of a loading path.

The SKILL.md format has become more portable because it was released as an [open standard](/en/blog/en/anthropic-agent-skills-standard) and adopted by a growing number of agent products. That makes it a sensible place for reusable procedures. It does not guarantee that every runtime will preserve the same lazy-loading behavior, particularly across subagent implementations.

> "Discovery: At startup, agents load only the name and description of each available skill... Full instructions load only when a task calls for them, so agents can keep many skills on hand with only a small context footprint."

> — [Agent Skills Overview](https://agentskills.io/home)

For architecture governance, "what is inherited?" and "when is it loaded?" must be documented as separate columns. Teams that combine them into one mental model create cost surprises and compliance blind spots.

## The strongest counter-argument is right in an important range

The strongest objection is that a subagent does not receive the parent conversation history. In a long-running session, that history can be far larger than a compact CLAUDE.md file. If the subagent returns only a short summary, the savings from not transferring the long history can outweigh inherited project instructions by a wide margin.

That argument is right when three conditions hold together:

- The parent session has already accumulated substantial conversation history.
- CLAUDE.md remains within a disciplined 200-line operating guideline.
- The subagent returns a concise result rather than a detailed transcript.

Under those conditions, using a subagent can be the economically better choice. Isolation can also improve output quality by keeping exploratory material, noisy repository inspection, or intermediate reasoning away from the main task context.

But the argument does not establish that moving rules to subagents is generally cheaper. It weakens in short early-session delegations, in monorepos with layered and bloated CLAUDE.md files, and when subagents return detailed results. The return path matters because completed subagent results enter the main conversation.

The documentation warns directly about that round trip:

> "When subagents complete, their results return to your main conversation. Running many subagents that each return detailed results can consume significant context."

> — [Subagents](https://code.claude.com/docs/en/sub-agents)

A subagent decision should therefore be evaluated as a workflow transaction: startup context, work performed in isolation, and result returned to the parent. Looking only at the fresh context window is like evaluating a distributed service by the cost of its request handler while ignoring serialization, network transfer, and response payloads.

## Why token measurement needs the same rigor as production telemetry

I do not have per-layer token measurements to report. A planned set of runs completed with exit code 0, but the parser assumed a top-level JSON object and produced no usable measurements after the CLI returned an array. The correct conclusion is not that a layer was cheap or expensive; it is that the measurement was not collected.

In one controlled command run using Claude CLI 2.1.241, `claude --output-format json` returned a top-level list rather than a dictionary. The list contained `system`, `assistant`, `rate_limit_event`, and `result` elements, with usage data inside the `result` element. The headless-mode documentation describes the format differently:

> "json: structured JSON with result, session ID, and metadata"

> — [Headless mode](https://code.claude.com/docs/en/headless)

This is a mundane failure, but it has executive significance. AI cost governance cannot rest on scripts that assume an output schema without first checking the top-level type. A dashboard can show a precise zero while actually reporting an unmeasured run. That is worse than missing data because it invites decisions with false confidence.

The official subagent documentation also does not state a token figure per spawn as of 2026-08-24. A secondary source attributes a 4-7x multiplier to multi-agent workflows, but its claimed official attribution could not be verified against a corresponding official page or statement. It is a reference point, not a budget model.

> "Anthropic's own documentation notes that multi-agent workflows use roughly 4-7x more tokens than single-agent sessions"

> — [Claude Code Agents & Subagents — What They Actually Unlock](https://www.ksred.com/claude-code-agents-and-subagents-what-they-actually-unlock/)

CFOs and CTOs should demand the same standard used for cloud unit economics: distinguish observed consumption, documented bounds, model assumptions, and external claims. They are not interchangeable.

## Turn layer placement into a team operating system

The practical answer is a four-part placement policy that can be reviewed in a pull request.

| Need | Placement | Review question |
| --- | --- | --- |
| Stable project fact needed across work | CLAUDE.md | Is this truly needed in every session? |
| Multi-step procedure used for specific work | SKILL.md | Can the procedure be shorter, and is it invoked only when relevant? |
| Isolated investigation with a summarized outcome | Subagent | Does isolation outweigh startup and return-context cost? |
| Rule that must prevent an action | PreToolUse hook | Can the control be tested and audited independently of model compliance? |

I would make the policy operational rather than aspirational.

First, cap CLAUDE.md at 200 lines as a team discipline. The number is not magic; the decision is. Every resident line should need to survive a challenge: does every session require this, or are we compensating for a missing procedure, test, lint rule, or hook?

Second, require an explicit length declaration whenever a subagent preloads a skill. The PR description should state that the skill body is injected at startup for each spawn. This catches the most expensive misunderstanding before it reaches production workflows.

Third, scan CLAUDE.md, skills, and subagent prompts for duplicated rules. Duplicate instructions create recurring context cost, but the more serious issue is divergence. Once two copies differ, the team has created an undocumented precedence system.

Fourth, make context inspection part of onboarding. Engineers should inspect loaded memory files rather than infer them from repository layout. The discipline is simple: distinguish what was intended to load from what actually loaded.

Finally, version measurement harnesses as production tooling. Parse output defensively, retain raw artifacts, and treat a schema mismatch as a failed measurement rather than a zero-cost result.

## The CEO and CTO decision is governance, not prompt optimization

The business case for this discipline is not a promised token reduction percentage. It is a reduction in unbounded operational behavior.

Without a placement policy, instruction volume rises with team size. New engineers add rules to the most visible file. Specialists create parallel skills. Automation owners preload them into subagents. Costs become difficult to attribute, and no one can prove which policy was available when a critical workflow ran.

With a placement policy, three things improve at once.

Unit economics become reviewable because resident context, invoked procedures, and spawned workloads have named owners and visible boundaries. Cost may still rise as usage rises, but it rises through observable decisions rather than silent duplication.

Compliance becomes more defensible because teams stop treating contextual instructions as controls. Sensitive data restrictions, production command gates, and secret-handling rules can [move into hooks](/en/blog/en/claude-code-hooks-workflow) where the system can block rather than request compliance.

Time to market improves because engineers no longer debate placement from first principles during every agent-related PR. A clear operating model reduces design churn and lets teams spend their attention on the actual product or migration work.

My recommendation is to stop treating CLAUDE.md, SKILL.md, and subagents as three price tiers. Use CLAUDE.md for compact standing context, skills for selectively invoked procedures, subagents for isolation, and hooks for enforcement. I would change that recommendation only if reliable per-layer telemetry shows that duplicated, inherited instructions consistently cost less than removing them.

## References

1. [Extend Claude with skills](https://code.claude.com/docs/en/skills)
2. [Subagents](https://code.claude.com/docs/en/sub-agents)
3. [How Claude remembers your project](https://code.claude.com/docs/en/memory)
4. [Agent Skills Overview](https://agentskills.io/home)
5. [Headless mode](https://code.claude.com/docs/en/headless)
6. [Claude Code Agents & Subagents — What They Actually Unlock](https://www.ksred.com/claude-code-agents-and-subagents-what-they-actually-unlock/)
