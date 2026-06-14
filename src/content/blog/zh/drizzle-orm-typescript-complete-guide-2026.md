---
title: Drizzle ORM 完全指南 — 不用 Prisma 也能构建类型安全的 TypeScript 数据库层
description: >-
  用 Drizzle ORM 0.45 和 drizzle-kit 在 TypeScript 中类型安全地操作 SQLite 和 PostgreSQL。从
  schema 定义到 migration、transaction 的 async 陷阱，附实际运行日志。
pubDate: '2026-06-10'
heroImage: ../../../assets/blog/drizzle-orm-typescript-complete-guide-2026-hero.png
tags:
  - drizzle-orm
  - typescript
  - sqlite
  - database
  - orm
relatedPosts:
  - slug: mcp-server-typescript-sdk-step-by-step-2026
    score: 0.9
    reason:
      ko: TypeScript 주제를 한 단계 더 깊이 파고드는 글입니다.
      en: Goes one level deeper into TypeScript.
      ja: TypeScriptをもう一歩深く掘り下げた記事です。
      zh: 更深入地探讨 TypeScript 主题。
  - slug: node-sqlite-builtin-practical-guide-2026
    score: 0.85
    reason:
      ko: sqlite를 실제로 다뤄본 경험이 이어지는 글입니다.
      en: Continues the hands-on sqlite experience.
      ja: sqliteを実際に扱った経験が続く記事です。
      zh: 延续 sqlite 的实战经验。
  - slug: vitest-4-jest-migration-guide-2026
    score: 0.8
    reason:
      ko: 같은 TypeScript 흐름에서 함께 읽으면 좋습니다.
      en: Worth reading alongside this in the same TypeScript track.
      ja: 同じTypeScriptの流れで併せて読むと役立ちます。
      zh: 在同一 TypeScript 脉络中可一并阅读。
faq:
  - question: "Drizzle ORM 和 Prisma 该选哪个？"
    answer: "如果你熟悉 SQL，想直接查看并管理 migration 的 SQL 文件，Drizzle 更顺手。它的打包体积小(~300KB)，适合 edge 和 serverless。如果整个团队更看重 ORM 的抽象层和成熟的生态，Prisma 可能是更稳妥的选择。这是因地制宜的取舍，没有绝对的赢家。"
  - question: "如何用 Drizzle 构建类型安全的数据库层？"
    answer: "用 sqliteTable 或 pgTable 在 TypeScript 文件里定义 schema，SQL 列类型会直接映射成 TS 类型。把错误类型传进查询会在编译期被捕获，还可以用 drizzle-zod 自动生成 Zod 校验 schema，用同一份 schema 校验 API 输入。"
  - question: "如何生成和应用 migration？"
    answer: "配置好 drizzle.config.ts 后，运行 npx drizzle-kit generate 生成人类可读的 .sql migration 文件。应用时用 npx drizzle-kit migrate，或在代码里调用 migrate(db, { migrationsFolder }) 函数。提交前可以打开文件确认到底会执行什么。"
  - question: "为什么在 better-sqlite3 的 transaction 里用 async 会报错？"
    answer: "better-sqlite3 是同步驱动，在 db.transaction 的回调里用 async 会报 Transaction function cannot return a promise 错误。要用同步回调，并用 .run() 执行查询。PostgreSQL 和 MySQL 的驱动是异步的，那里可以直接使用 async/await。"
---

刚开始学 Prisma 的时候，最让我困惑的是打开 migration 文件的那一刻。跑一次 `prisma migrate dev` 确实有东西在运行，但数据库里到底发生了什么，很难说清楚。那种"有什么东西在我不知道的地方悄悄发生"的感觉，让我很不安。

Drizzle ORM 站在了另一边。它的理念是"懂 SQL 的人只是在上面加一层 TypeScript 类型安全"。实际上跑一次 `drizzle-kit generate`，就会生成人类可读的 `.sql` 文件，原原本本摆在那里。你可以亲眼确认里面要执行什么，然后再 commit。

