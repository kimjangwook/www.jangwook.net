---
title: 使用Slack MCP分析团队沟通数据
description: 介绍利用Model Context Protocol进行Slack数据分析的方法和实战应用案例
pubDate: '2025-11-04'
heroImage: ../../../assets/blog/slack-mcp-team-communication-hero.jpg
tags:
  - slack
  - mcp
  - ai-agents
  - communication-analytics
  - claude-code
relatedPosts:
  - slug: claude-skills-implementation-guide
    score: 0.95
    reason:
      ko: '자동화, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, architecture with comparable
        difficulty.
      zh: 在自动化、AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: jules-autocoding
    score: 0.95
    reason:
      ko: '자동화, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, architecture with comparable
        difficulty.
      zh: 在自动化、AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: ai-agent-notion-mcp-automation
    score: 0.94
    reason:
      ko: '자동화, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, architecture with comparable
        difficulty.
      zh: 在自动化、AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: llm-pm-workflow-automation
    score: 0.94
    reason:
      ko: '자동화, AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: 'Covers similar topics in automation, AI/ML with comparable difficulty.'
      zh: 在自动化、AI/ML领域涵盖类似主题，难度相当。
  - slug: notion-backlog-slack-claude-project-management
    score: 0.94
    reason:
      ko: '자동화, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, architecture with comparable
        difficulty.
      zh: 在自动化、AI/ML、架构领域涵盖类似主题，难度相当。
---

## 概述

团队沟通是决定组织绩效的核心要素。在Slack等协作平台上积累了能够了解团队健康度、生产力和文化的宝贵数据,但有效地分析和利用这些数据并不容易。

<strong>模型上下文协议（Model Context Protocol, MCP）</strong>是解决这一问题的创新解决方案。通过连接Claude AI和Slack,可以分析对话数据、提取洞察并构建自动化工作流。

本文将介绍以下内容:

- Slack MCP的核心概念和架构
- 安装和设置方法（3种选项）
- 8种核心MCP工具的使用方法
- 情感分析、参与度测量等数据分析技术
- Salesforce、初创企业、全球企业的实战案例
- 性能优化和安全最佳实践

## 什么是Slack MCP?

### 核心概念

<strong>模型上下文协议（Model Context Protocol, MCP）</strong>是Anthropic于2024年11月发布的开放协议,使AI模型能够以标准化方式与外部数据源和工具交互。传统的Slack API需要开发人员直接编写HTTP请求并解析响应,而MCP将这些复杂性抽象化,使用户能够通过自然语言请求和分析数据。

<strong>传统Slack API vs Slack MCP</strong>:

| 特性 | Slack API | Slack MCP |
|------|-----------|-----------|
| 使用方式 | 直接编写HTTP请求 | 自然语言命令 |
| 认证 | 手动管理令牌 | MCP服务器处理 |
| 数据解析 | 手动JSON解析 | AI自动解释 |
| 分析 | 需要编写单独代码 | Claude AI内置分析 |
| 学习曲线 | 高 | 低 |

### 架构图

```mermaid
graph TB
    User[用户] -->|自然语言命令| Host[MCP Host<br/>Claude Code/Desktop]
    Host -->|MCP Protocol| Server[MCP Server<br/>Slack Connector]
    Server -->|OAuth/Token| SlackAPI[Slack API]
    SlackAPI -->|频道、消息、用户| Slack[Slack Workspace]

    Server -->|Resources| Host
    Server -->|Tools| Host
    Server -->|Prompts| Host

    Host -->|AI分析结果| User

    style Host fill:#f9f,stroke:#333
    style Server fill:#bbf,stroke:#333
    style Slack fill:#4A154B,stroke:#333,color:#fff
```

### 主要组成部分

MCP生态系统由三个核心要素组成:

1. <strong>MCP Hosts</strong>: 支持MCP协议的客户端应用程序,如Claude Code、Claude Desktop、Cline等
2. <strong>MCP Servers</strong>: 连接特定数据源（Slack、GitHub、Postgres等）的连接器
3. <strong>协议标准</strong>:
   - <strong>Resources</strong>: 静态数据（频道列表、用户资料）
   - <strong>Tools</strong>: 动态操作（发送消息、搜索）
   - <strong>Prompts</strong>: 可重用的命令模板

## 安装和设置

开始使用Slack MCP有3种方法。每个选项都有不同的要求和权限模型。

### 选项1: 官方TypeScript服务器（推荐）

最稳定且功能最丰富的选项。需要创建Slack App并进行OAuth认证。

<strong>步骤1: 创建Slack App</strong>

