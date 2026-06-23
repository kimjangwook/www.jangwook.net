---
title: '别把原始JSON直接喂给LLM — 我实测了9种数据格式的token成本'
description: '把同样的50条记录序列化成JSON、YAML、CSV、TSV、XML等9种格式，用tiktoken实测token。平坦数据下TSV比pretty JSON便宜62%，而数据一旦嵌套，结论就反转。'
pubDate: '2026-06-21'
heroImage: ../../../assets/blog/llm-token-cost-data-format-experiment.png
tags:
  - llm
  - context-engineering
  - tokenization
relatedPosts:
  - slug: ai-agent-cost-reality
    score: 0.83
    reason:
      ko: 에이전트 운용 비용을 실제 숫자로 따져본 글이다. 포맷 선택으로 토큰을 줄이는 건 그 비용 구조의 한 레버라서 같이 읽으면 그림이 맞춰진다.
      ja: エージェント運用コストを実数で検証した記事。フォーマット選択でトークンを削るのはそのコスト構造の一つのレバーなので、合わせて読むと全体像がつかめる。
      en: Breaks down agent operating cost in real numbers. Cutting tokens via format choice is one lever on that cost structure, so the two posts complete each other.
      zh: 用真实数字拆解智能体运营成本。通过格式选择削减token是该成本结构中的一个杠杆，两篇一起读能拼出全貌。
  - slug: claude-agent-sdk-tool-use-complete-guide-2026
    score: 0.8
    reason:
      ko: 툴이 돌려주는 결과를 어떤 포맷으로 컨텍스트에 넣느냐가 이 실험의 핵심 적용처다. Tool Use를 직접 구현해봤다면 바로 와닿을 것이다.
      ja: ツールが返す結果をどの形式でコンテキストに入れるかが、この実験の主な適用先だ。Tool Useを実装したことがあればすぐ腑に落ちる。
      en: How a tool's result gets serialized into context is the prime place this experiment applies. If you've built Tool Use yourself, it lands immediately.
      zh: 工具返回结果以何种格式进入上下文，正是本实验的主要落地点。亲手实现过Tool Use的人会立刻理解。
  - slug: ollama-structured-outputs-pydantic-local-llm-guide-2026
    score: 0.74
    reason:
      ko: 출력을 구조화 JSON으로 강제하는 쪽 이야기라면, 이 글은 입력으로 들어가는 데이터의 포맷 비용을 다룬다. 입출력 양쪽을 보면 토큰 가계부가 완성된다.
      ja: 出力を構造化JSONに強制する話の裏で、この記事は入力データの形式コストを扱う。入出力の両面を見るとトークン家計簿が完成する。
      en: That post forces output into structured JSON; this one measures the cost of the data going in. Seeing both sides completes your token budget.
      zh: 那篇讲把输出强制为结构化JSON，本文衡量输入数据的格式成本。看清输入输出两端，token账本才算完整。
faq:
  - question: "哪种数据格式的LLM token最便宜?"
    answer: "取决于数据的形状。对平坦、均匀的记录，在这次实测中TSV最便宜，比pretty JSON少用62%的token，CSV和Markdown表紧随其后。对嵌套数据则用不了表格系，compact JSON以比pretty JSON便宜45.7%夺得第一。XML在所有情况下都最贵。"
  - question: "为什么TSV或CSV比JSON便宜?"
    answer: "表格系把字段名只写在表头一行，行里只列值。而JSON每条记录都重复 `\"warehouse\":` 这样的键，50条记录就意味着每个键重复50次，再加上包裹它们的引号和花括号。在50条平坦记录上，pretty JSON每条约82 token，TSV为31 token，同样的数据相差两倍以上。"
  - question: "平坦数据和嵌套数据下最便宜的格式会变吗?"
    answer: "会变，结论反转。CSV、TSV、Markdown表无法表示变长数组或嵌套对象，因此直接出局。在嵌套数据中，我测得compact JSON(带separators的json.dumps)最便宜，比pretty JSON低45.7%。经验法则很简单：均匀的行用表格系，嵌套结构用compact JSON。"
  - question: "我自己该如何测量token成本?"
    answer: "用OpenAI的tiktoken库即可。加载与模型匹配的编码(GPT-4o和GPT-5系列用o200k_base，旧版GPT-4和3.5用cl100k_base)，再用len(enc.encode(序列化字符串))计数。把同一份数据序列化成多种格式来对比，就能直接看到各格式的实际差异，而不必依赖\"字符数 × 0.75\"的粗略经验值。"
---

