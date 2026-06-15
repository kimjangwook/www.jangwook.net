---
title: 从 Jest 迁移到 Vitest 4 完整指南 — 2026 年更快的测试环境搭建
description: >-
  基于 Vitest 4.1.7 的 Jest 项目完整迁移实战指南，附实验验证结果。涵盖安装配置切换、jest→vitest 代码转换模式、稳定
  Browser Mode 及新断言器（toSatisfy、toBeOneOf），可直接应用于生产。
pubDate: '2026-05-26'
heroImage: ../../../assets/blog/vitest-4-jest-migration-guide-2026-hero.png
tags:
  - Vitest
  - Jest
  - TypeScript
relatedPosts:
  - slug: mcp-server-typescript-sdk-step-by-step-2026
    score: 0.9
    reason:
      ko: TypeScript 주제를 한 단계 더 깊이 파고드는 글입니다.
      en: Goes one level deeper into TypeScript.
      ja: TypeScriptをもう一歩深く掘り下げた記事です。
      zh: 更深入地探讨 TypeScript 主题。
  - slug: hono-typescript-api-2026
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
  - question: "应该从 Jest 迁移到 Vitest 4 吗?"
    answer: "TypeScript 和 Vite 生态项目推荐迁移。在这类项目里维护 Jest 需要不断调试 ts-jest 转换层、tsconfig 冲突和模块解析报错，成本很高。但 Next.js 或 Express 的大型服务端测试套件需谨慎评估，因为 Vitest 针对 Vite 生态优化，在复杂服务端模块系统中可能出现预期外的行为。"
  - question: "globals: true 选项为什么重要?"
    answer: "开启此选项后，现有 Jest 代码中的 describe、test、expect 无需显式 import 即可运行，迁移初期不必一次性修改所有测试文件。如果不设置，会出现 describe is not defined 报错。"
  - question: "使用 vi.importActual() 时最常见的错误是什么?"
    answer: "与 jest.requireActual() 不同，vi.importActual() 是异步的，因此 mock 工厂必须是 async 并加上 await。忘记 await 会把 Promise 对象展开到 mock 中，而不是实际模块的导出。这是迁移部分 mock 时最常见的错误。"
  - question: "Vitest 4 的 Browser Mode 是什么?"
    answer: "Vitest 4 最大的变化是 Browser Mode 从实验性升级为稳定版。以前要靠 jest-dom + JSDOM 模拟的 DOM 测试，现在可以在真实 Chromium 中运行。这意味着将 Vitest 与 Playwright E2E 测试结合已是合理的生产策略。"
---

上个月整理了一个个人项目的测试流水线，把用了很久的 Jest 换成了 Vitest。原因很简单：在 TypeScript 项目里维护 Jest，需要 `ts-jest` 或 `babel-jest` 这类转换层。配置项越堆越多，报错信息就越来越像密文。

Vitest 使用和 Vite 相同的转换管道，因此无需额外配置就能理解 TypeScript。而且 Vitest 4 将 Browser Mode 升级为稳定版，以前要靠 jest-dom + JSDOM 模拟的 DOM 测试，现在可以在真实 Chromium 中运行了。

下面每个模式我都亲手跑过。动笔之前，我先在沙箱里装好 `vitest@4.1.7`，把 16 个测试全部跑通。所以这篇不打算逐一讲解配置文件，而是聚焦于"从 Jest 过来的人容易卡住的地方"。

## Vitest 比 Jest 好在哪里，不是速度而是配置

"Vitest 比 Jest 快 3〜8 倍"的 benchmark 数据到处都是。我没有亲自对比测速，但相较于速度，更有体感的是**配置复杂度的差异**。

用 Jest 写 TypeScript，通常需要这些包：

```bash
npm install --save-dev jest @types/jest ts-jest @jest/globals
```

还需要 `jest.config.ts`：

```ts
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
}
```

Vitest 只需：

```bash
npm install --save-dev vitest
```

