---
title: What Automated Accessibility Checks Miss After the Green Light
description: I seeded eight WCAG barriers into one checkout page and ran axe-core. It caught the four rule-based ones and missed the four needing human judgment. Here's the gap, plus a manual-review checklist.
pubDate: '2026-07-12'
heroImage: ../../../assets/blog/axe-automated-a11y-coverage-gap-2026/hero.png
tags:
  - a11y
  - wcag
  - accessibility
  - web-development
relatedPosts:
  - slug: axe-core-ci-a11y-jsdom-vs-browser-2026
    score: 0.83
    reason:
      ko: "이 글이 '자동화가 구조적으로 못 잡는 것'을 다뤘다면, 저 글은 그 자동화를 CI에 어떻게 2단으로 넣느냐를 실측한 짝이다. color-contrast가 jsdom에서 왜 빠지는지 궁금하면 저기로."
      ja: "本稿が『自動化が構造的に取りこぼすもの』なら、あちらはその自動化をCIに二段で組む実測。color-contrastがjsdomで抜ける理由はあちらへ。"
      en: "This post is about what automation structurally can't catch; that one measures how to wire that automation into CI in two stages. For why color-contrast drops out under jsdom, go there."
      zh: "本文讲自动化在结构上抓不到的东西；那篇实测如何把这套自动化分两段接进CI。想知道color-contrast为何在jsdom里掉队，去那篇。"
  - slug: accessible-name-agents-2026
    score: 0.8
    reason:
      ko: "여기서 'axe가 못 잡는 것' 중 하나가 접근성 이름의 품질이다. 접근성 이름이 왜, 어떻게 틀어지는지 한 케이스만 깊게 판 글이 저기다."
      ja: "本稿で『axeが取りこぼすもの』の一つがアクセシブルネームの質。それがなぜどう狂うかを一例だけ深掘りしたのがあちら。"
      en: "One of the things axe misses here is the quality of the accessible name. That post drills into a single case of how it goes wrong."
      zh: "本文里axe抓不到的其中一项就是无障碍名称的质量。那篇只挑一个案例，深挖它是怎么错的。"
  - slug: a11y-lighthouse-audit-fix-2026
    score: 0.72
    reason:
      ko: "자동 도구로 접근성 위반을 잡아 고치는 전체 흐름을 먼저 보고 싶다면 저 글이 출발점이다. 이 글은 그 흐름이 끝난 뒤 남는 사각지대를 다룬다."
      ja: "自動ツールでアクセシビリティ違反を捕まえて直す全体像を先に見たいなら、あちらが出発点。本稿はその後に残る死角を扱う。"
      en: "If you want the full flow of catching and fixing a11y violations with tooling first, that's the starting point. This post covers the blind spot that remains after."
      zh: "想先看用自动工具抓取并修复无障碍问题的完整流程，那篇是起点。本文讲的是那套流程跑完之后仍留下的盲区。"
  - slug: ai-crawlers-dont-render-javascript-csr-2026
    score: 0.66
    reason:
      ko: "크롤러는 텍스트를, 스크린 리더는 접근성 트리를 읽는다. 둘 다 서버가 내보낸 마크업이 전부라는 점에서, 접근성과 크롤러빌리티는 같은 뿌리를 공유한다."
      ja: "クローラーはテキストを、スクリーンリーダーはアクセシビリティツリーを読む。どちらもサーバーが出したマークアップが全て、という点で根は同じ。"
      en: "Crawlers read text, screen readers read the accessibility tree. Both live off the markup your server ships, so accessibility and crawlability share a root."
      zh: "爬虫读文本，屏幕阅读器读无障碍树。两者都只吃你服务器输出的标记，所以无障碍与可抓取性同根。"
---

I built a checkout page with eight barriers deliberately planted in it, then ran axe-core over it. Four came back red. Four sailed through. The four that passed are all real barriers that stop screen reader users cold. The tool never called them a problem.

That's the honest face of automated accessibility testing. This isn't a knock on the tool. axe-core is excellent, and I run it every day. The trouble starts the moment you read a green result as "accessible." I get the urge to close out accessibility with a single CI line. I've done it. But the layer that line checks and the layer users actually hit are not the same layer, and you have to see it to feel it. So here are the raw logs from eight planted barriers, checked one at a time.

## The basics: automated tools see rule violations, not experience

An accessibility checker does essentially one thing. It walks the DOM and finds nodes that trip a machine-decidable rule. Does this `<img>` have an `alt` attribute? Does this `<button>` have an accessible name? Does `<html>` carry a `lang`? These are true-or-false. No attribute, violation. Code decides, done.

But a large share of WCAG success criteria don't split cleanly into true or false. A machine can see **whether** an `alt` attribute exists; it can't see whether that alt actually conveys what the image means. It can see **whether** a link has text; it can't judge whether "click here" describes where the link goes. That's not a rule violation, it's a question of meaning. Only a person reading the screen and the context produces the answer.

