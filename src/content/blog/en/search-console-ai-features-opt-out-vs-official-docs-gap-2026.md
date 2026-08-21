---
title: "We Looked for an \"Opt Out of AI\" Button in Search Central Docs. There Isn't One, and That's the Point"
description: 'Legal asks to keep content out of AI Overviews. Engineering flips a robots.txt switch and closes the ticket. We counted every word in four Google docs to find out why that ticket was never actually closed.'
pubDate: '2026-08-21'
heroImage: '../../../assets/blog/search-console-ai-features-opt-out-vs-official-docs-gap-2026/hero.png'
tags:
  - SEO
  - GEO
  - Search Console
  - AI Overview
relatedPosts:
  - slug: robots-snippet-controls-ai-overviews-2026
    score: 0.8
    reason:
      ko: 그 글은 nosnippet 이 AI Overviews 인용 자격까지 끈다는 사실을 다뤘다. 이 글은 그 넷(nosnippet, data-nosnippet, max-snippet, noindex) 말고는 배타 레버가 아예 없다는 것, 그리고 그것이 왜 문서의 누락이 아니라 설계인지를 다룬다.
      ja: あちらは nosnippet が AI Overviews の引用資格まで止めることを扱った。こちらはその四つ（nosnippet, data-nosnippet, max-snippet, noindex）以外に排他レバーが存在しないこと、それが文書の欠落ではなく設計である理由を扱う。
      en: That post showed nosnippet also cuts AI Overviews citation eligibility. This one shows there is no fifth lever beyond those four, and why that absence is architecture, not a documentation gap.
      zh: 那篇讲的是 nosnippet 也会切断 AI Overviews 的引用资格。这篇讲的是除了这四个（nosnippet, data-nosnippet, max-snippet, noindex）之外根本没有第五个排他开关，以及这为什么是架构问题而不是文档遗漏。
  - slug: ai-crawler-control-robots-txt-llms-txt-2026
    score: 0.72
    reason:
      ko: 그 글은 크롤러를 들여보낼지 말지의 문제였다. 이 글은 이미 들어온 뒤 검색과 AI 표면 중 어디에 인용될지를 나누는 자격 판정 자체가 하나로 묶여 있다는 것을 다룬다. 층이 다르다.
      ja: あちらはクローラーを入れるか否かの問題だった。こちらは既に入った後、検索とAI表面のどちらに引用されるかを分ける資格判定そのものが一本に束ねられている点を扱う。層が違う。
      en: That post was about letting crawlers in or not. This one is about the eligibility judgment itself, made after entry, that decides both search and AI surfaces at once — a different layer entirely.
      zh: 那篇讲的是让不让爬虫进来。这篇讲的是爬虫进来之后，决定它能否出现在搜索和 AI 界面的资格判定其实是同一条判定线——这是完全不同的层。
  - slug: official-geo-subtraction-gsc-control-2026
    score: 0.68
    reason:
      ko: 그 글이 GSC 로 무엇을 뺄 수 있는지의 공식 범위를 다뤘다면, 이 글은 그 범위 밖에 있는 것 — AI 전용 배타 항목의 부재 — 을 문서 원문 어휘 카운트로 증명한다.
      ja: あちらが GSC で何を除外できるかの公式範囲を扱ったなら、こちらはその範囲の外にあるもの — AI専用の排他項目の不在 — を文書原文の語彙カウントで裏付ける。
      en: If that post mapped the official scope of what GSC lets you subtract, this one proves what sits outside that scope — the absence of an AI-only exclusion — with a raw word count from the source documents.
      zh: 如果那篇梳理的是 GSC 能减掉什么的官方范围，这篇证明的就是这个范围之外的东西——AI 专属排除项的缺失——用的是源文档的原文词频统计。
---

Legal filed a ticket: keep our content out of AI Overviews. I searched for the setting to handle the request. I read Google's own AI features documentation word by word, ran the same count against a Google announcement from yesterday, and checked our production robots.txt and rendered pages against both to see where the lever was supposed to live. The setting does not exist. Once you see why, you stop looking for it.

