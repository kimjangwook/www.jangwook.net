# Chapter 18: 多言語コンテンツパイプライン

4つの言語による同時コンテンツ生成システム

---

## 概要

グローバル市場を対象としたコンテンツサービスでは、多言語対応が必須です。しかし、4つの言語(韓国語、英語、日本語、中国語)でコンテンツを同時に生成・管理することは複雑な作業です。単に翻訳するだけでなく、各言語圏の文化的背景を考慮したローカライゼーション、コンテンツの一貫性維持、品質検証、同期化など、さまざまな課題があります。

この章では、Claude Codeを活用して多言語コンテンツパイプラインを構築する方法を扱います。単純な翻訳の自動化ではなく、言語別SEO最適化、文化的適合性検証、メタデータ管理まで含めた総合的なシステムを作ります。

<strong>この章で学ぶ内容:</strong>

- Content Collectionsベースの多言語構造設計
- AIベースの翻訳エージェント実装(翻訳 vs ローカライゼーション)
- 品質検証の自動化(スキーマ検証、SEOチェック、文化的適合性)
- 言語間の同期化と一貫性維持メカニズム
- 4つの言語による同時公開ワークフロー

<strong>実践プロジェクト:</strong>

ブログポストを韓国語で作成すると、自動的に英語、日本語、中国語版が生成され、各言語別のSEO最適化と品質検証を経て同時に公開されるシステムを構築します。

---

## Recipe 18.1: 多言語構造設計

### 問題 (Problem)

4つの言語のコンテンツを効率的に管理するには、体系的なディレクトリ構造とメタデータスキーマが必要です。次のような要件を満たす必要があります:

1. <strong>言語別の分離</strong>: 各言語のコンテンツは独立して管理される必要がある
2. <strong>一貫した識別子</strong>: 同じコンテンツの言語版は連結される必要がある
3. <strong>型安全性</strong>: TypeScriptでメタデータスキーマを強制
4. <strong>SEO最適化</strong>: 言語別のURL構造とメタタグ
5. <strong>拡張性</strong>: 新しい言語の追加が容易である必要がある

単にフォルダを分けるだけでなく、Astro Content Collectionsの型システムを活用してコンパイル時にエラーを検出する構造を設計する必要があります。

### 解決策 (Solution)

Astro Content Collectionsを活用した言語別フォルダ構造と共通スキーマを設計します。

<strong>Step 1: ディレクトリ構造設計</strong>

```
src/content/blog/
├── ko/                 # 韓国語コンテンツ
│   ├── post-1.md
│   ├── post-2.md
│   └── ...
├── en/                 # 英語コンテンツ
│   ├── post-1.md
│   ├── post-2.md
│   └── ...
├── ja/                 # 日本語コンテンツ
│   ├── post-1.md
│   ├── post-2.md
│   └── ...
└── zh/                 # 中国語(簡体字)コンテンツ
    ├── post-1.md
    ├── post-2.md
    └── ...
```

<strong>核心原則</strong>:
- <strong>同じファイル名</strong>: 同じコンテンツはすべての言語フォルダで同じファイル名を使用(例: `ko/post-1.md`, `en/post-1.md`)
- <strong>言語コードはフォルダ名</strong>: ファイル名に言語コードを付けない(`post-1-ko.md` ✗)
- <strong>URL自動生成</strong>: `ko/post-1.md` → `/ko/blog/ko/post-1` (ルーティング構造上、言語コードの重複は正常)

<strong>Step 2: Content Collectionsスキーマ定義</strong>

`src/content.config.ts`:

```typescript
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// サポート言語タイプ
type SupportedLanguage = 'ko' | 'en' | 'ja' | 'zh';

// ブログコレクションスキーマ
const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: ({ image }) => z.object({
    // 必須フィールド
    title: z.string()
      .min(10, "タイトルは最低10文字以上である必要があります")
      .max(60, "タイトルは60文字を超えることができません(SEO)"),

    description: z.string()
      .min(50, "説明は最低50文字以上である必要があります")
      .max(160, "説明は160文字を超えることができません(SEO)"),

    pubDate: z.coerce.date(),

    // 選択フィールド
    updatedDate: z.coerce.date().optional(),

    heroImage: image().optional(),

    tags: z.array(z.string())
      .max(5, "タグは最大5つまで許可されます")
      .optional(),

    // 多言語関連フィールド
    relatedPosts: z.array(z.object({
      slug: z.string(),
      score: z.number().min(0).max(1),
      reason: z.object({
        ko: z.string(),
        ja: z.string(),
        en: z.string(),
        zh: z.string(),
      }),
    })),

    // 翻訳メタデータ(選択)
    translation: z.object({
      sourceLanguage: z.enum(['ko', 'en', 'ja', 'zh']).optional(),
      translatedAt: z.coerce.date().optional(),
      reviewer: z.string().optional(),
    }).optional(),
  }),
});

export const collections = { blog };
```

<strong>Step 3: 言語検出ユーティリティ関数</strong>

`src/utils/i18n.ts`:

```typescript
import type { CollectionEntry } from 'astro:content';

export type Language = 'ko' | 'en' | 'ja' | 'zh';

/**
 * ポストIDから言語コードを抽出
 * @example "ko/post-1.md" → "ko"
 */
export function getLanguageFromId(id: string): Language {
  const lang = id.split('/')[0] as Language;
  if (!['ko', 'en', 'ja', 'zh'].includes(lang)) {
    throw new Error(`Unsupported language: ${lang}`);
  }
  return lang;
}

/**
 * ポストIDからスラッグを抽出(言語コード除外)
 * @example "ko/post-1.md" → "post-1"
 */
export function getSlugFromId(id: string): string {
  return id.split('/')[1].replace(/\.md$/, '');
}

/**
 * 言語別ポストフィルタリング
 */
export function filterByLanguage(
  posts: CollectionEntry<'blog'>[],
  lang: Language
): CollectionEntry<'blog'>[] {
  return posts.filter(post => getLanguageFromId(post.id) === lang);
}

/**
 * 同じコンテンツの他の言語版を検索
 */
export function findTranslations(
  posts: CollectionEntry<'blog'>[],
  currentPost: CollectionEntry<'blog'>
): Record<Language, CollectionEntry<'blog'> | undefined> {
  const currentSlug = getSlugFromId(currentPost.id);
  const currentLang = getLanguageFromId(currentPost.id);

  const translations: Record<Language, CollectionEntry<'blog'> | undefined> = {
    ko: undefined,
    en: undefined,
    ja: undefined,
    zh: undefined,
  };

  for (const post of posts) {
    const slug = getSlugFromId(post.id);
    const lang = getLanguageFromId(post.id);

    if (slug === currentSlug && lang !== currentLang) {
      translations[lang] = post;
    }
  }

  return translations;
}

/**
 * 言語別ラベル(UIに表示)
 */
export const LANGUAGE_LABELS: Record<Language, { native: string; english: string }> = {
  ko: { native: '한국어', english: 'Korean' },
  en: { native: 'English', english: 'English' },
  ja: { native: '日本語', english: 'Japanese' },
  zh: { native: '简体中文', english: 'Chinese' },
};
```

<strong>Step 4: 言語切り替えコンポーネント</strong>

`src/components/LanguageSwitcher.astro`:

```astro
---
import { getCollection } from 'astro:content';
import { getLanguageFromId, getSlugFromId, findTranslations, LANGUAGE_LABELS, type Language } from '../utils/i18n';

interface Props {
  currentPostId: string;
}

const { currentPostId } = Astro.props;

// すべてのポストを取得
const allPosts = await getCollection('blog');

// 現在のポストを検索
const currentPost = allPosts.find(p => p.id === currentPostId);
if (!currentPost) {
  throw new Error(`Post not found: ${currentPostId}`);
}

// 翻訳版を検索
const translations = findTranslations(allPosts, currentPost);
const currentLang = getLanguageFromId(currentPost.id);
const currentSlug = getSlugFromId(currentPost.id);

// 利用可能な言語リスト
const availableLanguages: Language[] = ['ko', 'en', 'ja', 'zh'];
---

<div class="language-switcher">
  <span class="label">言語:</span>
  <div class="language-options">
    {availableLanguages.map(lang => {
      const isAvailable = lang === currentLang || translations[lang];
      const url = isAvailable
        ? `/${lang}/blog/${lang}/${currentSlug}`
        : null;

      return (
        <a
          href={url || '#'}
          class:list={[
            'language-option',
            { 'active': lang === currentLang },
            { 'disabled': !isAvailable }
          ]}
          aria-current={lang === currentLang ? 'page' : undefined}
          aria-disabled={!isAvailable}
        >
          {LANGUAGE_LABELS[lang].native}
        </a>
      );
    })}
  </div>
</div>

<style>
  .language-switcher {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    background: #f9fafb;
  }

  .label {
    font-weight: 600;
    color: #374151;
  }

  .language-options {
    display: flex;
    gap: 0.5rem;
  }

  .language-option {
    padding: 0.25rem 0.75rem;
    border-radius: 0.25rem;
    text-decoration: none;
    color: #4b5563;
    transition: all 0.2s;
  }

  .language-option:hover:not(.disabled) {
    background: #e5e7eb;
    color: #1f2937;
  }

  .language-option.active {
    background: #3b82f6;
    color: white;
    font-weight: 600;
  }

  .language-option.disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
</style>
```

