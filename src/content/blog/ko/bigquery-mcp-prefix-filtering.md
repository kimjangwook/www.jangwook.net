---
title: 'BigQuery MCP 서버: Dataset Prefix 필터링 구현하기'
description: >-
  TypeScript로 BigQuery MCP 서버를 구축하고 Dataset Prefix 필터링을 통해 AI 에이전트의 데이터 접근을 제어하는
  방법을 알아봅니다.
pubDate: '2025-10-28'
heroImage: ../../../assets/blog/bigquery-mcp-prefix-filtering-hero.jpg
tags:
  - mcp
  - bigquery
  - google-cloud
  - typescript
  - ai-agents
relatedPosts:
  - slug: langgraph-multi-agent
    score: 0.95
    reason:
      ko: '자동화, AI/ML, DevOps, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、DevOps、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, DevOps, architecture with
        comparable difficulty.
      zh: 在自动化、AI/ML、DevOps、架构领域涵盖类似主题，难度相当。
  - slug: openai-agentkit-tutorial-part2
    score: 0.94
    reason:
      ko: '자동화, AI/ML, DevOps, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、DevOps、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, DevOps, architecture with
        comparable difficulty.
      zh: 在自动化、AI/ML、DevOps、架构领域涵盖类似主题，难度相当。
  - slug: specification-driven-development
    score: 0.93
    reason:
      ko: '자동화, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, architecture with comparable
        difficulty.
      zh: 在自动化、AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: google-analytics-mcp-automation
    score: 0.92
    reason:
      ko: '자동화, AI/ML, DevOps, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、DevOps、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, DevOps, architecture with
        comparable difficulty.
      zh: 在自动化、AI/ML、DevOps、架构领域涵盖类似主题，难度相当。
  - slug: ai-agent-collaboration-patterns
    score: 0.92
    reason:
      ko: '다음 단계 학습으로 적합하며, 자동화, AI/ML, 아키텍처 주제에서 연결됩니다.'
      ja: 次のステップの学習に適しており、自動化、AI/ML、アーキテクチャのトピックで繋がります。
      en: >-
        Suitable as a next-step learning resource, connecting through
        automation, AI/ML, architecture topics.
      zh: 适合作为下一步学习资源，通过自动化、AI/ML、架构主题进行连接。
---

## 개요

Model Context Protocol(MCP)은 AI 에이전트가 외부 시스템과 안전하게 상호작용할 수 있도록 설계된 표준 프로토콜입니다. 이 글에서는 BigQuery를 MCP 서버로 통합하면서, Dataset Prefix 필터링 기능을 구현하여 AI 에이전트의 데이터 접근 범위를 제어하는 방법을 다룹니다.

### 왜 Dataset Prefix 필터링이 필요한가?

대규모 BigQuery 환경에서는 수백 개의 데이터셋이 존재할 수 있습니다. AI 에이전트에게 모든 데이터셋을 노출하는 것은:

- <strong>보안 리스크</strong>: 민감한 데이터에 대한 불필요한 접근 권한 부여
- <strong>성능 저하</strong>: 대량의 메타데이터 로딩으로 인한 응답 지연
- <strong>사용성 문제</strong>: 불필요한 정보로 인한 컨텍스트 오염

Dataset Prefix 필터링을 통해 특정 prefix(예: `analytics_`, `marketing_`)를 가진 데이터셋만 노출하여 이러한 문제를 해결할 수 있습니다.

## MCP 서버 기본 구조

### MCP 아키텍처

MCP는 클라이언트-서버 아키텍처를 기반으로 하며, JSON-RPC 2.0 프로토콜을 사용하여 통신합니다.

```mermaid
graph LR
    A[AI 에이전트<br/>Claude, GPT] --> B[MCP 클라이언트]
    B --> C[MCP 서버]
    C --> D[BigQuery API]
    D --> E[Google Cloud<br/>데이터셋]

    style A fill:#e1f5ff
    style C fill:#fff4e1
    style E fill:#f0f0f0
```

### 핵심 컴포넌트

MCP 서버는 다음 세 가지 핵심 요소로 구성됩니다:

1. <strong>Server</strong>: MCP 프로토콜 구현 및 클라이언트 연결 관리
2. <strong>Tools</strong>: AI 에이전트가 호출할 수 있는 함수 정의
3. <strong>Transport</strong>: 통신 채널 (stdio, SSE 등)

