---
title: 'Claude Skills 完全ガイド: プロジェクト適用から実践ノウハウまで'
description: >-
  ClaudeのAgent
  Skills機能の導入から実装まで、試行錯誤と成果を記録した実践ガイド。フォルダベースのモジュール化でAIエージェントを専門化する方法。
pubDate: '2025-10-22'
heroImage: ../../../assets/blog/claude-skills-guide-hero.jpg
tags:
  - claude-code
  - agent-skills
  - ai-automation
relatedPosts:
  - slug: ai-agent-notion-mcp-automation
    score: 0.93
    reason:
      ko: '자동화, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, architecture with comparable
        difficulty.
      zh: 在自动化、AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: openai-agentkit-tutorial-part2
    score: 0.93
    reason:
      ko: '다음 단계 학습으로 적합하며, 자동화, AI/ML, 아키텍처 주제에서 연결됩니다.'
      ja: 次のステップの学習に適しており、自動化、AI/ML、アーキテクチャのトピックで繋がります。
      en: >-
        Suitable as a next-step learning resource, connecting through
        automation, AI/ML, architecture topics.
      zh: 适合作为下一步学习资源，通过自动化、AI/ML、架构主题进行连接。
  - slug: google-analytics-mcp-automation
    score: 0.92
    reason:
      ko: '다음 단계 학습으로 적합하며, 자동화, AI/ML, 아키텍처 주제에서 연결됩니다.'
      ja: 次のステップの学習に適しており、自動化、AI/ML、アーキテクチャのトピックで繋がります。
      en: >-
        Suitable as a next-step learning resource, connecting through
        automation, AI/ML, architecture topics.
      zh: 适合作为下一步学习资源，通过自动化、AI/ML、架构主题进行连接。
  - slug: llm-blog-automation
    score: 0.92
    reason:
      ko: '자동화, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, architecture with comparable
        difficulty.
      zh: 在自动化、AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: specification-driven-development
    score: 0.92
    reason:
      ko: '다음 단계 학습으로 적합하며, 자동화, AI/ML, 아키텍처 주제에서 연결됩니다.'
      ja: 次のステップの学習に適しており、自動化、AI/ML、アーキテクチャのトピックで繋がります。
      en: >-
        Suitable as a next-step learning resource, connecting through
        automation, AI/ML, architecture topics.
      zh: 适合作为下一步学习资源，通过自动化、AI/ML、架构主题进行连接。
---

## 概要

2025年10月16日、Anthropicは**Agent Skills**という革新的な機能を発表しました。これは単純なプロンプトエンジニアリングを超えて、**ファイルとフォルダでAIエージェントの専門性を構造化**する新しいパラダイムです。

この記事では、Claude Skillsを私のブログ自動化プロジェクトに適用した際の**試行錯誤、解決プロセス、そして実践的なノウハウ**を共有します。単なる機能紹介ではなく、**実際のコードと共に学んだ教訓**をまとめました。

## Agent Skillsとは何か?

### 核心概念

Agent Skillsは**専門知識をファイルシステムでパッケージング**する方法です。従来はシステムプロンプトに全ての指示を含めていましたが、現在は:

```
my-skill/
├── SKILL.md          # 核心指示事項（必須）
├── reference.md      # 詳細リファレンス（任意）
├── examples.md       # サンプル集（任意）
├── scripts/          # 実行可能コード（任意）
│   └── helper.py
└── templates/        # テンプレートファイル（任意)
    └── template.txt
```

このように**組織化されたフォルダ**で管理します。

### 従来の方式との違い

**従来の方式（システムプロンプト）**:
```markdown
あなたはブログ執筆の専門家です。
1. SEO最適化されたタイトル生成
2. メタデータ検証
3. 多言語コンテンツ生成
...
（全ての指示が一箇所に集中）
```

**Skillsの方式**:
````markdown
---
name: Blog Writing Assistant
description: Write SEO-optimized blog posts with multi-language support. Use when creating blog content or managing posts.
---

# Blog Writing Assistant

