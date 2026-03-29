---
title: 'Mistral Voxtral TTS — 3초 보이스 클로닝에 오픈 웨이트, 그런데 일본어가 없다'
description: >-
  Mistral이 공개한 4B 파라미터 오픈 웨이트 TTS 모델 Voxtral을 분석한다. ElevenLabs를 인간 평가에서 이겼지만,
  일본어 미지원이라는 치명적 빈자리가 있다.
pubDate: '2026-03-29'
heroImage: ../../../assets/blog/mistral-voxtral-tts-open-weight-speech-hero.jpg
tags:
  - ai
  - tts
  - open-source
  - speech
  - mistral
relatedPosts:
  - slug: agents-md-effectiveness
    score: 0.95
    reason:
      ko: AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.
      ja: AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: Covers similar topics in AI/ML with comparable difficulty.
      zh: 在AI/ML领域涵盖类似主题，难度相当。
  - slug: claude-sonnet-46-release
    score: 0.95
    reason:
      ko: AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.
      ja: AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: Covers similar topics in AI/ML with comparable difficulty.
      zh: 在AI/ML领域涵盖类似主题，难度相当。
  - slug: functiongemma-270m-tool-calling
    score: 0.95
    reason:
      ko: AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.
      ja: AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: Covers similar topics in AI/ML with comparable difficulty.
      zh: 在AI/ML领域涵盖类似主题，难度相当。
  - slug: moltbook-ai-theater-human-control
    score: 0.95
    reason:
      ko: AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.
      ja: AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: Covers similar topics in AI/ML with comparable difficulty.
      zh: 在AI/ML领域涵盖类似主题，难度相当。
  - slug: ai-agent-persona-analysis
    score: 0.94
    reason:
      ko: AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.
      ja: AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: Covers similar topics in AI/ML with comparable difficulty.
      zh: 在AI/ML领域涵盖类似主题，难度相当。
---

3월 26일, Mistral AI가 Voxtral이라는 TTS 모델을 공개했다. 4B 파라미터, 오픈 웨이트, 3초 음성 샘플만으로 보이스 클로닝. 스펙만 보면 올해 TTS 씬에서 가장 공격적인 발표다.

나는 마침 지난 2주간 블로그 영상 자동화 파이프라인에서 Chirp3 HD, Gemini TTS, Edge TTS를 비교하느라 상당한 시간을 쏟았다. 그래서 Voxtral 발표를 보자마자 "이거 파이프라인에 넣을 수 있나?"가 첫 반응이었다. 결론부터 말하면, 아직은 못 넣는다. 이유가 있다.

## 숫자로 보는 Voxtral

Voxtral의 핵심 스펙을 정리하면 이렇다:

- **파라미터**: 4B (Hugging Face: `mistralai/Voxtral-4B-TTS-2603`)
- **레이턴시**: 모델 70ms, 스트리밍 지원
- **보이스 클로닝**: 3초 오디오 샘플로 zero-shot/few-shot 가능
- **지원 언어**: 영어, 프랑스어, 독일어, 스페인어, 네덜란드어, 포르투갈어, 이탈리아어, 힌디어, 아랍어 — **9개국어**
- **라이선스**: CC BY NC 4.0 (비상업적 용도 무료)
- **상용 API**: $0.016 / 1,000자

인간 평가(human evaluation)에서 ElevenLabs Flash v2.5를 이겼다고 한다. Mistral 측 발표이니 독립 검증은 필요하지만, 블라인드 A/B 테스트 결과를 공개한 것 자체는 자신감의 표현이다.

4B라는 사이즈도 눈에 띈다. 최근 스마트폰 NPU가 7~10B 추론을 감당하기 시작했으니, Voxtral은 온디바이스 TTS의 현실적인 후보다. Kitten TTS(14M)처럼 극한으로 작지는 않지만, 품질 대비 크기의 균형점이 흥미롭다.

## TTS 엔진 비교: 내가 실제로 써본 것들

솔직히 TTS 비교표는 스펙만으로는 의미가 없다. 같은 "자연스러운 음성"이라도 프로소디, 감정 표현, 언어별 품질 차이가 크다. 그래도 현재 내 파이프라인에서 검토했던 엔진들과 Voxtral을 놓고 보면:

| 항목 | Voxtral | Gemini TTS (Charon) | ElevenLabs Flash v2.5 | Chirp3 HD |
|------|---------|--------------------|-----------------------|-----------|
| 파라미터 | 4B | 비공개 | 비공개 | 비공개 |
| 오픈 웨이트 | O (CC BY NC 4.0) | X | X | X |
| 보이스 클로닝 | 3초 zero-shot | X | O (즉시) | X |
| 일본어 | **X** | O | O | O |
| 한국어 | X | O | O | O |
| 온디바이스 | O (4B) | X | X | X |
| 레이턴시 | 70ms | ~200ms | ~100ms | ~300ms |
| 가격 (1k자) | $0.016 | $0.001~ | $0.30 | 무료(제한) |

