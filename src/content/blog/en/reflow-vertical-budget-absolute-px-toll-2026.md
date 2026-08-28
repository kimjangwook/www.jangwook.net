---
title: Passing WCAG 1.4.10 Reflow Does Not Make a Page Readable at 400% Zoom
description: A page can pass the WCAG reflow width test and still lose a fixed 82
  pixels of vertical reading space at every screen height. This article walks through
  the measurements that show it and what to do differently.
pubDate: '2026-08-29'
heroImage: ../../../assets/blog/reflow-vertical-budget-absolute-px-toll-2026/hero.png
tags:
- accessibility
- wcag
relatedPosts:
- slug: declared-rules-fail-open-robots-txt-agents-md-2026
  score: 0.7
  reason:
    en: This article extends the earlier finding that rules can be silently truncated
      while still technically compliant, showing how a page can pass WCAG reflow yet
      lose reading space at every zoom level.
    ko: WCAG 리플로우를 통과해도 실제로는 읽기 공간이 사라지는 이 글은, 규격을 지켰는데도 규칙이 조용히 잘려버리는 이전 글의 문제 의식을
      UI 측정으로 확장해 보여준다.
    ja: WCAGリフローを通過しても読書空間が失われる実測を示すこの記事は、仕様準拠でもルールが静かに切断されるという前回記事の問題意識をUI計測へ広げてくれる。
    zh: 本文将通过实测说明页面符合WCAG回流标准却仍丢失阅读空间,把上一篇文章中规则被静默截断的问题延伸到了UI符合性的盲区。
---

## What a reflow verdict can and cannot measure

There is a web rule called WCAG 1.4.10 Reflow. WCAG is a set of accessibility rules, rules that say websites should work for everyone, including people who need to zoom in a lot to read. Reflow means this: when you zoom a page way in, the words should rewrap into a single tall column instead of forcing you to scroll sideways and up-down at the same time.

The rule has a concrete test. For a page that scrolls up and down, the content must fit within a width of 320 pixels at 400% zoom. That is roughly the width of a small phone screen. 400% zoom means everything on the page is drawn four times as big in each direction.

Here is the catch. The test checks the width. It says nothing about the height. The official wording asks for "Vertical scrolling content at a width equivalent to 320 CSS pixels" and leaves height unstated.

