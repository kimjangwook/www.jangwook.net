# ページテスト クイックリファレンス

このドキュメントは、ページテストを素早く実行するためのチートシートです。

## 🚀 基本コマンド

```bash
# 基本テスト（全ブラウザ、全項目）
/test-page https://example.com

# Chromiumのみ（高速）
/test-page https://example.com --browsers chromium

# モバイルのみ
/test-page https://example.com --mobile-only

# アクセシビリティスキップ
/test-page https://example.com --skip-a11y

# SEOスキップ
/test-page https://example.com --skip-seo

# 詳細ログ
/test-page https://example.com --verbose

# ローカル開発サーバー
/test-page http://localhost:4321
```

---

## 📋 検証項目チェックリスト

| アイコン | 項目 | 優先度 | 時間 | 説明 |
|---------|------|--------|------|------|
| ✅ | ブラウザ互換性 | P0 | 15秒 | Chrome, Firefox, Safari |
| ✅ | リンク整合性 | P0 | 20秒 | 全リンク検証 |
| ✅ | アクセシビリティ | P0 | 10秒 | WCAG 2.1 AA |
| ✅ | モバイル対応 | P0 | 10秒 | レスポンシブ確認 |
| ⚠️ | 画像最適化 | P1 | 5秒 | サイズ、フォーマット |
| ⚠️ | SEO | P1 | 30秒 | メタタグ、Lighthouse |
| ⚠️ | パフォーマンス | P1 | 30秒 | Core Web Vitals |
| ℹ️ | UI/UX | P2 | 5秒 | レイアウト、フォント |
| ℹ️ | コンテンツ | P2 | 5秒 | 可読性、メタデータ |

---

## 🔍 よくある問題と解決方法

### 1. 画像が大きすぎる

**問題**:
```
⚠️  hero.jpg: 元画像が4倍大きいです（2400x1600 → 600x400）
```

**解決**:
```bash
# ImageMagickで画像をリサイズ
convert hero.jpg -resize 800x533 hero-optimized.jpg

# WebP形式に変換
convert hero.jpg -resize 800x533 -quality 80 hero.webp

# 一括変換
for img in *.jpg; do
  convert "$img" -resize 50% -quality 80 "${img%.jpg}.webp"
done
```

**HTML修正**:
```html
<!-- Before -->
<img src="/images/hero.jpg" alt="Hero Image">

<!-- After -->
<img src="/images/hero.webp" alt="Hero Image" width="600" height="400" loading="lazy">
```

---

### 2. Alt属性がない

**問題**:
```
⚠️  3個の画像にalt属性がありません
```

**解決**:
```html
<!-- Before -->
<img src="/image.jpg">

<!-- After -->
<img src="/image.jpg" alt="商品の写真">
```

**装飾画像の場合**:
```html
<img src="/decoration.svg" alt="" role="presentation">
```

---

### 3. LCPが遅い

**問題**:
```
⚠️  LCP: 2.8s（推奨: 2.5s以下）
```

**解決**:
```html
<!-- ヒーロー画像に優先度を付与 -->
<img src="/hero.webp" fetchpriority="high" alt="Hero">

<!-- フォントのプリロード -->
<link rel="preload" href="/fonts/main.woff2" as="font" type="font/woff2" crossorigin>

<!-- 重要なCSSをインライン化 -->
<style>
  /* Above-the-fold critical CSS */
  .hero { ... }
</style>
```

---

### 4. 色コントラスト不足

**問題**:
```
❌ 色コントラスト不足: 3.2:1（最小: 4.5:1）
```

**解決**:
```css
/* Before */
.text {
  color: #999;
  background: #fff;
}

/* After */
.text {
  color: #666;  /* コントラスト比 5.7:1 */
  background: #fff;
}
```

**チェックツール**:
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- Chrome DevTools: Inspect > Accessibility

---

### 5. リンク切れ

**問題**:
```
❌ リンク切れ: /old-page/ (404 Not Found)
```

**解決**:
```html
<!-- Before -->
<a href="/old-page/">古いページ</a>

<!-- After -->
<a href="/new-page/">新しいページ</a>
```

**リダイレクト設定**:
```nginx
# nginx
location /old-page/ {
  return 301 /new-page/;
}
```

---

### 6. メタタグ不足

**問題**:
```
⚠️  og:imageが設定されていません
```

**解決**:
```html
<head>
  <!-- 基本メタタグ -->
  <title>ページタイトル</title>
  <meta name="description" content="ページの説明">

  <!-- Open Graph -->
  <meta property="og:title" content="ページタイトル">
  <meta property="og:description" content="ページの説明">
  <meta property="og:image" content="https://example.com/og-image.jpg">
  <meta property="og:url" content="https://example.com/page/">
  <meta property="og:type" content="website">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="ページタイトル">
  <meta name="twitter:description" content="ページの説明">
  <meta name="twitter:image" content="https://example.com/og-image.jpg">
</head>
```

---

### 7. モバイルで横スクロール

**問題**:
```
❌ モバイルで横スクロールが発生しています
```

**解決**:
```css
/* すべての要素にボックスサイジングを適用 */
*, *::before, *::after {
  box-sizing: border-box;
}

/* はみ出し要素を特定 */
* {
  outline: 1px solid red; /* デバッグ用 */
}

/* 幅を制限 */
img, video, iframe {
  max-width: 100%;
  height: auto;
}

/* テーブルをスクロール可能に */
.table-wrapper {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
```

