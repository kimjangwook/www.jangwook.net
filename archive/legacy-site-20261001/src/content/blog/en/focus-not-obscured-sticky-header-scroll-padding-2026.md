---
title: 'Zero Failures Tabbing Down, 16 Tabbing Up: Sticky Headers'
description: 'Tabbing down six pages found zero WCAG 2.4.11 failures. Shift-Tabbing up the same pages found 16, because browsers align focus targets to the nearer edge.'
pubDate: '2026-08-04'
heroImage: '../../../assets/blog/focus-not-obscured-sticky-header-scroll-padding-2026/hero.png'
tags:
  - Accessibility
  - WCAG
  - Keyboard
  - CSS
  - Web Development
faq:
  - question: 'Can axe or Lighthouse catch SC 2.4.11?'
    answer: 'Deque publishes the axe rule list, and it has no rule that judges whether focus is covered by other content. Of the criteria new in WCAG 2.2, roughly the only one with an automated rule is target size (2.5.8), so focus occlusion sits on the manual side. That is not a hard limit, though. The judgment needs hit testing against a scrolled layout, which no static DOM checker can do and any real browser can.'
  - question: 'What value should scroll-padding-top be?'
    answer: 'The measured height of your sticky element plus enough room for the focus ring. My header measures 81px on desktop and 82px on mobile, so I used calc(5rem + 1rem), which computes to 96px. Put the header height in a CSS variable and reference it, so the two numbers move together when the design changes. A sticky footer needs scroll-padding-bottom as well.'
  - question: 'Why not fix it with a focusin handler that scrolls the page?'
    answer: 'That works, but the order is wrong. You are scrolling a second time after the browser has already finished scrolling, so the viewport visibly jumps, and it fights any smooth-scroll setting. scroll-padding changes what the browser considers "in view" in the first place, so the very first scroll lands correctly and the browser does the math.'
  - question: 'Does fixing accessibility help search rankings?'
    answer: 'I did not measure any ranking effect and I have no basis for claiming one. SC 2.4.11 is a conformance and usability criterion. Its purpose is letting someone driving your site from the keyboard see where they are, and promising more than that would be overselling it.'
relatedPosts:
  - slug: wcag22-target-size-audit-2026
    score: 0.76
    reason:
      ko: 같은 WCAG 2.2 신설 기준을 다루지만 축이 다르다. 그쪽은 포인터가 닿을 크기, 이쪽은 그 크기가 헤더에 덮였는지다. 두 기준이 서로를 대신하지 못한다는 점이 두 글을 붙여 읽으면 분명해진다.
      ja: 同じWCAG 2.2の新規基準でも軸が違う。あちらはポインターが届く大きさ、こちらはその大きさがヘッダーに覆われていないか。二つの基準が互いを代替しないことが、並べて読むと見えてくる。
      en: Both cover criteria new in WCAG 2.2, but on different axes. That one is whether a target is big enough to hit; this one is whether that target stays visible under a header. Read together, they show why passing one says nothing about the other.
      zh: 两篇都讲 WCAG 2.2 新增的标准，但轴不同：那篇是指针能否点得到，这篇是点得到的东西有没有被吸顶头部盖住。并读就知道，过了一条并不代表另一条也过。
  - slug: modal-focus-escape-inert-measure-2026
    score: 0.72
    reason:
      ko: 모달에서 포커스가 새어 나가는 걸 재던 글이다. 이번 글은 포커스가 제자리에 있는데도 보이지 않는 경우를 잰다. 포커스 관리에는 "어디로 가는가"와 "간 곳이 보이는가"라는 두 문제가 따로 있다.
      ja: モーダルからフォーカスが漏れる挙動を測った記事。今回はフォーカスが正しい場所にあるのに見えないケースを測る。フォーカス管理には「どこへ行くか」と「行った先が見えるか」という別の問題がある。
      en: That one measured focus leaking out of a modal. This one measures focus sitting exactly where it should while being invisible. Managing focus is two separate problems, where it goes and whether you can see where it went.
      zh: 那篇测的是焦点从模态框漏出去。这篇测的是焦点明明在该在的位置，却看不见。焦点管理其实是两件事：去了哪里，以及去了之后看不看得见。
  - slug: axe-core-ci-a11y-jsdom-vs-browser-2026
    score: 0.68
    reason:
      ko: jsdom이 색상 대비를 판정 못 하는 이유를 파던 글이다. 포커스 가림은 그보다 한 칸 더 나간 경우다. 레이아웃뿐 아니라 스크롤 상태까지 필요하므로, 정적 DOM 검사기에는 애초에 규칙이 없다.
      ja: jsdomがコントラスト比を判定できない理由を追った記事。フォーカスの隠れはさらに一段先で、レイアウトだけでなくスクロール状態まで必要になる。だから静的DOM検査には最初からルールが無い。
      en: That post dug into why jsdom cannot judge color contrast. Focus occlusion sits one step further out. It needs scroll state, not just layout, which is why static DOM checkers have no rule for it at all.
      zh: 那篇追的是 jsdom 为何判不了对比度。焦点被遮挡还要更进一步，它需要的是滚动状态而不只是布局，所以静态 DOM 检查器里根本没有这条规则。
  - slug: wcag-em-2-sampling-vs-full-sweep-audit-2026
    score: 0.63
    reason:
      ko: 표본이 페이지 축에서 무엇을 놓치는지 셌던 글이다. 이번 글은 같은 페이지를 어느 방향으로 걷는지가 결과를 뒤집는다는 걸 보여준다. 커버리지에는 페이지 수 말고 다른 축이 있다.
      ja: 標本がページ軸で何を取り落とすかを数えた記事。今回は同じページをどちらの向きに歩くかで結果が反転することを示す。カバレッジにはページ数以外の軸がある。
      en: That audit counted what a sample misses along the page axis. This one shows the same pages flipping their verdict depending on which direction you walk them. Coverage has axes other than page count.
      zh: 那篇数的是抽样在页面这条轴上漏了什么。这篇则显示同样的页面，走的方向不同结论就反过来。覆盖率不止「页面数」这一条轴。
