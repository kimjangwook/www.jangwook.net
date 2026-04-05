---
title: >-
  Claude Code Source Leak — What 510K Lines Reveal About Agent Architecture
description: >-
  Anthropic's npm packaging error exposed Claude Code's full source. Agent loops, memory systems, cost optimization — what developers can learn from 510K lines.
pubDate: '2026-04-05'
heroImage: ../../../assets/blog/claude-code-source-leak-analysis-hero.jpg
tags:
  - claude-code
  - anthropic
  - ai-agent
  - source-code
  - security
relatedPosts:
  - slug: claude-code-hooks-workflow
    score: 0.91
    reason:
      ko: 유출 코드에서 발견된 에이전트 아키텍처를 이해했다면, Claude Code 훅 시스템의 실제 활용법도 함께 보면 좋다.
      ja: 流出コードで発見されたエージェントアーキテクチャを理解したなら、Claude Codeフックシステムの実践的な活用法も併せて読むと良い。
      en: If you understood the agent architecture from the leaked code, the practical hook system usage guide pairs well with it.
      zh: 如果你理解了泄露代码中的Agent架构，那么Claude Code Hook系统的实际应用指南也值得一读。
  - slug: claude-code-plugins-complete-guide
    score: 0.88
    reason:
      ko: 유출된 코드의 44개 피처 플래그 중 일부는 이미 플러그인으로 공식 출시됐다. 공식 기능과 미출시 기능의 차이를 비교해볼 수 있다.
      ja: 流出コードの44個のフィーチャーフラグの一部はすでにプラグインとして公式リリースされた。公式機能と未リリース機能の違いを比較できる。
      en: Some of the 44 leaked feature flags have already shipped as official plugins. Compare official features with unreleased ones.
      zh: 泄露代码中44个功能标志的一部分已作为插件正式发布。可以比较官方功能与未发布功能的差异。
  - slug: ai-coding-secrets-sprawl-mcp-config-security
    score: 0.90
    reason:
      ko: 유출 사건의 보안 시사점과 직접 연결된다. MCP 설정과 시크릿 관리의 위험성을 다룬 글이다.
      ja: 流出事件のセキュリティ上の示唆と直接つながる。MCP設定とシークレット管理のリスクを扱った記事だ。
      en: Directly connected to the security implications of the leak. Covers MCP config and secret management risks.
      zh: 与泄露事件的安全影响直接相关。讨论了MCP配置和密钥管理的风险。
  - slug: litellm-supply-chain-attack-ai-dependency-security
    score: 0.87
    reason:
      ko: npm 소스맵 유출도 결국 공급망 보안 문제다. AI 도구의 의존성 보안을 다른 각도에서 분석한 글이다.
      ja: npmソースマップ流出も結局サプライチェーンセキュリティの問題だ。AIツールの依存関係セキュリティを別の角度から分析した記事。
      en: The npm source map leak is ultimately a supply chain security issue. Analyzes AI tool dependency security from a different angle.
      zh: npm source map泄露归根结底也是供应链安全问题。从不同角度分析了AI工具依赖安全。
  - slug: production-grade-ai-agent-design-principles
    score: 0.85
    reason:
      ko: 유출된 에이전트 루프와 메모리 설계를 참고하려면, 프로덕션급 AI 에이전트의 설계 원칙도 함께 읽어야 한다.
      ja: 流出されたエージェントループとメモリ設計を参考にするなら、プロダクショングレードAIエージェントの設計原則も一緒に読むべきだ。
      en: If you want to reference the leaked agent loop and memory design, read this alongside for production-grade AI agent design principles.
      zh: 如果要参考泄露的Agent循环和内存设计，也应该一起阅读生产级AI Agent的设计原则。
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
