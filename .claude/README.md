# .claude/ 디렉토리

**블로그 자동화를 위한 Claude Code 확장 시스템**

---

## 개요

`.claude/` 디렉토리는 17개 Agents, 4개 Skills, 7개 Commands로 구성된 고도로 정교한 블로그 자동화 시스템입니다. 메타데이터 우선 아키텍처를 통해 **연간 71% 비용 절감** ($5.72 → $1.65)과 **수동 작업 90% 이상 절감** (연 364시간)을 달성했습니다.

### 핵심 성과

- ✅ **60-70% 토큰 절감**: 메타데이터 우선 아키텍처
- ✅ **완전 자동화**: 리서치부터 빌드까지 8-Phase 워크플로우
- ✅ **다국어 지원**: ko/en/ja 동시 작성 및 현지화
- ✅ **LLM 기반 추천**: TF-IDF 대신 의미론적 분석
- ✅ **100% 베스트 프랙티스 준수**: 구현된 모든 요소

---

## 구조

```
.claude/
├── agents/          # 17개 전문 에이전트
├── skills/          # 4개 모듈형 기능 (자동 발견)
├── commands/        # 7개 사용자 워크플로우
├── guidelines/      # 가이드라인 문서
└── settings.local.json  # 로컬 설정
```

### 3-Tier 아키텍처

```
Commands (사용자 호출, /cmd)
    ↓ 워크플로우 오케스트레이션
Agents (전문 지식, @agent)
    ↓ Skills/Tools 사용
Skills (자동 발견)
    ↓ 모듈형 기능
Tools (파일 I/O, MCP)
```

---

## 빠른 시작

### 주요 Commands

#### 블로그 포스트 작성 (5-8분)

```bash
/write-post "주제" [--tags tag1,tag2] [--languages ko,ja,en]

# 예시
/write-post "Claude Code MCP 통합 가이드" --tags claude-code,mcp,automation
```

**생성 파일**: 7개
- 3개 포스트 (ko/ja/en)
- 1개 히어로 이미지
- 3개 메타데이터 파일

**워크플로우**: 8 Phases
1. Research (web-researcher)
2. Image (image-generator)
3. Writing (writing-assistant)
4. Frontmatter (blog-writing)
5. Metadata (post-analyzer)
6. Recommendations (V3)
7. Backlinks (backlink-manager)
8. Build (astro check)

---

#### 메타데이터 생성 (8-12초 신규, 2분 전체)

```bash
/analyze-posts [--force] [--post slug]

# 예시
/analyze-posts                    # 변경된 포스트만
/analyze-posts --force            # 전체 재생성
/analyze-posts --post my-slug     # 특정 포스트만
```

**출력**: `post-metadata.json`

**토큰 절감**: 60-70% (78K → 28K)

**비용 절감**: 한국어만 분석 (3배), 증분 처리 (79%)

---

#### 추천 생성 (2분)

```bash
/generate-recommendations [--force] [--threshold 0.3]

# 예시
/generate-recommendations                    # 증분 업데이트
/generate-recommendations --force            # 전체 재생성
/generate-recommendations --threshold 0.5    # 임계값 조정
```

**출력**: `recommendations.json` (V2) 또는 frontmatter (V3)

**알고리즘**: LLM 기반 의미론적 분석 (6차원)

---

#### 다음 주제 추천 (45-60초)

```bash
/next-post-recommendation [--count 10] [--category name]

# 예시
/next-post-recommendation                    # 10개 주제
/next-post-recommendation --count 20         # 20개 주제
/next-post-recommendation --category ai-ml   # 특정 카테고리
```

**출력**: `content-recommendations-{date}.md`

**캐싱**: 24시간, 58% 토큰 절감 (17K vs 40K+)

---

#### GA 분석 리포트 (3-5분)

```bash
/write-ga-post <YYYY-MM-DD> [--period weekly]

# 예시
/write-ga-post 2025-11-09
/write-ga-post 2025-11-09 --period monthly
```

