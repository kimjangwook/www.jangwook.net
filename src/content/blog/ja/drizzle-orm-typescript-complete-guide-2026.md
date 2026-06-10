---
title: Drizzle ORM完全ガイド — PrismaなしでTypeScript型安全DBレイヤーを作る
description: >-
  Drizzle ORM
  0.45とdrizzle-kitでSQLite・PostgreSQLをTypeScriptで型安全に扱う方法。スキーマ定義からマイグレーション、トランザクションのasync落とし穴まで実行ログとともに解説。
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

Prismaを初めて学んだとき、最も困惑したのはマイグレーションファイルを開いたときでした。`prisma migrate dev`を一度実行すると何かが動くのですが、実際にデータベースに何が送られたのかはわかりにくい。自分の知らないところで何かが静かに行われているその感覚が、正直不快でした。

Drizzle ORMはその反対側にあるツールです。「SQLを知っている人がTypeScriptの型安全性だけ乗せる」という哲学を掲げており、実際に`drizzle-kit generate`を一度叩けば人間が読める`.sql`ファイルがそのまま出てきます。何が実行されるのかを直接確認してからコミットできる。

この記事を書いている時点でDrizzle ORMは0.45.2です。GitHubでもかなり注目を集めています。実際にサンドボックス環境でインストールして、CRUD・マイグレーション・トランザクション・Relations APIまで一通り動かしました。予想外の落とし穴も一つ発見したので、それもあわせてまとめます。

## インストールと初期設定

パッケージ構成はシンプルです。`drizzle-orm`がランタイムライブラリで、`drizzle-kit`がマイグレーションツールです。DBドライバは使うDBに合わせて選びます。

```bash
# SQLiteベースの設定
npm install drizzle-orm better-sqlite3
npm install -D drizzle-kit @types/better-sqlite3 typescript ts-node

# PostgreSQLを使う場合
npm install drizzle-orm postgres
npm install -D drizzle-kit
```

テストした環境のバージョン:
- `drizzle-orm`: 0.45.2
- `drizzle-kit`: 0.31.10
- `better-sqlite3`: 12.10.0
- Node.js: v22.22.0

`tsconfig.json`では`moduleResolution: "bundler"`または`"node16"`以上が必要です。型インポートのために`allowImportingTsExtensions`や`.mjs`拡張子を使う方法もありますが、今回は`.mjs`でテストしました。

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

## スキーマ定義 — SQLをTypeScriptで書く感覚

DrizzleのスキーマがおもしろいのはSQLのカラム型がそのままTypeScriptの型として連携されるという点です。

```typescript
// schema.ts
import { integer, sqliteTable, text, real } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  // timestampモード: JS DateオブジェクトへAuto変換
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
  rating: real("rating"), // nullableカラムには.notNull()を付けない
  publishedAt: integer("published_at", { mode: "timestamp" }),
});

// Relations定義（db.query APIで使用）
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

`integer("created_at", { mode: "timestamp" })`のようにSQLiteの特性を明示しながら、TypeScriptレベルでは`Date`型として扱えます。PostgreSQLスキーマなら`import { pgTable, serial, varchar, timestamp } from "drizzle-orm/pg-core"`に切り替えるだけで、コアAPIはほぼ同じです。

PrismaとDrizzleを比べると、Prismaはスキーマを別の`.prisma`ファイルに書いてPrisma CLIが型を生成してくれます。DrizzleはスキーマファイルそのものがTypeScriptなので、IDEで直接型を確認しながら修正できる。好みの問題はありますが、個人的にはこの方が透明性が高いと感じました。

## drizzle-kitでマイグレーション生成

まず`drizzle.config.ts`を作る必要があります。

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

次にスキーマからマイグレーションファイルを生成します。

```bash
npx drizzle-kit generate --config=drizzle.config.ts
```

実際に実行したときの出力:

```
Reading config file '/path/to/drizzle.config.ts'
2 tables
posts 7 columns 0 indexes 1 fks
users 4 columns 1 indexes 0 fks

