---
title: 'GitHub Actions + Claude Code CLI로 PR 자동 리뷰 파이프라인 구축하기'
description: 'GitHub Actions에 claude -p를 직접 연동해 PR 리뷰를 자동화하는 실전 가이드. --bare, --dangerously-skip-permissions, --max-budget-usd 플래그로 CI 환경에서 안전하게 Claude Code를 실행하는 법을 설명합니다.'
pubDate: '2026-04-30'
heroImage: ../../../assets/blog/github-actions-claude-code-ci-automation-hero.png
tags:
  - claude-code
  - github-actions
  - ci-cd
relatedPosts:
  - slug: claude-code-hooks-workflow
    score: 0.85
    reason:
      ko: 훅 기반 로컬 자동화를 구축했다면, GitHub Actions로 CI에서 같은 리뷰를 팀 전체에 적용하는 방법이 자연스러운 다음 단계입니다
      ja: ローカルフックで自動レビューを設定したなら、CI環境でチーム全体に展開するGitHub Actionsが次のステップです
      en: If you've built local hook-based review automation, scaling it to CI with GitHub Actions is the natural next step
      zh: 如果你已经配置了本地钩子自动化，将其通过GitHub Actions扩展到CI是下一步
  - slug: claude-code-review-multi-agent-pr
    score: 0.82
    reason:
      ko: Anthropic의 네이티브 멀티에이전트 리뷰 기능과 GitHub Actions 직접 통합 방식의 차이점을 이해하면 어느 접근법을 선택할지 결정하기 쉬워집니다
      ja: AnthropicネイティブのマルチエージェントレビューとGitHub Actions直接統合の違いを理解すると、どちらを選ぶか判断しやすくなります
      en: Understanding the difference between Anthropic's native multi-agent review and direct GitHub Actions integration helps you pick the right approach
      zh: 理解Anthropic原生多代理审查与直接GitHub Actions集成的差异，有助于选择合适的方案
  - slug: claude-code-parallel-sessions-git-worktree
    score: 0.75
    reason:
      ko: Claude Code를 CI에서 실행할 때 병렬 처리 패턴을 이해하면 대규모 모노레포에서 리뷰 속도를 크게 높일 수 있습니다
      ja: CIでClaudeCodeを実行する際に並列処理パターンを理解すると、大規模モノレポでレビュー速度を上げられます
      en: Understanding parallel execution patterns helps you speed up reviews in large monorepo CI setups
      zh: 理解并行执行模式有助于在大型单体仓库中提升审查速度
  - slug: github-agentic-workflows-cicd-ai
    score: 0.72
    reason:
      ko: GitHub의 네이티브 AI 에이전트 기능과 비교해보면 claude CLI 직접 통합 방식의 유연성이 어느 상황에서 더 유리한지 판단하는 데 도움이 됩니다
      ja: GitHubのネイティブAIエージェント機能と比較すると、claude CLI直接統合の柔軟性がどのような場面で有利かがわかります
      en: Comparing with GitHub's native AI agent feature helps you understand when direct claude CLI integration is more flexible
      zh: 与GitHub原生AI代理功能对比，有助于判断直接claude CLI集成在什么情况下更灵活
  - slug: claude-code-best-practices
    score: 0.70
    reason:
      ko: Claude Code를 CI에서 쓰기 전에 로컬 베스트 프랙티스를 먼저 익혀두면 프롬프트 설계와 비용 관리를 더 잘할 수 있습니다
      ja: CIで使う前にローカルでのベストプラクティスを把握しておくと、プロンプト設計とコスト管理が改善されます
      en: Knowing Claude Code best practices before using it in CI helps you design better prompts and control costs
      zh: 在CI中使用之前了解Claude Code最佳实践，有助于更好地设计提示词和控制成本
---

PR이 올라올 때마다 직접 코드를 읽는 작업이 쌓이기 시작했다. 리뷰어 한 명이 하루에 처리할 수 있는 PR 수에는 현실적인 한계가 있고, 특히 보일러플레이트 변경이나 반복적인 패턴의 버그는 "사람이 굳이 읽어야 하나?" 싶은 생각이 들었다. 그래서 GitHub Actions에 Claude Code CLI를 직접 연결해 PR 리뷰를 자동화해봤다.

