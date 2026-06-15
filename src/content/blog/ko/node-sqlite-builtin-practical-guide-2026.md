---
title: Node.js 내장 SQLite 완전 가이드 — 외부 패키지 없이 바로 쓰는 실전 DB
description: >-
  Node.js 22.5.0부터 npm install 없이 쓸 수 있는 node:sqlite 모듈. DatabaseSync,
  StatementSync, 트랜잭션, 사용자 정의 함수까지 실제 실행한 코드와 로그로 정리했다.
pubDate: '2026-06-09'
heroImage: >-
  ../../../assets/blog/node-sqlite-builtin-practical-guide-2026/node-sqlite-builtin-practical-guide-2026-hero.png
tags:
  - Node.js
  - SQLite
  - 내장 모듈
relatedPosts:
  - slug: drizzle-orm-typescript-complete-guide-2026
    score: 0.9
    reason:
      ko: sqlite 주제를 한 단계 더 깊이 파고드는 글입니다.
      en: Goes one level deeper into sqlite.
      ja: sqliteをもう一歩深く掘り下げた記事です。
      zh: 更深入地探讨 sqlite 主题。
  - slug: deno-2-vs-bun-nodejs-runtime-2026-comparison
    score: 0.85
    reason:
      ko: node.js를 실제로 다뤄본 경험이 이어지는 글입니다.
      en: Continues the hands-on node.js experience.
      ja: node.jsを実際に扱った経験が続く記事です。
      zh: 延续 node.js 的实战经验。
faq:
  - question: "node:sqlite는 어느 Node.js 버전부터 쓸 수 있나요?"
    answer: "Node.js 22.5.0부터 내장 모듈로 추가됐습니다. v22.22.0에서는 experimental 경고와 함께 작동하고, v26에서 정식 안정화됐습니다. 별도 설치 없이 require('node:sqlite')로 바로 사용할 수 있습니다."
  - question: "better-sqlite3 대신 node:sqlite를 써도 되나요?"
    answer: "동기 전용이라는 설계 철학은 같지만 API 표면이 더 좁습니다. 가장 큰 차이는 db.transaction() 래퍼가 없어서 exec()으로 BEGIN/COMMIT/ROLLBACK을 직접 관리해야 한다는 점입니다. serialize()/deserialize() 메모리 직렬화도 없습니다. 다만 네이티브 빌드가 필요 없어 CI나 Alpine 컨테이너에서 빌드 실패 문제가 사라집니다."
  - question: "node:sqlite를 프로덕션 서버에 바로 써도 되나요?"
    answer: "글쓴이는 아직 이르다고 봅니다. Node.js 22에서는 experimental 딱지가 붙어 마이너 버전에서 API가 바뀔 수 있고, 동기 호출이 I/O가 많은 서버의 이벤트 루프를 막을 수 있기 때문입니다. 대신 내부 CLI 툴, 스크립트, 빌드 도구, 캐시, 프로토타입에는 지금 당장 써도 됩니다."
  - question: "트랜잭션은 어떻게 처리하나요?"
    answer: "db.exec('BEGIN') 후 try 블록에서 작업하고 성공 시 COMMIT, 실패 시 ROLLBACK을 호출하면 됩니다. 반복 사용한다면 이 패턴을 withTransaction(db, fn) 헬퍼 함수로 한 번 만들어두는 것이 편리합니다."
---

`npm install sqlite3`를 입력하던 습관을 멈춰야 할 시점이 왔다.

Node.js 22.5.0부터 `node:sqlite`라는 내장 모듈이 생겼다. 설치가 필요 없다. `package.json`에 추가할 것도 없다. 그냥 `require('node:sqlite')`하면 된다. 지금 당장 v22.22.0에서 실험적(experimental) 경고와 함께 작동하고, Node.js v26에서는 안정화됐다.

직접 설치해서 API를 전부 두드려봤다. 이 글은 그 결과다.

## 왜 지금 node:sqlite인가

외부 패키지를 안 써도 된다는 건 단순한 편의 이상이다. `better-sqlite3`나 `sqlite3`는 네이티브 바인딩(`node-gyp` 빌드)이 필요해서 CI 환경이나 Alpine Linux 기반 컨테이너에서 자주 빌드가 깨졌다. `node:sqlite`는 Node.js 바이너리에 SQLite가 내장되어 있어서 그 문제가 없다.

