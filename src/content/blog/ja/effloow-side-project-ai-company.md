---
title: Effloow — AIエージェント14名が運営する会社をサイドプロジェクトで作った
description: >-
  Paperclip上にAIエージェント14名で構成されたコンテンツビジネスを構築。Laravel、Markdown、Git基盤でサイトが自動運営される仕組みとDay
  1からの経験を共有します。
pubDate: '2026-04-02'
heroImage: ../../../assets/blog/effloow-side-project-ai-company-hero.png
tags:
  - side-project
  - ai-agents
  - paperclip
relatedPosts:
  - slug: adding-chinese-support
    score: 0.95
    reason:
      ko: '자동화, 웹 개발, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、Web開発、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, web development, AI/ML,
        architecture with comparable difficulty.
      zh: 在自动化、Web开发、AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: ai-agent-notion-mcp-automation
    score: 0.95
    reason:
      ko: '자동화, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, architecture with comparable
        difficulty.
      zh: 在自动化、AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: llm-blog-automation
    score: 0.95
    reason:
      ko: '자동화, 웹 개발, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、Web開発、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, web development, AI/ML,
        architecture with comparable difficulty.
      zh: 在自动化、Web开发、AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: agent-effi-flow-pivot-omotenashi-bot
    score: 0.94
    reason:
      ko: '자동화, 웹 개발, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、Web開発、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, web development, AI/ML,
        architecture with comparable difficulty.
      zh: 在自动化、Web开发、AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: claude-code-plugins-complete-guide
    score: 0.94
    reason:
      ko: '자동화, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, architecture with comparable
        difficulty.
      zh: 在自动化、AI/ML、架构领域涵盖类似主题，难度相当。
---

前回の記事でPaperclipというAIエージェントオーケストレーションプラットフォームをインストールして動かしてみました。エージェントを採用し、イシューを割り当て、コードをコミットするところまで確認しましたが — そこで止めるのはもったいなかったのです。

なので、本当に会社を一つ作ってみました。

## Effloowとは何か

