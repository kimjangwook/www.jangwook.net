---
title: 'DeNA LLM 学习 Part 1: LLM基础与2025年AI现状'
description: >-
  DeNA LLM学习系列开始。比较GPT-4、Claude、Gemini，涵盖Next Token Prediction、Instruction
  Tuning、Reasoning模型、提示工程基础。
pubDate: '2025-12-08'
heroImage: ../../../assets/blog/dena-llm-study-part1-fundamentals-hero.jpg
tags:
  - llm
  - ai
  - prompt-engineering
relatedPosts:
  - slug: dena-llm-study-part4-rag
    score: 0.9
    reason:
      ko: LLM 주제를 한 단계 더 깊이 파고드는 글입니다.
      en: Goes one level deeper into LLM.
      ja: LLMをもう一歩深く掘り下げた記事です。
      zh: 更深入地探讨 LLM 主题。
  - slug: dena-llm-study-part3-model-training
    score: 0.85
    reason:
      ko: LLM를 실제로 다뤄본 경험이 이어지는 글입니다.
      en: Continues the hands-on LLM experience.
      ja: LLMを実際に扱った経験が続く記事です。
      zh: 延续 LLM 的实战经验。
  - slug: individual-developer-ai-saas-journey
    score: 0.8
    reason:
      ko: 같은 AI 흐름에서 함께 읽으면 좋습니다.
      en: Worth reading alongside this in the same AI track.
      ja: 同じAIの流れで併せて読むと役立ちます。
      zh: 在同一 AI 脉络中可一并阅读。
faq:
  - question: "LLM 是按 token 而非单词运作的，那中文之类的语言会怎么处理？"
    answer: "LLM 按 token 而非单词运作。英文一个单词大约对应一个 token，而韩文一个单词大约对应 2〜3 个 token。token 数量直接影响成本和上下文上限，因此在优化用量时需要纳入考虑。"
  - question: "CoT 提示能把准确率提升多少？"
    answer: "即便不是推理专用模型，只要加一行让它分步计算的 CoT 提示，正答率也会明显提高。按本文示例，准确率从 Zero-shot 约 60 个百分点提升到 Few-shot 约 80 个百分点，再到 Chain of Thought 约 90 个百分点。"
  - question: "RLHF 和 DPO 有什么区别？"
    answer: "RLHF 旨在对齐人类偏好，需要数千到数万条数据，成本较高。DPO 是 Stanford 在 2023 年提出的方法，直接优化偏好，比 RLHF 更简单且更有效，数据需求约为数千条，成本居中。"
  - question: "代码审查或数据分析该用哪个模型和 Temperature？"
    answer: "按本文实战场景表，代码审查建议用 Claude Sonnet 4 配 temperature 0.3，数据分析用 Claude Sonnet 4 配 temperature 0.1。输出越需要确定且一致，Temperature 就设得越低。"
---

> <strong>系列: DeNA LLM 学习</strong> (1/5)
>
> 1. <strong>[Part 1: LLM基础与2025年AI现状](/zh/blog/zh/dena-llm-study-part1-fundamentals)</strong> ← 当前文章
> 2. Part 2: 结构化输出与多LLM管道
> 3. [Part 3: 模型训练方法论](/zh/blog/zh/dena-llm-study-part3-model-training)
> 4. [Part 4: RAG架构与最新趋势](/zh/blog/zh/dena-llm-study-part4-rag)
> 5. [Part 5: 智能体设计与多智能体编排](/zh/blog/zh/dena-llm-study-part5-agent-design)

## GPT、Claude、Gemini交织的2025年AI格局

一年前的LLM版图，和今天已经完全是两回事。整理DeNA内部学习资料时，我又一次有了这种感受。这个系列以那份资料为底子，分五期把LLM从基础原理一路讲到实战应用。第一期，也就是这篇，先从LLM到底是怎么运作的讲起，再看看截至2025年底主要模型各自站在什么位置。

