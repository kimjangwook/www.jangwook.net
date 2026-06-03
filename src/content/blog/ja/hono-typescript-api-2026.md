---
title: 'Hono.js + TypeScript でエッジ REST API を作る — Cloudflare Workers 実践'
description: 'Hono v4 + Bun 1.3 + Zod v4 で型安全な REST API を実際に構築した。ルーティング定義・Zod 入力バリデーション・CORS/logger/timing ミドルウェア・Cloudflare Workers デプロイ設定まで、実際のターミナルログと実行コードで解説する。'
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
      ja: 'HonoでZodバリデーションを使う際、Zod v4のスキーマAPIをそのまま活用できる。両記事を並べて読むと、Zod v4移行ポイントが具体的に見えてくる。'
      en: 'When you use @hono/zod-validator in Hono, you are directly using Zod v4 schema APIs. Reading both posts together clarifies where Zod v4 breaking changes show up in practice.'
      zh: '在Hono中使用@hono/zod-validator时，直接用到Zod v4的schema API。两篇文章结合阅读，能清楚看到变更在哪里实际影响你。'
  - slug: 'ollama-fastapi-production-deployment-guide-2026'
    score: 0.74
    reason:
      ko: 'Python 생태계에서 FastAPI가 하는 역할을 JavaScript/TypeScript 생태계에서 Hono가 담당한다.'
      ja: 'PythonエコシステムでFastAPIが担う役割を、JavaScript/TypeScriptエコシステムではHonoが担う。両フレームワークを比べると、エッジコンピューティングのトレンドが言語をまたいでいることが見えてくる。'
      en: 'Hono does for TypeScript what FastAPI does for Python — a lightweight, fast framework for HTTP APIs. Comparing the two reveals how edge computing trends cross language boundaries.'
      zh: 'Hono在TypeScript生态中扮演的角色，正如FastAPI在Python生态中的地位。对比两者，能看清边缘计算趋势如何跨越语言边界。'
  - slug: 'uv-python-ai-development-setup-guide-2026'
    score: 0.68
    reason:
      ko: 'uv가 Python 프로젝트 부트스트랩을 빠르게 만든 것처럼, Bun + Hono도 TypeScript API 서버의 시작 시간을 극적으로 줄인다.'
      ja: 'uvがPythonプロジェクトの起動を速くしたように、Bun+HonoもTypeScript APIサーバーの立ち上がりを劇的に短縮する。「開発ツールのスピード革命」という観点で両記事はつながっている。'
      en: 'Just as uv dramatically speeds up Python project bootstrapping, Bun + Hono does the same for TypeScript API servers. Both stories are about developer tooling going fast.'
      zh: '就像uv大幅加速Python项目启动一样，Bun+Hono也极大缩短了TypeScript API服务器的启动时间。'
---

Express で REST API を書いたことがあるなら、一度は感じたはずだ。ミドルウェア登録、型定義、ボディパーサー設定、Joi や Zod の連携... 構造自体は単純なのに、ボイラープレートが多すぎると。Hono を初めて見たとき、正直半信半疑だった。「また Express クローンだろう」と。実際に使うまでは、そう思っていた。

結論から言うと、Hono v4 は軽くて速いだけではない。TypeScript の型推論がルートハンドラーまで自然に流れ、Zod バリデーションが公式パッケージ一つで繋がり、Bun 上で動かすと Express と比べて体感できるほど応答速度が違う。この記事は 2026 年 6 月にサンドボックスで直接試した結果をもとにしている。

## なぜ Hono なのか — Express、Fastify との比較

Hono のポジションを理解するには、三つの問いに答える必要がある。

**バンドルサイズ**: Hono v4 コアは約 12KB。Express は 58KB、Fastify は 77KB だ。数字だけ見ると大差ないように見えるが、Cloudflare Workers や Deno Deploy といったエッジ環境では、バンドルサイズがコールドスタート時間に直結する。エッジ関数はリクエストごとにランタイムを初期化する場合があり、小さいほど最初のレスポンスが速い。

**ランタイム互換性**: Express は Node.js 専用だ。Fastify も事実上 Node.js がメインターゲット。一方 Hono は最初から「どこでも動く」を設計目標にしていた。Bun、Deno、Cloudflare Workers、Node.js、AWS Lambda Edge まで同じコードでデプロイできる。

**TypeScript サポート**: Express は `@types/express` を別途インストールする必要があり、ミドルウェアで `req` に追加したプロパティの型推論が効かない。Hono は最初から TypeScript で書かれており、`Hono<{ Bindings: Env; Variables: Variables }>` ジェネリクスで環境変数とミドルウェア状態まで型安全に管理できる。

