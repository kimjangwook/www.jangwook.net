---
title: 'MCP vs A2A vs Open Responses — AI 에이전트 프로토콜 실전 비교'
description: 'MCP, A2A, Open Responses 세 프로토콜의 설계 목적과 생태계를 비교합니다. 2026년 실전 에이전트 프로젝트에서 각 프로토콜의 사용 시점과 조합 방법, OpenAI·Google·Anthropic이 벌이는 에이전트 통신 표준 경쟁의 핵심을 정리했습니다.'
pubDate: '2026-04-25'
heroImage: '../../../assets/blog/mcp-vs-a2a-vs-open-responses-agent-protocol-comparison-2026-hero.jpg'
tags: ['MCP', 'A2A', 'AI 에이전트', '프로토콜 비교']
relatedPosts:
  - slug: 'a2a-mcp-hybrid-architecture-production-guide'
    score: 0.92
    reason:
      ko: 'MCP와 A2A 각각의 역할을 이해했다면, 두 프로토콜을 함께 쓰는 프로덕션 아키텍처 설계가 다음 단계다'
      ja: 'MCPとA2Aそれぞれの役割を理解したなら、両プロトコルを組み合わせたプロダクションアーキテクチャ設計が次のステップだ'
      en: 'If you understand what MCP and A2A each do, the next question is how to combine them in a production architecture'
      zh: '理解了MCP和A2A各自的角色之后，下一步就是在生产架构中如何组合使用这两个协议'
  - slug: 'openai-open-responses-agentic-standard'
    score: 0.87
    reason:
      ko: 'Open Responses 스펙이 처음 발표됐을 때 어떤 맥락이었는지, 에이전틱 표준 경쟁에서 OpenAI의 포지션을 확인할 수 있다'
      ja: 'Open Responsesがどんな文脈で発表されたか、エージェンティック標準競争でOpenAIのポジションを確認できる'
      en: 'Context on how Open Responses was announced and what OpenAI is positioning itself as in the agentic standards landscape'
      zh: '了解Open Responses最初发布的背景，以及OpenAI在智能体标准竞争中的定位'
  - slug: 'claude-code-agentic-workflow-patterns-5-types'
    score: 0.80
    reason:
      ko: '프로토콜 레이어 아래에서 Claude Code 에이전틱 워크플로우가 실제로 어떤 패턴으로 구현되는지 구체적으로 살펴볼 수 있다'
      ja: 'プロトコルレイヤーの下でClaude Codeエージェンティックワークフローが実際にどんなパターンで実装されるかを具体的に見られる'
      en: 'See how Claude Code agentic workflows are actually implemented — the patterns that sit below the protocol layer'
      zh: '深入了解在协议层之下，Claude Code智能体工作流的具体实现模式'
  - slug: 'ai-agent-framework-comparison-2026-langgraph-crewai-dapr-production'
    score: 0.77
    reason:
      ko: '프레임워크 선택이 MCP와 A2A 지원 수준에 어떤 영향을 미치는지, LangGraph vs CrewAI vs Dapr 비교에서 확인할 수 있다'
      ja: 'フレームワーク選択がMCPとA2Aのサポートレベルにどう影響するか、LangGraph vs CrewAI vs Dapr比較で確認できる'
      en: 'How your framework choice affects MCP and A2A support levels — the LangGraph vs CrewAI vs Dapr breakdown'
      zh: '了解框架选择如何影响MCP和A2A的支持程度——LangGraph vs CrewAI vs Dapr的详细比较'
  - slug: 'anthropic-agent-skills-standard'
    score: 0.74
    reason:
      ko: 'MCP와 맞물리는 Anthropic Agent Skills 표준이 에이전트 역량 확장 방식을 어떻게 바꾸는지 들여다볼 수 있다'
      ja: 'MCPと組み合わさるAnthropicのAgent Skills標準が、エージェント能力拡張の方法をどう変えるかを掘り下げられる'
      en: "Anthropic's Agent Skills standard works with MCP to redefine how agent capabilities are extended and composed"
      zh: 'Anthropic的Agent Skills标准与MCP协同，重新定义了智能体能力的扩展和组合方式'
---

