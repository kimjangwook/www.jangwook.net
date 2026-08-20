# Sandbox Execution Log — hono-typescript-api-2026

## Environment
- Date: 2026-06-03
- Bun: 1.3.14
- hono: 4.12.23
- @hono/zod-validator: 0.8.0
- zod: 4.4.3
- typescript: 5.9.3

## Installation
```
bun add hono @hono/zod-validator zod
# 5 packages installed [221.00ms] (first run)
# 2 packages installed [347.00ms]
```

## API Endpoints Tested

### GET /
```json
{ "name": "Task API", "version": "1.0.0", "runtime": "Bun + Hono" }
```
Response: 200, 4ms

### GET /tasks
Response: 200, 2ms
Returns 2 initial tasks

### POST /tasks
Body: { "title": "Cloudflare Workers에 배포하기" }
Response: 201, 4ms
Created task with id: 3

### GET /tasks/3
Response: 200, 0ms

### PATCH /tasks/2
Body: { "completed": true }
Response: 200, 0ms

### DELETE /tasks/1
Response: 200, 0ms

### POST /tasks (Validation Error)
Body: { "title": "" }
Response: 400
Zod error: "제목은 필수입니다" (min 1 char)

## Performance Benchmark
- Request 1: 38ms total (3ms server-side)
- Request 2: 16ms total (0ms server-side)
- Request 3: 15ms total (0ms server-side)
- Request 4: 14ms total (0ms server-side)
- Request 5: 13ms total (0ms server-side)

## Key Finding
Hono의 logger() 미들웨어 로그 형식:
<-- GET /tasks
--> GET /tasks 200 0ms
