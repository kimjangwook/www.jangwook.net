---
title: Claude Code 에이전틱 워크플로우 패턴 5가지 — 내 작업에 맞는 패턴은?
description: >-
  Claude Code의 에이전틱 워크플로우 패턴 5가지 — 순차·운영자·병렬·팀·자율을 직접 사용해보며 정리했습니다. 각 패턴의 작동 원리와
  장단점, 적합한 작업 유형, 비용·속도 트레이드오프, 그리고 내 업무에 맞는 패턴 선택 기준을 실전 경험 기반으로 비교합니다.
pubDate: '2026-04-15'
heroImage: ../../../assets/blog/claude-code-agentic-workflow-patterns-5-types-hero.jpg
tags:
  - ClaudeCode
  - 에이전틱AI
  - 워크플로우
  - 튜토리얼
relatedPosts:
  - slug: stripe-minions-autonomous-coding-agents-1300-prs
    score: 0.95
    reason:
      ko: '자동화, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, architecture with comparable
        difficulty.
      zh: 在自动化、AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: claude-code-insights-usage-analysis
    score: 0.94
    reason:
      ko: '자동화, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, architecture with comparable
        difficulty.
      zh: 在自动化、AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: mcp-servers-toolkit-introduction
    score: 0.94
    reason:
      ko: '자동화, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, architecture with comparable
        difficulty.
      zh: 在自动化、AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: ai-presentation-automation
    score: 0.93
    reason:
      ko: '자동화, AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: 'Covers similar topics in automation, AI/ML with comparable difficulty.'
      zh: 在自动化、AI/ML领域涵盖类似主题，难度相当。
  - slug: anthropic-agent-skills-practical-guide
    score: 0.93
    reason:
      ko: '다음 단계 학습으로 적합하며, 자동화, AI/ML, 아키텍처 주제에서 연결됩니다.'
      ja: 次のステップの学習に適しており、自動化、AI/ML、アーキテクチャのトピックで繋がります。
      en: >-
        Suitable as a next-step learning resource, connecting through
        automation, AI/ML, architecture topics.
      zh: 适合作为下一步学习资源，通过自动化、AI/ML、架构主题进行连接。
---

Claude Code를 처음 쓰기 시작했을 때 나는 모든 걸 단순하게 접근했다. 터미널을 열고, "이 기능 구현해줘"라고 치고, 결과를 받는 것. 그런데 작업이 복잡해질수록 이 단순한 방식이 한계에 부딪혔다. 어떤 작업은 너무 오래 걸리고, 어떤 건 컨텍스트가 엉켜버리고, 어떤 건 아예 Claude Code가 방향을 잃었다.

찾다 보니 패턴이 있었다. Claude Code를 "어떻게 쓰느냐"에 따라 효율이 극적으로 달라지는 5가지 방식이다. 이 포스트는 그 5가지 에이전틱 워크플로우 패턴을 정리한다.

## 5가지 패턴 한눈에 보기

| 패턴 | 에이전트 수 | 사람 개입 | 주요 사용처 |
|------|-----------|----------|-----------|
| Sequential (순차) | 1 | 중간마다 | 단계별 작업, 문서 생성 |
| Operator (운영자) | 1 | 최소 | 도구 활용, 단일 복잡 작업 |
| Parallel (병렬) | 여러 개 | 작업 전/후 | 독립적인 복수 작업 동시 처리 |
| Teams (팀) | 여러 개 | 오케스트레이터 단 | 역할 분담이 필요한 복잡한 작업 |
| Autonomous (자율) | 여러 개 | 거의 없음 | 반복·배치·크론 작업 |

처음엔 이 구분이 너무 학문적으로 느껴졌다. 실제로 써봐야 차이가 보인다.

## 패턴 1: Sequential (순차)

가장 단순하고 직관적인 패턴이다. 사람이 중간에 개입하면서 단계별로 작업을 이어간다.

```bash
# 예시: 코드 리뷰 → 수정 → 테스트 → 문서화
claude "이 PR의 코드 리뷰를 해줘"
# 리뷰 확인 후 필요한 수정 지시
claude "방금 리뷰한 내용 중 A, B 항목 수정해줘"
# 수정 확인 후
claude "수정된 코드에 대한 테스트 코드 추가해줘"
```

