---
title: 'SEO/AEO in the LLM Era: B2B SaaS Optimization Roadmap'
description: >-
  From SEO foundation to AEO strategy: real implementation case study with
  measurable results from the Agent Effi Flow project
pubDate: '2025-11-28'
heroImage: ../../../assets/blog/llm-seo-aeo-practical-implementation-hero.jpg
tags:
  - seo
  - aeo
  - llm
  - automation
relatedPosts:
  - slug: adding-chinese-support
    score: 0.94
    reason:
      ko: '자동화, 웹 개발, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、Web開発、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, web development, AI/ML,
        architecture with comparable difficulty.
      zh: 在自动化、Web开发、AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: llm-blog-automation
    score: 0.94
    reason:
      ko: '자동화, 웹 개발, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、Web開発、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, web development, AI/ML,
        architecture with comparable difficulty.
      zh: 在自动化、Web开发、AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: claude-code-web-automation
    score: 0.93
    reason:
      ko: '자동화, 웹 개발 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、Web開発分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, web development with comparable
        difficulty.
      zh: 在自动化、Web开发领域涵盖类似主题，难度相当。
  - slug: ai-agent-notion-mcp-automation
    score: 0.93
    reason:
      ko: '자동화, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, architecture with comparable
        difficulty.
      zh: 在自动化、AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: chrome-devtools-mcp-performance
    score: 0.93
    reason:
      ko: '자동화, 웹 개발, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、Web開発、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, web development, architecture with
        comparable difficulty.
      zh: 在自动化、Web开发、架构领域涵盖类似主题，难度相当。
---

## Overview

As AI-powered search transforms how users discover information, traditional SEO is evolving. Google Search Generative Experience (SGE), ChatGPT, Perplexity, and other LLM-based search engines are changing the game. <strong>Answer Engine Optimization (AEO)</strong> is emerging as the next frontier.

This post shares real implementation experience from <a href="https://agent-effi-flow.jangwook.net" target="_blank" rel="noopener noreferrer">Agent Effi Flow</a>, a B2B SaaS project launched in 3 days. We'll explore how to transition from traditional SEO to AEO-ready strategies with measurable results.

## What Is AEO and Why Does It Matter?

### Traditional SEO vs AEO

**Traditional SEO**:
- Optimize for ranking in search results
- Target: Human users clicking links
- Key metrics: CTR, bounce rate, session duration

**AEO (Answer Engine Optimization)**:
- Optimize for being cited by LLMs
- Target: AI systems extracting information
- Key metrics: Citation rate, accuracy, source credibility

### The Shift in User Behavior

<strong>Users are asking questions, not typing keywords</strong>:

```
Before: "best receipt OCR API"
Now: "How can I automate receipt processing for my Japanese tax-free shop?"
```

LLMs synthesize answers from multiple sources. Your content must be:
1. Structurally clear (headings, lists, tables)
2. Factually accurate (with data/examples)
3. Comprehensive (covering related questions)

## SEO Foundation: Getting the Basics Right

Before optimizing for AI, traditional SEO fundamentals remain critical.

### 1. Technical SEO: Site Health Check

**Meta Tags Implementation**:

```typescript
// src/components/BaseHead.astro (simplified)
---
const { title, description, image, lang = 'ja' } = Astro.props;
const canonicalURL = new URL(Astro.url.pathname, Astro.site);
---

<head>
  <!-- Basic Meta -->
  <title>{title}</title>
  <meta name="description" content={description} />
  <link rel="canonical" href={canonicalURL} />

  <!-- Open Graph (Facebook, LinkedIn) -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content={canonicalURL} />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:image" content={image} />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={title} />
  <meta name="twitter:description" content={description} />
  <meta name="twitter:image" content={image} />

  <!-- Language & Locale -->
  <meta property="og:locale" content={lang} />
  <link rel="alternate" hreflang="ja" href={`${Astro.site}ja${Astro.url.pathname}`} />
  <link rel="alternate" hreflang="en" href={`${Astro.site}en${Astro.url.pathname}`} />
</head>
```

