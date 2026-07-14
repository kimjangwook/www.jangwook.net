---
title: Google TurboQuant — KV Cache를 3비트로 압축해도 정확도가 안 떨어진다고?
description: >-
  Google이 발표한 TurboQuant의 PolarQuant+QJL 기법을 분석한다. KV cache 메모리 6배 절감, 어텐션 8배
  가속이 실제로 의미하는 것.
pubDate: '2026-03-26'
heroImage: ../../../assets/blog/google-turboquant-kv-cache-3bit-compression-hero.jpg
tags:
  - ai-ml
  - llm
  - optimization
  - inference
  - quantization
relatedPosts:
  - slug: qwen3-coder-next-llama-cpp-graph-optimization
    score: 0.95
    reason:
      ko: 'AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: 'Covers similar topics in AI/ML, architecture with comparable difficulty.'
      zh: 在AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: consistency-diffusion-lm
    score: 0.94
    reason:
      ko: 'AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: 'Covers similar topics in AI/ML, architecture with comparable difficulty.'
      zh: 在AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: dena-llm-study-part3-model-training
    score: 0.94
    reason:
      ko: 'AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: 'Covers similar topics in AI/ML, architecture with comparable difficulty.'
      zh: 在AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: llama-cpp-iq-quantization-merge
    score: 0.94
    reason:
      ko: AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.
      ja: AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: Covers similar topics in AI/ML with comparable difficulty.
      zh: 在AI/ML领域涵盖类似主题，难度相当。
  - slug: verbalized-sampling-llm-diversity
    score: 0.94
    reason:
      ko: 'AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: 'Covers similar topics in AI/ML, architecture with comparable difficulty.'
      zh: 在AI/ML、架构领域涵盖类似主题，难度相当。
---

어제(3월 25일) Google Research 블로그에 올라온 포스트 하나가 반도체 업계를 흔들었다. TurboQuant라는 이름의 KV cache 압축 기법인데, <strong>메모리 6배 절감에 어텐션 연산 8배 가속, 그런데 정확도 손실은 제로</strong>라는 주장이다. 솔직히 처음 봤을 때 "또 벤치마크 체리피킹이겠지" 싶었다.

그런데 논문을 읽어보니 생각보다 수학이 깔끔하고, TechCrunch가 이걸 Silicon Valley의 Pied Piper에 비유하는 기사까지 냈다. ICLR 2026에서 발표 예정이니 학술적 검증도 곧 이루어질 것이다. 오늘은 이 기법이 실제로 어떻게 작동하는지, 그리고 LLM 추론 비용에 어떤 의미가 있는지 풀어본다.

## KV Cache가 왜 문제인가

LLM 추론에서 가장 큰 메모리 병목은 모델 가중치가 아니라 KV cache다. Transformer 어텐션 메커니즘이 이전 토큰의 Key, Value 벡터를 전부 저장해야 하기 때문이다. 컨텍스트가 길어질수록 이 캐시가 선형으로 커진다.

구체적인 숫자를 보면:

- Llama 3.1 405B 모델, 128K 컨텍스트 기준으로 KV cache만 <strong>수십 GB</strong>를 차지
- H100 80GB VRAM에서 모델 자체를 올리고 나면 KV cache에 쓸 공간이 빠듯
- 배치 사이즈를 늘려 처리량을 높이고 싶어도 메모리가 부족

기존에도 양자화로 이 문제를 해결하려는 시도는 많았다. [INT8, INT4 양자화](/ko/blog/ko/prismml-bonsai-1bit-llm-edge-ai)가 대표적인데, 3비트 이하로 내려가면 정확도가 눈에 띄게 떨어지는 것이 한계였다.

## TurboQuant의 핵심 아이디어 두 가지

TurboQuant는 두 개의 독립적인 기법을 결합한다.

### 1. PolarQuant — 극좌표 변환으로 정규화를 없앤다

일반적인 양자화는 벡터를 정규화한 뒤 스칼라 양자화를 적용한다. 문제는 정규화 과정에서 노름(norm)을 별도로 저장해야 하고, 이 과정에서 오차가 누적된다는 것이다.

PolarQuant는 발상을 뒤집었다. 벡터를 직교좌표(Cartesian)에서 <strong>극좌표(Polar)</strong>로 변환한다. 극좌표에서는 방향(각도)과 크기(반지름)가 자연스럽게 분리되므로, 정규화 단계 자체가 필요 없어진다. 각도 성분만 균일 양자화하면 되니 오차가 크게 줄어든다.

나는 이 접근이 꽤 영리하다고 본다. 양자화의 난제를 "더 좋은 양자화 알고리즘"이 아니라 "좌표계를 바꿔서 문제 자체를 쉽게 만들자"라는 방식으로 풀었기 때문이다.

### 2. QJL — 1비트 부호 보정으로 편향을 잡는다

양자화의 두 번째 적은 편향(bias)이다. 양자화된 벡터의 내적을 구할 때 체계적인 오차가 발생하는데, 이걸 무시하면 어텐션 스코어가 틀어진다.

