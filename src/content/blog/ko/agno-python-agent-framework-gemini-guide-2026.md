---
title: "Agno로 AI 에이전트 만들기 — Gemini와 내장 툴로 직접 돌려봤다"
description: "phidata에서 리브랜딩한 Agno v2.6.17을 샌드박스에 설치하고, Calculator·Wikipedia·구조화 출력·멀티 에이전트 팀까지 실제 실행 로그와 함께 검증했습니다. output_schema vs output_model 혼동, deprecated 모델 ID, Team API 변경점 등 실제로 마주친 트랩도 정직하게 기록합니다."
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
      ja: Agno を PydanticAI や Smolagents と比較する際の基準になる記事です。
      zh: 这篇文章是比较 Agno 与 PydanticAI、Smolagents 时的参考基准。
  - slug: pydantic-ai-type-safe-agent-tutorial-2026
    score: 0.88
    reason:
      ko: Agno의 output_schema가 익숙해졌다면, PydanticAI의 타입 안전 패턴도 바로 이어서 볼 만합니다.
      en: Once you're comfortable with Agno's output_schema, PydanticAI's type-safe approach is the natural next read.
      ja: Agno の output_schema に慣れたら、PydanticAI のタイプセーフパターンも続けて読む価値があります。
      zh: 熟悉了 Agno 的 output_schema 之后，PydanticAI 的类型安全模式是自然的下一步。
  - slug: google-adk-vs-langgraph-agent-framework-comparison-2026
    score: 0.83
    reason:
      ko: Agno의 경량 철학과 Google ADK·LangGraph의 엔터프라이즈 접근법을 대조해서 읽으면 프레임워크 선택 기준이 더 명확해집니다.
      en: Reading Agno's lightweight philosophy alongside ADK and LangGraph's enterprise approaches clarifies the framework selection criteria.
      ja: Agno の軽量哲学と Google ADK・LangGraph のエンタープライズアプローチを対比すると、フレームワーク選択基準が明確になります。
      zh: 将 Agno 的轻量哲学与 Google ADK、LangGraph 的企业级方法对比阅读，可以让框架选择标准更加清晰。
  - slug: mastra-ai-typescript-agent-framework-guide-2026
    score: 0.78
    reason:
      ko: Python 쪽은 Agno, TypeScript 쪽은 Mastra — 언어별 에이전트 프레임워크 생태계 전체 그림을 잡을 수 있습니다.
      en: Agno for Python, Mastra for TypeScript — together they map the agent framework landscape across both languages.
      ja: Python 側は Agno、TypeScript 側は Mastra — 両方を読むとエージェントフレームワークの全体像が見えてきます。
      zh: Python 用 Agno，TypeScript 用 Mastra — 两篇合读可以掌握两种语言的 Agent 框架全貌。
---

LangChain이 너무 무겁다고 느낀 적이 있다면, 아마 비슷한 결론에 도달한 사람이 꽤 많을 것이다. 의존성 트리가 거대하고, 추상화 계층이 쌓이다 보면 실제로 무슨 일이 벌어지는지 추적하기 어려워진다. 그래서 요즘은 "LangChain 없이도 에이전트를 만들 수 있다"는 걸 증명하는 가벼운 프레임워크들이 늘고 있다.

Agno가 그 중 하나다. 원래는 Phidata라는 이름이었는데 2025년 초에 리브랜딩했다. 오늘은 Agno v2.6.17을 샌드박스에 직접 설치하고 Calculator, Wikipedia, 구조화 출력, 멀티 에이전트 팀까지 순서대로 실행해봤다. 이 과정에서 문서만 봐서는 알 수 없는 트랩도 몇 가지 만났는데, 그것까지 기록한다.

## Agno는 무엇이고 어디서 왔나

Phidata는 원래 "Python으로 AI 어시스턴트를 만드는 프레임워크"를 표방하며 GitHub에서 꾸준히 스타를 모았다. 2025년 초, Phidata는 Agno로 이름을 바꾸면서 설계 철학도 더 명확하게 정리했다. 핵심 메시지는 세 가지다.

첫째, 모델 불가지론(model-agnostic)이다. OpenAI, Anthropic, Google, Ollama, Cohere 등 70개 이상의 LLM을 동일한 코드 구조로 연결할 수 있다. 모델을 교체해도 에이전트 로직은 그대로 쓸 수 있다는 뜻이다.

둘째, 멀티모달을 기본으로 설계했다. 텍스트뿐 아니라 이미지, 오디오, 비디오도 처리할 수 있는 에이전트를 같은 API로 만든다.

