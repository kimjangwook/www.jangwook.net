# 에이전트 시스템 재구성 가이드

GitHub Copilot CLI의 커스텀 에이전트 시스템으로 마이그레이션하는 방법을 설명합니다.

## 목차

1. [개요](#개요)
2. [기본 구조 비교](#기본-구조-비교)
3. [에이전트 변환 방법](#에이전트-변환-방법)
4. [슬래시 커맨드 변환](#슬래시-커맨드-변환)
5. [에이전트 계층 구조](#에이전트-계층-구조)
6. [실전 변환 예제](#실전-변환-예제)
7. [사용 방법](#사용-방법)
8. [트러블슈팅](#트러블슈팅)

## 개요

### Claude Code 에이전트 시스템

```
.claude/
├── agents/          # 서브에이전트 (17개)
│   ├── writing-assistant.md
│   ├── seo-optimizer.md
│   └── ...
└── commands/        # 슬래시 커맨드 (7개)
    ├── write-post.md
    ├── commit.md
    └── ...
```

**특징**:
- 프로젝트별 에이전트
- `@agent-name` 또는 Task 도구로 호출
- Markdown 형식 (frontmatter 없음)
- 에이전트와 커맨드 구분

### Copilot CLI 에이전트 시스템

```
.github/
└── agents/          # 커스텀 에이전트 (통합)
    ├── writing-assistant.md
    ├── seo-optimizer.md
    └── commit.md    # 커맨드도 에이전트로 변환

또는

~/.copilot/
└── agents/          # 사용자 전역 에이전트
    └── my-agent.md
```

**특징**:
- 저장소 또는 사용자 전역 에이전트
- `/agent agent-name` 또는 `--agent=agent-name`으로 호출
- YAML frontmatter 필수
- 에이전트와 커맨드 통합 (모두 에이전트)

## 기본 구조 비교

### Claude Code 에이전트 구조

```markdown
# Agent Name

## Role

You are an expert...

## Core Principles

1. Principle 1
2. Principle 2

## 설명

에이전트 설명...

## 주요 기능

### 기능 1
- 세부사항...

## What You DO:

- ✅ Task 1
- ✅ Task 2

## What You DON'T DO:

- ❌ Task 1
- ❌ Task 2

## Workflow

...
```

### Copilot CLI 에이전트 구조

```markdown
---
description: "Brief one-line description"
---

# Agent Name

You are an expert...

## Core Principles

1. Principle 1
2. Principle 2

## What You DO:

- ✅ Task 1
- ✅ Task 2

## What You DON'T DO:

- ❌ Task 1
- ❌ Task 2

## Workflow

...
```

**주요 차이점**:
1. **YAML frontmatter 필수**: `description` 필드만 필요
2. **간결한 description**: 한 줄 요약 (50-100자)
3. **한국어 섹션 제거 가능**: description은 영어 권장 (다국어 가능하나 일관성 위해 영어 추천)
4. **구조 단순화**: Role, 설명, 주요 기능 등을 본문에 통합

## 에이전트 변환 방법

### 1. 기본 변환 프로세스

```bash
# 1. 디렉토리 생성
mkdir -p .github/agents

# 2. 각 에이전트 파일 복사 및 변환
cp .claude/agents/writing-assistant.md .github/agents/writing-assistant.md
```

### 2. 에이전트 파일 수정

**Before (Claude Code)**:
```markdown
# Writing Assistant Agent

## Role

You are an expert technical writer...

## 설명

블로그 포스트와 기술 문서 작성을 지원하는 에이전트입니다.
```

**After (Copilot CLI)**:
```markdown
---
description: "Expert technical writer for multi-language blog posts and documentation"
---

# Writing Assistant Agent

You are an expert technical writer with 10+ years of experience in developer-focused content creation.

Your expertise includes:
- Multi-language technical blogging (Korean, Japanese, English, Chinese)
- SEO optimization for developer audiences
- Technical accuracy and code example verification
- Cultural localization (not just translation)
```

### 3. 자동 변환 스크립트 (Python)

`scripts/convert-agents.py`:

```python
#!/usr/bin/env python3
"""
Claude Code 에이전트를 Copilot CLI 형식으로 변환하는 스크립트
"""

import os
import re
from pathlib import Path

def extract_description(content: str) -> str:
    """
    에이전트 설명 추출
    - 한국어 '설명' 섹션 우선
    - 없으면 Role 섹션의 첫 줄 사용
    """
    # 한국어 설명 섹션 찾기
    korean_match = re.search(r'## 설명\n\n(.+?)(?:\n\n|$)', content, re.DOTALL)
    if korean_match:
        desc = korean_match.group(1).strip()
        # 첫 문장만 추출
        return desc.split('.')[0].split('。')[0][:100]

    # Role 섹션에서 추출
    role_match = re.search(r'## Role\n\n(.+?)(?:\n|$)', content)
    if role_match:
        return role_match.group(1).strip()[:100]

    return "Custom agent for specialized tasks"

def remove_korean_sections(content: str) -> str:
    """
    한국어 전용 섹션 제거 (선택사항)
    - 설명, 주요 기능 등
    """
    # ## 설명 섹션 제거
    content = re.sub(r'## 설명\n\n.+?(?=\n##|\Z)', '', content, flags=re.DOTALL)

    # ## 주요 기능 섹션 제거 (선택사항 - 필요시 유지)
    # content = re.sub(r'## 주요 기능\n\n.+?(?=\n##|\Z)', '', content, flags=re.DOTALL)

    return content

def add_frontmatter(content: str, description: str) -> str:
    """
    YAML frontmatter 추가
    """
    frontmatter = f"""---
description: "{description}"
---

"""
    return frontmatter + content

def convert_agent(input_path: Path, output_path: Path):
    """
    단일 에이전트 파일 변환
    """
    with open(input_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 설명 추출
    description = extract_description(content)

    # 한국어 섹션 제거 (선택사항)
    # content = remove_korean_sections(content)

    # Frontmatter 추가
    content = add_frontmatter(content, description)

    # 출력
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"✓ Converted: {input_path.name} -> {output_path.name}")

def main():
    """
    모든 에이전트 변환
    """
    claude_agents_dir = Path('.claude/agents')
    copilot_agents_dir = Path('.github/agents')

    if not claude_agents_dir.exists():
        print(f"Error: {claude_agents_dir} not found")
        return

    print(f"Converting agents from {claude_agents_dir} to {copilot_agents_dir}...")
    print()

    for agent_file in claude_agents_dir.glob('*.md'):
        output_file = copilot_agents_dir / agent_file.name
        convert_agent(agent_file, output_file)

    print()
    print(f"✓ Conversion complete! Check {copilot_agents_dir}")

if __name__ == '__main__':
    main()
```

**사용법**:

```bash
chmod +x scripts/convert-agents.py
./scripts/convert-agents.py
```

## 슬래시 커맨드 변환

Copilot CLI에는 슬래시 커맨드가 없습니다. 모든 커맨드를 에이전트로 변환해야 합니다.

### 1. 커맨드 → 에이전트 변환 전략

**Before (`.claude/commands/commit.md`)**:
```markdown
# 코드 커미터

현재 스테이징 된 코드를 분석하여, 커밋 메시지를 작성하고, 커밋을 실시.

포맷은 다음과 같음

\`\`\`txt
요약 문장

[상세내용]...
\`\`\`
```

**After (`.github/agents/commit.md`)**:
```markdown
---
description: "Analyze staged code and create git commits with semantic messages"
---

# Git Commit Agent

You are a git commit specialist. Your role is to:

1. Analyze currently staged changes (`git diff --staged`)
2. Understand the nature of changes (feat, fix, docs, style, refactor, etc.)
3. Generate semantic commit messages following the format:

\`\`\`
<type>(<scope>): <subject>

[optional body explaining what and why]
\`\`\`

## Commit Message Guidelines

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only changes
- `style`: Code formatting (no functionality change)
- `refactor`: Code restructuring
- `perf`: Performance improvement
- `test`: Adding tests
- `chore`: Build, config changes

**Format Rules**:
- Subject: 50 characters max, imperative mood, no period
- Body: 72 characters per line, explain what and why (not how)
- Korean or English (match repository language)

## Workflow

1. Run `git diff --staged` to see changes
2. Identify change type and scope
3. Generate commit message
4. Show message to user for approval
5. Execute commit ONLY after user confirms

## What You DO:

- ✅ Analyze git diff output thoroughly
- ✅ Generate semantic commit messages
- ✅ Follow conventional commits specification
- ✅ Ask for user confirmation before committing

## What You DON'T DO:

- ❌ Commit without user approval
- ❌ Use vague messages like "update files"
- ❌ Skip commit body for non-trivial changes
```

### 2. 모든 커맨드 변환 예제

현재 프로젝트의 7개 커맨드를 에이전트로 변환:

| Claude Code 커맨드 | Copilot CLI 에이전트 | Description |
|---------------------|----------------------|-------------|
| `/write-post` | `writing-assistant.md` | 이미 에이전트로 존재 (통합) |
| `/write-post-ko` | `writing-assistant.md` | 위와 통합 |
| `/write-ga-post` | `ga-post-writer.md` | Google Analytics 포스트 전문 에이전트 |
| `/commit` | `commit.md` | Git 커밋 에이전트 |
| `/analyze-posts` | `post-analyzer.md` | 이미 에이전트로 존재 |
| `/generate-recommendations` | `content-recommender.md` | 이미 에이전트로 존재 |
| `/next-post-recommendation` | `next-post-planner.md` | 차기 포스트 추천 에이전트 |

**변환 전략**:
1. 기존 에이전트와 중복되는 커맨드는 에이전트에 통합
2. 독립적인 커맨드는 새 에이전트로 생성
3. 에이전트 이름은 역할을 명확히 표현

## 에이전트 계층 구조

Copilot CLI 에이전트는 3가지 레벨에서 관리 가능:

### 1. 사용자 레벨 (User-level)

**위치**: `~/.copilot/agents/`

**용도**: 개인적으로 자주 사용하는 범용 에이전트

**예시**:
```bash
~/.copilot/agents/
├── code-reviewer.md      # 코드 리뷰 에이전트
├── debugger.md           # 디버깅 전문가
└── translator.md         # 다국어 번역
```

**장점**:
- 모든 프로젝트에서 사용 가능
- 개인 워크플로우 최적화
- 팀과 독립적

**단점**:
- 팀원과 공유 불가
- 프로젝트 특화 불가

### 2. 저장소 레벨 (Repository-level)

**위치**: `.github/agents/`

**용도**: 프로젝트 특화 에이전트 (현재 프로젝트에 적합)

**예시**:
```bash
.github/agents/
├── writing-assistant.md   # 블로그 작성
├── seo-optimizer.md       # SEO 최적화
├── content-recommender.md # 콘텐츠 추천
└── commit.md              # Git 커밋
```

**장점**:
- Git으로 버전 관리
- 팀원과 공유
- 프로젝트 컨텍스트 반영

**단점**:
- 해당 저장소에서만 사용 가능

### 3. 조직 레벨 (Organization-level)

**위치**: GitHub Organization 설정

**용도**: 조직 전체 표준 에이전트

**예시**:
- 조직 코딩 스타일 가이드 에이전트
- 보안 정책 검사 에이전트
- 표준 문서 템플릿 에이전트

**장점**:
- 조직 전체 일관성
- 중앙 관리 가능

**단점**:
- GitHub Organization 필요
- 개인 사용자는 불가

### 4. 우선순위

동일한 이름의 에이전트가 여러 레벨에 있을 경우:

```
Organization > Repository > User
```

예: `writing-assistant.md`가 3곳 모두 있으면 Organization 버전 사용

## 실전 변환 예제

현재 프로젝트의 17개 에이전트를 변환합니다.

### 1. Writing Assistant 변환

**원본** (`.claude/agents/writing-assistant.md`):
```markdown
# Writing Assistant Agent

## Role

You are an expert technical writer and content strategist with 10+ years of experience...

## 설명

블로그 포스트와 기술 문서 작성을 지원하는 에이전트입니다.

## 주요 기능

### 1. 블로그 포스트 초안 작성
- 주제에 맞는 구조화된 초안 생성
...
```

**변환** (`.github/agents/writing-assistant.md`):
```markdown
---
description: "Expert technical writer for multi-language blog posts (KO/JA/EN/ZH) with SEO optimization"
---

# Writing Assistant Agent

## Role

You are an expert technical writer and content strategist with 10+ years of experience in developer-focused content creation.

Your expertise includes:
- Multi-language technical blogging (Korean, Japanese, English, Simplified Chinese)
- SEO optimization for developer audiences
- Technical accuracy and code example verification
- Cultural localization (not just translation)
- Collaborative workflows with research and image generation agents

You combine the clarity of technical documentation with the engagement of compelling storytelling.

## Core Principles

1. <strong>Accuracy First</strong>: Never fabricate technical details or code examples
2. <strong>Research-Backed</strong>: Always verify technical claims through Web Researcher
3. <strong>Cultural Localization</strong>: Each language version is crafted for its audience
4. <strong>Collaborative Excellence</strong>: Leverage specialized agents
5. <strong>SEO & Readability</strong>: Balance search optimization with human-friendly writing

## What You DO:

- ✅ Generate well-researched, accurate blog posts across 4 languages (ko, ja, en, zh)
- ✅ Coordinate with Web Researcher for technical fact-checking and latest information
- ✅ Create culturally localized content with appropriate tone and examples for each language
- ✅ Generate descriptive, context-aware hero image prompts for Image Generator
- ✅ Ensure SEO optimization (titles, descriptions, metadata per language guidelines)
- ✅ Use Mermaid diagrams for all flowcharts and architecture diagrams
- ✅ Verify code examples are syntactically correct before inclusion

## What You DON'T DO:

- ❌ Fabricate code examples without verification
- ❌ Make technical claims without sources
- ❌ Directly execute web searches - delegate to Web Researcher
- ❌ Generate images yourself - delegate to Image Generator
- ❌ Commit code or make git operations
- ❌ Translate blindly word-for-word
- ❌ Use plain text diagrams - always use Mermaid
- ❌ Guess technical details - admit uncertainty

## Workflow

1. **Research Phase**:
   - Delegate technical research to Web Researcher agent
   - Verify latest API versions, features, best practices
   - Gather authoritative sources

2. **Content Creation**:
   - Draft blog post in Korean (primary language)
   - Apply SEO best practices
   - Include code examples with syntax highlighting
   - Use Mermaid for diagrams

3. **Localization**:
   - Create Japanese, English, Chinese versions
   - Adapt cultural references and examples
   - Maintain technical accuracy across languages
   - Optimize SEO metadata per language

4. **Image Integration**:
   - Generate hero image prompt based on content theme
   - Coordinate with Image Generator
   - Add image reference to frontmatter

5. **Review & Refinement**:
   - Check all code examples
   - Verify SEO metadata (title ≤60 chars, description 150-160 chars)
   - Ensure consistent file structure across languages

## File Structure

All blog posts follow this structure:
\`\`\`
src/content/blog/
├── ko/post-slug.md
├── ja/post-slug.md
├── en/post-slug.md
└── zh/post-slug.md
\`\`\`

## Frontmatter Template

\`\`\`yaml
---
title: "Post Title (≤60 characters)"
description: "SEO description (150-160 characters)"
pubDate: '2025-11-13'  # YYYY-MM-DD format, single quotes
heroImage: "../../../assets/blog/image-name.jpg"
tags: ["tag1", "tag2", "tag3"]  # Max 3-5 tags
---
\`\`\`

## Handling Uncertainty

When encountering information you cannot verify:

1. **Admit clearly**: "이 정보는 현재 확인할 수 없습니다"
2. **Explain why**: "공식 문서에서 찾을 수 없음"
3. **Suggest action**: "Web Researcher 에이전트에게 조사 요청"
```

### 2. SEO Optimizer 변환

**변환** (`.github/agents/seo-optimizer.md`):
```markdown
---
description: "SEO specialist for sitemap, meta tags, internal linking optimization"
---

# SEO Optimizer Agent

You are an SEO expert specializing in technical SEO for developer blogs.

## Core Responsibilities

1. **Sitemap Optimization**
   - Ensure all blog posts are in sitemap
   - Verify sitemap-index.xml structure
   - Check lastmod timestamps

2. **Meta Tag Optimization**
   - Title tags (50-60 characters)
   - Meta descriptions (150-160 characters)
   - Open Graph tags for social sharing
   - Twitter Cards configuration
   - Canonical URLs

3. **Internal Linking Strategy**
   - Related posts recommendations
   - Topic cluster building
   - Anchor text optimization
   - Link distribution analysis

4. **Performance Monitoring**
   - Core Web Vitals
   - Mobile-friendliness
   - Page speed optimization

## What You DO:

- ✅ Audit existing meta tags and suggest improvements
- ✅ Generate optimal title/description for new posts
- ✅ Build internal link recommendations
- ✅ Verify sitemap accuracy
- ✅ Check structured data (JSON-LD)

## What You DON'T DO:

- ❌ Modify files without user confirmation
- ❌ Make claims without data/tools
- ❌ Sacrifice readability for SEO
```

### 3. Commit Agent 변환

**변환** (`.github/agents/commit.md`)**:

```markdown
---
description: "Git commit specialist following semantic commit conventions"
---

# Git Commit Agent

You are a git commit message expert following Conventional Commits specification.

## Your Process

1. **Analyze Changes**:
   - Run `git diff --staged`
   - Identify files and nature of changes
   - Determine commit type and scope

2. **Generate Message**:
   - Follow format: `<type>(<scope>): <subject>`
   - Keep subject ≤50 chars, imperative mood
   - Add body explaining what/why (72 chars/line)

3. **User Confirmation**:
   - Show generated message
   - Wait for approval
   - Execute commit only after confirmation

## Commit Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting (no code change)
- `refactor`: Code restructuring
- `perf`: Performance improvement
- `test`: Tests
- `chore`: Build, config

## Examples

\`\`\`
feat(blog): add GitHub Copilot CLI migration guide

- Created comprehensive documentation for migrating from Claude Code
- Includes MCP config, instructions, and agent system conversion
- Added Python automation scripts for conversion
\`\`\`

\`\`\`
fix(seo): correct og:image path in BaseHead component

The Open Graph image path was using absolute URL instead of relative,
causing broken images on social media previews.
\`\`\`

## What You DO:

- ✅ Analyze git diff thoroughly
- ✅ Generate semantic, descriptive messages
- ✅ Follow conventional commits spec
- ✅ Request user approval before committing

## What You DON'T DO:

- ❌ Commit without approval
- ❌ Use vague messages like "update files"
- ❌ Skip body for significant changes
- ❌ Break the 50/72 character limits
```

### 4. 전체 에이전트 목록 변환 요약

| # | Claude Code Agent | Copilot CLI Agent | Status |
|---|-------------------|-------------------|--------|
| 1 | analytics-reporter.md | ✓ 동일 | Ready |
| 2 | analytics.md | ✓ 동일 | Ready |
| 3 | backlink-manager.md | ✓ 동일 | Ready |
| 4 | content-planner.md | ✓ 동일 | Ready |
| 5 | content-recommender.md | ✓ 동일 | Ready |
| 6 | editor.md | ✓ 동일 | Ready |
| 7 | image-generator.md | ✓ 동일 | Ready |
| 8 | improvement-tracker.md | ✓ 동일 | Ready |
| 9 | learning-tracker.md | ✓ 동일 | Ready |
| 10 | portfolio-curator.md | ✓ 동일 | Ready |
| 11 | post-analyzer.md | ✓ 동일 | Ready |
| 12 | prompt-engineer.md | ✓ 동일 | Ready |
| 13 | seo-optimizer.md | ✓ 동일 | Ready |
| 14 | site-manager.md | ✓ 동일 | Ready |
| 15 | social-media-manager.md | ✓ 동일 | Ready |
| 16 | web-researcher.md | ✓ 동일 | Ready |
| 17 | writing-assistant.md | ✓ 동일 | Ready |
| 18 | `/commit` (command) | commit.md | **New** |
| 19 | `/write-post` (command) | → writing-assistant.md | **Merged** |
| 20 | `/write-post-ko` (command) | → writing-assistant.md | **Merged** |
| 21 | `/write-ga-post` (command) | ga-post-writer.md | **New** |
| 22 | `/analyze-posts` (command) | → post-analyzer.md | **Merged** |
| 23 | `/generate-recommendations` (command) | → content-recommender.md | **Merged** |
| 24 | `/next-post-recommendation` (command) | next-post-planner.md | **New** |

**최종 결과**:
- 17개 기존 에이전트 → frontmatter 추가로 변환
- 7개 슬래시 커맨드 → 3개 새 에이전트 생성, 4개는 기존 에이전트에 통합
- **총 20개 Copilot CLI 에이전트**

## 사용 방법

### 1. 에이전트 호출 방법

#### Interactive Mode

```bash
# 에이전트 선택 후 대화
copilot /agent writing-assistant

# 또는 프롬프트와 함께
copilot /agent writing-assistant "Next.js 15 App Router에 대한 블로그 포스트 작성"
```

#### Programmatic Mode

```bash
# 일회성 명령
copilot --agent=seo-optimizer -p "최근 10개 포스트의 메타태그 검토"

# 파일 참조 포함
copilot --agent=commit -p "현재 스테이징된 변경사항 커밋"
```

### 2. 에이전트 목록 확인

```bash
# 현재 사용 가능한 모든 에이전트 확인
copilot /agents

# 또는
copilot --list-agents
```

**출력 예시**:
```
Available agents:
  Repository agents (.github/agents/):
    - writing-assistant: Expert technical writer for multi-language blog posts
    - seo-optimizer: SEO specialist for sitemap, meta tags, internal linking
    - commit: Git commit specialist following semantic conventions
    ...

  User agents (~/.copilot/agents/):
    - code-reviewer: General-purpose code review agent
    - debugger: Debugging specialist
```

### 3. 에이전트 간 협업

Copilot CLI 에이전트는 직접 협업하지 않지만, 순차적 호출로 워크플로우 구성 가능:

```bash
# 1. 블로그 포스트 작성
copilot /agent writing-assistant "TypeScript 5.5 새 기능 소개"

# 2. SEO 최적화
copilot /agent seo-optimizer "방금 작성한 포스트의 SEO 검토"

# 3. 커밋
copilot /agent commit "새 블로그 포스트 커밋"
```

### 4. 파일 컨텍스트 제공

```bash
# 특정 파일을 컨텍스트로 제공
copilot /agent editor @src/content/blog/ko/new-post.md
```

## 트러블슈팅

### 1. 에이전트가 목록에 나타나지 않음

**증상**:
```bash
copilot --list-agents
# Repository agents: (empty)
```

**원인**:
- `.github/agents/` 디렉토리가 없거나 비어있음
- YAML frontmatter가 잘못됨
- 파일 권한 문제

**해결**:

```bash
# 디렉토리 확인
ls -la .github/agents/

# frontmatter 문법 검증
head -5 .github/agents/writing-assistant.md
# 출력 예상:
# ---
# description: "..."
# ---

# 권한 확인
chmod 644 .github/agents/*.md
```

### 2. Description이 표시되지 않음

**증상**:
에이전트 목록에 이름만 나타나고 설명이 없음

**원인**:
- `description` 필드 누락
- YAML 문법 오류 (따옴표 누락, 들여쓰기 등)

**해결**:

```yaml
# ❌ 잘못된 예
---
description: Missing quotes
---

# ✓ 올바른 예
---
description: "Quoted description"
---

# ✓ 여러 줄 (선택사항)
---
description: >
  Multi-line description
  can span multiple lines
---
```

### 3. 에이전트가 예상대로 동작하지 않음

**증상**:
에이전트가 지시사항을 무시하거나 일관성 없는 응답

**원인**:
- 에이전트 프롬프트가 너무 모호함
- 상충되는 지시사항
- 컨텍스트 부족

**해결**:

1. **명확한 지시사항**:
```markdown
## What You DO:
- ✅ Specific, actionable task
- ✅ With clear success criteria

## What You DON'T DO:
- ❌ Specific anti-patterns to avoid
```

2. **예제 포함**:
```markdown
## Examples

Good commit message:
\`\`\`
feat(blog): add TypeScript generics tutorial

- Covers basic to advanced generic patterns
- Includes real-world use cases
\`\`\`

Bad commit message:
\`\`\`
update files
\`\`\`
```

3. **파일 참조로 컨텍스트 제공**:
```bash
copilot /agent writing-assistant @CLAUDE.md "프로젝트 가이드라인 준수하여 포스트 작성"
```

### 4. 에이전트가 파일 수정 권한 없음

**증상**:
```
Error: Permission denied to modify files
```

**원인**:
Copilot CLI는 기본적으로 파일 수정에 사용자 승인 필요

**해결**:

1. **수동 승인**:
   - 에이전트가 파일 수정 제안 → 사용자가 승인
   - 안전하지만 번거로움

2. **Auto-approve (비권장)**:
   - 현재 Copilot CLI는 자동 승인 옵션 제공하지 않음
   - 보안상 이유로 항상 수동 승인 필요

3. **워크플로우 조정**:
   - 에이전트는 변경사항을 제안만 하고, 사용자가 직접 적용
   ```bash
   copilot /agent seo-optimizer "메타태그 개선 제안만 (파일 수정 안 함)"
   ```

### 5. Global vs Repository 에이전트 충돌

**증상**:
예상과 다른 버전의 에이전트 실행

**원인**:
동일한 이름의 에이전트가 여러 레벨에 존재

**해결**:

```bash
# 우선순위 확인:
# Organization > Repository > User

# Repository 에이전트 명시적 사용
cd /path/to/project
copilot /agent writing-assistant  # .github/agents/writing-assistant.md 사용

# User 에이전트 사용하려면 이름 변경
mv ~/.copilot/agents/writing-assistant.md ~/.copilot/agents/my-writing-assistant.md
copilot /agent my-writing-assistant
```

### 6. 한글 description 문제

**증상**:
한글 description이 깨지거나 표시되지 않음

**원인**:
- 파일 인코딩 문제
- 터미널 locale 설정

**해결**:

```bash
# 파일 인코딩 확인 및 변환
file .github/agents/writing-assistant.md
# 출력: UTF-8 Unicode text

# UTF-8이 아니면 변환
iconv -f EUC-KR -t UTF-8 file.md > file_utf8.md

# Locale 확인
echo $LANG
# 권장: en_US.UTF-8 또는 ko_KR.UTF-8

# Locale 설정 (zsh)
echo 'export LANG=ko_KR.UTF-8' >> ~/.zshrc
source ~/.zshrc
```

**권장사항**:
- Description은 영어로 작성 (국제 표준)
- 한글은 본문에 포함
```yaml
---
description: "Expert technical writer for multi-language blog posts"
---

# Writing Assistant Agent

이 에이전트는 다국어 블로그 포스트 작성을 지원합니다.
(한글 설명은 본문에)
```

## 다음 단계

에이전트 시스템 마이그레이션 완료 후:

1. ✓ `.github/agents/` 디렉토리에 20개 에이전트 생성 완료
2. ✓ 각 에이전트에 YAML frontmatter 추가
3. ✓ 슬래시 커맨드를 에이전트로 통합
4. → **[다음: 완전한 마이그레이션 예제](./04-complete-example.md)**
   - 전체 프로세스 단계별 실행
   - Before/After 비교
   - 검증 및 테스트
   - 트러블슈팅 실전 예제

## 참고 자료

- [GitHub Copilot CLI Custom Agents (공식 문서)](https://docs.github.com/en/copilot/using-github-copilot/using-github-copilot-in-the-command-line)
- [Conventional Commits Specification](https://www.conventionalcommits.org/)
- [YAML Syntax Reference](https://yaml.org/spec/1.2.2/)
- Claude Code Best Practices (비교 참고)
