# 완전한 마이그레이션 예제

`jangwook.net` 프로젝트를 Claude Code에서 GitHub Copilot CLI로 마이그레이션하는 전체 프로세스를 단계별로 설명합니다.

## 목차

1. [프로젝트 개요](#프로젝트-개요)
2. [사전 준비](#사전-준비)
3. [단계별 마이그레이션](#단계별-마이그레이션)
4. [검증 및 테스트](#검증-및-테스트)
5. [Before/After 비교](#beforeafter-비교)
6. [실전 워크플로우](#실전-워크플로우)
7. [문제 해결 시나리오](#문제-해결-시나리오)
8. [마이그레이션 체크리스트](#마이그레이션-체크리스트)

## 프로젝트 개요

### 현재 Claude Code 설정

**프로젝트**: Astro 기반 기술 블로그 (다국어 지원)

**주요 구성 요소**:
- **MCP 서버**: 8개 (context7, sequentialthinking, playwright, notion, chrome-devtools, analytics, brave-search, browsermcp)
- **프로젝트 가이드라인**: `CLAUDE.md` (4,000+ 줄)
- **서브에이전트**: 17개 (writing-assistant, seo-optimizer, web-researcher 등)
- **슬래시 커맨드**: 7개 (/write-post, /commit, /analyze-posts 등)

**현재 워크플로우**:
```bash
# Claude Code 세션
claude

# 에이전트 호출
@writing-assistant "Next.js 15에 대한 블로그 포스트 작성"

# 슬래시 커맨드
/write-post
/commit
```

### 마이그레이션 목표

**Copilot CLI로 전환 후**:
- ✓ MCP 서버 8개 유지 (`~/.copilot/mcp-config.json`)
- ✓ 프로젝트 가이드라인 전환 (`.github/copilot-instructions.md`)
- ✓ 20개 커스텀 에이전트 (17개 기존 + 3개 신규)
- ✓ 워크플로우 호환성 유지

**예상 작업 시간**: 3-4시간

## 사전 준비

### 1. GitHub Copilot CLI 설치

```bash
# Copilot CLI 설치 (npm)
npm install -g @githubnext/github-copilot-cli

# 또는 Homebrew (macOS)
brew install github-copilot-cli

# 인증
gh copilot auth

# 버전 확인
copilot --version
# 출력: GitHub Copilot CLI v1.x.x
```

**요구사항**:
- GitHub Copilot Pro 구독 ($10/월)
- GitHub CLI (`gh`) 설치
- Node.js 18+ (MCP 서버 실행에 필요)

### 2. 기존 설정 백업

```bash
# 프로젝트 루트에서
mkdir -p backup/claude-code

# 모든 Claude Code 설정 백업
cp -r .claude backup/claude-code/
cp .mcp.json backup/claude-code/
cp CLAUDE.md backup/claude-code/

# 확인
ls -la backup/claude-code/
```

### 3. 환경 변수 준비

현재 `.mcp.json`에서 사용 중인 환경 변수 목록:

```bash
# 필요한 환경 변수 확인
grep -o '\${[A-Z_]*}' .mcp.json | sort -u
```

**출력**:
```
${BRAVE_API_KEY}
${GEMINI_API_KEY}
${GOOGLE_APPLICATION_CREDENTIALS}
${GOOGLE_PROJECT_ID}
${NOTION_TOKEN}
```

이 값들을 쉘 설정에 추가할 준비:

```bash
# ~/.zshrc 또는 ~/.bashrc
export BRAVE_API_KEY="your_key_here"
export GEMINI_API_KEY="your_key_here"
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/credentials.json"
export GOOGLE_PROJECT_ID="your_project_id"
export NOTION_TOKEN="your_token_here"
```

### 4. 마이그레이션 스크립트 준비

```bash
# 스크립트 디렉토리 생성
mkdir -p scripts

# 이전 가이드에서 제공한 Python 스크립트 저장
# - scripts/convert-mcp-config.py
# - scripts/convert-agents.py
```

## 단계별 마이그레이션

### 단계 1: MCP 서버 설정 마이그레이션 (30분)

#### 1.1 자동 변환 스크립트 실행

```bash
# MCP 설정 변환
python3 scripts/convert-mcp-config.py

# 출력:
# Converting .mcp.json to Copilot CLI format...
# ✓ Converted environment variable: ${BRAVE_API_KEY} -> $BRAVE_API_KEY
# ✓ Converted environment variable: ${NOTION_TOKEN} -> $NOTION_TOKEN
# ...
# ✓ Output: ~/.copilot/mcp-config.json
```

#### 1.2 환경 변수 설정

```bash
# ~/.zshrc에 추가
cat >> ~/.zshrc << 'EOF'

# ===== MCP Server Environment Variables =====
export BRAVE_API_KEY="BSA_YOUR_KEY_HERE"
export GEMINI_API_KEY="YOUR_GEMINI_KEY"
export GOOGLE_APPLICATION_CREDENTIALS="$HOME/.config/gcloud/credentials.json"
export GOOGLE_PROJECT_ID="your-project-id"
export NOTION_TOKEN="secret_YOUR_NOTION_TOKEN"
EOF

# 적용
source ~/.zshrc
```

#### 1.3 MCP 서버 테스트

```bash
# Copilot CLI로 MCP 서버 연결 테스트
copilot -p "현재 사용 가능한 MCP 서버 목록을 보여줘"

# Brave Search 테스트
copilot -p "Brave Search를 사용해서 'GitHub Copilot CLI' 검색"

# Notion 연결 테스트
copilot -p "Notion API를 사용해서 내 워크스페이스 정보 가져와"
```

**예상 결과**:
```
Available MCP servers:
- context7: Library documentation lookup
- brave-search: Web search capabilities
- notionApi: Notion workspace integration
...
```

### 단계 2: 프로젝트 가이드라인 마이그레이션 (1시간)

#### 2.1 CLAUDE.md 분석

```bash
# 파일 크기 확인
wc -l CLAUDE.md
# 출력: 4157 CLAUDE.md

# 주요 섹션 추출
grep "^## " CLAUDE.md
```

**주요 섹션**:
- 프로젝트 개요
- 명령어
- 아키텍처
- Astro 페이지 작성 주의사항
- 블로그 포스트 작성 워크플로우
- 서브에이전트 시스템
- 타입 안전성
- 빌드 및 배포
- Testing Guidelines
- Repository Etiquette
- Code Style Guidelines
- MCP Server Integration

#### 2.2 글로벌 가이드라인 생성

```bash
# 디렉토리 생성
mkdir -p .github

# 글로벌 가이드라인 (핵심 내용만)
cat > .github/copilot-instructions.md << 'EOF'
# jangwook.net - Project Guidelines

## Project Overview

Astro-based technical blog with multi-language support (Korean, Japanese, English, Simplified Chinese).

**Key Features**:
- Blog automation and SEO optimization
- Content recommendation system (Claude LLM-based)
- Portfolio curation
- Multi-language content management

## Technology Stack

- **Framework**: Astro 5.14.1
- **Styling**: Tailwind CSS
- **Content**: MDX (Markdown + JSX)
- **Deployment**: Static Site Generation (SSG)
- **Package Manager**: npm

## Commands

\`\`\`bash
npm run dev        # Development server (localhost:4321)
npm run build      # Production build (./dist/)
npm run preview    # Preview build
npm run astro check  # Type check
\`\`\`

## Architecture Principles

1. **Islands Architecture**: Static HTML by default, JavaScript only where needed
2. **Content Collections**: Type-safe content in `src/content/`
3. **File-based Routing**: `src/pages/` structure defines URLs

## Directory Structure

\`\`\`
src/
├── assets/          # Optimized static assets
├── components/      # Reusable Astro components
├── content/
│   └── blog/
│       ├── ko/      # Korean posts
│       ├── ja/      # Japanese posts
│       ├── en/      # English posts
│       └── zh/      # Chinese posts
├── layouts/         # Page layout templates
├── pages/           # File-based routing
├── styles/          # Global CSS
└── content.config.ts  # Content schema

public/              # Static files (copied as-is)
.github/
└── agents/          # Copilot custom agents
\`\`\`

## Critical Rules

### Blog Posts

1. **Multi-language Structure**:
   - Same filename across all language folders
   - Example: `ko/post-title.md`, `en/post-title.md`, `ja/post-title.md`, `zh/post-title.md`

2. **Frontmatter Schema** (REQUIRED):
\`\`\`yaml
---
title: "Post Title (≤60 chars)"
description: "SEO description (150-160 chars)"
pubDate: '2025-11-13'  # YYYY-MM-DD, single quotes
heroImage: "../../../assets/blog/image.jpg"
tags: ["tag1", "tag2", "tag3"]
---
\`\`\`

3. **Image Optimization**:
   - Always use `<Image>` component from `astro:assets`
   - Store in `src/assets/blog/`
   - Reference with relative path: `../../../assets/blog/`

### Code Style

1. **Markdown Formatting**:
   - ✓ Bold: `<strong>text</strong>` (NOT `**text**`)
   - ✓ Range: `1〜10` (full-width tilde, NOT `~`)

2. **TypeScript**:
   - Explicit types for function parameters and return values
   - Use destructuring: `const { title, description } = post.data`
   - Early return pattern

3. **Astro Components**:
   - Props with TypeScript interfaces
   - Scoped styles by default
   - Use `<slot />` for composability

### Git Commits

Follow Conventional Commits:
\`\`\`
<type>(<scope>): <subject>

[optional body]
\`\`\`

Types: feat, fix, docs, style, refactor, perf, test, chore

## Testing Checklist

Before committing:
- [ ] `npm run astro check` passes
- [ ] `npm run build` succeeds
- [ ] `npm run preview` works locally
- [ ] All language versions consistent
- [ ] SEO metadata complete (title ≤60, description 150-160)

## MCP Server Integration

Available servers (configured in `~/.copilot/mcp-config.json`):
- **context7**: Library documentation
- **brave-search**: Web search
- **notionApi**: Notion integration
- **chrome-devtools**: Performance analysis
- **analytics-mcp**: Google Analytics
- **playwright**: Browser automation

## Custom Agents

Use specialized agents in `.github/agents/`:
- **writing-assistant**: Multi-language blog post creation
- **seo-optimizer**: SEO optimization
- **web-researcher**: Technical research with Brave Search
- **commit**: Semantic git commits
- (15 more - see `.github/agents/`)

## Reference

- Project details: This file
- Astro docs: https://docs.astro.build
- Content Collections: https://docs.astro.build/en/guides/content-collections/
EOF
```

#### 2.3 경로별 가이드라인 생성

**컴포넌트 가이드라인**:

```bash
cat > src/components/.instructions.md << 'EOF'
---
applyTo: "src/components/**/*.astro"
---

# Component Development Guidelines

## Component Structure

\`\`\`astro
---
// TypeScript interface for props
interface Props {
  title: string;
  description?: string;
}

const { title, description = 'Default' } = Astro.props;
---

<article>
  <h1>{title}</h1>
  {description && <p>{description}</p>}
</article>

<style>
  /* Scoped styles - prefer Tailwind for most styling */
  article {
    /* Custom CSS only when Tailwind is insufficient */
  }
</style>
\`\`\`

## Best Practices

1. **Props**: Always define TypeScript interface
2. **Styling**: Tailwind first, custom CSS as fallback
3. **Images**: Use `<Image>` component, never `<img>`
4. **Slots**: Use `<slot />` for composability
5. **Naming**: PascalCase for components

## Tailwind Class Order

Layout → Typography → Colors → Effects

\`\`\`astro
<div class="flex flex-col gap-4 text-lg font-bold text-gray-800 hover:text-blue-600">
\`\`\`
EOF
```

**블로그 포스트 가이드라인**:

```bash
cat > src/content/blog/.instructions.md << 'EOF'
---
applyTo: "src/content/blog/**/*.md"
---

# Blog Post Writing Guidelines

## Multi-Language File Structure

**CRITICAL**: All language versions must have identical filenames in their respective folders.

\`\`\`
src/content/blog/
├── ko/awesome-post.md
├── ja/awesome-post.md
├── en/awesome-post.md
└── zh/awesome-post.md
\`\`\`

## Frontmatter Requirements

\`\`\`yaml
---
title: "Engaging Title (50-60 characters)"
description: "SEO-optimized description explaining the post (150-160 characters)"
pubDate: '2025-11-13'  # MUST use YYYY-MM-DD format with single quotes
heroImage: "../../../assets/blog/hero-image.jpg"
tags: ["typescript", "web-development", "tutorial"]  # 3-5 tags
---
\`\`\`

## Markdown Best Practices

1. **Bold Text**: Use HTML tags
   - ✓ `<strong>important text</strong>`
   - ✗ `**important text**`

2. **Ranges**: Use full-width tilde
   - ✓ `1〜10개`
   - ✗ `1~10개`

3. **Code Blocks**: Always specify language
\`\`\`typescript
const example: string = "Always specify language";
\`\`\`

4. **Diagrams**: Use Mermaid syntax
\`\`\`mermaid
graph TD
    A[Start] --> B[Process]
    B --> C[End]
\`\`\`

## SEO Optimization

- **Title**: 50-60 characters, include primary keyword
- **Description**: 150-160 characters, compelling summary
- **Headings**: Clear hierarchy (H1 → H2 → H3)
- **Internal Links**: Link to related posts
- **Images**: Always include descriptive alt text

## Localization Guidelines

Each language version should be:
- **Culturally adapted**: Not just translated
- **Examples localized**: Use region-appropriate examples
- **Technical terms consistent**: Follow language-specific conventions
- **Tone appropriate**: Match target audience expectations
EOF
```

**Git 규칙**:

```bash
cat > .github/.instructions.md << 'EOF'
---
applyTo: ".github/**"
---

# Git and GitHub Guidelines

## Commit Message Format

Follow Conventional Commits specification:

\`\`\`
<type>(<scope>): <subject>

[optional body]

[optional footer]
\`\`\`

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code formatting (no functionality change)
- `refactor`: Code restructuring
- `perf`: Performance improvement
- `test`: Adding or updating tests
- `chore`: Build process or auxiliary tool changes

### Examples

\`\`\`
feat(blog): add GitHub Copilot CLI migration guide

- Comprehensive documentation for Claude Code to Copilot CLI migration
- Includes MCP config, instructions, and agent system conversion
- Added Python automation scripts
\`\`\`

\`\`\`
fix(seo): correct og:image path in BaseHead

The Open Graph image was using absolute URL instead of relative path,
causing broken social media previews.
\`\`\`

## Branch Strategy

- `main`: Production branch (always deployable)
- `feature/*`: New features
- `fix/*`: Bug fixes
- `docs/*`: Documentation updates

## Pull Request Guidelines

1. Clear, descriptive title
2. Detailed description (what, why, how)
3. Checklist:
   - [ ] `npm run astro check` passes
   - [ ] `npm run build` succeeds
   - [ ] Tested locally
   - [ ] Documentation updated (if needed)
EOF
```

### 단계 3: 에이전트 마이그레이션 (1.5시간)

#### 3.1 자동 변환 실행

```bash
# 에이전트 변환 스크립트 실행
python3 scripts/convert-agents.py

# 출력:
# Converting agents from .claude/agents to .github/agents...
#
# ✓ Converted: analytics-reporter.md -> analytics-reporter.md
# ✓ Converted: analytics.md -> analytics.md
# ✓ Converted: backlink-manager.md -> backlink-manager.md
# ...
# ✓ Converted: writing-assistant.md -> writing-assistant.md
#
# ✓ Conversion complete! Check .github/agents
```

#### 3.2 수동 조정 필요한 에이전트

일부 에이전트는 수동 검토 및 조정 필요:

**1. Writing Assistant** - 가장 복잡한 에이전트

```bash
# 파일 확인
cat .github/agents/writing-assistant.md | head -20
```

**조정 사항**:
- Description을 더 간결하게
- 한국어 섹션 유지 여부 결정
- MCP 서버 참조 방식 확인

**수정**:
```markdown
---
description: "Multi-language technical writer (KO/JA/EN/ZH) with SEO optimization and research integration"
---

# Writing Assistant Agent

(본문은 대부분 유지, 일부 Copilot CLI 특화 조정)
```

**2. Web Researcher** - Brave Search MCP 활용

```bash
cat .github/agents/web-researcher.md | head -30
```

**조정 사항**:
- Brave Search MCP 서버 사용법 명시
- Copilot CLI의 MCP 호출 방식 반영

**3. Commit Agent** - 신규 생성

```bash
cat > .github/agents/commit.md << 'EOF'
---
description: "Git commit specialist following Conventional Commits specification"
---

# Git Commit Agent

You are a git commit message expert.

## Your Process

1. **Analyze staged changes**: Run `git diff --staged`
2. **Determine type and scope**: feat, fix, docs, etc.
3. **Generate semantic message**:
\`\`\`
<type>(<scope>): <subject>

[body explaining what and why]
\`\`\`
4. **Request user approval**
5. **Execute commit** (only after approval)

## Commit Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `perf`: Performance
- `test`: Tests
- `chore`: Build, config

## What You DO:

- ✅ Analyze git diff thoroughly
- ✅ Generate descriptive, semantic messages
- ✅ Follow Conventional Commits spec
- ✅ Request approval before committing

## What You DON'T DO:

- ❌ Commit without user approval
- ❌ Use vague messages ("update files")
- ❌ Skip body for significant changes
EOF
```

#### 3.3 에이전트 목록 검증

```bash
# 모든 에이전트 파일 확인
ls -1 .github/agents/

# frontmatter 검증
for file in .github/agents/*.md; do
  echo "=== $file ==="
  head -3 "$file"
  echo ""
done
```

**예상 출력**:
```
=== .github/agents/analytics-reporter.md ===
---
description: "Generate data-driven reports from blog analytics"
---

=== .github/agents/writing-assistant.md ===
---
description: "Multi-language technical writer with SEO optimization"
---
...
```

### 단계 4: 워크플로우 테스트 (1시간)

#### 4.1 기본 기능 테스트

```bash
# 에이전트 목록 확인
copilot --list-agents

# 예상 출력:
# Repository agents (.github/agents/):
#   - writing-assistant: Multi-language technical writer...
#   - seo-optimizer: SEO specialist for sitemap...
#   - commit: Git commit specialist...
#   (17 more)
```

#### 4.2 실제 워크플로우 테스트

**블로그 포스트 작성**:

```bash
# Writing Assistant 호출
copilot /agent writing-assistant

# 프롬프트:
# "GitHub Copilot CLI의 커스텀 에이전트 시스템에 대한 블로그 포스트를 한국어, 일본어, 영어, 중국어로 작성해줘.
#
# 주제:
# - Copilot CLI 에이전트 개요
# - 커스텀 에이전트 생성 방법
# - Claude Code와의 비교
# - 실전 예제
#
# CLAUDE.md 가이드라인을 따라줘."
```

**SEO 최적화**:

```bash
# 방금 작성한 포스트 SEO 검토
copilot /agent seo-optimizer "src/content/blog/ko/copilot-cli-custom-agents.md 파일의 SEO 메타데이터를 검토하고 개선 제안해줘"
```

**커밋**:

```bash
# 변경사항 스테이징
git add src/content/blog/*/copilot-cli-custom-agents.md

# Commit 에이전트 호출
copilot /agent commit
```

#### 4.3 MCP 서버 통합 테스트

**Brave Search 활용**:

```bash
copilot /agent web-researcher "GitHub Copilot CLI의 최신 릴리스 노트와 주요 기능 조사"
```

**Notion 연동**:

```bash
copilot -p "Notion API를 사용해서 'Blog Ideas' 데이터베이스의 최근 5개 아이템 가져와"
```

**Context7 문서 조회**:

```bash
copilot -p "Context7을 사용해서 Astro 5.14 이미지 최적화 관련 최신 문서 조회"
```

## 검증 및 테스트

### 1. MCP 서버 연결 확인

```bash
# 모든 MCP 서버 상태 확인
copilot -p "현재 연결된 MCP 서버 목록과 각각의 상태를 보여줘"
```

**예상 출력**:
```
Connected MCP servers:

1. context7
   Status: ✓ Connected
   Purpose: Library documentation lookup

2. brave-search
   Status: ✓ Connected
   Purpose: Web search capabilities

3. notionApi
   Status: ✓ Connected
   Purpose: Notion workspace integration

4. chrome-devtools
   Status: ✓ Connected
   Purpose: Browser automation and performance analysis

5. analytics-mcp
   Status: ✓ Connected
   Purpose: Google Analytics data retrieval

... (3 more)
```

### 2. 가이드라인 적용 확인

```bash
# 컴포넌트 작성 시 가이드라인 적용 테스트
copilot -p "src/components/ 디렉토리에 BlogCard.astro 컴포넌트 생성해줘. Props는 title, description, heroImage, tags를 받아."

# 블로그 포스트 작성 시 가이드라인 적용 테스트
copilot /agent writing-assistant "TypeScript 5.5 새로운 기능 소개 - 한국어로만"

# Git 커밋 시 규칙 적용 테스트
copilot /agent commit
```

**검증 포인트**:
- [ ] 컴포넌트가 TypeScript interface 사용
- [ ] Tailwind CSS 클래스 순서 준수
- [ ] 블로그 포스트 frontmatter 스키마 준수
- [ ] Commit 메시지가 Conventional Commits 형식

### 3. 에이전트 기능 검증

**각 에이전트 역할 테스트**:

```bash
# 1. Writing Assistant
copilot /agent writing-assistant "간단한 테스트 포스트"

# 2. SEO Optimizer
copilot /agent seo-optimizer "최근 5개 포스트 메타태그 검토"

# 3. Web Researcher
copilot /agent web-researcher "Next.js 15 App Router 최신 정보"

# 4. Post Analyzer
copilot /agent post-analyzer "src/content/blog/ko/ 디렉토리의 모든 포스트 분석"

# 5. Content Recommender
copilot /agent content-recommender "블로그 전체 포스트에 대한 추천 생성"

# 6. Commit
git add .
copilot /agent commit
```

### 4. 성능 비교

**Claude Code vs Copilot CLI 응답 시간**:

| 작업 | Claude Code | Copilot CLI | 차이 |
|------|-------------|-------------|------|
| 에이전트 호출 | ~2초 | ~1초 | 50% 빠름 |
| MCP 서버 쿼리 | ~3초 | ~2.5초 | 약간 빠름 |
| 블로그 포스트 생성 (1개 언어) | ~30초 | ~25초 | 약간 빠름 |
| 4개 언어 동시 생성 | ~2분 | ~1.5분 | 25% 빠름 |

**비용 비교**:

| 항목 | Claude Code | Copilot CLI |
|------|-------------|-------------|
| 월 구독료 | $20 | $10 |
| API 사용량 | 무제한 (Fair Use) | 무제한 (Fair Use) |
| 토큰 제한 | 200K context | GPT-4 기본 (128K) |

## Before/After 비교

### 워크플로우 비교

#### Before: Claude Code

**블로그 포스트 작성 전체 프로세스**:

```bash
# 1. Claude Code 시작
claude

# 2. 리서치
@web-researcher "TypeScript 5.5 새 기능 조사"

# 3. 포스트 작성
/write-post
# (interactive prompt에서 주제, 언어 등 입력)

# 4. SEO 최적화
@seo-optimizer "방금 작성한 포스트 SEO 검토"

# 5. 이미지 생성
@image-generator "TypeScript 타입 시스템 주제의 히어로 이미지"

# 6. 커밋
/commit
```

**특징**:
- ✓ 프로젝트별 컨텍스트 (CLAUDE.md 자동 로드)
- ✓ 슬래시 커맨드 간편 (짧은 명령어)
- ✓ 에이전트 간 협업 자동화
- ✗ 높은 비용 ($20/월)
- ✗ Anthropic 종속

#### After: Copilot CLI

**동일한 프로세스**:

```bash
# 1. 리서치
copilot /agent web-researcher "TypeScript 5.5 새 기능 조사"

# 2. 포스트 작성
copilot /agent writing-assistant "TypeScript 5.5 새 기능 소개 - 한국어, 일본어, 영어, 중국어"

# 3. SEO 최적화
copilot /agent seo-optimizer @src/content/blog/ko/typescript-5-5-features.md

# 4. 이미지 생성 (수동 또는 별도 워크플로우)
node generate_image.js src/assets/blog/ts-5-5.jpg "TypeScript 5.5 type system"

# 5. 커밋
git add .
copilot /agent commit
```

**특징**:
- ✓ 저렴한 비용 ($10/월)
- ✓ GitHub 통합 (네이티브 MCP 서버)
- ✓ 글로벌 + 프로젝트별 에이전트
- ✗ 슬래시 커맨드 없음 (에이전트로 대체)
- ✗ 파일 수정 시 수동 승인 필요
- ✗ 에이전트 간 자동 협업 없음 (순차 호출)

### 설정 파일 비교

#### MCP 서버 설정

**Claude Code** (`.mcp.json`):
```json
{
  "mcpServers": {
    "brave-search": {
      "command": "docker",
      "args": ["run", "-i", "--rm", "-e", "BRAVE_API_KEY", "docker.io/mcp/brave-search"],
      "env": {
        "BRAVE_API_KEY": "${BRAVE_API_KEY}"
      }
    }
  }
}
```

**Copilot CLI** (`~/.copilot/mcp-config.json`):
```json
{
  "mcpServers": {
    "brave-search": {
      "command": "docker",
      "args": ["run", "-i", "--rm", "-e", "BRAVE_API_KEY", "docker.io/mcp/brave-search"],
      "env": {
        "BRAVE_API_KEY": "$BRAVE_API_KEY"
      }
    }
  }
}
```

**주요 차이**:
- 환경 변수 참조: `${VAR}` → `$VAR`
- 위치: 프로젝트 루트 → `~/.copilot/` (글로벌)

#### 프로젝트 가이드라인

**Claude Code** (`CLAUDE.md`):
- 위치: 프로젝트 루트
- 크기: 4,157 줄 (매우 상세)
- 자동 로드: 모든 세션에서
- 다국어: 한국어 + 영어 혼용

**Copilot CLI** (`.github/copilot-instructions.md` + 경로별 `.instructions.md`):
- 위치: `.github/` + 각 디렉토리
- 크기: 글로벌 ~300줄 + 경로별 ~100줄 (모듈화)
- 자동 로드: 해당 경로 작업 시
- 언어: 영어 권장 (일관성)

#### 에이전트 정의

**Claude Code** (`.claude/agents/writing-assistant.md`):
```markdown
# Writing Assistant Agent

## Role
You are an expert...

## 설명
블로그 포스트 작성...

## 주요 기능
### 1. 블로그 포스트 초안 작성
...
```

**Copilot CLI** (`.github/agents/writing-assistant.md`):
```markdown
---
description: "Multi-language technical writer with SEO optimization"
---

# Writing Assistant Agent

## Role
You are an expert...

## What You DO:
- ✅ ...

## What You DON'T DO:
- ❌ ...
```

**주요 차이**:
- YAML frontmatter 필수
- 한국어 섹션 선택적
- Description 필드로 빠른 식별

## 실전 워크플로우

### 시나리오 1: 새 블로그 포스트 발행

**목표**: TypeScript 5.5 새 기능 소개 포스트 (4개 언어)

```bash
# 1단계: 최신 정보 리서치
copilot /agent web-researcher "TypeScript 5.5 릴리스 노트와 주요 새 기능 조사. 공식 문서와 GitHub 릴리스 확인."

# 출력 예시:
# TypeScript 5.5 Major Features:
#
# 1. **Inferred Type Predicates**
#    - Auto-infer type guards in filter operations
#    - Source: https://devblogs.microsoft.com/typescript/announcing-typescript-5-5/
#
# 2. **Control Flow Narrowing for Constant Indexed Accesses**
#    - Better type narrowing in object property access
#    - Source: TypeScript 5.5 release notes
# ...

# 2단계: 블로그 포스트 작성
copilot /agent writing-assistant "TypeScript 5.5의 새로운 기능들을 소개하는 블로그 포스트를 작성해줘.

주요 내용:
- Inferred Type Predicates
- Control Flow Narrowing
- 실전 코드 예제 포함

언어: 한국어, 일본어, 영어, 중국어 (4개 동시)
파일명: typescript-5-5-features.md

CLAUDE.md 가이드라인을 따르고, Web Researcher 에이전트가 조사한 정보를 활용해줘."

# Writing Assistant가 생성하는 파일:
# - src/content/blog/ko/typescript-5-5-features.md
# - src/content/blog/ja/typescript-5-5-features.md
# - src/content/blog/en/typescript-5-5-features.md
# - src/content/blog/zh/typescript-5-5-features.md

# 3단계: SEO 최적화
copilot /agent seo-optimizer "방금 작성한 typescript-5-5-features.md (모든 언어)의 SEO 메타데이터를 검토하고, 개선 사항이 있으면 제안해줘.

확인 항목:
- Title 길이 (50-60자)
- Description 길이 (150-160자)
- 키워드 밀도
- 내부 링크 기회"

# 4단계: 히어로 이미지 생성 (수동)
node generate_image.js src/assets/blog/typescript-5-5.jpg "TypeScript 5.5 type system with modern code editor, professional tech blog style"

# 5단계: 로컬 빌드 및 미리보기
npm run astro check
npm run build
npm run preview

# 6단계: Git 커밋
git add src/content/blog/*/typescript-5-5-features.md
git add src/assets/blog/typescript-5-5.jpg

copilot /agent commit

# Commit Agent 출력:
# Suggested commit message:
#
# feat(blog): add TypeScript 5.5 features post in 4 languages
#
# - Covers inferred type predicates and control flow narrowing
# - Includes practical code examples with syntax highlighting
# - Multi-language versions: KO, JA, EN, ZH
# - SEO-optimized metadata (title ≤60, description 150-160)
#
# Approve and commit? (y/n)

# 7단계: 배포
git push origin main
```

**소요 시간**: ~45분 (리서치 10분 + 작성 25분 + 검토 10분)

### 시나리오 2: SEO 전체 감사

**목표**: 블로그 전체 SEO 상태 점검 및 개선

```bash
# 1단계: 사이트맵 검증
copilot /agent seo-optimizer "sitemap-index.xml과 개별 사이트맵들을 검증해줘. 누락된 페이지나 잘못된 lastmod 날짜 확인."

# 2단계: 메타태그 감사
copilot /agent seo-optimizer "src/content/blog/ 디렉토리의 모든 블로그 포스트에 대해:

1. Title 길이 검사 (50-60자 권장)
2. Description 길이 검사 (150-160자 권장)
3. 중복 title/description 확인
4. 누락된 필수 필드 확인

언어별로 리포트 생성해줘."

# 3단계: 내부 링크 분석
copilot /agent seo-optimizer "블로그 포스트 간 내부 링크를 분석하고:

1. 고립된 포스트 (0 incoming links) 식별
2. 주제별 클러스터링 기회 발견
3. 관련 포스트 추천 시스템(relatedPosts) 활용도 확인

개선 제안 리스트 생성."

# 4단계: 성능 검사 (Chrome DevTools MCP 활용)
copilot -p "Chrome DevTools MCP를 사용해서 블로그 메인 페이지의 Core Web Vitals 측정:

- LCP (Largest Contentful Paint)
- FID (First Input Delay)
- CLS (Cumulative Layout Shift)

개선이 필요한 항목 리포트."

# 5단계: Analytics 데이터 확인
copilot /agent analytics "Google Analytics MCP를 사용해서 지난 30일간:

1. 상위 10개 페이지 (페이지뷰)
2. 평균 체류 시간이 낮은 페이지 (<30초)
3. 이탈률이 높은 페이지 (>70%)

SEO 개선이 필요한 페이지 우선순위 제안."
```

**결과물**:
- SEO 감사 리포트 (마크다운)
- 개선 우선순위 목록
- 구체적인 액션 아이템

### 시나리오 3: 콘텐츠 추천 시스템 업데이트

**목표**: 모든 블로그 포스트에 대한 의미론적 추천 재생성

```bash
# 1단계: 전체 포스트 분석
copilot /agent post-analyzer "src/content/blog/ 디렉토리의 모든 포스트를 분석해서:

1. 주제별 분류
2. 기술 스택 태깅
3. 난이도 레벨 (Beginner/Intermediate/Advanced)
4. 카테고리 점수 (Web Dev, DevOps, AI/ML, etc.)

JSON 형식으로 출력."

# 2단계: 의미론적 추천 생성
copilot /agent content-recommender "모든 블로그 포스트에 대해 Claude LLM 기반 의미론적 추천 생성:

각 포스트마다:
- Prerequisite (선행 학습): 2-3개
- Related (관련 주제): 3-4개
- Next Steps (다음 단계): 2-3개

추천 점수 (0-1) 및 다국어 이유(reason) 포함.
recommendations.json 파일로 저장."

# 3단계: Frontmatter 업데이트
copilot -p "recommendations.json 데이터를 사용해서 각 블로그 포스트의 frontmatter에 relatedPosts 필드 추가:

\`\`\`yaml
relatedPosts:
  - slug: 'related-post-1'
    score: 0.85
    reason:
      ko: '추천 이유 한국어'
      ja: '推薦理由日本語'
      en: 'Recommendation reason English'
\`\`\`

모든 언어 버전에 동일하게 적용."

# 4단계: 검증
npm run astro check
npm run build

# 5단계: 커밋
git add src/content/blog/
git add recommendations.json

copilot /agent commit
```

**소요 시간**: ~30분 (분석 10분 + 생성 15분 + 업데이트 5분)

## 문제 해결 시나리오

### 문제 1: MCP 서버 연결 실패

**증상**:
```bash
copilot -p "Brave Search로 'TypeScript 5.5' 검색"

# Error: MCP server 'brave-search' not responding
```

**진단**:

```bash
# 1. 환경 변수 확인
echo $BRAVE_API_KEY
# (출력 없음)

# 2. MCP 설정 파일 확인
cat ~/.copilot/mcp-config.json | grep -A5 brave-search

# 3. Docker 이미지 확인
docker images | grep brave-search
```

**해결**:

```bash
# 환경 변수 누락 → 쉘 설정에 추가
echo 'export BRAVE_API_KEY="YOUR_KEY_HERE"' >> ~/.zshrc
source ~/.zshrc

# 환경 변수 확인
echo $BRAVE_API_KEY

# Copilot CLI 재시작 (터미널 새로고침)
# 다시 시도
copilot -p "Brave Search로 'TypeScript 5.5' 검색"
```

### 문제 2: 에이전트가 프로젝트 가이드라인 무시

**증상**:
```bash
copilot /agent writing-assistant "블로그 포스트 작성"

# 생성된 포스트의 frontmatter:
# pubDate: "Nov 13, 2025"  # ← 잘못된 형식 (YYYY-MM-DD 아님)
# **bold text**  # ← 잘못된 마크다운 (**대신 <strong> 사용해야 함)
```

**진단**:

```bash
# 가이드라인 파일 확인
ls -la .github/copilot-instructions.md
ls -la src/content/blog/.instructions.md

# 내용 확인
grep "pubDate" .github/copilot-instructions.md
grep "bold" src/content/blog/.instructions.md
```

**해결**:

```bash
# 1. 명시적으로 가이드라인 참조
copilot /agent writing-assistant @.github/copilot-instructions.md @src/content/blog/.instructions.md "블로그 포스트 작성

반드시 다음 규칙 준수:
- pubDate: 'YYYY-MM-DD' 형식, 작은따옴표
- Bold: <strong>text</strong> 형식
- Range: 전각 틸드(〜) 사용"

# 2. 가이드라인 강화 (더 명확하게)
cat >> src/content/blog/.instructions.md << 'EOF'

## CRITICAL RULES (절대 위반 금지)

1. **pubDate Format**: MUST use 'YYYY-MM-DD' with single quotes
   - ✓ Correct: `pubDate: '2025-11-13'`
   - ✗ Wrong: `pubDate: "Nov 13, 2025"`

2. **Bold Text**: MUST use HTML tags
   - ✓ Correct: `<strong>text</strong>`
   - ✗ Wrong: `**text**`

3. **Range**: MUST use full-width tilde
   - ✓ Correct: `1〜10`
   - ✗ Wrong: `1~10`
EOF
```

### 문제 3: 파일 수정 권한 거부

**증상**:
```bash
copilot /agent seo-optimizer "모든 포스트의 description을 150-160자로 최적화"

# Agent response:
# I've analyzed all posts and prepared optimized descriptions.
# However, I cannot modify files without your approval.
#
# Would you like me to show you the suggested changes?
```

**원인**: Copilot CLI는 보안상 이유로 파일 수정에 사용자 승인 필요

**해결 (Option 1: 수동 적용)**:

```bash
# 에이전트에게 변경 제안만 요청
copilot /agent seo-optimizer "모든 포스트의 description 개선 제안을 JSON 형식으로 출력해줘:

{
  \"src/content/blog/ko/post1.md\": {
    \"current\": \"현재 description\",
    \"suggested\": \"개선된 description (155자)\",
    \"reason\": \"개선 이유\"
  },
  ...
}

파일은 수정하지 말고 제안만."

# 출력을 복사해서 수동으로 적용하거나, 스크립트 작성
```

**해결 (Option 2: 워크플로우 조정)**:

```bash
# 에이전트를 "advisor" 역할로 제한
cat > .github/agents/seo-optimizer.md << 'EOF'
---
description: "SEO advisor providing optimization suggestions (does not modify files)"
---

# SEO Optimizer Agent

You are an SEO consultant who PROVIDES SUGGESTIONS but DOES NOT modify files.

## What You DO:

- ✅ Analyze SEO issues
- ✅ Provide detailed recommendations
- ✅ Generate improvement checklists
- ✅ Output suggested changes in copy-paste format

## What You DON'T DO:

- ❌ Modify files directly
- ❌ Use file editing tools
- ❌ Commit changes

Always output suggested changes as:
1. File path
2. Section to change
3. Before (current content)
4. After (suggested content)
5. Reason for change
EOF
```

### 문제 4: 다국어 에이전트 응답

**증상**:
```bash
copilot /agent writing-assistant "TypeScript 포스트 작성"

# Agent responds entirely in English, even though:
# - description in frontmatter is in Korean
# - user prompt was in Korean
```

**원인**: Copilot CLI의 기본 언어가 영어, 에이전트 프롬프트도 영어

**해결**:

```bash
# 1. 명시적으로 언어 지정
copilot /agent writing-assistant "TypeScript 포스트 작성

**중요: 한국어로 응답해줘. 블로그 포스트도 한국어로 작성.**"

# 2. 에이전트 프롬프트에 다국어 지원 명시
cat >> .github/agents/writing-assistant.md << 'EOF'

## Language Handling

- **Detect user's language**: Match your response language to the user's prompt
- **Korean prompt** → Respond in Korean
- **Japanese prompt** → Respond in Japanese
- **English prompt** → Respond in English
- **Chinese prompt** → Respond in Chinese

When creating multi-language blog posts:
- Generate all language versions simultaneously
- Ensure cultural localization (not just translation)
EOF
```

## 마이그레이션 체크리스트

### 사전 준비 ✓

- [ ] GitHub Copilot Pro 구독 활성화
- [ ] GitHub Copilot CLI 설치 및 인증
- [ ] 현재 Claude Code 설정 백업
- [ ] 환경 변수 목록 작성
- [ ] 마이그레이션 스크립트 다운로드

### MCP 서버 마이그레이션 ✓

- [ ] `.mcp.json` → `~/.copilot/mcp-config.json` 변환
- [ ] 환경 변수 문법 수정 (`${VAR}` → `$VAR`)
- [ ] 쉘 설정에 환경 변수 추가
- [ ] 각 MCP 서버 연결 테스트
- [ ] 에러 로그 확인 및 해결

### 프로젝트 가이드라인 마이그레이션 ✓

- [ ] `CLAUDE.md` → `.github/copilot-instructions.md` 변환
- [ ] 주요 섹션 식별 및 간결화 (4000줄 → ~300줄)
- [ ] 경로별 `.instructions.md` 생성:
  - [ ] `src/components/.instructions.md`
  - [ ] `src/content/blog/.instructions.md`
  - [ ] `.github/.instructions.md`
- [ ] YAML frontmatter (`applyTo`) 추가
- [ ] 가이드라인 적용 테스트

### 에이전트 마이그레이션 ✓

- [ ] 자동 변환 스크립트 실행
- [ ] 각 에이전트 frontmatter 검증:
  - [ ] analytics-reporter.md
  - [ ] analytics.md
  - [ ] backlink-manager.md
  - [ ] content-planner.md
  - [ ] content-recommender.md
  - [ ] editor.md
  - [ ] image-generator.md
  - [ ] improvement-tracker.md
  - [ ] learning-tracker.md
  - [ ] portfolio-curator.md
  - [ ] post-analyzer.md
  - [ ] prompt-engineer.md
  - [ ] seo-optimizer.md
  - [ ] site-manager.md
  - [ ] social-media-manager.md
  - [ ] web-researcher.md
  - [ ] writing-assistant.md
- [ ] 슬래시 커맨드 → 에이전트 변환:
  - [ ] commit.md (신규)
  - [ ] ga-post-writer.md (신규)
  - [ ] next-post-planner.md (신규)
- [ ] 에이전트 목록 확인 (`copilot --list-agents`)

### 워크플로우 검증 ✓

- [ ] 블로그 포스트 작성 테스트
- [ ] SEO 최적화 테스트
- [ ] Git 커밋 테스트
- [ ] MCP 서버 통합 테스트:
  - [ ] Brave Search
  - [ ] Notion API
  - [ ] Context7
  - [ ] Chrome DevTools
  - [ ] Google Analytics
- [ ] 성능 측정 및 비교

### 최종 검증 ✓

- [ ] `npm run astro check` 통과
- [ ] `npm run build` 성공
- [ ] `npm run preview` 동작 확인
- [ ] 모든 에이전트 정상 작동
- [ ] 가이드라인 자동 적용 확인
- [ ] 팀원과 설정 공유 (`.github/agents/`, `.github/copilot-instructions.md`)

### 문서화 ✓

- [ ] 마이그레이션 프로세스 문서화
- [ ] 팀원용 사용 가이드 작성
- [ ] 트러블슈팅 FAQ 작성
- [ ] Before/After 비교 정리

## 다음 단계

마이그레이션 완료 후:

1. **팀원과 공유**:
   ```bash
   git add .github/
   git commit -m "feat: migrate to GitHub Copilot CLI

   - MCP servers configured in ~/.copilot/mcp-config.json
   - Project guidelines in .github/copilot-instructions.md
   - 20 custom agents in .github/agents/
   - Path-specific instructions for components, blog, git"

   git push origin main
   ```

2. **팀원 온보딩**:
   - GitHub Copilot Pro 구독 안내
   - Copilot CLI 설치 가이드 제공
   - 환경 변수 설정 지원
   - 에이전트 사용법 교육

3. **지속적 개선**:
   - 에이전트 피드백 수집
   - 가이드라인 정제
   - 새로운 에이전트 추가
   - MCP 서버 확장

4. **비용 절감 확인**:
   - Claude Code: $20/월
   - Copilot CLI: $10/월
   - **절감: $10/월 (50%)**

## 참고 자료

- [GitHub Copilot CLI 공식 문서](https://docs.github.com/en/copilot/using-github-copilot/using-github-copilot-in-the-command-line)
- [Model Context Protocol (MCP) 스펙](https://modelcontextprotocol.io/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Astro 공식 문서](https://docs.astro.build)

---

**마이그레이션 성공을 축하합니다!** 🎉

이제 Copilot CLI로 효율적인 블로그 운영과 개발 워크플로우를 즐기세요.
