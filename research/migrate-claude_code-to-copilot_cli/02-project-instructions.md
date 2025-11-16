# 프로젝트 지침 변환 가이드

## 목차

1. [개요](#개요)
2. [파일 구조 비교](#파일-구조-비교)
3. [기본 변환](#기본-변환)
4. [고급 기능](#고급-기능)
5. [실전 변환 예제](#실전-변환-예제)
6. [베스트 프랙티스](#베스트-프랙티스)

## 개요

### 목표

Claude Code의 `CLAUDE.md` 파일을 GitHub Copilot CLI의 **Custom Instructions** 시스템으로 변환합니다.

### 핵심 차이점

| 항목 | Claude Code | GitHub Copilot CLI |
|------|-------------|---------------------|
| **파일명** | `CLAUDE.md` | `.github/copilot-instructions.md` |
| **위치** | 프로젝트 루트 | `.github/` 디렉토리 |
| **형식** | Markdown | Markdown (동일) |
| **계층 구조** | 단일 파일 | 여러 `.instructions.md` 파일 가능 |
| **범위 지정** | 전체 프로젝트 | 파일/디렉토리별 YAML frontmatter |
| **자동 로드** | 세션 시작 시 | 모든 요청마다 |

## 파일 구조 비교

### Claude Code

**단일 파일 접근**:

```
프로젝트/
└── CLAUDE.md  (모든 가이드라인)
```

**CLAUDE.md 예시**:
```markdown
# CLAUDE.md

## 프로젝트 개요
Astro 기반의 블로그 프로젝트...

## 아키텍처
- Framework: Astro 5.14.1
- Content: Content Collections
...

## 코딩 규칙
- TypeScript strict mode
- 테스트 필수
...
```

### GitHub Copilot CLI

**계층적 접근** (옵션 1 - 단일 파일):

```
프로젝트/
└── .github/
    └── copilot-instructions.md  (전체 프로젝트 가이드라인)
```

**계층적 접근** (옵션 2 - 다중 파일):

```
프로젝트/
└── .github/
    ├── copilot-instructions.md      # 전체 프로젝트 가이드
    └── copilot-instructions/
        ├── components.instructions.md  # 컴포넌트 전용
        ├── api.instructions.md         # API 전용
        └── tests.instructions.md       # 테스트 전용
```

**YAML Frontmatter로 범위 지정**:

```markdown
---
applyTo: "src/components/**/*.tsx"
---

# Component Development Guidelines

컴포넌트 작성 시 이 규칙을 따르세요...
```

## 기본 변환

### Step 1: 파일 생성

```bash
# .github 디렉토리 생성 (없는 경우)
mkdir -p .github

# CLAUDE.md 복사
cp CLAUDE.md .github/copilot-instructions.md
```

### Step 2: 내용 조정 (대부분 그대로 사용 가능)

**Before** (`CLAUDE.md`):
```markdown
# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## 프로젝트 개요
Astro 기반의 블로그 및 커리어 관리 자동화 프로젝트입니다.

## 명령어
```bash
npm run dev        # Development server
npm run build      # Production build
```

## 아키텍처
...
```

**After** (`.github/copilot-instructions.md`):
```markdown
# Project Guidelines for GitHub Copilot

## 프로젝트 개요
Astro 기반의 블로그 및 커리어 관리 자동화 프로젝트입니다.

## 명령어
```bash
npm run dev        # Development server
npm run build      # Production build
```

## 아키텍처
...
```

**변경 사항**:
- 제목 수정 (선택사항)
- 내용은 대부분 그대로 유지 가능

### Step 3: 검증

```bash
# Copilot CLI 시작
copilot

# 프로젝트 디렉토리에서
# 프롬프트에 입력:
"Summarize the project guidelines you've loaded"
```

Copilot이 `.github/copilot-instructions.md` 내용을 인식하고 요약하는지 확인.

## 고급 기능

### 경로별 지침 (applyTo)

특정 파일이나 디렉토리에만 적용되는 지침을 작성할 수 있습니다.

#### 예제 1: 컴포넌트 전용 지침

`.github/copilot-instructions/components.instructions.md`:

```markdown
---
applyTo: "src/components/**/*.{tsx,astro}"
---

# Component Development Guidelines

## Structure
All Astro components must follow this pattern:

```astro
---
interface Props {
  title: string;
  description?: string;
}
const { title, description = 'Default' } = Astro.props;
---

<div class="component">
  <h2>{title}</h2>
  {description && <p>{description}</p>}
</div>

<style>
  /* Scoped styles only */
</style>
```

## Tailwind CSS
- Use Tailwind classes over custom CSS
- Order: layout → typography → colors → effects
- Mobile-first responsive design
```

**효과**: `src/components/` 내의 파일을 편집할 때만 이 지침이 적용됨.

#### 예제 2: API 라우트 전용 지침

`.github/copilot-instructions/api.instructions.md`:

```markdown
---
applyTo: "src/pages/api/**/*.{ts,js}"
---

# API Route Guidelines

## Error Handling
All API routes must use consistent error handling:

```typescript
export async function GET({ request }) {
  try {
    // Logic here
    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
```

## Authentication
All protected routes must verify auth tokens.
```

#### 예제 3: 블로그 포스트 전용 지침

`.github/copilot-instructions/blog-posts.instructions.md`:

```markdown
---
applyTo: "src/content/blog/**/*.md"
---

# Blog Post Writing Guidelines

## Frontmatter Requirements
All blog posts MUST include:

```yaml
title: "60 characters max"
description: "150-160 characters for SEO"
pubDate: 'YYYY-MM-DD'  # Single quotes, specific format
heroImage: '../../../assets/blog/hero.jpg'
tags: ["tag1", "tag2", "tag3"]
```

## Content Rules
- **Bold text**: Use `<strong>text</strong>` instead of `**text**`
- **Ranges**: Use full-width tilde `〜` instead of `~`
- **Code blocks**: Always specify language for syntax highlighting
- **Internal links**: Add 2-3 links to related posts

## Multi-language
- Same filename across all language folders (ko/, en/, ja/, zh/)
- Share same heroImage path
- Maintain consistent structure
```

### applyTo 패턴 예제

| 패턴 | 설명 |
|------|------|
| `"src/**/*.ts"` | src 폴더 내 모든 TypeScript 파일 |
| `"src/components/**/*.{tsx,astro}"` | 컴포넌트 폴더의 TSX 및 Astro 파일 |
| `"**/*.test.ts"` | 모든 테스트 파일 |
| `"src/pages/api/**/*"` | API 라우트만 |
| `"*.config.{js,ts}"` | 루트의 모든 설정 파일 |

## 실전 변환 예제

### 현재 프로젝트 CLAUDE.md 변환

**현재 CLAUDE.md** (1093 lines, 주요 섹션):
- 프로젝트 개요
- 명령어
- 아키텍처 (Astro 프레임워크 특성)
- Content Collections 시스템
- Astro 페이지 작성 시 주의사항
- 블로그 포스트 작성 워크플로우
- 서브에이전트 시스템 (→ 별도 변환 필요)
- 타입 안전성
- 성능 최적화
- 디버깅
- 모범 사례
- Testing Guidelines
- Repository Etiquette
- Code Style Guidelines
- MCP Server Integration
- 트러블슈팅

### 변환 전략

**옵션 1: 단일 파일 (간단한 접근)**

`.github/copilot-instructions.md`:
```markdown
# Astro Blog Project Guidelines

[CLAUDE.md의 전체 내용 복사-붙여넣기]

(서브에이전트 시스템 섹션 제외 - 별도 에이전트 파일로 변환)
```

**장점**:
- 빠른 마이그레이션
- 관리 단순

**단점**:
- 파일이 크면 가독성 낮음
- 컨텍스트별 세분화 없음

**옵션 2: 다중 파일 (권장)**

**기본 지침** (`.github/copilot-instructions.md`):
```markdown
# Astro Blog Automation Project

## Project Overview
Astro-based blog and career management automation project.

## Technology Stack
- Framework: Astro 5.14.1
- Styling: Tailwind CSS
- Content: Content Collections (type-safe)
- Language: TypeScript (strict mode)
- Multi-language: ko, en, ja, zh

## Commands
```bash
npm run dev        # Development server (localhost:4321)
npm run build      # Production build
npm run preview    # Preview build
npm run astro check # Type check
```

## Core Principles
- TypeScript strict mode always enabled
- Test before commit
- SEO optimization mandatory
- Multi-language consistency
```

**컴포넌트 지침** (`.github/copilot-instructions/components.instructions.md`):
```markdown
---
applyTo: "src/components/**/*.astro"
---

# Component Development

## Structure
[컴포넌트 패턴]

## Tailwind CSS
[Tailwind 가이드라인]

## Image Handling
Always use Astro's `<Image>` component...
```

**블로그 포스트 지침** (`.github/copilot-instructions/blog.instructions.md`):
```markdown
---
applyTo: "src/content/blog/**/*.md"
---

# Blog Post Guidelines

## Frontmatter Schema
[스키마 설명]

## Writing Rules
[작성 규칙]

## Multi-language
[다국어 규칙]
```

**테스트 지침** (`.github/copilot-instructions/testing.instructions.md`):
```markdown
---
applyTo: "**/*.test.{ts,js}"
---

# Testing Guidelines

Before every commit:
- `npm run astro check` passes
- `npm run build` succeeds
- All tests pass
```

**장점**:
- 명확한 컨텍스트 분리
- 관련 파일 작업 시 해당 지침만 적용
- 유지보수 용이

### 변환된 파일 구조

```
.github/
├── copilot-instructions.md           # 전체 프로젝트 개요
└── copilot-instructions/
    ├── components.instructions.md    # 컴포넌트 개발
    ├── blog.instructions.md          # 블로그 포스트 작성
    ├── content-collections.instructions.md  # Content Collections
    ├── astro-pages.instructions.md   # Astro 페이지
    ├── seo.instructions.md           # SEO 최적화
    ├── testing.instructions.md       # 테스트
    ├── git.instructions.md           # Git 규칙
    └── troubleshooting.instructions.md # 트러블슈팅
```

## 세부 변환 예제

### 1. 기본 프로젝트 지침

**`.github/copilot-instructions.md`**:

```markdown
# Astro Blog Automation Project

## Project Overview
Astro-based blog and career management automation project for www.jangwook.net.

**Technology Stack**:
- Framework: Astro 5.14.1
- Styling: Tailwind CSS
- Content: Content Collections (type-safe)
- Language: TypeScript (strict mode)
- Multi-language: ko, en, ja, zh

## Commands

```bash
npm run dev        # Development server (localhost:4321)
npm run build      # Production build (./dist/)
npm run preview    # Preview build
npm run astro check # Type check + schema validation
```

## Architecture

### Astro Core Concepts
1. **Islands Architecture**: Static HTML + selective JavaScript hydration
2. **Content Collections**: Type-safe content in `src/content/` with schema validation
3. **File-based Routing**: `src/pages/` structure = URL structure

### Directory Structure
```
src/
├── assets/        # Images (Astro optimizes)
├── components/    # Reusable Astro components
├── content/       # Content Collections
│   └── blog/     # Blog posts: ko/, en/, ja/, zh/
├── layouts/       # Page layouts
├── pages/         # File-based routing
├── styles/        # Global CSS
└── content.config.ts # Content Collections schema
```

## Testing Requirements

Before every commit:
1. ✓ `npm run astro check` passes (0 errors)
2. ✓ `npm run build` succeeds
3. ✓ `npm run preview` displays correctly

## SEO Standards
- **Title**: 50-60 characters, include target keyword
- **Description**: 150-160 characters
- **Images**: Always include descriptive `alt` attributes
- **Internal Links**: 2-3 per post minimum
```

### 2. 블로그 포스트 전용 지침

**`.github/copilot-instructions/blog.instructions.md`**:

```markdown
---
applyTo: "src/content/blog/**/*.md"
---

# Blog Post Writing Guidelines

## File Structure
- Korean: `src/content/blog/ko/<slug>.md`
- English: `src/content/blog/en/<slug>.md`
- Japanese: `src/content/blog/ja/<slug>.md`
- Chinese: `src/content/blog/zh/<slug>.md`

**Multi-language Rules**:
- Same filename across all language folders
- Same `heroImage` path (shared asset)
- Images: `../../../assets/blog/<image>.jpg`

## Frontmatter Schema

**Required Fields**:
```yaml
title: "60 characters max"
description: "150-160 characters for SEO"
pubDate: 'YYYY-MM-DD'  # MUST use single quotes and this exact format
heroImage: '../../../assets/blog/hero.jpg'  # Optional but recommended
tags: ["tag1", "tag2", "tag3"]  # Optional, 3-5 recommended
```

## Markdown Formatting

**IMPORTANT**:
1. **Bold text**: Use `<strong>text</strong>` instead of `**text**`
   - ✓ Correct: `<strong>강조된 텍스트</strong>`
   - ✗ Wrong: `**강조된 텍스트**`

2. **Ranges**: Use full-width tilde `〜` instead of `~`
   - ✓ Correct: `1〜10개`, `2025년 1월〜3월`
   - ✗ Wrong: `1~10개`, `2025년 1월~3월`

## SEO Optimization
- Title: 50-60 chars, include main keyword
- Description: 150-160 chars, clear value proposition
- Headings: Proper H2-H6 hierarchy
- Images: Descriptive alt text
- Internal links: 2-3 per post

## Code Blocks
Always specify language:
```typescript
const example = "code";
```

Not:
```
const example = "code";
```
```

### 3. 컴포넌트 개발 지침

**`.github/copilot-instructions/components.instructions.md`**:

```markdown
---
applyTo: "src/components/**/*.astro"
---

# Component Development Guidelines

## Structure

All Astro components must follow this pattern:

```astro
---
// 1. Props interface
interface Props {
  title: string;
  description?: string;
}

// 2. Props destructuring with defaults
const { title, description = 'Default value' } = Astro.props;

// 3. Data fetching (if needed)
const data = await fetchData();
---

<!-- 4. Template -->
<div class="component">
  <h2>{title}</h2>
  {description && <p>{description}</p>}
</div>

<style>
  /* 5. Scoped styles (minimal - prefer Tailwind) */
</style>
```

## Tailwind CSS

**Class Order**: layout → typography → colors → effects

```astro
<div class="flex flex-col gap-4 text-lg font-bold text-gray-800 hover:text-blue-600">
```

**Responsive**: Mobile-first

```astro
<div class="w-full md:w-1/2 lg:w-1/3">
```

## Image Handling

Always use Astro's `<Image>` component:

```astro
---
import { Image } from 'astro:assets';
import heroImg from '../../assets/hero.jpg';
---
<Image src={heroImg} alt="Description" width={1020} height={510} />
```

Never use plain `<img>` tag for local images.
```

### 4. Git 커밋 규칙

**`.github/copilot-instructions/git.instructions.md`**:

```markdown
---
applyTo: "**/*"
---

# Git Commit Guidelines

## Commit Message Format

`<type>(<scope>): <subject>`

**Types**:
- feat: 새로운 기능
- fix: 버그 수정
- docs: 문서 수정
- style: 코드 포맷팅
- refactor: 리팩토링
- perf: 성능 개선
- test: 테스트 추가/수정
- chore: 빌드, 설정 변경

**Rules**:
- Subject under 60 characters
- Use imperative mood ("Add feature" not "Added feature")
- No period at the end

**Examples**:
```
feat(blog): add Astro 5.0 performance post
fix(seo): correct og:image path in BaseHead
docs(readme): update installation instructions
style(components): format with prettier
```

## Before Commit

1. ✓ `npm run astro check` passes
2. ✓ `npm run build` succeeds
3. ✓ No console.log or debugger statements
4. ✓ Meaningful commit message
```

## 검증 및 테스트

### 1. 파일 존재 확인

```bash
# 기본 파일
ls .github/copilot-instructions.md

# 추가 지침 파일
ls .github/copilot-instructions/*.instructions.md
```

### 2. Copilot CLI 테스트

```bash
copilot

# 프롬프트에서:
"What are the project guidelines for this repository?"

"What are the rules for writing blog posts?"

"Show me the component development pattern"
```

각 질문에 대해 올바른 지침을 참조하는지 확인.

### 3. 파일별 적용 확인

**컴포넌트 편집 시**:
```bash
copilot -p "Create a new BlogCard component with title and description props"
```

→ 컴포넌트 지침(`components.instructions.md`)이 적용되는지 확인

**블로그 포스트 편집 시**:
```bash
copilot -p "Create a blog post about TypeScript 5.3 features"
```

→ 블로그 지침(`blog.instructions.md`)이 적용되는지 확인

## 베스트 프랙티스

### 1. 명확한 섹션 구분

```markdown
# Main Title

## Section 1
Clear, concise guidelines

## Section 2
More guidelines

## Examples
Concrete examples
```

### 2. 코드 예제 포함

나쁜 예:
```markdown
Use TypeScript interfaces for props.
```

좋은 예:
```markdown
## Props Definition

Always define props with TypeScript interfaces:

```typescript
interface Props {
  title: string;
  description?: string;
}
```
```

### 3. Do's and Don'ts

```markdown
## Best Practices

✓ **DO**: Use Astro's `<Image>` component
✗ **DON'T**: Use plain `<img>` for local images

✓ **DO**: Write unit tests for utilities
✗ **DON'T**: Skip testing for critical logic
```

### 4. 우선순위 표시

```markdown
## Critical Rules (MUST follow)
- TypeScript strict mode
- Test before commit

## Recommendations (SHOULD follow)
- Add JSDoc comments
- Use semantic HTML

## Nice to Have (MAY follow)
- Consistent file naming
```

### 5. 파일 크기 관리

**권장 크기**:
- 메인 파일: 200-400 lines
- 개별 지침 파일: 50-150 lines

**큰 파일 분할**:
```
CLAUDE.md (1093 lines)
↓
.github/copilot-instructions.md (200 lines, 개요)
+ components.instructions.md (100 lines)
+ blog.instructions.md (150 lines)
+ seo.instructions.md (80 lines)
+ testing.instructions.md (60 lines)
+ git.instructions.md (50 lines)
```

### 6. 정기적 업데이트

```markdown
## Change Log

**2025-11-13**: Added multi-language blog post guidelines
**2025-10-20**: Updated Tailwind CSS class ordering rules
**2025-09-15**: Initial creation
```

## 트러블슈팅

### 문제 1: 지침이 적용되지 않음

**증상**:
Copilot이 프로젝트 규칙을 따르지 않음

**해결**:

**1. 파일 위치 확인**:
```bash
# 정확한 경로
ls .github/copilot-instructions.md

# 잘못된 경로 (작동 안 함)
ls copilot-instructions.md
ls .github/instructions.md
```

**2. Copilot CLI 재시작**:
```bash
# 터미널 종료 후 재시작
copilot
```

**3. 명시적 요청**:
```
"Read the project guidelines from .github/copilot-instructions.md and summarize them"
```

### 문제 2: applyTo가 작동하지 않음

**증상**:
경로별 지침이 적용되지 않음

**해결**:

**1. YAML frontmatter 문법 확인**:
```markdown
---
applyTo: "src/components/**/*.astro"
---
```

**주의**:
- `applyTo` 철자 정확히
- 큰따옴표 사용
- Glob 패턴 정확히

**2. 파일 확장자 확인**:
```bash
# 올바름
.github/copilot-instructions/components.instructions.md

# 틀림
.github/copilot-instructions/components.md
```

반드시 `.instructions.md` 확장자 사용.

### 문제 3: 여러 지침 충돌

**증상**:
전체 지침과 개별 지침이 충돌

**해결**:

**우선순위 이해**:
1. 파일별 지침 (`applyTo` 있음) - 최우선
2. 전역 지침 (`.github/copilot-instructions.md`)

**명확한 구분**:
- 전역: 프로젝트 전체 원칙
- 개별: 특정 파일 유형 규칙

## 다음 단계

프로젝트 지침 변환이 완료되었습니다. 다음 가이드를 진행하세요:

1. **[에이전트 시스템 재구성](./03-agent-system.md)** - `.claude/agents/` → `.github/agents/`
2. **[완전한 예제](./04-complete-example.md)** - 전체 마이그레이션 종합

---

**마지막 업데이트**: 2025-11-13
**이전 문서**: [01-mcp-migration.md](./01-mcp-migration.md)
**다음 문서**: [03-agent-system.md](./03-agent-system.md)
