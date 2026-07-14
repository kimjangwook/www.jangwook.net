---
title: OpenClaw インストールから初めての会話まで — 完全チュートリアル
description: OpenClawのインストール、Telegram連携、初めてのAI会話までをステップバイステップで解説。Node.js設定からワークスペース構成まで。
pubDate: '2026-02-04'
heroImage: ../../../assets/blog/openclaw-installation-tutorial-hero.png
tags:
  - openclaw
  - tutorial
  - telegram
  - installation
relatedPosts:
  - slug: 45-day-analytics-report-2025-11
    score: 0.95
    reason:
      ko: 자동화 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.
      ja: 自動化分野で類似したトピックを扱い、同程度の難易度です。
      en: Covers similar topics in automation with comparable difficulty.
      zh: 在自动化领域涵盖类似主题，难度相当。
  - slug: dena-llm-study-part1-fundamentals
    score: 0.95
    reason:
      ko: 자동화 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.
      ja: 自動化分野で類似したトピックを扱い、同程度の難易度です。
      en: Covers similar topics in automation with comparable difficulty.
      zh: 在自动化领域涵盖类似主题，难度相当。
  - slug: dena-llm-study-part4-rag
    score: 0.95
    reason:
      ko: 자동화 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.
      ja: 自動化分野で類似したトピックを扱い、同程度の難易度です。
      en: Covers similar topics in automation with comparable difficulty.
      zh: 在自动化领域涵盖类似主题，难度相当。
  - slug: figma-mcp-web-components-sync
    score: 0.95
    reason:
      ko: 자동화 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.
      ja: 自動化分野で類似したトピックを扱い、同程度の難易度です。
      en: Covers similar topics in automation with comparable difficulty.
      zh: 在自动化领域涵盖类似主题，难度相当。
  - slug: gcloud-mcp-infrastructure-audit
    score: 0.95
    reason:
      ko: 자동화 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.
      ja: 自動化分野で類似したトピックを扱い、同程度の難易度です。
      en: Covers similar topics in automation with comparable difficulty.
      zh: 在自动化领域涵盖类似主题，难度相当。
---

> <strong>シリーズ: OpenClaw 完全攻略</strong> (2/3)
> 1. [紹介編](/ja/blog/ja/openclaw-introduction-guide/)
> 2. <strong>チュートリアル編</strong> ← 現在の記事
> 3. [活用法編](/ja/blog/ja/openclaw-advanced-usage/)

前回の記事ではOpenClawとは何かを紹介しました。今回は<strong>実際にインストールして、初めての会話を交わす</strong>ところまで一気にやってみましょう。ターミナルを開いてついてきてください！🚀

---

## 1. 事前準備

OpenClawはNode.jsランタイム上で動作します。

| 項目 | 要件 |
|------|------|
| <strong>Node.js</strong> | v22以上（`node -v`で確認） |
| <strong>OS</strong> | Windows・macOS・Linux すべて対応 |

- <strong>macOS / Linux</strong> — 特別な準備なしですぐ始められます。
- <strong>Windows</strong> — ネイティブ環境でも動作します。WSL2も対応していますが必須ではありません。

