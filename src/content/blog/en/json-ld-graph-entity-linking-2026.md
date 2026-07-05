---
title: 'Tie Your JSON-LD Into One @graph — Turn Scattered Structured Data Into an Entity Model Search and AI Can Read'
description: 'I ran my own JSON-LD through a validator and it came back as three separate islands. Here is how @id node references stitch Organization, WebSite, and Article into one @graph, measured with jsonld — three components collapsing into one, plus what Google does not guarantee.'
pubDate: '2026-07-05'
heroImage: '../../../assets/blog/json-ld-graph-entity-linking-2026/hero.png'
tags:
  - Structured Data
  - JSON-LD
  - SEO
  - GEO
  - Web Development
relatedPosts:
  - slug: localbusiness-structured-data-server-side-vs-js-2026
    score: 0.72
    reason:
      ko: 그 글이 "크롤러가 마크업을 보긴 하는가(SSR vs JS)"였다면, 이 글은 "본 마크업이 서로 이어져 있는가"다. 같은 구조화 데이터를 렌더링과 연결성이라는 다른 축에서 짚는다.
      ja: あちらが「クローラーがマークアップを見るか(SSR vs JS)」なら、この記事は「見たマークアップが互いに繋がっているか」だ。同じ構造化データをレンダリングと連結性という別の軸で扱う。
      en: If that post asked "does the crawler even see the markup (SSR vs JS)," this one asks "is the markup it saw connected to itself." Same structured data, a different axis — rendering versus linkage.
      zh: 如果那篇问的是「爬虫到底看不看得到标记(SSR vs JS)」，这篇问的是「它看到的标记彼此连没连起来」。同一批结构化数据，换成渲染与连通两条不同的轴。
  - slug: hreflang-reciprocity-audit-multilingual-2026
    score: 0.6
    reason:
      ko: 그 글은 hreflang을 30줄 스크립트로 직접 감사해 어긋난 링크를 잡아냈다. 이 글이 jsonld로 연결 컴포넌트를 세는 것과 같은 "문서 말고 직접 검증" 태도를 다국어 SEO에서 보여준다.
      ja: あちらはhreflangを30行スクリプトで自ら監査し、ずれたリンクを捕まえた。本記事がjsonldで連結コンポーネントを数えるのと同じ「ドキュメントではなく自分で検証」の姿勢を、多言語SEOで示す。
      en: That post audited hreflang with a 30-line script and caught the mismatched link. It shows the same "verify it yourself, not the docs" stance this article takes with jsonld's component count, applied to multilingual SEO.
      zh: 那篇用 30 行脚本亲自审计 hreflang，抓出了不对称的链接。它把本文用 jsonld 数连通分量的"不信文档、自己验证"态度，用在了多语言 SEO 上。
  - slug: ai-crawler-control-robots-txt-llms-txt-2026
    score: 0.55
    reason:
      ko: robots.txt가 "누구에게 읽게 할 것인가"라면, @graph 연결은 "읽게 허용한 크롤러에게 무엇을 어떻게 이해시킬 것인가"다. 두 글이 AI 크롤러 대응의 앞뒤를 이룬다.
      ja: robots.txtが「誰に読ませるか」なら、@graph連結は「読ませると許可したクローラーに何をどう理解させるか」だ。二つの記事がAIクローラー対応の前後を成す。
      en: If robots.txt is "who gets to read it," @graph linkage is "what the allowed crawler understands and how." The two form the before-and-after of handling AI crawlers.
      zh: 如果 robots.txt 是「让谁来读」，@graph 连接就是「让获准的爬虫理解什么、怎么理解」。两篇构成应对 AI 爬虫的前后两半。
---

Run your markup through the `jsonld` library's `flatten` and one number pops out: the count of connected components. For most sites it comes back as 2 or 3. One `Organization`, one `WebSite`, one `Article`. Each an island unto itself.

I didn't recognize this as a problem for a long time. I'd drop two or three `<script type="application/ld+json">` blocks onto a page, see the green checkmark in the Rich Results Test, and call it done. And to be fair, each block is individually valid. The syntax is right, the required properties are filled in. But whether a search engine or AI crawler connects "the organization that published this," "the person who wrote it," and "the company that person works for" into a single understanding is a completely separate question. If the pieces don't know about each other, they don't connect.

