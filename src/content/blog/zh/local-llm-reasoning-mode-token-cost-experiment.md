---
title: '本地推理模型值回票价吗 — 用gemma4:12b实测thinking开/关的记录'
description: >-
  上一篇文章里我把gemma4:12b的空回复断定为打包bug。错了，它其实是推理模型。于是我用推理开/关跑了13道题。
  推理多答对了1题，却多花了68倍的输出token和19倍的时间。本文用实测整理在代理里该何时开、何时关。
pubDate: '2026-06-30'
heroImage: '../../../assets/blog/local-llm-reasoning-mode-token-cost-experiment/hero.png'
tags:
  - 本地LLM
  - Ollama
  - 推理模型
  - LLM评测
relatedPosts:
  - slug: llm-determinism-temperature-seed-experiment
    score: 0.82
    reason:
      ko: 바로 이 글에서 gemma4:12b의 빈 응답을 패키징 버그라고 잘못 적었다. 그 오판을 정정하는 후속편이 지금 글이라, 같이 읽으면 진단이 어떻게 뒤집혔는지 보인다.
      ja: その記事で私はgemma4:12bの空応答をパッケージングのバグと誤記した。今回はその誤診を訂正する続編なので、併せて読むと診断がどう覆ったか分かる。
      en: That post is where I mislabeled gemma4:12b's empty replies as a packaging bug. This one corrects that misdiagnosis, so reading both shows how the call flipped.
      zh: 我正是在那篇文章里把gemma4:12b的空回复误判为打包bug。本文是对那次误诊的更正，对照阅读能看到结论如何被推翻。
  - slug: ollama-num-ctx-silent-truncation-experiment
    score: 0.78
    reason:
      ko: 같은 Ollama + gemma4 스택에서 "모델이 멍청한 게 아니라 설정이 문제"였던 또 다른 사례다. num_ctx로 지시가 통째로 잘리는 현상을 쟀다.
      ja: 同じOllama + gemma4スタックで「モデルが愚かなのではなく設定の問題」だった別の事例。num_ctxで指示が丸ごと切れる現象を測った。
      en: Another case on the same Ollama and gemma4 stack where the config, not the model, was the culprit. It measures instructions vanishing under num_ctx truncation.
      zh: 同样在Ollama + gemma4技术栈上，"不是模型笨而是配置出问题"的另一个案例。测量了num_ctx导致指令被整段截断的现象。
  - slug: ai-agent-cost-reality
    score: 0.71
    reason:
      ko: 추론 토큰이 68배로 불어나는 걸 본 뒤라면, 에이전트 한 번 돌릴 때 토큰이 실제로 어디서 새는지 다룬 이 글의 비용 계산이 더 와닿는다.
      ja: 推論トークンが68倍に膨らむのを見た後なら、エージェントを一度回すときトークンが実際どこで漏れるかを扱った本記事のコスト計算がより腑に落ちる。
      en: After watching reasoning tokens balloon 68×, this post's cost math on where tokens actually leak in a single agent run lands harder.
      zh: 看过推理token暴涨68倍之后，这篇讲解代理单次运行中token究竟从哪里流失的成本计算会更有共鸣。
  - slug: multilingual-llm-token-tax-experiment
    score: 0.66
    reason:
      ko: 토큰이 곧 돈이라는 같은 문제의식이다. 그쪽은 언어가, 이쪽은 추론 모드가 토큰을 불린다. 두 축을 합치면 내 토큰 청구서가 보인다.
      ja: トークンが即ちお金という同じ問題意識だ。あちらは言語が、こちらは推論モードがトークンを増やす。二つの軸を合わせると私のトークン請求書が見える。
      en: Same premise that tokens are money. There the language inflates them, here the reasoning mode does. Combine both axes and you see your real token bill.
      zh: 同样基于"token即金钱"的问题意识。那边是语言、这边是推理模式在膨胀token。两个维度叠加，就能看清你真正的token账单。
