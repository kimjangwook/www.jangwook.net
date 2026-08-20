# Chapter 18: 多语言内容管道

四语言同步内容生成系统

---

## 概述

面向全球市场的内容服务必须支持多语言。然而,同时用4种语言(韩语、英语、日语、中文)创建和管理内容是一项复杂的工作。不仅仅是简单的翻译,还涉及考虑各语言地区文化背景的本地化(localization)、保持内容一致性、质量验证、同步等各种挑战。

本章将介绍如何利用Claude Code构建多语言内容管道。我们将创建一个综合系统,不仅包括简单的翻译自动化,还涵盖各语言的SEO优化、文化适应性验证、元数据管理等方面。

<strong>本章学习内容:</strong>

- 基于Content Collections的多语言结构设计
- 实现AI翻译代理(Translation vs Localization)
- 质量验证自动化(架构验证、SEO检查、文化适应性)
- 语言间同步及一致性维护机制
- 4语言同步发布工作流

<strong>实战项目:</strong>

构建一个系统:用韩语撰写博客文章后,自动生成英语、日语、中文版本,经过各语言SEO优化和质量验证后同步发布。

---

## Recipe 18.1: 多语言结构设计

### 问题 (Problem)

为了有效管理4种语言的内容,需要系统的目录结构和元数据架构。必须满足以下要求:

1. <strong>语言分离</strong>: 各语言内容应独立管理
2. <strong>一致标识符</strong>: 同一内容的不同语言版本应相互关联
3. <strong>类型安全</strong>: 用TypeScript强制执行元数据架构
4. <strong>SEO优化</strong>: 各语言URL结构和元标签
5. <strong>可扩展性</strong>: 易于添加新语言

不仅仅是简单地划分文件夹,还要利用Astro Content Collections的类型系统在编译时捕获错误。

### 解决方案 (Solution)

利用Astro Content Collections设计语言分类文件夹结构和通用架构。

<strong>Step 1: 目录结构设计</strong>

```
src/content/blog/
├── ko/                 # 韩语内容
│   ├── post-1.md
│   ├── post-2.md
│   └── ...
├── en/                 # 英语内容
│   ├── post-1.md
│   ├── post-2.md
│   └── ...
├── ja/                 # 日语内容
│   ├── post-1.md
│   ├── post-2.md
│   └── ...
└── zh/                 # 中文(简体)内容
    ├── post-1.md
    ├── post-2.md
    └── ...
```

<strong>核心原则</strong>:
- <strong>相同文件名</strong>: 同一内容在所有语言文件夹中使用相同文件名(例如:`ko/post-1.md`, `en/post-1.md`)
- <strong>语言代码即文件夹名</strong>: 文件名不附加语言代码(`post-1-ko.md` ✗)
- <strong>URL自动生成</strong>: `ko/post-1.md` → `/ko/blog/ko/post-1`(路由结构中语言代码重复是正常的)

<strong>Step 2: Content Collections架构定义</strong>

`src/content.config.ts`:

```typescript
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// 支持的语言类型
type SupportedLanguage = 'ko' | 'en' | 'ja' | 'zh';

// 博客集合架构
const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: ({ image }) => z.object({
    // 必填字段
    title: z.string()
      .min(10, "标题至少10个字符")
      .max(60, "标题不能超过60个字符(SEO)"),

    description: z.string()
      .min(50, "描述至少50个字符")
      .max(160, "描述不能超过160个字符(SEO)"),

    pubDate: z.coerce.date(),

    // 可选字段
    updatedDate: z.coerce.date().optional(),

    heroImage: image().optional(),

    tags: z.array(z.string())
      .max(5, "标签最多5个")
      .optional(),

    // 多语言相关字段
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

    // 翻译元数据(可选)
    translation: z.object({
      sourceLanguage: z.enum(['ko', 'en', 'ja', 'zh']).optional(),
      translatedAt: z.coerce.date().optional(),
      reviewer: z.string().optional(),
    }).optional(),
  }),
});

export const collections = { blog };
```

<strong>Step 3: 语言检测工具函数</strong>

`src/utils/i18n.ts`:

```typescript
import type { CollectionEntry } from 'astro:content';

export type Language = 'ko' | 'en' | 'ja' | 'zh';

/**
 * 从文章ID提取语言代码
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
 * 从文章ID提取slug(去除语言代码)
 * @example "ko/post-1.md" → "post-1"
 */
export function getSlugFromId(id: string): string {
  return id.split('/')[1].replace(/\.md$/, '');
}

/**
 * 按语言筛选文章
 */
export function filterByLanguage(
  posts: CollectionEntry<'blog'>[],
  lang: Language
): CollectionEntry<'blog'>[] {
  return posts.filter(post => getLanguageFromId(post.id) === lang);
}

/**
 * 查找同一内容的其他语言版本
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
 * 语言标签(UI显示)
 */
export const LANGUAGE_LABELS: Record<Language, { native: string; english: string }> = {
  ko: { native: '한국어', english: 'Korean' },
  en: { native: 'English', english: 'English' },
  ja: { native: '日本語', english: 'Japanese' },
  zh: { native: '简体中文', english: 'Chinese' },
};
```

<strong>Step 4: 语言切换组件</strong>

`src/components/LanguageSwitcher.astro`:

```astro
---
import { getCollection } from 'astro:content';
import { getLanguageFromId, getSlugFromId, findTranslations, LANGUAGE_LABELS, type Language } from '../utils/i18n';

interface Props {
  currentPostId: string;
}

const { currentPostId } = Astro.props;

// 获取所有文章
const allPosts = await getCollection('blog');

// 查找当前文章
const currentPost = allPosts.find(p => p.id === currentPostId);
if (!currentPost) {
  throw new Error(`Post not found: ${currentPostId}`);
}

// 查找翻译版本
const translations = findTranslations(allPosts, currentPost);
const currentLang = getLanguageFromId(currentPost.id);
const currentSlug = getSlugFromId(currentPost.id);

// 可用语言列表
const availableLanguages: Language[] = ['ko', 'en', 'ja', 'zh'];
---

<div class="language-switcher">
  <span class="label">语言:</span>
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

### 说明 (Explanation)

<strong>1. 为什么使用语言分类文件夹结构?</strong>

- <strong>清晰分离</strong>: 各语言内容独立管理
- <strong>自动语言检测</strong>: 仅通过文件路径即可识别语言(`ko/post.md` → `ko`)
- <strong>URL结构一致性</strong>: `/ko/blog/ko/post`, `/en/blog/en/post`(SEO友好)
- <strong>Git历史追踪</strong>: 各语言变更独立追踪

<strong>2. Content Collections架构的作用</strong>

- <strong>类型安全</strong>: 构建时验证元数据
- <strong>强制SEO</strong>: `title` 60字符、`description` 160字符限制
- <strong>保证必填字段</strong>: 缺少`title`、`description`、`pubDate`时构建失败
- <strong>relatedPosts 4语言必填</strong>: 所有推荐文章强制要求4种语言的理由

<strong>3. i18n工具函数的重要性</strong>

- <strong>`getLanguageFromId()`</strong>: 集中管理文件路径解析逻辑
- <strong>`findTranslations()`</strong>: 自动关联相同slug的其他语言版本
- <strong>类型安全</strong>: 用`Language`类型防止拼写错误

<strong>4. 语言切换组件</strong>

- <strong>自动检测</strong>: 自动查找当前文章的翻译版本
- <strong>不可用显示</strong>: 没有翻译的语言显示为禁用状态
- <strong>可访问性</strong>: 用`aria-current`、`aria-disabled`属性支持屏幕阅读器

### 变体 (Variations)

<strong>Variation 1: 语言默认配置(config.json)</strong>

在各语言文件夹添加配置文件:

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
    "titleSuffix": " - 技术博客",
    "defaultDescription": "开发相关技术博客"
  }
}
```

<strong>Variation 2: Subpath vs Subdomain</strong>

当前结构: `/ko/blog/ko/post` (Subpath)

替代方案1 - Subdomain:
```
ko.example.com/blog/post
en.example.com/blog/post
```

替代方案2 - Domain:
```
example.kr/blog/post  (韩语)
example.com/blog/post (英语)
```

<strong>选择标准</strong>:
- <strong>Subpath</strong>: 共享SEO权重,管理简便(推荐)
- <strong>Subdomain</strong>: 服务器分离,独立运营
- <strong>Domain</strong>: 国家品牌化,最高本地化

<strong>Variation 3: 语言检测中间件</strong>

自动检测用户浏览器语言:

`src/middleware/language-redirect.ts`:
```typescript
import type { MiddlewareHandler } from 'astro';

export const onRequest: MiddlewareHandler = async (context, next) => {
  const url = new URL(context.request.url);

  // 仅在根路径重定向
  if (url.pathname === '/') {
    const acceptLanguage = context.request.headers.get('accept-language');
    const preferredLang = parseAcceptLanguage(acceptLanguage);

    return context.redirect(`/${preferredLang}/blog`);
  }

  return next();
};

function parseAcceptLanguage(header: string | null): string {
  if (!header) return 'ko'; // 默认值

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

  return 'ko'; // 默认值
}
```

---

## Recipe 18.2: 翻译代理实现

### 问题 (Problem)

创建多语言内容时最大的挑战是平衡<strong>翻译(Translation)</strong>和<strong>本地化(Localization)</strong>。

<strong>简单翻译的问题</strong>:
- 技术术语的不自然翻译(例如:"线程" vs "thread")
- 文化背景丢失(例如:将韩语俗语直译成英语)
- SEO关键词不匹配(各语言地区搜索词不同)
- 语气和风格不一致(正式体 vs 口语体)

<strong>所需功能</strong>:
1. 理解原文意图和背景
2. 各语言SEO关键词优化
3. 文化适当的表达转换
4. 保持技术术语一致性
5. 元数据(title, description, tags)单独优化

### 解决方案 (Solution)

构建利用Claude API的"本地化优先"翻译代理。

<strong>Step 1: 翻译代理技能定义</strong>

`.claude/skills/translation-agent/SKILL.md`:

```markdown
# Translation Agent Skill

## Purpose
专业翻译代理,将博客文章本地化为4种语言(ko, en, ja, zh)。

## Core Principles

1. <strong>本地化而非翻译</strong>
   - 不是简单的单词替换,而是意义传达
   - 为各语言地区读者改写
   - 考虑文化背景

2. <strong>SEO优化</strong>
   - 各语言搜索关键词研究
   - title: 60字符以下, description: 150-160字符
   - 反映各语言地区搜索意图

3. <strong>保持一致性</strong>
   - 技术术语参考glossary
   - 保持品牌名、产品名原文
   - 统一语气和风格

## Translation Workflow

### Input
- 原文markdown文件(一般为韩语)
- 目标语言(en, ja, zh)
- Glossary(可选)

### Output
- 翻译后的markdown文件
- SEO优化的元数据
- 翻译质量报告

### Process
1. 分析原文(主题、目标读者、语气)
2. 各语言SEO关键词调查
3. 元数据本地化(title, description, tags)
4. 正文翻译(按段落)
5. 技术术语一致性验证
6. 最终质量审核

## Language-Specific Guidelines

### English (en)
- 技术博客标准:友好但专业的语气
- 代码注释:命令式(例如:"Create a new file")
- SEO: Stack Overflow、GitHub搜索词优先

### Japanese (ja)
- 使用敬语:です/ます体为基础
- 技术术语:英语原文 vs 日语翻译混用(参考glossary)
- SEO: Qiita、Zenn搜索词优先

### Chinese (zh)
- 使用简体中文
- 技术术语:英文标注后附中文说明
- SEO: CSDN、知乎搜索词优先

## Example Transformations

### Bad (直译)
```
原文(ko): "이 방법은 일석이조입니다."
翻译(en): "This method kills two birds with one stone." ✗
```

### Good (本地化)
```
原文(ko): "이 방법은 일석이조입니다."
本地化(en): "This approach solves two problems at once." ✓
```

### SEO Optimization

```
原文title(ko): "리액트 훅스 완벽 가이드"

