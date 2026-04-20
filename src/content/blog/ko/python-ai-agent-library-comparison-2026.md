---
title: 'Python AI 에이전트 라이브러리 비교 2026 — Pydantic AI vs Instructor vs Smolagents 실전 선택 가이드'
description: 'Pydantic AI, Instructor, Smolagents 세 라이브러리를 실제 코드와 함께 비교합니다. 구조화 출력, 에이전트 아키텍처, 프로덕션 준비도를 기준으로 어떤 프로젝트에 무엇을 써야 하는지 결정 기준을 제시합니다.'
pubDate: '2026-04-20'
heroImage: '../../../assets/blog/python-ai-agent-library-comparison-2026-hero.jpg'
tags:
  - python
  - pydantic-ai
  - instructor
  - smolagents
relatedPosts:
  - slug: ai-agent-framework-comparison-2026-langgraph-crewai-dapr-production
    score: 0.92
    reason:
      ko: 이 글에서 다룬 라이브러리 레이어(Pydantic AI, Instructor)를 오케스트레이션 프레임워크 레이어(LangGraph, CrewAI)와 어떻게 조합할지 궁금하다면, 상위 프레임워크 비교 가이드가 다음 단계다.
      ja: このポストで扱ったライブラリ層をオーケストレーションフレームワーク（LangGraph、CrewAI）と組み合わせる方法を知りたければ、上位フレームワーク比較ガイドが次のステップだ。
      en: If you're wondering how to combine the library layer covered here (Pydantic AI, Instructor) with orchestration frameworks like LangGraph or CrewAI, the upper-layer comparison guide is the logical next read.
      zh: 如果想了解如何将本文介绍的库层（Pydantic AI、Instructor）与LangGraph、CrewAI等编排框架组合使用，上层框架比较指南就是下一步。
  - slug: llm-api-pricing-comparison-2026-gpt5-claude-gemini-deepseek
    score: 0.85
    reason:
      ko: Instructor의 재시도 비용과 Smolagents의 코드 생성 루프 비용을 사전에 추정하려면 모델별 토큰 가격 데이터가 필요하다. 이 가이드가 그 계산의 출발점이다.
      ja: InstructorのリトライコストやSmolagentsのコード生成ループコストを事前に見積もるには、モデル別トークン価格データが必要だ。このガイドがその計算の出発点となる。
      en: Estimating Instructor's retry costs and Smolagents' code-generation loop overhead requires model pricing data. This guide is the starting point for that calculation.
      zh: 预估Instructor的重试成本和Smolagents的代码生成循环成本，需要各模型的token价格数据。这份指南是进行这类计算的起点。
  - slug: production-grade-ai-agent-design-principles
    score: 0.83
    reason:
      ko: 세 라이브러리 중 하나를 골랐다면, 다음은 그 위에 에이전트 시스템 전체를 어떻게 설계할지다. 프로덕션 수준의 AI 에이전트 설계 원칙이 그 답을 제시한다.
      ja: 3つのライブラリのどれかを選んだら、次はその上にエージェントシステム全体をどう設計するかだ。プロダクション品質のAIエージェント設計原則がその答えを示す。
      en: Once you've picked a library, the next question is how to design the full agent system on top of it. Production-grade AI agent design principles offers that answer.
      zh: 选定库之后，下一个问题是如何在其基础上设计完整的智能体系统。生产级AI智能体设计原则为此提供了答案。
  - slug: dena-llm-study-part2-structured-output
    score: 0.78
    reason:
      ko: Instructor와 Pydantic AI가 해결하는 "구조화 출력" 문제의 이론적 배경을 더 깊이 이해하고 싶다면, DeNA 사내 LLM 스터디 2편이 좋은 기초다.
      ja: InstructorとPydantic AIが解決する「構造化出力」問題の理論的背景を深く理解したければ、DeNA社内LLMスタディ第2弾が良い基礎となる。
      en: To understand the theoretical foundation behind the "structured output" problem that Instructor and Pydantic AI solve, the DeNA in-house LLM study part 2 is a solid foundation.
      zh: 想深入理解Instructor和Pydantic AI所解决的"结构化输出"问题的理论背景，DeNA内部LLM学习第2篇是很好的基础。