我需要把一份50行的商品目录作为上下文交给智能体。出于习惯，我用 `json.dumps(records, indent=2)` 漂亮地格式化后塞了进去，结果token计数器一看竟超过4000。数据本身很小。我开始怀疑：是不是缩进和引号吃掉了将近一半的token？于是我把同样的数据序列化成9种格式，用真实分词器逐一数了一遍。

先说结论：**对平坦数据，TSV比pretty JSON便宜62%。** 但数据一旦嵌套，这个结论就整个反转。那条边界究竟在哪，我边测边理清。

## 测量环境：用tiktoken数，而不是猜

token成本常被粗略说成"大约字符数 × 0.75"，但这个经验值根本捕捉不到格式间的差异。同样的经验值一旦换了语言会怎样崩掉，我在[同一篇文章韩语却要1.4倍token的非英语token税实测](/zh/blog/zh/multilingual-llm-token-tax-experiment)里另作了测量。所以我直接用了OpenAI公开的 [tiktoken](https://github.com/openai/tiktoken)。我并排跑了两套编码：GPT-4o、o系列、GPT-5系列所用的 `o200k_base`，以及旧版GPT-4系的 `cl100k_base`。

测试数据模仿了真实的"工具结果"。50条商品记录，每条是含9个字段的平坦对象：`id`、`sku`、`name`、`category`、`price`、`stock`、`warehouse`、`status`、`rating`。

```python
import json, io, csv, yaml, tomli_w, tiktoken

records = json.load(open("records.json"))  # 50条平坦记录
enc = tiktoken.get_encoding("o200k_base")  # GPT-4o / GPT-5系

def tok(s): return len(enc.encode(s))

print("pretty :", tok(json.dumps(records, indent=2)))
print("compact:", tok(json.dumps(records, separators=(",",":"))))
print("csv    :", tok(to_csv(records)))
```

沙箱在repo之外的一次性 `mktemp -d` 目录里运行，只保留结果日志和图表，环境随后清除。这种把一次性验证环境隔离开的习惯，是在[同时运行8个智能体并核算成本的那段经历](/zh/blog/zh/ai-agent-cost-reality)中固化下来的。削减token，归根到底是那本费用账上的一行。

## 平坦数据：TSV遥遥领先

这是把50条平坦记录用9种方式序列化的实测结果。以 `o200k_base` 为准，pretty JSON（4,128 token）记为0%基线。

| 格式 | 字符数 | o200k token | cl100k token | 相对pretty JSON |
|---|---|---|---|---|
| TSV | 3,742 | **1,568** | 1,663 | −62.0% |
| CSV | 3,742 | 1,650 | 1,650 | −60.0% |
| Markdown表 | 4,766 | 1,897 | 1,897 | −54.0% |
| JSON (compact) | 7,985 | 2,578 | 2,593 | −37.5% |
| key: value 行 | 6,982 | 2,708 | 2,708 | −34.4% |
| YAML | 7,834 | 3,159 | 3,159 | −23.5% |
| TOML | 8,533 | 3,176 | 3,191 | −23.1% |
| JSON (pretty) | 10,986 | 4,128 | 4,143 | 0.0% |
| XML | 13,654 | 4,777 | 4,778 | +15.7% |

![各数据格式的LLM token成本柱状图 — 同样50条记录用TSV输入，比pretty JSON少用62%的token](../../../assets/blog/llm-token-cost-data-format-experiment.png)

最扎眼的是pretty JSON和TSV之间2.6倍的差距。同样的信息。模型接收到的事实一个字都没变。然而两格缩进、重复的键名、引号和花括号，把token撑大了2.6倍。XML更进一步，靠闭合标签把每个字段写两遍，比pretty JSON还高16%。我认为把XML用作LLM输入格式几乎注定是亏的。

CSV、TSV、Markdown表便宜的原因很简单。**它们把字段名只写在表头一行，50行里只列值。** JSON系每条记录都把 `"warehouse":` 这样的键重复50次。字段越多、行越长，这笔重复税越重。

拆到每条记录看更明显。pretty JSON的4,128 token摊到50条，每条约82 token。TSV扣掉表头行(约18 token)后的1,550 token摊到50行，每条约31 token。同样9个字段塞进一行，一边花82 token，另一边花31 token。差异的根源不是数据，而是9个键名 × 重复50次，加上包裹它们的引号和花括号。对模型而言，`"category":"books"` 和 `books` 是同一个事实，可前者要花三四倍的token去表达它。

## 贵的不是重复的键，而是样板符号

我想纠正一个容易产生的误读。准确的说法不是"JSON慢"，而是"结构标点贵"。compact JSON比pretty JSON便宜37.5%，不是因为键变少了。键照样重复50次。减掉的只有缩进空白和换行。

```text
缩进2空格 "  "  -> 1 token (id 220)
3个逗号   ",,,"  -> 1 token
```

在 `o200k_base` 中，两格缩进本身就占一个token(ID 220)。当50条记录各自给9个字段缩进两格，光这个空白token就铺了几百个。再加上每行的换行、每个对象的开闭花括号。在人眼里这是可读性，在模型眼里只是成本。所以我把"不是给人读就不要pretty"定为默认值。

## 嵌套数据下，结论反转

如果到此为止，我会得出"一律CSV"这个错误教训。所以我又测了形状不同的数据。20笔订单，每笔含一个客户对象(连地址都嵌套)和一个变长的条目数组。

| 格式 | o200k token | 相对pretty JSON |
|---|---|---|
| JSON (compact) | **1,538** | −45.7% |
| YAML | 1,958 | −30.9% |
| TOML | 2,021 | −28.7% |
| JSON (pretty) | 2,835 | 0.0% |

CSV、TSV、Markdown表彻底出局。因为没有办法把变长的条目数组和嵌套对象塞进二维表格。而在平坦数据中以−34%居中游的compact JSON，在嵌套数据里以−45.7%夺得第一。YAML无论平坦还是嵌套，都因缩进成本而没有想象中便宜。"YAML既适合人读又省token"这条俗见，至少在这次测量里不成立。

归纳起来，边界是这样的。**均匀的行就用表格系(CSV/TSV/Markdown)，嵌套就用compact JSON。** 这一句是今天实验里捞到的最实用的规则。

## 在智能体循环里，这个差距会复利累加

几千token看着不算什么，但智能体每一轮都会重发同样的上下文。假设你把50条目录以pretty JSON钉进系统提示，跑一段30轮的对话。仅把格式换成TSV，每轮就省下约2,560 token(4,128 → 1,568)。30轮就是76,000 token。在上下文窗口紧张的模型上，这决定了"装得下还是装不下"；在按量计费的模型上，它就是实打实的输入token费用。

这里可能有人反驳："用了提示缓存，同样的上下文不就便宜了吗？"确实。如果目录钉在系统提示里，缓存命中会大幅降本。但缓存并不减少token数量本身。缓存的token照样占满上下文窗口的上限，而且缓存通常过了较短的TTL就失效，再以全价重新填充。更何况像工具结果这种每轮都变的数据，根本就进不了缓存。用格式削token，不是和缓存竞争的手段，而是互补的手段。两个都开，两头都赚。

这在MCP工具返回大结果时尤其明显。当[你用FastMCP搭的服务器](/zh/blog/zh/fastmcp-python-mcp-server-build-guide-2026)把数据库查询结果原样以JSON返回时，那个格式就是模型的输入成本。服务器端把平坦结果序列化为CSV/TSV再返回这一个小决定，会改变整个智能体的token账本。

当然，局限也很清楚。我只测了token数量，**并没有测模型是否同样能读懂每种格式。** 不调API能复现的范围就到这里。凭直觉，像CSV这种表头与值距离很远的格式，在字段多的数据上可能让模型犯糊涂。表头只在顶部出现一次，模型得靠位置去数第30行第7个值是哪个字段。为省token而丢精度，那就得不偿失。所以真正落地前，至少要把token节省和回答质量放在一起做一次A/B。这个验证留到下个实验。

## 从明天起立刻应用的

今天的实测把我的默认值改成了这样。

- 平坦记录数组进上下文时，用CSV或Markdown表。禁用pretty JSON。
- 嵌套结构用 `json.dumps(x, separators=(",",":"))` 压缩。`indent=2` 只在人调试时用。
- LLM输入不用XML。同样的信息，它最费token。
- 若换格式大幅削了token，就验证一次该格式下模型精度是否保持。

数据格式是代码里几乎自动决定的值，平时不会去留意。可它进入LLM上下文的那一刻，那个随手的 `indent=2` 就可能造出半张token账单。在亲自测量之前，我也低估了它的分量。

## 参考资料

- [tiktoken (OpenAI)](https://github.com/openai/tiktoken) — OpenAI官方的BPE分词器。本文所有token计数以及 `o200k_base`、`cl100k_base` 编码都用它完成。
- [JSON规范 (json.org)](https://www.json.org/json-en.html) — JSON交换格式的权威参考，本实验的基线格式。
- [YAML 1.2.2规范 (yaml.org)](https://yaml.org) — YAML官方规范，有助于理解推高其token成本的缩进规则。
- [TOML规范 (toml.io)](https://toml.io) — TOML官方规范，本次测量的9种格式之一。

> 测量代码与完整日志在沙箱中运行一次后，保存于 `docs/evidence/llm-token-cost-data-format-experiment.md`。基于 tiktoken 0.12.0、Python 3.12.8。
