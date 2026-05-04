---
title: 'Google ADK vs LangGraph 2026: I Installed Both and Compared Them Side by Side'
description: >-
  I ran Google ADK v1.32.0 and LangGraph v1.1.10 in a sandbox and compared
  their code patterns, dependencies, state management, conditional branching,
  and deployment CLIs. Here's what I found and when you should choose each.
pubDate: '2026-05-04'
heroImage: ../../../assets/blog/google-adk-vs-langgraph-hero.png
tags:
  - google-adk
  - langgraph
  - ai-agent
relatedPosts:
  - slug: ai-agent-framework-comparison-2026-langgraph-crewai-dapr-production
    score: 0.92
    reason:
      ko: 이 글이 ADK와 LangGraph 1:1 비교라면, 저 글은 LangGraph·CrewAI·Dapr를 프로덕션 기준으로 비교해서 LangGraph 선택 맥락을 넓혀준다.
      ja: このブログがADKとLangGraphの1対1比較なら、その記事はLangGraph・CrewAI・DaprをプロダクションのKPIで比較し、LangGraph選択の文脈を広げる。
      en: This post is an ADK vs LangGraph 1:1 comparison; that post broadens the LangGraph selection context by comparing it to CrewAI and Dapr on production KPIs.
      zh: 本文是ADK与LangGraph的1:1比较，那篇文章则以生产KPI对LangGraph、CrewAI和Dapr进行比较，拓宽了LangGraph的选择背景。
  - slug: mcp-server-build-practical-guide-2026
    score: 0.79
    reason:
      ko: ADK가 내장 MCP 지원을 강점으로 내세우는데, MCP 서버를 직접 만들어본 경험이 있어야 그 차이가 와닿는다.
      ja: ADKが内蔵MCPサポートを強みとしているが、MCPサーバーを自分で構築した経験があってこそ、その差異が実感できる。
      en: ADK touts built-in MCP support as a key advantage — you'll appreciate that only after building your own MCP server.
      zh: ADK以内置MCP支持为优势，只有自己构建过MCP服务器，才能真正体会到这一差异。
  - slug: langfuse-self-hosted-llm-tracing-setup-guide-2026
    score: 0.74
    reason:
      ko: ADK는 OpenTelemetry 기반 트레이싱을 내장하는데, Langfuse로 LLM 트레이싱을 직접 구축해본 경험과 비교하면 ADK 선택의 장단점이 선명해진다.
      ja: ADKはOpenTelemetryベースのトレースを内蔵しているが、LangfuseでLLMトレースを構築した経験と比較するとADK選択の長所・短所がより明確になる。
      en: ADK bundles OpenTelemetry-based tracing; comparing that with building LLM tracing yourself via Langfuse makes the ADK trade-off much clearer.
      zh: ADK内置了基于OpenTelemetry的追踪，与通过Langfuse自己构建LLM追踪的经验相比，ADK的选择优缺点更加清晰。
  - slug: context-engineering-production-ai-agents
    score: 0.72
    reason:
      ko: ADK와 LangGraph 모두 에이전트의 상태·컨텍스트 관리가 핵심인데, 컨텍스트 엔지니어링 관점에서 두 프레임워크를 보면 설계 의도가 더 잘 읽힌다.
      ja: ADKもLangGraphもエージェントの状態・コンテキスト管理が核心であり、コンテキストエンジニアリングの観点から両フレームワークを見ると設計意図がより明確になる。
      en: Both ADK and LangGraph hinge on agent state and context management — viewing them through a context-engineering lens makes their design choices easier to read.
      zh: ADK和LangGraph都以智能体的状态和上下文管理为核心，从上下文工程的角度看这两个框架，更容易读懂其设计意图。
---

Every time a new AI agent framework drops, my first instinct is to install it and figure out what's actually different. When Google open-sourced ADK (Agent Development Kit), I set up a clean sandbox environment and ran Google ADK v1.32.0 alongside LangGraph v1.1.10. This post is what I found.

![Sandbox execution logs comparing ADK and LangGraph](../../../assets/blog/google-adk-vs-langgraph-logs.png)

## Two Different Philosophies

Google ADK's core message is "apply software development principles to AI agents." That becomes concrete the moment you write code. ADK defines agents as Python classes and functions. Built-in orchestrators — `SequentialAgent`, `ParallelAgent`, `LoopAgent` — let you declare flow naturally inside your code.

```python
from google.adk.agents import Agent, SequentialAgent, ParallelAgent

weather_agent = Agent(
    name="weather_agent",
    model="gemini-2.5-flash",
    instruction="Get weather data using the get_weather tool.",
    tools=[get_weather],
)

analysis_agent = Agent(
    name="analysis_agent",
    model="gemini-2.5-flash",
    instruction="Analyze the weather data and give a forecast.",
)

# Sequential execution: weather → analysis
pipeline = SequentialAgent(
    name="weather_pipeline",
    sub_agents=[weather_agent, analysis_agent],
)
```

