---
title: 'Mistral Voxtral TTS — 3-Second Voice Cloning, Open Weight, But No Japanese'
description: "Analyzing Mistral's 4B open-weight TTS model Voxtral. It beat ElevenLabs in human evaluations but lacks Japanese support, a dealbreaker for Asian markets."
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

On March 26, Mistral AI released Voxtral — a TTS model with 4B parameters, open weights, and voice cloning from just 3 seconds of audio. On specs alone, this is the most aggressive TTS announcement of the year.

I'd just spent the past two weeks comparing Chirp3 HD, Gemini TTS, and Edge TTS for a blog video automation pipeline. So when Voxtral dropped, my first reaction was "can I plug this into the pipeline?" The short answer: not yet. Here's why.

## Voxtral by the Numbers

Here's what Voxtral brings to the table:

- **Parameters**: 4B (Hugging Face: `mistralai/Voxtral-4B-TTS-2603`)
- **Latency**: 70ms model latency, streaming supported
- **Voice cloning**: Zero-shot/few-shot from a 3-second audio sample
- **Languages**: English, French, German, Spanish, Dutch, Portuguese, Italian, Hindi, Arabic — **9 languages**
- **License**: CC BY NC 4.0 (free for non-commercial use)
- **Commercial API**: $0.016 / 1,000 characters

It reportedly beat ElevenLabs Flash v2.5 in human evaluations. This is Mistral's own claim, so independent verification is needed, but publishing blind A/B test results at all signals confidence.

The 4B size is also noteworthy. Recent smartphone NPUs can handle 7-10B inference, making Voxtral a realistic candidate for on-device TTS. Not as tiny as [Kitten TTS](/en/blog/en/kitten-tts-v08-tiny-sota) (14M), but the quality-to-size ratio is compelling.

## TTS Engine Comparison: Engines I've Actually Used

Honestly, TTS comparison tables are meaningless from specs alone. The same "natural voice" can vary wildly in prosody, emotional expression, and per-language quality. Still, here's how Voxtral stacks up against the engines I evaluated for my pipeline:

| Feature | Voxtral | Gemini TTS (Charon) | ElevenLabs Flash v2.5 | Chirp3 HD |
|---------|---------|--------------------|-----------------------|-----------|
| Parameters | 4B | Undisclosed | Undisclosed | Undisclosed |
| Open weight | Yes (CC BY NC 4.0) | No | No | No |
| Voice cloning | 3s zero-shot | No | Yes (instant) | No |
| Japanese | **No** | Yes | Yes | Yes |
| Korean | No | Yes | Yes | Yes |
| On-device | Yes (4B) | No | No | No |
| Latency | 70ms | ~200ms | ~100ms | ~300ms |
| Price (1k chars) | $0.016 | $0.001~ | $0.30 | Free (limited) |

Two things jump out at me. First, Voxtral is the only one that's both open-weight and on-device capable. That's a value proposition no other engine can match. Second, Japanese and Korean are missing. More on that below.

## What 3-Second Voice Cloning Means

Voxtral's zero-shot voice cloning replicates a speaker's timbre, intonation, and pace from a single 3-second audio sample. Few-shot mode improves accuracy further.

```python
# Voice cloning via Voxtral API
import requests

response = requests.post(
    "https://api.mistral.ai/v1/audio/speech",
    headers={"Authorization": "Bearer YOUR_API_KEY"},
    json={
        "model": "voxtral-4b-tts-2603",
        "input": "Hello, this is a voice cloning demonstration.",
        "voice_sample": "base64_encoded_3sec_audio",  # 3-second sample
        "language": "en",
        "stream": True
    }
)
```

Where [KaniTTS2](/en/blog/en/kanitts2-voice-cloning) needed 3GB VRAM for voice cloning, Voxtral does it in one API call. Running locally means downloading weights from Hugging Face, but at 4B parameters, 8GB VRAM should suffice.

Honestly, I can't judge the actual quality of 3-second cloning without hearing it myself. Mistral's demo samples were impressive, but demos always showcase the best cases.

## The Critical Gap: Japanese and Korean

Here's the main point. Japanese is not in the 9 supported languages. Neither is Korean.

For someone like me who creates content primarily targeting the Japanese market, this isn't "disappointing" — it means "unusable." My blog video pipeline needs audio in 4 languages (ko, ja, en, zh), and Voxtral covers only English. Chinese is also missing.

Mistral is a French company, and the language list — European languages plus Hindi and Arabic — makes the market priorities clear. Asian language support is presumably on the roadmap, but right now, integration into our pipeline is a non-starter.

This is my biggest frustration with Voxtral. Not the model quality or architecture, but the language coverage that prevents me from even properly evaluating it.

## The License Catch

The CC BY NC 4.0 license also deserves attention. "Open weight" doesn't mean you can freely commercialize it.

- **Non-commercial**: Free, unrestricted use
- **Commercial**: Must use Mistral's API ($0.016/1k chars)
- **Fine-tuning**: You can download weights for research/personal fine-tuning, but commercial distribution of derivatives violates the license

This differs from Meta's Llama (community license) or Stability AI's models (open license). Mistral is using open weights as a marketing tool while monetizing through the API. Not a bad strategy, but expectations around the word "open" need calibrating.

## Who Should Use It

Bottom line — Voxtral is attractive if these conditions apply:

1. **English-centric projects**: English TTS quality is the top priority and you need open weights
2. **On-device TTS**: The 4B size is practical for mobile/edge deployment
3. **Voice cloning as a core feature**: 3-second zero-shot is competitive
4. **European multilingual needs**: Good choice if you need French, German, Spanish, etc.

For projects requiring Japanese, Korean, or Chinese, Gemini TTS or ElevenLabs remain the practical options. I plan to continue using Edge TTS (free, multilingual) and Gemini TTS (best quality) in my video pipeline for now. When Voxtral adds Asian languages, I'll revisit the evaluation.

I'm rooting for open-weight TTS as a direction. The speech synthesis space is developing the same dynamic as LLMs, where open models chase commercial services — and Voxtral is the strongest signal in that trend. But there's still distance between a signal and production deployment.
