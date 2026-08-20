# Chapter 3: 初めてのエージェント作業

この章では、Claude Codeを使用して実際の開発作業を行う方法を学びます。各レシピは独立して実行でき、実務ですぐに活用できるパターンを提供します。

---

## Recipe 3.1: コード生成

### 問題 (Problem)

新しい機能を実装する必要がありますが、ボイラープレートコードの作成に時間がかかります。特に型定義、エラーハンドリング、テストコードまで作成するには繰り返し作業が多くなります。

例えば、ブログアプリケーションに「タグ別投稿フィルタリング」機能を追加すると仮定しましょう。次の作業が必要です:

- APIエンドポイントの作成
- 型定義
- エラーハンドリング
- テストコードの作成
- ドキュメント作成

### 解決策 (Solution)

Claude Codeに明確な要件を伝えてコードを生成します。重要なのは**コンテキスト提供 → 具体的なリクエスト → 検証 → 改善**のサイクルに従うことです。

#### ステップ1: プロジェクトコンテキストの提供

```
現在Astroベースのブログプロジェクトを作業中です。
src/content/blog/ディレクトリにマークダウン投稿があり、
各投稿はfrontmatterにtags配列を持っています。

例:
---
title: "TypeScript 5.0 新機能"
tags: ["typescript", "javascript", "programming"]
pubDate: "2025-01-15"
---
```

#### ステップ2: 具体的なリクエスト

```
タグ別に投稿をフィルタリングする機能を追加したいです。

要件:
1. /tags/[tag]ルートで特定タグの投稿リストを表示
2. /tagsページですべてのタグと投稿数を表示
3. 各ブログ投稿下部にタグをクリック可能に表示
4. TypeScriptの型安全性を保証

関連ファイルを読んで実装してください。
```

#### ステップ3: Claudeの探索と実装の観察

Claude Codeは次のように作業します:

1. 関連ファイルの探索 (`src/content.config.ts`, `src/pages/blog/`など)
2. 既存パターンの分析
3. 新規ファイルの作成または既存ファイルの修正
4. 型チェックの実行

#### ステップ4: 検証と改善リクエスト

```
うまく動作します! いくつか改善のリクエスト:
1. タグはアルファベット順にソートしてください
2. 投稿がないタグは表示しないでください
3. SEOのためのメタタグも追加してください
```

### コード/例示 (Code)

#### 生成されたファイル1: `src/pages/tags/index.astro`

```astro
---
import { getCollection } from 'astro:content';
import BaseHead from '../../components/BaseHead.astro';
import Header from '../../components/Header.astro';
import Footer from '../../components/Footer.astro';

interface TagCount {
  tag: string;
  count: number;
}

// すべてのブログ投稿からタグを抽出
const posts = await getCollection('blog');
const tagMap = new Map<string, number>();

posts.forEach(post => {
  const tags = post.data.tags || [];
  tags.forEach(tag => {
    const lowerTag = tag.toLowerCase();
    tagMap.set(lowerTag, (tagMap.get(lowerTag) || 0) + 1);
  });
});

// タグをアルファベット順にソート
const tagCounts: TagCount[] = Array.from(tagMap.entries())
  .map(([tag, count]) => ({ tag, count }))
  .filter(({ count }) => count > 0)  // 投稿があるタグのみ
  .sort((a, b) => a.tag.localeCompare(b.tag));

const totalPosts = posts.length;
---

<!DOCTYPE html>
<html lang="ko">
  <head>
    <BaseHead
      title="すべてのタグ - ブログ"
      description={`${tagCounts.length}個のタグに分類された${totalPosts}個の投稿を探索`}
    />
  </head>
  <body>
    <Header />
    <main class="container mx-auto px-4 py-8">
      <h1 class="text-4xl font-bold mb-8">すべてのタグ</h1>
      <p class="text-gray-600 mb-6">
        合計{tagCounts.length}個のタグ、{totalPosts}個の投稿
      </p>

      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {tagCounts.map(({ tag, count }) => (
          <a
            href={`/tags/${tag}`}
            class="flex justify-between items-center p-4 border rounded-lg hover:border-blue-500 hover:shadow-lg transition-all"
          >
            <span class="font-medium">#{tag}</span>
            <span class="text-sm text-gray-500">{count}</span>
          </a>
        ))}
      </div>
    </main>
    <Footer />
  </body>
</html>
```

#### 生成されたファイル2: `src/pages/tags/[tag].astro`

