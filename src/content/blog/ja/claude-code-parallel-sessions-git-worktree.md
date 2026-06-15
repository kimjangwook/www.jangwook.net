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
  - slug: mcp-server-typescript-sdk-step-by-step-2026
    score: 0.9
    reason:
      ko: 튜토리얼 주제를 한 단계 더 깊이 파고드는 글입니다.
      en: Goes one level deeper into 튜토리얼.
      ja: 튜토리얼をもう一歩深く掘り下げた記事です。
      zh: 更深入地探讨 튜토리얼 主题。
  - slug: claude-code-masterclass-series-1-prompt-to-agent
    score: 0.85
    reason:
      ko: claudecode를 실제로 다뤄본 경험이 이어지는 글입니다.
      en: Continues the hands-on claudecode experience.
      ja: claudecodeを実際に扱った経験が続く記事です。
      zh: 延续 claudecode 的实战经验。
faq:
  - question: "同じブランチでClaude Codeセッションを複数動かしてはいけませんか?"
    answer: "同じブランチで2つのセッションを同時に動かすと、一方がファイルを変更した瞬間にもう一方のコンテキストが汚染されます。ファイル状態の不一致、予期しないマージコンフリクト、追跡不能といった問題が起きます。worktreeで各ブランチを独立ディレクトリに置けば、競合も汚染もなくなります。"
  - question: "worktree同士でnode_modulesやpackage.jsonは共有されますか?"
    answer: "共有されません。package.json、package-lock.json、node_modulesはオリジナルとworktreeで別々に管理されるため、各worktreeでnpm installを別途実行する必要がある場合があります。特に機能ブランチで新しいパッケージを追加したときです。"
  - question: "複数のworktreeで開発サーバーを同時に立ち上げるとどうなりますか?"
    answer: "ローカルデータベースを同じポートで使う開発サーバーを複数のworktreeで同時に立ち上げると、ポートが競合します。各worktreeの.env.localでポートを別々に設定するか、DBを共有しつつマイグレーションは一方からのみ実行してください。"
  - question: "worktree並列パターンは常に効果的ですか?"
    answer: "万能ではありません。タスクが互いに異なるファイルを触る場合に最も効果的で、同じコンポーネントを2つのセッションが両方修正するとむしろマージコンフリクトが増えます。セッションが3つを超えると進捗の追跡にオーバーヘッドが生まれるため、まず2つから始めるのがおすすめです。"
---

Claude Codeのタブを複数開いておくと「並列作業」をしているように感じる。でも実際はそうじゃない。

同じブランチで2つのClaude Codeセッションを同時に動かすと、一方のセッションがファイルを変更した瞬間に、もう一方のコンテキストが汚染される。ファイル状態の不一致、予期しないマージコンフリクト、どのセッションが何をしたのか追跡不能。これを実際に体験してからやっと、git worktreeを真剣に調べることにした。

