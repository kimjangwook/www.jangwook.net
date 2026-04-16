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

물론 이 코드 한 줄이 전부라면 글을 쓸 이유가 없다. 진짜 문제는 그 다음이다. 환경 설정, 세션 관리, 스트리밍 이벤트 처리, 그리고 무엇보다 "이걸 프로덕션에 쓰면 실제로 얼마가 나오는가." 여기서부터 이야기가 복잡해진다.

Anthropic이 4월 8일 Claude Managed Agents 퍼블릭 베타를 열었다. 에이전트 인프라를 직접 구축하지 않아도 되는 관리형 서비스다. 에이전트 루프를 직접 짜본 사람이라면 이 말의 무게가 다르게 들릴 거다. 나도 그중 한 명이라 API를 직접 붙여봤다. 결론부터 말하면 — 인프라 자유는 진짜인데, 그 자유에 달린 가격표를 제대로 읽어야 한다.

## 에이전트 루프를 직접 짜봤으면 이 서비스가 왜 나왔는지 안다

에이전트를 만든다고 하면 보통 모델 호출 → 도구 실행 → 결과 반환 → 다시 모델 호출이라는 루프를 떠올린다. 간단해 보인다. 실제로 간단한 건 여기까지다.

프로덕션에 올리는 순간 다른 세상이 펼쳐진다. 도구 실행 결과를 다시 모델에 넣는 루프의 상태 관리, 중간에 네트워크가 끊겼을 때의 복구 전략, 컨텍스트 윈도우가 꽉 찰 때 어떤 메시지를 버리고 어떤 걸 남길지의 압축 로직, API 타임아웃 처리, 그리고 에이전트가 `rm -rf /` 같은 명령을 실행하지 못하도록 하는 샌드박스 격리. 이게 다 "에이전트 만들기" 전에 풀어야 하는 인프라 문제다.

내 경험으로는 실제 에이전트 로직 — "이 PR의 보안 취약점을 찾아라" 같은 비즈니스 코드 — 보다 이 주변 인프라 코드가 3배는 더 오래 걸렸다. [Claude Code 에이전틱 워크플로우 패턴 5가지](/ko/blog/ko/claude-code-agentic-workflow-patterns-5-types)에서 오케스트레이터-서브에이전트 패턴을 다룬 적이 있는데, 패턴이 아무리 깔끔해도 그걸 유지보수 가능한 코드로 옮기는 건 전혀 다른 문제다. 특히 에러 핸들링이 지옥이었다. 도구 호출이 실패했을 때 재시도할지, 사용자에게 물어볼지, 그냥 넘어갈지 — 이런 분기를 수십 개 짜다 보면 에이전트 로직이 조건문 속에 파묻힌다.

Managed Agents는 이 인프라 계층을 Anthropic이 가져가겠다는 선언이다. 너는 비즈니스 로직만 짜라.

## 작동 원리: Agent → Environment → Session 3단계 체인

핵심 개념은 세 개다. <strong>에이전트(Agent)</strong>, <strong>환경(Environment)</strong>, <strong>세션(Session)</strong>.

에이전트는 시스템 프롬프트 + 허용 도구 세트의 재사용 가능한 정의다. 한 번 만들어두면 ID로 반복 호출할 수 있다. 환경은 에이전트가 실행될 격리된 컨테이너다. 네트워크 접근 범위, 파일 시스템 마운트 같은 실행 조건을 여기서 정한다. 세션은 실제 실행 단위 — 에이전트 + 환경 조합 위에서 돌아가는 하나의 작업이다.

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

세션이 생성되면 SSE(Server-Sent Events) 스트림으로 메시지를 주고받는다. 이 부분이 기존 Messages API와 가장 크게 다른 점이다. 요청-응답이 아니라 실시간 이벤트 스트림이다.

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

직접 붙여보고 바로 느낀 게 있다. 세션이 연결이 끊겨도 살아있다는 점. 노트북 덮고 다시 열어도 세션은 돌아가고 있고, 다시 스트림을 붙이면 그동안의 이벤트를 이어서 받을 수 있다. 장시간 실행되는 에이전트 작업에서 이건 꽤 의미 있는 기능이다. 내가 직접 짠 에이전트 루프에서는 이 부분이 가장 취약했다 — WebSocket 끊기면 상태를 Redis에 저장해두고 복구하는 코드를 별도로 짜야 했다.

