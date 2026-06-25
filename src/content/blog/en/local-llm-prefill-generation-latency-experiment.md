---
title: 'Why a Local LLM Slows Down as the Conversation Grows — I Split Prefill From Generation'
description: >-
  A 9,700-token prompt took 55s to its first token, then 65ms on the identical
  second call. I split Ollama's timings into prefill vs generation to see why.
pubDate: '2026-06-25'
heroImage: '../../../assets/blog/local-llm-prefill-generation-latency-experiment/hero.png'
tags:
  - LocalLLM
  - Ollama
  - InferenceOptimization
  - AgentDesign
relatedPosts:
  - slug: llm-determinism-temperature-seed-experiment
    score: 0.83
    reason:
      ko: 같은 Ollama + Gemma 4 환경에서 측정한 자매편이다. 거긴 '같은 답이 나오나'를, 여긴 '얼마나 빨리 나오나'를 본다. 둘을 합치면 로컬 추론의 재현성과 지연을 한 번에 잡는다.
      ja: 同じOllama + Gemma 4環境で測った姉妹編。あちらは「同じ答えが出るか」、こちらは「どれだけ速く出るか」を見る。合わせると再現性と遅延を一度に押さえられる。
      en: A sibling experiment on the same Ollama and Gemma 4 setup. That one asks whether you get the same answer; this one asks how fast it arrives. Together they cover reproducibility and latency.
      zh: 在相同的Ollama + Gemma 4环境上测量的姊妹篇。那篇看"是否给出相同答案"，这篇看"多快给出"。两者结合可同时掌握可复现性与延迟。
  - slug: multilingual-llm-token-tax-experiment
    score: 0.78
    reason:
      ko: 토큰 수가 지연을 결정한다는 게 이 글의 핵심인데, 그 토큰 수 자체가 언어마다 다르다. 한국어 프롬프트가 영어보다 토큰을 더 먹으면 prefill 시간도 그만큼 길어진다.
      ja: トークン数が遅延を決めるのが本記事の核だが、そのトークン数自体が言語ごとに違う。韓国語プロンプトが英語よりトークンを食えばprefill時間もその分伸びる。
      en: This post hinges on token count driving latency, and that count differs by language. If a Korean prompt costs more tokens than English, its prefill time grows in step.
      zh: 本文的核心是token数量决定延迟，而该数量本身因语言而异。若韩语提示比英语消耗更多token，其prefill时间也会相应变长。
  - slug: ai-agent-cost-reality
    score: 0.72
    reason:
      ko: 클라우드에선 토큰당 돈이, 로컬에선 토큰당 시간이 든다. 비용 구조는 달라도 '긴 컨텍스트가 비싸다'는 결론은 같다. 에이전트 예산을 짤 때 두 글을 나란히 보면 좋다.
      ja: クラウドではトークン当たりのお金、ローカルではトークン当たりの時間がかかる。コスト構造は違っても「長いコンテキストは高い」という結論は同じ。エージェント予算設計時に並べて読むとよい。
      en: In the cloud you pay money per token; locally you pay time per token. The cost model differs but the lesson is the same. Long context is expensive. Read both when budgeting an agent.
      zh: 云端按token花钱，本地按token花时间。成本结构不同，但"长上下文很贵"的结论相同。设计代理预算时两篇并读为佳。
faq:
  - question: 'Where exactly does a local LLM slow down as the context grows?'
    answer: 'In two places. First, prefill (processing the prompt before the first token) grows almost linearly with context length. On my laptop with gemma4:e4b, 200 tokens took 1 second while 9,700 tokens took about 55 seconds. Second, the token generation rate also drops slightly as context grows (16.8 to 15.4 tok/s, roughly 8% slower). Most of the felt latency is prefill.'
  - question: 'Why is the second identical call so much faster?'
    answer: 'Because of the prefix KV cache in llama.cpp, which Ollama runs on. When a prompt shares the same leading tokens as a previous one, that portion of the KV cache is reused, so prefill is not recomputed. In my run, an identical 4,859-token prompt dropped from 25.7 seconds to 65 milliseconds, about 396x faster. The catch: if you put a changing value (timestamp, random ID) at the very front of the prompt, the whole cache is invalidated.'
  - question: 'If the context window supports 32k, can I just use 32k?'
    answer: '"Fits" and "is usable" are different. In my setup, even 10k tokens meant 55 seconds to the first token. Even when a model supports 32k, for interactive local use you should measure prefill time first and size your context budget accordingly.'
