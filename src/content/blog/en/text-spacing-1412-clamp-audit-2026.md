---
title: 'I Widened Letter Spacing by 0.12em and 570 Elements Clipped'
description: 'axe-core reported zero violations for WCAG 1.4.12. Then I applied the four declarations the criterion actually asks for, and 570 elements lost text. Here is the breakdown of which declaration does the damage.'
pubDate: '2026-08-07'
heroImage: '../../../assets/blog/text-spacing-1412-clamp-audit-2026/hero.png'
tags:
  - accessibility
  - WCAG
  - CSS
  - i18n
  - web development
faq:
  - question: 'If axe reports zero violations for 1.4.12, what is the problem?'
    answer: 'The avoid-inline-spacing rule checks whether an inline style attribute is blocking user stylesheets. My site never pins spacing inline, so passing is the correct verdict. But the criterion itself says content must survive when a user applies four specific values, and applying them is not something the rule does. The rule is not wrong. Its reach and the criterion''s reach are different distances.'
  - question: 'Does using -webkit-line-clamp automatically fail 1.4.12?'
    answer: 'No. The W3C Understanding document does not treat truncation itself as a failure, provided a mechanism exists to reveal the truncated text. A card excerpt that links to the full article has that mechanism. The failure case is a sentence that lives only in that one spot. My per-post recommendation blurb was exactly that, and it was showing 35% of itself.'
  - question: 'Should the test set line-height to 1.5 flat, or only raise it where it falls short?'
    answer: 'Run both. The popular bookmarklets write 1.5 verbatim, which actually shrinks line height anywhere the author already exceeds it. In my run the two readings produced identical loss counts, 570 either way, and differed only in page height. Line height was not the cause of any loss, so the choice did not move the number.'
  - question: 'Is word-spacing safe to ignore on a CJK site?'
    answer: 'Only partly, and the split is not where people expect. With word-spacing alone, Japanese pages clipped 1 element and Chinese 3, but Korean clipped 40. Korean writes spaces between words, so the declaration lands normally. The W3C exception for scripts that do not use a property covers Japanese and Chinese. It does not cover Korean.'
relatedPosts:
  - slug: act-rules-axe-coverage-wcag-sc-2026
    score: 0.86
    reason:
      ko: 어제 그 글에서 axe가 어느 성공기준을 판정하지 못하는지 목록으로 뽑았다. 1.4.12는 14건 중 13건이 잡혀 오히려 잘 잡히는 쪽이었다. 이 글은 그 13건이 무엇을 잡은 것이었는지를 확인한 기록이다.
      ja: あの記事はaxeがどの成功基準を判定できないかを一覧にした。1.4.12は14件中13件で、むしろ得意な側に見えた。この記事はその13件が何を捕まえていたのかを確かめた記録だ。
      en: That post listed which success criteria axe cannot decide. 1.4.12 scored 13 of 14, landing it firmly in the "covered" column. This one checks what those 13 were actually catching.
      zh: 那篇把 axe 判不了的成功标准列成了表。1.4.12 是 14 中 13，看着属于覆盖得好的一档。这篇要弄清楚那 13 条到底抓住了什么。
  - slug: wcag22-target-size-audit-2026
    score: 0.72
    reason:
      ko: 초록불 뒤에 AA 실패가 숨어 있던 또 한 사례다. 그때는 규칙이 꺼져 있어서였고 이번에는 규칙이 켜져 있는데도 사정거리가 짧아서였다. 통과 표시가 뜻하는 범위를 매번 따로 확인해야 하는 이유다.
      ja: 緑のスコアの裏にAA不合格が隠れていたもう一つの事例。あれはルールが無効だったから、今回はルールが有効でも射程が短いからだ。合格表示の意味する範囲は毎回別に確かめるしかない。
      en: Another green score with an AA failure behind it. Last time the rule shipped disabled; this time the rule ran and simply did not reach far enough. Either way, "pass" needs its scope read separately.
      zh: 又一次绿灯背后藏着 AA 不合格。上次是规则默认关着，这次是规则跑了但射程不够。所以「通过」两个字的范围，每次都得单独确认。
  - slug: table-markup-a11y-llm-extraction-2026
    score: 0.64
    reason:
      ko: 시각적으로 멀쩡한 표가 접근성 트리에서는 표가 아니었던 이야기다. 보이는 결과와 기계가 읽는 구조가 어긋나는 지점을 찾는다는 점에서 이번 자간 측정과 같은 종류의 작업이다.
      ja: 見た目は問題ない表が、アクセシビリティツリーでは表になっていなかった話。見える結果と機械が読む構造のズレを探すという点で、今回の字間の測定と同種の作業だ。
      en: "A table that looked fine and was not a table in the accessibility tree. Same kind of work as this letter-spacing run: hunting the gap between what renders and what a machine reads."
      zh: 一个看起来没问题、在无障碍树里却不是表格的表格。找「渲染出来的样子」和「机器读到的结构」之间的缝隙——和这次的字距测量是同一类活。
  - slug: axe-core-ci-a11y-jsdom-vs-browser-2026
    score: 0.61
    reason:
      ko: 실행 환경 때문에 규칙이 조용히 빠지는 경우를 다뤘다. 이번엔 환경도 규칙도 정상인데 기준의 일부가 남았다. 자동 게이트를 믿는 방식이 층마다 달라야 한다는 이야기로 이어진다.
      ja: 実行環境のせいでルールが静かに抜ける場合を扱った。今回は環境もルールも正常なのに基準の一部が残る。自動ゲートの信じ方は層ごとに変えるしかない。
      en: That one covered rules quietly dropping out because of the runtime. Here the runtime and the rule both behaved, and part of the criterion still went unchecked. Different layers, different amounts of trust.
      zh: 那篇讲的是运行环境让规则悄悄失效。这次环境和规则都正常，标准却仍有一部分没人管。对自动闸门的信任，得按层来分。
