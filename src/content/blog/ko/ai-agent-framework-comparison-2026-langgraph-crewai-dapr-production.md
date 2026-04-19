---
title: AI 에이전트 프레임워크 비교 2026 — LangGraph vs CrewAI vs Dapr Agents 프로덕션 선택 기준
description: >-
  LangGraph v1.0, CrewAI v1.10, Dapr Agents v1.0을 실제 프로덕션 기준으로 비교합니다. 각 프레임워크의
  아키텍처, 개발 속도, 운영 내구성, 비용을 분석해 내 팀에 맞는 선택 기준을 제시합니다.
pubDate: '2026-04-19'
heroImage: >-
  ../../../assets/blog/ai-agent-framework-comparison-2026-langgraph-crewai-dapr-production-hero.jpg
tags:
  - ai-agent
  - langgraph
  - crewai
  - dapr
  - multi-agent
relatedPosts:
  - slug: dapr-agents-v1-cncf-production-ai-framework
    score: 0.96
    reason:
      ko: 이 글에서 비교한 Dapr Agents의 durable workflow 철학을 더 깊이 파고들고 싶다면, Dapr Agents v1.0 GA 분석 포스트가 출발점이다.
      ja: この記事で比較したDapr AgentsのDurable Workflowの哲学をさらに深く掘り下げたい場合、Dapr Agents v1.0 GA分析記事が出発点になる。
      en: If you want to go deeper on the Dapr Agents durable workflow philosophy compared here, the Dapr Agents v1.0 GA analysis is the natural next read.
      zh: 如果想深入了解本文比较的Dapr Agents持久工作流哲学，Dapr Agents v1.0 GA分析文章是最佳出发点。
  - slug: claude-agent-teams-guide
    score: 0.93
    reason:
      ko: LangGraph와 CrewAI의 팀 구성 방식이 실제 Claude 에이전트 팀에서 어떻게 구현되는지 비교해보면 프레임워크 선택의 감이 온다.
      ja: LangGraphとCrewAIのチーム構成方式が実際のClaudeエージェントチームでどう実装されるか比較すると、フレームワーク選択の感覚が掴める。
      en: Seeing how LangGraph and CrewAI team patterns translate to real Claude agent team implementations gives you the intuition for framework selection.
      zh: 了解LangGraph和CrewAI的团队构建方式在实际Claude智能体团队中如何实现，有助于建立框架选择的直觉。
  - slug: mcp-gateway-agent-traffic-control
    score: 0.91
    reason:
      ko: CrewAI v1.10의 MCP 네이티브 지원이 실제로 어떤 의미인지 이해하려면, MCP Gateway로 에이전트 트래픽을 제어하는 방법을 함께 읽어야 그림이 완성된다.
      ja: CrewAI v1.10のMCPネイティブサポートが実際に何を意味するか理解するには、MCPゲートウェイでエージェントトラフィックを制御する方法を合わせて読むと全体像が見えてくる。
      en: To understand what CrewAI v1.10's native MCP support actually means in practice, reading about MCP Gateway traffic control completes the picture.
      zh: 要理解CrewAI v1.10原生MCP支持在实践中的真正含义，结合阅读MCP Gateway流量控制文章能让全貌更清晰。
---

"어떤 에이전트 프레임워크를 써야 하나요?"

올해 들어 이 질문을 가장 많이 받는다. 2025년까지만 해도 "LangGraph냐 CrewAI냐" 정도였는데, Dapr Agents v1.0이 KubeCon Europe 2026에서 GA를 발표하면서 선택지가 하나 더 늘었다. 그리고 세 프레임워크 모두 이제 v1.0 이상의 안정 버전이라, 예전처럼 "실험적이라 프로덕션엔 쓰기 어렵다"는 핑계도 통하지 않는다.

솔직히 말하면, 나는 이 비교 글을 쓰는 게 조금 불편하다. 세 가지 모두 써봤고, 세 가지 모두 쓸 만하다. 그러니 "X가 최고"라는 식의 결론은 거짓이다. 대신 "어떤 상황에서 어느 것이 덜 나쁜가"를 이야기하려 한다.