---

When I run a local agent on my MacBook, responses get noticeably sluggish as the conversation drags on. I knew it felt slower, but I had no idea which stage was slowing down or by how much. So I cracked open the timing fields Ollama returns with every response and measured it.

The punchline first. I sent the same 9,700-token prompt twice. The first call took about 55 seconds to produce its first token. The second took 65 milliseconds. Same input, roughly a 396x difference. That single fact explains almost everything about local LLM latency.

## The stopwatch Ollama hides in every response

Most people only touch Ollama through a chat UI or `ollama run`. But if you call `/api/generate` with `stream:false`, the response JSON ships with precise timing fields. They are documented in the [Ollama API reference](https://github.com/ollama/ollama/blob/main/docs/api.md).

- `prompt_eval_count`: number of tokens in the input prompt
- `prompt_eval_duration`: time spent processing the prompt (this is prefill)
- `eval_count`: number of tokens generated
- `eval_duration`: time spent generating those tokens (this is generation)
- all durations are returned in nanoseconds

The important part is that inference splits into two stages with completely different cost shapes. <strong>Prefill</strong> reads my entire prompt in one pass and fills the KV cache. Everything up to just before the first token lives here. <strong>Generation</strong> then emits tokens one at a time, autoregressively. The two behave differently as context grows, and I wanted to see them apart, not blended into one "it's slow" number.

The measurement script is short and uses only the standard library. It varies the context length, asks the same question, and converts the timing fields into tokens per second.

```python
import json, urllib.request

OLLAMA = "http://localhost:11434/api/generate"
MODEL  = "gemma4:e4b"

def call(prompt):
    body = json.dumps({
        "model": MODEL, "prompt": prompt, "stream": False,
        "options": {"num_predict": 64, "seed": 42, "temperature": 0}
    }).encode()
    req = urllib.request.Request(OLLAMA, data=body,
                                headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=900) as r:
        d = json.load(r)
    pe_n, pe_d = d["prompt_eval_count"], d["prompt_eval_duration"] / 1e9
    ev_n, ev_d = d["eval_count"], d["eval_duration"] / 1e9
    return {
        "ctx": pe_n,
        "prefill_s": pe_d,
        "prefill_tps": pe_n / pe_d,   # prefill throughput
        "gen_tps": ev_n / ev_d,       # generation throughput
    }
```

One trap had to be handled first. If you repeat the same prompt, the cache drives prefill to nearly zero (more on that later). To measure cold prefill honestly, every call has to differ from the very <strong>first byte</strong>. So I prepended a fresh random ID to each prompt and seeded the filler body differently per run. I picked `gemma4:e4b` to keep iterations light, and I warmed the model up once before measuring so model load time (`load_duration`) wouldn't leak into the numbers.

## A longer context means a later first token

Cold prefill first. I grew the context from about 200 tokens to 9,700 and timed how long it took to reach the first output token.

| Context (tokens) | Cold prefill | Prefill tok/s | Generation tok/s | ms per generated token |
|---:|---:|---:|---:|---:|
| 200 | 1.0s | 197.8 | 16.81 | 59.5 |
| 644 | 3.2s | 198.4 | 16.61 | 60.2 |
| 1,244 | 6.3s | 197.6 | 16.38 | 61.1 |
| 2,476 | 12.7s | 194.6 | 16.40 | 61.0 |
| 4,852 | 25.7s | 188.6 | 15.87 | 63.0 |
| 9,716 | 54.8s | 177.3 | 15.43 | 64.8 |

![Prefill time and generation rate against context length](../../../assets/blog/local-llm-prefill-generation-latency-experiment/results-chart.png)

The left chart is nearly a straight line. As context grew 48x (200 to 9,716), prefill grew from 1 second to 55 seconds, about 54x. Roughly proportional. Intuitive enough: more tokens, more to read.

The interesting bit is the prefill <strong>rate</strong> in tok/s. At short context it ran at 198 tok/s, but near 10k tokens it fell to 177, about 10% slower. So the cost of processing a single token itself rises with context. As I understand it, attention scales quadratically with sequence length, so reading one word at the end of a long document, while re-attending over everything before it, is heavier than reading a word in a short one. That makes prefill climb a touch steeper than linear.

Here is the first practical lesson. The usual culprit behind a slow local agent is not generation speed, it is prefill. Cram five RAG documents in, or replay the last 20 turns wholesale, and tens of seconds evaporate before the model writes a single character. On cloud APIs this cost is [billed as tokens that vary with your data format](/en/blog/en/llm-token-cost-data-format-experiment); locally it is billed straight to my wall clock.

If you use a streaming UI, think of this prefill time as exactly how long the user stares at a blank screen or a loading spinner. Once tokens start flowing, they fill in fairly briskly at 16 a second. The problem is everything up to that first character. The longer the context, the longer the user has to sit through a silence that feels like "did it freeze?" What governs the felt responsiveness of a local chatbot is the length of that silence, not the speed tokens stream at. If nothing appears for 55 seconds at 9,700 tokens of context, that is not a tool you can use conversationally.

## Generation quietly gets slower too

The right chart looks almost flat, which is exactly why I want to flag it. Generation fell from 16.81 tok/s to 15.43 tok/s, about 8%. Per token, that is 59.5ms creeping up to 64.8ms.

Why? Each new token in the generation stage re-attends over the entire KV cache built so far. A longer context means more to attend over, so the per-token time inches up. Same root cause: attention is sensitive to length.

Honestly, though, that 8% is a side dish next to prefill. Generating 64 tokens at 10k context took about 4 seconds, but the prefill in front of it was 55 seconds. More than 90% of the felt latency happens before the first token. That is why I see "make the prompt short, and make it cacheable" as a far bigger lever than "swap in a faster model for generation."

## Why the second call was 396x faster

The cache was the most striking part of this experiment. I sent the same 4,859-token prompt twice in a row.

| Call | prompt_eval_count | Prefill time |
|---|---:|---:|
| First (cold) | 4,859 | 25,751ms |
| Second (warm) | 4,859 | 65ms |

`prompt_eval_count` reported 4,859 both times. The token count was unchanged, yet prefill time dropped about 396x. The model did not skip reading the tokens; it reused a KV cache it had already computed, so there was nothing to recompute.

This is the [prefix KV cache in llama.cpp](https://github.com/ggml-org/llama.cpp/discussions/13606). Ollama runs on top of llama.cpp, so it inherits the behavior. Two requests that share a leading prefix produce a bit-identical KV cache for that span, so the second request skips the shared prefix and processes only from the point where they diverge. With an identical prompt there is no divergence, so prefill effectively vanishes.

One thing that confused me, worth noting. Even on a cache hit, `prompt_eval_count` still returns the full 4,859. At first I stared at that number and assumed caching wasn't working. The field to watch is not the count but `prompt_eval_duration`. To confirm the cache is doing its job, look at prefill time, not token count: send the same prompt twice, and if the second prefill drops to a few milliseconds, you got a hit. Miss this and you can misdiagnose "caching is broken" in an environment where it works fine.

Now the random ID I prepended to measure cold prefill makes sense. The cache only reuses the span that is <strong>common from the very front</strong>. Change the first byte and everything after it must be recomputed. Put a per-request changing value at the head of your prompt and you break the whole cache.

## So how should I build the agent?

After this measurement I changed how I assemble prompts for my local agents. The shortlist:

<strong>1. Stable content up front, volatile content at the back.</strong> System prompt, tool definitions, fixed instructions, anything identical every turn, goes at the very front. The user's new question or a fresh search result, anything that changes, goes after. That alone lets the leading prefill ride the cache from the second turn on, nearly for free.

<strong>2. No timestamps or random IDs at the head of the prompt.</strong> Pin a line like "Current time: 2026-06-25 15:23:06" to the top of your system prompt and the first line differs every request, busting the cache each time. If you must include it, push it to the end. This one detail can save tens of seconds of prefill.

<strong>3. "Fits in the context window" is not "usable."</strong> A model can support 32k, but on my laptop even 10k tokens meant 55 seconds to the first token. For interactive use, size your context budget by measured prefill time, not by the supported limit. When I want conversational responsiveness locally, I keep context within a few thousand tokens.

<strong>4. If you truly need long context, pay prefill once and reuse it.</strong> For RAG where you ask several questions about the same document, keep the document at a fixed position up front and vary only the question at the back. The first question pays the full prefill, but the rest nearly skip it thanks to the cache. The same ordering helps when you [wire a local model to an MCP server to build an agent](/en/blog/en/local-llm-private-mcp-server-gemma4-fastmcp), so you do not re-prefill the system prompt on every tool-call round trip.

## The prompt I actually changed

Abstract rules don't land well, so here is how I reordered the prompt for my local tool-calling agent. Before, the order looked like this.

```text
Current time: 2026-06-25 15:23:06    <- changes every request (cache breaker)
Session ID: 9f3a-...                  <- changes every request
[system prompt, 800 tokens]
[tool definitions, 1,200 tokens]
[recent conversation history]
[the user's new question]
```

The problem is the first two lines. With the time and session ID at the very front, the first byte of the prompt differs on every request. The 800-token system prompt and 1,200-token tool definitions behind them never change a character turn to turn, yet because the cache broke up front, prefill had to run from scratch every time. By the table above, a 2,000-token prefill is about 10 seconds. Ten seconds a turn, thrown away purely on a layout mistake.

After, I did this.

```text
[system prompt, 800 tokens]          <- fixed, at the front
[tool definitions, 1,200 tokens]     <- fixed
[recent conversation history]        <- mostly fixed (only appended to)
Current time: 2026-06-25 15:23:06    <- changing values pushed to the end
Session ID: 9f3a-...
[the user's new question]            <- the part that changes every time, last
```

With the fixed block moved up front, from the second turn on the 2,000 tokens of system prompt and tool definitions rode the cache wholesale. The conversation history only appends new messages at the tail, so the common prefix stays long. The result: the only thing that needs re-prefilling each turn is the few hundred newly added tokens. Same model, same hardware, but the per-turn latency dropped visibly. Not one line of code got faster. I just changed the order in which I concatenate strings.

## Limits of this measurement

Let me draw the boundary honestly. These numbers come from one MacBook, one model (`gemma4:e4b`), and one runtime (Ollama). The absolute figures (55 seconds, 16 tok/s) change wholesale with GPU, memory, quantization, and runtime. A bigger model, or [structured outputs that return typed objects](/en/blog/en/ollama-structured-outputs-pydantic-local-llm-guide-2026), would add their own variables.

What I trust is the <strong>shape</strong>, not the absolutes. Prefill grows nearly in proportion to context, generation slows a little, and an identical prefix becomes nearly free through the cache. I expect all three trends to point the same direction in any environment. I have not yet measured how the cache contends under concurrent requests, or how quantization level affects prefill speed. I'm leaving those for the next experiment.

Stop lumping local LLMs into "fast" or "slow." Split them into prefill-to-first-token and per-token generation, and where to fix things becomes obvious. And most of the fixes, it turned out, were not about changing the model. They were about laying out the prompt so it stays cached.

The single most useful line I took from this experiment: when building a local agent, the first thing to check is not the GPU or the model size, it is whether the front of my prompt stays identical every turn. Pin the front and prefill nearly vanishes from the second turn on, on the same hardware. It is free acceleration that costs not one dollar and not one extra GPU. Until I measured it, I had filed this away as a vague "feeling" and let it slide.

## References

- [Ollama API reference](https://github.com/ollama/ollama/blob/main/docs/api.md) — documents the response timing fields (`prompt_eval_count`, `prompt_eval_duration`, `eval_count`, `eval_duration`) this experiment relies on, all in nanoseconds.
- [Ollama context length docs](https://docs.ollama.com/context-length) — official defaults by VRAM and the `OLLAMA_CONTEXT_LENGTH` setting, useful context for the "fits is not usable" point.
- [llama.cpp KV cache reuse (discussion #13606)](https://github.com/ggml-org/llama.cpp/discussions/13606) — how the prefix KV cache reuses a shared leading span, the mechanism behind the 396x warm-call speedup.
- [WEKA: Prefill vs Decode in LLM Inference](https://www.weka.io/learn/ai-ml/prefill-and-decode/) — background on why prefill is compute-bound and sets time-to-first-token while decode is memory-bound.
