---
title: "用 Agno 构建 AI Agent — 结合 Gemini 与内置工具的实战运行记录"
description: "在沙盒中安装并验证了从 phidata 更名的 Agno v2.6.17，包含 Calculator、Wikipedia、结构化输出和多智能体团队的实际执行日志。同时诚实记录了亲历的各种陷阱：output_schema 与 output_model 混淆、废弃的模型 ID、Team API 参数变更。"
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
      en: This post provides the baseline when comparing Agno against PydanticAI, Instructor, and Smolagents.
      ja: AgnoとPydanticAI・Smolagentsを比較する際の基準になる記事です。
      zh: 这是在 Agno、PydanticAI、Smolagents 之间做选择时的参考基准文章。
  - slug: pydantic-ai-type-safe-agent-tutorial-2026
    score: 0.88
    reason:
      ko: Agno의 output_schema가 익숙해졌다면, PydanticAI의 타입 안전 패턴도 바로 이어서 볼 만합니다.
      en: Once you're comfortable with Agno's output_schema, PydanticAI's type-safe approach is the natural next read.
      ja: Agnoのoutput_schemaに慣れたら、PydanticAIのアプローチも読む価値があります。
      zh: 熟悉 Agno 的 output_schema 后，PydanticAI 的类型安全模式值得对比阅读。
  - slug: google-adk-vs-langgraph-agent-framework-comparison-2026
    score: 0.83
    reason:
      ko: Agno의 경량 철학과 Google ADK·LangGraph의 엔터프라이즈 접근법을 대조해서 읽으면 프레임워크 선택 기준이 더 명확해집니다.
      en: Reading Agno's lightweight philosophy alongside ADK and LangGraph's enterprise approaches clarifies the framework selection criteria.
      ja: Agnoの軽量哲学とGoogle ADK・LangGraphのアプローチを対比すると選択基準が明確になります。
      zh: 将 Agno 的轻量哲学与 Google ADK、LangGraph 的企业级方案对比阅读，有助于明确框架选择标准。
  - slug: mastra-ai-typescript-agent-framework-guide-2026
    score: 0.78
    reason:
      ko: Python 쪽은 Agno, TypeScript 쪽은 Mastra — 언어별 에이전트 프레임워크 생태계 전체 그림을 잡을 수 있습니다.
      en: Agno for Python, Mastra for TypeScript — together they map the agent framework landscape across both languages.
      ja: PythonはAgno、TypeScriptはMastra — 両方でエージェントフレームワークの全体像が見えます。
      zh: Python 用 Agno，TypeScript 用 Mastra — 合读两篇可以全面了解 2026 年两种语言的 Agent 框架生态。
---

如果你曾经觉得 LangChain 太重了，那你的感受并不孤独。依赖树庞大，抽象层层叠加，最终很难追踪底层究竟发生了什么。正是这种挫败感推动了一批更轻量替代方案的崛起——那些证明"不需要百来个传递依赖也能构建强大 Agent"的框架。

Agno 就是其中之一。它的前身是 Phidata，2025 年初完成了品牌重塑。我花了一个下午在干净的沙盒中安装 Agno v2.6.17，依次测试了 Calculator 工具、Wikipedia 检索、Pydantic 结构化输出和双 Agent 团队。下面我会分享真实的执行日志，更重要的是——那些文档里没有警告过我的陷阱。

## Agno 是什么，从 Phidata 而来

Phidata 凭借"构建 AI 助手的 Python 框架"积累了良好口碑。2025 年更名为 Agno 后，设计哲学也更加清晰，围绕三个核心理念展开。

**从第一天起就支持多模型。** OpenAI、Anthropic、Google、Ollama、Cohere 等 70 多个 LLM 可以用同一套代码结构接入。换模型不需要重写 Agent 逻辑。

**多模态作为默认设计。** 文本、图像、音频、视频 Agent 共用同一个 API 接口，不需要为每种模态维护不同的抽象层。

**多 Agent 编排是一等公民。** 内置 `Team` 类，`coordinate`、`route`、`collaborate` 等协作模式只需修改一个参数即可切换。

看到这些描述，我的第一反应是："这和 LangChain 有什么不同？"真正写了代码才感受到差别——Agno 偏好组合而非类继承，创建一个 Agent 只需 6 行左右，没有多余的样板代码。

## 安装：没有依赖地狱

```bash
pip install agno google-genai ddgs wikipedia
```

`agno` 包只安装核心部分。工具各自需要额外依赖——Wikipedia 工具需要 `wikipedia`，Gemini 需要 `google-genai`。这种懒加载方式让基础安装保持精简。

