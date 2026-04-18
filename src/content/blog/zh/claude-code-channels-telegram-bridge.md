---
title: 用 Claude Code Channels 从 Telegram 远程编程 — 一个 OpenClaw 用户的真实对比
description: >-
  Claude Code 新增了 Channels 功能。从 Telegram 发送消息，本地终端中的 Claude 就能执行代码并回复结果。它借鉴了
  OpenClaw 的 Channel 概念，但安全模型的设计完全不同，这一点很有意思。
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

3月20日，Claude Code v2.1.80 新增了一个 `--channels` 标志。简单来说，从 Telegram 或 Discord 发送消息后，在本地终端运行的 Claude 会接收消息、执行代码，然后把结果发回聊天工具。

坦白说，第一眼看到时我就想："这不就是 OpenClaw 一直在做的事吗？"没错，概念上确实几乎一样。但实际配置使用后发现，两者的实现方式差异相当大。

---

## 什么是 Channel？

简单来说，就是外部消息平台与 Claude Code 会话之间的**双向桥接**。

```
在 Telegram 中发送"帮我查看构建日志" →
  → Claude Code 会话接收消息 →
  → 从本地文件系统读取日志 →
  → 将分析结果回复到 Telegram
```

关键在于**本地执行**。不是在云端沙箱中运行，而是在我的 MacBook 上直接运行。git、文件系统、MCP Server 全部可以访问。所以当你在 Telegram 中发送"CI 挂了，帮我查原因"，它真的能读取日志、定位问题甚至修改代码。

启动也很简单：

```bash
claude --channels plugin:telegram@claude-plugins-official
```

加一个标志就行。配置好 Telegram Bot Token，通过配对码认证后即可使用。

---

## 从 OpenClaw 借鉴了什么，又改变了什么

我使用 [OpenClaw 的高级功能](/zh/blog/zh/openclaw-advanced-usage) 已经有相当长的时间了。Cron 集成、多 Channel 配置等内容在这个博客中也多次介绍过。所以我看 Claude Code Channels 的视角自然有些不同。

**借鉴的核心概念：**
- 消息平台 → AI Agent 的消息注入
- Channel Adapter 模式（按平台标准化消息格式）
- 双向通信（请求 → 处理 → 回复）

**Claude 独有的改变：**

第一，**基于 MCP Server 的架构**。OpenClaw 使用自有的 Adapter 框架，而 Claude Code 将 Channel 构建在已有生态的 MCP 标准之上。声明了 `claude/channel` capability 标志的 MCP Server 就是 Channel 插件。这相当于复用了现有的 MCP 基础设施，我认为这个决策相当明智——不需要学习新的协议。

第二，**安全模型完全不同**。这是最大的差异。

OpenClaw 基于 Webhook，有时需要开放入站端口。Claude Code Channels **仅使用出站轮询**。只有从本机向外发起的连接，不会开放入站端口。再加上基于 Allowlist 的发送者认证，只有注册用户才能发送消息。

对于像我这样在家里的 Mac Mini 上运行 Agent 的人来说，这个差异感受很明显。使用 OpenClaw 时需要通过 ngrok 或 Cloudflare Tunnel 开放外部访问，而现在这个步骤完全省去了。

第三，**基于会话运行**。OpenClaw 作为独立守护进程常驻后台，而 Claude Code Channels 只在会话打开时才工作。这既是优点也是缺点，后面会详细讨论。

---

## Beta 阶段遇到的限制

既然标注了"research preview"，实际使用中确实有一些问题。

**只支持2个平台。** Telegram 和 Discord。最大的遗憾是没有 Slack。要在工作中使用的话，Slack 集成几乎是必须的，但目前没有办法。相比 OpenClaw 支持50多个平台，差距很大。不过由于基于 MCP，可以自建 Channel，但在 Beta 期间需要使用 `--dangerously-load-development-channels` 标志，离生产级还有距离。

**会话关闭就结束了。** 这是最遗憾的部分。在 Telegram 中发送消息时，如果 Claude Code 会话已关闭，消息就会丢失。没有消息队列。虽然可以通过 launchd 或 systemd 启动后台进程来解决，但"always-on"不是默认的，需要自己配置，这一点不太方便。