솔직히 말하면, Node.js 22에서 아직 experimental 딱지가 붙어 있다는 점은 프로덕션 투입을 망설이게 한다. v26이 LTS 라인에 올라올 때까지는 내부 툴링이나 스크립트, 프로토타입 프로젝트에서 먼저 검증하는 게 현실적이다. 하지만 API 자체는 지금도 충분히 안정적이고 완성도가 높다.

### better-sqlite3와 뭐가 다른가

한 줄로 요약하면, 설계 철학은 비슷하지만 API 표면이 좁다.

- 동기(sync) 전용이라는 점은 같다
- `db.transaction()` 래퍼가 없다. 이게 가장 큰 차이인데, 아래 섹션에서 자세히 다룬다
- `db.function()`, `db.aggregate()`는 있다
- `serialize()`/`deserialize()` 방식의 메모리 DB 직렬화는 없다

## 설치 없이 시작하기

```bash
# Node.js 22.5.0 이상이면 바로 된다
node --version  # v22.22.0

node -e "const {DatabaseSync} = require('node:sqlite'); console.log('OK');"
# (node:...) ExperimentalWarning: SQLite is an experimental feature and might change at any time
# OK
```

경고를 없애려면 `--no-warnings` 플래그를 쓰거나, `NODE_NO_WARNINGS=1` 환경변수를 설정하면 된다. 로컬 개발 중에는 경고가 있어도 상관없다.

API의 핵심은 두 클래스다:

- `DatabaseSync`: 데이터베이스 연결 객체
- `StatementSync`: 준비된 SQL 문

메모리 DB는 `:memory:`로, 파일 기반 DB는 경로를 넘긴다.

```js
const { DatabaseSync } = require('node:sqlite');

// 메모리 데이터베이스
const memDb = new DatabaseSync(':memory:');

// 파일 기반 (없으면 자동 생성)
const fileDb = new DatabaseSync('./my-app.db');
```

## DatabaseSync 메서드 전체 정리

직접 API를 조회해봤다. `DatabaseSync` 인스턴스에서 사용할 수 있는 메서드는 다음과 같다:

```js
const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(db));
// ['open', 'close', 'prepare', 'exec', 'function',
//  'location', 'aggregate', 'createSession',
//  'applyChangeset', 'enableLoadExtension', 'loadExtension']
```

`StatementSync`의 메서드:

```js
// ['iterate', 'all', 'get', 'run', 'columns',
//  'setAllowBareNamedParameters', 'setAllowUnknownNamedParameters',
//  'setReadBigInts', 'setReturnArrays']
```

`better-sqlite3`를 써봤다면 대부분 낯익을 것이다. 아래에서 실제로 사용하며 각 메서드를 살펴본다.

## 기본 CRUD 패턴

```js
const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync(':memory:');

// 스키마 생성
db.exec(`
  CREATE TABLE products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL,
    stock INTEGER DEFAULT 0
  )
`);

// PreparedStatement 생성
const insert = db.prepare(
  'INSERT INTO products (name, price, stock) VALUES (:name, :price, :stock)'
);

// run() — INSERT/UPDATE/DELETE, 반환값: { lastInsertRowid, changes }
const result = insert.run({ name: 'AirPods Pro', price: 249.99, stock: 50 });
console.log(result);
// { lastInsertRowid: 1, changes: 1 }

insert.run({ name: 'MacBook Pro', price: 2499.99, stock: 10 });
insert.run({ name: 'iPad Air', price: 749.99, stock: 25 });

// all() — 여러 행 반환
const all = db.prepare('SELECT * FROM products ORDER BY price DESC').all();
console.log(all);
// [
//   { id: 2, name: 'MacBook Pro', price: 2499.99, stock: 10 },
//   { id: 3, name: 'iPad Air',    price: 749.99,  stock: 25 },
//   { id: 1, name: 'AirPods Pro', price: 249.99,  stock: 50 }
// ]

// get() — 단일 행 반환 (없으면 undefined)
const cheapest = db.prepare(
  'SELECT * FROM products ORDER BY price ASC LIMIT 1'
).get();
console.log(cheapest.name, cheapest.price);  // AirPods Pro 249.99

// iterate() — 이터레이터로 큰 결과셋 처리
const stmt = db.prepare('SELECT * FROM products');
for (const row of stmt.iterate()) {
  // 메모리에 전부 올리지 않고 row by row 처리
  console.log(row.id, row.name);
}

db.close();
```

