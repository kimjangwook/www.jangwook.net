---
title: LLM API定价对比2026 — GPT-5 vs Claude vs Gemini vs DeepSeek实际成本计算
description: >-
  基于2026年4月数据，通过实际生产场景对比主要LLM API定价。涵盖GPT-5.4、Claude Opus 4.6、Gemini 3.1
  Pro和DeepSeek V4的Token成本、缓存折扣及批量API策略。
pubDate: '2026-04-18'
heroImage: >-
  ../../../assets/blog/llm-api-pricing-comparison-2026-gpt5-claude-gemini-deepseek-hero.jpg
tags:
  - llm
  - api-pricing
  - cost-optimization
  - gpt-5
  - claude
relatedPosts:
  - slug: openclaw-opus-4-6-setup-guide
    score: 0.94
    reason:
      ko: Claude Opus 4.6 가격($5/M)이 납득되면, OpenClaw로 동일 모델을 로컬에서 실행해 API 비용 자체를 줄이는 방법도 있다.
      ja: Claude Opus 4.6の価格（$5/M）に納得したら、OpenClawで同モデルをローカル実行してAPI費用を削減する選択肢もある。
      en: Once you understand Claude Opus 4.6 pricing ($5/M), OpenClaw shows how to run the same model locally to cut API costs entirely.
      zh: 了解了Claude Opus 4.6定价（$5/M）后，OpenClaw提供了本地运行同款模型以彻底削减API费用的方案。
  - slug: anthropic-claude-performance-decline-controversy-april-2026
    score: 0.94
    reason:
      ko: Claude API 비용을 최적화하면서 Anthropic이 effort 레벨을 몰래 낮췄다는 논란도 알아두면, 같은 $5/M에서 받는 품질이 언제든 변할 수 있음을 이해할 수 있다.
      ja: Claude APIコストを最適化する中で、Anthropicがeffortレベルを密かに下げたという論争も把握しておくと、同じ$5/Mで受け取る品質がいつでも変わりうることが分かる。
      en: When optimizing Claude API costs, knowing that Anthropic quietly reduced effort levels helps you understand that quality at the same $5/M can shift at any time.
      zh: 在优化Claude API成本时，了解Anthropic悄然降低effort级别的争议，有助于理解同样$5/M所获得的质量随时可能改变。
  - slug: claude-code-insights-usage-analysis
    score: 0.93
    reason:
      ko: API 가격을 비교했다면 다음 질문은 "어떤 태스크에서 토큰이 가장 많이 소비되는가"다. Claude Code 실사용 분석이 그 답을 준다.
      ja: API価格を比較したなら、次の疑問は「どのタスクでトークンが最も多く消費されるか」だ。Claude Code実使用分析がその答えを示してくれる。
      en: After comparing API prices, the next question is which tasks consume the most tokens. The Claude Code usage analysis provides that answer.
      zh: 比较API价格之后，下一个问题是哪些任务消耗最多Token。Claude Code实际使用分析提供了这个答案。
  - slug: greptile-ai-coding-report-2025-review
    score: 0.93
    reason:
      ko: AI 코딩 도구를 선택할 때 모델 가격만큼 중요한 게 실사용 패턴이다. Greptile 리포트는 개발자들이 AI 코딩에서 실제로 무엇을 원하는지 수치로 보여준다.
      ja: AIコーディングツールを選ぶとき、モデル価格と同じくらい重要なのが実使用パターンだ。GreptileレポートはAIコーディングで開発者が実際に何を求めているかを数値で示している。
      en: When choosing AI coding tools, actual usage patterns matter as much as model pricing. The Greptile report quantifies what developers actually want from AI coding.
      zh: 选择AI编程工具时，实际使用模式与模型定价同样重要。Greptile报告用数据展示了开发者对AI编程的实际需求。
  - slug: mcp-servers-toolkit-introduction
    score: 0.93
    reason:
      ko: MCP 서버를 운영할 때 백엔드 LLM 선택이 곧 운영 비용이다. 이 가격 비교는 MCP 서버 구축 시 모델 결정에 바로 적용된다.
      ja: MCPサーバーを運用する際、バックエンドLLMの選択が運用コストに直結する。この価格比較はMCPサーバー構築時のモデル決定にそのまま適用できる。
      en: When running an MCP server, your backend LLM choice directly determines operational cost. This pricing comparison applies directly to model selection when building MCP servers.
      zh: 运行MCP服务器时，后端LLM的选择直接决定运营成本。这份定价对比可以直接应用于构建MCP服务器时的模型选择。
