---
title: 'PydanticAI Practical Tutorial — Building Type-Safe AI Agents the FastAPI Way'
description: 'I installed PydanticAI 1.88.0 and tested TestModel, output_type, @agent.tool, and multi-provider switching hands-on. Includes real traps like result_type→output_type and a complete FunctionModel test strategy.'
pubDate: '2026-04-29'
heroImage: '../../../assets/blog/pydantic-ai-type-safe-agent-tutorial-2026-hero.jpg'
tags:
  - python
  - pydantic-ai
  - ai-agent
relatedPosts:
  - slug: python-ai-agent-library-comparison-2026
    score: 0.92
    reason:
      ko: 이 튜토리얼에서 PydanticAI를 골랐다면, 비교 포스트가 왜 이 라이브러리가 Instructor나 Smolagents와 다른지 정확히 짚어준다.
      ja: このチュートリアルでPydanticAIを選んだなら、比較ポストがInstructorやSmolagentsとの違いを明確に説明してくれる。
      en: If you chose PydanticAI after this tutorial, the comparison post explains precisely why it differs from Instructor or Smolagents.
      zh: 如果在本教程后选择了PydanticAI，比较文章能精确说明它与Instructor或Smolagents的区别。
  - slug: ai-agent-framework-comparison-2026-langgraph-crewai-dapr-production
    score: 0.85
    reason:
      ko: PydanticAI로 단일 에이전트를 만들었다면, 다음 질문은 오케스트레이션 프레임워크와 어떻게 조합하느냐다. LangGraph·CrewAI 비교가 그 답을 제시한다.
      ja: PydanticAIで単体エージェントを作ったなら、次の問いはオーケストレーションフレームワークとどう組み合わせるかだ。LangGraph・CrewAI比較がその答えを示す。
      en: Once you've built a single agent with PydanticAI, the next question is how to combine it with orchestration frameworks. The LangGraph·CrewAI comparison answers that.
      zh: 用PydanticAI构建了单个智能体后，下一个问题是如何与编排框架结合。LangGraph·CrewAI对比文章给出了答案。
  - slug: production-grade-ai-agent-design-principles
    score: 0.82
    reason:
      ko: 에이전트가 TestModel을 넘어 실제 LLM과 연동되는 순간부터 프로덕션 설계 원칙이 필요해진다. 이 포스트에서 재시도 전략과 관찰 가능성을 다룬다.
      ja: エージェントがTestModelを超えて実際のLLMと連携する瞬間から、本番設計原則が必要になる。このポストではリトライ戦略と可観測性を扱う。
      en: The moment your agent moves beyond TestModel to a real LLM, production design principles become essential. This post covers retry strategy and observability.
      zh: 当智能体从TestModel转向真实LLM时，生产设计原则就变得必不可少。这篇文章涵盖重试策略和可观测性。
  - slug: context-engineering-production-ai-agents
    score: 0.78
    reason:
      ko: PydanticAI의 system_prompt와 의존성 주입 패턴이 컨텍스트 엔지니어링과 어떻게 연결되는지 이 포스트에서 확인할 수 있다.
      ja: PydanticAIのsystem_promptと依存性注入パターンがコンテキストエンジニアリングとどう結びつくかをこのポストで確認できる。
      en: This post shows how PydanticAI's system_prompt and dependency injection patterns connect to context engineering.
      zh: 这篇文章展示了PydanticAI的system_prompt和依赖注入模式如何与上下文工程相结合。
  - slug: vercel-ai-sdk-claude-streaming-agent-2026
    score: 0.74
    reason:
      ko: Python 백엔드가 아닌 TypeScript/Next.js 스택에서 비슷한 스트리밍 에이전트를 만들고 싶다면, Vercel AI SDK 포스트가 정확히 그 경로를 다룬다.
      ja: PythonバックエンドではなくTypeScript/Next.jsスタックで同様のストリーミングエージェントを作りたいなら、Vercel AI SDKポストがまさにその経路を扱っている。
      en: If you want to build a similar streaming agent on a TypeScript/Next.js stack instead of Python, the Vercel AI SDK post covers exactly that path.
      zh: 如果想在TypeScript/Next.js技术栈而非Python后端构建类似的流式智能体，Vercel AI SDK文章正好涵盖了这条路径。
---

```python
from pydantic_ai import Agent
from pydantic_ai.models.test import TestModel

agent = Agent('test', system_prompt='Python expert')
result = agent.run_sync('Is f-string faster than .format()?', model=TestModel())
print(result.output)  # → success (no tool calls)
```

When I first saw this run without an API key, I was mildly surprised. Same feeling as when I first used FastAPI — the structure was so intuitive it almost made me suspicious. That's PydanticAI in a nutshell.

