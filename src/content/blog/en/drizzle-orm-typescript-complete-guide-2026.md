---
title: 'Drizzle ORM Complete Guide: Type-Safe TypeScript DB Layer'
description: >-
  Type-safe SQLite and PostgreSQL in TypeScript with Drizzle ORM 0.45 and
  drizzle-kit — schema, migrations, transactions, and the async gotcha you need
  to know.
pubDate: '2026-06-10'
heroImage: ../../../assets/blog/drizzle-orm-typescript-complete-guide-2026-hero.png
tags:
  - drizzle-orm
  - typescript
  - sqlite
  - database
  - orm
relatedPosts:
  - slug: node-sqlite-builtin-practical-guide-2026
    score: 0.92
    reason:
      ko: 'Drizzle ORM의 SQLite 드라이버와 함께 쓰면 시너지가 있다. Node.js 내장 SQLite로 외부 패키지 없이 DB를 쓰는 방법을 다룬다.'
      ja: DrizzleORMのSQLiteドライバと組み合わせると相乗効果がある。Node.js内蔵SQLiteで外部パッケージなしにDBを使う方法を扱っている。
      en: Pairs well with Drizzle's SQLite driver — covers using Node.js built-in SQLite without external packages, which complements Drizzle's drizzle-orm/node-sqlite3 path.
      zh: 与Drizzle的SQLite驱动配合使用效果很好。介绍了不用外部包直接使用Node.js内置SQLite的方法，与Drizzle的node-sqlite3路径相辅相成。
  - slug: hono-typescript-api-2026
    score: 0.87
    reason:
      ko: 'Drizzle + Hono.js 조합이 엣지 환경에서 자주 쓰인다. 이 글에서 언급한 "다음 예제" 빌드의 사전 지식으로 좋다.'
      ja: Drizzle + Hono.jsの組み合わせはエッジ環境でよく使われる。この記事で言及した「次のサンプル」ビルドの前提知識として最適だ。
      en: Drizzle + Hono.js is a popular edge-runtime combo. Good prerequisite for the REST API follow-up mentioned at the end of this post.
      zh: Drizzle + Hono.js是边缘运行时的常见组合。这篇文章提到的REST API后续示例的预备知识。
  - slug: typescript-zod-v4-claude-api-structured-output-guide-2026
    score: 0.84
    reason:
      ko: 'drizzle-zod로 스키마에서 Zod 타입을 자동 생성하는 패턴을 쓸 때, Zod v4의 API 변화를 미리 파악해두면 좋다.'
      ja: drizzle-zodでスキーマからZod型を自動生成するパターンを使う際、Zod v4のAPI変更を事前に把握しておくと良い。
      en: When using drizzle-zod to auto-generate validation schemas, knowing the Zod v4 API changes is helpful — especially for the Claude API structured output patterns covered there.
      zh: 使用drizzle-zod从schema自动生成Zod类型时，提前了解Zod v4的API变化很有帮助。
  - slug: deno-2-vs-bun-nodejs-runtime-2026-comparison
    score: 0.79
    reason:
      ko: '런타임 선택이 ORM 선택에도 영향을 준다. Bun은 내장 SQLite를 지원하고, Deno도 SQLite 지원이 있어 Drizzle 연동 가능성을 비교해볼 수 있다.'
      ja: ランタイムの選択はORMの選択にも影響する。BunはSQLiteを内蔵し、DenoもSQLiteサポートがあるため、Drizzle連携の可能性を比較できる。
      en: Runtime choice affects ORM options — Bun has built-in SQLite and Deno has SQLite support, making this comparison useful when deciding the full stack alongside Drizzle.
      zh: 运行时的选择也影响ORM的选择。Bun内置SQLite支持，Deno也有SQLite支持，在决定整体技术栈时可以参考。
  - slug: bun-shell-scripting-practical-guide-2026
    score: 0.75
    reason:
      ko: 'Bun에서 Drizzle ORM을 쓰면 bun:sqlite 드라이버를 통해 더 빠른 DB 연산이 가능하다. Bun 생태계에서 Drizzle을 쓸 계획이라면 참고가 된다.'
      ja: BunでDrizzle ORMを使うとbun:sqliteドライバを通じてより高速なDB操作が可能だ。BunエコシステムでDrizzleを使う予定なら参考になる。
      en: Using Drizzle with Bun's native bun:sqlite driver gives faster DB operations than better-sqlite3. Worth reading if you're planning to use Drizzle in a Bun environment.
      zh: 在Bun中使用Drizzle ORM可以通过bun:sqlite驱动获得更快的数据库操作。如果计划在Bun生态中使用Drizzle，值得参考。