---

The axe rule for WCAG 1.4.12 is called `avoid-inline-spacing`.

Read the name again. It is honest about its scope, and the scope is narrow. The rule looks for inline `style` attributes that pin spacing so hard a user stylesheet cannot override them. That is a real failure mode and worth catching. It is also not what the success criterion asks.

The criterion asks what happens when a reader actually widens the text. So I did that, on my own site, and counted.

## What the criterion asks and what the rule reads

Success Criterion 1.4.12 Text Spacing is Level AA. It names four values: line height at least 1.5 times the font size, spacing following paragraphs at least 2 times, letter spacing at least 0.12 times, word spacing at least 0.16 times. When a user sets those four, there must be <strong>no loss of content or functionality</strong>.

It helps to know why the criterion exists before arguing about how to test it. Readers with dyslexia, low vision, or certain cognitive disabilities lose their place when lines are packed tight. Their eyes drop back onto the line they just finished. So they widen the spacing themselves, with an extension or a user stylesheet, and read that way. 1.4.12 does not ask you to ship wide spacing. It asks whether <strong>your layout survives when the reader widens it</strong>. Your job is headroom, not typography.

The [W3C Understanding document](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html) illustrates three ways to fail: text cut off vertically, text cut off horizontally, and text overlapping the sentence that follows. It also says plainly that an ellipsis is not automatically a failure, as long as a mechanism exists to reveal the truncated text. Hold onto that clause. It decides the ending of this post.

Now the rule. Deque documents `avoid-inline-spacing` as: "Ensure that text spacing set through style attributes can be adjusted with custom stylesheets." It reads `style` attributes. It does not apply the spacing, and it never looks at the layout afterwards.

Here is that rule on my site, run alone:

```
axe-core 4.13.0  ·  runOnly: avoid-inline-spacing
24 pages
violations: 0   passes: 24   incomplete: 0   inapplicable: 0
```

Clean sweep. I have never pinned spacing with an inline style, so a pass is the right answer. The rule did its job.

[Yesterday I measured axe against 1,213 W3C ACT test cases](/en/blog/en/act-rules-axe-coverage-wcag-sc-2026) to see which criteria it can decide at all. 1.4.12 scored 13 of 14, sitting comfortably in the well-covered column. That number was honest too. But all 13 of those cases were inline-style examples. The answer key and the live site were asking different questions.

## Applying the four declarations, one at a time

So I wrote a script that applies the criterion instead of the rule: `scripts/audit-text-spacing.mjs`. Playwright opens the page, records the geometry of every element, injects the four values with `!important`, and records again.

