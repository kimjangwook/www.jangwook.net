import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import matter from 'gray-matter';

const repoRoot = process.cwd();
const contentRoot = path.join(repoRoot, 'src/content/blog');
const assetsRoot = path.join(repoRoot, 'src/assets/blog');
const languages = ['ko', 'en', 'ja', 'zh'];
const todayJst = toJstDateKey(new Date());

const errors = [];
const warnings = [];

function toJstDateKey(date) {
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

function normalizeDateKey(value, filePath) {
  if (!value) {
    errors.push(`${filePath}: missing pubDate`);
    return null;
  }

  if (value instanceof Date) {
    return toJstDateKey(value);
  }

  const stringValue = String(value).trim();
  const dateOnly = stringValue.match(/^(\d{4}-\d{2}-\d{2})/);
  if (dateOnly) return dateOnly[1];

  const parsed = new Date(stringValue);
  if (Number.isNaN(parsed.valueOf())) {
    errors.push(`${filePath}: invalid pubDate "${stringValue}"`);
    return null;
  }

  return toJstDateKey(parsed);
}

async function collectPostFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await collectPostFiles(fullPath));
    } else if (/\.(md|mdx)$/.test(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
}

async function fileExists(filePath) {
  try {
    const stat = await fs.stat(filePath);
    return stat.isFile();
  } catch {
    return false;
  }
}

function repoRelative(filePath) {
  return path.relative(repoRoot, filePath);
}

function resolveLocalContentRef(contentFile, ref) {
  if (!ref || /^https?:\/\//.test(ref) || ref.startsWith('/')) {
    return null;
  }

  const cleanRef = ref.split('#')[0].split('?')[0];
  return path.resolve(path.dirname(contentFile), cleanRef);
}

function extractMarkdownImages(body) {
  const images = [];
  const imagePattern = /!\[[^\]]*\]\(([^)]+)\)/g;
  let match;

  while ((match = imagePattern.exec(body)) !== null) {
    images.push(match[1]);
  }

  return images;
}

function limitList(items, limit = 12) {
  if (items.length <= limit) return items.join('\n');
  return `${items.slice(0, limit).join('\n')}\n...and ${items.length - limit} more`;
}

