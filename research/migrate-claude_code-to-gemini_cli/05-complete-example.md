# 완전한 마이그레이션 예제

## 개요

현재 프로젝트(`www.jangwook.net`)의 Claude Code 설정을 Gemini CLI로 완전히 마이그레이션하는 실전 예제입니다.

## 현재 상태 (Claude Code)

### 파일 구조

```
프로젝트/
├── .mcp.json                    # MCP 서버 8개
├── CLAUDE.md                    # 프로젝트 지침
├── .claude/
│   ├── agents/                  # 서브에이전트 17개
│   │   ├── writing-assistant.md
│   │   ├── web-researcher.md
│   │   ├── content-recommender.md
│   │   ├── seo-optimizer.md
│   │   ├── image-generator.md
│   │   └── ...12 more
│   └── commands/                # 슬래시 커맨드 7개
│       ├── write-post.md
│       ├── analyze-posts.md
│       ├── generate-recommendations.md
│       └── ...4 more
```

### MCP 서버 (8개)

1. context7
2. sequentialthinking
3. automatalabs-playwright-server
4. notionApi
5. chrome-devtools
6. analytics-mcp
7. brave-search
8. browsermcp

### 에이전트 (17개)

분류별:
- **콘텐츠**: writing-assistant, editor, content-planner, content-recommender
- **연구**: web-researcher, post-analyzer
- **SEO/마케팅**: seo-optimizer, backlink-manager, social-media-manager
- **운영**: site-manager, portfolio-curator, image-generator
- **분석**: analytics, analytics-reporter
- **관리**: improvement-tracker, learning-tracker, prompt-engineer

### 커맨드 (7개)

- write-post (1093 lines)
- analyze-posts (445 lines)
- generate-recommendations
- write-post-ko
- write-ga-post
- next-post-recommendation
- commit

## 마이그레이션 계획

### Phase 1: 기본 설정 (1-2시간)

✅ **필수** - 즉시 실행

1. MCP 서버 마이그레이션
2. 프로젝트 지침 변환

### Phase 2: 핵심 커맨드 (2-3시간)

⚠️ **권장** - 자주 사용하는 커맨드만

3. 슬래시 커맨드 변환 (우선순위 높은 것만)
4. 간단한 에이전트 → 커맨드 변환

### Phase 3: 고급 기능 (선택사항)

⏸️ **선택** - 필요 시 점진적 마이그레이션

5. 복잡한 에이전트 재구성
6. Extensions 개발 (장기 과제)

## 실행: Phase 1 - 기본 설정

### Step 1.1: MCP 서버 마이그레이션

#### 자동 변환 스크립트 실행

```bash
# 변환 스크립트 (01-mcp-migration.md 참조)
python migrate_mcp.py .mcp.json .gemini/settings.json
```

#### 결과 검증

**.gemini/settings.json**:
```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp"]
    },
    "sequentialthinking": {
      "command": "docker",
      "args": ["run", "--rm", "-i", "mcp/sequentialthinking"],
      "type": "stdio"
    },
    "automatalabs-playwright-server": {
      "command": "npx",
      "args": ["-y", "@automatalabs/mcp-server-playwright"]
    },
    "notionApi": {
      "command": "npx",
      "args": ["-y", "@notionhq/notion-mcp-server"],
      "env": {
        "NOTION_TOKEN": "$NOTION_TOKEN"
      }
    },
    "chrome-devtools": {
      "command": "npx",
      "args": ["chrome-devtools-mcp@latest"]
    },
    "analytics-mcp": {
      "command": "pipx",
      "args": ["run", "analytics-mcp"],
      "env": {
        "GOOGLE_APPLICATION_CREDENTIALS": "$GOOGLE_APPLICATION_CREDENTIALS",
        "GOOGLE_PROJECT_ID": "$GOOGLE_PROJECT_ID"
      }
    },
    "brave-search": {
      "command": "docker",
      "args": ["run", "-i", "--rm", "-e", "BRAVE_API_KEY", "docker.io/mcp/brave-search"],
      "env": {
        "BRAVE_API_KEY": "$BRAVE_API_KEY"
      }
    },
    "browsermcp": {
      "command": "npx",
      "args": ["@browsermcp/mcp@latest"]
    }
  }
}
```