**출력**: 3개 언어 GA 리포트 포스트

**통합**: improvement-tracker로 TODO 자동 생성

---

#### Git 커밋 (10초)

```bash
/commit
```

**기능**: staged changes 분석 → 커밋 메시지 자동 생성 → 커밋 실행

---

## Agents (17개)

### 콘텐츠 생성

- **content-planner**: 콘텐츠 전략 및 주제 계획
- **writing-assistant**: 블로그 포스트 작성 (다국어)
- **editor**: 문법, 스타일, 메타데이터 검토
- **image-generator**: Gemini API로 히어로 이미지 생성

### 연구 및 분석

- **web-researcher**: Brave Search MCP 활용 리서치 (2초 Rate Limit)
- **post-analyzer**: 메타데이터 추출
- **analytics**: 트래픽 분석 및 성과 측정
- **analytics-reporter**: GA4 데이터 기반 리포트 생성

### SEO 및 마케팅

- **seo-optimizer**: 사이트맵, 메타태그, 내부 링크
- **backlink-manager**: 백링크 전략 및 관리
- **social-media-manager**: 소셜 미디어 공유 자동화

### 콘텐츠 발견

- **content-recommender**: LLM 기반 의미론적 추천 (6차원)

### 운영 및 관리

- **site-manager**: Astro 빌드, 배포, 성능 최적화
- **portfolio-curator**: 프로젝트 포트폴리오 관리
- **learning-tracker**: 학습 목표 및 기술 트렌드 추적
- **improvement-tracker**: 지속적 개선 사항 추적

### 메타 최적화

- **prompt-engineer**: AI 프롬프트 최적화 (Verbalized Sampling)

**사용법**:

```bash
@agent-name "작업 설명"

# 예시
@web-researcher "Claude Code 2025년 최신 트렌드 조사"
@writing-assistant "TypeScript 고급 타입 가이드 작성"
```

---

## Skills (4개)

### blog-writing

**자동 발견**: "blog post", "frontmatter", "content" 키워드 감지 시

**기능**:
- Frontmatter 검증 (날짜, 필수 필드, 이미지)
- 언어별 SEO 최적화 (title/description 길이)
- Slug 자동 생성, pubDate 계산

**지원 파일**: 3개 Python 스크립트 + 3개 문서

---

### content-analyzer

**자동 발견**: "analyze", "metadata", "summary" 키워드 감지 시

**기능**:
- 메타데이터 추출 (summary, topics, techStack, difficulty, categoryScores)
- 60-70% 토큰 절감
- Content Hash 기반 증분 처리

---

### recommendation-generator

**자동 발견**: "recommend", "similar posts", "related content" 키워드 감지 시

**기능**:
- LLM 기반 의미론적 유사도 분석
- 6차원 평가 (topic 40%, techStack 25% 등)
- 다국어 추론 (ko/ja/en reason)

---

### trend-analyzer

**자동 발견**: "trend", "trending", "popular topics" 키워드 감지 시

**기능**:
- Brave Search MCP 통합 (2초 Rate Limit 준수)
- 3-Tier 캐싱 (24h/7d/48h)
- 58% 토큰 절감 (17K vs 40K+)

---

## 핵심 기술

### 1. 메타데이터 우선 아키텍처

**원리**:

```
전체 콘텐츠 분석 (90K 토큰)
    ↓ 1회만
메타데이터 추출 (post-metadata.json)
    ↓ 재사용
메타데이터 기반 처리 (30K 토큰)
```

**효과**: 60-70% 토큰 절감, 연간 $4.07 절감

---

### 2. LLM 기반 의미론적 추천

**TF-IDF vs Claude LLM**:

| 방식 | TF-IDF | Claude LLM |
|------|--------|------------|
| 분석 | 키워드 빈도 | 전체 의미 이해 |
| 유사도 | 코사인 | 의미론적 |
| 품질 | 낮음-중간 | 높음 |

