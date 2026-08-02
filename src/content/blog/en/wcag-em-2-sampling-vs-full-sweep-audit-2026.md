---
title: 'What a 26-page WCAG-EM sample missed across 1,342 built pages'
description: 'W3C published WCAG-EM 2.0 on 23 July 2026. I followed its sampling procedure to the letter, got 26 pages, then ran axe-core over all 1,342 pages of the same build. The sample caught one of four defect types.'
pubDate: '2026-08-02'
heroImage: '../../../assets/blog/wcag-em-2-sampling-vs-full-sweep-audit-2026/hero.png'
tags:
  - accessibility
  - WCAG
  - web development
  - auditing
  - a11y
faq:
  - question: 'If I follow WCAG-EM 2.0, can I claim my site conforms to WCAG 2.2 AA?'
    answer: 'No, and the document says so itself: "WCAG 2 conformance claims cannot be made for entire websites based upon the evaluation of a selected sub-set of web pages and functionality alone." A sample evaluation estimates the accessibility state of a product with reasonable confidence. It does not prove conformance across the product. If you want to publish something close to a claim, Step 5.3 lists the conditions, and the statement still has to say it rests on a sample.'
  - question: 'Why is the random sample 10% of the structured sample?'
    answer: 'Because the random set is not there to find more defects. It is there to test whether the structured set was representative. Step 4.3 says that if the random set shows content types or findings absent from the structured set, that is a signal the structured set was not representative, and you go back to Step 3. The catch is that the percentage is anchored to the structured sample rather than to product size, so the check gets relatively weaker as a site grows. On my site, 1,342 pages produced a random sample of two.'
  - question: 'If automated checks run over every page, do I still need human evaluation?'
    answer: 'Yes. This sweep ran on jsdom, which has no layout, so rules that need painted geometry (contrast ratio, target size) return no verdict at all. Automated rules only cover the machine-decidable slice of the success criteria. Whether alt text actually describes the image, whether focus order matches the visual meaning, whether an error message is understandable: those stay human. The point of a full automated sweep is to move human hours toward the things machines cannot judge.'
  - question: 'Does this only work for static sites?'
    answer: 'The difficulty of a full sweep comes down to how cheaply you can obtain pages. A static build drops every page on disk, which is the easy end. Sites with heavy authenticated or stateful views make full collection expensive, and that is exactly where the WCAG-EM sampling procedure earns its keep. The deciding question is whether a full sweep is feasible, and the document itself recommends evaluating the entire product and skipping sampling when it is.'
relatedPosts:
  - slug: axe-automated-a11y-coverage-gap-2026
    score: 0.82
    reason:
      ko: 그 글은 axe가 통과시킨 페이지에 무엇이 남는지를 쟀고, 이 글은 그 axe를 전수로 돌렸을 때 표본이 무엇을 놓치는지를 잰다. 자동 검사의 세로축과 가로축을 각각 확인한 기록이다.
      ja: あちらはaxeが通したページに何が残るかを測り、こちらは同じaxeを全ページに回したときサンプルが何を取りこぼすかを測る。自動チェックの縦軸と横軸をそれぞれ確かめた記録だ。
      en: That post measures what survives on a page axe calls clean; this one measures what a sample misses when the same axe runs across every page. Two axes of the same tool's blind spots.
      zh: 那篇测量的是axe判定通过的页面上还剩下什么，本文测量的是同一个axe跑遍全站时抽样会漏掉什么。一个纵向、一个横向，检查的是同一件工具的盲区。
  - slug: table-markup-a11y-llm-extraction-2026
    score: 0.71
    reason:
      ko: 마크업 네 종류가 전부 axe 위반 0건을 받았던 그 실험이 이 글의 전제다. 자동 검사가 침묵하는 지점을 알고 나면, 전수 검사에서 나온 위반 목록을 어디까지 믿을지 판단이 선다.
      ja: 4種類のマークアップがすべてaxeで違反0だったあの実験が、この記事の前提になっている。自動チェックが黙る場所を知っていれば、全数検査の違反リストをどこまで信じるか判断できる。
      en: The experiment where all four table markups scored zero axe violations is the premise here. Knowing where the scanner goes quiet tells you how far to trust a full-sweep violation list.
      zh: 四种表格标记全部拿到axe违规0件的那次实验，正是本文的前提。知道自动检查在哪里沉默，才能判断全量扫描给出的违规清单可信到什么程度。
  - slug: crawl-depth-flat-archive-audit-2026
    score: 0.64
    reason:
      ko: 같은 빌드 산출물을 대상으로 삼되 재는 대상이 다르다. 그때는 크롤러가 닿는 경로를 셌고, 이번에는 그 페이지들에 남은 접근성 위반을 센다. 전수 스크립트를 감사 도구로 쓰는 방식은 동일하다.
      ja: 同じビルド成果物を対象にしながら測るものが違う。あのときはクローラーが到達する経路を数え、今回はそのページに残るアクセシビリティ違反を数えている。全数スクリプトを監査道具として使う流儀は同じだ。
      en: Same build output, different question. That one counted the paths a crawler can walk; this one counts the accessibility defects sitting on those same pages. The habit of turning a full-sweep script into an audit tool is shared.
      zh: 对象同为构建产物，测量的东西不同。那篇数的是爬虫能走到的路径，这篇数的是那些页面上残留的无障碍缺陷。把全量脚本当审计工具用，这个习惯是一样的。
  - slug: wcag22-target-size-audit-2026
    score: 0.58
    reason:
      ko: 타깃 크기는 화면에 그려져야 판정되는 대표적인 기준이라, 이번 전수 검사가 판정을 포기한 영역이 바로 거기다. 자동화가 닿지 않는 구간을 어떻게 사람 손으로 메웠는지는 그 글에 있다.
      ja: ターゲットサイズは画面に描画されて初めて判定できる代表例で、今回の全数検査が判定を諦めた領域がまさにそこだ。自動化が届かない区間を人の手でどう埋めたかはあちらに書いてある。
      en: Target size only resolves once something is painted, which is exactly where this full sweep gave up. How I covered that gap by hand is in that post.
      zh: 目标尺寸必须等到实际绘制才能判定，而这正是本次全量扫描放弃判定的区域。自动化够不到的那一段我是怎么用人工补上的，写在那篇里。
