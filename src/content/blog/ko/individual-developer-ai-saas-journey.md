---
title: '개인 개발자의 AI 활용 SaaS 구축기: 3일 만에 프로덕션 런칭'
description: >-
  SvelteKit, Supabase, Google Gemini API로 구축한 B2B AI OCR 서비스의 실전 개발기. 기술 선택 이유,
  구현 과정, 비즈니스 전략까지 솔로 개발자의 생생한 경험담.
pubDate: '2025-11-27'
heroImage: ../../../assets/blog/individual-developer-ai-saas-journey-hero.png
tags:
  - svelte
  - ai
  - saas
  - supabase
relatedPosts:
  - slug: llm-page-migration-standardization
    score: 0.95
    reason:
      ko: '자동화, 웹 개발, AI/ML, DevOps, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、Web開発、AI/ML、DevOps、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, web development, AI/ML, DevOps,
        architecture with comparable difficulty.
      zh: 在自动化、Web开发、AI/ML、DevOps、架构领域涵盖类似主题，难度相当。
  - slug: claude-code-parallel-testing
    score: 0.95
    reason:
      ko: '자동화, 웹 개발, AI/ML, DevOps, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、Web開発、AI/ML、DevOps、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, web development, AI/ML, DevOps,
        architecture with comparable difficulty.
      zh: 在自动化、Web开发、AI/ML、DevOps、架构领域涵盖类似主题，难度相当。
  - slug: google-analytics-mcp-automation
    score: 0.94
    reason:
      ko: '자동화, AI/ML, DevOps, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、DevOps、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, DevOps, architecture with
        comparable difficulty.
      zh: 在自动化、AI/ML、DevOps、架构领域涵盖类似主题，难度相当。
  - slug: ai-content-recommendation-system
    score: 0.94
    reason:
      ko: '자동화, 웹 개발, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、Web開発、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, web development, AI/ML,
        architecture with comparable difficulty.
      zh: 在自动化、Web开发、AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: specification-driven-development
    score: 0.94
    reason:
      ko: '자동화, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, architecture with comparable
        difficulty.
      zh: 在自动化、AI/ML、架构领域涵盖类似主题，难度相当。
---

## 개요

3일 만에 AI 기반 B2B SaaS를 프로덕션까지 론칭했습니다. <a href="https://agent-effi-flow.jangwook.net" target="_blank" rel="noopener noreferrer">Agent Effi Flow</a>라는 이름의 이 서비스는 면세처리 OCR과 경리 OCR이라는 두 가지 AI 자동화 도구를 제공하며, 일본 인바운드 관광 비즈니스와 중소기업 경리 팀을 타겟으로 합니다.

이 글은 "이론적으로 가능하다"가 아닌 <strong>실제로 구현한</strong> 경험을 공유합니다. 기술 스택 선택 이유, 핵심 구현 사항, 마주한 도전 과제, 그리고 3개월 KPI 목표까지 솔직하게 담았습니다.

## 왜 이 SaaS를 만들었는가

### 문제 정의

일본에서 일하면서 발견한 B2B 자동화 니즈:

1. <strong>면세처리 업무의 수작업 의존</strong>: 여권과 면세 서류를 육안으로 확인하고 수기 입력
2. <strong>경리 업무의 반복 작업</strong>: 영수증 OCR 후 수동 데이터 정리
3. <strong>기존 솔루션의 한계</strong>: 고가의 엔터프라이즈 솔루션이거나 정확도가 낮은 범용 OCR

개인 개발자로서 차별화 포인트는 <strong>AI를 활용한 구조화된 데이터 추출</strong>입니다. 단순 텍스트 OCR을 넘어 Google Gemini API의 Structured Output 기능으로 타입 안전한 JSON 응답을 받아 즉시 비즈니스 로직에 활용 가능한 데이터를 제공합니다.

## 기술 스택 선택

### SvelteKit을 선택한 이유

Next.js 대신 SvelteKit을 선택한 이유:

<strong>1. Svelte 5의 혁신적인 반응성 시스템</strong>