⚠️ **주의**: 환경 변수 참조 `${VAR}` → `$VAR` 변경됨

#### 환경 변수 설정

**.gemini/.env**:
```bash
NOTION_TOKEN=secret_token_here
GOOGLE_APPLICATION_CREDENTIALS=/path/to/credentials.json
GOOGLE_PROJECT_ID=your-project-id
BRAVE_API_KEY=your-brave-api-key
```

#### 검증

```bash
# Gemini CLI 시작
gemini-cli

# MCP 서버 확인
> /mcp

# 특정 서버 테스트
> @context7 get docs for "Astro"
> @notionApi search for "blog ideas"
```

---

### Step 1.2: 프로젝트 지침 변환

#### CLAUDE.md → GEMINI.md 변환

**변환 스크립트**:
```bash
python convert_instructions.py CLAUDE.md GEMINI.md
```

#### 수동 조정

**GEMINI.md** (변환 후 수동 편집):
```markdown
# Project: www.jangwook.net

## Overview
Astro-based technical blog and portfolio automation project

## General Instructions
- Astro 5.14.1 framework
- TypeScript strict mode
- Content Collections for type-safe content
- Islands Architecture (minimal client JS)

## Technology Stack
- **Framework**: Astro 5.14.1
- **Language**: TypeScript (strict)
- **Styling**: Tailwind CSS
- **Content**: MDX (Markdown + JSX)
- **Build**: npm

## Common Commands
\```bash
npm run dev          # Development server (localhost:4321)
npm run build        # Production build
npm run astro check  # Type check
npm run preview      # Build preview
\```

## Coding Style
- 2 spaces indentation
- kebab-case for files, PascalCase for components
- Import order: Astro → React → Utils → Styles

## Content Collections Schema
\```typescript
{
  title: string,
  description: string,
  pubDate: Date,
  heroImage?: ImageMetadata,
  tags?: string[],
  relatedPosts?: Array<{ slug, score, reason }>
}
\```

## Specific Component: src/content/blog
- Language folders: ko/, en/, ja/, zh/
- Same filename across languages
- Required frontmatter: title, description, pubDate
- Date format: 'YYYY-MM-DD' (single quotes)
- heroImage: ../../../assets/blog/[image]

## Testing Guidelines
- Run `npm run astro check` before committing
- Test build: `npm run build`
- Preview: `npm run preview`
- Validate Content Collections schema

## Agent Roles

### Writing Assistant
Act as Writing Assistant when creating blog posts.

Responsibilities:
- Research topics (web search with 2-second delays)
- Generate multi-language content (ko, ja, en, zh)
- Create hero images
- Manage metadata and recommendations

Activation: "write post", "create blog", "generate article"

### Web Researcher
Act as Web Researcher when conducting research.

Responsibilities:
- Comprehensive web research using Brave Search
- Verify from official docs
- Identify trends and best practices
- Gather code examples

Activation: "research", "find information", "investigate"

### SEO Optimizer
Act as SEO Optimizer when optimizing content.

Responsibilities:
- Analyze SEO metrics (title/description length)
- Check internal linking
- Verify meta tags
- Suggest improvements

Activation: "optimize SEO", "check SEO", "improve SEO"

[Additional roles as needed...]

## Blog Writing Workflow

@.gemini/docs/blog-workflow.md

## SEO Guidelines

@.gemini/docs/seo-guidelines.md
```

#### 상세 문서 생성

**.gemini/docs/blog-workflow.md**:
```markdown
# Blog Writing Complete Workflow

[CLAUDE.md의 "블로그 포스트 작성 워크플로우" 섹션 내용]

## Phase 1: Research
...

## Phase 2: Image Generation
...

## Phase 3: Content Writing
...

[전체 워크플로우 상세 내용]
```

---

## 실행: Phase 2 - 핵심 커맨드

### Step 2.1: 우선순위 커맨드 선정

**자주 사용하는 커맨드 (마이그레이션 필수)**:
1. ✅ write-post (블로그 작성 - 가장 중요)
2. ✅ generate-recommendations (추천 생성)
3. ⚠️ analyze-posts (메타데이터 분석 - 가끔 사용)
4. ⏸️ commit (간단 - 나중에)

**드물게 사용 (보류)**:
- write-post-ko
- write-ga-post
- next-post-recommendation

### Step 2.2: write-post 커맨드 변환