async function loadPosts() {
  const posts = [];

  for (const lang of languages) {
    const langDir = path.join(contentRoot, lang);
    const files = await collectPostFiles(langDir);

    for (const file of files) {
      const raw = await fs.readFile(file, 'utf8');
      const parsed = matter(raw);
      const relPath = repoRelative(file);
      const pubDateKey = normalizeDateKey(parsed.data.pubDate, relPath);
      const slug = path.basename(file).replace(/\.(md|mdx)$/, '');
      const draft = parsed.data.draft === true;
      const noindex = parsed.data.noindex === true;
      const published = Boolean(pubDateKey && !draft && pubDateKey <= todayJst);
      const indexable = published && !noindex;
      // 코드 펜스 내부의 ## 주석·이미지 예제가 구조 지표를 오염시키지 않도록 제거 후 계산
      const mermaidCount = (parsed.content.match(/```mermaid/g) || []).length;
      const proseOnly = parsed.content.replace(/^(`{3,})[\s\S]*?^\1`*\s*$/gm, '');
      const markdownImages = extractMarkdownImages(proseOnly);
      const h2Count = (proseOnly.match(/^## /gm) || []).length;
      const tableLineCount = (proseOnly.match(/^\|.*\|$/gm) || []).length;

      posts.push({
        lang,
        slug,
        file,
        relPath,
        data: parsed.data,
        pubDateKey,
        draft,
        noindex,
        published,
        indexable,
        markdownImages,
        h2Count,
        mermaidCount,
        tableLineCount,
      });
    }
  }

  return posts;
}

async function validateImages(posts) {
  const singleImagePosts = [];

  for (const post of posts.filter((item) => item.indexable)) {
    const heroImage = post.data.heroImage;
    if (!heroImage) {
      warnings.push(`${post.relPath}: missing heroImage`);
    } else if (typeof heroImage === 'string') {
      const heroPath = resolveLocalContentRef(post.file, heroImage);
      if (heroPath && !await fileExists(heroPath)) {
        errors.push(`${post.relPath}: heroImage does not exist at ${repoRelative(heroPath)}`);
      }
    }

    const localImages = post.markdownImages
      .map((ref) => resolveLocalContentRef(post.file, ref))
      .filter(Boolean);

    for (const imagePath of localImages) {
      if (!await fileExists(imagePath)) {
        errors.push(`${post.relPath}: markdown image does not exist at ${repoRelative(imagePath)}`);
      }
    }

    // 전략 기준: 본문에 시각적 보조 자료(이미지·mermaid·표)가 하나도 없으면 경고.
    // 히어로만 있는 글이라도 다이어그램·표가 있으면 품질 기준 충족으로 본다.
    if (localImages.length === 0 && post.mermaidCount === 0 && post.tableLineCount === 0) {
      singleImagePosts.push(`${post.lang}/${post.slug}`);
    }
  }

  if (singleImagePosts.length > 0) {
    warnings.push(
      `indexable posts with no supporting visuals (image/diagram/table): ${singleImagePosts.length}\n${limitList(singleImagePosts)}`
    );
  }
}

function validateLanguageParity(posts) {
  const byLang = Object.fromEntries(languages.map((lang) => [lang, {
    total: 0,
    published: 0,
    indexable: 0,
  }]));

  for (const post of posts) {
    byLang[post.lang].total += 1;
    if (post.published) byLang[post.lang].published += 1;
    if (post.indexable) byLang[post.lang].indexable += 1;
  }

  for (const key of ['published', 'indexable']) {
    const counts = languages.map((lang) => byLang[lang][key]);
    if (new Set(counts).size !== 1) {
      errors.push(`${key} post counts differ by language: ${JSON.stringify(byLang)}`);
    }
  }

  const indexableBySlug = new Map();
  for (const post of posts.filter((item) => item.indexable)) {
    if (!indexableBySlug.has(post.slug)) {
      indexableBySlug.set(post.slug, new Set());
    }
    indexableBySlug.get(post.slug).add(post.lang);
  }

  for (const [slug, langs] of indexableBySlug) {
    const missing = languages.filter((lang) => !langs.has(lang));
    if (missing.length > 0) {
      errors.push(`${slug}: missing indexable language versions: ${missing.join(', ')}`);
    }
  }

  return byLang;
}

function validateRelatedPosts(posts) {
  const missingRelated = posts
    .filter((post) => post.indexable)
    .filter((post) => !Array.isArray(post.data.relatedPosts) || post.data.relatedPosts.length === 0)
    .map((post) => `${post.lang}/${post.slug}`);

  if (missingRelated.length > 0) {
    warnings.push(
      `indexable posts missing relatedPosts: ${missingRelated.length}\n${limitList(missingRelated)}`
    );
  }

  const indexableSlugsByLang = new Map(languages.map((lang) => [lang, new Set()]));
  for (const post of posts.filter((item) => item.indexable)) {
    indexableSlugsByLang.get(post.lang).add(post.slug);
  }

  for (const post of posts.filter((item) => item.indexable)) {
    const related = Array.isArray(post.data.relatedPosts) ? post.data.relatedPosts : [];
    for (const rec of related) {
      if (!rec?.slug) continue;
      if (!indexableSlugsByLang.get(post.lang).has(rec.slug)) {
        errors.push(`${post.relPath}: relatedPosts references non-indexable post "${rec.slug}" (draft/noindex/future/missing)`);
      }
    }
  }
}

function validateTranslationParity(posts) {
  const bySlug = new Map();
  for (const post of posts.filter((item) => item.indexable)) {
    if (!bySlug.has(post.slug)) bySlug.set(post.slug, new Map());
    bySlug.get(post.slug).set(post.lang, post);
  }

  const drifted = [];
  for (const [slug, byLang] of bySlug) {
    if (byLang.size < languages.length) continue; // 언어 누락은 별도 에러로 잡힌다
    const counts = languages.map((lang) => {
      const post = byLang.get(lang);
      return { h2: post.h2Count, imgs: post.markdownImages.length, mermaid: post.mermaidCount };
    });
    const spread = (key) => {
      const values = counts.map((c) => c[key]);
      return Math.max(...values) - Math.min(...values);
    };
    if (spread('h2') > 0 || spread('imgs') > 0 || spread('mermaid') > 0) {
      drifted.push(
        `${slug} (h2 ${counts.map((c) => c.h2).join('/')}, imgs ${counts.map((c) => c.imgs).join('/')}, mermaid ${counts.map((c) => c.mermaid).join('/')})`
      );
    }
  }

  if (drifted.length > 0) {
    warnings.push(
      `translation structure drift (${languages.join('/')}): ${drifted.length}\n${limitList(drifted)}`
    );
  }
}

async function validateCrawlerSurfaces() {
  const rssFiles = [
    'src/pages/rss.xml.js',
    'src/pages/rss-ko.xml.js',
    'src/pages/rss-en.xml.js',
    'src/pages/rss-ja.xml.js',
    'src/pages/rss-zh.xml.js',
  ];
  const sitemapFiles = [
    'src/pages/sitemap-ko.xml.ts',
    'src/pages/sitemap-en.xml.ts',
    'src/pages/sitemap-ja.xml.ts',
    'src/pages/sitemap-zh.xml.ts',
  ];

  for (const file of [...rssFiles, ...sitemapFiles]) {
    const source = await fs.readFile(path.join(repoRoot, file), 'utf8');
    if (!source.includes('filterIndexablePosts')) {
      errors.push(`${file}: must use filterIndexablePosts before exposing URLs to crawlers`);
    }
  }

  const baseHead = await fs.readFile(path.join(repoRoot, 'src/components/BaseHead.astro'), 'utf8');
  if (!baseHead.includes('enableAds') || !baseHead.includes('{enableAds &&')) {
    errors.push('src/components/BaseHead.astro: AdSense script must be gated by enableAds');
  }

  const notFoundPage = await fs.readFile(path.join(repoRoot, 'src/pages/404.astro'), 'utf8');
  if (!notFoundPage.includes('noindex={true}')) {
    errors.push('src/pages/404.astro: 404 page must set noindex={true}');
  }
}

async function main() {
  const posts = await loadPosts();
  const counts = validateLanguageParity(posts);

  await validateImages(posts);
  validateRelatedPosts(posts);
  validateTranslationParity(posts);
  await validateCrawlerSurfaces();

  const hiddenPastPosts = posts.filter((post) => post.pubDateKey && post.pubDateKey <= todayJst && (post.draft || post.noindex));

  console.log('[publishing-check] JST today:', todayJst);
  console.log('[publishing-check] posts by language:', JSON.stringify(counts));
  console.log('[publishing-check] past draft/noindex posts kept out of feeds:', hiddenPastPosts.length);
  console.log('[publishing-check] assets root:', repoRelative(assetsRoot));

  if (warnings.length > 0) {
    console.warn('\nWarnings:');
    console.warn(warnings.map((warning) => `- ${warning}`).join('\n'));
  }

  if (errors.length > 0) {
    console.error('\nErrors:');
    console.error(errors.map((error) => `- ${error}`).join('\n'));
    process.exit(1);
  }

  console.log('[publishing-check] OK');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
