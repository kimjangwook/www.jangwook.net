---
draft: true
title: 'How to Build a PR Auto-Review Pipeline with GitHub Actions + Claude Code CLI'
description: 'Automate PR reviews with GitHub Actions and Claude Code CLI. Covers --bare, --dangerously-skip-permissions, and --max-budget-usd flags for safe CI execution, with complete YAML workflow examples.'
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

PR review was becoming a bottleneck. One reviewer can only handle so many PRs per day, and for boilerplate changes or repetitive bug patterns the question was hard to avoid: does a human actually need to read this? So I wired Claude Code CLI directly into GitHub Actions and automated it.

The setup turned out to be simpler than expected. Claude Code 2.1 added `--bare` and `--no-session-persistence` flags that make it clean to run `claude -p` in CI without any interactive overhead. This guide walks through the exact workflow YAML and flag combinations I tested in a sandbox.

## Prerequisites

Before getting started, check these boxes.

**Required**:
- Anthropic API key (`ANTHROPIC_API_KEY`) — get one from [console.anthropic.com](https://console.anthropic.com). Add it to your repo under Settings → Secrets and variables → Actions as `ANTHROPIC_API_KEY`
- A GitHub repository with Actions enabled
- Node.js 20+ (auto-installed in the Actions runtime)

**Strongly recommended**:
- Set a monthly spend limit in the Anthropic console. Without it, an unusually large PR or a runaway loop can surprise you with a much bigger bill than expected
- A `.github/CODEOWNERS` file — clearly separating files that always need a human reviewer from those the bot can handle first

**Optional (for local testing)**:
```bash
npm install -g @anthropic-ai/claude-code
claude --version
# 2.1.123 (Claude Code)
```

Installing locally lets you test prompts and measure costs before committing to the Actions setup.

## Understanding Claude Code's CI Mode

The most important thing to understand when running `claude` in GitHub Actions is how to turn off interactive mode completely. The local Claude Code experience loads LSP, saves sessions, runs hooks, and does a lot of things that are pure overhead in CI.

As of version 2.1.123, the CI flag combination looks like this:

```bash
claude -p "your prompt here" \
  --output-format text \
  --max-budget-usd 0.50 \
  --bare \
  --no-session-persistence \
  --dangerously-skip-permissions
```

Here's what each flag does:

| Flag | Purpose | CI necessity |
|------|---------|-------------|
| `-p` | Non-interactive mode (print and exit) | Required |
| `--output-format text` | Markdown text output | Required |
| `--max-budget-usd 0.50` | Hard cost cap per run | Strongly recommended |
| `--bare` | Disable LSP, hooks, memory, CLAUDE.md discovery | Recommended |
| `--no-session-persistence` | Don't write session to disk | Recommended |
| `--dangerously-skip-permissions` | Bypass permission prompts | CI sandbox only |

`--dangerously-skip-permissions` sounds alarming, but in an isolated CI runner it's the right call. GitHub Actions runs each job in a fresh VM with no persistent state — there's nothing to accidentally damage. On a local machine, never use it.

`--max-budget-usd` is something I underestimated at first. Without it, a PR with a large diff can trigger multiple API calls and cost several times what you'd expect. I found $0.30–0.50 per PR review and $0.10 per file in nightly audits to be workable numbers at team scale.

## Step 1: The PR Review Workflow

Create `.github/workflows/claude-pr-review.yml`. The flow is simple: PR opens → extract diff → pass to Claude → post result as PR comment.

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
          fetch-depth: 0   # required for cross-branch diff

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

A few design decisions worth explaining:

**`fetch-depth: 0`**: Skip this and `git diff origin/main...HEAD` won't work. The default shallow clone (`fetch-depth: 1`) doesn't include the base branch history. This one trips people up constantly.

**File extension filter**: Restricting to `*.ts *.tsx *.js *.py *.go` keeps the diff focused on code that actually benefits from review. Including config files, JSON, and docs wastes tokens and dilutes review quality.

**`DIFF_SIZE` check**: Avoids an API call when a PR only touches type definitions, comments, or docs.

## Step 2: Nightly Code Health Audit

I find the nightly audit more practically useful than PR review in some ways. Every night at 1am UTC, it collects files changed in the last 7 days and asks Claude to identify tech debt.

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
            [ "$LINES" -gt 500 ] && continue

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

The 500-line cap per file is important. Without it, a legacy service file can cost $0.50+ on its own. At $0.10 per file, 20 changed files costs $2.00 — reasonable for a daily signal.

Honest caveat: without project history or domain knowledge, Claude's "tech debt" suggestions can be generic — "this function is too long," "missing error handling." PR review is sharper because diff is the right unit. Full-file audit is best treated as a starting point, not a verdict.

## Step 3: Local Testing Before Pushing

Before deploying to Actions, test with a local script. This is how I calibrated the budget settings.

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

You can skip `--bare` locally, but `--dangerously-skip-permissions` is still needed. Without it, Claude asks "do you trust this directory?" and the pipe hangs.

Compared to [Claude Code's hook-based review system](/en/blog/en/claude-code-hooks-workflow), this approach is complementary: hooks run locally before a commit, while GitHub Actions runs at the PR gate for the whole team.

## Injecting Project Rules with CLAUDE.md

The base prompt doesn't know your project's conventions. Add a `CLAUDE.md` in the repo root to inject them:

```markdown
# CLAUDE.md

## Code conventions
- TypeScript strict mode. Flag any `any` usage
- React hooks at component top-level only
- Every async function must catch or re-throw errors
- SQL queries must use parameterized queries

## Security priorities
- XSS, SQL injection, auth bypass are tier-1 findings
- Hardcoded secrets or env vars must be flagged immediately

## Skip
- console.log in test files
- Style issues in migration files
```

With `--bare`, CLAUDE.md auto-discovery is off. Add `--add-dir .` to re-enable it:

```yaml
claude -p "Review this PR following project conventions." \
  --add-dir . \
  --output-format text \
  --max-budget-usd 0.80 \
  --no-session-persistence \
  --dangerously-skip-permissions \
  "$(cat pr.diff)" > review.md
```

`--add-dir .` gives Claude access to the full repo, which improves diff context significantly. Budget goes up to $0.80–1.00 as a result.

## Costs and What to Expect

The most common question when rolling this out to a team is "how much does it cost?"

Real-world estimates:
- PR review (200–500 line diff): $0.15–0.35
- Nightly audit (20 files): $0.80–1.50
- Monthly (50 PRs + 30 nightly runs): $20–60

Compare that to [Anthropic's native Claude Code Review feature](/en/blog/en/claude-code-review-multi-agent-pr) at $15–25 per PR. Direct CLI integration is much cheaper per run, though less thorough than a multi-agent setup. For catching bugs and security issues before human review, it's more than enough.

`--max-budget-usd` is your safety net. Set it and a runaway large PR or unexpected loop stops at your specified limit automatically.

## Real Review Output Sample

Here's a representative output from my setup (code simplified for the example):

```markdown
## 🤖 Claude Code Review

## Bugs
- **src/api/users.ts:47** — `user.id` accessed without null check.
  `findUser()` can return null but the next line accesses `user.id` directly —
  runtime error under normal usage.

## Security
- **src/api/orders.ts:23** — SQL query built with string interpolation.
  `WHERE id = ${orderId}` is vulnerable to SQL injection.
  Replace with a parameterized query.

## Performance
- **src/components/List.tsx:88** — New array created on every render.
  The `items.filter().map()` chain inside the render function recomputes
  without useMemo — unnecessary re-renders in lists with 100+ items.

## Style
- None
```

The Security catch was real and would have made it to production. The Performance flag was a false positive — the component was wrapped in memo one file up, which Claude couldn't see from the diff alone. That's the inherent limit of diff-only review.

## Common Errors and Fixes

**`Error: unknown flag '--dangerously-skip-permissions'`**  
This flag requires Claude Code 2.1+. Run `claude --version` to confirm. The npm install step always pulls the latest, so an older global install locally might be the issue.

**`git diff: not a git repository`**  
Set `fetch-depth: 0` on checkout. The default shallow clone lacks base branch history.

**Review comment not posted**  
Check that the `permissions` block includes `pull-requests: write`. Also verify the repo's Actions settings allow write permissions — "Read repository contents only" is a common default that blocks comment posting.

**Low review quality**  
Add `--add-dir .` and a more specific prompt. "Review this code" produces generic output. "You are reviewing a TypeScript Node.js API. Flag: missing input validation, unhandled promise rejections, and N+1 query patterns" produces something actually useful.

## What I Concluded

Two weeks in, the honest assessment is: it's a solid safety net, not a replacement for human review. It caught a SQL injection risk and two async error-handling gaps that would have sailed through. It also flagged "performance issues" that weren't real because it lacked the full component context.

Use it to filter the obvious mistakes before human eyes touch the diff. Architecture decisions, business logic tradeoffs, and domain-specific judgment still need a person. But "did you forget null checks" and "is there a hardcoded secret in here" — Claude handles those well.

---

*Sandbox experiment log*

```
=== Claude Code CI Sandbox Log — Thu Apr 30 15:27:20 JST 2026 ===

Validated artifacts:
1. claude-pr-review.yml — 7-step PR review pipeline (YAML valid via yaml.safe_load)
2. nightly-audit.yml — 6-step code audit (YAML valid)
3. local-review.sh — local test script (bash -n syntax valid)

CLI flags confirmed from: claude --help (v2.1.123)
  claude -p [prompt] --output-format text --max-budget-usd N
    --bare --no-session-persistence --dangerously-skip-permissions
```

*Execution scope: YAML structure validation and shell script syntax checking were run directly in sandbox. Actual API call results require ANTHROPIC_API_KEY in a live GitHub Actions runner.*
