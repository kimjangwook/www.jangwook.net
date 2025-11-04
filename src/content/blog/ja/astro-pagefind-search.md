---
title: Astroブログに Pagefind検索機能を実装する方法
description: astro-pagefindを使用して静的サイトに高速で軽量なクライアントサイド検索を実装する完全ガイド
pubDate: '2025-11-07'
heroImage: ../../../assets/blog/astro-pagefind-search-hero.jpg
tags:
  - astro
  - pagefind
  - search
  - static-site
  - performance
relatedPosts:
  - slug: chrome-devtools-mcp-performance
    score: 0.83
    reason:
      ko: '다음 단계 학습으로 적합하며, 웹 개발 주제에서 연결됩니다.'
      ja: 次のステップの学習に適しており、Web開発のトピックで繋がります。
      en: >-
        Suitable as a next-step learning resource, connecting through web
        development topics.
  - slug: claude-code-web-automation
    score: 0.82
    reason:
      ko: '다음 단계 학습으로 적합하며, 웹 개발 주제에서 연결됩니다.'
      ja: 次のステップの学習に適しており、Web開発のトピックで繋がります。
      en: >-
        Suitable as a next-step learning resource, connecting through web
        development topics.
  - slug: astro-scheduled-publishing
    score: 0.81
    reason:
      ko: '다음 단계 학습으로 적합하며, 웹 개발 주제에서 연결됩니다.'
      ja: 次のステップの学習に適しており、Web開発のトピックで繋がります。
      en: >-
        Suitable as a next-step learning resource, connecting through web
        development topics.
  - slug: weekly-analytics-2025-10-14
    score: 0.8
    reason:
      ko: 자동화 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.
      ja: 自動化分野で類似したトピックを扱い、同程度の難易度です。
      en: Covers similar topics in automation with comparable difficulty.
  - slug: playwright-ai-testing
    score: 0.8
    reason:
      ko: '다음 단계 학습으로 적합하며, 웹 개발 주제에서 연결됩니다.'
      ja: 次のステップの学習に適しており、Web開発のトピックで繋がります。
      en: >-
        Suitable as a next-step learning resource, connecting through web
        development topics.
---

## 概要

静的サイトジェネレーター(SSG)でブログを運営すると、速度とセキュリティの面で多くの利点がありますが、大きな課題が一つあります。それは<strong>検索機能</strong>です。従来の検索ソリューションはサーバーや外部サービスを必要としますが、これは静的サイトのシンプルさを損ないます。

<strong>Pagefind</strong>は、この問題を解決する革新的なライブラリです。ビルド時に静的インデックスを生成し、クライアント側で即座に検索を実行し、最小限の帯域幅のみを使用します。Astroユーザーなら、<strong>astro-pagefind</strong>統合を通じてさらに簡単に実装できます。

## Pagefindとは

