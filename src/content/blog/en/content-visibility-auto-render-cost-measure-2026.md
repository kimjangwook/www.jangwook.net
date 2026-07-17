---
title: 'content-visibility Measured: One CSS Line, 15x Less Forced Layout'
description: 'Same HTML, same bytes, one extra CSS line — and forced layout dropped from 27.3ms to 1.8ms. I measured content-visibility: auto with a Chrome trace, plus its contain-intrinsic-size and accessibility traps.'
pubDate: '2026-07-17'
heroImage: '../../../assets/blog/content-visibility-auto-render-cost-measure-2026/hero.png'
tags:
  - Core Web Vitals
  - CSS
  - Web Performance
  - Rendering
relatedPosts:
  - slug: cls-layout-shift-reserve-space-measure-2026
    score: 0.72
    reason:
      ko: 그 글의 핵심이 이미지 자리 예약이었는데, 여기 contain-intrinsic-size가 같은 발상을 오프스크린 섹션 전체에 적용한 것이다.
      ja: あちらは画像の場所を予約する話で、こちらの contain-intrinsic-size は同じ発想を画面外セクション全体へ広げたものだ。
      en: That post was about reserving space so images don't shove the layout. The contain-intrinsic-size in this one is the exact same idea, scaled up to entire off-screen sections. One principle — reserve the space — governs both CLS and render cost.
      zh: 那篇讲预留图片位置，这里的 contain-intrinsic-size 是把同一思路扩展到整段屏幕外内容。
  - slug: lcp-image-preload-scanner-fetchpriority-2026
    score: 0.63
    reason:
      ko: LCP 글이 앞단이라면, 이 글은 안 보이는 건 안 그린다는 뒷단이다.
      ja: LCPの記事が前段なら、こちらは見えないものは描かないという後段だ。
      en: If that LCP post is the front end of what the browser paints and when, this is the back end of don't paint what isn't visible. Both trim initial render, from opposite directions, so reading them together shows where the render budget actually goes.
      zh: 如果那篇 LCP 是前端，这篇就是看不见的干脆不画的后端。
  - slug: a11y-lighthouse-audit-fix-2026
    score: 0.55
    reason:
      ko: content-visibility로 콘텐츠를 숨겼다가 스크린 리더나 검색에서 사라지면 그게 사고다.
      ja: content-visibility で隠したつもりがスクリーンリーダーや検索から消えたら事故だ。
      en: Performance work can quietly break accessibility — hide content and have it disappear from a screen reader or find-in-page, and that's the accident. The measure-first Lighthouse habit from that post is the safety net for "fast, but still reachable?"
      zh: 用 content-visibility 隐藏内容却让它从屏幕阅读器或搜索中消失，就是事故。
---

Same HTML. Same bytes. One extra line in the stylesheet. Forced layout cost fell from 27.3ms to 1.8ms, and initial LCP went from 464ms to 106ms. I didn't touch JavaScript, image optimization, or server config. I just told the browser not to compute what isn't on screen right now.

That one line is `content-visibility: auto`. I built two copies of a deliberately heavy 400-section page and measured, with a Chrome DevTools trace and the Performance API, exactly what this property saves and how much. Every number below is a real reading from that sandbox. And at the end I'll show the one spot where this optimization can quietly break accessibility.

## What the browser pays for every frame

Start with the foundation. Every time the browser puts a page on screen, it runs a fixed pipeline: compute styles from the DOM and CSS, work out where each element sits and how big it is (layout), paint the pixels, then composite the layers. The catch is that this work happens for the whole page. A single table cell 3,000 pixels below the fold gets the same style and layout computation as the hero you're actually looking at.

For a short blog post, none of this matters. For a long document, an infinite feed, a dashboard with hundreds of cards, or a huge product list, it does. The user sees one screenful, but the browser recomputes layout for tens of thousands of nodes it isn't showing — on every scroll, every resize, every font swap. That's the main reason heavy pages stutter when you scroll them.

So the obvious question: can't the browser just skip the parts nobody can see? The long-standing answer was JavaScript virtualization — render only the rows in view, drop the rest. It works, but it drags in a library dependency and it's easy to break search, anchor links, and assistive tech in the process. `content-visibility` hands that same job to the browser through a single CSS declaration, with the DOM left fully intact.

## The official definition: what auto actually turns on

