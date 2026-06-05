---
title: 'Amazon Kiro 실전 분석 — 스펙 주도 AI IDE가 Claude Code를 대체할 수 있을까'
description: 'AWS가 만든 스펙 주도 AI IDE Kiro를 공식 문서와 커뮤니티 리뷰로 분석했다. EARS 노테이션 기반 요구사항 생성, Agent Hooks, Steering Files의 실제 가치와 Claude Code와의 결정적 차이를 솔직하게 정리한다.'
pubDate: '2026-06-05'
heroImage: ../../../assets/blog/amazon-kiro-spec-driven-ai-ide-vs-claude-code-2026/hero.png
tags:
  - kiro
  - claude-code
  - ai-ide
  - spec-driven
  - aws
relatedPosts:
  - slug: cursor-3-vs-claude-code-vs-windsurf-2026
    score: 0.91
    reason:
      ko: AI IDE 비교 시리즈의 전편. Cursor, Claude Code, Windsurf를 비교한 뒤 Kiro를 함께 읽으면 2026년 AI IDE 지형 전체가 보인다.
      ja: AI IDE比較シリーズの前編。Cursor、Claude Code、Windsurfを比較してからKiroを読むと、2026年のAI IDE全体像が見えてくる。
      en: The companion piece to this article. Read the Cursor/Claude Code/Windsurf comparison first to see the full 2026 AI IDE landscape.
      zh: AI IDE比较系列的前篇。先读Cursor、Claude Code和Windsurf的比较，再结合本文，可以全面了解2026年AI IDE格局。
  - slug: specification-driven-development
    score: 0.87
    reason:
      ko: 스펙 주도 개발 방법론의 철학적 배경을 다룬다. Kiro가 이 철학을 어떻게 도구화했는지 이해하는 데 좋은 사전 독서다.
      ja: スペック駆動開発の哲学的背景を扱う。KiroがこのアプローチをどうIDEに組み込んだか理解するのに役立つ事前読書だ。
      en: Covers the philosophical background of spec-driven development. Good pre-reading to understand how Kiro operationalizes this approach in an IDE.
      zh: 讲解规格驱动开发的哲学背景。有助于理解Kiro如何将这种方法论工具化的前置阅读。
  - slug: claude-code-hooks-workflow
    score: 0.83
    reason:
      ko: Claude Code의 Hooks 시스템을 심층 분석한 글. Kiro의 Agent Hooks와 비교해서 읽으면 두 도구의 자동화 철학 차이가 명확해진다.
      ja: Claude CodeのHooksシステムを詳しく分析。KiroのAgent Hooksと比べて読むと、両ツールの自動化哲学の違いがよく分かる。
      en: Deep dive into Claude Code's Hooks system. Read alongside Kiro's Agent Hooks to clearly see the difference in automation philosophy between the two tools.
      zh: 深入分析Claude Code的Hooks系统。与Kiro的Agent Hooks对比阅读，可以清楚看出两款工具自动化哲学的区别。
  - slug: openai-codex-api-release-vs-claude-code-comparison-may-2026
    score: 0.79
    reason:
      ko: OpenAI Codex API vs Claude Code 비교 분석. 세 도구를 함께 놓고 보면 2026년 AI 코딩 도구 선택의 전체 맥락이 잡힌다.
      ja: OpenAI Codex API vs Claude Code比較。3つのツールを並べて見ると、2026年のAIコーディングツール選択の全体像が掴める。
      en: OpenAI Codex API vs Claude Code comparison. Viewing all three tools together gives the full picture for AI coding tool selection in 2026.
      zh: OpenAI Codex API与Claude Code的比较分析。三款工具放在一起看，可以把握2026年AI编码工具选择的完整背景。
  - slug: claude-code-agentic-workflow-patterns-5-types
    score: 0.76
    reason:
      ko: Claude Code의 에이전트 워크플로우 5가지 패턴을 정리한 글. Kiro의 스펙 주도 방식이 Claude Code의 어떤 패턴을 대체하고 어떤 걸 보완하는지 비교할 수 있다.
      ja: Claude Codeの5種類のエージェントワークフローパターンをまとめた記事。KiroのSpec駆動方式がClaude Codeのどのパターンを代替し、補完するかを比較できる。
      en: Covers Claude Code's 5 agentic workflow patterns. Helps compare which patterns Kiro's spec-driven approach replaces and which it complements.
      zh: 整理了Claude Code的5种智能体工作流模式。可以对比Kiro的规格驱动方式替代了哪些模式、补充了哪些模式。