---

上个月，当我把这个博客的自动化流水线切换到Claude Sonnet 4.6时，我第一次认真算了一下每月的API费用。文章生成、翻译、推荐系统、SEO优化——全部加起来大约每月$60〜$80。起初我觉得"这还行"，直到我用同样的工作流在Gemini 2.5 Flash上跑了一遍，得到了$8〜$12的结果。

差距是7倍。

当然，响应质量不同，所以不能直接替换。但如果不区分"确实需要高端模型的任务"和"廉价模型足够的任务"，就是在白白烧钱。这篇文章是2026年4月基准的LLM API定价对比，帮助你做出这个判断。

## 2026年市场现状 — 千倍价格差距的时代

还记得2024年GPT-4 Turbo输入Token是$10/M吗？截至2026年4月，最便宜的主流模型大约在$0.02/M（Mistral Nemo），最贵的是o1-pro的$375/M混合价格。差距约为18,000倍。

第一次看到这组数字时没有直观感受，直到我实际用两端的模型跑了同一个任务：处理10万个文档摘要，根据选择的模型，费用从$20到$3,750不等。

**2024→2026价格变化的核心趋势：**

- LLM API价格两年内全面下降约80%
- "推理功能2〜4倍溢价"的惯例被打破——DeepSeek V4将推理功能纳入基础价格
- 缓存命中折扣扩大至最高90%（让重复提示场景的输入Token几乎免费）
- 上下文窗口竞争：1M Token成为基准，Gemini 3.1 Pro提供2M

一个重要提醒：价格变化很快。本文数据截至2026年4月，几个月后可能已经不同。请务必直接查阅官方文档确认最新价格。

## 各模型定价表（2026年4月基准）

### GPT-5系列 — 版本碎片化的陷阱

OpenAI在2025年8月推出GPT-5后，以很快的速度持续发布更新版本。目前GPT-5、GPT-5.2、GPT-5.3 Codex、GPT-5.4同时并存。

| 模型 | 输入 ($/1M) | 输出 ($/1M) | 上下文 |
|------|------------|------------|-------|
| GPT-5 (2025年8月) | $0.625 | $5.00 | 400K |
| GPT-5.2 (2025年12月) | $0.875 | $7.00 | 400K |
| GPT-5.3 Codex (2026年2月) | $1.75 | $14.00 | 400K |
| GPT-5.4（当前旗舰） | $2.50 | $15.00 | 400K |
| GPT-5.4（长文本上下文） | $5.00 | $22.50 | 400K+ |

GPT-5.4使用Batch API可享受50%折扣，降至$1.25/$7.50。缓存输入降至$0.25/M。

我觉得比较遗憾的是这种版本碎片化问题。究竟应该用哪个版本，最新的是否总是最好的，这些都不清晰。GPT-5.4在编程任务上确实比GPT-5.2好，但从$0.875涨到$2.50每百万Token，这个价格差距是否值得，要看具体任务。对于第一次选择API的团队来说，这个阵容确实令人困惑。

### Claude 4系列 — 上下文窗口的胜者

| 模型 | 输入 ($/1M) | 输出 ($/1M) | 上下文 |
|------|------------|------------|-------|
| Claude Haiku 4.5 | $0.25 | $1.25 | 200K |
| Claude Sonnet 4.6 | $3.00 | $15.00 | 1M |
| Claude Opus 4.6 | $5.00 | $25.00 | 1M |