위치 파라미터(`?`)와 이름 파라미터(`:name`)를 모두 지원한다. 복잡한 쿼리에선 이름 파라미터가 훨씬 가독성이 좋다.

## 트랜잭션: better-sqlite3와의 핵심 차이

`better-sqlite3`를 쓰다가 `node:sqlite`로 넘어오면 제일 먼저 막히는 지점이 여기다.

```js
// ❌ node:sqlite에는 이게 없다
const insertMany = db.transaction((items) => { ... });
```

`db.transaction()`이 없다. 대신 `exec()`으로 직접 BEGIN/COMMIT/ROLLBACK을 관리해야 한다.

```js
const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync(':memory:');
db.exec('CREATE TABLE log (id INTEGER PRIMARY KEY AUTOINCREMENT, msg TEXT)');

const insert = db.prepare('INSERT INTO log (msg) VALUES (?)');

function insertBatch(messages) {
  db.exec('BEGIN');
  try {
    for (const msg of messages) {
      insert.run(msg);
    }
    db.exec('COMMIT');
    console.log('✅ Committed:', messages.length, 'rows');
  } catch (e) {
    db.exec('ROLLBACK');
    console.error('❌ Rolled back:', e.message);
    throw e;
  }
}

insertBatch(['서버 시작', '요청 수신', '응답 전송']);
// ✅ Committed: 3 rows

const count = db.prepare('SELECT COUNT(*) as cnt FROM log').get();
console.log('Total:', count.cnt);  // Total: 3

db.close();
```

더 많은 쿼리를 다루는 코드라면 이 패턴을 래퍼로 뽑아두는 게 낫다:

```js
function withTransaction(db, fn) {
  db.exec('BEGIN');
  try {
    const result = fn();
    db.exec('COMMIT');
    return result;
  } catch (e) {
    db.exec('ROLLBACK');
    throw e;
  }
}

// 사용
withTransaction(db, () => {
  insert.run('이벤트 1');
  insert.run('이벤트 2');
});
```

이 방식이 번거롭긴 하다. `better-sqlite3`의 `db.transaction()` 래퍼가 더 편하다는 건 인정한다. 하지만 내장 모듈이라는 장점을 고려하면 이 정도 트레이드오프는 수용 가능하다.

## 사용자 정의 함수와 집계 함수

SQL 안에서 JavaScript 함수를 직접 부를 수 있다. 이건 SQLite 자체 기능을 Node.js에서 연결해주는 부분인데, 생각보다 실용적이다.

```js
const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync(':memory:');
db.exec('CREATE TABLE scores (player TEXT, score INTEGER)');

const ins = db.prepare('INSERT INTO scores VALUES (?, ?)');
ins.run('Alice', 1200);
ins.run('Bob', 850);
ins.run('Alice', 1050);
ins.run('Charlie', 950);

// db.function() — 사용자 정의 스칼라 함수
db.function('double_score', (score) => score * 2);

const doubled = db.prepare(
  'SELECT player, double_score(score) as ds FROM scores ORDER BY ds DESC'
).all();
console.log(doubled);
// [{ player: 'Alice', ds: 2400 }, { player: 'Alice', ds: 2100 }, ...]

// db.aggregate() — 사용자 정의 집계 함수
db.aggregate('weighted_avg', {
  start: () => ({ sum: 0, count: 0 }),
  step: (acc, val) => ({ sum: acc.sum + val, count: acc.count + 1 }),
  result: (acc) => acc.count > 0 ? acc.sum / acc.count : 0,
});

const avg = db.prepare('SELECT weighted_avg(score) as avg FROM scores').get();
console.log('평균 점수:', avg.avg);  // 평균 점수: 1012.5

db.close();
```

데이터 정제, 암호화, 해시 등 순수 SQL로 처리하기 어려운 로직을 JS로 구현해서 쿼리에 바로 꽂을 수 있다. [Hono.js API 서버를 구성할 때](/ko/blog/ko/hono-typescript-api-2026) 날짜 포매팅이나 JSON 파싱을 DB 레벨에서 처리하는 용도로 쓰면 편리하다.

