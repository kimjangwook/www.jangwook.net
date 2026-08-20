# テストモジュール実装ルール

このドキュメントは、ページテストを実装する際の詳細なルールとガイドラインを定義します。

## 基本原則

### 1. 一貫性
- すべてのテストは同じインターフェースに従う
- 結果フォーマットは統一する
- エラーハンドリングは標準化する

### 2. 独立性
- 各テストモジュールは独立して実行可能
- 他のモジュールに依存しない
- 状態を共有しない

### 3. 再現性
- 同じ入力に対して同じ結果を返す
- 外部要因（時刻、ランダム値等）に依存しない
- キャッシング戦略を明確にする

### 4. パフォーマンス
- 不必要なリソース消費を避ける
- タイムアウトを適切に設定
- 並列実行を考慮した設計

---

## Chrome DevTools MCP の使用ルール

### ページナビゲーション

```typescript
// ✅ 良い例
const page = await navigatePage({
  type: 'url',
  url: targetUrl,
  timeout: 30000
});

// ❌ 悪い例（タイムアウト未設定）
const page = await navigatePage({
  type: 'url',
  url: targetUrl
});
```

### スナップショット取得

```typescript
// ✅ 良い例（ファイルパス指定でトークン節約）
await takeSnapshot({
  filePath: './test-results/snapshots/page-snapshot.txt'
});

// ❌ 悪い例（インラインで大量データ受信）
const snapshot = await takeSnapshot({});
```

### スクリーンショット撮影

```typescript
// ✅ 良い例（WebP形式で圧縮）
await takeScreenshot({
  filePath: './test-results/screenshots/chromium-desktop.webp',
  format: 'webp',
  quality: 80,
  fullPage: false
});

// ❌ 悪い例（PNG形式、フルページ）
await takeScreenshot({
  format: 'png',
  fullPage: true
});
```

### JavaScript実行

```typescript
// ✅ 良い例（シリアライズ可能な値を返す）
const metrics = await evaluateScript({
  function: `() => {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
      scrollHeight: document.documentElement.scrollHeight
    };
  }`
});

// ❌ 悪い例（DOM要素を直接返す）
const element = await evaluateScript({
  function: `() => document.querySelector('.header')`
});
```

---

## テストモジュールインターフェース

### 必須プロパティ

```typescript
interface TestModule {
  // モジュール名（一意、小文字、ハイフン区切り）
  name: string;

  // 説明（日本語、簡潔に）
  description: string;

  // 優先度（10〜100、低いほど優先）
  priority: number;

  // モバイル対応フラグ
  supportsMobile: boolean;

  // メインテスト関数
  run(url: string, browser: BrowserType): Promise<TestResult>;
}
```

### 実装例

```typescript
export class ImageOptimizationModule implements TestModule {
  name = 'image-optimization';
  description = '画像最適化検証';
  priority = 60;
  supportsMobile = true;

  async run(url: string, browser: BrowserType): Promise<TestResult> {
    const startTime = Date.now();

    try {
      // Chrome DevTools MCPを使用
      await navigatePage({
        type: 'url',
        url: url,
        timeout: 30000
      });

      // スナップショット取得
      await takeSnapshot({
        filePath: './test-results/snapshots/page-structure.txt'
      });

      // 画像情報を取得
      const images = await evaluateScript({
        function: `() => {
          return Array.from(document.querySelectorAll('img')).map(img => ({
            src: img.src,
            alt: img.alt,
            naturalWidth: img.naturalWidth,
            naturalHeight: img.naturalHeight,
            width: img.width,
            height: img.height,
            loading: img.loading
          }));
        }`
      });

      // 問題検出
      const issues = this.analyzeImages(images);

      return {
        status: issues.length === 0 ? 'passed' : 'warned',
        message: `${images.length}個の画像を検査、${issues.length}件の問題発見`,
        duration: Date.now() - startTime,
        data: { images },
        issues
      };
    } catch (error) {
      return {
        status: 'failed',
        message: `画像最適化テスト失敗: ${error.message}`,
        duration: Date.now() - startTime,
        issues: [{
          type: 'test-error',
          severity: 'critical',
          message: error.message,
          location: url
        }]
      };
    }
  }

  private analyzeImages(images: any[]): Issue[] {
    const issues: Issue[] = [];

    for (const img of images) {
      // Alt属性チェック
      if (!img.alt) {
        issues.push({
          type: 'missing-alt',
          severity: 'major',
          message: `画像にalt属性がありません`,
          location: img.src
        });
      }

      // サイズチェック
      const widthRatio = img.naturalWidth / img.width;
      const heightRatio = img.naturalHeight / img.height;
      const maxRatio = Math.max(widthRatio, heightRatio);

      if (maxRatio > 2) {
        issues.push({
          type: 'oversized-image',
          severity: maxRatio > 4 ? 'major' : 'minor',
          message: `元画像が${Math.round(maxRatio)}倍大きいです`,
          location: img.src,
          expected: `${img.width}x${img.height}`,
          actual: `${img.naturalWidth}x${img.naturalHeight}`
        });
      }

      // フォーマットチェック
      const format = img.src.split('.').pop()?.split('?')[0];
      if (!['webp', 'avif'].includes(format || '')) {
        issues.push({
          type: 'format-optimization',
          severity: 'minor',
          message: 'WebPまたはAVIFフォーマットの使用を推奨します',
          location: img.src,
          actual: format
        });
      }
    }

    return issues;
  }
}
```

