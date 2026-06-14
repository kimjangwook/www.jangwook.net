---
title: Drizzle ORM 완전 가이드 — Prisma 없이 타입 안전한 TypeScript DB 레이어 만들기
description: >-
  Drizzle ORM 0.45와 drizzle-kit으로 SQLite·PostgreSQL을 TypeScript에서 타입 안전하게 다루는
  방법. 스키마 정의부터 마이그레이션, 트랜잭션의 async 함정까지 실제 실행 로그와 함께.
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
  - question: "Drizzle ORM과 Prisma 중 무엇을 선택해야 하나요?"
    answer: "SQL에 익숙하고 마이그레이션 SQL 파일을 직접 확인하며 관리하고 싶다면 Drizzle이 편합니다. Drizzle은 번들이 가볍고(~300KB) 엣지·서버리스에 적합합니다. 팀 전체가 ORM 추상화와 성숙한 생태계를 중시한다면 Prisma가 더 안전한 선택일 수 있습니다."
  - question: "Drizzle로 타입 안전한 DB 레이어를 어떻게 만드나요?"
    answer: "스키마를 TypeScript 파일에 sqliteTable/pgTable로 정의하면 SQL 컬럼 타입이 그대로 TS 타입으로 연결됩니다. 잘못된 타입을 쿼리에 넣으면 컴파일 시점에 잡히고, drizzle-zod로 Zod 검증 스키마를 자동 생성해 API 입력까지 같은 스키마로 검증할 수 있습니다."
  - question: "마이그레이션은 어떻게 생성하고 적용하나요?"
    answer: "drizzle.config.ts를 설정한 뒤 npx drizzle-kit generate로 사람이 읽을 수 있는 .sql 마이그레이션 파일을 생성합니다. 적용은 npx drizzle-kit migrate 또는 코드에서 migrate(db, { migrationsFolder }) 함수로 합니다. 무엇이 실행되는지 파일을 직접 열어 확인할 수 있습니다."
  - question: "better-sqlite3 트랜잭션에서 async를 쓰면 왜 에러가 나나요?"
    answer: "better-sqlite3는 동기 드라이버라 db.transaction 콜백에 async를 쓰면 Transaction function cannot return a promise 에러가 납니다. 동기 콜백으로 작성하고 쿼리는 .run()으로 실행하세요. PostgreSQL이나 MySQL 드라이버는 비동기라서 async/await를 그대로 쓸 수 있습니다."
---

Prisma를 처음 배웠을 때 가장 당황스러웠던 건 마이그레이션 파일을 열어봤을 때였다. `prisma migrate dev` 한 번 치면 무언가가 돌아가는데, 정작 데이터베이스에 뭐가 날아갔는지는 알기 어려웠다. 내가 모르는 곳에서 뭔가가 조용히 일어나는 그 느낌이 불편했다.

Drizzle ORM은 그 반대편에 있는 도구다. "SQL을 아는 사람이 TypeScript 타입 안전성만 얹는" 철학이라고 하는데, 실제로 `drizzle-kit generate` 한 번 치면 사람이 읽을 수 있는 `.sql` 파일이 그대로 나온다. 거기서 뭐가 실행되는지 직접 확인하고 커밋할 수 있다.

지금 이 글을 쓰는 시점에 Drizzle ORM은 0.45.2 버전이고 GitHub에서 꽤 많은 관심을 받고 있다. 직접 샌드박스에서 설치해서 CRUD, 마이그레이션, 트랜잭션, Relations API까지 다 돌려봤다. 예상 밖의 함정도 하나 발견했는데, 그것도 같이 정리한다.

## 설치와 초기 설정

패키지 구성은 간단하다. `drizzle-orm`이 런타임 라이브러리고, `drizzle-kit`이 마이그레이션 도구다. DB 드라이버는 쓰는 DB에 맞게 선택한다.

```bash
# SQLite 기반 설정
npm install drizzle-orm better-sqlite3
npm install -D drizzle-kit @types/better-sqlite3 typescript ts-node

# PostgreSQL을 쓰는 경우
npm install drizzle-orm postgres
npm install -D drizzle-kit
```