---

지난 달에 새 프로젝트를 시작하면서 한 가지 결정을 해야 했다. Python으로 LLM 기반 에이전트를 만드는데, 어떤 라이브러리를 쓸 것인가? LangGraph, CrewAI 같은 무거운 오케스트레이션 프레임워크는 이미 알고 있었다. 그런데 그보다 더 아래 레이어 — LLM 호출을 직접 제어하고 싶은데 날 것의 OpenAI SDK는 너무 번거로울 때 — 를 채우는 라이브러리들이 2025~2026년 사이에 급성장했다.

Pydantic AI, Instructor, Smolagents. 세 라이브러리를 실제로 써본 결과를 바탕으로 정리한다.

## 먼저 레이어를 구분하자 — 이 셋은 경쟁하지 않는다

가장 먼저 짚고 싶은 건 이 세 라이브러리가 서로 다른 레이어를 다룬다는 점이다.

- **Instructor**: LLM 클라이언트를 "패치"해서 Pydantic 객체로 구조화된 출력을 보장하는 레이어. 에이전트 루프가 없다.
- **Pydantic AI**: 도구 호출, 의존성 주입, 멀티 에이전트를 포함한 타입 안전 에이전트 프레임워크. Pydantic 팀이 만들었다.
- **Smolagents**: HuggingFace의 코드 생성 에이전트 프레임워크. JSON 도구 호출 대신 파이썬 코드를 생성해 실행한다.

따라서 "무엇이 더 좋은가"보다 "내 상황에 무엇이 맞는가"가 올바른 질문이다. 그 답을 찾는 게 이 글의 목적이다.

## Instructor — LLM 클라이언트를 바꾸지 말고, 패치하라

### 철학

Instructor는 기존 LLM 클라이언트(OpenAI, Anthropic, Gemini 등)를 새 SDK로 대체하지 않는다. 대신 `instructor.from_openai(client)` 한 줄로 "패치"해서 `response_model` 파라미터를 추가한다.

```python
import instructor
from openai import OpenAI
from pydantic import BaseModel

client = instructor.from_openai(OpenAI())

class UserProfile(BaseModel):
    name: str
    age: int
    skills: list[str]

profile = client.chat.completions.create(
    model="gpt-4o-mini",
    response_model=UserProfile,
    messages=[{"role": "user", "content": "김장욱, 30대, Python과 Go 개발자야"}]
)
# profile은 UserProfile 인스턴스. Pydantic 검증 완료.
print(profile.name)  # "김장욱"
```

검증이 실패하면 자동으로 에러 메시지와 함께 모델에게 재요청한다. `max_retries` 파라미터로 최대 재시도 횟수를 조정할 수 있다.

### 장점

**1. 러닝커브가 거의 없다.** 이미 OpenAI SDK를 쓰고 있다면 `instructor.from_openai()` 한 줄만 추가하면 된다. 새로운 패러다임을 배울 필요가 없다.

**2. 멀티 프로바이더 지원이 탄탄하다.** OpenAI, Anthropic, Google Gemini, Mistral, Cohere, Ollama, DeepSeek 포함 15개 이상의 프로바이더를 지원한다. 프로바이더를 바꿔도 코드 구조가 거의 그대로다.

**3. 구조화 추출에서 신뢰도가 높다.** 월간 다운로드 300만 회, GitHub 스타 11k+. 프로덕션에서 검증된 라이브러리다. 복잡한 중첩 스키마, 리스트 추출, 유니온 타입 모두 처리한다.

**4. 스트리밍 지원.** `Iterable[Model]`로 타입을 지정하면 구조화된 객체를 스트리밍으로 받을 수 있다.

### 솔직한 한계

Instructor는 에이전트 프레임워크가 아니다. 반복 루프, 도구 호출, 메모리 관리 — 이런 게 없다. 단일 LLM 호출에서 구조화된 데이터를 뽑아내는 것에 집중한다. 에이전트 루프가 필요하다면 다른 선택지를 봐야 한다.

