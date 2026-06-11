---
title: 'Claude Code June 2026 Update: Safe Mode, Opus 4.8, and Doubled Rate Limits'
description: >-
  A hands-on breakdown of Claude Code's June 2026 changes — Safe Mode, /cd
  command, Opus 4.8 as default, /usage granularity, and 2x rate limits.
pubDate: '2026-06-11'
heroImage: >-
  ../../../assets/blog/claude-code-june-2026-new-features-changelog-developer-guide-hero.png
tags:
  - claude-code
  - ai-tools
  - developer-tools
relatedPosts:
  - slug: ai-agent-cost-reality
    score: 0.95
    reason:
      ko: '요금 한도가 2배가 됐지만, 에이전트 세션에서 실제 비용이 어떻게 쌓이는지를 이해해야 한다. 이 글은 멀티 에이전트 워크플로우의 실제 비용 구조를 분석한다.'
      ja: レート制限が2倍になったが、エージェントセッションで実際のコストがどう積み重なるか理解が必要だ。この記事はマルチエージェントワークフローの実コスト構造を分析する。
      en: 'Rate limits doubled, but understanding how costs accumulate in agentic sessions matters just as much. This post breaks down the real cost structure of multi-agent workflows.'
      zh: 速率限制翻倍了，但了解agent会话中实际成本如何累积同样重要。这篇文章分析了多agent工作流的实际成本结构。
  - slug: dena-perl-go-migration-ai-agents
    score: 0.95
    reason:
      ko: 'Dynamic Workflows를 현업에서 어떻게 활용하는지 궁금하다면, DeNA가 레거시 코드베이스 마이그레이션에 AI 에이전트를 투입한 실제 사례가 좋은 비교 대상이다.'
      ja: Dynamic Workflowsを実業務でどう活用するか気になるなら、DeNAがレガシーコードベース移行にAIエージェントを投入した実際の事例が良い比較対象だ。
      en: "Wondering how Dynamic Workflows plays out in real production work? DeNA's AI-agent-driven legacy migration is a grounded comparison case."
      zh: 好奇Dynamic Workflows在真实工作中如何落地？DeNA利用AI agent进行遗留代码迁移的案例是很好的参照。
  - slug: anthropic-agent-skills-practical-guide
    score: 0.94
    reason:
      ko: '/usage 세분화로 스킬별 토큰 사용량이 보이기 시작했다. Anthropic 에이전트 스킬의 구조를 이해하면 어떤 스킬이 왜 많은 토큰을 쓰는지 해석하는 데 직접 도움이 된다.'
      ja: /usage細分化でスキル別のトークン使用量が見えるようになった。Anthropicエージェントスキルの構造を理解すると、どのスキルがなぜ多くのトークンを使うか解釈するのに直接役立つ。
      en: '/usage now shows per-skill token consumption. Understanding the Anthropic agent skills structure helps you interpret why certain skills are driving your usage.'
      zh: /usage细分化让每个技能的token用量变得可见。了解Anthropic agent技能结构，有助于解读为什么某些技能消耗较多token。
  - slug: anthropic-agent-skills-standard
    score: 0.94
    reason:
      ko: 'Claude Code가 Anthropic 에이전트 스킬 표준 위에서 동작한다. Safe Mode로 커스텀 스킬을 끄면 어떤 스킬이 기본인지 알 수 있는데, 이 글이 그 표준을 설명한다.'
      ja: Claude CodeはAnthropicエージェントスキル標準の上で動作する。Safe Modeでカスタムスキルをオフにするとデフォルトのスキルがわかるが、この記事がその標準を説明している。
      en: 'Claude Code runs on top of the Anthropic agent skills standard. Safe Mode strips custom skills. This post explains what the underlying standard actually defines.'
      zh: Claude Code建立在Anthropic agent技能标准之上。Safe Mode关闭自定义技能后，这篇文章解释了底层标准实际定义了什么。
  - slug: claude-agent-teams-guide
    score: 0.94
    reason:
      ko: 'Dynamic Workflows는 백그라운드에서 수십 개의 에이전트를 조율한다. Claude 에이전트 팀 가이드는 그 멀티 에이전트 조율의 기본 패턴을 다루고 있어 이해의 기반이 된다.'
      ja: Dynamic Workflowsはバックグラウンドで数十のエージェントを調整する。Claudeエージェントチームガイドは、そのマルチエージェント調整の基本パターンを扱っており理解の基盤になる。
      en: 'Dynamic Workflows coordinates dozens of agents in the background. The Claude agent teams guide covers the foundational patterns behind that multi-agent orchestration.'
      zh: Dynamic Workflows在后台协调数十个agent。Claude agent团队指南涵盖了这种多agent编排的基础模式，是理解的基础。
---

I ran `claude --version` a few days ago and saw 2.1.172. Popped open the release notes and found Safe Mode, a /cd command, Opus 4.8 as the new default, and per-category /usage breakdowns — all landing at once in early June. None of these is enormous on its own, but they stack up.

