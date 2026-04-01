---
title: Sora 종료와 AI 비디오 시장의 급격한 재편 — Google Veo 4가 빈자리를 노린다
description: >-
  OpenAI가 Sora 앱 종료를 발표했다. 하루 100만 달러 적자, 유저 50만 이하 붕괴의 전말과 함께 Google Veo 4 임박,
  Runway·Kling의 부상이 AI 비디오 시장을 어떻게 재편하는지 실전 워크플로우 관점에서 분석한다.
pubDate: '2026-04-01'
heroImage: ../../../assets/blog/sora-shutdown-ai-video-market-reshaping-veo4-hero.jpg
tags:
  - ai-video
  - sora
  - google-veo
  - content-creation
  - workflow
relatedPosts:
  - slug: mistral-voxtral-tts-open-weight-speech
    score: 0.88
    reason:
      ko: 'AI 비디오의 음성 레이어에 관심이 있다면, 오픈 웨이트 TTS 모델의 현주소와 일본어 지원 한계를 다룬 이 글이 워크플로우 설계에 도움됩니다.'
      ja: 'AI動画の音声レイヤーに興味があれば、オープンウェイトTTSモデルの現状と日本語対応の課題を扱ったこの記事がワークフロー設計に役立ちます。'
      en: 'If you care about the audio layer of AI video, this post on open-weight TTS models and their language support gaps helps with workflow design.'
      zh: '如果你关注AI视频的音频层，这篇关于开源TTS模型现状和日语支持局限的文章对工作流设计很有帮助。'
  - slug: ai-presentation-automation
    score: 0.85
    reason:
      ko: 'Sora의 비디오 자동화와 유사한 맥락에서, AI를 활용한 발표 자료 제작 자동화의 실전 경험과 비용 절감 효과를 비교해볼 수 있습니다.'
      ja: 'Soraの動画自動化と類似した文脈で、AIを活用したプレゼン資料作成の自動化の実践経験とコスト削減効果を比較できます。'
      en: 'In a similar vein to Sora video automation, compare practical experiences and cost savings from AI-powered presentation creation.'
      zh: '在与Sora视频自动化类似的背景下，可以比较AI驱动的演示文稿制作自动化的实践经验和成本节约效果。'
  - slug: gpt-54-computer-use-1m-context-engineering-impact
    score: 0.82
    reason:
      ko: 'Sora 종료와 동시에 발표된 GPT-5.4의 컴퓨터 사용 기능이 OpenAI의 전략적 피벗을 이해하는 데 핵심적인 맥락을 제공합니다.'
      ja: 'Sora終了と同時に発表されたGPT-5.4のコンピュータ操作機能が、OpenAIの戦略的ピボットを理解する上で重要な文脈を提供します。'
      en: 'GPT-5.4 computer use, announced alongside Sora shutdown, provides crucial context for understanding OpenAI strategic pivot.'
      zh: '与Sora关停同时发布的GPT-5.4计算机使用功能，为理解OpenAI的战略转向提供了关键背景。'
  - slug: kitten-tts-v08-tiny-sota
    score: 0.78
    reason:
      ko: 'AI 비디오 파이프라인에서 TTS는 필수 컴포넌트입니다. 25MB 미만 초소형 TTS 모델의 가능성을 다룬 이 글이 경량 워크플로우 구축에 참고가 됩니다.'
      ja: 'AI動画パイプラインでTTSは必須コンポーネントです。25MB未満の超小型TTSモデルの可能性を扱ったこの記事が軽量ワークフロー構築の参考になります。'
      en: 'TTS is essential in AI video pipelines. This post on sub-25MB SOTA TTS models is relevant for building lightweight video workflows.'
      zh: 'TTS是AI视频管道中的必要组件。这篇关于25MB以下SOTA TTS模型的文章对构建轻量级工作流很有参考价值。'
  - slug: gemini-31-flash-live-realtime-voice-agent
    score: 0.76
    reason:
      ko: 'Veo 4와 같은 Google AI 생태계의 실시간 음성 에이전트 기능을 다뤘는데, Google의 멀티모달 AI 전략의 전체 그림을 이해하는 데 도움됩니다.'
      ja: 'Veo 4と同じGoogleAIエコシステムのリアルタイム音声エージェント機能を扱っており、Googleのマルチモーダル AI戦略の全体像を理解するのに役立ちます。'
      en: 'Covers real-time voice agents in the same Google AI ecosystem as Veo 4, helping you understand the full picture of Google multimodal AI strategy.'
      zh: '介绍了与Veo 4同属Google AI生态的实时语音代理功能，有助于理解Google多模态AI战略的全貌。'
---

OpenAI가 Sora 앱을 4월 26일자로 종료한다. API는 9월 24일까지 유지되지만, 사실상 철수 선언이다.

나는 솔직히 이 뉴스를 보고 "역시"라는 생각이 먼저 들었다. Sora가 처음 공개됐을 때의 데모 영상은 충격적이었지만, 실제로 써보면 얘기가 달라졌다. 생성 시간이 길고, 원하는 결과를 얻기까지 반복 시행착오가 너무 많았다. 무엇보다 월 $20짜리 구독으로는 만족스러운 품질의 영상을 뽑기 어려웠다.

## 하루 100만 달러 적자의 실체

TechCrunch의 보도에 따르면, Sora는 피크 시점에도 유료 사용자가 50만 명을 넘지 못했다. 하루 운영 비용이 약 100만 달러에 달했는데, 이는 GPU 인프라 비용만으로도 감당하기 어려운 수준이었다.

재미있는 건 OpenAI의 전략적 피벗이다. 소비자 비디오 생성에서 손을 떼고, 엔터프라이즈 코딩 에이전트(Codex)에 집중하겠다는 방향 전환. GPT-5.4 출시와 맞물려 "플랫폼 회사"로의 전환이 가속되는 모양새다.

