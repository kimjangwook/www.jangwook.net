---
title: '本地LLM为何对话越长越慢 — 我把prefill和generation拆开测了一遍'
description: >-
  同样一段9,700 token的提示词，在我的笔记本上第一个token要等55秒，而第二次相同调用只用了65毫秒。我直接取出Ollama的时间戳，分离测量prefill与generation，弄清prefix缓存为何快了396倍，以及如何把它用到代理的上下文设计上。
pubDate: '2026-06-25'
heroImage: '../../../assets/blog/local-llm-prefill-generation-latency-experiment/hero.png'
tags:
  - 本地LLM
  - Ollama
  - 推理优化
  - 代理设计
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
  - question: '本地LLM在上下文变长时，到底是哪里变慢?'
    answer: '两个地方。第一，第一个token出现之前的prefill(提示词处理)几乎与上下文长度成正比地增长。在我的笔记本上用gemma4:e4b测，200 token要1秒，9,700 token约55秒。第二，生成token的速度也随上下文变长而略微下降(16.8 → 15.4 tok/s，约8%)。体感延迟的大部分来自prefill。'
  - question: '同样的提示词发两次，为何第二次快得离谱?'
    answer: '因为基于llama.cpp的prefix(前缀) KV缓存。前缀相同的提示词会复用那段KV缓存，因此不再重新做prefill。我测到4,859 token的相同提示词，prefill从25.7秒降到65毫秒，约快396倍。但要注意：如果在提示词最前面放每次都变的值(时间戳、随机ID)，整个缓存会被作废。'
  - question: '如果上下文窗口支持32k，我能直接用满32k吗?'
    answer: '"放得下"和"用得了"是两回事。在我的环境里，哪怕只塞1万token，第一个token也要等55秒。即便模型支持32k，要在本地硬件上做交互式使用，最好先测prefill时间，再据此确定上下文预算。'
---

在我的MacBook上跑本地代理时，对话越拖越长，响应就明显变迟钝。我知道"感觉变慢了"，却说不清究竟是哪一步慢、慢多少。于是我直接把Ollama每次响应都返回的时间戳取出来测了一遍。

先说结论。我把同一段9,700 token的提示词发了两次：第一次到第一个token约55秒，第二次只用65毫秒处理完。同样的输入，差了约396倍。这一句话几乎解释了本地LLM延迟的全部。

## Ollama藏在响应里的秒表

多数人只通过聊天界面或`ollama run`接触Ollama。但如果用`stream:false`调用`/api/generate`，响应JSON里会附带精确的计时字段。这些都写在[Ollama API文档](https://github.com/ollama/ollama/blob/main/docs/api.md)里。

- `prompt_eval_count`：输入提示词的token数
- `prompt_eval_duration`：处理提示词花的时间(即prefill)
- `eval_count`：生成的token数
- `eval_duration`：生成这些token花的时间(即generation)
- 所有duration单位都是纳秒

关键在于，LLM推理被拆成性质完全不同的两个阶段。<strong>prefill</strong>是一次性读完我输入的整段提示词、填满KV缓存的阶段，第一个token出现之前都属于这里。<strong>generation</strong>则是之后逐个、自回归地吐出token的阶段。两者成本结构不同，对上下文变长的反应方式也不同。我想把它们分开看。

测量脚本只用标准库就写得很短。它逐步改变上下文长度、抛出同一个问题，再把响应里的计时字段换算成每秒token数。

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
        "prefill_tps": pe_n / pe_d,   # prefill处理速度
        "gen_tps": ev_n / ev_d,       # 生成速度
    }
