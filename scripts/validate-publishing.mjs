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
        content: parsed.content,
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

function validateSharedFrontmatterParity(posts) {
  // FACT-CORE 정책의 명시 불변식: slug·pubDate·heroImage·relatedPosts는 4언어 동일.
  // (slug·pubDate 불일치는 기존 언어별 발행 수 검사가 잡으므로 여기선 나머지 둘을 본다.)
  const bySlug = new Map();
  for (const post of posts.filter((item) => item.indexable)) {
    if (!bySlug.has(post.slug)) bySlug.set(post.slug, new Map());
    bySlug.get(post.slug).set(post.lang, post);
  }
  const mismatches = [];
  for (const [slug, byLang] of bySlug) {
    if (byLang.size < languages.length) continue;
    const heroes = new Set(languages.map((lang) => String(byLang.get(lang).data.heroImage ?? '')));
    if (heroes.size > 1) mismatches.push(`${slug}: heroImage가 언어별로 다름`);
    const relatedKeys = new Set(languages.map((lang) => {
      const related = byLang.get(lang).data.relatedPosts;
      return Array.isArray(related) ? related.map((r) => r?.slug).join(',') : '';
    }));
    if (relatedKeys.size > 1) mismatches.push(`${slug}: relatedPosts 목록이 언어별로 다름`);
  }
  if (mismatches.length > 0) {
    warnings.push(`shared frontmatter parity (FACT-CORE 불변식): ${mismatches.length}\n${limitList(mismatches)}`);
  }
}

function validateTitleLengths(posts) {
  // SERP 절단 방지: seo-guidelines.md의 언어별 권장 상한 + 현실 코퍼스 여유분.
  // 기준 초과는 경고 — 신규 자동발행 글의 이탈을 빌드 로그에서 즉시 노출한다.
  const TITLE_MAX = { ko: 65, en: 70, ja: 66, zh: 65 };
  const DESC_MAX = 220;
  const offenders = [];
  for (const post of posts.filter((item) => item.indexable)) {
    const title = String(post.data.title ?? '');
    const desc = String(post.data.description ?? '');
    if (title.length > (TITLE_MAX[post.lang] ?? 70)) {
      offenders.push(`${post.lang}/${post.slug}: title ${title.length}자`);
    }
    if (desc.length > DESC_MAX) {
      offenders.push(`${post.lang}/${post.slug}: description ${desc.length}자`);
    }
  }
  if (offenders.length > 0) {
    warnings.push(`title/description over length: ${offenders.length}\n${limitList(offenders)}`);
  }
}

// 2026-07-14: 번역 구조 패리티 검사(validateTranslationParity) 은퇴.
// 번역 시대(〜2026-07-07) 계약이었던 언어 간 구조 동형성은 FACT-CORE TRANSCREATION
// 정책(언어판 독립 집필)과 전량 재발행으로 사문화됨. 살아 있는 계약은
// validateSharedFrontmatterParity(heroImage·relatedPosts 4언어 동일)가 담당한다.

// 2026-07-27 ⑤: 직접 인용 축자 위반 3회 재발(07-23 생성 날조·07-25 귀속·07-27 QA 재작성)의 구조 처방.
// 원문 축자를 주장하는 블록인용("그대로 옮기면"/verbatim/そのまま引く/原文照录 등)에는
// 검증 가능한 출처 URL이 인용 바로 곁에 있어야 한다. 없으면 독자도 다음 리뷰어도 축자 대조가
// 불가능하므로(=날조가 통과하는 노출면) 빌드를 막는다. 게이트는 '링크 존재'만 결정론적으로
// 오프라인 검사한다 — 축자 '일치' 여부는 생성/QA 단계의 WebFetch 대조 책임(SKILL·write-post).
const VERBATIM_CLAIM = /그대로 옮기|원문 그대로|한 자 그대로|그대로 인용|원문을 그대로|공식 문서의 표현을|공식 문서를 그대로|原文のまま|原文どおり|そのまま(引|載|転|記)|表現をそのまま|逐語|逐字|原样|照录|照搬|documentation verbatim|\bverbatim\b|word[- ]for[- ]word|quote it directly|the official (docs|documentation)[^.\n]{0,40}(reads|says|states)|here'?s the official (docs|documentation)/i;

