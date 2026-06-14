---
draft: true
title: "Gemini API Managed Agents 实战指南 — 用一行代码在隔离沙箱中运行AI智能体"
description: "实际动手体验Google I/O 2026发布的Gemini Managed Agents。一次API调用即可启动智能体，对比Claude和OpenAI的差异，并用代码演示多轮对话实现，同时指出官方文档与SDK实际行为的出入。"
pubDate: '2026-05-30'
heroImage: '../../../assets/blog/gemini-api-managed-agents-practical-guide-2026-hero.png'
tags: ['Gemini API', 'AI智能体', 'Google IO 2026']
relatedPosts:
  - slug: "anthropic-claude-opus-4-7-managed-agents-2026"
    score: 0.92
    reason:
      ko: "Claude Managed Agents의 비용 구조와 설계 철학을 먼저 이해하면, Gemini 버전이 어떤 선택을 달리 했는지 훨씬 선명하게 보인다."
      ja: "Claude Managed AgentsのAPIコスト構造を先に把握しておくと、Gemini版の設計差分がより明確に理解できる。"
      en: "Understanding Claude Managed Agents first makes the architectural differences in Gemini's approach much clearer."
      zh: "先了解Claude Managed Agents的成本结构和设计哲学，才能更清晰地看出Gemini版本做了哪些不同的选择。"
  - slug: "gemini-api-model-tier-benchmark-guide-2026"
    score: 0.85
    reason:
      ko: "Managed Agents가 내부적으로 어떤 모델 티어를 사용하는지 이해하려면 Gemini API 모델 선택 가이드를 함께 읽는 것이 도움이 된다."
      ja: "Managed Agentsが内部でどのモデルティアを使うかを把握するために、このGemini APIモデル選択ガイドも合わせて読むと理解が深まる。"
      en: "To understand which model tier Managed Agents uses internally, this Gemini API model selection guide is a useful companion read."
      zh: "要了解Managed Agents内部使用哪个模型层级，配合阅读Gemini API模型选择指南会很有帮助。"
  - slug: "google-io-2026-antigravity-2-agent-platform-analysis"
    score: 0.78
    reason:
      ko: "Gemini Managed Agents가 발표된 Google I/O 2026의 더 넓은 에이전트 플랫폼 전략을 분석한 글이다."
      ja: "Gemini Managed Agentsが発表されたGoogle I/O 2026の広域エージェントプラットフォーム戦略を分析した記事。"
      en: "A broader analysis of Google's agent platform strategy from Google I/O 2026, where Managed Agents was announced."
      zh: "分析Gemini Managed Agents发布所在的Google I/O 2026更广泛的智能体平台战략。"
---

Google I/O 2026结束整整十天了。每年都一样，发布会当天我盯着屏幕，脑子里同时闪过两个念头："哦，这次是真的不一样"和"该不会又是个Demo水平吧"。今年Gemini API Managed Agents的发布也不例外，这两种感觉同时涌来。

所以我决定自己动手跑一遍。`pip install google-genai` 一条命令、一个API密钥，这部分没错。但官方博客写的内容和SDK实际行为有几处出入，而正是这些出入，才是理解这个功能的关键。

---

## 先把Gemini Managed Agents说清楚

Anthropic率先推出了[Claude Managed Agents](/zh/blog/zh/anthropic-claude-opus-4-7-managed-agents-2026)，OpenAI也在朝着类似的方向推进。Google在这次Google I/O 2026上正式公开了`Gemini API Managed Agents`。

一句话总结：<strong>SDK里新增了`client.interactions`命名空间，调用一次`create()`就能启动智能体。</strong>

原来的`generate_content()`是"我把提示词扔给LLM，然后等它返回答案"。Managed Agents更接近"智能体收到目标后，自己调用工具、自己生成结果"的模式。执行控制权交给了SDK那一侧，这就是"Managed"这个词的由来。

从SDK里确认的核心特性有三点。

第一，以`interaction`为单位管理执行状态。响应对象包含`id`、`status`（`in_progress`、`requires_action`、`completed`、`failed`等）、`outputs`、`previous_interaction_id`。状态机在API层面被明确暴露出来。

第二，通过`previous_interaction_id`串联多轮对话。这里有一个重要纠正：官方发布资料里写的是"通过environment_id复用环境"，但实际SDK里这个参数根本不存在（后面会详细展开）。