2025년 하반기부터 AI 에이전트 관련 표준이 쏟아지기 시작했다. Anthropic이 MCP를 Linux Foundation에 기증하고, Google이 A2A를 발표했고, OpenAI는 Open Responses 스펙을 공개했다. 개발자 입장에서는 좋은 신호인데, 문제가 있다. 세 개가 각각 뭘 하는지, 서로 경쟁 관계인지, 아니면 같이 써야 하는 건지가 불명확하다.

나도 처음엔 "또 표준 전쟁이구나"라고 생각했다. 그런데 직접 MCP 서버를 몇 개 만들어보고, A2A 스펙 문서를 들여다보고 나서 생각이 달라졌다. 이 셋은 경쟁하는 게 아니라 **서로 다른 레이어를 담당**한다. 혼란의 원인은 이름만 보면 다 비슷하게 "에이전트 통신 표준"으로 읽히기 때문이다.

이 글에서는 세 프로토콜을 각각 해부하고, 실전에서 언제 무엇을 어떻게 써야 하는지 구체적으로 정리했다. 비교표도 있고, 직접 써본 경험도 담았다.

---

## MCP: 에이전트에게 손을 달아주는 표준

MCP(Model Context Protocol)는 Anthropic이 2024년 말 공개하고, 2025년 12월 Linux Foundation의 Agentic AI Initiative(AAIF)에 기증한 프로토콜이다. 핵심 목적은 하나다: **AI 모델이 외부 도구와 데이터에 접근하는 방식을 표준화하는 것.**

"USB-C for AI"라는 비유가 꽤 잘 맞는다. USB-C 이전에는 노트북마다 충전 단자가 달랐다. MCP 이전에는 Claude용 도구 연결, GPT용 도구 연결이 각각 따로였다. MCP가 공통 커넥터를 만들었다.

구체적으로 MCP가 표준화하는 것은 세 가지다:
- **Tools**: 에이전트가 실행할 수 있는 함수나 액션 (예: 파일 읽기, API 호출, 코드 실행)
- **Resources**: 에이전트가 읽을 수 있는 데이터 (예: 문서, DB 레코드, 파일 시스템)
- **Prompts**: 서버가 제공하는 재사용 가능한 프롬프트 템플릿

2026년 4월 기준으로 MCP 서버는 5,000개를 넘어섰다. GitHub Actions, Notion, PostgreSQL, Brave Search, 브라우저 자동화까지 대부분의 주요 도구에 MCP 서버가 존재한다.

내가 이 블로그 자동화 시스템에서 MCP를 처음 붙였을 때 가장 놀랐던 건 **프레임워크 무관성**이다. Claude Code에서 쓰던 MCP 서버를 다른 MCP 호환 클라이언트에서도 그대로 쓸 수 있다. 물론 실제로는 클라이언트마다 지원하는 기능 범위가 달라서 100% 호환은 아니지만, 방향성 자체가 맞다.

### MCP 2026 로드맵의 핵심 변화

2026년 MCP 로드맵에서 주목할 변화는 **수평 확장(horizontal scaling) 문제 해결**이다. 현재 Streamable HTTP 트랜스포트는 상태(state)가 있는 세션을 유지하는데, 이게 로드 밸런서와 충돌한다. 요청마다 다른 서버 인스턴스로 라우팅되면 세션이 끊긴다. 로드맵은 이 문제를 해결해서 MCP 서버를 진정한 stateless 서비스로 운영할 수 있게 만드는 걸 목표로 한다.

또 하나는 `.well-known` 엔드포인트를 통한 **디스커버리 표준화**다. 지금은 MCP 서버에 실제로 연결해봐야 뭘 제공하는지 알 수 있는데, 앞으로는 연결 없이도 메타데이터만으로 서버 기능을 파악할 수 있게 된다.

[MCP 서버를 직접 구현하는 방법이 궁금하다면 내가 이전에 정리한 WebMCP 분석 글](/ko/blog/ko/webmcp-chrome-146-ai-tool-server)도 참고할 만하다.

### MCP를 쓰면서 느낀 한계

실제로 써보면 몇 가지 마찰이 있다. 첫째, 인증 처리가 서버마다 다르다. OAuth 2.0을 권장하지만 구현 방식은 각자 알아서다. 세 개 서버를 붙이면 세 가지 인증 로직을 관리해야 하는 상황이 생긴다. 표준이 있어도 세부 구현이 일치하지 않는 문제다.