또한 검증 실패 시 재시도 비용은 온전히 호출자 부담이다. 모델이 반복적으로 틀린 형식을 반환하면 비용이 예상보다 훨씬 늘어날 수 있다. 실제로 나는 복잡한 중첩 스키마에서 재시도가 3〜5회 발생하는 상황을 겪었다. `max_retries`를 1〜2로 제한하고, 그래도 실패하면 fallback 로직을 넣는 것이 현실적이다.

## Pydantic AI — 타입 안전한 에이전트를 원한다면

### 철학

Pydantic AI는 Pydantic 팀이 직접 만든 에이전트 프레임워크다. Python 타입 힌트를 에이전트 설계의 중심에 놓는다. 도구를 타입 안전하게 정의하고, 의존성 주입(Dependency Injection)으로 외부 서비스를 에이전트에 연결한다.

```python
from pydantic_ai import Agent
from pydantic_ai.models.openai import OpenAIModel
from pydantic import BaseModel
import httpx

# 에이전트가 반환할 타입 정의
class ResearchResult(BaseModel):
    summary: str
    sources: list[str]
    confidence: float

model = OpenAIModel("gpt-4o")
agent = Agent(model, output_type=ResearchResult)

# 도구를 타입 안전하게 등록
@agent.tool
async def fetch_url(ctx, url: str) -> str:
    """주어진 URL의 내용을 가져온다"""
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        return response.text[:2000]

result = await agent.run("Python 3.13의 새로운 기능을 조사해줘")
print(result.output.confidence)  # 0.0 ~ 1.0 범위, 검증됨
```

### 의존성 주입의 매력

Pydantic AI에서 내가 가장 마음에 든 부분은 의존성 주입 패턴이다. 데이터베이스 연결, HTTP 클라이언트, API 키 등을 에이전트 초기화 시 주입할 수 있어 테스트가 쉬워진다.

```python
from dataclasses import dataclass
from pydantic_ai import Agent, RunContext

@dataclass
class AppDeps:
    db: Database
    http_client: httpx.AsyncClient

agent = Agent(model, deps_type=AppDeps, output_type=str)

@agent.tool
async def query_user(ctx: RunContext[AppDeps], user_id: int) -> dict:
    # ctx.deps.db, ctx.deps.http_client로 접근
    return await ctx.deps.db.get_user(user_id)
```

테스트할 때 `AppDeps`에 mock 객체를 넣으면 LLM 호출 없이 도구 로직을 검증할 수 있다. 이런 구조적 접근이 프로덕션 코드베이스에서 빛을 발한다.

### 출력 모드 5가지

Pydantic AI는 구조화 출력을 위한 다섯 가지 모드를 제공한다:

| 모드 | 설명 | 사용 시점 |
|------|------|----------|
| `text` | 일반 텍스트 반환 | 자유 형식 답변 |
| `tool` | 도구 호출로 구조화 (기본값) | 대부분의 경우 |
| `native` | 모델 네이티브 structured output | OpenAI o1, GPT-4o |
| `prompted` | 시스템 프롬프트로 유도 | 도구 미지원 모델 |
| `auto` | 모델 기능에 따라 자동 선택 | 권장 기본값 |

### 솔직한 한계

아직 v1.0이 아니다. 빠르게 변하는 API가 프로덕션 도입을 망설이게 만드는 이유다. 0.x 버전이라는 건 breaking change가 언제든 올 수 있다는 뜻이다. Pydantic 팀의 품질 기준은 믿지만, 서두르기보다는 안정화를 지켜보는 편이 낫다고 생각한다.

또 멀티 에이전트 시나리오는 아직 제한적이다. 복잡한 오케스트레이션이 필요하다면 LangGraph 위에서 Pydantic AI를 구조화 출력 레이어로만 쓰는 조합이 더 현실적이다. 이 조합에 대해서는 [LangGraph vs CrewAI vs Dapr 비교 가이드](/ko/blog/ko/ai-agent-framework-comparison-2026-langgraph-crewai-dapr-production)에서 상위 레이어를 먼저 정리했으니 참고하면 좋다.

