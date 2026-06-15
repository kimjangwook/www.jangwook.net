---
title: PydanticAI实战教程 — 用FastAPI的感觉构建类型安全的AI智能体
description: >-
  我实际安装了PydanticAI
  1.88.0，直接测试了TestModel、output_type、@agent.tool和多提供商切换。包括result_type→output_type变更等真实陷阱，以及完整的FunctionModel测试策略。
pubDate: '2026-04-29'
heroImage: ../../../assets/blog/pydantic-ai-type-safe-agent-tutorial-2026-hero.jpg
tags:
  - python
  - pydantic-ai
  - ai-agent
relatedPosts:
  - slug: python-ai-agent-library-comparison-2026
    score: 0.9
    reason:
      ko: Python 주제를 한 단계 더 깊이 파고드는 글입니다.
      en: Goes one level deeper into Python.
      ja: Pythonをもう一歩深く掘り下げた記事です。
      zh: 更深入地探讨 Python 主题。
  - slug: google-adk-vs-langgraph-agent-framework-comparison-2026
    score: 0.85
    reason:
      ko: ai-agent를 실제로 다뤄본 경험이 이어지는 글입니다.
      en: Continues the hands-on ai-agent experience.
      ja: ai-agentを実際に扱った経験が続く記事です。
      zh: 延续 ai-agent 的实战经验。
  - slug: fastmcp-python-mcp-server-build-guide-2026
    score: 0.8
    reason:
      ko: 같은 Python 흐름에서 함께 읽으면 좋습니다.
      en: Worth reading alongside this in the same Python track.
      ja: 同じPythonの流れで併せて読むと役立ちます。
      zh: 在同一 Python 脉络中可一并阅读。
faq:
  - question: "可以在没有API密钥的情况下测试PydanticAI吗？"
    answer: "可以。TestModel不调用任何API，能验证智能体结构、工具配置和依赖注入是否正确。在CI流水线中可零成本验证智能体逻辑，之后再接入真实提供商。"
  - question: "为什么在v1.88.0中使用result_type会报错？"
    answer: "因为v1.88.0中result_type参数已重命名为output_type，使用旧文档会触发Unknown keyword arguments错误。通过inspect.signature确认可知output_type才是正确的参数名。"
  - question: "如何在PydanticAI中切换模型提供商？"
    answer: "保持智能体定义不变，只更改传给run_sync的model字符串即可，例如anthropic:claude-sonnet-4-6、openai:gpt-4o或google-gla:gemini-2.5-flash。无需修改智能体逻辑，只需注意安装对应提供商的专用包。"
  - question: "什么时候用TestModel，什么时候用FunctionModel？"
    answer: "TestModel为str返回'a'、为int返回0等最小值，对结构测试足够，但遇到严格的自定义validator会失败。当有validator或需要测试工具响应时，使用可直接提供精确响应的FunctionModel。"
---

```python
from pydantic_ai import Agent
from pydantic_ai.models.test import TestModel

agent = Agent('test', system_prompt='Python专家')
result = agent.run_sync('f-string和.format()哪个更快？', model=TestModel())
print(result.output)  # → success (no tool calls)
```

第一次看到这段代码不需要API密钥就能运行时，我略感惊讶。那种感觉和第一次用FastAPI一样。结构太直观了，反而让人有点怀疑。PydanticAI就是这样一个库。

坦白说，我最初的印象是"这不就是给Instructor加了个包装器吗？"实际使用后想法变了。这是一个以类型系统为核心的框架，把FastAPI带给Web API的那套哲学直接搬到了AI智能体上。今天分享的是我实际安装和运行后的结果，包括失败的测试。

## 为什么选PydanticAI: 与比较文章不同的视角

我之前写过一篇[Python AI智能体库对比文章](/zh/blog/zh/python-ai-agent-library-comparison-2026)，涵盖PydanticAI、Instructor和Smolagents。那篇文章回答"选哪个"，这篇文章回答"用PydanticAI怎么实际构建"。实现方法才是目的。

