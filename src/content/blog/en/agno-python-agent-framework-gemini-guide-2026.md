---
title: "Building AI Agents with Agno — I Actually Ran It with Gemini and Built-in Tools"
description: "I installed Agno v2.6.17 (formerly Phidata) in a sandbox and ran Calculator, Wikipedia, structured output, and multi-agent team features with real execution logs. Includes honest account of the traps I fell into: output_schema vs output_model, deprecated model IDs, and Team API naming changes."
pubDate: '2026-06-18'
heroImage: ../../../assets/blog/agno-python-agent-framework-gemini-guide-2026-hero.png
tags:
  - python
  - agno
  - ai-agent
relatedPosts:
  - slug: python-ai-agent-library-comparison-2026
    score: 0.92
    reason:
      ko: Agno를 PydanticAI, Instructor, Smolagents와 비교할 때 이 글이 기준점이 됩니다.
      en: This post gives you the comparison baseline when choosing between Agno, PydanticAI, Instructor, and Smolagents.
      ja: Agnoと他のライブラリを比較する際の基準になる記事です。
      zh: 这篇文章是比较 Agno 与 PydanticAI、Smolagents 时的参考基准。
  - slug: pydantic-ai-type-safe-agent-tutorial-2026
    score: 0.88
    reason:
      ko: Agno의 output_schema가 익숙해졌다면, PydanticAI의 타입 안전 패턴도 바로 이어서 볼 만합니다.
      en: If Agno's output_schema made sense, PydanticAI's output_type does similar things with a different philosophy — worth reading back-to-back.
      ja: Agnoのoutput_schemaに慣れたら、PydanticAIのタイプセーフパターンも続けて読む価値があります。
      zh: 熟悉了 Agno 的 output_schema 之后，PydanticAI 的类型安全模式是自然的下一步。
  - slug: google-adk-vs-langgraph-agent-framework-comparison-2026
    score: 0.83
    reason:
      ko: Agno의 경량 철학과 Google ADK·LangGraph의 엔터프라이즈 접근법을 대조해서 읽으면 프레임워크 선택 기준이 더 명확해집니다.
      en: Agno's lightweight philosophy contrasts well with ADK and LangGraph's heavier state-graph approach — helps you decide which one actually fits your project.
      ja: Agnoの軽量哲学とGoogle ADK・LangGraphの重い状態グラフアプローチを対比すると、選択基準が明確になります。
      zh: 将 Agno 的轻量哲学与 Google ADK、LangGraph 的企业级方法对比，有助于明确框架选择标准。
  - slug: mastra-ai-typescript-agent-framework-guide-2026
    score: 0.78
    reason:
      ko: Python 쪽은 Agno, TypeScript 쪽은 Mastra — 언어별 에이전트 프레임워크 생태계 전체 그림을 잡을 수 있습니다.
      en: Agno covers the Python side, Mastra covers TypeScript — reading both gives you a complete picture of the 2026 agent framework landscape.
      ja: PythonはAgno、TypeScriptはMastra — 両方読むとエージェントフレームワークの全体像が見えます。
      zh: Python 用 Agno，TypeScript 用 Mastra — 两篇合读可以掌握两种语言的 Agent 框架全貌。
---

If you've ever felt like LangChain was too heavy, you're not alone. The dependency tree is enormous. Abstraction layers pile up. At some point you lose track of what's actually happening underneath. That frustration has pushed a lot of people toward lighter alternatives — frameworks that prove you can build a capable agent without a hundred transitive dependencies.

Agno is one of those alternatives. It started as Phidata and rebranded in early 2025. I spent an afternoon installing Agno v2.6.17 in a clean sandbox and running through Calculator tools, Wikipedia retrieval, Pydantic structured output, and a two-agent Team. I'll share the real execution logs and, more importantly, the traps I hit that the docs don't warn you about.

## What Agno Is and Where It Came from

Phidata built a solid reputation as "the Python framework for AI assistants." When it rebranded to Agno in 2025, the design philosophy got articulated more clearly around three ideas.

**Model-agnostic from day one.** Over 70 LLMs — OpenAI, Anthropic, Google, Ollama, Cohere — can plug in with the same code structure. Swap the model, keep the agent logic.

**Multimodal as a default.** Text, image, audio, video agents all use the same API surface. You don't need a different abstraction layer for each modality.

**Multi-agent orchestration as a first-class citizen.** The `Team` class is built in. You can switch between `coordinate`, `route`, and `collaborate` modes with a single parameter change.

Reading that, I thought: "How is this different from LangChain?" The answer showed up when I actually wrote code. Agno favors composition over class inheritance. One agent takes about 6 lines to set up. There's far less boilerplate to wade through.

## Installation: No Dependency Hell

```bash
pip install agno google-genai ddgs wikipedia
```

The `agno` package installs just the core. Tools require their own extra dependencies — `wikipedia` for the Wikipedia tool, `google-genai` for Gemini. This lazy-loading approach keeps the base install clean.

```bash
$ python3 -c "import agno; print(agno.__version__)"
2.6.17
```