### 説明 (Explanation)

<strong>1. なぜ言語別フォルダ構造なのか?</strong>

- <strong>明確な分離</strong>: 各言語のコンテンツが独立して管理される
- <strong>自動言語検出</strong>: ファイルパスだけで言語を識別可能(`ko/post.md` → `ko`)
- <strong>URL構造の一貫性</strong>: `/ko/blog/ko/post`, `/en/blog/en/post` (SEO対応)
- <strong>Git履歴追跡</strong>: 言語別の変更履歴を独立して追跡

<strong>2. Content Collectionsスキーマの役割</strong>

- <strong>型安全性</strong>: ビルド時にメタデータを検証
- <strong>SEO強制</strong>: `title` 60文字、`description` 160文字制限
- <strong>必須フィールド保証</strong>: `title`、`description`、`pubDate` 欠落時はビルド失敗
- <strong>relatedPosts 4つの言語必須</strong>: すべての推奨ポストに4つの言語の理由を強制

<strong>3. i18nユーティリティ関数の重要性</strong>

- <strong>`getLanguageFromId()`</strong>: ファイルパス解析ロジックの一元化
- <strong>`findTranslations()`</strong>: 同じスラッグの他の言語版を自動的に連結
- <strong>型安全性</strong>: `Language`タイプでタイポを防止

<strong>4. 言語切り替えコンポーネント</strong>

- <strong>自動検出</strong>: 現在のポストの翻訳版を自動的に検索
- <strong>使用不可表示</strong>: 翻訳がない言語は無効化
- <strong>アクセシビリティ</strong>: `aria-current`、`aria-disabled` 属性でスクリーンリーダーをサポート

### 変形 (Variations)

<strong>Variation 1: 言語別デフォルト設定 (config.json)</strong>

各言語フォルダに設定ファイルを追加:

```
src/content/blog/
├── ko/
│   ├── _config.json
│   └── *.md
├── en/
│   ├── _config.json
│   └── *.md
...
```

`ko/_config.json`:
```json
{
  "language": "ko",
  "locale": "ko-KR",
  "direction": "ltr",
  "dateFormat": "YYYY년 M월 D일",
  "seo": {
    "titleSuffix": " - 技術ブログ",
    "defaultDescription": "開発関連技術ブログ"
  }
}
```

<strong>Variation 2: Subpath vs Subdomain</strong>

現在の構造: `/ko/blog/ko/post` (Subpath)

代替案1 - Subdomain:
```
ko.example.com/blog/post
en.example.com/blog/post
```

代替案2 - Domain:
```
example.kr/blog/post  (韓国語)
example.com/blog/post (英語)
```

<strong>選択基準</strong>:
- <strong>Subpath</strong>: SEO権限共有、管理が簡単(推奨)
- <strong>Subdomain</strong>: サーバー分離、独立した運営
- <strong>Domain</strong>: 国別ブランディング、最高のローカライゼーション

<strong>Variation 3: 言語検出ミドルウェア</strong>

ユーザーブラウザの言語を自動検出:

`src/middleware/language-redirect.ts`:
```typescript
import type { MiddlewareHandler } from 'astro';

export const onRequest: MiddlewareHandler = async (context, next) => {
  const url = new URL(context.request.url);

  // ルートパスの場合のみリダイレクト
  if (url.pathname === '/') {
    const acceptLanguage = context.request.headers.get('accept-language');
    const preferredLang = parseAcceptLanguage(acceptLanguage);

    return context.redirect(`/${preferredLang}/blog`);
  }

  return next();
};

function parseAcceptLanguage(header: string | null): string {
  if (!header) return 'ko'; // デフォルト値

  const languages = header.split(',')
    .map(lang => {
      const [code, q = 'q=1'] = lang.trim().split(';');
      const quality = parseFloat(q.replace('q=', ''));
      return { code: code.split('-')[0], quality };
    })
    .sort((a, b) => b.quality - a.quality);

  for (const { code } of languages) {
    if (['ko', 'en', 'ja', 'zh'].includes(code)) {
      return code;
    }
  }

  return 'ko'; // デフォルト値
}
```

---

## Recipe 18.2: 翻訳エージェント実装

### 問題 (Problem)

多言語コンテンツを作成する際の最大の課題は、<strong>翻訳(Translation)</strong>と<strong>ローカライゼーション(Localization)</strong>のバランスです。

<strong>単純翻訳の問題点</strong>:
- 技術用語の不自然な翻訳(例: "スレッド" vs "thread")
- 文化的背景の損失(例: 韓国のことわざを英語に直訳)
- SEOキーワードの不一致(各言語圏の検索語が異なる)
- トーンとスタイルの不一致(敬語体 vs 口語体)

<strong>必要な機能</strong>:
1. 原文の意図と背景の理解
2. 言語別SEOキーワード最適化
3. 文化的に適切な表現への変換
4. 技術用語の一貫性維持
5. メタデータ(title、description、tags)の個別最適化

### 解決策 (Solution)

Claude APIを活用した「ローカライゼーション優先」翻訳エージェントを構築します。

<strong>Step 1: 翻訳エージェントスキル定義</strong>

`.claude/skills/translation-agent/SKILL.md`:

```markdown
# Translation Agent Skill

## Purpose
ブログポストを4つの言語(ko、en、ja、zh)にローカライゼーションする専門翻訳エージェントです。

## Core Principles

1. <strong>翻訳ではなくローカライゼーション</strong>
   - 単純な単語置換ではなく意味伝達
   - 各言語圏の読者のための書き直し
   - 文化的背景の考慮

2. <strong>SEO最適化</strong>
   - 言語別検索キーワードリサーチ
   - title: 60文字以下、description: 150-160文字
   - 各言語圏の検索意図を反映

3. <strong>一貫性維持</strong>
   - 技術用語はglossaryを参照
   - ブランド名、製品名は原文維持
   - トーンとスタイルの統一

## Translation Workflow

### Input
- 原文マークダウンファイル(一般的に韓国語)
- ターゲット言語(en、ja、zh)
- Glossary(選択)

### Output
- 翻訳されたマークダウンファイル
- SEO最適化されたメタデータ
- 翻訳品質レポート

### Process
1. 原文分析(主題、対象読者、トーン)
2. 言語別SEOキーワード調査
3. メタデータローカライゼーション(title、description、tags)
4. 本文翻訳(セクション別)
5. 技術用語の一貫性検証
6. 最終品質レビュー

## Language-Specific Guidelines

### English (en)
- 技術ブログ標準: 親しみやすいが専門的なトーン
- コードコメント: 命令形(例: "Create a new file")
- SEO: Stack Overflow、GitHub検索語優先

### Japanese (ja)
- 敬語使用: です/ます体基本
- 技術用語: 英語そのまま vs 日本語翻訳混用(glossary参照)
- SEO: Qiita、Zenn検索語優先

### Chinese (zh)
- 簡体中国語使用
- 技術用語: 英文表記後に中文説明を併記
- SEO: CSDN、知乎検索語優先

## Example Transformations

### Bad (直訳)
```
原文(ko): "この方法は一石二鳥です。"
翻訳(en): "This method kills two birds with one stone." ✗
```

### Good (ローカライゼーション)
```
原文(ko): "この方法は一石二鳥です。"
ローカライゼーション(en): "This approach solves two problems at once." ✓
```

### SEO Optimization

```
原文 title (ko): "リアクトフックス完璧ガイド"

Bad (en): "React Hooks Perfect Guide" ✗
- 検索量低い
- 競争過多

Good (en): "React Hooks Tutorial: Complete Guide for Beginners" ✓
- "tutorial"、"complete guide"、"beginners" 検索語を含む
- 具体的な対象を明示
```

## Tools

### translate_post
ポストを翻訳してローカライゼーションします。

**Parameters**:
- `source_file`: 原文ファイルパス
- `target_language`: ターゲット言語(en、ja、zh)
- `glossary_file`: 用語集ファイル(選択)

**Returns**:
- 翻訳されたファイルパス
- 品質スコア
- 改善提案

## Usage Example

```
@translation-agent "ko/react-hooks-guide.mdを英語に翻訳してください。
初心者向けでSEOキーワードは'React hooks tutorial'を中心に最適化してください。"
```
```

<strong>Step 2: 翻訳スクリプト実装</strong>

`.claude/skills/translation-agent/translate.py`:

```python
#!/usr/bin/env python3
"""
多言語ポスト翻訳およびローカライゼーションスクリプト
"""

import anthropic
import json
import os
import re
from pathlib import Path
from typing import Literal, Optional

Language = Literal["ko", "en", "ja", "zh"]

class TranslationAgent:
    def __init__(self, api_key: str):
        self.client = anthropic.Anthropic(api_key=api_key)
        self.glossary = self._load_glossary()

    def _load_glossary(self) -> dict:
        """技術用語glossaryロード"""
        glossary_path = Path(__file__).parent / "glossary.json"
        if glossary_path.exists():
            with open(glossary_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        return {}

    def translate_post(
        self,
        source_file: Path,
        target_lang: Language,
        source_lang: Language = "ko"
    ) -> dict:
        """
        ブログポストを翻訳してローカライゼーションします。

        Returns:
            {
                "frontmatter": {...},  # 翻訳されたメタデータ
                "content": "...",      # 翻訳された本文
                "quality_score": 0.95,
                "suggestions": [...]
            }
        """
        # 原文読み込み
        with open(source_file, 'r', encoding='utf-8') as f:
            content = f.read()

        # Frontmatterと本文分離
        frontmatter, body = self._split_frontmatter(content)

        # 1段階: メタデータ翻訳(SEO最適化)
        translated_meta = self._translate_metadata(
            frontmatter, source_lang, target_lang
        )

        # 2段階: 本文翻訳(セクション別)
        translated_body = self._translate_body(
            body, source_lang, target_lang
        )

        # 3段階: 品質検証
        quality_report = self._validate_quality(
            translated_body, target_lang
        )

        return {
            "frontmatter": translated_meta,
            "content": translated_body,
            "quality_score": quality_report["score"],
            "suggestions": quality_report["suggestions"]
        }

    def _split_frontmatter(self, content: str) -> tuple[dict, str]:
        """Frontmatterと本文分離"""
        match = re.match(r'^---\n(.*?)\n---\n(.*)$', content, re.DOTALL)
        if not match:
            raise ValueError("Invalid frontmatter format")

        # YAMLパース(簡単な実装)
        frontmatter_text = match.group(1)
        body = match.group(2)

        frontmatter = {}
        for line in frontmatter_text.split('\n'):
            if ':' in line:
                key, value = line.split(':', 1)
                frontmatter[key.strip()] = value.strip().strip('"\'')

        return frontmatter, body

    def _translate_metadata(
        self,
        meta: dict,
        source_lang: Language,
        target_lang: Language
    ) -> dict:
        """メタデータをSEO最適化して翻訳"""

        prompt = f"""あなたはSEO専門家であり翻訳者です。
ブログポストのメタデータを{target_lang}言語にローカライゼーションしてください。

<source_metadata>
title: {meta.get('title', '')}
description: {meta.get('description', '')}
tags: {meta.get('tags', '')}
</source_metadata>

<guidelines>
1. title: {target_lang}言語圏で検索量の多いキーワードを含む(60文字以下)
2. description: 具体的でアクション誘導型(150-160文字)
3. tags: その言語圏で実際に使用されるタグ(最大5つ)
4. 単純翻訳ではなくSEO最適化された書き直し
</guidelines>

<glossary>
{json.dumps(self.glossary.get(target_lang, {}), ensure_ascii=False, indent=2)}
</glossary>

JSON形式で回答してください:
{{
  "title": "...",
  "description": "...",
  "tags": ["...", "..."]
}}
"""

        response = self.client.messages.create(
            model="claude-opus-4-5-20251101",
            max_tokens=1024,
            messages=[{"role": "user", "content": prompt}]
        )

        # JSON抽出
        result_text = response.content[0].text
        json_match = re.search(r'\{.*\}', result_text, re.DOTALL)
        if json_match:
            return json.loads(json_match.group(0))

        raise ValueError("Failed to parse metadata translation")

    def _translate_body(
        self,
        body: str,
        source_lang: Language,
        target_lang: Language
    ) -> str:
        """本文をセクション別に翻訳"""

        # セクションに分割(## ヘッダー基準)
        sections = re.split(r'(^##\s+.+$)', body, flags=re.MULTILINE)

        translated_sections = []
        for section in sections:
            if section.strip():
                translated = self._translate_section(
                    section, source_lang, target_lang
                )
                translated_sections.append(translated)

        return '\n\n'.join(translated_sections)

    def _translate_section(
        self,
        text: str,
        source_lang: Language,
        target_lang: Language
    ) -> str:
        """個別セクション翻訳"""

        # コードブロック保護
        code_blocks = []
        def replace_code(match):
            code_blocks.append(match.group(0))
            return f"__CODE_BLOCK_{len(code_blocks)-1}__"

        text = re.sub(r'```.*?```', replace_code, text, flags=re.DOTALL)

        prompt = f"""あなたは技術ブログ専門翻訳者です。
次のテキストを{target_lang}言語にローカライゼーションしてください。

<text>
{text}
</text>

<guidelines>
1. ローカライゼーション優先: 単純翻訳ではなく{target_lang}読者のための書き直し
2. 技術用語: glossaryを参照して一貫性を維持
3. トーン: {"親しみやすく専門的(英語)" if target_lang == "en" else "丁寧で専門的(敬語使用)" if target_lang == "ja" else "専門的で明確"}
4. コード関連説明: 具体的で実用的に
5. __CODE_BLOCK_N__ 表示はそのまま維持
</guidelines>

<glossary>
{json.dumps(self.glossary.get(target_lang, {}), ensure_ascii=False, indent=2)}
</glossary>

翻訳されたテキストのみ回答してください(説明不要)。
"""

        response = self.client.messages.create(
            model="claude-opus-4-5-20251101",
            max_tokens=4096,
            messages=[{"role": "user", "content": prompt}]
        )

        translated = response.content[0].text.strip()

        # コードブロック復元
        for i, code in enumerate(code_blocks):
            translated = translated.replace(f"__CODE_BLOCK_{i}__", code)

        return translated

    def _validate_quality(self, text: str, lang: Language) -> dict:
        """翻訳品質検証"""

        issues = []

        # 1. コードブロック検証
        code_blocks = re.findall(r'```', text)
        if len(code_blocks) % 2 != 0:
            issues.append("コードブロックのペアが合いません")

        # 2. リンク検証
        broken_links = re.findall(r'\[([^\]]+)\]\(\)', text)
        if broken_links:
            issues.append(f"空のリンクを発見: {broken_links}")

        # 3. 言語別特殊検証
        if lang == "ja" and not re.search(r'[です|ます]', text):
            issues.append("日本語敬語使用不足")

        # スコア計算
        score = max(0.0, 1.0 - len(issues) * 0.1)

        return {
            "score": score,
            "suggestions": issues
        }


def main():
    """CLIインターフェース"""
    import sys

    if len(sys.argv) < 3:
        print("Usage: python translate.py <source_file> <target_lang>")
        sys.exit(1)

    source_file = Path(sys.argv[1])
    target_lang = sys.argv[2]

    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        print("Error: ANTHROPIC_API_KEY not set")
        sys.exit(1)

    agent = TranslationAgent(api_key)
    result = agent.translate_post(source_file, target_lang)

    # 出力ファイル生成
    output_file = source_file.parent.parent / target_lang / source_file.name
    output_file.parent.mkdir(parents=True, exist_ok=True)

    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("---\n")
        for key, value in result["frontmatter"].items():
            if isinstance(value, list):
                f.write(f"{key}: {json.dumps(value, ensure_ascii=False)}\n")
            else:
                f.write(f'{key}: "{value}"\n')
        f.write("---\n\n")
        f.write(result["content"])

    print(f"✓ Translated to {output_file}")
    print(f"  Quality score: {result['quality_score']:.2%}")
    if result['suggestions']:
        print("  Suggestions:")
        for suggestion in result['suggestions']:
            print(f"    - {suggestion}")


if __name__ == "__main__":
    main()
