---
title: 'Does a Local LLM Ever Repeat Itself? Measuring Output Reproducibility with Temperature and Seed'
description: >-
  I sent the same prompt to local Gemma 4 dozens of times to measure how reproducible the output is.
  temperature=0 was deterministic, and even at higher temperature a fixed seed collapsed the output to one line.
  Includes takeaways you can apply to evaluation and CI right away.
pubDate: '2026-06-22'
heroImage: '../../../assets/blog/llm-determinism-temperature-seed-experiment/hero.png'
tags:
  - LocalLLM
  - Ollama
  - LLMEvaluation
  - Reproducibility
relatedPosts:
  - slug: ollama-structured-outputs-pydantic-local-llm-guide-2026
    score: 0.86
    reason:
      ko: 같은 Ollama + Gemma 4 스택에서 출력을 다룬다. 이 글에서 재현성을 확인했다면, 그 출력을 타입 안전하게 받는 다음 단계가 거기 있다.
      ja: 同じOllama + Gemma 4スタックで出力を扱う。本記事で再現性を確認したら、その出力を型安全に受け取る次の段階がそこにある。
      en: Works on the same Ollama and Gemma 4 stack. Once you trust reproducibility, that post shows how to capture those outputs with type safety.
      zh: 在相同的Ollama + Gemma 4技术栈上处理输出。确认可复现性后，那篇文章展示了如何以类型安全的方式接收这些输出。
  - slug: ollama-fastapi-production-deployment-guide-2026
    score: 0.74
    reason:
      ko: 로컬 모델을 동시 요청이 들어오는 서버로 올리면 이 글에서 본 결정성이 흔들릴 수 있다. 배포 단계의 변수를 먼저 보고 싶을 때 읽을 글이다.
      ja: ローカルモデルを同時リクエストが来るサーバーに載せると、本記事で見た決定性が揺らぐことがある。デプロイ段階の変数を先に見たいときに読む記事。
      en: Once you put a local model behind a server taking concurrent requests, the determinism seen here can break. Read this for the deployment-stage variables first.
      zh: 当把本地模型放到接收并发请求的服务器后，本文看到的确定性可能会动摇。想先了解部署阶段的变量时可读。
  - slug: claude-agent-sdk-tool-use-complete-guide-2026
    score: 0.7
    reason:
      ko: 에이전트의 도구 호출을 회귀 테스트하려면 출력이 재현돼야 한다. 클라우드 LLM으로 에이전트를 짤 때 seed 고정이 왜 까다로운지 이 글과 같이 보면 좋다.
      ja: エージェントのツール呼び出しを回帰テストするには出力が再現される必要がある。クラウドLLMでエージェントを組むとき、seed固定がなぜ難しいかを併せて読むとよい。
      en: Regression-testing an agent's tool calls needs reproducible outputs. Pair it with this to see why pinning a seed is harder once the agent runs on a cloud LLM.
      zh: 要对代理的工具调用做回归测试，输出必须可复现。搭配阅读可了解在云端LLM上构建代理时，为何固定seed更困难。
faq:
  - question: "Does temperature=0 always produce the same answer?"
    answer: "On my laptop, measured through Ollama, yes. I sent the same prompt to two models 12 to 15 times each, and temperature=0 returned a single output every time. But reports like ollama issue #586 show it can drift slightly across OS or execution timing, so 'deterministic in my environment' and 'deterministic everywhere' are different claims."
  - question: "For reproducibility, should I fix temperature or seed?"
    answer: "Both. At temperature=0 the decoding is greedy so the seed is effectively irrelevant, but if you want diversity from a higher temperature while still reproducing results, you must fix the seed. In my runs, temperature=0.8 plus a fixed seed collapsed the output to one line, and rerunning in a separate process produced the same sentence."
  - question: "If it is deterministic locally, is it deterministic on the OpenAI or Claude API too?"
    answer: "No. Cloud inference servers batch many requests together, and when the batch size shifts with load, the same prompt can take a different numerical path. Thinking Machines' 'Defeating Nondeterminism in LLM Inference' explains this batch-invariance problem. I could not reproduce that part directly, so I cite it from the writeup only."
  - question: "Why did the gemma4:12b model return an empty response?"
    answer: "A community-published gemma4:12b-it-qat build returned an empty content string on both /api/generate and /api/chat while eval_count went up. Tokens were generated but never mapped to visible text, which looks like a packaging issue. I excluded it from the determinism table."
