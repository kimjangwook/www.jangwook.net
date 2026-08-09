#!/usr/bin/env node
/**
 * WCAG 2.2 SC 1.4.10 Reflow 감사.
 *
 * 같은 320 CSS px 폭을 두 가지 방법으로 잰다.
 *  - narrow : 320x844  (좁은 휴대폰 뷰포트 — 흔히 쓰는 리플로우 테스트)
 *  - zoom400: 320x200  (1280x800 데스크톱을 400% 확대했을 때의 CSS px 뷰포트)
 *  - floor  : 320x256  (SC 1.4.10이 명시한 높이 하한 256 CSS px)
 *
 * 폭 방향 위반(2차원 스크롤)과, 세로 공간을 고정 요소가 잡아먹어 생기는
 * 가용 콘텐츠 높이 손실을 함께 측정한다.
 *
 * 사용법:
 *   node scripts/audit-reflow.mjs [--limit N] [--out data/reflow-audit.json]
 *   (dist/ 를 먼저 빌드하고, 로컬 정적 서버를 이 스크립트가 직접 띄운다)
 */
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');

const args = process.argv.slice(2);
const getArg = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};
const OUT = path.join(ROOT, getArg('--out', 'data/reflow-audit.json'));
const LABEL = getArg('--label', 'baseline');

// 측정 조건. 폭은 셋 다 320 CSS px으로 동일하고 높이만 다르다.
const CONDITIONS = [
  { key: 'narrow', width: 320, height: 844, note: '좁은 휴대폰 뷰포트' },
  { key: 'zoom400', width: 320, height: 200, note: '1280x800 화면의 400% 확대' },
  { key: 'floor', width: 320, height: 256, note: 'SC 1.4.10 높이 하한' },
];

// 표본: 사이트의 주요 템플릿을 언어별로 고르게 덮는다.
const SAMPLE = [
  '/', '/ko/', '/ja/', '/en/', '/zh/',
  '/ko/blog/', '/en/blog/',
  '/ko/blog/ko/text-spacing-1412-clamp-audit-2026/',
  '/ko/blog/ko/wcag22-target-size-audit-2026/',
  '/ja/blog/ja/text-spacing-1412-clamp-audit-2026/',
  '/en/blog/en/text-spacing-1412-clamp-audit-2026/',
  '/zh/blog/zh/text-spacing-1412-clamp-audit-2026/',
  '/ko/improvement-history/', '/en/about/',
  '/ko/about/', '/ko/contact/',
];

const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml',
  '.avif': 'image/avif', '.ico': 'image/x-icon', '.xml': 'application/xml',
  '.woff2': 'font/woff2', '.woff': 'font/woff', '.txt': 'text/plain',
};

function serve(port) {
  const server = http.createServer((req, res) => {
    let p = decodeURIComponent(req.url.split('?')[0]);
    let file = path.join(DIST, p);
    if (p.endsWith('/')) file = path.join(file, 'index.html');
    if (!fs.existsSync(file) && fs.existsSync(file + '.html')) file += '.html';
    if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404); res.end('not found'); return;
    }
    res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((resolve) => server.listen(port, () => resolve(server)));
}

