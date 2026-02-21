---
title: 'Individual Developer''s AI SaaS Journey: Production Launch in 3 Days'
description: >-
  Real-world experience building a B2B AI OCR service with SvelteKit, Supabase,
  and Google Gemini API. Tech stack rationale, implementation details, and
  business strategy from a solo developer's perspective.
pubDate: '2025-11-27'
heroImage: ../../../assets/blog/individual-developer-ai-saas-journey-hero.png
tags:
  - svelte
  - ai
  - saas
  - supabase
relatedPosts:
  - slug: claude-code-parallel-testing
    score: 0.95
    reason:
      ko: '자동화, 웹 개발, AI/ML, DevOps, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、Web開発、AI/ML、DevOps、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, web development, AI/ML, DevOps,
        architecture with comparable difficulty.
      zh: 在自动化、Web开发、AI/ML、DevOps、架构领域涵盖类似主题，难度相当。
  - slug: llm-page-migration-standardization
    score: 0.95
    reason:
      ko: '자동화, 웹 개발, AI/ML, DevOps, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、Web開発、AI/ML、DevOps、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, web development, AI/ML, DevOps,
        architecture with comparable difficulty.
      zh: 在自动化、Web开发、AI/ML、DevOps、架构领域涵盖类似主题，难度相当。
  - slug: ai-content-recommendation-system
    score: 0.94
    reason:
      ko: '자동화, 웹 개발, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、Web開発、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, web development, AI/ML,
        architecture with comparable difficulty.
      zh: 在自动化、Web开发、AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: google-analytics-mcp-automation
    score: 0.94
    reason:
      ko: '자동화, AI/ML, DevOps, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、DevOps、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, DevOps, architecture with
        comparable difficulty.
      zh: 在自动化、AI/ML、DevOps、架构领域涵盖类似主题，难度相当。
  - slug: metadata-based-recommendation-optimization
    score: 0.94
    reason:
      ko: '자동화, 웹 개발, AI/ML, DevOps, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、Web開発、AI/ML、DevOps、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, web development, AI/ML, DevOps,
        architecture with comparable difficulty.
      zh: 在自动化、Web开发、AI/ML、DevOps、架构领域涵盖类似主题，难度相当。
---

## Overview

I launched an AI-powered B2B SaaS to production in just 3 days. Named <a href="https://agent-effi-flow.jangwook.net" target="_blank" rel="noopener noreferrer">Agent Effi Flow</a>, this service provides two AI automation tools: Receipt OCR for Tax Refund and Accounting OCR, targeting Japanese inbound tourism businesses and SME accounting teams.

This article shares <strong>actual implementation experience</strong>, not "theoretically possible." I'll cover technology stack choices, core implementation, challenges faced, and 3-month KPI targets honestly.

## Why I Built This SaaS

### Problem Definition

B2B automation needs discovered while working in Japan:

1. <strong>Manual-dependent tax refund processing</strong>: Visual passport and tax refund document verification with manual data entry
2. <strong>Repetitive accounting tasks</strong>: Manual data cleanup after receipt OCR
3. <strong>Limitations of existing solutions</strong>: Either expensive enterprise solutions or low-accuracy generic OCR

The differentiation point as an individual developer: <strong>Structured data extraction using AI</strong>. Beyond simple text OCR, using Google Gemini API's Structured Output feature to receive type-safe JSON responses immediately usable in business logic.

## Technology Stack Choices

### Why SvelteKit Over Next.js

Reasons for choosing SvelteKit instead of Next.js:

<strong>1. Svelte 5's Innovative Reactivity System</strong>

```typescript
// Svelte 5 Runes: $state and $derived
let count = $state(0);
let doubled = $derived(count * 2);

// More intuitive than React hooks, less boilerplate
```

<strong>2. Bundle Size and Performance</strong>

- Svelte removes framework code at compile time
- Client bundle 40% smaller than React
- Noticeably faster Time to Interactive

<strong>3. Developer Experience</strong>

- Low learning curve, readable code
- Excellent TypeScript support
- Fast HMR with Vite

### Why Supabase for Backend

Supabase instead of Firebase:

<strong>1. PostgreSQL Power</strong>

