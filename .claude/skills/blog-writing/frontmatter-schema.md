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
- All required fields present
- Date format correct (YYYY-MM-DD)
- Single quotes used for dates
- Title/description length appropriate
- Tags lowercase and hyphenated
- Hero image path exists

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