No separate graph definition, no edge declarations. The Python code itself expresses the flow.

LangGraph takes the opposite approach. It models agent workflows as **explicit graphs**. Nodes represent processing stages; edges define transitions between them. You design the graph first, then add logic on top.

```python
from typing import TypedDict, Annotated
from langgraph.graph import StateGraph, END
from langgraph.graph.message import add_messages
from langchain_core.messages import HumanMessage, AIMessage

class State(TypedDict):
    messages: Annotated[list, add_messages]

def greet_node(state: State):
    return {"messages": [AIMessage(content="Hello from LangGraph!")]}

def analyze_node(state: State):
    last = state["messages"][-1].content
    return {"messages": [AIMessage(content=f"Analysis: {last}")]}

builder = StateGraph(State)
builder.add_node("greet", greet_node)
builder.add_node("analyze", analyze_node)
builder.set_entry_point("greet")
builder.add_edge("greet", "analyze")
builder.add_edge("analyze", END)

graph = builder.compile()
```

The way I see it: ADK says "assemble a pipeline in code"; LangGraph says "design a state machine." Neither is objectively better — it's about which feels more natural for your problem.

## The Dependency Gap Is Shocking

```bash
pip install google-adk langgraph
```

Both install fine, but `pip show` reveals a stark difference:

**Google ADK v1.32.0 — 45 direct dependencies:**
```
aiosqlite, anyio, authlib, click, fastapi,
google-api-python-client, google-auth,
google-cloud-aiplatform, google-cloud-bigquery,
google-cloud-bigquery-storage, google-cloud-bigtable,
google-cloud-dataplex, google-cloud-discoveryengine,
google-cloud-pubsub, google-cloud-secret-manager,
google-cloud-spanner, google-cloud-speech,
google-cloud-storage, google-genai, graphviz,
httpx, jsonschema, mcp, opentelemetry-api,
opentelemetry-exporter-gcp-logging,
opentelemetry-exporter-gcp-monitoring,
opentelemetry-exporter-gcp-trace,
... (45 total)
```

**LangGraph v1.1.10 — 6 direct dependencies:**
```
langchain-core, langgraph-checkpoint,
langgraph-prebuilt, langgraph-sdk,
pydantic, xxhash
```

A 39-package gap. ADK bundles Google Cloud services (BigQuery, Spanner, Pub/Sub, Speech, etc.), OpenTelemetry exporters, a FastAPI server, and SQLAlchemy ORM. If you're not using Google Cloud, those 39 extra packages are pure dead weight.

LangGraph's "bring what you need" philosophy is lighter but requires more configuration. You inject your own LLM client, choose your own checkpoint backend. Less magic, more control.

## Multi-Agent Patterns: Where the Difference Matters Most

**ADK parallel execution** — this is actual code I ran:

```python
parallel_research = ParallelAgent(
    name="parallel_research",
    sub_agents=[google_researcher, arxiv_researcher],
)

pipeline = SequentialAgent(
    name="research_pipeline",
    sub_agents=[parallel_research, synthesizer],
)
```

Execution: `research_pipeline (SequentialAgent)` → `parallel_research (ParallelAgent)` → `synthesizer`. Clean, readable, obvious.

**LangGraph conditional edges** — this is where ADK falls short:

```python
def should_retry(state: State) -> str:
    if state.get("quality_score", 0) < 80:
        return "generate"  # quality too low → retry
    return END              # quality passed → done

builder.add_conditional_edges("evaluate", should_retry)
```

I ran this in my sandbox:

```
=== Conditional Edge Test ===
  [evaluate] iteration=1, score=60  → routed to: generate
  [evaluate] iteration=2, score=80  → routed to: END
Final score: 80, total iterations: 2
```

The agent retries automatically until quality passes. ADK's `LoopAgent` supports iteration too, but termination is controlled by `max_iterations`. Dynamic branching — "if this condition, go here; otherwise go there" — is where LangGraph's conditional edges shine. For production pipelines with generate-verify-retry loops, router agents, or multi-judgment branching, LangGraph is significantly more powerful.

## ADK's Killer Feature: The CLI and Built-in Evaluation

Installing ADK drops the `adk` CLI:

```
$ adk --help
Commands:
  api_server   Starts a FastAPI server for agents.
  conformance  Conformance testing tools for ADK.
  create       Creates a new app with prepopulated code.
  deploy       Deploys agent to hosted environments.
  eval         Evaluates an agent given eval sets.
  eval_set     Manage Eval Sets.
  migrate      ADK migration commands.
  optimize     Optimizes root agent instructions (GEPA).
  run          Runs an interactive CLI for an agent.
  web          Starts a FastAPI server with Web UI.
```

`adk web` is particularly useful. Point it at your agent code and a FastAPI-backed web UI spins up for local visual testing. `adk eval` lets you define evaluation sets and run regression tests against your agent automatically. LangGraph has none of this built in.

`adk deploy` supports direct deployment to Google Cloud Run or Vertex AI Agent Builder. If you're on GCP, development to deployment stays within a single tool chain.