```sql
-- Multi-tenant implementation with Row Level Security
CREATE POLICY "Users can only access their own data"
ON credits FOR SELECT
USING (auth.uid() = user_id);
```

<strong>2. Integrated Features</strong>

- Auth: Email/social login ready to use
- Database: PostgreSQL with real-time subscriptions
- Storage: File upload and CDN
- Edge Functions: Serverless functions (Deno-based)

<strong>3. Open Source and Pricing</strong>

- Fully open source (self-hosting possible)
- Generous free tier (50,000 MAU, 500MB DB)
- No vendor lock-in concerns

### Why Google Gemini API for AI

Gemini instead of OpenAI GPT:

<strong>1. Cost Efficiency</strong>

```
Gemini 2.5 Flash:
- Input: $0.075 / 1M tokens
- Output: $0.30 / 1M tokens

GPT-4 Turbo:
- Input: $10 / 1M tokens
- Output: $30 / 1M tokens

→ ~100x cheaper
```

<strong>2. Structured Output Support</strong>

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

// Force response to comply with schema
const result = await model.generateContent({
  contents: [{ role: 'user', parts: [{ text: prompt }] }],
  generationConfig: {
    responseMimeType: 'application/json',
    responseSchema
  }
});
```

<strong>3. Multimodal Performance</strong>

- Excellent image OCR quality (OmniDocBench benchmark #1)
- Strong at handling complex layouts like passports and receipts

### Why Vercel for Deployment

<strong>1. SvelteKit Optimization</strong>

- Direct support from Vercel, creators of SvelteKit
- Automatic SSR/Edge Function deployment
- Fast deployment with build caching

<strong>2. Serverless Architecture</strong>

- API routes automatically deploy as serverless functions
- Usage-based billing (minimal cost with no traffic)
- Global Edge Network

## Core Implementation

### 1. OCR API with Structured Output

<strong>Actual code</strong> (`src/routes/api/receipt-ocr/+server.ts`):

```typescript
import { GoogleGenerativeAI, SchemaType as Type } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash-exp'
});

