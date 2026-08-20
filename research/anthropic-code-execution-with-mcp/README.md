# Anthropic Code Execution with MCP 연구

Anthropic의 "Code Execution with MCP" 기술을 연구하고, 이를 바탕으로 `.claude/` 디렉토리를 개선한 내역을 정리합니다.

## 연구 배경

2025년 11월, Anthropic은 AI 에이전트가 외부 도구와 상호작용하는 방식을 근본적으로 변화시키는 혁신을 공개했습니다. **Code Execution with MCP**는 전통적인 순차적 도구 호출에서 코드 기반 오케스트레이션으로의 패러다임 전환을 의미합니다.

### 주요 성과 지표

- **98.7% 토큰 절감** (150,000 → 2,000 tokens)
- **60% 실행 시간 단축** (45초 → 15초)
- **75배 API 비용 절감** ($7.50 → $0.10)

## 연구 목표

1. Code Execution with MCP의 핵심 개념 이해
2. 프로젝트에 적용 가능한 패턴 식별
3. `.claude/` 디렉토리 구조 개선
4. 보안 및 효율성 최적화

## 파일 구조

```
research/anthropic-code-execution-with-mcp/
├── README.md                  # 본 문서
├── key-concepts.md           # 핵심 개념 정리
└── improvement-log.md        # 개선 이력
```

## 핵심 개념 요약

### 1. 전통적 도구 호출의 한계

- **토큰 폭발**: 각 도구 결과가 컨텍스트에 누적
- **지연 증가**: 각 호출마다 모델 추론 필요
- **컨텍스트 오염**: 중간 결과가 공간 차지
- **제어 흐름 제한**: 복잡한 로직을 순차적 결정으로 구현

### 2. Code Execution의 혁신

- **코드 생성**: AI가 도구를 오케스트레이션하는 코드 작성
- **샌드박스 실행**: 격리된 환경에서 안전하게 실행
- **요약 반환**: 중간 결과 대신 최종 요약만 반환
- **Progressive Loading**: 필요한 도구만 로드

### 3. 기술적 특징

- **Filesystem-based Tool Discovery**: 파일시스템 구조로 도구 조직화
- **Tool Wrapper Pattern**: 표준화된 메타데이터와 인터페이스
- **Local Control Flow**: 루프, 조건문이 코드로 실행
- **Privacy Preservation**: 민감 데이터가 샌드박스 내에서만 처리

## 프로젝트 적용

### 기존 구조와의 연계

이 프로젝트는 이미 효율적인 3-Tier 아키텍처를 가지고 있습니다:

```
Commands (사용자 호출)
    ↓ 워크플로우 오케스트레이션
Agents (전문 지식)
    ↓ Skills/Tools 사용
Skills (자동 발견)
    ↓ 모듈형 기능
Tools (파일 I/O, MCP)
```

Code Execution 패턴을 적용하여 이 구조를 더욱 강화했습니다.

### 개선 내역 요약

1. **tools/ 디렉토리 추가**: MCP Tool Wrapper 패턴
2. **patterns/ 디렉토리 추가**: Code Execution, Progressive Loading 문서화
3. **security/ 디렉토리 추가**: 샌드박스 설정, 입력 검증 가이드
4. **README.md 업데이트**: 새로운 구조 반영

### 예상 효과

| 항목 | Before | After | 개선 |
|------|--------|-------|------|
| 도구 설명 토큰 | 40,000 | 2,000 | 95% |
| 워크플로우 토큰 | 90,000 | 18,000 | 80% |
| 보안 취약점 | 높음 | 낮음 | 대폭 개선 |

## 참고 자료

### 원본 소스

- [Anthropic Engineering Blog](https://www.anthropic.com/engineering/code-execution-with-mcp)
- [MCP Specification](https://github.com/modelcontextprotocol/specification)
- [블로그 포스트](/blog/ko/anthropic-code-execution-mcp)

### 관련 문서

- [.claude/tools/README.md](../../.claude/tools/README.md)
- [.claude/patterns/code-execution.md](../../.claude/patterns/code-execution.md)
- [.claude/patterns/progressive-loading.md](../../.claude/patterns/progressive-loading.md)
- [.claude/security/sandbox-config.md](../../.claude/security/sandbox-config.md)
- [.claude/security/input-validation.md](../../.claude/security/input-validation.md)

## 향후 계획

1. **도구 래퍼 구현**: Python 스크립트를 TypeScript 도구로 변환
2. **샌드박스 통합**: 실제 샌드박스 환경 구성
3. **성능 측정**: 개선 전후 비교 벤치마크
4. **추가 패턴**: 상태 지속성, 에러 복구 패턴 추가

---

**작성일**: 2025-11-18
**버전**: 1.0
**상태**: Active