I used the Gemini API key from my project `.env`. Agno auto-initializes the Gemini client from either `GOOGLE_API_KEY` or `GEMINI_API_KEY`. If both are set, it uses `GOOGLE_API_KEY` and prints a warning to stdout. Not a big deal, but you can't suppress it easily from code.

## First Agent: Calculator Tool

```python
from agno.agent import Agent
from agno.models.google import Gemini
from agno.tools.calculator import CalculatorTools

agent = Agent(
    model=Gemini(id="gemini-2.5-flash"),
    tools=[CalculatorTools()],
    description="A math helper agent",
)

response = agent.run("What is 2^10 + 3^5? Please use the calculator.")
print(response.content)
```

Output:

```
2^10 is 1024 and 3^5 is 243. Adding them gives 1267.
⏱ 8.98s
```

The math is right: 1024 + 243 = 1267. The agent invoked the Calculator tool rather than letting the LLM guess. The 9-second latency includes a Gemini API round-trip plus the tool call overhead.

**Trap #1: `show_tool_calls` is gone.** Older Agno tutorials use `show_tool_calls=True`. In v2.6.17, that raises `TypeError: Agent.__init__() got an unexpected keyword argument 'show_tool_calls'`. Use `debug_mode=True` instead if you want verbose output.

**Trap #2: `gemini-2.0-flash` is deprecated.** Using that model ID throws a 404:

```
ERROR    Error from Gemini API: 404 NOT_FOUND.
{'error': {'message': 'This model models/gemini-2.0-flash is no longer available.'}}
```

Use `gemini-2.5-flash`. Always verify the current model IDs on Google's docs before hardcoding them.

## Wikipedia Agent: Automatic Search Retry

```python
from agno.tools.wikipedia import WikipediaTools

agent = Agent(
    model=Gemini(id="gemini-2.5-flash"),
    tools=[WikipediaTools()],
)

response = agent.run(
    "What is the 'attention mechanism' in neural networks? 2 sentences only."
)
```

Execution log:

```
INFO Searching wikipedia for: attention mechanism neural networks
ERROR Error searching Wikipedia for 'attention mechanism neural networks':
      Page id "attention mechanism neural network" does not match any pages.
INFO Searching wikipedia for: attention (machine learning)
⏱ 9.98s

In machine learning, attention is a method that determines the importance
of each component in a sequence relative to the other components...
```

The interesting bit: the first search failed, and the agent automatically reformulated the query (`attention (machine learning)`) and retried. No extra code required. Agno runs a ReAct loop internally — plan, act, observe, adjust. Tool failures are handled gracefully.

Compared with the code-execution approach in Smolagents (covered in the [Python AI agent library comparison post](/en/blog/en/python-ai-agent-library-comparison-2026)), Agno leans more toward tool composition than code generation. Neither is strictly better; it depends on what you're building.

## Structured Output: Use `output_schema`, Not `output_model`

This is the most confusing naming in the API. There's a parameter called `output_model`. Naturally you'd think: "Put the Pydantic model here." That's wrong.

```python
# This fails
agent = Agent(
    model=Gemini(id="gemini-2.5-flash"),
    output_model=DeveloperProfile,  # ← WRONG
)
# ValueError: Model must be a Model instance, string, or None
```

`output_model` expects an LLM model instance (or string model ID). For Pydantic structured output, use `output_schema`:

```python
from pydantic import BaseModel
from typing import List

class Skill(BaseModel):
    name: str
    level: str
    year_since: int

class DeveloperProfile(BaseModel):
    name: str
    skills: List[Skill]
    summary: str

agent = Agent(
    model=Gemini(id="gemini-2.5-flash"),
    output_schema=DeveloperProfile,  # ← CORRECT
)

response = agent.run(
    "Create a developer profile for 'Kim Jangwook', a Korean developer "
    "specializing in Claude Code, MCP, Python, TypeScript."
)

print(type(response.content))   # <class '__main__.DeveloperProfile'>
print(response.content.name)    # Kim Jangwook
```

Actual output:

```
⏱ 4.00s
Type: DeveloperProfile
Name: Kim Jangwook
Skills:
  - Claude Code: Expert (since 2022)
  - MCP: Certified (since 2019)
  - Python: Senior (since 2018)
  - TypeScript: Intermediate (since 2020)
```

`response.content` returns an actual Pydantic instance. Parsing is handled internally; you get full IDE autocomplete on the result. The 4-second latency (vs 9 seconds for the Calculator agent) reflects the absence of tool call round-trips.

