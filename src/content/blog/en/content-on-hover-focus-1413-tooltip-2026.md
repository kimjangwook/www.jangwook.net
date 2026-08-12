---
title: 'CSS Cannot Hear Escape: Seven Tooltips Against SC 1.4.13'
description: 'Seven tooltips, each measured against Dismissible, Hoverable and Persistent separately. Every CSS-only build fails Dismissible; popover="hint" fails Hoverable.'
pubDate: '2026-08-12'
heroImage: '../../../assets/blog/content-on-hover-focus-1413-tooltip-2026/hero.png'
tags:
  - accessibility
  - WCAG
  - CSS
  - frontend
  - web development
faq:
  - question: 'Does adding :focus-visible to a tooltip satisfy SC 1.4.13?'
    answer: 'No. :focus-visible solves "it also opens from the keyboard", which is not one of the three things the criterion asks for. In my run, the implementation that wired both :hover and :focus-visible failed Hoverable and Dismissible. Opening with the keyboard and closing with the keyboard are separate problems.'
  - question: 'Can CSS alone satisfy all of 1.4.13?'
    answer: 'Not in anything I could build. Hoverable and Persistent fall out of :has() plus padding, but Dismissible means responding to the Escape key and CSS has no equivalent hook. The criterion waives Dismissible for popups that do not obscure or replace other content, but all six DOM tooltips in my fixture covered the paragraph directly beneath them.'
  - question: 'Does the HTML popover attribute handle tooltip accessibility for me?'
    answer: 'It handles Dismissible. popover="hint" gets Escape handling from the browser, so it closed without the pointer moving at all. What opens and closes it is still your event wiring, and that mouseleave fires the moment the pointer enters the 8px gap, which is where it lost Hoverable.'
  - question: 'Why is auto-hiding a tooltip after two seconds a problem?'
    answer: 'The criterion allows exactly three ways for the content to go away: the trigger is removed, the user dismisses it, or the information is no longer valid. Elapsed time is not on that list. The implementation with a 2s timer vanished while I held the pointer still for five seconds, so it failed Persistent.'
relatedPosts:
  - slug: modal-focus-escape-inert-measure-2026
    score: 0.86
    reason:
      ko: 모달에서 Escape와 inert를 재던 글의 반대편이다. 그때는 닫히는 것이 당연한 컴포넌트를 다뤘고, 이번엔 아무도 Escape를 붙이지 않는 컴포넌트를 다룬다. 키 하나를 어디서 듣느냐는 문제는 두 글에서 같은 모양으로 반복된다.
      ja: モーダルのEscapeとinertを測った記事の裏面にあたる。あちらは閉じて当然の部品で、こちらは誰もEscapeを付けない部品だ。キー一つをどこで聞くかという問題は、二つの記事で同じ形をしている。
      en: The mirror image of the modal post that measured Escape and inert. That one dealt with a component everyone expects to close; this one deals with a component nobody wires Escape into. Where you listen for that single key is the same problem in both.
      zh: 那篇量模态框 Escape 和 inert 的文章的背面。那边处理的是理应能关掉的部件，这边处理的是没人给它接 Escape 的部件。这个键该在哪儿监听，两篇里是同一个形状的问题。
  - slug: act-rules-axe-coverage-wcag-sc-2026
    score: 0.81
    reason:
      ko: axe 4.13.0의 규칙 105개 중 1.4.13에 태그된 것이 0개라는 사실은 그 글에서 만든 목록으로 먼저 확인했다. 어떤 기준을 손으로 재야 하는지 고를 때 그 표를 먼저 펼친다.
      ja: axe 4.13.0の105ルールのうち1.4.13タグが0という事実は、あの記事で作った一覧で先に確かめた。どの基準を手で測るか選ぶとき、まずあの表を開く。
      en: The fact that 0 of axe 4.13.0's 105 rules carries a 1.4.13 tag came out of the inventory built in that post. It is the table I open first when deciding what has to be measured by hand.
      zh: axe 4.13.0 的 105 条规则里 0 条挂 1.4.13 标签，这件事是先在那篇做的清单里确认的。挑哪些标准得手动量时，先翻那张表。
  - slug: wcag22-target-size-audit-2026
    score: 0.72
    reason:
      ko: 같은 WCAG 2.2에서, 숫자로 적힌 기준이 실제로는 예외 조항에서 갈린다는 이야기를 했던 글이다. 이번 1.4.13도 판정을 가른 것은 8px이라는 숫자가 아니라 그 8px이 어디에 있느냐였다.
      ja: 同じWCAG 2.2で、数字で書かれた基準が実際には例外条項で分かれるという話をした記事だ。今回の1.4.13も判定を分けたのは8pxという数字ではなく、その8pxがどこにあるかだった。
      en: "The post that argued a criterion written as a number actually turns on its exception clauses. Same shape here: what split the verdicts was not the 8px, but where the 8px sat."
      zh: 那篇讲的是，同属 WCAG 2.2、写成数字的标准，实际分野在例外条款上。这次 1.4.13 也一样：分开判定的不是 8px 这个数，而是这 8px 落在哪儿。