The downside: this CLI is entirely Google-ecosystem bound. `adk deploy` is useless on AWS or Azure. The built-in tracing outputs to GCP Cloud Trace — connecting to other observability stacks requires extra configuration.

That's where a vendor-agnostic tool like [Langfuse for LLM tracing](/en/blog/en/langfuse-self-hosted-llm-tracing-setup-guide-2026) fits more naturally with LangGraph's approach.

## State Management: Sessions vs Checkpoints

**ADK's state management** is session-based:

```python
from google.adk.runners import InMemoryRunner
from google.adk.sessions import InMemorySessionService

session_service = InMemorySessionService()
runner = InMemoryRunner(agent=root_agent, app_name="my_app")
```

ADK maintains multi-turn conversation state via `session_id`. In production, swap `InMemorySessionService` for `VertexAiSessionService` for persistence. Inter-agent data flows through a shared `State` dictionary.

**LangGraph's state management** uses TypedDict + Checkpoint:

```python
from langgraph.checkpoint.memory import MemorySaver

checkpointer = MemorySaver()
graph = builder.compile(checkpointer=checkpointer)

config = {"configurable": {"thread_id": "user-123"}}
result = graph.invoke({"messages": [HumanMessage(content="Hello")]}, config)
```

LangGraph's checkpoint system is more flexible. Swap `MemorySaver` for PostgreSQL, Redis, or SQLite backends. Time-travel debugging — rewinding to a past checkpoint — is also supported.

I consider LangGraph stronger here. Swapping checkpoint backends means dev and production can run identical code. No vendor lock-in.

ADK does beat LangGraph on one point: [MCP tool server](/en/blog/en/mcp-server-build-practical-guide-2026) support is built in. `MCPToolset` works out of the box. With LangGraph, you need a separate package and adapter code.

## Comparison Table

| Aspect | Google ADK v1.32.0 | LangGraph v1.1.10 |
|--------|-------------------|-------------------|
| Direct dependencies | 45 | 6 |
| Orchestration style | Sequential/Parallel/LoopAgent (declarative) | StateGraph + nodes/edges (explicit graph) |
| Conditional branching | LoopAgent max_iterations (limited) | conditional_edges (powerful) |
| Default LLM | Gemini (others supported) | Model-agnostic (inject any LLM) |
| CLI | adk create/run/web/eval/deploy ✓ | None |
| Built-in Web UI | adk web ✓ | None |
| Built-in eval framework | adk eval ✓ | None (external tooling needed) |
| MCP support | MCPToolset built-in ✓ | Separate package needed |
| State management | Session-based (VertexAI backend) | TypedDict + Checkpoint (swappable backends) |
| Deployment | Google Cloud Run / Vertex AI | Cloud-agnostic |
| OpenTelemetry | GCP exporters built-in | Manual setup |
| Time-travel debugging | No | ✓ |
| Multi-language SDK | Python, Go, Java, TypeScript | Python (primary) |
| License | Apache 2.0 | MIT |

## Which Framework for Which Team

**Google ADK fits when:**

- Your infrastructure is already on Google Cloud
- Gemini is your primary model
- You want development-to-deployment in a single toolchain
- You don't want to build an agent evaluation pipeline from scratch
- Your team works in Go, Java, or TypeScript alongside Python

**LangGraph fits when:**

- Your agent workflows have complex branching logic
- You're on AWS, Azure, or multi-cloud
- You mix multiple LLMs (OpenAI, Anthropic, Mistral, etc.)
- You have existing LangChain-based code
- You need time-travel debugging or checkpoint replay
- You're minimizing dependencies for edge deployments

If I were starting a new project today, I'd reach for LangGraph. The reason is pragmatic: conditional branching and checkpoint flexibility become necessary in production-grade agents, and retrofitting them later often means redesigning the whole structure. Starting with ADK's `LoopAgent` and needing dynamic routing later could force a significant rewrite.

That said, for teams already on GCP, the ADK toolchain is genuinely compelling. `adk deploy` to Cloud Run plus `adk eval` for regression testing would take real work to replicate in the LangGraph ecosystem.

## My Take: Design Philosophy Decides the Choice

Both frameworks are production-ready in 2026. The difference is what they optimize for.

ADK optimizes for "build an agent system fast and deploy it to GCP." LangGraph optimizes for "precisely control the state transitions in your agent."

The mistake I see in most framework comparisons is ranking by feature count. ADK has a CLI, eval, and deployment — so it wins? No. The real question is: does the framework's growth direction match my agent's complexity growth direction?

If a simple pipeline will evolve toward complex branching, choose LangGraph early. If the goal is fast delivery within the Google Cloud ecosystem, ADK removes a lot of friction.

For broader context on how LangGraph compares with other frameworks, the [LangGraph vs CrewAI vs Dapr comparison](/en/blog/en/ai-agent-framework-comparison-2026-langgraph-crewai-dapr-production) is worth reading — it benchmarks them on production KPIs before ADK entered the picture.
