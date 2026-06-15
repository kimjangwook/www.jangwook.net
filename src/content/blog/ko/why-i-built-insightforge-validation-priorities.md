---
title: 'InsightForge를 예측 도구가 아니라 검증 우선순위 도구로 만든 이유'
description: 'LLM synthetic panel로 시장의 정답을 예측하는 대신, 무엇을 검증해야 하는지 정리하는 워크플로우로 InsightForge를 만든 이유. synthetic panel 한계, directional score, auditable workflow 철학을 설명합니다.'
pubDate: '2026-06-15'
heroImage: ../../../assets/blog/llm-consumer-research-hero.jpg
tags: [ai, startup, product-research, insightforge, synthetic-panel]
relatedPosts:
  - slug: 'ai-agent-persona-analysis'
    score: 0.91
    reason:
      ko: 'AI persona 분석과 synthetic panel의 한계를 함께 이해할 수 있습니다.'
      ja: 'AI persona分析とsynthetic panelの限界を合わせて理解できます。'
      en: 'It connects AI persona analysis with the limits of synthetic panels.'
      zh: '可以把AI persona分析和synthetic panel的限制一起理解。'
  - slug: 'dena-llm-study-part2-structured-output'
    score: 0.84
    reason:
      ko: 'LLM 출력을 제품 기능으로 만들 때 왜 구조화가 필요한지 이어서 볼 수 있습니다.'
      ja: 'LLM出力を製品機能にする時、なぜ構造化が必要なのかを続けて読めます。'
      en: 'It explains why structured output matters when LLM results become product features.'
      zh: '说明了为什么把LLM输出产品化时需要结构化。'
  - slug: 'iterative-review-cycle-methodology'
    score: 0.8
    reason:
      ko: '반복 리뷰와 게이트를 통해 품질을 올리는 방법론이 이어집니다.'
      ja: '反復レビューとゲートで品質を上げる方法論につながります。'
      en: 'It extends the discussion into iterative review and quality gates.'
      zh: '延伸到通过迭代审查和质量门提升质量的方法。'
  - slug: 'self-healing-ai-systems'
    score: 0.76
    reason:
      ko: 'AI 시스템을 운영 가능한 제품으로 만들 때 필요한 방어적 설계를 다룹니다.'
      ja: 'AIシステムを運用可能な製品にするための防御的設計を扱います。'
      en: 'It covers defensive design for making AI systems operational.'
      zh: '讨论了让AI系统成为可运营产品所需的防御性设计。'

---
InsightForge를 만들면서 가장 먼저 버린 문장이 있다.

“AI가 실제 소비자 반응을 예측합니다.”

이 문장은 팔기 쉽다. 짧고 강하다. 제품 설명에도 잘 들어간다. 하지만 내가 보기에 이 문장은 위험했다. 실제 고객을 만나지 않은 상태에서 LLM이 생성한 응답을 시장의 진실처럼 말하면, 제품은 빨리 그럴듯해질 수는 있어도 의사결정 도구로는 약해진다.

그래서 InsightForge의 중심 문장은 반대로 잡았다.

> InsightForge는 시장의 정답을 말하는 도구가 아니라, 무엇을 검증해야 하는지 정리하는 도구다.

이 글은 그 결정을 왜 했는지에 대한 빌드 로그다. 제품 홍보문이라기보다, LLM 기반 리서치 제품을 만들면서 내가 어떤 선을 긋고 싶었는지에 대한 기록에 가깝다.

## 처음에 매력적으로 보였던 방향

처음에는 당연히 더 공격적인 방향도 생각할 수 있었다.

제품 설명을 넣으면 personas가 만들어지고, 각 persona가 점수를 매기고, 마지막에 “시장 반응 예측”을 보여준다. 화면도 만들기 쉽다. 숫자도 예쁘게 나온다. 사용자는 결과를 즉시 이해한다.

