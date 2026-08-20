# Claude Code カスタム設定

このディレクトリには、プロジェクト固有の Claude Code 設定が含まれています。

## 📁 ディレクトリ構造

```
.claude/
├── README.md                           # このファイル
├── commands/                           # スラッシュコマンド
│   └── test-page.md                   # /test-page コマンド
├── agents/                             # 専門エージェント
│   └── page-tester.md                 # ページテスターエージェント
└── skills/                             # 再利用可能なスキル
    └── page-test/                      # ページテストスキル
        ├── SKILL.md                    # スキル定義
        ├── implementation-rules.md     # 実装ルール
        └── quick-reference.md          # クイックリファレンス
```

## 🚀 主要機能

### 1. ページテストコマンド (`/test-page`)

ウェブページの品質を自動検証するコマンドです。

**使用方法**:
```bash
/test-page https://example.com
/test-page http://localhost:4321 --browsers chromium
/test-page URL --mobile-only
```

**検証項目**:
- ✅ クロスブラウザ互換性（Chromium, Firefox, WebKit）
- ✅ リンク整合性（全リンクのクロール検証）
- ✅ アクセシビリティ（WCAG 2.1 AA準拠）
- ✅ モバイルレスポンシブ（横スクロール、タッチターゲット）
- ⚠️ 画像最適化（サイズ、フォーマット、Alt属性）
- ⚠️ SEO（メタタグ、構造化データ、Lighthouse）
- ⚠️ パフォーマンス（Core Web Vitals）
- ℹ️ UI/UX品質（レイアウト、フォント）
- ℹ️ コンテンツ品質（可読性、メタデータ）

**出力**:
- コンソール出力（カラー、絵文字付き）
- HTML レポート（`./test-results/report-TIMESTAMP.html`）
- JSON レポート（`./test-results/report-TIMESTAMP.json`）

---

### 2. ページテスターエージェント (`page-tester`)

ページテストの実行と結果分析を担当する専門エージェントです。

**役割**:
1. テスト実行計画の策定
2. Chrome DevTools MCP を使用したブラウザ自動化
3. 結果の収集と分析
4. AI による改善提案の生成
5. 詳細レポートの作成

**ワークフロー**:
```
初期化 → 計画策定 → テスト実行 → 結果収集 → AI分析 → レポート生成
```

**使用ツール**:
- Chrome DevTools MCP（ブラウザ自動化）
- Bash（Lighthouse実行）
- Read/Write（設定・レポート）

---

### 3. ページテストスキル (`page-test`)

再利用可能なテスト機能を提供するスキルです。

**提供機能**:
- `testBrowser(url, browserType)`: ブラウザテスト
- `compareBrowsers(url)`: ブラウザ間比較
- `checkLinks(page)`: リンク検証
- `analyzeImages(page)`: 画像分析
- `runA11yAudit(page)`: アクセシビリティ監査
- `runLighthouse(url)`: Lighthouse実行
- `measureCoreWebVitals(page)`: Core Web Vitals測定

**ドキュメント**:
- `SKILL.md`: スキルの詳細仕様
- `implementation-rules.md`: 実装時のルールとガイドライン
- `quick-reference.md`: よくある問題と解決方法

---

## 📖 使い方

### クイックスタート

1. **基本テスト**:
   ```bash
   /test-page https://example.com
   ```

2. **結果確認**:
   ```bash
   # HTMLレポートを開く
   open ./test-results/report-TIMESTAMP.html
   ```

3. **問題修正**:
   - クイックリファレンスを参照: `.claude/skills/page-test/quick-reference.md`

### オプション

```bash
# Chromiumのみテスト（高速）
/test-page URL --browsers chromium

# モバイルのみ
/test-page URL --mobile-only

# アクセシビリティスキップ
/test-page URL --skip-a11y

# SEOスキップ
/test-page URL --skip-seo

# 詳細ログ
/test-page URL --verbose
```

---

## ⚙️ 設定

### 設定ファイル

プロジェクトルートに `.page-test.config.js` を作成することで、デフォルト設定を上書きできます。

```bash
# サンプル設定をコピー
cp .page-test.config.example.js .page-test.config.js
```

### 主要設定項目

```javascript
module.exports = {
  browsers: ['chromium', 'firefox', 'webkit'],
  viewports: [
    { width: 375, height: 667, name: 'iPhone SE' },
    { width: 1920, height: 1080, name: 'Desktop' }
  ],
  thresholds: {
    performance: 90,
    accessibility: 95,
    seo: 90
  },
  timeout: 30000,
  headless: true,
  outputDir: './test-results'
};
```

---

## 🔍 検証項目の詳細

### P0（必須）- リリース前に必ず通過

