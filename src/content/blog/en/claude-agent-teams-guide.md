---
title: 'Claude Code Agent Teams: 5-Team Setup and Production Guide'
description: >-
  How to activate Claude Code Agent Teams in OpenClaw: 5 specialized agents with
  multi-agent orchestrator pattern for production-grade workflow automation.
pubDate: '2026-02-07'
heroImage: ../../../assets/blog/claude-agent-teams-guide-hero.png
tags:
  - claude-code
  - agent-teams
  - openclaw
  - multi-agent
  - tmux
  - automation
relatedPosts:
  - slug: multi-agent-orchestration-improvement
    score: 0.9
    reason:
      ko: Claude Code 주제를 한 단계 더 깊이 파고드는 글입니다.
      en: Goes one level deeper into Claude Code.
      ja: Claude Codeをもう一歩深く掘り下げた記事です。
      zh: 更深入地探讨 Claude Code 主题。
  - slug: effiflow-automation-analysis-part1
    score: 0.85
    reason:
      ko: Claude Code를 실제로 다뤄본 경험이 이어지는 글입니다.
      en: Continues the hands-on Claude Code experience.
      ja: Claude Codeを実際に扱った経験が続く記事です。
      zh: 延续 Claude Code 的实战经验。
  - slug: effiflow-automation-analysis-part2
    score: 0.8
    reason:
      ko: 같은 Claude Code 흐름에서 함께 읽으면 좋습니다.
      en: Worth reading alongside this in the same Claude Code track.
      ja: 同じClaude Codeの流れで併せて読むと役立ちます。
      zh: 在同一 Claude Code 脉络中可一并阅读。
faq:
  - question: "How do Agent Teams differ from subagents?"
    answer: "Subagents run inside a single session and only report results back to the caller. Agent Teams consist of fully independent Claude Code instances, each with its own context window, that message each other directly. Coordination happens autonomously through a shared task list instead of being handled entirely by the main agent."
  - question: "How do I enable Agent Teams?"
    answer: "Agent Teams are disabled by default. You can set the environment variable CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1, or add the same value to the env section of ~/.claude/settings.json for a persistent setting. The settings.json approach is more reliable because environment variables vanish between sessions."
  - question: "How do I prevent multiple teammates from editing the same file?"
    answer: "There is no file-level locking yet, so you have to work around it through task design. Clearly separate directory and file ownership per teammate, and use task dependencies to ensure shared files have only a single writer."
  - question: "How expensive are Agent Teams in token cost?"
    answer: "Each teammate uses its own context window, so a 5-person team means at least 5x token consumption. Use subagents for simple tasks and reserve Agent Teams for discussion, review, and parallel exploration where collaboration actually adds value."
---

## How Agent Teams differ from subagents

On February 5, 2026, Anthropic announced <strong>Agent Teams</strong>, a new experimental feature for Claude Code. Subagents run within a single session and can only report results back to the caller. Agent Teams work differently. They consist of fully independent Claude Code instances that <strong>communicate directly with each other</strong>.

Here's the key difference:

| Aspect | Subagents | Agent Teams |
|--------|-----------|-------------|
| Context | Inside the main session | Each has its own context window |
| Communication | Results return to main only | Teammates message each other directly |
| Coordination | Main agent handles everything | Self-coordination via shared task list |
| Token cost | Relatively low | Scales with number of teammates |

I tested it in my OpenClaw environment the same day it dropped. This post documents the whole process: the setup, the stumbling blocks, and what I learned along the way.

## Prerequisites: the OpenClaw dev build

Agent Teams requires the latest Claude Code. At the time, OpenClaw's stable channel had a cron job bug that needed fixing anyway, so switching to the dev channel killed two birds with one stone. (Related post)

### Enable pnpm

```bash
corepack enable pnpm
```

### Switch to dev channel and build from source

```bash
export OPENCLAW_GIT_DIR=~/openclaw
openclaw update --channel dev
```

If the automatic update fails, build manually:

```bash
cd ~/openclaw
pnpm install && pnpm build && npm install -g .
```

### Restart the gateway

```bash
openclaw gateway restart
```

This gets you on dev channel v2026.2.4, which includes the Claude Code version that supports Agent Teams.

## Enabling Agent Teams

Agent Teams are disabled by default. Two ways to enable them:

### Option 1: Environment variable

```bash
export CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1
```

### Option 2: Persistent setting in settings.json

`~/.claude/settings.json`:

```json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```

### For OpenClaw LaunchAgent users

If you run OpenClaw as a macOS LaunchAgent, add the variable to your plist file's `EnvironmentVariables` section so it persists across gateway restarts:

```xml
<key>EnvironmentVariables</key>
<dict>
    <key>CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS</key>
    <string>1</string>
</dict>
```

I went with the settings.json approach. Environment variables vanish between sessions; settings.json gets loaded automatically every time Claude Code starts.

## Configuring teammateMode

Agent Teams supports three display modes:

- <strong>in-process</strong>: All teammates run inside the main terminal. Use `Shift+↑/↓` to select teammates.
- <strong>tmux</strong>: Each teammate gets its own tmux split pane. See everyone's output at once.
- <strong>iTerm2</strong>: Auto-splits when running in iTerm2.

The default is `auto`: split panes if you're already in tmux, in-process otherwise.

I explicitly set <strong>tmux mode</strong>:

```json
{
  "teammateMode": "tmux"
}
```

The reasoning is straightforward: when running 5 teams simultaneously, you need to see each teammate's progress <strong>in real time on one screen</strong> to catch bottlenecks quickly.

If tmux isn't installed:

```bash
brew install tmux
```

## How I split the five teams

Here's how I structured the five teams and the thinking behind each.

### 1. ops (Operations)

