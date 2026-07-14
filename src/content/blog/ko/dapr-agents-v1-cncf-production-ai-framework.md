---
title: Dapr Agents v1.0 GA — AI 에이전트를 Kubernetes에서 죽지 않게 만드는 법
description: >-
  KubeCon Europe 2026에서 발표된 Dapr Agents v1.0의 durable workflow, 자동 복구,
  scale-to-zero를 분석하고, 기존 에이전트 프레임워크와의 차이를 짚어봅니다.
pubDate: '2026-03-24'
heroImage: ../../../assets/blog/dapr-agents-v1-cncf-production-ai-framework-hero.png
tags:
  - ai-agent
  - kubernetes
  - cloud-native
  - dapr
  - production
relatedPosts:
  - slug: claude-agent-teams-guide
    score: 0.94
    reason:
      ko: '자동화, AI/ML, DevOps, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、DevOps、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, DevOps, architecture with
        comparable difficulty.
      zh: 在自动化、AI/ML、DevOps、架构领域涵盖类似主题，难度相当。
  - slug: claude-code-cli-migration-guide
    score: 0.94
    reason:
      ko: '자동화, AI/ML, DevOps, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、DevOps、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, DevOps, architecture with
        comparable difficulty.
      zh: 在自动化、AI/ML、DevOps、架构领域涵盖类似主题，难度相当。
  - slug: terraform-ai-batch-infrastructure
    score: 0.94
    reason:
      ko: '자동화, AI/ML, DevOps, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、DevOps、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, DevOps, architecture with
        comparable difficulty.
      zh: 在自动化、AI/ML、DevOps、架构领域涵盖类似主题，难度相当。
  - slug: github-agentic-workflows-cicd-ai
    score: 0.94
    reason:
      ko: '자동화, AI/ML, DevOps, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、DevOps、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, DevOps, architecture with
        comparable difficulty.
      zh: 在自动化、AI/ML、DevOps、架构领域涵盖类似主题，难度相当。
  - slug: openai-promptfoo-ai-agent-devsecops
    score: 0.94
    reason:
      ko: 'AI/ML, DevOps, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: AI/ML、DevOps、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in AI/ML, DevOps, architecture with comparable
        difficulty.
      zh: 在AI/ML、DevOps、架构领域涵盖类似主题，难度相当。
---

어제 KubeCon Europe 2026 암스테르담에서 Dapr Agents v1.0 GA가 발표됐다.

솔직히 처음 소식을 들었을 때 "또 에이전트 프레임워크야?"라는 생각이 먼저 들었다. LangGraph, CrewAI, AutoGen, OpenClaw까지 — 지금 에이전트 프레임워크가 몇 개인지 세는 것 자체가 무의미한 시대다. 그런데 Dapr Agents의 발표를 자세히 들여다보니, 이건 좀 결이 다르다. **에이전트의 "지능"이 아니라 "생존"에 집중한다.** 프로세스가 죽어도, 노드가 재시작돼도, 네트워크가 끊겨도 에이전트가 하던 일을 이어서 한다는 게 핵심이다.

## 왜 또 다른 프레임워크인가

대부분의 에이전트 프레임워크는 LLM 호출 로직에 집중한다. 프롬프트 체이닝, 도구 호출, [멀티에이전트 대화](/ko/blog/ko/claude-agent-teams-guide) — 전부 "에이전트가 뭘 할 것인가"에 대한 답이다. 그런데 프로덕션에서 에이전트를 돌려본 사람이라면 이런 경험이 있을 것이다.

- LLM API 호출 중간에 타임아웃이 나서 전체 워크플로우가 실패
- 에이전트가 3단계 중 2단계까지 처리했는데 Pod이 재시작돼서 처음부터 다시 실행
- 에이전트 10개를 동시에 띄우면 메모리가 터짐

Dapr Agents는 이 문제를 Dapr 런타임의 인프라 빌딩블록으로 해결한다. CNCF 프로젝트인 Dapr(GitHub 34K+ stars)가 이미 마이크로서비스에서 검증한 분산 시스템 패턴 — state management, pub/sub, service invocation — 을 에이전트에 그대로 적용한 것이다.

## 핵심: Durable Agent가 뭔가

가장 눈에 띄는 건 `DurableAgent` 클래스다. 일반적인 에이전트와 뭐가 다르냐면, 모든 LLM 호출과 도구 실행이 **체크포인트**로 저장된다. 워크플로우 중간에 프로세스를 kill해도, 재시작하면 마지막으로 저장된 지점부터 다시 실행된다.

```python
from dapr_agents import DurableAgent
from dapr_agents.workflow.runners import AgentRunner

weather_agent = DurableAgent(
    name="WeatherAgent",
    role="Weather Assistant",
    instructions=["Help users with weather information"],
    tools=[get_weather],
    llm=DaprChatClient(component_name="llm-provider"),
)

runner = AgentRunner()
runner.serve(weather_agent, port=8001)
```

이걸 Dapr CLI로 실행하면:

```bash
dapr run --app-id weather-agent --app-port 8001 \
  --resources-path ./components -- python agent.py
```