This isn't a rewrite of the release notes. I verified each feature directly with the CLI — ran `claude --safe-mode` myself, checked `claude agents --help` output, confirmed the npm version at 2.1.173. Here's what actually matters and what doesn't.

---

## One-Line Take First

<strong>Meaningful for heavy users. Hard to notice if you use Claude Code occasionally.</strong>

Safe Mode and /cd are for when your configuration breaks. The /usage breakdown shines when you're running multiple plugins and MCP servers. The rate limit doubling has the biggest real impact — but only if you were already hitting limits.

Opus 4.8 becoming the default affects everyone immediately. But that's a model upgrade, not a Claude Code feature change.

There are disappointments too. /cd is useful but complex multi-repo setups still need separate sessions for safety. And Safe Mode should have shipped months ago. "MCP config collision crashes startup" was a recurring complaint throughout 2025. The fact that a proper diagnostic mode took this long is genuinely frustrating.

---

## Safe Mode and /cd — When Your Config Is Broken

Safe Mode is a single flag:

```bash
claude --safe-mode
```

What gets disabled? CLAUDE.md, skills, plugins, hooks, MCP servers, custom commands, agents, output styles, workflows, themes, keybindings — everything you've added on top of the base install. Auth and model selection still work normally. `CLAUDE_CODE_SAFE_MODE=1` as an env var does the same thing.

I verified this in the actual `claude --help` output:

```
  --safe-mode     Start with all customizations
                  (CLAUDE.md, skills, plugins, hooks, MCP
                  servers, custom commands and agents,
                  output styles, workflows, custom themes,
                  keybindings, and more) disabled — useful
                  for troubleshooting a broken
                  configuration. Sets CLAUDE_CODE_SAFE_MODE=1.
```

My setup has several MCP servers and a handful of hooks. Occasionally, a misconfigured MCP server or a buggy hook would cause the session to fail on startup. Before Safe Mode, I'd manually comment out config sections, or temporarily wipe `.claude/settings.json`. Now I just run `--safe-mode` to get a clean diagnostic baseline.

Note: admin-managed policy settings still apply in Safe Mode, so enterprise security rules don't get bypassed. Also worth distinguishing from `--bare` — bare mode disables even OAuth authentication. Safe Mode only disables customizations, not core auth mechanics.

<strong>/cd</strong> lets you change the working directory mid-session without breaking the prompt cache. That's real, though in practice I find I still prefer separate sessions per repo to avoid context bleed. "Nice to have, not missing it daily" is my honest read.

---

## Opus 4.8 Default and Dynamic Workflows

Opus 4.8 shipped May 28. Claude Code switched it to the default on June 9 (v2.1.170). As of 2.1.172, it's what you get.

Anthropic calls it "a modest but tangible improvement" over 4.7 for coding and agentic tasks. Simon Willison's take was similar. In my own use, complex refactors and multi-file edits feel marginally better — fewer small mistakes — but nothing that makes me stop and notice.

[The 5 agent workflow patterns for Claude Code](/en/blog/en/claude-code-agentic-workflow-patterns-5-types) I covered earlier map directly onto what Opus 4.8's Dynamic Workflows enables.

Dynamic Workflows lets you say "turn this into a workflow" and Claude will coordinate tens to hundreds of agents in the background to handle large tasks. The headline numbers from Anthropic:

- Fast Mode is now 2.5x faster than previous models
- Fast Mode pricing for Opus 4.8 is roughly 3x cheaper than it was for prior Opus versions

The price cut on Fast Mode is more meaningful than it sounds — Opus was always expensive even in fast mode. That said, Dynamic Workflows as a feature needs a workload that justifies dozens of coordinated agents. For solo developers doing typical work, that scenario doesn't come up often. I haven't found a natural use case for it yet in my personal projects.

---

## /usage Granularity — Finally Seeing Where Tokens Go

This is the update I found most immediately actionable. It rolled out in Week 21 of May and stabilized in the June builds.

The old `/usage` showed you a total. "You used X tokens this month." If you had multiple plugins and MCP servers attached, you had no idea which one was responsible.

Now `/usage` breaks it down by category:

- Per-skill usage
- Per-subagent usage
- Per-plugin usage
- Per-MCP-server usage

The [Claude Code Plugins complete guide](/en/blog/en/claude-code-plugins-complete-guide) explains how a single plugin can bundle skills, hooks, and MCP servers together. The new /usage breakdown lets you see which component inside a plugin is actually consuming tokens — not just the plugin as a whole.

In my setup, I discovered my Google Analytics MCP server was consuming far more tokens than I expected — automatic calls on every session. Now that it's visible, I adjusted the call frequency in the MCP server config. I never would have caught that before.

Also: `/extra-usage` was renamed to `/usage-credits`. Minor, but "extra" implied overage in a way that "credits" doesn't.

---

## Rate Limits Doubled — What the SpaceX Deal Actually Means