하지만 바로 문제가 보였다.

평균 점수 7.2가 나오면 무엇을 해야 할까? 출시해야 할까? 가격을 올려야 할까? 광고를 집행해야 할까?

그 숫자만으로는 실제 결정을 내리기 어렵다. 더 큰 문제는, 그 숫자가 너무 쉽게 확신처럼 보인다는 점이다. LLM이 만든 synthetic response를 실제 표본조사처럼 취급하면, 제품은 유용해지는 것이 아니라 위험해진다.

## 평균 점수보다 중요한 것

리서치에서 평균은 종종 가장 덜 흥미로운 정보다.

예를 들어 어떤 SaaS 기능에 대해 평균 관심도 7점이 나왔다고 하자. 이 평균 뒤에는 완전히 다른 세 가지 상황이 숨어 있을 수 있다.

| 패턴 | 같은 평균인가 | 실제 의사결정 |
| --- | --- | --- |
| 모두가 적당히 관심 있음 | 가능 | 포지셔닝을 더 날카롭게 해야 함 |
| 일부 세그먼트가 강하게 반응하고 나머지는 무관심 | 가능 | 첫 타깃 세그먼트를 좁혀야 함 |
| 기능은 좋지만 신뢰와 도입 리스크에서 갈림 | 가능 | 증거, 보안, 전환비용 메시지를 먼저 검증해야 함 |

초기 제품 의사결정에서는 “평균적으로 괜찮다”보다 “누가 왜 망설이는가”가 더 중요하다.

InsightForge에서 보고 싶었던 것도 이쪽이었다.

- 어떤 persona가 강하게 반응했는가
- 어떤 objection이 반복되는가
- 가격 거부인지, 신뢰 거부인지, 긴급도 부족인지
- 기능 호감과 구매 의사가 분리되는가
- 어떤 claim은 proof가 없으면 통하지 않는가
- 다음 고객 인터뷰에서 반드시 물어야 할 질문은 무엇인가

이런 정보는 시장의 정답은 아니지만, 다음 검증을 더 좋게 만든다.

## synthetic panel은 고객이 아니다

내가 가장 조심한 부분은 synthetic panel의 지위다.

LLM으로 만든 persona는 고객이 아니다. 설문 응답자도 아니다. 실제 구매 경험, 예산 제약, 조직 정치, 시간 압박, 경쟁 제품 사용 경험을 가진 사람이 아니다.

그렇기 때문에 synthetic panel의 출력을 “고객의 목소리”라고 부르면 안 된다. 더 정확한 표현은 “가설 생성을 위한 시뮬레이션된 반응”이다.

이 차이를 제품 안에서 계속 유지하려고 했다.

- synthetic response는 실제 고객 인용문처럼 보이면 안 된다
- confidence는 통계적 신뢰구간처럼 말하면 안 된다
- report는 결론보다 validation question을 더 중요하게 다뤄야 한다
- limitation을 숨기지 말아야 한다
- 실제 리서치나 인터뷰로 이어지는 구조가 있어야 한다

이런 제약은 제품을 덜 화려하게 만든다. 하지만 더 오래 쓸 수 있는 도구로 만든다.

## 논문을 읽으면서 얻은 기준

이 방향은 혼자 만든 직감만은 아니다.

synthetic human samples나 simulated economic agents에 대한 연구는 LLM이 조건을 주면 일정한 사회적 패턴을 흉내낼 수 있음을 보여준다. 이 가능성은 제품적으로 중요하다. 동시에 synthetic survey data를 실제 human survey의 대체물처럼 쓰는 것에 대한 비판도 강하다. 분포가 왜곡될 수 있고, 응답이 과도하게 매끄러워질 수 있으며, 실제 표본의 불편한 노이즈가 사라질 수 있다.

그래서 내가 잡은 기준은 이렇다.

> LLM synthetic panel은 validation priority를 만들 때 쓰고, validation result라고 부르지 않는다.