## Smolagents — LLM이 코드를 쓰게 하라

### 철학

Smolagents는 가장 독특한 접근법을 취한다. 일반적인 에이전트는 "어떤 도구를 어떤 인자로 호출할지"를 JSON으로 결정한다. Smolagents의 CodeAgent는 대신 **파이썬 코드를 직접 작성하고 실행**한다.

```python
from smolagents import CodeAgent, DuckDuckGoSearchTool
from smolagents.models import LiteLLMModel

model = LiteLLMModel(model_id="gpt-4o")
agent = CodeAgent(
    tools=[DuckDuckGoSearchTool()],
    model=model
)

result = agent.run(
    "2026년 Python 3.14의 주요 변경사항을 조사하고 요약해줘"
)
```

에이전트가 실행하는 것은 `{"tool": "search", "query": "Python 3.14"}` 같은 JSON이 아니라:

```python
results = web_search("Python 3.14 changes 2026")
summary = "\n".join([r["snippet"] for r in results[:3]])
final_answer(summary)
```

같은 실제 파이썬 코드다.

### 왜 코드 생성이 유리한가

HuggingFace 팀의 벤치마크에 따르면:
- 기존 JSON 도구 호출 대비 **LLM 호출 약 30% 감소** — 여러 도구를 순서대로 호출할 때 매번 LLM에 물어보지 않고 코드 한 번에 처리
- GAIA 벤치마크에서 GPT-4o 기준 **44.2% 달성** (당시 검증셋 1위)
- 코드로 조건 분기, 루프, 에러 처리를 직접 표현 가능

```python
# JSON 도구 호출 방식 (4번 LLM 호출)
# 1. "search 실행해"
# 2. 검색 결과 받음. "다음 search 실행해"
# 3. 검색 결과 받음. "compare 실행해"
# 4. 비교 결과 받음. "summarize 실행해"

# Smolagents CodeAgent 방식 (1번 LLM 호출)
results_a = web_search("topic A")
results_b = web_search("topic B")
comparison = compare(results_a, results_b)
final_answer(summarize(comparison))
```

### 핵심 설계 — 1,000줄의 코드

smolagents의 핵심 로직은 약 1,000줄이다. 이건 의도적인 설계 결정이다. 프레임워크를 이해하고 수정하기 쉽게, 불필요한 추상화 없이 만들었다. 연구팀이나 프레임워크 내부를 파고들어야 하는 상황에서 이 점이 큰 장점이다.

### 솔직한 한계

코드 실행은 보안 위험이다. `CodeAgent`는 기본적으로 `E2BSandbox`나 `LocalPythonInterpreter`를 사용하는데, 프로덕션에서 사용자 입력이 에이전트를 통해 코드 실행에 영향을 줄 수 있다면 샌드박싱을 반드시 고려해야 한다.

또 오픈소스 모델을 사용할 때 코드 품질이 크게 달라진다. GPT-4o나 Claude Sonnet 급에서는 잘 동작하지만, 7B 이하 모델에서는 코드에 버그가 섞이는 경우가 꽤 있다. 나는 이 부분이 Smolagents의 가장 큰 한계라고 본다 — 모델 품질에 대한 의존도가 Instructor나 Pydantic AI보다 훨씬 높다.

인증, 레이트 리미터, 로깅 같은 프로덕션 인프라는 직접 만들어야 한다. HuggingFace의 실험적 공간에 있는 라이브러리이므로 엔터프라이즈 지원이나 장기 안정성을 기대하기는 어렵다.

## 세 라이브러리 종합 비교표

