---
title: 내가 사용하는 MCP 서버 도구 모음 완벽 가이드
description: >-
  Claude Code 개발 생산성을 극대화하는 7가지 MCP 서버 설정과 활용법. Serena, Context7, Sequential
  Thinking 등 실전 경험 공유
pubDate: '2025-11-23'
heroImage: ../../../assets/blog/mcp-servers-toolkit-introduction-hero.jpg
tags:
  - mcp
  - claude-code
  - productivity
relatedPosts:
  - slug: openai-agentkit-tutorial-part1
    score: 0.94
    reason:
      ko: '자동화, AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: 'Covers similar topics in automation, AI/ML with comparable difficulty.'
      zh: 在自动化、AI/ML领域涵盖类似主题，难度相当。
  - slug: claude-code-cli-migration-guide
    score: 0.93
    reason:
      ko: '다음 단계 학습으로 적합하며, 자동화, AI/ML, DevOps, 아키텍처 주제에서 연결됩니다.'
      ja: 次のステップの学習に適しており、自動化、AI/ML、DevOps、アーキテクチャのトピックで繋がります。
      en: >-
        Suitable as a next-step learning resource, connecting through
        automation, AI/ML, DevOps, architecture topics.
      zh: 适合作为下一步学习资源，通过自动化、AI/ML、DevOps、架构主题进行连接。
  - slug: jules-autocoding
    score: 0.93
    reason:
      ko: '다음 단계 학습으로 적합하며, 자동화, AI/ML, DevOps, 아키텍처 주제에서 연결됩니다.'
      ja: 次のステップの学習に適しており、自動化、AI/ML、DevOps、アーキテクチャのトピックで繋がります。
      en: >-
        Suitable as a next-step learning resource, connecting through
        automation, AI/ML, DevOps, architecture topics.
      zh: 适合作为下一步学习资源，通过自动化、AI/ML、DevOps、架构主题进行连接。
  - slug: n8n-rss-automation
    score: 0.92
    reason:
      ko: '다음 단계 학습으로 적합하며, 자동화, AI/ML, DevOps, 아키텍처 주제에서 연결됩니다.'
      ja: 次のステップの学習に適しており、自動化、AI/ML、DevOps、アーキテクチャのトピックで繋がります。
      en: >-
        Suitable as a next-step learning resource, connecting through
        automation, AI/ML, DevOps, architecture topics.
      zh: 适合作为下一步学习资源，通过自动化、AI/ML、DevOps、架构主题进行连接。
  - slug: claude-code-best-practices
    score: 0.92
    reason:
      ko: '자동화, AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: 'Covers similar topics in automation, AI/ML with comparable difficulty.'
      zh: 在自动化、AI/ML领域涵盖类似主题，难度相当。
---

## 개요

MCP(Model Context Protocol)는 AI 코딩 에이전트가 외부 도구와
통신하기 위한 표준 프로토콜이다.
Claude Code에서 MCP 서버를 활용하면 코드 분석, 문서 검색,
브라우저 자동화 등 다양한 기능을 AI 에이전트에 통합할 수 있다.

MCP의 핵심 가치는 <strong>컨텍스트의 확장</strong>이다.
LLM은 학습 데이터의 시점에 갇혀 있지만,
MCP 서버를 통해 실시간 정보에 접근하고
외부 시스템과 상호작용할 수 있다.

이 글에서는 내가 실제로 사용하는 7가지 MCP 서버를 소개한다.
각 서버의 역할, 도입 이유, 실제 설정 방법을 공유하겠다.

## 내가 사용하는 MCP 서버들

### 1. Serena (코드 분석)

<strong>역할</strong>: LSP(Language Server Protocol) 기반의
시맨틱 코드 분석 도구

Serena는 코드베이스를 구조적으로 이해한다.
단순 텍스트 검색이 아니라 심볼 정의, 참조, 타입 정보를
정확하게 파악한다.

<strong>사용 이유</strong>:
- 토큰 효율성: 전체 파일을 읽지 않고 필요한 심볼만 조회
- 정확한 네비게이션: "이 함수를 호출하는 곳"을 정확히 찾음
- 안전한 리팩토링: 심볼 이름 변경 시 모든 참조 자동 업데이트

<strong>설정 예시</strong>:

```json
{
  "serena": {
    "command": "uvx",
    "args": [
      "--from",
      "serena-agent",
      "serena",
      "--config",
      "/path/to/serena_config.yml"
    ]
  }
}
```

