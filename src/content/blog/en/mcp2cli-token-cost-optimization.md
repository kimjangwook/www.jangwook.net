---
title: mcp2cli — Cut MCP Token Costs by 96–99% with CLI-Based Tool Discovery
description: >-
  Connecting MCP servers injects all tool schemas into context every turn—362,000 tokens wasted for 120 tools over 25 turns. mcp2cli solves this with CLI-based on-demand discovery, cutting costs by 96–99%. Here's how it works and when to use it.
pubDate: '2026-03-12'
heroImage: ../../../assets/blog/mcp2cli-token-cost-optimization-hero.jpg
tags:
  - mcp
  - llm-cost
  - ai-agent
relatedPosts:
  - slug: mcp-servers-toolkit-introduction
    score: 0.95
    reason:
      ko: MCP 서버 연동의 기초를 다루며, mcp2cli 도입 전 필수 배경 지식을 제공합니다.
      ja: MCP サーバー連携の基礎を扱い、mcp2cli 導入前の必須背景知識を提供します。
      en: Covers MCP server integration basics, providing essential background before adopting mcp2cli.
      zh: 涵盖MCP服务器集成基础知识，是采用mcp2cli前的必读内容。
  - slug: mcp-code-execution-practical-implementation
    score: 0.92
    reason:
      ko: MCP 코드 실행 실전 구현 사례로, 토큰 최적화와 함께 읽으면 시너지가 높습니다.
      ja: MCP コード実行の実践実装事例で、トークン最適化と合わせて読むと相乗効果が高いです。
      en: Practical MCP code execution case study that pairs well with token optimization strategies.
      zh: MCP代码执行实践案例，与token优化策略结合阅读效果更佳。
  - slug: context-engineering-production-ai-agents
    score: 0.90
    reason:
      ko: 프로덕션 AI 에이전트의 컨텍스트 엔지니어링 전략으로, 토큰 관리의 큰 그림을 제공합니다.
      ja: プロダクション AI エージェントのコンテキストエンジニアリング戦略で、トークン管理の全体像を提供します。
      en: Context engineering strategies for production AI agents, offering the big picture of token management.
      zh: 生产AI代理的上下文工程策略，提供token管理的全局视图。
  - slug: deep-thinking-ratio-llm-cost-optimization
    score: 0.88
    reason:
      ko: LLM 비용 최적화의 다른 축인 추론 토큰 관리 전략을 다룹니다.
      ja: LLM コスト最適化の別の軸である推論トークン管理戦略を扱います。
      en: Addresses reasoning token management, another key axis of LLM cost optimization.
      zh: 涉及推理token管理策略，是LLM成本优化的另一重要维度。
  - slug: anthropic-code-execution-mcp
    score: 0.86
    reason:
      ko: Anthropic MCP 코드 실행 효율화 사례로, mcp2cli와 함께 MCP 최적화의 전체 그림을 완성합니다.
      ja: Anthropic MCP コード実行の効率化事例で、mcp2cli と合わせて MCP 最適化の全体像を完成させます。
      en: Anthropic MCP code execution efficiency case that completes the full picture of MCP optimization with mcp2cli.
      zh: Anthropic MCP代码执行效率案例，与mcp2cli共同构成MCP优化的完整图景。
---

## Overview

As Model Context Protocol (MCP) becomes the standard for connecting AI agents to external tools and APIs, a new bottleneck has emerged: **tool schema token waste**.

When you connect MCP servers, every tool's JSON schema is injected into the LLM's context window on every single conversation turn—whether or not the model uses those tools. With 30 tools, that's approximately 3,600 tokens burned per turn doing nothing. Scale to 120 tools over a 25-turn conversation and you're looking at 362,000 tokens consumed by schemas alone.

**mcp2cli** solves this with CLI-based on-demand tool discovery. Instead of preloading all schemas upfront, the model queries `--list` and `--help` only when needed—cutting token waste by 96–99%.

## The Problem: Cost of Upfront Schema Injection

### How Traditional MCP Integration Works

```
[Conversation Start]
System Prompt + ALL tool schemas (30 tools × 121 tokens = 3,630 tokens)
│
Turn 1: User message + ALL schemas re-injected
Turn 2: User message + ALL schemas re-injected
Turn 3: User message + ALL schemas re-injected
...
Turn 15: User message + ALL schemas re-injected
```

30 tools × 15 turns = **54,450 tokens** consumed by schemas alone—regardless of whether the model called any tool on that turn.

### Measured Token Costs

| Scenario | Native MCP | mcp2cli | Savings |
|---------|------------|---------|---------|
| 30 tools, 15 turns | 54,525 tokens | 2,309 tokens | <strong>96%</strong> |
| 80 tools, 20 turns | 193,240 tokens | 3,871 tokens | <strong>98%</strong> |
| 120 tools, 25 turns | 362,350 tokens | 5,181 tokens | <strong>99%</strong> |
| 200-endpoint API, 25 turns | 358,425 tokens | 3,925 tokens | <strong>99%</strong> |

The more tools you have and the longer the conversation, the greater the savings. At enterprise scale, this changes the cost structure entirely.

## How mcp2cli Works

