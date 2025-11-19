# 에이전트 시스템 재구성 가이드

## 개요

Claude Code의 서브에이전트 시스템(`.claude/agents/*.md`)을 Gemini CLI에서 재현하는 방법을 설명합니다.

**중요**: Gemini CLI는 Claude Code와 같은 네이티브 서브에이전트 시스템이 없습니다. 대신 다음 방법으로 유사한 기능을 구현할 수 있습니다.

## 접근 방식 비교

### Claude Code 서브에이전트

```markdown
# .claude/agents/writing-assistant.md

You are a specialized writing assistant for technical blog posts.

Your responsibilities:
1. Research topics using Web Researcher
2. Generate SEO-optimized content
3. Create multi-language versions
4. Manage images and metadata

[Detailed instructions...]
```

사용법:
```bash
@writing-assistant "Create a blog post about TypeScript"
```

### Gemini CLI 대안

**3가지 접근 방식**:

1. **커스텀 커맨드** (권장 - 간단한 에이전트)
2. **프롬프트 엔지니어링 + GEMINI.md** (권장 - 복잡한 에이전트)
3. **Extensions** (고급 - 재사용 가능한 에이전트)
4. **Isolated Agents** (고급 - 별도 Gemini CLI 인스턴스)

## 방법 1: 커스텀 커맨드로 변환 (권장)

### 개념

각 에이전트를 독립적인 커맨드로 변환.

**장점**:
- 간단하고 직관적
- Claude Code의 사용 패턴 유지
- 빠른 마이그레이션 가능

**단점**:
- 에이전트 간 상호작용 복잡
- 커맨드 수 증가

### 변환 예제: Writing Assistant

**Before (Claude Code)** - `.claude/agents/writing-assistant.md`:
```markdown
# Writing Assistant Agent

You are a specialized technical blog post writer.

Core responsibilities:
- Research topics using web search
- Generate SEO-optimized content
- Create multi-language versions (ko, ja, en, zh)
- Integrate with Image Generator for hero images
- Follow Content Collections schema

[500+ lines of detailed instructions]
```

**After (Gemini CLI)** - `.gemini/commands/write.toml`:
```toml
description = "Technical blog post writing assistant"
prompt = """
You are a specialized technical blog post writer.

Task: {{args}}

Core responsibilities:
1. Research topic (use web search with 2-second delays)
2. Generate SEO-optimized content
3. Create versions for: ko, ja, en, zh
4. Generate hero image
5. Follow Astro Content Collections schema

Detailed guidelines: see GEMINI.md "Blog Writing Guidelines"

Output:
- 4 markdown files (one per language)
- Hero image in src/assets/blog/
- Proper frontmatter with pubDate: 'YYYY-MM-DD'
"""
```

**사용법 비교**:
```bash
# Claude Code
@writing-assistant "Write about Next.js 15"

# Gemini CLI
/write "Write about Next.js 15"
```

### 변환 예제: SEO Optimizer

**Before** - `.claude/agents/seo-optimizer.md`

**After** - `.gemini/commands/optimize-seo.toml`:
```toml
description = "SEO optimization for blog posts"
prompt = """
You are an SEO optimization specialist.

Target: {{args}}

Tasks:
1. Analyze title and description lengths (see GEMINI.md for language-specific limits)
2. Check internal linking opportunities
3. Verify meta tags and Open Graph
4. Suggest keyword improvements
5. Review sitemap inclusion

Output SEO report with specific improvements.
"""
```

## 방법 2: GEMINI.md + 역할 정의 (복잡한 에이전트)

### 개념

에이전트의 역할과 가이드라인을 `GEMINI.md`에 정의하고, 필요 시 역할을 활성화.

**장점**:
- 에이전트 로직이 프로젝트 컨텍스트에 통합
- 별도 커맨드 불필요
- 컨텍스트 자동 로드

**단점**:
- 명시적 에이전트 호출 불가
- 역할 전환 수동 관리

### GEMINI.md 구조