> <strong>资料来源</strong>: 本文基于[DeNA 内部学习资料](https://dena.github.io/llm-study20251201/)编写。

## 2025年主要LLM现状

### 性能比较: GPT-4 vs Claude vs Gemini

2025年的市场由三大家族主导。把各家的旗舰阵容摆在一起对比，大致是这样。

```markdown
| 模型                                     | 开发商    | 特点       | 优势                       |
| ---------------------------------------- | --------- | ---------- | -------------------------- |
| <strong>GPT-5.1 / GPT-4o</strong>        | OpenAI    | 128K上下文 | 通用性、稳定性             |
| <strong>Claude Opus 4 / Sonnet 4</strong>| Anthropic | 200K上下文 | 编码、分析、长上下文       |
| <strong>Gemini-2.5-Pro</strong>          | Google    | 1M上下文   | 多模态、超长文档           |
| <strong>DeepSeek-R1</strong>             | DeepSeek  | 128K上下文 | 推理、开源、性价比高       |
```

### 基准测试性能 (2025年12月标准)

```mermaid
graph LR
    A[LLM基准测试] --> B[MMLU]
    A --> C[HumanEval]
    A --> D[MATH]

    B --> B1["Claude Opus 4: 91.2%"]
    B --> B2["GPT-4o: 89.1%"]
    B --> B3["Gemini-2.5-Pro: 88.5%"]

    C --> C1["Claude Sonnet 4: 94.5%"]
    C --> C2["GPT-4o: 91.2%"]
    C --> C3["DeepSeek-R1: 90.8%"]

    D --> D1["o1/o3: 96.4%"]
    D --> D2["DeepSeek-R1: 94.8%"]
    D --> D3["Claude Opus 4: 88.5%"]
```

> <strong>MMLU</strong>: 大规模多任务语言理解 (57个学科知识评估)
> <strong>HumanEval</strong>: 编程能力评估
> <strong>MATH</strong>: 数学问题解决能力

### 价格比较 (2025年12月标准)

```mermaid
graph TD
    subgraph Input["输入令牌成本 (per 1M tokens)"]
        I1["GPT-4o: $2.50"]
        I2["Claude Sonnet 4: $3"]
        I3["Gemini-2.5-Pro: $1.25"]
        I4["DeepSeek-R1: $0.55"]
        I1 ~~~ I2 ~~~ I3 ~~~ I4
    end

    subgraph Output["输出令牌成本 (per 1M tokens)"]
        O1["GPT-4o: $10"]
        O2["Claude Sonnet 4: $15"]
        O3["Gemini-2.5-Pro: $5"]
        O4["DeepSeek-R1: $2.19"]
        O1 ~~~ O2 ~~~ O3 ~~~ O4
    end

    Input ~~~ Output
```

> <strong>核心洞察</strong>: DeepSeek-R1性价比出色，Gemini也具有强大的价格竞争力。Claude在编码和分析任务中表现优异。

## Next Token Prediction: LLM的核心原理

### Transformer架构

作为LLM基础的Transformer，最初在2017年Google的"Attention is All You Need"论文中提出。

```mermaid
graph TD
    A[输入文本] --> B[分词Tokenization]
    B --> C[嵌入Embedding]
    C --> D[自注意力Self-Attention]
    D --> E[前馈网络Feed Forward]
    E --> F[下一个令牌预测]
    F --> G[输出文本]

    D -.-> D1["Query, Key, Value"]
    E -.-> E1["层归一化"]
    F -.-> F2["Softmax概率分布"]
```

### Next Token Prediction 工作原理

```python
# 简单的Next Token Prediction示例
def predict_next_token(context: str, model: LLM) -> str:
    """
    从给定上下文预测下一个令牌

    Args:
        context: "The quick brown"
        model: LLM模型

    Returns:
        "fox" (概率最高的令牌)
    """
    # 1. 分词
    tokens = tokenize(context)  # ["The", "quick", "brown"]

    # 2. 嵌入转换
    embeddings = model.embed(tokens)

    # 3. 通过Transformer层
    hidden_states = model.forward(embeddings)

    # 4. 计算概率分布
    logits = model.lm_head(hidden_states[-1])  # 最后一个令牌的hidden state
    probs = softmax(logits)

    # 5. 选择概率最高的令牌
    next_token = argmax(probs)  # "fox" (prob: 0.87)

    return next_token
```

> <strong>重要</strong>: LLM是基于<strong>令牌</strong>而非单词工作的。英语: 1个单词 ≈ 1个令牌，中文: 1个字 ≈ 1〜2个令牌。

### 最新研究趋势: Mixture of Experts (MoE)

进入2024年后，多数大型模型都转向了MoE架构。它的思路其实很简单。

```mermaid
graph TD
    A[输入] --> B[路由器Router]
    B --> C1[专家1<br/>编码]
    B --> C2[专家2<br/>数学]
    B --> C3[专家3<br/>语言]
    B --> C4[专家4<br/>常识]

    C1 --> D[输出整合]
    C2 --> D
    C3 --> D
    C4 --> D
```

<strong>优势</strong>:

- 计算效率: 仅激活全部参数的一部分
- 专业化: 每个专家专注于特定领域
- 可扩展性: 添加专家可提升性能

## Instruction Tuning: 让AI听从指令

### Pre-training vs Fine-tuning vs RLHF

```mermaid
graph TD
    A[1. 预训练Pre-training] --> B[2. 监督微调<br/>SFT]
    B --> C[3. RLHF]
    C --> D[生产模型]

    A -.-> A1["大规模文本数据<br/>(数万亿令牌)"]
    B -.-> B1["高质量指令-响应对<br/>(数万到数十万个)"]
    C -.-> C1["基于人类反馈<br/>奖励模型训练"]
```

### Instruction Tuning 数据集示例

```yaml
# SFT (Supervised Fine-Tuning) 数据格式
- instruction: "解析此JSON并提取名称。"
  input: '{"user": {"name": "John", "age": 30}}'
  output: "John"

- instruction: "修复此代码中的bug。"
  input: |
    def add(a, b):
        return a - b
  output: |
    def add(a, b):
        return a + b  # 使用+而非-

- instruction: "将此句子翻译成中文。"
  input: "Hello, world!"
  output: "你好，世界!"
```

### Post-training 技术比较

| 技术                               | 目的             | 数据需求     | 成本 |
| ---------------------------------- | ---------------- | ------------ | ---- |
| <strong>SFT</strong>               | 学习遵循指令     | 数万个       | 低   |
| <strong>RLHF</strong>              | 与人类偏好对齐   | 数千到数万个 | 高   |
| <strong>DPO</strong>               | 直接偏好优化     | 数千个       | 中等 |
| <strong>Constitutional AI</strong> | 价值观对齐自动化 | 极少         | 低   |

> <strong>DPO (Direct Preference Optimization)</strong>: 2023年由Stanford提出，比RLHF更简单且有效。

## Reasoning 模型: 会思考的AI

### o1、o3与DeepSeek-R1的发展

OpenAI在2024年9月发布了o1推理模型。2024年12月，o3模型紧随其后。紧接着，DeepSeek又把局面搅动了一次，开源了推理模型DeepSeek-R1。

```mermaid
graph TD
    A[用户提问] --> B[内部推理过程<br/>Chain of Thought]
    B --> C[中间步骤1]
    C --> D[中间步骤2]
    D --> E[中间步骤3]
    E --> F[最终答案]

    B -.-> B1["需要数秒至数分钟"]
    C -.-> C1["假设形成"]
    D -.-> D1["验证"]
    E -.-> E1["得出结论"]
```

### 推理模型性能比较

```markdown
| 基准测试                                  | GPT-4o          | o1              | o3              |
| ----------------------------------------- | --------------- | --------------- | --------------- |
| <strong>AIME 2024</strong> (数学奥林匹克) | 13.4%           | 74.4%           | 96.7%           |
| <strong>Codeforces</strong> (编程竞赛)    | 11th percentile | 89th percentile | 99th percentile |
| <strong>GPQA Diamond</strong> (科学)      | 50.6%           | 78.3%           | 87.7%           |
```

> <strong>注</strong>: DeepSeek-R1以更低的成本实现了与o1相当的性能，为AI民主化做出了贡献。

### Chain of Thought (CoT) 提示

哪怕不是推理专用模型，只要加上一句CoT，准确率也会明显上一个台阶。

```markdown
# ❌ 普通提示

"计算234 × 567。"
→ 错误答案的可能性高

# ✅ CoT 提示

"逐步计算234 × 567。显示每一步的中间结果。"
→ 准确度大幅提升
```

<strong>实际CoT示例</strong>:

```
问题: 计算234 × 567。

CoT 响应:
1. 首先，将234分解为200 + 30 + 4。
2. 分别乘以567:
   - 200 × 567 = 113,400
   - 30 × 567 = 17,010
   - 4 × 567 = 2,268
3. 全部相加:
   113,400 + 17,010 + 2,268 = 132,678

答案: 132,678
```

## 提示工程基础

### Zero-shot vs Few-shot vs Chain of Thought

```mermaid
graph TD
    A[提示策略] --> B[Zero-shot]
    A --> C[Few-shot]
    A --> D[Chain of Thought]

    B --> B1["仅提供指令<br/>'分析情感'"]
    C --> C1["提供示例<br/>'正面: 喜欢<br/>负面: 讨厌'"]
    D --> D1["引导思考过程<br/>'逐步分析'"]

    B1 -.-> B2["准确度: 60%"]
    C1 -.-> C2["准确度: 80%"]
    D1 -.-> D2["准确度: 90%"]
```

### Temperature 参数的影响

```python
# Temperature设置对输出的影响

# Temperature = 0 (确定性、一致性)
response = model.generate(
    "用Python编写斐波那契数列。",
    temperature=0
)
# 输出: 始终相同的代码 (选择概率最高的令牌)

# Temperature = 0.7 (平衡、推荐)
response = model.generate(
    "写一个创意故事。",
    temperature=0.7
)
# 输出: 适度多样化同时保持一致性

# Temperature = 1.5 (创造性、不稳定)
response = model.generate(
    "提出一个全新的想法。",
    temperature=1.5
)
# 输出: 非常多样但一致性低，有时输出奇怪
```

### 有效提示编写原则

1. <strong>清晰性</strong>: 避免模糊指令

   ```
   ❌ "告诉我这个"
   ✅ "用150字以内解释Claude 3.5 Sonnet的三个主要特点。"
   ```

2. <strong>提供上下文</strong>: 包含背景信息

   ```
   ❌ "审查代码"
   ✅ "这是一个React组件。从性能、可读性和可访问性角度审查: [代码]"
   ```

3. <strong>指定输出格式</strong>: 明确期望的结构
   ```
   ✅ "以以下格式响应:
   1. 摘要 (1句话)
   2. 要点 (3个)
   3. 行动计划 (逐步)"
   ```

## 练习 A 洞察: OpenAI API 实战

### API基本使用

```python
from openai import OpenAI

client = OpenAI(api_key="your-api-key")

# 基本聊天补全
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {"role": "system", "content": "你是一个有帮助的AI助手。"},
        {"role": "user", "content": "什么是LLM?"}
    ],
    temperature=0.7,
    max_tokens=500
)

print(response.choices[0].message.content)
```

### 对话历史管理

```python
# 维护对话上下文
conversation_history = [
    {"role": "system", "content": "你是Python专家。"}
]

def chat(user_message: str) -> str:
    # 添加用户消息
    conversation_history.append({"role": "user", "content": user_message})

    # API调用
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=conversation_history,
        temperature=0.7
    )

    # 保存助手响应
    assistant_message = response.choices[0].message.content
    conversation_history.append({"role": "assistant", "content": assistant_message})

    return assistant_message

# 对话示例
print(chat("解释列表推导式。"))
print(chat("显示示例代码。"))  # 保持之前的上下文
print(chat("将其转换为字典推导式。"))  # 连续对话
```

### 令牌使用优化

```python
import tiktoken

def count_tokens(text: str, model: str = "gpt-4") -> int:
    """计算文本的令牌数"""
    encoding = tiktoken.encoding_for_model(model)
    return len(encoding.encode(text))

# 提示优化示例
long_prompt = "这是一个非常长的提示..." * 100
token_count = count_tokens(long_prompt)
print(f"令牌数: {token_count}")  # 例: 8,543 tokens

# 成本计算
input_cost = (token_count / 1_000_000) * 10  # GPT-4 Turbo 输入成本
print(f"预估成本: ${input_cost:.4f}")
```

## 主要学习要点

### 1. 模型选择标准

```mermaid
graph TD
    A[任务类型] --> B{要做什么?}
    B --> C[编码/分析]
    B --> D[通用对话]
    B --> E[超长文档处理]
    B --> F[成本优化]

    C --> C1["Claude Sonnet 4"]
    D --> D1["GPT-4o"]
    E --> E1["Gemini-2.5-Pro"]
    F --> F1["GPT-4o-mini or<br/>Gemini-2.5-Flash"]
```

### 2. 性能提升检查清单

- ✅ <strong>清晰指令</strong>: 消除歧义
- ✅ <strong>Few-shot示例</strong>: 提供3〜5个例子
- ✅ <strong>CoT提示</strong>: 用于复杂推理任务
- ✅ <strong>Temperature调整</strong>: 根据任务设置
- ✅ <strong>指定输出格式</strong>: 结构化响应
- ✅ <strong>上下文管理</strong>: 考虑令牌限制

### 3. 实际应用场景

| 场景               | 推荐模型          | 设置     |
| ------------------ | ----------------- | -------- |
| 代码审查           | Claude Sonnet 4   | temp=0.3 |
| 创意写作           | GPT-4o            | temp=0.9 |
| 数据分析           | Claude Sonnet 4   | temp=0.1 |
| 客户支持聊天机器人 | GPT-4o-mini       | temp=0.7 |
| 长文档摘要         | Gemini-2.5-Pro    | temp=0.5 |

## 下期预告

Part 2将涵盖<strong>结构化输出与多LLM管道</strong>:

- JSON模式与函数调用
- 结构化输出的实际应用
- 多LLM管道设计
- 使用Pydantic实现类型安全
- 练习 B: 构建复杂的数据提取系统

> <strong>下一篇文章</strong>: Part 2: 结构化输出与多LLM管道

## 参考资料

- [DeNA LLM 学习资料 (Zenn)](https://dena.github.io/llm-study20251201/)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Anthropic Claude Documentation](https://docs.anthropic.com/claude/docs)
- [Google Gemini Documentation](https://ai.google.dev/docs)
- [Attention is All You Need (Transformer论文)](https://arxiv.org/abs/1706.03762)
- [Chain of Thought Prompting](https://arxiv.org/abs/2201.11903)

---

<strong>撰写日期</strong>: 2025年12月8日
<strong>系列</strong>: DeNA LLM 学习 (1/5)
<strong>标签</strong>: #LLM #AI #PromptEngineering #DeNA
