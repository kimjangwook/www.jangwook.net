---
title: "Claude Code Agent Teams 완벽 가이드 — OpenClaw 에이전트 팀 구축부터 실전 운용까지"
description: "Claude Code의 Agent Teams 기능을 OpenClaw 환경에서 활성화하고, 5개 전문 팀을 구성해 실전 운용한 경험을 바탕으로 한 실용 가이드입니다."
pubDate: '2026-02-07'
heroImage: ../../../assets/blog/claude-agent-teams-guide-hero.png
tags: [claude-code, agent-teams, openclaw, multi-agent, tmux, automation]
relatedPosts:
  - slug: openclaw-cron-fix-guide
    score: 0.95
    reason:
      ko: "OpenClaw dev 채널 전환 과정을 다루며, Agent Teams 설정의 전제 조건입니다."
      ja: "OpenClaw devチャネル切り替え手順を扱い、Agent Teams設定の前提条件です。"
      en: "Covers OpenClaw dev channel migration, a prerequisite for Agent Teams setup."
      zh: "介绍OpenClaw dev频道切换过程，是Agent Teams设置的前提条件。"
  - slug: openclaw-opus-4-6-setup-guide
    score: 0.85
    reason:
      ko: "OpenClaw 모델 설정 가이드로, Agent Teams에서 사용할 모델 구성에 참고됩니다."
      ja: "OpenClawモデル設定ガイドで、Agent Teamsで使用するモデル構成の参考になります。"
      en: "OpenClaw model setup guide, useful for configuring models in Agent Teams."
      zh: "OpenClaw模型设置指南，对Agent Teams中使用的模型配置有参考价值。"
---

## Agent Teams란 무엇인가

2026년 2월 5일, Anthropic이 Claude Code의 새로운 실험적 기능인 **Agent Teams**를 발표했습니다. 기존의 서브에이전트(subagent)가 하나의 세션 안에서 결과만 돌려주는 단방향 구조였다면, Agent Teams는 완전히 독립된 여러 Claude Code 인스턴스가 **서로 메시지를 주고받으며 협업**하는 구조입니다.

핵심 차이를 정리하면 다음과 같습니다:

| 구분 | 서브에이전트 | Agent Teams |
|------|-------------|-------------|
| 컨텍스트 | 메인 세션 내부 | 각자 독립된 컨텍스트 윈도우 |
| 소통 | 결과만 메인에 반환 | 팀원 간 직접 메시지 교환 |
| 조율 | 메인 에이전트가 전담 | 공유 태스크 리스트로 자율 조율 |
| 토큰 비용 | 상대적으로 낮음 | 팀원 수에 비례해 증가 |

발표 당일, 이 기능을 OpenClaw 환경에서 즉시 테스트해보기로 했습니다. 이 글은 그 과정에서 겪은 삽질과 발견을 정리한 실전 가이드입니다.

## 사전 준비 — OpenClaw dev 빌드

Agent Teams를 쓰려면 최신 Claude Code가 필요하고, 당시 OpenClaw stable 채널에는 크론잡 버그가 있어 어차피 dev 채널로 전환해야 하는 상황이었습니다. ([관련 포스트](/ko/blog/ko/openclaw-cron-fix-guide/))

### pnpm 활성화

```bash
corepack enable pnpm
```

### dev 채널 전환 및 소스 빌드

```bash
export OPENCLAW_GIT_DIR=~/openclaw
openclaw update --channel dev
```

자동 업데이트가 실패하면 수동 빌드:

```bash
cd ~/openclaw
pnpm install && pnpm build && npm install -g .
```

### 게이트웨이 재시작

```bash
openclaw gateway restart
```

이 과정을 거치면 dev 채널의 v2026.2.4가 적용되고, Agent Teams를 지원하는 Claude Code 버전이 함께 포함됩니다.

## Agent Teams 활성화

Agent Teams는 기본적으로 비활성화되어 있습니다. 활성화 방법은 두 가지입니다:

### 방법 1: 환경변수 직접 설정

```bash
export CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1
```

### 방법 2: settings.json에 영구 설정

`~/.claude/settings.json`:

```json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```

### OpenClaw LaunchAgent에 반영하기

OpenClaw을 macOS LaunchAgent로 운영한다면, plist 파일의 `EnvironmentVariables` 섹션에 추가해야 게이트웨이 재시작 후에도 유지됩니다:

```xml
<key>EnvironmentVariables</key>
<dict>
    <key>CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS</key>
    <string>1</string>
</dict>
```

필자는 settings.json 방식을 선택했습니다. 환경변수는 세션마다 날아가지만, settings.json은 Claude Code가 시작될 때 자동으로 읽기 때문입니다.

## teammateMode 설정

Agent Teams의 표시 모드는 세 가지가 있습니다:

- **in-process**: 모든 팀원이 메인 터미널 안에서 실행됩니다. `Shift+↑/↓`으로 팀원을 선택할 수 있습니다.
- **tmux**: 각 팀원이 tmux 분할 패인에서 실행됩니다. 모든 출력을 한눈에 확인할 수 있습니다.
- **iTerm2**: iTerm2 사용 시 자동으로 분할됩니다.

