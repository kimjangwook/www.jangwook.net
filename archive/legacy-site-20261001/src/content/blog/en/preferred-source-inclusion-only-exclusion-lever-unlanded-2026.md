---
'title': 'Google built a full guide for Preferred Source, its AI search feature, but left only one sentence for staying out'
'description': 'Google shipped a dedicated page and button code for the Preferred Source feature on August 20, 2026, while the way to keep a site out of AI answers sits in a single sentence of the developer docs. A count of our own 12 pages found that sentence''s controls on zero of them.'
pubDate: '2026-08-29'
heroImage: ../../../assets/blog/preferred-source-inclusion-only-exclusion-lever-unlanded-2026/hero.png
tags: [google-search, preferred-source, ai-mode]
---

On August 20, 2026, Google announced a new feature called Preferred Source. It lets readers pick your site as a favorite, and then your content gets a "preferred" badge inside Google's AI answers. The next morning, we went looking for the mirror image: how do you ask Google to leave your site *out* of those AI answers? What we found was a very lopsided pair of answers. The "get in" path had a full product page and ready-made button code. The "stay out" path was one sentence in a developer document. And when we counted our own pages, that sentence's controls were sitting on none of them. 0 out of 12.

## Three document surfaces updated on the same date

Google touched three separate "surfaces" (three places you would read about this) around the same date. The first is the announcement on Google's blog. The second is a dedicated developer document for Preferred Source on Google Search Central, which is Google's official instruction site for people who run websites. The third is our own deployed website, the pages our visitors actually see.

We compared all three. The blog announcement and the developer document had clearly been freshly built for the new feature. Our own site, meanwhile, had been quietly ignoring the whole "stay out" side without anyone deciding to. That gap between what Google documents loudly and what a site actually deploys is the subject of this piece, and it is the kind of gap any site owner can check the same way we did.

## A dedicated document and button code announcing Preferred Source

Think of Preferred Source like a storefront sign. Imagine a shopping street where the landlord offers every shop a big, beautiful welcome sign, already made and already hung, with instructions attached. That is what Google gave publishers. The blog post told publishers exactly where to go: "If you're a publisher, you can find the new \"Preferred Source\" button code in our Google Search Central documentation to get started."