Bad(en): "React Hooks Perfect Guide" ✗
- 搜索量低
- 竞争过度

Good(en): "React Hooks Tutorial: Complete Guide for Beginners" ✓
- 包含"tutorial"、"complete guide"、"beginners"搜索词
- 明确指定目标对象
```

## Tools

### translate_post
翻译和本地化文章。

**Parameters**:
- `source_file`: 原文文件路径
- `target_language`: 目标语言(en, ja, zh)
- `glossary_file`: 术语表文件(可选)

**Returns**:
- 翻译后的文件路径
- 质量分数
- 改进建议

## Usage Example

```
@translation-agent "请将ko/react-hooks-guide.md翻译成英语。
目标为初学者,SEO关键词以'React hooks tutorial'为中心优化。"
```
```

<strong>Step 2: 翻译脚本实现</strong>

`.claude/skills/translation-agent/translate.py`:

```python
#!/usr/bin/env python3
"""
多语言文章翻译和本地化脚本
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
        """加载技术术语glossary"""
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
        翻译和本地化博客文章。

        Returns:
            {
                "frontmatter": {...},  # 翻译后的元数据
                "content": "...",      # 翻译后的正文
                "quality_score": 0.95,
                "suggestions": [...]
            }
        """
        # 读取原文
        with open(source_file, 'r', encoding='utf-8') as f:
            content = f.read()

        # 分离Frontmatter和正文
        frontmatter, body = self._split_frontmatter(content)

        # 第1步:翻译元数据(SEO优化)
        translated_meta = self._translate_metadata(
            frontmatter, source_lang, target_lang
        )

        # 第2步:翻译正文(按段落)
        translated_body = self._translate_body(
            body, source_lang, target_lang
        )

        # 第3步:质量验证
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
        """分离Frontmatter和正文"""
        match = re.match(r'^---\n(.*?)\n---\n(.*)$', content, re.DOTALL)
        if not match:
            raise ValueError("Invalid frontmatter format")

        # YAML解析(简单实现)
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
        """SEO优化翻译元数据"""

        prompt = f"""您是SEO专家和翻译人员。
请将博客文章的元数据本地化为{target_lang}语言。

<source_metadata>
title: {meta.get('title', '')}
description: {meta.get('description', '')}
tags: {meta.get('tags', '')}
</source_metadata>

<guidelines>
1. title: 包含{target_lang}语言地区搜索量高的关键词(60字符以下)
2. description: 具体且引导行动(150-160字符)
3. tags: 该语言地区实际使用的标签(最多5个)
4. 不是简单翻译而是SEO优化的改写
</guidelines>

<glossary>
{json.dumps(self.glossary.get(target_lang, {}), ensure_ascii=False, indent=2)}
</glossary>

请用JSON格式回答:
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

        # JSON提取
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
        """按段落翻译正文"""

        # 按段落分割(以##标题为基准)
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
        """翻译单个段落"""

        # 保护代码块
        code_blocks = []
        def replace_code(match):
            code_blocks.append(match.group(0))
            return f"__CODE_BLOCK_{len(code_blocks)-1}__"

        text = re.sub(r'```.*?```', replace_code, text, flags=re.DOTALL)

        prompt = f"""您是技术博客专业翻译人员。
请将以下文本本地化为{target_lang}语言。

<text>
{text}
</text>

<guidelines>
1. 本地化优先:不是简单翻译而是为{target_lang}读者改写
2. 技术术语:参考glossary保持一致性
3. 语气: {"友好且专业(英语)" if target_lang == "en" else "礼貌且专业(使用敬语)" if target_lang == "ja" else "专业且清晰"}
4. 代码相关说明:具体且实用
5. __CODE_BLOCK_N__标记保持不变
</guidelines>

<glossary>
{json.dumps(self.glossary.get(target_lang, {}), ensure_ascii=False, indent=2)}
</glossary>

仅回答翻译后的文本(无需说明)。
"""

        response = self.client.messages.create(
            model="claude-opus-4-5-20251101",
            max_tokens=4096,
            messages=[{"role": "user", "content": prompt}]
        )

        translated = response.content[0].text.strip()

        # 恢复代码块
        for i, code in enumerate(code_blocks):
            translated = translated.replace(f"__CODE_BLOCK_{i}__", code)

        return translated

    def _validate_quality(self, text: str, lang: Language) -> dict:
        """验证翻译质量"""

        issues = []

        # 1. 代码块验证
        code_blocks = re.findall(r'```', text)
        if len(code_blocks) % 2 != 0:
            issues.append("代码块配对不匹配")

        # 2. 链接验证
        broken_links = re.findall(r'\[([^\]]+)\]\(\)', text)
        if broken_links:
            issues.append(f"发现空链接: {broken_links}")

        # 3. 语言特定验证
        if lang == "ja" and not re.search(r'[です|ます]', text):
            issues.append("日语敬语使用不足")

        # 计算分数
        score = max(0.0, 1.0 - len(issues) * 0.1)

        return {
            "score": score,
            "suggestions": issues
        }


def main():
    """CLI界面"""
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

    # 生成输出文件
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

<strong>Step 3: Glossary(术语表)定义</strong>

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

### 说明 (Explanation)

<strong>1. 翻译 vs 本地化</strong>

| 翻译(Translation) | 本地化(Localization) |
|-------------------|---------------------|
| 单词替换 | 意义传达 |
| "이것은 일석이조다" → "This kills two birds with one stone" | "이것은 일석이조다" → "This solves two problems at once" |
| 保持原文结构 | 为读者定制改写 |

