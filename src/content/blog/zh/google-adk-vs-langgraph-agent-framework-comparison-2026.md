---
title: 'Google ADK vs LangGraph 2026: 亲手安装两个框架并对比'
description: >-
  实际沙盒安装测试Google ADK v1.32.0与LangGraph
  v1.1.10，系统对比代码结构、依赖数量、状态管理实现、条件分支架构及部署CLI差异。基于实验数据，提供不同应用场景下的AI代理框架选型指南。
pubDate: '2026-05-04'
heroImage: ../../../assets/blog/google-adk-vs-langgraph-hero.png
tags:
  - google-adk
  - langgraph
  - ai-agent
relatedPosts:
  - slug: sqlite-ai-swarm-build
    score: 0.95
    reason:
      ko: '자동화, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, architecture with comparable
        difficulty.
      zh: 在自动化、AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: nist-ai-agent-security-standards
    score: 0.95
    reason:
      ko: 'AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: 'Covers similar topics in AI/ML, architecture with comparable difficulty.'
      zh: 在AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: adl-agent-definition-language-governance
    score: 0.95
    reason:
      ko: '자동화, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, architecture with comparable
        difficulty.
      zh: 在自动化、AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: ai-agent-framework-comparison-2026-langgraph-crewai-dapr-production
    score: 0.94
    reason:
      ko: '자동화, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, architecture with comparable
        difficulty.
      zh: 在自动化、AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: claude-code-source-leak-analysis
    score: 0.94
    reason:
      ko: 'AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: 'Covers similar topics in AI/ML, architecture with comparable difficulty.'
      zh: 在AI/ML、架构领域涵盖类似主题，难度相当。
---

每次出现新的AI智能体框架，我的第一反应都是安装它，弄清楚到底有什么不同。Google开源ADK（Agent Development Kit）时也不例外。这个周末我专门搭建了一个沙盒环境，把Google ADK v1.32.0和LangGraph v1.1.10并排安装，实际运行了代码。这篇文章是实验结果的整理。

![ADK与LangGraph沙盒执行日志对比](../../../assets/blog/google-adk-vs-langgraph-logs.png)

## 两种不同的设计哲学

Google ADK的核心理念是"将软件开发原则应用于AI智能体"。实际用了之后，这句话的含义就清晰了。ADK用Python类和函数直接定义智能体，内置了`SequentialAgent`、`ParallelAgent`、`LoopAgent`等编排器，可以在代码中自然地声明流程。

```python
from google.adk.agents import Agent, SequentialAgent

weather_agent = Agent(
    name="weather_agent",
    model="gemini-2.5-flash",
    instruction="使用get_weather工具获取天气数据",
    tools=[get_weather],
)

analysis_agent = Agent(
    name="analysis_agent",
    model="gemini-2.5-flash",
    instruction="分析天气数据并给出预报",
)

# 顺序执行: weather → analysis
pipeline = SequentialAgent(
    name="weather_pipeline",
    sub_agents=[weather_agent, analysis_agent],
)
```

不需要单独定义图，也不需要声明边。Python代码本身就表达了流程。

LangGraph的方向截然不同。它将智能体工作流建模为**显式图**。节点代表处理阶段，边定义节点间的转换。先设计图，再在图上添加逻辑。

```python
from langgraph.graph import StateGraph, END
from langgraph.graph.message import add_messages
from langchain_core.messages import AIMessage

class State(TypedDict):
    messages: Annotated[list, add_messages]

def greet_node(state):
    return {"messages": [AIMessage(content="Hello from LangGraph!")]}

builder = StateGraph(State)
builder.add_node("greet", greet_node)
builder.add_node("analyze", analyze_node)
builder.set_entry_point("greet")
builder.add_edge("greet", "analyze")
builder.add_edge("analyze", END)

graph = builder.compile()
```

在我看来：ADK是"用代码组装管道"，LangGraph是"设计状态机"。不是哪个更好，而是哪个对你的问题更自然。

## 依赖数量差异令人吃惊

```bash
pip install google-adk langgraph
```

