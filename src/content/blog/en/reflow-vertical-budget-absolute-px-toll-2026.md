---
title: A page can pass the WCAG 1.4.10 Reflow check and still lose most of its vertical
  reading space at 400% zoom
description: A webpage that passes the official left-to-right check can still leave
  only 118 pixels of vertical space for actual text when a reader zooms to 400%. Measuring
  where the lost pixels go shows the loss comes from fixed-size page furniture, not
  from zooming itself.
pubDate: '2026-08-28'
heroImage: ../../../assets/blog/reflow-vertical-budget-absolute-px-toll-2026/hero.png
tags:
- accessibility
- wcag
relatedPosts:
- slug: declared-rules-fail-open-robots-txt-agents-md-2026
  score: 0.7
  reason:
    en: A page that passes the WCAG 1.4.10 Reflow check can still lose most of its
      vertical content, and that mirrors how truncated rules in robots.txt and AGENTS.md
      fail silently—both are 'failures without errors,' so reading both pieces shows
      why passing validation is not the same as being safe.
    ko: WCAG 1.4.10 Reflow를 통과한 페이지조차 세로 스크롤로 내용을 잃는 것은 robots.txt와 AGENTS.md의 잘린
      규칙이 조용히 실패하는 방식과 같은 '에러 없는 실패'의 또 다른 사례이므로, 검증을 통과해도 무너지는 지점을 이해하려면 두 글을 함께
      봐야 한다.
    ja: WCAG 1.4.10 Reflowを通過したページでも縦スクロールで内容を失うのは、robots.txtとAGENTS.mdの切れたルールが静かに失敗するのと同じ「エラーなしの失敗」のもう一つの例であり、検証を通過しても崩れる箇所を理解するには両方の記事を読む価値がある。
    zh: 通过 WCAG 1.4.10 Reflow 检查的页面仍可能在垂直方向丢失大量内容,这与 robots.txt 和 AGENTS.md 中被截断的规则静默失效如出一辙——两者都是'没有报错的失败',同时阅读才能明白为何通过验证不等于安全。
---

Zoom means the browser feature that makes everything on a page bigger. It is the same as pinching out on a phone. On a computer, you zoom by pressing the plus button while holding Ctrl. Reflow means the way a page rearranges its text into a narrower, taller shape so you never have to scroll sideways to read a line.

A page can pass the official check for reflow and still be nearly unreadable to someone who zooms. The check, called WCAG 1.4.10 Reflow, only measures whether content fits from left to right at 320 pixels of width. It never measures how much room is left from top to bottom. In one real measurement, a page that passed the width check left only 118 of 200 vertical pixels for the actual article text. The missing height was eaten by page furniture: a header and a bottom ad box that stay the same size no matter how small the screen gets.

That is the whole point of this piece. A passing mark on a check that measures one direction says nothing about the other direction.

## 400% zoom shrinks the height, not just the width

Zooming to 400% does something people often miss. It multiplies the size of things in both directions, so a screen that used to show a lot of content now shows a much smaller slice of it. The W3C, the standards body behind WCAG, states this plainly: "400% applies to the dimension, not the area."

Zoom to 400% and the screen shows a quarter of the content in each direction, so everything competes for a much smaller space.

For a reader who depends on zoom, the window gets very small. Their screen at 400% zoom shows the equivalent of a tiny 320-by-200-pixel window of content. The page has 200 vertical pixels to work with at that moment. If 118 of those go to the article, only 82 are left for everything else. In the measured case, the article got the 118. The page furniture took the rest. The usable vertical space for text fell by 41% at the top of the page, and the loss reached 45% of the height mid-scroll. Almost half the window showed no text you could read.

## The official width check measures nothing about height

WCAG is a set of rules for making websites usable by people with disabilities, and 1.4.10 Reflow is one of its rules. Here is exactly what it requires:

> Content can be presented without loss of information or functionality, and without requiring scrolling in two dimensions for: Vertical scrolling content at a width equivalent to 320 CSS pixels; Horizontal scrolling content at a height equivalent to 256 CSS pixels.
> — [WCAG 2.2 Success Criterion 1.4.10 Reflow (spec)](https://www.w3.org/TR/WCAG22/#reflow)

Read that closely. For a page that scrolls up and down (which is almost every page), the rule only asks for one thing: the content must fit into 320 pixels of width. It says nothing about height. The rule was written that way on purpose.

The measured pages passed this rule completely. On every one of 8 tested combinations, the content fit exactly the width available: the visible width equaled the full content width, with 0 pixels of sideways overflow, and the reflow check returned pass on all 8. Yet at the same time, on the smallest measured screen, the article could only touch 118 of 200 vertical pixels.

Both things were true at once. The page passed the width test and starved the reader vertically. The check never looks at the second number, so the passing mark tells you nothing about it.

To be fair to the rule: it never claimed otherwise. The people who wrote it designed it to govern width, and they never promised that passing it guarantees vertical readability. If anyone treats a 1.4.10 pass as meaning "this page reads fine when zoomed," the fault is in that expectation, not in the rule itself. The rest of this piece is about why that expectation is so common, and why it breaks.

## Where the missing vertical space goes — 82 pixels and 90 pixels

So where do the lost pixels go? The measurement took a real, live website and shrank the window height in steps: 844, 400, 256, and 200 pixels tall, always 320 pixels wide. At each size it measured how many vertical pixels actually reach the article text. The test walks down the screen in small steps. At each step it asks what element is sitting there. A pixel counts as usable only if the answer is the article.

The finding: the loss was exactly 82 pixels at every single window height. Not a percentage that got bigger — the same flat 82 pixels every time. The usable space was 762 pixels out of 844, then 318 out of 400, then 174 out of 256, then 118 out of 200.

A flat absolute loss is a signature. It means the element taking the space does not respond to the size of the screen. A percentage-based loss would shrink with the window; a fixed-size object keeps taking the same amount no matter what.

But the story has a twist. The 82 pixels at the top of the page turned out not to be a floating header at all. In the measured runs, the header was no longer sticky at small heights. Sticky means it stays pinned to the top of the screen as you scroll. Instead, it had switched back to normal page flow. So it scrolls away with the page and blocks nothing. The flat 82 pixels belong to a header block sitting inside the normal flow of the document, not to anything glued over it.

The real fixed element appears mid-scroll. Removing tests were run: strip away each fixed element one at a time and see how many vertical pixels come back. The results:

| Element removed | Pixels recovered (at 320x200, mid-scroll) |
|---|---|
| Header | 0 |
| Reading progress bar | 0 |
| Back-to-top button | 0 |
| Bottom ad container | 90 |
| All of them | 90 |

One element, a bottom ad container, accounts for the entire mid-scroll loss — 90 pixels, all by itself. Removing it restored the full 200 pixels of usable height. Removing the back-to-top button recovered zero pixels, and removing everything recovered the same 90 as removing the ad alone, which confirms there was no overlap in what each element was blocking.

The W3C's own guidance warns about exactly this kind of element:

> Such sticky or fixed content can pose significant issues for those who would benefit from Reflow, as aside from obscuring keyboard focus, such sticky or fixed content can make reading content difficult if not impossible.
> — [Understanding Success Criterion 1.4.10: Reflow / W3C WAI](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)

And it defines the culprit plainly: "Sticky regions always stay visible in the viewport while the other content will disappear underneath when scrolling." The ad container held its 400-pixel height at every window size, from 844 down to 200 — a fixed size that never yielded to the shrinking screen.

## The loss does not grow — the denominator shrinks

Here is the number that should change how you think about zoom problems. The same 90 pixels taken by the bottom ad container amounted to 10.7% of the screen height at 844 pixels. At 200 pixels of height, the same 90 pixels amounted to 45%.

Nothing about the ad changed. Nothing about the blocking grew worse. The only thing that changed was the denominator, the total space being divided. The slice stayed the same size; the whole pie got smaller.

This is why zoom problems hide until the last moment. At normal window sizes, the fixed furniture costs a fraction small enough to ignore. At 400% zoom on a small screen, the same furniture takes nearly half the window. A fixed-size object takes the same pixels in a big window and a small one. The smaller the window, the bigger its share, and the less room left for you.

A control test confirms the zoom itself is not the culprit. The same measurement run on a plain local document with no headers, no ads, no floating elements of any kind showed every row at a perfect ratio of 1.0: the entire screen reached the text at every point. The loss is not a zoom effect. It is a page-furniture effect.

## Measuring the vertical budget next to the pass verdict

If you run a website that serves people who zoom or use a screen reader (a program that reads page content aloud), the fix is concrete. Keep the 1.4.10 width check. Add, alongside it, a vertical budget measurement: shrink the view to 320 by 200 pixels and count how many vertical pixels actually reach the article text, point by point. The measurement needs no special access and no special tools. It was run against a public site using a standard tool that controls a browser by itself, in 27 runs across 6 cells.

If the count comes back low, the removal test tells you who is eating the pixels: strip each fixed element in turn and see what comes back. In the measured case, the entire 90-pixel loss traced to one bottom ad container, and the W3C already publishes a technique — C34 — for the fix, using a media query to un-fix sticky elements. A media query is a rule that applies only under certain screen conditions. Un-fixing lets them scroll away on small screens.

What changes on your end is one extra gate. A page should not be called "readable at 400%" on the strength of a width check alone.

If, on the other hand, your pages are internal documents or reports with no sticky headers or floating buttons and no bottom ad boxes, the width check alone is genuinely enough. The control test proved it: with no floating furniture, the vertical budget is perfect, and measuring it again would add nothing. Skip it.

## What this article could not verify

This measurement could not settle some things. The exact window height at which the header switches from pinned to normal flow is only narrowed down to somewhere between 400 and 844 pixels — the precise threshold was not found. The bottom ad container occasionally failed to block anything, likely due to ad-loading timing, but the cause was not confirmed. And this data says nothing about whether a small vertical budget actually drives zoom users away, nor about how these findings extend to sites built differently from the one tested.

And one honest line about when this whole judgment would be wrong: if you strip every floating element from the page at 320x200 and the pixels reaching the article do not grow at all from their 110, then attributing the loss to fixed page furniture is incorrect.

## References

1. [Understanding Success Criterion 1.4.10: Reflow / W3C WAI](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html) — W3C
2. [WCAG 2.2 Success Criterion 1.4.10 Reflow (spec) / W3C](https://www.w3.org/TR/WCAG22/#reflow) — W3C
3. [CSS technique C34: Using media queries to un-fixing sticky headers / W3C WAI](https://www.w3.org/WAI/WCAG22/Techniques/css/C34) — W3C