各库定位快速对比:

| 库 | 核心职责 | 智能体循环 | 类型安全 |
|----|----------|-----------|---------|
| Instructor | LLM输出解析 | 无 | 仅结构化输出 |
| PydanticAI | 智能体框架 | 完整支持 | 输入+输出+工具全覆盖 |
| LangGraph | 编排 | 图结构 | 较弱 |
| CrewAI | 多智能体团队 | 角色制 | 较弱 |

第二行才是实际使用时的真正差别。在LLM调用工具、接收结果、处理的整个循环中，类型始终保持一致。运行时错误提前变成开发阶段的IDE错误。

## 安装与前置条件

```bash
pip install pydantic-ai
```

截至今日（2026年4月29日）最新版本为1.88.0。

```bash
python3 -m venv venv
source venv/bin/activate
pip install pydantic-ai
```

各提供商专用包按需安装:

```bash
pip install pydantic-ai[anthropic]   # Claude
pip install pydantic-ai[openai]       # GPT-4o
pip install pydantic-ai[google]       # Gemini
```

**要求**: Python 3.9+、pydantic v2（不支持v1）。TestModel无需API密钥即可工作。

## 第一个智能体：用TestModel验证结构

这是我构建新智能体时的第一步。在接入真实API之前先验证结构是否正确。

```python
from pydantic_ai import Agent
from pydantic_ai.models.test import TestModel

agent = Agent(
    'test',
    system_prompt='你是Python代码审查员。请简洁回答。',
)

result = agent.run_sync(
    'f-string和.format()哪个更快？',
    model=TestModel()  # 无需API密钥
)

print(result.output)    # → "success (no tool calls)"
print(result.usage())   # → RunUsage(input_tokens=64, output_tokens=4, requests=1)
```

`TestModel`不调用任何API。它是专为测试设计的模型，用于验证智能体结构、工具配置和依赖注入是否正确。在CI流水线中零成本验证智能体逻辑。

切换到真实Claude只需改一行:

```python
import os
os.environ['ANTHROPIC_API_KEY'] = 'sk-ant-...'

# 开发阶段: TestModel
result = agent.run_sync('代码审查', model=TestModel())

# 生产环境: 真实Claude
result = agent.run_sync('代码审查', model='anthropic:claude-sonnet-4-6')
```

智能体代码不变，只换模型。

## 结构化输出：用output_type返回Pydantic模型

这是PydanticAI的核心价值。强制LLM返回Pydantic模型实例，而不是自由文本。

**重要 — v1.88.0破坏性变更**: `result_type`参数已重命名为`output_type`。使用旧文档或教程会报错:

```
pydantic_ai.exceptions.UserError: Unknown keyword arguments: `result_type`
```

我亲自踩坑了。通过`inspect.signature(Agent.__init__)`确认`output_type`才是正确的参数名。官方文档在某些地方仍引用旧API，需要注意。

```python
from pydantic import BaseModel, Field
from pydantic_ai import Agent

class CodeReview(BaseModel):
    severity: str = Field(description="'low'、'medium'或'high'之一")
    issues: list[str] = Field(description="发现的问题列表")
    suggestions: list[str] = Field(description="改进建议列表")
    score: int = Field(ge=0, le=100, description="代码质量分数0-100")

review_agent = Agent(
    'anthropic:claude-sonnet-4-6',
    output_type=CodeReview,  # ← v1.88.0: 不是result_type
    system_prompt='审查Python代码并提供结构化反馈。',
)

result = review_agent.run_sync('''
def get_user(id):
    db = connect()
    return db.query(f"SELECT * FROM users WHERE id={id}")
''')

print(type(result.output))       # → <class '__main__.CodeReview'>
print(result.output.severity)    # → 'high'
print(result.output.score)       # → 25
print(result.output.issues[0])   # → 'SQL注入漏洞'
```

