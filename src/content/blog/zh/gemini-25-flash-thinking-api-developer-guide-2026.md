---
draft: true
title: 'Gemini 2.5 Flash Thinking API 实战指南 — thinking_budget亲测结论'
description: '我用 Budget=0/1024/8000 三种配置，在简单任务、数学推理、代码审查三类场景下亲测了 Gemini 2.5 Flash Thinking API。简单任务速度慢 5 倍毫无收益，数学推理反而减少了输出 token。分享按任务类型选择最优 budget 的决策框架。'
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

我原本以为开启 Thinking 功能必然让模型更聪明。亲测之后，发现这只说对了一半。

我将 Gemini 2.5 Flash 的 `thinking_budget` 参数分别设为 0、1024、8000，在简单任务、数学推理、代码审查三个场景逐一测试，同时测量响应时间、输出 token 数和 thinking token 数。数字讲的故事比我预期的更微妙。

## Thinking API 究竟做了什么

`thinking_budget` 限制模型在给出回答前能花多少 token 进行"内部推理"。Budget=0 完全禁用 thinking。Budget=-1 让模型自行决定推理深度。正整数设置上限（最大 24576）。

有一点很重要：thinking token 不会出现在响应中，但**收费标准与输出 token 完全相同**。正如[LLM API 定价比较文章](/zh/blog/zh/llm-api-pricing-comparison-2026-gpt5-claude-gemini-deepseek)所示，Gemini 2.5 Flash 输出 token 为 $0.0035/1K。使用 1024 个 thinking token，就要额外付这部分费用。

另一个实用提示：旧版 `google.generativeai` 包已弃用，必须使用新版 `google-genai` 包。

```python
# ❌ 已弃用（不再更新）
import google.generativeai as genai

# ✅ 当前标准
from google import genai
from google.genai import types

client = genai.Client(api_key="YOUR_API_KEY")

response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="你的问题",
    config=types.GenerateContentConfig(
        thinking_config=types.ThinkingConfig(
            thinking_budget=1024,
            include_thoughts=True,  # 在响应中展示推理过程
        ),
    ),
)

# 从响应中分离思考过程和实际答案
for part in response.candidates[0].content.parts:
    if part.thought:
        print(f"[Thinking] {part.text[:100]}...")
    else:
        print(f"[Answer] {part.text}")
```

设置 `include_thoughts=True` 可以将模型的内部推理过程作为独立的响应部分查看，便于调试。生产环境中保持 `False` 即可。

## 实验方法与测量指标

我创建了一个全新的沙盒目录，只安装 `google-genai`，然后对三类提示词分别应用 Budget=0/1024/8000。

测量指标：
- **响应时间（秒）**：wall clock time
- **输出 token**：实际回答的 token 数
- **thinking token**：内部推理消耗的 token 数（`usage_metadata.thoughts_token_count`）

三类提示词：
1. **简单任务**："用一句话说明 Python 中如何对列表排序"
2. **数学推理**：找出满足三个条件的所有两位正整数
3. **代码审查**：在简单 Python 函数中找出 bug 和改进点

## 实验结果：数字说明一切

以下是实际测量值，原样呈现，未作修饰。

| 任务类型 | Budget=0 | Budget=1024 | Budget=8000 |
|---------|----------|-------------|-------------|
| 简单任务 | 1.4秒 / 输出54tok | 6.8秒 / 输出61tok / thinking 751tok | 9.0秒 / 输出45tok / thinking 1282tok |
| 数学推理 | 8.8秒 / 输出2143tok | 15.1秒 / 输出1915tok / thinking 918tok | 26.2秒 / 输出1671tok / thinking 4036tok |
| 代码审查 | 6.7秒 / 输出1367tok | 13.1秒 / 输出1126tok / thinking 734tok | 22.6秒 / 输出2055tok / thinking 1824tok |

**简单任务**：Budget=0 时 1.4 秒，Budget=1024 时 6.8 秒，慢了近 5 倍。回答质量几乎没有差别。Budget=8000 消耗 1282 个 thinking token，输出反而只剩 45 token。纯属浪费。

**数学推理**：这里出现了意外结果。Budget=0 时输出高达 2143 token。模型在"大声思考"，把所有解题步骤全部写在输出里。Budget=1024 时，内部推理用了 918 token，输出降至 1915 token，总 token 消耗相近，但答案结构更清晰。Budget=8000 把推理加深到 4036 token，输出缩减至 1671 token。

**代码审查**：Budget=1024 让输出从 1367 降至 1126 token，答案更有针对性。Budget=8000 扩展到 2055 token，分析更全面，但速度慢 3 倍。哪种更好取决于具体需求。