셋째, 멀티 에이전트 오케스트레이션을 일급 시민으로 취급한다. Team 클래스가 내장되어 있고, `coordinate`, `route`, `collaborate` 같은 협업 모드를 파라미터 하나로 전환할 수 있다.

솔직히 말하면, 이런 설명만 보면 "그게 LangChain이랑 뭐가 달라?"라는 생각이 든다. 실제로 코드를 쳐보니까 차이가 느껴졌다. Agno는 클래스 상속보다 컴포지션을 선호하고, 에이전트 하나를 만드는 데 필요한 보일러플레이트가 훨씬 적다.

## 설치: 의존성 지옥은 없었다

```bash
pip install agno google-genai ddgs wikipedia
```

의존성이 생각보다 깔끔했다. `agno` 패키지 자체는 core만 설치되고, 사용하는 도구에 따라 추가 패키지를 별도로 설치한다. 예를 들어 Wikipedia 도구를 쓰려면 `wikipedia`가, Gemini를 쓰려면 `google-genai`가 필요하다.

```bash
$ python3 -c "import agno; print(agno.__version__)"
2.6.17
```

Gemini API 키는 환경변수로 주입했다. Agno는 `GOOGLE_API_KEY` 또는 `GEMINI_API_KEY` 중 하나가 있으면 자동으로 Gemini 클라이언트를 초기화한다. 두 개 다 있으면 `GOOGLE_API_KEY`가 우선한다는 경고가 stdout에 찍히는데, 이건 코드상에서 제어하기 어렵다. 작은 불편이다.

## 첫 번째 에이전트: Calculator 도구

```python
from agno.agent import Agent
from agno.models.google import Gemini
from agno.tools.calculator import CalculatorTools

agent = Agent(
    model=Gemini(id="gemini-2.5-flash"),
    tools=[CalculatorTools()],
    description="수학 계산을 도와주는 에이전트",
)

response = agent.run("2의 10승 더하기 3의 5승은? 계산기를 사용해줘.")
print(response.content)
```

실행 결과:

```
2의 10승은 1024이고, 3의 5승은 243입니다. 두 수를 더하면 1267입니다.
⏱ 8.98s
```

계산값은 정확하다. 1024 + 243 = 1267이 맞다. 에이전트가 LLM에 직접 계산을 맡기지 않고 Calculator 도구를 호출했다는 걸 확인할 수 있었다. 레이턴시가 약 9초인 건 Gemini API 왕복 + 툴 호출 포함이라 그럴 만하다.

한 가지 주의할 점이 있다. 예전 Agno 문서나 블로그 포스트에서 `show_tool_calls=True`라는 파라미터를 쓰는 걸 봤는데, v2.6.17에서는 `TypeError: Agent.__init__() got an unexpected keyword argument 'show_tool_calls'`가 뜬다. API가 정리되면서 빠진 것 같다. 현재 버전에서 도구 호출 로그를 보려면 `debug_mode=True`로 대신한다.

또 하나: `gemini-2.0-flash`를 모델 ID로 쓰면 404 에러가 난다. Google이 2.0-flash를 deprecated 처리해서다. `gemini-2.5-flash`를 써야 한다.

```
ERROR    Error from Gemini API: 404 NOT_FOUND. 
{'error': {'message': 'This model models/gemini-2.0-flash is no longer available.'}}
```

이건 내가 처음 시도했을 때 실제로 마주친 에러다. 공식 사이트에서 현재 사용 가능한 모델 ID를 먼저 확인하는 게 맞다.

## Wikipedia 도구로 리서치 에이전트 만들기

```python
from agno.tools.wikipedia import WikipediaTools

agent = Agent(
    model=Gemini(id="gemini-2.5-flash"),
    tools=[WikipediaTools()],
)

response = agent.run(
    "What is 'attention mechanism' in neural networks? 2 sentences only."
)
print(response.content)
```

실행 로그:

```
INFO Searching wikipedia for: attention mechanism neural networks
ERROR Error searching Wikipedia for 'attention mechanism neural networks':
      Page id "attention mechanism neural network" does not match any pages.
INFO Searching wikipedia for: attention (machine learning)
⏱ 9.98s

In machine learning, attention is a method that determines the importance 
of each component in a sequence relative to the other components. Inspired 
by human attention, this mechanism was developed to address weaknesses in 
recurrent neural networks by allowing the model to focus on relevant parts 
of the input.
```

