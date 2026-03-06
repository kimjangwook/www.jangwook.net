---
title: 'Deep-Thinking Ratio: LLM 추론 비용을 50% 줄이는 새로운 측정 지표'
description: >-
  "길게 생각하면 좋다"는 상식을 뒤집는 Google·UVA 연구. Deep-Thinking Ratio(DTR)를 활용하면
  추론 품질을 유지하면서 LLM 추론 비용을 절반으로 줄일 수 있습니다. EM/VPoE가 알아야 할 실전 인사이트.
pubDate: '2026-03-05'
heroImage: ../../../assets/blog/deep-thinking-ratio-llm-cost-optimization-hero.png
tags:
  - llm
  - cost-optimization
  - reasoning
  - google
  - inference
relatedPosts:
  - slug: karpathy-ai-training-cost-deflation
    score: 0.88
    reason:
      ko: LLM 비용 최적화라는 공통 주제로, DTR과 학습 비용 절감 전략을 함께 읽으면 AI 비용 전략을 전체적으로 이해할 수 있습니다.
      ja: LLMコスト最適化という共通テーマで、DTRと学習コスト削減戦略を合わせて読むことでAIコスト戦略を包括的に理解できます。
      en: Both focus on LLM cost optimization; reading DTR alongside training cost reduction strategies gives a holistic view of AI cost strategy.
      zh: 同样聚焦LLM成本优化，将DTR与训练成本削减策略结合阅读，可全面理解AI成本战略。
  - slug: ai-agent-cost-reality
    score: 0.83
    reason:
      ko: AI 에이전트 운영 비용의 현실을 다루며, DTR로 추론 비용을 줄이는 전략과 직접 연결됩니다.
      ja: AIエージェント運用コストの現実を扱い、DTRで推論コストを削減する戦略と直接つながります。
      en: Covers the reality of AI agent operational costs, directly connecting to DTR strategies for reducing inference costs.
      zh: 探讨AI智能体运营成本的现实，与利用DTR降低推理成本的策略直接相关。
  - slug: asic-llm-inference-16k-tps
    score: 0.79
    reason:
      ko: ASIC 하드웨어로 추론 속도를 높이는 접근과 DTR로 소프트웨어 수준에서 비용을 줄이는 접근을 비교해볼 수 있습니다.
      ja: ASICハードウェアで推論速度を高めるアプローチとDTRでソフトウェアレベルでコストを削減するアプローチを比較できます。
      en: Compare hardware (ASIC) approaches to inference speed with DTR's software-level cost reduction strategy.
      zh: 可将ASIC硬件提升推理速度的方法与DTR软件层面降低成本的策略进行比较。
  - slug: mit-soar-self-curriculum-reasoning
    score: 0.75
    reason:
      ko: LLM 추론 능력 향상 연구로, DTR과 함께 읽으면 추론 품질과 효율성을 동시에 이해할 수 있습니다.
      ja: LLM推論能力向上の研究で、DTRと合わせて読むことで推論品質と効率性を同時に理解できます。
      en: Research on improving LLM reasoning; reading alongside DTR provides understanding of both reasoning quality and efficiency.
      zh: 关于提升LLM推理能力的研究，与DTR结合阅读可同时理解推理质量与效率。
---

## "길게 생각할수록 좋다"는 틀렸다

LLM 추론(Reasoning) 분야에서 지난 몇 년간 공식처럼 통용되던 원칙이 있습니다. "<strong>Chain-of-Thought를 길게 생성할수록 더 정확한 답을 낸다</strong>"는 것이었죠. o1, o3, Claude의 Extended Thinking이 이 원칙을 기반으로 설계되었고, 더 많은 토큰 = 더 높은 정확도라는 등식이 산업 표준이 되었습니다.

2026년 2월, University of Virginia와 Google 연구팀이 발표한 논문 "Think Deep, Not Just Long: Measuring LLM Reasoning Effort via Deep-Thinking Tokens"(arXiv:2602.13517)이 이 상식을 정면으로 반박합니다. 그리고 그 대안으로 제시하는 것이 바로 <strong>Deep-Thinking Ratio(DTR)</strong>입니다.