不过也要说一个缺点：**Vitest 针对 Vite 生态优化，而非整个 Node.js。** 如果你在 Next.js 或 Express 等服务端框架的大型测试套件上使用 Jest，迁移成本可能比预想的要高。

## 前置条件

- Node.js 18 以上（推荐 22）
- 现有 Jest 项目（Jest 27〜30 均适用）
- 以 TypeScript 项目为例说明（纯 JS 项目流程相同）

确认环境：

```bash
node --version  # v22.22.0
npm --version   # 10.9.4
```

## Step 1: 安装 Vitest 4

先卸载现有 Jest 依赖：

```bash
npm uninstall jest @types/jest ts-jest babel-jest @jest/globals jest-environment-jsdom
```

安装 Vitest 4：

```bash
npm install --save-dev vitest@4
```

可选的 UI 面板：

```bash
npm install --save-dev @vitest/ui
```

验证安装：

```bash
npx vitest --version
# vitest/4.1.7 darwin-arm64 node-v22.22.0
```

安装了 52 个包，耗时 8 秒。与 Jest + ts-jest 组合相比，包数量减少了一半以上。

## Step 2: 编写 vitest.config.ts

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,          // 无需 import 即可使用 describe/test/expect（Jest 兼容）
    environment: 'node',    // 可选 'jsdom' | 'happy-dom' | 'browser'
    include: ['**/*.{test,spec}.{ts,js}'],
    reporters: ['verbose'],
    coverage: {
      provider: 'v8',
      include: ['src/**'],
      exclude: ['**/*.test.ts'],
    },
  },
})
```

**`globals: true` 是关键。** 开启此选项后，现有 Jest 代码中的 `describe`、`test`、`expect` 无需显式 import 即可运行。迁移初期不必一次性修改所有测试文件。

更新 `package.json` 脚本：

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage"
  }
}
```

## Step 3: Jest → Vitest 代码转换模式

大多数测试代码**可以直接运行**。设置 `globals: true` 后，`describe`、`test`、`expect`、`beforeEach`、`afterEach` 均无需修改。

需要转换的模式：

### jest.fn() → vi.fn()

```ts
// 迁移前 (Jest)
const mockFn = jest.fn((x: number) => x * 2)

// 迁移后 (Vitest)
import { vi } from 'vitest'
const mockFn = vi.fn((x: number) => x * 2)
```

沙箱验证：`vi.fn()` 行为与 `jest.fn()` 完全一致。

### jest.mock() → vi.mock()

```ts
// 迁移前
jest.mock('./api-service')

// 迁移后
vi.mock('./api-service', () => ({
  fetchUser: vi.fn(),
  createUser: vi.fn(),
}))
```

Vitest 对 `vi.mock()` 也应用了提升（hoisting），与 Jest 一样在文件顶部生效。

### jest.requireActual() → vi.importActual()

这是最容易出错的部分。Jest 中的部分 mock 模式：

```ts
// 迁移前 (Jest)
jest.mock('./utils', () => ({
  ...jest.requireActual('./utils'),
  formatDate: jest.fn(),
}))

// 迁移后 (Vitest) — 注意：必须是 async
vi.mock('./utils', async () => ({
  ...(await vi.importActual('./utils')),
  formatDate: vi.fn(),
}))
```

`vi.importActual()` 是**异步的**。忘记 `await` 会导致把 Promise 对象展开到 mock 中，而不是实际模块的导出。这是迁移部分 mock 时最常见的错误。

### vi.spyOn()

```ts
const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
console.log('test')
expect(spy).toHaveBeenCalledWith('test')
spy.mockRestore()
```

## Step 4: Vitest 3〜4 新增的断言器

这些断言器在 Jest 中不存在，迁移后可以直接使用。

### toHaveBeenCalledExactlyOnceWith

验证 mock 恰好被调用一次，且使用特定参数：

```ts
const fn = vi.fn()
fn('hello')
expect(fn).toHaveBeenCalledExactlyOnceWith('hello')
```

### toSatisfy

