---
title: Claude Code Source Leak — What 510K Lines Reveal About Agent Architecture
description: >-
  Anthropic's npm packaging error exposed Claude Code's full source. Agent
  loops, memory systems, cost optimization — what developers can learn from 510K
  lines.
pubDate: '2026-04-05'
heroImage: ../../../assets/blog/claude-code-source-leak-analysis-hero.jpg
tags:
  - claude-code
  - anthropic
  - ai-agent
  - source-code
  - security
relatedPosts:
  - slug: claude-code-local-model-inefficiency
    score: 0.95
    reason:
      ko: 'AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: 'Covers similar topics in AI/ML, architecture with comparable difficulty.'
      zh: 在AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: anthropic-pentagon-ai-governance-cto-lessons
    score: 0.95
    reason:
      ko: 'AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: 'Covers similar topics in AI/ML, architecture with comparable difficulty.'
      zh: 在AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: ccc-vs-gcc-ai-compiled-c-compiler
    score: 0.94
    reason:
      ko: 'AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: 'Covers similar topics in AI/ML, architecture with comparable difficulty.'
      zh: 在AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: gpt4o-retirement-model-dependency-risk
    score: 0.94
    reason:
      ko: 'AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: 'Covers similar topics in AI/ML, architecture with comparable difficulty.'
      zh: 在AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: nist-ai-agent-security-standards
    score: 0.94
    reason:
      ko: 'AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: 'Covers similar topics in AI/ML, architecture with comparable difficulty.'
      zh: 在AI/ML、架构领域涵盖类似主题，难度相当。
---

On March 31, Anthropic published Claude Code v2.1.88 to npm. Should have been a routine patch update, but the package contained a 59.8MB `.map` source map file. Security researcher Chaofan Shou posted this on X, and within hours, it was forked 84,000 times on GitHub.

1,906 TypeScript files. Roughly 510,000 lines of code. Claude Code's entire client-side agent harness was exposed.

I dug into the source code myself and found some genuinely interesting design decisions. Rather than chasing the sensational angle that the word "leak" invites, I want to focus on the patterns that agent developers can actually reference from this codebase.

## How It Happened

