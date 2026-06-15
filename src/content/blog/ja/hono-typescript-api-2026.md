---
title: Hono.js + TypeScript でエッジ REST API を作る — Cloudflare Workers 実践
description: >-
  Hono v4 + Bun 1.3 + Zod v4 で型安全な REST API を実際に構築した。ルーティング定義・Zod
  入力バリデーション・CORS/logger/timing ミドルウェア・Cloudflare Workers
  デプロイ設定まで、実際のターミナルログと実行コードで解説する。
pubDate: '2026-06-03'
heroImage: >-
  ../../../assets/blog/hono-typescript-api-2026/hono-typescript-api-2026-hero.png
tags:
  - Hono
  - TypeScript
  - REST API
  - Cloudflare Workers
relatedPosts:
  - slug: mcp-server-typescript-sdk-step-by-step-2026
    score: 0.9
    reason:
      ko: TypeScript 주제를 한 단계 더 깊이 파고드는 글입니다.
      en: Goes one level deeper into TypeScript.
      ja: TypeScriptをもう一歩深く掘り下げた記事です。
      zh: 更深入地探讨 TypeScript 主题。
  - slug: vitest-4-jest-migration-guide-2026
    score: 0.85
    reason:
      ko: TypeScript를 실제로 다뤄본 경험이 이어지는 글입니다.
      en: Continues the hands-on TypeScript experience.
      ja: TypeScriptを実際に扱った経験が続く記事です。
      zh: 延续 TypeScript 的实战经验。
  - slug: bun-shell-scripting-practical-guide-2026
    score: 0.8
    reason:
      ko: 같은 TypeScript 흐름에서 함께 읽으면 좋습니다.
      en: Worth reading alongside this in the same TypeScript track.
      ja: 同じTypeScriptの流れで併せて読むと役立ちます。
      zh: 在同一 TypeScript 脉络中可一并阅读。
faq:
  - question: "Hono でエッジ REST API を作る基本の流れは?"
    answer: "bun add hono @hono/zod-validator zod でインストールし、new Hono() でアプリを作って app.get/post などでルートを定義する。export default app の一行が Bun・Deno・Cloudflare Workers のエントリポイントとして認識され、Node.js では serve(app) を足すだけでよい。"
  - question: "Hono と Express の違いは?"
    answer: "Hono のコアは約 12KB で Express の 58KB より軽く、コールドスタートが速い。最初から TypeScript で書かれており、型パッケージなしでルートハンドラーやミドルウェアの状態まで型推論が流れる。Express と違い同一コードで Bun・Deno・Cloudflare Workers・Node.js にデプロイできる。"
  - question: "Cloudflare Workers へのデプロイ方法は?"
    answer: "wrangler.toml にエントリポイントを指定し、Bindings ジェネリックで D1 や KV などの環境変数型を結びつけたうえで wrangler deploy する。ローカルの Bun サーバーとコード構造は同じで、c.env.DB のようなバインディングアクセスだけが異なる。"
  - question: "Zod の入力バリデーションはどう処理される?"
    answer: "@hono/zod-validator の zValidator をルートのミドルウェアとして挟むと、スキーマ検証に失敗した際に自動で HTTP 400 を返す。ハンドラー内では c.req.valid('json') で検証済みのデータを型安全に受け取れる。"
---

Express で REST API を書いたことがあるなら、一度は感じたはずだ。ミドルウェア登録、型定義、ボディパーサー設定、Joi や Zod の連携... 構造自体は単純なのに、ボイラープレートが多すぎると。Hono を初めて見たとき、正直半信半疑だった。「また Express クローンだろう」と。実際に使うまでは、そう思っていた。

結論から言うと、Hono v4 は軽くて速いだけではない。TypeScript の型推論がルートハンドラーまで自然に流れ、Zod バリデーションが公式パッケージ一つで繋がり、Bun 上で動かすと Express と比べて体感できるほど応答速度が違う。この記事は 2026 年 6 月にサンドボックスで直接試した結果をもとにしている。

## なぜ Hono なのか: Express、Fastify との比較

Hono のポジションを理解するには、三つの問いに答える必要がある。

**バンドルサイズ**: Hono v4 コアは約 12KB。Express は 58KB、Fastify は 77KB だ。数字だけ見ると大差ないように見えるが、Cloudflare Workers や Deno Deploy といったエッジ環境では、バンドルサイズがコールドスタート時間に直結する。エッジ関数はリクエストごとにランタイムを初期化する場合があり、小さいほど最初のレスポンスが速い。

