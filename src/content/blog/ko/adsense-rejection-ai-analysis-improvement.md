---
title: 'AdSense 도전기: AI 분석으로 "가치 없는 콘텐츠" 거절 극복하기'
description: >-
  Google AdSense "가치가 별로 없는 콘텐츠" 거절 후 ChatGPT, Claude, Gemini 3개 AI를 활용해 원인을
  분석하고 승인 가능성을 5.5점에서 8.5점으로 개선한 실제 경험을 공유합니다.
pubDate: '2025-12-03'
heroImage: ../../../assets/blog/adsense-rejection-ai-analysis-improvement-hero.png
tags:
  - adsense
  - seo
  - ai-analysis
relatedPosts:
  - slug: llm-seo-aeo-practical-implementation
    score: 0.93
    reason:
      ko: '웹 개발, AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: Web開発、AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in web development, AI/ML with comparable
        difficulty.
  - slug: vertex-ai-search-site-implementation
    score: 0.92
    reason:
      ko: '웹 개발, AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: Web開発、AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in web development, AI/ML with comparable
        difficulty.
  - slug: adding-chinese-support
    score: 0.92
    reason:
      ko: '웹 개발, AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: Web開発、AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in web development, AI/ML with comparable
        difficulty.
  - slug: llm-blog-automation
    score: 0.92
    reason:
      ko: '웹 개발, AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: Web開発、AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in web development, AI/ML with comparable
        difficulty.
  - slug: individual-developer-ai-saas-journey
    score: 0.91
    reason:
      ko: '다음 단계 학습으로 적합하며, 웹 개발, AI/ML 주제에서 연결됩니다.'
      ja: 次のステップの学習に適しており、Web開発、AI/MLのトピックで繋がります。
      en: >-
        Suitable as a next-step learning resource, connecting through web
        development, AI/ML topics.
---

## 들어가며: 예상치 못한 거절

Google AdSense에 신청했을 때, 저는 승인을 확신했습니다. AI와 클라우드 기술을 다루는 232개 이상의 블로그 포스트, 4개 국어 지원, 그리고 실무 경험을 바탕으로 한 깊이 있는 콘텐츠. 충분한 조건을 갖췄다고 생각했습니다.

하지만 Google의 답변은 명확했습니다.

> <strong>"가치가 별로 없는 콘텐츠(Low Value Content)"</strong>

이 거절 사유는 단순히 콘텐츠가 부족하다는 의미가 아닙니다. Google의 알고리즘이 사이트 전체를 평가한 결과 "광고를 붙일 만한 가치가 없다"는 판단입니다. 충격적이었지만, 이것이 오히려 새로운 학습 기회가 되었습니다.

나는 AI 개발자입니다. 문제가 있으면 데이터를 분석하고 원인을 찾는 것이 일입니다. 이번에는 이 거절을 분석 대상으로 삼았습니다. 그리고 ChatGPT, Claude, Gemini 세 가지 AI에게 동일한 질문을 던졌습니다.

> "왜 내 블로그는 AdSense 승인을 받지 못했을까?"

## AI 3개에게 물어본 이유

왜 하나가 아닌 세 개의 AI에게 물었을까요?

<strong>교차 검증(Cross-validation)</strong>입니다. 머신러닝에서 모델의 신뢰성을 확인하기 위해 사용하는 기법입니다. 각 AI는 서로 다른 학습 데이터와 알고리즘을 기반으로 하기 때문에, 세 AI가 공통적으로 지적하는 문제는 <strong>실제로 심각한 문제일 가능성이 높습니다</strong>.

실제로 분석해보니 이 전략은 매우 효과적이었습니다. 각 AI는 서로 다른 관점에서 문제를 분석했지만, 핵심 이슈에서는 놀라울 정도로 일치했습니다.

## AI별 분석 결과: 각자의 관점

### ChatGPT의 진단: 구조적 문제에 집중

ChatGPT는 가장 체계적이고 구조적인 분석을 제공했습니다. 마치 컨설턴트처럼 문제를 카테고리화하고 우선순위를 매겼습니다.

<strong>ChatGPT가 지적한 핵심 문제</strong>:

1. <strong>사이트 구조 및 사용자 경험 문제</strong>
   - 루트 도메인이 언어 선택만 있는 "얇은 진입 페이지"
   - 콘텐츠 도달까지 여러 단계 필요 ("홈 → 언어 선택 → 블로그 목록 → 게시글")
   - hreflang 태그 미구현 또는 부실

