---
title: mcp2cli — MCP 토큰 비용을 96〜99% 절감하는 CLI 기반 툴 디스커버리
description: >-
  MCP 서버 연동 시 매 턴마다 전체 스키마를 주입하면 120개 툴 기준 362,000 토큰이 낭비된다. mcp2cli는 CLI 기반 온디맨드 디스커버리로 이 비용을 96〜99% 줄인다. 구조, 실측 수치, 도입 전략을 정리한다.
pubDate: '2026-03-12'
heroImage: ../../../assets/blog/mcp2cli-token-cost-optimization-hero.jpg
tags:
  - mcp
  - llm-cost
  - ai-agent
relatedPosts:
  - slug: mcp-servers-toolkit-introduction
    score: 0.95
    reason:
      ko: MCP 서버 연동의 기초를 다루며, mcp2cli 도입 전 필수 배경 지식을 제공합니다.
      ja: MCP サーバー連携の基礎を扱い、mcp2cli 導入前の必須背景知識を提供します。
      en: Covers MCP server integration basics, providing essential background before adopting mcp2cli.
      zh: 涵盖MCP服务器集成基础知识，是采用mcp2cli前的必读内容。
  - slug: mcp-code-execution-practical-implementation
    score: 0.92
    reason:
      ko: MCP 코드 실행 실전 구현 사례로, 토큰 최적화와 함께 읽으면 시너지가 높습니다.
      ja: MCP コード実行の実践実装事例で、トークン最適化と合わせて読むと相乗効果が高いです。
      en: Practical MCP code execution case study that pairs well with token optimization strategies.
      zh: MCP代码执行实践案例，与token优化策略结合阅读效果更佳。
  - slug: context-engineering-production-ai-agents
    score: 0.90
    reason:
      ko: 프로덕션 AI 에이전트의 컨텍스트 엔지니어링 전략으로, 토큰 관리의 큰 그림을 제공합니다.
      ja: プロダクション AI エージェントのコンテキストエンジニアリング戦略で、トークン管理の全体像を提供します。
      en: Context engineering strategies for production AI agents, offering the big picture of token management.
      zh: 生产AI代理的上下文工程策略，提供token管理的全局视图。
  - slug: deep-thinking-ratio-llm-cost-optimization
    score: 0.88
    reason:
      ko: LLM 비용 최적화의 다른 축인 추론 토큰 관리 전략을 다룹니다.
      ja: LLM コスト最適化の別の軸である推論トークン管理戦略を扱います。
      en: Addresses reasoning token management, another key axis of LLM cost optimization.
      zh: 涉及推理token管理策略，是LLM成本优化的另一重要维度。
  - slug: anthropic-code-execution-mcp
    score: 0.86
    reason:
      ko: Anthropic MCP 코드 실행 효율화 사례로, mcp2cli와 함께 MCP 최적화의 전체 그림을 완성합니다.
      ja: Anthropic MCP コード実行の効率化事例で、mcp2cli と合わせて MCP 最適化の全体像を完成させます。
      en: Anthropic MCP code execution efficiency case that completes the full picture of MCP optimization with mcp2cli.
      zh: Anthropic MCP代码执行效率案例，与mcp2cli共同构成MCP优化的完整图景。
---

## 개요

MCP(Model Context Protocol)가 AI 에이전트 생태계의 표준으로 자리를 잡으면서, 새로운 병목이 등장했다. **툴 스키마 토큰 낭비**다.

MCP 서버를 연동하면 매 대화 턴마다 모든 툴의 JSON 스키마가 LLM 컨텍스트에 주입된다. 모델이 그 턴에 실제로 사용하든 안 하든 무관하게. 30개 툴이면 턴당 약 3,600 토큰, 120개 툴에 25턴 대화라면 362,000 토큰이 스키마 주입에만 소비된다.

**mcp2cli**는 이 문제를 CLI 기반 온디맨드 디스커버리로 해결한다. 모델이 필요할 때 직접 `--list`와 `--help`를 호출해 툴을 발견하도록 구조를 바꿔, 토큰 낭비를 96〜99% 줄인다.

## 문제: 매 턴 전체 스키마 주입의 비용