> Content can be presented without loss of information or functionality, and without requiring scrolling in two dimensions for: Vertical scrolling content at a width equivalent to 320 CSS pixels; Horizontal scrolling content at a height equivalent to 256 CSS pixels.
> — [WCAG 2.2 Success Criterion 1.4.10 Reflow (spec)](https://www.w3.org/TR/WCAG22/#reflow)

So when a page passes, what did it actually earn? It earned proof that no sideways scrolling appears at that size. It did not earn proof that the page is still readable top to bottom. Those sound similar. They are not. This article is about the gap between them, and it is a gap you can measure with a number.

Why does this matter at 400% zoom specifically? Because zooming does not only shrink the usable width. It also shrinks the usable height.

> 400% applies to the dimension, not the area
> — [Understanding Success Criterion 1.4.10: Reflow / W3C WAI](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)

In plain words: zooming to 400% divides every direction by 4. Your screen effectively becomes a narrow, short window. What fit comfortably now has to fight for space.

## The measurement method and the visible vertical space

To see what is really left of a page at high zoom, we ran a measurement on a public live website. The tool was Playwright, which is software that drives a real browser and lets you ask it questions about what is on screen. The method is simple. We fixed the width at 320 pixels and walked down the screen in small 2-pixel steps. At each step we asked the browser one question: which element is right here? The browser has a feature that can answer that. We sampled at three horizontal positions across each row.

If the answer is the article text, that pixel counts as readable. If the answer is a header, a banner, or a floating button, that pixel is taken. We counted only the pixels the article text actually reaches. That count is the page's real vertical budget for reading.

We ran this at four screen heights: 844, 400, 256, and 200 pixels. And we ran a total of 27 runs across different pages and scroll states to make sure the pattern held. On a plain local control page with no fixed elements, the measurement returned a ratio of 1.0 on every row, meaning the method itself does not create any artificial loss. The tool measures honestly.

<div class="lm-card lm-card--how" data-lm-figure="explain-how" data-lang="en"><span class="lm-card__title">How we measured</span><ol class="lm-card__steps"><li class="lm-card__text">Step 1. Fixed the screen width at 320 pixels and measured the readable vertical space while changing the height to 844, 400, 256, and 200.</li><li class="lm-card__text">Step 2. Removed the fixed elements on the screen and checked how much space came back.</li><li class="lm-card__text">Step 3. Measured how much space each element took by removing them one at a time.</li><li class="lm-card__text">Step 4. On a fake page with no fixed elements, checked whether the measurement method itself creates a loss.</li><li class="lm-card__text">Step 5. Also checked whether the pages pass the criterion of not overflowing horizontally.</li></ol></div>

The results surprised us, and they will change how you think about accessibility checkmarks. At the tallest screen, 844 pixels, the article text reached 762 pixels. At 400 pixels it reached 318. At 256 it reached 174. At the shortest screen, 200 pixels, the article text reached only 118 pixels out of 200. That means at high zoom, on this site, nearly half the screen was not the article at all. And the same site passed the horizontal reflow check 8 times out of 8, with zero sideways overflow.

## An 82-pixel loss independent of screen height

Now the key finding, and it is easier to see with a shopping analogy. Think of a fixed delivery fee: whether you order one book or ten books, the fee is the same. The fee does not care about your order size. The lost vertical space on this page behaved exactly like that fee. It stayed the same no matter how the screen changed.

Look at the arithmetic. At a height of 844, the loss was 844 minus 762, which is 82 pixels. At 400: 400 minus 318, which is 82. At 256: 256 minus 174, which is 82. At 200: 200 minus 118, which is 82 again. Four different screen sizes, and the loss stayed at exactly 82 pixels every time.

| Screen height | Readable pixels | Lost pixels |
|---|---|---|
| 844 | 762 | 82 |
| 400 | 318 | 82 |
| 256 | 174 | 82 |
| 200 | 118 | 82 |

The lost space stayed exactly the same absolute amount as the screen shrank. The screen was cut to less than a quarter of its height, and the toll never moved a single pixel.

So why does this matter to you? When the fee is fixed and the shopping cart shrinks, the fee eats a bigger and bigger share. On the tallest screen, the 82-pixel loss is about a tenth of the total. On the shortest screen, at 200 pixels, the loss becomes 41.0% of everything, and 45.0% in the mid-scroll state. The ratio grew because the denominator shrank, not because the loss did. That is why a passing page can still fail real readers.

<div class="lm-card lm-card--cell" data-lm-figure="explain-cell-budget-ladder-320w-4heights" data-lang="en"><span class="lm-card__badge lm-card__badge--ok">pass</span><span class="lm-card__title">Vertical space ladder by height</span><span class="lm-card__text">Even as the screen height decreased from 844 to 200, the lost vertical space was exactly 82 pixels in all four cases.</span><div class="lm-card__numbers"><span class="lm-card__chip">Height 844 lost 82</span><span class="lm-card__chip">Height 400 lost 82</span><span class="lm-card__chip">Height 256 lost 82</span><span class="lm-card__chip">Height 200 lost 82</span></div></div>

One element deserves a special note. A bottom ad container on the site kept a height of 400 pixels whether the screen was 844 tall or 200 tall; that held in 6 out of 6 checks. It never responded to the screen it was on. The W3C's own guidance already warns about this kind of thing.

> Sticky regions always stay visible in the viewport while the other content will disappear underneath when scrolling.
> — [CSS technique C34: Using media queries to un-fixing sticky headers / W3C WAI](https://www.w3.org/WAI/WCAG22/Techniques/css/C34)

## Element-by-element recovery breakdown and the 90-pixel attribution

Losses are only useful if you can trace them to a cause. So we did a second experiment: we removed the fixed elements from the page one at a time, and measured how much readable space came back each time.

The results were surprisingly one-sided. Removing the header returned 0 pixels. Removing the reading-progress bar returned 0 pixels. Removing the back-to-top button (a floating button that is 48 pixels tall and visible in the mid state) also returned 0 pixels. Removing the fixed bottom container returned 90 pixels. Removing every fixed element at once returned the same 90 pixels.

So the numbers close cleanly: 0 + 0 + 0 + 90 equals 90, the total. There was no overlap between the elements. One single bottom fixed bar accounts for the entire mid-state loss.

<div class="lm-card lm-card--cell" data-lm-figure="explain-cell-removal-decomposition-at-320x200" data-lang="en"><span class="lm-card__badge lm-card__badge--ok">pass</span><span class="lm-card__title">Element-by-element decomposition</span><span class="lm-card__text">Removing one bottom fixed bar brought back 90 pixels, and the remaining elements were 0 pixels on their own.</span><div class="lm-card__numbers"><span class="lm-card__chip">Fixed bar recovery 90</span><span class="lm-card__chip">Top button recovery 0</span><span class="lm-card__chip">Header recovery 0</span></div></div>

We had expected the sticky header to be the main culprit. The data said no. At the shortest height, the header dropped out of its pinned position and became a normal part of the page, scrolling away with everything else. It was not blocking anything in the mid state. Our first guess about the 82 pixels was wrong, and the removal experiment corrected it. The fixed UI element that matters is the bottom bar, and its 90 pixels are the cost of keeping it on screen at any zoom level.

Notice something about the back-to-top button, though. It returned 0 pixels of reading space, but that does not make it free. It still sits over the page and can cover keyboard focus, the highlighted outline that shows a keyboard user where they are. The W3C's understanding document for the criterion names that cost too. It just is not a cost our ruler can see.

## A vertical check to place beside the horizontal pass verdict

Here is the honest counterargument, and it deserves to be stated fairly. WCAG 1.4.10 never claimed to check height. Requiring only a 320-pixel width for vertical content was a deliberate design choice, and the standard never said a pass guarantees vertical readability. On the standard's own terms, that argument is correct. This article does not overturn the standard.

But in day-to-day practice, a 1.4.10 pass quietly works as a proxy for "this page is fine when zoomed." Our experiment puts a number on when that proxy breaks: when a fixed fee of 82 pixels at the top of the page, plus another 90 pixels in the mid-scroll state, is taken from the reading space at every screen height. The pass is true on the axis the rule measures. It says nothing on the axis the reader actually lives on.

What you should do depends on which side of the page you work on. If you make pages that are read by people who zoom (news sites, blogs, any article page), run one extra check: with the width pinned at 320, measure how many vertical pixels actually reach the article text at a small height, and treat it as a separate gate from the width test. That is the entire fix this data points to. If, on the other hand, you produce documents and reports with nothing pinned over the page (no sticky headers, no floating bars) then the existing horizontal pass is enough, and an extra audit would be overkill.

The same split applies to what you build. A sticky header or bottom bar is not forbidden. The technique the W3C recommends, called C34, is to use a media query (a rule that changes styling based on screen size) to turn those elements off, or make them flow statically, once the screen gets small enough.

<div class="lm-card lm-card--takeaway" data-lm-figure="explain-takeaway" data-lang="en"><span class="lm-card__title">Takeaway</span><p class="lm-card__takeaway">The cost of encroaching on the vertical budget was not a relative value proportional to screen height but an absolute toll of about 82 pixels, and a separate 90-pixel loss in the mid-scroll state was caused by a single bottom fixed bar.</p></div>

One caution about our own numbers, so you do not over-trust them: even on pages that blocked reading, the horizontal test passed 8 out of 8. One article page did have 97 child elements overflowing somewhere inside, with the worst one sticking out by 604 pixels, but no sideways scrollbar ever appeared on the screen as a whole, so the official test still saw a clean pass. A pass can be clean while things underneath are quietly pinched.

## What this article could not verify

This run measured one public live site, on one machine, in one browser version, across 27 runs. It measured pixels the article text actually reaches, judged point by point on the screen, not real reading behavior; we never tracked actual users zooming and leaving. Four things stayed open. The exact height where the header stops being pinned is only narrowed to somewhere between 400 and 844. The reason the bottom bar's blocking sometimes failed to appear, probably ad loading timing, was never pinned down. The reachability of one page's result at the shortest height did not match the pattern. And we did not trace where the 97 overflowing children get clipped.

The broader point holds beyond this one site: whenever a standard passes on the axis it chose to measure, that pass is valid only on that axis. Vertical readability needs its own measurement, not a borrowed certificate. This judgment would be wrong if two things turned out differently: if removing every always-visible fixed element still left the vertical space unchanged, or if the lost pixels grew in proportion to the screen (smaller screen, proportionally bigger loss) rather than holding at a fixed absolute amount.

---

## References

1. [https://www.w3.org/WAI/WCAG22/Understanding/reflow.html](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)
2. [https://www.w3.org/TR/WCAG22/#reflow](https://www.w3.org/TR/WCAG22/#reflow)
3. [https://www.w3.org/WAI/WCAG22/Techniques/css/C34](https://www.w3.org/WAI/WCAG22/Techniques/css/C34)