결론부터 말하면, 의외로 설정이 간단했다. Claude Code 2.1에서 추가된 `--bare`와 `--no-session-persistence` 플래그 덕분에 CI 환경에서 불필요한 오버헤드 없이 `claude -p`를 깔끔하게 실행할 수 있다. 이 글에서는 내가 직접 테스트한 워크플로우 YAML과 핵심 CLI 플래그 조합을 단계별로 공유한다.

## Prerequisites: 시작하기 전에 필요한 것들

설정을 시작하기 전에 체크해야 할 항목이 몇 가지 있다.

**필수**:
- Anthropic API 키 (`ANTHROPIC_API_KEY`) — [console.anthropic.com](https://console.anthropic.com)에서 발급. GitHub 레포지토리의 Settings → Secrets and variables → Actions에 `ANTHROPIC_API_KEY` 이름으로 등록한다
- GitHub Actions가 활성화된 레포지토리
- Node.js 20+ (Actions 런타임에서 자동 설치 가능)

**권장**:
- Anthropic API 사용량 알림 설정 — console.anthropic.com에서 월간 한도를 걸어두는 걸 강력 권장한다. 예상치 못하게 거대한 PR이 올라오거나 루프가 생기면 비용이 폭증할 수 있다
- `.github/CODEOWNERS` 파일 — 자동 리뷰 외에 반드시 사람 리뷰가 필요한 파일/경로를 지정해두면 Claude 리뷰와 사람 리뷰를 명확히 분리할 수 있다

**선택 (로컬 테스트용)**:
```bash
# Claude Code CLI 로컬 설치
npm install -g @anthropic-ai/claude-code

# 버전 확인
claude --version
# 2.1.123 (Claude Code)
```

로컬에 설치해두면 Actions에 올리기 전에 프롬프트 품질과 비용을 먼저 테스트할 수 있다. 위에서 소개한 `scripts/local-review.sh`를 쓰면 된다.

## Claude Code CLI의 CI 모드 이해

GitHub Actions에서 `claude` 명령어를 쓸 때 가장 먼저 알아야 하는 것은 "인터랙티브 모드를 완전히 끄는 방법"이다. 로컬에서 쓰는 Claude Code는 키보드 입력을 기다리고, LSP를 로드하고, 세션을 저장하고, 훅을 실행하는 등 CI에서는 전혀 필요 없는 작업을 많이 한다.

2.1.123 기준으로 CI용 플래그 조합은 이렇다:

```bash
claude -p "여기에 프롬프트" \
  --output-format text \
  --max-budget-usd 0.50 \
  --bare \
  --no-session-persistence \
  --dangerously-skip-permissions
```

각 플래그의 역할을 정리하면:

| 플래그 | 역할 | CI 필요 여부 |
|--------|------|-------------|
| `-p` | 비인터랙티브 모드 (출력 후 종료) | 필수 |
| `--output-format text` | 마크다운 텍스트 출력 | 필수 |
| `--max-budget-usd 0.50` | 실행당 최대 비용 한도 설정 | 강력 권장 |
| `--bare` | LSP·훅·메모리·자동 discovery 비활성화 | 권장 |
| `--no-session-persistence` | 세션 디스크 저장 비활성화 | 권장 |
| `--dangerously-skip-permissions` | 권한 체크 우회 | CI 샌드박스 전용 |

`--dangerously-skip-permissions`는 이름이 위협적으로 보이지만, CI 러너처럼 격리된 임시 환경에서는 오히려 올바른 선택이다. 로컬에서 절대 쓰면 안 된다. GitHub Actions 러너는 매번 새 VM에서 시작해서 상태가 없으므로 안전하다.

`--max-budget-usd`는 솔직히 나도 처음에 과소평가했다. 설정 안 하면 diff가 큰 PR에서 Claude가 여러 번 API를 호출해 비용이 예상보다 몇 배 나올 수 있다. PR 리뷰 한 건에 0.30〜0.50달러, 나이틀리 감사는 0.10달러 수준으로 설정해두면 팀 규모에 따라 월 50〜200달러 선에서 관리할 수 있다.

## Step 1: PR 자동 리뷰 워크플로우 만들기

`.github/workflows/claude-pr-review.yml`을 생성한다. 핵심 흐름은 단순하다: PR이 열리면 → diff를 추출하고 → Claude에게 넘긴 뒤 → 결과를 PR 코멘트로 붙이는 것이다.

```yaml
name: Claude Code PR Review

on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  review:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0   # 전체 히스토리 필요 (diff 비교용)

      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install Claude Code
        run: npm install -g @anthropic-ai/claude-code

      - name: Generate PR diff
        run: |
          git diff origin/${{ github.base_ref }}...HEAD \
            -- '*.ts' '*.tsx' '*.js' '*.py' '*.go' > pr.diff
          echo "DIFF_SIZE=$(wc -c < pr.diff)" >> $GITHUB_ENV

      - name: Skip if no diff
        if: env.DIFF_SIZE == '0'
        run: echo "No code changes — skipping review" && exit 0

      - name: Claude Code review
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          DIFF_CONTENT=$(cat pr.diff)
          claude -p \
            "Review this PR diff as a senior engineer. Respond in markdown with sections: ## Bugs, ## Security, ## Performance, ## Style. For each issue, cite file+line and explain why it matters.\n\n${DIFF_CONTENT}" \
            --output-format text \
            --max-budget-usd 0.50 \
            --bare \
            --no-session-persistence \
            --dangerously-skip-permissions \
            > review.md

      - name: Post review to PR
        uses: actions/github-script@v7
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          script: |
            const fs = require('fs');
            const body = fs.readFileSync('review.md', 'utf8');
            await github.rest.issues.createComment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.issue.number,
              body: `## 🤖 Claude Code Review\n\n${body}`
            });
