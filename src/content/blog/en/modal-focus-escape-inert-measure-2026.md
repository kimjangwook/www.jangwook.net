---
title: 'aria-modal="true" Blocked Nothing: Modal Focus Escape, Measured'
description: Keyboard focus escaped an aria-modal dialog on the third Tab press while axe reported zero violations. I measured the same markup under aria-hidden and inert.
pubDate: '2026-07-23'
heroImage: ../../../assets/blog/modal-focus-escape-inert-measure-2026/hero.png
tags:
  - accessibility
  - wcag
  - web-development
relatedPosts:
  - slug: axe-automated-a11y-coverage-gap-2026
    score: 0.82
    reason:
      ko: "이 글에서 axe가 포커스 이탈을 위반으로 잡지 못한 이유가 궁금하다면, 자동 검사 도구가 구조적으로 무엇을 못 보는지를 정리한 저 글이 답의 절반을 갖고 있다."
      ja: "本稿でaxeがフォーカス脱出を違反として報告しなかった理由は、自動チェックが構造的に何を見られないかを整理したあちらに半分書いてある。"
      en: "Half the answer to why axe didn't flag the focus escape in this post lives there — a breakdown of what automated checkers structurally cannot see."
      zh: "想知道本文中 axe 为什么没把焦点逃逸报成违规，那篇梳理自动化工具结构性盲区的文章有一半答案。"
  - slug: wcag22-target-size-audit-2026
    score: 0.71
    reason:
      ko: "초록불 점수 뒤에 숨은 실패라는 점에서 같은 계열의 실측이다. 저기서는 24px 타깃이, 여기서는 Tab 세 번이 자동 도구의 한계를 드러냈다."
      ja: "緑のスコアの裏に隠れた不合格という意味で同系統の実測。あちらは24pxのターゲットが、こちらはTab三回が自動ツールの限界を暴いた。"
      en: "Same family of measurement: failure hiding behind a green score. There it was a 24px target; here it took three presses of Tab."
      zh: "同一类实测：绿灯分数背后藏着的不合格。那篇是 24px 的点击目标，这篇是按三次 Tab。"
  - slug: accessible-name-agents-2026
    score: 0.63
    reason:
      ko: "포커스가 도착한 요소를 보조기술이 뭐라고 읽어주는가의 문제로 이어진다. accessible name이 비어 있으면 이 글의 '포커스 블랙홀'과 같은 증상이 난다."
      ja: "フォーカスが着いた要素を支援技術が何と読み上げるかという問題に続く。accessible nameが空だと本稿の「フォーカスのブラックホール」と同じ症状になる。"
      en: "Continues into what assistive tech announces once focus lands somewhere. An empty accessible name produces the same symptom as this post's focus black hole."
      zh: "延伸到辅助技术如何朗读焦点所在元素的问题。accessible name 为空时，症状和本文的「焦点黑洞」一模一样。"
  - slug: a11y-lighthouse-audit-fix-2026
    score: 0.58
    reason:
      ko: "Lighthouse 접근성 점수를 100까지 끌어올린 기록인데, 그 100점조차 이 글의 포커스 이탈은 잡지 못한다. 점수와 실사용의 간극을 양쪽에서 보여준다."
      ja: "Lighthouseのアクセシビリティスコアを100に上げた記録。だがその100点でも本稿のフォーカス脱出は検出できない。スコアと実利用の溝を両側から見せる二本。"
      en: "The log of pushing a Lighthouse accessibility score to 100 — a 100 that still wouldn't catch this post's focus escape. Two views of the same gap."
      zh: "把 Lighthouse 无障碍分数拉到 100 的记录，而那个 100 分同样抓不到本文的焦点逃逸。从两侧看同一道鸿沟。"
---

axe reported zero focus-related violations. Then I pressed Tab three times, and keyboard focus left the dialog and landed on a navigation link behind the overlay.

The dialog wasn't sloppy, either. It had `role="dialog"`, `aria-modal="true"`, and it moved focus to the first input on open. That's the shape most code reviews wave through. So today I put that exact markup through three background treatments (nothing, `aria-hidden="true"`, and `inert`), pressed real Tab keys in each state, logged where focus actually landed, and ran axe-core 4.12.1 alongside. Browser: Chrome 150.

## The groundwork: "modal" is a requirement, not a vibe

Before the logs, the foundation. A modal dialog is one where, while it's open, the rest of the page behaves as if it doesn't exist. The W3C's WAI-ARIA Authoring Practices Guide (APG) states it flatly in the modal dialog pattern: "Windows under a modal dialog are inert. That is, users cannot interact with content outside an active dialog window." The keyboard contract is spelled out too. Tab moves to the next tabbable element inside the dialog, and from the last one it wraps to the first, inside the dialog. The moment focus lands behind the overlay, whatever you built is no longer a modal by the spec's definition.

