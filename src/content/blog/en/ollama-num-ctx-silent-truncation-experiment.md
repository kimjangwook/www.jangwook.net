---
title: 'Why My Local Agent Forgot Its System Prompt — Measuring Ollama num_ctx Silent Truncation'
description: >-
  My local agent started ignoring its instructions on long inputs. I hid a secret code at the top of the
  prompt and grew the length until recall broke. Past num_ctx, Ollama trims the front of your prompt with no
  error. And the "default is 4096" lore was wrong on my MacBook.
pubDate: '2026-06-28'
heroImage: '../../../assets/blog/ollama-num-ctx-silent-truncation-experiment/hero.png'
tags:
  - LocalLLM
  - Ollama
  - AgentDesign
  - ContextManagement
relatedPosts:
  - slug: local-llm-prefill-generation-latency-experiment
    score: 0.83
    reason:
      ko: 그 글은 컨텍스트가 길어질수록 첫 토큰이 늦게 나오는 '속도' 문제를 쟀다. 이 글은 같은 컨텍스트 길이가 일정 선을 넘으면 내용이 조용히 사라지는 '정확성' 문제를 본다. 길이를 두 각도에서 같이 보면 num_ctx를 얼마로 잡을지 감이 잡힌다.
      ja: あの記事はコンテキストが長いほど最初のトークンが遅れる「速度」の問題を測った。この記事は同じ長さが一線を越えると中身が静かに消える「正確さ」の問題を見る。長さを二つの角度で見ればnum_ctxの値が決めやすい。
      en: That post measured the speed problem, how a longer context delays the first token. This one looks at the correctness problem, how the same length silently drops content once it crosses a line. Seeing length from both angles makes it easier to pick a num_ctx.
      zh: 那篇测的是"速度"问题，上下文越长首个token越慢。这篇看的是"准确性"问题，同样的长度一旦越线，内容就被悄悄丢掉。从两个角度一起看长度，就更容易定num_ctx该取多少。
  - slug: local-llm-cold-start-load-duration-experiment
    score: 0.74
    reason:
      ko: 같은 맥북, 같은 Ollama로 응답에 딸려오는 숫자(load_duration)를 뜯어본 글이다. 여기서는 같은 응답의 prompt_eval_count를 뜯어 truncation을 잡아낸다. 둘 다 Ollama가 조용히 돌려주는 메타데이터로 실제 거동을 추적하는 방법이다.
      ja: 同じMacBook、同じOllamaで応答に付いてくる数値(load_duration)を調べた記事だ。ここでは同じ応答のprompt_eval_countを調べてtruncationを捕まえる。どちらもOllamaが静かに返すメタデータで実挙動を追う方法だ。
      en: That post dissects a number Ollama attaches to each response (load_duration) on the same laptop. Here I dissect prompt_eval_count from the same response to catch truncation. Both use metadata Ollama quietly returns to track real behavior.
      zh: 那篇在同一台MacBook、同一个Ollama上拆解了响应里附带的数字(load_duration)。这里我拆解同一个响应里的prompt_eval_count来抓truncation。两者都用Ollama悄悄返回的元数据追踪真实行为。
  - slug: ollama-structured-outputs-pydantic-local-llm-guide-2026
    score: 0.7
    reason:
      ko: 구조화 출력으로 로컬 모델의 답을 안정시켜봤다면, 그 답이 애초에 온전한 입력을 보고 나온 것인지부터 의심해볼 차례다. 입력이 잘리면 스키마가 아무리 깔끔해도 내용은 틀린다.
      ja: 構造化出力でローカルモデルの答えを安定させたなら、その答えがそもそも完全な入力を見て出たのかを疑う番だ。入力が切れればスキーマがいくら綺麗でも中身は間違う。
      en: If you stabilized a local model's answers with structured outputs, the next thing to question is whether the answer even saw the full input. If the input is truncated, the content is wrong no matter how clean the schema.
      zh: 如果你用结构化输出稳住了本地模型的答案，下一步该怀疑的是这答案到底有没有看到完整的输入。输入被截断，schema再干净，内容也是错的。