## LangGraph v1.0 — 그래프로 모든 걸 제어하고 싶다면

LangGraph는 에이전트를 **방향 그래프의 노드**로 모델링한다. 노드는 실행 단위, 엣지는 전환 조건, 상태(state)는 노드 간에 공유되는 데이터다. 이 접근법의 강점은 "실행 흐름의 완전한 가시성"이다.

```python
from langgraph.graph import StateGraph, END
from typing import TypedDict, Annotated
import operator

class AgentState(TypedDict):
    messages: Annotated[list, operator.add]
    next_step: str

def research_agent(state: AgentState):
    # 리서치 수행
    result = llm.invoke(state["messages"])
    return {"messages": [result], "next_step": "writer"}

def writer_agent(state: AgentState):
    # 작성 수행
    result = llm.invoke(state["messages"])
    return {"messages": [result], "next_step": "END"}

def should_continue(state: AgentState):
    return state["next_step"]

graph = StateGraph(AgentState)
graph.add_node("researcher", research_agent)
graph.add_node("writer", writer_agent)
graph.add_conditional_edges("researcher", should_continue)
graph.add_edge("writer", END)
```

위 코드는 간단해 보이지만, 현실에서는 60〜100줄이 된다. 분기 조건이 많아질수록, 상태 스키마가 복잡해질수록 코드는 늘어난다. 이건 LangGraph의 단점이기도 하고, 동시에 강점이기도 하다. **코드가 길다는 건 제어 흐름이 명시적이라는 뜻**이기 때문이다.

내가 직접 써봤을 때 가장 좋았던 점: LangSmith와의 통합. 에이전트가 왜 이 노드로 갔는지, 어떤 상태값을 가지고 갔는지 트레이스를 한 줄씩 볼 수 있다. 프로덕션에서 에이전트가 이상하게 행동할 때 디버깅이 가능한 프레임워크는 LangGraph가 유일하다고 느꼈다.

**LangGraph v1.0의 주요 특징:**
- **Durable Checkpointing**: 실행 중간 상태를 저장해 중단 후 재개 가능
- **Human-in-the-Loop**: 그래프 중간에 사람의 승인 단계를 자연스럽게 삽입
- **Streaming 지원**: 각 노드의 중간 출력을 실시간으로 스트리밍
- **LangSmith 통합**: 프로덕션 트레이싱과 에러 분석

아쉬운 점도 있다. **초기 학습 곡선이 가파르다.** TypedDict로 상태 스키마를 정의하고, 그래프 구조를 머릿속에 그리면서 코드를 짜는 것이 익숙해지기까지 시간이 걸린다. 또 LangChain 생태계에 묶여 있어서, LangChain이 아닌 다른 LLM 클라이언트를 쓰고 싶을 때 래퍼 작업이 필요하다.

**LangGraph의 Human-in-the-Loop 패턴** — 이 기능이 LangGraph를 선택하는 핵심 이유 중 하나다. 승인이 필요한 지점에서 그래프 실행을 일시 정지하고, 사람의 피드백을 받은 다음 재개하는 패턴이다.

```python
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver

# 체크포인터로 상태 저장
checkpointer = MemorySaver()

def draft_review(state: AgentState):
    # 초안 생성 후 사람에게 리뷰 요청
    draft = generate_draft(state["messages"])
    return {"messages": [draft], "awaiting_approval": True}

def apply_feedback(state: AgentState, human_input: str):
    # 사람 피드백 반영
    return {"messages": state["messages"] + [human_input], "awaiting_approval": False}

graph = StateGraph(AgentState)
graph.add_node("draft", draft_review)
graph.add_node("feedback", apply_feedback)
# interrupt_before로 해당 노드 전에 실행 일시 정지
graph.compile(checkpointer=checkpointer, interrupt_before=["feedback"])
```

이 구조는 코드 리뷰 자동화, 콘텐츠 승인 워크플로우, 의료·법률 분야의 AI 지원 시스템에서 특히 유용하다. "AI가 대부분 하고 사람이 최종 검수하는" 구조를 코드로 명시적으로 표현할 수 있기 때문이다.

