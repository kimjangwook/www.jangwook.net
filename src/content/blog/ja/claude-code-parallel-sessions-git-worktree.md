---
title: Claude Code 並列セッション運用ガイド — Git Worktreeで複数タスクを同時処理する実践的アプローチ
description: >-
  Git WorktreeとClaude Codeを組み合わせて複数機能を同時開発する方法。Plan
  Mode活用、セッション分離、競合なし並列作業パターンを実際に試した経験をもとに解説します。
pubDate: '2026-04-13'
heroImage: ../../../assets/blog/claude-code-parallel-sessions-git-worktree-hero.jpg
tags:
  - ClaudeCode
  - Git
  - 生産性
  - チュートリアル
  - AIコーディング
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

Claude Codeのタブを複数開いておくと「並列作業」をしているように感じる。でも実際はそうじゃない。

同じブランチで2つのClaude Codeセッションを同時に動かすと、一方のセッションがファイルを変更した瞬間に、もう一方のコンテキストが汚染される。ファイル状態の不一致、予期しないマージコンフリクト、どのセッションが何をしたのか追跡不能。これを実際に体験してからやっと、git worktreeを真剣に調べることにした。

結論から言うと、**git worktree + Claude Codeの組み合わせは思ったよりずっと自然に動く**。設定も複雑じゃない。

## Git Worktreeとは何か

git worktreeは、1つのgitリポジトリで複数のブランチを同時に別々のディレクトリにチェックアウトできる機能だ。2016年からgitに標準搭載されているが、意外と知られていない。

核心的な違いを一つだけ挙げると: ブランチを切り替える(`git checkout`)と作業ディレクトリ自体が変わる。worktreeを使うと、各ブランチが**それぞれ異なる物理ディレクトリ**に独立して存在する。

```bash
# 従来の方法: ブランチ切り替え時にファイルが入れ替わる
git checkout feature/new-login  # 現在のディレクトリのファイルがまるごと差し替わる

# worktreeの方法: ディレクトリ自体が分かれる
git worktree add ../project-feature feature/new-login  # 別ディレクトリに分離
```

Claude Codeにとってこれが重要な理由は: **各worktreeディレクトリで独立したClaude Codeセッションを実行できるから**だ。ファイルの競合なし、コンテキストの汚染なし。

## 実際のセットアップ方法

プロジェクトが`~/project/my-app`にあると仮定する。

```bash
# 1. メインの作業ディレクトリを確認
cd ~/project/my-app
git status  # mainブランチ、クリーンな状態

# 2. worktreeを追加 (ブランチ名 = 作業ディレクトリ名に揃えると便利)
git worktree add ../my-app-feature feature/add-oauth
git worktree add ../my-app-bugfix fix/login-redirect

# 3. 確認
git worktree list
```

結果:

```
/Users/jangwook/project/my-app         abc1234 [main]
/Users/jangwook/project/my-app-feature def5678 [feature/add-oauth]
/Users/jangwook/project/my-app-bugfix  ghi9012 [fix/login-redirect]
```

3つのディレクトリが**同じgitリポジトリを共有**しながら、それぞれ別のブランチをチェックアウトしている。`.git`フォルダはオリジナルにだけあり、残りは`.git`ファイル（リンク）を持つ。

## Claude Code 並列セッションを起動する

各ディレクトリで別々のターミナルを開き、Claude Codeを起動する。

```bash
# ターミナル1: メイン作業
cd ~/project/my-app
claude

# ターミナル2: OAuth機能開発
cd ~/project/my-app-feature
claude

# ターミナル3: ログインバグ修正
cd ~/project/my-app-bugfix
claude
```

各セッションは完全に独立している。ターミナル2で`src/auth/oauth.ts`を変更しても、ターミナル3のClaude Codeは関知しない。別のブランチのファイルだから。

[Claude Code Best PracticesとClaude Codeの基本活用法](/ja/blog/ja/claude-code-best-practices)をすでに把握しているなら、このパターンはすぐに適用できる。

## Plan Modeを活用した作業分配

並列セッションを効果的に使うには、**先に計画を立ててから分配する**必要がある。闇雲に複数セッションを開いても効率は上がらない。

私が使うパターン:

**第1段階: メインセッションでPlan Modeを使い全体計画を立てる**

