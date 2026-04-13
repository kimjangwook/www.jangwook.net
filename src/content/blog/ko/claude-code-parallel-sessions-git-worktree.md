---
title: Claude Code 병렬 세션 운영하기 — Git Worktree로 여러 작업 동시에 처리하는 실전 가이드
description: >-
  Git Worktree와 Claude Code를 조합해 여러 기능을 병렬로 개발하는 실전 가이드. Plan Mode 활용법, 독립 세션
  격리 전략, Worktree 간 충돌 없는 브랜치 관리, 멀티에이전트 병렬 패턴까지, 직접 경험을 기반으로 단계별로 구체적으로 정리했습니다.
pubDate: '2026-04-13'
heroImage: ../../../assets/blog/claude-code-parallel-sessions-git-worktree-hero.jpg
tags:
  - ClaudeCode
  - Git
  - 생산성
  - 튜토리얼
  - AI코딩
relatedPosts:
  - slug: mcp-servers-toolkit-introduction
    score: 0.94
    reason:
      ko: 'Claude Code를 여러 worktree에서 동시에 실행할 때, 각 세션에 다른 MCP 도구 조합을 연결하면 더 특화된 병렬 작업이 가능합니다. MCP 서버 생태계를 파악해두면 세션별 도구 설정이 수월해집니다.'
      ja: 複数のworktreeでClaude Codeを同時実行する際、各セッションに異なるMCPツールの組み合わせを接続すると、より特化した並列作業が可能になります。MCPサーバーのエコシステムを把握しておくと、セッションごとのツール設定が楽になります。
      en: 'When running Claude Code across multiple worktrees simultaneously, connecting different MCP tool combinations to each session enables more specialized parallel work. Knowing the MCP server ecosystem makes per-session tool configuration much easier.'
      zh: 在多个worktree中同时运行Claude Code时，为每个会话连接不同的MCP工具组合可以实现更专业的并行工作。了解MCP服务器生态系统有助于简化各会话的工具配置。
  - slug: openclaw-opus-4-6-setup-guide
    score: 0.94
    reason:
      ko: 'OpenClaw는 Claude Code의 원격·자동화 레이어인데, worktree 병렬 세션과 결합하면 여러 브랜치를 원격에서 동시에 자율 실행하는 패턴으로 자연스럽게 이어집니다.'
      ja: OpenClawはClaude Codeのリモート・自動化レイヤーであり、worktreeの並列セッションと組み合わせると、複数のブランチをリモートで同時に自律実行するパターンへと自然に発展します。
      en: 'OpenClaw is the remote and automation layer for Claude Code. Combined with worktree parallel sessions, it naturally extends into a pattern where multiple branches run autonomously from a remote environment simultaneously.'
      zh: OpenClaw是Claude Code的远程自动化层，与worktree并行会话结合，自然延伸为在远程环境中同时自主运行多个分支的模式。
  - slug: github-agentic-workflows-cicd-ai
    score: 0.93
    reason:
      ko: '각 worktree 브랜치를 GitHub Actions CI/CD와 연결하면 병렬 개발 → 자동 테스트 → 자동 머지까지 완전 자동화 흐름이 완성됩니다. 이 글이 그 마지막 퍼즐 조각입니다.'
      ja: 各worktreeブランチをGitHub Actions CI/CDと連携すると、並列開発→自動テスト→自動マージまでの完全自動化フローが完成します。この記事がその最後のパズルのピースです。
      en: 'Connecting each worktree branch to GitHub Actions CI/CD completes a fully automated flow: parallel development → automated testing → automated merge. This post is the final puzzle piece.'
      zh: 将每个worktree分支与GitHub Actions CI/CD连接，完成并行开发→自动测试→自动合并的完整自动化流程。这篇文章是最后一块拼图。
  - slug: stripe-minions-autonomous-coding-agents-1300-prs
    score: 0.93
    reason:
      ko: 'Stripe가 1,300개 PR을 자율 에이전트로 처리한 것은 결국 worktree 기반 병렬 세션의 대규모 버전입니다. 내 워크플로우를 그 방향으로 확장할 때 좋은 참고가 됩니다.'
      ja: Stripeが1,300のPRを自律エージェントで処理したのは、結局worktreeベースの並列セッションの大規模バージョンです。自分のワークフローをその方向に拡張するときの良い参考になります。
      en: "Stripe's approach of handling 1,300 PRs with autonomous agents is essentially the large-scale version of worktree-based parallel sessions. A great reference when scaling your own workflow in that direction."
      zh: Stripe用自主智能体处理1300个PR，本质上是基于worktree并行会话的大规模版本。这是将个人工作流向该方向扩展的好参考。
  - slug: claude-code-cli-migration-guide
    score: 0.92
    reason:
      ko: 'worktree 패턴을 쓰다 보면 Claude Code CLI를 스크립트로 직접 호출하고 싶어집니다. 이 마이그레이션 가이드가 CLI 직접 활용의 출발점이 됩니다.'
      ja: worktreeパターンを使っていると、Claude Code CLIをスクリプトから直接呼び出したくなります。このマイグレーションガイドがCLI直接活用の出発点になります。
      en: 'Once you get comfortable with the worktree pattern, you start wanting to call Claude Code CLI directly from scripts. This migration guide is the starting point for that direct CLI usage.'
      zh: 熟悉worktree模式后，你会想直接从脚本中调用Claude Code CLI。这个迁移指南是直接使用CLI的起点。