第三，功能目前是EXPERIMENTAL状态。安装SDK后第一次调用`client.interactions`，控制台会打印：`UserWarning: "Interactions usage is experimental and may change in future versions"`。现在上生产线还为时过早。

---

## 安装和基本运行

```bash
pip install google-genai
```

安装后会得到`google-genai==1.72.0`。在Python 3.12环境下没有依赖冲突。需要注意的是，`google-generativeai`（旧SDK）和`google-genai`（新SDK）是两个独立的包，名字相近容易混淆。Managed Agents API必须用`google-genai`。

装完之后第一次调用`client.interactions`，会看到这条警告：

```
UserWarning: Interactions usage is experimental and may change in future versions.
  warnings.warn(
```

这是SDK主动抛出的警告，忽略它程序照样能跑。但生产代码里出现这种警告，意味着接口随时可能变更，要当作信号来读。

基本运行结构如下：

```python
import google.genai as genai

client = genai.Client(api_key="YOUR_GEMINI_API_KEY")

response = client.interactions.create(
    model="gemini-2.5-flash",
    input="帮我整理AI智能体内存架构的优缺点"
)

print(f"Interaction ID: {response.id}")
print(f"Status: {response.status}")

for content in (response.outputs or []):
    if hasattr(content, 'text'):
        print(content.text)
```

`model`参数支持的Gemini模型，根据SDK Literal类型，包括`gemini-2.5-flash`、`gemini-2.5-pro`、`gemini-2.5-flash-lite`、`gemini-3-flash-preview`、`gemini-3-pro-preview`等。截至2026年5月，`gemini-3.x-preview`系列也已包含在内。

API端点是`https://generativelanguage.googleapis.com/v1beta/interactions`。没有有效API密钥时返回HTTP 400，这本身就说明端点是活着的——返回400而不是404，证明服务器路由在正常工作。

提前了解响应对象结构，写代码时会轻松很多：

```python
# response对象的主要字段
response.id                     # str: interaction唯一ID（例如 "interactions/abc123"）
response.status                 # 状态，取值之一：
# 'in_progress'    — 仍在执行中
# 'requires_action' — 需要用户输入或确认
# 'completed'      — 正常完成
# 'failed'         — 执行失败
# 'cancelled'      — 已取消
# 'incomplete'     — 部分完成
response.outputs                # list: 结果内容列表
response.previous_interaction_id  # str | None: 上一个interaction的ID
response.usage                  # token用量信息
```

状态机在API层面明确暴露，这是和`generate_content()`最根本的区别。以前发个请求等完整结果回来就完了。Managed Agents在API层面直接处理"执行中"、"需要用户介入"、"失败"这些状态概念。

---

## 多轮对话：不是environment_id，是previous_interaction_id

官方发布资料和不少技术博客里都有"通过environment_id复用环境来保持对话上下文"这种说法。但实际看SDK，这个参数根本不存在。

<strong>多轮对话用的参数是`previous_interaction_id`。</strong>

```python
# 第一个interaction
response1 = client.interactions.create(
    model="gemini-2.5-flash",
    input="设计AI智能体时，内存应该怎么分类？"
)

# 第二个interaction — 连接上一轮对话上下文
response2 = client.interactions.create(
    model="gemini-2.5-flash",
    input="给第一种分类方式写个代码示例",
    previous_interaction_id=response1.id
)
```

这套机制是：每个interaction有唯一ID，像链条一样串联起来延续对话。概念上和Claude的`session_id`方式类似，但实现不同。Google选择了把每个interaction作为独立对象管理、通过上一个ID进行引用的方案。

说实话，这个设计更直观。光靠ID就能追踪某个interaction是从哪条对话链里来的。相比之下，像Claude那样显式开启和关闭session的方式，session管理本身就是额外开销。

---

## 可用工具一览

`tools`参数可以挂载多种工具。以下是从SDK确认的清单。

<strong>code_execution</strong>：代码执行沙箱环境。

```python
response = client.interactions.create(
    model="gemini-2.5-flash",
    input="计算斐波那契数列，并展示代码",
    tools=[{"type": "code_execution"}]
)
```