1. 在[Slack API网站](https://api.slack.com/apps)上点击"Create New App"
2. 选择"From scratch"
3. 输入App名称（例如: "MCP Analytics Bot"）
4. 选择工作区

<strong>步骤2: 权限设置</strong>

在"OAuth & Permissions"部分添加以下Bot Token Scopes:

````typescript
// 必需的OAuth Scopes
const requiredScopes = [
  'channels:history',    // 读取公开频道消息
  'channels:read',       // 查询频道列表
  'chat:write',          // 发送消息
  'groups:history',      // 私有频道消息
  'groups:read',         // 私有频道列表
  'im:history',          // DM历史记录
  'im:read',             // DM列表
  'mpim:history',        // 群组DM历史记录
  'reactions:read',      // 读取表情反应
  'reactions:write',     // 添加表情反应
  'users:read',          // 查询用户信息
  'search:read',         // 搜索消息
];
````

<strong>步骤3: 安装</strong>

```bash
# 通过NPM安装
npm install -g @modelcontextprotocol/server-slack

# 或使用NPX直接运行（无需安装）
npx @modelcontextprotocol/server-slack
```

<strong>步骤4: Claude Code设置</strong>

在`.claude/settings.json`文件中添加以下设置:

```json
{
  "mcpServers": {
    "slack": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-slack"
      ],
      "env": {
        "SLACK_BOT_TOKEN": "xoxb-your-bot-token-here",
        "SLACK_TEAM_ID": "T01234567"
      }
    }
  }
}
```

<strong>步骤5: 获取Bot Token</strong>

1. 在Slack App设置中点击"Install to Workspace"
2. 授权权限
3. 复制"Bot User OAuth Token"并输入到`SLACK_BOT_TOKEN`
4. 在Workspace URL中确认Team ID（例如: `your-workspace.slack.com` → 在Settings中确认Team ID）

### 选项2: 社区Python服务器

适合喜欢Python环境或需要自定义的情况。

```bash
# 安装
pip install mcp-server-slack

# 运行
mcp-server-slack --token xoxb-your-token
```

`.claude/settings.json`设置:

```json
{
  "mcpServers": {
    "slack": {
      "command": "mcp-server-slack",
      "args": [
        "--token",
        "xoxb-your-bot-token"
      ]
    }
  }
}
```

<strong>优点</strong>:
- 易于集成Python生态系统
- 自定义和扩展性
- 与数据科学库集成（pandas、numpy）

<strong>缺点</strong>:
- 功能比官方服务器有限
- 更新频率较低

### 选项3: 高级服务器（无需权限）

使用浏览器令牌的方法,无需创建Slack App。适合个人分析。

```bash
# 安装
npm install -g @modelcontextprotocol/server-slack-advanced

# 提取浏览器令牌
# 1. 打开Slack Web应用 (app.slack.com)
# 2. 开发者工具 (F12) → Application → Cookies
# 3. 复制"d" Cookie值
```

`.claude/settings.json`设置:

```json
{
  "mcpServers": {
    "slack-advanced": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-slack-advanced"
      ],
      "env": {
        "SLACK_COOKIE": "xoxd-browser-token-here"
      }
    }
  }
}
```

<strong>注意事项</strong>:
- 浏览器令牌会定期过期（30〜90天）
- 仅以个人账户权限运行
- 不建议在生产环境中使用

### 认证和权限设置

<strong>Bot Token vs User Token vs Browser Token</strong>:

| 令牌类型 | 使用场景 | 权限范围 | 过期 |
|----------|-------------|---------|------|
| Bot Token (xoxb-) | 团队整体分析、自动化 | App授予的权限 | 永久 |
| User Token (xoxp-) | 访问个人数据 | 用户权限 | 永久 |
| Browser Token (xoxd-) | 快速原型开发 | 当前用户 | 30〜90天 |

<strong>安全最佳实践</strong>:

1. <strong>使用环境变量</strong>: 不要在代码中硬编码令牌
2. <strong>最小权限原则</strong>: 仅请求必要的作用域
3. <strong>令牌轮换</strong>: 定期重新发放令牌
4. <strong>审计日志</strong>: 使用Slack Audit Logs API跟踪访问记录

## 可用的MCP工具

Slack MCP提供8种核心工具。每个工具都针对特定任务进行了优化。

### 1. slack_list_channels

查询工作区的所有频道列表。

<strong>参数</strong>:
- `types`（可选）: 从`public_channel`、`private_channel`、`mpim`、`im`中选择
- `limit`（可选）: 返回的最大频道数（默认值: 100）

<strong>响应格式</strong>:

```json
{
  "channels": [
    {
      "id": "C01234567",
      "name": "general",
      "is_channel": true,
      "is_private": false,
      "created": 1609459200,
      "num_members": 150
    }
  ]
}
```

<strong>实战应用案例</strong>:

```typescript
// 识别活跃频道（按成员数）
const channels = await slack_list_channels({ limit: 1000 });
const activeChannels = channels
  .filter(ch => ch.num_members > 10)
  .sort((a, b) => b.num_members - a.num_members);

console.log(`最活跃的频道: ${activeChannels[0].name} (${activeChannels[0].num_members}名成员)`);
```

### 2. slack_conversations_history

获取特定频道的消息历史记录。

<strong>参数</strong>:
- `channel`（必需）: 频道ID（例如: "C01234567"）
- `limit`（可选）: 消息数（最多1000）
- `oldest`（可选）: Unix时间戳（此时间之后的消息）
- `latest`（可选）: Unix时间戳（此时间之前的消息）

<strong>响应格式</strong>:

```json
{
  "messages": [
    {
      "type": "message",
      "user": "U01234567",
      "text": "完成了项目里程碑!",
      "ts": "1609459200.123456",
      "thread_ts": "1609459200.123456",
      "reply_count": 5,
      "reactions": [
        {
          "name": "tada",
          "count": 12,
          "users": ["U01234567", "U76543210"]
        }
      ]
    }
  ]
}
```

<strong>实战应用案例</strong>:

```typescript
// 分析过去7天的消息量
const sevenDaysAgo = Math.floor(Date.now() / 1000) - (7 * 24 * 60 * 60);
const history = await slack_conversations_history({
  channel: "C01234567",
  oldest: sevenDaysAgo.toString(),
  limit: 1000
});

const dailyVolume = {};
history.messages.forEach(msg => {
  const day = new Date(parseFloat(msg.ts) * 1000).toLocaleDateString();
  dailyVolume[day] = (dailyVolume[day] || 0) + 1;
});

console.log("每日消息数:", dailyVolume);
```

### 3. slack_post_message

向频道或DM发送消息。

<strong>参数</strong>:
- `channel`（必需）: 频道ID或用户ID
- `text`（必需）: 消息内容（支持Markdown）
- `blocks`（可选）: Block Kit结构化消息
- `thread_ts`（可选）: 要回复的消息的时间戳

<strong>实战应用案例</strong>:

```typescript
// 自动发送周报
const report = `
📊 <strong>周度沟通报告</strong>

- 总消息数: ${totalMessages}条
- 参与用户: ${activeUsers.length}人
- 最活跃的频道: #${topChannel.name}
- 平均响应时间: ${avgResponseTime}分钟

💡 <strong>洞察</strong>: 本周参与度比上周增加了15%。
`;

await slack_post_message({
  channel: "C_ANALYTICS",
  text: report
});
```

### 4. slack_reply_to_thread

向特定线程添加回复。

<strong>参数</strong>:
- `channel`（必需）: 频道ID
- `thread_ts`（必需）: 父消息的时间戳
- `text`（必需）: 回复内容

<strong>实战应用案例</strong>:

```typescript
// 客户查询自动分类
const supportMessages = await slack_conversations_history({
  channel: "C_SUPPORT",
  limit: 50
});

for (const msg of supportMessages.messages) {
  if (msg.text.includes("紧急") && !msg.reactions) {
    await slack_reply_to_thread({
      channel: "C_SUPPORT",
      thread_ts: msg.ts,
      text: "⚠️ 已分类为紧急查询。负责人员将尽快确认。"
    });
  }
}
```

### 5. slack_add_reaction

向消息添加表情反应。

<strong>参数</strong>:
- `channel`（必需）: 频道ID
- `timestamp`（必需）: 消息时间戳
- `name`（必需）: 表情名称（例如: "thumbsup"）

<strong>实战应用案例</strong>:

```typescript
// 自动为已完成的任务添加复选标记表情
const taskMessages = await slack_search_messages({
  query: "任务完成"
});

for (const msg of taskMessages.messages) {
  await slack_add_reaction({
    channel: msg.channel.id,
    timestamp: msg.ts,
    name: "white_check_mark"
  });
}
```

### 6. slack_get_thread_replies

获取线程的所有回复。

<strong>参数</strong>:
- `channel`（必需）: 频道ID
- `thread_ts`（必需）: 线程开始消息的时间戳

<strong>实战应用案例</strong>:

```typescript
// 测量线程解决时间
const threadReplies = await slack_get_thread_replies({
  channel: "C_SUPPORT",
  thread_ts: "1609459200.123456"
});

const firstReply = threadReplies[1]; // 第一个回复（0是父消息）
const lastReply = threadReplies[threadReplies.length - 1];

const resolutionTime =
  (parseFloat(lastReply.ts) - parseFloat(threadReplies[0].ts)) / 3600;

console.log(`解决时间: ${resolutionTime.toFixed(1)}小时`);
```

### 7. slack_list_users

查询工作区的所有用户列表。

<strong>响应格式</strong>:

```json
{
  "members": [
    {
      "id": "U01234567",
      "name": "jangwook",
      "real_name": "张旭",
      "is_bot": false,
      "is_admin": true,
      "tz": "Asia/Shanghai"
    }
  ]
}
```

<strong>实战应用案例</strong>:

```typescript
// 分析用户时区分布
const users = await slack_list_users();
const timezoneDistribution = {};

users.members
  .filter(u => !u.is_bot)
  .forEach(u => {
    const tz = u.tz || "Unknown";
    timezoneDistribution[tz] = (timezoneDistribution[tz] || 0) + 1;
  });

console.log("按时区分布的团队成员:", timezoneDistribution);
```

### 8. slack_search_messages

在整个工作区中搜索消息。

<strong>参数</strong>:
- `query`（必需）: 搜索查询（支持Slack搜索语法）
- `count`（可选）: 结果数（最多100）
- `sort`（可选）: `score`或`timestamp`

<strong>搜索查询语法</strong>:

```typescript
// 日期范围搜索
"部署 after:2025-01-01 before:2025-01-31"

// 频道过滤
"bug in:#engineering"

// 用户过滤
"from:@jangwook 报告"

// 表情反应过滤
"has::thumbsup:"

// AND/OR操作
"(紧急 OR 重要) 项目"
```

<strong>实战应用案例</strong>:

```typescript
// 月度关键词趋势分析
const keywords = ["AI", "部署", "bug", "性能", "安全"];
const trends = {};

for (const keyword of keywords) {
  const results = await slack_search_messages({
    query: `${keyword} after:2025-01-01`,
    count: 100
  });
  trends[keyword] = results.messages.length;
}

console.log("关键词趋势:", trends);
// 输出: { AI: 245, 部署: 189, bug: 156, 性能: 98, 安全: 67 }
```

## 数据分析技术

介绍使用Slack MCP的高级分析技术。

### 1. 消息量分析

消息量是团队活跃度的直接指标。

```typescript
// 分析按时段的消息分布
async function analyzeMessageVolume(channelId: string, days: number = 30) {
  const since = Math.floor(Date.now() / 1000) - (days * 24 * 60 * 60);
  const messages = await slack_conversations_history({
    channel: channelId,
    oldest: since.toString(),
    limit: 1000
  });

  // 按小时分组
  const hourlyDistribution = new Array(24).fill(0);

  messages.messages.forEach(msg => {
    const hour = new Date(parseFloat(msg.ts) * 1000).getHours();
    hourlyDistribution[hour]++;
  });

  // 识别峰值时段
  const peakHour = hourlyDistribution.indexOf(Math.max(...hourlyDistribution));
  const offPeakHour = hourlyDistribution.indexOf(Math.min(...hourlyDistribution));

  return {
    totalMessages: messages.messages.length,
    avgPerDay: (messages.messages.length / days).toFixed(1),
    peakHour: `${peakHour}:00〜${peakHour + 1}:00`,
    offPeakHour: `${offPeakHour}:00〜${offPeakHour + 1}:00`,
    hourlyDistribution
  };
}

// 使用示例
const volumeAnalysis = await analyzeMessageVolume("C01234567", 30);
console.log(`
📊 <strong>30天消息量分析</strong>
- 总消息数: ${volumeAnalysis.totalMessages}条
- 日均: ${volumeAnalysis.avgPerDay}条
- 峰值时段: ${volumeAnalysis.peakHour}
- 低谷时段: ${volumeAnalysis.offPeakHour}
`);
```

<strong>趋势分析</strong>:

```typescript
// 计算周度趋势（增加/减少）
function calculateTrend(currentWeek: number, previousWeek: number): string {
  const change = ((currentWeek - previousWeek) / previousWeek * 100).toFixed(1);
  const emoji = parseFloat(change) > 0 ? "📈" : "📉";
  return `${emoji} ${change}%`;
}
```

### 2. 情感分析

利用Claude AI分析消息的情感。

```typescript
// 使用Claude进行情感分析
async function analyzeSentiment(messages: any[]) {
  // 提取消息文本
  const texts = messages
    .map(m => m.text)
    .filter(t => t && t.length > 10) // 排除太短的消息
    .slice(0, 100); // 分析最近100条

  // 向Claude请求情感分析
  const prompt = `
请分析以下Slack消息的整体情感。
将每条消息分类为Positive（积极）、Neutral（中立）、Negative（消极），
并提供-100〜100之间的整体情感分数。

消息:
${texts.map((t, i) => `${i + 1}. ${t}`).join('\n')}

响应格式:
{
  "overallScore": <数字>,
  "positive": <数量>,
  "neutral": <数量>,
  "negative": <数量>,
  "insights": "<主要洞察>"
}
`;

  // 调用Claude API（示例）
  const response = await callClaudeAPI(prompt);
  return JSON.parse(response);
}

// 使用示例
const messages = await slack_conversations_history({
  channel: "C_GENERAL",
  limit: 100
});

const sentiment = await analyzeSentiment(messages.messages);
console.log(`
😊 <strong>情感分析结果</strong>
- 整体分数: ${sentiment.overallScore}/100
- 积极: ${sentiment.positive}条
- 中立: ${sentiment.neutral}条
- 消极: ${sentiment.negative}条

💡 洞察: ${sentiment.insights}
`);
```

<strong>团队士气监控</strong>:

```typescript
// 跟踪周度团队士气分数
interface MoraleScore {
  week: string;
  score: number;
  trend: "up" | "down" | "stable";
}

async function trackTeamMorale(channelId: string): Promise<MoraleScore[]> {
  const weeks = 4;
  const scores: MoraleScore[] = [];

  for (let i = 0; i < weeks; i++) {
    const weekStart = Math.floor(Date.now() / 1000) - ((i + 1) * 7 * 24 * 60 * 60);
    const weekEnd = Math.floor(Date.now() / 1000) - (i * 7 * 24 * 60 * 60);

    const messages = await slack_conversations_history({
      channel: channelId,
      oldest: weekStart.toString(),
      latest: weekEnd.toString(),
      limit: 500
    });

    const sentiment = await analyzeSentiment(messages.messages);

    scores.push({
      week: new Date(weekStart * 1000).toLocaleDateString(),
      score: sentiment.overallScore,
      trend: i > 0
        ? sentiment.overallScore > scores[i - 1].score ? "up" : "down"
        : "stable"
    });
  }

  return scores.reverse(); // 按时间排序
}
```

### 3. 线程和对话分析

线程是进行深入讨论的空间。

```typescript
// 测量线程参与度
interface ThreadEngagement {
  threadCount: number;
  avgRepliesPerThread: number;
  avgResolutionTime: number; // 小时单位
  participationRate: number; // 百分比
}

async function analyzeThreadEngagement(
  channelId: string,
  days: number = 7
): Promise<ThreadEngagement> {
  const since = Math.floor(Date.now() / 1000) - (days * 24 * 60 * 60);
  const messages = await slack_conversations_history({
    channel: channelId,
    oldest: since.toString(),
    limit: 1000
  });

  // 仅过滤有线程的消息
  const threaded = messages.messages.filter(m => m.thread_ts && m.thread_ts === m.ts);

  let totalReplies = 0;
  let totalResolutionTime = 0;
  const participants = new Set();

  for (const thread of threaded) {
    const replies = await slack_get_thread_replies({
      channel: channelId,
      thread_ts: thread.ts
    });

    totalReplies += replies.length - 1; // 排除父消息

    // 计算响应时间
    if (replies.length > 1) {
      const firstReply = replies[1];
      const resolutionTime =
        (parseFloat(firstReply.ts) - parseFloat(thread.ts)) / 3600;
      totalResolutionTime += resolutionTime;
    }

    // 跟踪参与者
    replies.forEach(r => participants.add(r.user));
  }

  const users = await slack_list_users();
  const activeUsers = users.members.filter(u => !u.is_bot).length;

  return {
    threadCount: threaded.length,
    avgRepliesPerThread: threaded.length > 0
      ? (totalReplies / threaded.length).toFixed(1)
      : 0,
    avgResolutionTime: threaded.length > 0
      ? (totalResolutionTime / threaded.length).toFixed(1)
      : 0,
    participationRate: ((participants.size / activeUsers) * 100).toFixed(1)
  };
}

// 使用示例
const engagement = await analyzeThreadEngagement("C_SUPPORT", 7);
console.log(`
💬 <strong>线程参与度分析</strong>
- 总线程数: ${engagement.threadCount}个
- 每线程平均回复: ${engagement.avgRepliesPerThread}个
- 平均响应时间: ${engagement.avgResolutionTime}小时
- 参与率: ${engagement.participationRate}%
`);
```

### 4. 表情和反应模式分析

表情是非语言沟通的核心指标。

```typescript
// 表情使用统计
interface EmojiStats {
  topEmojis: Array<{ emoji: string; count: number }>;
  positiveRatio: number; // 积极表情比例
  reactionRate: number; // 每条消息平均反应数
}

async function analyzeEmojiPatterns(
  channelId: string,
  days: number = 30
): Promise<EmojiStats> {
  const since = Math.floor(Date.now() / 1000) - (days * 24 * 60 * 60);
  const messages = await slack_conversations_history({
    channel: channelId,
    oldest: since.toString(),
    limit: 1000
  });

  const emojiCounts: Record<string, number> = {};
  let totalReactions = 0;

  messages.messages.forEach(msg => {
    if (msg.reactions) {
      msg.reactions.forEach(reaction => {
        emojiCounts[reaction.name] =
          (emojiCounts[reaction.name] || 0) + reaction.count;
        totalReactions += reaction.count;
      });
    }
  });

  // 提取顶部表情
  const topEmojis = Object.entries(emojiCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([emoji, count]) => ({ emoji, count }));

  // 分类积极表情
  const positiveEmojis = [
    'thumbsup', 'heart', 'tada', 'clap', 'fire',
    'rocket', 'star', 'sparkles', 'raised_hands'
  ];

  const positiveCount = topEmojis
    .filter(e => positiveEmojis.includes(e.emoji))
    .reduce((sum, e) => sum + e.count, 0);

  return {
    topEmojis,
    positiveRatio: ((positiveCount / totalReactions) * 100).toFixed(1),
    reactionRate: (totalReactions / messages.messages.length).toFixed(2)
  };
}

// 使用示例
const emojiStats = await analyzeEmojiPatterns("C_GENERAL", 30);
console.log(`
😀 <strong>表情使用模式</strong>

前10个表情:
${emojiStats.topEmojis.map((e, i) =>
  `${i + 1}. :${e.emoji}: (${e.count}次)`
).join('\n')}

- 积极表情比例: ${emojiStats.positiveRatio}%
- 每条消息平均反应: ${emojiStats.reactionRate}个
`);
```

### 5. 用户参与度指标

测量个人活动性和影响力。

```typescript
// 多维度用户参与度分析
interface UserEngagement {
  userId: string;
  name: string;
  messageCount: number;
  threadStarts: number;
  repliesReceived: number;
  reactionsReceived: number;
  influenceScore: number; // 0〜100
}

async function analyzeUserEngagement(
  channelId: string,
  days: number = 30
): Promise<UserEngagement[]> {
  const since = Math.floor(Date.now() / 1000) - (days * 24 * 60 * 60);
  const messages = await slack_conversations_history({
    channel: channelId,
    oldest: since.toString(),
    limit: 1000
  });

  const users = await slack_list_users();
  const userMap = new Map(users.members.map(u => [u.id, u.real_name]));

  const engagementData: Record<string, UserEngagement> = {};

  // 数据收集
  messages.messages.forEach(msg => {
    if (!msg.user || msg.bot_id) return; // 排除机器人

    if (!engagementData[msg.user]) {
      engagementData[msg.user] = {
        userId: msg.user,
        name: userMap.get(msg.user) || msg.user,
        messageCount: 0,
        threadStarts: 0,
        repliesReceived: 0,
        reactionsReceived: 0,
        influenceScore: 0
      };
    }

    const data = engagementData[msg.user];
    data.messageCount++;

    if (msg.thread_ts === msg.ts) {
      data.threadStarts++;
    }

    if (msg.reply_count) {
      data.repliesReceived += msg.reply_count;
    }

    if (msg.reactions) {
      data.reactionsReceived += msg.reactions.reduce(
        (sum, r) => sum + r.count, 0
      );
    }
  });

  // 计算影响力分数
  Object.values(engagementData).forEach(data => {
    data.influenceScore = Math.min(100,
      data.messageCount * 0.5 +
      data.threadStarts * 2 +
      data.repliesReceived * 1.5 +
      data.reactionsReceived * 1
    );
  });

  return Object.values(engagementData)
    .sort((a, b) => b.influenceScore - a.influenceScore);
}

// 使用示例
const engagement = await analyzeUserEngagement("C_ENGINEERING", 30);
console.log(`
👥 <strong>前10名影响者</strong>

${engagement.slice(0, 10).map((u, i) => `
${i + 1}. ${u.name}
   - 消息数: ${u.messageCount}条
   - 发起的线程: ${u.threadStarts}个
   - 收到的回复: ${u.repliesReceived}个
   - 收到的反应: ${u.reactionsReceived}个
   - 影响力分数: ${u.influenceScore.toFixed(1)}
`).join('\n')}
`);
```

## 实战应用案例

让我们看看实际企业如何使用Slack MCP。

### 案例1: 自动会议总结（Salesforce）

<strong>背景和场景</strong>:

Salesforce的工程团队平均每天进行12次会议。每次会议后手动撰写摘要需要15〜30分钟,每周浪费约10小时。

<strong>实施方法</strong>:

```typescript
// 监控会议频道并自动总结
async function autoSummarizeMeetings() {
  const meetingChannels = await slack_list_channels({
    types: 'public_channel'
  });

  const relevantChannels = meetingChannels.channels.filter(
    ch => ch.name.includes('meeting-') || ch.name.includes('sync-')
  );

  for (const channel of relevantChannels) {
    // 获取最近1小时的消息
    const oneHourAgo = Math.floor(Date.now() / 1000) - 3600;
    const messages = await slack_conversations_history({
      channel: channel.id,
      oldest: oneHourAgo.toString(),
      limit: 100
    });

    if (messages.messages.length > 10) { // 如果有足够的对话
      // 向Claude请求摘要
      const summary = await generateMeetingSummary(messages.messages);

      // 将摘要发布到频道
      await slack_post_message({
        channel: channel.id,
        text: `
🤖 <strong>AI会议摘要</strong>

${summary.keyPoints}

<strong>决定事项</strong>:
${summary.decisions}

<strong>行动项目</strong>:
${summary.actionItems}

<strong>下一步</strong>:
${summary.nextSteps}
        `
      });
    }
  }
}

// 使用Claude生成会议摘要
async function generateMeetingSummary(messages: any[]) {
  const transcript = messages
    .reverse() // 按时间排序
    .map(m => `${m.user}: ${m.text}`)
    .join('\n');

  const prompt = `
请分析以下Slack会议对话并总结:

${transcript}

请按以下格式回复:
{
  "keyPoints": "主要讨论事项（3-5个要点）",
  "decisions": "做出的决定（要点）",
  "actionItems": "行动项目和负责人（要点）",
  "nextSteps": "下一步（要点）"
}
`;

  const response = await callClaudeAPI(prompt);
  return JSON.parse(response);
}

// 每小时运行一次
setInterval(autoSummarizeMeetings, 60 * 60 * 1000);
```

<strong>业务影响</strong>:
- 每周节省10小时（每个团队）
- 会议决定遗漏减少95%
- 新团队成员入职时间缩短40%

### 案例2: 客户支持洞察（初创企业）

<strong>背景</strong>:

一家B2B SaaS初创企业在手动分类和优先处理客户支持频道(#customer-support)的查询时遇到困难。

<strong>实施方法</strong>:

```typescript
// 客户查询自动分类
interface SupportTicket {
  messageId: string;
  category: string; // 'bug', 'feature', 'question', 'urgent'
  priority: number; // 1〜5
  sentiment: string; // 'positive', 'neutral', 'negative'
  suggestedResponse?: string;
}

async function triageSupportTickets() {
  const messages = await slack_conversations_history({
    channel: "C_SUPPORT",
    limit: 50
  });

  const tickets: SupportTicket[] = [];

  for (const msg of messages.messages) {
    // 使用Claude进行分类
    const classification = await classifyMessage(msg.text);

    tickets.push({
      messageId: msg.ts,
      category: classification.category,
      priority: classification.priority,
      sentiment: classification.sentiment,
      suggestedResponse: classification.suggestedResponse
    });

    // 紧急查询立即升级
    if (classification.priority >= 4) {
      await slack_reply_to_thread({
        channel: "C_SUPPORT",
        thread_ts: msg.ts,
        text: `⚠️ <strong>分类为紧急查询</strong>\n\n分类: ${classification.category}\n优先级: ${classification.priority}/5\n\n@support-lead 请立即确认。`
      });

      // 如果是消极情感,添加共情消息
      if (classification.sentiment === 'negative') {
        await slack_reply_to_thread({
          channel: "C_SUPPORT",
          thread_ts: msg.ts,
          text: classification.suggestedResponse
        });
      }
    }
  }

  // 生成周报
  await generateSupportReport(tickets);
}

async function classifyMessage(text: string) {
  const prompt = `
请分析以下客户支持消息:

"${text}"

请按以下格式回复:
{
  "category": "bug|feature|question|urgent",
  "priority": <1-5>,
  "sentiment": "positive|neutral|negative",
  "suggestedResponse": "<共情消息（仅在消极情感时）>"
}
`;

  const response = await callClaudeAPI(prompt);
  return JSON.parse(response);
}

async function generateSupportReport(tickets: SupportTicket[]) {
  const categoryCounts = tickets.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const avgPriority = tickets.reduce((sum, t) => sum + t.priority, 0) / tickets.length;

  const negativeSentiment = tickets.filter(t => t.sentiment === 'negative').length;

  await slack_post_message({
    channel: "C_LEADERSHIP",
    text: `
📊 <strong>周度客户支持报告</strong>

<strong>查询分类</strong>:
- Bug: ${categoryCounts.bug || 0}件
- 功能请求: ${categoryCounts.feature || 0}件
- 问题: ${categoryCounts.question || 0}件
- 紧急: ${categoryCounts.urgent || 0}件

<strong>指标</strong>:
- 平均优先级: ${avgPriority.toFixed(1)}/5
- 消极情感: ${negativeSentiment}件 (${(negativeSentiment / tickets.length * 100).toFixed(1)}%)

<strong>趋势</strong>: 与上周相比,紧急查询${categoryCounts.urgent > 10 ? '增加 📈' : '减少 📉'}
    `
  });
}

// 每15分钟运行一次
setInterval(triageSupportTickets, 15 * 60 * 1000);
```

<strong>业务影响</strong>:
- 平均响应时间 45分钟 → 8分钟（减少82%）
- 客户满意度(CSAT) 73% → 91%（增加18个百分点）
- 支持团队生产力提高60%

### 案例3: 远程团队文化监控（全球企业）

<strong>背景</strong>:

一个分布在5个时区、规模200人的工程团队在远程工作期间难以维持团队文化和归属感。

<strong>实施方法</strong>:

```typescript
// 计算Team Health Score
interface TeamHealthMetrics {
  communicationScore: number; // 0〜100
  sentimentScore: number;
  engagementScore: number;
  isolationRisk: string[]; // 有隔离风险的用户列表
  recommendations: string[];
}

async function calculateTeamHealth(): Promise<TeamHealthMetrics> {
  const channels = await slack_list_channels({ types: 'public_channel' });
  const users = await slack_list_users();
  const activeUsers = users.members.filter(u => !u.is_bot);

  // 1. 沟通分数（消息量 + 分布）
  const messageVolumes = await Promise.all(
    channels.channels.map(ch =>
      slack_conversations_history({ channel: ch.id, limit: 100 })
    )
  );

  const totalMessages = messageVolumes.reduce(
    (sum, vol) => sum + vol.messages.length, 0
  );
  const communicationScore = Math.min(100, (totalMessages / channels.channels.length) * 2);

  // 2. 情感分数
  const allMessages = messageVolumes.flatMap(vol => vol.messages);
  const sentiment = await analyzeSentiment(allMessages);
  const sentimentScore = (sentiment.overallScore + 100) / 2; // -100〜100 → 0〜100

  // 3. 参与度分数
  const userActivity: Record<string, number> = {};
  allMessages.forEach(msg => {
    if (msg.user) {
      userActivity[msg.user] = (userActivity[msg.user] || 0) + 1;
    }
  });

  const activeUserCount = Object.keys(userActivity).length;
  const engagementScore = (activeUserCount / activeUsers.length) * 100;

  // 4. 检测隔离风险（7天内0条消息）
  const isolationRisk = activeUsers
    .filter(u => !userActivity[u.id])
    .map(u => u.real_name);

  // 5. 生成建议
  const recommendations = [];
  if (communicationScore < 50) {
    recommendations.push("💬 需要激活团队沟通（考虑采用异步站会）");
  }
  if (sentimentScore < 50) {
    recommendations.push("😟 团队士气下降迹象（建议1对1会议）");
  }
  if (engagementScore < 70) {
    recommendations.push("📢 需要提高参与度（考虑团队活动或AMA环节）");
  }
  if (isolationRisk.length > 0) {
    recommendations.push(`⚠️ ${isolationRisk.length}人有隔离风险（需要个别确认）`);
  }

  return {
    communicationScore: Math.round(communicationScore),
    sentimentScore: Math.round(sentimentScore),
    engagementScore: Math.round(engagementScore),
    isolationRisk,
    recommendations
  };
}

// 自动干预系统
async function autoIntervention(healthMetrics: TeamHealthMetrics) {
  // 向有隔离风险的用户自动发送DM
  for (const userName of healthMetrics.isolationRisk) {
    const user = (await slack_list_users()).members.find(
      u => u.real_name === userName
    );

    if (user) {
      await slack_post_message({
        channel: user.id, // DM
        text: `
👋 您好 ${userName}!

最近似乎在团队频道中没有看到您的活动,特此问候。

如果需要帮助或想分享任何内容,请随时告知。

- 团队负责人敬上
        `
      });
    }
  }

  // 发送周度Team Health报告
  await slack_post_message({
    channel: "C_LEADERSHIP",
    text: `
💚 <strong>Team Health报告</strong>

<strong>综合指标</strong>:
- 沟通: ${healthMetrics.communicationScore}/100
- 团队士气: ${healthMetrics.sentimentScore}/100
- 参与度: ${healthMetrics.engagementScore}/100

<strong>需要注意</strong>:
${healthMetrics.isolationRisk.length > 0
  ? `- 有隔离风险的用户: ${healthMetrics.isolationRisk.length}人`
  : '- 无'}

<strong>推荐行动</strong>:
${healthMetrics.recommendations.map(r => `- ${r}`).join('\n')}
    `
  });
}

// 每天午夜运行
cron.schedule('0 0 * * *', async () => {
  const health = await calculateTeamHealth();
  await autoIntervention(health);
});
```

<strong>业务影响</strong>:
- 员工流失率 18% → 7%（减少61%）
- 团队满意度评分 6.8/10 → 8.9/10
- 100%实现隔离风险早期检测和干预

## 可能的和不可能的

了解Slack MCP的能力和限制非常重要。

### Slack MCP可以做什么

✅ <strong>消息数据分析</strong>: 历史记录、情感、趋势分析
✅ <strong>自动响应和通知</strong>: 响应特定关键词或条件
✅ <strong>线程管理</strong>: 创建、回复、跟踪线程
✅ <strong>表情自动化</strong>: 有条件地添加反应
✅ <strong>用户行为分析</strong>: 测量参与度、影响力
✅ <strong>频道监控</strong>: 实时事件检测
✅ <strong>跨频道分析</strong>: 综合分析多个频道的数据

### Slack MCP不能做什么

❌ <strong>文件下载/上传</strong>: 当前MCP不支持文件API
  - <strong>替代方案</strong>: 直接使用Slack Web API（`files.upload`、`files.info`）

❌ <strong>实时WebSocket连接</strong>: MCP使用轮询方式
  - <strong>替代方案</strong>: 使用Slack Events API + Webhooks

❌ <strong>用户权限管理</strong>: Admin API在MCP范围之外
  - <strong>替代方案</strong>: 直接调用Slack Admin API

❌ <strong>消息编辑/删除</strong>: 当前版本不支持
  - <strong>替代方案</strong>: 直接使用`chat.update`、`chat.delete` API

❌ <strong>工作流构建器集成</strong>: MCP无法触发工作流
  - <strong>替代方案</strong>: 使用Zapier、Make.com等iPaaS

## 限制和最佳实践

有效使用Slack MCP的指南。

### Rate Limit管理

Slack API应用以下速率限制:

| API方法 | Tier 1 | Tier 2 | Tier 3 |
|-----------|--------|--------|--------|
| `conversations.history` | 1次/分钟 | 20次/分钟 | 50次/分钟 |
| `chat.postMessage` | 1次/秒 | 20次/分钟 | 50次/分钟 |
| `search.messages` | 20次/分钟 | - | - |

<strong>批处理策略</strong>:

```typescript
// 考虑速率限制的批处理
async function fetchAllChannelHistory(channelIds: string[]) {
  const results = [];
  const batchSize = 5; // 限制并发请求数

  for (let i = 0; i < channelIds.length; i += batchSize) {
    const batch = channelIds.slice(i, i + batchSize);

    const batchResults = await Promise.all(
      batch.map(id =>
        slack_conversations_history({ channel: id, limit: 100 })
          .catch(err => {
            console.error(`频道${id}失败:`, err);
            return { messages: [] };
          })
      )
    );

    results.push(...batchResults);

    // 应对速率限制: 批次间等待
    if (i + batchSize < channelIds.length) {
      await new Promise(resolve => setTimeout(resolve, 3000)); // 等待3秒
    }
  }

  return results;
}
```

<strong>缓存实现</strong>:

```typescript
// 简单的内存缓存
const cache = new Map<string, { data: any; expiry: number }>();

async function cachedSlackCall(
  key: string,
  fetchFn: () => Promise<any>,
  ttl: number = 300000 // 5分钟
) {
  const cached = cache.get(key);

  if (cached && cached.expiry > Date.now()) {
    console.log(`缓存命中: ${key}`);
    return cached.data;
  }

  console.log(`缓存未命中: ${key}`);
  const data = await fetchFn();
  cache.set(key, { data, expiry: Date.now() + ttl });

  return data;
}

// 使用示例
const channels = await cachedSlackCall(
  'channels:list',
  () => slack_list_channels({ limit: 1000 }),
  600000 // 10分钟缓存
);
```

### 安全考虑

<strong>API密钥管理</strong>:

```bash
# 使用.env文件（绝对不要提交到Git）
SLACK_BOT_TOKEN=xoxb-your-token-here
SLACK_SIGNING_SECRET=your-signing-secret

# 添加到.gitignore
echo ".env" >> .gitignore
echo ".claude/settings.local.json" >> .gitignore
```

<strong>最小权限原则</strong>:

```typescript
// 仅请求所需的最小权限
const minimalScopes = [
  'channels:history',  // 仅公开频道
  'channels:read',
  'users:read'
  // 不包括'groups:history'（不需要私有频道时）
  // 不包括'chat:write'（仅读取分析）
];
```

<strong>PII数据保护</strong>:

```typescript
// 个人信息掩码
function maskPII(text: string): string {
  return text
    .replace(/\b[\w\.-]+@[\w\.-]+\.\w+\b/g, '[EMAIL]') // 邮箱
    .replace(/\b\d{3}-\d{4}-\d{4}\b/g, '[PHONE]')      // 电话号码
    .replace(/\b\d{6}-\d{7}\b/g, '[ID]');              // 身份证号
}

// 分析前移除PII
const sanitizedMessages = messages.map(m => ({
  ...m,
  text: maskPII(m.text)
}));
```

### 性能优化

<strong>分页策略</strong>:

```typescript
// 使用基于游标的分页有效查询大量数据
async function fetchAllMessages(channelId: string) {
  const allMessages = [];
  let cursor: string | undefined;
  let hasMore = true;

  while (hasMore) {
    const response = await slack_conversations_history({
      channel: channelId,
      limit: 1000,
      cursor
    });

    allMessages.push(...response.messages);

    hasMore = response.has_more;
    cursor = response.response_metadata?.next_cursor;

    // 内存效率: 建议对超过1万条数据进行流式处理
    if (allMessages.length > 10000) {
      console.warn("检测到大量数据。请考虑流式处理。");
      break;
    }
  }

  return allMessages;
}
```

<strong>并行处理</strong>:

```typescript
// 使用Promise.all进行并行数据获取
async function analyzeMultipleChannels(channelIds: string[]) {
  const analysisPromises = channelIds.map(async (id) => {
    const messages = await slack_conversations_history({
      channel: id,
      limit: 100
    });

    return {
      channelId: id,
      messageCount: messages.messages.length,
      sentiment: await analyzeSentiment(messages.messages)
    };
  });

  return Promise.all(analysisPromises);
}
```

<strong>智能数据获取</strong>:

```typescript
// 仅选择性获取所需数据
async function fetchRecentActivity(channelId: string, hours: number = 24) {
  const since = Math.floor(Date.now() / 1000) - (hours * 3600);

  return slack_conversations_history({
    channel: channelId,
    oldest: since.toString(),
    limit: 100 // 仅需要最近的数据,所以设限制
  });
}
```

### 隐私保护和合规性

<strong>GDPR合规</strong>:

```typescript
// 处理用户数据删除请求
async function handleDataDeletionRequest(userId: string) {
  console.log(`处理用户数据删除: ${userId}`);

  // 1. 从本地缓存删除用户数据
  cache.forEach((value, key) => {
    if (key.includes(userId)) {
      cache.delete(key);
    }
  });

  // 2. 在分析报告中将用户匿名化
  // （实际上在数据库中处理）

  // 3. 记录审计日志
  await logAuditEvent({
    type: 'DATA_DELETION',
    userId,
    timestamp: new Date(),
    status: 'COMPLETED'
  });
}
```

<strong>审计日志</strong>:

```typescript
// 记录所有API调用
async function auditedSlackCall(
  method: string,
  params: any,
  executor: string
) {
  const startTime = Date.now();

  try {
    const result = await executeSlackMethod(method, params);

    await logAuditEvent({
      method,
      params: sanitizeParams(params), // 删除敏感信息
      executor,
      duration: Date.now() - startTime,
      status: 'SUCCESS'
    });

    return result;
  } catch (error) {
    await logAuditEvent({
      method,
      params: sanitizeParams(params),
      executor,
      duration: Date.now() - startTime,
      status: 'FAILED',
      error: error.message
    });

    throw error;
  }
}

function sanitizeParams(params: any) {
  const { token, ...safeParams } = params;
  return safeParams; // 删除令牌
}
```

<strong>工作区透明度</strong>:

```typescript
// 自动发送数据收集通知
async function notifyDataCollection() {
  await slack_post_message({
    channel: "C_GENERAL",
    text: `
📊 <strong>数据收集通知</strong>

为改善团队沟通,将收集以下数据:
- 消息量和时间
- 表情反应模式
- 线程参与度

<strong>隐私保护</strong>:
- 消息内容将匿名化分析
- 个人识别信息(PII)将自动掩码
- 数据将在30天后自动删除

如有疑问或顾虑,请联系@admin。
    `
  });
}
```

## 高级功能

### 多MCP集成

通过连接多个MCP服务器,可以构建强大的自动化工作流。

<strong>Slack + GitHub + Postgres示例</strong>:

```typescript
// 自动化部署流程
async function automatedDeploymentWorkflow() {
  // 1. 从GitHub检测最近的PR合并事件
  const recentMerges = await github_list_recent_merges({
    repo: 'mycompany/backend',
    since: '1 hour ago'
  });

  for (const merge of recentMerges) {
    // 2. 在Postgres中保存部署记录
    await postgres_query(`
      INSERT INTO deployments (pr_number, merged_by, merged_at)
      VALUES ($1, $2, $3)
    `, [merge.number, merge.merged_by, merge.merged_at]);

    // 3. 在Slack发送部署通知
    await slack_post_message({
      channel: 'C_ENGINEERING',
      text: `
🚀 <strong>开始部署</strong>

- PR #${merge.number}: ${merge.title}
- 合并人: @${merge.merged_by}
- 变更文件: ${merge.changed_files}个

请在<https://deploy.example.com/${merge.number}|这里>查看部署进度。
      `
    });

    // 4. 部署完成后在线程中更新
    setTimeout(async () => {
      const deployment = await checkDeploymentStatus(merge.number);

      await slack_reply_to_thread({
        channel: 'C_ENGINEERING',
        thread_ts: originalMessage.ts,
        text: deployment.success
          ? '✅ 部署完成! 已反映到生产环境。'
          : '❌ 部署失败。正在进行回滚。'
      });
    }, 5 * 60 * 1000); // 5分钟后确认
  }
}
```

<strong>实时DevOps通知</strong>:

```typescript
// 检测错误并自动通知
async function monitorProductionErrors() {
  // 1. 从Postgres查询最近的错误日志
  const errors = await postgres_query(`
    SELECT error_type, COUNT(*) as count, MAX(occurred_at) as last_seen
    FROM error_logs
    WHERE occurred_at > NOW() - INTERVAL '5 minutes'
    GROUP BY error_type
    HAVING COUNT(*) > 10
  `);

  if (errors.rows.length > 0) {
    // 2. 按严重程度在Slack发送通知
    for (const error of errors.rows) {
      const severity = error.count > 50 ? '🔴 Critical' : '🟡 Warning';

      await slack_post_message({
        channel: 'C_ONCALL',
        text: `
${severity} <strong>生产环境错误激增</strong>

- 错误类型: \`${error.error_type}\`
- 发生次数: ${error.count}次（最近5分钟）
- 最后发生: ${error.last_seen}

<https://logs.example.com/search?q=${error.error_type}|查看日志>
        `
      });
    }

    // 3. 在GitHub自动创建问题
    await github_create_issue({
      repo: 'mycompany/backend',
      title: `[Auto] Production errors: ${errors.rows[0].error_type}`,
      body: `Automatically created from production monitoring.\n\nSee Slack for details.`,
      labels: ['bug', 'production', 'auto-generated']
    });
  }
}

