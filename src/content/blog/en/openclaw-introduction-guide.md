---
title: The Complete Guide to OpenClaw — Build Your Own AI Assistant
description: >-
  Discover OpenClaw, the open-source AI assistant platform. Multi-channel,
  multi-model, node system, and more — your complete guide to self-hosted AI.
pubDate: '2026-02-03'
heroImage: ../../../assets/blog/openclaw-introduction-guide-hero.png
tags:
  - openclaw
  - ai-assistant
  - open-source
  - automation
relatedPosts:
  - slug: 45-day-analytics-report-2025-11
    score: 0.95
    reason:
      ko: 자동화 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.
      ja: 自動化分野で類似したトピックを扱い、同程度の難易度です。
      en: Covers similar topics in automation with comparable difficulty.
      zh: 在自动化领域涵盖类似主题，难度相当。
  - slug: dena-llm-study-part1-fundamentals
    score: 0.95
    reason:
      ko: 자동화 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.
      ja: 自動化分野で類似したトピックを扱い、同程度の難易度です。
      en: Covers similar topics in automation with comparable difficulty.
      zh: 在自动化领域涵盖类似主题，难度相当。
  - slug: dena-llm-study-part4-rag
    score: 0.95
    reason:
      ko: 자동화 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.
      ja: 自動化分野で類似したトピックを扱い、同程度の難易度です。
      en: Covers similar topics in automation with comparable difficulty.
      zh: 在自动化领域涵盖类似主题，难度相当。
  - slug: figma-mcp-web-components-sync
    score: 0.95
    reason:
      ko: 자동화 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.
      ja: 自動化分野で類似したトピックを扱い、同程度の難易度です。
      en: Covers similar topics in automation with comparable difficulty.
      zh: 在自动化领域涵盖类似主题，难度相当。
  - slug: gcloud-mcp-infrastructure-audit
    score: 0.95
    reason:
      ko: 자동화 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.
      ja: 自動化分野で類似したトピックを扱い、同程度の難易度です。
      en: Covers similar topics in automation with comparable difficulty.
      zh: 在自动化领域涵盖类似主题，难度相当。
---

> 📚 <strong>Series: Mastering OpenClaw</strong>
> - <strong>Part 1: Introduction (this post)</strong> — What is OpenClaw and why is it special?
> - [Part 2: Tutorial](/en/blog/en/openclaw-installation-tutorial/) — From installation to your first conversation
> - [Part 3: Practical Usage](/en/blog/en/openclaw-practical-usage/) — Skills, automation, and advanced workflows

---

## 🤖 The Age of AI Assistants — Why OpenClaw?

ChatGPT, Claude, Gemini… Chances are you've already used at least one AI chatbot. But have you ever thought:

> "Can I use this AI directly in <strong>my Telegram</strong>?"  
> "What if AI could control <strong>my phone's camera</strong>?"  
> "I'm not comfortable with my data sitting on someone else's server…"  
> "Can I freely switch between multiple AI models?"

There's a project built precisely to solve these problems. Meet <strong>OpenClaw</strong> 🦞.

Today, I'll walk you through what OpenClaw is, what makes it special, and who it's the perfect fit for!

---

## 🦞 What is OpenClaw?

<strong>OpenClaw</strong> is an open-source <strong>personal AI assistant platform</strong>.

In simple terms, it's a system that lets you <strong>attach your own AI assistant to the messengers you already use</strong> — Telegram, WhatsApp, Discord, and more. You pick and connect AI models yourself, add various tools and skills, and build your own workflows.