Honestly, my first impression was "isn't this just Instructor with a wrapper?" Using it changed my mind. It's a framework built around the type system — the same philosophy FastAPI brought to web APIs, now applied to AI agents. Here's what I actually found when I installed and ran it, failed tests included.

## Why PydanticAI — A Different Angle from the Comparison Post

I wrote a [Python AI Agent Library Comparison](/en/blog/en/python-ai-agent-library-comparison-2026) covering PydanticAI, Instructor, and Smolagents. That post answers "which one to pick." This one answers "how do you actually build with PydanticAI."

Quick breakdown of where each library sits:

| Library | Core role | Agent loop | Type safety |
|---------|-----------|------------|-------------|
| Instructor | LLM output parsing | None | Structured output only |
| PydanticAI | Agent framework | Full support | Input + output + tools |
| LangGraph | Orchestration | Graph-based | Weak |
| CrewAI | Multi-agent teams | Role-based | Weak |

That second row is what makes the real difference. Types are maintained throughout the entire loop — LLM calls a tool, gets results, processes them. Runtime errors surface as IDE errors during development.

GitHub stars: 16K+. Built by the Pydantic team, so maintenance concerns are minimal.

## Installation and Prerequisites

```bash
pip install pydantic-ai
```

Latest version as of today (April 29, 2026) is 1.88.0. Clean install.

```bash
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install pydantic-ai
```

Provider-specific packages install on demand:

```bash
pip install pydantic-ai[anthropic]   # For Claude
pip install pydantic-ai[openai]       # For GPT-4o
pip install pydantic-ai[google]       # For Gemini
```

**Requirements**: Python 3.9+, pydantic v2 (v1 not supported). TestModel works without any API key.

## First Agent: TestModel for Structure Validation

My go-to first step when building a new agent. Verify the structure before connecting a real API.

```python
from pydantic_ai import Agent
from pydantic_ai.models.test import TestModel

agent = Agent(
    'test',
    system_prompt='You are a Python code reviewer. Be concise.',
)

result = agent.run_sync(
    'Is f-string faster than .format()?',
    model=TestModel()  # No API key required
)

print(result.output)    # → "success (no tool calls)"
print(result.usage())   # → RunUsage(input_tokens=64, output_tokens=4, requests=1)
```

`TestModel` makes no API calls. It's a test-only model for validating agent structure, tool wiring, and dependency injection. Use it in CI pipelines for zero-cost agent logic verification.

Switching to real Claude is a single-line change:

```python
import os
os.environ['ANTHROPIC_API_KEY'] = 'sk-ant-...'

# Development: TestModel
result = agent.run_sync('Review this code', model=TestModel())

# Production: Real Claude
result = agent.run_sync('Review this code', model='anthropic:claude-sonnet-4-6')
```

Agent code stays identical. Only the model changes.

## Structured Output: output_type Returns Pydantic Models

This is PydanticAI's core value proposition. Force the LLM to return a Pydantic model instance instead of free text.

**Critical — v1.88.0 Breaking Change**: The `result_type` parameter was renamed to `output_type`. Old docs or tutorials will give you:

```
pydantic_ai.exceptions.UserError: Unknown keyword arguments: `result_type`
```

I hit this directly. Confirmed via `inspect.signature(Agent.__init__)` that `output_type` is the correct name. Official docs still reference the old API in some places — watch out.

```python
from pydantic import BaseModel, Field
from pydantic_ai import Agent

class CodeReview(BaseModel):
    severity: str = Field(description="'low', 'medium', or 'high'")
    issues: list[str] = Field(description="List of issues found")
    suggestions: list[str] = Field(description="Improvement suggestions")
    score: int = Field(ge=0, le=100, description="Code quality score 0-100")

review_agent = Agent(
    'anthropic:claude-sonnet-4-6',
    output_type=CodeReview,  # ← v1.88.0: NOT result_type
    system_prompt='Review Python code and provide structured feedback.',
)

result = review_agent.run_sync('''
def get_user(id):
    db = connect()
    return db.query(f"SELECT * FROM users WHERE id={id}")
''')

print(type(result.output))       # → <class '__main__.CodeReview'>
print(result.output.severity)    # → 'high'
print(result.output.score)       # → 25
print(result.output.issues[0])   # → 'SQL injection vulnerability'
```

The return value is a Pydantic model instance, not a dict or string. IDE autocomplete works on `result.output.`. The `score` field's 0-100 range is enforced by Pydantic automatically.

### Automatic Retry Mechanism

When the LLM returns output that fails validation, PydanticAI feeds the `ValidationError` back to the LLM and requests a retry:

```python
review_agent = Agent(
    'anthropic:claude-sonnet-4-6',
    output_type=CodeReview,
    retries=3,        # Retry up to 3 times on validation failure
    output_retries=2  # Separate retry count for output validation
)
```

After 3 failures, `UnexpectedModelBehavior` is raised. In production, this handles models that occasionally return malformed output automatically.

