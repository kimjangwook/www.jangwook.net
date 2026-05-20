---
title: 'AutoGen 0.7.x: Building Multi-Agent Systems from Scratch'
description: 'Hands-on AutoGen 0.7.x guide. Build RoundRobinGroupChat, SelectorGroupChat, GraphFlow, FunctionTool step-by-step with real code, comparing with 0.2.x.'
pubDate: '2026-05-19'
heroImage: '../../../assets/blog/microsoft-autogen-1-0-production-agent-tutorial-hero.png'
tags:
  - autogen
  - multi-agent
  - python
relatedPosts:
  - slug: ai-agent-framework-comparison-2026-langgraph-crewai-dapr-production
    score: 0.91
    reason:
      ko: AutoGen 0.7.x 아키텍처가 왜 LangGraph나 Dapr와 다른 접근을 택했는지 비교하면 더 명확해진다.
      ja: AutoGen 0.7.xのアーキテクチャがLangGraphやDaprと異なるアプローチを取った理由を比較するとより明確になる。
      en: Comparing why AutoGen 0.7.x chose a different approach from LangGraph or Dapr makes the design clearer.
      zh: 比较AutoGen 0.7.x为何选择与LangGraph或Dapr不同的方案，能让设计意图更清晰。
  - slug: python-ai-agent-library-comparison-2026
    score: 0.88
    reason:
      ko: PydanticAI, Smolagents 등 다른 Python 에이전트 라이브러리와의 생태계 포지션을 파악하는 데 도움이 된다.
      ja: PydanticAIやSmolagentsなど他のPythonエージェントライブラリとのエコシステムポジションを把握するのに役立つ。
      en: Useful for understanding AutoGen's ecosystem position alongside PydanticAI, Smolagents, and other Python agent libraries.
      zh: 有助于了解AutoGen在PydanticAI、Smolagents等Python智能体库生态中的定位。
  - slug: claude-agent-sdk-subagents-orchestration-tutorial-2026
    score: 0.85
    reason:
      ko: Claude Agent SDK의 서브에이전트 오케스트레이션과 AutoGen의 팀 기반 오케스트레이션을 비교해보면 각 방식의 트레이드오프가 잘 보인다.
      ja: Claude Agent SDKのサブエージェントオーケストレーションとAutoGenのチームベースオーケストレーションを比較すると各方式のトレードオフがよく見える。
      en: Comparing Claude Agent SDK subagent orchestration with AutoGen's team-based approach makes the trade-offs of each model visible.
      zh: 对比Claude Agent SDK的子智能体编排与AutoGen的团队编排方式，能清晰看出各方案的权衡。
  - slug: pydantic-ai-type-safe-agent-tutorial-2026
    score: 0.82
    reason:
      ko: PydanticAI와 AutoGen은 둘 다 Python 에이전트 프레임워크지만 설계 철학이 정반대다. 두 튜토리얼을 비교하면 자신에게 맞는 스택을 고르는 데 유리하다.
      ja: PydanticAIとAutoGenはどちらもPythonエージェントフレームワークだが設計哲学が正反対だ。両方のチュートリアルを比較すると自分に合ったスタックを選ぶのに有利だ。
      en: PydanticAI and AutoGen are both Python agent frameworks but with opposite design philosophies. Comparing both tutorials helps you choose the right stack.
      zh: PydanticAI与AutoGen都是Python智能体框架，但设计哲学截然相反。对比两个教程有助于选择适合自己的技术栈。
  - slug: dapr-agents-v1-cncf-production-ai-framework
    score: 0.78
    reason:
      ko: Dapr Agents가 Kubernetes 수준의 인프라 내구성을 노렸다면, AutoGen은 에이전트 간 협업 프로토콜을 먼저 잡는 방향이다. 두 접근을 함께 보면 "에이전트 오케스트레이션" 전체 그림이 나온다.
      ja: Dapr AgentsがKubernetesレベルのインフラ耐久性を狙ったとすれば、AutoGenはエージェント間の協調プロトコルを先に固める方向だ。両方を合わせて見ると「エージェントオーケストレーション」全体像が見える。
      en: If Dapr Agents targets Kubernetes-level infrastructure durability, AutoGen focuses first on inter-agent collaboration protocols. Together they paint the full picture of agent orchestration.
      zh: 如果说Dapr Agents瞄准Kubernetes级别的基础设施持久性，那么AutoGen则优先建立智能体间的协作协议。两者结合看能看清"智能体编排"的全貌。
---

When I first tried to pick up AutoGen, Google search results mixed 0.2.x and 0.4.x examples in the same page. One snippet configures an agent with `llm_config={"model": "gpt-4"}`, another with `model_client=OpenAIChatCompletionClient(...)`. Those two patterns target completely different AutoGen versions and are not interchangeable.

