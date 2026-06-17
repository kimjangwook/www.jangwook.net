---
title: 'Ollama结构化输出实战指南 — 用Pydantic安全解析本地LLM的JSON响应'
description: >-
  将Ollama 0.3+的JSON Schema强制模式与Pydantic结合，实现本地LLM响应的类型安全解析。
  实测结果：结构化输出比普通文本快6倍，JSON解析成功率接近100%。
pubDate: '2026-06-17'
heroImage: '../../../assets/blog/ollama-structured-outputs-pydantic-local-llm-guide-2026/hero.png'
tags:
  - Ollama
  - Pydantic
  - 本地LLM
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
      ja: Pydantic AIフレームワーク自体をエージェント構造に拡張したポスト。このガイドでPydanticデータ검証を学んだら、エージェント全体をPydanticでラップする次のステップ。
      en: Shows how to extend Pydantic beyond validation into a full agent framework — a logical next step from using Pydantic to parse LLM outputs.
      zh: 展示了如何将Pydantic扩展到完整的代理框架——在用Pydantic解析LLM输出之后的自然延伸。
  - slug: gemma-4-local-agent-edge-ai
    score: 0.79
    reason:
      ko: Gemma4 모델을 에지 AI 에이전트에 쓰는 실험을 정리한 글이다. 구조화 출력 적용 전후로 에이전트 안정성이 어떻게 달라지는지 비교 자료로 쓸 수 있다.
      ja: Gemma4モデルをエッジAIエージェントに使う実験をまとめた記事。構造化出力の適用前後でエージェントの安定性がどう変わるかの比較資料として使える。
      en: Documents experiments using Gemma4 for edge AI agents — useful context for understanding how structured outputs stabilize agent behavior.
      zh: 记录了在边缘AI代理中使用Gemma4的实验。可作为了解结构化输出如何提升代理稳定性的对比参考。
  - slug: claude-agent-sdk-tool-use-complete-guide-2026
    score: 0.74
    reason:
      ko: Claude API에서 Tool Use를 구현하는 패턴과 이 글의 에이전트 도구 디스패치 패턴을 비교하면, 클라우드 LLM과 로컬 LLM의 설계 차이가 보인다.
      ja: Claude APIでのTool Use実装パターンと本記事のエージェントツールディスパッチパターンを比較すると、クラウドLLMとローカルLLMの設計の違いが見えてくる。
      en: Comparing Claude's Tool Use implementation with this post's local tool dispatch patterns reveals key design differences between cloud and local LLM agent architectures.
      zh: 将Claude API的Tool Use实现模式与本文的本地工具分发模式进行比较，可以看出云端LLM和本地LLM的架构设计差异。
---

`json.loads(response)` 在某个时刻就会报错。明明在提示词里写了"只返回JSON"，但模型却加上了 ```json 的Markdown代码围栏。用正则表达式能去掉——直到那个正则遇上边界情况，然后在生产环境炸开。

从Ollama 0.3.0开始，向 `format` 参数传递JSON Schema就能从根本上消除这个问题。模型推理本身被Schema约束，所以没有代码围栏、没有解释性文字、没有推理过程的痕迹。直接返回可解析的JSON。

今天我在本地用Gemma4和Ollama 0.30.7直接验证了这个方案的实际效果。

## 为什么LLM响应解析很棘手

在不使用云端LLM API、仅用Ollama本地运行时，最常遇到的问题就是JSON解析。原因有两个。

第一，文本生成模型的基本倾向。模型被训练来生成"自然文本"。即使要求只返回JSON，它也经常用 ` ```json ... ``` ` 代码块包裹，或者添加"当然！以下是您要求的JSON："这样的前置说明。下面是我直接复现的结果：

```
输入：'用tips（数组）和difficulty（1-5数字）两个key的JSON格式，给我3个Python初学者技巧'
模型输出（无format参数）：
```json
{
  "tips": [
    "Master the fundamentals first...",
    ...
  ]
}
```
JSON解析：失败
```

Python的 `json.loads()` 无法处理Markdown包装器。"只返回JSON"的指令在生产环境中并不可靠。

第二，速度问题。我直接测量了相同查询在两种方式下的耗时：无结构化输出时32秒，有结构化输出时5秒。原因在后面解释。

## Ollama format参数的工作原理

Ollama的 `/api/generate` 端点有一个 `format` 字段。传入JSON Schema对象后，Ollama会在模型推理过程中应用**约束解码（constrained decoding）**。

```python
import json
import urllib.request