재미있는 부분이 있다. 첫 검색어(`attention mechanism neural networks`)로 Wikipedia 페이지를 못 찾으면, 에이전트가 스스로 검색어를 `attention (machine learning)`으로 바꿔서 재시도했다. 이건 Agno가 도구 실패를 자동으로 처리하고 다음 행동을 결정하는 ReAct 루프를 내부적으로 실행한다는 뜻이다. 코드 한 줄 추가 없이.

[Python AI 에이전트 라이브러리 비교 글](/ko/blog/ko/python-ai-agent-library-comparison-2026)에서 Smolagents의 코드 실행 에이전트와 비교해보면, Agno는 코드 생성보다는 도구 조합에 더 강점이 있다는 게 느껴진다.

## 구조화 출력: output_schema가 맞다, output_model이 아니다

Agno의 가장 헷갈리는 API 네이밍이 여기 있다. `output_model`이라는 파라미터가 존재하는데, 직관적으로 "Pydantic 모델을 여기 넣으면 되겠다"고 생각하면 틀린다.

```python
# 이렇게 하면 에러
agent = Agent(
    model=Gemini(id="gemini-2.5-flash"),
    output_model=DeveloperProfile,  # ← 틀림
)
# ValueError: Model must be a Model instance, string, or None
```

`output_model`은 LLM 모델을 받는 파라미터다. 구조화 출력을 원하면 `output_schema`를 쓴다.

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
    output_schema=DeveloperProfile,  # ← 맞음
)

response = agent.run(
    "Create a developer profile for 'Kim Jangwook', a Korean developer "
    "specializing in Claude Code, MCP, Python, TypeScript."
)
print(type(response.content))  # <class '__main__.DeveloperProfile'>
print(response.content.name)   # Kim Jangwook
```

실행 결과:

```
⏱ 4.00s
Type: DeveloperProfile
Name: Kim Jangwook
Skills:
  - Claude Code: Expert (since 2022)
  - MCP: Certified (since 2019)
  - Python: Senior (since 2018)
  - TypeScript: Intermediate (since 2020)
Summary: Kim Jangwook is a dedicated Korean developer...
```

`output_schema`를 사용하면 `response.content`가 문자열이 아니라 실제 Pydantic 인스턴스를 반환한다. 파싱이 내부에서 처리되고, 타입 힌트가 그대로 IDE에서 자동완성된다. [PydanticAI 튜토리얼에서 다룬 `output_type`](/ko/blog/ko/pydantic-ai-type-safe-agent-tutorial-2026)과 비슷한 방향이지만, 파라미터 이름이 다르다.

레이턴시도 주목할 만하다. Calculator나 Wikipedia 호출이 들어간 에이전트는 9〜10초가 걸렸는데, 구조화 출력만 쓰는 에이전트는 4초였다. 도구 호출 왕복이 없으니 당연한 결과다.

## 멀티 에이전트 팀: members=, 그리고 mode="coordinate"

Agno의 멀티 에이전트는 `Team` 클래스로 구성한다.

```python
from agno.team import Team

researcher = Agent(
    name="Researcher",
    model=Gemini(id="gemini-2.5-flash"),
    tools=[WikipediaTools()],
    description="Wikipedia에서 정보를 조사한다.",
    role="researcher",
)

calculator = Agent(
    name="Calculator",
    model=Gemini(id="gemini-2.5-flash"),
    tools=[CalculatorTools()],
    description="수치 계산 담당.",
    role="calculator",
)

team = Team(
    members=[researcher, calculator],  # ← agents= 아님
    model=Gemini(id="gemini-2.5-flash"),
    name="Research & Calc Team",
    mode="coordinate",
)
```

또 하나의 API 트랩이 있다. `Team(agents=[...])` 이라고 쓰면 `TypeError: Team.__init__() got an unexpected keyword argument 'agents'`가 나온다. 올바른 파라미터는 `members=[...]`다. 직접 부딪혀봐야 알 수 있는 차이다.

실행:

```python
response = team.run(
    "Attention is All You Need 논문이 발표된 연도를 Wikipedia에서 찾고, "
    "2026년 현재까지 몇 년이 지났는지 계산해줘."
)
print(response.content)
```

결과:

```
INFO Searching wikipedia for: Attention is All You Need
⏱ 13.83s