这里有一点需要专门说清楚。官方发布材料里有"隔离Ubuntu环境（4核CPU、16GB RAM、Python 3.12、Node.js 22）"的表述。但从SDK实际确认的结果来看，`code_execution`工具是沙箱Python解释器级别。`computer_use`工具只支持`environment='browser'`，Linux VM访问在目前公开API里并未提供。发布资料的描述应该是基于内部智能体基础设施，而非公开Managed Agents API。

<strong>google_search</strong>：智能体直接调用实时网络搜索。

```python
response = client.interactions.create(
    model="gemini-2.5-flash",
    input="整理一下Google I/O 2026发布的最新AI功能",
    tools=[{"type": "google_search"}]
)
```

<strong>url_context</strong>：直接读取URL内容作为上下文。

<strong>mcp_server</strong>：连接MCP（Model Context Protocol）服务器。Anthropic和Google共用MCP作为标准，这一点很有意思，事实上智能体工具接口的标准化正在推进中。可以自己搭一个MCP服务器，让Gemini智能体调用该服务器上的工具。

<strong>computer_use</strong>：在浏览器环境中操控计算机。前面提过，只支持`environment='browser'`，Linux VM在公开API里暂不可用。

<strong>google_maps</strong>：地图及位置信息访问。

<strong>file_search</strong>：文件搜索。

多个工具同时挂载也没问题：

```python
response = client.interactions.create(
    model="gemini-2.5-flash",
    input="帮我找北京的餐厅，并搜索每家的最新评价",
    tools=[
        {"type": "google_search"},
        {"type": "google_maps"}
    ]
)
```

智能体按什么顺序调用了哪些工具，可以通过解析`response.outputs`内部结构来确认。工具调用结果也包含在outputs里，所以智能体的推理过程在一定程度上是可以追踪的。

---

## 流式输出和后台执行

处理耗时较长的任务时，需要流式输出或后台执行。

```python
# 流式输出
with client.interactions.create(
    model="gemini-2.5-flash",
    input="用3句话解释智能体内存架构",
    stream=True
) as stream:
    for event in stream:
        if event.outputs:
            for output in event.outputs:
                if hasattr(output, 'text'):
                    print(output.text, end="", flush=True)
```

后台执行是异步启动任务、稍后查询结果的模式：

```python
# 启动后台执行
response = client.interactions.create(
    model="gemini-2.5-flash",
    input="深入分析AI智能体内存架构",
    background=True,
    store=True  # 稍后查询必须设置store=True
)

interaction_id = response.id

# 稍后查询结果
result = client.interactions.get(interaction_id)
print(result.status)  # 'completed' 或 'in_progress' 等
```

漏掉`store=True`就无法事后查询。这点在文档里写得不够清楚，很容易踩坑。后台执行和结果存储是两个独立选项，必须分开设置。

---

## Deep Research Agent

Managed Agents命名空间下，还可以通过`agent`参数指定特定用途的智能体。目前公开的是`deep-research-pro-preview-12-2025`。

```python
response = client.interactions.create(
    agent="deep-research-pro-preview-12-2025",
    input="对比分析Gemini、Claude、OpenAI的智能体架构",
    agent_config={"type": "deep-research"}
)
```

从名称就能看出，这是`12-2025`版本，处于preview状态。Deep Research智能体的设计思路是自主浏览网络、综合多个来源生成结果，实际能做到什么程度，需要有有效API密钥才能真正验证。

`model`方式和`agent`方式的区别在于：`model`是直接向Gemini语言模型发送请求并挂载工具；`agent`是执行预定义好的智能体规格，该智能体内部已经内置了特定工具和配置。Deep Research智能体就是后者的例子。

Google后续很可能会在这里陆续添加更多专用智能体，比如编码智能体、数据分析智能体、金融研究智能体之类的形态。

---

## Claude Managed Agents vs Gemini Managed Agents：区别在哪

我先用过Claude Managed Agents，所以比较起来很自然。

<strong>上下文管理方式不同。</strong>Claude以session为单位开启环境，多轮对话在同一session内进行。Gemini把每个interaction作为独立对象，用`previous_interaction_id`串联。这是状态管理理念的差异。