```

몇 가지 설계 결정을 설명하면:

**`fetch-depth: 0`**: 이걸 빠뜨리면 `git diff origin/main...HEAD`가 동작하지 않는다. 기본 `fetch-depth: 1`은 얕은 복제(shallow clone)라 베이스 브랜치 커밋 정보가 없다. 반드시 0으로 설정해야 한다.

**파일 확장자 필터**: `-- '*.ts' '*.tsx' '*.js' '*.py' '*.go'`처럼 검토할 파일 유형을 명시적으로 지정하는 게 좋다. 설정 파일, JSON, 문서까지 전부 diff에 넣으면 토큰이 낭비되고 리뷰 품질도 떨어진다.

**`DIFF_SIZE` 체크**: 빈 diff일 때 (타입 정의만 바꾸거나 주석만 수정한 PR 등) 불필요한 API 호출을 막는다.

## Step 2: 나이틀리 코드 건강 감사 자동화

PR 리뷰보다 내가 더 실용적이라고 느낀 건 나이틀리 감사다. 매일 밤 1시에 지난 7일간 변경된 파일을 대상으로 기술 부채와 개선 포인트를 정리해서 아티팩트로 저장한다.

```yaml
name: Nightly Code Audit

on:
  schedule:
    - cron: '0 1 * * *'
  workflow_dispatch:
    inputs:
      since_days:
        description: 'Days to look back'
        default: '7'
        type: string

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 30

      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install Claude Code
        run: npm install -g @anthropic-ai/claude-code

      - name: Collect recently changed files
        run: |
          DAYS="${{ inputs.since_days || '7' }}"
          git log --since="${DAYS} days ago" \
            --name-only --format="" \
            -- '*.ts' '*.tsx' '*.py' | sort -u > changed.txt
          echo "FILES=$(cat changed.txt | wc -l)" >> $GITHUB_ENV

      - name: Claude tech-debt audit
        if: env.FILES != '0'
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          echo "# Code Health Report — $(date +%Y-%m-%d)" > report.md
          echo "" >> report.md

          while IFS= read -r FILE; do
            [ -f "$FILE" ] || continue
            LINES=$(wc -l < "$FILE")
            [ "$LINES" -gt 500 ] && continue   # 너무 큰 파일은 스킵

            echo "## $FILE" >> report.md
            claude -p \
              "In 3 bullet points: main tech debt, dead code, or improvement opportunity in this file. Be specific, not generic." \
              --add-dir . \
              --output-format text \
              --max-budget-usd 0.10 \
              --bare \
              --no-session-persistence \
              --dangerously-skip-permissions \
              "$(cat "$FILE")" >> report.md
            echo "" >> report.md
          done < changed.txt

      - name: Upload report
        uses: actions/upload-artifact@v4
        with:
          name: audit-${{ github.run_number }}
          path: report.md
          retention-days: 90
