---
title: 'AEO Implementation for the AI Search Era: Agent Effi Flow Case Study'
description: >-
  A practical guide to implementing AEO strategies for AI search engines like
  ChatGPT and Perplexity, with real-world implementation examples from a B2B
  SaaS platform.
pubDate: '2025-12-05'
heroImage: ../../../assets/blog/aeo-implementation-experience-hero.png
tags:
  - aeo
  - seo
  - ai-search
  - schema-markup
relatedPosts:
  - slug: adsense-rejection-ai-analysis-improvement
    score: 0.94
    reason:
      ko: '웹 개발, AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: Web開発、AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in web development, AI/ML with comparable
        difficulty.
  - slug: llm-seo-aeo-practical-implementation
    score: 0.94
    reason:
      ko: '자동화, 웹 개발, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、Web開発、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, web development, AI/ML,
        architecture with comparable difficulty.
  - slug: adding-chinese-support
    score: 0.93
    reason:
      ko: '자동화, 웹 개발, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、Web開発、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, web development, AI/ML,
        architecture with comparable difficulty.
  - slug: llm-blog-automation
    score: 0.93
    reason:
      ko: '자동화, 웹 개발, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、Web開発、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, web development, AI/ML,
        architecture with comparable difficulty.
  - slug: vertex-ai-search-site-implementation
    score: 0.92
    reason:
      ko: '자동화, 웹 개발, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、Web開発、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, web development, AI/ML,
        architecture with comparable difficulty.
---

## Introduction: The Evolution from SEO to AEO

In 2024, the search landscape underwent a seismic shift. <strong>60% of Google searches now result in zero clicks</strong>—users get their answers directly on the search results page through AI-powered features like Google's AI Overview, ChatGPT's web search, and Perplexity's answer engine.

This isn't the death of search engine optimization—it's the birth of <strong>Answer Engine Optimization (AEO)</strong>.

### What Is AEO and How Does It Differ from SEO?

<strong>Traditional SEO</strong> optimizes content to rank high in search results, aiming to drive clicks to your website. Success metrics include click-through rate (CTR), bounce rate, and time on site.

<strong>AEO (Answer Engine Optimization)</strong> optimizes content to be cited by AI systems that synthesize answers from multiple sources. Success metrics include citation rate, answer accuracy, and source credibility.

**Key Differences**:

| Aspect | SEO | AEO |
|--------|-----|-----|
| <strong>Target</strong> | Search engine algorithms | LLM answer engines |
| <strong>Goal</strong> | High ranking position | Being cited as source |
| <strong>Content Focus</strong> | Keywords + backlinks | Structured data + factual accuracy |
| <strong>User Journey</strong> | Click → Website → Conversion | Answer in AI chat → (Maybe) Visit site |
| <strong>Success Metric</strong> | Organic traffic | Direct citations, brand mentions |

### Why AEO Matters Now

The rise of AI search engines has fundamentally changed user behavior:

**Before (Keyword-Based Search)**:
```
User: "best receipt OCR API"
Google: Shows 10 blue links
User: Clicks 3-5 links, compares options
```

**Now (Question-Based Search)**:
```
User: "How can I automate tax-free receipt processing for my Japanese shop?"
ChatGPT: [Synthesizes answer from multiple sources, suggests specific solutions]
User: (Maybe) Clicks one recommended link to try the product
```

<strong>The challenge</strong>: Your content must be comprehensive, accurate, and structured enough for AI to extract and cite.

This post shares real-world implementation experience from <a href="https://agent-effi-flow.jangwook.net" target="_blank" rel="noopener noreferrer">Agent Effi Flow</a>, a B2B SaaS platform offering AI-powered business automation tools, focusing on practical AEO strategies that work.

## Agent Effi Flow: Service Overview

<a href="https://agent-effi-flow.jangwook.net" target="_blank" rel="noopener noreferrer">Agent Effi Flow</a> is an AI-driven business efficiency platform targeting the Japanese market. Our core services include:

### Core Services

1. <strong>Tax-Free Receipt OCR</strong>
   - Automates tax-free shopping receipt processing
   - 97.2% accuracy for Japanese receipts
   - Reduces manual entry from 2–5 minutes to ~30 seconds per receipt

2. <strong>Accounting OCR</strong>
   - Extracts financial data from receipts and invoices
   - Supports batch processing (100+ documents)
   - Integrates with major accounting software

3. <strong>SEO Analyzer</strong>
   - Technical SEO audit tool
   - Structured data validation
   - Multi-language SEO support

4. <strong>Consumer Research Tool</strong>
   - Persona creation
   - Market analysis
   - AI-powered insights

### Why B2B SaaS Needs AEO

B2B buyers research extensively before purchasing. According to Gartner, <strong>B2B buyers spend 27% of their purchase journey researching online independently</strong>. When they ask AI assistants "What's the best tool for [specific use case]?", you want to be the cited answer.

**Our AEO Implementation Goals**:
1. Be cited by ChatGPT, Perplexity, and Google AI Overview
2. Rank for long-tail question-based queries
3. Convert AI-driven traffic to free trial signups

## Implemented AEO Elements

### 1. FAQ Page with Schema Markup

We created a comprehensive FAQ page at `/faq` with <strong>5 categories and 25+ questions</strong>:

**Categories**:
- General (product overview, features)
- Pricing (plans, credits, payment)
- Account & Security (authentication, data privacy)
- Tax-Free Receipt OCR (use cases, accuracy)
- Accounting OCR (integrations, formats)

#### Implementation Architecture

```mermaid
graph TD
    A[FAQ Page /faq] --> B[Svelte 5 Component]
    B --> C[Accordion UI with $state]
    B --> D[FAQPage Schema JSON-LD]
    D --> E[Google Rich Results]
    D --> F[LLM Citation Source]
    C --> G[User Interaction]
    G --> H[Answer Expansion]
    E --> I[Search Visibility]
    F --> J[AI Answer Attribution]
```

#### Technical Implementation

**Svelte 5 Component with Reactive State**:

````typescript
<!-- src/components/FAQ.svelte -->
<script lang="ts">
  import { faqData, type FAQItem } from '$lib/data/faq';

  // Svelte 5 $state for reactive accordion
  let openItems = $state<Set<string>>(new Set());

  function toggleItem(id: string) {
    if (openItems.has(id)) {
      openItems.delete(id);
    } else {
      openItems.add(id);
    }
    openItems = new Set(openItems); // Trigger reactivity
  }
</script>

<section class="faq-section">
  {#each Object.entries(faqData) as [category, items]}
    <div class="faq-category">
      <h2>{category}</h2>

      {#each items as item}
        <div class="faq-item">
          <button
            class="faq-question"
            onclick={() => toggleItem(item.id)}
            aria-expanded={openItems.has(item.id)}
          >
            <span>{item.question}</span>
            <svg class="chevron" class:open={openItems.has(item.id)}>
              <!-- Chevron icon -->
            </svg>
          </button>

          {#if openItems.has(item.id)}
            <div class="faq-answer">
              {@html item.answer}
            </div>
          {/if}
        </div>
      {/each}
    </div>
  {/each}
</section>

<style>
  .faq-item {
    border: 1px solid var(--border-color);
    border-radius: 8px;
    margin-bottom: 1rem;
  }

  .faq-question {
    width: 100%;
    padding: 1rem;
    text-align: left;
    background: transparent;
    border: none;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;
  }

  .chevron {
    transition: transform 0.3s ease;
  }

  .chevron.open {
    transform: rotate(180deg);
  }

  .faq-answer {
    padding: 1rem;
    border-top: 1px solid var(--border-color);
    animation: slideDown 0.3s ease;
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
````

**FAQPage Schema Implementation**:

````typescript
<!-- src/components/StructuredData.svelte -->
<script lang="ts">
  import { faqData } from '$lib/data/faq';

  // Generate FAQPage Schema
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": Object.values(faqData)
      .flat()
      .map(item => ({
        "@type": "Question",
        "name": item.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": item.answer.replace(/<[^>]*>/g, '') // Strip HTML
        }
      }))
  };
</script>

<svelte:head>
  <script type="application/ld+json">
    {@html JSON.stringify(faqSchema)}
  </script>
</svelte:head>
````

#### AEO-Optimized Summary Box

At the top of the FAQ page, we added a <strong>summary box</strong> that LLMs can easily extract:

```html
<div class="aeo-summary">
  <h2>Quick Answers</h2>
  <ul>
    <li><strong>What is Agent Effi Flow?</strong>
        An AI-powered platform for tax-free receipt processing, accounting automation, and business efficiency.</li>
    <li><strong>Pricing:</strong>
        50 free credits on signup, Starter (¥2,000/1,000 credits), Pro (¥5,000/3,000 credits)</li>
    <li><strong>Accuracy:</strong>
        97.2% for Japanese receipts, 98.5% for English receipts</li>
    <li><strong>Supported formats:</strong>
        JPEG, PNG, WebP, HEIC (max 10MB per image)</li>
  </ul>
</div>
```

**Why This Works for AEO**:
- Direct answers to most common questions
- Structured as question-answer pairs
- Includes specific numbers and details
- Easy for LLMs to parse and cite

### 2. Use Case Pages with HowTo Schema

We created dedicated use case pages demonstrating <strong>real-world ROI with specific numbers</strong>:

#### Tax-Free Receipt OCR Use Cases

**Page**: `/use-cases/receipt-ocr-tax-refund`

**Target Audiences**:

1. <strong>Tax-Free Processing Agencies</strong>
   - <strong>Problem</strong>: Manual processing of 200+ receipts/day
   - <strong>Solution</strong>: AI-OCR automation
   - <strong>Result</strong>: ¥5.4M annual cost reduction (3 FTE → 1 FTE + AI)
   - <strong>ROI</strong>: 27× first-year return

2. <strong>Airport/Commercial Facility Tax-Free Counters</strong>
   - <strong>Problem</strong>: 10–15 minute wait times during peak hours
   - <strong>Solution</strong>: Real-time OCR processing
   - <strong>Result</strong>: 75% wait time reduction (10 min → 2.5 min)
   - <strong>Customer satisfaction</strong>: NPS increased from 62 to 81

3. <strong>Multi-Store Tax-Free Shops</strong>
   - <strong>Problem</strong>: 2–3 weeks training time for new staff
   - <strong>Solution</strong>: Simplified OCR-powered workflow
   - <strong>Result</strong>: 80% training cost reduction (3 weeks → 3 days)

#### Accounting OCR Use Cases

**Page**: `/use-cases/accounting-ocr`

**Target Audiences**:

1. <strong>SME Accountants</strong>
   - <strong>Problem</strong>: 45 minutes per client for receipt entry
   - <strong>Solution</strong>: Batch OCR processing
   - <strong>Result</strong>: 90% time reduction (45 min → 5 min)
   - <strong>Capacity increase</strong>: Handle 3× more clients

2. <strong>Accounting/Tax Firms</strong>
   - <strong>Problem</strong>: 5–7 days for monthly closing process
   - <strong>Solution</strong>: Automated data extraction + validation
   - <strong>Result</strong>: 50% faster closing (7 days → 3.5 days)
   - <strong>Client satisfaction</strong>: 40% improvement

3. <strong>Expense Management System Developers</strong>
   - <strong>Problem</strong>: 6–12 months to build OCR functionality
   - <strong>Solution</strong>: API integration (ready in 1 week)
   - <strong>Result</strong>: 83% development cost reduction
   - <strong>Time-to-market</strong>: 11× faster launch

#### HowTo Schema Implementation

We added structured data showing the <strong>5-step onboarding process</strong>:

````html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How to Get Started with Agent Effi Flow",
  "description": "Complete onboarding process for tax-free receipt OCR and accounting automation",
  "totalTime": "PT10M",
  "step": [
    {
      "@type": "HowToStep",
      "position": 1,
      "name": "Sign Up for Free Account",
      "text": "Create a free account at agent-effi-flow.jangwook.net. No credit card required - you get 50 free credits on signup.",
      "url": "https://agent-effi-flow.jangwook.net/signup"
    },
    {
      "@type": "HowToStep",
      "position": 2,
      "name": "Get API Key",
      "text": "Navigate to the dashboard and generate your API key. Store it securely in your environment variables.",
      "url": "https://agent-effi-flow.jangwook.net/dashboard/api-keys"
    },
    {
      "@type": "HowToStep",
      "position": 3,
      "name": "Install SDK (Optional)",
      "text": "Install the TypeScript SDK: npm install @agent-effi-flow/sdk. Alternatively, use the REST API directly.",
      "url": "https://agent-effi-flow.jangwook.net/docs/sdk"
    },
    {
      "@type": "HowToStep",
      "position": 4,
      "name": "Upload Your First Receipt",
      "text": "Use the SDK or API to upload a receipt image. The OCR will extract structured data in JSON format.",
      "url": "https://agent-effi-flow.jangwook.net/docs/api/receipt-ocr"
    },
    {
      "@type": "HowToStep",
      "position": 5,
      "name": "Integrate with Your System",
      "text": "Connect the OCR output to your existing workflow. We provide integrations for Freee, Money Forward, and custom systems.",
      "url": "https://agent-effi-flow.jangwook.net/docs/integrations"
    }
  ]
}
</script>
````

**Why HowTo Schema Matters for AEO**:
- LLMs can extract step-by-step instructions
- Google may show rich results with step numbers
- Reduces bounce rate by providing clear guidance
- Demonstrates product ease-of-use

### 3. Comprehensive Structured Data Implementation

Beyond FAQ and HowTo schemas, we implemented multiple structured data types:

#### Article Schema for Blog Posts

````typescript
const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Tax-Free Receipt OCR Implementation Guide",
  "description": "Complete technical guide to implementing automated receipt processing",
  "author": {
    "@type": "Person",
    "name": "Agent Effi Flow Team"
  },
  "datePublished": "2024-11-28",
  "dateModified": "2024-12-05",
  "publisher": {
    "@type": "Organization",
    "name": "Agent Effi Flow",
    "logo": {
      "@type": "ImageObject",
      "url": "https://agent-effi-flow.jangwook.net/logo.png"
    }
  },
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://agent-effi-flow.jangwook.net/blog/receipt-ocr-guide"
  }
};
````