---

Claude Code 탭을 여러 개 열어두면 "병렬 작업"처럼 느껴진다. 그런데 실제로는 아니다.

같은 브랜치에서 두 개의 Claude Code 세션을 동시에 돌리면, 한 세션이 파일을 수정하는 순간 다른 세션의 컨텍스트가 오염된다. 파일 상태가 맞지 않는다는 경고, 예상치 못한 merge conflict, 어느 세션이 뭘 했는지 추적 불가. 나는 이걸 직접 겪고 나서야 git worktree를 진지하게 들여다봤다.

결론부터 말하면, **git worktree + Claude Code 조합은 생각보다 훨씬 자연스럽게 작동한다**. 설정도 복잡하지 않다.

## Git Worktree가 뭔지 먼저

git worktree는 하나의 git 저장소에서 여러 브랜치를 동시에 서로 다른 디렉토리에 체크아웃할 수 있는 기능이다. 2016년부터 git에 내장되어 있는데, 생각보다 잘 알려지지 않았다.

핵심 차이를 하나만 짚자면: 브랜치를 전환(`git checkout`)하면 작업 디렉토리 자체가 바뀐다. worktree를 쓰면 각 브랜치가 **서로 다른 물리적 디렉토리**에 독립적으로 존재한다.

```bash
# 기존 방식: 브랜치 전환 시 파일이 바뀜
git checkout feature/new-login  # 현재 디렉토리의 파일이 통째로 교체됨

# worktree 방식: 디렉토리 자체가 나뉨
git worktree add ../project-feature feature/new-login  # 별도 디렉토리로 분리
```

Claude Code 입장에서 이게 왜 중요하냐면: **각 worktree 디렉토리에서 독립적인 Claude Code 세션을 실행할 수 있기 때문**이다. 파일 충돌 없음, 컨텍스트 오염 없음.

## 실제 설정 방법

프로젝트가 `~/project/my-app`에 있다고 가정한다.

```bash
# 1. 메인 작업 디렉토리 확인
cd ~/project/my-app
git status  # main 브랜치, 깨끗한 상태

# 2. worktree 추가 (브랜치 이름 = 작업 디렉토리 이름으로 맞추면 편함)
git worktree add ../my-app-feature feature/add-oauth
git worktree add ../my-app-bugfix fix/login-redirect

# 3. 확인
git worktree list
```

결과:

```
/Users/jangwook/project/my-app         abc1234 [main]
/Users/jangwook/project/my-app-feature def5678 [feature/add-oauth]
/Users/jangwook/project/my-app-bugfix  ghi9012 [fix/login-redirect]
```

이제 세 개의 디렉토리가 **같은 git 저장소를 공유**하면서 각자 다른 브랜치를 체크아웃하고 있다. `.git` 폴더는 원본에만 있고 나머지는 `.git` 파일(링크)을 가진다.

## Claude Code 병렬 세션 실행하기

각 디렉토리에서 별도의 터미널을 열고 Claude Code를 실행한다.

```bash
# 터미널 1: 메인 작업
cd ~/project/my-app
claude

# 터미널 2: OAuth 기능 개발
cd ~/project/my-app-feature
claude

# 터미널 3: 로그인 버그 수정
cd ~/project/my-app-bugfix
claude
```

각 세션은 완전히 독립적이다. 터미널 2에서 `src/auth/oauth.ts`를 수정해도 터미널 3의 Claude Code는 모른다. 서로 다른 브랜치의 파일이니까.

[Claude Code 기본 사용법과 Best Practices](/ko/blog/ko/claude-code-best-practices)를 이미 익혔다면, 이 패턴은 바로 적용할 수 있다.

## Plan Mode를 활용한 작업 분배

병렬 세션을 효과적으로 쓰려면 **먼저 계획을 세우고 나서 분배**해야 한다. 무작정 여러 세션을 열어도 효율이 나지 않는다.

내가 쓰는 패턴:

**1단계: 메인 세션에서 Plan Mode로 전체 계획 수립**

메인 디렉토리의 Claude Code 세션에서 Plan Mode(`Shift+Tab` 또는 `/plan`)를 켜고 전체 작업을 분석한다.

