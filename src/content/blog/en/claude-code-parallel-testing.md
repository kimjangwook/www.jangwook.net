---
title: "Automating Large-Scale Page Testing with Claude Code in Parallel"
description: "Practical guide to running web page migration tests 5-8x faster with Claude Code agents and Playwright parallel execution"
pubDate: '2025-10-31'
heroImage: ../../../assets/blog/claude-code-parallel-testing-hero.jpg
tags: ["claude-code", "testing", "playwright", "automation", "parallel-execution"]
---

## Overview

In the [previous article](/en/blog/en/llm-page-migration-standardization), we covered the overall strategy for LLM-powered web page migration. This article focuses on <strong>how to accelerate test automation by 5-8x using Claude Code's parallel execution capabilities</strong>.

For large-scale migration projects with 50-500+ pages, the biggest bottleneck is the <strong>testing phase</strong>. Running E2E, accessibility, performance, and SEO tests sequentially for each page can take dozens of hours.

<strong>What this article covers</strong>:
- Claude Code agent parallel execution patterns
- Playwright-based automatic test generation
- Concurrent execution of 5 test categories
- CI/CD pipeline integration
- Practical code examples and performance comparisons

## Problem: Sequential Testing Limitations

### Traditional Test Workflow

Most migration projects execute tests sequentially:

```
Page 1 → Web Component tests → E2E tests → A11y tests → Performance tests → SEO tests
                                  ↓
Page 2 → Web Component tests → E2E tests → A11y tests → Performance tests → SEO tests
```

<strong>Time calculation</strong>:
- Average test time per page: 5 minutes
- 100-page project: <strong>500 minutes (~8.3 hours)</strong>
- 500-page project: <strong>2,500 minutes (~41.7 hours)</strong>

### Need for Parallel Execution

Combining Claude Code's agent system with Playwright's parallel execution:

```
                    ┌─ Web Component tests (Agent 1)
                    ├─ E2E tests (Agent 2)
All pages ──────────┼─ A11y tests (Agent 3)
                    ├─ Performance tests (Agent 4)
                    └─ SEO tests (Agent 5)
```

<strong>Improved time</strong>:
- 100-page project: <strong>60-100 minutes (5-8x faster)</strong>
- 500-page project: <strong>300-500 minutes (5-8x faster)</strong>

## Claude Code Parallel Execution Architecture

### Core Concept: Parallel Task Tool Invocation

Claude Code can <strong>invoke multiple Task tools simultaneously in a single message</strong>. This enables parallel execution of independent tasks.

<strong>Wrong approach (sequential)</strong>:

```typescript
// ❌ Each Task called in separate messages (sequential)
await claude.task({ agent: 'test-engineer', prompt: 'Generate component tests' });
await claude.task({ agent: 'test-engineer', prompt: 'Generate E2E tests' });
// Total time: T1 + T2 + T3
```

<strong>Correct approach (parallel)</strong>:

```typescript
// ✅ All Tasks in single message (parallel)
await claude.message([
  { type: 'task', agent: 'test-engineer', prompt: 'Generate component tests' },
  { type: 'task', agent: 'test-engineer', prompt: 'Generate E2E tests' },
  { type: 'task', agent: 'web-accessibility-checker', prompt: 'Generate a11y tests' }
]);
// Total time: max(T1, T2, T3)
```

## Step 1: Environment Setup

### Install Required Packages

```bash
# Playwright and testing tools
npm install --save-dev @playwright/test
npm install --save-dev @axe-core/playwright
npm install --save-dev playwright-lighthouse
npm install --save-dev web-vitals

# Install Playwright browsers
npx playwright install --with-deps
```

### Playwright Parallel Configuration

Create `playwright.config.ts`:

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',

  // ✅ Enable full parallel execution
  fullyParallel: true,

  // ✅ Configure workers
  workers: process.env.CI ? 4 : 8,

  // ✅ Define projects by category
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

## Step 2: Test Code Examples