---

I ran my evaluation script twice and got two different scores. Same code, same prompt, same model. Nothing changed, yet one previously passing case failed.

My first guess was that I had touched something. But a re-run passed again. That moved my suspicion to the model itself. An LLM is not a function that maps the same input to the same answer. I knew this intellectually, but once my eval pipeline started wobbling, the question got concrete fast: what exactly do I need to pin down to make the output reproduce?

So I measured it myself. Not on a cloud API, but in a local Ollama + Gemma 4 setup I could control end to end. I sent the same prompt dozens of times and bucketed the outputs by hash to count how many distinct ones appeared. Up front: in my environment, reproducibility came down to exactly two knobs.

## Why results wobble when you changed nothing

The final step where an LLM picks a token is sampling, drawing one option from a probability distribution. The knob that changes the character of that sampling is `temperature`. At temperature 0 the model just takes the highest-probability token every time (greedy). There is no room for randomness, so in theory it should be deterministic. Raising temperature opens room for the second- and third-ranked tokens, and the thing that governs that lottery is `seed`.

There is one more knob worth naming: `num_predict`, the maximum number of tokens to generate. When it is short, there are fewer points where the model can diverge, so it looks more deterministic; when it is long, tiny differences have more room to accumulate toward the tail. So I grabbed a clean signal first with a short tagline (about 40 tokens) and tested long outputs separately. That long-output test is where I hit the empty-response problem I will get to later.