Infrastructure checks, gateway health monitoring, cron job verification. Especially critical right after the dev channel switch.

### 2. branding

Blog post creation, hero image generation, multilingual content management. This team produces technical content in 4 languages (EN/KO/JA/ZH) simultaneously.

### 3. invest (Investment)

Market analysis, portfolio review, and risk assessment, all running in parallel.

### 4. dev (Development)

Code review, refactoring, test writing, feature implementation. The key here is clearly separating each teammate's module ownership to prevent file conflicts.

### 5. social

Social media draft creation, trend analysis, community monitoring.

Example team setup prompt:

```
Create 5 agent teams:
- ops: Infrastructure operations and monitoring
- branding: Content production and multilingual management
- invest: Market analysis and investment research
- dev: Code writing and review
- social: SNS and community management
Assign 2 teammates to each team using the Sonnet model.
```

## Task Lists and Dependency Management

One of Agent Teams' core mechanisms is the <strong>shared task list</strong>. The team lead creates tasks, and teammates autonomously claim and process them.

### Task states

- <strong>pending</strong>: Waiting to be picked up
- <strong>in progress</strong>: Currently being worked on
- <strong>completed</strong>: Done

### Dependencies

When you set up task dependencies, downstream tasks can't be claimed until their prerequisites are complete.

Real example:

```
Task list:
1. [ops] Gateway health check
2. [ops] Cron job verification (→ depends on #1)
3. [branding] Blog draft writing
4. [branding] Hero image generation
5. [branding] Multilingual translation (→ depends on #3)
6. [dev] Recommendation system refactoring
7. [dev] Test writing (→ depends on #6)
```

Task claiming uses file locking to prevent race conditions when multiple teammates try to grab the same task simultaneously.

## Running in Production

### Delegate mode

By default, the team lead can do work directly. <strong>Delegate mode</strong> restricts the lead to coordination only:

- Spawning/shutting down teammates
- Relaying messages
- Managing tasks

Enable it with `Shift+Tab`.

For large teams, delegate mode is strongly recommended. When the lead starts coding, coordination gaps appear.

### Talking to teammates directly

You can bypass the lead and message any teammate:

- <strong>in-process</strong>: `Shift+↑/↓` to select, then type
- <strong>tmux</strong>: Click into the teammate's pane

### Plan approval

For critical work, require teammates to plan before executing:

```
Create an architect teammate for the auth module refactor.
Require plan approval before any changes.
```

The lead reviews and approves or rejects with feedback.

## Where OpenClaw and Agent Teams meet

Here's what makes this interesting. OpenClaw's multi-agent capabilities and Agent Teams operate at <strong>different layers</strong>.

### OpenClaw Multi-Agent

- Manages agents at the <strong>channel level</strong> (Telegram, Discord, etc.)
- Each agent has its own persona and configuration
- Supports <strong>automated scheduling</strong> via cron jobs and heartbeats

### Claude Code Agent Teams

- Collaboration at the <strong>session level</strong> across multiple Claude Code instances
- Shared task list and messaging system
- Optimized for parallel code work

Combining both layers:

```
OpenClaw Agent (channel level)
  └─ Claude Code session
       └─ Agent Team (session level)
            ├─ Teammate A (ops)
            ├─ Teammate B (branding)
            └─ Teammate C (dev)
```

The pipeline: OpenClaw's main agent receives a Telegram message, spawns a subagent, that subagent sets up an Agent Team for parallel processing, then delivers results back through Telegram.

## Best Practices

### 1. Prevent file conflicts

The biggest pitfall is <strong>multiple teammates editing the same file</strong>.

- Clearly separate directory/file ownership per teammate
- Use task dependencies to ensure shared files have a single writer
- Check team config in `.claude/teams/`

### 2. Context handoff

Teammates auto-load CLAUDE.md, MCP servers, and skills, but they <strong>don't inherit the lead's conversation history</strong>. So:

- Include sufficient context in spawn prompts
- Explicitly reference relevant file paths
- Add team-wide information to CLAUDE.md if needed

### 3. Token management

Each teammate uses its own context window, so token consumption spikes fast.

- Use subagents for simple tasks
- Reserve Agent Teams for <strong>discussion, review, and parallel exploration</strong>
- Minimize broadcast messages, since cost scales with team size

### 4. Permission management

Teammates inherit the lead's permission settings. If the lead runs with `--dangerously-skip-permissions`, every teammate does too. Be careful.

## Limitations and Caveats

1. <strong>Experimental feature</strong>: The `EXPERIMENTAL` in the env var name says it all. The API may change.

2. <strong>Token cost</strong>: A 5-person team means at least 5x token consumption. Calculate your ROI.

3. <strong>Debugging complexity</strong>: Multiple teammates working simultaneously makes root cause analysis harder.

4. <strong>Inefficient for sequential work</strong>: Tasks with heavy dependencies end up running serially anyway — no point using teams.

5. <strong>Same-file editing risk</strong>: There's no file-level locking yet. You have to work around this through task design.

6. <strong>tmux is practically required</strong>: Monitoring 5 teams in in-process mode is painful. tmux is the way to go.

## What a day with it taught me

Agent Teams are still experimental, but the potential is clear. Combined with OpenClaw's multi-agent architecture, you get a dual-layer system: channel-level automation sitting on top of session-level parallel collaboration.

That said, throwing Agent Teams at every task right now would be wasteful. The scenarios that pay off are the ones where independent work piles up and teammates actually argue their way to a better answer. Parallel exploration. Code review. Competing hypothesis testing. Focus there.

Setup takes 30 minutes. The hard part is something else entirely: <strong>deciding what to team up and how to decompose tasks</strong>. That intuition only comes from getting your hands dirty.