---

## 🎯 優先度別の対応方針

### Critical（緊急）- 即座に修正

- ❌ ページロード失敗（404, 500）
- ❌ 重大なa11y違反（キーボード操作不可等）
- ❌ セキュリティ脆弱性

**対応**: すぐに修正し、再テスト

---

### Major（重要）- リリース前に修正

- ⚠️ alt属性なし
- ⚠️ 色コントラスト不足
- ⚠️ 画像4倍以上大きい
- ⚠️ LCP 3秒以上

**対応**: リリース前に必ず修正

---

### Minor（軽微）- 時間があれば改善

- ℹ️ WebP未使用
- ℹ️ 画像2〜4倍大きい
- ℹ️ メタディスクリプション長い

**対応**: 次回のメンテナンスで対応

---

## 📊 パフォーマンス指標

### Core Web Vitals

| 指標 | 良好 | 改善必要 | 悪い |
|------|------|----------|------|
| LCP | < 2.5s | 2.5s - 4.0s | > 4.0s |
| FID | < 100ms | 100ms - 300ms | > 300ms |
| CLS | < 0.1 | 0.1 - 0.25 | > 0.25 |

### Lighthouse スコア

| カテゴリ | 良好 | 改善必要 | 悪い |
|----------|------|----------|------|
| Performance | 90+ | 50-89 | < 50 |
| Accessibility | 90+ | 50-89 | < 50 |
| Best Practices | 90+ | 50-89 | < 50 |
| SEO | 90+ | 50-89 | < 50 |

---

## 🛠️ デバッグコマンド

### スクリーンショット比較

```bash
# ブラウザ別スクリーンショットを確認
open ./test-results/screenshots/chromium-desktop.webp
open ./test-results/screenshots/firefox-desktop.webp
open ./test-results/screenshots/webkit-desktop.webp
```

### レポート確認

```bash
# HTMLレポートを開く
open ./test-results/report-TIMESTAMP.html

# JSONレポートを確認
cat ./test-results/report-TIMESTAMP.json | jq '.issues'
```

### 特定の問題を抽出

```bash
# Criticalな問題のみ表示
cat ./test-results/report-TIMESTAMP.json | jq '.issues[] | select(.severity == "critical")'

# 画像関連の問題のみ表示
cat ./test-results/report-TIMESTAMP.json | jq '.issues[] | select(.type | contains("image"))'
```

---

## 🔧 設定ファイル

### .page-test.config.js

```javascript
module.exports = {
  // テストするブラウザ
  browsers: ['chromium', 'firefox', 'webkit'],

  // ビューポート
  viewports: [
    { width: 375, height: 667, name: 'iPhone SE' },
    { width: 414, height: 896, name: 'iPhone 11 Pro Max' },
    { width: 768, height: 1024, name: 'iPad' },
    { width: 1920, height: 1080, name: 'Desktop HD' }
  ],

  // 閾値
  thresholds: {
    performance: 90,
    accessibility: 95,
    seo: 90,
    imageRatio: 2  // 画像サイズ比率の閾値
  },

  // スキップするテスト
  skipTests: [],

  // タイムアウト（ミリ秒）
  timeout: 30000,

  // ヘッドレスモード
  headless: true,

  // 出力ディレクトリ
  outputDir: './test-results'
};
```

---

## 📚 参考リンク

### ツール

- [Playwright](https://playwright.dev/)
- [Axe DevTools](https://www.deque.com/axe/devtools/)
- [Lighthouse](https://developer.chrome.com/docs/lighthouse/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Google PageSpeed Insights](https://pagespeed.web.dev/)

### ガイドライン

- [WCAG 2.1 クイックリファレンス](https://www.w3.org/WAI/WCAG21/quickref/)
- [Core Web Vitals](https://web.dev/vitals/)
- [HTML Living Standard](https://html.spec.whatwg.org/)
- [MDN Web Docs](https://developer.mozilla.org/)

---

## 💡 Tips

### 効率的なテスト実行

```bash
# まずChromiumのみで高速チェック
/test-page URL --browsers chromium

# 問題なければ全ブラウザでテスト
/test-page URL

# 本番環境は必ず全ブラウザでテスト
/test-page https://production-url.com
```

### 段階的な改善

1. **P0問題**: すぐに修正（ブラウザ互換性、リンク切れ、a11y）
2. **P1問題**: リリース前に修正（画像最適化、SEO）
3. **P2問題**: 次回メンテナンスで対応（コンテンツ品質）

### CI/CDで自動テスト

```yaml
# .github/workflows/test.yml
name: Page Test
on: [pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm install
      - run: /test-page http://localhost:3000
```

---

## 🎓 よくある質問

**Q: テストにどれくらい時間がかかりますか？**
A: 全項目で約2〜3分です。Chromiumのみなら1分以内です。

**Q: ローカル開発サーバーをテストできますか？**
A: はい、`/test-page http://localhost:PORT` で可能です。

**Q: 特定の項目だけテストできますか？**
A: はい、`--skip-a11y`、`--skip-seo`等のオプションを使用できます。

**Q: カスタムルールを追加できますか？**
A: はい、`.page-test.config.js`でカスタムモジュールを登録できます。

**Q: レポートをチームで共有できますか？**
A: はい、HTMLレポートやJSONレポートを共有できます。Notion/Slack統合も可能です。

---

**Happy Testing! 🚀**