| Item | Details |
|---|---|
| <strong>License</strong> | MIT (completely free to use) |
| <strong>GitHub</strong> | [github.com/openclaw/openclaw](https://github.com/openclaw/openclaw) |
| <strong>Official Docs</strong> | [docs.openclaw.ai](https://docs.openclaw.ai) |
| <strong>Creators</strong> | Peter Steinberger ([@steipete](https://twitter.com/steipete)), Mario Zechner (Pi creator) |
| <strong>Skill Marketplace</strong> | [ClawHub](https://clawhub.com) |
| <strong>Community</strong> | Discord — [discord.gg/clawd](https://discord.gg/clawd) |

Since it's MIT-licensed, individuals and companies alike can freely use and modify it. The community is actively growing, so if you have questions, hop into the Discord! 💬

### Exploring the GitHub Repository

Below is the main page of OpenClaw's GitHub repository. The README provides an overview of the project structure and a quick-start guide.

![OpenClaw GitHub repository — README and project structure at a glance](../../../assets/blog/github-readme.png)

---

## ✨ Key Features

### 📱 Multi-Channel — Chat with AI from Anywhere

One of OpenClaw's biggest draws is its <strong>channel diversity</strong>.

- <strong>WhatsApp</strong> — WhatsApp Web protocol integration via Baileys
- <strong>Telegram</strong> — grammY-based Bot API (DM + groups)
- <strong>Discord</strong> — discord.js-based Bot API (DM + server channels)
- <strong>iMessage</strong> — macOS imsg CLI integration
- <strong>Mattermost</strong> — Bot integration via plugin
- <strong>Slack, Signal, MS Teams</strong> — Additional plugins
- <strong>WebChat</strong> — Local chat UI accessible directly from your browser

No need to install separate apps — you can use your AI assistant <strong>right from the messengers you already use</strong>. Just message the AI like you'd message a friend on Telegram.

### 💻 Multi-Platform

- <strong>macOS</strong> — Native app + menubar companion
- <strong>iOS</strong> — Node app with pairing + Canvas surface
- <strong>Android</strong> — Node app with Canvas + Chat + Camera
- <strong>Windows</strong> — Native support (WSL2 compatible too)
- <strong>Linux</strong> — Native + server deployment

Virtually all major platforms are supported.

### 🏗️ Gateway Architecture

The heart of OpenClaw is the <strong>Gateway</strong>. It operates as a single control plane, connecting all channels and tools through `ws://127.0.0.1:18789`.

The Gateway's core responsibilities:
- <strong>Channel connection management</strong> — Owns WebSocket connections for all messenger channels
- <strong>Agent bridge</strong> — RPC communication with the Pi coding agent
- <strong>Tool routing</strong> — Relays tool calls for browser, file system, cron, and more
- <strong>Session management</strong> — DMs route to a shared `main` session; groups get isolated sessions
- <strong>Canvas host</strong> — Serves node WebView UIs at `http://<gateway>:18793`
- <strong>Dashboard</strong> — Browser-based Control UI at `http://127.0.0.1:18789/` for configuration

### 🧠 Multi-Model AI Support

- <strong>Anthropic Claude</strong> (Opus, Sonnet, Haiku)
- <strong>OpenAI</strong> (GPT-4o, GPT-5, o1, etc.)
- <strong>Google Gemini</strong>
- <strong>Amazon Bedrock</strong> for model access
- <strong>Subscription Auth</strong> — Claude Pro/Max, ChatGPT/Codex OAuth integration

You're not locked into a single model. Switch freely based on your needs — assign cheaper models for cron jobs and high-performance models for critical analyses. <strong>Model routing</strong> makes this effortless.

### 🔧 Powerful Tool Set

OpenClaw's built-in tools aren't just plugins — they're <strong>the means through which the agent actually interacts with the world</strong>.

| Tool | Description |
|---|---|
| 🌐 `browser` | AI directly browses and manipulates web pages (incl. Chrome extension relay) |
| 🎨 `canvas` | Agent-controlled visual workspace — renders UI on node WebViews |
| ⏰ `cron` | Built-in Gateway scheduler for one-off reminders to recurring tasks |
| 🔗 `webhooks` | Real-time integration with external services (GitHub, Gmail, etc.) |
| 🧠 `memory_search` | Natural-language search over past conversations and stored info |
| 💬 `message` | Send, edit, and react to messages across channels |
| 📱 `nodes` | Remote control of iOS/Android/macOS devices |
| 🖥️ `exec` | Shell command execution (PTY support, security approval system) |
| 📝 `read`/`write`/`edit` | Direct file system manipulation |
| 🔍 `web_search`/`web_fetch` | Web search and page content extraction |
| 🎤 `tts` | Text-to-speech conversion |

### 🛒 Skills System & ClawHub

OpenClaw features a skills system compatible with the <strong>AgentSkills format</strong>, letting you install skills created by others from the <strong>ClawHub marketplace</strong> or share your own.

![ClawHub — OpenClaw skill marketplace. Skills for Trello, Slack, Calendar and more are available](../../../assets/blog/clawhub-main.png)

Skills are loaded from three locations (in priority order):
1. <strong>Workspace skills</strong> (`<workspace>/skills/`) — Highest priority
2. <strong>Managed skills</strong> (`~/.openclaw/skills/`) — Shared across all agents
3. <strong>Bundled skills</strong> — Default skills included in the OpenClaw package

Installing a skill takes just one line:
```bash
npx clawhub@latest install <skill-name>
```

### 📲 Node System

Connect iOS, Android, and macOS devices as <strong>nodes</strong> to let AI interact with the physical world:

| Feature | Description |
|---|---|
| 📷 Camera snap | Capture from front/rear cameras |
| 🎬 Camera clip | Record short video clips |
| 🖥️ Screen recording | Capture the current screen |
| 🔔 Push notifications | Send system/overlay/auto notifications |
| 📍 Location | GPS location query (coarse/balanced/precise) |
| 📱 SMS | Send SMS from Android nodes |
| ⌨️ Command execution | Run shell commands on the node host (Exec approval required) |

Nodes connect via Gateway WebSocket and must go through <strong>pairing approval</strong> before activation. Your phone becomes the AI's eyes and ears!

### 🤖 Multi-Agent System

OpenClaw can run <strong>multiple agents simultaneously</strong> from a single Gateway.

- <strong>Per-agent workspaces</strong> — Each agent gets its own isolated workspace
- <strong>Per-agent sandboxes</strong> — Docker-based isolated execution environments
- <strong>Per-agent tool restrictions</strong> — Block `exec` for certain agents while allowing only `read`
- <strong>Binding rules</strong> — WhatsApp Group A → work agent, Telegram DM → personal agent
- <strong>Sub-agents</strong> — Main agent delegates background tasks to sub-agents

### 🎙️ Voice Wake + Talk Mode

Chat with AI <strong>using just your voice</strong> — no keyboard needed. Trigger it with the macOS app's wake word feature, then continue with natural conversation in Talk Mode.

---

## 🏛️ Architecture at a Glance

```mermaid
graph TD
    User["👤 User<br/>WhatsApp · Telegram · Discord<br/>iMessage · WebChat · Slack"]
    Gateway["🦞 OpenClaw Gateway<br/>ws://127.0.0.1:18789<br/>WebSocket Control Plane"]
    AI["🧠 AI Models<br/>Claude · GPT-4o/5<br/>Gemini · Bedrock"]
    Tools["🔧 Tool Set<br/>browser · canvas · cron<br/>webhooks · memory · exec"]
    Nodes["📱 Node System<br/>iOS · Android · macOS · Linux<br/>Camera · Location · Notifications · Exec"]

    User -->|"Messages"| Gateway
    Gateway --> AI
    Gateway --> Tools
    Tools --> Nodes
```

Core principles:
- <strong>Loopback-first</strong>: Gateway WS binds to localhost by default
- <strong>One Gateway, one host</strong>: Prevents WhatsApp Web session ownership conflicts
- <strong>Token-based auth</strong>: Token required for non-local bindings
- <strong>Tailscale/VPN</strong>: SSH tunnel or Tailnet recommended for remote access

---

## 🆚 How Is It Different from Other AI Assistants?

| Comparison | ChatGPT / Claude Apps | <strong>OpenClaw</strong> |
|---|---|---|
| Hosting | Cloud (third-party servers) | <strong>Self-hosted</strong> (your own computer) |
| Data Privacy | Stored on their servers | <strong>Stored locally only</strong> 🔒 |
| Channels | Dedicated app/web only | <strong>Telegram, Discord, and other existing messengers</strong> |
| AI Models | That company's models only | <strong>Claude, GPT, Gemini — free choice</strong> |
| Extensibility | Limited (plugin store) | <strong>Skills, webhooks, cron, MCP, custom tools</strong> |
| Device Control | ❌ Not possible | ✅ <strong>Camera, screen, location, command execution</strong> |
| Automation | ❌ Not possible | ✅ <strong>Cron, heartbeats, webhooks</strong> |
| Multi-Agent | ❌ Not possible | ✅ <strong>Per-agent routing, sandboxes</strong> |
| Open Source | ❌ | ✅ <strong>MIT License</strong> |

The core difference in one line:

> <strong>"Not borrowing someone else's service — an AI assistant running on your infrastructure, by your rules."</strong>

---

## 🎯 Who Is OpenClaw For?

- 🔐 <strong>Privacy-conscious users</strong> — All data stays on your computer
- 🛠️ <strong>Automation-loving developers</strong> — Infinite extensibility with cron, webhooks, skills, and MCP
- 📱 <strong>Multi-messenger users</strong> — Same AI assistant whether you're on Telegram or Discord
- 🤓 <strong>Hands-on AI enthusiasts</strong> — It's open source, so you can understand it at the code level
- 🏠 <strong>Home automation fans</strong> — IoT-like capabilities through the Node system
- 👨‍💼 <strong>Team leads looking to adopt AI</strong> — Role-based AI operations via multi-agent
- 🔧 <strong>Those wanting AI in existing workflows</strong> — Easy integration with webhooks, n8n, Make, etc.

On the flip side, if you're satisfied with "occasionally asking questions on ChatGPT's web interface," you probably don't need OpenClaw. OpenClaw is built for <strong>people who want to deeply integrate AI into their lives</strong>.

---

## 🌍 Project Ecosystem

OpenClaw isn't a standalone project — it's an <strong>ecosystem</strong> composed of multiple components:

| Component | Role |
|---|---|
| <strong>OpenClaw Gateway</strong> | Core runtime — channel, tool, and agent management |
| <strong>Pi</strong> | Coding agent engine — communicates with Gateway via RPC mode |
| <strong>ClawHub</strong> | Skill registry — search, install, update, and share |
| <strong>OpenClaw.app</strong> | macOS desktop app — menubar + Voice Wake |
| <strong>OpenClaw iOS</strong> | iPhone/iPad node app — Canvas + Camera |
| <strong>OpenClaw Android</strong> | Android node app — Canvas + Chat + Camera |
| <strong>Official Docs</strong> | docs.openclaw.ai — comprehensive guide |

---

## 📢 Coming Up Next

In this post, we explored what OpenClaw is and what makes it special.

In <strong>[Part 2: Tutorial](/en/blog/en/openclaw-installation-tutorial/)</strong>, we'll walk through <strong>installing and configuring OpenClaw</strong> step by step!

- Installing Node.js & Gateway onboarding
- Connecting and pairing a Telegram channel
- Starting your first AI conversation
- Understanding the workspace file structure

> 🦞 <strong>"Seeing is believing — running is knowing."</strong> — Let's fire it up in the next post!

---

*If you found this post helpful, please share it! Questions are welcome in the [Discord community](https://discord.gg/clawd).* 🙌