基于自定义谓词函数的断言，适合范围检查、模式匹配：

```ts
expect(42).toSatisfy((n: number) => n > 0 && n < 100)
expect('vitest').toSatisfy((s: string) => s.startsWith('vi'))
```

### toBeOneOf

检查值是否为列表中的一个，适合环境变量、状态值验证：

```ts
const env = process.env.NODE_ENV
expect(env).toBeOneOf(['development', 'staging', 'production'])
```

沙箱验证结果：三个断言器全部通过（0ms 各自）。

## Step 5: 按行号过滤测试

这是 Vitest 3+ 的功能，也是我用得最多的一个：

```bash
npx vitest run "src/vitest4-features.test.ts:19"
```

输出：

```
↓ src/vitest4-features.test.ts:6  > tracks calls with vi.fn()     [skipped]
✓ src/vitest4-features.test.ts:19 > toHaveBeenCalledExactlyOnceWith  1ms
...
Tests  1 passed | 7 skipped (8)
Duration  106ms
```

只运行第 19 行的测试，其余全部跳过。配合 VS Code Vitest 插件，在编辑器行号旁点击即可单独运行某个测试。

## Step 6: Inline Workspace (Vitest 3+)

以前在 monorepo 中需要单独的 `vitest.workspace.ts` 文件。现在可以直接在 `vitest.config.ts` 中内联定义：

```ts
export default defineConfig({
  test: {
    workspace: [
      {
        test: {
          name: 'unit',
          environment: 'node',
          include: ['src/**/*.unit.test.ts'],
        },
      },
      {
        test: {
          name: 'integration',
          environment: 'node',
          include: ['src/**/*.integration.test.ts'],
          globalSetup: './test/setup.ts',
        },
      },
    ],
  },
})
```

## Step 7: Browser Mode（Vitest 4 稳定版）

Vitest 4 最大的变化是 Browser Mode 从实验性升级为稳定版。

```bash
npm install --save-dev @vitest/browser-playwright playwright
```

```ts
export default defineConfig({
  test: {
    browser: {
      enabled: true,
      provider: 'playwright',
      instances: [
        { browser: 'chromium' },
        { browser: 'firefox' },
      ],
    },
  },
})
```

Browser Mode 的稳定意味着将 Vitest 与 Playwright E2E 测试结合使用，已是合理的生产策略，而非实验性方案。

## Step 8: CI 配置

```yaml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'
      - run: npm ci
      - run: npm test
```

只要更新了 `npm test` 脚本，CI 配置无需其他改动。

## 常见迁移陷阱

**1. 缺少 `globals: true` 导致 `describe is not defined`**

在 `vitest.config.ts` 的 `test` 中添加 `globals: true`，这是让大多数现有 Jest 代码直接运行的单一改动。

**2. `vi.importActual()` 同步使用返回空对象**

```ts
// 错误示例
vi.mock('./utils', () => ({
  ...vi.importActual('./utils'),  // 未 await → 展开的是 Promise，不是模块
}))

// 正确示例
vi.mock('./utils', async () => ({
  ...(await vi.importActual('./utils')),
}))
```

**3. `moduleNameMapper` 替换**

```ts
import path from 'path'
export default defineConfig({
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  test: { globals: true },
})
```

**4. 迁移完成后删除 `jest.config.ts`**

遗留的 jest 配置文件可能引发冲突。

## 沙箱完整运行结果

```
 RUN  v4.1.7

 ✓ src/math.jest-style.test.ts  (6 tests)   → Jest 风格代码直接运行
 ✓ src/api-service.test.ts      (2 tests)   → vi.mock() 模式
 ✓ src/vitest4-features.test.ts (8 tests)   → 新断言器、vi.fn、vi.spyOn

 Test Files  3 passed (3)
      Tests  16 passed (16)
   Duration  157ms
```

## 何时迁移，何时暂缓

在照抄安装命令之前，先判断这次切换是否适合你当前的项目。迁移不是免费的。它需要代码转换的时间、CI 的重新验证，以及团队的学习成本。我按下面的标准做了划分。