faq:
  - question: '在Ollama里怎么关掉推理(thinking)？'
    answer: '在/api/chat请求体的最顶层加上 "think": false(和model、messages同级，不是放在options里)。在我的测量中，关掉它后同一道题的输出token从平均189个降到3个，响应时间从28秒多降到1.4秒多。反过来设 "think": true 会单独填充一个thinking字段。'
  - question: '关掉推理会让准确率大幅下降吗？'
    answer: '在我出的13道题里，几乎没降。关掉推理仍答对12题，只有数字排序那1题需要开推理才答对。不过这是短的单次提问的前提，越是需要自己分多步计算才能得出答案的任务，推理的收益越可能更大。'
  - question: '为什么gemma4:12b会返回空回复？'
    answer: '因为它是推理模型，会先把生成token花在thinking通道上，而我把num_predict设得太低(24〜40)，预算全被thinking用光，留给用户可见content的一个字都没剩。token确实生成了(eval_count在涨)，但content看上去是空字符串。上一篇说它是打包bug，是我的误诊。'
  - question: '你假设推理在CRT(认知反射测验)题上更强，验证成立吗？'
    answer: '不成立。蝙蝠与球、机器与小部件、睡莲叶这些经典CRT陷阱题，关掉推理也全部答对。它们太有名了，答案很可能连同题目一起进了训练数据。推理真正救回的，是训练里没有的即兴流程(把6个数排序后取第三大)。'
---

上个月，在[用temperature和seed测量输出可复现性的文章](/zh/blog/zh/llm-determinism-temperature-seed-experiment)里，我自信满满地写错了一段。我看到gemma4:12b-it-qat的 `eval_count` 在涨、`content` 却返回空字符串，便断定这是"token没映射到可见文本的打包问题"，然后把这个模型从可复现性的表里删掉了。

不是那么回事。这周准备另一个实验时，我又撞上同样的空回复，这次我把响应JSON读到了底。在 `message` 里，除了 `content`，还有一个字段叫 `thinking`。gemma4:12b是推理(reasoning)模型。空回复不是bug，而是我把 `num_predict` 设得太低，生成预算全被吸进推理通道，留给答案的token一个都不剩的结果。我连诊断都搞错了。

纠正这个错误后，我冒出了更想弄清的问题。这个推理到底值不值。如果同样的答案要慢23倍、多烧84倍的token，那我在代理里该开还是该关。于是我做了实测。

## 空回复的真凶是thinking字段

先复现。我用两种模式投了最简单的算术。Ollama的 `/api/chat` 允许在请求体最顶层放一个 `think` 布尔值来开关推理(和 `model`、`messages` 同级，不在 `options` 里)。

```python
import json, urllib.request
def chat(msg, think, num_predict=512):
    body = {
        "model": "gemma4:12b-it-qat",
        "messages": [{"role": "user", "content": msg}],
        "stream": False,
        "think": think,                       # ← 这里。在options外面
        "options": {"temperature": 0, "seed": 7,
                    "num_ctx": 2048, "num_predict": num_predict},
    }
    req = urllib.request.Request("http://localhost:11434/api/chat",
        data=json.dumps(body).encode(),
        headers={"Content-Type": "application/json"})
    r = json.load(urllib.request.urlopen(req, timeout=300))
    m = r["message"]
    return m.get("content", ""), m.get("thinking") or "", r.get("eval_count")
```

这是"一件衬衫打8折后40美元，原价是多少"的结果。

| 模式 | 时间 | 生成token | thinking字符数 | 答案 |
|------|------|-----------|----------------|------|
| `think=true` | 37.0秒 | 252 | 551 | 50(正确) |
| `think=false` | 1.6秒 | 3 | 0 | 50(正确) |

两边给出完全相同的答案。开推理的一边慢23倍，多烧84倍的token。我上一篇把 `num_predict` 设成24时，这252个推理token被截断，答案"50"还没生成就断了。空的 `content` 就是这么来的。不是模型的错，不是打包的错，是我设置的错。这和[因为num_ctx导致长输入里的指令被整段截断的上次实验](/zh/blog/zh/ollama-num-ctx-silent-truncation-experiment)是完全相同的教训：当模型看起来很蠢时，真凶通常是我自己的选项。