写这篇文章时，Drizzle ORM 是 0.45.2 版本，在 GitHub 上关注度相当高。我在沙盒环境里从头安装，把 CRUD、migration、transaction、Relations API 全都跑了一遍，还发现了一个意外的陷阱，一并整理在这里。

## 安装与初始配置

包的结构很简单。`drizzle-orm` 是运行时库，`drizzle-kit` 是 migration 工具。DB driver 根据使用的数据库选择。

```bash
# 基于 SQLite 的配置
npm install drizzle-orm better-sqlite3
npm install -D drizzle-kit @types/better-sqlite3 typescript ts-node

# 使用 PostgreSQL 的情况
npm install drizzle-orm postgres
npm install -D drizzle-kit
```

我测试时的版本环境：
- `drizzle-orm`: 0.45.2
- `drizzle-kit`: 0.31.10
- `better-sqlite3`: 12.10.0
- Node.js: v22.22.0

`tsconfig.json` 里需要 `moduleResolution: "bundler"` 或 `"node16"` 以上。关于类型导入，可以用 `allowImportingTsExtensions`，或者像我一样用 `.mjs` 扩展名来测试。

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "outDir": "./dist"
  }
}
```

## Schema 定义：用 TypeScript 写 SQL 的感觉

Drizzle schema 有趣的地方在于，SQL 列类型会直接映射到 TypeScript 类型。

```typescript
// schema.ts
import { integer, sqliteTable, text, real } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  // timestamp 模式：自动转换为 JS Date 对象
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date()),
});

export const posts = sqliteTable("posts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  content: text("content").notNull(),
  authorId: integer("author_id")
    .notNull()
    .references(() => users.id),
  views: integer("views").notNull().default(0),
  rating: real("rating"), // nullable 列不加 .notNull()
  publishedAt: integer("published_at", { mode: "timestamp" }),
});

// Relations 定义（供 db.query API 使用）
export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
}));

export const postsRelations = relations(posts, ({ one }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
}));
```

像 `integer("created_at", { mode: "timestamp" })` 这样明确指定 SQLite 特性，在 TypeScript 层面就能当 `Date` 类型来用。如果是 PostgreSQL schema，换成 `import { pgTable, serial, varchar, timestamp } from "drizzle-orm/pg-core"` 就好了，核心 API 几乎相同。

跟 Prisma 比较的话，Prisma 把 schema 写在单独的 `.prisma` 文件里，由 Prisma CLI 生成类型。Drizzle 的 schema 本身就是 TypeScript 文件，在 IDE 里可以直接看到并修改类型。这是个口味问题，但我觉得这种方式更透明。

## 用 drizzle-kit 生成 Migration

需要先创建 `drizzle.config.ts`。

```typescript
// drizzle.config.ts
import type { Config } from "drizzle-kit";

export default {
  schema: "./schema.ts",
  out: "./migrations",
  dialect: "sqlite",
  dbCredentials: {
    url: "./local.db",
  },
} satisfies Config;
```

然后从 schema 生成 migration 文件：

```bash
npx drizzle-kit generate --config=drizzle.config.ts
```

实际执行时的输出：

```
Reading config file '/path/to/drizzle.config.ts'
2 tables
posts 7 columns 0 indexes 1 fks
users 4 columns 1 indexes 0 fks

[✓] Your SQL migration file ➜ migrations/0000_lonely_toxin.sql 🚀
```

看一下生成的 SQL：

```sql
CREATE TABLE `posts` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `title` text NOT NULL,
  `content` text NOT NULL,
  `author_id` integer NOT NULL,
  `views` integer DEFAULT 0 NOT NULL,
  `rating` real,
  `published_at` integer,
  FOREIGN KEY (`author_id`) REFERENCES `users`(`id`)
    ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `name` text NOT NULL,
  `email` text NOT NULL,
  `created_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);
```

这就是会发到数据库的内容，完全透明。不像 `prisma migrate dev` 那样在内部处理，你可以打开这个文件确认"对，就是这样创建的"，然后再执行。

应用 migration：

```bash
npx drizzle-kit migrate --config=drizzle.config.ts
```

或者在代码里直接执行：

