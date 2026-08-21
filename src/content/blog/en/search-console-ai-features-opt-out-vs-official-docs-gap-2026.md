---
title: "I Searched Google's AI Features Doc for an Opt-Out Switch. There Is None, and That's Architecture"
description: "I counted every word in Google's AI features doc: zero hits for opt out, opt-out, or exclude. Why no AI-only exclusion lever exists, and what to do instead."
pubDate: '2026-08-21'
heroImage: '../../../assets/blog/search-console-ai-features-opt-out-vs-official-docs-gap-2026/hero.png'
tags:
  - SEO
  - GEO
  - AI Overview
  - Engineering Management
relatedPosts:
  - slug: robots-snippet-controls-ai-overviews-2026
    score: 0.86
    reason:
      ko: 그 글이 nosnippet 계열 네 레버가 실제로 어떻게 착지하는지를 페이지 단위로 실측한 기록이라면, 이 글은 그 네 레버 말고는 아무것도 없다는 사실이 왜 문서의 누락이 아니라 설계의 결과인지를 다룬다.
      ja: あちらが nosnippet 系の四つのレバーがページ単位でどう着地するかの実測記録なら、こちらはその四つ以外に何も無いことが文書の抜けではなく設計の結果である理由を扱う。
      en: That post measures how the four nosnippet-family levers actually land on a page. This one explains why there is nothing besides those four, and why that absence is a design outcome rather than a documentation gap.
      zh: 那篇是对 nosnippet 系四个开关在页面上如何落地的实测记录；这篇则解释为什么除了这四个什么都没有，以及这种缺席为何是设计结果而非文档遗漏。
  - slug: ai-crawler-control-robots-txt-llms-txt-2026
    score: 0.81
    reason:
      ko: robots.txt로 학습을 막는 일과 검색면 AI 인용에서 빠지는 일은 다른 결정이다. 그 글이 크롤러 토큰 쪽 지도라면, 이 글은 그 지도를 들고 잘못된 티켓을 닫아 온 팀에게 보내는 정정이다.
      ja: robots.txt で学習を止めることと、検索面のAI引用から外れることは別の決定だ。あちらがクローラートークン側の地図なら、こちらはその地図を手に誤ったチケットを閉じてきたチームへの訂正になる。
      en: Blocking training via robots.txt and dropping out of AI citations in Search are different decisions. That post maps the crawler-token side; this one is the correction for teams who have been closing the wrong ticket with that map in hand.
      zh: 用 robots.txt 拦训练，和从搜索面的 AI 引用中消失，是两个不同的决定。那篇画的是爬虫令牌那一侧的地图，这篇是写给拿着那张地图关错工单的团队的更正。
  - slug: official-geo-subtraction-gsc-control-2026
    score: 0.75
    reason:
      ko: 선언한 robots.txt와 실제 배포본이 어긋나 있던 그 경험이 이 글의 CI 게이트 제안으로 이어졌다. 파일을 읽는 검사와 렌더 결과를 세는 검사는 다른 것을 본다.
      ja: 宣言した robots.txt と実際の配信物がずれていたあの経験が、この記事の CI ゲート提案につながっている。ファイルを読む検査とレンダー結果を数える検査は別のものを見ている。
      en: The gap between a declared robots.txt and what actually shipped is what led to the CI gate proposed here. Reading a file and counting rendered output are two different inspections.
      zh: 声明的 robots.txt 与实际部署物之间的偏差，正是本文提出 CI 门禁的由来。读文件的检查和数渲染结果的检查，看的是两样东西。
---

I wanted to know whether Google had shipped an AI-only exclusion switch — some way to stay in ordinary search results while dropping out of AI Overviews and AI Mode. So on August 21, 2026, the day after Google announced Preferred Sources, I pulled the raw HTML of the official AI features documentation and counted words in it. In all 177,842 bytes: `opt out` 0 times, `opt-out` 0 times, `exclude` 0 times.

That absence is not a documentation gap someone forgot to fill. It is what the architecture produces, and it means the request sitting in your backlog — "make sure AI doesn't use our content" — is not an engineering task. It's a business decision about how much organic search traffic you're willing to give up. The rest of this is the evidence, and the four rules I now enforce so the request stops getting closed against the wrong file.

## What the word counts showed

The AI features doc names exactly four ways to reduce what Search displays from your pages:

> To limit the information shown from your pages in Search, use nosnippet, data-nosnippet, max-snippet, or noindex controls.
> — [AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)

Not one of those four is AI-specific. They're the same snippet controls that have governed ordinary search result display for years. The doc's last-updated stamp reads 2025-12-10 UTC, so at the time I counted, it had been sitting still for over eight months.

Now look at the other direction over the same eight months. Google's August 20 announcement introduced Preferred Sources, and the dedicated developer doc for it carries an update stamp of 2026-08-20 UTC — same day as the announcement. The announcement's body runs 9,045 bytes. In it: `preferred source` 7 times, `publisher` 8 times, `Top Stories` once, `AI Overviews` once, `AI Mode` twice. `Search Console`, `turn off`, `exclude`, `remove`, `block` — all zero. There is one instance of `opt out` in the announcement, and it belongs to the newsletter signup box at the bottom: "You may opt out at any time."

