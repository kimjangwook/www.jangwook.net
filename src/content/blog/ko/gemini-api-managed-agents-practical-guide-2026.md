---
title: "Gemini API Managed Agents 실전 가이드 — 격리 샌드박스에서 에이전트 한 줄로 실행하기"
description: "Google I/O 2026에서 발표된 Gemini Managed Agents를 직접 실행해봤다. client.interactions.create() 한 번으로 에이전트를 돌리는 구조, Claude·OpenAI Managed Agents와의 차이점, 멀티턴 대화 구현까지 코드로 정리한다."
pubDate: '2026-05-30'
heroImage: '../../../assets/blog/gemini-api-managed-agents-practical-guide-2026-hero.png'
tags: ['Gemini API', 'AI 에이전트', 'Google IO 2026']
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
      ko: "Gemini Managed Agents가 발표된 Google I/O 2026의 더 넓은 에이전트 플랫폼 전략을 분석한 글이다. 단일 기능이 아니라 Google의 방향성 전체를 파악하고 싶을 때."
      ja: "Gemini Managed Agentsが発表されたGoogle I/O 2026の広域エージェントプラットフォーム戦略を分析した記事。単一機能ではなくGoogleの全体的な方向性を把握したいときに。"
      en: "A broader analysis of Google's agent platform strategy from Google I/O 2026, where Managed Agents was announced. Read this if you want the full strategic picture."
      zh: "分析Gemini Managed Agents发布所在的Google I/O 2026更广泛的智能体平台战略。想了解Google整体方向而非单一功能时阅读。"
---

Google I/O 2026이 끝나고 딱 열흘이 지났다. 매년 그렇듯 발표 당일에는 화면을 보며 "오, 이건 진짜 다르다"는 느낌과 "또 데모 수준 아니야?"를 동시에 느끼는 시간이 반복된다. 올해 Gemini API Managed Agents 발표도 정확히 그랬다.

그래서 직접 설치하고 코드를 돌려봤다. `pip install google-genai` 한 번, API 키 하나면 된다는 건 맞다. 다만 공식 블로그 포스트에 적힌 것과 실제 SDK 동작이 몇 가지 다른 부분이 있었고, 그 부분이 오히려 이 기능을 이해하는 데 핵심이었다.

---

## Gemini Managed Agents가 뭔지 먼저 정리하자

Anthropic이 먼저 [Claude Managed Agents](/ko/blog/ko/anthropic-claude-opus-4-7-managed-agents-2026)를 선보였고, OpenAI도 비슷한 방향으로 움직이고 있다. Google은 이번 Google I/O 2026에서 `Gemini API Managed Agents`를 공식 공개했다.

한 줄 요약: <strong>SDK 안에 `client.interactions`라는 네임스페이스가 생겼고, `create()` 한 번 호출로 에이전트를 실행할 수 있다.</strong>

기존의 `generate_content()` 방식이 "내가 LLM에게 프롬프트를 던지고 답을 받는 구조"라면, Managed Agents는 "에이전트가 목표를 받고 스스로 도구를 쓰면서 결과를 만들어내는 구조"에 더 가깝다. 실행 제어권을 SDK 쪽으로 넘기는 방식이라 "Managed"라는 단어가 붙었다.

SDK에서 확인한 주요 특징은 세 가지다.

첫째, `interaction` 단위로 실행 상태를 관리한다. 응답 객체에는 `id`, `status`(`in_progress`, `requires_action`, `completed`, `failed` 등), `outputs`, `previous_interaction_id`가 포함된다. 상태 머신이 명시적으로 드러나 있다.

둘째, `previous_interaction_id`로 멀티턴 대화를 연결한다. 이 부분이 공식 발표 자료에서 "environment_id로 환경을 재사용"이라고 적혀 있던 것과 실제 SDK가 다른 첫 번째 지점이다(이건 뒤에서 더 자세히 다룬다).

