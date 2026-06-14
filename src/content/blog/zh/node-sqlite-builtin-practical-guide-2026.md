---
title: Node.js 内置 SQLite 完全指南 — 无需外部包，直接上手实战数据库
description: >-
  Node.js 22.5.0 起可用的 node:sqlite 内置模块，无需 npm install。从
  DatabaseSync、StatementSync、事务处理到自定义函数，全部基于实际运行代码和日志整理。
pubDate: '2026-06-09'
heroImage: >-
  ../../../assets/blog/node-sqlite-builtin-practical-guide-2026/node-sqlite-builtin-practical-guide-2026-hero.png
tags:
  - Node.js
  - SQLite
  - 内置模块
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
---

停止输入 `npm install sqlite3`。有更好的方式了。

Node.js 22.5.0 起内置了 `node:sqlite` 模块。无需安装，无需在 `package.json` 里添加条目，也无需原生编译。直接 `require('node:sqlite')` 就能用。在 v22.22.0 上运行时会显示实验性警告，Node.js v26 已将其完全稳定。

我实际测试了每一个 API。本文记录的就是这些发现。

## 为什么关注 node:sqlite

省去外部依赖不只是方便。`better-sqlite3` 和 `sqlite3` 都需要通过 `node-gyp` 编译原生绑定。在 CI 环境和 Alpine Linux 容器中，这个编译步骤经常失败。`node:sqlite` 将 SQLite 直接嵌入 Node.js 二进制文件中，不需要原生编译，也没有平台相关的失败问题。

坦白说，Node.js 22 上的 experimental 标签让我在生产环境投入上有所顾虑。等 Node.js v26 进入 LTS 通道、experimental 标签去掉之前，建议先在内部工具、脚本和原型项目中验证。不过 API 本身现在就足够稳定，完成度也很高。

### 与 better-sqlite3 的区别

一句话总结：设计理念相似，API 表面积更小。

- 同样只提供同步（sync）API
- 没有 `db.transaction()` 包装器，这是最大的差异（详见下文）
- 有 `db.function()` 和 `db.aggregate()`
- 没有 `serialize()`/`deserialize()` 方式的内存 DB 序列化

## 零安装入门

```bash
# 需要 Node.js 22.5.0+
node --version  # v22.22.0

node -e "const {DatabaseSync} = require('node:sqlite'); console.log('OK');"
# (node:...) ExperimentalWarning: SQLite is an experimental feature and might change at any time
# OK
```

用 `--no-warnings` 或 `NODE_NO_WARNINGS=1` 可以屏蔽警告。

核心是两个类：

- `DatabaseSync`：数据库连接对象
- `StatementSync`：预编译 SQL 语句

```js
const { DatabaseSync } = require('node:sqlite');

const memDb  = new DatabaseSync(':memory:');    // 内存数据库
const fileDb = new DatabaseSync('./my-app.db'); // 文件数据库（不存在则自动创建）
```

## API 全览

直接查询了原型链：

![node:sqlite API Reference — DatabaseSync 和 StatementSync 完整方法列表](../../../assets/blog/node-sqlite-builtin-practical-guide-2026/node-sqlite-api-reference.png)

```js
// DatabaseSync 方法
// ['open', 'close', 'prepare', 'exec', 'function',
//  'location', 'aggregate', 'createSession',
//  'applyChangeset', 'enableLoadExtension', 'loadExtension']

// StatementSync 方法
// ['iterate', 'all', 'get', 'run', 'columns',
//  'setAllowBareNamedParameters', 'setAllowUnknownNamedParameters',
//  'setReadBigInts', 'setReturnArrays']
```

## 基本 CRUD 模式

```js
const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync(':memory:');

db.exec(`
  CREATE TABLE products (
    id    INTEGER PRIMARY KEY AUTOINCREMENT,
    name  TEXT    NOT NULL,
    price REAL,
    stock INTEGER DEFAULT 0
  )
`);

// 命名参数的预编译语句
const insert = db.prepare(
  'INSERT INTO products (name, price, stock) VALUES (:name, :price, :stock)'
);

// run() — 返回 { lastInsertRowid, changes }
const result = insert.run({ name: 'AirPods Pro', price: 249.99, stock: 50 });
console.log(result);  // { lastInsertRowid: 1, changes: 1 }

insert.run({ name: 'MacBook Pro', price: 2499.99, stock: 10 });
insert.run({ name: 'iPad Air',    price: 749.99,  stock: 25 });

// all() — 返回行对象数组
const rows = db.prepare('SELECT * FROM products ORDER BY price DESC').all();
// [{ id: 2, name: 'MacBook Pro', ... }, ...]

// get() — 返回单行（不存在时返回 undefined）
const cheapest = db.prepare(
  'SELECT * FROM products ORDER BY price ASC LIMIT 1'
).get();
console.log(cheapest.name, cheapest.price);  // AirPods Pro 249.99

// iterate() — 逐行处理，节省内存
for (const row of db.prepare('SELECT * FROM products').iterate()) {
  console.log(row.id, row.name);
}

db.close();
```