## Instructions
1. [seo-guidelines.md](seo-guidelines.md)でタイトル/説明のルールを確認
2. [content-structure.md](content-structure.md)で投稿フォーマットをチェック
3. scripts/generate_slug.pyでURL対応のslugを生成

## Quick Start
```bash
python scripts/validate_frontmatter.py post.md
```
````

主な違い:
- **モジュール化**: 関心事別にファイル分離
- **段階的ロード**: 必要なファイルのみコンテキストにロード
- **コード実行**: Python/Bashスクリプトの直接実行が可能
- **再利用性**: チーム全体で共有可能

### Progressive Disclosure（段階的開示）

Skillsの核心哲学は**3段階の情報開示**です:

```mermaid
graph TD
    A[Level 1: メタデータ] --> B{Claudeが関連性を判断}
    B -->|Yes| C[Level 2: SKILL.mdロード]
    B -->|No| D[スキップ]
    C --> E{追加情報が必要?}
    E -->|Yes| F[Level 3: リンクされたファイルを読む]
    E -->|No| G[タスク実行]
    F --> G
```

**Level 1 - メタデータ（起動時にロード）**:
```yaml
name: PDF Processing
description: Extract text, fill forms, merge PDFs...
```

**Level 2 - SKILL.md（必要時にロード）**:
```markdown
## Quick Start
Extract text:
...
フォーム入力については[FORMS.md](FORMS.md)を参照
```

**Level 3 - 追加ファイル（詳細作業時にロード）**:
```markdown
# FORMS.md
詳細なフォーム入力手順...
```

この構造のおかげで**コンテキストウィンドウを効率的に活用**しながら、実質無制限の情報を提供できます。

## プロジェクト背景: なぜSkillsが必要だったのか?

### 既存システムの限界

私のブログ自動化システムは`.claude/agents/`ディレクトリに複数のサブエージェントを配置する方式でした:

```
.claude/agents/
├── web-researcher.md
├── content-planner.md
├── writing-assistant.md
└── seo-optimizer.md
```

**問題点**:
1. **エージェント間の重複**: SEOガイドラインを複数のエージェントが繰り返し参照
2. **コンテキストの無駄**: エージェントファイル全体がシステムプロンプトにロード
3. **保守の困難**: ガイドライン変更時に複数ファイルを修正
4. **コード再利用不可**: Pythonスクリプトを直接実行する方法がない

### Skillsで解決

Skillsを導入することで:

```
.claude/skills/
├── blog-writing/
│   ├── SKILL.md
│   ├── seo-guidelines.md       # 共通参照
│   ├── frontmatter-schema.md
│   └── scripts/
│       ├── validate_date.py
│       └── generate_slug.py
└── content-recommendation/
    ├── SKILL.md
    └── analyze_similarity.py
```

**改善点**:
1. **単一の真実のソース**: SEOガイドラインは一箇所のみ
2. **効率的なロード**: 必要なファイルのみロード
3. **コード実行**: 日付検証、slug生成をPythonで自動化
4. **チーム共有**: gitでチームメンバーに配布可能

## 最初のSkill作成: Blog Writing Skill

### Step 1: ディレクトリ作成

```bash
mkdir -p .claude/skills/blog-writing
cd .claude/skills/blog-writing
```

### Step 2: SKILL.md作成

````markdown
---
name: Blog Writing Assistant
description: Create SEO-optimized multi-language blog posts with proper frontmatter, hero images, and content structure. Use when writing blog posts, creating content, or managing blog metadata.
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
---

# Blog Writing Assistant

このSkillはブログ投稿作成の全プロセスを自動化します。

## 核心機能

1. **Frontmatter検証**: 日付形式、必須フィールドチェック
2. **SEO最適化**: タイトル/説明の長さ検証
3. **多言語サポート**: 韓国語、英語、日本語を同時生成
4. **Slug生成**: URL対応のファイル名を自動生成

## Workflow

### 1. 日付決定
```bash
python scripts/get_next_pubdate.py
```

### 2. Frontmatter検証
詳細ルールは[frontmatter-schema.md](frontmatter-schema.md)を参照。