**LangGraph가 맞는 상황:**
- 승인 게이트, 조건 분기, 루프가 복잡한 워크플로우
- 프로덕션에서 에이전트 행동을 추적하고 감사(audit)해야 할 때
- 팀 규모가 크고 에이전트 로직을 명시적으로 문서화해야 할 때
- 사람과 AI가 협력하는 하이브리드 워크플로우

## CrewAI v1.10 — 역할 기반으로 빠르게 만들어야 한다면

CrewAI의 핵심 아이디어는 간단하다: "에이전트 문제를 역할과 팀으로 생각하라." 리서처, 작가, 편집자를 각각 정의하고, 이들이 협력해 목표를 달성한다.

```python
from crewai import Agent, Task, Crew, Process

researcher = Agent(
    role='Senior Research Analyst',
    goal='Find accurate, up-to-date information on AI frameworks',
    backstory='You have 10 years of experience analyzing AI tools and frameworks.',
    verbose=True,
    tools=[search_tool, web_scraper]
)

writer = Agent(
    role='Technical Writer',
    goal='Write clear, developer-friendly comparison guides',
    backstory='You specialize in translating complex technical concepts.',
    verbose=True
)

research_task = Task(
    description='Research LangGraph, CrewAI, Dapr Agents current capabilities',
    agent=researcher,
    expected_output='Structured comparison data with key metrics'
)

write_task = Task(
    description='Write a developer guide based on research findings',
    agent=writer,
    expected_output='Complete comparison guide in markdown'
)

crew = Crew(
    agents=[researcher, writer],
    tasks=[research_task, write_task],
    process=Process.sequential
)
```

이 정도면 30분 안에 동작하는 멀티에이전트 시스템을 만들 수 있다. [Claude Code 에이전틱 워크플로우 패턴](/ko/blog/ko/claude-code-agentic-workflow-patterns-5-types)에서 다룬 역할 기반 에이전트 패턴과 매우 유사한 접근법이다.

CrewAI v1.10.1에서 추가된 기능:
- **MCP(Model Context Protocol) 지원**: MCP 서버를 도구로 직접 연결 가능
- **A2A(Agent-to-Agent) 프로토콜**: 다른 프레임워크의 에이전트와 통신 가능
- **스트리밍**: 에이전트 응답을 실시간으로 수신
- **계층적 프로세스**: Manager 에이전트가 다른 에이전트를 지휘하는 구조

2026년 벤치마크에서 CrewAI는 LangGraph 대비 **개발 시간 40% 단축**, 동일한 5단계 리서치 워크플로우에서 **45초 vs 68초** 레이턴시 우위를 보였다. 하지만 같은 작업에서 토큰을 약 18% 더 소비한다. 이건 CrewAI의 role/backstory 정의와 내부 프롬프트 오버헤드 때문이다.

내가 솔직히 느낀 CrewAI의 한계: **실패 시나리오 처리가 약하다.** 에이전트 하나가 예외를 던지면 전체 크루가 멈추거나, 기대하지 않은 방향으로 재시도한다. 프로덕션에서 이 부분이 가장 불안했다. LangGraph처럼 조건 엣지로 실패를 잡아서 다른 노드로 라우팅하는 구조가 없다.

또 **메모리 관리가 크루 단위**라 장기 실행 에이전트에는 맞지 않는다. 하루 이상 돌아가야 하는 에이전트라면 처음부터 Dapr나 LangGraph를 선택하는 게 낫다.

**CrewAI v1.10의 계층적 프로세스** — 단순 순차 실행을 넘어 Manager 에이전트가 작업을 동적으로 위임하는 구조다.

```python
from crewai import Agent, Task, Crew, Process

manager = Agent(
    role='Project Manager',
    goal='Coordinate research and writing tasks efficiently',
    backstory='Experienced project manager who knows how to delegate effectively.',
    allow_delegation=True  # 다른 에이전트에게 작업 위임 허용
)

crew = Crew(
    agents=[manager, researcher, writer, editor],
    tasks=[main_task],
    process=Process.hierarchical,  # 계층적 프로세스
    manager_agent=manager  # 매니저 명시적 지정
)
```

