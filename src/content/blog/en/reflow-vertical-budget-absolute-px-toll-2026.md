---
title: The Vertical Budget a Reflow Pass Never Measures
description: 'A WCAG 1.4.10 Reflow pass says nothing about vertical readability, and
  a 27-run experiment on a live site shows why: a static header block and a fixed
  ad container charge an absolute 82px + 90px toll that scales with viewport height
  only in the denominator. The fix is a separate usable-pixel gate, not a reinterpretation
  of the spec.'
pubDate: 2026-08-27
heroImage: ../../../assets/blog/reflow-vertical-budget-absolute-px-toll-2026/hero.png
tags:
- wcag
- accessibility
- testing
relatedPosts:
- slug: declared-rules-fail-open-robots-txt-agents-md-2026
  score: 0.7
  reason:
    en: 'If you read how robots.txt rules were truncated yet passed silently, here
      you''ll see the same blind spot in viewport form: a Reflow pass that waves through
      vertically broken readability.'
    ko: 선언된 규칙이 잘려도 조용히 통과되던 robots.txt 사례를 읽었다면, 이번엔 Reflow 통과가 수직 가독성 붕괴를 그냥 놓쳐버리는
      측정의 사각지대가 그 공백의 뷰포트 버전임을 확인하게 된다.
    ja: 途中で切れてもエラーなく通過したrobots.txtの事例を読んだなら、今回はReflow合格が縦方向の可読性崩壊をそのまま見逃す測定の死角が、同じ空白のビューポート版であると確認できる。
    zh: 读过 robots.txt 规则被截断却静默通过案例的人,会在这里看到同一盲区的视口版本:Reflow 检测直接放行了纵向可读性的崩坏。
---

## The Blind Axis of the Horizontal Verdict

WCAG 1.4.10 Reflow asks one question about vertical scrolling content: can it be presented at a width equivalent to 320 CSS pixels without two-dimensional scrolling? The spec text is explicit — "Vertical scrolling content at a width equivalent to 320 CSS pixels" [2]. Width. The criterion says nothing about height, and it never claimed to.

Our test page passed that question eight times out of eight: `clientWidth 320 = scrollWidth 320, h_overflow_px 0, reflow_pass true (8/8)`. At the document level there is no horizontal scroll anywhere in the ladder. By the only axis the criterion measures, the page is clean.

Then we rotated the probe ninety degrees. In a 320×200 viewport — an ordinary desktop viewport quartered on each dimension by 400% zoom, because "400% applies to the dimension, not the area" [1] — only 118px of the 200px of vertical space actually touches the body prose. The other 82px is intercepted before a hit test reaches content.

This is the gap between what a compliance verdict measures and what practitioners read into it. The counterargument is correct on normative grounds: 1.4.10 governs width for vertical scrolling content by design, and conformance never promised a vertical guarantee. But practitioners use a 1.4.10 pass as a proxy for "readable when zoomed." Our data shows the proxy breaking at a specific, measured toll: 82px charged by a header block, plus 90px charged by a fixed ad container — both billed in absolute pixels regardless of node size. The counterargument is right inside the spec document; this article is about verdict practice outside it.

## The 320×200 Vertical Budget of 118px

Think of the viewport as a node in a cluster. Its capacity is the height in CSS pixels. Reading capacity is what remains after fixed reservations — the load balancer health checks, the log shipper, the sidecar that consumes the same 512MB whether the node has 8GB or 2GB. Fixed chrome behaves exactly like that sidecar: it does not scale with the node.

The measurement instrument is an `elementFromPoint` hit test: step down the viewport in 2px increments, probe at x = 25%, 50%, 75%, and count a pixel as usable only if the element at that point belongs to the reading content. A control run on local prose with no chrome returned ratio 1.0 on every line, which matters — it rules out the metric itself manufacturing the loss. The 118px figure is a property of the page, not of the probe.

The ladder, top scroll state:

| Viewport height | Usable px (top) | Loss vs. height |
|---|---|---|
| 844 | 762 | 82 |
| 400 | 318 | 82 |
| 256 | 174 | 82 |
| 200 | 118 | 82 |

118px of vertical budget remains reachable at the top scroll state. At h=200, that is a 41.0% loss; the same absolute loss at h=844 is under 10%. Reproduced 6/6.

## The 82px Toll That Ignores Node Height

In infrastructure terms, this is reserve capacity billed at a flat rate regardless of node size. Every operator knows this failure mode: a sidecar that reserves a fixed 512MB whether it lands on a 64GB machine or a 2GB one. On the big node the reservation is noise; on the small node it is the deployment. Here, 82px is 9.7% of h=844 and 41.0% of h=200. The ratio explodes not because the charge grows but because the denominator shrinks.

Why absolute? Because the blocking subjects do not respond to the viewport. The strongest evidence: the bottom ad container holds `height: 400px` whether the viewport is 844 or 200 — 6/6 runs. A resource that ignores the size of the node it runs on will always bill an absolute toll.

## Decomposing the Blocker — the 90px Bottom Ad Container

The mid scroll state tells a sharper story. At h=200 mid, usable pixels drop to 110, and the blocker is not the header at all — the header has gone `static` by this height and scrolled away with the document. The blocker is `#fixed_container_bottom`, a bottom ad container that holds its height at 400px whether the viewport is 844 or 200 — a fixed value independent of viewport height, 6/6.

The decomposition run removed elements one at a time at 320×200:

| Removed element | Usable px | Δ |
|---|---|---|
| header | 110 | 0 |
| reading-progress | 110 | 0 |
| #back-to-top (fixed, h=48) | 110 | 0 |
| #fixed_container_bottom | 200 | +90 |
| ALL chrome | 200 | +90 |

Individual removals sum to exactly the all-removal total: 0+0+0+90 = 90. No overlap, no double-counting. Remove the bottom container and usable pixels recover fully from 110 to 200 — identical across the six decomposition runs (md5-identical files), the same 110→200 recovery the all-chrome falsifier reproduced in 3/3 runs.

Two details deserve a senior engineer's attention. First, `#back-to-top` is fixed, 48px tall, and visible in the mid state — and its single-removal recovery is 0px. Visibility is not the same as obstruction; this element sits over content but never over the probed content lines. Second, the sums closing cleanly is what makes the decomposition trustworthy. When per-component recoveries add up to the total, you have a partition, not a pile of correlated guesses.

The trade-off, stated honestly: this experiment did not price the revenue that the ad container produces. The measurement is free — Playwright against a public site — but removing the container is not. That cost axis is unknown and unmeasured here.

## The elementFromPoint Hit Test and the Control Cell

For reproducibility, the metric's definition: for each 2px vertical step at x = 25%, 50%, 75% of the 320px width, call `document.elementFromPoint(x, y)` and ask whether the element at that point belongs to the body content. A row counts as usable if the hit test reaches body content in any probe column. `usable_px` is the count of usable rows.

The control cell defends this metric: on a local prose page with no chrome, every row scored `ratio 1.0`. The measurement apparatus itself produces no loss. What the metric measures is "pixels a pointer-based hit test can reach" — which is a definition, and a narrow one. Reading speed, screen-reader traversal, or keyboard reachability would each require their own study. This data supports only the first definition.

## What the Falsifier Corrected — the Static Header's Share

We designed a falsifier for the attribution, and it corrected us. The hypothesis going in: the 82px top-state toll was fixed chrome eating the vertical budget. We pre-registered two failure modes:

1. If removing *all* chrome fails to recover vertical pixels, the "fixed chrome eats the budget" axis collapses.
2. If the loss shrinks proportionally with viewport height rather than staying constant, the "absolute toll" thesis dies.

The falsifier run `chrome-stripped-recovery-844-vs-200` answered both. Removing all chrome recovered h=200 mid from 110 → 200 (+90, identical 3/3, nine hidden elements), so claim one survived. The 82px loss stayed identical across all four heights (844/400/256/200), so claim two survived too.

