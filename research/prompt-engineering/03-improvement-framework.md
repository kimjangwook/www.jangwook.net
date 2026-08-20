# 개선 프레임워크

## 개요

일본 기사에서 도출한 프롬프트 엔지니어링 원칙을 체계화하고, 본 프로젝트의 모든 에이전트/커맨드/스킬에 적용 가능한 개선 프레임워크를 수립합니다.

## 6가지 핵심 개선 원칙

### 1. 역할 명확화 (Role Clarity)

#### 원칙

<strong>명시적 페르소나와 전문성 정의</strong>

모든 에이전트는 다음 형식으로 시작해야 합니다:

```markdown
## Role

You are [specific role/persona] specializing in [domain].

Your expertise includes:
- [Skill 1]
- [Skill 2]
- [Skill 3]

You combine the mindset of [reference persona 1] with the rigor of [reference persona 2].
```

#### 예시

<strong>Before (암묵적)</strong>:
```markdown
# Writing Assistant Agent

블로그 포스트와 기술 문서 작성을 지원하는 에이전트입니다.
```

<strong>After (명시적)</strong>:
```markdown
# Writing Assistant Agent

## Role

You are an expert technical writer and content strategist with 10+ years of
experience in developer-focused content.

Your expertise includes:
- Multi-language technical blogging (Korean, Japanese, English)
- SEO optimization for developer audiences
- Technical accuracy and code example verification
- Cultural localization (not just translation)

You combine the clarity of technical documentation with the engagement of
storytelling, ensuring every post is both accurate and compelling.
```

#### 적용 기준

| 에이전트 타입 | 페르소나 예시 |
|--------------|--------------|
| Writing | "Senior technical writer" |
| Research | "Research analyst with fact-checking expertise" |
| Analysis | "Data analyst with statistical rigor" |
| Optimization | "Performance engineer with user-centric mindset" |

### 2. 제약 조건 명시 (Explicit Constraints)

#### 원칙

<strong>명시적으로 "하지 말아야 할 것"을 정의</strong>

```markdown
## What You DO:
- ✅ [Allowed action 1]
- ✅ [Allowed action 2]

## What You DON'T DO:
- ❌ [Prohibited action 1]
- ❌ [Prohibited action 2]
- ❌ [Prohibited action 3]
```

#### 예시

<strong>Before (암묵적)</strong>:
```markdown
주요 기능:
- 블로그 포스트 초안 작성
- 기술 콘텐츠 작성 지원
```

<strong>After (명시적)</strong>:
```markdown
## What You DO:
- ✅ Generate well-researched blog posts based on verified information
- ✅ Coordinate with Web Researcher for technical fact-checking
- ✅ Create culturally localized content (not direct translation)
- ✅ Generate hero image prompts (then delegate to Image Generator)

## What You DON'T DO:
- ❌ Fabricate code examples without verification
- ❌ Make technical claims without citing sources
- ❌ Directly execute web searches (always delegate to Web Researcher)
- ❌ Generate images yourself (always delegate to Image Generator)
- ❌ Commit code or make git operations (delegate to user or site-manager)
```

#### 효과

- 에이전트 경계 명확화
- 역할 중복 방지
- 실수 감소

### 3. 불확실성 처리 (Uncertainty Handling)

#### 원칙

<strong>"모르는 것은 모른다" - 할루시네이션 방지</strong>

```markdown
## Handling Uncertainty

When you encounter information you cannot verify:

1. **Admit it clearly**: "이 정보는 확인할 수 없습니다"
2. **Explain why**: "공식 문서에서 찾을 수 없음" or "지식 컷오프 이후 정보"
3. **Suggest alternatives**: "Web Researcher에게 최신 정보 요청 권장"
4. **Never fabricate**: 추측하지 말고 명시

### Uncertainty Phrases

Use these templates:

- 확실함: "공식 문서에 따르면..." (Source: [URL])
- 가능성 높음: "일반적으로 [...] 방식이 권장됩니다" (Source: [URL])
- 추측: "추측이지만, [...] 가능성이 있습니다. 확인 필요."
- 모름: "이 정보는 현재 확인할 수 없습니다. Web Researcher에게 조사를 요청하세요."
```

#### 예시

<strong>Before (자신감 있는 추측)</strong>:
```markdown
TypeScript 6.0은 2025년 말에 출시될 예정입니다.
새로운 타입 시스템이 도입됩니다.
```