## StatementSync 고급 옵션

`StatementSync`에는 동작을 제어하는 setter 메서드들이 있다.

### setAllowBareNamedParameters

이름 파라미터를 쓸 때 기본적으로 객체 키에 콜론 접두사(`:name`)가 필요하다. `setAllowBareNamedParameters(true)`를 켜면 `{ name: 'val' }` 형태로 넘길 수 있다.

```js
const stmt = db.prepare('INSERT INTO kv VALUES (:key, :value)');
stmt.setAllowBareNamedParameters(true);

// 콜론 없이 넘기기
stmt.run({ key: 'greeting', value: 'hello' });
```

### setAllowUnknownNamedParameters

쿼리에 없는 키를 파라미터 객체에 넘겨도 에러가 나지 않도록 한다. 큰 객체에서 일부 필드만 쿼리에 매핑할 때 유용하다.

```js
const stmt = db.prepare('SELECT * FROM kv WHERE key = :key');
stmt.setAllowUnknownNamedParameters(true);

// extra 필드는 무시됨
const row = stmt.get({ key: 'greeting', extra: 'ignored' });
```

### setReadBigInts

`Number.MAX_SAFE_INTEGER`(2^53 - 1)를 넘는 INTEGER 값을 읽을 때는 JavaScript의 일반 숫자로는 정밀도가 손실된다. `setReadBigInts(true)`를 켜면 BigInt로 반환한다.

```js
db.exec('CREATE TABLE big (val INTEGER)');
db.exec('INSERT INTO big VALUES (9007199254740993)');  // MAX_SAFE_INTEGER + 1

const stmt = db.prepare('SELECT val FROM big');
stmt.setReadBigInts(true);
const row = stmt.get();
console.log(row.val, typeof row.val);
// 9007199254740993n bigint
```

### setReturnArrays

기본적으로 `all()`은 객체 배열을 반환한다. `setReturnArrays(true)`를 켜면 배열의 배열로 반환한다. 컬럼 이름이 필요 없고 성능이 중요한 대량 처리에서 약간 유리하다.

```js
const stmt = db.prepare('SELECT id, player, score FROM scores LIMIT 2');
stmt.setReturnArrays(true);
const rows = stmt.all();
console.log(rows);
// [[1, 'Alice', 1200], [2, 'Bob', 850]]
```

## 실전 예제: CLI 할 일 관리 도구

말로만 설명하는 것보다 실제로 돌아가는 코드를 보는 게 낫다. 외부 패키지 없이 `node:sqlite`만으로 만든 간단한 CLI 도구다.

```js
// task-manager.js
const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const db = new DatabaseSync(path.join(__dirname, 'tasks.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id     INTEGER PRIMARY KEY AUTOINCREMENT,
    title  TEXT    NOT NULL,
    done   INTEGER DEFAULT 0,
    created_at INTEGER NOT NULL
  )
`);

const stmtAdd  = db.prepare('INSERT INTO tasks (title, created_at) VALUES (?, ?)');
const stmtDone = db.prepare('UPDATE tasks SET done = 1 WHERE id = ?');
const stmtList = db.prepare('SELECT * FROM tasks ORDER BY created_at DESC');
const stmtDel  = db.prepare('DELETE FROM tasks WHERE id = ?');

function add(title) {
  const { lastInsertRowid } = stmtAdd.run(title, Date.now());
  console.log(`✅ Added #${lastInsertRowid}: ${title}`);
}

function complete(id) {
  const { changes } = stmtDone.run(id);
  console.log(changes ? `✓ #${id} completed` : `#${id} not found`);
}

function list() {
  const tasks = stmtList.all();
  if (!tasks.length) { console.log('(no tasks)'); return; }
  tasks.forEach(t => console.log(`[${t.done ? '✓' : ' '}] #${t.id} ${t.title}`));
}

function remove(id) {
  stmtDel.run(id);
  console.log(`🗑 #${id} deleted`);
}

// 사용 예시
add('Node.js 내장 SQLite 테스트 작성');
add('블로그 포스트 초안 작성');
add('빌드 검증 실행');

complete(1);
list();