````typescript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

// MCP 서버 인스턴스 생성
const server = new Server(
  {
    name: "bigquery-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {}, // 도구 기능 활성화
    },
  }
);

// Stdio 트랜스포트로 연결
const transport = new StdioServerTransport();
await server.connect(transport);
````

## BigQuery 클라이언트 연동

### 인증 설정

BigQuery API를 사용하기 위해서는 Google Cloud 서비스 계정 인증이 필요합니다.

````typescript
import { BigQuery } from "@google-cloud/bigquery";

// 환경 변수에서 프로젝트 ID와 인증 정보 로드
const projectId = process.env.GOOGLE_CLOUD_PROJECT;
const keyFilename = process.env.GOOGLE_APPLICATION_CREDENTIALS;

// BigQuery 클라이언트 초기화
const bigquery = new BigQuery({
  projectId,
  keyFilename, // 서비스 계정 JSON 키 파일 경로
});
````

### 환경 변수 설정

`.env` 파일에 다음 정보를 설정합니다:

```bash
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
DATASET_PREFIX=analytics_  # 필터링할 prefix
```

### 기본 API 작업

BigQuery 클라이언트는 다음과 같은 기본 작업을 지원합니다:

````typescript
// 데이터셋 목록 조회
async function listDatasets() {
  const [datasets] = await bigquery.getDatasets();
  return datasets.map(dataset => dataset.id);
}

// 테이블 스키마 조회
async function getTableSchema(datasetId: string, tableId: string) {
  const [metadata] = await bigquery
    .dataset(datasetId)
    .table(tableId)
    .getMetadata();

  return metadata.schema.fields;
}

// 쿼리 실행
async function executeQuery(query: string) {
  const [rows] = await bigquery.query({ query });
  return rows;
}
````

## Dataset Prefix 필터링 구현

### 필터링 로직

Dataset Prefix 필터링은 두 가지 수준에서 구현됩니다:

1. <strong>데이터셋 목록 필터링</strong>: API 응답에서 prefix와 일치하는 데이터셋만 반환
2. <strong>접근 제어</strong>: prefix와 일치하지 않는 데이터셋에 대한 직접 접근 차단

````typescript
// 환경 변수에서 prefix 설정 로드
const DATASET_PREFIX = process.env.DATASET_PREFIX || "";

// 데이터셋 ID가 허용된 prefix로 시작하는지 확인
function isAllowedDataset(datasetId: string): boolean {
  if (!DATASET_PREFIX) {
    return true; // prefix가 설정되지 않으면 모든 데이터셋 허용
  }
  return datasetId.startsWith(DATASET_PREFIX);
}

// 필터링된 데이터셋 목록 반환
async function getFilteredDatasets() {
  const [datasets] = await bigquery.getDatasets();

  return datasets
    .map(dataset => dataset.id!)
    .filter(isAllowedDataset)
    .sort();
}

// 데이터셋 접근 권한 검증
function validateDatasetAccess(datasetId: string): void {
  if (!isAllowedDataset(datasetId)) {
    throw new Error(
      `Access denied: Dataset '${datasetId}' does not match required prefix '${DATASET_PREFIX}'`
    );
  }
}
````

### 보안 강화

접근 제어를 모든 도구에 일관되게 적용합니다:

````typescript
// 테이블 목록 조회 시 접근 검증
async function listTables(datasetId: string) {
  validateDatasetAccess(datasetId); // 접근 권한 확인

  const [tables] = await bigquery.dataset(datasetId).getTables();
  return tables.map(table => ({
    tableId: table.id,
    type: table.metadata.type,
  }));
}

// 쿼리 실행 시 데이터셋 추출 및 검증
async function executeQuery(query: string) {
  // 쿼리에서 참조된 데이터셋 추출
  const referencedDatasets = extractDatasetsFromQuery(query);

  // 모든 참조된 데이터셋에 대한 접근 권한 확인
  for (const datasetId of referencedDatasets) {
    validateDatasetAccess(datasetId);
  }

  const [rows] = await bigquery.query({ query });
  return rows;
}

// 쿼리에서 데이터셋 추출 (정규식 사용)
function extractDatasetsFromQuery(query: string): string[] {
  // `project.dataset.table` 또는 `dataset.table` 패턴 매칭
  const pattern = /(?:FROM|JOIN)\s+(?:`?(?:\w+\.)?(\w+)\.\w+`?)/gi;
  const matches = [...query.matchAll(pattern)];
  return [...new Set(matches.map(m => m[1]))];
}
````

