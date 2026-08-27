---
pubDate: '2026-08-28'
title: 'Reflow at 400% Zoom: Where 82 Pixels Go to Die'
description: 'A measured teardown of WCAG 1.4.10 reflow budgets at 320px width: which
  elements eat vertical space at small viewports, why percentage loss is misleading,
  and what to fix first.'
heroImage: ../../../assets/blog/wcag-reflow-118px-absolute-toll-2026/hero.png
---

# Reflow at 400% Zoom: Where 82 Pixels Go to Die

## What

WCAG Success Criterion 1.4.10 (Reflow) sets a hard floor: content must be presentable without loss of information or functionality, and without two-dimensional scrolling, at a width equivalent to 320 CSS pixels (vertical scrolling content) or a height equivalent to 256 CSS pixels (horizontal scrolling content) [1]. At the standard 400% zoom relationship, that 320px width corresponds to a viewport of roughly 320 by 256. The criterion's understanding document is explicit about the math: 400% applies to the dimension, not the area — four times the default viewport width *and* four times the default height, independently [4].

We ran a viewport-budget audit across four page templates and four viewport heights (844, 400, 256, and 200 CSS pixels), at width 320, in both a top-of-page state and a mid-scroll state. The headline number: at a 200-pixel-tall viewport, only **118 pixels of vertical space actually reach the body content**. The rest is consumed before the first paragraph of prose.

That is not a rendering bug. It is the sum of design decisions, each individually defensible, compounding exactly like unbounded retries in a distributed system: no single component is wrong, but the aggregate exhausts the budget.

## The Analogy

Think of your viewport as a rate-limited resource — call it 200 requests per second. Every fixed and sticky element on the page is a background job drawing from that same quota. A header here, an ad container there, a back-to-top button: each one argues it is essential. The problem is that unlike most shared infrastructure, this quota does not elastic-scale. When the viewport shrinks, the consumers do not. The header stays 82 pixels tall. The ad container stays 90 pixels tall. At 844 pixels of height, those reservations are noise. At 200, they are 86% of the total.

This is the classic noisy-neighbor problem, except the neighbors are your own components, and the scheduler is the CSS layout engine — which, notably, does not do admission control. It will happily oversubscribe the viewport until nothing useful is visible, and report no error.

## Detail

### The horizontal test passes cleanly

First, the good news. Across all 8 test rows (four templates — post, post2, index, home — at h=844 and h=200), the horizontal judgment for 1.4.10 passes 8 out of 8:

| template | h | clientWidth | scrollWidth | h_overflow_px | reflow_pass |
|----------|-----|-------------|-------------|---------------|-------------|
| post | 844 | 320 | 320 | 0 | true |
| post | 200 | 320 | 320 | 0 | true |
| post2 | 844 | 320 | 320 | 0 | true |
| post2 | 200 | 320 | 320 | 0 | true |
| index | 844 | 320 | 320 | 0 | true |
| index | 200 | 320 | 320 | 0 | true |
| home | 844 | 320 | 320 | 0 | true |
| home | 200 | 320 | 320 | 0 | true |

`clientWidth 320 = scrollWidth 320`, zero horizontal overflow, on every row. The layouts reflow correctly in the horizontal dimension. If you stop the audit here — as many teams do — you conclude the site is reflow-compliant.

### The vertical budget tells a different story

The vertical dimension is where the money goes. Measured at h=200, top-of-page state, across 6 out of 6 reproductions (consistent with a self-audit on 2026-08-09):

```
usable_px 118 (h=200)
```

Two hundred pixels of viewport, 118 delivered to content. The 82-pixel gap is an **absolute constant**, not a proportional one. Across all four viewport heights, the loss is identical:

```
844 − 762 = 82
400 − 318 = 82
256 − 174 = 82
200 − 118 = 82
```

This is the single most important property in the dataset, and it is counterintuitive if you reason in percentages. A percentage-based mental model says a fixed header "costs 10% of the viewport." That is wrong. It costs 82 pixels, period. The viewport height is the denominator that changes; the tax does not. It behaves like a fixed reservation — a statically allocated shard — not like load-proportional traffic.