---

## 結果フォーマット

### TestResult 構造

```typescript
interface TestResult {
  // ステータス（必須）
  status: 'passed' | 'warned' | 'failed';

  // メッセージ（必須、簡潔に）
  message: string;

  // 実行時間（ミリ秒、オプション）
  duration?: number;

  // 詳細データ（オプション、必要最小限）
  data?: any;

  // 問題リスト（オプション）
  issues?: Issue[];
}
```

### Issue 構造

```typescript
interface Issue {
  // 問題タイプ（必須、ケバブケース）
  type: string;

  // 重要度（必須）
  severity: 'critical' | 'major' | 'minor';

  // 説明（必須、日本語）
  message: string;

  // 場所（オプション、URL、セレクター等）
  location?: string;

  // 期待値（オプション）
  expected?: any;

  // 実際の値（オプション）
  actual?: any;
}
```

---

## 問題の重要度分類

### Critical（緊急）
- ページが正常に動作しない
- ユーザー体験に深刻な影響
- 法的問題の可能性（アクセシビリティ等）

**例**:
- ページロード失敗（404, 500エラー）
- 重大なアクセシビリティ違反
- セキュリティ脆弱性

### Major（重要）
- ユーザー体験に明確な影響
- ベストプラクティス違反
- パフォーマンス問題

**例**:
- 画像のalt属性なし
- LCPが3秒以上
- 色コントラスト不足
- 画像が4倍以上大きい

### Minor（軽微）
- 最適化の余地あり
- 推奨事項
- 将来的な改善

**例**:
- WebP/AVIFフォーマット未使用
- 画像が2〜4倍大きい
- メタディスクリプションが長い

---

## エラーハンドリング

### パターン1: try-catch

```typescript
async run(url: string, browser: BrowserType): Promise<TestResult> {
  const startTime = Date.now();

  try {
    // テスト実行
    const result = await this.executeTest(url);

    return {
      status: 'passed',
      message: 'テスト成功',
      duration: Date.now() - startTime,
      data: result
    };
  } catch (error) {
    // エラー時も結果を返す
    return {
      status: 'failed',
      message: `テスト失敗: ${error.message}`,
      duration: Date.now() - startTime,
      issues: [{
        type: 'test-error',
        severity: 'critical',
        message: error.message,
        location: url
      }]
    };
  }
}
```

### パターン2: タイムアウト

```typescript
async runWithTimeout(url: string, timeout: number = 30000): Promise<TestResult> {
  const timeoutPromise = new Promise<TestResult>((_, reject) =>
    setTimeout(() => reject(new Error('タイムアウト')), timeout)
  );

  const testPromise = this.run(url, 'chromium');

  try {
    return await Promise.race([testPromise, timeoutPromise]);
  } catch (error) {
    return {
      status: 'failed',
      message: `タイムアウト: ${timeout}ms`,
      issues: [{
        type: 'timeout',
        severity: 'major',
        message: `テストが${timeout}msでタイムアウトしました`,
        location: url
      }]
    };
  }
}
```

