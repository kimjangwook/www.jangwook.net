---
title: MCP Gateway — 谁在控制AI Agent的工具调用？
description: MCP月下载量突破9700万成为事实标准，但缺少控制Agent调用哪些工具以及调用频率的治理层。MCP Gateway模式解决了这个问题。
pubDate: '2026-04-02'
heroImage: ../../../assets/blog/mcp-gateway-agent-traffic-control-hero.jpg
tags:
  - mcp
  - security
  - ai-agent
  - architecture
relatedPosts:
  - slug: sqlite-ai-swarm-build
    score: 0.94
    reason:
      ko: 'AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: 'Covers similar topics in AI/ML, architecture with comparable difficulty.'
      zh: 在AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: nist-ai-agent-security-standards
    score: 0.94
    reason:
      ko: 'AI/ML, DevOps, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: AI/ML、DevOps、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in AI/ML, DevOps, architecture with comparable
        difficulty.
      zh: 在AI/ML、DevOps、架构领域涵盖类似主题，难度相当。
  - slug: adl-agent-definition-language-governance
    score: 0.94
    reason:
      ko: 'AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: 'Covers similar topics in AI/ML, architecture with comparable difficulty.'
      zh: 在AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: nvidia-nemoclaw-openclaw-enterprise-agent-platform
    score: 0.94
    reason:
      ko: 'AI/ML, DevOps, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: AI/ML、DevOps、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in AI/ML, DevOps, architecture with comparable
        difficulty.
      zh: 在AI/ML、DevOps、架构领域涵盖类似主题，难度相当。
  - slug: dapr-agents-v1-cncf-production-ai-framework
    score: 0.94
    reason:
      ko: 'AI/ML, DevOps, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: AI/ML、DevOps、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in AI/ML, DevOps, architecture with comparable
        difficulty.
      zh: 在AI/ML、DevOps、架构领域涵盖类似主题，难度相当。
---

我的一个Claude Code会话连接了7个MCP服务器。GitHub、Notion、Google Calendar、Gmail、Chrome DevTools、NotebookLM，还有Telegram。这个Agent可以读我的邮件、创建日历事件、编辑Notion页面、打开Chrome标签页。

那谁在监控这一切？

没有人。至少在我的本地环境中是这样。

## MCP成功了，安全层还没有

MCP（Model Context Protocol）的增长势头惊人。Python + TypeScript SDK合计月下载量超过9700万，Anthropic、OpenAI、Google、Microsoft、Amazon全部支持。2024年底由Anthropic创建，2025年12月捐赠给Linux Foundation的AAIF后，事实上成为了"AI Agent调用外部工具的方式"的标准。

问题在于，这个协议专注于**连接**，对**控制**关注甚少。

创建MCP服务器时定义工具（tool），客户端调用这些工具。认证？OAuth 2.1已经进入规范。但"这个Agent每天能调用这个工具多少次"、"返回敏感数据的工具必须经过审批才能调用"这样的策略层，MCP协议本身并不包含。那是实现方的责任。

于是MCP Gateway的概念应运而生。

## MCP Gateway是什么

想象一下API Gateway。就像用Kong或AWS API Gateway在后端前面放一个反向代理一样，在MCP服务器群前面放一个代理。

Agent → **MCP Gateway** → MCP服务器群

Gateway的职责：
- **认证/授权**：哪个Agent可以访问哪些工具
- **速率限制**：限制工具调用频率
- **审计日志**：记录谁在何时调用了什么工具
- **策略执行**：某些工具需要人工审批后才能执行
- **流量路由**：将请求转发到相应的MCP服务器

我在本地环境做了简单测试——用Node.js做一个MCP代理，夹在Claude Code和实际MCP服务器之间。