On May 6, Anthropic signed an infrastructure deal with SpaceX, gaining access to over 300 megawatts of capacity and 220,000+ NVIDIA GPUs at SpaceX's Colossus 1 facility in Memphis.

The direct result: rate limits doubled across the board.

![Claude Code rate limits comparison chart](../../../assets/blog/claude-code-june-2026-new-features-changelog-developer-guide-rate-limits.png)

The headline number: API Tier 1 went from 30,000 to 500,000 input tokens per minute. Pro, Max, Team, and Enterprise plans all see their 5-hour rolling window limits doubled. Peak-hours throttling was removed for Pro and Max.

You'll feel this if you meet two conditions: you've hit rate limits before, and you run long agentic sessions regularly. If both are true, this is the most impactful change in the whole release.

For me, the throttling removal matters more than the raw limit increase. Working during peak hours (10am–noon) used to occasionally stall sessions. That friction is gone now.

For API users: Tier 1 input tokens going from 30k to 500k per minute means a small team running multi-agent pipelines can do so without hitting ceilings on most workflows.

---

## Safe Mode in Practice — When to Use It, When Not To

There's a right use case for Safe Mode and a wrong one.

<strong>Use it when:</strong> A new MCP server causes startup failures. Weird Claude behavior makes you suspect CLAUDE.md interference. A plugin update introduced unexpected behavior and you need to isolate which plugin is responsible.

<strong>Don't use it when:</strong> You're doing regular development work. Safe Mode kills your CLAUDE.md context, your skills, your MCP tools — everything you've configured to make Claude Code useful in your project. It's a diagnostic mode, not a daily driver.

Workflow tip: if the problem doesn't reproduce in Safe Mode, the cause is somewhere in your customizations. From there, disable plugins one at a time to narrow it down. Safe Mode is your starting point, not the whole diagnostic process.

---

## Hooks: MCP Tool Direct Calls and MessageDisplay

The [Claude Code hooks workflow](/en/blog/en/claude-code-hooks-workflow) I covered earlier got a meaningful extension in this update.

<strong>MCP tool type in hooks</strong>

You can now write hooks that call tools on already-connected MCP servers directly:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "type": "mcp_tool",
        "server": "my-validation-server",
        "tool": "validate_before_edit"
      }
    ]
  }
}
```

Previously, hooks that needed MCP access had to spawn a separate process. Now they reuse the already-running server connection. The performance improvement is real; the configuration simplification is welcome. Pre-edit validation, pre-Bash security checks — these become much cleaner to set up.

<strong>MessageDisplay hook event</strong>

Hooks can now intercept assistant message text before it's displayed — transform it, suppress it, forward it. Added in v2.1.152.

```json
{
  "hooks": {
    "MessageDisplay": [
      {
        "type": "command",
        "command": "message-filter.sh"
      }
    ]
  }
}
```

Honestly, this is a team feature more than a solo feature. Forwarding output to Slack, filtering sensitive info before display — these are organizational concerns. But it's a genuinely powerful hook point if you're building Claude Code into a team workflow.

---

## Small Changes Worth Knowing

`claude agents --json --all` is new. Without `--all`, `--json` shows only active sessions. With `--all`, you get completed sessions too. Confirmed from the live `claude agents --help` output:

```
  --all    With --json: include completed sessions
           (the full agent view list)
```

Useful for scripting around agent state — e.g., tracking when a dispatched session completes without polling a UI.

The "bash commands will be sandboxed" startup banner was removed. Sandbox status is still in `/status` and shows when commands are blocked. A minor QoL improvement but noticeable.

A bug where a brief backend disruption during session startup would permanently stall the session was fixed. JetBrains IDE terminal flickering was also patched.

---

## My Verdict: Good, Bad, and What's Missing

<strong>Good:</strong>

Safe Mode arriving late is still better than not arriving. /usage granularity was immediately actionable — I found a misconfigured MCP server within an hour of the update. Removing peak-hour throttling made my morning work sessions more reliable.

<strong>Bad:</strong>

Safe Mode should have shipped in 2025. The MCP config collision problem was well-documented and long-standing. Dynamic Workflows is genuinely exciting but the personal developer use case isn't there yet — you need workloads that justify spinning up dozens of coordinated agents, and most of us don't have those day-to-day.

<strong>What's missing:</strong>

Now that /usage shows per-component consumption, the natural next step is per-component budget controls. You can see that an MCP server is consuming 40% of your tokens, but you can't cap it. That's the feature I'd actually pay attention to when it ships.

Overall, this is a "quiet maintenance" release. If you run Claude Code heavily, you'll notice the improvements. If you were expecting a headline feature, the June release notes will disappoint you. That's fine — not every month needs to ship something new. Sometimes refinement is the right move.

If you want to track updates, the [What's new page](https://code.claude.com/docs/en/whats-new) in the official docs is the most reliable source. The npm package `@anthropic-ai/claude-code` was at 2.1.173 when I checked. Run `claude update` to stay current.