[Pagefind](https://pagefind.app/)は、CloudCannonが開発したRustベースの静的検索ライブラリです。主な特徴は：

- <strong>静的インデックス</strong>: ビルド時に検索インデックスを生成
- <strong>低帯域幅</strong>: 初期ロード時に最小限のJavaScriptのみダウンロード
- <strong>段階的ロード</strong>: 検索時に必要なデータのみリクエスト
- <strong>サーバー不要</strong>: 完全なクライアントサイド検索
- <strong>多言語サポート</strong>: 複数言語のコンテンツインデックス可能
- <strong>カスタマイズ</strong>: UIと検索動作の完全制御

CloudCannonのブログによると、<strong>MDN全体を300KB未満で検索</strong>できるほど効率的です。

## astro-pagefindのインストールと設定

### 1. パッケージのインストール

まず、必要なパッケージをインストールします：

```bash
npm install astro-pagefind
```

### 2. Astro設定ファイルの修正

`astro.config.ts`または`astro.config.mjs`に統合を追加します：

```typescript
// astro.config.ts
import { defineConfig } from "astro/config";
import pagefind from "astro-pagefind";

export default defineConfig({
  build: {
    format: "file", // 重要: 各ページを個別のHTMLファイルとして生成
  },
  integrations: [pagefind()],
});
```

<strong>重要</strong>: `build.format: "file"`設定が必須です。このオプションがないと、Pagefindがページを正しくインデックスできない可能性があります。

### 3. 検索コンポーネントの追加

検索機能を表示したいページにコンポーネントを追加します：

```astro
---
// src/components/Search.astro または直接ページに追加
import Search from "astro-pagefind/components/Search";
---

<Search
  id="search"
  className="pagefind-ui"
  uiOptions={{
    showImages: false,
    excerptLength: 15,
    resetStyles: false,
  }}
/>
```

## UIオプションのカスタマイズ

Pagefind UIは様々な設定オプションを提供します：

### 基本オプション

```typescript
{
  // 検索ボックス設定
  showImages: false,        // 検索結果に画像を表示するか
  showSubResults: false,    // サブ結果を表示
  excerptLength: 30,        // 抜粋の単語数

  // パフォーマンス設定
  debounceTimeoutMs: 300,   // 検索遅延時間（ミリ秒）

  // UIカスタマイズ
  resetStyles: true,        // デフォルトスタイルのリセット

  // 多言語設定
  translations: {
    placeholder: "検索キーワードを入力...",
    zero_results: "[SEARCH_TERM]の検索結果が見つかりませんでした"
  }
}
```

### CSSカスタマイズ

Pagefind UIは、CSSカスタムプロパティ(CSS Variables)を使用してスタイルを調整できます：

```css
:root {
  --pagefind-ui-scale: 1;
  --pagefind-ui-primary: #034ad8;
  --pagefind-ui-text: #393939;
  --pagefind-ui-background: #ffffff;
  --pagefind-ui-border: #eeeeee;
  --pagefind-ui-border-width: 1px;
  --pagefind-ui-border-radius: 8px;
  --pagefind-ui-image-border-radius: 4px;
  --pagefind-ui-font: inherit;
}
```

## 多言語サポート

Pagefindは標準で多言語サイトをサポートします。言語ごとに異なるインデックスを生成するには：

### 1. 言語別ページ構造

```
src/content/
├── blog/
│   ├── ko/
│   │   └── post-1.md
│   ├── en/
│   │   └── post-1.md
│   └── ja/
│       └── post-1.md
```

### 2. ページに言語フィルターメタタグを追加

各ページの`<head>`セクションに言語フィルターを追加して、Pagefindが言語別に検索結果をフィルタリングできるようにします:

```astro
<!-- src/layouts/BlogPost.astro -->
<html lang={lang}>
  <head>
    <!-- 他のメタタグ... -->
    <meta name="pagefind-filter-lang" content={lang} />
  </head>
</html>
```

この設定により、検索UIで以下の言語フィルターを使用できます:
- `lang: ko` (韓国語)
- `lang: en` (英語)
- `lang: ja` (日本語)

### 3. Pagefind設定（オプション）

```yaml
# pagefind.yml（オプション）
site: dist
glob: "**/*.html"

# 言語別インデックス
languages:
  - code: ko
    path: /ko/
  - code: en
    path: /en/
  - code: ja
    path: /ja/
```

## パフォーマンスと利点

### 1. 静的インデックス

Pagefindはビルド時に全てのコンテンツをインデックスするため：

- <strong>ランタイムオーバーヘッドなし</strong>: 検索インデックスが事前生成される
- <strong>高速な初期ロード</strong>: 約20KBのコアJavaScriptのみロード
- <strong>CDNフレンドリー</strong>: 全てのファイルが静的なのでCDNキャッシング可能

### 2. 段階的ロード

```javascript
// Pagefindの段階的ロード方式
// 1. 初期ロード: 20KB（コア検索ロジック）
// 2. 検索開始: 関連するインデックスチャンクのみダウンロード
// 3. 結果表示: 必要なコンテンツのみ取得
```

これにより：

- <strong>初期ページロード速度の向上</strong>
- <strong>帯域幅の節約</strong>: 実際に検索する時のみデータ転送
- <strong>スケーラビリティ</strong>: 数千ページでも高速検索

### 3. デバウンス検索

Pagefindは標準で300msのデバウンスを適用して：

- 不要な検索リクエストを防止
- タイピング中のスムーズなユーザー体験
- リソース効率的な動作

## 実践例

### 完全な検索ページの実装

```astro
---
// src/pages/search.astro
import Layout from '../layouts/Layout.astro';
import Search from 'astro-pagefind/components/Search';
---

<Layout title="検索 - マイブログ">
  <main class="container mx-auto px-4 py-8">
    <h1 class="text-4xl font-bold mb-8">ブログ検索</h1>

    <Search
      id="search"
      className="pagefind-ui"
      uiOptions={{
        showImages: true,
        excerptLength: 20,
        debounceTimeoutMs: 300,
        translations: {
          placeholder: "検索キーワードを入力...",
          clear_search: "クリア",
          load_more: "さらに表示",
          zero_results: "[SEARCH_TERM]の検索結果が見つかりませんでした"
        }
      }}
    />
  </main>
</Layout>

<style>
  /* Pagefind UIのカスタマイズ */
  :global(.pagefind-ui) {
    --pagefind-ui-primary: #ff5d01;
    --pagefind-ui-border-radius: 12px;
    --pagefind-ui-font: 'Noto Sans JP', sans-serif;
  }

  :global(.pagefind-ui__search-input) {
    padding: 1rem;
    font-size: 1.125rem;
    border: 2px solid var(--pagefind-ui-border);
    transition: border-color 0.2s;
  }

  :global(.pagefind-ui__search-input:focus) {
    border-color: var(--pagefind-ui-primary);
    outline: none;
    box-shadow: 0 0 0 3px rgba(255, 93, 1, 0.1);
  }
</style>
```

### ナビゲーションに検索モーダルを追加

```astro
---
// src/components/Header.astro
---

<header>
  <nav>
    <!-- その他のナビゲーション項目 -->
    <button id="search-toggle" class="search-button">
      🔍 検索
    </button>
  </nav>
</header>

<!-- 検索モーダル -->
<div id="search-modal" class="modal hidden">
  <div class="modal-content">
    <button id="close-modal" class="close-button">✕</button>
    <Search
      id="search"
      className="pagefind-ui"
      uiOptions={{ showImages: false, excerptLength: 15 }}
    />
  </div>
</div>

<script>
  // モーダルトグルロジック
  const modal = document.getElementById('search-modal');
  const toggleBtn = document.getElementById('search-toggle');
  const closeBtn = document.getElementById('close-modal');

  toggleBtn?.addEventListener('click', () => {
    modal?.classList.remove('hidden');
  });

  closeBtn?.addEventListener('click', () => {
    modal?.classList.add('hidden');
  });

  // ESCキーで閉じる
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      modal?.classList.add('hidden');
    }
  });
</script>

<style>
  .modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .modal.hidden {
    display: none;
  }

  .modal-content {
    background: white;
    border-radius: 16px;
    padding: 2rem;
    max-width: 600px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
    position: relative;
  }

  .close-button {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #666;
  }

  .close-button:hover {
    color: #000;
  }
</style>
```

## ビルドと開発ワークフロー

### ビルドスクリプト

astro-pagefind統合を使用すると、ビルドプロセスが自動化されます：

```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro check && astro build",
    "preview": "astro preview"
  }
}
```

Pagefindインデックスは`astro build`実行時に自動生成されます。

### 開発モードで検索をテスト

開発中に検索機能をテストするには：

1. まず本番ビルドを実行: `npm run build`
2. プレビューサーバーを実行: `npm run preview`
3. 検索機能を確認

<strong>注意</strong>: 開発モード(`npm run dev`)では、Pagefindインデックスが生成されないため、検索は機能しません。

## 高度な使用法

### 特定のコンテンツのみインデックス

HTMLデータ属性を使用してインデックス動作を制御できます：

```astro
<!-- この領域のみインデックス -->
<article data-pagefind-body>
  <h1>記事タイトル</h1>
  <p>インデックスされるコンテンツ...</p>

  <!-- この部分は除外 -->
  <div data-pagefind-ignore>
    広告や関連のないコンテンツ
  </div>
</article>

<!-- この領域はインデックスされない -->
<footer>
  フッターコンテンツ
</footer>
```

### メタデータフィルタリング

検索結果をフィルタリングできるメタデータを追加できます：

```astro
<article
  data-pagefind-body
  data-pagefind-filter="category:tech"
  data-pagefind-filter="tag:astro,javascript"
>
  <!-- コンテンツ -->
</article>
```

## トラブルシューティング

### 検索結果が表示されない場合

1. <strong>ビルド確認</strong>: `dist/_pagefind/`ディレクトリが生成されているか確認
2. <strong>format設定</strong>: `astro.config.ts`に`build.format: "file"`を追加
3. <strong>data-pagefind-body</strong>: コンテンツにこの属性があるか確認

### 開発モードで検索が機能しない場合

これは正常です。Pagefindはビルドされた静的ファイルでのみ動作します。`npm run build && npm run preview`でテストしてください。

### 日本語検索が正しく機能しない場合

Pagefindは標準で日本語をサポートしていますが、より良い検索結果のために言語設定を明示できます：

```yaml
# pagefind.yml
languages:
  - code: ja
```

## 結論

<strong>astro-pagefind</strong>は、静的Astroサイトに高速で効率的な検索機能を追加する完璧なソリューションです。主な利点は：

✓ <strong>ゼロサーバーコスト</strong>: 完全なクライアントサイド検索
✓ <strong>優れたパフォーマンス</strong>: 段階的ロードと最小帯域幅
✓ <strong>簡単な実装</strong>: Astro統合でシンプルな設定
✓ <strong>カスタマイズ</strong>: UIと動作の完全制御
✓ <strong>スケーラビリティ</strong>: 数千ページでも高速検索

わずか数行のコードでプロフェッショナルな検索機能を追加できます。ユーザー体験を大幅に改善しながら、静的サイトのシンプルさとパフォーマンスを維持できる理想的なソリューションです。

## 参考資料

- [Pagefind公式ドキュメント](https://pagefind.app/)
- [astro-pagefind GitHub](https://github.com/shishkin/astro-pagefind)
- [Pagefind UI設定オプション](https://pagefind.app/docs/ui/)
- [CloudCannon: Introducing Pagefind](https://cloudcannon.com/blog/introducing-pagefind/)