function validateVerbatimCitations(posts) {
  const LINK = /https?:\/\//;
  for (const post of posts) {
    const lines = post.content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (!VERBATIM_CLAIM.test(lines[i])) continue;
      // 축자 주장 문장 다음 3줄 이내에 블록인용(>)이 오는 경우만 대상
      let bqStart = -1;
      for (let j = i + 1; j <= i + 3 && j < lines.length; j++) {
        if (/^\s*>/.test(lines[j])) { bqStart = j; break; }
      }
      if (bqStart < 0) continue;
      let bqEnd = bqStart;
      while (bqEnd + 1 < lines.length && /^\s*>/.test(lines[bqEnd + 1])) bqEnd++;
      // 검사 범위: 도입문 ~ 블록인용 + 바로 다음 출처행 1줄
      const scope = lines.slice(i, bqEnd + 2).join('\n');
      if (!LINK.test(scope)) {
        const claim = lines[i].trim().slice(0, 48);
        errors.push(`${post.relPath}: 축자 인용 블록에 인접 출처 링크 없음 ("${claim}...") — 원문 URL을 인용 곁에 넣거나, 대조 불가 시 의역+링크로 강등`);
      }
    }
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

  // Mediavine 독점 요건(2026-08-10): AdSense 등 타 프로그래매틱 파트너 코드가
  // 남아 있으면 Mediavine 런칭이 차단되므로 재유입 자체를 빌드에서 막는다.
  const baseHead = await fs.readFile(path.join(repoRoot, 'src/components/BaseHead.astro'), 'utf8');
  if (baseHead.includes('adsbygoogle') || baseHead.includes('ca-pub-') || baseHead.includes('google-adsense-account')) {
    errors.push('src/components/BaseHead.astro: AdSense code must be removed (Mediavine exclusivity)');
  }
  if (!baseHead.includes('scripts.scriptwrapper.com')) {
    errors.push('src/components/BaseHead.astro: Mediavine script tag is missing');
  }

  const notFoundPage = await fs.readFile(path.join(repoRoot, 'src/pages/404.astro'), 'utf8');
  if (!notFoundPage.includes('noindex={true}')) {
    errors.push('src/pages/404.astro: 404 page must set noindex={true}');
  }
}

async function validateTestFlag() {
  // TEST_FLG=true는 dev 서버의 미래글 미리보기 전용.
  // 프로덕션 빌드에 섞이면 draft 전체(~1,000페이지)가 라이브로 새는 사고가 되므로
  // (2026-06-14 실제 발생 이력) 빌드 자체를 차단한다.
  const envFlag = process.env.TEST_FLG;
  let fileFlag;
  try {
    const envFile = await fs.readFile(path.join(repoRoot, '.env'), 'utf8');
    fileFlag = envFile.match(/^TEST_FLG=(.*)$/m)?.[1]?.trim();
  } catch {
    fileFlag = undefined; // .env 없음(CI 등)은 정상
  }
  if (envFlag === 'true' || fileFlag === 'true') {
    errors.push('TEST_FLG=true 상태로 빌드 시도 — draft·미래글이 전부 노출됩니다. 미리보기는 `TEST_FLG=true npm run dev`를 사용하세요.');
  }
}

async function main() {
  await validateTestFlag();
  const posts = await loadPosts();
  const counts = validateLanguageParity(posts);

  await validateImages(posts);
  validateRelatedPosts(posts);
  validateTitleLengths(posts);
  validateSharedFrontmatterParity(posts);
  validateVerbatimCitations(posts);
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