[✓] Your SQL migration file ➜ migrations/0000_lonely_toxin.sql 🚀
```

生成されたSQLを見ると:

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

これがそのままDBに飛びます。透明です。`prisma migrate dev`のように内部で処理されるのではなく、このファイルを開いて「なるほど、こうやって作るのか」を確認してから実行できる。

マイグレーションの適用:

```bash
npx drizzle-kit migrate --config=drizzle.config.ts
```

またはコード内で直接:

```typescript
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import Database from "better-sqlite3";

const sqlite = new Database("./local.db");
const db = drizzle(sqlite);

// migrationsフォルダのSQLファイルを順番に適用
migrate(db, { migrationsFolder: "./migrations" });
```

Node.jsの内蔵SQLiteを使う場合は[Node.js内蔵SQLite完全ガイド](/ja/blog/ja/node-sqlite-builtin-practical-guide-2026)と合わせて読むと良いです。DrizzleはSQLiteの内蔵ドライバもサポートしています。

## 基本CRUD — 実際の実行結果

実際に動かした結果です。

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

出力:
```
[
  { id: 1, name: 'Jangwook Kim' },
  { id: 2, name: 'Alice Dev' }
]
```

`.returning()`がSQLiteでも正しく動くのが重要です。以前はSQLiteで`RETURNING`句がサポートされていない時期もありましたが、better-sqlite3の最新版では問題ありません。

**SELECT with filter + orderBy:**

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

出力:
```
[
  { id: 3, title: 'SQLite in Production', views: 234, rating: 4.2 },
  { id: 1, title: 'Drizzle ORM 入門', views: 142, rating: 4.7 }
]
```

`gt()`、`lt()`、`eq()`、`and()`、`or()`、`like()`などの演算子を組み合わせられます。型が合わなければTypeScriptのコンパイル時にエラーになる。`where(gt(posts.views, "100"))`のように文字列を渡すとエラーが出ます。

**JOIN:**

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

出力:
```
[
  { postTitle: 'SQLite in Production', authorName: 'Alice Dev', views: 234 },
  { postTitle: 'Drizzle ORM 入門', authorName: 'Jangwook Kim', views: 142 },
  { postTitle: 'TypeScript 型安全性', authorName: 'Jangwook Kim', views: 89 }
]
```

`leftJoin`、`rightJoin`、`fullJoin`も同じパターンで使えます。

## Relations API — db.queryの便利さ

Drizzleを使う理由の一つです。スキーマでRelationsを定義しておけば、`db.query`でJOINなしにネストしたデータを取得できます。

```typescript
// drizzle(sqlite, { schema }) でschemaを渡さないとdb.queryは動かない
const usersWithPosts = await db.query.users.findMany({
  with: {
    posts: {
      columns: { title: true, views: true, rating: true },
    },
  },
  where: eq(users.id, 1),
});
```

実行結果:
```json
[
  {
    "id": 1,
    "name": "Jangwook Kim",
    "email": "kim@jangwook.net",
    "createdAt": "2026-06-10T06:27:18.000Z",
    "posts": [
      { "title": "Drizzle ORM 入門", "views": 142, "rating": 4.7 },
      { "title": "TypeScript 型安全性", "views": 89, "rating": 4.5 }
    ]
  }
]
```

`db.query.users.findFirst()`、`db.query.posts.findMany({ where: ... })`の形でも使えます。`with`の中にさらに`with`を書けば深いネストも可能です。型は自動で推論されます。

このAPIはTypeORMの`find({ relations: [...] })`に似ていますが、DrizzleはランタイムでN+1クエリを避ける方向でSQLを生成します。内部的にはサブクエリや別クエリを組み合わせる方式なので状況によって異なる場合があり、プロダクションでは実際のクエリを確認することをおすすめします。

## トランザクション — ここに落とし穴があった

これを直接発見したとき、少し驚きました。`better-sqlite3`は同期（synchronous）ドライバです。SQLite自体がファイルベースの同期DBなので、そのように設計されています。

問題は、Drizzleのトランザクションコールバックで`async`を使うとエラーになることです。

```typescript
// ❌ こうするとエラー: "Transaction function cannot return a promise"
try {
  await db.transaction(async (tx) => {
    await tx.insert(users).values({ name: "Test", email: "test@test.com" });
  });
} catch (err) {
  console.error(err.message); // "Transaction function cannot return a promise"
}
```

実際に実行したとき、このエラーが発生しました。最初は自分が何か間違えたのかと思いましたが、`better-sqlite3`の特性によるものでした。解決策は同期コールバックで書くことです。

```typescript
// ✅ こうすべき（synchronous）
db.transaction((tx) => {
  tx.update(users)
    .set({ balance: 800 })
    .where(eq(users.name, "Alice"))
    .run(); // .run()で同期実行
  
  tx.update(users)
    .set({ balance: 700 })
    .where(eq(users.name, "Bob"))
    .run();
});
```

`.run()`が同期実行メソッドです。`.execute()`や`await`なしで直接実行されます。

ロールバックはコールバック内で例外をスローすると自動的に行われます。

```typescript
try {
  db.transaction((tx) => {
    tx.update(users)
      .set({ balance: 0 })
      .where(eq(users.name, "Alice"))
      .run();
    
    throw new Error("失敗シナリオ"); // ここでthrowするとロールバック
  });
} catch (err) {
  // Aliceのbalanceはそのまま維持される
}
```

実際にテストしてロールバックが正しく動作することを確認しました。

**PostgreSQLやMySQLを使う場合**は異なります。`pg`や`mysql2`ドライバは非同期なので`async/await`が使えます。

```typescript
// PostgreSQLではasyncトランザクションが使える
await db.transaction(async (tx) => {
  await tx.insert(users).values({ name: "Test", email: "test@pg.com" });
  await tx.insert(posts).values({ title: "Test post", authorId: 1 });
});
```

SQLiteをローカル開発やエッジ環境で使うなら、この同期/非同期の違いは必ず頭に入れておきましょう。[Hono.js + TypeScriptでREST APIを作る](/ja/blog/ja/hono-typescript-api-2026)でSQLiteを使うなら、この落とし穴に遭遇する可能性が高いです。

## 集計クエリとRaw SQL

DrizzleはSQL-likeを標榜しているだけあって、`sql`テンプレートを使えばほぼそのままSQLを書けます。

```typescript
import { sql } from "drizzle-orm";

