---
title: 使用Google Analytics MCP与AI代理自动化博客分析
description: '了解如何利用MCP和AI代理自动化博客分析,实现数据驱动的决策制定'
pubDate: '2025-10-05'
heroImage: ../../../assets/blog/google-analytics-mcp-hero.png
tags:
  - Analytics
  - MCP
  - Automation
relatedPosts:
  - slug: specification-driven-development
    score: 0.94
    reason:
      ko: '자동화, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, architecture with comparable
        difficulty.
      zh: 在自动化、AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: ai-content-recommendation-system
    score: 0.93
    reason:
      ko: '자동화, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, architecture with comparable
        difficulty.
      zh: 在自动化、AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: ai-agent-notion-mcp-automation
    score: 0.92
    reason:
      ko: '선행 학습 자료로 유용하며, 자동화, AI/ML, 아키텍처 기초를 다룹니다.'
      ja: 事前学習資料として有用であり、自動化、AI/ML、アーキテクチャの基礎を扱います。
      en: >-
        Useful as prerequisite knowledge, covering automation, AI/ML,
        architecture fundamentals.
      zh: 作为先修知识很有用，涵盖自动化、AI/ML、架构基础。
  - slug: metadata-based-recommendation-optimization
    score: 0.92
    reason:
      ko: '자동화, AI/ML, DevOps, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、DevOps、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, DevOps, architecture with
        comparable difficulty.
      zh: 在自动化、AI/ML、DevOps、架构领域涵盖类似主题，难度相当。
  - slug: llm-blog-automation
    score: 0.91
    reason:
      ko: '선행 학습 자료로 유용하며, 자동화, AI/ML, 아키텍처 기초를 다룹니다.'
      ja: 事前学習資料として有用であり、自動化、AI/ML、アーキテクチャの基礎を扱います。
      en: >-
        Useful as prerequisite knowledge, covering automation, AI/ML,
        architecture fundamentals.
      zh: 作为先修知识很有用，涵盖自动化、AI/ML、架构基础。
---

# 使用Google Analytics MCP与AI代理自动化博客分析

运营博客时最想知道的就是"我的内容有多少人在阅读?"。Google Analytics是一个强大的工具,但每次都要登录仪表板查看和分析数据是件麻烦事。本文将介绍如何利用<strong>模型上下文协议 (Model Context Protocol, MCP)</strong>和<strong>AI代理 (AI Agent)</strong>来完全自动化博客分析。

本指南将分步骤说明应用于实际运营博客的分析自动化系统,并提供可立即使用的代码和查询示例。

## 为什么需要博客分析自动化?

### 传统方式的局限性

Google Analytics仪表板提供了大量数据,但要获得真正需要的洞察需要经过多个步骤:

1. <strong>手动数据收集</strong>: 需要登录仪表板找到想要的指标
2. <strong>复杂的查询编写</strong>: 要创建自定义报告需要理解GA复杂的界面
3. <strong>重复性工作</strong>: 每次制作周报/月报都要重复相同的操作
4. <strong>缺乏洞察</strong>: 能看到数字,但没有"那么应该做什么?"的答案

### MCP与AI代理提出的解决方案

<strong>模型上下文协议 (MCP)</strong>是一个标准协议,使AI能够与外部数据源通信。使用Google Analytics MCP可以:

- <strong>自然语言提问</strong>: 问"上周最受欢迎的文章是什么?"立即得到答案
- <strong>自动化分析</strong>: AI代理定期分析数据并生成报告
- <strong>可执行洞察</strong>: 不仅是简单的数字,还能建议"接下来应该写什么"

## 什么是Google Analytics MCP?

### MCP的工作原理

MCP是AI模型与数据源之间的标准化通信协议。类似于API,但专门设计为AI可以直接理解和利用。

```
┌─────────────┐      MCP Protocol      ┌──────────────────┐
│             │ ◄──────────────────── ► │                  │
│  AI Agent   │                         │  Google Analytics│
│  (Claude)   │                         │      MCP         │
│             │                         │                  │
└─────────────┘                         └──────────────────┘
```

### Google Analytics MCP的功能

Google Analytics MCP提供以下功能:

- <strong>报告查询</strong>: 通过GA4的Data API查询各种指标和维度
- <strong>实时数据</strong>: 实时访客数、事件跟踪
- <strong>自定义查询</strong>: 用自然语言请求复杂的筛选和细分
- <strong>自动分析</strong>: AI执行趋势分析、比较分析等

## 安装和设置方法

### 1. 安装Google Analytics MCP

首先安装Google Analytics MCP服务器。这是一个可通过npx运行的独立服务器。

```bash
# MCP服务器无需单独安装
# 只需添加到Claude Desktop或Claude Code的配置文件即可
```

### 2. 设置Google Cloud项目

要使用Google Analytics API需要Google Cloud项目:

<strong>分步设置:</strong>