Loss gets detected three ways:

- an element inside `overflow: hidden` or `clip` whose `scrollHeight` now exceeds its `clientHeight`
- an element under `-webkit-line-clamp` that now hides more lines than before
- a document that grows a horizontal scrollbar it did not have

The sample is 24 URLs across four languages: home pages, blog indexes, static pages, article pages, the 404. Two viewports, 1280×800 and 390×844, so 48 page views in total.

With all four declarations applied:

| metric | value |
|---|---|
| elements newly clipped | 570 |
| elements losing clamped lines | 1,438 |
| page views with new loss | 29 of 48 |
| pages that grew a horizontal scrollbar | 0 |
| page height growth | min 1.006×, median 1.123×, max 1.487× |

Zero horizontal overflow was the good news. The fluid layout holds even with every glyph widened. Everything that broke, broke inside a box.

But a total of 570 does not tell you what to fix, because it does not say which of the four values is responsible. So I ran it four more times, one declaration per run.

![Horizontal bar chart comparing elements newly clipped for each of the four SC 1.4.12 declarations applied individually. line-height 1.5 and paragraph spacing 2em both produce zero, word-spacing 0.16em produces 122, letter-spacing 0.12em produces 523, and all four together produce 570](../../../assets/blog/text-spacing-1412-clamp-audit-2026/declaration-decomposition.png)

| declaration | newly clipped | clamped lines lost | median page height |
|---|---|---|---|
| `line-height: 1.5` | 0 | 0 | 1.000× |
| `margin-bottom: 2em` (paragraphs) | 0 | 0 | 1.064× |
| `word-spacing: 0.16em` | 122 | 225 | 1.004× |
| `letter-spacing: 0.12em` | 523 | 1,316 | 1.036× |
| all four | 570 | 1,438 | 1.123× |

The split is total. The two vertical declarations caused <strong>zero loss</strong>. Everything came from the two horizontal ones, and letter spacing alone accounts for 523 of 570, about 92%.

## The axis you notice is not the axis that loses content

Seeing that table told me I had the criterion filed in the wrong order in my head.

Almost every explainer for 1.4.12 opens with line height 1.5, and that is how I had internalized it. But think about what raising line height does. Lines separate, paragraphs stretch, the page grows downward. A `-webkit-line-clamp` box grows too, because its height is line count multiplied by line height. Three lines stay three lines. The number of visible characters does not move.

Paragraph spacing behaves the same way. It pushed median page height to 1.064× and lost nothing. Vertical displacement is something scrolling absorbs.

Letter spacing is a different animal. 0.12em means every glyph is wider, which means fewer characters fit on a line. The three-line clamp box is still three lines, but those three lines now carry less. The box holds still while the contents swell past it.

So: <strong>the axis a reader notices and the axis that destroys content are different axes.</strong> Someone running a user stylesheet experiences "this page got longer." What actually disappears is the end of a sentence pushed sideways. And in a visual QA pass, the first one is far easier to spot.

One more methodological check was needed here. The widely used text-spacing bookmarklets write `line-height: 1.5` literally. My body copy is already set at 1.58, so overriding it with 1.5 is a <strong>reduction</strong>. That showed up in the data: with line height alone, minimum page height came out at 0.926×. Some pages got 7% shorter.

So I ran a second reading of the same clause, raising line height to 1.5 only where it fell below. Result: 570 newly clipped, 1,438 lines lost. <strong>Identical.</strong> The only thing that moved was median page height, from 1.123× to 1.168×. However you read the line-height requirement, the loss numbers do not budge, which is one more piece of evidence that line height was never the cause.

## Languages with spaces between words, and languages without

Splitting the word-spacing run by language produced the result I did not see coming.

| language | newly clipped (desktop / mobile) |
|---|---|
| Japanese | 1 / 1 |
| Chinese | 3 / 4 |
| Korean | 40 / 15 |
| English | 0 / 55 |

Japanese and Chinese are effectively immune, for an obvious reason: they do not put spaces between words, so `word-spacing` has almost nowhere to land. The Understanding document accounts for this with an exception for scripts that do not use one or more of these properties.