"Attention is All You Need" 논문은 2017년에 발표되었으며, 
2026년 현재까지 9년이 지났습니다.
```

coordinate 모드에서 팀 리더(model 파라미터로 지정한 Gemini)가 태스크를 분석해 Researcher와 Calculator에게 적절히 위임했다. 실제 Wikipedia 검색이 실행됐고, 2026 - 2017 = 9년 계산도 정확히 나왔다. 레이턴시가 약 14초인 건 여러 에이전트를 순차적으로 호출했기 때문이다.

## 100개가 넘는 내장 도구

Agno의 숨은 강점 중 하나다. 설치 직후 `agno.tools` 패키지를 보면 아래 같은 목록이 나온다.

```python
import agno.tools as t
import pkgutil
tools = [name for _, name, _ in pkgutil.iter_modules(t.__path__)]
# 결과: ['arxiv', 'bravesearch', 'calculator', 'csv_toolkit', 
#         'dalle', 'docker', 'duckduckgo', 'email', 'github',
#         'gmail', 'google_bigquery', 'google_drive', 'jira',
#         'mcp', 'mem0', 'notion', 'postgres', 'python',
#         'slack', 'sql', 'tavily', 'telegram', 'wikipedia',
#         'yfinance', 'youtube', ... 총 100개 이상]
```

이게 실질적으로 의미하는 건, "Agno + BRAVE_API_KEY"만 있으면 웹 검색 에이전트가 5분 안에 돌아간다는 것이다. 외부 API를 직접 래핑하는 코드를 쓸 필요가 없다.

단, 모든 도구가 추가 설치 없이 바로 쓸 수 있는 건 아니다. `ddgs`, `wikipedia`, `google-genai`, `yfinance` 등 각 도구가 의존하는 패키지를 별도로 설치해야 한다. 가져오기 시점에 에러가 아니라 import 성공 후 실제 호출 시점에 에러가 나는 경우도 있어서, 처음에 어떤 패키지가 필요한지 파악하는 데 시간이 걸렸다.

특히 실무에서 많이 쓸 것 같은 도구들을 카테고리별로 정리해봤다.

| 카테고리 | 주요 도구 | 필요 패키지 |
|---------|---------|----------|
| 검색 | bravesearch, duckduckgo, tavily | ddgs, brave SDK |
| 데이터 | postgres, sql, duckdb, csv_toolkit | 각 DB 드라이버 |
| 협업 | slack, notion, jira, github | 각 API 키 |
| LLM/AI | mem0, mcp, dalle | 각 SDK |
| 금융 | yfinance, financial_datasets | yfinance |
| 코드 | python, shell, docker | — |

`python` 도구는 흥미롭다. 에이전트가 Python 코드를 직접 실행할 수 있게 해주는데, 샌드박스 없이 호스트에서 실행되기 때문에 신뢰된 환경에서만 써야 한다. Smolagents의 코드 에이전트와 비슷한 개념인데 안전성 측면에서는 더 주의가 필요하다.

`mcp` 도구도 눈에 띈다. Agno 에이전트를 MCP 서버에 연결하는 인터페이스로, 기존에 구축해둔 MCP 서버의 도구들을 Agno 에이전트에서 그대로 쓸 수 있다면 중복 작업이 크게 줄어든다. 아직 직접 테스트는 못 했지만 다음 실험 목록 최상단에 올려뒀다.

## 내가 느낀 한계와 아쉬운 점

솔직히 좋은 것만 있진 않았다.

**레이턴시가 예상보다 높다.** Calculator 한 번 호출에 9초, 멀티 에이전트는 14초였다. 이건 Agno 자체보다는 Gemini API 왕복 비용과 도구 호출 구조의 문제지만, 프로덕션에서 응답 시간이 중요한 서비스라면 고려해야 한다.

**디버깅이 편하지 않다.** `debug_mode=True`로 설정하면 로그가 많이 찍히는데, 형식이 정형화되어 있지 않아 파싱하기가 어렵다. LangSmith나 LangFuse 같은 외부 트레이싱 도구와 연동하는 공식 가이드를 아직 못 찾았다.

**문서와 API의 버전 불일치.** `show_tool_calls`, `output_model`, `agents=` 같은 파라미터 이름이 문서에는 남아 있는데 실제 코드에서는 사라졌거나 의미가 바뀐 경우가 있었다. Agno가 빠르게 발전하는 만큼 공식 GitHub의 examples/ 폴더를 항상 최신 버전 기준으로 확인하는 게 안전하다.

**Team의 coordinate 모드는 항상 순차 실행이다.** 병렬 실행이 되는지 확인해봤는데, v2.6.17 기준으로 `coordinate` 모드는 순차적으로 에이전트를 호출한다. Google ADK나 LangGraph처럼 병렬 분기가 필요하면 [구글 ADK vs LangGraph 비교 글](/ko/blog/ko/google-adk-vs-langgraph-agent-framework-comparison-2026)을 참고하길 권한다.

## 언제 Agno를 쓰면 좋은가

내 생각엔 Agno가 가장 잘 맞는 시나리오는 세 가지다.

**빠른 프로토타이핑.** Gemini(또는 OpenAI) API 키만 있으면 에이전트를 10줄로 만들 수 있다. 검증용 PoC, 내부 도구, 1인 프로젝트에서 속도가 중요할 때.

**멀티 도구 에이전트.** 100개 넘는 내장 도구가 있고 API 키 주입만 하면 쓸 수 있다. Slack, Gmail, Notion, GitHub, Postgres 같은 실무 도구를 에이전트로 연결하는 작업에서 강하다.

**단일 에이전트 또는 소규모 팀.** Agent 2〜3개를 Team으로 묶는 정도는 Agno가 깔끔하다. 수십 개 에이전트를 복잡한 의존성으로 오케스트레이션해야 한다면, LangGraph나 Microsoft AutoGen처럼 상태 그래프 기반 프레임워크가 더 적합할 수 있다.

반대로 Agno를 피해야 하는 상황도 있다. 실시간 스트리밍이 중요한 서비스, 정밀한 에러 핸들링과 retry 로직이 필요한 프로덕션 워크플로우, 복잡한 조건부 분기가 많은 에이전트 그래프. 이런 케이스에서는 추상화가 오히려 방해가 된다.

## PydanticAI와 간략 비교

비슷한 포지션의 프레임워크 중 [PydanticAI](/ko/blog/ko/pydantic-ai-type-safe-agent-tutorial-2026)가 있다. 실제 코드를 써본 입장에서 느낀 가장 큰 차이점을 정리하면 이렇다.

**도구 생태계**: Agno는 100개 이상의 내장 도구가 있고, PydanticAI는 직접 함수를 `@agent.tool` 데코레이터로 등록하는 방식이다. Agno 쪽이 "빠른 시작"에 유리하고, PydanticAI는 도구 로직을 더 명확하게 제어하고 싶을 때 낫다.

**타입 안전성**: PydanticAI가 더 강하다. 에이전트의 응답 타입이 제네릭으로 선언되어 있어서 IDE에서 오류를 잡기 쉽다. Agno의 `output_schema`도 작동하지만, API 네이밍이 PydanticAI만큼 명확하지 않다.

**멀티 에이전트**: Agno가 내장 `Team` 클래스로 더 자연스럽다. PydanticAI는 에이전트 간 통신을 직접 구성해야 한다.

**의존성**: 비슷하게 가볍다. 둘 다 LangChain보다 훨씬 가볍다.

선택 기준이 복잡하다고 느낀다면 [Python AI 에이전트 라이브러리 비교 글](/ko/blog/ko/python-ai-agent-library-comparison-2026)을 함께 보면 더 명확한 결론에 도달할 수 있다.

## 다음에 해볼 것

오늘 한 실험에서 시도하지 못한 것이 두 가지 있다.

하나는 Agno의 Agent Memory 시스템이다. `enable_agentic_memory=True`와 함께 SQLite 기반 메모리를 에이전트에 붙이는 기능이 있는데, 멀티 세션에 걸쳐 정보를 유지하는 에이전트를 만들 때 핵심이 될 것 같다. 특히 사용자 선호나 이전 대화 맥락을 기억해야 하는 챗봇 류 에이전트에서 유용할 것 같다.

다른 하나는 MCP 도구 통합이다. `agno.tools.mcp`가 있다. Agno 에이전트가 MCP 서버에 연결해서 도구를 호출하는 구성이 가능하다면, 기존에 만들어둔 MCP 서버를 그대로 재사용할 수 있다는 의미다. 현재 진행 중인 프로젝트에서 MCP 서버를 여러 개 운용하고 있는데, 그 위에 Agno 에이전트를 얹을 수 있다면 통합 비용이 많이 줄어든다. 이건 실제로 해보고 싶다.

## 정리

- Agno v2.6.17: pip install agno로 설치, Calculator/Wikipedia/Team 모두 실제 동작 확인
- `gemini-2.5-flash`가 현재 유효한 모델 ID (2.0-flash는 deprecated)
- 구조화 출력: `output_schema=PydanticModel` (output_model 아님)
- Team: `members=[...]` (agents= 아님)
- 내장 툴 100개 이상, 추가 의존성은 각각 설치 필요
- 빠른 프로토타이핑과 멀티 툴 에이전트에 강점, 복잡한 상태 머신은 LangGraph 계열이 낫다

가볍고 직관적인 API라는 인상을 받았다. LangChain이 지겨워진 Python 개발자에게 한 번 써볼 가치가 있는 프레임워크다.
