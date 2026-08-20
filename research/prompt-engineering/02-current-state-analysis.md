# 현재 상태 분석

## 개요

`.claude/` 디렉토리의 모든 에이전트, 커맨드, 스킬의 현재 프롬프트 구조를 분석하고, 개선이 필요한 영역을 식별합니다.

## 디렉토리 구조

```
.claude/
├── agents/          # 17개 에이전트
├── commands/        # 7개 커맨드
├── guidelines/      # 가이드라인
└── skills/          # 4개 스킬
```

## 에이전트 분석 (17개)

### 1. writing-assistant.md

<strong>현재 상태</strong>:
- 길이: 547줄
- 구조: 역할, 기능, 도구, 예시, 가이드라인
- 특징: Verbalized Sampling 등 고급 기법 포함

<strong>강점</strong>:
- ✅ 상세한 사용 예시
- ✅ 다국어 지원 명확
- ✅ 이미지 협업 워크플로우
- ✅ Mermaid 다이어그램 가이드

<strong>개선 필요</strong>:
- ❌ **역할 명확성 부족**: "You are X" 형식 없음
- ❌ **제약 조건 불충분**: 금지 사항 불명확
- ❌ **불확실성 처리 없음**: 모르는 것 처리 방법 없음
- ❌ **품질 체크리스트 없음**: 자가 검증 메커니즘 부재

<strong>개선 제안</strong>:

```markdown
# Writing Assistant Agent

## Role

You are an expert technical writer and content strategist specializing in
multi-language developer blog posts. Your expertise includes:
- Technical accuracy and clarity
- SEO optimization
- Multi-cultural content localization
- Developer-focused storytelling

## Core Principles

1. **Accuracy First**: Never fabricate technical details
2. **Cite Sources**: All technical claims must be verifiable
3. **Admit Uncertainty**: If unsure, state "추가 확인 필요" and delegate to Web Researcher
4. **Multi-language Excellence**: Each language version is localized, not translated

## What You DO:
- ✅ Generate well-researched blog posts
- ✅ Coordinate with Web Researcher for technical accuracy
- ✅ Create language-specific content (ko, ja, en)
- ✅ Generate hero image prompts
- ✅ Ensure SEO optimization

## What You DON'T DO:
- ❌ Fabricate code examples without verification
- ❌ Make claims without sources
- ❌ Directly execute web searches (delegate to Web Researcher)
- ❌ Generate images (delegate to Image Generator)

## Quality Checklist (Before Completion)

Before submitting any blog post, verify:
- [ ] All code examples are syntactically correct
- [ ] Technical claims have sources (from Web Researcher)
- [ ] All 3 language versions created (ko, ja, en)
- [ ] SEO metadata optimized (title, description)
- [ ] Hero image generated and referenced
- [ ] pubDate follows 'YYYY-MM-DD' format with single quotes
- [ ] Frontmatter schema compliance verified
```

### 2. web-researcher.md

<strong>현재 상태</strong>:
- 길이: 448줄
- 구조: Role, Responsibilities, Tools, Workflow, Best Practices
- 특징: Brave Search MCP 통합, 2초 delay 규칙

<strong>강점</strong>:
- ✅ 역할 명확 ("You are a specialized research agent")
- ✅ 구조화된 워크플로우
- ✅ Rate limiting 처리 (sleep 2)
- ✅ 출처 신뢰도 평가 기준

<strong>개선 필요</strong>:
- ❌ **불확실성 명시 부족**: 정보를 찾지 못한 경우 처리 불명확
- ❌ **확실성 레벨 없음**: 정보의 신뢰도 표시 부재
- ❌ **현재 날짜 명기 없음**: 지식 컷오프 맥락 부족

<strong>개선 제안</strong>:

```markdown
## Research Report Format (Enhanced)

### Executive Summary
[2-3 sentence overview]

### Key Findings

#### 1. [Topic Area]
- **Fact**: [Verified information]
- **Source**: [URL]
- **Reliability**: Official Docs (High) | Expert Blog (Medium) | Tutorial (Medium) | Forum (Low)
- **Certainty Level**: 확실 | 가능성 높음 | 추측
- **Last Verified**: 2025-11-08

### Uncertainty Notice

If information could not be verified:

【情報不足】
以下の項目については信頼できる情報源を見つけられませんでした:
- [Item 1]: 公式文書なし、代替として[source]を参照
- [Item 2]: 情報が古い可能性あり(最終更新: 2023-05)

推奨アクション: [Manual verification needed / Check official docs / etc.]

### Knowledge Cutoff Context

現在日付: 2025-11-08
Claude知識カットオフ: 2025-01

2025-01以降の情報はBrave Searchから取得しています。
```

### 3. content-recommender.md

<strong>현재 상태</strong>:
- 길이: 304줄
- 구조: Mission, Capabilities, Framework, Output Format
- 특징: 다차원 분석, 시간적 제약 처리

<strong>강점</strong>:
- ✅ 명확한 분석 프레임워크
- ✅ 시간적 일관성 처리
- ✅ 다국어 이유 제공
- ✅ 상세한 예시

<strong>개선 필요</strong>:
- ❌ **불확실성 표현 없음**: 추천 확신도 표시 부재
- ❌ **에러 처리 부족**: 후보가 없는 경우 명확한 메시지 없음

<strong>개선 제안</strong>:

```markdown
## Recommendation Output (Enhanced)

{
  "slug": "claude-code-web-automation",
  "score": 0.92,
  "certainty": "high",  // high (0.8+), medium (0.5-0.8), low (0.3-0.5)
  "reason": {
    "ko": "두 글 모두 MCP 서버를 활용...",
    "ja": "両記事ともMCPサーバー...",
    "en": "Both posts cover MCP..."
  },
  "type": "similar-topic",
  "dimensions": { ... }
}

## Edge Case Handling

### No Candidates Available

If temporal filtering results in 0 candidates:

```json
{
  "sourceSlug": "first-blog-post",
  "recommendations": [],
  "reason": {
    "ko": "이 글은 블로그의 첫 번째 포스트로, 시간적으로 이전 포스트가 없어 추천할 글이 없습니다.",
    "ja": "この記事はブログの最初の投稿であり、時間的に以前の投稿がないため推奨記事がありません。",
    "en": "This is the first blog post, so no temporally valid recommendations are available."
  }
}
```
```

### 4. seo-optimizer.md

**분석 필요** (파일 읽기 필요)

### 5. editor.md

**분석 필요** (파일 읽기 필요)

### 6-17. 기타 에이전트들

**분석 필요** (전체 에이전트 목록 확인 후 우선순위별 분석)

## 커맨드 분석 (7개)

### 1. write-post.md

<strong>현재 상태</strong>:
- 길이: 1081줄
- 구조: Description, Usage, Workflow, Guidelines
- 특징: 매우 상세한 워크플로우, V3 시스템 통합

<strong>강점</strong>:
- ✅ 단계별 워크플로우 명확
- ✅ 에러 처리 섹션
- ✅ 품질 체크 섹션
- ✅ 다국어 처리 명확

<strong>개선 필요</strong>:
- ❌ **에이전트에게 너무 구체적 지시**: 자율성 제한
- ❌ **실패 시나리오 부족**: 각 단계 실패 시 대응 불명확

<strong>개선 제안</strong>:

```markdown
## Delegation to Writing Assistant (Enhanced)

### High-Level Task Assignment

**DO**: Provide clear goals and constraints
**DON'T**: Micromanage implementation details

✅ Good:
"""
Create a blog post about [topic].

Requirements:
- Research accuracy (delegate to Web Researcher)
- 3 language versions (ko, ja, en)
- SEO optimized
- Hero image included

Quality Standards:
- All code examples must compile
- Technical claims must have sources
- Frontmatter schema compliant

If you encounter issues:
- Unable to verify technical details → Report back
- Image generation fails → Use placeholder and notify
- Research incomplete → Specify what's missing
"""

❌ Bad:
"""
Step 1: Call Web Researcher with these exact queries...
Step 2: Parse the results and extract...
Step 3: Write exactly 500 words...
"""

## Error Recovery

### Phase 1: Research Failure

If Web Researcher cannot find sufficient information:

**Agent Should**:
1. Report what was found and what's missing
2. Suggest alternative approaches
3. Ask for user decision: proceed with partial info or abort?

**Command Should**:
- Not fail immediately
- Provide user with options
- Log partial results

### Phase 2: Image Generation Failure

**Fallback**:
1. Use placeholder image path
2. Notify user in summary
3. Continue with post creation

### Phase 3: Multi-language Generation Failure

If one language fails:
1. Complete other languages
2. Report which language failed and why
3. Provide partial success output
```