So accessibility splits into two layers. The lower layer is rule-based violations a machine can scan. The upper layer is experience-based barriers a human has to judge. Automated tools sweep the lower layer fast and accurately. They can't touch the upper one. The catch is that both layers stop screen reader users just the same. To the user, "could a machine have caught it" is irrelevant.

To put a rough number on it: WCAG 2.2 spreads success criteria across several kinds, and only a slice of them can be decided fully automatically. The rest either get a "this looks suspicious, a human should confirm" flag, or they can't be touched at all. Which criterion falls on which side varies a little by tool, but "verify all of WCAG with automation alone" holds for no tool. That's not a performance limit of the tool. It's the nature of the criteria themselves.

You forget this if you only know it in the abstract. So I planted the barriers myself.

## The checkout page with eight planted barriers

In a throwaway sandbox outside the repo I wrote a single `page.html`. An ordinary checkout form. I dropped eight barriers into it on purpose. Four rule-based (a machine should catch them), four experience-based (only a human can).

```html
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Checkout</title></head>
<body>
  <h1>Checkout</h1>

  <!-- #1 rule-based: image with no alt -->
  <img src="/logo.png">

  <!-- #2 rule-based: input with no label -->
  <input type="email" name="email">

  <!-- #3 rule-based: empty button with no name -->
  <button></button>

  <!-- #4 experience-based: alt present but meaningless -->
  <img src="/chart-q3.png" alt="image">

  <!-- #5 experience-based: link that doesn't describe its destination -->
  <p>To read the refund policy, <a href="/refund">click here</a>.</p>

  <!-- #6 experience-based: meaning carried by color alone -->
  <p>Fields in <span style="color:red">red</span> are required.</p>

  <!-- #7 experience-based: label points at the wrong field -->
  <label for="zip">Card number</label>
  <input id="zip" name="postal" type="text">

  <!-- #8 rule-based: skipped heading level h1 -> h3 -->
  <h3>Shipping</h3>
</body>
</html>
```

You may have spotted that `<html>` is missing a `lang`. I didn't plant that one; I just left it off by accident. axe catches it later, and I kept it in as proof the tool earns its place.

I ran axe-core 4.12.1 headless on top of jsdom. I skipped a real browser on purpose, because this experiment is about "is it rule-decidable," not "does the environment change the result." If the environment part is what you're after (browser vs jsdom), I measured exactly that in [why color-contrast quietly disappears when you put axe-core in CI](/en/blog/en/axe-core-ci-a11y-jsdom-vs-browser-2026/).

```javascript
import { JSDOM } from 'jsdom';
import fs from 'fs';
import axeSource from 'axe-core';

const html = fs.readFileSync('page.html', 'utf8');
const dom = new JSDOM(html, { pretendToBeVisual: true });
const { window } = dom;
window.eval(axeSource.source);           // inject axe into the jsdom window
const results = await window.axe.run(window.document, {
  resultTypes: ['violations', 'incomplete'],
});
```

## What axe-core caught

Start with the violations. Strip the noise (the landmark/region family) and keep only what maps to a planted barrier, and you get this:

```text
[image-alt]     impact=critical  img[src$="logo.png"]  Images must have alternative text
[label]         impact=critical  input[type="email"]   Form elements must have labels
[button-name]   impact=critical  button                Buttons must have discernible text
[html-has-lang] impact=serious   html                  <html> element must have a lang attribute
[heading-order] impact=moderate  h3                     Heading levels should only increase by one
```

