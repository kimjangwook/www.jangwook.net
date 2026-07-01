---
title: '给一个本地LLM同时接8个代理 — Ollama并发吞吐量实测'
description: >-
  我以为并行触发子代理会让本地模型也随之变快。实测发现默认的Ollama会把请求排队处理，接8个和接1个的总吞吐量一样。我在M1
  16GB上实测了调高OLLAMA_NUM_PARALLEL带来的吞吐增益，以及它的代价。
pubDate: '2026-07-01'
heroImage: '../../../assets/blog/local-llm-concurrent-requests-num-parallel-experiment/hero.png'
tags:
  - 本地LLM
  - Ollama
  - 并发
  - AI代理
relatedPosts:
  - slug: multi-agent-orchestration-improvement
    score: 0.79
    reason:
      ko: 여러 에이전트를 동시에 굴리는 오케스트레이션 얘기를 그 글에서 다뤘다. 그 병렬 실행이 로컬 모델 뒤에서 실제로 어떻게 처리되는지가 이 글의 측정값이다.
      ja: 複数のエージェントを同時に回すオーケストレーションをあの記事で扱った。その並列実行がローカルモデルの裏で実際どう捌かれるかが本記事の測定値だ。
      en: That post covered orchestrating several agents at once. This one measures what that parallel execution actually does behind a local model.
      zh: 那篇文章讲了同时运行多个代理的编排。本文测量的正是这种并行执行在本地模型背后究竟如何被处理。
  - slug: ollama-num-ctx-silent-truncation-experiment
    score: 0.74
    reason:
      ko: 동시 요청 슬롯을 늘리면 컨텍스트 메모리가 슬롯 수만큼 곱해진다. num_ctx가 왜 메모리 예산의 핵심인지 그 글에서 먼저 잡아두면 이 글의 제약이 바로 이해된다.
      ja: 同時リクエストのスロットを増やすとコンテキストメモリがスロット数だけ掛け算される。num_ctxがなぜメモリ予算の要かをあの記事で押さえると本記事の制約がすぐ腑に落ちる。
      en: More parallel slots multiply context memory by the slot count. Grasping why num_ctx is the memory budget there makes this post's constraint click.
      zh: 增加并发请求槽位会让上下文内存按槽位数翻倍。先在那篇文章理解num_ctx为何是内存预算的关键，本文的限制就一目了然。
  - slug: local-llm-prefill-generation-latency-experiment
    score: 0.71
    reason:
      ko: 단일 요청의 지연을 prefill과 생성으로 쪼갠 글이다. 이 글은 그 위에 "요청이 여러 개면 어떻게 되나"를 얹은 셈이라, 지연의 기본기를 먼저 보면 좋다.
      ja: 単一リクエストの遅延をprefillと生成に分解した記事だ。本記事はその上に「リクエストが複数だとどうなるか」を重ねた形なので、遅延の基礎を先に見ると良い。
      en: That post split single-request latency into prefill and generation. This one stacks "what if there are many requests" on top, so the latency basics help first.
      zh: 那篇文章把单请求延迟拆成prefill和生成。本文是在其上叠加"多个请求时会怎样"，先看延迟基础会更顺。
  - slug: ai-agent-cost-reality
    score: 0.66
    reason:
      ko: 로컬로 돌리면 API 요금은 0이지만 시간이 곧 비용이다. 동시성으로 총 처리 시간을 줄일 수 있는지가 그 글에서 다룬 비용 감각과 바로 연결된다.
      ja: ローカルなら API 料金はゼロだが時間が即コストだ。同時実行で総処理時間を減らせるかは、あの記事のコスト感覚に直結する。
      en: Running locally makes the API bill zero, but time is the cost. Whether concurrency cuts total wall time ties straight into that post's cost sense.
      zh: 本地运行 API 费用为零，但时间就是成本。并发能否缩短总处理时间，直接关联那篇文章的成本观。
