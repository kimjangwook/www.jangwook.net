---
title: "axe-core vs W3C's ACT Answer Key: 37.5% of Failures Caught"
description: "W3C's ACT suite labels 1,213 HTML examples. axe-core caught only 145 of 387 failing ones under the matching criterion, and 22 of 36 criteria scored zero."
pubDate: '2026-08-06'
heroImage: '../../../assets/blog/act-rules-axe-coverage-wcag-sc-2026/hero.png'
tags:
  - accessibility
  - WCAG
  - CI
  - testing
  - web development
faq:
  - question: 'If automation only decides 37.5%, does everything else need a manual pass?'
    answer: 'Not everything. Some of the 230 silent cases were silent because the relevant rule ships disabled, and turning on the experimental and AAA rules moved the count to 166. What remains are criteria that need a human to read meaning: whether link text explains where it goes, whether an error message says what went wrong. The useful output is not the percentage, it is the list. Write down which criteria automation decides and which it does not, and your manual time goes only to the second list.'
  - question: 'Is it safe to enable axe experimental rules?'
    answer: 'Enabling them is fine, but I would not wire them straight into the failure condition. Deque marks a rule experimental because false positives are still possible, so I collect their output as an advisory count for a few days first and promote it once I have seen the noise. A rule like target-size is a different case. It maps to a WCAG 2.2 AA criterion and ships disabled, so it belongs in the blocking set from day one.'
  - question: 'Can I point this measurement at my own site?'
    answer: 'This is a checker audit, not a site audit. The subject is the W3C example set, not your pages, and the output is not "how many violations do I have" but "which criteria can my checker decide at all." Run it once and the list stays valid until you change tools or versions. The script is in my repo and takes about a minute after the first fetch.'
  - question: 'Would Lighthouse or another tool score differently?'
    answer: 'Yes. Every number here belongs to axe-core 4.13.0. Lighthouse runs axe underneath but ships a different rule selection, so swapping tools means regenerating the coverage list. The same script accepts a different checker, though I have not run that comparison yet.'
relatedPosts:
  - slug: wcag-em-2-sampling-vs-full-sweep-audit-2026
    score: 0.78
    reason:
      ko: 그 글은 페이지를 몇 장 보느냐를 셌고, 이 글은 규칙이 몇 개를 결정하느냐를 센다. 전수로 훑어도 검사기가 판정하지 못하는 기준은 그대로 남는다.
      ja: あちらは「何ページ見るか」を数えた。この記事は「ルールが何を決められるか」を数える。全ページ走査しても判定できない基準は残る。
      en: That audit counted how many pages you look at. This one counts how many criteria the checker can actually decide. Sweep every page and the undecidable criteria are still sitting there, untouched.
      zh: 那篇数的是「看几页」，这篇数的是「规则能判几条」。就算全量扫描，判不了的标准照样留在原地。
  - slug: axe-core-ci-a11y-jsdom-vs-browser-2026
    score: 0.74
    reason:
      ko: jsdom에서 색상 대비가 조용히 빠지는 걸 확인했던 글이다. 이번에는 브라우저를 띄워 그 변수를 없앤 뒤에도 남는 공백을 성공기준 단위로 셌다.
      ja: jsdomでコントラスト比が黙って抜ける件を確かめた記事。今回はブラウザを立てて変数を消した上で、なお残る空白を達成基準ごとに数えた。
      en: That post found color contrast quietly dropping out under jsdom. This one removes the environment variable by running a real browser, then counts what is still missing, criterion by criterion.
      zh: 那篇发现对比度在 jsdom 里会悄悄消失。这篇干脆开真浏览器把这个变量去掉，再按成功标准数还剩多少空白。
  - slug: wcag22-target-size-audit-2026
    score: 0.71
    reason:
      ko: 그때 타깃 크기를 직접 재면서 axe에 관련 규칙이 있다는 건 알고 있었다. 이번 측정에서 그 규칙이 기본 비활성이라는 걸 알았다.
      ja: あの時ターゲットサイズを測りながら、axeに該当ルールがあることは知っていた。今回の測定で、そのルールが既定で無効だと分かった。
      en: While measuring target sizes back then I knew axe had a rule for it. This measurement showed the rule ships disabled, even though it maps to a criterion that is AA in WCAG 2.2.
      zh: 当时手测目标尺寸时，我知道 axe 有对应规则。这次测量才发现那条规则默认是关的——明明对应 WCAG 2.2 AA。
  - slug: focus-not-obscured-sticky-header-scroll-padding-2026
    score: 0.66
    reason:
      ko: 포커스 가림은 axe에 규칙 자체가 없어서 스크립트를 직접 짜야 했던 사례다. 규칙이 없는 기준과 규칙이 꺼진 기준은 대응이 다르다.
      ja: フォーカスの隠れはaxeにルール自体が無く、スクリプトを自分で書くしかなかった事例だ。ルールが無い基準と切れている基準では打ち手が違う。
      en: Focus occlusion has no axe rule at all, which is why I had to write that script by hand, and why 2.4.11 never shows up in this article's table. A missing rule and a disabled rule call for different responses.
      zh: 焦点被遮挡在 axe 里压根没有规则，只能自己写脚本。这也是本文表格里看不到 2.4.11 的原因。
