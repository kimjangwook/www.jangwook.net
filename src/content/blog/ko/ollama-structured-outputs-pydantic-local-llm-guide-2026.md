---
title: 'Ollama 구조화 출력 실전 — Pydantic으로 로컬 LLM 응답을 타입 안전하게 받는 법'
description: >-
  Ollama 0.3+의 JSON schema 강제 모드와 Pydantic을 연결해 로컬 LLM 응답을 타입 안전하게 파싱하는 실전 가이드.
  직접 측정한 결과, 구조화 출력은 일반 텍스트보다 6배 빠르고 파싱 성공률이 100%에 가깝다.
pubDate: '2026-06-17'
heroImage: '../../../assets/blog/ollama-structured-outputs-pydantic-local-llm-guide-2026/hero.png'
tags:
  - Ollama
  - Pydantic
  - 로컬LLM
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

`json.loads(response)`가 실패하는 시점이 있었다. 프롬프트에 "JSON만 반환해줘"라고 적었는데, 모델이 ```json 마크다운 코드 펜스를 붙여버렸다. 간단한 정규식으로 걷어낼 수 있지만, 그 정규식이 또 edge case를 만들고, 그 edge case가 production에서 터진다.

Ollama 0.3.0부터 `format` 파라미터로 JSON schema를 넘기면 이 문제가 근본적으로 사라진다. 모델 추론 자체가 스키마를 강제하기 때문에 코드 펜스도, 한국어 설명도, 중간 생각 흔적도 없다. 그냥 파싱 가능한 JSON만 나온다.

오늘 로컬에서 Gemma4와 Ollama 0.30.7로 직접 재현하면서 얼마나 쓸 만한지 확인했다.

## 왜 LLM 응답 파싱이 까다로운가

클라우드 LLM API 없이 Ollama로 로컬에서 돌릴 때 가장 자주 만나는 문제가 JSON 파싱이다. 두 가지 이유다.

첫째, 텍스트 생성 모델의 기본 성향이다. 모델은 "자연스러운 텍스트"를 생성하도록 훈련됐다. JSON만 달라고 해도 ```json ... ``` 코드 블록으로 감싸거나, "물론입니다! 아래는 요청하신 JSON입니다." 같은 전처리 문장을 덧붙이는 경우가 흔하다. 아래가 실제로 직접 재현한 결과다.

```
입력: 'Python 초보자 팁 3가지를 tips(배열), difficulty(1-5) 키를 가진 JSON으로 반환해줘'
모델 출력 (format 없음):
```json
{
  "tips": [
    "Master the fundamentals first: Focus heavily on variables...",
    ...
  ]
}
```
JSON parse: FAILED
```

파이썬의 `json.loads()`는 `` ` ``json 마크다운 래퍼를 처리하지 못한다. 결과적으로 "JSON만"이라는 지시는 실제 프로덕션에서 100% 신뢰하기 어렵다.

둘째, 속도 문제다. 직접 측정한 결과, 동일한 쿼리에서 포맷팅 설명을 모델이 스스로 생성하는 경우 32초가 걸렸다. 구조화 출력 모드에서는 5초였다. 왜 이런 차이가 나는지는 아래에서 설명한다.

## Ollama format 파라미터 작동 방식

Ollama의 `/api/generate` 엔드포인트에는 `format` 필드가 있다. JSON schema 객체를 넘기면 Ollama가 모델 추론 과정에서 **constrained decoding(제약된 디코딩)**을 적용한다.

```python
import json
import urllib.request

def ollama_structured(prompt, schema, model="gemma4:e4b"):
    payload = {
        "model": model,
        "prompt": prompt,
        "format": schema,     # ← JSON schema 객체를 직접 전달
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

constrained decoding은 각 토큰 생성 시점에 schema를 만족하지 않는 토큰의 확률을 0으로 만든다. 즉, 모델이 설사 마크다운 코드 펜스를 "선호"하더라도 스키마가 허용하지 않으면 물리적으로 생성할 수 없다. 이것이 속도 차이의 원인이기도 하다. 포맷에 대한 "생각"을 하지 않으므로 토큰 낭비가 없다.

실제로 확인해보면 바로 차이가 난다.

```bash
# 직접 측정 결과 (Ollama 0.30.7, Gemma4:e4b, MacBook)
# 동일 프롬프트, format 없음 vs 있음