```typescript
// 最简单的MCP Gateway骨架
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema } from "@modelcontextprotocol/sdk/types.js";

const gateway = new Server({ name: "mcp-gateway", version: "0.1.0" }, {
  capabilities: { tools: {} }
});

// 策略引擎 — 在这里允许/拒绝调用
const policy = {
  "gmail_read_message": { rateLimit: 10, requireApproval: false },
  "gmail_create_draft": { rateLimit: 5, requireApproval: true },
  "gcal_delete_event": { rateLimit: 2, requireApproval: true },
  "notion-update-page": { rateLimit: 20, requireApproval: false },
};

const callCount: Record<string, number> = {};

gateway.setRequestHandler(CallToolRequestSchema, async (request) => {
  const toolName = request.params.name;
  const rule = policy[toolName];
  
  // 速率限制检查
  callCount[toolName] = (callCount[toolName] || 0) + 1;
  if (rule && callCount[toolName] > rule.rateLimit) {
    return {
      content: [{ type: "text", text: `Rate limit exceeded for ${toolName}` }],
      isError: true,
    };
  }
  
  // 需要审批的工具进行拦截
  if (rule?.requireApproval) {
    console.error(`[GATEWAY] Approval required for: ${toolName}`);
    // 实际上这里会通过Slack/Telegram发送审批请求
  }
  
  // 审计日志
  console.error(`[AUDIT] ${new Date().toISOString()} | ${toolName} | args: ${JSON.stringify(request.params.arguments)}`);
  
  // 转发到实际MCP服务器（此处省略）
  return await forwardToUpstream(toolName, request.params.arguments);
});
```

这段代码能在生产环境中使用吗？说实话还不行。但核心思想已经表达清楚了——Agent的工具调用必须经过一个统一的节点，而这个节点要能执行策略。

## 什么时候真正需要它

"我们团队还没怎么用MCP"——这个借口快要过期了。

说一个我亲身经历的案例：在用Claude Code通过Notion MCP编辑页面时，我不小心碰到了另一个团队的页面。Agent从搜索结果中选了一个标题相似的页面，我没多想就按了批准按钮。数据没丢，但挺尴尬的。

这事发生在一个开发者的本地环境里，也就尴尬一下。但如果团队50人都在用Agent，每个Agent连接了5到10个MCP服务器呢？没有审计日志？无法追踪谁调用了什么？

企业需要MCP Gateway的真正原因不是安全，而是**可见性**。你得看得到Agent在干什么。

## 已经出现的解决方案

以MCP Gateway命名的开源和商业项目已经出现了。据我调研，主要有两种方式。

**1. 代理模式** — 在Agent和MCP服务器之间放一个反向代理。与现有API Gateway架构相同。配置简单，可以复用现有基础设施。

**2. Sidecar模式** — 给每个MCP服务器附加策略引擎。与服务网格（Istio、Linkerd）的sidecar模式相同。可以实现更细粒度的控制，但运维复杂度上升。

我认为小团队用代理模式就够了。走sidecar路线是在MCP服务器超过20个、各团队需要不同策略的场景下才有必要——到了那个规模，你应该已经有专职的平台工程师了。

## 但这是一个过渡方案

这里需要批判性地思考一下。

MCP Gateway之所以被需要，说明MCP协议本身缺少治理层。我们在HTTP上面搭API Gateway，不是因为HTTP没有认证，而是因为需要业务逻辑和流量管理。同理，MCP很可能会在协议层面推出定义策略的扩展。

到那时，现在构建的Gateway就变成了遗留系统。

我个人预计6个月内MCP规范会加入类似policy extension的东西。从捐赠给Linux Foundation后治理相关讨论的活跃程度来看，方向已经定了。但在这6个月里不加任何控制地运行Agent是有风险的，所以Gateway是填补这段空白的**过渡方案**。

还有一点——引入Gateway会拖慢Agent的响应速度。多经过一层代理，延迟增加是必然的。本地测试下来，每次工具调用增加约50到100毫秒的开销。大多数情况下感知不到，但当LLM在一个任务中调用工具20到30次时，总计多出1到2秒，这会影响用户体验。

## 接下来我要做的

目前只在本地做了原型级别的测试。下一步：

- 打算接入Telegram机器人，让`requireApproval: true`的工具调用通过Telegram发送审批请求
- 想把审计日志存到SQLite里，生成"本周Agent调用最多的工具Top 10"之类的统计

给AI Agent工具的时候，"不能做什么"和"能做什么"一样重要。MCP Gateway是前者最现实的起点。但也要记住，这不会是永久的答案。
