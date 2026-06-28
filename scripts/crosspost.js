#!/usr/bin/env node
/**
 * crosspost.js — Cross-post English blog posts to dev.to + Hashnode
 *
 * Usage: node scripts/crosspost.js <slug> [--dry-run] [--platform=all|devto|hashnode]
 *
 * Requires .env:
 *   DEVTO_API_KEY
 *   HASHNODE_API_KEY
 *   HASHNODE_PUBLICATION_ID
 *
 * Canonical URL points to: https://jangwook.net/en/blog/en/<slug>
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

// Load .env without dotenv dependency
const envPath = join(import.meta.dirname, '..', '.env');
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, 'utf-8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
}

const SITE_URL = 'https://jangwook.net';
const LOG_PATH = join(import.meta.dirname, '..', 'data', 'crosspost-log.json');

// --- CLI args ---
const args = process.argv.slice(2);
const slug = args.find(a => !a.startsWith('--'));
const dryRun = args.includes('--dry-run');
const platformArg = args.find(a => a.startsWith('--platform='));
const platform = platformArg ? platformArg.split('=')[1] : 'all';
const force = args.includes('--force');

if (!slug) {
  console.error('Usage: node scripts/crosspost.js <slug> [--dry-run] [--platform=all|devto|hashnode]');
  process.exit(1);
}

// --- Parse markdown ---
function parseArticle(slug) {
  const filePath = join(import.meta.dirname, '..', 'src', 'content', 'blog', 'en', `${slug}.md`);
  if (!existsSync(filePath)) {
    console.error(`English post not found: ${filePath}`);
    process.exit(1);
  }

  const raw = readFileSync(filePath, 'utf-8');
  const match = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  if (!match) {
    console.error('Failed to parse frontmatter');
    process.exit(1);
  }

  const frontmatter = match[1];
  const body = match[2].trim();

  // YAML 파싱 — 한 줄 스칼라 + 블록 스칼라(>- > | |- 등) 모두 지원.
  // (현행 영문 글은 description 에 folded scalar `>-` 를 쓰므로 한 줄 정규식으론 지시자만 잡힌다)
  const flines = frontmatter.split('\n');
  const getField = (key) => {
    for (let i = 0; i < flines.length; i++) {
      const m = flines[i].match(new RegExp(`^${key}:\\s*(.*)$`));
      if (!m) continue;
      let val = m[1].trim();
      // 블록 스칼라 지시자(>, |, 옵션 +/-)면 다음 들여쓰기 줄들을 본문으로 수집
      if (/^[>|][+-]?$/.test(val)) {
        const collected = [];
        let baseIndent = null;
        for (let j = i + 1; j < flines.length; j++) {
          if (flines[j].trim() === '') { collected.push(''); continue; }
          const indent = flines[j].match(/^(\s*)/)[1].length;
          if (indent === 0) break;                 // 다음 최상위 키 → 블록 종료
          if (baseIndent === null) baseIndent = indent;
          if (indent < baseIndent) break;
          collected.push(flines[j].slice(baseIndent));
        }
        const folded = val.startsWith('>');        // > 는 공백 결합, | 는 줄바꿈 보존
        return collected.join(folded ? ' ' : '\n').trim();
      }
      // 한 줄 스칼라: 둘러싼 따옴표 제거 + YAML 단일따옴표 이스케이프('' → ')
      val = val.replace(/^"(.*)"$/s, '$1').replace(/^'(.*)'$/s, '$1').replace(/''/g, "'");
      return val;
    }
    return '';
  };
  const getTags = () => {
    // 인라인: tags: [a, b]
    const inline = frontmatter.match(/^tags:\s*\[([^\]]*)\]/m);
    if (inline) {
      return inline[1].split(',').map(t => t.trim().replace(/["']/g, '')).filter(Boolean);
    }
    // 블록 리스트: tags:\n  - a\n  - b  (현행 글의 형식)
    const idx = flines.findIndex(l => /^tags:\s*$/.test(l));
    if (idx === -1) return [];
    const out = [];
    for (let j = idx + 1; j < flines.length; j++) {
      const m = flines[j].match(/^\s+-\s+(.+?)\s*$/);
      if (!m) break;                                  // 들여쓴 `- ` 항목이 끝나면 종료
      out.push(m[1].replace(/["']/g, '').trim());
    }
    return out.filter(Boolean);
  };

  return {
    slug,
    title: getField('title'),
    description: getField('description'),
    tags: getTags(),
    markdown_body: body,
    canonical_url: `${SITE_URL}/en/blog/en/${slug}`,
  };
}

// --- dev.to API ---
async function postToDevTo(article) {
  const apiKey = process.env.DEVTO_API_KEY;
  if (!apiKey) return { success: false, error: 'DEVTO_API_KEY not set' };

  // dev.to tags: max 4, alphanumeric only, max 30 chars
  const tags = article.tags
    .slice(0, 4)
    .map(t => t.toLowerCase().replace(/[^a-z0-9]/g, ''))
    .filter(t => t.length > 0 && t.length <= 30);

  const payload = {
    article: {
      title: article.title,
      body_markdown: article.markdown_body,
      published: true,
      canonical_url: article.canonical_url,
      description: article.description,
      tags,
    },
  };

  const res = await fetch('https://dev.to/api/articles', {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const bodyText = await res.text();
  if (res.ok) {
    // 2xx 라도 본문이 JSON 이 아닐 수 있다(안티봇/프록시 HTML) → throw 로 죽지 말고 실패 기록.
    try {
      const data = JSON.parse(bodyText);
      return { success: true, url: data.url, id: data.id };
    } catch {
      return { success: false, error: `HTTP ${res.status}: non-JSON 응답 (안티봇/프록시 추정)` };
    }
  }

  // 422 canonical-taken = 이미 발행됨 → 멱등 성공으로 처리(중복 발행 아님).
  if (res.status === 422 && /canonical url has already been taken/i.test(bodyText)) {
    return { success: true, alreadyExists: true, note: 'dev.to: canonical 이미 등록됨(기발행)' };
  }
  return { success: false, error: `HTTP ${res.status}: ${bodyText.slice(0, 300)}` };
}

// --- Hashnode API ---
async function postToHashnode(article) {
  const apiKey = process.env.HASHNODE_API_KEY;
  const publicationId = process.env.HASHNODE_PUBLICATION_ID;
  if (!apiKey) return { success: false, error: 'HASHNODE_API_KEY not set' };
  if (!publicationId) return { success: false, error: 'HASHNODE_PUBLICATION_ID not set' };

  const mutation = `
    mutation PublishPost($input: PublishPostInput!) {
      publishPost(input: $input) {
        post { id title url slug }
      }
    }
  `;

  const tags = article.tags.slice(0, 5).map(t => ({ name: t, slug: t }));

  const variables = {
    input: {
      title: article.title,
      contentMarkdown: article.markdown_body,
      publicationId,
      tags,
      originalArticleURL: article.canonical_url,
      slug: article.slug,
    },
  };

  const res = await fetch('https://gql.hashnode.com', {
    method: 'POST',
    headers: {
      Authorization: apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: mutation, variables }),
  });

  const errBody = await res.text();
  // HTML(비-JSON) 응답이면 전체 페이지를 덤프하지 말고 원인을 짚어준다.
  // 보통 API 키 무효/엔드포인트 변경/Cloudflare 안티봇 → 코드가 아니라 환경 문제.
  // 주의: Hashnode 는 2xx 로도 HTML 챌린지를 반환할 수 있어 res.ok 분기에서도 throw 가 났다
  // (스크립트 전체 Fatal → 로그 미기록). JSON 파싱을 try/catch 로 감싸 깔끔히 실패 기록한다.
  const looksHtml = /^\s*<(?:!doctype|html)/i.test(errBody);
  if (res.ok) {
    try {
      const data = JSON.parse(errBody);
      if (data.errors?.length > 0) {
        return { success: false, error: data.errors[0].message };
      }
      const post = data.data?.publishPost?.post;
      return { success: true, url: post?.url, id: post?.id };
    } catch {
      return { success: false, error: `HTTP ${res.status}: non-JSON(HTML) 200 응답 — HASHNODE_API_KEY 유효성/엔드포인트/안티봇(Cloudflare) 확인 필요` };
    }
  }
  const detail = looksHtml
    ? 'non-JSON(HTML) 응답 — HASHNODE_API_KEY 유효성/엔드포인트/안티봇(Cloudflare) 확인 필요'
    : errBody.slice(0, 300);
  return { success: false, error: `HTTP ${res.status}: ${detail}` };
}

// --- Dedup guard: 같은 slug 가 이미 해당 플랫폼에 성공 발행됐는지 (멱등 재실행/중복방지) ---
function alreadyPosted(slug, plat) {
  if (force || !existsSync(LOG_PATH)) return false;
  try {
    const log = JSON.parse(readFileSync(LOG_PATH, 'utf-8'));
    return log.some(e => e.slug === slug && e.results?.[plat]?.success === true);
  } catch { return false; }
}

// --- Log results ---
function logResults(slug, results) {
  let log = [];
  if (existsSync(LOG_PATH)) {
    try { log = JSON.parse(readFileSync(LOG_PATH, 'utf-8')); } catch { log = []; }
  }

  log.push({
    slug,
    canonical_url: `${SITE_URL}/en/blog/en/${slug}`,
    posted_at: new Date().toISOString(),
    results,
  });

  writeFileSync(LOG_PATH, JSON.stringify(log, null, 2) + '\n');
}

// --- Main ---
async function main() {
  const article = parseArticle(slug);

  console.log(`Article: ${article.title}`);
  console.log(`Canonical: ${article.canonical_url}`);
  console.log(`Tags: ${article.tags.join(', ')}`);
  console.log(`Body: ${article.markdown_body.length} chars`);
  console.log('');

  if (dryRun) {
    console.log(`[dry-run] Would cross-post to: ${platform === 'all' ? 'dev.to + Hashnode' : platform}`);
    process.exit(0);
  }

  const results = {};

  if (platform === 'all' || platform === 'devto') {
    if (alreadyPosted(slug, 'devto')) {
      console.log('  SKIP dev.to: 이미 발행됨 (--force 로 재발행)');
      results.devto = { success: true, skipped: true };
    } else {
      console.log('Posting to dev.to...');
      results.devto = await postToDevTo(article);
      if (results.devto.success) {
        console.log(`  OK dev.to: ${results.devto.url}`);
      } else {
        console.error(`  FAIL dev.to: ${results.devto.error}`);
      }
    }
  }

  if (platform === 'all' || platform === 'hashnode') {
    if (alreadyPosted(slug, 'hashnode')) {
      console.log('  SKIP Hashnode: 이미 발행됨 (--force 로 재발행)');
      results.hashnode = { success: true, skipped: true };
    } else {
      console.log('Posting to Hashnode...');
      results.hashnode = await postToHashnode(article);
      if (results.hashnode.success) {
        console.log(`  OK Hashnode: ${results.hashnode.url}`);
      } else {
        console.error(`  FAIL Hashnode: ${results.hashnode.error}`);
      }
    }
  }

  logResults(slug, results);

  const allOk = Object.values(results).every(r => r.success);
  process.exit(allOk ? 0 : 1);
}

main().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
