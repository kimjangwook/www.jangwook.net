# 프로젝트 지침 변환 가이드 (CLAUDE.md → Codex CLI)

## 목차

1. [개요](#개요)
2. [Codex CLI 컨텍스트 시스템](#codex-cli-컨텍스트-시스템)
3. [변환 전략](#변환-전략)
4. [AGENTS.md 활용](#agentsmd-활용)
5. [Custom Prompts 생성](#custom-prompts-생성)
6. [실전 변환 예제](#실전-변환-예제)
7. [베스트 프랙티스](#베스트-프랙티스)

## 개요

### Claude Code의 CLAUDE.md

**위치**: 프로젝트 루트의 `CLAUDE.md` 파일

**역할**:
- 프로젝트 컨텍스트 제공 (아키텍처, 디렉토리 구조)
- 작업 가이드라인 (코딩 스타일, 베스트 프랙티스)
- 도메인 지식 (프레임워크 사용법, 워크플로우)
- 작업 규칙 (Git 커밋 메시지, 테스트 정책)

**예시** (현재 프로젝트):
```markdown
# CLAUDE.md
## 프로젝트 개요
Astro 기반의 블로그 및 커리어 관리 자동화 프로젝트...

## 아키텍처
### Astro 프레임워크 특성
1. Islands Architecture
2. Content Collections
...
```

### Codex CLI의 접근 방식

Codex CLI는 **세 가지 메커니즘**으로 프로젝트 컨텍스트를 관리:

| 메커니즘 | 목적 | 위치 | 우선순위 |
|---------|------|------|---------|
| **experimental_instructions_file** | 전역 시스템 프롬프트 | `~/.codex/config.toml` | 낮음 (기본) |
| **AGENTS.md** | 프로젝트별 가이드라인 | 프로젝트 루트 및 서브 디렉토리 | 중간 (프로젝트) |
| **Custom Prompts** | 재사용 가능한 명령 | `~/.codex/prompts/*.md` | 높음 (명시적 호출) |

**핵심 차이점**:
- Claude Code: 단일 파일 (`CLAUDE.md`)
- Codex CLI: 계층적 시스템 (전역 → 프로젝트 → 디렉토리)

## Codex CLI 컨텍스트 시스템

### 1. experimental_instructions_file (전역 시스템 프롬프트)

**용도**: 모든 프로젝트에 공통 적용되는 작업 스타일 및 규칙

**설정 방법**:

`~/.codex/config.toml`:
```toml
experimental_instructions_file = "/Users/username/.codex/GLOBAL_INSTRUCTIONS.md"
```

또는 CLI 플래그:
```bash
codex -c experimental_instructions_file="/abs/path/my_prompt.md"
```

**예제**: `~/.codex/GLOBAL_INSTRUCTIONS.md`

```markdown
# Global Coding Guidelines

## General Principles
- Always write clear, self-documenting code
- Prefer composition over inheritance
- Run tests before committing

## TypeScript Standards
- Use strict mode
- Prefer interfaces over type aliases for object shapes
- Always handle errors explicitly

## Git Commit Messages
- Format: `<type>(<scope>): <subject>`
- Types: feat, fix, docs, style, refactor, test, chore
- Keep subject under 60 characters
```

**장점**:
- 모든 프로젝트에서 일관성 유지
- 한 번 설정하면 자동 적용

**단점**:
- 프로젝트별 커스터마이징 어려움
- 변경 시 Codex 재시작 필요

### 2. AGENTS.md (프로젝트 가이드라인)

**발견 메커니즘**:

Codex는 다음 순서로 파일을 검색하고 병합:

1. `~/.codex/AGENTS.override.md` (전역 오버라이드)
2. `~/.codex/AGENTS.md` (전역 기본)
3. `/project-root/AGENTS.override.md` (프로젝트 오버라이드)
4. `/project-root/AGENTS.md` (프로젝트 기본)
5. `/project-root/subdirectory/AGENTS.md` (서브디렉토리)

**병합 규칙**:
- 루트에서 하위로 연결 (concatenation)
- 나중 파일이 이전 가이드를 오버라이드 (컨텍스트상 우선)
- **빈 파일은 무시**

**설정 옵션** (`~/.codex/config.toml`):

```toml
# 대체 파일명 (순서대로 검색)
project_doc_fallback_filenames = ["TEAM_GUIDE.md", ".agents.md"]

# 최대 바이트 제한 (기본: 32 KiB, 최대: 64 KiB)
project_doc_max_bytes = 65536
```

**예제**: `/project-root/AGENTS.md`

```markdown
## Repository Context

This is an Astro-based blog automation project.

## Architecture
- Framework: Astro 5.14.1
- Content Management: Content Collections in `src/content/`
- Routing: File-based routing in `src/pages/`

## Key Guidelines
- Blog posts must follow the schema in `src/content.config.ts`
- Always use `YYYY-MM-DD` format for `pubDate`
- Multi-language posts: same filename in `ko/`, `en/`, `ja/`, `zh/` folders

## Testing Requirements
- Run `npm run astro check` before commits
- Test build with `npm run build`
- Preview locally with `npm run preview`

## SEO Standards
- Title: 60 characters max
- Description: 150-160 characters
- Always include `alt` attributes for images
```

**네스티드 예제**: `/project-root/src/components/AGENTS.md`

```markdown
## Component Development Guidelines

- All components must be in Astro format
- Props types must be explicitly defined with TypeScript interfaces
- Use scoped styles unless global styling is necessary
- Prefer Tailwind classes over custom CSS

## Component Structure
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
  /* Minimal scoped styles only */
</style>
```
```

**장점**:
- 프로젝트별 맞춤형 가이드
- 디렉토리별 세분화 가능
- 자동 발견 (명시적 지정 불필요)

**단점**:
- 여러 파일 관리 필요
- 바이트 제한 (대형 문서는 분할 필요)

### 3. Custom Prompts (재사용 명령)

**위치**: `~/.codex/prompts/*.md`

**호출 방법**: `/prompts:<filename>`

**파일 구조**:

```markdown
---
description: Brief command description
argument-hint: [ARG1=<value>] [ARG2="<text>"]
---

Your custom prompt content here.

Use $1, $2, ..., $9 for positional arguments.
Use $ARGUMENTS for all arguments.
Use $NAMED_ARG for named parameters.
```

**예제**: `~/.codex/prompts/check-astro.md`

```markdown
---
description: Run Astro type check and build
argument-hint: [--fix]
---

You are an Astro project validator.

## Task
1. Run `npm run astro check` to check for type errors
2. If errors are found and $1 is "--fix", attempt to fix them
3. Run `npm run build` to ensure production build succeeds
4. Report results clearly

## Success Criteria
- Zero TypeScript errors
- Build completes without errors
- All Content Collections schemas valid
```

**사용 예시**:
```bash
# 타입 체크만
/prompts:check-astro

# 에러 자동 수정 시도
/prompts:check-astro --fix
```

**장점**:
- 즉시 호출 가능
- 인자 전달 지원
- 프로젝트 간 재사용 가능

**단점**:
- 파일 개수 증가
- 복잡한 워크플로우는 별도 관리 필요

## 변환 전략

### 전체 전략 개요

```
CLAUDE.md
    ↓
┌─────────────────┬──────────────────┬─────────────────┐
│                 │                  │                 │
│  전역 규칙      │  프로젝트 가이드  │  재사용 명령     │
│  (Global)       │  (Project)       │  (Commands)     │
│                 │                  │                 │
│ experimental_   │  AGENTS.md       │  Custom         │
│ instructions_   │  (프로젝트 루트)  │  Prompts        │
│ file            │                  │  (슬래시 커맨드) │
└─────────────────┴──────────────────┴─────────────────┘
```

### 섹션별 분류 가이드

CLAUDE.md의 각 섹션을 다음 기준으로 분류:

| 섹션 유형 | 이동 대상 | 이유 |
|----------|----------|------|
| **일반 코딩 스타일** | `experimental_instructions_file` | 모든 프로젝트에 공통 |
| **프로젝트 아키텍처** | `AGENTS.md` | 프로젝트 특화 지식 |
| **디렉토리 구조** | `AGENTS.md` | 프로젝트 특화 |
| **테스트 정책** | `AGENTS.md` | 프로젝트별로 다름 |
| **워크플로우 가이드** | `AGENTS.md` 또는 Custom Prompt | 재사용 여부에 따라 |
| **자주 쓰는 명령** | Custom Prompt | 빠른 호출 필요 |
| **도메인 지식** | `AGENTS.md` | 프로젝트 컨텍스트 |

### 변환 절차

#### Step 1: CLAUDE.md 분석

현재 프로젝트의 `CLAUDE.md` 구조:

```markdown
# CLAUDE.md
## 프로젝트 개요          ← AGENTS.md
## 명령어                ← AGENTS.md
## 아키텍처              ← AGENTS.md
## Astro 페이지 작성     ← AGENTS.md
## 통합 모듈            ← AGENTS.md
## 블로그 포스트 워크플로우 ← AGENTS.md + Custom Prompt
## 서브에이전트 시스템   ← Custom Prompts (별도 전환)
## 타입 안전성          ← AGENTS.md
## 성능 최적화          ← AGENTS.md
## 디버깅              ← AGENTS.md
## 모범 사례           ← 일부는 Global, 대부분 AGENTS.md
## Testing Guidelines   ← AGENTS.md
## Repository Etiquette ← Global (experimental_instructions_file)
## Environment Setup    ← AGENTS.md
## Claude Code Workflow ← Global (Codex에 맞게 수정)
## Code Style Guidelines ← Global + AGENTS.md
## MCP Server Integration ← AGENTS.md (프로젝트별 MCP)
## Advanced Topics      ← AGENTS.md
## 트러블슈팅 가이드    ← AGENTS.md
## 참고 자료           ← AGENTS.md
```

#### Step 2: Global Instructions 작성

`~/.codex/GLOBAL_INSTRUCTIONS.md`:

```markdown
# Global Development Guidelines

## General Principles
- Write clear, self-documenting code
- Prefer composition over inheritance
- Always handle errors explicitly
- Use TypeScript strict mode

## Git Commit Messages
Format: `<type>(<scope>): <subject>`

Types:
- feat: 새로운 기능
- fix: 버그 수정
- docs: 문서 수정
- style: 코드 포맷팅
- refactor: 리팩토링
- perf: 성능 개선
- test: 테스트 추가/수정
- chore: 빌드, 설정 변경

Rules:
- Subject under 60 characters
- Use imperative mood
- No period at the end

## Code Review Standards
- All PRs require clear title and description
- Include test checklist
- Document breaking changes

## Workflow Philosophy
- Explore → Plan → Code → Commit
- Use Todo tools to track tasks
- Test before committing
- One logical change per commit
```

설정 적용 (`~/.codex/config.toml`):

```toml
experimental_instructions_file = "/Users/username/.codex/GLOBAL_INSTRUCTIONS.md"
```

#### Step 3: AGENTS.md 작성

`/project-root/AGENTS.md`:

```markdown
# Astro Blog Automation Project

## Project Overview
Astro-based blog and career management automation project. Comprehensive developer blog system including technical blog management, SEO optimization, content management, and portfolio curation.

## Technology Stack
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
npm run astro check # Type check
```

## Architecture

### Astro Core Concepts
1. **Islands Architecture**: Static HTML by default, JavaScript for interactive parts
2. **Content Collections**: Type-safe content in `src/content/`
3. **File-based Routing**: `src/pages/` structure defines URLs

### Directory Structure
```
src/
├── assets/        # Static assets (Astro optimizes)
├── components/    # Reusable Astro components
├── content/       # Content Collections
│   └── blog/     # Blog posts (ko/, en/, ja/, zh/)
├── layouts/       # Page layout templates
├── pages/         # File-based routing
├── styles/        # Global CSS
└── content.config.ts # Content Collections schema
```

## Content Collections Schema

**File**: `src/content.config.ts`

Blog posts must follow this schema:
```typescript
{
  title: string              // Required
  description: string        // Required (150-160 chars for SEO)
  pubDate: Date             // Required (YYYY-MM-DD format)
  updatedDate?: Date        // Optional
  heroImage?: ImageMetadata // Optional (1020x510 recommended)
  tags?: string[]           // Optional (3-5 tags recommended)
}
```

## Blog Post Guidelines

### File Locations
- Korean: `src/content/blog/ko/post-name.md`
- English: `src/content/blog/en/post-name.md`
- Japanese: `src/content/blog/ja/post-name.md`
- Chinese: `src/content/blog/zh/post-name.md`

**Rules**:
- Same filename across all language folders
- `pubDate` format: `'YYYY-MM-DD'` (single quotes)
- Images in `src/assets/blog/` (relative path `../../../assets/blog/image.jpg`)
- Share same `heroImage` across all language versions

### Markdown Formatting
1. **Bold text**: Use `<strong>text</strong>` instead of `**text**`
2. **Ranges**: Use full-width tilde `〜` instead of `~`
   - ✓ Correct: `1〜10개`, `2025년 1월〜3월`
   - ✗ Wrong: `1~10개`, `2025년 1월~3월`

## Testing Requirements
Before every commit:
1. ✓ `npm run astro check` passes
2. ✓ `npm run build` succeeds
3. ✓ `npm run preview` shows correct output
4. ✓ Content Collections schema compliant
5. ✓ Images load correctly
6. ✓ Multi-language consistency
7. ✓ SEO metadata complete

## SEO Standards
- Title: 60 characters max
- Description: 150-160 characters
- Images: Always include `alt` attributes
- Internal links: Use relative paths
- Sitemap: Auto-generated on build

## Astro Best Practices

### Image Handling
Always use Astro's `<Image>` component:
```astro
---
import { Image } from 'astro:assets';
import myImage from '../assets/image.jpg';
---
<Image src={myImage} alt="Description" width={600} height={400} />
```

### Component Props
```astro
---
interface Props {
  title: string;
  description?: string;
}
const { title, description = 'Default' } = Astro.props;
---
```

### Dynamic Routes
```astro
---
export async function getStaticPaths() {
  const posts = await getCollection('blog');
  return posts.map((post) => ({
    params: { slug: post.id },
    props: post,
  }));
}
---
```

## Troubleshooting

### Content Collections Schema Error
Check:
- All required fields present (title, description, pubDate)
- Date format: `'YYYY-MM-DD'`
- Image paths: `../../../assets/blog/image.jpg`

### Build Failures
- Missing `getStaticPaths()` in dynamic routes
- Type mismatches (run `astro check`)
- Invalid frontmatter

### Slow Builds
Normal when processing many images (Astro optimizes all).

## MCP Servers (Project-Specific)
This project uses the following MCP servers:
- context7: Latest library documentation
- sequentialthinking: Complex problem analysis
- playwright: Browser automation
- notionApi: Notion integration
- chrome-devtools: Performance analysis
- analytics-mcp: Google Analytics
- brave-search: Web research
- browsermcp: Browser control

Refer to `.mcp.json` or `~/.codex/config.toml` for configuration.
```

#### Step 4: 서브디렉토리별 AGENTS.md (선택)

`/project-root/src/components/AGENTS.md`:

```markdown
## Component Development

### Structure
All components must follow this pattern:
```astro
---
// 1. Props interface
interface Props {
  title: string;
  optional?: string;
}

// 2. Props destructuring with defaults
const { title, optional = 'default' } = Astro.props;

// 3. Data fetching (if needed)
const data = await fetchData();
---

<!-- 4. Template -->
<div class="component">
  {/* content */}
</div>

<style>
  /* 5. Scoped styles only */
</style>
```

### Tailwind CSS Classes
Order: layout → typography → colors → effects
```astro
<div class="flex flex-col gap-4 text-lg font-bold text-gray-800 hover:text-blue-600">
```

### Responsive Design
Mobile-first approach:
```astro
<div class="w-full md:w-1/2 lg:w-1/3">
```
```

## AGENTS.md 활용

### 파일 배치 전략

#### 1. 단일 파일 접근 (Simple Projects)

**구조**:
```
프로젝트/
└── AGENTS.md  # 모든 가이드라인
```

**장점**:
- 관리 간단
- 단일 진실 공급원

**단점**:
- 큰 프로젝트에서 파일이 비대해짐

#### 2. 계층적 접근 (Large Projects)

**구조**:
```
프로젝트/
├── AGENTS.md                    # 루트 레벨 (프로젝트 전체)
├── src/
│   ├── components/
│   │   └── AGENTS.md           # 컴포넌트 가이드
│   ├── pages/
│   │   └── AGENTS.md           # 페이지 가이드
│   └── content/
│       └── blog/
│           └── AGENTS.md       # 블로그 작성 가이드
└── scripts/
    └── AGENTS.md               # 스크립트 가이드
```

**병합 순서** (src/components/에서 작업 시):
1. `/AGENTS.md` (프로젝트 전체)
2. `/src/AGENTS.md` (src 폴더, 있다면)
3. `/src/components/AGENTS.md` (컴포넌트)

**장점**:
- 컨텍스트 분리
- 작은 파일로 관리 용이
- 바이트 제한 회피

**단점**:
- 파일 수 증가
- 중복 내용 관리 필요

### 바이트 제한 관리

**기본 제한**: 32 KiB (32,768 bytes)
**최대 제한**: 64 KiB (65,536 bytes)

**제한 확장**:

`~/.codex/config.toml`:
```toml
project_doc_max_bytes = 65536  # 64 KiB
```

**제한 초과 시**:
1. **파일 분할**: 디렉토리별로 나누기
2. **중복 제거**: 공통 내용은 상위 파일로
3. **핵심만 유지**: 덜 중요한 내용 제거
4. **외부 링크**: 상세 문서는 링크로 대체

### 검증 및 디버깅

#### 현재 로드된 지침 확인

```bash
codex --ask-for-approval never "Summarize the current instructions."
```

출력 예시:
```
I have the following instructions loaded:

1. Global guidelines (from ~/.codex/GLOBAL_INSTRUCTIONS.md)
2. Project overview (from /project/AGENTS.md)
3. Component development rules (from /project/src/components/AGENTS.md)

Total: ~45 KiB
```

#### 문제 해결

**문제**: 지침이 적용되지 않음
- **원인**: 파일 발견 실패
- **해결**: `ls -la AGENTS.md` (파일 존재 확인), 파일명 철자 확인

**문제**: 오래된 지침이 적용됨
- **원인**: Codex가 캐시 사용
- **해결**: Codex 재시작 또는 새 세션 시작

**문제**: 일부 지침만 적용됨
- **원인**: 바이트 제한 초과
- **해결**: `project_doc_max_bytes` 증가 또는 파일 분할

**문제**: 디렉토리별 지침이 무시됨
- **원인**: 상위 디렉토리에 `AGENTS.override.md` 존재
- **해결**: override 파일 제거 또는 이름 변경

## Custom Prompts 생성

### 기본 구조

**파일 위치**: `~/.codex/prompts/<command-name>.md`

**기본 템플릿**:

```markdown
---
description: Short description (shown in slash menu)
argument-hint: [ARG1=<value>] [ARG2="<text>"]
---

Your detailed prompt content here.

## Instructions
1. Step one
2. Step two
3. Step three

## Variables
- $1, $2, ..., $9: Positional arguments
- $ARGUMENTS: All arguments as string
- $NAMED_ARG: Named argument (use ARG=value)
```

### 변환 예제

#### 예제 1: 블로그 포스트 작성 명령

**Claude Code** (`.claude/commands/write-post.md`):
```markdown
You are a technical blog post writing assistant.

## Your Role
Write high-quality, SEO-optimized blog posts for a developer blog.

## Task
Create a new blog post with the following:
- Topic: {{topic}}
- Language: {{language}}
- Target audience: Developers

## Process
1. Research the topic
2. Create outline
3. Write content
4. Generate hero image
5. Optimize for SEO
```

**Codex CLI** (`~/.codex/prompts/write-post.md`):
```markdown
---
description: Write a technical blog post
argument-hint: TOPIC="<topic>" LANG=<ko|en|ja|zh>
---

You are a technical blog post writing assistant for an Astro blog.

## Task
Create a new blog post about: $TOPIC
Language: $LANG

## Process
1. **Research**: Use web search to gather latest information
2. **Outline**: Create structured outline (Introduction, Main Points, Conclusion)
3. **Content**: Write engaging, developer-focused content
4. **Frontmatter**: Generate proper frontmatter
   ```yaml
   title: "60 chars max"
   description: "150-160 chars for SEO"
   pubDate: 'YYYY-MM-DD'
   heroImage: '../../../assets/blog/hero.jpg'
   tags: ["tag1", "tag2", "tag3"]
   ```
5. **File Location**: Save to `src/content/blog/$LANG/<slug>.md`
6. **SEO**: Optimize title, description, headings
7. **Validation**: Run `npm run astro check`

## Style Guidelines
- Use `<strong>text</strong>` for bold (not `**text**`)
- Use `〜` for ranges (not `~`)
- Include code examples with syntax highlighting
- Add internal links to related posts

## Success Criteria
- All required frontmatter fields present
- `pubDate` in correct format
- File saved in correct language folder
- Astro check passes
```

**사용**:
```bash
/prompts:write-post TOPIC="Astro 5.0 New Features" LANG=ko
```

#### 예제 2: 포스트 분석 명령

**Claude Code** (`.claude/commands/analyze-posts.md`):
```markdown
Analyze all blog posts and generate metadata.

Steps:
1. Read all posts in src/content/blog/
2. Extract topics, tags, categories
3. Generate recommendations.json
```

**Codex CLI** (`~/.codex/prompts/analyze-posts.md`):
```markdown
---
description: Analyze blog posts and generate metadata
argument-hint: [--update-recommendations]
---

Analyze all blog posts in the Content Collection.

## Steps
1. **Read Posts**: Use `getCollection('blog')` logic to read all posts
2. **Extract Metadata**:
   - Topics and themes
   - Tag frequency
   - Category distribution
   - Publish date patterns
3. **Generate Insights**:
   - Most common topics
   - Tag correlations
   - Content gaps
4. **Optional**: If $1 is "--update-recommendations", generate semantic recommendations

## Output Format
```json
{
  "total_posts": 120,
  "languages": {"ko": 80, "en": 20, "ja": 15, "zh": 5},
  "top_tags": [
    {"tag": "typescript", "count": 45},
    {"tag": "astro", "count": 32}
  ],
  "recommendations": {
    "underrepresented_topics": ["..."],
    "suggested_connections": ["..."]
  }
}
```

## Success Criteria
- All posts read successfully
- Valid JSON output
- Actionable insights provided
```

**사용**:
```bash
/prompts:analyze-posts
/prompts:analyze-posts --update-recommendations
```

#### 예제 3: Astro 검증 명령

**Codex CLI** (`~/.codex/prompts/check-astro.md`):
```markdown
---
description: Run Astro type check and build validation
argument-hint: [--fix]
---

Validate Astro project integrity.

## Tasks
1. **Type Check**
   ```bash
   npm run astro check
   ```
   - Report any TypeScript errors
   - If $1 is "--fix", attempt to fix automatically

2. **Build Test**
   ```bash
   npm run build
   ```
   - Ensure production build succeeds
   - Check for build warnings

3. **Content Collections Validation**
   - Verify all blog posts have required frontmatter
   - Check `pubDate` format (must be 'YYYY-MM-DD')
   - Validate image paths exist

4. **Report**
   - List all errors found
   - Provide fix suggestions
   - Indicate if manual intervention needed

## Auto-Fix Capabilities (when --fix flag used)
- Add missing frontmatter fields
- Correct date formats
- Fix image path typos (if unambiguous)

## Success Criteria
- Zero TypeScript errors
- Build completes without errors
- All Content Collections valid
```

### 인자 전달 패턴

#### 1. Positional Arguments ($1-$9)

```markdown
---
description: Create a new component
---

Create an Astro component named $1 with props: $2
```

사용:
```bash
/prompts:create-component BlogCard "title: string, description?: string"
```

#### 2. Named Arguments

```markdown
---
description: Deploy to environment
---

Deploy to environment: $ENV
Branch: $BRANCH
Version: $VERSION
```

사용:
```bash
/prompts:deploy ENV=production BRANCH=main VERSION=v2.1.0
```

#### 3. All Arguments ($ARGUMENTS)

```markdown
---
description: Run custom npm script
---

Run npm script with args: $ARGUMENTS
```

사용:
```bash
/prompts:npm-run build --mode production --verbose
```

### 복잡한 워크플로우 처리

**문제**: Claude Code의 복잡한 명령 (1000+ lines)

**해결책**: 하이브리드 접근

1. **Custom Prompt**: 간단한 시작 명령
2. **AGENTS.md**: 상세 워크플로우 문서화
3. **Checklist**: 단계별 작업 목록

**예제**: `~/.codex/prompts/write-series.md` (시리즈 포스트 작성)

```markdown
---
description: Write a blog post series
argument-hint: SERIES="<series-name>" TOPICS="<topic1,topic2,...>"
---

Create a multi-part blog post series.

## Series: $SERIES
## Topics: $TOPICS

Refer to `AGENTS.md` section "Blog Series Workflow" for detailed process.

## Quick Checklist
- [ ] Create series outline
- [ ] Generate individual post structures
- [ ] Write posts with cross-references
- [ ] Create series landing page
- [ ] Update navigation
- [ ] Generate SEO metadata for series

Use `/prompts:write-post` for each individual post in the series.
```

## 실전 변환 예제

### 현재 프로젝트 (www.jangwook.net) 완전 변환

#### Before (Claude Code)

**파일 구조**:
```
프로젝트/
├── CLAUDE.md (1093 lines)
├── .claude/
│   ├── agents/ (17 files)
│   │   ├── writing-assistant.md
│   │   ├── seo-optimizer.md
│   │   ├── content-planner.md
│   │   └── ...
│   └── commands/ (7 files)
│       ├── write-post.md
│       ├── analyze-posts.md
│       └── ...
└── .mcp.json (8 MCP servers)
```

#### After (Codex CLI)

**파일 구조**:
```
~/.codex/
├── config.toml (MCP + 전역 설정)
├── GLOBAL_INSTRUCTIONS.md (공통 규칙)
└── prompts/
    ├── write-post.md
    ├── analyze-posts.md
    ├── check-astro.md
    ├── seo-optimize.md
    └── generate-recs.md

프로젝트/
├── AGENTS.md (프로젝트 가이드)
└── src/
    ├── components/
    │   └── AGENTS.md (컴포넌트 가이드)
    └── content/
        └── blog/
            └── AGENTS.md (블로그 작성 가이드)
```

#### 변환 맵핑

| Claude Code | Codex CLI | 비고 |
|-------------|-----------|------|
| `CLAUDE.md` 섹션 "Repository Etiquette" | `~/.codex/GLOBAL_INSTRUCTIONS.md` | 전역 Git 규칙 |
| `CLAUDE.md` 섹션 "프로젝트 개요" | `/AGENTS.md` | 프로젝트 컨텍스트 |
| `CLAUDE.md` 섹션 "Astro 아키텍처" | `/AGENTS.md` | 기술 스택 |
| `CLAUDE.md` 섹션 "Component Guidelines" | `/src/components/AGENTS.md` | 디렉토리별 가이드 |
| `.claude/commands/write-post.md` | `~/.codex/prompts/write-post.md` | 커스텀 명령 |
| `.claude/commands/analyze-posts.md` | `~/.codex/prompts/analyze-posts.md` | 커스텀 명령 |
| `.claude/agents/writing-assistant.md` | `~/.codex/prompts/write-assist.md` | 역할 → 명령 |
| `.claude/agents/seo-optimizer.md` | `~/.codex/prompts/seo-check.md` + `/AGENTS.md` SEO 섹션 | 분할 |

#### 파일별 상세 변환

**1. Global Instructions**

`~/.codex/GLOBAL_INSTRUCTIONS.md`:
```markdown
# Development Standards

## Git Commit Format
`<type>(<scope>): <subject>`

Types: feat, fix, docs, style, refactor, perf, test, chore

## Code Review Checklist
- [ ] Clear PR title and description
- [ ] Tests pass
- [ ] Documentation updated
- [ ] No console.log/debugger statements

## General Coding Principles
- TypeScript strict mode always
- Error handling explicit
- Clear variable names (no abbreviations)
- One logical change per commit
```

**2. 프로젝트 AGENTS.md**

`/AGENTS.md` (약 300-400 lines):
```markdown
# Astro Blog Automation Project

[위에서 작성한 전체 예제 참조]

## Project-Specific MCP Servers
- context7: Latest library docs
- brave-search: Web research
- playwright: Browser automation
- notionApi: Notion integration
- analytics-mcp: Google Analytics

See `~/.codex/config.toml` [mcp_servers.*] sections.
```

**3. 디렉토리별 AGENTS.md**

`/src/components/AGENTS.md`:
```markdown
## Component Development

[컴포넌트 가이드라인]
```

`/src/content/blog/AGENTS.md`:
```markdown
## Blog Post Writing

### Frontmatter Requirements
[스키마 상세]

### Multi-language Guidelines
[언어별 규칙]

### SEO Optimization
[SEO 체크리스트]
```

**4. Custom Prompts**

`~/.codex/prompts/write-post.md`:
```markdown
---
description: Write a technical blog post
argument-hint: TOPIC="<topic>" LANG=<ko|en|ja|zh>
---

[위에서 작성한 예제 참조]
```

`~/.codex/prompts/seo-check.md`:
```markdown
---
description: Perform SEO audit on blog posts
argument-hint: [POST=<slug>]
---

Audit SEO for blog post: $POST (or all if not specified)

## Checks
1. **Title**: 60 characters max
2. **Description**: 150-160 characters
3. **Headings**: Proper hierarchy (H1 → H2 → H3)
4. **Images**: All have `alt` attributes
5. **Internal Links**: At least 2-3 per post
6. **Meta Tags**: Open Graph, Twitter Card complete
7. **URL**: SEO-friendly (kebab-case, no special chars)

## Output
- SEO score (0-100)
- List of issues with fixes
- Suggested improvements
```

## 베스트 프랙티스

### 1. 파일 크기 관리

**권장 크기**:
- `GLOBAL_INSTRUCTIONS.md`: 5-10 KiB
- 루트 `AGENTS.md`: 30-40 KiB
- 디렉토리별 `AGENTS.md`: 10-20 KiB
- Custom Prompts: 1-5 KiB 각

**총합 목표**: 60 KiB 이하 (여유 공간 확보)

### 2. 내용 중복 최소화

**나쁜 예**:
```
# /AGENTS.md
## Astro Image Optimization
Use <Image> component...

# /src/components/AGENTS.md
## Astro Image Optimization  # ← 중복!
Use <Image> component...
```

**좋은 예**:
```
# /AGENTS.md
## Astro Image Optimization
Use <Image> component for all images. See component-specific guide.

# /src/components/AGENTS.md
## Image Component Usage
Extends global Astro image rules with:
- Component-specific sizing
- Lazy loading strategies
- Placeholder handling
```

### 3. 명확한 계층 구조

```
Global (모든 프로젝트 공통)
  ↓
Project Root (이 프로젝트 전체)
  ↓
Directory (특정 영역)
  ↓
Custom Prompt (명시적 호출)
```

### 4. 정기적 검증

**월간 체크리스트**:
- [ ] `codex "Summarize current instructions"`로 로드 확인
- [ ] 바이트 사용량 체크 (60 KiB 미만 유지)
- [ ] 불필요한 내용 정리
- [ ] 새로운 워크플로우 반영
- [ ] Custom Prompts 테스트

### 5. 버전 관리

**AGENTS.md를 Git에 커밋**:
```bash
git add AGENTS.md src/*/AGENTS.md
git commit -m "docs: update AGENTS.md with new workflow"
```

**GLOBAL_INSTRUCTIONS는 개인 설정**:
- Git에 커밋하지 않음 (선택사항)
- 팀 공유 시 샘플 제공: `GLOBAL_INSTRUCTIONS.example.md`

### 6. 팀 협업 전략

**팀에서 사용 시**:

1. **공통 AGENTS.md**: 프로젝트 저장소에 커밋
2. **개인 GLOBAL_INSTRUCTIONS**: 각자 관리
3. **샘플 제공**: `.codex.example/` 폴더에 템플릿
4. **문서화**: README에 Codex CLI 설정 가이드 추가

**예제 README 섹션**:
```markdown
## Codex CLI Setup

1. Install Codex CLI
2. Copy example config:
   ```bash
   mkdir -p ~/.codex
   cp .codex.example/config.toml ~/.codex/config.toml
   cp .codex.example/GLOBAL_INSTRUCTIONS.md ~/.codex/
   ```
3. Edit `~/.codex/config.toml` with your API keys
4. The project's `AGENTS.md` will be automatically loaded
```

## 마이그레이션 체크리스트

### Phase 1: 준비 (30분)

- [ ] Codex CLI 설치 및 설정
- [ ] 현재 `CLAUDE.md` 백업
- [ ] 섹션별 분류 (Global vs Project vs Commands)
- [ ] 파일 구조 계획

### Phase 2: 전역 설정 (1시간)

- [ ] `~/.codex/GLOBAL_INSTRUCTIONS.md` 작성
- [ ] `~/.codex/config.toml`에 `experimental_instructions_file` 설정
- [ ] 테스트: `codex "Summarize global instructions"`

### Phase 3: 프로젝트 AGENTS.md (2-3시간)

- [ ] `/AGENTS.md` 작성 (프로젝트 컨텍스트)
- [ ] 디렉토리별 `AGENTS.md` 작성 (필요 시)
- [ ] 바이트 사용량 확인 (`wc -c AGENTS.md`)
- [ ] 테스트: `codex "Summarize project instructions"`

### Phase 4: Custom Prompts (2-3시간)

- [ ] `~/.codex/prompts/` 디렉토리 생성
- [ ] 각 `.claude/commands/*.md`를 Custom Prompt로 변환
- [ ] 자주 쓰는 에이전트를 Custom Prompt로 변환
- [ ] 인자 전달 테스트

### Phase 5: 검증 (1시간)

- [ ] 모든 Custom Prompts 호출 테스트
- [ ] 샘플 작업으로 워크플로우 검증
- [ ] 팀원에게 피드백 요청 (팀 프로젝트인 경우)
- [ ] 문서화 (README 업데이트)

### Total: 약 6-8시간

## 다음 단계

이제 프로젝트 지침 변환이 완료되었습니다. 다음 가이드를 참조하세요:

1. **[Agent System Migration](./03-agent-system.md)**: `.claude/agents/` 재구성
2. **[Automation Guide](./04-automation.md)**: TypeScript SDK 활용
3. **[Complete Example](./05-complete-example.md)**: 전체 마이그레이션 예제

---

**마지막 업데이트**: 2025-11-13
**다음 문서**: [03-agent-system.md](./03-agent-system.md)