Hono がすべての状況に合うとは言わない。複雑なプラグインエコシステムが必要だったり、チーム全体が Express に慣れているなら、わざわざ変える理由はない。ただエッジデプロイが目標だったり、型安全性を最初から確保したいなら、Hono は現在 TypeScript API フレームワークの中で最も説得力ある選択肢だ。

## インストールと最初のサーバー — 30 秒でレスポンスを受け取る

サンドボックスで直接始めた。Bun 1.3.14 基準だ。

```bash
# 新しいプロジェクトを初期化
bun init -y

# Hono v4 インストール
bun add hono

# Zod バリデーション用パッケージを追加
bun add zod @hono/zod-validator
```

インストール結果:
```
bun add v1.3.14 (0d9b296a)
installed hono@4.12.23
installed @hono/zod-validator@0.8.0
installed zod@4.4.3
```

インストール時間は 500ms 以内だった。Hono の依存関係チェーンがほぼないためだ。

最もシンプルなサーバーを作ってみよう。

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

`export default app` この一行が Bun、Deno、Cloudflare Workers すべてのエントリーポイントとして認識される。Node.js では `serve(app)` を一行追加するだけ。ランタイム分岐コードを別途書く必要がないのが、体感上最も楽だった。

## ミドルウェアスタック — logger、CORS、timing の適用

![Hono ミドルウェアスタック アーキテクチャ](../../../assets/blog/hono-typescript-api-2026/hono-typescript-api-2026-arch.png)

Hono は組み込みミドルウェアを `hono/middleware-name` 形式で分離インポートする。必要なものだけ持ってくるので、バンドルに不要なコードが入らない。

```typescript
import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { cors } from 'hono/cors'
import { timing } from 'hono/timing'

const app = new Hono()

// グローバルミドルウェア登録順が実行順
app.use('*', logger())
app.use('*', cors())
app.use('*', timing())
```

`logger()` ミドルウェアをオンにすると、リクエストごとにこの形式で出力される:

```
<-- GET /tasks
--> GET /tasks 200 0ms
```

実際に実行したとき、応答速度が目に見えた。最初のリクエストは 3ms、以降のリクエストはサーバーサイドで 0ms（sub-millisecond）で処理された。`timing()` ミドルウェアを使うと、レスポンスヘッダーに `Server-Timing` が付いて Chrome DevTools Network タブで各処理ステップを確認できる。

CORS 設定は必要に応じて詳細オプションを指定できる。

```typescript
app.use('*', cors({
  origin: ['https://jangwook.net', 'http://localhost:5173'],
  allowMethods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))
```

`cors()` のデフォルトはすべての origin を許可する。プロダクションでは必ず `origin` を明示的に指定すること。

## Zod で入力バリデーション — 400 エラーを自動で返す

`@hono/zod-validator` は Hono の公式 Zod 統合パッケージだ。ルートハンドラーにミドルウェアとして挟むと、Zod スキーマ検証失敗時に自動で 400 レスポンスを返す。

```typescript
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'

const createTaskSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です').max(100, '100文字以内で入力してください'),
  completed: z.boolean().optional().default(false),
})

// POST ルートに Zod ミドルウェアを適用
app.post('/tasks', zValidator('json', createTaskSchema), (c) => {
  const body = c.req.valid('json')
  // body は z.infer<typeof createTaskSchema> 型で推論される
  // body.title, body.completed ともに型安全
  
  const task = { id: nextId++, ...body, createdAt: new Date().toISOString() }
  tasks.push(task)
  return c.json({ data: task }, 201)
})
```

実際にテストした結果:

```bash
# 空の title で POST を試みる
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":""}'
```

```json
{
  "success": false,
  "error": {
    "name": "ZodError",
    "message": "[{\"code\":\"too_small\",\"minimum\":1,\"path\":[\"title\"],\"message\":\"タイトルは必須です\"}]"
  }
}
```

HTTP 400 レスポンスが自動で返ってきた。ハンドラー内で別途バリデーションコードを書く必要がない。

`c.req.valid('json')` がポイントだ。すでに Zod で検証されたデータが型安全に返される。Zod v4 を使う場合、[Zod v4 と Claude API 構造化出力を組み合わせた例](/ja/blog/ja/typescript-zod-v4-claude-api-structured-output-guide-2026)で触れた API の変更点が `@hono/zod-validator` でも適用される。v3 と v4 の両方に対応しているので問題はない。

## CRUD API 全体の実装 — 実行ログ付き

Task CRUD API 全体を実装して実際に動かした結果だ。インメモリストアを使った（実際のプロダクションでは D1、Prisma、Drizzle などに置き換える）。

