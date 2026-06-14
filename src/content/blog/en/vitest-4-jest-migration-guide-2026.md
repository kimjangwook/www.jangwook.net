---
title: 'Migrating from Jest to Vitest 4: A Complete 2026 Guide'
description: >-
  Migrate Jest to Vitest 4.1.7 painlessly: config conversion, vi.importActual
  async traps, stable Browser Mode, and new matchers, all tested in a real
  sandbox.
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
  - question: "Should I migrate from Jest to Vitest 4?"
    answer: "Yes for TypeScript and Vite-based projects. Maintaining Jest there means constant debugging of ts-jest transform layers, tsconfig conflicts, and module resolution errors. For large Next.js or Express server test suites, be more careful since Vitest is optimized for the Vite ecosystem and can surface unexpected module resolution issues."
  - question: "Why does globals: true matter in the Vitest config?"
    answer: "With globals: true, existing Jest code that uses describe, test, and expect without explicit imports runs immediately, so you do not have to change all your test files at once. Without it you get a describe is not defined error."
  - question: "What is the most common mistake when migrating to vi.importActual()?"
    answer: "Unlike jest.requireActual(), vi.importActual() is async, so the mock factory must be async and you must await the call. Forget the await and a Promise object gets spread into your mock instead of the real module exports. This is the most common mistake when migrating partial mocks."
  - question: "How long does a Vitest migration take?"
    answer: "For a small TypeScript project it was 30 to 60 minutes in my experience. The slowest parts are finding the vi.importActual() patterns and moving moduleNameMapper over to resolve.alias. Once those two are mapped out, the rest is almost automatic."
---

Last month I overhauled the test pipeline for a side project and switched from Jest to Vitest. The reason was straightforward: maintaining Jest in a TypeScript project means you need transformation layers like `ts-jest` or `babel-jest`. The more config options you pile on, the more error messages start reading like cryptic noise.

Vitest uses the same transformation pipeline as Vite, so it understands TypeScript without any extra setup. And with Vitest 4 graduating Browser Mode to stable, you can now run DOM tests in actual Chromium instead of the JSDOM simulation that jest-dom required.

Every pattern below is something I actually ran. I installed `vitest@4.1.7` in a sandbox and got 16 tests passing before writing a word of this. So instead of walking through config options one by one, I focused on the specific places where people coming from Jest tend to get stuck.

## Why Vitest Over Jest: It's the Config, Not the Speed

The "3–8x faster" benchmark numbers are everywhere. I didn't do a direct comparison myself, but what I noticed more than speed was **the difference in configuration complexity**.

Running Jest with TypeScript typically requires:

```bash
npm install --save-dev jest @types/jest ts-jest @jest/globals
```

Plus `jest.config.ts`:

```ts
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
}
```

Vitest:

```bash
npm install --save-dev vitest
```

That's it.

One honest caveat: **Vitest is optimized for the Vite ecosystem, not for all of Node.js.** If you're running large server-side test suites in Next.js or Express, migration could be more work than expected. The "just works" story is strongest for Vite-based frontend and TypeScript library projects.

## Prerequisites

- Node.js 18 or higher (22 recommended)
- An existing Jest project (Jest 27–30 all apply)
- TypeScript project (pure JS projects follow the same steps)

Check versions:

```bash
node --version  # v22.22.0
npm --version   # 10.9.4
```

## Step 1: Install Vitest 4

Remove existing Jest dependencies first:

```bash
npm uninstall jest @types/jest ts-jest babel-jest @jest/globals jest-environment-jsdom
```

Install Vitest 4:

```bash
npm install --save-dev vitest@4
```

Optional UI dashboard:

```bash
npm install --save-dev @vitest/ui
```

Verify:

```bash
npx vitest --version
# vitest/4.1.7 darwin-arm64 node-v22.22.0
```

52 packages installed in 8 seconds. That's roughly half the package count of Jest + ts-jest.

