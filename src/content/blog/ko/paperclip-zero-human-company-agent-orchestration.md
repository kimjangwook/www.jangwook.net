---
title: Paperclip — AI 에이전트를 직원처럼 관리하는 오픈소스 플랫폼을 설치해봤다
description: >-
  AI 에이전트 여러 개를 회사처럼 관리하는 오픈소스 플랫폼 Paperclip을 직접 설치해봤다. Linear 스타일 대시보드, Org
  Chart, 비용 추적, 다양한 에이전트 어댑터까지 — Claude Code 에이전트를 조직화하는 실전 경험과 솔직한 평가를 공유합니다.
pubDate: '2026-04-02'
heroImage: ../../../assets/blog/paperclip-zero-human-company-agent-orchestration-hero.png
tags:
  - ai-agents
  - open-source
  - orchestration
relatedPosts:
  - slug: anthropic-agent-skills-standard
    score: 0.95
    reason:
      ko: '자동화, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, architecture with comparable
        difficulty.
      zh: 在自动化、AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: claude-skills-implementation-guide
    score: 0.95
    reason:
      ko: '자동화, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, architecture with comparable
        difficulty.
      zh: 在自动化、AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: mcp-open-standard-linux-foundation-engineering-guide
    score: 0.95
    reason:
      ko: '자동화, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, architecture with comparable
        difficulty.
      zh: 在自动化、AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: claude-cowork-enterprise-productivity-platform
    score: 0.95
    reason:
      ko: '자동화, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, architecture with comparable
        difficulty.
      zh: 在自动化、AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: anthropic-agent-skills-practical-guide
    score: 0.94
    reason:
      ko: '자동화, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, architecture with comparable
        difficulty.
      zh: 在自动化、AI/ML、架构领域涵盖类似主题，难度相当。
---

Claude Code 터미널 20개를 동시에 열어놓고 작업한 적이 있는가? 나는 있다. 블로그 포스트를 4개 언어로 쓰면서 리서치 에이전트, 이미지 생성 에이전트, 번역 에이전트를 각각 돌리다 보면 어느 순간 "지금 누가 뭘 하고 있지?"가 헷갈리기 시작한다. 터미널 탭 이름으로 구분하는 건 한계가 있고, 비용도 제각각이라 월말에 얼마 썼는지 계산하기가 귀찮다. Git Worktree를 활용한 병렬 세션 관리 방법이 궁금하다면 [Git Worktree로 Claude Code 병렬 세션 운영하기](/ko/blog/ko/claude-code-parallel-sessions-git-worktree)가 도움이 된다.

