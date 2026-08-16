import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

// 빌드 결과물(dist/)의 문자열 언어 메타데이터 검증.
// 근거: W3C "Strings on the Web: Language and Direction Metadata" FPWD (2026-07-16)
//   - 문자열의 언어·방향은 메타데이터로 판정 가능해야 하며, 휴리스틱에 의존해서는 안 된다.
// 규칙:
// 1. 모든 HTML 페이지에 html[lang]이 있어야 한다.
// 2. 언어별 피드(rss-*.xml)에는 채널 <language>가 있어야 한다.
// 3. 4언어가 섞인 통합 피드(rss.xml)는 채널 <language> 대신
//    각 <item>이 자기 언어를 선언해야 한다 (dc:language). 개수는 item 수와 일치해야 한다.
// string-lang-dir-metadata-multilingual-web 글의 감사 스크립트를 게이트로 상설화한 것.

const distRoot = path.join(process.cwd(), 'dist');
const LANGS = ['ko', 'ja', 'en', 'zh'];

async function collectIndexHtml(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await collectIndexHtml(full)));
    else if (entry.name === 'index.html') files.push(full);
  }
  return files;
}

const errors = [];

async function checkHtmlLang() {
  const files = await collectIndexHtml(distRoot);
  const missing = [];
  for (const file of files) {
    const html = await fs.readFile(file, 'utf8');
    const openTag = html.match(/<html[^>]*>/);
    if (!openTag || !/\blang="[^"]+"/.test(openTag[0])) {
      missing.push(path.relative(distRoot, file));
    }
  }
  console.log(`html[lang]: ${files.length - missing.length}/${files.length} pages`);
  if (missing.length) {
    errors.push(`html[lang] 누락 ${missing.length}건: ${missing.slice(0, 5).join(', ')}`);
  }
}

async function checkPerLanguageFeeds() {
  for (const lang of LANGS) {
    const file = path.join(distRoot, `rss-${lang}.xml`);
    let xml;
    try {
      xml = await fs.readFile(file, 'utf8');
    } catch {
      errors.push(`rss-${lang}.xml 없음`);
      continue;
    }
    if (!xml.includes(`<language>${lang}</language>`)) {
      errors.push(`rss-${lang}.xml에 채널 <language>${lang}</language> 없음`);
    }
  }
  console.log(`per-language feeds: ${LANGS.length} checked`);
}

async function checkMixedFeed() {
  const file = path.join(distRoot, 'rss.xml');
  let xml;
  try {
    xml = await fs.readFile(file, 'utf8');
  } catch {
    errors.push('rss.xml 없음');
    return;
  }
  const items = (xml.match(/<item>/g) ?? []).length;
  const declared = (xml.match(/<dc:language>/g) ?? []).length;
  const unknown = [...xml.matchAll(/<dc:language>([^<]+)<\/dc:language>/g)]
    .map((m) => m[1])
    .filter((l) => !LANGS.includes(l));

  console.log(`mixed feed rss.xml: ${declared}/${items} items declare dc:language`);
  if (!xml.includes('xmlns:dc=')) errors.push('rss.xml에 dc 네임스페이스 선언 없음');
  if (declared !== items) {
    errors.push(`rss.xml: dc:language ${declared}건 / item ${items}건 — 불일치`);
  }
  if (unknown.length) {
    errors.push(`rss.xml: 알 수 없는 언어 태그 ${[...new Set(unknown)].join(', ')}`);
  }
}

await checkHtmlLang();
await checkPerLanguageFeeds();
await checkMixedFeed();

if (errors.length) {
  console.error('\n❌ string metadata 검증 실패');
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log('\n✅ string metadata 검증 통과');