사람이 매 단계 결과를 확인하고 다음 지시를 내리는 방식이다. 느리지만 통제권이 가장 높다.

**언제 쓰나**: 결과물의 품질을 단계마다 검증해야 하거나, 작업 사이에 판단이 필요할 때. 특히 처음 보는 코드베이스를 탐색할 때 이 패턴이 안전하다.

**솔직한 평가**: 반복 작업엔 피로도가 높다. 5단계짜리 작업이면 5번 화면을 들여다봐야 한다.

## 패턴 2: Operator (운영자)

단일 에이전트에게 MCP 도구나 Bash 실행 권한을 주고, 복잡한 작업 하나를 맡기는 방식이다.

```bash
# CLAUDE.md에 권한 범위를 명확히 정의한 뒤
claude "src/ 폴더의 모든 TypeScript 파일을 분석해서 
        타입 에러 목록을 report.md로 정리하고,
        수정 가능한 건 수정해줘"
```

핵심은 **권한 범위를 명확히 정의하는 것**이다. `.claude/settings.json`이나 `CLAUDE.md`에 어떤 파일을 건드릴 수 있고 어떤 명령어를 실행할 수 있는지 사전 정의가 필요하다.

```json
{
  "permissions": {
    "allow": ["Bash(npm run *)", "Read", "Edit"],
    "deny": ["Bash(rm *)", "Bash(git push *)"]
  }
}
```

**언제 쓰나**: 맥락이 명확하고 범위가 잘 정의된 단일 복잡 작업. 예: "이 모듈의 모든 함수에 JSDoc 추가", "이 디렉토리의 파일명을 모두 kebab-case로 변환"

[Claude Code 모범 사례](/ko/blog/ko/claude-code-best-practices)에서 CLAUDE.md를 통한 권한 설계를 상세히 다루고 있으니 함께 보면 좋다.

## 패턴 3: Parallel (병렬)

서로 의존성이 없는 작업 여러 개를 동시에 처리하는 패턴이다. Git Worktree를 활용해 독립된 작업 환경을 만든다.

```bash
# 3개의 독립 worktree 생성
git worktree add ../feature-auth feature/auth
git worktree add ../feature-dashboard feature/dashboard
git worktree add ../docs-update docs/update

# 각 worktree에서 별도 Claude Code 세션 실행
# (tmux나 터미널 탭 활용)
cd ../feature-auth && claude "JWT 인증 구현해줘"
cd ../feature-dashboard && claude "대시보드 컴포넌트 최적화해줘"
cd ../docs-update && claude "API 문서 최신화해줘"
```

이 방식으로 전환한 뒤 개인 생산성이 눈에 띄게 달라졌다. 특히 CI 파이프라인을 기다리는 시간에 다른 브랜치 작업을 진행할 수 있다는 게 실질적으로 크다.

[Git Worktree로 병렬 세션을 운영하는 구체적인 방법](/ko/blog/ko/claude-code-parallel-sessions-git-worktree)은 별도 포스트에서 단계별로 다뤘다. 처음 설정하는 거라면 그쪽을 먼저 보는 게 빠르다.

**언제 쓰나**: 독립적인 피처 개발, 다국어 번역, 테스트 코드 작성 등 서로 코드베이스를 공유하지 않아도 되는 작업들.

**주의**: 같은 파일을 건드리는 작업은 병렬로 돌리면 충돌이 생긴다. 작업 간 의존성 확인이 전제다.

## 패턴 4: Teams (팀)

오케스트레이터 에이전트 하나가 여러 서브에이전트에게 작업을 위임하는 패턴이다. Claude Code의 서브에이전트 기능을 활용한다.

```markdown
# 오케스트레이터에게 전달하는 프롬프트 예시
다음 작업을 순서대로 처리해줘:
1. @researcher: 이 주제에 대한 최신 기술 트렌드 조사
2. @writer: 조사 결과를 바탕으로 블로그 포스트 초안 작성
3. @editor: 초안의 SEO 최적화 및 교정
4. @publisher: 완성된 글을 4개 언어로 번역 후 파일 저장
```