## @agent.tool and Dependency Injection — FastAPI's Depends() Pattern

```python
from pydantic_ai import Agent, RunContext

class AppDeps:
    def __init__(self, db_url: str, user_id: int):
        self.db_url = db_url
        self.user_id = user_id

agent = Agent(
    'anthropic:claude-sonnet-4-6',
    deps_type=AppDeps,
    system_prompt='You are a task management agent.',
)

# Async tool for I/O-heavy operations
@agent.tool
async def get_pending_tasks(ctx: RunContext[AppDeps], limit: int = 5) -> list[dict]:
    """Get list of pending tasks"""
    return [
        {"id": f"task_{i}", "title": f"Task {i}", "priority": "high"}
        for i in range(limit)
    ]

# Sync tool for fast computation
@agent.tool
def calculate_priority_score(
    ctx: RunContext[AppDeps],
    urgency: int,
    importance: int
) -> float:
    """Calculate task priority score"""
    return urgency * 0.6 + importance * 0.4

deps = AppDeps(db_url="postgresql://localhost/taskdb", user_id=42)
result = agent.run_sync("Pick the highest priority urgent task", deps=deps)
```

`@agent.tool` reads the function signature (parameter types, defaults) and docstring to auto-generate the JSON Schema it passes to the LLM. Write `limit: int = 5` and the LLM knows the parameter accepts an integer with a default of 5.

Message flow is 4 stages, accessible via `result.all_messages()`:

```
1. ModelRequest  → system_prompt + user_prompt
2. ModelResponse → ToolCallPart(tool_name='get_pending_tasks', ...)
3. ModelRequest  → ToolReturnPart(content=[{...}])
4. ModelResponse → Final answer
```

![PydanticAI execution log — sandbox test results](../../../assets/blog/pydantic-ai-type-safe-agent-tutorial-2026-log.jpg)

## TestModel vs FunctionModel — Test Strategy

I found TestModel's critical limitation while testing in the sandbox. Worth documenting.

### TestModel's Limitation

TestModel returns minimum values: `'a'` for `str`, `0` for `int`. Fine for structure tests, but strict custom validators will fail:

```python
from pydantic_ai.exceptions import UnexpectedModelBehavior

class UserProfile(BaseModel):
    email: str

    @field_validator('email')
    @classmethod
    def valid_email(cls, v):
        if '@' not in v:  # TestModel returns 'a' — always fails
            raise ValueError('Email must contain @')
        return v

agent = Agent('test', output_type=UserProfile, retries=3)
try:
    result = agent.run_sync('...', model=TestModel())
except UnexpectedModelBehavior as e:
    print(e)  # → Exceeded maximum retries (3) for output validation
```

This isn't a bug. TestModel is for structure validation, not business logic validator testing.

### FunctionModel for Precise Control

Use `FunctionModel` when you have validators or need to test tool response handling:

```python
from pydantic_ai.models.function import FunctionModel
from pydantic_ai.messages import ModelMessage, ModelResponse, TextPart
from pydantic_ai.settings import ModelSettings
import json

def mock_valid_response(messages: list[ModelMessage], settings: ModelSettings) -> ModelResponse:
    """Provide exact response for testing"""
    data = {"email": "test@example.com", "name": "Test User"}
    return ModelResponse(parts=[TextPart(content=json.dumps(data))])

agent = Agent(FunctionModel(mock_valid_response), output_type=UserProfile)
result = agent.run_sync("...")
assert result.output.email == "test@example.com"
```

### Complete Test Strategy

```python
class TestMyAgent:
    def test_structure(self):
        """Agent structure validation — TestModel"""
        result = my_agent.run_sync("test", model=TestModel())
        assert result is not None

    def test_tool_called(self):
        """Tool invocation — TestModel + call_tools"""
        result = my_agent.run_sync(
            "Get data from DB",
            deps=test_deps,
            model=TestModel(call_tools=['query_database'])
        )
        assert 'query_database' in result.output

    def test_response_processing(self):
        """Response logic — FunctionModel"""
        def mock_fn(messages, settings):
            return ModelResponse(parts=[TextPart(content='{"email": "t@t.com"}')])

        result = my_agent.run_sync("...", model=FunctionModel(mock_fn))
        assert result.output.email == "t@t.com"
```

## Multi-Provider Switching

One of PydanticAI's tangible strengths: swap providers by changing a model string, nothing else.

```python
review_agent = Agent(
    system_prompt='Senior Python developer reviewing code.',
    output_type=CodeReview,
)

# Same agent, different providers at runtime
result_claude = review_agent.run_sync(code, model='anthropic:claude-sonnet-4-6')
result_gpt    = review_agent.run_sync(code, model='openai:gpt-4o')
result_gemini = review_agent.run_sync(code, model='google-gla:gemini-2.5-flash')
result_local  = review_agent.run_sync(code, model='ollama:llama3.3')
result_groq   = review_agent.run_sync(code, model='groq:llama-3.3-70b-versatile')
```

