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

2. **본문** — 5개 이상 H2 섹션, 길이 불균일하게
   - 어떤 섹션은 3줄, 어떤 섹션은 20줄 — 균일하면 AI 냄새
   - 구조 장치는 **유형에 따라 유동적** (Tutorial: 3~4개, Opinion: 0~2개)
   - 1인칭 경험 최소 3회
   - 비판적 의견 최소 2회
   - 전문 분야 밖 내용은 지식 수준 명시
   - **총 2,000단어 이상** (한국어 기준)

3. **마무리** — 아래를 피한다:
   - "정리하자면" 요약 반복
   - "앞으로 기대됩니다" 공허한 전망
   - 체크리스트/할 일 목록
   - 대신: 미해결 질문, 다음 실험 계획, 구체적 제안

4. **참고 자료** (선택) — 링크 나열

### 기사 유형별 필수 구조 (Type-Driven Architecture)

> **핵심**: 글을 시작하기 전에 유형을 먼저 결정하라. 유형이 구조를 결정하고, 구조가 분량을 결정한다.

#### 유형 A: Tutorial (튜토리얼/실습)

**구조**: "만들 것 소개" → Prerequisites → Step 1~N (번호 매기기) → "동작 확인" → 트러블슈팅 FAQ → 다음 단계

**필수 포함**:
- 모든 단계에 코드 블록 (복사-붙여넣기 가능한 명령어)
- 각 단계 후 예상 출력/결과
- 최소 1개 트러블슈팅 항목 ("이런 에러가 나면")
- 실제로 돌려본 경험 기반 ("이 단계에서 나는 X에서 막혔다")

**구조 장치**: 코드 블록 필수 + 선택적으로 아키텍처 다이어그램 (3~4개 허용)

**예상 분량**: 2,500~3,500단어

#### 유형 B: Comparison (비교 분석)

**구조**: 문제 정의 ("왜 비교하는가") → 도구/기술별 분석 (H2 각각) → 비교표 → "어떤 상황에서 뭘 쓸까" 결정 매트릭스 → 내 선택과 이유

**필수 포함**:
- 도구/기술당 최소 300단어 (장점 + 단점 모두)
- 비교표 1개 이상 (가격, 기능, 성능 등)
- 명확한 추천 의견 ("나라면 X를 쓴다, 이유는~")
- 각 도구의 실제 사용 경험 또는 테스트 결과

**구조 장치**: 비교표 필수 + 선택적으로 코드/다이어그램 (3~4개 허용)

**예상 분량**: 2,500~4,000단어

#### 유형 C: Guide (가이드/설명)

**구조**: "왜 이게 중요한가" → 핵심 개념 (H2 2~3개) → 실전 적용 → 흔한 실수 → FAQ (실제 검색 질문 기반, H3 `### Q:` 형식) → 핵심 정리

**필수 포함**:
- 핵심 개념당 구체적 예시 1개 이상
- FAQ 3개 이상 (실제 사람들이 검색할 법한 질문)
- 실행 가능한 조언 ("지금 당장 할 수 있는 것")
- 흔한 실수 섹션 (1인칭 경험 포함)

**구조 장치**: 유연 — 다이어그램, 코드, 표 중 필요한 것 (2~3개)

**예상 분량**: 2,000~3,000단어

#### 유형 D: Review/Opinion (리뷰/의견)

**구조**: 핵심 평가 먼저 → 무엇인가 → 좋은 점 → 아쉬운 점 → 가격/비용 분석 → 누구에게 맞는가 / 누가 피해야 하는가 → 최종 의견

**필수 포함**:
- 구체적 칭찬 AND 구체적 비판 (균형 아닌 솔직함)
- 가격 대비 가치 평가
- "Bottom Line" 한 줄 요약
- 명확한 입장 ("프로덕션에 쓸 만하다" or "아직 이르다")

**구조 장치**: 산문 중심 — 코드나 표는 0~2개 (필요할 때만)

**예상 분량**: 2,000~2,500단어

#### 유형 E: Exploration (탐구/리서치)

**구조**: 질문 제기 → 리서치 과정 → 발견한 것들 → 부분적 답 → 남은 의문 + 다음 실험 계획

**필수 포함**:
- 출발 질문이 명확해야 함
- 리서치 소스 명시 (공식 문서, 논문, GitHub 등)
- "내가 이해한 바로는" 식의 지식 수준 명시
- 답이 불완전해도 OK — 솔직하게 "여기까지만 알겠다"

**구조 장치**: 유연 — 다이어그램이 도움 되면 사용 (1~2개)

**예상 분량**: 2,000~3,000단어

---

**유형 선택 가이드**:

| 글의 성격 | 유형 | 핵심 |
|-----------|------|------|
| "X 만들기", "X 설정하기" | A (Tutorial) | 단계별 코드 |
| "X vs Y", "어떤 걸 쓸까" | B (Comparison) | 비교표 + 추천 |
| "X란 무엇인가", "X 활용법" | C (Guide) | 개념 + FAQ |
| "X 써봤다", "X 발표 소감" | D (Review/Opinion) | 솔직한 평가 |
| "왜 X인가?", "X의 미래" | E (Exploration) | 열린 질문 |

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

### Total Post Length (CRITICAL)
- **Minimum**: 2,000단어 (한국어 기준)
- **권장**: 2,500~3,500단어 (유형에 따라 다름)
- **H2 섹션**: 최소 5개
- 미달 시 QA에서 FAIL — 얕은 섹션을 구체적 예시, 코드, 경험담으로 보강

### Introduction
- **Length**: 150-300 words
- **Goal**: Hook the reader and set expectations
- **Include**: Problem statement, solution preview, what they'll learn

### Main Sections
- **Length**: 300-600 words per section (섹션 간 길이 불균일 허용)
- **Structure**: 유형별 필수 구조 따르기 (위 Type-Driven Architecture 참조)
- **Include**: Code examples, diagrams, screenshots
- **Depth**: 추상적 설명보다 구체적 예시, 수치, 실제 시나리오

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