メインディレクトリのClaude Codeセッションで、Plan Mode（`Shift+Tab`または`/plan`）をオンにして全体作業を分析する。

```
自分: 今スプリントで、OAuthログイン追加、ログインリダイレクトのバグ修正、
      APIドキュメントの更新が必要です。それぞれ独立したworktreeで
      並列進行したいのですが、どう分ければいいですか?

Claude: [各タスクのファイル依存関係を分析し、競合可能ポイントを特定]
```

**第2段階: 各worktreeに具体的なコンテキストを渡す**

Plan Modeの結果をもとに、各セッションに明確な指示を与える。曖昧な指示はClaude Codeが余計なファイルを触る余地を生む。

```bash
# my-app-featureセッションで
自分: feature/add-oauthブランチです。src/auth/ディレクトリだけに
      集中して、Google OAuthを追加してください。
      他のディレクトリはそのままで大丈夫です。
```

**第3段階: 完了後にメインで統合**

```bash
# 各ブランチの作業が終わったら
git merge feature/add-oauth
git merge fix/login-redirect
```

## 実例: 3つの作業を同時進行

最近実際に使ったケースだ。ブログプロジェクトで:

- `main`: 日常的なコンテンツ管理（デプロイ済み状態を維持）
- `feature/recommendation-v4`: コンテンツ推薦アルゴリズム改善
- `fix/og-image-path`: OG画像パスのバグ修正

worktreeなしでやっていたら、推薦アルゴリズム開発中にOG画像のバグが発生したとき、ブランチを切り替えるかstashを使う必要があった。worktreeを使えば、別のターミナルウィンドウに移動してすぐに修正できた。

[Claude Code Hookで自動化されたレビューシステムを構成しておけば](/ja/blog/ja/claude-code-hooks-workflow)、worktree切り替え時にコンテキストを自動更新するhookも設定できる。

## 注意点と実際の限界

### 共有リソースに注意

`package.json`、`package-lock.json`、`node_modules/`はオリジナルとworktreeで共有されない。各worktreeで`npm install`を別途実行する必要がある場合がある。特に機能ブランチで新しいパッケージを追加したとき。

### データベース接続の競合

ローカルデータベースを同じポートで使う開発サーバーを複数のworktreeで同時に立ち上げると、ポートが競合する。各worktreeの`.env.local`でポートを別々に設定するか、DBを共有しつつマイグレーションは一方からのみ実行する必要がある。

### worktreeの後片付け

作業が終わったらworktreeを削除しないと`.git/worktrees/`が肥大化する。

```bash
# ブランチをマージした後、worktreeを削除
git worktree remove ../my-app-feature

# 強制削除（変更が残っていても）
git worktree remove --force ../my-app-feature
```

### 正直な限界

このパターンは気に入っているが、万能ではない。タスクが互いに異なるファイルを触る場合に最も効果的で、同じコンポーネントを2つのセッションが両方修正する必要があるなら、むしろマージコンフリクトが増える。また、セッションが3つを超えると、どのセッションがどこまで進んだか追跡し始めてオーバーヘッドが生まれる。

[マルチエージェントPRレビューパターン](/ja/blog/ja/claude-code-review-multi-agent-pr)と組み合わせると、各worktreeブランチから出たPRを自動でレビューできるので、チーム単位ではこの組み合わせが最も実用的だった。

## コマンド早見表

```bash
# worktree作成
git worktree add <パス> <ブランチ名>
git worktree add <パス> -b <新規ブランチ名>  # 新しいブランチを作成しながら

# 一覧確認
git worktree list

# 削除
git worktree remove <パス>
git worktree prune  # すでに削除されたディレクトリの参照を整理
```

## まとめ

正直、最初は「わざわざこんなことまでしなきゃいけないの?」と思っていた。でも一度使ってからは、並列開発が必要な場面で自然と手が動くようになった。

ポイントは単純だ: **独立したブランチ → 独立したディレクトリ → 独立したClaude Codeセッション**。この3つが噛み合えば、互いに邪魔せず同時進行できる。

最初は2つのworktreeから始めて、パターンに慣れてきたら3つに増やしてみることをすすめる。[エージェントチーム構成をより体系的にしたい場合は](/ja/blog/ja/claude-agent-teams-guide)、そちらが次のステップになる。