Google's AI features documentation names exactly four levers that reduce what shows up from your pages in Search: `nosnippet` (blocks any snippet, AI or otherwise, from showing under the page), `data-nosnippet` (marks specific HTML elements as off-limits to snippets), `max-snippet` (caps how many characters of text a snippet may quote), and `noindex` (removes the page from the index entirely). None of the four levers is AI-specific. There is no fifth lever that pulls content out of AI Overviews while leaving regular search snippets intact. The omission is not a documentation oversight — a single eligibility check decides both surfaces at once. If your team closes "keep us out of AI" tickets by editing robots.txt — the plain-text file that tells crawlers which paths on a site they're allowed to fetch — you have closed the wrong ticket. Data teams hit the same gap when a business stakeholder files a deletion request and the system only reaches as far as its narrowest technical boundary. I audited the two Google documents defining this boundary against our production configuration to see where the assumption breaks.

The distinction matters because the ticket rarely asks for what engineering delivers. Legal wants a business outcome — content not consumed by generative answers, including AI Overviews, AI Mode, and any future surface Google adds. Engineering delivers a robots.txt line that touches exactly one crawler, on exactly one axis: training-data collection. Once you separate them, the request turns from a five-minute config change into a decision about how much organic search traffic you are willing to spend.

## What changed, and what didn't

Start with the two documents at the center of the gap. Google Search Central's [AI features and your website](https://developers.google.com/search/docs/appearance/ai-features) page is the only document that addresses reducing AI exposure. Its last-modified timestamp reads 2025-12-10 UTC. On 2026-08-20, Google published [A more personalized Search, Discover and News](https://blog.google/products-and-platforms/products/search/personalize-search-discover-news/), introducing "Preferred Source" — a feature letting users pick sites they want highlighted, with a badge shown "in AI Mode and AI Overviews" (AI Mode is a separate, conversational Google Search interface, distinct from the AI Overviews summary box) per the companion [Preferred sources](https://developers.google.com/search/docs/appearance/preferred-sources) page, whose own timestamp reads 2026-08-20 UTC, the day of the announcement.

Look at the timeline: Google updated the document on gaining visibility the day the feature launched. The document on reducing visibility has not changed in over eight months. A delayed documentation cycle could account for some of that gap on its own. The word count settles the question.

I ran a literal string count across the AI features page — all 177,842 bytes of it. "Opt out": zero matches. "Opt-out": zero. "Exclude": zero. A document devoted to how pages appear in AI features never once uses vocabulary for turning that appearance off. The announcement post carries exactly one instance of "opt out," and it sits in a newsletter-unsubscribe sentence unrelated to search exclusion. Its word count — 9,045 bytes of body copy — yields 7 matches for "preferred source," 8 for "publisher," 1 for "Top Stories," 1 for "AI Overviews," 2 for "AI Mode," and zero for "Search Console," "turn off," "exclude," "remove," or "block." Neither document contains exclusion vocabulary; every term in the copy points toward inclusion.

## The mechanism — why the fifth lever never showed up

The AI features documentation states the eligibility rule directly: "To be eligible to be shown as a supporting link in AI Overviews or AI Mode, a page must be indexed and eligible to be shown in Google Search with a snippet, fulfilling the Search technical requirements." There is no separate AI eligibility check. AI Overviews and AI Mode citations ride on the same pass/fail gate as an ordinary search snippet: indexed, and snippet-eligible.

That requirement explains the broader architecture. If AI citation used an independent gate, Google would offer a dedicated control for it, the same way Google-Extended gives AI training and grounding their own dedicated control — feeding an AI answer live web data rather than generating from memory. Search citation gets no equivalent lever. To build one, Google would first have to split eligibility into two pipelines: one for search, one for AI. That split does not exist, leaving nowhere to attach an independent control. The documentation states the rule explicitly: "AI is built into Search and integral to how Search functions, which is why robots.txt directives for Googlebot is the control for site owners to manage access to how their sites are crawled for Search." Calling that shared check a single "gate" is my synthesis rather than Google's literal phrasing — the documentation specifies "fulfilling the Search technical requirements" — but the architecture it describes leaves no room for an isolated control.

