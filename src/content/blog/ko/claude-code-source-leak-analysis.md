---
title: >-
  Claude Code 소스코드 유출 — 51만 줄에서 읽어낸 에이전트 아키텍처의 속살
description: >-
  Anthropic의 npm 패키지 배포 실수로 Claude Code 전체 소스가 공개됐다. 에이전트 루프, 메모리 시스템, 비용 최적화
  전략까지 — 유출된 코드에서 개발자가 실제로 가져갈 수 있는 것들을 정리한다.
pubDate: '2026-04-05'
heroImage: ../../../assets/blog/claude-code-source-leak-analysis-hero.jpg
tags:
  - claude-code
  - anthropic
  - ai-agent
  - source-code
  - security
relatedPosts:
  - slug: claude-code-hooks-workflow
    score: 0.91
    reason:
      ko: 유출 코드에서 발견된 에이전트 아키텍처를 이해했다면, Claude Code 훅 시스템의 실제 활용법도 함께 보면 좋다.
      ja: 流出コードで発見されたエージェントアーキテクチャを理解したなら、Claude Codeフックシステムの実践的な活用法も併せて読むと良い。
      en: If you understood the agent architecture from the leaked code, the practical hook system usage guide pairs well with it.
      zh: 如果你理解了泄露代码中的Agent架构，那么Claude Code Hook系统的实际应用指南也值得一读。
  - slug: claude-code-plugins-complete-guide
    score: 0.88
    reason:
      ko: 유출된 코드의 44개 피처 플래그 중 일부는 이미 플러그인으로 공식 출시됐다. 공식 기능과 미출시 기능의 차이를 비교해볼 수 있다.
      ja: 流出コードの44個のフィーチャーフラグの一部はすでにプラグインとして公式リリースされた。公式機能と未リリース機能の違いを比較できる。
      en: Some of the 44 leaked feature flags have already shipped as official plugins. Compare official features with unreleased ones.
      zh: 泄露代码中44个功能标志的一部分已作为插件正式发布。可以比较官方功能与未发布功能的差异。
  - slug: ai-coding-secrets-sprawl-mcp-config-security
    score: 0.90
    reason:
      ko: 유출 사건의 보안 시사점과 직접 연결된다. MCP 설정과 시크릿 관리의 위험성을 다룬 글이다.
      ja: 流出事件のセキュリティ上の示唆と直接つながる。MCP設定とシークレット管理のリスクを扱った記事だ。
      en: Directly connected to the security implications of the leak. Covers MCP config and secret management risks.
      zh: 与泄露事件的安全影响直接相关。讨论了MCP配置和密钥管理的风险。
  - slug: litellm-supply-chain-attack-ai-dependency-security
    score: 0.87
    reason:
      ko: npm 소스맵 유출도 결국 공급망 보안 문제다. AI 도구의 의존성 보안을 다른 각도에서 분석한 글이다.
      ja: npmソースマップ流出も結局サプライチェーンセキュリティの問題だ。AIツールの依存関係セキュリティを別の角度から分析した記事。
      en: The npm source map leak is ultimately a supply chain security issue. Analyzes AI tool dependency security from a different angle.
      zh: npm source map泄露归根结底也是供应链安全问题。从不同角度分析了AI工具依赖安全。
  - slug: production-grade-ai-agent-design-principles
    score: 0.85
    reason:
      ko: 유출된 에이전트 루프와 메모리 설계를 참고하려면, 프로덕션급 AI 에이전트의 설계 원칙도 함께 읽어야 한다.
      ja: 流出されたエージェントループとメモリ設計を参考にするなら、プロダクショングレードAIエージェントの設計原則も一緒に読むべきだ。
      en: If you want to reference the leaked agent loop and memory design, read this alongside for production-grade AI agent design principles.
      zh: 如果要参考泄露的Agent循环和内存设计，也应该一起阅读生产级AI Agent的设计原则。
---