Semantic Similarity Rating 계열의 사고도 여기에 잘 맞았다. 절대적인 시장 수요를 예측하기보다, concept, claim, response, evidence 사이의 의미적 가까움과 차이를 비교하는 방식이 더 안전하다. “이 메시지가 누구에게 더 맞는가”, “이 objection은 어디에서 반복되는가”, “이 claim은 어떤 proof가 있어야 통하는가”를 보는 쪽이다.

## 제품 설계에서 일부러 넣은 제약

InsightForge를 만들면서 일부러 넣은 제약들이 있다.

| 위험 | 넣은 제약 |
| --- | --- |
| 일반적인 AI 조언으로 흐름 | persona 조건과 질문 구조를 고정 |
| 점수가 진실처럼 보임 | directional score로 표현 |
| 평균이 차이를 숨김 | segment spread와 disagreement를 표시 |
| 그럴듯한 요약이 과신을 만듦 | evidence와 interpretation을 분리 |
| synthetic quote가 실제 고객처럼 보임 | synthetic evidence임을 명시 |
| 결과가 끝처럼 보임 | 다음 human validation question을 생성 |

이 제약들은 제품을 복잡하게 만든다. 하지만 이 복잡함은 기능 과잉이 아니라 안전장치다.

LLM 제품에서 가장 어려운 것은 “생성하는 것”이 아니다. 생성된 내용을 어느 위치에 놓을지 정하는 것이다. 예측인가, 초안인가, 가설인가, 검증 결과인가. 이 구분을 못 하면 제품은 빠르게 위험해진다.

## 실제로 유용했던 순간

InsightForge 방식이 의미 있다고 느낀 순간은, 좋은 점수가 나왔을 때가 아니었다.

오히려 점수는 괜찮은데 adoption readiness가 낮게 나올 때였다. 예를 들어 어떤 금융 서비스 컨셉에서 “기능은 좋다”는 반응과 “주거래 계좌로 바꾸기는 어렵다”는 반응이 동시에 나올 수 있다. 이 경우 평균 호감도만 보면 긍정적이다. 하지만 실제 사업 의사결정에서는 완전히 다른 질문이 필요하다.

- 사용자는 왜 기능에는 동의하지만 전환은 망설이는가
- 신뢰를 만들기 위해 필요한 proof는 무엇인가
- 첫 메시지는 편의성인가, 안전성인가, 보증인가
- 첫 타깃은 전환 의지가 높은 사람인가, 보조 계좌로 써볼 사람인가

이런 질문이 나오면 report는 쓸모가 생긴다.

AI가 답을 맞혔기 때문이 아니라, 사람이 검증할 질문을 더 선명하게 만들었기 때문이다.

## 단순 ChatGPT 프롬프트와의 차이

이런 작업을 ChatGPT로 직접 할 수도 있다. 실제로 초기 탐색은 그렇게 해도 된다.

하지만 제품으로 만들려면 몇 가지가 달라진다.

- 매번 다른 형식의 답변이 나오면 비교가 어렵다
- persona 조건이 흔들리면 segment 차이를 믿기 어렵다
- evidence 없이 요약만 있으면 review가 어렵다
- confidence가 무엇을 의미하는지 모르면 팀이 오해한다
- report가 다음 액션으로 이어지지 않으면 읽고 끝난다

그래서 InsightForge의 차별점은 모델 접근이 아니다. LLM 출력을 auditable research workflow로 바꾸는 것이다. [AI SaaS를 혼자 만들어 런칭한 경험](/ko/blog/ko/individual-developer-ai-saas-journey)에서도 같은 결론을 얻었다—panel 구성, 질문 구조, scoring, evidence trail, limitation, next validation question이 한 흐름에 있어야 한다.

## 내가 원하는 첫 사용 방식

이 도구를 처음 쓰는 팀에게는 큰 시장 분석부터 하지 말라고 말하고 싶다.