둘째, 앞서 말한 수평 확장 문제. 지금 MCP를 프로덕션에 올리려면 로드 밸런서 뒤에서 sticky session을 쓰거나, 상태를 Redis에 저장하는 식의 우회책이 필요하다. 2026년 로드맵이 이를 해결하겠다고 했으니 기다리면 되긴 하지만, 지금 당장 대규모 배포를 고려한다면 이 점을 미리 알고 있어야 한다.

셋째, 버전 관리. MCP 서버가 업데이트되면 클라이언트가 새 기능을 즉시 알기가 어렵다. 디스커버리 표준이 아직 정착 전이라 서버 변경 사항을 클라이언트에 전파하는 방법이 관례에 의존하는 경우가 많다.

그럼에도 불구하고, MCP를 선택하지 않을 이유가 없다. 생태계 크기와 주요 프레임워크 지원이 이미 압도적이다. 위 한계들은 실전에서 관리 가능하고, 로드맵이 실제로 해결 방향으로 움직이고 있다.

---

## A2A: 에이전트들이 서로 말을 걸기 시작하다

A2A(Agent2Agent)는 Google이 2025년 4월 발표하고, 2025년 6월 Linux Foundation에 기증한 프로토콜이다. 목적이 MCP와 다르다: **에이전트 간 통신과 협업을 표준화하는 것.**

MCP가 "에이전트 ↔ 도구" 관계라면, A2A는 "에이전트 ↔ 에이전트" 관계다.

A2A가 해결하려는 문제는 이렇다. 예를 들어 여행 예약 에이전트가 있고, 호텔 검색 전문 에이전트, 항공권 검색 전문 에이전트가 따로 있다고 치자. 여행 예약 에이전트가 이 두 전문 에이전트에게 작업을 위임하려면 어떻게 해야 할까? MCP는 이 문제를 다루지 않는다. 그게 A2A의 영역이다.

### A2A v1.0의 핵심 개념

2026년 초 출시된 A2A v1.0의 핵심 구성:

**Agent Card**: 에이전트가 자신의 역량을 JSON 형식으로 광고하는 문서. 다른 에이전트가 "이 일을 맡길 수 있는 에이전트가 누구지?"를 파악할 때 Agent Card를 읽는다.

**Task 기반 통신**: 에이전트 간 소통은 Task 단위로 이루어진다. 작업이 즉시 완료될 수도 있고, 장시간 실행되는 경우 진행 상태를 동기화하는 메커니즘이 있다.

**Signed Agent Cards (v1.0 핵심)**: 암호화 서명으로 Agent Card의 진위를 검증할 수 있다. "이 에이전트는 정말 이 도메인이 발급한 게 맞아"라는 신뢰 기반을 만드는 것. 분산 에이전트 생태계에서 가짜 에이전트를 걸러내는 메커니즘이다.

2026년 4월 기준 150개 이상의 조직이 A2A를 채택했고, Microsoft, AWS, Salesforce, SAP, ServiceNow에서 프로덕션 배포를 운영 중이다.

솔직히 말하면, A2A 스펙 문서를 처음 읽었을 때 "이게 얼마나 실용적인가"를 회의적으로 봤다. 에이전트가 서로 직접 소통한다는 개념 자체는 멋지지만, 실제로 이걸 안전하게 운영하려면 신뢰 모델이 복잡해진다. v1.0의 Signed Agent Cards가 그 방향을 잡아가고 있지만, 프로덕션에서 완전히 신뢰하기엔 아직 초기 단계라고 본다.

실제로 [A2A와 MCP를 프로덕션 환경에서 함께 쓰는 아키텍처 패턴](/ko/blog/ko/a2a-mcp-hybrid-architecture-production-guide)을 따로 정리했는데, 레이어를 어떻게 나누는지가 핵심이다.

### A2A의 현실적 고민: "믿어도 되는 에이전트인가"

A2A에서 내가 가장 신중하게 보는 부분은 신뢰 체계다. Signed Agent Cards는 "이 도메인이 이 에이전트를 발급했다"를 검증하지만, "이 에이전트가 주어진 작업을 안전하게 처리한다"를 보증하진 않는다. 도메인 소유권과 에이전트 행동 신뢰성은 다른 문제다.

