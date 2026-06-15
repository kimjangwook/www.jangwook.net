---
title: 'DeNA LLM Study Part 1: LLM Fundamentals and 2025 AI Landscape'
description: >-
  DeNA LLM Study series begins. Comparing GPT-4, Claude, and Gemini, covering
  Next Token Prediction, Instruction Tuning, Reasoning models, and prompt
  engineering basics.
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
  - question: "LLMs operate on tokens rather than words, so how does that affect languages like Korean?"
    answer: "LLMs operate on tokens, not words. In English, one word is roughly one token, but in Korean one word is roughly 2-3 tokens. Since token count directly affects cost and context limits, it matters when optimizing usage."
  - question: "How much does Chain of Thought prompting improve accuracy?"
    answer: "Even a non-reasoning model gets a noticeable accuracy bump from a single CoT instruction asking it to work step by step. Based on the article's examples, accuracy rises from about 60 percent for Zero-shot to about 80 percent for Few-shot and about 90 percent for Chain of Thought."
  - question: "What is the difference between RLHF and DPO?"
    answer: "RLHF aligns models with human preferences, requires thousands to tens of thousands of data points, and is high cost. DPO, proposed by Stanford in 2023, optimizes preferences directly and is simpler yet more effective than RLHF, needing only thousands of data points at medium cost."
  - question: "Which model and Temperature should I use for code review or data analysis?"
    answer: "Based on the practical use case table, code review is best with Claude Sonnet 4 at temperature 0.3, and data analysis with Claude Sonnet 4 at temperature 0.1. The more deterministic and consistent the output needs to be, the lower you set the Temperature."
---

> <strong>Series: DeNA LLM Study</strong> (1/5)
>
> 1. <strong>[Part 1: LLM Fundamentals and 2025 AI Landscape](/en/blog/en/dena-llm-study-part1-fundamentals)</strong> ← Current Article
> 2. Part 2: Structured Output and Multi-LLM Pipelines
> 3. [Part 3: Model Training Methodologies](/en/blog/en/dena-llm-study-part3-model-training)
> 4. [Part 4: RAG Architecture and Latest Trends](/en/blog/en/dena-llm-study-part4-rag)
> 5. [Part 5: Agent Design and Multi-Agent Orchestration](/en/blog/en/dena-llm-study-part5-agent-design)

## Who This Is For / When to Skip Ahead

This is a fundamentals piece, so it isn't equally useful to everyone. Adjust how deeply you read based on where you're starting from.

<strong>This is especially useful if you</strong>

- Just started using LLMs and want the basics nailed down first: what a token is, why you'd ever touch Temperature.
- Have been writing prompts on instinct and getting inconsistent accuracy, and want the difference between Zero-shot, Few-shot, and CoT laid out once.
- Need to recommend a model to your team but aren't sure what to weigh when choosing among GPT, Claude, Gemini, and DeepSeek.
- Want a one-page LLM summary for an internal study group or new-hire onboarding.

<strong>You can skip ahead if you</strong>

- Can already explain Transformers, Next Token Prediction, and RLHF. Skim this one as review and jump to Part 2 on structured output, or to [Part 4: RAG Architecture and Latest Trends](/en/blog/en/dena-llm-study-part4-rag) if retrieval is what you care about.
- Are designing tool-using agents rather than single calls. [Part 5: Agent Design and Multi-Agent Orchestration](/en/blog/en/dena-llm-study-part5-agent-design) speaks to that directly.
- Want to dig into how models are actually trained. Part 3 on training methodology fits better than this basic comparison.

In short: read this when you want to draw the concept map once. If you already have the map, jump to the part you need.

## GPT, Claude, and Gemini: The Tangled 2025 AI Map

The LLM landscape a year ago looks nothing like it does today. That hit me again while pulling together DeNA's internal study materials. This five-part series builds on those materials, walking from the basic mechanics of LLMs all the way to practical use. Part 1, right here, starts with how an LLM actually works under the hood, then maps out where the major models stand as of late 2025.