两者都能安装，但`pip show`一看依赖数量差距相当大：

**Google ADK v1.32.0 直接依赖：45个**
```
google-cloud-aiplatform, google-cloud-bigquery,
google-cloud-spanner, google-cloud-speech,
google-cloud-storage, opentelemetry-exporter-gcp-*,
fastapi, uvicorn, sqlalchemy, mcp ... (共45个)
```

**LangGraph v1.1.10 直接依赖：6个**
```
langchain-core, langgraph-checkpoint,
langgraph-prebuilt, langgraph-sdk,
pydantic, xxhash
```

整整差了39个。ADK这么重的原因很明确——它从一开始就包含了整个Google Cloud栈（BigQuery、Spanner、Pub/Sub、Speech等）。如果不使用Google Cloud，这39个额外依赖全是死重。

LangGraph的哲学是"按需取用"——自己注入LLM客户端，自己选择检查点后端。更轻量，但配置的事也更多。

## 多智能体模式对比——条件分支是决定性差异

**ADK的并行执行**（我实际运行的代码）：

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

执行流程：`research_pipeline (SequentialAgent)` → `parallel_research (ParallelAgent)` → `synthesizer`。直观、可读性强。

**LangGraph的条件边**（ADK没有的功能）：

```python
def should_retry(state: State) -> str:
    if state.get("quality_score", 0) < 80:
        return "generate"  # 质量不足 → 重新生成
    return END              # 质量通过 → 结束

builder.add_conditional_edges("evaluate", should_retry)
```

实际运行结果：
```
=== 条件边执行结果 ===
  [evaluate] iteration=1, score=60 → 路由到: generate
  [evaluate] iteration=2, score=80 → 路由到: END
最终分数: 80, 总迭代次数: 2
```

智能体自动重试，直到质量通过。ADK的`LoopAgent`也支持迭代，但终止条件依赖`max_iterations`。"如果满足此条件就走这里，否则走那里"的动态分支逻辑，LangGraph的条件边要强大得多。对于生成-验证-重试循环、路由智能体、多判断分支这类场景，LangGraph明显占优。

## ADK的杀手锏：CLI和内置评估框架

安装ADK时，`adk` CLI也会一起安装。这个意外地好用：

```
$ adk --help
Commands:
  api_server   为智能体启动FastAPI服务器
  create       创建带示例代码的新应用
  deploy       将智能体部署到托管环境
  eval         使用评估集对智能体进行评估
  eval_set     管理评估集
  run          运行智能体的交互式CLI
  web          启动带Web UI的FastAPI服务器
```

`adk web`特别实用——指定智能体代码路径，FastAPI服务器自动启动，可以可视化测试本地智能体。`adk eval`可以定义评估集文件，自动对智能体进行回归测试。LangGraph没有这样的内置CLI。

`adk deploy`支持直接部署到Google Cloud Run或Vertex AI Agent Builder。对于GCP用户，开发到部署都在同一个工具链内完成。

不过，这个CLI完全绑定在Google生态系统内是个遗憾。用AWS或Azure的团队根本用不上`adk deploy`。内置的追踪也是输出到GCP的Cloud Trace，想接入其他可观测性栈需要额外配置。

这方面，像[Langfuse这样的独立LLM追踪工具](/zh/blog/zh/langfuse-self-hosted-llm-tracing-setup-guide-2026)与LangGraph的结合会更自然、更灵活。

## 状态管理对比：会话 vs 检查点

**ADK的状态管理**基于会话：

```python
from google.adk.runners import InMemoryRunner
from google.adk.sessions import InMemorySessionService

session_service = InMemorySessionService()
runner = InMemoryRunner(agent=root_agent, app_name="my_app")
```

ADK通过`session_id`维护多轮对话状态。生产环境可以换用`VertexAiSessionService`实现持久化。

**LangGraph的状态管理**基于TypedDict + 检查点：

