---
title: Claude Code Agent Teams 完全ガイド — OpenClawでのエージェントチーム構築から実践運用まで
description: Claude CodeのAgent Teams機能をOpenClaw環境で有効化し、5つの専門チームを構成して実運用した経験に基づく実践ガイドです。
pubDate: '2026-02-07'
heroImage: ../../../assets/blog/claude-agent-teams-guide-hero.png
tags:
  - claude-code
  - agent-teams
  - openclaw
  - multi-agent
  - tmux
  - automation
relatedPosts:
  - slug: claude-code-cli-migration-guide
    score: 0.95
    reason:
      ko: '자동화, AI/ML, DevOps, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、DevOps、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, DevOps, architecture with
        comparable difficulty.
      zh: 在自动化、AI/ML、DevOps、架构领域涵盖类似主题，难度相当。
  - slug: effiflow-automation-analysis-part3
    score: 0.95
    reason:
      ko: '자동화, AI/ML, DevOps, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、DevOps、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, DevOps, architecture with
        comparable difficulty.
      zh: 在自动化、AI/ML、DevOps、架构领域涵盖类似主题，难度相当。
  - slug: claude-code-plugins-complete-guide
    score: 0.94
    reason:
      ko: '자동화, AI/ML, DevOps, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、DevOps、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, DevOps, architecture with
        comparable difficulty.
      zh: 在自动化、AI/ML、DevOps、架构领域涵盖类似主题，难度相当。
  - slug: anthropic-agent-skills-practical-guide
    score: 0.94
    reason:
      ko: '자동화, AI/ML, DevOps, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、DevOps、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, DevOps, architecture with
        comparable difficulty.
      zh: 在自动化、AI/ML、DevOps、架构领域涵盖类似主题，难度相当。
  - slug: anthropic-agent-skills-standard
    score: 0.94
    reason:
      ko: '자동화, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, architecture with comparable
        difficulty.
      zh: 在自动化、AI/ML、架构领域涵盖类似主题，难度相当。
---

## Agent Teamsとは

2026年2月5日、AnthropicがClaude Codeの新しい実験的機能として**Agent Teams**を発表しました。従来のサブエージェントが一つのセッション内で結果を返すだけの一方向構造だったのに対し、Agent Teamsは完全に独立した複数のClaude Codeインスタンスが**互いにメッセージをやり取りしながら協業**する仕組みです。

主な違いを整理すると以下の通りです：

| 項目 | サブエージェント | Agent Teams |
|------|----------------|-------------|
| コンテキスト | メインセッション内部 | 各自独立したコンテキストウィンドウ |
| 通信 | 結果をメインに返すのみ | チームメイト間で直接メッセージ交換 |
| 調整 | メインエージェントが一括管理 | 共有タスクリストで自律的に調整 |
| トークンコスト | 比較的低い | チームメイト数に比例して増加 |

発表当日、この機能をOpenClaw環境で即座にテストすることにしました。この記事はその過程で経験した試行錯誤と発見をまとめた実践ガイドです。

## 事前準備 — OpenClaw devビルド

Agent Teamsを使うには最新のClaude Codeが必要で、当時OpenClawのstableチャネルにはcronジョブのバグがあり、どのみちdevチャネルへの切り替えが必要な状況でした。（[関連記事](/ja/blog/ja/openclaw-cron-fix-guide/)）

### pnpmの有効化

```bash
corepack enable pnpm
```

### devチャネル切り替えとソースビルド

```bash
export OPENCLAW_GIT_DIR=~/openclaw
openclaw update --channel dev
```

自動更新が失敗した場合は手動ビルドを行います：

```bash
cd ~/openclaw
pnpm install && pnpm build && npm install -g .
```

### ゲートウェイ再起動

```bash
openclaw gateway restart
```

この手順によりdevチャネルのv2026.2.4が適用され、Agent Teamsに対応したClaude Codeバージョンが含まれます。

## Agent Teamsの有効化

Agent Teamsはデフォルトで無効になっています。有効化する方法は2つあります：

### 方法1：環境変数の直接設定

```bash
export CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1
```

### 方法2：settings.jsonに永続設定

`~/.claude/settings.json`：

```json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```

### OpenClaw LaunchAgentへの反映

OpenClawをmacOS LaunchAgentとして運用している場合、plistファイルの`EnvironmentVariables`セクションに追加する必要があります：