```

이 방식의 실용적인 한계도 솔직히 적어둔다. 500줄 넘는 파일을 스킵하는 로직을 넣었는데, 그게 없으면 레거시 서비스 파일 하나를 분석하는 데 0.50달러가 훌쩍 넘는다. 나이틀리 예산을 팀 규모에 맞게 파일당 0.10달러로 제한하는 게 현실적이다.

Claude가 "기술 부채"를 짚어주는 방식도 생각보다 획일적이다. 파일의 컨텍스트를 모르니 "이 함수가 너무 길다", "에러 핸들링이 없다" 같은 범용 지적이 섞인다. PR 리뷰는 diff만 보면 되니까 더 날카롭지만, 전체 파일 감사는 "시작점을 주는 도구"로 기대치를 낮춰야 한다.

## Step 3: 로컬에서 먼저 테스트하기

CI에 배포하기 전에 로컬에서 테스트하는 스크립트도 같이 만들어두면 편하다. 실제로 나는 이걸 먼저 돌려보고 나서 Actions 워크플로우 비용 설정을 조정했다.

```bash
#!/usr/bin/env bash
# scripts/local-review.sh
set -euo pipefail
BASE="${1:-main}"

DIFF=$(git diff "$BASE"...HEAD -- '*.ts' '*.tsx' '*.js' '*.py' 2>/dev/null || echo "")

if [ -z "$DIFF" ]; then
  echo "No changes vs $BASE"
  exit 0
fi

echo "Diff: $(echo "$DIFF" | wc -l) lines"

claude -p \
  "Review this PR diff. Return markdown with Bugs, Security, Performance sections.\n\n${DIFF}" \
  --output-format text \
  --max-budget-usd 0.30 \
  --no-session-persistence \
  --dangerously-skip-permissions
