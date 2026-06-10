---
title: JestからVitest 4への完全移行ガイド — インストールから実践テストまで
description: >-
  Vitest 4.1.7ベースでJestプロジェクトをステップごとに移行する実践ガイド。インストールから設定切り替え・コード変換パターン・安定Browser
  Mode・新マッチャー(toSatisfy, toBeOneOf)まで、実際のサンドボックスで検証した全結果をまとめた決定版の完全移行ガイド。
pubDate: '2026-05-26'
heroImage: ../../../assets/blog/vitest-4-jest-migration-guide-2026-hero.png
tags:
  - Vitest
  - Jest
  - TypeScript
relatedPosts:
  - slug: adsense-low-value-content-technical-fix
    score: 0.92
    reason:
      ko: '다음 단계 학습으로 적합하며, 웹 개발, DevOps 주제에서 연결됩니다.'
      ja: 次のステップの学習に適しており、Web開発、DevOpsのトピックで繋がります。
      en: >-
        Suitable as a next-step learning resource, connecting through web
        development, DevOps topics.
      zh: 适合作为下一步学习资源，通过Web开发、DevOps主题进行连接。
  - slug: bun-shell-scripting-practical-guide-2026
    score: 0.91
    reason:
      ko: '웹 개발, DevOps 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: Web開発、DevOps分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in web development, DevOps with comparable
        difficulty.
      zh: 在Web开发、DevOps领域涵盖类似主题，难度相当。
  - slug: astro-scheduled-publishing
    score: 0.89
    reason:
      ko: '다음 단계 학습으로 적합하며, 웹 개발, DevOps 주제에서 연결됩니다.'
      ja: 次のステップの学習に適しており、Web開発、DevOpsのトピックで繋がります。
      en: >-
        Suitable as a next-step learning resource, connecting through web
        development, DevOps topics.
      zh: 适合作为下一步学习资源，通过Web开发、DevOps主题进行连接。
  - slug: chrome-devtools-mcp-performance
    score: 0.89
    reason:
      ko: '다음 단계 학습으로 적합하며, 웹 개발, DevOps 주제에서 연결됩니다.'
      ja: 次のステップの学習に適しており、Web開発、DevOpsのトピックで繋がります。
      en: >-
        Suitable as a next-step learning resource, connecting through web
        development, DevOps topics.
      zh: 适合作为下一步学习资源，通过Web开发、DevOps主题进行连接。
  - slug: weekly-analytics-2025-10-14
    score: 0.88
    reason:
      ko: 자동화 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.
      ja: 自動化分野で類似したトピックを扱い、同程度の難易度です。
      en: Covers similar topics in automation with comparable difficulty.
      zh: 在自动化领域涵盖类似主题，难度相当。
---

先月からサイドプロジェクトのテストパイプラインを整備していて、長年使ってきたJestをVitestに乗り換えた。理由はシンプルだ。TypeScriptプロジェクトでJestを維持しようとすると、`ts-jest`や`babel-jest`のような変換レイヤーが必要になる。設定項目が増えるにつれ、エラーメッセージが暗号のように読めなくなってくる。

VitestはViteと同じ変換パイプラインを使うため、TypeScriptを別設定なしでそのまま理解する。さらにVitest 4でBrowser Modeがstableに格上げされ、以前はjest-dom + JSDOMの組み合わせで模倣していたDOMテストを実際のChromiumで実行できるようになった。

この記事は、実際にサンドボックスで`vitest@4.1.7`をインストールして16個のテストをパスさせた結果をもとに書いた。設定ファイルを一つ一つ説明するのではなく、「Jestから来た人が詰まるポイント」を中心にまとめた。

## VitestがJestより優れている点 — 正直に言うと

「Vitestが3〜8倍速い」というベンチマーク数値をよく見かける。直接計測はしていないが、速度より自分が実感したのは**設定の複雑さの違い**だ。

JestでTypeScriptを使うには通常こんなパッケージが必要になる。

```bash
npm install --save-dev jest @types/jest ts-jest @jest/globals
```

`jest.config.ts`にも記述が必要だ:

```ts
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
}
```

Vitestは:

```bash
npm install --save-dev vitest
```

これだけだ。

ただし、正直なところも言っておく。**VitestはNode.jsエコシステム全体をサポートするのではなく、Viteエコシステムに最適化されている。** Next.jsやExpressのようなサーバー中心のフレームワークでJestを使っていた場合、プロジェクト規模によっては移行コストが思ったより大きくなる可能性がある。

## 前提条件

- Node.js 18以上(22推奨)
- 既存のJestプロジェクト(Jest 27〜30すべて対象)
- TypeScript使用プロジェクトを前提に説明(JSプロジェクトも同じ流れ)

確認:

```bash
node --version  # v22.22.0
npm --version   # 10.9.4
```

## Step 1: Vitest 4のインストール

既存のJest依存関係を先に削除する。

```bash
npm uninstall jest @types/jest ts-jest babel-jest @jest/globals jest-environment-jsdom
```

Vitest 4のインストール:

```bash
npm install --save-dev vitest@4
```

UIダッシュボードが必要な場合:

```bash
npm install --save-dev @vitest/ui
```

インストール確認:

```bash
npx vitest --version
# vitest/4.1.7 darwin-arm64 node-v22.22.0
```

52パッケージが8秒でインストールされた。Jest + ts-jestの組み合わせと比べると、パッケージ数が半分以下だ。