From a [context engineering standpoint](/en/blog/en/context-engineering-production-ai-agents), the `system_prompt` and `output_type` schema are the core context — designing so the model is swappable above that layer is good architecture.

Cost comparison pattern:

```python
import time

providers = {
    'claude': 'anthropic:claude-sonnet-4-6',
    'gpt4o': 'openai:gpt-4o',
    'gemini': 'google-gla:gemini-2.5-flash',
}

for name, model in providers.items():
    start = time.time()
    result = review_agent.run_sync(code, model=model)
    elapsed = time.time() - start
    print(f"{name}: score={result.output.score}, latency={elapsed:.2f}s, "
          f"tokens={result.usage().input_tokens + result.usage().output_tokens}")
```

## Honest Assessment — What I Liked and What Fell Short

**What worked well**:
- Type safety makes a real difference in practice. Change the `output_type` schema and the IDE flags every related error immediately
- `@agent.tool` auto-generates JSON Schema from function signatures — no manual tool spec rewriting
- TestModel + FunctionModel combination enables complete unit testing without any API calls
- `deps_type` makes dependency injection explicit, making mock swaps in tests clean

**Where it falls short**:
- Non-breaking changes like `result_type → output_type` happen frequently up through v1.88.0. The library isn't in a stable phase yet. I had to use `inspect.signature(Agent.__init__)` to verify the actual parameter name — that's a sign the docs lag behind the code
- Streaming structured output is still beta. Parsing into a Pydantic model while the LLM generates partial output is tricky, and the current implementation is unstable
- Hard dependency on Pydantic v2. If you're on a v1 legacy codebase, migration cost is real
- Logfire integration (Pydantic team's monitoring service) is the official observability path but it's paid. Direct OpenTelemetry connection is possible but not officially documented well

Reading [Production AI Agent Design Principles](/en/blog/en/production-grade-ai-agent-design-principles) alongside this post clarifies what criteria matter most when choosing an agent framework.

## Summary: Core Patterns at a Glance

```python
from pydantic import BaseModel, Field
from pydantic_ai import Agent, RunContext
from pydantic_ai.models.test import TestModel
from pydantic_ai.models.function import FunctionModel
from pydantic_ai.messages import ModelMessage, ModelResponse, TextPart
from pydantic_ai.settings import ModelSettings
import json

# 1. Structured output model
class ReviewResult(BaseModel):
    score: int = Field(ge=0, le=100)
    verdict: str  # 'approve', 'request_changes'
    summary: str

# 2. Dependency type
class AgentDeps:
    def __init__(self, repo_name: str, author: str):
        self.repo_name = repo_name
        self.author = author

# 3. Agent definition
agent = Agent(
    system_prompt='Code review agent.',
    output_type=ReviewResult,  # v1.88.0: output_type (not result_type)
    deps_type=AgentDeps,
    retries=3,
)

# 4. Tool registration
@agent.tool
def get_context(ctx: RunContext[AgentDeps]) -> dict:
    """Get repository context"""
    return {"repo": ctx.deps.repo_name, "author": ctx.deps.author}

# 5. Testing
## Structure test (no API)
result = agent.run_sync("Review this",
    deps=AgentDeps("my-repo", "jangwook"),
    model=TestModel())

## Response logic test (FunctionModel)
def mock(messages, settings):
    return ModelResponse(parts=[TextPart(content=json.dumps({
        "score": 85, "verdict": "approve", "summary": "Clean code"
    }))])

result = agent.run_sync("Review this",
    deps=AgentDeps("my-repo", "jangwook"),
    model=FunctionModel(mock))
assert result.output.verdict == "approve"

# 6. Production: swap model only
result = agent.run_sync("Review this",
    deps=AgentDeps("my-repo", "jangwook"),
    model='anthropic:claude-sonnet-4-6')
```

## Next Steps

For TypeScript stacks, [Building a Claude Streaming Agent with Vercel AI SDK](/en/blog/en/vercel-ai-sdk-claude-streaming-agent-2026) covers a similar approach.

If you're taking PydanticAI to production, recommended order:

1. Define the return schema with `output_type` first
2. Manage DB connections and HTTP clients as `deps_type`
3. Add external API integrations via `@agent.tool`
4. Test progressively: TestModel → FunctionModel → real model
5. Configure retry strategy with `retries=3` and `output_retries=2`
6. Pin the version (`pydantic-ai==1.88.0`). This library changes frequently

The PydanticAI GitHub repo updates fast. Reading the CHANGELOG before the official docs saves real debugging time. Speaking from experience — this library isn't at 1.0 yet, but for Python agent stacks, it's currently the most consistent type-safe option available.