Here's the misconception a lot of code carries: `aria-modal="true"` doesn't create that behavior. It <strong>declares</strong> to assistive technology that the behavior already exists. The APG even attaches conditions — only mark a dialog modal when application code actually prevents all interaction with outside content, and the outside is visually obscured. What happens when the declaration and the implementation disagree? That's what I measured.

The test page is deliberately plain. Six focusable elements in the background (four nav links, a search input, an open button), three inside the dialog (email input, Subscribe, Cancel). The overlay is translucent, so a focus ring behind it shows through. That detail turns into evidence shortly.

One rule I held to on methodology: no synthetic `dispatchEvent` Tab presses. Synthetic keyboard events are untrusted and don't drive the browser's real focus traversal, so they'd measure nothing. Instead I sent genuine Tab keystrokes over the DevTools protocol and planted a `focusin` listener to collect each element focus passed through:

```js
// instrumentation: record every element focus lands on, in order
window.__focusLog = [];
document.addEventListener('focusin',
  e => window.__focusLog.push(e.target.id || e.target.tagName), true);
```

## Variant one, naive: three Tabs to escape

First variant: background untouched. Opening the dialog focuses the email field, which looks responsible. Then the Tab log:

```text
variant: naive  (role="dialog" + aria-modal="true", background untouched)
open   → email          (initial focus move, fine)
Tab 1  → subscribe-btn
Tab 2  → cancel-btn
Tab 3  → nav-home       ← escapes behind the overlay
Tab 4  → nav-products
Tab 5  → nav-pricing
Tab 6  → nav-contact
```

Third press, gone. The dialog sits in the middle of the screen while focus walks the nav links behind it. Mouse users never notice. For someone driving the page by keyboard, the UI they can see and the UI they can operate have split apart.

![Measured screenshot of the naive variant: the dialog is open, yet the orange focus ring sits on the Contact nav link behind the translucent overlay.](../../../assets/blog/modal-focus-escape-inert-measure-2026/focus-escape.png)

axe's verdict on this state: one violation, `region` (a moderate landmark issue), and nothing about focus. That's not axe being lazy. "Where does focus go when Tab is pressed" is a dynamic property that no static DOM scan can settle. I mapped out what automated checkers structurally miss in [my axe coverage measurement](/en/blog/en/axe-automated-a11y-coverage-gap-2026/), and this escape falls squarely into that blind spot.

Honestly, I've seen this exact combination — `aria-modal="true"` on the dialog, background left alone — pass code review more than once. The markup is beyond reproach. Only someone who presses Tab three times finds out.

## Variant two, aria-hidden: the escape goes silent

Second variant: opening the dialog sets `aria-hidden="true"` on the background container. The classic move for hiding the background from screen readers.

```text
variant: ariahidden  (background gets aria-hidden="true")
open   → email
Tab 1  → subscribe-btn
Tab 2  → cancel-btn
Tab 3  → nav-home       ← still escapes
Tab 4  → nav-products
```

`aria-hidden` removes elements from the accessibility tree and touches nothing else. Tab order is unaffected, so focus leaks exactly as before. Except now it's worse. The element focus lands on no longer exists in the accessibility tree. A screen reader user presses Tab and hears nothing — focus with no name, no role, a black hole. What assistive tech announces at the point of focus is a topic I measured in [the accessible name post](/en/blog/en/accessible-name-agents-2026/); here, the name isn't merely wrong, it's been deleted from the tree.

axe's reaction is the interesting part. There's a rule aimed at precisely this: `aria-hidden-focus`. In this measurement it came back not as a violation but as <strong>incomplete</strong>:

```text
rule: aria-hidden-focus → incomplete (target: #app)
check: focusable-modal-open
message: "Check that focusable elements are not tabbable in the current state"
```

With a modal open, axe can't statically determine whether those background elements are really tabbable, so it hands the check to a human. As rule design goes, that's the honest choice. The operational problem is that most CI pipelines gate on the violations array and drop incomplete on the floor. Behind a "zero violations" report, a request addressed to a human quietly disappears. The Tab-pressing I did above is exactly the manual check axe was asking for.

## Variant three, inert: zero background landings

Third variant: opening the dialog sets `inert` on the background container. One line.

```js
// on open
app.inert = true;
modal.querySelector('input').focus();

// on close
app.inert = false;
openBtn.focus();
```

Same procedure, six Tabs:

```text
variant: inert  (background gets inert)
open   → email
Tab 1  → subscribe-btn
Tab 2  → cancel-btn
Tab 3  → (browser UI: address bar)
Tab 4  → email          ← re-enters the document at the dialog's first element
Tab 5  → subscribe-btn
Tab 6  → cancel-btn
```

