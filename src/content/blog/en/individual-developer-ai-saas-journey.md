---
title: 'Individual Developer''s AI SaaS Journey: Production Launch in 3 Days'
description: >-
  Zero to a live B2B AI OCR product in three days with SvelteKit, Supabase, and
  Gemini: stack choices, what broke, and the first-quarter KPIs a solo dev set.
pubDate: '2025-11-27'
heroImage: ../../../assets/blog/individual-developer-ai-saas-journey-hero.png
tags:
  - svelte
  - ai
  - saas
  - supabase
relatedPosts:
  - slug: dena-llm-study-part1-fundamentals
    score: 0.9
    reason:
      ko: AI 주제를 한 단계 더 깊이 파고드는 글입니다.
      en: Goes one level deeper into AI.
      ja: AIをもう一歩深く掘り下げた記事です。
      zh: 更深入地探讨 AI 主题。
  - slug: dena-llm-study-part4-rag
    score: 0.85
    reason:
      ko: AI를 실제로 다뤄본 경험이 이어지는 글입니다.
      en: Continues the hands-on AI experience.
      ja: AIを実際に扱った経験が続く記事です。
      zh: 延续 AI 的实战经验。
faq:
  - question: "Why Google Gemini API instead of OpenAI GPT?"
    answer: "Cost was the main reason. Gemini 2.5 Flash runs at 0.075 dollars per 1M input tokens and 0.30 dollars output, roughly 100x cheaper than GPT-4 Turbo. It also supports Structured Output to enforce type-safe JSON, and its image OCR quality is strong on complex layouts like receipts and passports."
  - question: "Why choose SvelteKit over Next.js?"
    answer: "Svelte 5's Runes reactivity is more intuitive than React hooks and cut boilerplate by about 70 percent. Because Svelte strips framework code at compile time, the client bundle is 40 percent smaller than React with faster Time to Interactive. Vercel, the deployment platform, also supports SvelteKit directly."
  - question: "How was the Gemini API cost reduced?"
    answer: "Two methods. Shortening the long instruction prompt into a concise form dropped input tokens from about 150 to 25, a roughly 83 percent cost saving. Resizing images to within 1024px also reduced token usage by 70 percent."
  - question: "What are the 3-month KPI targets?"
    answer: "The targets are 500+ monthly visitors, 30 signups, 5 paid conversions, 30,000 yen MRR, and 1,000 OCR API calls. The 6 percent signup rate and 16.7 percent paid conversion are realistic solo-developer figures based on B2B SaaS averages."
---

## Three Days, One Production Launch

Over the past three days I took an AI-powered B2B SaaS from nothing to a live production service. It's called <a href="https://agent-effi-flow.jangwook.net" target="_blank" rel="noopener noreferrer">Agent Effi Flow</a>. The product ships two AI automation tools, Receipt OCR for Tax Refund and Accounting OCR, and it targets Japanese inbound tourism businesses along with SME accounting teams.

What follows isn't a "this is theoretically possible" write-up. It's <strong>what I actually built</strong>. I'll be honest about the stack I picked and why, how the core pieces fit together, where I got stuck, and the KPI targets I set for the first three months.

## Why I Built This SaaS

### Problem Definition

B2B automation needs discovered while working in Japan:

1. <strong>Manual-dependent tax refund processing</strong>: Visual passport and tax refund document verification with manual data entry
2. <strong>Repetitive accounting tasks</strong>: Manual data cleanup after receipt OCR. [AI accounting automation by the numbers](/en/blog/en/effiflow-automation-analysis-part1) shows just how significant this problem is with real data.
3. <strong>Limitations of existing solutions</strong>: Either expensive enterprise solutions or low-accuracy generic OCR

