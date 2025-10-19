---
name: Blog Writing Assistant
description: Create SEO-optimized multi-language blog posts with proper frontmatter, hero images, and content structure. Use when writing blog posts, creating content, or managing blog metadata.
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
---

# Blog Writing Assistant

This Skill automates the entire blog post creation process for the Astro-based blog.

## Core Features

1. **Frontmatter Validation**: Date format, required field checks
2. **SEO Optimization**: Title/description length validation
3. **Multi-language Support**: Simultaneous Korean, English, Japanese generation
4. **Slug Generation**: Automatic URL-friendly filename creation

## Workflow

### 1. Determine Date

```bash
python scripts/get_next_pubdate.py
```

This script finds the latest blog post pubDate and returns the next day in the correct format.

### 2. Validate Frontmatter

See [frontmatter-schema.md](frontmatter-schema.md) for detailed rules.

Required fields:
- title (optimal length per language in [seo-guidelines.md](seo-guidelines.md))
- description
- pubDate (format: 'YYYY-MM-DD', single quotes required)
- heroImage
- tags (array, lowercase, hyphens only)

### 3. Content Structure

Follow template in [content-structure.md](content-structure.md).

### 4. Validation

```bash
python scripts/validate_frontmatter.py <language>/post-name.md
```

## Best Practices

- Follow SEO guidelines for titles
- pubDate always latest post + 1 day
- heroImage uses ../../../assets/blog/ path
- Use quadruple backticks when code blocks contain triple backticks
- Create all three language versions simultaneously (ko, en, ja)
- Same filename across all language folders
- Hero images are shared across all languages

## File Structure

Blog posts are organized by language:
```
src/content/blog/
├── ko/post-name.md    # Korean version
├── en/post-name.md    # English version
└── ja/post-name.md    # Japanese version
```

All versions should:
- Use the same filename
- Share the same heroImage path
- Use the same pubDate
- Have language-appropriate SEO metadata