同时支持位置参数（`?`）和命名参数（`:name`）。有 3 个以上字段时，命名参数的可读性明显更好。

## 事务：与 better-sqlite3 的核心差异

从 `better-sqlite3` 迁移过来时，最容易在这里卡住。

```js
// ❌ node:sqlite 中没有这个
const insertMany = db.transaction((items) => { ... });
```

没有 `db.transaction()`。需要通过 `exec()` 直接管理 BEGIN/COMMIT/ROLLBACK。

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
    console.log('✅ 已提交:', messages.length, '行');
  } catch (e) {
    db.exec('ROLLBACK');
    console.error('❌ 已回滚:', e.message);
    throw e;
  }
}

insertBatch(['服务器启动', '请求接收', '响应发送']);
// ✅ 已提交: 3 行

const count = db.prepare('SELECT COUNT(*) as cnt FROM log').get();
console.log('合计:', count.cnt);  // 合计: 3

db.close();
```

建议封装成工具函数：

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
```

[搭建 Hono API 服务器](/zh/blog/zh/hono-typescript-api-2026)时，这个工具函数可以直接复用。

## 自定义函数与聚合函数

可以在 SQL 中直接调用 JavaScript 函数，比看起来更实用。

```js
const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync(':memory:');
db.exec('CREATE TABLE scores (player TEXT, score INTEGER)');

const ins = db.prepare('INSERT INTO scores VALUES (?, ?)');
ins.run('Alice', 1200);
ins.run('Bob',   850);
ins.run('Alice', 1050);
ins.run('Charlie', 950);

// 标量函数
db.function('double_score', (score) => score * 2);

const doubled = db.prepare(
  'SELECT player, double_score(score) as ds FROM scores ORDER BY ds DESC'
).all();
console.log(doubled);
// [{ player: 'Alice', ds: 2400 }, ...]

// 自定义聚合
db.aggregate('weighted_avg', {
  start:  () => ({ sum: 0, count: 0 }),
  step:   (acc, val) => ({ sum: acc.sum + val, count: acc.count + 1 }),
  result: (acc) => acc.count > 0 ? acc.sum / acc.count : 0,
});

const avg = db.prepare('SELECT weighted_avg(score) as avg FROM scores').get();
console.log('平均分:', avg.avg);  // 平均分: 1012.5

db.close();
```

日期格式化、哈希计算、JSON 解析等通常在应用层处理的逻辑，都可以下推到查询层，减少查询后的数据转换量。

## StatementSync 高级选项

### setAllowBareNamedParameters

默认情况下命名参数的对象键需要冒号前缀。开启此选项后可以直接用 `{ key: val }` 形式传入。

```js
const stmt = db.prepare('INSERT INTO kv VALUES (:key, :value)');
stmt.setAllowBareNamedParameters(true);
stmt.run({ key: 'hello', value: 'world' });  // 无需 { ':key': 'hello' }
```

### setAllowUnknownNamedParameters

忽略对象中查询没有对应的多余键，适合从大对象中只映射部分字段的场景。

```js
const stmt = db.prepare('SELECT * FROM kv WHERE key = :key');
stmt.setAllowUnknownNamedParameters(true);
const row = stmt.get({ key: 'hello', irrelevant: 'ignored' });
```

### setReadBigInts

超过 `Number.MAX_SAFE_INTEGER`（2^53 - 1）的整数会损失精度。开启后返回 BigInt。

```js
db.exec('CREATE TABLE big (val INTEGER)');
db.exec('INSERT INTO big VALUES (9007199254740993)');

const stmt = db.prepare('SELECT val FROM big');
stmt.setReadBigInts(true);
const row = stmt.get();
console.log(row.val, typeof row.val);  // 9007199254740993n bigint
```

### setReturnArrays

返回数组的数组而不是对象数组，适合不需要列名的批量处理场景。

```js
const stmt = db.prepare('SELECT id, name FROM products');
stmt.setReturnArrays(true);
console.log(stmt.all());  // [[1, 'AirPods Pro'], [2, 'MacBook Pro'], ...]
```

## 实战示例：CLI 任务管理工具