// 每5分钟运行一次
setInterval(monitorProductionErrors, 5 * 60 * 1000);
```

### 基于AI的洞察生成

利用Claude AI进行高级分析和预测。

<strong>周报自动化</strong>:

```typescript
// 生成全面的周度团队报告
async function generateWeeklyReport() {
  // 1. 数据收集
  const channels = await slack_list_channels({ limit: 100 });
  const users = await slack_list_users();

  const weekData = await Promise.all(
    channels.channels.map(async (ch) => {
      const messages = await slack_conversations_history({
        channel: ch.id,
        oldest: (Math.floor(Date.now() / 1000) - 7 * 24 * 60 * 60).toString(),
        limit: 1000
      });

      return {
        channel: ch.name,
        messageCount: messages.messages.length,
        participants: new Set(messages.messages.map(m => m.user)).size,
        sentiment: await analyzeSentiment(messages.messages)
      };
    })
  );

  // 2. 向Claude请求综合分析
  const prompt = `
以下是上周团队沟通数据:

${JSON.stringify(weekData, null, 2)}

请从以下角度提供综合分析:
1. 整体团队活动水平（增加/减少趋势）
2. 各频道的主要特征和问题
3. 团队士气和情感分析
4. 需要注意的领域
5. 下周推荐行动

分析应清晰简洁,便于管理层理解。
`;

  const analysis = await callClaudeAPI(prompt);

  // 3. 生成可视化数据
  const chartData = generateChartData(weekData);

  // 4. 在Slack发送报告
  await slack_post_message({
    channel: 'C_LEADERSHIP',
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '📊 周度团队沟通报告'
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: analysis
        }
      },
      {
        type: 'image',
        image_url: chartData.url,
        alt_text: '周度趋势图'
      }
    ]
  });
}