Serena 설정 파일에서 프로젝트별 언어 서버를 지정할 수 있다.
TypeScript 프로젝트라면 `typescript-language-server`를,
Python이라면 `pylsp`를 연결한다.

### 2. Context7 (문서 검색)

<strong>역할</strong>: 최신 라이브러리 공식 문서 검색

Context7은 LLM의 가장 큰 약점인 <strong>hallucination</strong>을
해결한다. Claude의 학습 데이터는 2025년 1월 기준이므로,
그 이후 업데이트된 API는 알 수 없다.

<strong>사용 이유</strong>:
- 최신 API 정보: 라이브러리의 현재 버전 문서 조회
- 정확한 코드 예시: 공식 문서의 검증된 예제 활용
- hallucination 방지: 추측 대신 실제 문서 기반 답변

<strong>사용법</strong>:

프롬프트에 "use context7"을 포함하면
Claude가 자동으로 Context7 서버를 호출한다.

```
Astro 5.0의 Content Collections 설정 방법 알려줘. use context7
```

설정:

```json
{
  "context7": {
    "command": "npx",
    "args": ["-y", "@upstash/context7-mcp"]
  }
}
```

### 3. Sequential Thinking (문제 해결)

<strong>역할</strong>: 단계별 사고 프로세스 구조화

복잡한 문제를 해결할 때 인간도 단계별로 생각을 정리한다.
Sequential Thinking 서버는 이 과정을 명시적으로 구조화한다.

<strong>사용 이유</strong>:
- 문제 분해: 큰 문제를 작은 단위로 나눔
- 가설 검증: 각 단계에서 가설을 세우고 검증
- 백트래킹: 잘못된 경로 발견 시 이전 단계로 복귀
- 투명성: 사고 과정이 기록되어 디버깅 가능

Docker 기반 설정:

```json
{
  "sequentialthinking": {
    "command": "docker",
    "args": [
      "run",
      "-i",
      "--rm",
      "mcp/sequentialthinking"
    ]
  }
}
```

이 서버는 특히 아키텍처 설계, 복잡한 버그 디버깅,
성능 최적화 전략 수립에 효과적이다.

### 4. Chrome DevTools MCP (성능 분석)

<strong>역할</strong>: 브라우저 성능 트레이스, 네트워크 분석,
콘솔 로그 조회

Chrome DevTools MCP는 실행 중인 Chrome 브라우저에
직접 연결하여 개발자 도구 기능을 제공한다.

<strong>사용 이유</strong>:
- Core Web Vitals 측정: LCP, FID, CLS 실시간 확인
- 네트워크 분석: API 호출 타이밍, 페이로드 크기
- 성능 프로파일링: JavaScript 실행 시간, 메모리 사용량

설정:

```json
{
  "chrome-devtools": {
    "command": "npx",
    "args": [
      "@anthropic-ai/mcp-server-chrome-devtools@latest"
    ]
  }
}
```

사용 전 Chrome을 디버깅 모드로 실행해야 한다:

```bash
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --remote-debugging-port=9222
```

### 5. Playwright MCP (브라우저 자동화)

<strong>역할</strong>: 크로스 브라우저 테스트, 스크린샷,
E2E 자동화

Playwright는 Chromium, Firefox, WebKit 세 가지 브라우저를
지원하는 자동화 도구다. MCP 서버로 Claude에 연결하면
AI 에이전트가 직접 브라우저를 조작할 수 있다.

<strong>사용 이유</strong>:
- E2E 테스트 자동화: 사용자 시나리오 테스트
- 스크린샷 캡처: 기능 확인, 문서화
- 크로스 브라우저 호환성: 여러 브라우저에서 동일 테스트

<strong>Chrome DevTools와의 차이점</strong>:
- Chrome DevTools: 성능 분석, 디버깅에 특화
- Playwright: 자동화, 테스트에 특화

설정:

```json
{
  "playwright": {
    "command": "npx",
    "args": ["@anthropic-ai/mcp-server-playwright@latest"]
  }
}
```

### 6. Gemini CLI MCP (AI 검색/분석)

<strong>역할</strong>: Google Search, 파일 분석, AI 대화

Gemini CLI는 Google의 Gemini 모델을 명령줄에서 사용하는 도구다.
MCP 서버로 연결하면 Claude가 Gemini의 기능을 활용할 수 있다.