**6차원 분석**: topic, techStack, difficulty, purpose, complementary, category

---

### 3. 캐싱 전략

**trend-analyzer**:

| 데이터 | 캐시 기간 | 파일 |
|--------|-----------|------|
| 트렌드 | 24시간 | .cache/trend-data.json |
| 기술 | 7일 | .cache/technology-data.json |
| 키워드 | 48시간 | .cache/keyword-data.json |

**효과**: 58% 토큰 절감

---

### 4. 증분 처리

**Content Hash 기반**:

```javascript
const currentHash = sha256(content);
if (existingHash === currentHash) {
  return existing; // 재사용
} else {
  return analyze(content); // 재분석
}
```

**효과**: 79% 토큰 절감 (변경 없을 때)

---

### 5. Verbalized Sampling

**적용 Agent**: image-generator, content-planner, prompt-engineer

**파라미터**: k=3-10, tau=0.05-0.20

**효과**: 1.5-2.1배 다양성 향상

---

## MCP 통합

### 사용 중인 MCP 서버

1. **Brave Search MCP**
   - 사용: web-researcher, trend-analyzer
   - 제약: 2초 Rate Limit 필수
   - 기능: web/news/video/image 검색

2. **Google Analytics 4 MCP**
   - 사용: analytics-reporter
   - Property ID: 395101361
   - 기능: 트래픽 분석, 성과 측정

3. **Context7 MCP**
   - 사용: web-researcher
   - 기능: 라이브러리 공식 문서 조회

4. **Gemini API**
   - 사용: image-generator
   - 환경 변수: GEMINI_API_KEY
   - 기능: AI 히어로 이미지 생성

---

## 데이터 파일

### post-metadata.json

**구조** (V3):

```json
{
  "post-slug": {
    "pubDate": "2025-11-09",
    "difficulty": 3,
    "categoryScores": {
      "automation": 0.9,
      "web-development": 0.3,
      "ai-ml": 0.85,
      "devops": 0.5,
      "architecture": 0.75
    }
  }
}
```

**용도**: analyze-posts 생성, generate-recommendations 사용

---

### recommendations.json (V2, 레거시)

**상태**: Deprecated (V3로 마이그레이션)

**V3**: frontmatter의 `relatedPosts` 배열로 대체

---

### relatedPosts in frontmatter (V3, 현재)

```yaml
---
relatedPosts:
  - slug: related-post
    score: 0.92
    reason:
      ko: "두 포스트 모두..."
      ja: "両記事とも..."
      en: "Both posts..."
---
```

**장점**: 62% 파일 크기 절감, 빌드 시 I/O 제거

---

## 워크플로우 예시

### 완전 자동화 블로그 작성

```bash
# 1. 주제 추천 (45-60초)
/next-post-recommendation --count 10

# 2. 포스트 작성 (5-8분)
/write-post "추천된 주제" --tags tag1,tag2

# 결과: 7개 파일 생성 (3 posts + 1 image + 3 metadata)
```

### 메타데이터 파이프라인

```bash
# 1. 메타데이터 생성 (2분, 1회만)
/analyze-posts

# 2. 추천 생성 (2분, 반복 사용)
/generate-recommendations

# 결과: post-metadata.json + recommendations.json
```

### GA 분석 자동화

```bash
# 1. GA 리포트 생성 (3-5분)
/write-ga-post 2025-11-09

# 결과: 3개 언어 리포트 + TODO 자동 생성
```

---

## 성능 지표

### 비용 효율성

| 항목 | Before | After | 절감 |
|------|--------|-------|------|
| **토큰 사용** | 90,000 | 30,000 | 60-70% |
| **연간 비용** | $5.72 | $1.65 | 71% ($4.07) |
| **처리 시간** | 15분 | 5-8분 | 47-53% |

### ROI

- **시간 절감**: 연 364시간 ($18,200 가치)
- **시스템 비용**: $10.65/년
- **순 이익**: $18,189
- **ROI**: 1,708배