faq:
  - question: "Shouldn't Ollama error out when a prompt is too long? Why does it truncate silently?"
    answer: "Ollama does not raise an error when input exceeds num_ctx (the context window). It trims the tokens to fit and processes them anyway. The catch is that the trimmed part is the front, not the end. System prompts and instructions usually sit at the top, and that is exactly what disappears first. On my MacBook (M1 16GB, Ollama 0.30.7), sending a 3464-token prompt with num_ctx=2048 pinned prompt_eval_count to 2047, and the model could not recall the secret code I had hidden at the very top."
  - question: "Isn't Ollama's default num_ctx 4096?"
    answer: "That is stale lore. In my measurements, with no num_ctx set, input flowed in fully up to 16383 tokens. So this machine's default was 16384. Recent Ollama auto-sizes the default context to available memory. That means the same code can be fine on a 32GB machine and silently truncate on an 8GB server. Don't rely on the default; set num_ctx explicitly per request."
  - question: "How do I know if my request was truncated?"
    answer: "Look at prompt_eval_count in the Ollama response. If it is smaller than the token count you expected to send and sits right at the window (for example num_ctx-1), it was truncated. Counting tokens ahead of time, or adding a one-line guard that warns when prompt_eval_count approaches your configured num_ctx, makes debugging far faster."
---

A few days ago, a meeting-notes summarizer I run locally started misbehaving. Short transcripts were fine, but feed it a long transcript and it ignored the instruction I'd written at the top ("answer in JSON only") and rambled in plain prose. My first guess was that the model was just dumb. What nagged me was that the same model obeyed the instruction perfectly on short inputs. So maybe the model hadn't gotten dumber. Maybe it had never **seen** my instruction at all.

In a [previous post that decomposed prefill and generation cost](/en/blog/en/local-llm-prefill-generation-latency-experiment), I measured how a longer context delays the first token. That was about speed. What I suspected this time was something else. Past a certain length, maybe it isn't speed that suffers but the **content** that vanishes. So I measured it.

## Hiding a secret at the front, then growing the length

The method is a small twist on needle-in-haystack. Drop a secret code on the first line of the prompt (the head). Below it, lay down a long stretch of filler text, like a meeting transcript, to inflate the token count. Then at the very end, ask "what was the secret code written at the top?" If the model answers it correctly, it saw the head. If it can't, the head is gone.

The key is to **keep the same prompt and only change num_ctx**. If recall breaks while the input is identical, the culprit isn't the model. It's the context window setting.

```python
import json, urllib.request

SECRET = "ALPHA-7723-ZULU"
HEAD = (f"IMPORTANT: a secret code is hidden somewhere in this document. "
        f"The secret code is {SECRET}.\nRead the notes below, but answer only the final question.\n\n")
FILLER = ("The meeting covered the quarterly roadmap, deploy schedule, on-call rotation, and cost cuts. "
          "Each team shared progress and reordered next sprint's priorities.\n")
Q = "\n\nQuestion: what is the secret code written at the top of this document? Answer with the code only."

def ask(num_ctx, n_filler):
    prompt = HEAD + (FILLER * n_filler) + Q
    body = {"model": "melavisions/gemma4:latest", "prompt": prompt,
            "stream": False,
            "options": {"num_predict": 40, "temperature": 0, "num_ctx": num_ctx}}
    req = urllib.request.Request("http://localhost:11434/api/generate",
            data=json.dumps(body).encode(), headers={"Content-Type": "application/json"})
    d = json.load(urllib.request.urlopen(req, timeout=600))
    return d["prompt_eval_count"], SECRET in d["response"], d["response"].strip()
```

I used the `gemma4:latest` (3.2B, Q4_K_M) quantized build. It's small and fast, and since this experiment tests input preservation rather than model intelligence, a tiny model was plenty. Forty repetitions of the filler put the whole prompt at 3464 tokens. Remember that number.

## Changing only num_ctx broke recall

I threw the same 3464-token prompt four times, varying only num_ctx across 1024, 2048, 4096, and 8192. The results split cleanly.