## MCP 도구 설계

### 도구 정의 원칙

효과적인 MCP 도구는 다음 원칙을 따릅니다:

1. <strong>단일 책임</strong>: 각 도구는 하나의 명확한 작업 수행
2. <strong>명확한 입출력</strong>: JSON Schema로 파라미터와 반환값 정의
3. <strong>오류 처리</strong>: 명확한 오류 메시지 제공
4. <strong>문서화</strong>: 도구 설명과 예시 포함

### 도구 목록

BigQuery MCP 서버는 다음 네 가지 도구를 제공합니다:

#### 1. list_datasets

필터링된 데이터셋 목록을 반환합니다.

````typescript
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "list_datasets",
      description: `List BigQuery datasets${DATASET_PREFIX ? ` with prefix '${DATASET_PREFIX}'` : ''}`,
      inputSchema: {
        type: "object",
        properties: {},
        required: [],
      },
    },
    // ... 다른 도구들
  ],
}));
````

#### 2. list_tables

특정 데이터셋의 테이블 목록을 반환합니다.

````typescript
{
  name: "list_tables",
  description: "List tables in a BigQuery dataset",
  inputSchema: {
    type: "object",
    properties: {
      datasetId: {
        type: "string",
        description: "Dataset ID to list tables from",
      },
    },
    required: ["datasetId"],
  },
}
````

#### 3. get_schema

테이블의 스키마 정보를 반환합니다.

````typescript
{
  name: "get_schema",
  description: "Get schema information for a BigQuery table",
  inputSchema: {
    type: "object",
    properties: {
      datasetId: {
        type: "string",
        description: "Dataset ID",
      },
      tableId: {
        type: "string",
        description: "Table ID",
      },
    },
    required: ["datasetId", "tableId"],
  },
}
````

#### 4. execute_query

BigQuery SQL 쿼리를 실행합니다.

````typescript
{
  name: "execute_query",
  description: "Execute a BigQuery SQL query",
  inputSchema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "SQL query to execute",
      },
      maxResults: {
        type: "number",
        description: "Maximum number of results to return (default: 100)",
        default: 100,
      },
    },
    required: ["query"],
  },
}
````

## 실전 구현

### 완전한 MCP 서버 코드

다음은 Dataset Prefix 필터링이 적용된 완전한 BigQuery MCP 서버 구현입니다:

````typescript
#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { BigQuery } from "@google-cloud/bigquery";
import dotenv from "dotenv";

// 환경 변수 로드
dotenv.config();

// BigQuery 클라이언트 초기화
const projectId = process.env.GOOGLE_CLOUD_PROJECT;
const DATASET_PREFIX = process.env.DATASET_PREFIX || "";

if (!projectId) {
  throw new Error("GOOGLE_CLOUD_PROJECT environment variable is required");
}

const bigquery = new BigQuery({
  projectId,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

// 데이터셋 접근 검증 함수
function isAllowedDataset(datasetId: string): boolean {
  if (!DATASET_PREFIX) return true;
  return datasetId.startsWith(DATASET_PREFIX);
}

function validateDatasetAccess(datasetId: string): void {
  if (!isAllowedDataset(datasetId)) {
    throw new Error(
      `Access denied: Dataset '${datasetId}' does not match required prefix '${DATASET_PREFIX}'`
    );
  }
}

// 쿼리에서 데이터셋 추출
function extractDatasetsFromQuery(query: string): string[] {
  const pattern = /(?:FROM|JOIN)\s+(?:`?(?:\w+\.)?(\w+)\.\w+`?)/gi;
  const matches = [...query.matchAll(pattern)];
  return [...new Set(matches.map(m => m[1]))];
}

// MCP 서버 생성
const server = new Server(
  {
    name: "bigquery-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// 도구 목록 핸들러
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "list_datasets",
      description: `List BigQuery datasets${DATASET_PREFIX ? ` with prefix '${DATASET_PREFIX}'` : ''}`,
      inputSchema: {
        type: "object",
        properties: {},
        required: [],
      },
    },
    {
      name: "list_tables",
      description: "List tables in a BigQuery dataset",
      inputSchema: {
        type: "object",
        properties: {
          datasetId: {
            type: "string",
            description: "Dataset ID to list tables from",
          },
        },
        required: ["datasetId"],
      },
    },
    {
      name: "get_schema",
      description: "Get schema information for a BigQuery table",
      inputSchema: {
        type: "object",
        properties: {
          datasetId: {
            type: "string",
            description: "Dataset ID",
          },
          tableId: {
            type: "string",
            description: "Table ID",
          },
        },
        required: ["datasetId", "tableId"],
      },
    },
    {
      name: "execute_query",
      description: "Execute a BigQuery SQL query",
      inputSchema: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "SQL query to execute",
          },
          maxResults: {
            type: "number",
            description: "Maximum number of results to return",
            default: 100,
          },
        },
        required: ["query"],
      },
    },
  ],
}));

