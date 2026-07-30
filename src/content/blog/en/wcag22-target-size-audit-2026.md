---
title: "WCAG 2.2 Target Size: the AA Failure Behind a Green 92"
description: "22×22 pagination links your thumb keeps missing still scored 92 on Lighthouse. I measured WCAG 2.2 SC 2.5.8 (24×24) two ways and coded the spacing exception."
pubDate: '2026-07-19'
heroImage: ../../../assets/blog/wcag22-target-size-audit-2026/target-size-demo.png
tags:
  - a11y
  - wcag
  - accessibility
  - web-development
relatedPosts:
  - slug: axe-automated-a11y-coverage-gap-2026
    score: 0.82
    reason:
      ko: "저 글은 'axe가 구조적으로 못 잡는 넷'을 다뤘다. 이 글은 그중 타깃 크기만은 axe가 이제 잡더라는 반례와, 그래도 예외 판정은 여전히 사람 몫이라는 경계를 실측했다."
      ja: "あちらは『axeが構造的に取りこぼす四つ』。本稿はそのうちタッチターゲットだけはaxeが今や捕まえるという反例と、それでも例外判定は人の仕事という境界を実測した。"
      en: "That post covers four things axe structurally misses. This one is the counter-case where axe now does catch target size, plus the boundary where exception judgment still falls to a human."
      zh: "那篇讲axe在结构上漏掉的四类问题。本文是其中的反例：目标尺寸axe如今能抓到，但例外判定仍归人来做。"
  - slug: a11y-lighthouse-audit-fix-2026
    score: 0.75
    reason:
      ko: "Lighthouse로 접근성 위반을 잡아 고치는 기본 흐름을 먼저 보고 싶다면 저 글이 출발점이다. 이 글은 그 92점 점수가 왜 통과가 아닌지를 파고든다."
      ja: "Lighthouseでアクセシビリティ違反を捕まえて直す基本の流れは、まずあちら。本稿はその92点が『合格』でない理由を掘る。"
      en: "For the basic flow of catching and fixing a11y issues with Lighthouse, start there. This post digs into why that 92 score is not a pass."
      zh: "想先看用Lighthouse抓取并修复无障碍问题的基本流程，从那篇开始。本文深挖那个92分为何不等于合格。"
  - slug: accessible-name-agents-2026
    score: 0.68
    reason:
      ko: "타깃이 충분히 크더라도 이름이 비어 있으면 무용지물이다. 접근성 이름이 어떻게 조용히 틀어지는지 한 케이스로 깊게 판 글이 저기다."
      ja: "ターゲットが十分大きくても、名前が空なら意味がない。アクセシブルネームがどう静かに狂うかを一例で深掘りしたのがあちら。"
      en: "A target can be big enough and still be useless if its name is empty. That post drills into one case of how the accessible name quietly breaks."
      zh: "目标够大，若名称为空也没用。那篇用一个案例深挖无障碍名称是怎么悄悄出错的。"
---

The automated accessibility score read 92. A near-green number at the top of the report. Yet lower on the same page, the pagination links measure 22px on a side. Tap "3" with your thumb and "2" or "4" goes along with it. The score looks like a pass while your fingertip keeps sliding off.

That gap is where this post starts. I planted one of WCAG 2.2's new success criteria, <strong>SC 2.5.8 Target Size (Minimum)</strong>, in a sandbox and measured it twice: once with a script I wrote, once with Lighthouse. Here's the conclusion up front. Automated tools now catch obvious size violations just fine. But the real difficulty of this criterion isn't size, it's the <strong>exceptions</strong>, and judging those is still a human's job.

## Where 24×24 comes from

Foundations first. WCAG (Web Content Accessibility Guidelines) is the web accessibility standard produced by the W3C's WAI. Version 2.2 became a formal W3C Recommendation on October 5, 2023; the current edition is dated December 12, 2024, and it was approved as ISO/IEC 40500:2025 on October 21, 2025. It adds nine success criteria over 2.1 and retires one old one, 4.1.1 Parsing.

