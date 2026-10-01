#!/usr/bin/env node
/**
 * act-coverage-audit.mjs — 자동 접근성 검사기가 WCAG 성공기준별로 무엇을 판정하는지 실측한다.
 *
 * W3C ACT Task Force가 공개한 접근성 적합성 테스트 케이스(정답이 붙은 HTML 예제)를 내려받아
 * axe-core로 전수 실행하고, "실패해야 하는 예제"에서 검사기가 실제로 위반을 냈는지를
 * 성공기준(SC) 단위로 집계한다. CI 게이트가 어느 SC를 결정할 수 있고 어느 SC는
 * 사람 손에 남는지를 숫자로 바꾸는 것이 목적이다.
 *
 * 사용법:
 *   node scripts/act-coverage-audit.mjs                 # 기본 규칙셋
 *   node scripts/act-coverage-audit.mjs --all-rules     # experimental·AAA 포함 전 규칙
 *   node scripts/act-coverage-audit.mjs --out out.json
 *
 * 요구: playwright(크로미움 설치 완료), axe-core.
 * 테스트 케이스 출처: https://www.w3.org/WAI/standards-guidelines/act/rules/
 * 정적 자산은 w3c/wcag-act-rules 리포지터리 원본에서 받는다(w3.org 직접 요청은 429로 막힌다).
 */

import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import os from 'node:os';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const RAW_BASE = 'https://raw.githubusercontent.com/w3c/wcag-act-rules/main/content-assets/wcag-act-rules/';
const TESTCASES_JSON = RAW_BASE + 'testcases.json'; // w3.org 원본과 SHA-256 동일, 429 없이 받힌다
const GH_TREE = 'https://api.github.com/repos/w3c/wcag-act-rules/git/trees/main?recursive=1';
const MAX_ASSET_BYTES = 2_000_000; // 35MB짜리 샘플 영상까지 받을 이유는 없다
const CONCURRENCY = 4;

const argv = process.argv.slice(2);
const ALL_RULES = argv.includes('--all-rules');
const OUT = (() => {
  const i = argv.indexOf('--out');
  return i >= 0 ? argv[i + 1] : null;
})();

const CACHE = path.join(os.tmpdir(), 'act-coverage-cache');
const SRV = path.join(CACHE, 'srv');
const PREFIX = '/WAI/content-assets/wcag-act-rules/';

const MIME = {
  '.html': 'text/html;charset=utf-8', '.js': 'text/javascript', '.css': 'text/css',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.gif': 'image/gif', '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4', '.webm': 'video/webm', '.mp3': 'audio/mpeg', '.vtt': 'text/vtt',
  '.json': 'application/json', '.txt': 'text/plain',
};

const log = (...a) => console.log(...a);
const scTag = (sc) => 'wcag' + sc.replace(/\./g, '');

/** 규칙이 1차 요구사항으로 가리키는 성공기준만 뽑는다(secondary는 제외). */
function primarySCs(req) {
  const out = [];
  for (const [key, val] of Object.entries(req || {})) {
    const m = key.match(/^wcag2\d?:(\d+\.\d+\.\d+)$/);
    if (m && !val.secondary) out.push(m[1]);
  }
  return out;
}

async function getJSON(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${url} -> HTTP ${r.status}`);
  return r.json();
}

async function pool(items, fn, n = 12) {
  const q = [...items];
  await Promise.all(Array.from({ length: n }, async () => {
    while (q.length) await fn(q.shift());
  }));
}

async function fetchToFile(url, dest) {
  if (fs.existsSync(dest)) return true;
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const r = await fetch(url);
      if (!r.ok) throw new Error('HTTP ' + r.status);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.writeFileSync(dest, Buffer.from(await r.arrayBuffer()));
      return true;
    } catch {
      await new Promise((res) => setTimeout(res, 600 * (attempt + 1)));
    }
  }
  return false;
}

async function materialize(testcases) {
  let missed = 0;
  await pool(testcases, async (tc) => {
    const dest = path.join(SRV, PREFIX.slice(1), tc.relativePath);
    if (!(await fetchToFile(RAW_BASE + tc.relativePath, dest))) missed++;
  });
  const tree = await getJSON(GH_TREE);
  const assets = tree.tree.filter(
    (x) => x.type === 'blob'
      && x.path.startsWith('content-assets/wcag-act-rules/test-assets/')
      && x.size <= MAX_ASSET_BYTES,
  );
  await pool(assets, async (a) => {
    const rel = a.path.replace('content-assets/wcag-act-rules/', '');
    await fetchToFile(RAW_BASE + a.path.replace('content-assets/wcag-act-rules/', ''), path.join(SRV, PREFIX.slice(1), rel));
  }, 8);
  return { missed, assets: assets.length };
}

function startServer() {
  const server = http.createServer((req, res) => {
    const file = path.join(SRV, decodeURIComponent(req.url.split('?')[0]));
    fs.readFile(file, (err, data) => {
      if (err) { res.writeHead(404); res.end('404'); return; }
      res.writeHead(200, { 'content-type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream' });
      res.end(data);
    });
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server)));
}

async function runAxe(testcases, port) {
  const axeSource = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
  const browser = await chromium.launch();
  const results = [];
  const queue = [...testcases];
  let errors = 0;

  await Promise.all(Array.from({ length: CONCURRENCY }, async () => {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await ctx.newPage();
    page.on('dialog', (d) => d.dismiss().catch(() => {}));
    while (queue.length) {
      const tc = queue.shift();
      const url = `http://127.0.0.1:${port}${PREFIX}testcases/${tc.ruleId}/${tc.testcaseId}.html`;
      const rec = { ruleId: tc.ruleId, testcaseId: tc.testcaseId, expected: tc.expected };
      try {
        // meta refresh나 스크립트 이동이 걸린 케이스가 살아남아 다음 goto를 가로챈다.
        // 케이스마다 about:blank로 끊고, 가로채기는 1회 재시도한다.
        await page.goto('about:blank').catch(() => {});
        try {
          await page.goto(url, { waitUntil: 'load', timeout: 12000 });
        } catch {
          await page.goto('about:blank').catch(() => {});
          await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 12000 });
        }
        await page.waitForTimeout(60);
        Object.assign(rec, await page.evaluate(async ([src, all]) => {
          if (!window.axe) {
            const s = document.createElement('script');
            s.textContent = src;
            document.head.appendChild(s);
          }
          const opts = { resultTypes: ['violations', 'incomplete'] };
          if (all) opts.rules = Object.fromEntries(window.axe.getRules().map((r) => [r.ruleId, { enabled: true }]));
          const r = await window.axe.run(document, opts);
          const pick = (a) => a.map((v) => ({ id: v.id, tags: v.tags, n: v.nodes.length }));
          return { violations: pick(r.violations), incomplete: pick(r.incomplete) };
        }, [axeSource, ALL_RULES]));
      } catch (e) {
        rec.error = String(e.message).slice(0, 160);
        errors++;
      }
      results.push(rec);
    }
    await ctx.close();
  }));

  await browser.close();
  return { results, errors };
}