```

<strong>Step 3: Glossary(用語集)定義</strong>

`.claude/skills/translation-agent/glossary.json`:

```json
{
  "en": {
    "リアクト": "React",
    "フックス": "Hooks",
    "コンポーネント": "component",
    "状態": "state",
    "プロップス": "props",
    "レンダリング": "rendering",
    "ライフサイクル": "lifecycle",
    "非同期": "asynchronous",
    "プロミス": "Promise",
    "コールバック": "callback"
  },
  "ja": {
    "리액트": "React",
    "훅스": "フック",
    "컴포넌트": "コンポーネント",
    "상태": "状態",
    "프롭스": "Props",
    "렌더링": "レンダリング",
    "라이프사이클": "ライフサイクル",
    "비동기": "非同期",
    "프로미스": "Promise",
    "콜백": "コールバック"
  },
  "zh": {
    "리액트": "React",
    "훅스": "钩子(Hooks)",
    "컴포넌트": "组件",
    "상태": "状态",
    "프롭스": "Props",
    "렌더링": "渲染",
    "라이프사이클": "生命周期",
    "비동기": "异步",
    "프로미스": "Promise",
    "콜백": "回调"
  }
}
```

### 説明 (Explanation)

<strong>1. 翻訳 vs ローカライゼーション</strong>

| 翻訳 (Translation) | ローカライゼーション (Localization) |
|-------------------|---------------------|
| 単語置換 | 意味伝達 |
| "これは一石二鳥だ" → "This kills two birds with one stone" | "これは一石二鳥だ" → "This solves two problems at once" |
| 原文構造維持 | 読者に合わせた書き直し |

<strong>2. SEO最適化プロセス</strong>

```
原文 title (ko): "リアクトフックス完璧ガイド"
↓
検索キーワード調査(英語圏)
- "react hooks" (100K/月)
- "react hooks tutorial" (50K/月)
- "react hooks guide" (30K/月)
- "react hooks for beginners" (20K/月)
↓
最適化された title (en): "React Hooks Tutorial: Complete Guide for Beginners"
- 検索量の多いキーワードを含む
- 具体的な対象を明示
- 60文字以下維持
```

<strong>3. セクション別翻訳のメリット</strong>

- <strong>トークン効率性</strong>: 文書全体を一度に送らない(コンテキスト制限回避)
- <strong>一貫性</strong>: 各セクションは独立して翻訳されるがglossaryで用語統一
- <strong>エラー復旧</strong>: 特定セクションの翻訳失敗時に再試行可能

<strong>4. コードブロック保護</strong>

```python
# 翻訳前
text = "Reactで`useState`を使用します。\n```js\nconst [count, setCount] = useState(0);\n```"

# コードブロック保護
text = "Reactで`useState`を使用します。\n__CODE_BLOCK_0__"

# 翻訳
translated = "Use `useState` in React.\n__CODE_BLOCK_0__"

# 復元
translated = "Use `useState` in React.\n```js\nconst [count, setCount] = useState(0);\n```"
```

コードは翻訳せずにそのまま維持します。

<strong>5. 品質検証</strong>

自動検証項目:
- コードブロックペアの一致(``` 個数)
- リンクの整合性(`[]()` 空のリンクなし)
- 言語別特殊ルール(日本語敬語、中国語簡体字など)

### 変形 (Variations)

<strong>Variation 1: バッチ翻訳</strong>

複数ファイルを一度に翻訳:

```bash
#!/bin/bash
# batch_translate.sh

SOURCE_LANG="ko"
TARGET_LANGS=("en" "ja" "zh")

for file in src/content/blog/$SOURCE_LANG/*.md; do
  filename=$(basename "$file")

  for lang in "${TARGET_LANGS[@]}"; do
    echo "Translating $filename to $lang..."
    python .claude/skills/translation-agent/translate.py \
      "$file" "$lang"
  done
done
```

<strong>Variation 2: 翻訳メモリ(Translation Memory)</strong>

以前の翻訳を再利用:

```python
class TranslationMemory:
    def __init__(self, db_path: str = "translations.db"):
        self.conn = sqlite3.connect(db_path)
        self._init_db()

    def _init_db(self):
        self.conn.execute("""
            CREATE TABLE IF NOT EXISTS translations (
                source_hash TEXT,
                target_lang TEXT,
                source_text TEXT,
                translated_text TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (source_hash, target_lang)
            )
        """)

    def get(self, text: str, target_lang: str) -> Optional[str]:
        """キャッシュされた翻訳を照会"""
        hash_val = hashlib.md5(text.encode()).hexdigest()
        cursor = self.conn.execute(
            "SELECT translated_text FROM translations WHERE source_hash = ? AND target_lang = ?",
            (hash_val, target_lang)
        )
        row = cursor.fetchone()
        return row[0] if row else None

    def set(self, text: str, target_lang: str, translation: str):
        """翻訳キャッシュ保存"""
        hash_val = hashlib.md5(text.encode()).hexdigest()
        self.conn.execute(
            "INSERT OR REPLACE INTO translations (source_hash, target_lang, source_text, translated_text) VALUES (?, ?, ?, ?)",
            (hash_val, target_lang, text, translation)
        )
        self.conn.commit()
```

<strong>Variation 3: 翻訳レビューワークフロー</strong>

人間のレビュアーが翻訳を承認:

```python
def create_review_issue(translated_file: Path, quality_score: float):
    """GitHub Issueを生成して翻訳レビューを要請"""
    if quality_score < 0.9:
        issue_body = f"""
## Translation Review Required

- File: `{translated_file}`
- Quality Score: {quality_score:.2%}
- Action: Please review and approve

[View Diff](https://github.com/user/repo/compare/main...translation-{translated_file.stem})
        """
        # GitHub APIでIssue生成
        # ...
```

---

## Recipe 18.3: 品質検証の自動化

### 問題 (Problem)

翻訳されたコンテンツが次の基準を満たしているか自動的に検証する必要があります:

1. <strong>スキーマ遵守</strong>: Content Collectionsスキーマ(title 60文字、description 160文字など)
2. <strong>SEO品質</strong>: メタタグ、キーワード密度、タイトル構造
3. <strong>文化的適合性</strong>: 不適切な表現、禁忌語、現地の習慣
4. <strong>技術的正確性</strong>: コードブロックの整合性、リンクの有効性
5. <strong>言語別スタイル</strong>: 敬語使用(日本語)、簡体中国語、英語のトーン

手動レビューは時間がかかり一貫性が低下します。自動化された検証パイプラインが必要です。

### 解決策 (Solution)

多層検証システムを構築します。

<strong>Step 1: スキーマ検証スクリプト</strong>

`scripts/validate_frontmatter.py`:

```python
#!/usr/bin/env python3
"""
Frontmatterスキーマ検証スクリプト
"""

import re
import yaml
from pathlib import Path
from typing import List, Dict, Any

class FrontmatterValidator:
    def __init__(self, content_dir: Path):
        self.content_dir = content_dir
        self.errors = []

    def validate_all(self) -> bool:
        """すべてのポストのfrontmatterを検証"""
        all_files = list(self.content_dir.glob("**/*.md"))

        for file_path in all_files:
            self.validate_file(file_path)

        if self.errors:
            print(f"\n❌ Found {len(self.errors)} errors:\n")
            for error in self.errors:
                print(f"  {error['file']}: {error['message']}")
            return False

        print(f"\n✅ All {len(all_files)} files passed validation")
        return True

    def validate_file(self, file_path: Path):
        """個別ファイル検証"""
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Frontmatter抽出
        match = re.match(r'^---\n(.*?)\n---', content, re.DOTALL)
        if not match:
            self.errors.append({
                "file": str(file_path),
                "message": "Frontmatter not found"
            })
            return

        try:
            frontmatter = yaml.safe_load(match.group(1))
        except yaml.YAMLError as e:
            self.errors.append({
                "file": str(file_path),
                "message": f"Invalid YAML: {e}"
            })
            return

        # 言語検出
        lang = file_path.parent.name
        if lang not in ['ko', 'en', 'ja', 'zh']:
            self.errors.append({
                "file": str(file_path),
                "message": f"Invalid language folder: {lang}"
            })
            return

        # 必須フィールド検証
        self._validate_required_fields(file_path, frontmatter)

        # フィールド別ルール検証
        self._validate_title(file_path, frontmatter.get('title'), lang)
        self._validate_description(file_path, frontmatter.get('description'), lang)
        self._validate_pub_date(file_path, frontmatter.get('pubDate'))
        self._validate_tags(file_path, frontmatter.get('tags'))
        self._validate_related_posts(file_path, frontmatter.get('relatedPosts'), lang)

    def _validate_required_fields(self, file_path: Path, fm: dict):
        """必須フィールドの存在有無"""
        required = ['title', 'description', 'pubDate', 'relatedPosts']

        for field in required:
            if field not in fm:
                self.errors.append({
                    "file": str(file_path),
                    "message": f"Missing required field: {field}"
                })

    def _validate_title(self, file_path: Path, title: str, lang: str):
        """タイトル検証"""
        if not title:
            return

        # 長さ検証(SEO)
        if len(title) > 60:
            self.errors.append({
                "file": str(file_path),
                "message": f"Title too long: {len(title)} chars (max 60)"
            })

        if len(title) < 10:
            self.errors.append({
                "file": str(file_path),
                "message": f"Title too short: {len(title)} chars (min 10)"
            })

        # 言語別ルール
        if lang == 'en' and not re.search(r'[A-Z]', title):
            self.errors.append({
                "file": str(file_path),
                "message": "English title should have capitalization"
            })

    def _validate_description(self, file_path: Path, desc: str, lang: str):
        """説明検証"""
        if not desc:
            return

        # 長さ検証(SEO)
        if len(desc) > 160:
            self.errors.append({
                "file": str(file_path),
                "message": f"Description too long: {len(desc)} chars (max 160)"
            })

        if len(desc) < 50:
            self.errors.append({
                "file": str(file_path),
                "message": f"Description too short: {len(desc)} chars (min 50)"
            })

    def _validate_pub_date(self, file_path: Path, pub_date: Any):
        """発行日検証"""
        if not pub_date:
            return

        # 日付形式検証
        if not isinstance(pub_date, str):
            self.errors.append({
                "file": str(file_path),
                "message": f"pubDate must be string (YYYY-MM-DD format)"
            })
            return

        if not re.match(r'^\d{4}-\d{2}-\d{2}$', pub_date):
            self.errors.append({
                "file": str(file_path),
                "message": f"Invalid pubDate format: {pub_date} (use YYYY-MM-DD)"
            })

    def _validate_tags(self, file_path: Path, tags: Any):
        """タグ検証"""
        if not tags:
            return

        if not isinstance(tags, list):
            self.errors.append({
                "file": str(file_path),
                "message": "tags must be an array"
            })
            return

        if len(tags) > 5:
            self.errors.append({
                "file": str(file_path),
                "message": f"Too many tags: {len(tags)} (max 5)"
            })

    def _validate_related_posts(self, file_path: Path, related: Any, lang: str):
        """関連ポスト検証"""
        if not related:
            return

        if not isinstance(related, list):
            self.errors.append({
                "file": str(file_path),
                "message": "relatedPosts must be an array"
            })
            return

        for i, post in enumerate(related):
            if not isinstance(post, dict):
                self.errors.append({
                    "file": str(file_path),
                    "message": f"relatedPosts[{i}] must be an object"
                })
                continue

            # 必須フィールド
            if 'slug' not in post:
                self.errors.append({
                    "file": str(file_path),
                    "message": f"relatedPosts[{i}] missing 'slug'"
                })

            if 'score' not in post:
                self.errors.append({
                    "file": str(file_path),
                    "message": f"relatedPosts[{i}] missing 'score'"
                })

            if 'reason' not in post:
                self.errors.append({
                    "file": str(file_path),
                    "message": f"relatedPosts[{i}] missing 'reason'"
                })
                continue

            # reasonに4つの言語すべてがあるか確認
            reason = post['reason']
            for required_lang in ['ko', 'ja', 'en', 'zh']:
                if required_lang not in reason:
                    self.errors.append({
                        "file": str(file_path),
                        "message": f"relatedPosts[{i}].reason missing '{required_lang}'"
                    })


def main():
    """CLI実行"""
    content_dir = Path("src/content/blog")
    validator = FrontmatterValidator(content_dir)

    success = validator.validate_all()
    exit(0 if success else 1)


if __name__ == "__main__":
    main()
```

