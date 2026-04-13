---
title: 'Stripe Minions — Slackの絵文字ひとつで週1,300件のPRを生み出すコーディングエージェント'
description: >-
  Stripeが自律コーディングエージェントMinionsで週1,300件以上のPRを生産する方法。Blueprintアーキテクチャ、サンドボックスVM、3段階フィードバックループの実際のエンジニアリングを分析する。
pubDate: '2026-04-03'
heroImage: ../../../assets/blog/stripe-minions-autonomous-coding-agents-1300-prs-hero.jpg
tags:
  - ai-agent
  - stripe
  - autonomous-coding
  - mcp
  - ci-cd
  - engineering
relatedPosts:
  - slug: mcp-servers-toolkit-introduction
    score: 0.94
    reason:
      ko: '자동화, AI/ML, DevOps, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、DevOps、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, DevOps, architecture with
        comparable difficulty.
      zh: 在自动化、AI/ML、DevOps、架构领域涵盖类似主题，难度相当。
  - slug: claude-agent-teams-guide
    score: 0.93
    reason:
      ko: '다음 단계 학습으로 적합하며, 자동화, AI/ML, DevOps, 아키텍처 주제에서 연결됩니다.'
      ja: 次のステップの学習に適しており、自動化、AI/ML、DevOps、アーキテクチャのトピックで繋がります。
      en: >-
        Suitable as a next-step learning resource, connecting through
        automation, AI/ML, DevOps, architecture topics.
      zh: 适合作为下一步学习资源，通过自动化、AI/ML、DevOps、架构主题进行连接。
  - slug: claude-code-insights-usage-analysis
    score: 0.93
    reason:
      ko: '자동화, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, architecture with comparable
        difficulty.
      zh: 在自动化、AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: effiflow-automation-analysis-part3
    score: 0.93
    reason:
      ko: '다음 단계 학습으로 적합하며, 자동화, AI/ML, DevOps, 아키텍처 주제에서 연결됩니다.'
      ja: 次のステップの学習に適しており、自動化、AI/ML、DevOps、アーキテクチャのトピックで繋がります。
      en: >-
        Suitable as a next-step learning resource, connecting through
        automation, AI/ML, DevOps, architecture topics.
      zh: 适合作为下一步学习资源，通过自动化、AI/ML、DevOps、架构主题进行连接。
  - slug: openclaw-opus-4-6-setup-guide
    score: 0.93
    reason:
      ko: '자동화, AI/ML, DevOps 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、DevOps分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, DevOps with comparable
        difficulty.
      zh: 在自动化、AI/ML、DevOps领域涵盖类似主题，难度相当。
---

Slackでバグレポートに絵文字をひとつ付けると、10秒後にサンドボックスVMが立ち上がり、コードを修正し、テストを実行し、PRを作成する。人間はレビューするだけ。Stripeが今年2月に公開した社内システム「Minions」の動作方式だ。

週1,300件以上のPR。すべて人間が一行も書いていないコード。年間1兆ドル以上の決済を処理する企業で。

最初にこの数字を見たとき、正直半信半疑だった。1,300という数字そのものより、「決済インフラで自律エージェントがプロダクションコードを書く」という部分が簡単には信じられなかった。だからStripeのエンジニアリングブログと関連資料をかなり深く掘り下げてみた。

## Minionsとは何か

一言でまとめると、SlackメッセージやバグチケットからスタートしてPRマージまで、人間がコードを書かない自律コーディングエージェントだ。

核心コンセプトは**Blueprint**というオーケストレーションパターンで、決定論的コードノードとLLMエージェントループを交互に実行する構造だ。gitチェックアウトやlintのような処理は固定スクリプトが担当し、「このバグをどう直すか」はLLMが判断する。Stripeはこれを「contained boxes」と表現している — LLMを制御されたボックスに入れることで、システム全体の信頼性が複利的に向上するという哲学だ。

エージェントのベースはBlock（旧Square）のオープンソースコーディングエージェントGooseをフォークしたものだ。これにStripe社内ツールとコンテキストを[MCP（Model Context Protocol）](/ja/blog/ja/mcp-server-build-practical-guide-2026)で接続した。社内のToolshedサーバーには400以上のMCPツールがあるという。

## サンドボックス：制約こそが自由

すべてのMinionは隔離されたVMで実行される。人間のエンジニアが使うのと同じ開発環境だが、コードとサービスが事前にロードされていて10秒で起動する。

重要なのは、このVMに**インターネットアクセスもプロダクションアクセスもない**という点だ。完全なサンドボックス。この制約のおかげで逆説的にパーミッションチェックが不要になり、並列化が無制限に可能になる。セキュリティの観点でもクリーンだ — [エージェントが外部に何かを漏洩する経路そのものが存在しない](/ja/blog/ja/mcp-gateway-agent-traffic-control)。