팀 패턴의 핵심은 **역할 분리**다. 각 에이전트는 자신의 영역만 알고, 오케스트레이터가 전체 흐름을 조율한다.

실제로 이 방식은 한 에이전트의 컨텍스트 길이 한계를 분산시키는 효과도 있다. 큰 작업을 한 에이전트에게 맡기면 컨텍스트 창이 폭발하는데, 팀으로 나누면 각자 자신의 작업 맥락만 유지하면 된다.

[OpenClaw 환경에서 에이전트 팀을 실제로 구성하고 운용한 경험](/ko/blog/ko/claude-agent-teams-guide)을 담은 포스트가 있다. 역할 설계부터 tmux 기반 모니터링까지 구체적으로 나와 있다.

**언제 쓰나**: 순차적이지만 복잡한 멀티스텝 작업. 콘텐츠 파이프라인, 코드 리뷰 → 수정 → 테스트 → 배포 사이클 등.

실제로 [멀티 에이전트 오케스트레이션을 블로그 시스템에 적용했을 때 겪은 실패와 개선 과정](/ko/blog/ko/multi-agent-orchestration-improvement)을 보면, 역할 경계가 불명확하면 에이전트들이 서로 충돌하거나 무한 루프에 빠질 수 있다는 걸 실감했다.

## 패턴 5: Autonomous (자율)

사람의 개입 없이 크론이나 이벤트 트리거로 실행되는 완전 자율 패턴이다. 이 블로그의 일일 포스팅 파이프라인이 이 방식으로 운영된다.

```bash
# launchd 또는 cron으로 실행
# 15:23마다 트렌드 리서치 → 포스트 작성 → 빌드 → 커밋 → 푸시

#!/bin/bash
cd ~/workspace/blog
claude --no-interactive "
  오늘의 기술 트렌드를 조사하고,
  블로그 포스트를 4개 언어로 작성하고,
  빌드 검증 후 git push까지 완료해줘.
  실패 시 텔레그램으로 알림 전송.
"
```

이 패턴을 쓰려면 전제 조건이 있다:
- **명확한 성공/실패 기준** 정의 필수
- **롤백 메커니즘** 준비 (git revert 등)
- **모니터링과 알림** 구성 (Hooks의 `stop` 이벤트 활용)

솔직히 말하면, 자율 패턴은 처음엔 과신하기 쉽다. 잘 동작할 때는 마법같지만, 에이전트가 잘못된 방향으로 달리면 멈추는 게 생각보다 어렵다. 특히 파일 시스템을 건드리거나 외부 서비스에 쓰는 작업은 **항상 dry-run 모드로 먼저 검증**하는 걸 권장한다.

## 어떤 패턴을 선택해야 할까

내가 패턴을 고를 때 쓰는 기준이다:

**작업을 중간에 검토해야 하는가?**
- Yes → Sequential

**작업이 여러 개이고 서로 독립적인가?**
- Yes → Parallel

**역할이 명확히 구분되는 복잡한 파이프라인인가?**
- Yes → Teams

**반복·스케줄 실행이 필요하고 충분히 검증됐는가?**
- Yes → Autonomous

**그 외 단일 복잡 작업?**
- Operator

간단해 보이지만 실제로는 복합 패턴이 많다. 예를 들어 이 블로그의 자동화 파이프라인은 Teams + Autonomous의 조합이다 — 팀 패턴으로 콘텐츠를 생성하고, 그 전체 파이프라인이 자율로 스케줄 실행된다.

## 패턴 선택보다 중요한 것

에이전트 패턴을 아무리 잘 설계해도, CLAUDE.md와 권한 설정이 엉망이면 소용없다. 내가 경험한 실패 패턴 중 가장 흔한 건 "범위가 너무 넓게 설정된 Operator"였다. 에이전트가 수정하지 말아야 할 파일을 건드리거나, 예상치 못한 bash 명령을 실행했다.

각 패턴을 처음 도입할 때는 작업 범위를 좁게 시작해서 점진적으로 넓혀가는 게 안전하다. 패턴 자체보다 **경계 설정이 핵심**이다.
