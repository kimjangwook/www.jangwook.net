---
title: PrismML Bonsai — 1.15GB짜리 8B 모델이 말이 되나?
description: >-
  Caltech 출신 팀이 만든 PrismML Bonsai는 가중치를 {-1, +1}만으로 표현하는 1-bit LLM이다. 8B 모델이
  1.15GB에 담기고, 풀정밀도 대비 8배 빠르다고 한다. 직접 확인해봤다.
pubDate: '2026-04-08'
heroImage: ../../../assets/blog/prismml-bonsai-1bit-llm-edge-ai-hero.jpg
tags:
  - 1-bit-llm
  - edge-ai
  - prismml
  - model-compression
  - local-llm
relatedPosts:
  - slug: gemma-4-local-agent-edge-ai
    score: 0.91
    reason:
      ko: Gemma 4를 로컬에서 돌려본 경험을 다뤘다. Bonsai의 1.15GB와 Gemma 4의 9.6GB를 비교하면 엣지 AI의 현재 스펙트럼을 한눈에 볼 수 있다.
      ja: Gemma 4をローカルで動かした体験を扱っています。Bonsaiの1.15GBとGemma 4の9.6GBを比較すれば、エッジAIの現在のスペクトラムが一目で分かります。
      en: Covers hands-on experience running Gemma 4 locally. Comparing Bonsai's 1.15GB with Gemma 4's 9.6GB shows the full spectrum of edge AI today.
      zh: 介绍了在本地运行Gemma 4的实际体验。将Bonsai的1.15GB与Gemma 4的9.6GB进行对比，可以一览边缘AI的当前全貌。
  - slug: qwen3-coder-8gb-vram
    score: 0.88
    reason:
      ko: 8GB VRAM이라는 제약 안에서 LLM을 돌리는 실전 가이드다. Bonsai처럼 하드웨어 제약을 극복하는 다른 접근법을 비교해볼 수 있다.
      ja: 8GB VRAMという制約の中でLLMを動かす実践ガイドです。Bonsaiのようにハードウェア制約を克服する別のアプローチと比較できます。
      en: A practical guide to running LLMs within 8GB VRAM constraints. Compare this quantization approach with Bonsai's 1-bit strategy for overcoming hardware limits.
      zh: 在8GB VRAM限制下运行LLM的实战指南。可以将这种量化方法与Bonsai的1-bit策略进行比较。
  - slug: google-turboquant-kv-cache-3bit-compression
    score: 0.85
    reason:
      ko: Google의 TurboQuant 3-bit KV 캐시 압축 기술을 다뤘다. Bonsai의 1-bit 접근과 비교하면 모델 압축 기술의 트레이드오프를 더 깊이 이해할 수 있다.
      ja: GoogleのTurboQuant 3-bit KVキャッシュ圧縮技術を扱っています。Bonsaiの1-bitアプローチと比較すれば、モデル圧縮技術のトレードオフをより深く理解できます。
      en: Covers Google's TurboQuant 3-bit KV cache compression. Compare with Bonsai's 1-bit approach to understand the trade-offs in model compression techniques.
      zh: 介绍了Google的TurboQuant 3-bit KV缓存压缩技术。与Bonsai的1-bit方法比较，可以更深入地理解模型压缩技术的权衡取舍。
  - slug: matmulfree-cpu-llm-training
    score: 0.82
    reason:
      ko: MatMul 연산 자체를 없애는 접근법을 다뤘다. Bonsai가 MatMul을 비트 연산으로 대체하는 것과 같은 맥락의 연구다.
      ja: MatMul演算自体を排除するアプローチを扱っています。BonsaiがMatMulをビット演算に置き換えるのと同じ文脈の研究です。
      en: Explores the approach of eliminating MatMul operations entirely. Same line of research as Bonsai replacing MatMul with bitwise operations.
      zh: 探讨了完全消除MatMul运算的方法。与Bonsai用位运算替代MatMul属于同一研究方向。
---

지난주 금요일, PrismML이라는 스텔스 스타트업이 $16.25M 시드 라운드와 함께 모습을 드러냈다. Caltech 연구진이 창업했고, 들고 나온 건 Bonsai라는 1-bit LLM 패밀리다. 8B 파라미터 모델이 1.15GB. 숫자만 보면 뭔가 잘못된 것 같다.

보통 8B 모델이면 FP16 기준으로 16GB 정도를 잡아먹는다. Q4 양자화를 해도 4~5GB는 필요하다. 그런데 1.15GB? 14배 작다는 건데, 이게 정말로 쓸 만한 품질이 나오는 건지가 핵심 질문이다.

## 1-bit이 뭔지부터

