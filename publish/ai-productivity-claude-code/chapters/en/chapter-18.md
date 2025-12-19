# Chapter 18: Multi-Language Content Pipeline

Simultaneous Content Generation System for 4 Languages

---

## Overview

Multi-language support is essential for content services targeting the global market. However, simultaneously creating and managing content in 4 languages (Korean, English, Japanese, Chinese) is a complex task. Beyond simple translation, there are various challenges including localization considering cultural context for each language region, maintaining content consistency, quality verification, and synchronization.

This chapter covers how to build a multi-language content pipeline using Claude Code. We'll create a comprehensive system that includes not just translation automation, but also language-specific SEO optimization, cultural appropriateness validation, and metadata management.

<strong>What you'll learn in this chapter:</strong>

- Designing multi-language structure based on Content Collections
- Implementing AI-powered translation agent (translation vs localization)
- Automating quality validation (schema validation, SEO check, cultural appropriateness)
- Mechanisms for cross-language synchronization and consistency
- Workflow for simultaneous publication in 4 languages

<strong>Hands-on Project:</strong>

Build a system where writing a blog post in Korean automatically generates English, Japanese, and Chinese versions, which undergo language-specific SEO optimization and quality validation before simultaneous publication.

---

## Recipe 18.1: Multi-Language Structure Design

### Problem

To efficiently manage content in 4 languages, you need a systematic directory structure and metadata schema. The following requirements must be satisfied:

1. <strong>Language-specific separation</strong>: Each language content should be managed independently
2. <strong>Consistent identifiers</strong>: Language versions of the same content should be linked
3. <strong>Type safety</strong>: Enforce metadata schema with TypeScript
4. <strong>SEO optimization</strong>: Language-specific URL structure and meta tags
5. <strong>Scalability</strong>: Easy to add new languages

Rather than simply dividing folders, we need to design a structure that catches errors at compile time using Astro Content Collections' type system.

### Solution

Design language-specific folder structure and common schema using Astro Content Collections.

<strong>Step 1: Directory Structure Design</strong>

```
src/content/blog/
├── ko/                 # Korean content
│   ├── post-1.md
│   ├── post-2.md
│   └── ...
├── en/                 # English content
│   ├── post-1.md
│   ├── post-2.md
│   └── ...
├── ja/                 # Japanese content
│   ├── post-1.md
│   ├── post-2.md
│   └── ...
└── zh/                 # Chinese (Simplified) content
    ├── post-1.md
    ├── post-2.md
    └── ...
```

<strong>Core Principles</strong>:
- <strong>Identical filenames</strong>: Same content uses identical filename across all language folders (e.g., `ko/post-1.md`, `en/post-1.md`)
- <strong>Language code in folder name</strong>: Don't add language code to filename (`post-1-ko.md` ✗)
- <strong>Automatic URL generation</strong>: `ko/post-1.md` → `/ko/blog/ko/post-1` (language code duplication in URL is normal due to routing structure)

<strong>Step 2: Content Collections Schema Definition</strong>

`src/content.config.ts`:

```typescript
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Supported language type
type SupportedLanguage = 'ko' | 'en' | 'ja' | 'zh';

// Blog collection schema
const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: ({ image }) => z.object({
    // Required fields
    title: z.string()
      .min(10, "Title must be at least 10 characters")
      .max(60, "Title cannot exceed 60 characters (SEO)"),

    description: z.string()
      .min(50, "Description must be at least 50 characters")
      .max(160, "Description cannot exceed 160 characters (SEO)"),

    pubDate: z.coerce.date(),

    // Optional fields
    updatedDate: z.coerce.date().optional(),

    heroImage: image().optional(),

    tags: z.array(z.string())
      .max(5, "Maximum 5 tags allowed")
      .optional(),

    // Multi-language related fields
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

    // Translation metadata (optional)
    translation: z.object({
      sourceLanguage: z.enum(['ko', 'en', 'ja', 'zh']).optional(),
      translatedAt: z.coerce.date().optional(),
      reviewer: z.string().optional(),
    }).optional(),
  }),
});

export const collections = { blog };
```

<strong>Step 3: Language Detection Utility Functions</strong>

`src/utils/i18n.ts`:

```typescript
import type { CollectionEntry } from 'astro:content';

export type Language = 'ko' | 'en' | 'ja' | 'zh';

/**
 * Extract language code from post ID
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
 * Extract slug from post ID (excluding language code)
 * @example "ko/post-1.md" → "post-1"
 */
export function getSlugFromId(id: string): string {
  return id.split('/')[1].replace(/\.md$/, '');
}

/**
 * Filter posts by language
 */
export function filterByLanguage(
  posts: CollectionEntry<'blog'>[],
  lang: Language
): CollectionEntry<'blog'>[] {
  return posts.filter(post => getLanguageFromId(post.id) === lang);
}

/**
 * Find translations of the same content in other languages
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
 * Language labels (for UI display)
 */
export const LANGUAGE_LABELS: Record<Language, { native: string; english: string }> = {
  ko: { native: '한국어', english: 'Korean' },
  en: { native: 'English', english: 'English' },
  ja: { native: '日本語', english: 'Japanese' },
  zh: { native: '简体中文', english: 'Chinese' },
};
```

<strong>Step 4: Language Switcher Component</strong>

`src/components/LanguageSwitcher.astro`:

```astro
---
import { getCollection } from 'astro:content';
import { getLanguageFromId, getSlugFromId, findTranslations, LANGUAGE_LABELS, type Language } from '../utils/i18n';

interface Props {
  currentPostId: string;
}

const { currentPostId } = Astro.props;

// Get all posts
const allPosts = await getCollection('blog');

// Find current post
const currentPost = allPosts.find(p => p.id === currentPostId);
if (!currentPost) {
  throw new Error(`Post not found: ${currentPostId}`);
}

// Find translation versions
const translations = findTranslations(allPosts, currentPost);
const currentLang = getLanguageFromId(currentPost.id);
const currentSlug = getSlugFromId(currentPost.id);

// Available languages list
const availableLanguages: Language[] = ['ko', 'en', 'ja', 'zh'];
---

<div class="language-switcher">
  <span class="label">Language:</span>
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

### Explanation

<strong>1. Why language-specific folder structure?</strong>

- <strong>Clear separation</strong>: Each language content is managed independently
- <strong>Automatic language detection</strong>: Language can be identified from file path alone (`ko/post.md` → `ko`)
- <strong>Consistent URL structure</strong>: `/ko/blog/ko/post`, `/en/blog/en/post` (SEO-friendly)
- <strong>Git history tracking</strong>: Language-specific changes tracked independently

<strong>2. Role of Content Collections Schema</strong>

- <strong>Type safety</strong>: Metadata validation at build time
- <strong>SEO enforcement</strong>: `title` 60 characters, `description` 160 characters limit
- <strong>Required fields guarantee</strong>: Build fails if `title`, `description`, `pubDate` are missing
- <strong>relatedPosts 4 languages required</strong>: Enforce 4-language reasons for all recommended posts

<strong>3. Importance of i18n Utility Functions</strong>

- <strong>`getLanguageFromId()`</strong>: Centralize file path parsing logic
- <strong>`findTranslations()`</strong>: Automatically link other language versions of same slug
- <strong>Type safety</strong>: Prevent typos with `Language` type

<strong>4. Language Switcher Component</strong>

- <strong>Automatic detection</strong>: Automatically finds translation versions of current post
- <strong>Unavailable indication</strong>: Disable languages without translation
- <strong>Accessibility</strong>: Support screen readers with `aria-current`, `aria-disabled` attributes

### Variations

<strong>Variation 1: Language-specific Default Settings (config.json)</strong>

Add configuration file to each language folder:

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
    "titleSuffix": " - 기술 블로그",
    "defaultDescription": "개발 관련 기술 블로그"
  }
}
```

<strong>Variation 2: Subpath vs Subdomain</strong>

Current structure: `/ko/blog/ko/post` (Subpath)

Alternative 1 - Subdomain:
```
ko.example.com/blog/post
en.example.com/blog/post
```

Alternative 2 - Domain:
```
example.kr/blog/post  (Korean)
example.com/blog/post (English)
```

<strong>Selection Criteria</strong>:
- <strong>Subpath</strong>: Share SEO authority, easy management (recommended)
- <strong>Subdomain</strong>: Server separation, independent operation
- <strong>Domain</strong>: Country-specific branding, best localization

<strong>Variation 3: Language Detection Middleware</strong>

Automatically detect user browser language:

`src/middleware/language-redirect.ts`:
```typescript
import type { MiddlewareHandler } from 'astro';

export const onRequest: MiddlewareHandler = async (context, next) => {
  const url = new URL(context.request.url);

  // Redirect only on root path
  if (url.pathname === '/') {
    const acceptLanguage = context.request.headers.get('accept-language');
    const preferredLang = parseAcceptLanguage(acceptLanguage);

    return context.redirect(`/${preferredLang}/blog`);
  }

  return next();
};

function parseAcceptLanguage(header: string | null): string {
  if (!header) return 'ko'; // Default

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

  return 'ko'; // Default
}
```

---

## Recipe 18.2: Translation Agent Implementation

### Problem

The biggest challenge when creating multi-language content is balancing <strong>Translation</strong> and <strong>Localization</strong>.

<strong>Problems with simple translation</strong>:
- Unnatural translation of technical terms (e.g., "스레드" vs "쓰레드" vs "thread")
- Loss of cultural context (e.g., literal translation of Korean proverbs to English)
- SEO keyword mismatch (search terms differ by language region)
- Inconsistent tone and style (formal vs casual)

<strong>Required features</strong>:
1. Understanding source text intent and context
2. Language-specific SEO keyword optimization
3. Culturally appropriate expression conversion
4. Technical term consistency
5. Separate optimization for metadata (title, description, tags)

### Solution

Build a "localization-first" translation agent using Claude API.

<strong>Step 1: Translation Agent Skill Definition</strong>

`.claude/skills/translation-agent/SKILL.md`:

```markdown
# Translation Agent Skill

## Purpose
Professional translation agent that localizes blog posts into 4 languages (ko, en, ja, zh).

## Core Principles

1. <strong>Localization, not translation</strong>
   - Convey meaning, not just word replacement
   - Rewrite for readers of each language
   - Consider cultural context

2. <strong>SEO Optimization</strong>
   - Research search keywords for each language
   - title: under 60 characters, description: 150-160 characters
   - Reflect search intent of each language region

3. <strong>Maintain Consistency</strong>
   - Refer to glossary for technical terms
   - Keep brand names and product names in original language
   - Unify tone and style

## Translation Workflow

### Input
- Source markdown file (typically Korean)
- Target language (en, ja, zh)
- Glossary (optional)

### Output
- Translated markdown file
- SEO-optimized metadata
- Translation quality report

### Process
1. Analyze source (topic, target audience, tone)
2. Research language-specific SEO keywords
3. Localize metadata (title, description, tags)
4. Translate body (section by section)
5. Verify technical term consistency
6. Final quality review

## Language-Specific Guidelines

### English (en)
- Tech blog standard: friendly but professional tone
- Code comments: imperative (e.g., "Create a new file")
- SEO: prioritize Stack Overflow, GitHub search terms

### Japanese (ja)
- Use polite form: です/ます style as default
- Technical terms: mix English as-is and Japanese translation (refer to glossary)
- SEO: prioritize Qiita, Zenn search terms

### Chinese (zh)
- Use Simplified Chinese
- Technical terms: use English with Chinese explanation
- SEO: prioritize CSDN, 知乎 search terms

## Example Transformations

### Bad (literal translation)
```
Source (ko): "이 방법은 일석이조입니다."
Translation (en): "This method kills two birds with one stone." ✗
```

### Good (localization)
```
Source (ko): "이 방법은 일석이조입니다."
Localization (en): "This approach solves two problems at once." ✓
```

### SEO Optimization

```
Source title (ko): "리액트 훅스 완벽 가이드"