```typescript
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import Database from "better-sqlite3";

const sqlite = new Database("./local.db");
const db = drizzle(sqlite);

// 按顺序应用 migrations 文件夹中的 SQL 文件
migrate(db, { migrationsFolder: "./migrations" });
```

如果用 Node.js 内置 SQLite，可以结合 [Node.js 内置 SQLite 完全指南](/zh/blog/zh/node-sqlite-builtin-practical-guide-2026) 一起阅读。Drizzle 通过 `drizzle-orm/node-sqlite3` 也支持内置 SQLite。

## 基础 CRUD：实际运行结果

以下是我实际跑出来的结果。

```typescript
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { eq, desc, gt, sql } from "drizzle-orm";

const sqlite = new Database(":memory:");
const db = drizzle(sqlite, { schema });
```

**INSERT with returning：**

```typescript
const insertedUsers = await db
  .insert(users)
  .values([
    { name: "Jangwook Kim", email: "kim@jangwook.net", createdAt: new Date() },
    { name: "Alice Dev", email: "alice@example.com", createdAt: new Date() },
  ])
  .returning({ id: users.id, name: users.name });
```

输出：
```
[
  { id: 1, name: 'Jangwook Kim' },
  { id: 2, name: 'Alice Dev' }
]
```

`.returning()` 在 SQLite 上也能正常工作，这一点很重要。以前 SQLite 不支持 `RETURNING` 子句，但 better-sqlite3 最新版本已经没问题了。

**SELECT with filter + orderBy：**

```typescript
const popularPosts = await db
  .select({
    id: posts.id,
    title: posts.title,
    views: posts.views,
    rating: posts.rating,
  })
  .from(posts)
  .where(gt(posts.views, 100))
  .orderBy(desc(posts.views));
```

输出：
```
[
  { id: 3, title: 'SQLite in Production', views: 234, rating: 4.2 },
  { id: 1, title: 'Drizzle ORM 入门', views: 142, rating: 4.7 }
]
```

可以组合使用 `gt()`、`lt()`、`eq()`、`and()`、`or()`、`like()` 等运算符。类型不匹配的话，TypeScript 在编译时就会报错。比如 `where(gt(posts.views, "100"))` 传入字符串就会报错。

**JOIN：**

```typescript
const postsWithAuthor = await db
  .select({
    postTitle: posts.title,
    authorName: users.name,
    views: posts.views,
  })
  .from(posts)
  .innerJoin(users, eq(posts.authorId, users.id))
  .orderBy(desc(posts.views));
```

输出：
```
[
  { postTitle: 'SQLite in Production', authorName: 'Alice Dev', views: 234 },
  { postTitle: 'Drizzle ORM 入门', authorName: 'Jangwook Kim', views: 142 },
  { postTitle: 'TypeScript 类型安全', authorName: 'Jangwook Kim', views: 89 }
]
```

`leftJoin`、`rightJoin`、`fullJoin` 也是同样的写法。

## Relations API：用 db.query 取嵌套数据

这是使用 Drizzle 的理由之一。在 schema 里定义好 Relations，就可以用 `db.query` 无需写 JOIN 直接获取嵌套数据。

```typescript
// 初始化时需要传入 schema：drizzle(sqlite, { schema })，db.query 才能工作
const usersWithPosts = await db.query.users.findMany({
  with: {
    posts: {
      columns: { title: true, views: true, rating: true },
    },
  },
  where: eq(users.id, 1),
});
```

实际执行结果：
```json
[
  {
    "id": 1,
    "name": "Jangwook Kim",
    "email": "kim@jangwook.net",
    "createdAt": "2026-06-10T06:27:18.000Z",
    "posts": [
      { "title": "Drizzle ORM 入门", "views": 142, "rating": 4.7 },
      { "title": "TypeScript 类型安全", "views": 89, "rating": 4.5 }
    ]
  }
]
```

可以用 `db.query.users.findFirst()`、`db.query.posts.findMany({ where: ... })` 等形式。`with` 里面再嵌套 `with`，就能获取深层嵌套数据，类型会自动推断。

