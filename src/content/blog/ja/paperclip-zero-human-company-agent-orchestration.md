---
title: Paperclip — AIエージェントを社員のように管理するオープンソースプラットフォームをインストールしてみた
description: >-
  AIエージェント1つを使いこなすのはできた。複数を会社のように運用するには？Paperclipを実際にインストールし、会社を作り、エージェントを雇ってみた体験と率直な評価。
pubDate: '2026-04-02'
heroImage: ../../../assets/blog/paperclip-zero-human-company-agent-orchestration-hero.png
tags:
  - ai-agents
  - open-source
  - orchestration
relatedPosts:
  - slug: anthropic-agent-skills-standard
    score: 0.95
    reason:
      ko: '자동화, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, architecture with comparable
        difficulty.
      zh: 在自动化、AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: claude-skills-implementation-guide
    score: 0.95
    reason:
      ko: '자동화, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, architecture with comparable
        difficulty.
      zh: 在自动化、AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: mcp-open-standard-linux-foundation-engineering-guide
    score: 0.95
    reason:
      ko: '자동화, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, architecture with comparable
        difficulty.
      zh: 在自动化、AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: claude-cowork-enterprise-productivity-platform
    score: 0.95
    reason:
      ko: '자동화, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, architecture with comparable
        difficulty.
      zh: 在自动化、AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: anthropic-agent-skills-practical-guide
    score: 0.94
    reason:
      ko: '자동화, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, architecture with comparable
        difficulty.
      zh: 在自动化、AI/ML、架构领域涵盖类似主题，难度相当。
---

Claude Codeのターミナルを20個同時に開いて作業したことがあるだろうか？自分はある。ブログ記事を4言語で書きながらリサーチエージェント、画像生成エージェント、翻訳エージェントをそれぞれ動かしていると、ある瞬間「今、誰が何をやっているんだっけ？」がわからなくなってくる。ターミナルのタブ名で区別するのには限界があるし、コストもバラバラなので月末にいくら使ったか計算するのが面倒だ。