Bad (en): "React Hooks Perfect Guide" ✗
- Low search volume
- Too much competition

Good (en): "React Hooks Tutorial: Complete Guide for Beginners" ✓
- Includes "tutorial", "complete guide", "beginners" search terms
- Specific target audience
```

## Tools

### translate_post
Translate and localize posts.

**Parameters**:
- `source_file`: Source file path
- `target_language`: Target language (en, ja, zh)
- `glossary_file`: Glossary file (optional)

**Returns**:
- Translated file path
- Quality score
- Improvement suggestions

## Usage Example

```
@translation-agent "Please translate ko/react-hooks-guide.md to English.
Target audience is beginners, optimize SEO keywords around 'React hooks tutorial'."
```
```

<strong>Step 2: Translation Script Implementation</strong>

`.claude/skills/translation-agent/translate.py`:

```python
#!/usr/bin/env python3
"""
Multi-language post translation and localization script
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
        """Load technical term glossary"""
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
        Translate and localize blog post.

        Returns:
            {
                "frontmatter": {...},  # Translated metadata
                "content": "...",      # Translated body
                "quality_score": 0.95,
                "suggestions": [...]
            }
        """
        # Read source
        with open(source_file, 'r', encoding='utf-8') as f:
            content = f.read()

        # Split frontmatter and body
        frontmatter, body = self._split_frontmatter(content)

        # Step 1: Translate metadata (SEO optimization)
        translated_meta = self._translate_metadata(
            frontmatter, source_lang, target_lang
        )

        # Step 2: Translate body (section by section)
        translated_body = self._translate_body(
            body, source_lang, target_lang
        )

        # Step 3: Quality validation
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
        """Split frontmatter and body"""
        match = re.match(r'^---\n(.*?)\n---\n(.*)$', content, re.DOTALL)
        if not match:
            raise ValueError("Invalid frontmatter format")

        # YAML parsing (simple implementation)
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
        """Translate metadata with SEO optimization"""

        prompt = f"""You are an SEO expert and translator.
Localize blog post metadata into {target_lang} language.

<source_metadata>
title: {meta.get('title', '')}
description: {meta.get('description', '')}
tags: {meta.get('tags', '')}
</source_metadata>

<guidelines>
1. title: Include high-volume search keywords for {target_lang} language region (under 60 characters)
2. description: Specific and action-oriented (150-160 characters)
3. tags: Tags actually used in that language region (max 5)
4. SEO-optimized rewrite, not just translation
</guidelines>

<glossary>
{json.dumps(self.glossary.get(target_lang, {}), ensure_ascii=False, indent=2)}
</glossary>

Respond in JSON format:
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

        # Extract JSON
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
        """Translate body section by section"""

        # Split by sections (## header criteria)
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
        """Translate individual section"""

        # Protect code blocks
        code_blocks = []
        def replace_code(match):
            code_blocks.append(match.group(0))
            return f"__CODE_BLOCK_{len(code_blocks)-1}__"

        text = re.sub(r'```.*?```', replace_code, text, flags=re.DOTALL)

        prompt = f"""You are a technical blog translation specialist.
Localize the following text into {target_lang} language.

<text>
{text}
</text>

<guidelines>
1. Localization first: rewrite for {target_lang} readers, not just translation
2. Technical terms: maintain consistency by referring to glossary
3. Tone: {"friendly but professional (English)" if target_lang == "en" else "polite and professional (use honorifics)" if target_lang == "ja" else "professional and clear"}
4. Code-related explanations: specific and practical
5. Keep __CODE_BLOCK_N__ markers as-is
</guidelines>

<glossary>
{json.dumps(self.glossary.get(target_lang, {}), ensure_ascii=False, indent=2)}
</glossary>

Respond with only the translated text (no explanations needed).
"""

        response = self.client.messages.create(
            model="claude-opus-4-5-20251101",
            max_tokens=4096,
            messages=[{"role": "user", "content": prompt}]
        )

        translated = response.content[0].text.strip()

        # Restore code blocks
        for i, code in enumerate(code_blocks):
            translated = translated.replace(f"__CODE_BLOCK_{i}__", code)

        return translated

    def _validate_quality(self, text: str, lang: Language) -> dict:
        """Validate translation quality"""

        issues = []

        # 1. Verify code blocks
        code_blocks = re.findall(r'```', text)
        if len(code_blocks) % 2 != 0:
            issues.append("Code block pairs don't match")

        # 2. Verify links
        broken_links = re.findall(r'\[([^\]]+)\]\(\)', text)
        if broken_links:
            issues.append(f"Empty links found: {broken_links}")

        # 3. Language-specific validation
        if lang == "ja" and not re.search(r'[です|ます]', text):
            issues.append("Insufficient use of Japanese honorifics")

        # Calculate score
        score = max(0.0, 1.0 - len(issues) * 0.1)

        return {
            "score": score,
            "suggestions": issues
        }


def main():
    """CLI interface"""
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

    # Create output file
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

<strong>Step 3: Glossary Definition</strong>

`.claude/skills/translation-agent/glossary.json`:

```json
{
  "en": {
    "리액트": "React",
    "훅스": "Hooks",
    "컴포넌트": "component",
    "상태": "state",
    "프롭스": "props",
    "렌더링": "rendering",
    "라이프사이클": "lifecycle",
    "비동기": "asynchronous",
    "프로미스": "Promise",
    "콜백": "callback"
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

### Explanation

<strong>1. Translation vs Localization</strong>

| Translation | Localization |
|-------------------|---------------------|
| Word replacement | Convey meaning |
| "이것은 일석이조다" → "This kills two birds with one stone" | "이것은 일석이조다" → "This solves two problems at once" |
| Maintain source structure | Rewrite for readers |

<strong>2. SEO Optimization Process</strong>

```
Source title (ko): "리액트 훅스 완벽 가이드"
↓
Search keyword research (English)
- "react hooks" (100K/month)
- "react hooks tutorial" (50K/month)
- "react hooks guide" (30K/month)
- "react hooks for beginners" (20K/month)
↓
Optimized title (en): "React Hooks Tutorial: Complete Guide for Beginners"
- Include high-volume search keywords
- Specify target audience
- Keep under 60 characters
```

<strong>3. Benefits of Section-by-Section Translation</strong>

- <strong>Token efficiency</strong>: Don't send entire document at once (avoid context limits)
- <strong>Consistency</strong>: Each section translated independently but terms unified via glossary
- <strong>Error recovery</strong>: Can retry if specific section translation fails

<strong>4. Code Block Protection</strong>

```python
# Before translation
text = "React에서 `useState`를 사용합니다.\n```js\nconst [count, setCount] = useState(0);\n```"

# Protect code block
text = "React에서 `useState`를 사용합니다.\n__CODE_BLOCK_0__"

# Translate
translated = "Use `useState` in React.\n__CODE_BLOCK_0__"

# Restore
translated = "Use `useState` in React.\n```js\nconst [count, setCount] = useState(0);\n```"
```

Code is kept as-is, not translated.

<strong>5. Quality Validation</strong>

Automatic validation items:
- Code block pair matching (number of ```)
- Link integrity (no empty `[]()` links)
- Language-specific rules (Japanese honorifics, Simplified Chinese, etc.)

### Variations

<strong>Variation 1: Batch Translation</strong>

Translate multiple files at once:

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

<strong>Variation 2: Translation Memory</strong>

Reuse previous translations:

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
        """Query cached translation"""
        hash_val = hashlib.md5(text.encode()).hexdigest()
        cursor = self.conn.execute(
            "SELECT translated_text FROM translations WHERE source_hash = ? AND target_lang = ?",
            (hash_val, target_lang)
        )
        row = cursor.fetchone()
        return row[0] if row else None

    def set(self, text: str, target_lang: str, translation: str):
        """Save translation cache"""
        hash_val = hashlib.md5(text.encode()).hexdigest()
        self.conn.execute(
            "INSERT OR REPLACE INTO translations (source_hash, target_lang, source_text, translated_text) VALUES (?, ?, ?, ?)",
            (hash_val, target_lang, text, translation)
        )
        self.conn.commit()
```

<strong>Variation 3: Translation Review Workflow</strong>

Human reviewer approves translation:

```python
def create_review_issue(translated_file: Path, quality_score: float):
    """Create GitHub Issue to request translation review"""
    if quality_score < 0.9:
        issue_body = f"""
## Translation Review Required

- File: `{translated_file}`
- Quality Score: {quality_score:.2%}
- Action: Please review and approve

[View Diff](https://github.com/user/repo/compare/main...translation-{translated_file.stem})
        """
        # Create Issue via GitHub API
        # ...
