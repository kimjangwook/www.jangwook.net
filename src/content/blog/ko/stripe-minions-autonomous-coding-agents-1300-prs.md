---
title: 'Stripe Minions — Slack 이모지 하나로 주당 1,300개 PR을 만드는 코딩 에이전트'
description: >-
  Stripe가 자율 코딩 에이전트 Minions로 주당 1,300개 이상의 PR을 생산하는 방법. Blueprint 아키텍처, 샌드박스
  VM, 3단계 피드백 루프의 실제 엔지니어링을 분석한다.
pubDate: '2026-04-03'
heroImage: '../../../assets/blog/stripe-minions-autonomous-coding-agents-1300-prs-hero.jpg'
tags:
  - ai-agent
  - stripe
  - autonomous-coding
  - mcp
  - ci-cd
  - engineering
relatedPosts:
  - slug: software-factory-zero-code-development
    score: 0.92
    reason:
      ko: 'Stripe Minions가 실제 기업에서 어떻게 작동하는지 봤다면, 코드를 한 줄도 안 쓰는 개발 프로세스의 전체 그림이 궁금할 것이다.'
      ja: 'Stripe Minionsの実例を見たなら、コードを一行も書かない開発プロセスの全体像が気になるはずだ。'
      en: 'After seeing how Stripe Minions works in practice, you will want the bigger picture of zero-code development processes.'
      zh: '看完Stripe Minions的实际运作后，你可能想了解零代码开发流程的全景。'
  - slug: paperclip-zero-human-company-agent-orchestration
    score: 0.90
    reason:
      ko: 'Minions는 사람이 리뷰만 하는 구조인데, 여기서 한 발 더 나아가 사람 없이 회사를 운영하는 실험 사례를 다룬다.'
      ja: 'Minionsは人間がレビューだけする構造だが、さらに一歩進んで人間なしで会社を運営する実験事例を扱う。'
      en: 'Minions keeps humans in the review loop — this post explores what happens when you remove humans from the loop entirely.'
      zh: 'Minions让人类只负责Review，而这篇文章探讨了完全去掉人类环节的实验案例。'
  - slug: production-grade-ai-agent-design-principles
    score: 0.88
    reason:
      ko: 'Stripe의 Blueprint 패턴과 샌드박스 설계에 감명받았다면, 프로덕션 AI 에이전트 설계의 9가지 원칙이 더 체계적인 프레임워크를 제공한다.'
      ja: 'StripeのBlueprintパターンとサンドボックス設計に感銘を受けたなら、プロダクションAIエージェント設計の9原則がより体系的なフレームワークを提供する。'
      en: 'If the Blueprint pattern and sandbox design impressed you, these 9 design principles for production AI agents offer a more systematic framework.'
      zh: '如果Blueprint模式和沙箱设计给你留下了深刻印象，这9条生产级AI Agent设计原则提供了更系统化的框架。'
  - slug: mcp-servers-toolkit-introduction
    score: 0.86
    reason:
      ko: 'Minions의 핵심 인프라인 400개 이상의 MCP 도구가 궁금하다면, MCP 서버를 직접 구축하는 방법을 이 글에서 다룬다.'
      ja: 'Minionsの核心インフラである400以上のMCPツールが気になるなら、MCPサーバーを自分で構築する方法をこの記事で扱う。'
      en: 'Curious about the 400+ MCP tools powering Minions? This post covers how to build your own MCP servers.'
      zh: '对驱动Minions的400多个MCP工具感到好奇？这篇文章介绍了如何构建自己的MCP服务器。'
  - slug: self-healing-ai-systems
    score: 0.85
    reason:
      ko: 'Minions의 3단계 피드백 루프에서 에이전트가 스스로 버그를 수정하는 부분이 인상적이었다면, 자가 치유 AI 시스템의 아키텍처를 더 깊이 다룬다.'
      ja: 'Minionsの3段階フィードバックループでエージェントが自らバグを修正する部分が印象的だったなら、自己修復AIシステムのアーキテクチャをより深く扱う。'
      en: 'If the self-fixing aspect of Minions 3-tier feedback loop impressed you, this post dives deeper into self-healing AI system architectures.'
      zh: '如果Minions三层反馈循环中Agent自我修复Bug的部分给你留下了印象，这篇文章更深入地探讨了自愈AI系统的架构。'