// 도구 호출 핸들러
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "list_datasets": {
        const [datasets] = await bigquery.getDatasets();
        const filtered = datasets
          .map(d => d.id!)
          .filter(isAllowedDataset)
          .sort();

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(filtered, null, 2),
            },
          ],
        };
      }

      case "list_tables": {
        const { datasetId } = args as { datasetId: string };
        validateDatasetAccess(datasetId);

        const [tables] = await bigquery.dataset(datasetId).getTables();
        const tableList = tables.map(t => ({
          tableId: t.id,
          type: t.metadata.type,
        }));

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(tableList, null, 2),
            },
          ],
        };
      }

      case "get_schema": {
        const { datasetId, tableId } = args as {
          datasetId: string;
          tableId: string;
        };
        validateDatasetAccess(datasetId);

        const [metadata] = await bigquery
          .dataset(datasetId)
          .table(tableId)
          .getMetadata();

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(metadata.schema.fields, null, 2),
            },
          ],
        };
      }

      case "execute_query": {
        const { query, maxResults = 100 } = args as {
          query: string;
          maxResults?: number;
        };

        // 쿼리에서 참조된 데이터셋 검증
        const referencedDatasets = extractDatasetsFromQuery(query);
        for (const datasetId of referencedDatasets) {
          validateDatasetAccess(datasetId);
        }

        const [rows] = await bigquery.query({
          query,
          maxResults,
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(rows, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
});

// 서버 시작
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("BigQuery MCP server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
````

### package.json 설정

````json
{
  "name": "bigquery-mcp-server",
  "version": "1.0.0",
  "type": "module",
  "bin": {
    "bigquery-mcp-server": "./build/index.js"
  },
  "scripts": {
    "build": "tsc",
    "start": "node build/index.js",
    "dev": "tsx src/index.ts"
  },
  "dependencies": {
    "@google-cloud/bigquery": "^7.9.0",
    "@modelcontextprotocol/sdk": "^0.6.0",
    "dotenv": "^16.4.5"
  },
  "devDependencies": {
    "@types/node": "^22.10.5",
    "tsx": "^4.19.2",
    "typescript": "^5.7.3"
  }
}
````

### TypeScript 설정

````json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Node16",
    "moduleResolution": "Node16",
    "outDir": "./build",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "build"]
}
````

## 보안 및 최적화

### 보안 베스트 프랙티스

#### 1. 인증 정보 보호

````typescript
// ❌ 하드코딩된 인증 정보 (절대 금지)
const bigquery = new BigQuery({
  projectId: "my-project",
  credentials: {
    client_email: "service@project.iam.gserviceaccount.com",
    private_key: "-----BEGIN PRIVATE KEY-----\n...",
  },
});

// ✅ 환경 변수 사용
const bigquery = new BigQuery({
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});
````

#### 2. 최소 권한 원칙

서비스 계정에 필요한 최소한의 권한만 부여합니다:

```bash
# BigQuery Data Viewer (읽기 전용)
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="serviceAccount:SERVICE_ACCOUNT_EMAIL" \
  --role="roles/bigquery.dataViewer"

# BigQuery Job User (쿼리 실행)
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="serviceAccount:SERVICE_ACCOUNT_EMAIL" \
  --role="roles/bigquery.jobUser"
```

#### 3. SQL Injection 방지

BigQuery 파라미터화된 쿼리를 사용합니다:

````typescript
// ❌ 문자열 연결 (SQL Injection 위험)
const query = `SELECT * FROM dataset.table WHERE id = '${userId}'`;

// ✅ 파라미터화된 쿼리
const query = {
  query: "SELECT * FROM `dataset.table` WHERE id = @userId",
  params: { userId: userId },
};

const [rows] = await bigquery.query(query);
````

### 성능 최적화

#### 1. 결과 캐싱

BigQuery는 기본적으로 쿼리 결과를 24시간 캐싱하지만, MCP 서버 레벨에서도 캐싱을 구현할 수 있습니다:

````typescript
import { LRUCache } from "lru-cache";

// 메타데이터 캐시 (최대 100개 항목, 1시간 TTL)
const schemaCache = new LRUCache<string, any>({
  max: 100,
  ttl: 1000 * 60 * 60, // 1시간
});

async function getCachedSchema(datasetId: string, tableId: string) {
  const cacheKey = `${datasetId}.${tableId}`;

  // 캐시에서 조회
  let schema = schemaCache.get(cacheKey);

  if (!schema) {
    // 캐시 미스: API 호출
    const [metadata] = await bigquery
      .dataset(datasetId)
      .table(tableId)
      .getMetadata();

    schema = metadata.schema.fields;
    schemaCache.set(cacheKey, schema);
  }

  return schema;
}
````

#### 2. 쿼리 최적화

````typescript
// 결과 제한 및 타임아웃 설정
async function executeOptimizedQuery(query: string, maxResults = 100) {
  const options = {
    query,
    maxResults,
    timeoutMs: 30000, // 30초 타임아웃
    useLegacySql: false, // 표준 SQL 사용
    useQueryCache: true, // 쿼리 캐시 활성화
  };

  const [rows] = await bigquery.query(options);
  return rows;
}
````

#### 3. 병렬 처리

여러 데이터셋의 테이블 목록을 조회할 때 병렬 처리를 활용합니다:

````typescript
async function listAllTables(datasetIds: string[]) {
  // 병렬로 모든 데이터셋의 테이블 조회
  const tablePromises = datasetIds.map(async (datasetId) => {
    const [tables] = await bigquery.dataset(datasetId).getTables();
    return {
      datasetId,
      tables: tables.map(t => t.id),
    };
  });

  return await Promise.all(tablePromises);
}
````

### 오류 처리

#### 1. 명확한 오류 메시지

````typescript
function handleBigQueryError(error: any): string {
  if (error.code === 404) {
    return "Resource not found. Please check dataset/table name.";
  }

  if (error.code === 403) {
    return "Access denied. Please check your permissions.";
  }

  if (error.message?.includes("Syntax error")) {
    return `SQL syntax error: ${error.message}`;
  }

  return `BigQuery error: ${error.message || String(error)}`;
}
````

#### 2. 재시도 로직

일시적인 네트워크 오류에 대한 재시도 메커니즘:

````typescript
async function retryableQuery(
  query: string,
  maxRetries = 3,
  delayMs = 1000
) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await bigquery.query({ query });
    } catch (error: any) {
      // 재시도 가능한 오류인지 확인
      const isRetryable =
        error.code === 500 ||
        error.code === 503 ||
        error.message?.includes("timeout");

      if (!isRetryable || attempt === maxRetries) {
        throw error;
      }

      // 지수 백오프로 대기
      await new Promise(resolve =>
        setTimeout(resolve, delayMs * Math.pow(2, attempt - 1))
      );
    }
  }
}
````

