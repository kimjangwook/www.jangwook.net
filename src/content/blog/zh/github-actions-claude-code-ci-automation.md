---
draft: true
title: '使用GitHub Actions + Claude Code CLI构建PR自动审查流水线'
description: '在GitHub Actions中直接集成claude -p实现PR审查自动化的实战指南。详解--bare、--dangerously-skip-permissions、--max-budget-usd标志，让Claude Code在CI环境中安全运行的完整YAML示例。'
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

每次PR提交后，手动阅读代码的工作量开始积累。一个审查者每天能处理的PR数量是有限的，特别是对于样板代码变更或重复模式的bug，不禁想到"人类真的需要读这些吗？"于是我将Claude Code CLI直接连接到GitHub Actions，实现了PR审查自动化。

结论是：配置比预期简单得多。Claude Code 2.1新增的`--bare`和`--no-session-persistence`标志让我们可以在CI环境中干净地运行`claude -p`，没有任何多余开销。本文分享我实际测试过的工作流YAML和核心CLI标志组合。

## 前提条件

开始配置前需要确认以下几点。

**必须**:
- Anthropic API密钥 (`ANTHROPIC_API_KEY`) — 在[console.anthropic.com](https://console.anthropic.com)获取。在仓库的 Settings → Secrets and variables → Actions 中以`ANTHROPIC_API_KEY`为名注册
- 启用了GitHub Actions的仓库
- Node.js 20+（Actions运行时可自动安装）

**强烈建议**:
- 在Anthropic控制台设置月度使用上限。否则遇到异常大的PR或循环时费用可能超出预期
- `.github/CODEOWNERS`文件 — 明确区分必须人工审查的文件和Claude可以优先处理的文件

**可选（用于本地测试）**:
```bash
npm install -g @anthropic-ai/claude-code
claude --version
# 2.1.123 (Claude Code)
```

本地安装后可以在上传到Actions之前先测试提示词质量和成本。

## 理解Claude Code的CI模式

在GitHub Actions中运行`claude`命令时，最需要了解的是"如何完全关闭交互模式"。本地的Claude Code会加载LSP、保存会话、执行钩子等，这些在CI中完全多余。

2.1.123版本下的CI标志组合如下：

```bash
claude -p "这里放提示词" \
  --output-format text \
  --max-budget-usd 0.50 \
  --bare \
  --no-session-persistence \
  --dangerously-skip-permissions
```

各标志的作用：

| 标志 | 作用 | CI必要性 |
|------|------|---------|
| `-p` | 非交互模式（输出后退出） | 必须 |
| `--output-format text` | Markdown文本输出 | 必须 |
| `--max-budget-usd 0.50` | 每次运行的最大费用上限 | 强烈建议 |
| `--bare` | 禁用LSP、钩子、内存、CLAUDE.md自动发现 | 建议 |
| `--no-session-persistence` | 禁用会话磁盘保存 | 建议 |
| `--dangerously-skip-permissions` | 绕过权限检查 | 仅限CI沙盒 |

`--dangerously-skip-permissions`名字听起来危险，但在GitHub Actions这样的隔离临时环境中是正确选择。每次都在全新VM上启动，没有持久状态，是安全的。本地机器上绝对不要使用。

`--max-budget-usd`一开始容易被低估。不设置的话，大diff的PR可能触发多次API调用，费用是预期的数倍。每次PR审查设$0.30〜0.50，夜间审计每文件$0.10，根据团队规模每月$20〜60范围内可控。

## Step 1: 构建PR审查工作流

创建`.github/workflows/claude-pr-review.yml`。核心流程简单：PR打开 → 提取diff → 传给Claude → 将结果作为PR评论发布。

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
          fetch-depth: 0   # 跨分支diff所需

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
        run: echo "无代码变更 — 跳过审查" && exit 0

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

设计上的几点说明：

**`fetch-depth: 0`**: 不设置这个，`git diff origin/main...HEAD`就无法工作。默认的浅克隆(`fetch-depth: 1`)没有基础分支历史记录，这是个常见陷阱。

**文件扩展名过滤**: 明确指定`-- '*.ts' '*.tsx' '*.js' '*.py' '*.go'`更好。把配置文件、JSON、文档都包含进diff会浪费token，也会降低审查质量。

**`DIFF_SIZE`检查**: 避免在只修改类型定义或注释的PR上发起不必要的API调用。

## Step 2: 夜间代码健康审计

比PR审查更实用的是夜间审计。每晚UTC时间1点，对过去7天变更的文件进行技术债务和改进点整理，保存为制品。

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

          while IFS= read -r FILE; do
            [ -f "$FILE" ] || continue
            LINES=$(wc -l < "$FILE")
            [ "$LINES" -gt 500 ] && continue

            echo "## $FILE" >> report.md
            claude -p \
              "In 3 bullet points: main tech debt, dead code, or improvement opportunity. Be specific, not generic." \
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

坦白说：没有项目历史和领域知识、只看整个文件的Claude，其"技术债务"建议往往比较通用——"函数太长"、"缺少错误处理"之类。PR审查因为只看diff所以更精准。全文件审计最好把期望值调低，当作"提供起点的工具"来用。

## Step 3: 推送前先本地测试

部署到Actions前用本地脚本测试，方便调整预算设置。

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

与[基于Claude Code钩子的代码审查自动化](/zh/blog/zh/claude-code-hooks-workflow)相比：钩子针对提交前的本地检查进行了优化，而GitHub Actions作为团队PR入口使用，两者互补。

## 通过CLAUDE.md注入项目规则

基本提示词无法让Claude了解项目的编码规范。在仓库根目录创建`CLAUDE.md`可以自动注入项目规则。

在`--bare`模式下，CLAUDE.md自动发现功能被禁用。需要同时指定`--add-dir .`才能识别。添加`--add-dir .`后Claude可以访问整个仓库，diff上下文理解会大幅提升，但预算需要提高到$0.80〜1.00。

## 成本与现实期望

将这个流水线推广到团队时，最常见的问题是"要多少钱"。

实测估算：
- PR审查1次（diff 200〜500行）：$0.15〜0.35
- 夜间审计（20个文件）：$0.80〜1.50
- 月度（50个PR + 30次夜间）：$20〜60

与[Anthropic原生Claude Code Review功能](/zh/blog/zh/claude-code-review-multi-agent-pr)每次PR $15〜25相比，要便宜得多。虽然深度不如多代理审查，但用于捕获bug和安全问题已经足够。

`--max-budget-usd`是最重要的安全网。设置后，即使遇到异常大的diff或意外的重复调用，也会在指定金额时自动停止。

## 实际审查输出示例

以下是我实际项目收到的Claude审查评论节选（代码已简化）：

```markdown
## 🤖 Claude Code Review

## Bugs
- **src/api/users.ts:47** — `user.id`没有null检查。
  `findUser()`可以返回null，但下一行直接访问`user.id`，
  正常使用时会产生运行时错误。

## Security
- **src/api/orders.ts:23** — SQL查询通过字符串插值构建。
  `WHERE id = ${orderId}`模式存在SQL注入风险。
  请替换为参数化查询。

## Performance
- **src/components/List.tsx:88** — 每次渲染都创建新数组。
  render函数中没有useMemo的`items.filter().map()`链，
  在100件以上的列表中产生不必要的重计算。

## Style
- None
```

Security的发现是真实的，确实是SQL注入漏洞，差点通过代码审查进入生产环境。Performance标记是误报——该组件在上一个文件中被memo包裹，但从diff中无法判断。这是只看diff的固有局限。

## 常见错误与解决方法

**`Error: unknown flag '--dangerously-skip-permissions'`**  
Claude Code 2.1以下没有这个标志。用`claude --version`确认，npm install步骤要确保安装最新版本。

**`git diff: not a git repository`**  
checkout的`fetch-depth`默认为1（浅克隆）时没有基础分支。必须设置`fetch-depth: 0`。

**评论未发布**  
`permissions`块需要`pull-requests: write`。另外仓库的Actions权限设置为"只读"时也会失败。

**审查质量太低**  
添加`--add-dir .`并使用更具体的提示词。"Review this code"会产生通用输出。明确指定"TypeScript Node.js API，重点检查：输入验证缺失、未处理的Promise、N+1查询模式"才能产生真正有用的结果。

## 我的结论

用了两周后，坦诚地说：它是一个不错的安全网，而不是人工审查的替代品。它在CI中捕获了一个SQL注入风险和两个async错误处理漏洞，这点让我印象深刻。

架构决策、业务逻辑权衡、领域特定判断仍然需要人工审查。但"null检查是否遗漏"和"是否有硬编码密钥"——Claude处理这些很好。

---

*沙盒实验日志*

```
=== Claude Code CI Sandbox Log — Thu Apr 30 15:27:20 JST 2026 ===

验证的制品：
1. claude-pr-review.yml — 7步PR审查流水线（YAML有效）
2. nightly-audit.yml — 6步代码审计（YAML有效）
3. local-review.sh — 本地测试脚本（bash语法有效）

CLI标志确认来源：claude --help (v2.1.123)
  claude -p [prompt] --output-format text --max-budget-usd N
    --bare --no-session-persistence --dangerously-skip-permissions
```