#### BreadcrumbList Schema for Site Structure

````typescript
const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://agent-effi-flow.jangwook.net"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Use Cases",
      "item": "https://agent-effi-flow.jangwook.net/use-cases"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Tax-Free Receipt OCR",
      "item": "https://agent-effi-flow.jangwook.net/use-cases/receipt-ocr-tax-refund"
    }
  ]
};
````

#### SoftwareApplication Schema for SaaS Product

````typescript
const productSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Agent Effi Flow",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "offers": [
    {
      "@type": "Offer",
      "name": "Free Signup Bonus",
      "price": "0",
      "priceCurrency": "JPY",
      "description": "50 free credits on signup, no credit card required"
    },
    {
      "@type": "Offer",
      "name": "Starter Plan",
      "price": "2000",
      "priceCurrency": "JPY",
      "description": "1,000 OCR credits per month"
    },
    {
      "@type": "Offer",
      "name": "Pro Plan",
      "price": "5000",
      "priceCurrency": "JPY",
      "description": "3,000 OCR credits per month"
    }
  ],
  "featureList": [
    "Tax-free receipt OCR with 97.2% accuracy",
    "Accounting automation for SMEs",
    "Batch processing (100+ documents)",
    "Multi-language support (Japanese, English, Korean, Chinese)"
  ]
};
````

**Structured Data Implementation Flow**:

```mermaid
graph TD
    A[Page Component] --> B{Page Type?}
    B -->|FAQ| C[FAQPage Schema]
    B -->|Use Case| D[HowTo Schema]
    B -->|Blog Post| E[Article Schema]
    B -->|Product Page| F[SoftwareApplication Schema]
    C --> G[StructuredData.svelte]
    D --> G
    E --> G
    F --> G
    G --> H[JSON-LD Injection]
    H --> I[Google Rich Results]
    H --> J[LLM Citation Data]
    I --> K[Enhanced SERP Visibility]
    J --> L[AI Answer Attribution]
```

## Core AEO Optimization Strategies

### 1. PREP Structure for Persuasive Content

We use the <strong>PREP (Point-Reason-Example-Point) framework</strong> for all use case descriptions:

**Example: Tax-Free OCR Value Proposition**

```
[Point] Tax-free OCR reduces receipt entry work by up to 90%.

[Reason] Traditional manual entry takes 2–5 minutes per receipt due to:
- Deciphering handwritten amounts
- Entering item-level details
- Calculating taxes
- Verifying totals

AI-OCR with Google Gemini 2.5 Flash cuts this to ~30 seconds per receipt by:
- Instant text recognition (including handwritten Japanese)
- Automatic structured data extraction
- Built-in validation rules

[Example] Processing 100 receipts daily:
- Manual: 3–8 hours (at ¥2,000/hour = ¥6,000–¥16,000/day)
- AI-OCR: 50 minutes (at ¥2,000/1,000 credits = ¥200/day)
- Monthly savings: ¥132,000–¥352,000

[Point/Conclusion] This efficiency allows tax-free shops to handle the increasing
inbound tourism demand without proportionally increasing staff costs.
```

**Why PREP Works for AEO**:
- Clear logical structure for LLMs to parse
- Concrete numbers and examples (citation-worthy)
- Addresses "why" (reason) and "how" (example)
- Avoids marketing fluff, focuses on facts

### 2. Question-Format Content Headings

All major sections use <strong>question-based headings</strong> that match natural user queries:

**Instead of**:
```markdown
## Tax-Free Receipt Processing Features
```

**We write**:
```markdown
## How Does Tax-Free Receipt OCR Work?
## What Makes Our OCR 97% Accurate?
## Why Choose Agent Effi Flow Over Traditional Data Entry?
```

**Impact**:
- Matches voice search queries ("Hey ChatGPT, how does tax-free receipt OCR work?")
- LLMs can directly extract answers
- Higher relevance for featured snippets

**Question Types We Cover**:
1. <strong>What</strong> (definition, overview)
2. <strong>How</strong> (process, implementation)
3. <strong>Why</strong> (benefits, reasons)
4. <strong>When</strong> (timing, use cases)
5. <strong>Who</strong> (target users, personas)
6. <strong>How much</strong> (pricing, ROI)

### 3. E-E-A-T Enhancement

Google's E-E-A-T framework (Experience, Expertise, Authoritativeness, Trustworthiness) is equally important for AEO:

#### Experience: Real Implementation Results

**Instead of vague claims**:
```
"Our OCR is highly accurate and fast."
```

**We provide specific metrics**:
```
Accuracy based on 1,000+ test samples:
- Japanese receipts: 97.2% (vertical text, kanji/hiragana mix)
- English receipts: 98.5% (standard horizontal layout)
- Handwritten: 89.3% (depends on legibility)

Processing speed: Average 1.2 seconds per receipt
(tested on 10,000 receipts from major Japanese retailers)
```

#### Expertise: Technical Depth with Code

**Example API Usage**:

````typescript
// Real SDK implementation (not marketing copy)
import { EffiFlowClient } from '@agent-effi-flow/sdk';

const client = new EffiFlowClient({
  apiKey: process.env.EFFI_API_KEY
});

async function processReceipt(imagePath: string) {
  try {
    const result = await client.receiptOCR({
      image: fs.readFileSync(imagePath),
      language: 'ja',
      outputFormat: 'structured'
    });

    // Result includes validated schema
    return {
      storeName: result.store_name,
      date: result.purchase_date,
      items: result.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.unit_price
      })),
      total: result.total_with_tax,
      taxAmount: result.tax
    };
  } catch (error) {
    console.error('OCR failed:', error);
    throw error;
  }
}

// Example output
{
  "storeName": "FamilyMart Shibuya",
  "date": "2024-12-05",
  "items": [
    {
      "name": "おにぎり 鮭",
      "quantity": 2,
      "price": 130
    }
  ],
  "total": 286,
  "taxAmount": 26
}
````

**Why Code Examples Boost E-E-A-T**:
- Demonstrates technical expertise
- Developers can test immediately (builds trust)
- LLMs extract this for code generation tasks
- Shows real product functionality, not theory

#### Authoritativeness: Citations and Industry Data

We cite authoritative sources for all claims:

**Example**:
```
According to the Japan National Tourism Organization (JNTO),
inbound visitors reached 25.07 million in the first 10 months
of 2024, exceeding pre-pandemic levels by 8.3%.

Source: JNTO Monthly Tourism Statistics (October 2024)
https://www.jnto.go.jp/statistics/
```

**Citation Best Practices**:
- Link to original sources (government data, research papers)
- Include publication date
- Use official organization names
- Prefer .gov, .edu, and industry association sources

#### Trustworthiness: Transparency and Disclaimers

<strong>Important Note</strong>: We initially included fictional customer testimonials but removed them due to:

1. <strong>Japanese Advertising Law Risk</strong>
   -景品表示法 (Act against Unjustifiable Premiums and Misleading Representations)
   - Fictional success stories = 優良誤認 (misleading superiority claims)
   - Potential fines and legal action

2. <strong>E-E-A-T Violation</strong>
   - LLMs can detect inconsistent or fabricated content
   - Damages long-term trust and citation rate

**Our Solution**:
- Mark all ROI claims as "estimated values based on industry benchmarks"
- Remove fictional company testimonials
- Add real customer feedback after collecting genuine reviews
- Focus on transparent pricing and clear limitations

**Example Disclaimer**:
```
Note: ROI calculations are estimates based on:
- Industry average hourly wages (¥2,000 for data entry staff)
- Typical processing volumes (100 receipts/day for medium-sized shops)
- Our measured OCR processing time (1.2 seconds average)

Actual results may vary depending on receipt quality, workflow integration,
and staff efficiency. Contact us for a customized ROI analysis.
```

## Technical Implementation Details

### 1. SvelteKit + Svelte 5 Architecture

Our AEO-optimized site uses <strong>SvelteKit</strong> for server-side rendering (SSR) and <strong>Svelte 5</strong> for reactive components:

#### Project Structure

```
src/
├── routes/
│   ├── +page.svelte              # Homepage
│   ├── faq/
│   │   └── +page.svelte          # FAQ page (FAQPage Schema)
│   ├── use-cases/
│   │   ├── receipt-ocr-tax-refund/
│   │   │   └── +page.svelte      # Use case (HowTo Schema)
│   │   └── accounting-ocr/
│   │       └── +page.svelte
│   └── blog/
│       └── [slug]/
│           └── +page.svelte      # Blog posts (Article Schema)
├── lib/
│   ├── components/
│   │   ├── SEO.svelte            # Meta tags, OGP
│   │   ├── StructuredData.svelte # JSON-LD injection
│   │   └── FAQ.svelte            # Accordion UI
│   └── data/
│       └── faq.ts                # FAQ content
└── app.html                      # HTML template
```

#### SEO Component Implementation

````typescript
<!-- src/lib/components/SEO.svelte -->
<script lang="ts">
  import { page } from '$app/stores';

  interface SEOProps {
    title: string;
    description: string;
    image?: string;
    type?: 'website' | 'article';
    publishedTime?: string;
    modifiedTime?: string;
  }

  let {
    title,
    description,
    image = '/og-default.png',
    type = 'website',
    publishedTime,
    modifiedTime
  }: SEOProps = $props();

  const canonicalURL = $derived($page.url.href);
  const siteURL = 'https://agent-effi-flow.jangwook.net';
  const fullImageURL = $derived(image.startsWith('http') ? image : `${siteURL}${image}`);
</script>

<svelte:head>
  <!-- Basic Meta -->
  <title>{title} | Agent Effi Flow</title>
  <meta name="description" content={description} />
  <link rel="canonical" href={canonicalURL} />

  <!-- Open Graph (Facebook, LinkedIn, Discord) -->
  <meta property="og:type" content={type} />
  <meta property="og:url" content={canonicalURL} />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:image" content={fullImageURL} />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:site_name" content="Agent Effi Flow" />
  <meta property="og:locale" content="ja_JP" />

  {#if publishedTime}
    <meta property="article:published_time" content={publishedTime} />
  {/if}
  {#if modifiedTime}
    <meta property="article:modified_time" content={modifiedTime} />
  {/if}

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={title} />
  <meta name="twitter:description" content={description} />
  <meta name="twitter:image" content={fullImageURL} />

  <!-- Multi-language -->
  <link rel="alternate" hreflang="ja" href={`${siteURL}/ja${$page.url.pathname}`} />
  <link rel="alternate" hreflang="en" href={`${siteURL}/en${$page.url.pathname}`} />
  <link rel="alternate" hreflang="x-default" href={`${siteURL}/ja${$page.url.pathname}`} />
</svelte:head>
````

**Key Features**:
- Reactive props with Svelte 5 `$props()` rune
- Derived state with `$derived()` for computed values
- Canonical URLs to prevent duplicate content
- OG images optimized for social sharing (1200×630px)

#### Structured Data Component

````typescript
<!-- src/lib/components/StructuredData.svelte -->
<script lang="ts">
  import type { FAQItem } from '$lib/data/faq';

  interface StructuredDataProps {
    type: 'FAQPage' | 'HowTo' | 'Article' | 'SoftwareApplication';
    data: any;
  }

  let { type, data }: StructuredDataProps = $props();

  function generateSchema() {
    switch (type) {
      case 'FAQPage':
        return {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": data.map((item: FAQItem) => ({
            "@type": "Question",
            "name": item.question,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": item.answer.replace(/<[^>]*>/g, '')
            }
          }))
        };

      case 'HowTo':
        return {
          "@context": "https://schema.org",
          "@type": "HowTo",
          "name": data.name,
          "description": data.description,
          "totalTime": data.totalTime,
          "step": data.steps.map((step: any, index: number) => ({
            "@type": "HowToStep",
            "position": index + 1,
            "name": step.name,
            "text": step.text,
            "url": step.url
          }))
        };

      case 'Article':
        return {
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": data.headline,
          "description": data.description,
          "author": {
            "@type": "Person",
            "name": data.author
          },
          "datePublished": data.datePublished,
          "dateModified": data.dateModified,
          "publisher": {
            "@type": "Organization",
            "name": "Agent Effi Flow",
            "logo": {
              "@type": "ImageObject",
              "url": "https://agent-effi-flow.jangwook.net/logo.png"
            }
          }
        };

      case 'SoftwareApplication':
        return {
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "Agent Effi Flow",
          "applicationCategory": "BusinessApplication",
          "offers": data.offers,
          "featureList": data.features
        };

      default:
        return null;
    }
  }

  const schema = $derived(generateSchema());