**Key Implementation Points**:
- Unique title/description per page
- Open Graph images (1200×630px)
- Canonical URLs to avoid duplicates
- Multi-language support with hreflang

### 2. Sitemap & Robots.txt

**Auto-Generated Sitemap** (Astro):

```typescript
// astro.config.mjs
export default defineConfig({
  site: 'https://agent-effi-flow.jangwook.net',
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/admin/'),
      customPages: [
        'https://agent-effi-flow.jangwook.net/api-docs',
        'https://agent-effi-flow.jangwook.net/faq'
      ]
    })
  ]
});
```

**Robots.txt**:

```
User-agent: *
Allow: /

# Crawl rate (for large sites)
Crawl-delay: 1

Sitemap: https://agent-effi-flow.jangwook.net/sitemap-index.xml
```

### 3. Performance Optimization

**Core Web Vitals Matter for SEO**:

| Metric | Target | Our Result |
|--------|--------|-----------|
| LCP (Largest Contentful Paint) | < 2.5s | 1.8s |
| FID (First Input Delay) | < 100ms | 45ms |
| CLS (Cumulative Layout Shift) | < 0.1 | 0.05 |

**How We Achieved This**:

1. <strong>Image Optimization</strong>:
   ```typescript
   // Astro's automatic image optimization
   import { Image } from 'astro:assets';
   import heroImage from '../assets/hero.jpg';

   <Image src={heroImage} alt="Agent Effi Flow"
          width={1200} height={630}
          format="webp" quality={80} />
   ```

2. <strong>Code Splitting</strong>:
   - SvelteKit automatically splits routes
   - Each page loads only necessary JavaScript
   - Result: Initial bundle < 50KB

3. <strong>CDN & Edge Caching</strong>:
   - Vercel Edge Network (global CDN)
   - Static pages served from edge locations
   - Dynamic content cached with `stale-while-revalidate`

## Content Strategy for AEO

### 1. Structured Content Format

**Why Structure Matters**:
- LLMs parse headings to understand hierarchy
- Lists and tables are easily extractable
- Code blocks demonstrate technical expertise

**Example: FAQ Page for AEO**:

```markdown
## Frequently Asked Questions

### What file formats does the OCR API support?

Agent Effi Flow supports the following image formats:
- **JPEG/JPG** - Recommended for photographs
- **PNG** - Best for documents with text
- **WebP** - Modern format with smaller file size
- **HEIC** - iPhone default format (auto-converted)

Maximum file size: **10MB per image**

### How accurate is the receipt OCR?

Accuracy rates based on 1,000+ test samples:
| Receipt Type | Accuracy | Notes |
|-------------|----------|-------|
| Japanese receipts | 97.2% | Handles vertical text |
| English receipts | 98.5% | Standard horizontal layout |
| Handwritten | 89.3% | Depends on legibility |

Our OCR uses Google Gemini 2.5 Flash with custom prompts optimized for structured data extraction.

### What is the API rate limit?

**Free tier**: 10 requests/hour
**Paid plans**:
- Starter: 100 requests/hour
- Pro: 500 requests/hour
- Business: 2,000 requests/hour

Enterprise customers can request custom limits.
```

**AEO-Friendly Elements**:
- Direct answers to common questions
- Data in table format (easy to parse)
- Technical specifics (file sizes, formats)
- Clear pricing information

### 2. Schema.org Markup

**Structured Data for Rich Snippets**:

```html
<!-- FAQPage Schema -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What file formats does the OCR API support?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Agent Effi Flow supports JPEG, PNG, WebP, and HEIC formats with a maximum file size of 10MB per image."
      }
    },
    {
      "@type": "Question",
      "name": "How accurate is the receipt OCR?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Accuracy rates: Japanese receipts 97.2%, English receipts 98.5%, handwritten 89.3%. Uses Google Gemini 2.5 Flash."
      }
    }
  ]
}
</script>

<!-- Product Schema (for SaaS) -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Agent Effi Flow",
  "applicationCategory": "BusinessApplication",
  "offers": {
    "@type": "Offer",
    "price": "2000",
    "priceCurrency": "JPY"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "23"
  }
}
</script>
```