<strong>工具集构成不同。</strong>Claude更侧重bash、computer use（Linux + macOS）、text editor等OS级别的工具。Gemini则有更多与Google基础设施集成的工具，比如google_search、google_maps、url_context。这很正常，各家公司都先把自己强项所在的工具接进来。

<strong>计费结构难以确认。</strong>Claude Managed Agents可以显式设置`task_budget`，成本相对可预测。Gemini Managed Agents每次interaction的费用在现有公开文档里没有明确说明。EXPERIMENTAL状态下，计费结构本身也还没确定。这是目前阶段现实意义上的一个缺点——很难做生产成本规划。

这与[AI智能体成本现实](/zh/blog/zh/ai-agent-cost-reality)里讨论过的核心问题一脉相承：智能体成本的关键是调用了多少工具、消耗了多少token。Managed Agents这类方案把执行过程变成近似黑盒，成本控制难度更大。

<strong>SDK成熟度仍有差距。</strong>Anthropic SDK对Managed Agents相关功能梳理得较为清晰，错误提示也比较明确。google-genai SDK的interactions命名空间目前带着EXPERIMENTAL警告，而且参数名和官方博客的描述存在出入（environment_id vs previous_interaction_id）。这看起来是快速发布导致的落差，应该很快会修正。

对比整理成表格：

| 对比项 | Gemini Managed Agents | Claude Managed Agents |
|---|---|---|
| 多轮串联方式 | `previous_interaction_id` | 基于session |
| 环境隔离 | 浏览器沙箱、Python沙箱 | Linux VM、macOS |
| 特色工具 | Google Search、Maps、MCP | bash、text editor、computer use |
| 计费单位 | 公开未定（EXPERIMENTAL） | 基于task_budget |
| SDK状态 | EXPERIMENTAL | 稳定（Beta） |
| 专用智能体 | Deep Research Agent | —（基于模型） |

这不是说谁更好，而是用途不同。需要智能体直接处理Google基础设施数据（搜索、地图、文档）的场景，Gemini更顺手。OS级别任务自动化、代码执行与文件操作较多的场景，Claude更合适。

---

## 直接评价：现在能用吗

<strong>现在就把这个功能上生产，还为时过早。</strong>

理由有三。

第一，EXPERIMENTAL状态。SDK自己就在打警告。下个版本接口可能变——主要参数名已经和外部文档对不上，这种可能性并不低。

第二，成本无法预测。智能体会调用几次工具、花多少钱，很难控制。在[选择AI智能体框架](/zh/blog/zh/ai-agent-framework-comparison-2026-langgraph-crewai-dapr-production)时，成本可控性是重要评估维度。目前Gemini Managed Agents在这个维度上表现偏弱。

第三，公开工具水平比发布资料描述的更受限。Linux沙箱访问、4核/16GB环境这些内容，在目前公开API里无法确认。如果完全按发布材料的说法来理解，实际体验会和预期有落差。

不过，<strong>现在用来做实验和准备，时机是合适的。</strong>

接口比`generate_content()`简单得多。以状态机管理智能体执行结果这个概念清晰明确。像Deep Research智能体这样，能快速调用目的特化型智能体的结构，也很有意思。Google Search、Google Maps等Google基础设施工具的整合，是Anthropic和OpenAI短期内难以复制的领域。

等6〜12个月后这个功能转为GA（正式发布）、计费结构公开，再认真考量也不迟。

---

## 代码汇总：实际可用的几种模式

最后把实用模式集中整理在一起，有API密钥就能直接跑。

