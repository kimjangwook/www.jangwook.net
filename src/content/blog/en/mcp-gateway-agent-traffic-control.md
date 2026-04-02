---
title: MCP Gateway — Who Controls Your AI Agent's Tool Calls?
description: >-
  MCP has crossed 97 million monthly downloads and become the de facto standard,
  but there is no control layer governing which tools agents call and how often.
  The MCP Gateway pattern addresses this gap.
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

One of my Claude Code sessions is connected to 7 MCP servers. GitHub, Notion, Google Calendar, Gmail, Chrome DevTools, NotebookLM, and Telegram. This agent can read my emails, create calendar events, edit Notion pages, and open Chrome tabs.

Who's watching all of this?

Nobody. At least not in my local setup.

## MCP Succeeded. The Security Layer Hasn't

MCP's (Model Context Protocol) growth is staggering. Combined Python + TypeScript SDK monthly downloads have surpassed 97 million, with Anthropic, OpenAI, Google, Microsoft, and Amazon all supporting it. Created by Anthropic in late 2024 and donated to the Linux Foundation's AAIF in December 2025, it has become the de facto standard for "how AI agents call external tools."

The problem is that this protocol focuses on **connectivity**, not **control**.

When you create an MCP server, you define tools, and clients call those tools. Authentication? OAuth 2.1 made it into the spec. But policy-level concerns like "how many times can this agent call this tool per day" or "tools returning sensitive data must not be called without approval" aren't part of the MCP protocol itself. That's left to the implementer.

That's where the MCP Gateway concept comes in.

## What Is an MCP Gateway

Think API Gateway. Just like putting a reverse proxy in front of your backends with Kong or AWS API Gateway, you put a proxy in front of your MCP servers.

Agent → **MCP Gateway** → MCP Servers

What the Gateway does:
- **Authentication/Authorization**: Which agents can access which tools
- **Rate Limiting**: Throttle tool call frequency
- **Audit Logging**: Record who called what tool and when
- **Policy Enforcement**: Certain tools require human approval before execution
- **Traffic Routing**: Forward requests to the appropriate MCP server

I tested this in my local environment with a simple setup — a Node.js MCP proxy sitting between Claude Code and the actual MCP servers.

```typescript
// Simplest MCP Gateway skeleton
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema } from "@modelcontextprotocol/sdk/types.js";

const gateway = new Server({ name: "mcp-gateway", version: "0.1.0" }, {
  capabilities: { tools: {} }
});

// Policy engine — allow/deny calls here
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
  
  // Rate limit check
  callCount[toolName] = (callCount[toolName] || 0) + 1;
  if (rule && callCount[toolName] > rule.rateLimit) {
    return {
      content: [{ type: "text", text: `Rate limit exceeded for ${toolName}` }],
      isError: true,
    };
  }
  
  // Block tools requiring approval
  if (rule?.requireApproval) {
    console.error(`[GATEWAY] Approval required for: ${toolName}`);
    // In practice, send an approval request via Slack/Telegram here
  }
  
  // Audit log
  console.error(`[AUDIT] ${new Date().toISOString()} | ${toolName} | args: ${JSON.stringify(request.params.arguments)}`);
  
  // Forward to actual MCP server (omitted here)
  return await forwardToUpstream(toolName, request.params.arguments);
});
```

Is this production-ready? Honestly, not yet. But the core idea comes through clearly enough. Every agent tool call should pass through a single point, and that single point needs to enforce policies.

## Running It Revealed What's Missing

I plugged the code above into Claude Code and ran it. Short answer — it doesn't work as-is.

The first problem is <strong>tool list synchronization</strong>. For the Gateway to intercept `CallToolRequest`, it first needs to tell the client (Claude Code) "here are the tools I have." The code above has no `listTools` handler. You need to connect to upstream MCP servers, fetch their tool lists, and forward them to the client.

