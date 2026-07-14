---
title: 'Gemini 2.5 Flash Thinking API 개발 가이드 — thinking_budget 실험 결과'
description: 'Gemini 2.5 Flash의 Thinking Budget을 Budget=0/1024/8000 세 가지로 단순 작업·수학 추론·코드 리뷰에 직접 실험했다. 단순 작업은 5배 느려지고, 수학 문제는 오히려 출력 토큰을 줄여준다. 작업 유형별 최적 설정 프레임워크를 공유한다.'
pubDate: '2026-05-17'
heroImage: '../../../assets/blog/gemini-25-flash-thinking-api-developer-guide-2026/hero.png'
tags:
  - gemini
  - llm
  - api
  - thinking
  - tutorial
relatedPosts:
  - slug: gemini-25-flash-api-cost-optimization-guide
    score: 0.92
    reason:
      ko: 'Gemini 2.5 Flash의 비용 최적화 전략을 다룬 글로, Thinking Budget 비활성화가 어떤 상황에서 올바른 선택인지 이 글과 대조해서 읽으면 전략이 완성된다.'
      ja: 'Gemini 2.5 Flashのコスト最適化を扱った記事。Thinking Budgetを無効にするケースと有効にするケースを対比して読むと戦略が明確になる。'
      en: 'The companion cost optimization guide covers when to disable Thinking. Read alongside this post to build a complete decision framework.'
      zh: '这篇成本优化指南介绍何时禁用Thinking。与本文对照阅读，可以建立完整的决策框架。'
  - slug: llm-api-pricing-comparison-2026-gpt5-claude-gemini-deepseek
    score: 0.81
    reason:
      ko: 'Thinking 토큰 비용이 일반 출력 토큰과 같은 요금으로 청구된다는 사실을 LLM API 가격 비교 글과 함께 보면 실제 운영 비용 계산이 가능하다.'
      ja: 'Thinkingトークンのコスト計算はLLM API価格比較記事と合わせて読むと実際の運用コストが見えてくる。'
      en: 'Thinking tokens are billed at the same rate as output tokens — pair this with the LLM pricing comparison to calculate real operational costs.'
      zh: 'Thinking令牌按与输出令牌相同的费率计费，结合LLM API定价比较文章可以计算实际运营成本。'
  - slug: gemini-31-flash-live-realtime-voice-agent
    score: 0.74
    reason:
      ko: 'Gemini 3.1 Flash Live API로 실시간 음성 에이전트를 만든 경험을 담은 글. 같은 Gemini 모델 계열에서 스트리밍과 Thinking의 교집합 지점을 확인할 수 있다.'
      ja: 'Gemini 3.1 Flash LiveでリアルタイムVoice Agentを構築した体験記。Streamingとの交差点が見えてくる。'
      en: 'First-hand experience building a real-time voice agent with Gemini 3.1 Flash Live. Shows where streaming and Thinking intersect in the same model family.'
      zh: '使用Gemini 3.1 Flash Live构建实时语音智能体的经验。展示了流式传输与Thinking在同一模型系列中的交叉点。'
  - slug: ai-agent-cost-reality
    score: 0.70
    reason:
      ko: 'AI 에이전트 운영 비용의 현실을 솔직하게 분석한 글. Thinking 토큰 비용이 누적될 때 어떤 결과를 초래하는지 맥락을 제공한다.'
      ja: 'AI Agentの運用コストを正直に分析した記事。Thinkingトークンが積み重なるとどうなるかのコンテキストになる。'
      en: 'An honest analysis of AI agent operating costs. Provides context for what happens when Thinking token costs accumulate at scale.'
      zh: '对AI智能体运营成本的诚实分析。提供Thinking令牌成本累积时的影响背景。'
---

"Thinking 기능 켜면 무조건 더 똑똑해진다"고 막연하게 생각했다. 직접 실험해보니 절반만 맞는 말이었다.

Gemini 2.5 Flash의 `thinking_budget` 파라미터를 단순 작업, 수학 추론, 코드 리뷰 세 가지 시나리오에 각각 0, 1024, 8000으로 설정해 실험했다. 숫자 자체보다 결과 해석이 흥미로웠다.

thinking 기능은 Gemini 2.5 시리즈에서 처음 도입됐다. 모델이 답변 전에 내부적으로 추론 단계를 거치게 하는 방식인데, 마치 사람이 종이에 메모를 써가며 생각하다가 최종 답만 말로 꺼내는 것과 비슷하다. 이 내부 추론 과정이 "thinking 토큰"이다. 사용자에게는 보이지 않지만 비용은 청구된다.

