---
title: 'DeNA LLM研究Part 3: 模型训练方法论 - 从预训练到RLHF/DPO'
description: 基于DeNA LLM研究资料Part 3，深入分析预训练、微调和强化学习的差异，以及LoRA、QLoRA、DPO等最新高效学习技术。
pubDate: '2025-12-10'
heroImage: ../../../assets/blog/dena-llm-study-part3-model-training-hero.jpg
tags:
  - LLM
  - 微调
  - 强化学习
relatedPosts:
  - slug: dena-llm-study-part1-fundamentals
    score: 0.9
    reason:
      ko: LLM 주제를 한 단계 더 깊이 파고드는 글입니다.
      en: Goes one level deeper into LLM.
      ja: LLMをもう一歩深く掘り下げた記事です。
      zh: 更深入地探讨 LLM 主题。
  - slug: dena-llm-study-part4-rag
    score: 0.85
    reason:
      ko: LLM를 실제로 다뤄본 경험이 이어지는 글입니다.
      en: Continues the hands-on LLM experience.
      ja: LLMを実際に扱った経験が続く記事です。
      zh: 延续 LLM 的实战经验。
  - slug: effiflow-automation-analysis-part1
    score: 0.8
    reason:
      ko: 같은 LLM 흐름에서 함께 읽으면 좋습니다.
      en: Worth reading alongside this in the same LLM track.
      ja: 同じLLMの流れで併せて読むと役立ちます。
      zh: 在同一 LLM 脉络中可一并阅读。
faq:
  - question: "开始微调前应该首先尝试什么？"
    answer: "本文建议先尝试提示词优化。约80%的任务仅靠提示词即可解决，只有在仍不足时才进一步考虑LoRA微调。"
  - question: "使用QLoRA用什么样的GPU能训练7B模型？"
    answer: "根据本文，QLoRA通过4bit量化大幅降低显存占用，可在24GB显存的RTX 3090或RTX 4090单卡上微调7B模型。不过由于量化开销，训练速度比全量微调慢约1.5至2倍。"
  - question: "DPO相比RLHF有哪些优势？"
    answer: "本文说明DPO无需单独的奖励模型，一次训练即可对齐人类偏好。它采用比PPO更稳定的分类损失，在显存和时间上节省约50%，同时性能与RLHF相当或更优。"
  - question: "LoRA的rank(r)值通常设置为多少？"
    answer: "本文的超参数指南将r设置在4至16之间，多数情况下8较为合适。lora_alpha通常取r的1至2倍，target_modules中注意力机制的q_proj和v_proj最为有效。"
---

> <strong>系列: DeNA LLM 研究</strong> (3/5)
>
> 1. [Part 1: LLM基础与2025年AI现状](/zh/blog/zh/dena-llm-study-part1-fundamentals)
> 2. Part 2: 结构化输出与多LLM管道
> 3. <strong>Part 3: 模型训练方法论</strong> ← 当前文章
> 4. [Part 4: RAG架构与最新趋势](/zh/blog/zh/dena-llm-study-part4-rag)
> 5. [Part 5: 智能体设计与多智能体编排](/zh/blog/zh/dena-llm-study-part5-agent-design)

## 微调，到底该从哪儿下手?

"想拿自家数据把模型训练一下，可是第一步该做什么?"这是我在实务里被问得最多的问题。预训练?微调?强化学习?术语一大堆，可究竟哪个适合自己的场景，却始终看不清。

DeNA的LLM研究资料Part 3，恰好戳中了这个痛点。它先讲清三种训练方式的区别，再深入到LoRA、QLoRA、DPO这些高效方法的原理和实战用法。我又在此基础上补了2025年当下的趋势，以及自己亲手跑过之后的一些体会。

这是系列的中间一篇。如果想先弄清模型本身怎么运作，可以从[Part 1: LLM基础](/zh/blog/zh/dena-llm-study-part1-fundamentals)读起；如果更关心不靠训练、而是接入外部知识的方向，[Part 4: RAG架构](/zh/blog/zh/dena-llm-study-part4-rag)正好接上这条脉络。

