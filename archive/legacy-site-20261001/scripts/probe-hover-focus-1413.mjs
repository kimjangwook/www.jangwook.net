import { chromium } from 'playwright';
import fs from 'node:fs';

const URL = 'file://' + process.argv[2] + '/tooltips.html';
const VARIANTS = [
  { id: 1, name: 'title attribute',            trigger: '#g1', tip: null },
  { id: 2, name: 'CSS :hover only',            trigger: '#g2', tip: '#t2' },
  { id: 3, name: 'CSS :hover + :focus-visible',trigger: '#g3', tip: '#t3' },
  { id: 4, name: 'CSS :has() + bridge',        trigger: '#g4', tip: '#t4' },
  { id: 5, name: 'JS hover/focus/Esc/bridge',  trigger: '#g5', tip: '#t5' },
  { id: 6, name: 'JS + 2s auto-hide',          trigger: '#g6', tip: '#t6' },
  { id: 7, name: 'popover=hint',               trigger: '#g7', tip: '#t7' },
];

const center = (b) => ({ x: b.x + b.width / 2, y: b.y + b.height / 2 });

async function visible(page, sel) {
  if (!sel) return null;
  return page.locator(sel).isVisible();
}

async function run() {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 900, height: 1400 } });
  const page = await ctx.newPage();
  const out = [];

  for (const v of VARIANTS) {
    const r = { id: v.id, name: v.name };

    // --- pointer hover shows it?
    await page.goto(URL); await page.mouse.move(5, 5);
    const tb = await page.locator(v.trigger).boundingBox();
    await page.mouse.move(center(tb).x, center(tb).y, { steps: 6 });
    await page.waitForTimeout(250);
    r.hoverShows = await visible(page, v.tip);

    // --- geometry + obscuring
    if (r.hoverShows) {
      const pb = await page.locator(v.tip).boundingBox();
      const ub = await page.locator(`#v${v.id} .under`).boundingBox();
      r.gapPx = Math.round(pb.y - (tb.y + tb.height));
      r.obscuresOtherContent = !(pb.y + pb.height < ub.y || ub.y + ub.height < pb.y);

      // --- HOVERABLE: walk the pointer from trigger into the tooltip
      const path = 12, from = center(tb), to = center(pb);
      for (let i = 1; i <= path; i++) {
        await page.mouse.move(from.x + (to.x - from.x) * i / path, from.y + (to.y - from.y) * i / path);
        await page.waitForTimeout(20);
      }
      await page.waitForTimeout(200);
      r.hoverable = await visible(page, v.tip);

      // --- PERSISTENT: hold still for 5s
      await page.goto(URL); await page.mouse.move(5, 5);
      await page.mouse.move(center(tb).x, center(tb).y, { steps: 6 });
      await page.waitForTimeout(300);
      const before = await visible(page, v.tip);
      await page.waitForTimeout(5000);
      r.persistent5s = before && (await visible(page, v.tip));

      // --- DISMISSIBLE: Escape without moving the pointer
      await page.goto(URL); await page.mouse.move(5, 5);
      await page.mouse.move(center(tb).x, center(tb).y, { steps: 6 });
      await page.waitForTimeout(250);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(250);
      r.dismissibleByEsc = !(await visible(page, v.tip));
    } else {
      r.gapPx = null; r.obscuresOtherContent = null;
      r.hoverable = null; r.persistent5s = null; r.dismissibleByEsc = null;
    }

    // --- keyboard focus shows it? (Tab v.id times from the top of the document)
    await page.goto(URL); await page.mouse.move(5, 5);
    await page.locator('body').click({ position: { x: 2, y: 2 } });
    await page.keyboard.press('Escape');
    for (let i = 0; i < v.id; i++) await page.keyboard.press('Tab');
    await page.waitForTimeout(250);
    r.focusedId = await page.evaluate(() => document.activeElement && document.activeElement.id);
    r.focusShows = await visible(page, v.tip);

    // --- keyboard: Escape while focused
    if (r.focusShows) {
      await page.keyboard.press('Escape');
      await page.waitForTimeout(200);
      r.dismissibleWhileFocused = !(await visible(page, v.tip));
    } else r.dismissibleWhileFocused = null;

    out.push(r);
    console.log(JSON.stringify(r));
  }

  // popover support probe
  await page.goto(URL);
  const support = await page.evaluate(() => ({
    popoverAttr: HTMLElement.prototype.hasOwnProperty('popover'),
    hintReflected: (() => { const d = document.getElementById('t7'); return d.popover; })(),
    v7err: window.__v7err || null,
    ua: navigator.userAgent,
  }));
  console.log('SUPPORT ' + JSON.stringify(support));

  fs.writeFileSync(process.argv[2] + '/results.json', JSON.stringify({ support, results: out }, null, 2));
  await browser.close();
}
run();