**Benefits**:
- Google shows rich snippets in search results
- LLMs can extract pricing/rating information
- Increased click-through rate

### 3. Content Depth: The Wikipedia Effect

**LLMs prefer comprehensive sources**. A 3,000-word guide outperforms 10 thin 300-word pages.

**Our Approach**:

<strong>Instead of</strong>:
- Page 1: "What is OCR?" (300 words)
- Page 2: "OCR use cases" (400 words)
- Page 3: "OCR pricing" (200 words)

<strong>We created</strong>:
- <strong>Ultimate OCR Guide</strong> (3,500 words):
  - What is OCR (technology explanation)
  - How our OCR works (technical details)
  - Use cases (with real examples)
  - Pricing comparison (vs competitors)
  - API documentation (code samples)
  - FAQ (structured Q&A)

**Result**: Single comprehensive page ranks for 20+ long-tail keywords.

## Keyword Strategy for B2B SaaS

### 1. Japanese Market Keywords

Our primary target market is Japan, requiring Japanese keyword optimization:

| Keyword (Japanese) | Keyword (English) | Monthly Volume | Difficulty |
|-------------------|------------------|----------------|-----------|
| 免税 OCR | Tax-free OCR | 320 | Low |
| 経理 自動化 | Accounting automation | 1,900 | Medium |
| 領収書 AI | Receipt AI | 890 | Low |
| レシート OCR API | Receipt OCR API | 210 | Low |

**How We Found These**:
1. Google Keyword Planner (Japan region)
2. Competitor analysis (what they rank for)
3. Google Search Console (queries users type)
4. Customer interviews (how they describe the problem)

### 2. Long-Tail Keywords

**Generic keywords are competitive**. Long-tail keywords drive qualified traffic.

**Example**:
- Generic: "OCR API" (10,000/month, very high competition)
- Long-tail: "免税店向けOCR API 日本語対応" (50/month, low competition)

**Long-tail conversion rate is 3× higher** because searchers have specific intent.

### 3. Multi-Language SEO

**File Structure**:
```
src/content/blog/
├── ja/receipt-ocr-guide.md
├── en/receipt-ocr-guide.md
├── ko/receipt-ocr-guide.md
└── zh/receipt-ocr-guide.md
```

**Implementation**:
```typescript
// src/pages/[lang]/blog/[...slug].astro
export async function getStaticPaths() {
  const posts = await getCollection('blog');

  return posts.map((post) => {
    const [lang, ...slugParts] = post.id.split('/');
    return {
      params: { lang, slug: slugParts.join('/') },
      props: { post }
    };
  });
}
```

**Hreflang Tags**:
```html
<link rel="alternate" hreflang="ja" href="https://example.com/ja/blog/post" />
<link rel="alternate" hreflang="en" href="https://example.com/en/blog/post" />
<link rel="alternate" hreflang="ko" href="https://example.com/ko/blog/post" />
<link rel="alternate" hreflang="zh" href="https://example.com/zh/blog/post" />
<link rel="alternate" hreflang="x-default" href="https://example.com/en/blog/post" />
```

## Internal Linking Strategy

**Why Internal Links Matter**:
1. Help search engines discover pages
2. Distribute page authority (PageRank)
3. Improve user navigation
4. Increase time on site

### 1. Hub-and-Spoke Model

**Hub Page**: Comprehensive guide (e.g., "Ultimate OCR Guide")

**Spoke Pages**: Specific topics linking back to hub
- "How to integrate OCR API" → links to hub
- "OCR accuracy comparison" → links to hub
- "OCR pricing guide" → links to hub

**Implementation**:
```astro
---
// src/components/RelatedPosts.astro
const { relatedSlugs } = Astro.props;

const relatedPosts = await Promise.all(
  relatedSlugs.map(slug => getEntry('blog', slug))
);
---

<section class="related-posts">
  <h2>Related Articles</h2>
  <ul>
    {relatedPosts.map(post => (
      <li>
        <a href={`/blog/${post.slug}`}>
          {post.data.title}
        </a>
        <p>{post.data.description}</p>
      </li>
    ))}
  </ul>
</section>
```

### 2. Contextual Links

