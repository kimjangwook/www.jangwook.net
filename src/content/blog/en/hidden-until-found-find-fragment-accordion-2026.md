---
title: 'The scroll jumped 6,083px; the accordion stayed shut'
description: 'I clicked a text-fragment link into a closed accordion, jumped 6,083px, and hit a blank box. I ran 17 hide methods in Chromium to measure which ones open.'
pubDate: '2026-08-15'
heroImage: '../../../assets/blog/hidden-until-found-find-fragment-accordion-2026/hero.png'
tags:
  - HTML
  - CSS
  - Web Development
  - Accessibility
  - Deep Linking
faq:
  - question: 'Why does a text-fragment URL scroll to a closed accordion without opening it?'
    answer: 'Because arrival and revelation are handled by different mechanisms. If an accordion is built with CSS overflow clipping or max-height: 0, the text still exists in the DOM layout tree, so the browser computes a scroll offset and jumps to it. But without native disclosure semantics like details or the hidden="until-found" attribute, no browser event fires to expand the container.'
  - question: 'How does hidden="until-found" differ from boolean hidden or display: none?'
    answer: 'Standard hidden applies display: none, which removes elements from layout and blocks find-in-page and fragment navigation entirely. The hidden="until-found" state applies content-visibility: hidden via the user-agent stylesheet instead. The element retains a box and layout containment, allowing the browser to search skipped content, fire a beforematch event, remove the hidden attribute, and reveal the text.'
  - question: 'Does hidden="until-found" work across all major browsers?'
    answer: 'In my measurements on Chromium 143, onbeforematch is supported and fires reliably. I did not run Firefox or WebKit, so I made no claim about hidden="until-found" on those engines.'
  - question: 'Are closed details elements searchable with Ctrl+F and text fragments?'
    answer: 'In Chromium 143, clicking a text-fragment link targeting text inside a closed details element fired a toggle event, flipped the open property to true, and scrolled the answer into view. The text is absent from innerText while closed, but present in textContent and discoverable by window.find(). I did not press the real Ctrl+F UI.'
relatedPosts:
  - slug: text-fragment-citation-deep-link-audit-2026
    score: 0.90
    reason:
      ko: 텍스트 프래그먼트가 URL에서 텍스트를 어떻게 특정하는지 먼저 쟀고, 이 글은 그 타깃이 아코디언 속에 숨어 있을 때 브라우저가 실제로 여는지를 잰다.
      ja: テキストフラグメントがURLからテキストをどう特定するかを先に測り、本稿はそのターゲットがアコーディオン内に隠れている際にブラウザが実際に開くかを測る。
      en: That post measured how text fragments target strings from a URL. This one measures whether the browser actually reveals that target when it sits inside a closed accordion.
      zh: 那篇先测了文本片段如何从 URL 定位文本，这篇测的是当目标藏在折叠手风琴里时，浏览器到底会不会把它展开。
  - slug: content-visibility-auto-render-cost-measure-2026
    score: 0.83
    reason:
      ko: 'content-visibility: auto가 렌더링 비용을 어떻게 아끼는지를 다뤘고, 이 글은 UA가 hidden=until-found에 주입하는 content-visibility: hidden이 검색과 프래그먼트를 어떻게 통과시키는지를 다룬다.'
      ja: 'content-visibility: autoが描画コストをどう削るかを扱い、本稿はUAがhidden=until-foundに注入するcontent-visibility: hiddenが検索とフラグメントをどう通すかを扱う。'
      en: 'That post looked at how content-visibility: auto saves rendering cost. This one looks at how UA-applied content-visibility: hidden lets find-in-page and fragments pass through.'
      zh: '那篇讲了 content-visibility: auto 如何节省渲染开销，这篇讲的是 UA 注入的 content-visibility: hidden 如何让页面搜索和片段跳转穿透进去。'
  - slug: modal-focus-escape-inert-measure-2026
    score: 0.74
    reason:
      ko: inert 속성이 포커스와 상호작용을 차단하는 방식을 측정했고, 이 글의 17개 셀 매트릭스에서도 inert는 window.find와 프래그먼트 진입을 정확히 거절했다.
      ja: inert属性がフォーカスとインタラクションを遮断する挙動を測り、本稿の17セル行列でもinertはwindow.findとフラグメント到達を正確に拒絶した。
      en: That post measured how inert traps focus and interaction. In this 17-cell matrix, inert was also one of the few methods that cleanly refused window.find and fragment navigation.
      zh: 那篇测了 inert 属性如何阻断焦点与交互，在本文的 17 格矩阵里，inert 同样精确拒绝了 window.find 和文本片段导航。
  - slug: faqpage-deprecation-ai-citation-2026
    score: 0.72
    reason:
      ko: FAQPage 구조화 데이터의 감쇄를 다룬 데 이어, 이 글은 브라우저에서 실제 FAQ 아코디언 마크업이 딥링크와 접근성 트리에 어떻게 노출되는지 실측한다.
      ja: FAQPage構造化データの減衰を扱ったのに続き、本稿はブラウザ上で実際のFAQアコーディオンマークアップがディープリンクとアクセシビリティツリーにどう露出するかを実測する。
      en: Following the deprecation of FAQPage structured data, this post measures how live FAQ accordion markup actually exposes its text to deep links and accessibility trees.
      zh: 继 FAQPage 结构化数据降级之后，这篇实测了浏览器中实际的 FAQ 手风琴标记如何向深度链接和无障碍树暴露文本。
  - slug: content-on-hover-focus-1413-tooltip-2026
    score: 0.63
    reason:
      ko: 호버나 포커스로만 드러나는 콘텐츠의 접근성 기준을 다룬 글이다. 열림 상태를 누가 제어하는가라는 같은 문제를 공유한다.
      ja: ホバーやフォーカスでのみ現れるコンテンツのアクセシビリティ基準を扱った記事。開いた状態を誰が制御するかという同じ問題を共有する。
      en: That post covered the accessibility criteria for content revealed only on hover or focus. Both posts turn on who controls the open state.
      zh: 那篇讲了只在悬停或聚焦时才出现的内容要满足的无障碍标准。两篇都落在谁来控制展开状态这个问题上。