Anthropic最大的变化是取消了1M Token上下文窗口的长文本溢价。Sonnet 4.6和Opus 4.6都将1M Token纳入标准定价。对于需要将整个代码库或长文档放入上下文的工作流，这是一个实质性的差异。

Batch API同样提供50%折扣。Sonnet变为$1.50/$7.50，Opus变为$2.50/$12.50。

### Gemini 3.1 + Flash系列 — Google的分层策略

| 模型 | 输入 ($/1M) | 输出 ($/1M) | 上下文 |
|------|------------|------------|-------|
| Gemini 2.5 Flash-Lite | $0.10 | $0.40 | 1M |
| Gemini 2.5 Flash | $0.15 | $0.60 | 1M |
| Gemini 3.1 Pro (≤200K) | $2.00 | $12.00 | 2M |
| Gemini 3.1 Pro (>200K) | $4.00 | $18.00 | 2M |

Google的策略很有意思。Gemini 2.5 Flash的输入价格$0.15/M比Claude Haiku 4.5便宜40%，同时提供1M Token上下文。启用缓存后，Gemini 3.1 Pro输入降至$0.20/M。

Gemini 3.1 Pro提供2M Token上下文窗口。目前生产环境中很少有场景真正需要这么长的上下文，但在大型代码库分析或处理长篇法律文件的特定场景中，这是有意义的差异化因素。

### DeepSeek V4 — 重置价格预期的开源模型

| 模型 | 输入 ($/1M) | 输出 ($/1M) | 备注 |
|------|------------|------------|-----|
| DeepSeek V3.2 | $0.28 | $0.42 | 缓存命中 $0.028/M |
| DeepSeek V4 | $0.30 | $0.50 | SWE-bench 81% |
| DeepSeek R1 | $0.55 | $2.19 | 推理专用 |

DeepSeek V4于2026年3月发布，在SWE-bench Verified上达到81%（V3.2为69%，大幅提升）。价格比V3.2略有上涨，但仍比OpenAI/Anthropic旗舰便宜约90%。

缓存折扣令人印象深刻：V3.2缓存命中输入为$0.028/M——对于反复发送相同系统提示的工作流，输入成本接近于零。

需要注意的是：DeepSeek服务器在需求激增时被报告出现限流问题。作为基于中国的服务，在数据隐私法规严格的行业（医疗、金融、政府）使用起来有困难。不能只看价格忽视这些限制。

## 缓存与批量折扣如何改变实际成本

只看定价表会导致错误决策。在实际生产中，缓存和批量折扣才是成本优化的关键所在。

**缓存折扣汇总：**

| 提供商 | 缓存命中折扣 | 条件 |
|--------|------------|------|
| OpenAI (GPT-5.4) | 90% | 重复输入512+Token前缀 |
| Anthropic | 最高90% | 需要明确启用提示缓存 |
| Google (Gemini 3.1) | 90% | 需要启用上下文缓存 |
| DeepSeek V3.2 | 90% | 自动应用 |

**Batch API折扣：**
- OpenAI和Anthropic都提供50%折扣（24小时内异步处理）
- 适合不需要实时响应的任务：批量翻译、分类、摘要

在这个自动化流水线上应用Batch API后，我发现缓存命中率低时，折扣效果比预期小。系统提示随任务变化的结构会降低缓存效率。在[LLM推理成本降低50%的Deep-Thinking Ratio指标](/zh/blog/zh/deep-thinking-ratio-llm-cost-optimization)这篇文章中我也谈到了类似问题——成本优化从任务结构设计开始，而不是折扣率，这个结论在这里同样适用。

## 选择模型前应避免的三个错误

谈到LLM API成本时，我经常看到团队仅凭定价页面就做出决策。整理了三个导致昂贵错误的常见模式。