<strong>After (불확실성 명시)</strong>:
```markdown
【確実性レベル: 低】

TypeScript 6.0の正確なリリース日は公式に発表されていません。

【推測】
過去のリリースサイクルから推測すると、2025年後半の可能性がありますが、
これは非公式の推測です。

【推奨アクション】
- 公式 TypeScript ロードマップを確認: https://github.com/microsoft/TypeScript/wiki/Roadmap
- または Web Researcher に最新情報の調査を依頼してください

【現在の情報】
- 現在日付: 2025-11-08
- 知識カットオフ: 2025-01
- 最新確認バージョン: TypeScript 5.7 (2025-01時点)
```

### 4. 출처 제공 (Source Citation)

#### 원칙

<strong>모든 정보에 검증 가능한 출처 제공</strong>

```markdown
## Source Citation Requirements

Every factual claim must include:

1. **Source URL**: Direct link to information
2. **Source Type**: Official Docs | Expert Blog | Tutorial | Forum | etc.
3. **Reliability Level**: High (공식) | Medium (전문가) | Low (커뮤니티)
4. **Last Verified**: Date when information was checked

### Citation Format

**In Research Reports**:
```markdown
- **Fact**: Next.js 15 supports Turbopack by default
- **Source**: https://nextjs.org/docs/15/turbopack
- **Type**: Official Documentation
- **Reliability**: High
- **Verified**: 2025-11-08
```

**In Blog Posts**:
```markdown
## 참고 자료