| num_ctx | prompt_eval_count | secret recall | model answer |
|---|---|---|---|
| 1024 | 1023 | failed | "the secret code is None" |
| 2048 | 2047 | failed | "the secret code is ro" |
| 4096 | 3464 | succeeded | `ALPHA-7723-ZULU` |
| 8192 | 3464 | succeeded | `ALPHA-7723-ZULU` |

![prompt_eval_count and recall success/failure across num_ctx values](../../../assets/blog/ollama-num-ctx-silent-truncation-experiment/chart.png)

One thing jumped out. With num_ctx at 1024, `prompt_eval_count` was exactly 1023; at 2048, exactly 2047. My prompt was clearly 3464 tokens, yet the number of tokens the model actually read was clipped to fit num_ctx. Ollama had shaved the over-window input down to the window size. And because the shaved-off side was the head, the secret code hidden at the top disappeared entirely.

No error. No warning. It just said "None," or "ro," with a straight face. Honestly, that's the scariest part. Nothing in the model's answer signals that the input was cut. From num_ctx 4096 up, 3464 fits inside the window, so `prompt_eval_count` reads a full 3464 and recall is correct. The threshold sat between 2048 and 4096, right on top of my prompt length of 3464.

## Why the front, not the back

It felt backwards at first. When something "gets cut," you'd expect the tail to go, yet here the head vanishes. The reason is in how autoregressive inference works. When an LLM produces the next token, what it leans on most directly is the recent tokens just before it. So when the window runs short, the runtime keeps the newest tokens (the tail) and drops the oldest (the head). The same logic applies to multi-turn chat through `/api/chat`: the [Ollama FAQ](https://docs.ollama.com/faq) notes that when context overflows, it quietly drops the oldest messages first.

The trouble is that the things you least want cut all live at the front. System prompt, role instructions, tool definitions, output-format rules. By convention they go right at the top. And the trimming starts precisely there. If an agent that was cruising through a long conversation suddenly loses its persona or breaks its tool-call format, the model didn't get moody. The system prompt may have been pushed out of the window. That was exactly my notes agent.

There's a practical defense in this. Any instruction you truly cannot afford to lose, put it again near the **end**, just before the question, instead of only at the front. You're placing it where truncation can't reach. Not elegant, but when you can't control num_ctx it worked surprisingly well.

## prompt_eval_count snitches on the truncation

The most useful thing I got from this is elsewhere: **truncation leaves a trace in the response.** The `prompt_eval_count` that Ollama returns in the `/api/generate` response is the number of input tokens the model actually prefilled. If that value is smaller than your sent prompt's token count and clings to num_ctx, it was almost certainly truncated.

Why it matters: nobody normally looks at this number. If the answer comes out plausible, you assume the whole input went in. But even if you've [stabilized answers with structured outputs](/en/blog/en/ollama-structured-outputs-pydantic-local-llm-guide-2026), if the model only saw half the input, you get an answer that's schema-clean but factually wrong. Schema validation passes while the facts are off, which is the nastiest kind of bug to debug.

## But the default wasn't 4096

If I'd stopped there, I'd have landed on the usual "Ollama's default num_ctx is 4096, so watch out." But with **no num_ctx set at all**, the 3464-token prompt recalled fine, and `prompt_eval_count` read a full 3464. Under the 4096-default lore, 3464 obviously passes, so that's consistent so far. So I grew the input.

| filler repeats | prompt_eval_count at default num_ctx | note |
|---|---|---|
| 70 | 5911 | fits whole |
| 100 | 8431 | fits whole |
| 150 | 12631 | fits whole |
| 200 | 16383 | clipped at 16384 |
| 250 | 16383 (recall failed, answer "secret") | head dropped |

