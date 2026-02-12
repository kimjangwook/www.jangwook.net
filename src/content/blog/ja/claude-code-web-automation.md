---
title: 'Claude Codeを活用した大規模Webサイトページ自動生成: パーツライブラリとSubAgent並列処理'
description: >-
  31個のHTMLページをパーツライブラリベースで自動生成した実践事例を共有します。CSVメタデータ管理、SubAgent並列処理、2段階品質検証プロセスまで完全ガイド。
pubDate: '2025-10-08'
heroImage: ../../../assets/blog/claude-code-web-automation-hero.jpg
tags:
  - claude-code
  - automation
  - web-development
  - ai-agents
relatedPosts:
  - slug: chrome-devtools-mcp-performance
    score: 0.95
    reason:
      ko: '자동화, 웹 개발, DevOps 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、Web開発、DevOps分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, web development, DevOps with
        comparable difficulty.
      zh: 在自动化、Web开发、DevOps领域涵盖类似主题，难度相当。
  - slug: astro-scheduled-publishing
    score: 0.93
    reason:
      ko: '자동화, 웹 개발, DevOps 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、Web開発、DevOps分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, web development, DevOps with
        comparable difficulty.
      zh: 在自动化、Web开发、DevOps领域涵盖类似主题，难度相当。
  - slug: ai-agent-notion-mcp-automation
    score: 0.92
    reason:
      ko: 자동화 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.
      ja: 自動化分野で類似したトピックを扱い、同程度の難易度です。
      en: Covers similar topics in automation with comparable difficulty.
      zh: 在自动化领域涵盖类似主题，难度相当。
  - slug: metadata-based-recommendation-optimization
    score: 0.89
    reason:
      ko: '다음 단계 학습으로 적합하며, 자동화, 웹 개발, DevOps 주제에서 연결됩니다.'
      ja: 次のステップの学習に適しており、自動化、Web開発、DevOpsのトピックで繋がります。
      en: >-
        Suitable as a next-step learning resource, connecting through
        automation, web development, DevOps topics.
      zh: 适合作为下一步学习资源，通过自动化、Web开发、DevOps主题进行连接。
  - slug: specification-driven-development
    score: 0.88
    reason:
      ko: '다음 단계 학습으로 적합하며, 자동화 주제에서 연결됩니다.'
      ja: 次のステップの学習に適しており、自動化のトピックで繋がります。
      en: >-
        Suitable as a next-step learning resource, connecting through automation
        topics.
      zh: 适合作为下一步学习资源，通过自动化主题进行连接。
---

## 概要

大規模なWebサイトリニューアルプロジェクトで数十ページを手作業で作成することは非効率的でエラーが発生しやすいです。本記事では、Claude CodeのSubAgentシステムを活用して31個のHTMLページを自動生成した実プロジェクトの事例を紹介します。

### プロジェクト背景

- <strong>規模</strong>: 31個のHTMLページ（C-8〜C-40）
- <strong>目標</strong>: 一貫したデザインシステムとパーツライブラリベースの自動化
- <strong>主要技術</strong>: Claude Code SubAgent、パーツライブラリ、CSVメタデータ管理

## プロジェクトアーキテクチャ

### 1. パーツライブラリシステム

パーツライブラリは再利用可能なUIコンポーネントとデザインシステムを定義したドキュメントで、976行の詳細な仕様を含みます。

<strong>主要構成要素</strong>:
- <strong>フォント＆カラーシステム</strong>: Noto Sans、Open Sansフォント、ブランドカラーパレット
- <strong>コンポーネントライブラリ</strong>: ボタン、フォーム、テーブル、ナビゲーションなど
- <strong>レイアウトルール</strong>: マージン、余白、コンテンツ幅設定
- <strong>レスポンシブ画像</strong>: 動的比率設定と最適化

```markdown
# パーツライブラリ例
## 1. フォント・カラー設定
- デフォルトフォント: "Noto Sans", sans-serif
- ブランドカラー: #E50012, #D20004, #BF0000

## 2. 再利用可能コンポーネント
### ボタンスタイル
- Primaryボタン: .btn-primary
- Secondaryボタン: .btn-secondary

## 3. レイアウトルール
- コンテナ最大幅: 1200px
- セクション間余白: 80px（PC）、40px（モバイル）
```

### 2. CSVベースのページメタデータ管理

31ページのメタデータをCSVファイルで一括管理し、効率性を最大化しました。