```bash
$ python3 -c "import agno; print(agno.__version__)"
2.6.17
```

我从项目 `.env` 文件中读取了 Gemini API Key。Agno 会自动从 `GOOGLE_API_KEY` 或 `GEMINI_API_KEY` 初始化 Gemini 客户端。两个都设置时优先使用 `GOOGLE_API_KEY`，并在 stdout 中打印警告，但无法从代码层面抑制。

## 第一个 Agent：Calculator 工具

```python
from agno.agent import Agent
from agno.models.google import Gemini
from agno.tools.calculator import CalculatorTools

agent = Agent(
    model=Gemini(id="gemini-2.5-flash"),
    tools=[CalculatorTools()],
    description="数学计算助手",
)

response = agent.run("2的10次方加上3的5次方是多少？请使用计算器。")
print(response.content)
```

执行结果：

```
2的10次方是1024，3的5次方是243。两者相加等于1267。
⏱ 8.98s
```

计算正确：1024 + 243 = 1267。Agent 没有让 LLM 自己猜测，而是调用了 Calculator 工具。约 9 秒的延迟包含了 Gemini API 往返加工具调用的开销。

**陷阱 #1：`show_tool_calls` 已移除。** 旧版教程中使用 `show_tool_calls=True`，但在 v2.6.17 中会报 `TypeError: Agent.__init__() got an unexpected keyword argument 'show_tool_calls'`。想看详细日志改用 `debug_mode=True`。

**陷阱 #2：`gemini-2.0-flash` 已废弃。** 使用该模型 ID 会返回 404：

```
ERROR    Error from Gemini API: 404 NOT_FOUND.
{'error': {'message': 'This model models/gemini-2.0-flash is no longer available.'}}
```

请使用 `gemini-2.5-flash`。在硬编码模型 ID 之前，务必先确认 Google 文档中当前可用的版本。

## Wikipedia 工具：自动重试搜索

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

执行日志：

```
INFO Searching wikipedia for: attention mechanism neural networks
ERROR Error searching Wikipedia for 'attention mechanism neural networks':
      Page id "attention mechanism neural network" does not match any pages.
INFO Searching wikipedia for: attention (machine learning)
⏱ 9.98s

In machine learning, attention is a method that determines the importance
of each component in a sequence relative to the other components...
```

有趣的地方在于：第一次搜索失败后，Agent 自动将查询词改为 `attention (machine learning)` 并重试，这一切都不需要额外代码。Agno 在内部运行 ReAct 循环——计划、行动、观察、调整。工具失败会被优雅处理。

与 [Python AI Agent 库对比文章](/zh/blog/zh/python-ai-agent-library-comparison-2026) 中 Smolagents 的代码执行方式相比，Agno 更偏向工具组合而非代码生成。两者各有适用场景，没有绝对优劣。

## 结构化输出：用 `output_schema`，不是 `output_model`

这是 API 命名中最容易混淆的部分。`output_model` 参数存在，但直觉上认为"把 Pydantic 模型传进去就行"——这是错的。

```python
# 这样会报错
agent = Agent(
    model=Gemini(id="gemini-2.5-flash"),
    output_model=DeveloperProfile,  # ← 错误
)
# ValueError: Model must be a Model instance, string, or None
```

`output_model` 接收的是 LLM 模型实例。Pydantic 结构化输出应使用 `output_schema`：

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
    output_schema=DeveloperProfile,  # ← 正确
)

response = agent.run(
    "Create a developer profile for 'Kim Jangwook', a Korean developer "
    "specializing in Claude Code, MCP, Python, TypeScript."
)

print(type(response.content))  # <class '__main__.DeveloperProfile'>
print(response.content.name)   # Kim Jangwook
```

实际输出：

```
⏱ 4.00s
类型：DeveloperProfile
姓名：Kim Jangwook
技能：
  - Claude Code：Expert（自 2022 年）
  - MCP：Certified（自 2019 年）
  - Python：Senior（自 2018 年）
  - TypeScript：Intermediate（自 2020 年）
```

使用 `output_schema` 后，`response.content` 返回实际的 Pydantic 实例，而非字符串。解析在内部完成，IDE 自动补全也能完整覆盖结果字段。延迟仅 4 秒（对比 Calculator Agent 的 9 秒），原因是省去了工具调用往返。

这与 [PydanticAI 教程中的 `output_type`](/zh/blog/zh/pydantic-ai-type-safe-agent-tutorial-2026) 在理念上相似，但参数名不同——在不同框架间切换时，这种词汇差异会积累成认知摩擦。

## 多 Agent 团队：`members=`，不是 `agents=`

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
    members=[researcher, calculator],  # ← 不是 agents=
    model=Gemini(id="gemini-2.5-flash"),
    name="研究与计算团队",
    mode="coordinate",
)
```