---

## リソース管理

### ブラウザインスタンス

```typescript
// ❌ 悪い例（リソースリークの可能性）
async run(url: string, browser: BrowserType) {
  await navigatePage({ type: 'url', url });
  // ページを閉じない
}

// ✅ 良い例（適切なクリーンアップ）
async run(url: string, browser: BrowserType) {
  try {
    await navigatePage({ type: 'url', url });
    // テスト実行
  } finally {
    // Chrome DevTools MCPは自動でクリーンアップ
    // 追加のリソースがあればここで解放
  }
}
```

### メモリ使用

```typescript
// ✅ 良い例（大きなデータはファイルに保存）
await takeSnapshot({
  filePath: './test-results/snapshots/page.txt'
});

// ❌ 悪い例（メモリに大きなデータを保持）
const snapshot = await takeSnapshot({});
const data = snapshot.data; // 大量のデータ
```

---

## パフォーマンス最適化

### 1. 並列実行

```typescript
// ✅ 良い例（独立したテストは並列実行）
async runAll(url: string) {
  const results = await Promise.all([
    this.checkImages(url),
    this.checkLinks(url),
    this.checkA11y(url)
  ]);

  return results;
}
```

### 2. キャッシング

```typescript
// 外部リンクチェックのキャッシュ
private linkCache = new Map<string, { status: number, timestamp: number }>();

async checkExternalLink(url: string): Promise<number> {
  const cached = this.linkCache.get(url);

  // 1時間以内のキャッシュを使用
  if (cached && Date.now() - cached.timestamp < 3600000) {
    return cached.status;
  }

  // 新規チェック
  const status = await fetchStatus(url);
  this.linkCache.set(url, { status, timestamp: Date.now() });
  return status;
}
```

### 3. 最小限のDOM操作

```typescript
// ✅ 良い例（1回のevaluateで全データ取得）
const data = await evaluateScript({
  function: `() => {
    return {
      images: Array.from(document.querySelectorAll('img')).map(img => ({
        src: img.src,
        alt: img.alt,
        width: img.width,
        height: img.height
      })),
      links: Array.from(document.querySelectorAll('a')).map(a => ({
        href: a.href,
        text: a.textContent
      }))
    };
  }`
});

// ❌ 悪い例（複数回のevaluate）
const images = await evaluateScript({ function: '() => document.querySelectorAll("img")' });
const links = await evaluateScript({ function: '() => document.querySelectorAll("a")' });
```

---

## テストデータの取り扱い

### スクリーンショット

```typescript
// ファイル名規則: {browser}-{viewport}-{timestamp}.webp
const filename = `${browser}-${viewport.name}-${Date.now()}.webp`;
const filepath = `./test-results/screenshots/${filename}`;

await takeScreenshot({
  filePath: filepath,
  format: 'webp',
  quality: 80,
  fullPage: false
});
```

### レポートデータ

```typescript
// JSON形式で保存、タイムスタンプ付き
const reportData = {
  url,
  timestamp: new Date().toISOString(),
  results: testResults
};

const reportPath = `./test-results/report-${Date.now()}.json`;
await fs.writeFile(reportPath, JSON.stringify(reportData, null, 2));
```

---

## テストの優先順位

| 優先度 | モジュール | 実行時間 | 説明 |
|--------|-----------|----------|------|
| 10 | browser-compatibility | 15秒 | ブラウザ互換性 |
| 20 | link-integrity | 20秒 | リンク検証 |
| 30 | accessibility | 10秒 | アクセシビリティ |
| 40 | mobile-responsive | 10秒 | モバイル対応 |
| 50 | ui-quality | 5秒 | UI品質 |
| 60 | image-optimization | 5秒 | 画像最適化 |
| 70 | seo | 30秒 | SEO検証 |
| 80 | content-quality | 5秒 | コンテンツ品質 |
| 90 | interaction | 5秒 | インタラクション |

---