---

Slack에서 버그 리포트에 이모지 하나를 달면, 10초 뒤 샌드박스 VM이 뜨고, 코드를 고치고, 테스트를 돌리고, PR을 올린다. 사람은 리뷰만 한다. Stripe가 올해 2월에 공개한 내부 시스템 "Minions"의 작동 방식이다.

주당 1,300개 이상의 PR. 전부 사람이 한 줄도 안 쓴 코드. 연간 1조 달러 이상의 결제를 처리하는 회사에서.

처음 이 숫자를 봤을 때 나는 반신반의했다. 1,300이라는 숫자 자체보다, "결제 인프라에서 자율 에이전트가 프로덕션 코드를 쓴다"는 부분이 쉽게 믿기지 않았거든. 그래서 Stripe 엔지니어링 블로그와 관련 자료를 꽤 깊이 파봤다.

## Minions가 뭔가

한 줄로 요약하면, Slack 메시지나 버그 티켓에서 시작해서 PR 머지까지 사람이 코드를 안 쓰는 자율 코딩 에이전트다.

핵심 컨셉은 **Blueprint**라는 오케스트레이션 패턴인데, 결정론적 코드 노드와 LLM 에이전트 루프를 번갈아 실행하는 구조다. git 체크아웃이나 린트 같은 건 고정된 스크립트가 처리하고, "이 버그를 어떻게 고칠지"는 LLM이 판단한다. Stripe는 이걸 "contained boxes"라고 표현한다 — LLM을 통제된 상자 안에 넣으면 시스템 전체의 신뢰성이 복리로 올라간다는 철학이다.

에이전트의 베이스는 Block(구 Square)의 오픈소스 코딩 에이전트 Goose를 포크한 것이다. 여기에 Stripe 내부 도구와 컨텍스트를 MCP(Model Context Protocol)로 연결했다. 내부 Toolshed 서버에 400개 이상의 MCP 도구가 있다고 한다.

## 샌드박스: 제약이 곧 자유다

모든 Minion은 격리된 VM에서 실행된다. 인간 엔지니어가 쓰는 것과 동일한 개발 환경인데, 코드와 서비스가 미리 로드되어 있어서 10초 만에 뜬다.

중요한 건 이 VM에 **인터넷 접근도 프로덕션 접근도 없다**는 점이다. 완전한 샌드박스. 이 제약 덕분에 역설적으로 퍼미션 체크가 필요 없어지고, 병렬화가 무제한으로 가능해진다. 보안 관점에서도 깔끔하다 — 에이전트가 외부로 뭔가를 유출할 경로 자체가 없으니까.

나는 이 설계 판단이 Minions에서 가장 영리한 부분이라고 본다. 대부분의 AI 에이전트 프로젝트가 "에이전트에게 더 많은 권한을"이라는 방향으로 가는데, Stripe는 정반대로 갔다. 권한을 극도로 제한하되, 제한된 범위 안에서의 자율성을 최대화한 거다.

## 3단계 피드백 루프

코드를 쓴 뒤 품질을 검증하는 과정도 체계적이다.

**Tier 1 — 로컬 린트 (5초 미만)**: 타이포나 포매팅 오류를 즉시 잡는다. 에이전트가 바로 고친다.

**Tier 2 — 선택적 CI**: Stripe에는 테스트가 300만 개 이상 있다. 전부 돌리면 시간이 너무 오래 걸리니까, 변경된 파일에 관련된 테스트만 골라서 실행한다. autofix가 가능한 실패는 자동 적용.

**Tier 3 — 재시도 상한**: CI가 실패하면 에러를 에이전트에게 돌려보내서 수정하게 한다. 다만 **최대 2회**까지만. "LLM이 여러 라운드를 돌아도 수확 체감이 심하다"는 게 Stripe 팀의 판단이다.

이 2회 상한이 꽤 현실적인 엔지니어링 결정이라고 느꼈다. 무한 재시도는 비용도 비용이지만, 실제로 2번 만에 못 고치면 3번째에도 못 고칠 확률이 높다. 차라리 사람에게 넘기는 게 맞다.

## 실제로 뭘 하나

Minions가 처리하는 작업은 생각보다 다양하다:

- Slack에서 올라온 버그 리포트를 받아 코드를 수정하고 PR을 생성
- 기능 요청을 기반으로 새 코드를 작성
- flaky 테스트를 감지하면 자동으로 티켓을 만들고 "minion-fix" 버튼을 달아둠
- 내부 문서, 피처 플래그, 코드 인텔리전스(Sourcegraph) 등에서 컨텍스트를 끌어옴

진입점도 여럿이다. Slack이 주된 인터페이스이고, CLI, 웹 UI, 내부 플랫폼의 버튼 등. "One-shot" 철학을 따르는데, 한 번의 지시로 작업을 끝까지 완료하도록 설계되어 있다. 반복적인 대화형 수정이 아니라, 결과물을 한 번에 내놓고, 필요하면 사람이 그 위에 수정하는 방식이다.

## 그런데 이게 정말 되나?

솔직히, 몇 가지는 아직 궁금하다.

첫째, 1,300개 PR의 **성격**이다. 전부 의미 있는 기능 변경인지, 아니면 린트 수정이나 의존성 업데이트 같은 기계적 작업이 상당 부분을 차지하는지. Stripe 블로그는 이 비율을 구체적으로 밝히지 않았다. 만약 80%가 타입 수정이나 import 정리라면, 인상적이긴 하지만 맥락이 좀 달라진다.

둘째, **리뷰 부담**이다. 주당 1,300개 PR이 올라온다는 건, 리뷰어 입장에서는 1,300개를 봐야 한다는 뜻이기도 하다. AI가 쓴 코드의 리뷰는 사람이 쓴 코드와 다르다 — 에이전트는 컨벤션을 잘 따르지만 "왜 이렇게 했는지"의 의도가 불투명할 수 있다. Stripe 규모의 엔지니어링 조직이니까 감당이 되겠지만, 이걸 50명짜리 스타트업이 따라하면 리뷰 병목이 새로운 문제가 될 수 있다.

셋째, Ruby + Sorbet라는 Stripe의 기술 스택 특수성. 수억 줄의 코드베이스, 강타입 Ruby, 자체 라이브러리가 많은 환경에서 에이전트가 잘 작동하는 건 그 환경에 맞게 MCP 도구와 규칙을 정교하게 만들었기 때문이다. 이게 범용적으로 이식 가능한 패턴인지, 아니면 Stripe급 인프라 투자가 전제인지는 별개의 문제다.

## 가져갈 수 있는 것

Stripe 규모가 아니더라도 배울 점은 있다.

**"벽이 모델보다 중요하다"** — Stripe 엔지니어 Steve Kaliski가 한 말인데, 나도 동의한다. 에이전트의 성능을 결정하는 건 LLM의 능력이 아니라 에이전트를 둘러싼 제약과 도구의 품질이다. 좋은 샌드박스, 잘 만든 MCP 도구, 명확한 Blueprint가 있으면 모델은 교체 가능하다.

Blueprint 패턴 — 결정론적 노드와 에이전트 루프의 교대 — 도 작은 규모에서 적용할 만하다. 우리 팀에서 Claude Code로 자동화를 만들 때도 비슷한 구조를 쓰는데, "고정된 단계"와 "LLM이 판단하는 단계"를 명확히 분리하면 디버깅이 훨씬 쉬워진다.

300만 개 테스트에서 관련된 것만 선별해서 돌리는 selective CI도 좋은 아이디어다. 에이전트가 아닌 일반 개발 프로세스에도 도입할 만한 접근법이라서, 이건 따로 찾아볼 생각이다.

---

Stripe Minions가 "모든 회사가 따라할 수 있는 템플릿"인지는 아직 모르겠다. 400개 MCP 도구, 수억 줄 코드베이스 전용 규칙, 10초 만에 뜨는 샌드박스 VM — 이건 수년간의 개발 인프라 투자 위에 올라간 결과물이다.

하지만 핵심 아이디어 — 에이전트의 권한을 줄이고 환경을 통제하면 오히려 신뢰성이 올라간다 — 는 규모와 무관하게 유효하다. 그리고 이 방향이 맞다면, 앞으로 중요해지는 건 "더 똑똑한 모델"이 아니라 "더 잘 만든 벽"이다.
