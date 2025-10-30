---
title: '静的ブログで予約投稿を実装する方法: Astro + GitHub Actionsによる完全自動化'
description: >-
  AstroとGitHub
  Pagesを使用した静的ブログでWordPressのような予約投稿機能を実装する実践ガイド。pubDateフィルタリングとスケジュールワークフローを活用した完全自動化ソリューション
pubDate: '2025-10-13'
heroImage: ../../../assets/blog/scheduled-publishing-hero.jpg
tags:
  - astro
  - github-actions
  - automation
  - static-site
  - ci-cd
relatedPosts:
  - slug: metadata-based-recommendation-optimization
    score: 0.86
    reason:
      ko: '다음 단계 학습으로 적합하며, 자동화, 웹 개발, DevOps, 아키텍처 주제에서 연결됩니다.'
      ja: 次のステップの学習に適しており、自動化、Web開発、DevOps、アーキテクチャのトピックで繋がります。
      en: >-
        Suitable as a next-step learning resource, connecting through
        automation, web development, DevOps, architecture topics.
  - slug: self-healing-ai-systems
    score: 0.75
    reason:
      ko: '자동화, DevOps, 아키텍처 관점에서 보완적인 내용을 제공합니다.'
      ja: 自動化、DevOps、アーキテクチャの観点から補完的な内容を提供します。
      en: >-
        Provides complementary content from automation, DevOps, architecture
        perspective.
  - slug: ai-agent-collaboration-patterns
    score: 0.71
    reason:
      ko: '자동화, 아키텍처 관점에서 보완적인 내용을 제공합니다.'
      ja: 自動化、アーキテクチャの観点から補完的な内容を提供します。
      en: >-
        Provides complementary content from automation, architecture
        perspective.
---

## 静的サイトのジレンマ: 予約投稿機能

Astro + GitHub Pagesでブログを運営すると、多くのメリットがあります。高速なページ読み込み、サーバーコストゼロ、優れたSEO最適化。しかし、WordPressのようなCMSで当たり前に使っていた**投稿の予約公開機能**がないことが不便でした。

時間がある時に複数の記事を事前に書いて、毎朝9時に自動で公開したい。しかし、静的サイトジェネレーターはビルド時点のファイルのみをデプロイします。未来の日付の投稿は？ビルド時点ですでにHTMLとして生成され、即座に公開されてしまいます。

この記事では、**AstroのContent CollectionsとGitHub Actionsのスケジュールワークフローを組み合わせて**、静的サイトで完全な予約投稿システムを実装する方法を解説します。実際に私のブログに適用したコードをベースに説明するので、すぐに適用できます。

## ソリューション概要: 3つの核心要素

予約投稿を実装する核心は次の3つです:

### 1. pubDateベースのコンテンツフィルタリング

AstroのContent Collectionsスキーマに`pubDate`フィールドを定義し、ビルド時に現在の日付より未来の投稿をフィルタリングします。

```typescript
// src/content.config.ts
import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      pubDate: z.coerce.date(), // 文字列をDateオブジェクトに自動変換
      heroImage: image().optional(),
      tags: z.array(z.string()).optional(),
    }),
});

export const collections = { blog };
```

### 2. スマートフィルタリングユーティリティ

本番ビルドでは今日の日付以前の投稿のみを表示し、開発環境ではすべての投稿を表示します。

```typescript
// src/lib/content.ts
import type { CollectionEntry } from 'astro:content';

/**
 * JST(日本時間)基準の現在日付を取得
 * GitHub ActionsはUTCで実行されるため、明示的にJSTに変換
 */
function getJSTDate(): Date {
  const now = new Date();
  const jstOffset = 9 * 60; // JST = UTC+9
  const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
  const jstTime = new Date(utcTime + (jstOffset * 60000));
  return jstTime;
}

/**
 * DateをYYYY-MM-DD形式に変換
 */
function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * ブログ投稿を公開日付基準でフィルタリング
 * - 本番環境: pubDate <= 今日(JST) の投稿のみ
 * - 開発/テスト: すべての投稿 (TEST_FLG=true)
 */
export function filterPostsByDate(
  posts: CollectionEntry<'blog'>[]
): CollectionEntry<'blog'>[] {
  // テストフラグが設定されている場合はすべての投稿を表示
  if (import.meta.env.TEST_FLG === 'true') {
    return posts;
  }

  const today = toDateString(getJSTDate());
  return posts.filter((post) => {
    const postDate = toDateString(post.data.pubDate);
    return postDate <= today;
  });
}
```

