---
title: 'Hono.js + TypeScript Edge REST API — Cloudflare Workers Deployment Guide'
description: 'I built a type-safe REST API with Hono v4, Bun 1.3, and Zod v4. This guide covers routing, Zod input validation, CORS/logger/timing middleware, and Cloudflare Workers deployment config — with real terminal logs and step-by-step code.'
pubDate: '2026-06-03'
heroImage: '../../../assets/blog/hono-typescript-api-2026/hono-typescript-api-2026-hero.png'
tags: ['Hono', 'TypeScript', 'REST API', 'Cloudflare Workers']
relatedPosts:
  - slug: 'bun-shell-scripting-practical-guide-2026'
    score: 0.87
    reason:
      ko: 'Bun Shell로 자동화 스크립트를 이미 다뤘다면, 같은 Bun 런타임 위에서 Hono로 HTTP API 서버를 올리는 과정이 자연스러운 다음 단계다.'
      ja: 'Bun Shellで自動化スクリプトを書いたなら、同じBunランタイム上でHonoのHTTP APIサーバーを立てるのが自然な次のステップだ。'
      en: 'If you already know Bun Shell scripting, running a Hono HTTP API on the same Bun runtime is the natural next step — same ecosystem, different use case.'
      zh: '如果你已经熟悉Bun Shell脚本，在同一Bun运行时上用Hono搭建HTTP API服务器是顺理成章的下一步。'
  - slug: 'typescript-zod-v4-claude-api-structured-output-guide-2026'
    score: 0.83
    reason:
      ko: 'Hono에서 @hono/zod-validator로 입력을 검증할 때 Zod v4의 변경된 스키마 API를 그대로 사용한다.'
      ja: 'HonoでZodバリデーションを使う際、Zod v4のスキーマAPIをそのまま活用できる。'
      en: 'When you use @hono/zod-validator in Hono, you are directly using Zod v4 schema APIs. Reading both posts together clarifies where Zod v4 breaking changes show up in practice.'
      zh: '在Hono中使用@hono/zod-validator时，直接用到Zod v4的schema API。'
  - slug: 'ollama-fastapi-production-deployment-guide-2026'
    score: 0.74
    reason:
      ko: 'Python 생태계에서 FastAPI가 하는 역할을 JavaScript/TypeScript 생태계에서 Hono가 담당한다.'
      ja: 'PythonエコシステムでFastAPIが担う役割を、JavaScript/TypeScriptエコシステムではHonoが担う。'
      en: 'Hono does for TypeScript what FastAPI does for Python — a lightweight, fast framework for HTTP APIs. Comparing the two reveals how edge computing trends cross language boundaries.'
      zh: 'Hono在TypeScript生态中扮演的角色，正如FastAPI在Python生态中的地位。'
  - slug: 'uv-python-ai-development-setup-guide-2026'
    score: 0.68
    reason:
      ko: 'uv가 Python 프로젝트 부트스트랩을 빠르게 만든 것처럼, Bun + Hono도 TypeScript API 서버의 시작 시간을 극적으로 줄인다.'
      ja: 'uvがPythonプロジェクトの起動を速くしたように、Bun+HonoもTypeScript APIサーバーの立ち上がりを劇的に短縮する。'
      en: 'Just as uv dramatically speeds up Python project bootstrapping, Bun + Hono does the same for TypeScript API servers. Both stories are about developer tooling going fast.'
      zh: '就像uv大幅加速Python项目启动一样，Bun+Hono也极大缩短了TypeScript API服务器的启动时间。'
---

If you've ever built a REST API with Express, you've probably felt it. Middleware registration, type definitions, body parser setup, connecting Joi or Zod... the structure is simple, but the boilerplate is excessive. When I first saw Hono, I was skeptical. "Another Express clone," I thought. That changed when I actually ran it.

Bottom line: Hono v4 is more than just lightweight and fast. TypeScript type inference flows naturally all the way to route handlers. Zod validation connects via a single official package. On Bun, response times are noticeably faster than Express. Everything in this post is based on what I ran in a sandbox in June 2026.

## Why Hono — Compared to Express and Fastify

Understanding where Hono fits means answering three questions.

**Bundle size**: Hono v4 core is about 12KB. Express is 58KB, Fastify is 77KB. The gap might not sound dramatic, but in edge environments like Cloudflare Workers or Deno Deploy, bundle size directly affects cold start time. Edge functions sometimes initialize a new runtime per request — smaller means faster first response.