## DTR이란 무엇인가

### 핵심 개념: 생각의 깊이 측정

DTR은 LLM이 생성하는 토큰 중 <strong>실제로 깊은 추론이 일어나는 토큰의 비율</strong>을 측정합니다.

<strong>Deep-Thinking Token</strong>이란, 모델의 얕은 레이어(초기 레이어)에서의 예측과 깊은 레이어(후기 레이어)에서의 예측이 크게 달라지는 토큰을 말합니다. 쉽게 말해, 모델이 그 토큰을 생성하기 위해 실제로 "더 깊이 처리"한 토큰들입니다.

```
DTR = (Deep-Thinking Tokens 수) / (전체 추론 토큰 수)
```

### 길이 vs. 깊이: 두 지표의 상관관계

연구팀은 22개 모델(GPT-4o, Claude 3.7, Gemini 2.5 Pro, o4-mini-high 포함)을 대상으로 실험했습니다.

| 지표 | 정확도와의 상관계수 | 의미 |
|------|-----------------|------|
| 추론 길이(토큰 수) | r = -0.59 | **부정적 상관** — 길수록 오히려 낮은 성능 경향 |
| DTR (추론 깊이 비율) | r = +0.683 | **강한 양적 상관** — 깊을수록 높은 성능 |

이 결과가 의미하는 바는 명확합니다. <strong>긴 추론은 종종 "과도한 생각(overthinking)"의 신호</strong>이며, 실제 품질과는 반비례할 수 있다는 것입니다.

## Think@n: DTR을 활용한 비용 절감 알고리즘

연구팀은 DTR을 실용적으로 활용하는 <strong>Think@n</strong>이라는 알고리즘을 제안합니다.

### 작동 원리

```
1. n개의 추론 후보 병렬 생성 시작
2. 각 후보의 첫 50개 토큰만 생성
3. 50개 토큰으로 DTR 계산
4. DTR이 낮은(가망 없는) 후보 즉시 중단
5. DTR이 높은 후보들만 완전히 생성
```

핵심은 <strong>단 50개의 토큰만으로 해당 추론 경로가 "깊은 생각"을 하고 있는지 판단</strong>할 수 있다는 것입니다.

### 성과: AIME 25 벤치마크

AIME 2025(어려운 수학 문제) 벤치마크에서 Think@n의 성과:

```
기존 표준 투표(Standard Voting):
  - 정확도: 기준선
  - 비용: 100%

Think@n:
  - 정확도: 기준선 대비 향상
  - 비용: 약 51% (49% 절감)
```

단순히 비용을 줄인 것이 아니라, <strong>비용을 절반으로 줄이면서 동시에 정확도를 높였습니다.</strong>

## EM/VPoE 관점에서의 실전 시사점

### 1. AI 인프라 비용 최적화 전략 재검토

현재 많은 팀이 "더 긴 컨텍스트, 더 많은 토큰 = 더 좋은 결과"라는 가정 하에 AI 인프라를 설계하고 있습니다. DTR 연구는 이 가정이 근본적으로 잘못되었을 수 있음을 보여줍니다.

실무적으로 고려할 사항:

- <strong>토큰 예산 정책 재설계</strong>: 단순히 최대 토큰을 늘리는 대신, 깊은 추론이 필요한 작업과 그렇지 않은 작업을 구분
- <strong>Early stopping 전략</strong>: 낮은 DTR 신호를 감지하면 추론을 조기에 중단하는 로직 구현
- <strong>병렬 생성 + 필터링</strong>: 여러 추론 경로를 동시에 시작하되, DTR이 낮은 경로는 50토큰 후 즉시 종료

### 2. AI 에이전트 설계에의 적용

특히 복잡한 추론을 수행하는 AI 에이전트 파이프라인에서 DTR은 강력한 도구가 됩니다.