### Core Idea: Schema Preload → On-Demand Discovery

```
[Traditional approach]
All tool schemas → always in context

[mcp2cli approach]
Tool list only (~16 tokens/tool) → model calls --help only when needed (~120 tokens/tool)
```

The LLM receives only tool names and brief descriptions via `mcp2cli --list`, then calls `mcp2cli [tool-name] --help` only when it actually wants to use that tool.

### Four-Stage Processing Pipeline

```
1. Spec Loading
   Read MCP server URL or OpenAPI spec file

2. Tool Definition Extraction
   Parse tool names, parameters, and descriptions from schema

3. Argument Parser Generation
   Dynamically create CLI commands for each tool (no codegen, runtime only)

4. Execution
   Forward as HTTP or tool-call request to the MCP server
```

### Installation and Basic Usage

```bash
# Install
pip install mcp2cli

# List available tools (~16 tokens/tool)
mcp2cli --mcp https://server.url/sse --list

# Get specific tool details (~120 tokens, only when needed)
mcp2cli --mcp https://server.url/sse search-files --help

# Use with OpenAPI spec
mcp2cli --spec api.json --base-url https://api.com list-items

# TOON format (Token-Optimized Output Notation)
mcp2cli --mcp https://server.url/sse search-files --toon
```

### Zero Codegen: Why It Matters

mcp2cli reads specs at runtime and generates the CLI dynamically. No code generation means:

- New tools added to the MCP server appear automatically on the next invocation
- No spec files to commit or maintain
- Intelligent 1-hour TTL caching prevents unnecessary reloads

## Engineering Manager's Perspective: Adoption Strategy

### Calculating the Business Impact

Assume your team operates an AI agent with 100 MCP tools integrated.

```
Native MCP (1,000 conversations/day, 20 turns avg):
  100 tools × 121 tokens × 20 turns × 1,000 conversations = 242,000,000 tokens/day

After mcp2cli (98% savings):
  ~4,840,000 tokens/day

Difference: 237,160,000 tokens/day
At Claude Sonnet 4.6 pricing ($3/MTok): ~$711/day saved, ~$21,000/month
```

Beyond cost, keeping the context window clean directly affects **model reasoning quality and latency**.

### Understanding the Trade-offs

mcp2cli isn't a silver bullet. The Hacker News discussion (133 upvotes, 92 comments) surfaced key concerns:

**Additional round-trips**: The model needs a separate `--help` call the first time it uses a tool. For short tasks, this can actually increase latency.

**Discovery error potential**: The model might try incorrect tool names or misinterpret `--help` output.

**Optimal use cases**: Tools 20+, conversations 10+ turns, with most tools unused on most turns.

### Adoption Roadmap

```
Step 1: Measure
   Track actual tool schema token consumption in current AI agents
   (Check system prompt token count in conversation logs)

Step 2: Pilot
   Apply mcp2cli to the one agent with the most MCP tool integrations
   A/B test: compare cost, accuracy, and latency

Step 3: Analyze
   Identify which tools are actually used frequently
   Consider hybrid: preload frequent tools, on-demand for the rest

Step 4: Scale
   Roll out to all agents after validating effectiveness
```

## What the Hacker News Community Said

Reactions were mixed, which is worth understanding:

**Positive responses**:
- "Applying the lazy loading pattern to LLM tool discovery is elegant"
- "This could be a game changer for large-scale MCP environments"

**Critical responses**:
- "Token savings don't automatically guarantee better outputs"
- "Extra round-trips for tool discovery increase latency and introduce potential for errors"
- "Benchmarks skew toward ideal scenarios"

In practice, validate against your actual workloads rather than trusting benchmarks at face value.

## Production Considerations

### MCP Server Type Compatibility

```
✅ HTTP/SSE MCP servers: Full support
✅ stdio MCP servers: Supported
✅ OpenAPI JSON/YAML: Supported
⚠️  Auth-required servers: Built-in OAuth support, requires configuration
```

### Caching Strategy

```bash
# Default caching: 1-hour TTL
mcp2cli --mcp server.url --cache-ttl 3600 --list

# Force refresh
mcp2cli --mcp server.url --no-cache --list
```

Use `--no-cache` in development where specs change frequently; increase TTL in stable production environments.

## Takeaway

The problem mcp2cli solves is simple but real. As the MCP ecosystem matures and the number of integrated servers and tools grows, schema injection costs don't scale linearly—they grow with every tool and every turn.

- <strong>30 tools</strong>: May not justify the change
- <strong>80+ tools</strong>: Monthly costs start to look noticeably different
- <strong>120+ tools</strong>: This becomes a survival strategy, not just optimization

Beyond token savings, keeping the context window clean has a positive effect on actual model reasoning quality. Reducing noise in the context window is becoming as important as prompt engineering itself.

---

**References**

- [mcp2cli GitHub](https://github.com/knowsuchagency/mcp2cli)
- [Show HN: mcp2cli — One CLI for every API, 96-99% fewer tokens](https://news.ycombinator.com/item?id=47305149)
- [Speakeasy: Reducing MCP token usage by 100x](https://www.speakeasy.com/blog/how-we-reduced-token-usage-by-100x-dynamic-toolsets-v2)
