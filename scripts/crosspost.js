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

  // Simple YAML parsing for the fields we need
  const getField = (key) => {
    const m = frontmatter.match(new RegExp(`^${key}:\\s*["']?(.+?)["']?\\s*$`, 'm'));
    return m ? m[1] : '';
  };
  const getTags = () => {
    const m = frontmatter.match(/^tags:\s*\[([^\]]*)\]/m);
    if (!m) return [];
    return m[1].split(',').map(t => t.trim().replace(/["']/g, '')).filter(Boolean);
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

  if (res.ok) {
    const data = await res.json();
    return { success: true, url: data.url, id: data.id };
  }

  const errBody = await res.text();
  return { success: false, error: `HTTP ${res.status}: ${errBody}` };
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

  if (res.ok) {
    const data = await res.json();
    if (data.errors?.length > 0) {
      return { success: false, error: data.errors[0].message };
    }
    const post = data.data?.publishPost?.post;
    return { success: true, url: post?.url, id: post?.id };
  }

  return { success: false, error: `HTTP ${res.status}` };
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
    console.log('Posting to dev.to...');
    results.devto = await postToDevTo(article);
    if (results.devto.success) {
      console.log(`  OK dev.to: ${results.devto.url}`);
    } else {
      console.error(`  FAIL dev.to: ${results.devto.error}`);
    }
  }

  if (platform === 'all' || platform === 'hashnode') {
    console.log('Posting to Hashnode...');
    results.hashnode = await postToHashnode(article);
    if (results.hashnode.success) {
      console.log(`  OK Hashnode: ${results.hashnode.url}`);
    } else {
      console.error(`  FAIL Hashnode: ${results.hashnode.error}`);
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