function aggregate(testcases, results) {
  const byId = new Map(results.map((r) => [`${r.ruleId}/${r.testcaseId}`, r]));
  const totals = { evaluated: 0, violation: 0, review: 0, silent: 0, unevaluable: 0 };
  const perSC = {};
  const perRule = {};
  const noise = {};
  let nonFailing = 0;

  for (const tc of testcases) {
    const r = byId.get(`${tc.ruleId}/${tc.testcaseId}`);
    const scs = primarySCs(tc.ruleAccessibilityRequirements);

    if (tc.expected !== 'failed') {
      if (r && !r.error) {
        nonFailing++;
        for (const v of r.violations || []) noise[v.id] = (noise[v.id] || 0) + 1;
      }
      continue;
    }

    perRule[tc.ruleId] ??= { name: tc.ruleName, scs, n: 0, violation: 0, review: 0, silent: 0, unevaluable: 0 };
    if (!r || r.error) { totals.unevaluable++; perRule[tc.ruleId].unevaluable++; continue; }

    const hit = (arr) => (arr || []).some((v) => scs.some((sc) => v.tags.includes(scTag(sc))));
    const bucket = hit(r.violations) ? 'violation' : (hit(r.incomplete) ? 'review' : 'silent');
    totals.evaluated++;
    totals[bucket]++;
    perRule[tc.ruleId].n++;
    perRule[tc.ruleId][bucket]++;
    for (const sc of scs) {
      perSC[sc] ??= { n: 0, violation: 0, review: 0, silent: 0 };
      perSC[sc].n++;
      perSC[sc][bucket]++;
    }
  }
  return { totals, perSC, perRule, noise, nonFailing };
}

const t0 = Date.now();
log(`ACT coverage audit — rules=${ALL_RULES ? 'all (experimental/AAA on)' : 'axe defaults'}`);

const suite = await getJSON(TESTCASES_JSON);
log(`test cases: ${suite.testcases.length} from ${new Set(suite.testcases.map((t) => t.ruleId)).size} ACT rules`);

const mat = await materialize(suite.testcases);
log(`materialized (assets ${mat.assets}, missing pages ${mat.missed})`);

const server = await startServer();
const { results, errors } = await runAxe(suite.testcases, server.address().port);
server.close();

const agg = aggregate(suite.testcases, results);
const { totals } = agg;
const pct = (x) => `${((100 * x) / totals.evaluated).toFixed(1)}%`;

log('');
log(`failing examples evaluated: ${totals.evaluated} (unevaluable ${totals.unevaluable}, page errors ${errors})`);
log(`  criterion-matched violation : ${totals.violation} (${pct(totals.violation)})`);
log(`  needs-review only           : ${totals.review} (${pct(totals.review)})`);
log(`  silent                      : ${totals.silent} (${pct(totals.silent)})`);
log('');
log('SC      cases  violation  review  silent');
for (const [sc, v] of Object.entries(agg.perSC).sort((a, b) => b[1].n - a[1].n)) {
  log(`${sc.padEnd(8)}${String(v.n).padStart(4)}${String(v.violation).padStart(10)}${String(v.review).padStart(8)}${String(v.silent).padStart(8)}`);
}
const zero = Object.entries(agg.perSC).filter(([, v]) => v.violation === 0);
log('');
log(`success criteria with zero automated violation: ${zero.length}/${Object.keys(agg.perSC).length}`);
log(`  ${zero.map(([sc]) => sc).join(', ')}`);
log('');
log(`noise baseline — rules firing on non-failing examples (n=${agg.nonFailing}):`);
Object.entries(agg.noise).sort((a, b) => b[1] - a[1]).slice(0, 6)
  .forEach(([id, c]) => log(`  ${id.padEnd(24)}${c} (${((100 * c) / agg.nonFailing).toFixed(0)}%)`));
log('');
log(`elapsed ${((Date.now() - t0) / 1000).toFixed(1)}s`);

if (OUT) {
  fs.writeFileSync(OUT, JSON.stringify({ mode: ALL_RULES ? 'all-rules' : 'default', ...agg, results }, null, 1));
  log(`written ${OUT}`);
}
