---
title: "We Measured What 400% Zoom Leaves Behind, and Found a Fixed Pixel Toll"
description: "A 320px reflow pass did not prevent severe vertical reading-space loss at short viewports. The loss was a fixed pixel cost, largely outside the application CSS."
pubDate: '2026-08-23'
heroImage: '../../../assets/blog/viewport-budget-series-1-what-400-zoom-leaves-2026/hero.png'
tags:
  - Accessibility
  - WCAG
  - CSS
  - Responsive
  - Web Development
relatedPosts:
  - slug: reflow-1410-400-zoom-viewport-height-2026
    score: 0.92
    reason:
      ko: "400% 확대에서 가로 리플로우 통과와 세로 읽기 공간이 왜 다른 문제인지 먼저 설명합니다."
      ja: "400%ズーム時の横方向リフロー合格と、縦方向の閲覧余地が別問題である理由を説明します。"
      en: "Explains why passing horizontal reflow at 400% zoom does not establish usable vertical reading space."
      zh: "说明为什么在 400% 缩放下通过横向重排，并不代表仍有足够的纵向阅读空间。"
  - slug: focus-not-obscured-sticky-header-scroll-padding-2026
    score: 0.85
    reason:
      ko: "스티키 영역이 키보드 포커스와 읽기 흐름을 가리는 문제를 구현 관점에서 다룹니다."
      ja: "スティッキー領域がキーボードフォーカスと閲覧の流れを遮る問題を、実装の観点から扱います。"
      en: "Covers the implementation consequences when sticky regions obscure keyboard focus and reading flow."
      zh: "从实现角度讨论粘性区域遮挡键盘焦点和阅读流程的问题。"
  - slug: wcag22-target-size-audit-2026
    score: 0.72
    reason:
      ko: "접근성 준거 판정과 실제 사용성 회귀를 분리해 관리하는 감사 방식을 함께 볼 수 있습니다."
      ja: "アクセシビリティ適合性の判定と実際の使いやすさの後退を分けて管理する監査方法を確認できます。"
      en: "Shows how to separate conformance evidence from operational usability regression monitoring."
      zh: "展示如何将合规证据与实际可用性回归监控分开管理。"
---

# We Measured What 400% Zoom Leaves Behind, and Found a Fixed Pixel Toll

We wanted to know how much article space remains for a person using a 320px-wide, short viewport equivalent to 400% zoom. We measured the vertical pixels that could actually reach `article` or `main` across viewport heights, scroll states, page types, and browser-chrome conditions. The page passed every horizontal reflow check, yet at 320x200 only 118px of article space remained at the top, and a separate fixed-container effect reduced mid-page space to 110px.

That result matters because a conformance pass can be true while the reading experience is still operationally fragile. My recommendation is simple: keep WCAG conformance reporting intact, then add usable vertical pixels as a separate release-regression metric.

## A horizontal reflow pass did not describe the reading experience

Accessibility reporting in a large modernization program often compresses the answer to a neat statement: no automated violations, Reflow passes, release approved. That statement is useful. It is also incomplete when a low-vision user is navigating a page with limited viewport height.

WCAG 2.2 Success Criterion 1.4.10 requires vertical-scrolling content to work at a width equivalent to 320 CSS pixels. It does not prescribe a remaining vertical reading height for that content.