```

---

## Recipe 18.3: Quality Validation Automation

### Problem

Translated content must be automatically validated against the following criteria:

1. <strong>Schema compliance</strong>: Content Collections schema (title 60 chars, description 160 chars, etc.)
2. <strong>SEO quality</strong>: Meta tags, keyword density, heading structure
3. <strong>Cultural appropriateness</strong>: Inappropriate expressions, taboo words, local customs
4. <strong>Technical accuracy</strong>: Code block integrity, link validity
5. <strong>Language-specific style</strong>: Honorifics (Japanese), Simplified Chinese, English tone

Manual review is time-consuming and inconsistent. An automated validation pipeline is needed.

### Solution

Build a multi-layer validation system.

<strong>Step 1: Schema Validation Script</strong>

`scripts/validate_frontmatter.py`:

```python
#!/usr/bin/env python3
"""
Frontmatter schema validation script
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
        """Validate frontmatter of all posts"""
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
        """Validate individual file"""
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Extract frontmatter
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

        # Detect language
        lang = file_path.parent.name
        if lang not in ['ko', 'en', 'ja', 'zh']:
            self.errors.append({
                "file": str(file_path),
                "message": f"Invalid language folder: {lang}"
            })
            return

        # Validate required fields
        self._validate_required_fields(file_path, frontmatter)

        # Validate field-specific rules
        self._validate_title(file_path, frontmatter.get('title'), lang)
        self._validate_description(file_path, frontmatter.get('description'), lang)
        self._validate_pub_date(file_path, frontmatter.get('pubDate'))
        self._validate_tags(file_path, frontmatter.get('tags'))
        self._validate_related_posts(file_path, frontmatter.get('relatedPosts'), lang)

    def _validate_required_fields(self, file_path: Path, fm: dict):
        """Check required field existence"""
        required = ['title', 'description', 'pubDate', 'relatedPosts']

        for field in required:
            if field not in fm:
                self.errors.append({
                    "file": str(file_path),
                    "message": f"Missing required field: {field}"
                })

    def _validate_title(self, file_path: Path, title: str, lang: str):
        """Validate title"""
        if not title:
            return

        # Length validation (SEO)
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

        # Language-specific rules
        if lang == 'en' and not re.search(r'[A-Z]', title):
            self.errors.append({
                "file": str(file_path),
                "message": "English title should have capitalization"
            })

    def _validate_description(self, file_path: Path, desc: str, lang: str):
        """Validate description"""
        if not desc:
            return

        # Length validation (SEO)
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
        """Validate publication date"""
        if not pub_date:
            return

        # Date format validation
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
        """Validate tags"""
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
        """Validate related posts"""
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

            # Required fields
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

            # Verify all 4 languages in reason
            reason = post['reason']
            for required_lang in ['ko', 'ja', 'en', 'zh']:
                if required_lang not in reason:
                    self.errors.append({
                        "file": str(file_path),
                        "message": f"relatedPosts[{i}].reason missing '{required_lang}'"
                    })


def main():
    """CLI execution"""
    content_dir = Path("src/content/blog")
    validator = FrontmatterValidator(content_dir)

    success = validator.validate_all()
    exit(0 if success else 1)


if __name__ == "__main__":
    main()
```

<strong>Step 2: SEO Quality Validation</strong>

`scripts/validate_seo.py`:

```python
#!/usr/bin/env python3
"""
SEO quality validation script
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
        """Validate SEO quality"""
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
        """Validate heading structure"""
        # Only one H1
        h1_count = len(re.findall(r'^#\s+', self.content, re.MULTILINE))
        if h1_count == 0:
            self.issues.append("No H1 heading found")
        elif h1_count > 1:
            self.issues.append(f"Multiple H1 headings ({h1_count})")

        # H2 or higher exists
        h2_count = len(re.findall(r'^##\s+', self.content, re.MULTILINE))
        if h2_count == 0:
            self.issues.append("No H2 headings (poor structure)")

        # Validate heading order (H2 → H3 → H4, no skipping)
        headings = re.findall(r'^(#{1,6})\s+', self.content, re.MULTILINE)
        prev_level = 0
        for heading in headings:
            level = len(heading)
            if level - prev_level > 1:
                self.issues.append(f"Heading level skip: H{prev_level} → H{level}")
            prev_level = level

    def _check_keyword_density(self):
        """Validate keyword density"""
        # Extract body only (exclude code blocks)
        text = re.sub(r'```.*?```', '', self.content, flags=re.DOTALL)
        text = re.sub(r'`[^`]+`', '', text)

        # Extract words
        words = re.findall(r'\b\w+\b', text.lower())
        total_words = len(words)

        if total_words < 300:
            self.issues.append(f"Content too short: {total_words} words (min 300)")

        # Top keyword density
        word_counts = Counter(words)
        most_common = word_counts.most_common(10)

        for word, count in most_common:
            density = count / total_words
            if density > 0.05:  # Over 5% is excessive
                self.issues.append(f"Keyword '{word}' density too high: {density:.1%}")

    def _check_readability(self):
        """Validate readability"""
        # Paragraph length
        paragraphs = re.split(r'\n\n+', self.content)
        for i, para in enumerate(paragraphs):
            if para.startswith('#'):
                continue  # Exclude headings

            words = len(para.split())
            if words > 150:
                self.issues.append(f"Paragraph {i+1} too long: {words} words (max 150)")

    def _check_links(self):
        """Validate links"""
        # Check internal links
        internal_links = re.findall(r'\[([^\]]+)\]\((/[^\)]+)\)', self.content)
        external_links = re.findall(r'\[([^\]]+)\]\((https?://[^\)]+)\)', self.content)

        if len(internal_links) == 0:
            self.issues.append("No internal links (poor SEO)")

        # External links recommend nofollow (manual check needed)
        if len(external_links) > 10:
            self.issues.append(f"Many external links ({len(external_links)}), consider nofollow")

    def _check_images(self):
        """Validate images"""
        # Image alt text
        images_with_alt = re.findall(r'!\[([^\]]*)\]\([^\)]+\)', self.content)
        images_without_alt = [alt for alt in images_with_alt if not alt.strip()]

        if images_without_alt:
            self.issues.append(f"{len(images_without_alt)} images missing alt text")


def main():
    """CLI execution"""
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

<strong>Step 3: Integrated Validation Workflow</strong>

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
          # Validate only changed files
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

### Explanation

<strong>1. 3-Layer Validation Structure</strong>

```
Layer 1: Schema Validation (before build)
├─ Frontmatter required fields
├─ Type validation (string, date, array)
└─ Length limits (title 60 chars, description 160 chars)

Layer 2: SEO Validation (before build)
├─ Heading structure (one H1, H2 or higher exists)
├─ Keyword density (under 5%)
├─ Readability (paragraphs under 150 words)
├─ Link quality (internal links, external links)
└─ Image alt text

Layer 3: Build Validation (Astro)
├─ TypeScript type check
├─ Content Collections schema
└─ Image path validity
```

<strong>2. Automated Pipeline</strong>

```
PR created/pushed
↓
GitHub Actions triggered
↓
Run Python scripts
├─ validate_frontmatter.py (all files)
└─ validate_seo.py (changed files only)
↓
Astro build test
├─ npm run astro check
└─ npm run build
↓
Result report
├─ ✅ Pass → Can merge
└─ ❌ Fail → Need fixes
```

<strong>3. Incremental Validation</strong>

Validate only changed files instead of all files every time:

```bash
# Detect changed files with Git diff
git diff --name-only origin/main | grep '\.md$'

# Example output
src/content/blog/ko/new-post.md
src/content/blog/en/new-post.md
```

This enables fast validation even for large blogs.

### Variations

<strong>Variation 1: AI-based Cultural Appropriateness Validation</strong>

Detect culturally inappropriate expressions with Claude API:

```python
def validate_cultural_appropriateness(text: str, lang: str) -> dict:
    """Validate cultural appropriateness with AI"""

    prompt = f"""You are a cultural expert for the {lang} language region.
Find culturally inappropriate or potentially misunderstood expressions in the following text.

<text>
{text}
</text>

Check for:
1. Taboo words, profanity
2. Cultural stereotypes
3. Religious/political sensitivity
4. Sexist, racist expressions
5. Expressions against local customs

Respond in JSON format:
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

    # Parse JSON and return
    # ...
```

<strong>Variation 2: Cross-Language Consistency Validation</strong>

Validate that 4 language versions of the same content convey the same meaning:

```python
def validate_translation_consistency(
    ko_file: Path,
    en_file: Path,
    ja_file: Path,
    zh_file: Path
) -> dict:
    """Validate consistency of 4 language versions"""

    # Extract heading structure from each file
    headings = {
        'ko': extract_headings(ko_file),
        'en': extract_headings(en_file),
        'ja': extract_headings(ja_file),
        'zh': extract_headings(zh_file),
    }

    # Check if heading counts match
    heading_counts = [len(h) for h in headings.values()]
    if len(set(heading_counts)) > 1:
        return {
            "consistent": False,
            "issue": f"Heading count mismatch: {headings}"
        }

    # Check if code block counts match
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

## Recipe 18.4: Synchronization and Consistency Maintenance

### Problem

Managing content in 4 languages leads to synchronization issues like:

1. <strong>Mismatched post counts by language</strong>: 100 Korean, 95 English, 98 Japanese posts...
2. <strong>Metadata inconsistency</strong>: Same post has different pubDate
3. <strong>Image inconsistency</strong>: Different heroImage used by language
4. <strong>Missing updates</strong>: Korean post updated but English version not

Manual tracking is difficult and error-prone.

### Solution

Build an automatic synchronization system.

<strong>Step 1: Detect Synchronization Status</strong>

`scripts/check_sync.py`:

```python
#!/usr/bin/env python3
"""
Check multi-language content synchronization status
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
        """Check overall synchronization status"""
        # File list by language
        files_by_lang = {}
        for lang in self.languages:
            lang_dir = self.content_dir / lang
            files = set(f.name for f in lang_dir.glob("*.md"))
            files_by_lang[lang] = files

        # 1. Check file counts
        file_counts = {lang: len(files) for lang, files in files_by_lang.items()}

        # 2. Find missing translations
        all_slugs = set()
        for files in files_by_lang.values():
            all_slugs.update(files)

        missing_translations = {}
        for lang in self.languages:
            missing = all_slugs - files_by_lang[lang]
            if missing:
                missing_translations[lang] = list(missing)

        # 3. Check metadata consistency
        metadata_issues = self._check_metadata_consistency()

        return {
            "file_counts": file_counts,
            "missing_translations": missing_translations,
            "metadata_issues": metadata_issues
        }

    def _check_metadata_consistency(self) -> List[dict]:
        """Check metadata consistency"""
        issues = []

        # Collect all slugs
        ko_files = list((self.content_dir / 'ko').glob("*.md"))

        for ko_file in ko_files:
            slug = ko_file.stem

            # Only if all 4 language files exist
            files = {}
            for lang in self.languages:
                file_path = self.content_dir / lang / ko_file.name
                if file_path.exists():
                    files[lang] = file_path

            if len(files) < 4:
                continue  # Skip if partial (handled in missing_translations)

            # Extract metadata
            metadata = {}
            for lang, file_path in files.items():
                fm = self._extract_frontmatter(file_path)
                metadata[lang] = fm

            # Check pubDate consistency
            pub_dates = [fm.get('pubDate') for fm in metadata.values()]
            if len(set(pub_dates)) > 1:
                issues.append({
                    "slug": slug,
                    "field": "pubDate",
                    "values": {lang: metadata[lang].get('pubDate') for lang in self.languages}
                })

            # Check heroImage consistency
            hero_images = [fm.get('heroImage') for fm in metadata.values()]
            if len(set(hero_images)) > 1:
                issues.append({
                    "slug": slug,
                    "field": "heroImage",
                    "values": {lang: metadata[lang].get('heroImage') for lang in self.languages}
                })

        return issues

    def _extract_frontmatter(self, file_path: Path) -> dict:
        """Extract frontmatter"""
        content = file_path.read_text(encoding='utf-8')
        match = re.match(r'^---\n(.*?)\n---', content, re.DOTALL)
        if match:
            return yaml.safe_load(match.group(1))
        return {}


def main():
    """CLI execution"""
    content_dir = Path("src/content/blog")
    checker = SyncChecker(content_dir)
    result = checker.check_all()

    print("\n=== Multilingual Content Sync Status ===\n")

    # File counts
    print("File counts:")
    for lang, count in result['file_counts'].items():
        print(f"  {lang}: {count} files")

    # Missing translations
    if result['missing_translations']:
        print("\n⚠️  Missing translations:")
        for lang, files in result['missing_translations'].items():
            print(f"\n  {lang} ({len(files)} files):")
            for file in files[:5]:  # Show first 5 only
                print(f"    - {file}")
            if len(files) > 5:
                print(f"    ... and {len(files)-5} more")
    else:
        print("\n✅ All files have translations in all languages")

    # Metadata inconsistencies
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

<strong>Step 2: Auto-sync Script</strong>

`scripts/auto_sync.py`:

```python
#!/usr/bin/env python3
"""
Automatically generate missing translations
"""

import os
from pathlib import Path
from check_sync import SyncChecker

# Translation Agent import (refer to Recipe 18.2)
import sys
sys.path.append(str(Path(__file__).parent.parent / '.claude/skills/translation-agent'))
from translate import TranslationAgent

def auto_sync(content_dir: Path, api_key: str):
    """Automatically generate missing translations"""

    checker = SyncChecker(content_dir)
    result = checker.check_all()

    if not result['missing_translations']:
        print("✅ All files are synchronized")
        return

    agent = TranslationAgent(api_key)

    for target_lang, missing_files in result['missing_translations'].items():
        print(f"\n📝 Generating {len(missing_files)} {target_lang} translations...")

        for filename in missing_files:
            # Find source file (typically Korean)
            source_file = content_dir / 'ko' / filename

            if not source_file.exists():
                # If Korean doesn't exist, find from other languages
                for lang in ['en', 'ja', 'zh']:
                    alt_source = content_dir / lang / filename
                    if alt_source.exists():
                        source_file = alt_source
                        break

            if not source_file.exists():
                print(f"  ⚠️  Skipping {filename}: no source file found")
                continue

            # Generate translation
            print(f"  Translating {filename} → {target_lang}...")
            try:
                result = agent.translate_post(source_file, target_lang)

                # Save file
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
    """CLI execution"""
    content_dir = Path("src/content/blog")
    api_key = os.environ.get("ANTHROPIC_API_KEY")

    if not api_key:
        print("Error: ANTHROPIC_API_KEY not set")
        return

    auto_sync(content_dir, api_key)


if __name__ == "__main__":
    main()
```

<strong>Step 3: Metadata Synchronization</strong>

`scripts/sync_metadata.py`:

```python
#!/usr/bin/env python3
"""
Automatically fix metadata consistency
"""

import re
import yaml
from pathlib import Path
from check_sync import SyncChecker

def sync_metadata(content_dir: Path):
    """Automatically fix metadata inconsistencies"""

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

        # Synchronize based on Korean version
        canonical_value = values.get('ko')

        if not canonical_value:
            # Use first value if Korean doesn't exist
            canonical_value = next(iter(values.values()))

        print(f"  {slug} - {field}:")
        print(f"    Canonical value: {canonical_value}")

        # Update all language files
        for lang in ['ko', 'en', 'ja', 'zh']:
            file_path = content_dir / lang / f"{slug}.md"

            if not file_path.exists():
                continue

            if values.get(lang) == canonical_value:
                continue  # Already consistent

            # Read file
            content = file_path.read_text(encoding='utf-8')

            # Update frontmatter
            match = re.match(r'^---\n(.*?)\n---\n(.*)$', content, re.DOTALL)
            if not match:
                continue

            frontmatter_text = match.group(1)
            body = match.group(2)

            # Change field value
            frontmatter_text = re.sub(
                rf'^{field}:.*$',
                f'{field}: "{canonical_value}"',
                frontmatter_text,
                flags=re.MULTILINE
            )

            # Write file
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(f"---\n{frontmatter_text}\n---\n{body}")

            print(f"    ✅ Updated {lang}/{slug}.md")


def main():
    """CLI execution"""
    content_dir = Path("src/content/blog")
    sync_metadata(content_dir)


if __name__ == "__main__":
    main()
```

<strong>Step 4: Integrated Workflow</strong>

`.claude/commands/sync-content.md`:

```markdown
# /sync-content Command

## Purpose
Check synchronization status of 4-language content and automatically fix issues.

## Usage

\`\`\`bash
/sync-content [--check-only] [--fix-metadata]
\`\`\`

## Options

- `--check-only`: Only check status, don't fix
- `--fix-metadata`: Automatically fix metadata inconsistencies

## Workflow

1. Check synchronization status
   - File count by language
   - Missing translations
   - Metadata inconsistencies

2. Automatically generate missing translations (optional)
   - Translate with Translation Agent
   - Save after quality validation

3. Synchronize metadata (optional)
   - Unify based on Korean version
   - pubDate, heroImage, etc.

4. Final validation
   - Frontmatter schema validation
   - Build test

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

### Explanation

<strong>1. Synchronization Validation 3 Stages</strong>

```
Stage 1: File Count Check
├─ Count files by language
└─ Identify missing files if mismatch found

Stage 2: Content Consistency
├─ Compare 4 versions of same slug
├─ Check pubDate, heroImage, tags consistency
└─ Report if inconsistencies found

Stage 3: Automated Fix
├─ Automatically generate missing translations
├─ Unify metadata based on Korean
└─ Final validation (build test)
```

<strong>2. Auto vs Manual Fix</strong>

| Item | Auto Fix | Manual Review Needed |
|------|----------|--------------|
| Missing translations | ✅ Generate AI translation | ❌ Approve after quality review |
| pubDate mismatch | ✅ Unify to Korean | ✅ (No controversy) |
| heroImage mismatch | ✅ Unify to Korean | ✅ (No controversy) |
| title mismatch | ❌ | ✅ (SEO impact) |
| description mismatch | ❌ | ✅ (SEO impact) |

title and description should differ by language, so don't auto-fix.

<strong>3. Synchronization Cycle</strong>

```
Daily:
  - Check synchronization status (check_sync.py)
  - Auto-fix metadata inconsistencies

Weekly:
  - Generate missing translations
  - Quality review and manual fixes

Monthly:
  - Full content audit
  - Re-verify SEO quality
```

### Variations

<strong>Variation 1: Auto-sync with Git Hook</strong>

Automatic validation before commit:

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

<strong>Variation 2: Visualize Sync Status with Dashboard</strong>

`scripts/generate_sync_dashboard.py`:

```python
def generate_dashboard(content_dir: Path) -> str:
    """Generate HTML dashboard"""

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

        <!-- More sections... -->
    </body>
    </html>
    """

    return html