一个完全基于 `node:sqlite` 构建的 CLI 工具，零外部依赖：

```js
// task-manager.js
const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const db = new DatabaseSync(path.join(__dirname, 'tasks.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    title      TEXT    NOT NULL,
    done       INTEGER DEFAULT 0,
    created_at INTEGER NOT NULL
  )
`);

const stmtAdd  = db.prepare('INSERT INTO tasks (title, created_at) VALUES (?, ?)');
const stmtDone = db.prepare('UPDATE tasks SET done = 1 WHERE id = ?');
const stmtList = db.prepare('SELECT * FROM tasks ORDER BY created_at DESC');
const stmtDel  = db.prepare('DELETE FROM tasks WHERE id = ?');

const add      = (title) => stmtAdd.run(title, Date.now()).lastInsertRowid;
const complete = (id)    => stmtDone.run(id).changes;
const list     = ()      => stmtList.all();
const remove   = (id)    => stmtDel.run(id).changes;

// 演示
const id1 = add('编写 node:sqlite 测试');
const id2 = add('起草博客文章');
const id3 = add('运行构建验证');

complete(id1);
list().forEach(t => console.log(`[${t.done ? '✓' : ' '}] #${t.id} ${t.title}`));

remove(id3);
console.log('\n删除后剩余:', list().length, '条任务');
db.close();
```

运行输出：

```
[ ] #3 运行构建验证
[ ] #2 起草博客文章
[✓] #1 编写 node:sqlite 测试

删除后剩余: 2 条任务
```

没有 `node-gyp`，没有原生插件，没有任何外部依赖。只需要 Node.js。

## WAL 模式与性能配置

```js
const db = new DatabaseSync('./app.db');
db.exec('PRAGMA journal_mode=WAL');     // 并发读写 + 更快的写入
db.exec('PRAGMA synchronous=NORMAL');   // 轻微性能提升
db.exec('PRAGMA cache_size=-64000');    // 64MB 缓存（默认约 2MB）
db.exec('PRAGMA temp_store=MEMORY');    // 临时表放内存

const mode = db.prepare('PRAGMA journal_mode').get();
console.log(mode.journal_mode);  // wal
```

正如[Deno 2 vs Bun 比较](/zh/blog/zh/deno-2-vs-bun-nodejs-runtime-2026-comparison)中提到的，开启 WAL 模式后，SQLite 可以处理大多数内部工具场景的负载，很多时候不需要 PostgreSQL。

## 错误处理

SQLite 错误以标准 `Error` 对象的形式抛出，附带 `errcode` 属性：

```js
try {
  db.exec('INVALID SQL @@@@');
} catch (e) {
  console.log(e.constructor.name);  // Error
  console.log(e.errcode);           // 1 (SQLITE_ERROR)
  console.log(e.message);           // near "INVALID": syntax error
}

try {
  db.exec("INSERT INTO t VALUES (1, 'b')");  // UNIQUE 约束违反
} catch (e) {
  console.log(e.errcode);  // 19 (SQLITE_CONSTRAINT)
}
```

## 当前局限与我的判断

**不足之处：**

- Node.js 22 仍是 experimental，小版本间 API 可能变化
- 只有同步 API，在 I/O 密集的服务器场景下会阻塞事件循环
- 没有 `db.transaction()` 包装器，事务代码更冗长
- 没有 `serialize()`/`deserialize()`

**我的看法：**

暂时不要部署到生产 HTTP 服务器。等 Node.js v26 LTS 稳定、experimental 标签去掉再说。但对于内部 CLI 工具、脚本、构建流程、缓存层和原型，现在就可以用。如果你在 CI 里被 `better-sqlite3` 的构建失败折磨过，这个模块马上就能改善体验。

在构建[类似 Bun Shell 的自动化脚本](/zh/blog/zh/bun-shell-scripting-practical-guide-2026)或内部开发工具时，想要最小化外部依赖，`node:sqlite` 是当下实用的选择。

## 内部工具，现在就够用了

把每个方法都测过一遍后，留下的结论只有一句：完成度比预期高。`DatabaseSync`、`StatementSync`、自定义函数、聚合函数、WAL 模式、BigInt 支持，内部工具会用到的功能基本都在。

`better-sqlite3` 的 `db.transaction()` 包装器缺失，是最明显的遗憾。不过写一个 `withTransaction()` 工具函数就能补上，算不上障碍。

这是个信号：Node.js 生态在持续把能力内置化。先是 `fetch`，再是 `WebCrypto`、`test runner`，现在轮到 `sqlite`。下一个会不会是内置 `postgresql`？有点贪心，但开发者总得有点念想。