> <strong>Source Material</strong>: This post is based on [DeNA Internal Study Materials](https://dena.github.io/llm-study20251201/).

## 2025 Major LLM Landscape

### Performance Comparison: GPT-4 vs Claude vs Gemini

Three families dominate the market in 2025. Here is how their flagship lineups stack up side by side.

```markdown
| Model                              | Developer | Features     | Strengths                           |
| ---------------------------------- | --------- | ------------ | ----------------------------------- |
| <strong>GPT-5.1 / GPT-4o</strong>  | OpenAI    | 128K context | Versatility, Stability              |
| <strong>Claude Opus 4 / Sonnet 4</strong> | Anthropic | 200K context | Coding, Analysis, Long context |
| <strong>Gemini-2.5-Pro</strong>    | Google    | 1M context   | Multimodal, Ultra-long documents    |
| <strong>DeepSeek-R1</strong>       | DeepSeek  | 128K context | Reasoning, Open-source, Cost-effective |
```

### Benchmark Performance (December 2025)

```mermaid
graph LR
    A[LLM Benchmarks] --> B[MMLU]
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

> <strong>MMLU</strong>: Massive Multitask Language Understanding (57 subject knowledge evaluation)
> <strong>HumanEval</strong>: Programming capability assessment
> <strong>MATH</strong>: Mathematical problem-solving ability

### Pricing Comparison (December 2025)

```mermaid
graph TD
    subgraph Input["Input Token Cost (per 1M tokens)"]
        I1["GPT-4o: $2.50"]
        I2["Claude Sonnet 4: $3"]
        I3["Gemini-2.5-Pro: $1.25"]
        I4["DeepSeek-R1: $0.55"]
        I1 ~~~ I2 ~~~ I3 ~~~ I4
    end

    subgraph Output["Output Token Cost (per 1M tokens)"]
        O1["GPT-4o: $10"]
        O2["Claude Sonnet 4: $15"]
        O3["Gemini-2.5-Pro: $5"]
        O4["DeepSeek-R1: $2.19"]
        O1 ~~~ O2 ~~~ O3 ~~~ O4
    end

    Input ~~~ Output
```

> <strong>Key Insight</strong>: DeepSeek-R1 provides excellent cost-performance, and Gemini also has strong price competitiveness. Claude shows superiority in coding and analysis tasks.

## Next Token Prediction: Core Principle of LLMs

### Transformer Architecture

The Transformer, which forms the foundation of LLMs, was first introduced in Google's "Attention is All You Need" paper in 2017.

```mermaid
graph TD
    A[Input Text] --> B[Tokenization]
    B --> C[Embedding]
    C --> D[Self-Attention]
    D --> E[Feed Forward]
    E --> F[Next Token Prediction]
    F --> G[Output Text]

    D -.-> D1["Query, Key, Value"]
    E -.-> E1["Layer Normalization"]
    F -.-> F2["Softmax Probability Distribution"]
```

### How Next Token Prediction Works

```python
# Simple Next Token Prediction example
def predict_next_token(context: str, model: LLM) -> str:
    """
    Predict the next token from given context

    Args:
        context: "The quick brown"
        model: LLM model

    Returns:
        "fox" (token with highest probability)
    """
    # 1. Tokenization
    tokens = tokenize(context)  # ["The", "quick", "brown"]

    # 2. Embedding conversion
    embeddings = model.embed(tokens)

    # 3. Pass through Transformer layers
    hidden_states = model.forward(embeddings)

    # 4. Calculate probability distribution
    logits = model.lm_head(hidden_states[-1])  # hidden state of last token
    probs = softmax(logits)

    # 5. Select token with highest probability
    next_token = argmax(probs)  # "fox" (prob: 0.87)

    return next_token
```

> <strong>Important</strong>: LLMs operate on <strong>tokens</strong>, not words. English: 1 word ≈ 1 token, Korean: 1 word ≈ 2-3 tokens.

### Latest Research Trends: Mixture of Experts (MoE)

Since 2024, most large models have moved to an MoE architecture. The idea is simple.

```mermaid
graph TD
    A[Input] --> B[Router]
    B --> C1[Expert 1<br/>Coding]
    B --> C2[Expert 2<br/>Math]
    B --> C3[Expert 3<br/>Language]
    B --> C4[Expert 4<br/>Common Sense]

    C1 --> D[Output Integration]
    C2 --> D
    C3 --> D
    C4 --> D
```

<strong>Advantages</strong>:

- Computational efficiency: Only part of total parameters activated
- Specialization: Each Expert specialized in specific domains
- Scalability: Performance improvement by adding Experts

## Instruction Tuning: Making AI Follow Instructions

### Pre-training vs Fine-tuning vs RLHF

```mermaid
graph TD
    A[1. Pre-training] --> B[2. Supervised Fine-tuning<br/>SFT]
    B --> C[3. RLHF]
    C --> D[Production Model]

    A -.-> A1["Large-scale text data<br/>(trillions of tokens)"]
    B -.-> B1["High-quality instruction-response pairs<br/>(tens to hundreds of thousands)"]
    C -.-> C1["Human feedback-based<br/>reward model training"]
```

### Instruction Tuning Dataset Examples

```yaml
# SFT (Supervised Fine-Tuning) data format
- instruction: "Parse this JSON and extract the name."
  input: '{"user": {"name": "John", "age": 30}}'
  output: "John"

- instruction: "Fix the bug in this code."
  input: |
    def add(a, b):
        return a - b
  output: |
    def add(a, b):
        return a + b  # Use + instead of -

- instruction: "Translate this sentence to Korean."
  input: "Hello, world!"
  output: "안녕하세요, 세계!"
```

### Post-training Technique Comparison

| Technique                          | Purpose                        | Data Requirements              | Cost   |
| ---------------------------------- | ------------------------------ | ------------------------------ | ------ |
| <strong>SFT</strong>               | Learn to follow instructions   | Tens of thousands              | Low    |
| <strong>RLHF</strong>              | Align with human preferences   | Thousands to tens of thousands | High   |
| <strong>DPO</strong>               | Direct preference optimization | Thousands                      | Medium |
| <strong>Constitutional AI</strong> | Automate value alignment       | Very few                       | Low    |

> <strong>DPO (Direct Preference Optimization)</strong>: Proposed by Stanford in 2023, it's simpler yet more effective than RLHF.

## Reasoning Models: Thinking AI

### The Evolution of o1, o3, and DeepSeek-R1

OpenAI announced the o1 reasoning model in September 2024. By December 2024, the o3 model followed. Then DeepSeek shook things up again by releasing DeepSeek-R1, an open-source reasoning model.

```mermaid
graph TD
    A[User Question] --> B[Internal Reasoning Process<br/>Chain of Thought]
    B --> C[Intermediate Step 1]
    C --> D[Intermediate Step 2]
    D --> E[Intermediate Step 3]
    E --> F[Final Answer]

    B -.-> B1["Takes seconds to minutes"]
    C -.-> C1["Hypothesis Formation"]
    D -.-> D1["Verification"]
    E -.-> E1["Conclusion"]
```

### Reasoning Model Performance Comparison

```markdown
| Benchmark                                        | GPT-4o          | o1              | o3              |
| ------------------------------------------------ | --------------- | --------------- | --------------- |
| <strong>AIME 2024</strong> (Math Olympiad)       | 13.4%           | 74.4%           | 96.7%           |
| <strong>Codeforces</strong> (Coding Competition) | 11th percentile | 89th percentile | 99th percentile |
| <strong>GPQA Diamond</strong> (Science)          | 50.6%           | 78.3%           | 87.7%           |
```

> <strong>Note</strong>: DeepSeek-R1 achieves performance comparable to o1 at much lower cost, contributing to the democratization of AI.

### Chain of Thought (CoT) Prompting

Even a non-reasoning model gets a noticeable accuracy bump from a single CoT instruction.

```markdown
# ❌ Standard Prompt

"Calculate 234 × 567."
→ High chance of incorrect answer

# ✅ CoT Prompt

"Calculate 234 × 567 step by step. Show intermediate results for each step."
→ Significantly improved accuracy
```

<strong>Actual CoT Example</strong>:

```
Question: Calculate 234 × 567.

CoT Response:
1. First, decompose 234 into 200 + 30 + 4.
2. Multiply each by 567:
   - 200 × 567 = 113,400
   - 30 × 567 = 17,010
   - 4 × 567 = 2,268
3. Add them all together:
   113,400 + 17,010 + 2,268 = 132,678

Answer: 132,678
```

## Prompt Engineering Fundamentals

### Zero-shot vs Few-shot vs Chain of Thought

```mermaid
graph TD
    A[Prompt Strategy] --> B[Zero-shot]
    A --> C[Few-shot]
    A --> D[Chain of Thought]

    B --> B1["Instruction only<br/>'Analyze sentiment'"]
    C --> C1["Provide examples<br/>'Positive: I like it<br/>Negative: I hate it'"]
    D --> D1["Guide reasoning process<br/>'Analyze step by step'"]

    B1 -.-> B2["Accuracy: 60%"]
    C1 -.-> C2["Accuracy: 80%"]
    D1 -.-> D2["Accuracy: 90%"]
```

### Impact of Temperature Parameter

```python
# Output variation by Temperature setting

# Temperature = 0 (Deterministic, consistent)
response = model.generate(
    "Write a Fibonacci sequence in Python.",
    temperature=0
)
# Output: Always the same code (selects highest probability token)

# Temperature = 0.7 (Balanced, recommended)
response = model.generate(
    "Write a creative story.",
    temperature=0.7
)
# Output: Moderately diverse while maintaining consistency

# Temperature = 1.5 (Creative, unstable)
response = model.generate(
    "Suggest a completely new idea.",
    temperature=1.5
)
# Output: Very diverse but low consistency, sometimes strange outputs
```

### Effective Prompt Writing Principles

1. <strong>Clarity</strong>: Avoid ambiguous instructions

   ```
   ❌ "Tell me about this"
   ✅ "Explain three main features of Claude 3.5 Sonnet in 150 characters or less."
   ```

2. <strong>Provide Context</strong>: Include background information

   ```
   ❌ "Review the code"
   ✅ "This is a React component. Review it from performance, readability, and accessibility perspectives: [code]"
   ```

3. <strong>Specify Output Format</strong>: State desired structure
   ```
   ✅ "Respond in the following format:
   1. Summary (1 sentence)
   2. Key Points (3 items)
   3. Action Plan (step by step)"
   ```

## Exercise A Insights: OpenAI API in Practice

### Basic API Usage

```python
from openai import OpenAI

client = OpenAI(api_key="your-api-key")

# Basic chat completion
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {"role": "system", "content": "You are a helpful AI assistant."},
        {"role": "user", "content": "What is an LLM?"}
    ],
    temperature=0.7,
    max_tokens=500
)

