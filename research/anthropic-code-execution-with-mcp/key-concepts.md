# Key Concepts: Code Execution with MCP

Anthropic의 Code Execution with MCP 기술의 핵심 개념을 정리합니다.

## 1. 패러다임 전환

### 전통적 도구 호출

```
User Request
    ↓
Model Analysis
    ↓
Tool Call #1 → Result → Context
    ↓
Model Analysis (+ all previous context)
    ↓
Tool Call #2 → Result → Context
    ↓
... (반복)
```

**문제점**:
- 매 호출마다 전체 컨텍스트 재처리
- 결과 누적으로 컨텍스트 폭발
- N번 도구 호출 = N번 모델 추론

### Code Execution 접근

```
User Request
    ↓
Code Generation (도구 오케스트레이션)
    ↓
Sandbox Execution
    ↓
Summary Return
```

**장점**:
- 1번 코드 생성 + 1번 요약 = 2번 모델 추론
- 중간 결과는 샌드박스에 머무름
- 코드로 복잡한 제어 흐름 표현

## 2. 핵심 기술 요소

### 2.1 Filesystem-based Tool Discovery

```
tools/
├── database/
│   ├── query.ts        # description, parameters 포함
│   └── update.ts
├── api/
│   └── fetch.ts
└── file/
    ├── read.ts
    └── write.ts
```

- 도구들이 파일 구조로 조직화
- 자동 발견 및 메타데이터 추출
- 디렉토리 구조가 네임스페이스 역할

### 2.2 Tool Wrapper Pattern

```typescript
export async function query(sql: string): Promise<Record[]> {
  // 구현
}

query.description = "Execute SQL query and return records";
query.parameters = {
  sql: { type: "string", description: "SQL query" }
};
```

- 함수에 메타데이터 첨부
- 표준화된 인터페이스
- 자동 문서 생성 가능

### 2.3 Progressive Tool Loading

```typescript
// 100개 도구 중 3개만 로드
import { query } from './tools/database';   // 500 tokens
import { fetch } from './tools/api';        // 400 tokens
import { write } from './tools/file';       // 300 tokens
// Total: 1,200 tokens (vs 40,000 for all)
```

- 사용하는 도구만 import
- 80-95% 컨텍스트 절감
- Tree-shaking 지원

### 2.4 Sandboxed Execution

```typescript
const sandbox = createSandbox({
  runtime: 'node',
  timeout: 30000,
  memory: '512MB',
  filesystem: { readOnly: ['/tools'], readWrite: ['/tmp'] },
  network: { allowedHosts: ['api.example.com'] }
});
```

- 프로세스 격리
- 파일시스템/네트워크 제한
- 리소스 한도 설정

### 2.5 Summary Return

```typescript
// 전체 데이터 반환 X
return { patients: allPatients };  // 50,000 tokens

// 요약만 반환 O
return {
  count: allPatients.length,
  avgAge: 42.5,
  summary: "Processed 1,000 patient records"
};  // 100 tokens
```

- 중간 결과 제외
- 최종 요약만 모델에 전달
- 프라이버시 보존

## 3. 성능 개선 원리

### 토큰 절감 분석

**100개 레코드 처리 예시**:

| 단계 | 전통적 | Code Execution |
|------|--------|----------------|
| 초기 컨텍스트 | 5,000 | 1,000 |
| 도구 설명 | 20,000 | 1,500 |
| 코드/결과 | - | 500 |
| 100x DB 읽기 | 50,000 | - |
| 15x API 업데이트 | 15,000 | - |
| 모델 추론 | 80,000 | - |
| **합계** | **150,000** | **2,000** |

### 지연 시간 분석

| 단계 | 전통적 | Code Execution |
|------|--------|----------------|
| 도구 호출 | 15 × 2s = 30s | 로컬 실행 10s |
| 모델 추론 | 15 × 1s = 15s | 코드 생성 3s |
| 요약 | - | 2s |
| **합계** | **45s** | **15s** |

## 4. 보안 고려사항

### 취약점 유형

Anthropic 연구 결과:
- **Command Injection**: 43% 취약률
- **SQL Injection**: 35%
- **Path Traversal**: 28%

### 필수 보안 조치

1. **샌드박스 필수**: 모든 AI 생성 코드는 격리 실행
2. **입력 검증**: Zod 등 스키마 기반 검증
3. **화이트리스트**: 파일/네트워크 접근 제한
4. **Rate Limiting**: API 호출 제한
5. **감사 로깅**: 모든 실행 기록

## 5. 적용 시나리오

### 적합한 경우

- 여러 도구 조합이 필요한 복잡한 워크플로우
- 대량 데이터 처리 (100+ 레코드)
- 루프/조건문이 필요한 로직
- 프라이버시가 중요한 데이터 처리

### 부적합한 경우

- 1-2개 도구만 사용하는 단순 작업
- 실시간 대화형 인터랙션
- 샌드박스 오버헤드가 부담되는 경우

## 6. 이 프로젝트와의 연계

### 기존 장점 유지

- 메타데이터 우선 아키텍처 (60-70% 절감)
- 증분 처리 (79% 절감)
- 캐싱 전략 (58% 절감)

### 추가 개선 가능

1. **도구 모듈화**: Skills 스크립트를 Tool Wrapper로
2. **Progressive Loading**: 필요한 에이전트만 로드
3. **샌드박스 도입**: 코드 실행 격리
4. **요약 패턴**: Agent 간 통신 최적화

## 7. 미래 전망

### Anthropic 로드맵 (2025-2026)

- Remote Server Support (OAuth 2.1)
- Multi-Language Execution (Go, Rust, Java)
- Enhanced Sandboxing (Firecracker, gVisor)
- Enterprise Features (Governance, RBAC)

### 업계 동향

- 10,000+ MCP 서버 구축
- 주요 IDE 통합 (Zed, Replit, Cursor)
- Gartner 예측: 2026년 말까지 60% 엔터프라이즈 AI 프로젝트 채택

---

**작성일**: 2025-11-18
**출처**: [Anthropic Engineering Blog](https://www.anthropic.com/engineering/code-execution-with-mcp)