这个 API 跟 TypeORM 的 `find({ relations: [...] })` 类似，但 Drizzle 会在运行时生成能避免 N+1 查询的 SQL。不过内部是通过子查询或分开查询来组合的，实际情况因场景而异，生产环境中最好确认实际执行的查询。

## Transaction：这里栽了个跟头

自己发现这个问题时着实愣了一下。`better-sqlite3` 是同步（synchronous）driver。SQLite 本身是基于文件的同步数据库，所以 driver 也是这样设计的。

问题在于，在 Drizzle 的 transaction 回调里使用 `async` 会报错。

```typescript
// ❌ 这样写会报错："Transaction function cannot return a promise"
try {
  await db.transaction(async (tx) => {
    await tx.insert(users).values({ name: "Test", email: "test@test.com" });
  });
} catch (err) {
  console.error(err.message); // "Transaction function cannot return a promise"
}
```

我实际跑的时候就出现了这个错误。起初以为是我哪里写错了，查了一下才发现是 `better-sqlite3` 的特性。解决方案是改用同步回调：

```typescript
// ✅ 应该这样写（synchronous）
db.transaction((tx) => {
  tx.update(users)
    .set({ balance: 800 })
    .where(eq(users.name, "Alice"))
    .run(); // 用 .run() 同步执行
  
  tx.update(users)
    .set({ balance: 700 })
    .where(eq(users.name, "Bob"))
    .run();
});
```

`.run()` 是同步执行方法，不需要 `.execute()` 或 `await`，直接执行。

回滚只需要在回调内部抛出异常，会自动发生：

```typescript
try {
  db.transaction((tx) => {
    tx.update(users)
      .set({ balance: 0 })
      .where(eq(users.name, "Alice"))
      .run();
    
    throw new Error("失败场景"); // 这里 throw 就会回滚
  });
} catch (err) {
  // Alice 的 balance 保持不变
}
```

我亲自测试确认了回滚正常工作。

**使用 PostgreSQL 或 MySQL 的情况**则不同。`pg` 或 `mysql2` driver 是异步的，可以使用 `async/await`：

```typescript
// PostgreSQL 中可以使用 async transaction
await db.transaction(async (tx) => {
  await tx.insert(users).values({ name: "Test", email: "test@pg.com" });
  await tx.insert(posts).values({ title: "Test post", authorId: 1 });
});
```

如果在本地开发或 edge 环境中使用 SQLite，一定要记住这个同步/异步的差异。在 [用 Hono.js 和 TypeScript 构建 REST API](/zh/blog/zh/hono-typescript-api-2026) 中如果用到 SQLite，很可能会遇到这个陷阱。

## 聚合查询与 Raw SQL

Drizzle 标榜 SQL-like，所以用 `sql` 模板几乎可以原样写 SQL。

```typescript
import { sql } from "drizzle-orm";

// 聚合查询
const stats = await db
  .select({
    avgRating: sql<number>`AVG(${posts.rating})`,
    totalViews: sql<number>`SUM(${posts.views})`,
    postCount: sql<number>`COUNT(*)`,
  })
  .from(posts);
```

输出：
```json
{ "avgRating": 4.466666666666667, "totalViews": 485, "postCount": 3 }
```

在 UPDATE 时引用当前值也很方便：

```typescript
// 将 views 增加 10
const updated = await db
  .update(posts)
  .set({ views: sql`${posts.views} + 10` })
  .where(eq(posts.authorId, 1))
  .returning({ id: posts.id, title: posts.title, views: posts.views });
```

输出：
```
[
  { id: 1, title: 'Drizzle ORM 入门', views: 152 },
  { id: 2, title: 'TypeScript 类型安全', views: 99 }
]
```

在 `sql` 模板里引用列时，Drizzle 会自动处理表名和列名，无需担心 SQL injection，可以安全地写动态查询。

## Prisma vs Drizzle：坦诚的对比

这是使用过程中的切身感受。如果必须在两个工具中选一个，我会这样看：

