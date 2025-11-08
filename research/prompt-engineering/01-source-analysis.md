# 원본 기사 분석

## 개요

일본의 AI 전문 미디어 Smart Watch Life에서 소개한 두 개의 프롬프트 엔지니어링 기법을 상세히 분석합니다.

## 기사 1: ChatGPTの"優しさフィルター"を外す神プロンプト10選

**출처**: https://www.smartwatchlife.jp/59850/

### 핵심 개념: "優しさフィルター" (우호성 필터)

AI가 기본적으로 사용자를 지지하고 격려하는 경향을 제거하여, 보다 객관적이고 비판적인 분석을 수행하도록 만드는 기법입니다.

### 주요 프롬프트 기법 (10가지)

#### 1. 우호성 필터 제거 (Brutally Honest Advisor)

```
stop being agreeable and act as my brutally honest, high-level advisor
```

<strong>핵심 메커니즘</strong>:
- AI의 기본 톤을 "지지적"에서 "비판적"으로 전환
- 논리의 허점과 맹점을 적극적으로 지적
- 칭찬보다 개선 방안 중심

<strong>적용 시나리오</strong>:
- 비즈니스 전략 검토
- 코드 리뷰
- 아키텍처 설계 평가

#### 2. 세계 최고 편집자 페르소나

```
Act as the world's best editor. Analyze my writing objectively.
```

<strong>핵심 메커니즘</strong>:
- 특정 분야의 최고 전문가 페르소나 부여
- 객관적 분석 프레임워크 활성화

#### 3. 전 구글 직원 사고 프레임워크

```
Think like a former Google employee. Evaluate scalability.
```

<strong>핵심 메커니즘</strong>:
- 특정 기업 문화의 사고방식 적용
- 확장성(scalability) 중심 평가

#### 4. 악마의 옹호자 (Devil's Advocate)

```
Play devil's advocate. Challenge every aspect of my plan.
```

<strong>핵심 메커니즘</strong>:
- 반대 입장에서 철저히 반박
- 숨겨진 리스크 발견

#### 5. McKinsey 스타일 MECE 프레임워크

```
Use McKinsey's MECE framework to analyze this problem.
```

<strong>핵심 메커니즘</strong>:
- 체계적 문제 분석 프레임워크
- Mutually Exclusive, Collectively Exhaustive

#### 6. 스티브 잡스 비전

```
Respond as if you were Steve Jobs. Think about vision and simplicity.
```

<strong>핵심 메커니즘</strong>:
- 역사적 인물의 사고방식 에뮬레이션
- 비전과 단순함 중심

#### 7. 톱 마케터 SNS 전략

```
Act as a top marketer. Propose SNS strategy.
```

<strong>핵심 메커니즘</strong>:
- 특정 직무의 전문성 시뮬레이션

#### 8. 심리 카운슬러 경청 자세

```
Listen like a psychological counselor. Show empathy.
```

<strong>핵심 메커니즘</strong>:
- 톤 조정 (비판적 ↔ 공감적)

#### 9. 과학적 근거만 제공

```
Provide only scientifically proven facts. No speculation.
```

<strong>핵심 메커니즘</strong>:
- 출력 필터링 제약
- 근거 기반 정보만

#### 10. 실행 가능한 3단계 제한

```
Give me exactly 3 actionable steps. No more, no less.
```

<strong>핵심 메커니즘</strong>:
- 출력 형식 제약
- 간결함 강제

### 적용 원칙 추출

| 원칙 | 설명 | 예시 |
|------|------|------|
| **페르소나 설정** | 특정 전문가/역할 부여 | "You are a senior software architect" |
| **톤 조정** | 지지적 ↔ 비판적 | "Be brutally honest" vs "Be empathetic" |
| **프레임워크 적용** | 체계적 사고 도구 | MECE, First Principles 등 |
| **출력 제약** | 형식/분량 제한 | "Exactly 3 steps", "200 words max" |
| **필터링 조건** | 근거/출처 제약 | "Only scientific facts", "With sources" |

## 기사 2: ChatGPTの信頼性を高める「ファクトベースAI」プロンプト

**출처**: https://www.smartwatchlife.jp/59860/

### 핵심 개념: "ファクトベース" (팩트 기반)

AI의 할루시네이션(환각)을 줄이고, 근거 기반의 신뢰할 수 있는 응답을 유도하는 기법입니다.

### 핵심 규칙 (Rule-Based Prompting)

일본의 AI 교육 전문가 **みやっち(Miyacchi)** 씨가 제안한 프롬프트:

```
【ルール】
1. わからない/未確認は『わからない』と明言すること
2. 推測は『推測ですが』と明示すること
3. 現在日付を必ず明記すること
4. 根拠/出典を必ず添付すること
5. 専門家への確認が必要な場合はその旨を記載すること

【出力形式】
- 【結論】
- 【根拠】
- 【注意点】
- 【出典】
- 【確実性レベル】(高/中/低)
```

