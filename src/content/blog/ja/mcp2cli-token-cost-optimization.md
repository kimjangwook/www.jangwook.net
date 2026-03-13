---
title: mcp2cli — MCP トークンコストを96〜99%削減するCLIベースのツールディスカバリー
description: >-
  MCPサーバー連携では毎ターン全スキーマがインジェクションされ、120ツール・25ターンで362,000トークンが無駄になる。mcp2cliはCLIベースのオンデマンドディスカバリーでこのコストを96〜99%削減する。仕組み、実測値、導入戦略を解説する。
pubDate: '2026-03-12'
heroImage: ../../../assets/blog/mcp2cli-token-cost-optimization-hero.jpg
tags:
  - mcp
  - llm-cost
  - ai-agent
relatedPosts:
  - slug: mcp-servers-toolkit-introduction
    score: 0.95
    reason:
      ko: MCP 서버 연동의 기초를 다루며, mcp2cli 도입 전 필수 배경 지식을 제공합니다.
      ja: MCP サーバー連携の基礎を扱い、mcp2cli 導入前の必須背景知識を提供します。
      en: Covers MCP server integration basics, providing essential background before adopting mcp2cli.
      zh: 涵盖MCP服务器集成基础知识，是采用mcp2cli前的必读内容。
  - slug: mcp-code-execution-practical-implementation
    score: 0.92
    reason:
      ko: MCP 코드 실행 실전 구현 사례로, 토큰 최적화와 함께 읽으면 시너지가 높습니다.
      ja: MCP コード実行の実践実装事例で、トークン最適化と合わせて読むと相乗効果が高いです。
      en: Practical MCP code execution case study that pairs well with token optimization strategies.
      zh: MCP代码执行实践案例，与token优化策略结合阅读效果更佳。
  - slug: context-engineering-production-ai-agents
    score: 0.90
    reason:
      ko: 프로덕션 AI 에이전트의 컨텍스트 엔지니어링 전략으로, 토큰 관리의 큰 그림을 제공합니다.
      ja: プロダクション AI エージェントのコンテキストエンジニアリング戦略で、トークン管理の全体像を提供します。
      en: Context engineering strategies for production AI agents, offering the big picture of token management.
      zh: 生产AI代理的上下文工程策略，提供token管理的全局视图。
  - slug: deep-thinking-ratio-llm-cost-optimization
    score: 0.88
    reason:
      ko: LLM 비용 최적화의 다른 축인 추론 토큰 관리 전략을 다룹니다.
      ja: LLM コスト最適化の別の軸である推論トークン管理戦略を扱います。
      en: Addresses reasoning token management, another key axis of LLM cost optimization.
      zh: 涉及推理token管理策略，是LLM成本优化的另一重要维度。
  - slug: anthropic-code-execution-mcp
    score: 0.86
    reason:
      ko: Anthropic MCP 코드 실행 효율화 사례로, mcp2cli와 함께 MCP 최적화의 전체 그림을 완성합니다.
      ja: Anthropic MCP コード実行の効率化事例で、mcp2cli と合わせて MCP 最適化の全体像を完成させます。
      en: Anthropic MCP code execution efficiency case that completes the full picture of MCP optimization with mcp2cli.
      zh: Anthropic MCP代码执行效率案例，与mcp2cli共同构成MCP优化的完整图景。
---

## 概要

Model Context Protocol（MCP）がAIエージェントエコシステムの標準として定着する中、新たなボトルネックが浮上している。**ツールスキーマのトークン浪費**だ。

MCPサーバーを連携すると、毎会話ターンにすべてのツールのJSONスキーマがLLMのコンテキストウィンドウにインジェクションされる。そのターンにモデルが実際にツールを使うかどうかに関係なく。30ツールならターンあたり約3,600トークン、120ツール・25ターンの会話では362,000トークンがスキーマ注入だけに消費される。