**值得迁移到 Vitest 的情况**

- 项目已经使用基于 Vite 的构建（Vite、SvelteKit、Nuxt、Astro）。此时测试转换流水线和构建流水线合二为一，重复配置随之消失。
- 使用 TypeScript，却一直在 `ts-jest` 或 `babel-jest` 中反复调试模块解析错误、ESM/CJS 冲突。
- 代码库以 ESM（`import`/`export`）为主。Jest 的 ESM 支持仍需实验性标志，而 Vitest 默认就是 ESM。
- 希望在真实浏览器中运行组件测试，而非 JSDOM 模拟。Vitest 4 的 [Browser Mode](https://vitest.dev/guide/browser/) 已将该场景提升为稳定版。

**应暂缓或避免迁移的情况**

- 拥有大型 Next.js 或 Express 服务端测试套件。Vitest 针对 Vite 生态优化，因此在 Node.js 模块系统的复杂场景下可能出现预期外的行为。官方[迁移指南](https://vitest.dev/guide/migration.html)本身也标注了与 Jest 的不兼容点，例如 `mockReset` 行为的差异。
- 团队严重依赖 Jest 快照、自定义解析器或庞大的 `jest.config` 资产，短期内无力重写。
- 这是一个纯 Node.js 库，且不需要 Browser Mode。此时维护 Jest 代价很小，迁移的边际收益也不大。
- 截止日期就在眼前。迁移最好放在稳定的迭代周期里做。一边改测试基础设施一边赶功能，会把两个变量混在一起，使调试更困难。

如果拿不定主意，建议先把一个小测试文件迁到 Vitest 并行运行。只要开启 `globals: true`，大部分代码都能原样通过，大约 30 分钟即可验证实际兼容性。

## 那么，到底值不值得迁移

我的判断：**TypeScript 项目推荐迁移，其他情况视具体需求而定。**

使用 TypeScript 的 Vite 生态项目（SvelteKit、Nuxt 等）继续维护 Jest 越来越逆势而为。转换层要配置。ts-jest 更新会把东西搞坏。模块解析时不时报错。调试这些问题的时间，不如用来开发。

Next.js 或 Express 的大型服务端测试套件则需要谨慎评估。Vitest 的 Vite 优先设计在复杂服务端模块系统中可能出现预期外的行为。

npm 周下载量从 480 万增长到 770 万，说明大量项目已经完成迁移。但并非所有人都顺利过渡。请根据项目复杂度做出决策。

[用 Bun 自动化 TypeScript 脚本](/zh/blog/zh/bun-shell-scripting-practical-guide-2026)与 Vitest 结合运行是我目前正在探索的组合，将在下一篇文章中介绍。Vitest 5.0 beta 已经在 npm 上了，现在迁移到 4.x 是稳妥的选择。

如果想进一步打磨 TypeScript 工具链，[用 TypeScript SDK 逐步构建 MCP 服务器](/zh/blog/zh/mcp-server-typescript-sdk-step-by-step-2026)和[用 Hono 编写类型安全的 API](/zh/blog/zh/hono-typescript-api-2026)同属一条脉络，可一并阅读。把测试、运行时和 API 层都对齐到 Vite 生态后，配置文件会明显减少。

## 参考资料（一手来源）

以下是本文用于核实的官方文档。版本之间行为常有变化，实际迁移前请务必查阅原文。

- [Vitest 官方网站](https://vitest.dev) — 配置、API 和变更日志的一手来源
- [Vitest 官方迁移指南](https://vitest.dev/guide/migration.html) — 标注了 Jest 兼容性及不兼容点（`globals`、`mockReset` 等）
- [Vitest Browser Mode 指南](https://vitest.dev/guide/browser/) — Vitest 4 中提升为稳定版的浏览器测试
- [Jest 官方网站](https://jestjs.io) — 迁移来源 Jest 的配置与 API 参考