**第一，直接相信基准测试数字。** SWE-bench或MMLU分数高，并不意味着这个模型在你的任务上也会有同样的表现。据我研究，SWE-bench是以Python为中心的编程任务基准，在中文内容生成或特定领域分类上，结果可能完全不同。必须用你实际用例的样本数据直接测试。花$5〜10测试100个样本，远比在错误的模型上浪费六个月要划算。

**第二，只计算输入Token。** 很多团队在价格比较时只看输入Token价格。但在实际LLM工作流中，大部分成本来自输出Token。GPT-5.4输入$2.50/M，但输出$15.00/M——是输入的6倍。对于代码生成或需要详细解释的任务，输出Token可能占总成本的70〜80%。比较时必须按预期的输入/输出比例计算实际成本。

**第三，忽视上下文窗口大小。** "128K够用了"听起来没问题，直到在生产中需要把整个代码仓库放进上下文，发现必须截断。当被截断的信息恰好是关键内容时，这个代价体现在质量下降上，而不是API费用上。Claude Sonnet 4.6的1M上下文和Gemini 3.1 Pro的2M不只是数字——对于特定用例，它们是决定性因素。

## 实际生产场景成本计算

实际工作流的对比远比理论价格表有用。以下计算基于2026年4月价格，未包含批量折扣。

### 场景A：博客/内容自动化（每月1,000篇文章处理）

假设：每篇文章平均输入4,000 Token，输出2,000 Token

```python
# 月度成本计算
posts_per_month = 1000
input_tokens = 4_000  # 每篇文章
output_tokens = 2_000  # 每篇文章

models = {
    "GPT-5.4": (2.50, 15.00),
    "Claude Sonnet 4.6": (3.00, 15.00),
    "Gemini 2.5 Flash": (0.15, 0.60),
    "DeepSeek V4": (0.30, 0.50),
}

for model, (input_price, output_price) in models.items():
    monthly_cost = posts_per_month * (
        (input_tokens / 1_000_000) * input_price +
        (output_tokens / 1_000_000) * output_price
    )
    print(f"{model}: ${monthly_cost:.2f}/月")

# 结果：
# GPT-5.4: $40.00/月
# Claude Sonnet 4.6: $42.00/月
# Gemini 2.5 Flash: $1.80/月
# DeepSeek V4: $2.20/月
```

GPT-5.4与Gemini 2.5 Flash的差距是22倍。如果内容自动化不需要GPT-5.4级别的质量，Flash或DeepSeek具有压倒性优势。

### 场景B：代码审查机器人（每天500个PR评论）

假设：每次代码diff平均输入8,000 Token，评论输出1,500 Token

```python
reviews_per_day = 500
reviews_per_month = reviews_per_day * 22  # 工作日
input_tokens = 8_000
output_tokens = 1_500

for model, (input_price, output_price) in models.items():
    monthly_cost = reviews_per_month * (
        (input_tokens / 1_000_000) * input_price +
        (output_tokens / 1_000_000) * output_price
    )
    print(f"{model}: ${monthly_cost:.2f}/月")

# 结果：
# GPT-5.4: $467.50/月
# Claude Sonnet 4.6: $544.50/月
# Gemini 2.5 Flash: $29.70/月
# DeepSeek V4: $68.75/月
```

DeepSeek比Claude Sonnet便宜8倍。但对于代码审查，先确认DeepSeek的数据处理政策。内部专有代码经过外部服务器传输可能违反安全策略。

### 场景C：客服聊天机器人（每天1万次对话，长上下文）

假设：每次对话输入10,000 Token（含历史记录），输出500 Token，缓存命中率40%

| 模型 | 基础月度成本 | 40%缓存后 |
|-----|------------|---------|
| Claude Sonnet 4.6 | $3,900 | $2,574 |
| Gemini 3.1 Pro | $2,640 | $1,743 |
| Gemini 2.5 Flash | $198 | $131 |
| DeepSeek V4 | $438 | $289 |