Korean clipped 40. Korean gets grouped under CJK constantly, but it <strong>does write spaces between words</strong>. The gaps are real, so the declaration lands normally. The W3C exception covers Japanese and Chinese. It does not cover Korean.

If you run a multilingual site, that distinction has teeth. Treat "CJK" as one bucket that word spacing cannot touch and you will be quietly wrong on every Korean page. I had been carrying exactly that assumption until this table.

English mobile at 55 is a different story. English excerpts average 168 characters, the longest of the four languages. At 390px wide, that length sits right on the boundary of a three-line clamp, so a small nudge in word spacing tips it over. The same reason explains the 0 on desktop, where there is width to spare.

Letter spacing plays no favorites, since it attaches to every glyph. Korean desktop took the worst of it at 164.

## Some sentences can be truncated, some cannot

That is the criterion. Deciding what to actually fix turned out to be a separate question.

Three components in the sample were clamped. For each, I measured what fraction of its own content the box was showing, at baseline and after the spacing.

| component | observations | baseline | with spacing |
|---|---|---|---|
| post card excerpt (`line-clamp: 3`) | 2,688 | 86.2% | 76.6% |
| home page excerpt (`line-clamp: 2`) | 24 | 49.4% | 40.8% |
| recommendation blurb (`line-clamp: 1`) | 42 | <strong>35.1%</strong> | 30.7% |

I stopped at the third row.

`.item-reason` is the one-sentence note attached to each related-post link. I write it by hand for every recommendation, separately in all four languages. It averages 108 characters. And it <strong>appears nowhere else on the site</strong>. That spot is the only place it exists.

A one-line clamp was showing 35% of it. That was true before I touched the spacing at all.

![The related posts list before the fix. All three recommendation blurbs are cut off mid-sentence at one line with an ellipsis](../../../assets/blog/text-spacing-1412-clamp-audit-2026/item-reason-before.png)

This finding has nothing to do with 1.4.12. Applying text spacing did not create it; it had been there all along. An instrument built to measure an accessibility criterion dragged a content bug out with it. That happens more than you would think. [Running a full sweep after a 26-page sample](/en/blog/en/wcag-em-2-sampling-vs-full-sweep-audit-2026) surfaced things the same way.

And here the clause I asked you to hold onto comes back. Truncation is acceptable <strong>when a mechanism exists to reveal the rest</strong>. Apply that test to the three components and they split cleanly.

The card excerpt links to the full article. Mechanism present. Dropping to 76.6% is a designed summary, not a loss. Same for the home page excerpt.

The recommendation blurb has no mechanism. No expand control, no other page carrying the same sentence. The missing 65% is unreachable. It was a loss before any user touched their spacing settings.

So instead of loosening the clamp, I removed it.

```css
.item-reason {
  margin: 0;
  font-size: 0.8125rem;
  color: var(--ink-2);
  line-height: 1.5;
  /* This sentence is written per recommendation and appears nowhere else on
     the site. A clamp here has no mechanism to reveal the rest, so there is
     no clamp: the text wraps in full. */
}
```

I also raised `line-height` from 1.4 to 1.5, and the decomposition explains why. <strong>If the author's line height already meets the criterion's floor, a user's line-height override cannot shrink the box.</strong> Leave it at 1.4 and the box grows under a reader who forces 1.5, dragging the layout with it. Set it at 1.5 and nothing happens on that axis at all. I think that rule generalizes to any clamped text.

The home page excerpt went from two lines to three. That one keeps its clamp, because it links to the article.

![The same list after the fix. All three blurbs now wrap to two lines and run to the end of the sentence](../../../assets/blog/text-spacing-1412-clamp-audit-2026/item-reason-after.png)

## I fixed it and the metric got worse

I rebuilt and re-ran all 48 page views. Then I read this:

```
before fix:  570 elements newly clipped
after fix:   574 elements newly clipped
```

Four more.

My first thought was a regression. It was not. It is a property of the metric. "Newly clipped" counts elements that <strong>fit at baseline and stopped fitting after the spacing</strong>. It only catches things crossing a threshold. Before the fix, `.item-reason` was already clipped at baseline. A box that is always clipped can never become newly clipped, so it sat outside this metric's field of view entirely.