Manager 에이전트가 들어오는 작업을 분해하고, 적절한 전문가에게 서브태스크를 할당한다. 이 패턴은 CrewAI가 단순 시퀀셜 파이프라인을 넘어 진정한 멀티에이전트 오케스트레이션을 구현할 수 있게 해준다.

중요한 관찰 하나: CrewAI가 MCP를 네이티브로 지원하면서, 에이전트 도구와 외부 서비스 간 경계가 거의 사라졌다. 이전에는 별도로 래퍼를 만들어야 했던 외부 API 연동이 MCP 서버로 일원화된다. 이 변화가 실제로 얼마나 중요한지는 [MCP Gateway로 에이전트 트래픽을 제어하는 방법](/ko/blog/ko/mcp-gateway-agent-traffic-control)에서 다룬 아키텍처를 보면 감이 온다.

**CrewAI가 맞는 상황:**
- 빠르게 프로토타입을 만들어야 할 때
- 역할이 명확히 정의된 워크플로우 (콘텐츠 파이프라인, 고객 지원 트리아지 등)
- 팀이 AI 에이전트에 익숙하지 않아 직관적인 API가 필요할 때
- MCP 생태계의 외부 도구를 에이전트에 빠르게 통합하고 싶을 때

## Dapr Agents v1.0 — Kubernetes에서 살아남아야 한다면

Dapr Agents는 철학이 다르다. LangGraph나 CrewAI가 "에이전트를 어떻게 똑똑하게 만들 것인가"를 고민한다면, Dapr Agents는 "에이전트를 어떻게 살아있게 만들 것인가"를 고민한다.

2026년 4월 기준 MCP 프로덕션 환경 조사에서 2,181개 엔드포인트 중 52%가 배포 후 사망 상태였다는 수치를 본 적 있다. Dapr Agents가 존재하는 이유가 이 숫자에 있다.

```python
from dapr_agents import Agent, tool
from dapr_agents.workflow import AgentWorkflow

@tool
def search_documentation(query: str) -> str:
    """Search technical documentation"""
    return search_api.search(query)

@tool
def create_ticket(title: str, description: str) -> str:
    """Create a support ticket"""
    return jira_api.create(title=title, description=description)

# Dapr의 durable workflow 위에서 실행
workflow = AgentWorkflow(
    agents=[
        Agent(name="triage", tools=[search_documentation]),
        Agent(name="creator", tools=[create_ticket])
    ],
    workflow_id="support-pipeline-001"
)

# 노드가 재시작되어도 workflow_id로 상태 복원
result = await workflow.run("Handle customer support ticket #4521")
```

핵심 차별점은 **워크플로우 ID**다. 프로세스가 죽어도, Pod가 재시작되어도, 동일한 `workflow_id`로 실행하면 중단된 지점부터 재개된다. 이건 Redis나 PostgreSQL 같은 외부 스토어에 상태를 저장하기 때문에 가능한 일이다. Dapr는 30개 이상의 상태 저장소를 플러그인 방식으로 지원한다.

[Dapr Agents v1.0 GA 분석 포스트](/ko/blog/ko/dapr-agents-v1-cncf-production-ai-framework)에서 더 자세히 다뤘지만, 핵심은 CNCF 생태계와의 통합이다. Prometheus, OpenTelemetry, Kubernetes RBAC — Dapr를 이미 쓰는 팀이라면 에이전트 레이어를 추가하는 비용이 매우 낮다.

하지만 Dapr Agents를 권하지 않는 상황도 분명하다. **Kubernetes를 아직 안 쓰는 팀에겐 오버킬이다.** Dapr 자체를 설치하고, 사이드카 패턴을 이해하고, 상태 저장소를 구성하는 것만으로 주 단위 작업이 될 수 있다. 또 **Python 기반 에이전트 로직만 지원**하고 TypeScript나 Go로 직접 에이전트를 작성하는 것은 아직 제한적이다.