```markdown
# Project: jangwook.net

[General instructions...]

## Agent Roles

### Writing Assistant
You can act as a Writing Assistant when asked to create blog posts.

Responsibilities:
- Research topics using web search
- Generate multi-language content
- Manage images and metadata
- Follow Content Collections schema

Activation keywords: "write post", "create article", "generate blog"

See: @.gemini/docs/writing-assistant-guide.md

### SEO Optimizer
You can act as an SEO Optimizer when asked to optimize content.

Responsibilities:
- Analyze SEO metrics
- Suggest improvements
- Check internal links
- Verify meta tags

Activation keywords: "optimize SEO", "check SEO", "improve SEO"

[Additional roles...]
```

### 사용법

```bash
# Gemini CLI 세션
> Act as Writing Assistant and create a blog post about "TypeScript 5.0"

# 또는
> I need SEO optimization for src/content/blog/ko/typescript-post.md
```

**Gemini가 GEMINI.md에서 해당 역할을 찾아 수행**

## 방법 3: Isolated Agents (고급)

### 개념

각 에이전트를 별도 Gemini CLI 인스턴스로 실행.

**참고**: [Multi-Agent System with Prompts](https://aipositive.substack.com/p/how-i-turned-gemini-cli-into-a-multi)

### 구현

`.gemini/commands/agents-run.toml`:
```toml
description = "Run specialized agent in isolated instance"
prompt = """
Launch an isolated Gemini CLI agent for: {{args}}

Extract agent name from args (e.g., "writing-assistant", "seo-optimizer")

Steps:
1. Create temp directory for agent
2. Copy agent-specific GEMINI.md from .gemini/agents/<name>.md
3. Launch new gemini-cli instance with:
   - Working directory: temp dir
   - Custom context: agent GEMINI.md
   - Isolated environment
4. Pass task to agent
5. Collect results
6. Cleanup temp directory

This creates true agent isolation with dedicated context.
"""
```

**Agent 정의** - `.gemini/agents/writing-assistant.md`:
```markdown
# Agent: Writing Assistant

You are a specialized writing assistant for technical blog posts.

[Full agent definition - can be as detailed as Claude Code agents]
```

**사용법**:
```bash
/agents-run writing-assistant "Create post about Next.js"
```

**장점**:
- 완전한 에이전트 격리
- Claude Code와 유사한 구조
- 복잡한 에이전트 지원

**단점**:
- 구현 복잡도 높음
- 성능 오버헤드
- 디버깅 어려움

## 방법 4: Extensions (재사용 가능한 에이전트)

### 개념

Gemini CLI Extensions로 에이전트를 패키징하여 재사용.

**참고**: [Gemini CLI Extensions](https://medium.com/google-cloud/gemini-cli-tutorial-series-77da7d494718)

### 구조

```
extensions/
└── writing-assistant/
    ├── extension.json
    ├── GEMINI.md
    └── tools/
        ├── research.js
        └── generate-image.js
```

**extension.json**:
```json
{
  "name": "writing-assistant",
  "version": "1.0.0",
  "description": "Technical blog post writing assistant",
  "context": "GEMINI.md",
  "tools": ["research", "generate-image"]
}
```

**설치 및 사용**:
```bash
# 설치
gemini-cli extension install ./extensions/writing-assistant

# 사용
gemini-cli --extension writing-assistant
> Create a blog post about TypeScript
```

**장점**:
- 완전한 재사용성
- 팀/커뮤니티 공유 가능
- 전문화된 도구 포함 가능

**단점**:
- 개발 비용 높음
- Extension API 학습 필요
- 배포 및 버전 관리 필요

## 권장 마이그레이션 전략

### 에이전트 복잡도별 전략

| 복잡도 | 에이전트 예시 | 권장 방법 |
|--------|---------------|-----------|
| **간단** | commit, format-code | 커스텀 커맨드 |
| **중간** | seo-optimizer, editor | 커스텀 커맨드 + GEMINI.md 참조 |
| **복잡** | writing-assistant, content-recommender | GEMINI.md 역할 정의 + 문서 |
| **매우 복잡** | 멀티에이전트 워크플로우 | Isolated Agents 또는 Extensions |

### 현재 프로젝트 적용

**17개 에이전트 분류**:

**간단 (커스텀 커맨드)**:
- [ ] prompt-engineer
- [ ] editor
- [ ] portfolio-curator

**중간 (커맨드 + GEMINI.md)**:
- [ ] seo-optimizer
- [ ] social-media-manager
- [ ] analytics-reporter
- [ ] backlink-manager
- [ ] image-generator

**복잡 (GEMINI.md 역할 정의)**:
- [ ] writing-assistant
- [ ] web-researcher
- [ ] content-recommender
- [ ] post-analyzer
- [ ] content-planner

**매우 복잡 (보류 또는 Extensions)**:
- [ ] site-manager (Astro 빌드, 배포, 성능 최적화)
- [ ] analytics (복잡한 GA 분석)
- [ ] improvement-tracker (장기 프로젝트 관리)
- [ ] learning-tracker (학습 목표 추적)

## 실전 변환 예제

### 예제 1: Web Researcher (복잡한 에이전트)

**Before (Claude Code)**:
```markdown
# Web Researcher Agent

You are a web research specialist using Brave Search MCP.

Core capabilities:
- Conduct comprehensive web research
- Verify technical information from official docs
- Identify trending topics and best practices
- Gather code examples from reliable sources

**CRITICAL**: Implement 2-second delay between search requests to avoid rate limiting.

[Detailed research methodology...]
[Search strategies...]
[Source validation criteria...]
```

**After (Gemini CLI)** - 하이브리드 접근:

**1) GEMINI.md에 역할 정의**:
```markdown
## Agent Roles

### Web Researcher
When conducting research, you act as a Web Research Specialist.

Core capabilities:
- Comprehensive web research using Brave Search
- Technical verification from official docs
- Trend identification
- Code example gathering

**CRITICAL**: 2-second delay between search requests.

Methodology: see @.gemini/docs/research-methodology.md
```

**2) 상세 문서** - `.gemini/docs/research-methodology.md`:
```markdown
# Web Research Methodology

[Claude Code 에이전트의 상세 내용]

## Search Strategies
...

## Source Validation
...

## Rate Limiting
- Brave Search: 2-second delay between requests
- Max: 1 request per 2 seconds
...
```