[Paperclip](https://github.com/paperclipai/paperclip)はこの問題に正面から切り込んでいる。スローガンが挑発的で — "Open-source orchestration for zero-human companies." エージェントを社員として、エージェントのグループを会社として管理しようという発想だ。

実際にインストールして動かしてみた。

## インストール：思ったより簡単だった

```bash
git clone https://github.com/paperclipai/paperclip.git
cd paperclip
pnpm install
pnpm build
pnpm dev:once
```

Node 20以上、pnpm 9.xさえあれば大丈夫だ。ビルドに約30秒、実行すると内蔵のPostgreSQLが自動的に起動する。別途DBの設定が不要なのが良かった。`DATABASE_URL`を設定しなければローカルの組み込みPostgresが使われ、本番環境では外部のPostgresを接続できる。

`http://127.0.0.1:3100`にアクセスするとオンボーディングウィザードが表示される。

## オンボーディング：4ステップのウィザード

Company → Agent → Task → Launch。この順番だ。

会社名とミッションを入力し、エージェントを1つ作り、タスクを割り当てて、実行。自分の場合は「Jangwook Blog Automation」という会社を作り、「Writer」というClaude Codeエージェントを雇った。

エージェントアダプターの種類が豊富だ。Claude CodeとCodexが「Recommended」と表示されていて、折りたたむとGemini CLI、OpenCode、Pi、Cursor、Hermes Agent、OpenClaw Gatewayまで出てくる。"If it can receive a heartbeat, it's hired"というフレーズがREADMEにあるが、実際にさまざまなランタイムをサポートしているのを見ると、大げさではなさそうだ。

## ダッシュボード：Linearをかなり参考にしている印象

![Paperclipダッシュボード — エージェント、タスク、コスト、承認状況が一目でわかる](../../../assets/blog/paperclip-zero-human-company-agent-orchestration-hero.png)

最初にダッシュボードを見て思ったのは「これLinearじゃないか？」だった。ダークテーマ、サイドバーナビゲーション、イシュートラッカーの構造が見慣れている。悪い意味ではなく — 開発者がすぐに馴染めるということだ。

サイドバーの構成を見ると：
- <strong>WORK</strong>：Issues、Routines（Beta）、Goals
- <strong>PROJECTS</strong>：プロジェクト別のイシューグループ
- <strong>AGENTS</strong>：エージェント一覧＋リアルタイムステータス
- <strong>COMPANY</strong>：Org、Skills、Costs、Activity、Settings

タスクマネージャーのように見えるが、裏側に組織図、予算、ガバナンスが敷かれている。READMEで "It looks like a task manager — but under the hood it has org charts, budgets, governance" と書いてあるのが的確な説明だ。

## 実行してみると：リアルタイムストリーミングが印象的だった

タスクを作ってLaunchを押すと、WriterエージェントがすぐにClaude Codeを呼び出し始めた。サイドバーに「1 live」と表示され、イシューページでSTDOUTがリアルタイムでストリーミングされた。

![イシュー詳細ページ — Writerエージェントがリアルタイムで実行中。STDOUTストリーミングとPropertiesパネルが表示されている](../../../assets/blog/paperclip-zero-human-company-agent-orchestration-issue.png)

しかし自分の場合、実行が「failed」で終わった。原因は単純で — `_sandbox/`内で動かしていたため、Claude CodeのAPIキー設定がうまくいっていなかったようだ。これはPaperclipの問題ではなく、エージェントアダプターがローカルCLIを呼び出す構造なので環境設定が合っている必要がある。オンボーディング時に「Adapter environment check」というテストボタンがあるのだが、テストを通過しても実際の作業で失敗する可能性がある点は少し残念だ。

## Org Chart：エージェントが社員カードとして表示される

![Org Chart — WriterエージェントがCEOの肩書きで表示された組織図](../../../assets/blog/paperclip-zero-human-company-agent-orchestration-org.png)

エージェント1つが名前、肩書き、担当イシュー数とともにカードで表示される。エージェントを複数作れば階層構造を組むことができる。CEOエージェントがCTOエージェントにタスクを委任し、CTOがエンジニアエージェントにさらに委任するという形だ。

正直なところ、エージェント1つだけ使うならオーバーキルだ。これはPaperclip側も認めている部分で、READMEに "Not for single agents" と明記されている。3つ以上のエージェントを同時に管理するところから意味が出てくる。

## コスト管理：これは本当に必要だった機能

![Costsページ — 推論コスト、予算、財務状況を期間別に確認できる](../../../assets/blog/paperclip-zero-human-company-agent-orchestration-costs.png)

Costsページがかなり詳細だ。Inference Spend、Budget、Finance Net、Finance Eventsを期間別（Month to Date、Last 7 Days、Last 30 Daysなど）で確認でき、エージェントごとのトークン予算を設定できる。

自分がブログを書くとき一番気になるのが「今月エージェントのコストいくら使った？」なのだが、今はターミナルのログを1つずつ遡って計算している。これをダッシュボード1つで見せてくれるのは明確に価値がある。

## 自分の評価

<strong>良い点：</strong>

内蔵のPostgreSQLのおかげでインストールが簡単だ。`pnpm dev:once`の1行でサーバーが立ち上がる。UI完成度が高く、Linearに慣れている人ならラーニングカーブがほぼない。エージェントアダプターが豊富で、Claude CodeだけでなくCodex、Cursor、Gemini CLIまで一つ屋根の下で管理できる。Routines（Beta）機能で定期実行も可能だ。

<strong>惜しい点：</strong>

エージェント1つだけ使う人には使う理由がない。タスクマネージャーをもう1つ覚えなければならないが、エージェントが1〜2個ならターミナルで直接管理した方が速い。そして "zero-human company" というスローガンが実際の現実とは距離がある。自分が使ってみた経験では、エージェントが失敗すれば結局人がデバッグしなければならないし、タスクの定義も人がやらなければならない。「エージェントを管理するツール」であって「人を置き換えるツール」ではまだない。

もう一つ、Paperclip自体がエージェントフレームワークやプロンプトマネージャー<strong>ではない</strong>という点を理解する必要がある。エージェントを作ってくれるのではなく、すでにあるエージェントを組織化するツールだ。Claude Code、CodexのようなCLIエージェントがすでに動いていてこそ意味がある。

## 誰が使うべきか

- Claude Codeのターミナルを5つ以上同時に管理している人
- エージェントごとのコストを追跡し、予算を設定したい人
- 複数のエージェント（Claude＋Codex＋Cursorなど）を1つのプロジェクトに投入しているチーム

自分はまだ導入していない。自分のブログ自動化パイプラインがClaude Code1つで十分に回っているので、エージェント3つ以上を同時に動かすタイミングが来たら改めて検討するつもりだ。そのときはおそらくWriter、Researcher、SEO Optimizerをそれぞれエージェントとして登録し、Paperclipでオーケストレーションする構成になるだろう。

次にやってみたいこと：Routines機能で毎朝のトレンドリサーチを自動実行する設定を作ってみたい。その結果が出たら後続の記事として書くつもりだ。