```
나: 이번 스프린트에서 OAuth 로그인 추가, 로그인 리다이렉트 버그 수정, 
    API 문서 업데이트를 해야 해. 각 작업을 독립적인 worktree에서 
    병렬로 진행하려고 하는데, 어떻게 나누는 게 좋을까?

Claude: [각 작업의 파일 의존성을 분석하고 충돌 가능 지점 식별]
```

**2단계: 각 worktree에 구체적인 컨텍스트 전달**

Plan Mode 결과를 토대로, 각 세션에 명확한 지시를 준다. 모호한 지시는 Claude Code가 다른 파일을 건드릴 여지를 만든다.

```bash
# my-app-feature 세션에서
나: feature/add-oauth 브랜치야. src/auth/ 디렉토리에만 
    집중해서 Google OAuth를 추가해줘. 
    다른 디렉토리는 건드리지 않아도 돼.
```

**3단계: 완료 후 메인에서 통합**

```bash
# 각 브랜치 작업이 끝나면
git merge feature/add-oauth
git merge fix/login-redirect
```

## 실전 예시: 세 가지 작업 동시 진행

최근에 실제로 써본 케이스다. 블로그 프로젝트에서:

- `main`: 일상적인 컨텐츠 관리 (이미 배포된 상태 유지)
- `feature/recommendation-v4`: 콘텐츠 추천 알고리즘 개선
- `fix/og-image-path`: OG 이미지 경로 버그 수정

worktree 없이 했다면, 추천 알고리즘 개발 중에 OG 이미지 버그가 발생했을 때 브랜치를 전환하거나 stash를 써야 했을 것이다. worktree를 쓰니까 그냥 다른 터미널 창으로 이동해서 바로 수정했다.

[Claude Code Hook으로 자동화된 리뷰 시스템을 구성해두면](/ko/blog/ko/claude-code-hooks-workflow), worktree 전환 시 자동으로 컨텍스트를 업데이트하는 hook도 달 수 있다.

## 주의사항과 실제 한계

### 공유 리소스 주의

`package.json`, `package-lock.json`, `node_modules/`는 원본과 worktree가 공유하지 않는다. 각 worktree에서 `npm install`을 별도로 실행해야 할 수 있다. 특히 기능 브랜치에서 새로운 패키지를 추가했을 때.

### 데이터베이스 연결 충돌

로컬 데이터베이스를 같은 포트로 쓰는 개발 서버를 여러 worktree에서 동시에 올리면 포트 충돌이 난다. 각 worktree의 `.env.local`에서 포트를 다르게 설정하거나, DB를 공유하되 마이그레이션은 한 쪽에서만 실행해야 한다.

### worktree 정리

작업이 끝나면 worktree를 삭제해야 `.git/worktrees/`가 비대해지지 않는다.

```bash
# 브랜치 머지 후 worktree 삭제
git worktree remove ../my-app-feature

# 강제 삭제 (수정 사항이 남아있어도)
git worktree remove --force ../my-app-feature
```

### 솔직한 한계

나는 이 패턴이 꽤 마음에 들지만, 만능은 아니다. 작업들이 서로 다른 파일을 건드리는 경우에 가장 효과적이고, 같은 컴포넌트를 두 세션이 모두 수정해야 한다면 오히려 머지 충돌이 더 많이 생긴다. 또, 세션이 3개를 넘어가면 어느 세션이 어디까지 했는지 추적하기 시작하면서 오버헤드가 생긴다.

[멀티 에이전트 PR 리뷰 패턴](/ko/blog/ko/claude-code-review-multi-agent-pr)과 결합하면 각 worktree 브랜치에서 나온 PR을 자동으로 리뷰할 수 있어서, 팀 단위에서는 이 조합이 가장 실용적이었다.

## 명령어 요약

```bash
# worktree 생성
git worktree add <경로> <브랜치명>
git worktree add <경로> -b <신규 브랜치명>  # 새 브랜치 생성과 동시에

# 목록 확인
git worktree list

# 삭제
git worktree remove <경로>
git worktree prune  # 이미 삭제된 디렉토리의 참조 정리
```

## 마무리

솔직히 처음에는 "굳이 이렇게까지 해야 하나"라는 생각이 들었다. 그런데 한 번 써보고 나서는 병렬 개발이 필요한 상황에서 자연스럽게 손이 간다.

핵심은 간단하다: **독립적인 브랜치 → 독립적인 디렉토리 → 독립적인 Claude Code 세션**. 이 세 가지가 맞아떨어지면 서로 방해하지 않고 동시에 작업이 진행된다.

처음에는 두 개의 worktree로 시작해서, 패턴이 익숙해지면 세 개로 늘려보는 걸 권한다. [에이전트 팀 구성을 더 체계적으로 하고 싶다면](/ko/blog/ko/claude-agent-teams-guide) 그 다음 단계로 넘어가면 된다.