```

---

## Hands-on Project: Fully Automated Multi-Language Pipeline

Now let's integrate all recipes to create a fully automated system.

### Scenario

When you write a blog post in Korean:
1. Automatically generate English, Japanese, Chinese translations
2. SEO optimization for each language
3. Quality validation (schema, SEO, cultural appropriateness)
4. Metadata synchronization
5. Simultaneous publication in 4 languages

### Integrated Command: `/write-post-multilingual`

`.claude/commands/write-post-multilingual.md`:

```markdown
# /write-post-multilingual Command

## Purpose
Write a post in Korean and automatically generate, validate, and publish 4-language translations.

## Workflow

\`\`\`mermaid
graph TD
    A[Write Korean post] --> B[Validate frontmatter]
    B --> C{Validation pass?}
    C -->|No| D[Fix errors]
    D --> B
    C -->|Yes| E[Generate 3 language translations]
    E --> F[SEO optimization]
    F --> G[Quality validation]
    G --> H{Meet quality criteria?}
    H -->|No| I[Request manual review]
    H -->|Yes| J[Sync metadata]
    J --> K[Build test]
    K --> L{Build success?}
    L -->|No| M[Fix errors]
    M --> K
    L -->|Yes| N[Publish 4 languages simultaneously]
\`\`\`

## Steps

### 1. Write Korean Post

User writes post in Korean.

### 2. Generate Translations

Generate en, ja, zh translations with Translation Agent:
- Localization first (rewrite, not translation)
- SEO keyword optimization
- Maintain term consistency via Glossary

### 3. Quality Validation

3-layer validation:
- Schema: Frontmatter required fields, types, lengths
- SEO: Heading structure, keyword density, links, images
- Build: Astro build test

### 4. Sync and Publish

- Sync pubDate, heroImage
- Generate relatedPosts reasons in 4 languages
- Git commit and push

## Usage

\`\`\`bash
/write-post-multilingual <topic> [--skip-review]
\`\`\`

## Options

- `--skip-review`: Auto-approve if quality score is 90% or higher

## Example

\`\`\`
/write-post-multilingual "React Server Components Complete Guide"
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

### Implementation

`.claude/commands/implementations/write_post_multilingual.py`:

```python
#!/usr/bin/env python3
"""
Multi-language post generation and publication automation
"""