**mcp2cli**はこの問題をCLIベースのオンデマンドディスカバリーで解決する。すべてのスキーマをプリロードする代わりに、モデルが必要な時だけ`--list`と`--help`を呼び出してツールを発見する構造に変え、トークン浪費を96〜99%削減する。

## 問題：毎ターン全スキーマ注入のコスト

### 従来のMCP連携方式

```
[会話開始]
システムプロンプト + 全ツールスキーマ (30ツール × 121トークン = 3,630トークン)
│
ターン1: ユーザーメッセージ + 全スキーマ再注入
ターン2: ユーザーメッセージ + 全スキーマ再注入
ターン3: ユーザーメッセージ + 全スキーマ再注入
...
ターン15: ユーザーメッセージ + 全スキーマ再注入
```

30ツール × 15ターン = **54,450トークン**がスキーマのみに消費される。そのターンにモデルがツールを呼び出したかどうかとは無関係に。

### 実測値（mcp2cli基準）

| シナリオ | ネイティブMCP | mcp2cli | 削減率 |
|---------|------------|---------|-------|
| 30ツール、15ターン | 54,525トークン | 2,309トークン | <strong>96%</strong> |
| 80ツール、20ターン | 193,240トークン | 3,871トークン | <strong>98%</strong> |
| 120ツール、25ターン | 362,350トークン | 5,181トークン | <strong>99%</strong> |
| 200エンドポイントAPI、25ターン | 358,425トークン | 3,925トークン | <strong>99%</strong> |

ツールが多く会話が長いほど削減効果が大きくなる。エンタープライズ規模のMCP環境では、コスト構造そのものが変わる。

## mcp2cliの仕組み

### コアアイデア：スキーマプリロード → オンデマンドディスカバリー

```
[従来方式]
全ツールスキーマ → 常にコンテキストに存在

[mcp2cli方式]
ツールリストのみ（16トークン/ツール）→ モデルが必要な時だけ --help 呼び出し（120トークン/ツール）
```

LLMは`mcp2cli --list`でツール名と簡単な説明のみを受け取り、実際にそのツールを使いたい時だけ`mcp2cli [tool-name] --help`を呼び出して詳細スキーマを確認する。

### 4段階処理パイプライン

```
1. スペックロード
   MCPサーバーURL / OpenAPIスペックファイル読み込み

2. ツール定義抽出
   スキーマからツール名、パラメーター、説明をパース

3. 引数パーサー生成
   各ツール用CLIコマンドを動的生成（コード生成なし、ランタイム）

4. 実行
   HTTPまたはtool-callリクエストとしてMCPサーバーに転送
```

### インストールと基本的な使い方

```bash
# インストール
pip install mcp2cli

# MCPサーバーのツール一覧確認（〜16トークン/ツール）
mcp2cli --mcp https://server.url/sse --list

# 特定ツールの詳細確認（〜120トークン、必要な時のみ）
mcp2cli --mcp https://server.url/sse search-files --help

# OpenAPIスペック利用
mcp2cli --spec api.json --base-url https://api.com list-items

# TOONフォーマット（Token-Optimized Output Notation）出力
mcp2cli --mcp https://server.url/sse search-files --toon
```

### ゼロコード生成の意義

mcp2cliはランタイムにスペックを読み込んでCLIを動的に生成する。コード生成がないということは：

- MCPサーバーに新しいツールが追加されると次の呼び出し時に自動で反映
- スペックファイルをコミットする必要がない
- 1時間TTLのインテリジェントキャッシングで不要な再ロードを防止

## EM/VPoE視点での導入戦略

### ビジネスインパクト試算

チームが100ツールのMCPを連携したAIエージェントを運用していると仮定する。

```
ネイティブMCP（1日1,000会話、平均20ターン）：
  100ツール × 121トークン × 20ターン × 1,000会話 = 242,000,000トークン/日

mcp2cli適用後（98%削減）：
  〜4,840,000トークン/日

差分：237,160,000トークン/日
Claude Sonnet 4.6基準（$3/MTok）：1日約$711、月約$21,000削減
```

