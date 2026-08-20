# Chapter 2: 環境設定

Claude Codeを効果的に活用するためには、適切な開発環境構築が不可欠です。この章では、インストールから初期設定、そして生産性を最大化する推奨構成まで段階的に見ていきます。

---

## Recipe 2.1: インストールおよび認証

### 問題 (Problem)

Claude Codeを初めて使用しようとする開発者が正しくインストールし、API認証を完了する必要があります。誤ったインストールや認証エラーは、以降のすべての作業に影響を与えるため、最初のステップから正確に進める必要があります。

### 解決策 (Solution)

Claude Codeのインストールは大きく3つのステップで進めます:

1. **システム要件確認**
2. **CLIツールインストール**
3. **APIキー認証**

#### ステップ1: システム要件確認

Claude Codeを実行するための最小要件:

- **OS**: macOS、Linux、Windows (WSL2推奨)
- **Node.js**: v18.0.0以上
- **npm**: v9.0.0以上
- **ディスク容量**: 500MB以上 (キャッシュおよびモデルデータを含む)
- **ネットワーク**: 安定したインターネット接続 (API呼び出し)

Node.jsバージョン確認:

```bash
node --version
# v18.0.0以上である必要

npm --version
# v9.0.0以上である必要
```

バージョンが低い場合は、[nodejs.org](https://nodejs.org)からLTSバージョンをダウンロードしてインストールしてください。

#### ステップ2: Claude Code CLIインストール

npmを通じてグローバルにインストールします:

```bash
# グローバルインストール
npm install -g @anthropic-ai/claude-code

# インストール確認
claude --version
# 出力: claude-code/1.x.x
```

インストールが完了すると、ターミナルのどこからでも`claude`コマンドを使用できます。

**インストール問題解決**:

```bash
# 権限エラー発生時 (macOS/Linux)
sudo npm install -g @anthropic-ai/claude-code

# npmキャッシュクリア後再試行
npm cache clean --force
npm install -g @anthropic-ai/claude-code
```

#### ステップ3: APIキー認証

Anthropic APIキーを発行して環境変数で設定します。

**APIキー発行**:

1. [console.anthropic.com](https://console.anthropic.com)にアクセス
2. アカウント作成またはログイン
3. 'API Keys'メニューに移動
4. 'Create Key'ボタンをクリック
5. キー名を入力 (例: "claude-code-dev")
6. 生成されたキーをコピー (一度だけ表示されるので安全に保管)

**環境変数設定**:

macOS/Linuxの場合は`.bashrc`、`.zshrc`、または`.bash_profile`に追加:

```bash
# ~/.zshrcまたは~/.bashrc
export ANTHROPIC_API_KEY='sk-ant-api03-...'
```

変更を適用:

```bash
source ~/.zshrc  # または~/.bashrc
```

Windows (PowerShell)の場合:

```powershell
# システム環境変数として設定
[System.Environment]::SetEnvironmentVariable('ANTHROPIC_API_KEY', 'sk-ant-api03-...', 'User')
```

**認証確認**:

```bash
# 簡単なコマンドで認証テスト
claude auth check

# 出力例:
# ✓ API key is valid
# ✓ Connected to Anthropic API
# Model: claude-sonnet-4-5-20250929
```

### コード/例 (Code)

インストール全体のプロセスを1つのスクリプトで自動化できます:

```bash
#!/bin/bash
# install-claude-code.sh

echo "Claude Codeインストールスクリプト"
echo "======================================"

# 1. Node.jsバージョン確認
echo "\n[1/4] Node.jsバージョン確認..."
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js v18以上が必要です。現在: v$(node --version)"
    echo "https://nodejs.org から最新のLTSバージョンをインストールしてください。"
    exit 1
fi
echo "✓ Node.js $(node --version)"

# 2. Claude Codeインストール
echo "\n[2/4] Claude Codeインストール中..."
npm install -g @anthropic-ai/claude-code
if [ $? -ne 0 ]; then
    echo "❌ インストール失敗。sudo権限が必要な可能性があります。"
    exit 1
fi
echo "✓ Claude Code $(claude --version)"

# 3. APIキー入力
echo "\n[3/4] APIキー設定..."
echo "Anthropic APIキーを入力してください:"
read -s API_KEY

# 4. 環境変数設定 (zsh基準)
echo "\n[4/4] 環境変数設定中..."
echo "export ANTHROPIC_API_KEY='$API_KEY'" >> ~/.zshrc
source ~/.zshrc

# 5. 認証確認
echo "\nインストール完了! 認証確認中..."
claude auth check

echo "\n======================================"
echo "Claude Codeインストールが完了しました!"
echo "次のコマンドで開始してください: claude"
```

スクリプト実行:

```bash
chmod +x install-claude-code.sh
./install-claude-code.sh
```

### 説明 (Explanation)

**なぜグローバルインストールを使用するのか?**

Claude Codeはプロジェクト別ツールではなく<strong>システム全体で使用するCLIツール</strong>です。したがって`-g`フラグでグローバルインストールし、どのディレクトリからでも`claude`コマンドを使用できるようにします。

**環境変数を使用する理由**:

- <strong>セキュリティ</strong>: APIキーをコードにハードコーディングしない
- <strong>移植性</strong>: 異なる環境(開発/ステージング/プロダクション)で簡単に切り替え
- <strong>バージョン管理</strong>: `.gitignore`に環境変数ファイルを追加してキー漏洩防止

**APIキー管理推奨事項**:

1. <strong>絶対に公開リポジトリにコミットしない</strong>
2. `.env`ファイル使用時は`.gitignore`に追加
3. チーム協業時は`.env.example`ファイルでテンプレート提供
4. プロダクション環境ではCI/CDツールのシークレット管理機能を使用

### バリエーション (Variations)

#### バリエーション1: .envファイルを使用したキー管理

プロジェクトルートに`.env`ファイルを作成:

```bash
# .env
ANTHROPIC_API_KEY=sk-ant-api03-...
CLAUDE_MODEL=claude-sonnet-4-5-20250929
CLAUDE_TIMEOUT=120000
```

`.gitignore`に追加:

```bash
# .gitignore
.env
.env.local
.env.*.local
```

`.env.example`テンプレート提供:

```bash
# .env.example
ANTHROPIC_API_KEY=your_api_key_here
CLAUDE_MODEL=claude-sonnet-4-5-20250929
CLAUDE_TIMEOUT=120000
```

#### バリエーション2: 複数APIキー管理 (開発/プロダクション分離)

```bash
# ~/.zshrc
export ANTHROPIC_API_KEY_DEV='sk-ant-dev-...'
export ANTHROPIC_API_KEY_PROD='sk-ant-prod-...'

# 開発環境有効化
alias claude-dev='ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY_DEV claude'

# プロダクション環境有効化
alias claude-prod='ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY_PROD claude'
```

使用:

```bash
# 開発環境で実行
claude-dev

# プロダクション環境で実行
claude-prod
```

#### バリエーション3: Dockerコンテナ内インストール

プロジェクトをコンテナ化して一貫した環境を提供:

```dockerfile
# Dockerfile
FROM node:18-alpine

# Claude Codeインストール
RUN npm install -g @anthropic-ai/claude-code

# 環境変数設定 (ビルド時注入)
ARG ANTHROPIC_API_KEY
ENV ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY

# 作業ディレクトリ設定
WORKDIR /workspace

# エントリーポイント
ENTRYPOINT ["claude"]
```

ビルドおよび実行:

```bash
# イメージビルド
docker build --build-arg ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY -t claude-code .

# コンテナ実行
docker run -it -v $(pwd):/workspace claude-code
```

---

## Recipe 2.2: プロジェクト初期設定

### 問題 (Problem)

新しいプロジェクトでClaude Codeを使用するには、プロジェクト構造と設定ファイルを正しく構成する必要があります。基本設定だけではチーム協業、セキュリティ、パフォーマンス最適化の面で不十分な場合があります。

### 解決策 (Solution)

Claude Codeプロジェクトは次の構造で初期化します:

```
my-project/
├── .claude/
│   ├── settings.json          # プロジェクト設定
│   ├── settings.local.json    # ローカル環境設定 (git除外)
│   ├── agents/                # サブエージェント定義
│   ├── commands/              # スラッシュコマンド
│   ├── skills/                # 自動発見スキル
│   └── guidelines/            # ガイドライン文書
├── .gitignore
├── CLAUDE.md                  # プロジェクトコンテキスト文書
└── README.md
```

#### ステップ1: プロジェクト初期化

```bash
# プロジェクトディレクトリ作成および移動
mkdir my-project && cd my-project

# Gitリポジトリ初期化
git init

# Claude Code設定ディレクトリ作成
mkdir -p .claude/{agents,commands,skills,guidelines}
```

#### ステップ2: 基本設定ファイル作成

**`.claude/settings.json`** (バージョン管理に含む):

```json
{
  "version": "1.0",
  "project": {
    "name": "my-project",
    "description": "プロジェクトの説明"
  },
  "model": {
    "name": "claude-sonnet-4-5-20250929",
    "temperature": 0.7,
    "max_tokens": 4096
  },
  "safety": {
    "sandboxMode": true,
    "allowedCommands": [
      "npm",
      "node",
      "git",
      "ls",
      "cat",
      "grep"
    ],
    "blockedPaths": [
      ".env",
      "credentials.json",
      "secrets/"
    ]
  },
  "features": {
    "autoCommit": false,
    "codeReview": true,
    "typeCheck": true
  }
}
```

**`.claude/settings.local.json`** (ローカル環境、git除外):

```json
{
  "apiKey": "${ANTHROPIC_API_KEY}",
  "model": {
    "temperature": 0.5
  },
  "developer": {
    "debug": true,
    "verbose": true
  }
}
```

**`.gitignore`**:

```bash
# 環境変数
.env
.env.local
.env.*.local

# Claude Codeローカル設定
.claude/settings.local.json
.claude/cache/
.claude/.history

# Node.js
node_modules/
npm-debug.log
yarn-error.log

# IDE
.vscode/
.idea/
*.swp
*.swo

# ビルド結果
dist/
build/
.astro/
```

#### ステップ3: CLAUDE.md作成

プロジェクトのコンテキストを提供する核心文書:

```markdown
# CLAUDE.md

このファイルはClaude Codeがプロジェクトを理解するために使用されます。

## プロジェクト概要

簡単な説明: このプロジェクトは何をするのか?

## 技術スタック

- **言語**: TypeScript, JavaScript
- **フレームワーク**: Next.js 14
- **データベース**: PostgreSQL
- **デプロイ**: Vercel

## アーキテクチャ

- `src/app/` - Next.js App Routerページ
- `src/components/` - 再利用可能なReactコンポーネント
- `src/lib/` - ユーティリティおよびヘルパー関数
- `src/types/` - TypeScript型定義

## コマンド

\```bash
# 開発サーバー実行
npm run dev

# プロダクションビルド
npm run build

# 型チェック
npm run type-check

# テスト
npm test
\```

## コードスタイル

- ESLint + Prettier使用
- TypeScript strictモード有効化
- 関数型コンポーネント推奨
- Tailwind CSS使用

## ワークフロー

1. 機能ブランチ作成 (`git checkout -b feature/name`)
2. コード作成およびテスト
3. コミット前に型チェックおよびlint実行
4. Pull Request作成
5. コードレビュー後マージ

## 注意事項

- APIキーは絶対にコミットしない
- すべての外部API呼び出しはエラーハンドリングを含む
- 画像最適化必須 (next/image使用)
```

### コード/例 (Code)

初期化プロセス全体を自動化するスクリプト:

```bash
#!/bin/bash
# init-claude-project.sh

PROJECT_NAME=$1

if [ -z "$PROJECT_NAME" ]; then
    echo "使用法: ./init-claude-project.sh <プロジェクト名>"
    exit 1
fi

echo "Claude Codeプロジェクト初期化: $PROJECT_NAME"
echo "======================================"

# 1. プロジェクトディレクトリ作成
mkdir -p $PROJECT_NAME
cd $PROJECT_NAME

# 2. Git初期化
git init
echo "✓ Gitリポジトリ初期化"

# 3. Claudeディレクトリ構造生成
mkdir -p .claude/{agents,commands,skills,guidelines}
echo "✓ Claudeディレクトリ作成"

# 4. settings.json生成
cat > .claude/settings.json << 'EOF'
{
  "version": "1.0",
  "project": {
    "name": "PROJECT_NAME_PLACEHOLDER",
    "description": "プロジェクトの説明"
  },
  "model": {
    "name": "claude-sonnet-4-5-20250929",
    "temperature": 0.7,
    "max_tokens": 4096
  },
  "safety": {
    "sandboxMode": true,
    "allowedCommands": ["npm", "node", "git", "ls", "cat", "grep"],
    "blockedPaths": [".env", "credentials.json", "secrets/"]
  },
  "features": {
    "autoCommit": false,
    "codeReview": true,
    "typeCheck": true
  }
}
EOF
sed -i '' "s/PROJECT_NAME_PLACEHOLDER/$PROJECT_NAME/g" .claude/settings.json
echo "✓ settings.json生成"

# 5. settings.local.json生成
cat > .claude/settings.local.json << 'EOF'
{
  "apiKey": "${ANTHROPIC_API_KEY}",
  "developer": {
    "debug": true,
    "verbose": false
  }
}
EOF
echo "✓ settings.local.json生成"

# 6. .gitignore生成
cat > .gitignore << 'EOF'
.env
.env.local
.env.*.local
.claude/settings.local.json
.claude/cache/
.claude/.history
node_modules/
dist/
build/
.astro/
.vscode/
.idea/
*.swp
EOF
echo "✓ .gitignore生成"

# 7. CLAUDE.md生成
cat > CLAUDE.md << 'EOF'
# CLAUDE.md

## プロジェクト概要

このプロジェクトは...

## 技術スタック

- 言語: TypeScript
- フレームワーク: (追加必要)

## コマンド

\```bash
npm run dev    # 開発サーバー
npm run build  # ビルド
\```

## アーキテクチャ

(プロジェクト構造説明)

## コードスタイル

- ESLint + Prettier
- TypeScript strictモード
EOF
echo "✓ CLAUDE.md生成"

# 8. README.md生成
cat > README.md << EOF
# $PROJECT_NAME

プロジェクトの説明

## はじめに

\```bash
npm install
npm run dev
\```

## Claude Code使用

このプロジェクトはClaude Codeを使用します。\`CLAUDE.md\`を参照してください。
EOF
echo "✓ README.md生成"

# 9. 初期コミット
git add .
git commit -m "chore: initial Claude Code project setup"
echo "✓ 初期コミット完了"

echo "\n======================================"
echo "プロジェクト初期化完了!"
echo "cd $PROJECT_NAME && claudeコマンドで開始してください。"
```

使用:

```bash
chmod +x init-claude-project.sh
./init-claude-project.sh my-awesome-project
```

### 説明 (Explanation)

**CLAUDE.mdの役割**:

Claude Codeはプロジェクトルートの`CLAUDE.md`ファイルを自動的に読み込んで<strong>プロジェクトのコンテキスト</strong>を理解します。これは次のような利点を提供します:

1. <strong>正確なコード生成</strong>: プロジェクトのコードスタイル、アーキテクチャ、技術スタックを知っている
2. <strong>一貫した結果</strong>: チームメンバー間で同じコンテキストを共有
3. <strong>トークン節約</strong>: 毎回プロジェクト説明を繰り返す必要がない

**設定ファイル分離戦略**:

- <strong>settings.json</strong>: チーム全体が共有するプロジェクト設定 (バージョン管理を含む)
- <strong>settings.local.json</strong>: 個人開発者のローカル設定 (バージョン管理を除く)

これにより、APIキーやデバッグ設定などの個人情報は共有されず、プロジェクト標準設定はすべてのチームメンバーが同じように維持できます。

**サンドボックスモードの重要性**:

`sandboxMode: true`設定はClaude Codeが<strong>許可されたコマンドのみ実行</strong>するように制限します。これは次のようなリスクを防止します:

- 意図しないファイル削除 (`rm -rf`)
- システム設定変更
- 機密ファイルへのアクセス

### バリエーション (Variations)

#### バリエーション1: モノレポ構造

複数のパッケージを管理するモノレポの場合:

```
monorepo/
├── .claude/
│   ├── settings.json          # グローバル設定
│   └── ...
├── packages/
│   ├── web/
│   │   ├── .claude/
│   │   │   └── settings.json  # webパッケージ設定
│   │   └── CLAUDE.md
│   └── api/
│       ├── .claude/
│       │   └── settings.json  # apiパッケージ設定
│       └── CLAUDE.md
└── CLAUDE.md                  # モノレポ全体の説明
```

ルート`CLAUDE.md`:

```markdown
# モノレポプロジェクト

## 構造

- `packages/web/` - フロントエンド (Next.js)
- `packages/api/` - バックエンド (NestJS)

## パッケージ間の依存性

web → api (API呼び出し)

## 共通コマンド

\```bash
npm run build:all      # すべてのパッケージビルド
npm run test:all       # すべてのパッケージテスト
npm run dev:web        # webパッケージのみ実行
npm run dev:api        # apiパッケージのみ実行
\```
```

#### バリエーション2: 多言語プロジェクト

ブログのように多言語コンテンツを管理する場合:

```markdown
# CLAUDE.md

## 多言語対応

このプロジェクトは4つの言語をサポートします: 韓国語(ko)、英語(en)、日本語(ja)、中国語(zh)

### コンテンツ構造

\```
src/content/blog/
├── ko/post-name.md    # 韓国語
├── en/post-name.md    # 英語
├── ja/post-name.md    # 日本語
└── zh/post-name.md    # 中国語
\```

### ブログ投稿作成規則

1. すべての言語バージョンを同時に作成
2. ファイル名は同じに維持
3. pubDateは'YYYY-MM-DD'形式使用
4. heroImageはすべての言語バージョンで共有

### /write-postコマンド

ブログ投稿作成時は必ず4つの言語すべてを作成する必要がある。
```

---

## Recipe 2.3: 推奨構成オプション

### 問題 (Problem)

基本設定だけではプロジェクトの特性に合った最適化された開発環境を構築するのは難しいです。プロジェクトタイプ(Webアプリ、CLIツール、ライブラリなど)とチーム規模に応じて適切な設定調整が必要です。

### 解決策 (Solution)

Claude Codeの高度な設定オプションを活用して生産性を最大化します。

#### 1. モデル設定最適化

プロジェクト特性に応じたモデル選択:

```json
{
  "model": {
    "name": "claude-sonnet-4-5-20250929",
    "temperature": 0.7,
    "max_tokens": 4096,
    "top_p": 0.9
  }
}
```

<strong>モデル別用途</strong>:

| モデル | 用途 | temperature推奨値 |
|------|------|-------------------|
| Claude Opus 4.5 | 複雑なアーキテクチャ設計、リファクタリング | 0.5〜0.7 |
| Claude Sonnet 4.5 | 一般的なコード生成、バグ修正 | 0.7〜0.9 |
| Claude Haiku | 簡単な作業、速い応答が必要な時 | 0.8〜1.0 |

<strong>temperatureガイド</strong>:

- <strong>0.0〜0.3</strong>: 決定論的、一貫した出力 (テストコード、文書生成)
- <strong>0.4〜0.7</strong>: バランス的、創造的でありながら安定的 (一般コード作成)
- <strong>0.8〜1.0</strong>: 創造的、様々なソリューション探索 (アイディアブレインストーミング)

#### 2. 安全性および権限設定

**セキュリティ中心設定** (.claude/settings.json):

```json
{
  "safety": {
    "sandboxMode": true,
    "allowedCommands": [
      "npm",
      "node",
      "git status",
      "git diff",
      "git log",
      "ls",
      "cat",
      "grep",
      "find"
    ],
    "blockedCommands": [
      "rm -rf",
      "sudo",
      "chmod 777",
      "curl | sh"
    ],
    "blockedPaths": [
      ".env",
      ".env.local",
      "credentials.json",
      "secrets/",
      "private/",
      ".ssh/"
    ],
    "readOnlyPaths": [
      "node_modules/",
      "dist/",
      "build/"
    ],
    "maxFileSize": "10MB",
    "allowNetworkAccess": false
  }
}
```

**設定説明**:

- <strong>allowedCommands</strong>: 許可されたコマンドのみ実行 (ホワイトリスト方式)
- <strong>blockedCommands</strong>: 絶対に実行してはいけないコマンド (ブラックリスト)
- <strong>blockedPaths</strong>: アクセス禁止パス (機密情報保護)
- <strong>readOnlyPaths</strong>: 読み取りのみ可能なパス (依存フォルダなど)
- <strong>allowNetworkAccess</strong>: 外部ネットワークアクセス許可の有無

#### 3. 機能フラグ設定

プロジェクトワークフローに合わせた機能有効化:

```json
{
  "features": {
    "autoCommit": false,
    "codeReview": true,
    "typeCheck": true,
    "linting": true,
    "testing": true,
    "documentation": true,
    "i18n": {
      "enabled": true,
      "languages": ["ko", "en", "ja", "zh"],
      "defaultLanguage": "ko"
    },
    "mcp": {
      "enabled": true,
      "servers": ["context7", "brave-search", "playwright"]
    }
  }
}
```

<strong>機能別説明</strong>:

- <strong>autoCommit</strong>: 変更事項自動コミット (false推奨、明示的コミット誘導)
- <strong>codeReview</strong>: コード作成後に自動レビュー提案
- <strong>typeCheck</strong>: TypeScriptプロジェクトの場合は型チェック自動実行
- <strong>linting</strong>: ESLint自動実行
- <strong>testing</strong>: コード変更後に関連テスト自動実行
- <strong>documentation</strong>: JSDoc/TSDocコメント自動生成
- <strong>i18n</strong>: 多言語対応有効化
- <strong>mcp</strong>: Model Context Protocolサーバー統合

#### 4. パフォーマンス最適化設定

```json
{
  "performance": {
    "caching": {
      "enabled": true,
      "ttl": 3600,
      "maxSize": "500MB"
    },
    "parallelization": {
      "enabled": true,
      "maxConcurrency": 4
    },
    "timeout": {
      "default": 120000,
      "read": 30000,
      "write": 60000,
      "bash": 120000
    }
  }
}
```

<strong>設定最適化ティップス</strong>:

- <strong>caching.ttl</strong>: キャッシュ有効時間 (秒)。速く変わるプロジェクトは低く設定
- <strong>maxConcurrency</strong>: 並列作業数。CPUコア数に合わせて調整
- <strong>timeout</strong>: 作業別タイムアウト。複雑なビルドはより長く設定

### コード/例 (Code)

プロジェクトタイプ別推奨設定テンプレート:

#### Webアプリケーション (Next.js、Astroなど)

```json
{
  "version": "1.0",
  "project": {
    "name": "web-app",
    "type": "web-application",
    "framework": "nextjs"
  },
  "model": {
    "name": "claude-sonnet-4-5-20250929",
    "temperature": 0.7
  },
  "safety": {
    "sandboxMode": true,
    "allowedCommands": ["npm", "node", "git", "ls", "cat", "grep", "curl"],
    "blockedPaths": [".env", ".env.local", "credentials.json"]
  },
  "features": {
    "autoCommit": false,
    "codeReview": true,
    "typeCheck": true,
    "linting": true,
    "testing": true,
    "i18n": {
      "enabled": true,
      "languages": ["ko", "en"]
    },
    "mcp": {
      "enabled": true,
      "servers": ["playwright", "chrome-devtools"]
    }
  },
  "performance": {
    "timeout": {
      "default": 120000,
      "bash": 180000
    }
  }
}
```

#### CLIツール / ライブラリ

```json
{
  "version": "1.0",
  "project": {
    "name": "cli-tool",
    "type": "library",
    "language": "typescript"
  },
  "model": {
    "name": "claude-sonnet-4-5-20250929",
    "temperature": 0.5
  },
  "safety": {
    "sandboxMode": true,
    "allowedCommands": ["npm", "node", "git", "jest", "vitest"],
    "blockedPaths": [".npmrc", "secrets/"]
  },
  "features": {
    "autoCommit": false,
    "codeReview": true,
    "typeCheck": true,
    "testing": true,
    "documentation": true
  },
  "performance": {
    "caching": {
      "enabled": true,
      "ttl": 7200
    }
  }
}
```

#### データサイエンス / 機械学習

```json
{
  "version": "1.0",
  "project": {
    "name": "ml-project",
    "type": "data-science",
    "language": "python"
  },
  "model": {
    "name": "claude-opus-4-5-20251101",
    "temperature": 0.6
  },
  "safety": {
    "sandboxMode": true,
    "allowedCommands": ["python", "pip", "jupyter", "git", "ls"],
    "blockedPaths": ["data/raw/", "credentials/"]
  },
  "features": {
    "autoCommit": false,
    "codeReview": true,
    "documentation": true,
    "notebooks": {
      "enabled": true,
      "autosave": true
    }
  },
  "performance": {
    "timeout": {
      "default": 300000,
      "bash": 600000
    }
  }
}
```

### 説明 (Explanation)

**プロジェクトタイプ別最適化戦略**:

1. <strong>Webアプリケーション</strong>:
   - MCPサーバー(Playwright、Chrome DevTools)でブラウザ自動化
   - i18n有効化で多言語コンテンツ管理
   - タイムアウトを長く設定 (ビルド時間考慮)

2. <strong>CLIツール/ライブラリ</strong>:
   - documentation機能有効化 (公開API文書化重要)
   - 低いtemperature (一貫したコード生成)
   - キャッシングTTLを長く設定 (依存性変更少ない)

3. <strong>データサイエンス</strong>:
   - Opusモデル使用 (複雑な分析およびアルゴリズム)
   - 長いタイムアウト (データ処理時間考慮)
   - Jupyterノートブック対応

**パフォーマンス vs 安全性のバランス**:

- <strong>開発初期</strong>: サンドボックスゆるく、速い反復
- <strong>プロダクション準備</strong>: サンドボックス強化、徹底した検証
- <strong>チーム協業</strong>: 中間レベル、一貫したルール

### バリエーション (Variations)

#### バリエーション1: 環境別設定分離

開発/ステージング/プロダクション環境別設定:

```bash
.claude/
├── settings.json                # 共通設定
├── settings.development.json    # 開発環境
├── settings.staging.json        # ステージング環境
└── settings.production.json     # プロダクション環境
```

環境切り替え:

```bash
# 開発環境
export CLAUDE_ENV=development
claude

# プロダクション環境
export CLAUDE_ENV=production
claude
```

`settings.development.json`:

```json
{
  "extends": "./settings.json",
  "model": {
    "temperature": 0.9
  },
  "safety": {
    "sandboxMode": false
  },
  "developer": {
    "debug": true,
    "verbose": true
  }
}
```

`settings.production.json`:

```json
{
  "extends": "./settings.json",
  "model": {
    "temperature": 0.5
  },
  "safety": {
    "sandboxMode": true,
    "allowedCommands": ["git status", "git diff", "ls", "cat"]
  },
  "features": {
    "autoCommit": false
  }
}
```

#### バリエーション2: チーム規模別設定

**小規模チーム (1〜3人)**:

```json
{
  "safety": {
    "sandboxMode": false
  },
  "features": {
    "autoCommit": true,
    "codeReview": false
  }
}
```

**中規模チーム (4〜10人)**:

```json
{
  "safety": {
    "sandboxMode": true,
    "allowedCommands": ["npm", "git", "ls", "cat", "grep"]
  },
  "features": {
    "autoCommit": false,
    "codeReview": true,
    "linting": true
  }
}
```

**大規模チーム (10人以上)**:

```json
{
  "safety": {
    "sandboxMode": true,
    "allowedCommands": ["git status", "git diff", "ls", "cat"],
    "requireApproval": true
  },
  "features": {
    "autoCommit": false,
    "codeReview": true,
    "linting": true,
    "testing": true,
    "ciIntegration": true
  },
  "workflow": {
    "requirePullRequest": true,
    "requireCodeReview": 2,
    "branchProtection": ["main", "develop"]
  }
}
```

---

## 要約

この章では、Claude Code環境を完璧に構築する方法を段階的に見てきました:

1. <strong>Recipe 2.1 (インストールおよび認証)</strong>:
   - Node.js環境確認
   - npmを通じたグローバルインストール
   - APIキー発行および環境変数設定
   - 認証確認

2. <strong>Recipe 2.2 (プロジェクト初期設定)</strong>:
   - `.claude/`ディレクトリ構造生成
   - `settings.json`および`settings.local.json`作成
   - `CLAUDE.md`でプロジェクトコンテキスト提供
   - `.gitignore`設定で機密情報保護

3. <strong>Recipe 2.3 (推奨構成オプション)</strong>:
   - プロジェクトタイプ別モデルおよびtemperature最適化
   - サンドボックスモードと権限設定
   - 機能フラグ有効化
   - パフォーマンス最適化 (キャッシング、並列化、タイムアウト)

次の章では、このように構築された環境で<strong>基本使用法</strong>を学び、実践でClaude Codeを活用する方法を学習します。

---

**次の章のプレビュー**:

Chapter 3では、Claude Codeの核心機能である<strong>対話型コーディング</strong>、<strong>ファイル読み書き</strong>、<strong>Git統合</strong>を実習します。簡単なTODOアプリを最初から最後までClaude Codeと一緒に作りながら、実践ワークフローを体得します。