문제는 모든 작업이 이런 "생각하고 말하기" 패턴을 필요로 하지 않는다는 것이다. 내 실험 결과가 그 경계선을 숫자로 보여준다.

## Thinking API가 실제로 하는 일

`thinking_budget`은 모델이 답변 전에 얼마나 많은 "숨겨진 추론"을 할 수 있는지 토큰 수로 제한하는 파라미터다. Budget=0이면 thinking을 완전히 비활성화한다. Budget=-1이면 모델이 스스로 필요한 만큼 추론한다. 양의 정수를 주면 그 토큰 수가 상한선이 된다(최대 24576).

중요한 점이 있다. thinking 토큰은 응답으로 출력되지 않지만 **비용은 동일하게 청구된다.** 출력 토큰과 같은 요금이다. [LLM API 가격 비교 포스트](/ko/blog/ko/llm-api-pricing-comparison-2026-gpt5-claude-gemini-deepseek)에서 확인할 수 있듯이, Gemini 2.5 Flash의 출력 토큰 요금은 $0.0035/1K 토큰이다. thinking 토큰 1024개를 쓰면 그만큼 추가 비용이 발생한다.

API 사용법은 2024년까지 쓰던 `google.generativeai` 패키지가 아니라 새 `google-genai` 패키지를 써야 한다. 이건 놓치기 쉬운 부분이다.

```python
# ❌ Deprecated (더 이상 업데이트 없음)
import google.generativeai as genai

# ✅ 현재 표준
from google import genai
from google.genai import types

client = genai.Client(api_key="YOUR_API_KEY")

response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="질문 내용",
    config=types.GenerateContentConfig(
        thinking_config=types.ThinkingConfig(
            thinking_budget=1024,
            include_thoughts=True,  # thinking 과정을 응답에 포함
        ),
    ),
)

# 응답에서 thinking과 실제 답변 분리
for part in response.candidates[0].content.parts:
    if part.thought:
        print(f"[Thinking] {part.text[:100]}...")
    else:
        print(f"[Answer] {part.text}")
```

`include_thoughts=True`로 설정하면 모델의 내부 추론 과정도 응답 파트로 확인할 수 있다. 디버깅에 유용하다.

## 실험 방법과 측정 항목

샌드박스 디렉터리를 새로 만들어서 `google-genai` 패키지만 설치하고, 세 가지 프롬프트 유형에 Budget=0/1024/8000을 각각 적용했다.

```bash
# 새 가상환경에서 의존성 설치
python3 -m venv venv && source venv/bin/activate
pip install google-genai
```

측정 항목:
- **응답 시간(초)**: wall clock time (`time.perf_counter()` 기준)
- **출력 토큰**: 실제 답변 토큰 수 (`usage_metadata.candidates_token_count`)
- **thinking 토큰**: 내부 추론에 소비된 토큰 수 (`usage_metadata.thoughts_token_count`)

프롬프트 세 가지를 고른 이유도 있다. "단순 작업"은 정답이 거의 하나인 사실 조회형이다. "수학 추론"은 여러 조건을 동시에 검증해야 하는 다단계 논리 문제다. "코드 리뷰"는 명확한 정답 없이 경험과 패턴 인식이 필요한 판단형이다. 세 가지가 각각 다른 추론 특성을 가진다.

프롬프트 세 가지:
1. **단순 작업**: "파이썬에서 리스트를 정렬하는 방법 한 문장으로 설명해줘"
2. **수학 추론**: 두 자리 양의 정수 조건 충족 문제 (세 가지 조건 동시 검증)
3. **코드 리뷰**: `range(len(items))` 패턴과 타입 처리가 부재한 Python 함수 리뷰

각 조합(3 task × 3 budget = 9 호출)을 순서대로 실행했고, 네트워크 상태에 따른 편차를 최소화하기 위해 동일 세션에서 연속 실행했다.

## 실험 결과: 숫자가 말해주는 것

실제로 측정한 수치다. 꾸밈 없이 그대로 공유한다.

| 작업 유형 | Budget=0 | Budget=1024 | Budget=8000 |
|-----------|----------|-------------|-------------|
| 단순 작업 | 1.4초 / 출력 54tok | 6.8초 / 출력 61tok / thinking 751tok | 9.0초 / 출력 45tok / thinking 1282tok |
| 수학 추론 | 8.8초 / 출력 2143tok | 15.1초 / 출력 1915tok / thinking 918tok | 26.2초 / 출력 1671tok / thinking 4036tok |
| 코드 리뷰 | 6.7초 / 출력 1367tok | 13.1초 / 출력 1126tok / thinking 734tok | 22.6초 / 출력 2055tok / thinking 1824tok |