```astro
---
import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';
import BaseHead from '../../components/BaseHead.astro';
import Header from '../../components/Header.astro';
import Footer from '../../components/Footer.astro';
import FormattedDate from '../../components/FormattedDate.astro';

export async function getStaticPaths() {
  const posts = await getCollection('blog');
  const tagSet = new Set<string>();

  // すべてのユニークなタグを収集
  posts.forEach(post => {
    const tags = post.data.tags || [];
    tags.forEach(tag => tagSet.add(tag.toLowerCase()));
  });

  // 各タグごとにパスを生成
  return Array.from(tagSet).map(tag => ({
    params: { tag },
    props: {
      posts: posts
        .filter(post =>
          (post.data.tags || [])
            .map(t => t.toLowerCase())
            .includes(tag)
        )
        .sort((a, b) =>
          b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
        ),
      tag,
    },
  }));
}

interface Props {
  posts: CollectionEntry<'blog'>[];
  tag: string;
}

const { posts, tag } = Astro.props;
---

<!DOCTYPE html>
<html lang="ko">
  <head>
    <BaseHead
      title={`タグ: ${tag} - ブログ`}
      description={`"${tag}"タグが付いた${posts.length}個の投稿`}
    />
  </head>
  <body>
    <Header />
    <main class="container mx-auto px-4 py-8">
      <div class="mb-8">
        <h1 class="text-4xl font-bold mb-2">
          タグ: <span class="text-blue-600">#{tag}</span>
        </h1>
        <p class="text-gray-600">{posts.length}個の投稿</p>
      </div>

      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map(post => (
          <article class="border rounded-lg p-6 hover:shadow-lg transition-shadow">
            <h2 class="text-xl font-bold mb-2">
              <a href={`/blog/${post.slug}`} class="hover:text-blue-600">
                {post.data.title}
              </a>
            </h2>
            <FormattedDate date={post.data.pubDate} class="text-sm text-gray-500 mb-3" />
            <p class="text-gray-700 mb-4">{post.data.description}</p>
            <div class="flex flex-wrap gap-2">
              {(post.data.tags || []).map(postTag => (
                <a
                  href={`/tags/${postTag.toLowerCase()}`}
                  class={`text-xs px-2 py-1 rounded ${
                    postTag.toLowerCase() === tag
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  #{postTag}
                </a>
              ))}
            </div>
          </article>
        ))}
      </div>
    </main>
    <Footer />
  </body>
</html>
```

#### 修正されたファイル: `src/layouts/BlogPost.astro` (下部にタグを追加)

```astro
---
// ... 既存のコード ...
const { title, description, pubDate, updatedDate, heroImage, tags } = Astro.props;
---

<!-- ... 既存のHTML ... -->

<article>
  <!-- 投稿内容 -->
  <slot />

  <!-- タグセクション追加 -->
  {tags && tags.length > 0 && (
    <div class="mt-8 pt-8 border-t">
      <h3 class="text-lg font-semibold mb-3">タグ</h3>
      <div class="flex flex-wrap gap-2">
        {tags.map((tag: string) => (
          <a
            href={`/tags/${tag.toLowerCase()}`}
            class="px-3 py-1 bg-gray-200 hover:bg-blue-600 hover:text-white rounded-full text-sm transition-colors"
          >
            #{tag}
          </a>
        ))}
      </div>
    </div>
  )}
</article>
```

### 説明 (Explanation)

#### 1. 静的パス生成 (Static Path Generation)

```typescript
export async function getStaticPaths() {
  // ビルド時にすべての可能なパスを事前に生成
  const posts = await getCollection('blog');
  const tagSet = new Set<string>();

  // タグの収集と正規化(小文字変換)
  posts.forEach(post => {
    (post.data.tags || []).forEach(tag => tagSet.add(tag.toLowerCase()));
  });

  // 各タグ別のパスとpropsを返す
  return Array.from(tagSet).map(tag => ({
    params: { tag },           // URLパラメータ
    props: { posts, tag },     // ページに渡すデータ
  }));
}
```

Astroの静的サイト生成(SSG)の特性上、ビルド時にすべてのパスを事前に生成する必要があります。`getStaticPaths()`は`/tags/typescript`、`/tags/javascript`のようなすべての可能なURLを生成します。

#### 2. 型安全性

```typescript
import type { CollectionEntry } from 'astro:content';

interface Props {
  posts: CollectionEntry<'blog'>[];  // 型チェック
  tag: string;
}

const { posts, tag } = Astro.props;  // 自動補完対応
```

TypeScriptを使用してコンパイル時にエラーを検出します。`CollectionEntry<'blog'>`はAstroが自動生成した型で、`title`、`description`、`pubDate`などのフィールドを保証します。

#### 3. SEO最適化

```astro
<BaseHead
  title={`タグ: ${tag} - ブログ`}
  description={`"${tag}"タグが付いた${posts.length}個の投稿`}
/>
```

各タグページごとに固有のメタデータを生成し、検索エンジン最適化を改善します。

#### 4. ユーザーエクスペリエンス (UX)

- **視覚的フィードバック**: 現在のタグは青色で強調
- **ホバー効果**: マウスオーバー時に色変更とシャドウ効果
- **レスポンシブデザイン**: 画面サイズに応じてグリッド列数を調整

### バリエーション (Variations)

#### バリエーション1: 人気タグの表示

```astro
---
// 上位10個の人気タグのみ表示
const popularTags = tagCounts
  .sort((a, b) => b.count - a.count)
  .slice(0, 10);
---

<section class="mb-8">
  <h2 class="text-2xl font-bold mb-4">人気タグ</h2>
  <div class="flex flex-wrap gap-3">
    {popularTags.map(({ tag, count }) => (
      <a
        href={`/tags/${tag}`}
        class="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full hover:shadow-lg transition-shadow"
        style={`font-size: ${Math.min(1 + count * 0.1, 2)}rem`}
      >
        #{tag} <span class="text-xs">({count})</span>
      </a>
    ))}
  </div>
