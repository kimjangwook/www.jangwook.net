---
title: 'Gemini 2.5 Flash Thinking API: What I Learned from Running Budget=0, 1024, and 8000'
description: "I ran Gemini 2.5 Flash's thinking_budget at 0, 1024, and 8000 across simple tasks, math reasoning, and code review. Simple tasks got 5x slower with no gain. Math reasoning actually reduced output tokens. Here's the task-by-task decision framework."
pubDate: '2026-05-17'
heroImage: '../../../assets/blog/gemini-25-flash-thinking-api-developer-guide-2026/hero.png'
tags:
  - gemini
  - llm
  - api
  - thinking
  - tutorial
relatedPosts:
  - slug: gemini-25-flash-api-cost-optimization-guide
    score: 0.92
    reason:
      ko: 'Gemini 2.5 Flash의 비용 최적화 전략을 다룬 글로, Thinking Budget 비활성화가 어떤 상황에서 올바른 선택인지 이 글과 대조해서 읽으면 전략이 완성된다.'
      ja: 'Gemini 2.5 Flashのコスト最適化を扱った記事。Thinking Budgetを無効にするケースと有効にするケースを対比して読むと戦略が明確になる。'
      en: 'The companion cost optimization guide covers when to disable Thinking. Read alongside this post to build a complete decision framework.'
      zh: '这篇成本优化指南介绍何时禁用Thinking。与本文对照阅读，可以建立完整的决策框架。'
  - slug: llm-api-pricing-comparison-2026-gpt5-claude-gemini-deepseek
    score: 0.81
    reason:
      ko: 'Thinking 토큰 비용이 일반 출력 토큰과 같은 요금으로 청구된다는 사실을 LLM API 가격 비교 글과 함께 보면 실제 운영 비용 계산이 가능하다.'
      ja: 'Thinkingトークンのコスト計算はLLM API価格比較記事と合わせて読むと実際の運用コストが見えてくる。'
      en: 'Thinking tokens are billed at the same rate as output tokens — pair this with the LLM pricing comparison to calculate real operational costs.'
      zh: 'Thinking令牌按与输出令牌相同的费率计费，结合LLM API定价比较文章可以计算实际运营成本。'
  - slug: gemini-31-flash-live-realtime-voice-agent
    score: 0.74
    reason:
      ko: 'Gemini 3.1 Flash Live API로 실시간 음성 에이전트를 만든 경험을 담은 글. 같은 Gemini 모델 계열에서 스트리밍과 Thinking의 교집합 지점을 확인할 수 있다.'
      ja: 'Gemini 3.1 Flash LiveでリアルタイムVoice Agentを構築した体験記。Streamingとの交差点が見えてくる。'
      en: 'First-hand experience building a real-time voice agent with Gemini 3.1 Flash Live. Shows where streaming and Thinking intersect in the same model family.'
      zh: '使用Gemini 3.1 Flash Live构建实时语音智能体的经验。展示了流式传输与Thinking在同一模型系列中的交叉点。'
  - slug: ai-agent-cost-reality
    score: 0.70
    reason:
      ko: 'AI 에이전트 운영 비용의 현실을 솔직하게 분석한 글. Thinking 토큰 비용이 누적될 때 어떤 결과를 초래하는지 맥락을 제공한다.'
      ja: 'AI Agentの運用コストを正直に分析した記事。Thinkingトークンが積み重なるとどうなるかのコンテキストになる。'
      en: 'An honest analysis of AI agent operating costs. Provides context for what happens when Thinking token costs accumulate at scale.'
      zh: '对AI智能体运营成本的诚实分析。提供Thinking令牌成本累积时的影响背景。'
---

I assumed that turning on Thinking would always make Gemini smarter. After running actual experiments, I found out that's only half true.

I set `thinking_budget` to 0, 1024, and 8000 across three prompt types — simple tasks, math reasoning, and code review — and measured response time, output tokens, and thinking tokens for each combination. The numbers told a more nuanced story than I expected.

## What Thinking API Actually Does

`thinking_budget` limits how many tokens the model can spend on "hidden reasoning" before it writes the response. Budget=0 disables thinking entirely. Budget=-1 lets the model decide how much to think. A positive integer sets the cap (maximum is 24576).