기본값은 `auto`로, tmux 세션 안이면 분할 모드, 아니면 in-process 모드가 됩니다.

필자는 **tmux 모드**를 명시적으로 설정했습니다:

```json
{
  "teammateMode": "tmux"
}
```

tmux를 선택한 이유는 간단합니다. 5개 팀을 동시에 운영할 때, 각 팀원의 작업 현황을 **한 화면에서 실시간으로** 볼 수 있어야 병목을 빠르게 파악할 수 있기 때문입니다.

tmux가 없다면 먼저 설치해 주세요:

```bash
brew install tmux
```

## 팀 설계 — 5개 전문 팀 구성

이번에 구성한 5개 팀의 역할과 설계 의도를 정리합니다.

### 1. ops (운영)

```
인프라 점검, 게이트웨이 상태 확인, 크론잡 모니터링
```

시스템 안정성을 담당하는 팀입니다. dev 채널 전환 직후라 특히 중요했습니다.

### 2. branding (브랜딩)

```
블로그 포스트 작성, 히어로 이미지 생성, 다국어 콘텐츠 관리
```

기술 콘텐츠를 4개 언어(한/일/영/중)로 동시 생산하는 팀입니다. 바로 이 글도 branding 팀의 산출물입니다.

### 3. invest (투자)

```
시장 분석, 포트폴리오 리뷰, 리스크 평가
```

개인 투자 분석을 병렬로 처리하는 팀입니다.

### 4. dev (개발)

```
코드 리뷰, 리팩토링, 테스트 작성, 기능 구현
```

실제 코드를 다루는 팀입니다. 파일 충돌 방지를 위해 각 팀원이 담당 모듈을 명확히 분리하는 것이 핵심입니다.

### 5. social (소셜)

```
SNS 포스트 초안 작성, 트렌드 분석, 커뮤니티 모니터링
```

외부 커뮤니케이션을 담당하는 팀입니다.

팀 구성 프롬프트 예시:

```
5개 에이전트 팀을 구성해줘.
- ops: 인프라 운영 및 모니터링
- branding: 콘텐츠 생산 및 다국어 관리
- invest: 시장 분석 및 투자 리서치
- dev: 코드 작성 및 리뷰
- social: SNS 및 커뮤니티 관리
각 팀에 2명의 팀원을 배치하고, Sonnet 모델을 사용해.
```

## 태스크 리스트와 의존성 관리

Agent Teams의 핵심 메커니즘 중 하나가 **공유 태스크 리스트**입니다. 팀 리더가 태스크를 생성하면 팀원들이 자율적으로 가져가서(claim) 처리합니다.

### 태스크 상태

- **pending**: 대기 중
- **in progress**: 작업 중
- **completed**: 완료

### 의존성 설정

태스크 간 의존성을 설정하면, 선행 태스크가 완료되기 전까지 후속 태스크는 claim할 수 없습니다.

실제 예시:

```
태스크 리스트:
1. [ops] 게이트웨이 상태 점검
2. [ops] 크론잡 동작 확인 (→ 1번 의존)
3. [branding] 블로그 초안 작성
4. [branding] 히어로 이미지 생성
5. [branding] 다국어 번역 (→ 3번 의존)
6. [dev] 추천 시스템 리팩토링
7. [dev] 테스트 작성 (→ 6번 의존)
```

태스크 할당은 파일 잠금(file locking)으로 경합을 방지합니다. 여러 팀원이 동시에 같은 태스크를 claim하려 해도 충돌이 발생하지 않습니다.

## 실전 운용

### Delegate 모드

기본적으로 팀 리더도 직접 작업을 수행할 수 있지만, **Delegate 모드**를 활성화하면 리더는 조율 전담이 됩니다:

- 팀원 생성/종료
- 메시지 전달
- 태스크 관리

활성화: `Shift+Tab`

대규모 팀을 운영할 때는 Delegate 모드를 권장합니다. 리더가 직접 코딩을 시작하면 조율에 공백이 생기기 때문입니다.

### 팀원 직접 대화

팀 리더를 거치지 않고 특정 팀원에게 직접 지시할 수 있습니다:

- **in-process**: `Shift+↑/↓`로 팀원 선택 후 메시지 입력
- **tmux**: 해당 패인을 클릭해서 직접 상호작용

이 기능은 특정 팀원의 방향을 빠르게 수정해야 할 때 유용합니다.

### Plan Approval (계획 승인)

중요한 작업은 팀원이 먼저 계획을 세우고, 리더의 승인을 받은 후에 실행하도록 할 수 있습니다:

```
인증 모듈 리팩토링을 위한 architect 팀원을 생성해줘.
변경 작업 전에 반드시 계획 승인을 받도록 설정해.
```

리더가 승인하면 실행되고, 거부하면 피드백을 반영해 재계획합니다.

## OpenClaw × Agent Teams — 시너지 효과