<strong>CSV構造</strong>:
```csv
ID,URL,パンくず,メタタイトル,メタ・ディスクリプション,H1タグ,og:type,og:title
C-8,/contract/ds/dscard.html,HOME>契約者>サービスカード,サービスカード案内,カード関連サービス...,カード情報,article,サービスカード
```

<strong>CSV管理の利点</strong>:
- 一箇所で全ページ情報を管理
- Excel/Google Sheetsで簡単編集
- SEOメタデータ一括レビュー可能
- 自動化スクリプトで簡単にパース

### 3. Claude Code エージェント設定

プロジェクトに2つのコアエージェントを設定しました:

<strong>1) context-manager</strong>: ワークフロー全体の調整
- 作業順序管理
- SubAgent間のコンテキスト共有
- 進捗状況追跡

<strong>2) mcp-expert</strong>: MCPプロトコル統合
- 外部ツール連携
- データソースアクセス
- API通信管理

## 実装プロセス

### Phase 1: 初期設定とドキュメント化

```bash
# 1. エージェント設定ファイル作成
.claude/agents/
├── context-manager.md
└── mcp-expert.md

# 2. コマンドファイル作成
working_history/run.md        # 実行スクリプト
working_history/parts.md       # パーツライブラリ（976行）

# 3. プロジェクトガイドライン
CLAUDE.md                      # Claude Code指針書

# 4. ページメタデータ
working_history/c/01_directory_map.csv  # 31ページ情報
```

<strong>CLAUDE.md初期化</strong>:
```bash
# Claude Codeの/initコマンド実行
/init
```

このコマンドはプロジェクト構造を分析し、最適化されたCLAUDE.mdを自動生成します。

### Phase 2: 自動ページ生成ワークフロー

`/run`コマンドを実行すると、以下のワークフローが自動的に進行します:

```markdown
1. パーツライブラリ読み込み（parts.md）
   ↓
2. CSVディレクトリマップ解析（31ページ情報抽出）
   ↓
3. SubAgent並列実行（5個ずつバッチ処理）
   ↓
4. 各SubAgentがページ生成
   - メタデータ適用
   - パーツライブラリコンポーネント活用
   - 画像自動ダウンロード
   ↓
5. HTMLファイル保存と検証
```

<strong>実行ログ</strong>:
```sh
> /run is running…

⏺ Read(working_history/parts.md)
  ⎿ Read 976 lines

⏺ Read(working_history/c/01_directory_map.csv)
  ⎿ Read 33 lines（31ページ確認）

⏺ CSVから31ページ（C-8〜C-40）確認。
  5ページずつ並列で作成開始。

⏺ fullstack-developer(Create page C-8)
  ⎿ Done (9 tool uses · 2m 41s)

⏺ fullstack-developer(Create page C-10)
  ⎿ Done (12 tool uses · 3m 8s)

⏺ fullstack-developer(Create page C-12)
  ⎿ Done (17 tool uses · 3m 27s)
```

### Phase 3: SubAgent並列処理戦略

<strong>バッチ処理構造</strong>:
```python
# 擬似コード
pages = parse_csv("01_directory_map.csv")  # 31ページ
batch_size = 5

for i in range(0, len(pages), batch_size):
    batch = pages[i:i+batch_size]

    # 5個のSubAgent同時実行
    results = await parallel_execute([
        create_fullstack_agent(page)
        for page in batch
    ])

    # 結果検証と次バッチへ
```

<strong>並列処理のメリット</strong>:
- <strong>速度</strong>: 順次処理比5倍高速
- <strong>リソース最適化</strong>: トークン使用効率化
- <strong>独立性</strong>: 各ページが独立して生成されエラー隔離

<strong>実パフォーマンス指標</strong>:
- ページあたり平均生成時間: 2〜3分
- ツール使用回数: 9〜17回（画像ダウンロード、HTML作成など）
- バッチあたり処理時間: 約3〜4分（5ページ）

### Phase 4: 品質保証と検証

1次生成完了後、一部ページでパーツライブラリが適切に適用されていないことが判明しました。これを解決するため、2段階検証プロセスを導入しました。

<strong>検証コマンド作成</strong>（`apply-parts.md`）:
```markdown
# 役割
パーツライブラリ適用状態を確認し、不足部分を修正します。

# 作業手順
1. Gitコミット履歴から生成されたHTMLファイルリスト抽出
2. 各ファイルをSubAgentで検証
   - パーツライブラリクラス使用確認
   - コンポーネント構造一致確認
3. 問題のあるファイルを自動修正
```