**权限提示会阻塞会话。** Claude Code 在执行危险操作（删除文件、git push 等）时会请求用户确认。问题是从 Telegram 远程发起操作时，权限提示需要在本地终端手动确认。虽然可以用 `--dangerously-skip-permissions` 绕过，但名字里带"dangerously"是有原因的。

**Personal Max 计划的 Bug。** 部分用户反馈 `--channels` 标志被忽略的问题。据说是自动生成的 orgId 被错误识别为 Enterprise 账户的 Bug。目前似乎还未修复。

---

## 实际能做什么

我目前用 Claude Code + launchd Cron 运行这个博客的[自动发布流水线](/zh/blog/zh/effiflow-automation-analysis-part3)。接入 Channels 后，有几个很有趣的场景。

**1. CI/CD 告警 → 即时调试**

GitHub Actions 构建失败时通过 Webhook 向 Telegram 发送通知。目前收到通知后需要打开终端手动检查，有了 Channels 就可以直接在 Telegram 中发"帮我看构建日志分析原因"。Claude 会读取日志、查找相关代码，甚至提出修复方案。

**2. 移动端轻量编程请求**

外出时可以通过 Telegram 发送"跑一下博客构建"或"帮我 revert 昨天的 commit"。无需打开笔记本电脑。

**3. 基于监控事件的自动响应**

Cron 任务失败时将错误日志转发到 Channel，Claude 自动分析原因并通过 Telegram 报告。这个流程在 OpenClaw 中也做过类似的配置，区别在于 Claude Code 对文件系统的访问是直接的，无需中间 API 调用就能直接读取日志。

---

## OpenClaw vs Claude Code Channels，真实的选择标准

作为两个都用过的人，这不是"哪个更好"的问题。

**应该继续使用 OpenClaw 的情况：**
- 需要 Slack、WhatsApp 等 Telegram/Discord 以外的平台
- 同时使用 Claude 以外的 LLM（GPT、Gemini 等）
- 想免费使用（Claude Code 需要订阅）
- 已经基于 OpenClaw 构建了流水线

**Claude Code Channels 更优的情况：**
- 直接访问本地文件系统是核心需求
- 安全性重要且不想开放入站端口
- 已经将 Claude Code 作为主力工具
- 想把配置时间降到最低（一个标志搞定）

就个人而言，我打算两者并行。Cron 基础的自动化继续使用现有的 OpenClaw 流水线，Telegram 基础的交互式编程请求则切换到 Claude Code Channels，这是最现实的方案。如果你正在考虑全面迁移到 Claude Code CLI，[Claude Code CLI 迁移指南](/zh/blog/zh/claude-code-cli-migration-guide)也值得先读一读。

---

## 未来值得关注的方向

Channels 正式发布后，自定义 Channel 插件生态将成为关键。由于采用 MCP Server 架构，任何人都可以创建 Channel，关键在于 Anthropic 会开放到什么程度。目前只允许官方插件，自定义插件需要 `dangerously-` 标志。

Slack Channel 插件的推出时间将是实际大规模采用的拐点。个人开发者用 Telegram 就足够了，但团队协作离不开 Slack。

此外，权限模型的改进也很重要。远程发起操作却需要在本地终端确认，这是 UX 上的瓶颈。也许会出现通过 Telegram Inline Button 来处理批准/拒绝的方式，但安全性和便利性之间的平衡并不容易。

---

## 参考资料

- [Claude Code Channels 官方文档](https://code.claude.com/docs/en/channels)
- [VentureBeat: Anthropic just shipped an OpenClaw killer called Claude Code Channels](https://venturebeat.com/orchestration/anthropic-just-shipped-an-openclaw-killer-called-claude-code-channels)
- [The Decoder: Anthropic turns Claude Code into an always-on AI agent](https://the-decoder.com/anthropic-turns-claude-code-into-an-always-on-ai-agent-with-new-channels-feature/)
- [OpenClaw 官方文档 — Channels](https://docs.openclaw.ai/cli/channels)