// 集計クエリ
const stats = await db
  .select({
    avgRating: sql<number>`AVG(${posts.rating})`,
    totalViews: sql<number>`SUM(${posts.views})`,
    postCount: sql<number>`COUNT(*)`,
  })
  .from(posts);
```

出力:
```json
{ "avgRating": 4.466666666666667, "totalViews": 485, "postCount": 3 }
```

UPDATEで現在の値を参照するときも便利です。

```typescript
// viewsを10ずつ増加
const updated = await db
  .update(posts)
  .set({ views: sql`${posts.views} + 10` })
  .where(eq(posts.authorId, 1))
  .returning({ id: posts.id, title: posts.title, views: posts.views });
```

出力:
```
[
  { id: 1, title: 'Drizzle ORM 入門', views: 152 },
  { id: 2, title: 'TypeScript 型安全性', views: 99 }
]
```

`sql`テンプレート内でカラムを参照すると、DrizzleがテーブルやカラムのSQL名を自動で処理してくれるため、SQLインジェクションを気にせず動的クエリが書けます。

## Prisma vs Drizzle — 率直な比較

実際に使ってみて感じたことです。どちらか一方を選ぶなら、こう考えます。

| 基準 | Drizzle ORM | Prisma |
|------|------------|--------|
| 学習曲線 | SQLを知っていれば速い | Prismaスキーマの別途学習が必要 |
| マイグレーションの透明性 | SQLファイルを直接確認可能 | CLI内部処理 |
| 型安全性 | スキーマファイル自体がTS | コード生成で型を提供 |
| バンドルサイズ | 軽量（約300KB） | より大きい（Prisma Client含む）|
| ドキュメント/エコシステム | 成長中 | より成熟 |
| ORMスタイル | SQL-like、低レベル制御 | 抽象化高め、便利 |
| Edge/Serverless | 非常に適している | HTTP Proxy必要な場合あり |

「どちらが優れているか」ではなく、状況に応じた選択だと思っています。SQLに慣れていてマイグレーションを自分で管理したいならDrizzleの方が使いやすい。チーム全体でORMを使いエコシステムの安定性を重視するならPrismaがより安全な選択かもしれません。

感じたDrizzleの弱点の一つは、ドキュメントにまだ整理しきれていない部分があることです。APIはうまく動くのですが、一部のエッジケースの動作やエラーメッセージが直感的でないことがあります。先のトランザクションエラーがその例です。

## プロダクションでの注意点

実際に使うときに考慮すべきいくつかの点です。

**コネクションプーリング**: `better-sqlite3`は単一接続の同期ドライバなので、サーバーレス環境やマルチスレッド環境には向きません。PostgreSQLを使うなら`drizzle-orm/node-postgres`と`Pool`の設定が必要です。

```typescript
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

