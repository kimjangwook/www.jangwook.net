# MCP Tool Wrappers

MCP Code Execution 패턴에 기반한 도구 정의 디렉토리입니다.

## 개요

이 디렉토리는 Anthropic의 "Code Execution with MCP" 패턴을 적용하여 도구들을 파일시스템 기반으로 구성합니다. 각 도구는 표준화된 메타데이터와 인터페이스를 가지며, Progressive Loading을 통해 필요한 도구만 로드됩니다.

## 핵심 개념

### 1. Filesystem-based Tool Discovery

```
tools/
├── database/
│   ├── query.ts
│   └── update.ts
├── api/
│   └── fetch.ts
└── file/
    ├── read.ts
    └── write.ts
```

도구들은 디렉토리 구조로 조직화되며, 자동으로 발견됩니다.

### 2. Progressive Loading

필요한 도구만 import하여 컨텍스트 소비를 최소화합니다:

```typescript
// 100개 도구 중 3개만 로드 → 80-95% 컨텍스트 절감
import { query } from './tools/database';
import { fetch } from './tools/api';
```

### 3. Tool Wrapper Pattern

각 도구는 표준화된 메타데이터를 포함합니다:

```typescript
// tools/database/query.ts
export async function query(sql: string): Promise<Record[]> {
  // 구현
}

query.description = "Execute SQL query and return records";
query.parameters = {
  sql: { type: "string", description: "SQL query to execute" }
};
```

## 현재 도구 목록

### blog-tools

블로그 자동화를 위한 도구들:

| 도구 | 설명 | 위치 |
|------|------|------|
| `get_next_pubdate` | 다음 발행일 계산 | `skills/blog-writing/scripts/` |
| `generate_slug` | URL 슬러그 생성 | `skills/blog-writing/scripts/` |
| `validate_frontmatter` | 프론트매터 검증 | `skills/blog-writing/scripts/` |

### mcp-tools

MCP 서버 통합 도구들:

| 도구 | 설명 | MCP 서버 |
|------|------|----------|
| `brave_web_search` | 웹 검색 | brave-search |
| `brave_news_search` | 뉴스 검색 | brave-search |
| `run_report` | GA4 리포트 | analytics-mcp |
| `get-library-docs` | 라이브러리 문서 | context7 |

## 사용 방법

### 1. 도구 정의

```typescript
// tools/custom/my-tool.ts
import { z } from 'zod';

export const myTool = {
  name: 'custom.my-tool',
  description: 'My custom tool description',

  parameters: z.object({
    input: z.string().describe('Input parameter'),
    options: z.object({
      flag: z.boolean().default(false)
    }).optional()
  }),

  async execute({ input, options }) {
    // 입력 검증
    if (!input) {
      throw new Error('Input is required');
    }

    // 비즈니스 로직
    const result = await processInput(input, options);

    // 결과 반환 (요약만)
    return {
      success: true,
      summary: `Processed ${result.count} items`
    };
  }
};
```

### 2. 도구 사용

```typescript
// 필요한 도구만 import (Progressive Loading)
import { myTool } from './tools/custom/my-tool';

const result = await myTool.execute({
  input: 'test data',
  options: { flag: true }
});

console.log(result.summary);
```

## 베스트 프랙티스

### 1. 입력 검증

```typescript
// Zod 스키마로 타입 안전한 검증
parameters: z.object({
  sql: z.string()
    .min(1, 'SQL query cannot be empty')
    .regex(/^SELECT/i, 'Only SELECT queries allowed')
})
```

### 2. 에러 처리

```typescript
async execute({ input }) {
  try {
    return await process(input);
  } catch (error) {
    if (error instanceof ValidationError) {
      throw new ToolError('VALIDATION', error.message);
    }
    throw new ToolError('EXECUTION', 'Tool execution failed');
  }
}
```

### 3. 결과 요약

```typescript
// 전체 데이터 반환 X
return { records: allRecords }; // 나쁜 예

// 요약만 반환 O
return {
  count: allRecords.length,
  summary: `Processed ${allRecords.length} records`
}; // 좋은 예
```

## 효율성 지표

MCP Code Execution 패턴 적용 시:

| 지표 | Before | After | 개선 |
|------|--------|-------|------|
| 토큰 소비 | 150,000 | 2,000 | 98.7% 절감 |
| 실행 시간 | 45초 | 15초 | 60% 단축 |
| API 비용 | $7.50 | $0.10 | 75x 절감 |

## 참고 자료

- [Anthropic Code Execution with MCP](https://www.anthropic.com/engineering/code-execution-with-mcp)
- [MCP Specification](https://github.com/modelcontextprotocol/specification)
- [블로그 포스트: MCP Code Execution](/blog/ko/anthropic-code-execution-mcp)

---

**마지막 업데이트**: 2025-11-18
**버전**: 1.0
