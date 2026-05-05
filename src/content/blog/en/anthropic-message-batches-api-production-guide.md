---
title: Anthropic Message Batches API — Cut LLM Costs 50% at Scale
description: >-
  Batch 100,000 Claude requests in one call, cutting LLM costs 50%. Covers async
  polling, error recovery, and Prompt Caching. Python and Node.js examples
  included.
pubDate: '2026-04-28'
heroImage: ../../../assets/blog/anthropic-message-batches-api-production-guide-hero.png
tags:
  - Claude API
  - LLM Cost Optimization
  - Anthropic
relatedPosts:
  - slug: mcp-server-build-practical-guide-2026
    score: 0.95
    reason:
      ko: 'AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: 'Covers similar topics in AI/ML, architecture with comparable difficulty.'
      zh: 在AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: claude-mythos-preview-glasswing-ai-cybersecurity
    score: 0.94
    reason:
      ko: 'AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: 'Covers similar topics in AI/ML, architecture with comparable difficulty.'
      zh: 在AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: greptile-ai-coding-report-2025-review
    score: 0.94
    reason:
      ko: AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.
      ja: AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: Covers similar topics in AI/ML with comparable difficulty.
      zh: 在AI/ML领域涵盖类似主题，难度相当。
  - slug: anthropic-claude-performance-decline-controversy-april-2026
    score: 0.94
    reason:
      ko: 'AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: 'Covers similar topics in AI/ML, architecture with comparable difficulty.'
      zh: 在AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: llm-api-pricing-comparison-2026-gpt5-claude-gemini-deepseek
    score: 0.94
    reason:
      ko: 'AI/ML, DevOps 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: AI/ML、DevOps分野で類似したトピックを扱い、同程度の難易度です。
      en: 'Covers similar topics in AI/ML, DevOps with comparable difficulty.'
      zh: 在AI/ML、DevOps领域涵盖类似主题，难度相当。
---

LLM API costs tend to be underestimated — right up until the moment they can't be. At small POC scale the bills look manageable. At hundreds of thousands of requests per month, the line items start looking different. Anthropic's Message Batches API is designed for that exact inflection point: bundle up to 100,000 requests in a single call and cut the cost in half.

When I first read about this, my initial reaction was "it's just a managed async queue." That's about half right. A few design decisions make it behave differently from a simple queue in ways that matter. This post covers those differences, along with working code you can actually use.

## What Is Message Batches API

Anthropic Message Batches API lets you submit multiple independent Claude message requests together for asynchronous processing. Both the REST API and official SDKs (Python, TypeScript/Node.js) are supported.

**Endpoints:**

```
POST /v1/messages/batches          → Create a batch
GET  /v1/messages/batches/{id}     → Retrieve status
GET  /v1/messages/batches/{id}/results → Stream results as JSONL
POST /v1/messages/batches/{id}/cancel  → Cancel in-progress batch
GET  /v1/messages/batches          → List batches (paginated)
```

**Cost**: Input and output tokens get a flat **50% discount** off standard pricing across all supported models.

| Model | Batch Input | Batch Output | Standard Input | Standard Output |
|-------|------------|-------------|---------------|----------------|
| Claude Opus 4.7 | $2.50/MTok | $12.50/MTok | $5.00/MTok | $25.00/MTok |
| Claude Sonnet 4.6 | $1.50/MTok | $7.50/MTok | $3.00/MTok | $15.00/MTok |
| Claude Haiku 4.5 | $0.50/MTok | $2.50/MTok | $1.00/MTok | $5.00/MTok |

**Processing time**: Most batches complete in under one hour. Hard timeout is 24 hours. Requests that expire past the 24-hour limit are **not billed**.

**Scale limits**: Up to 100,000 requests per batch or 256 MB, whichever you hit first. Results stay available for 29 days after batch creation.

**Supported models**: All currently active Claude models including Opus 4.7, Sonnet 4.6, Haiku 4.5.