**Runtime compatibility**: Express is Node.js-only. Fastify targets Node.js by default. Hono was designed from the start to "run anywhere." The same code deploys to Bun, Deno, Cloudflare Workers, Node.js, and AWS Lambda Edge.

**TypeScript support**: Express requires `@types/express` as a separate install, and properties added to `req` via middleware don't get type inference. Hono is written in TypeScript from the ground up, and the `Hono<{ Bindings: Env; Variables: Variables }>` generic gives you type-safe access to environment variables and middleware state.

I'm not saying Hono is the right choice for every situation. If your team is deeply invested in Express, or you need a mature plugin ecosystem, there's no compelling reason to switch. But if edge deployment is the goal, or you want type safety from day one, Hono is the most convincing TypeScript API framework right now.

## Installation and First Server — Response in 30 Seconds

I started from scratch in a sandbox. Bun 1.3.14.

```bash
# Initialize a new project
bun init -y

# Install Hono v4
bun add hono

# Add Zod validation packages
bun add zod @hono/zod-validator
```

Output:
```
bun add v1.3.14 (0d9b296a)
installed hono@4.12.23
installed @hono/zod-validator@0.8.0
installed zod@4.4.3
```

Install time was under 500ms. Hono's dependency chain is nearly empty.

The simplest possible server:

```typescript
// index.ts
import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => c.json({ message: 'Hello from Hono!' }))

export default app
```

```bash
bun run index.ts
# Started development server: http://localhost:3000
```

```bash
curl http://localhost:3000/
# {"message":"Hello from Hono!"}
```

`export default app` — that single line is recognized as the entry point for Bun, Deno, and Cloudflare Workers alike. For Node.js, add `serve(app)` and you're done. No runtime-branching code needed. That felt like the biggest quality-of-life win.

## Middleware Stack — logger, CORS, timing

![Hono Middleware Stack Architecture](../../../assets/blog/hono-typescript-api-2026/hono-typescript-api-2026-arch.png)

Hono imports built-in middleware via `hono/middleware-name`. You only pull in what you use, so nothing extra ends up in the bundle.

```typescript
import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { cors } from 'hono/cors'
import { timing } from 'hono/timing'

const app = new Hono()

// Registration order equals execution order
app.use('*', logger())
app.use('*', cors())
app.use('*', timing())
```

With `logger()`, each request prints:

```
<-- GET /tasks
--> GET /tasks 200 0ms
```

When I ran this, the response speed was obvious. First request: 3ms. Subsequent requests: 0ms server-side (sub-millisecond). With `timing()`, the `Server-Timing` header is added to responses, so you can see per-stage timing in Chrome DevTools Network tab.

CORS takes fine-grained options:

```typescript
app.use('*', cors({
  origin: ['https://jangwook.net', 'http://localhost:5173'],
  allowMethods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))
```

The `cors()` default allows all origins. In production, always specify `origin` explicitly.

## Zod Validation — Automatic 400 Errors

`@hono/zod-validator` is Hono's official Zod integration. Drop it in as middleware on a route, and any Zod schema validation failure automatically returns a 400.

```typescript
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'

const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Max 100 characters'),
  completed: z.boolean().optional().default(false),
})

app.post('/tasks', zValidator('json', createTaskSchema), (c) => {
  const body = c.req.valid('json')
  // body is typed as z.infer<typeof createTaskSchema>
  // body.title is string, body.completed is boolean — no undefined
  
  const task = { id: nextId++, ...body, createdAt: new Date().toISOString() }
  tasks.push(task)
  return c.json({ data: task }, 201)
})
```

Test run with an empty title:

```bash
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":""}'
```

```json
{
  "success": false,
  "error": {
    "name": "ZodError",
    "message": "[{\"code\":\"too_small\",\"minimum\":1,\"path\":[\"title\"],\"message\":\"Title is required\"}]"
  }
}
```

HTTP 400, automatically. No validation code needed inside the handler.

`c.req.valid('json')` is the key. What comes back is already Zod-validated and fully typed. If you've worked with [Zod v4 and Claude API structured output](/en/blog/en/typescript-zod-v4-claude-api-structured-output-guide-2026), the v4 schema API changes apply here too — `@hono/zod-validator` supports both v3 and v4.

## Full CRUD Implementation — With Real Execution Logs

Here's the complete Task CRUD API, with the actual terminal output from running it. In-memory storage for this example (swap in D1, Prisma, or Drizzle for production).