This time I measured it instead of hand-waving. I built a scattered version and an `@id`-linked `@graph` version of the same information, ran both through a W3C JSON-LD processor to expand and flatten them, and pulled out the number: how many islands does this split into? Every log and table below is real output from that sandbox.

## Why "fragmented JSON-LD" matters more now

A few years ago, fragmented markup barely mattered. Search engines pulled rich results per page, and a single well-formed `Article` was enough to get an article card. But as search shifted toward entities, and AI search (generative engines) piled on top, the game changed.

AI Overviews and chatbot-style search don't just look at one page. They try to read the <strong>relationships between entities</strong>. "Who is the author of this post, what organization do they belong to, and what is that organization's official site?" When those relationships are stated explicitly in the markup, the machine takes them as given instead of having to infer. Conversely, if your `Article` just carries `author` as `{"@type": "Person", "name": "Jane Doe"}`, nothing anywhere in the markup says how that Jane Doe relates to the site's `Organization`. You're left hoping the machine stitches it together for you.

I think the developer's job here is clear: don't lean on inference, write the relationships down. That's exactly what `@graph` and `@id` exist for. What to expose to AI crawlers and how is something I covered in [controlling training versus citation with robots.txt](/en/blog/en/ai-crawler-control-robots-txt-llms-txt-2026); this article is the next step. Once you've allowed a crawler to read, how do you hand it a <strong>correct entity model</strong>.

## @id and node references — the connection W3C defined

Two tools do the work: `@graph` and `@id`.

`@graph` is a container that holds multiple entities in one array. Instead of scattering three `<script>` blocks across a page, you put every entity into a single script as a `@graph` array. So far that's just tidying up. The real move is `@id`.

`@id` assigns a unique identifier to each entity. The W3C JSON-LD spec calls an object carrying only `@id` a <strong>node reference</strong>. Its definition: "a node object containing only the @id property, which may represent a reference to a node object found elsewhere in the document." So instead of restating the whole organization inside `Article`'s `publisher`, you write one line, `{"@id": "https://example.com/#org"}`, pointing at "that organization defined above."

There's a convention for the identifier value: domain plus a fragment (`#org`, `#website`, `#article`). The key thing is that this URI does not need to resolve to a real page. `@id` is an <strong>identifier</strong>, not a URL. Its only job is to be unique and consistent, the same value everywhere you refer to that entity. Reuse the same `@id` for two different entities, though, and the processor merges them into one, so avoid that.

Google supports this. Its documentation names JSON-LD as the recommended format and reads multiple entities referencing each other inside one `@graph` without issue. Worth noting: this isn't a Google-only rule, it's a W3C standard. So Google, Bing, and any spec-compliant JSON-LD processor all interpret it the same way.

## I tried it: scattered pieces vs one @graph

"They connect" didn't land as an abstraction, so I built two versions and actually fed them to a processor.

The first is the scattered version you see everywhere. Three pieces (`Organization`, `WebSite`, `Article`) each with its own `@context`, standing apart. The `Article`'s `author` and `publisher` are inlined with just a name.

```json
[
  { "@context": "https://schema.org", "@type": "Organization", "name": "Acme Bakery", "url": "https://example.com" },
  { "@context": "https://schema.org", "@type": "WebSite", "name": "Acme Bakery", "url": "https://example.com" },
  { "@context": "https://schema.org", "@type": "Article", "headline": "Sourdough at 4am",
    "author": { "@type": "Person", "name": "Jane Doe" },
    "publisher": { "@type": "Organization", "name": "Acme Bakery" } }
]
```

The second puts the same information into one `@graph` and links it with `@id`. The `Article` references `{"@id": ".../#jane"}` for `author` and `{"@id": ".../#org"}` for `publisher`; the `Person` points back at the `Organization` via `worksFor`. It states that the `WebPage` is part of the `WebSite`, and that the `BreadcrumbList` belongs to that `WebPage`.