/** 페이지 안에서 실행되어 리플로우 지표를 뽑는다. */
const probe = () => {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const de = document.documentElement;

  // 1) 2차원 스크롤 여부. 세로 스크롤 콘텐츠이므로 가로 스크롤이 생기면 위반.
  const scrollW = Math.max(de.scrollWidth, document.body.scrollWidth);
  const overflowPx = Math.max(0, scrollW - vw);

  // 2) 가로로 삐져나간 요소를 찾는다. 부모가 이미 범인이면 자식은 제외.
  const offenders = [];
  const all = Array.from(document.querySelectorAll('body *'));
  const bad = new Set();
  for (const el of all) {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue;
    // 뷰포트 밖으로 나간 폭. 문서 좌표 기준(가로 스크롤은 0에서 시작).
    const right = r.right + window.scrollX;
    if (right > vw + 1) bad.add(el);
  }
  for (const el of bad) {
    let ancestorBad = false;
    for (let p = el.parentElement; p; p = p.parentElement) {
      if (bad.has(p)) { ancestorBad = true; break; }
    }
    if (ancestorBad) continue;
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    // 조상 중에 실제로 가로 스크롤하는 컨테이너가 있으면, 이 요소의 삐져나감은
    // 그 컨테이너 안에서 흡수된다. 페이지의 2차원 스크롤 위반이 아니다.
    let inScrollContainer = null;
    for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
      const pcs = getComputedStyle(p);
      if ((pcs.overflowX === 'auto' || pcs.overflowX === 'scroll' || pcs.overflowX === 'hidden')
        && p.scrollWidth > p.clientWidth + 1) {
        inScrollContainer = p.tagName.toLowerCase() + ':' + pcs.overflowX;
        break;
      }
    }
    const sel = el.tagName.toLowerCase() +
      (el.id ? '#' + el.id : '') +
      (el.className && typeof el.className === 'string'
        ? '.' + el.className.trim().split(/\s+/).slice(0, 3).join('.') : '');
    offenders.push({
      selector: sel,
      overflow: Math.round(r.right + window.scrollX - vw),
      width: Math.round(r.width),
      overflowX: cs.overflowX,
      whiteSpace: cs.whiteSpace,
      inScrollContainer,
    });
  }

  // 3) 세로 공간을 상시 점유하는 고정 요소(sticky/fixed).
  const stickies = [];
  let topOccupied = 0;
  let bottomOccupied = 0;
  for (const el of all) {
    const cs = getComputedStyle(el);
    if (cs.position !== 'sticky' && cs.position !== 'fixed') continue;
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    if (parseFloat(cs.opacity) === 0) continue;
    const r = el.getBoundingClientRect();
    if (r.height <= 0 || r.width <= 0) continue;
    // 뷰포트에 겹치는 부분만
    const top = Math.max(0, r.top);
    const bottom = Math.min(vh, r.bottom);
    if (bottom <= top) continue;
    const h = bottom - top;
    const sel = el.tagName.toLowerCase() +
      (el.className && typeof el.className === 'string'
        ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : '');
    stickies.push({ selector: sel, position: cs.position, height: Math.round(h), top: Math.round(r.top) });
    if (r.top <= 1) topOccupied = Math.max(topOccupied, Math.round(bottom));
    if (r.bottom >= vh - 1) bottomOccupied = Math.max(bottomOccupied, Math.round(vh - top));
  }

  const usableHeight = Math.max(0, vh - topOccupied - bottomOccupied);
  return {
    vw, vh, scrollW, overflowPx,
    docHeight: Math.round(de.scrollHeight),
    offenders: offenders.sort((a, b) => b.overflow - a.overflow).slice(0, 20),
    stickies,
    topOccupied, bottomOccupied, usableHeight,
    usableRatio: +(usableHeight / vh).toFixed(4),
    // 뷰포트 한 화면에 들어오는 본문 글자 수 근사: 가용 높이 / 줄높이
    lineHeight: (() => {
      const p = document.querySelector('article p, main p, p');
      return p ? Math.round(parseFloat(getComputedStyle(p).lineHeight)) : null;
    })(),
  };
};

async function main() {
  const limit = parseInt(getArg('--limit', String(SAMPLE.length)), 10);
  const urls = SAMPLE.slice(0, limit);
  const port = 4399;
  const server = await serve(port);
  const browser = await chromium.launch();
  const results = [];

  for (const cond of CONDITIONS) {
    const ctx = await browser.newContext({
      viewport: { width: cond.width, height: cond.height },
      deviceScaleFactor: 1,
      reducedMotion: 'reduce',
    });
    const page = await ctx.newPage();
    for (const u of urls) {
      const resp = await page.goto(`http://localhost:${port}${u}`, { waitUntil: 'networkidle' });
      // 404를 조용히 재는 사고를 막는다(첫 실행에서 실제로 겪었다).
      if (!resp || resp.status() !== 200) {
        throw new Error(`${u} returned ${resp ? resp.status() : 'no response'} — 표본 URL을 고쳐라`);
      }
      await page.waitForTimeout(200);
      const m = await page.evaluate(probe);
      results.push({ url: u, condition: cond.key, ...m });
      const flag = m.overflowPx > 0 ? `OVERFLOW ${m.overflowPx}px` : 'ok';
      process.stdout.write(
        `${cond.key.padEnd(8)} ${u.padEnd(52)} ${flag.padEnd(18)} usable ${m.usableHeight}/${m.vh} (${(m.usableRatio * 100).toFixed(1)}%)\n`
      );
    }
    await ctx.close();
  }

  await browser.close();
  server.close();

  // 집계
  const summary = {};
  for (const cond of CONDITIONS) {
    const rows = results.filter((r) => r.condition === cond.key);
    const over = rows.filter((r) => r.overflowPx > 0);
    const ratios = rows.map((r) => r.usableRatio).sort((a, b) => a - b);
    summary[cond.key] = {
      viewport: `${cond.width}x${cond.height}`,
      note: cond.note,
      pages: rows.length,
      pagesWithHorizontalScroll: over.length,
      maxOverflowPx: rows.reduce((m, r) => Math.max(m, r.overflowPx), 0),
      topOccupiedPx: rows[0]?.topOccupied ?? 0,
      usableRatioMin: ratios[0],
      usableRatioMedian: ratios[Math.floor(ratios.length / 2)],
      usableRatioMax: ratios[ratios.length - 1],
      usableHeightMedian: rows.map((r) => r.usableHeight).sort((a, b) => a - b)[Math.floor(rows.length / 2)],
    };
  }

  const payload = { label: LABEL, measuredAtLabel: LABEL, conditions: CONDITIONS, summary, results };
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(payload, null, 2));
  console.log('\n=== summary ===');
  console.log(JSON.stringify(summary, null, 2));
  console.log(`\nwrote ${path.relative(ROOT, OUT)}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