내가 테스트한 환경의 버전:
- `drizzle-orm`: 0.45.2
- `drizzle-kit`: 0.31.10
- `better-sqlite3`: 12.10.0
- Node.js: v22.22.0

`tsconfig.json`에서 `moduleResolution: "bundler"` 또는 `"node16"` 이상이 필요하다. 그리고 타입 임포트를 위해 `allowImportingTsExtensions`나 `.mjs` 확장자를 쓰는 방법도 있는데, 나는 `.mjs`로 테스트했다.

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

## 스키마 정의: SQL을 TypeScript로 쓰는 감각

Drizzle 스키마가 흥미로운 이유는 SQL 컬럼 타입이 그대로 TypeScript 타입으로 연결된다는 점이다.

```typescript
// schema.ts
import { integer, sqliteTable, text, real } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  // timestamp 모드: JS Date 객체로 자동 변환
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
  rating: real("rating"), // nullable 컬럼은 따로 .notNull() 안 붙임
  publishedAt: integer("published_at", { mode: "timestamp" }),
});

// Relations 정의 (db.query API에서 사용)
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

`integer("created_at", { mode: "timestamp" })`처럼 SQLite 특성을 명시하면서도 TypeScript 레벨에서는 `Date` 타입으로 다룰 수 있다. PostgreSQL 스키마라면 `import { pgTable, serial, varchar, timestamp } from "drizzle-orm/pg-core"`처럼 바꾸면 된다. 코어 API는 거의 동일하다.

한 가지 Prisma와 비교하면, Prisma는 스키마를 별도의 `.prisma` 파일에 쓰고 Prisma CLI가 타입을 생성해준다. Drizzle은 스키마 자체가 TypeScript 파일이라 IDE에서 바로 타입을 보고 수정할 수 있다. 취향 차이가 있지만, 나는 이 방식이 더 투명하다고 느꼈다.

## drizzle-kit으로 마이그레이션 생성

`drizzle.config.ts`를 만들어야 한다.

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

그리고 스키마에서 마이그레이션 파일을 생성한다.

```bash
npx drizzle-kit generate --config=drizzle.config.ts
```

직접 실행했을 때 출력:

```
Reading config file '/path/to/drizzle.config.ts'
2 tables
posts 7 columns 0 indexes 1 fks
users 4 columns 1 indexes 0 fks

[✓] Your SQL migration file ➜ migrations/0000_lonely_toxin.sql 🚀
```

생성된 SQL을 보면:

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

이게 그대로 DB에 날아간다. 투명하다. `prisma migrate dev`처럼 내부에서 처리되는 게 아니라, 이 파일을 열어보고 "맞다, 이렇게 만들겠구나"를 확인하고 실행할 수 있다.

마이그레이션 적용은:

```bash
npx drizzle-kit migrate --config=drizzle.config.ts
```

또는 코드 안에서 직접:

```typescript
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import Database from "better-sqlite3";

const sqlite = new Database("./local.db");
const db = drizzle(sqlite);