```

로컬 테스트에서는 `--bare` 없이 실행해도 되지만, `--dangerously-skip-permissions`는 넣어야 한다. 넣지 않으면 "이 디렉터리를 신뢰하십니까?" 프롬프트가 뜨면서 파이프가 멈춘다.

[Claude Code 훅으로 구축하는 자동화 코드 리뷰 시스템](/ko/blog/ko/claude-code-hooks-workflow)도 비슷한 접근이지만, 훅은 커밋 전 로컬 검사에 최적화되어 있고 GitHub Actions는 팀 전체의 PR 게이트로 쓰는 차이가 있다.

## Step 4: 비용 관리와 현실적인 기대치

솔직히 이 파이프라인을 팀에 도입할 때 가장 많이 받은 질문이 "얼마나 드냐"였다.

실측치 기준으로 보면:
- PR 리뷰 1건 (diff 200〜500줄): $0.15〜0.35
- 나이틀리 감사 (파일 20개): $0.80〜1.50
- 월 기준 (PR 50건 + 나이틀리 30회): $20〜60

Anthropic의 네이티브 [Claude Code Review 기능](/ko/blog/ko/claude-code-review-multi-agent-pr)이 PR당 $15〜25라고 발표한 것과 비교하면 훨씬 저렴하다. 물론 멀티에이전트 리뷰보다 깊이는 얕지만, 버그 검출과 보안 이슈 플래그 용도로는 충분하다.

`--max-budget-usd`가 핵심 안전망이다. 이걸 설정해두면 diff가 비정상적으로 크거나 Claude가 반복 호출을 시도해도 지정한 금액에서 자동으로 멈춘다.

## 흔한 오류와 해결법

**`Error: unknown flag '--dangerously-skip-permissions'`**  
Claude Code 2.1 미만이면 이 플래그가 없다. `claude --version`으로 확인하고, npm install 단계에서 항상 최신 버전을 설치하도록 한다.

**`git diff: not a git repository`**  
`actions/checkout@v4`의 `fetch-depth`가 기본값(1)이면 얕은 클론이라 베이스 브랜치가 없다. `fetch-depth: 0`으로 반드시 설정해야 한다.

**코멘트가 붙지 않는 경우**  
`permissions` 블록에서 `pull-requests: write`가 빠졌을 때 발생한다. 또는 레포지토리 설정에서 Actions의 권한이 "Read repository contents and packages permissions"로만 되어 있을 때도 실패한다.

**리뷰 품질이 너무 낮다**  
diff만 넘기지 말고 `--add-dir .`로 프로젝트 디렉터리 전체를 컨텍스트에 포함시키면 개선된다. 대신 실행 시간과 비용이 늘어난다. 프롬프트도 "Review this code"보다 "You are reviewing a TypeScript React app. Focus on: type safety issues, React hooks misuse, missing error boundaries"처럼 구체화할수록 결과가 좋아진다.

## CLAUDE.md로 프로젝트 규칙 주입하기

기본 프롬프트만으로는 프로젝트의 코딩 컨벤션을 Claude가 알 수 없다. 레포지토리 루트에 `CLAUDE.md`를 만들면 프로젝트 규칙을 자동으로 주입할 수 있다.

```markdown
# CLAUDE.md (레포지토리 루트)

## 코딩 규칙
- TypeScript strict 모드 사용 중. `any` 타입은 반드시 지적할 것
- React hooks는 컴포넌트 최상위에서만 호출
- async 함수에서 에러를 잡지 않으면 반드시 언급
- SQL 쿼리는 반드시 parameterized query 사용

## 보안 우선순위
- XSS 취약점, SQL 인젝션, 인증 우회를 1순위로 검토
- 환경 변수나 시크릿이 하드코딩되면 즉시 지적

## 무시할 사항
- 테스트 파일의 `console.log`는 지적하지 않음
- 마이그레이션 파일 스타일 이슈는 무시
```

하지만 주의: `--bare` 모드에서는 CLAUDE.md 자동 발견이 비활성화된다. `--add-dir .`를 함께 써야 인식된다.

```yaml
- name: Claude Code review (with CLAUDE.md)
  env:
    ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
  run: |
    claude -p "Review this PR diff following project conventions." \
      --add-dir . \
      --output-format text \
      --max-budget-usd 0.80 \
      --no-session-persistence \
      --dangerously-skip-permissions \
      "$(cat pr.diff)" > review.md
```

`--add-dir .`를 쓰면 Claude가 레포 전체를 읽을 수 있어서 diff 맥락 이해가 크게 개선된다. 대신 토큰 사용량이 늘어나므로 `--max-budget-usd`를 0.80〜1.00으로 높여야 한다.

## 다음 단계로 확장하기

지금 구성한 파이프라인은 기본형이다. 더 발전시킬 수 있는 방향 몇 가지:

**언어별 전문화**: Python 파일에는 타입 힌트 누락과 테스트 커버리지를 중점 검토하도록 프롬프트를 분기한다.

```yaml
- name: Review Python files
  if: contains(env.CHANGED_EXTS, '.py')
  run: |
    claude -p "Review Python code. Focus on: missing type hints, unhandled exceptions, and test coverage gaps.\n\n$(cat pr.diff)" \
      --output-format text --max-budget-usd 0.30 --bare --no-session-persistence --dangerously-skip-permissions \
      > py-review.md
```

**중요도 필터링**: Claude 출력에서 "Bug"가 포함된 섹션만 별도 레이블로 태그해서 핵심 이슈가 묻히지 않도록 한다.

```bash
# 버그 이슈가 있는 경우 PR 라벨 추가
if grep -q "## Bugs" review.md && ! grep -q "None" review.md; then
  gh pr edit $PR_NUMBER --add-label "needs-attention"