| 항목 | Instructor | Pydantic AI | Smolagents |
|------|-----------|-------------|------------|
| **핵심 목적** | 구조화 추출 | 타입 안전 에이전트 | 코드 생성 에이전트 |
| **에이전트 루프** | ❌ | ✅ | ✅ |
| **구조화 출력** | ✅ 핵심 기능 | ✅ 출력 모드 5가지 | ⚠️ 부분 지원 |
| **멀티 프로바이더** | ✅ 15개+ | ✅ 주요 프로바이더 | ✅ LiteLLM 통해 |
| **타입 안전성** | ✅ Pydantic | ✅✅ 전체 타입화 | ⚠️ 제한적 |
| **코드 실행** | ❌ | ❌ | ✅ 핵심 기능 |
| **러닝커브** | 낮음 | 중간 | 중간 |
| **프로덕션 준비도** | ✅ 높음 | ⚠️ v0.x | ⚠️ 실험적 |
| **멀티 에이전트** | ❌ | ⚠️ 기본 지원 | ⚠️ 제한적 |
| **코어 복잡도** | 낮음 | 중간 | 낮음 (1,000줄) |
| **월간 다운로드** | 300만+ | 빠른 성장 중 | 빠른 성장 중 |
| **GitHub 스타** | 11k+ | 8k+ | 6k+ |

## 시나리오별 결정 가이드

### Instructor를 선택해야 할 때

- **이미 OpenAI/Anthropic SDK를 쓰고 있고** 구조화 출력만 필요할 때
- 에이전트 루프 없이 단일 LLM 호출에서 Pydantic 객체를 뽑아야 할 때
- 프로덕션 안정성이 최우선일 때 (300만 다운로드의 검증된 라이브러리)
- 팀이 이미 쓰는 SDK 지식을 그대로 활용해야 할 때

예시 사용 사례: 사용자 입력에서 구조화된 데이터 추출, 문서 파싱, 폼 자동완성, RAG 파이프라인의 쿼리 분류

```python
# 딱 이 정도 코드로 충분하다
class ExtractedInfo(BaseModel):
    intent: Literal["buy", "sell", "inquiry"]
    product: str
    quantity: Optional[int]

result = instructor_client.chat.completions.create(
    model="gpt-4o-mini",
    response_model=ExtractedInfo,
    messages=[{"role": "user", "content": user_message}]
)
```

### Pydantic AI를 선택해야 할 때

- 에이전트 로직을 **타입 안전하게** 설계하고 싶을 때
- 의존성 주입으로 테스트 가능한 코드 구조를 원할 때
- 팀이 Pydantic에 이미 익숙하고, 같은 패러다임으로 에이전트도 만들고 싶을 때
- 향후 안정화됐을 때 장기 사용 가능성을 고려할 때

단, v1.0이 아직 아니므로 breaking change 리스크는 감수해야 한다. 내 판단으로는, 새로 시작하는 프로젝트라면 써볼 가치가 있다. 기존 프로덕션 코드를 마이그레이션하는 건 아직 시기상조다.

[구조화 출력의 기본기가 궁금하다면 DeNA 사내 LLM 스터디 시리즈](/ko/blog/ko/dena-llm-study-part2-structured-output)가 좋은 출발점이다. 이 라이브러리들이 해결하는 문제의 배경을 이해하는 데 도움이 된다.

### Smolagents를 선택해야 할 때

- **코드 실행 에이전트**가 필요하고, 보안 샌드박싱을 처리할 수 있을 때
- 여러 도구를 순차적으로 연결하는 복잡한 워크플로우를 구현할 때
- 프레임워크 내부를 이해하고 커스터마이징해야 할 때 (1,000줄 코어)
- 오픈소스 모델을 로컬에서 실행하며 에이전트 실험을 할 때

예시 사용 사례: 웹 리서치 에이전트, 데이터 분석 자동화, 코드 작성 및 실행 에이전트

중요한 전제: **GPT-4o 또는 Claude Sonnet 이상의 모델을 사용할 것.** 코드 생성 품질이 에이전트 성능을 결정하기 때문이다.