```typescript
import { ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";

gateway.setRequestHandler(ListToolsRequestSchema, async () => {
  const upstreamTools = await fetchToolsFromUpstream();
  return { tools: upstreamTools };
});
```

This gets things working, but when you have multiple upstream servers, tool names can collide. In my environment, Gmail and Google Calendar both expose generic names like `list`, so I had to add namespacing.

The second problem is <strong>rate limit lifetime</strong>. The `callCount` in the code above lives in memory. Restart the process and the count resets to zero. Claude Code spawns a new MCP server per session, so the limit resets every time you start a new session. A "10 per day" policy simply can't be enforced this way.

Third, printing `requireApproval` to `console.error` was completely useless. Nobody's watching stderr in real time. Actually getting approval means sending a request to an external channel (Telegram, Slack) and blocking until a response comes back — and implementing async waiting in stdio-based MCP is quite involved.

I thought about what solves all three at once, and at least for the first two, the answer is simple: <strong>write audit logs to SQLite instead of files or memory.</strong>

## Audit Logs in SQLite

Storing audit logs in a SQLite table instead of piping them through `console.error` also solves the rate limit lifetime problem. The DB persists across process restarts.

```typescript
import Database from "better-sqlite3";

const db = new Database("mcp-audit.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT DEFAULT (datetime('now')),
    tool_name TEXT NOT NULL,
    args TEXT,
    result_status TEXT DEFAULT 'ok',
    latency_ms INTEGER,
    blocked INTEGER DEFAULT 0,
    block_reason TEXT
  )
`);

const insertLog = db.prepare(`
  INSERT INTO audit_log (tool_name, args, result_status, latency_ms, blocked, block_reason)
  VALUES (?, ?, ?, ?, ?, ?)
`);

const countToday = db.prepare(`
  SELECT COUNT(*) as cnt FROM audit_log
  WHERE tool_name = ? AND timestamp > datetime('now', '-1 day') AND blocked = 0
`);
```

Replace the in-memory `callCount` dictionary with the `countToday` query, and you can accurately track "how many times Gmail read was called today" across sessions. The Gateway handler becomes:

```typescript
gateway.setRequestHandler(CallToolRequestSchema, async (request) => {
  const toolName = request.params.name;
  const rule = policy[toolName];
  const start = Date.now();

  if (rule) {
    const { cnt } = countToday.get(toolName) as { cnt: number };
    if (cnt >= rule.rateLimit) {
      insertLog.run(toolName,
        JSON.stringify(request.params.arguments),
        "blocked", 0, 1, "rate_limit");
      return {
        content: [{ type: "text",
          text: `Rate limit exceeded: ${toolName} (${cnt}/${rule.rateLimit} today)` }],
        isError: true,
      };
    }
  }

  const result = await forwardToUpstream(
    toolName, request.params.arguments);
  const latency = Date.now() - start;

  insertLog.run(toolName,
    JSON.stringify(request.params.arguments),
    "ok", latency, 0, null);
  return result;
});
```

## What You Can Do With the Accumulated Logs

After running this for a few days, `mcp-audit.db` had enough data to be useful. More useful than I expected.

<strong>Tool call frequency</strong> — see which tools get called most at a glance.

```sql
SELECT tool_name, COUNT(*) as calls, ROUND(AVG(latency_ms)) as avg_ms
FROM audit_log WHERE blocked = 0
GROUP BY tool_name ORDER BY calls DESC LIMIT 10;
```

In my case, `notion-search` was the runaway #1. The agent has this pattern of searching Notion before doing anything else. Seeing this made me think caching Notion search results might be worthwhile.

<strong>Block rate</strong> — what percentage of calls hit the rate limit.

```sql
SELECT tool_name,
  SUM(CASE WHEN blocked = 1 THEN 1 ELSE 0 END) as blocked,
  COUNT(*) as total,
  ROUND(100.0 * SUM(blocked) / COUNT(*), 1) as block_rate