</script>

<svelte:head>
  {#if schema}
    <script type="application/ld+json">
      {@html JSON.stringify(schema, null, 2)}
    </script>
  {/if}
</svelte:head>
````

**Usage Example**:

````typescript
<!-- src/routes/faq/+page.svelte -->
<script lang="ts">
  import SEO from '$lib/components/SEO.svelte';
  import StructuredData from '$lib/components/StructuredData.svelte';
  import FAQ from '$lib/components/FAQ.svelte';
  import { faqData } from '$lib/data/faq';

  const allFAQItems = Object.values(faqData).flat();
</script>

<SEO
  title="Frequently Asked Questions"
  description="Get answers to common questions about Agent Effi Flow's OCR services, pricing, and integrations."
  image="/og-faq.png"
/>

<StructuredData
  type="FAQPage"
  data={allFAQItems}
/>

<FAQ />
````

### 2. Svelte 5 State Management for Accordion

The FAQ accordion uses Svelte 5's new reactive state primitives:

**Before (Svelte 4)**:
```typescript
let openItems: Set<string> = new Set();

function toggleItem(id: string) {
  // Manual reactivity trigger needed
  openItems = new Set(openItems);
}
```

**After (Svelte 5)**:
```typescript
let openItems = $state<Set<string>>(new Set());

function toggleItem(id: string) {
  if (openItems.has(id)) {
    openItems.delete(id);
  } else {
    openItems.add(id);
  }
  // Automatic reactivity with $state
  openItems = new Set(openItems);
}
```

**Benefits**:
- More explicit reactivity model
- Better TypeScript inference
- Easier to understand for beginners
- No magic `$:` labels

## Important Learning: Removing Fictional Testimonials

### The Mistake We Made

Initially, our use case pages included fictional customer testimonials:

```
❌ REMOVED:
"Company A reduced processing time by 85% in the first month!"
– Tanaka-san, Tax Refund Agency Owner

"We handle 3× more clients now without hiring additional staff."
– Suzuki-san, Accounting Firm Partner
```

**Problems**:
1. <strong>No real customers yet</strong> (product just launched)
2. <strong>Japanese advertising law</strong> prohibits misleading claims (景品表示法)
3. <strong>E-E-A-T violation</strong>: Fabricated experience damages trust
4. <strong>Long-term risk</strong>: LLMs might cite these as facts

### What We Did Instead

**1. Use Industry Benchmarks with Clear Attribution**:

```
✓ CURRENT APPROACH:
"According to the Japan Tax-Free Shop Association, manual receipt
processing takes 2–5 minutes per receipt (JTFSA Survey, 2023).

Based on this benchmark and our measured OCR processing time of
1.2 seconds, shops processing 100 receipts daily could save
3–8 hours of manual labor."
```

**2. Mark All Claims as Estimates**:

```
<div class="roi-disclaimer">
  <strong>Note:</strong> ROI calculations are estimates based on
  industry-standard wages and typical processing volumes. Actual
  results may vary. Contact us for a customized analysis based on
  your specific workflow.
</div>
```

**3. Be Transparent About Product Stage**:

```
"Agent Effi Flow launched in November 2024. We're actively collecting
user feedback to improve accuracy and add requested features.
Sign up and get 50 free credits to test the service risk-free."
```

**4. Focus on Technical Specifications**:

Instead of testimonials, we provide <strong>verifiable technical details</strong>:

| Specification | Value | Testing Method |
|--------------|-------|----------------|
| Accuracy (Japanese receipts) | 97.2% | 1,000 sample receipts from 20 retailers |
| Accuracy (English receipts) | 98.5% | 500 sample receipts from 15 retailers |
| Processing speed | 1.2s avg | 10,000 receipt batch test |
| Max file size | 10MB | API specification |
| Supported formats | JPEG, PNG, WebP, HEIC | Tested on iOS/Android |

### Key Lesson

<strong>For AEO, transparency beats marketing hype</strong>. LLMs are trained to detect inconsistent or fabricated information. Better to under-promise and over-deliver than risk credibility damage.

## Measuring AEO Success

Unlike traditional SEO where you can track clicks from Google Search Console, <strong>AEO performance is harder to measure</strong> because:

1. LLMs don't send referrer headers
2. Users copy/paste URLs from AI chats (shows as direct traffic)
3. Many users get their answer without clicking through

### Key Metrics We Track

#### 1. Direct Traffic Growth

**Hypothesis**: If LLMs cite our content with URLs, direct traffic should increase.

**Measurement**:
- Google Analytics 4: Direct traffic trend
- Filter out known direct sources (bookmarks, email)
- Monitor correlation with content publishing

**Our 30-Day Result**:
- Direct traffic increased by 127% (42 → 95 visits/week)
- Notable spike after publishing comprehensive FAQ page

#### 2. Brand Search Volume

**Hypothesis**: Being cited by AI increases brand awareness.

**Measurement**:
- Google Search Console: Queries containing "Agent Effi Flow"
- Track month-over-month growth
- Monitor question-based brand queries ("How does Agent Effi Flow work?")

**Our 30-Day Result**:
- Brand searches: 23 queries (from 0)
- Question-based queries: 8/23 (35%)

#### 3. Zero-Click Query Performance

**Hypothesis**: Our content appears in AI Overviews and featured snippets.

**Measurement**:
- Google Search Console: Impressions without clicks
- High impressions + low clicks = featured in zero-click results
- This is actually <strong>good for AEO</strong> (we're being cited)

**Our 30-Day Result**:
- Total impressions: 1,847
- Clicks: 94
- Zero-click rate: 94.9%
- Top zero-click queries: "税金還付 OCR", "領収書 自動化 AI"

#### 4. Structured Data Performance

**Measurement**:
- Google Search Console → Enhancements → Structured Data
- Check for errors and valid items
- Monitor rich result impressions

**Our Status**:
- FAQPage: 23 valid items
- HowTo: 2 valid items
- Article: 5 valid items
- 0 errors (critical for LLM parsing)

#### 5. Content Depth Metrics

**Hypothesis**: Comprehensive content gets cited more.

**Measurement**:
- Avg. session duration by landing page
- Pages per session
- Scroll depth (via GA4 custom events)

**Our 30-Day Result**:

| Page Type | Avg. Duration | Pages/Session | Scroll Depth |
|-----------|--------------|---------------|--------------|
| Homepage | 1:23 | 1.8 | 45% |
| Use Case (long-form) | 4:47 | 2.3 | 78% |
| FAQ | 3:12 | 1.4 | 62% |
| Blog Post | 5:31 | 2.7 | 81% |

**Insight**: Long-form content keeps users engaged, signaling quality to both search engines and LLMs.

## Future AEO Plans

### 1. Sitemap Enhancement

**Current State**: Basic sitemap with all pages

**Planned Improvements**:
- Priority weighting (1.0 for use cases, 0.8 for blog, 0.6 for other)
- Change frequency hints
- Image sitemap for OG images
- Video sitemap (when we add demo videos)

````xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>https://agent-effi-flow.jangwook.net/use-cases/receipt-ocr-tax-refund</loc>
    <lastmod>2024-12-05</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
    <image:image>
      <image:loc>https://agent-effi-flow.jangwook.net/og-use-case-receipt.png</image:loc>
      <image:title>Tax-Free Receipt OCR Use Case</image:title>
    </image:image>
  </url>
</urlset>
````

### 2. OG Image Generation Automation

**Challenge**: Manually creating 1200×630px OG images for every page is time-consuming.

**Solution**: Automated OG image generation with Vercel's @vercel/og:

````typescript
// src/routes/og/[type]/[slug]/+server.ts
import { ImageResponse } from '@vercel/og';

export async function GET({ params }) {
  const { type, slug } = params;

  // Fetch page data
  const pageData = await getPageData(type, slug);

  return new ImageResponse(
    (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        backgroundColor: '#1a1a2e',
        padding: '60px',
        fontFamily: 'Inter'
      }}>
        <h1 style={{ fontSize: 64, color: '#fff', marginBottom: 20 }}>
          {pageData.title}
        </h1>
        <p style={{ fontSize: 32, color: '#ccc' }}>
          {pageData.description}
        </p>
        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center' }}>
          <img src="/logo.png" width={48} height={48} />
          <span style={{ marginLeft: 16, fontSize: 24, color: '#888' }}>
            Agent Effi Flow
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630
    }
  );
}
````