// Ensure type safety with schema definition
const responseSchema = {
  type: Type.OBJECT,
  required: ['store_name', 'purchase_date', 'items', 'tax', 'total_with_tax'],
  properties: {
    store_name: {
      type: Type.STRING,
      description: 'Store name'
    },
    purchase_date: {
      type: Type.STRING,
      description: 'Purchase date in YYYY-MM-DD format'
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

// Encode image to base64
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
          text: `Analyze the following receipt image and return structured JSON.

          Requirements:
          1. Extract store name, purchase date, item list
          2. For each item: name, quantity, unit price, total
          3. Tax and final total
          4. Convert date to YYYY-MM-DD format
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
// parsedData is already a type-safe object complying with schema
```

<strong>Key advantages</strong>:

- <strong>Type safety</strong>: Schema enforces response structure
- <strong>No parsing errors</strong>: JSON parsing failures almost eliminated
- <strong>Immediately usable</strong>: Direct use in DB storage or API responses

### 2. Credit System

<strong>Stripe Checkout Integration</strong>:

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

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'jpy',
            product_data: {
              name: `${planId.toUpperCase()} Plan - ${selectedPlan.credits} Credits`
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

<strong>Credit Grant via Webhook</strong>:

```typescript
// src/routes/api/webhooks/stripe/+server.ts
export const POST = async ({ request }) => {
  const signature = request.headers.get('stripe-signature');
  const body = await request.text();

  // Verify Stripe webhook
  const event = stripe.webhooks.constructEvent(
    body,
    signature,
    STRIPE_WEBHOOK_SECRET
  );

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { user_id, credits } = session.metadata;

    // Add credits to Supabase
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

### 3. API Authentication

<strong>API Key Issuance and Validation</strong>:

```typescript
// API key creation
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

// API key validation (executed for all API requests)
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

// Check balance before deducting credits
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

### 4. Multi-language Support

<strong>i18n with Paraglide</strong>:

```typescript
// src/lib/i18n.ts
import { paraglide } from '@inlang/paraglide-sveltekit';

export const i18n = paraglide({
  project: './project.inlang',
  outdir: './src/paraglide',
  defaultLocale: 'ja'
});

// Supported languages: ko, en, ja, zh, es
```

<strong>Language-based Routing</strong>:

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

## Token Usage Tracking and Cost Optimization

<strong>Real-time Token Monitoring</strong>:

```typescript
const result = await model.generateContent({...});

// Gemini API returns token usage
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

## Business Strategy

### Target Customers

1. <strong>Japanese Inbound Tourism Businesses</strong>
   - Duty-free shops, drugstores, department stores
   - 1,000+ tax refund processes per month

2. <strong>SME Accounting Teams</strong>
   - 500+ receipt processing per month
   - Accounting software integration needs

3. <strong>Tax Accountant Offices</strong>
   - Accounting outsourcing for client companies
   - Need for accurate data

### SEO/AEO-Driven Acquisition

<strong>Content Marketing Strategy</strong>:

1. <strong>Leverage jangwook.net Blog</strong>
   - Build brand credibility through technical blog
   - Target OCR and AI automation keywords
   - This article is part of that strategy

2. <strong>Japanese Keyword Optimization</strong>
   - "免税 OCR" (tax refund OCR)
   - "経理 自動化" (accounting automation)
   - "領収書 AI" (receipt AI)

3. <strong>FAQ Page for AEO</strong>
   - "What's the OCR accuracy?" → Structured answer
   - "How to integrate API?" → Developer docs
   - "What's the pricing?" → Transparent pricing table

### 3-Month KPI Targets

<strong>Realistic Solo Developer Goals</strong>:

| Metric | Target | Measurement |
|--------|--------|-------------|
| Monthly Visitors | 500+ | Google Analytics |
| Signups | 30 | Supabase Auth table |
| Paid Conversions | 5 | Stripe Dashboard |
| MRR | ¥30,000 | Stripe subscriptions |
| OCR API Calls | 1,000 | api_usage table |

<strong>Why These Numbers?</strong>

- 500 visitors → Realistic with SEO
- 6% conversion (30/500) → B2B SaaS average
- 16.7% paid conversion (5/30) → Premium targeting
- ¥6,000 ARPU → Fits SME budgets

## Development Timeline

### Day 1 (2025-11-24): Foundation

<strong>Completed</strong>:
- Project initialization (SvelteKit + TypeScript)
- Supabase integration (Auth + Database)
- First service: Receipt OCR for Tax Refund
- Passport + tax refund document auto-recognition
- Structured Output schema validation

<strong>Code written</strong>: ~800 lines

### Day 2 (2025-11-25): Payment & Second Service

<strong>Completed</strong>:
- Accounting OCR service added
- Stripe Checkout integration
- Credit system implementation
- Auto-charge via webhooks
- Legal pages
  - Tokushoho (特定商取引法)
  - Privacy Policy
  - Terms of Service
- Google Analytics integration

<strong>Code written</strong>: ~1,200 lines

### Day 3 (2025-11-26): Polish & Launch

<strong>Completed</strong>:
- Service description pages
- API documentation
- Landing page optimization
- Production deployment (Vercel)
- DNS setup

<strong>Code written</strong>: ~600 lines

<strong>Total</strong>: 3 days, ~2,600 lines of code

## Lessons Learned

### 1. SvelteKit 5 Reactivity is a Game Changer

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
// Automatic reactivity, no useEffect needed
```

<strong>Realized benefits</strong>:
- 70% reduction in boilerplate code
- Easier debugging (no explicit dependencies)
- Performance improvement (no unnecessary re-renders)

### 2. Supabase RLS Makes Multi-tenant Easy

<strong>Row Level Security Policies</strong>:

```sql
-- Each user can only view their own credits
CREATE POLICY "Users can view own credits"
ON credits FOR SELECT
USING (auth.uid() = user_id);

-- Credit deduction only from server
CREATE POLICY "Only service role can deduct"
ON credits FOR INSERT
USING (auth.role() = 'service_role');
```

<strong>Benefits</strong>:
- No permission checks needed in application code
- Data isolation guaranteed at SQL level
- Security vulnerabilities fundamentally blocked

### 3. Gemini API Cost Optimization

<strong>Prompt Optimization</strong>:

```typescript
// Before: Long prompt
const prompt = `
You are a professional OCR system.
Analyze the following image...
(500+ character instructions)
`;
// → Input tokens: ~150

// After: Concise prompt
const prompt = `Extract receipt data as JSON:
- store_name, date, items[], tax, total`;
// → Input tokens: ~25

// Cost savings: 83%
```

<strong>Image Size Optimization</strong>:

```typescript
// Resize images to max 1024px
import sharp from 'sharp';

const optimized = await sharp(imageBuffer)
  .resize(1024, 1024, { fit: 'inside' })
  .png({ quality: 80 })
  .toBuffer();

// Token usage: 70% reduction
```

### 4. Solo Developer Productivity Tips

<strong>Methods to maximize productivity</strong>:

1. <strong>Local Development with Supabase CLI</strong>
   ```bash
   supabase start
   # Local PostgreSQL + Auth + Storage
   # Same environment as production
   ```

2. <strong>Boilerplate Auto-generation with Claude Code</strong>
   - CRUD API scaffolding
   - TypeScript type definitions
   - Zod schema validation

3. <strong>Vercel Preview Deployments</strong>
   - Automatic deployment URL per PR
   - Instant demo for clients

## Next Steps

### Immediate (Within 1 Week)

1. <strong>Japanese Keyword SEO Optimization</strong>
   - Write meta descriptions in Japanese
   - Optimize Open Graph images
   - Add Schema.org markup

2. <strong>Create FAQ Page</strong>
   - "What's the OCR accuracy?" → Answer with real data
   - "What receipt formats supported?" → Sample images
   - "What are the API limits?" → Specify rate limits

3. <strong>Submit to Google Search Console</strong>
   - Register sitemap
   - Request indexing

### Short-term (Within 1 Month)

1. <strong>Add New Services</strong>
   - Expand business document processing

2. <strong>Acquire First B2B Customer</strong>
   - Target: 1 duty-free shop contract
   - Credit-based pricing model

3. <strong>Enhance API Documentation</strong>
   - Write OpenAPI spec
   - Provide Postman Collection
   - SDK sample code (Python, Node.js)

### Mid-term (Within 3 Months)

1. <strong>Achieve ¥30,000 MRR</strong>
   - 5 paid customers
   - 500 API calls/month

2. <strong>Share Use Cases</strong>
   - Customer success story blog posts
   - Document real-world implementation cases

3. <strong>Add Premium Features</strong>
   - Batch processing
   - Custom schema support
   - Webhook integration

## References

### Official Documentation

- [SvelteKit Documentation](https://kit.svelte.dev/docs) - SvelteKit official docs
- [Supabase Guides](https://supabase.com/docs) - Supabase guides
- [Google Gemini API Docs](https://ai.google.dev/docs) - Gemini API documentation
- [Stripe Integration Guide](https://stripe.com/docs/checkout) - Stripe Checkout guide

### Key Articles Referenced

- [Gemini 3 for developers](https://blog.google/technology/developers/gemini-3-developers/) - Gemini 3 pricing and performance
- [Solo Developer SaaS Success Stories](https://dev.to/dev_tips/the-solo-dev-saas-stack-powering-10kmonth-micro-saas-tools-in-2025-pl7) - Solo developer success cases
- [B2B SaaS Go-to-Market Strategies](https://martal.ca/b2b-saas-marketing-strategies-lb/) - B2B SaaS marketing strategies
- [Stripe Credits for Usage-Based Billing](https://stripe.com/blog/introducing-credits-for-usage-based-billing) - Stripe credit system

## Conclusion

Launching a production SaaS in 3 days is <strong>possible</strong>. But the goal shouldn't be "build fast"—it should be <strong>"validate fast."</strong>

The keys were these 3 things:

1. <strong>Right tool selection</strong>: SvelteKit + Supabase + Gemini API
2. <strong>Limited scope</strong>: Start with 2 services, prioritize launch over perfection
3. <strong>Business first</strong>: Focus on solving customer problems over technology

Now the real journey begins. Acquiring the first paid customer, receiving feedback, and improving. I hope when I update this article in 3 months, I can write "¥30,000 MRR achieved."

Fellow solo developers, let's build together.
