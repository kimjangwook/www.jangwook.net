---
title: Claude Managed Agents 써봤다 — 인프라 없이 AI 에이전트 30분 배포
description: >-
  Anthropic이 4월 공개한 Claude Managed Agents를 직접 붙여본 솔직한 사용기. API 3단계 체인, $0.08/시간
  요금 현실 계산, 벤더 락인 리스크까지 다룬다.
pubDate: '2026-04-16'
heroImage: >-
  ../../../assets/blog/claude-managed-agents-production-deployment-guide-hero.jpg
tags:
  - claude
  - managed-agents
  - ai-agent
  - anthropic
relatedPosts:
  - slug: claude-agent-teams-guide
    score: 0.95
    reason:
      ko: Managed Agents가 단일 에이전트 관리형 실행에 집중하는 반면, 이 글은 여러 에이전트를 tmux로 직접 오케스트레이션하는 방법을 다룬다. 두 접근법을 비교하면 어떤 상황에서 무엇을 선택해야 하는지 판단하기 쉬워진다.
      ja: Managed Agentsが単一エージェントの管理型実行に集中する一方、この記事はtmuxで複数エージェントを直接オーケストレーションする方法を扱う。両アプローチを比較することで、どの状況で何を選択すべきか判断しやすくなる。
      en: Where Managed Agents focuses on managed single-agent execution, this post covers directly orchestrating multiple agents with tmux. Comparing both approaches makes it easier to decide which fits your situation.
      zh: Managed Agents专注于单智能体托管执行，而这篇文章介绍了使用tmux直接编排多个智能体的方法。对比两种方法，更容易判断在什么情况下选择哪种方案。
  - slug: ai-agent-cost-reality
    score: 0.94
    reason:
      ko: Managed Agents의 $0.08/시간 요금이 실제로 합리적인지 판단하려면, 이 글에서 다룬 에이전트 운영 비용 vs 인건비 비교 분석이 실질적인 기준이 된다.
      ja: Managed Agentsの$0.08/時間の料金が実際に合理的かどうか判断するには、この記事で扱ったエージェント運用コストvs人件費の比較分析が実質的な基準になる。
      en: To judge whether Managed Agents' $0.08/hr pricing is actually reasonable, the agent operating cost vs. human labor comparison in this post serves as a practical benchmark.
      zh: 要判断Managed Agents的$0.08/小时费用是否实际合理，这篇文章中分析的智能体运营成本与人力成本比较是实用的参考标准。
  - slug: claude-code-agentic-workflow-patterns-5-types
    score: 0.93
    reason:
      ko: Managed Agents의 단일 에이전트 모델을 이해했다면, 이 글에서 다룬 5가지 오케스트레이션 패턴과 비교해봐야 한다. Managed Agents가 어떤 패턴에 맞는 도구인지 파악하는 데 직접적인 도움이 된다.
      ja: Managed Agentsの単一エージェントモデルを理解したなら、この記事で扱った5つのオーケストレーションパターンと比較してみる価値がある。Managed Agentsがどのパターンに適したツールかを把握するのに直接役立つ。
      en: Once you understand Managed Agents' single-agent model, compare it against the 5 orchestration patterns in this post. It directly helps you figure out which pattern Managed Agents actually fits.
      zh: 理解了Managed Agents的单智能体模型后，应该与这篇文章介绍的5种编排模式进行比较。这直接有助于判断Managed Agents适合哪种模式。
  - slug: nvidia-nemoclaw-openclaw-enterprise-agent-platform
    score: 0.92
    reason:
      ko: Anthropic의 관리형 에이전트 서비스와 대조적으로, NVIDIA NemoClaw는 엔터프라이즈 자체 인프라 위에서 에이전트를 실행하는 방향이다. 벤더 락인이 걱정된다면 이 방향도 살펴볼 만하다.
      ja: AnthropicのManaged Agentsとは対照的に、NVIDIA NemoClawはエンタープライズ自社インフラ上でエージェントを実行する方向だ。ベンダーロックインが心配なら、この方向も検討する価値がある。
      en: In contrast to Anthropic's managed service, NVIDIA NemoClaw takes the direction of running agents on enterprise-owned infrastructure. If vendor lock-in worries you, this is worth looking into.
      zh: 与Anthropic的托管服务相反，NVIDIA NemoClaw采用在企业自有基础设施上运行智能体的方向。如果供应商锁定让你担忧，这个方向值得了解。
  - slug: context-engineering-production-ai-agents
    score: 0.91
    reason:
      ko: Managed Agents로 에이전트를 배포할 수 있게 됐다면, 실제로 잘 작동하게 만드는 핵심은 컨텍스트 엔지니어링이다. 이 글은 프로덕션 AI 에이전트의 컨텍스트 설계 원리를 다룬다.
      ja: Managed Agentsでエージェントをデプロイできるようになったら、実際にうまく動かす鍵はコンテキストエンジニアリングだ。この記事はプロダクションAIエージェントのコンテキスト設計原理を扱う。
      en: Once you can deploy agents with Managed Agents, what actually makes them work well is context engineering. This post covers the context design principles for production AI agents.
      zh: 一旦能够通过Managed Agents部署智能体，真正让它们运作良好的关键是上下文工程。这篇文章涵盖了生产AI智能体的上下文设计原则。