The differentiation point as an individual developer: <strong>Structured data extraction using AI</strong>. Beyond simple text OCR, using Google Gemini API's Structured Output feature to receive type-safe JSON responses immediately usable in business logic. For where the service headed next, see Agent Effi Flow's pivot decision and the Omotenashi bot concept.

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
   
   The broader approach of using AI tools to grow a side project to company scale is covered in Effloow: from side project to AI company. The hands-on details of chaining several agents to automate the work live in [my notes on improving multi-agent orchestration](/en/blog/en/multi-agent-orchestration-improvement).

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

## When to Use This Stack and When to Avoid It

The 3-day launch worked because the problem and the stack lined up well. The same choices are not the right answer for every project.

<strong>When this approach fits well</strong>:

- A solo developer or small team validating an MVP fast. A managed backend (Supabase) and serverless deployment (Vercel) remove almost all of the infrastructure overhead.
- Usage-based services where AI inference cost flows straight into your unit economics. Gemini 2.5 Flash's cheap token pricing protects your margin. For a realistic breakdown of AI operating costs, see <a href="/en/blog/en/ai-agent-cost-reality">The Reality of AI Agent Costs</a>.
- Services with spiky or near-zero early traffic. Serverless billing drops to roughly zero when idle.
- Cases where structured data extraction is the core value. Structured Output removes the entire parsing layer.

<strong>When to avoid or rethink it</strong>:

- Strict data-governance or on-premise requirements. Sending images to an external LLM API can hit compliance walls on its own.
- Latency-sensitive workloads where milliseconds matter. LLM inference takes hundreds of milliseconds to several seconds, so it is a poor fit for real-time processing.
- Steady, predictable high-volume processing in the millions of calls per month. At that scale, dedicated infrastructure or a self-hosted model beats serverless and per-call APIs on unit cost. For a cost-and-impact analysis grounded in real operational data, see <a href="/en/blog/en/effiflow-automation-analysis-part2">Effi Flow Automation Analysis</a>.
- High-stakes domains where an OCR error becomes an incident (medical prescriptions, original legal contracts). You have to keep a human review step, which breaks the "fully automated" premise.

The cost of learning a new tool is not trivial either. A team already fluent in React/Next.js may find that the learning cost of switching to SvelteKit outweighs the bundle-size savings. For the actual patterns of a solo developer raising productivity with AI tools, I wrote them up in <a href="/en/blog/en/claude-code-insights-usage-analysis">Claude Code Usage Analysis</a>.

## References

### Official Documentation

- [SvelteKit Documentation](https://svelte.dev/docs/kit) - SvelteKit official docs
- [Supabase Documentation](https://supabase.com/docs) - Supabase guides
- [Google Gemini API Docs](https://ai.google.dev/gemini-api/docs) - Gemini API documentation
- [Stripe Checkout Docs](https://docs.stripe.com/payments/checkout) - Stripe Checkout guide

### Key Articles Referenced

- [Gemini 3 for developers](https://blog.google/technology/developers/gemini-3-developers/) - Gemini 3 pricing and performance
- [Solo Developer SaaS Success Stories](https://dev.to/dev_tips/the-solo-dev-saas-stack-powering-10kmonth-micro-saas-tools-in-2025-pl7) - Solo developer success cases
- [B2B SaaS Go-to-Market Strategies](https://martal.ca/b2b-saas-marketing-strategies-lb/) - B2B SaaS marketing strategies
- [Stripe Credits for Usage-Based Billing](https://stripe.com/blog/introducing-credits-for-usage-based-billing) - Stripe credit system

## What the Three-Day Launch Taught Me

Launching a production SaaS in 3 days is <strong>possible</strong>. But "build fast" was never the point. The point was <strong>"validate fast."</strong>

Three things made it work:

1. <strong>Right tool selection</strong>: SvelteKit + Supabase + Gemini API
2. <strong>Limited scope</strong>: Start with 2 services, prioritize launch over perfection
3. <strong>Business first</strong>: Focus on solving customer problems over technology

The real journey starts now. The first paid customer, then the feedback, then the long grind of fixing what they tell me is broken. I hope that when I update this article in three months, I get to write "¥30,000 MRR achieved."

Fellow solo developers, let's build together.
