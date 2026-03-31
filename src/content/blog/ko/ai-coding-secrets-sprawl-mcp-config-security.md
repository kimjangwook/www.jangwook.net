---
title: 'AI 코딩 에이전트가 2,900만 시크릿을 유출시켰다 — MCP 설정 파일 보안의 사각지대'
description: >-
  GitGuardian 2026 리포트에 따르면 AI 코딩 도구 사용 리포지토리의 시크릿 유출률은 GitHub 평균의 2배다. MCP 설정
  파일에서만 24,000개 이상의 크리덴셜이 노출됐다. 실제 점검 방법과 대응책을 정리한다.
pubDate: '2026-03-30'
heroImage: ../../../assets/blog/ai-coding-secrets-sprawl-mcp-config-security-hero.jpg
tags:
  - security
  - mcp
  - ai-coding
  - secrets
  - devops
relatedPosts:
  - slug: openai-promptfoo-ai-agent-devsecops
    score: 0.94
    reason:
      ko: 'AI/ML, DevOps, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: AI/ML、DevOps、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in AI/ML, DevOps, architecture with comparable
        difficulty.
      zh: 在AI/ML、DevOps、架构领域涵盖类似主题，难度相当。
  - slug: terraform-ai-batch-infrastructure
    score: 0.93
    reason:
      ko: 'AI/ML, DevOps, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: AI/ML、DevOps、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in AI/ML, DevOps, architecture with comparable
        difficulty.
      zh: 在AI/ML、DevOps、架构领域涵盖类似主题，难度相当。
  - slug: cursor-agent-trace-ai-code-attribution
    score: 0.93
    reason:
      ko: 'AI/ML, DevOps, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: AI/ML、DevOps、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in AI/ML, DevOps, architecture with comparable
        difficulty.
      zh: 在AI/ML、DevOps、架构领域涵盖类似主题，难度相当。
  - slug: roguepilot-copilot-prompt-injection-security
    score: 0.93
    reason:
      ko: 'AI/ML, DevOps, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: AI/ML、DevOps、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in AI/ML, DevOps, architecture with comparable
        difficulty.
      zh: 在AI/ML、DevOps、架构领域涵盖类似主题，难度相当。
  - slug: claude-firefox-22-cves-ai-security-audit
    score: 0.93
    reason:
      ko: 'AI/ML, DevOps, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: AI/ML、DevOps、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in AI/ML, DevOps, architecture with comparable
        difficulty.
      zh: 在AI/ML、DevOps、架构领域涵盖类似主题，难度相当。
---

지난주 GitGuardian이 발표한 *State of Secrets Sprawl 2026* 리포트를 훑어보다가 손이 멈췄다. GitHub에서 한 해 동안 탐지된 시크릿이 **2,900만 개**. 그런데 진짜 문제는 그 다음 문장이었다. AI 코딩 도구를 사용하는 리포지토리의 시크릿 유출률이 GitHub 전체 평균의 **2배**라는 것이다.

나는 매일 Claude Code와 MCP 서버를 연결해서 작업하는 사람이다. 솔직히 말하면, 이 리포트를 읽고 나서 내 `.claude/` 디렉토리와 MCP 설정 파일부터 점검했다. 결과적으로 문제는 없었지만, "왜 AI 코딩 도구가 시크릿 유출을 가속시키는가"에 대한 구조적인 이유를 이해하게 됐다.

## AI 코딩 도구가 시크릿 유출을 2배로 늘리는 이유

일반적인 개발에서 시크릿이 유출되는 경로는 비교적 단순하다. `.env` 파일을 `.gitignore`에 안 넣거나, 테스트 코드에 API 키를 하드코딩하거나. 그런데 AI 코딩 에이전트를 쓰기 시작하면 유출 경로가 급격히 늘어난다.

**첫 번째 문제는 컨텍스트 주입이다.** AI 에이전트에게 "이 API를 호출해줘"라고 요청하면, 에이전트가 생성하는 코드에 실제 API 키가 포함되는 경우가 있다. 특히 에이전트가 환경 변수 대신 직접 값을 인라인으로 넣는 패턴이 은근히 잦다. 사람이 작성하면 "아, 이건 환경 변수로 빼야지"라는 습관이 있지만, AI는 "동작하는 코드"를 최우선으로 생성한다.

**두 번째 문제가 더 심각하다. MCP 설정 파일이다.** Claude Code, Cursor, Windsurf 같은 도구들이 MCP 서버에 연결할 때 사용하는 설정 파일에는 데이터베이스 접속 정보, API 키, OAuth 토큰이 평문으로 들어간다. GitGuardian에 따르면 공개 리포지토리의 MCP 설정 파일에서만 **24,008개**의 고유 시크릿이 발견됐다.

```json
// 이런 설정 파일이 그대로 커밋되는 사례가 수만 건
{
  "mcpServers": {
    "database": {
      "command": "mcp-server-postgres",
      "args": ["postgresql://admin:P@ssw0rd123@prod-db.example.com:5432/main"]
    },
    "slack": {
      "command": "mcp-server-slack",
      "env": {
        "SLACK_BOT_TOKEN": "xoxb-your-token-here"
      }
    }
  }
}
```

이 파일이 `.gitignore`에 들어가 있지 않으면, `git add -A` 한 번에 프로덕션 DB 크리덴셜이 GitHub에 올라간다. AI 코딩 에이전트가 "이 파일도 커밋할까요?"라고 물어보면 대부분 "네"라고 답하는 게 현실이다.