[Paperclip](https://github.com/paperclipai/paperclip)은 이 문제를 정면으로 건드린다. 슬로건이 도발적인데 — "Open-source orchestration for zero-human companies." 에이전트를 직원으로, 에이전트 그룹을 회사로 관리하자는 거다.

직접 설치하고 돌려봤다.

## 설치: 생각보다 간단했다

```bash
git clone https://github.com/paperclipai/paperclip.git
cd paperclip
pnpm install
pnpm build
pnpm dev:once
```

Node 20 이상, pnpm 9.x만 있으면 된다. 빌드에 약 30초, 실행하면 내장 PostgreSQL이 자동으로 뜬다. 별도 DB 설정이 필요 없다는 점이 좋았다. `DATABASE_URL`을 세팅하지 않으면 로컬 임베디드 Postgres를 쓰고, 프로덕션에서는 외부 Postgres를 연결할 수 있다.

`http://127.0.0.1:3100`에 접속하면 온보딩 마법사가 나온다.

## 온보딩: 4단계 마법사

Company → Agent → Task → Launch. 이 순서다.

회사 이름과 미션을 입력하고, 에이전트를 하나 만들고, 태스크를 할당하고, 실행. 내 경우 "Jangwook Blog Automation"이라는 회사를 만들고 "Writer"라는 Claude Code 에이전트를 고용했다.

에이전트 어댑터 종류가 많다. Claude Code와 Codex가 "Recommended"로 표시되고, 접으면 Gemini CLI, OpenCode, Pi, Cursor, Hermes Agent, OpenClaw Gateway까지 나온다. "If it can receive a heartbeat, it's hired"라는 문구가 README에 있는데, 실제로 다양한 런타임을 지원하는 걸 보니 과장은 아닌 것 같다.

## 대시보드: Linear를 많이 참고한 듯

![Paperclip 대시보드 — 에이전트, 태스크, 비용, 승인 현황이 한눈에 보인다](../../../assets/blog/paperclip-zero-human-company-agent-orchestration-hero.png)

처음 대시보드를 보고 든 생각은 "이거 Linear 아닌가?"였다. 다크 테마, 사이드바 네비게이션, 이슈 트래커 구조가 익숙하다. 나쁜 의미가 아니라 — 개발자가 바로 적응할 수 있다는 뜻이다.

사이드바 구조를 보면:
- <strong>WORK</strong>: Issues, Routines(Beta), Goals
- <strong>PROJECTS</strong>: 프로젝트별 이슈 그룹
- <strong>AGENTS</strong>: 에이전트 목록 + 실시간 상태
- <strong>COMPANY</strong>: Org, Skills, Costs, Activity, Settings

태스크 매니저처럼 생겼지만, 밑에 조직도, 예산, 거버넌스가 깔려 있다. README에서 "It looks like a task manager — but under the hood it has org charts, budgets, governance" 라고 한 게 정확한 설명이다.

## 실행해보니: 실시간 스트리밍이 인상적이었다

태스크를 만들고 Launch를 누르니 Writer 에이전트가 바로 Claude Code를 호출하기 시작했다. 사이드바에 "1 live"라는 표시가 뜨고, 이슈 페이지에서 STDOUT이 실시간으로 스트리밍됐다.

![이슈 상세 페이지 — Writer 에이전트가 실시간으로 실행 중이다. STDOUT 스트리밍과 Properties 패널이 보인다](../../../assets/blog/paperclip-zero-human-company-agent-orchestration-issue.png)

그런데 내 경우 실행이 "failed"로 끝났다. 원인은 단순한데 — `_sandbox/` 안에서 돌리다 보니 Claude Code의 API 키 설정이 제대로 안 된 것 같다. 이게 Paperclip의 문제는 아니고, 에이전트 어댑터가 로컬 CLI를 호출하는 구조라 환경 설정이 맞아야 한다. 온보딩 때 "Adapter environment check"라는 테스트 버튼이 있긴 한데, 테스트를 통과해도 실제 작업에서 실패할 수 있다는 점은 좀 아쉽다.

## Org Chart: 에이전트가 직원 카드로 보인다

![Org Chart — Writer 에이전트가 CEO 직함으로 표시된 조직도](../../../assets/blog/paperclip-zero-human-company-agent-orchestration-org.png)

에이전트 하나가 이름, 직함, 담당 이슈 수와 함께 카드로 표시된다. 에이전트를 여러 개 만들면 계층 구조를 잡을 수 있다. CEO 에이전트가 CTO 에이전트에게 태스크를 위임하고, CTO가 엔지니어 에이전트에게 다시 위임하는 식이다.

솔직히 에이전트 하나만 쓸 때는 오버킬이다. 이건 Paperclip 측도 인정하는 부분으로, README에 "Not for single agents"라고 명시되어 있다. 3개 이상의 에이전트를 동시에 관리할 때부터 의미가 생긴다.

## 비용 관리: 이건 진짜 필요했던 기능

![Costs 페이지 — 추론 비용, 예산, 재무 현황을 기간별로 확인할 수 있다](../../../assets/blog/paperclip-zero-human-company-agent-orchestration-costs.png)

Costs 페이지가 꽤 상세하다. Inference Spend, Budget, Finance Net, Finance Events를 기간별로(Month to Date, Last 7 Days, Last 30 Days 등) 볼 수 있고, 에이전트별 토큰 예산을 설정할 수 있다.

내가 블로그를 쓸 때 가장 궁금한 게 "이번 달 에이전트 비용 얼마 썼지?"인데, 지금은 터미널 로그를 하나하나 뒤져서 계산한다. 이걸 대시보드 하나로 보여준다는 건 분명히 가치가 있다.

## 내 평가

<strong>좋은 점:</strong>

내장 PostgreSQL 덕에 설치가 간단하다. `pnpm dev:once` 한 줄이면 서버가 뜬다. UI 완성도가 높고 Linear에 익숙한 사람이면 러닝 커브가 거의 없다. 에이전트 어댑터가 다양해서 Claude Code만이 아니라 Codex, Cursor, Gemini CLI까지 한 지붕 아래서 관리할 수 있다. Routines(Beta) 기능으로 정기 실행도 가능하다.

<strong>아쉬운 점:</strong>

에이전트 하나만 쓰는 사람에게는 쓸 이유가 없다. 태스크 매니저를 하나 더 배워야 하는데, 에이전트가 1〜2개면 터미널에서 직접 관리하는 게 빠르다. 그리고 "zero-human company"라는 슬로건이 실제 현실과 거리가 있다. 내가 써본 경험으로는 에이전트가 실패하면 결국 사람이 디버깅해야 하고, 태스크 정의도 사람이 해야 한다. "에이전트를 관리하는 도구"이지 "사람을 대체하는 도구"는 아직 아니다.

또 하나, Paperclip 자체가 에이전트 프레임워크나 프롬프트 매니저가 <strong>아니라는</strong> 점을 이해해야 한다. 에이전트를 만들어주는 게 아니라, 이미 있는 에이전트를 조직화하는 도구다. Claude Code, Codex 같은 CLI 에이전트가 이미 돌아가고 있어야 의미가 있다. 어떤 에이전틱 워크플로우 패턴이 내 작업에 맞는지는 [Claude Code 에이전틱 워크플로우 패턴 5가지](/ko/blog/ko/claude-code-agentic-workflow-patterns-5-types)에서 확인해볼 수 있다.

## 누가 써야 하나

- Claude Code 터미널을 5개 이상 동시에 관리하는 사람
- 에이전트별 비용을 추적하고 예산을 설정하고 싶은 사람
- 여러 에이전트(Claude + Codex + Cursor 등)를 한 프로젝트에 투입하는 팀

나는 아직 도입하지 않았다. 내 블로그 자동화 파이프라인이 Claude Code 하나로 충분히 돌아가고 있어서, 에이전트 3개 이상을 동시에 굴리는 시점이 오면 다시 꺼내볼 생각이다. 그때는 아마 Writer, Researcher, SEO Optimizer를 각각 에이전트로 등록하고 Paperclip에서 오케스트레이션하는 구조가 될 것 같다.

다음에 해볼 것: Routines 기능으로 매일 아침 트렌드 리서치를 자동 실행하는 설정을 만들어보고 싶다. 그 결과가 나오면 후속 포스트로 쓰겠다.