### 각 규칙의 메커니즘

#### 규칙 1: "모르는 것은 모른다"

<strong>문제</strong>: AI는 자신 없는 정보도 자신감 있게 답변하는 경향

<strong>해결</strong>: 불확실성을 명시하도록 강제

<strong>효과</strong>:
- 할루시네이션 감소
- 사용자 신뢰 향상

#### 규칙 2: 추측 명시

<strong>예시</strong>:
```
❌ "TypeScript 6.0은 2025년 출시됩니다."
✅ "추측이지만, TypeScript 6.0은 2025년에 출시될 가능성이 있습니다. 공식 로드맵을 확인해주세요."
```

#### 규칙 3: 현재 날짜 명기

<strong>중요성</strong>:
- AI의 지식 컷오프 명확화
- 시간적 맥락 제공

<strong>예시</strong>:
```
현재 날짜: 2025-11-08
지식 컷오프: 2025-01

최신 정보는 공식 문서를 확인해주세요.
```

#### 규칙 4: 근거/출처 필수

<strong>효과</strong>:
- 검증 가능성
- 정보 추적성
- 신뢰도 향상

#### 규칙 5: 전문가 확인 필요 시 명시

<strong>예시</strong>:
```
【注意点】
본 정보는 일반적인 가이드라인입니다.
실제 의료/법률 문제는 전문가와 상담이 필요합니다.
```

### 구조화된 출력 형식

**【結論】【根拠】【注意点】【出典】【確実性レベル】** 형식의 이점:

1. **일관성**: 모든 응답이 동일한 구조
2. **완결성**: 필수 정보 누락 방지
3. **신뢰성**: 근거와 확실성 레벨 명시
4. **검증 가능성**: 출처 제공

### 실제 효과

기사에서 언급된 사용자 보고:

- ✅ 단정적 어조 감소
- ✅ 근거 기반 설명 증가
- ✅ 자동 출처 삽입
- ✅ 추측에 대한 전제 표현 추가

## 종합 분석

### 두 기법의 공통점

| 공통 원칙 | 기사 1 | 기사 2 |
|-----------|--------|--------|
| **역할 명확화** | 페르소나 설정 | 팩트 체커 역할 |
| **제약 조건** | 출력 형식 제약 | 규칙 기반 제약 |
| **구조화** | 프레임워크 적용 | 구조화된 출력 |
| **신뢰성** | 근거 기반 | 출처 명시 |

### 두 기법의 차이점

| 차원 | 기사 1 (우호성 필터 제거) | 기사 2 (팩트 베이스) |
|------|------------------------|-------------------|
| **목적** | 비판적 사고 강화 | 신뢰성 향상 |
| **톤** | 비판적, 도전적 | 신중함, 정확성 |
| **적용 영역** | 전략, 기획, 창작 | 정보 제공, 리서치 |
| **핵심 가치** | 객관성, 깊이 | 정확성, 검증 가능성 |

### 프롬프트 엔지니어링의 핵심 통찰

1. **명시적 제약이 품질을 높인다**
   - "모호함"보다 "명확한 규칙"이 더 나은 결과

2. **역할과 톤의 분리**
   - 역할: 무엇을 하는가
   - 톤: 어떻게 하는가

3. **구조화된 출력의 힘**
   - 일관성, 완결성, 검증 가능성

4. **불확실성의 명시적 처리**
   - "모르는 것은 모른다"가 신뢰를 높인다

5. **페르소나의 전문성 증폭 효과**
   - "전문가처럼 생각하라"가 품질을 높인다

## 적용 가능성 평가

### High Priority (즉시 적용 가능)

1. **역할 명확화**: 모든 에이전트에 페르소나 부여
2. **불확실성 처리**: Web Researcher, Content Recommender
3. **출처 제공**: Web Researcher
4. **구조화된 출력**: 모든 에이전트

### Medium Priority (단계적 적용)

1. **프레임워크 적용**: Content Planner, SEO Optimizer
2. **제약 조건 명시**: 모든 커맨드
3. **품질 체크리스트**: Writing Assistant, Editor

### Low Priority (선택적 적용)

1. **톤 조정 옵션**: 사용자가 선택 가능하도록
2. **확실성 레벨**: 선택적 표시

## 다음 단계

1. 현재 `.claude/` 에이전트 프롬프트 상세 분석
2. 개선 프레임워크 수립
3. 우선순위별 적용 계획 수립
4. 단계적 구현 및 검증

## 참고 자료

- 원본 기사 1: https://www.smartwatchlife.jp/59850/
- 원본 기사 2: https://www.smartwatchlife.jp/59860/
- Anthropic Prompt Engineering Guide: https://docs.anthropic.com/claude/docs/prompt-engineering
