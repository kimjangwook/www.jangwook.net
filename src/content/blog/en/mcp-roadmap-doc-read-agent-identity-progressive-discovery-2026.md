---
title: "I Measured MCP Tool Catalog Loading and Found That Progressive Discovery Cannot Wait for the Roadmap"
description: "A 200-tool MCP catalog triggered ten list calls and 62,708 bytes before the first user request. The practical response is to budget catalogs now and keep identity standards behind an adapter."
pubDate: 2026-08-25
heroImage: "../../../assets/blog/mcp-roadmap-doc-read-agent-identity-progressive-discovery-2026/hero.png"
tags:
  - MCP
  - AI agents
  - protocol strategy
  - engineering leadership
  - platform architecture
relatedPosts:
  - slug: mcp-builtin-vs-external-harness-cost-28x-measured-2026
    score: 0.9
    reason:
      ko: MCP 실행 환경의 비용과 운영 경계를 계측 데이터로 비교한다.
      ja: MCPの実行環境におけるコストと運用境界を計測データで比較する。
      en: Compares MCP execution environments through measured cost and operational boundaries.
      zh: 通过实测成本和运维边界比较 MCP 执行环境。
  - slug: mcp-vs-a2a-vs-open-responses-agent-protocol-comparison-2026
    score: 0.88
    reason:
      ko: 에이전트 프로토콜을 도입 시점과 책임 경계 관점에서 비교한다.
      ja: エージェントプロトコルを導入時点と責任境界の観点から比較する。
      en: Compares agent protocols through adoption timing and responsibility boundaries.
      zh: 从采用时机和责任边界的角度比较智能体协议。
  - slug: context-engineering-production-ai-agents
    score: 0.85
    reason:
      ko: 프로덕션 에이전트에서 컨텍스트를 예산과 시스템 설계 대상으로 다룬다.
      ja: プロダクションエージェントにおけるコンテキストを予算とシステム設計の対象として扱う。
      en: Treats context in production agents as a budget and a systems-design concern.
      zh: 将生产环境智能体的上下文视为预算和系统设计问题。
---

I wanted to know whether an MCP roadmap item should change an architecture decision before it becomes part of the protocol. I connected a local MCP server exposing 200 synthetic tools, paginated in groups of 20, to Claude 2.1.241 and measured catalog loading. It made 10 list calls and received 62,708 bytes before a user asked for anything, so catalog control is an immediate engineering problem rather than a future standards discussion.

That result matters because a consolidated internal tool layer turns a protocol decision into recurring context cost; budget the catalog now, and leave identity standards replaceable.

## The roadmap is a prioritization map, not a delivery schedule

Executives often read a roadmap as if every item on it shares a delivery horizon and implementation maturity. That is a costly reading error for MCP.

The roadmap itself says otherwise:

> This roadmap reflects current thinking rather than firm commitments. Priorities may shift, some items may be delivered differently than described or deferred, and work not listed here may still be included in the release.

