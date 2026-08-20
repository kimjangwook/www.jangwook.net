# .gemini/ 디렉토리

**블로그 자동화를 위한 Gemini CLI 확장 시스템**

---

## 개요

`.gemini/` 디렉토리는 17개 Agents, 4개 Skills, 7개 Commands로 구성된 고도로 정교한 블로그 자동화 시스템입니다. 메타데이터 우선 아키텍처를 통해 **연간 71% 비용 절감** ($5.72 → $1.65)과 **수동 작업 90% 이상 절감** (연 364시간)을 달성했습니다.

이 문서는 Gemini CLI가 프로젝트를 이해하고 작업을 수행하기 위한 핵심 가이드입니다.

### 핵심 성과

- ✅ **60-70% 토큰 절감**: 메타데이터 우선 아키텍처
- ✅ **완전 자동화**: 리서치부터 빌드까지 8-Phase 워크플로우
- ✅ **다국어 지원**: ko/en/ja 동시 작성 및 현지화
- ✅ **LLM 기반 추천**: TF-IDF 대신 의미론적 분석
- ✅ **100% 베스트 프랙티스 준수**: 구현된 모든 요소

---

## 구조

```
.gemini/
├── GEMINI.md        # 프로젝트 전체 가이드 (이 문서)
├── commands/        # 사용자 워크플로우 정의 (TOML)
├── agents/          # 17개 전문 에이전트 정의 (Markdown, 참조용)
├── skills/          # 4개 모듈형 기능 (자동 발견)
├── instructions/    # 명령어별 상세 지침
├── guidelines/      # 가이드라인 문서
├── security/        # 보안 가이드라인
└── settings.json    # 로컬 설정
```

### 아키텍처

```
Commands (/cmd, TOML 정의)
    ↓ 워크플로우 오케스트레이션 (Instructions 참조)
Agents (전문 지식, @{agents/...})
    ↓ Skills/Tools 사용
Skills (자동 발견)
    ↓ 모듈형 기능
Tools (파일 I/O, MCP)
```

---

## 빠른 시작

### 주요 Commands

사용자는 슬래시 커맨드(`/`)를 통해 정의된 워크플로우를 실행할 수 있습니다.

#### 블로그 포스트 작성 (5-8분)

```bash
/write-post "주제" --tags tag1,tag2 --languages ko,ja,en

# 예시
/write-post "Gemini CLI 통합 가이드" --tags gemini-cli,mcp,automation
```

**생성 파일**: 7개
- 3개 포스트 (ko/ja/en)
- 1개 히어로 이미지
- 3개 메타데이터 파일

**워크플로우**: 8 Phases (Writing Assistant 에이전트 주도)
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
/analyze-posts --force --post slug

# 예시
/analyze-posts                    # 변경된 포스트만
/analyze-posts --force            # 전체 재생성
/analyze-posts --post my-slug     # 특정 포스트만
```

**출력**: `post-metadata.json`

---

#### 추천 생성 (2분)

```bash
/generate-recommendations --force --threshold 0.3

# 예시
/generate-recommendations                    # 증분 업데이트
```

**출력**: frontmatter의 `relatedPosts` 필드 업데이트 (V3)

---

#### 다음 주제 추천 (45-60초)

```bash
/next-post-recommendation --count 10 --category name
```

**출력**: `content-recommendations-{date}.md`

---

#### GA 분석 리포트 (3-5분)

```bash
/write-ga-post 2025-11-09 --period weekly
```

**출력**: 3개 언어 GA 리포트 포스트

---

#### Git 커밋 (10초)

```bash
/commit
```

**기능**: staged changes 분석 → 커밋 메시지 자동 생성 → 커밋 실행

---

## Agents (17개)

에이전트 정의는 `.gemini/agents/`에 위치하며, 커맨드 실행 시 참조됩니다.

### 콘텐츠 생성
- **content-planner**: 콘텐츠 전략 및 주제 계획
- **writing-assistant**: 블로그 포스트 작성 (다국어)
- **editor**: 문법, 스타일, 메타데이터 검토
- **image-generator**: Gemini API로 히어로 이미지 생성

### 연구 및 분석
- **web-researcher**: Brave Search MCP 활용 리서치 (2초 Rate Limit 준수 필수)
- **post-analyzer**: 메타데이터 추출
- **analytics**: 트래픽 분석 및 성과 측정
- **analytics-reporter**: GA4 데이터 기반 리포트 생성

### SEO 및 마케팅
- **seo-optimizer**: 사이트맵, 메타태그, 내부 링크
- **backlink-manager**: 백링크 전략 및 관리
- **social-media-manager**: 소셜 미디어 공유 자동화

### 콘텐츠 발견
- **content-recommender**: LLM 기반 의미론적 추천

### 운영 및 관리
- **site-manager**: Astro 빌드, 배포, 성능 최적화
- **portfolio-curator**: 프로젝트 포트폴리오 관리
- **learning-tracker**: 학습 목표 및 기술 트렌드 추적
- **improvement-tracker**: 지속적 개선 사항 추적

### 메타 최적화
- **prompt-engineer**: AI 프롬프트 최적화

---

## Skills (4개)

### blog-writing
**기능**: Frontmatter 검증, SEO 최적화, Slug 생성

### content-analyzer
**기능**: 메타데이터 추출, 증분 처리

### recommendation-generator
**기능**: LLM 기반 의미론적 유사도 분석, 다국어 추론

### trend-analyzer
**기능**: Brave Search MCP 통합 트렌드 분석, 3-Tier 캐싱

---

## 핵심 기술

1. **메타데이터 우선 아키텍처**: 전체 콘텐츠 분석 대신 메타데이터만 재사용하여 60-70% 토큰 절감
2. **LLM 기반 의미론적 추천**: 단순 키워드 매칭을 넘어선 의미 이해
3. **캐싱 전략**: 트렌드(24h), 기술(7d), 키워드(48h) 캐싱으로 비용 절감
4. **증분 처리**: Content Hash 비교로 변경된 포스트만 분석
5. **Verbalized Sampling**: 다양성 향상을 위한 프롬프팅 기법 적용

---

## MCP 통합

### 사용 중인 MCP 서버

1. **Brave Search MCP**: 리서치 및 트렌드 분석 (2초 Rate Limit 필수)
2. **Google Analytics 4 MCP**: 트래픽 분석 (Property ID: 395101361)
3. **Context7 MCP**: 라이브러리 공식 문서 조회
4. **Gemini API**: 히어로 이미지 생성 (Image Generator)

---

## 데이터 파일

- **post-metadata.json**: 분석된 메타데이터 저장
- **relatedPosts in frontmatter**: V3 추천 시스템의 결과 저장 위치

---

## 문제 해결

### Command 실행 실패
1. `npm run astro check` 실행
2. Content Collections 스키마 확인
3. 환경 변수 확인 (GEMINI_API_KEY)

### 메타데이터 누락
1. `/analyze-posts` 실행
2. `/generate-recommendations` 실행

---

**마지막 업데이트**: 2025-12-23 (Gemini CLI Migration)
**버전**: 2.0
**상태**: Active