**ポイント**:
- **タイムゾーンの一貫性**: GitHub ActionsはUTCで実行されるため、JST(UTC+9)に明示的に変換
- **日付比較**: 時刻まで比較すると複雑になるため、YYYY-MM-DD形式で簡素化
- **開発モード例外**: `TEST_FLG=true`に設定すると未来の投稿もプレビュー可能

### 3. GitHub Actionsスケジュールワークフロー

毎日決まった時間に自動でサイトを再ビルドして、その日の投稿を公開します。

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:
  # 毎日日本時間 00:00 (UTC 15:00 前日)に自動ビルド
  schedule:
    - cron: "0 15 * * *"

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    env:
      TZ: 'Asia/Tokyo' # JSTタイムゾーンを明示
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Install, build, and upload site
        uses: withastro/action@v3
        with:
          node-version: 22

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

**ワークフロー説明**:
- **pushトリガー**: `main`ブランチへのコミット時に即座にデプロイ
- **workflow_dispatch**: GitHub UIから手動実行可能
- **scheduleトリガー**: 毎日UTC 15:00 (JST翌日00:00)に自動実行

## 実践実装: ステップバイステップガイド

### ステップ1: Content Collectionsスキーマ定義

まず、ブログ投稿のタイプスキーマを定義します。

```typescript
// src/content.config.ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  // Markdown/MDXファイルの読み込み
  loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),

  // Frontmatterスキーマ
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      pubDate: z.coerce.date(), // "2025-10-13" → Dateオブジェクトに変換
      updatedDate: z.coerce.date().optional(),
      heroImage: image().optional(),
      tags: z.array(z.string()).optional(),
    }),
});

export const collections = { blog };
```

これで、ブログ投稿を作成する際に次のようなfrontmatterを使用します:

```markdown
---
title: '予約投稿テスト記事'
description: '明日公開される記事です'
pubDate: '2025-10-14' # 未来の日付に設定
heroImage: '../../../assets/blog/test-hero.jpg'
tags: ['test', 'scheduled']
---

## この記事は2025年10月14日に公開されます!
```

### ステップ2: フィルタリングユーティリティ作成

すべてのページで再利用できるフィルタリングロジックを`src/lib/content.ts`に作成します。

```typescript
// src/lib/content.ts
import type { CollectionEntry } from 'astro:content';

/**
 * TEST_FLG環境変数の確認
 * 開発/テストモードでは未来の投稿も表示
 */
export function shouldShowFuturePost(): boolean {
  return import.meta.env.TEST_FLG === 'true';
}

/**
 * JST(Asia/Tokyo)基準の現在日付を返す
 */
function getJSTDate(): Date {
  const now = new Date();
  const jstOffset = 9 * 60; // UTC+9タイムゾーン
  const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
  const jstTime = new Date(utcTime + (jstOffset * 60000));
  return jstTime;
}

/**
 * DateオブジェクトをYYYY-MM-DD文字列に変換
 */
function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * ブログ投稿の日付フィルタリング
 * - 本番環境: pubDate <= 今日(JST)
 * - テスト: すべての投稿
 */
export function filterPostsByDate(
  posts: CollectionEntry<'blog'>[]
): CollectionEntry<'blog'>[] {
  if (shouldShowFuturePost()) {
    return posts;
  }

  const today = toDateString(getJSTDate());
  return posts.filter((post) => {
    const postDate = toDateString(post.data.pubDate);
    return postDate <= today;
  });
}
```