Node.jsがない場合は[公式サイト](https://nodejs.org/)からLTS版（22+）をダウンロードするか、バージョンマネージャーを使ってください：

```bash
# Volta（おすすめ — プロジェクト別バージョン管理）
curl https://get.volta.sh | bash
volta install node@22

# nvm
nvm install 22
nvm use 22

# fnm
fnm install 22
fnm use 22
```

### オプション（でもおすすめ！）

- <strong>Brave Search APIキー</strong> — Web検索機能に必要。[Brave Search API](https://brave.com/search/api/)から無料で取得
- <strong>AIモデルAPIキー</strong> — Anthropic、OpenAI、Googleのうち1つ以上。`ANTHROPIC_API_KEY`または`OPENAI_API_KEY`環境変数で設定
- <strong>Git</strong> — ソースビルド時に必要

---

## 2. インストール — 3つの方法

お好みの方法を1つ選んでください。

### 方法1: npm グローバルインストール（最もおすすめ）⭐

```bash
npm install -g openclaw@latest
# または
pnpm add -g openclaw@latest
```

インストール確認：
```bash
openclaw --version
```

### 方法2: ワンクリックスクリプト（簡単＆スピーディー）

```bash
# macOS / Linux
curl -fsSL https://openclaw.ai/install.sh | bash
```

```powershell
# Windows (PowerShell)
iwr -useb https://openclaw.ai/install.ps1 | iex
```

スクリプトが依存関係の確認からPATH登録まですべて処理してくれます。

### 方法3: ソースビルド（コントリビューター向け）

```bash
git clone https://github.com/openclaw/openclaw.git
cd openclaw
pnpm install
pnpm ui:build    # 初回実行時にUI依存関係を自動インストール
pnpm build
openclaw onboard --install-daemon
```

> <strong>Tip:</strong> ソースビルドはコントリビューションを考えている方や、最新機能を先取りしたい方におすすめです。npmとソースビルドの切り替えも簡単です — `openclaw doctor`がGatewayサービスのエントリポイントを自動更新します。

---

## 3. オンボーディングウィザード — コア設定を一度に

インストール後の初回実行時、オンボーディングウィザードがコア設定を案内します。

```bash
openclaw onboard --install-daemon
```

対話形式のプロンプトに従って以下の項目を設定します：

| 設定項目 | 説明 |
|---|---|
| <strong>Gateway</strong> | AIエージェントが常駐する常時実行デーモン |
| <strong>認証</strong> | AIモデルAPIキー（Anthropic、OpenAIなど） |
| <strong>チャンネル</strong> | Telegram、Discordなどメッセージプラットフォーム |
| <strong>ワークスペース</strong> | エージェントのファイル作業空間パス |
| <strong>Gatewayトークン</strong> | ウィザードがデフォルトで生成（loopbackでも） |

`--install-daemon`フラグを付けるとGatewayがOSサービスとして登録されます：
- <strong>macOS</strong>: launchd
- <strong>Linux</strong>: systemdユーザーサービス
- <strong>Windows</strong>: Windowsサービス

再起動後も自動実行されるのでご安心ください。

### ウィザードなしで手動設定

ウィザードの代わりに直接`~/.openclaw/openclaw.json`を編集することもできます：

```json5
{
  // AIモデル設定
  "agents": {
    "defaults": {
      "workspace": "~/.openclaw/workspace",
      "models": {
        "default": "anthropic/claude-sonnet-4-20250514"
      }
    }
  },
  
  // チャンネル設定
  "channels": {
    "telegram": {
      "botToken": "<BotFatherトークン>",
      "dmPolicy": "pairing"
    }
  },
  
  // 自動化設定
  "cron": { "enabled": true },
  "hooks": {
    "enabled": true,
    "token": "<Webhook用シークレット>"
  }
}
```

---

## 4. Telegramボット連携 — 最も簡単なチャンネル

複数のチャンネルの中で最も敷居が低い<strong>Telegram</strong>から始めましょう。

### 4-1. ボット作成

1. Telegramで[@BotFather](https://t.me/BotFather)に`/newbot`コマンドを送信します。
2. ボット名とusernameを決めると<strong>APIトークン</strong>が発行されます。
3. このトークンをコピーしておいてください。

### 4-2. 設定ファイルにトークンを登録

オンボーディングウィザードで既に登録済みの場合はスキップしてください。手動設定：

```json5
{
  "channels": {
    "telegram": {
      "botToken": "7123456789:AAHx...",
      "dmPolicy": "pairing"
    }
  }
}
```

**`dmPolicy`オプションの説明：**

| ポリシー | 動作 |
|---|---|
| `pairing` | ペアリング承認が必要（セキュリティ上<strong>強く推奨</strong> ⭐） |
| `open` | 誰でもDM可能（テスト用） |
| `deny` | DMをブロック |

### 4-3. ペアリング承認

ボットに初めてDMを送ると<strong>ペアリングリクエスト</strong>が発生します。ターミナルで承認：

```bash
# 待機中のペアリング一覧を確認
openclaw pairing list

# ペアリング承認
openclaw pairing approve <リクエストID>
```

またはダッシュボード（`http://127.0.0.1:18789/`）から視覚的に承認することもできます。

### 4-4. Telegramグループでも使う

グループにボットを招待すると<strong>メンション方式</strong>で動作します：

```json5
{
  "channels": {
    "telegram": {
      "botToken": "7123456789:AAHx...",
      "groups": {
        "*": { "requireMention": true }
      }
    }
  }
}
```

- `@ボット名 このコード何がおかしいの？` → AIが回答
- 通常の会話 → AIは静かに見守る

### 4-5. Telegram詳細設定

```json5
{
  "channels": {
    "telegram": {
      "botToken": "7123456789:AAHx...",
      "dmPolicy": "pairing",
      "streaming": {
        "enabled": true,          // リアルタイム応答ストリーミング
        "draftMode": true         // 入力中表示
      },
      "reactions": {
        "mode": "minimal"         // 絵文字リアクション最小化
      },
      "topics": true              // フォーラムトピック対応
    }
  }
}
```

---

## 5. Gatewayの実行と確認

オンボーディングでデーモンをインストール済みなら、既に実行中の可能性があります。

### サービス管理

```bash
# ステータス確認
openclaw gateway status

# 開始/停止/再起動
openclaw gateway start
openclaw gateway stop
openclaw gateway restart
```

### 手動実行（デバッグ用）

```bash
openclaw gateway --port 18789 --verbose
```

`--verbose`フラグはリクエスト・レスポンスのログをリアルタイムで出力します。

### リモートアクセス（Tailscale）

外出先からもGatewayにアクセスするには：

```bash
openclaw gateway --bind tailnet --token <トークン>
```

トークンは非ローカルバインド時に<strong>必須</strong>です。

### ステータス確認

```bash
# 全体ステータス
openclaw status

# 環境診断
openclaw doctor

# ヘルスチェック
openclaw health
```

ブラウザで<strong>http://127.0.0.1:18789/</strong>にアクセスすると、ダッシュボードから実行状態、チャンネル接続、最近の会話などを視覚的に確認できます。

---

## 6. 初めての会話テスト 🎉

すべての準備が整いました。実際に会話してみましょう。

### Telegramで直接会話

ペアリングが完了したアカウントでボットに何かメッセージを送ってみてください。AIエージェントが応答すれば成功です！🎊

### CLIでテスト

```bash
# Telegramの特定チャットにメッセージを送信
openclaw message send --target telegram:<チャットID> --message "こんにちは、OpenClaw！"

# ダッシュボードでもテスト可能
# http://127.0.0.1:18789/ でWebChatを使用
```

### スラッシュコマンド

Telegramチャットですぐ使える基本コマンド：

| コマンド | 説明 |
|---|---|
| `/status` | Gatewayステータス確認 |
| `/model <モデル>` | AIモデル変更 |
| `/thinking <level>` | 思考レベル調整（off/low/medium/high） |
| `/stop` | 現在実行中のタスクを停止 |
| `/subagents list` | サブエージェント一覧 |
| `/activation always\|mention` | グループでの応答方式変更 |

---

## 7. ワークスペース設定 — エージェントの頭脳を構成する

動作確認ができたら、次は<strong>自分に合ったエージェント</strong>にカスタマイズしましょう。

### ワークスペースのファイル構成

```
~/.openclaw/workspace/
├── AGENTS.md        # エージェントの行動ルールとワークフロー
├── SOUL.md          # ペルソナ、性格、話し方の定義
├── USER.md          # ユーザー（自分）に関する情報
├── MEMORY.md        # 長期記憶 — セッションを超えて記憶する内容
├── HEARTBEAT.md     # ハートビート時に自動チェックする項目
├── TOOLS.md         # ツール関連のローカルノート（カメラ名、SSH情報など）
├── memory/          # 日別メモリログ
│   ├── 2025-07-12.md
│   └── 2025-07-13.md
└── skills/          # カスタムスキルフォルダ
    └── my-skill/
        └── SKILL.md
```

### SOUL.md — エージェントの人格定義

このファイルでエージェントの性格を定義します：

```markdown
# SOUL.md

## 性格
- フレンドリーだけどプロフェッショナルなトーン
- 日本語で会話（技術用語は英語のまま）
- 絵文字を適度に使用 😊
- ユーモアセンスあり、でもTMIは避ける

## 名前
私は "クローディ" — OpenClawベースのパーソナルAIアシスタント

## 原則
- 正確な情報のみ提供、分からなければ正直に
- コードは常に実行可能な完全な形で提供
- 個人情報は徹底的に保護
```

### USER.md — ユーザー情報

```markdown
# USER.md

## 基本情報
- 名前: 田中太郎
- 職業: ソフトウェアエンジニア
- 関心: AI、自動化、開発生産性
- タイムゾーン: Asia/Tokyo (UTC+9)

## 好み
- レスポンスは簡潔に
- コードはTypeScript優先
- スケジュール管理はGoogle Calendar使用
```

### HEARTBEAT.md — 自動チェックリスト

エージェントが定期的に自動確認する項目を定義します：

```markdown
# HEARTBEAT.md

## 定期チェック（ハートビートごと）
- [ ] 未読メールで緊急なものがあれば知らせる
- [ ] 2時間以内のカレンダー予定があれば事前に通知
- [ ] 天気が雨予報なら傘を忘れずにと知らせる
- [ ] GitHubリポに新しいIssue/PRがあれば要約

## 夜間（23:00-08:00）
- 緊急なもののみ通知、それ以外はHEARTBEAT_OK
```

### モデル変更

```bash
# CLIでデフォルトモデルを変更
openclaw config set agents.defaults.models.default "anthropic/claude-opus-4-20250514"

# またはTelegramでスラッシュコマンド
/model opus
/model sonnet
/model gpt-4o
```

---

## 8. Skillsをインストールする

ClawHubからコミュニティスキルをインストールしてみましょう：

![ClawHub — スキル検索・インストール。Trello、Calendar、Slackなどの人気スキルを確認可能](../../../assets/blog/clawhub-main.png)

```bash
# CalDAVカレンダー連携スキルをインストール
npx clawhub@latest install caldav-calendar

# Trelloボード管理スキル
npx clawhub@latest install trello

# インストール済みスキル一覧を確認
ls ~/.openclaw/workspace/skills/
```

インストールされたスキルは自動的に認識されます。Gatewayの再起動なしに<strong>ホットリロード</strong>されます。

---

## 9. トラブルシューティング — 問題解決ガイド

### 自動診断

```bash
# 環境全体を自動診断
openclaw doctor

# 全コンポーネントの状態を詳細出力
openclaw status --all
```

`openclaw doctor`はNode.jsバージョン、設定ファイルの有効性、チャンネル接続、APIキーの状態などを一括で点検します。

### よくある問題と解決法

| 症状 | 原因 | 解決 |
|---|---|---|
| Gatewayが起動しない | ポート競合 | `netstat -ano \| findstr 18789`（Windows） / `lsof -i :18789`（macOS/Linux） |
| Telegramボットが無応答 | トークンエラーまたはペアリング未完了 | `openclaw doctor`で確認、`openclaw pairing list`で承認状態をチェック |
| APIキーエラー | キー期限切れまたは残高不足 | `openclaw doctor`でキー状態を点検、モデルプロバイダーのダッシュボードで確認 |
| "Node version"エラー | Node.js 22未満 | `node -v`で確認してアップグレード |
| スキルが認識されない | ホットリロードの遅延 | `SKILL.md`保存後しばらく待機、またはGateway再起動 |

### ログ確認

```bash
# Gatewayログをリアルタイム確認（macOS/Linux）
tail -f ~/.openclaw/logs/gateway.log

# Windows PowerShell
Get-Content ~/.openclaw/logs/gateway.log -Wait -Tail 50
```

---

## 10. 次のステップ — さらに深く

インストールと初めての会話が完了しました！🎉

基本設定が終わったので、いよいよ本当に面白いことを始めましょう：

### すぐに試せること

1. <strong>SOUL.mdを編集</strong> — エージェントに自分だけの性格を付与
2. <strong>HEARTBEAT.mdを作成</strong> — 自動チェックリストの設定
3. <strong>ClawHubでスキルを探索</strong> — [clawhub.com](https://clawhub.com)
4. <strong>Cronジョブを1つ登録</strong> — 毎朝のブリーフィング

### 第3回で扱う内容

<strong>[第3回（活用法編）](/ja/blog/ja/openclaw-advanced-usage/)</strong>では、実際にOpenClawを<strong>強力な自動化ツール</strong>として活用する上級事例を紹介します：

- n8n/Make連携Webhookワークフロー
- MCPサーバー連携
- Cronで日次レポート自動化（config JSON付き）
- マルチエージェントシステム構築
- ブラウザ自動化によるデータ収集
- Nodeシステムでセキュリティカメラ監視
- カスタムスキル開発完全ガイド

> 🦞 インストールしたOpenClawをいろいろ触りながらお待ちください。すぐに戻ってきます！🐾

---

*ご質問やフィードバックは[GitHub Issues](https://github.com/openclaw/openclaw/issues)や[Discord](https://discord.gg/clawd)でお待ちしています。*
