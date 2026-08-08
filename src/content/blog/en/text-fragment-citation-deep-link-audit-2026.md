---
title: 'Quote-level deep links break only inside code blocks'
description: 'I built 69 text-fragment links from my own production build and clicked each one in Chromium. All 48 prose quotes landed; 14 of 15 code-block quotes did not.'
pubDate: '2026-08-08'
heroImage: '../../../assets/blog/text-fragment-citation-deep-link-audit-2026/hero.png'
tags:
  - GEO
  - SEO
  - semantic-html
  - web-standards
  - web-development
faq:
  - question: 'Do text fragments affect search rankings?'
    answer: 'There is no basis for saying so. A text fragment is a navigation mechanism that lets a URL point at a position inside a page, and it has never been announced as a ranking signal. What this post measures is whether a link to a quoted sentence actually lands. Reading that as a traffic or ranking effect would be a stretch.'
  - question: 'How do I make my code blocks citable?'
    answer: 'Making the code block itself the citation target is not realistic. Whitespace is not collapsed inside pre, so any quote produced by a tool that normalizes whitespace differs from the source character by character. Write the claim the code makes as one prose sentence beside it instead. That sentence sits in a single block, so it can be a link target.'
  - question: 'Do text fragments work for languages without spaces between words?'
    answer: 'Yes, as long as the quote starts on a segmentation boundary. In Chromium 151 I measured, quotes beginning at a boundary matched in Japanese, Chinese, and Korean, while quotes starting in the middle of a segment failed in all three. If you generate the links yourself, an adjacent prefix- removes that constraint.'
  - question: 'Is this what GPTBot or Google actually does?'
    answer: 'No. Which crawlers or engines emit links in this form is not published, and I did not observe it. I measured whether such a link, if produced, resolves on my site.'
relatedPosts:
  - slug: ai-crawlers-dont-render-javascript-csr-2026
    score: 0.71
    reason:
      ko: 그 글은 크롤러가 콘텐츠를 아예 못 보는 경우였다. 이 글은 본 문장을 다시 가리키지 못하는 경우를 잰다.
      ja: あちらはクローラーがコンテンツ自体を見られない話。こちらは見えた一文へ戻れない話だ。
      en: That post covers content a crawler never sees at all. This one measures sentences a crawler did see but cannot point back to. Being visible and being addressable are separate conditions.
      zh: 那篇讲的是爬虫根本看不到内容，这篇量的是爬虫看到了却指不回去的句子。
  - slug: table-markup-a11y-llm-extraction-2026
    score: 0.69
    reason:
      ko: 표가 텍스트로 접힐 때 행이 사라지는 걸 봤다면, 같은 변환이 인용 링크를 깨뜨리는 방식도 볼 만하다.
      ja: 表をテキストに落とすと行が消える話を読んだなら、同じ変換が引用リンクをどう壊すかも見ておくといい。
      en: If you saw rows vanish when a table gets flattened to text, the same flattening is what breaks these citation links. Both posts count what markup loses on the way to plain text.
      zh: 如果你见过表格被压成纯文本时整行消失，同一种压缩如何弄断引用链接也值得一看。
  - slug: faqpage-deprecation-ai-citation-2026
    score: 0.64
    reason:
      ko: 인용되기 위해 무엇을 마크업할지 다뤘던 글이다. 이 글은 인용된 뒤 되돌아올 주소가 있는지를 다룬다.
      ja: 引用されるために何をマークアップするかを扱った記事。今回は引用されたあとに戻る住所があるのかを扱う。
      en: That one asked what to mark up in order to get cited. This one asks the question that follows. Once you are cited, is there an address that leads back to the sentence?
      zh: 那篇想的是为了被引用该标注什么，这篇处理的是被引用之后能否回到那句话。
  - slug: crawl-depth-flat-archive-audit-2026
    score: 0.55
    reason:
      ko: 페이지까지 몇 번 눌러야 닿는지를 셌던 글이다. 여기서는 페이지 안에서 그 문장까지 닿는 문제를 센다.
      ja: ページに届くまで何クリック要るかを数えた記事。ここではその一文に届くかを数える。
      en: That audit counted how many clicks it takes to reach a page. This one counts what it takes to reach a sentence inside it. Same idea, one resolution finer.
      zh: 那篇数的是点几下能到一个页面，这篇数的是进了页面之后能不能到达那句话。