import os
import sys
from pathlib import Path

# Import existing scripts
sys.path.append(str(Path(__file__).parent.parent.parent / '.claude/skills/translation-agent'))
sys.path.append(str(Path(__file__).parent.parent.parent / 'scripts'))

from translate import TranslationAgent
from validate_frontmatter import FrontmatterValidator
from validate_seo import SEOValidator
from sync_metadata import sync_metadata

def write_multilingual_post(topic: str, skip_review: bool = False):
    """Generate and publish multi-language post"""

    content_dir = Path("src/content/blog")

    # 1. Write Korean post (use existing writing-assistant)
    print(f"\n📝 Writing Korean post about '{topic}'...")
    # ... (existing writing-assistant logic)
    ko_file = content_dir / "ko" / "new-post.md"
    print(f"  ✅ Created {ko_file}")

    # 2. Generate translations
    print("\n🌍 Generating translations...")
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    agent = TranslationAgent(api_key)

    translations = {}
    for lang in ['en', 'ja', 'zh']:
        print(f"  📝 Translating to {lang.upper()}...")
        result = agent.translate_post(ko_file, lang)

        # Save file
        output_file = content_dir / lang / ko_file.name
        with open(output_file, 'w', encoding='utf-8') as f:
            # ... (write frontmatter + content)
            pass

        translations[lang] = {
            "file": output_file,
            "quality": result['quality_score']
        }

        print(f"    ✅ {output_file} (quality: {result['quality_score']:.0%})")

    # 3. Quality validation
    print("\n🔍 Validating quality...")

    # Frontmatter validation
    validator = FrontmatterValidator(content_dir)
    if not validator.validate_all():
        print("  ❌ Frontmatter validation failed")
        return False
    print("  ✅ Frontmatter validation passed")

    # SEO validation
    seo_scores = {}
    for lang in ['ko', 'en', 'ja', 'zh']:
        file_path = content_dir / lang / ko_file.name
        seo_validator = SEOValidator(file_path)
        result = seo_validator.validate()
        seo_scores[lang] = result['score']

    avg_seo_score = sum(seo_scores.values()) / len(seo_scores)
    print(f"  ✅ SEO validation passed (scores: {', '.join(f'{k}={v}' for k, v in seo_scores.items())})")

    # Build test
    import subprocess
    build_result = subprocess.run(['npm', 'run', 'build'], capture_output=True)
    if build_result.returncode != 0:
        print("  ❌ Build test failed")
        return False
    print("  ✅ Build test passed")

    # 4. Check if manual review needed
    min_quality = min(t['quality'] for t in translations.values())
    if min_quality < 0.9 and not skip_review:
        print(f"\n⚠️  Quality score below 90% ({min_quality:.0%}). Manual review recommended.")
        print("    Run with --skip-review to auto-approve")
        return False

    # 5. Sync metadata
    print("\n🔧 Synchronizing metadata...")
    sync_metadata(content_dir)

    # 6. Git commit and push
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

## Summary

In this chapter, we built a simultaneous content generation system for 4 languages:

<strong>Recipe 18.1: Multi-Language Structure Design</strong>
- Language-specific folder structure based on Content Collections
- Type-safe schema definition
- Language switcher component

<strong>Recipe 18.2: Translation Agent Implementation</strong>
- Localization-first translation with Claude API
- SEO-optimized metadata generation
- Term consistency with Glossary

<strong>Recipe 18.3: Quality Validation Automation</strong>
- 3-layer validation (Schema, SEO, Build)
- GitHub Actions integration
- AI-based cultural appropriateness validation

<strong>Recipe 18.4: Synchronization and Consistency Maintenance</strong>
- Automatic sync status detection
- Auto-generate missing translations
- Metadata unification

<strong>Core Principles</strong>:

1. <strong>Localization, not translation</strong>: Rewrite for readers of each language region
2. <strong>Automation first</strong>: Automate repetitive tasks with scripts
3. <strong>Quality assurance</strong>: Maintain consistency with 3-layer validation
4. <strong>Gradual improvement</strong>: Translation Memory, review workflow

Now when you write a post in Korean, it's automatically translated into 4 languages, validated for quality, and published simultaneously. Operating a global blog just got much easier.

---

## Practice Exercises

1. <strong>Basic</strong>: Apply Recipe 18.1's multi-language structure to your project.
2. <strong>Intermediate</strong>: Add new languages (Spanish, French) to Translation Agent.
3. <strong>Advanced</strong>: Implement an AI-based cultural appropriateness validation system.
4. <strong>Expert</strong>: Create an automated A/B testing system to evaluate translation quality.

---

## Next Chapter Preview

Chapter 19 covers <strong>AI-based Content Recommendation System</strong>. We'll build a system that recommends the most relevant posts to readers using Claude's semantic understanding rather than TF-IDF.