예를 들어, 외부 A2A 에이전트가 내 시스템에서 파일을 요청하면? Agent Card를 검증해서 발신 도메인은 알 수 있지만, 그 에이전트가 실제로 악의적 프롬프트로 오염되지 않았는지는 별도 보안 레이어가 필요하다. 프롬프트 인젝션 공격이 A2A 채널을 통해 전파될 가능성은 실제 위협이다.

이 문제는 A2A가 나쁘다는 게 아니라, 실전 배포 시 반드시 고려해야 하는 보안 레이어가 추가로 필요하다는 의미다. 외부 에이전트와 통신할 때는 입력 검증, 권한 범위 제한, 액션 감사 로그를 A2A 레이어 위에 반드시 구축해야 한다.

---

## Open Responses: API 호환성을 표준화하려는 OpenAI의 시도

Open Responses는 2026년 2월 OpenAI가 공개한 오픈 스펙이다. 성격이 MCP, A2A와 다르다. 이 둘은 **에이전트가 어떻게 통신하는가**를 다루지만, Open Responses는 **에이전트 워크플로우를 어떻게 API로 노출하는가**를 다룬다.

OpenAI의 Responses API를 기반으로 만들어진 스펙인데, 기본 개념은 이렇다: Chat Completions API에서 Responses API로 넘어가면서 생긴 표준을 오픈해서, 다른 모델 제공자들도 같은 인터페이스로 에이전틱 워크플로우를 제공할 수 있게 하자는 것이다.

지원 생태계: Hugging Face, Vercel, OpenRouter가 채택했고, Ollama, vLLM, LM Studio 같은 로컬 인퍼런스 툴에서도 지원한다. 즉, OpenAI API로 짠 에이전틱 코드가 로컬 모델에서도 돌아간다는 게 핵심 가치 제안이다.

아직은 스펙과 컨포먼스 테스트 툴이 openresponses.org에 있고, 대형 프로덕션 검증 사례가 많지 않다. Hugging Face와 Vercel이 지지하는 건 의미 있지만, "다른 벤더들이 OpenAI의 API 설계를 표준으로 받아들인다"는 전제가 얼마나 현실화될지는 지켜봐야 한다.

내 솔직한 평가: Open Responses는 MCP나 A2A와 다른 레이어에 있기 때문에 "경쟁"이라기보다 보완 관계다. 하지만 지금 당장 실전에서 이 스펙을 쫓아야 할 이유는 크지 않다. MCP와 A2A가 더 범용적이고 생태계가 성숙해있다.

한 가지 주목할 점은 OpenAI가 이미 자사 Responses API에서 MCP 서버 직접 호출을 지원한다는 것이다. 즉, Open Responses와 MCP는 이미 실질적으로 연결되어 있다. Open Responses 스펙 위에서 MCP 도구를 쓰는 게 가능하고, 이 조합이 앞으로 어떻게 표준화될지는 흥미로운 관전 포인트다. Open Responses가 "에이전틱 루프 + MCP 도구"의 표준 조합을 정의하는 방향으로 발전한다면, 중요도가 달라질 수 있다. 지금은 그 전개가 불확실하다.

---

## 세 프로토콜을 나란히 놓으면

아래 표가 핵심이다:

| | MCP | A2A | Open Responses |
|---|---|---|---|
| **설계 목적** | 에이전트 ↔ 도구 연결 | 에이전트 ↔ 에이전트 협업 | API 에이전틱 루프 표준화 |
| **비유** | USB-C (공통 커넥터) | HTTP (에이전트 간 통신) | REST API 설계 표준 |
| **주도** | Anthropic → AAIF | Google → Linux Foundation | OpenAI |
| **현재 버전** | 2025-11-25 | v1.0 (2026 초) | Beta |
| **생태계 성숙도** | 높음 (5,000+ 서버) | 높음 (150+ 조직) | 낮음 (초기) |
| **트랜스포트** | Streamable HTTP, stdio | JSON-RPC, gRPC | WebSocket, HTTP |
| **보안 모델** | OAuth, 서버별 인증 | Signed Agent Cards | 스펙 정의 중 |
| **언제 씀** | 도구 접속이 필요할 때 항상 | 멀티 에이전트 위임 시 | OpenAI 호환 워크플로우 |

