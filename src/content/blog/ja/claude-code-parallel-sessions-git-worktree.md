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
      ko: '자동화, AI/ML, DevOps 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、DevOps分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, DevOps with comparable
        difficulty.
      zh: 在自动化、AI/ML、DevOps领域涵盖类似主题，难度相当。
  - slug: openclaw-opus-4-6-setup-guide
    score: 0.94
    reason:
      ko: '자동화, AI/ML, DevOps 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、DevOps分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, DevOps with comparable
        difficulty.
      zh: 在自动化、AI/ML、DevOps领域涵盖类似主题，难度相当。
  - slug: github-agentic-workflows-cicd-ai
    score: 0.93
    reason:
      ko: '다음 단계 학습으로 적합하며, 자동화, AI/ML, DevOps 주제에서 연결됩니다.'
      ja: 次のステップの学習に適しており、自動化、AI/ML、DevOpsのトピックで繋がります。
      en: >-
        Suitable as a next-step learning resource, connecting through
        automation, AI/ML, DevOps topics.
      zh: 适合作为下一步学习资源，通过自动化、AI/ML、DevOps主题进行连接。
  - slug: stripe-minions-autonomous-coding-agents-1300-prs
    score: 0.93
    reason:
      ko: '자동화, AI/ML, DevOps 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、DevOps分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, DevOps with comparable
        difficulty.
      zh: 在自动化、AI/ML、DevOps领域涵盖类似主题，难度相当。
  - slug: claude-code-cli-migration-guide
    score: 0.92
    reason:
      ko: '다음 단계 학습으로 적합하며, 자동화, AI/ML, DevOps 주제에서 연결됩니다.'
      ja: 次のステップの学習に適しており、自動化、AI/ML、DevOpsのトピックで繋がります。
      en: >-
        Suitable as a next-step learning resource, connecting through
        automation, AI/ML, DevOps topics.
      zh: 适合作为下一步学习资源，通过自动化、AI/ML、DevOps主题进行连接。
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