This is similar in spirit to [PydanticAI's `output_type` parameter](/en/blog/en/pydantic-ai-type-safe-agent-tutorial-2026), but the naming diverges. When jumping between frameworks, you need to memorize each one's vocabulary — that's friction that accumulates.

## Multi-Agent Team: `members=`, Not `agents=`

```python
from agno.team import Team

researcher = Agent(
    name="Researcher",
    model=Gemini(id="gemini-2.5-flash"),
    tools=[WikipediaTools()],
    role="researcher",
)

calculator = Agent(
    name="Calculator",
    model=Gemini(id="gemini-2.5-flash"),
    tools=[CalculatorTools()],
    role="calculator",
)

team = Team(
    members=[researcher, calculator],  # ← NOT agents=
    model=Gemini(id="gemini-2.5-flash"),
    name="Research & Calc Team",
    mode="coordinate",
)
```

**Trap #3: `agents=` doesn't exist in Team.** Writing `Team(agents=[...])` throws:

```
TypeError: Team.__init__() got an unexpected keyword argument 'agents'
```

The correct parameter is `members=[...]`. You'd only know this from reading the source — the documentation still shows `agents=` in some places.

Running the team:

```python
response = team.run(
    "Find the year 'Attention is All You Need' was published on Wikipedia, "
    "then calculate how many years ago that was from 2026."
)
print(response.content)
```

Result:

```
INFO Searching wikipedia for: Attention is All You Need
⏱ 13.83s

'Attention is All You Need' was published in 2017. 
As of 2026, that is 9 years ago.
```

The team leader (the Gemini model passed to `Team`) analyzed the task, routed the Wikipedia lookup to the Researcher agent and the subtraction to the Calculator agent. Both returned correct results. The 14-second latency reflects sequential agent execution — `coordinate` mode doesn't parallelize in v2.6.17.

## 100+ Built-in Tools

One of Agno's practical advantages: the built-in tool library.

```python
import agno.tools as t, pkgutil
tools = [name for _, name, _ in pkgutil.iter_modules(t.__path__)]
# Over 100 entries including: 'arxiv', 'bravesearch', 'calculator',
# 'docker', 'duckduckgo', 'email', 'github', 'gmail',
# 'google_bigquery', 'jira', 'mcp', 'mem0', 'notion',
# 'postgres', 'slack', 'sql', 'tavily', 'wikipedia',
# 'yfinance', 'youtube', 'zoom', ...
```

In practice: give Agno a `BRAVE_API_KEY` and you have a web search agent running in under 5 minutes without writing any API wrapper code. Same story for Slack, Notion, GitHub, and Postgres integrations.

The catch: not all tools are zero-install. Each tool module has its own dependency. `agno.tools.duckduckgo` needs `ddgs`, `agno.tools.wikipedia` needs `wikipedia`, and so on. If you import before installing, you get `ImportError` at the import line for some tools and at first use for others. Inconsistent behavior across modules.

## What I Think Are the Actual Limitations

The latency is real. 9 seconds for a single Calculator call, 14 for a two-agent team — this is Gemini API round-trip cost compounded by tool calls, not an Agno inefficiency per se. But it matters for production APIs where users expect sub-second responses.

Debugging is manual. `debug_mode=True` spits out unstructured logs. I haven't found an official integration guide for LangSmith or LangFuse. If observability matters, you'll need to wire it up yourself.

The docs lag behind the API. `show_tool_calls`, `output_model`, `agents=` — these are examples of parameters whose behavior in the docs doesn't match the current codebase. Always check the GitHub `examples/` directory for the latest version, not the tutorial blog posts.

The Team's `coordinate` mode is sequential. If you need parallel agent execution or complex conditional branching across many agents, [Google ADK or LangGraph](/en/blog/en/google-adk-vs-langgraph-agent-framework-comparison-2026) are better fits.

## When Agno Makes Sense

Three scenarios where I'd reach for Agno:

**Rapid prototyping.** An API key plus 10 lines of Python and you have a working agent. Great for PoCs, internal tools, solo projects where speed to first working version matters more than architectural elegance.

**Multi-tool agents.** When you need an agent that touches Slack, reads from Postgres, sends an email, and searches the web — Agno's tool library means you spend time on the agent logic, not on writing API wrappers.

**Small agent teams (2-4 agents).** Agno's `Team` class handles small coordination problems cleanly. Once you get into dozens of agents with complex dependency graphs, a state-graph framework gives you more explicit control.

Where I wouldn't use Agno: real-time streaming UIs, production workflows requiring precise error handling and retry guarantees, or systems where you need to audit exactly what each agent decided and why at every step.

## What's Next to Explore

Two things I didn't test today:

**Agent memory.** Agno has `enable_agentic_memory=True` with SQLite-backed storage. Cross-session memory persistence is the piece that would make agents feel genuinely stateful rather than starting fresh each time.

**MCP tool integration.** `agno.tools.mcp` exists. If Agno agents can connect to MCP servers as tool sources, that means reusing existing MCP server infrastructure without rewriting anything. Worth testing.

## Summary

- Agno v2.6.17 installs cleanly via `pip install agno`; Calculator, Wikipedia, Team all ran successfully
- Use `gemini-2.5-flash` as the model ID — `gemini-2.0-flash` is deprecated and returns 404
- Structured output uses `output_schema=YourPydanticModel`, not `output_model`
- `Team` takes `members=[...]`, not `agents=[...]`
- 100+ built-in tools, each requiring its own dependency install
- Strong for prototyping and multi-tool agents; reach for LangGraph for complex state machines

If you've been frustrated by LangChain's weight and want a Python agent framework that gets out of your way, Agno is worth an afternoon of experimentation.