---

WCAG-EM tells you how to pick an audit sample. It says nothing about what that sample will miss.

That gap is what I wanted a number for. W3C published [WCAG Evaluation Methodology (WCAG-EM) 2.0](https://www.w3.org/TR/WCAG-EM/) as a Group Note on 23 July 2026, twelve years after the previous version dated 10 July 2014. My own site is a static build, so every page lands on disk. I could follow the sampling procedure exactly, then run the same checks over the entire build and compare. The sample came to 26 pages. It caught one of the four defect types the full sweep found.

## Why sampling exists in the first place

Start from the floor. WCAG 2.2 is a set of success criteria, and conformance is defined per page. "This site is AA" means, strictly, that every page on the site meets AA. On a site with thousands of pages, making that sentence honest takes thousands of evaluations. Real audits do not work that way.

WCAG-EM exists to bridge that. Instead of looking at everything, you choose a representative sample, check it against the five WCAG 2 conformance requirements, and report. Five steps: define the evaluation scope, explore the target digital product, select a representative sample set, evaluate the selected sample set, report the evaluation findings. Each step carries numbered "Methodology Requirements" so a report can be traced back to what was actually done.

What matters more than the procedure is that the document states its own ceiling. Sampling alone does not license a conformance claim, and the [source](https://www.w3.org/TR/WCAG-EM/) puts it plainly:

> WCAG 2 conformance claims cannot be made for entire websites based upon the evaluation of a selected sub-set of web pages and functionality alone

The same passage concedes that most real evaluations only look at a sample, and therefore that using the methodology alone usually does not get you to a conformance claim. If you have ever received an audit report, that sentence is worth remembering. "Evaluated per WCAG-EM" is a record of procedure, not proof of conformance.

## What actually changed in 2.0

The headline change is reach. Version 1 targeted websites and web pages; version 2 also covers apps and other digital products, per the [WAI overview page](https://www.w3.org/WAI/test-evaluate/conformance/wcag-em/). Throughout the document, "web page" has become "sample" and "view", which is what lets it handle kiosks and native apps where the number of screens is small.

For a web developer, the more consequential change is the shape of Step 3. It now splits into a structured sample set (3.1), a randomly selected sample set (3.2), and complete processes (3.3), with Step 4.3 requiring you to compare the first two. The size of the random set is fixed:

> The number of samples to randomly select is 10% of the structured sample set selected through the previous steps.

That random set isn't a second pass at finding defects. It's a test of whether the structured set was representative, and Step 4.3 spells out the check:

> Check that each sample in the randomly selected sample set does not show types of content and outcomes that are not represented in the structured sample set.

If the random set does surface new content types or new findings, that counts as evidence the structured set was not representative, and you go back to Step 3. I think this comparison is the most useful thing in the revision. It's also where my question lives: how sensitive is that tripwire, really?

One more line, easy to skip, sitting right at the top of Step 3:

> If feasible, it is recommended to evaluate the entire digital product. The sampling procedure may then be skipped.

Nobody quotes those two sentences, because sampling is what an audit is assumed to look like. What "feasible" means for a static site turns out to be a number, and I'll get to it.

## Building the 26-page sample by the book

Step 1 is scope. I scoped to the entire production build output of jangwook.net, target conformance WCAG 2.2 Level AA, with an accessibility support baseline of current desktop browsers plus a screen reader. One decision hides here: do files that nothing links to belong in scope? I chose to include every HTML document that answers on a URL under the domain. That choice produces a result later that I did not expect.

Steps 2 and 3.1 gave me a structured sample of 24 pages. Here is the selection with its stated basis:

| Basis (WCAG-EM step) | Sample | Count |
|---|---|---|
| 2.1 common views (entry points) | `/`, `/ko/`, `/ja/`, `/en/`, `/zh/` | 5 |
| 2.1 common views (listings) | `/blog/` per language | 4 |
| 2.2 essential functionality (contact/profile) | `/about/` per language | 4 |
| 2.3 sample types (error view) | `/404.html` | 1 |
| 2.3 sample types (standalone landing) | `/deepdiner/`, `/ja/social/` | 2 |
| 2.4 technologies relied upon (article template) | one article per language | 4 |
| 2.5 other relevant samples (mid-corpus) | one article per language | 4 |

Step 3.2 then gave me 10% of 24, so two more pages drawn at random from outside the structured set, with a fixed seed for reproducibility. One Japanese article and one English article came up. Total: 26 pages, or 1.9% of the site.

Something is already visible here. The size of the random set is driven by the size of the structured set, and the size of the structured set is driven by how many *view types* exist. My site has roughly the same view types whether it holds 300 articles or 1,300. Grow the corpus tenfold and the random sample stays at two pages. That property is what the probability math later cashes out.

## Running all 1,342 pages of the same build

The full sweep used axe-core 4.12.1 on jsdom 30.0.1, restricted to the `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, and `wcag22aa` rule tags, over all 1,342 HTML files in the build I had just produced.

The first attempt died. A single process walking the corpus blew the heap somewhere past 450 pages:

```
FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory
node scan.js ... exit 134
```

Calling `window.close()` wasn't enough to reclaim jsdom instances fast enough, and the warning had already shown up as per-page time drifting from 303ms to 533ms. Splitting the work into 12 shards running four at a time made it go away: 800 seconds of CPU, five minutes of wall clock, zero failed pages. That's the empirical value of "if feasible" from the quote above. On a static site, evaluating the entire product costs five minutes.

Here's what came back:

| axe rule | Impact | Pages | Nodes | Cause |
|---|---|---|---|---|
| `label` | critical | 75 | 907 | GFM task lists producing unlabeled checkboxes |
| `list` | serious | 1 | 1 | a `<strong>` sitting as a direct child of `<ol>` |
| `document-title` | serious | 1 | 1 | an ad-network ownership verification stub |
| `html-has-lang` | serious | 1 | 1 | the same stub |

77 of 1,342 pages carried at least one violation, or 5.7%. The three causes could not be more different in character.

The 907 `label` findings all come from Markdown task list syntax. `- [ ] item` renders as `<li class="task-list-item"><input type="checkbox" disabled> item</li>`. The checkbox has no accessible name, so a screen reader announces "unchecked, checkbox" and stops there, saying nothing about which item it belongs to. One cause, in the Markdown rendering pipeline. Effects scattered across 75 pages.

The single `list` finding came from an article nearly five years old. Tracing it landed on this line:

```markdown
4. <strong>Query Patterns**:
```

An HTML opening tag closed with Markdown syntax. This repo migrated bold formatting from `**text**` to `<strong>text</strong>` at some point, and exactly one line survived the migration half-converted. The unclosed `<strong>` swallowed what followed and floated up as a direct child of `<ol>`, breaking the list structure. One article out of 1,300.

`document-title` and `html-has-lang` are the embarrassing pair. The culprit was a 30-byte file sitting in `public/`:

```
$ cat public/ezoic-BCuedJHJQiUWKNs9gWL0mfiNSGnQFy.html
BCuedJHJQiUWKNs9gWL0mfiNSGnQFy
```

An ad-network ownership stub dropped there in December 2025 and forgotten. No `<html>`, no `<title>`, no `lang`. Nothing links to it, it isn't in the sitemap, and it answers 200 if you request it. It landed in the audit because Step 1 scoped to "every HTML document under the domain." I could not construct a cleaner demonstration that scope definition manufactures results.

## What the sample missed, and why it had to

Now the comparison. The 24-page structured set caught `label` only, because 4 of its 24 pages happened to contain task lists. The two random pages returned nothing. So Step 4.3 passed with "no new findings," and by the letter of the methodology I could conclude the structured set was representative and write the report. At that moment the site still held three defect types the sample never saw.

![Probability that a random sample of k pages contains a defect. A defect on 75 pages reaches 95% at k=52; a defect on a single page is still at 22% after drawing 300](../../../assets/blog/wcag-em-2-sampling-vs-full-sweep-audit-2026/detection-probability.png)

Whether the miss was luck or structure is a question the hypergeometric distribution answers directly. For a defect present on m of n pages, the probability that a random draw of k contains at least one:

```js
// m: pages carrying the defect, k: sample size, n: total pages
function pDetect(m, k, n) {
  let p = 1;
  for (let i = 0; i < k; i++) p *= (n - m - i) / (n - i);
  return 1 - p;
}
```

Feed in the real numbers:

| Pages carrying the defect | k=2 | k=50 | k=100 | k for 95% |
|---|---|---|---|---|
| 75 (task lists) | 10.9% | 94.7% | 99.7% | 52 |
| 1 (broken `<strong>`, stray stub) | 0.15% | 3.7% | 7.5% | 1,275 |

Catching a one-page defect with 95% confidence means drawing 1,275 of 1,342 pages. That isn't a sample, it's a sweep with extra steps. A defect spread over 75 pages, meanwhile, needs only 52. Same word, "violation", and a completely different detection curve.

I also measured the Step 4.3 tripwire itself. Drawing a two-page random set 20,000 times with varying seeds, counting how often it surfaced a finding absent from the structured set: 58 times, or 0.29%. On this site, Step 4.3 returns "nothing new" in 997 runs out of 1,000. Passing the representativeness check is not evidence of representativeness.

To be clear, this is not a flaw in the methodology. WCAG-EM assumes humans doing the evaluation by hand, and human hours are finite. Weigh 24 pages of manual inspection against 1,342 and the sampling procedure is obviously sensible. What you owe yourself is a number for what that sample guarantees and what it doesn't.

## Template defects and content defects behave differently

Here's the judgement I came away with. Accessibility defects split by where they originate, and sampling only sees one of the two kinds.

Template defects are born in one component or layout and copied onto every page: landmark structure in the header, link names on cards, label association in forms. Pull any page and you'll see them. One sample is enough, which is why audit reports tend to group these under "site-wide." My 907 `label` findings are exactly this shape. One cause in the rendering pipeline, and a 24-page sample picked it up without breaking a sweat.

Content defects behave nothing like that. They're born in one article's Markdown, one image's alt text, one table's header cells. The per-page probability is low, but absolute counts accumulate with content volume. And crucially, each one lives on a single page, which the table above says a sample will not find. I ran into the same property when I [walked the build output to measure crawl depth](/en/blog/en/crawl-depth-flat-archive-audit-2026/): site-wide metrics usually collapse because of a small number of exceptions.

That leads somewhere practical. Budgeting an audit by "how many sample pages will we review" is half a design. The better question is what you hand to a machine at full coverage, and where you then spend human time. Running machine-decidable rules over every page of a static build costs five minutes, as measured. Re-reviewing that same territory by hand, one sample at a time, is waste. Point people at [the range where the automated checker goes quiet](/en/blog/en/axe-automated-a11y-coverage-gap-2026/) instead.

## Fixing it, then measuring again

Measuring and stopping there is half the job. Two of the three causes got handled.

The broken `<strong>` was a one-character fix.

Task list checkboxes got blocked at render time rather than by rewriting Markdown. A small rehype plugin in the pipeline pulls the surrounding `li` text and attaches it as the checkbox's accessible name:

```js
function rehypeTaskListLabels() {
  const textOf = (node) => {
    if (node.type === "text") return node.value;
    if (!node.children) return "";
    return node.children.map(textOf).join("");
  };

  return (tree) => {
    visit(tree, "element", (node) => {
      if (node.tagName !== "li") return;
      const box = node.children?.find(
        (child) =>
          child.type === "element" &&
          child.tagName === "input" &&
          child.properties?.type === "checkbox"
      );
      if (!box || box.properties.ariaLabel) return;
      const label = textOf(node).replace(/\s+/g, " ").trim();
      if (!label) return;
      box.properties.ariaLabel = label.slice(0, 120);
    });
  };
}
```

The rendered output changes like this:

```html
<!-- before -->
<li class="task-list-item"><input type="checkbox" disabled> Check GA4 Acquisition report</li>
<!-- after -->
<li class="task-list-item"><input type="checkbox" disabled aria-label="Check GA4 Acquisition report"> Check GA4 Acquisition report</li>
```

Then I tripped again. Plugin added, build run, output unchanged. Astro 5's content layer caches rendered HTML, and it invalidates on Markdown file changes, not on config changes. The single article I had edited picked up fresh HTML; the other 1,300 came straight out of cache. Deleting `.astro` and `node_modules/.astro` and rebuilding applied it everywhere. Touch the render pipeline, clear the cache. A cheap lesson to learn.

I re-ran the same sweep against the rebuilt 1,342 pages. Pages with a violation dropped from 77 to 1, and violating nodes from 910 to 2. The one remaining page is the stub below.

| | Pages with a violation | Violating nodes | Rule types |
|---|---|---|---|
| Before | 77 | 910 | 4 |
| After | 1 | 2 | 2 |

I left the stub file alone. What the ad network verifies is the file's exact content, and adding `<html lang>` or `<title>` risks breaking that. Instead I wrote an explicit exclusion for it into the Step 1 scope definition. Excluded from scope and forgotten about are very different states, and the real return on this audit sits closer to that distinction than to the violation list.

## What this measurement does not say

The honest limits.

The sweep ran on jsdom, which has no layout engine. Rules that need painted geometry, contrast ratio and target size among them, return no verdict at all. That's why measuring [target size](/en/blog/en/wcag22-target-size-audit-2026/) meant standing up a real browser. The four defect types here are a list of violations decidable from markup alone, not a list of accessibility violations.

Beyond that, axe only reaches the machine-decidable slice of the success criteria. Whether alt text describes what the image actually shows, whether focus order matches visual meaning, whether an error message can be understood: none of that reduces to a rule. Four defect types is not a statement that this site is accessible.

And one more line from WCAG-EM itself, near the top of the [document](https://www.w3.org/TR/WCAG-EM/):

> This document does not replace the need for quality assurance throughout all phases of product development.

The methodology does not stand in for QA during development. What I did here reads more like QA than like an audit, and fixing one place in the render pipeline to erase 907 findings moved the site further than manually inspecting 26 pages would have.

## Four questions to ask before you pick a sample

The action items, in order:

1. **Check whether a full sweep is feasible before you sample.** A static build puts every page on disk, so machine-decidable rules across the whole corpus cost minutes of CPU. WCAG-EM recommends exactly this first, and only falls back to sampling when it isn't practical.
2. **Compute your sample's detection probability, then decide how much to trust it.** Three lines of `pDetect(m, k, n)` will do it, and the conclusion arrives fast: a defect living on one page effectively requires a full sweep.
3. **Count defects by origin, template versus content.** Template defects vanish site-wide when you fix one cause. Content defects scale with content volume, so block them in the pipeline rather than hunting them by hand.
4. **Decide explicitly what to do with unlinked files in your scope definition.** In or out, either is fine. Never having decided is the problem. Mine turned out to be a forgotten 30-byte file that scored worse than any real page on the site.

Redesigning an accessibility audit around what a machine sweeps at full coverage and where human hours actually go — that's a good chunk of what I work on now. If you want to plan that split for a site of similar size, my contact details are on the [profile page](/en/about/).

---

*Sources: W3C, [WCAG Evaluation Methodology (WCAG-EM) 2.0](https://www.w3.org/TR/WCAG-EM/) (W3C Group Note, 23 July 2026), and the [WCAG-EM Overview](https://www.w3.org/WAI/test-evaluate/conformance/wcag-em/) (both official). Measurement environment: my own Astro build output, 1,342 HTML pages, axe-core 4.12.1 with jsdom 30.0.1 on Node 22.22, rules limited to the wcag2a/wcag2aa/wcag21a/wcag21aa/wcag22aa tags, 12 shards at 4-way concurrency, 800 seconds of total CPU. Probabilities come from hypergeometric calculation and a seeded Monte Carlo of 20,000 draws. Every number here is from this site and this build, and none of it is a statement about how the WCAG-EM methodology performs in general.*
