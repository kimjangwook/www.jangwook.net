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

async function main() {
  const files = await collectHtmlFiles(distRoot);
  const annotations = new Map(); // url -> Set of hrefs it points to

  const relativeHrefs = [];
  for (const file of files) {
    const html = await fs.readFile(file, 'utf8');
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

  console.log('[hreflang-check] OK');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