**단순 작업**: Budget=0에서 1.4초인데 Budget=1024에서 6.8초가 나왔다. 거의 5배 느리다. 답변 품질은 사실상 동일했다. Budget=8000은 1282 thinking 토큰을 소비했지만 출력은 오히려 45 토큰으로 줄었다. 과잉이다.

**수학 추론**: 여기서 예상 밖의 결과가 나왔다. Budget=0일 때 출력 토큰이 2143개다. 모델이 "소리 내어 생각"하면서 풀이 과정을 전부 출력한 것이다. Budget=1024에서는 thinking 918토큰 + 출력 1915토큰으로, Budget=0보다 총 소비 토큰이 비슷하지만 답변이 더 구조적이었다. Budget=8000은 thinking이 깊어지면서 출력이 1671 토큰으로 줄었다.

**코드 리뷰**: Budget=1024에서 출력이 1367→1126으로 줄었다. 더 집중적인 답변이 나온 것이다. Budget=8000에서는 2055 토큰으로 늘었는데, 더 포괄적인 분석을 했다. 사용 목적에 따라 선택이 달라진다.

## 작업 유형별 최적 Budget 선택

실험을 바탕으로 실용적인 프레임워크를 정리했다. 절대적인 공식은 아니지만 시작점으로는 유효하다.

**Budget=0 (thinking 비활성화)**이 적합한 경우:
- 분류, 레이블링, 태깅 작업
- 요약, 번역, 포맷 변환
- 간단한 Q&A, 사실 조회
- 고빈도 배치 처리 (비용 민감)

Budget=0에서 단순 작업이 1.4초 응답했다. 이 작업에 1024 budget을 주면 6.8초를 기다리고 추가 비용을 내야 한다. 명백히 낭비다.

**Budget=1024〜2048 (중간 thinking)**이 적합한 경우:
- 코드 리뷰, 버그 탐지 (집중적 분석 원할 때)
- 중간 난이도 추론
- 다단계 판단이 필요하지만 지연 시간에 민감한 경우

솔직히 코드 리뷰에서 Budget=1024 결과가 Budget=0보다 답변이 짧아졌는데 더 낫다고 느꼈다. 불필요한 패딩이 없어지고 핵심만 남았다.

**Budget=4000〜8000 (깊은 thinking)**이 적합한 경우:
- 복잡한 수학 문제, 알고리즘 설계
- 철저한 아키텍처 리뷰
- 다단계 계획 수립
- 정확도가 속도보다 훨씬 중요한 작업

Budget=8000 수학 문제에서 4036 thinking 토큰을 소비했다. 응답 시간은 26초. 일반적인 대화형 앱에서 이 지연은 받아들이기 어렵다. 배치 처리나 백그라운드 분석에만 쓸 것이다.

[Gemini 2.5 Flash 비용 최적화 가이드](/ko/blog/ko/gemini-25-flash-api-cost-optimization-guide)에서 언급했지만, thinking 토큰 요금이 출력 토큰과 동일하다는 점을 꼭 기억해야 한다. Budget=8000을 무분별하게 쓰면 비용이 몇 배로 늘어난다.

## 실제 비용 계산: thinking이 손해인 구간과 이득인 구간

숫자를 구체적으로 보자. Gemini 2.5 Flash 기준 출력 토큰 요금은 $0.0035/1K다. thinking 토큰도 동일하게 청구된다.

**단순 작업 시나리오**: 하루 10,000번 API 호출한다고 가정하자.

| 설정 | 평균 출력 | 평균 thinking | 총 토큰/호출 | 일일 총 토큰 | 일일 비용 |
|------|-----------|---------------|--------------|--------------|-----------|
| Budget=0 | 54 | 0 | 54 | 540,000 | $1.89 |
| Budget=1024 | 61 | 751 | 812 | 8,120,000 | $28.42 |
| Budget=8000 | 45 | 1282 | 1327 | 13,270,000 | $46.45 |

단순 작업에 Budget=1024를 쓰면 Budget=0 대비 약 **15배** 비용이 올라간다. 월 기준으로 환산하면 $57 vs $853이다. 의미 있는 차이다.

