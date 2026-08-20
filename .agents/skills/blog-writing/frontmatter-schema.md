# Frontmatter Schema

## Required Fields

### title (string)
- **Type**: String
- **Required**: Yes
- **Format**: Plain text
- **Constraints**:
  - Korean: 25-30 characters
  - English: 50-60 characters
  - Japanese: 30-35 characters
- **Example**: `title: 'Claude Skills Complete Guide'`

### description (string)
- **Type**: String
- **Required**: Yes
- **Format**: Plain text
- **Constraints**:
  - Korean: 70-80 characters
  - English: 150-160 characters
  - Japanese: 80-90 characters
- **Example**: `description: 'A practical guide documenting the journey from introducing Claude Agent Skills to real-world implementation.'`

### pubDate (string)
- **Type**: String (auto-converted to Date by Astro)
- **Required**: Yes
- **Format**: `'YYYY-MM-DD'` with **single quotes**
- **Important**: Must use single quotes, not double quotes
- **Constraints**: Must be a valid date
- **Example**: `pubDate: '2025-10-22'`
- **Best Practice**: Use `get_next_pubdate.py` to automatically generate the next available date

### heroImage (string)
- **Type**: String (path to image)
- **Required**: Yes (strongly recommended)
- **Format**: Relative path from the content file
- **Path**: `../../../assets/blog/filename.jpg`
- **Supported formats**: .jpg, .jpeg, .png, .webp
- **Recommended size**: 1020x510 pixels (2:1 ratio)
- **Example**: `heroImage: '../../../assets/blog/claude-skills-guide-hero.jpg'`

### tags (array)
- **Type**: Array of strings
- **Required**: No (but recommended)
- **Format**: `['tag1', 'tag2', 'tag3']`
- **Constraints**:
  - Lowercase only
  - Use hyphens for multi-word tags
  - Maximum 5 tags recommended
  - First 3 tags displayed on blog cards
- **Example**: `tags: ['claude-code', 'agent-skills', 'ai-automation']`

### relatedPosts (array)
- **Type**: Array of related post objects
- **Required**: Yes (mandatory for all posts)
- **Format**: Array of objects with slug, score, and multilingual reason
- **Structure**:
  ```yaml
  relatedPosts:
    - slug: "related-post-slug"
      score: 0.85  # Similarity score (0-1 range)
      reason:
        ko: "한국어 추천 이유"
        ja: "日本語の推薦理由"
        en: "English recommendation reason"
        zh: "中文推荐理由"
  ```
- **Constraints**:
  - Score must be between 0 and 1
  - Slug must match an existing post filename (without .md extension)
  - Reason must include all 4 languages (ko, ja, en, zh)
  - Recommended: 3-5 related posts per article
- **Generation**: Use @content-recommender skill or /generate-recommendations command
- **Example**:
  ```yaml
  relatedPosts:
    - slug: "claude-skills-implementation"
      score: 0.92
      reason:
        ko: "Claude Skills 시스템의 실전 구현 방법을 다룹니다"
        ja: "Claude Skillsシステムの実装方法を解説します"
        en: "Covers practical implementation of Claude Skills system"
        zh: "介绍Claude Skills系统的实际实现方法"
    - slug: "ai-automation-best-practices"
      score: 0.78
      reason:
        ko: "AI 자동화의 모범 사례와 패턴을 제시합니다"
        ja: "AI自動化のベストプラクティスとパターンを紹介します"
        en: "Presents best practices and patterns for AI automation"
        zh: "提供AI自动化的最佳实践和模式"
  ```

## Optional Fields

### updatedDate (string)
- **Type**: String (auto-converted to Date by Astro)
- **Required**: No
- **Format**: `'YYYY-MM-DD'` with single quotes
- **Use Case**: When significantly updating an existing post
- **Example**: `updatedDate: '2025-10-23'`

## Complete Example

```yaml
---
title: 'Claude Skills Complete Guide: From Project Implementation to Practical Know-How'
description: 'A practical guide documenting the journey from introducing Claude Agent Skills to real-world implementation, including trials, errors, and achievements.'
pubDate: '2025-10-22'
heroImage: '../../../assets/blog/claude-skills-guide-hero.jpg'
tags: ['claude-code', 'agent-skills', 'ai-automation']
relatedPosts:
  - slug: "claude-code-best-practices"
    score: 0.88
    reason:
      ko: "Claude Code 사용의 핵심 모범 사례를 상세히 설명합니다"
      ja: "Claude Code使用の主要なベストプラクティスを詳しく解説します"
      en: "Detailed explanation of core best practices for using Claude Code"
      zh: "详细说明使用Claude Code的核心最佳实践"
  - slug: "ai-workflow-automation"
    score: 0.75
    reason:
      ko: "AI를 활용한 워크플로우 자동화 전략을 다룹니다"
      ja: "AIを活用したワークフロー自動化戦略を扱います"
      en: "Covers AI-powered workflow automation strategies"
      zh: "涵盖AI驱动的工作流程自动化策略"
---
```

## Multi-language Consistency

All three language versions (ko, en, ja) must have:
- ✅ Same `pubDate`
- ✅ Same `heroImage` path
- ✅ Same tag structure (same concepts, language-appropriate translation)
- ✅ Same filename (e.g., `claude-skills-implementation-guide.md`)
- ⚠️ Different `title` (language-appropriate, SEO-optimized)
- ⚠️ Different `description` (language-appropriate, SEO-optimized)

## Validation

Use the validation script to check frontmatter:

```bash
python .claude/skills/blog-writing/scripts/validate_frontmatter.py ko/post-name.md
```

The script checks:
- All required fields present (including relatedPosts)
- Date format correct (YYYY-MM-DD)
- Single quotes used for dates
- Title/description length appropriate
- Tags lowercase and hyphenated
- Hero image path exists
- relatedPosts structure valid (slug, score, multilingual reasons)

## Common Errors

### ❌ Double quotes on date
```yaml
pubDate: "2025-10-22"  # Wrong
```

### ✅ Single quotes on date
```yaml
pubDate: '2025-10-22'  # Correct
```

### ❌ No quotes on date
```yaml
pubDate: 2025-10-22  # Wrong (will be interpreted as math)
```

### ❌ Wrong date format
```yaml
pubDate: '10/22/2025'  # Wrong format
pubDate: 'Oct 22 2025'  # Wrong format
```

### ✅ Correct date format
```yaml
pubDate: '2025-10-22'  # Correct
```

### ❌ Uppercase tags
```yaml
tags: ['Claude-Code', 'AI']  # Wrong
```

### ✅ Lowercase tags with hyphens
```yaml
tags: ['claude-code', 'ai-automation']  # Correct
```

## TypeScript Type Definition

From `src/content.config.ts`:

```typescript
{
  title: string           // Required
  description: string     // Required
  pubDate: Date          // Required (auto-converted from string)
  updatedDate?: Date     // Optional (auto-converted from string)
  heroImage?: ImageMetadata  // Optional (Astro image optimization)
  tags?: string[]        // Optional (tag array)
}
```

## Path Structure

```
src/content/blog/
├── ko/
│   └── post-name.md    # Korean version
├── en/
│   └── post-name.md    # English version
└── ja/
    └── post-name.md    # Japanese version

src/assets/blog/
└── post-name-hero.jpg  # Shared hero image
```

All language versions reference the same hero image:
```yaml
heroImage: '../../../assets/blog/post-name-hero.jpg'
```