---

The first time I used Prisma, what threw me off wasn't the API — it was opening a migration file. You run `prisma migrate dev`, something happens, and your database changes. But actually reading what got executed? Harder than it should be. That feeling of "something quiet is happening somewhere I can't see" never stopped being uncomfortable.

Drizzle ORM sits on the opposite end of that spectrum. The philosophy is basically: "if you know SQL, just add TypeScript type safety on top." In practice, `drizzle-kit generate` spits out a plain `.sql` file you can actually read. You see exactly what will run, review it, and commit it. That's it.

At the time I'm writing this, Drizzle ORM is on version 0.45.2 and has picked up a lot of momentum on GitHub. I ran everything in a sandbox — CRUD, migrations, transactions, the Relations API — all the way through. I also hit one unexpected gotcha that I want to document clearly.

## Installation and Initial Setup

The package split is clean. `drizzle-orm` is the runtime library; `drizzle-kit` is the migration tool. Pick a DB driver based on what you're using.

```bash
# SQLite setup
npm install drizzle-orm better-sqlite3
npm install -D drizzle-kit @types/better-sqlite3 typescript ts-node

# PostgreSQL setup
npm install drizzle-orm postgres
npm install -D drizzle-kit
```

Versions I tested with:
- `drizzle-orm`: 0.45.2
- `drizzle-kit`: 0.31.10
- `better-sqlite3`: 12.10.0
- Node.js: v22.22.0

Your `tsconfig.json` needs `moduleResolution: "bundler"` or `"node16"` or higher.

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

## Schema Definition — SQL Column Types as TypeScript Types

What makes Drizzle's schema interesting is that SQL column types map directly to TypeScript types. The schema file IS a TypeScript file.

```typescript
// schema.ts
import { integer, sqliteTable, text, real } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  // timestamp mode: auto-converts to JS Date objects
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
  rating: real("rating"), // nullable column — no .notNull()
  publishedAt: integer("published_at", { mode: "timestamp" }),
});

// Relations definition (used by db.query API)
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

`integer("created_at", { mode: "timestamp" })` makes the SQLite storage explicit while giving you a `Date` type at the TypeScript level. For PostgreSQL, swap in `import { pgTable, serial, varchar, timestamp } from "drizzle-orm/pg-core"` — the core API stays nearly identical.

One difference from Prisma worth noting: Prisma uses a separate `.prisma` file and generates types via the CLI. In Drizzle, the schema is just a TypeScript file, so you can check and modify types directly in your editor. I find this significantly more transparent.

## Generating Migrations with drizzle-kit

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

```bash
npx drizzle-kit generate --config=drizzle.config.ts
```

Actual output:
```
Reading config file '/path/to/drizzle.config.ts'
2 tables
posts 7 columns 0 indexes 1 fks
users 4 columns 1 indexes 0 fks

[✓] Your SQL migration file ➜ migrations/0000_lonely_toxin.sql 🚀
```

Generated SQL:
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

That SQL runs directly on the database — nothing hidden. I can open it, read exactly what it does, understand it fully, and commit it to version control. Compared to Prisma, where migration generation feels more like a black box, this is a meaningful improvement for my workflow.

```bash
npx drizzle-kit migrate --config=drizzle.config.ts
```

Or programmatically:
```typescript
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import Database from "better-sqlite3";

const sqlite = new Database("./local.db");
const db = drizzle(sqlite);

// Applies SQL files from migrations folder in order
migrate(db, { migrationsFolder: "./migrations" });
```

If you're working with Node.js's built-in SQLite, check out my [Node.js Built-in SQLite Guide](/en/blog/en/node-sqlite-builtin-practical-guide-2026) — Drizzle supports it via `drizzle-orm/node-sqlite3`.

## Basic CRUD — With Actual Execution Results

```typescript
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { eq, desc, gt, sql } from "drizzle-orm";

