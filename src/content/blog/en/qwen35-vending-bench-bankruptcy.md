---
title: 'Qwen 3.5 Goes Bankrupt on Vending-Bench 2: The Pitfall of Benchmark Obsession'
description: >-
  Qwen 3.5, a top performer on standard benchmarks, goes bankrupt on
  Vending-Bench 2's vending machine simulation. Exploring the blind spots of
  benchmark-driven AI evaluation.
pubDate: '2026-02-17'
heroImage: ../../../assets/blog/qwen35-vending-bench-bankruptcy-hero.png
tags:
  - ai
  - llm
  - benchmark
  - qwen
  - evaluation
relatedPosts:
  - slug: patent-strategy-llm-era
    score: 0.95
    reason:
      ko: AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.
      ja: AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: Covers similar topics in AI/ML with comparable difficulty.
      zh: 在AI/ML领域涵盖类似主题，难度相当。
  - slug: ai-model-rush-february-2026
    score: 0.94
    reason:
      ko: AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.
      ja: AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: Covers similar topics in AI/ML with comparable difficulty.
      zh: 在AI/ML领域涵盖类似主题，难度相当。
  - slug: gpt52-theoretical-physics-discovery
    score: 0.92
    reason:
      ko: '다음 단계 학습으로 적합하며, AI/ML 주제에서 연결됩니다.'
      ja: 次のステップの学習に適しており、AI/MLのトピックで繋がります。
      en: >-
        Suitable as a next-step learning resource, connecting through AI/ML
        topics.
      zh: 适合作为下一步学习资源，通过AI/ML主题进行连接。
  - slug: icml-prompt-injection-academic-review
    score: 0.92
    reason:
      ko: '다음 단계 학습으로 적합하며, AI/ML 주제에서 연결됩니다.'
      ja: 次のステップの学習に適しており、AI/MLのトピックで繋がります。
      en: >-
        Suitable as a next-step learning resource, connecting through AI/ML
        topics.
      zh: 适合作为下一步学习资源，通过AI/ML主题进行连接。
  - slug: windsurf-arena-mode-speed-over-accuracy
    score: 0.92
    reason:
      ko: AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.
      ja: AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: Covers similar topics in AI/ML with comparable difficulty.
      zh: 在AI/ML领域涵盖类似主题，难度相当。
---

## Overview

Alibaba's large language model <strong>Qwen 3.5 Plus</strong> consistently ranks at the top of standard benchmarks like MMLU, HumanEval, and MATH. However, on <strong>Vending-Bench 2</strong>, a non-standard benchmark developed by Andon Labs, the model delivered a shocking result: <strong>bankruptcy</strong>. This finding garnered over 595 upvotes on Reddit's r/LocalLLaMA, sparking a broader discussion about how we evaluate AI models.

## What Is Vending-Bench 2?

Vending-Bench 2 is a <strong>vending machine business simulation benchmark</strong> developed by Andon Labs. It tasks AI models with running a virtual vending machine business over approximately 365 days, comprehensively measuring <strong>financial management, decision-making, and strategic planning</strong> capabilities.

Unlike traditional benchmarks, it measures practical abilities such as:

- <strong>Long-term strategic thinking</strong>: Continuous business decisions over a full year
- <strong>Financial risk management</strong>: Balancing profitability with sustainability
- <strong>Adaptability</strong>: Responding to changing simulation conditions
- <strong>Applied reasoning</strong>: Not just knowledge, but the ability to apply it

## Shocking Results: Qwen 3.5 Finishes Last with Bankruptcy

![Vending-Bench 2 Results — Money Balance Over Time (Source: Andon Labs / Reddit r/LocalLLaMA)](../../../assets/blog/qwen35-vending-bench-bankruptcy-results.png)

The chart above shows each model's performance over the 365-day simulation:

| Rank | Model | Final Balance (Approx.) |
|------|-------|------------------------|
| 1st | GLM-5 | ~$8,000+ |
| 2nd | Gemini 3 Flash | ~$4,000–$4,500 |
| 3rd | Kimi K2.5 | ~$3,500–$4,000 |
| 4th | Claude Opus 4.6 | ~$2,000–$2,500 |
| 5th | DeepSeek-V3.2 | ~$200–$500 |
| 6th | <strong>Qwen 3.5 Plus</strong> | <strong>~$0 (Bankrupt)</strong> |

