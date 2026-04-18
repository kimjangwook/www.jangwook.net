---
title: >-
  Coding via Telegram with Claude Code Channels — An Honest Comparison from an
  OpenClaw User
description: >-
  Claude Code now has a Channels feature. Send a message on Telegram, and Claude
  running in your local terminal executes code and replies. It borrows the
  channel concept from OpenClaw but takes a completely different approach to the
  security model — and that's what makes it interesting.
pubDate: '2026-03-21'
heroImage: ../../../assets/blog/claude-code-channels-telegram-bridge-hero.jpg
tags:
  - claude-code
  - ai-agents
  - automation
relatedPosts:
  - slug: llm-pm-workflow-automation
    score: 0.95
    reason:
      ko: '자동화, AI/ML, DevOps 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、DevOps分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, DevOps with comparable
        difficulty.
      zh: 在自动化、AI/ML、DevOps领域涵盖类似主题，难度相当。
  - slug: claude-agent-teams-guide
    score: 0.94
    reason:
      ko: '자동화, AI/ML, DevOps 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、DevOps分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, DevOps with comparable
        difficulty.
      zh: 在自动化、AI/ML、DevOps领域涵盖类似主题，难度相当。
  - slug: claude-code-cli-migration-guide
    score: 0.94
    reason:
      ko: '자동화, AI/ML, DevOps 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、DevOps分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, DevOps with comparable
        difficulty.
      zh: 在自动化、AI/ML、DevOps领域涵盖类似主题，难度相当。
  - slug: effiflow-automation-analysis-part3
    score: 0.94
    reason:
      ko: '자동화, AI/ML, DevOps 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、DevOps分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, DevOps with comparable
        difficulty.
      zh: 在自动化、AI/ML、DevOps领域涵盖类似主题，难度相当。
  - slug: jules-autocoding
    score: 0.94
    reason:
      ko: '자동화, AI/ML, DevOps 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、DevOps分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, DevOps with comparable
        difficulty.
      zh: 在自动化、AI/ML、DevOps领域涵盖类似主题，难度相当。
---

On March 20th, Claude Code v2.1.80 added a new flag: `--channels`. Turns out it lets you send a message from Telegram or Discord, and Claude running in your local terminal picks it up, executes code, and sends the results back to your messenger.

My first reaction was honestly "Isn't this just what OpenClaw does?" And yes — conceptually, it's almost identical. But after actually setting it up and using it, the approach is quite different.

---

## What Are Channels, Exactly?

In simple terms, it's a **two-way bridge** between an external messaging platform and a Claude Code session.

```
Send "Check the build logs" on Telegram →
  → Claude Code session receives the message →
  → Reads the logs from the local filesystem →
  → Sends the analysis back to Telegram
```

The key here is **local execution**. This isn't running in some cloud sandbox — it runs on my MacBook. Full access to git, the filesystem, MCP servers, everything. So when you send "The CI failed, find out why" on Telegram, it can actually read the logs and even fix the code.

Setup is dead simple:

```bash
claude --channels plugin:telegram@claude-plugins-official
```

One flag and you're done. Set up a Telegram bot token, authenticate with a pairing code, and you're good to go.

---

## What They Borrowed from OpenClaw, and What They Changed

I've been using [OpenClaw's advanced features](/en/blog/en/openclaw-advanced-usage) for quite a while now. I've written about cron integrations, multi-channel setups, and more on this blog. So naturally, I look at Claude Code Channels through a different lens.

**Core concepts borrowed:**
- Message injection from messaging platforms → AI agent
- Channel adapter pattern (normalizing messages per platform)
- Two-way communication (request → process → reply)

**What Claude changed:**

First, **the MCP server-based architecture**. OpenClaw uses its own adapter framework, but Claude Code built channels on top of the existing MCP standard. An MCP server that declares the `claude/channel` capability flag becomes a channel plugin. Reusing the existing MCP infrastructure was a smart call — there's no new protocol to learn.

Second, **the security model is completely different**. This is the biggest distinction.

OpenClaw is webhook-based, which sometimes means opening inbound ports. Claude Code Channels uses **outbound polling only**. Connections only go from your machine to the outside — no inbound ports are ever opened. On top of that, there's allowlist-based sender authentication, so only registered users can send messages.

For someone like me who runs agents on a Mac mini at home, this difference is tangible. With OpenClaw, I had to set up external access through ngrok or Cloudflare Tunnel. That entire step is just gone now.

Third, **session-scoped operation**. OpenClaw runs as an independent daemon that's always up, but Claude Code Channels only works while a session is open. This is both an advantage and a disadvantage — more on that below.

