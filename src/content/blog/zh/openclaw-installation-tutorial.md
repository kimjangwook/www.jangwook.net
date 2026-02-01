---
title: '从安装 OpenClaw 到首次对话 — 完整教程'
description: '手把手教你安装 OpenClaw、连接 Telegram、完成首次 AI 对话。涵盖 Node.js 配置到工作区结构的全流程。'
pubDate: '2026-02-04'
heroImage: ../../../assets/blog/openclaw-installation-tutorial-hero.png
tags:
  - openclaw
  - tutorial
  - telegram
  - installation
relatedPosts: []
---

> **系列：OpenClaw 完全攻略** (2/3)
> 1. [介绍篇](/zh/blog/zh/openclaw-introduction-guide/)
> 2. **教程篇** ← 当前文章
> 3. [实战篇](/zh/blog/zh/openclaw-advanced-usage/)

上一篇文章中，我们了解了 OpenClaw 是什么。这次，我们将**从安装到完成第一次对话**，一步到位。打开终端，跟我来吧！🚀

---

## 1. 前期准备

OpenClaw 运行在 Node.js 运行时之上。

| 项目 | 要求 |
|------|------|
| **Node.js** | v22 或更高（用 `node -v` 确认） |
| **操作系统** | Windows · macOS · Linux 全部支持 |

- **macOS / Linux** — 无需额外准备，可以直接开始。
- **Windows** — 原生环境即可运行。也支持 WSL2，但不是必需的。

