# Trend Analyzer Skill

Web 트렌드를 효율적으로 조사하여 블로그 콘텐츠 추천 시스템에 활용하는 전문화된 스킬입니다.

## 개요

Trend Analyzer는 Brave Search API를 활용하여 현재 기술 트렌드, 인기 프레임워크, 모범 사례를 조사합니다. `/post-recommendation` 커맨드에서 자동으로 호출되며, 토큰 소비를 최소화하면서 고품질의 트렌드 인사이트를 제공합니다.

## 주요 기능

### 1. 기술 트렌드 조사
- 인기 있는 프레임워크, 라이브러리, 도구 식별
- 신흥 기술의 채택률 분석
- 기술 스택 비교 및 평가

### 2. 콘텐츠 인기도 분석
- 높은 참여도를 보이는 주제 발견
- 트렌딩 튜토리얼 및 가이드 식별
- SEO 키워드 기회 발견

### 3. 콘텐츠 갭 분석
- 기존 블로그 콘텐츠와 트렌드 비교
- 미커버 주제 식별
- 카테고리 균형 분석

## 사용 방법

### 자동 호출 (권장)

```bash
# /post-recommendation 커맨드가 자동으로 호출
/post-recommendation
```

### 수동 호출

```bash
# Skill을 직접 호출하여 트렌드 조사
@trend-analyzer "AI 자동화 도구의 최신 트렌드를 조사해주세요"
```

## 입력 파라미터

```typescript
interface TrendAnalyzerInput {
  focus_areas: string[];        // 조사할 카테고리 목록
  existing_topics: string[];    // 기존에 다룬 주제 (중복 방지)
  existing_tech: string[];      // 기존에 다룬 기술 스택
  target_language: string;      // 출력 언어 (ko/ja/en)
  search_depth: string;         // 조사 깊이 (quick/medium/thorough)
}
```

### search_depth 옵션

- **quick**: 5-8회 검색, ~30초 소요
- **medium**: 10-15회 검색, ~45-60초 소요 (권장)
- **thorough**: 20-25회 검색, ~90-120초 소요

## 출력 형식

```json
{
  "trending_topics": [
    {
      "topic": "주제명",
      "category": "ai-ml",
      "popularity_score": 0.92,
      "trend": "rising",
      "sources": ["url1", "url2"],
      "keywords": ["키워드1", "키워드2"],
      "technologies": ["Tech1", "Tech2"],
      "difficulty_estimate": 3,
      "seo_potential": 0.85
    }
  ],
  "emerging_technologies": [
    {
      "name": "기술명",
      "category": "web-development",
      "adoption_rate": "growing",
      "relevance_to_blog": 0.88,
      "use_cases": ["사용 사례 1", "사용 사례 2"]
    }
  ],
  "content_gaps": [
    {
      "gap_type": "missing_category",
      "description": "설명",
      "opportunity_score": 0.78,
      "suggested_topics": ["제안 주제 1", "제안 주제 2"]
    }
  ],
  "search_summary": {
    "total_searches": 15,
    "processing_time": "48s",
    "confidence_level": "high"
  }
}
```

## 성능 지표

### 토큰 사용량

- **입력**: ~2,000 토큰
- **처리**: ~12,000 토큰
- **출력**: ~3,000 토큰
- **총계**: ~17,000 토큰

**비교**: 직접 검색 시 40,000+ 토큰 소비 (58% 절감)

### 실행 시간

- Quick: 30초
- Medium: 45-60초
- Thorough: 90-120초

## 캐싱 전략

트렌드 데이터는 `.cache/trend-data.json`에 저장되며 다음과 같이 캐싱됩니다:

- **트렌드 데이터**: 24시간
- **기술 데이터**: 7일
- **키워드 데이터**: 48시간

캐시를 활용하면 중복 검색을 피하고 응답 시간을 단축할 수 있습니다.

## 검색 쿼리 최적화

### 카테고리별 템플릿

상세한 검색 쿼리 템플릿은 `search-templates.md`를 참조하세요.

**예시**:
```typescript
// AI/ML 트렌드
"trending AI tools 2025"
"LLM framework popularity 2025"

// 웹 개발 트렌드
"popular JavaScript frameworks 2025"
"React vs Next.js vs Astro 2025"

// DevOps 트렌드
"DevOps tools trending 2025"
"Kubernetes best practices 2025"
```

## 중요 제약사항

### 필수: 2초 지연

**CRITICAL**: Brave Search API 호출 간 반드시 2초 지연을 구현해야 합니다.

```bash
brave_web_search: "query 1"
sleep 2
brave_web_search: "query 2"
sleep 2
```

이는 레이트 리밋을 방지하고 안정적인 검색을 보장합니다.

### 신선도 우선

- 가급적 최근 6개월 이내 콘텐츠 우선
- `freshness: "pw"` (지난 주) 또는 `freshness: "pm"` (지난 달) 사용

### 신뢰할 수 있는 소스

우선순위가 높은 소스:
- 공식 문서
- GitHub 저장소
- Dev.to, Medium, Hacker News
- Stack Overflow
- 기술 블로그 (Vercel, Netlify 등)

## 에러 핸들링

### 레이트 리밋

```typescript
// 자동 재시도 (최대 3회)
if (error.code === 'RATE_LIMIT') {
  await sleep(5000);
  retry();
}
```

### 검색 결과 없음

```typescript
// 폴백: 콘텐츠 갭 분석만 수행
if (searchResults.length === 0) {
  return {
    content_gaps: analyzeGapsOnly(existingPosts),
    fallback_mode: true
  };
}
```

## 통합 예시

### /post-recommendation 커맨드에서 사용

```typescript
// 트렌드 분석 호출
const trendData = await invokeTrendAnalyzer({
  focus_areas: ["ai-ml", "web-development"],
  existing_topics: extractedTopics,
  existing_tech: extractedTechStack,
  target_language: "ko",
  search_depth: "medium"
});

// 추천 생성에 활용
const recommendations = generateRecommendations(
  postMetadata,
  trendData
);
```

## 파일 구조

```
.claude/skills/trend-analyzer/
├── SKILL.md                # 스킬 정의 및 구현
├── README.md              # 이 파일
└── search-templates.md    # 검색 쿼리 템플릿
```

## 관련 파일

- **커맨드**: `.claude/commands/post-recommendation.md`
- **에이전트**: `.claude/agents/web-researcher.md`
- **캐시**: `.cache/trend-data.json`

## 베스트 프랙티스

1. ✅ 항상 2초 지연 구현
2. ✅ 24시간 캐싱 활용
3. ✅ 최근 6개월 이내 콘텐츠 우선
4. ✅ 공식 소스 우선순위 부여
5. ✅ 필수 데이터만 추출 (토큰 최적화)
6. ✅ 중복 제거 및 집계
7. ✅ 관련성 검증 후 반환

## 향후 개선 사항

- [ ] 병렬 검색 처리 (배치 단위)
- [ ] ML 기반 트렌드 예측
- [ ] 소셜 미디어 트렌드 통합
- [ ] 커뮤니티 피드백 분석
- [ ] 경쟁사 콘텐츠 자동 분석

## 라이선스

MIT License - 이 스킬은 오픈소스이며 자유롭게 수정 및 배포 가능합니다.