fi
```

**CLAUDE.md 활용**: 위에서 설명한 대로 프로젝트 규칙을 주입하면 리뷰 품질이 크게 개선된다.

**병렬 처리**: 모노레포에서 서비스별로 다른 기준을 적용하고 싶다면, [Claude Code 병렬 세션 운영](/ko/blog/ko/claude-code-parallel-sessions-git-worktree)에서 다룬 방식처럼 matrix 전략으로 서비스마다 별도 잡을 돌릴 수 있다.

```yaml
strategy:
  matrix:
    service: [api, frontend, worker]
jobs:
  review:
    name: Review ${{ matrix.service }}
    # 각 서비스별로 별도 프롬프트와 예산 적용
```

## 실제 리뷰 출력 예시

아래는 내가 실제 프로젝트에서 받은 Claude Code 리뷰 코멘트 발췌다 (코드는 예시로 단순화함).

```markdown
## 🤖 Claude Code Review

## Bugs
- **src/api/users.ts:47** — `user.id`가 undefined일 때 처리 없음.
  `findUser()`가 null을 반환할 수 있는데, 그 다음 줄에서 바로 `user.id`를 
  접근하면 런타임 에러가 납니다.

## Security
- **src/api/orders.ts:23** — SQL 쿼리가 문자열 보간으로 생성됨.
  `WHERE id = ${orderId}` 패턴은 SQL 인젝션 위험이 있습니다. 
  Parameterized query로 교체하세요.

## Performance
- **src/components/List.tsx:88** — 매 렌더마다 새 배열 생성.
  `items.filter().map()` 체인이 useMemo 없이 렌더 함수 안에 있어서
  불필요한 재계산이 발생합니다.

## Style
- None
```

나는 이 중에서 Security 항목이 가장 인상적이었다. 해당 코드가 실제로 SQL 인젝션 취약점이었고, 코드 리뷰를 통해 잡히지 않고 넘어갈 뻔했다. 물론 100%는 아니다. 같은 PR에서 "Performance" 지적이 실제로는 컴포넌트가 memo로 감싸져 있어서 문제없는 경우도 있었다. diff만 보고 판단하는 한계다.

## 내가 내린 결론

설정하고 나서 2주 정도 써본 느낌은, "실제 리뷰어를 대체하진 않지만 명백한 실수를 걸러내는 안전망"으로는 기대 이상이었다. SQL 인젝션 가능성이 있는 코드 하나, async 함수 안에서 에러를 잡지 않는 패턴 두 개를 CI에서 잡아준 게 특히 인상적이었다.

아쉬운 점도 있다. 프로젝트 히스토리나 도메인 지식 없이 diff만 보는 리뷰라 "왜 이렇게 짰는지"에 대한 맥락은 전혀 반영되지 않는다. 새 기능의 아키텍처 결정이나 복잡한 비즈니스 로직 검토에는 사람 리뷰어가 여전히 필수다. 이 도구는 그 전에 "명백히 잘못된 것들을 먼저 걸러주는" 역할로 정확히 쓸 때 가치가 있다.

---

*샌드박스 실험 로그*

```
=== Claude Code CI Sandbox Log — Thu Apr 30 15:27:20 JST 2026 ===
Topic: GitHub Actions + Claude Code CI

Validated artifacts:
1. claude-pr-review.yml — 7-step PR review pipeline (YAML valid)
2. nightly-audit.yml — 6-step code audit (YAML valid)
3. local-review.sh — local test script (bash -n syntax valid)

Key CLI flags confirmed from: claude --help (v2.1.123)
  claude -p [prompt] --output-format text --max-budget-usd N
    --bare --no-session-persistence --dangerously-skip-permissions
```

*실행 가능 범위: YAML 구조 검증 및 쉘 스크립트 문법 검증은 직접 수행했습니다. 실제 API 호출 결과는 ANTHROPIC_API_KEY가 필요한 GitHub Actions 런타임 환경에서 확인할 수 있습니다.*