返回值是Pydantic模型实例，不是dict或字符串。`result.output.`后IDE会自动补全所有字段。

### 自动重试机制

当LLM返回不符合schema的输出时，PydanticAI会将ValidationError反馈给LLM并请求重试:

```python
review_agent = Agent(
    'anthropic:claude-sonnet-4-6',
    output_type=CodeReview,
    retries=3,        # 验证失败时最多重试3次
    output_retries=2  # 输出专用重试次数
)
```

3次全部失败后抛出`UnexpectedModelBehavior`异常。

## @agent.tool与依赖注入: 与FastAPI的Depends()相同的模式

```python
from pydantic_ai import Agent, RunContext

class AppDeps:
    def __init__(self, db_url: str, user_id: int):
        self.db_url = db_url
        self.user_id = user_id

agent = Agent(
    'anthropic:claude-sonnet-4-6',
    deps_type=AppDeps,
    system_prompt='任务管理智能体。',
)

# 异步工具 — 适用于I/O密集操作
@agent.tool
async def get_pending_tasks(ctx: RunContext[AppDeps], limit: int = 5) -> list[dict]:
    """获取待处理任务列表"""
    return [
        {"id": f"task_{i}", "title": f"任务 {i}", "priority": "high"}
        for i in range(limit)
    ]

# 同步工具 — 适用于快速计算
@agent.tool
def calculate_priority_score(
    ctx: RunContext[AppDeps],
    urgency: int,
    importance: int
) -> float:
    """计算任务优先级分数"""
    return urgency * 0.6 + importance * 0.4

deps = AppDeps(db_url="postgresql://localhost/taskdb", user_id=42)
result = agent.run_sync("从紧急任务中选出最高优先级的", deps=deps)
```

`@agent.tool`读取函数签名（参数类型、默认值）和docstring，自动生成传给LLM的JSON Schema。

消息流可通过`result.all_messages()`追踪，共4个阶段:

```
1. ModelRequest  → system_prompt + user_prompt
2. ModelResponse → ToolCallPart(tool_name='get_pending_tasks', ...)
3. ModelRequest  → ToolReturnPart(content=[{...}])
4. ModelResponse → 最终回答
```

![PydanticAI执行日志 — 沙箱测试结果](../../../assets/blog/pydantic-ai-type-safe-agent-tutorial-2026-log.jpg)

## TestModel vs FunctionModel: 测试策略

在沙箱测试中发现了TestModel的重要限制。

### TestModel的限制

TestModel为`str`字段返回`'a'`，为`int`字段返回`0`等最小值。对于严格的自定义validator会失败:

```python
from pydantic_ai.exceptions import UnexpectedModelBehavior

class UserProfile(BaseModel):
    email: str

    @field_validator('email')
    @classmethod
    def valid_email(cls, v):
        if '@' not in v:  # TestModel返回'a'，始终失败
            raise ValueError('邮箱必须包含@')
        return v

agent = Agent('test', output_type=UserProfile, retries=3)
try:
    result = agent.run_sync('...', model=TestModel())
except UnexpectedModelBehavior as e:
    print(e)  # → Exceeded maximum retries (3) for output validation
```

这不是bug。TestModel用于结构验证，而非业务逻辑validator测试。

### 用FunctionModel精确控制

有validator或需要测试工具响应时使用`FunctionModel`:

```python
from pydantic_ai.models.function import FunctionModel
from pydantic_ai.messages import ModelMessage, ModelResponse, TextPart
from pydantic_ai.settings import ModelSettings
import json

def mock_valid_response(messages: list[ModelMessage], settings: ModelSettings) -> ModelResponse:
    """直接提供测试时要返回的精确响应"""
    data = {"email": "test@example.com", "name": "测试用户"}
    return ModelResponse(parts=[TextPart(content=json.dumps(data))])

agent = Agent(FunctionModel(mock_valid_response), output_type=UserProfile)
result = agent.run_sync("...")
assert result.output.email == "test@example.com"
```