**陷阱 #3：`agents=` 在 Team 中不存在。** 写 `Team(agents=[...])` 会抛出：

```
TypeError: Team.__init__() got an unexpected keyword argument 'agents'
```

正确参数是 `members=[...]`，只有阅读源码才能发现这一点。

运行：

```python
response = team.run(
    "在 Wikipedia 上查找《Attention is All You Need》发表的年份，"
    "然后计算到 2026 年过了多少年。"
)
print(response.content)
```

结果：

```
INFO Searching wikipedia for: Attention is All You Need
⏱ 13.83s

《Attention is All You Need》于 2017 年发表，
到 2026 年已经过去了 9 年。
```

团队领导（传入 `Team` 的 Gemini 模型）分析任务后，将 Wikipedia 检索委托给 Researcher Agent，将减法运算委托给 Calculator Agent。两个结果均正确。约 14 秒延迟反映了顺序执行的代价——v2.6.17 中 `coordinate` 模式不支持并行。

## 100 多个内置工具

这是 Agno 实际上的优势之一。安装后查看 `agno.tools`：

```python
import agno.tools as t, pkgutil
tools = [name for _, name, _ in pkgutil.iter_modules(t.__path__)]
# 100+ 条目，包括：'arxiv', 'bravesearch', 'calculator',
# 'docker', 'duckduckgo', 'email', 'github', 'gmail',
# 'google_bigquery', 'jira', 'mcp', 'mem0', 'notion',
# 'postgres', 'slack', 'sql', 'tavily', 'wikipedia',
# 'yfinance', 'youtube', 'zoom', ...
```

实际含义：只需提供 `BRAVE_API_KEY`，5 分钟内就能跑起一个网络搜索 Agent，无需手动封装任何 API。Slack、Notion、GitHub、Postgres 的集成同样如此。

注意：并非所有工具都是零安装即用。每个工具模块都有自己的依赖，需要单独安装。不同模块的报错时机也不一致——有些在 import 时报错，有些在实际调用时才报错。

## 我认为的实际局限

**延迟是真实存在的。** 单次 Calculator 调用 9 秒，双 Agent 团队 14 秒。这更多是 Gemini API 往返成本的问题，而非 Agno 本身的低效。但对于需要低延迟响应的生产服务，必须纳入考量。

**调试体验欠佳。** `debug_mode=True` 产生的日志格式不规范，难以解析。与 LangSmith 或 LangFuse 的官方集成指南尚未找到。

**文档滞后于 API。** `show_tool_calls`、`output_model`、`agents=` 等参数在文档中仍有记载，但实际代码已更改或删除。始终以 GitHub `examples/` 目录的最新版本为准。

**Team 的 `coordinate` 模式是顺序执行。** 需要并行 Agent 执行或复杂条件分支时，[Google ADK 或 LangGraph](/zh/blog/zh/google-adk-vs-langgraph-agent-framework-comparison-2026) 是更合适的选择。

## Agno 适合哪些场景

我认为 Agno 最适合三类场景：

**快速原型验证。** 只需 API Key 加 10 行 Python，就能跑起一个 Agent。适合 PoC、内部工具、个人项目等对上手速度要求高的情况。

**多工具 Agent。** 内置 100 多个工具，提供 API Key 即可使用。将 Slack、Gmail、Notion、GitHub、Postgres 等日常工具通过 Agent 串联时，Agno 能省去大量封装代码。

**小规模 Agent 团队（2〜4 个）。** Agno 的 `Team` 类处理小型协调任务很干净。一旦需要数十个 Agent 组成复杂依赖图，LangGraph 或 Microsoft AutoGen 这类状态图框架能提供更精细的控制。

不适合使用 Agno 的场景：实时流式响应 UI、需要精细错误处理和重试保障的生产工作流、需要完整审计每步 Agent 决策的系统。

## 总结

- Agno v2.6.17 通过 `pip install agno` 安装，Calculator、Wikipedia、Team 均成功运行
- 当前有效模型 ID 为 `gemini-2.5-flash`（`gemini-2.0-flash` 已废弃，返回 404）
- 结构化输出使用 `output_schema=YourPydanticModel`，不是 `output_model`
- `Team` 使用 `members=[...]`，不是 `agents=[...]`
- 内置 100+ 工具，每个工具的额外依赖需单独安装
- 在快速原型和多工具 Agent 上有明显优势，复杂状态机场景建议选 LangGraph

如果你对 LangChain 的繁重感到疲倦，Agno 值得花一个下午试一试。