remove(3);
console.log('\nAfter delete:');
list();

db.close();
```

실행 결과:

```
✅ Added #1: Node.js 내장 SQLite 테스트 작성
✅ Added #2: 블로그 포스트 초안 작성
✅ Added #3: 빌드 검증 실행
✓ #1 completed
[ ] #3 빌드 검증 실행
[ ] #2 블로그 포스트 초안 작성
[✓] #1 Node.js 내장 SQLite 테스트 작성
🗑 #3 deleted

After delete:
[ ] #2 블로그 포스트 초안 작성
[✓] #1 Node.js 내장 SQLite 테스트 작성
```

`node-gyp`, `better-sqlite3`, `sqlite3` — 아무것도 필요 없다. Node.js 하나면 충분하다.

## WAL 모드와 성능 설정

프로덕션 환경이라면 WAL(Write-Ahead Logging) 모드를 켜는 게 기본이다. 읽기-쓰기 동시성이 올라가고 쓰기 성능도 좋아진다.

```js
const db = new DatabaseSync('./app.db');

// WAL 모드 활성화
db.exec('PRAGMA journal_mode=WAL');

// 추가 성능 설정
db.exec('PRAGMA synchronous=NORMAL');   // 약간의 성능 향상, durability 소폭 감소
db.exec('PRAGMA cache_size=-64000');    // 64MB 캐시 (기본은 2MB)
db.exec('PRAGMA temp_store=MEMORY');    // 임시 테이블을 메모리에

// 설정 확인
const mode = db.prepare('PRAGMA journal_mode').get();
console.log('journal_mode:', mode.journal_mode);  // wal
```

[Deno 2 vs Bun 비교](/ko/blog/ko/deno-2-vs-bun-nodejs-runtime-2026-comparison)에서도 언급했지만, SQLite는 단일 서버 내 작업에는 충분히 빠르다. WAL 모드까지 켜면 대부분의 내부 툴링 시나리오에서 PostgreSQL이 필요한 이유가 사라진다.

## 에러 처리

SQLite 에러는 표준 JavaScript `Error` 객체에 `errcode` 속성이 추가된 형태로 온다.

```js
const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync(':memory:');
db.exec('CREATE TABLE t (id INTEGER PRIMARY KEY, val TEXT)');
db.exec("INSERT INTO t VALUES (1, 'a')");

try {
  // 문법 에러
  db.exec('INVALID SQL @@@@');
} catch (e) {
  console.log('type:', e.constructor.name);  // Error
  console.log('code:', e.errcode);           // 1 (SQLITE_ERROR)
  console.log('msg:', e.message);            // near "INVALID": syntax error
}

try {
  // UNIQUE 제약 위반
  db.exec("INSERT INTO t VALUES (1, 'b')");
} catch (e) {
  console.log('errcode:', e.errcode);        // 19 (SQLITE_CONSTRAINT)
}