---

## Limitations I Hit During the Beta

It's labeled "research preview" for a reason, and there are real friction points in daily use.

**Only 2 platforms are supported.** Telegram and Discord. The biggest gap is no Slack. If you want to use this for work, Slack integration is practically a must, and right now there's no way to do it. Compared to OpenClaw supporting 50+ platforms, it's pretty bare. Since it's MCP-based, you can build custom channels, but during the beta you need the `--dangerously-load-development-channels` flag — not exactly production-ready.

**When the session closes, it's over.** This is the most frustrating part. If you send a message on Telegram while the Claude Code session is down, that message is lost. There's no queuing. You can work around it by running a background process with launchd or systemd, but the fact that "always-on" isn't the default and requires manual setup is inconvenient.

**Permission prompts freeze the session.** Claude Code asks for user approval on risky operations (file deletion, git push, etc.). The problem is when you trigger work remotely from Telegram, but the permission prompt pops up and you have to approve it at the local terminal. You can bypass it with `--dangerously-skip-permissions`, but there's a reason "dangerously" is in the name.

**Personal Max plan bug.** Some users have reported that the `--channels` flag is being silently ignored. Apparently it's a bug where an auto-generated orgId gets misidentified as an Enterprise account. It doesn't seem to be patched yet.

---

## So What Can You Actually Do with It?

I currently run an [automated posting pipeline](/en/blog/en/effiflow-automation-analysis-part3) for this blog using Claude Code + launchd cron jobs. Hooking up Channels opens up a few interesting scenarios.

**1. CI/CD alerts → immediate debugging**

When a GitHub Actions build fails, a webhook sends an alert to Telegram. Right now I see the notification and manually open a terminal to investigate. With Channels, I can just send "Check the build log and analyze the cause" right from Telegram. Claude reads the log, finds the relevant code, and suggests a fix.

**2. Lightweight coding requests from mobile**

While I'm out, I can send "Run the blog post build" or "Revert yesterday's commit" via Telegram. No need to open a laptop.

**3. Automated response to monitoring events**

When a cron job fails, forward the error log to a channel and have Claude automatically analyze the cause and report back on Telegram. I had a similar setup with OpenClaw, but the difference is that Claude Code has direct filesystem access — it can read logs without any intermediate API calls.

---

## OpenClaw vs Claude Code Channels — An Honest Decision Framework

Having used both, this isn't a "which one is better" question.

**Stick with OpenClaw when:**
- You need platforms beyond Telegram/Discord (Slack, WhatsApp, etc.)
- You use other LLMs alongside Claude (GPT, Gemini, etc.)
- You want to run it for free (Claude Code requires a subscription)
- You already have pipelines built on OpenClaw

**Claude Code Channels is better when:**
- Direct local filesystem access is essential
- Security matters and you don't want to open inbound ports
- You're already using Claude Code as your primary tool
- You want minimal setup time (one flag and done)

Personally, I plan to use both. I'll keep my existing OpenClaw pipeline for cron-based automation and switch to Claude Code Channels for conversational coding requests via Telegram. That's the pragmatic approach. If you're considering a full transition to Claude Code CLI, the [Claude Code CLI migration guide](/en/blog/en/claude-code-cli-migration-guide) is worth reading first.

---

## What to Watch Going Forward

Once Channels graduates from beta, the custom channel plugin ecosystem becomes the key factor. Since it's built on MCP servers, anyone can create a channel — the question is how open Anthropic will be about it. Right now only official plugins are allowed, and custom ones require the `dangerously-` flag.

The moment a Slack channel plugin drops will be the real inflection point for adoption. Telegram is fine for individual developers, but Slack is a must for team-level usage.

Improving the permission model is also crucial. Having to approve operations at the local terminal when you're triggering work remotely is a UX bottleneck. Something like Telegram inline buttons for approve/deny seems feasible, but balancing security and convenience won't be easy.

---

## References

- [Claude Code Channels Official Docs](https://code.claude.com/docs/en/channels)
- [VentureBeat: Anthropic just shipped an OpenClaw killer called Claude Code Channels](https://venturebeat.com/orchestration/anthropic-just-shipped-an-openclaw-killer-called-claude-code-channels)
- [The Decoder: Anthropic turns Claude Code into an always-on AI agent](https://the-decoder.com/anthropic-turns-claude-code-into-an-always-on-ai-agent-with-new-channels-feature/)
- [OpenClaw Official Docs — Channels](https://docs.openclaw.ai/cli/channels)