[Effloow](https://www.effloow.com)は「AIエージェントだけで運営されるコンテンツビジネス」を目指すサイドプロジェクトです。大げさに聞こえますが、実態はこうです：

- Laravelベースのウェブサイト一つ
- Paperclipで接続されたAIエージェント14個
- 各エージェントがMarkdownファイルをGitにプッシュするとサイトが自動でレンダリング

CMSはありません。管理者パネルもありません。エージェントたちが`.md`ファイルを作成してコミットすると、Laravelがそれを読み取ってHTMLとして表示します。それだけです。

![Effloowホームページ — コンテンツが自動的にレンダリングされる](../../../assets/blog/effloow-side-project-ai-company-home.png)

## なぜこれを作ったのか

Paperclipをインストールした後、「実際に何か作ってみないと感覚が掴めない」と思いました。エージェント一つをCLIで動かすのと、14個を組織として運営するのはまったく別の問題ですから。

そして気になっていました。<strong>会社はAIだけで回せるのか？</strong> 収益が0円でも構わないので、コンテンツが生産され、サイトが維持され、品質が管理される — そのループが人間なしで回るのかどうか。

## 組織構造：5つのチーム、14名のエージェント

Effloowのエージェントは5つのビジネスユニットに分かれています。

![Paperclipエージェント一覧 — CEOの下に14個のエージェントが階層構造で配置されている](../../../assets/blog/effloow-side-project-ai-company-agents.png)

<strong>Media Team</strong> — 運営ログ、週間まとめ、会社のニュースをブログに投稿します。Editor-in-Chiefが統括し、PublisherがDevOpsのようにデプロイを担当します。

<strong>Content Factory</strong> — SEOを狙った長文アーティクルを生産します。Trend Scoutがトピックを発掘し、Writerが初稿を書き、Lead Researcherが事実検証を行います。

<strong>Tool Forge</strong> — 無料のウェブツールを作ります。これまでに出来たのはtwMerge Playground — Tailwind CSSのクラス競合をデバッグするインタラクティブツールです。Builderエージェントが担当しています。

<strong>Experiment Lab</strong> — 収益化の実験を行います。AdSense、アフィリエイトリンクなどをA/Bテストするために作りましたが、まだ実験は0件です。

<strong>Web Dev</strong> — サイト自体を管理します。ルーティング、SEO、デプロイパイプライン、そしてGA4連携まで。

これをPaperclipダッシュボードで見るとこのような形です：

![Paperclipイシューボード — 12個のイシューが作成され処理された記録](../../../assets/blog/effloow-side-project-ai-company-issues.png)

## 技術スタックが面白い理由

Effloowのアーキテクチャで私が気に入っているのは、「Markdownがすなわちデータベース」という点です。

エージェントがアーティクルを書くときにやることはこれです：

```markdown
---
title: "How We Built a Company Powered by 14 AI Agents"
slug: "how-we-built-ai-company"
category: articles
tags: [ai, paperclip, orchestration]
---

本文の内容...
```

この`.md`ファイルをGitにコミットすれば終わりです。Laravelの`ContentController`がfrontmatterをパースしてリストを作り、本文をレンダリングします。Bladeテンプレートベースなので、インタラクティブツールも同じ構造で動作します — frontmatterに`blade: tools.twmerge-playground`キーを追加するだけでBladeビューにルーティングされます。

この構造が良いのは、エージェントの立場から「ファイル一つ作ればデプロイ完了」という点です。APIを呼び出す必要もなく、データベースマイグレーションもありません。Git pushがすなわちデプロイです。

## Live Dashboard：リアルタイムで会社の状態を見る

`/live`ページがあります。訪問者数、Lighthouseスコア、コンテンツ数をリアルタイムで表示します。

![Live Dashboard — GA4連携で訪問者、パフォーマンス、コンテンツ現況を一目で](../../../assets/blog/effloow-side-project-ai-company-live.png)

今は訪問者数が0です。当然です、昨日作ったばかりですから。GA4連携はWeb Dev Leadエージェントが実装し、Lighthouse測定は`proc_open()`でCLIを呼び出す方式です。これもエージェントが自分で書いたコードですが、shell injection防止のために配列引数方式を使っているのが目に留まりました。私が書いていたら文字列でざっくりやっていたでしょう。

## Day 1に実際に起きたこと

Paperclipでイシュー12個を作成し、エージェントに割り当てました。結果：

- <strong>EFF-1</strong>（コンテンツレンダリングシステム）：すでに私が作っておいたものをエージェントが確認し、イシューをクローズしました
- <strong>EFF-3</strong>（Bladeベースのツールシステム）：インタラクティブツールをMarkdownと同じ構造に統合するリファクタリング。`ContentService.list()`に`blade`キーを追加
- <strong>EFF-8</strong>（最初のアーティクル執筆）：Writerエージェントが「How We Built a Company Powered by 14 AI Agents」という記事を書きました
- <strong>EFF-11</strong>（AdSenseページ）：Contact、Privacy Policyページを生成
- <strong>EFF-12</strong>（Liveダッシュボードのデータ収集）：GA4 API連携、Lighthouse CLI連携

12個のイシューのうち10個が一日で処理されました。人間が介入したのはEFF-1（私がすでに実装していたもの）とEFF-3（私が先にコードを書いてしまったもの）くらいです。

## まだ足りないもの

これを「会社」と呼ぶには欠けているものが多いです。

<strong>収益が0円です。</strong> AdSenseの承認もまだで、トラフィックもありません。Experiment Labが収益化の実験を行うべきですが、まだ実験自体がありません。

<strong>コンテンツ品質の検証がありません。</strong> Writerが書いた記事を誰がレビューするのか？ Lead Researcherが事実確認をすることになっていますが、実際にはWriterが書いた初稿がほぼそのままパブリッシュされています。人間が一度は見るべきでしょう。

<strong>エージェント間の協業が限定的です。</strong> Paperclipのイシューシステムは「一人のエージェントが一つのイシューを処理する」構造です。二つのエージェントが一つのイシューについて議論したりコードレビューをやり取りしたりするのはまだできません。

私にとって一番不便なのは<strong>エージェントの自律性とコントロールのバランス</strong>です。イシューを細かく書きすぎると自分でコーディングしているのと変わらないし、抽象的すぎると見当違いの方向に進みます。「AdSense承認に必要なページを追加して」と指示したら、Contactページに私のメールアドレスを入れてPrivacy Policyを生成してくれました。合っていますが、内容がやや薄いです。

## このプロジェクトから学んだこと

一日動かしてみて感じたのは、AIエージェントで「会社」を作ることは技術的に可能ですが、<strong>管理コストがなくなるのではなく形が変わる</strong>ということです。

人を管理するときは1on1をしてコードレビューをします。エージェントを管理するときはイシューを精密に作成して成果物を検収します。後者の方が速いですが、「イシュー一つをうまく書くのに10分」が積み重なると結局同じくらいの時間がかかります。

ただし確かなのは、<strong>初期構築のスピードが圧倒的</strong>だということです。一日でサイト＋コンテンツ＋ツール＋GA4連携＋Liveダッシュボードが完成しました。一人でやったら一週間はかかったでしょう。

Effloowは引き続き運用するつもりです。次の目標はエージェントたちが自ら イシューを生成できるようにすること — Trend Scoutがトピックを見つけ、Boardがイシューを作り、Writerに自動でアサインされるループ。今は私がイシューを作らなければならないので、本当の「無人会社」とは距離があります。

コードはまだ公開していませんが、サイトは[effloow.com](https://www.effloow.com)で見ることができます。毎週Effloow Weeklyで進捗状況を記録する予定です。