Clean. It nailed all four planted rule-based barriers (#1 no alt, #2 no label, #3 empty button, #8 skipped heading) and threw in the `lang` I'd dropped by accident. This is where automated tools genuinely earn their keep. They sweep the mechanical omissions a human reviewer misses, and they do it in seconds on every commit. Hand-checking this layer is, in my view, a waste of time. The tool is overwhelmingly better at it.

One honest addition: the real output wasn't just these five lines. A `region` violation (all content should sit inside a landmark) came attached to nearly every node, more than ten lines of them. That's less a real defect than a structural signal that the page has no landmark like `<main>`. When you first point a tool at a page, these low-severity items flood the report and bury the actual criticals. So I sort results by impact and pull the best-practice family off to the side. Treating everything the tool emits as a must-fix list just wears you down. Deciding what to look at first is also a human job.

Read this far and the page is in a "five violations, fix them and go green" state. Imagine you fix all five. Fill the alt, add the label, give the button text, add lang, tidy the headings. axe now declares a pass. And that page is still broken.

## The four axe-core couldn't catch

For the four planted experience-based barriers (#4 through #7), axe returned **not a single violation and not a single "needs review."** Total silence. One at a time.

**#4 · `alt="image"`.** axe only confirms the `alt` attribute exists. Whether the value is "image" or "asdf," anything non-empty passes. But reading "image" over a quarterly-results chart gives a screen reader user nothing. It's worse than no alt at all. An empty alt at least signals "decorative image"; "image" paints over real information with fake information. WCAG 1.1.1 asks for an equivalent text alternative, and whether it's equivalent is not something a machine can decide.

**#5 · "click here".** The link has text, so the `link-name` rule passes. But screen reader users often navigate by pulling up a list of links alone. When "click here," "click here," "click here" line up, there's no way to tell where any of them go. WCAG 2.4.4 wants a link's purpose to be clear from the link text (or its context). Reading the context is a human's job.

**#6 · carried by color alone.** "Fields in red are required" means nothing to a user who can't see the color. Colorblind users and screen reader users both lose the "required" information. WCAG 1.4.1 forbids exactly this. But axe can't judge whether that sentence depends on color alone. It can see the `color:red` style; whether that color is the only channel carrying the information is a matter of context.

**#7 · label points at the wrong field.** This one is the nastiest. `<label for="zip">Card number</label>` is properly wired to the input with `id="zip"`. The association itself is flawless, so the `label` rule passes. The problem is that the input's `name` is `postal`. The label reads out "Card number," but it's actually a postal-code field. A screen reader user hears the prompt to enter a card number and fills in the wrong box. A machine sees that the association **exists**; it can't see whether the association is **correct**.

See the thread running through all four? Every one is the "the attribute or element is in place, but its contents are wrong" type. Automated tools check structure, not meaning. And in practice a good share of the barriers that actually stop users live in that meaning layer. To me this is the biggest misconception around automated accessibility tools. Green means "no rule violations," not "accessible." The accessible name is the textbook case. You can attach an `aria-label` and pass axe, yet if that name diverges from the on-screen text, voice control and AI agents alike fail to press the button. I measured that layer separately in [when the accessible name is wrong, neither voice control nor AI agents can press the button](/en/blog/en/accessible-name-agents-2026/). Modals dig the same pit. A single `aria-modal="true"` turns the light green, yet [measuring whether focus actually escapes the modal](/en/blog/en/modal-focus-escape-inert-measure-2026/) shows it blocks nothing. Tables belong to the same family. After a div grid earns its green light with `role="table"`, [measuring the accessibility tree and text extraction side by side on the same table](/en/blog/en/table-markup-a11y-llm-extraction-2026/) splits what you saw on screen from what the machine took home.

Picture it concretely and it lands. Read this page top to bottom with a screen reader and you hear roughly: "Checkout, heading level 1. Image. Edit, email. Button. Image, image. To read the refund policy, link, click here. Fields in red are required. Card number, edit." Even after you fill the alt, add the label, and take axe green, the sentences the user hears are still "image, image," "link, click here," and a postal-code box announced as "Card number." That's how wide the gap between a tool's pass and a user's experience gets.

### Why teams misread the green

This misreading usually comes from process, not bad faith. When accessibility shows up at the end of a sprint as a one-line "axe passes" acceptance criterion, pass hardens into done. If the report reads zero violations, nobody looks past it. The reassurance a number gives is that strong. I've pasted a green screenshot onto a PR and moved on. It took me a while to admit I'd only looked at the rule-based layer.

Tool-vendor marketing plays a part too. "Automatically guarantee accessibility" sells well, but it isn't true. It's a claim the standards body explicitly denies (quoted below). Drawing the line between what automation can and can't do is itself a professional skill. Not using the tools is wrong; trusting the tools alone is also wrong.

![Table of the eight planted barriers versus axe-core detection. The five rule-based ones are marked CAUGHT, the four experience-based ones MISSED](../../../assets/blog/axe-automated-a11y-coverage-gap-2026/coverage-diagram.png)

## Why color-contrast dropped to "needs review"

Alongside the violations, there was an incomplete (needs review) list too. One of its entries was `color-contrast`.

```text
--- INCOMPLETE / needs review ---
[color-contrast]      h1    Elements must meet minimum color contrast ratio thresholds
[page-has-heading-one] html  Page should contain a level-one heading
```

Color contrast is normally one of the flagship things axe catches automatically. Here it dropped to "needs review" instead of a violation. The reason is plain: jsdom never actually renders the page. To compute contrast you need the real foreground and background colors of rendered pixels, and with no rendering there's nothing to compute. So axe punts it to "can't decide, a human should look."

This is a different animal from the experience-based misses above. Those four can never be caught, browser or not. Color contrast is caught automatically the moment you run in a real browser. The easy confusion is right here. Both look like "couldn't catch it," but one is fixed by changing the environment and one never is. Blur those two together and you slide into a different green misread: "I ran it in a browser, so surely everything's caught now." That's why the distinction matters when you build a CI pipeline. I wrote that design up separately in [why color-contrast quietly disappears in CI](/en/blog/en/axe-core-ci-a11y-jsdom-vs-browser-2026/), so I won't repeat it. Just the gist: treat "needs review" as a blank line and you punch a hole in your real coverage.

## What W3C says officially, and the "57%" reference figure

This isn't my personal opinion. W3C WAI nails it down in an official document. The guide on selecting accessibility evaluation tools states that evaluation tools "cannot determine accessibility, they can only assist in doing so." And it spells out that deciding whether a site is accessible "requires knowledgeable human evaluation." No tool can determine conformance on its own. That's the standards body's official position.

One number gets quoted a lot: a Deque study finding that automated tools catch roughly 57% of accessibility issues. It comes with a condition. That 57% is **by volume of issues**. High-frequency problems like missing alt and color contrast dominate audit counts, and those are exactly what automated tools are good at. So counting by issue volume inflates the figure. Change how you measure and it can drop toward 30%. It's a reference figure, not an official standard. Every time I cite that 57%, I think you have to say "57% of what" in the same breath. It's not 57% of WCAG success criteria; it's 57% of common issue counts. Measured as success-criterion coverage, the share that's fully auto-verifiable is far smaller.

One more honest limit. My experiment is a single page with eight barriers. It's a reproduction that shows a principle, not a benchmark. Generalizing "caught four, missed four, so automation is 50%" would be just as wrong. The ratio shifts endlessly depending on which barriers you plant. What this experiment speaks to isn't the ratio, it's the **kind**. The things it can't catch aren't missed by chance; they're missed by structure. Widening the scope from one page to a whole site doesn't change the shape of the problem either. [I once drew a 26-page sample by the WCAG-EM 2.0 procedure and checked it against a full sweep of all 1,342 pages in the same build](/en/blog/en/wcag-em-2-sampling-vs-full-sweep-audit-2026/), and the sample surfaced one of the four violation types.

## The manual-review checklist to run behind the automated green

So what do you do. Keep running the automated tool. Put it in CI, fire it on every commit. That's the cheapest way to guard the lower layer. Then, after the green, a human sweeps the upper layer. You can't run a full audit every time, so attach a checklist to review that's trimmed down to only the items automation structurally can't see.

- **Quality of image alt**: read whether the alt substitutes for the image's meaning, not whether it "exists." Informative images (charts, diagrams) carry the data; decorative ones take an empty alt. "image," "photo," and filenames all count as failures.
- **Link and button text out of context**: pull the link text alone into a list and read it. If "here," "click," or "read more" doesn't reveal the destination, fix it. You're imitating a screen reader's list-of-links navigation.
- **Information leaning on color or shape alone**: hunt for sentences that hand meaning through color or position only, like "the red fields," "the green badge," "the graph above." Double the color up with text or an icon label.
- **Actual label-to-field correspondence**: check not that the label is wired, but that what the label says matches what the field takes. Watch whether the autocomplete attribute and `name` line up with the label instead of drifting.
- **Reading order and heading meaning**: check that headings aren't used as visual size knobs and that tab order follows the logical flow. Here a machine sees the structure but not the intent.
- **The whole flow by keyboard alone**: put the mouse away and submit the form end to end with tab, enter, and arrows. Five minutes exposes most of the focus traps automated tools can't catch: focus you can't see, a modal you open while tab leaks to the page behind it, an order that fights the visual layout. Nearly all of it surfaces in those five minutes.

Drop these six lines into a PR template and, even when the automated check goes green, a human sweeps the upper layer at least once before it ships. It isn't perfect. But it stops the most expensive misconception there is: green equals accessible.

There's a temptation to automate the whole checklist too. There are tools now that ask an LLM "is this alt any good." The direction is interesting, but I don't trust it as a gate yet. An LLM will answer plausibly about whether "the red fields" depends on color alone, with no guarantee that judgment reflects the page's full context and design intent. Fine as an assistant, too early to replace the final human call. Try to cover the upper layer with yet more automation and you may just import fresh false positives and false negatives. The rule holds here too: use automation knowing precisely what it can't see.

Accessibility isn't a checkbox a tool decides for you. It's a question of how your code and content actually reach real users. If you want to check how far an existing site is really blocked behind an automated green, or to build a pipeline that verifies the rule-based and experience-based layers separately, I take on consulting and implementation work personally. Reach me through the contact link on my profile.

---

*Sources: [W3C WAI: Selecting Web Accessibility Evaluation Tools](https://www.w3.org/WAI/test-evaluate/tools/selecting/) (official). The ~57% automated-detection figure is from [Deque](https://www.deque.com/blog/automated-testing-study-identifies-57-percent-of-digital-accessibility-issues/), measured by issue volume; it's a reference point, not an official standard. Environment: axe-core 4.12.1 · jsdom · headless.*