Of those nine, the one that makes you touch CSS today is <strong>SC 2.5.8 Target Size (Minimum)</strong>, Level AA. The wording is short. Straight from the W3C text: "The size of the target for pointer inputs is at least 24 by 24 CSS pixels, except when…". A pointer target must be at least 24×24 CSS pixels. This is for people who can't aim precisely at a small control: thick fingers, a tremor, a moving bus.

Don't confuse the numbers. 24×24 is the AA <strong>floor</strong>. Above it sits SC 2.5.5 Target Size (Enhanced), Level AAA, which asks for 44×44. For reference, Apple's Human Interface Guidelines recommend 44pt and Android's Material recommends 48dp. Those two are platform recommendations, not W3C standards, so treat them as reference values only. In practice I build new components at 44 or more from the start and use 24 as the pass line when auditing legacy code.

The "CSS pixels" qualifier earns its keep here. The rule is measured in CSS pixels, not physical ones, so on a high-density screen with a device pixel ratio of 3, `min-height: 24px` still satisfies it. Get the viewport meta tag wrong and let zoom behave oddly, though, and the math drifts. That's why I measure post-render with `getBoundingClientRect()` rather than trusting the stylesheet.

## Planting the bugs, measuring by hand

Words alone don't land it. So I built a static page with violations deliberately seeded in. Four sections in a throwaway sandbox:

- toolbar-bad: four 16×16 icon buttons (Bold / Italic / Underline / Link)
- pager-bad: five pagination links authored at 20×20 that render as 22×22 once a 1px border is added, zero spacing
- toolbar-good: the same buttons grown to `min-width/min-height: 24px` plus padding
- pager-good: 24×24 with `margin: 2px` for spacing too

The core markup:

```html
<!-- violation: 16x16 -->
<section class="toolbar-bad">
  <button aria-label="Bold">B</button>
  <button aria-label="Italic">I</button>
</section>

<!-- compliant: 24x24 minimum -->
<section class="toolbar-good">
  <button aria-label="Bold">B</button>
  <button aria-label="Italic">I</button>
</section>
```

```css
.toolbar-bad button  { width: 16px; height: 16px; padding: 0; }
.toolbar-good button { min-width: 24px; min-height: 24px; padding: 4px; }
```

Before handing anything to axe or Lighthouse, I wrote a script that computes the criterion directly. That gives me a control group for what the automated tools do and don't see. The auditor does two things. First, it measures the rendered size of every interactive target and flags anything under 24. Second, it applies the <strong>Spacing exception</strong> to what it flags: it centers a 24px-diameter circle on each target's bounding box and checks, by Euclidean distance, whether any two circles intersect.

```javascript
// WCAG 2.2 SC 2.5.8 minimum target size auditor
(() => {
  const MIN = 24, R = 12; // 24px diameter -> radius 12
  const sel = 'a[href],button,input,select,textarea,' +
              '[role="button"],[role="link"],[tabindex]:not([tabindex="-1"])';
  const els = [...document.querySelectorAll(sel)]
    .filter(el => el.offsetParent !== null);
  const boxes = els.map(el => {
    const r = el.getBoundingClientRect();
    return { w: Math.round(r.width), h: Math.round(r.height),
             cx: r.left + r.width / 2, cy: r.top + r.height / 2,
             label: el.getAttribute('aria-label') || el.textContent.trim().slice(0, 12) };
  });
  const findings = [];
  for (const b of boxes) {
    if (!(b.w < MIN || b.h < MIN)) continue;         // 24+ passes
    const tooClose = boxes.some(c =>                  // spacing-exception check
      !(c.cx === b.cx && c.cy === b.cy) &&
      Math.hypot(c.cx - b.cx, c.cy - b.cy) < 2 * R);
    findings.push({ label: b.label, size: `${b.w}x${b.h}`,
                    verdict: tooClose ? 'FAIL' : 'PASS(spacing)' });
  }
  return { total: boxes.length, undersized: findings.length, findings };
})();
```

Here's what it returned in Chrome:

```json
{
  "total": 18,
  "undersized": 9,
  "findings": [
    { "label": "Bold",  "size": "16x16", "verdict": "FAIL" },
    { "label": "Italic","size": "16x16", "verdict": "FAIL" },
    { "label": "Underline","size":"16x16","verdict":"FAIL" },
    { "label": "Link",  "size": "16x16", "verdict": "FAIL" },
    { "label": "1", "size": "22x22", "verdict": "FAIL" },
    { "label": "2", "size": "22x22", "verdict": "FAIL" },
    { "label": "3", "size": "22x22", "verdict": "FAIL" },
    { "label": "4", "size": "22x22", "verdict": "FAIL" },
    { "label": "5", "size": "22x22", "verdict": "FAIL" }
  ]
}
```

Nine of 18 targets fell under 24, all FAIL. The 24×24 targets in the good sections never got flagged; they dropped out at the measurement stage. The fun part is pager-bad coming back as 22×22. I wrote 20px in the CSS, but a 1px border on each side pushed the rendered size to 22. Reading the code by eye would miss that error. Measuring post-render exposes it.

## How far did the automated tools see?

Now the control group. I ran the same page through a Lighthouse mobile snapshot. Accessibility score: <strong>92</strong>. Two audits failed: `target-size` and `landmark-one-main`. The `target-size` audit, powered by axe-core, scored 0 and pointed at the exact same nine nodes.

```
Accessibility: 92
Failed audits: target-size, landmark-one-main
target-size: score=0, flagged 9 nodes
  <button aria-label="Bold"> ... <a href="#5">
```

Two things worth pinning down.

The good news first. The trope that "automated tools only see the surface of accessibility" is out of date for this criterion. axe-core now ships a `target-size` rule, and it named the <strong>exact same nine</strong> my auditor did. That my verdict, spacing math included, matched axe's tells me the tool actually implements the 24px-circle-overlap logic. On size violations alone, axe is reliable. This is a counter-case to my earlier experiment on [the four things axe structurally misses](/en/blog/en/axe-automated-a11y-coverage-gap-2026). Back then, the checks that need human judgment stayed hidden behind the green; target size, being rule-shaped, is one the automation caught up to.

The bad news. The score was still 92. A page with one AA success criterion plainly broken gets a 92. The score is a weighted average, so one rule at zero still looks like a pass when the rest carry it. <strong>A score is not conformance.</strong> WCAG is a binary pass/fail, not a continuous value like 92. To claim AA you have to meet every AA criterion, 2.5.8 included, with no exceptions. That's why you don't hand a dashboard's green number over as evidence of conformance. This trap outlives even the [basic catch-and-fix flow with Lighthouse](/en/blog/en/a11y-lighthouse-audit-fix-2026).

## The exceptions are the real exam

Here's the heart of the criterion. 2.5.8 requires 24×24 but carves out five exceptions. In the W3C's order:

| Exception | Gist | Tool-decidable? |
|---|---|---|
| Spacing | Small is fine if the 24px circles don't intersect | Partly (geometry) |
| Equivalent | The same function exists via another control that meets the size | No (human) |
| Inline | The target sits in a sentence or is bound by line-height | Partly |
| User agent control | The browser, not the author, sets the size | Partly |
| Essential | The presentation is essential or legally required | No (human) |

The Spacing exception is the one you'll reach for most. The original: "Undersized targets … are positioned so that if a 24 CSS pixel diameter circle is centered on the bounding box of each, the circles do not intersect another target or the circle for another undersized target." Center a 24px-diameter circle on each target; if those circles don't overlap, an under-24 target still passes. For two circles not to overlap, their centers must be at least 24px apart.

That explains why my pager-bad fails. The 22×22 links sit with no gap, so adjacent centers are 22px apart, under 24, and the circles overlap. But leave the links at 22×22 and add `margin` to push the centers 24px or more apart, and they pass through the Spacing exception without growing at all. That's the escape hatch for dense toolbars or data-heavy tables where you physically can't enlarge the icons.

The rest of the exceptions are the problem. Equivalent and Essential can't be decided by automation in principle. "Is there a larger button elsewhere on the page for the same function as this tiny delete icon?" requires understanding what the page means. So even when axe marks a target FAIL, whether that's a real violation or a covered exception is yours to confirm. Put honestly: <strong>an automated FAIL is a signal to review for exceptions, not a final verdict on its own.</strong> And an automated PASS is no guarantee of conformance either.

