# Content Structure Template

## Standard Blog Post Structure

```markdown
---
title: 'Your Post Title'
description: 'Your post description'
pubDate: 'YYYY-MM-DD'
heroImage: '../../../assets/blog/your-image.jpg'
tags: ['tag1', 'tag2', 'tag3']
---

## Overview

Brief introduction to the topic (2-3 paragraphs):
- What problem does this solve?
- Why is it important?
- What will readers learn?

## Main Content

### Section 1: Problem/Background

Explain the context and background:
- Current situation
- Pain points
- Why existing solutions fall short

### Section 2: Solution/Approach

Present your solution or approach:
- Core concept
- Key features
- How it works

### Section 3: Implementation

Step-by-step implementation details:
- Code examples
- Configuration
- Best practices

### Section 4: Advanced Topics (Optional)

For more in-depth posts:
- Advanced use cases
- Performance optimization
- Edge cases

### Section 5: Real-world Examples

Practical demonstrations:
- Working examples
- Case studies
- Before/after comparisons

## Conclusion

Summary and takeaways:
- Key points recap
- What readers should do next
- Additional resources

## References (Optional)

- External links
- Documentation
- Related articles
```

## Content Guidelines

### Introduction
- **Length**: 150-300 words
- **Goal**: Hook the reader and set expectations
- **Include**: Problem statement, solution preview, what they'll learn

### Main Sections
- **Length**: 300-500 words per section
- **Structure**: Problem → Solution → Example
- **Include**: Code examples, diagrams, screenshots

### Code Examples
- Always include language specification: \`\`\`typescript
- Add comments for complex logic
- Keep examples focused and minimal
- Use real-world scenarios
- **Important**: Use quadruple backticks (\`\`\`\`) when code contains triple backticks

Example:
````markdown
````typescript
// Example code here
const example = "value";
````
````

### Conclusion
- **Length**: 100-200 words
- **Goal**: Reinforce key takeaways and provide next steps
- **Include**: Summary, call-to-action, related posts

## Formatting Standards

### Headings

- Use `##` for main sections (h2)
- Use `###` for subsections (h3)
- Use `####` for sub-subsections (h4)
- Avoid going deeper than h4

### Lists

- Use `-` for unordered lists
- Use `1.` for ordered lists
- Keep list items concise (1-2 lines)
- Use sub-bullets when needed

### Emphasis

- **Bold**: Important terms, key concepts
- *Italic*: Emphasis, first-time technical terms
- `Code`: Inline code, file names, commands

### Links

- **Internal links**: Use relative paths
- **External links**: Always include protocol (https://)
- **Link text**: Descriptive, not "click here"

Example:
```markdown
See the [official documentation](https://docs.example.com) for more details.
Check out my [previous post](../previous-post) on this topic.
```

### Images

- Always include alt text for accessibility
- Use descriptive file names
- Optimize images before adding (WebP preferred)
- Place images in `src/assets/blog/`

Example:
```markdown
![Alt text describing the image](../../../assets/blog/image-name.jpg)
```

## Language-Specific Considerations

### Korean (ko)
- Use natural Korean sentence structure
- Avoid excessive honorifics in technical content
- Use Korean technical terms when standard
- Balance Korean terms with English originals in parentheses

Example:
```markdown
컴포넌트(Component)는 재사용 가능한 UI 단위입니다.
```

### English (en)
- Use clear, concise language
- American English spelling
- Active voice preferred
- Short paragraphs (3-5 sentences)

Example:
```markdown
Components are reusable UI building blocks that encapsulate logic and presentation.
```

### Japanese (ja)
- Use appropriate keigo level (ですます調 for blog)
- Balance kanji and hiragana readability
- Include katakana for English technical terms
- Use です/ます form consistently

Example:
```markdown
コンポーネントは再利用可能なUIの構成要素です。
```

### Chinese (zh)
- Use simplified Chinese characters (简体中文)
- Clear and concise technical explanations
- Balance technical terms with everyday language
- Use appropriate Chinese punctuation (，。！？)
- Maintain formal but approachable tone

Example:
```markdown
组件是可重用的UI构建块，它封装了逻辑和表现层。
```

## Code Block Best Practices

### Language Specification

Always specify the language:
- \`\`\`typescript
- \`\`\`javascript
- \`\`\`python
- \`\`\`bash
- \`\`\`yaml
- \`\`\`json
- \`\`\`markdown
- \`\`\`astro

### Comments

Add comments for clarity:
```typescript
// Bad: No context
const data = await fetch(url);

// Good: Clear purpose
// Fetch user data from the API endpoint
const userData = await fetch(`/api/users/${userId}`);
```

### Line Length

Keep code lines under 80 characters for readability:
```typescript
// Bad: Long line
const result = someVeryLongFunctionName(parameter1, parameter2, parameter3, parameter4);

// Good: Multi-line
const result = someVeryLongFunctionName(
  parameter1,
  parameter2,
  parameter3,
  parameter4
);
```

## SEO Optimization

### Keywords
- Include primary keyword in first paragraph
- Use secondary keywords in headings
- Distribute keywords naturally (no stuffing)
- Use related terms and synonyms

### Internal Linking
- Link to 2-5 related posts
- Use descriptive anchor text
- Link to both prerequisite and follow-up content

### Meta Description
- Front-load important information
- Include target keyword
- End with a benefit or call-to-action

## Accessibility

### Images
- Always include descriptive alt text
- Don't repeat "image of" or "picture of"
- Describe the content, not the format

### Headings
- Use logical hierarchy (don't skip levels)
- Make headings descriptive
- Use sentence case, not title case

### Links
- Use descriptive link text
- Avoid "click here" or "read more"
- Make link purpose clear from text alone

## Multi-language Consistency

When creating multi-language versions:

### Maintain
- Same structure and sections
- Same code examples
- Same images and diagrams
- Same number of sections

### Adapt
- Cultural references
- Examples and analogies
- Idiomatic expressions
- Writing style and tone

### Example Structure Consistency

All three language versions should have identical section structure:

**Korean (ko):**
```markdown
## 개요
## 문제 배경
## 해결 방법
## 구현 단계
## 실전 예제
## 결론
```

**English (en):**
```markdown
## Overview
## Problem Background
## Solution Approach
## Implementation Steps
## Real-world Examples
## Conclusion
```

**Japanese (ja):**
```markdown
## 概要
## 問題の背景
## 解決アプローチ
## 実装手順
## 実例
## まとめ
```

**Chinese (zh):**
```markdown
## 概述
## 问题背景
## 解决方案
## 实现步骤
## 实际案例
## 总结
```

## Quality Checklist

Before publishing, verify:

- [ ] Frontmatter complete and valid
- [ ] SEO: Title length appropriate for language
- [ ] SEO: Description length appropriate for language
- [ ] All code blocks have language specification
- [ ] All images have alt text
- [ ] All links work (no 404s)
- [ ] Consistent heading hierarchy
- [ ] No spelling or grammar errors
- [ ] Internal links to related posts
- [ ] Multi-language versions consistent in structure
- [ ] Code examples are tested and working
- [ ] pubDate follows latest + 1 day convention