## 什么时候这些内容有用，什么时候可以跳过

微调、RLHF、LoRA都是相当有深度的话题，并非人人都需要。动手之前，先确认一下自己的情况落在哪一类，能省不少时间。

<strong>这些内容有用的情况</strong>

- 你在自有基础设施上运行(或计划运行)开源模型(Llama、Qwen、Gemma等)。
- 仅靠提示词和few-shot示例，无法稳定地得到所需的输出格式或领域词汇。
- 你想用内部文档、日志、客服记录这类不便发往外部API的数据来改变模型行为。
- 出于推理成本或延迟的考虑，需要把小模型在特定任务上拉到可用水平。
- 你想用数据来对齐(alignment)模型的"口味"：语气、安全性、拒答方式。

<strong>可以跳过的情况</strong>

- 你直接使用GPT、Claude、Gemini之类的商用API，且短期内打算继续这样。这时，提示词设计和RAG几乎总是排在微调之前。
- 任务属于分类、抽取、摘要这类，几行提示词就能解决。
- 训练数据不足几百条。在这个规模下，few-shot往往比微调更稳定。
- 没有GPU预算，也没有运维人手。LoRA降低了门槛，但门槛并不为零。

一句话总结：先问<strong>"外部API够不够用?"</strong>，只有当答案是"不够"时，本文的正文才真正派上用场。反过来，如果你确实得自己跑模型，下面的内容能把成本压低一个数量级。

## 预训练 vs 微调 vs 强化学习

### 厨师这个比喻，意外地贴切

DeNA资料把三种学习方式比作经营一家餐厅。起初我以为有点牵强。读下去才发现，每个阶段的角色一下子就清晰了。

```mermaid
graph TD
    A[预训练<br/>Pre-training] --> B[微调<br/>Fine-tuning]
    B --> C[强化学习<br/>RLHF/DPO]

    A1[厨师基础训练<br/>学习所有菜系] --> A
    B1[特定餐厅<br/>菜单专精] --> B
    C1[客户反馈<br/>改进口味] --> C
```

<strong>预训练 (Pre-training)</strong>

- <strong>目的</strong>: 获得通用语言理解能力
- <strong>数据</strong>: 数十至数百TB的网络数据
- <strong>成本</strong>: 数亿至数千亿元 (GPT-4估计超1000亿元)
- <strong>比喻</strong>: 在烹饪学校学习所有烹饪技法的过程

<strong>微调 (Fine-tuning)</strong>

- <strong>目的</strong>: 专门化特定任务/领域
- <strong>数据</strong>: 数千至数万个任务特定数据
- <strong>成本</strong>: 数十万至数百万元
- <strong>比喻</strong>: 成为意大利餐厅意大利面专家的过程

<strong>强化学习 (Reinforcement Learning)</strong>

- <strong>目的</strong>: 生成符合人类偏好的响应
- <strong>数据</strong>: 数千至数万个偏好数据
- <strong>成本</strong>: 数百万至数千万元
- <strong>比喻</strong>: 根据客户反馈调整菜品口味的过程

### 实务决策指南

```mermaid
graph TD
    Start[需要LLM训练?] --> Q1{需要新知识?}
    Q1 -->|是| PreTrain[预训练<br/>成本: 非常高]
    Q1 -->|否| Q2{需要任务专精?}
    Q2 -->|是| FineTune[微调<br/>成本: 中等]
    Q2 -->|否| Q3{需要偏好调整?}
    Q3 -->|是| RL[强化学习<br/>成本: 中等]
    Q3 -->|否| Prompt[提示工程<br/>成本: 低]
```

<strong>决策检查清单</strong>:

1. <strong>能用提示解决吗?</strong> → 首先尝试提示优化
2. <strong>现有模型理解任务吗?</strong> → 是: 强化学习，否: 微调
3. <strong>是全新领域吗?</strong> → 考虑预训练 (但注意成本)