A model that ranks among the best on standard benchmarks finished <strong>dead last</strong> with zero balance — a truly stunning result.

## Why Does This Discrepancy Exist?

### The Limits of Standard Benchmarks

```mermaid
graph TD
    A[Standard Benchmarks] --> B[Knowledge Tests<br/>MMLU, ARC]
    A --> C[Coding<br/>HumanEval, MBPP]
    A --> D[Math<br/>MATH, GSM8K]
    A --> E[Reasoning<br/>BBH, HellaSwag]
    
    F[Vending-Bench 2] --> G[Long-term Strategy]
    F --> H[Financial Management]
    F --> I[Risk Assessment]
    F --> J[Adaptability]
    
    style A fill:#e8f5e9
    style F fill:#fff3e0
```

Standard benchmarks excel at measuring <strong>static knowledge and isolated tasks</strong>. However, they fail to capture:

- <strong>Consistency in multi-step decision-making</strong>
- <strong>Judgment under uncertainty</strong>
- <strong>Strategic thinking that accounts for long-term outcomes</strong>
- <strong>Trade-off evaluation and selection</strong>

### The Benchmark Optimization Problem

In AI development, improving standard benchmark scores has become a key metric. This leads to a phenomenon known as <strong>"benchmark hacking"</strong>:

1. <strong>Overfitting risk</strong>: Specializing in patterns similar to benchmark tests
2. <strong>Reduced generalization</strong>: Sacrificing ability to handle unexpected tasks
3. <strong>Gap between apparent and real-world performance</strong>: Great numbers, poor practical utility

## Community Reaction

The Reddit r/LocalLLaMA discussion featured notable perspectives:

- <strong>"Active parameters ≠ intelligence"</strong>: Model size alone doesn't determine capability
- <strong>Architecture matters</strong>: MoE (Mixture of Experts) routing efficiency significantly impacts results
- <strong>Training data quality</strong>: Not just quantity, but quality and diversity matter

GLM-5's dominant performance at over $8,000 profit is also noteworthy. Models that rank below Qwen 3.5 on standard benchmarks can dramatically outperform it on practical tasks.

## The Future of AI Evaluation

### The Need for Multi-Dimensional Assessment

```mermaid
graph LR
    A[Future of AI Evaluation] --> B[Standard Benchmarks<br/>Knowledge & Reasoning]
    A --> C[Practical Benchmarks<br/>Vending-Bench etc.]
    A --> D[Domain-Specific Eval<br/>Medical, Legal, Financial]
    A --> E[Human Evaluation<br/>Chatbot Arena etc.]
    
    B --> F[Comprehensive<br/>Model Assessment]
    C --> F
    D --> F
    E --> F
```

These results clearly demonstrate that <strong>no single benchmark should determine a model's overall capability</strong>:

1. <strong>Multi-dimensional evaluation</strong>: Assessing knowledge, reasoning, practical application, and creativity
2. <strong>Real-world simulations</strong>: Expanding practical benchmarks like Vending-Bench
3. <strong>Domain-specific evaluation</strong>: Specialized testing aligned with intended use cases
4. <strong>Continuous monitoring</strong>: Evaluation across varied conditions, not just one-time tests

## Conclusion

Qwen 3.5 Plus's bankruptcy on Vending-Bench 2 is a stark reminder of <strong>the dangers of benchmark-obsessed AI evaluation</strong>. The fact that a top-ranking model on standard benchmarks can finish last in a practical scenario underscores the need to look beyond numbers when choosing AI models.

Measuring AI's true capabilities requires not just standardized tests but <strong>diverse benchmarks that reflect real-world complexity</strong>.

## References

- [Reddit r/LocalLLaMA — Qwen 3.5 goes bankrupt on Vending-Bench 2](https://www.reddit.com/r/LocalLLaMA/comments/1r6ghty/qwen_35_goes_bankrupt_on_vendingbench_2/)
- [Andon Labs](https://andonlabs.com/)