```python
import google.genai as genai
import time
import warnings

# 如果想看到EXPERIMENTAL警告，取消下面这行注释
# warnings.filterwarnings('error', category=UserWarning)

client = genai.Client(api_key="YOUR_GEMINI_API_KEY")


# --- 模式1：基础单次执行 ---
def run_basic(prompt: str, model: str = "gemini-2.5-flash") -> str:
    response = client.interactions.create(
        model=model,
        input=prompt
    )
    texts = []
    for content in (response.outputs or []):
        if hasattr(content, 'text'):
            texts.append(content.text)
    return "\n".join(texts)


# --- 模式2：多轮对话 ---
class GeminiConversation:
    def __init__(self, model: str = "gemini-2.5-flash"):
        self.model = model
        self.last_interaction_id: str | None = None

    def send(self, message: str) -> str:
        kwargs = {
            "model": self.model,
            "input": message,
        }
        if self.last_interaction_id:
            kwargs["previous_interaction_id"] = self.last_interaction_id

        response = client.interactions.create(**kwargs)
        self.last_interaction_id = response.id

        texts = []
        for content in (response.outputs or []):
            if hasattr(content, 'text'):
                texts.append(content.text)
        return "\n".join(texts)


# --- 模式3：含网络搜索 ---
def run_with_search(prompt: str) -> str:
    response = client.interactions.create(
        model="gemini-2.5-flash",
        input=prompt,
        tools=[{"type": "google_search"}]
    )
    texts = []
    for content in (response.outputs or []):
        if hasattr(content, 'text'):
            texts.append(content.text)
    return "\n".join(texts)


# --- 模式4：后台执行 + 轮询 ---
def run_background(prompt: str, poll_interval: float = 2.0) -> str:
    response = client.interactions.create(
        model="gemini-2.5-flash",
        input=prompt,
        background=True,
        store=True  # 必须设置store=True
    )

    interaction_id = response.id
    while True:
        result = client.interactions.get(interaction_id)
        if result.status in ("completed", "failed", "cancelled"):
            break
        time.sleep(poll_interval)

    if result.status != "completed":
        raise RuntimeError(f"Interaction ended with status: {result.status}")

    texts = []
    for content in (result.outputs or []):
        if hasattr(content, 'text'):
            texts.append(content.text)
    return "\n".join(texts)


# --- 模式5：Deep Research Agent ---
def run_deep_research(query: str) -> str:
    response = client.interactions.create(
        agent="deep-research-pro-preview-12-2025",
        input=query,
        agent_config={"type": "deep-research"}
    )
    texts = []
    for content in (response.outputs or []):
        if hasattr(content, 'text'):
            texts.append(content.text)
    return "\n".join(texts)
```

---

## 错误处理和注意事项

实际写代码时会遇到一些边界情况，提前知道可以少走弯路。

<strong>status为'failed'时，outputs可能是None。</strong>不加`response.outputs or []`的保护，直接迭代会触发`TypeError`。

<strong>用background=True时漏掉store=True，后续无法查询。</strong>事后调`client.interactions.get(interaction_id)`会返回404。后台执行和结果存储是两个独立选项，必须分开设置。

<strong>流式输出必须用context manager。</strong>正确写法是`with client.interactions.create(..., stream=True) as stream:`。在with块外引用stream，会访问已关闭的连接。

<strong>tools参数必须是字典列表。</strong>类型提示和官方文档都不够清晰，写成`tools={"type": "google_search"}`单个字典就会报错。必须用列表包裹。

```python
# 错误处理模式
def safe_run(prompt: str) -> str | None:
    try:
        response = client.interactions.create(
            model="gemini-2.5-flash",
            input=prompt
        )
        if response.status == "failed":
            print(f"Interaction failed: {response.id}")
            return None

        texts = []
        for content in (response.outputs or []):
            if hasattr(content, 'text') and content.text:
                texts.append(content.text)
        return "\n".join(texts) if texts else None

    except Exception as e:
        print(f"API error: {e}")
        return None
```

---

## 总结

Google I/O 2026发布的Gemini Managed Agents，方向是对的。用一次API调用抽象智能体执行的思路、基于状态机的interaction管理、与Google基础设施工具的集成，在设计层面都很干净。

但发布声明和SDK现实之间有落差，EXPERIMENTAL标签还没摘掉。我觉得与其现在就冲进去往服务里接，不如先把时间花在熟悉SDK结构、理解Deep Research Agent这类专用智能体工作方式上。在个人项目或内部工具里做实验，现在做完全值得。

有一点可以确定：Anthropic的Claude Managed Agents率先发布之后，Google和OpenAI快速跟进，"以托管服务方式提供智能体"已经成为整个行业的趋势。1〜2年内这套接口稳定下来，到时候才是真正面临"用哪家的智能体"这个选择题的时刻。智能体运行时成本、工具访问权限、上下文管理方式、监控便利性，将是那时候做选择的核心标准。

具体的更新动态跟着`google-genai`包的发布说明和Google AI for Developers博客走就行。SDK每次版本升级，interactions相关的变更内容值得重点关注。
