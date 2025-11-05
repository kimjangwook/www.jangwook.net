# Verbalized Sampling 구현 계획

## 구현 전략

### Phase 1: 핵심 에이전트 (즉시 적용)

#### 1. prompt-engineer.md

**수정 대상 섹션**:
- Optimization Process
- Required Output Format
- Deliverables

**추가할 기법**:
```markdown
## Verbalized Sampling for Prompt Diversity

When creating prompts that require creative diversity, use the Verbalized Sampling technique:

### Process
1. Generate k=5 prompt variations (minimum)
2. Assign probability to each variation
3. Sample from tail distribution (p < 0.10)
4. Select one or present multiple options

### Template
<instructions>
Generate 5 prompt variations for the following use case.
Wrap each variation in <response> tags with <text> and <probability>.
Sample from the tail distribution (probability < 0.10) to ensure diversity.
</instructions>

Use case: [description]
```

**예상 효과**:
- 프롬프트 다양성 2.0배 증가
- 창의적인 프롬프트 패턴 발굴
- 사용자 만족도 향상

---

#### 2. content-planner.md

**수정 대상 섹션**:
- 주요 기능
- 출력 형식
- 사용 예시

**추가할 기법**:
```markdown
## 다양성 향상 전략

### Verbalized Sampling 활용

콘텐츠 주제 제안 시 다양성을 확보하기 위해 Verbalized Sampling을 사용합니다:

#### 프롬프트 템플릿
<instructions>
다음 카테고리에 대해 8개의 블로그 주제를 생성하세요.
각 주제는 <response> 태그로 감싸고, 다음 정보를 포함해야 합니다:
- <title>: 주제 제목
- <keywords>: 주요 키워드 (3-5개)
- <seo_difficulty>: SEO 난이도 (상/중/하)
- <target_audience>: 대상 독자
- <probability>: 선택 확률 (0.12 미만으로 설정)

분포의 꼬리 부분에서 샘플링하여 비전형적이지만 가치 있는 주제를 발굴하세요.
</instructions>

카테고리: [주제 영역]
관심 키워드: [키워드 목록]

#### 파라미터 설정
- k = 8 (더 많은 옵션)
- tau = 0.12 (약간 높은 임계값)
- temperature = 0.9 (높은 창의성)
```

**예상 효과**:
- 주제 다양성 1.8배 증가
- 비전형적 주제 발굴
- SEO 기회 확대

---

#### 3. writing-assistant.md

**수정 대상 섹션**:
- 주요 기능 > 블로그 포스트 초안 작성
- 작성 가이드라인

**추가할 기법**:
```markdown
## 창의적 글쓰기 다양성

### Verbalized Sampling 적용

블로그 포스트 작성 시 다양한 접근 방식을 제안하기 위해 Verbalized Sampling을 활용합니다.

#### 단계별 프로세스

1. **주제 분석**: 핵심 키워드와 타겟 독자 파악
2. **접근 방식 생성**: 3-5가지 다른 글쓰기 스타일 제안
3. **다양성 샘플링**: 낮은 확률 영역에서 선택
4. **초안 작성**: 선택된 접근 방식으로 초안 생성

#### 프롬프트 템플릿

<instructions>
다음 블로그 주제에 대해 5가지 다른 글쓰기 접근 방식을 제안하세요.

각 접근 방식은 <response> 태그로 감싸고, 다음을 포함해야 합니다:
- <approach_name>: 접근 방식 이름
- <style>: 글쓰기 스타일 (예: 튜토리얼, 스토리텔링, 비교 분석)
- <structure>: 제안 구조 (섹션 목차)
- <tone>: 톤앤매너 (전문적, 친근함, 기술적 등)
- <target_reader>: 주요 독자층
- <probability>: 선택 확률 (0.10 미만)

비전형적이지만 효과적인 접근 방식을 포함하세요.
</instructions>

주제: [블로그 주제]
키워드: [핵심 키워드]
타겟: [독자층]

#### 파라미터 추천
- k = 5
- tau = 0.10
- temperature = 0.9

#### 예시 응답

<response>
<approach_name>스토리텔링 접근</approach_name>
<style>내러티브 기반 튜토리얼</style>
<structure>
1. 문제 상황 시나리오
2. 해결 과정 스토리
3. 기술 설명 (자연스럽게 통합)
4. 결과 및 교훈
</structure>
<tone>친근하고 공감 가능한</tone>
<target_reader>초급〜중급 개발자</target_reader>
<probability>0.08</probability>
</response>
```

**예상 효과**:
- 글쓰기 스타일 다양성 1.6배 증가
- 독자 참여도 향상
- 콘텐츠 독창성 강화

---

### Phase 2: 보조 에이전트 (선택적 적용)