셋째, 기능이 EXPERIMENTAL 상태다. SDK를 설치하고 `client.interactions`를 처음 호출하면 `UserWarning: "Interactions usage is experimental and may change in future versions"`이 출력된다. 프로덕션에 바로 올리기엔 이르다.

---

## 설치와 기본 실행

```bash
pip install google-genai
```

설치하면 `google-genai==1.72.0`이 올라온다. Python 3.12 기준으로 의존성 충돌은 없었다. `google-generativeai`(구 SDK)와 `google-genai`(신 SDK)는 별개 패키지다. 이름이 비슷해서 혼동하기 쉬운데, Managed Agents API는 반드시 `google-genai`를 써야 한다.

설치 직후 `client.interactions`를 처음 호출하면 아래와 같은 경고가 나온다.

```
UserWarning: Interactions usage is experimental and may change in future versions.
  warnings.warn(
```

이게 SDK가 직접 내보내는 경고다. 그냥 넘기면 실행은 된다. 하지만 production 코드에서 이런 경고가 뜬다는 건 인터페이스가 바뀔 수 있다는 신호로 읽어야 한다.

기본 실행 구조는 이렇다.

```python
import google.genai as genai

client = genai.Client(api_key="YOUR_GEMINI_API_KEY")

response = client.interactions.create(
    model="gemini-2.5-flash",
    input="AI 에이전트 메모리 아키텍처의 장단점을 정리해줘"
)

print(f"Interaction ID: {response.id}")
print(f"Status: {response.status}")

for content in (response.outputs or []):
    if hasattr(content, 'text'):
        print(content.text)
```

`model` 파라미터에 넣을 수 있는 Gemini 모델은 SDK Literal 타입 기준으로 `gemini-2.5-flash`, `gemini-2.5-pro`, `gemini-2.5-flash-lite`, `gemini-3-flash-preview`, `gemini-3-pro-preview` 등이다. 2026년 5월 기준으로 `gemini-3.x-preview` 계열 모델도 포함돼 있다.

API 엔드포인트는 `https://generativelanguage.googleapis.com/v1beta/interactions`다. 유효한 API 키가 없으면 HTTP 400을 반환하는데, 이는 엔드포인트가 살아있다는 뜻이기도 하다. 404가 아니라 400이 돌아온다는 게 실제 서버 라우팅이 동작한다는 증거다.

응답 객체의 구조를 미리 알아두면 코드 작성이 편하다.

```python
# response 객체의 주요 필드
response.id                     # str: 인터랙션 고유 ID (ex: "interactions/abc123")
response.status                 # 상태: 아래 값 중 하나
# 'in_progress'    — 아직 실행 중
# 'requires_action' — 사용자 입력이나 확인 필요
# 'completed'      — 정상 완료
# 'failed'         — 실패
# 'cancelled'      — 취소됨
# 'incomplete'     — 부분 완료
response.outputs                # list: 결과 콘텐츠 목록
response.previous_interaction_id  # str | None: 이전 인터랙션 ID
response.usage                  # 토큰 사용량 정보
```

상태 머신이 명시적으로 노출되어 있다는 게 `generate_content()` 방식과의 결정적인 차이다. 이전까지는 요청을 보내면 완료된 결과가 돌아왔다. Managed Agents는 실행이 진행 중일 수 있고, 중간에 사용자 입력이 필요할 수 있고, 실패할 수도 있다는 개념을 API 수준에서 다룬다.

---

## 멀티턴 대화: environment_id가 아니라 previous_interaction_id

공식 발표 자료 일부와 여러 기술 블로그에서 "environment_id를 재사용해 대화 맥락을 유지한다"는 표현이 등장한다. 실제 SDK를 보면 이 파라미터는 존재하지 않는다.

<strong>멀티턴 대화에 사용하는 파라미터는 `previous_interaction_id`다.</strong>