</section>
```

**使用シナリオ**: ホームページやサイドバーで人気のあるトピックを素早く表示したい場合。

#### バリエーション2: 検索機能の追加

```astro
---
// src/pages/tags/index.astroに検索機能を追加
---

<div class="mb-6">
  <input
    type="text"
    id="tag-search"
    placeholder="タグを検索..."
    class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
</div>

<div id="tag-list" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
  {tagCounts.map(({ tag, count }) => (
    <a
      href={`/tags/${tag}`}
      class="tag-item flex justify-between items-center p-4 border rounded-lg hover:border-blue-500 hover:shadow-lg transition-all"
      data-tag={tag}
    >
      <span class="font-medium">#{tag}</span>
      <span class="text-sm text-gray-500">{count}</span>
    </a>
  ))}
</div>

<script>
  const searchInput = document.getElementById('tag-search') as HTMLInputElement;
  const tagItems = document.querySelectorAll('.tag-item');

  searchInput?.addEventListener('input', (e) => {
    const query = (e.target as HTMLInputElement).value.toLowerCase();

    tagItems.forEach((item) => {
      const tag = item.getAttribute('data-tag') || '';
      if (tag.includes(query)) {
        (item as HTMLElement).style.display = 'flex';
      } else {
        (item as HTMLElement).style.display = 'none';
      }
    });
  });
</script>
```

**使用シナリオ**: タグが50個以上に増えたときにユーザーが目的のタグを素早く見つけられるようにします。

#### バリエーション3: 関連タグの推薦

```typescript
// タグ間の関連性を計算(同じ投稿に登場した頻度ベース)
function getRelatedTags(targetTag: string, posts: CollectionEntry<'blog'>[], limit = 5) {
  const relatedTagCounts = new Map<string, number>();

  posts.forEach(post => {
    const tags = (post.data.tags || []).map(t => t.toLowerCase());
    if (tags.includes(targetTag)) {
      tags.forEach(tag => {
        if (tag !== targetTag) {
          relatedTagCounts.set(tag, (relatedTagCounts.get(tag) || 0) + 1);
        }
      });
    }
  });

  return Array.from(relatedTagCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([tag]) => tag);
}
```

```astro
---
// src/pages/tags/[tag].astroで使用
const relatedTags = getRelatedTags(tag, allPosts);
---

{relatedTags.length > 0 && (
  <aside class="mt-8 p-6 bg-gray-100 rounded-lg">
    <h3 class="text-lg font-semibold mb-3">関連タグ</h3>
    <div class="flex flex-wrap gap-2">
      {relatedTags.map(relatedTag => (
        <a
          href={`/tags/${relatedTag}`}
          class="px-3 py-1 bg-white border rounded-full hover:bg-blue-600 hover:text-white transition-colors"
        >
          #{relatedTag}
        </a>
      ))}
    </div>
  </aside>
)}
```

**使用シナリオ**: ユーザーが関心のあるトピックの他の側面を探索するように誘導します。例えば「TypeScript」タグを見ているユーザーに「JavaScript」、「Node.js」タグを推薦できます。

---

## Recipe 3.2: バグ修正

### 問題 (Problem)

本番環境で断続的に発生するバグがあります。ログを見ると特定の条件で`undefined`を参照してエラーが発生しています。コードベースが大きく複数のファイルにまたがっているため、原因を見つけるのが困難です。

**エラーメッセージ**:
```
TypeError: Cannot read property 'heroImage' of undefined
    at BlogPost.astro:15:23
```

**再現条件**:
- 特定のブログ投稿(主に古い投稿)で発生
- heroImageフィールドがない投稿で発生
- ビルドは成功するがランタイムエラーが発生

### 解決策 (Solution)

Claude Codeを使用してバグを体系的に追跡し修正します。重要なのは**エラーコンテキストの提供 → 原因分析 → 修正 → 検証**プロセスに従うことです。

#### ステップ1: エラー情報の提供

```
次のエラーが発生しています:

TypeError: Cannot read property 'heroImage' of undefined
    at BlogPost.astro:15:23

症状:
- heroImageがない古い投稿で発生
- ビルドは成功するがページロード時にエラー
- すべての投稿ではなく一部でのみ発生

関連ファイルを読んで原因を見つけてください。
```

#### ステップ2: Claudeのデバッグプロセスの観察

Claudeは次の順序で作業します:

1. **エラー発生ファイルの読み取り**: `src/layouts/BlogPost.astro:15`を確認
2. **関連コンポーネントの探索**: 画像処理ロジックを確認
3. **Content Collectionsスキーマのレビュー**: `heroImage`がオプショナルフィールドかを確認
4. **問題原因の特定**: Optional chainingの欠落を発見

#### ステップ3: 修正内容の確認

```
原因を見つけました!
heroImageはオプショナルフィールドなのにコードでは常に存在すると仮定しています。

修正方法:
1. Optional chainingの使用(?演算子)
2. デフォルト画像の提供
3. 条件付きレンダリング

どの方式を希望しますか?
```

#### ステップ4: 修正の適用

```
デフォルト画像を提供する方式で修正してください。
デフォルト画像は/public/default-hero.jpgを使用します。
```

### コード/例示 (Code)

#### 修正前(バグのあるコード)

```astro
---
// src/layouts/BlogPost.astro
import { Image } from 'astro:assets';

