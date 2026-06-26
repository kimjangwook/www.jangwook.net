---
title: 'Why a local LLM''s first reply sometimes takes 10 seconds — I measured the cold start (load_duration)'
description: >-
  After idling, my agent's first reply dragged. I pulled Ollama's load_duration across model sizes: 1.5s
  for 2GB up to 9.7s for 9.6GB, and split it by keep_alive.
pubDate: '2026-06-26'
heroImage: '../../../assets/blog/local-llm-cold-start-load-duration-experiment/hero.png'
tags:
  - LocalLLM
  - Ollama
  - InferenceOptimization
  - AgentDesign
relatedPosts:
  - slug: local-llm-prefill-generation-latency-experiment
    score: 0.86
    reason:
      ko: 어제 그 글에서는 load_duration을 일부러 빼고 prefill과 generation만 쟀다. 오늘은 그때 빼놓은 그 항목, 모델 적재 시간 자체를 정면으로 본다. 둘을 합치면 첫 토큰까지의 지연이 통째로 분해된다.
      ja: 昨日の記事ではload_durationをわざと外してprefillとgenerationだけ測った。今日はそのとき外した項目、モデル読み込み時間そのものを正面から見る。合わせれば最初のトークンまでの遅延が丸ごと分解される。
      en: "Yesterday's post deliberately excluded load_duration and measured only prefill and generation. Today I face that excluded piece head-on: the model load time itself. Put together, they fully decompose the latency to first token."
      zh: 昨天那篇故意剔除了load_duration，只测prefill和generation。今天正面看那个被剔除的项目，即模型加载时间本身。两者结合，到首个token的延迟就被完整拆解了。
  - slug: ollama-fastapi-production-deployment-guide-2026
    score: 0.79
    reason:
      ko: 콜드 스타트는 프로덕션 배포에서 가장 먼저 부딪히는 벽이다. 그 가이드에서 다룬 Ollama + FastAPI 서빙 구조에 오늘 측정한 keep_alive 설정을 얹으면 첫 요청 지연을 실제로 줄일 수 있다.
      ja: コールドスタートは本番デプロイで最初にぶつかる壁だ。あのガイドで扱ったOllama + FastAPIの構成に、今日測ったkeep_alive設定を重ねれば最初のリクエスト遅延を実際に減らせる。
      en: Cold start is the first wall you hit in production deployment. Layer today's keep_alive findings onto the Ollama plus FastAPI serving setup from that guide and you can actually cut first-request latency.
      zh: 冷启动是生产部署中最先撞上的墙。把今天测出的keep_alive设置叠加到那篇指南里的Ollama加FastAPI服务结构上，就能真正降低首次请求延迟。
  - slug: llm-determinism-temperature-seed-experiment
    score: 0.74
    reason:
      ko: 같은 노트북, 같은 Ollama로 측정한 실험 시리즈다. 거긴 출력이 재현되는지를, 여긴 적재 시간이 재현되는지를 본다. 둘 다 '문서에 안 적힌 로컬 추론의 실제 거동'을 직접 재본 기록이다.
      ja: 同じノートPC、同じOllamaで測った実験シリーズ。あちらは出力が再現するか、こちらは読み込み時間が再現するかを見る。どちらも「ドキュメントに書かれないローカル推論の実挙動」を自分で測った記録だ。
      en: Part of the same series measured on the same laptop and Ollama. That one asks whether outputs reproduce; this one asks whether load time does. Both are hands-on records of local inference behavior the docs never spell out.
      zh: 同一台笔记本、同一个Ollama测出的实验系列。那篇看输出是否可复现，这篇看加载时间是否可复现。两者都是亲手测量"文档不会写明的本地推理真实行为"的记录。