The web.dev docs are precise about what `content-visibility: auto` does. An element with it gains <strong>layout, style, and paint containment</strong>. And when that element is off-screen and not relevant to the user (nothing inside it has focus or selection), it also gains <strong>size containment</strong> and stops painting and hit-testing its contents ([web.dev, content-visibility](https://web.dev/articles/content-visibility)).

In the doc's own words: "If the element is off-screen its descendants are not rendered. The browser determines the size of the element without considering any of its contents, and it stops there." The phrase that matters is "stops there." Style recalc, layout, paint — all skipped for the off-screen subtree. Then, when the user scrolls near it, the browser renders it. It's lazy rendering, done at the CSS layer instead of in JavaScript.

Mind the difference between `auto` and `hidden`. `content-visibility: hidden` always skips rendering, and the content stays invisible to the user and the accessibility tree until you render it programmatically. `auto` is conditional: defer while off-screen, render the moment it's relevant. Put `auto` on above-the-fold content and it renders immediately anyway. That's why the standard move is to apply it to the off-screen sections of a long page.

## Two copies of one page, differing by a single line

No repro, no claim. I built two static HTML files in a sandbox: 400 `<section>` elements, each with four paragraphs and a 12-row table. About 28,800 DOM nodes total, roughly 689KB of HTML — a deliberately heavy page standing in for a dashboard or a long report.

The DOM in both files is <strong>identical</strong>, and the byte counts are effectively the same. The only difference is this rule, present only in `cv.html`:

```css
section.cv {
  content-visibility: auto;
  contain-intrinsic-size: auto 480px;
}
```

Why the second line matters gets its own section below. For now, note that this one block is the entire change — not a line of JavaScript. I served both pages from a local server and traced each in Chrome (version 150, macOS, no network or CPU throttling).

## The results: initial render and forced layout

First metric: <strong>LCP (Largest Contentful Paint)</strong>, when the largest content element paints. By the Chrome trace, baseline came in at 464ms LCP (462ms render delay); the `content-visibility` version at 106ms (104ms render delay). About 4.4x faster. Both pages reported CLS of 0.00, so nothing shifted.

Here's the honest part. The LCP trace varied run to run. A repeat of baseline once read 220ms — the first load takes a cache-and-warmup hit. So I measured a second metric with far less noise: <strong>forced reflow cost</strong>. I invalidated styles across the whole document, read `offsetHeight` to force a synchronous layout, timed it, and took the median of 15 runs.

<figure>
  <img src="../../../assets/blog/content-visibility-auto-render-cost-measure-2026/layout-cost.png" alt="Bar chart comparing forced style and layout cost (baseline 27.3ms vs content-visibility 1.8ms, 15.2x faster) and LCP (464ms vs 106ms, 4.4x faster)" />
  <figcaption>Same DOM, same bytes, one CSS line apart. All values measured in a local sandbox.</figcaption>
</figure>

Baseline median: 27.3ms (min 26.5, max 39.6). `content-visibility` version: 1.8ms (min 1.5, max 2.7). Roughly 15x. This number wobbles less than LCP and tells the story more honestly, because forced layout directly exposes whether off-screen content joins the computation. Baseline relays out all 28,800 nodes every time; the `auto` version lays out only the handful on screen.

One aside: the Chrome trace flagged a DOMSize warning ("large DOM increases style and layout cost") for baseline, but not for the `content-visibility` version. From the browser's point of view, the effective DOM taking part in rendering shrank.

## Skip contain-intrinsic-size and your scrollbar goes haywire

This is where `contain-intrinsic-size` earns its keep. Skip rendering an off-screen section and the browser doesn't know its real height. Do nothing and that element collapses to zero height. All 400 sections fold to zero, then each one expands to its true height as you scroll it in, so the total document height keeps changing. The scrollbar jumps around and your scroll position drifts.

`contain-intrinsic-size` reserves that space in advance — a placeholder size the browser uses while it's skipping the render. In the doc's phrasing, it "specifies the natural size of the element if the element is affected by size containment." Add the `auto` keyword (as in `auto 480px`) and the browser remembers the actual rendered size after the first render and reuses it from then on.

This is the exact same instinct as [setting width/height on images to stop layout shift](/en/blog/en/cls-layout-shift-reserve-space-measure-2026): reserve the space up front so real content, when it arrives, doesn't shove everything around it. The measurement showed it plainly. The `content-visibility` page reported a `scrollHeight` of 206,294px against baseline's 302,454px. The gap isn't a bug — the `auto` version is holding not-yet-rendered sections at the 480px estimate. The further that estimate drifts from reality, the odder scrolling feels, so it pays to measure a few representative sections and set a close approximation.

## What about accessibility? auto is not display:none

Talk only about speed and you'll eventually ship an optimization that's actually an accessibility regression. Here's where `auto`'s most important property comes in. The web.dev docs are blunt: "The off-screen content remains available in the document object model and therefore, the accessibility tree (unlike with `visibility: hidden`). This means, that content can be searched for on the page, and navigated to, without waiting for it to load."

That sentence is the whole point. `content-visibility: auto` doesn't <strong>remove</strong> content; it <strong>defers rendering</strong> it. A screen reader can still read off-screen sections. Find-in-page (Ctrl+F) still finds text inside them and scrolls there. Anchor links still work. The things `display: none` and JS virtualization routinely break, `auto` keeps. Honestly, this is the property's real value to me: performance and accessibility usually pull against each other, and `auto` is a rare case where you get both.

There is a limit worth stating plainly, though. Browser support is now broad — Chrome and Edge 85+, Firefox 125+, Safari 18+. But Safari's find-in-page (Cmd+F) reportedly doesn't always find text deferred by `content-visibility: auto` (as of Safari 18.3.x — a third-party report, not official). Accessibility-tree exposure and per-browser find-in-page behavior are separate things, so if searchability matters for a given block, verify it in your target browsers rather than assuming.

## When to use it, and when not to

It's not a blanket win. Misapplied, it costs you. Here's the boundary I settled on while measuring.

Good fits: off-screen sections that stretch far below the fold, the lower parts of a long article, and repeating heavy blocks — cards, lists, comment threads, product grids. In short, anything that isn't visible now but needs to stay in the DOM.

Bad fits: applying it to content that's always in the first viewport buys nothing, since it renders immediately anyway. And it can interact badly with CSS scroll snapping, some `position: sticky` setups, and layouts that depend on container size.

The quietest trap is <strong>forced layout</strong>. As web.dev warns, the browser can only skip the work if you avoid calling DOM APIs that force rendering on a skipped subtree. Call `getBoundingClientRect()`, `offsetTop`, or `scrollHeight` on an off-screen element and the browser synchronously lays it out on the spot — and your savings evaporate. If your scroll-position math or animation hooks reach for those APIs by habit, audit them. Chromium prints a console message when you call one of these on a `content-visibility: hidden` subtree.

One more honest note: this saves <strong>rendering CPU, not downloaded bytes</strong>. The full HTML still comes down the wire. Initial paint and scroll responsiveness improve; network transfer does not. If bytes are your problem, you need [real lazy loading or server-side pagination](/en/blog/en/lcp-image-preload-scanner-fetchpriority-2026) as a separate move. The two optimizations solve different things.

## A checklist you can apply today

Here's the order I'd work in.

<strong>1. Pick candidates.</strong> Is the page long below the fold? Are there repeating heavy blocks — cards, rows, sections? If not, there's little to gain here. Don't force it in.

<strong>2. Apply it to off-screen blocks only.</strong> Leave first-viewport content out.

```css
.article-section,
.card,
.comment {
  content-visibility: auto;
  contain-intrinsic-size: auto 400px; /* approximate a representative block's real height */
}
```

<strong>3. Always pair it with contain-intrinsic-size.</strong> Leave it off and the scrollbar jumps. Measure a few representative blocks, set a close estimate, and let the `auto` keyword remember the real size after render.

<strong>4. Audit for forced layout.</strong> Any `getBoundingClientRect` or `offsetTop` call on off-screen elements erases the savings.

<strong>5. Measure again, and confirm it's still reachable.</strong> Time forced layout or scroll response before and after. Then check with a screen reader and Ctrl+F in your target browsers that off-screen text is still findable. Faster but unreachable is not an improvement.

The 15x number came from a deliberately extreme sandbox, and your real-site gain depends entirely on page structure. But the principle is solid: don't paint what nobody can see and the page gets faster. And `content-visibility` is one of the few ways to do that without breaking accessibility.

If you need structured data emitted reliably server-side, or you want a long page's render cost and Core Web Vitals fixed on the basis of real measurements rather than guesswork, I take on consulting and implementation privately — reach me through the contact link on my profile. I'd rather confirm "it's fast" with a trace and a number than with a vibe.
