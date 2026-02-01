---
title: 'OpenClaw 完全ガイド — 自分だけのAIアシスタントを作ろう'
description: 'オープンソースAIアシスタントプラットフォーム OpenClaw の主要機能とアーキテクチャを紹介。マルチチャネル、マルチモデル、ノードシステムまで完全ガイド。'
pubDate: '2026-02-03'
heroImage: ../../../assets/blog/openclaw-introduction-guide-hero.png
tags:
  - openclaw
  - ai-assistant
  - open-source
  - automation
relatedPosts: []
---

> 📚 **シリーズ：OpenClaw 完全攻略**
> - **第1回：紹介編（この記事）** — OpenClawとは？なぜ特別なのか？
> - [第2回：チュートリアル編](/ja/blog/ja/openclaw-installation-tutorial/) — インストールから最初の会話まで
> - [第3回：実践活用編](/ja/blog/ja/openclaw-practical-usage/) — スキル、自動化、上級ワークフロー

---

## 🤖 AIアシスタント時代、なぜOpenClawなのか？

ChatGPT、Claude、Gemini… 最近AIチャットボットを使ったことがない人はいないでしょう。でも、こんなことを考えたことはありませんか？

> 「このAIを**自分のTelegram**でそのまま使えないかな？」  
> 「**スマホのカメラ**をAIが制御できたら？」  
> 「データが他人のサーバーに溜まるのはちょっと気になる…」  
> 「複数のAIモデルを自由に切り替えて使えないかな？」

まさにこうした悩みを解決するために生まれたプロジェクトがあります。**OpenClaw** 🦞 です。

今回はOpenClawとは何か、何が特別なのか、そしてどんな人にぴったりのツールなのかを徹底的に紹介します！

---

## 🦞 OpenClawとは？

**OpenClaw**はオープンソースの**パーソナルAIアシスタントプラットフォーム**です。

簡単に言えば、皆さんが毎日使っているメッセンジャー（Telegram、WhatsApp、Discordなど）に**自分だけのAIアシスタントを接続できるシステム**です。AIモデルを自分で選んで接続し、さまざまなツールやスキルを追加して独自のワークフローを構築できます。