나는 이 표에서 두 가지가 눈에 들어온다. 첫째, Voxtral만이 오픈 웨이트이면서 온디바이스 가능하다. 이건 다른 엔진이 줄 수 없는 가치다. 둘째, 일본어와 한국어가 빠져 있다. 이 부분은 아래에서 더 다룬다.

## 3초 보이스 클로닝의 의미

Voxtral의 zero-shot 보이스 클로닝은 3초짜리 음성 샘플 하나로 화자의 음색, 억양, 속도를 복제한다. few-shot이면 더 정확해진다.

```python
# Voxtral API를 통한 보이스 클로닝 예시
import requests

response = requests.post(
    "https://api.mistral.ai/v1/audio/speech",
    headers={"Authorization": "Bearer YOUR_API_KEY"},
    json={
        "model": "voxtral-4b-tts-2603",
        "input": "Hello, this is a voice cloning demonstration.",
        "voice_sample": "base64_encoded_3sec_audio",  # 3초 샘플
        "language": "en",
        "stream": True
    }
)
```

이전에 다뤘던 KaniTTS2가 3GB VRAM으로 보이스 클로닝을 했다면, Voxtral은 API 한 줄이면 된다. 물론 로컬에서 돌리려면 Hugging Face에서 가중치를 받아 직접 추론해야 하는데, 4B 모델이니 8GB VRAM이면 충분할 것이다.

솔직히 3초 클로닝의 품질이 실제로 어느 수준인지는 직접 들어봐야 안다. Mistral 데모 페이지의 샘플은 인상적이었지만, 데모란 게 항상 베스트 케이스를 보여주는 법이다.

## 치명적 빈자리: 일본어와 한국어

여기서 본론이다. 9개 지원 언어에 일본어가 없다. 한국어도 없다.

나처럼 일본 시장을 주 타겟으로 콘텐츠를 만드는 사람에게 이건 "아쉽다" 수준이 아니라 "못 쓴다"는 뜻이다. 블로그 영상 파이프라인은 4개 국어(ko, ja, en, zh) 음성이 필요한데, Voxtral은 이 중 영어 하나만 커버한다. 중국어도 없다.

Mistral은 프랑스 회사이고, 지원 언어 목록을 보면 유럽 언어 + 힌디어 + 아랍어라는 구성이다. 시장 우선순위가 명확하다. 아시아 언어 지원은 로드맵에 있겠지만, 지금 당장은 우리 파이프라인에 통합할 수 없다.

이게 Voxtral에 대한 내 가장 큰 불만이다. 모델 자체의 품질이나 아키텍처가 아니라, 언어 커버리지 때문에 평가조차 제대로 못 한다.

## 라이선스의 함정

CC BY NC 4.0이라는 라이선스도 주의가 필요하다. "오픈 웨이트"라고 해서 자유롭게 상용화할 수 있는 게 아니다.

- **비상업적 용도**: 무료, 자유롭게 사용
- **상업적 용도**: 반드시 Mistral API($0.016/1k자)를 사용해야 함
- **파인튜닝**: 가중치를 받아서 연구/개인용 파인튜닝은 가능하지만, 결과물을 상업적으로 배포하면 라이선스 위반

이건 Meta의 Llama(커뮤니티 라이선스)나 Stability AI의 모델(오픈 라이선스)과는 다른 전략이다. Mistral은 오픈 웨이트를 마케팅 도구로 쓰면서, 실제 수익은 API에서 거두겠다는 구조다. 나쁜 전략은 아니지만, "오픈"이라는 단어에 대한 기대치를 조정할 필요가 있다.

## 누가 써야 하나

결론적으로 Voxtral은 다음 조건이 맞는 사람에게 매력적이다:

1. **영어 중심 프로젝트**: 영어 TTS 품질이 최우선이고, 오픈 웨이트가 필요한 경우
2. **온디바이스 TTS가 필요한 경우**: 4B 사이즈는 모바일/엣지 배포에 현실적이다
3. **보이스 클로닝이 핵심 기능인 경우**: 3초 zero-shot은 경쟁력 있다
4. **유럽 다국어 지원**: 프랑스어, 독일어, 스페인어 등이 필요하면 좋은 선택

반면 일본어, 한국어, 중국어가 필요한 프로젝트라면 현재로서는 Gemini TTS나 ElevenLabs가 현실적이다. 나는 당분간 영상 파이프라인에서 Edge TTS(무료, 다국어 지원)와 Gemini TTS(품질 최상)를 병행할 계획이다. Voxtral이 아시아 언어를 추가하면 그때 다시 평가할 생각이다.

오픈 웨이트 TTS라는 방향성 자체는 응원한다. 음성 합성 분야도 LLM처럼 오픈 모델이 상용 서비스를 추격하는 흐름이 만들어지고 있고, Voxtral은 그 흐름의 가장 강력한 신호탄이다. 다만 신호탄과 실전 배치 사이에는 아직 거리가 있다.