```typescript
// Svelte 5 Runes: $state와 $derived
let count = $state(0);
let doubled = $derived(count * 2);

// React hooks보다 직관적이고 보일러플레이트 코드 감소
```

<strong>2. 번들 크기와 성능</strong>

- Svelte는 컴파일 시점에 프레임워크 코드를 제거
- 클라이언트 번들이 React 대비 40% 작음
- Time to Interactive가 눈에 띄게 빠름

<strong>3. 개발자 경험</strong>

- 학습 곡선이 낮고 코드가 읽기 쉬움
- TypeScript 지원 우수
- Vite 기반으로 HMR이 빠름

### Supabase를 백엔드로 선택한 이유

Firebase 대신 Supabase:

<strong>1. PostgreSQL의 강력함</strong>

```sql
-- Row Level Security로 멀티테넌트 구현
CREATE POLICY "Users can only access their own data"
ON credits FOR SELECT
USING (auth.uid() = user_id);
```

<strong>2. 통합된 기능</strong>

- Auth: 이메일/소셜 로그인 즉시 사용
- Database: PostgreSQL with real-time subscriptions
- Storage: 파일 업로드 및 CDN
- Edge Functions: Serverless 함수 (Deno 기반)

<strong>3. 오픈소스와 가격</strong>

- 완전 오픈소스 (self-hosting 가능)
- 무료 티어가 관대 (50,000 MAU, 500MB DB)
- 벤더 락인 걱정 없음

### Google Gemini API를 AI 모델로 선택한 이유

OpenAI GPT 대신 Gemini:

<strong>1. 비용 효율성</strong>

```
Gemini 2.5 Flash:
- Input: $0.075 / 1M tokens
- Output: $0.30 / 1M tokens

GPT-4 Turbo:
- Input: $10 / 1M tokens
- Output: $30 / 1M tokens

→ 약 100배 저렴
```

<strong>2. Structured Output 지원</strong>

```typescript
const responseSchema = {
  type: Type.OBJECT,
  required: ['store_name', 'items', 'tax', 'total_with_tax'],
  properties: {
    store_name: { type: Type.STRING },
    items: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          quantity: { type: Type.NUMBER },
          unit_price: { type: Type.NUMBER }
        }
      }
    },
    tax: { type: Type.NUMBER },
    total_with_tax: { type: Type.NUMBER }
  }
};

// 응답이 스키마를 준수하도록 강제
const result = await model.generateContent({
  contents: [{ role: 'user', parts: [{ text: prompt }] }],
  generationConfig: {
    responseMimeType: 'application/json',
    responseSchema
  }
});
```

<strong>3. 멀티모달 성능</strong>

- 이미지 OCR 품질이 우수 (OmniDocBench 벤치마크 1위)
- 여권, 영수증 같은 복잡한 레이아웃 처리 강점

### Vercel을 배포 플랫폼으로 선택한 이유

<strong>1. SvelteKit 최적화</strong>

- SvelteKit을 만든 Vercel이 직접 지원
- 자동 SSR/Edge Function 배포
- 빌드 캐싱으로 배포 속도 빠름

<strong>2. Serverless 아키텍처</strong>

- API 라우트가 자동으로 serverless function으로 배포
- 사용량 기반 과금 (트래픽 없으면 비용 거의 없음)
- 전 세계 Edge Network

## 핵심 구현

### 1. OCR API with Structured Output

<strong>실제 코드</strong> (`src/routes/api/receipt-ocr/+server.ts`):