**Dapr Agents의 멀티에이전트 조율 방식** — 단순한 에이전트 연결을 넘어, 서로 다른 전문 에이전트들이 pub/sub 메시지를 통해 느슨하게 결합되는 구조다.

```python
from dapr_agents import Agent, AgentWorkflow
from dapr.clients import DaprClient

# 에이전트들은 pub/sub를 통해 서로 통신
class TriageAgent(Agent):
    async def on_message(self, message: dict):
        # 메시지 분류 후 적절한 에이전트에게 라우팅
        severity = self.classify_severity(message)
        await self.publish("ticket-routing", {
            "ticket": message,
            "route_to": f"{severity}-handler"
        })

class CriticalHandler(Agent):
    async def on_message(self, message: dict):
        # 크리티컬 티켓 처리 후 상태 저장
        result = await self.resolve_critical(message["ticket"])
        await self.save_state(f"ticket-{message['ticket']['id']}", result)
```

이 pub/sub 기반 멀티에이전트 패턴은 에이전트 사이의 직접 의존성을 제거한다. 트리아지 에이전트가 크리티컬 핸들러의 주소나 상태를 알 필요가 없다. 그저 메시지를 발행하면, Dapr가 올바른 에이전트에게 라우팅한다. 이 아키텍처는 에이전트를 독립적으로 스케일 아웃하고, 특정 에이전트가 죽어도 전체 시스템이 멈추지 않게 한다.

실제로 Diagrid(Dapr의 상업 지원사)에 따르면, 금융·의료·물류 분야에서 Dapr Agents를 프로덕션에 적용한 기업들의 공통점은 "기존 Kubernetes 인프라에 이미 Dapr를 운영 중"이었다는 점이다. 이 조건이 없다면 채택 비용이 급격히 올라간다.

**Dapr Agents가 맞는 상황:**
- 이미 Kubernetes + Dapr를 사용하는 인프라 팀
- 24/7 장기 실행 에이전트 (SLA가 있는 업무 자동화)
- 에이전트 실패 복구가 비즈니스 크리티컬한 환경
- 에이전트 간 느슨한 결합(loose coupling)이 필요한 대규모 시스템

## 세 프레임워크 한눈에 비교

| 항목 | LangGraph v1.0 | CrewAI v1.10 | Dapr Agents v1.0 |
|------|---------------|-------------|-----------------|
| **코드 복잡도** | 높음 (60〜100줄) | 낮음 (20〜30줄) | 중간 (40〜60줄) |
| **학습 곡선** | 가파름 | 완만 | 중간 (Dapr 지식 필요) |
| **프로토타입 속도** | 느림 | 빠름 (40% 우위) | 중간 |
| **프로덕션 내구성** | 높음 | 중간 | 최고 (durable workflow) |
| **장기 실행** | 가능 | 부적합 | 최적화 |
| **관찰가능성** | LangSmith 통합 | 기본 로깅 | OpenTelemetry 완전 통합 |
| **Kubernetes 의존성** | 없음 | 없음 | 강함 |
| **MCP 지원** | 외부 도구로 가능 | v1.10.1 네이티브 | 플러그인 방식 |
| **A2A 프로토콜** | 계획 중 | v1.10.1 지원 | 네이티브 |
| **토큰 오버헤드** | 낮음 | 중간 (+18%) | 낮음 |

## 내 기준에서 고르는 법

프레임워크 선택을 묻는 사람에게 나는 세 가지 질문을 던진다.

**1. 지금 당장 동작하는 게 필요한가, 아니면 6개월 뒤에도 살아있는 게 필요한가?**

지금 당장이라면 CrewAI. 6개월 뒤가 더 중요하다면 LangGraph나 Dapr. 이 둘의 선택은 아래 질문으로 나뉜다.

**2. Kubernetes를 이미 운영하는가?**

예스라면 Dapr Agents를 진지하게 검토해라. Dapr가 이미 배포되어 있다면 에이전트 레이어 추가 비용이 거의 없다. 아니라면 LangGraph.