### ステップ3: ブログインデックスページの更新

フィルタリング関数を適用して、公開済みの投稿のみを表示します。

```astro
---
// src/pages/[lang]/blog/index.astro
import { getCollection } from 'astro:content';
import { filterPostsByDate } from '../../../lib/content';
import BlogCard from '../../../components/BlogCard.astro';

// すべてのブログ投稿を取得
const allPosts = await getCollection('blog');

// 日付フィルタリング + 言語フィルタリング + ソート
const posts = filterPostsByDate(allPosts)
  .filter((post) => post.id.startsWith(`${lang}/`))
  .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
---

<main>
  <h1>ブログ</h1>
  <div class="grid">
    {posts.map((post) => (
      <BlogCard
        href={`/${lang}/blog/${post.id}/`}
        title={post.data.title}
        description={post.data.description}
        pubDate={post.data.pubDate}
        heroImage={post.data.heroImage}
        tags={post.data.tags}
      />
    ))}
  </div>
</main>
```

### ステップ4: 動的投稿ページの更新

個別投稿ページも同様にフィルタリングします。

```astro
---
// src/pages/[lang]/blog/[...slug].astro
import { type CollectionEntry, getCollection, render } from 'astro:content';
import { filterPostsByDate } from '../../../lib/content';
import BlogPost from '../../../layouts/BlogPost.astro';

export async function getStaticPaths() {
  const allPosts = await getCollection('blog');
  const posts = filterPostsByDate(allPosts); // フィルタリング適用
  const langs = ['ko', 'ja', 'en'];

  return posts.flatMap((post) => {
    return langs.map((lang) => ({
      params: { lang, slug: post.id },
      props: post,
    }));
  });
}

type Props = CollectionEntry<'blog'>;

const { lang } = Astro.params;
const post = Astro.props;
const { Content } = await render(post);
---

<BlogPost {...post.data} lang={lang}>
  <Content />
</BlogPost>
```

**重要**: `getStaticPaths()`でフィルタリングしないと、未来の投稿のパスも生成され、直接URLでアクセス可能になります。必ずここでもフィルタリングする必要があります。

### ステップ5: GitHub Actionsワークフロー設定

`.github/workflows/deploy.yml`ファイルを作成します。

```yaml
name: Deploy to GitHub Pages

on:
  # mainブランチプッシュ時にデプロイ
  push:
    branches: [main]

  # 手動実行可能
  workflow_dispatch:

  # スケジュール実行: 毎日JST 00:00 (UTC 15:00 前日)
  schedule:
    - cron: "0 15 * * *"

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    env:
      TZ: 'Asia/Tokyo' # タイムゾーンを明示
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Install, build, and upload site
        uses: withastro/action@v3
        with:
          node-version: 22

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

**Cron構文説明**:
```
"0 15 * * *"
 │  │  │ │ │
 │  │  │ │ └─ 曜日 (0-6, 日-土)
 │  │  │ └─── 月 (1-12)
 │  │  └───── 日 (1-31)
 │  └──────── 時 (0-23, UTC)
 └─────────── 分 (0-59)
```

- `"0 15 * * *"` = 毎日UTC 15:00 (JST翌日00:00)
- `"0 9 * * *"` = 毎日UTC 09:00 (JST 18:00)
- `"0 0 * * 1"` = 毎週月曜日UTC 00:00 (JST 09:00)

### ステップ6: ローカルテスト

未来の投稿を作成してローカルでテストします。

```bash
# 1. 未来の日付の投稿を作成
# src/content/blog/ja/future-post.md
# pubDate: '2025-10-20'

# 2. テストモードで開発サーバーを実行 (すべての投稿を表示)
TEST_FLG=true npm run dev

# 3. 本番ビルドをテスト (フィルタリング適用)
npm run build
npm run preview