QJL(Quantized Johnson-Lindenstrauss)은 JL 변환이라는 차원 축소 기법을 응용해서, 양자화 편향을 <strong>1비트짜리 부호 보정</strong>으로 제거한다. 추가 메모리는 극히 적고, 연산 오버헤드도 무시할 수준이라고 한다.

```python
# 개념적 pseudocode — 실제 구현은 논문 참조
def turboquant_attention(Q, K, V):
    # 1. Key/Value를 극좌표 변환 후 3비트 양자화
    K_polar = to_polar(K)
    K_quant = uniform_quantize(K_polar.angles, bits=3)

    # 2. QJL 1비트 부호 보정 생성
    sign_correction = qjl_sign_bits(K, Q)

    # 3. 보정된 어텐션 스코어 계산
    scores = corrected_dot_product(Q, K_quant, sign_correction)
    return softmax(scores) @ quantize(V, bits=3)
```

## 숫자로 보는 성능

| 지표 | FP16 (기존) | TurboQuant (3비트) | 개선폭 |
|------|------------|-------------------|--------|
| KV Cache 메모리 | 기준 | 1/6 | 6배 절감 |
| 어텐션 연산 속도 | 기준 | 8배 | H100 기준 |
| 정확도 (perplexity) | 기준 | 동일 | 손실 없음 |
| 모델 재학습 | - | 불필요 | drop-in |

특히 "모델 재학습 불필요"라는 점이 중요하다. 기존 모델에 그대로 끼워넣을 수 있다는 뜻이니, 이미 배포된 시스템에도 바로 적용할 수 있다.

## 솔직한 의문점

하지만 의문도 있다. 몇 가지 짚어본다.

<strong>첫째, "정확도 손실 제로"가 모든 태스크에서 성립하는지 아직 모른다.</strong> 논문이 보여주는 perplexity 기준에서는 그렇다고 하지만, 장문 생성이나 복잡한 추론에서도 동일한 품질을 유지하는지는 독립적인 검증이 필요하다. ICLR 리뷰어들이 어떤 추가 실험을 요구할지 지켜봐야 한다.

<strong>둘째, 실제 프로덕션 환경에서의 구현 복잡도가 불투명하다.</strong> 극좌표 변환과 QJL 부호 보정을 실시간으로 수행하려면 커스텀 CUDA 커널이 필요할 텐데, 이게 vLLM이나 TensorRT-LLM 같은 프레임워크에 바로 통합될 수 있을지는 별개 문제다.

<strong>셋째, 메모리 반도체 업계에 대한 과도한 해석이 보인다.</strong> TurboQuant 뉴스 이후 메모리 반도체 주가가 소폭 하락했다는 보도가 있었는데, 솔직히 이건 과잉 반응이다. KV cache 메모리 절감이 HBM 수요를 줄이려면 모든 추론 프레임워크가 이 기법을 채택해야 하고, 그건 적어도 1~2년은 걸릴 일이다.

## 왜 주목할 만한가

비판을 했지만, 그래도 이 연구의 방향성 자체는 가치가 크다고 본다.

LLM 추론 비용의 상당 부분이 GPU 메모리에서 온다. 모델 자체는 이미 다양한 양자화(GPTQ, AWQ, GGUF 등)로 압축하고 있지만, KV cache는 상대적으로 손대지 못하고 있었다. TurboQuant가 보여주는 것은 <strong>"하드웨어 스케일링 없이도 긴 컨텍스트를 효율적으로 처리할 수 있는 길"</strong>이다.

개인적으로 가장 기대되는 적용 시나리오는 로컬 LLM이다. [24GB VRAM의 소비자 GPU](/ko/blog/ko/local-llm-private-mcp-server-gemma4-fastmcp)에서 128K 컨텍스트를 돌리는 것은 현재로서는 거의 불가능한데, KV cache를 6배 줄일 수 있다면 이야기가 완전히 달라진다. [llama.cpp](/ko/blog/ko/llama-cpp-iq-quantization-merge) 생태계에서 이걸 구현한다면 정말 재미있어질 것이다.

## 참고 자료

- [TurboQuant: Redefining AI efficiency with extreme compression — Google Research Blog](https://research.google/blog/turboquant-redefining-ai-efficiency-with-extreme-compression/)
- [Google TurboQuant AI Memory Compression — TechCrunch](https://techcrunch.com/2026/03/25/google-turboquant-ai-memory-compression-silicon-valley-pied-piper/)
- [Google's TurboQuant compresses LLM KV caches to 3 bits — Tom's Hardware](https://www.tomshardware.com/tech-industry/artificial-intelligence/googles-turboquant-compresses-llm-kv-caches-to-3-bits-with-no-accuracy-loss)
- [Google's new TurboQuant algorithm speeds up AI memory 8x — VentureBeat](https://venturebeat.com/infrastructure/googles-new-turboquant-algorithm-speeds-up-ai-memory-8x-cutting-costs-by-50)
