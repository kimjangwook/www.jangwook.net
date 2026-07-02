---
title: 'Ollama Structured Outputs with Pydantic — Type-Safe JSON'
description: >-
  A hands-on guide to Ollama's JSON schema enforcement with Pydantic for type-safe local LLM
  responses. Measured: 6x faster with near-100% parse success.
pubDate: '2026-06-17'
heroImage: '../../../assets/blog/ollama-structured-outputs-pydantic-local-llm-guide-2026/hero.png'
tags:
  - Ollama
  - Pydantic
  - LocalLLM
  - Python
relatedPosts:
  - slug: ollama-fastapi-production-deployment-guide-2026
    score: 0.88
    reason:
      ko: Ollama를 프로덕션 FastAPI 서버에 붙이는 방법을 다룬다. 구조화 출력 패턴을 익힌 뒤 REST API로 노출하려면 이 글이 이어지는 실전이다.
      ja: OllamaをプロダクションのFastAPIサーバーに接続する方法を扱う。構造化出力パターンを習得した後にREST APIとして公開したいなら、この記事が実践の続きになる。
      en: Covers wiring Ollama to a production FastAPI server — the natural next step after you have structured outputs working locally.
      zh: 介绍如何将Ollama连接到生产FastAPI服务器。掌握结构化输出模式后，若要通过REST API对外暴露，这篇文章是实战的延续。
  - slug: pydantic-ai-type-safe-agent-tutorial-2026
    score: 0.83
    reason:
      ko: Pydantic AI 프레임워크 자체를 에이전트 구조로 확장한 포스트다. 이 글에서 Pydantic 데이터 검증을 익혔다면 에이전트 전체를 Pydantic으로 감싸는 다음 단계다.
      ja: Pydantic AIフレームワーク自体をエージェント構造に拡張したポスト。このガイドでPydanticデータ検証を学んだら、エージェント全体をPydanticでラップする次のステップ。
      en: Shows how to extend Pydantic beyond validation into a full agent framework — a logical next step from using Pydantic to parse LLM outputs.
      zh: 展示了如何将Pydantic扩展到完整的代理框架——在用Pydantic解析LLM输出之后的自然延伸。
  - slug: local-llm-private-mcp-server-gemma4-fastmcp
    score: 0.79
    reason:
      ko: 같은 Ollama + Gemma 4 스택으로 완전 오프라인 MCP 서버를 구축한다. 구조화 출력으로 받은 데이터를 FastMCP 도구로 노출하는 다음 단계로 이어진다.
      ja: 同じOllama + Gemma 4スタックで完全オフラインのMCPサーバーを構築する。構造化出力で受け取ったデータをFastMCPツールとして公開する次の段階につながる。
      en: Builds a fully offline MCP server on the same Ollama and Gemma 4 stack — a natural next step for exposing your structured outputs as FastMCP tools.
      zh: 用同样的Ollama + Gemma 4技术栈构建完全离线的MCP服务器。可作为将结构化输出数据通过FastMCP工具对外暴露的下一步。
  - slug: claude-agent-sdk-tool-use-complete-guide-2026
    score: 0.74
    reason:
      ko: Claude API에서 Tool Use를 구현하는 패턴과 이 글의 에이전트 도구 디스패치 패턴을 비교하면, 클라우드 LLM과 로컬 LLM의 설계 차이가 보인다.
      ja: Claude APIでのTool Use実装パターンと本記事のエージェントツールディスパッチパターンを比較すると、クラウドLLMとローカルLLMの設計の違いが見えてくる。
      en: Comparing Claude's Tool Use implementation with this post's local tool dispatch patterns reveals key design differences between cloud and local LLM agent architectures.
      zh: 将Claude API的Tool Use实现模式与本文的本地工具分发模式进行比较，可以看出云端LLM和本地LLM的架构设计差异。