## PEFT: 高效微调的兴起

### 传统微调的问题

更新所有参数的Full Fine-tuning的局限性:

- <strong>内存使用</strong>: 微调7B模型需要80GB+ VRAM
- <strong>时间成本</strong>: 需要数小时至数天
- <strong>部署困难</strong>: 每个任务需要存储整个模型 (数十GB)

### PEFT的核心理念

参数高效微调(PEFT)通过<strong>仅训练部分参数</strong>来最大化效率:

```mermaid
graph TD
    subgraph 传统微调
        A[原始模型<br/>7B参数] --> B[全量更新<br/>7B参数]
        B --> C[新模型<br/>28GB存储]
    end

    subgraph PEFT
        D[原始模型<br/>7B参数] --> E[添加少量参数<br/>数百万个]
        E --> F[仅存储适配器<br/>10MB以下]
    end
```

<strong>PEFT主要方法</strong>:

1. <strong>Adapter</strong>: 在层之间插入小型网络
2. <strong>Prefix Tuning</strong>: 向输入添加可训练的前缀
3. <strong>LoRA</strong>: 通过低秩分解更新权重 (最受欢迎)
4. <strong>Prompt Tuning</strong>: 仅训练软提示

## LoRA: 低秩适应原理

### 数学背景

LoRA(Low-Rank Adaptation)基于以下数学洞察:

```python
# 原始权重更新 (Full Fine-tuning)
W_new = W_original + ΔW  # ΔW为 d×d 大小

# LoRA的低秩分解
ΔW = B @ A  # B为 d×r，A为 r×d (r << d)

# 实际应用
output = (W_original + B @ A) @ input
```

<strong>核心理念</strong>:

- 预训练权重已包含丰富信息
- 微调所需的变化量(ΔW)具有<strong>低内在维度(intrinsic dimension)</strong>
- 因此ΔW可以表示为两个小矩阵(B, A)的乘积

### LoRA超参数配置指南

```yaml
# LoRA配置示例 (HuggingFace PEFT)
lora_config:
  r: 8 # 秩 (内在维度)
  lora_alpha: 16 # 缩放参数
  lora_dropout: 0.1 # Dropout比率
  target_modules: # 应用层
    - q_proj # Query投影
    - v_proj # Value投影
  bias: "none" # 是否训练偏置
```

<strong>超参数选择指南</strong>:

| 参数                            | 推荐值         | 说明                                              |
| ------------------------------- | -------------- | ------------------------------------------------- |
| <strong>r (Rank)</strong>       | 4〜16          | 越小越节省内存，越大表达能力越强。大多数情况8合适 |
| <strong>lora_alpha</strong>     | r〜2r          | 类似学习率的作用。通常为r的1〜2倍                 |
| <strong>lora_dropout</strong>   | 0.05〜0.1      | 防止过拟合。小数据集设置高一些                    |
| <strong>target_modules</strong> | q_proj, v_proj | Attention的Query/Value最有效                      |

### LoRA变体

<strong>DoRA (Weight-Decomposed Low-Rank Adaptation, 2024)</strong>

```python
# DoRA: 将权重分解为幅度(magnitude)和方向(direction)
W = m * (V + B @ A)
# m: 可训练幅度，V: 归一化权重，B@A: LoRA
```

- <strong>优点</strong>: 性能更接近Full Fine-tuning
- <strong>缺点</strong>: 比LoRA稍慢

<strong>GaLore (Gradient Low-Rank Projection, 2024)</strong>

```python
# 将梯度投影到低秩空间以节省内存
gradient_lowrank = project_to_lowrank(gradient)
optimizer.step(gradient_lowrank)
```

- <strong>优点</strong>: 优化器状态也低秩压缩 → 额外节省50%内存
- <strong>缺点</strong>: 实现复杂度高

<strong>LoRA+ (2024)</strong>

