---
title: Gemini 3.1 Flash Live로 실시간 음성 에이전트 만들기 — 써보니 이런 느낌
description: >-
  Google이 공개한 Gemini 3.1 Flash Live의 실시간 음성·영상 에이전트 구축 기능을 분석합니다. API 구조, 도구 호출,
  90개 언어 지원 등 실제 개발자 관점에서 가능성과 한계를 짚어봅니다.
pubDate: '2026-03-28'
heroImage: ../../../assets/blog/gemini-31-flash-live-realtime-voice-agent-hero.jpg
tags:
  - ai
  - google
  - voice-agent
  - realtime
  - gemini
  - api
relatedPosts:
  - slug: data-driven-pm-framework
    score: 0.95
    reason:
      ko: 'AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: 'Covers similar topics in AI/ML, architecture with comparable difficulty.'
      zh: 在AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: meta-ai-agent-platform-sierra-avocado
    score: 0.95
    reason:
      ko: '자동화, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, architecture with comparable
        difficulty.
      zh: 在自动化、AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: ai-agent-kpi-ethics
    score: 0.94
    reason:
      ko: 'AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: 'Covers similar topics in AI/ML, architecture with comparable difficulty.'
      zh: 在AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: ai-agent-persona-analysis
    score: 0.94
    reason:
      ko: 'AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: 'Covers similar topics in AI/ML, architecture with comparable difficulty.'
      zh: 在AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: anthropic-agent-skills-standard
    score: 0.94
    reason:
      ko: '자동화, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, architecture with comparable
        difficulty.
      zh: 在自动化、AI/ML、架构领域涵盖类似主题，难度相当。
draft: true
---

Google AI Studio에서 새 모델 이름이 보였다. `gemini-3.1-flash-live-preview`. "또 하나 나왔네" 하고 넘기려다 스펙 시트를 열어보고 멈췄다. 오디오 입력을 받아 오디오로 바로 응답하는 모델인데, 도구 호출(function calling)까지 실시간 대화 중에 된다고? 3월 26일 공개된 이 모델을 하루 만져본 소감을 정리한다.

## 무엇이 달라졌나

이전 모델인 2.5 Flash Native Audio와 비교할 때 핵심 변화는 세 가지다.

**첫째, 레이턴시가 확 줄었다.** Google은 구체 수치를 공개하진 않았지만 "fewer awkward pauses"라고 표현했고, 실제로 써보면 응답 시작까지 체감 딜레이가 눈에 띄게 짧다.

**둘째, 대화 컨텍스트가 두 배로 늘었다.** 입력 토큰 131,072개. 긴 회의 녹음을 통째로 넣고 실시간으로 질문하는 시나리오가 현실적이 됐다.

**셋째, 도구 호출이 실시간 대화 중에 동작한다.** ComplexFuncBench Audio 벤치마크에서 90.8%를 기록했다. 음성으로 "오늘 서울 날씨 알려줘"라고 말하면 모델이 함수를 호출하고, 결과를 음성으로 돌려주는 흐름이 하나의 스트림 안에서 일어난다.

## API 구조 한눈에 보기

| 항목 | 스펙 |
|------|------|
| 모델 ID | `gemini-3.1-flash-live-preview` |
| 입력 | 텍스트, 이미지, 오디오, 비디오 |
| 출력 | 텍스트, 오디오 |
| 입력 토큰 | 131,072 |
| 출력 토큰 | 65,536 |
| Function Calling | 지원 |
| Thinking | 지원 (minimal/low/medium/high) |
| Search Grounding | 지원 |
| 지원 언어 | 90개 이상 |

`thinkingLevel` 파라미터가 재미있다. `minimal`로 설정하면 레이턴시를 최소화하고, `high`로 올리면 복잡한 추론을 시키는 대신 응답이 느려진다. 음성 에이전트 특성상 기본값이 `minimal`인 것도 합리적이다.

## 실제로 만져본 느낌

Google AI Studio에서 Live API를 켜고 마이크를 연결하면 바로 대화가 가능하다. 나는 이게 가장 인상적이었다 — 별도 인프라 없이 브라우저에서 음성 에이전트 프로토타입을 뚝딱 만들 수 있다는 점. 한국어로 말해봤는데 인식률은 꽤 괜찮았다. 다만 긴 문장에서 가끔 중간이 잘리는 현상이 있었고, 배경 소음 필터링은 확실히 이전보다 나아졌다.

