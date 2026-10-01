---
title: "MCP 로드맵을 출시 일정이 아니라 운영 계획서로 읽었더니 지금 만들 것이 바뀌었다"
description: "MCP 로드맵은 납품 일정표가 아니다. 카탈로그 경제성, 문서의 출처 면, 교체 가능한 신원 경계가 다음 스펙이 나오기 전에 엔지니어링 리더가 손대야 할 것을 결정한다."
pubDate: 2026-08-25
heroImage: '../../../assets/blog/mcp-roadmap-doc-read-agent-identity-progressive-discovery-2026/hero.png'
tags:
  - MCP
  - AI Agents
  - Engineering Leadership
  - Architecture
relatedPosts:
  - slug: mcp-builtin-vs-external-harness-cost-28x-measured-2026
    score: 0.9
    reason:
      ko: MCP 실행 경로를 선택할 때 비용 구조와 운영 통제권을 함께 판단하는 기준을 다룹니다.
      ja: MCPの実行経路を選ぶ際に、コスト構造と運用上の制御権をどう評価するかを解説します。
      en: It examines how to evaluate cost structure and operational control when choosing an MCP execution path.
      zh: 它讨论了在选择 MCP 执行路径时，如何同时评估成本结构与运营控制权。
  - slug: mcp-vs-a2a-vs-open-responses-agent-protocol-comparison-2026
    score: 0.88
    reason:
      ko: MCP, A2A, Open Responses를 같은 역할로 오해하지 않기 위한 프로토콜 경계와 선택 기준을 설명합니다.
      ja: MCP、A2A、Open Responsesを同じ役割のものとして扱わないための、プロトコル境界と選定基準を説明します。
      en: It clarifies protocol boundaries and selection criteria so MCP, A2A, and Open Responses are not treated as interchangeable.
      zh: 它说明了协议边界与选择标准，避免将 MCP、A2A 和 Open Responses 误认为可以互换。
  - slug: context-engineering-production-ai-agents
    score: 0.85
    reason:
      ko: 프로덕션 에이전트에서 컨텍스트를 예산과 운영 자산으로 다루는 방법을 다룹니다.
      ja: 本番エージェントにおいて、コンテキストを予算と運用資産として扱う方法を解説します。
      en: It explains how to manage context as both a budget and an operational asset in production agents.
      zh: 它解释了如何在生产级智能体中，将上下文视为预算和运营资产来管理。
---

MCP 로드맵이 이번 분기에 팀이 만들 것을 바꾸는지 알고 싶었다. 로드맵을 릴리스된 스키마, 공식 가이드, 그리고 통제된 로컬 하네스에서 관측한 카탈로그 로딩 동작과 나란히 놓고 비교했다. 결론은 분명하다. 팀이 지금 손대야 하는 것은 자기가 통제하는 카탈로그 크기와 신원 경계이고, 아직 스펙에 도달하지 못한 로드맵 항목을 납기 계획에 넣어서는 안 된다.

이 구분이 중요한 이유는 단순하다. AI 통합은 표준화 과정이 답을 내놓기 훨씬 전부터 비용과 접근 통제 리스크를 쌓는다. 카탈로그를 재고, 묶어두고, 신원 구현은 언제든 갈아끼울 수 있게 남겨둬라.

## 로드맵은 우선순위 지도이지 출시 계약서가 아니다

경영 판단에서 제일 먼저 나오는 실수는 프로토콜 로드맵을 벤더의 납품 일정표처럼 읽는 것이다.

MCP 로드맵은 메인테이너들이 앞으로 어디에 우선순위를 두는지를 말한다. 이건 유용한 정보다. 리뷰 역량과 워킹그룹, 향후 상호운용성이 어디에 몰릴지 아키텍처 리더에게 알려준다. 그러나 이름이 적힌 기능을 지금 붙잡고 개발해도 된다는 뜻은 아니고, 지금 형태가 표준화를 거쳐 살아남는다는 뜻도 아니다.

> This roadmap reflects current thinking rather than firm commitments. Priorities may shift, some items may be delivered differently than described or deferred, and work not listed here may still be included in the release.