## 실제로 점검해봤다

내 작업 환경을 기준으로 체크한 항목을 공유한다.

**1. MCP 설정 파일 위치 확인**

```bash
# Claude Code의 MCP 설정 파일 위치
ls -la ~/.claude/mcp_settings.json 2>/dev/null
ls -la ./.claude/settings.local.json 2>/dev/null

# 프로젝트 내 MCP 관련 설정 검색
grep -r "mcpServers" . --include="*.json" -l
```

**2. .gitignore 점검**

```bash
# MCP 설정 파일이 gitignore에 포함되어 있는지 확인
grep -E "mcp|settings\.local" .gitignore
```

내 경우 `.claude/settings.local.json`이 `.gitignore`에 들어 있었지만, 프로젝트별 MCP 설정이 별도 JSON 파일로 존재하는 경우가 있어서 그 파일은 빠져 있었다. 이건 바로 추가했다.

**3. Git 히스토리에서 이미 유출된 시크릿 검색**

```bash
# 과거 커밋에 시크릿이 포함된 적 있는지 확인
git log --all --diff-filter=A -- '*.json' | head -20
git log -p --all -S 'SLACK_BOT_TOKEN' -- '*.json'
git log -p --all -S 'postgresql://' -- '*.json'
```

여기서 중요한 점은, `.gitignore`에 추가해도 이미 커밋된 파일은 히스토리에 남아 있다는 것이다. 한 번이라도 시크릿이 커밋됐다면 키를 로테이션하는 게 유일한 해결책이다.

## GitHub MCP Server의 시크릿 스캐닝

3월 17일, GitHub가 MCP Server에 시크릿 스캐닝 기능을 퍼블릭 프리뷰로 추가했다. AI 코딩 에이전트가 GitHub MCP Server를 통해 작업할 때, 푸시 전에 자동으로 시크릿을 탐지해주는 기능이다.

설정은 GitHub 리포지토리의 Settings > Code security and analysis에서 "Secret scanning"과 "Push protection"을 활성화하면 된다. 이미 활성화한 리포지토리라면 MCP Server를 통한 작업에도 자동 적용된다.

개인적으로 이 기능이 기대되는 이유는, AI 에이전트가 만드는 코드의 시크릿 유출을 **에이전트 워크플로우 안에서** 잡아준다는 점이다. 사람이 리뷰하기 전에 시스템이 먼저 잡아주니까, "에이전트가 커밋한 코드를 내가 리뷰하는" 현실적인 워크플로우에 잘 맞는다.

## 하지만 이것만으로는 부족하다

솔직히 얘기하면, GitHub의 시크릿 스캐닝은 **알려진 패턴의 시크릿**만 탐지한다. 커스텀 내부 API 키나 비표준 포맷의 토큰은 놓칠 수 있다. 그리고 GitHub 외부 리포지토리(GitLab, Bitbucket, 자체 호스팅)를 쓰는 팀에는 적용되지 않는다.

또 하나, MCP 설정 파일의 크리덴셜 관리를 위한 표준이 아직 없다. Anthropic이나 MCP 커뮤니티에서 "시크릿은 이렇게 관리하세요"라는 공식 가이드라인이 없고, 각자 알아서 환경 변수로 빼거나, 시크릿 매니저를 연결하거나 하는 상황이다.

나는 MCP 생태계가 성숙하려면 설정 파일의 크리덴셜 참조 표준이 필요하다고 본다. Docker Compose의 `secrets:` 블록이나, Kubernetes의 `secretKeyRef` 같은 패턴을 MCP 설정에도 도입해야 한다. 현재 MCP 설정에서 `env:` 블록으로 환경 변수를 참조하는 것까지는 가능하지만, 시크릿 매니저(HashiCorp Vault, AWS Secrets Manager 등)와의 통합은 각 MCP 서버 구현체마다 제각각이다.

## 체크리스트: AI 코딩 에이전트 시크릿 보안

내가 실제로 적용하고 있는 항목들이다.

- `.claude/settings.local.json`이 `.gitignore`에 있는지 확인
- MCP 설정 파일에 평문 크리덴셜 대신 환경 변수 참조 사용 (`"env": {"KEY": "환경변수명"}`)
- GitHub Push Protection 활성화 (Settings > Code security)
- `git add -A` 대신 `git add <파일명>`으로 명시적 스테이징
- AI 에이전트가 생성한 코드에 하드코딩된 시크릿이 없는지 커밋 전 확인
- 분기별 Git 히스토리 시크릿 스캔 (gitleaks 또는 truffleHog 사용)
- MCP 서버 연결에 사용하는 토큰의 최소 권한 원칙 적용

## 마무리

2,900만 개라는 숫자는 무서운데, 사실 대부분의 시크릿 유출은 복잡한 공격이 아니라 "깜빡하고 커밋한" 수준의 실수에서 발생한다. AI 코딩 에이전트가 이 실수의 빈도를 높이고 있다는 게 이번 리포트의 핵심이다.

나한테 가장 와닿은 교훈은, AI 에이전트를 쓰면 코드 생성 속도가 빨라지는 만큼 **보안 리뷰의 속도도 따라가야 한다**는 것이다. 에이전트가 10초 만에 만든 코드를 30초도 안 보고 커밋하는 습관이 가장 위험하다. 적어도 `git diff`는 한 번 훑어보자. 특히 `.json`, `.yaml`, `.env` 확장자 파일이 스테이징에 포함되어 있다면.