2. <strong>콘텐츠 품질 관련 문제</strong>
   - 동일한 내용의 번역 반복으로 고유 가치 제한
   - 자동 번역 사용 시 부자연스러운 문장
   - 텍스트 분량이 적으면 "얇은 콘텐츠(thin content)"로 간주

3. <strong>필수 페이지 부재</strong>
   - About, Contact, Privacy Policy 페이지 미비
   - 이는 Google이 명시적으로 요구하는 필수 조건

ChatGPT의 분석은 매우 실용적이었습니다. 각 문제마다 구체적인 해결책과 예시 코드를 제공했고, AdSense 커뮤니티의 실제 사례들을 인용했습니다.

### Claude의 진단: 기술적 SEO의 함정

Claude는 가장 기술적이고 엔지니어링 중심의 분석을 제공했습니다. <strong>SPA(Single Page Application) 아키텍처와 크롤러 호환성</strong>이라는 관점에서 문제를 바라봤습니다.

<strong>Claude가 강조한 핵심 이슈</strong>:

1. <strong>SvelteKit의 "하이드레이션 갭"</strong>
   ```html
   <!-- AdSense 크롤러가 보는 것 -->
   <div id="svelte"></div>
   <script src="/_app/immutable/start.js"></script>
   <!-- 본문 텍스트가 전혀 없음! -->
   ```

   사용자 브라우저에서는 0.1초 만에 콘텐츠가 렌더링되지만, AdSense 크롤러는 JavaScript를 실행하지 않거나 실행 전에 판단을 종료합니다. 결과적으로 "빈 페이지"로 인식됩니다.

2. <strong>Googlebot vs Mediapartners-Google의 차이</strong>

   | 항목 | Googlebot (검색) | Mediapartners-Google (AdSense) |
   |------|------------------|--------------------------------|
   | JS 실행 능력 | 매우 능숙 (V8 엔진) | 제한적 / 간헐적 |
   | 대기 시간 | 렌더링 완료까지 대기 | 짧은 타임아웃 |
   | 링크 탐색 | onclick 등 추론 가능 | 표준 `<a>` 태그만 |

   이 차이 때문에 검색에는 잘 노출되어도 AdSense는 거절될 수 있습니다.

3. <strong>루트 도메인의 "가치 진공(Value Vacuum)" 상태</strong>
   - AdSense는 루트 페이지(/)를 가장 먼저 평가
   - 현재: 언어 선택 버튼만 존재 → 텍스트 밀도 0
   - 232개의 양질 포스트가 있지만 <strong>탑 페이지에서 보이지 않음</strong>

Claude의 분석은 마치 시스템 아키텍트가 코드 리뷰를 하는 것처럼 정밀했습니다. 특히 "JavaScript 비활성화 테스트"를 제안한 것이 인상적이었습니다.

```javascript
// Claude가 제안한 검증 방법
// 크롬 개발자 도구에서 JavaScript를 비활성화한 후
// 페이지를 새로고침. 본문이 보여야 함.
// 화면이 하얗다면? AdSense는 절대 승인되지 않는다.
```

### Gemini의 진단: 신뢰 신호의 부재

Gemini는 <strong>E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness)</strong> 관점에서 가장 날카로운 지적을 했습니다.

<strong>Gemini가 발견한 치명적 약점</strong>:

1. <strong>Contact 페이지가 극도로 빈약함</strong>
   - 현재: 한 문장만 존재
   - 필요: 연락 양식, 이메일 주소, 위치 정보
   - Google의 신뢰도 평가에서 치명적 약점

2. <strong>Privacy Policy 부재 또는 미색인</strong>
   - Google 검색에서 jangwook.net의 개인정보처리방침 발견 안됨
   - AdSense Terms of Service Section 10에서 <strong>필수 요구</strong>
   - 반드시 포함해야 할 문구: "Google을 포함한 제3자가 쿠키 사용"

3. <strong>메인 페이지가 포트폴리오 형식</strong>
   - 블로그 진입점이 아닌 프로젝트 쇼케이스
   - Google: "이게 블로그인가, 개인 홈페이지인가?"

4. <strong>저자 정보의 가시성 문제</strong>
   - About 페이지에는 저자 정보 존재
   - 하지만 각 포스트에 저자 byline 없음
   - E-E-A-T 신호가 약함