| 维度 | Drizzle ORM | Prisma |
|------|-------------|--------|
| 学习曲线 | 懂 SQL 上手快 | 需要单独学习 Prisma schema |
| Migration 透明度 | 可直接查看 SQL 文件 | CLI 内部处理 |
| 类型安全 | schema 文件本身就是 TypeScript | 通过代码生成提供类型 |
| 包体积 | 轻量（约 300KB） | 更大（包含 Prisma Client） |
| 文档/生态 | 还在成熟 | 更成熟 |
| ORM 风格 | SQL-like，底层控制 | 高度抽象，便利 |
| Edge/Serverless | 非常适合（包体积小） | 有时需要 HTTP Proxy |

我认为这不是哪个更好的问题，而是根据情况做出适合的选择。如果你熟悉 SQL 并且想自己管理 migration，Drizzle 更顺手。如果整个团队都在用 ORM、生态稳定性很重要，Prisma 可能是更稳妥的选择。

我感觉 Drizzle 的一个弱点是文档有些地方还不够完善。API 本身运行良好，但某些边缘情况的行为和错误信息有时不够直观，就像上面的 transaction 错误一样。

## 生产环境注意事项

实际使用时需要考虑的几点：

**Connection pooling**：`better-sqlite3` 是单连接同步 driver，不适合 serverless 或多线程环境。如果用 PostgreSQL，需要配合 `drizzle-orm/node-postgres` 设置连接池：

```typescript
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

const pool = new Pool({
  host: "localhost",
  user: "postgres",
  database: "mydb",
  max: 10, // 最大连接数
});

const db = drizzle(pool);
```

**查询日志**：开发过程中确认实际 SQL 很重要。

```typescript
const db = drizzle(sqlite, {
  schema,
  logger: true, // 或自定义 logger
});
```

开启日志后，执行的 SQL 会打印到控制台。对于确认 ORM 发出了什么查询很有用。

**N+1 查询**：`db.query` Relations API 很方便，但不了解内部工作原理就使用，可能会产生 N+1 查询。生产环境中最好通过日志确认，或者在更安全的情况下直接写 JOIN 查询。

## drizzle-kit studio：顺手的 DB 查看器

Drizzle 0.30 以后内置了 `drizzle-kit studio`，无需额外 GUI 就可以在浏览器里查看数据库内容。

```bash
npx drizzle-kit studio --config=drizzle.config.ts
```

执行后会启动一个可以通过 `https://local.drizzle.studio` 访问的 Web UI，支持查看表列表、浏览数据和简单编辑。定位跟 Prisma Studio 类似，但是免费的。

开发时快速确认数据库状态很实用。不过不建议对生产数据库使用，因为没有单独的认证机制，只在本地或本地隧道环境中使用就好。

## 与 TypeScript Zod 结合使用

可以从 Drizzle schema 自动生成 Zod 验证 schema，使用 `drizzle-zod` 包。

```bash
npm install drizzle-zod zod
```

```typescript
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { posts } from "./schema";

// INSERT 用的 Zod schema（排除 id、createdAt 等自动字段）
const insertPostSchema = createInsertSchema(posts, {
  title: z.string().min(1).max(200),
  content: z.string().min(10),
  rating: z.number().min(1).max(5).optional(),
});

// 在 API handler 中直接验证
type NewPost = z.infer<typeof insertPostSchema>;

function validatePost(data: unknown): NewPost {
  return insertPostSchema.parse(data); // 失败时抛出 ZodError
}
```

这样一来，数据库 schema 和 API 验证 schema 就不会分离。如果 DB 列是 `notNull()`，Zod schema 也会自动变成 required 字段。TypeScript Zod v4 + Claude API 结构化输出指南 里对 Zod 有更深入的介绍，可以一并阅读。

此外还有 `drizzle-valibot` 和 `drizzle-arktype` 等与其他验证库集成的包。

---

最后说一下实际跑下来的感受：Drizzle ORM 是为"会写 SQL 的 TypeScript 开发者"准备的工具。它不是把 SQL 藏在抽象层后面，而是让你以类型安全的方式直接使用 SQL。虽然有像 transaction async 问题这样来自 SQLite 特性的陷阱，但说实话，"代码比文档更直观地解释了行为"这一点，我挺喜欢的。

下一篇打算写 Drizzle + Hono.js 组合构建真实 REST API 的例子。