---

W3C hands out an answer key for accessibility testing and almost nobody feeds it to their own CI.

Here's what's in it. For every rule in the ACT suite, the working group publishes small HTML files labeled by hand: this one passes, this one fails, this one is out of scope. 1,213 files across 87 rules. Point a checker at them and you stop guessing about coverage, because for once you know the right answer before you look.

So I pointed axe-core at all of them. Of the 387 failing examples my harness could evaluate, 145 came back with a violation tagged for the criterion the rule is about. That's 37.5%. The other 60% produced nothing at all for that criterion, and the CI log that reported it looked exactly like a clean run.

## A green build hides two different sentences

An automated checker is a bag of rules. Each rule finds its own targets in the document and marks each one pass, fail, or undecided. In axe-core the output splits four ways: `violations`, `passes`, `incomplete` (a human needs to look), and `inapplicable` (nothing here to test).

Wire it into CI and you almost certainly read one of those four. If `violations.length === 0`, the build goes green. That design carries a quiet assumption with it: <strong>a problem no rule covers is never counted</strong>. Whether link text describes its destination, whether an error message says what actually went wrong, whether a heading describes the section under it. Either the rule declines to decide or no rule exists, and neither outcome lands in `violations`.

So a zero collapses two sentences into one character. "I looked and it's fine" and "I never looked" print identically. Anyone who has commissioned an external audit knows the gap: months of green builds, then a report with three dozen findings.

Measuring that gap needs ground truth, and your own site doesn't have any. To know how many violations a page really contains, a human has to inspect all of it — and if you could do that, you wouldn't need the checker.

## The suite, and how to actually get it

Tools disagreeing with each other is an old problem in this field. Run one page through two products and the violation counts differ, with no yardstick to say which is right. W3C's Accessibility Conformance Testing work exists to fix that. It standardizes how a rule is written and ships <strong>passing, failing, and inapplicable examples</strong> alongside each one, so tools can be compared on identical inputs.