---

AI 코딩 도구 시장에 새로운 플레이어가 들어왔다. Amazon이 2025년 7월에 공개한 Kiro는 단순한 AI 자동완성이 아니라, "코드를 짜기 전에 스펙을 먼저 쓰자"는 철학 위에 세운 IDE다. Claude Code를 매일 쓰는 입장에서 이게 실제로 어떤 의미인지 따져봤다. 출시 이후 약 11개월이 지난 지금, 커뮤니티 반응과 공식 업데이트를 통해 어느 정도 윤곽이 잡혔다.

먼저 결론부터 말하자면: Kiro와 Claude Code는 직접 경쟁 관계가 아니다. 서로 다른 문제를 풀고 있다. 하지만 그 차이가 뭔지 제대로 이해하지 못하면 둘 다 잘못 쓰게 된다. 이 글은 그 차이를 명확히 하려는 시도다.

이 글은 Source Review 분석이다. Kiro는 GUI IDE이기 때문에 CLI 설치를 시도했으나 macOS 앱 기반이라 자동화된 샌드박스 실행이 제한적이었다. 대신 공식 문서(`kiro.dev/docs`), 릴리스 노트, GitHub 이슈, InfoQ 분석, 커뮤니티 리뷰를 분석하고, `.kiro/` 디렉토리 구조를 직접 재현해 본문에 담았다. 내가 실행하지 못한 기능은 실행했다고 쓰지 않는다. 분석의 한계와 내 판단을 명확히 구분해서 읽어주면 좋겠다.

## Kiro가 해결하려는 문제: "바이브 코딩"의 한계

Kiro의 공식 소개 문구는 이렇다: "Beyond Vibe Coding." 직역하면 감각적 코딩을 넘어서자는 뜻이다. 이게 무슨 말인지 이해하려면 먼저 바이브 코딩이 왜 문제가 되는지부터 봐야 한다.

지금 많은 팀이 AI 코딩 도구를 이렇게 쓴다. "사용자 인증 기능 만들어줘"라고 입력하면 에이전트가 코드를 생성한다. 동작은 한다. 하지만 두 달 후에 그 코드가 왜 그렇게 설계됐는지 아무도 모른다. 요구사항 문서도 없고, 설계 결정도 구두로만 오갔고, 테스트는 나중에 추가됐다. 이게 바이브 코딩의 전형적인 결과다.

Kiro는 이걸 바꾸려 한다. 프롬프트를 넣으면 코드를 바로 생성하는 게 아니라, 먼저 요구사항 문서를 만들고, 설계를 검토하고, 작업 목록을 구성한 다음에 코드를 생성한다. 개발자가 각 단계를 검토하고 승인해야 다음으로 넘어간다.

이 접근법이 의미 있는 상황이 분명히 있다. 특히 신규 기능을 여러 개발자가 함께 개발하거나, 요구사항이 자주 바뀌는 환경에서는 이런 구조화된 워크플로우가 실제로 도움이 된다. 내가 [스펙 주도 개발의 철학](/ko/blog/ko/specification-driven-development)을 이전에 다뤘을 때 가장 큰 장점으로 꼽았던 것도 바로 이 "추적 가능성"이었다.

3개월 후에 "왜 이 코드가 이렇게 생겼나요?"라는 질문이 들어왔을 때, requirements.md를 열면 답이 있다. 그 설계 결정이 어떤 요구사항에서 나왔는지가 문서로 남아 있기 때문이다. 이게 단순해 보이지만, 실제로 빠르게 성장하는 팀에서는 이런 기록이 없어서 기술 부채가 쌓이는 경우가 너무 많다. 코드는 남아있는데 결정의 이유는 사라진 상황, 많은 팀이 겪는 현실이다.

## 스펙 주도 개발 워크플로우: 실제 구조

Kiro의 스펙 시스템은 `.kiro/specs/` 디렉토리 아래에 세 개의 파일을 순서대로 생성한다.

```
.kiro/
├── steering/
│   ├── product.md      # 제품이 뭘 하는지, 누가 쓰는지
│   ├── tech.md         # 스택, 프레임워크, 의존성
│   └── structure.md    # 폴더 구조, 아키텍처 규칙
├── specs/
│   └── user-auth/
│       ├── requirements.md    # EARS 노테이션 요구사항
│       ├── design.md          # 기술 설계, 시퀀스 다이어그램
│       └── tasks.md           # 구체적 구현 작업 목록
└── hooks/
    └── on-save.json    # 파일 저장 시 자동 실행 액션
```