<strong>사용 이유</strong>:
- 1M 토큰 컨텍스트: 대용량 파일 전체 분석 가능
- 멀티모달: 이미지, PDF 파일 분석
- Google Search 연동: 최신 정보 검색

주요 기능:
- `googleSearch`: 웹 검색 결과 반환
- `chat`: Gemini와 대화
- `analyzeFile`: 이미지, PDF, 텍스트 파일 분석

설정:

```json
{
  "gemini-cli": {
    "command": "npx",
    "args": ["-y", "gemini-cli-mcp"]
  }
}
```

### 7. Gemini Google Search

<strong>역할</strong>: 웹 검색 전용 경량 서버

Gemini CLI의 검색 기능만 분리한 서버다.
전체 Gemini CLI가 필요 없고 검색만 원할 때 사용한다.

<strong>사용 이유</strong>:
- 최신 정보 접근: LLM 학습 데이터 이후 정보
- 빠른 응답: 단일 기능에 최적화
- 낮은 리소스: 필요한 기능만 로드

설정:

```json
{
  "gemini-google-search": {
    "command": "npx",
    "args": ["-y", "@pinkpixel/gemini-google-search-mcp"]
  }
}
```

## 실제 설정 예시

내 `~/.claude/settings.json`의 mcpServers 설정 전체 구조다.
API 키와 경로는 마스킹했다:

```json
{
  "mcpServers": {
    "serena": {
      "command": "uvx",
      "args": [
        "--from", "serena-agent", "serena",
        "--config", "/path/to/serena_config.yml"
      ]
    },
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp"]
    },
    "sequentialthinking": {
      "command": "docker",
      "args": ["run", "-i", "--rm", "mcp/sequentialthinking"]
    },
    "chrome-devtools": {
      "command": "npx",
      "args": ["@anthropic-ai/mcp-server-chrome-devtools@latest"]
    },
    "playwright": {
      "command": "npx",
      "args": ["@anthropic-ai/mcp-server-playwright@latest"]
    },
    "gemini-cli": {
      "command": "npx",
      "args": ["-y", "gemini-cli-mcp"]
    },
    "gemini-google-search": {
      "command": "npx",
      "args": ["-y", "@pinkpixel/gemini-google-search-mcp"]
    }
  }
}
```

## 조합 활용 사례

### 코드 분석 + 문서 검색

새로운 라이브러리를 기존 프로젝트에 도입할 때:

1. <strong>Context7</strong>: 라이브러리 공식 문서에서 설정 방법 조회
2. <strong>Serena</strong>: 기존 코드에서 수정해야 할 위치 파악
3. <strong>Sequential Thinking</strong>: 마이그레이션 단계 계획

예를 들어 Astro 4에서 5로 업그레이드할 때:

```
1. Context7로 Astro 5 마이그레이션 가이드 조회
2. Serena로 Content Collections 사용 위치 검색
3. Sequential Thinking으로 단계별 업그레이드 계획
```

### 브라우저 테스트 + 성능 분석

웹 애플리케이션 최적화 작업:

1. <strong>Playwright</strong>: 주요 사용자 시나리오 자동 실행
2. <strong>Chrome DevTools</strong>: 성능 트레이스 수집
3. <strong>Sequential Thinking</strong>: 병목 지점 분석 및 개선 계획

### 복잡한 문제 해결 워크플로우

원인을 알 수 없는 버그 디버깅:

1. <strong>Sequential Thinking</strong>: 가능한 원인 가설 수립
2. <strong>Serena</strong>: 관련 코드 심볼 및 참조 추적
3. <strong>Gemini Search</strong>: 유사 이슈 및 해결책 검색
4. <strong>Chrome DevTools</strong>: 런타임 동작 확인

## 결론

MCP 서버 도입 후 개발 생산성이 크게 향상됐다.
특히 <strong>Context7</strong>과 <strong>Serena</strong>는
거의 모든 작업에서 사용한다.

<strong>처음 시작한다면 추천하는 순서</strong>:

1. <strong>Context7</strong>: 설정이 간단하고 효과가 즉시 체감됨
2. <strong>Sequential Thinking</strong>: 복잡한 작업의 품질 향상
3. <strong>Serena</strong>: 대규모 코드베이스에서 필수

MCP 서버는 AI 코딩 에이전트의 한계를 확장하는 핵심 도구다.
자신의 워크플로우에 맞는 서버를 선택하여
개발 생산성을 극대화하길 바란다.