---

```python
agent = client.beta.agents.create(
    name="code-review-agent",
    model="claude-sonnet-4-6",
    system="You review Python code for security and performance.",
    tools=[{"type": "agent_toolset_20260401"}],
)
```

이게 전부다. 에이전트 생성 끝.

물론 이 코드 한 줄이 전부라면 글을 쓸 이유가 없다. 진짜 문제는 그 다음 — 환경 설정, 세션 관리, 스트리밍 이벤트 처리, 그리고 무엇보다 "이걸 프로덕션에 쓰면 실제로 얼마가 나오는가."

Anthropic이 4월 8일 Claude Managed Agents 퍼블릭 베타를 열었다. 에이전트 인프라를 직접 구축하지 않아도 되는 관리형 서비스다. 에이전트 루프를 직접 짜본 사람이라면 이 말의 무게가 다르게 들릴 거다. 나도 그중 한 명이라 API를 직접 붙여봤다.

## 에이전트 루프를 스크래치로 짤 때 생기는 일

도구 실행 결과를 다시 모델에 넣는 루프, 오류 시 재시도 전략, 컨텍스트 윈도우가 꽉 찰 때 어떻게 압축할 것인가, 타임아웃 처리, 샌드박스 환경 분리. 이게 다 "에이전트 만들기" 전에 풀어야 하는 인프라 문제다. 내 경험으로는 실제 에이전트 로직보다 이 주변 코드가 더 오래 걸렸다.

[Claude Code 에이전틱 워크플로우 패턴 5가지](/ko/blog/ko/claude-code-agentic-workflow-patterns-5-types)에서 오케스트레이터-서브에이전트 패턴을 다룬 적이 있는데, 패턴이 명확해도 그걸 실제 코드로 구현하고 유지하는 건 또 다른 문제다.

Managed Agents는 이 인프라 부분을 Anthropic이 가져가겠다는 선언이다.

## 작동 원리: 세 개념이면 충분하다

핵심 개념은 **에이전트(Agent)**, **환경(Environment)**, **세션(Session)**이다.

에이전트는 시스템 프롬프트 + 허용 도구 세트의 재사용 가능한 묶음이다. 환경은 에이전트가 실행될 격리된 샌드박스다. 세션은 실제 실행 단위다.

```python
from anthropic import Anthropic

client = Anthropic()

# 1단계: 에이전트 정의 (한 번 만들어두고 재사용)
agent = client.beta.agents.create(
    name="code-review-agent",
    model="claude-sonnet-4-6",
    system="You review Python code for security issues and performance problems.",
    tools=[{"type": "agent_toolset_20260401"}],
)

# 2단계: 실행 환경 생성
environment = client.beta.environments.create(
    name="prod-env",
    config={
        "type": "cloud",
        "networking": {"type": "unrestricted"},
    },
)

# 3단계: 세션 시작 (실제 실행 단위)
session = client.beta.sessions.create(
    agent=agent.id,
    environment_id=environment.id,
    title="Review PR #482",
)
```

