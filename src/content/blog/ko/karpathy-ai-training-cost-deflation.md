---
title: Karpathy "AI 학습 비용은 연 40% 하락" — 디플레이션이 업계 구조를 바꾼다
description: >-
  AI 모델 학습 비용이 매년 40%씩 하락하고 있다는 Karpathy의 분석. 하드웨어 진화, 알고리즘 효율화, 데이터 파이프라인 최적화 등
  구조적 요인과 업계 영향을 해설합니다.
pubDate: '2026-02-16'
heroImage: ../../../assets/blog/karpathy-ai-training-cost-deflation-hero.png
tags:
  - ai
  - llm
  - training
  - cost-optimization
  - karpathy
relatedPosts:
  - slug: gpt-oss-120b-uncensored
    score: 0.94
    reason:
      ko: AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.
      ja: AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: Covers similar topics in AI/ML with comparable difficulty.
      zh: 在AI/ML领域涵盖类似主题，难度相当。
  - slug: icml-prompt-injection-academic-review
    score: 0.94
    reason:
      ko: AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.
      ja: AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: Covers similar topics in AI/ML with comparable difficulty.
      zh: 在AI/ML领域涵盖类似主题，难度相当。
  - slug: minimax-m25-open-weight-vs-proprietary
    score: 0.94
    reason:
      ko: AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.
      ja: AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: Covers similar topics in AI/ML with comparable difficulty.
      zh: 在AI/ML领域涵盖类似主题，难度相当。
  - slug: moltbook-ai-theater-human-control
    score: 0.94
    reason:
      ko: AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.
      ja: AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: Covers similar topics in AI/ML with comparable difficulty.
      zh: 在AI/ML领域涵盖类似主题，难度相当。
  - slug: nvidia-llm-inference-cost-reduction
    score: 0.94
    reason:
      ko: AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.
      ja: AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: Covers similar topics in AI/ML with comparable difficulty.
      zh: 在AI/ML领域涵盖类似主题，难度相当。
---

## 개요

Andrej Karpathy가 자신의 <strong>nanochat</strong> 프로젝트를 통해 놀라운 사실을 공개했습니다. 2019년 OpenAI가 GPT-2(1.5B 파라미터)를 학습시키는 데 약 <strong>$43,000</strong>이 들었지만, 2026년 현재 같은 성능을 달성하는 데 불과 <strong>$73</strong>이면 충분하다는 것입니다. 이는 <strong>약 600배의 비용 절감</strong>이며, 연간 약 40%씩 비용이 하락하는 디플레이션 추세를 보여줍니다.

이 글에서는 Karpathy의 분석을 바탕으로 AI 학습 비용 하락의 구조적 요인과 업계에 미치는 영향을 살펴봅니다.

## GPT-2 학습 비용의 변천

### 2019년: $43,000

- <strong>하드웨어</strong>: 32개 TPU v3 칩 (256 TPU v3 코어)
- <strong>학습 시간</strong>: 약 1주일 (~168시간)
- <strong>클라우드 비용</strong>: TPU v3 시간당 $8 × 32 × 168 = $43,000

### 2026년: $73

- <strong>하드웨어</strong>: 8×H100 GPU 단일 노드
- <strong>학습 시간</strong>: 약 3시간
- <strong>클라우드 비용</strong>: 시간당 ~$24 × 3 = $73