---

If your keyboard accessibility check came back clean, there's a decent chance it only walked one direction.

I ran the same judgment logic over the same six pages twice. Tabbing downward: zero failures of WCAG 2.2 SC 2.4.11 across 1,072 focus stops. Shift-Tabbing upward: 16 failures across 1,069 stops on the identical markup. Nothing about the site changed between the two runs. Only the direction of travel did.

Blame how a browser brings an off-screen focus target into view. It aligns the target to whichever edge is nearer. Move down the page and the element settles against the bottom edge, where nothing is waiting for it. Move back up and it settles against the top edge, which on my site is occupied by an 81-pixel sticky header.

## What 2.4.11 asks, and what it doesn't

Whether a focus indicator exists at all is an older criterion. What WCAG 2.2 added is whether that indicator survives contact with the rest of your layout. Those are separate questions. You can draw a 3-pixel ring, tune its contrast, and still ship a page where pressing Shift+Tab appears to do nothing, because the ring is underneath the header.

Here's the criterion text, quoted directly from the [W3C Recommendation](https://www.w3.org/TR/WCAG22/) dated 12 December 2024.

> When a user interface component receives keyboard focus, the component is not entirely hidden due to author-created content.

The load-bearing word is `entirely`. At Level AA, partial coverage passes. The stricter requirement lives separately as SC 2.4.12 at Level AAA, from the same document.

> When a user interface component receives keyboard focus, no part of the component is hidden by author-created content.

The [Understanding document](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html) explains why AA tolerates half a component being buried.

> In recognition of the complex responsive designs common today, this AA criterion allows for the component receiving focus to be partially obscured by other author-created content.

It also names the usual suspects outright.

> Typical types of content that can overlap focused items are sticky footers, sticky headers, and non-modal dialogs.

Two qualifiers decide most real cases. The first is `author-created content`: browser chrome and user-installed extensions covering your component are not your problem. The second is an explicit allowance for content the user opened themselves.

> Content opened by the user may obscure the component receiving focus. If the user can reveal the focused component without advancing the keyboard focus, the component with focus is not considered visually hidden due to author-created content.

Something the user opened and can dismiss without moving focus doesn't fail. A sticky header qualifies on neither count. Nobody opened it, and there's no way to put it away.

## No automated rule covers this

I went through Deque's published axe rule list. There is no rule for whether focus is covered by other content. Among the criteria new in WCAG 2.2, target size (2.5.8) is about the only one that got an automated rule.

My own sweep agreed. Two days ago I ran axe-core 4.12.1 across 1,342 built HTML pages, and the violations that came back were four rule types: labels, list structure, document title, and language attribute. Focus occlusion never appeared. What that full sweep did and didn't catch is written up separately in [the run where I compared a 26-page sample against all 1,342 pages](/en/blog/en/wcag-em-2-sampling-vs-full-sweep-audit-2026/).