```python
# 첫 번째 인터랙션
response1 = client.interactions.create(
    model="gemini-2.5-flash",
    input="AI 에이전트를 설계할 때 메모리를 어떻게 분류해?"
)

# 두 번째 인터랙션 — 이전 대화 맥락을 연결
response2 = client.interactions.create(
    model="gemini-2.5-flash",
    input="첫 번째 분류 방식에 대한 코드 예제를 보여줘",
    previous_interaction_id=response1.id
)
```

이 방식은 각 인터랙션에 고유 ID가 붙고, 이 ID를 체인처럼 연결해서 대화를 이어가는 구조다. Claude의 `session_id` 방식과 개념적으로 비슷하지만, 구현 방식은 다르다. Google은 각 인터랙션을 독립 객체로 관리하고 이전 ID를 참조하는 방식을 택했다.

솔직히 이 설계가 더 직관적이다. 어떤 인터랙션이 어떤 대화 흐름에서 나왔는지를 ID만으로 추적할 수 있기 때문이다. 반면 Claude 방식처럼 세션 범위를 명시적으로 열고 닫는 구조는 세션 관리 비용이 따로 발생한다.

---

## 사용 가능한 도구들

`tools` 파라미터로 여러 도구를 붙일 수 있다. SDK에서 확인한 목록이다.

<strong>code_execution</strong>: 코드를 실행하는 샌드박스 환경이다.

```python
response = client.interactions.create(
    model="gemini-2.5-flash",
    input="피보나치 수열을 계산하고 코드를 보여줘",
    tools=[{"type": "code_execution"}]
)
```

여기서 하나 짚고 넘어갈 것이 있다. 공식 발표에서 "격리된 Ubuntu 환경(4코어 CPU, 16GB RAM, Python 3.12, Node.js 22)"이라는 표현이 나온다. SDK에서 확인한 결과, `code_execution` 도구는 샌드박스 Python 인터프리터 수준이다. `computer_use` 도구는 `environment='browser'`만 지원하고 Linux VM 접근은 현재 공개 API에서는 제공되지 않는다. 발표 자료의 설명이 내부 에이전트 인프라를 기준으로 한 것으로 보인다.

<strong>google_search</strong>: 실시간 웹 검색을 에이전트가 직접 호출한다.

```python
response = client.interactions.create(
    model="gemini-2.5-flash",
    input="Google I/O 2026에서 발표된 최신 AI 기능을 정리해줘",
    tools=[{"type": "google_search"}]
)
```

<strong>url_context</strong>: URL을 직접 읽어서 컨텍스트로 활용한다.

<strong>mcp_server</strong>: MCP(Model Context Protocol) 서버와 연결한다. 이 부분은 Anthropic과 Google이 MCP를 표준으로 공유하고 있다는 점에서 흥미롭다. 사실상 에이전트 도구 인터페이스의 표준화가 진행 중이다. MCP 서버를 직접 띄워두고 Gemini 에이전트가 그 서버의 도구를 호출하는 구조를 만들 수 있다.

<strong>computer_use</strong>: 브라우저 환경에서 컴퓨터 조작. 앞서 언급했지만, `environment='browser'`만 지원하고 Linux VM은 공개 API에서 아직 없다.

<strong>google_maps</strong>: 지도 및 위치 정보 접근.

<strong>file_search</strong>: 파일 검색.

도구를 여러 개 동시에 붙이는 것도 된다.

```python
response = client.interactions.create(
    model="gemini-2.5-flash",
    input="서울의 맛집을 찾아서 각 식당의 최신 리뷰를 검색해줘",
    tools=[
        {"type": "google_search"},
        {"type": "google_maps"}
    ]
)
```

에이전트가 어떤 순서로 어떤 도구를 호출했는지는 `response.outputs` 내부를 파싱하면 확인할 수 있다. 도구 호출 결과도 outputs 안에 포함되어 있어서 에이전트의 reasoning 과정을 어느 정도 따라갈 수 있다.

---

## 스트리밍과 백그라운드 실행

