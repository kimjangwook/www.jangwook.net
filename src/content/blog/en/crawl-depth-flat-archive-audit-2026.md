---
title: 'I removed the archive pages and 296 posts became unreachable'
description: 'A breadth-first crawl of 1,330 built pages put 1,276 posts at depth 2. Dropping the four flat archives left 296 of them unreachable from the homepage.'
pubDate: '2026-07-30'
heroImage: '../../../assets/blog/crawl-depth-flat-archive-audit-2026/hero.png'
tags:
  - SEO
  - internal-linking
  - crawlability
  - information-architecture
  - web-development
faq:
  - question: 'Is crawl depth an actual Google ranking factor?'
    answer: 'There is no "click depth" item in anything Google publishes about ranking. The depth in this post is my own metric, defined as the minimum number of hops needed to reach a page from the homepage following links only. What official docs guarantee is much narrower: Google can crawl a link only when it is an a element with an href attribute. The claim that shallower depth lifts rankings has no official backing.'
  - question: 'If a URL is in sitemap.xml, does link reachability still matter?'
    answer: 'Discovery can happen through the sitemap, so "unreachable by links" is not the same as "not indexed." But a sitemap is just a list of URLs. It carries no information about what a page sits under, which topic cluster it belongs to, or what a reader should open next. Links are the only thing that expresses that context, so I treat the two as different jobs rather than backups for each other.'
  - question: 'My posts have plenty of related-post links. Is internal linking covered?'
    answer: 'My site was exactly that illusion. Median inbound links per post was 8, and not a single post had zero. Yet with the archive pages pulled out of the graph, 296 of 1,288 posts were unreachable from the homepage. A recommendation graph is directed, so you can end up with tightly linked clusters that no path from the root ever enters.'
  - question: 'Can I paginate the archive instead of listing everything?'
    answer: 'You can, as long as the link to the next page is a real a href. Google documents that you should link from each page to the following page with a href tags so search engines understand the relationship, and states that it no longer uses rel=next/prev. If subsequent pages exist only behind a load-more button or infinite scroll, everything past page one loses its link path.'
relatedPosts:
  - slug: ai-crawlers-dont-render-javascript-csr-2026
    score: 0.71
    reason:
      ko: 그 글은 크롤러가 JS를 실행하지 않을 때 본문이 비는 것을 쟀고, 이 글은 같은 조건에서 링크 경로가 끊기는 것을 잰다. 렌더 전 HTML이 전부라는 전제를 두 방향에서 확인한다.
      ja: あちらはJSを実行しないクローラーの前で本文が空になることを測り、こちらは同じ条件でリンク経路が切れることを測る。レンダリング前のHTMLだけが残るという前提を、二つの角度から確かめた記録だ。
      en: That post measures how the body empties out when a crawler skips JavaScript; this one measures how the link paths break under the same condition. Two angles on the same premise, that the pre-render HTML is all you get.
      zh: 那篇测量的是爬虫不执行JS时正文如何整块消失，本文测量的是同样条件下链接路径如何断裂。两个角度验证同一个前提：渲染之前的HTML就是全部。
  - slug: sitemap-lastmod-crawl-scheduling-2026
    score: 0.66
    reason:
      ko: sitemap의 lastmod가 재방문 시점의 신호라면, 크롤 깊이는 첫 도달 경로의 문제다. 사이트맵이 무엇을 대신할 수 없는지가 둘을 붙여 읽으면 분명해진다.
      ja: sitemapのlastmodが再訪のタイミングに関する信号なら、クロール深度は最初にたどり着く経路の問題だ。発見と再発見をそれぞれ扱うので、並べて読むとサイトマップが代替できない部分がはっきりする。
      en: If sitemap lastmod is a signal about when to come back, crawl depth is about how a crawler arrives the first time. Read together, they make clear what a sitemap cannot stand in for.
      zh: 如果sitemap的lastmod是关于"何时回访"的信号，抓取深度则关乎"第一次如何抵达"。一篇讲发现、一篇讲再发现，并读就能看清站点地图替代不了什么。
  - slug: hreflang-reciprocity-audit-multilingual-2026
    score: 0.58
    reason:
      ko: 4언어 사이트의 링크 관계를 빌드 산출물에서 전수 검사한다는 점이 같다. 그때는 언어판 상호 참조를 셌고, 이번에는 홈에서 각 글까지의 경로를 센다.
      ja: 4言語サイトのリンク関係をビルド成果物から全数検査する点が同じだ。あのときは言語版どうしの相互参照を数え、今回はホームから各記事までの経路を数えている。
      en: Same method, a full sweep over the build output of a four-language site. Last time I counted reciprocal references between language versions; this time I count the path from the homepage to every article.
      zh: 方法相同：对四语言站点的构建产物做全量检查。上次数的是语言版本之间的互相引用，这次数的是从首页到每篇文章的路径。
  - slug: recommendation-system-v3
    score: 0.54
    reason:
      ko: 도달성 검사에 걸린 대상이 바로 그 추천 시스템이 만든 링크 그래프다. 추천 품질과 크롤 도달은 다른 축이라는 것이 이번 실측으로 드러났다.
      ja: 本稿の到達性チェックに掛けた対象が、まさにあの推薦システムが生成したリンクグラフだ。推薦の質とクロール到達は別軸だと今回の実測が示している。
      en: The link graph put under the reachability test here is the one that recommendation system generates. This measurement shows recommendation quality and crawl reachability are separate axes.
      zh: 本文接受可达性检验的，正是那套推荐系统生成的链接图。这次实测说明推荐质量与抓取可达是两条不同的轴。