### 完整测试策略

```python
class TestMyAgent:
    def test_structure(self):
        """智能体结构验证 — TestModel"""
        result = my_agent.run_sync("测试", model=TestModel())
        assert result is not None

    def test_tool_called(self):
        """工具调用确认 — TestModel + call_tools"""
        result = my_agent.run_sync(
            "从数据库获取数据",
            deps=test_deps,
            model=TestModel(call_tools=['query_database'])
        )
        assert 'query_database' in result.output

    def test_response_processing(self):
        """响应处理逻辑 — FunctionModel"""
        def mock_fn(messages, settings):
            return ModelResponse(parts=[TextPart(content='{"email": "t@t.com"}')])

        result = my_agent.run_sync("...", model=FunctionModel(mock_fn))
        assert result.output.email == "t@t.com"
```

## 多提供商切换：不动智能体代码

不修改智能体代码，只换模型字符串即可切换提供商:

```python
review_agent = Agent(
    system_prompt='作为高级Python开发者进行代码审查。',
    output_type=CodeReview,
)

# 运行时指定模型
result_claude = review_agent.run_sync(code, model='anthropic:claude-sonnet-4-6')
result_gpt    = review_agent.run_sync(code, model='openai:gpt-4o')
result_gemini = review_agent.run_sync(code, model='google-gla:gemini-2.5-flash')
result_local  = review_agent.run_sync(code, model='ollama:llama3.3')
```

从上下文工程的角度看，`system_prompt`和`output_type` schema是上下文的核心，在此基础上让模型可替换才是好的架构设计。

## 实际使用感受: 直言不讳

**优点**:
- 类型安全切实产生差异。修改`output_type` schema，IDE立即捕捉所有相关错误
- `@agent.tool`自动生成JSON Schema，无需手动重写工具规范
- TestModel + FunctionModel组合，无需任何API即可完整进行单元测试
- `deps_type`使依赖注入显式化，测试中的mock替换更加简洁

**不足之处**:
- 直到v1.88.0仍有`result_type → output_type`这样的不兼容变更。库还未进入稳定阶段。需要通过`inspect.signature(Agent.__init__)`确认实际参数名的情况时有发生
- 流式结构化输出仍处于beta阶段。在LLM生成部分响应时解析为Pydantic模型比较棘手，当前实现不够稳定
- 强依赖Pydantic v2。如果是v1遗留代码库，需要考虑迁移成本
- Logfire集成（Pydantic团队的监控服务）是官方可观测性路径，但需付费。直接连接OpenTelemetry虽然可行，但官方文档支持不足

结合生产级AI智能体设计原则阅读，可以更清楚地了解选择智能体框架时哪些标准最重要。

## 何时使用，何时避免

基于实际投入使用的经验，坦率地总结一下。它并非适合所有项目的工具。

**适合使用PydanticAI的场景**:

- 结构化输出是核心。如果你把LLM响应强制为Pydantic模型，并在其上构建业务逻辑，类型安全会直接带来收益。
- 你已经在使用FastAPI或基于Pydantic v2的技术栈。`deps_type`与`Depends()`共享同一套心智模型，学习成本几乎为零。
- 你计划对多个提供商做A/B测试，或出于成本考虑替换模型。智能体代码无需改动。
- 你想在CI中零成本单元测试智能体逻辑。TestModel与FunctionModel的组合在此大放异彩。

**应避免或暂缓的场景**:

- 你处于Pydantic v1遗留代码库。迁移成本可能超过引入框架的收益。
- 流式结构化输出是产品的核心功能。当前实现仍是beta，稳定性难以保证。
- 复杂的多智能体图编排是主要目标。该领域LangGraph一方更为成熟。[Google ADK vs LangGraph对比](/zh/blog/zh/google-adk-vs-langgraph-agent-framework-comparison-2026)中的标准有助于判断。
- 你没有精力跟进版本固定和CHANGELOG追踪。它尚处于1.0之前，破坏性变更确实会发生。

