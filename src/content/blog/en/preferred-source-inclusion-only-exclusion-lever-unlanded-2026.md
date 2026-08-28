---
title: Google built a dedicated page for getting into AI search, but the way out is
  one sentence of snippet controls
description: Google shipped a dedicated document and button code for the Preferred
  Source feature within two days of its announcement, while the documented way to
  stay out of AI search is a single sentence pointing to four snippet controls. This
  piece explains the asymmetry in plain terms and what a site owner should actually
  check.
pubDate: '2026-08-28'
heroImage: ../../../assets/blog/preferred-source-inclusion-only-exclusion-lever-unlanded-2026/hero.png
tags:
- google-search
- preferred-source
- ai-overviews
relatedPosts:
- slug: ai-crawler-control-robots-txt-llms-txt-2026
  score: 0.7
  reason:
    en: Now that Google has shipped a dedicated page for getting into AI search, pairing
      Preferred Sources setup with concrete robots.txt and llms.txt crawler control
      is essential.
    ko: Google이 AI 검색 진입용 전용 페이지를 공개한 지금, Preferred Sources 설정과 함께 robots.txt·llms.txt로
      크롤러를 제어하는 구체적 전략이 필요합니다.
    ja: GoogleがAI検索専用ページを公開した今、Preferred Sourcesの設定と合わせてrobots.txt・llms.txtでクローラーを制御する具体的な戦略が不可欠です。
    zh: 在Google上线AI搜索专用页面的当下，将Preferred Sources设置与robots.txt、llms.txt爬虫控制策略结合使用至关重要。
---

## Getting in: a dedicated page and a button. Getting out: one line of documentation

Imagine a shop in a market. On the first day, the owner of the market puts up a sign at your front door, prints a flyer with your shop's name on it, and hands you a button to wear. But when you ask "how do I leave this market?", the answer is one sentence tucked into the rulebook. That is roughly what happened with Google's AI search features in August 2026.

First, some background. Google now has a feature called **Preferred Source**. It lets readers pick your website as a source they like, and then Google's AI answers (AI Overviews and AI Mode, which are Google's AI-generated summaries inside search) can highlight your content with a "preferred" badge. Google announced this on August 20, 2026.

To get *into* this system, Google gave publishers a lot, fast. There is a dedicated documentation page for it. The announcement even tells publishers where to find the code for a button on their own sites:

> If you're a publisher, you can find the new "Preferred Source" button code in our Google Search Central documentation to get started.
> — [Personalize search and discover news with preferred sources](https://blog.google/products-and-platforms/products/search/personalize-search-discover-news/)

To get *out* of it, the official developer documentation offers one sentence. It says:

> To limit the information shown from your pages in Search, use nosnippet, data-nosnippet, max-snippet, or noindex controls.
> — [AI features / Google Search Central](https://developers.google.com/search/docs/appearance/ai-features)

Those four words are "snippet controls". Small tags you can place on a page to tell Google things like "don't show a summary of this page" or "don't show this page at all." That one sentence is the entire documented way to leave.

The part that actually affects you, if you run a website or manage people who do, is this: getting in comes with instructions. It comes with a button and a dedicated page. Getting out comes with one line. So the checking you do for each direction needs to be different, and this article walks through what to check.

## The asymmetry, measured on the documentation surface

Let me show the evidence first, then explain it. On August 21, 2026, I fetched the Google developer documentation page about AI features and simply counted how many times certain words appear. This is like counting the pages a market gives each shop: it tells you how much official support each option has.

The count for the exit-side words: "nosnippet" appeared 1 time, "data-nosnippet" 1 time, "max-snippet" 1 time, "noindex" 1 time. And the words "opt out" and "exclude"? Zero times. The four exit controls exist, but they are bundled into that single sentence.

![Raw word-count output of the AI features doc, exclusion controls nosnippet, data-nosnippet, max-snippet, noindex at 1 each; opt out and exclude at 0.](../../../assets/blog/preferred-source-inclusion-only-exclusion-lever-unlanded-2026/log-docs-exclusion-lever-inventory.png)

Now compare the include side. I counted words in Google's own announcement post for Preferred Source. The phrase "preferred source" appeared 7 times. Mentions of AI Overviews and AI Mode appeared too. But the exit vocabulary (words about removing your site) was effectively zero. (One "opt out" phrase did appear, but it was about a newsletter sign-up form, not about search.)

![Raw word-count output of the Preferred Source announcement, "preferred source" 7 times, effectively 0 exclusion vocabulary.](../../../assets/blog/preferred-source-inclusion-only-exclusion-lever-unlanded-2026/log-announcement-inclusion-vs-exclusion-wording.png)

There is also an infrastructure gap. The Preferred Source documentation exists as its own page in the developer docs navigation, with a "Last updated" stamp of 2026-08-20 UTC, the same day as the announcement. There is no equivalent dedicated page for staying out. The exit option has no page of its own; the documentation covers it in a single sentence.

What this means on your end: when a company gives one option a dedicated page and the other option one line, the documentation work clearly went into the include side. If your team wants to act, the include side has ready-made material to work from. The exit side, you have to assemble yourself.

## A fair objection, and the numbers that answer it

Someone might push back like this: "There's no problem here. Those four snippet controls are old, well-tested standards that Google has honored for years. Google treats its AI features as part of Search, so it makes sense to control them through the same snippet controls. If site owners don't use them, that's their choice, not because the exit lever is too thin."

That objection is logically sound on its own terms. The controls are indeed long-standing standards. And Google does treat AI Overviews and AI Mode as features built into Search.

But here is the factual answer to the objection: on the same day as the announcement, the include lever received a dedicated page and button code, plus scale figures. The exclude lever received one sentence containing four tags, four mentions in total, all in that single line. And that sentence points at controls that, as we will see below, were not actually present on any page of the deployment I checked. The logic of the objection is fine. The asymmetry it overlooks is real and measurable.

![Google-Extended doc raw output, one sentence confirmed saying it does not affect search inclusion.](../../../assets/blog/preferred-source-inclusion-only-exclusion-lever-unlanded-2026/log-falsifier-google-extended-covers-search-ai.png)

## Google-Extended officially has nothing to do with search inclusion

Many site owners feel safe here when they should not, so this section takes things slowly.

There is a thing called **Google-Extended**. It is a setting in your site's rule file for robots (a plain text file, often called robots.txt, where you write instructions about which automated visitors may or may not crawl your site). Many site owners have written Google-Extended rules believing it blocks their site from appearing in AI answers.

Google's own documentation says otherwise, in one clear sentence:

> Google-Extended does not impact a site's inclusion in Google Search nor is it used as a ranking signal in Google Search.
> — [Google-Extended / Google Search Central](https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers)

In other words: Google-Extended affects how your content is used in Google's *other* systems, like training. It does not affect whether your site appears in Google Search. And Google's AI features are officially part of Search. The separate sentence in the AI features doc confirms this split: to limit use in "some of Google's other systems," read about Google-Extended; to limit what Search itself shows, use snippet controls. These are two separate controls. One is documented for limiting AI answers in Search; the other is not.

So the upshot for you: if your team wrote Google-Extended rules into the robots file and felt "we're covered on AI," that feeling is not supported by Google's own words. The only documented lever for search's AI features is the one attached to the pages themselves.

## Our own site: 12 pages checked, 0 carried any snippet control

Now for the check that matters most, the one you can copy tomorrow.

I took a sample of 12 pages from our own site, picked from the sitemap, which is the list of our pages that we hand to search engines, and looked at each page's underlying code for any snippet control tags. The idea is simple: confirm that the instructions you believe are in your pages are actually there.

The result: on all 12 pages, there were no snippet control tags at all. That is 0 out of 12. Meanwhile, the site *does* have Google-Extended blocking rules (2 lines) and a content-signal line in its robots file. In other words, the site carries the tags that don't affect search AI features, and carries none of the tags that do.

![Raw output of a check of 12 URLs from our own sitemap, 0/12 pages carried any directive.](../../../assets/blog/preferred-source-inclusion-only-exclusion-lever-unlanded-2026/log-own-deployment-lever-landing.png)

To be fair, this may not be a mistake. Our site may *want* to appear in AI answers, in which case having no exit tags is exactly right. The point is not "we got it wrong." The point is this: without counting, nobody knew which state we were in. If exclusion were ever needed, the plan would not exist, not because we decided against it, but because no one had checked where the exit lever actually lands on our pages. A company that has not counted is not "reviewing" its exclusion strategy; it simply does not have one.

So, for your own site: your numbers might be anything. But you cannot know them until you count, and the count takes minutes.

## The conditions under which this judgment would be wrong, and the next check for site operators

Every judgment like this needs a stated way to be proven wrong. Here is mine, in plain terms: **this judgment is wrong if Google updates its official documents to say that Google-Extended (or any other token in the robots rule file) removes a site from the AI features of Search. It is also wrong if Google publishes any official way to opt out other than the four snippet controls.** As of August 21, 2026, neither was on the official documentation surface, and the check I ran specifically confirmed that Google-Extended's section says only that it affects other systems, not search inclusion.

So what do you actually do next? It depends on which kind of site you run:

- **If you want to keep your site out** of AI answers: pick a sample of your pages (say, a dozen from your sitemap) and count how many pages actually carry a "don't summarize this page" tag. Write that list down and keep it as an inspection record. Also write into your team documents, with the quote above, that robots-file AI tokens do not affect search inclusion. Otherwise, someone will later mistake the robots file for protection.
- **If you want your site to appear more** in search and AI answers: just confirm that no blocking tags are attached to your pages, and that's all you need. Do not feel reassured or alarmed by AI-related tokens in the robots rule file, because Google says those have no effect on search exposure either way.

## What this article could not verify

A few things sit outside what was measured here. First, this run only checked the *documentation surface*. The screens inside Search Console may contain switches this article could not see, because checking them requires a logged-in session. Second, the support pages on Google's help domain were not measured at all, since those pages load through scripts and an absence there proves nothing. Third, the 12-page sample covers one site only, and the actual effect of snippet controls on AI Overviews citations was not tested. If you want to go further, the next steps are: check the Search Console screens for a preferred-source or opt-out switch. Repeat the page-tag count on your own deployment. And watch whether Google's documentation grows a dedicated exclusion page, which, per the falsifier above, would change the conclusion.

## References

1. [AI features / Google Search Central](https://developers.google.com/search/docs/appearance/ai-features) — Google
2. [Google-Extended / Google Search Central (google-common-crawlers)](https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers) — Google
3. [Preferred sources / Google Search Central](https://developers.google.com/search/docs/appearance/preferred-sources) — Google
4. [Personalize search and discover news with preferred sources / Google blog 발표문 (Aug 20, 2026)](https://blog.google/products-and-platforms/products/search/personalize-search-discover-news/) — Google