---

Every post on this site carries about eight inbound internal links. I took that as proof internal linking was healthy. The number guaranteed nothing.

The doubt showed up while I was digging through build output for yesterday's table-markup measurement. I had been counting internal links the wrong way. For years my only question was "how many links point at this post?" But a crawler doesn't spend link counts, it walks paths. Twenty inbound links mean nothing if all twenty come from posts the crawler can't reach from the homepage. From the root, that post has zero.

So I wrote a script that walks all 1,330 built HTML pages breadth-first, starting at `/`. Sixty lines, no browser. The answer came in two parts. My current structure is remarkably flat: 1,276 of 1,288 post pages sit at depth 2, nothing unreachable. Then I pulled four archive pages out of the link graph and 296 posts fell out of reach entirely. A recommendation graph with a median of eight inbound links per post did not save a single one of them.

## Depth counts paths, not links

Definitions first. Crawl depth here means the minimum number of hops from the homepage (`/`) to a page, following links only. The homepage is depth 0; anything linked directly from it is depth 1. It's a shortest path, and one breadth-first traversal computes it for every page at once.

Why does that beat inbound link count? Because link following is how search engines and AI crawlers discover a site in the first place, and the definition of "link" is narrower than most people assume. Google states it flatly:

> Google can only crawl your link if it's an `<a>` HTML element (also known as *anchor element*) with an `href` attribute.