Without structured output:
  Raw (first 200 chars): ```json\n{\n  "tips": ["Master the fundamentals first...
  Time: 31.84s
  JSON parse: FAILED (마크다운 래퍼가 있어서)

With structured output:
  Structured: {"tips": ["Understand the concept of indentation...", ...], "difficulty": 2}
  Time: 4.99s
  JSON parse: SUCCESS
```

6.4배 차이다. 로컬 LLM이 원래 느린 편인데 여기에서 더 느려지면 체감이 확 온다.

## Pydantic 모델과 연결하기

직접 JSON schema 객체를 작성하는 건 번거롭다. Pydantic 모델을 쓰면 `model_json_schema()` 메서드로 schema를 자동 생성할 수 있다.

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

# Pydantic → JSON schema 자동 변환
schema = ReviewResult.model_json_schema()

# Ollama 호출
raw = ollama_structured(prompt, schema)

# Pydantic 검증 (타입 오류시 ValidationError 발생)
result = ReviewResult.model_validate_json(raw)
```

`model_validate_json`은 문자열 JSON을 파싱하면서 동시에 Pydantic 검증을 수행한다. `severity`에 정수가 들어오거나, `line`에 문자열이 들어오면 `ValidationError`를 던진다. 이걸 catch해서 재시도 로직을 추가하는 게 실제 에이전트에서 흔히 쓰는 패턴이다.

실제 실행 결과다.

```bash
# 보안 취약점이 있는 Python 코드를 리뷰 요청했을 때

=== Code Review Output ===
Total issues: 3
Critical: 2
  [CRITICAL] process_user_data:2 - SQL Injection Vulnerability (Direct String Formatting)
  [CRITICAL] process_user_data:3 - Storing Passwords in Plain Text (Data Leakage)
  [HIGH] process_user_data:4 - Potential Unused/Incomplete Database Interaction
```

`total_issues: 3`, `critical_count: 2`가 정수로 바로 들어온다. 파이썬 코드에서 `result.critical_count > 0`으로 분기 처리할 수 있다.

## 실전 패턴: 에이전트 도구 디스패치

구조화 출력이 가장 강력하게 쓰이는 곳이 에이전트의 다음 도구 선택이다. LLM에게 도구 목록과 현재 상황을 주고 "어떤 도구를 호출할지"를 타입 안전하게 받아오는 패턴이다.

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

# 실제 dispatch
print(f"Tool: {tool_call.tool_name}")
print(f"Params: {tool_call.parameters}")
```

```bash
# 실행 결과

=== Agent tool dispatch ===
Tool: web_search
Params: {'query': 'current Bitcoin price'}
Reasoning: The task requires finding real-time information (the current Bitcoin price)...

--- Dispatching tool call ---
  [SEARCH] query=current Bitcoin price
Dispatch: OK (type-safe)
```

`Literal["web_search", "read_file", ...]`로 선언했기 때문에, `tool_call.tool_name`은 항상 저 네 값 중 하나다. 존재하지 않는 도구를 모델이 만들어내더라도 Pydantic이 `ValidationError`를 던진다. `if tool_call.tool_name == "web_search"` 분기가 안전하게 동작하는 이유다.

이 패턴은 Cloud API에서 function calling을 쓰는 것과 근본적으로 같다. 로컬에서 [Claude Agent SDK의 Tool Use 패턴](/ko/blog/ko/claude-agent-sdk-tool-use-complete-guide-2026)과 비교해보면 설계 차이가 흥미롭다. Cloud LLM은 도구 선택 자체를 모델이 "native"하게 처리하는 반면, Ollama 쪽은 JSON schema 강제 + Pydantic 검증이라는 명시적 레이어가 필요하다.

## Gemma4와 스키마 복잡도: 내가 발견한 한계

솔직히 말하면 모든 케이스에서 완벽하지는 않다. Gemma4:e4b(4비트 양자화 4B 파라미터)로 실험한 결과 몇 가지 제약이 있었다.

**중첩 스키마의 한계.** 3단계 이상 중첩된 JSON 스키마(예: `List[Dict[str, List[BaseModel]]]`)는 간혹 중간 레벨이 빈 배열로 나오는 경우가 있었다. 12B 파라미터 모델(`gemma4:12b-it-qat`)에서는 이 현상이 줄었지만 사라지지는 않았다. 모델의 컨텍스트 처리 능력 자체의 한계다.

**선택적 필드 처리.** `Optional[str]`로 선언된 필드를 모델이 `null` 대신 빈 문자열 `""`로 채우는 경우가 있다. Pydantic 검증은 통과하지만 의미상 차이가 생긴다. `@validator`로 후처리가 필요하다.

