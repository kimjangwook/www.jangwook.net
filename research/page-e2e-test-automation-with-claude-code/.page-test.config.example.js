/**
 * ページテスト設定ファイル
 *
 * このファイルを .page-test.config.js にコピーして使用してください
 */

module.exports = {
  /**
   * テストするブラウザ
   * @type {('chromium' | 'firefox' | 'webkit')[]}
   */
  browsers: ['chromium', 'firefox', 'webkit'],

  /**
   * ビューポート設定
   * @type {{ width: number, height: number, name: string }[]}
   */
  viewports: [
    // モバイル
    { width: 375, height: 667, name: 'iPhone SE' },
    { width: 414, height: 896, name: 'iPhone 11 Pro Max' },
    { width: 360, height: 640, name: 'Android (Small)' },

    // タブレット
    { width: 768, height: 1024, name: 'iPad' },
    { width: 1024, height: 768, name: 'iPad Landscape' },

    // デスクトップ
    { width: 1280, height: 720, name: 'Desktop (HD)' },
    { width: 1920, height: 1080, name: 'Desktop (Full HD)' },
    { width: 2560, height: 1440, name: 'Desktop (2K)' }
  ],

  /**
   * 品質閾値
   * @type {{ performance: number, accessibility: number, seo: number, imageRatio: number }}
   */
  thresholds: {
    // Lighthouse スコア（0〜100）
    performance: 90,
    accessibility: 95,
    seo: 90,

    // 画像サイズ比率（レンダリング vs ナチュラル）
    imageRatio: 2
  },

  /**
   * スキップするテスト
   * @type {string[]}
   */
  skipTests: [
    // 例: 'accessibility', 'seo', 'image-optimization'
  ],

  /**
   * カスタムモジュール
   * @type {any[]}
   */
  customModules: [
    // 例: require('./custom-modules/security-check')
  ],

  /**
   * タイムアウト設定（ミリ秒）
   * @type {number}
   */
  timeout: 30000,

  /**
   * ヘッドレスモード
   * @type {boolean}
   */
  headless: true,

  /**
   * 出力ディレクトリ（プロジェクトルートからの相対パス）
   * @type {string}
   */
  outputDir: './working_history/reports',

  /**
   * リポーター設定
   * @type {{ console: boolean, html: boolean, json: boolean, notion: boolean, slack: boolean }}
   */
  reporters: {
    console: true,  // コンソール出力
    html: true,     // HTMLレポート
    json: true,     // JSONレポート
    notion: false,  // Notion統合（要設定）
    slack: false    // Slack統合（要設定）
  },

  /**
   * Notion統合設定（オプション）
   * @type {{ apiKey?: string, databaseId?: string }}
   */
  notion: {
    apiKey: process.env.NOTION_API_KEY,
    databaseId: process.env.NOTION_DATABASE_ID
  },

  /**
   * Slack統合設定（オプション）
   * @type {{ webhookUrl?: string }}
   */
  slack: {
    webhookUrl: process.env.SLACK_WEBHOOK_URL
  },

  /**
   * キャッシュ設定
   * @type {{ enabled: boolean, ttl: number }}
   */
  cache: {
    enabled: true,
    ttl: 3600000  // 1時間（ミリ秒）
  },

  /**
   * 同時実行数制限
   * @type {number}
   */
  maxConcurrentBrowsers: 3,

  /**
   * リトライ設定
   * @type {{ attempts: number, delay: number }}
   */
  retry: {
    attempts: 2,  // 失敗時のリトライ回数
    delay: 1000   // リトライ間隔（ミリ秒）
  },

  /**
   * スクリーンショット設定
   * @type {{ format: 'png' | 'jpeg' | 'webp', quality: number, fullPage: boolean }}
   */
  screenshot: {
    format: 'webp',
    quality: 80,
    fullPage: false
  },

  /**
   * 詳細ログ
   * @type {boolean}
   */
  verbose: false,

  /**
   * カスタムルール
   * @type {{ name: string, check: Function, severity: 'critical' | 'major' | 'minor' }[]}
   */
  customRules: [
    // 例: カスタム検証ルール
    // {
    //   name: 'custom-font-size',
    //   check: (page) => {
    //     // カスタム検証ロジック
    //     return { passed: true, issues: [] };
    //   },
    //   severity: 'minor'
    // }
  ]
};