The only scale number the announcement offers is a user-side one.

> Readers more easily find their favorite publications in Top Stories, AI Overviews, and AI Mode, while publishers gain a more seamless way to connect with readers across Google. So far, people have already selected more than 600,000 unique sources.
> — [A more personalized Search, Discover and News](https://blog.google/products-and-platforms/products/search/personalize-search-discover-news/)

600,000 is how many unique sources users picked. It is not a publisher outcome metric, and nobody should present it to an executive as one.

## Why there is no dial to attach

The mechanism is one sentence in the doc, and it decides everything downstream.

> To be eligible to be shown as a supporting link in AI Overviews or AI Mode, a page must be indexed and eligible to be shown in Google Search with a snippet, fulfilling the Search technical requirements.
> — [AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)

AI citation eligibility isn't a separate pipeline with its own inputs. It reuses the existing determination: are you indexed, and are you eligible to appear with a snippet. To bolt an AI-only exclusion dial onto that, someone at Google would first have to split the eligibility check into a search branch and an AI branch. It isn't split. So there's no surface for the dial to mount on.

I want to flag one thing about my own phrasing here. Calling this a single shared gate is my synthesis, not Google's wording. What the doc says is "fulfilling the Search technical requirements." I'm reading a shared determination out of that sentence, and if Google later documents two branches that were always there, my reading was wrong rather than the platform having changed.

The inclusion side supports the same structure. Preferred Sources doesn't alter base eligibility at all — it layers one signal on top of it.

> In AI Mode and AI Overviews, your content can be highlighted with a "preferred" badge for users who have selected your site as a preferred source.
> — [Preferred sources](https://developers.google.com/search/docs/appearance/preferred-sources)

The doc is also explicit that inclusion requires no new build work: "You don't need to create new machine readable files, AI text files, or markup to appear in these features." Meanwhile, the same doc's framing of access control points back at Googlebot itself: "AI is built into Search and integral to how Search functions, which is why robots.txt directives for Googlebot is the control for site owners to manage access to how their sites are crawled for Search." Blocking Googlebot to escape AI Overviews means leaving Search. That is the price tag, stated plainly.

## The ticket that closes against the wrong file

In large web renewal work, the AI-exclusion request always arrives in the same shape. Legal or comms says "make sure our content isn't used by AI." An engineer opens robots.txt, disallows Google-Extended, adds `ai-train=no` to the Content-Signal line, and reports done. The request was "keep us out of AI." The implementation was "we opted out of training." Both sentences contain the word AI, so the reviewer sees `Disallow: /` under `Google-Extended`, approves the PR, and the ticket closes.

Except Google-Extended doesn't touch Search at all.

> Google-Extended does not impact a site's inclusion in Google Search nor is it used as a ranking signal in Google Search.
> — [Google crawlers and fetchers](https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers)

The word distribution in that crawlers doc tells you what territory the token covers: Google-Extended appears 6 times, Gemini 4, Vertex 8. `AI Overviews` appears 0 times. `AI Mode`, 0 times. The token governs model training and grounding on the Gemini and Vertex side. AI Overviews and AI Mode are not in its vocabulary.

If you've worked deletion requests in a customer data platform, this failure has a familiar shape. The request scope is wide, the system reaches only as far as the narrowest technical boundary it knows how to touch, and without a written definition of done, "we did it" and "it's handled" quietly diverge. Nobody lied. The reviewer read a real file and saw a real directive.

I ran a probe against my own production site the same day to see how wide that gap was on a site I control. Six cells, three repetitions each, 18 runs total. Every request came back exit 0 and HTTP 200, received byte counts matched the pre-registered baselines, zero bot-block pages. What that actually validated was the health of my own deployment — it did not test where Google-Extended's boundary sits. I also ran a separate cell trying to break the premise that Google-Extended covers search AI features, and nothing came back that falsified it. Failing to refute is weaker than confirming, and I'm treating it that way.

The part that mattered was smaller. `sitemap-ko.xml` is 71,340 bytes and lists 351 URLs. I pulled a deterministic sample of 12 and checked what the rendered pages carried. All 12 had empty `robots` and `googlebot` meta tags. Not one of the four controls was live anywhere in the sample. My robots.txt, meanwhile, has two groups disallowing Google-Extended, a `Content-Signal: search=yes,ai-train=no,use=reference` line, and directives blocking GPTBot and CCBot. Everything switched on was on the training side. Nothing was switched on for search-surface snippets. Twelve is a small sample, and widening it could move the result, but the direction it points is the one I expected: the file said something the rendered output never carried.

## Four axes that end the argument in review

**Inclusion versus exclusion.** Over the same eight months, the inclusion direction got a dedicated doc, a button snippet published in Search Central, and a launch-day update. The exclusion direction got a doc that hasn't moved since December. Inclusion costs nothing to implement — no new files, no markup. Exclusion costs whatever traffic the snippet was earning you.

**Training exclusion versus search-surface exclusion.** Google-Extended, GPTBot, and CCBot turn off model training and grounding, with no effect on Search inclusion or ranking. The nosnippet family turns off display in Search — which cascades into the AI surfaces because eligibility is shared. Different levers, different costs, and one word in common that keeps merging them in Slack.

**Content granularity versus surface separation.** You can control which sentences appear. You cannot control which surface they appear on. More on this in the next section, because it's where the strongest objection to my read lives.

**Declaration versus landing.** robots.txt is a declaration. Rendered meta tags are what actually shipped. My 12 of 12 is the whole argument for treating these as separate checks.

## "The four controls are already precise enough"

The serious objection to everything above goes like this: there's no separate AI exclusion lever because you don't need one. The existing four are precise enough already.

On granularity, that objection is correct, and I want to concede it fully rather than restate it weakly. `data-nosnippet` applies at the element level — you can wrap a single paragraph, a pull quote, a pricing table. `max-snippet` tunes by character count. If the only tools were `noindex` and page-level `nosnippet`, the criticism "these instruments are blunt" would stand. It doesn't stand. The instruments are fine-grained, and I've stopped using bluntness as an argument.

Where the objection breaks is that precision answers "what do I remove," not "where does it disappear from." Put `data-nosnippet` on a paragraph, and that paragraph vanishes from AI Overviews, from AI Mode, and from your ordinary search snippet, simultaneously. The lever has no surface parameter. A publisher asking to leave AI while staying in Search is not asking for a finer tool. They're asking for an axis that isn't in the API.

There's a second cost the objection tends to skip. Element-level precision presumes a template that can branch. Sites mass-produced from a shared template can't apply anything selectively until someone builds the conditional first. On that class of site, the honest estimate isn't one line of markup — it's template surgery, then one line of markup.

So I grant the range and keep my position. Within a page, the toolkit is adequate. Across surfaces, there is nothing, and that's the thing people are actually asking for.

## Four rules, in this order

I put the linter first because it's the only one that catches an error already in production.

Pull a deterministic sample from your sitemap, render each URL, count `robots` and `googlebot` meta tags on the output, and fail the build when the rendered tags disagree with declared policy. My 12-URL sample is the minimum viable version of this. Reading robots.txt and calling it verified is the check that let the divergence live.

Second, split the policy doc. "Search-surface AI exclusion" is a business decision that spends snippet budget. "Training exclusion" is a technical decision that touches one crawler token. Two separate line items, never one.

Third, a PR that switches on an exclusion lever doesn't merge unless its description states the share of organic traffic the affected page group carries. If nobody can produce the number, the PR isn't ready — the number is the decision.

Fourth, "block AI crawlers" is banned language internally. Say the token or say the surface. Training means Google-Extended. Search snippets and citations mean `data-nosnippet`.

One thing I have not checked: whether the signed-in Search Console interface has an AI features section. I didn't count it, and I'm not asserting its absence. That the announcement routed publishers to Search Central documentation rather than to Search Console is circumstantial, nothing more.

## What to measure before you sign the ticket

Don't start with "should we opt out of AI." Start with "how much of this page group's revenue depends on snippet visibility in Search." An exclusion order issued without that figure is a payment authorized without knowing the amount.

The unit economics are asymmetric, which is why the question order has to flip. Inclusion is effectively free — no new files, no markup, no engineering ticket. Exclusion costs you the organic traffic that snippet was carrying, and Google publishes no figure for that loss. Every estimate has to come from your own analytics. So the cheap side is measurable and the expensive side isn't, which is precisely the condition under which teams underprice the expensive side.

For teams where search traffic is the lead source — B2B platforms, commerce, corporate sites — I'd write "do not touch the exclusion levers" into the standard and spend the effort on Preferred Sources adoption and on keeping snippet eligibility intact instead. For teams where the content is the product — paid articles, subscription databases, member-only editorial — `data-nosnippet` at the element level is defensible, provided the organic decline on those page groups is in the budget before the tag ships, not discovered in next quarter's report.

Here's my call. The absence of an AI-only exclusion switch is not a temporary state waiting on a Google release. It follows from a shared eligibility determination, and until that determination splits, the combination people want cannot be built. What would prove me wrong is narrow and specific: Google documenting a control that removes a page from AI Overviews and AI Mode while it keeps appearing with a snippet in ordinary results. Not a blog post hinting at it. A control in the docs.

I'll also keep an honest reservation on the table. Eight months of a static doc doesn't establish that the exclusion policy is settled — it's equally consistent with a documentation update that simply hasn't shipped. Update history doesn't state policy.

What it does state is where the hands go. Counting which direction's docs get touched on launch day and which direction's sit for eight months tells you, through nothing more than word distribution, what a platform is currently selling its users and what it isn't.

## References

- [A more personalized Search, Discover and News](https://blog.google/products-and-platforms/products/search/personalize-search-discover-news/)
- [AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)
- [Preferred sources](https://developers.google.com/search/docs/appearance/preferred-sources)
- [Google crawlers and fetchers](https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers)
- [Robots meta tag, data-nosnippet, and X-Robots-Tag specifications](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag)