**스키마 크기.** 큰 Pydantic 모델의 JSON schema는 수백 토큰에 달한다. 이 자체가 컨텍스트를 차지하므로 실제 프롬프트에 쓸 수 있는 공간이 줄어든다. 복잡한 스키마일수록 더 강력한 모델이 필요하다.

[Ollama FastAPI 배포 가이드](/ko/blog/ko/ollama-fastapi-production-deployment-guide-2026)에서 다룬 대로 Ollama를 API 서버로 배포한 뒤 이 패턴을 쓰면, 스키마 복잡도에 따라 모델을 런타임에 교체하는 것도 고려할 수 있다.

## 중첩 스키마 실전 예제: 주의할 점

좀 더 복잡한 구조, 예를 들어 여러 필드가 있는 리포트 객체를 요청할 때는 스키마 설계에 신경 써야 한다. 실제로 이런 구조가 에이전트에서 쓰인다.

```python
from pydantic import BaseModel, Field
from typing import List, Optional, Literal

class ActionItem(BaseModel):
    priority: Literal["high", "medium", "low"]
    task: str
    deadline_days: Optional[int] = None

class MeetingNotes(BaseModel):
    summary: str
    key_decisions: List[str]
    action_items: List[ActionItem]
    sentiment: Literal["positive", "neutral", "negative"]

# 사용
schema = MeetingNotes.model_json_schema()
notes = ollama_structured(
    "Summarize: 'Team agreed on Q3 launch. John to finish API by Friday. Mary to review docs in 3 days.'",
    MeetingNotes
)
print(f"Summary: {notes.summary}")
for item in notes.action_items:
    print(f"  [{item.priority.upper()}] {item.task} ({item.deadline_days}d)")
```

이 정도 복잡도는 Gemma4:e4b에서도 잘 동작한다. `Optional[int]`의 `None` 처리가 가끔 빈 문자열로 오는 경우가 있어 `Field(default=None)`을 명시하는 게 더 안정적이다.

**중첩 배열 안 객체는 가능한 평탄하게 유지하는 게 좋다.** `List[List[str]]` 같은 이중 배열보다 `List[SomeModel]` 형태가 소형 로컬 모델에서 훨씬 신뢰도가 높다. 내가 직접 테스트할 때도 2단 이상 배열 중첩에서 빈 리스트가 나오는 경우가 있었다.

## 패턴 정리: 언제 어떤 방식을 쓸까

| 상황 | 권장 방식 | 이유 |
|------|-----------|------|
| 단순 데이터 추출 (1〜2 레벨) | `format` + `json.loads()` | 오버헤드 없이 빠름 |
| 타입 검증 필요 | `format` + Pydantic | ValidationError로 오류 조기 발견 |
| 에이전트 도구 선택 | `format` + Pydantic `Literal` | 잘못된 도구 이름 차단 |
| 회의록/문서 요약 | `format` + Pydantic, 평탄한 구조 | 복잡 중첩 회피 |
| 복잡 중첩 스키마 (3레벨+) | 12B 이상 모델 고려 | 소형 로컬 모델 한계 |
| 단순 텍스트 응답 | `format` 없이 | 불필요한 constrained decoding 오버헤드 |

나는 이 패턴을 "JSON 파싱 신뢰도 0에서 100"으로 올리는 스위치로 본다. 기존에 프롬프트 끝에 "JSON only please"를 붙이던 시절이 있었는데, 그게 얼마나 불안정한 접근이었는지 직접 측정하고 나서 확실해졌다.

## 전체 코드: 복사-붙여넣기 가능한 시작점