```json
{
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Organization", "@id": "https://example.com/#org", "name": "Acme Bakery", "url": "https://example.com" },
    { "@type": "WebSite", "@id": "https://example.com/#website", "url": "https://example.com",
      "publisher": { "@id": "https://example.com/#org" } },
    { "@type": "WebPage", "@id": "https://example.com/blog/sourdough#webpage",
      "isPartOf": { "@id": "https://example.com/#website" },
      "breadcrumb": { "@id": "https://example.com/blog/sourdough#breadcrumb" } },
    { "@type": "Article", "@id": "https://example.com/blog/sourdough#article", "headline": "Sourdough at 4am",
      "isPartOf": { "@id": "https://example.com/blog/sourdough#webpage" },
      "author": { "@id": "https://example.com/#jane" },
      "publisher": { "@id": "https://example.com/#org" } },
    { "@type": "Person", "@id": "https://example.com/#jane", "name": "Jane Doe",
      "worksFor": { "@id": "https://example.com/#org" } }
  ]
}
```

Then I wrote a short Node script. It `flatten`s both documents with the `jsonld` library, treats the `@id` references between nodes as an undirected graph, and counts the connected components. One component means every entity is tied into a single mass; several means it's broken into that many islands.

```javascript
const flat = await jsonld.flatten(doc);
const graph = flat['@graph'] || flat;
// Compute edges from each node's values that reference another node's @id,
// then count connected components in the undirected graph (DFS).
```

Here is the run output, copied verbatim.

```text
[disconnected islands]
  total nodes (after flatten): 5
  nodes with a stable @id:     0
  @id reference edges:         2
  connected components:        3  => 3 disconnected islands

[connected @graph]
  total nodes (after flatten): 10
  nodes with a stable @id:     7
  @id reference edges:         11
  connected components:        1  => ONE entity graph
```

The numbers are unambiguous. The scattered version splits into <strong>three islands</strong>, with zero nodes carrying a stable `@id`. The inlined `author` and `publisher` get turned into anonymous blank nodes by the processor, so the markup alone can't tell you whether the `Article`'s `publisher` is the same thing as the `Organization` above. The `@graph` version, by contrast, ties every node into a <strong>single component</strong> through 11 reference edges, with 7 nodes carrying stable identifiers.

![Disconnected islands versus connected @graph: a diagram visualizing the measured connected-component counts](../../../assets/blog/json-ld-graph-entity-linking-2026/graph-comparison.png)

One misreading to clear up. "Three islands" does not mean "the structured data is invalid." Each piece of the scattered version is valid, and Google reads multiple separate script blocks fine. What I measured isn't validity, it's <strong>explicit relationship</strong>. Fragmented markup leaves entity relationships to the machine's inference; a connected `@graph` nails them down and hands them over. If [getting LocalBusiness markup out server-side reliably](/en/blog/en/localbusiness-structured-data-server-side-vs-js-2026) was about "does the crawler even see the markup," this is about "is the markup it saw connected to itself."

## What Google guarantees, and what it doesn't

I have to draw the line honestly here. Wire your entities together with `@graph` and rankings go up? I'm not saying that. I can't.

Straight from Google's docs (General Structured Data Guidelines, Intro to Structured Data): structured data can make a feature <strong>eligible</strong> to appear, it does not guarantee it will appear. Google's algorithm weighs search history, location, device, and more, then picks whatever it judges best in the moment: sometimes a rich result, sometimes plain text. On top of that, a structured-data manual action only costs a page its <strong>eligibility</strong> for rich results; it doesn't affect the page's ranking in web search. Structured data and core ranking are separate axes.

So the value of a connected `@graph` isn't "higher rankings," it's elsewhere. First, it stabilizes your <strong>eligibility</strong> for rich results, because required properties land precisely on the right entity. Second, with relationships stated explicitly, search engines and AI have more to work with in building a correct knowledge model of your site, and this second one is a claim I <strong>can't assert</strong> with certainty. Exactly how AI search digests my markup isn't public. So the honest ceiling is "state the relationships per the standard and the reading side has less to infer," not "AI reads it this way." Anything beyond that is industry conjecture (reference only, not official).

## Four common mistakes and how to avoid them

These are the ones I kept tripping over while writing this, and while reading other people's markup.

<strong>Mistake 1. using a different `@id` for the same entity on different pages.</strong> Your organization is one entity across the whole site. Use `https://example.com/#org` consistently on every page so the search engine recognizes "the same organization." Split it into `#org1`, `#org2` per page and it won't connect.

