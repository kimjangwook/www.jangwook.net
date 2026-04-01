# Content Structure Template

## Blog Post Structure — 유연한 가이드

> **핵심**: 모든 포스트가 같은 구조를 따르면 AI가 쓴 것처럼 보인다. 아래는 "필수 요소" 목록이지, 고정 템플릿이 아니다.

### 필수 요소 (순서는 자유)

1. **도입** — 아래 중 하나로 시작 (매번 다르게):
   - 코드 스니펫 → "이 코드를 보자"
   - 뉴스/이벤트 → "어제 X가 발표됐다"
   - 개인 경험 → "지난주 배포 중에 이런 일이 있었다"
   - 질문 → "왜 아무도 이걸 문제라고 안 할까?"
   - 반직관적 주장 → "이 기술은 과대평가됐다"
   - **금지**: 매번 "## 개요"로 시작

2. **본문** — 2~5개 섹션, 길이 불균일하게
   - 어떤 섹션은 3줄, 어떤 섹션은 20줄
   - 구조 장치(표, 다이어그램, 코드, 체크리스트)는 **최대 2개**
   - 1인칭 경험 최소 3회
   - 비판적 의견 최소 2회
   - 전문 분야 밖 내용은 지식 수준 명시

3. **마무리** — 아래를 피한다:
   - "정리하자면" 요약 반복
   - "앞으로 기대됩니다" 공허한 전망
   - 체크리스트/할 일 목록
   - 대신: 미해결 질문, 다음 실험 계획, 구체적 제안

4. **참고 자료** (선택) — 링크 나열

### 구조 변주 예시

**패턴 A**: 문제 발견 → 삽질 과정 → 해결 → 교훈
**패턴 B**: 뉴스 요약 → 내 해석 → 실제 테스트 → 결론
**패턴 C**: 코드 먼저 → 왜 이렇게 짰는지 → 대안 비교
**패턴 D**: 두 기술 비교 → 각각 써본 경험 → 추천
**패턴 E**: 질문 제기 → 리서치 → 부분적 답 → 남은 의문

```markdown
---
title: 'Your Post Title'
description: 'Your post description'
pubDate: 'YYYY-MM-DD'
heroImage: '../../../assets/blog/your-image.jpg'
tags: ['tag1', 'tag2', 'tag3']
---

[도입 — 매번 다른 방식으로]

## [본문 섹션 — 제목은 내용에 맞게 자유롭게]

[내용]

## [필요한 만큼 섹션 추가]

[내용]

[마무리 — "## 결론" 헤더 없이 자연스럽게 끝내도 됨]

## 참고 자료 (선택)

- [Link 1]
- [Link 2]
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

### Multi-language Consistency

All language versions should have the **same number of sections and same content flow**, but:
- Section headings are naturally translated (not mechanically mapped)
- The specific heading text should fit each language's conventions
- Section order and count must match across all 4 languages
- **Do NOT use a fixed heading template** — headings should reflect the actual content of each post

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