한 가지 강조하고 싶은 게 있다: **MCP와 A2A는 OR 관계가 아니라 AND 관계다.** 2026년 실전 멀티에이전트 시스템은 대부분 이 둘을 같이 쓴다. 각 에이전트는 자신의 도구를 MCP로 연결하고, 에이전트들 간의 협업은 A2A로 한다.

---

## 실전 계층 구조: 어떻게 조합하는가

실제 프로덕션 아키텍처에서 이 세 프로토콜이 어떻게 자리잡는지 예를 들면:

**시나리오: 자동화 리서치 시스템**

```
오케스트레이터 에이전트
├── (A2A) → 웹 리서치 전문 에이전트
│   └── (MCP) → Brave Search MCP 서버
│   └── (MCP) → 웹 스크래핑 MCP 서버
├── (A2A) → 문서 분석 전문 에이전트
│   └── (MCP) → 파일 시스템 MCP 서버
│   └── (MCP) → PDF 처리 MCP 서버
└── (MCP) → 결과 저장소 MCP 서버
```

오케스트레이터가 A2A로 전문 에이전트에게 위임하고, 각 전문 에이전트는 MCP로 자신의 도구에 접근한다. Open Responses가 있다면 오케스트레이터의 외부 API 인터페이스 레이어에 들어갈 수 있다.

이 구조에서 각 레이어가 독립적으로 교체 가능하다는 점이 중요하다. MCP 서버 하나를 다른 구현으로 바꿔도 A2A 레이어에 영향이 없다. 반대로, A2A를 다른 에이전트 통신 방식으로 바꿔도 MCP 서버는 그대로 쓸 수 있다. 레이어 분리가 제대로 설계됐다는 증거다.

한 가지 실용적인 팁: 지금 당장 A2A를 쓰지 않더라도, 에이전트 간 인터페이스를 처음부터 A2A 친화적으로 설계해두는 게 낫다. 구체적으로는 에이전트 간 통신을 함수 호출이 아닌 명시적인 Task 객체 단위로 추상화해두면, 나중에 A2A로 마이그레이션할 때 리팩토링 범위가 훨씬 줄어든다.

[Claude Code에서 에이전틱 워크플로우 패턴을 설계하는 5가지 방식](/ko/blog/ko/claude-code-agentic-workflow-patterns-5-types)에서 이 계층 구조의 구현 예시를 좀 더 상세히 다뤘다.

---

## 지금 당장 뭘 배워야 하는가

각 프로토콜의 우선순위를 솔직하게 정리하면:

**즉시 배울 것: MCP**

지금 에이전트 개발을 하고 있다면 MCP부터 해야 한다. 이유:
- 5,000개 넘는 서버 생태계가 이미 존재
- Claude Code, OpenAI Agents SDK, LangGraph 등 주요 프레임워크가 모두 지원
- Streamable HTTP가 표준이 됐고, 스펙이 충분히 안정적
- [Anthropic Agent Skills 표준](/ko/blog/ko/anthropic-agent-skills-standard)과 맞물려 더 강력한 패턴이 만들어지고 있다

MCP를 배우는 최선의 방법은 직접 간단한 서버 하나를 만들어보는 것이다. 파일 시스템 조회 서버나 특정 API 래퍼 서버를 30분 안에 만들 수 있다. 그 경험이 MCP가 무엇을 표준화하는지를 이론보다 훨씬 명확하게 이해하게 해준다. 직접 만들어보기 전과 후의 이해도 차이가 꽤 크다는 걸 경험했다.

**중기적으로: A2A**

멀티에이전트 시스템을 프로덕션에 올릴 계획이 있다면 A2A를 공부해야 한다. 150개 조직 채택, Linux Foundation 거버넌스, v1.0 안정성. 준비됐다. 다만 Signed Agent Cards 기반 신뢰 모델이 실무에서 얼마나 검증됐는지는 아직 지켜보는 중이다.

**관망: Open Responses**

현재 구조에서 OpenAI 호환성이 필요하지 않다면 서두를 이유가 없다. 스펙은 흥미롭지만 대형 프로덕션 사례가 없다.

한 가지 더: MCP와 A2A 모두 Linux Foundation 산하에 있다. 표준 전쟁이 벌어지는 게 아니라 같은 재단에서 서로 다른 문제를 해결하는 방향으로 정리되고 있다는 게, 2024년과 가장 달라진 점이다.