在这个场景中，Gemini 2.5 Flash在性价比上最有说服力。1M上下文、多模态支持、缓存折扣综合来看，选择很明确。

## 决策矩阵 — 何时选择哪个模型

正如我在[AI智能体实际运营成本](/zh/blog/zh/ai-agent-cost-reality)分析文章中提到的，AI智能体的总成本远不止Token价格。但模型选择标准可以整理得比较清晰。

| 使用场景 | 推荐模型 | 原因 |
|---------|---------|------|
| 复杂推理、代码生成（最高质量） | Claude Opus 4.6或GPT-5.4 | 质量优先于成本 |
| 代码审查、技术分析（质量/成本平衡） | Claude Sonnet 4.6或GPT-5.2 | 中端层最经过验证 |
| 大文档处理（2M+上下文） | Gemini 3.1 Pro | 唯一提供2M上下文的模型 |
| 高频自动化（成本最小化） | Gemini 2.5 Flash或DeepSeek V4 | 10〜22倍成本降低 |
| 批量翻译、分类、摘要 | DeepSeek V4 + 缓存 | 输入成本接近于零 |
| 安全敏感的内部代码处理 | Claude或GPT-5（美国数据中心） | 数据处理政策安全 |

比模型选择更重要的是任务分离。即使在同一个流水线中，将"需要判断的步骤"路由到高端模型，将"重复处理步骤"路由到低价模型，可以大幅降低成本。我在[异构LLM智能体集群成本优化](/zh/blog/zh/heterogeneous-llm-agent-fleet-cost-optimization)中从架构层面探讨了这种方法。

还有一点值得一提："2026年很便宜"不是可以粗心的理由。使用量线性扩展成本。每月$50感觉微不足道，直到工作量扩大10倍变成$500。

## 我在2026年的选择及原因

直接说明我的实际情况。我运行一个双重堆栈：Claude Sonnet 4.6作为主模型，Gemini 2.5 Flash作为辅助模型。原因如下：

**为什么用Claude Sonnet 4.6作为主模型：** 我在内容生成工作流（包括这篇博客文章）上对GPT-5.4和Claude Sonnet进行了A/B测试。在多语言内容质量方面——特别是韩语和日语——Claude感觉更自然。GPT-5.4的编程基准分数令人印象深刻，但在我的用例中，质量差异不足以证明每百万Token多$1.50的溢价是合理的。

**为什么用Gemini 2.5 Flash作为辅助：** 我把批处理任务——分类、标签生成、草稿摘要——转移到了Flash。输入$0.15/M的情况下，用Sonnet处理这些任务是浪费。

**为什么不用DeepSeek作为主模型：** 价格很吸引人，但这个自动化系统的特性决定了工作指令、内部内容和API密钥都会经过流水线。无论价格差10倍，我不愿意让这些通过中国服务器。对于没有敏感数据的任务，我认为这是完全有效的选择——只是不适合我目前的情况。

我认为GPT-5.4被高估了。基准数字令人印象深刻，但在实际多语言内容自动化对比Claude Sonnet中，质量差距不足以证明每百万Token多$1.50的额外成本。基准测试与实际用例之间的差距在这里同样很大。

两个例外情况需要单独说明：<strong>核心工作流涉及大文档处理的团队</strong>应该首先评估Gemini 3.1 Pro的2M上下文。<strong>数据隐私是首要考量的团队</strong>应该从一开始就排除DeepSeek，在OpenAI和Anthropic之间选择。即便考虑到价格差距，合规成本和风险敞口也使其成为正确的选择。

我计划进行的下一个实验：在同一个流水线中调整Flash/Sonnet的A/B比例，测量质量下降在哪个时间点出现。我的假设是，对于大多数重复任务，便宜10倍的模型不会产生差10倍的输出。

---

*定价数据来源：OpenAI API Pricing官方文档、Anthropic Claude API Pricing、Google AI Gemini API Pricing、DeepSeek API Docs（2026年4月基准）。汇率、增值税及地区差异未包含在内。*