---

A pull request has been sitting open on the HTML Standard since November 9, 2025, proposing to move the Scroll To Text Fragment specification into HTML itself. It's still a draft. Chromium already ships the feature, WebKit announced its implementation in the Safari 18.2 release notes, and Gecko's position is under discussion. That's the state of the thing that decides whether a citation of your writing can point at the sentence it quoted, or only at the page that contains it.

I had never checked what that means for my own site. So I pulled 69 sentences out of my production build, turned each into a real link, and clicked every one of them in Chromium. Fifty-five landed. The fourteen that didn't were all in one place.

## What a sentence-level address rests on

Start with the foundation. The `#section-id` anchors we've used for decades only work where an author put an `id`. A paragraph without one has no address. Text fragments invert that assumption: they make <strong>the body text itself the address</strong>, with no cooperation from the author.

```text
https://example.com/page#:~:text=prefix-,start,end,-suffix
```

Only `start` is required. Add `end` and the target becomes the range from one string to the other. `prefix-` and `-suffix` are context terms that narrow down which occurrence you meant. The `#:~:` separator marks a fragment directive, so it never reaches the server and never shows up in `location.hash`.

Be honest about the standing of this spec. [URL Fragment Text Directives](https://wicg.github.io/scroll-to-text-fragment/) says of itself that it is a Draft Community Group Report, not a W3C Standard and not on the W3C Standards Track. That's a weaker footing than most of what I write about. It's also a document actively moving, via [pull request #11895](https://github.com/whatwg/html/pull/11895), toward being part of HTML.

So this is not a future feature. It ships, it works, and it changes what an address can be. Any tool that quotes your sentence can hand its reader a link straight back to it. Whether that link arrives is a different question.

## Twenty-four pages, checked in a real browser

I went at the measurement in two stages, and wrote both into a script that lives in the repo.

The static stage takes each page's leaf blocks, the ones containing no other block (`p`, `li`, `h1`–`h6`, `td`, `pre` and friends), splits their text into sentences, and asks three things of each sentence. How many times does it occur in the page? Do its start and end land on word boundaries, judged by `Intl.Segmenter` in that page's locale? And does it sit entirely inside one block?

The browser stage takes a subset of those sentences, builds real URLs against the built site on a local server, clicks through to them, and reads `window.scrollY`. Clicking matters: the spec restricts text directives to navigations that result from a user action, so a scripted address-bar jump is the wrong probe. Every target sits below a 4,000-pixel spacer, so any scroll at all means the directive resolved.

The sample is six pages each in Korean, Japanese, English, and Chinese, taken at even intervals from sorted paths so the run reproduces.

| Language | Pages | Leaf blocks | Sentences over the length floor | Repeated within the page | Not word-aligned |
| --- | --- | --- | --- | --- | --- |
| ko | 6 | 1,163 | 495 | 14 | 0 |
| ja | 6 | 1,196 | 617 | 14 | 0 |
| en | 6 | 1,163 | 378 | 7 | 0 |
| zh | 6 | 1,205 | 476 | 5 | 0 |

Zero word-boundary misses in all four languages felt anticlimactic until I thought about why. Cut on sentence boundaries and your start and end sit against punctuation, so alignment comes free. The boundary problem shows up when something quotes <strong>a fragment of a sentence rather than a sentence</strong>. If your citing tool likes to trim mid-clause, its quotes are hard to turn into links. If it quotes whole sentences, this axis costs you nothing.

Then the browser run: 69 directives, 55 arrived.

| Quote target | Count | Arrived |
| --- | --- | --- |
| Prose sentence appearing once on the page | 48 | 48 |
| Prose sentence appearing two or more times | 6 | 6 |
| Text inside a code block (`pre`) | 15 | 1 |

## The failures are all code

Every one of the fourteen misses came from a code block. Not a single prose sentence failed. That lopsidedness is the useful finding here.

The cause is whitespace, which I isolated with a controlled fixture. In ordinary flow content, whitespace collapses before matching. A source reading `two  spaces here` with two spaces matched `text=two spaces here` with one, and a line break inside the markup made no difference. Inside `pre`, nothing collapses. Against a source line of `label     value`, the directive `text=label value` failed while `text=label     value` with the spacing preserved matched. Newlines behave the same way, so a quote crossing two lines of a code block fails as a bare directive and matches when split into `start,end`.

![Thirty-five controlled text directives in Chromium 151, grouped by rule. Green matched, red did not](../../../assets/blog/text-fragment-citation-deep-link-audit-2026/probe-matrix.png)

The trouble is that anything producing a quote normalizes whitespace on the way. My actual failures were run logs with column alignment, multi-line JSON config, and a diagram drawn in box-drawing characters. The single code block that did arrive was one line long with single spaces throughout. The rule falls out of that: <strong>code that spans lines or aligns columns cannot be a citation target.</strong>

So I stopped trying to make code blocks citable and took a different conclusion instead. <strong>The unit of citation is prose.</strong> Whatever the code proves, a sentence next to the code should say it. That sentence lands in one block, gets its edges from punctuation, and lives where whitespace collapses. Three conditions satisfied for free. When I measured [what a table loses on its way to plain text](/en/blog/en/table-markup-a11y-llm-extraction-2026) the shape of the answer was the same: information that can't survive the flattening path needs a copy outside that path.

## Cross a block and the quote stops being a link

Why does prose survive? Because the constraint the spec is most explicit about is the block boundary. From the [matching notes](https://wicg.github.io/scroll-to-text-fragment/):

> While the matching text and its prefix/suffix can span across block-boundaries, the individual parameters to these steps cannot.

One `start` straddling two blocks fails. My fixture agreed.

| Shape of the quote | Markup | Result |
| --- | --- | --- |
| One sentence within a paragraph | `<p>` | matched |
| Heading plus the first sentence under it | `<h2>` + `<p>` | failed |
| Two list items run together | `<li>` + `<li>` | failed |
| Either of the above split into `start,end` | same | matched |
| `<strong>` or `<code>` inside the sentence | inline elements | matched |

Inline elements cost nothing, which is a relief. Emphasis and inline code inside a sentence don't interfere. Heading-plus-body quotes, though, fail, and that shape is everywhere. Summarizers love pulling "Heading: first sentence" as one unit, and that's precisely the string that can't be linked.

## Word boundaries are about segmentation, not language

The second constraint is the word boundary. With no `prefix`, the spec requires the match to start on one, and it supplies the example: "range" matches in "mountain range" but not in "color orange". Mine behaved exactly that way.

For a site in four languages, the interesting question is what happens where words aren't separated by spaces. The spec defers word boundaries to [UAX #29](https://www.unicode.org/reports/tr29/), says a more sophisticated locale-aware algorithm should be used, and warns specifically about dictionary-based bounding in locales with no word-separating character, naming Japanese. That's as far as the prose goes; the rest is implementation. So I measured it.

| Start of the quote | Example | Result |
| --- | --- | --- |
| Korean eojeol boundary | `구조화 데이터를 서버에서` | matched |
| Mid-eojeol in Korean | `화 데이터를 서버에서` | failed |
| Japanese segment boundary | `データを`, `構造化データをサーバー` | matched |
| Mid-segment in Japanese | `造化データを`, `ーバー側で出力` | failed |
| Chinese segment boundary | `结构化数据` | matched |
| Mid-segment in Chinese | `构化数据在服务` | failed |

Read that as the opposite of "CJK doesn't work". Start on a boundary and all four languages behave. Failure tracks <strong>where the quote was cut</strong>, not which language it's in. Chromium kept runs of Han and kana together rather than treating every character as a break, which is consistent with dictionary-based segmentation. I won't assert anything about the internals beyond what the behavior showed.

The spec provides the escape hatch too. An adjacent `prefix-` drops the start-boundary requirement: `text=구조-,화 데이터를 서버에서` matched, and so did `text=结-,构化数据在服务`. Adjacency is strict. With body text reading "Second: the same sentence", `text=Second-,the same sentence twice` failed and `text=Second:-,the same sentence twice` matched.

## A repeated sentence sends the link to the first copy

All six repeated sentences arrived, and that isn't good news. A bare directive with no `prefix` resolves to the <strong>first</strong> occurrence. In the fixture, a page carrying the same sentence twice always scrolled to the earlier one. The link works and may still point somewhere the citing tool didn't mean.

Checking what those repeated sentences actually were was mildly humbling. They're my own related-post blurbs.

```text
3x  en  Covers similar topics in automation with comparable difficulty.
2x  ko  자동화, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.
2x  ja  自動化、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
```

I have a rule that every recommendation reason must be written fresh for that pairing, and some years-old posts didn't follow it. A sentence occurring three times on a page is useless as an address. That's a new reason to care about boilerplate, separate from the usual quality argument: in a world where strings are addresses, <strong>a repeated sentence is an ambiguous address</strong>.

## Where my evidence stops

I judged matching by `window.scrollY`, not by reading the highlight, which means a target already in the viewport is indistinguishable from a failure. Hence the 4,000-pixel spacer above everything.

One engine, Chromium 151.0.7922.34, on one machine. WebKit and Gecko are unmeasured, and their behavior around segmentation may differ. There's also no guarantee that the `Intl.Segmenter` I used for prediction is the same segmenter Chromium consults internally. What I can say is that the two never disagreed in this run.

And the limit that matters most. <strong>I don't know whether GPTBot, Google, or anyone else actually emits links in this form.</strong> It isn't published and I didn't observe it. [Whether AI crawlers run JavaScript](/en/blog/en/ai-crawlers-dont-render-javascript-csr-2026) was something I could settle by sending requests myself; how a citation link gets generated is not observable that way. The question answered here is whether such a link resolves on my site, not whether such a link gets made. No ranking claim is attached to any of it.

## Wrap-up: keep the citable unit inside one block

Five things to do on the authoring side.

- <strong>One claim per sentence, one sentence per block.</strong> Split a claim across a heading and the paragraph beneath it and the claim can be quoted but not addressed.
- <strong>Say in prose, next to the code, whatever the code demonstrates.</strong> Whitespace doesn't collapse inside `pre`, which makes it a blind spot for citation links.
- <strong>Don't repeat a sentence within a page.</strong> Related-post blurbs and canned notices are the usual offenders. Bare directives go to the first hit.
- <strong>Leave `force-load-at-top` off on content pages.</strong> Per the spec, that document policy suppresses fragment scrolling outright.
- <strong>Use `prefix-` and `start,end` when you generate links yourself.</strong> They're the sanctioned way around the first two constraints.

The audit script is in the repo as `scripts/audit-text-fragments.mjs`. Run it after `npm run build` for the per-language totals plus the browser verification; sample size and probe count are both flags.

Designing documents so machines can quote them and readers can get back to the quoted line is work I take on. The contact route in my profile is open if you want to talk it through.

---

*Sources: WICG's [URL Fragment Text Directives](https://wicg.github.io/scroll-to-text-fragment/) (Draft Community Group Report, not a W3C Standard), WHATWG HTML [pull request #11895](https://github.com/whatwg/html/pull/11895) (opened November 9, 2025, still draft), Unicode [UAX #29](https://www.unicode.org/reports/tr29/), all official. The block-boundary rule is quoted verbatim from the spec; the remaining requirements are summarized and left to the links. Measurement environment: jangwook.net production build (1,362 HTML files), sample of 24 pages (6 per language), Playwright 1.57 with headless Chromium 151.0.7922.34, Node 22.22, viewport 1280×800, local static server, measured August 8, 2026. Controlled fixture: 35 separate directives. Script: `scripts/audit-text-fragments.mjs`. Every number here comes from this engine and this sample, and says nothing about matching behavior in other engines or about link generation by any particular AI crawler.*
