#!/usr/bin/env node
/**
 * audit-text-fragments.mjs
 *
 * Checks whether sentences on the built site can be turned into working
 * text-fragment deep links (`#:~:text=`), the URL form an AI answer or a
 * search result would use to point at the exact sentence it quoted.
 *
 * Two passes:
 *   1. static  — split each block into sentences, then flag the three things
 *                that break a bare text directive: the quote spanning more
 *                than one block, an end that is not on a word boundary
 *                (Intl.Segmenter, per-locale), and the same sentence
 *                appearing more than once on the page.
 *   2. browser — replay a sample of those directives in Chromium by clicking
 *                a real link (text directives need user activation) and
 *                reading window.scrollY. Any scroll means the directive
 *                resolved to a target.
 *
 * Spec: https://wicg.github.io/scroll-to-text-fragment/
 *
 * Usage:
 *   node scripts/audit-text-fragments.mjs [--pages 6] [--probes 80] [--no-browser]
 */

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, extname } from 'node:path';
import http from 'node:http';
import { JSDOM } from 'jsdom';

const argv = process.argv.slice(2);
const arg = (name, dflt) => {
  const i = argv.indexOf(`--${name}`);
  return i === -1 ? dflt : Number(argv[i + 1]);
};
const PER_LANG = arg('pages', 6);
const PROBE_LIMIT = arg('probes', 80);
const RUN_BROWSER = !argv.includes('--no-browser');
const PORT = 8932;

const LANGS = ['ko', 'ja', 'en', 'zh'];
const DIST = join(process.cwd(), 'dist');
// Leaf block containers. A text directive parameter cannot cross one of these.
const BLOCK = new Set(['P', 'LI', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'TD', 'TH',
  'BLOCKQUOTE', 'FIGCAPTION', 'DT', 'DD', 'PRE', 'SUMMARY', 'DIV']);
// Rough sentence splitters and a per-language floor for "long enough to be a quote".
const SENTENCE = { en: /(?<=[.!?])\s+/, ko: /(?<=[.!?다])\s+/, ja: /(?<=[。！？])/, zh: /(?<=[。！？])/ };
const MIN_LEN = { en: 60, ko: 30, ja: 24, zh: 22 };

function samplePages(lang) {
  const base = join(DIST, lang, 'blog', lang);
  const found = readdirSync(base, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => join(base, d.name, 'index.html'))
    .sort();
  const step = Math.max(1, Math.floor(found.length / PER_LANG));
  return Array.from({ length: Math.min(PER_LANG, found.length) }, (_, i) => found[i * step]);
}

function leafBlocks(file) {
  const doc = new JSDOM(readFileSync(file, 'utf8')).window.document;
  const root = doc.querySelector('article') || doc.body;
  root.querySelectorAll('script,style,nav,header,footer,aside').forEach((n) => n.remove());
  const blocks = [];
  const walk = (el) => {
    for (const child of el.children) {
      const hasBlockChild = Array.from(child.children).some((c) => BLOCK.has(c.tagName));
      if (BLOCK.has(child.tagName) && !hasBlockChild) {
        const text = child.textContent.replace(/\s+/g, ' ').trim();
        if (text) blocks.push({ tag: child.tagName, text });
      } else {
        walk(child);
      }
    }
  };
  walk(root);
  return blocks;
}

const segmenters = {};
function boundarySet(text, locale) {
  const seg = (segmenters[locale] ||= new Intl.Segmenter(locale, { granularity: 'word' }));
  const set = new Set([0, text.length]);
  for (const s of seg.segment(text)) {
    set.add(s.index);
    set.add(s.index + s.segment.length);
  }
  return set;
}

function auditPage(lang, file) {
  const blocks = leafBlocks(file);
  const flat = blocks.map((b) => b.text).join(' ');
  const bounds = boundarySet(flat, lang);
  const url = '/' + file.replace(DIST + '/', '').replace(/index\.html$/, '');
  const row = { url, lang, blocks: blocks.length, sentences: 0, duplicated: 0, notWordAligned: 0, citable: 0 };
  const candidates = [];

  for (const block of blocks) {
    for (const raw of block.text.split(SENTENCE[lang])) {
      const q = raw.trim();
      if (q.length < MIN_LEN[lang] || q.length > 220) continue;
      const occurrences = flat.split(q).length - 1;
      const at = flat.indexOf(q);
      const aligned = bounds.has(at) && bounds.has(at + q.length);
      row.sentences++;
      if (occurrences > 1) row.duplicated++;
      if (!aligned) row.notWordAligned++;
      if (aligned && occurrences === 1) row.citable++;
      candidates.push({ url, lang, q, tag: block.tag, occurrences, aligned });
    }
  }
  return { row, candidates };
}