```python
# 对矩阵A、B应用不同学习率
lr_A = lr * eta  # A使用较高学习率
lr_B = lr        # B使用基本学习率
```

- <strong>优点</strong>: 收敛速度提升1.5〜2倍
- <strong>缺点</strong>: 需要超参数调优

## QLoRA: 量化与PEFT结合

### 4bit量化的革新

QLoRA结合<strong>4bit量化</strong>和LoRA，大幅减少内存使用:

```mermaid
graph TD
    subgraph 内存_对比
        A[原始16bit<br/>14GB] --> B[8bit量化<br/>7GB]
        B --> C[4bit QLoRA<br/>3.5GB]
    end

    subgraph 性能_保持
        D[Full Fine-tuning<br/>100%] --> E[LoRA<br/>98%]
        E --> F[QLoRA<br/>97%]
    end
```

<strong>QLoRA核心技术</strong>:

1. <strong>4bit NormalFloat (NF4)</strong>: 针对正态分布优化的量化
2. <strong>Double Quantization</strong>: 量化常数也量化
3. <strong>Paged Optimizers</strong>: CPU-GPU内存自动管理

### QLoRA实务工作流

```python
from transformers import AutoModelForCausalLM, BitsAndBytesConfig
from peft import LoraConfig, get_peft_model

# 1. 4bit量化配置
bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",      # NormalFloat 4bit
    bnb_4bit_compute_dtype="float16", # 计算使用float16
    bnb_4bit_use_double_quant=True,   # Double quantization
)

# 2. 加载模型
model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-2-7b-hf",
    quantization_config=bnb_config,
    device_map="auto"  # 自动设备分配
)

# 3. LoRA配置
lora_config = LoraConfig(
    r=8,
    lora_alpha=16,
    target_modules=["q_proj", "v_proj"],
    lora_dropout=0.1,
    bias="none",
    task_type="CAUSAL_LM"
)

# 4. 创建PEFT模型
model = get_peft_model(model, lora_config)

# 5. 检查可训练参数
trainable_params = sum(p.numel() for p in model.parameters() if p.requires_grad)
print(f"可训练参数: {trainable_params:,} ({trainable_params/7e9*100:.2f}%)")
# 输出: 可训练参数: 4,194,304 (0.06%)
```

<strong>QLoRA实务技巧</strong>:

- <strong>GPU内存</strong>: 单张RTX 3090 (24GB)可训练7B模型
- <strong>批量大小</strong>: 使用梯度累积 (如: batch_size=1, gradient_accumulation_steps=16)
- <strong>训练时间</strong>: 比Full Fine-tuning慢1.5〜2倍 (量化开销)

## RLHF与DPO: 学习人类偏好

### RLHF的复杂性

人类反馈强化学习(RLHF)强大但复杂:

```mermaid
graph TD
    A[1. 训练SFT模型<br/>Supervised Fine-tuning] --> B[2. 训练奖励模型<br/>Reward Model]
    B --> C[3. 用PPO优化策略<br/>Proximal Policy Optimization]

    D[人类偏好数据<br/>A vs B比较] --> B
    B --> E[奖励分数预测]
    E --> C

    C --> F[最终对齐模型<br/>Aligned Model]
```

<strong>RLHF的问题</strong>:

1. <strong>3阶段流程</strong>: SFT → Reward Model → RL优化
2. <strong>不稳定性</strong>: PPO对超参数敏感
3. <strong>高成本</strong>: 奖励模型训练 + RL采样
4. <strong>调试困难</strong>: RL收敛失败时难以诊断原因

### DPO: 直接偏好优化

直接偏好优化(DPO)<strong>无需奖励模型</strong>直接学习人类偏好:

```mermaid
graph TD
    A[人类偏好数据<br/>偏好响应 vs 非偏好响应] --> B[DPO损失函数<br/>Classification Loss]
    B --> C[对齐模型<br/>单阶段训练]

    D[RLHF: 3阶段] -.-> E[SFT → Reward → PPO]
    F[DPO: 1阶段] -.-> C
```