```typescript
import { GoogleGenerativeAI, SchemaType as Type } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash-exp'
});

// 스키마 정의로 타입 안전성 확보
const responseSchema = {
  type: Type.OBJECT,
  required: ['store_name', 'purchase_date', 'items', 'tax', 'total_with_tax'],
  properties: {
    store_name: {
      type: Type.STRING,
      description: '상점명'
    },
    purchase_date: {
      type: Type.STRING,
      description: 'YYYY-MM-DD 형식의 구매일자'
    },
    items: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          quantity: { type: Type.NUMBER },
          unit_price: { type: Type.NUMBER },
          total_price: { type: Type.NUMBER }
        }
      }
    },
    subtotal: { type: Type.NUMBER },
    tax: { type: Type.NUMBER },
    total_with_tax: { type: Type.NUMBER }
  }
};

// 이미지를 base64로 인코딩
const imageBase64 = await fileToBase64(imageFile);

const result = await model.generateContent({
  contents: [
    {
      role: 'user',
      parts: [
        {
          inlineData: {
            mimeType: imageFile.type,
            data: imageBase64
          }
        },
        {
          text: `다음 영수증 이미지를 분석하여 구조화된 JSON으로 반환하세요.

          요구사항:
          1. 상점명, 구매일자, 품목 리스트 추출
          2. 각 품목의 이름, 수량, 단가, 총액
          3. 부가세와 최종 합계
          4. 날짜는 YYYY-MM-DD 형식으로 변환
          `
        }
      ]
    }
  ],
  generationConfig: {
    responseMimeType: 'application/json',
    responseSchema
  }
});

const parsedData = JSON.parse(result.response.text());
// parsedData는 이미 스키마를 준수하는 타입 안전 객체
```

<strong>핵심 장점</strong>:

- <strong>타입 안전성</strong>: 스키마로 응답 구조 강제
- <strong>파싱 오류 제거</strong>: JSON 파싱 실패 거의 없음
- <strong>즉시 활용 가능</strong>: DB 저장이나 API 응답에 바로 사용

### 2. Credit System (크레딧 시스템)

<strong>Stripe Checkout 통합</strong>:

```typescript
// src/routes/agents/credits/+page.server.ts
import Stripe from 'stripe';

const stripe = new Stripe(STRIPE_SECRET_KEY);

export const actions = {
  purchase: async ({ request, locals }) => {
    const data = await request.formData();
    const planId = data.get('plan_id');

    const plans = {
      starter: { price: 2000, credits: 1000 },
      pro: { price: 10000, credits: 5500 },
      business: { price: 40000, credits: 23000 }
    };

    const selectedPlan = plans[planId];

    // Stripe Checkout 세션 생성
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'jpy',
            product_data: {
              name: `${planId.toUpperCase()} 플랜 - ${selectedPlan.credits} 크레딧`
            },
            unit_amount: selectedPlan.price
          },
          quantity: 1
        }
      ],
      mode: 'payment',
      success_url: `${url.origin}/credits/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${url.origin}/credits`,
      metadata: {
        user_id: locals.user.id,
        credits: selectedPlan.credits,
        plan_id: planId
      }
    });

    return { session_url: session.url };
  }
};
```

<strong>Webhook으로 크레딧 부여</strong>:

```typescript
// src/routes/api/webhooks/stripe/+server.ts
export const POST = async ({ request }) => {
  const signature = request.headers.get('stripe-signature');
  const body = await request.text();

  // Stripe webhook 검증
  const event = stripe.webhooks.constructEvent(
    body,
    signature,
    STRIPE_WEBHOOK_SECRET
  );

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { user_id, credits } = session.metadata;

    // Supabase에 크레딧 추가
    await supabase
      .from('credits')
      .insert({
        user_id,
        amount: parseInt(credits),
        type: 'purchase',
        description: `Purchased ${credits} credits`
      });
  }

  return new Response(JSON.stringify({ received: true }));
};
```

### 3. API Authentication (API 인증)

<strong>API 키 발급 및 검증</strong>:

```typescript
// API 키 생성
export const actions = {
  createApiKey: async ({ locals }) => {
    const apiKey = `effi_${crypto.randomUUID()}`;

    await supabase
      .from('api_keys')
      .insert({
        user_id: locals.user.id,
        key: apiKey,
        created_at: new Date().toISOString()
      });

    return { apiKey };
  }
};

// API 키 검증 (모든 API 요청에서 실행)
async function validateApiKey(request: Request) {
  const apiKey = request.headers.get('X-API-Key');

  if (!apiKey) {
    throw error(401, 'API key required');
  }

  const { data: keyData } = await supabase
    .from('api_keys')
    .select('user_id, is_active')
    .eq('key', apiKey)
    .single();

  if (!keyData || !keyData.is_active) {
    throw error(401, 'Invalid or inactive API key');
  }

  return keyData.user_id;
}

// 크레딧 차감 전 잔액 확인
async function checkAndDeductCredits(userId: string, amount: number) {
  const { data: balance } = await supabase
    .rpc('get_credit_balance', { user_id: userId });

  if (balance < amount) {
    throw error(402, 'Insufficient credits');
  }

  await supabase
    .from('credits')
    .insert({
      user_id: userId,
      amount: -amount,
      type: 'usage',
      description: 'OCR API call'
    });
}
```

### 4. Multi-language Support (다국어 지원)

<strong>Paraglide를 사용한 i18n</strong>:

```typescript
// src/lib/i18n.ts
import { paraglide } from '@inlang/paraglide-sveltekit';

export const i18n = paraglide({
  project: './project.inlang',
  outdir: './src/paraglide',
  defaultLocale: 'ja'
});

// 지원 언어: ko, en, ja, zh, es
```

<strong>언어별 라우팅</strong>:

```typescript
// src/routes/[lang]/+layout.server.ts
export const load = async ({ params }) => {
  const lang = params.lang || 'ja';

  return {
    lang,
    translations: await import(`../../locales/${lang}.json`)
  };
};
```

## 토큰 사용량 추적 및 비용 최적화

<strong>실시간 토큰 모니터링</strong>:

```typescript
const result = await model.generateContent({...});

// Gemini API는 토큰 사용량 반환
const usage = result.response.usageMetadata;

await supabase
  .from('api_usage')
  .insert({
    user_id,
    input_tokens: usage.promptTokenCount,
    output_tokens: usage.candidatesTokenCount,
    total_tokens: usage.totalTokenCount,
    estimated_cost: calculateCost(usage)
  });

function calculateCost(usage) {
  const INPUT_COST = 0.075 / 1_000_000; // $0.075 per 1M tokens
  const OUTPUT_COST = 0.30 / 1_000_000; // $0.30 per 1M tokens

  return (
    usage.promptTokenCount * INPUT_COST +
    usage.candidatesTokenCount * OUTPUT_COST
  );
}
```

## 비즈니스 전략

### Target Customers (타겟 고객)

1. <strong>일본 인바운드 관광 비즈니스</strong>
   - 면세점, 드럭스토어, 백화점
   - 월 1,000건 이상 면세 처리

2. <strong>중소기업 경리 팀</strong>
   - 월 500건 이상 영수증 처리
   - 회계 소프트웨어 연동 니즈

3. <strong>세무사 사무소</strong>
   - 고객사 경리 대행
   - 정확한 데이터 필요

### SEO/AEO-Driven Acquisition (검색 기반 고객 획득)

<strong>콘텐츠 마케팅 전략</strong>:

1. <strong>jangwook.net 블로그 활용</strong>
   - 기술 블로그를 통한 브랜드 신뢰도 구축
   - OCR, AI 자동화 관련 키워드 타겟팅
   - 이 글도 그 일환

2. <strong>일본어 키워드 최적화</strong>
   - "면세 OCR" (免税 OCR)
   - "경리 자동화" (経理 自動化)
   - "영수증 AI" (領収書 AI)

3. <strong>FAQ 페이지로 AEO 대응</strong>
   - "OCR 정확도는?" → 구조화된 답변
   - "API 연동 방법은?" → 개발자 문서
   - "가격은?" → 투명한 가격표

### 3-Month KPI Targets (3개월 KPI 목표)

<strong>현실적인 솔로 개발자 목표</strong>:

| 지표 | 목표 | 측정 방법 |
|-----|-----|---------|
| 월간 방문자 | 500+ | Google Analytics |
| 회원가입 | 30명 | Supabase Auth 테이블 |
| 유료 전환 | 5명 | Stripe Dashboard |
| MRR | ¥30,000 | Stripe 구독 합계 |
| OCR API 호출 | 1,000회 | api_usage 테이블 |