## 스킬 분석 (4개)

### blog-writing 스킬

**분석 필요** (내부 파일 확인)

### content-analyzer 스킬

**분석 필요**

### recommendation-generator 스킬

**분석 필요**

### trend-analyzer 스킬

**분석 필요**

## 공통 패턴 분석

### 현재 프롬프트의 강점

1. **상세한 설명**: 대부분의 파일이 역할과 기능을 자세히 설명
2. **구조화**: Markdown 형식으로 잘 정리됨
3. **예시 풍부**: 사용 예시가 많음
4. **워크플로우 명확**: 단계별 프로세스가 상세함

### 공통 개선 필요 영역

| 영역 | 현재 상태 | 개선 방향 |
|------|-----------|-----------|
| **역할 명확성** | 대부분 암묵적 | "You are X who..." 형식 추가 |
| **제약 조건** | 일부만 명시 | "What you DON'T do" 섹션 추가 |
| **불확실성** | 처리 없음 | "Admit when you don't know" 규칙 |
| **출처 제공** | 일부만 요구 | 모든 정보에 출처 필수 |
| **확실성 레벨** | 없음 | High/Medium/Low certainty 추가 |
| **품질 체크** | 일부만 존재 | 모든 에이전트에 체크리스트 |
| **에러 처리** | 불충분 | 실패 시나리오 및 복구 전략 |

## 우선순위 분류

### High Priority (즉시 개선 필요)

**에이전트**:
1. writing-assistant.md - 핵심 에이전트, 품질 직접 영향
2. web-researcher.md - 정보 정확성의 기반
3. content-recommender.md - 사용자 경험 직접 영향

**커맨드**:
1. write-post.md - 가장 자주 사용
2. generate-recommendations.md - 중요한 기능

### Medium Priority (단계적 개선)

**에이전트**:
- editor.md
- seo-optimizer.md
- content-planner.md

**커맨드**:
- analyze-posts.md
- write-ga-post.md

### Low Priority (선택적 개선)

**에이전트**:
- social-media-manager.md
- portfolio-curator.md
- learning-tracker.md

**커맨드**:
- commit.md

## 측정 가능한 개선 지표

### 정량적 지표

1. **명시적 역할 정의 비율**: 17개 에이전트 중 몇 개가 "You are X" 형식?
   - 현재: ~3/17 (17%)
   - 목표: 17/17 (100%)

2. **제약 조건 명시 비율**: "What you DON'T do" 섹션 존재?
   - 현재: ~2/17 (12%)
   - 목표: 17/17 (100%)

3. **품질 체크리스트 비율**:
   - 현재: ~4/17 (23%)
   - 목표: 17/17 (100%)

4. **불확실성 처리 규칙 비율**:
   - 현재: 0/17 (0%)
   - 목표: 10/17 (59% - 정보 제공 에이전트)

### 정성적 지표

1. **명확성**: 사용자가 에이전트 역할을 즉시 이해 가능한가?
2. **신뢰성**: 에이전트가 불확실한 정보를 명시하는가?
3. **검증 가능성**: 제공된 정보를 추적 가능한가?
4. **일관성**: 모든 에이전트가 유사한 구조를 따르는가?

## 다음 단계

1. ✅ 원본 기사 분석 완료
2. ✅ 현재 상태 분석 완료
3. ⏭️ 개선 프레임워크 수립
4. ⏭️ 적용 계획 수립
5. ⏭️ 단계적 구현
6. ⏭️ 검증 및 측정

## 참고

- 전체 에이전트 목록은 `.claude/agents/` 참조
- 전체 커맨드 목록은 `.claude/commands/` 참조
- 스킬 상세는 `.claude/skills/` 참조
