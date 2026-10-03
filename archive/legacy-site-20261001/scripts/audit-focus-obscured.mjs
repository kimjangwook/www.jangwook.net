#!/usr/bin/env node
/**
 * audit-focus-obscured.mjs — WCAG 2.2 SC 2.4.11 / 2.4.12 measurement
 *
 * Walks the real sequential focus order in Chromium (Tab and Shift+Tab, actual key
 * presses) and hit-tests the focused element's client rect to decide whether
 * author-created content covers it.
 *
 *   SC 2.4.11 Focus Not Obscured (Minimum), AA  -> fails when the element is
 *                                                 ENTIRELY hidden
 *   SC 2.4.12 Focus Not Obscured (Enhanced), AAA -> fails when ANY part is hidden
 *
 * Two details matter and are easy to get wrong:
 *
 *   1. Direction. The UA scrolls a focus target into view at the NEAREST edge.
 *      Walking down, targets land at the bottom edge, where a sticky header
 *      cannot reach them. Walking up, they land at the top edge, which is
 *      exactly where a sticky header lives. A forward-only audit reports zero.
 *   2. Real keys. element.focus() centers the target in Chromium, so a script
 *      that calls focus() instead of pressing Tab never reproduces the failure.
 *
 * The sample grid is a proxy for perception, not a substitute for it. Rounded
 * and multi-line elements produce corner/gap artifacts; triage AAA output by hand.
 *
 * Usage:
 *   npx serve dist -l 8123          # or python3 -m http.server 8123 -d dist
 *   node scripts/audit-focus-obscured.mjs --base http://127.0.0.1:8123 \
 *        --path /ko/ --path /ko/blog/ --json focus.json
 */
import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';

const argv = process.argv.slice(2);
const flag = (name, fallback) => {
	const i = argv.indexOf(`--${name}`);
	return i === -1 ? fallback : argv[i + 1];
};
const flags = (name) =>
	argv.reduce((acc, cur, i) => (cur === `--${name}` ? [...acc, argv[i + 1]] : acc), []);

const BASE = flag('base', 'http://127.0.0.1:8123');
const PATHS = flags('path').length ? flags('path') : ['/'];
const JSON_OUT = flag('json', null);
const EXTRA_CSS = flag('css', '');
const GRID = Number(flag('grid', 5));
const VIEWPORTS = [
	['desktop', 1280, 800],
	['mobile', 390, 844],
];

const FOCUSABLE =
	'a[href], button, input, select, textarea, summary, iframe, [tabindex]:not([tabindex="-1"]), [contenteditable="true"]';

const TAG_ALL = `(() => {
  const all = [...document.querySelectorAll(${JSON.stringify(FOCUSABLE)})];
  let i = 0;
  for (const el of all) el.setAttribute('data-fidx', String(i++));
  return all.length;
})()`;

const PROBE = `(() => {
  const el = document.activeElement;
  if (!el || el === document.body || el === document.documentElement) return { kind: 'body' };
  const r = el.getBoundingClientRect();
  const cs = getComputedStyle(el);
  const desc = (n) => {
    if (!n || !n.tagName) return '?';
    let s = n.tagName.toLowerCase();
    if (n.id) s += '#' + n.id;
    else if (n.classList && n.classList.length) s += '.' + [...n.classList].slice(0, 2).join('.');
    return s;
  };
  // Attribute a blocker to its nearest sticky/fixed ancestor when there is one,
  // because that is the thing an author has to change.
  const anchored = (n) => {
    let cur = n;
    while (cur && cur.nodeType === 1) {
      const p = getComputedStyle(cur).position;
      if (p === 'sticky' || p === 'fixed') return desc(cur) + '[' + p + ']';
      cur = cur.parentElement;
    }
    return null;
  };
  const base = {
    fidx: el.getAttribute('data-fidx'),
    self: desc(el),
    selfStyle: { opacity: cs.opacity, visibility: cs.visibility, pointerEvents: cs.pointerEvents },
    rect: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)],
  };
  const x0 = Math.max(0, r.left), y0 = Math.max(0, r.top);
  const x1 = Math.min(innerWidth, r.right), y1 = Math.min(innerHeight, r.bottom);
  if (x1 <= x0 || y1 <= y0) return { kind: 'offscreen', ...base };
  const N = ${GRID};
  let visible = 0, total = 0;
  const blockers = {};
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      const x = x0 + (x1 - x0) * (i + 0.5) / N;
      const y = y0 + (y1 - y0) * (j + 0.5) / N;
      total++;
      const top = document.elementFromPoint(x, y);
      // An ancestor hit means the point simply is not on the element (inline
      // boxes spanning wrapped lines), not that something covers it.
      if (!top || top === el || el.contains(top) || top.contains(el)) { visible++; continue; }
      const key = anchored(top) || desc(top);
      blockers[key] = (blockers[key] || 0) + 1;
    }
  }
  return { kind: 'measured', ...base, total, visible, hiddenRatio: (total - visible) / total, blockers };
})()`;