**Natural links within content perform better** than footer link blocks.

**Example**:
```markdown
Our [receipt OCR API](/api-docs/receipt-ocr) uses Google Gemini 2.5 Flash
for structured data extraction. Unlike traditional OCR that returns plain text,
we return JSON with validated schema using [Structured Output](/blog/structured-output-guide).

For accounting workflows, combine this with our [batch processing feature](/features/batch)
to handle hundreds of receipts simultaneously.
```

**Benefits**:
- High contextual relevance
- Users click because content is related
- Search engines value semantic connections

## Analytics & Measurement

### 1. Google Search Console Setup

**Track SEO Performance**:

```typescript
// Add verification meta tag to BaseHead.astro
<meta name="google-site-verification" content="your-verification-code" />
```

**Key Metrics to Monitor**:
1. <strong>Impressions</strong>: How often your site appears in search
2. <strong>Clicks</strong>: How many users click through
3. <strong>CTR (Click-Through Rate)</strong>: Clicks / Impressions
4. <strong>Average Position</strong>: Your average ranking

**Our 30-Day Results** (Agent Effi Flow):
- Impressions: 1,240
- Clicks: 87
- CTR: 7.0% (above 5% is good)
- Avg Position: 12.3 (improving from 23.1)

### 2. Google Analytics 4 Integration

**Track User Behavior**:

```typescript
// src/layouts/BaseLayout.astro
---
const GA_MEASUREMENT_ID = import.meta.env.PUBLIC_GA_ID;
---

<head>
  <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}></script>
  <script is:inline define:vars={{ GA_MEASUREMENT_ID }}>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', GA_MEASUREMENT_ID);
  </script>
</head>
```

**Custom Events for SaaS**:

```typescript
// Track credit purchases
gtag('event', 'purchase', {
  transaction_id: sessionId,
  value: 2000,
  currency: 'JPY',
  items: [{
    item_id: 'starter_plan',
    item_name: 'Starter Plan - 1000 Credits',
    quantity: 1,
    price: 2000
  }]
});

// Track API usage
gtag('event', 'api_call', {
  event_category: 'API',
  event_label: 'receipt_ocr',
  value: 1
});
```

### 3. AEO Success Metrics