# 4. ビルド結果を確認: 未来の投稿が表示されないことをチェック
```

**期待される動作**:
- `TEST_FLG=true`: 未来の投稿が表示される ✓
- 本番ビルド: 未来の投稿が非表示 ✓

### ステップ7: GitHub Pages設定

1. **GitHubリポジトリ設定**:
   - Settings → Pages → Sourceを「GitHub Actions」に変更

2. **初回デプロイ**:
   ```bash
   git add .
   git commit -m "feat: add scheduled publishing"
   git push origin main
   ```

3. **Actionsタブでデプロイ確認**:
   - "Deploy to GitHub Pages"ワークフローの実行を確認
   - 成功後、サイトにアクセスして未来の投稿が表示されないことを確認

4. **スケジュール確認**:
   - Actionsタブ → "Deploy to GitHub Pages" → 右メニュー → "View workflow runs"
   - 次回実行時刻を確認

## 高度な活用テクニック

### タイムゾーン別のカスタム設定

**韓国時間基準 (KST = UTC+9)**:
```yaml
schedule:
  - cron: "0 15 * * *" # 毎日KST 00:00
```

**米国東部時間基準 (EST = UTC-5)**:
```yaml
schedule:
  - cron: "0 14 * * *" # 毎日EST 09:00
```

**ヨーロッパ中部時間基準 (CET = UTC+1)**:
```yaml
schedule:
  - cron: "0 8 * * *" # 毎日CET 09:00
```

### 複数タイムゾーンビルド

1日に複数回ビルドして、より正確な予約投稿:

```yaml
schedule:
  - cron: "0 0 * * *"   # JST 09:00 (朝)
  - cron: "0 6 * * *"   # JST 15:00 (午後)
  - cron: "0 12 * * *"  # JST 21:00 (夕方)
```

**注意**: GitHub Actions無料プランは月2,000分の制限があります。ビルド時間が5分の場合、1日3回ビルドで月450分使用(余裕あり)。

### RSSフィードのフィルタリング

RSSフィードにもフィルタリングを適用:

```typescript
// src/pages/rss.xml.ts
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { filterPostsByDate } from '../lib/content';

export async function GET(context) {
  const allPosts = await getCollection('blog');
  const posts = filterPostsByDate(allPosts) // フィルタリング
    .filter((post) => post.id.startsWith('ja/'))
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

  return rss({
    title: 'ブログタイトル',
    description: 'ブログ説明',
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: `/ja/blog/${post.id}/`,
    })),
  });
}
```

### サイトマップのフィルタリング

Astroの`@astrojs/sitemap`統合は、自動的に生成されたページをサイトマップに追加します。`getStaticPaths()`でフィルタリングすれば、サイトマップも自動的にフィルタリングされます。

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://yourdomain.com',
  integrations: [
    sitemap(), // 自動的にフィルタリングされたページのみ含む
  ],
});
```

## トラブルシューティング

### 問題1: 未来の投稿がすぐに公開される

**原因**: フィルタリングが適用されていない

**解決策**:
1. `getStaticPaths()`と`getCollection()`呼び出しの両方に`filterPostsByDate()`を適用していることを確認
2. ビルドログを確認:
   ```bash
   npm run build
   # 出力で投稿数を確認
   ```

### 問題2: スケジュールが実行されない

**原因**: GitHub Actions設定の問題