**3) 커맨드 (선택사항)** - `.gemini/commands/research.toml`:
```toml
description = "Conduct web research on a topic"
prompt = """
Act as Web Researcher.

Research topic: {{args}}

Use Brave Search MCP with 2-second delays.
Follow research methodology in GEMINI.md.

Output:
- Verified information from official sources
- Code examples
- Trending discussions
- Best practices

Format as structured research report.
"""
```

### 예제 2: Content Recommender (AI 기반 에이전트)

**Before (Claude Code)**:
```markdown
# Content Recommender Agent

You use Claude LLM's semantic understanding to generate content recommendations.

Process:
1. Analyze post content deeply
2. Identify semantic relationships
3. Calculate similarity scores
4. Generate multi-language recommendations

Algorithm: Semantic analysis (not TF-IDF)
Output: recommendations.json

[Complex recommendation logic...]
```

**After (Gemini CLI)** - GEMINI.md 통합:
```markdown
## Recommendation System (V3)

When generating recommendations, use semantic analysis.

Process:
1. Read post-metadata.json (lightweight)
2. Analyze:
   - Difficulty similarity (20%)
   - Category similarity (80% - cosine)
3. Select top 5 (score >= 0.3)
4. Generate multi-language reasoning
5. Write to frontmatter (all languages)

Details: @research/post-recommendation-v3/README.md

Command: /generate-recommendations
Script: node scripts/generate-recommendations-v3.js
```

**커맨드는 이미 존재** (`.gemini/commands/generate-recommendations.toml`)

## 에이전트 간 통신

### Claude Code 방식

