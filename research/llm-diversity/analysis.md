# Verbalized Sampling 기법 적용 분석

## 개요

Verbalized Sampling은 LLM의 모드 붕괴(mode collapse) 문제를 해결하여 출력 다양성을 1.6〜2.1배 향상시키는 프롬프팅 기법입니다. 이 문서는 `.claude/` 디렉토리의 에이전트들에 이 기법을 적용하는 방법을 분석합니다.

## Verbalized Sampling 핵심 원리

### 1. 문제: 모드 붕괴(Mode Collapse)

정렬(alignment) 과정을 거친 LLM은:
- 안전하고 예측 가능한 응답만 생성
- 창의성과 다양성 감소
- 전형성 편향(typicality bias) 발생

### 2. 해결책: Verbalized Sampling

```
1. 모델에게 k개의 가능한 응답 생성 요청
2. 각 응답에 확률값 할당 요청
3. 낮은 확률 영역(꼬리 부분)에서 샘플링 명시
4. 생성된 분포에서 무작위로 하나 선택
```

### 3. 주요 파라미터

| 파라미터 | 기본값 | 설명 | 권장 범위 |
|---------|--------|------|-----------|
| `k` | 5 | 생성할 후보 응답 수 | 3〜10 |
| `tau` | 0.10 | 확률 임계값 (이하만 샘플링) | 0.05〜0.20 |
| `temperature` | 0.9 | 응답 다양성 제어 | 0.7〜1.0 |

## .claude/ 에이전트 분석

### 적용 가능 에이전트 우선순위

#### 🔴 높은 우선순위 (즉시 적용)

1. **prompt-engineer.md** ⭐⭐⭐⭐⭐
   - **이유**: 프롬프트 최적화 시 다양한 변형 생성이 핵심
   - **적용 방법**: 다양한 프롬프트 패턴을 Verbalized Sampling으로 생성
   - **예상 효과**: 2.0x 다양성 향상

2. **content-planner.md** ⭐⭐⭐⭐⭐
   - **이유**: 콘텐츠 주제 제안 시 다양성이 중요
   - **적용 방법**: 5〜10개의 다양한 주제를 낮은 확률 영역에서 샘플링
   - **예상 효과**: 1.8x 다양성 향상

3. **writing-assistant.md** ⭐⭐⭐⭐
   - **이유**: 글쓰기 스타일과 접근 방식의 다양성 필요
   - **적용 방법**: 다양한 문체와 구조를 제안
   - **예상 효과**: 1.6x 다양성 향상

#### 🟡 중간 우선순위 (선택적 적용)

4. **image-generator.md** ⭐⭐⭐
   - **이유**: 이미지 프롬프트 다양성 향상
   - **적용 방법**: 다양한 시각적 스타일 제안
   - **예상 효과**: 1.5x 다양성 향상

5. **web-researcher.md** ⭐⭐⭐
   - **이유**: 리서치 쿼리와 관점의 다양성
   - **적용 방법**: 다양한 검색 각도 제안
   - **예상 효과**: 1.4x 다양성 향상

6. **content-recommender.md** ⭐⭐
   - **이유**: 추천 알고리즘에 다양성 추가
   - **적용 방법**: 다양한 추천 전략 활용
   - **예상 효과**: 1.3x 다양성 향상

#### 🟢 낮은 우선순위 (적용 불필요)

- **seo-optimizer.md**: 정확성이 중요 (다양성보다)
- **analytics.md**: 사실 기반 분석 (다양성 필요 없음)
- **site-manager.md**: 기술적 작업 (다양성 불필요)

## 적용 전략

### 1. Prompt Engineering 패턴

#### 기존 방식
```markdown
프롬프트를 생성하세요.
```

#### Verbalized Sampling 적용
```markdown
<instructions>
다음 요구사항에 대해 5개의 프롬프트 변형을 생성하세요.
각 변형은 <response> 태그로 감싸고, <text>와 <probability>를 포함해야 합니다.
분포의 꼬리 부분에서 무작위로 샘플링하여, 각 변형의 확률이 0.10 미만이 되도록 하세요.
</instructions>

요구사항: [프롬프트 요청]
```

### 2. Content Planning 패턴

#### 기존 방식
```markdown
블로그 주제 5개를 제안하세요.
```

#### Verbalized Sampling 적용
```markdown
<instructions>
다음 키워드에 대해 8개의 블로그 주제를 생성하세요.
각 주제는 <response> 태그로 감싸고, <text>, <probability>, <seo_score>를 포함해야 합니다.
분포의 꼬리 부분(probability < 0.12)에서 샘플링하여 다양한 관점을 제공하세요.
</instructions>

키워드: [주제 영역]
```

### 3. Writing Style 패턴

#### 기존 방식
```markdown
블로그 포스트를 작성하세요.
```

#### Verbalized Sampling 적용
```markdown
<instructions>
다음 주제에 대해 3가지 다른 글쓰기 접근 방식을 제안하세요.
각 접근 방식은 <response> 태그로 감싸고, <text>, <probability>, <style>을 포함해야 합니다.
비전형적인 접근(probability < 0.15)을 포함하여 창의적인 다양성을 확보하세요.
</instructions>

주제: [블로그 주제]
```

## 예상 효과

### 정량적 효과
- **다양성 향상**: 평균 1.6〜2.1배
- **창의성 증가**: 비전형적 아이디어 발굴
- **품질 유지**: 안전성과 정확도 동일 수준 유지

### 정성적 효과
- 더 폭넓은 아이디어 풀
- 독창적인 콘텐츠 생성
- 사용자 만족도 향상

## 구현 고려사항

### 1. 비용 증가
- k=5인 경우 API 비용 약 5배 증가
- 캐싱 전략으로 완화 가능

### 2. 응답 시간
- k개 응답 생성으로 지연 증가
- 비동기 처리로 최적화 가능

### 3. 품질 관리
- 낮은 확률 영역에서도 품질 유지 필요
- 후처리 필터링 추가 고려

## 다음 단계

1. ✅ 분석 완료
2. ⏳ 구현 계획 수립
3. ⏳ 에이전트별 수정
4. ⏳ 테스트 및 검증
5. ⏳ 문서화 및 공유

## 참고 자료

- 원본 논문: [Verbalized Sampling: How to Mitigate Mode Collapse and Unlock LLM Diversity](https://arxiv.org/abs/2510.01171)
- 블로그 포스트: `src/content/blog/ko/verbalized-sampling-llm-diversity.md`
- GitHub: [stanford-oval/verbalized-sampling](https://github.com/stanford-oval/verbalized-sampling)