必須フィールド:
- title（言語別最適長は[seo-guidelines.md](seo-guidelines.md)参照）
- description
- pubDate（形式: 'YYYY-MM-DD'、シングルクォート必須）
- heroImage
- tags（配列、小文字、ハイフンのみ）

### 3. コンテンツ構造
[content-structure.md](content-structure.md)のテンプレートに従う。

### 4. 検証
```bash
python scripts/validate_frontmatter.py ja/my-post.md
```

## Best Practices

- タイトルはSEOガイドライン遵守
- pubDateは常に最新投稿+1日
- heroImageは../../../assets/blog/パスを使用
- コードブロック内にtriple backticksがある場合はquadruple backticksを使用
````

### Step 3: サポートファイル追加

**seo-guidelines.md**:
```markdown
# SEO Guidelines

## Title 最適長
- 韓国語: 25-30文字
- 英語: 50-60文字
- 日本語: 30-35文字

## Description 最適長
- 韓国語: 70-80文字
- 英語: 150-160文字
- 日本語: 80-90文字

## キーワード戦略
...
```

**scripts/get_next_pubdate.py**:
```python
#!/usr/bin/env python3
"""
最新のブログ投稿のpubDateを見つけて+1日を返す
"""
import os
import re
from datetime import datetime, timedelta
from pathlib import Path

def find_latest_pubdate():
    blog_dir = Path("src/content/blog/ja")
    latest_date = None

    for md_file in blog_dir.glob("*.md"):
        content = md_file.read_text(encoding='utf-8')
        match = re.search(r"pubDate:\s*['\"](\d{4}-\d{2}-\d{2})['\"]", content)

        if match:
            date_str = match.group(1)
            date_obj = datetime.strptime(date_str, "%Y-%m-%d")

            if latest_date is None or date_obj > latest_date:
                latest_date = date_obj

    if latest_date:
        next_date = latest_date + timedelta(days=1)
        return next_date.strftime("%Y-%m-%d")

    return None

if __name__ == "__main__":
    next_date = find_latest_pubdate()
    if next_date:
        print(f"'{next_date}'")  # シングルクォート含めて出力
    else:
        print("No existing posts found")
```

### Step 4: 実行権限付与

```bash
chmod +x scripts/*.py
```

## 試行錯誤と解決プロセス

### 問題1: ClaudeがSkillを使用しない

**症状**:
```
User: ブログ投稿を書いて
Claude: （Skillを使わず通常の応答）
```

**原因**: descriptionが曖昧すぎた
```yaml
description: Helps with blog posts
```

**解決**:
```yaml
description: Create SEO-optimized multi-language blog posts with proper frontmatter, hero images, and content structure. Use when writing blog posts, creating content, or managing blog metadata.
```

**教訓**: descriptionに**何をするか + いつ使うか**の両方を明記すべき

### 問題2: YAMLパースエラー

**症状**:
```
Error: Invalid frontmatter in SKILL.md
```

**原因**: コロン(:)の後に引用符なしで特殊文字を使用
```yaml
description: Use when: creating posts  # ❌ 2番目のコロンが問題
```

**解決**:
```yaml
description: "Use when: creating posts"  # ✅ 引用符で囲む
```

**教訓**: YAMLで特殊文字を含む場合は常に引用符を使用

### 問題3: スクリプト実行失敗

**症状**:
```
PermissionError: [Errno 13] Permission denied: 'scripts/validate.py'
```

**原因**: 実行権限が付与されていない

**解決**:
```bash
chmod +x .claude/skills/blog-writing/scripts/*.py
```

**追加ヒント**: Windowsでも動作するようにshebangを追加
```python
#!/usr/bin/env python3
```

### 問題4: ファイルパスエラー

**症状**:
```
FileNotFoundError: [Errno 2] No such file or directory: 'reference.md'
```

**原因**: SKILL.mdから相対パスを誤って指定
```markdown
See [reference.md](../reference.md)  # ❌
```

**解決**:
```markdown
See [reference.md](reference.md)     # ✅ 同じディレクトリ
```

**教訓**: 全てのパスはSKILL.md基準の相対パス

### 問題5: 重複Skillの競合

**症状**: Claudeが複数のSkillの中から誤ったものを選択