### 기존 MCP 연동 방식

```
[대화 시작]
System Prompt + 전체 툴 스키마 (30개 × 121 tokens = 3,630 tokens)
│
Turn 1: 사용자 메시지 + 전체 스키마 재주입
Turn 2: 사용자 메시지 + 전체 스키마 재주입
Turn 3: 사용자 메시지 + 전체 스키마 재주입
...
Turn 15: 사용자 메시지 + 전체 스키마 재주입
```

30개 툴 × 15턴 = **54,450 토큰**이 스키마에만 소비된다. 실제로 모델이 그 턴에 툴을 호출했는지와 무관하게.

### 실측 수치 (mcp2cli 기준)

| 시나리오 | 네이티브 MCP | mcp2cli | 절감률 |
|---------|------------|---------|-------|
| 30개 툴, 15턴 | 54,525 tokens | 2,309 tokens | <strong>96%</strong> |
| 80개 툴, 20턴 | 193,240 tokens | 3,871 tokens | <strong>98%</strong> |
| 120개 툴, 25턴 | 362,350 tokens | 5,181 tokens | <strong>99%</strong> |
| 200 엔드포인트 API, 25턴 | 358,425 tokens | 3,925 tokens | <strong>99%</strong> |

툴이 많고 대화가 길수록 절감 효과가 커진다. 엔터프라이즈 규모의 MCP 환경에서는 비용 구조 자체가 달라진다.

## mcp2cli 작동 원리

### 핵심 아이디어: 스키마 프리로드 → 온디맨드 디스커버리

```
[기존 방식]
모든 툴 스키마 → 컨텍스트에 항상 존재

[mcp2cli 방식]
툴 목록만 (16 tokens/tool) → 모델이 필요할 때 --help 호출 (120 tokens/tool)
```

LLM은 `mcp2cli --list`로 사용 가능한 툴 이름과 간략한 설명만 받고, 실제로 그 툴을 쓰려 할 때만 `mcp2cli [tool-name] --help`를 호출해 상세 스키마를 확인한다.

### 4단계 처리 파이프라인

```
1. 스펙 로드
   MCP 서버 URL / OpenAPI spec 파일 읽기

2. 툴 정의 추출
   스키마에서 툴 이름, 파라미터, 설명 파싱

3. 인수 파서 생성
   각 툴에 대한 CLI 명령어 동적 생성 (코드 생성 없음, 런타임)

4. 실행
   HTTP 또는 tool-call 요청으로 MCP 서버에 전달
```

### 설치 및 기본 사용법

```bash
# 설치
pip install mcp2cli

# MCP 서버 툴 목록 확인 (~16 tokens/tool)
mcp2cli --mcp https://server.url/sse --list

# 특정 툴 상세 확인 (~120 tokens, 필요 시만)
mcp2cli --mcp https://server.url/sse search-files --help

# OpenAPI 스펙 기반 사용
mcp2cli --spec api.json --base-url https://api.com list-items

# TOON 포맷 (Token-Optimized Output Notation) 출력
mcp2cli --mcp https://server.url/sse search-files --toon
```

### 제로 코드젠의 의미

mcp2cli는 런타임에 스펙을 읽어 CLI를 동적으로 생성한다. 코드 생성이 없다는 뜻은:

- MCP 서버에 새 툴이 추가되면 다음 호출 시 자동으로 반영
- 스펙 파일을 커밋할 필요 없음
- 1시간 TTL의 지능적 캐싱으로 불필요한 재로드 방지

## EM/VPoE 관점에서의 도입 전략

### 비용 영향 계산

팀이 100개 MCP 툴을 연동한 AI 에이전트를 운영하고 있다고 가정하자.

```
네이티브 MCP (하루 1,000 대화, 평균 20턴):
  100 툴 × 121 tokens × 20턴 × 1,000 대화 = 242,000,000 tokens/일

mcp2cli 적용 후 (98% 절감):
  ~4,840,000 tokens/일

차이: 237,160,000 tokens/일
Claude Sonnet 4.6 기준 ($3/MTok): 하루 약 $711, 월 약 $21,000 절감
```

이 수치는 LLM 비용뿐 아니라 컨텍스트 길이와 직결되는 **레이턴시와 품질**에도 영향을 준다.