<strong>DPO损失函数</strong>:

```python
# DPO Loss (公式简化)
loss = -log(σ(β * (log π(y_w|x) - log π(y_l|x))))

# y_w: 偏好响应 (chosen)
# y_l: 非偏好响应 (rejected)
# β: 超参数 (通常为0.1)
# σ: Sigmoid函数
```

<strong>DPO的优势</strong>:

- <strong>简单性</strong>: 无需奖励模型，一次训练完成
- <strong>稳定性</strong>: Classification loss比PPO更稳定
- <strong>效率</strong>: 内存和时间减少50%
- <strong>性能</strong>: 与RLHF相当或更好

### DPO实务实现

```python
from trl import DPOTrainer

# DPO训练配置
training_args = TrainingArguments(
    output_dir="./dpo_model",
    per_device_train_batch_size=4,
    learning_rate=5e-5,
    num_train_epochs=3,
    gradient_accumulation_steps=4,
)

# 初始化DPO Trainer
dpo_trainer = DPOTrainer(
    model=model,
    args=training_args,
    train_dataset=preference_dataset,  # (prompt, chosen, rejected)格式
    tokenizer=tokenizer,
    beta=0.1,  # DPO超参数
)

# 执行训练
dpo_trainer.train()
```

<strong>偏好数据格式</strong>:

```python
preference_dataset = [
    {
        "prompt": "如何在Python中排序列表?",
        "chosen": "使用sorted()函数即可: sorted([3,1,2])",
        "rejected": "直接用sort()就行"
    },
    # ...
]
```

### DPO变体

<strong>ORPO (Odds Ratio Preference Optimization, 2024)</strong>

- <strong>同时</strong>执行SFT和偏好学习
- 无需单独的SFT阶段
- 进一步缩短训练时间

<strong>IPO (Identity Preference Optimization, 2024)</strong>

- 可以无参考模型训练
- 进一步减少内存使用

<strong>KTO (Kahneman-Tversky Optimization, 2024)</strong>

- 使用<strong>单独反馈</strong>(好/坏)代替成对比较
- 大幅降低数据收集成本

## 任务别训练方法选择指南

### 成本-性能权衡

```mermaid
graph TD
    A[分析任务类型] --> B{通用知识<br/>足够?}
    B -->|是| C[提示工程<br/>成本: $0]
    B -->|否| D{需要领域<br/>专精?}

    D -->|是| E{数据规模}
    E -->|小| F[Few-shot ICL<br/>成本: $0]
    E -->|中| G[LoRA/QLoRA<br/>成本: $10~100]
    E -->|大| H[Full Fine-tuning<br/>成本: $1,000~10,000]

    D -->|否| I{提升响应<br/>质量?}
    I -->|是| J[DPO/ORPO<br/>成本: $100~1,000]
```

### 实务建议

<strong>1. 聊天机器人/对话系统</strong>

```
提示 → SFT (LoRA) → DPO
```

- 领域知识注入: 用LoRA高效微调
- 对话质量改善: 用DPO偏好对齐

<strong>2. 文档分类/标注</strong>

```
提示 → LoRA (可选)
```

- 大多数情况提示足够
- 极限性能需求时添加LoRA

<strong>3. 代码生成</strong>

```
提示 → SFT (QLoRA) → RLHF/DPO
```

- 代码风格学习: 用QLoRA训练大量代码
- 可执行性改善: 用RLHF惩罚编译错误

<strong>4. 摘要/翻译</strong>

```
提示 → DPO
```

- 基础模型往往足够
- 风格调整: 用DPO学习期望的语气/长度

### 内存需求对比

| 方法                              | 7B模型                | 13B模型               | 70B模型                |
| --------------------------------- | --------------------- | --------------------- | ---------------------- |
| <strong>Full Fine-tuning</strong> | 80GB                  | 160GB                 | 800GB+                 |
| <strong>LoRA</strong>             | 40GB                  | 80GB                  | 400GB                  |
| <strong>QLoRA</strong>            | <strong>24GB</strong> | <strong>40GB</strong> | <strong>200GB</strong> |

