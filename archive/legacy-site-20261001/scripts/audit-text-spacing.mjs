#!/usr/bin/env node
/**
 * WCAG 2.1/2.2 SC 1.4.12 Text Spacing audit.
 *
 * axe-core's `avoid-inline-spacing` rule only checks whether an inline style
 * uses `!important` on the four spacing properties. It never applies the
 * spacing and never looks at what happens to the layout afterwards.
 * This script does the second half: it injects the exact four overrides the
 * success criterion names, then measures content loss.
 *
 * Usage:
 *   node scripts/audit-text-spacing.mjs [--base http://127.0.0.1:4322] [--json out.json]
 */

import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile, stat, writeFile } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const DIST = join(ROOT, 'dist');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml; charset=utf-8',
};

async function serveDist(port) {
  const server = createServer(async (req, res) => {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    let file = normalize(join(DIST, p));
    if (!file.startsWith(DIST)) {
      res.writeHead(403).end();
      return;
    }
    try {
      let s = await stat(file).catch(() => null);
      if (s && s.isDirectory()) {
        file = join(file, 'index.html');
        s = await stat(file).catch(() => null);
      }
      if (!s) {
        const alt = file.endsWith('.html') ? null : `${file}.html`;
        if (alt && (await stat(alt).catch(() => null))) file = alt;
        else {
          res.writeHead(404, { 'content-type': 'text/plain' }).end('404');
          return;
        }
      }
      res.writeHead(200, { 'content-type': MIME[extname(file)] ?? 'application/octet-stream' });
      createReadStream(file).pipe(res);
    } catch {
      res.writeHead(500).end();
    }
  });
  await new Promise((r) => server.listen(port, '127.0.0.1', r));
  return server;
}

/**
 * The four declarations SC 1.4.12 names.
 *
 * `flat` writes line-height: 1.5 verbatim, which is what the widely used
 * bookmarklets do. Where the author already sets more than 1.5 that is a
 * *decrease*, so `raise` applies the criterion as a floor instead: only
 * elements currently under 1.5 are lifted. Both are defensible readings of
 * "at least 1.5 times the font size"; the numbers differ, so measure both.
 */
const CSS_PARTS = {
  letter: `* { letter-spacing: 0.12em !important; }`,
  word: `* { word-spacing: 0.16em !important; }`,
  para: `p, li, blockquote, dd, figcaption { margin-bottom: 2em !important; }`,
};
const FLAT_LINE_HEIGHT = `* { line-height: 1.5 !important; }`;

/** Which declarations each mode turns on. `flat`/`raise` differ only in line-height. */
const MODES = {
  flat: { line: 'flat', parts: ['letter', 'word', 'para'] },
  raise: { line: 'raise', parts: ['letter', 'word', 'para'] },
  'line-only': { line: 'flat', parts: [] },
  'letter-only': { line: null, parts: ['letter'] },
  'word-only': { line: null, parts: ['word'] },
  'para-only': { line: null, parts: ['para'] },
};

/** Raise-only: lift line-height to 1.5 exactly where it currently falls short. */
const RAISE_LINE_HEIGHT = () => {
  for (const el of document.querySelectorAll('body *')) {
    const cs = getComputedStyle(el);
    const fs = parseFloat(cs.fontSize);
    const lh = parseFloat(cs.lineHeight);
    if (!fs || !Number.isFinite(lh)) continue;
    if (lh / fs < 1.5) el.style.setProperty('line-height', '1.5', 'important');
  }
};

/**
 * Runs inside the page. Collects, for every rendered element, the signals that
 * mean "content was lost": a clipping box that now overflows, a line clamp
 * that now hides more, and the document growing a horizontal scrollbar.
 */