### Attribution: who owns the 82 pixels

Instrumenting each element's position and size at each viewport height gives a clean attribution. The 82-pixel top-state loss belongs to the **static header block**, not to any fixed or sticky chrome. The header is 82 pixels tall on every page and at every height, and its positioning mode flips: `sticky` at h=844, `static` at h=200 — reproduced 6 out of 6.

That flip is itself interesting. The header degrades from sticky to static as the viewport collapses, which sounds like graceful behavior — the sticky layer steps aside. But the layout cost is unchanged. The header occupies the same 82 pixels whether it sticks or not. Degrading the *behavior* did nothing to the *budget*.

The mid-scroll state adds a second consumer. After scrolling, the loss is 90 pixels, and attribution isolates it to a single element: a fixed-height bottom ad container (`#fixed_container_bottom`) that holds 400px of height regardless of the viewport:

```
#fixed_container_bottom removed: 200 (Δ +90)
ALL fixed/sticky removed:        200 (Δ +90)
individual deltas sum = ALL sum
```

The additivity is exact: removing just the ad container recovers the full 90 pixels, and removing everything fixed/sticky recovers the same 90 — no overlap, no hidden interaction costs. In distributed-systems terms, this is a pleasantly serial failure mode. Each pixel has exactly one owner. There is no contention, no double-counting, no emergent cost from element overlap. That makes remediation tractable: you can rank consumers by delta and fix them in order.

### The percentage trap, quantified

Here is where the same 90-pixel consumer looks like two completely different problems:

| viewport | state | ad container loss | share of viewport |
|----------|-------|-------------------|-------------------|
| h=844 | mid | 90px | 10.7% |
| h=200 | top | — | 41.0% |
| h=200 | mid | 90px | 45.0% |

At a phone-sized 844-pixel viewport, a fixed bottom ad eating 10.7% of the screen is a familiar, arguably acceptable trade — every ad-supported site makes it. At h=200 mid-scroll, the identical container takes **45.0%** of the viewport. Same element, same 90 pixels, nearly a quarter to a fifth of the perceived severity depending on which number you report.

If your accessibility dashboards express fixed-element cost as a percentage of viewport, they will systematically under-report the worst cases. The failure regime is precisely where the percentage looks smallest relative to the absolute harm. Report absolute pixels as the primary metric; derive percentages only for prioritization against a specific target viewport.

### The element that costs nothing

One more data point that resists intuition. A fixed back-to-top button (h=48, visible in the mid-scroll state) has a **vertical budget cost of zero**:

```
#back-to-top removed: 110 (Δ 0)
```

Remove it, and usable space at h=200 mid goes from 110 to 110. The button is fixed-positioned and floats over content; it reserves no layout space. The 82-pixel header and the 90-pixel ad container reserve space *in flow* (or hold a fixed slice of the viewport); the button merely occludes pixels it does not claim.

This distinction — space-reserving versus space-occluding fixed elements — is the actual axis of the problem, and it maps to the W3C's own guidance. C34 (deferring rendering of non-critical or hidden content) notes that "sticky regions always stay visible in the viewport while the other content will disappear underneath when scrolling" [3]. And the Understanding document for 1.4.10 warns directly that sticky or fixed content "can pose significant issues for those who would benefit from Reflow, as aside from obscuring keyboard focus, such sticky or fixed content can make reading content difficult if not impossible" [2]. The criterion is not just about scrollbars appearing in two dimensions; it is about whether a usable reading surface survives the chrome.

And when you remove all chrome entirely at h=200 mid-scroll, you recover the full 90 pixels — the fixed elements are, in aggregate, the entire mid-state gap.

## So what

Three things change for you if you own a frontend that must pass 1.4.10.