**3. 에이전트 워크플로우가 조건 분기와 루프가 많은가, 아니면 순차적인 역할 분담인가?**

전자라면 LangGraph의 그래프 모델이 필요하다. 후자라면 CrewAI나 Dapr Agents 둘 다 괜찮다.

나는 현재 이 블로그 자동화 시스템에서 **LangGraph 기반 접근**을 가장 많이 참고하고 있다. [Stripe가 1,300개 PR을 자율 에이전트로 처리한 사례](/ko/blog/ko/stripe-minions-autonomous-coding-agents-1300-prs)를 보면 이들도 복잡한 분기 처리가 필요한 곳에는 그래프 기반 접근을 선택했다. 그라운드 트루스는 항상 "어떤 프레임워크를 쓰느냐"가 아니라 "어떻게 쓰느냐"에 있다.

## 비용과 운영 고려사항

세 프레임워크의 비용 구조는 생각보다 많이 다르다.

**LangGraph**: LangSmith를 함께 쓰면 LangSmith 구독 비용이 추가된다. 개발 팀 기준 월 $39/사용자 수준이다. LangSmith 없이도 동작하지만, 프로덕션 디버깅 능력이 크게 떨어진다. 오픈소스 자체는 무료다.

**CrewAI**: 오픈소스 무료. CrewAI Cloud(crewai.com)를 쓰면 관리형 실행 환경을 제공하지만, 대부분 팀은 자체 인프라에서 실행한다. 토큰 비용이 18% 더 높다는 점을 감안하면, 월 $10,000 LLM API 비용의 팀은 CrewAI 대신 LangGraph를 쓸 때 매월 약 $1,800을 절약할 수 있다.

**Dapr Agents**: Dapr 자체는 오픈소스 무료지만, Kubernetes 클러스터 운영 비용이 만만치 않다. 최소 3노드 클러스터 기준 AWS EKS 비용은 월 $200〜400부터 시작한다. Diagrid의 관리형 Dapr Cloud를 쓰면 Kubernetes 없이도 Dapr Agents를 실행할 수 있지만, 이 경우 추가 구독 비용이 발생한다.

**숨겨진 비용**: 프레임워크 전환 비용도 고려해야 한다. 팀이 이미 CrewAI로 10개의 워크플로우를 구축했다면, 이를 LangGraph로 전환하는 데 수 주가 걸릴 수 있다. 처음 선택이 나중에 기술 부채가 되는 구조다. 그래서 "일단 CrewAI로 시작하고 나중에 LangGraph로 옮기겠다"는 계획은 현실에서는 생각보다 잘 실행되지 않는다.

## 실제로 어느 팀이 무엇을 선택했나

내가 직접 관찰하거나 공개된 사례에서 확인한 패턴이다.

**LangGraph를 선택한 팀들의 공통점**: 대부분 AI 에이전트 관련 경험이 있는 팀이었다. 에이전트 디버깅 경험이 한 번이라도 있는 팀은 LangGraph의 트레이싱 기능을 본 순간 바로 필요성을 납득했다. "모르면 안 필요한 것, 알면 없으면 못 사는 것"이 LangSmith 통합이다.

**CrewAI를 선택한 팀들의 공통점**: 빠른 시장 출시가 필요하거나, AI 에이전트에 처음 도전하는 팀이 많았다. 역할과 팀이라는 메타포가 직관적이라, 비개발 직군(PM, 마케터)과의 협업에서도 개념 설명이 쉬웠다. 스타트업과 소규모 팀에서 더 많이 보였다.

**Dapr Agents를 선택한 팀들의 공통점**: 예외 없이 Kubernetes 운영 경험이 있는 인프라 중심 팀이었다. 에이전트를 "새로운 서비스 유형"으로 바라보는 팀이 Dapr Agents에 끌렸다. 금융, 헬스케어, 엔터프라이즈 SaaS 분야에서 주로 보였다.

## 마이그레이션 전략 — 빠르게 시작하고 필요한 부분만 강화하기