---

I clicked `#tf-css-maxh`. The browser jumped `window.scrollY` to 6083, but the accordion stayed shut at `data-open="0"`.

Inside that panel, `getBoundingClientRect()` reported a box height of 0 pixels. The paragraph reported 18 pixels at y 399.7. `document.elementFromPoint(640, 409)` returned `BODY`. The text was in the DOM, the scroll engine reached its coordinates, but the paint was clipped out of existence.

![The gap between arriving at coordinates and revealing clipped text](../../../assets/blog/hidden-until-found-find-fragment-accordion-2026/hero.png)

## The browser scrolled 6,083 pixels to an element nobody could see

I had assumed `max-height: 0` was one of the cases Chrome called impossible to search. It was not. In my fixture, `window.find("TOKENCSSMAXH")` returned `true`, the token appeared in the CDP accessibility tree dump, and the fragment click marked the element as in view.

The browser found the text, calculated the scroll target, and landed at pixel 6083. It did not expand the container. `max-height: 0` is purely visual, so the browser has no semantic hook to know that the box must expand. The scroll succeeded; the reveal never happened.

## Hiding text turns out to be five different jobs

Before running the matrix, I treated "hiding text" as a single binary switch: either an element is rendered or it is not. The test fixture split that assumption into five distinct behaviors:

1. **Not rendered**: `display: none` and boolean `hidden`. The element has no box or geometry and is invisible to find-in-page, fragments, and accessibility trees.
2. **Paint skipped but searchable**: `hidden="until-found"` and UA-applied `content-visibility: hidden`. The element retains layout containment and a box. Child paint is skipped, but text remains reachable by search and URL fragments.
3. **Clipped in tree**: `max-height: 0`, `opacity: 0`, and off-screen screen-reader clips (`.sr-only`). The layout tree constructs the elements, but visual output is clipped or transparent.
4. **Stripped from accessibility names**: `aria-hidden="true"`. Content paints, but the accessibility tree ignores it.
5. **Ignored by search**: `inert`. The element paints, but find-in-page cannot match text inside it.

When I checked the JavaScript property `HTMLElement.hidden` on a node with `hidden="until-found"`, I expected it to return a boolean `true`. It did not. The IDL getter returned the string `"until-found"`.

## Seventeen hide methods across four browser doors

I constructed a fixture page with 17 isolated test cells. Every cell contained the same paragraph structure with a unique token so search calls would not drift across containers.

For each cell, I checked:
- Did `window.find(token)` return `true` after page load?
- Was the paragraph inside the viewport 200 milliseconds after clicking a text-fragment link (`#:~:text=TOKEN`)?
- Was the paragraph inside the viewport 200 milliseconds after clicking an ID anchor link (`#p-...`)?
- Did the unique token appear in the accessibility name list extracted via CDP `Accessibility.getFullAXTree`?

The 200ms delay and `getBoundingClientRect()` against the 1280×800 viewport were my single ruler for "arrival."

![Matrix of 17 hide methods against find, fragments, hash links, and accessibility names](../../../assets/blog/hidden-until-found-find-fragment-accordion-2026/hide-matrix.png)