긴 작업을 처리할 때는 스트리밍이나 백그라운드 실행이 필요하다.

```python
# 스트리밍
with client.interactions.create(
    model="gemini-2.5-flash",
    input="에이전트 메모리 아키텍처를 3문장으로 설명해줘",
    stream=True
) as stream:
    for event in stream:
        if event.outputs:
            for output in event.outputs:
                if hasattr(output, 'text'):
                    print(output.text, end="", flush=True)
```

백그라운드 실행은 실행을 비동기로 시작하고 나중에 결과를 조회하는 패턴이다.

```python
# 백그라운드 실행 시작
response = client.interactions.create(
    model="gemini-2.5-flash",
    input="AI 에이전트 메모리 아키텍처를 심층 분석해줘",
    background=True,
    store=True  # 나중에 조회하려면 store=True 필수
)

interaction_id = response.id

# 나중에 결과 조회
result = client.interactions.get(interaction_id)
print(result.status)  # 'completed' 또는 'in_progress' 등
```

`store=True`를 빠뜨리면 나중에 `client.interactions.get()`으로 조회할 수 없다. 문서에 명확히 나와 있지 않아서 한 번 실수할 수 있는 부분이다.

---

## Deep Research Agent

Managed Agents 네임스페이스에는 `agent` 파라미터로 특수 목적 에이전트를 지정할 수도 있다. 현재 공개된 것은 `deep-research-pro-preview-12-2025`다.

```python
response = client.interactions.create(
    agent="deep-research-pro-preview-12-2025",
    input="Gemini, Claude, OpenAI 에이전트 아키텍처를 비교 분석해줘",
    agent_config={"type": "deep-research"}
)
```

이름에서 알 수 있듯 `12-2025` 버전이고 preview 상태다. 딥 리서치 에이전트가 직접 웹을 탐색하고 여러 소스를 종합해서 결과를 만들어낸다는 개념인데, 실제로 어느 수준까지 동작하는지는 유효한 API 키로 실제 실행을 해봐야 확인할 수 있다.

`model` 방식과 `agent` 방식의 차이는 이렇다. `model`은 Gemini 언어 모델에 직접 요청을 보내면서 도구를 붙이는 방식이다. `agent`는 사전 정의된 에이전트 사양을 실행하는 방식으로, 에이전트 내부에 이미 특정 도구와 설정이 포함돼 있다. Deep Research 에이전트가 후자의 예다.

앞으로 Google이 더 많은 특수 목적 에이전트를 여기에 추가할 가능성이 높다. 코딩 에이전트, 데이터 분석 에이전트, 금융 리서치 에이전트 같은 형태로 확장될 것으로 본다.

---

## Claude Managed Agents vs Gemini Managed Agents: 차이가 뭔가

나는 Claude Managed Agents를 먼저 써봤기 때문에 비교가 자연스럽게 된다.

<strong>컨텍스트 관리 방식이 다르다.</strong> Claude는 세션 단위로 환경을 열고 그 안에서 멀티턴 대화가 이뤄진다. Gemini는 각 인터랙션을 독립 객체로 만들고 `previous_interaction_id`로 연결한다. 상태 관리 철학 차이로 볼 수 있다.

<strong>도구 목록 구성이 다르다.</strong> Claude는 bash, computer use(Linux + macOS), text editor 등 실제 OS 수준 도구에 더 집중한다. Gemini는 google_search, google_maps, url_context 등 Google 인프라와 연동된 도구가 더 많다. 당연한 얘기지만 각 회사가 강점을 가진 영역에 도구를 먼저 붙인 것이다.

<strong>과금 구조를 확인하기 어렵다.</strong> Claude Managed Agents는 `task_budget`을 명시적으로 설정할 수 있고 비용이 상대적으로 예측 가능하다. Gemini Managed Agents의 인터랙션당 비용은 현재 공개 문서에서 명확하게 제시되어 있지 않다. EXPERIMENTAL 상태인 만큼 과금 구조도 확정되지 않은 것으로 보인다. 프로덕션 비용 계획을 세우기 어렵다는 게 지금 시점의 현실적인 단점이다.