Background landings: zero. Focus cycles through the dialog's three elements, and I wrote no focus-trap JavaScript to get there. Per MDN, `inert` takes the whole subtree out of tab order, out of the accessibility tree, and blocks clicks and find-in-page. The job `aria-hidden` was doing, plus the focus blocking it never did, in one attribute.

Two details the measurement surfaced. First, computed `pointer-events` on an inert element stays `auto` — the blocking happens inside the user agent, not through style. Second, programmatic `el.click()` still fires on an inert element. `inert` blocks user interaction, not JavaScript. Which also means a test suite passing via `.click()` says nothing about whether a real user can click.

The brief hop to the address bar at Tab 3 is correct behavior, by the way. The APG's wrap requirement concerns tab order within the document; browser UI has always lived outside it. Re-entering at the dialog's first element satisfies the contract.

One caveat worth carrying with you: MDN explicitly warns that `inert` comes with no default visual indicator whatsoever. Nothing greys out the way `disabled` does. In a modal scenario the overlay plays that role, so it's a non-issue here, but if you take `inert` to other uses — dimming the inactive steps of a multi-step form, say — the visual distinction is yours to design. And for disabling a single form control, `disabled` remains the right tool over `inert`; the semantics and styling hooks belong to it.

## Which to use: a three-rung ladder

Based on this measurement, my order of preference:

| Rank | Approach | Background blocking | Basis |
|---|---|---|---|
| 1 | `<dialog>` + `showModal()` | Browser does it | MDN: with `showModal()`, rendering everything else inert is "provided by the browser" |
| 2 | Custom overlay + background `inert` | One explicit line | This measurement — zero background landings |
| 3 | JS focus-trap loop | Code intercepts keydown | Only when legacy support demands it |

The native `<dialog>` tops the list for a simple reason: calling `showModal()` makes the entire document outside the dialog inert, and the platform throws in top-layer stacking, `::backdrop`, and Esc-to-close. Everything I hand-built for this post comes free. If a design system locks you into a custom overlay, rung two is one line of `inert` on the background container — Baseline "widely available" since April 2023 (Chrome 2022, Firefox and Safari 2023). The classic focus trap that intercepts keydown and manually wraps first-to-last is now rung three. It works, but you're maintaining your own list of tabbable elements, and every element added to the dialog is a fresh chance to get it wrong.

One position I'll state plainly: using `aria-hidden="true"` alone as background blocking is a pattern that should be retired. The measurement shows focus sails right through it, and the place it sails to is silent for screen reader users. Since `inert` also removes the subtree from the accessibility tree, pairing it with `aria-hidden` buys you nothing in any browser that has `inert`.

## Honest limits

What this measurement doesn't tell you. First, this is a keyboard tab-order measurement, not a screen reader measurement. VoiceOver's and NVDA's reading cursors move independently of tab order, so how `aria-modal` and `inert` behave under reading navigation needs its own test — this post didn't run one. Second, don't read axe's incomplete as a defect. Refusing to settle a dynamic state with a static rule, and escalating to a human instead, is the honest side of rule design; the gap is operational, in pipelines with no human on the receiving end. Third, what I measured is one symptom in WCAG 2.4.3 (Focus Order) territory. Fixing it doesn't make a page conformant, the same conclusion as [the WCAG 2.2 target size audit](/en/blog/en/wcag22-target-size-audit-2026/): the distance between a green automated score and conformance is longer than it looks. Fourth, this ran on a single browser, Chrome 150. Baseline says `inert` behaves identically everywhere, but I didn't verify tab order in Firefox or Safari this round — running the same probe across all three engines with something like Playwright is the natural next step.

## Five lines before you ship a modal

- Open the modal and press Tab (element count + 2) times. One landing behind the overlay is a fail.
- If `aria-modal="true"` is present, find the code that backs the claim — `showModal()` or `inert`. No backing, no attribute.
- If background blocking rests on `aria-hidden` alone, replace it with `inert`.
- In axe/CI output, open the incomplete array, not just violations. If `focusable-modal-open` is in there, the Tab test above is its answer.
- On close, confirm focus returns to the element that opened the modal (APG requirement). Whether that returned focus then sits hidden under a sticky header is a separate measurement, which I ran in [the sticky header problem](/en/blog/en/focus-not-obscured-sticky-header-scroll-padding-2026/).

Keyboard focus is the one thing automated tooling never finishes pressing for you. Plenty of sites stack up green reports without anyone ever running the three-Tab check. I take on this kind of work personally — auditing modal and overlay keyboard behavior on production sites and turning the findings into CI gates that stop regressions. If that's useful to you, [get in touch](/en/contact/).