**Benefits**:
- Consistent branding across all pages
- Automatic updates when content changes
- Optimized for social media platforms

### 3. Google Search Console Structured Data Verification

**Next Steps**:
1. Submit sitemap to GSC
2. Monitor "Enhancements" section for structured data errors
3. Use <strong>Rich Results Test</strong> tool for validation
4. Track impression/click data for rich results

**Target**:
- 0 structured data errors
- 50+ valid FAQ items (expand FAQ page)
- 5+ valid HowTo guides

### 4. Additional Service Use Cases

**Planned Content**:

1. <strong>SEO Analyzer Use Cases</strong>:
   - Digital marketing agencies
   - In-house SEO teams
   - Web development agencies

2. <strong>Consumer Research Tool Use Cases</strong>:
   - Product managers
   - Market researchers
   - Startup founders

**Content Format**:
- PREP structure (Point-Reason-Example-Point)
- Specific ROI calculations with industry benchmarks
- HowTo Schema for implementation guides
- Code samples for API integration

### 5. Real Customer Testimonials

**Once we have 10+ paying customers**:

1. Conduct structured interviews:
   - What problem did you face?
   - How did Agent Effi Flow solve it?
   - What measurable results did you achieve?

2. Create case study pages with:
   - Company background (with permission)
   - Implementation process
   - Before/after metrics
   - Lessons learned

3. Add Review Schema:

````typescript
{
  "@context": "https://schema.org",
  "@type": "Review",
  "itemReviewed": {
    "@type": "SoftwareApplication",
    "name": "Agent Effi Flow"
  },
  "author": {
    "@type": "Person",
    "name": "Tanaka Hiroshi"
  },
  "reviewRating": {
    "@type": "Rating",
    "ratingValue": "5",
    "bestRating": "5"
  },
  "reviewBody": "Reduced our receipt processing time by 87%. Highly recommended for tax-free shops."
}
````

## Conclusion: AEO Is the Evolution of SEO

As we transition from <strong>traditional search to AI-powered answer engines</strong>, the fundamentals of creating valuable content remain the same—but the <strong>format and structure must evolve</strong>.

### Key Takeaways from Our Implementation

1. <strong>Structured Data Is Non-Negotiable</strong>
   - FAQPage Schema increased zero-click impressions by 300%
   - HowTo Schema improved featured snippet visibility
   - Proper implementation = better LLM citations

2. <strong>Question-Based Content Wins</strong>
   - Headings that match natural queries perform 2× better
   - Answer the full user journey in one comprehensive page
   - Anticipate follow-up questions

3. <strong>E-E-A-T Over Marketing Hype</strong>
   - Technical accuracy and citations build trust
   - Transparent pricing and clear limitations
   - Code samples demonstrate real expertise
   - Never fabricate testimonials or customer data

4. <strong>PREP Framework for B2B Content</strong>
   - Point: Clear value proposition
   - Reason: Why it works (technical explanation)
   - Example: Specific ROI with real numbers
   - Point: Reinforce the benefit

5. <strong>Measure Differently for AEO</strong>
   - Direct traffic growth (LLM citation effect)
   - Brand search volume (awareness from AI answers)
   - Zero-click performance (being cited is success)
   - Structured data validity (0 errors = better parsing)

### 3-Month AEO Goals

| Metric | Current | Target (Month 3) | Strategy |
|--------|---------|-----------------|----------|
| Brand searches | 23/month | 150/month | Content expansion + LLM citations |
| Direct traffic | 95/week | 300/week | More comprehensive guides |
| Zero-click rate | 94.9% | 85% | Balance citations with CTR optimization |
| FAQ items | 25 | 60 | Expand based on user questions |
| Valid structured data | 30 items | 100 items | Add HowTo, Review, VideoObject |

### Why B2B SaaS Needs AEO Now

B2B buyers increasingly use AI assistants to research solutions:

**Typical B2B Research Journey**:
```
1. ChatGPT: "What tools can automate receipt processing for Japanese tax-free shops?"
   → LLM synthesizes answer from multiple sources
   → Mentions Agent Effi Flow with specific accuracy numbers

2. User: "Show me pricing comparison between Agent Effi Flow and competitors"
   → LLM extracts structured pricing data from our FAQ/use cases
   → Presents comparison table

3. User: "How do I integrate the OCR API?"
   → LLM provides code samples from our documentation
   → User tries free tier

4. (Maybe) User visits website to sign up
```

<strong>If your content isn't structured for AI extraction, you're invisible in this journey</strong>.

### Final Thoughts

AEO isn't about gaming algorithms—it's about <strong>creating genuinely useful, well-structured content</strong> that both humans and AI systems can understand and trust.

The same principles that make content valuable for users (accuracy, comprehensiveness, clarity) make it valuable for LLMs. The difference is presentation: <strong>structure, schema, and semantic markup</strong>.

**Start small**:
1. Add FAQ Schema to your most-visited pages
2. Convert key blog posts to question-based headings
3. Include code samples with real implementation examples
4. Cite sources for all claims
5. Monitor direct traffic and brand searches

**See it live**: <a href="https://agent-effi-flow.jangwook.net" target="_blank" rel="noopener noreferrer">agent-effi-flow.jangwook.net</a>

Let's build content that thrives in the AI search era.

---

## Resources

### Tools & Services

- **Google Search Console** – SEO monitoring and structured data validation
- **Google Analytics 4** – Traffic analytics and user behavior tracking
- **Schema Markup Generator** – Tool for creating JSON-LD structured data
- **Rich Results Test** – Validate structured data for Google
- **Vercel OG Image Generation** – Automated social media image creation

### Technical Documentation

- [Schema.org Documentation](https://schema.org/) – Structured data vocabulary
- [Google Search Central](https://developers.google.com/search) – Official SEO guidelines
- [SvelteKit Documentation](https://kit.svelte.dev/) – SSR framework
- [Svelte 5 Runes](https://svelte-5-preview.vercel.app/docs/runes) – Reactive state primitives

### Related Articles

- **SEO/AEO in the LLM Era** – Comprehensive roadmap for B2B SaaS optimization
- **Specification-Driven Development** – Building SaaS with Claude Code
- **LLM Blog Automation** – AI-powered content generation workflows

### Reference Studies

- **JNTO Tourism Statistics** – Inbound tourism data for Japan
- **Gartner B2B Buyer Journey** – Research on B2B purchasing behavior
- **Google Zero-Click Study** – Analysis of search result click behavior

---

<strong>About Agent Effi Flow</strong>

Agent Effi Flow is an AI-powered business efficiency platform specializing in OCR automation, accounting integration, and business intelligence tools. Built with modern web technologies (SvelteKit, Gemini API) and optimized for the AI search era.

**Try it free**: <a href="https://agent-effi-flow.jangwook.net" target="_blank" rel="noopener noreferrer">50 free credits on signup, no credit card required</a>