| 項目 | 時間 | 説明 |
|------|------|------|
| ブラウザ互換性 | 15秒 | Chrome, Firefox, Safariでの動作確認 |
| リンク整合性 | 20秒 | 全リンクの有効性チェック |
| アクセシビリティ | 10秒 | WCAG 2.1 AA準拠確認 |
| モバイル対応 | 10秒 | レスポンシブデザイン検証 |

### P1（推奨）- リリース前に対応推奨

| 項目 | 時間 | 説明 |
|------|------|------|
| 画像最適化 | 5秒 | サイズ、フォーマット、Alt属性 |
| SEO | 30秒 | メタタグ、構造化データ、Lighthouse |
| パフォーマンス | 30秒 | Core Web Vitals（LCP, FID, CLS） |

### P2（任意）- 時間があれば改善

| 項目 | 時間 | 説明 |
|------|------|------|
| UI/UX品質 | 5秒 | レイアウト、フォントサイズ |
| コンテンツ品質 | 5秒 | 可読性、メタデータ完成度 |

---

## 🐛 トラブルシューティング

### よくある問題

1. **画像が大きすぎる**
   ```bash
   convert image.jpg -resize 800x533 -quality 80 image.webp
   ```

2. **Alt属性なし**
   ```html
   <img src="/image.jpg" alt="説明">
   ```

3. **LCPが遅い**
   ```html
   <img src="/hero.webp" fetchpriority="high" alt="Hero">
   ```

4. **色コントラスト不足**
   ```css
   color: #666;  /* 4.5:1以上のコントラスト比 */
   ```

詳細は `quick-reference.md` を参照してください。

---

## 📊 レポート形式

### コンソール出力

```
🔍 ページテスト開始: https://example.com

[1/9] ✅ クロスブラウザテスト (3/3 通過)
[2/9] ✅ リンク整合性 (28/28 正常)
[3/9] ⚠️  画像最適化 (2件の問題発見)
...

📊 合計 9カテゴリ、7件通過、2件改善必要

💡 改善提案:
  1. 画像リサイズ: hero.jpgを800x533pxに変換
  2. LCP改善: fetchpriority="high" 属性追加

📄 詳細レポート: ./test-results/report-2025-11-21.html
```

### HTML レポート

- サマリーカード（総数、通過、警告、失敗）
- テスト結果一覧（モジュール別、ブラウザ別）
- 問題詳細（重要度別、位置情報付き）
- 改善提案（優先度別、コード例付き）
- スクリーンショット（ブラウザ別）

### JSON レポート

CI/CD統合用の構造化データ:
```json
{
  "url": "https://example.com",
  "timestamp": "2025-11-21T14:30:22.000Z",
  "duration": 245320,
  "summary": { "total": 9, "passed": 7, "warned": 2, "failed": 0 },
  "moduleResults": [...],
  "issues": [...],
  "recommendations": [...]
}
```

---

## 🔗 関連ドキュメント

### プロジェクト内

- [調査レポート](../)
  - `README.md`: プロジェクト概要
  - `02-architecture.md`: アーキテクチャ設計
  - `03-implementation-plan.md`: 実装計画
  - `QUICKSTART.md`: 5分で始めるガイド

### スキルドキュメント

- `SKILL.md`: 機能の詳細仕様
- `implementation-rules.md`: 実装時のルールとガイドライン
- `quick-reference.md`: よくある問題と解決方法

---

## 🎯 ベストプラクティス

### テストの実行順序

1. **開発中**: Chromiumのみで高速チェック
   ```bash
   /test-page http://localhost:4321 --browsers chromium
   ```

2. **PR前**: 全ブラウザでテスト
   ```bash
   /test-page http://localhost:4321
   ```

3. **リリース前**: 本番URLで全項目テスト
   ```bash
   /test-page https://production-url.com
   ```

### 問題の優先度

1. **Critical（緊急）**: すぐに修正
   - ページロード失敗、重大なa11y違反

2. **Major（重要）**: リリース前に修正
   - alt属性なし、色コントラスト不足、画像4倍以上

3. **Minor（軽微）**: 次回メンテナンスで対応
   - WebP未使用、画像2〜4倍大きい

---

## 📚 外部リソース

### ツール
- [Playwright Documentation](https://playwright.dev/)
- [Axe DevTools](https://www.deque.com/axe/devtools/)
- [Lighthouse](https://developer.chrome.com/docs/lighthouse/)
- [Google PageSpeed Insights](https://pagespeed.web.dev/)

### ガイドライン
- [WCAG 2.1 クイックリファレンス](https://www.w3.org/WAI/WCAG21/quickref/)
- [Core Web Vitals](https://web.dev/vitals/)
- [MDN Web Docs](https://developer.mozilla.org/)

---

## 💡 Tips

- 開発中は `--browsers chromium` で高速テスト
- 本番環境は必ず全ブラウザでテスト
- P0問題は即座に修正、P1問題はリリース前に対応
- HTMLレポートをチームで共有
- CI/CDパイプラインに組み込んで自動化

---

**Happy Testing! 🚀**