print(response.choices[0].message.content)
```

### Conversation History Management

```python
# Maintain conversation context
conversation_history = [
    {"role": "system", "content": "You are a Python expert."}
]

def chat(user_message: str) -> str:
    # Add user message
    conversation_history.append({"role": "user", "content": user_message})

    # API call
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=conversation_history,
        temperature=0.7
    )

    # Save assistant response
    assistant_message = response.choices[0].message.content
    conversation_history.append({"role": "assistant", "content": assistant_message})

    return assistant_message

# Conversation example
print(chat("Explain list comprehension."))
print(chat("Show me example code."))  # Maintains previous context
print(chat("Convert this to dictionary comprehension."))  # Continuous conversation
```

### Token Usage Optimization

```python
import tiktoken

def count_tokens(text: str, model: str = "gpt-4") -> int:
    """Calculate token count of text"""
    encoding = tiktoken.encoding_for_model(model)
    return len(encoding.encode(text))

# Prompt optimization example
long_prompt = "This is a very long prompt..." * 100
token_count = count_tokens(long_prompt)
print(f"Token count: {token_count}")  # e.g., 8,543 tokens

# Cost calculation
input_cost = (token_count / 1_000_000) * 10  # GPT-4 Turbo input cost
print(f"Estimated cost: ${input_cost:.4f}")
```

## Key Learning Points

### 1. Model Selection Criteria

```mermaid
graph TD
    A[Task Type] --> B{What to do?}
    B --> C[Coding/Analysis]
    B --> D[General Conversation]
    B --> E[Ultra-long Document Processing]
    B --> F[Cost Optimization]

    C --> C1["Claude Sonnet 4"]
    D --> D1["GPT-4o"]
    E --> E1["Gemini-2.5-Pro"]
    F --> F1["GPT-4o-mini or<br/>Gemini-2.5-Flash"]
