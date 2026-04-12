---
title: Claude Mythos Preview — AI가 '너무 잘해서' 공개를 못 한다는 게 말이 되나
description: >-
  Anthropic이 SWE-bench 93.9%를 찍은 Claude Mythos Preview를 일반 공개하지 않기로 했다. 27년 된
  OpenBSD 취약점까지 찾아낸 이 모델은 Project Glasswing을 통해 12개 기업에만 제공된다. 이게 진짜 책임감인지, 아니면
  영리한 마케팅인지.
pubDate: '2026-04-09'
heroImage: ../../../assets/blog/claude-mythos-preview-glasswing-ai-cybersecurity-hero.jpg
tags:
  - anthropic
  - claude-mythos
  - cybersecurity
  - ai-governance
  - project-glasswing
relatedPosts:
  - slug: devstral-qwen3-coder-small-models
    score: 0.93
    reason:
      ko: '다음 단계 학습으로 적합하며, AI/ML, 아키텍처 주제에서 연결됩니다.'
      ja: 次のステップの学習に適しており、AI/ML、アーキテクチャのトピックで繋がります。
      en: >-
        Suitable as a next-step learning resource, connecting through AI/ML,
        architecture topics.
      zh: 适合作为下一步学习资源，通过AI/ML、架构主题进行连接。
  - slug: gemini-31-pro-release
    score: 0.93
    reason:
      ko: AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.
      ja: AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: Covers similar topics in AI/ML with comparable difficulty.
      zh: 在AI/ML领域涵盖类似主题，难度相当。
  - slug: gpt4o-retirement-model-dependency-risk
    score: 0.93
    reason:
      ko: '다음 단계 학습으로 적합하며, AI/ML, 아키텍처 주제에서 연결됩니다.'
      ja: 次のステップの学習に適しており、AI/ML、アーキテクチャのトピックで繋がります。
      en: >-
        Suitable as a next-step learning resource, connecting through AI/ML,
        architecture topics.
      zh: 适合作为下一步学习资源，通过AI/ML、架构主题进行连接。
  - slug: nvidia-llm-inference-cost-reduction
    score: 0.93
    reason:
      ko: '다음 단계 학습으로 적합하며, AI/ML, 아키텍처 주제에서 연결됩니다.'
      ja: 次のステップの学習に適しており、AI/ML、アーキテクチャのトピックで繋がります。
      en: >-
        Suitable as a next-step learning resource, connecting through AI/ML,
        architecture topics.
      zh: 适合作为下一步学习资源，通过AI/ML、架构主题进行连接。
  - slug: ai-distillation-attacks-enterprise-defense
    score: 0.93
    reason:
      ko: '다음 단계 학습으로 적합하며, AI/ML, 아키텍처 주제에서 연결됩니다.'
      ja: 次のステップの学習に適しており、AI/ML、アーキテクチャのトピックで繋がります。
      en: >-
        Suitable as a next-step learning resource, connecting through AI/ML,
        architecture topics.
      zh: 适合作为下一步学习资源，通过AI/ML、架构主题进行连接。
---

4월 7일, Anthropic이 Claude Mythos Preview를 발표했다. SWE-bench Verified 93.9%. USAMO 2026에서 97.6%. 모든 주요 벤치마크에서 GPT-5.4를 넘었다.

그런데 이 모델을 일반 공개하지 않는다고 한다.

이유? "사이버 보안 능력이 너무 강력해서." 모든 주요 OS와 웹 브라우저에서 수천 개의 제로데이 취약점을 자동으로 찾아냈기 때문이라고 한다. OpenBSD에서 27년 동안 숨어있던 원격 크래시 버그, FFmpeg에서 자동화 도구가 500만 번 테스트해도 못 찾은 16년 된 버그, 리눅스 커널 권한 상승 익스플로잇 체인까지.

나는 이 발표를 보고 두 가지 생각이 동시에 들었다. "와, 진짜 대단하네"와 "이거 너무 깔끔한 스토리 아닌가?"

## Project Glasswing이라는 이름

Anthropic은 Mythos Preview를 Project Glasswing이라는 프로그램을 통해 12개 기업에만 제공한다. Amazon, Apple, Google, Microsoft, Nvidia — 이름만 봐도 빅테크 올스타다. Palo Alto Networks, CrowdStrike, Cloudflare, Cisco, Broadcom 같은 보안 기업도 포함됐다.

$1억 규모의 사용 크레딧을 제공하면서 "방어적 사이버 보안 용도로만 쓰라"는 조건을 붙였다.

Glasswing은 투명한 날개를 가진 나비 종류다. "투명하게 운영하겠다"는 의미를 담은 것 같은데, 솔직히 이름 짓기를 잘한다고 생각했다. 기술 기업의 브랜딩 능력은 정말 배울 게 많다.

## 벤치마크를 좀 뜯어보면

Mythos Preview의 숫자들은 확실히 인상적이다. Claude 모델의 [소스코드 유출 사건으로 드러난 내부 아키텍처 분석](/ko/blog/ko/claude-code-source-leak-analysis)과 함께 보면, 이 성능 점프가 어디서 왔는지 더 잘 이해된다.