**ランタイム互換性**: Express は Node.js 専用だ。Fastify も事実上 Node.js がメインターゲット。一方 Hono は最初から「どこでも動く」を設計目標にしていた。Bun、Deno、Cloudflare Workers、Node.js、AWS Lambda Edge まで同じコードでデプロイできる。

**TypeScript サポート**: Express は `@types/express` を別途インストールする必要があり、ミドルウェアで `req` に追加したプロパティの型推論が効かない。Hono は最初から TypeScript で書かれており、`Hono<{ Bindings: Env; Variables: Variables }>` ジェネリクスで環境変数とミドルウェア状態まで型安全に管理できる。

Hono がすべての状況に合うとは言わない。複雑なプラグインエコシステムが必要だったり、チーム全体が Express に慣れているなら、わざわざ変える理由はない。ただエッジデプロイが目標だったり、型安全性を最初から確保したいなら、Hono は現在 TypeScript API フレームワークの中で最も説得力ある選択肢だ。

## インストールと最初のサーバー: 30 秒でレスポンスを受け取る

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

## ミドルウェアスタック: logger、CORS、timing の適用

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

## Zod で入力バリデーション: 400 エラーを自動で返す

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

`c.req.valid('json')` がポイントだ。すでに Zod で検証されたデータが型安全に返される。Zod v4 を使う場合、Zod v4 と Claude API 構造化出力を組み合わせた例で触れた API の変更点が `@hono/zod-validator` でも適用される。v3 と v4 の両方に対応しているので問題はない。

## CRUD API 全体の実装: 実行ログ付き

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

## Cloudflare Workers へのデプロイ: コード変更なし

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

Cloudflare Workers ベースのエージェントインフラと組み合わせると、Hono は単純な REST API フレームワーク以上の役割を持つ。Cloudflare Workers 上でエージェント API レイヤーとして活発に使われているのも、この組み合わせの強みによる。

## 型安全なミドルウェアを書く: Variables の活用

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

## Hono vs Express: いつ使い、いつ避けるか

両方のフレームワークを実際に触ったうえでまとめた判断基準だ。抽象的な「速い」ではなく、実プロジェクトに当てはめられる表にした。

| 状況 | Hono 推奨 | Express 推奨 |
|------|----------|-------------|
| デプロイ先が Cloudflare Workers / Deno Deploy / Bun | ✓ | |
| コールドスタートとバンドルサイズがレイテンシに直結 | ✓ | |
| 最初から TypeScript の型推論を最後まで効かせたい | ✓ | |
| チームが Express ミドルウェアの生態系に深く依存 | | ✓ |
| `passport`、`multer` など実績ある Express プラグインが要 | | ✓ |
| レガシーな Node.js コードベースに段階的に乗せる | | ✓ |
| OpenAPI 自動ドキュメント化が必須要件 | ✓ (`@hono/zod-openapi`) | ✓ (`swagger-jsdoc`) |

Hono を避けるべき現実的なケースは二つだ。一つ目は、チーム全体が Express に慣れていてエッジデプロイの予定が一切ないとき。フレームワークを変えるコストが得られる利益を上回る。二つ目は、特定の Express 専用プラグインに強く縛られているとき。Hono は標準の `Request`/`Response` を使うため、Express ミドルウェアをそのまま持ち込めない。

逆に、新規プロジェクトでデプロイ先がサーバーレス、TypeScript が標準言語なら、あえて Express を選ぶ理由は見つけにくい。公式の [Getting Started](https://hono.dev/docs/getting-started/basic) を 1 ページ追うだけで動くサーバーが出来上がる。

## 参照した一次情報

本記事のコードと数値は、以下の公式ドキュメントを直接たどって確認した。

- [Hono 公式ドキュメント — Getting Started](https://hono.dev/docs/getting-started/basic): 基本的なアプリ構造、ルーティング、ランタイム別エントリポイント
- [Hono 公式ドキュメント — Cloudflare Workers](https://hono.dev/docs/getting-started/cloudflare-workers): Bindings ジェネリクスと `wrangler` のデプロイフロー
- [Cloudflare Workers 公式ガイド — Hono](https://developers.cloudflare.com/workers/frameworks/framework-guides/hono/): Workers ランタイムでの Hono プロジェクト構成とデプロイ
- [Zod 公式ドキュメント](https://zod.dev/): スキーマ定義と型推論、`@hono/zod-validator` が依存する検証ルール

各ドキュメントのバージョンは 2026 年 6 月時点であり、Hono v4 系の API に従っている。

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

## まとめ: 実際に使ってみた後のメモ

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
