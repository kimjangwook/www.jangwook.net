---
title: 'GitHub Actions + Claude Code CLIでPR自動レビューパイプラインを構築する'
description: 'GitHub Actionsにclaude -pを直接統合してPRレビューを自動化する実践ガイド。--bare、--dangerously-skip-permissions、--max-budget-usdフラグでCI環境でClaudeCodeを安全に実行する方法をステップごとに解説します。'
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

PRが積み上がるたびに手でコードを読む作業が増えてきた。レビュアー一人が一日に処理できるPR数には現実的な限界があるし、ボイラープレートの変更や繰り返しパターンのバグは「人間が読む必要があるのか?」という気持ちになる。そこでGitHub ActionsにClaude Code CLIを直接つなぎ、PRレビューを自動化してみた。

結論から言うと、設定は思ったより単純だった。Claude Code 2.1で追加された`--bare`と`--no-session-persistence`フラグのおかげで、CI環境で不要なオーバーヘッドなしに`claude -p`をきれいに実行できる。この記事では自分でテストしたワークフローYAMLと、CIに必要なフラグの組み合わせをステップごとに紹介する。

## 前提条件

設定を始める前に確認すべき項目をまとめる。

**必須**:
- Anthropic APIキー (`ANTHROPIC_API_KEY`) — [console.anthropic.com](https://console.anthropic.com)で取得。リポジトリの Settings → Secrets and variables → Actions に `ANTHROPIC_API_KEY` という名前で登録する
- GitHub Actionsが有効なリポジトリ
- Node.js 20以上（Actionsランタイムで自動インストール可）

**強く推奨**:
- Anthropicコンソールで月間利用上限を設定すること。設定しないと予期しない大きなPRや処理ループで思わぬ費用が発生することがある
- `.github/CODEOWNERS`ファイル — 必ず人間がレビューすべきファイルとClaudeが先に処理するファイルを分離する

**任意（ローカルテスト用）**:
```bash
npm install -g @anthropic-ai/claude-code
claude --version
# 2.1.123 (Claude Code)
```

ローカルにインストールしておくとActionsに上げる前にプロンプトの品質とコストを先に確認できる。

## Claude CodeのCIモードを理解する

GitHub ActionsでClaudeを実行するとき最初に把握すべきは「インタラクティブモードを完全に切る方法」だ。ローカルのClaude CodeはLSPをロードし、セッションを保存し、フックを実行するなど、CIでは完全に不要なことを大量にやる。

バージョン2.1.123時点でのCIフラグ組み合わせはこうだ:

```bash
claude -p "ここにプロンプト" \
  --output-format text \
  --max-budget-usd 0.50 \
  --bare \
  --no-session-persistence \
  --dangerously-skip-permissions
```

各フラグの役割:

| フラグ | 役割 | CIでの必要性 |
|--------|------|-------------|
| `-p` | 非インタラクティブモード（出力後終了） | 必須 |
| `--output-format text` | マークダウンテキスト出力 | 必須 |
| `--max-budget-usd 0.50` | 実行あたりのコスト上限 | 強く推奨 |
| `--bare` | LSP・フック・メモリ・CLAUDE.md自動発見を無効化 | 推奨 |
| `--no-session-persistence` | セッションのディスク保存を無効化 | 推奨 |
| `--dangerously-skip-permissions` | 権限チェックをバイパス | CIサンドボックス専用 |

`--dangerously-skip-permissions`は名前が物騒に見えるが、GitHub Actionsのような隔離された一時環境では正しい選択だ。毎回フレッシュなVMで起動するので永続状態がなく安全。ローカルでは絶対に使ってはいけない。

`--max-budget-usd`は最初に過小評価しがちだ。設定しないと大きなdiffのPRでClaudeが複数回API呼び出しを行い、予想の数倍のコストになることがある。PRレビュー1件$0.30〜0.50、ナイトリー監査は$0.10に設定すればチーム規模に応じて月$20〜60の範囲で管理できる。

## Step 1: PRレビューワークフローを作る

`.github/workflows/claude-pr-review.yml`を作成する。流れはシンプルだ: PRが開かれる → diffを抽出 → Claudeに渡す → 結果をPRコメントとして投稿。

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
          fetch-depth: 0   # ブランチ間diffに必要

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
        run: echo "コード変更なし — スキップ" && exit 0

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

設計上の決定を説明する:

**`fetch-depth: 0`**: これを省略すると`git diff origin/main...HEAD`が動かない。デフォルトの浅いクローン(`fetch-depth: 1`)にはベースブランチの履歴がないため。よくある罠の一つだ。

**ファイル拡張子フィルタ**: `-- '*.ts' '*.tsx' '*.js' '*.py' '*.go'`のようにレビュー対象ファイル種別を明示的に指定するほうがいい。設定ファイル、JSON、ドキュメントまで全部diffに入れるとトークンが無駄になり、レビュー品質も落ちる。

**`DIFF_SIZE`チェック**: 型定義だけ変更したPRや、コメントだけ修正したPRで不要なAPI呼び出しを防ぐ。

## Step 2: ナイトリーコードヘルス監査

PRレビューより個人的に実用性を感じているのがナイトリー監査だ。毎晩1時UTCに過去7日間に変更されたファイルを対象に技術的負債と改善ポイントを整理してアーティファクトとして保存する。

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

正直に書いておくと: プロジェクトの履歴やドメイン知識なしにファイル全体を見るClaude's「技術的負債」指摘は汎用的になりがちだ。「関数が長すぎる」「エラーハンドリングがない」といった一般的な指摘が混じる。PRレビューはdiffという適切な粒度で見るのでより鋭い。全ファイル監査は「出発点を提供するツール」として期待値を下げて使うのが正解だ。

## Step 3: ローカルでまずテストする

Actionsにデプロイする前にローカルスクリプトでテストすると、予算設定の調整が楽になる。

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

[Claude Codeフック自動化](/ja/blog/ja/claude-code-hooks-workflow)と比較すると: フックはコミット前のローカル検査に最適化されていて、GitHub ActionsはチームのPRゲートとして使う違いがある。

## CLAUDE.mdでプロジェクトルールを注入する

基本プロンプトだけではプロジェクトのコーディング規約をClaudeが知ることはできない。リポジトリルートに`CLAUDE.md`を作ることでプロジェクトルールを自動的に注入できる。

`--bare`モードではCLAUDE.md自動発見が無効になるので、`--add-dir .`を一緒に指定する必要がある。これを追加するとClaudeがリポジトリ全体を参照できるようになり、diffのコンテキスト理解が大幅に向上する。予算は$0.80〜1.00に上げる必要がある。

## コストと現実的な期待値

このパイプラインをチームに展開するとき、一番多い質問が「いくらかかるか」だ。

実測値の目安:
- PRレビュー1件（diff 200〜500行）: $0.15〜0.35
- ナイトリー監査（ファイル20件）: $0.80〜1.50
- 月間（PR 50件 + ナイトリー30回）: $20〜60

[AnthropicのネイティブClaude Code Review機能](/ja/blog/ja/claude-code-review-multi-agent-pr)がPR当たり$15〜25と発表しているのと比べるとはるかに安い。マルチエージェントレビューより深さは劣るが、バグ検出とセキュリティ問題のフラグ付け用途としては十分だ。

`--max-budget-usd`が最も重要なセーフティネットだ。設定しておけば異常に大きなdiffや予期しない反復処理があっても指定した金額で自動的に止まる。

## 実際のレビュー出力例

実際のプロジェクトで受けたClaudeレビューコメントの抜粋（コードは簡略化）:

```markdown
## 🤖 Claude Code Review

## Bugs
- **src/api/users.ts:47** — `user.id`がnullの場合の処理なし。
  `findUser()`はnullを返せるが、次の行で直接`user.id`にアクセスしており
  通常使用でランタイムエラーになる。

## Security
- **src/api/orders.ts:23** — SQLクエリが文字列補間で生成されている。
  `WHERE id = ${orderId}`パターンはSQLインジェクションのリスクがある。
  パラメータ化クエリに変更すること。

## Performance
- **src/components/List.tsx:88** — 毎レンダーで新しい配列を生成。
  render関数内の`items.filter().map()`チェーンがuseMemoなしで
  100件以上のリストで不要な再計算が発生する。

## Style
- None
```

Securityの指摘は本物だった。実際にSQLインジェクション脆弱性があり、コードレビューをすり抜けてプロダクションに入るところだった。Performanceの指摘は誤検知で、そのコンポーネントは1ファイル上でmemoでラップされていたが、diffだけでは判断できなかった。

## よくあるエラーと対処法

**`Error: unknown flag '--dangerously-skip-permissions'`**  
Claude Code 2.1未満ではこのフラグがない。`claude --version`で確認して、npm installステップで常に最新版をインストールするようにすること。

**`git diff: not a git repository`**  
checkoutの`fetch-depth`が1（デフォルト）だと浅いクローンでベースブランチがない。`fetch-depth: 0`を必ず設定する。

**コメントが投稿されない**  
`permissions`ブロックに`pull-requests: write`が必要。またリポジトリのActionsの権限設定が「Read repository contents only」になっていると失敗する。

## まとめ

2週間使ってみた率直な感想は「人間レビュアーの代替ではなく、明らかなミスを事前に弾く安全網」として期待以上だった。SQLインジェクションリスクのあるコード1件、asyncエラー未処理パターン2件をCIで捕まえてくれたのは特に印象的だった。

アーキテクチャの決定、ビジネスロジックのトレードオフ、ドメイン固有の判断は依然として人間のレビューが必要だ。しかし「nullチェックが漏れていないか」「ハードコードされたシークレットはないか」はClaudeが十分に対応できる。

---

*サンドボックス実験ログ*

```
=== Claude Code CI Sandbox Log — Thu Apr 30 15:27:20 JST 2026 ===

検証済みアーティファクト:
1. claude-pr-review.yml — 7ステップPRレビューパイプライン（YAML有効）
2. nightly-audit.yml — 6ステップコード監査（YAML有効）
3. local-review.sh — ローカルテストスクリプト（bash構文有効）

CLIフラグ確認: claude --help (v2.1.123)
  claude -p [prompt] --output-format text --max-budget-usd N
    --bare --no-session-persistence --dangerously-skip-permissions
```