interface Props {
  title: string;
  description: string;
  pubDate: Date;
  heroImage?: ImageMetadata;  // オプショナルフィールド
}

const { title, description, pubDate, heroImage } = Astro.props;
---

<article>
  <!-- 問題: heroImageがない時にエラー発生 -->
  <Image
    src={heroImage}
    alt={title}
    width={1020}
    height={510}
  />

  <h1>{title}</h1>
  <p>{description}</p>
</article>
```

#### 修正後(安全なコード)

```astro
---
// src/layouts/BlogPost.astro
import { Image } from 'astro:assets';
import defaultHeroImage from '../assets/default-hero.jpg';

interface Props {
  title: string;
  description: string;
  pubDate: Date;
  heroImage?: ImageMetadata;
}

const { title, description, pubDate, heroImage } = Astro.props;

// デフォルト画像処理
const displayImage = heroImage || defaultHeroImage;
---

<article>
  <!-- 安全: 常に有効な画像を表示 -->
  <Image
    src={displayImage}
    alt={title}
    width={1020}
    height={510}
    class={heroImage ? '' : 'opacity-50'}
  />

  {!heroImage && (
    <p class="text-sm text-gray-500 mt-2">
      * デフォルト画像が表示されています
    </p>
  )}

  <h1>{title}</h1>
  <p>{description}</p>
</article>
```

#### 追加の防御コード: Content Collectionsスキーマの更新

```typescript
// src/content.config.ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: ({ image }) => z.object({
    title: z.string().min(1, 'タイトルは必須です'),
    description: z.string().min(10, '説明は最低10文字以上必要です'),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    // 改善: デフォルト値の提供または検証強化
    heroImage: image().optional().default('./default-hero.jpg'),
    tags: z.array(z.string()).default([]),
  }),
});

export const collections = { blog };
```

### 説明 (Explanation)

#### 1. Optional Chainingの限界

```typescript
// この方式はエラーを防ぐが画像がレンダリングされない
<Image src={heroImage?.src} alt={title} />  // ❌ heroImageがundefinedならsrcもundefined
```

Optional chainingだけでは不十分です。`heroImage`が`undefined`の時に`Image`コンポーネントに`undefined`を渡すと依然としてエラーが発生します。

#### 2. Fallbackパターン(推奨)

```typescript
const displayImage = heroImage || defaultHeroImage;
```

このパターンは:
- **安全性**: 常に有効な画像を提供
- **ユーザーエクスペリエンス**: 空白スペースの代わりにデフォルト画像を表示
- **明確性**: コードの意図が明確

#### 3. スキーマレベルの防御

```typescript
heroImage: image().optional().default('./default-hero.jpg'),
```

Content Collectionsスキーマでデフォルト値を提供すると:
- frontmatterで`heroImage`を省略しても自動的にデフォルト画像を割り当て
- 型システムが`heroImage`を常に存在するものとして扱う
- ランタイムエラーの可能性を排除

#### 4. 防御的プログラミング (Defensive Programming)

```astro
{!heroImage && (
  <p class="text-sm text-gray-500 mt-2">
    * デフォルト画像が表示されています
  </p>
)}
```

ユーザーに明確なフィードバックを提供して:
- 開発者が問題を認識できる
- ユーザーが混乱しない

### バリエーション (Variations)

#### バリエーション1: 動的デフォルト画像(カテゴリー別)

```astro
---
import techHero from '../assets/heroes/tech.jpg';
import designHero from '../assets/heroes/design.jpg';
import blogHero from '../assets/heroes/blog.jpg';

const { title, heroImage, tags = [] } = Astro.props;

// タグベースでデフォルト画像を選択
function getDefaultHero(tags: string[]) {
  if (tags.some(tag => ['typescript', 'javascript', 'programming'].includes(tag.toLowerCase()))) {
    return techHero;
  }
  if (tags.some(tag => ['design', 'ui', 'ux'].includes(tag.toLowerCase()))) {
    return designHero;
  }
  return blogHero;
}

const displayImage = heroImage || getDefaultHero(tags);
---
```

**使用シナリオ**: カテゴリー別に視覚的に区別されるデフォルト画像を提供し、より良いユーザーエクスペリエンスを提供します。

#### バリエーション2: 画像検証とエラーレポート

```astro
---
interface ImageValidationResult {
  isValid: boolean;
  error?: string;
  fallback: ImageMetadata;
}

function validateHeroImage(
  heroImage: ImageMetadata | undefined,
  title: string
): ImageValidationResult {
  if (!heroImage) {
    console.warn(`[BlogPost] "${title}": heroImageが提供されていません。デフォルト画像を使用します。`);
    return {
      isValid: false,
      error: 'No hero image provided',
      fallback: defaultHeroImage,
    };
  }

  // 画像サイズの検証(推奨比率: 2:1)
  const { width, height } = heroImage;
  const aspectRatio = width / height;

  if (Math.abs(aspectRatio - 2) > 0.1) {  // 2:1比率から10%以上外れる
    console.warn(
      `[BlogPost] "${title}": 画像比率が推奨事項(2:1)と異なります。` +
      `現在: ${aspectRatio.toFixed(2)}:1`
    );
  }

  return {
    isValid: true,
    fallback: heroImage,
  };
}