If the default were 4096, it should have clipped already at 5911. Instead, 12631 tokens went in fine and it hit the ceiling at 16383 (= 16384 − 1). So on my MacBook, the **default num_ctx that Ollama 0.30.7 chose was not 4096 but 16384**. Checking the [Ollama FAQ](https://docs.ollama.com/faq) and community write-ups, recent versions auto-size the default context to available memory. On a 16GB M1, it landed on 16384.

This isn't trivia. It's a portability problem. An agent that ran great on my 32GB desktop, moved to an 8GB cloud instance, gets a smaller default num_ctx, and the same code silently truncates the same input. You get a hard-to-reproduce incident: fine in local testing, quality collapses after deploy. I land firmly on "don't trust the default, always set it." If a default differs from machine to machine, it's effectively a value you can't trust.

## So I added one guard to the code

Nothing fancy. Two things. First, I set `num_ctx` explicitly on every request. Second, once the response comes back, I check whether `prompt_eval_count` got close to num_ctx, to catch a likely truncation in the logs right away.

```python
def guarded_generate(prompt, num_ctx=8192, model="melavisions/gemma4:latest"):
    body = {"model": model, "prompt": prompt, "stream": False,
            "options": {"num_ctx": num_ctx, "num_predict": 256}}
    req = urllib.request.Request("http://localhost:11434/api/generate",
            data=json.dumps(body).encode(), headers={"Content-Type": "application/json"})
    d = json.load(urllib.request.urlopen(req, timeout=600))

    used = d["prompt_eval_count"]
    # if it filled over 98% of the window, assume it likely truncated and warn
    if used >= num_ctx * 0.98:
        print(f"[warn] prompt_eval_count={used} ~ num_ctx={num_ctx}: "
              f"input may be truncated. Raise num_ctx or shrink the input.")
    return d["response"]
```

This guard doesn't prevent truncation. It just stops a truncation from slipping past in silence. In my case, this one line answered within five minutes why the summarizer ignored instructions only on long inputs. Input tokens were crossing the default window and the system prompt at the front was getting cut. Raise num_ctx enough and the same input obeyed the instruction again.

If a post-hoc guard that only fires after the response feels off, you can also count tokens before sending. Ollama has no separate tokenizer endpoint, so I measure length up front by hitting `/api/generate` with `num_predict: 0`, generating nothing and reading just `prompt_eval_count`. One cheap prefill tells me whether the input fits the window. In a RAG pipeline with variable input, that pre-measurement lets you branch: bump num_ctx dynamically, or cut the number of context chunks.

## What this experiment doesn't tell you

Let me draw the boundaries honestly. First, I measured with one 3.2B quantized model. Truncation itself is runtime-level behavior independent of the model, but "how plausibly the model hallucinates when the head is cut" will differ by model. A larger one might answer "I don't know."

Second, putting the secret at the very front is a deliberate worst case. In real RAG or agents, the important information isn't always in the head. But the system prompt and tool definitions almost always come first, and their loss is the most damaging, which is why I designed it this way.

Third, the default num_ctx landing on 16384 is a product of my 16GB M1 plus Ollama 0.30.7. It varies with version, memory, and how many models are loaded at once. So the lesson I take isn't "the default is 16384" but "the default differs by environment, so don't trust it."

And honestly, one thing I couldn't resolve remains. I ran the same test through the OpenAI-compatible endpoint (`/v1/chat/completions`) too, where there's no way to pass `options.num_ctx` per request, and `usage.prompt_tokens` reported a different number from `/api/generate`'s `prompt_eval_count` (3464 versus 2384 for the same text). On top of that, on my machine the head survived even on long input and recall worked. I get that the token accounting differs so the two endpoints can't be compared one-to-one, but why the truncation behavior looked different too, I can't cleanly explain. Either way, [a reported issue where num_ctx isn't honored on the OpenAI-compatible API and it silently truncates at 4096](https://github.com/ollama/ollama/issues/2714) does exist, so if you go through `/v1`, remember you're fully at the mercy of the server default (`OLLAMA_CONTEXT_LENGTH`).

It's the same thread as [tracking load_duration during cold starts](/en/blog/en/local-llm-cold-start-load-duration-experiment). The numbers Ollama quietly tucks into each response, however thinly documented, are the most honest clues to its real behavior. Just as `load_duration` snitched on cold starts, `prompt_eval_count` snitches on truncation. If you're running local models seriously, give these numbers a look.