There's an important catch: thinking tokens aren't returned in the response, but **they're billed at the same rate as output tokens**. As covered in the [LLM API pricing comparison](/en/blog/en/llm-api-pricing-comparison-2026-gpt5-claude-gemini-deepseek), Gemini 2.5 Flash output tokens cost $0.0035/1K. Spending 1024 thinking tokens adds that cost on top.

One practical note: the `google.generativeai` package is now deprecated. You need the new `google-genai` package.

```python
# ❌ Deprecated (no longer receiving updates)
import google.generativeai as genai

# ✅ Current standard
from google import genai
from google.genai import types

client = genai.Client(api_key="YOUR_API_KEY")

response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="Your prompt here",
    config=types.GenerateContentConfig(
        thinking_config=types.ThinkingConfig(
            thinking_budget=1024,
            include_thoughts=True,  # expose thinking in response parts
        ),
    ),
)

# Separate thinking from the actual answer
for part in response.candidates[0].content.parts:
    if part.thought:
        print(f"[Thinking] {part.text[:100]}...")
    else:
        print(f"[Answer] {part.text}")
```

Setting `include_thoughts=True` surfaces the model's internal reasoning as separate response parts. Useful for debugging, though you'd keep it `False` in production.

## How I Ran the Experiment

I created a fresh sandbox directory, installed only `google-genai`, and applied Budget=0/1024/8000 to three prompt types.

Measurements:
- **Response time (seconds)**: wall clock time
- **Output tokens**: actual answer tokens
- **Thinking tokens**: tokens consumed in internal reasoning (`usage_metadata.thoughts_token_count`)

Prompts:
1. **Simple task**: "Explain in one sentence how to sort a list in Python"
2. **Math reasoning**: Find all two-digit positive integers satisfying three conditions
3. **Code review**: Find bugs and improvements in a simple Python function

## Results: What the Numbers Show

These are the actual measured values. No smoothing.

| Task | Budget=0 | Budget=1024 | Budget=8000 |
|------|----------|-------------|-------------|
| Simple task | 1.4s / 54 out tok | 6.8s / 61 out tok / 751 think tok | 9.0s / 45 out tok / 1282 think tok |
| Math reasoning | 8.8s / 2143 out tok | 15.1s / 1915 out tok / 918 think tok | 26.2s / 1671 out tok / 4036 think tok |
| Code review | 6.7s / 1367 out tok | 13.1s / 1126 out tok / 734 think tok | 22.6s / 2055 out tok / 1824 think tok |

**Simple task**: Budget=0 finished in 1.4 seconds. Budget=1024 took 6.8 seconds — nearly 5x slower — with no discernible quality improvement. Budget=8000 consumed 1282 thinking tokens and still produced a shorter answer (45 tokens). Complete overkill.

**Math reasoning**: This is where things got interesting. With Budget=0, the model produced 2143 output tokens. It was "thinking out loud" inside the answer, writing out every step of its reasoning. Budget=1024 used 918 thinking tokens internally and produced 1915 output tokens. The total token consumption was similar, but the response was more structured. Budget=8000 pushed thinking to 4036 tokens and the output dropped to 1671 — the model reasoned privately and wrote a more concise answer.

**Code review**: Budget=1024 actually cut output from 1367 to 1126 tokens. The answer was more focused. Budget=8000 expanded to 2055 tokens — a more thorough analysis but 3x slower. Which is better depends entirely on your use case.

## Choosing the Right Budget for Each Task Type

Here's the practical framework I settled on from this experiment. Not a universal rule, but a solid starting point.

**Budget=0 (thinking disabled)** for:
- Classification, labeling, tagging
- Summarization, translation, format conversion
- Simple Q&A, factual lookups
- High-volume batch processing where cost matters

The simple task responded in 1.4 seconds at Budget=0. Giving it 1024 budget means waiting 6.8 seconds and paying for 751 extra tokens. No benefit. Pure waste.

**Budget=1024–2048 (moderate thinking)** for:
- Code review and bug finding where focused analysis matters
- Medium-complexity reasoning
- Multi-step judgment calls that are still latency-sensitive

I'll be honest — the code review at Budget=1024 felt *better* than Budget=0 even though the response was shorter. The unnecessary padding was gone. Just the key points.

**Budget=4000–8000 (deep thinking)** for:
- Complex math, algorithm design
- Thorough architecture reviews
- Multi-step planning
- Tasks where accuracy matters far more than speed