const validation = validateHeroImage(heroImage, title);
const displayImage = validation.fallback;
---

{!validation.isValid && import.meta.env.DEV && (
  <div class="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-4">
    <p class="font-bold">開発モード警告</p>
    <p>この投稿にheroImageがありません。デフォルト画像が表示されます。</p>
  </div>
)}
```

**使用シナリオ**: 開発中に画像関連の問題を早期に発見し、本番環境では自動的に復旧します。

#### バリエーション3: 自動画像生成(AIベース)

```typescript
// src/utils/generateHeroImage.ts
import fs from 'fs/promises';
import path from 'path';

interface GenerateImageOptions {
  title: string;
  tags: string[];
  outputPath: string;
}

export async function generateHeroImageIfMissing(
  options: GenerateImageOptions
): Promise<string> {
  const { title, tags, outputPath } = options;

  // 画像が既に存在するか確認
  try {
    await fs.access(outputPath);
    return outputPath;  // 既にあればスキップ
  } catch {
    // ファイルがなければ生成
  }

  // Gemini APIを使用した画像生成
  const prompt = `
    Create a modern, professional hero image for a blog post.
    Title: ${title}
    Topics: ${tags.join(', ')}
    Style: Clean, tech-focused, 2:1 aspect ratio
  `;

  // 実際のAPI呼び出し(例)
  // const imageUrl = await callGeminiAPI(prompt);
  // await downloadImage(imageUrl, outputPath);

  console.log(`[Auto] "${title}"のヒーロー画像生成完了: ${outputPath}`);
  return outputPath;
}
```

```astro
---
// ビルド時に自動的に画像を生成
if (!heroImage && import.meta.env.PROD) {
  const generatedPath = await generateHeroImageIfMissing({
    title,
    tags: tags || [],
    outputPath: `./src/assets/blog/generated/${slug}.jpg`,
  });
  heroImage = generatedPath;
}
---
```

**使用シナリオ**: 大量の投稿を作成する際にヒーロー画像を一つ一つ作る必要なく自動生成します。

---

## Recipe 3.3: リファクタリングのリクエスト

### 問題 (Problem)

コードがますます複雑になっています。複数のコンポーネントで重複したロジックが見つかり、テストの作成も難しくなりました。特にブログ投稿リストを取得するロジックが複数の場所に散在しています。

**現在の問題点**:
```astro
---
// src/pages/index.astro
const posts = (await getCollection('blog'))
  .filter(post => post.id.startsWith('ko/'))
  .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
  .slice(0, 5);
---

---
// src/pages/blog/index.astro
const posts = (await getCollection('blog'))
  .filter(post => post.id.startsWith('ko/'))
  .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
---

---
// src/pages/tags/[tag].astro
const allPosts = (await getCollection('blog'))
  .filter(post => post.id.startsWith('ko/'));
const posts = allPosts
  .filter(post => post.data.tags?.includes(tag))
  .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
---
```

同じロジックが3回繰り返されています!

### 解決策 (Solution)

Claude Codeを使用して重複コードを抽出し、再利用可能なユーティリティ関数にリファクタリングします。

#### ステップ1: リファクタリング範囲の指定

```
ブログ投稿を取得するロジックが複数のファイルに重複しています。

問題点:
1. 言語フィルタリングロジックの重複(ko/チェック)
2. ソートロジックの重複(pubDate基準)
3. 修正時に複数箇所を変更する必要がある

要求事項:
src/utils/フォルダに再利用可能なユーティリティ関数を作成してください。
型安全性を保証し、テスト作成が簡単な構造で作成してください。
```

#### ステップ2: Claudeのリファクタリング計画の確認

Claudeは次のように計画を提示します:

```
リファクタリング計画:

1. src/utils/blog.ts生成
   - getBlogPosts(): 基本投稿の照会
   - getPostsByLanguage(): 言語別フィルタリング
   - getRecentPosts(): 最新投稿の照会
   - getPostsByTag(): タグ別フィルタリング

2. 型定義の改善
   - SupportedLanguage型の追加
   - SortOrder型の追加

3. 既存ファイルの修正
   - index.astro, blog/index.astro, tags/[tag].astro
   - 重複コードの削除、ユーティリティ関数の使用

4. テストの作成(オプション)
   - src/utils/blog.test.ts

進めますか?
```

#### ステップ3: 実装確認とフィードバック

```
良いですね! いくつか追加のリクエスト:
1. キャッシング機能の追加(同じリクエストの繰り返し時のパフォーマンス改善)
2. エラー処理の強化
3. JSDocコメントでドキュメント化
```

### コード/例示 (Code)

#### 生成されたファイル: `src/utils/blog.ts`

```typescript
import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';

/**
 * サポートされている言語コード
 */
export type SupportedLanguage = 'ko' | 'en' | 'ja' | 'zh';

/**
 * ソート順序
 */
export type SortOrder = 'asc' | 'desc';

/**
 * ブログ投稿照会オプション
 */
export interface GetPostsOptions {
  language?: SupportedLanguage;
  limit?: number;
  sortBy?: 'pubDate' | 'updatedDate' | 'title';
  sortOrder?: SortOrder;
  includeDrafts?: boolean;
}