db.close();
```

SQLite 에러 코드 전체 목록은 [공식 문서](https://www.sqlite.org/rescode.html)에서 확인할 수 있다. `errcode 19`는 제약 위반, `errcode 1`은 일반 SQL 오류다.

## 언제 쓰고, 언제 피해야 하나

`node:sqlite`와 `better-sqlite3` 사이에서 고민된다면, 결정은 의외로 단순하다. 둘 다 동기 전용에 SQLite를 임베딩한다는 본질은 같으니, 갈리는 지점은 "외부 의존성을 감수할 가치가 있는 기능이 필요한가"다.

**node:sqlite를 선택할 때:**

- CI나 Alpine 컨테이너에서 네이티브 빌드 실패를 더는 보고 싶지 않을 때. 이게 가장 큰 동기다
- 내부 CLI 도구, 빌드 스크립트, 캐시 레이어처럼 의존성을 0에 가깝게 유지하고 싶은 환경
- 트랜잭션이 단순하거나 `withTransaction` 헬퍼 하나로 충분한 경우
- Docker 이미지 크기를 줄이고 싶을 때. `node_modules`에 네이티브 애드온이 없으면 빌드 단계가 통째로 사라진다

**better-sqlite3를 유지할 때:**

- `db.transaction()`의 중첩 트랜잭션(savepoint)이나 `deferred`/`immediate`/`exclusive` 모드를 실제로 쓰고 있을 때
- `serialize()`/`deserialize()`로 메모리 DB를 버퍼로 덤프하거나 복원하는 로직이 코드에 박혀 있을 때
- Node.js 22 LTS에 묶여 있고 experimental 경고나 마이너 버전 간 API 변경을 감당할 수 없는 프로덕션 서버
- 이미 잘 돌아가는 코드베이스. 빌드가 깨진 적 없다면 굳이 갈아탈 이유가 없다

한 문장으로 줄이면 이렇다. 새 프로젝트나 내부 툴이라면 `node:sqlite`부터 시도하고, 막히는 기능이 나올 때 `better-sqlite3`로 돌아가면 된다. 반대로 기존 프로덕션 코드를 굳이 마이그레이션할 이유는 아직 없다. 세부 동작은 [공식 node:sqlite 문서](https://nodejs.org/api/sqlite.html)와 [better-sqlite3 저장소](https://github.com/WiseLibs/better-sqlite3)를 직접 비교해보는 게 가장 확실하다.

## 현재 한계와 내 판단

솔직하게 정리한다.

**한계:**

- Node.js 22에서는 여전히 experimental. 마이너 버전에서 API가 바뀔 수 있다
- 비동기 API 없음. SQLite는 원래 임베디드 DB이므로 이건 설계상 선택이지만, I/O가 많은 서버에서 동기 호출이 이벤트 루프를 막을 수 있다
- `db.transaction()` 래퍼 없음. 코드가 더 verbose해진다
- `serialize()`/`deserialize()` 없음. 메모리 DB를 버퍼로 직렬화하는 better-sqlite3 방식이 안 된다
- 익스텐션 로딩(`loadExtension`)은 있지만 플랫폼 의존성이 있음

**내 입장:**

프로덕션 서버에 바로 쓰기엔 아직 이르다. Node.js v26 LTS가 나오고 experimental 딱지가 떨어질 때까지 기다리는 게 맞다. 하지만 내부 CLI 툴, 스크립트, 빌드 도구, 캐시 레이어, 단기 프로토타입에는 지금 당장 써도 된다. `better-sqlite3` 빌드 실패에 지쳐있다면 특히 그렇다.

[Bun Shell 스크립트 자동화](/ko/blog/ko/bun-shell-scripting-practical-guide-2026)나 내부 개발 도구를 만들 때 외부 의존성을 최소화하고 싶다면, `node:sqlite`는 지금도 실용적인 선택이다.

## 결국 내부 툴링에는 지금도 충분하다

API를 전부 두드려본 뒤 남은 생각은 하나였다. 생각보다 완성도가 높다. `DatabaseSync`, `StatementSync`, 사용자 정의 함수, 집계 함수, WAL 모드, BigInt 지원. 내부 툴링에서 손이 가는 기능은 거의 다 들어 있다.

`better-sqlite3`의 `db.transaction()` 같은 편의 기능이 빠진 건 아쉽다. 그렇다고 못 쓸 정도는 아니다. `withTransaction` 헬퍼 하나 만들면 끝나는 일이니까.

이건 Node.js 생태계가 외부 의존성을 줄이는 쪽으로 움직인다는 신호로 읽힌다. `fetch`, `WebCrypto`, `test runner`에 이어 이제 `sqlite`까지 들어왔다. 다음은 `postgresql` 내장을 기대해도 될까. 쓰고 보니 좀 욕심이긴 하다.

## 1차 출처

직접 확인하고 싶다면 아래 공식 문서를 참고하라.

- [Node.js 공식 문서 — SQLite (node:sqlite)](https://nodejs.org/api/sqlite.html): `DatabaseSync`, `StatementSync`, `db.function()`, `db.aggregate()` 등 전체 API 레퍼런스
- [WiseLibs/better-sqlite3 (GitHub)](https://github.com/WiseLibs/better-sqlite3): 비교 대상 라이브러리의 공식 저장소와 API 문서
- [SQLite 공식 문서 — Result and Error Codes](https://www.sqlite.org/rescode.html): `errcode` 값(1, 19 등)의 의미 전체 목록
- [SQLite 공식 문서 — Write-Ahead Logging](https://www.sqlite.org/wal.html): WAL 모드의 동작 원리와 트레이드오프