---

## 베스트 프랙티스

### Commands 사용

✅ **Phase 기반 실행**: 명확한 단계 구분
✅ **Agent 위임**: 실제 작업은 Agent에게
✅ **검증 필수**: astro check, build 실행
✅ **에러 처리**: 문제 해결 가이드 제공

### Agent 호출

✅ **명확한 지시**: 구체적 작업 설명
✅ **협업 활용**: 다른 Agent 호출 가능
✅ **도구 제한**: allowed-tools 준수

### Skills 활용

✅ **자동 발견**: 명시적 호출 불필요
✅ **SKILL.md 필수**: YAML frontmatter
✅ **"Use when..." 포함**: 발견 트리거

---

## 중요 제약사항

### Brave Search MCP

⚠️ **필수**: 연속 API 호출 사이 2초 지연

```bash
brave_web_search "query 1"
sleep 2
brave_web_search "query 2"
```

**이유**: API 속도 제한 방지

---

### Gemini API

⚠️ **필수**: 환경 변수 `GEMINI_API_KEY`

```bash
# .env 파일에 추가
GEMINI_API_KEY=your_api_key_here
```

---

### Content Collections 스키마

⚠️ **필수**: frontmatter 형식 준수

```yaml
---
title: string (required)
description: string (required)
pubDate: 'YYYY-MM-DD' (required, single quotes)
heroImage: ../../../assets/blog/[image] (optional)
tags: array (optional)
---
```

---

## 문제 해결

### Command 실행 실패

**증상**: 파일 생성 안 됨

**해결**:
1. `npm run astro check` 실행
2. Content Collections 스키마 확인
3. 환경 변수 확인 (GEMINI_API_KEY)
4. 디렉토리 권한 확인

---

### Mermaid 렌더링 에러

**증상**: 다이어그램 표시 안 됨

**원인**:
- 노드 ID에 슬래시(`/`) 사용
- sequenceDiagram에서 `style` 사용

**해결**:
- 슬래시 제거 또는 다른 문자로 대체
- sequenceDiagram에서는 style 라인 제거

---

### 메타데이터 누락

**증상**: `/generate-recommendations` 실패

**해결**:
```bash
# 먼저 메타데이터 생성
/analyze-posts

# 그 다음 추천 생성
/generate-recommendations
```

**순서**: analyze-posts → generate-recommendations

---

## 참고 자료

### 프로젝트 문서

- **CLAUDE.md**: 프로젝트 전체 가이드
- **research/my-project-251109/**: 심층 분석 결과 (9개 문서)
  - SUMMARY.md: Executive Summary
  - EVALUATION.md: 종합 평가 (8.98/10, A등급)

### 공식 문서

- [Claude Code Skills](https://code.claude.com/docs/en/skills)
- [Claude Code Best Practices](https://www.anthropic.com/engineering/claude-code-best-practices)
- [Agent Skills Overview](https://docs.claude.com/en/docs/agents-and-tools/agent-skills/overview)

### 블로그 포스트

- Part 1: [메타데이터로 71% 비용 절감](/blog/ko/effiflow-automation-analysis-part1)
- Part 2: [Skills 자동 발견과 58% 토큰 절감](/blog/ko/effiflow-automation-analysis-part2)
- Part 3: 실전 개선 사례 및 ROI 분석 (예정)

---

## 개선 이력

### 2025-11-09

**개선 1**: 빈 Skills 디렉토리 제거
- 제거: blog-automation, content-analysis, git-automation, web-automation
- 효과: 코드베이스 정리, 혼란 제거
- 소요 시간: 5분

**개선 2**: .claude/README.md 작성 (현재 문서)
- 전체 개요, 빠른 시작, 베스트 프랙티스
- 효과: 신규 사용자 온보딩 개선
- 소요 시간: 30분

---

**마지막 업데이트**: 2025-11-09
**버전**: 1.0
**상태**: Active