## 于是我换了个问题：推理在哪里才值回票价

"答案一样就该关"是太草率的结论。一道算术让推理看起来纯属浪费，但推理模型存在的理由，正是在快速直觉会出错的题上再想一遍把答案纠正过来。那个"直觉会出错的题"的教科书就是认知反射测验(Cognitive Reflection Test, CRT)。Shane Frederick在2005年论文里给出的三道题(蝙蝠与球、机器与小部件、睡莲叶)被设计成脑子里第一个冒出来的答案几乎必错。

于是我立了个假设。**开推理会在CRT陷阱题上提高准确率。** 这些题就是为打败直觉而造的，深思的模式理应在这里发光。

我按难度三层出了13道题。每道题答案唯一，并要求"只答数字"这类可判分的格式。

| 层 | 意图 | 例子 |
|----|------|------|
| 易(A1〜A4) | 简单查询·心算 | 日本首都、7×8、一周几天 |
| 中(B1〜B4) | 多步应用题 | 反推8折原价、60km/45分→时速、12个苹果的题 |
| 难(C1〜C5) | CRT陷阱+即兴流程 | 蝙蝠与球、机器与小部件、睡莲叶、6个数排序、"strawberry"里r的个数 |

每道题用 `think=false` 跑一次、`think=true` 跑一次。temperature=0、固定seed，所以同一模式可复现。我记录了每次调用的时间、生成token数和对错，并把两道CRT题(蝙蝠与球、睡莲叶)的完整推理轨迹整段保存了下来。

## 结果。多对1题，花了19倍的时间

26次调用(13题×2模式)的汇总。

| 指标 | thinking OFF | thinking ON | 倍数 |
|------|-------------|------------|------|
| 答对数 | 12 / 13 | 13 / 13 | +1 |
| 平均响应时间 | 1.4秒 | 28.3秒 | 20倍 |
| 每题平均输出token | 3 | 189 | 63倍 |
| 整套总输出token | 36 | 2,454 | 68倍 |
| 整套总耗时 | 19秒 | 368秒 | 19倍 |

开推理换来的就是1道答对。为这1道，整套多花了68倍的输出token、19倍的实际时间。上面的主图里蓝色柱(OFF)几乎看不见，因为每题只有1〜6个token。橙色柱(ON)从46个token一路爬到399个。

![准确率与成本汇总：1题之差，输出token多了68倍](../../../assets/blog/local-llm-reasoning-mode-token-cost-experiment/accuracy-vs-cost.png)

烧token最多的是机器与小部件(C2)，开推理用了399个token、59秒。同一道题关推理用2个token、1.4秒就解了。而且是对的。

## 推理真正救回的并不是CRT题

假设就在这里崩了。开推理才答对的只有一道，C4。可C4不是CRT陷阱，而是即兴流程题："把17, 3, 29, 8, 21, 14降序排列，告诉我第三大的数。"关推理答了21(把第二当成了第三)，开推理走了29、21、17，答对了17。

我本以为会发光的那三道CRT陷阱题，关推理也全对。

| 题目 | 直觉性错答 | OFF | ON |
|------|-----------|-----|-----|
| C1 蝙蝠与球(球几美分？) | 10 | 5 ✓ | 5 ✓ |
| C2 机器与小部件(几分钟？) | 100 | 5 ✓ | 5 ✓ |
| C3 睡莲叶(第几天盖一半？) | 24 | 47 ✓ | 47 ✓ |

为什么会这样。说实话，有个我看不见的变量。这三道题在认知科学教科书和LLM评测论文里出现得太多，答案很可能连同题目一起刻进了训练数据。gemma4:12b也许根本不是在"推理"，而是"记住了"直接答出来。反过来，C4的6个数是我当场挑的，无从背诵。"只有在背不出答案的即兴流程上推理才真正干了活"，这个解释和我的数据最吻合。