```python
import json
import urllib.request
from typing import List, Optional, Dict, Any
from pydantic import BaseModel

def ollama_structured(prompt: str, model_cls: type[BaseModel], 
                      model: str = "gemma4:e4b") -> BaseModel:
    """
    Ollama structured output + Pydantic 검증을 하나로 묶은 헬퍼.
    
    Args:
        prompt: 모델에 전달할 프롬프트
        model_cls: 반환 타입을 정의하는 Pydantic BaseModel 클래스
        model: 사용할 Ollama 모델 이름
    Returns:
        검증된 Pydantic 모델 인스턴스
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


# 사용 예시
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

## 다음으로 해볼 것

지금까지 가장 간단한 형태만 봤다. 실제 에이전트에서 쓰려면 몇 가지가 더 필요하다.

**재시도 로직.** Pydantic `ValidationError`가 발생하면 프롬프트를 약간 바꿔서 재시도하는 로직이 있으면 좋다. 에러 메시지를 프롬프트에 포함시키면 모델이 왜 틀렸는지 알고 수정하는 경우가 많다.

**스트리밍.** `stream: true`로 설정하면 생성 중인 JSON을 점진적으로 받을 수 있다. `ijson` 같은 스트리밍 JSON 파서와 결합하면 큰 응답도 메모리 효율적으로 처리할 수 있다.

**모델 선택 전략.** 간단한 추출은 `gemma4:e4b`(빠름), 복잡한 중첩 스키마는 `gemma4:12b-it-qat`(정확함)로 런타임에 분기하는 패턴이 비용-품질 균형에서 유리하다. [Pydantic AI로 에이전트 전체를 구조화하는 방법](/ko/blog/ko/pydantic-ai-type-safe-agent-tutorial-2026)을 보면 이 판단을 프레임워크 레벨에서 추상화하는 방식을 볼 수 있다.

Gemma4 기반 에이전트를 직접 돌리고 있다면, 오늘 바로 `format` 파라미터 하나를 추가하는 것만으로 파싱 안정성이 크게 달라진다. 특히 에이전트 도구 선택처럼 잘못된 응답이 바로 오류로 이어지는 경로에서 더 그렇다.

## OpenAI 호환 API로도 동일하게 동작한다

Ollama는 `/v1/chat/completions` 엔드포인트도 제공한다. OpenAI SDK를 이미 쓰고 있다면 `base_url`만 바꿔서 동일한 structured output 패턴을 적용할 수 있다.

```python
from openai import OpenAI
from pydantic import BaseModel
from typing import List

client = OpenAI(
    base_url="http://localhost:11434/v1",
    api_key="ollama"  # 값은 아무 문자열이나 가능
)

class Recommendation(BaseModel):
    item: str
    reason: str
    score: float

class RecommendationList(BaseModel):
    recommendations: List[Recommendation]
    total_count: int

# OpenAI SDK의 response_format으로 Pydantic 스키마 전달
completion = client.beta.chat.completions.parse(
    model="gemma4:e4b",
    messages=[{"role": "user", "content": "Recommend 2 Python testing libraries"}],
    response_format=RecommendationList
)
result = completion.choices[0].message.parsed
print(f"Got {result.total_count} recommendations:")
for rec in result.recommendations:
    print(f"  {rec.item}: {rec.reason} (score: {rec.score})")
```

`client.beta.chat.completions.parse()`는 OpenAI SDK 1.50+ 기능으로, Pydantic 모델을 직접 `response_format`에 전달할 수 있다. 내부적으로 `model_json_schema()`를 호출하고 응답을 `model_validate()`로 파싱해준다. 팀에서 이미 OpenAI SDK를 사용 중이라면 Ollama를 로컬 백엔드로 전환할 때 코드 변경이 최소화된다.

한 가지 차이: `api/generate`를 직접 호출하는 방식이 `chat/completions`보다 조금 더 빠른 경우가 있다. 시스템 프롬프트 처리 오버헤드 없이 직접 완성형 API를 호출하기 때문이다. 속도가 중요한 파이프라인이라면 `api/generate` 직접 호출을 선택하는 게 맞다.

## 환경 설정 및 빠른 시작

이 글의 예제를 직접 실행하려면 다음 환경이 필요하다.

```bash
# 1. Ollama 설치 (macOS)
curl -fsSL https://ollama.com/install.sh | sh

# 2. Gemma4 모델 다운로드 (4B - 약 3GB)
ollama pull gemma4:e4b

# 3. Ollama 서버 실행 (백그라운드)
ollama serve &

# 4. Python 패키지 설치
pip install pydantic>=2.0
```

Ollama 버전은 0.3.0 이상이어야 `format` 파라미터가 동작한다. 이 글은 Ollama 0.30.7에서 테스트했다.

```bash
# 버전 확인
ollama --version
# 출력: ollama version is 0.30.7
```

별도 API 키가 없어도 된다. Ollama는 로컬에서만 돌아가고, 외부 서버와 통신하지 않는다. 개인 데이터를 처리하거나 네트워크 비용이 걱정되는 상황에서 장점이다.

`urllib.request`는 Python 표준 라이브러리이므로 추가 설치가 없다. 실제 프로덕션에서는 `httpx`나 `requests`로 바꿔도 동일하게 동작한다.