### 트레이드오프 인식

mcp2cli가 만능은 아니다. HN 커뮤니티에서도 제기된 핵심 우려:

**추가 라운드트립**: 모델이 툴을 처음 쓸 때 `--help`를 별도로 호출해야 하므로 짧은 작업에서는 오히려 느릴 수 있다.

**디스커버리 오류 가능성**: 모델이 잘못된 툴 이름을 시도하거나, `--help` 결과를 잘못 해석할 수 있다.

**최적 적용 상황**: 툴이 20개 이상이고, 대화 턴이 10턴 이상이며, 매 턴 대부분의 툴이 사용되지 않는 시나리오.

### 도입 로드맵

```
1단계: 측정
   현재 AI 에이전트의 실제 툴 스키마 토큰 소비량 측정
   (대화 로그에서 system prompt token count 확인)

2단계: 파일럿
   가장 많은 툴을 연동한 에이전트 1개에 mcp2cli 적용
   A/B 테스트: 비용, 정확도, 레이턴시 비교

3단계: 분석
   어떤 툴이 실제로 자주 사용되는지 분석
   자주 쓰는 툴은 프리로드, 나머지는 온디맨드 하이브리드 전략 검토

4단계: 확장
   효과 확인 후 전체 에이전트에 적용
```

## Hacker News 커뮤니티의 반응

133 upvotes, 92 comments를 받은 이 도구에 대해 HN 커뮤니티의 반응은 엇갈렸다.

**긍정적 반응**:
- "레이지 로딩 패턴을 LLM 툴 디스커버리에 적용한 것이 우아하다"
- "대규모 MCP 환경에서의 비용 절감이 게임 체인저가 될 수 있다"

**비판적 반응**:
- "토큰 절감이 실제로 더 나은 결과물을 보장하지 않는다"
- "모델이 툴 발견에 추가 라운드트립을 사용하면 레이턴시가 늘고 오류 가능성이 생긴다"
- "벤치마크가 이상적인 시나리오에 치우쳐 있다"

실무에서는 벤치마크를 그대로 신뢰하기보다 실제 워크로드에서 검증하는 것이 중요하다.

## 실전 적용 시 고려 사항

### MCP 서버 타입별 호환성

```
✅ HTTP/SSE MCP 서버: 완전 지원
✅ stdio MCP 서버: 지원
✅ OpenAPI JSON/YAML: 지원
⚠️  인증 필요 서버: OAuth 내장 지원, 설정 필요
```

### 캐싱 전략

```python
# 기본 캐싱: 1시간 TTL
mcp2cli --mcp server.url --cache-ttl 3600 --list

# 강제 새로고침
mcp2cli --mcp server.url --no-cache --list
```

스펙이 자주 바뀌는 개발 환경에서는 `--no-cache`, 스테이블한 프로덕션에서는 TTL을 길게 설정하는 것이 효율적이다.

## 정리

mcp2cli가 해결하는 문제는 단순하지만 실질적이다. MCP 생태계가 성숙하면서 연동하는 서버와 툴의 수가 늘어날수록, 스키마 주입 비용은 선형이 아니라 지수적으로 증가한다.

- **30개 툴**: 고민할 필요 없을 수도 있다
- **80개 이상 툴**: 월 단위 비용이 눈에 띄게 달라진다
- **120개 이상 툴**: 비용 최적화가 아니라 생존 전략이 된다

토큰 절감 이상으로, 컨텍스트를 깔끔하게 유지하면 모델의 실제 추론 품질에도 긍정적인 영향을 준다. 컨텍스트 창을 꽉 채운 노이즈를 줄이는 것이 프롬프트 엔지니어링만큼 중요한 시대다.

---

**참고 자료**

- [mcp2cli GitHub](https://github.com/knowsuchagency/mcp2cli)
- [Show HN: mcp2cli — One CLI for every API, 96-99% fewer tokens](https://news.ycombinator.com/item?id=47305149)
- [Speakeasy: Reducing MCP token usage by 100x](https://www.speakeasy.com/blog/how-we-reduced-token-usage-by-100x-dynamic-toolsets-v2)