const PROBE = () => {
  const CLIP = new Set(['hidden', 'clip']);
  const out = { clipped: [], clamped: [], doc: null };
  const de = document.documentElement;
  // Identical class paths repeat across cards, so a path string cannot key an
  // element between the two passes. Stamp a stable index on the first pass and
  // reuse it on the second.
  if (!document.body.hasAttribute('data-ts-stamped')) {
    let i = 0;
    for (const el of document.querySelectorAll('body *')) el.setAttribute('data-ts-idx', String(i++));
    document.body.setAttribute('data-ts-stamped', '1');
  }
  out.doc = {
    scrollWidth: de.scrollWidth,
    clientWidth: de.clientWidth,
    scrollHeight: de.scrollHeight,
  };
  const path = (el) => {
    const parts = [];
    for (let n = el; n && n.nodeType === 1 && parts.length < 4; n = n.parentElement) {
      let s = n.tagName.toLowerCase();
      if (n.id) s += `#${n.id}`;
      else if (n.className && typeof n.className === 'string') {
        const c = n.className.trim().split(/\s+/).slice(0, 2).join('.');
        if (c) s += `.${c}`;
      }
      parts.unshift(s);
    }
    return parts.join('>');
  };
  const hasText = (el) => {
    for (const n of el.childNodes) if (n.nodeType === 3 && n.textContent.trim()) return true;
    return false;
  };
  for (const el of document.querySelectorAll('body *')) {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue;

    const clipY = CLIP.has(cs.overflowY);
    const clipX = CLIP.has(cs.overflowX);
    const overY = el.scrollHeight - el.clientHeight;
    const overX = el.scrollWidth - el.clientWidth;
    const idx = el.getAttribute('data-ts-idx');
    if ((clipY && overY > 1) || (clipX && overX > 1)) {
      out.clipped.push({ idx, path: path(el), overY: clipY ? overY : 0, overX: clipX ? overX : 0 });
    }
    if (cs.webkitLineClamp && cs.webkitLineClamp !== 'none' && hasText(el)) {
      const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.2;
      out.clamped.push({
        idx,
        path: path(el),
        clamp: parseInt(cs.webkitLineClamp, 10),
        chars: (el.textContent || '').trim().length,
        // How much of the excerpt the clamp box actually shows.
        shown: el.clientHeight,
        full: el.scrollHeight,
        lines: Math.round(r.height / lh),
        scrollLines: Math.round(el.scrollHeight / lh),
      });
    }
  }
  return out;
};

let MODE = 'flat';

/** Default sample: one of each page type, in all four languages. Override with --sample. */
const DEFAULT_PATHS = [
  '/',
  '/ko/',
  '/ko/blog/',
  '/ko/about/',
  '/ko/contact/',
  '/ko/social/',
  '/ko/improvement-history/',
  '/ko/privacy/',
  '/ko/blog/ko/act-rules-axe-coverage-wcag-sc-2026/',
  '/ko/blog/ko/focus-not-obscured-sticky-header-scroll-padding-2026/',
  '/ko/blog/ko/etag-deploy-invalidation-conditional-requests-2026/',
  '/ko/blog/ko/wcag22-target-size-audit-2026/',
  '/en/',
  '/en/blog/',
  '/en/about/',
  '/en/blog/en/act-rules-axe-coverage-wcag-sc-2026/',
  '/ja/',
  '/ja/blog/',
  '/ja/blog/ja/act-rules-axe-coverage-wcag-sc-2026/',
  '/ja/portfolio/shadow-dash/',
  '/zh/',
  '/zh/blog/',
  '/zh/blog/zh/act-rules-axe-coverage-wcag-sc-2026/',
  '/404.html',
];

const VIEWPORTS = [
  { name: 'desktop', width: 1280, height: 800 },
  { name: 'mobile', width: 390, height: 844 },
];