```python
from langgraph.checkpoint.memory import MemorySaver

checkpointer = MemorySaver()
graph = builder.compile(checkpointer=checkpointer)

config = {"configurable": {"thread_id": "user-123"}}
result = graph.invoke({"messages": [HumanMessage(content="你好")]}, config)
```

LangGraph的检查点系统更灵活。可以把`MemorySaver`换成PostgreSQL、Redis或SQLite后端，还支持时间旅行调试（回退到过去的检查点）。

只需要换个检查点后端，开发环境和生产环境就能用完全相同的代码运行。不绑定特定云厂商。这点上我认为LangGraph更强。

ADK在[MCP工具服务器](/zh/blog/zh/mcp-server-build-practical-guide-2026)集成方面胜过LangGraph。`MCPToolset`开箱即用，与MCP服务器的集成简单得多。LangGraph用MCP还需要额外的包和适配代码。

## 核心对比表

| 对比项 | Google ADK v1.32.0 | LangGraph v1.1.10 |
|--------|-------------------|-------------------|
| 直接依赖数量 | 45个 | 6个 |
| 编排方式 | Sequential/Parallel/LoopAgent（代码声明） | StateGraph+节点/边（显式图） |
| 条件分支 | LoopAgent max_iterations（有限） | conditional_edges（强大） |
| 默认LLM | Gemini（支持其他模型） | 模型无关（注入任意LLM） |
| CLI | adk create/run/web/eval/deploy ✓ | 无 |
| 内置Web UI | adk web ✓ | 无 |
| 内置评估框架 | adk eval ✓ | 无（需要外部工具） |
| MCP支持 | MCPToolset内置 ✓ | 需要额外包 |
| 状态管理 | 会话（VertexAI后端） | TypedDict+Checkpoint（后端可替换） |
| 部署目标 | Google Cloud Run / Vertex AI | 云平台无关 |
| OpenTelemetry | GCP导出器内置 | 需手动配置 |
| 时间旅行调试 | 无 | ✓ |
| 多语言SDK | Python, Go, Java, TypeScript | Python（主要） |
| 许可证 | Apache 2.0 | MIT |

## 哪类团队适合哪个框架

**Google ADK适合**：
- 已有Google Cloud基础设施投入的团队
- 以Gemini为主力模型
- 希望从原型到部署在一个工具链内完成
- 不想单独构建智能体评估管道
- 团队有Go、Java或TypeScript成员的混合情况

**LangGraph适合**：
- 需要复杂分支逻辑的智能体工作流
- AWS、Azure或多云环境
- 混合使用OpenAI、Anthropic、Mistral等多种LLM
- 已有基于LangChain的代码库
- 需要时间旅行调试或特定检查点重放的开发流程
- 边缘部署需要最小化依赖

如果今天要开一个新项目，我倾向于选LangGraph。理由很实际：条件分支和检查点灵活性最终是生产级智能体必需的功能，如果之后再加，往往意味着重新设计整体结构。用ADK的`LoopAgent`开始，后来发现需要动态路由，可能就得大改。

话说回来，对于已经在GCP上的团队，ADK工具链是真的好用。`adk deploy`到Cloud Run加上`adk eval`回归测试，在LangGraph生态里复现这套体验要花不少力气。

## 我的结论：设计哲学决定选择

2026年，两个框架都达到了生产可用的水平。区别在于各自优化的方向不同。

ADK优化的是"快速构建智能体系统并部署到GCP"，LangGraph优化的是"精细控制智能体的状态转换"。

比较框架时常见的错误是按功能数量排名。ADK有CLI、有eval、还能部署，所以更好？不对。我认为关键问题是：这个框架的扩展方向是否与我的智能体复杂度增长方向一致？

如果简单管道会进化成复杂分支，就从一开始选LangGraph。如果目标是在Google Cloud生态内快速交付，ADK能省掉很多麻烦。

关于ADK出现之前的LangGraph、CrewAI、Dapr三者比较，可以参考[这篇生产KPI对比文章](/zh/blog/zh/ai-agent-framework-comparison-2026-langgraph-crewai-dapr-production)，有助于拓宽LangGraph的选择背景。