faq:
  - question: '给Ollama发并发请求会自动并行处理吗？'
    answer: '不一定。这由OLLAMA_NUM_PARALLEL决定，若不设置这个值，它会根据可用内存自动选择4或1。我在M1 16GB上加载gemma4时它被定为1，所以即使发8个并发请求，服务器也是一个个排队处理。总吞吐量停留在与单请求相同的每秒约23个token，只有墙钟时间涨到了8倍。'
  - question: '调高OLLAMA_NUM_PARALLEL能快多少？'
    answer: '总吞吐量会上升，但单个请求会变慢。我的测量里，num_parallel=4下跑4个并发，集计吞吐量从每秒18个token升到33个，约1.8倍。代价是每个请求的生成速度从每秒约22个token掉到10个，不到一半。这是一笔交易：打包成批把总量做大，但每个各自让步。'
  - question: '调高并发会多耗多少内存？'
    answer: '按官方FAQ，上下文会按并行槽位数翻倍。2K上下文配并行4就变成实效8K，需要相应更多的KV缓存内存。这正是为什么在16GB M1这类内存吃紧的机器上Ollama会把默认值降到1。盲目调大num_parallel可能把模型挤出GPU，反而更慢。'
  - question: '跑多个代理时本地模型成了瓶颈怎么办？'
    answer: '先测一测并发是否真的能提升吞吐量。如果槽位是1，加代理只会让队列更长。若目标是吞吐量，就把num_parallel调到内核和内存能承受的上限；若目标是延迟，反而应该把请求串行化，一个个快速跑完。没有同时满足两者的魔法值。'
---

我在搭一条本地同时跑几个子代理的流水线时，一个想当然的前提卡住了。云API大多在并行发请求时会相应更快完成。所以我模模糊糊地相信，把8个代理一起接到本地Ollama上，GPU会自己分摊处理，总时间会减少。

可在M1 MacBook上真的接了8个后，感觉不对。跑1个和跑8个，每秒吐出的token总量几乎一样。只是耗时更长而已。我分不清这是我的误解还是实际行为，于是不再猜，当场测了一遍。

## 测了什么，怎么测

环境是Apple M1、16GB统一内存、Ollama 0.30.7。模型用的是gemma4系的一个小变体（约4GB，`ollama ps`里显示100% GPU卸载）。选小模型是因为实验必须一次跑完，哪怕反复跑到8个并发。

方法很直接。用Python的`ThreadPoolExecutor`把相同数量的请求并发发到`/api/generate`，每个请求把`num_predict`固定为100，让各自恰好生成100个token。提示词用了8个轮换、彼此不同，避免prompt缓存扭曲结果。把并发数从1、2、4提到8，我盯两个指标。

- 集计吞吐量（aggregate tokens/sec）：整批每秒吐多少token。
- 墙钟时间（wall-clock）：整批跑完实际花几秒。

我直接从响应JSON里读`eval_count`和`eval_duration`，同时记录每个请求的实际生成速度。这里`eval_duration`只含纯生成时间，不含在队列里等待的时间，这对区分"是在排队"还是"生成得慢"至关重要。

核心测量代码就这么多。想复现的话，直接复制到自己的机器上跑就行。

```python
import json, time, urllib.request, concurrent.futures, statistics

URL = "http://localhost:11434/api/generate"
MODEL = "gemma4:latest"   # 换成你自己的模型
NUM_PREDICT = 100

def one_request(idx):
    body = json.dumps({
        "model": MODEL,
        "prompt": PROMPTS[idx % len(PROMPTS)],  # 8个互不相同的提示词
        "stream": False,
        "options": {"num_predict": NUM_PREDICT, "seed": idx},
    }).encode()
    req = urllib.request.Request(URL, data=body,
                                headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=600) as r:
        d = json.loads(r.read())
    return d["eval_count"], d["eval_duration"] / 1e9  # token数, 纯生成秒

def bench(concurrency):
    t0 = time.perf_counter()
    with concurrent.futures.ThreadPoolExecutor(max_workers=concurrency) as ex:
        res = list(ex.map(one_request, range(concurrency)))
    wall = time.perf_counter() - t0
    total_tokens = sum(c for c, _ in res)
    return total_tokens / wall  # 集计吞吐量(tok/s)
```

固定`num_predict`是关键。不设它的话，每个请求生成长度参差不齐，吞吐量对比就模糊了。把长度固定，才能得到"同一件事同时让N个去做"的纯吞吐量。

