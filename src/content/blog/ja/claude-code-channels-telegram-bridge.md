---
title: Claude Code Channelsでテレグラムからコーディングを指示する — OpenClawユーザーから見た率直な比較
description: >-
  Claude
  CodeにChannels機能が追加されました。テレグラムからメッセージを送ると、ローカルターミナルのClaudeがコードを実行して返信してくれます。OpenClawのチャネル概念を取り入れつつも、セキュリティモデルを全く異なる設計にした点が興味深いです。
pubDate: '2026-03-21'
heroImage: ../../../assets/blog/claude-code-channels-telegram-bridge-hero.jpg
tags:
  - claude-code
  - ai-agents
  - automation
relatedPosts:
  - slug: llm-pm-workflow-automation
    score: 0.95
    reason:
      ko: '자동화, AI/ML, DevOps 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、DevOps分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, DevOps with comparable
        difficulty.
      zh: 在自动化、AI/ML、DevOps领域涵盖类似主题，难度相当。
  - slug: claude-agent-teams-guide
    score: 0.94
    reason:
      ko: '자동화, AI/ML, DevOps 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、DevOps分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, DevOps with comparable
        difficulty.
      zh: 在自动化、AI/ML、DevOps领域涵盖类似主题，难度相当。
  - slug: claude-code-cli-migration-guide
    score: 0.94
    reason:
      ko: '자동화, AI/ML, DevOps 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、DevOps分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, DevOps with comparable
        difficulty.
      zh: 在自动化、AI/ML、DevOps领域涵盖类似主题，难度相当。
  - slug: effiflow-automation-analysis-part3
    score: 0.94
    reason:
      ko: '자동화, AI/ML, DevOps 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、DevOps分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, DevOps with comparable
        difficulty.
      zh: 在自动化、AI/ML、DevOps领域涵盖类似主题，难度相当。
  - slug: jules-autocoding
    score: 0.94
    reason:
      ko: '자동화, AI/ML, DevOps 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、DevOps分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, DevOps with comparable
        difficulty.
      zh: 在自动化、AI/ML、DevOps领域涵盖类似主题，难度相当。
---

3月20日、Claude Code v2.1.80に`--channels`というフラグが追加されました。何だろうと思ったら、テレグラムやディスコードからメッセージを送ると、ローカルターミナルで動いているClaudeがそれを受け取ってコードを実行し、結果をメッセンジャーに返してくれる機能でした。

正直、最初に見たとき「これ、OpenClawがやっていたことでは？」と思いました。その通りです。コンセプトとしてはほぼ同じです。ただ、実際にセットアップして使ってみると、アプローチがかなり異なります。

---

## チャネルとは？

簡単に言うと、外部メッセージングプラットフォームとClaude Codeセッション間の**双方向ブリッジ**です。

```
テレグラムから「ビルドログを確認して」→
  → Claude Codeセッションがメッセージを受信 →
  → ローカルファイルシステムからログを読み取り →
  → 分析結果をテレグラムに返信
```

ポイントは**ローカル実行**という点です。クラウドサンドボックスではなく、自分のMacBookで動きます。git、ファイルシステム、MCPサーバーすべてにアクセス可能です。だから「CIが失敗した、原因を調べて」とテレグラムから送れば、実際にログを読んでコードを修正するところまでやってくれます。

実行も簡単です：

```bash
claude --channels plugin:telegram@claude-plugins-official
```

フラグを一つ付けるだけ。テレグラムのボットトークンを設定し、ペアリングコードで認証すればすぐに使えます。

---

## OpenClawから取り入れたもの、変えたもの

私は[OpenClawの高度な機能](/ja/blog/ja/openclaw-advanced-usage)をかなり長く使ってきました。クロン連携やマルチチャネル設定など、このブログでも何度か取り上げています。だからClaude Code Channelsを見る目がどうしても違ってきます。

**取り入れた核心コンセプト：**
- メッセージングプラットフォーム → AIエージェントへのメッセージインジェクション
- チャネルアダプターパターン（プラットフォームごとのメッセージ正規化）
- 双方向通信（リクエスト → 処理 → 返信）

**Claude独自の変更点：**

第一に、**MCPサーバーベースのアーキテクチャ**。OpenClawは独自のアダプターフレームワークを使いますが、Claude Codeはすでにエコシステムが存在するMCP標準の上にチャネルを構築しました。`claude/channel`ケイパビリティフラグを宣言するMCPサーバーが、そのままチャネルプラグインになります。既存のMCPインフラを再活用した形ですが、この判断はかなり賢明だと思います。新しいプロトコルを学ぶ必要がありませんから。

第二に、**セキュリティモデルが全く異なります**。これが最大の違いです。

OpenClawはWebhookベースのため、インバウンドポートを開ける必要がある場合があります。Claude Code Channelsは**アウトバウンドポーリングのみ使用**します。自分のマシンから外部への接続だけなので、インバウンドポートは開きません。さらにアローリストベースの送信者認証も備わっており、登録されたユーザーだけがメッセージを送れます。

私のように自宅のMac miniでエージェントを動かしている人には、この違いが実感できます。OpenClawを使っていたときはngrokやCloudflare Tunnelで外部アクセスを開けていましたが、そのプロセスが丸ごと不要になりました。

第三に、**セッション単位の動作**。OpenClawは独立デーモンとして常時起動していますが、Claude Code Channelsはセッションが開いているときだけ動作します。これはメリットでありデメリットでもありますが、後ほど詳しく触れます。

---