| 項目 | 内容 |
|---|---|
| **ライセンス** | MIT（完全に自由に使用可能） |
| **GitHub** | [github.com/openclaw/openclaw](https://github.com/openclaw/openclaw) |
| **公式ドキュメント** | [docs.openclaw.ai](https://docs.openclaw.ai) |
| **制作者** | Peter Steinberger([@steipete](https://twitter.com/steipete))、Mario Zechner(Pi制作者) |
| **スキルマーケット** | [ClawHub](https://clawhub.com) |
| **コミュニティ** | Discord — [discord.gg/clawd](https://discord.gg/clawd) |

MITライセンスなので、個人でも企業でも自由に使用・修正できます。コミュニティも活発に運営されているので、気になることがあればDiscordに参加してみてください！ 💬

### GitHubリポジトリを見てみよう

以下はOpenClawのGitHubリポジトリのメインページです。READMEでプロジェクトの全体構造とクイックスタートガイドを確認できます。

![OpenClaw GitHubリポジトリ — READMEとプロジェクト構造が一目で分かります](../../../assets/blog/github-readme.png)

---

## ✨ 主な特徴

### 📱 マルチチャネル — どこからでもAIと会話

OpenClawの最大の魅力の一つは**チャネルの多様性**です。

- **WhatsApp** — Baileysを通じたWhatsApp Webプロトコル連携
- **Telegram** — grammYベースのBot API（DM + グループ）
- **Discord** — discord.jsベースのBot API（DM + サーバーチャネル）
- **iMessage** — macOSのimsg CLI統合
- **Mattermost** — プラグインによるBot連携
- **Slack、Signal、MS Teams** — 追加プラグイン
- **WebChat** — ブラウザから直接アクセスするローカルチャットUI

別途アプリをインストールする必要なく、**すでに使っているメッセンジャーですぐに**AIアシスタントを利用できます。Telegramでメッセージを送るようにAIに話しかけるだけでOKです。

### 💻 マルチプラットフォーム

- **macOS** — ネイティブアプリ + メニューバーコンパニオン
- **iOS** — ノードアプリでペアリング + Canvasサーフェス
- **Android** — ノードアプリでCanvas + Chat + Camera
- **Windows** — ネイティブサポート（WSL2も対応）
- **Linux** — ネイティブ + サーバーデプロイ

事実上すべての主要プラットフォームをサポートしています。

### 🏗️ Gatewayアーキテクチャ

OpenClawの心臓部は**Gateway**です。単一のコントロールプレーンとして動作し、`ws://127.0.0.1:18789`を通じてすべてのチャネルとツールを一つに接続します。

Gatewayの主な役割：
- **チャネル接続管理** — すべてのメッセンジャーチャネルのWebSocket接続を管理
- **エージェントブリッジ** — Piコーディングエージェントとのみ RPC通信
- **ツールルーティング** — ブラウザ、ファイルシステム、cronなどのツール呼び出しを中継
- **セッション管理** — DMは共有`main`セッションに、グループは隔離されたセッションに自動ルーティング
- **Canvasホスト** — `http://<gateway>:18793`でノードWebView用UIを提供
- **ダッシュボード** — `http://127.0.0.1:18789/`でブラウザControl UIから設定管理

### 🧠 多彩なAIモデルサポート

- **Anthropic Claude**（Opus、Sonnet、Haiku）
- **OpenAI**（GPT-4o、GPT-5、o1など）
- **Google Gemini**
- **Amazon Bedrock**経由のモデルアクセス
- **Subscription Auth** — Claude Pro/Max、ChatGPT/Codex OAuth連携

一つのモデルに縛られず、用途に応じて**自由にモデルを切り替え**られます。cronジョブには安価なモデルを、重要な分析には高性能モデルを割り当てるといった**モデルルーティング**も可能です。

### 🔧 強力なツールセット

OpenClawに内蔵されたツールは単なるプラグインではなく、**エージェントが実際に世界と対話する手段**です。

| ツール | 説明 |
|---|---|
| 🌐 `browser` | AIがWebページを直接探索・操作（Chrome拡張リレー含む） |
| 🎨 `canvas` | エージェントが制御する視覚的ワークスペース — ノードWebViewにUI表示 |
| ⏰ `cron` | 一回限りのリマインダーから繰り返しタスクまでGateway内蔵スケジューラ |
| 🔗 `webhooks` | 外部サービス（GitHub、Gmailなど）とリアルタイム連携 |
| 🧠 `memory_search` | 過去の会話や保存された情報を自然言語で検索 |
| 💬 `message` | チャネル間メッセージ送信、編集、リアクション |
| 📱 `nodes` | iOS/Android/macOSデバイスのリモート制御 |
| 🖥️ `exec` | シェルコマンド実行（PTYサポート、セキュリティ承認システム） |
| 📝 `read`/`write`/`edit` | ファイルシステム直接操作 |
| 🔍 `web_search`/`web_fetch` | Web検索およびページコンテンツ抽出 |
| 🎤 `tts` | テキストを音声に変換 |

### 🛒 Skillsシステム & ClawHub

**AgentSkillsフォーマット**と互換性のあるスキルシステムを備えており、**ClawHubマーケットプレイス**で他のユーザーが作成したスキルをインストールしたり、自分のスキルを共有したりできます。

![ClawHub — OpenClawスキルマーケットプレイス。Trello、Slack、Calendarなど多彩なスキルが提供されています](../../../assets/blog/clawhub-main.png)

スキルは3か所からロードされます（優先順位順）：
1. **ワークスペーススキル**（`<workspace>/skills/`） — 最高優先度
2. **管理スキル**（`~/.openclaw/skills/`） — すべてのエージェントで共有
3. **バンドルスキル** — OpenClawパッケージに含まれるデフォルトスキル

スキルのインストールは1行で完了：
```bash
npx clawhub@latest install <スキル名>
```

### 📲 ノードシステム

iOS、Android、macOSデバイスを**ノード**として接続すれば、AIが物理世界と対話できます：

| 機能 | 説明 |
|---|---|
| 📷 カメラスナップ | 前面/背面カメラで撮影 |
| 🎬 カメラクリップ | 短い動画を録画 |
| 🖥️ 画面録画 | 現在の画面をキャプチャ |
| 🔔 プッシュ通知 | システム/オーバーレイ/自動通知を送信 |
| 📍 位置確認 | GPS位置情報を取得（coarse/balanced/precise） |
| 📱 SMS | AndroidノードからSMS送信 |
| ⌨️ コマンド実行 | ノードホストでシェルコマンド実行（Exec承認必要） |

ノードはGateway WebSocketに接続され、**ペアリング承認**を経て有効化されます。スマホがAIの目と耳になるわけです！

### 🤖 マルチエージェントシステム

OpenClawは一つのGatewayで**複数のエージェントを同時に運用**できます。

- **エージェント別ワークスペース** — それぞれ独立した作業空間
- **エージェント別サンドボックス** — Docker基盤の隔離実行環境
- **エージェント別ツール制限** — 特定のエージェントには`exec`をブロックし`read`のみ許可するなど
- **バインディングルール** — WhatsAppグループA → 業務エージェント、Telegram DM → パーソナルエージェント
- **サブエージェント** — メインエージェントがバックグラウンドタスクをサブエージェントに委任

### 🎙️ Voice Wake + Talk Mode

キーボードなしで**音声でAIと会話**できます。macOSアプリのWake word機能で呼び出し、Talk Modeで自然な会話を続けましょう。

---

## 🏛️ アーキテクチャ全体像

```mermaid
graph TD
    User["👤 ユーザー<br/>WhatsApp · Telegram · Discord<br/>iMessage · WebChat · Slack"]
    Gateway["🦞 OpenClaw Gateway<br/>ws://127.0.0.1:18789<br/>WebSocketコントロールプレーン"]
    AI["🧠 AIモデル<br/>Claude · GPT-4o/5<br/>Gemini · Bedrock"]
    Tools["🔧 ツールセット<br/>browser · canvas · cron<br/>webhooks · memory · exec"]
    Nodes["📱 Nodeシステム<br/>iOS · Android · macOS · Linux<br/>カメラ · 位置 · 通知 · コマンド実行"]

    User -->|"メッセージ"| Gateway
    Gateway --> AI
    Gateway --> Tools
    Tools --> Nodes
```

核心原則：
- **Loopback-first**：Gateway WSはデフォルトでlocalhostのみバインド
- **1つのGateway、1つのホスト**：WhatsApp Webセッション所有権の競合防止
- **トークンベース認証**：非ローカルバインド時はトークン必須
- **Tailscale/VPN**：リモートアクセスはSSHトンネルやTailnet利用を推奨

---

## 🆚 他のAIアシスタントとの違いは？

| 比較項目 | ChatGPT / Claude アプリ | **OpenClaw** |
|---|---|---|
| ホスティング | クラウド（他社サーバー） | **セルフホスティング**（自分のPC） |
| データプライバシー | サーバーに保存 | **ローカルにのみ保存** 🔒 |
| 利用チャネル | 専用アプリ/Webのみ | **Telegram、Discordなど既存メッセンジャー** |
| AIモデル | 当該企業のモデルのみ | **Claude、GPT、Gemini自由選択** |
| 拡張性 | 限定的（プラグインストア） | **スキル、Webhook、cron、MCP、カスタムツール** |
| デバイス制御 | ❌ 不可 | ✅ **カメラ、画面、位置、コマンド実行** |
| 自動化 | ❌ 不可 | ✅ **cron、ハートビート、Webhook** |
| マルチエージェント | ❌ 不可 | ✅ **エージェント別ルーティング、サンドボックス** |
| オープンソース | ❌ | ✅ **MITライセンス** |

核心的な違いを一行でまとめると：

> **「他人のサービスを借りるのではなく、自分のインフラの上で自分のルールで動くAIアシスタント。」**

---

## 🎯 こんな方におすすめ！

- 🔐 **プライバシーを重視する方** — すべてのデータが自分のPCにのみ残ります
- 🛠️ **自動化好きな開発者** — cron、Webhook、スキル、MCPで無限に拡張
- 📱 **複数のメッセンジャーを使う方** — TelegramでもDiscordでもどこでも同じAIアシスタント
- 🤓 **AI技術を自分で触ってみたい方** — オープンソースだからコードレベルで理解可能
- 🏠 **ホームオートメーションに興味がある方** — NodeシステムでIoT的な活用が可能
- 👨‍💼 **チームにAIを導入したい方** — マルチエージェントで役割別AI運用が可能
- 🔧 **既存ワークフローにAIを統合したい方** — Webhook、n8n、Makeなどと簡単に連携

逆に、「ChatGPTのWebでたまに質問する程度」で満足されている方なら、わざわざOpenClawまで使う必要はないかもしれません。OpenClawは**「AIを自分の生活に深く統合したい人」**のためのツールです。

---

## 🌍 プロジェクトエコシステム

OpenClawは単独プロジェクトではなく、複数のコンポーネントで構成された**エコシステム**です：

| コンポーネント | 役割 |
|---|---|
| **OpenClaw Gateway** | コアランタイム — チャネル、ツール、エージェント管理 |
| **Pi** | コーディングエージェントエンジン — RPCモードでGatewayと通信 |
| **ClawHub** | スキルレジストリ — 検索、インストール、更新、共有 |
| **OpenClaw.app** | macOSデスクトップアプリ — メニューバー + Voice Wake |
| **OpenClaw iOS** | iPhone/iPadノードアプリ — Canvas + カメラ |
| **OpenClaw Android** | Androidノードアプリ — Canvas + Chat + Camera |
| **公式ドキュメント** | docs.openclaw.ai — 総合ガイド |

---

## 📢 次回予告

今回の記事ではOpenClawとは何か、なぜ特別なのかを紹介しました。

**[第2回：チュートリアル編](/ja/blog/ja/openclaw-installation-tutorial/)**では、実際にOpenClawを**インストールして設定するプロセス**をステップバイステップで一緒に進めていきます！

- Node.jsインストール & Gatewayオンボーディング
- Telegramチャネル接続とペアリング
- 最初のAI会話を始める
- ワークスペースのファイル構造を理解する

> 🦞 **「百聞は一Runに如かず」** — 次回、実際に動かしてみましょう！

---

*この記事が役に立ったらシェアをお願いします！質問は[Discordコミュニティ](https://discord.gg/clawd)で歓迎です。* 🙌
