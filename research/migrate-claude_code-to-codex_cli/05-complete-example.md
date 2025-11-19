# 완전한 마이그레이션 예제

## 목차

1. [프로젝트 개요](#프로젝트-개요)
2. [마이그레이션 로드맵](#마이그레이션-로드맵)
3. [Step-by-Step 가이드](#step-by-step-가이드)
4. [Before/After 비교](#beforeafter-비교)
5. [검증 및 테스트](#검증-및-테스트)
6. [트러블슈팅](#트러블슈팅)

## 프로젝트 개요

### 현재 프로젝트: jangwook.net

**기술 스택**:
- Framework: Astro 5.14.1
- Content: Content Collections (타입 안전)
- Styling: Tailwind CSS
- Language: TypeScript (strict mode)
- Multi-language: ko, en, ja, zh

**Claude Code 설정** (현재):
```
프로젝트/
├── .mcp.json (8 MCP servers)
├── CLAUDE.md (1093 lines)
├── .claude/
│   ├── agents/ (17 files)
│   │   ├── writing-assistant.md
│   │   ├── seo-optimizer.md
│   │   ├── content-planner.md
│   │   └── ... (14 more)
│   └── commands/ (7 files)
│       ├── write-post.md
│       ├── analyze-posts.md
│       ├── generate-recommendations.md
│       └── ... (4 more)
```

**MCP Servers** (8개):
1. context7 - 최신 라이브러리 문서
2. sequentialthinking - 복잡한 문제 분석
3. playwright - 브라우저 자동화
4. notionApi - Notion 통합
5. chrome-devtools - 성능 분석
6. analytics-mcp - Google Analytics
7. brave-search - 웹 리서치
8. browsermcp - 브라우저 제어

**Agents** (17개):
- Content: writing-assistant, editor, content-planner, content-recommender, image-generator
- Research: web-researcher, post-analyzer, analytics, analytics-reporter
- SEO/Marketing: seo-optimizer, backlink-manager, social-media-manager
- Operations: site-manager, portfolio-curator, learning-tracker, improvement-tracker, prompt-engineer

**Commands** (7개):
- write-post, analyze-posts, generate-recommendations, seo-audit, translate-post, deploy, backup

## 마이그레이션 로드맵

### Phase 1: 기본 설정 (4-6시간)

**작업**:
1. ✅ Codex CLI 설치 및 설정
2. ✅ MCP 서버 마이그레이션 (`.mcp.json` → `~/.codex/config.toml`)
3. ✅ 프로젝트 지침 변환 (`CLAUDE.md` → `AGENTS.md` + `GLOBAL_INSTRUCTIONS.md`)

**결과**:
- Codex CLI 사용 가능
- 모든 MCP 서버 작동
- 프로젝트 컨텍스트 로드됨

### Phase 2: 에이전트 및 명령 (6-8시간)

**작업**:
4. ✅ 에이전트 재구성 (Custom Prompts + AGENTS.md 역할)
5. ✅ 슬래시 커맨드 통합 (Custom Prompts)

**결과**:
- 모든 에이전트 기능 유지
- 슬래시 커맨드로 빠른 호출

### Phase 3: 자동화 (선택, 8-12시간)

**작업**:
6. ⚠️ TypeScript SDK 통합
7. ⚠️ GitHub Actions 설정
8. ⚠️ 자동화 워크플로우 구축

**결과**:
- CI/CD 자동화
- 스케줄 작업 (SEO audit 등)
- 자동 수정 파이프라인

### 총 예상 시간: 18-26시간

## Step-by-Step 가이드

### Step 1: Codex CLI 설치 (15분)

```bash
# Codex CLI 설치 (Homebrew - macOS/Linux)
brew install openai/tap/codex

# 또는 npm (전역)
npm install -g @openai/codex-cli

# 버전 확인
codex --version
```

**로그인**:
```bash
# OpenAI API key로 로그인
codex login

# 또는 환경 변수 설정
export OPENAI_API_KEY="sk-..."
```

**테스트**:
```bash
codex "Echo 'Hello from Codex CLI'"
```

### Step 2: MCP 서버 마이그레이션 (1-2시간)

#### 2.1. 현재 `.mcp.json` 읽기

```bash
cat .mcp.json
```

```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp"]
    },
    "sequentialthinking": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sequential-thinking"]
    },
    "playwright": {
      "command": "npx",
      "args": ["-y", "playwright-mcp"]
    },
    "notionApi": {
      "command": "node",
      "args": ["node_modules/@notion-mcp-server/dist/index.js"],
      "env": {
        "NOTION_API_KEY": "${NOTION_API_KEY}"
      }
    },
    "chrome-devtools": {
      "command": "npx",
      "args": ["-y", "chrome-devtools-mcp"]
    },
    "analytics-mcp": {
      "command": "npx",
      "args": ["-y", "analytics-mcp"]
    },
    "brave-search": {
      "command": "npx",
      "args": ["-y", "@upstash/brave-mcp"],
      "env": {
        "BRAVE_API_KEY": "${BRAVE_API_KEY}"
      }
    },
    "browsermcp": {
      "command": "npx",
      "args": ["-y", "browser-mcp"]
    }
  }
}
```

#### 2.2. `~/.codex/config.toml` 작성

```bash
mkdir -p ~/.codex
```

`~/.codex/config.toml`:
```toml
# Model selection
model = "gpt-5"  # 또는 "o3", "o4-mini"

# Approval policy
approval_policy = "on-request"  # 또는 "never" for full auto

# Sandbox mode
sandbox_mode = "workspace-write"  # 또는 "read-only", "danger-full-access"

# MCP Servers
[mcp_servers.context7]
command = "npx"
args = ["-y", "@upstash/context7-mcp"]

[mcp_servers.sequentialthinking]
command = "npx"
args = ["-y", "@modelcontextprotocol/server-sequential-thinking"]

[mcp_servers.playwright]
command = "npx"
args = ["-y", "playwright-mcp"]

[mcp_servers.notionApi]
command = "node"
args = ["node_modules/@notion-mcp-server/dist/index.js"]

  [mcp_servers.notionApi.env]
  NOTION_API_KEY = "$NOTION_API_KEY"  # 환경 변수에서 읽기

[mcp_servers.chrome-devtools]
command = "npx"
args = ["-y", "chrome-devtools-mcp"]

[mcp_servers.analytics-mcp]
command = "npx"
args = ["-y", "analytics-mcp"]

[mcp_servers.brave-search]
command = "npx"
args = ["-y", "@upstash/brave-mcp"]

  [mcp_servers.brave-search.env]
  BRAVE_API_KEY = "$BRAVE_API_KEY"

[mcp_servers.browsermcp]
command = "npx"
args = ["-y", "browser-mcp"]

# Project documentation settings
project_doc_fallback_filenames = ["AGENTS.md", "TEAM_GUIDE.md"]
project_doc_max_bytes = 65536  # 64 KiB

# Global instructions
experimental_instructions_file = "/Users/username/.codex/GLOBAL_INSTRUCTIONS.md"
```

**환경 변수 설정** (`~/.zshrc` 또는 `~/.bashrc`):
```bash
export NOTION_API_KEY="secret_..."
export BRAVE_API_KEY="BSA..."
export GEMINI_API_KEY="AIza..."  # for image generation
```

#### 2.3. 검증

```bash
# Codex 시작 및 MCP 서버 확인
codex

# MCP 서버가 로드되는지 확인
# Codex CLI 내에서:
"List available MCP servers"
```

### Step 3: 전역 지침 작성 (30분)

`~/.codex/GLOBAL_INSTRUCTIONS.md`:
```markdown
# Global Development Guidelines

## Git Commit Format
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

**Example**:
```
feat(blog): add Astro 5.0 performance post
fix(seo): correct og:image path in BaseHead
docs(readme): update installation instructions
```

## Code Review Standards

**Pull Request Checklist**:
- [ ] Clear title and description
- [ ] All tests pass
- [ ] Documentation updated
- [ ] No console.log or debugger statements
- [ ] Type check passes (`npm run astro check`)
- [ ] Build succeeds (`npm run build`)

**Review Focus**:
1. Correctness and functionality
2. Code quality and maintainability
3. Performance implications
4. Security considerations
5. Accessibility (WCAG compliance)

## General Coding Principles

1. **TypeScript Strict Mode**: Always enabled
2. **Error Handling**: Explicit, never silent
3. **Variable Names**: Clear and descriptive (no abbreviations)
4. **Single Responsibility**: One logical change per commit
5. **Comments**: Explain "why", not "what"
6. **Testing**: Write tests for new features

## Workflow

1. **Explore**: Read relevant files before coding
2. **Plan**: Outline changes and approach
3. **Code**: Implement incrementally
4. **Commit**: Commit early and often
5. **Review**: Self-review before requesting PR review
```

**설정 적용** (이미 `config.toml`에 포함):
```toml
experimental_instructions_file = "/Users/username/.codex/GLOBAL_INSTRUCTIONS.md"
```

### Step 4: 프로젝트 AGENTS.md 작성 (2-3시간)

`/project-root/AGENTS.md`:
```markdown
# Astro Blog Automation Project

## Project Overview
Astro-based blog and career management automation project for jangwook.net.

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

public/            # Static files (copied as-is)
```

## Content Collections Schema

**Location**: `src/content.config.ts`

**Blog Post Schema**:
```typescript
{
  title: string              // Required (60 chars max for SEO)
  description: string        // Required (150-160 chars for SEO)
  pubDate: Date             // Required ('YYYY-MM-DD' format in frontmatter)
  updatedDate?: Date        // Optional
  heroImage?: ImageMetadata // Optional (1020x510 recommended)
  tags?: string[]           // Optional (3-5 recommended)
  relatedPosts?: Array<{    // Optional (generated by recommendations system)
    slug: string
    score: number
    reason: { ko, en, ja }
  }>
}
```

## Blog Post Guidelines

### File Structure
- Korean: `src/content/blog/ko/<slug>.md`
- English: `src/content/blog/en/<slug>.md`
- Japanese: `src/content/blog/ja/<slug>.md`
- Chinese: `src/content/blog/zh/<slug>.md`

**Multi-language Rules**:
- Same filename across all language folders
- Same `heroImage` path (shared asset)
- `pubDate` format: `'YYYY-MM-DD'` (single quotes in frontmatter)
- Images: `../../../assets/blog/<image>.jpg` (relative path from blog file)

### Markdown Formatting
**Important**:
1. **Bold text**: Use `<strong>text</strong>` instead of `**text**`
2. **Ranges**: Use full-width tilde `〜` instead of `~`
   - ✓ Correct: `1〜10개`, `2025년 1월〜3월`
   - ✗ Wrong: `1~10개`, `2025년 1월~3월`

### SEO Standards
- **Title**: 50-60 characters, include target keyword
- **Description**: 150-160 characters, clear value proposition
- **Images**: Always include descriptive `alt` attributes
- **Internal Links**: 2-3 per post minimum
- **URL**: SEO-friendly slug (kebab-case, no special chars)

## Testing Requirements

Before every commit:
1. ✓ `npm run astro check` passes (0 errors)
2. ✓ `npm run build` succeeds
3. ✓ `npm run preview` displays correctly
4. ✓ Content Collections schema compliant
5. ✓ All image paths valid
6. ✓ Multi-language consistency
7. ✓ SEO metadata complete

## Astro Best Practices

### Image Handling
Always use Astro's `<Image>` component for automatic optimization:
```astro
---
import { Image } from 'astro:assets';
import heroImg from '../../../assets/blog/hero.jpg';
---
<Image src={heroImg} alt="Description" width={1020} height={510} />
```

### Component Props
Define clear TypeScript interfaces:
```astro
---
interface Props {
  title: string;
  description?: string;
  tags?: string[];
}
const { title, description = 'Default', tags = [] } = Astro.props;
---
```

### Dynamic Routes
Require `getStaticPaths()`:
```astro
---
export async function getStaticPaths() {
  const posts = await getCollection('blog');
  return posts.map(post => ({
    params: { slug: post.id },
    props: post,
  }));
}
const post = Astro.props;
---
```

## MCP Servers (Project-Specific)

This project uses the following MCP servers (configured in `~/.codex/config.toml`):

- **context7**: Latest library documentation (Astro, TypeScript, etc.)
- **sequentialthinking**: Complex problem analysis and planning
- **playwright**: Browser automation, screenshot generation
- **notionApi**: Notion database integration (ideas, portfolio)
- **chrome-devtools**: Performance analysis, Core Web Vitals
- **analytics-mcp**: Google Analytics traffic data
- **brave-search**: Web research, fact-checking, trend analysis
- **browsermcp**: Browser control and testing

## Troubleshooting

### Content Collections Schema Error
**Symptom**: `Invalid frontmatter` error

**Fixes**:
- Check all required fields present (title, description, pubDate)
- Verify date format: `'YYYY-MM-DD'` with single quotes
- Validate image path: `../../../assets/blog/<image>.jpg`

### Build Failures
**Symptom**: Build fails with type errors

**Fixes**:
- Run `npm run astro check` first
- Check for missing `getStaticPaths()` in dynamic routes
- Verify frontmatter matches schema

### Slow Builds
**Normal Behavior**: Astro optimizes all images during build

**If Excessive**:
- Check number of images (100+ can take 5-10 minutes)
- Consider image optimization level in `astro.config.mjs`

---

## Agent System (Role-Based Assistance)

Codex can assume specialized roles for different tasks. Invoke with: "Act as the [Role Name]" or use corresponding custom prompt.

### Content Management Roles

#### Writing Assistant
**Custom Prompt**: `/prompts:write-assist`
**Use When**: Creating new blog posts
**See**: `~/.codex/prompts/write-assist.md` for detailed process

#### Editor
**Invoke**: "Act as the Editor"
**Expertise**: Grammar, style, technical accuracy
**Process**:
1. Read post content
2. Check grammar, spelling, clarity
3. Verify technical accuracy
4. Ensure style consistency
5. Validate frontmatter schema

#### Content Planner
**Invoke**: "Act as the Content Planner"
**Expertise**: Content strategy, editorial calendar
**Process**:
1. Analyze current content portfolio (topics, tags, gaps)
2. Research trending topics
3. Identify SEO opportunities
4. Suggest editorial calendar (1-3 months)

#### Content Recommender
**Invoke**: "Act as the Content Recommender"
**Expertise**: Semantic similarity, recommendation generation
**Process**:
1. Analyze all blog posts
2. Compute semantic similarity (Claude LLM or embeddings)
3. Generate related post recommendations
4. Update `recommendations.json` for `RelatedPosts.astro`

### Research & Analysis Roles

#### Web Researcher
**Custom Prompt**: `/prompts:web-research`
**Tools**: Brave Search MCP
**Use When**: Researching topics, verifying facts, gathering examples

#### Post Analyzer
**Custom Prompt**: `/prompts:analyze-posts`
**Use When**: Analyzing blog metadata, identifying trends

#### Analytics Specialist
**Invoke**: "Act as the Analytics Specialist"
**Tools**: Google Analytics MCP
**Process**:
1. Query Analytics for traffic data
2. Identify top posts and trends
3. Correlate with content performance
4. Provide actionable insights

### SEO & Marketing Roles

#### SEO Optimizer
**Custom Prompt**: `/prompts:seo-check`
**Use When**: Auditing or optimizing blog posts for SEO

#### Social Media Manager
**Invoke**: "Act as the Social Media Manager"
**Process**:
1. Extract key points from blog post
2. Create platform-specific content (Twitter/X, LinkedIn)
3. Generate hashtags
4. Suggest posting schedule

### Operations & Management Roles

#### Site Manager
**Invoke**: "Act as the Site Manager"
**Responsibilities**:
- Run builds (`npm run build`)
- Troubleshoot build errors
- Optimize performance
- Manage deployment

#### Portfolio Curator
**Invoke**: "Act as the Portfolio Curator"
**Process**:
1. Review completed projects
2. Select portfolio-worthy items
3. Write project descriptions
4. Organize by category/skill

### Utility Roles

#### Image Generator
**Custom Prompt**: `/prompts:gen-image`
**Tools**: `generate_image.js` (Gemini API)
**Use When**: Creating blog hero images

#### Prompt Engineer
**Invoke**: "Act as the Prompt Engineer"
**Use When**: Optimizing prompts for Codex or other AI tools

---

## Multi-Agent Workflows

For complex tasks requiring multiple roles:

**Example**:
```
"Execute blog workflow:
1. Web Researcher: Research 'Astro 5.0 features'
2. Writing Assistant: Draft blog post (Korean)
3. Editor: Review and refine
4. SEO Optimizer: Optimize metadata
5. Image Generator: Create hero image
6. Site Manager: Validate build"
```

**Or use workflow prompts**:
```
/prompts:blog-workflow TOPIC="Astro 5.0" LANG=ko
```
```

### Step 5: 디렉토리별 AGENTS.md (선택, 30분)

`/src/components/AGENTS.md`:
```markdown
## Component Development Guidelines

### Structure
All Astro components must follow this pattern:

```astro
---
// 1. Props interface (TypeScript)
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
  .component {
    /* custom styles only when Tailwind insufficient */
  }
</style>
```

### Tailwind CSS Usage
**Class Order**: layout → typography → colors → effects

```astro
<div class="flex flex-col gap-4 text-lg font-bold text-gray-800 hover:text-blue-600">
```

**Responsive**: Mobile-first

```astro
<div class="w-full md:w-1/2 lg:w-1/3">
```

### Image Components
Always use `<Image>` for optimization:

```astro
---
import { Image } from 'astro:assets';
import myImg from '../../assets/example.jpg';
---
<Image src={myImg} alt="Description" width={600} height={400} />
```
```

### Step 6: Custom Prompts 생성 (3-4시간)

#### 6.1. 디렉토리 생성

```bash
mkdir -p ~/.codex/prompts
```

#### 6.2. 우선순위 높은 프롬프트 작성

**`~/.codex/prompts/write-assist.md`**:
```markdown
---
description: Technical blog post writing assistant
argument-hint: TOPIC="<topic>" LANG=<ko|en|ja|zh> [OUTLINE="<outline>"]
---

You are an expert technical blog post writing assistant for jangwook.net.

## Topic
$TOPIC

## Language
$LANG

## Optional Outline
$OUTLINE

## Your Expertise
- Technical writing for developers
- Multi-language content creation (ko, en, ja, zh)
- SEO optimization
- Code example creation with syntax highlighting

## Process

### 1. Research (if needed)
- Use Brave Search MCP for latest information on $TOPIC
- Verify technical accuracy
- Collect relevant code examples

### 2. Outline (if not provided)
- Introduction: Hook + context
- Main sections: 2-4 key points
- Conclusion: Summary + takeaways

### 3. Writing
- Clear, engaging prose
- Code examples with explanations
- Internal links to related posts
- Technical accuracy verified

### 4. Frontmatter Generation
```yaml
title: "<60 chars, include main keyword>"
description: "<150-160 chars for SEO>"
pubDate: '2025-11-13'  # Use current date
heroImage: '../../../assets/blog/<topic-slug>-hero.jpg'
tags: ["tag1", "tag2", "tag3"]  # 3-5 tags
```

### 5. File Creation
- Path: `src/content/blog/$LANG/<slug>.md`
- Slug: kebab-case from title

### 6. Quality Checks
- All frontmatter fields present
- Technical accuracy
- Clear explanations
- Proper code syntax highlighting
- SEO optimized metadata
- Grammar and style

## Style Guidelines
- **Bold**: Use `<strong>text</strong>` (not `**text**`)
- **Ranges**: Use `〜` (not `~`)
- **Tone**: Professional but approachable
- **Code**: Always include language specifier

```typescript
// Good
const example = "code";
```

## Success Criteria
- Frontmatter complete and valid
- Content well-structured
- Code examples functional
- SEO metadata optimized
- File saved in correct location
- `npm run astro check` passes
```

**`~/.codex/prompts/seo-check.md`**:
```markdown
---
description: SEO audit and optimization
argument-hint: [POST=<slug>] [--fix]
---

You are an SEO optimization specialist for jangwook.net.

## Target
$POST (if not specified, audit all posts)

## Mode
$1 == "--fix" ? "Auto-fix issues" : "Audit only"

## SEO Checklist

### 1. Title Optimization
- [ ] Length: 50-60 characters
- [ ] Includes target keyword
- [ ] Compelling and descriptive
- [ ] Unique across all posts

### 2. Meta Description
- [ ] Length: 150-160 characters
- [ ] Includes target keyword
- [ ] Clear value proposition
- [ ] Call to action

### 3. Heading Structure
- [ ] Single H1 (post title)
- [ ] Logical H2-H6 hierarchy
- [ ] Keywords in headings
- [ ] Descriptive, not generic

### 4. Content Quality
- [ ] Word count: 800+ words
- [ ] Keyword density: 1-2%
- [ ] Readability: Clear and concise
- [ ] Unique content

### 5. Images
- [ ] All have `alt` attributes
- [ ] Alt text descriptive
- [ ] File names descriptive (kebab-case)
- [ ] Using Astro `<Image>` component

### 6. Internal Linking
- [ ] 2-3 internal links per post
- [ ] Anchor text descriptive
- [ ] Links to related content
- [ ] No broken links

### 7. URL Structure
- [ ] SEO-friendly slug (kebab-case)
- [ ] Keyword in URL
- [ ] Short and descriptive

### 8. Meta Tags
- [ ] og:title, og:description, og:image
- [ ] twitter:card, twitter:title, twitter:description

## Process

### Audit
For each post:
1. Read content and frontmatter
2. Evaluate against all checklist items
3. Calculate SEO score (0-100)

### Report
```markdown
## SEO Audit: $POST

**Score**: X/100 (Grade: A/B/C/D/F)

### Issues (Priority: High → Low)
1. ❌ Title too long (65 chars)
2. ⚠️ Missing internal links
3. ✓ Description optimal

### Recommendations
1. Shorten title to: "..."
2. Add internal links to: [related posts]
...
```

### Auto-Fix (if `--fix`)
- Update frontmatter
- Add internal links
- Fix heading hierarchy
- Validate changes

## Success Criteria
- All issues identified
- Actionable recommendations
- If `--fix`, changes applied successfully
```

**`~/.codex/prompts/gen-image.md`**:
```markdown
---
description: Generate blog hero image
argument-hint: TOPIC="<topic>" OUTPUT="<filename>.jpg"
---

Generate a blog hero image using Gemini API.

## Topic
$TOPIC

## Output Path
src/assets/blog/$OUTPUT

## Process

### 1. Prompt Creation
Analyze: $TOPIC

Create image prompt:
- Style: Modern, tech-focused, professional
- Elements: Abstract/conceptual (not literal code)
- Colors: Vibrant but not overwhelming
- Composition: Horizontal (1020x510 or 2:1 ratio)
- Theme: Related to $TOPIC

**Example Prompts**:
- "Modern abstract representation of TypeScript type system, flowing data structures, blue and purple gradients, professional tech aesthetic"
- "Astro framework island architecture visualization, floating content islands in space, minimalist design, purple and orange theme"

### 2. Generate Image
```bash
node generate_image.js src/assets/blog/$OUTPUT "$PROMPT"
```

Requires: `GEMINI_API_KEY` environment variable

### 3. Validate
- File created successfully
- Dimensions ~1020x510 (2:1 ratio)
- Visual style matches blog aesthetic

### 4. Usage
Add to frontmatter:
```yaml
heroImage: '../../../assets/blog/$OUTPUT'
```

## Prompt Templates

### Technical Features
"Modern illustration of [feature], clean tech aesthetic, [color] theme, abstract geometric shapes"

### Framework/Tool
"[Framework] logo-inspired design, developer tools visualization, gradient background"

### Performance
"Speed visualization, flowing data streams, optimized pathways, tech aesthetic"

### Tutorial
"Learning and growth concept, code transformation, upward progression"

## Success Criteria
- Image generated
- File in correct location
- Appropriate dimensions
- Matches blog aesthetic
- Reflects topic conceptually
```

**더 많은 프롬프트**:
- `web-research.md`
- `analyze-posts.md`
- `gen-recs.md`
- `blog-workflow.md`

(각 파일은 03-agent-system.md의 예제 참조)

#### 6.3. 검증

```bash
# Codex 시작
codex

# 프롬프트 목록 확인
/prompts:

# 테스트
/prompts:write-assist TOPIC="Test Post" LANG=ko
```

### Step 7: GitHub Actions 설정 (선택, 2-3시간)

`.github/workflows/codex-validate.yml`:
```yaml
name: Codex Validation

on:
  pull_request:
    branches: [main]

jobs:
  validate:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install dependencies
        run: npm ci

      - name: Run Codex Validation
        uses: openai/codex-action@v1
        with:
          openai-api-key: ${{ secrets.OPENAI_API_KEY }}
          task: |
            Validate codebase:
            1. Run npm run astro check
            2. Validate all blog post frontmatter
            3. Check for broken links
            4. Report issues
          sandbox: read-only
```

## Before/After 비교

### 파일 구조

**Before (Claude Code)**:
```
프로젝트/
├── .mcp.json
├── CLAUDE.md (1093 lines)
└── .claude/
    ├── agents/ (17 files)
    └── commands/ (7 files)
```

**After (Codex CLI)**:
```
~/.codex/
├── config.toml (MCP + 설정)
├── GLOBAL_INSTRUCTIONS.md (전역 규칙)
└── prompts/ (5-10 files)
    ├── write-assist.md
    ├── seo-check.md
    ├── gen-image.md
    ├── web-research.md
    └── analyze-posts.md

프로젝트/
├── AGENTS.md (프로젝트 가이드 + 역할)
└── src/
    └── components/
        └── AGENTS.md (컴포넌트 가이드)
```

### 사용 패턴

**Before (Claude Code)**:
```
# 에이전트 호출
@writing-assistant "Create a post about Astro 5.0"
@seo-optimizer "Audit all posts"

# 슬래시 커맨드
/write-post
/analyze-posts
```

**After (Codex CLI)**:
```
# Custom Prompts
/prompts:write-assist TOPIC="Astro 5.0" LANG=ko
/prompts:seo-check

# 역할 호출
"Act as the Editor. Review the post we just created."

# 워크플로우
/prompts:blog-workflow TOPIC="Astro 5.0" LANG=ko
```

### 기능 매핑

| Claude Code | Codex CLI | 동등성 |
|-------------|-----------|--------|
| `@writing-assistant` | `/prompts:write-assist` | ✅ 완전 |
| `@seo-optimizer` | `/prompts:seo-check` | ✅ 완전 |
| `@image-generator` | `/prompts:gen-image` | ✅ 완전 |
| `@editor` | "Act as Editor" (AGENTS.md) | ✅ 완전 |
| `/write-post` | `/prompts:blog-workflow` | ✅ 완전 |
| `/analyze-posts` | `/prompts:analyze-posts` | ✅ 완전 |
| 자동 승인 | `approval_policy = "never"` | ✅ 완전 |
| MCP 서버 | `[mcp_servers.*]` | ✅ 완전 |

## 검증 및 테스트

### 1. MCP 서버 테스트

```bash
codex

# Codex 내에서:
"List available MCP servers and test each one:
1. context7: Search for 'Astro 5.0'
2. brave-search: Search for 'latest TypeScript features'
3. playwright: Take a screenshot of google.com
"
```

### 2. Custom Prompts 테스트

```bash
# 각 프롬프트 호출 테스트
/prompts:write-assist TOPIC="Test" LANG=ko
/prompts:seo-check
/prompts:gen-image TOPIC="Test Image" OUTPUT="test-hero.jpg"
```

### 3. AGENTS.md 로드 확인

```bash
codex --ask-for-approval never "Summarize the current project instructions from AGENTS.md"
```

**예상 출력**:
```
I have loaded the following instructions:

1. Global Guidelines (from ~/.codex/GLOBAL_INSTRUCTIONS.md)
2. Project Context (from /project/AGENTS.md)
   - Astro 5.14.1 blog project
   - Multi-language support (ko, en, ja, zh)
   - 17 specialized roles available
   - Content Collections schema requirements
   - Testing and SEO standards

Total: ~55 KiB of instructions loaded.
```

### 4. 역할 호출 테스트

```bash
codex

"Act as the Web Researcher. What tools do you have available?"

# 예상: Brave Search MCP 언급, 역할 설명

"Act as the SEO Optimizer. What's your process?"

# 예상: SEO 체크리스트 설명
```

### 5. 실제 작업 테스트

```bash
# 블로그 포스트 생성 워크플로우
/prompts:blog-workflow TOPIC="Codex CLI vs Claude Code" LANG=ko

# 결과 검증
npm run astro check
npm run build
```

## 트러블슈팅

### 문제 1: MCP 서버가 로드되지 않음

**증상**:
```
Error: MCP server 'context7' failed to start
```

**해결**:
```bash
# 1. 패키지 설치 확인
npx -y @upstash/context7-mcp --version

# 2. config.toml 경로 확인
cat ~/.codex/config.toml | grep "command.*context7"

# 3. 수동 실행 테스트
npx -y @upstash/context7-mcp

# 4. Codex 재시작
codex
```

### 문제 2: AGENTS.md가 로드되지 않음

**증상**:
프로젝트 컨텍스트가 인식되지 않음

**해결**:
```bash
# 1. 파일 존재 확인
ls -la AGENTS.md

# 2. 파일명 철자 확인 (대소문자 구분!)
# 올바름: AGENTS.md
# 틀림: agents.md, Agents.md

# 3. 크기 확인 (64 KiB 이하)
wc -c AGENTS.md

# 4. 로드 확인
codex "Summarize current instructions"
```

### 문제 3: Custom Prompt가 작동하지 않음

**증상**:
```
Error: Prompt 'write-assist' not found
```

**해결**:
```bash
# 1. 파일 존재 확인
ls ~/.codex/prompts/write-assist.md

# 2. 파일 권한 확인
chmod 644 ~/.codex/prompts/*.md

# 3. Codex 재시작 (프롬프트는 시작 시 로드)
codex

# 4. 프롬프트 목록 확인
/prompts:
```

### 문제 4: 환경 변수가 인식되지 않음

**증상**:
```
Error: NOTION_API_KEY not found
```

**해결**:
```bash
# 1. 환경 변수 확인
echo $NOTION_API_KEY

# 2. ~/.zshrc 또는 ~/.bashrc에 추가
export NOTION_API_KEY="secret_..."

# 3. 셸 재시작
source ~/.zshrc

# 4. 검증
echo $NOTION_API_KEY
```

### 문제 5: `codex exec` 실행 시 권한 오류

**증상**:
```
Error: Permission denied to modify files
```

**해결**:
```bash
# 기본 모드는 read-only
# 파일 수정 필요 시:
codex exec --full-auto "<task>"

# 네트워크 요청 필요 시:
codex exec --sandbox danger-full-access "<task>"
```

### 문제 6: 빌드 실패

**증상**:
```
Error: Content Collections schema validation failed
```

**해결**:
```bash
# 1. 타입 체크 먼저
npm run astro check

# 2. 에러 메시지 확인
# 보통 frontmatter 필드 누락 또는 타입 불일치

# 3. 스키마 확인
cat src/content.config.ts

# 4. 문제 포스트 찾기
codex "Find blog posts with invalid frontmatter and list issues"
```

## 마이그레이션 체크리스트

### Phase 1: 기본 설정
- [ ] Codex CLI 설치 완료
- [ ] `~/.codex/config.toml` 작성
- [ ] MCP 서버 8개 모두 작동 확인
- [ ] `~/.codex/GLOBAL_INSTRUCTIONS.md` 작성
- [ ] `/AGENTS.md` 작성 (프로젝트 루트)
- [ ] AGENTS.md 로드 확인

### Phase 2: Custom Prompts
- [ ] `~/.codex/prompts/` 디렉토리 생성
- [ ] `write-assist.md` 작성 및 테스트
- [ ] `seo-check.md` 작성 및 테스트
- [ ] `gen-image.md` 작성 및 테스트
- [ ] `web-research.md` 작성 및 테스트
- [ ] `analyze-posts.md` 작성 및 테스트
- [ ] 모든 프롬프트 호출 검증

### Phase 3: 실전 테스트
- [ ] 블로그 포스트 1개 작성 (테스트)
- [ ] SEO 감사 실행
- [ ] 이미지 생성 테스트
- [ ] 빌드 및 미리보기 확인
- [ ] 다국어 일관성 검증

### Phase 4: GitHub Actions (선택)
- [ ] `OPENAI_API_KEY` 시크릿 추가
- [ ] `codex-validate.yml` 작성
- [ ] PR 테스트
- [ ] Auto-fix 워크플로우 (선택)
- [ ] SEO audit 스케줄 (선택)

### Phase 5: 문서화
- [ ] 팀원 교육 자료 작성
- [ ] README 업데이트
- [ ] 트러블슈팅 가이드 공유

## 마무리

### 성공 지표

✅ **완료 기준**:
1. 모든 MCP 서버 작동
2. AGENTS.md 로드 및 인식
3. Custom Prompts 5개 이상 작동
4. 테스트 블로그 포스트 생성 성공
5. `npm run astro check` 및 `npm run build` 통과
6. 다국어 워크플로우 검증

### 다음 단계

**지속적 개선**:
1. Custom Prompts 추가 (필요 시)
2. AGENTS.md 업데이트 (새 워크플로우)
3. GitHub Actions 확장 (자동화 증가)
4. 성능 모니터링 (빌드 시간, 품질)

**확장 아이디어**:
- 자동 번역 파이프라인
- 스마트 코드 리뷰 봇
- 콘텐츠 추천 자동 생성
- 주간 SEO 리포트

---

**마지막 업데이트**: 2025-11-13
**작성 완료**: Codex CLI 마이그레이션 가이드 시리즈