The culprit is Bun. Claude Code runs on the Bun runtime instead of Node.js, and Bun had a [known bug](https://github.com/oven-sh/bun/issues/28001) that served source maps even in production builds. The issue was reported on March 11 but wasn't fixed by the time of the leak.

Anthropic told CNBC and VentureBeat that it was "a human error in the deployment packaging process, not a security breach." No customer data or authentication credentials were included.

But here's the thing — this was the second incident. Days earlier, a CMS misconfiguration had leaked internal documents about an unreleased model called "Mythos." With IPO rumors swirling, this level of operational security feels concerning.

## The Agent Loop — More Complex Than You'd Think

The first thing that caught my eye in the leaked code was the agent loop structure.

At its core, Claude Code is a reactive system. The user sends a message, and it responds. Nothing unusual there. But the code contains a feature flag called `PROACTIVE`, and enabling it activates a mode called `KAIROS`. KAIROS uses a heartbeat mechanism to periodically evaluate "is there something worth doing right now?" and acts autonomously without user input.

In plain terms, it's a daemon mode that runs 24/7 in the background, making decisions like "should I clean up memory?" or "should I suggest refactoring this code?" on its own.

What struck me about this architecture is the clear separation between "initiative (deciding what to do)" and "execution (actually doing it)." Even when KAIROS determines something is worth doing, the action still has to pass through a separate permission gate. The most dangerous scenario with autonomous agents is "the AI did something on its own and things went sideways" — this separation helps mitigate that risk.

Since it's an unreleased feature, I have no idea how well it actually works in practice.

## Prompt Caching — The Art of Saving Money

If you've used Claude Code for any significant amount of time, you know the token costs add up. The leaked code shows Anthropic takes this very seriously.

The core pattern is `SYSTEM_PROMPT_DYNAMIC_BOUNDARY`. It splits the system prompt into a "static front portion" and a "dynamic back portion." The static part gets cached and reused, cutting down on expensive prompt processing costs.

```typescript
// Pattern found in the leaked code (simplified)
const systemPrompt = [
  STATIC_INSTRUCTIONS,        // Cached — tool definitions, behavior rules, etc.
  SYSTEM_PROMPT_DYNAMIC_BOUNDARY,  // Boundary marker
  DYNAMIC_CONTEXT              // Fresh every time — current file state, git info, etc.
];
```

On Reddit's r/ClaudeAI, there were reports of people using the leaked code to identify a "cache invalidation bug" and reducing token consumption by 10〜20x. Developers like Theo Browne criticized this cache invalidation bug for pushing unnecessary costs onto users.

This pattern is something I can use in my own projects. When calling LLM APIs, separating the static portion of your system prompt and leveraging prompt caching can significantly reduce costs, especially in long conversation sessions.

## Three-Tier Memory — Why Claude Code Remembers Context So Well

The memory architecture was impressive. It's built in three tiers:

<strong>Tier 1 — Lightweight Index Pointers</strong>: Always resident in memory. Acts as a table of contents, telling the system "where memories about a given topic are stored."

<strong>Tier 2 — Topic Files</strong>: Loaded on demand. The actual memory content, separated by project and topic.

<strong>Tier 3 — Transcripts</strong>: Accessed only via grep operations. Stores entire past conversations but only references them when searching.

On top of this, there's a process called `autoDream`. During idle periods, it organizes memories, removes duplicates, and consolidates information. The name "autoDream" is a nice touch — just like humans consolidate memories during sleep, the agent tidies up its memories during downtime.

Looking at this design, something clicked: the reason Claude Code makes such good use of project context I write in CLAUDE.md is this memory architecture. The Tier 1 index holds a pointer saying "information about this project lives in CLAUDE.md," and when needed, Tier 2 loads the actual content.

## Undercover Mode — This One's Uncomfortable

Among the leaked files is `undercover.ts`, a 90-line file. What it does is strip Anthropic's traces when Claude Code contributes to external open-source projects.

The system prompt includes this directive:

> "You are operating UNDERCOVER... Your commit messages... MUST NOT contain ANY Anthropic-internal information. Do not blow your cover."

It scrubs internal codenames (Capybara, Numbat, Fennec, Tengu), Slack channel names from commit messages, and removes any indication that "Claude Code" authored the contribution. It's described as irreversible suppression.

This makes me uncomfortable. AI contributing to open source isn't inherently problematic — but hiding that fact is a different story. Intentionally concealing the origin of contributions clashes with the transparency principles that open source is built on. Until Anthropic explains why this feature exists, it chips away at trust.

Of course, whether this feature is actively used or just an experimental implementation sitting dormant is impossible to tell from the code alone. It's managed by a feature flag, so it could well be disabled.

## Competitive Defense Mechanisms

The source code also revealed several defense mechanisms aimed at competitors.

<strong>Anti-distillation</strong>: API requests include an `anti_distillation: ['fake_tools']` flag that injects fake tool definitions. When competitors intercept traffic to use as training data, this fake data gets mixed in. A server-side mechanism called `CONNECTOR_TEXT` summarizes assistant output while embedding cryptographic signatures, preventing capture of full reasoning chains.

<strong>DRM</strong>: API requests contain placeholder values like `cch=ed1b0`, which Bun's Zig-based HTTP stack replaces with computed hashes just before transmission. Since this operates below the JavaScript runtime, it can't be bypassed through runtime patching.

From what I've seen, embedding this level of anti-distillation defense in client-side code is unprecedented. Typically this kind of protection lives on the server. Putting it in the client means when the code leaks (like now), the entire mechanism is exposed.

## Hidden Features — 44 Feature Flags

44 unreleased feature flags were discovered. Here are some highlights:

- <strong>Background Agents</strong>: Always-on 24/7 execution. Multi-agent orchestration where one Claude coordinates multiple worker Claudes.
- <strong>Cron Scheduling</strong>: Automated execution at specified times.
- <strong>Voice Command Mode</strong>: Verbal instructions.
- <strong>Playwright Browser Automation</strong>: Direct browser manipulation.
- <strong>Self-Healing Agents</strong>: Auto-resume after sleep.
- <strong>Three Sub-Agent Execution Models</strong>: fork, teammate, worktree.

And then there's the absurd stuff. A file called `buddy/companion.ts` implements a "buddy system" where you raise 18 types of virtual pets. There are rarity tiers, and a 1% chance of getting a shiny pet. Is this Pokemon?

Some of these features have already shipped in recent Claude Code updates. Background agents and cron scheduling in particular seem to have been fast-tracked to official release after the leak. Makes you wonder if the leak accelerated the launch timeline.

## Security Considerations

There's an issue more serious than the leak itself. Vulnerabilities like CVE-2025-59536 and CVE-2026-21852 have been identified, and with the source code public, exploitation becomes significantly easier.

Specifically:
- Cloning a repo containing malicious `.claude/` configuration files can enable remote code execution (RCE)
- API key exfiltration through MCP servers or environment variables

According to BleepingComputer, cases have already been found on GitHub where infostealer malware was distributed using "Claude Code leak analysis" as bait. Opening the leaked code itself won't get you hacked, but be wary of repos claiming to be "leak analysis tools."

In my view, code being public can actually benefit security in the long run — more eyes reviewing means more bugs found. The problem is that this was an unintended disclosure. Anthropic wasn't prepared for the code to be out there, and if attackers found vulnerabilities first, that's dangerous.

## What Developers Can Take Away

I wouldn't recommend forking and using the leaked code directly — there are DMCA implications. Anthropic has filed DMCA takedowns against over 8,100 repositories. But referencing the architectural patterns is a different matter.

Here's what I found most worth studying:

<strong>Prompt caching strategy</strong>. The pattern of splitting system prompts into static and dynamic portions applies to any project using LLM APIs. Using Anthropic API's prompt caching feature can dramatically reduce costs on repeated calls.

<strong>Three-tier memory design</strong>. The index → topic → raw data hierarchy is directly applicable to RAG systems or agents that need long-term memory. The key insight is separating "what's always in memory" from "what loads on demand."

<strong>Separating initiative from execution</strong>. When building autonomous agents, splitting the "decide what to do" module from the "actually do it" module with a permission gate in between. This directly helps reduce incidents in production agents.

## So What Now for Anthropic?

A developer named Sigrid Jin used OpenAI Codex to rewrite the leaked TypeScript code in Python, creating a project called "claw-code." It hit 50,000 GitHub stars in two hours and is now at 105,000. Whether copyright applies to AI-rewritten code remains legally unclear.

Anthropic responded with DMCA takedowns, but once code hits the internet, it doesn't disappear. Analysis results are already spread across dozens of blogs, wikis, and forums. In a sense, this has become "forced open source."

One thing I'm curious about: will this incident influence Anthropic's open-source strategy? With the code already fully public, does clinging to closed source even make sense? Officially transitioning to open source and accepting community contributions might be the better move. Though admittedly, they probably don't want to officially publish competitive defense mechanisms like anti-distillation.

The biggest lesson from this incident might not be technical at all. Double-check the `.map` files in packages you publish to npm. Whether your `files` field or `.npmignore` explicitly excludes source maps — I should audit my own projects too.

## References

- [Engineer's Codex — Diving into Claude Code's Source Code Leak](https://read.engineerscodex.com/p/diving-into-claude-codes-source-code)
- [Kilo Blog — Claude Code Source Leak: A Timeline](https://blog.kilo.ai/p/claude-code-source-leak-a-timeline)
- [Fortune — Anthropic leaks its own AI coding tool's source code](https://fortune.com/2026/03/31/anthropic-source-code-claude-code-data-leak-second-security-lapse-days-after-accidentally-revealing-mythos/)
- [VentureBeat — Claude Code's source code appears to have leaked](https://venturebeat.com/technology/claude-codes-source-code-appears-to-have-leaked-heres-what-we-know)
- [SecurityWeek — Critical Vulnerability in Claude Code Emerges Days After Source Leak](https://www.securityweek.com/critical-vulnerability-in-claude-code-emerges-days-after-source-leak/)
- [Kir Shatrov — Reverse engineering Claude Code](https://kirshatrov.com/posts/claude-code-internals)
- [BleepingComputer — Claude Code leak used to push infostealer malware](https://www.bleepingcomputer.com/news/security/claude-code-leak-used-to-push-infostealer-malware-on-github/)