const sqlite = new Database(":memory:");
const db = drizzle(sqlite, { schema });
```

**INSERT with returning:**
```typescript
const insertedUsers = await db
  .insert(users)
  .values([
    { name: "Jangwook Kim", email: "kim@jangwook.net", createdAt: new Date() },
    { name: "Alice Dev", email: "alice@example.com", createdAt: new Date() },
  ])
  .returning({ id: users.id, name: users.name });
```
Output:
```
[
  { id: 1, name: 'Jangwook Kim' },
  { id: 2, name: 'Alice Dev' }
]
```

`.returning()` works correctly with SQLite. Worth noting — older SQLite versions didn't support the `RETURNING` clause, but `better-sqlite3`'s latest version handles it fine.

**SELECT with filter and orderBy:**
```typescript
const popularPosts = await db
  .select({ id: posts.id, title: posts.title, views: posts.views, rating: posts.rating })
  .from(posts)
  .where(gt(posts.views, 100))
  .orderBy(desc(posts.views));
```
Output:
```
[
  { id: 3, title: 'SQLite in Production', views: 234, rating: 4.2 },
  { id: 1, title: 'Drizzle ORM Introduction', views: 142, rating: 4.7 }
]
```

Operators like `gt()`, `lt()`, `eq()`, `and()`, `or()`, `like()` compose cleanly. If the types don't match — say you pass `gt(posts.views, "100")` with a string — TypeScript catches it at compile time.

**JOIN:**
```typescript
const postsWithAuthor = await db
  .select({ postTitle: posts.title, authorName: users.name, views: posts.views })
  .from(posts)
  .innerJoin(users, eq(posts.authorId, users.id))
  .orderBy(desc(posts.views));
```
Output:
```
[
  { postTitle: 'SQLite in Production', authorName: 'Alice Dev', views: 234 },
  { postTitle: 'Drizzle ORM Introduction', authorName: 'Jangwook Kim', views: 142 },
  { postTitle: 'TypeScript Type Safety', authorName: 'Jangwook Kim', views: 89 }
]
```

`leftJoin`, `rightJoin`, `fullJoin` — same pattern throughout.

## Relations API — The Convenience of db.query

One of the more compelling reasons to pick Drizzle: define Relations in your schema once, and `db.query` handles nested data fetching without you writing manual JOINs.

```typescript
// Must pass schema to drizzle() for db.query to work
const usersWithPosts = await db.query.users.findMany({
  with: {
    posts: { columns: { title: true, views: true, rating: true } },
  },
  where: eq(users.id, 1),
});
```
Output:
```json
[
  {
    "id": 1,
    "name": "Jangwook Kim",
    "email": "kim@jangwook.net",
    "createdAt": "2026-06-10T06:27:18.000Z",
    "posts": [
      { "title": "Drizzle ORM Introduction", "views": 142, "rating": 4.7 },
      { "title": "TypeScript Type Safety", "views": 89, "rating": 4.5 }
    ]
  }
]
```

Similar to TypeORM's `find({ relations: [...] })`. Drizzle generates SQL to avoid N+1 queries, but I'd recommend enabling logging in development to verify what it's actually sending to the DB.

## Transactions — Here's Where the Gotcha Hides

This one caught me off guard. `better-sqlite3` is a synchronous driver. SQLite is a file-based synchronous database, and the driver is built that way intentionally.

The problem: using `async` inside a Drizzle transaction callback throws an error.

```typescript
// ❌ Error: "Transaction function cannot return a promise"
try {
  await db.transaction(async (tx) => {
    await tx.insert(users).values({ name: "Test", email: "test@test.com" });
  });
} catch (err) {
  console.error(err.message); // "Transaction function cannot return a promise"
}
```

I hit this exact error during testing. My first reaction was that I'd made a mistake somewhere, but it's a fundamental `better-sqlite3` constraint. The fix is to use synchronous callbacks.

```typescript
// ✅ Correct (synchronous)
db.transaction((tx) => {
  tx.update(users)
    .set({ balance: 800 })
    .where(eq(users.name, "Alice"))
    .run(); // .run() for synchronous execution
  
  tx.update(users)
    .set({ balance: 700 })
    .where(eq(users.name, "Bob"))
    .run();
});
```

`.run()` is the synchronous execution method — no `await` needed.

Rollback is automatic when you throw inside the callback:

```typescript
try {
  db.transaction((tx) => {
    tx.update(users).set({ balance: 0 }).where(eq(users.name, "Alice")).run();
    throw new Error("Simulated failure — triggers rollback");
  });
} catch (err) {
  // Alice's balance is unchanged — rollback worked correctly
}
```

I tested this and confirmed the rollback works as expected.

**PostgreSQL and MySQL** are different — their drivers are async by design, so `async/await` inside transactions works fine.

If you're building with SQLite and need [a TypeScript REST API with Hono.js](/en/blog/en/hono-typescript-api-2026), keep this async/sync constraint in mind from the start — it's easier than refactoring later.

## Aggregate Queries and Raw SQL

```typescript
import { sql } from "drizzle-orm";