개인적으로 이게 합리적인 판단이라고 본다. AI 비디오 생성은 아직 "제품"이 되기엔 이른 시장이다. 누구나 텍스트 한 줄로 영화급 영상을 만들 수 있다는 비전은 매력적이지만, 현실은 프롬프트 엔지니어링에 30분, 생성에 5분, 수정에 또 30분이 걸리는 구조였다.

## Google Veo 4가 빈자리를 노린다

타이밍이 절묘하다. Sora 종료 발표 직후, Google DeepMind가 Veo 4를 I/O 2026 전후에 공개할 것이라는 루머가 돌고 있다. 이미 NotebookLM의 Video Overview 기능에 Veo 3가 탑재되어 있고, 품질이 꽤 괜찮다.

현재 AI 비디오 생성 도구의 지형을 정리하면 이렇다:

| 도구 | 상태 | 강점 | 약점 |
|------|------|------|------|
| Sora | 4/26 앱 종료, 9/24 API 종료 | 높은 영상 품질 | 느린 생성, 높은 비용 |
| Google Veo 3/4 | Veo 3 서비스 중, Veo 4 임박 | Google 생태계 통합, NotebookLM 연동 | 아직 독립 앱 없음 |
| Runway Gen-4 | 운영 중 | 에디터 통합, 세밀한 제어 | 가격이 비쌈 |
| Kling 2.0 | 운영 중 | 가성비, 빠른 생성 | 품질 편차가 큼 |
| Pika 2.5 | 운영 중 | 사용 편의성 | 긴 영상에 약함 |

## "제품 vs 기능" — Sora 실패의 구조적 원인

Sora의 실패를 단순히 "기술이 부족했다"로 설명하긴 어렵다. 기술 자체는 인상적이었다. 문제는 비즈니스 모델이다.

AI 비디오 생성은 독립 제품보다 **기존 워크플로우에 통합되는 기능**으로서의 가치가 더 크다. NotebookLM이 Video Overview를 "기능"으로 넣은 것, Runway가 영상 편집 도구 안에 AI 생성을 포함시킨 것이 이 방향의 예시다.

반면 Sora는 "텍스트 → 비디오" 단일 기능을 독립 앱으로 제공했다. 이건 마치 "AI 이미지 생성"만을 위한 독립 앱을 만드는 것과 비슷한데, DALL-E가 ChatGPT 안에 통합되면서 성공한 것과 대비된다. Sora는 ChatGPT에 깊이 통합되지 못한 채 별도 앱으로 남았고, 결국 사용자 유지에 실패했다.

하지만 이 분석에도 한계가 있다. Runway도 독립 앱이지만 잘 되고 있으니까. 차이점이 있다면 Runway는 영상 편집이라는 명확한 워크플로우 안에 AI를 녹여냈다는 점이다.

## Sora에서 이탈하는 개발자/크리에이터를 위한 워크플로우

Sora API를 사용하고 있었다면 9월까지 마이그레이션을 해야 한다. 내가 추천하는 대안 워크플로우는 용도별로 다르다:

**기술 콘텐츠 제작 (블로그 → 영상)**
- NotebookLM Video Overview + Gemini TTS로 자동 생성
- Remotion으로 브랜딩 인트로/아웃트로 추가
- 이 조합이면 별도 비디오 생성 AI 없이도 꽤 괜찮은 결과물이 나온다

**마케팅/광고 영상**
- Runway Gen-4가 현재 가장 안정적
- 세밀한 프레임 제어가 필요하면 유일한 선택지

**SNS 숏폼 콘텐츠**
- Kling 2.0이 가성비 최강
- 15초 이하 클립은 품질도 충분

```bash
# NotebookLM + Remotion 기반 워크플로우 예시
# 1. NotebookLM으로 비디오 생성
nlm studio_create --notebook-id $NB_ID --artifact-type video

# 2. 생성 완료 대기
nlm studio_status --notebook-id $NB_ID --artifact-id $ART_ID

# 3. 다운로드 후 Remotion으로 인트로/아웃트로 합성
nlm download_artifact --notebook-id $NB_ID --artifact-id $ART_ID
npx remotion render src/index.ts MainVideo --props='{"videoPath":"./downloaded.mp4"}'
```

## 앞으로 6개월의 관전 포인트

솔직히 AI 비디오 시장은 아직 초기 단계고, 승자를 예측하기엔 이르다. 하지만 몇 가지 확실한 트렌드는 있다:

1. **통합이 독립을 이긴다**: 독립 AI 비디오 앱보다 기존 플랫폼에 통합되는 형태가 생존한다
2. **실시간 생성이 핵심**: 5분 기다려서 영상 하나 받는 UX로는 대중화가 어렵다
3. **Google의 유리한 고지**: YouTube + NotebookLM + Veo라는 수직 통합이 강력하다

나는 Veo 4가 게임 체인저가 될 거라고 기대하진 않는다. 다만 Sora가 빠진 자리를 Google이 가장 빠르게 채울 수 있는 위치에 있다는 건 분명하다. 특히 NotebookLM이 이미 Video Overview를 제공하고 있어서, 별도 앱 출시 없이도 기존 사용자를 자연스럽게 흡수할 수 있다.

AI 비디오 생성 도구를 프로덕션에 사용하고 있다면, 지금은 특정 벤더에 올인하기보다 **출력 포맷을 표준화하고 도구 교체가 쉬운 파이프라인**을 만들어 두는 게 현명하다. Sora의 사례가 보여주듯, 이 시장에서 어떤 도구가 내년까지 살아남을지는 아무도 모른다.