이 중에서 `requirements.md`가 핵심이다. Kiro는 EARS(Easy Approach to Requirements Syntax) 노테이션으로 요구사항을 구조화한다. 예를 들면 이런 형태다.

```markdown
## 사용자 스토리: 할 일 항목 담당자 지정

WHEN 프로젝트 매니저가 할 일 항목에 담당자를 지정할 때
THE SYSTEM SHALL 담당자를 업데이트하고 알림을 발송해야 한다
SO THAT 개발자가 새로운 할당을 인지할 수 있도록

**인수 기준:**
- WHEN task.assignee_id가 업데이트되면 THEN 이전 담당자에게 알림
- WHEN task.assignee_id가 null이면 THEN 미배정 상태로 변경
- IF assignee_id가 존재하지 않으면 THEN HTTP 404 반환
```

이 형식의 장점은 명확하다. 요구사항이 자연어처럼 읽히면서도 구조화되어 있어서 AI가 오해할 여지가 줄어든다. 개발자가 검토하기도 좋다.

`design.md`에는 이 요구사항을 어떻게 구현할지 기술 설계가 들어간다. 시퀀스 다이어그램, DB 스키마 변경, API 엔드포인트 설계 등이 포함된다. `tasks.md`는 그걸 실제 구현 단계로 쪼갠 체크리스트다.

```markdown
# 구현 작업

- [ ] 1. Task 모델에 assignee_id 필드 추가 (마이그레이션 필요)
- [ ] 2. PATCH /tasks/{task_id}/assign 엔드포인트 생성
- [ ] 3. 알림 서비스 구현
- [ ] 4. 엣지 케이스 테스트 작성 (null, 잘못된 사용자)
- [ ] 5. OpenAPI 스키마 업데이트
```

"Run all Tasks"를 누르면 Kiro가 태스크 의존성을 분석해서 독립적인 작업은 병렬로 실행한다. 공식 문서에 따르면 대부분의 기능 스펙에서 실행 시간이 크게 줄어든다고 한다.

Kiro의 스펙 워크플로우는 두 가지 진입점이 있다. **Requirements-First**는 먼저 요구사항을 정리하고 그로부터 기술 설계를 도출하는 방식이다. **Design-First**는 반대로 기술 아키텍처를 먼저 확정하고 그로부터 실현 가능한 요구사항을 역으로 도출한다. 기존 레거시 코드베이스에 새 기능을 추가할 때 Design-First가 유용한데, 이미 고정된 기술 제약 조건이 있기 때문이다.

`.kiro/` 디렉토리 자체가 Git 저장소에 커밋된다. 이 점이 중요하다. 스펙 파일들이 코드와 함께 버전 관리가 된다는 뜻이다. PR에 코드 변경과 requirements.md 변경이 함께 포함되면, 코드 리뷰 시 "이 기능이 왜 이렇게 구현됐는지"를 함께 리뷰할 수 있다. 이건 나쁘지 않은 방향이다.

## Agent Hooks와 Steering Files: Kiro가 가진 고유한 강점

![Kiro 스펙 주도 워크플로우 다이어그램](../../../assets/blog/amazon-kiro-spec-driven-ai-ide-vs-claude-code-2026/kiro-spec-workflow.png)

이 부분이 나는 실제로 흥미롭다고 생각한다. Claude Code와 Kiro 모두 Hooks 개념이 있는데, 접근 방식이 다르다.

[Claude Code의 Hooks 시스템](/ko/blog/ko/claude-code-hooks-workflow)은 Claude Code 실행 이벤트에 쉘 커맨드를 연결하는 방식이다. 강력하지만 설정이 JSON/쉘 스크립트로 이루어져 있어 기술적 진입 장벽이 있다.

Kiro의 Agent Hooks는 다르다. 자연어로 훅을 정의할 수 있다.

> "React 컴포넌트를 저장할 때마다: 1) `__tests__` 디렉토리에 해당 테스트 파일이 없으면 생성한다. 2) 있으면 새로운 prop이나 함수를 커버하도록 업데이트한다. 3) 테스트를 실행해서 통과하는지 확인한다."