| Hide method | `window.find()` | Fragment click | Hash `#id` click | AX tree name |
| --- | --- | --- | --- | --- |
| 1. Visible (baseline) | yes | yes | yes | yes |
| 2. `hidden=""` | no | no | no | no |
| 3. `hidden="hidden"` | no | no | no | — |
| 4. `hidden="until-found"` | yes | yes | yes | no |
| 5. `until-found` + padding box | yes | yes | yes | — |
| 6. `until-found` + `display: none` | no | no | no | — |
| 7. `until-found` + `display: inline` | yes | yes | yes | yes |
| 8. `<details>` (closed) | yes | yes | yes | no |
| 9. `<details>` (open) | yes | yes | yes | yes |
| 10. Author `display: none` | no | no | no | no |
| 11. `visibility: hidden` | no | no | yes | no |
| 12. Author `content-visibility: hidden` | no | no | no | no |
| 13. `aria-hidden="true"` | yes | yes | yes | no |
| 14. `inert` | no | no | yes | no |
| 15. `opacity: 0` | yes | yes | yes | yes |
| 16. Screen-reader clip (`.sr-only`) | yes | yes | yes | yes |
| 17. `max-height: 0` | yes | yes | yes | yes |

*(Note: Cells 3, 5, and 6 were not collected in the CDP accessibility tree dump and are marked `—`. I did not run screen readers or test Gecko or WebKit.)*

## What happens when you style a hidden-until-found container

On `#box-until-box` (margin 8px, gray border 4px, padding 16px), `getBoundingClientRect()` reported `1214×40` while `hidden="until-found"`—an empty framed box. After the fragment click, `beforematch` fired once, `hidden` was removed, and the box measured `1214×90`. The 40→90 pair is this fixture's padding sum, not a constant.

Author CSS can break `hidden="until-found"`. On `#box-until-none`, with inline `style="display: none"`, `window.find()` returned `false` and the fragment click failed to scroll. A hash link `#p-until-none` fired `beforematch` and stripped `hidden`, but `display: none` remained, so the paragraph height stayed at 0.

With `style="display: inline"` on `#box-until-inline`, layout containment broke immediately. The sentence became visible in `innerText` and the accessibility tree before any click, and fragment navigation jumped to scrollY 4729 without firing a reveal step.

## The live FAQ on this site was already using the one hide method that works

I checked `https://jangwook.net/ko/blog/ko/text-fragment-citation-deep-link-audit-2026/`.

The page contains 4 `details.faq-item` elements rendered by `FAQ.astro`. Index 0 is open by default (`open={index === 0}`); indexes 1 through 3 are closed.

I navigated to that text via URL fragment:

```js
location.href = location.pathname + '#:~:text=' +
  encodeURIComponent('코드 블록 자체를 인용 대상으로 만들기는 어렵습니다');
```

The browser scrolled `window.scrollY` to 8752. The second `<details>` expanded (`hitOpen: true`), with a bounding-rectangle top offset of 373 pixels.

`FAQ.astro` used semantic `<details>` instead of `div` tags with `max-height: 0`, so deep linking and search discovery worked without extra JavaScript listeners.

## What to check before replacing your collapse component

If you replace custom accordion JavaScript with `hidden="until-found"`, verify three things:

### 1. Check browser engine support

`hidden="until-found"` depends on `beforematch`. In Chromium 143, `'onbeforematch' in HTMLElement.prototype` evaluates to `true`. I did not run Firefox or WebKit, so I made no claim about support there.

```js
if (!('onbeforematch' in HTMLElement.prototype)) {
  // Fall back to details or JavaScript accordion toggles
}
```

### 2. Inspect computed styles on collapsed nodes

Ensure CSS does not override the user-agent display rule with `display: none` or `display: inline`:

```js
const el = document.querySelector('[hidden="until-found"]');

getComputedStyle(el).display;           // Avoid "none", "contents", or "inline"
getComputedStyle(el).contentVisibility; // Should be "hidden"
```

### 3. Verify container geometry

`hidden="until-found"` hides the children, not the container box. If the container has padding, borders, or fixed min-heights, move those styles to an inner wrapper so an unexpanded section does not leave an empty box.

---

*Measurement setup: Single fixture page with 17 isolated test cells on a local static server, headless Chromium build 143.0.7499.4, Playwright 1.57.0, Node 22.22, 1280×800 viewport, tested on 15 August 2026. The fixture JSON was left in the `/tmp` lab directory and not copied into the repo. Live verification was run against one article with four FAQ items on jangwook.net. Searches were executed using `window.find()` and text-fragment clicks rather than manual keyboard shortcuts. Screen readers and non-Chromium engines (Gecko, WebKit) were not measured.*