## ベストプラクティス

### DO（推奨）

- ✅ Chrome DevTools MCPを積極的に使用
- ✅ 結果はファイルに保存してトークン節約
- ✅ タイムアウトを適切に設定
- ✅ エラーハンドリングを必ず実装
- ✅ 重要度を適切に分類
- ✅ 日本語で明確なメッセージを返す
- ✅ リソースを適切に管理
- ✅ キャッシングを活用
- ✅ 並列実行を考慮

### DON'T（非推奨）

- ❌ 大きなデータをメモリに保持
- ❌ タイムアウトなしの無限待機
- ❌ エラーを無視してスロー
- ❌ 曖昧なエラーメッセージ
- ❌ 不必要なDOM操作の繰り返し
- ❌ ブラウザインスタンスのリーク
- ❌ 外部サービスへの過度な依存
- ❌ 同期的な重い処理

---

## デバッグ

### ログ出力

```typescript
// verbose モード時のみ詳細ログ
if (this.options.verbose) {
  console.log(`[${this.name}] テスト開始: ${url}`);
  console.log(`[${this.name}] ブラウザ: ${browser}`);
}
```

### スクリーンショット保存

```typescript
// エラー時にスクリーンショット保存
catch (error) {
  await takeScreenshot({
    filePath: `./test-results/errors/${this.name}-error-${Date.now()}.webp`
  });

  throw error;
}
```

---

## 日本語レポート生成ルール

### 必須要件

すべてのテスト実行後、**必ず**日本語マークダウンレポートを生成すること。

### ファイル仕様

```typescript
// ファイルパス（相対パス - 絶対パスは使用しない）
const reportPath = `working_history/reports/page-test-${timestamp}.md`;
// 例: working_history/reports/page-test-20251121-143022.md

// タイムスタンプフォーマット
const timestamp = new Date()
  .toISOString()
  .replace(/[-:]/g, '')
  .replace('T', '-')
  .split('.')[0]
  .slice(0, 15); // YYYYMMDD-HHMMSS
```

### レポート構造

```markdown
# ページ品質テストレポート

**テスト対象**: http://example.com
**実行日時**: 2025-11-21 14:30:22
**ブラウザ**: Chromium
**総合評価**: ⚠️ 条件付き合格

---

## 📊 テスト結果サマリー

| カテゴリー | ステータス | スコア | 問題数 |
|-----------|----------|--------|-------|
| クロスブラウザ互換性 | ✅ 合格 | 95/100 | 1 |
| リンク整合性 | ⚠️ 警告 | 60/100 | 57 |
| アクセシビリティ | ❌ 不合格 | 45/100 | 6 |
...

**総合スコア**: 67.5/100
**P0問題**: 6件（即座に修正が必要）
**P1問題**: 6件（できるだけ早く修正）
**P2問題**: 6件（改善推奨）

---

## 🚨 P0 - 緊急対応が必要な問題

### 1. H1見出しが存在しない

**重要度**: P0 - CRITICAL
**影響**: スクリーンリーダーがページ内容を理解できない

**修正方法**:
\`\`\`html
<!-- ページのメイン見出しを追加 -->
<h1 class="visually-hidden">住友生命保険公式ホームページ</h1>
\`\`\`

**参考**: WCAG 2.1 Guideline 2.4.6

---

### 2. 画像36件にalt属性がない

**重要度**: P0 - CRITICAL
**影響**: 視覚障害者が画像内容を理解できない

**対象画像**:
- `/images/top/sec02img01.webp`
- `/images/top/sec03img01.webp`
...

**修正方法**:
\`\`\`html
<!-- コンテンツ画像の例 -->
<img src="sec02img01.webp" alt="ご契約者さま向けサポートサービスの説明" loading="lazy">

<!-- 装飾画像の例 -->
<img src="bgShape01.webp" alt="" loading="auto">
\`\`\`

---

## ⚠️ P1 - 高優先度の問題

...（同様の構造で続く）

---

## ℹ️ P2 - 改善推奨事項

...（同様の構造で続く）

---

## 📈 詳細統計

### クロスブラウザ互換性
- テスト対象: Chromium
- レンダリングエラー: 0件
- コンソールエラー: 1件（Google Fontsロード失敗）

### リンク整合性
- 総リンク数: 87
  - 内部リンク: 85
  - 外部リンク: 2
- ダミーリンク: 57件
- セキュリティ問題: 12件（rel="noopener"不足）

...

---

## ✅ 良好な点

1. モバイルレスポンシブデザインが適切に機能
2. WebP画像フォーマットを使用（最適化済み）
3. Lazy loading が実装されている
4. BEM命名規則に従ったクリーンなHTML構造

---

## 🔧 次のアクションアイテム

### 即座に実行（本日中）
- [ ] H1見出しを追加
- [ ] 全画像にalt属性を追加
- [ ] ナビゲーションランドマークを追加
- [ ] SEOタイトルを30-60文字に拡張
- [ ] プレースホルダー変数（$xxx$）を実際のコンテンツに置換
- [ ] ダミーリンクを実際のURLに更新

### 1週間以内
- [ ] タッチターゲットサイズを44px以上に拡大
- [ ] 外部リンクにrel="noopener noreferrer"を追加
- [ ] JavaScriptにasync/defer属性を追加
- [ ] 壊れた画像（vitality.webp）を修正

### 改善提案
- [ ] パンくずナビゲーションを追加
- [ ] Schema.org構造化データを実装
- [ ] OG画像を追加
- [ ] 過大な画像を最適化

---

## 📎 添付ファイル

- スクリーンショット（デスクトップ）: `./test-results/screenshots/chromium-desktop-1732177822000.webp`
- スクリーンショット（モバイル）: `./test-results/screenshots/chromium-mobile-1732177822000.webp`
- 詳細ログ: `./test-results/logs/page-test-20251121-143022.log`

---

**レポート生成**: 2025-11-21 14:30:22
**実行時間**: 245.32秒
**テストツール**: Claude Code Page Testing Suite v1.0
```

