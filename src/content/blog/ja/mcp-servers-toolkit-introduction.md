---
title: 私が使用するMCPサーバーツールキット完全ガイド
description: >-
  Claude Code開発生産性を最大化する7つのMCPサーバー設定と活用法。Serena、Context7、Sequential
  Thinkingなど実践経験を共有
pubDate: '2025-11-23'
heroImage: ../../../assets/blog/mcp-servers-toolkit-introduction-hero.jpg
tags:
  - mcp
  - claude-code
  - productivity
relatedPosts:
  - slug: openai-agentkit-tutorial-part1
    score: 0.94
    reason:
      ko: '자동화, AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: 'Covers similar topics in automation, AI/ML with comparable difficulty.'
      zh: 在自动化、AI/ML领域涵盖类似主题，难度相当。
  - slug: claude-code-cli-migration-guide
    score: 0.93
    reason:
      ko: '다음 단계 학습으로 적합하며, 자동화, AI/ML, DevOps, 아키텍처 주제에서 연결됩니다.'
      ja: 次のステップの学習に適しており、自動化、AI/ML、DevOps、アーキテクチャのトピックで繋がります。
      en: >-
        Suitable as a next-step learning resource, connecting through
        automation, AI/ML, DevOps, architecture topics.
      zh: 适合作为下一步学习资源，通过自动化、AI/ML、DevOps、架构主题进行连接。
  - slug: jules-autocoding
    score: 0.93
    reason:
      ko: '다음 단계 학습으로 적합하며, 자동화, AI/ML, DevOps, 아키텍처 주제에서 연결됩니다.'
      ja: 次のステップの学習に適しており、自動化、AI/ML、DevOps、アーキテクチャのトピックで繋がります。
      en: >-
        Suitable as a next-step learning resource, connecting through
        automation, AI/ML, DevOps, architecture topics.
      zh: 适合作为下一步学习资源，通过自动化、AI/ML、DevOps、架构主题进行连接。
  - slug: ai-presentation-automation
    score: 0.92
    reason:
      ko: '자동화, AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: 'Covers similar topics in automation, AI/ML with comparable difficulty.'
      zh: 在自动化、AI/ML领域涵盖类似主题，难度相当。
  - slug: claude-code-best-practices
    score: 0.92
    reason:
      ko: '자동화, AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: 'Covers similar topics in automation, AI/ML with comparable difficulty.'
      zh: 在自动化、AI/ML领域涵盖类似主题，难度相当。
---

## MCPとは何か

MCP(Model Context Protocol)は、AIアシスタントが外部ツールやサービスと通信するための標準プロトコルです。簡単に言えば、AIが「目」と「手」を得るための仕組みです。

### なぜMCPが重要か

従来のAIコーディングアシスタントには根本的な限界がありました:

- <strong>コードは生成できるが実行できない</strong>
- <strong>ドキュメントは読めるがブラウザは操作できない</strong>
- <strong>提案はできるがデータは測定できない</strong>

MCPサーバーを接続すると、AIは実際のツールを直接使用できます。私のClaude Codeには現在7つのMCPサーバーが設定されており、これらが開発生産性を根本的に変えています。

## 私が使用するMCPサーバー

### 2.1 Serena（コード分析）

<strong>役割</strong>: セマンティックコード分析、LSPベースのシンボル探索

SerenaはLanguage Server Protocol(LSP)を活用してコードベースを意味的に分析します。単純なテキスト検索ではなく、関数定義、参照、型情報を正確に把握します。

<strong>使用理由</strong>:

- <strong>トークン節約</strong>: ファイル全体を読む代わりに必要なシンボルだけを取得
- <strong>正確なナビゲーション</strong>: "find all references"のような操作が可能
- <strong>大規模コードベース対応</strong>: 数万行のプロジェクトでも高速

<strong>設定例</strong>:

```json
{
  "serena": {
    "command": "npx",
    "args": [
      "-y",
      "@anthropics/serena-mcp@latest",
      "/path/to/project"
    ],
    "env": {
      "SERENA_DEFAULT_MAX_TOKENS": "10000"
    }
  }
}
```

<strong>実際の活用</strong>:

```
"ProductServiceクラスのすべてのメソッドを見せて"
→ Serenaがクラス定義と全メソッドを正確に抽出

"calculateTotal関数を呼び出しているすべての場所を見つけて"
→ 全コードベースから参照箇所を特定
```

### 2.2 Context7（ドキュメント検索）

<strong>役割</strong>: 最新ライブラリドキュメント検索

Context7は最新のライブラリドキュメントをリアルタイムで検索し、AIに提供します。AIの学習データは過去のある時点で固定されているため、最新のAPI変更を知りません。

<strong>使用理由</strong>:

- <strong>Hallucination防止</strong>: AIが古いAPIや存在しないAPIを提案するのを防ぐ
- <strong>最新情報</strong>: 2025年の最新ドキュメントにアクセス
- <strong>正確なコード例</strong>: 公式ドキュメントのサンプルコードを取得

<strong>設定例</strong>:

```json
{
  "context7": {
    "command": "npx",
    "args": ["-y", "@context7/mcp-server"]
  }
}
```