1. 访问[Google Cloud Console](https://console.cloud.google.com)
2. 创建新项目或选择现有项目
3. 启用Google Analytics Data API
4. 创建服务账号并下载密钥

```bash
# 使用Google Cloud CLI自动设置的方法
gcloud services enable analyticsdata.googleapis.com

# 创建服务账号
gcloud iam service-accounts create ga-mcp-reader \
  --display-name="Google Analytics MCP Reader"

# 生成密钥文件(保存到credentials文件夹)
gcloud iam service-accounts keys create ~/credentials/ga-credentials.json \
  --iam-account=ga-mcp-reader@PROJECT_ID.iam.gserviceaccount.com
```

<strong>重要</strong>: 将`PROJECT_ID`替换为实际的Google Cloud项目ID。

### 3. 设置Google Analytics权限

授予服务账号GA4属性读取权限:

1. GA4属性 → 管理员 → 属性访问管理
2. 点击右上角"+"按钮
3. 输入服务账号邮箱地址(例: `ga-mcp-reader@PROJECT_ID.iam.gserviceaccount.com`)
4. 角色: 选择<strong>查看者 (Viewer)</strong>
5. 点击添加

<strong>安全提示</strong>: 仅授予只读权限以防止数据更改。

### 3. 配置Claude Code MCP

在项目根目录创建或修改`.mcp.json`文件:

```json
{
  "mcpServers": {
    "analytics-mcp": {
      "command": "npx",
      "args": ["-y", "@upenn-libraries/google-analytics-mcp"],
      "env": {
        "GOOGLE_APPLICATION_CREDENTIALS": "/path/to/your/ga-credentials.json"
      }
    }
  }
}
```

<strong>重要</strong>: 将`GOOGLE_APPLICATION_CREDENTIALS`路径更改为实际的服务账号密钥文件路径。

<strong>安全注意事项</strong>:

```bash
# 必须将credentials文件夹添加到.gitignore
echo "credentials/" >> .gitignore
echo "*.json" >> .gitignore
```

### 4. 确认设置

重启Claude Code并确认MCP连接:

```bash
# 在Claude Code中使用以下命令测试
"显示Google Analytics账号信息"
```

成功后将显示属性ID、属性名称等。

## 8个可立即使用的查询

设置完成后可以立即执行以下查询。这些是获取实际博客运营所需核心洞察的查询。

### 1. 实时活动状态

<strong>确认此刻博客上正在发生什么:</strong>

```javascript
mcp__analytics -
  mcp__run_realtime_report({
    property_id: 395101361, // 更改为您的属性ID
    dimensions: ["unifiedScreenName", "country"],
    metrics: ["activeUsers"],
  });
```

<strong>可获得的信息:</strong>

- 当前在线用户数
- 正在查看哪个页面
- 从哪个国家访问

### 2. 过去7天表现摘要

<strong>了解每周流量趋势:</strong>

```javascript
mcp__analytics -
  mcp__run_report({
    property_id: 395101361,
    date_ranges: [{ start_date: "7daysAgo", end_date: "today" }],
    dimensions: ["date"],
    metrics: [
      "activeUsers",
      "sessions",
      "screenPageViews",
      "averageSessionDuration",
    ],
    order_bys: [
      { dimension: { dimension_name: "date", order_type: 1 }, desc: true },
    ],
  });
```

<strong>使用方法:</strong>

- 确认每日流量变化趋势
- 分析星期几的模式(周末 vs 工作日)
- 计算与上周相比的增长率

### 3. 热门内容Top 10(最近30天)

<strong>确认哪些文章阅读量最多:</strong>

```javascript
mcp__analytics -
  mcp__run_report({
    property_id: 395101361,
    date_ranges: [{ start_date: "30daysAgo", end_date: "today" }],
    dimensions: ["pagePath", "pageTitle"],
    metrics: ["screenPageViews", "activeUsers", "userEngagementDuration"],
    dimension_filter: {
      filter: {
        field_name: "pagePath",
        string_filter: {
          match_type: 2, // CONTAINS
          value: "/blog/",
          case_sensitive: false,
        },
      },
    },
    order_bys: [{ metric: { metric_name: "screenPageViews" }, desc: true }],
    limit: 10,
  });
```

<strong>洞察:</strong>

- 分析Top 10文章 → 扩展类似主题的内容
- 平均参与时间长的文章 → 质量基准
- 排名低于预期的文章 → 需要SEO优化

### 4. 流量来源分析

<strong>了解访客从哪里来:</strong>

```javascript
mcp__analytics -
  mcp__run_report({
    property_id: 395101361,
    date_ranges: [{ start_date: "30daysAgo", end_date: "today" }],
    dimensions: ["sessionDefaultChannelGroup", "sessionSource"],
    metrics: ["sessions", "activeUsers", "bounceRate"],
    order_bys: [{ metric: { metric_name: "sessions" }, desc: true }],
    limit: 20,
  });
```

<strong>制定策略:</strong>

- Organic Search比例 → 衡量SEO效果
- Social流量 → 哪个平台有效
- Direct流量 → 品牌认知度指标
- Referral → 反向链接效果分析

### 5. 地区读者分布

<strong>确认全球覆盖范围:</strong>

```javascript
mcp__analytics -
  mcp__run_report({
    property_id: 395101361,
    date_ranges: [{ start_date: "30daysAgo", end_date: "today" }],
    dimensions: ["country", "city"],
    metrics: ["activeUsers", "sessions"],
    order_bys: [{ metric: { metric_name: "activeUsers" }, desc: true }],
    limit: 20,
  });
```

<strong>多语言博客策略:</strong>

- 中文内容 → 确认中国读者比例
- 英文内容 → 分析美国、印度、欧洲读者
- 日文内容 → 衡量日本读者反应

### 6. 设备与浏览器状况

<strong>了解用户环境:</strong>

```javascript
mcp__analytics -
  mcp__run_report({
    property_id: 395101361,
    date_ranges: [{ start_date: "30daysAgo", end_date: "today" }],
    dimensions: ["deviceCategory", "browser"],
    metrics: ["sessions", "bounceRate", "averageSessionDuration"],
    order_bys: [{ metric: { metric_name: "sessions" }, desc: true }],
  });
```

<strong>UX优化:</strong>

- 移动端比例50%以上 → 优先移动端优化
- 特定浏览器跳出率高 → 检查兼容性问题
- 桌面端停留时间长 → 强化深度内容

### 7. 新访客 vs 回访读者

<strong>确认是否建立了忠诚读者群:</strong>

```javascript
mcp__analytics -
  mcp__run_report({
    property_id: 395101361,
    date_ranges: [{ start_date: "30daysAgo", end_date: "today" }],
    dimensions: ["newVsReturning"],
    metrics: [
      "activeUsers",
      "sessions",
      "screenPageViews",
      "averageSessionDuration",
    ],
  });
```

<strong>目标设定:</strong>

- 新读者比例60〜70% → 正在增长
- 回访读者30〜40% → 忠诚度良好
- 回访读者每会话页面浏览量高 → 内容探索活跃

### 8. 着陆页分析

<strong>优化首次进入点:</strong>

```javascript
mcp__analytics -
  mcp__run_report({
    property_id: 395101361,
    date_ranges: [{ start_date: "30daysAgo", end_date: "today" }],
    dimensions: ["landingPage"],
    metrics: ["sessions", "bounceRate", "averageSessionDuration"],
    order_bys: [{ metric: { metric_name: "sessions" }, desc: true }],
    limit: 15,
  });
```

<strong>SEO洞察:</strong>

- 搜索流入多的着陆页 → 关键词分析
- 跳出率高的着陆页 → 怀疑内容-标题不匹配
- 停留时间长的着陆页 → 添加相关文章内部链接

<strong>提示</strong>: 将每个查询的`property_id`更改为您的GA4属性ID。可以在GA4管理员页面确认。

## 构建基于AI代理的分析系统

### 设计Analytics代理

让我们为博客分析创建一个专门的AI代理。创建`.claude/agents/analytics.md`文件:

```markdown
# Analytics Agent

You are a data analyst specialized in blog analytics.

## Your Role

Analyze Google Analytics data for the blog and provide:

- Traffic trends and patterns
- Content performance insights
- Audience behavior analysis
- Actionable recommendations

## Key Metrics to Track

1. **Traffic Metrics**

   - Total users, sessions, pageviews
   - New vs returning users
   - Traffic sources (organic, direct, referral, social)

2. **Content Performance**

   - Top performing posts (by pageviews, engagement)
   - Average time on page
   - Bounce rate by content type

3. **Audience Insights**
   - Geographic distribution
   - Device breakdown (mobile, desktop, tablet)
   - User journey and navigation paths

## Analysis Framework

When analyzing data:

1. Identify trends (week-over-week, month-over-month)
2. Find anomalies or interesting patterns
3. Compare against benchmarks or goals
4. Provide specific, actionable recommendations

## Report Format

Always structure reports as:

- **Executive Summary**: Key findings in 2-3 sentences
- **Metrics Overview**: Numbers with context
- **Insights**: What the data tells us
- **Action Items**: What to do next
```

### 生成自动化报告

现在可以利用这个代理生成自动报告。例如:

<strong>问题</strong>: "分析过去7天的博客流量并提供洞察"

<strong>AI响应示例</strong>:

```
## 周流量分析报告 (2025年10月28日〜11月3日)

### 执行摘要
上周总访客数为1,234人,比前一周增长23%。
特别是"Google Analytics MCP"相关文章急速上升,带动了有机流量。

### 指标概览
- **总用户**: 1,234 (↑23% vs 前一周)
- **会话**: 1,567 (↑18%)
- **页面浏览**: 3,456 (↑31%)
- **平均会话时长**: 2分34秒 (↑12%)
- **跳出率**: 45% (↓5%p)

### 主要流量来源
1. Organic Search: 58% (主要来自Google)
2. Direct: 25%
3. Social: 12% (Twitter主导)
4. Referral: 5%

### 表现最佳的文章
1. "Google Analytics MCP指南" - 456次浏览(新文章)
2. "创建Astro博客" - 234次浏览
3. "AI代理使用方法" - 189次浏览

### 洞察
✅ MCP相关内容受到高度关注 - 确认SEO效果
✅ 平均会话时间增加 - 内容质量改善效果
⚠️ 移动端流量增加中(42%) - 需要改善移动端UX

### 行动项目
1. 制作MCP系列内容(确认高需求)
2. 为移动端用户优化布局
3. 在热门文章中添加相关文章链接(增加停留时间)
```

### KPI监控自动化

分享在实际运营环境中使用的自动化脚本。

#### 1. 每日快照脚本

每天早上总结前一天数据的脚本:

```javascript
// scripts/daily-snapshot.js
const { GoogleAnalyticsMCP } = require("@analytics-mcp/client");

async function dailySnapshot() {
  const analytics = new GoogleAnalyticsMCP();
  const propertyId = 395101361; // 更改为您的属性ID

  try {
    // 1. 实时状况
    const realtime = await analytics.runRealtimeReport({
      property_id: propertyId,
      dimensions: ["unifiedScreenName"],
      metrics: ["activeUsers"],
    });

    // 2. 今天 vs 昨天比较
    const comparison = await analytics.runReport({
      property_id: propertyId,
      date_ranges: [
        { start_date: "today", end_date: "today", name: "Today" },
        { start_date: "yesterday", end_date: "yesterday", name: "Yesterday" },
      ],
      dimensions: [],
      metrics: ["activeUsers", "sessions", "screenPageViews"],
    });

    // 3. 今天的Top 5页面
    const topPages = await analytics.runReport({
      property_id: propertyId,
      date_ranges: [{ start_date: "today", end_date: "today" }],
      dimensions: ["pagePath", "pageTitle"],
      metrics: ["screenPageViews", "activeUsers"],
      order_bys: [{ metric: { metric_name: "screenPageViews" }, desc: true }],
      limit: 5,
    });

    // 输出结果(可发送到Slack、电子邮件、控制台等)
    console.log(`
📊 每日快照 - ${new Date().toLocaleDateString("zh-CN")}

🔴 实时: ${realtime.rows ? realtime.rows.length : 0}人在线

今天 vs 昨天:
  用户:    ${comparison.rows[0]?.metric_values[0] || 0} (昨天: ${
      comparison.rows[1]?.metric_values[0] || 0
    })
  会话:    ${comparison.rows[0]?.metric_values[1] || 0} (昨天: ${
      comparison.rows[1]?.metric_values[1] || 0
    })
  页面浏览: ${comparison.rows[0]?.metric_values[2] || 0} (昨天: ${
      comparison.rows[1]?.metric_values[2] || 0
    })

🏆 今日Top 5:
${formatTopPages(topPages)}
    `);
  } catch (error) {
    console.error("每日快照失败:", error);
  }
}

function formatTopPages(data) {
  if (!data.rows || data.rows.length === 0) return "暂无数据";
  return data.rows
    .map(
      (row, i) =>
        `${i + 1}. ${row.dimension_values[1]} - ${row.metric_values[0]} 次浏览`
    )
    .join("\n");
}

// 执行
if (require.main === module) {
  dailySnapshot();
}

module.exports = { dailySnapshot };
```

<strong>执行方法:</strong>

```bash
# 手动执行
node scripts/daily-snapshot.js

# 使用Cron每天上午9点自动执行
# 添加到crontab -e:
0 9 * * * cd /path/to/your/blog && node scripts/daily-snapshot.js
```

#### 2. 周报生成器

每周一自动分析上周表现的脚本:

```javascript
// scripts/weekly-report.js
const { GoogleAnalyticsMCP } = require("@analytics-mcp/client");
const fs = require("fs").promises;
const path = require("path");

async function generateWeeklyReport() {
  const analytics = new GoogleAnalyticsMCP();
  const propertyId = 395101361;
  const reportDate = new Date().toISOString().split("T")[0];

  console.log("🔄 正在生成周报...");

  try {
    // 1. 周指标(本周 vs 上周)
    const weeklyMetrics = await analytics.runReport({
      property_id: propertyId,
      date_ranges: [
        { start_date: "7daysAgo", end_date: "yesterday", name: "ThisWeek" },
        { start_date: "14daysAgo", end_date: "8daysAgo", name: "LastWeek" },
      ],
      dimensions: [],
      metrics: [
        "activeUsers",
        "sessions",
        "screenPageViews",
        "averageSessionDuration",
        "bounceRate",
      ],
    });

    // 2. 热门文章Top 5
    const topPosts = await analytics.runReport({
      property_id: propertyId,
      date_ranges: [{ start_date: "7daysAgo", end_date: "yesterday" }],
      dimensions: ["pagePath", "pageTitle"],
      metrics: ["screenPageViews", "activeUsers", "userEngagementDuration"],
      dimension_filter: {
        filter: {
          field_name: "pagePath",
          string_filter: {
            match_type: 2,
            value: "/blog/",
            case_sensitive: false,
          },
        },
      },
      order_bys: [{ metric: { metric_name: "screenPageViews" }, desc: true }],
      limit: 5,
    });

    // 3. 流量来源
    const trafficSources = await analytics.runReport({
      property_id: propertyId,
      date_ranges: [{ start_date: "7daysAgo", end_date: "yesterday" }],
      dimensions: ["sessionDefaultChannelGroup"],
      metrics: ["sessions"],
      order_bys: [{ metric: { metric_name: "sessions" }, desc: true }],
    });

    // 4. 地区分布
    const geography = await analytics.runReport({
      property_id: propertyId,
      date_ranges: [{ start_date: "7daysAgo", end_date: "yesterday" }],
      dimensions: ["country"],
      metrics: ["activeUsers"],
      order_bys: [{ metric: { metric_name: "activeUsers" }, desc: true }],
      limit: 5,
    });

    // 生成Markdown报告
    const report = generateMarkdownReport({
      reportDate,
      weeklyMetrics,
      topPosts,
      trafficSources,
      geography,
    });

    // 保存到reports文件夹
    const reportsDir = path.join(__dirname, "..", "reports");
    await fs.mkdir(reportsDir, { recursive: true });
    const reportPath = path.join(reportsDir, `weekly-${reportDate}.md`);
    await fs.writeFile(reportPath, report);

    console.log(`✅ 报告保存完成: ${reportPath}`);
    return { report, reportPath };
  } catch (error) {
    console.error("❌ 周报生成失败:", error);
    throw error;
  }
}

function generateMarkdownReport(data) {
  const { reportDate, weeklyMetrics, topPosts, trafficSources, geography } =
    data;

  // 解析指标
  const thisWeek = weeklyMetrics.rows?.[0]?.metric_values || [];
  const lastWeek = weeklyMetrics.rows?.[1]?.metric_values || [];

  const metrics = [
    { name: "活跃用户", this: thisWeek[0], last: lastWeek[0] },
    { name: "会话", this: thisWeek[1], last: lastWeek[1] },
    { name: "页面浏览", this: thisWeek[2], last: lastWeek[2] },
    {
      name: "平均会话时长",
      this: formatDuration(thisWeek[3]),
      last: formatDuration(lastWeek[3]),
    },
    {
      name: "跳出率",
      this: formatPercent(thisWeek[4]),
      last: formatPercent(lastWeek[4]),
    },
  ];

  // 计算变化率
  const metricsTable = metrics
    .map((m) => {
      const change = calculateChange(m.this, m.last);
      const arrow = change > 0 ? "↑" : change < 0 ? "↓" : "→";
      return `| ${m.name} | ${m.this} | ${m.last} | ${change}% ${arrow} |`;
    })
    .join("\n");

  // Top文章表格
  const postsTable =
    topPosts.rows
      ?.map((row, i) => {
        const title = row.dimension_values[1].value;
        const views = row.metric_values[0].value;
        const users = row.metric_values[1].value;
        const avgTime = formatDuration(
          row.metric_values[2].value / parseInt(views)
        );
        return `
${i + 1}. **${title}**
   - 浏览量: ${views} | 用户: ${users} | 平均停留: ${avgTime}`;
      })
      .join("\n") || "暂无数据";

  // 流量来源表格
  const sourcesTable =
    trafficSources.rows
      ?.map((row) => {
        const source = row.dimension_values[0].value;
        const sessions = row.metric_values[0].value;
        const total = trafficSources.rows.reduce(
          (sum, r) => sum + parseInt(r.metric_values[0].value),
          0
        );
        const percent = ((parseInt(sessions) / total) * 100).toFixed(1);
        return `| ${source} | ${sessions} | ${percent}% |`;
      })
      .join("\n") || "| 暂无数据 | - | - |";

  // 地区表格
  const geoTable =
    geography.rows
      ?.map((row, i) => {
        const country = row.dimension_values[0].value;
        const users = row.metric_values[0].value;
        const total = geography.rows.reduce(
          (sum, r) => sum + parseInt(r.metric_values[0].value),
          0
        );
        const percent = ((parseInt(users) / total) * 100).toFixed(1);
        return `${i + 1}. ${country} - ${users}人 (${percent}%)`;
      })
      .join("\n") || "暂无数据";

  return `# 周分析报告
**周结束日期:** ${reportDate}
**生成时间:** ${new Date().toISOString()}

## 📊 核心指标(与上周相比)

| 指标 | 本周 | 上周 | 变化 |
|------|------|------|------|
${metricsTable}

## 🏆 Top 5 热门文章
${postsTable}

## 📈 流量来源

| 来源 | 会话 | 比例 |
|------|------|------|
${sourcesTable}

## 🌍 地区分布(Top 5)

${geoTable}

## 💡 主要洞察

[自动生成的洞察 - 可通过AI分析]

## ✅ 下周行动项目

- [ ] 撰写热门文章相关内容
- [ ] 分析流量来源变化
- [ ] [基于数据的具体行动]

---
*使用Google Analytics MCP自动生成*
`;
}

function formatDuration(seconds) {
  if (!seconds || seconds === "0") return "0:00";
  const secs = typeof seconds === "string" ? parseFloat(seconds) : seconds;
  const mins = Math.floor(secs / 60);
  const secs_remainder = Math.floor(secs % 60);
  return `${mins}:${secs_remainder.toString().padStart(2, "0")}`;
}

function formatPercent(value) {
  if (!value) return "0%";
  return `${(parseFloat(value) * 100).toFixed(1)}%`;
}

function calculateChange(current, previous) {
  if (!previous || previous === "0") return 0;
  const curr = parseFloat(current) || 0;
  const prev = parseFloat(previous) || 0;
  return (((curr - prev) / prev) * 100).toFixed(1);
}

// 直接执行时
if (require.main === module) {
  generateWeeklyReport()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { generateWeeklyReport };
```

<strong>Cron设置:</strong>

```bash
# 编辑crontab -e
# 每周一上午9点自动执行
0 9 * * 1 cd /path/to/your/blog && node scripts/weekly-report.js
```

#### 3. 内容表现分析器

分析90天数据以制定内容策略的脚本:

```javascript
// scripts/analyze-content.js
const { GoogleAnalyticsMCP } = require("@analytics-mcp/client");

async function analyzeContentPerformance(daysBack = 90) {
  const analytics = new GoogleAnalyticsMCP();
  const propertyId = 395101361;

  console.log(`🔍 正在分析内容表现(最近${daysBack}天)...`);

  try {
    // 获取所有博客文章表现
    const blogPosts = await analytics.runReport({
      property_id: propertyId,
      date_ranges: [
        { start_date: `${daysBack}daysAgo`, end_date: "yesterday" },
      ],
      dimensions: ["pagePath", "pageTitle"],
      metrics: [
        "screenPageViews",
        "activeUsers",
        "userEngagementDuration",
        "bounceRate",
        "sessions",
      ],
      dimension_filter: {
        filter: {
          field_name: "pagePath",
          string_filter: {
            match_type: 2,
            value: "/blog/",
            case_sensitive: false,
          },
        },
      },
      order_bys: [{ metric: { metric_name: "screenPageViews" }, desc: true }],
      limit: 250,
    });

    // 表现分析
    const posts =
      blogPosts.rows?.map((row) => {
        const views = parseInt(row.metric_values[0].value);
        const users = parseInt(row.metric_values[1].value);
        const engagementTime = parseFloat(row.metric_values[2].value);
        const bounceRate = parseFloat(row.metric_values[3].value);
        const avgEngagement = views > 0 ? engagementTime / views : 0;

        // 从路径提取语言
        const language =
          row.dimension_values[0].value.match(/\/(ko|en|ja|zh)\//)?.[1] ||
          "unknown";

        return {
          path: row.dimension_values[0].value,
          title: row.dimension_values[1].value,
          views,
          users,
          avgEngagement: Math.round(avgEngagement),
          bounceRate: Math.round(bounceRate * 100),
          language,
        };
      }) || [];

    // 计算80/20分布
    const totalViews = posts.reduce((sum, p) => sum + p.views, 0);
    let cumulativeViews = 0;

    posts.forEach((post, index) => {
      cumulativeViews += post.views;
      const cumulativePercent = (cumulativeViews / totalViews) * 100;

      if (cumulativePercent <= 20) {
        post.category = "Power Post (Top 20%)";
      } else if (cumulativePercent <= 60) {
        post.category = "Mid-Tier (20-60%)";
      } else {
        post.category = "Long Tail (60-100%)";
      }
    });

    // 结果摘要
    const analysis = {
      summary: {
        totalPosts: posts.length,
        totalViews,
        avgViewsPerPost: Math.round(totalViews / posts.length),
        avgEngagement: Math.round(
          posts.reduce((s, p) => s + p.avgEngagement, 0) / posts.length
        ),
      },
      categories: {
        powerPosts: posts.filter((p) => p.category === "Power Post (Top 20%)"),
        midTier: posts.filter((p) => p.category === "Mid-Tier (20-60%)"),
        longTail: posts.filter((p) => p.category === "Long Tail (60-100%)"),
      },
      languages: {
        ko: posts.filter((p) => p.language === "ko"),
        en: posts.filter((p) => p.language === "en"),
        ja: posts.filter((p) => p.language === "ja"),
        zh: posts.filter((p) => p.language === "zh"),
      },
      top10: posts.slice(0, 10),
      underperformers: posts.slice(-10),
    };

    // 控制台输出
    console.log(`
📊 内容表现分析

整体状况:
- 总文章: ${analysis.summary.totalPosts}篇
- 总浏览量: ${analysis.summary.totalViews.toLocaleString()}
- 每篇平均: ${analysis.summary.avgViewsPerPost}
- 平均参与时间: ${Math.floor(analysis.summary.avgEngagement / 60)}分${
      analysis.summary.avgEngagement % 60
    }秒

分布:
- Power Posts (Top 20%): ${
      analysis.categories.powerPosts.length
    }篇 (${Math.round(
      (analysis.categories.powerPosts.reduce((s, p) => s + p.views, 0) /
        totalViews) *
        100
    )}% 流量)
- Mid-Tier (20-60%): ${analysis.categories.midTier.length}篇
- Long Tail (60-100%): ${analysis.categories.longTail.length}篇

语言分布:
- 中文: ${analysis.languages.zh?.length || 0}篇 (${Math.round(
      ((analysis.languages.zh?.reduce((s, p) => s + p.views, 0) || 0) / totalViews) *
        100
    )}% 流量)
- 英语: ${analysis.languages.en.length}篇 (${Math.round(
      (analysis.languages.en.reduce((s, p) => s + p.views, 0) / totalViews) *
        100
    )}% 流量)
- 日语: ${analysis.languages.ja.length}篇 (${Math.round(
      (analysis.languages.ja.reduce((s, p) => s + p.views, 0) / totalViews) *
        100
    )}% 流量)

Top 3文章:
${analysis.top10
  .slice(0, 3)
  .map(
    (p, i) =>
      `${i + 1}. ${p.title}\n   ${p.views}次浏览, ${Math.floor(
        p.avgEngagement / 60
      )}:${(p.avgEngagement % 60).toString().padStart(2, "0")} 平均参与`
  )
  .join("\n")}

💡 建议:
${generateRecommendations(analysis)}
    `);

    return analysis;
  } catch (error) {
    console.error("❌ 分析失败:", error);
    throw error;
  }
}

function generateRecommendations(analysis) {
  const recs = [];
  const totalViews = analysis.summary.totalViews;

  // 检查Power law分布
  const powerPostsPercent =
    (analysis.categories.powerPosts.reduce((s, p) => s + p.views, 0) /
      totalViews) *
    100;
  if (powerPostsPercent < 70) {
    recs.push(
      "- 内容分布均匀。应更积极地推广Top文章。"
    );
  } else if (powerPostsPercent > 85) {
    recs.push(
      "- Top文章集中度过高。需要内容多样化。"
    );
  }

  // 语言平衡
  const langStats = ["ko", "en", "ja", "zh"].map((lang) => ({
    lang,
    posts: analysis.languages[lang]?.length || 0,
    views: analysis.languages[lang]?.reduce((s, p) => s + p.views, 0) || 0,
  }));
  const dominantLang = langStats.sort((a, b) => b.views - a.views)[0];
  if (dominantLang.views / totalViews > 0.7) {
    recs.push(
      `- ${dominantLang.lang.toUpperCase()}内容占主导地位。考虑投资其他语言。`
    );
  }

  // 参与度分析
  if (analysis.summary.avgEngagement < 180) {
    recs.push("- 平均参与时间较低。添加内容深度和示例。");
  }

  return recs.length > 0
    ? recs.join("\n")
    : "- 无主要问题。保持当前策略。";
}

// CLI
if (require.main === module) {
  const days = parseInt(process.argv[2]) || 90;
  analyzeContentPerformance(days)
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { analyzeContentPerformance };
```

<strong>使用示例:</strong>

```bash
# 分析最近90天(默认值)
node scripts/analyze-content.js

# 分析最近30天
node scripts/analyze-content.js 30

# 分析所有数据
node scripts/analyze-content.js 365
```

## 实战应用示例

### 1. 流量分析自动化

<strong>场景</strong>: 希望每天早上收到前一天的流量摘要。

```javascript
// .claude/prompts/daily-traffic.md
每天上午9点执行以下分析:

1. 查询昨天(昨天00:00 - 23:59)的数据
2. 主要指标摘要:
   - 总访客、会话、页面浏览
   - 与前一天相比的变化率
   - 实时热门页面Top 3
3. 检查异常情况(流量激增/骤降)
4. 发送到Slack或电子邮件

格式:
📊 每日流量摘要 (YYYY-MM-DD)
- 访客: X人 (±Y%)
- 热门页面: [链接1, 链接2, 链接3]
- 特殊情况: [如有则说明]
```

<strong>自动化方法</strong>:

1. 设置GitHub Actions或cron job
2. 通过Claude API调用执行MCP
3. 将结果发送到Slack Webhook

### 2. 内容表现测量

<strong>场景</strong>: 分析新发布文章第一周的表现。

<strong>向Claude提问</strong>:

```
分析"google-analytics-mcp-automation"文章:
- 前7天的流量
- 流入路径(从哪里来?)
- 平均停留时间
- 跳出率
- 与其他文章相比的表现

基于这些数据提供改进建议。
```

<strong>AI分析示例</strong>:

```
## "google-analytics-mcp-automation"文章分析

### 7天表现
- 页面浏览: 567次
- 平均页面停留时间: 4分12秒(比博客平均2分30秒高68%)
- 跳出率: 32%(比平均45%优秀)

### 流量来源
1. Organic Search: 72% (关键词: "google analytics mcp", "博客分析自动化")
2. Twitter: 18% (特定推文传播)
3. Direct: 10%

### 与基准相比
✅ 最佳5%表现(同期发布文章中)
✅ 确认SEO优化效果(有机流量高)
✅ 停留时间长 = 内容质量优秀

### 改进建议
1. Twitter反应良好,撰写后续推文系列
2. 扩展为"MCP系列" - 相关内容需求高
3. 添加内部链接 - 连接其他MCP/自动化相关文章
```

### 3. 洞察导出与行动项目生成

<strong>场景</strong>: 分析月度数据以制定下月内容策略。

<strong>提示词</strong>:

```
综合分析上个月(10月)的博客数据:

1. 确定表现最好的内容主题/格式
2. 分析读者搜索的关键词趋势
3. 按流量来源分析特点(哪个渠道哪种内容效果好?)
4. 提出11月内容日历(5个主题)

基于数据提出具体策略。
```

<strong>AI策略建议</strong>:

```
## 10月综合分析与11月内容策略

### 表现分析
**Top主题**:
1. MCP/AI自动化(平均浏览量450)
2. Astro/Web开发(平均浏览量320)
3. 博客运营技巧(平均浏览量280)

**关键词趋势**:
- "MCP", "Model Context Protocol"搜索激增(450% ↑)
- "博客自动化", "AI代理"关注度增加
- "Astro", "静态站点"需求稳定

**渠道特点**:
- Organic: 技术深度内容(指南、教程)
- Twitter: 简短实用技巧、代码片段
- Direct: 系列内容(连续访问)

### 11月内容日历

**第1周**: "从零开始创建MCP服务器"
- 目标: 开发者、MCP深度学习者
- 关键词: "MCP开发", "自定义MCP"

**第2周**: "使用Claude Code自动化博客SEO"
- 目标: 博主、营销人员
- 关键词: "SEO自动化", "元标签优化"

**第3周**: "用AI代理自动生成内容创意"
- 目标: 内容创作者
- 关键词: "内容策划", "AI写作"

**第4周**: "Astro + MCP集成指南"
- 目标: 前端开发者
- 关键词: "Astro MCP", "静态站点自动化"

**第5周**: "月度回顾: 博客分析自动化获得的洞察"
- 目标: 所有读者
- 关键词: "博客增长", "数据分析"

### 执行策略
1. **SEO重点**: 第1、2周文章加强关键词优化
2. **社交媒体**: 将第3周文章重新加工为Twitter线程
3. **系列化**: 将MCP相关内容打包为系列,强化内部链接
4. **实验**: 第4周添加视频教程(测试新格式)
```

## 高级应用: 构建自定义仪表板

使用MCP可以创建自己的分析仪表板。

### Astro集成示例

```astro
---
// src/pages/analytics-dashboard.astro
import Layout from '../layouts/Layout.astro';

// 在构建时获取GA数据(使用MCP)
const last7Days = await fetch('claude-mcp://analytics-mcp/run_report', {
  property_id: 'YOUR_PROPERTY_ID',
  date_ranges: [{ start_date: '7daysAgo', end_date: 'today' }],
  dimensions: ['date', 'pagePath'],
  metrics: ['screenPageViews', 'averageSessionDuration']
});

const topPages = await fetch('claude-mcp://analytics-mcp/run_report', {
  property_id: 'YOUR_PROPERTY_ID',
  date_ranges: [{ start_date: '30daysAgo', end_date: 'today' }],
  dimensions: ['pageTitle', 'pagePath'],
  metrics: ['screenPageViews'],
  order_bys: [{ metric: { metric_name: 'screenPageViews' }, desc: true }],
  limit: 10
});
---

<Layout title="Analytics Dashboard">
  <h1>博客分析仪表板</h1>

  <section>
    <h2>过去7天趋势</h2>
    <div class="chart">
      {/* 使用图表库可视化 */}
    </div>
  </section>

  <section>
    <h2>Top 10页面</h2>
    <ul>
      {topPages.map(page => (
        <li>
          <a href={page.pagePath}>{page.pageTitle}</a>
          <span>{page.screenPageViews}次浏览</span>
        </li>
      ))}
    </ul>
  </section>
</Layout>
```

### 实时通知系统

```typescript
// scripts/realtime-monitor.ts
import { Client } from "@modelcontextprotocol/sdk";

async function monitorRealtime() {
  const client = new Client();
  await client.connect("analytics-mcp");

  // 每5分钟检查一次实时数据
  setInterval(async () => {
    const realtime = await client.callTool("run_realtime_report", {
      property_id: process.env.GA_PROPERTY_ID,
      dimensions: ["unifiedScreenName"],
      metrics: ["activeUsers"],
      limit: 5,
    });

    const totalActive = realtime.metrics[0].values[0];

    // 同时在线50人以上时发送通知
    if (totalActive >= 50) {
      await sendSlackNotification({
        text: `🔥 实时访客激增! 当前${totalActive}人在线`,
        channel: "#blog-alerts",
      });
    }
  }, 5 * 60 * 1000); // 5分钟
}

monitorRealtime();
```

## 最佳实践与技巧

### 1. 数据隐私

- 服务账号密钥绝对不要提交到Git
- 使用环境变量或密钥管理器
- 最小权限原则: 在GA中仅授予读取权限

```bash
# 添加到.gitignore
credentials/
*.json
.env
```

### 2. API配额管理

Google Analytics Data API有每日配额:

- 基本: 每天25,000次请求
- 每个项目每秒10次请求

<strong>优化技巧</strong>:

```typescript
// 利用缓存
const cache = new Map();

async function fetchWithCache(query, ttl = 3600) {
  const key = JSON.stringify(query);

  if (cache.has(key)) {
    const { data, timestamp } = cache.get(key);
    if (Date.now() - timestamp < ttl * 1000) {
      return data;
    }
  }

  const data = await fetchAnalytics(query);
  cache.set(key, { data, timestamp: Date.now() });
  return data;
}
```

### 3. 有效的提示词编写

向AI代理提供明确的指示:

<strong>不好的例子</strong>:

```
"分析博客"
```

<strong>好的例子</strong>:

```
"分析过去30天的数据:
1. 列出Top 5页面及浏览量
2. 计算主要流量来源比例
3. 计算与上月相比的增长率
4. 提出3个需要改进的领域

结果用Markdown表格整理。"
```

### 4. 定期报告自动化

```yaml
# .github/workflows/weekly-analytics.yml
name: Weekly Analytics Report

on:
  schedule:
    - cron: "0 9 * * 1" # 每周一上午9点(UTC)

jobs:
  report:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Generate Report
        env:
          GOOGLE_APPLICATION_CREDENTIALS: ${{ secrets.GA_CREDENTIALS }}
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          npx tsx scripts/generate-weekly-report.ts

      - name: Send to Slack
        uses: slackapi/slack-github-action@v1
        with:
          webhook-url: ${{ secrets.SLACK_WEBHOOK }}
          payload: |
            {
              "text": "Weekly Analytics Report Ready!",
              "attachments": [
                {
                  "text": "${{ steps.report.outputs.summary }}"
                }
              ]
            }
```

## 故障排除

### 身份验证错误

<strong>问题</strong>: "Permission denied"或"Invalid credentials"

<strong>解决方案</strong>:

1. 确认服务账号密钥路径
2. 在GA属性中确认服务账号权限
3. 确认API已启用:
   ```bash
   gcloud services list --enabled | grep analytics
   ```

### 数据不一致

<strong>问题</strong>: MCP结果与GA UI结果不同

<strong>原因</strong>:

- 时区差异(GA UI使用属性时区,API默认UTC)
- 采样(大量数据时发生)
- 筛选条件差异

<strong>解决方案</strong>:

```typescript
// 明确指定时区
{
  date_ranges: [{
    start_date: '2025-10-01',
    end_date: '2025-10-31'
  }],
  // 使用属性时区
  keep_empty_rows: true
}
```

### 性能问题

<strong>问题</strong>: 查询太慢

<strong>优化</strong>:

1. 仅请求需要的维度/指标
2. 限制日期范围
3. 使用分页:
   ```typescript
   {
     limit: 100,
     offset: 0  // 下一页为100, 200, ...
   }
   ```

## 结论: 数据驱动博客运营的开始

将Google Analytics MCP与AI代理结合,博客运营将完全改变:

### 预期效果

1. <strong>节省时间</strong>: 将用于手动分析的时间投入到内容创作
2. <strong>更好的洞察</strong>: AI发现人容易忽略的模式
3. <strong>数据驱动决策</strong>: 用数据而非直觉制定内容策略
4. <strong>自动化工作流</strong>: 一次设置后持续运行的系统

### 扩展可能性

这个系统可以超越博客分析进行扩展:

- <strong>A/B测试自动化</strong>: 自动测量标题、图片等的效果
- <strong>竞品分析</strong>: 与类似博客进行比较分析
- <strong>预测分析</strong>: 用历史数据预测未来流量
- <strong>个性化</strong>: 根据读者行为模式推荐内容

### 下一步

1. <strong>设置MCP</strong>: 按本文指南连接Google Analytics MCP
2. <strong>生成首份报告</strong>: 从"分析上周流量"开始
3. <strong>自定义代理</strong>: 开发适合您博客的分析逻辑
4. <strong>构建自动化</strong>: 使用GitHub Actions设置定期报告

### 额外资源

- [Google Analytics Data API文档](https://developers.google.com/analytics/devguides/reporting/data/v1)
- [Model Context Protocol规范](https://modelcontextprotocol.io)
- [Claude Code官方文档](https://docs.anthropic.com/claude/docs)
- [@upenn-libraries/google-analytics-mcp GitHub](https://github.com/upenn-libraries/google-analytics-mcp)

---

数据不仅仅是数字。正确分析和利用后,它将成为博客增长的指南针。MCP和AI代理将自动化并加速这个过程。

现在轮到您了。从今天开始数据驱动的博客运营吧!

<strong>有问题? 反馈?</strong>
如果您对本指南有疑问或有实际应用经验,请在评论中分享。让我们一起创建更好的博客自动化系统。