/**
 * キャッシュストレージ(ビルド時のパフォーマンス改善)
 */
const postsCache = new Map<string, CollectionEntry<'blog'>[]>();

/**
 * すべてのブログ投稿を取得します(キャッシング適用)
 *
 * @returns 全ブログ投稿配列
 * @throws Error 投稿ロード失敗時
 *
 * @example
 * ```typescript
 * const posts = await getBlogPosts();
 * console.log(`合計${posts.length}個の投稿`);
 * ```
 */
export async function getBlogPosts(): Promise<CollectionEntry<'blog'>[]> {
  const cacheKey = 'all-posts';

  if (postsCache.has(cacheKey)) {
    return postsCache.get(cacheKey)!;
  }

  try {
    const posts = await getCollection('blog');
    postsCache.set(cacheKey, posts);
    return posts;
  } catch (error) {
    console.error('[getBlogPosts] 投稿ロード失敗:', error);
    throw new Error('ブログ投稿を読み込めません');
  }
}

/**
 * 特定言語のブログ投稿を取得します
 *
 * @param language - 言語コード(ko, en, ja, zh)
 * @param options - 追加オプション(ソート、制限など)
 * @returns フィルタリングおよびソートされた投稿配列
 *
 * @example
 * ```typescript
 * // 韓国語投稿の最新5件
 * const posts = await getPostsByLanguage('ko', { limit: 5 });
 *
 * // 英語投稿をタイトル順ソート
 * const posts = await getPostsByLanguage('en', {
 *   sortBy: 'title',
 *   sortOrder: 'asc'
 * });
 * ```
 */
export async function getPostsByLanguage(
  language: SupportedLanguage,
  options: Omit<GetPostsOptions, 'language'> = {}
): Promise<CollectionEntry<'blog'>[]> {
  const {
    limit,
    sortBy = 'pubDate',
    sortOrder = 'desc',
    includeDrafts = false,
  } = options;

  let posts = await getBlogPosts();

  // 言語フィルタリング
  posts = posts.filter(post => post.id.startsWith(`${language}/`));

  // ドラフト除外(オプション)
  if (!includeDrafts) {
    posts = posts.filter(post => !post.data.draft);
  }

  // ソート
  posts = sortPosts(posts, sortBy, sortOrder);

  // 制限
  if (limit !== undefined && limit > 0) {
    posts = posts.slice(0, limit);
  }

  return posts;
}

/**
 * 最新投稿を取得します
 *
 * @param language - 言語コード(オプション、指定しない場合は全体)
 * @param limit - 最大投稿数(デフォルト: 10)
 * @returns 最新投稿配列
 *
 * @example
 * ```typescript
 * // 全言語から最新10件
 * const recent = await getRecentPosts();
 *
 * // 韓国語の最新5件
 * const recentKo = await getRecentPosts('ko', 5);
 * ```
 */
export async function getRecentPosts(
  language?: SupportedLanguage,
  limit = 10
): Promise<CollectionEntry<'blog'>[]> {
  if (language) {
    return getPostsByLanguage(language, { limit, sortOrder: 'desc' });
  }

  const posts = await getBlogPosts();
  return sortPosts(posts, 'pubDate', 'desc').slice(0, limit);
}

/**
 * 特定タグの投稿を取得します
 *
 * @param tag - タグ(大文字小文字を無視)
 * @param language - 言語コード(オプション)
 * @returns タグが一致する投稿配列
 *
 * @example
 * ```typescript
 * // 'typescript'タグのすべての投稿
 * const posts = await getPostsByTag('typescript');
 *
 * // 韓国語'typescript'投稿のみ
 * const posts = await getPostsByTag('typescript', 'ko');
 * ```
 */
export async function getPostsByTag(
  tag: string,
  language?: SupportedLanguage
): Promise<CollectionEntry<'blog'>[]> {
  const normalizedTag = tag.toLowerCase();
  let posts = await getBlogPosts();

  // 言語フィルタリング
  if (language) {
    posts = posts.filter(post => post.id.startsWith(`${language}/`));
  }

  // タグフィルタリング
  posts = posts.filter(post =>
    (post.data.tags || [])
      .map(t => t.toLowerCase())
      .includes(normalizedTag)
  );

  // 最新順ソート
  return sortPosts(posts, 'pubDate', 'desc');
}

/**
 * 投稿配列をソートします
 *
 * @param posts - ソートする投稿配列
 * @param sortBy - ソート基準フィールド
 * @param sortOrder - ソート順序(asc/desc)
 * @returns ソートされた投稿配列
 */
function sortPosts(
  posts: CollectionEntry<'blog'>[],
  sortBy: 'pubDate' | 'updatedDate' | 'title',
  sortOrder: SortOrder
): CollectionEntry<'blog'>[] {
  const sorted = [...posts].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'pubDate':
        comparison = a.data.pubDate.valueOf() - b.data.pubDate.valueOf();
        break;
      case 'updatedDate':
        const aDate = a.data.updatedDate || a.data.pubDate;
        const bDate = b.data.updatedDate || b.data.pubDate;
        comparison = aDate.valueOf() - bDate.valueOf();
        break;
      case 'title':
        comparison = a.data.title.localeCompare(b.data.title);
        break;
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });

  return sorted;
}