## Step 2: Write vitest.config.ts

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,          // Use describe/test/expect without imports (Jest compat)
    environment: 'node',    // 'jsdom' | 'happy-dom' | 'browser'
    include: ['**/*.{test,spec}.{ts,js}'],
    reporters: ['verbose'],
    coverage: {
      provider: 'v8',       // v8-based instead of Jest's babel
      include: ['src/**'],
      exclude: ['**/*.test.ts'],
    },
  },
})
```

**`globals: true` is the key setting.** With this on, your existing Jest code that uses `describe`, `test`, and `expect` without explicit imports will run immediately. You don't have to change all your test files at once during migration.

Update `package.json` scripts:

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

Replace `"test": "jest"` with the Vitest equivalent.

## Step 3: Jest → Vitest Code Conversion Patterns

Most test code **just works.** With `globals: true`, `describe`, `test`, `expect`, `beforeEach`, `afterEach` need no changes.

Patterns that need conversion:

### jest.fn() → vi.fn()

```ts
// Before (Jest)
const mockFn = jest.fn((x: number) => x * 2)

// After (Vitest)
import { vi } from 'vitest'
const mockFn = vi.fn((x: number) => x * 2)
```

Verified in sandbox. `vi.fn()` behaves identically to `jest.fn()`:

```
✓ vi.fn() mocking > tracks calls with vi.fn() 2ms
```

### jest.mock() → vi.mock()

```ts
// Before (Jest)
jest.mock('./api-service')

// After (Vitest)
vi.mock('./api-service', () => ({
  fetchUser: vi.fn(),
  createUser: vi.fn(),
}))
```

Vitest applies hoisting to `vi.mock()`, just like Jest does.

### jest.requireActual() → vi.importActual()

This is the one that trips people up most. Partial mocking in Jest:

```ts
// Before (Jest)
jest.mock('./utils', () => ({
  ...jest.requireActual('./utils'),
  formatDate: jest.fn(),
}))

// After (Vitest) — note: async required
vi.mock('./utils', async () => ({
  ...(await vi.importActual('./utils')),
  formatDate: vi.fn(),
}))
```

`vi.importActual()` is **async**. Forget `await` and you get a Promise object spread into your mock instead of the real module's exports. This is the most common mistake when migrating partial mocks.

### jest.spyOn() → vi.spyOn()

```ts
const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
console.log('test')
expect(spy).toHaveBeenCalledWith('test')
spy.mockRestore()
```

### jest.clearAllMocks() → vi.clearAllMocks()

```ts
beforeEach(() => {
  vi.clearAllMocks()
})
```

## Step 4: New Matchers in Vitest 3–4

These don't exist in Jest. Once you've migrated, these are yours to use.

### toHaveBeenCalledExactlyOnceWith

Verifies a mock was called exactly once with specific arguments:

```ts
const fn = vi.fn()
fn('hello')

expect(fn).toHaveBeenCalledExactlyOnceWith('hello')  // ✓
fn('world')
expect(fn).toHaveBeenCalledExactlyOnceWith('hello')  // ✗ called twice
```

### toSatisfy

Custom predicate-based assertions. Useful for range checks and pattern matching:

```ts
expect(42).toSatisfy((n: number) => n > 0 && n < 100)
expect('vitest').toSatisfy((s: string) => s.startsWith('vi'))
```

### toBeOneOf

Check if a value is one of several options. Handy for environment variables and state machines:

```ts
const env = process.env.NODE_ENV
expect(env).toBeOneOf(['development', 'staging', 'production'])
```

All three verified passing in sandbox:

```
✓ toHaveBeenCalledExactlyOnceWith 0ms
✓ toSatisfy 0ms
✓ toBeOneOf 0ms
```

## Step 5: Filter Tests by Line Number

This Vitest 3+ feature has become one of my most-used day-to-day. Running one specific test without writing a pattern string:

```bash
npx vitest run "src/vitest4-features.test.ts:19"
```

Output:

```
↓ src/vitest4-features.test.ts:6  > tracks calls with vi.fn()     [skipped]
✓ src/vitest4-features.test.ts:19 > toHaveBeenCalledExactlyOnceWith  1ms
↓ src/vitest4-features.test.ts:28 > spies on console.log          [skipped]
...
Tests  1 passed | 7 skipped (8)
Duration  106ms
```

Only the test at line 19 ran. In VS Code with the Vitest extension, this means clicking a test in the gutter runs just that test. If you specify a line with no test, you get a clear error:

```
Error: No test found in src/vitest4-features.test.ts in line 32
```

## Step 6: Inline Workspace (Vitest 3+)

Previously you needed a separate `vitest.workspace.ts` file for monorepos. Now you can define it inline in `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config'

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