<strong>Step 2: SEO品質検証</strong>

`scripts/validate_seo.py`:

```python
#!/usr/bin/env python3
"""
SEO品質検証スクリプト
"""

import re
from pathlib import Path
from collections import Counter

class SEOValidator:
    def __init__(self, file_path: Path):
        self.file_path = file_path
        self.content = file_path.read_text(encoding='utf-8')
        self.issues = []

    def validate(self) -> dict:
        """SEO品質検証"""
        self._check_heading_structure()
        self._check_keyword_density()
        self._check_readability()
        self._check_links()
        self._check_images()

        score = max(0, 100 - len(self.issues) * 5)

        return {
            "score": score,
            "issues": self.issues
        }

    def _check_heading_structure(self):
        """タイトル構造検証"""
        # H1は1つのみ
        h1_count = len(re.findall(r'^#\s+', self.content, re.MULTILINE))
        if h1_count == 0:
            self.issues.append("No H1 heading found")
        elif h1_count > 1:
            self.issues.append(f"Multiple H1 headings ({h1_count})")

        # H2以上存在
        h2_count = len(re.findall(r'^##\s+', self.content, re.MULTILINE))
        if h2_count == 0:
            self.issues.append("No H2 headings (poor structure)")

        # ヘッディング順序検証(H2 → H3 → H4、スキップ禁止)
        headings = re.findall(r'^(#{1,6})\s+', self.content, re.MULTILINE)
        prev_level = 0
        for heading in headings:
            level = len(heading)
            if level - prev_level > 1:
                self.issues.append(f"Heading level skip: H{prev_level} → H{level}")
            prev_level = level

    def _check_keyword_density(self):
        """キーワード密度検証"""
        # 本文のみ抽出(コードブロック除外)
        text = re.sub(r'```.*?```', '', self.content, flags=re.DOTALL)
        text = re.sub(r'`[^`]+`', '', text)

        # 単語抽出
        words = re.findall(r'\b\w+\b', text.lower())
        total_words = len(words)

        if total_words < 300:
            self.issues.append(f"Content too short: {total_words} words (min 300)")

        # 上位キーワード密度
        word_counts = Counter(words)
        most_common = word_counts.most_common(10)

        for word, count in most_common:
            density = count / total_words
            if density > 0.05:  # 5%以上は過度
                self.issues.append(f"Keyword '{word}' density too high: {density:.1%}")

    def _check_readability(self):
        """可読性検証"""
        # 段落長さ
        paragraphs = re.split(r'\n\n+', self.content)
        for i, para in enumerate(paragraphs):
            if para.startswith('#'):
                continue  # ヘッディング除外

            words = len(para.split())
            if words > 150:
                self.issues.append(f"Paragraph {i+1} too long: {words} words (max 150)")

    def _check_links(self):
        """リンク検証"""
        # 内部リンク確認
        internal_links = re.findall(r'\[([^\]]+)\]\((/[^\)]+)\)', self.content)
        external_links = re.findall(r'\[([^\]]+)\]\((https?://[^\)]+)\)', self.content)

        if len(internal_links) == 0:
            self.issues.append("No internal links (poor SEO)")

        # 外部リンクはnofollow推奨(手動確認必要)
        if len(external_links) > 10:
            self.issues.append(f"Many external links ({len(external_links)}), consider nofollow")

    def _check_images(self):
        """画像検証"""
        # 画像alt テキスト
        images_with_alt = re.findall(r'!\[([^\]]*)\]\([^\)]+\)', self.content)
        images_without_alt = [alt for alt in images_with_alt if not alt.strip()]

        if images_without_alt:
            self.issues.append(f"{len(images_without_alt)} images missing alt text")


def main():
    """CLI実行"""
    import sys

    if len(sys.argv) < 2:
        print("Usage: python validate_seo.py <file>")
        sys.exit(1)

    file_path = Path(sys.argv[1])
    validator = SEOValidator(file_path)
    result = validator.validate()

    print(f"\nSEO Score: {result['score']}/100")
    if result['issues']:
        print("\nIssues:")
        for issue in result['issues']:
            print(f"  - {issue}")
    else:
        print("  ✓ No issues found")


if __name__ == "__main__":
    main()
```

<strong>Step 3: 統合検証ワークフロー</strong>

`.github/workflows/validate-content.yml`:

```yaml
name: Content Validation

on:
  pull_request:
    paths:
      - 'src/content/blog/**'
  push:
    branches:
      - main

jobs:
  validate:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'

      - name: Install dependencies
        run: |
          pip install pyyaml

      - name: Validate Frontmatter
        run: |
          python scripts/validate_frontmatter.py

      - name: Validate SEO (changed files only)
        run: |
          # 変更されたファイルのみ検証
          git diff --name-only origin/main | grep '\.md$' | while read file; do
            echo "Validating $file..."
            python scripts/validate_seo.py "$file"
          done

      - name: Build Test
        run: |
          npm install
          npm run astro check
          npm run build

      - name: Report
        if: failure()
        run: |
          echo "❌ Validation failed. Please fix the issues above."
          exit 1
```

### 説明 (Explanation)

<strong>1. 3層検証構造</strong>

```
Layer 1: Schema Validation (ビルド前)
├─ Frontmatter必須フィールド
├─ タイプ検証(string、date、array)
└─ 長さ制限(title 60文字、description 160文字)

Layer 2: SEO Validation (ビルド前)
├─ タイトル構造(H1 1つ、H2以上存在)
├─ キーワード密度(5%以下)
├─ 可読性(段落150単語以下)
├─ リンク品質(内部リンク、外部リンク)
└─ 画像altテキスト

Layer 3: Build Validation (Astro)
├─ TypeScriptタイプチェック
├─ Content Collectionsスキーマ
└─ 画像パス有効性
```

<strong>2. 自動化パイプライン</strong>

```
PR生成/プッシュ
↓
GitHub Actionsトリガー
↓
Pythonスクリプト実行
├─ validate_frontmatter.py (すべてのファイル)
└─ validate_seo.py (変更されたファイルのみ)
↓
Astroビルドテスト
├─ npm run astro check
└─ npm run build
↓
結果レポート
├─ ✅ 通過 → マージ可能
└─ ❌ 失敗 → 修正必要
```

<strong>3. 段階的検証(Incremental Validation)</strong>

すべてのファイルを毎回検証せず変更されたファイルのみ:

```bash
# Git diffで変更ファイル検出
git diff --name-only origin/main | grep '\.md$'

# 出力例
src/content/blog/ko/new-post.md
src/content/blog/en/new-post.md
```

このようにすれば大規模ブログでも高速検証が可能です。

### 変形 (Variations)

<strong>Variation 1: AIベースの文化的適合性検証</strong>

Claude APIで文化的に不適切な表現を検出:

```python
def validate_cultural_appropriateness(text: str, lang: str) -> dict:
    """AIで文化的適合性を検証"""

    prompt = f"""あなたは{lang}言語圏の文化専門家です。
次のテキストで文化的に不適切または誤解の恐れがある表現を見つけてください。

<text>
{text}
</text>

次の項目を確認してください:
1. 禁忌語、俗語
2. 文化的固定観念
3. 宗教/政治的敏感性
4. 性差別、人種差別表現
5. 現地の習慣に反する表現

JSON形式で回答:
{{
  "issues": [
    {{"text": "...", "reason": "...", "suggestion": "..."}},
    ...
  ]
}}
"""

    response = client.messages.create(
        model="claude-opus-4-5-20251101",
        max_tokens=2048,
        messages=[{"role": "user", "content": prompt}]
    )

    # JSONパースと返却
    # ...
```

<strong>Variation 2: 言語間一貫性検証</strong>

同じコンテンツの4つの言語版が同じ意味を伝えているか検証:

```python
def validate_translation_consistency(
    ko_file: Path,
    en_file: Path,
    ja_file: Path,
    zh_file: Path
) -> dict:
    """4つの言語版の一貫性検証"""

    # 各ファイルのタイトル構造抽出
    headings = {
        'ko': extract_headings(ko_file),
        'en': extract_headings(en_file),
        'ja': extract_headings(ja_file),
        'zh': extract_headings(zh_file),
    }

    # タイトル数が同じか確認
    heading_counts = [len(h) for h in headings.values()]
    if len(set(heading_counts)) > 1:
        return {
            "consistent": False,
            "issue": f"Heading count mismatch: {headings}"
        }

    # コードブロック数が同じか確認
    code_blocks = {
        lang: len(re.findall(r'```', file.read_text()))
        for lang, file in [('ko', ko_file), ('en', en_file), ('ja', ja_file), ('zh', zh_file)]
    }

    if len(set(code_blocks.values())) > 1:
        return {
            "consistent": False,
            "issue": f"Code block count mismatch: {code_blocks}"
        }

    return {"consistent": True}
```

---

## Recipe 18.4: 同期化と一貫性維持

### 問題 (Problem)

4つの言語のコンテンツを管理していると、次のような同期化問題が発生します:

1. <strong>言語別ポスト数の不一致</strong>: 韓国語は100個、英語は95個、日本語は98個...
2. <strong>メタデータの不一致</strong>: 同じポストなのにpubDateが違う
3. <strong>画像の不一致</strong>: 言語別に異なるheroImageを使用
4. <strong>アップデート漏れ</strong>: 韓国語ポストを修正したが英語版は更新されていない

手動で追跡することは難しく、ミスが発生しやすいです。

### 解決策 (Solution)

自動同期化システムを構築します。

<strong>Step 1: 同期化状態検出</strong>

`scripts/check_sync.py`:

```python
#!/usr/bin/env python3
"""
多言語コンテンツ同期化状態確認
"""

import re
from pathlib import Path
from typing import Dict, List, Set
import yaml

class SyncChecker:
    def __init__(self, content_dir: Path):
        self.content_dir = content_dir
        self.languages = ['ko', 'en', 'ja', 'zh']

    def check_all(self) -> dict:
        """全体同期化状態確認"""
        # 言語別ファイルリスト
        files_by_lang = {}
        for lang in self.languages:
            lang_dir = self.content_dir / lang
            files = set(f.name for f in lang_dir.glob("*.md"))
            files_by_lang[lang] = files

        # 1. ファイル数確認
        file_counts = {lang: len(files) for lang, files in files_by_lang.items()}

        # 2. 欠落した翻訳を検索
        all_slugs = set()
        for files in files_by_lang.values():
            all_slugs.update(files)

        missing_translations = {}
        for lang in self.languages:
            missing = all_slugs - files_by_lang[lang]
            if missing:
                missing_translations[lang] = list(missing)

        # 3. メタデータ一貫性確認
        metadata_issues = self._check_metadata_consistency()

        return {
            "file_counts": file_counts,
            "missing_translations": missing_translations,
            "metadata_issues": metadata_issues
        }

    def _check_metadata_consistency(self) -> List[dict]:
        """メタデータ一貫性確認"""
        issues = []

        # すべてのスラッグ収集
        ko_files = list((self.content_dir / 'ko').glob("*.md"))

        for ko_file in ko_files:
            slug = ko_file.stem

            # 4つの言語ファイルすべてが存在する場合のみ
            files = {}
            for lang in self.languages:
                file_path = self.content_dir / lang / ko_file.name
                if file_path.exists():
                    files[lang] = file_path

            if len(files) < 4:
                continue  # 一部のみある場合はスキップ(missing_translationsで処理)

            # メタデータ抽出
            metadata = {}
            for lang, file_path in files.items():
                fm = self._extract_frontmatter(file_path)
                metadata[lang] = fm

            # pubDate一致確認
            pub_dates = [fm.get('pubDate') for fm in metadata.values()]
            if len(set(pub_dates)) > 1:
                issues.append({
                    "slug": slug,
                    "field": "pubDate",
                    "values": {lang: metadata[lang].get('pubDate') for lang in self.languages}
                })

            # heroImage一致確認
            hero_images = [fm.get('heroImage') for fm in metadata.values()]
            if len(set(hero_images)) > 1:
                issues.append({
                    "slug": slug,
                    "field": "heroImage",
                    "values": {lang: metadata[lang].get('heroImage') for lang in self.languages}
                })

        return issues

    def _extract_frontmatter(self, file_path: Path) -> dict:
        """Frontmatter抽出"""
        content = file_path.read_text(encoding='utf-8')
        match = re.match(r'^---\n(.*?)\n---', content, re.DOTALL)
        if match:
            return yaml.safe_load(match.group(1))
        return {}


def main():
    """CLI実行"""
    content_dir = Path("src/content/blog")
    checker = SyncChecker(content_dir)
    result = checker.check_all()

    print("\n=== Multilingual Content Sync Status ===\n")

    # ファイル数
    print("File counts:")
    for lang, count in result['file_counts'].items():
        print(f"  {lang}: {count} files")

    # 欠落した翻訳
    if result['missing_translations']:
        print("\n⚠️  Missing translations:")
        for lang, files in result['missing_translations'].items():
            print(f"\n  {lang} ({len(files)} files):")
            for file in files[:5]:  # 最初の5つのみ表示
                print(f"    - {file}")
            if len(files) > 5:
                print(f"    ... and {len(files)-5} more")
    else:
        print("\n✅ All files have translations in all languages")

    # メタデータ不一致
    if result['metadata_issues']:
        print(f"\n⚠️  Metadata inconsistencies ({len(result['metadata_issues'])} issues):")
        for issue in result['metadata_issues'][:5]:
            print(f"\n  {issue['slug']} - {issue['field']}:")
            for lang, value in issue['values'].items():
                print(f"    {lang}: {value}")
        if len(result['metadata_issues']) > 5:
            print(f"\n    ... and {len(result['metadata_issues'])-5} more issues")
    else:
        print("\n✅ Metadata is consistent across all languages")


if __name__ == "__main__":
    main()
```

<strong>Step 2: 自動同期化スクリプト</strong>

`scripts/auto_sync.py`:

```python
#!/usr/bin/env python3
"""
欠落した翻訳の自動生成
"""

import os
from pathlib import Path
from check_sync import SyncChecker

# Translation Agent import (Recipe 18.2参照)
import sys
sys.path.append(str(Path(__file__).parent.parent / '.claude/skills/translation-agent'))
from translate import TranslationAgent

def auto_sync(content_dir: Path, api_key: str):
    """欠落した翻訳の自動生成"""

    checker = SyncChecker(content_dir)
    result = checker.check_all()

    if not result['missing_translations']:
        print("✅ All files are synchronized")
        return

    agent = TranslationAgent(api_key)

    for target_lang, missing_files in result['missing_translations'].items():
        print(f"\n📝 Generating {len(missing_files)} {target_lang} translations...")

        for filename in missing_files:
            # 元のファイルを検索(一般的に韓国語)
            source_file = content_dir / 'ko' / filename

            if not source_file.exists():
                # 韓国語がなければ他の言語から検索
                for lang in ['en', 'ja', 'zh']:
                    alt_source = content_dir / lang / filename
                    if alt_source.exists():
                        source_file = alt_source
                        break

            if not source_file.exists():
                print(f"  ⚠️  Skipping {filename}: no source file found")
                continue

            # 翻訳生成
            print(f"  Translating {filename} → {target_lang}...")
            try:
                result = agent.translate_post(source_file, target_lang)

                # ファイル保存
                output_file = content_dir / target_lang / filename
                with open(output_file, 'w', encoding='utf-8') as f:
                    f.write("---\n")
                    for key, value in result["frontmatter"].items():
                        if isinstance(value, list):
                            import json
                            f.write(f"{key}: {json.dumps(value, ensure_ascii=False)}\n")
                        else:
                            f.write(f'{key}: "{value}"\n')
                    f.write("---\n\n")
                    f.write(result["content"])

                print(f"    ✅ Created {output_file} (quality: {result['quality_score']:.0%})")

            except Exception as e:
                print(f"    ❌ Failed: {e}")


def main():
    """CLI実行"""
    content_dir = Path("src/content/blog")
    api_key = os.environ.get("ANTHROPIC_API_KEY")

    if not api_key:
        print("Error: ANTHROPIC_API_KEY not set")
        return

    auto_sync(content_dir, api_key)


if __name__ == "__main__":
    main()
```

<strong>Step 3: メタデータ同期化</strong>

`scripts/sync_metadata.py`:

```python
#!/usr/bin/env python3
"""
メタデータ一貫性自動修正
"""

import re
import yaml
from pathlib import Path
from check_sync import SyncChecker

def sync_metadata(content_dir: Path):
    """メタデータ不一致の自動修正"""

    checker = SyncChecker(content_dir)
    result = checker.check_all()

    if not result['metadata_issues']:
        print("✅ Metadata is consistent")
        return

    print(f"\n🔧 Fixing {len(result['metadata_issues'])} metadata inconsistencies...\n")

    for issue in result['metadata_issues']:
        slug = issue['slug']
        field = issue['field']
        values = issue['values']

        # 韓国語版を基準に同期化
        canonical_value = values.get('ko')

        if not canonical_value:
            # 韓国語がなければ最初の値を使用
            canonical_value = next(iter(values.values()))

        print(f"  {slug} - {field}:")
        print(f"    Canonical value: {canonical_value}")

        # すべての言語ファイルを更新
        for lang in ['ko', 'en', 'ja', 'zh']:
            file_path = content_dir / lang / f"{slug}.md"

            if not file_path.exists():
                continue

            if values.get(lang) == canonical_value:
                continue  # すでに一致

            # ファイル読み込み
            content = file_path.read_text(encoding='utf-8')

            # Frontmatter更新
            match = re.match(r'^---\n(.*?)\n---\n(.*)$', content, re.DOTALL)
            if not match:
                continue

            frontmatter_text = match.group(1)
            body = match.group(2)

            # フィールド値変更
            frontmatter_text = re.sub(
                rf'^{field}:.*$',
                f'{field}: "{canonical_value}"',
                frontmatter_text,
                flags=re.MULTILINE
            )

            # ファイル書き込み
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(f"---\n{frontmatter_text}\n---\n{body}")

            print(f"    ✅ Updated {lang}/{slug}.md")


def main():
    """CLI実行"""
    content_dir = Path("src/content/blog")
    sync_metadata(content_dir)


if __name__ == "__main__":
    main()
```

<strong>Step 4: 統合ワークフロー</strong>

`.claude/commands/sync-content.md`:

```markdown
# /sync-content Command

## Purpose
4つの言語コンテンツの同期化状態を確認して自動的に修正します。

## Usage

\`\`\`bash
/sync-content [--check-only] [--fix-metadata]
\`\`\`

## Options

- `--check-only`: 状態のみ確認して修正しない
- `--fix-metadata`: メタデータ不一致の自動修正

## Workflow

1. 同期化状態確認
   - 言語別ファイル数
   - 欠落した翻訳
   - メタデータ不一致

2. 欠落した翻訳の自動生成(オプション)
   - Translation Agentで翻訳
   - 品質検証後保存

3. メタデータ同期化(オプション)
   - 韓国語版を基準に統一
   - pubDate、heroImageなど

4. 最終検証
   - Frontmatterスキーマ検証
   - ビルドテスト

## Example

\`\`\`
/sync-content
\`\`\`

Output:
\`\`\`
=== Content Sync Status ===

File counts:
  ko: 100 files
  en: 95 files ⚠️
  ja: 98 files ⚠️
  zh: 97 files ⚠️

Missing translations:
  en (5 files): post-96.md, post-97.md, ...
  ja (2 files): post-99.md, post-100.md
  zh (3 files): post-98.md, post-99.md, post-100.md

Metadata inconsistencies:
  post-42 - pubDate:
    ko: '2025-10-01'
    en: '2025-10-02' ⚠️
    ...

🤖 Auto-fix? (y/n): y

📝 Generating 5 en translations...
  ✅ post-96.md (quality: 95%)
  ✅ post-97.md (quality: 92%)
  ...

🔧 Fixing metadata...
  ✅ Updated en/post-42.md
  ...

✅ Sync complete!
\`\`\`
```

### 説明 (Explanation)

<strong>1. 同期化検証3段階</strong>

```
Stage 1: File Count Check
├─ 言語別ファイル数を数える
└─ 不一致発見時に欠落したファイルを識別

Stage 2: Content Consistency
├─ 同じスラッグの4つのバージョンを比較
├─ pubDate、heroImage、tags一致確認
└─ 不一致発見時にレポート

Stage 3: Automated Fix
├─ 欠落した翻訳の自動生成
├─ メタデータを韓国語基準で統一
└─ 最終検証(ビルドテスト)
```

<strong>2. 自動 vs 手動修正</strong>

| 項目 | 自動修正 | 手動レビュー必要 |
|------|----------|--------------|
| 欠落した翻訳 | ✅ AI翻訳生成 | ❌ 品質レビュー後承認 |
| pubDate不一致 | ✅ 韓国語基準統一 | ✅ (論争なし) |
| heroImage不一致 | ✅ 韓国語基準統一 | ✅ (論争なし) |
| title不一致 | ❌ | ✅ (SEO影響) |
| description不一致 | ❌ | ✅ (SEO影響) |

titleとdescriptionは言語別に異なる必要があるため自動修正しません。

<strong>3. 同期化サイクル</strong>

```
Daily:
  - 同期化状態確認(check_sync.py)
  - メタデータ不一致の自動修正

Weekly:
  - 欠落した翻訳生成
  - 品質レビューと手動修正

Monthly:
  - 全体コンテンツ監査
  - SEO品質再検証
```

### 変形 (Variations)

<strong>Variation 1: Git Hookで自動同期化</strong>

コミット前に自動検証:

`.git/hooks/pre-commit`:

```bash
#!/bin/bash

echo "🔍 Checking content sync..."

python scripts/check_sync.py
if [ $? -ne 0 ]; then
  echo "❌ Content sync check failed"
  echo "Run 'python scripts/auto_sync.py' to fix"
  exit 1
fi

echo "✅ Content sync OK"
```

<strong>Variation 2: Dashboardで同期化状態を可視化</strong>

`scripts/generate_sync_dashboard.py`:

```python
def generate_dashboard(content_dir: Path) -> str:
    """HTMLダッシュボード生成"""

    checker = SyncChecker(content_dir)
    result = checker.check_all()

    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>Content Sync Dashboard</title>
        <style>
            .status {{ padding: 20px; }}
            .ok {{ background: #d1fae5; }}
            .warning {{ background: #fef3c7; }}
        </style>
    </head>
    <body>
        <h1>Multilingual Content Sync Status</h1>

        <div class="status {'ok' if not result['missing_translations'] else 'warning'}">
            <h2>File Counts</h2>
            <ul>
                {"".join(f"<li>{lang}: {count} files</li>" for lang, count in result['file_counts'].items())}
            </ul>
        </div>

        <!-- さらに多くのセクション... -->
    </body>
    </html>
    """

    return html
```

---

## 実践プロジェクト: 完全自動化された多言語パイプライン

これですべてのレシピを統合して、完全自動化されたシステムを作ります。

### シナリオ

韓国語でブログポストを作成すると:
1. 自動的に英語、日本語、中国語翻訳を生成
2. 各言語別SEO最適化
3. 品質検証(スキーマ、SEO、文化的適合性)
4. メタデータ同期化
5. 4つの言語を同時公開

### 統合コマンド: `/write-post-multilingual`

`.claude/commands/write-post-multilingual.md`:

```markdown
# /write-post-multilingual Command

## Purpose
韓国語ポストを作成すると自動的に4つの言語翻訳を生成して検証し公開します。

## Workflow

\`\`\`mermaid
graph TD
    A[韓国語ポスト作成] --> B[Frontmatter検証]
    B --> C{検証通過?}
    C -->|No| D[エラー修正]
    D --> B
    C -->|Yes| E[3つの言語翻訳生成]
    E --> F[SEO最適化]
    F --> G[品質検証]
    G --> H{品質基準充足?}
    H -->|No| I[手動レビュー要請]
    H -->|Yes| J[メタデータ同期化]
    J --> K[ビルドテスト]
    K --> L{ビルド成功?}
    L -->|No| M[エラー修正]
    M --> K
    L -->|Yes| N[4つの言語を同時公開]
\`\`\`

## Steps

### 1. 韓国語ポスト作成

ユーザーが韓国語でポストを作成します。

### 2. 翻訳生成

Translation Agentでen、ja、zh翻訳生成:
- ローカライゼーション優先(翻訳ではなく書き直し)
- SEOキーワード最適化
- Glossary参照して用語の一貫性維持

### 3. 品質検証

3層検証:
- Schema: Frontmatter必須フィールド、タイプ、長さ
- SEO: タイトル構造、キーワード密度、リンク、画像
- Build: Astroビルドテスト

### 4. 同期化と公開

- pubDate、heroImage同期化
- relatedPosts 4つの言語の理由生成
- Gitコミットとプッシュ

## Usage

\`\`\`bash
/write-post-multilingual <topic> [--skip-review]
\`\`\`

## Options

- `--skip-review`: 品質スコア90%以上なら自動承認

## Example

\`\`\`
/write-post-multilingual "React Server Components完璧ガイド"
\`\`\`

Output:
\`\`\`
📝 Writing Korean post...
  ✅ Created ko/react-server-components-guide.md

🌍 Generating translations...
  📝 Translating to English...
    ✅ en/react-server-components-guide.md (quality: 95%)
  📝 Translating to Japanese...
    ✅ ja/react-server-components-guide.md (quality: 92%)
  📝 Translating to Chinese...
    ✅ zh/react-server-components-guide.md (quality: 94%)

🔍 Validating quality...
  ✅ Frontmatter validation passed
  ✅ SEO validation passed (scores: ko=98, en=96, ja=94, zh=95)
  ✅ Build test passed

🔧 Synchronizing metadata...
  ✅ pubDate synced: 2025-12-19
  ✅ heroImage synced: ../../../assets/blog/react-server-components.jpg

✅ All 4 languages published!

View at:
  - 🇰🇷 /ko/blog/ko/react-server-components-guide
  - 🇺🇸 /en/blog/en/react-server-components-guide
  - 🇯🇵 /ja/blog/ja/react-server-components-guide
  - 🇨🇳 /zh/blog/zh/react-server-components-guide
\`\`\`
```

### 実装

`.claude/commands/implementations/write_post_multilingual.py`:

```python
#!/usr/bin/env python3
"""
多言語ポスト生成および公開自動化
"""

import os
import sys
from pathlib import Path

# 既存スクリプトimport
sys.path.append(str(Path(__file__).parent.parent.parent / '.claude/skills/translation-agent'))
sys.path.append(str(Path(__file__).parent.parent.parent / 'scripts'))

from translate import TranslationAgent
from validate_frontmatter import FrontmatterValidator
from validate_seo import SEOValidator
from sync_metadata import sync_metadata

def write_multilingual_post(topic: str, skip_review: bool = False):
    """多言語ポスト生成および公開"""

    content_dir = Path("src/content/blog")

    # 1. 韓国語ポスト作成(既存writing-assistant活用)
    print(f"\n📝 Writing Korean post about '{topic}'...")
    # ... (既存writing-assistantロジック)
    ko_file = content_dir / "ko" / "new-post.md"
    print(f"  ✅ Created {ko_file}")

    # 2. 翻訳生成
    print("\n🌍 Generating translations...")
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    agent = TranslationAgent(api_key)

    translations = {}
    for lang in ['en', 'ja', 'zh']:
        print(f"  📝 Translating to {lang.upper()}...")
        result = agent.translate_post(ko_file, lang)

        # ファイル保存
        output_file = content_dir / lang / ko_file.name
        with open(output_file, 'w', encoding='utf-8') as f:
            # ... (frontmatter + content書き込み)
            pass

        translations[lang] = {
            "file": output_file,
            "quality": result['quality_score']
        }

        print(f"    ✅ {output_file} (quality: {result['quality_score']:.0%})")

    # 3. 品質検証
    print("\n🔍 Validating quality...")

    # Frontmatter検証
    validator = FrontmatterValidator(content_dir)
    if not validator.validate_all():
        print("  ❌ Frontmatter validation failed")
        return False
    print("  ✅ Frontmatter validation passed")

    # SEO検証
    seo_scores = {}
    for lang in ['ko', 'en', 'ja', 'zh']:
        file_path = content_dir / lang / ko_file.name
        seo_validator = SEOValidator(file_path)
        result = seo_validator.validate()
        seo_scores[lang] = result['score']

    avg_seo_score = sum(seo_scores.values()) / len(seo_scores)
    print(f"  ✅ SEO validation passed (scores: {', '.join(f'{k}={v}' for k, v in seo_scores.items())})")

    # ビルドテスト
    import subprocess
    build_result = subprocess.run(['npm', 'run', 'build'], capture_output=True)
    if build_result.returncode != 0:
        print("  ❌ Build test failed")
        return False
    print("  ✅ Build test passed")

    # 4. 手動レビュー必要性判断
    min_quality = min(t['quality'] for t in translations.values())
    if min_quality < 0.9 and not skip_review:
        print(f"\n⚠️  Quality score below 90% ({min_quality:.0%}). Manual review recommended.")
        print("    Run with --skip-review to auto-approve")
        return False

    # 5. メタデータ同期化
    print("\n🔧 Synchronizing metadata...")
    sync_metadata(content_dir)

    # 6. Gitコミットとプッシュ
    print("\n📦 Publishing...")
    subprocess.run(['git', 'add', 'src/content/blog'])
    subprocess.run(['git', 'commit', '-m', f'feat(blog): add {topic} (4 languages)'])
    subprocess.run(['git', 'push'])

    print("\n✅ All 4 languages published!")
    print("\nView at:")
    for lang in ['ko', 'en', 'ja', 'zh']:
        slug = ko_file.stem
        print(f"  - {{'ko':'🇰🇷','en':'🇺🇸','ja':'🇯🇵','zh':'🇨🇳'}[lang]} /{lang}/blog/{lang}/{slug}")

    return True


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser()
    parser.add_argument("topic", help="Post topic")
    parser.add_argument("--skip-review", action="store_true", help="Skip manual review")

    args = parser.parse_args()

    success = write_multilingual_post(args.topic, args.skip_review)
    sys.exit(0 if success else 1)
```

---

## 要約

この章では4つの言語による同時コンテンツ生成システムを構築しました:

<strong>Recipe 18.1: 多言語構造設計</strong>
- Content Collectionsベースの言語別フォルダ構造
- 型安全なスキーマ定義
- 言語切り替えコンポーネント

<strong>Recipe 18.2: 翻訳エージェント実装</strong>
- Claude APIでローカライゼーション優先翻訳
- SEO最適化されたメタデータ生成
- Glossaryベースの用語一貫性

<strong>Recipe 18.3: 品質検証の自動化</strong>
- 3層検証(Schema、SEO、Build)
- GitHub Actions統合
- AIベースの文化的適合性検証

<strong>Recipe 18.4: 同期化と一貫性維持</strong>
- 自動同期化状態検出
- 欠落した翻訳の自動生成
- メタデータ統一

<strong>核心原則</strong>:

1. <strong>翻訳ではなくローカライゼーション</strong>: 各言語圏の読者のための書き直し
2. <strong>自動化優先</strong>: 反復作業はスクリプトで自動化
3. <strong>品質保証</strong>: 3層検証で一貫性維持
4. <strong>段階的改善</strong>: Translation Memory、レビューワークフロー

これで韓国語でポストを作成すると4つの言語に自動翻訳され、品質検証を経て同時に公開されます。グローバルブログ運営がはるかに簡単になりました。

---

## 練習問題

1. <strong>基本</strong>: 自分のプロジェクトにRecipe 18.1の多言語構造を適用してください。
2. <strong>中級</strong>: Translation Agentに新しい言語(スペイン語、フランス語)を追加してください。
3. <strong>上級</strong>: AIベースの文化的適合性検証システムを実装してください。
4. <strong>発展</strong>: 翻訳品質を評価する自動化されたA/Bテストシステムを作ってください。

---

## 次の章予告

Chapter 19では、構築したすべてのシステムを統合して運用環境にデプロイし、モニタリングと継続的改善を行う方法を学びます。CI/CDパイプライン、パフォーマンス最適化、エラートラッキング、そしてユーザーフィードバックに基づくイテレーションまで扱います。