faq:
  - question: "Which Ollama version supports the format parameter?"
    answer: "The format parameter that accepts a JSON schema works on Ollama 0.3.0 and later. The examples here were tested on 0.30.7, and you can check your installed version with ollama --version."
  - question: "Is structured output really faster than plain text generation?"
    answer: "In my direct measurement the same prompt took 31.84 seconds without format and 4.99 seconds with it, about 6.4x faster. Constrained decoding stops the model from spending tokens on formatting decisions."
  - question: "How do I turn a Pydantic model into a JSON schema?"
    answer: "Call the model_json_schema() method on a Pydantic BaseModel to generate the schema dict automatically. Pass it to Ollama format, then parse and validate the response in one step with model_validate_json()."
  - question: "Why do small local models struggle with complex nested schemas?"
    answer: "Quantized 4B-class models like Gemma4:e4b sometimes return empty arrays at intermediate levels for schemas nested 3+ levels deep. Keeping the structure flat or switching to a larger model such as gemma4:12b-it-qat improves reliability."
---

`json.loads(response)` fails at a certain point. You told the model "return JSON only," but it added a ```json markdown code fence around everything. A quick regex strips it — until that regex hits an edge case, and that edge case blows up in production.

Since Ollama 0.3.0, passing a JSON schema to the `format` parameter eliminates this problem at the root. The model's inference itself is constrained by the schema, so no code fences, no explanatory text, no mid-thought artifacts. Just parseable JSON.

I ran these tests locally with Gemma4 and Ollama 0.30.7 to see how well it holds up in practice.

## Why LLM Response Parsing Is Tricky

The most common problem when running Ollama locally, without a cloud LLM API, is JSON parsing. Two reasons.

First, text generation models are trained toward "natural text." Even if you ask for JSON only, they'll often wrap it in ` ```json ... ``` ` blocks or prepend "Of course! Here is the JSON you requested:" style text. Here's what I reproduced directly:

```
Input: 'Give me 3 Python tips as JSON with keys: tips (array), difficulty (1-5)'
Model output (no format parameter):
```json
{
  "tips": [
    "Master the fundamentals first...",
    ...
  ]
}
```
JSON parse: FAILED
```

Python's `json.loads()` can't handle the markdown wrapper. The "JSON only" instruction is unreliable in production.

Second, speed. I measured the same query both ways. It took 32 seconds without structured output and 5 seconds with it. More on why below.

## How the Ollama format Parameter Works

Ollama's `/api/generate` endpoint has a `format` field. Pass a JSON schema object and Ollama applies **constrained decoding** during inference.

```python
import json
import urllib.request

def ollama_structured(prompt, schema, model="gemma4:e4b"):
    payload = {
        "model": model,
        "prompt": prompt,
        "format": schema,     # ← pass JSON schema object directly
        "stream": False,
        "options": {"temperature": 0}
    }
    data = json.dumps(payload).encode()
    req = urllib.request.Request(
        "http://localhost:11434/api/generate",
        data=data,
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req, timeout=60) as resp:
        result = json.loads(resp.read())
    return result["response"]
```

Constrained decoding sets the probability of any token that would violate the schema to zero at each generation step. So even if the model "wants" to generate a markdown fence, the schema makes it physically impossible. That's also where the speed gain comes from. The model doesn't waste tokens on formatting decisions.

Here are the measured numbers:

```bash
# Direct measurement (Ollama 0.30.7, Gemma4:e4b, MacBook)
# Same prompt, with and without format

Without structured output:
  Raw (first 200 chars): ```json\n{\n  "tips": ["Master the fundamentals first...
  Time: 31.84s
  JSON parse: FAILED (markdown wrapper)

With structured output:
  Structured: {"tips": ["Understand the concept of indentation...", ...], "difficulty": 2}
  Time: 4.99s
  JSON parse: SUCCESS
```

6.4x difference. Local LLMs are already slow, and adding unreliable parsing on top makes the whole pipeline feel worse still.