([Links Google can crawl](https://developers.google.com/search/docs/crawling-indexing/links-crawlable), Google Search Central.) The same page draws the line around script-driven navigation too: "Google can't reliably extract URLs from `<a>` elements that don't have an `href` attribute or other tags that perform as links because of script events." Cards that navigate via a click handler, a `<div>` list wired to a router, a load-more button. On screen they look like links. In the link graph they don't exist.

What Google does *not* say is where depth becomes a problem. There's no published click-depth threshold, and no promise that link structure moves rankings. What the crawl budget guide gives you is the framing: "Google defines a site's crawl budget as the set of URLs that Google can and wants to crawl." That same guide then narrows its own audience: "If your site doesn't have a large number of pages that change rapidly, or if your pages seem to be crawled the same day that they are published, you don't need to read this guide." ([Large site owner's guide to managing your crawl budget](https://developers.google.com/search/docs/crawling-indexing/large-site-managing-crawl-budget))

My site is squarely in the "you don't need to read this" bucket. So I don't treat depth as a budget question. I use it for something simpler. **Does this post exist for a visitor who only follows links?** That visitor might be a person, might be Googlebot, might be an AI crawler that never executes JavaScript. I measured what survives for that last group in [what's left when AI crawlers don't render JavaScript](/en/blog/en/ai-crawlers-dont-render-javascript-csr-2026). Reachability only means anything on top of that premise.

## Sixty lines over the build output

I measured `dist/` from `npm run build`, not the dev server. Two reasons: it's byte-identical to what ships, and links that appear later via client-side JavaScript never get counted. Not counting them is the point.

The rules are deliberately conservative. Only `<a href>` counts as a link. Anchors carrying `rel="nofollow"` are skipped. Asset extensions (images, CSS, JS, feeds) are dropped, fragments and query strings are stripped, and absolute URLs survive only for my own domain.

```javascript
// Link extraction: <a href> only, nofollow excluded
const linksOf = (url) => {
  const html = readFileSync(pages.get(url), 'utf8');
  const out = new Set();
  for (const m of html.matchAll(/<a\b[^>]*?href\s*=\s*["']([^"']+)["'][^>]*>/gi)) {
    if (/\brel\s*=\s*["'][^"']*nofollow/i.test(m[0])) continue;
    const t = norm(m[1], url);          // normalize + drop asset extensions
    if (t && pages.has(t)) out.add(t);  // only pages that actually built
  }
  return out;
};

// Breadth-first from the homepage
const depth = new Map([['/', 0]]);
let q = ['/'], d = 0;
while (q.length) {
  const next = [];
  for (const u of q) for (const t of linksOf(u)) {
    inbound.set(t, (inbound.get(t) || 0) + 1);
    if (!depth.has(t)) { depth.set(t, d + 1); next.push(t); }
  }
  q = next; d++;
}
```

Parsing HTML with a regex is normally a bad habit. Here the audit target is one template set I wrote myself, where the shape of every anchor tag is predictable, so I left it. Auditing someone else's site, put a real parser in front.

## 1,276 posts at depth 2, nothing unreachable

The first run came back better than I expected.

| Metric | Value |
|---|---|
| Built HTML pages | 1,330 |
| Post pages (4 languages) | 1,288 |
| Max depth | 3 |
| Posts at depth 1 | 12 |
| Posts at depth 2 | 1,276 |
| Unreachable posts | 0 |
| Median inbound links per post | 8 |
| Posts with zero inbound links | 0 |
| Posts with 2 or fewer inbound links | 0 |

Five non-post pages never got visited: `/404/`, a separate app's landing page plus two of its subpages, and an ad-network ownership verification file. None of them belong in the link graph, so I left them alone.

The reason depth 2 dominates is obvious once you look at the structure. Homepage to the per-language archive (`/en/blog/`) is one hop; archive to any post is the second. The archive lists all 322 posts on a single page with no pagination, so a post from four years ago sits at exactly the same depth as yesterday's. That wasn't a plan. I built that list when the site had a few dozen posts and never touched it on the way to 300.

## Removing four pages cost me 296 posts

The interesting question wasn't the flat result. It was what produced it. Is the recommendation graph dense enough to carry the site, or is one archive page holding up everything? A median of eight inbound links per post makes the first story sound right.

So I re-ran the same traversal with the four per-language archive pages excluded from link harvesting. The pages still exist; the crawler just can't collect links from them. That's what actually happens when an archive turns client-rendered, moves behind a load-more button, or picks up a stray `noindex, nofollow`.

![Depth distribution of post pages reached from the homepage. With the flat archive hub in place, 1,276 posts cluster at depth 2; with the hub removed, depth spreads out to 9 and 296 posts become unreachable](../../../assets/blog/crawl-depth-flat-archive-audit-2026/depth-distribution.png)

| Condition | Max depth | Posts by depth | Unreachable |
|---|---|---|---|
| Current structure | 3 | 1: 12 / 2: 1,276 | 0 |
| Archive pages excluded | 9 | 1: 12 / 2: 52 / 3: 129 / 4: 253 / 5: 274 / 6: 154 / 7: 83 / 8: 25 / 9: 10 | **296** |
| Archive shows latest 10 only | 9 | 1: 12 / 2: 64 / 3: 121 / 4: 249 / 5: 274 / 6: 154 / 7: 83 / 8: 25 / 9: 10 | **296** |

296 posts. That's 23% of the site. On a site where every post has inbound links and the median is eight, dropping one page per language stranded nearly one post in four.

The cause is the shape of a recommendation graph. Related-post links are directed: A recommending B says nothing about B recommending A. And because recommendations are picked by similarity, similar posts clump together. You get clusters that point densely at each other while no arrow arrives from outside. A strongly connected island. Posts inside it can hold eight inbound links and still be unreachable from the root. **Inbound count is not a reachability metric.**

The third row is the one I'd tape to a wall. It simulates an archive that shows only the latest 10 posts, where page one is alive but the link to page two isn't an `<a href>`. Unreachable count: still 296. A live first page rescues nothing if there's no crawlable link to the pages behind it. This is precisely what Google asks for in its pagination guidance:

> To make sure search engines understand the relationship between pages of paginated content, include links from each page to the following page using `<a href>` tags.

([Pagination and incremental page loading](https://developers.google.com/search/docs/specialty/ecommerce/pagination-and-incremental-page-loading), Google Search Central.) The same document says of `rel="next"` and `rel="prev"`: "Google no longer uses these tags, although these links may still be used by other search engines." The mechanism that communicates the relationship is the anchor in your markup, not a hint in the head.

## What the flat archive costs: 670KB and 7,257 DOM nodes

So what's the bill for listing 322 posts on one page? I served the production build locally and measured it in Chrome.

| Metric | `/en/blog/` (archive) | One post page |
|---|---|---|
| Transferred bytes (gzip) | 86,431 | 24,168 |
| Decoded bytes | 670,699 | 83,719 |
| DOM nodes | 7,257 | 684 |
| Anchors | 349 (322 unique post links) | 45 |
| Images | 320 (319 with `loading="lazy"`) | not measured |
| DOMContentLoaded | 387ms | 423ms |
| loadEventEnd | 1,861ms | not measured |

655KB of raw HTML compresses to 84KB, because a list page is mostly repeated markup and gzip loves that. Across languages: ko 655.0KB (84.1KB gzipped), ja 659.7KB (85.1KB), zh 628.5KB (83.9KB), en 604.4KB (66.7KB). All four ship 349 anchors and 322 unique post links.

The 7,257 DOM nodes do bother me. That's more than ten times a post page. But the cushion is already in place: 319 of the 320 thumbnails carry `loading="lazy"`, so nothing outside the initial viewport gets requested. DOMContentLoaded came in at 387ms, faster than the post page's 423ms. Local serving with a warm cache means you shouldn't take those absolute numbers to production. What I can say is that under these conditions the archive showed no sign of being the slow page.

Here's my call. That bill is **local to one page, measurable, and bounded.** The damage from 296 posts losing their link path is neither local nor bounded, and nothing tells you when it heals. I'll pay the first one. What actually hurts on a page like this is layout stability and render cost rather than bytes, and reserving space up front (the approach in [dropping CLS from 0.559 to 0.014](/en/blog/en/cls-layout-shift-reserve-space-measure-2026)) keeps most of that under control.

## If you do paginate, here's the depth arithmetic

I ran the numbers ahead of time for the day I decide to split the list. 322 posts.

| Posts per page | Archive pages | Worst depth, next-link only | Worst depth, 5-slot numbered pager |
|---|---|---|---|
| 10 | 32 | 33 | 9 |
| 20 | 16 | 17 | 6 |
| 50 | 7 | 8 | 4 |
| 100 | 4 | 5 | 3 |
| 322 (current) | 1 | 2 | 2 |

"Next-link only" is the classic `1 → 2 → 3 → …` chain. Split ten per page and the oldest post lands at depth 33. Expose those same 32 pages through a numbered pager showing five slots and it drops to 9. Which means the pager UI directly sets the depth of your information architecture. The thing I filed under UI decisions turned out to be crawl-path design.

The practical rule falls out on its own: don't ship a next-only pager. Use a numbered one, or keep a separate index page that lists every post in one place. That second option is the old-fashioned HTML sitemap page, and unlike sitemap.xml a human can read it and a crawler can follow it as links.

## What this measurement doesn't say

Boundaries, stated plainly.

**Depth is my metric.** No official document says Google uses a particular depth as a threshold, and link structure guarantees no ranking. What the docs do guarantee stops at the shape of a crawlable link (`<a href>`) and the definition of crawl budget. Read my depth numbers as "how well does my structure explain itself using links alone," nothing more.

**Unreachable is not unindexable.** URLs in sitemap.xml can be discovered without any link path, so this isn't a claim that 296 posts are about to vanish. But a sitemap is a flat list of URLs and carries no context: what a page sits under, which cluster it belongs to, what comes next. Only links carry that. Supplementing discovery with a sitemap and expressing structure with links are not substitutes.

**Rows two and three are simulations.** I didn't observe Googlebot behavior. I removed specific edges from my own link graph and recomputed shortest paths. The proposition I verified is "if that archive stops emitting crawlable links, my graph loses 296 posts from the root" — nothing wider.

**Only static HTML was counted.** Client-inserted links never entered the calculation. That's the design, not a gap. The goal was to measure the graph a non-executing crawler sees.

**The median of eight is my site's number.** That graph came out of my own recommendation generator, so its shape is specific to me. Run this on your site and the numbers change. The method reproduces; the numbers don't.

## Wrap-up: measure links from the root, not by the count

The checklist I'm keeping. Any size of site, about thirty minutes.

1. **Measure the build output.** Not the dev server, not CMS data. Collect `<a href>` from the HTML you actually ship and run breadth-first from the homepage. Client-inserted links dropping out is correct behavior.
2. **Make unreachable count your KPI, not inbound count.** An audit that only flags zero-inbound orphans waves strongly connected islands straight through. Watch unreachable-from-root and the depth distribution instead.
3. **Run a hub-removal simulation once.** Pull each hub (archive, tags, categories) out of the graph one at a time and see how far unreachable count jumps. If removing one page strands hundreds of posts, that page is a single point of failure. Knowing that and keeping it is a different position from not knowing.
4. **Don't hide content behind load-more or infinite scroll.** Elements that navigate through script events are not crawlable links (Google, officially). If you want infinite scroll, ship the same list through an `<a href>` pager alongside it.
5. **Avoid next-only pagers.** Ten posts per page turns 322 posts into a worst-case depth of 33; the same page count through a numbered pager gives you 9. Depth is a consequence of a UI choice.
6. **Price the flat list instead of guessing.** Mine came in at 86KB transferred, 7,257 DOM nodes, 319 of 320 thumbnails lazy-loaded. I'll pay that. The point is to look at the numbers before deciding, rather than assuming "that must be heavy" and restructuring on a hunch.

So how many posts is your site currently losing? Turning that question into a number is what I do: information-architecture audits, internal-link redesign, crawler reachability measurement. If the answer interests you, the contact route on my [profile](/en/about) is open.

---

*Sources: Google Search Central's [Links Google can crawl](https://developers.google.com/search/docs/crawling-indexing/links-crawlable), [Pagination and incremental page loading](https://developers.google.com/search/docs/specialty/ecommerce/pagination-and-incremental-page-loading), and [Large site owner's guide to managing your crawl budget](https://developers.google.com/search/docs/crawling-indexing/large-site-managing-crawl-budget) (all official). Environment: 1,330 pages of my own Astro build output, breadth-first traversal via a Node 24 script, Chrome against a local preview of that build. The depth metric and the hub-removal results are numbers from this site, not Google's crawl model.*
