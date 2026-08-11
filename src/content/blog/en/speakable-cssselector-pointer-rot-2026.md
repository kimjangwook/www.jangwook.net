---
title: "The markup said 'read this aloud' and pointed at 13 paragraphs"
description: "I ran my speakable cssSelector values against my own built HTML. One matched nothing across 1,332 pages; another grabbed 13 paragraphs per page instead of the lede."
pubDate: '2026-08-11'
heroImage: '../../../assets/blog/speakable-cssselector-pointer-rot-2026/hero.png'
tags:
  - Structured Data
  - SEO
  - JSON-LD
  - Web Development
  - CSS
faq:
  - question: 'Does Google still support speakable structured data?'
    answer: "It's still listed in the Search Gallery, yes. But the documentation opens with a beta notice and states the audience plainly: publishers who publish in English, and users in the U.S. with English-configured Google Home devices. Being on the supported list and being in the audience are two different things."
  - question: 'What happens when a cssSelector matches nothing?'
    answer: "The schema.org Schema Markup Validator flags it. My live page came back with errorType NO_MATCHES_FOUND and isSevere set to true, naming the exact selector. Over-matching is the opposite case: matching 13 nodes is perfectly valid per the spec, so no validator will say a word about it."
  - question: "Doesn't p:first-of-type select the document's first paragraph?"
    answer: "No. :first-of-type picks the first sibling of that type under each parent. Point a descendant combinator at an article containing several paragraph-holding containers and you match one paragraph per container. In my sample that came to a median of 13 per page, of which exactly one was the article's lede."
  - question: 'Can a build catch this automatically?'
    answer: 'Yes, and it should. Parse the built HTML, run every speakable selector against it, fail on zero matches, and fail when a paragraph selector exceeds a small ceiling. Schema-level validation never sees the second failure, so the assertion has to live in your own pipeline.'
relatedPosts:
  - slug: validate-structured-data-ci-jsonld-2026
    score: 0.86
    reason:
      ko: 그 글의 CI 검증은 JSON-LD 문법과 필수 속성을 봤다. 이번 건은 문법이 완벽한 채로 실패했으므로, 같은 파이프라인에 어떤 단언을 더 얹어야 하는지로 이어진다.
      ja: あの記事のCI検証はJSON-LDの構文と必須プロパティを見ていた。今回は構文が完璧なまま失敗した例なので、同じパイプラインに何を足すかという話につながる。
      en: That post's CI check validates JSON-LD syntax and required properties. This failure was syntactically flawless, which makes it a direct argument for what else that same pipeline needs to assert.
      zh: 那篇的 CI 校验看的是 JSON-LD 语法与必填属性。这次的问题恰恰发生在语法完全正确的前提下，正好接着谈同一条流水线还该加什么断言。
  - slug: text-fragment-citation-deep-link-audit-2026
    score: 0.81
    reason:
      ko: 텍스트 프래그먼트도 문서 속 한 지점을 문자열로 가리키는 주소였고, 코드 블록에서 15개 중 14개가 끊겼다. 포인터와 대상이 따로 진화할 때 무엇이 먼저 깨지는지에 대한 두 번째 자료다.
      ja: テキストフラグメントも文書内の一点を文字列で指すアドレスで、コードブロックでは15本中14本が外れた。ポインタと対象が別々に進化するとき何が先に壊れるかの二例目になる。
      en: Text fragments are the same species of address, a string aimed at one spot in a document. Fourteen of fifteen broke inside code blocks there, which makes this the second data point on pointers and targets drifting apart.
      zh: 文本片段是同一类地址：用字符串指向文档中的某一点。那次在代码块里 15 条断了 14 条，这是"指针与目标各自漂移"的第二组数据。
  - slug: json-ld-graph-entity-linking-2026
    score: 0.74
    reason:
      ko: 이 사이트의 JSON-LD를 하나의 @graph로 묶은 글이고, 이번에 문제가 된 WebPage 노드가 바로 그 그래프 안에 있다. 잘 조립된 그래프도 헛것을 가리키는 노드를 품을 수 있다.
      ja: このサイトのJSON-LDを一つの@graphにまとめた記事で、今回問題になったWebPageノードはそのグラフの中にある。よく組まれたグラフでも空を指すノードを抱えうる。
      en: That post is where this site's JSON-LD became a single @graph, and the WebPage node that failed here lives inside it. A well-assembled graph can still hold one node aimed at nothing.
      zh: 那篇把本站 JSON-LD 合并成一个 @graph，这次出问题的 WebPage 节点就在其中。图组得再好，也可能含着一个指向空处的节点。
  - slug: faqpage-deprecation-ai-citation-2026
    score: 0.7
    reason:
      ko: FAQ 리치 결과 종료 때는 "기능이 끝나도 어휘는 남는다"가 결론이었다. speakable은 그 거울상이다. 목록에는 남아 있는데 내가 대상 범위 밖이라 판단 기준을 바꿔야 했다.
      ja: FAQリッチリザルト終了のときは「機能が終わっても語彙は残る」が結論だった。speakableはその鏡像だ。一覧には残っているのに自分は対象外で、判断基準を変える必要があった。
      en: When the FAQ rich result shut down, the takeaway was that the vocabulary outlives the feature. speakable is the mirror case, still supported on paper, yet I fall outside its stated audience, so keep-or-delete needed a different test.
      zh: FAQ 富媒体结果下线时的结论是"功能没了，词汇还在"。speakable 正好相反：清单上还在，我却不在它声明的受众里，去留只能换个判断标准。