> — [Roadmap](https://modelcontextprotocol.io/development/roadmap)

The more operationally important sentence is about where maintainer attention goes: SEPs outside the listed priority areas are not automatically rejected, but face a longer queue and a higher bar because review time is scarce. That makes the roadmap useful. It tells leaders where protocol governance intends to spend attention. It does not make a listed concept deployable.

I separate roadmap items into three implementation categories before they enter an architecture plan.

First, there are capabilities already visible in released schemas: `nextCursor`, `structuredContent`, and `subscriptions/listen`. Their implementation details may change, but teams are working with a real protocol surface.

Second, there are capabilities moving between core and extension boundaries. Tasks appeared in the 2025-11-25 core schema, then disappeared from the 2026-07-28 core schema. The roadmap still describes continued work toward eventual inclusion of the Tasks extension in the core protocol. That is meaningful direction, but it is not a stable core dependency.

Third, there are roadmap and working-group concepts with no schema presence across the examined releases: DPoP, progressive discovery, webhook, ID-JAG, and token exchange. Treating those as if they were merely awaiting a minor version turns planning assumptions into production dependencies.

## The schema surface shows where commitment actually exists

I checked the 2025-06-18, 2025-11-25, 2026-07-28, and draft MCP schemas for DPoP, progressive discovery, `subscriptions/listen`, webhook, Tasks, `CreateTaskResult`, `structuredContent`, `nextCursor`, audience, ID-JAG, and token exchange.

The result was consistent across three runs. DPoP, progressive discovery, webhook, ID-JAG, and token exchange occurred zero times in all four schemas. `subscriptions/listen` appeared 17 times from 2026-07-28 onward. Tasks appeared 25 times only in the 2025-11-25 schema, while `CreateTaskResult` appeared six times there and zero times in the current release. `nextCursor` existed from the 2025-06-18 release onward.

The current 2026-07-28 schema and the draft were byte-for-byte identical at 181,474B, with the same SHA-256 hash. That does not guarantee future stability, but it is a much stronger engineering signal than a roadmap bullet.

This distinction changes governance. A protocol feature mentioned in `/development/roadmap` should be recorded as a strategic dependency. A feature in `/specification/` or a released schema can be treated as an implementation dependency. A feature described in `/docs/` may be valuable guidance, but it should not silently become a contractual assumption in a design review.

The same site, typography, and terminology can conceal materially different levels of commitment. A human can often infer that difference from the URL. An agent consuming flattened documentation may not. That is why source location must be retained in internal architecture records, retrieval corpora, and agent-facing engineering knowledge.

## Pagination is not progressive discovery

The central mechanism is easy to miss because pagination already exists.

The pagination specification says:

> Clients **SHOULD**: * Treat a missing `nextCursor` as the end of results * Support both paginated and non-paginated flows

> — [Server Utilities — Pagination (2026-07-28)](https://modelcontextprotocol.io/specification/2026-07-28/server/utilities/pagination)

That language tells a client how to process a cursor. It does not require the client to retrieve every page. Nor does it tell the client which deferred tools are relevant to the current task.

I connected Claude 2.1.241 to a local MCP server with 200 synthetic tools, exposed 20 at a time. In each of three runs, the client made 10 `tools/list` calls. The cursor sequence was `none`, `20`, `40`, `60`, `80`, `100`, `120`, `140`, `160`, `180`. Cumulative response size was 62,708B.

The first page alone was 6,253B. A separate server exposing only 20 tools returned 6,235B. The 18-byte difference was the `nextCursor` field. The first 20 tool definitions were otherwise identical.

That makes the operational problem clear. A cursor says that another page exists. It carries no indication that the next page can be safely deferred, no task relevance signal, no category boundary, and no cost signal. If the client cannot know whether an omitted page contains the tool the user needs, full retrieval is the safest generic policy.

Progressive discovery is therefore not pagination with a different loop. It requires an additional decision signal that lets the client defer tool definitions without becoming functionally blind.

The roadmap describes that missing direction:

> **Progressive discovery**: Core Primitives WG. Clients learn a server's tools and resources as they need them instead of ingesting the full catalog up front, with a defined interaction with the caching work under HTTP-Native Transport Unification and Hardening.

> — [Roadmap — Progressive discovery](https://modelcontextprotocol.io/development/roadmap)

## Catalog size is already a measurable platform cost

The 20-tool baseline required one list call and 6,235B. The 200-tool catalog required 10 list calls and 62,708B. Tool count increased by a factor of 10; response bytes increased by a factor of 10.06.

That is not a currency figure, and I would not turn it into one without a workload model. It is still a budget signal. Those bytes move before the first user request. They consume context capacity, affect connection-time behavior, complicate tracing, and become a repeated operational cost whenever cache behavior does not absorb them.

The official client guidance frames the same problem at a different catalog scale:

> Once the tool definitions take up a significant part of the available context window, clients should switch to progressive discovery. We recommend that clients implement thresholds to determine when to switch:

> — [Client Best Practices (2026-07-28)](https://modelcontextprotocol.io/docs/2026-07-28/develop/clients/client-best-practices)

Its example contrasts an upfront approach using approximately 150,000 tokens for definitions with progressive discovery using approximately 2,000 tokens. Those figures should not be compared directly with my byte measurements because the catalog sizes and definitions differ. The shared conclusion is what matters: catalog growth becomes an economic constraint before anyone notices it in a feature roadmap.

When organizations consolidate member systems, authentication services, data access, and operational workflows behind one MCP gateway, they gain a simpler integration surface. They also aggregate tool definitions. The first-turn bill is the price of that consolidation unless the platform deliberately controls exposure.

## Make catalog governance part of the engineering system

I would put three controls into the delivery process.

The first is a catalog budget. Every MCP server should have a tool-count ceiling and a total definition-byte budget. CI should measure `tools/list` call count and cumulative response bytes using a harness appropriate to the supported client. A pull request that exceeds the budget should trigger an ownership conversation: split the server by responsibility, reduce tool surface, or obtain an explicit exception.

This is not bureaucracy for its own sake. A budget turns an invisible context externality into a visible platform decision. It also creates a clean unit of accountability. A team can own a server boundary and its catalog economics.

The second is a documentation-surface rule. Any internal design document that cites an MCP capability should include its source path: released schema, draft schema, `/specification/`, `/docs/`, or `/development/roadmap`. That one field prevents a common failure mode in which a junior engineer, an architect under deadline pressure, or an internal coding agent reads a roadmap sentence as a protocol guarantee.

The third is an identity adapter seam. Token acquisition, token validation, audience handling, and delegated authority should sit behind one interface. The point is not to pre-implement DPoP or ID-JAG. The point is to avoid scattering identity assumptions across tool handlers, gateway middleware, and agent orchestration code.

The roadmap says:

> **DPoP**: Agent Identity WG (forming during this roadmap period). Finalize the specification for Demonstrating Proof of Possession (DPoP) and focus on getting widespread adoption.

> — [Roadmap — DPoP / Agent identity and delegation](https://modelcontextprotocol.io/development/roadmap)

That is a reason to preserve a replacement seam, not a reason to hard-code a future flow into today's system.

## The strongest objection is right for smaller catalogs

The strongest counterargument deserves to stand intact.

Schema-absent capabilities can move faster precisely because they have fewer deployed implementations to preserve. If a team builds its own progressive-discovery mechanism now, the protocol may land with a different interaction model and force a rewrite. MCP has an experimental extension path for this kind of work. Why take on compatibility debt before the standard clarifies?

For teams with only tens of tools, that argument is correct. My 20-tool baseline was 6,235B. In many systems, that is noise. If the catalog remains small, waiting has effectively no cost while custom discovery has a definite maintenance and rewrite cost.

The objection fails when the catalog reaches three digits and continues growing through organizational consolidation. At that point, the cost is not hypothetical. The current client policy has already made 10 list calls and moved 62,708B before task execution. Waiting for the final shape of progressive discovery does not freeze that cost. It merely leaves it unmanaged.

The right decision is not to imitate an unpublished protocol feature. It is to apply controls that remain useful regardless of the future protocol: role-based server boundaries, policy-limited initial tool exposure, catalog budgets, and instrumentation.

## Vendor-client teams need a different playbook

Teams that control the host, client harness, or internal gateway can implement server-side exposure policies now. They can partition catalogs by role, route users to narrower servers, and make session initialization selective.

Teams that run vendor clients as delivered cannot assume they can alter discovery behavior. Their practical lever is catalog governance. Put a tool-count ceiling in review gates, treat total definition bytes as a platform budget, and measure real client behavior before approving a larger surface.

This is also where leaders should resist false universality. My measurement was run through a local stdio harness with Claude 2.1.241. It does not establish the behavior of Codex, another vendor client, or a remote Streamable HTTP deployment. Client policy and transport behavior can change the operating profile.

The 2026-07-28 release made remote MCP servers look more like ordinary HTTP workloads, including `Mcp-Method` and `Mcp-Name` headers on Streamable HTTP requests. It also added `ttlMs` and `cacheScope` hints to list and read results. Those are important operational primitives, especially for cache design and observability. They do not remove the need to measure the actual client and transport path that a business intends to operate.

## What CEOs and CTOs should decide now

The executive decision is not whether to bet on one roadmap item. It is whether protocol uncertainty will be allowed to block controllable operational improvements.

I would approve immediate work in three areas: catalog measurement and budgets, server ownership boundaries, and a single identity adapter seam. These decisions improve unit economics and reduce access-control risk whether progressive discovery, DPoP, and ID-JAG arrive quickly, slowly, or in a different shape.

I would not approve a program plan whose delivery date depends on a roadmap item becoming a released protocol capability. The roadmap has a strategic horizon, not a contractual schedule. Treating it as a deadline creates two avoidable losses: teams rebuild against an immature interface, or they defer a present-day catalog cost because they assume the standard will absorb it later.

The upside is time to market. If catalog controls and identity seams are owned now, future protocol adoption becomes a bounded integration project rather than an architecture rewrite. The organization can move while standards mature.

My call is clear: for any internally controlled MCP platform trending toward a three-digit tool catalog, implement catalog controls before progressive discovery is standardized, and isolate identity behind an adapter rather than waiting for DPoP or ID-JAG. I would change that call if measured production clients consistently deferred unused catalog pages without a custom server-side exposure policy.

## References

1. [Roadmap](https://modelcontextprotocol.io/development/roadmap)
2. [Roadmap — Progressive discovery](https://modelcontextprotocol.io/development/roadmap)
3. [Roadmap — DPoP / Agent identity and delegation](https://modelcontextprotocol.io/development/roadmap)
4. [Roadmap — SEP Prioritization](https://modelcontextprotocol.io/development/roadmap)
5. [Client Best Practices (2026-07-28)](https://modelcontextprotocol.io/docs/2026-07-28/develop/clients/client-best-practices)
6. [Server Utilities — Pagination (2026-07-28)](https://modelcontextprotocol.io/specification/2026-07-28/server/utilities/pagination)
7. [schema.json (2025-06-18 / 2025-11-25 / 2026-07-28 / draft)](https://github.com/modelcontextprotocol/modelcontextprotocol/tree/main/schema)
8. [The next generation of MCP](https://blog.cloudflare.com/mcp-v2/)