/**
 * 特定投稿の関連投稿を取得します
 *
 * @param currentSlug - 現在投稿のslug
 * @param limit - 最大関連投稿数
 * @returns 関連投稿配列
 *
 * @example
 * ```typescript
 * const related = await getRelatedPosts('ko/typescript-basics', 3);
 * ```
 */
export async function getRelatedPosts(
  currentSlug: string,
  limit = 3
): Promise<CollectionEntry<'blog'>[]> {
  const posts = await getBlogPosts();
  const currentPost = posts.find(p => p.id === currentSlug);

  if (!currentPost) {
    return [];
  }

  const currentTags = (currentPost.data.tags || []).map(t => t.toLowerCase());
  const language = currentSlug.split('/')[0] as SupportedLanguage;

  // 同じ言語、同じタグを持つ投稿を検索
  const related = posts
    .filter(post =>
      post.id !== currentSlug &&  // 自分自身を除外
      post.id.startsWith(`${language}/`) &&  // 同じ言語
      (post.data.tags || []).some(tag =>
        currentTags.includes(tag.toLowerCase())
      )  // タグの重複あり
    )
    .map(post => {
      // タグ重複数で関連性スコアを計算
      const postTags = (post.data.tags || []).map(t => t.toLowerCase());
      const commonTags = currentTags.filter(tag => postTags.includes(tag));
      return { post, score: commonTags.length };
    })
    .sort((a, b) => b.score - a.score)  // スコアの高い順
    .slice(0, limit)
    .map(({ post }) => post);

  return related;
}
```

#### 修正されたファイル: `src/pages/index.astro`

```astro
---
import { getRecentPosts } from '../utils/blog';

// リファクタリング前:
// const posts = (await getCollection('blog'))
//   .filter(post => post.id.startsWith('ko/'))
//   .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
//   .slice(0, 5);

// リファクタリング後:
const posts = await getRecentPosts('ko', 5);
---

<h2>最新投稿</h2>
{posts.map(post => (
  <article>
    <h3>{post.data.title}</h3>
  </article>
))}
```

#### 修正されたファイル: `src/pages/tags/[tag].astro`

```astro
---
import { getPostsByTag } from '../../utils/blog';

export async function getStaticPaths() {
  // ... タグリスト生成ロジック ...

  return Array.from(tagSet).map(tag => ({
    params: { tag },
    props: {
      // リファクタリング前: 複雑なフィルタリングロジック
      // リファクタリング後: 1行
      posts: await getPostsByTag(tag, 'ko'),
      tag,
    },
  }));
}

const { posts, tag } = Astro.props;
---
```

### 説明 (Explanation)

#### 1. 単一責任原則 (Single Responsibility Principle)

各関数は一つの明確な責任を持ちます:
- `getBlogPosts()`: 投稿のロードとキャッシング
- `getPostsByLanguage()`: 言語フィルタリング
- `getPostsByTag()`: タグフィルタリング
- `sortPosts()`: ソート

このように分離すると:
- **テスト容易性**: 各関数を独立してテスト
- **再利用性**: 必要な関数のみを組み合わせて使用
- **保守性**: バグ修正時に一箇所のみ変更

#### 2. 型安全性の強化

```typescript
export type SupportedLanguage = 'ko' | 'en' | 'ja' | 'zh';

// 使用時に自動補完と型チェック
const posts = await getPostsByLanguage('ko');  // ✓
const posts = await getPostsByLanguage('fr');  // ✗ コンパイルエラー
```

#### 3. キャッシングによるパフォーマンス最適化

```typescript
const postsCache = new Map<string, CollectionEntry<'blog'>[]>();

if (postsCache.has(cacheKey)) {
  return postsCache.get(cacheKey)!;  // キャッシュされた結果を即座に返す
}
```

ビルド時に複数のページで`getCollection('blog')`を繰り返し呼び出すと遅くなります。キャッシングで最初の呼び出し後に結果を再利用します。

#### 4. JSDocによるドキュメント化

```typescript
/**
 * 特定言語のブログ投稿を取得します
 *
 * @param language - 言語コード(ko, en, ja, zh)
 * @param options - 追加オプション(ソート、制限など)
 * @returns フィルタリングおよびソートされた投稿配列
 *
 * @example
 * ```typescript
 * const posts = await getPostsByLanguage('ko', { limit: 5 });
 * ```
 */
```

IDEで自動補完時にドキュメントが一緒に表示され、使用法を簡単に把握できます。

### バリエーション (Variations)

#### バリエーション1: 検索機能の追加

```typescript
/**
 * 投稿を検索します(タイトルと説明ベース)
 *
 * @param query - 検索語
 * @param language - 言語コード(オプション)
 * @returns 検索結果投稿配列
 */