async function main() {
  const args = process.argv.slice(2);
  const jsonAt = args.indexOf('--json');
  const outPath = jsonAt >= 0 ? args[jsonAt + 1] : null;
  const baseAt = args.indexOf('--base');
  const modeAt = args.indexOf('--mode');
  MODE = modeAt >= 0 ? args[modeAt + 1] : 'flat';
  if (!MODES[MODE]) throw new Error(`unknown --mode ${MODE}; try ${Object.keys(MODES).join(', ')}`);
  console.log(`mode: ${MODE}`);
  const port = 4399;
  let server = null;
  let base = baseAt >= 0 ? args[baseAt + 1] : null;
  if (!base) {
    server = await serveDist(port);
    base = `http://127.0.0.1:${port}`;
  }

  const sampleAt = args.indexOf('--sample');
  const paths =
    sampleAt >= 0 ? JSON.parse(await readFile(args[sampleAt + 1], 'utf8')) : DEFAULT_PATHS;
  const browser = await chromium.launch();
  const results = [];

  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await ctx.newPage();
    for (const p of paths) {
      await page.goto(base + p, { waitUntil: 'load' });
      await page.evaluate(() => document.fonts?.ready);
      const before = await page.evaluate(PROBE);
      const plan = MODES[MODE];
      for (const part of plan.parts) await page.addStyleTag({ content: CSS_PARTS[part] });
      if (plan.line === 'flat') await page.addStyleTag({ content: FLAT_LINE_HEIGHT });
      else if (plan.line === 'raise') await page.evaluate(RAISE_LINE_HEIGHT);
      await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
      const after = await page.evaluate(PROBE);

      const beforeClip = new Set(before.clipped.map((c) => c.idx));
      const newClipped = after.clipped.filter((c) => !beforeClip.has(c.idx));
      const clampMap = new Map(before.clamped.map((c) => [c.idx, c]));
      const lostLines = [];
      const excerpts = [];
      for (const c of after.clamped) {
        const b = clampMap.get(c.idx);
        if (!b) continue;
        const bHidden = Math.max(0, b.scrollLines - b.lines);
        const aHidden = Math.max(0, c.scrollLines - c.lines);
        if (aHidden > bHidden) lostLines.push({ path: c.path, before: bHidden, after: aHidden });
        // fraction of the excerpt's own height that the clamp box still shows
        excerpts.push({
          path: c.path,
          clamp: c.clamp,
          chars: c.chars,
          shownBefore: b.full > 0 ? +(b.shown / b.full).toFixed(4) : 1,
          shownAfter: c.full > 0 ? +(c.shown / c.full).toFixed(4) : 1,
        });
      }

      results.push({
        viewport: vp.name,
        path: p,
        hOverflowBefore: before.doc.scrollWidth - before.doc.clientWidth,
        hOverflowAfter: after.doc.scrollWidth - after.doc.clientWidth,
        clippedBefore: before.clipped.length,
        clippedAfter: after.clipped.length,
        newClipped,
        lostLines,
        excerpts,
        heightGrowth: +(after.doc.scrollHeight / before.doc.scrollHeight).toFixed(3),
      });
    }
    await ctx.close();
  }
  await browser.close();
  if (server) server.close();

  const failing = results.filter(
    (r) => r.newClipped.length > 0 || r.lostLines.length > 0 || (r.hOverflowAfter > 1 && r.hOverflowBefore <= 1)
  );
  console.log(`pages x viewports: ${results.length}`);
  console.log(`pages with new content loss: ${failing.length}`);
  for (const f of failing) {
    console.log(`\n[${f.viewport}] ${f.path}`);
    if (f.hOverflowAfter > 1 && f.hOverflowBefore <= 1)
      console.log(`  horizontal overflow: ${f.hOverflowBefore}px -> ${f.hOverflowAfter}px`);
    for (const c of f.newClipped)
      console.log(`  clipped: ${c.path} (+${c.overY}px vertical, +${c.overX}px horizontal)`);
    for (const l of f.lostLines)
      console.log(`  line-clamp hides ${l.before} -> ${l.after} lines: ${l.path}`);
  }
  const growth = results.map((r) => r.heightGrowth).sort((a, b) => a - b);
  console.log(
    `\npage height growth  min ${growth[0]}x  median ${growth[Math.floor(growth.length / 2)]}x  max ${growth.at(-1)}x`
  );
  if (outPath) await writeFile(outPath, JSON.stringify(results, null, 2));
  process.exit(failing.length ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