---

## 거버넌스 질문: 벤더 중립성은 얼마나 믿을 수 있나

MCP는 Anthropic이 설계했고, A2A는 Google이 설계했다. 둘 다 Linux Foundation에 기증됐지만, 처음 설계한 회사가 커뮤니티 방향에 더 큰 영향력을 갖는 건 피할 수 없다. 이 점을 솔직히 짚고 싶다.

MCP의 경우, Anthropic이 Claude 생태계 중심으로 설계한 흔적이 있다. Resources 개념이나 Prompts 지원은 다른 에이전트 플랫폼에서는 덜 활용되는 기능이다. 클라이언트 구현이 Claude Code 쪽에 가장 잘 맞는 건 우연이 아니다.

A2A는 Google Cloud와 Vertex AI 에이전트가 최초 레퍼런스 구현이다. Google 에코시스템 안에서 검증됐다는 건 강점이지만, 비Google 스택에서의 독립 검증 사례가 아직 제한적이다.

그렇다고 두 프로토콜을 배척할 이유는 없다. Linux Foundation 거버넌스가 실질적으로 작동하고 있고, 외부 기여자들이 스펙 방향에 목소리를 낼 수 있는 구조가 갖춰지고 있다. 하지만 "완전한 벤더 중립"이라는 말은 과장이다. 어떤 표준이든 처음 설계한 회사의 사용 패턴에 최적화되는 경향이 있다.

개인적으로 이 현실을 인식하면서 MCP를 쓰는 게 맞다고 본다. 장점이 분명하고, 거버넌스가 성숙해가고 있다. 다만 특정 벤더의 설계 편향이 자신의 아키텍처와 충돌하는 지점이 있으면 직접 기여하거나 우회 구현을 선택할 준비를 하면 된다.

---

## 내 결론

MCP는 지금 당장 써야 하는 도구다. 에이전트에게 외부 세계에 접근하는 방법을 주는 레이어고, 생태계가 충분히 성숙했다. A2A는 멀티에이전트 시스템을 진지하게 고민하고 있다면 v1.0부터 공부해야 한다. Open Responses는 포트폴리오로 알아두되, 당장 아키텍처 결정에 반영하기엔 이르다.

세 개를 "프로토콜 표준 전쟁"으로 보면 피로해진다. 각각 다른 문제를 풀고 있고, 세 개가 다 필요한 시스템이 충분히 많다. 내가 내린 실용적 결론은: MCP 먼저, A2A는 필요할 때, Open Responses는 업데이트 구독 수준으로 팔로우.

그리고 [AI 에이전트 프레임워크 선택](/ko/blog/ko/ai-agent-framework-comparison-2026-langgraph-crewai-dapr-production)도 이 프로토콜 선택과 맞물리는 문제다 — 어떤 프레임워크를 쓰느냐에 따라 MCP와 A2A 지원 수준이 다르기 때문이다.

2026년 현재, 에이전트 개발자에게 가장 유용한 멘탈 모델은 이렇다. MCP는 이미 인프라다 — 선택의 문제가 아니라 씁쓸 수밖에 없는 표준이다. A2A는 곧 인프라가 될 것 같다 — 준비할 때다. Open Responses는 흥미로운 실험이지만, 아직은 하나의 벤더가 만든 API 스펙에 불과하다.

이 세 가지를 다 알면 다른 개발자와의 대화에서 맥락을 잡을 수 있다. "프로토콜 스택이 어떻게 됩니까"라고 물었을 때 "MCP로 도구를 붙이고, A2A로 에이전트 간 위임을 처리합니다"라고 답할 수 있는 팀이 그렇지 않은 팀보다 실질적으로 앞서 있다.

AI 에이전트 아키텍처가 성숙해가는 방향은 분명하다. 툴 연결 레이어(MCP), 에이전트 간 협업 레이어(A2A), API 호환성 레이어(Open Responses) — 각 레이어가 독립적으로 발전하면서 전체 스택이 점점 표준화되고 있다. 지금 이 세 가지를 이해하는 것은 단순히 유행을 따르는 것이 아니라, 앞으로 2〜3년 동안 에이전트 인프라를 설계할 때 반복해서 돌아오게 될 기본기를 쌓는 일이다.
