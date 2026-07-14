---
title: Gemma 4를 로컬에서 돌려봤다 — 8B 모델이 함수 호출까지 해내는 시대
description: >-
  Google이 Apache 2.0으로 공개한 Gemma 4를 Ollama로 직접 설치해 한국어, 구조화 출력, 함수 호출까지 테스트했다.
  9.6GB짜리 로컬 모델이 에이전트 파이프라인의 빌딩 블록이 될 수 있을까?
pubDate: '2026-04-06'
heroImage: ../../../assets/blog/gemma-4-local-agent-edge-ai-hero.jpg
tags:
  - gemma
  - google
  - open-source
  - local-llm
  - ai-agent
  - function-calling
relatedPosts:
  - slug: claude-code-insights-usage-analysis
    score: 0.95
    reason:
      ko: '자동화, AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: 'Covers similar topics in automation, AI/ML with comparable difficulty.'
      zh: 在自动化、AI/ML领域涵盖类似主题，难度相当。
  - slug: greptile-ai-coding-report-2025-review
    score: 0.94
    reason:
      ko: '자동화, AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: 'Covers similar topics in automation, AI/ML with comparable difficulty.'
      zh: 在自动化、AI/ML领域涵盖类似主题，难度相当。
  - slug: openai-agentkit-tutorial-part1
    score: 0.94
    reason:
      ko: '자동화, AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: 'Covers similar topics in automation, AI/ML with comparable difficulty.'
      zh: 在自动化、AI/ML领域涵盖类似主题，难度相当。
  - slug: sora-shutdown-ai-video-market-reshaping-veo4
    score: 0.94
    reason:
      ko: '자동화, AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: 'Covers similar topics in automation, AI/ML with comparable difficulty.'
      zh: 在自动化、AI/ML领域涵盖类似主题，难度相当。
  - slug: ai-presentation-automation
    score: 0.93
    reason:
      ko: '자동화, AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: 'Covers similar topics in automation, AI/ML with comparable difficulty.'
      zh: 在自动化、AI/ML领域涵盖类似主题，难度相当。
---

`ollama pull gemma4` — 이 한 줄로 9.6GB 모델이 내 맥북에 내려왔다.

4월 2일, Google이 Gemma 4를 Apache 2.0 라이선스로 공개했다. E2B부터 31B Dense까지 4가지 사이즈인데, 내가 관심을 가진 건 기본 8B 모델이다. "엣지에서 에이전트를 돌린다"는 마케팅 문구가 어디까지 진짜인지 궁금했기 때문이다.

## 설치는 정말 한 줄이었다

```bash
ollama pull gemma4
# 약 9.6GB 다운로드, Q4_K_M 양자화
```

`ollama show gemma4`로 확인하면 지원 기능 목록이 나온다:

```
Capabilities
  completion
  vision
  audio
  tools
  thinking
```

솔직히 놀랐다. 8B 모델에 비전, 오디오, 도구 호출, 그리고 thinking까지. Gemma 3에는 없던 기능들이 한꺼번에 들어왔다.

## 한국어는 쓸 만하다, 다만 "그냥 쓸 만한" 수준

한국어로 자기소개를 시켜봤다.

> 안녕하세요. 저는 사용자님의 질문에 정확하고 신속하게 답변해 드리는 AI입니다.

문법적으로는 정확하다. 140개 언어를 지원한다고 하는데, 한국어 품질은 Claude나 GPT-5 계열과 비교하면 아직 격차가 있다. 복잡한 맥락이나 뉘앙스를 요구하는 질문에서는 피상적인 답변이 나오는 경우가 많다. 하지만 로컬에서 오프라인으로 돌아가는 8B 모델이라는 점을 감안하면 나쁘지 않다.

## 진짜 놀라운 건 Function Calling이다

나는 이번 Gemma 4에서 가장 의미 있는 변화가 네이티브 function calling이라고 본다. 실제로 Ollama API를 통해 테스트해봤다:

```bash
curl -s http://localhost:11434/api/chat -d '{
  "model": "gemma4",
  "messages": [{"role": "user", "content": "도쿄 날씨 알려줘"}],
  "tools": [{
    "type": "function",
    "function": {
      "name": "get_weather",
      "description": "도시의 현재 날씨 조회",
      "parameters": {
        "type": "object",
        "properties": {
          "city": {"type": "string", "description": "도시명"}
        },
        "required": ["city"]
      }
    }
  }],
  "stream": false
}'
```

응답:

```json
{
  "role": "assistant",
  "content": "",
  "thinking": "1. 사용자가 도쿄 날씨를 물었다...\n2. get_weather 도구가 적합하다...",
  "tool_calls": [{
    "function": {
      "name": "get_weather",
      "arguments": {"city": "Tokyo"}
    }
  }]
}
```

주목할 점이 두 가지다:
1. **thinking 필드가 같이 나온다** — 모델이 왜 이 도구를 선택했는지 추론 과정이 보인다
2. **도구 호출이 깔끔하다** — 파라미터를 올바른 JSON 형태로 뽑아낸다

이게 왜 중요하냐면, 지금까지 로컬 LLM으로 에이전트를 만들려면 function calling을 프롬프트 엔지니어링으로 우회해야 했다. "아래 형식으로 출력해줘"라는 시스템 프롬프트를 쓰고, 출력을 파싱하고, 실패하면 재시도하는 식이었다. Gemma 4는 그 과정이 필요 없다.

## 구조화 출력도 잘 된다

JSON 형식 출력도 테스트해봤다:

```bash
echo 'Answer in JSON: {"capital": "<answer>"}. What is the capital of France?' \
  | ollama run gemma4
# → {"capital": "Paris"}
```

개인적으로 이 정도면 [MCP 서버의 로컬 백엔드](/ko/blog/ko/mcp-server-build-practical-guide-2026)로 쓸 수 있겠다는 생각이 든다. 외부 API 호출 없이 사내 데이터를 처리하는 에이전트를 만들 때, [보안이 중요한 환경](/ko/blog/ko/mcp-gateway-agent-traffic-control)에서 특히 가치가 있다.

## 그래서 실제로 뭘 만들 수 있나

내가 생각하는 현실적인 활용 시나리오는 세 가지다:

**1. 오프라인 코드 리뷰 에이전트**
— Git diff를 입력으로 받아 코드 리뷰 코멘트를 생성하는 로컬 에이전트. 소스코드가 외부로 나가면 안 되는 환경에서 유용하다.

**2. 사내 문서 검색 + 요약**
— RAG 파이프라인의 LLM 부분을 Gemma 4로 대체. 128K 컨텍스트 윈도우가 있어서 꽤 긴 문서도 처리 가능하다.

**3. IoT/엣지 디바이스의 자연어 인터페이스**
— E2B(2B) 모델은 라즈베리파이 5에서도 돌아간다고 한다. 스마트홈 컨트롤러에 자연어 명령을 추가하는 식의 프로토타입이 가능해진다.

## 솔직히 아쉬운 점

나는 Gemma 4가 "로컬 에이전트의 시대가 열렸다"고 선언하기엔 아직 이르다고 생각한다.

첫째, **8B 모델의 추론 품질 한계**가 명확하다. 단순한 도구 호출은 잘 하지만, 멀티 스텝 추론이 필요한 복잡한 에이전트 태스크에서는 실수가 잦을 것이다. Arena AI 리더보드에서 31B 모델이 오픈모델 3위라고 하지만, 8B와 31B의 격차는 상당하다.

둘째, **벤치마크와 실전의 괴리**. OSWorld나 Arena 점수가 좋아도, 실제 업무 환경에서의 안정성은 별개 문제다. 특히 한국어처럼 영어 이외의 언어에서는 체감 성능이 더 떨어진다.

셋째, **양자화 품질 문제**. 내가 받은 건 Q4_K_M 양자화 버전인데, 원본 FP16 대비 얼마나 성능이 떨어지는지 공식적으로 공개된 데이터가 없다. 4-bit 양자화의 품질 저하는 추론 능력이 필요한 태스크에서 더 크게 느껴질 수 있다.

## 결론 대신

Gemma 4를 반나절 만져본 소감은 이렇다: **"드디어 로컬 LLM도 에이전트 도구로 쓸 수 있게 됐다. 다만 아직은 보조 역할이다."**

내 워크플로우에서 당장 적용할 곳을 찾자면, 보안이 중요한 내부 데이터 처리나 오프라인 환경의 간단한 에이전트 태스크 정도다. 주력 에이전트를 Claude나 GPT-5.4에서 Gemma 4로 교체하겠다는 건 아직 무리가 있다.

그래도 Apache 2.0 라이선스에 네이티브 function calling을 지원하는 8B 모델이 나왔다는 사실 자체가 의미 있다. 1년 전만 해도 이 수준의 기능을 로컬에서 기대하기 어려웠다. `ollama pull gemma4` 한 줄이면 누구나 시작할 수 있으니, 직접 돌려보고 자신의 유스케이스에서 판단하는 걸 추천한다.