## ベータ版でぶつかった限界

「research preview」というラベルが付いているだけあり、実運用で引っかかる部分があります。

**対応プラットフォームが2つだけです。** テレグラムとディスコード。Slackがないのが一番大きいです。業務で使うにはSlack連携がほぼ必須ですが、現時点では方法がありません。OpenClawが50以上のプラットフォームをサポートしているのと比べると寂しい状況です。ただしMCPベースなのでカスタムチャネルを作ることは可能ですが、ベータ期間中は`--dangerously-load-development-channels`フラグが必要で、プロダクション向けとは言えません。

**セッションが閉じると終わりです。** 最も残念な部分です。テレグラムからメッセージを送っても、Claude Codeのセッションが落ちているとそのメッセージは失われます。キューイングがありません。launchdやsystemdでバックグラウンドプロセスを立てて対処できますが、「always-on」がデフォルトではなく自分で構成しなければならない点が不便です。

**パーミッションプロンプトがセッションを止めます。** Claude Codeは危険な操作（ファイル削除、git pushなど）を行う際にユーザー承認を求めます。問題は、テレグラムからリモートで作業を指示したのに、パーミッションプロンプトが出るとローカルターミナルで直接承認しなければならないことです。`--dangerously-skip-permissions`で回避できますが、名前に「dangerously」が付いているのには理由があります。

**Personal Maxプランのバグ。** 一部のユーザーから`--channels`フラグが無視される問題が報告されています。自動生成されたorgIdがEnterpriseアカウントとして誤認識されるバグとのことです。まだパッチされていないようです。

---

## 実際に何ができるのか

私は現在、このブログの[自動投稿パイプライン](/ja/blog/ja/effiflow-automation-analysis-part3)をClaude Code + launchdクロンで運用しています。ここにChannelsを接続すると面白くなるシナリオがいくつかあります。

**1. CI/CDアラート → 即座にデバッグ**

GitHub Actionsでビルドが失敗した際、Webhookでテレグラムに通知が届きます。今はそれを見てターミナルを開いて手動で確認していますが、Channelsがあればテレグラムから直接「ビルドログを見て原因を分析して」と送るだけです。Claudeがログを読み、関連コードを探し、修正案まで提案してくれます。

**2. モバイルからの軽量コーディングリクエスト**

外出中に「ブログ記事のビルドを回して」や「昨日のコミットをrevertして」をテレグラムから送ることができます。ノートパソコンを開く必要がありません。

**3. モニタリングイベントベースの自動対応**

クロンジョブが失敗するとエラーログをチャネルにフォワーディングし、Claudeが自動で原因を分析してテレグラムに報告するフロー。これはOpenClawでも似た構成を組んでいましたが、Claude Codeのファイルシステムアクセスが直接的なので、中間APIコールなしでログをそのまま読めるという点が異なります。

---

## OpenClaw vs Claude Code Channels、率直な選択基準

両方使った立場から言うと、これは「どちらが優れているか」の問題ではありません。

**OpenClawを維持すべき場合：**
- Slack、WhatsAppなどテレグラム/ディスコード以外のプラットフォームが必要なとき
- Claude以外のLLM（GPT、Geminiなど）を併用するとき
- 無料で運用したいとき（Claude Codeはサブスクリプションが必要）
- すでにOpenClawベースでパイプラインが構築されているとき

**Claude Code Channelsが適している場合：**
- ローカルファイルシステムへの直接アクセスが核心のとき
- セキュリティが重要でインバウンドポートを開けたくないとき
- すでにClaude Codeをメインで使っているとき
- セットアップの時間を最小限にしたいとき（フラグ一つで完了）

個人的には、両方を併用するつもりです。クロンベースの自動化は既存のOpenClawパイプラインを維持し、テレグラムベースの対話型コーディングリクエストはClaude Code Channelsに切り替えるのが現実的です。Claude Code CLIへの完全移行を検討している方は、[Claude Code CLIマイグレーションガイド](/ja/blog/ja/claude-code-cli-migration-guide)も参考になります。

---

## 今後の注目ポイント

Channelsがベータを卒業すれば、カスタムチャネルプラグインのエコシステムが鍵になります。MCPサーバー構造なので誰でもチャネルを作れますが、Anthropicがこれをどこまで開放するかが焦点です。現時点では公式プラグインのみ許可されており、カスタムには`dangerously-`フラグが必要な状態です。

Slackチャネルプラグインがリリースされる時期が、実質的な採用の分岐点になると見ています。個人開発者にはテレグラムで十分ですが、チーム単位で使うにはSlackは必須ですから。

そしてパーミッションモデルの改善も重要です。リモートから作業を指示しているのにローカルターミナルで承認しなければならないのはUXのボトルネックです。テレグラムのインラインボタンで承認/拒否を処理するような仕組みが出てくる可能性はありますが、セキュリティと利便性のバランスを取るのは簡単ではないでしょう。

---

## 参考資料

- [Claude Code Channels 公式ドキュメント](https://code.claude.com/docs/en/channels)
- [VentureBeat: Anthropic just shipped an OpenClaw killer called Claude Code Channels](https://venturebeat.com/orchestration/anthropic-just-shipped-an-openclaw-killer-called-claude-code-channels)
- [The Decoder: Anthropic turns Claude Code into an always-on AI agent](https://the-decoder.com/anthropic-turns-claude-code-into-an-always-on-ai-agent-with-new-channels-feature/)
- [OpenClaw 公式ドキュメント — Channels](https://docs.openclaw.ai/cli/channels)