<strong>Mistake 2. treating `@id` as a resolvable URL and building a real anchor for it.</strong> `@id` is an identifier, not a link. A fragment like `#org` doesn't need to point at an actual page element. It only needs to be unique and consistent.

<strong>Mistake 3. duplicating entities inline into multiple copies.</strong> Write the full person object into `author` here, then write it in full again in another post, and to the processor each is a fresh blank node. Define `Person` once with an `@id` and reference it afterward as `{"@id": ".../#jane"}`.

<strong>Mistake 4. dropping things into `@graph` but never wiring the references.</strong> Putting them in an array doesn't connect them. Sit in the same array with no `@id` references and they're still islands. What created connection in my measurement wasn't the array, it was the 11 reference edges.

## How to assemble the @graph once in a static site

Theory aside, the real challenge is maintaining this on an actual site. Hand-build the `@graph` on every page and your `@id`s will drift. I manage entities in two layers.

<strong>Site-wide entities</strong> get pinned in one place. Things that never change across the site (`Organization`, `WebSite`, your primary author `Person`) are defined once in the layout (or a shared helper), with their `@id`s held as constants. Now every page points at the same `#org` and `#website`. Mistake 1 is cut off at the source.

<strong>Per-page entities</strong> are built in each page. `WebPage`, `Article`, and `BreadcrumbList` differ by page, so generate them locally, but don't restate the global entities, just reference them by `@id`. The assembly function looks roughly like this.

```javascript
// Global constants: identical everywhere on the site
const ORG_ID = 'https://example.com/#org';
const SITE_ID = 'https://example.com/#website';

function buildGraph({ pageUrl, article }) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      globalOrganization,          // @id: ORG_ID (defined once)
      globalWebSite,               // publisher -> { '@id': ORG_ID }
      buildWebPage(pageUrl),       // isPartOf -> { '@id': SITE_ID }
      buildBreadcrumb(pageUrl),
      buildArticle(article, pageUrl), // author/publisher -> @id references
    ],
  };
}
```

The point is reusing global entities <strong>by reference, not by value</strong>. On a static site built with Astro like this blog, make `buildGraph` a component and emit it into `<head>` as a single `ld+json` script. Crawlers read it straight from the HTML with no JS execution, so you also sidestep any markup-missing problem caused by rendering.

## A checklist you can apply today

If you're applying this to your own site today, do it in this order.

1. Merge the page's `<script type="application/ld+json">` blocks into <strong>one `@graph`</strong>.
2. Give reused entities (`Organization`, `WebSite`, author `Person`) a <strong>site-wide, unchanging `@id`</strong>.
3. Replace inline objects with <strong>`{"@id": ...}` references</strong> for `WebSite.publisher`, `Article.author`, `Article.publisher`, `Person.worksFor`, and the like.
4. Wire the page hierarchy: `WebPage.isPartOf` → `WebSite`, and `BreadcrumbList` → `WebPage.breadcrumb`.
5. Run the markup through the [Schema Markup Validator](https://validator.schema.org/) and Google's Rich Results Test to confirm validity.
6. (Optional) `flatten` it with `jsonld` and check via script that the connected components equal <strong>1</strong>. Two or more means a reference is missing somewhere.

That's the measurable end of "I stated the relationships." No ranking guarantee. But you stabilize rich-result eligibility and lay the groundwork for machines to read your site's entity model without misreading it. I think this is the most undervalued job in structured data. Everyone focuses on adding new schema types, and skips the work of actually <strong>connecting</strong> the pieces they already shipped.

<strong>Update, 2026-07-06</strong>: This prescription is now applied to this blog. The separate JSON-LD blocks were merged into a single `@graph` (six nodes: Organization, Person, WebSite, WebPage, BreadcrumbList, BlogPosting), with author, publisher, isPartOf, and breadcrumb all switched to `@id` references. Running the checklist's connectivity test on a post page: 0 unresolved references, <strong>one</strong> connected component — three fragments became one graph.

If you want to get structured data out server-side reliably, or audit an existing site's JSON-LD into a single entity graph, I take on consulting and implementation work personally. I diagnose from measurements like these.