---

Your accessibility scan is green. It has no opinion whatsoever about your tooltips.

That's not a dig at the scanner. WCAG 2.2 Success Criterion 1.4.13 asks three questions that a static DOM cannot answer: can you close this thing, can you move the pointer onto it, and how long does it stay. Answering those requires pressing a key, dragging a pointer, and waiting. Automated rules don't do any of that, so they say nothing, and silence reads like approval.

So I built the same tooltip seven different ways in a throwaway sandbox and measured the three requirements one at a time. Every CSS-only version failed Dismissible. The native `popover="hint"` passed Dismissible without a line of code from me, then failed Hoverable. One implementation out of seven passed all three.

![Three tooltip implementations, three different verdicts, captured from the live fixture](../../../assets/blog/content-on-hover-focus-1413-tooltip-2026/hero.png)

## What the criterion is actually pointed at

Worth grounding this before the numbers. SC 1.4.13 is Level AA. It arrived in WCAG 2.1 and carried into 2.2. Its subject is additional content that appears when you hover or focus a trigger and disappears when you stop. Tooltips are the obvious case. Hover-opened mega menus, profile cards that pop up over a username, help bubbles beside a form field, all of it counts.

What doesn't count is spelled out too. The third note attached to the criterion says this, and the source is [the W3C's WCAG 2.2 Recommendation](https://www.w3.org/TR/WCAG22/#content-on-hover-or-focus):

> This criterion applies to content that appears in addition to the triggering component itself. Since hidden components that are made visible on keyboard focus (such as links used to skip to another part of a page) do not present additional content they are not covered by this criterion.

A skip link that reveals itself on focus is out of scope. Something separate from the trigger has to appear before you're in 1.4.13 territory. Draw that line first or you'll audit half your page against the wrong criterion.

It's also worth knowing who the three requirements protect. All three point at people using screen magnification and people whose pointer control isn't precise. At 400% zoom a tooltip covers a serious fraction of the viewport, and if there's no way to clear it, the text underneath is simply gone. Someone with an unsteady hand moves the mouse toward the tooltip body to read it and loses the tooltip on the way. And a popup that vanishes after a couple of seconds may as well not exist for a slow reader. Dismissible, Hoverable and Persistent map onto those three situations one for one.

## What the normative text says

The normative text is short. Here it is verbatim from [the W3C's SC 1.4.13](https://www.w3.org/TR/WCAG22/#content-on-hover-or-focus):

> Where receiving and then removing pointer hover or keyboard focus triggers additional content to become visible and then hidden, the following are true:
>
> **Dismissible:** A mechanism is available to dismiss the additional content without moving pointer hover or keyboard focus, unless the additional content communicates an input error or does not obscure or replace other content;
>
> **Hoverable:** If pointer hover can trigger the additional content, then the pointer can be moved over the additional content without the additional content disappearing;
>
> **Persistent:** The additional content remains visible until the hover or focus trigger is removed, the user dismisses it, or its information is no longer valid.
>
> Exception: The visual presentation of the additional content is controlled by the user agent and is not modified by the author.

Two clauses deserve a second read.

First, Dismissible carries a conditional. If the additional content communicates an input error, or if it doesn't obscure or replace other content, the requirement is waived. A tooltip that covers nothing needs no dismissal mechanism. Those are rare, though. I measured the popup rectangle against the paragraph directly below it in all six DOM variants, and all six overlapped.

Second, the exception only covers presentation the browser controls and the author hasn't touched. The first note on the same page names the case:

> Examples of additional content controlled by the user agent include browser tooltips created through use of the HTML `title` attribute [HTML].

So `title` sits outside the criterion. This is where the common misreading starts: outside the criterion is not the same as passing it. A `title` tooltip still doesn't appear on touch devices, and you control neither when it shows nor how long it stays. The exception defers the verdict rather than fixing anything.

## Seven implementations, one ruler

One static HTML page in a temp directory outside the repo. Same button, same sentence ("Rate limit: 60 requests per minute per API key."), same 8px gap between trigger and popup. All seven rows share that much; the only variable is the machinery that opens and closes the thing.

| | Implementation | Opens on |
|---|---|---|
| V1 | `title` attribute | drawn by the browser |
| V2 | CSS `:hover` only | pointer |
| V3 | CSS `:hover` + `:focus-visible` | pointer, keyboard |
| V4 | CSS `:has()` + padding bridge | pointer, keyboard |
| V5 | JS hover/focus/Escape + 150ms grace | pointer, keyboard |
| V6 | JS + 2s auto-hide | pointer, keyboard |
| V7 | native `popover="hint"` | pointer, keyboard |

Playwright did the judging. Each check reloads the page so state can't leak between probes, and five things get measured.

- Does hovering open it
- Does tabbing to it open it
- **Dismissible**: with it open and the pointer held still, does Escape close it
- **Hoverable**: walking the pointer from trigger centre to popup centre in twelve steps, is it still alive at the end
- **Persistent**: after hovering, does it survive five seconds of doing nothing

The Hoverable probe is the one worth explaining. A single `mouse.move` to the destination skips the hit-testing in between and sails straight over the gap, which would have quietly passed every variant. Twelve interpolated steps at 20ms each is closer to what a real hand does.

```js
const path = 12, from = center(tb), to = center(pb);
for (let i = 1; i <= path; i++) {
  await page.mouse.move(
    from.x + (to.x - from.x) * i / path,
    from.y + (to.y - from.y) * i / path
  );
  await page.waitForTimeout(20);
}
r.hoverable = await page.locator(v.tip).isVisible();
```

Environment: Chromium 143.0.7499.4 headless, Playwright 1.57.0, Node 22.22, viewport 900×1400. I ran the script twice and all seven rows came back identical.

![Matrix of seven implementations against five checks](../../../assets/blog/content-on-hover-focus-1413-tooltip-2026/criteria-matrix.png)

## CSS cannot hear the Escape key

V2, V3 and V4 contain no JavaScript. All three failed Dismissible. That isn't sloppy implementation, it's structural. Dismissible wants a way to close the content without moving pointer or focus, and in practice that way is the Escape key. CSS has no selector that reacts to a keystroke.

The W3C's [Understanding document](https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus.html) uses exactly that example when it explains the requirement, pressing Escape to clear a tooltip without touching the mouse (my summary, not a verbatim quote). A CSS-only tooltip has no route to this requirement unless the waiver applies.

You can aim for the waiver. Build a tooltip that doesn't obscure or replace anything and Dismissible drops away. That's why I measured overlap as well, and all six overlapped the paragraph below. With the most common arrangement, absolutely positioned right under the trigger, not covering the following content is the harder thing to achieve. Reserve space in the layout flow and drop the popup into it and the waiver holds, but at that point you've built an accordion.

Here's the working judgement I take away. **"You can build a tooltip with pure CSS" usually means "two of 1.4.13's three".** If the third one drags a keyboard listener in anyway, managing state in JS from the start is the shorter path. A component that felt finished after two `:hover` lines ships unfinished, and that was the most repeatable finding in the whole run. I saw the same shape [measuring Escape and inert on modals](/en/blog/en/modal-focus-escape-inert-measure-2026), except there at least everyone agreed the thing was supposed to close. Nobody expects that of a tooltip.

## Keep the 8px in the eye, take it out of the box

Hoverable is where V3 and V4 parted ways. Same technology, same opening triggers. The difference wasn't the selector, it was the size of the box.

V3 gives the popup `margin-top: 8px`. It looks 8px away and it hit-tests 8px away. The instant the pointer leaves the trigger and lands in that strip, `:hover` releases and the popup is gone. The script measured the distance from trigger bottom to popup top at exactly 8px.

V4 builds the same 8px out of padding instead. The popup box touches the trigger, and 18px of transparent padding inside the box pushes only the visible content down. Measured gap: 0px. It looks detached and hit-tests as continuous. Add a `:has()` rule so hovering the popup itself keeps the open state, and Hoverable falls out of pure CSS.

```css
/* popup touches the trigger; the breathing room lives inside the box */
#tip { display: none; margin-top: 0; padding-top: 18px; background: transparent; }
#tip .inner { background: #111827; color: #f9fafb; border-radius: 6px; padding: 10px 12px; }

.anchor:has(.trigger:hover) #tip,
.anchor:has(.trigger:focus-visible) #tip,
.anchor:has(#tip:hover) #tip { display: block; }
```

The other route is time. V5 keeps the real 8px gap and, instead of closing on `mouseleave`, schedules a close 150ms later and cancels that schedule if the pointer reaches the popup. While the pointer crosses the empty strip, the popup is still there.

```js
let timer;
const open  = () => { clearTimeout(timer); tip.classList.add('open'); };
const close = () => tip.classList.remove('open');
const soft  = () => { clearTimeout(timer); timer = setTimeout(close, 150); };

trigger.addEventListener('mouseenter', open);
trigger.addEventListener('focus', open);
trigger.addEventListener('blur', close);
trigger.addEventListener('mouseleave', soft);
tip.addEventListener('mouseenter', open);
tip.addEventListener('mouseleave', soft);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
```

Twenty lines, and the only one of seven that passed all three. Nothing clever in it. Listen for Escape, forgive the gap, don't hide on a timer.

The 150ms is my number, not the spec's. It was enough for a headless browser travelling in a straight line. How much a slow hand on a curved path needs, I didn't measure, and sweeping the grace value to find the breaking point is the obvious next run. The padding bridge is the safer of the two, because a gap of zero removes the question entirely.

## popover gives you exactly half

V7 taught me the most. The `popover` attribute hands state management and the top layer to the browser. `popover="hint"` is the value aimed at tooltips, and per [the WHATWG HTML Standard](https://html.spec.whatwg.org/multipage/popover.html) the auto and hint states have light dismiss and respond to close requests while manual does not (my summary, not a verbatim quote). Close requests include the Escape key.

The measurement matched. V7 closed on Escape with the pointer sitting still. **It's the only one of the seven that got Dismissible without a line of code from me.** A shipped platform feature absorbing an entire accessibility requirement is a good argument for why the value exists.

Then it failed Hoverable, for a boring reason. `popover` manages *whether* the thing is open, not *when* it should open or close. Build a hover tooltip on top of it and you still call `showPopover()` on `mouseenter` and `hidePopover()` on `mouseleave`, and that `mouseleave` fires as the pointer enters the 8px gap. Top layer or not, the pointer hasn't arrived yet.

The split is clean. CSS gives you Hoverable and Persistent and never Dismissible. `popover` gives you Dismissible and not Hoverable. The two halves don't overlap, so passing all three means keeping the grace timer or the padding bridge even when you adopt `popover`. Next time you read that `popover` solves tooltip accessibility, that's the sentence to check.

## The tooltip that disappears after two seconds

V6 starts from a kindness. Tooltips lingering on screen feel intrusive, so hide it after two seconds. Plenty of UI libraries ship that default, and I've written it myself.

Held the pointer still, waited five seconds, and the popup was gone. Persistent, failed. The criterion allows three ways for the content to leave: the trigger is removed, the user dismisses it, or the information stops being valid. Elapsed time isn't among them.

You might wonder whether "no longer valid" can be stretched to cover a timer. Sometimes it genuinely does. A countdown, a one-time code with an expiry, anything whose content is bound to the clock. A sentence describing an API rate limit is just as true two seconds later. That's not grounds for taking it away from someone who reads slowly.

V6 lost Hoverable too, separately from the timer, because it also closes immediately on `mouseleave`. Missing all three at once turns out to be easy.

## Zero of axe's 105 rules look at this

I ran axe-core 4.13.0 with all seven tooltips forced open. Two violations came back, `landmark-one-main` and `region`, both caused by my fixture having no landmarks and neither related to tooltip behaviour.

The rule list explains it. axe-core 4.13.0 carries 105 rules and exactly zero of them is tagged `wcag1413`.

```
axe-core 4.13.0 total rules: 105
rules tagged wcag1413: 0 []
```

Not a criticism of the tool. Dismissible, Hoverable and Persistent aren't properties you can read off a static DOM; you have to press, drag and wait. The blind spot I catalogued when [counting axe's rule tags per success criterion](/en/blog/en/act-rules-axe-coverage-wcag-sc-2026) shows up here intact. A green score and compliance with this criterion have nothing to do with each other.

Which means the scope of this run needs stating plainly. One engine (Chromium 143), one gap value (8px), one hand-built fixture. These numbers say nothing about violation rates on real sites and nothing about how other rendering engines behave. Touch input and the experience through assistive technology weren't measured at all. And my fixture passing three probes is not the same as a conformance verdict on a real page, which folds in the waivers and the context around them.

## Delete the 8px or grant the 150ms

Short list of what I'd now hold to.

- **Escape lives outside CSS.** If the tooltip covers anything behind it, attach a keyboard listener. Lean on the waiver only when you're certain it covers nothing.
- **Keep the gap in the eye and out of the box.** 8px of `margin` is a pointer trap; 8px of `padding` isn't. What decides the verdict is hit-test distance, not visual distance.
- **If the gap has to stay, grant a grace period.** Don't close on `mouseleave`; schedule it 100–200ms out and cancel on entry.
- **Never hide on a timer.** Auto-hide is defensible only when the content itself is bound to the clock.
- **Wire the open/close logic yourself even with `popover`.** What the browser takes off your hands stops at Dismissible.
- **Check by hand.** No rule in the scanner covers this. Push the pointer into the popup, press Escape, wait five seconds. Three motions.

One thing I still haven't settled. Butting the popup against the trigger makes Hoverable certain, but it also blurs the boundary between the two, and there's a point where you can no longer tell where the button ends. How thick the padding has to get before that edge reads again, and whether that route really beats keeping the gap and granting the grace period, this fixture couldn't tell me. The next run sweeps the grace value and puts both routes on the same ruler.

If you're staring at a screen layered with dropdowns, menus and bubbles and can't tell where to start on these three, ask. Translating criterion text into component code, and making a script rather than a person re-check the verdict, is the work I do. Contact route is on my profile.

---

*Sources: the W3C's [WCAG 2.2 Success Criterion 1.4.13 Content on Hover or Focus](https://www.w3.org/TR/WCAG22/#content-on-hover-or-focus) (W3C Recommendation), [Understanding SC 1.4.13](https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus.html), and the WHATWG [HTML Standard, The popover attribute](https://html.spec.whatwg.org/multipage/popover.html) (all official). The success criterion text and notes 1 and 3 were copied verbatim after checking them against the Recommendation on the spot, with the source link placed next to the quote. The Understanding document and the HTML Standard are summarised and linked rather than quoted. Measurement environment: one static HTML page in a temporary sandbox directory (seven tooltip implementations), Chromium 143.0.7499.4 headless, Playwright 1.57.0, Node 22.22, viewport 900×1400, 8px gap between trigger and popup, axe-core 4.13.0, measured 12 August 2026. Probe script `scripts/probe-hover-focus-1413.mjs`, fixture `scripts/fixtures-hover-focus-1413.html`, raw data `data/hover-focus-1413-probe.json`. The script was run twice with identical results. Every verdict comes from this engine, this fixture and this gap value, and is not a statement about conformance of real sites or about other rendering engines. Touch input, assistive technology behaviour, and the browser-drawn `title` tooltip (not observable from the DOM) were not measured.*
