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

## What I'm Trying Next

Right now I've only tested at prototype level locally. Next steps:

- I want to integrate with a Telegram bot so that tool calls with `requireApproval: true` send approval requests via Telegram
- I'd like to store audit logs in SQLite and generate stats like "Top 10 tools my agent called most this week"

When giving AI agents access to tools, "what they can't do" matters as much as "what they can do." MCP Gateway is the most pragmatic starting point for the former. Just keep in mind it won't be the permanent answer.