<strong>検証実行ログ</strong>:
```sh
/apply-parts is running…

⏺ git show --name-only ee5ffc9
  ⎿ 31個のHTMLファイル確認

⏺ fullstack-developer(Check parts library batch 1)
  ⎿ Done (47 tool uses · 6m 44s)

⏺ fullstack-developer(Check parts library batch 2)
  ⎿ Done (20 tool uses · 3m 21s)

...（7バッチ完了）
⎿ Session limit reached
```

<strong>セッション制限対応</strong>:
- Claude Codeはセッションあたりトークン制限あり
- 作業をチャンクに分割して複数セッションで処理
- 進捗状況をGitコミットで保存して作業継続

## コア技術要素

### 1. SubAgent並列オーケストレーション

<strong>fullstack-developer SubAgentの役割</strong>:
```markdown
# SubAgentに渡されるコンテキスト

Task: Create page C-8
Metadata:（CSVから抽出したページ情報）
- URL: /contract/ds/dscard.html
- Title: サービスカード案内
- H1: カード情報
- Description: カード関連サービスをご案内します。

Requirements:
1. parts.mdのコンポーネント使用
2. メタデータ正確反映
3. 画像自動ダウンロードと最適化
4. レスポンシブレイアウト適用
```

<strong>SubAgent実行パターン</strong>:
```bash
# 同時に5個のSubAgent実行
fullstack-developer(Create page C-8)  # 2m 41s
fullstack-developer(Create page C-10) # 3m 8s
fullstack-developer(Create page C-12) # 3m 27s
fullstack-developer(Create page C-13) # 3m 15s
fullstack-developer(Create page C-14) # 2m 55s
```

### 2. 自動画像処理

SubAgentが画像を自動でダウンロードして配置します:

```bash
# SubAgentが実行した実コマンド
mkdir -p /path/to/source/contract/images
curl -s -o /path/to/source/contract/images/card.jpg \
  https://example.com/assets/card.jpg

# HTMLに画像挿入
<img src="/contract/images/card.jpg"
     alt="サービスカード"
     class="responsive-img">
```

### 3. Git統合バージョン管理

すべての生成作業はGitで追跡されます:

```bash
# 1次生成コミット
git commit -m "feat: Generate 31 pages with parts library" \
  ee5ffc985ff001fa05384aecd1458be0be58b2d0

# コミットから生成ファイル抽出
git show --name-only ee5ffc9 | grep '\.html$'
# → 31個のHTMLファイルリスト出力
```

## 実践ティップスとベストプラクティス

### 1. セッション制限管理

<strong>課題</strong>: Claude Codeはセッションあたりトークン制限あり

<strong>解決策</strong>:
```markdown
# 作業をチャンクに分割
- バッチサイズ: 5〜7ページ
- 各バッチ完了後Gitコミット
- セッションリセット必要時/clear使用
- 次セッションでGit履歴ベースで再開
```

### 2. パーツライブラリドキュメント化

<strong>コア原則</strong>:
```markdown
1. 全コンポーネントに明確なクラス名付与
   例: .btn-primary, .card-container

2. 使用例を含める
   ```html
   <!-- ボタン使用例 -->
   <button class="btn-primary">クリック</button>
   ```

3. レスポンシブバリエーション明記
   - PC: .btn-primary
   - モバイル: .btn-primary-mobile

4. コンポーネント依存関係を文書化
   - 必須CSS: /assets/parts.css
   - 必須JS: /assets/components.js
```

### 3. CSVメタデータ設計

<strong>効果的なCSV構造</strong>:
```csv
ID,URL,Breadcrumb,MetaTitle,MetaDescription,H1,OGType,OGImage
C-8,/page,HOME>Sub,Title,Description,Heading,article,/img.jpg
```

<strong>注意点</strong>:
- CSVセルにカンマ含む場合は引用符で囲む
- URLは絶対パスまたは相対パス明確に区分
- 空白文字処理注意（trim必要）

### 4. SubAgentプロンプト最適化

