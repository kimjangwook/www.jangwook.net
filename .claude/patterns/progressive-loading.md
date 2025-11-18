# Progressive Tool Loading Pattern

필요한 도구만 로드하여 컨텍스트 소비를 최소화하는 패턴입니다.

## 개요

MCP Code Execution의 핵심 최적화 중 하나입니다. 전통적인 방식에서는 모든 도구 설명이 초기 컨텍스트에 포함되지만, Progressive Loading에서는 실제 사용하는 도구만 로드됩니다.

## 전통적 방식 vs Progressive Loading

### 전통적 방식

```typescript
// 모든 도구 설명이 컨텍스트에 포함
const tools = {
  database: { description: "...", params: {...} },  // 500 tokens
  api: { description: "...", params: {...} },       // 400 tokens
  file: { description: "...", params: {...} },     // 300 tokens
  email: { description: "...", params: {...} },    // 350 tokens
  // ... 100개 도구
};
// 총: ~40,000 tokens (도구 설명만)
```

### Progressive Loading

```typescript
// 사용하는 도구만 import
import { query } from './tools/database';  // 500 tokens
import { fetch } from './tools/api';       // 400 tokens
// 총: 900 tokens (95% 절감)
```

## 구현 방법

### 1. 파일시스템 기반 도구 구조

```
.claude/tools/
├── database/
│   ├── index.ts      # 모듈 진입점
│   ├── query.ts      # 개별 도구
│   └── update.ts
├── api/
│   ├── index.ts
│   ├── fetch.ts
│   └── post.ts
└── index.ts          # 전체 진입점
```

### 2. 도구 정의

```typescript
// tools/database/query.ts
export const query = {
  name: 'database.query',
  description: 'Execute SQL query and return records',
  parameters: {
    sql: { type: 'string', description: 'SQL query' },
    limit: { type: 'number', default: 100 }
  },
  async execute({ sql, limit }) {
    // 구현
  }
};
```

### 3. 모듈 진입점

```typescript
// tools/database/index.ts
export { query } from './query';
export { update } from './update';

// tools/index.ts
export * as database from './database';
export * as api from './api';
```

### 4. 사용 예시

```typescript
// 필요한 것만 import
import { query } from './tools/database';

// 또는 네임스페이스로
import { database } from './tools';
const result = await database.query.execute({ sql: '...' });
```

## 이 프로젝트에서의 적용

### 현재 구조

```
.claude/
├── skills/
│   ├── blog-writing/
│   │   └── scripts/
│   │       ├── get_next_pubdate.py
│   │       ├── generate_slug.py
│   │       └── validate_frontmatter.py
│   └── ...
└── tools/  (새로 추가)
```

### 개선된 구조

```typescript
// 스킬 스크립트를 도구로 래핑
// tools/blog/next-pubdate.ts
export const getNextPubdate = {
  name: 'blog.getNextPubdate',
  description: 'Get next available publication date',
  parameters: {},
  async execute() {
    const { execSync } = require('child_process');
    const result = execSync('python scripts/get_next_pubdate.py');
    return { date: result.toString().trim() };
  }
};
```

### 사용 예시

```typescript
// Commands에서 사용
import { getNextPubdate } from './tools/blog';
import { generateSlug } from './tools/blog';

const date = await getNextPubdate.execute();
const slug = await generateSlug.execute({ title: 'My Post' });
```

## 효율성 지표

### 도구 수에 따른 절감율

| 전체 도구 | 사용 도구 | 전통적 토큰 | Progressive 토큰 | 절감율 |
|-----------|-----------|-------------|------------------|--------|
| 10 | 3 | 4,000 | 1,200 | 70% |
| 50 | 5 | 20,000 | 2,000 | 90% |
| 100 | 3 | 40,000 | 1,200 | 97% |
| 200 | 10 | 80,000 | 4,000 | 95% |

### 이 프로젝트 예상 효과

현재 MCP 서버 7개, 각 서버당 평균 10개 도구:

- 전체 도구: 70개
- 평균 사용: 5개
- 예상 절감: **93%**

## 베스트 프랙티스

### 1. 모듈 분리

```typescript
// 좋은 예: 기능별 분리
tools/
├── database/
├── api/
├── file/
└── blog/

// 나쁜 예: 단일 파일
tools/all-tools.ts
```

### 2. Lazy Loading

```typescript
// 좋은 예: 필요할 때 로드
const { query } = await import('./tools/database');

// 나쁜 예: 미리 모두 로드
import * as allTools from './tools';
```

### 3. 트리 쉐이킹 지원

```typescript
// 좋은 예: 명시적 export
export { query } from './query';
export { update } from './update';

// 나쁜 예: 전체 re-export
export * from './query';
export * from './update';
```

### 4. 타입 정보 분리

```typescript
// types/database.ts (별도 파일)
export interface QueryParams {
  sql: string;
  limit?: number;
}

// tools/database/query.ts
import { QueryParams } from '../../types/database';
```

## 주의사항

### 순환 의존성 방지

```typescript
// 나쁜 예: 순환 의존성
// database/query.ts
import { fetch } from '../api';

// api/fetch.ts
import { query } from '../database';  // 순환!

// 좋은 예: 공통 유틸리티로 분리
// utils/common.ts
export function formatResult(...) {...}
```

### 초기화 순서

```typescript
// 의존성 있는 도구는 순서 보장
await database.connect();  // 먼저
const result = await database.query.execute({ sql: '...' });
```

## 참고 자료

- [patterns/code-execution.md](code-execution.md) - Code Execution 패턴
- [Anthropic Engineering Blog](https://www.anthropic.com/engineering/code-execution-with-mcp)

---

**마지막 업데이트**: 2025-11-18
**버전**: 1.0