还有一处出乎意料，是C5。"strawberry里有几个r"是个经典陷阱，分词器把单词整个吞掉，LLM历来容易答错，但gemma4:12b关推理也秒答3。这同样像是因为这道题在训练分布里太多而固化了下来。也就是说，"著名的LLM陷阱"这个分类，作为衡量推理价值的尺子已经钝了。模型把那个陷阱当成陷阱背了下来。

所以我是这么看的。**推理模式的价值不来自"难题"，而来自"模型没见过的多步流程"。** 用著名的脑筋急转弯去评测推理模型，开关都答对，看不出差别。差距拉开，是在模型必须自己处理一份初次见到的具体数据时。

## 打开推理轨迹能看到什么

把开推理在蝙蝠与球(C1)上生成的thinking原样抄下来。

```
*   Total cost of bat + ball = $1.10.
*   Let x be the price of the ball.
*   The bat costs x + 1.00.
*   Equation: x + (x + 1.00) = 1.10
*   2x = 0.10  ->  x = 0.05
*   Convert to cents: 0.05 x 100 = 5.
*   验算: Ball 5 + Bat 105 = 110 cents. Correct.
ANSWER: 5
```

列方程，还做了验算。教科书般正确的解法。问题是，关推理也同样秒答5。这段花了297个token的漂亮推导，单看结果，和2个token的秒答打了平手。过程漂亮不等于值回了票价。睡莲叶(C3)的轨迹也类似，精准点出"每天翻倍，所以满之前一天就是一半"的核心。但这个洞见关推理早就有了(秒答47)。推理没能改变答案，只是展示了到达答案的路径。如果你需要把这条路径记进日志(评测、调试、审计)，轨迹本身就是价值。但如果是只取最终答案的流水线，297个token就只是成本。

## 落到代理上之后我改了什么

这次实测之后，我在本地代理的设置里改了三处。

第一，**把查询、分类、格式转换这些环节的 `think=false` 定为默认值。** 路由("这个请求该走哪个工具？")、短抽取、JSON整形这类活，几乎没有直觉出错的余地。在这里开推理，等于每个环节奉送20倍延迟和60倍token。代理要经过几十个这种轻量环节，累计损失很大。正如[拆解一次代理运行里token从哪儿漏掉的那篇文章](/zh/blog/zh/ai-agent-cost-reality)所示，成本不是漏在一记大的，而是漏在小环节的反复里。

用数字钉死，决策就轻松了。假设路由、抽取环节在一个请求里跑10次。关推理每环节1.4秒，10环节14秒。开推理每环节28秒，10环节280秒。用户盯着空白屏幕看4分钟以上。换来的准确率提升，至少在这些直觉不会出错的环节上接近0。本地模型每token不花现金，但时间和电力是实打实的成本，这笔账照样成立。

第二，**只在"模型没见过的多步计算"上开推理。** 那些要当场聚合用户数据、要同时满足多个约束、要带着中间状态往下走的环节。C4正是这个形状。不是为了解一道著名谜题才开，而是要跑一段没有背好答案的流程时才开。

第三，**给开推理的环节留足 `num_predict`。** 我一开始撞上的空回复，正是没做这件事的结果。推理通道会先吃掉189个token左右，答案要出来就得在它上面留余量。要开，就把预算一起抬上去。我把这一条也加进了[讲输出可复现性那篇](/zh/blog/zh/llm-determinism-temperature-seed-experiment)的推荐设置里。

## 一个模型、13道题的实验局限

老实说。这是一个模型(gemma4:12b)、13道题、每题测一次。与其说是统计，不如说更接近一个人用笔记本电脑折腾一天的记录。CRT题是否在训练数据里，我没法核实，只能说"可能性很大"。更大的推理模型或更难的基准上，推理的收益肯定会更明显。别把这些数字读成"推理没用"。我的结论不是那个，而是"推理不是免费的，得挑好开它的地方"。

我本来要做的，是测量长上下文里信息位置对检索准确率的影响(所谓lost-in-the-middle)，但1.5k token的预填充就花了26秒，一次运行里跑不完。那留到下次。今天能找出空回复的真因、量出推理的票价，已经是笔划算的买卖。至少我纠正了上一篇里的一处误诊。