비용 기준으로 보면: GPT-4o ($2.5/1M input)보다 저렴한 Claude Haiku나 GPT-4o-mini로 먼저 실험하고, 코드 오류율이 높으면 상위 모델로 업그레이드하는 접근이 현실적이다. Smolagents는 모델 비용과 성능 사이의 트레이드오프가 세 라이브러리 중 가장 직접적으로 드러난다.

## 실전 조합 패턴

세 라이브러리는 함께 쓸 수도 있다. 실제로 나는 동일 프로젝트에서 세 라이브러리를 모두 사용하는 아키텍처를 운용 중이다.

**패턴 1: Instructor + LangGraph**
- LangGraph가 상태와 흐름을 관리
- Instructor가 각 노드의 LLM 호출에서 구조화 출력 보장

```python
from langgraph.graph import StateGraph
import instructor

client = instructor.from_anthropic(anthropic_client)

def analyze_node(state):
    result = client.messages.create(
        model="claude-sonnet-4-6",
        response_model=AnalysisResult,
        messages=[...]
    )
    return {"analysis": result}
```

이 조합이 실용적인 이유: LangGraph는 에러 복구, 조건 분기, 체크포인트(상태 저장)에 강하다. 반면 Instructor는 "LLM 출력을 믿을 수 있는 Pydantic 객체로 변환"하는 데 집중한다. 두 관심사를 분리하면 각 레이어가 단순해진다.

**패턴 2: Pydantic AI + Instructor**
- Pydantic AI가 에이전트 루프와 도구 관리
- 특정 도구 내에서 Instructor를 사용해 복잡한 중첩 구조 추출

이 조합의 적합한 상황: Pydantic AI의 네이티브 출력 모드로 처리하기 어려운 매우 복잡한 스키마(5단계 이상 중첩, 조건부 필드)가 있을 때, 해당 도구 안에서만 Instructor를 쓰는 선택을 한다.

**패턴 3: Smolagents 단독**
- 리서치, 분석, 코드 실행이 필요한 독립 에이전트
- E2B 샌드박스로 코드 실행 격리

E2B 샌드박스 설정 예시:

```python
from smolagents import CodeAgent, DuckDuckGoSearchTool
from smolagents.models import LiteLLMModel
from e2b_code_interpreter import Sandbox

# E2B 샌드박스로 실행 격리
agent = CodeAgent(
    tools=[DuckDuckGoSearchTool()],
    model=LiteLLMModel(model_id="gpt-4o"),
    executor_type="e2b",  # 격리된 클라우드 VM에서 실행
)
```

E2B는 코드를 격리된 클라우드 VM에서 실행하므로 로컬 파일 시스템이나 환경에 영향을 주지 않는다. 프로덕션에서 사용자 지정 쿼리를 에이전트에 넘기는 상황이라면 이 설정이 사실상 필수다.

## 테스트 전략 비교

세 라이브러리의 테스트 접근법이 다르다. 팀의 테스트 문화에 따라 선호도가 갈릴 수 있다.

**Instructor**: 단위 테스트가 쉽다. `response_model`에 지정한 Pydantic 모델을 별도로 검증하면 된다. LLM 응답을 mock으로 대체해 재시도 로직도 테스트할 수 있다.

```python
# Instructor 단위 테스트 — LLM mock으로 빠르게
from unittest.mock import MagicMock

mock_response = UserProfile(name="테스트", age=25, skills=["Python"])
mock_client = MagicMock()
mock_client.chat.completions.create.return_value = mock_response

result = process_user(mock_client, "테스트 입력")
assert result.name == "테스트"
```

**Pydantic AI**: 의존성 주입 덕분에 통합 테스트가 구조적으로 깔끔하다. `RunContext`에 mock 의존성을 주입해 LLM 없이 도구 로직을 검증한다.

**Smolagents**: 에이전트 전체 테스트가 주를 이룬다. 코드 생성 결과가 달라질 수 있어 단위 테스트보다 "에이전트가 원하는 결과를 내는가"를 검증하는 엔드-투-엔드 테스트가 현실적이다.