<strong>消费级GPU可行性</strong>:

- <strong>RTX 4090 (24GB)</strong>: 用QLoRA训练7B，用LoRA训练3B
- <strong>RTX 3090 (24GB)</strong>: 用QLoRA训练7B
- <strong>RTX 4060 Ti (16GB)</strong>: 用QLoRA训练3B

## 合上资料后，我还在想这些

### 微调，已经不再是大公司的专利

DeNA资料里最戳中我的一点，是<strong>LLM微调不再是大公司专属</strong>。QLoRA和DPO一出现，前提就变了:

- 24GB VRAM可以微调7B模型
- 数百美元预算可以构建领域专用模型
- 可以使用简单的DPO代替复杂的RLHF

### 效率的范式转变

最近，<strong>效率(Efficiency)</strong>成为热门话题:

- LoRA: 用0.1%参数达到Full Fine-tuning 98%性能
- QLoRA: 用1/4内存达到相同性能
- DPO: 用1/3复杂度达到RLHF相当性能

这不仅是优化，更是<strong>新数学洞察</strong>的结果。低秩假设、量化理论、隐式奖励模型等学术研究正在快速转化为实践。

### 对实践者的启示

1. <strong>从提示开始</strong>: 80%可以用提示解决
2. <strong>LoRA为基础</strong>: 需要微调时首先尝试LoRA
3. <strong>用QLoRA节省资源</strong>: 性能差异微小，内存节省4倍
4. <strong>用DPO对齐</strong>: RLHF是遗留技术，DPO是新标准
5. <strong>测量并改进</strong>: 关注实际任务性能而非基准分数

### 2025年展望

预期趋势:

- <strong>更小但强大的模型</strong>: Phi-3、Gemma 2等小型模型的崛起
- <strong>设备端微调</strong>: 智能手机上也能微调的时代
- <strong>自动化超参数调优</strong>: AutoML for LLM Fine-tuning
- <strong>多模态PEFT</strong>: 图像+文本同时微调

## 参考资料

### 论文

- [LoRA: Low-Rank Adaptation of Large Language Models](https://arxiv.org/abs/2106.09685) (Microsoft, 2021)
- [Training language models to follow instructions with human feedback (InstructGPT，RLHF 原论文)](https://arxiv.org/abs/2203.02155) (OpenAI, 2022)
- [QLoRA: Efficient Finetuning of Quantized LLMs](https://arxiv.org/abs/2305.14314) (University of Washington, 2023)
- [Direct Preference Optimization](https://arxiv.org/abs/2305.18290) (Stanford, 2023)
- [DoRA: Weight-Decomposed Low-Rank Adaptation](https://arxiv.org/abs/2402.09353) (NVIDIA, 2024)
- [GaLore: Memory-Efficient LLM Training](https://arxiv.org/abs/2403.03507) (CMU, 2024)

### 库

- [HuggingFace PEFT](https://github.com/huggingface/peft) - LoRA、QLoRA实现
- [HuggingFace TRL](https://github.com/huggingface/trl) - RLHF、DPO实现
- [Unsloth](https://github.com/unslothai/unsloth) - 2倍快的LoRA训练

### 教程

- [QLoRA Fine-tuning Tutorial](https://colab.research.google.com/drive/1VoYNfYDKcKRQRor98Zbf2-9VQTtGJ24k)
- [DPO Training Example](https://huggingface.co/docs/trl/dpo_trainer)
- [实战LLM微调指南](https://product.kyobobook.co.kr/detail/S000214934825) (教保文库)

---

<strong>下期预告</strong>: "DeNA LLM研究Part 4: 生产部署与监控"将介绍将微调模型部署到实际服务的策略、监控方法和成本优化技术。