내부적으로는 Dapr의 **Virtual Actor 모델** 위에서 동작한다. 각 에이전트가 하나의 Actor로 표현되고, Actor는 스레드 세이프하면서 분산 환경에서 자동으로 배치된다. 수천 개의 에이전트를 단일 머신에서 돌려도 되고, Kubernetes 클러스터에 분산해도 된다. [GitHub Actions 기반 에이전트 워크플로우](/ko/blog/ko/github-agentic-workflows-cicd-ai)와 결합하면 완전한 CI/CD 파이프라인을 구성할 수 있다.

나는 이 접근이 꽤 합리적이라고 본다. 에이전트 프레임워크가 자체적으로 분산 시스템을 재발명하는 대신, [이미 검증된 인프라 위에 올리는](/ko/blog/ko/deep-agents-architecture-optimization) 거니까. LangGraph가 커스텀 체크포인팅을 구현하고, CrewAI가 자체 메모리 시스템을 만드는 동안, Dapr Agents는 Redis든 PostgreSQL이든 DynamoDB든 — 이미 운영 중인 30개 이상의 데이터베이스를 상태 저장소로 그냥 꽂아 쓴다.

## Scale-to-Zero와 성능

Virtual Actor 모델의 가장 매력적인 부분은 scale-to-zero다. 에이전트가 유휴 상태일 때 메모리에서 내려가지만 상태는 유지된다. 다시 호출하면 수 밀리초 안에 활성화된다. Diagrid의 벤치마크에 따르면 Actor activation latency가 tp90 ~3ms, tp99 ~6.2ms다.

기존 프레임워크에서 에이전트 100개를 상시 대기시키려면 메모리를 잔뜩 먹지만, Dapr Agents에서는 요청이 올 때만 활성화되고 끝나면 사라진다. 서버리스 함수처럼 동작하면서도 상태를 잃지 않는 것이다.

## 그래서 프레임워크 선택, 어떻게 할 것인가

| | Dapr Agents | LangGraph | CrewAI |
|---|---|---|---|
| **핵심 강점** | 인프라 내구성 | 복잡한 워크플로우 그래프 | 역할 기반 팀 구성 |
| **장애 복구** | 자동 (durable workflow) | 수동 체크포인팅 | 제한적 |
| **Kubernetes** | 네이티브 (사이드카) | 별도 구성 | 별도 구성 |
| **스케일링** | Scale-to-zero, 자동 | 수동 | 수동 |
| **상태 관리** | 30+ DB 플러그인 | 인메모리/커스텀 | 인메모리 |
| **학습 곡선** | 중간 (Dapr 지식 필요) | 높음 (그래프 이론) | 낮음 |
| **언어** | Python만 | Python | Python |

솔직히 말하면, Dapr Agents가 만능은 아니다.

**Python만 지원한다.** v1.0인데 C#이나 Java SDK가 아직 없다. 엔터프라이즈에서 JVM 기반 시스템을 운영하는 팀이라면 당장 도입하기 어렵다. GitHub 스타도 630개 수준이라 커뮤니티가 아직 작다. LangGraph나 CrewAI의 생태계와 비교하면 플러그인이나 예제가 부족하다.

그리고 **Dapr 런타임에 의존한다는 건 양날의 검**이다. Dapr를 이미 쓰고 있는 팀이라면 에이전트를 자연스럽게 기존 인프라에 통합할 수 있다. 하지만 Dapr를 처음 접하는 팀이라면 에이전트 하나 띄우려고 사이드카 아키텍처, 컴포넌트 YAML, Dapr CLI까지 학습해야 한다. "에이전트 로직 10줄 + 인프라 설정 100줄" 같은 상황이 충분히 나올 수 있다.

## 개인적인 판단

나는 Dapr Agents가 "에이전트 프레임워크 전쟁"에서 독특한 포지션을 잡았다고 생각한다. 대부분의 프레임워크가 "더 똑똑한 에이전트"를 만드는 데 집중하는 동안, Dapr Agents는 "죽지 않는 에이전트"를 만드는 데 집중한다. 이건 프로덕션에서 에이전트를 실제로 운영해본 팀이라면 공감할 방향이다.

ZEISS가 KubeCon 키노트에서 Dapr Agents로 광학 파라미터 문서 추출을 구현한 사례를 발표한 것도 인상적이다. 실제 비즈니스 크리티컬한 워크로드에서 에이전트의 "안 죽음"이 얼마나 중요한지를 보여준다.

다만 현시점에서 도입을 고려한다면, 두 가지 조건이 맞아야 한다. 첫째, 팀이 이미 Kubernetes를 운영하고 있어야 한다. 둘째, 에이전트가 "한 번 실행하고 끝"이 아니라 장시간 실행되는 durable한 워크플로우를 필요로 해야 한다. 간단한 RAG 파이프라인이나 일회성 도구 호출이라면 LangGraph나 CrewAI가 훨씬 가볍다.

CNCF의 공식 후원이라는 점, 그리고 Dapr라는 검증된 런타임 위에 세워졌다는 점 — 이 두 가지가 장기적으로 Dapr Agents의 가장 큰 경쟁력이 될 거라고 본다. 에이전트 프레임워크는 넘쳐나지만, cloud-native 에이전트 런타임은 아직 이것뿐이다.