모든 엔드포인트에는 `managed-agents-2026-04-01` 베타 헤더가 필요한데, Python SDK가 `client.beta.*` 네임스페이스를 통해 자동으로 처리해준다.

## 내장 도구 세트 해부: agent_toolset_20260401에 뭐가 들어있나

에이전트를 만들 때 `tools` 파라미터에 `agent_toolset_20260401`을 넘기면 내장 도구 세트 전체가 한 번에 활성화된다. 이게 편리한 점이자 동시에 불안한 점이다.

공식 문서 기준으로 포함된 도구:

- <strong>Bash</strong> — 셸 명령 실행. 패키지 설치, 테스트 실행, CLI 호출까지 가능
- <strong>파일 연산</strong> — 읽기, 쓰기, 수정, 검색(grep), 패턴 매칭(glob)
- <strong>웹 검색</strong> — 실시간 웹 검색 (별도 과금: $10/1,000건)
- <strong>웹 페치</strong> — URL에서 콘텐츠 가져오기
- <strong>코드 실행</strong> — Python/JS 코드를 샌드박스에서 실행

내가 써보면서 유용했던 건 Bash + 파일 연산 조합이다. "이 리포지토리를 클론해서 테스트를 돌리고 실패하는 테스트를 분석해줘"라는 요청을 세션 하나로 처리할 수 있다. 기존에는 이런 작업을 위해 도구 스키마를 하나하나 정의하고, 실행 결과 파싱 로직을 짜고, 오류 처리를 넣어야 했다. 그 과정이 통째로 사라진다.

한 가지 주의할 게 있다. <strong>웹 검색은 별도 과금</strong>이다. agent_toolset에 포함되어 있지만 사용할 때마다 $10/1,000건이 따로 붙는다. 에이전트가 리서치 작업을 하면서 웹 검색을 과도하게 호출하면 비용이 빠르게 늘어날 수 있다. 처음에 이걸 간과했다가 테스트 세션 하나에서 검색 47건이 나간 걸 보고 놀랐다. 시스템 프롬프트에 "웹 검색은 꼭 필요할 때만" 같은 제약을 넣는 게 현실적이다.

그리고 공식 발표에서 언급된 <strong>Computer Use(화면 조작)</strong>와 <strong>멀티에이전트 조율</strong>은 퍼블릭 베타에 포함되지 않는다. 별도의 리서치 프리뷰 액세스를 신청해야 한다. 이 부분은 아래에서 더 다룬다.

## 비용 현실: 세 가지 시나리오로 직접 계산했다

$0.08/시간이라는 숫자만 보면 저렴해 보인다. 그런데 실제로는 런타임 비용 + 토큰 비용 + 웹 검색 비용이 따로 붙는 구조다. 런타임은 밀리초 단위로 측정되고, 세션 상태가 "running"일 때만 과금된다는 점은 다행이다. 세 가지 시나리오로 계산해봤다.

<strong>시나리오 1: 코드 리뷰 에이전트 (온디맨드)</strong>

하루 10건 PR 리뷰. 세션당 평균 5분, Sonnet 4.6 사용.

| 항목 | 계산 | 월 비용 |
|------|------|---------|
| 런타임 | 50분/일 × 22일 = 약 18시간 | $1.44 |
| 토큰 (입력) | ~5K 토큰/세션 × 220건 × $3/1M | $3.30 |
| 토큰 (출력) | ~2K 토큰/세션 × 220건 × $15/1M | $6.60 |
| 웹 검색 | 사용 안 함 | $0 |
| <strong>합계</strong> | | <strong>~$11/월</strong> |

이 정도면 꽤 합리적이다. 주니어 개발자 한 명의 코드 리뷰 시간을 줄인다고 생각하면 투자 대비 수익이 명확하다.

<strong>시나리오 2: 리서치 에이전트 (주 3회 배치)</strong>

주 3회 기술 트렌드 리서치. 세션당 평균 20분, 웹 검색 포함, Opus 4.6 사용.