如果还没有 Node.js，请从[官方网站](https://nodejs.org/)下载 LTS 版本（22+），或使用版本管理器：

```bash
# Volta（推荐 — 项目级版本管理）
curl https://get.volta.sh | bash
volta install node@22

# nvm
nvm install 22
nvm use 22

# fnm
fnm install 22
fnm use 22
```

### 可选项（但强烈推荐！）

- **Brave Search API 密钥** — 使用网络搜索功能时需要。在 [Brave Search API](https://brave.com/search/api/) 免费获取
- **AI 模型 API 密钥** — Anthropic、OpenAI、Google 中至少一个。通过 `ANTHROPIC_API_KEY` 或 `OPENAI_API_KEY` 环境变量设置
- **Git** — 源码构建时需要

---

## 2. 安装 — 3种方式

选择最适合你的方式。

### 方式一：npm 全局安装（最推荐）⭐

```bash
npm install -g openclaw@latest
# 或
pnpm add -g openclaw@latest
```

确认安装：
```bash
openclaw --version
```

### 方式二：一键脚本（快速简便）

```bash
# macOS / Linux
curl -fsSL https://openclaw.ai/install.sh | bash
```

```powershell
# Windows (PowerShell)
iwr -useb https://openclaw.ai/install.ps1 | iex
```

脚本会从依赖检查到 PATH 注册全部搞定。

### 方式三：源码构建（给想贡献代码的开发者）

```bash
git clone https://github.com/openclaw/openclaw.git
cd openclaw
pnpm install
pnpm ui:build    # 首次运行时自动安装 UI 依赖
pnpm build
openclaw onboard --install-daemon
```

> **小贴士：** 如果你考虑贡献代码或想提前体验最新功能，推荐源码构建。在 npm 和源码构建之间切换也很简单 — `openclaw doctor` 会自动更新 Gateway 服务入口。

---

## 3. 引导向导 — 一次完成核心配置

安装后首次运行时，引导向导会带你完成核心配置。

```bash
openclaw onboard --install-daemon
```

按照交互式提示逐步配置以下项目：

| 配置项 | 说明 |
|---|---|
| **Gateway** | AI 代理常驻的常驻守护进程 |
| **认证** | AI 模型 API 密钥（Anthropic、OpenAI 等） |
| **频道** | Telegram、Discord 等消息平台 |
| **工作区** | 代理的文件工作空间路径 |
| **Gateway 令牌** | 向导默认生成（即使是 loopback） |

添加 `--install-daemon` 参数后，Gateway 将注册为操作系统服务：
- **macOS**：launchd
- **Linux**：systemd 用户服务
- **Windows**：Windows 服务

重启后也会自动运行，完全不用担心。

### 不用向导手动配置

你也可以直接编辑 `~/.openclaw/openclaw.json`：

```json5
{
  // AI 模型设置
  "agents": {
    "defaults": {
      "workspace": "~/.openclaw/workspace",
      "models": {
        "default": "anthropic/claude-sonnet-4-20250514"
      }
    }
  },
  
  // 频道设置
  "channels": {
    "telegram": {
      "botToken": "<BotFather 令牌>",
      "dmPolicy": "pairing"
    }
  },
  
  // 自动化设置
  "cron": { "enabled": true },
  "hooks": {
    "enabled": true,
    "token": "<Webhook密钥>"
  }
}
```

---

## 4. Telegram 机器人集成 — 最简单的频道

在所有频道中，**Telegram** 的入门门槛最低。让我们从这里开始。

### 4-1. 创建机器人

1. 在 Telegram 中向 [@BotFather](https://t.me/BotFather) 发送 `/newbot` 命令。
2. 设定机器人名称和 username，获得 **API 令牌**。
3. 复制并保存这个令牌。

### 4-2. 在配置文件中注册令牌

如果引导向导中已经注册过，可以跳过。手动配置：

```json5
{
  "channels": {
    "telegram": {
      "botToken": "7123456789:AAHx...",
      "dmPolicy": "pairing"
    }
  }
}
```

**`dmPolicy` 选项说明：**

| 策略 | 行为 |
|---|---|
| `pairing` | 需要配对审批（安全起见**强烈推荐** ⭐） |
| `open` | 任何人都可以私信（仅供测试） |
| `deny` | 屏蔽私信 |

### 4-3. 配对审批

首次向机器人发送私信时，会产生**配对请求**。在终端中审批：

```bash
# 查看待处理的配对列表
openclaw pairing list

# 批准配对
openclaw pairing approve <请求ID>
```

也可以在仪表板（`http://127.0.0.1:18789/`）中可视化审批。

### 4-4. 在 Telegram 群组中使用

将机器人邀请到群组后，以**@提及**方式工作：

```json5
{
  "channels": {
    "telegram": {
      "botToken": "7123456789:AAHx...",
      "groups": {
        "*": { "requireMention": true }
      }
    }
  }
}
```

- `@机器人名 这段代码哪里有问题？` → AI 回复
- 普通聊天 → AI 静静观察

### 4-5. Telegram 高级设置

```json5
{
  "channels": {
    "telegram": {
      "botToken": "7123456789:AAHx...",
      "dmPolicy": "pairing",
      "streaming": {
        "enabled": true,          // 实时响应流式传输
        "draftMode": true         // 显示正在输入
      },
      "reactions": {
        "mode": "minimal"         // 最小化表情反应
      },
      "topics": true              // 论坛话题支持
    }
  }
}
```

---

## 5. 运行和验证 Gateway

如果在引导过程中已安装守护进程，可能已经在运行了。

### 服务管理

```bash
# 查看状态
openclaw gateway status

# 启动/停止/重启
openclaw gateway start
openclaw gateway stop
openclaw gateway restart
```

### 手动运行（调试用）

```bash
openclaw gateway --port 18789 --verbose
```

`--verbose` 参数会实时输出请求和响应日志。

### 远程访问（Tailscale）

想在外面也能访问 Gateway：

```bash
openclaw gateway --bind tailnet --token <令牌>
```

非本地绑定时，令牌是**必需**的。

### 状态检查

```bash
# 完整状态
openclaw status

# 环境诊断
openclaw doctor

# 健康检查
openclaw health
```

在浏览器中访问 **http://127.0.0.1:18789/**，可以通过仪表板可视化查看运行状态、频道连接、最近对话等信息。

---

## 6. 首次对话测试 🎉

一切准备就绪。让我们实际聊聊吧。

### 在 Telegram 中直接对话

用已完成配对的账号向机器人发送任意消息。如果 AI 代理回复了，恭喜你成功了！🎊

### 通过 CLI 测试

```bash
# 向特定 Telegram 聊天发送消息
openclaw message send --target telegram:<聊天ID> --message "你好，OpenClaw！"

# 也可以在仪表板测试
# 在 http://127.0.0.1:18789/ 使用 WebChat
```

### 斜杠命令

可以在 Telegram 聊天中直接使用的内置命令：

| 命令 | 说明 |
|---|---|
| `/status` | 查看 Gateway 状态 |
| `/model <模型>` | 切换 AI 模型 |
| `/thinking <level>` | 调整思考等级（off/low/medium/high） |
| `/stop` | 停止当前运行的任务 |
| `/subagents list` | 查看子代理列表 |
| `/activation always\|mention` | 更改群组中的响应方式 |

---

## 7. 工作区配置 — 构建代理的大脑

确认一切正常后，现在来把它定制成**专属于你的代理**。

### 工作区文件结构

```
~/.openclaw/workspace/
├── AGENTS.md        # 代理的行为规则和工作流程
├── SOUL.md          # 人设、性格、说话风格定义
├── USER.md          # 关于用户（你）的信息
├── MEMORY.md        # 长期记忆 — 跨会话持久化内容
├── HEARTBEAT.md     # 心跳时自动检查的项目
├── TOOLS.md         # 工具相关的本地笔记（摄像头名称、SSH信息等）
├── memory/          # 每日记忆日志
│   ├── 2025-07-12.md
│   └── 2025-07-13.md
└── skills/          # 自定义技能文件夹
    └── my-skill/
        └── SKILL.md
```

### SOUL.md — 定义代理的人格

在这个文件中定义代理的性格：

```markdown
# SOUL.md

## 性格
- 友好但专业的语调
- 用中文交流（技术术语保留英文）
- 适度使用表情 😊
- 有幽默感，但避免啰嗦

## 名称
我是"小爪" — 基于 OpenClaw 的个人 AI 助手

## 原则
- 只提供准确信息，不确定就坦诚说
- 代码始终以完整可运行的形式提供
- 严格保护个人信息
```

### USER.md — 用户信息

```markdown
# USER.md

## 基本信息
- 姓名: 张三
- 职业: 软件工程师
- 兴趣: AI、自动化、开发效率
- 时区: Asia/Shanghai (UTC+8)

## 偏好
- 回答要简洁
- 代码优先使用 TypeScript
- 日程管理使用 Google Calendar
```

### HEARTBEAT.md — 自动检查清单

定义代理定期自动检查的项目：

```markdown
# HEARTBEAT.md

## 定期检查（每次心跳）
- [ ] 有紧急未读邮件就通知
- [ ] 2小时内有日历事件就提前提醒
- [ ] 天气预报有雨就提醒带伞
- [ ] GitHub仓库有新Issue/PR就汇总

## 夜间（23:00-08:00）
- 只通知紧急事项，其余 HEARTBEAT_OK
```

### 切换模型

```bash
# 通过 CLI 更改默认模型
openclaw config set agents.defaults.models.default "anthropic/claude-opus-4-20250514"

# 或在 Telegram 中使用斜杠命令
/model opus
/model sonnet
/model gpt-4o
```

---

## 8. 安装 Skills

从 ClawHub 安装社区技能：

![ClawHub — 搜索和安装技能。浏览 Trello、Calendar、Slack 等热门技能](../../../assets/blog/clawhub-main.png)

```bash
# 安装 CalDAV 日历集成技能
npx clawhub@latest install caldav-calendar

# Trello 看板管理技能
npx clawhub@latest install trello

# 查看已安装的技能列表
ls ~/.openclaw/workspace/skills/
```

安装的技能会被自动识别。无需重启 Gateway，支持**热重载**。

---

## 9. 故障排除 — 问题解决指南

### 自动诊断

```bash
# 自动诊断整个环境
openclaw doctor

# 详细输出所有组件状态
openclaw status --all
```

`openclaw doctor` 会一次性检查 Node.js 版本、配置文件有效性、频道连接、API 密钥状态等。

### 常见问题及解决方法

| 症状 | 原因 | 解决方案 |
|---|---|---|
| Gateway 无法启动 | 端口冲突 | `netstat -ano \| findstr 18789`（Windows）/ `lsof -i :18789`（macOS/Linux） |
| Telegram 机器人无响应 | 令牌错误或配对未完成 | 用 `openclaw doctor` 检查，用 `openclaw pairing list` 确认审批状态 |
| API 密钥错误 | 密钥过期或余额不足 | 用 `openclaw doctor` 检查密钥状态，在模型提供商仪表板确认 |
| "Node version" 错误 | Node.js 低于 v22 | `node -v` 确认后升级 |
| 技能未被识别 | 热重载延迟 | 保存 `SKILL.md` 后稍等片刻，或重启 Gateway |

### 查看日志

```bash
# 实时查看 Gateway 日志（macOS/Linux）
tail -f ~/.openclaw/logs/gateway.log

# Windows PowerShell
Get-Content ~/.openclaw/logs/gateway.log -Wait -Tail 50
```

---

## 10. 下一步 — 更深入的探索

安装和首次对话已经完成！🎉

基础配置搞定后，现在来玩点真正有趣的：

### 马上可以尝试的事情

1. **编辑 SOUL.md** — 给代理赋予独特的人设
2. **创建 HEARTBEAT.md** — 设置自动检查清单
3. **在 ClawHub 探索技能** — [clawhub.com](https://clawhub.com)
4. **注册一个定时任务** — 每天早晨简报

### 第三篇将涵盖的内容

**[第三篇（实战篇）](/zh/blog/zh/openclaw-advanced-usage/)**将介绍如何将 OpenClaw 作为**强大的自动化工具**运用到实际场景中：

- n8n/Make 集成 Webhook 工作流
- MCP 服务器集成
- 用 Cron 自动化日报（含 config JSON）
- 构建多代理系统
- 浏览器自动化数据采集
- Node 系统安防摄像头监控
- 自定义技能开发完整指南

> 🦞 尽情把玩你安装好的 OpenClaw，我们很快就回来！🐾

---

*有问题或反馈，欢迎到 [GitHub Issues](https://github.com/openclaw/openclaw/issues) 或 [Discord](https://discord.gg/clawd) 交流。*