Gemini는 실제 승인 사례도 제시했습니다. 특히 인상적이었던 것은:

<strong>Kate's Digest 사례</strong>:
- 3회 거부 → 48시간 만에 승인
- 평균 포스트 길이: 800단어 → 2,500단어
- E-E-A-T 요소 강화 (저자 소개, 출처 인용)
- 페이지 로딩 속도: 4초 → 2초 이하

<strong>Tumto Siram 사례</strong>:
- 4회 거부 → 19개 포스트로 승인
- <strong>핵심 발견</strong>: 130개의 평범한 글보다 19개의 고품질 글이 유리

## 3개 AI의 공통 진단: 핵심 문제점

세 AI의 분석을 종합하면, 공통적으로 지적한 <strong>Critical 문제</strong>는 다음과 같습니다:

### 1. 루트 페이지의 "가치 진공" (모든 AI 일치)

```
현재 구조:
jangwook.net → [언어 선택 화면] → /ko/ or /en/ or /ja/ or /zh/ → 블로그

AdSense 크롤러가 보는 것:
jangwook.net → 버튼 4개, 텍스트 없음 → "가치 없음" 판정 → 종료
```

<strong>문제의 핵심</strong>:
- AdSense는 <strong>도메인 단위</strong>로 승인
- 루트 페이지를 가장 먼저 평가
- 232개의 양질 포스트는 하위 경로에 숨어 있음
- 첫인상이 "빈 껍데기"

### 2. hreflang 태그 미구현 (ChatGPT, Claude 공통)

다국어 사이트에서 hreflang 태그는 필수입니다. 이것이 없으면:
- Google이 언어별 페이지를 중복 콘텐츠로 오인
- 크롤링 예산(Crawl Budget) 낭비
- SEO 점수 하락

### 3. E-E-A-T 신호 부족 (Gemini, Claude 공통)

기술 블로그는 <strong>YMYL(Your Money or Your Life)</strong> 영역에 인접합니다. 잘못된 클라우드 설정이나 보안 조언은 금전적 손실로 이어질 수 있기 때문입니다.

따라서 Google은:
- 저자의 전문성 증명 요구
- 물리적 실체성 (연락처, 소속) 필요
- 익명 블로그는 신뢰도 낮게 평가

## 실제 개선 작업: Before → After

AI들의 분석을 바탕으로 실제 개선 작업을 진행했습니다.

### 개선 1: 루트 페이지 전면 개편

<strong>Before</strong>:
```
jangwook.net/
├── [한국어] 버튼
├── [English] 버튼
├── [日本語] 버튼
└── [中文] 버튼
(텍스트 콘텐츠: 거의 없음)
```

<strong>After</strong>:
```
jangwook.net/
├── Hero Section: 사이트 소개 (200+ 단어)
├── Statistics: 232+ 포스트, 4개 언어, 8+ 토픽
├── Featured Posts: 언어별 최신 2개 (총 8개)
├── Popular Topics: 태그 클라우드
├── About Author: 저자 소개 (E-E-A-T 신호)
│   ├── Kim Jangwook
│   ├── AI 개발자, 10+ 년 경력
│   ├── MCP, Claude Code 전문가
│   └── 실제 프로젝트 경험
├── Featured Projects: 실제 구현 사례 6개+
└── 자동 언어 감지 (Accept-Language 기반)
```

<strong>핵심 변경점</strong>:
- 즉시 콘텐츠 노출 (텍스트 밀도 대폭 증가)
- 사이트 가치를 첫 화면에서 증명
- E-E-A-T 신호 강화 (저자 경력, 전문성)

### 개선 2: hreflang 태그 완전 구현

모든 페이지의 `<head>` 섹션에 다음을 추가했습니다:

```html
<link rel="alternate" hreflang="ko"
      href="https://jangwook.net/ko/blog/article-slug/" />
<link rel="alternate" hreflang="en"
      href="https://jangwook.net/en/blog/article-slug/" />
<link rel="alternate" hreflang="ja"
      href="https://jangwook.net/ja/blog/article-slug/" />
<link rel="alternate" hreflang="zh"
      href="https://jangwook.net/zh/blog/article-slug/" />
<link rel="alternate" hreflang="x-default"
      href="https://jangwook.net/en/blog/article-slug/" />
```