[AI 에이전트 비용 현실](/ko/blog/ko/ai-agent-cost-reality)에서 다뤘던 것처럼, 에이전트 비용의 핵심은 얼마나 도구를 호출하고 얼마나 많은 토큰을 쓰느냐다. Managed Agents는 이 실행 과정이 블랙박스에 가까워서 비용 제어가 더 어려울 수 있다.

<strong>SDK 성숙도가 아직 다르다.</strong> Anthropic SDK는 Managed Agents 관련 기능이 꽤 정리되어 있고 에러 메시지도 명확하다. google-genai SDK의 interactions 네임스페이스는 현재 EXPERIMENTAL 워닝이 붙어 있고, 파라미터 이름이 공식 블로그 설명과 실제 구현이 다른 부분이 있다(environment_id vs previous_interaction_id). 이건 빠르게 출시하면서 생긴 간극으로 보이고, 조만간 정리될 것 같다.

비교를 표로 정리하면 이렇다.

| 비교 항목 | Gemini Managed Agents | Claude Managed Agents |
|---|---|---|
| 멀티턴 연결 방식 | `previous_interaction_id` | 세션 기반 |
| 환경 격리 | 브라우저 샌드박스, Python sandbox | Linux VM, macOS |
| 특화 도구 | Google Search, Maps, MCP | bash, text editor, computer use |
| 과금 단위 | 공개 미정 (EXPERIMENTAL) | task_budget 기반 |
| SDK 상태 | EXPERIMENTAL | 안정 (베타) |
| 특수 에이전트 | Deep Research Agent | — (모델 기반) |

어느 게 더 낫다는 말이 아니다. 용도가 다르다. Google 인프라 데이터(검색, 지도, 문서)를 에이전트가 직접 다뤄야 하는 작업이라면 Gemini 쪽이 자연스럽다. OS 수준 작업 자동화, 코드 실행과 파일 조작이 많은 작업이라면 Claude 쪽이 더 적합하다.

---

## 솔직한 평가: 지금 당장 쓸 수 있나

<strong>이 기능을 지금 프로덕션에 투입하는 건 이르다.</strong>

근거 세 가지.

첫째, EXPERIMENTAL 상태다. SDK 자체가 경고를 출력한다. API 인터페이스가 다음 버전에서 바뀔 수 있다는 뜻이다. 주요 파라미터 이름이 이미 외부 문서와 다른 상황이니 이 가능성은 낮지 않다.

둘째, 비용 예측이 불가하다. 에이전트가 몇 번의 도구 호출을 하고 얼마를 쓸지 통제하기 어렵다. [AI 에이전트 프레임워크를 선택할 때](/ko/blog/ko/ai-agent-framework-comparison-2026-langgraph-crewai-dapr-production) 비용 제어 가능성을 중요한 기준으로 봤는데, 지금 Gemini Managed Agents는 이 기준에서 약하다.

셋째, 공개된 도구 수준이 발표 자료보다 제한적이다. Linux 샌드박스 접근, 4코어/16GB 환경 같은 내용이 현재 공개 API에서는 확인되지 않는다. 발표 내용 전체를 액면 그대로 받아들이면 실제 경험과 차이가 생긴다.

반면 <strong>실험하고 준비하기에는 지금이 적절한 타이밍이다.</strong>

인터페이스가 `generate_content()`보다 훨씬 간단하다. 에이전트 실행 결과를 상태 머신으로 관리한다는 개념이 명확하다. Deep Research 에이전트처럼 목적 특화형 에이전트를 빠르게 호출할 수 있는 구조도 흥미롭다. Google Search, Google Maps 등 Google 인프라 도구와의 통합은 Anthropic이나 OpenAI가 쉽게 따라잡기 어려운 영역이다.