結論から言うと、**git worktree + Claude Codeの組み合わせは思ったよりずっと自然に動く**。設定も複雑じゃない。この記事の内容はすべて一次情報で確認できる。Git公式ドキュメントの [git-worktree](https://git-scm.com/docs/git-worktree) ページ、Claude Code公式ドキュメントの [Run parallel sessions with worktrees](https://code.claude.com/docs/en/worktrees) 項目、そして日常作業のレシピをまとめた [Common workflows](https://code.claude.com/docs/en/common-workflows) ガイドだ。

## Git Worktreeとは何か

git worktreeは、1つのgitリポジトリで複数のブランチを同時に別々のディレクトリにチェックアウトできる機能だ。2016年からgitに標準搭載されているが、意外と知られていない。[公式ドキュメント](https://git-scm.com/docs/git-worktree)の表現をそのまま借りると、「同じリポジトリに紐づく複数の作業ツリーを管理する（Manage multiple working trees attached to the same repository）」機能だ。各作業ツリーは独自の `HEAD` とインデックスを持つ。

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

Claude Code Best PracticesとClaude Codeの基本活用法をすでに把握しているなら、このパターンはすぐに適用できる。

### `--worktree`フラグ: 一発で済ませる

上のように`git worktree add`でディレクトリを作り、`cd`で入って`claude`を起動する手動方式のほかに、Claude Codeはworktree作成とセッション開始を1コマンドにまとめる組み込みフラグを用意している。公式ドキュメント（[Worktrees](https://code.claude.com/docs/en/worktrees)）によると、`--worktree`（または`-w`）を渡すと、リポジトリルートの`.claude/worktrees/<名前>/`以下にworktreeを作り、`worktree-<名前>`ブランチでその中にClaudeを起動する。

```bash
# worktree作成 + セッション開始を1行で
claude --worktree feature-auth

# 別ターミナルで別名の2つ目の隔離セッション
claude --worktree bugfix-123

# 名前を省略するとbright-running-foxのような名前を自動生成
claude --worktree
```

デフォルトではリモートのデフォルトブランチ（`origin/HEAD`）から分岐するので、常にクリーンなツリーから始まる。一つ注意点がある。worktreeは新規チェックアウトなので、`.env`や`.env.local`のような追跡されないファイルは付いてこない。プロジェクトルートに`.worktreeinclude`ファイル（`.gitignore`構文）を置けば、それらを新しいworktreeごとに自動でコピーしてくれる。`.claude/worktrees/`は`.gitignore`に入れておくとよい。

セッションを終えるとき、変更がなければworktreeとブランチは自動で片付けられ、コミットや未保存の変更が残っていれば残すか削除するか尋ねられる。手動で作ったworktreeはこの自動クリーンアップの対象外なので、自分で`git worktree remove`で削除する。

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

Claude Code Hookで自動化されたレビューシステムを構成しておけば、worktree切り替え時にコンテキストを自動更新するhookも設定できる。

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

マルチエージェントPRレビューパターンと組み合わせると、各worktreeブランチから出たPRを自動でレビューできるので、チーム単位ではこの組み合わせが最も実用的だった。さらに公式ドキュメントは、サブエージェントをそれぞれのworktreeで隔離して動かす方法も案内している。カスタムサブエージェントのfrontmatterに`isolation: worktree`を加えると、エージェントごとに一時worktreeが作られ、変更なく終われば自動で削除される。[エージェントチームを組んだ経験があるなら](/ja/blog/ja/claude-agent-teams-guide)、この隔離オプションが並列作業の衝突をどれだけ減らすか、すぐに実感できるはずだ。

## いつ使い、いつ避けるか

このパターンを無条件にすすめはしない。実際に使ってみると、効果がはっきり出る場面と、むしろ損をする場面に分かれる。

**並列worktreeが有利なケース:**

- タスクが**互いに異なるファイル・ディレクトリ**を触るとき。OAuthは`src/auth/`、バグ修正は`src/routes/`のように領域が分かれていれば、マージコンフリクトはほぼ起きない。
- 長い作業の途中に**緊急ホットフィックス**が入るとき。stashやブランチ切り替えなしに別ターミナルですぐ直し、終わったら元の作業に戻る。
- 同じコードを**複数のアプローチで実験**したいとき。ディレクトリを2つ立てて、どちらが良いか比較する。
- サブエージェントやバックグラウンド作業を**隔離**して、メインのチェックアウトをクリーンに保ちたいとき。

**並列worktreeを避けたほうがいいケース:**

- 2つのタスクが**同じコンポーネントや同じファイル**を両方修正する必要があるとき。ここではworktreeは衝突を減らすどころか増やす。順番に処理するほうがいい。
- セッションが**3つを超えるとき**。どのセッションがどこまで進んだか追跡するオーバーヘッドが、節約した時間を食い始める。まず2つから。
- マイグレーションのように**共有状態（ローカルDBなど）の順序が重要な作業**のとき。同時に動かすとデータが壊れる。
- すぐ終わる小さな修正で、**隔離のセットアップ費用が作業そのものより大きい**場合。

判断基準を一行にすると、こうだ。タスクはファイルレベルで独立しているか? そうならworktreeは輝く。そうでないなら、無理に分けるな。[Claude Codeマスタークラス第1回](/ja/blog/ja/claude-code-masterclass-series-1-prompt-to-agent)で扱ったプロンプト分配の原則と合わせて読むと、どの作業をどう分割するかの感覚をつかみやすい。

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

## まず2つから、慣れたら増やす

正直、最初は「わざわざこんなことまでしなきゃいけないの?」と思っていた。でも一度使ってからは、並列開発が必要な場面で自然と手が動くようになった。

ポイントは単純だ: **独立したブランチ → 独立したディレクトリ → 独立したClaude Codeセッション**。この3つが噛み合えば、互いに邪魔せず同時進行できる。

最初は2つのworktreeから始めて、パターンに慣れてきたら3つに増やしてみることをすすめる。[エージェントチーム構成をより体系的にしたい場合は](/ja/blog/ja/claude-agent-teams-guide)、そちらが次のステップになる。