Preferred Source confirms the pattern from the other direction. Its documentation does not touch base eligibility at all; it layers a signal on top: "your content can be highlighted with a 'preferred' badge for users who have selected your site as a preferred source." Google built a new inclusion feature in the same eight months it left the exclusion document untouched, and that new feature still routes through the identical underlying gate rather than opening a parallel one. Inclusion got a badge. Exclusion did not get a switch.

## The one document people reach for instead, and why it answers a different question

Google-Extended is the token engineers cite when an AI exclusion ticket arrives — and the token is the wrong lever for a documented reason. Google's [crawlers and fetchers](https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers) guide states: "Google-Extended does not impact a site's inclusion in Google Search nor is it used as a ranking signal in Google Search." Disallowing Google-Extended in robots.txt prevents content from training Gemini models or grounding Vertex AI applications (Google Cloud's platform for building AI apps). It does not alter your presence in Google Search or AI Overviews.

A word count on the crawlers page confirms the scope: Google-Extended appears 6 times, Gemini 4 times, Vertex 8 times, AI Overviews 0 times, and AI Mode 0 times. The vocabulary of that document focuses entirely on model training and enterprise grounding, never touching the search surfaces teams expect this token to govern.

I needed to confirm that our deployment behaved as documented, with no sign of Google-Extended leaking into search-facing behavior. I tested our production robots.txt and a deterministic sample of our sitemap against the documentation — eighteen runs across six configuration cells with three repeats each, every request returning exit 0 and HTTP 200, matching baseline byte counts with zero bot-block challenges. That run served as a health check on our deployment, not a test of the Google-Extended boundary; I ran the falsification attempt separately, testing the hypothesis that Google-Extended reaches into AI Overviews despite what documentation claims. While Google can update documentation and crawler behavior without notice, no evidence supported that hypothesis here: Google-Extended operates strictly on the training side, exactly as documented.

## Our own deployment showed the exact failure mode

The distinction is not hypothetical. In our production robots.txt, we maintain two Google-Extended disallow groups, alongside directives for GPTBot (OpenAI's training crawler) and CCBot (Common Crawl's scraping bot). Our robots.txt includes a Content-Signal header line — a syntax that specifies permitted crawler usage per purpose — reading `search=yes,ai-train=no,use=reference`: it permits the content to be indexed and cited in search, while explicitly refusing its use as AI training data. Every directive blocks training or third-party scraping; none of them activates the four levers Google specifies for reducing search-facing AI exposure.

I checked a deterministic sample of twelve URLs from our sitemap — spanning 351 URLs and 71,340 bytes of XML — inspecting the rendered HTML of each page for robots or googlebot meta tags. Zero of the twelve URLs carried any of the four snippet directives. Had our team resolved a "keep this out of AI Overviews" ticket last month based on robots.txt alone, the deployed code would have achieved nothing toward that goal while appearing resolved on a surface inspection.

"AI" appears in both the ticket title and the configuration diff, allowing a reviewer to see `Disallow: /` under `Google-Extended` and approve the pull request. The request targeted Search visibility; the fix targeted model training. They share a word and nothing else.

## The counter-argument, and where it actually holds

The primary counter-argument claims: "There is no missing lever because the existing four are already precise enough." The argument breaks on a fundamental distinction: precision governs which content to remove, not which surface observes the removal. Wrapping a paragraph in `data-nosnippet` removes that text simultaneously from AI Overviews, AI Mode, standard search snippets, and every other surface consuming snippet eligibility. No combination of the four documented levers produces an outcome where content is invisible to AI surfaces yet visible in standard search snippets. Legal requests that dual state, but the platform architecture cannot deliver it.