Function calling을 붙여서 간단한 날씨 API를 연동해봤다. 음성으로 요청하면 함수가 호출되고, 결과가 음성으로 돌아온다. 이 과정이 하나의 WebSocket 세션 안에서 끊김 없이 이뤄진다는 게 핵심이다. 다만 비동기 함수 호출은 아직 지원하지 않는다 — 외부 API 응답이 느리면 사용자가 침묵을 견뎌야 한다. [Vercel AI SDK로 스트리밍 에이전트](/ko/blog/ko/vercel-ai-sdk-claude-streaming-agent-2026)를 구현할 때도 비동기 도구 호출 처리가 핵심 UX 과제 중 하나다.

## 2.5에서 마이그레이션할 때 주의점

기존 2.5 Flash Native Audio를 쓰던 프로젝트를 올릴 때 몇 가지 변경이 있다.

- 모델 문자열 업데이트 (`gemini-3.1-flash-live-preview`)
- Thinking 설정 방식 변경 (`thinkingLevel` 파라미터 사용)
- 서버 이벤트 하나에 여러 content part가 올 수 있음 — 파싱 로직 수정 필요
- 비동기 function calling은 여전히 미지원

## 솔직한 한계

나는 솔직히 몇 가지가 아쉽다.

**Structured Output 미지원.** 음성 에이전트라고 해도 백엔드에서는 JSON으로 받고 싶은 경우가 많다. 현재는 텍스트+오디오 출력만 가능해서 후처리가 필요하다.

**캐싱 미지원.** 실시간 대화 특성상 같은 질문이 반복될 수 있는데, 캐싱이 안 되면 비용이 쌓인다. 프로덕션에서는 앞단에 자체 캐시 레이어를 두어야 할 것이다.

**프리뷰 단계의 불안정성.** Rate limit이 얼마인지, 가격이 얼마인지 아직 명확하지 않다. 프로덕션에 올리기엔 시기상조다.

**경쟁 구도.** OpenAI의 Realtime API도 이미 비슷한 기능을 제공하고 있고, Anthropic도 음성 인터페이스를 준비 중이라는 루머가 있다. Flash Live가 "가장 좋다"고 단정할 수 있는 비교 벤치마크가 아직 부족하다. [AI 에이전트 통신 프로토콜 비교](/ko/blog/ko/mcp-vs-a2a-vs-open-responses-agent-protocol-comparison-2026)에서처럼, 어떤 스택이 최선인지는 사용 사례에 따라 달라진다.

## 어디에 쓸 수 있을까

현실적으로 당장 적용 가능한 시나리오:

- **사내 음성 FAQ 봇**: 영업팀이 제품 스펙을 음성으로 물어보면 바로 답변. Function calling으로 사내 DB 연동. [Meta AI가 Sierra와 구축하는 엔터프라이즈 에이전트 플랫폼](/ko/blog/ko/meta-ai-agent-platform-sierra-avocado)이 지향하는 방향과 맞닿아 있다.
- **다국어 고객 응대**: 90개 언어 지원이라 글로벌 서비스의 1차 응대에 유용. 다만 품질은 언어마다 편차가 클 것.
- **실시간 회의 어시스턴트**: 긴 컨텍스트 윈도우를 활용해 회의 중 실시간으로 요약이나 액션 아이템 추출.

반면 의료 상담이나 금융 거래 같은 고신뢰성 시나리오는 아직 무리다. 프리뷰 모델의 할루시네이션 리스크를 감수할 영역이 아니다.

## 정리

Gemini 3.1 Flash Live는 "음성 에이전트를 만드는 허들"을 상당히 낮춰준 모델이다. 특히 도구 호출이 실시간 음성 스트림에 통합된 점은 이전 세대와의 결정적 차이다. 하지만 프리뷰 단계라 가격·안정성·제약 사항이 아직 불투명하고, structured output이나 캐싱 같은 프로덕션 필수 기능이 빠져 있다.

나는 이 모델이 "음성 AI 에이전트 프로토타이핑 도구"로는 현재 가장 접근하기 쉬운 선택지라고 본다. 프로덕션은 GA 이후에 다시 평가해야 할 일이지만, 지금 당장 Google AI Studio에서 마이크를 켜고 가능성을 확인해볼 가치는 충분하다.