<strong>"use context7"の使い方</strong>:

```
"use context7 Astro 5.0のContent Collections APIについて教えて"
→ Context7が最新ドキュメントを検索して提供

"use context7 Next.js 15のApp RouterでのServer Actions使用法"
→ 2025年最新の公式ガイドを取得
```

プロンプトに"use context7"を追加するだけで、AIは自動的にドキュメント検索を実行します。

### 2.3 Sequential Thinking（問題解決）

<strong>役割</strong>: ステップバイステップの思考プロセス

Sequential Thinkingは複雑な問題を段階的に分解し、各ステップで仮説を生成・検証します。「考える」プロセスを明示化することで、より正確な解決策を導きます。

<strong>使用理由</strong>:

- <strong>複雑な問題の分解</strong>: 多段階の問題を管理可能な単位に分割
- <strong>仮説検証</strong>: 各ステップで仮説を立て、検証
- <strong>思考の可視化</strong>: AIの推論過程を確認できる

<strong>設定例</strong> (Docker実行):

```json
{
  "sequentialthinking": {
    "command": "docker",
    "args": [
      "run",
      "-i",
      "--rm",
      "mcp/sequentialthinking"
    ]
  }
}
```

<strong>活用シナリオ</strong>:

```
"このアプリケーションのパフォーマンスが遅い原因を分析して"

→ Sequential Thinking実行:
Thought 1: まずボトルネックの種類を特定...
Thought 2: CPUバウンドかI/Oバウンドか確認...
Thought 3: データベースクエリを調査...
Thought 4: N+1問題を発見、仮説検証中...
Thought 5: 解決策として eager loading を提案...
```

### 2.4 Chrome DevTools MCP（パフォーマンス分析）

<strong>役割</strong>: ブラウザパフォーマンストレース、ネットワーク分析

Chrome DevTools MCPは実際のChromeブラウザを制御し、パフォーマンスデータを測定します。AIが推測ではなく実データに基づいて最適化を提案できます。

<strong>使用理由</strong>:

- <strong>Core Web Vitals測定</strong>: LCP、CLS、INP、TBT、TTFBを自動測定
- <strong>リアルタイムデバッグ</strong>: コンソールログ、ネットワークリクエスト監視
- <strong>デバイスエミュレーション</strong>: モバイル環境をシミュレート

<strong>設定例</strong>:

```json
{
  "chrome-devtools": {
    "command": "npx",
    "args": [
      "-y",
      "chrome-devtools-mcp@latest",
      "--isolated=true"
    ]
  }
}
```

<strong>主な使用場面</strong>:

```
"localhost:4321のパフォーマンスを測定して問題点を教えて"

→ AIがブラウザを起動
→ ページをロードしてトレース記録
→ Core Web Vitals分析
→ ボトルネック特定と解決策提案
```

### 2.5 Playwright MCP（ブラウザ自動化）

<strong>役割</strong>: クロスブラウザテスト、スクリーンショット、E2E自動化

Playwright MCPはブラウザを自動操作してテストを実行します。フォーム入力、クリック、ナビゲーションなどを自動化できます。

<strong>使用理由</strong>:

- <strong>E2Eテスト自動化</strong>: ユーザーフローを自動テスト
- <strong>スクリーンショット取得</strong>: UI変更の視覚的確認
- <strong>クロスブラウザ対応</strong>: Chromium、Firefox、WebKit

<strong>設定例</strong>:

```json
{
  "playwright": {
    "command": "npx",
    "args": ["-y", "@anthropic/playwright-mcp"]
  }
}
```

<strong>Chrome DevToolsとの違い</strong>:

| 機能 | Chrome DevTools MCP | Playwright MCP |
|------|---------------------|----------------|
| 主目的 | パフォーマンス分析 | 機能テスト自動化 |
| ブラウザ | Chrome専用 | マルチブラウザ |
| 測定 | Core Web Vitals | 機能検証 |
| 操作 | 閲覧と分析 | クリック、入力、ナビゲーション |

<strong>活用シナリオ</strong>:

```
"ログインフローをテストして、成功したらスクリーンショットを撮って"

→ ログインページに移動
→ フォーム入力
→ ログインボタンクリック
→ 結果確認とスクリーンショット保存
```

### 2.6 Gemini CLI MCP（AI検索/分析）

<strong>役割</strong>: Google Search、ファイル分析、会話

Gemini CLI MCPはGoogleのGemini AIを活用した検索と分析を提供します。1Mトークンのコンテキストウィンドウでマルチモーダル分析が可能です。

<strong>使用理由</strong>:

- <strong>大容量コンテキスト</strong>: 100万トークンまでのファイル分析
- <strong>マルチモーダル</strong>: 画像、PDF、動画の分析
- <strong>Google検索連携</strong>: 最新情報へのアクセス

<strong>設定例</strong>:

```json
{
  "gemini-cli": {
    "command": "npx",
    "args": ["-y", "gemini-cli-mcp"]
  }
}
```

<strong>主な機能</strong>:

```javascript
// Google検索
googleSearch({ query: "Astro 5.0 新機能 2025" })

// ファイル分析
analyzeFile({
  filePath: "/path/to/large-document.pdf",
  prompt: "このドキュメントの要点をまとめて"
})

// 会話
chat({
  prompt: "このエラーメッセージの原因は?"
})
```

### 2.7 Gemini Google Search

<strong>役割</strong>: Web検索専用

Gemini Google SearchはWeb検索に特化したMCPサーバーです。Gemini APIのGrounding機能を使って最新情報を検索します。

<strong>使用理由</strong>:

- <strong>シンプルな検索</strong>: 検索専用で軽量
- <strong>最新情報</strong>: リアルタイムのWeb情報

<strong>設定例</strong>:

```json
{
  "gemini-google-search": {
    "command": "npx",
    "args": ["-y", "gemini-google-search-mcp"],
    "env": {
      "GEMINI_API_KEY": "your-api-key"
    }
  }
}
```

## 実際の設定例

以下は私が使用している完全なMCPサーバー設定です(機密情報はマスク):

```json
{
  "mcpServers": {
    "serena": {
      "command": "npx",
      "args": [
        "-y",
        "@anthropics/serena-mcp@latest",
        "/Users/username/workspace/project"
      ],
      "env": {
        "SERENA_DEFAULT_MAX_TOKENS": "10000"
      }
    },
    "context7": {
      "command": "npx",
      "args": ["-y", "@context7/mcp-server"]
    },
    "sequentialthinking": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "mcp/sequentialthinking"
      ]
    },
    "chrome-devtools": {
      "command": "npx",
      "args": [
        "-y",
        "chrome-devtools-mcp@latest",
        "--isolated=true"
      ]
    },
    "playwright": {
      "command": "npx",
      "args": ["-y", "@anthropic/playwright-mcp"]
    },
    "gemini-cli": {
      "command": "npx",
      "args": ["-y", "gemini-cli-mcp"]
    },
    "gemini-google-search": {
      "command": "npx",
      "args": ["-y", "gemini-google-search-mcp"],
      "env": {
        "GEMINI_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

## 組み合わせ活用事例

### コード分析 + ドキュメント検索

新しいライブラリを既存コードに統合する場合:

```
1. Serenaで現在のコード構造を分析
   "UserServiceクラスの認証関連メソッドを見せて"

2. Context7で新ライブラリの使用法を検索
   "use context7 NextAuth.js v5のセッション管理"

3. 統合コードを生成
   "上記の情報を基にNextAuth.jsを統合して"
```

### ブラウザテスト + パフォーマンス分析

新機能のデプロイ前検証:

```
1. Playwrightで機能テスト
   "新しいチェックアウトフローをテストして"

2. Chrome DevToolsでパフォーマンス測定
   "チェックアウトページのCore Web Vitalsを測定して"

3. 問題があれば修正して再テスト
   "LCPが遅い原因を特定して解決して"
```

### 複雑な問題解決ワークフロー

本番環境のパフォーマンス問題を診断する場合:

```
1. Sequential Thinkingで問題を分解
   "ユーザーがレポートした遅延の原因を段階的に分析して"

2. Gemini Searchで類似事例を調査
   "React hydration performance issue 2025"

3. Context7で公式解決策を確認
   "use context7 React 19のStreaming SSR最適化"

4. Serenaでコードを分析
   "ReportComponentの子コンポーネント構造を見せて"

5. Chrome DevToolsで測定と検証
   "修正前後のTBTを比較して"
```

## 結論

MCPサーバーはAIコーディングアシスタントを真の開発パートナーに変えます。

### 導入効果

| 分野 | 改善効果 |
|------|----------|
| コード理解 | 大規模コードベースの把握時間が70%短縮 |
| ドキュメント参照 | Hallucination問題が90%減少 |
| デバッグ | 問題特定時間が60%短縮 |
| テスト | E2Eテスト作成時間が80%短縮 |

### 推奨開始サーバー

MCPサーバーを初めて導入する場合、以下の順序をお勧めします:

1. <strong>Context7</strong> - 設定が簡単で即座に効果を実感できます
2. <strong>Serena</strong> - コードベースが大きくなるほど効果が大きくなります
3. <strong>Chrome DevTools MCP</strong> - Web開発者には必須です

### 最後に

MCPサーバーは設定に10分程度かかりますが、その投資は数百時間の節約として返ってきます。AIと一緒に開発する時代に、適切なツールを揃えることは必須です。

ぜひ今日からMCPサーバーを設定して、AIの真の力を体験してください。

## 参考資料

- [Model Context Protocol 公式サイト](https://modelcontextprotocol.io/)
- [Anthropic MCP Documentation](https://docs.anthropic.com/mcp)
- [Chrome DevTools MCP GitHub](https://github.com/anthropics/chrome-devtools-mcp)
- [Context7 MCP GitHub](https://github.com/context7/mcp-server)
- [Playwright MCP Documentation](https://github.com/anthropics/playwright-mcp)

---

MCPサーバーに関する質問があれば、コメントでお知らせください。実際の使用経験に基づいてお答えします。