<strong>x-default의 의미</strong>:
- 지원하지 않는 언어 사용자를 위한 기본 페이지
- 국제 표준인 영어로 설정
- Google에게 다국어 구조를 명확히 전달

### 개선 3: 자동 언어 감지 구현

사용자 경험과 크롤러 친화성을 동시에 고려한 솔루션:

```typescript
// src/lib/language-detection.ts
export function getRecommendedLanguage(): SupportedLanguage {
  // 1순위: 사용자가 저장한 설정
  const saved = getSavedLanguagePreference();
  if (saved) return saved;

  // 2순위: 브라우저 언어 감지
  const detected = detectBrowserLanguage();
  if (detected) return detected;

  // 3순위: 기본값 (영어)
  return 'en';
}
```

<strong>크롤러 대응</strong>:
- JavaScript 비활성화 상태에서도 영어 콘텐츠 렌더링
- Mediapartners-Google이 즉시 콘텐츠 확인 가능
- 사용자에게는 자동 언어 전환 제공

### 개선 4: E-E-A-T 신호 강화

각 블로그 포스트에 저자 정보 추가:

```markdown
---
title: "포스트 제목"
author: Kim Jangwook
authorBio: "AI 개발자, 10+ 년 경력. MCP와 Claude Code 전문가"
---
```

루트 페이지에 "About Author" 섹션 추가:
- 실제 경력 (10+ 년)
- 전문 분야 (AI, MCP, Claude Code)
- 검증 가능한 프로젝트 (GitHub 링크)
- 연락처 (이메일, 소셜 미디어)

## Before/After 비교: 승인 가능성 평가

세 AI에게 개선 전후를 비교 평가해달라고 요청했습니다.

### 콘텐츠 가치 평가

| 항목 | Before | After | 변화 |
|------|--------|-------|------|
| <strong>루트 페이지 텍스트 밀도</strong> | 0 | 500+ 단어 | +∞ |
| <strong>콘텐츠 즉시 노출</strong> | ✗ | ✓ | Critical |
| <strong>E-E-A-T 신호</strong> | 약함 | 강함 | +2 |
| <strong>종합 콘텐츠 가치</strong> | 5/10 | 9/10 | +4 |

### SEO 기술적 완성도

| 항목 | Before | After | 변화 |
|------|--------|-------|------|
| <strong>hreflang 태그</strong> | 부분 | 완전 | +2 |
| <strong>x-default 태그</strong> | ✗ | ✓ | +1 |
| <strong>크롤러 호환성</strong> | 약함 | 강함 | +1 |
| <strong>JavaScript 비의존</strong> | ✗ | ✓ | Critical |
| <strong>종합 SEO 점수</strong> | 6/10 | 9/10 | +3 |

### E-E-A-T 신호

| 항목 | Before | After | 변화 |
|------|--------|-------|------|
| <strong>저자 정보 가시성</strong> | 낮음 | 높음 | +2 |
| <strong>전문성 증명</strong> | 약함 | 강함 | +2 |
| <strong>연락처 명확성</strong> | 불명 | 명확 | +1 |
| <strong>Privacy Policy</strong> | 있음 | 있음 (검증됨) | 0 |
| <strong>종합 E-E-A-T</strong> | 6/10 | 8/10 | +2 |

### 종합 예상 승인 확률

```
Before: 5.5 / 10
- 콘텐츠는 좋지만 구조적 결함으로 가치 전달 실패
- 크롤러가 콘텐츠를 발견하지 못함

After: 8.5 / 10
- 루트 페이지에서 즉시 가치 노출
- 기술적 SEO 완성
- E-E-A-T 신호 명확
```

## 핵심 배운 점: AI가 문제가 아니었다

이번 프로젝트에서 가장 중요한 깨달음은 이것입니다:

<strong>"AI 생성 콘텐츠 자체는 문제가 아니었다."</strong>

Google이 거절한 이유는:
- ✗ AI로 글을 썼기 때문이 아니라
- ✓ <strong>사이트 구조</strong>가 크롤러 친화적이지 않아서
- ✓ <strong>신뢰 신호</strong>가 부족해서
- ✓ <strong>콘텐츠 가치</strong>가 즉시 노출되지 않아서

실제로 Google의 공식 입장도 명확합니다:

> "How content is produced is less important than whether it provides helpful, original information."
> (콘텐츠가 어떻게 생성되었는지보다, 유용하고 독창적인 정보를 제공하는지가 중요합니다.)