**原因**: 類似したdescriptionを持つ2つのSkill
```yaml
# Skill 1
description: For data analysis

# Skill 2
description: For analyzing data
```

**解決**: 明確なトリガーキーワードで区別
```yaml
# Skill 1
description: Analyze sales data in Excel files and CRM exports. Use for sales reports, pipeline analysis, revenue tracking.

# Skill 2
description: Analyze log files and system metrics data. Use for performance monitoring, debugging, system diagnostics.
```

**教訓**: Skill間の明確なドメイン分離が必要

## 実践成果: Before & After

### Before: スラッシュコマンド方式

```markdown
# .claude/commands/write-post.md

ブログ投稿を作成してください。

1. 最新投稿日を見つけてください（Grep使用）
2. pubDateを+1日に設定してください
3. frontmatterを検証してください
...
```

**問題点**:
- ユーザーが`/write-post`コマンドを明示的に入力する必要がある
- 段階別の指示を毎回読む必要がある
- コード再利用不可

### After: Skills方式

```yaml
# .claude/skills/blog-writing/SKILL.md
---
name: Blog Writing Assistant
description: Create blog posts... Use when writing blog posts...
---
```

```python
# .claude/skills/blog-writing/scripts/get_next_pubdate.py
def find_latest_pubdate():
    # 自動化ロジック
```

**User**: "TypeScriptについてのブログ投稿を書いて"

**Claude**: （自動的にblog-writing Skillを起動）
1. `get_next_pubdate.py`実行 → `'2025-10-22'`
2. frontmatter生成
3. seo-guidelines.md参照してタイトル最適化
4. コンテンツ作成

**改善点**:
- ✅ **自動発見**: `/write-post`タイピング不要
- ✅ **コード実行**: Pythonで日付計算を自動化
- ✅ **コンテキスト効率**: 必要なファイルのみロード
- ✅ **再利用性**: 他のプロジェクトにも適用可能

### 成果測定

**トークン使用量比較**（ブログ投稿1件作成基準）:

| 項目 | Before | After | 削減率 |
|------|--------|-------|--------|
| システムプロンプト | 3,500トークン | 1,200トークン | 66% ↓ |
| 指示の繰り返し読み | 5回 | 1回 | 80% ↓ |
| 総トークン | ~18,000 | ~10,000 | 44% ↓ |

**作業時間比較**:

| 作業 | Before | After | 改善 |
|------|--------|-------|------|
| 日付計算 | 手動（30秒） | 自動（即座） | 100% ↓ |
| Frontmatter検証 | 手動確認 | スクリプト自動 | 90% ↓ |
| 多言語一貫性チェック | 手動比較 | 自動検証 | 85% ↓ |

## 高度な活用: Tool Permissions

### allowed-toolsで安全性確保

```yaml
---
name: Safe File Reader
description: Read files without making changes. Use when you need read-only file access.
allowed-tools: Read, Grep, Glob
---
```

**効果**:
- Skill起動時に**Write、Editツールが使用不可**
- 読み取り専用作業で誤ってファイルを変更するのを防止
- 最小権限の原則（Principle of Least Privilege）

### 実践例: Code Review Skill

````yaml
---
name: Code Reviewer
description: Review code for best practices and potential issues. Use when reviewing code, checking PRs, or analyzing code quality.
allowed-tools: Read, Grep, Glob
---

# Code Reviewer

## Review Checklist
1. コード構成と構造
2. エラーハンドリング
3. パフォーマンス考慮事項
4. セキュリティ懸念事項

## Instructions
1. Readツールでターゲットファイルを読む
2. Grepでパターンを検索
3. Globで関連ファイルを見つける
4. 詳細なフィードバックを提供

**ファイルの変更不可** - 読み取り専用アクセスのみ。
````

**使用例**:
```
User: PR #123をレビューして
Claude: （Code Review Skill起動、Read/Grep/Globのみ使用可能）
```

## チームとSkillsを共有する

### 方法1: Gitで共有（推奨）

**プロジェクトSkill作成**:
```bash
mkdir -p .claude/skills/team-conventions
```