<strong>Why These Numbers?</strong>

- 500 방문자 → SEO로 달성 가능한 현실적 수치
- 6% 전환율 (30/500) → B2B SaaS 평균
- 16.7% 유료 전환 (5/30) → 프리미엄으로 타겟팅
- ¥6,000 ARPU → 중소기업 예산에 적합

## 개발 일정

### Day 1 (2025-11-24): Foundation

<strong>완료 항목</strong>:
- 프로젝트 초기화 (SvelteKit + TypeScript)
- Supabase 연동 (Auth + Database)
- 첫 서비스 구현: Receipt OCR for Tax Refund
- 여권 + 면세 서류 자동 인식
- Structured Output 스키마 검증

<strong>코드 작성량</strong>: ~800 lines

### Day 2 (2025-11-25): Payment & Second Service

<strong>완료 항목</strong>:
- Accounting OCR 서비스 추가
- Stripe Checkout 통합
- 크레딧 시스템 구현
- Webhook으로 자동 충전
- 법적 페이지 작성
  - 특정상거래법 (特定商取引法)
  - 프라이버시 정책
  - 이용약관
- Google Analytics 연동

<strong>코드 작성량</strong>: ~1,200 lines

### Day 3 (2025-11-26): Polish & Launch

<strong>완료 항목</strong>:
- 서비스 설명 페이지
- API 문서 작성
- 랜딩 페이지 최적화
- 프로덕션 배포 (Vercel)
- DNS 설정

<strong>코드 작성량</strong>: ~600 lines

<strong>총계</strong>: 3일, ~2,600 lines of code

## 배운 점

### 1. SvelteKit 5의 Reactivity는 게임 체인저

<strong>Before (React hooks)</strong>:

```typescript
const [credits, setCredits] = useState(0);

useEffect(() => {
  const doubled = credits * 2;
  setDoubled(doubled);
}, [credits]);
```

<strong>After (Svelte 5 runes)</strong>:

```typescript
let credits = $state(0);
let doubled = $derived(credits * 2);
// 자동으로 반응성 처리, useEffect 불필요
```

<strong>실감한 이점</strong>:
- 보일러플레이트 코드 70% 감소
- 디버깅이 쉬워짐 (명시적 의존성 불필요)
- 성능 향상 (불필요한 리렌더링 없음)

### 2. Supabase RLS로 멀티테넌트가 쉬워짐

<strong>Row Level Security 정책</strong>:

```sql
-- 각 사용자는 자신의 크레딧만 조회 가능
CREATE POLICY "Users can view own credits"
ON credits FOR SELECT
USING (auth.uid() = user_id);

-- 크레딧 차감은 서버에서만
CREATE POLICY "Only service role can deduct"
ON credits FOR INSERT
USING (auth.role() = 'service_role');
```

<strong>이점</strong>:
- 애플리케이션 코드에서 권한 검사 불필요
- SQL 레벨에서 데이터 격리 보장
- 보안 취약점 원천 차단

### 3. Gemini API 비용 최적화

<strong>프롬프트 최적화</strong>:

```typescript
// Before: 긴 프롬프트
const prompt = `
당신은 전문 OCR 시스템입니다.
다음 이미지를 분석하여...
(500자 이상의 지시사항)
`;
// → Input tokens: ~150

// After: 간결한 프롬프트
const prompt = `Extract receipt data as JSON:
- store_name, date, items[], tax, total`;
// → Input tokens: ~25

// 비용 절감: 83%
```

<strong>이미지 크기 최적화</strong>:

```typescript
// 이미지를 1024px 이내로 리사이즈
import sharp from 'sharp';

const optimized = await sharp(imageBuffer)
  .resize(1024, 1024, { fit: 'inside' })
  .png({ quality: 80 })
  .toBuffer();

// 토큰 사용량: 70% 감소
```

### 4. Solo Developer Productivity Tips

<strong>생산성을 극대화한 방법</strong>:

1. <strong>Supabase CLI로 로컬 개발</strong>
   ```bash
   supabase start
   # 로컬 PostgreSQL + Auth + Storage
   # 프로덕션과 동일한 환경
   ```

2. <strong>Claude Code로 보일러플레이트 자동 생성</strong>
   - CRUD API 스캐폴딩
   - TypeScript 타입 정의
   - Zod 스키마 검증

3. <strong>Vercel Preview Deployments</strong>
   - PR마다 자동 배포 URL
   - 클라이언트에게 즉시 데모 가능

## 다음 단계

### 즉시 실행 (1주일 이내)

1. <strong>일본어 키워드 SEO 최적화</strong>
   - Meta description 일본어로 작성
   - Open Graph 이미지 최적화
   - Schema.org 마크업 추가

2. <strong>FAQ 페이지 작성</strong>
   - "OCR 정확도는?" → 실제 데이터로 답변
   - "어떤 영수증 형식 지원?" → 샘플 이미지
   - "API 제한은?" → Rate limit 명시

3. <strong>Google Search Console 제출</strong>
   - 사이트맵 등록
   - 인덱싱 요청

### 단기 목표 (1개월 이내)

1. <strong>새 서비스 추가</strong>
   - 비즈니스 문서 처리 확대

2. <strong>첫 B2B 고객 획득</strong>
   - 면세점 1곳 계약 목표
   - 크레딧 기반 과금 모델

3. <strong>API 문서 고도화</strong>
   - OpenAPI 스펙 작성
   - Postman Collection 제공
   - SDK 샘플 코드 (Python, Node.js)

### 중기 목표 (3개월 이내)

1. <strong>MRR ¥30,000 달성</strong>
   - 5명 유료 고객
   - 월 500회 API 호출

2. <strong>사용 사례 공유</strong>
   - 고객 성공 사례 블로그 포스트
   - 실제 활용 사례 문서화

3. <strong>프리미엄 기능 추가</strong>
   - Batch processing (대량 처리)
   - Custom schema support
   - Webhook integration

## 참고 자료

### Official Documentation

- [SvelteKit Documentation](https://kit.svelte.dev/docs) - SvelteKit 공식 문서
- [Supabase Guides](https://supabase.com/docs) - Supabase 가이드
- [Google Gemini API Docs](https://ai.google.dev/docs) - Gemini API 문서
- [Stripe Integration Guide](https://stripe.com/docs/checkout) - Stripe Checkout 가이드

### Key Articles Referenced

- [Gemini 3 for developers](https://blog.google/technology/developers/gemini-3-developers/) - Gemini 3 가격 및 성능
- [Solo Developer SaaS Success Stories](https://dev.to/dev_tips/the-solo-dev-saas-stack-powering-10kmonth-micro-saas-tools-in-2025-pl7) - 솔로 개발자 성공 사례
- [B2B SaaS Go-to-Market Strategies](https://martal.ca/b2b-saas-marketing-strategies-lb/) - B2B SaaS 마케팅 전략
- [Stripe Credits for Usage-Based Billing](https://stripe.com/blog/introducing-credits-for-usage-based-billing) - Stripe 크레딧 시스템

## 맺음말

3일 만에 프로덕션 SaaS를 런칭하는 것은 <strong>가능합니다</strong>. 하지만 "빠르게 만들기"가 목표가 아니라 <strong>"빠르게 검증하기"</strong>가 목표여야 합니다.

핵심은 다음 3가지였습니다:

1. <strong>적절한 도구 선택</strong>: SvelteKit + Supabase + Gemini API
2. <strong>스코프 제한</strong>: 2개 서비스로 시작, 완벽함보다 출시 우선
3. <strong>비즈니스 우선</strong>: 기술보다 고객 문제 해결에 집중

이제 진짜 여정이 시작됩니다. 첫 유료 고객을 확보하고, 피드백을 받고, 개선하는 과정. 3개월 후 이 글을 업데이트할 때 "MRR ¥30,000 달성"이라고 쓸 수 있기를 바랍니다.

솔로 개발자 여러분, 함께 만들어갑시다.
