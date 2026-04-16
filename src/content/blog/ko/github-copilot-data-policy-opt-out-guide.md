---
title: GitHub Copilot이 4월부터 내 코드로 AI를 학습한다 — 옵트아웃 안 하면 동의한 것
description: 'GitHub이 3월 25일 Copilot Free·Pro·Pro+ 사용자의 코드 스니펫과 채팅 인터랙션 데이터를 AI 모델 학습에 기본 사용하겠다고 발표했다. 4월 24일까지 설정 변경이 없으면 자동 동의로 처리된다. 옵트아웃 방법, 수집 데이터 범위, 개발자 실무 대응법을 정리한다.'
pubDate: '2026-03-27'
heroImage: ../../../assets/blog/github-copilot-data-policy-opt-out-guide-hero.jpg
tags:
  - github
  - copilot
  - privacy
  - ai
  - developer-tools
relatedPosts:
  - slug: ai-era-career-advice-for-juniors
    score: 0.92
    reason:
      ko: AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.
      ja: AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: Covers similar topics in AI/ML with comparable difficulty.
      zh: 在AI/ML领域涵盖类似主题，难度相当。
  - slug: gemini-31-pro-release
    score: 0.92
    reason:
      ko: AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.
      ja: AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: Covers similar topics in AI/ML with comparable difficulty.
      zh: 在AI/ML领域涵盖类似主题，难度相当。
  - slug: kanitts2-voice-cloning
    score: 0.91
    reason:
      ko: AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.
      ja: AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: Covers similar topics in AI/ML with comparable difficulty.
      zh: 在AI/ML领域涵盖类似主题，难度相当。
  - slug: openrouter-oss-dominance
    score: 0.91
    reason:
      ko: '다음 단계 학습으로 적합하며, AI/ML 주제에서 연결됩니다.'
      ja: 次のステップの学習に適しており、AI/MLのトピックで繋がります。
      en: >-
        Suitable as a next-step learning resource, connecting through AI/ML
        topics.
      zh: 适合作为下一步学习资源，通过AI/ML主题进行连接。
  - slug: windsurf-arena-mode-speed-over-accuracy
    score: 0.91
    reason:
      ko: AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.
      ja: AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: Covers similar topics in AI/ML with comparable difficulty.
      zh: 在AI/ML领域涵盖类似主题，难度相当。
draft: true
---

3월 25일, GitHub 블로그에 올라온 글 하나가 개발자 커뮤니티를 달궜다. 제목은 점잖았다 — "Updates to our Privacy Statement and Terms of Service." 하지만 내용은 꽤 직접적이다. **4월 24일부터 Copilot Free, Pro, Pro+ 사용자의 인터랙션 데이터가 AI 모델 학습에 기본값으로 사용된다.**

나는 이 소식을 The Register 기사에서 먼저 접했는데, 솔직히 첫 반응은 "드디어 올 게 왔구나"였다. 무료 플랜을 제공하면서 데이터를 안 쓰겠다는 건 원래 좀 이상했으니까.

## 정확히 뭐가 바뀌나

GitHub이 수집하겠다고 밝힌 데이터 유형은 생각보다 광범위하다:

- 코드 스니펫 (입력과 출력 모두)
- 사용자가 수락하거나 수정한 코드 제안
- 커서 주변의 코드 컨텍스트
- 주석과 문서
- 파일명과 레포지토리 구조
- Copilot Chat, 인라인 제안 등 기능별 인터랙션
- 제안에 대한 피드백 (👍/👎)

핵심은 이게 **기본 활성화(opt-out)** 방식이라는 점이다. 별도로 꺼두지 않으면 동의한 것으로 간주된다.

다만 GitHub은 몇 가지를 명확히 했다:

1. **Business, Enterprise 플랜은 해당 없음** — 조직 관리자가 기존에 설정한 정책이 유지된다
2. **프라이빗 레포의 소스 코드 자체는 학습에 안 쓴다** — "at rest" 상태의 코드는 대상이 아니라는 뜻
3. **서드파티 AI 모델 제공자에게 데이터를 공유하지 않는다** — GitHub/Microsoft 내부 학습 용도