But the attribution did not survive intact, and here is why, plainly. The header's `position` is `sticky` at h=844 and `static` at h=200 (6/6 runs). Static elements flow with the document — they are not fixed chrome at all. So the 82px top-state toll is not fixed chrome's share; it is the header block's share *within the document flow*, charged at the top scroll state before it scrolls away. Our prediction got the magnitude right and the owner wrong: "fixed chrome's toll" should read "static header block's toll" at top. The genuinely fixed blocker is the 90px ad container at mid.

## What We Could Not Test

Honesty about the boundaries of the data:

- **We could not determine the sticky→static threshold.** We know the header is sticky at h=844 and static at h=200; we narrowed the threshold only to somewhere in (400, 844]. We have not confirmed whether it is the 480px breakpoint in the C34 example — the next lab will measure it.
- **Why the bottom-container blocking disappears intermittently** in some runs (suspected ad-load timing) is unresolved. That is why the mid numbers are 3/3 or 6/6 rather than clean sweeps.
- **home's h=200 top `usable_px = 0`** does not fit the 82px pattern, and with `blocked_px` empty we could not attribute the remaining 118px. It is the one page that breaks the pattern.
- **#back-to-top's cost on other axes** — obscuring keyboard focus, for instance — we did not measure. The W3C understanding document flags exactly this class of issue [1]; our hit test is silent on it.
- **Where the 97 descendant offenders on the post page clip** (worst_overflow_px 604, though document-level horizontal scroll is 0) is untracked.

## A Separate Gate, and the C34 Switch

The recommendation divides cleanly, because the fixed cost differs by page type:

**If you serve zoom users on a real site** — sticky headers, fixed containers — add a vertical budget audit as a *separate gate* next to your 1.4.10 automated check. Run the same ladder: 320px width, a height ladder (200 is the floor; add 256, 400, 844), top and mid scroll, `elementFromPoint` hit test per row. Assert usable_px against a threshold you set for your content's line height. Gate it in CI the same way you gate the reflow check. The cost is near zero: Playwright and a public site, 27 runs on one machine.

**Where fixed chrome is unavoidable at small heights**, apply C34: a media query keyed on `min-height` that switches sticky headers and fixed bottom containers to static positioning below the threshold [3]. Our data says the bottom ad container alone is worth 90px of recovery at h=200 mid — 45% of the viewport. That is the single highest-leverage switch on this page.

**If your page has no fixed chrome** — local reports, control documents, prose — 1.4.10 pass alone is sufficient, and a vertical budget gate is overkill. The control cell proved it: every row at ratio 1.0.

One cost caveat: this experiment did not price removing the ad container against revenue. The measurement is free; the remediation is not, and the trade-off is yours to make.

The general lesson reaches past accessibility. When a compliance check passes, the pass is valid only on the axes the standard elected to measure. Vertical budget was outside 1.4.10's axes by design — and nothing in the spec is wrong for that. But any team that reads the green check as "this works when zoomed" has converted a narrow guarantee into a broad one, and the conversion fails at exactly 82px + 90px. Audit the axes your gates don't measure; the ones that matter are the ones your users actually live on.

## References

1. Understanding Success Criterion 1.4.10: Reflow / W3C WAI. W3C. [Understanding Success Criterion 1.4.10: Reflow / W3C WAI](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html) (fetched 2026-08-23)
2. WCAG 2.2 Success Criterion 1.4.10 Reflow (spec) / W3C. [WCAG 2.2 Success Criterion 1.4.10 Reflow (spec) / W3C](https://www.w3.org/TR/WCAG22/#reflow) (fetched 2026-08-23)
3. CSS technique C34: Using media queries to un-fixing sticky headers / W3C WAI. [CSS technique C34: Using media queries to un-fixing sticky headers / W3C WAI](https://www.w3.org/WAI/WCAG22/Techniques/css/C34) (fetched 2026-08-23)