> If you're a publisher, you can find the new "Preferred Source" button code in our Google Search Central documentation to get started.
> — [Personalize search and discover news with preferred sources](https://blog.google/products-and-platforms/products/search/personalize-search-discover-news/)

Google's own announcement mentioned "preferred source" 7 times in total. It pointed publishers to Search Central, not to Search Console. Search Console is Google's private dashboard for site owners, while Search Central is the public instruction manual. On Search Central, a dedicated page for Preferred Sources appeared among the navigation's 154 total paths, answering with a normal healthy page, marked as last updated 2026-08-20 UTC, the same day as the announcement.

For a site owner, this means the "get in" path needs no detective work. You read one page, copy button code, and you are in the conversation. The part that affects you is that your team can start implementing it the same afternoon.

## Sentences about staying out of AI search

Now the other side: staying out. The instruction for closing your door is one line, written by yourself, posted on your own shop window. Google has an official document about its AI features. It covers AI Overviews and AI Mode, the parts of Google that write generated answers. That document contains exactly one sentence on how to limit what your site shows there:

> To limit the information shown from your pages in Search, use nosnippet, data-nosnippet, max-snippet, or noindex controls.
> — [AI features / Google Search Central](https://developers.google.com/search/docs/appearance/ai-features)

That one sentence names four controls. Here is what each one is, in plain terms. *nosnippet* is a marker you place on your page telling Google to show no text preview from it. *data-nosnippet* is a finer version: it hides only a chosen part of the page, like covering one paragraph of a letter. *max-snippet* caps how many words of preview Google may show. *noindex* is the bluntest tool: it asks Google to leave the page out of search results entirely. Four tools, one sentence, and that sentence is the entire "stay out" instruction in the official docs.

To be fair with the counting: in the body of that document, each of these controls appeared exactly once. No more, no less. The words "opt out," "opt-out," and "exclude" appeared 0 times each. Google's announcement post used opt-out language only once, and that was about a newsletter signup, not about search. In other words, the asymmetry is not our impression; it is what falls out of counting the words on the pages.

<div class="lm-card lm-card--cell" data-lm-figure="explain-cell-docs-exclusion-lever-inventory" data-lang="en"><span class="lm-card__badge lm-card__badge--ok">pass</span><span class="lm-card__title">Official docs opt-out grammar survey</span><span class="lm-card__text">In the official docs body, the three grammars the document named were each caught once. The page-wide noindex marker and the Google-Extended marker also appeared once each. Preferred Source words were not caught in the body.</span><div class="lm-card__numbers"><span class="lm-card__chip">Whole-page exclusion 1</span><span class="lm-card__chip">Partial exclusion 1</span><span class="lm-card__chip">Snippet limit 1</span><span class="lm-card__chip">Preferred Source 0</span></div></div>

One plausible defense deserves a fair hearing. Maybe one sentence is the *right* thickness. The four controls are old, well-tested standards. Google treats AI Overviews and AI Mode as features built into Search itself, so controlling snippets is a consistent design choice: AI answers inherit search's existing rules. And an owner not using those markers is making a choice, not suffering from a missing method. That argument is internally correct. But it does not erase the numbers: inclusion received a dedicated page, button code, and an announcement dated the same day; exclusion received a four-token sentence, and, as we counted next, that sentence's markers had landed on none of our own 12 pages.

## The measurement procedure counting three document surfaces and our own 12 URLs

Here is how we measured, so you can copy it. It is mostly counting, the kind you could do with patience and a copy-paste habit, no special expertise required.

<div class="lm-card lm-card--how" data-lm-figure="explain-how" data-lang="en"><span class="lm-card__badge lm-card__badge--ok">pass</span><span class="lm-card__title">How we measured</span><ol class="lm-card__steps"><li class="lm-card__text">Step 1. Read the six cells three times each to make eighteen observations.</li><li class="lm-card__text">Step 2. Counted opt-in and opt-out words in the official docs and announcement.</li><li class="lm-card__text">Step 3. Included an unrelated document as a control to remove menu contamination.</li><li class="lm-card__text">Step 4. Checked grammar landing counts in our live-service HTML.</li><li class="lm-card__text">Step 5. Confirmed that all eighteen observations received normal pages.</li></ol></div>

In short: we fetched the document surfaces repeatedly (18 fetches across the six combinations) to make sure each count was not a fluke of one bad page load. We downloaded the official developer document, Google's blog announcement, and, as a control, an unrelated Google document, so that menu items and boilerplate could not inflate the counts. Then we took a decisive sample of our own site: 12 URLs drawn from our sitemap, the list of pages our site publicly declares.

Why a control document? For the same reason you taste plain rice before judging a whole meal. If the words you are counting also live in every page's navigation menu, you need to know how much comes from the menu rather than the body. Subtracting the control's counts gives you the true body count. The numbers above are those corrected ones.

## The landing result of the markers across our own 12 URLs

This is where it gets uncomfortable, for us and possibly for you. Of our 12 sampled pages, how many carried one of the four exclusion markers from that one official sentence? Zero. All 12 pages had no snippet-related markers in their page headers at all. The exclusion markers appeared on 0 out of 12 pages.

<div class="lm-card lm-card--cell" data-lm-figure="explain-cell-own-deployment-lever-landing" data-lang="en"><span class="lm-card__badge lm-card__badge--ok">pass</span><span class="lm-card__title">Our page landing check</span><span class="lm-card__text">None of the three grammars the document named had landed URLs in our live-service HTML. That is, the docs&#x27; opt-out grammar was not reflected on the page.</span><div class="lm-card__numbers"><div class="lm-card__bar"><div class="lm-card__bar-fill" style="--lm-bar-w:100.0%"></div><span class="lm-card__text">Valid runs 3/3</span></div><span class="lm-card__chip">Landing URLs 0</span></div></div>

Here is the part that stings. Our own deployment *does* use AI-related controls: we had switched on two lines telling Google-Extended not to use our content, plus one content-signal setting. Google-Extended is a marker that tells Google's other systems, like its Gemini models, not to train on or work with your content. It sounds like "blocking us from AI," and many site owners believe exactly that.

But Google's own documentation says directly: "Google-Extended does not impact a site's inclusion in Google Search nor is it used as a ranking signal in Google Search." In plain terms: the token that feels like an AI off-switch has no official effect on whether you appear in Google search, including its AI answer features. So a site can believe it has opted out of AI search while, by Google's own wording, it has not. We cannot tell whether someone chose this or simply never reviewed it. Either way, the record shows 0 of 12: we had no exclusion strategy, and we did not consciously reject one either.

## Checklist items for the two kinds of site operators

For the reader who wants to stay out of AI search: count for yourself, today. Take a sample of your pages. Check whether any snippet-limiting marker is present in each page's header. Then write down, plainly, that the Google-Extended token you may have switched on does not, per Google's own words, affect appearing in search. Do not let "we blocked the AI" survive as a belief that the official sentence does not support.

For the reader who wants to be more visible in AI search: the thin exclusion side is good news for you. The same-day dedicated page and button code mean getting in is easy. Your job is lighter: just confirm that your pages carry no snippet-limiting markers at all, because Google states there are no additional technical requirements beyond staying eligible for snippets. That one check is enough to keep your qualification intact.

Either way, the upshot for you is the same shape: Google builds the "show more" direction for you, documentation and buttons included, while the "show less" direction is one sentence of settings you must add to your own pages yourself. So the only honest question left is whether those settings are actually on your pages. Reading announcements cannot answer that for you.

<div class="lm-card lm-card--takeaway" data-lm-figure="explain-takeaway" data-lang="en"><span class="lm-card__title">Takeaway</span><p class="lm-card__takeaway">The official docs mentioned the opt-out grammar, but none of it was present on even one URL of our live pages.</p></div>

## What this article could not verify

We measured document surfaces on August 21, 2026, and one site's deployment (ours). We did not measure whether the exclusion markers actually change what AI Overviews cites. We also did not measure other sites' deployments. And we did not look at Google's private Search Console screens, since that requires a signed-in session. Next checks worth doing: re-fetch the official pages, since they can change, and run the same 12-URL header check yourself.

One condition under which this article's judgment would be wrong: if Google's official documentation ever states directly that the Google-Extended marker also controls whether a site appears in search's AI answer features, then this piece's conclusion collapses. In the three checks we ran, that statement did not appear.

## References

1. [AI features / Google Search Central](https://developers.google.com/search/docs/appearance/ai-features) — Google, fetched 2026-08-21
2. [AI features / Google Search Central (Google-Extended separation sentence)](https://developers.google.com/search/docs/appearance/ai-features) — Google, fetched 2026-08-21
3. [Google-Extended / Google Search Central (google-common-crawlers)](https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers) — Google, fetched 2026-08-21
4. [Preferred sources / Google Search Central](https://developers.google.com/search/docs/appearance/preferred-sources) — Google, fetched 2026-08-21
5. [Personalize search and discover news with preferred sources / Google blog (Aug 20, 2026)](https://blog.google/products-and-platforms/products/search/personalize-search-discover-news/) — Google, fetched 2026-08-21
6. [AI features / Google Search Central (snippet eligibility sentence)](https://developers.google.com/search/docs/appearance/ai-features) — Google, fetched 2026-08-21