**First, audit vertically, not just horizontally.** The horizontal test passing 8/8 tells you your grid and media queries work. It says nothing about whether a 256-pixel-tall viewport leaves room for a paragraph. Measure `usable_px` at the criterion's implied heights (256 for the 400%-zoom height equivalent, plus smaller stress points like 200). A page can pass the letter of the horizontal test while delivering 118 pixels of body at h=200 — technically no two-dimensional scrolling, practically unreadable, and squarely in the territory the Understanding document flags for sticky and fixed content [2].

**Second, build a per-element delta ledger, not a component inventory.** The additivity we measured — each element's removal delta summing exactly to the all-removed delta — means you can produce a ranked table of pixel costs: header, 82, static/sticky; bottom ad container, 90, fixed, viewport-height-independent; back-to-top, 0, fixed, non-reserving. Treat this ledger like a flame graph for layout budget. The W3C's own technique C34 gives you the remediation vocabulary: defer rendering of non-critical content so it does not hold the viewport hostage [3]. The ad container is the canonical candidate — 90 pixels that cost 45% of the viewport at h=200 mid-scroll are not deferrable, they are the bug.

**Third, kill percentage-based reporting.** The 82-pixel header loss is invariant across 844 down to 200. Any metric that divides by viewport height will make the same component look four times cheaper on a phone than on a 200-pixel stress viewport, when the actual harm is concentrated at the small end. The fixed reservation is the failure mode; absolute pixels are the honest unit. And note that "fixed height" consumers are the worst class here: `#fixed_container_bottom` holds 400px of height regardless of viewport, meaning it does not degrade at all. If a component must be fixed, make its reservation scale down with the viewport or remove it from flow entirely — the back-to-top button proves zero-cost fixed elements are achievable.

Reflow compliance, in the end, is a capacity-planning problem. Your viewport is the cluster. Your fixed and sticky elements are resident daemons. At 844 pixels the cluster has slack and everyone coexists. At 256 and below, the daemons win and the user loses. The criterion's 320-by-256 floor [1] is your SLO; the per-element pixel ledger is how you keep it.

## References

1. W3C. "Success Criterion 1.4.10 Reflow." *WCAG 2.2*. https://www.w3.org/TR/WCAG22/#reflow (fetched 2026-08-23). Quote: "Content can be presented without loss of information or functionality, and without requiring scrolling in two dimensions for: Vertical scrolling content at a width equivalent to 320 CSS pixels; Horizontal scrolling content at a height equivalent to 256 CSS pixels."
2. W3C WAI. "Understanding Reflow." https://www.w3.org/WAI/WCAG22/Understanding/reflow.html (fetched 2026-08-23). Quote: "Such sticky or fixed content can pose significant issues for those who would benefit from Reflow, as aside from obscuring keyboard focus, such sticky or fixed content can make reading content difficult if not impossible." The 400% note: "It should be noted that 400% applies to the dimension, not the area. It means four times the default zoom level viewport width and four times the default zoom level height."
3. W3C WAI. "C34: Defer rendering of non-critical or hidden content." *WCAG 2.2 Techniques*. https://www.w3.org/WAI/WCAG22/Techniques/css/C34 (fetched 2026-08-23). Quote: "Sticky regions always stay visible in the viewport while the other content will disappear underneath when scrolling."
4. Internal viewport-budget audit, probe-2026-08-23-viewport-budget-series-1-what-400-zoom-leaves-2026 (measurements 2026-08-23; cross-checked against self-audit of 2026-08-09). Raw values: `usable_px 118 (h=200)`; `844−762 = 400−318 = 256−174 = 200−118 = 82`; header fixed at 82px across all pages and heights, `sticky` at h=844 / `static` at h=200, 6/6 reproductions; `#fixed_container_bottom` removal delta +90 at h=200 mid, additivity with ALL-removal confirmed; loss share 10.7% at h=844 mid and 45.0% at h=200 mid (41.0% at h=200 top); `#back-to-top` removal delta 0 at h=200 mid; horizontal reflow pass 8/8 with `clientWidth 320 = scrollWidth 320`, `h_overflow_px 0`.