Removing the clamp vacated those slots. Meanwhile the home page excerpt went from two lines to three, which gave it baseline headroom, which put four of its elements into the measurable band where they then overflowed.

Read the same data with a different metric and the direction reverses:

| | before | after |
|---|---|---|
| page views with new loss | 29 of 48 | <strong>18 of 48</strong> |
| home excerpt shown at baseline | 49.4% | <strong>74.2%</strong> |
| recommendation blurb shown at baseline | 35.1% | <strong>100%</strong> |

I am spelling this out because of what it implies for CI. When we gate accessibility in a pipeline, we usually pick one number: violation count. That number only registers threshold crossings. <strong>Anything failing permanently never appears in it.</strong> A box that is always clipped is clipped again today, and nothing changed, so nothing is reported. Drive that count to zero and you will systematically miss this entire class of failure.

That is the argument for carrying a ratio alongside the count. It is the same trap I hit [measuring whether a sticky header obscures focus](/en/blog/en/focus-not-obscured-sticky-header-scroll-padding-2026), where the answer depended on which direction you tabbed. What you count decides what you can see.

## What this measurement does not say

Narrowing the claims honestly.

One browser engine, one Mac, 24 URLs. Not the full 1,356-page build. Firefox and WebKit differ in subpixel handling of `letter-spacing` and in their `-webkit-line-clamp` implementations, so the numbers could move. I did not check.

I never measured overlap. My detection covers overflow inside clipping boxes and clamped line counts, nothing else. Text that rides up over a following element with no clipping ancestor slips straight past this script. That is one of the three failure types the Understanding document names, missing wholesale.

"Zero horizontal overflow" is a document-level statement. It means the page did not shift sideways. It does not certify every element on it.

And axe is not wrong. `avoid-inline-spacing` did exactly what its description says, and my site has none of the inline declarations it hunts for. The pass is correct. This is not a takedown of the checker. It is a record of measuring the distance between a rule's reach and a criterion's reach.

## Decide whether the sentence can be cut, first

What survives from this run as something you can use:

- <strong>Put one question in front of every clamp.</strong> Is there a route to the rest of the text? An excerpt linking to its article is a route. A sentence that lives only in that box has none, and must not be clamped.
- <strong>Author clamped text at `line-height: 1.5` or above.</strong> Meet the criterion's floor yourself and a user's override cannot change anything on that axis.
- <strong>The declaration to worry about is `letter-spacing`.</strong> 523 to 0. Line height and paragraph spacing only make pages taller. Spend your review time on the horizontal axis.
- <strong>Do not treat "CJK" as one bucket in a multilingual site.</strong> Word spacing is nearly inert for Japanese and Chinese and fully active for Korean. Word spaces are the dividing line, not the writing system.
- <strong>Keep a ratio next to your violation count.</strong> Counts only register threshold crossings. Permanent failures never show up in them.

The reproduction path is in the repo. Point `scripts/audit-text-spacing.mjs` at your own URL list and run `--mode` once per declaration, and you will know within about thirty seconds which of the four is cutting your text and where.

Taking a criterion a checker marked green and actually applying it is a large part of what I do for a living. If you are still at the stage of not knowing where to start, that is fine, and the [contact page](/en/contact/) is open for exactly those questions.

---

*Sources: W3C, [WCAG 2.2 Success Criterion 1.4.12 Text Spacing](https://www.w3.org/TR/WCAG22/#text-spacing) (W3C Recommendation), [Understanding SC 1.4.12](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html), and Deque's [avoid-inline-spacing rule documentation](https://dequeuniversity.com/rules/axe/4.10/avoid-inline-spacing) (all official). The four multipliers and the "no loss of content" requirement were confirmed against the W3C originals; this post paraphrases rather than quoting them verbatim, and links to the source instead. Measurement environment: a 24-URL sample from the jangwook.net production build (1,356 pages), viewports 1280×800 and 390×844, Playwright 1.57 with headless Chromium 143.0.7499.4, Node 22.22, axe-core 4.13.0, local static server, measured 2026-08-07. Script: `scripts/audit-text-spacing.mjs`. Every figure comes from this engine and this sample, and is not a claim about violation rates on other sites or behaviour in other rendering engines. Overlap-type failures were not measured.*
