---
title: The Same-Day On Button and the Buried Off Sentence
description: Google shipped a full sign-up kit for AI search inclusion on announcement
  day, but the official way to opt out is still one old sentence that appeared on
  none of 12 real pages of one site checked. The asymmetry in the paperwork tells
  you what the platform actually wants.
pubDate: '2026-08-28'
heroImage: ../../../assets/blog/preferred-source-inclusion-only-exclusion-lever-unlanded-2026/hero.png
tags:
- google-search
- ai-search
- preferred-sources
relatedPosts:
- slug: ai-crawler-control-robots-txt-llms-txt-2026
  score: 0.7
  reason:
    en: Google's same-day sign-up kit for AI search shows exactly how the 2026 strategy
      of blocking training while permitting citation via robots.txt plays out on a
      real site.
    ko: 구글이 당일 출시한 AI 검색 가입 키트는 robots.txt로 학습과 인용을 갈라 놓는 2026 전략이 실제 사이트에 어떻게 적용되는지
      보여주는 실행 사례다.
    ja: Googleが当日公開したAI検索サインアップキットは、robots.txtで学習と引用を分ける2026戦略が実際のサイトでどう機能するかを示す実例である。
    zh: 谷歌当天上线的AI搜索注册套件，正是robots.txt“阻训练、允引用”2026策略在真实站点上落地的实例。
---

## Two directions of the same topic, and two doors

Google now has an AI answer feature in Search. It reads web pages and writes a summary for the searcher. If you run a website, this matters in two opposite ways at once.

Direction one: you want Google's AI to show your site. Being quoted means being seen.

Direction two: you want your site left out of that AI answer. Some people simply don't want their words handed over.

Here is what this article found, in one line: the "please include me" door opened on announcement day, with a button and a full instruction manual. The "please exclude me" door is one old sentence in an old rulebook, and on 12 real pages of one website checked, that sentence was written on none of them.

Think of a store membership card. The sign-up button is taped to the front door the day the program launches, big and easy to press. But if you want to cancel? There is no desk for that. The only official way is one line buried in an old rules booklet. When you visit 12 members' houses, not one of them has ever filled in that line.

That imbalance is the whole story. When a platform polishes the paperwork for one direction and leaves a single sentence for the other, you can read its intentions right off the page. And the practical part for you: believing you've set something does not mean the setting actually reached your pages.

## The include-me side, complete on day one

On August 20, 2026, Google announced a feature called "Preferred Sources." In plain terms: readers can pick the websites they trust, and in Google's AI answers those sites get a badge that says "preferred."

The announcement was not a teaser. Everything a site owner needed shipped the same day:

- A dedicated documentation page for Preferred Sources, updated 2026-08-20 UTC (UTC is the world clock time Google uses), the same day as the announcement.
- Actual button code publishers could paste onto their sites. Google's own announcement said so:

> If you're a publisher, you can find the new "Preferred Source" button code in our Google Search Central documentation to get started.
> [Personalize Search and Discover with preferred sources](https://blog.google/products-and-platforms/products/search/personalize-search-discover-news/)
> — [Personalize Search and Discover with preferred sources](https://blog.google/products-and-platforms/products/search/personalize-search-discover-news/)

- A number to make the feature feel alive. The announcement's only size figure was that more than 600,000 unique sources had already been chosen by users.

The docs even describe the reward up front:

> In AI Mode and AI Overviews, your content can be highlighted with a "preferred" badge for users who have selected your site as a preferred source.
> Source: [Preferred sources, appearance docs](https://developers.google.com/search/docs/appearance/preferred-sources)
> — [Preferred sources — appearance docs](https://developers.google.com/search/docs/appearance/preferred-sources)

So for the direction Google likes, the kit is complete on day one: a manual, a button, and a headline number. The upshot for you is that if you want in, the path is not just open; it is decorated.

## The one sentence left for the opt-out side

Now walk to the other door.

Google's developer documentation has a page about AI features and your website. You would expect a section there on how to leave the AI answer. What you actually find is a single sentence. It says: to limit what Search shows from your pages, use one of four page markers: nosnippet, data-nosnippet, max-snippet, or noindex. These names are shorthand markers placed in a page's code, explained below.

Those are all old, pre-AI page markers. In everyday terms, they are like four different sticky notes you can put on a document to say "don't quote this part" or "don't show this page at all." One of them, noindex, is the strongest: it pulls your page out of Google Search entirely, not just the AI answer. These four names are the only exclusion lever on the whole official surface.

> AI is built into Search and integral to how Search functions, which is why robots.txt directives for Googlebot is the control for site owners to manage access to how their sites are crawled for Search. To limit the information shown from your pages in Search, use nosnippet, data-nosnippet, max-snippet, or noindex controls.
> Source: [AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)
> — [AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)

You might think there's a separate switch called Google-Extended, a setting Google offers that sounds like it blocks AI from using your content. It doesn't work for this. Google's own page says it plainly:

> Google-Extended does not impact a site's inclusion in Google Search nor is it used as a ranking signal in Google Search.
> — [Google common crawlers (Google-Extended)](https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers)
> — [Google common crawlers — Google-Extended](https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers)

So the announcement itself carried essentially no opt-out language at all. In the whole launch post, the only "opt out" wording was a newsletter unsubscribe line: "You may opt out at any time." That is not about AI search. That is about email.

A fair objection here: one sentence is enough, because the sentence works. Put noindex on a page and it really does leave Search. A feature chosen by 600,000 sources hardly needs a fat exclusion manual, the argument goes. On the existence of the lever, this objection is correct: the sentence does the job. What it misses is the asymmetry around it. For inclusion: a dedicated document, ready-to-paste button code, a headline number. All on day one. For exclusion: one sentence in an old rule, and nothing else on the official surface. Same product, same week, wildly different paperwork. The next section shows what happens on real sites. That one lever was nowhere to be found. So "there's a lever, so it's under control" does not hold on actual pages.

## Where that sentence actually landed on real pages

A rule only matters if it is written where the action happens. So this article checked a live website's published pages. It took 12 real page addresses from one site's sitemap. A sitemap is the site's master list of its own pages. All 12 pages were fetched on August 21, 2026, the day after the announcement.

The measurement was simple and repeatable: fetch each page, strip the text, count whether any of the four controls appeared. The result:

```
Sample: 12 URLs (ko sitemap, jangwook.net), 3 repeated runs, all identical
Pages with any of nosnippet / data-nosnippet / max-snippet / noindex: 0 / 12
Pages with robots or googlebot meta tags at all: 0 / 12
Official docs opt-out vocabulary (opt out / exclude): 0 mentions in the launch post
preferred-sources doc: HTTP 200, "Last updated 2026-08-20 UTC"
```

Read that middle line again: 0 out of 12. Not "rarely used." Not "mostly missing." None. The one official exclusion lever had landed on not a single page of the site examined.

This is the membership-card line nobody ever filled in. The rulebook sentence exists. The sentence is binding. But if the sentence never reaches the pages, the control is theoretical. This means something uncomfortable and simple. "I'm sure it's set up" and "the setting is actually on my pages" are two different facts. Only the second one protects you.

## The settings people commonly believe are blocking

Here is where many site owners lose money without noticing. There are several switches that sound like they block AI, and people flip them and relax. None of them is the official exclusion lever for the AI answers:

- **Blocking Google-Extended.** As quoted above, Google itself says this has no effect on Search inclusion and is not a ranking signal. It is aimed at other Google AI products, not the AI answers inside Search.
- **A robots.txt rule**, a plain text file where a site tells visiting programs what they may read. Google's documentation frames robots.txt as the control for crawling for Search itself, and it does not single out the AI answer as a separately blockable feature.
- **llms.txt or similar files**, newer text files some sites add for AI programs. These are not part of Google's official exclusion path for its search AI features.

So the trap is a false sense of security. Someone toggles one of these, believes the AI answers can't touch their site, and moves on. Meanwhile, the only official lever was missing on every one of the 12 pages checked. The only official lever is one of those four page-level controls.

If you are in the group that wants out: stop trusting the switch you remember flipping. Go audit first. Check whether one of the four official controls (nosnippet, data-nosnippet, max-snippet, or noindex) is actually present on your live pages, starting from the template every page is built from.

If you are in the group that wants in: don't spend another afternoon adding machine-readable files nobody asked for. Go to the side that was finished on day one, the Preferred Sources button code and its documentation, and put that to work.

## What this article could not verify

Honesty about the edges. This piece measured the public face of the official documents and one site's live pages. It did not log into Google Search Console. A visual switch might exist there. Logging in was not possible for this article. It also did not measure whether some of the four controls hurt AI citations more than others. It examined a single site. So the 0/12 result cannot be stretched to the whole web.

One more blank spot: Google's help pages run on scripts that don't show their full text to a simple fetch, so absence of an opt-out switch there is unconfirmed, not disproven.

The falsifier, in one line: if Google's documentation ever points to a new exclusion switch beyond that one sentence, this article's judgment is wrong. The same is true if the Google-Extended guidance starts covering search AI opt-out, or if a wide check of real sites shows the exclusion rule landing on pages everywhere. In those cases, believe the newer picture instead.

## References

1. [AI features and your website](https://developers.google.com/search/docs/appearance/ai-features) — Google Search Central
2. [Preferred sources — appearance docs](https://developers.google.com/search/docs/appearance/preferred-sources) — Google Search Central
3. [Personalize Search and Discover with preferred sources](https://blog.google/products-and-platforms/products/search/personalize-search-discover-news/) — Google (The Keyword)
4. [Google common crawlers — Google-Extended](https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers) — Google Search Central