// migrations 폴더의 SQL 파일을 순서대로 적용
migrate(db, { migrationsFolder: "./migrations" });
```

Node.js의 내장 SQLite를 쓰는 경우라면 [Node.js 내장 SQLite 완전 가이드](/ko/blog/ko/node-sqlite-builtin-practical-guide-2026)와 함께 읽으면 좋다. Drizzle은 `drizzle-orm/node-sqlite3`을 통해 내장 SQLite도 지원한다.

## 기본 CRUD를 실제 실행 결과로 확인하기

실제로 돌린 결과다.

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

출력:
```
[
  { id: 1, name: 'Jangwook Kim' },
  { id: 2, name: 'Alice Dev' }
]
```

`.returning()`이 SQLite에서도 잘 작동한다는 게 중요하다. 예전에 SQLite에서 `RETURNING` 절이 지원 안 되던 시절이 있었는데, better-sqlite3 최신 버전은 문제없다.

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

출력:
```
[
  { id: 3, title: 'SQLite in Production', views: 234, rating: 4.2 },
  { id: 1, title: 'Drizzle ORM 입문', views: 142, rating: 4.7 }
]
```

`gt()`, `lt()`, `eq()`, `and()`, `or()`, `like()` 같은 연산자를 조합할 수 있다. 타입이 맞지 않으면 TypeScript 컴파일 시점에 잡힌다. `where(gt(posts.views, "100"))`처럼 문자열을 넣으면 에러가 난다.

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

출력:
```
[
  { postTitle: 'SQLite in Production', authorName: 'Alice Dev', views: 234 },
  { postTitle: 'Drizzle ORM 입문', authorName: 'Jangwook Kim', views: 142 },
  { postTitle: 'TypeScript 타입 안전성', authorName: 'Jangwook Kim', views: 89 }
]
```

`leftJoin`, `rightJoin`, `fullJoin`도 동일한 패턴으로 쓸 수 있다.

## Relations API: db.query로 중첩 데이터 가져오기

이게 Drizzle을 쓰는 이유 중 하나다. 스키마에서 Relations를 정의해두면 `db.query`로 JOIN 없이도 중첩 데이터를 가져올 수 있다.

```typescript
// drizzle(sqlite, { schema }) 로 초기화할 때 schema를 넣어야 db.query가 동작
const usersWithPosts = await db.query.users.findMany({
  with: {
    posts: {
      columns: { title: true, views: true, rating: true },
    },
  },
  where: eq(users.id, 1),
});
```

실행 결과:
```json
[
  {
    "id": 1,
    "name": "Jangwook Kim",
    "email": "kim@jangwook.net",
    "createdAt": "2026-06-10T06:27:18.000Z",
    "posts": [
      { "title": "Drizzle ORM 입문", "views": 142, "rating": 4.7 },
      { "title": "TypeScript 타입 안전성", "views": 89, "rating": 4.5 }
    ]
  }
]
```

`db.query.users.findFirst()`, `db.query.posts.findMany({ where: ... })` 형태로 쓸 수 있다. `with` 안에 또 `with`를 쓰면 깊은 중첩도 가능하다. 타입은 자동으로 추론된다.

이 API는 TypeORM의 `find({ relations: [...] })`와 비슷하지만, Drizzle은 런타임에 N+1 쿼리를 피하는 방향으로 SQL을 생성한다. (내부적으로 서브쿼리나 별도 쿼리를 조합하는 방식이라 상황에 따라 다를 수 있으니, 프로덕션에서는 실제 쿼리를 확인하는 게 좋다.)

## 트랜잭션: 여기서 함정에 빠졌다

이걸 직접 발견했을 때 좀 당황했다. `better-sqlite3`는 동기(synchronous) 드라이버다. SQLite 자체가 파일 기반 동기 DB이기 때문에 그렇게 설계됐다.

문제는 Drizzle의 트랜잭션 콜백에서 `async`를 쓰면 에러가 난다는 것이다.

```typescript
// ❌ 이렇게 하면 에러: "Transaction function cannot return a promise"
try {
  await db.transaction(async (tx) => {
    await tx.insert(users).values({ name: "Test", email: "test@test.com" });
  });
} catch (err) {
  console.error(err.message); // "Transaction function cannot return a promise"
}
```

직접 실행했을 때 정확히 이 에러가 났다. 처음엔 내가 뭘 잘못한 줄 알았는데, `better-sqlite3`의 특성 때문이다. 해결책은 동기 콜백으로 쓰는 것:

```typescript
// ✅ 이렇게 써야 한다 (synchronous)
db.transaction((tx) => {
  tx.update(users)
    .set({ balance: 800 })
    .where(eq(users.name, "Alice"))
    .run(); // .run()으로 동기 실행
  
  tx.update(users)
    .set({ balance: 700 })
    .where(eq(users.name, "Bob"))
    .run();
});
```

`.run()`이 동기 실행 메서드다. `.execute()`나 `await` 없이 바로 실행된다.

롤백은 콜백 안에서 예외를 던지면 자동으로 일어난다.

```typescript
try {
  db.transaction((tx) => {
    tx.update(users)
      .set({ balance: 0 })
      .where(eq(users.name, "Alice"))
      .run();
    
    throw new Error("실패 시나리오"); // 여기서 throw하면 롤백
  });
} catch (err) {
  // Alice의 balance는 그대로 유지됨
}
```

직접 테스트했을 때 롤백이 제대로 작동하는 걸 확인했다.

**PostgreSQL이나 MySQL을 쓰는 경우**는 다르다. `pg`나 `mysql2` 드라이버는 비동기라서 `async/await`를 쓸 수 있다:

```typescript
// PostgreSQL에서는 async 트랜잭션 가능
await db.transaction(async (tx) => {
  await tx.insert(users).values({ name: "Test", email: "test@pg.com" });
  await tx.insert(posts).values({ title: "Test post", authorId: 1 });
});
```

SQLite를 로컬 개발이나 엣지 환경에서 쓴다면, 이 동기/비동기 차이를 꼭 기억해두자. [Hono.js와 TypeScript로 REST API 만들기](/ko/blog/ko/hono-typescript-api-2026)에서 SQLite를 쓴다면 이 함정을 만날 가능성이 높다.

## 집계 쿼리와 Raw SQL

Drizzle이 SQL-like를 표방하는 만큼, `sql` 템플릿을 써서 원하는 SQL을 거의 그대로 쓸 수 있다.

```typescript
import { sql } from "drizzle-orm";