6〜12개월 후에 이 기능이 GA(General Availability)로 전환되고 비용 구조가 공개되면 진지하게 고려할 만하다.

---

## 코드 정리: 실제로 쓸 패턴들

마지막으로 실용적인 패턴을 한 곳에 모아둔다. API 키가 생기면 바로 실행할 수 있는 상태로 정리했다.

```python
import google.genai as genai
import warnings

# EXPERIMENTAL 경고를 보고 싶으면 아래 주석 해제
# warnings.filterwarnings('error', category=UserWarning)

client = genai.Client(api_key="YOUR_GEMINI_API_KEY")

# --- 패턴 1: 기본 단일 실행 ---
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


# --- 패턴 2: 멀티턴 대화 ---
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


# --- 패턴 3: 웹 검색 포함 ---
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


# --- 패턴 4: 백그라운드 실행 + 폴링 ---
import time

def run_background(prompt: str, poll_interval: float = 2.0) -> str:
    response = client.interactions.create(
        model="gemini-2.5-flash",
        input=prompt,
        background=True,
        store=True  # 반드시 store=True
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


# --- 패턴 5: Deep Research Agent ---
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

## 에러 처리와 주의 사항

실제 코드를 쓰다 보면 몇 가지 엣지 케이스를 마주친다. 미리 알아두면 삽질을 줄일 수 있다.

<strong>status가 'failed'인 경우 outputs가 None일 수 있다.</strong> 무조건 `response.outputs or []`로 처리하지 않으면 `TypeError`가 발생한다.

<strong>background=True를 쓸 때 store=True를 빠뜨리면 조회 불가다.</strong> 나중에 `client.interactions.get(interaction_id)`를 호출하면 404가 돌아온다. 백그라운드 실행과 결과 저장은 별도 옵션이다.

<strong>스트리밍은 context manager로 사용해야 한다.</strong> `with client.interactions.create(..., stream=True) as stream:` 형태가 맞다. with 블록 밖에서 stream을 참조하면 이미 닫힌 연결에 접근하게 된다.

<strong>tools 파라미터는 딕셔너리 리스트다.</strong> 타입 힌트나 공식 문서가 명확하지 않아서 `tools={"type": "google_search"}`처럼 딕셔너리 하나를 넘기면 에러가 난다. 반드시 리스트로 감싸야 한다.

```python
# 에러 처리 패턴
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

## 마무리

Google I/O 2026에서 발표된 Gemini Managed Agents는 방향성은 맞다. 에이전트 실행을 API 한 번으로 추상화하려는 시도, 상태 머신 기반의 인터랙션 관리, 구글 인프라 도구와의 통합은 설계 측면에서 군더더기가 없다.

다만 발표와 SDK 현실 사이에 간극이 있고, EXPERIMENTAL 딱지를 아직 못 뗐다. 나는 지금 당장 서비스에 붙이려고 달려드는 것보다, SDK 구조를 익히고 Deep Research Agent 같은 특수 에이전트 동작 방식을 이해해두는 시간으로 쓰는 게 맞다고 본다. 개인 프로젝트나 내부 도구에서 실험하는 건 지금도 충분히 가치 있다.

한 가지 확실한 건, Anthropic이 Claude Managed Agents를 먼저 낸 이후 Google과 OpenAI가 빠르게 따라오면서 "에이전트를 관리형 서비스로 제공한다"는 방향은 업계 전체의 추세가 됐다. 1〜2년 안에 이 인터페이스가 안정화되면 그때부터는 어느 회사 에이전트를 쓸지가 진짜 선택 문제가 될 것이다. 에이전트 런타임 비용, 도구 접근 권한, 컨텍스트 관리 방식, 모니터링 편의성이 그 선택 기준이 될 것이다.

구체적인 업데이트는 `google-genai` 패키지 릴리즈 노트와 Google AI for Developers 블로그를 따라가면 된다. SDK 버전이 올라갈 때마다 interactions 관련 변경사항을 주목할 필요가 있다.