[ACT Rules Format 1.1](https://www.w3.org/TR/act-rules-format-1.1/) reached W3C Recommendation on 5 February 2026. The rules and their examples live on the [ACT Rules page](https://www.w3.org/WAI/standards-guidelines/act/rules/), and there's a machine-readable index: one `testcases.json` with everything in it.

```json
{
  "ruleId": "674b10",
  "ruleName": "Role attribute has valid value",
  "ruleAccessibilityRequirements": {
    "wcag-technique:ARIA4": { "failed": "not satisfied" },
    "wcag20:4.1.2": { "secondary": "This success criterion is less strict than this rule..." }
  },
  "expected": "passed",
  "relativePath": "testcases/674b10/c181f7267bf9f4fc0f9ad9e2a69c1ad7da504f4d.html"
}
```

1,213 cases from 87 rules: 472 labeled passing, 393 failing, 348 inapplicable. Of the 87 rules, 63 name at least one WCAG success criterion as a primary requirement; the other 24 point only at WCAG techniques. Counting distinct criteria that appear as primary requirements gives 37.

One practical trap cost me forty minutes. Node's `fetch` against w3.org returns HTTP 429, reliably, while `curl` to the identical URL returns 200. Whatever the filter keys on, a script can't get through it. The same files sit in the [w3c/wcag-act-rules repository](https://github.com/w3c/wcag-act-rules), so I pulled from there and checked one file's SHA-256 against the w3.org copy. Identical.

453 of the cases reference images, videos, and sub-pages by absolute path under `/WAI/content-assets/wcag-act-rules/test-assets/`, so I served everything from a local HTTP server with the same path prefix. 96 assets came along; six sample videos over 2MB (the largest is 35.5MB) I skipped, since no rule decides anything by looking at video pixels.

## "Did any violation fire" turned out to be useless

My first pass counted the naive way: a failing example is caught if axe reports any violation at all. 386 of 387. 99.7%. That felt good for about a minute.

Then I ran the same count over the passing examples. 458 of 461, or 99.3%. The cause is obvious in hindsight. An ACT test case is the smallest document that demonstrates one rule. No `<main>`, no `<h1>`. Page-structure rules fire on nearly every file in the suite.

Across the 799 non-failing examples, here's what axe reported:

| axe rule | fired on | share | tag |
|---|---|---|---|
| `landmark-one-main` | 784 | 98% | best-practice |
| `page-has-heading-one` | 754 | 94% | best-practice |
| `region` | 572 | 72% | best-practice |
| `document-title` | 192 | 24% | wcag2a |
| `html-has-lang` | 74 | 9% | wcag2a |

The top three are all `best-practice`, meaning Deque's recommended habits rather than WCAG conformance items. Build a gate without filtering by tag and those three bury your signal. The bottom two carry WCAG tags but are artifacts here, a consequence of testing fragments rather than pages.

So I changed the criterion. <strong>A failing example counts as caught only when axe's result carries the WCAG tag for the criterion its ACT rule points at.</strong> If rule `674b10` names 4.1.2, axe has to report something tagged `wcag412`. And I split the outcomes three ways: reported as a violation, handed to a human via `incomplete`, or nothing.

That third bucket is the whole point. Handing work to a human and saying nothing are completely different events for a pipeline, and the default reporter treats them the same.

## 37.5% is not a number you can act on

axe-core 4.13.0, headless Chromium 143, the full suite. Under a minute.

```
failing examples evaluated: 387 (unevaluable 6, page errors 27)
  criterion-matched violation : 145 (37.5%)
  needs-review only           :  12 ( 3.1%)
  silent                      : 230 (59.4%)
```

37.5% lines up roughly with the folklore figure of "automation catches about a third." And it decides nothing. It won't tell you what to fix tomorrow or where to spend a manual reviewer's afternoon.

Break it out by criterion and the picture changes completely.

![Horizontal stacked bars showing, per WCAG success criterion, how axe-core ruled on the ACT failing examples: violation, needs review, or silent. 4.1.2 scores 48 of 52 while 2.5.3, 1.4.6, 2.4.9 and 2.4.6 score zero](../../../assets/blog/act-rules-axe-coverage-wcag-sc-2026/sc-coverage.png)

| Success criterion | Failing examples | Violation | Needs review | Silent |
|---|---|---|---|---|
| 4.1.2 Name, Role, Value | 52 | 48 | 2 | 2 |
| 1.1.1 Non-text Content | 26 | 18 | 0 | 8 |
| 2.4.4 Link Purpose (In Context) | 25 | 11 | 0 | 14 |
| 1.3.1 Info and Relationships | 21 | 18 | 2 | 1 |
| 2.5.3 Label in Name | 16 | 0 | 0 | 16 |
| 1.4.12 Text Spacing | 14 | 13 | 0 | 1 |
| 1.4.6 Contrast (Enhanced) | 13 | 0 | 0 | 13 |
| 2.4.9 Link Purpose (Link Only) | 11 | 0 | 0 | 11 |
| 1.3.5 Identify Input Purpose | 10 | 10 | 0 | 0 |
| 2.4.6 Headings and Labels | 10 | 0 | 0 | 10 |

4.1.2 comes in at 48 of 52. Name, role, and value are decidable from the DOM and the accessibility tree, which is exactly where a checker is strong, and 1.3.5 and 1.4.12 behave the same way. Then look at the other end. Label in Name: 0 of 16. Headings and Labels: 0 of 10. Link Purpose (Link Only): 0 of 11.

In total, <strong>22 of the 36 criteria that appear scored zero violations</strong>, and 54 of the 87 ACT rules produced neither a violation nor a review flag on any of their failing examples.

Don't misread those zeros as defects. Deciding whether link text describes its destination means reading for meaning, and a checker that guesses will bury its users in false positives until they stop reading the output entirely. W3C draws the same line in its [evaluation tools overview](https://www.w3.org/WAI/test-evaluate/tools/): "However, tools can't do it all. Some accessibility checks just cannot be automated and require manual intervention."

One more thing belongs on that list. Beyond the criteria that need a human to read for meaning, some need the viewport to actually move before anything can be decided. Reflow, 1.4.10, is one of those. A fixed-viewport DOM sweep like this one was never going to surface it, and when [I measured it at three different heights in one run, the verdict split on the vertical axis, not the horizontal one](/en/blog/en/reflow-1410-400-zoom-viewport-height-2026/). When you write down the silent list, it helps to separate "a person has to read this" from "this has to be measured again under different conditions."

Here's my read. The problem isn't that the tool goes quiet. It's that <strong>the silence is recorded nowhere in the pipeline</strong>. The list of criteria your automation will never decide is fixed the moment you choose your tool, and I have almost never seen a team that has written that list down.

## Some of the silence is configuration, not capability

2.5.3 bothered me. axe ships a rule called `label-content-name-mismatch`, tagged `wcag253`. A rule exists, and yet all 16 examples came back silent.

The rule metadata explains it. It carries the `experimental` tag, and the [axe-core API documentation](https://github.com/dequelabs/axe-core/blob/develop/doc/API.md) is explicit:

> The default operation for axe.run is to run all rules except for rules with the "experimental" tag.

The tag table in the same document reads: "`experimental` | Cutting-edge rules, disabled by default".

Counting the shipped rules in 4.13.0: 105 total, 75 carrying a WCAG tag, 30 marked best-practice. Nine ship with `enabled: false` and seven carry `experimental`. <strong>Sixteen rules sit outside a bare `axe.run()`.</strong>

| Rule | Tags | What it costs you |
|---|---|---|
| `color-contrast-enhanced` | wcag2aaa, wcag146 | All 13 silent cases under 1.4.6 |
| `identical-links-same-purpose` | wcag2aaa, wcag249 | The zero under 2.4.9 |
| `label-content-name-mismatch` | wcag21a, wcag253, experimental | The zero under 2.5.3 |
| `meta-refresh-no-exceptions` | wcag2aaa, wcag224, wcag325 | The zeros under 2.2.4 and 3.2.5 |
| `target-size` | <strong>wcag22aa</strong>, wcag258 | A WCAG 2.2 AA criterion, off by default |

That last row is the one that stopped me. `target-size` isn't AAA and isn't experimental. It maps to 2.5.8, which WCAG 2.2 added at AA, and I've [measured and fixed that criterion by hand on this site](/en/blog/en/wcag22-target-size-audit-2026). Run axe with no configuration and the rule never executes. Every pipeline claiming to check WCAG 2.2 AA in CI is skipping one criterion whole.

So I turned everything on and ran it again.

```
failing examples evaluated: 383 (unevaluable 10, page errors 38)
  criterion-matched violation : 166 (43.3%)
  needs-review only           :  21 ( 5.5%)
  silent                      : 196 (51.2%)
```

37.5% to 43.3%. Criteria scoring zero dropped from 22 to 18. The ones that came back: 2.5.3 (0 to 14), 1.4.6 (0 to 9), and 2.2.4 and 3.2.5 (0 to 2 each). 2.4.9 still reports no violations, but six `incomplete` results appear, so at minimum the pipeline now says a human should look.

Distinct rules that actually fired: 45 by default, 52 with everything on. Seven rules brought back four success criteria.

## How I wire the gate now

Three changes came out of this, in order.

<strong>Scope the run by tag.</strong> Mixing `best-practice` in means rules like `landmark-one-main` swamp the signal. They aren't bad rules; a conformance gate and a coding-habits report just need different failure conditions.

<strong>Explicitly enable the disabled rules you need.</strong> `target-size` above all. Add `color-contrast-enhanced` and `identical-links-same-purpose` if your target includes AAA.

<strong>Print `incomplete`.</strong> Not as a failure condition. Just get the number into the log so "build passed, 12 items need a human" is something you can actually see.

```js
const AXE_OPTIONS = {
  runOnly: {
    type: 'tag',
    values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'],
  },
  rules: {
    // WCAG 2.2 AA, and it ships disabled. Without this line, nobody checks 2.5.8.
    'target-size': { enabled: true },
    // Experimental: collect as advisory first, promote once the noise is known.
    'label-content-name-mismatch': { enabled: true },
  },
  resultTypes: ['violations', 'incomplete'],
};

const result = await new AxePuppeteer(page).options(AXE_OPTIONS).analyze();

const blocking = result.violations.filter((v) => !v.tags.includes('experimental'));
const advisory = result.violations.filter((v) => v.tags.includes('experimental'));

console.log(`violations ${blocking.length} / advisory ${advisory.length} / needs review ${result.incomplete.length}`);
for (const item of result.incomplete) {
  console.log(`  review: ${item.id} (${item.nodes.length} nodes) — ${item.help}`);
}

if (blocking.length > 0) process.exit(1);
```

That covers the decidable half. The other half has to become a list, and this measurement writes it for you: every criterion that scored zero is a manual review item. 2.4.6 headings and labels, 2.4.9 link text, 3.3.1 error identification, 1.3.3 sensory characteristics, 2.1.2 keyboard traps, 1.4.5 and 1.4.9 images of text, and the 1.2.x media alternatives. You don't rebuild this per page. Pin the tool and version and the list is stable.

My order of operations is simple: let the full-sweep automation clear everything it can decide, then spend human attention only on the list above. It pairs with the [sampling question I worked through recently](/en/blog/en/wcag-em-2-sampling-vs-full-sweep-audit-2026). That one asked how many pages you look at. This one asks what you're able to see. An audit plan needs both answers.

## What these numbers do not say

The conditions, plainly.

ACT test cases are minimal documents built to isolate one rule, not real pages. Real pages give a checker more context to work with in some cases and more elements to lose track of in others. Read this as something closer to <strong>an upper bound on rule coverage</strong> than as a detection rate for production sites.

Some cases won't load. Examples with `meta refresh` or orientation locks navigate the browser away mid-run; 27 to 38 cases per run land there, which shifts the evaluated total by a handful each time. Percentages moved less than a point across runs.

W3C publishes per-tool ACT implementation reports separately, and this is not one of them. Those measure rule-by-rule implementation consistency. This measures what a default, CI-shaped run decides, aggregated by success criterion. Different questions, so don't put the numbers side by side.

Everything here is axe-core 4.13.0. Another checker has another list. And the obvious one, worth stating anyway: <strong>passing every automated rule is not WCAG conformance.</strong> Conformance is a human judgment. The criterion where that gap shows up most clearly is 1.4.12 Text Spacing. I once [widened letter spacing to the required values and watched 570 elements clip](/en/blog/en/text-spacing-1412-clamp-audit-2026/), and every one of those pages passed AA in the checker.

## Two lists worth generating today

- Pin your checker version and pull the <strong>list of rules that ship disabled</strong>. For axe that's 16, counting `enabled: false` and `experimental` together.
- Explicitly enable the ones inside your compliance target. If you claim WCAG 2.2 AA, `target-size` isn't optional.
- Narrow the gate's `runOnly` by tag so `best-practice` doesn't drown the conformance signal.
- Log the `incomplete` count. A green build and "12 items pending review" should not look the same.
- Turn every zero-violation criterion into your <strong>manual review list</strong>. Without it, manual testing is improvised every time.
- Regenerate both lists on every tool or version bump. One rule flipping on or off moves an entire success criterion.

The script is in the repo as `scripts/act-coverage-audit.mjs`. No arguments gives you the default rule set; `--all-rules` gives the same table with everything enabled. The first run spends a moment fetching the suite, after which it's about a minute.

Have you ever written down which success criteria your accessibility gate actually decides? If not, that list is the place to start. Come find me through my [profile](/en/about/).

---

*Sources: W3C's [ACT Rules Format 1.1](https://www.w3.org/TR/act-rules-format-1.1/) (W3C Recommendation, 5 February 2026), [ACT Rules](https://www.w3.org/WAI/standards-guidelines/act/rules/), and [Web Accessibility Evaluation Tools List](https://www.w3.org/WAI/test-evaluate/tools/); Deque's [axe-core API documentation](https://github.com/dequelabs/axe-core/blob/develop/doc/API.md). All official. Measurement setup: 1,213 W3C ACT Task Force test cases retrieved 6 August 2026 across 87 rules, axe-core 4.13.0, Playwright 1.57 with headless Chromium 143.0.7499.4, Node 22.22, viewport 1280×800, served from a local HTTP server. Test case files were pulled from the w3c/wcag-act-rules repository and checked against the w3.org original by SHA-256. Every number here belongs to this tool, this version, and this test suite, and none of it is a claim about detection rates on production websites or about the performance of other checkers.*