이게 공식 문서의 예시다. 파일 저장, 파일 생성, 파일 삭제 같은 이벤트에 이런 AI 기반 액션을 붙일 수 있다. 코드를 짜지 않고도 팀의 품질 게이트를 자동화할 수 있다는 뜻이다.

Steering Files는 더 단순하지만 실용적이다. `.kiro/steering/` 아래의 마크다운 파일에 프로젝트 컨텍스트를 한 번 적어두면, 이후 모든 대화에서 Kiro가 그걸 기억한다. 매번 "이 프로젝트는 FastAPI + PostgreSQL을 씁니다"라고 설명할 필요가 없다는 뜻이다. Claude Code의 `CLAUDE.md`와 비슷하지만, Kiro에서는 `product.md`, `tech.md`, `structure.md`로 체계적으로 분리되어 있다.

솔직히 이 두 기능은 Claude Code에 없거나 덜 정제된 부분이다. Hooks의 자연어 정의 방식과 Steering Files의 구조화는 Kiro가 명확히 잘 만든 지점이라고 본다.

Dev.to 커뮤니티에서 본 실제 사용 사례 중 인상적인 것이 있었다. 한 시니어 개발자가 이런 Hook을 정의했다고 한다: "API 엔드포인트 파일이 수정될 때마다 해당 OpenAPI 스펙 파일도 자동으로 업데이트해줘." 이런 Hook이 팀 전체에 공유되면, 개발자들이 각자 이걸 설정할 필요 없이 레포지토리에서 자동으로 적용된다. 문서-코드 불일치 문제를 완전히 없애주는 건 아니지만, 줄여주는 데는 분명히 도움이 된다.

## 가격과 현실적 한계

가격부터 얘기하자. Kiro의 현재 플랜은 이렇다.

| 플랜 | 가격 | 크레딧 | 실제 사용량 |
|------|------|--------|------------|
| Free | 무료 | 50 | 활성 코딩 1〜2시간 |
| Pro | $20/월 | 1,000 | 일상적인 개발 |
| Pro+ | $40/월 | 2,000 | 헤비 유저 |
| Power | $200/월 | 10,000 | 팀/기업 |

Free 플랜 50 크레딧은 Kiro가 어떻게 동작하는지 체험하기엔 충분하지만 실제 업무에 쓰기엔 부족하다. 1〜2시간이면 끝난다. Pro 플랜 $20/월 1,000 크레딧이 일반 개발자에게 현실적인 시작점이다.

Claude Code Max가 $100/월인 것과 비교하면 Kiro Pro가 훨씬 저렴하다. 하지만 작업 방식이 달라서 단순 비교는 의미가 없다.

MCP(Model Context Protocol)은 Kiro도 지원한다. `.kiro/mcp.json`으로 설정하며, 다른 MCP 클라이언트와 같은 방식이다. 다만 Claude Code 생태계의 MCP 서버 수와 성숙도에 비하면 아직 초기 단계다.

한 가지 솔직히 아쉬운 점: Kiro는 VS Code 포크다. 장점은 VS Code 생태계의 익스텐션을 그대로 쓸 수 있다는 것이다. 단점은 VS Code 이외의 워크플로우, 특히 터미널 중심 개발자에게는 적합하지 않다는 점이다. 나처럼 Neovim이나 터미널 워크플로우를 선호한다면 Kiro를 주력으로 쓰기 어렵다.

크레딧 소모 방식도 조금 불투명하다. 스펙 생성에 몇 크레딧이 쓰이는지, Agent Hooks 실행이 크레딧을 소모하는지, 같은 작업을 반복하면 얼마나 쓰이는지 공식 문서에서 명확하게 확인하기 어려웠다. 이 부분은 실제로 Pro 플랜으로 한 달 써봐야 체감이 될 것 같다.

Kiro CLI도 별도로 제공되는데, 이건 터미널에서 스펙 작성 및 에이전트 실행을 할 수 있는 도구다. `curl -fsSL https://cli.kiro.dev/install | bash`로 설치 가능하다. 다만 CLI도 인증이 필요하고, 일부 IDE 기능(Agent Hooks의 파일 이벤트 트리거 등)은 CLI에서 완전하게 지원되지 않는다. 실질적으로 Kiro의 핵심 경험은 GUI IDE를 통해야 온전히 얻을 수 있다.

## Claude Code와 무엇이 다른가

가장 많이 받는 질문: "Kiro가 Claude Code를 대체할 수 있나?"