```
비용 추이 (GPT-2 동등 성능 달성 기준)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2019년:  $43,000  ████████████████████████████████
2020년:  $17,200  █████████████
2021년:   $6,880  █████
2022년:   $2,752  ███
2023년:   $1,101  ██
2024년:     $440  █
2025년:     $176  ▏
2026년:      $73  ▏
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## 비용 하락의 4가지 구조적 요인

Karpathy는 비용 하락이 단일 요인이 아닌 <strong>4가지 축의 동시 개선</strong>에 의한 것이라고 분석합니다.

### 1. 하드웨어 진화 (Hardware)

TPU v3에서 H100으로의 전환은 단순한 세대 교체를 넘어 근본적인 연산 효율성 향상을 의미합니다.

- <strong>FP8 연산 지원</strong>: 학습 정밀도를 낮추면서도 품질을 유지
- <strong>HBM3 메모리</strong>: 대역폭 3TB/s로 메모리 병목 해소
- <strong>NVLink 4.0</strong>: GPU 간 통신 속도 900GB/s로 멀티 GPU 효율 극대화

### 2. 소프트웨어 최적화 (Software)

소프트웨어 스택의 개선이 동일한 하드웨어에서도 극적인 성능 향상을 가져옵니다.

- <strong>Flash Attention 3</strong>: 약 9%의 토큰/초 개선. 네이티브 텐서 레이아웃으로 학습과 추론 통합
- <strong>torch.compile</strong>: JIT 컴파일로 Python 오버헤드 제거
- <strong>Sliding Window Attention</strong>: SSSL 패턴(짧은 윈도우 3회 + 긴 윈도우 1회)으로 품질 손실 없이 연산량 절감

### 3. 알고리즘 혁신 (Algorithms)

옵티마이저와 아키텍처의 혁신이 학습 효율을 근본적으로 개선합니다.

- <strong>Muon 옵티마이저</strong>: Polar Express 직교화, NorMuon 분산 감소, cautious weight decay 적용
- <strong>Per-layer residual scalars</strong>: `x = λ_resid * x + λ_x0 * x0`로 모든 모델 크기에서 0.003-0.01 bpb 개선
- <strong>Value Embeddings</strong>: 교대 레이어에 적용하여 거의 제로 FLOPs로 ~150M 파라미터 추가 용량 확보
- <strong>ReLU² 활성화 함수</strong>: GELU 대비 희소하고 저비용

### 4. 데이터 파이프라인 최적화 (Data)

고품질 데이터 큐레이션과 효율적인 데이터 로딩이 학습 효율을 높입니다.

- <strong>FineWeb-edu</strong>: 교육용 고품질 웹 데이터로 데이터 효율성 극대화
- <strong>BOS-aligned dataloader</strong>: 모든 시퀀스가 BOS 토큰으로 시작하여 midtraining 불필요
- <strong>BestFit-Crop 패킹</strong>: 100% 활용률, 순진한 크롭 대비 낭비 약 35% 감소

## 효과가 없었던 시도들

Karpathy는 효과가 <strong>없었던</strong> 기법들도 투명하게 공개하여 커뮤니티에 귀중한 인사이트를 제공합니다.

| 기법 | 결과 |
|------|------|
| Multi-token prediction (MTP) | 메모리 +13GB, 개선 없음 |
| FP8 for lm_head | 동작하지만 메모리 +2GB, 속도 1% 향상만 |
| Half-truncated RoPE | 개선 없음 |
| Skip connections / backout | 개선 없음, 메모리 +2GB |
| Bigram embeddings (Engram-lite) | 효과 있으나 복잡도 대비 이점 부족 |

## 업계 구조에 미치는 영향

### 진입 장벽의 붕괴

연 40%의 비용 하락은 AI 학습의 <strong>민주화</strong>를 가속합니다. 과거에는 대형 테크 기업만 가능했던 규모의 학습이 이제 스타트업이나 개인 연구자도 접근 가능해지고 있습니다.

### 경쟁 축의 전환

비용이 더 이상 차별화 요소가 되지 않으면서, 경쟁의 축이 전환됩니다:

- <strong>데이터 품질</strong>: 얼마나 좋은 데이터를 확보하느냐
- <strong>파인튜닝 노하우</strong>: 도메인 특화 최적화 역량
- <strong>추론 효율성</strong>: 학습보다 서빙 비용이 핵심

### 오픈소스 생태계 강화

$100 이하로 GPT-2급 모델을 학습할 수 있다는 것은 <strong>오픈소스 커뮤니티</strong>의 실험과 혁신이 대폭 가속됨을 의미합니다. nanochat 자체가 약 1,000줄의 코드로 구성되어 있어 교육적 가치도 큽니다.

### 무어의 법칙을 넘어서는 하락률

연 40% 하락은 무어의 법칙(약 2년에 2배, 연 ~29% 하락)보다 <strong>빠른 속도</strong>입니다. 이는 하드웨어뿐 아니라 소프트웨어·알고리즘·데이터의 동시 개선이 만들어내는 복합 효과입니다.

## 결론

Karpathy의 nanochat 프로젝트는 단순한 벤치마크 기록 갱신을 넘어, AI 학습 비용의 <strong>구조적 디플레이션</strong>을 실증적으로 보여주는 사례입니다. 하드웨어, 소프트웨어, 알고리즘, 데이터 — 이 4가지 축의 동시 개선이 연 40%라는 놀라운 하락률을 만들어내고 있으며, 이 추세는 AI 업계의 경쟁 구도를 근본적으로 변화시키고 있습니다.

중요한 것은 Karpathy 자신이 "이것은 과소추정이며, 추가 개선이 충분히 가능하다"고 언급한 점입니다. 디플레이션은 아직 끝나지 않았습니다.

## 참고 자료

- [Beating GPT-2 for <$100: the nanochat journey — Karpathy](https://github.com/karpathy/nanochat/discussions/481)
- [Reddit r/LocalLLaMA 토론](https://www.reddit.com/r/LocalLLaMA/comments/1r5uhfu/deflation_cost_to_train_ai_models_drops_40_per/)
- [nanochat GitHub 리포지토리](https://github.com/karpathy/nanochat)