## Step 2: vitest.config.tsの作成

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,          // describe/test/expectをimportなしで使用(Jest互換)
    environment: 'node',    // 'jsdom' | 'happy-dom' | 'browser'から選択可能
    include: ['**/*.{test,spec}.{ts,js}'],
    reporters: ['verbose'],
    coverage: {
      provider: 'v8',       // Jest: 'babel'の代わりにv8ベース
      include: ['src/**'],
      exclude: ['**/*.test.ts'],
    },
  },
})
```

**`globals: true`が重要だ。** このオプションをオンにすると、既存のJestコードから`import { describe, test, expect } from '@jest/globals'`の行を削除しなくても動作する。移行初期にコードを一度に変えなくてもよいということだ。

`package.json`にスクリプトを追加:

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

## Step 3: Jest → Vitest コード変換パターン

ほとんどのテストコードは**そのまま動く。** `globals: true`を設定したため、`describe`、`test`、`expect`、`beforeEach`、`afterEach`は変換不要だ。

変換が必要なパターン:

### jest.fn() → vi.fn()

```ts
// Before (Jest)
const mockFn = jest.fn((x: number) => x * 2)

// After (Vitest)
import { vi } from 'vitest'
const mockFn = vi.fn((x: number) => x * 2)
```

実際にサンドボックスで検証した結果、`vi.fn()`の動作は`jest.fn()`と同一だった。

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

Vitestでは`vi.mock()`にホイスティングが適用される。Jestと同様にファイルの先頭で動作する。

### jest.requireActual() → vi.importActual()

これが最も混乱するポイントだ。一部だけモックするJestのパターン:

```ts
// Before (Jest)
jest.mock('./utils', () => ({
  ...jest.requireActual('./utils'),
  formatDate: jest.fn(),
}))

// After (Vitest)
vi.mock('./utils', async () => ({
  ...(await vi.importActual('./utils')),
  formatDate: vi.fn(),
}))
```

`vi.importActual()`は**非同期**だ。`async/await`を忘れるとエラーになる。最初にここで詰まる人が多い。

### vi.spyOn()

```ts
const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
console.log('test')
expect(spy).toHaveBeenCalledWith('test')
spy.mockRestore()
```

## Step 4: Vitest 3〜4で追加された新しいマッチャー

### toHaveBeenCalledExactlyOnceWith

```ts
const fn = vi.fn()
fn('hello')
expect(fn).toHaveBeenCalledExactlyOnceWith('hello')
```

### toSatisfy

```ts
expect(42).toSatisfy((n: number) => n > 0 && n < 100)
expect('vitest').toSatisfy((s: string) => s.startsWith('vi'))
```

### toBeOneOf

```ts
const env = process.env.NODE_ENV
expect(env).toBeOneOf(['development', 'staging', 'production'])
```

サンドボックスでの検証結果:

```
✓ toHaveBeenCalledExactlyOnceWith 0ms
✓ toSatisfy 0ms
✓ toBeOneOf 0ms
```

## Step 5: 行番号で特定テストのみ実行

Vitest 3で追加されたが、最もよく使う機能が**行番号フィルタリング**だ。

```bash
npx vitest run "src/vitest4-features.test.ts:19"
```

実行結果:

```
↓ src/vitest4-features.test.ts:6  > tracks calls with vi.fn()     [skipped]
✓ src/vitest4-features.test.ts:19 > toHaveBeenCalledExactlyOnceWith  1ms
...
Tests  1 passed | 7 skipped (8)
Duration  106ms
```

19行目のテスト1つだけが実行され、残りはskipされた。IDE上で「この行に移動して実行」が実現できる。

## Step 6: Inline Workspace (Vitest 3+)

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

## Step 7: CI設定 (GitHub Actions)

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

## 移行でよく詰まるポイント

**1. `globals: true`なしで`describe is not defined`エラー**

`vitest.config.ts`に`globals: true`を入れないと、既存のJestコードで`describe`、`test`、`expect`が見つからないエラーが発生する。

**2. `vi.importActual()`を同期で使うと空オブジェクトを返す**

```ts
// 誤った例
vi.mock('./utils', () => ({
  ...vi.importActual('./utils'),  // asyncじゃない → Promiseオブジェクトが入る
}))

// 正しい例
vi.mock('./utils', async () => ({
  ...(await vi.importActual('./utils')),
}))
```

**3. `moduleNameMapper`の置き換え**

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config'
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

## サンドボックス検証結果

```
 RUN  v4.1.7

 ✓ src/math.jest-style.test.ts  (6 tests)   → Jestスタイルのコードをそのまま実行
 ✓ src/api-service.test.ts      (2 tests)   → vi.mock()パターン
 ✓ src/vitest4-features.test.ts (8 tests)   → 新マッチャー、vi.fn、vi.spyOn

 Test Files  3 passed (3)
      Tests  16 passed (16)
   Duration  157ms
```

## 結論: 移行する価値はあるか

私の判断は**TypeScriptプロジェクトならYES、そうでなければケースバイケース**だ。

UIダッシュボードよりも、[Claude Codeを使った大規模テストの並列自動化](/ja/blog/ja/claude-code-parallel-testing)と組み合わせることで、さらなるパフォーマンス向上が期待できる。

TypeScriptを使うViteベースのプロジェクトでJestを維持するのは、徐々に逆方向になってきている。変換レイヤーの設定、tsconfig競合、モジュール解決エラー — これらの問題をデバッグし続ける時間が勿体ない。

一方、Next.jsやExpressベースの大規模サーバーテストスイートなら慎重に判断すべきだ。

[BunでTypeScriptスクリプトを自動化する](/ja/blog/ja/bun-shell-scripting-practical-guide-2026)方法と組み合わせて、VitestをBunで実行する構成も試している。それについては次の記事で触れる予定だ。

VitestはすでにVite、Vitest、Rollup、oxcなどを擁するVoidZeroエコシステムの中核に位置している。npm週次ダウンロード数が4.8Mから7.7Mに増加した事実がその勢いを物語っている。今は4.xで移行しておくのが無難な選択だろう。