처음에는 좁게 쓰는 편이 낫다.

- 제품 컨셉 하나
- 타깃 세그먼트 하나
- 지역 또는 시장 하나
- 핵심 비즈니스 질문 하나
- 경쟁 대안 몇 개
- 가격 가정 하나

그리고 결과를 “출시해도 되는가”가 아니라 “무엇을 고객에게 물어봐야 하는가”로 읽어야 한다.

첫 번째 성공 기준은 report 자체가 아니라, 다음 고객 인터뷰나 메시지 테스트가 더 좋아지는 것이다.

## 아직 남아 있는 과제

이 방식에도 남은 과제는 많다.

confidence를 얼마나 더 투명하게 보여줄 것인가. 같은 조건으로 여러 번 실행했을 때 stability를 어떻게 설명할 것인가. synthetic response가 너무 매끄러워지는 문제를 어떻게 감지할 것인가. 실제 human research와 연결했을 때 어떤 패턴이 자주 맞고, 어떤 패턴은 자주 틀리는가.

이 질문들은 제품이 커질수록 더 중요해진다. [AI 에이전트를 실제 운용할 때 비용 구조가 예상보다 훨씬 복잡해진다](/ko/blog/ko/ai-agent-cost-reality)는 점과 같은 맥락이다.

내가 피하고 싶은 것은 “AI가 다 알아서 해준다”는 방향이다. 그보다 더 현실적인 방향은 “AI가 사람이 검증할 일을 더 잘 정리해준다”는 방향이다. 지금의 InsightForge는 그쪽에 서 있다.

## 결론

InsightForge를 예측 도구가 아니라 검증 우선순위 도구로 만든 이유는 단순하다.

초기 제품과 마케팅 의사결정에서 정말 필요한 것은 그럴듯한 정답이 아니라, 다음에 확인해야 할 위험한 가정을 찾는 일이다.

LLM synthetic panel은 그 일을 도울 수 있다. 하지만 고객을 대체한다고 말하는 순간, 도구의 가치보다 위험이 커진다.

그래서 나는 InsightForge를 이렇게 정의하고 있다.

> 모호한 시장 불확실성을, 사람이 검증할 수 있는 우선순위로 바꾸는 도구.

이 정의가 덜 화려하더라도, 실제 팀이 더 오래 믿고 쓸 수 있는 방향이라고 생각한다.

## 참고한 연구와 배경

이 글은 제품 빌드 로그이지만, 방향을 정할 때 참고한 연구 흐름은 분명히 있다.

- [Out of One, Many: Using Language Models to Simulate Human Samples](https://arxiv.org/abs/2209.06899)는 LLM이 조건화된 synthetic sample을 만들 수 있다는 가능성을 보여준다.
- [Large Language Models as Simulated Economic Agents](https://arxiv.org/abs/2301.07543)는 LLM을 경제적 행위자 시뮬레이션으로 볼 때 생기는 가능성과 한계를 생각하게 한다.
- [Using GPT for Market Research](https://www.hbs.edu/ris/Publication%20Files/23-062_1f58623a-ee21-44b9-a262-276047bc5543.pdf)는 마케팅 리서치 맥락에서 GPT 활용 가능성을 다룬다.
- [Synthetic Replacements for Human Survey Data?](https://www.cambridge.org/core/journals/political-analysis/article/synthetic-replacements-for-human-survey-data-the-perils-of-large-language-models/B92267DC26195C7F36E63EA04A47D2FE)는 synthetic survey를 실제 human survey 대체물로 다루는 위험을 경고한다.

내가 얻은 결론은 단순하다. 이 흐름은 제품적으로 쓸 수 있다. 하지만 “고객을 대체한다”는 방향이 아니라 “고객에게 무엇을 물어봐야 하는지 더 잘 정리한다”는 방향일 때 가장 안전하다.