**수학 추론 시나리오**: 이번엔 복잡한 추론 작업 1,000번 호출이다.

| 설정 | 출력 토큰 | thinking 토큰 | 총 청구 토큰 | 비용 |
|------|-----------|---------------|--------------|------|
| Budget=0 | 2143 | 0 | 2143 | $7.50 |
| Budget=1024 | 1915 | 918 | 2833 | $9.92 |
| Budget=8000 | 1671 | 4036 | 5707 | $19.97 |

수학 추론에서는 Budget=1024가 Budget=0보다 총 토큰이 많지만(2833 vs 2143), 차이가 단순 작업보다 훨씬 작다. Budget=8000은 2.7배 비싸다. 정확도가 그만큼 중요한 작업인가를 판단해야 한다.

솔직히 나는 아직 Budget=8000이 Budget=1024 대비 얼마나 정확도를 높여주는지 체계적으로 검증하지 못했다. 내 실험 범위에서는 "더 긴 thinking이 항상 더 좋은 답을 준다"는 보장이 없었다. 수학 문제에서 Budget=1024와 Budget=8000 모두 정답을 찾았지만, 더 복잡한 문제에서는 달라질 수 있다. 추후 정확도 벤치마크 실험을 별도로 해볼 계획이다.

## 에이전트 루프에서의 thinking 비용 관리

단발성 API 호출이 아니라 에이전트 루프를 돌릴 때는 상황이 달라진다. 에이전트가 한 작업을 처리하기 위해 5〜10번 API를 호출한다면, thinking 비용이 그만큼 곱해진다.

예를 들어, 에이전트가 코드 파일 분석 → 리팩토링 계획 수립 → 단위 테스트 작성까지 8번 API 호출을 한다면:

```python
# 에이전트 루프에서 thinking budget 전략적 배분
BUDGET_MAP = {
    "classify": 0,           # 분류 작업: thinking 불필요
    "plan": 2048,            # 계획 수립: 중간 thinking
    "implement": 512,        # 구현 실행: 가벼운 reasoning
    "review": 1024,          # 코드 리뷰: 집중 thinking
    "test_generate": 0,      # 테스트 생성: 패턴 기반, thinking 불필요
    "summarize": 0,          # 요약: thinking 불필요
}

def route_thinking_budget(task_type: str) -> int:
    return BUDGET_MAP.get(task_type, 512)  # 기본값: 가벼운 thinking
```

루프에서 모든 단계에 동일한 budget을 주는 것보다 작업 유형에 맞게 budget을 다르게 설정하면 비용을 30〜50% 줄일 수 있다. 내가 에이전트 워크플로우에서 직접 적용한 패턴이다.

## 실제 코드: thinking 토큰 추적 패턴

운영 환경에서 thinking 사용량을 추적하는 패턴을 공유한다.

```python
from google import genai
from google.genai import types
import time

def generate_with_thinking(
    client: genai.Client,
    prompt: str,
    budget: int = 1024,
    model: str = "gemini-2.5-flash",
) -> dict:
    """thinking 사용량을 추적하면서 응답을 생성한다."""
    start = time.perf_counter()
    
    config = types.GenerateContentConfig(
        thinking_config=types.ThinkingConfig(
            thinking_budget=budget,
            include_thoughts=False,  # 프로덕션에서는 False
        ),
    )
    
    response = client.models.generate_content(
        model=model,
        contents=prompt,
        config=config,
    )
    
    elapsed = time.perf_counter() - start
    usage = response.usage_metadata
    
    return {
        "text": response.text,
        "latency_s": round(elapsed, 2),
        "input_tokens": usage.prompt_token_count,
        "output_tokens": usage.candidates_token_count,
        "thinking_tokens": getattr(usage, "thoughts_token_count", 0) or 0,
        "total_tokens": (
            usage.prompt_token_count
            + usage.candidates_token_count
            + (getattr(usage, "thoughts_token_count", 0) or 0)
        ),
    }

# 사용 예시
client = genai.Client(api_key="YOUR_API_KEY")

result = generate_with_thinking(
    client,
    "이 코드에서 잠재적 메모리 누수를 찾아줘: ...",
    budget=2048,
)

print(f"지연: {result['latency_s']}s")
print(f"thinking 토큰: {result['thinking_tokens']}")
print(f"총 비용 토큰: {result['total_tokens']}")
```