## 默认服务器会把你的请求排队

先把这批请求丢给我平时用的默认Ollama服务器（端口11434，没设任何环境变量）。结果汇总如下。

| 并发请求 | 墙钟(秒) | 集计吞吐量(tok/s) | 单请求生成速度(tok/s) |
|---|---|---|---|
| 1 | 4.38 | 21.7 | 24.6 |
| 2 | 8.71 | 22.4 | 23.6 |
| 4 | 16.53 | 22.6 | 23.7 |
| 8 | 32.04 | 23.5 | 24.5 |

数字太干净了，我一开始以为是bug。墙钟时间跟并发数精确成正比。接8个恰好是接1个的8倍。而集计吞吐量却牢牢钉在每秒22到23个token，纹丝不动。

关键在第三列。单请求生成速度不管并发多少，始终保持在每秒24个token左右。这意味着每个请求都以它单独时的最高速度在生成。可总量不涨、只有墙钟在涨，就说明这些请求并不是被一起计算的，而是一个接一个按顺序处理的。服务器把请求放进队列，串行地流过去。并行槽位是1。

用数字再核对一遍就对得上。并发8时墙钟是32秒，而一个请求以每秒24个token生成100个token约需4.2秒。4.2秒 × 8 = 33.6秒，与观测到的32秒几乎吻合。八个请求没有重叠，是一个接一个跑的。先到的请求立刻被处理，但排在第八位的请求要等前面七个跑完，纯粹地干等，最后才用掉自己的4.2秒。这段等待时间会把单个请求的体感延迟直接抬高。

到这里我想起[因为num_ctx而把长输入里的指令整段截掉的那次实验](/zh/blog/zh/ollama-num-ctx-silent-truncation-experiment)。那次也是"不是模型笨，是配置出了问题"。这回是同样的味道。不是模型不能并行，而是服务器被配置成不并行。

## 为什么是1 — 用文档确认