**コミット＆プッシュ**:
```bash
git add .claude/skills/
git commit -m "Add team coding conventions Skill"
git push
```

**チームメンバー**:
```bash
git pull
# Skillが自動的に利用可能に!
```

### 方法2: Pluginとして配布

より広いコミュニティと共有するには[Claude Code Plugin](https://docs.claude.com/en/docs/claude-code/plugins)としてパッケージング:

```
my-plugin/
├── plugin.json
├── skills/
│   └── my-skill/
│       └── SKILL.md
└── README.md
```

## Best Practices

### 1. Skillは一つの役割に集中

**❌ 悪い例**:
```yaml
name: All-Purpose Helper
description: Does everything - documents, data, deployment, testing...
```

**✅ 良い例**:
```yaml
name: PDF Form Filler
description: Fill out PDF forms programmatically. Use when working with PDF forms or form data.
```

### 2. Descriptionにトリガーキーワードを含める

**❌ 悪い例**:
```yaml
description: Helps with Excel
```

**✅ 良い例**:
```yaml
description: Analyze Excel spreadsheets, create pivot tables, generate charts. Use when working with Excel files, spreadsheets, .xlsx files, or tabular data analysis.
```

### 3. Progressive Disclosure活用

**核心情報はSKILL.mdに**:
```markdown
## Quick Start
PDFからテキストを抽出:
...

高度なフォーム入力については[forms.md](forms.md)を参照
```

**詳細情報は別ファイルに**:
```markdown
# forms.md
詳細な10ページのフォーム入力ガイド...
```

### 4. コードとドキュメントの明確な区別

**実行用スクリプト**:
```python
# scripts/process.py
# Claudeが直接実行
```

**参照用コード**:
```markdown
# examples.md
Claudeが読んで参照するコード例
```

### 5. バージョン管理

```markdown
# SKILL.md

## Version History
- v2.0.0 (2025-10-22): APIへの破壊的変更
- v1.1.0 (2025-10-15): フォーム検証追加
- v1.0.0 (2025-10-01): 初回リリース
```

## トラブルシューティング

### デバッグモード有効化

```bash
claude --debug
```

Skillロードエラーを詳細に表示します。

### Skill一覧確認

```bash
# Claudeに直接聞く
What Skills are available?

# またはファイルシステムで確認
ls ~/.claude/skills/
ls .claude/skills/
```

### YAML検証

```bash
# SKILL.mdのfrontmatter確認
cat .claude/skills/my-skill/SKILL.md | head -n 10
```

確認事項:
- 1行目: `---`
- メタデータ
- 閉じる行: `---`
- タブではなくスペースを使用
- 特殊文字は引用符で囲む

## 今後の展望

Anthropic Engineering Blogによると:

> Looking further ahead, we hope to enable agents to create, edit, and evaluate Skills on their own, letting them codify their own patterns of behavior into reusable capabilities.

**可能になること**:
1. **AIがSkillを自動生成**: 作業パターンを学習してSkillに自動変換
2. **Skillの自己評価**: パフォーマンス測定と自動改善
3. **MCPとの統合**: Skills + MCPでより強力なエージェント構築

## 結論

Claude Skillsは**AIエージェント開発の新しい標準**となる可能性を持っています。

**核心的な利点**:
- ✅ フォルダベースの直感的な構造
- ✅ Progressive Disclosureで無制限のコンテキスト
- ✅ コード実行で決定論的な作業処理
- ✅ Gitでチーム共有可能
- ✅ 既存システムと比べてトークン44%削減

**始め方**:
1. 簡単なSkill一つで開始（例: コミットメッセージ生成）
2. 段階的に複雑度を上げる
3. チームと共有してフィードバック収集
4. 反復改善

**学習リソース**:
- [公式ドキュメント](https://docs.claude.com/en/docs/claude-code/skills)
- [Engineering Blog](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)
- [Skills Cookbook](https://github.com/anthropics/claude-cookbooks/tree/main/skills)
- [Skills GitHub Repo](https://github.com/anthropics/skills)

Skillsを活用してより強力で効率的なAIエージェントを作ってみてください!