The current latest stable release is **0.7.5** under the `autogen-agentchat` package. Its API is a full break from 0.2.x — following an old tutorial will get you nowhere. This post is based on direct installation and execution on macOS, walking through the new 0.7.x API from the ground up.

## Why AutoGen 0.7.x Replaced the Entire API

In 0.2.x, creating an `AssistantAgent` looked like this:

```python
# 0.2.x pattern (no longer works)
from autogen import AssistantAgent

assistant = AssistantAgent(
    name="assistant",
    llm_config={"model": "gpt-4", "api_key": "..."}
)
```

In 0.7.x, the model client is a separate injected object:

```python
# 0.7.x pattern
from autogen_agentchat.agents import AssistantAgent
from autogen_ext.models.openai import OpenAIChatCompletionClient

model_client = OpenAIChatCompletionClient(model="gpt-4o", api_key="...")
assistant = AssistantAgent(name="assistant", model_client=model_client)
```

The motivation is **multi-backend model support**. In 0.7.x you can swap between Anthropic Claude, Azure OpenAI, Ollama (local LLM), and LLaMA.cpp through the same interface. Change the model without touching agent code.

## Installation (5 Minutes)

```bash
python3 -m pip install autogen-agentchat autogen-ext
```

On my setup (macOS, Python 3.12.8), this installed `autogen-agentchat-0.7.5`, `autogen-core-0.7.5`, and `autogen-ext-0.7.5` together. These three packages form a layered architecture:

- `autogen-core`: message routing, runtime, base abstractions
- `autogen-agentchat`: high-level agent/team API designed for human readability
- `autogen-ext`: model clients (OpenAI, Anthropic, Ollama, etc.) + CodeExecutor

To use Anthropic Claude as the backend, no extra install is needed — `autogen_ext.models.anthropic` is already part of `autogen-ext`.

## Three Core Building Blocks

### 1. AssistantAgent — The Fundamental Unit

```python
from autogen_agentchat.agents import AssistantAgent
from autogen_ext.models.openai import OpenAIChatCompletionClient

model_client = OpenAIChatCompletionClient(model="gpt-4o-mini")

developer = AssistantAgent(
    name="Developer",
    model_client=model_client,
    system_message="You are a senior Python engineer. Answer questions concisely.",
    tools=[],           # list of FunctionTools (optional)
    handoffs=[],        # other agent names for Swarm routing (optional)
)
```

`AssistantAgent` does three things: LLM invocation, tool execution, and message buffer management. It holds state internally; once it joins a team, the team takes over message routing.

### 2. FunctionTool — Giving Agents Real Capabilities

```python
from autogen_core.tools import FunctionTool

def get_weather(city: str) -> str:
    """Get current weather for a city."""
    return f"{city}: 22°C, partly cloudy"

weather_tool = FunctionTool(
    get_weather,
    name="get_weather",
    description="Retrieve current weather conditions for a city"
)
```

Type hints and the docstring are automatically converted into a JSON Schema. Here is what the generated schema actually looks like when you run it:

```
Tool Schema:
  name: get_weather
  description: Retrieve current weather conditions for a city
  parameters: {
    'city': {'description': 'city', 'title': 'City', 'type': 'string'}
  }
```

The description feeds directly from the docstring, so write it clearly. A vague description causes the LLM to call the tool in unexpected ways.

### 3. Termination Conditions — Preventing Infinite Loops

```python
from autogen_agentchat.conditions import (
    MaxMessageTermination,
    TextMentionTermination,
    TokenUsageTermination,
    TimeoutTermination,
)

# Combine with | (OR) or & (AND)
termination = (
    MaxMessageTermination(max_messages=10) | TextMentionTermination("TERMINATE")
)
```

In practice the safest setup is a hard cap via `MaxMessageTermination` plus a task-completion signal via `TextMentionTermination`. That way a runaway conversation always stops eventually.

## Four Team Types — When to Use Which

In AutoGen 0.7.x, a team determines the order and rules by which agents communicate.

![AutoGen 0.7.x execution log — multi-agent code review session](../../../assets/blog/microsoft-autogen-1-0-production-agent-tutorial-log.png)

### RoundRobinGroupChat

Agents speak in order, one turn each. The most predictable pattern.

```python
from autogen_agentchat.teams import RoundRobinGroupChat

team = RoundRobinGroupChat(
    participants=[developer, reviewer],
    termination_condition=MaxMessageTermination(4),
)
result = await team.run(task="Review this code: def add(a, b): return a + b")
```

Here is the actual output from my run:

```
[USER] Is `def add(a, b): return a + b` production-ready Python?

[DEVELOPER]
...type hints like `int | float`, docstring, input validation...

[CODEREVIEWER]
...Union[int, float] for Python 3.9 compat... TERMINATE

[RESULT] Stop reason: Text 'TERMINATE' mentioned
[RESULT] Total messages: 3
```

The Developer → Reviewer ordering was consistently enforced.

### SelectorGroupChat

An LLM dynamically chooses who speaks next. Works well when roles are clearly differentiated.

```python
from autogen_agentchat.teams import SelectorGroupChat

team = SelectorGroupChat(
    participants=[planner, coder, tester, reviewer],
    model_client=model_client,
    termination_condition=termination,
)
```

More flexible than RoundRobin but harder to predict. When I have more than three agents, the dynamic selection pays off. For exactly two agents, RoundRobin is simpler and equally effective.

### GraphFlow — The Standout New Feature in 0.7.x

DAG-based routing. Conditions determine which agent runs next.

```python
from autogen_agentchat.teams import GraphFlow, DiGraphBuilder

builder = DiGraphBuilder()
builder.add_node(planner)
builder.add_node(coder)
builder.add_node(tester)

builder.add_edge(planner, coder)
builder.add_edge(coder, tester)

graph = builder.build()
team = GraphFlow(participants=[planner, coder, tester], graph=graph)
```

Conditional edges are supported too. A feedback loop where a failing test sends execution back to the coder is expressible as a graph. For complex workflows this is far cleaner than hard-coding branching logic inside system prompts.

My honest take: the GraphFlow API is still a bit verbose. There is no equivalent of LangGraph's `add_conditional_edges` convenience method, so edge definitions get long. That said, explicit DAG routing in a Python agent framework is essentially unique to AutoGen. I compared this with LangGraph, CrewAI, and Dapr in the [AI agent framework comparison post](/en/blog/en/ai-agent-framework-comparison-2026-langgraph-crewai-dapr-production).

### Swarm

Handoff-based routing. An agent decides "this task belongs to X, not me" and passes it along.

```python
from autogen_agentchat.teams import Swarm
from autogen_agentchat.conditions import HandoffTermination

triage_agent = AssistantAgent(
    name="Triage",
    model_client=model_client,
    handoffs=["billing_agent", "technical_agent"],
)

team = Swarm(
    participants=[triage_agent, billing_agent, technical_agent],
    termination_condition=HandoffTermination(target="human") | MaxMessageTermination(10),
)
```

Natural for customer support scenarios where the right agent depends on request type. Since the handoff decision is made by the LLM, the system prompt for each agent needs to define handoff criteria precisely.

## Hierarchical Agents: SocietyOfMindAgent

The feature I found most interesting in 0.7.x. An entire agent team can be wrapped as a single agent and plugged into another team.

```python
from autogen_agentchat.agents import SocietyOfMindAgent

inner_team = RoundRobinGroupChat(
    participants=[developer, tester],
    termination_condition=MaxMessageTermination(6),
)

coding_unit = SocietyOfMindAgent(
    name="CodingUnit",
    team=inner_team,
    model_client=model_client,
    response_prompt="Summarize the inner team discussion in one paragraph.",
)

outer_team = RoundRobinGroupChat(
    participants=[coding_unit, product_manager],
    termination_condition=MaxMessageTermination(4),
)
```

From outside, `coding_unit` looks like a regular agent. Inside, a developer → tester loop is running. Only the summary surfaces to the outer team. The concept is similar to [subagent orchestration in the Claude Agent SDK](/en/blog/en/claude-agent-sdk-subagents-orchestration-tutorial-2026), but AutoGen makes the team structure more explicit in code.

## Limitations I Hit in Practice

**1. State is session-scoped**  
Agent memory in AutoGen 0.7.x only persists within a conversation session. There is no built-in cross-session memory. You need to wire in an external database or memory layer yourself.

**2. Debugging is still awkward**  
Streaming with `run_stream()` shows each agent's messages, but seeing intermediate tool call results at a glance is difficult. Connecting an external tracing tool like Langfuse is practically essential. I covered the setup in the [Langfuse self-hosted tracing guide](/en/blog/en/langfuse-self-hosted-llm-tracing-setup-guide-2026).

**3. Async only**  
Every API is `async/await`. Wrap with `asyncio.run()` for synchronous contexts, and be mindful of async handling when integrating with FastAPI or Django.

## Complete Code — A Copy-Paste 2-Agent Review Team