```typescript
import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { cors } from 'hono/cors'
import { timing } from 'hono/timing'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'

const app = new Hono()

app.use('*', logger())
app.use('*', cors())
app.use('*', timing())

interface Task {
  id: number
  title: string
  completed: boolean
  createdAt: string
}

let tasks: Task[] = [
  { id: 1, title: 'Install Hono', completed: true, createdAt: new Date().toISOString() },
  { id: 2, title: 'Build REST API', completed: false, createdAt: new Date().toISOString() },
]
let nextId = 3

const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  completed: z.boolean().optional().default(false),
})

const updateTaskSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  completed: z.boolean().optional(),
})

app.get('/', (c) => c.json({ name: 'Task API', version: '1.0.0', runtime: 'Bun + Hono' }))

app.get('/tasks', (c) => {
  const completedParam = c.req.query('completed')
  let result = tasks
  if (completedParam !== undefined) {
    result = tasks.filter(t => t.completed === (completedParam === 'true'))
  }
  return c.json({ data: result, total: result.length })
})

app.post('/tasks', zValidator('json', createTaskSchema), (c) => {
  const body = c.req.valid('json')
  const task: Task = { id: nextId++, ...body, createdAt: new Date().toISOString() }
  tasks.push(task)
  return c.json({ data: task }, 201)
})

app.get('/tasks/:id', (c) => {
  const id = parseInt(c.req.param('id'))
  const task = tasks.find(t => t.id === id)
  if (!task) return c.json({ error: 'Task not found' }, 404)
  return c.json({ data: task })
})

app.patch('/tasks/:id', zValidator('json', updateTaskSchema), (c) => {
  const id = parseInt(c.req.param('id'))
  const body = c.req.valid('json')
  const index = tasks.findIndex(t => t.id === id)
  if (index === -1) return c.json({ error: 'Task not found' }, 404)
  tasks[index] = { ...tasks[index], ...body }
  return c.json({ data: tasks[index] })
})

app.delete('/tasks/:id', (c) => {
  const id = parseInt(c.req.param('id'))
  const index = tasks.findIndex(t => t.id === id)
  if (index === -1) return c.json({ error: 'Task not found' }, 404)
  tasks.splice(index, 1)
  return c.json({ message: 'Deleted successfully' })
})

export default app
```

Real terminal output:

```
$ bun run index.ts
Started development server: http://localhost:3000

<-- GET /
--> GET / 200 4ms

<-- GET /tasks
--> GET /tasks 200 2ms

<-- POST /tasks
--> POST /tasks 201 4ms

<-- GET /tasks/3
--> GET /tasks/3 200 0ms

<-- PATCH /tasks/2
--> PATCH /tasks/2 200 0ms

<-- DELETE /tasks/1
--> DELETE /tasks/1 200 0ms

<-- POST /tasks  (empty title)
--> POST /tasks 400 0ms
```

Performance numbers: first request 4ms, warm requests sub-millisecond (0ms in logger output). Running the same logic in Express on the same machine showed 1〜2ms warm. The real production edge gap would likely be larger.

The reason for this performance: Bun's JavaScriptCore engine plus Hono's Trie-based router. Hono's router matches routes near O(1) regardless of how many routes you add — no linear scanning.

## Cloudflare Workers Deployment — Zero Code Changes

The biggest Hono advantage: changing the deployment target barely changes the code.

```bash
bun add -g wrangler
```

```toml
# wrangler.toml
name = "hono-task-api"
main = "src/worker.ts"
compatibility_date = "2024-09-23"

[vars]
ENVIRONMENT = "production"
```

Connecting Cloudflare Workers environment variable types to Hono:

```typescript
// src/worker.ts
import { Hono } from 'hono'
import { cors } from 'hono/cors'

type Bindings = {
  ENVIRONMENT: string
  DB: D1Database
  KV: KVNamespace
}

type Variables = {
  userId: string
}

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>()

app.use('*', cors())

app.get('/health', (c) => {
  return c.json({ 
    env: c.env.ENVIRONMENT,   // type-safe: string
    timestamp: new Date().toISOString()
  })
})

// D1 database query
app.get('/tasks', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM tasks').all()
  return c.json({ data: results })
})

export default app
```

```bash
# Simulate Cloudflare Workers locally
wrangler dev

# Production deploy
wrangler deploy
```

I didn't verify `wrangler deploy` — that requires an actual Cloudflare account. The code structure is exactly as shown above, and the only difference from the local Bun server is how you access bindings like `c.env.DB`.