def ollama_structured(prompt, schema, model="gemma4:e4b"):
    payload = {
        "model": model,
        "prompt": prompt,
        "format": schema,     # ← 直接传入JSON Schema对象
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

约束解码在每个token生成时刻，将所有不符合Schema的token的概率设为零。也就是说，即使模型"想要"生成Markdown围栏，Schema也使其物理上无法生成。这也是速度提升的原因——模型不需要在格式决策上浪费token。

实测数据如下：

```bash
# 直接测量结果 (Ollama 0.30.7, Gemma4:e4b, MacBook)
# 相同提示词，有无format参数的对比

无结构化输出：
  原始响应（前200字符）: ```json\n{\n  "tips": ["Master the fundamentals first...
  耗时: 31.84s
  JSON解析: 失败（含Markdown包装器）

有结构化输出：
  结构化响应: {"tips": ["Understand the concept of indentation...", ...], "difficulty": 2}
  耗时: 4.99s
  JSON解析: 成功
```

相差6.4倍。本地LLM本来就慢，再加上不可靠的解析，整个流程体验会更差。

## 与Pydantic模型的集成

手动编写JSON Schema对象很繁琐。使用Pydantic模型，`model_json_schema()` 方法可以自动生成Schema。

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

# Pydantic → JSON Schema 自动转换
schema = ReviewResult.model_json_schema()

raw = ollama_structured(prompt, schema)

# 解析同时进行Pydantic验证（类型错误时抛出ValidationError）
result = ReviewResult.model_validate_json(raw)
```

`model_validate_json` 在解析JSON字符串的同时执行Pydantic验证。如果 `severity` 收到整数或 `line` 收到字符串，就会抛出 `ValidationError`。捕获该异常并添加重试逻辑，是实际Agent中常用的模式。

代码审查测试的实际输出：

```bash
=== Code Review Output ===
Total issues: 3
Critical: 2
  [CRITICAL] process_user_data:2 - SQL Injection Vulnerability (Direct String Formatting)
  [CRITICAL] process_user_data:3 - Storing Passwords in Plain Text (Data Leakage)
  [HIGH] process_user_data:4 - Potential Unused/Incomplete Database Interaction
```

`total_issues: 3`、`critical_count: 2` 作为整数直接返回。`if result.critical_count > 0` 的分支逻辑可以安全执行。

## 实战模式：Agent工具分发

结构化输出最强大的应用场景是Agent决定下一步调用哪个工具。将工具列表和当前情况传给LLM，以类型安全的方式获取工具调用选择。

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

由于 `tool_name` 声明为 `Literal["web_search", "read_file", ...]`，`tool_call.tool_name` 始终是这四个值之一。如果模型捏造了不存在的工具名，Pydantic会抛出 `ValidationError`。这就是 `if tool_call.tool_name == "web_search"` 分支可以安全编写的原因。

这个模式在架构上与云端API的函数调用相同。与[Claude Agent SDK的Tool Use模式](/zh/blog/zh/claude-agent-sdk-tool-use-complete-guide-2026)相比，可以发现一个有趣的设计差异：云端LLM在模型层面原生处理工具选择，而本地Ollama需要显式的JSON Schema加Pydantic验证层。

## Gemma4与Schema复杂度：我发现的局限性

坦率地说，并非所有情况都完美。用Gemma4:e4b（4位量化，4B参数）测试时，发现了几个实际限制。

**深层嵌套Schema的局限。** 超过3层嵌套的JSON Schema（如 `List[Dict[str, List[BaseModel]]]`）有时会在中间层级返回空数组。12B参数模型（`gemma4:12b-it-qat`）减少了这种现象，但没有完全消除。这是模型上下文处理能力的根本限制。

**可选字段处理。** 声明为 `Optional[str]` 的字段，模型有时会用空字符串 `""` 而非 `null` 填充。Pydantic验证能通过，但语义上有差异，需要用 `@validator` 做后处理。

**Schema大小。** 大型Pydantic模型的JSON Schema可以达到数百个token，本身就占用上下文空间，减少了实际提示词可用的空间。复杂的Schema需要更强大的模型。

按照[Ollama FastAPI生产部署指南](/zh/blog/zh/ollama-fastapi-production-deployment-guide-2026)将Ollama部署为API服务器后，可以考虑根据Schema复杂度在运行时切换模型。

## 模式参考：何时用什么

| 场景 | 推荐方式 | 原因 |
|------|----------|------|
| 简单数据提取（1〜2层） | `format` + `json.loads()` | 无额外开销，速度快 |
| 需要类型验证 | `format` + Pydantic | ValidationError早期发现问题 |
| Agent工具选择 | `format` + Pydantic `Literal` | 阻止无效工具名 |
| 复杂嵌套Schema | 考虑更大的模型 | 小型本地模型的限制 |
| 简单文本响应 | 不用 `format` | 避免不必要的约束解码开销 |

我把这个模式看作"将JSON解析可靠性从不稳定提升到接近100%的开关"。曾经有一段时间我在每个提示词末尾加上"JSON only please"然后祈祷有效。直接测量差异后，那种方式有多脆弱就一目了然了。

## 可直接复用的完整代码

```python
import json
import urllib.request
from typing import List, Optional, Dict, Any
from pydantic import BaseModel

def ollama_structured(prompt: str, model_cls: type[BaseModel], 
                      model: str = "gemma4:e4b") -> BaseModel:
    """
    将Ollama结构化输出与Pydantic验证合二为一的辅助函数。
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


# 使用示例
class SentimentAnalysis(BaseModel):
    sentiment: str       # "positive", "negative", "neutral"
    confidence: float    # 0.0 〜 1.0
    key_phrases: List[str]

result = ollama_structured(
    "Analyze sentiment: 'This new MacBook is amazing but too expensive'",
    SentimentAnalysis
)
print(f"Sentiment: {result.sentiment} ({result.confidence:.0%})")
print(f"Key phrases: {result.key_phrases}")
```

## 接下来可以尝试的方向

目前只介绍了最基础的形式。实际Agent还需要更多内容。

**重试逻辑。** 当Pydantic `ValidationError` 触发时，稍微修改提示词后重试。最好把错误信息包含在提示词中——模型看到自己出错的原因后，往往能自行修正。

**流式传输。** 设置 `stream: true` 可以逐步接收生成中的JSON。配合 `ijson` 等流式JSON解析器，可以内存高效地处理大响应。

**模型切换策略。** 简单提取用 `gemma4:e4b`（速度快），复杂嵌套Schema用 `gemma4:12b-it-qat`（更准确），在运行时按需切换，是成本与质量平衡的优选方案。[用Pydantic AI构建完整Agent](/zh/blog/zh/pydantic-ai-type-safe-agent-tutorial-2026)展示了如何在框架层面抽象这个判断。

如果你已经在本地运行基于Gemma4的Agent，今天只需添加一个 `format` 参数，就能显著提升解析稳定性。尤其是在Agent循环中，错误响应会直接导致下游错误的路径上，效果更为明显。