**解決策**:
1. **リポジトリの有効化確認**: Actionsタブが有効になっているか
2. **Cron構文検証**: [Crontab.guru](https://crontab.guru)で確認
3. **最終コミット日**: 60日以上コミットがないとスケジュールが自動停止
   - 解決策: ダミーコミットをプッシュまたは手動実行

### 問題3: タイムゾーンが合わない

**原因**: UTCとローカルタイムゾーンの混同

**解決策**:
1. **ワークフロー`env.TZ`の確認**:
   ```yaml
   env:
     TZ: 'Asia/Tokyo'
   ```

2. **フィルタリング関数のタイムゾーン確認**:
   ```typescript
   function getJSTDate(): Date {
     const now = new Date();
     const jstOffset = 9 * 60; // JST = UTC+9
     // ...
   }
   ```

3. **テスト**:
   ```bash
   # GitHub Actionsログでビルド時刻を確認
   date (実行時刻が正しいタイムゾーンか)
   ```

### 問題4: 開発モードで未来の投稿が表示されない

**原因**: `TEST_FLG`環境変数が未設定

**解決策**:
```bash
# .envファイルを作成
echo "TEST_FLG=true" > .env

# またはコマンドに直接渡す
TEST_FLG=true npm run dev
```

## パフォーマンスとコスト

### GitHub Actionsのコスト

**無料プラン**:
- 月2,000分無料
- ビルド時間: 約2-5分(プロジェクトサイズによる)
- 1日1回ビルド: 月60-150分使用
- **結論**: 無料プランで十分 ✓

**有料プラン**:
- Team: 月$4、3,000分/月
- Enterprise: カスタム料金

### ビルド最適化

Astroビルド時間を短縮する方法:

```javascript
// astro.config.mjs
export default defineConfig({
  // 1. 画像最適化の並列処理
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp',
    },
  },

  // 2. ビルドキャッシング (Vercel/Netlifyで自動)
  build: {
    inlineStylesheets: 'auto',
  },
});
```

**追加最適化**:
- **依存関係のキャッシング**: `actions/cache`を使用
- **インクリメンタルビルド**: Astro 4.0+でサポート

```yaml
# 依存関係キャッシングの例
- name: Cache dependencies
  uses: actions/cache@v3
  with:
    path: node_modules
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
```

## 他のアプローチとの比較

### 方法1: Netlify/Vercelスケジュールビルド

**メリット**:
- GUIで設定可能
- プラットフォーム統合キャッシング

**デメリット**:
- プラットフォーム依存
- 無料プラン制限(Netlify: 月300分)

### 方法2: 外部Cronサービス (例: cron-job.org)

**メリット**:
- GitHub Actionsの制限を消費しない

**デメリット**:
- Webhook設定が必要
- セキュリティトークン管理
- 追加サービスへの依存

### 方法3: サーバーレス関数 (例: Cloudflare Workers)

**メリット**:
- リアルタイムフィルタリング可能

**デメリット**:
- 静的サイトではなくなる
- 複雑度の増加
- 追加サービスが必要

**推奨**: **GitHub Actions方式が最もシンプルで無料、GitHub Pagesと完璧に統合**

## まとめ

AstroとGitHub Actionsを組み合わせることで、静的ブログでもWordPressのように**完全自動化された予約投稿システム**を構築できます。

### 重要ポイントのまとめ

✅ **Content CollectionsスキーマにpubDateを定義**
✅ **日付フィルタリングユーティリティを作成** (JSTタイムゾーンを明示)
✅ **すべてのページにフィルタリングを適用** (インデックス、動的ページ、RSS)
✅ **GitHub Actionsスケジュールワークフローを設定** (cron式)
✅ **ローカルテスト** (TEST_FLG=true)
✅ **本番デプロイと検証**

### この方式のメリット

1. **ゼロコスト**: GitHub Actions無料プランで十分
2. **完全自動化**: 一度設定すれば永続的に動作
3. **タイムゾーン制御**: 任意のタイムゾーンで正確な公開
4. **開発者フレンドリー**: テストモードでプレビュー可能
5. **プラットフォーム独立**: GitHub Pages以外でもNetlify、Vercelなどどこでも動作

これで、時間がある時に事前に記事を書いて、毎朝自動的に読者に新しい記事を届けることができます。静的サイトの速度とWordPressの利便性を同時に享受しましょう!

## 参考資料

- [Astro Content Collections公式ドキュメント](https://docs.astro.build/en/guides/content-collections/)
- [GitHub Actionsスケジュールイベント](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#schedule)
- [Cron式ガイド](https://crontab.guru)
- [Astro公式GitHub Actions](https://github.com/withastro/action)
- [GitHub Pagesデプロイガイド](https://docs.github.com/en/pages)