私はこの設計判断がMinionsで最も賢い部分だと思う。多くのAIエージェントプロジェクトが「エージェントにもっと権限を」という方向に向かっているのに対し、Stripeは正反対に進んだ。権限を極度に制限しつつ、制限された範囲内での自律性を最大化したのだ。

## 3段階フィードバックループ

コードを書いた後の品質検証プロセスも体系的だ。

**Tier 1 — ローカルlint（5秒未満）**：タイポやフォーマットエラーを即座にキャッチ。エージェントがすぐに修正する。

**Tier 2 — 選択的CI**：Stripeにはテストが300万件以上ある。全部実行すると時間がかかりすぎるので、変更されたファイルに関連するテストだけを選んで実行する。autofixが可能な失敗は自動適用。

**Tier 3 — リトライ上限**：CIが失敗するとエラーをエージェントに返して修正させる。ただし**最大2回**まで。「LLMが何ラウンドも回しても収穫逓減が激しい」というのがStripeチームの判断だ。

この2回制限はかなり現実的なエンジニアリング判断だと感じた。無限リトライはコストだけでなく、実際に2回で直せなければ3回目でも直せない確率が高い。それなら人間に渡す方が正しい。

## 実際に何をしているのか

Minionsが処理するタスクは想像以上に多様だ：

- Slackに上がったバグレポートを受けてコードを修正しPRを生成
- 機能リクエストを基に新しいコードを作成
- flakyテストを検知すると自動でチケットを作成し「minion-fix」ボタンを設置
- 社内ドキュメント、フィーチャーフラグ、コードインテリジェンス（Sourcegraph）などからコンテキストを取得

エントリーポイントも複数ある。Slackが主要インターフェースで、CLI、Web UI、社内プラットフォームのボタンなど。「One-shot」哲学に従い、一度の指示でタスクを最後まで完了するよう設計されている。反復的な対話型修正ではなく、成果物を一度に提出し、必要なら人間がその上で修正する方式だ。

## 本当にこれでうまくいくのか？

正直、いくつか気になる点がある。

第一に、1,300件のPRの**性質**だ。すべてが意味のある機能変更なのか、それともlint修正や依存関係アップデートのような機械的作業がかなりの割合を占めるのか。Stripeのブログはこの比率を具体的に明かしていない。もし80%がタイプ修正やimport整理なら、印象的ではあるが文脈が少し変わってくる。

第二に、**レビュー負荷**だ。週に1,300件のPRが上がってくるということは、レビュアーにとっても1,300件を見なければならないということだ。AIが書いたコードのレビューは人間が書いたコードとは異なる — エージェントはコンベンションをよく守るが「なぜそうしたのか」の意図が不透明な場合がある。Stripe規模のエンジニアリング組織だから対応可能だろうが、これを50人のスタートアップが真似したらレビューボトルネックが新たな問題になりうる。

第三に、Ruby + SorbetというStripeの技術スタック特殊性。数億行のコードベース、強型付けRuby、自社ライブラリが多い環境でエージェントがうまく動くのは、その環境に合わせてMCPツールとルールを精緻に作り込んだからだ。これが汎用的に移植可能なパターンなのか、Stripe級のインフラ投資が前提なのかは別の問題だ。

## 持ち帰れるもの

Stripe規模でなくても学べる点はある。

**「壁がモデルより重要」** — StripeエンジニアSteve Kaliskiの言葉だが、私も同意する。エージェントの性能を決めるのはLLMの能力ではなく、エージェントを取り巻く制約とツールの品質だ。良いサンドボックス、よくできたMCPツール、明確なBlueprintがあればモデルは交換可能だ。

Blueprintパターン — 決定論的ノードとエージェントループの交替 — も小規模で適用する価値がある。私たちのチームで[Claude Code](/ja/blog/ja/claude-code-parallel-sessions-git-worktree)で自動化を作るときも似た構造を使っているが、「固定されたステップ」と「LLMが判断するステップ」を明確に分離するとデバッグがはるかに楽になる。

300万件のテストから関連するものだけ選別して実行するselective CIも良いアイデアだ。エージェントだけでなく通常の開発プロセスにも導入する価値のあるアプローチなので、これは別途調べてみるつもりだ。

---

Stripe Minionsが「すべての企業が真似できるテンプレート」かどうかはまだわからない。400のMCPツール、数億行のコードベース専用ルール、10秒で立ち上がるサンドボックスVM — これは何年もの開発インフラ投資の上に乗った結果物だ。

しかし核心のアイデア — エージェントの権限を減らし環境を制御すれば、むしろ信頼性が上がる — は規模を問わず有効だ。そしてこの方向が正しいなら、これから重要になるのは「もっと賢いモデル」ではなく「もっとよくできた壁」だ。