总结来说，对于以类型为中心的单个或少量智能体场景，它是目前最佳选择；但对于大规模图工作流或v1环境，应先考虑其他工具。

## 参考资料（一手来源）

我直接核实过的官方文档和仓库。版本变化很快，建议动手前先查阅原文。

- [PydanticAI官方文档](https://ai.pydantic.dev) — 智能体、工具、输出类型的完整参考
- [PydanticAI测试指南](https://ai.pydantic.dev/testing/) — TestModel与FunctionModel的官方说明
- [pydantic/pydantic-ai (GitHub)](https://github.com/pydantic/pydantic-ai) — 源码、CHANGELOG和发布说明
- [pydantic/pydantic (GitHub)](https://github.com/pydantic/pydantic) — 作为基础的Pydantic v2库

在同一Python技术栈中可继续阅读[用FastMCP构建MCP服务器](/zh/blog/zh/fastmcp-python-mcp-server-build-guide-2026)和[FastAPI + Claude API流式生产指南](/zh/blog/zh/fastapi-claude-api-streaming-production-guide-2026)。

## 核心模式快速总结

```python
from pydantic import BaseModel, Field
from pydantic_ai import Agent, RunContext
from pydantic_ai.models.test import TestModel
from pydantic_ai.models.function import FunctionModel
from pydantic_ai.messages import ModelMessage, ModelResponse, TextPart
from pydantic_ai.settings import ModelSettings
import json

# 1. 结构化输出模型
class ReviewResult(BaseModel):
    score: int = Field(ge=0, le=100)
    verdict: str  # 'approve', 'request_changes'
    summary: str

# 2. 依赖类型
class AgentDeps:
    def __init__(self, repo_name: str, author: str):
        self.repo_name = repo_name
        self.author = author

# 3. 智能体定义
agent = Agent(
    system_prompt='代码审查智能体。',
    output_type=ReviewResult,  # v1.88.0: output_type（不是result_type）
    deps_type=AgentDeps,
    retries=3,
)

# 4. 工具注册
@agent.tool
def get_context(ctx: RunContext[AgentDeps]) -> dict:
    return {"repo": ctx.deps.repo_name, "author": ctx.deps.author}

# 5. 测试
result = agent.run_sync("审查这段代码",
    deps=AgentDeps("my-repo", "jangwook"),
    model=TestModel())

def mock(messages, settings):
    return ModelResponse(parts=[TextPart(content=json.dumps({
        "score": 85, "verdict": "approve", "summary": "代码整洁"
    }))])

result = agent.run_sync("审查这段代码",
    deps=AgentDeps("my-repo", "jangwook"),
    model=FunctionModel(mock))
assert result.output.verdict == "approve"

# 6. 生产环境：只换模型
result = agent.run_sync("审查这段代码",
    deps=AgentDeps("my-repo", "jangwook"),
    model='anthropic:claude-sonnet-4-6')
```

## 下一步

TypeScript技术栈可参考使用Vercel AI SDK构建Claude流式智能体。

将PydanticAI投入生产的推荐步骤:

1. 先用`output_type`定义返回schema
2. 用`deps_type`管理DB连接、HTTP客户端等依赖
3. 通过`@agent.tool`添加外部API集成
4. 按TestModel → FunctionModel → 真实模型的顺序逐步测试
5. 用`retries=3`和`output_retries=2`配置重试策略
6. 固定版本（`pydantic-ai==1.88.0`）。这个库变化频繁

PydanticAI GitHub仓库更新很快。先看CHANGELOG再看官方文档能节省真实的调试时间。根据亲身经历——这个库还没到1.0，但对于Python智能体技术栈，它目前是最一致的类型安全选择。
