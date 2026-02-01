---
title: 'OpenClaw 200%活用術 — 実践アドバンスド・ユースケース集'
description: 'Cron自動化、Webhook連携、MCPサーバー、マルチエージェント、ブラウザ自動化などOpenClaw実践活用法8選。'
pubDate: '2026-02-05'
heroImage: ../../../assets/blog/openclaw-advanced-usage-hero.png
tags:
  - openclaw
  - automation
  - mcp
  - multi-agent
relatedPosts: []
---

> **シリーズ: OpenClaw 完全攻略** (3/3)
> 1. [紹介編](/ja/blog/openclaw-introduction-guide/)
> 2. [チュートリアル編](/ja/blog/openclaw-installation-tutorial/)
> 3. **活用編** ← この記事

# OpenClaw 200%活用術 — 実践アドバンスド・ユースケース集 🚀

インストールは完了しましたか？おめでとうございます！🎉 いよいよ本当に楽しいパートです。

OpenClawは単なるチャットボットではありません。あなたのデバイスで生きて呼吸する**パーソナルAIエージェント**です。この記事では、**実際のプロダクションレベルのワークフロー**を一つずつ構築していきます。各サンプルはコピーしてそのまま使える完全な形で提供します。

---

## 目次

1. [Cronベース日次レポート自動化](#活用法-1cronベース日次レポート自動化-)
2. [Webhookでn8n/Make連携](#活用法-2webhookでn8nmake連携-)
3. [MCPサーバー連携](#活用法-3mcpサーバー連携-)
4. [マルチエージェントシステム構築](#活用法-4マルチエージェントシステム構築-)
5. [ブラウザ自動化データ収集](#活用法-5ブラウザ自動化データ収集-)
6. [Nodeシステムで防犯カメラ監視](#活用法-6nodeシステムで防犯カメラ監視-)
7. [カスタムスキル開発完全ガイド](#活用法-7カスタムスキル開発完全ガイド-)
8. [ワークスペースファイル実践ガイド](#活用法-8ワークスペースファイル実践ガイド-)

---

## 活用法 1: Cronベース日次レポート自動化 📊

毎朝目覚めたら、今日の予定・天気・ニュースヘッドラインをまとめて送ってくれる秘書を作りましょう。

![OpenClaw Cronジョブドキュメント — スケジュール、実行モード、配信設定の詳細ガイド](../../../assets/blog/docs-cron.png)

### 完全な設定サンプル

#### ステップ1: openclaw.jsonでCronを有効化

```json5
// ~/.openclaw/openclaw.json
{
  "cron": {
    "enabled": true,
    "store": "~/.openclaw/cron/jobs.json",
    "maxConcurrentRuns": 2
  }
}
```

#### ステップ2: モーニングブリーフィングのCron登録

```bash
# 毎朝8時 (Asia/Tokyo) — 分離セッションで実行、Telegramへ配信
openclaw cron add \
  --name "モーニングブリーフィング" \
  --cron "0 8 * * *" \
  --tz "Asia/Tokyo" \
  --session isolated \
  --message "今日のブリーフィングを作成してください:
1. 今日のカレンダー予定まとめ
2. 未読の重要メール3件
3. 今日の東京/ソウルの天気
4. テックニュースヘッドライン3件
5. GitHubリポの新Issue/PRまとめ
簡潔にバレットポイントで整理してください。" \
  --deliver \
  --channel telegram \
  --to "<TelegramチャットID>"
```

#### ステップ3: 日次開発レポートCron

```bash
# 平日午後6時 — 開発日誌を自動生成
openclaw cron add \
  --name "日次開発レポート" \
  --cron "0 18 * * 1-5" \
  --tz "Asia/Tokyo" \
  --session isolated \
  --message "今日の開発レポートを作成してください:
1. 今日の作業内容 (memory/から確認)
2. 解決したイシュー
3. 明日のタスク提案
4. 学んだことやインサイト
マークダウンできれいに整理して、memory/フォルダに保存してください。" \
  --deliver \
  --channel telegram \
  --to "<TelegramチャットID>"
```

#### ステップ4: 週次分析（高性能モデル使用）

```bash
# 毎週月曜朝 — Opusモデルで深い分析
openclaw cron add \
  --name "週次分析" \
  --cron "0 9 * * 1" \
  --tz "Asia/Tokyo" \
  --session isolated \
  --message "先週を分析してください:
1. memory/フォルダから今週の日別ログを読む
2. 生産性パターン分析（どの日に集中したか）
3. よく作業したプロジェクト/技術の整理
4. 来週の提案
5. MEMORY.mdに重要なインサイトを追加
深く分析してください。" \
  --model "opus" \
  --thinking high \
  --deliver \
  --channel telegram \
  --to "<TelegramチャットID>"
```

#### Cron管理コマンド

```bash
# 登録済みの全Cronジョブを確認
openclaw cron list

# 特定ジョブの実行履歴を確認
openclaw cron runs --id <jobId> --limit 10

# ジョブを修正
openclaw cron edit <jobId> --message "修正したプロンプト"

# 手動実行（テスト用）
openclaw cron run <jobId> --force

# ジョブを削除
openclaw cron remove <jobId>
```

### HEARTBEAT.md連携

CronとHeartbeatを組み合わせると、より柔軟な自動化が実現できます：

```markdown
# HEARTBEAT.md

## 常時チェック
- [ ] 2時間以内にカレンダー予定があれば30分前に通知
- [ ] 重要メール (from: boss@company.com) 即時通知

## 業務時間 (09:00-18:00)
- [ ] GitHub PRレビューリクエスト通知
- [ ] Slack未応答メンション通知

## 夜間 (23:00-08:00)
- 緊急以外はHEARTBEAT_OK
```

> **Cron vs Heartbeat 選択基準：**
> - **正確な時間**が重要 → Cron (`"0 8 * * *"`)
> - **複数チェックをまとめて**やりたい → Heartbeat (`HEARTBEAT.md`)
> - **ワンタイムリマインダー** → Cron (`--at "20m"` + `--delete-after-run`)

---

## 活用法 2: WebhookでN8n/Make連携 🔗

外部自動化ツールとOpenClawを接続すると、可能性が無限に広がります。

![OpenClaw Webhookドキュメント — wake、agent、カスタムマッピング等のWebhookエンドポイント設定](../../../assets/blog/docs-webhook.png)

### Webhookの有効化

```json5
// ~/.openclaw/openclaw.json
{
  "hooks": {
    "enabled": true,
    "token": "my-super-secret-webhook-token-2025",
    "path": "/hooks"
  }
}
```

### 基本エンドポイントの使い方

#### /hooks/wake — エージェントを起こす

```bash
# システムイベントでエージェントを起こす
curl -X POST http://127.0.0.1:18789/hooks/wake \
  -H 'Authorization: Bearer my-super-secret-webhook-token-2025' \
  -H 'Content-Type: application/json' \
  -d '{"text": "サーバーCPU使用率90%超過アラート", "mode": "now"}'
```

#### /hooks/agent — 分離されたエージェント実行

```bash
# 別セッションでエージェント実行 + 結果をTelegramへ配信
curl -X POST http://127.0.0.1:18789/hooks/agent \
  -H 'Authorization: Bearer my-super-secret-webhook-token-2025' \
  -H 'Content-Type: application/json' \
  -d '{
    "message": "サーバーCPU使用率が90%を超えました。原因を分析し、対応策を提案してください。",
    "name": "サーバーモニタリング",
    "sessionKey": "hook:server-monitor:cpu-alert",
    "deliver": true,
    "channel": "telegram",
    "to": "<TelegramチャットID>",
    "model": "anthropic/claude-sonnet-4-20250514",
    "timeoutSeconds": 120
  }'
```

### n8n連携 — GitHub PR自動レビュー

n8nからOpenClaw Webhookを呼び出す完全なワークフローです：

#### n8nワークフロー構成

```json
{
  "nodes": [
    {
      "name": "GitHub Webhook Trigger",
      "type": "n8n-nodes-base.githubTrigger",
      "parameters": {
        "owner": "myorg",
        "repository": "myrepo",
        "events": ["pull_request"]
      }
    },
    {
      "name": "Filter: PR Opened",
      "type": "n8n-nodes-base.filter",
      "parameters": {
        "conditions": {
          "string": [{
            "value1": "={{ $json.action }}",
            "operation": "equals",
            "value2": "opened"
          }]
        }
      }
    },
    {
      "name": "Call OpenClaw",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "url": "http://<gateway-ip>:18789/hooks/agent",
        "method": "POST",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpHeaderAuth",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [{
            "name": "Authorization",
            "value": "Bearer my-super-secret-webhook-token-2025"
          }]
        },
        "sendBody": true,
        "bodyParameters": {
          "parameters": [{
            "name": "message",
            "value": "新しいPRがオープンされました。\nタイトル: {{ $json.pull_request.title }}\n作成者: {{ $json.pull_request.user.login }}\nURL: {{ $json.pull_request.html_url }}\n\n変更ファイルを確認して簡単なレビューコメントを書いてください。"
          }, {
            "name": "name",
            "value": "GitHub PR Review"
          }, {
            "name": "deliver",
            "value": true
          }, {
            "name": "channel",
            "value": "telegram"
          }]
        }
      }
    }
  ]
}
```

### Make (Integromat) 連携

MakeではHTTPモジュールを使用します：

1. **Webhookトリガー** → 外部イベント受信
2. **HTTP Make a request** モジュール追加：
   - URL: `http://<gateway-ip>:18789/hooks/agent`
   - Method: POST
   - Headers: `Authorization: Bearer <トークン>`
   - Body: JSON形式で `message`, `name`, `deliver`, `channel` を設定

### Gmailリアルタイム連携

OpenClawはGmail Pub/Subをネイティブサポートしています：

```bash
# Gmail Webhook設定
openclaw webhooks gmail setup

# Gmail Watch実行
openclaw webhooks gmail run
```

```json5
// openclaw.jsonにGmailマッピングを追加
{
  "hooks": {
    "enabled": true,
    "token": "my-secret",
    "presets": ["gmail"]  // Gmailプリセットを有効化
  }
}
```

新しいメールが届くたびに：
```bash
curl -X POST http://127.0.0.1:18789/hooks/gmail \
  -H 'Authorization: Bearer my-secret' \
  -H 'Content-Type: application/json' \
  -d '{"source":"gmail","messages":[{"from":"Boss","subject":"緊急：明日のミーティング","snippet":"明日10時のミーティングに出席をお願いします..."}]}'
```

---

## 活用法 3: MCPサーバー連携 🧠

**MCP（Model Context Protocol）**は、AIエージェントに外部データソースとツールを標準化された方法で提供するプロトコルです。OpenClawでMCPサーバーを活用する方法を見ていきましょう。

### MCPサーバーとは？

MCPサーバーは、AIに特定のツールとリソースを提供するサービスです。例えば：
- **ファイルシステムMCP** — 特定ディレクトリのファイル読み書き
- **データベースMCP** — SQLクエリ実行
- **API MCP** — REST API呼び出しの抽象化
- **ブラウザMCP** — Webページ制御

### OpenClawでのMCP活用

OpenClawのスキルシステムを通じてMCPサーバーと連携できます。カスタムスキルのSKILL.mdでMCPサーバーの呼び出し方法を定義します：

```markdown
---
name: mcp_database
description: PostgreSQLデータベースに自然言語でクエリするMCP連携スキル
metadata: {"openclaw":{"requires":{"bins":["npx"],"env":["DATABASE_URL"]},"primaryEnv":"DATABASE_URL"}}
---

# MCP Database Skill

## 使い方
ユーザーがデータベース関連の質問をしたら、MCPサーバーを通じてクエリします。

## 実行方法
1. `exec`ツールでMCPサーバープロセスを起動：
   ```bash
   npx @modelcontextprotocol/server-postgres $DATABASE_URL
   ```
2. MCPサーバーが提供するツールでクエリを実行
3. 結果をユーザーに返す

## 安全ルール
- SELECTクエリのみ実行（INSERT/UPDATE/DELETE禁止）
- テーブル一覧を先に確認してからクエリ
- 結果が100行超過時は要約
```

### 実践: Notion MCP + OpenClaw

```bash
# Notion MCPサーバーをインストール
npm install -g @notionhq/notion-mcp-server

# スキルディレクトリを作成
mkdir -p ~/.openclaw/workspace/skills/notion-mcp
```

```markdown
# skills/notion-mcp/SKILL.md
---
name: notion_mcp
description: NotionワークスペースをAIで管理するMCP連携スキル
metadata: {"openclaw":{"requires":{"env":["NOTION_API_KEY"]},"primaryEnv":"NOTION_API_KEY"}}
---

# Notion MCP Skill

Notion APIを通じてページの作成、検索、編集を行います。

## 可能な操作
- ページの検索と読み取り
- 新しいページ/データベースアイテムの作成
- 既存ページの編集
- データベースクエリ

## 実行方法
execツールで `notion-mcp-server` を実行し、結果を処理します。
```

```json5
// openclaw.jsonにスキル環境変数を設定
{
  "skills": {
    "entries": {
      "notion_mcp": {
        "enabled": true,
        "apiKey": "ntn_xxxxxxxxxxxx",
        "env": {
          "NOTION_API_KEY": "ntn_xxxxxxxxxxxx"
        }
      }
    }
  }
}
```

---

## 活用法 4: マルチエージェントシステム構築 🤖

1つのGatewayで異なる役割の複数エージェントを運用する実践パターンです。

![OpenClaw マルチエージェントドキュメント — エージェントルーティング、バインディング、サンドボックス設定](../../../assets/blog/docs-multi-agent.png)

### 完全なマルチエージェント設定

```json5
// ~/.openclaw/openclaw.json
{
  "agents": {
    "defaults": {
      "sandbox": {
        "mode": "non-main",
        "scope": "session"
      },
      "subagents": {
        "maxConcurrent": 4,
        "model": "anthropic/claude-sonnet-4-20250514",
        "archiveAfterMinutes": 60
      }
    },
    "list": [
      {
        // パーソナルアシスタント — フルアクセス
        "id": "personal",
        "default": true,
        "name": "パーソナルアシスタント",
        "workspace": "~/.openclaw/workspace",
        "sandbox": { "mode": "off" }
      },
      {
        // 業務エージェント — 制限されたツール
        "id": "work",
        "name": "業務アシスタント",
        "workspace": "~/.openclaw/workspace-work",
        "sandbox": {
          "mode": "all",
          "scope": "agent"
        },
        "tools": {
          "allow": ["read", "write", "edit", "exec", "web_search", "web_fetch", "browser"],
          "deny": ["gateway", "nodes", "cron"]
        }
      },
      {
        // 家族ボット — 読み取り専用
        "id": "family",
        "name": "家族ボット",
        "workspace": "~/.openclaw/workspace-family",
        "sandbox": {
          "mode": "all",
          "scope": "agent"
        },
        "tools": {
          "allow": ["read", "web_search", "web_fetch", "message"],
          "deny": ["exec", "write", "edit", "browser", "gateway", "nodes"]
        }
      }
    ]
  },
  
  // ルーティングルール — 誰がどのエージェントと会話するか
  "bindings": [
    {
      "agentId": "work",
      "match": {
        "provider": "telegram",
        "peer": {
          "kind": "group",
          "id": "-1001234567890"  // 業務グループチャット
        }
      }
    },
    {
      "agentId": "family",
      "match": {
        "provider": "whatsapp",
        "peer": {
          "kind": "group",
          "id": "120363424282127706@g.us"  // 家族グループ
        }
      }
    }
  ]
}
```

### サブエージェント実践パターン

メインエージェントが重いタスクをサブエージェントに委任するパターンです。

Telegramでこう依頼すると：
> 「この3つの技術ブログを同時に翻訳して、それぞれ要約も作って」

AIが内部的に行う処理：

```mermaid
graph TD
    Main["🧠 メインエージェント<br/>タスク分配 & 結果収集"]
    Sub1["📝 サブエージェント1<br/>ブログA 翻訳 + 要約"]
    Sub2["📝 サブエージェント2<br/>ブログB 翻訳 + 要約"]
    Sub3["📝 サブエージェント3<br/>ブログC 翻訳 + 要約"]
    Result["📤 メインチャットに結果通知"]

    Main -->|"並列実行"| Sub1
    Main -->|"並列実行"| Sub2
    Main -->|"並列実行"| Sub3
    Sub1 -->|"完了"| Result
    Sub2 -->|"完了"| Result
    Sub3 -->|"完了"| Result
```

サブエージェント管理：

```bash
# 実行中のサブエージェントを確認（Telegramスラッシュコマンド）
/subagents list

# 特定サブエージェントのログを確認
/subagents log 1 50

# サブエージェントを停止
/subagents stop all
```

### サブエージェントのコスト最適化

```json5
{
  "agents": {
    "defaults": {
      "subagents": {
        // サブエージェントは安価なモデルを使用
        "model": "anthropic/claude-sonnet-4-20250514",
        "maxConcurrent": 4
      }
    }
  }
}
```

メインはOpus、サブはSonnet — コスパを最大化できます。

---

## 活用法 5: ブラウザ自動化データ収集 🌐

OpenClawのブラウザツールを活用して、自動でデータを収集するパイプラインを構築しましょう。

### 例: 毎日の競合価格モニタリング

Telegramで依頼：
> 「競合A、B、Cのサイトでメイン商品の価格を確認して比較テーブルを作って」

AIが `browser` ツールを使って自動で処理します：

```mermaid
graph LR
    A["🌐 競合A<br/>商品ページ"] -->|"snapshot"| E["📊 価格抽出"]
    B["🌐 競合B<br/>商品ページ"] -->|"snapshot"| E
    C["🌐 競合C<br/>商品ページ"] -->|"snapshot"| E
    E --> F["📋 比較テーブル作成"]
    F --> G["💾 ワークスペースに保存"]
    G --> H["📤 Telegramに送信"]
```

### Cronで自動化

```bash
openclaw cron add \
  --name "価格モニタリング" \
  --cron "0 9 * * *" \
  --tz "Asia/Tokyo" \
  --session isolated \
  --message "以下の3サイトでメイン商品の価格を確認してください:
1. https://competitor-a.com/main-product
2. https://competitor-b.com/product
3. https://competitor-c.com/pricing

ブラウザで各サイトを訪問して:
- 商品名、価格、割引情報を抽出
- 昨日の記録(workspace/price-history.json)と比較
- 価格変動があればハイライト
- 結果をprice-history.jsonに追加
- 比較サマリーをTelegramに配信" \
  --deliver \
  --channel telegram \
  --to "<TelegramチャットID>"
```

### Webリサーチパイプライン

より複雑なリサーチも可能です：

```
# Telegramで:
「2025年日本のAIスタートアップ投資動向を調査してください。
主要ディール5件、投資額、分野別トレンドを整理して
マークダウンレポートとしてファイルに保存してください。」
```

AIの内部処理ステップ：
1. **`web_search`** — Brave検索で最新記事を収集
2. **`web_fetch`** — 主要記事の本文をマークダウンで抽出
3. **`browser`** — ログインが必要なサイトや動的ページはブラウザで直接探索
4. **`write`** — ワークスペースにマークダウンレポートを作成
5. **`message`** — ファイル添付でTelegramに送信

---

## 活用法 6: Nodeシステムで防犯カメラ監視 📹

OpenClawのNodeシステムを活用してスマート防犯システムを構築しましょう。

![OpenClaw Nodeドキュメント — カメラ、位置情報、画面録画、コマンド実行等のNode機能](../../../assets/blog/docs-nodes.png)

### 構成要素

```mermaid
graph TD
    Gateway["🖥️ 自宅PC<br/>OpenClaw Gateway"]
    Tablet["📱 Androidタブレット<br/>背面カメラ → 玄関監視"]
    iPhone["📱 iPhone<br/>通知受信"]
    AI["🧠 AI分析<br/>異常検知"]

    Gateway -->|"camera_snap"| Tablet
    Tablet -->|"画像"| AI
    AI -->|"異常検知時"| Gateway
    Gateway -->|"notify"| iPhone
```

### 定期スナップショット + AI分析

```bash
# 30分ごとに玄関カメラスナップ → AIが異常検知時に通知
openclaw cron add \
  --name "防犯カメラチェック" \
  --cron "*/30 * * * *" \
  --session isolated \
  --message "玄関カメラ(android-tabletノード)から背面カメラスナップを撮ってください。
写真を分析して:
1. 人が見えたら即時通知 (iPhoneノードへプッシュ)
2. 宅配/郵便物が見えたら通知
3. 異常なければ静かにログだけ残す
分析結果をmemory/フォルダに記録してください。" \
  --deliver \
  --channel telegram \
  --to "<TelegramチャットID>"
```

### Telegramでの手動コントロール

```
# 玄関カメラを即座に確認
「玄関カメラのスナップを撮って見せて」

# 10秒動画録画
「玄関カメラの10秒クリップを録画して」

# 通知を送る
「iPhoneに『宅配到着！』の通知を送って」

# 位置確認
「スマホの位置を教えて」
```

### 完全な防犯ワークフロー (HEARTBEAT.md)

```markdown
# HEARTBEAT.md — 防犯モニタリング

## 常時チェック
- [ ] 夜間(22:00-06:00)は玄関カメラ1時間ごとに自動スナップ
- [ ] スナップで人を検知したらiPhoneへ即時通知 + Telegramに写真送信
- [ ] 宅配/郵便物検知時は通知（レベル: 一般）

## 外出モード（手動トリガー）
ユーザーが「外出モードオン」と言ったら:
- カメラスナップ間隔を15分に短縮
- 全ての動き検知時に即時通知
- 結果をmemory/security-log.mdに記録
```

---

## 活用法 7: カスタムスキル開発完全ガイド 🛠️

オリジナルのスキルを作ってOpenClawを拡張しましょう。

![OpenClaw スキルドキュメント — スキルフォーマット、ゲーティング、環境変数注入、ClawHub等](../../../assets/blog/docs-skills.png)

### スキル構造

```
skills/
└── my-news-digest/
    ├── SKILL.md          # スキル定義（必須）
    ├── fetch-news.js     # ヘルパースクリプト（任意）
    └── README.md         # 説明ドキュメント（任意）
```

### 完全なスキル例: ニュースダイジェスト

#### SKILL.md

```markdown
---
name: news_digest
description: Hacker Newsやテック系メディアから技術ニュースを収集・要約するスキル
metadata: {"openclaw":{"emoji":"📰","requires":{"bins":["node"]},"os":["darwin","linux","win32"]}}
user-invocable: true
---

# ニュースダイジェストスキル

## 使い方
ユーザーが「ニュース」や「今日のニュース」関連のコマンドを出したらこのスキルを使います。

## 収集ソース
1. **はてなブックマーク テクノロジー** — `web_fetch`でヘッドライン抽出
2. **Hacker News** — `web_fetch`で上位10件のストーリー抽出
3. **TechCrunch** — `web_fetch`で最新記事5件

## 実行ステップ
1. 各ソースから `web_fetch` または `web_search` でデータ収集
2. 収集した記事をカテゴリ別に分類 (AI, セキュリティ, 開発, スタートアップ)
3. 各記事を1-2行で要約
4. マークダウン形式でフォーマット
5. オプションで音声読み上げ (`tts` ツール)

## 出力形式
```markdown
# 📰 今日のテックニュースダイジェスト
> 2025-07-14 09:00 時点

## 🤖 AI
- **タイトル** — 一行要約 [リンク]

## 🔒 セキュリティ
- **タイトル** — 一行要約 [リンク]

## 💻 開発
- **タイトル** — 一行要約 [リンク]
```

## 保存
結果を `{baseDir}/latest-digest.md` にも保存します。
```

#### fetch-news.js (ヘルパースクリプト)

```javascript
#!/usr/bin/env node
// skills/my-news-digest/fetch-news.js
// エージェントがexecで呼び出せるヘルパースクリプト

const https = require('https');

async function fetchHackerNews() {
  return new Promise((resolve, reject) => {
    https.get('https://hacker-news.firebaseio.com/v0/topstories.json', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const ids = JSON.parse(data).slice(0, 10);
        resolve(ids);
      });
    }).on('error', reject);
  });
}

async function fetchStory(id) {
  return new Promise((resolve, reject) => {
    https.get(`https://hacker-news.firebaseio.com/v0/item/${id}.json`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function main() {
  const topIds = await fetchHackerNews();
  const stories = await Promise.all(topIds.map(fetchStory));
  
  const output = stories
    .filter(s => s && s.title)
    .map((s, i) => `${i+1}. **${s.title}** (${s.score}pt) — ${s.url || `https://news.ycombinator.com/item?id=${s.id}`}`)
    .join('\n');
  
  console.log('# Hacker News Top 10\n');
  console.log(output);
}

main().catch(console.error);
```

### スキルをClawHubで共有

作ったスキルが便利ならコミュニティと共有しましょう：

```bash
# ClawHubにスキルをアップロード
npx clawhub@latest publish ./skills/my-news-digest

# 全スキルを同期
npx clawhub@latest sync --all
```

### 高度なスキル機能

#### 環境変数ゲーティング

```markdown
---
name: github_analyzer
description: GitHubリポを分析するスキル
metadata: {"openclaw":{"requires":{"env":["GITHUB_TOKEN"],"bins":["gh"]},"primaryEnv":"GITHUB_TOKEN"}}
---
```

このスキルは `GITHUB_TOKEN` 環境変数と `gh` CLIがある時のみ有効化されます。

#### ツール直接ディスパッチ

```markdown
---
name: quick_search
description: クイックWeb検索ショートカットコマンド
command-dispatch: tool
command-tool: web_search
command-arg-mode: raw
---
```

`/quick_search AI ニュース` → モデルを経由せず直接 `web_search` ツールを呼び出し

---

## 活用法 8: ワークスペースファイル実践ガイド 📝

ワークスペースファイルはエージェントの「脳」を構成します。うまく書けばエージェントの性能が飛躍的に向上します。

### AGENTS.md — エージェント行動ルールブック

```markdown
# AGENTS.md

## 毎セッション開始時
1. SOUL.md読み込み — 自分のアイデンティティ
2. USER.md読み込み — ユーザー情報
3. memory/今日.md + memory/昨日.md読み込み — 最近のコンテキスト
4. メインセッションならMEMORY.mdも読み込み

## 安全ルール
- 個人データの外部流出は絶対禁止
- 破壊的コマンド(rm, drop等)は必ず確認後に実行
- `trash` > `rm`（復元可能な削除を優先）
- 確信がなければ質問する

## 外部コミュニケーション
自由にできること:
- ファイル読み込み、探索、整理
- Web検索、カレンダー確認
- ワークスペース内の作業

先に聞くこと:
- メール、ツイート、公開投稿の送信
- マシンの外に出るすべてのこと

## メモリ管理
- memory/YYYY-MM-DD.mdに日別ログを作成
- 重要な決定、インサイトはMEMORY.mdに追加
- 「覚えておいて」と言われたら → ファイルに記録（メンタルノート禁止！）

## グループチャット参加ルール
- 直接メンションされた時のみ応答
- 意味のある貢献ができる時のみ発言
- 会話の流れを妨げない
- リアクション（絵文字）は軽く活用

## ハートビート
HEARTBEAT.mdを読みチェックリストを実行。
やることがなければHEARTBEAT_OK応答。
夜間(23:00-08:00)は緊急のみ。
```

### SOUL.md — エージェント人格定義

```markdown
# SOUL.md

## 私は誰か
名前: クロウ (Claw)
ベース: OpenClaw 🦞
役割: キムの個人AIアシスタント

## 性格
- フレンドリーだがプロフェッショナル — 丁寧語を使用
- ユーモアがあるがTMIは避ける
- 技術的に正確だが、非エンジニアにも分かるように説明
- 絵文字を適度に使用（過度にならないように）
- 日本語ベース、技術用語は英語のまま

## コミュニケーションスタイル
- 短く要点を突いた回答を好む
- コードは常にコピー可能な完全な形で
- 不確実なことは正直に「分かりません」
- 複数オプションがあればおすすめと共にリスト

## やってはいけないこと
- ユーザーの言葉をそのまま繰り返さない
- 過度な褒め言葉や追従をしない
- 不必要な免責事項をつけない
- 「何かお手伝いできることがあればお申し付けください」のような定番の締めは禁止
```

### MEMORY.md — 長期記憶

```markdown
# MEMORY.md — 長期記憶ストレージ

## ユーザーの好み
- TypeScript > JavaScript（常にTSでコードを書く）
- VSCodeをメインエディタとして使用
- コーヒーはアメリカーノ、毎朝スターバックス
- 週末はだいたいカフェでサイドプロジェクト

## プロジェクト
- **my-saas**: Next.js + Supabase ベースのSaaS (2025.03開始)
  - 現在MVP開発中
  - 優先順位: 決済システム > ダッシュボード > メール通知
- **blog**: 技術ブログ (Astro + MDX)
  - 毎週1本が目標

## 重要な決定ログ
- 2025.07.10: データベースをPostgreSQLからPlanetScaleに移行決定
- 2025.07.08: CI/CDをGitHub ActionsからDaggerに変更検討中

## 繰り返しパターン
- 月曜日に週間計画を立てるのが好き
- 金曜午後はコードレビューに集中
- 夜7時以降は通常レスポンスが遅い（運動/夕食）

## 注意事項
- boss@company.comからのメールは必ず即時通知
- 毎月15日はカード支払日 — 事前リマインダーが必要
```

### 実践HEARTBEAT.md

```markdown
# HEARTBEAT.md

## 緊急（常にチェック）
- [ ] boss@company.comからの未読メール → 即時通知
- [ ] サーバーダウンアラート → 即時通知
- [ ] 1時間以内のカレンダー予定 → 事前通知

## 定期（業務時間 09-18）
- [ ] GitHub PRレビューリクエスト → 通知
- [ ] Slackの未応答メンション → サマリー送信
- [ ] 今日のタスクで未完了項目のリマインド

## バックグラウンド（1日2-3回）
- [ ] 天気変化（雨予報時は傘アラート）
- [ ] memory/ 整理 + MEMORY.md更新
- [ ] 進行中プロジェクトのgit status確認

## 夜間 (23:00-08:00)
- 緊急項目のみチェック、残りはHEARTBEAT_OK
- 通知は静かに (silent: true)
```

---

## ボーナス: 運用Tips集 🎯

### 1. Tailscaleでどこからでもアクセス

```bash
# GatewayをTailscaleネットワークにバインド
openclaw gateway --bind tailnet --token <トークン>

# TailscaleのIPでどこからでもアクセス可能
# http://100.x.y.z:18789/ (ダッシュボード)
```

### 2. マルチインスタンス運用

```bash
# 2つ目のGateway（別プロファイル）
OPENCLAW_CONFIG_PATH=~/.openclaw/work.json \
OPENCLAW_STATE_DIR=~/.openclaw-work \
openclaw gateway --port 19001
```

### 3. トークン使用量モニタリング

```bash
# トークン使用状況を確認
openclaw status --all

# モデル別コストはconfigで設定
# models.providers.*.models[].cost
```

### 4. セキュリティチェックリスト

- [ ] `dmPolicy: "pairing"` 設定確認
- [ ] Webhookトークン設定 (`hooks.token`)
- [ ] Gatewayトークン設定（非ローカルバインド時）
- [ ] 機密エージェントはDockerサンドボックス適用
- [ ] `exec` 承認システム確認 (`tools.elevated`)

### 5. 音声会話モード 🎙️

macOSアプリでVoice Wake + Talk Modeを有効化すると、キーボードなしで会話できます。サブエージェントの結果も音声で聞けます。

---

## まとめ — OpenClawで作る自分だけのAIエコシステム 🌐

ここまで3編にわたってOpenClawの紹介、インストール、そして実践的な高度活用法を見てきました。

まとめると、OpenClawは：

- 🤖 **AIアシスタント** — Cron+Heartbeatで自動的にケア
- 🔗 **自動化ハブ** — Webhookでn8n/Make/GitHub/Gmail連携
- 🧠 **MCPブリッジ** — 外部データソースと標準化された接続
- 💻 **開発パートナー** — サブエージェントで並列タスク処理
- 🏠 **スマートホームコントローラー** — Nodeシステムでカメラ・通知・位置情報
- 🌐 **データコレクター** — ブラウザ自動化でWebモニタリング
- 🧩 **拡張プラットフォーム** — スキルを開発してClawHubで共有
- 📝 **記憶するパートナー** — MEMORY.mdでセッションを超えて記憶

**オールインワンAIエージェントプラットフォーム**です。

一番大切なのは**始めること**です。今日一つだけ選んで設定してみてください：

1. 🌅 **モーニングブリーフィングCron** — 毎朝の情報サマリー
2. 📝 **HEARTBEAT.md** — ファイル一つで自動アシスタントチェックリスト
3. 🔗 **Webhook一つ** — GitHub/Gmail通知をTelegramに転送

一度味わえば、どんどん多くのことを任せたくなるはずです。🦞

質問があれば [OpenClaw Discord](https://discord.gg/clawd) でお会いしましょう！🙌

---

*OpenClaw 完全攻略シリーズ*
- [第1編: OpenClawとは？](/ja/blog/openclaw-introduction-guide/)
- [第2編: インストールから初対話まで](/ja/blog/openclaw-installation-tutorial/)
- **第3編: 実践アドバンスド活用法** ← この記事