faq:
  - question: 'My first Ollama reply is slow. Is the model slow, or is something else going on?'
    answer: 'It is almost always model loading, not inference. Ollama returns a load_duration field on every response, and when the model is not in memory, the time to read its weights from disk is added entirely to that first reply. On my MacBook a 7.2GB model showed roughly 2.8 to 9.0 seconds of load_duration when cold, and a 9.6GB model up to 9.7 seconds. Once the model is resident (warm), that same field drops under 0.4 seconds.'
  - question: 'How should I set keep_alive to avoid cold starts?'
    answer: 'For chat or agent use, the key is a long keep_alive (for example "30m", or "-1" to keep it indefinitely). In my test, keep_alive="0" unloaded after each call and every request paid over 2.5 seconds of load on a 7.2GB model. With keep_alive="10m" only the first request paid 2.6 seconds and the rest dropped to 0.38 seconds. The trade-off is memory: the model stays resident, so running several at once competes for RAM and VRAM.'
  - question: 'Does rebooting the server make cold start worse?'
    answer: 'Yes, and that was the key thing I found. Even within "cold," it mattered whether the model file was still in the OS page cache. Stopped-but-cached, the 7.2GB model loaded in about 2.8 seconds; truly cold from disk (like right after a reboot) it took 9.0 seconds. So when you set a benchmark or SLA, base it on the post-reboot worst case, not the cached number.'
---