```typescript
import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { cors } from 'hono/cors'
import { timing } from 'hono/timing'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'

const app = new Hono()

// ミドルウェア
app.use('*', logger())
app.use('*', cors())
app.use('*', timing())

// 型定義
interface Task {
  id: number
  title: string
  completed: boolean
  createdAt: string
}

// インメモリストア
let tasks: Task[] = [
  { id: 1, title: 'Hono をインストール', completed: true, createdAt: new Date().toISOString() },
  { id: 2, title: 'REST API を作る', completed: false, createdAt: new Date().toISOString() },
]
let nextId = 3

// Zod スキーマ
const createTaskSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です').max(100),
  completed: z.boolean().optional().default(false),
})

const updateTaskSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  completed: z.boolean().optional(),
})

// ルート
app.get('/', (c) => c.json({ name: 'Task API', version: '1.0.0', runtime: 'Bun + Hono' }))

// GET /tasks — クエリパラメーターでフィルタリング
app.get('/tasks', (c) => {
  const completedParam = c.req.query('completed')
  let result = tasks
  if (completedParam !== undefined) {
    result = tasks.filter(t => t.completed === (completedParam === 'true'))
  }
  return c.json({ data: result, total: result.length })
})

// POST /tasks — Zod バリデーション付き
app.post('/tasks', zValidator('json', createTaskSchema), (c) => {
  const body = c.req.valid('json')
  const task: Task = { id: nextId++, ...body, createdAt: new Date().toISOString() }
  tasks.push(task)
  return c.json({ data: task }, 201)
})

// GET /tasks/:id
app.get('/tasks/:id', (c) => {
  const id = parseInt(c.req.param('id'))
  const task = tasks.find(t => t.id === id)
  if (!task) return c.json({ error: 'Task not found' }, 404)
  return c.json({ data: task })
})

// PATCH /tasks/:id — 部分更新
app.patch('/tasks/:id', zValidator('json', updateTaskSchema), (c) => {
  const id = parseInt(c.req.param('id'))
  const body = c.req.valid('json')
  const index = tasks.findIndex(t => t.id === id)
  if (index === -1) return c.json({ error: 'Task not found' }, 404)
  tasks[index] = { ...tasks[index], ...body }
  return c.json({ data: tasks[index] })
})

// DELETE /tasks/:id
app.delete('/tasks/:id', (c) => {
  const id = parseInt(c.req.param('id'))
  const index = tasks.findIndex(t => t.id === id)
  if (index === -1) return c.json({ error: 'Task not found' }, 404)
  tasks.splice(index, 1)
  return c.json({ message: 'Deleted successfully' })
})

export default app
```

実際のターミナル出力:

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

<-- POST /tasks  (空の title)
--> POST /tasks 400 0ms
```

パフォーマンス数値: 最初のリクエスト 4ms、以降のウォーム状態で 0ms（sub-millisecond）。同じマシンで Express を動かしたときはウォーム状態でも 1〜2ms が記録された。実際のプロダクションエッジ環境ではその差はさらに大きくなるかもしれない。

## Cloudflare Workers へのデプロイ — コード変更なし

Hono の最大の利点の一つは、デプロイターゲットを変えてもコードをほぼ修正しなくていい点だ。

```bash
# Wrangler CLI インストール
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

Cloudflare Workers 環境で環境変数の型を Hono に連携する方法:

```typescript
// src/worker.ts
import { Hono } from 'hono'
import { cors } from 'hono/cors'

type Bindings = {
  ENVIRONMENT: string
  DB: D1Database        // Cloudflare D1 バインディング
  KV: KVNamespace       // Cloudflare KV バインディング
}

type Variables = {
  userId: string        // 認証ミドルウェアで設定
}

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>()

app.use('*', cors())

app.get('/health', (c) => {
  return c.json({ 
    env: c.env.ENVIRONMENT,    // 型安全: string
    timestamp: new Date().toISOString()
  })
})

export default app
```

```bash
# ローカルで Cloudflare Workers 環境をシミュレート
wrangler dev

# プロダクションデプロイ
wrangler deploy
```

実際の Cloudflare アカウントなしでは `wrangler deploy` まで検証できなかった。ただし、コード構造自体は上記のとおりで、ローカル Bun サーバーと変わる部分は `c.env.DB` のようなバインディングへのアクセス方法だけだ。

[Cloudflare Workers ベースのエージェントインフラ](/ja/blog/ja/cloudflare-agents-week-2026-autonomous-infrastructure)と組み合わせると、Hono は単純な REST API フレームワーク以上の役割を持つ。Cloudflare Workers 上でエージェント API レイヤーとして活発に使われているのも、この組み合わせの強みによる。

## 型安全なミドルウェアを書く — Variables の活用

Express では `req.user` を型安全に使おうとするとインターフェースの拡張が必要だった。Hono では `Variables` ジェネリクスでより明確に扱える。