<strong>効果的なSubAgent指示</strong>:
```markdown
Task: Create responsive HTML page

Context:
- Parts library: working_history/parts.md
- Metadata: (CSV row data)
- Image assets: /assets/images/

Requirements（優先順位順）:
1. ✅ Parts libraryコンポーネント必須使用
2. ✅ メタデータ正確反映
3. ✅ 画像最適化（WebP優先）
4. ⚠️ アクセシビリティ準拠（ARIAラベル）
5. ⚠️ パフォーマンス最適化（Lazy loading）

Output:
- File path: source/{path}/index.html
- Validation: W3C HTML5標準準拠
```

## プロジェクト成果

### 定量的成果

| 指標 | 手作業 | 自動化 | 改善率 |
|------|--------|--------|--------|
| 総作業時間 | 〜31時間 | 〜3時間 | <strong>90%短縮</strong> |
| ページあたり平均 | 60分 | 6分 | <strong>90%短縮</strong> |
| エラー発生率 | 15% | 3% | <strong>80%減少</strong> |
| 一貫性スコア | 75/100 | 98/100 | <strong>30%向上</strong> |

### 定性的成果

<strong>1. デザイン一貫性確保</strong>
- 全ページに同一パーツライブラリ適用
- ブランドカラー、フォント、レイアウトルール100%準拠

<strong>2. SEO最適化自動化</strong>
- CSVメタデータベース一括設定
- OGタグ、メタディスクリプション自動生成

<strong>3. 保守性向上</strong>
- パーツライブラリ修正 → 再実行で一括更新可能
- Gitベースバージョン管理で変更追跡容易

## 追加活用事例

### 1. 多言語サイト自動生成

```markdown
# CSVに言語別メタデータ追加
ID,URL_KO,URL_EN,Title_KO,Title_EN,Desc_KO,Desc_EN
C-8,/ko/page,/en/page,제목,Title,설명,Description

# SubAgentに言語別ページ生成指示
for lang in ['ko', 'en', 'ja']:
    create_page(metadata[lang])
```

### 2. A/Bテストページ生成

```markdown
# バリエーションA: 基本ボタンスタイル
parts_version = 'v1'
create_pages(parts_library='parts_v1.md')

# バリエーションB: 新ボタンスタイル
parts_version = 'v2'
create_pages(parts_library='parts_v2.md')
```

### 3. ランディングページテンプレート自動化

```csv
Campaign,Hero_Image,CTA_Text,CTA_Link,Features
Spring_Sale,spring.jpg,今すぐ購入,/shop,"割引,送料無料"
Summer_Event,summer.jpg,参加する,/event,"景品,イベント"
```

## 結論

Claude CodeのSubAgentシステムを活用すると、大規模Webサイトページ生成作業を劇的に自動化できます。キーポイントは以下の通りです:

### 成功要因

1. <strong>明確なパーツライブラリドキュメント化</strong>
   - 再利用可能コンポーネント定義
   - 一貫した命名規則
   - 具体的な使用例含む

2. <strong>体系的なメタデータ管理</strong>
   - CSVベース中央集中管理
   - SEO要素一括設定
   - バージョン管理容易性

3. <strong>効率的な並列処理</strong>
   - 5〜7個バッチ単位処理
   - 独立SubAgent実行
   - セッション制限考慮したチャンク分割

4. <strong>2段階品質検証</strong>
   - 1次: 自動生成
   - 2次: パーツ適用検証と修正
   - Gitベース変更追跡

### 今後の改善方向

1. <strong>AIベース品質検証強化</strong>
   - アクセシビリティ自動チェック
   - パフォーマンス指標自動測定
   - クロスブラウザテスト自動化

2. <strong>CMS統合</strong>
   - 生成ページ自動デプロイ
   - コンテンツ更新ワークフロー
   - プレビュー環境自動構築

3. <strong>デザインシステム進化</strong>
   - Figma → Parts Library自動変換
   - リアルタイムコンポーネント同期
   - デザイントークン自動適用

このアプローチは単純反復作業を自動化し、開発者がより創造的で戦略的な業務に集中できるようにします。Claude CodeとAIエージェントは単なるツールを超えた強力な開発パートナーになり得ます。

## 参考資料

- [Claude Code公式ドキュメント](https://docs.anthropic.com/claude/docs/claude-code)
- [SubAgent活用ガイド](https://www.anthropic.com/engineering/claude-code-best-practices)
- [パーツライブラリ設計パターン](https://developer.mozilla.org/ja/docs/Web/Guide/HTML/Using_HTML_sections_and_outlines)
- [CSVベースコンテンツ管理](https://ja.wikipedia.org/wiki/Comma-Separated_Values)