**변환 전략**: 하이브리드 (커맨드 + 문서)

**.gemini/commands/write-post.toml**:
```toml
description = "Generate multi-language blog post"
prompt = """
Generate a blog post about: {{args}}

Extract options:
- --tags: comma-separated tags
- --languages: language codes (default: ko,ja,en,zh)
- --description: SEO description

Workflow:
1. Research topic (web search, 2-second delays)
2. Determine pubDate (latest post + 1 day, 'YYYY-MM-DD')
3. Generate hero image
4. Write in parallel for 4 languages
5. Update README.md
6. Manage backlinks
7. Add metadata to post-metadata.json
8. Generate recommendations

Detailed workflow: @.gemini/docs/blog-workflow.md

Output:
- src/content/blog/<lang>/<slug>.md (4 files)
- src/assets/blog/<slug>-hero.[ext]
- Updated README.md
- Updated post-metadata.json

Follow Content Collections schema from GEMINI.md.
"""
```

### Step 2.3: generate-recommendations 커맨드

**.gemini/commands/generate-recommendations.toml**:
```toml
description = "Generate related post recommendations (V3)"
prompt = """
Generate related post recommendations for: {{args}}

Process (V3 system):
1. Read post-metadata.json (3 fields: pubDate, difficulty, categoryScores)
2. Calculate similarity:
   - Difficulty similarity: 20%
   - Category cosine similarity: 80%
3. Select top 5 related posts (score >= 0.3)
4. Generate multi-language reasoning (ko, ja, en)
5. Write relatedPosts array to frontmatter (all language versions)

Script alternative: node scripts/generate-recommendations-v3.js

Output format:
\```yaml
relatedPosts:
  - slug: post-slug
    score: 0.92
    reason:
      ko: "이유..."
      ja: "理由..."
      en: "Reason..."
\```

See: research/post-recommendation-v3/README.md
"""
```

### Step 2.4: 간단한 에이전트 → 커맨드

**.gemini/commands/optimize-seo.toml**:
```toml
description = "Optimize SEO for blog posts"
prompt = """
Optimize SEO for: {{args}}

Tasks:
1. Check title length (see GEMINI.md for language-specific limits)
   - Korean: 25-30 chars
   - English: 50-60 chars
   - Japanese: 30-35 chars
   - Chinese: 25-30 chars
2. Check description length
   - Korean: 70-80 chars
   - English: 150-160 chars
   - Japanese: 80-90 chars
   - Chinese: 70-80 chars
3. Analyze internal linking opportunities
4. Verify meta tags (Open Graph, Twitter Cards)
5. Suggest keyword improvements

Output: SEO report with specific action items.
"""
```

**.gemini/commands/research.toml**:
```toml
description = "Conduct web research on topic"
prompt = """
Research topic: {{args}}

Use Brave Search MCP with 2-second delays between requests.

Tasks:
1. Search for latest information
2. Verify from official documentation
3. Identify trending discussions
4. Gather code examples
5. Assess best practices

Output format:
## Research Report: [Topic]

### Summary
[Key findings]

### Official Documentation
- [Links to official docs]

### Code Examples
[Relevant code snippets]

### Best Practices
[Industry recommendations]

### Sources
[All sources with credibility assessment]
"""
```

---

## 실행: Phase 3 - 고급 기능 (선택사항)

### Step 3.1: 복잡한 에이전트 (보류 또는 GEMINI.md)

**복잡한 에이전트**:
- writing-assistant → GEMINI.md 역할 정의
- content-recommender → 이미 스크립트 존재 (V3)
- post-analyzer → analyze-posts 커맨드

**유지 (Claude Code 계속 사용)**:
- site-manager (Astro 빌드/배포 복잡)
- improvement-tracker (장기 프로젝트 관리)
- learning-tracker (학습 목표 추적)

### Step 3.2: Extensions 개발 (장기)

**후보**:
- writing-assistant Extension
- seo-optimizer Extension

**개발 계획**:
1. 요구사항 정의
2. Extension 구조 설계
3. 도구 구현 (research, generate-image 등)
4. 테스트 및 배포

**예상 시간**: 각 1-2주

---

## 완성된 구조

### Gemini CLI 프로젝트 구조