```typescript
type Variables = {
  userId: string
  requestId: string
}

const app = new Hono<{ Variables: Variables }>()

// 認証ミドルウェア
app.use('/tasks/*', async (c, next) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  
  c.set('userId', 'user-123')
  c.set('requestId', crypto.randomUUID())
  
  await next()
})

// ルートで型安全にアクセス
app.get('/tasks', (c) => {
  const userId = c.get('userId')      // string 型で推論される
  const requestId = c.get('requestId') // string 型で推論される
  return c.json({ userId, requestId })
})
```

## 気になった点

Hono を実際に使ってみて感じた限界もある。

**エコシステムの深さ**: Fastify はプラグインエコシステムが充実している。`fastify-swagger` で OpenAPI スペックを自動生成したり、`fastify-multipart` でファイルアップロードを処理するなど、検証済みのプラグインが多い。Hono はまだこういったサードパーティエコシステムが薄い。公式ミドルウェアが基本的な機能のほとんどをカバーするが、特殊な要件があると自前実装が必要になることがある。

**D1 ローカル開発体験**: Cloudflare D1 をローカルでシミュレートするには `wrangler dev` が必要で、実際の Cloudflare アカウントが要る。SQLite ベースなので Drizzle や Prisma といった ORM は使いやすいが、ローカル開発環境の設定は Express + PostgreSQL の組み合わせより複雑だ。

エッジデプロイが目標でなく一般的なサーバー環境なら、Fastify の方が Hono より成熟した選択だ。[Ollama + FastAPI の組み合わせ](/ja/blog/ja/ollama-fastapi-production-deployment-guide-2026)のように言語とランタイムを変えるのも現実的な選択肢だ。

## Hono を選ぶべきタイミング

私の判断をまとめると:

Hono を使うべき場合:
- Cloudflare Workers、Deno Deploy、Bun などエッジ/サーバーレス環境がデプロイ先
- 最初から TypeScript 型安全性を最大化したいとき
- バンドルサイズとコールドスタート時間がパフォーマンスに直結するサービス
- チームが小さく、ボイラープレートなしで素早く始めたいとき

Hono をわざわざ選ぶ必要がない場合:
- チームが Express や Fastify に慣れており、エッジデプロイ計画がないとき
- 複雑なプラグインエコシステムが必要な大規模エンタープライズサービス
- レガシー Node.js コードベースとの統合が多く必要な場合

2026 年時点で Hono の GitHub スターは 66,000 を超えた。[Bun Shell ベースの自動化環境をすでに構築しているなら](/ja/blog/ja/bun-shell-scripting-practical-guide-2026)、Hono を加えるのは自然な次のステップだ。

## よく使うパターン チートシート

Hono を使い始めたとき、よく調べることになるパターンをまとめた。

```typescript
// クエリパラメーターを取得
const page = c.req.query('page') ?? '1'
const limit = parseInt(c.req.query('limit') ?? '10')

// パスパラメーターを取得
const id = c.req.param('id')

// リクエストヘッダーを取得
const auth = c.req.header('Authorization')

// JSON レスポンス（ステータスコード付き）
return c.json({ data: result }, 201)

// テキストレスポンス
return c.text('OK')

// リダイレクト
return c.redirect('/new-path', 301)

// ストリーミングレスポンス
return c.stream(async (stream) => {
  for (const chunk of chunks) {
    await stream.write(chunk)
    await stream.sleep(100)
  }
})

// コンテキストから環境変数（Cloudflare Workers）
const dbUrl = c.env.DATABASE_URL

// ルートグループ化
const api = new Hono()
api.get('/users', ...)
api.post('/users', ...)
app.route('/api/v1', api)
```

## まとめ — 実際に使ってみた後のメモ

この記事はサンドボックスで `bun add hono @hono/zod-validator zod` の一行から始め、CRUD API を直接動かした結果だ。インメモリストアという制限はあるが、ルーティング、ミドルウェア、Zod バリデーションがどう組み合わさるかは十分に確認できた。

最も印象的だったのは型推論だ。`c.req.valid('json')` で受け取ったデータが Zod スキーマから推論された型としてそのまま使える。`c.set('userId', ...)` で保存したデータが `c.get('userId')` で `string` として返ってくる。ミドルウェアチェーンを経ても TypeScript が型情報を失わない。

Express を使い続ける理由がないとは言い切らない。ただ、新しいプロジェクトを TypeScript と Bun で始めながらエッジデプロイを念頭に置いているなら、Hono は今すぐ検討できるレベルにある。

---

**実験環境**
- Bun: 1.3.14
- hono: 4.12.23
- @hono/zod-validator: 0.8.0
- zod: 4.4.3
- typescript: 5.9.3
- macOS 15.x (Apple Silicon)