The counter-argument holds on content granularity. The `data-nosnippet` attribute operates at the element level rather than the page level. An engineer can wrap a single paywalled paragraph or members-only summary, excluding only that fragment while the surrounding page retains full snippet eligibility. Similarly, `max-snippet` constrains character length rather than forcing a binary cutoff. If Google offered only page-level `noindex` and `nosnippet`, criticism of blunt tooling would hold. Here, element-level granularity exists and functions precisely on content. It cannot partition by surface.

Element-level precision carries an engineering cost that teams overlook: it assumes templates can branch markup per element. A site using a shared template across hundreds of pages cannot apply `data-nosnippet` selectively without building custom conditional paths first. Selective exclusion requires template-level engineering before any tag can ship.

## What this costs, and what it doesn't

Inclusion and exclusion carry asymmetric costs. Inclusion is free. The documentation states plainly: "You don't need to create new machine readable files, AI text files, or markup to appear in these features." A normally indexed, snippet-eligible page qualifies as an AI Overview citation candidate without additional configuration. Preferred Source follows the same pattern: no new data schemas, only a button and a documented signal layered on top of existing eligibility.

Exclusion carries a direct cost. Because the only available levers rely on snippet controls, they cannot distinguish AI consumption from search snippet display. Applying an exclusion directive forfeits search snippets alongside AI citations. Google's announcement highlights one specific metric — "more than 600,000 unique sources" chosen by users — but that reflects user preferences rather than publisher traffic impact. Without official publisher-side data, that number remains a metric of user adoption rather than business ROI.

The actual cost of an exclusion decision is the organic traffic tied to the snippet you disable. Google does not publish this figure; every team that has run this trade-off has had to pull it from its own analytics stack first, ticket or no ticket.

## What a team should put in place, not what we happened to do

The gap points to four operating rules, none requiring Google to ship a fifth lever.
First, close the verification hole. Inspecting robots.txt alone cannot count as a completion check; a directive can sit in the file, look correct in review, and still never reach the pages it was meant to change. Sampling deterministic URLs from the sitemap and verifying the rendered `robots` and `googlebot` meta tags in production HTML is the minimal linter a continuous-integration gate (CI gate, an automated check that runs before a deploy is allowed to ship) should enforce. If declared policy and rendered tags diverge, the deployment halts.
Second, split "keep us out of AI" tickets into two line items: a "search-facing AI exclusion" (a business decision trading off snippet visibility) and a "training exclusion" (a technical crawler directive).
Third, require any pull request touching the four documented exclusion levers to state the target page group's organic traffic share, so reviewers weigh business impact alongside code diffs.
Fourth, retire the ambiguous phrase "block AI crawlers" from internal documentation. Name the crawler token and the target surface directly instead — Google-Extended for training, `data-nosnippet` for search snippets and citations.

Picture the most common version of that ticket: a B2B platform, an ecommerce site, or a corporate blog where organic search drives leads and pipeline, and legal wants "our content" out of AI Overviews. For that team, the right move is to leave the four exclusion levers alone and put the effort into Preferred Source integration and snippet eligibility instead — the traffic those snippets carry is the business, and there is no lever that removes AI citation without removing the snippet underneath it. Applying `data-nosnippet` straight to the monetized paragraphs, by contrast, is the correct call for a narrower case: organizations selling paywalled research, subscription databases, or gated editorial are already trading traffic for something else entirely, so the snippet loss is a cost worth paying, as long as the team prices it in up front. If Google ever ships a documented, surface-specific exclusion control, that calculus changes; until then, these four levers represent the entire toolkit, and a dedicated AI switch has no architectural anchor.

These findings come from public documentation, publisher announcements, and production probes against our own deployment. None of the probes reach into the authenticated Search Console administrative UI, so an unannounced AI configuration option sitting behind that login remains unverified.

## References

- [A more personalized Search, Discover and News](https://blog.google/products-and-platforms/products/search/personalize-search-discover-news/)
- [AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)
- [Preferred sources](https://developers.google.com/search/docs/appearance/preferred-sources)
- [Google crawlers and fetchers — Google-Extended](https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers)
- [Robots meta tag, data-nosnippet, and X-Robots-Tag specifications](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag)