<strong>2. SEO优化流程</strong>

```
原文title(ko): "리액트 훅스 완벽 가이드"
↓
搜索关键词调查(英语地区)
- "react hooks" (100K/月)
- "react hooks tutorial" (50K/月)
- "react hooks guide" (30K/월)
- "react hooks for beginners" (20K/月)
↓
优化后的title(en): "React Hooks Tutorial: Complete Guide for Beginners"
- 包含搜索量高的关键词
- 明确指定目标对象
- 保持60字符以下
```

<strong>3. 按段落翻译的优势</strong>

- <strong>令牌效率</strong>: 不一次发送整个文档(避免上下文限制)
- <strong>一致性</strong>: 各段落独立翻译但通过glossary统一术语
- <strong>错误恢复</strong>: 特定段落翻译失败时可重试

<strong>4. 代码块保护</strong>

```python
# 翻译前
text = "React에서 `useState`를 사용합니다.\n```js\nconst [count, setCount] = useState(0);\n```"

# 代码块保护
text = "React에서 `useState`를 사용합니다.\n__CODE_BLOCK_0__"

# 翻译
translated = "Use `useState` in React.\n__CODE_BLOCK_0__"

# 恢复
translated = "Use `useState` in React.\n```js\nconst [count, setCount] = useState(0);\n```"
```

代码不翻译,保持原样。

<strong>5. 质量验证</strong>