この数値はLLMコストだけでなく、コンテキスト長と直結する**レイテンシーと品質**にも影響する。

### トレードオフの認識

mcp2cliは万能ではない。HNコミュニティが指摘した核心的な懸念：

**追加ラウンドトリップ**：モデルがツールを初めて使う時に`--help`を別途呼び出す必要があるため、短いタスクでは逆に遅くなる可能性がある。

**ディスカバリーエラーの可能性**：モデルが誤ったツール名を試みたり、`--help`の結果を誤解釈する可能性がある。

**最適な適用状況**：ツールが20個以上、会話ターンが10ターン以上で、毎ターンほとんどのツールが使われないシナリオ。

### 導入ロードマップ

```
ステップ1：計測
   現在のAIエージェントの実際のツールスキーマトークン消費量を測定
   （会話ログでシステムプロンプトのトークン数を確認）

ステップ2：パイロット
   最も多くのMCPツールを連携しているエージェント1つにmcp2cliを適用
   A/Bテスト：コスト、精度、レイテンシーを比較

ステップ3：分析
   実際によく使われるツールを分析
   頻繁に使うツールはプリロード、残りはオンデマンドのハイブリッド戦略を検討

ステップ4：拡張
   効果確認後、全エージェントに適用
```

## Hacker Newsコミュニティの反応

133アップボート、92コメントを獲得したこのツールへの反応は分かれた。

**肯定的反応**：
- 「レイジーローディングパターンをLLMツールディスカバリーに適用したのがエレガント」
- 「大規模MCP環境でのコスト削減がゲームチェンジャーになりうる」

**批判的反応**：
- 「トークン削減が実際により良い成果を保証しない」
- 「ツール発見に追加ラウンドトリップを使うとレイテンシーが増え、エラーの可能性が生じる」
- 「ベンチマークが理想的なシナリオに偏っている」

実務では、ベンチマークをそのまま信頼するよりも実際のワークロードで検証することが重要だ。

## 本番環境での考慮事項

### MCPサーバータイプ別互換性

```
✅ HTTP/SSE MCPサーバー：完全サポート
✅ stdio MCPサーバー：サポート
✅ OpenAPI JSON/YAML：サポート
⚠️  認証必要サーバー：OAuth内蔵サポート、設定が必要
```

### キャッシング戦略

```bash
# デフォルトキャッシング：1時間TTL
mcp2cli --mcp server.url --cache-ttl 3600 --list

# 強制更新
mcp2cli --mcp server.url --no-cache --list
```

スペックが頻繁に変わる開発環境では`--no-cache`、安定した本番環境ではTTLを長く設定するのが効率的だ。

## まとめ

mcp2cliが解決する問題はシンプルだが実質的だ。MCPエコシステムが成熟し、連携するサーバーとツールの数が増えるほど、スキーマ注入コストは線形ではなく指数的に増加する。

- <strong>30ツール</strong>：変更を検討しなくてもよい場合がある
- <strong>80ツール以上</strong>：月単位のコストが目に見えて変わってくる
- <strong>120ツール以上</strong>：コスト最適化ではなく、サバイバル戦略となる

トークン削減以上に、コンテキストウィンドウをクリーンに保つことはモデルの実際の推論品質にもプラスの影響を与える。コンテキストウィンドウを埋め尽くすノイズを減らすことが、プロンプトエンジニアリングと同じくらい重要な時代だ。

---

**参考資料**

- [mcp2cli GitHub](https://github.com/knowsuchagency/mcp2cli)
- [Show HN: mcp2cli — One CLI for every API, 96-99% fewer tokens](https://news.ycombinator.com/item?id=47305149)
- [Speakeasy: Reducing MCP token usage by 100x](https://www.speakeasy.com/blog/how-we-reduced-token-usage-by-100x-dynamic-toolsets-v2)