---

`article p:first-of-type` looks like it selects one paragraph. It selected thirteen.

That was the median across my sample. On the widest page it grabbed twenty-four. And this selector wasn't sitting in a stylesheet where a wrong match would be visible. It was inside structured data, telling any voice assistant that reads my pages which parts to speak.

## Two kinds of structured data, two ways to rot

Most structured data carries its own values. You write the title into `headline`, the date into `datePublished`, the name into `author`. Whatever you wrote is what ships, so mistakes surface: an empty title ships empty, a malformed date trips a format error.

`speakable` doesn't work that way. A `SpeakableSpecification` holds no text at all. It holds a `cssSelector` or an `xPath` — <strong>an address into the document</strong>. The value lives in the DOM; the markup only points at it. The idea is that an author, not a heuristic, decides which sentences a voice surface should read out.

Pointers have a different failure profile from values. When the target disappears, the markup stays perfectly healthy: valid JSON, correct type, all required properties present. Rename one CSS class and the instruction starts aiming at empty space, while your build stays green and every test passes. Nothing in a normal pipeline is watching that relationship. Among the structured data types Google documents, `speakable` is effectively the only one built this way.

And a pointer can rot in two directions. It can reach nothing, or it can reach far too much. My site had managed both at once.

## What Google actually promises about speakable