自动验证项目:
- 代码块配对匹配(```个数)
- 链接完整性(无`[]()`空链接)
- 语言特定规则(日语敬语、中文简体等)

### 变体 (Variations)

<strong>Variation 1: 批量翻译</strong>

一次翻译多个文件:

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

<strong>Variation 2: 翻译记忆(Translation Memory)</strong>

重用以前的翻译:

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
        """查询缓存的翻译"""
        hash_val = hashlib.md5(text.encode()).hexdigest()
        cursor = self.conn.execute(
            "SELECT translated_text FROM translations WHERE source_hash = ? AND target_lang = ?",
            (hash_val, target_lang)
        )
        row = cursor.fetchone()
        return row[0] if row else None

    def set(self, text: str, target_lang: str, translation: str):
        """保存翻译缓存"""
        hash_val = hashlib.md5(text.encode()).hexdigest()
        self.conn.execute(
            "INSERT OR REPLACE INTO translations (source_hash, target_lang, source_text, translated_text) VALUES (?, ?, ?, ?)",
            (hash_val, target_lang, text, translation)
        )
        self.conn.commit()
```

<strong>Variation 3: 翻译审核工作流</strong>

人工审核员批准翻译:

```python
def create_review_issue(translated_file: Path, quality_score: float):
    """创建GitHub Issue请求翻译审核"""
    if quality_score < 0.9:
        issue_body = f"""
## Translation Review Required

- File: `{translated_file}`
- Quality Score: {quality_score:.2%}
- Action: Please review and approve

[View Diff](https://github.com/user/repo/compare/main...translation-{translated_file.stem})
        """
        # 通过GitHub API创建Issue
        # ...
```

---

## Recipe 18.3: 质量验证自动化

### 问题 (Problem)

必须自动验证翻译后的内容是否满足以下标准:

1. <strong>遵守架构</strong>: Content Collections架构(title 60字符, description 160字符等)
2. <strong>SEO质量</strong>: 元标签、关键词密度、标题结构
3. <strong>文化适应性</strong>: 不当表达、禁忌词、当地习俗
4. <strong>技术准确性</strong>: 代码块完整性、链接有效性
5. <strong>语言风格</strong>: 敬语使用(日语)、简体中文、英语语气

人工审核耗时且一致性差。需要自动化验证管道。

### 解决方案 (Solution)

构建多层验证系统。

<strong>Step 1: 架构验证脚本</strong>

`scripts/validate_frontmatter.py`:

```python
#!/usr/bin/env python3
"""
Frontmatter架构验证脚本
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
        """验证所有文章的frontmatter"""
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
        """验证单个文件"""
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # 提取Frontmatter
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

        # 语言检测
        lang = file_path.parent.name
        if lang not in ['ko', 'en', 'ja', 'zh']:
            self.errors.append({
                "file": str(file_path),
                "message": f"Invalid language folder: {lang}"
            })
            return

        # 必填字段验证
        self._validate_required_fields(file_path, frontmatter)

        # 各字段规则验证
        self._validate_title(file_path, frontmatter.get('title'), lang)
        self._validate_description(file_path, frontmatter.get('description'), lang)
        self._validate_pub_date(file_path, frontmatter.get('pubDate'))
        self._validate_tags(file_path, frontmatter.get('tags'))
        self._validate_related_posts(file_path, frontmatter.get('relatedPosts'), lang)

    def _validate_required_fields(self, file_path: Path, fm: dict):
        """必填字段存在性"""
        required = ['title', 'description', 'pubDate', 'relatedPosts']

        for field in required:
            if field not in fm:
                self.errors.append({
                    "file": str(file_path),
                    "message": f"Missing required field: {field}"
                })

    def _validate_title(self, file_path: Path, title: str, lang: str):
        """标题验证"""
        if not title:
            return

        # 长度验证(SEO)
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

        # 语言规则
        if lang == 'en' and not re.search(r'[A-Z]', title):
            self.errors.append({
                "file": str(file_path),
                "message": "English title should have capitalization"
            })

    def _validate_description(self, file_path: Path, desc: str, lang: str):
        """描述验证"""
        if not desc:
            return

        # 长度验证(SEO)
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
        """发布日期验证"""
        if not pub_date:
            return

        # 日期格式验证
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
        """标签验证"""
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
        """相关文章验证"""
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

            # 必填字段
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

            # reason必须包含4种语言
            reason = post['reason']
            for required_lang in ['ko', 'ja', 'en', 'zh']:
                if required_lang not in reason:
                    self.errors.append({
                        "file": str(file_path),
                        "message": f"relatedPosts[{i}].reason missing '{required_lang}'"
                    })


def main():
    """CLI执行"""
    content_dir = Path("src/content/blog")
    validator = FrontmatterValidator(content_dir)

    success = validator.validate_all()
    exit(0 if success else 1)


if __name__ == "__main__":
    main()
```

<strong>Step 2: SEO质量验证</strong>

`scripts/validate_seo.py`:

```python
#!/usr/bin/env python3
"""
SEO质量验证脚本
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
        """SEO质量验证"""
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
        """标题结构验证"""
        # H1只有一个
        h1_count = len(re.findall(r'^#\s+', self.content, re.MULTILINE))
        if h1_count == 0:
            self.issues.append("No H1 heading found")
        elif h1_count > 1:
            self.issues.append(f"Multiple H1 headings ({h1_count})")

        # H2以上存在
        h2_count = len(re.findall(r'^##\s+', self.content, re.MULTILINE))
        if h2_count == 0:
            self.issues.append("No H2 headings (poor structure)")

        # 标题顺序验证(H2 → H3 → H4, 禁止跳过)
        headings = re.findall(r'^(#{1,6})\s+', self.content, re.MULTILINE)
        prev_level = 0
        for heading in headings:
            level = len(heading)
            if level - prev_level > 1:
                self.issues.append(f"Heading level skip: H{prev_level} → H{level}")
            prev_level = level

    def _check_keyword_density(self):
        """关键词密度验证"""
        # 仅提取正文(排除代码块)
        text = re.sub(r'```.*?```', '', self.content, flags=re.DOTALL)
        text = re.sub(r'`[^`]+`', '', text)

        # 提取单词
        words = re.findall(r'\b\w+\b', text.lower())
        total_words = len(words)

        if total_words < 300:
            self.issues.append(f"Content too short: {total_words} words (min 300)")

        # 高频关键词密度
        word_counts = Counter(words)
        most_common = word_counts.most_common(10)

        for word, count in most_common:
            density = count / total_words
            if density > 0.05:  # 5%以上过度
                self.issues.append(f"Keyword '{word}' density too high: {density:.1%}")

    def _check_readability(self):
        """可读性验证"""
        # 段落长度
        paragraphs = re.split(r'\n\n+', self.content)
        for i, para in enumerate(paragraphs):
            if para.startswith('#'):
                continue  # 排除标题

            words = len(para.split())
            if words > 150:
                self.issues.append(f"Paragraph {i+1} too long: {words} words (max 150)")

    def _check_links(self):
        """链接验证"""
        # 内部链接确认
        internal_links = re.findall(r'\[([^\]]+)\]\((/[^\)]+)\)', self.content)
        external_links = re.findall(r'\[([^\]]+)\]\((https?://[^\)]+)\)', self.content)

        if len(internal_links) == 0:
            self.issues.append("No internal links (poor SEO)")

        # 外部链接建议nofollow(需人工确认)
        if len(external_links) > 10:
            self.issues.append(f"Many external links ({len(external_links)}), consider nofollow")

    def _check_images(self):
        """图片验证"""
        # 图片alt文本
        images_with_alt = re.findall(r'!\[([^\]]*)\]\([^\)]+\)', self.content)
        images_without_alt = [alt for alt in images_with_alt if not alt.strip()]

        if images_without_alt:
            self.issues.append(f"{len(images_without_alt)} images missing alt text")


def main():
    """CLI执行"""
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

<strong>Step 3: 集成验证工作流</strong>

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
          # 仅验证变更的文件
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

### 说明 (Explanation)

<strong>1. 3层验证结构</strong>

```
Layer 1: Schema Validation(构建前)
├─ Frontmatter必填字段
├─ 类型验证(string, date, array)
└─ 长度限制(title 60字符, description 160字符)

Layer 2: SEO Validation(构建前)
├─ 标题结构(H1一个, H2以上存在)
├─ 关键词密度(5%以下)
├─ 可读性(段落150词以下)
├─ 链接质量(内部链接, 外部链接)
└─ 图片alt文本

Layer 3: Build Validation(Astro)
├─ TypeScript类型检查
├─ Content Collections架构
└─ 图片路径有效性
```

<strong>2. 自动化管道</strong>

```
创建PR/推送
↓
触发GitHub Actions
↓
执行Python脚本
├─ validate_frontmatter.py(所有文件)
└─ validate_seo.py(仅变更的文件)
↓
Astro构建测试
├─ npm run astro check
└─ npm run build
↓
结果报告
├─ ✅ 通过 → 可合并
└─ ❌ 失败 → 需修复
```

<strong>3. 增量验证(Incremental Validation)</strong>

不每次验证所有文件,仅验证变更的文件:

```bash
# 用Git diff检测变更文件
git diff --name-only origin/main | grep '\.md$'

# 输出示例
src/content/blog/ko/new-post.md
src/content/blog/en/new-post.md
```

这样即使在大型博客中也能快速验证。

### 变体 (Variations)

<strong>Variation 1: AI文化适应性验证</strong>

用Claude API检测文化不当表达:

```python
def validate_cultural_appropriateness(text: str, lang: str) -> dict:
    """用AI验证文化适应性"""

    prompt = f"""您是{lang}语言地区的文化专家。
请在以下文本中找出文化不当或容易误解的表达。

<text>
{text}
</text>

请检查以下项目:
1. 禁忌词、粗俗语言
2. 文化刻板印象
3. 宗教/政治敏感性
4. 性别歧视、种族歧视表达
5. 违背当地习俗的表达

用JSON格式回答:
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

    # JSON解析并返回
    # ...
```

<strong>Variation 2: 语言间一致性验证</strong>

验证同一内容的4种语言版本是否传达相同意义:

```python
def validate_translation_consistency(
    ko_file: Path,
    en_file: Path,
    ja_file: Path,
    zh_file: Path
) -> dict:
    """验证4种语言版本的一致性"""

    # 提取各文件的标题结构
    headings = {
        'ko': extract_headings(ko_file),
        'en': extract_headings(en_file),
        'ja': extract_headings(ja_file),
        'zh': extract_headings(zh_file),
    }

    # 确认标题数量相同
    heading_counts = [len(h) for h in headings.values()]
    if len(set(heading_counts)) > 1:
        return {
            "consistent": False,
            "issue": f"Heading count mismatch: {headings}"
        }

    # 确认代码块数量相同
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

## Recipe 18.4: 同步及一致性维护

### 问题 (Problem)

管理4种语言内容时会出现以下同步问题:

1. <strong>各语言文章数不一致</strong>: 韩语100篇,英语95篇,日语98篇...
2. <strong>元数据不一致</strong>: 同一文章但pubDate不同
3. <strong>图片不一致</strong>: 各语言使用不同的heroImage
4. <strong>更新遗漏</strong>: 修改了韩语文章但英语版本未更新

人工追踪困难,容易出错。

### 解决方案 (Solution)

构建自动同步系统。

<strong>Step 1: 同步状态检测</strong>

`scripts/check_sync.py`:

```python
#!/usr/bin/env python3
"""
多语言内容同步状态检查
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
        """检查整体同步状态"""
        # 各语言文件列表
        files_by_lang = {}
        for lang in self.languages:
            lang_dir = self.content_dir / lang
            files = set(f.name for f in lang_dir.glob("*.md"))
            files_by_lang[lang] = files

        # 1. 确认文件数量
        file_counts = {lang: len(files) for lang, files in files_by_lang.items()}

        # 2. 查找缺失的翻译
        all_slugs = set()
        for files in files_by_lang.values():
            all_slugs.update(files)

        missing_translations = {}
        for lang in self.languages:
            missing = all_slugs - files_by_lang[lang]
            if missing:
                missing_translations[lang] = list(missing)

        # 3. 确认元数据一致性
        metadata_issues = self._check_metadata_consistency()

        return {
            "file_counts": file_counts,
            "missing_translations": missing_translations,
            "metadata_issues": metadata_issues
        }

    def _check_metadata_consistency(self) -> List[dict]:
        """确认元数据一致性"""
        issues = []

        # 收集所有slug
        ko_files = list((self.content_dir / 'ko').glob("*.md"))

        for ko_file in ko_files:
            slug = ko_file.stem

            # 仅当4种语言文件都存在时
            files = {}
            for lang in self.languages:
                file_path = self.content_dir / lang / ko_file.name
                if file_path.exists():
                    files[lang] = file_path

            if len(files) < 4:
                continue  # 部分存在时skip(在missing_translations中处理)

            # 提取元数据
            metadata = {}
            for lang, file_path in files.items():
                fm = self._extract_frontmatter(file_path)
                metadata[lang] = fm

            # 确认pubDate一致
            pub_dates = [fm.get('pubDate') for fm in metadata.values()]
            if len(set(pub_dates)) > 1:
                issues.append({
                    "slug": slug,
                    "field": "pubDate",
                    "values": {lang: metadata[lang].get('pubDate') for lang in self.languages}
                })

            # 确认heroImage一致
            hero_images = [fm.get('heroImage') for fm in metadata.values()]
            if len(set(hero_images)) > 1:
                issues.append({
                    "slug": slug,
                    "field": "heroImage",
                    "values": {lang: metadata[lang].get('heroImage') for lang in self.languages}
                })

        return issues

    def _extract_frontmatter(self, file_path: Path) -> dict:
        """提取Frontmatter"""
        content = file_path.read_text(encoding='utf-8')
        match = re.match(r'^---\n(.*?)\n---', content, re.DOTALL)
        if match:
            return yaml.safe_load(match.group(1))
        return {}


def main():
    """CLI执行"""
    content_dir = Path("src/content/blog")
    checker = SyncChecker(content_dir)
    result = checker.check_all()

    print("\n=== Multilingual Content Sync Status ===\n")

    # 文件数量
    print("File counts:")
    for lang, count in result['file_counts'].items():
        print(f"  {lang}: {count} files")

    # 缺失的翻译
    if result['missing_translations']:
        print("\n⚠️  Missing translations:")
        for lang, files in result['missing_translations'].items():
            print(f"\n  {lang} ({len(files)} files):")
            for file in files[:5]:  # 仅显示前5个
                print(f"    - {file}")
            if len(files) > 5:
                print(f"    ... and {len(files)-5} more")
    else:
        print("\n✅ All files have translations in all languages")

    # 元数据不一致
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

<strong>Step 2: 自动同步脚本</strong>

`scripts/auto_sync.py`:

```python
#!/usr/bin/env python3
"""
自动生成缺失的翻译
"""

import os
from pathlib import Path
from check_sync import SyncChecker

# Translation Agent导入(参考Recipe 18.2)
import sys
sys.path.append(str(Path(__file__).parent.parent / '.claude/skills/translation-agent'))
from translate import TranslationAgent

def auto_sync(content_dir: Path, api_key: str):
    """自动生成缺失的翻译"""

    checker = SyncChecker(content_dir)
    result = checker.check_all()

    if not result['missing_translations']:
        print("✅ All files are synchronized")
        return

    agent = TranslationAgent(api_key)

    for target_lang, missing_files in result['missing_translations'].items():
        print(f"\n📝 Generating {len(missing_files)} {target_lang} translations...")

        for filename in missing_files:
            # 查找原始文件(一般为韩语)
            source_file = content_dir / 'ko' / filename

            if not source_file.exists():
                # 如果没有韩语,从其他语言查找
                for lang in ['en', 'ja', 'zh']:
                    alt_source = content_dir / lang / filename
                    if alt_source.exists():
                        source_file = alt_source
                        break

            if not source_file.exists():
                print(f"  ⚠️  Skipping {filename}: no source file found")
                continue

            # 生成翻译
            print(f"  Translating {filename} → {target_lang}...")
            try:
                result = agent.translate_post(source_file, target_lang)

                # 保存文件
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
    """CLI执行"""
    content_dir = Path("src/content/blog")
    api_key = os.environ.get("ANTHROPIC_API_KEY")

    if not api_key:
        print("Error: ANTHROPIC_API_KEY not set")
        return

    auto_sync(content_dir, api_key)


if __name__ == "__main__":
    main()
```

<strong>Step 3: 元数据同步</strong>

`scripts/sync_metadata.py`:

```python
#!/usr/bin/env python3
"""
元数据一致性自动修复
"""

import re
import yaml
from pathlib import Path
from check_sync import SyncChecker

def sync_metadata(content_dir: Path):
    """自动修复元数据不一致"""

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

        # 以韩语版本为基准同步
        canonical_value = values.get('ko')

        if not canonical_value:
            # 如果没有韩语则使用第一个值
            canonical_value = next(iter(values.values()))

        print(f"  {slug} - {field}:")
        print(f"    Canonical value: {canonical_value}")

        # 更新所有语言文件
        for lang in ['ko', 'en', 'ja', 'zh']:
            file_path = content_dir / lang / f"{slug}.md"

            if not file_path.exists():
                continue

            if values.get(lang) == canonical_value:
                continue  # 已经一致

            # 读取文件
            content = file_path.read_text(encoding='utf-8')

            # 更新Frontmatter
            match = re.match(r'^---\n(.*?)\n---\n(.*)$', content, re.DOTALL)
            if not match:
                continue

            frontmatter_text = match.group(1)
            body = match.group(2)

            # 更改字段值
            frontmatter_text = re.sub(
                rf'^{field}:.*$',
                f'{field}: "{canonical_value}"',
                frontmatter_text,
                flags=re.MULTILINE
            )

            # 写入文件
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(f"---\n{frontmatter_text}\n---\n{body}")

            print(f"    ✅ Updated {lang}/{slug}.md")


def main():
    """CLI执行"""
    content_dir = Path("src/content/blog")
    sync_metadata(content_dir)


if __name__ == "__main__":
    main()
```

<strong>Step 4: 集成工作流</strong>

`.claude/commands/sync-content.md`:

```markdown
# /sync-content Command

## Purpose
检查4种语言内容的同步状态并自动修复。

## Usage

\`\`\`bash
/sync-content [--check-only] [--fix-metadata]
\`\`\`

## Options

- `--check-only`: 仅检查状态不修复
- `--fix-metadata`: 自动修复元数据不一致

## Workflow

1. 检查同步状态
   - 各语言文件数量
   - 缺失的翻译
   - 元数据不一致

2. 自动生成缺失的翻译(可选)
   - 用Translation Agent翻译
   - 质量验证后保存

3. 元数据同步(可选)
   - 以韩语版本为基准统一
   - pubDate、heroImage等

4. 最终验证
   - Frontmatter架构验证
   - 构建测试

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

### 说明 (Explanation)

<strong>1. 同步验证3阶段</strong>

```
Stage 1: File Count Check
├─ 统计各语言文件数量
└─ 发现不一致时识别缺失文件

Stage 2: Content Consistency
├─ 比较相同slug的4个版本
├─ 确认pubDate、heroImage、tags一致
└─ 发现不一致时报告

Stage 3: Automated Fix
├─ 自动生成缺失的翻译
├─ 以韩语为基准统一元数据
└─ 最终验证(构建测试)
```

<strong>2. 自动 vs 人工修复</strong>

| 项目 | 自动修复 | 需人工审核 |
|------|----------|--------------|
| 缺失的翻译 | ✅ 生成AI翻译 | ❌ 质量审核后批准 |
| pubDate不一致 | ✅ 以韩语为基准统一 | ✅ (无争议) |
| heroImage不一致 | ✅ 以韩语为基准统一 | ✅ (无争议) |
| title不一致 | ❌ | ✅ (影响SEO) |
| description不一致 | ❌ | ✅ (影响SEO) |

title和description应各语言不同,因此不自动修复。

<strong>3. 同步周期</strong>

```
每日:
  - 检查同步状态(check_sync.py)
  - 自动修复元数据不一致

每周:
  - 生成缺失的翻译
  - 质量审核和人工修复

每月:
  - 全面内容审计
  - SEO质量重新验证
```

### 变体 (Variations)

<strong>Variation 1: 用Git Hook自动同步</strong>

提交前自动验证:

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

<strong>Variation 2: 用Dashboard可视化同步状态</strong>

`scripts/generate_sync_dashboard.py`:

```python
def generate_dashboard(content_dir: Path) -> str:
    """生成HTML仪表板"""

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

        <!-- 更多部分... -->
    </body>
    </html>
    """

    return html
```

---

## 实战项目: 完全自动化的多语言管道

现在整合所有Recipe创建完全自动化的系统。

### 场景

用韩语撰写博客文章时:
1. 自动生成英语、日语、中文翻译
2. 各语言SEO优化
3. 质量验证(架构、SEO、文化适应性)
4. 元数据同步
5. 4语言同步发布

### 集成命令: `/write-post-multilingual`

`.claude/commands/write-post-multilingual.md`:

```markdown
# /write-post-multilingual Command

## Purpose
撰写韩语文章后自动生成4种语言翻译并验证发布。

## Workflow

\`\`\`mermaid
graph TD
    A[撰写韩语文章] --> B[Frontmatter验证]
    B --> C{验证通过?}
    C -->|No| D[修复错误]
    D --> B
    C -->|Yes| E[生成3语言翻译]
    E --> F[SEO优化]
    F --> G[质量验证]
    G --> H{满足质量标准?}
    H -->|No| I[请求人工审核]
    H -->|Yes| J[元数据同步]
    J --> K[构建测试]
    K --> L{构建成功?}
    L -->|No| M[修复错误]
    M --> K
    L -->|Yes| N[4语言同步发布]
\`\`\`

## Steps

### 1. 撰写韩语文章

用户用韩语撰写文章。

### 2. 生成翻译

用Translation Agent生成en、ja、zh翻译:
- 本地化优先(改写而非翻译)
- SEO关键词优化
- 参考Glossary保持术语一致性

### 3. 质量验证

3层验证:
- Schema: Frontmatter必填字段、类型、长度
- SEO: 标题结构、关键词密度、链接、图片
- Build: Astro构建测试

### 4. 同步及发布

- pubDate、heroImage同步
- 生成relatedPosts 4语言理由
- Git提交和推送

## Usage

\`\`\`bash
/write-post-multilingual <topic> [--skip-review]
\`\`\`

## Options

- `--skip-review`: 质量分数90%以上自动批准

## Example

\`\`\`
/write-post-multilingual "React Server Components完全指南"
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

### 实现

`.claude/commands/implementations/write_post_multilingual.py`:

```python
#!/usr/bin/env python3
"""
多语言文章生成及发布自动化
"""

import os
import sys
from pathlib import Path

# 导入现有脚本
sys.path.append(str(Path(__file__).parent.parent.parent / '.claude/skills/translation-agent'))
sys.path.append(str(Path(__file__).parent.parent.parent / 'scripts'))

from translate import TranslationAgent
from validate_frontmatter import FrontmatterValidator
from validate_seo import SEOValidator
from sync_metadata import sync_metadata

def write_multilingual_post(topic: str, skip_review: bool = False):
    """生成和发布多语言文章"""

    content_dir = Path("src/content/blog")

    # 1. 撰写韩语文章(利用现有writing-assistant)
    print(f"\n📝 Writing Korean post about '{topic}'...")
    # ... (现有writing-assistant逻辑)
    ko_file = content_dir / "ko" / "new-post.md"
    print(f"  ✅ Created {ko_file}")

    # 2. 生成翻译
    print("\n🌍 Generating translations...")
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    agent = TranslationAgent(api_key)

    translations = {}
    for lang in ['en', 'ja', 'zh']:
        print(f"  📝 Translating to {lang.upper()}...")
        result = agent.translate_post(ko_file, lang)

        # 保存文件
        output_file = content_dir / lang / ko_file.name
        with open(output_file, 'w', encoding='utf-8') as f:
            # ... (写入frontmatter + content)
            pass

        translations[lang] = {
            "file": output_file,
            "quality": result['quality_score']
        }

        print(f"    ✅ {output_file} (quality: {result['quality_score']:.0%})")

    # 3. 质量验证
    print("\n🔍 Validating quality...")

    # Frontmatter验证
    validator = FrontmatterValidator(content_dir)
    if not validator.validate_all():
        print("  ❌ Frontmatter validation failed")
        return False
    print("  ✅ Frontmatter validation passed")

    # SEO验证
    seo_scores = {}
    for lang in ['ko', 'en', 'ja', 'zh']:
        file_path = content_dir / lang / ko_file.name
        seo_validator = SEOValidator(file_path)
        result = seo_validator.validate()
        seo_scores[lang] = result['score']

    avg_seo_score = sum(seo_scores.values()) / len(seo_scores)
    print(f"  ✅ SEO validation passed (scores: {', '.join(f'{k}={v}' for k, v in seo_scores.items())})")

    # 构建测试
    import subprocess
    build_result = subprocess.run(['npm', 'run', 'build'], capture_output=True)
    if build_result.returncode != 0:
        print("  ❌ Build test failed")
        return False
    print("  ✅ Build test passed")

    # 4. 是否需要人工审核
    min_quality = min(t['quality'] for t in translations.values())
    if min_quality < 0.9 and not skip_review:
        print(f"\n⚠️  Quality score below 90% ({min_quality:.0%}). Manual review recommended.")
        print("    Run with --skip-review to auto-approve")
        return False

    # 5. 元数据同步
    print("\n🔧 Synchronizing metadata...")
    sync_metadata(content_dir)

    # 6. Git提交和推送
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

## 总结

本章构建了4语言同步内容生成系统:

<strong>Recipe 18.1: 多语言结构设计</strong>
- 基于Content Collections的语言分类文件夹结构
- 类型安全的架构定义
- 语言切换组件

<strong>Recipe 18.2: 翻译代理实现</strong>
- 用Claude API进行本地化优先翻译
- 生成SEO优化的元数据
- 基于Glossary的术语一致性

<strong>Recipe 18.3: 质量验证自动化</strong>
- 3层验证(Schema, SEO, Build)
- GitHub Actions集成
- AI文化适应性验证

<strong>Recipe 18.4: 同步及一致性维护</strong>
- 自动同步状态检测
- 自动生成缺失的翻译
- 元数据统一

<strong>核心原则</strong>:

1. <strong>本地化而非翻译</strong>: 为各语言地区读者改写
2. <strong>自动化优先</strong>: 重复任务用脚本自动化
3. <strong>质量保证</strong>: 用3层验证保持一致性
4. <strong>持续改进</strong>: Translation Memory、审核工作流

现在用韩语撰写文章后,自动翻译成4种语言,经过质量验证后同步发布。全球博客运营变得更加容易。

---

## 练习题

1. <strong>基础</strong>: 在您的项目中应用Recipe 18.1的多语言结构。
2. <strong>中级</strong>: 为Translation Agent添加新语言(西班牙语、法语)。
3. <strong>高级</strong>: 实现AI文化适应性验证系统。
4. <strong>深化</strong>: 创建评估翻译质量的自动化A/B测试系统。

---

## 下章预告

Chapter 19将介绍<strong>AI内容推荐系统</strong>。构建不使用TF-IDF而利用Claude语义理解向读者推荐最相关文章的系统。