3월 31일, Anthropic이 npm에 Claude Code v2.1.88을 배포했다. 평범한 패치 업데이트였어야 했는데, 이 패키지 안에 59.8MB짜리 `.map` 소스맵 파일이 들어 있었다. 보안 연구자 Chaofan Shou가 이걸 X에 올린 뒤, 수 시간 만에 GitHub에서 8만 4천 번 포크됐다.

1,906개 TypeScript 파일. 약 51만 줄의 코드. Claude Code의 전체 클라이언트 사이드 에이전트 하니스가 그대로 드러났다.

나는 이 소스코드를 직접 들여다봤고, 그 안에서 몇 가지 흥미로운 설계 결정을 발견했다. "유출"이라는 단어가 주는 자극적인 뉘앙스보다는, 이 코드베이스에서 에이전트 개발자가 실제로 참고할 만한 패턴들에 집중하려고 한다.

## 어떻게 유출됐나

원인은 Bun이다. Claude Code는 Node.js가 아니라 Bun 런타임 위에서 돌아가는데, Bun에는 프로덕션 빌드에서도 소스맵을 서빙하는 [알려진 버그](https://github.com/oven-sh/bun/issues/28001)가 있었다. 이 이슈는 3월 11일에 이미 리포트됐지만, 유출 시점까지 수정되지 않았다.

Anthropic 쪽에서는 "배포 패키징 과정의 휴먼 에러이며, 보안 침해가 아니다"라고 CNBC, VentureBeat에 밝혔다. 고객 데이터나 인증 정보는 포함되지 않았다고 한다.

그런데 이게 두 번째다. 며칠 전에도 CMS 설정 오류로 미공개 모델 "Mythos" 관련 내부 문서가 유출된 적이 있다. IPO 준비 중이라는 루머가 도는 시점에 운영 보안이 이래도 되나 싶다.

## 에이전트 루프 — 생각보다 단순하지 않다

유출된 코드에서 가장 먼저 눈에 띈 건 에이전트 루프 구조다.

기본적으로 Claude Code는 리액티브 시스템이다. 사용자가 메시지를 보내면 그때 반응한다. 여기까진 평범하다. 그런데 코드 안에 `PROACTIVE`라는 피처 플래그가 있고, 이걸 켜면 `KAIROS`라는 모드가 활성화된다. KAIROS는 하트비트 메커니즘으로 주기적으로 "지금 할 만한 일이 있나?"를 평가하고, 사용자 입력 없이도 자율적으로 행동한다.

쉽게 말하면, 백그라운드에서 24/7 돌면서 "메모리 정리할까?", "이 코드 리팩토링 제안할까?" 같은 판단을 자기 스스로 내리는 데몬 모드다.

내가 이 구조에서 주목한 건 "이니셔티브(무엇을 할지 결정)"와 "실행(실제로 하기)"이 명확히 분리되어 있다는 점이다. KAIROS가 "이거 할 만하다"고 판단해도 실행 권한은 별도 게이트를 통과해야 한다. 자율 에이전트를 만들 때 가장 위험한 게 "AI가 알아서 했는데 큰일 났다" 시나리오인데, 이 분리 설계가 그 리스크를 어느 정도 완화한다.

아직 출시되지 않은 기능이라 실제로 얼마나 잘 작동하는지는 모르겠다.

## 프롬프트 캐싱 — 돈을 아끼는 기술

Claude Code를 좀 써본 사람이라면 토큰 비용이 꽤 나간다는 걸 알 거다. 유출된 코드를 보면 Anthropic도 이걸 심각하게 신경 쓰고 있다.

핵심은 `SYSTEM_PROMPT_DYNAMIC_BOUNDARY`라는 패턴이다. 시스템 프롬프트를 "안 바뀌는 앞부분"과 "매번 바뀌는 뒷부분"으로 쪼갠다. 앞부분은 캐시에 넣고 재사용하면서 비싼 프롬프트 처리 비용을 줄인다.

```typescript
// 유출된 코드에서 발견된 패턴 (간소화)
const systemPrompt = [
  STATIC_INSTRUCTIONS,        // 캐시됨 — 도구 정의, 행동 규칙 등
  SYSTEM_PROMPT_DYNAMIC_BOUNDARY,  // 경계 마커
  DYNAMIC_CONTEXT              // 매번 새로 — 현재 파일 상태, git 정보 등
];
```

Reddit r/ClaudeAI에서는 유출된 코드를 기반으로 "캐시 무효화 버그"를 찾아내서 토큰 소비를 10〜20배 줄였다는 보고도 있었다. Theo Browne 같은 개발자는 이 캐시 무효화 버그가 사용자에게 불필요한 비용을 전가했다고 비판하기도 했다.

이 패턴 자체는 내 프로젝트에서도 쓸 수 있다. LLM API를 호출할 때 시스템 프롬프트의 정적 부분을 분리해서 프롬프트 캐싱을 활용하면, 특히 긴 대화 세션에서 비용을 상당히 줄일 수 있다.

## 3계층 메모리 — 왜 Claude Code가 맥락을 잘 기억하나

메모리 아키텍처가 인상적이었다. 3계층으로 되어 있다:

<strong>1계층 — 경량 인덱스 포인터</strong>: 항상 메모리에 상주. "어떤 주제에 대한 기억이 어디에 저장되어 있는지"만 알려주는 목차 역할.

<strong>2계층 — 토픽 파일</strong>: 필요할 때만 로드. 프로젝트별, 주제별로 분리된 실제 기억 내용.

<strong>3계층 — 트랜스크립트</strong>: grep 연산으로만 접근. 과거 대화 전체를 저장하지만, 검색할 때만 참조.

여기에 `autoDream`이라는 프로세스가 있다. 유휴 상태일 때 메모리를 정리하고 중복을 제거하고 통합한다. 이름이 "autoDream"인 게 재미있다 — 사람이 잠잘 때 기억을 정리하는 것처럼, 에이전트도 쉴 때 기억을 정리한다는 메타포다.

이 설계를 보면서 든 생각: 내가 CLAUDE.md에 프로젝트 컨텍스트를 적어두면 Claude Code가 그걸 잘 활용하는 이유가 이 메모리 구조 때문이었구나. 1계층 인덱스가 "이 프로젝트에 대한 정보는 CLAUDE.md에 있다"는 포인터를 들고 있고, 필요할 때 2계층에서 실제 내용을 불러오는 식이다.

## 언더커버 모드 — 이건 좀 불편하다

유출된 코드 중 `undercover.ts`라는 90줄짜리 파일이 있다. 이게 뭘 하는 거냐면, Claude Code가 외부 오픈소스 프로젝트에 기여할 때 Anthropic의 흔적을 지우는 기능이다.

시스템 프롬프트에 이런 내용이 포함되어 있다:

> "You are operating UNDERCOVER... Your commit messages... MUST NOT contain ANY Anthropic-internal information. Do not blow your cover."

커밋 메시지에서 내부 코드명(Capybara, Numbat, Fennec, Tengu)이나 Slack 채널명을 제거하고, "Claude Code"가 작성했다는 표시도 삭제한다. 되돌릴 수 없는(irreversible) 억제라고 한다.

이건 좀 불편하다. 오픈소스 커뮤니티에서 AI가 기여하는 것 자체는 문제가 아닌데, 그걸 숨기는 건 다른 이야기다. 기여의 출처를 의도적으로 감추는 건 오픈소스의 투명성 원칙과 충돌한다고 본다. Anthropic이 이 기능을 왜 만들었는지 설명하지 않는 한, 신뢰에 금이 간다.

물론, 이게 실제로 사용 중인 기능인지 아니면 실험적으로 만들어두고 안 쓰는 건지는 코드만 봐서 알 수 없다. 피처 플래그로 관리되고 있으니 비활성 상태일 수도 있다.

## 경쟁사 방어 메커니즘

소스코드에서 경쟁사를 의식한 방어 장치도 몇 개 발견됐다.

<strong>Anti-distillation</strong>: API 요청에 `anti_distillation: ['fake_tools']` 플래그를 넣어서 가짜 도구 정의를 주입한다. 경쟁사가 트래픽을 가로채서 학습 데이터로 쓸 때, 이 가짜 데이터가 섞여 들어가게 만드는 것이다. `CONNECTOR_TEXT`라는 서버 측 메커니즘은 어시스턴트 출력을 요약하면서 암호화 서명을 넣어, 추론 체인 전체를 캡처하는 걸 방지한다.

<strong>DRM</strong>: API 요청에 `cch=ed1b0` 같은 플레이스홀더 값이 들어가는데, Bun의 Zig 기반 HTTP 스택이 전송 직전에 이걸 계산된 해시로 교체한다. JavaScript 런타임 아래에서 동작하니까 런타임 패칭으로 우회가 안 된다.

찾아본 바로는, 이런 수준의 anti-distillation 방어를 클라이언트 사이드 코드에 넣은 건 처음 보는 패턴이다. 보통 이런 건 서버에서 처리하지 않나? 클라이언트에 넣으면 결국 코드가 유출됐을 때 (지금처럼) 메커니즘이 다 드러나는 리스크가 있다.

## 숨겨진 기능들 — 44개 피처 플래그

44개의 미출시 피처 플래그가 발견됐다. 그중 몇 가지:

- <strong>백그라운드 에이전트</strong>: 24/7 상시 실행. 하나의 Claude가 여러 워커 Claude를 조율하는 멀티 에이전트 오케스트레이션.
- <strong>크론 스케줄링</strong>: 정해진 시간에 자동 실행.
- <strong>음성 명령 모드</strong>: 말로 지시.
- <strong>Playwright 브라우저 자동화</strong>: 브라우저를 직접 조작.
- <strong>자가 복구 에이전트</strong>: sleep 후 자동 재개.
- <strong>서브에이전트 실행 모델 3종</strong>: fork, teammate, worktree.

그리고 농담 같은 것도 있다. `buddy/companion.ts`라는 파일에 18종의 가상 펫을 키우는 "버디 시스템"이 구현되어 있다. 희귀 등급 티어가 있고, 1% 확률로 빛나는(shiny) 펫이 나온다. 포켓몬인가.

이 기능들 중 일부는 이미 최근 Claude Code 업데이트에서 공식 출시됐다. 백그라운드 에이전트나 크론 스케줄링 같은 건 유출 이후 빠르게 공식화된 느낌이다. 유출이 출시를 앞당겼을 가능성도 있지 않을까?

## 보안 관점에서 짚을 것

유출 자체보다 더 심각한 문제가 있다. 이미 CVE-2025-59536, CVE-2026-21852 같은 취약점이 식별됐는데, 소스코드가 공개되면서 이걸 악용하기가 훨씬 쉬워졌다.

구체적으로는:
- 악의적인 `.claude/` 설정 파일이 포함된 레포를 클론하면 임의 코드 실행(RCE)이 가능
- MCP 서버나 환경 변수를 통한 API 키 탈취

BleepingComputer 보도에 따르면, 실제로 GitHub에서 "Claude Code 유출 분석"을 미끼로 인포스틸러 악성코드를 배포하는 사례가 발견됐다. 유출된 코드를 열어본다고 해킹당하는 건 아니지만, "유출 코드 분석 도구"라고 주장하는 레포는 조심해야 한다.

내 생각에, 코드가 공개되는 것 자체는 장기적으로 보안에 도움이 될 수도 있다. 더 많은 눈이 코드를 검토할 수 있으니까. 문제는 "의도하지 않은 공개"라는 점이다. Anthropic이 준비 없이 코드가 풀려나간 것이고, 그 사이 공격자들이 먼저 취약점을 찾았다면 위험하다.

## 개발자가 가져갈 수 있는 것

유출 코드를 직접 포크해서 쓰는 건 DMCA 문제가 있으니 권하지 않는다. Anthropic은 GitHub에서 8,100개 이상의 레포에 DMCA 테이크다운을 걸었다. 하지만 아키텍처 패턴을 참고하는 건 다른 이야기다.

내가 가장 참고할 만하다고 본 것들:

<strong>프롬프트 캐싱 전략</strong>. 시스템 프롬프트를 정적/동적으로 분리하는 패턴은 LLM API를 쓰는 모든 프로젝트에 적용할 수 있다. Anthropic API의 prompt caching 기능을 쓰면 반복 호출 비용을 크게 줄일 수 있다.

<strong>3계층 메모리 설계</strong>. 인덱스 → 토픽 → 원본 데이터의 계층 구조는 RAG 시스템이나 장기 기억이 필요한 에이전트에 바로 적용 가능하다. 특히 "항상 메모리에 있는 것"과 "필요할 때만 로드하는 것"의 분리가 핵심이다.

<strong>이니셔티브와 실행의 분리</strong>. 자율 에이전트를 만들 때 "무엇을 할지 결정하는 모듈"과 "실제로 실행하는 모듈"을 분리하고, 중간에 권한 게이트를 두는 패턴. 이건 프로덕션 에이전트에서 사고를 줄이는 데 직접적으로 도움이 된다.

## 그래서 Anthropic은?

Sigrid Jin이라는 개발자가 유출된 TypeScript 코드를 OpenAI Codex로 Python으로 재작성해서 "claw-code"라는 프로젝트를 만들었다. 2시간 만에 GitHub 스타 5만 개를 찍었고, 지금은 10만 5천 개다. AI로 재작성한 코드에 저작권이 적용되는지는 아직 법적으로 명확하지 않다.

Anthropic은 DMCA 테이크다운으로 대응했지만, 인터넷에 한번 퍼진 코드는 사라지지 않는다. 이미 분석 결과가 수십 개의 블로그, 위키, 포럼에 퍼져 있다. 어떤 의미에서 이건 "강제 오픈소스"가 된 셈이다.

한 가지 궁금한 건, 이 사건이 Anthropic의 오픈소스 전략에 영향을 줄 것인가다. 이미 코드가 다 공개된 상태에서 닫힌 소스를 고집하는 게 의미가 있을까? 차라리 공식적으로 오픈소스로 전환하고 커뮤니티 기여를 받는 게 더 나은 선택일 수도 있다. 물론, anti-distillation 같은 경쟁 방어 장치를 공식적으로 공개하고 싶지는 않겠지만.

이 사건의 가장 큰 교훈은 기술적인 게 아닐 수 있다. npm에 배포하는 패키지의 `.map` 파일을 한 번 더 확인하라는 것. `files` 필드나 `.npmignore`에서 소스맵을 명시적으로 제외하고 있는지 — 내 프로젝트도 점검해봐야겠다.

## 참고 자료

- [Engineer's Codex — Diving into Claude Code's Source Code Leak](https://read.engineerscodex.com/p/diving-into-claude-codes-source-code)
- [Kilo Blog — Claude Code Source Leak: A Timeline](https://blog.kilo.ai/p/claude-code-source-leak-a-timeline)
- [Fortune — Anthropic leaks its own AI coding tool's source code](https://fortune.com/2026/03/31/anthropic-source-code-claude-code-data-leak-second-security-lapse-days-after-accidentally-revealing-mythos/)
- [VentureBeat — Claude Code's source code appears to have leaked](https://venturebeat.com/technology/claude-codes-source-code-appears-to-have-leaked-heres-what-we-know)
- [SecurityWeek — Critical Vulnerability in Claude Code Emerges Days After Source Leak](https://www.securityweek.com/critical-vulnerability-in-claude-code-emerges-days-after-source-leak/)
- [Kir Shatrov — Reverse engineering Claude Code](https://kirshatrov.com/posts/claude-code-internals)
- [BleepingComputer — Claude Code leak used to push infostealer malware](https://www.bleepingcomputer.com/news/security/claude-code-leak-used-to-push-infostealer-malware-on-github/)
