---
title: >-
  Langfuse v3 Self-Hosting Complete Guide — Building LLM Tracing on Your Own
  Infrastructure
description: >-
  Self-host Langfuse v3 with Docker Compose: Python SDK 4.x instrumentation, RAG
  tracing, cost and latency dashboards. Full LLM observability on your own
  infrastructure — no cloud vendor needed.
pubDate: '2026-05-03'
heroImage: >-
  ../../../assets/blog/langfuse-self-hosted-llm-tracing-setup-guide-2026-hero.png
tags:
  - llm-observability
  - langfuse
  - docker
relatedPosts:
  - slug: ollama-fastapi-production-deployment-guide-2026
    score: 0.9
    reason:
      ko: docker 주제를 한 단계 더 깊이 파고드는 글입니다.
      en: Goes one level deeper into docker.
      ja: dockerをもう一歩深く掘り下げた記事です。
      zh: 更深入地探讨 docker 主题。
---

There's a moment that comes for everyone after they push an LLM agent to production. You open the Langfuse dashboard to trace "why did it give that response?" and then your eye catches the cloud billing statement. Once monthly trace volume crosses 100K, Langfuse Cloud's Pro plan stops feeling free. So I set up self-hosting with Docker Compose. What follows is what I learned along the way.

## What Problem Langfuse Actually Solves

Running AI agents in production makes it obvious fast how useless traditional APM tools are. Datadog and New Relic are great at HTTP latency and error rates, but they can't tell you "how much did the retrieval step degrade overall response quality in this RAG pipeline?" Or how response quality shifted when a prompt version changed.

I compared Langfuse against Braintrust and LangSmith in the AI Agent Observability Production Guide. Self-hosting capability and open source licensing were Langfuse's clearest differentiators. This article goes past that comparison to actually building it locally.

What Langfuse provides:

- **Trace waterfall**: how long each agent step took, where bottlenecks appear
- **Token usage and cost tracking**: cumulative costs per model (GPT-4o, Claude Sonnet, etc.)
- **Prompt versioning**: manage prompts outside your codebase and run A/B tests
- **Datasets and evaluation**: automated quality scoring with LLM-as-judge
- **User session tracking**: follow a user's conversation flow across turns

Honestly, you don't need all of these from day one. What I actually use daily is just the trace waterfall and cost tracking. The rest can wait until the team grows or you need automated evaluation.

## Why the v3 Architecture Grew to Six Services

Langfuse v2 needed only PostgreSQL. The docker-compose.yml was 10 lines and started in five minutes. v3 is different. Pull the official docker-compose.yml and you'll find six services.

```
Service stack (from docker-compose.yml):
├── langfuse-web          (port 3000 — UI + API)
├── langfuse-worker       (port 3030 — background jobs)
├── ClickHouse            (8123, 9000 — OLAP analytics DB)
├── MinIO                 (9090 — S3-compatible object storage)
├── Redis 7               (6379 — queue + cache)
└── PostgreSQL 17         (5432 — relational DB)
```

Why the added complexity? The core v3 change was separating trace storage from PostgreSQL to ClickHouse. Aggregating "average latency trend over the last 30 days" across hundreds of thousands of traces was taking several seconds in PostgreSQL. ClickHouse is a columnar OLAP database optimized for exactly this kind of aggregation, and the same queries run in milliseconds.

I have complaints about this architectural complexity. Managing six containers for a small team or personal project is a burden. The Langfuse team knows this and continuously discusses lightweight deployment options, but as of May 2026, the full-stack configuration is the only officially supported path.

## Docker Compose Setup Step by Step

Prerequisites:

- Docker Engine 20.x or later
- Docker Compose v2 (Compose V1 is end-of-life)
- Minimum 4GB RAM (8GB recommended)
- 20GB+ disk space available

**Step 1: Download docker-compose.yml**

```bash
mkdir langfuse-local && cd langfuse-local
curl -sL https://raw.githubusercontent.com/langfuse/langfuse/main/docker-compose.yml \
  -o docker-compose.yml
```

**Step 2: Configure environment variables**

Find `# CHANGEME` comments in docker-compose.yml and replace with real values. At minimum, change these three:

```bash
cat > .env << 'EOF'
NEXTAUTH_SECRET=$(openssl rand -base64 32)
SALT=$(openssl rand -base64 16)
ENCRYPTION_KEY=$(openssl rand -hex 32)
DATABASE_URL=postgresql://langfuse:yourpassword@postgres:5432/langfuse
MINIO_ROOT_USER=langfuse
MINIO_ROOT_PASSWORD=yourminiopassword
CLICKHOUSE_PASSWORD=yourclickhousepassword
EOF
```

**Step 3: Start services**

```bash
docker-compose up -d

# Check status (takes 1-2 minutes to reach healthy state)
docker-compose ps
```

After successful startup, visiting `http://localhost:3000` shows a signup screen. The first registered account becomes the admin.

**Common issues on first boot**

ClickHouse initialization takes the longest. PostgreSQL and Redis usually reach healthy state within 30 seconds, but ClickHouse can take over a minute on first boot due to schema migrations. Because langfuse-worker waits for `depends_on: clickhouse: condition: service_healthy`, the worker might look like it's restarting repeatedly during this time. No need to panic.

If port 3000 is already in use, change langfuse-web's ports to `"3001:3000"` in docker-compose.yml.

## Building Your First Trace with Python SDK 4.x

The Langfuse SDK recently moved from v3 to v4. The biggest change in v4 is the removal of the `langfuse.decorators` module.

```bash
pip install langfuse  # current version: 4.5.1
```

```python
# v3 SDK (old — no longer works)
from langfuse.decorators import observe, langfuse_context  # ❌

# v4 SDK (current)
from langfuse import observe, get_client  # ✓
```

Environment variable configuration is the recommended approach:

```bash
export LANGFUSE_PUBLIC_KEY="pk-lf-your-public-key"
export LANGFUSE_SECRET_KEY="sk-lf-your-secret-key"
export LANGFUSE_HOST="http://localhost:3000"  # self-hosted
```

A basic trace starts with a single `@observe` decorator:

```python
from langfuse import observe, get_client

@observe()
def call_llm(prompt: str) -> str:
    response = "LLM response text"
    
    client = get_client()
    client.update_current_observation(
        model="claude-sonnet-4-5",
        usage_details={"input": 150, "output": 80},
        cost_details={"input": 0.000225, "output": 0.00032}
    )
    return response

result = call_llm("What's the weather like today?")
```

## Tracing a Real RAG Pipeline

As I explored when building [type-safe agents with PydanticAI](/en/blog/en/pydantic-ai-type-safe-agent-tutorial-2026), adding Langfuse to actual agent code makes it immediately clear which steps are driving costs. Below is the pattern I actually use in my projects.

```python
from langfuse import observe, get_client

@observe(as_type="retriever")
def vector_search(query: str, top_k: int = 5) -> list[dict]:
    """Vector DB search — marking as retriever type separates it in the UI"""
    client = get_client()
    client.update_current_observation(
        input={"query": query, "top_k": top_k},
        metadata={"index": "blog_posts"}
    )
    results = [
        {"id": f"doc_{i}", "content": f"Document {i}", "score": 0.9 - i * 0.1}
        for i in range(top_k)
    ]
    client.update_current_observation(output=results)
    return results


@observe(as_type="generation")
def llm_generate(query: str, context: list[dict]) -> str:
    """LLM response generation — generation type triggers token/cost aggregation"""
    client = get_client()
    client.update_current_observation(
        model="claude-sonnet-4-5",
        usage_details={"input": 450, "output": 150},
        cost_details={"input": 0.000675, "output": 0.0006}
    )
    return "Generated response"


@observe(name="rag_pipeline")
def run_rag(user_query: str) -> str:
    """Top-level pipeline — wraps sub-steps into a single trace"""
    docs = vector_search(user_query, top_k=3)
    answer = llm_generate(user_query, docs)
    return answer
```

Running this code produces the following trace waterfall in the Langfuse UI:

```
rag_pipeline                         ████████████████████ 1.8s
  └─ vector_search()   [retriever]   ██ 0.2s
  └─ llm_generate()    [generation]  █████████████████ 1.6s
      model: claude-sonnet-4-5
      input: 450 / output: 150 tokens
      cost: $0.001275
```