## Wiring Pydantic Models

Writing JSON schema objects by hand is tedious. With Pydantic models, `model_json_schema()` generates the schema automatically.

```python
from pydantic import BaseModel
from typing import List, Dict, Any, Literal

class CodeReview(BaseModel):
    severity: str  # "critical", "warning", "info"
    file: str
    line: int
    message: str
    suggestion: str

class ReviewResult(BaseModel):
    total_issues: int
    critical_count: int
    reviews: List[CodeReview]

# Pydantic → JSON schema, automatically
schema = ReviewResult.model_json_schema()

raw = ollama_structured(prompt, schema)

# Parses and validates in one step
result = ReviewResult.model_validate_json(raw)
```

`model_validate_json` parses the JSON string and runs Pydantic validation simultaneously. If `severity` gets an integer or `line` gets a string, it throws `ValidationError`. Catching that and retrying with a modified prompt is the common pattern in real agents.

Actual output from the code review test:

```bash
=== Code Review Output ===
Total issues: 3
Critical: 2
  [CRITICAL] process_user_data:2 - SQL Injection Vulnerability (Direct String Formatting)
  [CRITICAL] process_user_data:3 - Storing Passwords in Plain Text (Data Leakage)
  [HIGH] process_user_data:4 - Potential Unused/Incomplete Database Interaction
```

`total_issues: 3` and `critical_count: 2` come in as integers. `if result.critical_count > 0` branches safely.

## Practical Pattern: Agent Tool Dispatch

The strongest use case for structured output is an agent deciding which tool to call next. You pass the tool list and current situation, and get back a type-safe tool call selection.

```python
from typing import Literal, Dict, Any

class ToolCall(BaseModel):
    tool_name: Literal["web_search", "read_file", "write_file", "execute_code"]
    parameters: Dict[str, Any]
    reasoning: str

schema = ToolCall.model_json_schema()

user_task = "Find the current Bitcoin price and save it to btc_price.txt"
prompt = f"""You are an AI agent. Decide which tool to call next.
Available tools: web_search, read_file, write_file, execute_code
Task: {user_task}
Choose ONE tool call."""

raw = ollama_structured(prompt, schema)
tool_call = ToolCall.model_validate_json(raw)

print(f"Tool: {tool_call.tool_name}")
print(f"Params: {tool_call.parameters}")
```

```bash
=== Agent tool dispatch ===
Tool: web_search
Params: {'query': 'current Bitcoin price'}
Reasoning: The task requires finding real-time information...

Dispatch: OK (type-safe)
```

Because `tool_name` is typed as `Literal["web_search", "read_file", ...]`, `tool_call.tool_name` is always one of those four values. If the model invents a nonexistent tool name, Pydantic throws `ValidationError`. The `if tool_call.tool_name == "web_search"` branch is safe to write.