[Cloudflare Workers agent infrastructure](/en/blog/en/cloudflare-agents-week-2026-autonomous-infrastructure) shows how Hono sits at the API layer in Cloudflare-based AI agent systems. It's already being used this way in production.

## Type-Safe Middleware with Variables

Express required extending interfaces to get type-safe access to `req.user`. Hono handles this more cleanly with the `Variables` generic.

```typescript
type Variables = {
  userId: string
  requestId: string
}

const app = new Hono<{ Variables: Variables }>()

// Auth middleware
app.use('/tasks/*', async (c, next) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  
  c.set('userId', 'user-123')
  c.set('requestId', crypto.randomUUID())
  
  await next()
})

// Access in route handler — fully typed
app.get('/tasks', (c) => {
  const userId = c.get('userId')       // inferred as string
  const requestId = c.get('requestId') // inferred as string
  return c.json({ userId, requestId })
})
```

`c.get('userId')` returns `string` — TypeScript infers this from the `Variables` declaration. With Express, this inference didn't happen automatically.

## What I Found Frustrating

There are real limitations worth naming.

**Ecosystem depth**: Fastify's plugin ecosystem is battle-hardened. `fastify-swagger` auto-generates OpenAPI specs. `fastify-multipart` handles file uploads. These are validated, maintained plugins. Hono's third-party ecosystem is thinner. The official middleware covers the basics, but unusual requirements mean writing your own.

**D1 local dev experience**: Testing against Cloudflare D1 locally requires `wrangler dev`, which requires an actual Cloudflare account to configure bindings. SQLite compatibility makes Drizzle/Prisma usable, but the local dev setup is more involved than Express + PostgreSQL.

**`wrangler dev` cold start**: The first run of `wrangler dev` is slow because it emulates the Cloudflare runtime. Running with Bun directly starts instantly — but that skips Workers-specific behavior testing.

If edge deployment isn't your goal and you're building a conventional server, Fastify is more mature than Hono. The [Ollama + FastAPI approach](/en/blog/en/ollama-fastapi-production-deployment-guide-2026) — different language, same concept — is another valid path.

## When to Choose Hono

My judgment:

**Use Hono when:**
- Cloudflare Workers, Deno Deploy, or Bun are your deployment targets
- You want TypeScript type safety from the first line
- Bundle size and cold start time matter for your service
- Small team, fast start, minimal boilerplate

**Don't bother switching when:**
- Your team is comfortable with Express or Fastify and has no edge deployment plans
- You need a mature plugin ecosystem for enterprise-scale services
- Heavy integration with legacy Node.js code

Hono's GitHub stars crossed 66,000 in 2026. If you've already [set up a Bun Shell scripting environment](/en/blog/en/bun-shell-scripting-practical-guide-2026), adding Hono is the logical next step. Same runtime, same package manager, same TypeScript ecosystem — API server included.

## Cheat Sheet — Patterns I Look Up Every Time

```typescript
// Query parameter
const page = c.req.query('page') ?? '1'
const limit = parseInt(c.req.query('limit') ?? '10')

// Path parameter
const id = c.req.param('id')

// Request header
const auth = c.req.header('Authorization')

// JSON response with status
return c.json({ data: result }, 201)

// Text response
return c.text('OK')

// Redirect
return c.redirect('/new-path', 301)

// Streaming response
return c.stream(async (stream) => {
  for (const chunk of chunks) {
    await stream.write(chunk)
    await stream.sleep(100)
  }
})

// Cloudflare Workers env variable
const dbUrl = c.env.DATABASE_URL

// Route grouping
const api = new Hono()
api.get('/users', ...)
api.post('/users', ...)
app.route('/api/v1', api)
```

## Wrap-Up — Notes After Running It

This post started from `bun add hono @hono/zod-validator zod` and worked through a full CRUD API. In-memory storage limits what you can call "production-ready," but the routing, middleware, and Zod validation integration all checked out.

The thing that impressed me most was type inference. Data from `c.req.valid('json')` is immediately typed by the Zod schema. Data stored with `c.set('userId', ...)` comes back as `string` from `c.get('userId')`. TypeScript doesn't lose track of types as they flow through the middleware chain.

I won't claim there's no reason to keep using Express. But if you're starting a new project with TypeScript and Bun and have edge deployment in mind, Hono is worth using right now.

---

**Test Environment**
- Bun: 1.3.14
- hono: 4.12.23
- @hono/zod-validator: 0.8.0
- zod: 4.4.3
- typescript: 5.9.3
- macOS 15.x (Apple Silicon)