```python
import asyncio
from autogen_agentchat.agents import AssistantAgent
from autogen_agentchat.teams import RoundRobinGroupChat
from autogen_agentchat.conditions import MaxMessageTermination, TextMentionTermination
from autogen_ext.models.anthropic import AnthropicChatCompletionClient

async def main():
    model_client = AnthropicChatCompletionClient(
        model="claude-haiku-4-5-20251001",
    )
    
    developer = AssistantAgent(
        name="Developer",
        model_client=model_client,
        system_message="""You are a senior Python developer.
Suggest up to 3 code quality improvements, briefly.""",
    )
    
    reviewer = AssistantAgent(
        name="Reviewer",
        model_client=model_client,
        system_message="""You are a code reviewer.
Review the developer's suggestions, add your own comment, then say TERMINATE to end.""",
    )
    
    termination = (
        MaxMessageTermination(max_messages=6) |
        TextMentionTermination("TERMINATE")
    )
    
    team = RoundRobinGroupChat(
        participants=[developer, reviewer],
        termination_condition=termination,
    )
    
    async for message in team.run_stream(
        task="Review this code: def add(a, b): return a + b"
    ):
        from autogen_agentchat.base import TaskResult
        if not isinstance(message, TaskResult):
            print(f"[{message.source}]\n{message.content}\n")
        else:
            print(f"Stop reason: {message.stop_reason}")
    
    await model_client.close()

asyncio.run(main())
```

Set `ANTHROPIC_API_KEY` in your environment and run it directly.

## Testing Without an API Key: ReplayChatCompletionClient

To test agent logic without spending on API calls, `ReplayChatCompletionClient` returns predefined responses in sequence.

```python
from autogen_ext.models.replay import ReplayChatCompletionClient
from autogen_core.models import CreateResult, RequestUsage

model_client = ReplayChatCompletionClient(
    [
        CreateResult(
            finish_reason="stop",
            content="I'd suggest adding type hints and a docstring.",
            usage=RequestUsage(prompt_tokens=50, completion_tokens=20),
            cached=False,
        ),
        CreateResult(
            finish_reason="stop",
            content="Agreed. Also worth considering Union types for broader compatibility. TERMINATE",
            usage=RequestUsage(prompt_tokens=70, completion_tokens=18),
            cached=False,
        ),
    ]
)
```

Useful in unit tests and CI pipelines where you want to verify routing logic without a live LLM. One thing to watch: the replay client exhausts responses in order. If agents invoke the LLM more times than there are replay entries, you get `StopIteration`. Match `MaxMessageTermination` to the size of your replay list.

## Migration Checklist: 0.2.x to 0.7.x

If you have existing 0.2.x code, these are the steps to work through:

1. **Package swap**: `pyautogen`/`autogen` → `autogen-agentchat autogen-ext`
2. **Import paths**: `from autogen import AssistantAgent` → `from autogen_agentchat.agents import AssistantAgent`
3. **Remove llm_config**: Replace every `llm_config` dict with a `model_client` object
4. **UserProxyAgent role**: In 0.7.x, `UserProxyAgent` no longer handles code execution. That is `CodeExecutorAgent`'s job
5. **Go async**: Replace all `initiate_chat()` calls with `await team.run()` or `await team.run_stream()`
6. **Explicit termination**: The `human_input_mode="NEVER"` pattern is gone. Always pass a `termination_condition` to the team

The most time-consuming step is usually converting `llm_config` to `model_client`. If multiple agents use the same model, share a single client instance for efficiency.

## When to Use AutoGen and When to Skip It

My honest position: AutoGen is strong when **inter-agent collaboration protocols are complex**. Team composition, cross-team routing, and hierarchical agent structures are first-class constructs in the API.

For a single agent with many tools, [PydanticAI](/en/blog/en/pydantic-ai-type-safe-agent-tutorial-2026) results in cleaner code — AutoGen's team abstraction becomes unnecessary overhead. The [Python AI agent library comparison](/en/blog/en/python-ai-agent-library-comparison-2026) shows where each library fits.

If Kubernetes-level infrastructure durability is the concern, look at Dapr Agents instead. AutoGen focuses squarely on the **agent conversation layer**, not infrastructure.

## Wrapping Up

AutoGen 0.7.x is a fundamentally different framework from the 0.2.x era. The new API is more explicit and type-safe. GraphFlow and SocietyOfMind are genuinely useful for complex multi-agent workflows — not just architectural showcases.

The ecosystem is still stabilizing. Official docs and examples are version-mixed, making the initial learning curve steeper than it needs to be. The practical first step: always check whether a search result targets 0.2.x or 0.7.x before copying code.

---

**Test environment**: macOS, Python 3.12.8, autogen-agentchat 0.7.5 (2026-05-19)  
**Install**: `pip install autogen-agentchat autogen-ext`
