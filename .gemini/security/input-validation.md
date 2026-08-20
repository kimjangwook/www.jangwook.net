# Input Validation Patterns

AI 생성 코드의 취약점을 방지하기 위한 입력 검증 패턴입니다.

## 개요

Anthropic의 보안 연구에 따르면 AI 생성 코드의 43%가 명령어 주입 취약점을 포함합니다. 이 문서는 이러한 취약점을 방지하기 위한 검증 패턴을 제공합니다.

## 주요 취약점 유형

### 1. Command Injection (43%)

```typescript
// 취약한 코드
const result = await exec(`cat ${userInput}`);

// 안전한 코드
const allowedFiles = ['data.csv', 'report.txt'];
if (!allowedFiles.includes(userInput)) {
  throw new Error('Invalid file');
}
await readFile(userInput);
```

### 2. SQL Injection

```typescript
// 취약한 코드
const query = `SELECT * FROM users WHERE id = ${userId}`;

// 안전한 코드
const query = 'SELECT * FROM users WHERE id = ?';
const result = await db.query(query, [userId]);
```

### 3. Path Traversal

```typescript
// 취약한 코드
const path = `./uploads/${filename}`;

// 안전한 코드
const safeName = path.basename(filename);
const fullPath = path.join('./uploads', safeName);
if (!fullPath.startsWith('./uploads/')) {
  throw new Error('Invalid path');
}
```

## 검증 패턴

### 1. Zod 스키마 검증

```typescript
import { z } from 'zod';

const QueryParams = z.object({
  sql: z.string()
    .min(1, 'Query cannot be empty')
    .max(1000, 'Query too long')
    .regex(/^SELECT/i, 'Only SELECT allowed')
    .refine(
      sql => !sql.includes(';'),
      'Multiple statements not allowed'
    ),
  limit: z.number()
    .int()
    .min(1)
    .max(1000)
    .default(100)
});

export async function query(params: unknown) {
  const { sql, limit } = QueryParams.parse(params);
  // 안전하게 실행
}
```

### 2. 화이트리스트 검증

```typescript
const ALLOWED_TABLES = ['users', 'posts', 'comments'];
const ALLOWED_OPERATIONS = ['SELECT', 'COUNT'];

function validateQuery(sql: string) {
  const upperSql = sql.toUpperCase();

  // 작업 검증
  const operation = upperSql.split(' ')[0];
  if (!ALLOWED_OPERATIONS.includes(operation)) {
    throw new Error(`Operation '${operation}' not allowed`);
  }

  // 테이블 검증
  const tableMatch = sql.match(/FROM\s+(\w+)/i);
  if (!tableMatch || !ALLOWED_TABLES.includes(tableMatch[1])) {
    throw new Error('Invalid table');
  }

  return true;
}
```

### 3. 타입 강제

```typescript
function validateId(input: unknown): number {
  if (typeof input === 'string') {
    const num = parseInt(input, 10);
    if (isNaN(num)) {
      throw new Error('Invalid ID format');
    }
    return num;
  }

  if (typeof input === 'number') {
    if (!Number.isInteger(input)) {
      throw new Error('ID must be integer');
    }
    return input;
  }

  throw new Error('ID must be string or number');
}
```

### 4. 경로 검증

```typescript
import * as path from 'path';

function validatePath(input: string, basePath: string): string {
  // 정규화
  const normalized = path.normalize(input);

  // 절대 경로로 변환
  const fullPath = path.resolve(basePath, normalized);

  // 기본 경로 내에 있는지 확인
  if (!fullPath.startsWith(path.resolve(basePath))) {
    throw new Error('Path traversal detected');
  }

  // 위험한 패턴 확인
  if (normalized.includes('..') || normalized.includes('~')) {
    throw new Error('Invalid path characters');
  }

  return fullPath;
}
```

## 이 프로젝트에서의 적용

### 블로그 슬러그 검증

```typescript
const SlugSchema = z.string()
  .min(1)
  .max(100)
  .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens')
  .refine(
    s => !s.startsWith('-') && !s.endsWith('-'),
    'Slug cannot start or end with hyphen'
  );

function validateSlug(input: string): string {
  return SlugSchema.parse(input);
}
```