문제는 <strong>"유용하고 독창적"임을 증명하는 방법</strong>이었습니다.

## AI 협업의 힘: 교차 검증의 가치

세 AI를 활용한 이번 분석에서 배운 것:

### 1. 각 AI의 강점을 활용하라

- <strong>ChatGPT</strong>: 구조화된 문제 분석, 실용적 해결책
- <strong>Claude</strong>: 기술적 깊이, 엔지니어링 관점
- <strong>Gemini</strong>: 실제 사례, 신뢰 신호 분석

### 2. 공통 지적사항에 집중하라

세 AI가 모두 지적한 문제:
- 루트 페이지의 콘텐츠 부재 → <strong>최우선 해결</strong>
- hreflang 태그 미구현 → <strong>기술적 필수</strong>
- E-E-A-T 신호 부족 → <strong>신뢰도 강화</strong>

### 3. 서로 다른 관점이 완전한 그림을 만든다

- ChatGPT만 물었다면: 구조 개선에만 집중
- Claude만 물었다면: 기술적 해결에만 몰두
- Gemini만 물었다면: 콘텐츠 품질에만 신경
- <strong>세 AI 모두</strong>: 전체적인 해결책 도출

## 다음 단계: AdSense 재신청 전략

현재 개선 작업이 완료되었습니다. 재신청 전 체크리스트:

### 기술적 검증

- [x] JavaScript 비활성화 테스트 통과
- [x] hreflang 태그 모든 페이지 적용
- [x] 루트 페이지 텍스트 밀도 500+ 단어
- [ ] Google Search Console 색인 확인
- [ ] PageSpeed Insights 점수 확인

### 콘텐츠 검증

- [x] 232+ 양질 포스트 보유
- [x] 각 포스트 1,000+ 단어
- [x] 저자 정보 모든 포스트 추가
- [x] 고유 스크린샷 및 이미지 포함

### 신뢰 신호 검증

- [x] Privacy Policy 존재 및 AdSense 필수 문구 포함
- [x] Contact 페이지 연락 방법 명시
- [x] About 페이지 저자 경력 및 전문성 증명

### 신청 전략

1. <strong>2〜3일 대기</strong>: Google 크롤러가 변경사항 인덱싱
2. <strong>Search Console 확인</strong>: 새 루트 페이지 색인 확인
3. <strong>재신청</strong>: 개선사항을 명시하며 신청
4. <strong>모니터링</strong>: 승인 여부 확인 (통상 48시간〜7일)

## 결론: 데이터 기반 접근의 승리

이번 AdSense 거절은 실망스러웠지만, 결과적으로 사이트를 크게 개선하는 계기가 되었습니다.

<strong>핵심 교훈</strong>:

1. <strong>문제를 데이터로 접근하라</strong>
   - 감정적 반응 대신 분석적 접근
   - AI를 활용한 교차 검증
   - 구체적인 지표로 개선 측정

2. <strong>AI 협업은 강력하다</strong>
   - 서로 다른 AI의 관점 활용
   - 공통 지적사항에서 진실 발견
   - 각 AI의 강점을 전략적으로 사용

3. <strong>기술적 완성도가 콘텐츠 품질만큼 중요하다</strong>
   - 좋은 콘텐츠도 크롤러가 못 보면 무용지물
   - SEO는 "검색"만이 아닌 "신뢰 신호"
   - 사이트 구조가 첫인상을 결정

4. <strong>승인 가능성: 5.5 → 8.5</strong>
   - 루트 페이지 개편: +3점
   - 기술적 SEO 완성: +1점
   - E-E-A-T 강화: +0.5점

이제 재신청을 앞두고 있습니다. 결과가 어떻게 나올지는 모르겠지만, 이미 사이트는 이전보다 훨씬 나아졌습니다. 그리고 이 과정 자체가 값진 학습이었습니다.

다음 포스트에서는 AdSense 재신청 결과와 함께, 실제 승인 후의 최적화 전략을 공유하겠습니다.

---

<strong>업데이트 예정</strong>:
- AdSense 재신청 결과 (2025년 12월 중)
- 승인 후 광고 배치 최적화 전략
- 다국어 사이트의 AdSense 수익화 노하우

여러분의 AdSense 도전에도 이 경험이 도움이 되기를 바랍니다.