## Fixing it in code

The prescription splits by cause.

The common case: a target that simply didn't hit the size. Set a floor. Reach for `min-width`/`min-height`, not `width`; you want the target to grow with its content but never drop below 24.

```css
/* icon button: keep the visual size, grow only the hit area to 24 */
.icon-btn {
  min-width: 24px;
  min-height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
```

If you need to keep a 16px icon visually but widen the fingertip area, extend the hit target with transparent padding or a pseudo-element.

```css
.tiny-icon { position: relative; }
.tiny-icon::after {           /* invisible 24x24 hit area */
  content: "";
  position: absolute;
  inset: 50% auto auto 50%;
  width: 24px;
  height: 24px;
  transform: translate(-50%, -50%);
}
```

For a dense UI where you truly can't enlarge anything, route it through the Spacing exception. Secure a 24px-or-more center distance with `gap` or `margin`.

```css
/* keep 22x22 but push center distance to >=24px -> passes via Spacing */
.pager a {
  width: 22px;
  height: 22px;
  margin: 0 2px;   /* 22 + 2 + 2 = 26px between centers */
}
```

Then keep that auditor script on hand as a bookmarklet or a CI step. Even when axe looks like enough, the habit of reading the post-render numbers yourself catches errors like that 1px border. I use it as the last box on my pre-deploy manual check.

## Pitfalls that keep catching people

Run the audit a few times and you trip in the same spots. Four to note up front.

First, mixing up `width` and `min-width`. `width: 24px` clips overflowing content or pins the target to exactly 24. You want a floor, not a fixed size. Always use `min-width`/`min-height`. That single distinction stops a button whose text grew in a responsive layout from quietly turning into a violation.

Second, overlapping hit areas. When you extend a 24×24 hit area with `::after`, if two adjacent icons' extended areas overlap, the wrong target fires. The visual is small, but the actual click region has widened. Extend, but only up to the line where you don't overlap a neighbor. The 24px-circle-overlap math earns its keep here too.

Third, targets shrunk with `transform: scale()`. CSS `transform` shrinks the paint, not the layout size. So `getBoundingClientRect()` returns the on-screen size after the scale, which is easy to get wrong against your intent. If you scaled an icon down, remember to re-measure at the post-scale size.

Fourth, trusting the focus ring and relaxing. A clearly visible keyboard focus doesn't mean the pointer target is big enough. 2.5.8 is about pointer inputs like mouse and touch, a separate axis from keyboard accessibility (2.1.1) or focus visibility (2.4.11). Accessibility doesn't roll one axis into the next; clearing one doesn't clear another. As with [an accessible name that quietly goes empty](/en/blog/en/accessible-name-agents-2026), size, name, and focus each need their own check.

## Wrap-up: what a developer does about 24px

Compressed: WCAG 2.2 SC 2.5.8 nails the minimum pointer-target size to 24×24 CSS pixels at Level AA, automated tools catch the size violations well but leave the exception calls to you, and a score like 92 is not evidence of conformance.

As a pre-deploy checklist:

- Measure the rendered size of every button, link, and input. Read `getBoundingClientRect()`, not the CSS value.
- When something comes back under 24, prescribe in three ways. First, grow it with `min-width/min-height: 24px`. Second, if the visual size must stay, extend a transparent hit area. Third, when you truly can't enlarge, engineer a 24px-plus center distance for the Spacing exception.
- For anything axe marks FAIL, confirm by hand whether it falls under the Equivalent or Essential exception.
- Don't submit a dashboard score as a conformance report. AA is a binary pass.
- Build new components at 44 or more from the start and you clear AA and AAA in one move.

It's a small number, but a UI your fingertip keeps missing is a hard UI to use no matter how green the score. 24px is the least you owe that fingertip.

If you want structured data emitted reliably server-side, or a code-level review of an existing site's accessibility, target sizes, or GEO readiness, I take on consulting and implementation work personally. The contact path in my profile is the easiest way to reach me.