I don't read the absence of a rule as "this can't be automated." The rule is missing because the information needed to decide isn't in a static DOM. You have to know where the element paints, what stacks above it, and how far the page has scrolled. That means a layout engine and hit testing, which is a solved problem the moment you launch a real browser. So instead of waiting for a rule, I measured.

## Press the actual keys, then poke the focus rect 25 times

Judging it takes very little code. Clip the focused element's client rect to the viewport, lay a 5×5 grid over it, and call `document.elementFromPoint` at each of the 25 points. If every point returns some other element, the component is entirely hidden. If only some do, it's partially hidden.

```js
const x0 = Math.max(0, r.left), y0 = Math.max(0, r.top);
const x1 = Math.min(innerWidth, r.right), y1 = Math.min(innerHeight, r.bottom);
let visible = 0, total = 0;
for (let i = 0; i < 5; i++) {
  for (let j = 0; j < 5; j++) {
    const x = x0 + (x1 - x0) * (i + 0.5) / 5;
    const y = y0 + (y1 - y0) * (j + 0.5) / 5;
    total++;
    const top = document.elementFromPoint(x, y);
    if (!top || top === el || el.contains(top) || top.contains(el)) { visible++; continue; }
    // Blame the nearest sticky/fixed ancestor, since that's what an author edits.
    const key = anchored(top) || desc(top);
    blockers[key] = (blockers[key] || 0) + 1;
  }
}
```

Treating an ancestor hit as visible matters more than it looks. An inline link wrapping onto a second line has a bounding rect that swallows the gap between the lines, and sample points in that gap return the link's parent. Count those as occlusion and every healthy multi-line link in your site turns into a violation.

I got the walk wrong twice. Version one counted key presses. Shift+Tab wraps from the first element back to the last, so it kept re-measuring the same elements, and a 2,141-stop measurement inflated to 4,149. Stamping every focusable element with a `data-fidx` number before the walk, then skipping numbers already seen, fixed that.

The second mistake is the one worth carrying away. I planned to iterate with `element.focus()`, which is far more convenient. It finds nothing. Chromium centers the target for a scripted `focus()` call: in an 800-pixel viewport, my landing point was y=367. Real Tab and Shift+Tab presses align to the nearest edge, and the same element lands at y=24. The failure only exists on the second path.

<strong>A script hunting this bug has to press real keys.</strong> An audit tool that iterates with `focus()` will report zero on any site, no matter how buried its focus indicators are. That single fact was the most useful thing this measurement produced.

## Turning around took the count from 0 to 16

Scope was six pages out of 1,350 built files (home, the post index, two long posts, about, contact) crossed with two viewports, 1280×800 and 390×844, for twelve combinations. Each combination got one Tab pass and one Shift+Tab pass.

```text
$ node scripts/audit-focus-obscured.mjs --path /ko/ --path /ko/blog/ ...
  pages           6 x viewports 2   (chromium 1.57)
  focus stops     2141   (forward 1072 / reverse 1069)
  2.4.11  AA      16   forward 0 / reverse 16
  2.4.12  AAA     199   forward 6 / reverse 193
  invisible focus 4
  AA blockers     {"header.site-header.sticky[sticky]":16}
```

All 16 AA failures had the same thing on top of them. The sticky header. No other candidate showed up.

![A focused summary element completely covered by the sticky header. Only the answer text below is visible; the question row and its focus ring are not](../../../assets/blog/focus-not-obscured-sticky-header-scroll-padding-2026/fully-obscured-summary.png)

That's what the failure looks like. A FAQ accordion `<summary>` on the home page took focus with a rect running from y=0 to y=72. The header covers through y=81. Zero of 25 sample points survived. All the reader sees is the answer text, so pressing Shift+Tab looks like it did nothing at all.

Grouping the hidden components by type, card title links lead with 9. This is where I get to indict myself. Three days ago I rewrote card markup that wrapped the whole card in an `<a>` so that only the title is the link, with an `::after` overlay restoring the large click area. That was [work to fix inbound anchor text stretching to 367 characters](/en/blog/en/title-declaration-channels-anchor-text-audit-2026/). The side effect: the link's focus rect shrank from the card's 300-odd pixels to two lines of title, 65 pixels. Smaller than the 81-pixel header. Back when the whole card was the link, a top-edge landing still left the bottom half showing. I fixed one accessibility signal and manufactured a failure of another.