All of that is straight from the docs. The question is whether the theory actually holds on my laptop. Just browsing the ollama issue tracker, you find a steady stream of reports: "I fixed the seed but the answer changes" (#4660), "temperature=0 with a fixed seed still differs between the first and second run" (#586). So I decided not to trust it and to measure instead.

## The experiment: the same prompt, dozens of times

I built the test environment in a temporary directory outside the repo. Ollama 0.30.7, Apple Silicon, two models: a small 2GB Gemma 4 build and the 9.6GB `gemma4:e4b`. The point of using two sizes was to see whether the same pattern shows up regardless of model scale.

The method is simple. Send the same prompt 12 to 15 times per condition, hash each output with SHA-256, and count how many distinct hashes appear. One means fully deterministic; a larger number means the output is scattering.

```python
import json, hashlib, urllib.request
from collections import Counter

def gen(model, prompt, temperature, seed=None, num_predict=40):
    opts = {"temperature": temperature, "num_predict": num_predict}
    if seed is not None:
        opts["seed"] = seed
    body = {"model": model, "messages": [{"role": "user", "content": prompt}],
            "stream": False, "options": opts}
    req = urllib.request.Request("http://localhost:11434/api/chat",
            data=json.dumps(body).encode(),
            headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req) as r:
        return json.load(r)["message"]["content"].strip()

def count_unique(model, prompt, temperature, seed, n):
    outs = [gen(model, prompt, temperature, seed) for _ in range(n)]
    hashes = [hashlib.sha256(o.encode()).hexdigest()[:12] for o in outs]
    return len(set(hashes)), Counter(hashes).most_common(1)[0][1]
```

I split this into five conditions. For temperature=0 and temperature>0, a fixed seed and no seed, plus a final case where I keep the seed fixed but spin up a fresh Python process and run once more. That last condition matters, because "reproducing inside the same process" and "reproducing after you kill and restart the process" are completely different guarantees from an eval and CI standpoint.

I picked a generative prompt with room to vary: "Write a single short marketing tagline for a new AI coding assistant." Diversity only shows up on a task that does not collapse to a single right answer. Had I used a closed question like "what is 2+2," raising temperature would barely scatter anything, and the seed's effect would be invisible.

I tracked two metrics together. One is the distinct count above; the other is majority share, the fraction of all N runs taken by the single most frequent output. A distinct count of 5 with one output appearing 11 times is effectively stable; five outputs scattered evenly drops majority share toward 0.3. To compress the shape of the distribution into one number, watching both felt safer.

## Results: there were only two knobs

![Distinct output counts per condition across two local models](../../../assets/blog/llm-determinism-temperature-seed-experiment/hero.png)

The table makes the pattern sharper.

| Condition | gemma4 ~2GB (N=15) | gemma4:e4b 9.6GB (N=12) |
|------|------|------|
| temperature=0, no seed | 1 (deterministic) | 1 (deterministic) |
| temperature=0, fixed seed | 1 | 1 |
| temperature>0, no seed | **5** | **7** |
| temperature>0, fixed seed | 1 | 1 |
| temperature>0, fixed seed (process rerun) | 1 | 1 |

![Per-condition measurement log](../../../assets/blog/llm-determinism-temperature-seed-experiment/results-table.png)

Here is the story it tells. At temperature 0 both models produced exactly one kind of output. Fifteen runs, twelve runs, not a character off, the same sentence every time. Seed or no seed, the result was identical. That confirms directly that the seed has nothing to do under greedy decoding.

The only cell that scattered was temperature>0 with no seed. The 2GB model split into 5 distinct outputs out of 15, the 9.6GB model into 7 out of 12. But fix the seed to 42 at the same temperature and it snapped back to 1. The most striking part is the last row. I spun up a brand-new Python process and ran it again, and with the same seed it produced the same sentence: "Code faster, effortlessly smart." Two independent executions matched character for character.

The actual sentences make it tangible. At temperature 0 the 2GB model emitted only "Code Smarter, Not Harder" every time. Raise temperature to 0.8 and drop the seed and variations like "Code Smarter, Not Harder with Ada" slipped in. Pin the seed to 42 and it froze on that one line, which held across the process restart. The 9.6GB model behaved the same, splitting into 7 variants at seed-less temperature 0.8 and converging to "Code faster, effortlessly smart" once the seed was fixed. The contrast is even clearer in majority share: the 9.6GB model at seed-less temperature 0.8 sat at 0.333, meaning even its most common output showed up only one run in three. Every other condition was 1.0, all identical.

The result was clean enough that I doubted it again, so I swapped models and reran. Two models that differ 5x in size showed the same pattern. In my environment at least, the two knobs of temperature and seed were enough to control reproducibility.

## One empty response taught the bigger lesson

I had originally meant to lean on the 12B `gemma4:12b-it-qat` as the main model. But that community build returned nothing but an empty string. On both `/api/generate` and `/api/chat`, `done_reason` came back `length` and `eval_count` climbed to 40 or 200, yet the `content` was an empty string.

```text
content repr: ''
done_reason: length   eval_count: 200
```

Tokens were clearly generated. The GPU spun for 28 seconds each time. But nothing reached the user-visible text. The chat template on this QAT build is probably broken, or the model emitted only invisible control tokens. The exact cause is outside my expertise, so I will not assert one.

The lesson, though, is clear. "The model ran" and "the model answered" are different statements. A pipeline that treats a rising eval_count as success would have let this empty response slip straight into the evaluation data. Why you need one guard that rejects zero-length responses, this failure argued more convincingly than any line of code. Failure is content too, and I felt it again here. I have hit this kind of packaging variable before with local models, in a similar shape as the small-model schema limits I wrote about in the [post on Ollama structured outputs](/en/blog/en/ollama-structured-outputs-pydantic-local-llm-guide-2026).

## Right locally does not mean right on the cloud

Let me draw the line clearly. What I measured is determinism "on local Ollama, sending requests one at a time, sequentially." Move that condition onto a cloud API like OpenAI or Claude and the story changes.

The most convincing explanation of why comes from Thinking Machines' "Defeating Nondeterminism in LLM Inference" (September 2025). People often say "GPU floating-point math is non-deterministic, that's why," but the piece locates the real cause elsewhere. Inference servers batch many users' requests together, and the batch size shifts unpredictably with server load at that moment. Because the core kernels take a slightly different numerical path depending on batch size, the same prompt can diverge into different tokens even under greedy decoding. As I understand it, the real culprit of non-determinism is not randomness but the fact that your request lands in a differently sized batch each time.

Local ollama is not a perfectly safe zone either. Issue #586 reports that with the same seed, same temperature=0, and same num_ctx, the output still differed slightly between the first and second run, and more interestingly that the same code produced a different "fixed" output on Ubuntu versus Windows. In other words, determinism may be a platform-bound property. My measurements were probably clean because they ran on one Mac, with one version of ollama, on short outputs. The longer the output and the larger num_ctx, the more room tiny numerical differences have to accumulate and diverge.

I did not reproduce this batch non-determinism directly. I never built an environment that applies concurrent load. So I cite that part from the writeup only. The range I verified by hand is strictly "sequential requests, local, short outputs." Blur that boundary and my article becomes one more piece selling unverified claims as fact.

So honestly, building eval reproducibility on top of a cloud API is trickier than it sounds. Even an API that accepts a seed parameter does not protect you from batch non-determinism. That, I think, is the root reason LLM evaluation never settles as cleanly as a unit test.

## What I applied to evaluation and agent testing right away

Here is what I folded into my workflow as soon as the measurement was done.

First, pin regression evals at temperature=0 with a fixed seed. For a regression test that checks "did it change" rather than "how good is it," you do not need the model's creativity. Better to lock onto one reproducible output and catch the moment it shifts. In my environment this combination returned the same sentence even after a process restart, which is enough to put in CI.

Second, never conclude from a single run. Features that run at a higher temperature, where diversity is the value, scatter by nature. To evaluate that output you cannot run it once and call it pass or fail; you run it N times and look at the distribution. Seeing it split 7 out of 12 in my measurement tells you how risky it is to judge a feature on one lucky output.

Third, put an output-validity guard in front of the eval. The empty-response 12B model is the direct reason. Unless you explicitly classify zero length, JSON parse failure, or a missing expected field as a failure, a broken model masquerades as a healthy score. The skeleton I use for regression tests is about this simple.

```python
def assert_reproducible(model, prompt, expected_hash, n=5):
    outs = [gen(model, prompt, temperature=0, seed=42) for _ in range(n)]
    # 1) empty-response guard: separate "ran" from "answered"
    assert all(len(o) > 0 for o in outs), "empty output detected"
    # 2) does it lock to one kind within a single run?
    hashes = {hashlib.sha256(o.encode()).hexdigest()[:12] for o in outs}
    assert len(hashes) == 1, f"non-deterministic: {len(hashes)} variants"
    # 3) does it match the baseline I pinned earlier?
    assert hashes.pop() == expected_hash, "output drifted from baseline"
```

Pin the expected hash once and CI catches the moment a model version or an ollama upgrade changes the output. That is my rebuttal to the common resignation that "you can't test an LLM." You can't test all of it, but the part where you control the reproducibility conditions, you certainly can.

It extends to agents the same way. To regression-test an agent's sequence of tool calls, that sequence has to reproduce. If you have built a [fully offline MCP server on a local model](/en/blog/en/local-llm-private-mcp-server-gemma4-fastmcp), fixing the seed on top of it to reproduce tool calls is relatively controllable. An agent on a cloud LLM, by contrast, struggles to get the same guarantee because of batch non-determinism. In the end, "where you run inference" decides "how tightly you can write the test," and that was the most practical takeaway from this experiment.

Next I plan to build an environment that applies concurrent load and check directly whether batch non-determinism reproduces even on local ollama. If it does, my tentative conclusion that "local is safe" will earn a footnote.