- <strong>SWE-bench Verified</strong>: 93.9% (Opus 4.6은 80.8%, GPT-5.4는 대략 73%)
- **SWE-bench Pro**: 77.8%
- **USAMO 2026**: 97.6% (Opus 4.6 42.3%, GPT-5.4 95.2%)
- **GPQA Diamond**: GPT-5.4 대비 +1.7pt
- **HLE with tools**: GPT-5.4 대비 +12.6pt

Opus 4.6에서 Mythos로의 점프가 13포인트라는 건, 한 세대 내에서 나오기 어려운 폭이다. 이 정도면 아키텍처 수준에서 뭔가 달라졌을 가능성이 높다.

그런데 내가 주목하는 건 벤치마크 숫자보다 "자율적으로 취약점을 찾고 익스플로잇까지 개발했다"는 부분이다. Anthropic의 레드팀 보고서에 따르면, 테스트 중에 모델이 예상치 못한 행동을 보였다고 한다. 격리 환경을 우회하거나, 지시 없이 익스플로잇을 자율적으로 시연한 경우도 있었다고.

이건 벤치마크 점수와는 차원이 다른 이야기다.

## "공개하지 않겠다"의 진짜 의미

여기서 좀 비판적으로 봐야 할 부분이 있다.

Anthropic은 "위험하니까 공개하지 않는다"고 했지만, 실제로는 12개 빅테크에 $1억 크레딧과 함께 배포하고 있다. 이건 "공개하지 않는" 게 아니라 "선택적으로 공개하는" 거다. 받는 쪽은 세계에서 가장 자원이 풍부한 기업들이고, 크레딧까지 받으니 사실상 무료 체험 마케팅에 가깝다.

나는 이게 나쁜 결정이라고 보지는 않는다. 오히려 현실적인 판단이라고 생각한다. 다만 "책임감 있는 AI 기업"이라는 프레이밍이 좀 과하다는 거다. 보안 기업 12곳에 1억 달러치 크레딧을 뿌리는 건, 엔터프라이즈 시장 공략의 정석이기도 하니까.

Simon Willison은 [자신의 블로그](https://simonwillison.net/2026/Apr/7/project-glasswing/)에서 "제한적 공개가 필요해 보인다"고 평가했는데, 나도 그 판단 자체에는 동의한다. 문제는 이런 결정의 기준이 Anthropic 한 회사에 있다는 점이다.

## Glasswing 패러독스

Picus Security가 이걸 잘 짚었다. ["모든 것을 부술 수 있는 것이 모든 것을 고치는 것이기도 하다."](https://www.picussecurity.com/resource/blog/anthropics-project-glasswing-paradox)

Mythos가 찾아낸 취약점들은 진짜다. 27년 된 OpenBSD 버그가 지금까지 살아있었다는 건, 기존의 보안 감사 체계가 놓치고 있었다는 뜻이다. 그리고 이런 버그를 AI가 자동으로 찾을 수 있다면, 공격자 쪽에서도 비슷한 능력을 가진 모델을 만드는 건 시간문제일 뿐이다.

AI 시스템에서 의도치 않은 정보가 노출되는 위험은 [AI 디스틸레이션 공격과 엔터프라이즈 방어 전략](/ko/blog/ko/ai-distillation-attacks-enterprise-defense)에서 다룬 것처럼 이미 현실적인 위협이 됐다. 그래서 Anthropic의 선택지는 사실 두 가지밖에 없었다고 본다:

1. 공개해서 모두가 방어 도구로 쓸 수 있게 하되, 공격에도 쓰일 위험을 감수한다
2. 제한 공개해서 방어자에게 먼저 시간을 준다

Anthropic은 2번을 골랐다. 합리적인 선택이지만, 이건 "방어자"가 빅테크 12곳이라는 전제가 깔려 있다. 중소기업이나 오픈소스 프로젝트의 보안은 이 구도에서 빠져 있다.

## 이 흐름이 어디로 가는지

Claude가 Firefox에서 22개 CVE를 찾아낸 게 몇 달 전이다. 그때도 "AI가 보안 감사를 바꾼다"는 이야기가 나왔는데, Mythos는 그 수준을 완전히 다른 차원으로 끌어올렸다.

개인적으로 기대되는 건, 이런 능력이 결국 민주화될 수밖에 없다는 점이다. 지금은 Project Glasswing 참여 기업만 쓸 수 있지만, 1〜2년 안에 비슷한 수준의 오픈소스 보안 에이전트가 나올 거라고 본다. 이미 Opus 4.6 수준에서도 상당한 보안 감사가 가능하니까. AI 모델 공급망 보안이 실제로 어떻게 공격받을 수 있는지는 [LiteLLM 공급망 공격 분석](/ko/blog/ko/litellm-supply-chain-attack-ai-dependency-security)에서 구체적인 사례를 확인할 수 있다.

그때까지 해야 할 건, 자기 코드베이스의 보안 부채를 줄이는 거다. 27년 된 버그가 OpenBSD에도 있었다면, 우리 프로젝트에 없다고 장담할 수 있는 사람은 아무도 없다.

Anthropic이 Mythos를 "너무 위험해서 공개 못 한다"고 포장한 건 영리하다. 하지만 진짜 질문은 다른 데 있다. AI가 이 수준의 보안 능력을 갖게 된 지금, "누가 이 도구에 접근할 수 있는가"가 곧 보안 격차를 결정한다는 것이다.

그리고 그 접근권은 지금, $1억 크레딧과 함께 12개 기업에만 돌아갔다.