## 실행 및 테스트

### 빌드 및 실행

````bash
# 1. 의존성 설치
npm install

# 2. TypeScript 빌드
npm run build

# 3. 환경 변수 설정
cat > .env << EOF
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
DATASET_PREFIX=analytics_
EOF

# 4. 개발 모드 실행
npm run dev

# 5. 프로덕션 모드 실행
npm start
````

### Claude Desktop 통합

MCP 서버를 Claude Desktop에 연결하려면 설정 파일을 수정합니다:

<strong>macOS</strong>: `~/Library/Application Support/Claude/claude_desktop_config.json`

<strong>Windows</strong>: `%APPDATA%\Claude\claude_desktop_config.json`

````json
{
  "mcpServers": {
    "bigquery": {
      "command": "node",
      "args": [
        "/absolute/path/to/bigquery-mcp-server/build/index.js"
      ],
      "env": {
        "GOOGLE_CLOUD_PROJECT": "your-project-id",
        "GOOGLE_APPLICATION_CREDENTIALS": "/path/to/service-account.json",
        "DATASET_PREFIX": "analytics_"
      }
    }
  }
}
````

### 테스트 시나리오

#### 1. 데이터셋 목록 조회

```
사용자: BigQuery의 데이터셋 목록을 보여줘

Claude: [list_datasets 도구 호출]

결과:
[
  "analytics_events",
  "analytics_users",
  "analytics_sessions"
]
```