The `as_type` parameter is the key. Marking as `generation` automatically aggregates token usage and enables per-model cost analysis. `retriever` separates search latency into its own metric.

## Breaking Changes in v4 SDK

I got tripped up by the SDK v4 upgrade. An existing project used `from langfuse.decorators import observe` in about 50 places. All of them broke with `ModuleNotFoundError` the moment I installed v4.

| Item | v3 (old) | v4 (current) |
|------|---------|---------|
| observe import | `from langfuse.decorators import observe` | `from langfuse import observe` |
| context updates | `langfuse_context.update_current_observation` | `get_client().update_current_observation` |
| OTel integration | separate config required | native support |
| as_type values | limited strings | `generation`, `embedding`, `span`, `agent`, `tool`, `chain`, `retriever`, `evaluator`, `guardrail` |

The biggest architectural change in v4 is native OpenTelemetry integration. Where the previous SDK used a custom HTTP client to send data, v4 implements the OTel `SpanExporter` interface for full compatibility with the OpenTelemetry ecosystem. New classes like `LangfuseOtelSpanAttributes` appear for this reason.

Migration is mostly find-and-replace:

```bash
find . -name "*.py" -exec sed -i \
  's/from langfuse.decorators import observe, langfuse_context/from langfuse import observe, get_client/g' {} +
# langfuse_context.update_current_observation → get_client().update_current_observation
# This part requires manual editing per call site
```

## Prompt Versioning and Datasets

Where Langfuse goes beyond simple tracing: prompt versioning and dataset-based evaluation.

**Prompt versioning** lets you manage prompts outside your code repository:

```python
from langfuse import get_client

client = get_client()
prompt = client.get_prompt("blog-title-generator", version=3)
compiled = prompt.compile(
    topic="LLM Observability",
    tone="practical",
    audience="developers"
)
```

Managing prompts this way means "why did response quality drop on the day we used version 2?" becomes a question you can answer immediately in the Langfuse UI.

If you've built an MCP server directly, adding Langfuse tracing to its LLM calls is the natural next step. MCP servers tend to have long tool invocation chains, which is exactly where trace waterfalls are most valuable.

## When Self-Hosting Doesn't Make Sense

There are cases where I wouldn't recommend self-hosting. I'll be direct about them.

**Self-hosting makes sense when:**
- Trace data includes sensitive personal information (healthcare, finance)
- Monthly trace volume exceeds 100K and Cloud costs are real
- You're already running Kubernetes-based infrastructure

**Just use the Cloud when:**
- Team is 3 people or fewer with no infrastructure management bandwidth
- Traces stay under 50K/month (Langfuse Cloud free tier)
- You don't want to manage backups, scaling, and updates yourself

I run two projects simultaneously — one on Cloud, one self-hosted. Honestly, ClickHouse consuming 2GB+ of memory still feels wasteful for the scale I'm running.

## Troubleshooting FAQ

**Q. langfuse-web keeps restarting after docker-compose up**

ClickHouse or Redis initialization hasn't finished. Wait 1-2 minutes and it usually resolves. If it doesn't, check `docker-compose logs langfuse-web` for the error message.

**Q. Traces aren't showing up in the Langfuse UI**

The most common cause is the process exiting before the SDK's async flush completes. Call `get_client().flush()` explicitly at the end of scripts, or `await get_client().async_flush()` in async environments.

**Q. NEXTAUTH_SECRET configuration for production**

Leaving `NEXTAUTH_SECRET` as the default value is a security risk in self-hosted setups. Generate a value with `openssl rand -base64 32` and set it in your environment variables.

## When You Actually Reach for LLM Observability

In my experience, LLM tracing gets adopted not before the first deployment but immediately after the first baffling response. When that moment comes and Langfuse is already running, you find the root cause in five minutes. Without it, you spend hours digging through log files.

Langfuse 4.5.1 SDK starts with `pip install langfuse` and a single `@observe` decorator. The self-hosting stack is heavier now, but ClickHouse's aggregation query performance more than justifies the complexity.

Prepare the Docker Compose configuration before the Langfuse Cloud free tier runs out.
