# ページテストスキル

ページテストロジックをカプセル化した再利用可能なスキルです。

## 概要

このスキルは、ウェブページの品質検証に必要なすべての機能を提供します。`page-tester`エージェントや他のエージェントから呼び出して使用できます。

## 提供機能

### 1. ブラウザテスト

#### testBrowser(url, browserType)
特定のブラウザでページをロードし、基本的な検証を実行します。

**パラメータ**:
- `url` (string): テスト対象のURL
- `browserType` ('chromium' | 'firefox' | 'webkit'): ブラウザタイプ

**戻り値**:
```typescript
{
  status: 'passed' | 'warned' | 'failed',
  message: string,
  duration: number,
  data: {
    metrics: LayoutMetrics,
    consoleErrors: string[]
  },
  issues: Issue[]
}
```

**使用例**:
```typescript
const result = await testBrowser('https://example.com', 'chromium');
```

#### compareBrowsers(url)
複数のブラウザでスクリーンショットを撮影し、レンダリング差異を比較します。

**パラメータ**:
- `url` (string): テスト対象のURL

**戻り値**:
```typescript
{
  chromium: Screenshot,
  firefox: Screenshot,
  webkit: Screenshot,
  differences: BrowserDifference[]
}
```

---

### 2. リンク検証

#### checkLinks(page)
ページ内のすべてのリンクを検証します。

**パラメータ**:
- `page` (Page): Playwrightのページオブジェクト

**戻り値**:
```typescript
{
  total: number,
  passed: number,
  failed: number,
  links: {
    url: string,
    status: number,
    type: 'internal' | 'external',
    broken: boolean
  }[]
}
```

**使用例**:
```typescript
const linkResults = await checkLinks(page);
```

#### checkExternalLinks(page)
外部リンクのアクセス性を検査します（キャッシング機能付き）。

---

### 3. 画像分析

#### analyzeImages(page)
ページ内のすべての画像を分析し、最適化の問題を検出します。

**パラメータ**:
- `page` (Page): Playwrightのページオブジェクト

**戻り値**:
```typescript
{
  total: number,
  optimized: number,
  issues: {
    oversized: ImageIssue[],
    missingAlt: ImageIssue[],
    wrongFormat: ImageIssue[]
  }
}
```

**検証内容**:
- レンダリングサイズ vs ナチュラルサイズ（2倍以上で警告）
- WebP/AVIF フォーマット推奨
- Alt属性の有無
- 遅延ロード（loading="lazy"）の使用

**使用例**:
```typescript
const imageResults = await analyzeImages(page);
```

#### checkImageAlt(page)
Alt属性の検証のみを実行します。

---

### 4. アクセシビリティ検証

#### runA11yAudit(page)
Axe-core を使用してアクセシビリティ監査を実行します。

**パラメータ**:
- `page` (Page): Playwrightのページオブジェクト

**戻り値**:
```typescript
{
  violations: A11yViolation[],
  passes: number,
  incomplete: number,
  wcagLevel: 'A' | 'AA' | 'AAA',
  score: number
}
```

**検証基準**:
- WCAG 2.1 AA レベル準拠
- 色コントラスト比 4.5:1 以上
- ARIA属性の正確性
- キーボード操作可能性

**使用例**:
```typescript
const a11yResults = await runA11yAudit(page);
```

#### checkKeyboardNav(page)
キーボードナビゲーションをテストします。

---

### 5. パフォーマンス分析

#### runLighthouse(url)
Lighthouse監査を実行します。

**パラメータ**:
- `url` (string): テスト対象のURL

**戻り値**:
```typescript
{
  performance: number,
  accessibility: number,
  bestPractices: number,
  seo: number,
  pwa: number,
  metrics: {
    fcp: number,
    lcp: number,
    cls: number,
    fid: number,
    ttfb: number
  }
}
```

**使用例**:
```typescript
const lighthouseResults = await runLighthouse('https://example.com');
```

#### measureCoreWebVitals(page)
Core Web Vitals を測定します。

**戻り値**:
```typescript
{
  lcp: number,  // Largest Contentful Paint
  fid: number,  // First Input Delay
  cls: number,  // Cumulative Layout Shift
  fcp: number,  // First Contentful Paint
  ttfb: number  // Time to First Byte
}
```

---

### 6. UI/UX検証

#### checkResponsive(url, viewports)
複数のビューポートでレスポンシブデザインを検証します。

**パラメータ**:
- `url` (string): テスト対象のURL
- `viewports` (Viewport[]): テストするビューポートリスト

**戻り値**:
```typescript
{
  viewports: {
    name: string,
    width: number,
    height: number,
    hasHorizontalScroll: boolean,
    screenshot: string
  }[]
}
```

#### checkTouchTargets(page)
タッチターゲットのサイズを検証します（最小44x44px）。

---

### 7. コンテンツ検証

#### validateMetadata(page)
メタデータの完成度をチェックします。

**戻り値**:
```typescript
{
  title: boolean,
  description: boolean,
  ogTitle: boolean,
  ogDescription: boolean,
  ogImage: boolean,
  canonical: boolean,
  viewport: boolean,
  charset: boolean
}
```

#### checkStructuredData(page)
構造化データ（Schema.org）を検証します。

---

### 8. SEO検証

#### validateSEO(page)
SEO要素を総合的に検証します。