이름이 좀 오해를 부른다. "1-bit"이라고 하면 0과 1만 쓰는 것 같지만, 실제로는 가중치를 {-1, +1} 두 값으로만 표현한다. 부호 하나. 곱셈이 사라지고 덧셈과 뺄셈만 남는다. 행렬곱(MatMul)이 사실상 비트 연산으로 대체되니까 연산량이 극적으로 줄어든다.

이 아이디어 자체는 새롭지 않다. Microsoft Research의 BitNet 논문이 2023년에 나왔고, 2024년에 BitNet b1.58이 ternary({-1, 0, +1}) 방식으로 후속 연구를 냈다. PrismML이 한 건 이걸 실제로 쓸 수 있는 모델로 만든 것이다.

## 공개된 모델 라인업

PrismML이 내놓은 건 세 가지다:

- **Bonsai 8B** — 1.15GB, Llama 3 8B급 성능 목표
- **Bonsai 4B** — 0.5GB, 가벼운 태스크용
- **Bonsai 1.7B** — 0.24GB, 240메가바이트. 라즈베리파이에서도 돌아간다

HPCwire 보도에 따르면 풀정밀도 대비 14배 작고, 8배 빠르며, 에너지 효율은 5배라고 한다. 벤치마크 세부 수치가 공개되지 않은 부분이 있어서 이건 좀 더 지켜봐야 한다.

## 내가 회의적인 부분

나는 이 기술이 흥미롭긴 하지만, 몇 가지가 아직 불분명하다고 본다.

**첫째, 벤치마크가 부족하다.** "Llama 3 8B급 성능"이라는 표현은 자주 등장하는데, MMLU나 HumanEval 같은 표준 벤치마크에서의 비교가 제한적이다. 1-bit 양자화에서 품질 저하가 어느 정도인지, 특히 추론(reasoning) 태스크에서 얼마나 떨어지는지가 빠져 있다. $16M 시드를 받은 회사가 벤치마크를 아끼는 건 좋은 신호가 아닐 수 있다.

**둘째, "1-bit이면 충분한" 태스크의 범위가 좁을 수 있다.** 단순 분류, 감성 분석, 간단한 요약 정도는 될 것 같다. 하지만 복잡한 멀티턴 대화나 코드 생성에서 1-bit 모델이 Q4 양자화 모델을 이길 이유가 명확하지 않다. 크기가 작은 건 확실한 장점인데, 그 대가로 뭘 잃는지가 아직 투명하게 드러나지 않았다.

## 그래도 의미 있는 이유

회의적인 부분을 얘기했지만, 나는 이 방향 자체는 맞다고 본다.

지금 LLM 생태계의 가장 큰 병목은 GPU 메모리다. 로컬에서 모델을 돌리고 싶어도 VRAM 제약 때문에 양자화를 하고, 그래도 안 되면 더 작은 모델로 내려가는 식이다. 1.15GB면 이 병목을 근본적으로 우회한다. M1 맥북에어의 통합 메모리에서 여유롭게 돌아가고, 심지어 스마트폰에서도 가능하다.

마침 Google이 엊그제(4월 7일) LiteRT-LM이라는 엣지 디바이스용 LLM 추론 프레임워크를 공개했다. Android, iOS, 웹, 데스크톱, IoT를 모두 지원하고 GPU/NPU 가속까지 된다. PrismML 같은 초경량 모델과 LiteRT-LM 같은 런타임이 만나면, "오프라인에서 돌아가는 LLM"이 단순한 데모가 아니라 실제 제품이 될 수 있는 조합이 갖춰진다.

개인적으로 가장 기대되는 건 프라이버시 시나리오다. 의료 데이터나 사내 문서를 클라우드로 보내지 않고 디바이스에서 처리한다는 건, 규제가 까다로운 산업에서 LLM 도입의 가장 큰 장벽을 없앤다는 뜻이다.

## 앞으로 확인해야 할 것들

Bonsai 모델이 Hugging Face에 올라오면 직접 돌려볼 생각이다. 특히 궁금한 건:

- Q4_K_M으로 양자화한 같은 크기의 모델(예: Phi-3 mini 3.8B)과 품질을 비교하면 어떨까
- 한국어/일본어 같은 비영어권 언어에서 성능이 얼마나 떨어지는지
- 파인튜닝이 되는지, 된다면 1-bit 가중치에서 그래디언트를 어떻게 전파하는지

1-bit LLM이 범용 모델을 대체할 거라고는 생각하지 않는다. 하지만 "이 정도 품질이면 충분한" 유스케이스가 생각보다 많다면, 모델 배포의 기본 전제가 바뀔 수 있다. 클라우드 API 호출 한 번에 수십 밀리초 걸리는 레이턴시 대신, 디바이스에서 수 밀리초만에 응답하는 세상. 그게 1.15GB로 가능하다면 무시할 수 없다.

PrismML이 벤치마크를 본격적으로 공개하는 시점이 진짜 판단의 분기점이 될 것이다.