```
프로젝트/
├── .gemini/
│   ├── settings.json           # MCP 서버 8개
│   ├── .env                    # 환경 변수
│   ├── commands/               # 커맨드 6개 (우선순위)
│   │   ├── write-post.toml
│   │   ├── generate-recommendations.toml
│   │   ├── optimize-seo.toml
│   │   ├── research.toml
│   │   ├── analyze-posts.toml
│   │   └── commit.toml
│   └── docs/                   # 상세 문서
│       ├── blog-workflow.md
│       ├── seo-guidelines.md
│       └── research-methodology.md
├── GEMINI.md                   # 프로젝트 지침 + 역할 정의
└── [원래 프로젝트 파일들]
```

### 하이브리드 접근 (권장)

**Gemini CLI 사용**:
- 간단한 작업 (SEO 최적화, 리서치, 커밋)
- 빠른 프로토타이핑
- MCP 서버 활용

**Claude Code 유지**:
- 복잡한 멀티에이전트 워크플로우
- 장기 프로젝트 관리
- 익숙한 작업 흐름

---

## 마이그레이션 검증

### 체크리스트

**Phase 1 (기본 설정)**:
- [ ] MCP 서버 8개 모두 Gemini CLI에서 인식
- [ ] 환경 변수 올바르게 설정
- [ ] GEMINI.md 로드 확인 (`/memory show`)
- [ ] 상세 문서 import 작동 (@.gemini/docs/...)

**Phase 2 (핵심 커맨드)**:
- [ ] `/write-post` 커맨드 작동
- [ ] `/generate-recommendations` 실행 가능
- [ ] `/optimize-seo` SEO 분석 수행
- [ ] `/research` 웹 리서치 진행

**Phase 3 (고급 기능)**:
- [ ] 역할 전환 작동 ("Act as Writing Assistant...")
- [ ] 복잡한 워크플로우 실행
- [ ] Extensions 개발 (선택사항)

### 성능 비교

| 작업 | Claude Code | Gemini CLI | 비고 |
|------|-------------|------------|------|
| 블로그 작성 | 5-8분 | 6-10분 | 비슷함 |
| SEO 최적화 | 2-3분 | 2-3분 | 동일 |
| 리서치 | 3-5분 | 3-5분 | 동일 (Brave Search 사용) |
| 추천 생성 | 8-12분 | 8-12분 | 동일 (V3 스크립트) |
| 복잡한 워크플로우 | 15-20분 | 20-30분? | Gemini CLI 약간 느릴 수 있음 |

### 비용 비교

**MCP 서버 공통**: 무료 (로컬 실행 또는 API 키 사용)

**LLM 비용**:
- Claude Code: Anthropic Claude (유료 플랜 필요)
- Gemini CLI: Google Gemini 1.5 Pro (무료 티어 available)

**총 비용**: Gemini CLI가 저렴할 수 있음 (무료 티어 활용 시)

---

## 롤백 계획

### 마이그레이션 실패 시

```bash
# Gemini CLI 설정 백업
cp -r .gemini .gemini.backup

# Claude Code 설정 유지
# (원래 .mcp.json, CLAUDE.md, .claude/ 그대로 둠)

# Gemini CLI 제거 (필요 시)
rm -rf .gemini
```

### 하이브리드 유지

**권장**: 두 도구 병행 사용
- `.mcp.json` + `CLAUDE.md` + `.claude/` 유지
- `.gemini/` 추가 (충돌 없음)

**장점**:
- 각 도구의 강점 활용
- 점진적 전환 가능
- 리스크 최소화

---

## 다음 단계

### 단기 (1주)

1. Phase 1 완료 (기본 설정)
2. 핵심 커맨드 1-2개 테스트
3. 피드백 수집 및 조정

### 중기 (1개월)

1. Phase 2 완료 (핵심 커맨드 전체)
2. 일상 업무에 Gemini CLI 통합
3. Claude Code와 비교 평가

### 장기 (3개월+)

1. Phase 3 평가 (Extensions 개발 여부 결정)
2. 팀 공유 및 협업 워크플로우 수립
3. 지속적 개선

---

## 참고 자료

- [MCP Migration Guide](./01-mcp-migration.md)
- [Project Instructions](./02-project-instructions.md)
- [Slash Commands](./03-slash-commands.md)
- [Agent System](./04-agent-system.md)
- [README](./README.md)