Budget=8000 on the math problem consumed 4036 thinking tokens in 26 seconds. That latency is unacceptable in any interactive context. I'd only use this for offline batch analysis or asynchronous background jobs.

The [Gemini 2.5 Flash cost optimization guide](/en/blog/en/gemini-25-flash-api-cost-optimization-guide) covers this too: thinking tokens and output tokens are priced identically. Using Budget=8000 indiscriminately can multiply your costs by several times.

## Production Code: Tracking Thinking Usage

Here's the pattern I use to monitor thinking token consumption in production.

```python
from google import genai
from google.genai import types
import time

def generate_with_thinking(
    client: genai.Client,
    prompt: str,
    budget: int = 1024,
    model: str = "gemini-2.5-flash",
) -> dict:
    """Generate a response while tracking thinking token usage."""
    start = time.perf_counter()
    
    config = types.GenerateContentConfig(
        thinking_config=types.ThinkingConfig(
            thinking_budget=budget,
            include_thoughts=False,  # False in production
        ),
    )
    
    response = client.models.generate_content(
        model=model,
        contents=prompt,
        config=config,
    )
    
    elapsed = time.perf_counter() - start
    usage = response.usage_metadata
    
    return {
        "text": response.text,
        "latency_s": round(elapsed, 2),
        "input_tokens": usage.prompt_token_count,
        "output_tokens": usage.candidates_token_count,
        "thinking_tokens": getattr(usage, "thoughts_token_count", 0) or 0,
        "total_tokens": (
            usage.prompt_token_count
            + usage.candidates_token_count
            + (getattr(usage, "thoughts_token_count", 0) or 0)
        ),
    }

# Usage
client = genai.Client(api_key="YOUR_API_KEY")

result = generate_with_thinking(
    client,
    "Find potential memory leaks in this code: ...",
    budget=2048,
)

print(f"Latency: {result['latency_s']}s")
print(f"Thinking tokens: {result['thinking_tokens']}")
print(f"Total billed tokens: {result['total_tokens']}")
```

`usage_metadata.thoughts_token_count` sometimes returns 0 — when budget=0 or the model decided it didn't need to think. Track this metric and you'll quickly learn how often thinking actually fires for your prompts.

## Where Thinking API Falls Short

I want to be direct about the frustrating parts.

**Dynamic mode (Budget=-1) is unpredictable.** The model deciding its own budget sounds convenient, but it can fire thinking on simple tasks. In my simple task experiment, Budget=-1 took around the same time as Budget=1024. If you can't predict latency and cost, you can't budget for it in production.

**thinking_budget and thinking_level can't coexist.** Gemini 3.x uses `thinking_level`; 2.5 uses `thinking_budget`. Mix them in the same call and you get a 400 error. This is documented but the error message isn't obvious enough to catch immediately if you're migrating code.

**Thinking tokens don't benefit from context caching.** Even if you use context caching to reduce the cost of a long system prompt, thinking tokens are billed fresh every time. As I covered in the [AI agent cost reality post](/en/blog/en/ai-agent-cost-reality), costs in agent loops can spiral faster than expected when thinking tokens accumulate.

## My Take

Thinking API isn't overhyped. But "just turn it on" is also wrong.

My position: **use Budget=0 as the default, and explicitly activate Budget=1024–2048 only when the task genuinely needs multi-step reasoning.** Keep Budget=8000 for batch jobs or offline analysis where accuracy is paramount.

Skip dynamic mode (Budget=-1) in production. Predictability beats convenience when you're billing actual users.

The counterintuitive finding that stuck with me: for complex math, disabling thinking caused the model to "think out loud" across 2143 output tokens. Enabling Budget=1024 moved the reasoning internal and dropped output to 1915 tokens. The total cost difference was smaller than I expected. Whether you net save depends on the task.

## Wrapping Up

Without running the experiments, I would have defaulted to "more thinking = better." The measurements said otherwise.

Gemini 2.5 Flash Thinking API is a genuinely useful tool when applied to the right tasks. The paradoxical effect — where enabling thinking *reduces* total tokens for complex reasoning — is real and worth knowing. But applying it blindly to simple tasks wastes money and time.

Before setting `thinking_budget`, ask one question first: **does this task actually require deep reasoning?** Most of the time, the answer is no.

---

*All code in this post is reproducible using the snippets provided. Written against google-genai package 0.8.x.*