### 날짜 검증

```typescript
const PubDateSchema = z.string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format')
  .refine(date => {
    const parsed = new Date(date);
    return !isNaN(parsed.getTime());
  }, 'Invalid date');

function validatePubDate(input: string): string {
  return PubDateSchema.parse(input);
}
```

### 태그 검증

```typescript
const TagSchema = z.array(
  z.string()
    .min(1)
    .max(30)
    .regex(/^[a-z0-9-]+$/, 'Tag must be lowercase alphanumeric')
)
  .max(10, 'Maximum 10 tags')
  .refine(
    tags => new Set(tags).size === tags.length,
    'Tags must be unique'
  );

function validateTags(input: string[]): string[] {
  return TagSchema.parse(input);
}
```

### 파일 경로 검증

```typescript
const BlogPostPathSchema = z.string()
  .refine(p => {
    const normalized = path.normalize(p);
    const basePath = 'src/content/blog';
    const fullPath = path.join(basePath, normalized);
    return fullPath.startsWith(basePath);
  }, 'Invalid blog post path')
  .refine(p => {
    return p.match(/^(ko|en|ja|zh)\/[a-z0-9-]+\.md$/);
  }, 'Invalid blog post filename format');
```

## 도구별 검증 예시

### database.query

```typescript
export const query = {
  name: 'database.query',

  parameters: z.object({
    sql: z.string()
      .min(1)
      .max(2000)
      .regex(/^SELECT\s/i, 'Only SELECT queries allowed')
      .refine(sql => !sql.includes(';'), 'Multiple statements not allowed')
      .refine(sql => !sql.match(/DROP|DELETE|UPDATE|INSERT/i), 'Modifying queries not allowed'),
    limit: z.number().int().min(1).max(1000).default(100)
  }),

  async execute(params) {
    const validated = this.parameters.parse(params);
    // 실행
  }
};
```

### file.read

```typescript
export const read = {
  name: 'file.read',

  parameters: z.object({
    path: z.string()
      .min(1)
      .max(500)
      .refine(p => !p.includes('..'), 'Path traversal not allowed')
      .refine(p => !p.startsWith('/'), 'Absolute paths not allowed'),
    encoding: z.enum(['utf-8', 'ascii', 'base64']).default('utf-8')
  }),

  async execute(params) {
    const validated = this.parameters.parse(params);
    const safePath = validatePath(validated.path, './workspace');
    // 실행
  }
};
```

## 에러 처리

### 사용자 친화적 에러

```typescript
class ValidationError extends Error {
  constructor(
    public field: string,
    public message: string,
    public received: unknown
  ) {
    super(`Validation failed for '${field}': ${message}`);
    this.name = 'ValidationError';
  }
}

function validate(params: unknown) {
  try {
    return Schema.parse(params);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issue = error.issues[0];
      throw new ValidationError(
        issue.path.join('.'),
        issue.message,
        issue.received
      );
    }
    throw error;
  }
}
```

### 로깅

```typescript
function validateWithLogging(params: unknown, schema: z.ZodSchema) {
  try {
    return schema.parse(params);
  } catch (error) {
    console.error('Validation failed:', {
      timestamp: new Date().toISOString(),
      schema: schema.description,
      params: JSON.stringify(params, null, 2).slice(0, 500),
      error: error.message
    });
    throw error;
  }
}
```

## 베스트 프랙티스

1. **Fail Fast**: 가능한 빨리 검증
2. **화이트리스트 우선**: 블랙리스트보다 화이트리스트 선호
3. **타입 강제**: 문자열을 적절한 타입으로 변환
4. **길이 제한**: 모든 문자열에 최대 길이 설정
5. **정규화**: 입력을 정규화 후 검증
6. **에러 상세화**: 디버깅을 위한 상세한 에러 메시지

## 참고 자료

- [security/sandbox-config.md](sandbox-config.md) - 샌드박스 설정
- [OWASP Input Validation Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html)
- [Zod Documentation](https://zod.dev)

---

**마지막 업데이트**: 2025-11-18
**버전**: 1.0