내 생각은 아니다. 적어도 지금은. 이유를 구체적으로 보자.

**모델 파워**: Kiro는 Claude Sonnet + Amazon Nova를 사용한다. Claude Code는 Claude Opus 4 모델을 직접 사용할 수 있다. 복잡한 추론, 멀티스텝 작업에서 Opus 4의 성능 차이가 현실적으로 존재한다.

**속도와 유연성**: Claude Code는 스펙 단계 없이 바로 실행한다. 작은 버그 수정, 빠른 리팩터링, 탐색적 코딩에서는 Claude Code가 훨씬 빠르다. Kiro의 스펙 생성 과정은 가치 있지만 시간이 걸린다. 10분짜리 수정에 스펙을 먼저 만드는 건 오버헤드가 된다.

**워크플로우 통합**: [Claude Code는 다양한 에이전트 워크플로우 패턴을 지원한다](/ko/blog/ko/claude-code-agentic-workflow-patterns-5-types). GitHub, Jira, Slack, 내부 API와의 통합도 설정 없이 MCP로 연결된다. Kiro도 MCP를 지원하지만 생태계의 성숙도가 다르다.

**접근 방식의 철학**: 가장 근본적인 차이다. Claude Code는 "당신이 원하는 걸 구현해 드립니다"라고 한다. Kiro는 "함께 요구사항을 정리하고, 설계를 검토하고, 그 다음에 구현합시다"라고 한다. 전자는 속도를, 후자는 엄밀함을 선택한다.

커뮤니티의 실제 패턴을 보면, 많은 시니어 개발자들이 두 도구를 함께 쓴다. 복잡한 신규 기능 설계에는 Kiro, 실제 구현과 반복적인 수정에는 Claude Code. 이게 현재로서는 가장 합리적인 조합이라고 본다.

흥미로운 차이점이 하나 더 있다. Kiro는 사용자가 스펙을 검토하고 명시적으로 승인해야 다음 단계로 넘어가는 "인간 주도" 워크플로우를 기본으로 설계되어 있다. 반면 Claude Code는 명시적인 체크포인트 없이 작업을 연속적으로 진행하는 경향이 있다. 이게 어떤 팀에는 장점이고, 어떤 팀에는 단점이다. 여러 개발자가 함께 결정을 내려야 하는 상황에서는 Kiro의 명시적 승인 단계가 오히려 팀 커뮤니케이션을 강제하는 역할을 한다.

한 가지 더 언급할 점: Kiro는 `brew install --cask kiro`로 설치할 수 있다(macOS 12 이상). 설치 자체는 간단하다. 다만 처음 실행 시 AWS Builder ID 또는 소셜 로그인이 필요하고, 첫 프로젝트 오픈 시 steering 파일 자동 생성을 위해 레포지토리 분석을 진행한다. 이 과정에서 초기 크레딧이 소모되므로, 빈 프로젝트가 아닌 실제 코드베이스로 바로 테스트하는 게 시간 효율이 좋다.

## Kiro를 직접 시작하기 전에 알면 좋은 것들

Kiro를 처음 시작하려는 사람을 위해 공식 문서와 커뮤니티 경험을 바탕으로 정리했다. 나는 GUI 환경에서 직접 실행하지 못했지만, 설치부터 첫 프로젝트까지의 흐름은 문서를 통해 명확히 확인했다.

**설치:**
```bash
# macOS Homebrew로 설치 (macOS 12 이상)
brew install --cask kiro

# 또는 공식 CLI 설치
curl -fsSL https://cli.kiro.dev/install | bash
```

처음 Kiro를 열면 AWS Builder ID 또는 GitHub/Google 소셜 로그인을 요구한다. VS Code 설정과 익스텐션을 가져올지 선택할 수 있다.

**첫 프로젝트 시작:**
1. 기존 코드베이스를 열거나 새 폴더를 만든다
2. Kiro 패널에서 "Initialize Steering"을 클릭한다
3. Kiro가 레포지토리를 분석해서 `.kiro/steering/` 아래에 `product.md`, `tech.md`, `structure.md`를 자동 생성한다
4. 생성된 파일을 검토하고 필요한 부분을 수정한다

**첫 스펙 만들기:**
Kiro 채팅에 "사용자 이메일 변경 기능을 구현하고 싶어"라고 입력하면, 바로 코드를 생성하는 게 아니라 requirements.md 초안을 먼저 제시한다. 이걸 검토하고 승인하면 design.md로 넘어간다.