```xml
<key>EnvironmentVariables</key>
<dict>
    <key>CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS</key>
    <string>1</string>
</dict>
```

筆者はsettings.json方式を選択しました。環境変数はセッションごとに消えますが、settings.jsonはClaude Code起動時に自動的に読み込まれるためです。

## teammateModeの設定

Agent Teamsの表示モードは3種類あります：

- **in-process**：全チームメイトがメインターミナル内で実行されます。`Shift+↑/↓`でチームメイトを選択できます。
- **tmux**：各チームメイトがtmux分割ペインで実行されます。全出力を一目で確認できます。
- **iTerm2**：iTerm2使用時に自動分割されます。

デフォルトは`auto`で、tmuxセッション内なら分割モード、それ以外はin-processモードになります。

筆者は**tmuxモード**を明示的に設定しました：

```json
{
  "teammateMode": "tmux"
}
```

tmuxを選んだ理由はシンプルです。5つのチームを同時運用する際、各チームメイトの作業状況を**一画面でリアルタイムに**確認できなければ、ボトルネックを素早く特定できないためです。

tmuxが未インストールの場合は、以下のコマンドでインストールしてください：

```bash
brew install tmux
```

## チーム設計 — 5つの専門チーム構成

今回構成した5つのチームの役割と設計意図を整理します。

### 1. ops（運用）

インフラ点検、ゲートウェイ状態確認、cronジョブ監視を担当するチームです。devチャネル切り替え直後だったため、特に重要でした。

### 2. branding（ブランディング）

ブログ記事作成、ヒーロー画像生成、多言語コンテンツ管理を担当するチームです。技術コンテンツを4言語（日/韓/英/中）で同時に生産します。まさにこの記事もbrandingチームの成果物です。

### 3. invest（投資）

市場分析、ポートフォリオレビュー、リスク評価を並列処理するチームです。

### 4. dev（開発）

コードレビュー、リファクタリング、テスト作成、機能実装を担当するチームです。ファイル競合防止のため、各チームメイトの担当モジュールを明確に分離するのが鍵となります。

### 5. social（ソーシャル）

SNS投稿の下書き作成、トレンド分析、コミュニティモニタリングを担当するチームです。

チーム構成プロンプトの例：

```
5つのエージェントチームを構成してください。
- ops: インフラ運用と監視
- branding: コンテンツ制作と多言語管理
- invest: 市場分析と投資リサーチ
- dev: コード作成とレビュー
- social: SNSとコミュニティ管理
各チームに2名のメンバーを配置し、Sonnetモデルを使用してください。
```

## タスクリストと依存関係管理

Agent Teamsの核心メカニズムの一つが**共有タスクリスト**です。チームリードがタスクを作成し、チームメイトが自律的にclaimして処理します。

### タスクの状態

- **pending**：待機中
- **in progress**：作業中
- **completed**：完了

### 依存関係の設定

タスク間の依存関係を設定すると、先行タスクが完了するまで後続タスクはclaimできません。

実際の例：

```
タスクリスト：
1. [ops] ゲートウェイ状態点検
2. [ops] cronジョブ動作確認（→ 1番に依存）
3. [branding] ブログ下書き作成
4. [branding] ヒーロー画像生成
5. [branding] 多言語翻訳（→ 3番に依存）
6. [dev] レコメンドシステムリファクタリング
7. [dev] テスト作成（→ 6番に依存）
```

タスクの割り当てにはファイルロックが使われ、複数のチームメイトが同時に同じタスクをclaimしようとしても競合は発生しません。

## 実践運用

### Delegateモード

デフォルトではチームリードも直接作業を行えますが、**Delegateモード**を有効にするとリードは調整専任になります：

- チームメイトの生成/終了
- メッセージの転送
- タスク管理

有効化：`Shift+Tab`

大規模チーム運用時にはDelegateモードを推奨します。リードが直接コーディングを始めると調整に空白が生じるためです。

### チームメイトとの直接対話

チームリードを介さず、特定のチームメイトに直接指示できます：

- **in-process**：`Shift+↑/↓`でチームメイトを選択後、メッセージ入力
- **tmux**：該当ペインをクリックして直接操作

この機能は、特定のチームメイトの方向性を素早く修正したい場合に便利です。

### Plan Approval（計画承認）