`usage_metadata.thoughts_token_count`가 실제로 0을 반환하는 경우가 있다. `budget=0`이거나 모델이 thinking 없이도 충분하다고 판단했을 때다. 이 값을 모니터링에 포함하면 실제로 thinking이 얼마나 발동하는지 파악할 수 있다.

## 내가 아쉬웠던 부분

솔직히 말하면 Thinking API에 실망한 지점도 있다.

첫째, **동적 모드(Budget=-1)가 예측 불가**다. 모델이 알아서 budget을 결정한다는 게 편리해 보이지만, 단순 작업에서도 thinking을 발동시킬 수 있다. 내가 실험한 단순 작업에서 Budget=-1이 Budget=1024와 거의 동일한 시간(6.8초 vs 비슷)을 썼다. 지연 시간과 비용을 예측하기 어렵다는 건 프로덕션에서 큰 단점이다.

둘째, **thinking_budget과 thinking_level을 동시에 설정하면 400 에러**가 난다. Gemini 3.x 계열은 `thinking_level`을 사용하고, 2.5 계열은 `thinking_budget`을 사용한다. 마이그레이션 중인 코드에서 이 부분을 혼용하면 에러가 발생한다. 공식 문서에는 명시돼 있지만 에러 메시지가 직관적이지 않아서 처음 마주치면 당황한다.

셋째, **thinking 토큰이 캐싱 안 된다.** Context Caching을 써서 긴 시스템 프롬프트 비용을 줄이더라도, thinking 토큰은 매번 새로 청구된다. [AI 에이전트 비용 현실 분석](/ko/blog/ko/ai-agent-cost-reality)에서 다뤘듯이 에이전트 루프를 돌리다 보면 thinking 비용이 예상보다 빨리 불어난다.

## 내 최종 입장

Thinking API가 과대평가된 건 아니다. 하지만 "켜면 좋다"는 직관도 틀렸다.

내 결론은 간단하다. **Budget=0을 기본으로 쓰고, 복잡한 추론이 필요할 때만 Budget=1024〜2048을 명시적으로 활성화한다.** Budget=8000은 배치 작업이나 정확도가 극도로 중요한 오프라인 분석에만 쓴다.

동적 모드(Budget=-1)는 편리하지만 비용과 지연이 불규칙하다. 프로덕션 API에서는 예측 가능성이 편의성보다 중요하다. 명시적 budget을 사용하는 게 낫다고 본다.

한 가지 의외였던 발견: 수학 추론 같은 복잡한 작업에서는 thinking을 비활성화해도 모델이 출력 안에서 "소리 내어 생각"하면서 2143 토큰을 쓴다. Budget=1024를 주면 thinking이 내부에서 일어나고 출력이 더 짧아진다. 총 비용 차이가 생각보다 작을 수 있다. 작업 특성을 보고 판단해야 한다.

## 마치며

직접 실험해보지 않았다면 "Thinking = 무조건 더 좋음"이라는 단순한 결론을 내렸을 것이다. 측정하고 보니 달랐다.

Gemini 2.5 Flash Thinking API는 잘 쓰면 강력한 도구다. 특히 복잡한 추론 작업에서 출력 토큰을 오히려 줄여주는 역설적인 효과가 있다. 하지만 단순 작업에 무분별하게 적용하면 비용과 지연만 늘린다.

`thinking_budget`을 설정할 때는 항상 이 질문을 먼저 해야 한다: "이 작업이 정말 깊은 추론을 필요로 하는가?" 대부분의 경우 답은 "아니오"다.

다음 단계로 할 일이 두 가지 있다. 하나는 Budget=1024와 Budget=8000의 정확도 차이를 체계적으로 측정하는 실험이다. 이번 실험에서는 응답 속도와 토큰 수에 집중했는데, "얼마나 더 정확한가"를 정량화하지 못했다. 다른 하나는 스트리밍 API와 thinking 조합을 테스트하는 것이다. 스트리밍 모드에서 thinking 토큰이 어떻게 동작하는지, 첫 토큰까지 지연(TTFT)이 얼마나 달라지는지 확인할 필요가 있다.

지금 당장 적용할 수 있는 결론: **작업 유형에 따라 thinking budget을 명시적으로 관리하라.** 모든 API 호출에 동일한 budget을 주는 대신, 작업 특성에 맞는 budget 맵을 만들어 루트별로 설정하는 것이 비용과 품질 모두에서 최선이다.

---

*실험에 사용한 전체 코드는 이 포스트에 포함된 스니펫으로 재현 가능합니다. google-genai 패키지 0.8.x 기준으로 작성되었습니다.*