```

得先处理一个陷阱。如果重复发同样的提示词，缓存会让prefill几乎归零(后面会讲)。要诚实地测"冷(cold)"prefill，每次调用的提示词必须从<strong>第一个字节</strong>就不同。所以我在提示词开头加上每次不同的随机ID，正文也用不同的种子填充。测量模型选了`gemma4:e4b`以保持迭代轻快，并在正式测量前先预热一次，避免模型加载时间(`load_duration`)混进数据。

## 上下文越长，第一个token来得越晚

先看冷prefill。我把上下文从约200 token加到9,700 token，记录到达第一个输出token的时间。

| 上下文(token) | cold prefill | prefill tok/s | generation tok/s | 每token生成(ms) |
|---:|---:|---:|---:|---:|
| 200 | 1.0秒 | 197.8 | 16.81 | 59.5 |
| 644 | 3.2秒 | 198.4 | 16.61 | 60.2 |
| 1,244 | 6.3秒 | 197.6 | 16.38 | 61.1 |
| 2,476 | 12.7秒 | 194.6 | 16.40 | 61.0 |
| 4,852 | 25.7秒 | 188.6 | 15.87 | 63.0 |
| 9,716 | 54.8秒 | 177.3 | 15.43 | 64.8 |

![上下文长度对应的prefill时间与生成速度](../../../assets/blog/local-llm-prefill-generation-latency-experiment/results-chart.png)

左图几乎是一条直线。上下文增大48倍(200 → 9,716)，prefill从1秒涨到55秒，约54倍，基本成正比。这很直观：token越多，要读的就越多。

有意思的是prefill的<strong>速度</strong>(tok/s)。上下文短时是198 tok/s，接近1万token时降到177，慢了约10%。也就是说，处理单个token的成本本身也随上下文变长而升高。据我理解，注意力对序列长度是平方级开销，所以在长文末尾读一个词、同时回看前面全部，比在短文里读一个词更重。因此prefill比"与token数成正比"略陡一些。

这里有第一条实战经验。本地代理响应慢的真凶，通常不是生成速度，而是prefill。塞进五份RAG文档，或把前面20轮对话整段重发，模型还没写出第一个字，几十秒就没了。在云端API上，这笔成本会[按token计费，而token数又随数据格式变化](/zh/blog/zh/llm-token-cost-data-format-experiment)；在本地，它原封不动地记在我的时间账上。

如果用流式UI，可以把这段prefill时间理解为用户盯着空白屏幕或加载转圈的时间。一旦token开始流出，后面以每秒16个的速度填得还算快。问题在于到第一个字符之前。上下文越长，用户要忍受的"是不是卡住了"式沉默就越久。决定本地聊天机器人体感响应性的，是这段沉默的长度，而非token流出的速度。在9,700 token上下文下55秒什么都不出，那就不是一个能拿来对话的工具。

## 生成速度也在悄悄变慢

右图变化很小，容易被忽略。正因如此我更想点出来。生成速度从16.81 tok/s降到15.43 tok/s，约8%。换算成吐一个token的时间，是59.5ms涨到64.8ms。

为什么?生成阶段每造一个新token，模型都要用注意力把此前堆起的整块KV缓存再扫一遍。上下文越长，要扫的越多，每token时间就一点点变长。根因相同：注意力对长度敏感。

不过老实说，这8%在prefill面前只是枝节。在1万token上下文里生成64个token约花4秒，而它前面的prefill是55秒。体感延迟的九成以上发生在第一个token之前。所以我认为"把提示词写短、并且让它可缓存"是比"换一个更快的生成模型"大得多的杠杆。

## 第二次调用快396倍的原因

这次实验里最让我印象深刻的是缓存。我把4,859 token的相同提示词连发了两次。

| 调用 | prompt_eval_count | prefill时间 |
|---|---:|---:|
| 第一次 (cold) | 4,859 | 25,751ms |
| 第二次 (warm) | 4,859 | 65ms |

`prompt_eval_count`两次都是4,859，一模一样。token数没变，prefill时间却缩短约396倍。模型不是"没读"那些token，而是复用了已经算好的KV缓存，无需重算。

这就是[llama.cpp的prefix KV缓存](https://github.com/ggml-org/llama.cpp/discussions/13606)。Ollama跑在llama.cpp之上，于是继承了同样的行为。前缀相同的两个请求，那段KV缓存按位相同，所以第二个请求跳过共同前缀，只从分叉点开始处理。提示词完全相同就没有分叉点，prefill实际上消失了。

还有一个让我犯迷糊的点。即便缓存命中，`prompt_eval_count`仍然返回4,859这个满值。一开始我盯着这个数字，以为缓存没生效。该看的不是token数，而是`prompt_eval_duration`。要确认缓存是否在起作用，看prefill时间而非token数：把同一段提示词发两次，第二次prefill若掉到几毫秒，就是命中了。搞混这点，在缓存正常工作的环境里也容易误判成"没缓存"。

前面说我为测冷prefill在提示词开头加了随机ID，现在原因清楚了。缓存只复用<strong>从最前面起共同的那一段</strong>。第一个字节一变，后面全部都要重算。也就是说，在提示词开头放每次都变的值，会把整个缓存搞坏。

## 那代理该怎么搭

做完这次测量后，我改了本地代理拼装提示词的方式。归纳如下。

<strong>1. 不变的放前面，会变的放后面。</strong> 系统提示、工具定义、固定指令这些每轮都一样的内容，放在提示词最前。用户的新问题、刚检索到的结果这些每次都变的内容，往后挪。仅此一招，从第二轮起前面那段prefill就能搭上缓存，几乎免费。

<strong>2. 别在提示词开头放时间戳、随机ID。</strong> 把"当前时间: 2026-06-25 15:23:06"这类行钉在系统提示最顶端，每个请求第一行就变，缓存每次都被打碎。非放不可就挪到提示词末尾。这一个细节就能省下几十秒级的prefill。

<strong>3. 上下文窗口"放得下"不等于"用得了"。</strong> 模型支持32k，但在我的笔记本上哪怕1万token，第一个token也要55秒。要做交互式使用，应以实测的prefill时间、而非支持上限来定上下文预算。我在本地追求对话式响应时，会把上下文压在几千token以内。

<strong>4. 实在需要长上下文，就只付一次prefill再复用。</strong> 如果是围绕同一份文档反复提问的RAG，把文档放在提示词前方的固定位置，只在后面换问题。第一个问题付全额prefill，后续问题靠缓存几乎跳过prefill。[把本地模型接到MCP服务器来搭代理](/zh/blog/zh/local-llm-private-mcp-server-gemma4-fastmcp)时，守住这个顺序，也能避免每次工具调用往返都重新prefill系统提示。

## 我实际改动的提示词

光讲抽象规则不够直观，这里写下我把本地工具调用代理的提示词怎么重排的。改之前是这个顺序。

```text
当前时间: 2026-06-25 15:23:06        ← 每个请求都变(缓存破坏点)
会话ID: 9f3a-...                     ← 每个请求都变
[系统提示 800 token]
[工具定义 1,200 token]
[最近的对话历史]
[用户的新问题]
```

问题出在前两行。时间和会话ID放在最前，于是每个请求提示词的第一个字符都变。后面那800 token系统提示和1,200 token工具定义每轮一个字都不变，却因为前面缓存被打碎，每次都要从头重做prefill。按上面的表，2,000 token的prefill约10秒。每轮10秒，纯粹因为排布失误白扔了。

改之后是这样。

```text
[系统提示 800 token]                 ← 固定，放最前
[工具定义 1,200 token]               ← 固定
[最近的对话历史]                      ← 基本固定(只在末尾追加)
当前时间: 2026-06-25 15:23:06        ← 会变的值挪到末尾
会话ID: 9f3a-...
[用户的新问题]                        ← 每次都变的部分放最后
```

把固定块挪到前面后，从第二轮起，2,000 token的系统提示和工具定义整块搭上了缓存。对话历史也是只在末尾追加新消息，所以共同前缀一直保持很长。结果每轮需要重新prefill的，只剩新追加的几百个token。同样的模型、同样的硬件，每轮体感延迟却明显下降。代码没有一行变快，我只是改了拼接字符串的顺序。

## 这次测量的边界

诚实地划清边界。这是一台MacBook、一个模型(`gemma4:e4b`)、Ollama这一特定运行时跑出的数字。绝对值(55秒、16 tok/s)会随GPU、内存、量化、运行时整体改变。换更大的模型，或用上[把输出按类型接收的结构化输出](/zh/blog/zh/ollama-structured-outputs-pydantic-local-llm-guide-2026)，又会引入别的变量。

我信任的不是绝对值，而是<strong>形状</strong>。prefill几乎与上下文成正比增长，生成略微变慢，相同前缀靠缓存几乎免费。这三条趋势在任何环境里方向都应一致。并发请求下缓存如何竞争、量化级别对prefill速度有何影响，我还没测，留作下一次实验。

别再把本地LLM笼统地说成"快"或"慢"。把它拆成到第一个token的prefill、和每token的generation，该修哪里就一目了然。而那些该修的地方，大多不是去换模型，而是把提示词摆成可缓存的样子。

这次实验给我的最实用的一句话是：在本地搭代理时，第一个要检查的不是GPU、也不是模型大小，而是"我的提示词前半段在每轮里是否保持原样"。只要把前半段固定住，同样的硬件，从第二轮起prefill就几乎消失。这是一分钱不花、一张GPU不加就能拿到的免费加速。在动手测量之前，我只把它当成一种模糊的"体感"，就这么放过了。