Before touching anything I reread the [speakable documentation](https://developers.google.com/search/docs/appearance/structured-data/speakable). It sets its terms in the first paragraph:

> This feature is in beta and subject to change. We're currently developing this feature and you may see changes in requirements or guidelines.

The audience is narrower than most people assume:

> The `speakable` property works for users in the U.S. that have Google Home devices set to English, and publishers that publish content in English.

A one-person technical blog shipping Korean, Japanese, English and Chinese editions is not in that sentence. The selector guidance is one line:

> Use either `cssSelector` or `xPath`; don't use both.

And the usual disclaimer, which I'd rather quote than paraphrase:

> Google does not guarantee that features that consume structured data will show up in search results.

Meanwhile Speakable is still on the supported list in the [Search Gallery](https://developers.google.com/search/docs/appearance/structured-data/search-gallery). Those are separate facts, and blurring them is how a site ends up carrying markup on the theory that it might pay off someday. Worth remembering that Google has been shrinking that list, not growing it: the [documentation update log](https://developers.google.com/search/updates) shows a deprecation notice added to the FAQ rich result on 2026-05-08 ("This feature will no longer appear in Google Search starting May 7, 2026.") and the docs removed on 2026-06-15, with practice problem docs deleted back on 2026-01-06. When the FAQ result died I argued for [keeping the Q&A markup anyway](/en/blog/en/faqpage-deprecation-ai-citation-2026), because that vocabulary carries its own text and other parsers can still read it. The argument collapses for pointers. An address with nothing at the end of it is nothing, to every reader.

## Running the selectors instead of reading them

Here's what my pages had been emitting:

```json
{
  "@type": "SpeakableSpecification",
  "cssSelector": [
    "article h1",
    "article h2",
    "article p:first-of-type",
    ".article-summary"
  ]
}
```

Title, headings, lede. Clear intent. Intent isn't the thing that ships, though, so I opened the built HTML with jsdom and executed all four. Node 22.22, jsdom 29.1.1, against the `dist` as of 2026-08-11. Of 1,336 blog pages, 1,332 carried a `SpeakableSpecification`; I parsed a sample of twenty, five from each language.

| Selector | Matches per page (median) | Total across 20 pages | Verdict |
|---|---:|---:|---|
| `article h1` | 1 | 24 | two h1s on 4 pages |
| `article h2` | 9 | 229 | every section heading |
| `article p:first-of-type` | 13 | 272 | over-matching |
| `.article-summary` | 0 | 0 | matches nothing |

The zero has a boring explanation: no component on this site uses that class. Whether it existed once or was only ever planned, I couldn't settle from the commit history. What's certain is that the selector rode along on 1,332 pages without ever pointing at anything.

There's a trap worth naming here. Grep `dist` for `article-summary` and it hits on all 1,332 pages, which reads like confirmation. Open one and the string appears exactly once — as the selector's own value inside the JSON-LD.

```
...akableSpecification","cssSelector":["article h1","article h2",
"article p:first-of-type",".article-summary"]},"url":"https://jangwo...
```

<strong>The pointer shows up in a text search because of its own name.</strong> String matching cannot detect this class of rot. Selectors have to be executed.

![Nodes reached per page by each speakable cssSelector, measured against the built HTML](../../../assets/blog/speakable-cssselector-pointer-rot-2026/hero.png)

## Where those 272 paragraphs actually lived

The thirteen interested me more than the zero, so I grouped every matched paragraph by its parent element.

![Parent elements of the 272 matched paragraphs; only 20 were the article's own lede](../../../assets/blog/speakable-cssselector-pointer-rot-2026/paragraph-owners.png)

| Parent element | Paragraphs matched | What it really is |
|---|---:|---|
| `li` | 73 | paragraphs inside list items |
| `div.item-content` | 60 | related-post recommendation cards |
| `blockquote` | 59 | pull quotes |
| `header.article-shell__header` | 20 | post header |
| `div.article-prose` | 20 | the actual lede |
| `div.text-center` | 20 | layout chrome |
| `div.flex-1` | 20 | layout chrome |

Twenty out of 272 were what I meant. The cause is the selector definition rather than anything exotic: `:first-of-type` means <strong>first sibling of that type under its own parent</strong>, not first occurrence in the document. Combine it with a descendant combinator that walks the whole subtree, and every container holding paragraphs contributes one.

The `div.item-content` row is the one that stung. Those sixty are the blurbs on related-post cards — machine-written navigation copy. Had a voice surface honored this annotation, it would have treated three recommendation blurbs as core spoken content on equal footing with the article's opening sentence. My own thesis was outvoted by my own sidebar.

I recognize the shape of this from [auditing text fragment deep links](/en/blog/en/text-fragment-citation-deep-link-audit-2026), where 14 of 15 code-block citations broke. Same species of bug. Pointers rarely break when you write them; they break when everything around them moves.

## What each tool can and cannot see

The schema.org Schema Markup Validator caught the null selector. Feeding it a live URL returned three objects and exactly one error: `NO_MATCHES_FOUND`, `isSevere: true`, naming `.article-summary`. That's more than syntax checking — the validator <strong>runs your selectors against the fetched document</strong>, which is a genuinely useful behavior that I suspect most people never exercise.

It said nothing about the thirteen, and it shouldn't have. Matching many nodes is legal; `speakable` accepts an array and multiple targets are a supported pattern. Nothing here is invalid. It's just wrong.

| Failure mode | Schema validator | Build | Text grep | What actually catches it |
|---|---|---|---|---|
| Selector matches 0 nodes | caught (severe) | no | no | deploy gate |
| Selector over-matches | no | no | no | a count ceiling you write |
| Used outside its stated audience | no | no | no | human judgment |

That third row has no tooling answer. Whether a multilingual personal blog should ship a feature documented for U.S. English Google Home users is a question no linter will settle for you.

## The fix, and the assertion that keeps it fixed

Two selectors instead of four, each scoped to hit exactly once:

```js
// src/components/BaseHead.astro
const speakableSchema = articleData ? {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  'speakable': {
    '@type': 'SpeakableSpecification',
    'cssSelector': ['.article-shell__header h1', '.article-prose > p:first-of-type']
  },
  'url': canonicalURL.toString()
} : null;
```

The load-bearing change is the child combinator. `.article-prose > p:first-of-type` only considers direct children of the prose container, so paragraphs nested in lists and blockquotes never enter the candidate set. Re-measured across the same twenty pages:

| Selector | Pages matched | Nodes per page |
|---|---:|---:|
| `.article-shell__header h1` | 20 / 20 | 1 |
| `.article-prose > p:first-of-type` | 20 / 20 | 1 |

Then a postbuild assertion, so this can't silently rot again. Open the output, run the selectors, fail on zero, fail when a paragraph selector blows past a ceiling.

```js
// scripts/validate-speakable.mjs (core)
for (const selector of selectors) {
  const count = dom.window.document.querySelectorAll(selector).length;
  if (count === 0) {
    failures.push(`${file}: "${selector}" matches nothing`);
  } else if (/\bp\b|paragraph/.test(selector) && count > MAX_PARAGRAPH_MATCHES) {
    failures.push(`${file}: "${selector}" matches ${count}`);
  }
}
```

Point it at the pre-fix `dist` and it fails exactly 40 times: twenty pages times two bad selectors.

```
❌ validate-speakable failed (40)
  - dist/en/blog/en/45-day-analytics-report-2025-11/index.html:
      "article p:first-of-type" matches 24 (limit 2)
  - dist/en/blog/en/45-day-analytics-report-2025-11/index.html:
      ".article-summary" matches nothing
  ...
```

When I built the [CI validation for JSON-LD](/en/blog/en/validate-structured-data-ci-jsonld-2026), I checked syntax and required properties. That check would have passed this markup every single day, because the syntax was immaculate. Pointer-valued properties need a separate question asked of them: <strong>how many nodes does this actually resolve to?</strong>

One honest boundary. I'm not claiming this improves my search presence. I'm not an English-language news publisher serving U.S. Google Home users, Google states outright that structured data guarantees nothing about appearing in results, and I have no evidence that LLM crawlers read `speakable` at all — so I won't write as though they do. What I fixed is the accuracy of a statement my site makes to machines. Two true lines beat 1,332 pages of a false one. The sample is twenty pages, not the full corpus, and I'd rather say so than round up.

## Before you ship markup that points instead of carries

- Search your structured data for `cssSelector` and `xPath` first. Properties holding addresses need their own care.
- Verify selectors by executing them, never by grepping. A selector string always matches itself.
- Any time you see `:first-of-type`, `:first-child`, or a descendant combinator, count the matches. Intent of one and a result in double digits means you want `>`.
- The schema validator flags zero matches as severe and waves over-matching straight through. The ceiling is yours to write.
- When renaming CSS classes, search the JSON-LD too. No linter knows your stylesheet and your structured data share a class name.
- Read the audience restrictions before adding a type at all. Beta notices and country or language limits usually sit in the first paragraph of the docs.

One thing I haven't resolved: whether keeping those two lines is the right call when I know I'm outside the documented audience. Deleting them removes something to maintain. Keeping them leaves one machine-readable statement that the heart of the page is its title and its opening paragraph. The gate now guarantees that statement is true, which tipped me toward keeping it. Ask me again in six months.

Wiring structured data into deploy gates is the kind of work I take on. Contact routes are on my profile.