const records = [];
const browser = await chromium.launch();

for (const [vp, width, height] of VIEWPORTS) {
	const ctx = await browser.newContext({ viewport: { width, height }, reducedMotion: 'reduce' });
	for (const path of PATHS) {
		const page = await ctx.newPage();
		const res = await page.goto(BASE + path, { waitUntil: 'load' });
		if (!res || res.status() >= 400) {
			console.warn(`  skip ${path} (${res ? res.status() : 'no response'})`);
			await page.close();
			continue;
		}
		if (EXTRA_CSS) await page.addStyleTag({ content: EXTRA_CSS });
		await page.waitForTimeout(250);
		const focusableCount = await page.evaluate(TAG_ALL);

		for (const dir of ['forward', 'reverse']) {
			await page.evaluate(
				(d) => window.scrollTo(0, d === 'forward' ? 0 : document.body.scrollHeight),
				dir
			);
			await page.waitForTimeout(120);
			await page.evaluate(() => {
				document.activeElement?.blur?.();
				document.body.focus();
			});
			const key = dir === 'forward' ? 'Tab' : 'Shift+Tab';
			const seen = new Set();
			let bodyStreak = 0;
			let repeats = 0;
			for (let n = 0; n < focusableCount + 25; n++) {
				await page.keyboard.press(key);
				const r = await page.evaluate(PROBE);
				if (r.kind === 'body') {
					if (++bodyStreak >= 2) break;
					continue;
				}
				bodyStreak = 0;
				const id = r.fidx ?? `x:${r.self}`;
				if (seen.has(id)) {
					if (++repeats >= 8) break;
					continue;
				}
				repeats = 0;
				seen.add(id);
				records.push({ vp, path, dir, ...r });
			}
		}
		await page.close();
	}
	await ctx.close();
}
await browser.close();

const measured = records.filter((r) => r.kind === 'measured');
// opacity:0 / visibility:hidden / pointer-events:none means the element itself is
// not paintable or hit-testable. That is a Focus Visible (2.4.7) problem, not an
// occlusion problem, so it is reported on its own line.
const invisible = (r) =>
	parseFloat(r.selfStyle.opacity) < 0.05 ||
	r.selfStyle.visibility === 'hidden' ||
	r.selfStyle.pointerEvents === 'none';
const ghost = measured.filter((r) => r.visible === 0 && invisible(r));
const fully = measured.filter((r) => r.visible === 0 && !invisible(r));
const partly = measured.filter((r) => r.visible > 0 && r.visible < r.total && !invisible(r));

const tally = (rows, pick) => {
	const t = {};
	for (const r of rows) for (const k of pick(r)) t[k] = (t[k] || 0) + 1;
	return Object.fromEntries(Object.entries(t).sort((a, b) => b[1] - a[1]));
};
const byDir = (d) => ({
	stops: measured.filter((r) => r.dir === d).length,
	fail_2411: fully.filter((r) => r.dir === d).length,
	fail_2412: partly.filter((r) => r.dir === d).length,
});

const summary = {
	base: BASE,
	paths: PATHS.length,
	viewports: VIEWPORTS.map((v) => v[0]),
	uniqueFocusStops: measured.length,
	fail_2411_entirelyHidden: fully.length,
	fail_2412_partlyHidden: partly.length,
	focusableWhileInvisible: ghost.length,
	forward: byDir('forward'),
	reverse: byDir('reverse'),
	blockers_2411: tally(fully, (r) => Object.keys(r.blockers)),
	blockers_2412: tally(partly, (r) => Object.keys(r.blockers)),
	types_2411: tally(fully, (r) => [r.self]),
	types_2412: tally(partly, (r) => [r.self]),
	worst: [...fully, ...partly]
		.sort((a, b) => b.hiddenRatio - a.hiddenRatio)
		.slice(0, 15)
		.map((r) => ({
			vp: r.vp,
			path: r.path,
			dir: r.dir,
			self: r.self,
			hiddenPct: Math.round(r.hiddenRatio * 100),
			rect: r.rect,
			blockers: r.blockers,
		})),
};

console.log(JSON.stringify(summary, null, 2));
if (JSON_OUT) {
	writeFileSync(JSON_OUT, JSON.stringify({ summary, records }, null, 1));
	console.log(`\nwrote ${JSON_OUT}`);
}
process.exitCode = fully.length > 0 || ghost.length > 0 ? 1 : 0;