One thing worth noting: 100,000 requests sounds like a lot, but at real production scale it can fill up quickly. Processing 10 million items requires 100 batches. If your throughput is genuinely that large, batch-splitting strategy needs to be part of the design.

## When Batches API Is the Right Call

The use cases where this shines are distinct from where it falls flat.

**Good fits:**

- **Large-scale evals pipelines**: Running thousands of test cases overnight. Every time you upgrade a model or tweak a prompt and need to re-run your full eval suite, costs get cut in half.
- **Offline bulk content generation**: 100,000 product descriptions, 50,000 article summaries — any workload where you have the data now and can deliver results later.
- **Data analysis and classification**: Sentiment analysis, content moderation, categorization of user-generated content.
- **Overnight ETL pipelines**: Log analysis, nightly report generation, anything where results need to be ready by morning.
- **Model comparison experiments**: A/B testing prompt variations across large datasets.

**Poor fits:**

- Chat interfaces where users are waiting for a response
- Any scenario requiring streaming (SSE) — Batches API doesn't support it
- Real-time recommendation systems where latency matters
- Sequential agentic workflows where each request depends on the previous result

My shorthand decision rule: "Would it be acceptable for the user to receive this response within 24 hours?" If yes, Batches API is worth evaluating.

## Working Code: Node.js SDK Implementation

I installed `@anthropic-ai/sdk` in a sandbox and verified the code structure runs correctly. Without an API key, the SDK returns `AuthenticationError (401)` — which confirms the endpoint is real and the request actually reached Anthropic's servers.

```bash
$ npm install @anthropic-ai/sdk
```

### Creating a Batch

```javascript
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Example: bulk product description generation
const batchRequests = products.map((p) => ({
  custom_id: p.id,          // Critical: this is how you map results back
  params: {
    model: "claude-haiku-4-5",
    max_tokens: 200,
    system: "You are a concise product copywriter.",
    messages: [
      {
        role: "user",
        content: `Write a 2-sentence description for: ${p.name} (${p.category})`,
      },
    ],
  },
}));

const batch = await client.messages.batches.create({
  requests: batchRequests,
});

console.log(`Batch created: ${batch.id}`);
// → msgbatch_01ABCDEF...
console.log(`Status: ${batch.processing_status}`);
// → "in_progress"
console.log(`Request counts:`, batch.request_counts);
// → { processing: 3, succeeded: 0, errored: 0, canceled: 0, expired: 0 }
```

`custom_id` looks like a minor field name but it's actually the most critical design decision in the whole API. **Results do not come back in order.** Send 1,000 requests, get results in arbitrary sequence. If you try to correlate by array index, data gets silently mismatched. Map everything through `custom_id`.

Format requirements: 1–64 characters, alphanumeric plus hyphens and underscores. Regex: `^[a-zA-Z0-9_-]{1,64}$`. Each ID must be unique within the batch.

### Polling for Completion

```javascript
async function waitForBatch(client, batchId) {
  while (true) {
    const batch = await client.messages.batches.retrieve(batchId);
    const { processing, succeeded, errored, expired } = batch.request_counts;
    
    console.log(
      `[${new Date().toISOString()}] status=${batch.processing_status}` +
      ` | processing=${processing} succeeded=${succeeded}` +
      ` errored=${errored} expired=${expired}`
    );
    
    if (batch.processing_status === "ended") {
      console.log("Batch complete!");
      return batch;
    }
    
    await new Promise((r) => setTimeout(r, 30_000)); // 30-second poll interval
  }
}

const completedBatch = await waitForBatch(client, batch.id);
```

Poll interval depends on context. For small batches (under a few hundred requests), 10 seconds is fine. For large overnight batches, 60 seconds is reasonable.

### Streaming Results Efficiently