const pool = new Pool({
  host: "localhost",
  user: "postgres",
  database: "mydb",
  max: 10, // 最大接続数
});

const db = drizzle(pool);
```

**クエリロギング**: 開発中は実際のSQLを確認することが重要です。

```typescript
const db = drizzle(sqlite, {
  schema,
  logger: true, // またはカスタムロガー
});
```

ロギングをオンにすると実行されるSQLがコンソールに出力されます。ORMがどんなクエリを発行しているかを確認するのに役立ちます。

**N+1クエリ**: `db.query` Relations APIは便利ですが、内部動作を把握せずに使うとN+1クエリが発生することがあります。プロダクションではロギングで確認するか、直接JOINクエリを書く方が安全な場合があります。

## drizzle-kit studio — 簡単なDBビューア

Drizzle 0.30以降、`drizzle-kit studio`が内蔵されました。別途GUIなしにDB内容をブラウザで確認できるローカルビューアです。

```bash
npx drizzle-kit studio --config=drizzle.config.ts
```

実行すると`https://local.drizzle.studio`でアクセスできるWeb UIが立ち上がります。テーブル一覧、データ参照、簡単な編集が可能です。Prisma Studioと似たポジションで、無料です。

開発中にDB状態をすばやく確認したいときに便利です。ただし、プロダクションDBに対して使うことはおすすめしません。認証が別途ないため、ローカルまたはローカルトンネリング環境でのみ使いましょう。

## TypeScript ZodとDrizzleの組み合わせ

DrizzleスキーマからZodバリデーションスキーマを自動生成できます。`drizzle-zod`パッケージを使います。

```bash
npm install drizzle-zod zod
```

```typescript
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { posts } from "./schema";

// INSERT用Zodスキーマ（id、createdAtなどのautoフィールドを除く）
const insertPostSchema = createInsertSchema(posts, {
  title: z.string().min(1).max(200),
  content: z.string().min(10),
  rating: z.number().min(1).max(5).optional(),
});

// APIハンドラーで直接バリデーション
type NewPost = z.infer<typeof insertPostSchema>;

function validatePost(data: unknown): NewPost {
  return insertPostSchema.parse(data); // 失敗するとZodErrorをthrow
}
```

こうするとDBスキーマとAPIバリデーションスキーマが乖離しなくなります。DBカラムが`notNull()`ならZodスキーマも自動的にrequiredフィールドになる。[TypeScript Zod v4 + Claude API 構造化出力ガイド](/ja/blog/ja/typescript-zod-v4-claude-api-structured-output-guide-2026)でZodをさらに深く解説しているので合わせて読むと良いです。

`drizzle-valibot`や`drizzle-arktype`のように他のバリデーションライブラリと連携するパッケージも存在します。

---

使ってみた感想をまとめると: Drizzle ORMは「SQLが書けるTypeScript開発者」のためのツールです。抽象化の裏に隠すのではなく、SQLを型安全にそのまま書かせてくれる。トランザクションのasync問題のようにSQLiteの特性から来る落とし穴はありますが、ドキュメントよりコードの方が直感的に説明してくれるという点は、正直気に入りました。

次はDrizzle + Hono.jsの組み合わせで実際のREST APIを作る例を書く予定です。