### Web Component Tests

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

### E2E Tests

```typescript
import { test, expect } from '@playwright/test';

test.describe('Migration Workflow Tests', () => {
  test('should complete full migration', async ({ page }) => {
    await page.goto('http://localhost:4321/migration/start');

    // Prepare URL list
    await page.fill('[data-testid="url-input"]', 'https://example.com/page1');
    await page.click('[data-testid="submit-urls"]');

    // Wait for HTML extraction
    await page.waitForSelector('[data-testid="extraction-complete"]', { timeout: 60000 });

    // Start LLM transformation
    await page.click('[data-testid="start-transformation"]');
    await page.waitForSelector('[data-testid="transformation-complete"]', { timeout: 180000 });

    // Run tests
    await page.click('[data-testid="run-tests"]');
    await expect(page.locator('[data-testid="test-status"]')).toContainText('All tests passed');
  });
});
```

### Accessibility Tests

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

## Step 3: Parallel Execution

### NPM Scripts

Add to `package.json`:

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

### Execute

```bash
# Run all tests with 8 workers
npm run test:parallel

# Run specific category
npm run test:e2e

# View report
npm run test:report
```

## Performance Comparison

### Sequential vs Parallel Execution

<strong>Test environment</strong>:
- Total pages: 100
- Test categories: 5 (Component, E2E, A11y, Performance, SEO)
- Average test time per page: 5 minutes

| Project Scale | Sequential | Parallel (8 workers) | Time Saved | Improvement |
|--------------|-----------|---------------------|------------|-------------|
| 50 pages | 20.8 hours | 2.6 hours | 18.2 hours | 8.0x |
| 100 pages | 41.7 hours | 5.2 hours | 36.5 hours | 8.0x |
| 500 pages | 208.3 hours | 26.0 hours | 182.3 hours | 8.0x |

## CI/CD Integration

### GitHub Actions Workflow

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

## Best Practices

### 1. Test Isolation

```typescript
// ✅ Good: Each test is independent
test('should render', async () => {
  const el = await fixture(html`<my-component></my-component>`);
  expect(el).toBeTruthy();
});
```

### 2. Appropriate Timeouts

```typescript
export default defineConfig({
  projects: [
    { name: 'components', timeout: 10000 },
    { name: 'e2e', timeout: 60000 },
    { name: 'performance', timeout: 120000 },
  ],
});
```

### 3. Retry on Failure

```typescript
export default defineConfig({
  retries: process.env.CI ? 2 : 0,
  use: {
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
});
```

## Conclusion

### Key Takeaways

1. <strong>Claude Code Parallel Execution</strong>: Invoke multiple Task tools in a single message to execute 5 test categories simultaneously

2. <strong>Playwright Parallel Configuration</strong>: 5-8x performance improvement with `fullyParallel: true` and optimal worker count

3. <strong>Category Isolation</strong>: Independent execution of Component, E2E, A11y, Performance, and SEO tests

4. <strong>Automated Analysis</strong>: Result analysis and recommendations generated by Claude Code agents

5. <strong>CI/CD Integration</strong>: Fully automated testing pipeline with GitHub Actions

### Implementation Steps

<strong>Phase 1 (1 day): Environment Setup</strong>
- Install Playwright and testing tools
- Configure playwright.config.ts

<strong>Phase 2 (2-3 days): Test Generation</strong>
- Auto-generate 5 category tests with Claude Code
- Validate locally

<strong>Phase 3 (1-2 days): Parallel Optimization</strong>
- Adjust worker count
- Tune timeouts

<strong>Phase 4 (1 day): CI/CD Integration</strong>
- Create GitHub Actions workflow
- Set up PR auto-comments

## References

- [Playwright Documentation](https://playwright.dev)
- [Claude Code Documentation](https://docs.claude.com/claude-code)
- [Previous article: LLM-Powered Web Page Migration](/en/blog/en/llm-page-migration-standardization)