여기서 흥미로운 점은 OpenClaw 자체의 멀티에이전트 기능과 Agent Teams가 **서로 다른 레이어**에서 동작한다는 것입니다.

### OpenClaw 멀티에이전트

- 텔레그램, 디스코드 등 **채널 레벨**에서 에이전트를 관리
- 각 에이전트가 독립된 페르소나와 설정을 가짐
- 크론잡, 하트비트 등 **자동화 스케줄링** 지원

### Claude Code Agent Teams

- **세션 레벨**에서 여러 Claude Code 인스턴스가 협업
- 공유 태스크 리스트와 메시지 시스템
- 코드 작업에 특화된 병렬 처리

두 계층을 조합하면 다음과 같은 구조가 됩니다:

```
OpenClaw 에이전트 (채널 레벨)
  └─ Claude Code 세션
       └─ Agent Team (세션 레벨)
            ├─ 팀원 A (ops)
            ├─ 팀원 B (branding)
            └─ 팀원 C (dev)
```

예를 들어, OpenClaw의 메인 에이전트가 텔레그램 메시지를 받으면 서브에이전트를 생성하고, 그 서브에이전트가 Agent Team을 구성해 복잡한 작업을 병렬로 처리한 뒤 결과를 텔레그램으로 전달하는 파이프라인이 가능합니다.

실제로 오늘 이 구조를 테스트하면서 확인한 내용입니다:

1. **OpenClaw 서브에이전트**가 블로그 포스트 작성 태스크를 받음
2. 서브에이전트 내부에서 **Agent Team**을 구성할 수도 있지만, 토큰 비용을 고려해 단일 세션으로 처리
3. 별도의 Agent Team에서는 ops/dev 작업을 병렬 처리

## 베스트 프랙티스

### 1. 파일 충돌 방지

Agent Teams의 가장 큰 함정은 **여러 팀원이 같은 파일을 수정하는 것**입니다.

- 팀원별로 담당 디렉토리/파일을 명확히 분리하세요
- 공유 파일은 한 팀원만 수정하도록 태스크 의존성을 설정하세요
- `.claude/teams/` 디렉토리에서 팀 설정을 확인할 수 있습니다

### 2. 컨텍스트 전달

팀원은 CLAUDE.md, MCP 서버, 스킬은 자동 로드하지만, **리더의 대화 히스토리는 상속받지 않습니다**. 따라서:

- 스폰 프롬프트에 충분한 맥락을 포함해 주세요
- 관련 파일 경로를 명시적으로 지정해 주세요
- 필요하면 CLAUDE.md에 팀 공통 정보를 추가하세요

### 3. 토큰 관리

각 팀원이 독립된 컨텍스트 윈도우를 사용하므로 토큰 소비가 급증합니다.

- 단순 작업은 서브에이전트로 충분합니다
- Agent Teams는 **토론, 리뷰, 병렬 탐색**에 집중하세요
- 브로드캐스트 메시지는 팀 규모에 비례해 비용이 증가하므로 최소화하세요

### 4. 권한 관리

팀원은 리더의 권한 설정을 상속받습니다. `--dangerously-skip-permissions`로 리더를 실행하면 모든 팀원도 동일 권한을 갖게 되므로 주의가 필요합니다.

## 한계와 주의사항

1. **실험적 기능**: `EXPERIMENTAL` 환경변수명에서 알 수 있듯이, 아직 정식 기능이 아닙니다. API가 변경될 수 있습니다.

2. **토큰 비용**: 5명 팀이면 최소 5배의 토큰 소비가 발생합니다. ROI를 따져봐야 합니다.

3. **디버깅의 어려움**: 여러 팀원이 동시에 작업하면 문제 발생 시 원인 추적이 복잡해집니다.

4. **순차 작업에는 비효율**: 의존성이 많은 작업은 어차피 직렬로 처리되므로 팀을 쓸 이유가 없습니다.

5. **같은 파일 수정 위험**: 현재 파일 레벨 잠금은 지원되지 않습니다. 태스크 설계로 우회해야 합니다.

6. **tmux 환경 필수**: 5개 팀을 제대로 모니터링하려면 tmux가 사실상 필수입니다. in-process 모드로는 한계가 있습니다.

## 마무리

Agent Teams는 아직 실험 단계지만, 가능성은 확실히 보입니다. 특히 OpenClaw의 멀티에이전트 아키텍처와 결합하면, 채널 레벨의 자동화 + 세션 레벨의 병렬 협업이라는 이중 구조를 구현할 수 있습니다.

다만 현시점에서 모든 작업에 Agent Teams를 적용하는 것은 비효율적입니다. **병렬 탐색, 코드 리뷰, 경쟁 가설 검증**처럼 독립적인 작업이 많고, 팀원 간 토론이 가치를 만드는 시나리오에 집중하시길 권장합니다.

설정 자체는 30분이면 끝납니다. 진짜 어려운 건 **어떤 작업을 팀으로 묶고, 어떻게 태스크를 분해할 것인가**라는 설계 문제입니다. 그 감각은 직접 써보면서 키우는 수밖에 없습니다.