// 집계 쿼리
const stats = await db
  .select({
    avgRating: sql<number>`AVG(${posts.rating})`,
    totalViews: sql<number>`SUM(${posts.views})`,
    postCount: sql<number>`COUNT(*)`,
  })
  .from(posts);
```

출력:
```json
{ "avgRating": 4.466666666666667, "totalViews": 485, "postCount": 3 }
```

UPDATE에서 현재 값을 참조할 때도 유용하다:

```typescript
// views를 10씩 증가
const updated = await db
  .update(posts)
  .set({ views: sql`${posts.views} + 10` })
  .where(eq(posts.authorId, 1))
  .returning({ id: posts.id, title: posts.title, views: posts.views });
```

출력:
```
[
  { id: 1, title: 'Drizzle ORM 입문', views: 152 },
  { id: 2, title: 'TypeScript 타입 안전성', views: 99 }
]
```

`sql` 템플릿 안에 컬럼을 참조하면 Drizzle이 테이블/컬럼 이름을 자동으로 처리해줘서 SQL injection 걱정 없이 동적 쿼리를 쓸 수 있다.

## Prisma vs Drizzle: 솔직한 비교

이걸 쓰면서 느낀 점이다. 두 도구 중 하나를 선택해야 한다면 이렇게 본다.

| 기준 | Drizzle ORM | Prisma |
|------|------------|--------|
| 학습 곡선 | SQL 알면 빠름 | Prisma 스키마 별도 학습 |
| 마이그레이션 투명성 | SQL 파일 직접 확인 가능 | CLI 내부 처리 |
| 타입 안전성 | 스키마 파일 자체가 TS | 코드 생성으로 타입 제공 |
| 번들 크기 | 가볍다 (~300KB) | 더 크다 (Prisma Client 포함) |
| 문서/생태계 | 성숙 중 | 더 성숙함 |
| ORM 스타일 | SQL-like, 저수준 제어 | 추상화 높음, 편리 |
| Edge/Serverless | 매우 적합 (번들 작음) | HTTP Proxy 필요한 경우 있음 |

"어느 게 더 낫냐"가 아니라 상황에 맞는 선택이라고 생각한다. SQL에 익숙하고 마이그레이션을 직접 관리하고 싶다면 Drizzle이 더 편하다. 팀 전체가 ORM을 쓰고 생태계 안정성이 중요하다면 Prisma가 더 안전한 선택일 수 있다.

내가 느낀 Drizzle의 약점 하나는 문서가 아직 덜 정리된 부분이 있다는 것이다. API는 잘 작동하는데, 일부 엣지 케이스 동작이나 에러 메시지가 직관적이지 않을 때가 있다. 위의 트랜잭션 에러처럼 말이다.

## 프로덕션에서 주의할 점

몇 가지 실제 사용 시 고려할 부분들:

**Connection pooling**: `better-sqlite3`는 단일 연결 동기 드라이버라 서버리스 환경이나 멀티스레드 환경에서는 적합하지 않다. PostgreSQL을 쓴다면 `drizzle-orm/node-postgres`와 함께 `Pool`을 설정해야 한다.

```typescript
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