### レポート生成コード例

```typescript
async function generateJapaneseReport(
  url: string,
  testResults: TestResults,
  options: ReportOptions
): Promise<string> {
  const timestamp = new Date()
    .toISOString()
    .replace(/[-:]/g, '')
    .replace('T', '-')
    .split('.')[0]
    .slice(0, 15);

  // 相対パスを使用（絶対パスは使わない）
  const reportPath = `working_history/reports/page-test-${timestamp}.md`;

  // レポート内容を構築
  const content = buildReportContent(url, testResults);

  // ファイルに保存（相対パスでディレクトリ作成）
  await fs.mkdir('working_history/reports', { recursive: true });
  await fs.writeFile(reportPath, content, 'utf-8');

  return reportPath;
}

function buildReportContent(url: string, results: TestResults): string {
  const sections = [
    buildHeader(url, results),
    buildSummaryTable(results),
    buildP0Issues(results),
    buildP1Issues(results),
    buildP2Issues(results),
    buildDetailedStats(results),
    buildPositivePoints(results),
    buildActionItems(results),
    buildFooter(results)
  ];

  return sections.join('\n\n---\n\n');
}
```

### ベストプラクティス

#### DO（推奨）
- ✅ **必ずレポートファイルを生成**
- ✅ 優先度別に問題を整理（P0 → P1 → P2）
- ✅ 具体的なコード例を含める
- ✅ 修正の影響範囲を明記
- ✅ 統計データを視覚的に表示（表、リスト）
- ✅ 次のアクションを明確にする
- ✅ 良好な点も記載してバランスを保つ

#### DON'T（非推奨）
- ❌ レポート生成をスキップしない
- ❌ 英語でレポートを書かない
- ❌ 問題の説明が曖昧
- ❌ 修正方法を記載しない
- ❌ 優先度を付けない
- ❌ ネガティブな点のみ羅列

---

## まとめ

- **一貫性**: 統一されたインターフェースを使用
- **独立性**: 他のモジュールに依存しない
- **効率性**: リソースを適切に管理
- **明確性**: 日本語で分かりやすいメッセージ
- **堅牢性**: エラーハンドリングを徹底
- **ドキュメント化**: 必ず日本語レポートを生成