One fewer configuration file to manage.

## Step 7: Browser Mode (Stable in Vitest 4)

The headline feature of Vitest 4 is Browser Mode graduating from experimental to stable. You can test UI components in actual Chromium instead of JSDOM simulation.

```bash
npm install --save-dev @vitest/browser-playwright playwright
```

```ts
import { defineConfig } from 'vitest/config'

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

I didn't test Browser Mode myself in this article. That requires a different CI setup and is a bigger lift than a simple Node.js migration. But the stable status matters. It means combining Vitest with Playwright-based E2E testing is now a reasonable production strategy rather than an experiment.

## Step 8: CI Configuration

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
      - run: npm run test:coverage
```

No changes needed from your Jest CI config if you've updated the `npm test` script.

## Common Migration Pitfalls

**1. `describe is not defined` without globals: true**

Add `globals: true` to `test` in your Vitest config. This is the single change that lets most existing Jest code run without touching it.

**2. `vi.importActual()` returns a Promise when used synchronously**

```ts
// Wrong
vi.mock('./utils', () => ({
  ...vi.importActual('./utils'),  // Not awaited → spreads Promise, not module
}))

// Correct
vi.mock('./utils', async () => ({
  ...(await vi.importActual('./utils')),
}))
```

**3. `moduleNameMapper` replacement**

```ts
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: { globals: true },
})
```

**4. Delete `jest.config.ts` after migration**

Leaving it around can cause conflicts. Once you're fully migrated, remove it.

## Full Sandbox Run Results

```
 RUN  v4.1.7

 ✓ src/math.jest-style.test.ts  (6 tests)   → Jest-style code runs as-is
 ✓ src/api-service.test.ts      (2 tests)   → vi.mock() pattern
 ✓ src/vitest4-features.test.ts (8 tests)   → New matchers, vi.fn, vi.spyOn

 Test Files  3 passed (3)
      Tests  16 passed (16)
   Start at  15:26:44
   Duration  157ms (transform 67ms, setup 0ms, import 91ms, tests 15ms)
```

157 milliseconds for 16 tests. The transform time (67ms) is the Vite pipeline processing the TypeScript files on first run. Subsequent runs are faster due to caching.

## Should You Migrate?

My take: **yes for TypeScript projects, case-by-case for everything else.**

If you're using TypeScript with Vite, SvelteKit, Nuxt, or a modern frontend framework, staying on Jest is increasingly going against the grain. Configuration conflicts. ts-jest updates that break things. Cryptic transform errors. The time spent debugging those is better spent shipping.

For large Next.js or Express server test suites, be more careful. Vitest's Vite-first design can surface unexpected module resolution issues in complex server-side setups.

npm weekly downloads went from 4.8M to 7.7M. A lot of projects made the switch, but not all of them did it smoothly. Factor your project's complexity before committing.

Vitest 5.0 betas are already on npm. Once stable, expect another round of breaking changes. Migrating to 4.x now gives you a solid foundation before that wave hits. Right now I'm exploring how to pair Vitest with [Bun for TypeScript script automation](/en/blog/en/bun-shell-scripting-practical-guide-2026), running the test suite under Bun. That'll be a separate post.