2번이 좀 미묘한데, "at rest" 상태의 코드는 안 쓴다면서 Copilot이 그 코드를 읽고 제안을 생성하는 과정에서의 데이터는 수집한다는 거다. 실질적으로 프라이빗 코드가 학습에 간접적으로 기여할 수 있다는 뜻 아닌가? 이 부분은 개인적으로 좀 불편하다.

## 옵트아웃 방법

절차는 간단하다:

1. GitHub에 로그인
2. **Settings → Copilot → Features** 이동
3. Privacy 섹션에서 **"Allow GitHub to use my data for AI model training"** 비활성화

이전에 "제품 개선을 위한 데이터 수집"을 이미 거부했던 사용자는 그 설정이 유지된다고 한다. 하지만 한 번도 건드린 적 없다면, 4월 24일부터는 기본으로 켜져 있다.

한 가지 주의할 점 — Organization 소속 개인 계정은 조직 정책에 따라 이 설정이 보이지 않을 수 있다. 조직 관리자에게 확인하는 게 좋다.

## 왜 이게 문제인가 (그리고 왜 괜찮을 수도 있는가)

**문제라고 보는 시각:**

내가 작성한 코드 스니펫이 모델 학습에 들어간다는 건, 그 코드의 패턴이 다른 사람에게 제안될 수 있다는 뜻이다. 독자적인 알고리즘이나 비즈니스 로직이 포함된 코드라면 신경 쓸 수밖에 없다. 특히 프라이빗 레포에서 작업하는 개발자들에게는 "소스 코드 자체는 안 쓴다"는 말이 별로 안심이 안 될 수 있다.

**괜찮다고 보는 시각:**

현실적으로, Copilot은 이미 수십억 줄의 공개 코드로 학습되어 있고, 내 코드 스니펫 몇 줄이 모델에 통계적으로 유의미한 영향을 미칠 가능성은 매우 낮다. 그리고 인터랙션 데이터를 통한 학습은 "어떤 제안이 유용한지"를 개선하는 데 쓰이는 거라, 전체적인 도구 품질 향상에 기여한다.

나는 개인 프로젝트에서는 옵트아웃을 안 할 생각이다. Copilot이 더 나아지는 데 기여하는 셈이니까. 하지만 회사 코드에서는 반드시 확인할 거다.

## 더 큰 맥락에서 보면

이 정책 변경은 GitHub만의 일이 아니다. AI 도구를 무료나 저가로 제공하면서 사용자 데이터로 모델을 개선하는 패턴은 이제 업계 표준이 되어가고 있다. Google의 Gemini, Anthropic의 [Claude Code](/ko/blog/ko/claude-code-best-practices)도 비슷한 정책이 있거나 예정이다.

개발자 도구 시장에서 이게 특히 민감한 이유는, 코드가 곧 지적 재산이기 때문이다. [AI가 작성한 코드의 귀속을 추적하는 논의](/ko/blog/ko/cursor-agent-trace-ai-code-attribution)와도 맥락이 맞닿는다. 텍스트 대화와 코드는 성격이 다르다.

결국 각자가 판단해야 할 문제다. 옵트아웃 설정이 있다는 것 자체는 다행이지만, **기본값이 옵트인(수집 동의)이라는 선택**에 대해서는 비판이 있을 수밖에 없다. 사용자에게 능동적으로 선택하게 하는 옵트인 방식이 아니라, 모르면 자동 동의가 되는 옵트아웃 방식을 택한 건 아쉽다.

## 체크리스트: 지금 할 일

- [ ] GitHub Settings → Copilot → Features에서 데이터 학습 설정 확인
- [ ] 조직 관리자라면 Organization 정책에서 Copilot 데이터 정책 리뷰
- [ ] 팀원들에게 4월 24일 변경 사항 공유
- [ ] 프라이빗 레포에서 Copilot 사용 시 민감한 코드 노출 범위 재검토

4월 24일 전에 한 번만 확인하면 되는 일이다. 5분이면 된다.