세션이 생성되면 SSE 스트림으로 메시지를 주고받는다.

```python
with client.beta.sessions.events.stream(session.id) as stream:
    client.beta.sessions.events.send(
        session.id,
        events=[{
            "type": "user.message",
            "content": [{"type": "text", "text": "이 Python 파일을 검토해줘: ..."}],
        }],
    )
    for event in stream:
        if event.type == "agent.message":
            print(event.content)
```

모든 엔드포인트에는 `managed-agents-2026-04-01` 베타 헤더가 필요한데, Python SDK가 자동으로 처리해준다.

직접 붙여보면서 느낀 건, 인터페이스 자체는 생각보다 깔끔하다는 거다. `agent_toolset_20260401` 내장 도구 세트 하나로 파일 읽기, 웹 검색, 코드 실행이 한 번에 활성화된다. 도구 하나하나 정의하느라 시간 쓰던 것과 비교하면 체감 차이가 크다.

## 비용: 계산을 직접 해봐야 한다

$0.08/시간이라는 숫자는 처음 보면 저렴해 보인다. 그런데 24시간 돌리면 $1.92, 한 달이면 $57.6이다. 여기에 토큰 비용이 더해진다.

코드 리뷰 에이전트를 하루 10건 처리하는 시나리오로 계산하면:
- 세션당 평균 5분 × 10건 = 50분/일
- 월 런타임: 약 25시간 → $2
- 세션당 Sonnet 4.6 토큰 비용: ~$0.05〜0.15
- <strong>월 총비용 예상: $20〜50 수준</strong>

이 정도면 납득이 간다. 문제는 상시 대기 에이전트다. 24/7 실행이면 런타임 비용만 월 $58이고, 토큰 비용이 그 위에 쌓인다. 트래픽이 예측 가능한 배치 작업이 아니라면, 이벤트 기반 설계로 세션을 필요할 때만 여는 게 비용 제어의 핵심이다.

## 내가 걱정하는 두 가지

쓸 만하다고 생각하면서도 두 가지는 계속 마음에 걸린다.

<strong>벤더 락인.</strong> 에이전트 설정, 세션 형식, 환경 컨테이너 스펙이 전부 Anthropic 방식으로 묶인다. 나중에 다른 모델이나 인프라로 이전하려면 재구현이 필요하다. 불과 이번 달에도 Anthropic이 Claude Pro/Max 구독자의 서드파티 도구 접근을 차단하는 정책 변경을 했다. 인프라를 맡긴다는 건 그 결정을 함께 받아들인다는 의미이기도 하다.

<strong>퍼블릭 베타의 실제 범위.</strong> 발표에서 가장 흥미로웠던 멀티에이전트 조율과 자기 평가 기능은 퍼블릭 베타에 없다. 리서치 프리뷰 액세스를 별도로 요청해야 한다. [에이전트 팀을 직접 구성해서 운용하는 방식](/ko/blog/ko/claude-agent-teams-guide)과 비교하면, 현재 Managed Agents는 단일 에이전트의 관리형 실행이 핵심이다.

## 언제 쓰면 좋은가

에이전트 인프라에 투자할 엔지니어링 리소스가 없는 팀이라면 지금 시도해볼 만하다. 2인 팀이 에이전트 루프 유지보수에 시간을 쓰는 것보다 관리형 서비스가 맞는 선택이다.

반대로, 멀티 모델 전략을 쓰거나 자체 오케스트레이션 로직이 이미 있다면 서두를 필요가 없다. 퍼블릭 베타가 GA로 넘어가고 멀티에이전트 기능이 일반 공개될 때 다시 평가해도 늦지 않다.

API를 직접 붙여보는 데 30분이면 충분하다. 기존 API 고객은 무료로 베타를 사용할 수 있다. 프로덕션 결정은 그 다음에 해도 된다.