## 按任务类型选择最优 Budget

基于实验，我整理了实用决策框架。不是万能公式，但作为起点有效。

**Budget=0（禁用 thinking）**适用于：
- 分类、打标签、标注任务
- 摘要、翻译、格式转换
- 简单问答、事实查询
- 高频批处理（成本敏感）

简单任务在 Budget=0 下只需 1.4 秒。给它 1024 budget 意味着等待 6.8 秒并支付额外费用。没有任何收益，纯粹是浪费。

**Budget=1024〜2048（中等 thinking）**适用于：
- 需要集中分析的代码审查、bug 定位
- 中等复杂度推理
- 需要多步判断但对延迟敏感的场景

说实话，代码审查在 Budget=1024 下的答案比 Budget=0 更短，但感觉更好。不必要的冗余消失了，只留下核心内容。

**Budget=4000〜8000（深度 thinking）**适用于：
- 复杂数学、算法设计
- 全面架构审查
- 多步骤规划
- 精度远比速度重要的任务

Budget=8000 数学问题消耗了 4036 个 thinking token，耗时 26 秒。这种延迟在任何交互式应用中都无法接受。仅用于离线批处理或后台异步分析。

[Gemini 2.5 Flash 成本优化指南](/zh/blog/zh/gemini-25-flash-api-cost-optimization-guide)也提到：thinking token 与输出 token 定价相同。盲目使用 Budget=8000 会让成本翻倍。

## 生产代码：tracking thinking 使用量

以下是我在生产环境中追踪 thinking token 消耗的模式。

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
    """在追踪 thinking 使用量的同时生成响应。"""
    start = time.perf_counter()
    
    config = types.GenerateContentConfig(
        thinking_config=types.ThinkingConfig(
            thinking_budget=budget,
            include_thoughts=False,  # 生产环境设为 False
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

# 使用示例
client = genai.Client(api_key="YOUR_API_KEY")

result = generate_with_thinking(
    client,
    "找出这段代码中的潜在内存泄漏：...",
    budget=2048,
)

print(f"延迟：{result['latency_s']}秒")
print(f"Thinking token：{result['thinking_tokens']}")
print(f"总计费 token：{result['total_tokens']}")
```

`usage_metadata.thoughts_token_count` 有时返回 0——当 budget=0 或模型判断无需 thinking 时。将此指标纳入监控，可以了解 thinking 实际触发的频率。

## Thinking API 的不足之处

我想直接说说令人沮丧的部分。

**动态模式（Budget=-1）不可预测。**让模型自行决定 budget 看起来很方便，但它可能对简单任务也触发 thinking。在我的简单任务实验中，Budget=-1 耗时与 Budget=1024 相近（约 6.8 秒）。如果无法预测延迟和成本，就无法在生产中进行预算规划。

**thinking_budget 和 thinking_level 不能同时设置。**Gemini 3.x 使用 `thinking_level`，2.5 系列使用 `thinking_budget`。同一个调用中混用会得到 400 错误。这在文档中有说明，但错误信息不够直观，第一次遇到容易困惑。

**Thinking token 不受上下文缓存影响。**即使用 Context Caching 降低了长系统提示的成本，thinking token 每次仍单独计费。正如[AI 智能体成本现实分析](/zh/blog/zh/ai-agent-cost-reality)所述，在智能体循环中 thinking 成本会比预期累积得更快。

## 我的最终立场

Thinking API 并非被过度炒作，但"开启就好"的直觉也是错误的。

我的结论很简单：**以 Budget=0 为默认，只在任务真正需要多步推理时才明确启用 Budget=1024〜2048。** Budget=8000 只用于批处理作业或精度至关重要的离线分析。

生产中跳过动态模式（Budget=-1）。可预测性比便利性更重要。

让我印象最深的反直觉发现：对于复杂数学问题，禁用 thinking 导致模型"大声思考"，输出了 2143 个 token。启用 Budget=1024 后，推理转入内部，输出降至 1915 token。总成本差异比想象中小。是否划算取决于任务本身。

## 小结

如果没有亲测，我可能会默认"thinking 越多越好"。测量结果说明了不同的故事。

Gemini 2.5 Flash Thinking API 用对地方是强大的工具。对复杂推理任务，它能通过内化思考减少输出 token，这个反直觉效果是真实存在的。但对简单任务盲目应用只会浪费金钱和时间。

设置 `thinking_budget` 前，先问自己一个问题：**这个任务真的需要深度推理吗？**大多数情况下，答案是否定的。

---

*本文所有代码均可通过文中提供的代码片段重现。基于 google-genai 包 0.8.x 版本编写。*
