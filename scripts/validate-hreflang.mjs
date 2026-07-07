import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

// 빌드 결과물(dist/)의 hreflang 리시프로시티 검증.
// 규칙 (Google Search Central):
// 1. A가 B를 대체판으로 지목하면 B도 A를 지목해야 한다 (return link).
// 2. 각 페이지의 hreflang 목록에는 자기 자신이 포함되어야 한다 (self-reference).
// 3. href는 절대 URL이어야 한다.
// hreflang-reciprocity-audit-multilingual-2026 글의 검사기를 CI 게이트로 상설화한 것.

const distRoot = path.join(process.cwd(), 'dist');
const SITE = 'https://jangwook.net';

async function collectHtmlFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await collectHtmlFiles(fullPath));
    } else if (entry.name === 'index.html') {
      files.push(fullPath);
    }
  }
  return files;
}

function pageUrl(filePath) {
  const rel = path.relative(distRoot, path.dirname(filePath));
  return rel === '' ? `${SITE}/` : `${SITE}/${rel.split(path.sep).join('/')}/`;
}

function extractHreflangs(html) {
  const tags = [];
  const pattern = /<link\s+rel="alternate"\s+hreflang="([^"]+)"\s+href="([^"]+)"/g;
  let match;
  while ((match = pattern.exec(html)) !== null) {
    tags.push({ lang: match[1], href: match[2] });
  }
  return tags;
}

// 의도적으로 내부 링크 없이 운영하는 페이지 (직접 유입·외부 참조 전용)
const ORPHAN_ALLOWLIST = [
  /^https:\/\/jangwook\.net\/$/,            // 언어 선택 랜딩 (hreflang x-default 타깃)
  /^https:\/\/jangwook\.net\/deepdiner\//, // 앱 스토어용 독립 문서 (noindex)
];

function checkBrokenInternalLinks(files, htmlByFile) {
  // 빌드된 페이지·자산으로 해석되지 않는 내부 href를 경고.
  // 본문 코드 예시(<pre>/<code>) 안의 경로 문자열은 제외한다.
  const pages = new Set(files.map((f) => {
    const rel = path.relative(distRoot, path.dirname(f));
    return rel === '' ? '/' : `/${rel.split(path.sep).join('/')}/`;
  }));
  const broken = new Map();
  for (const file of files) {
    const src = pageUrl(file);
    const prose = htmlByFile.get(file)
      .replace(/<pre[\s\S]*?<\/pre>/g, '')
      .replace(/<code[\s\S]*?<\/code>/g, '');
    for (const match of prose.matchAll(/href="(\/[^"#?]+)"/g)) {
      const target = match[1];
      if (/\.[a-z0-9]+$/i.test(target)) continue; // 파일 자산(xml·webp 등)은 별도 존재 검증 대상 아님
      const dir = target.endsWith('/') ? target : `${target}/`;
      if (!pages.has(dir)) {
        if (!broken.has(target)) broken.set(target, src);
      }
    }
  }
  console.log(`[link-check] broken internal links: ${broken.size}`);
  if (broken.size > 0) {
    console.warn('Warning: 빌드된 페이지로 해석되지 않는 내부 링크:');
    let i = 0;
    for (const [target, src] of broken) {
      if (i++ >= 10) break;
      console.warn(`- ${target} (예: ${src})`);
    }
  }
  return broken;
}

function checkOrphans(files, htmlByFile) {
  const pages = new Map(files.map((f) => [pageUrl(f), f]));
  const inbound = new Map();
  for (const [url, file] of pages) {
    const html = htmlByFile.get(file);
    for (const match of html.matchAll(/href="(\/[^"#?]*)/g)) {
      let target = match[1];
      if (!target.endsWith('/')) target += '/';
      const abs = `${SITE}${target}`;
      if (pages.has(abs) && abs !== url) inbound.set(abs, (inbound.get(abs) ?? 0) + 1);
    }
  }
  const orphans = [...pages.keys()].filter(
    (url) => !inbound.has(url) && !ORPHAN_ALLOWLIST.some((re) => re.test(url))
  );
  console.log(`[orphan-check] pages: ${pages.size}, orphans (allowlist 제외): ${orphans.length}`);
  if (orphans.length > 0) {
    console.warn('Warning: 내부 링크가 0개인 페이지 (사이트맵 외 도달 불가):');
    for (const url of orphans.slice(0, 10)) console.warn(`- ${url}`);
  }
  return orphans;
}

async function main() {
  const files = await collectHtmlFiles(distRoot);
  const annotations = new Map(); // url -> Set of hrefs it points to

  const relativeHrefs = [];
  const htmlByFile = new Map();
  for (const file of files) {
    const html = await fs.readFile(file, 'utf8');
    htmlByFile.set(file, html);
    const tags = extractHreflangs(html);
    if (tags.length === 0) continue;
    const url = pageUrl(file);
    const targets = new Set();
    for (const { href } of tags) {
      if (!/^https?:\/\//.test(href)) relativeHrefs.push(`${url} -> ${href}`);
      targets.add(href.endsWith('/') || /\.[a-z]+$/.test(href) ? href : `${href}/`);
    }
    annotations.set(url, targets);
  }

  const missingSelf = [];
  const brokenPairs = [];

  for (const [url, targets] of annotations) {
    if (!targets.has(url)) missingSelf.push(url);
    for (const target of targets) {
      if (target === url) continue;
      const back = annotations.get(target);
      if (back && !back.has(url)) {
        brokenPairs.push(`${url} -> ${target} (return link 없음)`);
      }
      // target이 dist에 없으면(외부 등) 판단 불가로 스킵
    }
  }

  console.log(`[hreflang-check] annotated pages: ${annotations.size}`);
  console.log(`[hreflang-check] self-reference missing: ${missingSelf.length}`);
  console.log(`[hreflang-check] broken return-link pairs: ${brokenPairs.length}`);
  console.log(`[hreflang-check] relative hrefs: ${relativeHrefs.length}`);

  const failures = [...missingSelf.map((u) => `self-reference 누락: ${u}`), ...brokenPairs, ...relativeHrefs];
  if (failures.length > 0) {
    console.error('\nErrors:');
    console.error(failures.slice(0, 20).map((f) => `- ${f}`).join('\n'));
    if (failures.length > 20) console.error(`...and ${failures.length - 20} more`);
    process.exit(1);
  }

  checkOrphans(files, htmlByFile);
  checkBrokenInternalLinks(files, htmlByFile);

  console.log('[hreflang-check] OK');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