FROM audit_log GROUP BY tool_name HAVING blocked > 0;
```

A high block rate means one of two things: the limit is too tight, or the agent has an inefficient pattern of repeatedly calling the same tool. If it's the latter, fix the prompt.

<strong>Hourly patterns</strong> — when is your agent most active.

```sql
SELECT strftime('%H', timestamp) as hour, COUNT(*) as calls
FROM audit_log GROUP BY hour ORDER BY hour;
```

Unsurprising result — calls cluster around 11am-12pm when my cron jobs run. In a team environment, this data could inform MCP server load balancing decisions.

The real value of this data is that it becomes <strong>evidence for policy tuning</strong>. Instead of guessing whether "10 per day for Gmail read" is enough, you can look at actual usage patterns. In my case, `gmail_read_message` averaged 3 calls per day, so a limit of 10 was plenty. Meanwhile, `notion-search` was hitting nearly 40 per day, making the limit of 20 insufficient — I bumped it to 30.

## When You Actually Need This

"Our team doesn't use MCP that much yet" — that excuse is expiring.

Here's a case I actually experienced: while editing a Notion page through the Notion MCP in Claude Code, I accidentally touched another team's page. The agent picked a page with a similar title from the search results, and I hit the approve button without thinking. No data was lost, but it was embarrassing.

When this happens to one developer locally, it's just awkward. But when 50 people on a team are using agents, each connected to 5-10 MCP servers? With no audit logs? No way to trace who called what?

The real reason enterprises need MCP Gateway isn't security — it's **visibility**. You need to see what your agents are doing.

## Solutions Already Emerging

Open-source and commercial projects are already appearing under the MCP Gateway name. From what I've found, there are two main approaches.

**1. Proxy approach** — A reverse proxy between agents and MCP servers. Same architecture as existing API Gateways. Simple to configure with the advantage of reusing existing infrastructure.

**2. Sidecar approach** — Attach a policy engine to each MCP server. Identical to the sidecar pattern in service meshes (Istio, Linkerd). Enables finer-grained control but increases operational complexity.

For small teams, I think the proxy approach is more than enough. The sidecar route makes sense when you have 20+ MCP servers and teams needing different policies — at that scale, you probably already have dedicated platform engineers.

## But This Is a Transitional Solution

Here's where we need to think critically.

The fact that MCP Gateway is needed means the MCP protocol itself is missing a governance layer. We put API Gateways on top of HTTP not because HTTP lacks authentication, but because we need business logic and traffic management. Similarly, MCP will likely get protocol-level extensions for defining policies.

When that happens, today's Gateways become legacy.

Personally, I expect something like a policy extension to be added to the MCP spec within 6 months. Given the active governance discussions since the donation to Linux Foundation, the direction seems set. But running agents with zero controls for those 6 months is risky, so the Gateway serves as a **bridge solution** to fill that gap.

One more thing — introducing a Gateway slows down agent response times. Adding a proxy hop is an obvious trade-off. In my local testing, each tool call added about 50-100ms of overhead. In most cases that's imperceptible, but when an LLM calls tools 20-30 times in a single task, that's 1-2 extra seconds total, which can affect user experience.

## What's Still Unsolved

Logging to SQLite and tuning policies based on data — that's doable solo. But the `requireApproval` part — actually getting human approval — is still not properly implemented.

What I want to try next is Telegram bot integration. When a tool call with `requireApproval: true` comes in, the Gateway sends an approval request via Telegram and holds the request until the user taps "OK." The idea is simple, but implementing async waiting in stdio-based MCP requires restructuring. Right now it's a synchronous flow — request in, response out immediately.

And fundamentally, this only makes sense at the individual developer's local environment level. For team use, you'd need authentication for the Gateway itself, multi-tenancy, a policy management UI — at that point, you should be using a product, not building one.

When giving AI agents access to tools, "what they can't do" matters as much as "what they can do." MCP Gateway is the most pragmatic starting point for the latter, and just adding SQLite makes "what my agent is actually doing" visible. From there, policies can be driven by data.