> Content can be presented without loss of information or functionality, and without requiring scrolling in two dimensions for: Vertical scrolling content at a width equivalent to 320 CSS pixels; Horizontal scrolling content at a height equivalent to 256 CSS pixels.
>
> — [Web Content Accessibility Guidelines (WCAG) 2.2 — SC 1.4.10 Reflow](https://www.w3.org/TR/WCAG22/#reflow)

That distinction showed up cleanly in the measurement. The horizontal check passed on all 8 tested page-and-height rows: `clientWidth` and `scrollWidth` were both 320, with no document-level horizontal overflow. At the same time, the 320x200 top condition left 118px of usable article space, equivalent to 4.2 lines at the measured line height.

For a CTO, this is not an argument against the criterion. It is an argument against asking a binary conformance signal to detect a continuous experience regression it was never designed to detect.

## At 400% zoom, height shrinks with width

A surprisingly common audit error is to simulate a narrow width while leaving a generous desktop-like height. That captures only half of the zoom condition.

> It should be noted that 400% applies to the dimension, not the area. It means four times the default zoom level viewport width and four times the default zoom level height.
>
> — [Understanding Success Criterion 1.4.10: Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)

We held width at 320px and tested heights of 844, 400, 256, and 200. In the top scroll state, usable article space was 762px, 318px, 174px, and 118px respectively. Every row lost exactly 82px.

That is the key architectural finding. The loss was not a percentage that responsively scaled down as the viewport shortened. It was an absolute pixel toll. The numerator stayed constant while the viewport-height denominator shrank, so the proportional damage became more severe at shorter heights.

At 844px, the 82px cost was modest. At 200px, it consumed 41.0% of the viewport. A component can look harmless in a conventional desktop review and become a material reading obstruction in the viewport where zoom users actually work.

## The header was not the culprit we expected

The first instinct in an investigation like this is to blame the sticky header. That instinct is reasonable. W3C guidance explicitly warns that sticky regions can consume a large share of a small or zoomed viewport.

> Sticky regions always stay visible in the viewport while the other content will disappear underneath when scrolling. In terms of content visibility, this is often not a problem on the desktop and on mobile devices in portrait orientation. However, when using mobile devices in landscape orientation or when zooming in on the desktop, sticky regions may block a big portion of the screen: the height of the sticky region may leave only a small part of the screen for the display of page content.
>
> — [C34: Using media queries to un-fixing sticky headers / footers](https://www.w3.org/WAI/WCAG22/Techniques/css/C34)

But the measurements separated the mechanisms.

At the top of the page, the 82px header was in normal document flow at the short height. It was static, not fixed or sticky, so it did not appear as an overlapping blocked region in the hit-test output. Once the user scrolled, it moved with the document and ceased to cost viewport space.

That behavior is aligned with the implementation direction W3C recommends for constrained viewport sizes.

> It is strongly suggested that at smaller viewport sizes that such components are modified to have static positioning, or their display can be toggled by the user.
>
> — [Understanding Success Criterion 1.4.10: Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)

In other words, the team-owned header had already been treated correctly. Its mid-page cost at the short viewport was zero. This matters operationally because teams often keep tuning the visible component they can edit while the real budget loss is being introduced at runtime by something else.

## A third-party fixed container consumed the mid-page budget

At 320x200 in the mid scroll state, usable content space fell to 110px. We removed browser chrome elements one by one and measured the recovery.

Removing the header recovered 0px. Removing the reading-progress element recovered 0px. Removing the back-to-top control recovered 0px. Removing the bottom fixed advertising container recovered 90px, bringing usable space from 110px to 200px. Removing all tested chrome recovered the same 90px, so the individual recoveries summed exactly to the total, showing no overlap between them.

The container itself had a measured height of 400px regardless of whether viewport height was 844px or 200px. It used `pointer-events: none`; the observed blocking came from a 90px portion within that runtime-inserted region. The exact child responsible for that 90px obstruction remains unresolved, and the back-to-top control being visible mid-page did not independently recover pixels in this test.

The commercial implication is more important than the DOM detail. A tag that is absent from your repository can still determine whether the user sees a usable article. This is familiar to teams operating data platforms and web services with external analytics, ad-tech, chat, consent, and experimentation dependencies: ownership of source code is not ownership of the delivered experience.

At 844px, the same 90px effect represents 10.7% of the viewport. At 200px, it represents 45.0%. A fixed pixel cost is a regressive tax on short viewports.

## We turned an ambiguous complaint into a repeatable engineering workflow

The useful metric was deliberately narrow:

`usable_px = vertical pixels where a hit test reaches article or main`

That is not a replacement for accessibility evaluation. It is a measurement that a release process can own.

The test harness used Playwright 1.58.2 with Chromium 145.0.7632.6 against the live site. It sampled rows in 2px steps at three horizontal positions and classified each vertical pixel by the element reached. We tested four heights, two scroll states, three chrome conditions, and five page types, with 27 total runs across the main measurement set.

Before accepting the metric, we applied three controls that I would require of any new experience measure entering executive reporting.

First, a chrome-free local prose page produced a ratio of 1.0 in every tested condition: usable space matched the entire viewport. The meter did not manufacture a loss.

Second, we set a falsification threshold in advance. If stripping all chrome recovered less than 10px at 320x200 mid-page, we would discard the claim that fixed chrome was consuming the budget. The observed recovery was 90px in all three runs.

Third, we excluded instability from the conclusion. The bottom-container effect was intermittent at larger heights and on some page types. It appeared consistently at the smaller heights, but not consistently enough elsewhere to support a universal absolute baseline for all states.

This is how teams avoid turning a useful internal metric into dashboard theater. Define one number. Prove the instrument is not causing the effect. Decide what result would invalidate the hypothesis before seeing the data. Then distinguish repeatable signals from suspicious but unresolved variation.

## The right gate is a regression gate, not a universal score

I would not begin by declaring that every page must retain a particular number of vertical pixels. The evidence does not support a universal threshold, and the intermittent runtime behavior would create noisy failures.

Instead, record a baseline for representative pages at 320x200 in the top state. Then fail a release when `usable_px` falls by 10% or more from that baseline.

The top state is the defensible first gate because it was stable: all six runs were byte-identical across the tested height ladder, and the 118px result reproduced the earlier audit. The mid state should remain a report-only diagnostic until the third-party loading behavior is understood. In the observed runs, the blocking effect varied from 3/6 to 6/6 depending on viewport and page context. A hard CI gate on that state would spend engineering attention on false failures.

This distinction has direct unit-economics value. A single CI job can test a page sample across two conditions. The measurement cost is modest compared with discovering, after launch, that a revenue, consent, or support dependency has displaced the primary content on the exact screen where a user needs to read it. More importantly, the metric gives review discussions a price tag. Adding 12px to a header is no longer an aesthetic choice alone; it is a measurable draw against a constrained viewport budget.

## The counter-argument is correct for conformance decisions

Calling 118px of usable height a WCAG 1.4.10 failure would be wrong.

The normative requirement for ordinary vertical-scrolling content is a width equivalent to 320 CSS pixels. This site passed the measured horizontal reflow checks. The criterion does not establish a minimum remaining vertical reading height. Using this internal measurement as evidence in a contractual, procurement, or legal conformance judgment would inflate the standard beyond its published requirement.

That matters because audit capacity is finite. If a team labels every undesirable experience pattern as a formal nonconformance, genuine failures lose urgency, remediation queues become less credible, and executives receive a report that confuses legal exposure with product-quality risk.

The counter-argument becomes dangerous only when it is extended too far. “Not a criterion failure” does not mean “not an operational defect.” A release can preserve 320px horizontal reflow while a fixed runtime container makes reading difficult or impossible in a short viewport. The W3C guidance itself recognizes the experience risk of fixed content during zoom.

> Such sticky or fixed content can pose significant issues for those who would benefit from Reflow, as aside from obscuring keyboard focus, such sticky or fixed content can make reading content difficult if not impossible.
>
> — [Understanding Success Criterion 1.4.10: Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)

The correct governance model is separation: use WCAG evidence for conformance, and use viewport budget evidence for regression management. Do not merge them. The first protects the integrity of compliance reporting; the second catches changes that compliance reporting cannot see.

## What CEOs and CTOs should change in the next release cycle

Start with inventory, not a redesign. Identify every element that can remain attached to the viewport: headers, footers, promotional units, chat launchers, consent surfaces, reading progress bars, floating actions, and externally injected containers. Assign an owner even when the implementation belongs to a vendor.

Then measure a small, representative page set at 320x200 top state and retain the current value as the baseline. Put that number in the deployment report beside conventional performance, error-rate, and accessibility summaries. Do not make it a release gate before you have a baseline.

For team-owned sticky regions, use height-aware behavior. C34 describes the practical pattern: change sticky regions based on available viewport height.

> Define the first sticky regions using media query min-height properties, so they get fixed or un-fixed depending on the available space
>
> — [C34: Using media queries to un-fixing sticky headers / footers](https://www.w3.org/WAI/WCAG22/Techniques/css/C34)

For third-party containers, a CSS-only solution may not exist because the cost is introduced after your application code runs. Make vertical occupancy part of vendor acceptance criteria and deployment verification. “Can we add this tag?” is the wrong approval question. “How many viewport pixels does it consume under constrained conditions, and who owns the rollback?” is the question that protects both conversion economics and accessibility experience.

The next practical step is to measure your own 320x200 top-state baseline on representative pages. If that baseline remains stable while users still report blocked reading space, this fixed-pixel budget model is wrong.

## References

1. [Web Content Accessibility Guidelines (WCAG) 2.2 — SC 1.4.10 Reflow](https://www.w3.org/TR/WCAG22/#reflow)
2. [Understanding Success Criterion 1.4.10: Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)
3. [C34: Using media queries to un-fixing sticky headers / footers](https://www.w3.org/WAI/WCAG22/Techniques/css/C34)
4. [CSS Text Module Level 3](https://www.w3.org/TR/css-text-3/)