const stats = await db
  .select({
    avgRating: sql<number>`AVG(${posts.rating})`,
    totalViews: sql<number>`SUM(${posts.views})`,
    postCount: sql<number>`COUNT(*)`,
  })
  .from(posts);
```
Output: `{ "avgRating": 4.466666666666667, "totalViews": 485, "postCount": 3 }`

Incrementing a value in an UPDATE:
```typescript
// Increment views by 10
const updated = await db
  .update(posts)
  .set({ views: sql`${posts.views} + 10` })
  .where(eq(posts.authorId, 1))
  .returning({ id: posts.id, title: posts.title, views: posts.views });
```

Column references inside `sql` template literals are processed by Drizzle, so they're safe from SQL injection.

## Prisma vs Drizzle — An Honest Comparison

| Criteria | Drizzle ORM | Prisma |
|----------|------------|--------|
| Learning curve | Fast if you know SQL | Need to learn Prisma schema syntax |
| Migration transparency | Direct SQL files | CLI-managed |
| Type safety | Schema IS TypeScript | Code-generated types |
| Bundle size | Light (~300KB) | Heavier (Prisma Client) |
| Docs/ecosystem | Maturing | More mature |
| ORM style | SQL-like, low-level control | Higher abstraction, more convenience |
| Edge/Serverless | Excellent fit | May need HTTP proxy |

This isn't a "which is better" question — it's about fit. If you're comfortable with SQL and want full visibility into your migrations, Drizzle feels more natural. If your team needs a safer abstraction with a mature ecosystem behind it, Prisma is a solid choice and I wouldn't argue against it.

My main criticism of Drizzle: the documentation still has rough edges. The API itself works well, but some edge-case behaviors — like the transaction async error — aren't obvious from reading the docs. You find them by running into them.

## Production Considerations

**Connection pooling**: `better-sqlite3` is a single-connection synchronous driver — not suitable for serverless or multi-threaded environments. For PostgreSQL:

```typescript
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

const pool = new Pool({ host: "localhost", user: "postgres", database: "mydb", max: 10 });
const db = drizzle(pool);
```

**Query logging**: Turn it on during development.
```typescript
const db = drizzle(sqlite, { schema, logger: true });
```

## drizzle-kit studio

Since Drizzle 0.30, `drizzle-kit studio` ships built-in — a local browser-based DB viewer.

```bash
npx drizzle-kit studio --config=drizzle.config.ts
```

Opens at `https://local.drizzle.studio`. You get table listing, data browsing, and basic editing. Think Prisma Studio but free. Don't point it at a production database — there's no authentication layer.

## Combining with TypeScript Zod

You can generate Zod validation schemas directly from your Drizzle schema:

```bash
npm install drizzle-zod zod
```

```typescript
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Auto-excludes id, createdAt, etc.
const insertPostSchema = createInsertSchema(posts, {
  title: z.string().min(1).max(200),
  content: z.string().min(10),
  rating: z.number().min(1).max(5).optional(),
});

type NewPost = z.infer<typeof insertPostSchema>;
```

Your DB schema and API validation stay in sync automatically. If a DB column is `notNull()`, the Zod schema marks it as required. For a deeper look at Zod itself, see my [TypeScript Zod v4 + Claude API Structured Output Guide](/en/blog/en/typescript-zod-v4-claude-api-structured-output-guide-2026).

---

My overall take: Drizzle ORM is for TypeScript developers who know SQL and don't want to give up control for the sake of type safety. The migration transparency alone is worth considering — being able to open the generated `.sql` file and know exactly what will run against your database is an underrated feature. The async transaction gotcha is real, but it's avoidable once you know about it. And honestly, the fact that the error message told me precisely what was wrong (even if the fix wasn't spelled out) is better than a silent failure.

I plan to follow this up with a post showing Drizzle + Hono.js for a complete REST API.
