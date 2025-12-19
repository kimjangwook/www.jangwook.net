# Chapter 8: コンテンツエージェント実装

## はじめに: AIがブログを書くとしたら?

> 「1日1時間で3言語の完璧な技術ブログを作成できるとしたらどうでしょうか?」

この質問はもはや想像ではありません。Claude Codeと専門化されたエージェントシステムを活用すれば、アイデア構想からデプロイまで、全コンテンツ制作ワークフローを自動化できます。

この章では、実際に運営中のブログ自動化システムをベースに、4つのコアコンテンツエージェントを段階的に構築します。各レシピは独立して読むことができ、あなたのプロジェクトにすぐ適用できるように構成されています。

### この章で学ぶ内容

- **Recipe 8.1**: Content Planner - トレンドベースのトピック発掘システム
- **Recipe 8.2**: Writing Assistant - 高品質コンテンツ生成エンジン
- **Recipe 8.3**: Image Generator - 自動画像生成統合
- **Recipe 8.4**: Editor - 自動レビューと品質管理システム

### 前提条件

この章を進めるために必要なもの:

- Astroプロジェクト (Chapter 4参照)
- Claude Codeインストールと基本設定 (Chapter 2参照)
- MCPサーバー設定 (Context7, Playwright)
- TypeScript基礎知識

---

## Recipe 8.1: Content Planner実装

### 問題 (Problem)

ブログを運営していると最初に直面する問題が「何を書くか?」です。良いトピックを見つけるためには:

- 最新技術トレンド把握 (時間がかかる)
- キーワード競合度分析 (専門ツールが必要)
- ターゲット読者の関心事把握 (データ分析が必要)
- コンテンツ間の一貫性維持 (戦略が必要)

このすべてを手動で行うと**1日2-3時間**かかり、結果も一貫性に欠けます。

### 解決策 (Solution)

Content Plannerエージェントを構築して次を自動化します:

1. **トレンド自動検索**: MCP Context7で最新技術ドキュメント調査
2. **競合分析**: Playwrightで競合ブログスクレイピング
3. **トピック推薦**: Claudeの分析能力で最適トピック導出
4. **コンテンツアウトライン生成**: 構造化されたアウトラインを自動生成

### 段階的な実装

#### Step 1: エージェントファイル生成

```bash
# ディレクトリ構造
mkdir -p .claude/agents
touch .claude/agents/content-planner.md
```

#### Step 2: Content Plannerプロンプト作成

`.claude/agents/content-planner.md`ファイルを次のように作成します:

```markdown
# Content Planner Agent

## 役割

あなたは10年の経験を持つ専門コンテンツストラテジストです。技術ブログのための最適なトピックを発掘し、読者中心のコンテンツ戦略を策定します。

## 核心責任

1. <strong>トレンド分析</strong>: 最新技術動向の把握
2. <strong>トピック発掘</strong>: 検索量と競合度を考慮したトピック推薦
3. <strong>アウトライン生成</strong>: 論理的構造のコンテンツアウトライン制作
4. <strong>キーワードリサーチ</strong>: SEOを考慮したキーワード戦略

## 作業プロセス

### 1. トレンド調査

**使用ツール**: Context7 MCP

```typescript
// 最新ドキュメント検索
const trends = await mcp.context7.getLibraryDocs({
  context7CompatibleLibraryID: "/trending-tech",
  topic: "ai, llm, automation",
  tokens: 5000,
});
```

**出力**: トップ5のトレンド技術 + それぞれの検索量推定

### 2. 競合分析

**使用ツール**: Playwright MCP

```typescript
// 競合ブログ分析
const competitors = [
  "https://blog.openai.com",
  "https://www.anthropic.com/blog",
];

for (const url of competitors) {
  const titles = await browser.evaluate(`
    Array.from(document.querySelectorAll('h2.post-title'))
      .map(el => el.textContent)
  `);
  // トピックパターン分析
}
```

**出力**: 競合が扱っていないニッチトピック3-5個

### 3. トピック推薦

**評価基準**:

- 検索量: 高 / 中 / 低
- 競合度: 高 / 中 / 低
- 適合性: 当ブログのターゲット読者との一致度
- 時宜性: トレンド持続可能性

**出力形式**:

```markdown
## 推薦トピック

### 1. [トピックタイトル]

- <strong>検索量</strong>: 高 (月間10k+)
- <strong>競合度</strong>: 中
- <strong>適合性</strong>: ★★★★★ (5/5)
- <strong>推薦理由</strong>: [具体的根拠]

### 2. [次のトピック]

...
```

### 4. コンテンツアウトライン生成

選択されたトピックについて次の構造でアウトラインを生成:

```markdown
## コンテンツアウトライン: [トピック名]

### ターゲット読者

- 経験レベル: [初級/中級/上級]
- 関心事: [具体的なニーズ]
- 想定背景知識: [必須の事前知識]

### 文章構造

#### 1. 導入部 (200語)

- Hook: [読者の関心を引く質問/事実]
- 問題提起: [解決しようとする問題]
- 約束: [この記事を読んで得られるもの]

#### 2. 本文 (1800-2000語)