```markdown
# Writing Assistant

Step 1: Delegate to Web Researcher
@web-researcher "Research TypeScript 5.0 features"

Step 2: Use research results to write
[Create blog post based on research]

Step 3: Delegate to Image Generator
@image-generator "Create hero image for TypeScript post"
```

**명시적 에이전트 호출 가능**

### Gemini CLI 대안

**방법 A: 순차 커맨드 실행**:
```bash
# 1. 리서치
/research "TypeScript 5.0 features"
# [결과 확인 및 복사]

# 2. 글 작성 (리서치 결과 붙여넣기)
/write "TypeScript 5.0" --research "[paste results]"

# 3. 이미지 생성
/generate-image "TypeScript 5.0 hero"
```

**방법 B: 통합 커맨드**:
```toml
# .gemini/commands/write-full.toml
prompt = """
Complete blog post creation: {{args}}

Workflow (execute sequentially):
1. Research (use web search with delays)
2. Write content (use research)
3. Generate image (based on content)
4. Save all outputs

Self-contained - no external agent calls needed.
"""
```

**방법 C: GEMINI.md 워크플로우**:
```markdown
## Blog Writing Workflow

When creating a blog post:

1. **Research Phase**:
   - Act as Web Researcher
   - Use Brave Search MCP
   - Gather information...

2. **Writing Phase**:
   - Act as Writing Assistant
   - Use research results
   - Generate multi-language content...

3. **Image Phase**:
   - Act as Image Generator
   - Create hero image
   - Save to assets...

Execute all phases automatically when asked to "write a blog post".
```

## 트러블슈팅

### 문제 1: 역할 전환이 명확하지 않음

**증상**: Gemini가 역할을 제대로 인식하지 못함

**해결**:
```markdown
# GEMINI.md에 명확한 트리거 추가

### Writing Assistant
**Activation keywords**: write post, create blog, generate article
**NOT triggered by**: edit, review, optimize
```

### 문제 2: 에이전트 간 컨텍스트 공유 어려움

**증상**: 이전 에이전트의 결과를 다음 에이전트가 모름

**해결**:
- 통합 커맨드 사용 (단일 워크플로우)
- 또는 `/memory add`로 컨텍스트 추가
- 또는 임시 파일에 중간 결과 저장

### 문제 3: 복잡한 멀티에이전트 워크플로우

**증상**: 5개 이상의 에이전트가 순차/병렬로 실행되어야 함

**해결**:
- Claude Code 계속 사용 (이 부분만)
- 또는 Isolated Agents 구현
- 또는 Extensions로 패키징

## 베스트 프랙티스

### 1. 에이전트 → 커맨드 변환 시

```toml
# 에이전트 이름을 커맨드 이름으로 사용
# .claude/agents/writing-assistant.md → .gemini/commands/write.toml
# @writing-assistant "..." → /write "..."
```

### 2. 역할 중심 GEMINI.md

```markdown
## Agent Roles

[각 역할을 섹션으로 정의]
- 명확한 트리거 키워드
- 핵심 책임 요약
- 상세 문서 링크
```

### 3. 문서 참조 활용

```markdown
# GEMINI.md
@.gemini/docs/writing-guide.md
@.gemini/docs/seo-guide.md
@.gemini/docs/research-methods.md

# 각 에이전트의 상세 가이드를 별도 파일로
```

### 4. 점진적 마이그레이션

1. 자주 사용하는 에이전트 먼저
2. 간단한 에이전트부터 시작
3. 복잡한 에이전트는 보류 (Claude Code 계속 사용)

## 참고 자료

- [Multi-Agent System with Prompts](https://aipositive.substack.com/p/how-i-turned-gemini-cli-into-a-multi)
- [Gemini CLI Extensions](https://medium.com/google-cloud/gemini-cli-tutorial-series-77da7d494718)
- [Advanced Gemini CLI - Isolated Agents](https://medium.com/google-cloud/advanced-gemini-cli-part-3-isolated-agents-b9dbab70eeff)

---

**다음 단계**: [완전한 마이그레이션 예제 →](./05-complete-example.md)