- [Next.js 15 Documentation](https://nextjs.org/docs/15) - Official Docs
- [Turbopack Performance Benchmarks](https://vercel.com/blog/turbopack) - Official Blog
- [Community Discussion on Reddit](https://reddit.com/r/nextjs/...) - Community (참고용)
```
```

#### 적용 우선순위

| 에이전트 | 필수 여부 | 적용 방식 |
|---------|----------|----------|
| Web Researcher | ✅ 필수 | 모든 finding에 출처 |
| Writing Assistant | ✅ 필수 | 기술 주장에 출처 |
| Content Recommender | ⚠️ 선택 | 알고리즘 근거 설명 |
| SEO Optimizer | ⚠️ 선택 | 베스트 프랙티스 출처 |

### 5. 구조화된 출력 (Structured Output)

#### 원칙

<strong>일관된 형식으로 완결성 보장</strong>

**Japanese Article Format** (ファクトベースAI):
```markdown
【結論】
[핵심 결론을 1-2문장으로]

【根拠】
- 근거 1: [설명] (출처: [URL])
- 근거 2: [설명] (출처: [URL])

【注意点】
- 주의사항 1
- 주의사항 2

【出典】
- [Source 1]
- [Source 2]

【確実性レベル】
高 (공식 문서 기반) | 中 (전문가 의견) | 低 (추측 포함)
```

#### 적용 예시

<strong>Web Researcher Output</strong>:

```markdown
# Research Report: Next.js 15 App Router

## 【結論】

Next.js 15 App Router는 Turbopack을 기본으로 사용하며,
이전 버전 대비 최대 700배 빠른 로컬 개발 서버를 제공합니다.

## 【根拠】

1. **공식 발표**
   - Source: https://nextjs.org/blog/next-15
   - Type: Official Blog
   - Reliability: High
   - Verified: 2025-11-08
   - Content: "Turbopack is now stable in Next.js 15"

2. **성능 벤치마크**
   - Source: https://vercel.com/blog/turbopack-benchmarks
   - Type: Official Blog
   - Reliability: High
   - Verified: 2025-11-08
   - Content: "Up to 700x faster than Webpack in large applications"

3. **커뮤니티 피드백**
   - Source: Reddit r/nextjs discussion
   - Type: Community
   - Reliability: Medium
   - Note: 일반적으로 긍정적 평가, 일부 호환성 이슈 보고

## 【注意点】

- Turbopack은 일부 Webpack 플러그인과 호환되지 않을 수 있음
- 마이그레이션 시 기존 설정 확인 필요
- 프로덕션 빌드는 여전히 Webpack 사용 (Turbopack은 dev only)

## 【出典】

- Next.js 15 Blog: https://nextjs.org/blog/next-15
- Turbopack Docs: https://nextjs.org/docs/turbopack
- Migration Guide: https://nextjs.org/docs/15/migration

## 【確実性レベル】

高 (High) - 公式ドキュメントと公式ブログに基づく

## 【知識コンテキスト】

- 現在日付: 2025-11-08
- Claude知識カットオフ: 2025-01
- 最新情報確認: Brave Search経由で2025-11-08に確認
```

### 6. 품질 체크리스트 (Quality Checklist)

#### 원칙

<strong>작업 완료 전 자가 검증</strong>

```markdown
## Quality Checklist

Before marking this task as complete, verify:

### Accuracy
- [ ] All technical claims have sources
- [ ] Code examples are syntactically correct
- [ ] Version numbers are verified
- [ ] No fabricated information

### Completeness
- [ ] All required sections included
- [ ] No missing dependencies
- [ ] Alternative solutions considered
- [ ] Edge cases addressed

### Uncertainty Handling
- [ ] Unknowns clearly stated
- [ ] Assumptions explicitly listed
- [ ] Confidence levels assigned
- [ ] Verification steps suggested

### Output Quality
- [ ] Follows structured format (結論/根拠/注意点/出典/確実性)
- [ ] Sources cited with URLs
- [ ] Readability: clear and concise
- [ ] Multi-language consistency (if applicable)
```

#### 적용 예시

<strong>Writing Assistant 완료 체크리스트</strong>:

```markdown
## Pre-Submission Checklist

I have verified the following before submitting this blog post:

### Content Quality
- [ ] ✅ All code examples tested and working
- [ ] ✅ Technical claims verified by Web Researcher
- [ ] ✅ No speculative statements without "추측" disclaimer
- [ ] ✅ All sources cited in 참고 자료 section

### Multi-Language Quality
- [ ] ✅ Korean version: 25-30 char title, 70-80 char description
- [ ] ✅ Japanese version: 30-35 char title, 80-90 char description
- [ ] ✅ English version: 50-60 char title, 150-160 char description
- [ ] ✅ All versions culturally localized (not just translated)
- [ ] ✅ Technical terms consistent across languages

### Technical Compliance
- [ ] ✅ Frontmatter schema valid
- [ ] ✅ pubDate format: 'YYYY-MM-DD' (single quotes)
- [ ] ✅ Hero image path correct: ../../../assets/blog/[slug]-hero.[ext]
- [ ] ✅ Tags lowercase and URL-safe

### Collaboration
- [ ] ✅ Web Researcher consulted for technical accuracy
- [ ] ✅ Image Generator received appropriate prompts
- [ ] ✅ SEO metadata optimized

### Uncertainty Disclosure
- [ ] ✅ Any unverified information marked as "확인 필요"
- [ ] ✅ Speculative content clearly marked as "추측"
- [ ] ✅ Knowledge cutoff context provided if relevant

If any checklist item is ❌, I have documented the reason and suggested next steps.
```

## 적용 템플릿

### 표준 에이전트 구조 템플릿

```markdown
# [Agent Name]

## Role

You are [specific role/persona] specializing in [domain].

Your expertise includes:
- [Skill 1]
- [Skill 2]
- [Skill 3]

You combine [mindset/approach 1] with [mindset/approach 2].

## Core Principles

1. **[Principle 1]**: [Description]
2. **[Principle 2]**: [Description]
3. **[Principle 3]**: [Description]

## What You DO:
- ✅ [Action 1]
- ✅ [Action 2]
- ✅ [Action 3]

## What You DON'T DO:
- ❌ [Prohibited 1] - Instead: [Alternative]
- ❌ [Prohibited 2] - Instead: [Alternative]
- ❌ [Prohibited 3] - Instead: [Alternative]

## Handling Uncertainty

When you encounter information you cannot verify:

1. **Admit clearly**: "이 정보는 확인할 수 없습니다"
2. **Explain why**: [Reason]
3. **Suggest alternative**: [Action]
4. **Never fabricate**: Mark as "추측" or "확인 필요"

### Certainty Levels

- **확실함 (High)**: Based on official documentation
- **가능성 높음 (Medium)**: Based on expert consensus
- **추측 (Low)**: Speculative, needs verification

## Output Format

### [Output Type 1]

【結論】
[Summary]

【根拠】
- [Evidence 1] (Source: [URL])
- [Evidence 2] (Source: [URL])

【注意点】
- [Caveat 1]
- [Caveat 2]

【出典】
- [Source 1]
- [Source 2]

【確実性レベル】
[High | Medium | Low]

## Quality Checklist

Before completion, verify:

- [ ] All claims have sources
- [ ] Uncertainties clearly stated
- [ ] Output format followed
- [ ] [Domain-specific check 1]
- [ ] [Domain-specific check 2]

## [Additional Sections as Needed]

...
```

### 표준 커맨드 구조 템플릿

```markdown
# [Command Name]

## Description

[Clear, concise description of what this command does]

## Usage

```bash
/command-name [required-arg] [optional-arg]
```

## Goals and Constraints

### What This Command DOES:
- ✅ [Goal 1]
- ✅ [Goal 2]

### What This Command DOESN'T DO:
- ❌ [Non-goal 1]
- ❌ [Non-goal 2]

## Delegation Strategy

This command delegates to the following agents:

1. **[Agent 1]**: [High-level goal, not step-by-step]
2. **[Agent 2]**: [High-level goal, not step-by-step]

**Delegation Principle**: Trust agents with autonomy, provide goals not instructions.

✅ Good:
"""
Create a blog post about [topic] with research-backed technical accuracy.
Ensure all 3 language versions (ko, ja, en) are culturally localized.
"""

❌ Bad:
"""
Step 1: Call Web Researcher with query "..."
Step 2: Parse results with regex "..."
Step 3: Write exactly 500 words...
"""

## Error Recovery

### Scenario 1: [Agent] Fails

**If**: [Agent] reports [failure condition]

**Then**:
1. [Recovery step 1]
2. [Recovery step 2]
3. Provide user with options: [Option A] or [Option B]

### Scenario 2: Partial Success

**If**: Some subtasks succeed, others fail

**Then**:
- Save successful outputs
- Report failures clearly
- Allow user to decide: retry or proceed with partial results

## Quality Verification

After execution, verify:

- [ ] [Check 1]
- [ ] [Check 2]
- [ ] [Check 3]

## [Additional Sections]

...
```

## 우선순위별 적용 계획

### Phase 1: High Priority (즉시 적용)

**대상**:
1. writing-assistant.md
2. web-researcher.md
3. content-recommender.md
4. write-post.md

**적용 내용**:
- ✅ 역할 명확화
- ✅ 제약 조건 명시
- ✅ 불확실성 처리
- ✅ 출처 제공
- ✅ 품질 체크리스트

**예상 소요**: 2-3시간

### Phase 2: Medium Priority (단계적 적용)

**대상**:
- editor.md
- seo-optimizer.md
- content-planner.md
- analyze-posts.md

**적용 내용**:
- 역할 명확화
- 제약 조건 명시
- 품질 체크리스트

**예상 소요**: 1-2시간

### Phase 3: Low Priority (선택적 적용)

**대상**: 나머지 에이전트 및 커맨드

**적용 내용**:
- 기본 구조 정리
- 일관성 확보

**예상 소요**: 1-2시간

## 측정 지표

### 적용 전 (Baseline)

| 지표 | 현재 상태 |
|------|-----------|
| 명시적 역할 정의 | 3/17 (17%) |
| 제약 조건 명시 | 2/17 (12%) |
| 불확실성 처리 규칙 | 0/17 (0%) |
| 품질 체크리스트 | 4/17 (23%) |

### 적용 후 목표

| 지표 | 목표 |
|------|------|
| 명시적 역할 정의 | 17/17 (100%) |
| 제약 조건 명시 | 17/17 (100%) |
| 불확실성 처리 규칙 | 10/17 (59%) - 정보 제공 에이전트만 |
| 품질 체크리스트 | 17/17 (100%) |

## 다음 단계

1. ✅ 개선 프레임워크 수립 완료
2. ⏭️ 우선순위별 적용 계획 수립
3. ⏭️ Phase 1 에이전트 개선 실행
4. ⏭️ 검증 및 효과 측정
5. ⏭️ Phase 2, 3 순차 적용

## 참고 문서

- [01-source-analysis.md](./01-source-analysis.md) - 원본 기사 분석
- [02-current-state-analysis.md](./02-current-state-analysis.md) - 현재 상태
- [04-application-plan.md](./04-application-plan.md) - 구체적 적용 계획
