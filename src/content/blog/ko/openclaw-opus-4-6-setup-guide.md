---
title: 【긴급】OpenClaw에 Claude Opus 4.6 설정하기
description: >-
  Claude Opus 4.6을 OpenClaw에서 사용하기 위한 설정 방법. 100만 토큰 컨텍스트, 128K 출력을 활용하는 설정을 그대로
  복사해서 쓸 수 있습니다.
pubDate: '2026-02-06'
heroImage: ../../../assets/blog/openclaw-opus-4-6-setup-guide-hero.jpg
tags:
  - openclaw
  - claude-opus
  - ai-tools
  - configuration
relatedPosts:
  - slug: claude-code-insights-usage-analysis
    score: 0.94
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
  - slug: mcp-servers-toolkit-introduction
    score: 0.94
    reason:
      ko: '자동화, AI/ML, DevOps 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、DevOps分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, DevOps with comparable
        difficulty.
      zh: 在自动化、AI/ML、DevOps领域涵盖类似主题，难度相当。
  - slug: openai-agentkit-tutorial-part1
    score: 0.94
    reason:
      ko: '자동화, AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: 'Covers similar topics in automation, AI/ML with comparable difficulty.'
      zh: 在自动化、AI/ML领域涵盖类似主题，难度相当。
  - slug: anthropic-agent-skills-practical-guide
    score: 0.92
    reason:
      ko: '다음 단계 학습으로 적합하며, 자동화, AI/ML, DevOps 주제에서 연결됩니다.'
      ja: 次のステップの学習に適しており、自動化、AI/ML、DevOpsのトピックで繋がります。
      en: >-
        Suitable as a next-step learning resource, connecting through
        automation, AI/ML, DevOps topics.
      zh: 适合作为下一步学习资源，通过自动化、AI/ML、DevOps主题进行连接。
---

## 왜 「긴급」인가

2026년 2월 5일, Anthropic이 Claude Opus 4.6을 출시했습니다. **100만 토큰 컨텍스트**, **128K 토큰 출력**, 강화된 계획 능력과 자기 수정 능력.

OpenClaw 사용자라면 지금 바로 설정해서 쓰고 싶을 겁니다.

이 글에서는 **설정 파일을 그대로 복붙해서 바로 실행할 수 있는** 최단 경로를 소개합니다.

## 사전 조건

- OpenClaw 설치 완료 (`npm install -g openclaw@latest`)
- Anthropic API 키 설정 완료 (`claude setup-token`)

아직이라면 [공식 문서](https://docs.openclaw.ai/start/getting-started)를 참고하세요.

## 설정 파일 편집

`~/.openclaw/openclaw.json` 파일을 열고, 다음 2개 섹션을 추가/수정합니다.

### 1. models — Opus 4.6 모델 정의

```json
"models": {
  "mode": "merge",
  "providers": {
    "anthropic": {
      "baseUrl": "https://api.anthropic.com",
      "api": "anthropic-messages",
      "models": [
        {
          "id": "claude-opus-4-6",
          "name": "Claude Opus 4.6",
          "reasoning": true,
          "input": ["text", "image"],
          "contextWindow": 1000000,
          "maxTokens": 128000
        }
      ]
    }
  }
}
```

**포인트**:
- `mode: "merge"` — OpenClaw 내장 모델 카탈로그에 **추가**하는 방식 (덮어쓰기 아님)
- `reasoning: true` — Opus 4.6의 추론 모드 활성화
- `contextWindow: 1000000` — 100만 토큰 풀 컨텍스트
- `maxTokens: 128000` — 128K 토큰 롱 출력

### 2. agents — 기본 모델 지정

```json
"agents": {
  "defaults": {
    "model": {
      "primary": "anthropic/claude-opus-4-6",
      "fallbacks": [
        "anthropic/claude-opus-4-5"
      ]
    },
    "contextTokens": 1000000
  }
}
```

**포인트**:
- `primary` — 모든 세션에서 Opus 4.6을 기본 사용
- `fallbacks` — Opus 4.6 사용 불가 시 Opus 4.5로 폴백
- `contextTokens: 1000000` — 에이전트가 100만 토큰 컨텍스트를 풀 활용

## 설정 적용

설정을 저장한 후, **2단계**가 필요합니다.

### Step 1: Gateway 재시작

```bash
openclaw gateway restart
```

설정 파일이 다시 로드됩니다.

### Step 2: 새 세션 시작

기존 세션에는 이전 모델 설정이 남아 있습니다. 채팅에서 다음을 입력하세요:

```
/new
```

`/reset`도 가능합니다. **새 세션을 시작하지 않으면 새 모델이 적용되지 않습니다.**

## 설정 확인

올바르게 설정됐는지 확인합니다:

```bash
openclaw models status
```

`anthropic/claude-opus-4-6`이 primary 모델로 표시되면 성공입니다.

채팅에서도 확인 가능합니다:

```
/model status
```

## 정리

1. `openclaw.json`의 `models`와 `agents` 섹션 편집
2. `openclaw gateway restart`로 재시작
3. `/new`로 새 세션 시작
4. `openclaw models status`로 확인

끝. 100만 토큰 컨텍스트의 세계에 오신 것을 환영합니다.

## 참고 자료

- [OpenClaw 공식 문서 — Models](https://docs.openclaw.ai/concepts/models)
- [OpenClaw 공식 문서 — Model Providers](https://docs.openclaw.ai/concepts/model-providers)
- [OpenClaw GitHub](https://github.com/openclaw/openclaw)
- [Anthropic 공식 — Claude Opus 4.6](https://www.anthropic.com)