This is architecturally the same as function calling in cloud APIs. Comparing it with [Claude Agent SDK's Tool Use patterns](/en/blog/en/claude-agent-sdk-tool-use-complete-guide-2026) shows an interesting design difference. Cloud LLMs handle tool selection natively at the model level, while local Ollama needs an explicit JSON schema plus a Pydantic validation layer.

## Gemma4 and Schema Complexity: Limitations I Found

Honestly, it doesn't work perfectly in every case. Testing with Gemma4:e4b (4-bit quantized, 4B parameters), I found a few real constraints.

**Deeply nested schemas.** JSON schemas nested 3+ levels deep (`List[Dict[str, List[BaseModel]]]`) sometimes return empty arrays at intermediate levels. The 12B model (`gemma4:12b-it-qat`) reduces this, but doesn't eliminate it. This is a fundamental limitation of the model's context handling.

**Optional field handling.** Fields declared as `Optional[str]` sometimes get filled with empty string `""` instead of `null`. Pydantic validation passes, but semantics differ. You need `@validator` post-processing.

**Schema size.** A large Pydantic model's JSON schema can reach hundreds of tokens. That occupies context window space, reducing the room available for the actual prompt. Complex schemas need stronger models.

Once you've deployed Ollama as an API server (covered in the [Ollama FastAPI production guide](/en/blog/en/ollama-fastapi-production-deployment-guide-2026)), switching models at runtime based on schema complexity becomes a viable optimization.

## Pattern Reference: When to Use What

| Situation | Approach | Why |
|-----------|----------|-----|
| Simple data extraction (1-2 levels) | `format` + `json.loads()` | Fast, no overhead |
| Type validation needed | `format` + Pydantic | ValidationError catches issues early |
| Agent tool selection | `format` + Pydantic `Literal` | Blocks invalid tool names |
| Complex nested schema | Consider larger model | Small local model limitations |
| Simple text response | No `format` | Avoid unnecessary constrained decoding overhead |

I think of this as a switch that moves JSON parse reliability from "unreliable" to "near 100%." There was a time I was appending "JSON only please" to every prompt and hoping for the best. Measuring the actual difference made clear how fragile that approach was.

## Copy-Paste Starter Code

```python
import json
import urllib.request
from typing import List, Optional, Dict, Any
from pydantic import BaseModel

def ollama_structured(prompt: str, model_cls: type[BaseModel], 
                      model: str = "gemma4:e4b") -> BaseModel:
    """
    Helper that combines Ollama structured output + Pydantic validation.
    """
    schema = model_cls.model_json_schema()
    payload = {
        "model": model,
        "prompt": prompt,
        "format": schema,
        "stream": False,
        "options": {"temperature": 0}
    }
    data = json.dumps(payload).encode()
    req = urllib.request.Request(
        "http://localhost:11434/api/generate",
        data=data,
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req, timeout=120) as resp:
        result = json.loads(resp.read())
    return model_cls.model_validate_json(result["response"])


# Usage example
class SentimentAnalysis(BaseModel):
    sentiment: str       # "positive", "negative", "neutral"
    confidence: float    # 0.0 ~ 1.0
    key_phrases: List[str]

result = ollama_structured(
    "Analyze sentiment: 'This new MacBook is amazing but too expensive'",
    SentimentAnalysis
)
print(f"Sentiment: {result.sentiment} ({result.confidence:.0%})")
print(f"Key phrases: {result.key_phrases}")
```

## What to Try Next

This only covers the simplest cases. A real agent needs a bit more.

**Retry logic.** When Pydantic `ValidationError` fires, retry with a slightly modified prompt that ideally includes the error message. Models often self-correct when they can see why they were wrong.

**Streaming.** With `stream: true`, you can receive the JSON incrementally as it generates. Pair with a streaming JSON parser like `ijson` for memory-efficient handling of large responses.

**Model switching.** Route simple extractions to `gemma4:e4b` (fast) and complex nested schemas to `gemma4:12b-it-qat` (accurate) at runtime. [Structuring an entire agent with Pydantic AI](/en/blog/en/pydantic-ai-type-safe-agent-tutorial-2026) shows how to abstract this decision to the framework level.

If you're already running a Gemma4-based agent locally, adding the `format` parameter today is a one-line change with a measurable reliability improvement. Especially anywhere in the agent loop where an invalid response immediately causes a downstream error.

## References

- [Ollama Structured outputs (official blog)](https://ollama.com/blog/structured-outputs): the primary source covering the `format` parameter, JSON schemas, and Pydantic examples
- [Ollama API docs — Generate a completion / Structured outputs](https://github.com/ollama/ollama/blob/main/docs/api.md): the `/api/generate` endpoint and `format` field spec
- [Pydantic JSON Schema docs](https://docs.pydantic.dev/latest/concepts/json_schema/): how `model_json_schema()` behaves and how to customize it
- [Ollama official site](https://ollama.com): installation and model downloads