export async function searchPosts(
  query: string,
  language?: SupportedLanguage
): Promise<CollectionEntry<'blog'>[]> {
  const normalizedQuery = query.toLowerCase();
  let posts = await getBlogPosts();

  if (language) {
    posts = posts.filter(post => post.id.startsWith(`${language}/`));
  }

  return posts.filter(post => {
    const title = post.data.title.toLowerCase();
    const description = post.data.description.toLowerCase();
    const tags = (post.data.tags || []).map(t => t.toLowerCase()).join(' ');

    return (
      title.includes(normalizedQuery) ||
      description.includes(normalizedQuery) ||
      tags.includes(normalizedQuery)
    );
  });
}
```

#### バリエーション2: ページネーションのサポート

```typescript
export interface PaginatedPosts {
  posts: CollectionEntry<'blog'>[];
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * ページネーションされた投稿を取得します
 */
export async function getPaginatedPosts(
  language: SupportedLanguage,
  page = 1,
  postsPerPage = 10
): Promise<PaginatedPosts> {
  const allPosts = await getPostsByLanguage(language, { sortOrder: 'desc' });
  const totalPages = Math.ceil(allPosts.length / postsPerPage);
  const start = (page - 1) * postsPerPage;
  const end = start + postsPerPage;

  return {
    posts: allPosts.slice(start, end),
    currentPage: page,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}
```

使用例:
```astro
---
// src/pages/blog/[page].astro
export async function getStaticPaths() {
  const language = 'ko';
  const postsPerPage = 10;
  const allPosts = await getPostsByLanguage(language);
  const totalPages = Math.ceil(allPosts.length / postsPerPage);

  return Array.from({ length: totalPages }, (_, i) => ({
    params: { page: String(i + 1) },
    props: await getPaginatedPosts(language, i + 1, postsPerPage),
  }));
}

const { posts, currentPage, totalPages, hasNext, hasPrev } = Astro.props;
---

<div class="pagination">
  {hasPrev && <a href={`/blog/${currentPage - 1}`}>前へ</a>}
  <span>{currentPage} / {totalPages}</span>
  {hasNext && <a href={`/blog/${currentPage + 1}`}>次へ</a>}
</div>
```

#### バリエーション3: 統計と分析関数

```typescript
/**
 * ブログ統計を返します
 */
export async function getBlogStats(language?: SupportedLanguage) {
  const posts = language
    ? await getPostsByLanguage(language)
    : await getBlogPosts();

  // タグ別投稿数
  const tagCounts = new Map<string, number>();
  posts.forEach(post => {
    (post.data.tags || []).forEach(tag => {
      const lower = tag.toLowerCase();
      tagCounts.set(lower, (tagCounts.get(lower) || 0) + 1);
    });
  });

  // 月別投稿数
  const monthCounts = new Map<string, number>();
  posts.forEach(post => {
    const month = post.data.pubDate.toISOString().slice(0, 7);  // YYYY-MM
    monthCounts.set(month, (monthCounts.get(month) || 0) + 1);
  });

  return {
    totalPosts: posts.length,
    totalTags: tagCounts.size,
    popularTags: Array.from(tagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10),
    postsByMonth: Array.from(monthCounts.entries())
      .sort((a, b) => b[0].localeCompare(a[0])),
    averageTagsPerPost: posts.reduce(
      (sum, post) => sum + (post.data.tags?.length || 0),
      0
    ) / posts.length,
  };
}
```

使用例:
```astro
---
// src/pages/stats.astro
import { getBlogStats } from '../utils/blog';

const stats = await getBlogStats('ko');
---

<h1>ブログ統計</h1>
<ul>
  <li>合計投稿: {stats.totalPosts}件</li>
  <li>合計タグ: {stats.totalTags}件</li>
  <li>投稿あたり平均タグ: {stats.averageTagsPerPost.toFixed(1)}件</li>
</ul>

<h2>人気タグ</h2>
{stats.popularTags.map(([tag, count]) => (
  <span>#{tag} ({count})</span>
))}
```

---

## 重要ポイント (Key Takeaways)

### Recipe 3.1: コード生成

- **明確な要件の提供**が重要です
- **コンテキスト → リクエスト → 検証 → 改善**のサイクルに従ってください
- 生成されたコードは常に**型チェックとビルドテスト**を経る必要があります

### Recipe 3.2: バグ修正

- **エラーメッセージと再現条件**を一緒に提供してください
- Claudeは**関連ファイルを探索しながら原因を分析**します
- **防御的プログラミングパターン**を適用して再発を防止してください

### Recipe 3.3: リファクタリングのリクエスト

- **重複コードの識別**がリファクタリングの始まりです
- **単一責任原則**に従うユーティリティ関数に分離してください
- **JSDocドキュメント化**でチームメンバーとの協業を改善してください

### 共通パターン

すべてのレシピで次のパターンが繰り返されます:

1. **問題の明確化**: 解決しようとする問題を具体的に説明
2. **コンテキストの提供**: Claudeがプロジェクト構造を理解できるように支援
3. **段階的改善**: 一度に完璧なコードよりも反復的な改善
4. **検証とテスト**: ビルドと型チェックで安定性を確保

### 次のステップ

Chapter 4ではより高度な機能を扱います:
- 複数ファイルにわたる複雑なリファクタリング
- テスト駆動開発(TDD)ワークフロー
- パフォーマンス最適化とプロファイリング
- サブエージェントを活用した専門的な作業

---

**サンプルコードリポジトリ**: この章のすべてのサンプルは[GitHubリポジトリ](https://github.com/example/claude-code-cookbook)で確認できます。

**フィードバック**: さらに知りたいレシピがあれば[イシューを残してください](https://github.com/example/claude-code-cookbook/issues)。