세 가지 모두 처음부터 선택하는 게 부담스럽다면, 이 순서가 실용적이다.

**Phase 1**: CrewAI로 빠르게 프로토타입 (1〜2주)
**Phase 2**: 실패가 잦거나 복잡한 분기가 필요한 부분을 LangGraph로 리팩토링 (2〜4주)
**Phase 3**: SLA가 요구되는 장기 실행 에이전트를 Dapr Agents로 마이그레이션 (필요 시)

CrewAI는 LangChain 호환이라 LangGraph와 혼용이 가능하다. 이건 점진적 마이그레이션을 가능하게 하는 중요한 특성이다. 처음부터 모든 걸 한 번에 결정하지 않아도 된다.

실제로 이 전략을 성공적으로 실행한 팀에서 보면, Phase 2에서 LangGraph로 옮기는 워크플로우는 보통 "실패가 잦은 것"보다 "비즈니스에 중요한 것"이었다. 에러 율이 아니라 중요도 기준으로 전환 우선순위를 정하는 게 합리적이다.

## 2026년 하반기 로드맵 — 각 프레임워크의 다음 스텝

이 비교는 2026년 4월 기준이다. 각 프레임워크가 이후 어떤 방향으로 가는지도 선택에 영향을 준다.

**LangGraph**: LangChain Inc는 LangGraph의 서버리스 배포 옵션(LangGraph Cloud)을 확대하고 있다. 자체 인프라 없이 LangGraph 에이전트를 API로 노출하는 방향이다. TypeScript 지원도 Python 수준으로 끌어올리는 중이다.

**CrewAI**: A2A 프로토콜 지원이 v1.10.1에 들어온 건 의미 있다. 다른 프레임워크로 만든 에이전트와 통신이 가능해지면, "CrewAI 에이전트 + Dapr의 내구성"을 조합하는 하이브리드 아키텍처가 가능해진다. 아직 실험적이지만 가능성이 있다.

**Dapr Agents**: Python 외에 TypeScript 공식 지원이 로드맵에 있다. 이게 릴리스되면 현재 가장 큰 단점 중 하나가 해소된다. 또 Dapr Agents를 Kubernetes 없이 단독으로 실행하는 로컬 개발 모드도 개선 중이다.

세 프레임워크 모두 2026년 하반기에 상당한 업데이트가 예정되어 있다. 지금 당장의 기능 비교만으로 결정하기보다는, 커뮤니티 활동, 이슈 트래커, 로드맵을 함께 봐야 6개월 후의 모습을 예측할 수 있다.

## 결론 — 정답은 없지만 기준은 있다

솔직히 2026년 기준으로 세 프레임워크 모두 프로덕션에 쓸 수 있다. LangGraph v1.0, CrewAI v1.10.1, Dapr Agents v1.0 — 모두 GA를 발표한 안정 버전이다.

내가 이 글에서 의도적으로 하지 않은 것이 있다: "이걸 써라"라는 단정. 이 비교를 쓰면서 직접 세 가지를 다 써봤고, 각각의 상황에서 각각이 더 나았다. 누가 "어느 게 최고예요?"라고 물으면 나는 아직도 "상황에 따라 다르다"고 답한다. 그게 정직한 답이기 때문이다.

내가 강하게 말할 수 있는 건 하나다: **아직 MCP 통합이 안 된 에이전트 시스템을 운영 중이라면 지금이 재검토할 타이밍이다.** CrewAI가 v1.10.1에서 MCP를 네이티브로 지원하면서, 에이전트 프레임워크와 외부 도구 생태계의 경계가 빠르게 허물어지고 있다.

어떤 프레임워크를 선택하든, 내가 경험한 공통 조언은 하나다: **상태 관리 전략부터 정하라.** 에이전트가 어디서 상태를 읽고 어디에 쓰는지, 실패 시 어떻게 복구하는지 — 이걸 프레임워크 선택보다 먼저 결정해야 나중에 교체 비용이 줄어든다. 프레임워크는 교체할 수 있지만, 잘못 설계된 상태 관리는 전체 시스템을 재설계해야 고칠 수 있다.