Split by direction and viewport:

| Slice | Focus stops | 2.4.11 (AA) | 2.4.12 (AAA) |
|---|---|---|---|
| Tab (downward) | 1,072 | 0 | 6 |
| Shift+Tab (upward) | 1,069 | 16 | 193 |
| Desktop 1280×800 | 1,093 | 10 | 174 |
| Mobile 390×844 | 1,048 | 6 | 25 |

The desktop-mobile gap comes down to how many lines a given title wraps to. Once the rect grows taller than the header, the bottom edge survives. I didn't measure that relationship element by element, so I'll leave the claim there.

## One line closed it, and 25 cases stayed open

Fix the scroll, not the focus. Tell the browser that the region it considers "in view" starts below the header. The property that defines that region is `scroll-padding`, and here is the definition quoted verbatim from [CSS Scroll Snap Module Level 1](https://www.w3.org/TR/css-scroll-snap-1/#propdef-scroll-padding).

> This property specifies (for all scroll containers, not just scroll snap containers) offsets that define the optimal viewing region of a scrollport: the region used as the target region for placing things in view of the user. This allows the author to exclude regions of the scrollport that are obscured by other content (such as fixed-positioned toolbars or sidebars)

This property normally gets introduced as the cure for hash links landing a heading under your header. Its actual reach is wider. The same region governs focus-driven scrolling, which makes this a keyboard accessibility setting.

Three lines went into my stylesheet:

```css
html {
  --header-height: 5rem;
  scroll-padding-top: calc(var(--header-height) + 1rem);
}
```

My header measures 81 pixels on desktop and 82 on mobile, so 5rem plus 1rem of breathing room for the focus ring, computing to 96 pixels. Header height is a variable so both numbers move together when the design does.

![The same element at the same Shift+Tab step. Top: scroll-padding-top auto, landing at y=24 and covered by the header. Bottom: 96px, landing at y=96 with the focus ring fully visible](../../../assets/blog/focus-not-obscured-sticky-header-scroll-padding-2026/focus-landing-before-after.png)

On the same page at the same step of the same walk, the card link's landing point moved from y=24 to y=96. That 96 is exactly the value I just declared. Five surviving sample points out of 25 became all 25.

Then I rebuilt from source and reran the identical script.

| Metric | Before | After |
|---|---|---|
| Unique focus stops | 2,141 | 2,133 |
| SC 2.4.11 (AA) failures | 16 | 0 |
| SC 2.4.12 (AAA) failures | 199 | 25 |
| Focus arrived, element transparent | 4 | 0 |
| What covered the AA failures | sticky header, 16 | nothing |

AA went to zero. I triaged the remaining 25 AAA cases by hand, and the lesson there is that you shouldn't take the number at face value. Fourteen are the scroll-to-top button: a 48-pixel circle whose bounding box has four corners outside the circle, so those four points hit the content behind it. That reads as 4 of 25 points hidden, or 16%, while nothing actually overlaps. The grid misjudges non-rectangular shapes. Ten are inline links in the related-posts list, where the line gap inside a two-line rect returns the neighboring link. Number 25 is a 1,000-pixel form `<iframe>` embedded on the contact page. Since the viewport is 800 pixels, no amount of scrolling can show that element in full. For any component taller than the viewport, AAA is structurally out of reach.

So: the AA axis closed with one declaration, and the AAA number only becomes a verdict after a human sorts it.

There's a JavaScript route too. I've seen `focusin` handlers that nudge the page with `scrollBy`. I don't recommend it. You're scrolling after the browser already scrolled, which produces a visible jump and fights smooth-scroll behavior. `scroll-padding` changes the criterion instead, so the first scroll is the correct one, and the arithmetic stays with the browser.

## A button hidden with opacity: 0 is still in the tab order

This measurement threw in a bonus. At four stops, focus reached the element but the element itself was transparent. It was the scroll-to-top button.

```css
/* before */
.back-to-top {
  @apply opacity-0 translate-y-4 pointer-events-none;
}
.back-to-top.visible {
  @apply opacity-100 translate-y-0 pointer-events-auto;
}
```

Neither `opacity: 0` nor `pointer-events: none` removes an element from the tab order. So keep pressing Tab at the top of the page and focus parks on a button nobody can see. `pointer-events` only blocks pointers, so Enter still activates it. That isn't occlusion, it's an element that was never painted, and it lands on Focus Visible (2.4.7) rather than 2.4.11.

Adding `visibility: hidden` pulls it out of sequential focus navigation while keeping the fade, because `visibility` transitions in discrete steps. My first attempt used the Tailwind utilities, `@apply invisible` and `@apply visible`, and the build broke. Calling the `visible` utility from inside a `.back-to-top.visible` selector makes the rule reference itself, and PostCSS refused it as a circular dependency. Plain properties instead of utilities:

```css
/* after */
.back-to-top {
  @apply opacity-0 translate-y-4 pointer-events-none;
  visibility: hidden;
}
.back-to-top.visible {
  @apply opacity-100 translate-y-0 pointer-events-auto;
  visibility: visible;
}
```

After that, unique focus stops dropped from 2,141 to 2,133. Those eight missing stops are the proof that the button left the tab order. If you want a control gone, reach for visibility, `display: none`, or `inert` rather than opacity.

## What this measurement can't tell you

Hit testing is not perception. `elementFromPoint` answers which element is frontmost at a coordinate and nothing else. Whether text stays legible under a translucent header, or whether the focus ring has enough contrast against what's behind it, is a different question that a person has to answer.

The 5×5 grid is wrong about non-rectangular shapes, and those fourteen circular-button cases are the receipt. A denser grid doesn't help; the corners of a circle are still outside it. You'd need the element's painted shape, and hit testing won't give you that.

No script can apply the allowance written into the Understanding document. Content the user opened and can dismiss without advancing focus isn't a failure, but no code can tell what the user opened. If your site uses a cookie banner or non-modal dialogs, treat this output as a candidate list, not a verdict.

I measured one engine. Scroll alignment for a focus target is up to the user agent, so landing points can differ elsewhere. `scroll-padding` is a specified property, though, so I'd expect the direction to hold.

And it has nothing to do with rankings. I didn't measure a ranking effect and I have no basis for asserting one. In the same way structured data doesn't guarantee a position, an accessibility fix doesn't either. This is a conformance and usability criterion.

## Checklist: walk both directions, then check one CSS line

To run this on your own site, in order:

1. <strong>Measure the real height of your sticky or fixed elements first.</strong> Read `getBoundingClientRect().height` separately on desktop and mobile, then check `getComputedStyle(document.documentElement).scrollPaddingTop`. If that computes to `auto` and you have a sticky header, the failure candidates already exist.
2. <strong>Set `scroll-padding-top` to header height plus slack.</strong> Keep the header height in a CSS variable and reference it. Add `scroll-padding-bottom` if you have a sticky footer. On my site those three lines took 16 AA failures to zero.
3. <strong>Make the audit script press real keys.</strong> `element.focus()` centers the target in Chromium and never reproduces the bug. Walk Tab and Shift+Tab in both directions, and number the elements so you don't count cycles.
4. <strong>Hunt for controls hidden with opacity.</strong> Anything hidden only by `opacity: 0` or `pointer-events: none` stays focusable. Use `visibility: hidden`, `display: none`, or `inert`.
5. <strong>Sort the AAA number by hand before you quote it.</strong> Circles, wrapped inline elements, and components taller than the viewport all report as partially hidden by construction under a grid method.

The script lives in the repo as `scripts/audit-focus-obscured.mjs`. Serve a static build locally, hand it a few paths, and it runs.

Swap the selectors and this script runs against any build. Wiring it into someone else's pipeline and turning the output into a report you can act on is part of what I do. Door's on my [profile](/en/about/).

---

*Sources: W3C's [Web Content Accessibility Guidelines (WCAG) 2.2](https://www.w3.org/TR/WCAG22/) (W3C Recommendation, 12 December 2024), [Understanding SC 2.4.11: Focus Not Obscured (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html), and [CSS Scroll Snap Module Level 1](https://www.w3.org/TR/css-scroll-snap-1/#propdef-scroll-padding) (Candidate Recommendation Snapshot, 11 March 2021); the automated rule list is Deque's [axe rule list](https://dequeuniversity.com/rules/axe/4.10). All official. Measurement setup: my own Astro build output, Playwright 1.57 with Chromium, viewports 1280×800 and 390×844, six pages, 2,141 unique focus stops before the fix and 2,133 after, judged by `document.elementFromPoint` over a 5×5 grid on the focus rect. Every number here comes from this site, this build, and this browser, and none of it is a statement about how other user agents align scroll targets.*