[프로덕션 AI 에이전트 설계 원칙](/ko/blog/ko/production-grade-ai-agent-design-principles)에서 이런 패턴들을 상위 아키텍처 관점에서 다루고 있으니, 에이전트 시스템 전체 설계를 고민하는 독자에게 권한다.

## 이 세 라이브러리로도 부족할 때

세 라이브러리를 모두 살펴봤지만, 이것들이 해결하지 못하는 영역도 있다.

**분산 에이전트 시스템**: 여러 머신에 에이전트를 배포하고, 메시지 큐로 작업을 분배하고, 인프라 수준의 내구성(durable execution)이 필요하다면 Dapr Agents 같은 인프라 레이어를 고려해야 한다. Instructor나 Smolagents는 이 레이어를 다루지 않는다.

**멀티 에이전트 협업**: 10개 이상의 에이전트가 공유 상태를 가지고 역할을 분담하는 시나리오라면, CrewAI나 LangGraph의 체계적인 오케스트레이션이 필요하다. Pydantic AI의 멀티 에이전트 지원은 아직 이 수준의 복잡도를 다루기에 충분하지 않다.

**장기 실행 워크플로우**: 시간 단위 또는 일 단위로 실행되는 워크플로우, 중간 상태를 체크포인트로 저장해야 하는 작업에는 LangGraph의 persistence 기능이나 Temporal 같은 워크플로우 엔진이 적합하다.

이 세 라이브러리는 "LLM 레이어에 가까운 작업"에 최적화되어 있다. 인프라 수준의 에이전트 시스템을 구축한다면, 이 라이브러리들을 구성 요소로 활용하되 상위 아키텍처는 별도로 설계해야 한다.

한 가지 현실적인 조언: 처음부터 세 라이브러리를 모두 도입하려 하지 말 것. 팀이 새로운 패러다임에 적응하는 데도 시간이 필요하다. 먼저 Instructor 하나로 시작해 "LLM 구조화 출력" 문제를 해결하고, 에이전트 루프가 필요해지면 Pydantic AI를 추가하고, 코드 실행이 필요한 특수 작업이 생기면 그때 Smolagents를 검토하는 단계별 접근이 유지보수 부담을 줄인다.

## 내 결론 — 세 라이브러리 모두 쓴다, 상황에 따라

솔직히 말하면, 나는 세 라이브러리를 모두 쓴다. 각각 잘 하는 게 다르기 때문이다.

**Instructor**는 지금 당장 프로덕션에 써도 안전하다. LLM 응답에서 구조화된 데이터를 뽑아야 할 때 매번 꺼내는 도구다. 300만 월간 다운로드가 말해주듯, 가장 많은 프로덕션 검증을 거쳤다.

**Pydantic AI**는 흥미롭고 방향성이 맞다. 아직 v0.x라는 리스크가 있지만, 새 프로젝트의 에이전트 레이어로 실험 중이다. 의존성 주입과 타입 안전성을 에이전트 레이어에서 누리고 싶은 욕심이 이 선택의 이유다. v1.0이 나오면 진지하게 메인으로 쓸 생각이다.

**Smolagents**는 코드 실행 에이전트가 필요한 특정 상황에서 꺼낸다. 단, 모델 의존도가 높고 프로덕션 인프라를 직접 만들어야 한다는 비용을 고려해야 한다. 나는 내부 리서치 자동화 도구에서만 쓰고, 사용자 대상 서비스에는 아직 쓰지 않는다.

"뭐가 가장 좋은가"를 묻는다면, 내 대답은 이렇다. 구조화 추출이 필요하면 Instructor, 타입 안전한 에이전트 루프가 필요하면 Pydantic AI, 코드 실행 에이전트가 필요하면 Smolagents. 그게 전부다.

[LLM API 가격 비교](/ko/blog/ko/llm-api-pricing-comparison-2026-gpt5-claude-gemini-deepseek)도 참고하면 좋다. 어떤 라이브러리를 쓰든 모델 선택에 따라 비용이 크게 달라지는데, 특히 Instructor의 재시도 비용이나 Smolagents의 코드 생성 루프 비용을 사전에 추정할 때 도움이 된다.