| 항목 | 계산 | 월 비용 |
|------|------|---------|
| 런타임 | 20분 × 12회 = 4시간 | $0.32 |
| 토큰 (입력) | ~20K 토큰/세션 × 12 × $5/1M | $1.20 |
| 토큰 (출력) | ~10K 토큰/세션 × 12 × $25/1M | $3.00 |
| 웹 검색 | ~30건/세션 × 12 × $10/1000 | $3.60 |
| <strong>합계</strong> | | <strong>~$8/월</strong> |

웹 검색 비용이 토큰 비용에 버금간다는 점에 주목. 리서치 에이전트는 검색 횟수를 제어하지 않으면 여기서 비용이 폭발한다.

<strong>시나리오 3: 모니터링 에이전트 (24/7 상시)</strong>

24시간 실행, Sonnet 4.6, 10분마다 체크.

| 항목 | 계산 | 월 비용 |
|------|------|---------|
| 런타임 | 24h × 30일 = 720시간 | $57.60 |
| 토큰 (입력) | ~1K 토큰 × 4,320회 × $3/1M | $12.96 |
| 토큰 (출력) | ~500 토큰 × 4,320회 × $15/1M | $32.40 |
| <strong>합계</strong> | | <strong>~$103/월</strong> |

상시 실행은 비용이 꽤 나온다. 런타임만 월 $58이고 토큰이 그 위에 쌓인다. 이 경우는 이벤트 기반 아키텍처로 세션을 필요할 때만 생성하고 바로 종료하는 설계가 필수다.

한 가지 더 — <strong>Batch API 할인이 Managed Agents에는 적용되지 않는다</strong>. 기존에 Batch API로 50% 할인을 받고 있었다면, Managed Agents로 옮기는 순간 그 할인이 사라진다. 이건 공식 문서에 명시되어 있지만 눈에 잘 안 띄는 곳에 써놨다.

## 좋은 점: 실제로 시간을 아끼는 부분

비용 이야기를 먼저 했더니 부정적으로 보일 수 있는데, 써보면 확실히 좋은 부분이 있다.

<strong>인프라 코드 제로.</strong> 에이전트 루프를 직접 짰을 때 도구 실행 → 결과 파싱 → 모델 재호출 → 상태 관리 → 에러 복구에 들어가던 코드가 통째로 사라진다. 체감상 800〜1,000줄의 인프라 코드가 위의 API 호출 몇 줄로 대체된다.

<strong>세션 지속성.</strong> 위에서 언급했지만 다시 강조할 만하다. 클라이언트 연결이 끊겨도 세션은 계속 실행된다. 에이전트에게 30분짜리 코드 분석 작업을 맡기고 다른 일을 해도 된다. 돌아와서 스트림을 다시 붙이면 그동안의 이벤트를 수신할 수 있다.

<strong>샌드박스 격리.</strong> 에이전트가 Bash 명령을 실행할 수 있다는 건 보안적으로 무섭다. Managed Agents는 각 환경을 격리된 컨테이너에서 실행하고, 네트워크 접근 범위도 환경 설정에서 제한할 수 있다. 직접 이걸 구현하려면 Docker + 네트워크 정책 + 파일 시스템 마운트 제어를 세팅해야 한다. 이 부분만으로도 가치가 있다.

## 아쉬운 점: 벤더 락인 리스크와 베타의 한계

좋은 점만 있으면 "그냥 쓰면 되지"가 답이겠지만, 현실은 그렇지 않다.

<strong>벤더 락인이 깊다.</strong> 에이전트 정의, 환경 설정, 세션 관리 API가 전부 Anthropic 전용이다. OpenAI Assistants API와도 호환되지 않고, LangChain이나 CrewAI 같은 프레임워크와도 직접 연결되지 않는다. 나중에 Gemini나 GPT 기반으로 이전하려면 에이전트 로직을 재구현해야 한다.

이건 이론적 위험이 아니다. 실제로 이번 달 Anthropic은 Claude Pro/Max 구독자의 서드파티 도구 접근 정책을 변경했다. 인프라를 맡긴다는 건 이런 정책 변경까지 함께 받아들인다는 뜻이다. NVIDIA NemoClaw 같은 [자체 인프라 기반 에이전트 플랫폼](/ko/blog/ko/nvidia-nemoclaw-openclaw-enterprise-agent-platform)이 대안으로 나오는 것도 이런 맥락이다.