```python
# 개념적 구현 예시
def think_at_n(problem, n_candidates=5, prefix_length=50):
    candidates = []

    # n개의 추론 경로 초기화
    for i in range(n_candidates):
        prefix = generate_tokens(problem, max_tokens=prefix_length)
        dtr = calculate_dtr(prefix)
        candidates.append((prefix, dtr))

    # DTR 기반 필터링: 상위 k개만 유지
    threshold = median([c[1] for c in candidates])
    promising = [c for c in candidates if c[1] >= threshold]

    # 유망한 후보만 완전히 생성
    results = [complete_generation(c[0]) for c in promising]
    return best_of(results)
```

### 3. 비용 모니터링 메트릭 확장

기존의 AI 비용 모니터링은 주로 토큰 수와 API 호출 수에 집중했습니다. DTR을 도입하면 새로운 관점이 생깁니다.

| 기존 지표 | DTR 추가 시 개선 |
|---------|--------------|
| 총 토큰 수 | 깊은 추론 토큰 vs. 낮은 추론 토큰 비율 |
| 응답 길이 | 길이 대비 추론 품질 비율 |
| API 비용 | 실제 추론 노력에 비례한 비용 |

## DTR의 한계와 앞으로의 과제

현재 DTR을 실무에 적용하기 위해서는 몇 가지 제약이 있습니다:

<strong>1. 모델 내부 접근 필요</strong>
DTR은 모델의 중간 레이어(hidden states)에 접근해야 계산 가능합니다. 현재 GPT-4o, Claude와 같은 상용 API에서는 이 정보가 노출되지 않습니다.

<strong>2. 오픈소스 모델에서 우선 적용 가능</strong>
Llama 3.1, Qwen 3, Mistral 등 오픈소스 모델을 자체 배포하는 팀은 즉시 DTR 기반 최적화를 구현할 수 있습니다.

<strong>3. API 벤더의 지원 필요</strong>
장기적으로는 Anthropic, OpenAI, Google이 DTR 기반 최적화를 API 레벨에서 제공하거나, 추론 효율성 지표를 노출하는 방향으로 발전할 것으로 예상됩니다.

## 엔지니어링 팀을 위한 즉시 적용 가능한 시사점

DTR을 지금 당장 API에서 계산할 수 없더라도, 이 연구에서 얻을 수 있는 즉각적인 시사점들이 있습니다:

**길이 제한보다 품질 지표에 집중하세요.** 단순히 최대 토큰 수를 늘리는 것은 비용 낭비로 이어질 수 있습니다.

**복수 후보 생성 + Best-of-N 전략을 검토하세요.** Think@n의 핵심 아이디어인 "여러 경로를 시작하고 가망 없는 것을 빨리 포기한다"는 접근법은 현재도 구현 가능합니다. 단지 DTR 대신 다른 신뢰도 지표(confidence score, perplexity 등)를 활용할 수 있습니다.

**"생각 길이"가 아닌 "생각 다양성"을 실험하세요.** 동일한 문제에 대해 하나의 긴 추론보다 여러 개의 독립적인 짧은 추론을 통해 더 나은 성능을 낼 수 있습니다.

## 결론

Google·UVA의 DTR 연구는 AI 추론 최적화의 패러다임 전환을 예고합니다. "길게 생각하면 좋다"에서 "깊게 생각하는 것이 진짜 중요하다"로의 전환입니다.

엔지니어링 매니저와 VPoE 입장에서 이 연구가 중요한 이유는 단순합니다. <strong>AI 인프라 비용의 절반을 줄이면서 동시에 성능을 높일 수 있는 이론적 기반이 생겼습니다.</strong> 오픈소스 모델을 활용하는 팀이라면 지금 바로 DTR 기반 추론 최적화를 실험해볼 가치가 있습니다.

---

<strong>참고 자료</strong>
- 논문: [Think Deep, Not Just Long: Measuring LLM Reasoning Effort via Deep-Thinking Tokens](https://arxiv.org/abs/2602.13517) (arXiv:2602.13517)
- [Google's Deep-Thinking Ratio: Cut LLM Costs by 50%](https://i10x.ai/news/googles-deep-thinking-ratio-halves-llm-reasoning-costs)
- [MarkTechPost 기사](https://www.marktechpost.com/2026/02/21/a-new-google-ai-research-proposes-deep-thinking-ratio-to-improve-llm-accuracy-while-cutting-total-inference-costs-by-half/)