#### 2. 테이블 스키마 확인

```
사용자: analytics_events 데이터셋의 events 테이블 스키마를 알려줘

Claude: [get_schema 도구 호출]

결과:
[
  {
    "name": "event_date",
    "type": "DATE",
    "mode": "REQUIRED"
  },
  {
    "name": "event_name",
    "type": "STRING",
    "mode": "NULLABLE"
  },
  {
    "name": "user_id",
    "type": "STRING",
    "mode": "NULLABLE"
  }
]
```

#### 3. 쿼리 실행

```
사용자: 오늘 발생한 이벤트 수를 세어줘

Claude: [execute_query 도구 호출]

쿼리:
SELECT event_name, COUNT(*) as count
FROM `analytics_events.events`
WHERE event_date = CURRENT_DATE()
GROUP BY event_name
ORDER BY count DESC
LIMIT 10
```

#### 4. 접근 제어 테스트

```
사용자: finance_data 데이터셋의 테이블을 보여줘

Claude: [list_tables 도구 호출]

오류: Access denied: Dataset 'finance_data' does not match
required prefix 'analytics_'
```

## 결론

Dataset Prefix 필터링이 적용된 BigQuery MCP 서버를 구현함으로써 다음과 같은 이점을 얻을 수 있습니다:

### 핵심 성과

1. <strong>보안 강화</strong>: AI 에이전트의 데이터 접근 범위를 명확히 제한
2. <strong>성능 향상</strong>: 불필요한 메타데이터 로딩 최소화로 응답 속도 개선
3. <strong>사용성 개선</strong>: 관련 데이터셋만 노출하여 컨텍스트 품질 향상
4. <strong>유연한 설정</strong>: 환경 변수로 간편한 prefix 변경 가능

### 확장 가능성

이 구현을 기반으로 다음과 같은 기능을 추가할 수 있습니다:

- <strong>다중 Prefix 지원</strong>: 여러 개의 prefix 패턴 허용 (예: `analytics_*`, `marketing_*`)
- <strong>역할 기반 접근 제어(RBAC)</strong>: 사용자/그룹별로 다른 prefix 적용
- <strong>감사 로그</strong>: 모든 쿼리 실행 기록 및 모니터링
- <strong>비용 추적</strong>: 쿼리별 BigQuery 사용 비용 측정
- <strong>쿼리 템플릿</strong>: 자주 사용하는 쿼리 패턴을 리소스로 제공

### 다음 단계

1. <strong>프로덕션 배포</strong>: Docker 컨테이너화 및 Kubernetes 배포
2. <strong>모니터링 설정</strong>: Prometheus/Grafana로 성능 메트릭 수집
3. <strong>통합 테스트</strong>: 다양한 시나리오에 대한 자동화된 테스트 작성
4. <strong>문서화</strong>: API 문서 및 사용자 가이드 작성

MCP를 활용한 BigQuery 통합은 AI 에이전트가 안전하고 효율적으로 데이터를 분석할 수 있는 기반을 제공합니다. Dataset Prefix 필터링은 이러한 통합의 보안과 성능을 크게 향상시키는 핵심 기능입니다.

## 참고 자료

### 공식 문서

- [Model Context Protocol 공식 문서](https://modelcontextprotocol.io/)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Google Cloud BigQuery 문서](https://cloud.google.com/bigquery/docs)
- [BigQuery Node.js 클라이언트](https://googleapis.dev/nodejs/bigquery/latest/)

### 관련 리소스

- [MCP 서버 예제 모음](https://github.com/modelcontextprotocol/servers)
- [BigQuery 베스트 프랙티스](https://cloud.google.com/bigquery/docs/best-practices)
- [Google Cloud 서비스 계정 가이드](https://cloud.google.com/iam/docs/service-accounts)
- [TypeScript 공식 문서](https://www.typescriptlang.org/)

### 커뮤니티

- [MCP Discord 커뮤니티](https://discord.gg/modelcontextprotocol)
- [Google Cloud 커뮤니티](https://www.googlecloudcommunity.com/)
- [Stack Overflow - BigQuery 태그](https://stackoverflow.com/questions/tagged/google-bigquery)