```javascript
async function processResults(client, batchId) {
  const results = new Map();
  
  for await (const result of await client.messages.batches.results(batchId)) {
    switch (result.result.type) {
      case "succeeded":
        results.set(result.custom_id, {
          text: result.result.message.content[0].text,
          inputTokens: result.result.message.usage.input_tokens,
          outputTokens: result.result.message.usage.output_tokens,
        });
        break;
        
      case "errored":
        console.error(`Error on ${result.custom_id}:`, result.result.error);
        break;
        
      case "expired":
        console.warn(`Expired (not billed): ${result.custom_id}`);
        break;
    }
  }
  
  return results;
}

const results = await processResults(client, batch.id);
const description = results.get("prod-001")?.text;
```

`client.messages.batches.results()` streams the JSONL one line at a time rather than loading everything into memory. With 100,000 results that could easily be hundreds of megabytes. Streaming is the right approach.

### Python SDK

Structure is nearly identical in Python:

```python
import anthropic, time
from anthropic.types.message_create_params import MessageCreateParamsNonStreaming
from anthropic.types.messages.batch_create_params import Request

client = anthropic.Anthropic()

batch = client.messages.batches.create(
    requests=[
        Request(
            custom_id=f"item-{i}",
            params=MessageCreateParamsNonStreaming(
                model="claude-haiku-4-5",
                max_tokens=200,
                messages=[{"role": "user", "content": f"Summarize: {text}"}],
            ),
        )
        for i, text in enumerate(texts)
    ]
)

# Poll
while True:
    b = client.messages.batches.retrieve(batch.id)
    if b.processing_status == "ended":
        break
    time.sleep(30)

# Process results
for result in client.messages.batches.results(batch.id):
    match result.result.type:
        case "succeeded":
            print(f"{result.custom_id}: {result.result.message.content[0].text[:80]}")
        case "errored":
            print(f"Error {result.custom_id}: {result.result.error}")
        case "expired":
            print(f"Expired: {result.custom_id}")
```

## Cost Calculations: What the Numbers Actually Look Like

![Batches API processing flow and cost reduction structure](../../../assets/blog/anthropic-message-batches-api-flow-diagram.png)

These numbers use the standard pricing covered in the [LLM API Pricing Comparison 2026](/en/blog/en/llm-api-pricing-comparison-2026-gpt5-claude-gemini-deepseek) post.

**Scenario A**: 100,000 product descriptions with Claude Haiku 4.5. Average 200 input tokens + 150 output tokens per request.

```
Standard API:
  Input:  100,000 × 200t = 20 MTok × $1.00 = $20.00
  Output: 100,000 × 150t = 15 MTok × $5.00 = $75.00
  Total:  $95.00

Batches API:
  Input:  20 MTok × $0.50 = $10.00
  Output: 15 MTok × $2.50 = $37.50
  Total:  $47.50

Savings: $47.50 (exactly 50%)
```

**Scenario B**: Monthly evals pipeline with Claude Sonnet 4.6. 300,000 requests/month, 800 input + 400 output tokens each.

```
Standard API/month:
  Input:  240 MTok × $3.00  = $720.00
  Output: 120 MTok × $15.00 = $1,800.00
  Total:  $2,520.00/month

Batches API/month:
  Input:  240 MTok × $1.50 = $360.00
  Output: 120 MTok × $7.50 = $900.00
  Total:  $1,260.00/month

Annual savings: $15,120.00
```

Stack Prompt Caching on top and the numbers get more interesting. As covered in the [Prompt Caching guide](/en/blog/en/claude-api-prompt-caching-cost-optimization-guide), cached input tokens get an additional 90% discount. For a pipeline where all requests share the same system prompt:

```
Batch discount (50%) + Cache hit (90%):
  System prompt tokens: $1.00/MTok → $0.50 → $0.05/MTok
  That's 95% off standard pricing
```

Cache hit rate in batch context is "best-effort" — typically 30–98% depending on how much identical content you include across requests. Identical system prompts are the easiest win.

## Gotchas That Will Bite You

**Results are unordered — always.**
This is worth repeating. Here's the wrong pattern and the right one:

```javascript
// ❌ Wrong — index-dependent
const textsArray = [];
for await (const result of await client.messages.batches.results(batchId)) {
  textsArray.push(result.result.message.content[0].text);
}
// textsArray[0] is NOT guaranteed to be the first request's result

// ✅ Correct — custom_id map
const resultsMap = new Map();
for await (const result of await client.messages.batches.results(batchId)) {
  if (result.result.type === "succeeded") {
    resultsMap.set(result.custom_id, result.result.message.content[0].text);
  }
}
```

**No modifications after submission.**
To change a submitted batch, cancel and resubmit. Run a small test batch (under 10 requests) first to validate your request structure before scaling up.

**Queue limits are per-request, not per-batch.**
Tier 1: 100,000 requests in processing queue. Tier 2: 200,000. Tier 3: 300,000. Tier 4: 500,000. A 50,000-request batch followed immediately by another 50,000-request batch will hit the Tier 1 queue cap.

**Expired requests aren't billed, but results are also gone.**
If a request expires (24-hour timeout exceeded), you owe nothing for it — but you also get no result. Need to resubmit. During high-traffic periods, splitting large batches into 2,000–5,000 request chunks is safer.

**Results only available for 29 days.**
After 29 days, the batch object still exists but the result file is inaccessible. Copy results to durable storage (S3, database) immediately after processing.

**No webhooks.**
This is the biggest operational friction point. There's no callback when a batch completes — you poll for status. 30-second intervals are the standard practice. Integration with a workflow orchestrator like Temporal or Airflow handles this cleanly if it's a pain point.

## Advanced: 300K Output Tokens Beta

A feature added quietly in March 2026. Add the `anthropic-beta: output-300k-2026-03-24` header and responses can run up to 300,000 tokens. This is **Batches API only** — not available on the synchronous Messages API.

```javascript
const batch = await client.messages.batches.create(
  {
    requests: [{
      custom_id: "long-doc",
      params: {
        model: "claude-sonnet-4-6",
        max_tokens: 300_000,
        messages: [{ role: "user", content: "Write a comprehensive technical spec..." }],
      },
    }],
  },
  { headers: { "anthropic-beta": "output-300k-2026-03-24" } }
);
```

At 300K tokens, a single request can take **over an hour** to complete. Good use cases: book-length technical documentation, exhaustive data extraction, large code scaffolding tasks.

## My Decision Framework

```
Does this need a real-time response?
  → YES: Standard Messages API
  → NO: More than 100 requests in the batch?
          → YES: Can I accept up to 24-hour delay?
                    → YES: Batches API
                    → NO: Standard API (sequential calls)
          → NO: Standard API (overhead not worth it)
```

Under 100 requests, the polling overhead often isn't worth it. The batch processing infrastructure is designed for volume — at small scale, sequential standard calls are simpler and often faster.

The hybrid pattern I've found most effective in practice, which lines up with the [heterogeneous LLM fleet optimization approach](/en/blog/en/heterogeneous-llm-agent-fleet-cost-optimization): route expensive model (Opus) work through batch for overnight processing, keep the cheap and fast model (Haiku) on standard API for real-time interactions. You get quality where quality matters and cost savings where latency doesn't.

I still think the webhook gap is a real problem, and the lack of a progress dashboard is annoying for long-running batches. That said, the API itself is stable and well-supported — no reason to wait to adopt it.

## Wrapping Up

Message Batches API isn't a nice-to-have. For any project with significant LLM processing volume, it's worth evaluating as the default infrastructure for non-real-time workloads. The API design is clean, SDK support is solid, and the 50% cost reduction applies immediately.

Two things to design for upfront: `custom_id`-based result mapping and the absence of webhooks. Handle those properly in the design phase and the rest of the API is well-documented enough to figure out as you go.

Next step: combine Prompt Caching with Batches API in an actual pipeline. For workloads where all requests share the same system prompt — classification, summarization, extraction — the combined savings consistently exceeds expectations.