// 每周一上午9点运行
cron.schedule('0 9 * * 1', generateWeeklyReport);
```

<strong>趋势预测</strong>:

```typescript
// 预测未来团队活动趋势
async function predictTrends() {
  // 收集过去4周数据
  const historicalData = [];

  for (let week = 0; week < 4; week++) {
    const weekStart = Math.floor(Date.now() / 1000) - ((week + 1) * 7 * 24 * 60 * 60);
    const weekEnd = Math.floor(Date.now() / 1000) - (week * 7 * 24 * 60 * 60);

    const messages = await slack_conversations_history({
      channel: 'C_GENERAL',
      oldest: weekStart.toString(),
      latest: weekEnd.toString(),
      limit: 1000
    });

    historicalData.push({
      week: week + 1,
      messageCount: messages.messages.length,
      sentiment: await analyzeSentiment(messages.messages)
    });
  }

  // 向Claude请求预测
  const prompt = `
以下是过去4周的团队沟通数据:

${JSON.stringify(historicalData.reverse(), null, 2)}

基于这些数据:
1. 预测下周消息量（范围）
2. 预测情感趋势
3. 需要注意的信号
4. 预防性应对方案

请提供预测的可信度和依据。
`;

  const prediction = await callClaudeAPI(prompt);

  return prediction;
}
```

<strong>行动项目提取</strong>:

```typescript
// 从会议记录中自动提取和分配行动项目
async function extractAndAssignActions(threadTs: string, channelId: string) {
  // 1. 获取整个线程内容
  const thread = await slack_get_thread_replies({
    channel: channelId,
    thread_ts: threadTs
  });

  const transcript = thread
    .map(m => `${m.user}: ${m.text}`)
    .join('\n');

  // 2. 向Claude请求提取行动项目
  const prompt = `
请从以下会议对话中提取行动项目:

${transcript}

对于每个行动项目:
- 任务内容
- 负责人（如有指定）
- 截止日期（如有指定）
- 优先级（紧急/高/中/低）

请以JSON格式返回。
`;

  const response = await callClaudeAPI(prompt);
  const actionItems = JSON.parse(response);

  // 3. 将每个行动项目作为清单添加到线程
  const checklistText = actionItems
    .map((item, i) => `
${i + 1}. [ ] ${item.task}
   - 负责: ${item.assignee || '未指定'}
   - 截止: ${item.deadline || '待定'}
   - 优先级: ${item.priority}
    `)
    .join('\n');

  await slack_reply_to_thread({
    channel: channelId,
    thread_ts: threadTs,
    text: `
📝 <strong>行动项目摘要</strong>

${checklistText}

✅ 完成时请在此消息上添加复选标记表情。
    `
  });

  // 4. 向负责人发送单独的DM通知
  const users = await slack_list_users();

  for (const item of actionItems) {
    if (item.assignee) {
      const assignee = users.members.find(
        u => u.real_name.includes(item.assignee)
      );

      if (assignee) {
        await slack_post_message({
          channel: assignee.id,
          text: `
📌 <strong>新行动项目</strong>

任务: ${item.task}
截止: ${item.deadline || '待定'}
优先级: ${item.priority}

原始对话: <slack://channel?team=T01234567&id=${channelId}&thread_ts=${threadTs}|转到线程>
          `
        });
      }
    }
  }
}
```

## 结论

Slack MCP从根本上改变了利用团队沟通数据的方式。代替传统的手动数据收集和分析,现在可以进行基于AI的自动化洞察生成。

<strong>关键要点总结</strong>:

1. <strong>安装简便</strong>: 可以从3种安装选项中选择适合情况的方法
2. <strong>8种核心工具</strong>: 消息查询、发送、搜索、反应等全面功能
3. <strong>高级分析</strong>: 情感分析、参与度测量、趋势预测
4. <strong>实战验证</strong>: Salesforce、初创企业、全球企业的成功案例
5. <strong>可扩展</strong>: 可与GitHub、Postgres等其他MCP集成

<strong>Slack MCP的价值主张</strong>:

- ⏱️ <strong>节省时间</strong>: 手动数据分析工作减少90%以上
- 📊 <strong>更好的决策</strong>: 实时团队健康度监控
- 🤖 <strong>自动化</strong>: AI代替处理重复任务
- 💡 <strong>洞察</strong>: 早期发现隐藏模式和风险
- 🔒 <strong>安全性</strong>: 标准OAuth和权限管理

<strong>入门分步指南</strong>:

1. <strong>建立基础</strong>（第1天）
   - 创建Slack App并设置权限
   - 安装MCP服务器（推荐官方TypeScript服务器）
   - 确认Claude Code集成

2. <strong>探索和学习</strong>（第2〜3天）
   - 测试8种核心工具
   - 在团队频道进行简单数据查询
   - 运行基本统计分析

3. <strong>构建第一个自动化</strong>（第4〜7天）
   - 专注于解决特定问题（例如: 测量客户支持响应时间）
   - 设置简单的自动通知
   - 自动化周报

4. <strong>扩展高级功能</strong>（第2周之后）
   - 添加基于Claude AI的情感分析
   - 与其他MCP服务器集成（GitHub、Postgres）
   - 构建团队健康度监控系统

5. <strong>优化和推广</strong>（1个月之后）
   - 性能优化（缓存、批处理）
   - 扩展到其他团队
   - 开发自定义代理

<strong>下一步学习资源</strong>:

- 官方文档: [Model Context Protocol Docs](https://modelcontextprotocol.io/)
- Slack MCP仓库: [GitHub - modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers/tree/main/src/slack)
- Anthropic工程博客: [Claude Code Best Practices](https://www.anthropic.com/engineering/claude-code-best-practices)

## 参考资料

### 官方文档

1. [Model Context Protocol官方网站](https://modelcontextprotocol.io/)
   - MCP协议规范和设计理念

2. [Slack API文档](https://api.slack.com/docs)
   - OAuth作用域、速率限制、API方法详细说明

3. [Slack MCP服务器GitHub](https://github.com/modelcontextprotocol/servers/tree/main/src/slack)
   - 源代码、问题跟踪器、贡献指南

4. [Anthropic MCP SDK](https://github.com/anthropics/anthropic-sdk-typescript)
   - 使用TypeScript开发自定义MCP服务器

5. [Claude Code文档](https://docs.claude.com/claude-code)
   - Claude Code设置和子代理使用方法

### 开源资源

1. [awesome-mcp](https://github.com/punkpeye/awesome-mcp)
   - 精选的MCP服务器、工具、教程列表

2. [mcp-slack-analytics](https://github.com/example/mcp-slack-analytics)
   - Slack数据分析示例代码集合（虚拟链接）

3. [slack-data-science](https://github.com/example/slack-data-science)
   - 使用Pandas、Matplotlib进行Slack数据可视化（虚拟链接）

### 社区和视频教程

1. [MCP Discord社区](https://discord.gg/mcp)（虚拟链接）
   - 提问、分享最佳实践、问题解决

2. [YouTube: Building AI Agents with MCP](https://youtube.com/watch?v=example)
   - Slack MCP实战演示（虚拟链接）

3. [Slack Community Forums](https://community.slack.com/)
   - 官方Slack社区、API相关讨论

---

现在您已经准备好使用Slack MCP来分析团队沟通数据并构建基于AI的自动化。从小处开始,逐步扩展,希望您能发现适合您团队的独特洞察。

如有任何问题或反馈,请随时在评论中留言。让我们一起打造更好的团队协作文化! 🚀