重要な作業では、チームメイトがまず計画を立て、リードの承認を得てから実行するよう設定できます：

```
認証モジュールリファクタリング用のarchitectチームメイトを作成してください。
変更作業前に必ず計画承認を受けるよう設定してください。
```

リードが承認すれば実行され、却下された場合はフィードバックを反映して再計画します。

## OpenClaw × Agent Teams — シナジー効果

ここで興味深いのは、OpenClaw自体のマルチエージェント機能とAgent Teamsが**異なるレイヤー**で動作するという点です。

### OpenClawマルチエージェント

- Telegram、Discordなど**チャネルレベル**でエージェントを管理
- 各エージェントが独立したペルソナと設定を保持
- cronジョブ、ハートビートなど**自動化スケジューリング**をサポート

### Claude Code Agent Teams

- **セッションレベル**で複数のClaude Codeインスタンスが協業
- 共有タスクリストとメッセージングシステム
- コード作業に特化した並列処理

二つの階層を組み合わせると、以下のような構造になります：

```
OpenClawエージェント（チャネルレベル）
  └─ Claude Codeセッション
       └─ Agent Team（セッションレベル）
            ├─ メンバーA (ops)
            ├─ メンバーB (branding)
            └─ メンバーC (dev)
```

例えば、OpenClawのメインエージェントがTelegramメッセージを受け取り、サブエージェントを生成します。そのサブエージェントがAgent Teamを構成し、複雑な作業を並列処理した後、結果をTelegramに返すパイプラインが実現できます。

## ベストプラクティス

### 1. ファイル競合の防止

Agent Teamsで最も注意すべき点は、**複数のチームメイトが同じファイルを修正すること**です。

- チームメイトごとに担当ディレクトリ/ファイルを明確に分離してください
- 共有ファイルは一人のチームメイトのみが修正するよう依存関係を設定してください
- `.claude/teams/`ディレクトリでチーム設定を確認できます

### 2. コンテキストの受け渡し

チームメイトはCLAUDE.md、MCPサーバー、スキルを自動ロードしますが、**リードの会話履歴は引き継ぎません**。そのため：

- スポーンプロンプトに十分なコンテキストを含めてください
- 関連ファイルパスを明示的に指定してください
- 必要に応じてCLAUDE.mdにチーム共通情報を追加してください

### 3. トークン管理

各チームメイトが独立したコンテキストウィンドウを使用するため、トークン消費が急増します。

- 単純作業にはサブエージェントで十分です
- Agent Teamsは**議論、レビュー、並列探索**に集中しましょう
- ブロードキャストメッセージはチーム規模に比例してコストが増加するため、最小化してください

### 4. 権限管理

チームメイトはリードの権限設定を引き継ぎます。`--dangerously-skip-permissions`でリードを実行すると、全チームメイトも同一権限を持つことになるため、注意が必要です。

## 制限事項と注意点

1. **実験的機能**：`EXPERIMENTAL`環境変数名が示す通り、まだ正式機能ではありません。APIが変更される可能性があります。

2. **トークンコスト**：5人チームなら最低5倍のトークン消費が発生します。ROIを検討する必要があります。

3. **デバッグの難しさ**：複数のチームメイトが同時作業すると、問題発生時の原因追跡が複雑になります。

4. **逐次処理には非効率**：依存関係が多い作業は結局直列処理になるため、チームを使う意味がありません。

5. **同一ファイル修正のリスク**：現時点ではファイルレベルのロックはサポートされていません。タスク設計で回避する必要があります。

6. **tmux環境が実質必須**：5チームを適切にモニタリングするにはtmuxがほぼ必須です。in-processモードでは限界があります。

## まとめ

Agent Teamsはまだ実験段階ですが、可能性は確実に感じられます。特にOpenClawのマルチエージェントアーキテクチャと組み合わせれば、チャネルレベルの自動化 + セッションレベルの並列協業という二重構造を実現できます。

ただし現時点で全ての作業にAgent Teamsを適用するのは非効率的です。**並列探索、コードレビュー、競合仮説の検証**のように独立した作業が多く、チームメイト間の議論が価値を生むシナリオに集中されることをお勧めします。

設定自体は30分あれば完了します。本当に難しいのは**どの作業をチームにまとめ、どうタスクを分解するか**という設計の問題です。その感覚は実際に使いながら磨いていくしかありません。