이 흐름을 한 번 경험하면 Kiro의 철학이 금방 느껴진다. 빠른 사람에게는 답답할 수도 있고, 꼼꼼한 사람에게는 안심이 될 수도 있다.

## 내 솔직한 평가: 누구에게 맞는가

Kiro가 과대평가됐다고 생각하지는 않는다. 해결하려는 문제가 실제로 존재하고, 접근 방식도 타당하다. 하지만 몇 가지 맥락을 명확히 해야 한다.

**Kiro가 진짜 값어치를 하는 경우:**
- 팀 단위로 복잡한 기능을 개발할 때
- 요구사항이 자주 바뀌어서 추적 가능성이 중요할 때
- 코드 품질 게이트를 자동화하고 싶은데 스크립트 짜기 싫을 때
- VS Code를 이미 주력으로 쓰고 있을 때
- 신규 팀원 온보딩 시 프로젝트 컨텍스트를 빠르게 전달해야 할 때 (Steering Files 효과)

**Kiro가 맞지 않는 경우:**
- 혼자 작업하면서 속도가 최우선일 때
- 터미널 중심 워크플로우를 선호할 때
- 이미 Claude Code나 Cursor를 잘 쓰고 있고 워크플로우를 바꾸기 싫을 때
- 작업의 80%가 기존 코드 수정과 버그 수정일 때
- 모델 최고 성능이 필요한 복잡한 추론 작업이 많을 때 (Claude Opus 4가 필요한 경우)

Kiro의 스펙 주도 접근법이 AI 코딩 도구의 미래가 될 수 있다고 본다. 지금처럼 에이전트가 코드를 마구 생성하는 방식은 규모가 커지면 유지보수가 어려워진다. 스펙이 먼저 있고 코드는 그걸 따라가는 방식이 장기적으로는 더 지속 가능하다.

물론 모든 프로젝트에서 스펙이 먼저 오는 게 정답은 아니다. 프로토타입, POC, 혼자 하는 사이드 프로젝트에서 스펙부터 작성하는 건 오버킬이다. Kiro 스스로도 이를 인지하는지, 빠른 수정을 위한 "bug fix spec" 같은 경량 스펙 유형도 제공한다. 다만 이 경량 모드가 실제로 얼마나 빠른지는 직접 써봐야 알 수 있다.

하지만 그게 지금 당장 Kiro로 갈아타야 한다는 의미는 아니다. Free 플랜 50 크레딧으로 직접 써보고, 본인 워크플로우에 맞는지 판단하는 게 맞다. 한 번 써보면 이 도구가 뭘 하려는지 금방 느낌이 온다. 개인적으로는 팀 단위 그린필드 프로젝트를 시작할 때 Kiro 세팅을 도입해보는 것이 가장 자연스러운 진입점이라고 생각한다.

Amazon이 Kiro에 Claude를 라이선스해서 사용한다는 사실이 흥미롭다. AWS 인프라 위에서 Anthropic의 모델로 돌아가는 IDE를 만든 것이다. AI 도구 생태계가 어떻게 복잡하게 얽혀가는지 보여주는 사례다. 경쟁이라기보다는 레이어가 다른 협력에 가깝다. 그 의미에서 Kiro는 Claude Code의 적이 아니라, 다른 레이어에서 작동하는 보완적 도구로 보는 것이 정확하다.

앞으로 몇 달 안에 Kiro가 MCP 생태계와의 통합을 강화하고, 팀 공유 기능을 확장한다면 엔터프라이즈 시장에서 의미 있는 자리를 차지할 것 같다. 지금 당장 Claude Code 대신이 아니라, 두 도구를 조합해서 쓸 때 시너지가 나는 포인트를 찾는 게 2026년 상반기 현재 가장 현명한 접근이라고 본다. 결국 도구가 중요한 게 아니라, 그 도구로 뭘 만드느냐가 중요하다는 건 변하지 않는다.

---

**참고 자료:**
- [Kiro 공식 문서](https://kiro.dev/docs/)
- [Kiro 소개 블로그](https://kiro.dev/blog/introducing-kiro/)
- [AWS re:Post — Kiro 아키텍처 분석](https://repost.aws/articles/AROjWKtr5RTjy6T2HbFJD_Mw/)
- [InfoQ — Kiro 스펙 주도 AI IDE](https://www.infoq.com/news/2025/08/aws-kiro-spec-driven-agent/)