**戻り値**:
```typescript
{
  title: SEOCheck,
  meta: SEOCheck,
  headings: SEOCheck,
  images: SEOCheck,
  links: SEOCheck,
  structuredData: SEOCheck,
  score: number
}
```

---

## 使用例

### 基本的な使用方法

```typescript
import {
  testBrowser,
  checkLinks,
  analyzeImages,
  runA11yAudit,
  runLighthouse
} from '.claude/skills/page-test';

async function testPage(url: string) {
  // 1. ブラウザテスト
  console.log('ブラウザテストを実行中...');
  const browserResults = await testBrowser(url, 'chromium');

  // 2. リンク検証
  console.log('リンクを検証中...');
  const linkResults = await checkLinks(browserResults.page);

  // 3. 画像分析
  console.log('画像を分析中...');
  const imageResults = await analyzeImages(browserResults.page);

  // 4. アクセシビリティ検証
  console.log('アクセシビリティを検証中...');
  const a11yResults = await runA11yAudit(browserResults.page);

  // 5. Lighthouse実行
  console.log('Lighthouseを実行中...');
  const lighthouseResults = await runLighthouse(url);

  return {
    browser: browserResults,
    links: linkResults,
    images: imageResults,
    a11y: a11yResults,
    lighthouse: lighthouseResults
  };
}

// 実行
const results = await testPage('https://example.com');
console.log('テスト完了:', results);
```

### 複数ブラウザテスト

```typescript
import { testBrowser } from '.claude/skills/page-test';

async function testAllBrowsers(url: string) {
  const browsers = ['chromium', 'firefox', 'webkit'];
  const results = await Promise.all(
    browsers.map(browser => testBrowser(url, browser))
  );

  return {
    chromium: results[0],
    firefox: results[1],
    webkit: results[2]
  };
}
```

### カスタム検証ルール

```typescript
import { analyzeImages, runA11yAudit } from '.claude/skills/page-test';

async function customValidation(page: Page) {
  // 画像検証
  const images = await analyzeImages(page);
  const criticalImages = images.issues.oversized.filter(
    img => img.ratio > 4
  );

  // a11y検証
  const a11y = await runA11yAudit(page);
  const criticalA11y = a11y.violations.filter(
    v => v.impact === 'critical'
  );

  // カスタム判定
  if (criticalImages.length > 0 || criticalA11y.length > 0) {
    return {
      status: 'failed',
      message: '重大な問題が見つかりました',
      issues: [...criticalImages, ...criticalA11y]
    };
  }

  return {
    status: 'passed',
    message: 'すべての検証を通過しました'
  };
}
```

---

## データ型定義

### LayoutMetrics
```typescript
interface LayoutMetrics {
  documentHeight: number;
  bodyHeight: number;
  viewportHeight: number;
  viewportWidth: number;
}
```

### Issue
```typescript
interface Issue {
  type: string;
  severity: 'critical' | 'major' | 'minor';
  message: string;
  location?: string;
  expected?: any;
  actual?: any;
}
```

### ImageIssue
```typescript
interface ImageIssue {
  src: string;
  type: 'oversized' | 'missing-alt' | 'wrong-format';
  severity: 'critical' | 'major' | 'minor';
  message: string;
  ratio?: number;
  naturalSize?: { width: number, height: number };
  renderedSize?: { width: number, height: number };
}
```

### A11yViolation
```typescript
interface A11yViolation {
  id: string;
  impact: 'critical' | 'serious' | 'moderate' | 'minor';
  description: string;
  help: string;
  helpUrl: string;
  nodes: {
    html: string;
    target: string[];
  }[];
}
```

---

## 設定

### デフォルト設定

```javascript
// .page-test.config.js
module.exports = {
  browsers: ['chromium', 'firefox', 'webkit'],
  viewports: [
    { width: 375, height: 667, name: 'Mobile' },
    { width: 768, height: 1024, name: 'Tablet' },
    { width: 1920, height: 1080, name: 'Desktop' }
  ],
  thresholds: {
    performance: 90,
    accessibility: 95,
    seo: 90,
    imageRatio: 2
  },
  timeout: 30000,
  headless: true
};
```

---

## ベストプラクティス

### 1. エラーハンドリング

```typescript
try {
  const results = await testBrowser(url, 'chromium');
} catch (error) {
  console.error('テスト失敗:', error.message);
  // エラー回復処理
}
```

### 2. タイムアウト設定

```typescript
const results = await Promise.race([
  testBrowser(url, 'chromium'),
  new Promise((_, reject) =>
    setTimeout(() => reject(new Error('タイムアウト')), 30000)
  )
]);
```

### 3. リソース管理

```typescript
const browser = await chromium.launch();
const page = await browser.newPage();

try {
  // テスト実行
  await runTests(page);
} finally {
  // 必ずクリーンアップ
  await page.close();
  await browser.close();
}
```

---

## トラブルシューティング

### ブラウザ起動失敗

```bash
# Playwrightブラウザを再インストール
npx playwright install
```

### Lighthouse実行エラー

```bash
# Lighthouseをグローバルインストール
npm install -g lighthouse
```

### メモリ不足

```javascript
// 設定で同時ブラウザ数を制限
{
  maxConcurrentBrowsers: 2
}
```

---

## 参考資料

- [Playwright Documentation](https://playwright.dev/)
- [Axe-core Documentation](https://github.com/dequelabs/axe-core)
- [Lighthouse Documentation](https://developer.chrome.com/docs/lighthouse/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Core Web Vitals](https://web.dev/vitals/)