const pool = new Pool({
  host: "localhost",
  user: "postgres",
  database: "mydb",
  max: 10, // 최대 연결 수
});

const db = drizzle(pool);
```

**쿼리 로깅**: 개발 중에는 실제 SQL을 확인하는 게 중요하다.

```typescript
const db = drizzle(sqlite, {
  schema,
  logger: true, // 또는 custom logger
});
```

로그가 켜지면 실행되는 SQL이 콘솔에 찍힌다. ORM이 어떤 쿼리를 날리는지 확인하는 용도로 유용하다.

**N+1 쿼리**: `db.query` Relations API는 편리하지만, 내부 동작을 모르고 쓰면 N+1 쿼리가 발생할 수 있다. 프로덕션에서 로깅으로 확인하거나 직접 JOIN 쿼리를 쓰는 게 더 안전한 경우가 있다.

---

돌려본 소감으로 마무리하자면: Drizzle ORM은 "SQL 쓸 줄 아는 TypeScript 개발자"를 위한 도구다. 추상화 뒤에 숨기는 게 아니라 SQL을 타입 안전하게 그대로 쓰게 해준다. 트랜잭션 async 이슈처럼 SQLite 특성에서 오는 함정이 있지만, 문서보다 코드가 더 직관적으로 설명해준다는 점은 솔직히 마음에 들었다.

다음에는 Drizzle + Hono.js 조합으로 실제 REST API를 만드는 예제를 써볼 생각이다.

## drizzle-kit studio로 DB 들여다보기

Drizzle 0.30 이후로 `drizzle-kit studio`가 내장됐다. 별도 GUI 없이 DB 내용을 브라우저에서 볼 수 있는 로컬 뷰어다.

```bash
npx drizzle-kit studio --config=drizzle.config.ts
```

실행하면 `https://local.drizzle.studio`로 접속할 수 있는 웹 UI가 뜬다. 테이블 목록, 데이터 조회, 간단한 편집이 가능하다. Prisma Studio와 비슷한 포지션인데, 무료다.

개발 중에 DB 상태를 빠르게 확인할 때 유용하다. 하지만 프로덕션 DB에 대해 쓰는 건 권장하지 않는다. 인증이 별도로 없기 때문에 로컬이나 로컬 터널링 환경에서만 쓰자.

## TypeScript Zod와 조합하기

Drizzle 스키마에서 Zod 검증 스키마를 자동 생성할 수 있다. `drizzle-zod` 패키지를 쓴다.

```bash
npm install drizzle-zod zod
```

```typescript
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { posts } from "./schema";

// INSERT용 Zod 스키마 (id, createdAt 등 auto 필드 제외)
const insertPostSchema = createInsertSchema(posts, {
  title: z.string().min(1).max(200),
  content: z.string().min(10),
  rating: z.number().min(1).max(5).optional(),
});

// API 핸들러에서 바로 검증
type NewPost = z.infer<typeof insertPostSchema>;

function validatePost(data: unknown): NewPost {
  return insertPostSchema.parse(data); // 실패하면 ZodError throw
}
```

이렇게 하면 DB 스키마와 API 검증 스키마가 분리되지 않는다. DB 컬럼이 `notNull()`이면 Zod 스키마도 자동으로 required 필드가 된다. TypeScript Zod v4 + Claude API 구조화 출력 가이드에서 Zod를 더 깊게 다뤘으니 같이 보면 좋다.

`drizzle-valibot`이나 `drizzle-arktype`처럼 다른 검증 라이브러리와 연동하는 패키지도 있다.