Ollama官方FAQ给了答案。`OLLAMA_NUM_PARALLEL`设定单个模型同时处理的最大请求数，若不设置这个值，它会根据可用内存自动选择4或1（[Ollama FAQ](https://docs.ollama.com/faq)）。还有决定性的一句：并行请求会把上下文大小按并行数翻倍。2K上下文配并行4就变成实效8K，会多吃那么多内存。

所以16GB的M1因为内存吃紧，Ollama自己把并行降到了1。不是我偷懒，是机器这么判断的。这也意味着，对大多数在笔记本上跑本地模型的人来说，这就是默认值。

## 打开4个槽位会发生什么

为验证假设，我在另一个端口(11500)上以`OLLAMA_NUM_PARALLEL=4`启了第二个服务器，没动原来的服务器。在服务器日志里确认`OLLAMA_NUM_PARALLEL:4`确实生效后，跑了同样的基准。

```
model=gemma4(small) num_predict=100  OLLAMA_NUM_PARALLEL=4
concurrency=1  wall=5.15s  aggregate=18.4 tok/s  per_req=21.7 tok/s
concurrency=2  wall=10.57s aggregate=18.5 tok/s  per_req=9.8 tok/s
concurrency=4  wall=11.36s aggregate=33.2 tok/s  per_req=9.9 tok/s
concurrency=8  wall=22.30s aggregate=33.6 tok/s  per_req=10.0 tok/s
```

这里画面彻底变了。在并发4这个点上，集计吞吐量从每秒18个token跳到33个，约为单流的1.8倍。按墙钟看，并发4只用11.4秒，明显短于默认服务器处理同样4个所花的16.5秒。并行批处理真的起作用了。

但天下没有免费的。看单请求生成速度，从并发2起就已经从22砍半到10个token/秒。请求确实被一起计算了，但共享一块GPU，各自也就相应变慢。所以并发2时有意思的是集计吞吐量不涨(还是18.5)。两个各分一半，合起来不变。增益要等槽位全部被填满(4个)时才出现。

并发8呢？集计吞吐量是33.6，跟4几乎一样。槽位只有4个，剩下的4个在队列里等。于是墙钟又涨(22.3秒)，排在队列后面的请求体感延迟拉到最多22秒。吞吐量在4就已经触顶。

把这个对比画成一张图如下。左边是集计吞吐量，右边是墙钟时间。灰色是默认(串行)，蓝色是num_parallel=4。

![gemma4并发吞吐量与墙钟时间对比图](../../../assets/blog/local-llm-concurrent-requests-num-parallel-experiment/hero.png)

## 那到底接几个代理

这次测量立刻改了我的[多代理编排](/zh/blog/zh/multi-agent-orchestration-improvement)设计。总结如下。

第一，在默认设置下，并发不会提升吞吐量。槽位是1时，把代理增到8个只会让队列更长、总时间变成8倍。"我并行发了所以会快"在本地是错误的直觉。别把云API的感觉照搬过来。

第二，若目标是吞吐量，调高`OLLAMA_NUM_PARALLEL`是对的，而且只有把槽位填满时才有增益。往4个槽位里发2个请求，增益为0。得把请求凑到槽位数再成批发。

第三，若目标是延迟，反而串行更好。对用户等一个响应的交互路径，让请求一个个以最高速度跑完能更快返回每个答案。把多个凑成批会让每个的速度砍半。

我的结论是：后台批量作业(汇总多个文档、批量分类)我改成调高num_parallel、成批发；有人在等的交互路径保持串行。没有哪个单一设置能同时满足两者。

## 先确认自己机器的槽位数

改设计之前，得先知道自己的服务器现在把并行开成了几个。这不用猜，可以立刻确认。启动服务器的终端里会打印一行`server config`，从中直接读`OLLAMA_NUM_PARALLEL`的值即可。如果是自动选择的，用实测确认更稳妥。用上面的脚本发4个并发，若墙钟涨到单请求的4倍，槽位就是1；若基本持平，槽位就是4或以上。

要改这个值，把服务器连同该环境变量一起重启即可。

```bash
# 开4个并行槽位并启动服务器
OLLAMA_NUM_PARALLEL=4 ollama serve
```

如果Ollama是以应用形式自动启动的，就得把这个变量加到系统服务的环境里。而且改完之后一定要重测。把槽位调大后如果模型被挤出内存反而更慢，所以别光看设置值就放心。我曾跳过这步检查，觉得"设成4了应该没问题"，后来才发现大模型上槽位根本没打开。

## 这次测量的局限

老实说：这是M1 16GB加载小gemma4这一特定条件下的数字。内存充裕的机器或有独立GPU的环境，默认num_parallel会是4；大模型每个槽位的KV缓存很大，本来就立不起几个并行槽位。因为并行槽位会把上下文内存翻倍，上下文越长的代理越难调高并发。所以[测量单请求prefill成本那篇](/zh/blog/zh/local-llm-prefill-generation-latency-experiment)里看到的长输入之重，在这里又来拖后腿。

还有一点。那1.8倍的集计增益也说明这台硬件的GPU还有闲置余量。如果单流已经把GPU用到100%，并行成批也几乎不会有增益。增益的大小因机器而异，所以结论只有一个：改了设置，一定要在自己的机器上重测。30行的脚本就够了。

下一步我打算用大模型(gemma4:12b)跑同样的实验，测量模型变大时并行槽位能撑到几个，以及在那个点GPU饱和的边界。只要我在本地跑多个代理，这个边界值就是我流水线的实质上限。

## 参考资料

- [Ollama FAQ — 如何处理并发请求](https://docs.ollama.com/faq) — `OLLAMA_NUM_PARALLEL`、`OLLAMA_MAX_LOADED_MODELS`、`OLLAMA_MAX_QUEUE`的官方文档，包含并行请求会按槽位数把上下文大小翻倍的说明。
- [Ollama API 文档 — /api/generate](https://github.com/ollama/ollama/blob/main/docs/api.md) — 基准测试所用的端点，包含用于读取每请求生成速度的 `eval_count` 与 `eval_duration` 字段。
- [Ollama v0.2.0 发布说明](https://github.com/ollama/ollama/releases/tag/v0.2.0) — 首次引入并发（并行请求与多模型加载）支持的版本。