#### 4. image-generator.md

**추가할 섹션**:
```markdown
## 이미지 프롬프트 다양성

### Verbalized Sampling for Visual Creativity

히어로 이미지 생성 시 다양한 시각적 스타일을 탐색하기 위해 Verbalized Sampling을 사용합니다.

#### 프롬프트 생성 템플릿

<instructions>
다음 블로그 주제에 대해 5개의 히어로 이미지 프롬프트를 생성하세요.

각 프롬프트는 <response> 태그로 감싸고:
- <prompt>: 영문 이미지 생성 프롬프트
- <style>: 시각적 스타일 (minimalist, abstract, illustrative 등)
- <color_scheme>: 색상 조합
- <mood>: 분위기 (professional, playful, futuristic 등)
- <probability>: 선택 확률 (0.12 미만)

비전형적이지만 매력적인 시각적 접근을 포함하세요.
</instructions>

블로그 주제: [주제]
핵심 개념: [개념]

#### 예시
<response>
<prompt>Abstract geometric patterns representing data flow in neural networks, vibrant gradient colors, modern tech aesthetic, no text overlays</prompt>
<style>abstract geometric</style>
<color_scheme>vibrant blue-purple gradient</color_scheme>
<mood>futuristic and dynamic</mood>
<probability>0.09</probability>
</response>
```

**파라미터**:
- k = 5
- tau = 0.12
- temperature = 0.95 (최대 창의성)

---

#### 5. web-researcher.md

**추가할 섹션**:
```markdown
## 리서치 관점 다양화

### Verbalized Sampling for Research Queries

웹 리서치 시 다양한 각도에서 정보를 수집하기 위해 Verbalized Sampling을 활용합니다.

#### 쿼리 생성 템플릿

<instructions>
다음 주제에 대해 6개의 다양한 검색 쿼리를 생성하세요.

각 쿼리는 <response> 태그로 감싸고:
- <query>: 검색 쿼리
- <perspective>: 검색 관점 (기술적, 비즈니스, 사용자 경험 등)
- <expected_sources>: 예상 정보원 유형
- <probability>: 선택 확률 (0.10 미만)

일반적이지 않은 관점에서의 쿼리를 포함하세요.
</instructions>

주제: [리서치 주제]
```

**파라미터**:
- k = 6
- tau = 0.10
- temperature = 0.85

---

## 구현 타임라인

### Week 1: 핵심 에이전트
- Day 1-2: prompt-engineer.md 수정 및 테스트
- Day 3-4: content-planner.md 수정 및 테스트
- Day 5-7: writing-assistant.md 수정 및 테스트

### Week 2: 보조 에이전트
- Day 1-3: image-generator.md 수정 및 테스트
- Day 4-5: web-researcher.md 수정 및 테스트
- Day 6-7: 통합 테스트 및 문서화

### Week 3: 검증 및 최적화
- Day 1-3: 실전 테스트
- Day 4-5: 피드백 수집 및 조정
- Day 6-7: 최종 문서화

## 테스트 계획

### 1. 단위 테스트
각 에이전트별로:
- 5회 이상 실행
- 다양성 측정 (Self-BLEU)
- 품질 평가 (주관적)

### 2. 통합 테스트
- 전체 워크플로우 실행
- 에이전트 간 협업 확인
- 일관성 검증

### 3. 성능 테스트
- 응답 시간 측정
- API 비용 분석
- 사용자 만족도 조사

## 성공 지표

### 정량적 지표
- 다양성 향상: 1.5배 이상
- 품질 유지: 기존 수준 90% 이상
- 응답 시간: 기존 대비 2배 이내

### 정성적 지표
- 사용자 피드백 긍정적
- 독창적 콘텐츠 증가
- 에이전트 활용도 향상

## 롤백 계획

문제 발생 시:
1. 기존 버전으로 즉시 롤백
2. 문제 원인 분석
3. 수정 후 재배포

백업 위치: `.claude/agents/backup/`

## 문서화

### 필수 문서
1. ✅ 분석 보고서 (analysis.md)
2. ✅ 구현 계획 (implementation-plan.md)
3. ⏳ 에이전트별 수정 내역 (agent-modifications.md)
4. ⏳ 테스트 결과 (test-results.md)
5. ⏳ 인사이트 및 학습 (insights.md)

### 블로그 포스트
- 제목: "Claude Code 에이전트에 Verbalized Sampling 적용하기"
- 내용: 구현 과정, 결과, 인사이트
- 다국어: 한국어, 영어, 일본어

## 다음 단계

1. ✅ 분석 완료
2. ✅ 구현 계획 수립
3. ⏳ 에이전트 파일 수정 시작
4. ⏳ 테스트 및 검증
5. ⏳ 블로그 포스트 작성