<strong>멀티에이전트 조율이 빠져 있다.</strong> 발표에서 가장 흥미로웠던 기능 — 에이전트가 다른 에이전트를 생성하고 병렬로 작업을 분배하는 것 — 이 퍼블릭 베타에 없다. 리서치 프리뷰 액세스를 별도로 신청해야 쓸 수 있고, 승인까지 얼마나 걸리는지도 불확실하다. 현재 Managed Agents는 단일 에이전트의 관리형 실행이 전부다. [에이전트 팀을 직접 구성해서 운용하는 방식](/ko/blog/ko/claude-agent-teams-guide)과 비교하면 기능적 범위가 좁다.

<strong>Batch API 할인 미적용.</strong> 대량 처리를 위해 Batch API를 쓰고 있었다면 주의해야 한다. Managed Agents 세션 내 토큰 소비에는 Batch API의 50% 할인이 적용되지 않는다. 배치 작업을 Managed Agents로 이전하면 토큰 비용이 2배 뛸 수 있다.

<strong>프롬프트 캐싱의 효용이 줄어든다.</strong> 세션 기반이라 동일한 시스템 프롬프트를 반복 사용하더라도, 세션이 새로 생성될 때마다 캐시 워밍이 다시 필요하다. 짧은 세션을 자주 만드는 패턴에서는 프롬프트 캐싱의 비용 절감 효과가 떨어진다. 캐시 읽기 비용이 기본 입력 가격의 10%라고 해도, 캐시 미스가 잦으면 의미가 없다.

## 누구에게 맞고, 누가 기다려야 하는가

<strong>지금 시도할 만한 경우:</strong>

- 에이전트 인프라에 투자할 엔지니어가 없는 2〜5인 팀. 인프라 유지보수 시간을 제품 개발에 돌릴 수 있다.
- 단일 에이전트로 해결되는 작업 — 코드 리뷰, 문서 생성, 데이터 분석 같은 독립적 태스크
- 에이전트 POC(개념 검증)를 빠르게 만들어야 하는 상황. 30분이면 동작하는 프로토타입이 나온다.
- 기존 API 고객이라면 베타를 무료로 쓸 수 있다 (런타임 + 토큰 비용만 지불)

<strong>서두르지 않아도 되는 경우:</strong>

- 멀티 모델 전략을 쓰고 있거나, 특정 벤더에 묶이고 싶지 않은 팀
- 이미 자체 에이전트 오케스트레이션 코드가 있고 잘 돌아가고 있는 경우
- 멀티에이전트 조율이 핵심 요구사항인 경우 — 아직 퍼블릭 베타에 없다
- Batch API 할인에 의존하는 대량 처리 파이프라인을 운영 중인 경우

나는 아직 프로덕션에는 안 쓰고 있다. 이유는 단순하다. 내가 돌리는 에이전트들은 [tmux 기반으로 여러 개를 동시에 돌리는 구조](/ko/blog/ko/claude-agent-teams-guide)인데, Managed Agents의 현재 퍼블릭 베타는 단일 에이전트만 지원한다. 멀티에이전트 기능이 일반 공개되면 다시 평가할 생각이다.

## 다음에 해볼 것

리서치 프리뷰 액세스를 신청해뒀다. 멀티에이전트 조율이 실제로 쓸 만한 수준인지, 아니면 마케팅 시연 수준인지 직접 확인하고 싶다. 승인이 나오면 현재 tmux 기반 워크플로우와 동일한 작업을 Managed Agents 멀티에이전트로 돌려보고 비용, 속도, 안정성을 비교해볼 계획이다.

그리고 하나 더 궁금한 건, Anthropic이 Managed Agents의 가격을 얼마나 유지할 것인가다. 퍼블릭 베타 동안의 $0.08/시간이 GA에서도 유지될지, 아니면 올라갈지. AWS Lambda가 초기 저가로 시장을 잡고 나중에 가격을 올린 전례가 있다. 인프라 의존도를 높이기 전에 이 점은 지켜봐야 한다.

## 참고 자료

- [Claude Managed Agents 공식 문서](https://platform.claude.com/docs/en/managed-agents/overview)
- [Managed Agents 퀵스타트](https://platform.claude.com/docs/en/managed-agents/quickstart)
- [도구 레퍼런스](https://platform.claude.com/docs/en/managed-agents/tools)
- [Anthropic 공식 발표](https://claude.com/blog/claude-managed-agents)