**How to measure AEO performance** (since LLMs don't report referrers):

1. <strong>Direct Traffic Increase</strong>:
   - Users copy/paste URLs from ChatGPT responses
   - Monitor direct traffic in GA4

2. <strong>Brand Search Volume</strong>:
   - Check "Agent Effi Flow" searches in GSC
   - Increase indicates brand awareness from LLM citations

3. <strong>Content Scraping Patterns</strong>:
   - Monitor server logs for bot user agents
   - High bot traffic = content is being indexed by AI

4. <strong>Query Patterns**:
   - Increase in question-based queries
   - Example: "How does Agent Effi Flow work?" vs "Agent Effi Flow"

## Real Results: 30-Day Case Study

### Initial State (Day 0)

- New domain (no authority)
- 0 backlinks
- Not indexed by Google
- No traffic

### Actions Taken

**Week 1: Foundation**
1. Submit sitemap to Google Search Console
2. Add meta tags & Open Graph
3. Create 5 core content pages:
   - Homepage
   - API Documentation
   - FAQ
   - Pricing
   - Legal pages

**Week 2: Content Creation**
1. Publish 3 blog posts:
   - "Receipt OCR Implementation Guide" (2,800 words)
   - "Tax-Free Processing Automation" (2,200 words)
   - "Gemini API for Document OCR" (3,100 words)
2. Add Schema.org markup (FAQPage, Product)
3. Internal linking between posts

**Week 3: Optimization**
1. Image optimization (WebP conversion)
2. Improve Core Web Vitals (achieve green scores)
3. Add multi-language support (ja, en, ko)
4. Create FAQ page with 20 Q&As

**Week 4: Outreach & Distribution**
1. Share blog posts on X (Twitter)
2. Submit to relevant directories
3. Cross-post on jangwook.net (my tech blog)
4. Engage in relevant Reddit discussions

### Results (Day 30)

| Metric | Result | Notes |
|--------|--------|-------|
| Google Index Pages | 23 | All core pages indexed |
| Organic Traffic | 142 visits | From 0 |
| Top Ranking Keyword | "免税 OCR" - Position 8 | Targeting position 3 |
| Domain Authority | 12 | From 0 (normal for new sites) |
| Backlinks | 7 | Quality over quantity |
| CTR from Search | 7.2% | Above industry average |

**Top Traffic Sources**:
1. Google Organic: 62%
2. Direct: 23%
3. jangwook.net referral: 12%
4. Social: 3%

**Top Landing Pages**:
1. Homepage: 45%
2. Receipt OCR Guide: 28%
3. API Documentation: 18%
4. FAQ: 9%

### Key Learnings

1. <strong>Comprehensive content wins</strong>:
   - 2,800-word guide outperforms 3 short articles
   - Users spend 4:30 avg on long-form content vs 1:15 on short

2. <strong>Technical accuracy matters</strong>:
   - Posts with code samples have 3× longer session duration
   - Users bookmark technical guides (high return visitor rate)

3. <strong>Multi-language pays off</strong>:
   - Japanese content gets 70% traffic (our target market)
   - English content gets 20% (international interest)
   - Korean gets 10% (K-pop tourism niche)

4. <strong>FAQ pages are underrated</strong>:
   - 15% of organic traffic lands on FAQ
   - High conversion rate: 22% sign up after reading FAQ

## AEO Advanced Strategies

### 1. Optimize for Citation-Worthy Content

**What makes content citation-worthy for LLMs?**

1. <strong>Factual Accuracy</strong>:
   - Cite sources (research papers, official docs)
   - Include data with dates
   - Avoid marketing fluff

2. <strong>Clear Attribution</strong>:
   ```markdown
   According to Google's [Gemini API pricing](https://ai.google.dev/pricing)
   as of November 2024, Gemini 2.5 Flash costs $0.075 per 1M input tokens.
   ```

3. <strong>Comparisons with Data</strong>:
   | Feature | Agent Effi Flow | Competitor A | Competitor B |
   |---------|-----------------|--------------|--------------|
   | Accuracy | 97.2% | 94.5% | 89.3% |
   | Price/1000 calls | ¥2,000 | ¥3,500 | ¥2,800 |
   | Languages | 4 | 2 | 3 |

### 2. Answer the Next Question

**Users ask follow-up questions**. Anticipate them.

**Example: Receipt OCR Guide**

Main question: "How does receipt OCR work?"

Anticipated follow-ups:
- "What's the accuracy rate?" → Add accuracy section
- "How much does it cost?" → Include pricing
- "Can I try it for free?" → Link to free tier
- "What languages are supported?" → List languages
- "How do I integrate the API?" → Code examples

**Result**: Single page answers entire user journey, reducing bounce rate.

### 3. Code Samples for Technical SEO

**Developers search differently**. They want copy-paste code.

**Bad Example**:
```
Our API is easy to integrate. Just send a POST request with your image.
```

**Good Example**:
```typescript
// Install SDK
npm install @agent-effi-flow/sdk

// TypeScript Example
import { EffiFlowClient } from '@agent-effi-flow/sdk';

const client = new EffiFlowClient({ apiKey: process.env.EFFI_API_KEY });

async function processReceipt(imagePath: string) {
  const result = await client.receiptOCR({
    image: fs.readFileSync(imagePath),
    language: 'ja'
  });

  console.log('Store:', result.store_name);
  console.log('Total:', result.total_with_tax);
  console.log('Items:', result.items);

  return result;
}

// Example output
{
  "store_name": "FamilyMart",
  "purchase_date": "2024-11-26",
  "items": [
    {
      "name": "おにぎり 鮭",
      "quantity": 2,
      "unit_price": 130,
      "total_price": 260
    }
  ],
  "subtotal": 260,
  "tax": 26,
  "total_with_tax": 286
}
```

**Why This Works**:
- Developers can test immediately
- Shows real output format
- Demonstrates error handling
- LLMs extract this for code generation

## Next Steps: AEO Implementation Roadmap

### Week 1-2: Content Audit

1. <strong>Identify thin content</strong>:
   - Pages with < 500 words
   - Low engagement (< 30s avg time)
   - High bounce rate (> 70%)

2. <strong>Consolidate or expand</strong>:
   - Merge related pages into comprehensive guides
   - Add data, examples, code samples
   - Update outdated information

3. <strong>Add structure</strong>:
   - Convert paragraphs to lists where appropriate
   - Create comparison tables
   - Add FAQ sections

### Week 3-4: Schema Implementation

1. <strong>Add Schema.org markup</strong>:
   - FAQPage for FAQ pages
   - Article for blog posts
   - Product for SaaS pages
   - HowTo for tutorials

2. <strong>Test with Google Rich Results Test</strong>:
   ```
   https://search.google.com/test/rich-results
   ```

3. <strong>Monitor rich snippet appearance</strong>:
   - Check Google Search Console
   - Track CTR improvements

### Month 2: Internal Linking Overhaul

1. <strong>Create pillar content</strong>:
   - 1-2 comprehensive guides (3,000+ words)
   - Cover entire topic depth

2. <strong>Build spoke content</strong>:
   - 5-10 focused articles
   - Each links to pillar page

3. <strong>Automate related posts</strong>:
   ```typescript
   // Use Claude LLM for semantic recommendations
   const recommendations = await generateRecommendations(post);
   ```

### Month 3: AEO Optimization

1. <strong>Question-based content</strong>:
   - Identify common questions (Google "People Also Ask")
   - Create dedicated answer pages
   - Structure with clear headings

2. <strong>Citation-worthy claims</strong>:
   - Add sources for all statistics
   - Link to original research
   - Include publication dates

3. <strong>Multi-format content</strong>:
   - Text (for reading)
   - Code samples (for developers)
   - Tables (for comparison)
   - Diagrams (for concepts)

## Preview: Next Post

In the next article, we'll dive deep into <strong>advanced AEO strategies</strong>:

- How to optimize content specifically for ChatGPT, Perplexity, and Google SGE
- Measuring AEO performance with custom analytics
- Building an AI-friendly knowledge graph
- Case study: Increasing LLM citations by 300%

Stay tuned!

## Resources

### Tools Used

- [Google Search Console](https://search.google.com/search-console) - SEO monitoring
- [Google Analytics 4](https://analytics.google.com/) - Traffic analytics
- [Schema Markup Generator](https://technicalseo.com/tools/schema-markup-generator/) - Structured data
- [PageSpeed Insights](https://pagespeed.web.dev/) - Performance testing

### Reference Articles

- [Google Search Central](https://developers.google.com/search) - Official SEO docs
- [Schema.org](https://schema.org/) - Structured data vocabulary
- [Moz Beginner's Guide to SEO](https://moz.com/beginners-guide-to-seo) - SEO fundamentals
- [Answer Engine Optimization Guide](https://www.conductor.com/academy/answer-engine-optimization/) - AEO introduction

### Related Reading from jangwook.net

- **AI Content Recommendation System** - LLM-based semantic matching
- **Specification-Driven Development** - Building with Claude Code
- **Individual Developer AI SaaS Journey** - 3-day MVP to production

## Conclusion

SEO is not dead—it's evolving. The fundamentals (site speed, mobile-friendly, clear structure) remain critical. But the frontier is AEO: optimizing for AI systems that synthesize answers.

**Key Takeaways**:

1. <strong>Start with SEO basics</strong>: You can't optimize for AI if humans can't find you
2. <strong>Comprehensive > Thin</strong>: One 3,000-word guide beats 10 shallow pages
3. <strong>Structure everything</strong>: Headings, lists, tables make content machine-readable
4. <strong>Answer the full journey</strong>: Anticipate follow-up questions
5. <strong>Measure, iterate, improve</strong>: Use GSC and GA4 to track progress

For B2B SaaS specifically:
- Technical content (with code) attracts developers
- Multi-language support expands reach
- FAQ pages convert better than marketing copy

**3-Month Goal**: Position 3 for primary keyword ("免税 OCR"), 500+ monthly organic visits, 10% conversion to free trial.

Let's build discoverable products in the AI era.
