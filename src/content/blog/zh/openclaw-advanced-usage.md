---
title: 'OpenClaw 200% 活用术 — 8个实战高级用例'
description: 'Cron自动化、Webhook集成、MCP服务器、多代理系统、浏览器自动化等OpenClaw实战高级用法8种。'
pubDate: '2026-02-05'
heroImage: ../../../assets/blog/openclaw-advanced-usage-hero.png
tags:
  - openclaw
  - automation
  - mcp
  - multi-agent
relatedPosts: []
---

> **系列: 精通 OpenClaw** (3/3)
> 1. [介绍篇](/zh/blog/openclaw-introduction-guide/)
> 2. [教程篇](/zh/blog/openclaw-installation-tutorial/)
> 3. **高级用法篇** ← 当前文章

# OpenClaw 200% 活用术 — 实战高级用例合集 🚀

安装完成了吗？恭喜！🎉 现在才是真正有趣的部分。

OpenClaw 不仅仅是聊天机器人。它是在你的设备上活生生运行的**个人 AI 代理**。本文将逐一构建**实际生产级别的工作流**。每个示例都以可直接复制使用的完整形式提供。

---

## 目录

1. [基于 Cron 的每日报告自动化](#活用法-1基于-cron-的每日报告自动化-)
2. [通过 Webhook 集成 n8n/Make](#活用法-2通过-webhook-集成-n8nmake-)
3. [MCP 服务器集成](#活用法-3mcp-服务器集成-)
4. [构建多代理系统](#活用法-4构建多代理系统-)
5. [浏览器自动化数据采集](#活用法-5浏览器自动化数据采集-)
6. [通过 Node 系统实现安防摄像头监控](#活用法-6通过-node-系统实现安防摄像头监控-)
7. [自定义 Skill 开发完全指南](#活用法-7自定义-skill-开发完全指南-)
8. [工作区文件实战编写指南](#活用法-8工作区文件实战编写指南-)

---

## 活用法 1：基于 Cron 的每日报告自动化 📊

来打造一个每天早上一睁眼就把今天的日程、天气、新闻头条整理好发送给你的秘书吧。

![OpenClaw Cron 任务文档 — 计划、执行模式、投递设置等详细指南](../../../assets/blog/docs-cron.png)

### 完整配置示例

#### 第1步：在 openclaw.json 中启用 Cron

```json5
// ~/.openclaw/openclaw.json
{
  "cron": {
    "enabled": true,
    "store": "~/.openclaw/cron/jobs.json",
    "maxConcurrentRuns": 2
  }
}
```

#### 第2步：注册晨间简报 Cron

```bash
# 每天早上 8 点 (Asia/Tokyo) — 以隔离会话运行，投递至 Telegram
openclaw cron add \
  --name "晨间简报" \
  --cron "0 8 * * *" \
  --tz "Asia/Tokyo" \
  --session isolated \
  --message "请编写今日简报：
1. 今天日历日程摘要
2. 3封未读重要邮件
3. 今天首尔/东京天气
4. 3条科技新闻头条
5. GitHub 仓库新 Issue/PR 摘要
请用简洁的要点列表整理。" \
  --deliver \
  --channel telegram \
  --to "<我的_Telegram_聊天ID>"
```

#### 第3步：每日开发报告 Cron

```bash
# 工作日下午 6 点 — 自动生成开发日志
openclaw cron add \
  --name "每日开发报告" \
  --cron "0 18 * * 1-5" \
  --tz "Asia/Tokyo" \
  --session isolated \
  --message "请编写今天的开发报告：
1. 今天完成的工作（从 memory/ 查看）
2. 解决的 Issue
3. 明天待办事项建议
4. 学到的东西或洞察
请用 Markdown 整齐地整理，并保存到 memory/ 文件夹。" \
  --deliver \
  --channel telegram \
  --to "<我的_Telegram_聊天ID>"
```

#### 第4步：周报分析（使用高性能模型）

```bash
# 每周一早上 — 用 opus 模型进行深度分析
openclaw cron add \
  --name "周报分析" \
  --cron "0 9 * * 1" \
  --tz "Asia/Tokyo" \
  --session isolated \
  --message "请分析过去一周：
1. 从 memory/ 文件夹读取本周每日日志
2. 生产力模式分析（哪天最专注）
3. 常做的项目/技术整理
4. 下周建议
5. 在 MEMORY.md 中添加重要洞察
请进行深入分析。" \
  --model "opus" \
  --thinking high \
  --deliver \
  --channel telegram \
  --to "<我的_Telegram_聊天ID>"
```

#### Cron 管理命令

```bash
# 查看所有已注册的 Cron 任务
openclaw cron list

# 查看特定任务的执行历史
openclaw cron runs --id <jobId> --limit 10

# 修改任务
openclaw cron edit <jobId> --message "修改后的提示词"

# 手动执行（用于测试）
openclaw cron run <jobId> --force

# 删除任务
openclaw cron remove <jobId>
```

### HEARTBEAT.md 联动

将 Cron 与心跳结合，可以实现更灵活的自动化：

```markdown
# HEARTBEAT.md

## 常时检查
- [ ] 2小时内有日历日程则提前30分钟提醒
- [ ] 重要邮件 (from: boss@company.com) 立即提醒

## 工作时间 (09:00-18:00)
- [ ] GitHub PR 审查请求提醒
- [ ] Slack 未回复的 @提及 提醒

## 夜间 (23:00-08:00)
- 除紧急事项外 HEARTBEAT_OK
```

> **Cron vs 心跳选择标准：**
> - **精确时间**很重要 → Cron (`"0 8 * * *"`)
> - 想要**批量处理多项检查** → 心跳 (`HEARTBEAT.md`)
> - **一次性提醒** → Cron (`--at "20m"` + `--delete-after-run`)

---

## 活用法 2：通过 Webhook 集成 n8n/Make 🔗

将外部自动化工具与 OpenClaw 连接，可能性将无限扩展。

![OpenClaw Webhook 文档 — wake、agent、自定义映射等 Webhook 端点设置](../../../assets/blog/docs-webhook.png)

### 启用 Webhook

```json5
// ~/.openclaw/openclaw.json
{
  "hooks": {
    "enabled": true,
    "token": "my-super-secret-webhook-token-2025",
    "path": "/hooks"
  }
}
```

### 基本端点用法

#### /hooks/wake — 唤醒代理

```bash
# 通过系统事件唤醒代理
curl -X POST http://127.0.0.1:18789/hooks/wake \
  -H 'Authorization: Bearer my-super-secret-webhook-token-2025' \
  -H 'Content-Type: application/json' \
  -d '{"text": "服务器 CPU 使用率超过 90% 警报", "mode": "now"}'
```

#### /hooks/agent — 运行隔离代理

```bash
# 在独立会话中运行代理 + 结果投递至 Telegram
curl -X POST http://127.0.0.1:18789/hooks/agent \
  -H 'Authorization: Bearer my-super-secret-webhook-token-2025' \
  -H 'Content-Type: application/json' \
  -d '{
    "message": "服务器 CPU 使用率超过了 90%。请分析原因并提出应对方案。",
    "name": "服务器监控",
    "sessionKey": "hook:server-monitor:cpu-alert",
    "deliver": true,
    "channel": "telegram",
    "to": "<我的_Telegram_聊天ID>",
    "model": "anthropic/claude-sonnet-4-20250514",
    "timeoutSeconds": 120
  }'
```

### n8n 集成 — GitHub PR 自动审查

在 n8n 中调用 OpenClaw Webhook 的完整工作流：

#### n8n 工作流配置

```json
{
  "nodes": [
    {
      "name": "GitHub Webhook Trigger",
      "type": "n8n-nodes-base.githubTrigger",
      "parameters": {
        "owner": "myorg",
        "repository": "myrepo",
        "events": ["pull_request"]
      }
    },
    {
      "name": "Filter: PR Opened",
      "type": "n8n-nodes-base.filter",
      "parameters": {
        "conditions": {
          "string": [{
            "value1": "={{ $json.action }}",
            "operation": "equals",
            "value2": "opened"
          }]
        }
      }
    },
    {
      "name": "Call OpenClaw",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "url": "http://<gateway-ip>:18789/hooks/agent",
        "method": "POST",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpHeaderAuth",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [{
            "name": "Authorization",
            "value": "Bearer my-super-secret-webhook-token-2025"
          }]
        },
        "sendBody": true,
        "bodyParameters": {
          "parameters": [{
            "name": "message",
            "value": "有新的 PR 被创建。\n标题: {{ $json.pull_request.title }}\n作者: {{ $json.pull_request.user.login }}\nURL: {{ $json.pull_request.html_url }}\n\n请检查变更文件并编写简单的审查评论。"
          }, {
            "name": "name",
            "value": "GitHub PR Review"
          }, {
            "name": "deliver",
            "value": true
          }, {
            "name": "channel",
            "value": "telegram"
          }]
        }
      }
    }
  ]
}
```

### Make (Integromat) 集成

在 Make 中使用 HTTP 模块：

1. **Webhook 触发器** → 接收外部事件
2. 添加 **HTTP Make a request** 模块：
   - URL: `http://<gateway-ip>:18789/hooks/agent`
   - Method: POST
   - Headers: `Authorization: Bearer <令牌>`
   - Body: 以 JSON 格式设置 `message`、`name`、`deliver`、`channel`

### Gmail 实时集成

OpenClaw 原生支持 Gmail Pub/Sub：

```bash
# Gmail Webhook 设置
openclaw webhooks gmail setup

# 运行 Gmail 监听
openclaw webhooks gmail run
```

```json5
// 在 openclaw.json 中添加 Gmail 映射
{
  "hooks": {
    "enabled": true,
    "token": "my-secret",
    "presets": ["gmail"]  // 启用 Gmail 预设
  }
}
```

每当有新邮件时：
```bash
curl -X POST http://127.0.0.1:18789/hooks/gmail \
  -H 'Authorization: Bearer my-secret' \
  -H 'Content-Type: application/json' \
  -d '{"source":"gmail","messages":[{"from":"Boss","subject":"紧急：明天开会","snippet":"请参加明天10点的会议..."}]}'
```

---

## 活用法 3：MCP 服务器集成 🧠

**MCP (Model Context Protocol)** 是以标准化方式向 AI 代理提供外部数据源和工具的协议。让我们了解如何在 OpenClaw 中使用 MCP 服务器。

### 什么是 MCP 服务器？

MCP 服务器是向 AI 提供特定工具和资源的服务。例如：
- **文件系统 MCP** — 读写特定目录的文件
- **数据库 MCP** — 执行 SQL 查询
- **API MCP** — REST API 调用抽象
- **浏览器 MCP** — 控制网页

### 在 OpenClaw 中使用 MCP

可以通过 OpenClaw 的 Skill 系统与 MCP 服务器集成。在自定义 Skill 的 SKILL.md 中定义 MCP 服务器的调用方法：

```markdown
---
name: mcp_database
description: 通过 MCP 集成用自然语言查询 PostgreSQL 数据库的 Skill
metadata: {"openclaw":{"requires":{"bins":["npx"],"env":["DATABASE_URL"]},"primaryEnv":"DATABASE_URL"}}
---

# MCP Database Skill

## 使用方法
当用户提出数据库相关问题时，通过 MCP 服务器进行查询。

## 执行方法
1. 通过 `exec` 工具启动 MCP 服务器进程：
   ```bash
   npx @modelcontextprotocol/server-postgres $DATABASE_URL
   ```
2. 通过 MCP 服务器提供的工具执行查询
3. 将结果传递给用户

## 安全规则
- 仅执行 SELECT 查询（禁止 INSERT/UPDATE/DELETE）
- 先确认表列表再执行查询
- 结果超过100行时进行摘要
```

### 实战：Notion MCP + OpenClaw

```bash
# 安装 Notion MCP 服务器
npm install -g @notionhq/notion-mcp-server

# 创建 Skill 目录
mkdir -p ~/.openclaw/workspace/skills/notion-mcp
```

```markdown
# skills/notion-mcp/SKILL.md
---
name: notion_mcp
description: 通过 MCP 集成用 AI 管理 Notion 工作区的 Skill
metadata: {"openclaw":{"requires":{"env":["NOTION_API_KEY"]},"primaryEnv":"NOTION_API_KEY"}}
---

# Notion MCP Skill

通过 Notion API 执行页面创建、搜索和编辑。

## 可执行的操作
- 搜索和读取页面
- 创建新页面/数据库条目
- 编辑现有页面
- 查询数据库

## 执行方法
通过 exec 工具运行 `notion-mcp-server`，然后处理结果。
```

```json5
// 在 openclaw.json 中设置 Skill 环境变量
{
  "skills": {
    "entries": {
      "notion_mcp": {
        "enabled": true,
        "apiKey": "ntn_xxxxxxxxxxxx",
        "env": {
          "NOTION_API_KEY": "ntn_xxxxxxxxxxxx"
        }
      }
    }
  }
}
```

---

## 活用法 4：构建多代理系统 🤖

在单个 Gateway 上运行多个不同角色代理的实战模式。

![OpenClaw 多代理文档 — 代理路由、绑定、沙盒设置](../../../assets/blog/docs-multi-agent.png)

### 完整的多代理配置

```json5
// ~/.openclaw/openclaw.json
{
  "agents": {
    "defaults": {
      "sandbox": {
        "mode": "non-main",
        "scope": "session"
      },
      "subagents": {
        "maxConcurrent": 4,
        "model": "anthropic/claude-sonnet-4-20250514",
        "archiveAfterMinutes": 60
      }
    },
    "list": [
      {
        // 个人助理 — 完全访问
        "id": "personal",
        "default": true,
        "name": "个人助理",
        "workspace": "~/.openclaw/workspace",
        "sandbox": { "mode": "off" }
      },
      {
        // 工作代理 — 受限工具
        "id": "work",
        "name": "工作助理",
        "workspace": "~/.openclaw/workspace-work",
        "sandbox": {
          "mode": "all",
          "scope": "agent"
        },
        "tools": {
          "allow": ["read", "write", "edit", "exec", "web_search", "web_fetch", "browser"],
          "deny": ["gateway", "nodes", "cron"]
        }
      },
      {
        // 家庭机器人 — 只读
        "id": "family",
        "name": "家庭机器人",
        "workspace": "~/.openclaw/workspace-family",
        "sandbox": {
          "mode": "all",
          "scope": "agent"
        },
        "tools": {
          "allow": ["read", "web_search", "web_fetch", "message"],
          "deny": ["exec", "write", "edit", "browser", "gateway", "nodes"]
        }
      }
    ]
  },
  
  // 路由规则 — 谁与哪个代理对话
  "bindings": [
    {
      "agentId": "work",
      "match": {
        "provider": "telegram",
        "peer": {
          "kind": "group",
          "id": "-1001234567890"  // 工作群聊
        }
      }
    },
    {
      "agentId": "family",
      "match": {
        "provider": "whatsapp",
        "peer": {
          "kind": "group",
          "id": "120363424282127706@g.us"  // 家庭群组
        }
      }
    }
  ]
}
```

### 子代理实战模式

主代理将繁重任务委托给子代理的模式。

在 Telegram 中这样请求：
> "同时翻译这3篇技术博客，并分别做摘要"

AI 内部执行的操作：

```mermaid
graph TD
    Main["🧠 主代理<br/>任务分配 & 结果汇总"]
    Sub1["📝 子代理 1<br/>博客 A 翻译 + 摘要"]
    Sub2["📝 子代理 2<br/>博客 B 翻译 + 摘要"]
    Sub3["📝 子代理 3<br/>博客 C 翻译 + 摘要"]
    Result["📤 在主聊天中公布结果"]

    Main -->|"并行执行"| Sub1
    Main -->|"并行执行"| Sub2
    Main -->|"并行执行"| Sub3
    Sub1 -->|"完成"| Result
    Sub2 -->|"完成"| Result
    Sub3 -->|"完成"| Result
```

子代理管理：

```bash
# 查看正在运行的子代理（Telegram 斜杠命令）
/subagents list

# 查看特定子代理的日志
/subagents log 1 50

# 停止子代理
/subagents stop all
```

### 子代理成本优化

```json5
{
  "agents": {
    "defaults": {
      "subagents": {
        // 子代理使用低成本模型
        "model": "anthropic/claude-sonnet-4-20250514",
        "maxConcurrent": 4
      }
    }
  }
}
```

主代理用 Opus，子代理用 Sonnet — 可以最大化性价比。

---

## 活用法 5：浏览器自动化数据采集 🌐

利用 OpenClaw 的浏览器工具，打造自动数据采集管道。

### 示例：每日竞品价格监控

在 Telegram 中请求：
> "查看竞争对手 A、B、C 网站上主要产品的价格，制作对比表"

AI 使用 `browser` 工具自动处理：

```mermaid
graph LR
    A["🌐 竞争对手 A<br/>商品页面"] -->|"snapshot"| E["📊 价格提取"]
    B["🌐 竞争对手 B<br/>商品页面"] -->|"snapshot"| E
    C["🌐 竞争对手 C<br/>商品页面"] -->|"snapshot"| E
    E --> F["📋 生成对比表"]
    F --> G["💾 保存到工作区"]
    G --> H["📤 发送至 Telegram"]
```

### 用 Cron 自动化

```bash
openclaw cron add \
  --name "价格监控" \
  --cron "0 9 * * *" \
  --tz "Asia/Tokyo" \
  --session isolated \
  --message "请检查以下3个网站的主要商品价格：
1. https://competitor-a.com/main-product
2. https://competitor-b.com/product
3. https://competitor-c.com/pricing

用浏览器访问每个网站：
- 提取商品名、价格、折扣信息
- 与昨天的记录（workspace/price-history.json）对比
- 如有价格变动则高亮标注
- 将结果追加到 price-history.json
- 将对比摘要发送至 Telegram" \
  --deliver \
  --channel telegram \
  --to "<我的_Telegram_聊天ID>"
```

### 网络调研管道

也可以完成更复杂的调研：

```
# 在 Telegram 中：
"请调查2025年韩国 AI 初创企业投资趋势。
整理5大主要交易、投资金额、各领域趋势，
制作 Markdown 报告并保存为文件。"
```

AI 内部执行步骤：
1. **`web_search`** — 通过 Brave 搜索收集最新文章
2. **`web_fetch`** — 将主要文章正文提取为 Markdown
3. **`browser`** — 需要登录的网站或动态页面通过浏览器直接浏览
4. **`write`** — 在工作区编写 Markdown 报告
5. **`message`** — 以文件附件形式发送至 Telegram

---

## 活用法 6：通过 Node 系统实现安防摄像头监控 📹

利用 OpenClaw 的节点系统构建智能安防系统。

![OpenClaw 节点文档 — 摄像头、位置、屏幕录制、命令执行等节点功能](../../../assets/blog/docs-nodes.png)

### 组成部分

```mermaid
graph TD
    Gateway["🖥️ 家用 PC<br/>OpenClaw Gateway"]
    Tablet["📱 Android 平板<br/>后置摄像头 → 监控门口"]
    iPhone["📱 iPhone<br/>接收通知"]
    AI["🧠 AI 分析<br/>异常检测"]

    Gateway -->|"camera_snap"| Tablet
    Tablet -->|"图片"| AI
    AI -->|"检测到异常时"| Gateway
    Gateway -->|"notify"| iPhone
```

### 定期快照 + AI 分析

```bash
# 每30分钟对门口摄像头拍照 → AI 检测到异常时发送提醒
openclaw cron add \
  --name "安防摄像头检查" \
  --cron "*/30 * * * *" \
  --session isolated \
  --message "请对门口摄像头（android-tablet 节点）拍摄后置摄像头快照。
分析照片：
1. 如果看到有人，立即提醒（推送至 iPhone 节点）
2. 如果看到快递/邮件，发送提醒
3. 如果无异常，仅安静记录日志
请将分析结果记录到 memory/ 文件夹。" \
  --deliver \
  --channel telegram \
  --to "<我的_Telegram_聊天ID>"
```

### 在 Telegram 中手动控制

```
# 立即查看门口摄像头
"拍一张门口摄像头的照片给我看看"

# 录制10秒视频
"录一段门口摄像头10秒的视频"

# 发送通知
"给 iPhone 发个'快递到了！'的通知"

# 查看位置
"告诉我手机的位置"
```

### 完整安防工作流 (HEARTBEAT.md)

```markdown
# HEARTBEAT.md — 安防监控

## 常时检查
- [ ] 夜间(22:00-06:00)每小时自动拍摄门口摄像头快照
- [ ] 快照中检测到人时立即通知 iPhone + 将照片发送至 Telegram
- [ ] 检测到快递/邮件时发送提醒（级别：普通）

## 外出模式（手动触发）
用户说"开启外出模式"时：
- 将摄像头快照间隔缩短至15分钟
- 检测到任何运动时立即提醒
- 将结果记录到 memory/security-log.md
```

---

## 活用法 7：自定义 Skill 开发完全指南 🛠️

来创建自己的 Skill 扩展 OpenClaw 吧。

![OpenClaw Skill 文档 — Skill 格式、门控、环境变量注入、ClawHub 等](../../../assets/blog/docs-skills.png)

### Skill 结构

```
skills/
└── my-news-digest/
    ├── SKILL.md          # Skill 定义（必需）
    ├── fetch-news.js     # 辅助脚本（可选）
    └── README.md         # 说明文档（可选）
```

### 完整 Skill 示例：新闻摘要

#### SKILL.md

```markdown
---
name: news_digest
description: 从 Naver 新闻和 Hacker News 收集并摘要技术新闻的 Skill
metadata: {"openclaw":{"emoji":"📰","requires":{"bins":["node"]},"os":["darwin","linux","win32"]}}
user-invocable: true
---

# 新闻摘要 Skill

## 使用方法
当用户发出"新闻"或"今日新闻"相关命令时使用此 Skill。

## 采集来源
1. **Naver 新闻 IT/科学版块** — 用 `web_fetch` 提取头条
2. **Hacker News** — 用 `web_fetch` 提取前10条
3. **TechCrunch** — 用 `web_fetch` 提取最新5篇文章

## 执行步骤
1. 从各来源用 `web_fetch` 或 `web_search` 采集数据
2. 将收集的文章按类别分类（AI、安全、开发、初创企业）
3. 将每篇文章摘要为1-2行
4. 格式化为 Markdown
5. 可选：语音朗读（`tts` 工具）

## 输出格式
```markdown
# 📰 今日科技新闻摘要
> 截至 2025-07-14 09:00

## 🤖 AI
- **标题** — 一句话摘要 [链接]

## 🔒 安全
- **标题** — 一句话摘要 [链接]

## 💻 开发
- **标题** — 一句话摘要 [链接]
```

## 保存
结果也会保存到 `{baseDir}/latest-digest.md`。
```

#### fetch-news.js（辅助脚本）

```javascript
#!/usr/bin/env node
// skills/my-news-digest/fetch-news.js
// 代理可以通过 exec 调用的辅助脚本

const https = require('https');

async function fetchHackerNews() {
  return new Promise((resolve, reject) => {
    https.get('https://hacker-news.firebaseio.com/v0/topstories.json', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const ids = JSON.parse(data).slice(0, 10);
        resolve(ids);
      });
    }).on('error', reject);
  });
}

async function fetchStory(id) {
  return new Promise((resolve, reject) => {
    https.get(`https://hacker-news.firebaseio.com/v0/item/${id}.json`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function main() {
  const topIds = await fetchHackerNews();
  const stories = await Promise.all(topIds.map(fetchStory));
  
  const output = stories
    .filter(s => s && s.title)
    .map((s, i) => `${i+1}. **${s.title}** (${s.score}分) — ${s.url || `https://news.ycombinator.com/item?id=${s.id}`}`)
    .join('\n');
  
  console.log('# Hacker News Top 10\n');
  console.log(output);
}

main().catch(console.error);
```

### 将 Skill 分享到 ClawHub

如果你创建的 Skill 很有用，请与社区分享：

```bash
# 上传 Skill 到 ClawHub
npx clawhub@latest publish ./skills/my-news-digest

# 同步所有 Skill
npx clawhub@latest sync --all
```

### 高级 Skill 功能

#### 环境变量门控

```markdown
---
name: github_analyzer
description: 分析 GitHub 仓库的 Skill
metadata: {"openclaw":{"requires":{"env":["GITHUB_TOKEN"],"bins":["gh"]},"primaryEnv":"GITHUB_TOKEN"}}
---
```

此 Skill 仅在存在 `GITHUB_TOKEN` 环境变量和 `gh` CLI 时才会激活。

#### 工具直接分发

```markdown
---
name: quick_search
description: 快速网络搜索快捷命令
command-dispatch: tool
command-tool: web_search
command-arg-mode: raw
---
```

`/quick_search AI 新闻` → 不经过模型，直接调用 `web_search` 工具

---

## 活用法 8：工作区文件实战编写指南 📝

工作区文件构成了代理的"大脑"。编写得好的话，代理的性能会大幅提升。

### AGENTS.md — 代理行为规范

```markdown
# AGENTS.md

## 每次会话启动时
1. 读取 SOUL.md — 我的身份
2. 读取 USER.md — 用户信息
3. 读取 memory/今天.md + memory/昨天.md — 近期上下文
4. 如果是主会话也要读取 MEMORY.md

## 安全规则
- 绝对禁止泄露个人数据
- 破坏性命令（rm、drop 等）必须确认后执行
- `trash` > `rm`（优先使用可恢复的删除）
- 不确定时提问

## 外部通信
可以自由执行的操作：
- 读取文件、浏览、整理
- 网络搜索、查看日历
- 工作区内操作

需要先询问的操作：
- 发送邮件、推文、公开帖子
- 任何离开本机的操作

## 记忆管理
- 在 memory/YYYY-MM-DD.md 中编写每日日志
- 重要决策、洞察添加到 MEMORY.md
- 如果用户说"记住这个" → 写入文件（禁止心理备忘！）

## 群聊参与规则
- 仅在被直接@时回复
- 仅在能做出有意义贡献时发言
- 不要打断对话流
- 轻度使用表情反应

## 心跳
读取 HEARTBEAT.md 并执行清单。
如果没有待办事项则回复 HEARTBEAT_OK。
夜间(23:00-08:00)只处理紧急事项。
```

### SOUL.md — 代理人格定义

```markdown
# SOUL.md

## 我是谁
名字: Claw
基础: OpenClaw 🦞
角色: 金在贤的个人 AI 助理

## 性格
- 亲切但专业 — 使用敬语
- 有幽默感但避免话太多
- 技术上准确，同时让非专业人士也能理解
- 适度使用表情符号（不要过度）
- 默认韩语，技术术语保持英文原文

## 沟通风格
- 偏好简短核心的回答
- 代码始终以可复制的完整形式提供
- 不确定的事坦诚地说"我不太清楚"
- 有多个选项时连同推荐一起列出

## 不应该做的事
- 不要照搬用户的话
- 不要过度赞美或奉承
- 不要加不必要的免责声明
- 禁止"如果需要帮助请随时告诉我"之类的套话结尾
```

### MEMORY.md — 长期记忆

```markdown
# MEMORY.md — 长期记忆存储

## 用户偏好
- TypeScript > JavaScript（始终用 TS 编写代码）
- 主编辑器使用 VSCode
- 咖啡喝美式，每天早上星巴克
- 周末通常在咖啡厅做副项目

## 项目
- **my-saas**: 基于 Next.js + Supabase 的 SaaS（2025.03 开始）
  - 目前 MVP 开发中
  - 优先级: 支付系统 > 仪表板 > 邮件通知
- **blog**: 技术博客（Astro + MDX）
  - 目标每周1篇

## 重要决策日志
- 2025.07.10: 决定将数据库从 PostgreSQL 迁移到 PlanetScale
- 2025.07.08: 正在考虑将 CI/CD 从 GitHub Actions 改为 Dagger

## 重复模式
- 喜欢在周一制定周计划
- 周五下午集中做代码审查
- 晚上7点以后通常回复较慢（运动/晚餐）

## 注意事项
- boss@company.com 的邮件要始终立即通知
- 每月15日是信用卡还款日 — 需要提前提醒
```

### 实战 HEARTBEAT.md

```markdown
# HEARTBEAT.md

## 紧急（始终检查）
- [ ] boss@company.com 有未读邮件 → 立即提醒
- [ ] 服务器宕机警报 → 立即提醒
- [ ] 1小时内有日历日程 → 提前提醒

## 定期（工作时间 09-18）
- [ ] GitHub PR 审查请求 → 提醒
- [ ] Slack 未回复的 @提及 → 摘要推送
- [ ] 今天待办中未完成项提醒

## 后台（每天2-3次）
- [ ] 天气变化（有雨预报时提醒带伞）
- [ ] 整理 memory/ + 更新 MEMORY.md
- [ ] 检查进行中项目的 git status

## 夜间 (23:00-08:00)
- 仅检查紧急项，其余 HEARTBEAT_OK
- 通知静音 (silent: true)
```

---

## 福利：运营技巧集锦 🎯

### 1. 通过 Tailscale 随时随地访问

```bash
# 将 Gateway 绑定到 Tailscale 网络
openclaw gateway --bind tailnet --token <令牌>

# 现在可以通过 tailscale IP 从任何地方访问
# http://100.x.y.z:18789/（仪表板）
```

### 2. 多实例运营

```bash
# 第二个 Gateway（不同配置文件）
OPENCLAW_CONFIG_PATH=~/.openclaw/work.json \
OPENCLAW_STATE_DIR=~/.openclaw-work \
openclaw gateway --port 19001
```

### 3. Token 用量监控

```bash
# 查看 Token 使用情况
openclaw status --all

# 各模型成本在 config 中设置
# models.providers.*.models[].cost
```

### 4. 安全检查清单

- [ ] 确认 `dmPolicy: "pairing"` 设置
- [ ] 设置 Webhook 令牌 (`hooks.token`)
- [ ] 设置 Gateway 令牌（非本地绑定时）
- [ ] 对敏感代理应用 Docker 沙盒
- [ ] 审查 `exec` 审批系统 (`tools.elevated`)

### 5. 语音对话模式 🎙️

在 macOS 应用中启用 Voice Wake + Talk Mode 后，无需键盘即可对话。子代理的结果也可以用语音听取。

---

## 总结 — 用 OpenClaw 打造属于你的 AI 生态系统 🌐

到这里，我们通过3篇文章全面了解了 OpenClaw 的介绍、安装以及实战高级用法。

总结来说，OpenClaw 是：

- 🤖 **AI 助理** — 通过 Cron + 心跳自动帮你打点一切
- 🔗 **自动化枢纽** — 通过 Webhook 集成 n8n/Make/GitHub/Gmail
- 🧠 **MCP 桥梁** — 与外部数据源标准化连接
- 💻 **开发伙伴** — 通过子代理并行处理任务
- 🏠 **智能家居控制器** — 通过节点系统管理摄像头·通知·位置
- 🌐 **数据采集器** — 通过浏览器自动化进行网页监控
- 🧩 **扩展平台** — 开发 Skill 并在 ClawHub 上分享
- 📝 **有记忆的伙伴** — 通过 MEMORY.md 跨会话记忆

**一体化 AI 代理平台**。

最重要的是**迈出第一步**。今天就选一个来配置试试吧：

1. 🌅 **晨间简报 Cron** — 每天早上汇总今日信息
2. 📝 **HEARTBEAT.md** — 一个文件搞定自动助理清单
3. 🔗 **一个 Webhook** — 将 GitHub/Gmail 通知转发到 Telegram

一旦尝试，你就会越来越多地把事情交给它。🦞

如有疑问，欢迎在 [OpenClaw Discord](https://discord.gg/clawd) 见面！🙌

---

*精通 OpenClaw 系列*
- [第1篇：OpenClaw 是什么？](/zh/blog/openclaw-introduction-guide/)
- [第2篇：从安装到第一次对话](/zh/blog/openclaw-installation-tutorial/)
- **第3篇：实战高级用法** ← 当前文章
