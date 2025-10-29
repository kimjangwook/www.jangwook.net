---
title: "Claude Codeで大規模ページテストを並列自動化する"
description: "Claude Code エージェントと Playwright で Web ページマイグレーションテストを 5-8 倍高速化する実践ガイド"
pubDate: '2025-10-31'
heroImage: ../../../assets/blog/claude-code-parallel-testing-hero.jpg
tags: ["claude-code", "testing", "playwright", "automation", "parallel-execution"]
---

## 概要

[前回の記事](/ja/blog/ja/llm-page-migration-standardization)では、LLM を活用した Web ページマイグレーションの全体戦略を紹介しました。今回は、<strong>Claude Code の並列実行機能を活用してテスト自動化を 5-8 倍高速化する実践的な実装方法</strong>を解説します。

50〜500 ページ以上の大規模マイグレーションプロジェクトで最大のボトルネックは<strong>テストフェーズ</strong>です。各ページに対して E2E、アクセシビリティ、パフォーマンス、SEO テストを順次実行すると数十時間かかります。

<strong>本記事の内容</strong>:
- Claude Code エージェントの並列実行パターン
- Playwright ベースのテスト自動生成
- 5 つのテストカテゴリーの同時実行
- CI/CD パイプライン統合
- 実践コード例とパフォーマンス比較

## 問題: 順次テストの限界

### 従来のテストワークフロー

多くのマイグレーションプロジェクトは、以下のように順次テストを実行します:

```
ページ 1 → Web Component テスト → E2E テスト → A11y テスト → パフォーマンステスト → SEO テスト
                                    ↓
ページ 2 → Web Component テスト → E2E テスト → A11y テスト → パフォーマンステスト → SEO テスト
```

<strong>時間計算</strong>:
- ページあたり平均テスト時間: 5 分
- 100 ページプロジェクト: <strong>500 分 (約 8.3 時間)</strong>
- 500 ページプロジェクト: <strong>2,500 分 (約 41.7 時間)</strong>

### 並列実行の必要性

Claude Code のエージェントシステムと Playwright の並列実行を組み合わせると:

```
                    ┌─ Web Component テスト (Agent 1)
                    ├─ E2E テスト (Agent 2)
全ページ ───────────┼─ A11y テスト (Agent 3)
                    ├─ パフォーマンステスト (Agent 4)
                    └─ SEO テスト (Agent 5)
```

<strong>改善された時間</strong>:
- 100 ページプロジェクト: <strong>60-100 分 (5-8 倍短縮)</strong>
- 500 ページプロジェクト: <strong>300-500 分 (5-8 倍短縮)</strong>

## Claude Code 並列実行アーキテクチャ

### 核心概念: Task Tool の並列呼び出し

Claude Code は<strong>単一メッセージで複数の Task tool を同時に呼び出す</strong>ことができます。これにより、互いに独立した作業を並列実行できます。

<strong>誤った方法 (順次実行)</strong>:

```typescript
// ❌ 各 Task を別々のメッセージで呼び出し (順次実行)
await claude.task({ agent: 'test-engineer', prompt: 'Generate component tests' });
await claude.task({ agent: 'test-engineer', prompt: 'Generate E2E tests' });
// 合計時間: T1 + T2 + T3
```

<strong>正しい方法 (並列実行)</strong>:

```typescript
// ✅ すべての Task を単一メッセージで呼び出し (並列実行)
await claude.message([
  { type: 'task', agent: 'test-engineer', prompt: 'Generate component tests' },
  { type: 'task', agent: 'test-engineer', prompt: 'Generate E2E tests' },
  { type: 'task', agent: 'web-accessibility-checker', prompt: 'Generate a11y tests' }
]);
// 合計時間: max(T1, T2, T3)
```

## ステップ 1: 環境設定

### 必須パッケージのインストール

```bash
# Playwright とテストツール
npm install --save-dev @playwright/test
npm install --save-dev @axe-core/playwright
npm install --save-dev playwright-lighthouse
npm install --save-dev web-vitals

# Playwright ブラウザのインストール
npx playwright install --with-deps
```

### Playwright 並列設定

`playwright.config.ts` を作成:

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',

  // ✅ 完全並列実行を有効化
  fullyParallel: true,

  // ✅ ワーカー数の設定
  workers: process.env.CI ? 4 : 8,

  // ✅ カテゴリー別プロジェクト定義
  projects: [
    {
      name: 'components',
      testMatch: /.*components.*\.spec\.ts/,
      timeout: 10000,
    },
    {
      name: 'e2e-chrome',
      testMatch: /.*e2e.*\.spec\.ts/,
      timeout: 60000,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'accessibility',
      testMatch: /.*accessibility.*\.spec\.ts/,
      timeout: 30000,
    },
    {
      name: 'performance',
      testMatch: /.*performance.*\.spec\.ts/,
      timeout: 120000,
    },
    {
      name: 'seo',
      testMatch: /.*seo.*\.spec\.ts/,
      timeout: 20000,
    },
  ],

  reporter: [
    ['html', { outputFolder: 'test-results/html' }],
    ['json', { outputFile: 'test-results/results.json' }],
  ],
});
```

## ステップ 2: テストコード例

### Web Component テスト

```typescript
import { test, expect } from '@playwright/test';