> — [Roadmap — SEP Prioritization](https://modelcontextprotocol.io/development/roadmap)

이 문장은 CTO의 운영 모델을 바꿔야 한다. 로드맵 항목이 들어갈 자리는 기술 워치리스트, 표준화 참여 계획, 역량 리스크 대장이다. 확정된 제품 의존성 목록이 아니다.

차이는 문서의 출처 면에서 그대로 드러난다. `subscriptions/listen`, `nextCursor`, `structuredContent`는 릴리스된 스키마에 근거가 있다. Tasks는 이전 코어 스키마에 등장했다가 현재 코어 스키마에서 사라졌고, 확장을 거쳐 언젠가 편입되는 경로에 남아 있다. DPoP, ID-JAG, 웹훅, 프로그레시브 디스커버리는 확인한 네 개 스키마 버전(2025-06-18, 2025-11-25, 2026-07-28, draft) 어디에도 나오지 않는다.

같은 어휘가 이 차이를 덮는다. 로드맵은 이 모두에게 비슷한 시각적 무게를 준다. 엔지니어링 계획서는 그럴 수 없다.

## 카탈로그 로딩을 재봤더니 비용이 도구 수를 따라 늘었다

당장 걸리는 운영 문제는 에이전트 신원만큼 화려하지 않다. 하지만 이미 조직에 청구서를 보내고 있다.

합성 도구 200개를 20개씩 페이지로 나눠 노출하는 로컬 MCP 서버를 Claude 2.1.241에 물렸다. 동일 조건 3회 실행에서 클라이언트는 `tools/list`를 10번 호출했고, 커서를 `none`부터 `180`까지 따라갔으며, 사용자가 의미 있는 질문을 던지기도 전에 62,708바이트를 받았다.

도구 20개 기준선은 목록 호출 1회에 6,235바이트였다. 도구를 20개에서 200개로 늘리자 카탈로그는 10배가 됐고 전송 바이트는 10.06배가 됐다.

이건 토큰 과금 모델이 아니다. 그보다 근본적이다. 과제별 작업이 시작되기도 전에 시스템 안으로 들어온 페이로드의 측정값이다. 실제 토큰과 지연 영향은 클라이언트, 모델, 도구 정의 길이, 캐시 동작, 전송 경로에 따라 갈린다. 방향은 이미 보인다. 노출한 도구가 많을수록 첫 턴의 카탈로그 페이로드가 커진다.

공식 클라이언트 가이드도 카탈로그가 더 커진 규모에서 같은 부류의 문제를 말한다.

> Once the tool definitions take up a significant part of the available context window, clients should switch to progressive discovery. We recommend that clients implement thresholds to determine when to switch:

> — [Client Best Practices (2026-07-28)](https://modelcontextprotocol.io/docs/2026-07-28/develop/clients/client-best-practices)

경영 입장에서 따질 단가는 모델 토큰에서 끝나지 않는다. 걸러지지 않은 거대한 카탈로그는 프롬프트 점검 부담, 도구 선택의 모호함, 회귀 테스트 범위를 함께 키운다. 그리고 하필 같은 게이트웨이 뒤에 있었다는 이유만으로 민감한 기능이 노출될 확률도 같이 오른다.

중앙화는 통합 지점을 줄인다. 동시에 깔끔했던 도메인 경계를 첫 턴에 부풀어 오른 페이로드로 바꿔놓기도 한다. 이 맞교환에는 주인과 예산이 필요하다.

## 페이지네이션은 프로그레시브 디스커버리가 아니다

페이지네이션이 이미 해결하고 있지 않냐고 말하기 쉽다. 아니다.

`nextCursor`는 2025-06-18 이후 릴리스된 MCP 스키마에 계속 있었다. 프로토콜은 결과 집합의 끝을 어떻게 인식하고 페이지 방식과 비페이지 방식을 어떻게 함께 지원할지 클라이언트에 알려준다. 한 페이지에서 멈추라고 요구하지는 않는다. 다음 페이지가 관련 있는지, 비싼지, 권한이 걸려 있는지, 나중으로 미뤄도 안전한지도 알려주지 않는다.

> Clients **SHOULD**: * Treat a missing `nextCursor` as the end of results * Support both paginated and non-paginated flows

> — [Server Utilities — Pagination (2026-07-28)](https://modelcontextprotocol.io/specification/2026-07-28/server/utilities/pagination)

측정한 하네스에서 클라이언트는 커서를 끝까지 따라갔다. 그건 페이지네이션의 요구사항이 아니라 클라이언트의 정책이다. "결과가 더 있다"는 신호밖에 없는 커서 앞에서 전부 가져오는 쪽이 보수적인 선택이다. 필요한 도구가 아직 보지 못한 페이지에 있는지 클라이언트는 알 도리가 없다.

그러니 프로그레시브 디스커버리는 이름만 바꾼 페이지네이션이 아니다. 관련성 신호와 판단 정책이 있어야 성립한다. 클라이언트는 꼭 필요한 도구를 조용히 못 쓰게 만들지 않으면서 더 좁은 기능 집합을 요청할 만큼의 정보를 가져야 한다.

로드맵도 이 공백을 인정한다.

> **Progressive discovery**: Core Primitives WG. Clients learn a server's tools and resources as they need them instead of ingesting the full catalog up front, with a defined interaction with the caching work under [HTTP-Native Transport Unification and Hardening](#2-http-native-transport-unification-and-hardening).

> — [Roadmap — Progressive discovery](https://modelcontextprotocol.io/development/roadmap)

프로토콜 설계는 아직 열려 있다. 사업 쪽 문제는 그걸 기다려주지 않는다.

## 카탈로그 크기를 엔지니어링 통제 항목으로 만들어라

사내 MCP 게이트웨이를 운영하는 팀이라면 나는 납품 게이트 세 개를 세운다.

첫째, 카탈로그 크기를 CI가 관리하는 예산으로 만든다. 도구 개수, 직렬화된 도구 정의 바이트, `tools/list` 호출 횟수, 커넥션당 누적 응답 바이트를 잰다. 서버가 합의된 임계값을 넘으면 아키텍처 결정을 명시적으로 요구한다. 비즈니스 역량 단위로 쪼개든, 세션에 보이는 집합을 좁히든, 추가 예산을 정당화하든 셋 중 하나다.

이건 행정 절차가 아니다. 그러지 않으면 장애 회고 자리에서야 나올 질문을 앞당겨 꺼내는 장치다. 에이전트는 왜 과제와 무관한 기능을 보고 있었나. 플랫폼 팀은 왜 도입이 커진 다음에야 첫 턴 컨텍스트 비용을 알게 됐나.

둘째, 사내 문서에서 MCP 기능을 언급할 때마다 그 근거의 출처 면을 옆에 적게 한다. `/specification/`에 있는 기능과 `/docs/` 아래 가이드, 워킹그룹 헌장, `/development/roadmap`은 엔지니어링상 의미가 전혀 다르다. 이 작은 문서 규칙이 흔한 실패를 막는다. 공식 도메인에서 읽은 로드맵 한 문장이 개발자 머릿속에서 플랫폼 보증으로 둔갑하는 실패다.

셋째, 신원의 획득과 검증을 어댑터 경계 하나 뒤로 몰아넣는다. 토큰 파싱, audience 선택, 위임 규칙, 인가 가정을 모든 도구 핸들러에 흩뿌리지 않는다. 그 경계는 오늘은 조직이 이미 쓰는 OAuth 체계를 그대로 쓰면서, 미래의 신원 표준을 받아들일 자리를 한 곳에 남겨둔다.

이 통제가 없으면 같은 문제를 서버마다, PR마다, 나중에는 예외 건마다 따로 처리하게 된다.

## 카탈로그가 작다면 반론이 옳다

가장 강한 반론은 보통 받는 대접보다 더 존중받을 만하다.

스키마에 없는 항목일수록 깨뜨릴 기존 사용처가 없으니 가장 빨리 움직일 수 있다. 지금 팀이 자체 프로그레시브 디스커버리 규약을 발명해두면 표준화가 그 작업을 통째로 버리게 만들 수 있다. MCP에는 이런 진화를 위한 실험적 확장 경로가 있다. 성급한 사설 프로토콜은 마이그레이션 부채와 상호운용성 구멍, 그리고 다 끝냈다는 착각을 남긴다.

도구가 수십 개이고 카탈로그 페이로드가 작은 팀에게 이 말은 맞다. 내 기준선에서 도구 20개는 6,235바이트였다. 많은 환경에서 이 정도는 디스커버리 메커니즘을 설계하고 운영하고 문서화하고 나중에 교체하는 복잡도에 비하면 잡음이다. 기다리는 비용은 작고 커스텀 동작의 재작성 비용은 실재한다.

반론이 무너지는 지점은 내부 통합이 카탈로그를 수백 개로 밀어올릴 때다. 엔터프라이즈에서는 흔한 패턴이다. 고객 데이터, 인가, 운영 워크플로, 리포팅을 담당하던 별개 시스템들이 거버넌스와 재사용을 약속하는 하나의 에이전트용 게이트웨이 뒤로 모인다. 게이트웨이는 그 기능들의 총합을 노출한다.

이 지점에서 "스펙을 기다리자"는 중립적 결정이 아니다. 카탈로그 페이로드와 도구 선택 면이 선형으로 커지는 것을 받아들이겠다는 선언이다.

내 주장은 MCP와 경쟁하는 프로토콜을 만들자는 게 아니다. 호스트와 게이트웨이 소유자가 이미 쥐고 있는 통제 수단을 쓰자는 것이다. 역할 기준의 서버 분리, 정책으로 제한한 세션 도구 집합, 카탈로그 예산. 미래의 디스커버리 프리미티브가 다른 모양으로 나오더라도 이 셋은 건전한 아키텍처 결정이다.

## 신원은 표준화되기 전에 교체 가능해야 한다

로드맵의 신원 방향은 전략적으로 중요하다. 그러나 새 인증 모델을 코드에 박아넣을 이유는 아직 아니다.

> **DPoP**: Agent Identity WG (forming during this roadmap period). Finalize the specification for Demonstrating Proof of Possession (DPoP) and focus on getting widespread adoption.

> — [Roadmap — DPoP / Agent identity and delegation](https://modelcontextprotocol.io/development/roadmap)

"forming during this roadmap period"라는 표현이 핵심 신호다. 리더는 변화를 준비해야 하고, 목적지가 이미 구현 대상인 척해서는 안 된다는 뜻이다.

이 문제는 에이전트가 위임받은 권한으로 도구를 호출하거나 하위 에이전트를 만들 때 가장 크게 불거진다. 그 흐름에서 시스템은 어려운 질문에 정확히 답해야 한다. 이 행위를 시작한 주체는 누구인가. 지금 행동하는 에이전트는 누구인가. 토큰을 받아도 되는 audience는 어디까지인가. 위임된 권한은 부모의 권한보다 좁은가.

이 답을 도구 코드에 직접 박아넣은 플랫폼은 모든 서비스에 걸친 마이그레이션 숙제를 미래에 남긴다. 신원 어댑터 하나 뒤로 격리한 플랫폼은 기존 인가 인프라를 계속 쓰면서, 언젠가 있을 교체를 통제된 이음매 하나로 제한한다.

그 이음매는 투기적 엔지니어링이 아니라 리스크 완화다. 표준이 움직이는 동안에도 인가 판단을 들여다볼 수 있고 일관되게 유지해서 데이터 정합성을 지킨다.

## 경영 판단은 통제 가능한 일과 표준 리스크를 갈라놓는 것이다

CEO와 CTO에게 결정할 문제는 MCP가 성숙할지 여부가 아니다. 우리 아키텍처가 스스로 만들고 있는 문제를 외부 표준화가 대신 풀어줄 거라고 납기 계획이 가정하고 있는지 여부다.

지금 카탈로그를 통제해라. 도구 개수와 정의 페이로드에 책임자가 붙은 예산을 세워라. 게이트웨이 하나가 특권 동작의 통제 불능 재고 목록이 되기 전에 역량과 소유권 경계를 따라 서버를 쪼개라.

지금 교체를 전제로 신원을 설계해라. 어댑터를 한 곳에 모으고, 기존 통제를 유지하고, 릴리스된 스키마에 흔적조차 없는 로드맵 항목에 매출이 걸린 워크플로를 묶지 마라.

경제성과 리스크 프로파일에 영향을 주는 영역이라면 로드맵 과정에 참여해라. 로드맵은 메인테이너의 리뷰 시간이 희소하며, 우선순위 밖의 작업은 더 긴 대기열과 더 높은 정당화 기준을 만난다고 분명히 적어뒀다. 큰 플랫폼을 운영한다면 이건 거버넌스 신호다. 영향력은 열려 있지만 추상적 선호가 아니라 구체적인 운영 근거를 들고 오는 팀에게만 열려 있다.

단기 입장은 단호해야 한다. 카탈로그 규율과 교체 가능한 신원 이음매는 지금 당장 구현하고, 프로그레시브 디스커버리와 에이전트 신원 표준은 현재의 의존성이 아니라 미래의 통합 대상으로 다뤄라.

이 입장을 바꿀 조건은 하나다. 호스트 측 제한 없이도 거대한 카탈로그가 실제 클라이언트 컨텍스트와 지연, 운영 비용 안에서 묶여 있다는 것이 통제된 측정으로 확인될 때다.

## 참고 자료

1. [Roadmap](https://modelcontextprotocol.io/development/roadmap)
2. [Roadmap — Progressive discovery](https://modelcontextprotocol.io/development/roadmap)
3. [Roadmap — DPoP / Agent identity and delegation](https://modelcontextprotocol.io/development/roadmap)
4. [Roadmap — SEP Prioritization](https://modelcontextprotocol.io/development/roadmap)
5. [Client Best Practices (2026-07-28)](https://modelcontextprotocol.io/docs/2026-07-28/develop/clients/client-best-practices)
6. [Server Utilities — Pagination (2026-07-28)](https://modelcontextprotocol.io/specification/2026-07-28/server/utilities/pagination)
7. [schema.json](https://github.com/modelcontextprotocol/modelcontextprotocol/tree/main/schema)
8. [The next generation of MCP](https://blog.cloudflare.com/mcp-v2/)
