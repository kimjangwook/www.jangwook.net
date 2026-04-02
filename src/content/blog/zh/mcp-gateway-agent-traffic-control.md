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
      ko: MCP Gateway가 에이전트의 도구 호출을 중앙에서 통제하듯, 멀티 에이전트 스웜에서도 각 에이전트의 리소스 접근과 작업 범위를 제어하는 오케스트레이션이 핵심입니다.
      ja: MCP Gatewayがエージェントのツール呼び出しを一元管理するように、マルチエージェントスウォームでも各エージェントのリソースアクセスと作業範囲を制御するオーケストレーションが鍵になります。
      en: Just as MCP Gateway centralizes control over agent tool calls, multi-agent swarms face the same challenge of orchestrating resource access and task boundaries for each agent.
      zh: 正如MCP Gateway集中控制Agent的工具调用，多Agent蜂群同样需要编排每个Agent的资源访问和任务边界。
  - slug: nist-ai-agent-security-standards
    score: 0.94
    reason:
      ko: MCP Gateway의 인증/인가, 감사 로그, 정책 적용은 결국 NIST가 정의한 AI 에이전트 보안 표준을 런타임에서 구현하는 것과 같습니다.
      ja: MCP Gatewayの認証・認可、監査ログ、ポリシー適用は、NISTが定義したAIエージェントセキュリティ標準をランタイムで実装することに他なりません。
      en: The authentication, audit logging, and policy enforcement in MCP Gateway are essentially a runtime implementation of the AI agent security standards defined by NIST.
      zh: MCP Gateway的认证授权、审计日志和策略执行，本质上是在运行时落地NIST定义的AI Agent安全标准。
  - slug: adl-agent-definition-language-governance
    score: 0.94
    reason:
      ko: MCP Gateway가 런타임에서 도구 호출을 통제한다면, ADL은 에이전트의 권한과 행동 범위를 선언적으로 정의하는 설계 시점의 거버넌스입니다. 둘을 조합하면 완전한 에이전트 통제 체계가 됩니다.
      ja: MCP Gatewayがランタイムでツール呼び出しを制御するなら、ADLはエージェントの権限と行動範囲を宣言的に定義する設計時のガバナンスです。両者を組み合わせれば完全なエージェント制御体系になります。
      en: If MCP Gateway controls tool calls at runtime, ADL defines agent permissions and behavioral boundaries declaratively at design time. Combining both creates a complete agent governance stack.
      zh: 如果MCP Gateway在运行时控制工具调用，ADL则在设计时以声明式方式定义Agent的权限和行为边界。两者结合才构成完整的Agent治理体系。
  - slug: nvidia-nemoclaw-openclaw-enterprise-agent-platform
    score: 0.94
    reason:
      ko: 엔터프라이즈 에이전트 플랫폼에서 MCP Gateway 같은 통제 레이어가 어떻게 제품화되는지 보여주는 사례입니다. 개인 프록시 vs 상용 플랫폼의 차이를 비교해볼 수 있습니다.
      ja: エンタープライズエージェントプラットフォームにおいて、MCP Gatewayのような制御レイヤーがどのように製品化されるかを示す事例です。個人プロキシと商用プラットフォームの違いを比較できます。
      en: Shows how an enterprise agent platform productizes the kind of control layer that MCP Gateway provides. Useful for comparing a DIY proxy approach against a commercial platform solution.
      zh: 展示了企业级Agent平台如何将MCP Gateway式的控制层产品化。可以对比自建代理与商业平台方案的差异。
  - slug: dapr-agents-v1-cncf-production-ai-framework
    score: 0.94
    reason:
      ko: Dapr Agents가 CNCF 생태계 위에서 에이전트를 운영하듯, MCP Gateway도 클라우드 네이티브 인프라 패턴(사이드카, 서비스 메시)을 활용합니다. 프로덕션 배포 아키텍처의 공통점이 많습니다.
      ja: Dapr AgentsがCNCFエコシステム上でエージェントを運用するように、MCP Gatewayもクラウドネイティブインフラパターン（サイドカー、サービスメッシュ）を活用します。プロダクション配置アーキテクチャの共通点が多いです。
      en: Just as Dapr Agents runs agents on the CNCF ecosystem, MCP Gateway leverages cloud-native infrastructure patterns like sidecars and service meshes. The two share significant overlap in production deployment architecture.
      zh: Dapr Agents在CNCF生态上运行Agent，MCP Gateway也利用Sidecar和服务网格等云原生基础设施模式。两者在生产部署架构上有很多共同点。
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