test.describe('Lit Component Tests', () => {
  test('should render with Shadow DOM', async () => {
    const el = await fixture(html`<my-counter></my-counter>`);
    const shadowRoot = el.shadowRoot;

    expect(shadowRoot).toBeTruthy();
    const button = shadowRoot.querySelector('button');
    expect(button).toBeTruthy();
  });
});
```

### E2E テスト

```typescript
import { test, expect } from '@playwright/test';

test.describe('Migration Workflow Tests', () => {
  test('should complete full migration', async ({ page }) => {
    await page.goto('http://localhost:4321/migration/start');

    // URL リストの準備
    await page.fill('[data-testid="url-input"]', 'https://example.com/page1');
    await page.click('[data-testid="submit-urls"]');

    // HTML 抽出の完了を待つ
    await page.waitForSelector('[data-testid="extraction-complete"]', { timeout: 60000 });

    // LLM 変換の実行
    await page.click('[data-testid="start-transformation"]');
    await page.waitForSelector('[data-testid="transformation-complete"]', { timeout: 180000 });

    // テストの実行
    await page.click('[data-testid="run-tests"]');
    await expect(page.locator('[data-testid="test-status"]')).toContainText('All tests passed');
  });
});
```

### アクセシビリティテスト

```typescript
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('WCAG Compliance Tests', () => {
  test('should have no violations', async ({ page }) => {
    await page.goto('http://localhost:4321');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    expect(results.violations).toEqual([]);
  });
});
```

## ステップ 3: 並列実行

### NPM スクリプト

`package.json` に追加:

```json
{
  "scripts": {
    "test": "playwright test",
    "test:parallel": "playwright test --workers=8",
    "test:components": "playwright test --project=components",
    "test:e2e": "playwright test --project=e2e-chrome",
    "test:a11y": "playwright test --project=accessibility",
    "test:report": "playwright show-report test-results/html"
  }
}
```

### 実行

```bash
# 8 ワーカーで並列実行
npm run test:parallel

# カテゴリー別実行
npm run test:e2e

# レポート表示
npm run test:report
```

## パフォーマンス比較

### 順次実行 vs 並列実行

<strong>テスト環境</strong>:
- 総ページ数: 100
- テストカテゴリー: 5 (Component, E2E, A11y, Performance, SEO)
- ページあたり平均テスト時間: 5 分

| プロジェクト規模 | 順次実行 | 並列実行 (8 workers) | 短縮時間 | 改善率 |
|----------------|---------|---------------------|---------|--------|
| 50 ページ | 20.8 時間 | 2.6 時間 | 18.2 時間 | 8.0 倍 |
| 100 ページ | 41.7 時間 | 5.2 時間 | 36.5 時間 | 8.0 倍 |
| 500 ページ | 208.3 時間 | 26.0 時間 | 182.3 時間 | 8.0 倍 |

## CI/CD 統合

### GitHub Actions ワークフロー

`.github/workflows/testing.yml`:

```yaml
name: Parallel Testing Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  run-tests:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        category: [components, e2e, accessibility, performance, seo]
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Run ${{ matrix.category }} tests
        run: npm run test:${{ matrix.category }}

      - name: Upload results
        uses: actions/upload-artifact@v4
        with:
          name: results-${{ matrix.category }}
          path: test-results/
```

## ベストプラクティス

### 1. テストの分離

```typescript
// ✅ 良い例: 各テストは独立
test('should render', async () => {
  const el = await fixture(html`<my-component></my-component>`);
  expect(el).toBeTruthy();
});
```

### 2. 適切なタイムアウト

```typescript
export default defineConfig({
  projects: [
    { name: 'components', timeout: 10000 },
    { name: 'e2e', timeout: 60000 },
    { name: 'performance', timeout: 120000 },
  ],
});
```

### 3. 失敗時の再試行

```typescript
export default defineConfig({
  retries: process.env.CI ? 2 : 0,
  use: {
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
});
```

## 結論

### 主要なポイント

1. <strong>Claude Code 並列実行</strong>: 単一メッセージで複数の Task tool を呼び出し、5 つのテストカテゴリーを同時に実行

2. <strong>Playwright 並列設定</strong>: `fullyParallel: true` と適切なワーカー数で 5-8 倍の性能向上

3. <strong>カテゴリー別分離</strong>: Component, E2E, A11y, Performance, SEO テストを独立実行

4. <strong>自動分析</strong>: Claude Code エージェントで結果分析と推奨事項を生成

5. <strong>CI/CD 統合</strong>: GitHub Actions で完全自動化されたテストパイプライン

### 実践ステップ

<strong>フェーズ 1 (1 日): 環境構築</strong>
- Playwright とテストツールのインストール
- playwright.config.ts の設定

<strong>フェーズ 2 (2-3 日): テスト生成</strong>
- Claude Code で 5 カテゴリーのテストを自動生成
- ローカルでの実行検証

<strong>フェーズ 3 (1-2 日): 並列実行最適化</strong>
- ワーカー数の調整
- タイムアウトチューニング

<strong>フェーズ 4 (1 日): CI/CD 統合</strong>
- GitHub Actions ワークフロー作成
- PR 自動コメント設定

## 参考資料

- [Playwright Documentation](https://playwright.dev)
- [Claude Code Documentation](https://docs.claude.com/claude-code)
- [前回の記事: LLM を活用した Web ページマイグレーション](/ja/blog/ja/llm-page-migration-standardization)