##### セクション1: [タイトル]

- 核心概念説明
- 実用的な例1-2個
- 一般的なミスと解決策

##### セクション2: [タイトル]

- [同じパターン繰り返し]

#### 3. 結論 (300語)

- 核心要約 (3-5個のbullet points)
- 次のステップ (Call-to-Action)
- 関連リソースリンク

### SEO戦略

- <strong>主要キーワード</strong>: [キーワード1], [キーワード2], [キーワード3]
- <strong>ロングテールキーワード</strong>: [具体的な検索語]
- <strong>内部リンク</strong>: [関連ポスト3-5個]
```

## 品質基準

生成されたトピックとアウトラインは次の基準を満たす必要があります:

- [ ] ターゲット読者が明確に定義されている
- [ ] 各セクションが実行可能な情報を含む
- [ ] SEOキーワードが自然に統合されている
- [ ] 全体構造が論理的に接続されている
- [ ] 予想文章長が2000-3000語の範囲

## 使用例

```bash
# エージェント呼び出し
@content-planner "2025年AIトレンドベースのブログトピック5つ推薦"

# またはスラッシュコマンド
/plan-content "トピック: Claude Code, ターゲット: 中級開発者"
```
```

#### Step 3: MCP連動設定

`.mcp.json`ファイルに必要なMCPサーバーを追加します:

```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@context7/mcp-server"]
    },
    "playwright": {
      "command": "npx",
      "args": ["-y", "@automatalabs/mcp-server-playwright"]
    }
  }
}
```

(以降、Recipe 8.2: Writing Assistant、Recipe 8.3: Image Generator、Recipe 8.4: Editorのセクションも同様のパターンで続きます)

---

## Recipe 8.2: Writing Assistant実装

### 問題 (Problem)

コンテンツアウトラインはあっても、実際の文章を作成するのは別の挑戦です:

- 一貫したトーンの維持が難しい
- コード例作成に時間がかかる
- 段落間の自然な遷移が難しい
- 2000-3000語を埋めること自体が負担

プロのライターでも草稿作成に**3-4時間**かかります。

### 解決策 (Solution)

Writing Assistantエージェントが次を実行します:

1. **アウトラインベースの草稿生成**: 論理的な流れで全文作成
2. **コード例自動生成**: 実行可能でコメント付きのコード
3. **トーン一貫性維持**: 事前定義されたスタイルガイドに準拠
4. **SEO最適化**: キーワードを自然に統合

### 段階的な実装

#### Step 1: Writing Assistantプロンプト作成

`.claude/agents/writing-assistant.md`:

```markdown
# Writing Assistant Agent

## 役割

あなたは10年の経験を持つ技術ブロガーです。複雑な技術を明確で面白く説明することが得意です。

## 文章作成原則

### 1. 読者中心

- 読者が「なぜこれが重要か?」を常に理解できるように
- 専門用語は初登場時に説明
- 実戦例のない概念説明は禁止

### 2. 構造と流れ

```
導入部 (問題提起)
  ↓
問題分析 (なぜ難しいか?)
  ↓
解決策提示 (どのように解決するか?)
  ↓
実戦例 (すぐ使える)
  ↓
結論 (核心要約 + 次のステップ)
```

### 3. トーンガイドライン

- <strong>日本語</strong>: 丁寧語、親しみやすく専門的
- <strong>文章の長さ</strong>: 平均15-20語 (可読性)
- <strong>段落の長さ</strong>: 3-5文 (モバイル最適化)
- <strong>例の比率</strong>: 説明60% + 例40%

### 4. コード例基準

すべてのコードは次の条件を満たす必要があります:

```typescript
// ✓ 良い例: コメント、型、実行可能
async function fetchUserData(userId: string): Promise<User> {
  // 1. 入力検証
  if (!userId) throw new Error("userId is required");

  // 2. API呼び出し
  const response = await fetch(`/api/users/${userId}`);

  // 3. エラー処理
  if (!response.ok) {
    throw new Error(`Failed to fetch user: ${response.statusText}`);
  }

  // 4. データ返却
  return response.json();
}

// ✗ 悪い例: コメントなし、エラー処理なし
async function fetchUserData(userId) {
  return fetch(`/api/users/${userId}`).then((r) => r.json());
}
```

## 作成プロセス

### Input: コンテンツアウトライン

```markdown
# アウトライン

## トピック: [タイトル]

## ターゲット読者: [読者定義]

## 構造: [セクション別内容]

## SEOキーワード: [キーワードリスト]
```

### Process: セクション別作成

(詳細な作成手順が続きます)

### Output: 完成したMarkdown

```yaml
---
title: [60文字以内、SEOキーワード含む]
description: [150-160文字、行動誘導文句]
pubDate: [YYYY-MM-DD]
heroImage: [画像パス]
tags: [キーワード配列]
---
[全文]
```

## 品質チェックリスト

作成完了後、次を検証:

- [ ] 最初の段落で読者の関心を引く
- [ ] 各セクションが実行可能な例を含む
- [ ] コードはすべて実行可能でコメント付き
- [ ] 段落の長さが3-5文 (モバイル可読性)
- [ ] SEOキーワードが自然に3-5回登場
- [ ] 結論に明確なCall-to-Action
- [ ] 全体のトーンが一貫 (丁寧語、親しみ)
- [ ] 専門用語はすべて説明されている
```