I have been running a local agent on my MacBook for a few days. When I step away to do something else and come back to the same agent, the first reply is noticeably sluggish. The second and third are fine; only that first one drags. While writing [yesterday's post decomposing prefill and generation cost](/en/blog/en/local-llm-prefill-generation-latency-experiment), I wrote that I warmed the model before measuring "so model load time (load_duration) would not contaminate the numbers." That line nagged at me. The thing I deliberately threw away was exactly the delay I feel most often in daily use.

So today I measured the cost I excluded yesterday. The time it takes a model to land in memory, the thing we casually call cold start.

## load_duration: the line item you usually don't see

Ollama's `/api/generate` returns a bundle of timestamps on every response. Yesterday I looked at `prompt_eval_duration` (prefill) and `eval_duration` (generation). There is one more at the front: `load_duration`. As the name says, it is the time spent loading the model.

There is a reason you rarely notice it. Call the same model back to back and from the second call on the model is already resident, so `load_duration` reads near zero. Leave it idle for a while and Ollama evicts the model from memory (five minutes by default), and the next call resurrects the load cost. That eviction is exactly what I was feeling when "stepping away and coming back" felt slow.

I kept the method simple. To isolate load time, the prompt is one line, `Reply with the single word: ok`, and `num_predict` is capped at 8 so generation collapses toward zero. To force a cold state, I call `ollama stop <model>` right before the request. Then the `load_duration` of the first call is the cold start.

```python
def gen(model, keep_alive="5m"):
    body = json.dumps({
        "model": model, "prompt": "Reply with the single word: ok",
        "stream": False, "keep_alive": keep_alive,
        "options": {"num_predict": 8, "temperature": 0}
    }).encode()
    req = urllib.request.Request(OLLAMA, data=body,
        headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=600) as r:
        d = json.loads(r.read())
    return d["load_duration"] / 1e6  # nanoseconds -> milliseconds
```

If you want to check it yourself, one curl line does it. Stop the model, call it once, and pull out `load_duration`.

```bash
ollama stop gemma4:12b-it-qat
curl -s http://localhost:11434/api/generate -d '{
  "model": "gemma4:12b-it-qat", "prompt": "ok", "stream": false
}' | python3 -c 'import sys,json; print(json.load(sys.stdin)["load_duration"]/1e9, "s")'
```

The value comes back in nanoseconds, so divide by 1e9 for seconds. Run that line across a few models and you immediately feel how the table below shifts on your own hardware.

There is one reason to trust this measurement. Ollama returns `load_duration` separately from `prompt_eval_duration` and `eval_duration`, so load time does not bleed into the prefill or generation numbers. The response's `total_duration` came out close to the sum of those three, which let me isolate the load cleanly. Yesterday I looked at the middle two; today I focus on just the first.

## Cold start by model size

I lined up four Gemma 4 models I had pulled, ordered by size. For each I ran `ollama stop`, then called it cold three times, plus once warm with the model resident. In seconds:

| Model | On-disk size | Cold #1 | Cold #3 | Warm |
|---|---|---|---|---|
| melavisions/gemma4 | 2.0 GB | 3.33s | 1.55s | 0.20s |
| yinw1590/gemma4-e2b | 3.1 GB | 3.57s | 1.79s | 0.38s |
| gemma4:12b-it-qat | 7.2 GB | 9.00s | 2.82s | 0.37s |
| gemma4:e4b | 9.6 GB | 9.71s | 3.86s | 0.37s |

![Cold-start load_duration by model size](../../../assets/blog/local-llm-cold-start-load-duration-experiment/hero.png)

The broad pattern is what you would expect: bigger model, longer load. The 9.6GB model's first cold start was 9.7 seconds; the same call warm was 0.37 seconds. A 26x gap. In practice, that means if you leave a 7.2GB local chatbot idle past five minutes and speak to it again, you burn several seconds before a single token appears.

What jumps out is the warm column. Whether the model is 2GB or 9.6GB, warm `load_duration` sat at 0.2 to 0.4 seconds, basically flat. It does not scale with size. The way I read it, this is not actually re-reading weights; it is the keep_alive bookkeeping overhead of Ollama confirming "this model is still up." It is not a real load, so it ignores size. I won't claim to know exactly what work it represents. But for practical purposes, 0.4 seconds warm is "effectively no load cost," and that is the conclusion the measurement supports.

## Why "cold" #1 and #3 differ by 2x

Look at the table again and something is off. I stopped the model and re-measured every single time, yet Cold #1 is nearly twice as slow as Cold #3. The 7.2GB model went from 9.00 to 2.82 seconds, the 9.6GB one from 9.71 to 3.86. Both are labeled "cold," but the numbers disagree.

I got stuck here for a while. I first suspected a measurement bug. The answer was the operating system's page cache. `ollama stop` only evicts the model from the Ollama process's memory; the OS keeps the model file it already read sitting in RAM as page cache. So Cold #2 and #3 re-read the file from RAM, not disk. Drop the disk I/O entirely and it speeds up.

This matters because the thing we casually call "cold start" is really two different things.

- Truly cold: right after a reboot, or when memory pressure has flushed the cache. Weights are read from disk for the first time. This is Cold #1.
- Cached cold: the model is evicted from Ollama but the file is still in the page cache. This is Cold #3.

If you do not separate these when benchmarking, the second measurement onward quietly picks up the cached value, and you reach the rosy conclusion "cold start is faster than I thought." A real production server reboots, and swapping between several models flushes the page cache. So when setting an SLA or a cold-start budget, base it on Cold #1, the post-reboot worst case, not Cold #3. Had I not known this and measured once, I would have written the 7.2GB cold start as "2.8 seconds" when the real worst case was 9.

The interesting part is that the gap is much smaller on small models. The 2.0GB model's Cold #1 (3.33s) and Cold #3 (1.55s) differ by about 1.8 seconds, while the 9.6GB model's 9.71s and 3.86s differ by almost 6. More bytes to read from disk means the page cache saves you more time. The bigger the model, the steeper the penalty the "first user after reboot" absorbs. If you plan to serve 13B-class or larger locally, treat this cache dependency as a real operational variable.

## keep_alive splits the bill

The most direct lever against cold start is `keep_alive`: how long to hold the model in memory. I put it at two extremes and hit the same 7.2GB model three times each.

| Request | keep_alive="0" (unload each time) | keep_alive="10m" (stay warm) |
|---|---|---|
| Request #1 | 7.10s | 2.56s |
| Request #2 | 2.55s | 0.38s |
| Request #3 | 2.55s | 0.38s |

![load_duration by keep_alive setting](../../../assets/blog/local-llm-cold-start-load-duration-experiment/keepalive.png)

The contrast is sharp. `keep_alive="0"` unloads the model immediately after serving a request, so every request is cold. Each one eats 2.5 seconds or more of load up front. Check `ollama ps` between requests and the model is not in memory.

`keep_alive="10m"` pays the cold value (2.56s) only on the first request, then drops to 0.38 seconds. It shoves the cold start into request one and serves the rest warm. Request #1 of the keep_alive=0 run spiked to 7.1 seconds because the page cache was also empty at that point, a truly cold start. The effect from the previous section shows up here too.

On the command line, the `OLLAMA_KEEP_ALIVE` environment variable or the API's `keep_alive` field controls the same thing. Set it to `-1` to keep the model resident indefinitely.

## So how should I run a local agent?

Measuring turned a few vague operational hunches into something concrete.

First, for chat or agent use, give `keep_alive` plenty of room. If the model is evicted every time a user speaks, every turn is a cold start. Adding 2.5 seconds per turn on a 7.2GB model wrecks the conversation. As long as memory allows, set a long `keep_alive` or pin it with `-1`. This is a setting you can drop straight onto the deployment from my [Ollama plus FastAPI production serving guide](/en/blog/en/ollama-fastapi-production-deployment-guide-2026).

Second, warm the model once at startup. Have your boot script fire a dummy prompt to pay the cold start in advance, so the first real user never eats the 9 seconds. You cannot avoid paying the cold cost on the first request, but that first request does not have to be a real user.

Third, routing across several models is pricier than it looks. Calling a different model per request triggers a reload each time, and if memory is tight they flush each other's page cache down to a true cold (#1 level). If you build a router that rotates four models, compute load cost times switch count up front.

Fourth, benchmark inference speed only after warming. That is precisely why I warmed before measuring yesterday. Measure once while cold and `load_duration` stacks 9 seconds on top of prefill and generation, so you cannot tell whether the model is slow or the load is. The same principle held in my [output reproducibility experiment](/en/blog/en/llm-determinism-temperature-seed-experiment). Fix every variable except the one you are measuring.

Fifth, memory and responsiveness are a trade. A long `keep_alive` erases cold starts past the first request, but that model occupies RAM the whole time. Pin a 9.6GB model indefinitely and you shrink what other work can use; load another model and the page cache gets flushed, reviving cold. So I decided which models stay up first, gave a long `keep_alive` to the one or two I use most, and kept the rest short. Holding every model warm is a luxury only enough memory affords. Hammering in `keep_alive=-1` to drive cold start to zero just returns it as a bigger cold on the next model's load.

## Limits and what I still don't know

Let me draw the boundary honestly. These numbers come from one MacBook (Apple Silicon, unified memory). A server with a CUDA GPU has an extra step in the load path, copying from disk through system RAM into VRAM, so the absolute values will differ. Don't transplant my numbers onto other hardware. That said, the structural conclusions should survive a hardware change: cold scales with size while warm does not, page cache splits cold into two kinds, and keep_alive decides every cost past the first request.

Also, I did not dig deep enough into Ollama internals to claim exactly what `load_duration` sums up. It may include initialization like graph construction, not just the file read. What I can observe is the number the API returns and how it responds to model size, page cache, and keep_alive. That range is the scope of today's measurement. The 0.37 seconds that shows up even when warm is something I guessed at, not confirmed.

Finally, page cache behavior depends on how much free RAM you have. On a memory-tight server, even Cold #2 and #3 could get their cache flushed quickly and slow back down toward Cold #1. My measurement leans toward the optimistic case with ample RAM. Next I want to apply artificial memory pressure and see how long the cache holds. Cold start is not a measure-once topic; it is the kind of cost you have to re-measure per environment.

## References

- [Ollama API docs](https://github.com/ollama/ollama/blob/main/docs/api.md) — the response fields, including `load_duration`, and the `keep_alive` parameter.
- [Ollama FAQ: keeping a model loaded in memory](https://docs.ollama.com/faq) — the 5-minute default and how `keep_alive` and `OLLAMA_KEEP_ALIVE` control eviction.
- [Linux kernel: memory management concepts](https://www.kernel.org/doc/html/latest/admin-guide/mm/concepts.html) — how the OS page cache holds file data read from disk in RAM, which is what splits cold into two kinds.