```

### 2. Performance Improvement Checklist

- ✅ <strong>Clear Instructions</strong>: Eliminate ambiguity
- ✅ <strong>Few-shot Examples</strong>: Provide 3-5 examples
- ✅ <strong>CoT Prompting</strong>: For complex reasoning tasks
- ✅ <strong>Temperature Adjustment</strong>: Set according to task
- ✅ <strong>Specify Output Format</strong>: Structured responses
- ✅ <strong>Context Management</strong>: Consider token limits

### 3. Practical Use Cases

| Scenario                    | Recommended Model   | Settings |
| --------------------------- | ------------------- | -------- |
| Code Review                 | Claude Sonnet 4     | temp=0.3 |
| Creative Writing            | GPT-4o              | temp=0.9 |
| Data Analysis               | Claude Sonnet 4     | temp=0.1 |
| Customer Support Chatbot    | GPT-4o-mini         | temp=0.7 |
| Long Document Summarization | Gemini-2.5-Pro      | temp=0.5 |

## Next Episode Preview

Part 2 will cover <strong>Structured Output and Multi-LLM Pipelines</strong>:

- JSON Mode and Function Calling
- Practical applications of structured output
- Multi-LLM pipeline design
- Type safety with Pydantic
- Exercise B: Building complex data extraction systems

> <strong>Next Article</strong>: Part 2: Structured Output and Multi-LLM Pipelines

## References

- [DeNA LLM Study Materials (Zenn)](https://dena.github.io/llm-study20251201/)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Anthropic Claude Documentation](https://docs.anthropic.com/claude/docs)
- [Google Gemini Documentation](https://ai.google.dev/docs)
- [Attention is All You Need (Transformer paper)](https://arxiv.org/abs/1706.03762)
- [Chain of Thought Prompting](https://arxiv.org/abs/2201.11903)

---

<strong>Written</strong>: December 8, 2025
<strong>Series</strong>: DeNA LLM Study (1/5)
<strong>Tags</strong>: #LLM #AI #PromptEngineering #DeNA