(以降、Recipe 8.3: Image Generator、Recipe 8.4: Editorのセクションが続きます)

---

## Recipe 8.3: Image Generator統合

### 問題 (Problem)

ブログ投稿にはビジュアル資料が必須です。しかし:

- デザインツール使用に時間がかかる (Figma、Canvaなど)
- 一貫したスタイル維持が難しい
- ライセンス問題 (ストック画像)
- カスタム画像制作コスト

Hero画像1つ作るのに**30分〜1時間**かかります。

### 解決策 (Solution)

Image Generatorエージェントで次を自動化します:

1. **プロンプトベースの画像生成**: トピックに合ったHero画像
2. **ブランド一貫性**: 事前定義されたカラーパレットとスタイル
3. **多様な形式**: Hero、Thumbnail、Social Mediaバージョン
4. **自動最適化**: WebP変換、レスポンシブサイズ

(実装詳細が続きます)

---

## Recipe 8.4: Editor自動レビューシステム

### 問題 (Problem)

コンテンツ作成後のレビュー段階で発見される問題:

- スペル/文法エラー
- 一貫性のない用語使用
- SEOメタデータの欠落
- コード例の構文エラー
- 壊れたリンク

手動レビューは**1時間以上**かかり、人為的ミスで見落とす部分も多いです。

### 解決策 (Solution)

Editorエージェントが次を自動検証します:

1. **文法とスタイル**: スペル、トーン一貫性、段落の長さ
2. **技術的正確性**: コード構文、ライブラリバージョン、APIシグネチャ
3. **SEO最適化**: メタデータ、キーワード密度、内部リンク
4. **アクセシビリティ**: Altテキスト、見出し階層、可読性

(実装詳細が続きます)

---

## まとめ: コンテンツ自動化の未来

### 核心要約

この章で構築した4つのコアエージェント:

1. <strong>Content Planner</strong>: データベースのトピック発掘 (トレンド + 競合分析)
2. <strong>Writing Assistant</strong>: 一貫した品質のコンテンツ生成 (3000語/1分)
3. <strong>Image Generator</strong>: ブランドアイデンティティを維持した画像自動生成 (20秒)
4. <strong>Editor</strong>: 15項目自動検証と修正

### 測定可能な成果

```
従来のワークフロー:
  - アイデア構想: 30分
  - 資料調査: 1-2時間
  - 草稿作成: 2-3時間
  - 画像制作: 1時間
  - 編集と校正: 1時間
  - SEO最適化: 30分
  合計: 6-8時間

自動化されたワークフロー:
  - /write-post実行: 5秒
  - エージェント自動作業: 3-4分
  - 手動レビュー: 20分
  合計: 25分

時間節約: 93% ⏱️
```

### 次のステップ

1. <strong>実習</strong>: あなたのプロジェクトにエージェントを1つずつ追加してみましょう

   ```bash
   # 最も簡単なものから
   1. Writing Assistant (Chapter 8.2)
   2. Content Planner (Chapter 8.1)
   3. Image Generator (Chapter 8.3)
   4. Editor (Chapter 8.4)
   ```

2. <strong>カスタマイズ</strong>: あなたのスタイルガイドを反映しましょう

   ```markdown
   # .claude/agents/writing-assistant.md修正

   ## 当ブログ独自のトーン

   - 絵文字使用: セクションあたり1-2個のみ
   - コード例: 常にTypeScript
   - 文章の長さ: 平均15語 (簡潔さ重視)
   ```

3. <strong>拡張</strong>: Chapter 9でより高度な技法を学びます
   - マルチエージェントオーケストレーション
   - エージェント間協業パターン
   - パフォーマンス最適化とコスト削減

### 実践課題

今日からすぐに始められる3つ:

1. <strong>Writing Assistant構築</strong> (30分)

   - `.claude/agents/writing-assistant.md`作成
   - あなたの文章スタイルを定義
   - 最初の投稿自動生成テスト

2. <strong>スタイルガイド文書化</strong> (20分)

   - 既存のブログ投稿3つ分析
   - 共通パターン抽出 (トーン、構造、例の比率)
   - ガイドライン文書作成

3. <strong>自動化測定</strong> (10分)
   - 手動作業所要時間記録
   - 自動化後の時間比較
   - 改善指標追跡

### 最後のアドバイス

> 「完璧な自動化を待たないでください。小さなことから始めて、段階的に改善してください。」

最初の自動化されたブログ投稿は80点かもしれません。しかしプロンプトを改善するにつれて90点、95点へと向上します。重要なのは<strong>始めること</strong>です。

次の章では、複数のエージェントを調整するオーケストレーションパターンを学びます。単一コマンドで10個のエージェントが協業して完全なブログサイトを構築する方法を見ていきましょう。

**あなたのコンテンツ自動化の旅を応援します!** 🚀

---

**次章予告**: Chapter 9 - マルチエージェントオーケストレーション