const rows = [];
const candidates = [];
for (const lang of LANGS) {
  for (const file of samplePages(lang)) {
    const { row, candidates: c } = auditPage(lang, file);
    rows.push(row);
    candidates.push(...c);
  }
}

const agg = {};
for (const r of rows) {
  const a = (agg[r.lang] ||= { pages: 0, blocks: 0, sentences: 0, duplicated: 0, notWordAligned: 0, citable: 0 });
  a.pages++;
  for (const k of ['blocks', 'sentences', 'duplicated', 'notWordAligned', 'citable']) a[k] += r[k];
}
console.log('lang  pages  blocks  sentences  duplicated  notWordAligned  citable');
for (const [lang, a] of Object.entries(agg)) {
  console.log(`${lang.padEnd(5)} ${String(a.pages).padStart(5)} ${String(a.blocks).padStart(7)} ` +
    `${String(a.sentences).padStart(10)} ${String(a.duplicated).padStart(11)} ` +
    `${String(a.notWordAligned).padStart(15)} ${String(a.citable).padStart(8)}`);
}

let probes = [];
if (RUN_BROWSER) {
  const { chromium } = await import('playwright');
  // Take a spread of unique prose, repeated prose, and code-block quotes.
  const pick = (fn, n) => candidates.filter(fn).filter((_, i) => i % 7 === 0).slice(0, n);
  probes = [
    ...pick((c) => c.occurrences === 1 && c.tag !== 'PRE', Math.round(PROBE_LIMIT * 0.6)),
    ...pick((c) => c.occurrences > 1, Math.round(PROBE_LIMIT * 0.2)),
    ...pick((c) => c.tag === 'PRE', Math.round(PROBE_LIMIT * 0.2)),
  ];

  const server = http.createServer((req, res) => {
    let p = join(DIST, decodeURIComponent(req.url.split('#')[0].split('?')[0]));
    if (!extname(p)) p = join(p, 'index.html');
    try {
      const body = readFileSync(p);
      res.writeHead(200, { 'Content-Type': extname(p) === '.html' ? 'text/html; charset=utf-8' : 'text/plain' });
      res.end(body);
    } catch {
      res.writeHead(404);
      res.end('');
    }
  });
  await new Promise((r) => server.listen(PORT, r));

  const browser = await chromium.launch();
  const page = await (await browser.newContext({ viewport: { width: 1280, height: 800 } })).newPage();
  for (const probe of probes) {
    // Dash, comma and ampersand are directive syntax, so they have to stay encoded.
    const directive = encodeURIComponent(probe.q).replace(/-/g, '%2D');
    const href = `http://localhost:${PORT}${probe.url}#:~:text=${directive}`;
    await page.goto(`http://localhost:${PORT}/404.html`).catch(() => {});
    await page.evaluate((h) => {
      const a = document.createElement('a');
      a.id = 'tf-go';
      a.href = h;
      a.textContent = 'go';
      document.body.prepend(a);
    }, href);
    await page.click('#tf-go');                 // click, not goto: directives need user activation
    await page.waitForLoadState('load');
    await page.waitForTimeout(220);
    probe.scrollY = await page.evaluate(() => Math.round(window.scrollY));
    probe.matched = probe.scrollY > 0;
  }
  await browser.close();
  server.close();

  const group = (label, fn) => {
    const g = probes.filter(fn);
    if (g.length) console.log(`  ${label.padEnd(22)} n=${String(g.length).padStart(3)}  matched=${g.filter((p) => p.matched).length}`);
  };
  console.log(`\nbrowser: ${probes.filter((p) => p.matched).length}/${probes.length} directives resolved`);
  group('unique prose', (p) => p.occurrences === 1 && p.tag !== 'PRE');
  group('repeated prose', (p) => p.occurrences > 1);
  group('code block (PRE)', (p) => p.tag === 'PRE');
}

writeFileSync('data/text-fragment-audit.json', JSON.stringify({ agg, rows, probes }, null, 2));
console.log('\nwrote data/text-fragment-audit.json');
