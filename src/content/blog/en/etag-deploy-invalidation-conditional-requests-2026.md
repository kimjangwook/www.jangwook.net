---
title: 'Your Last Deploy Reset Every Cache Validator on the Site'
description: 'A post I have not edited since October reports Last-Modified as yesterday. Its ETag is just file mtime and size in hex, so one deploy voids every 304 the site could earn.'
pubDate: '2026-08-03'
heroImage: '../../../assets/blog/etag-deploy-invalidation-conditional-requests-2026/hero.png'
tags:
  - SEO
  - crawling
  - HTTP caching
  - static hosting
  - web development
faq:
  - question: 'Does returning more 304s improve search rankings?'
    answer: 'No Google document says that. The benefits the official caching post claims are narrow and concrete: your server does not have to generate the body, and it does not have to transfer it. Compute and bandwidth. The crawl budget guide frames 304 the same way, as saving bandwidth and resources. I did not measure any ranking effect and I have no way to measure one.'
  - question: 'Is an mtime-based ETag a violation of the HTTP spec?'
    answer: 'It is not. RFC 9110 section 8.8.3.1 lists, side by side, a collision-resistant hash of representation content, a combination of various file attributes, and a modification timestamp with sub-second resolution as valid ways to generate an entity tag. An mtime plus size value is the second of those. The problem is not conformance. It is that the value churns on every deploy, so revalidation never succeeds.'
  - question: 'Can I fix this on managed static hosting?'
    answer: 'It depends on whether you can touch origin response headers. If you run your own server or a CDN worker, emitting a content hash as the ETag settles it. On hosting like GitHub Pages, which exposes no header configuration, you cannot fix it at that layer. Your remaining option is a CDN in front that rewrites the headers. Before doing any of that, work out whether the cost is real at your scale.'
  - question: 'Why not just preserve file mtimes during deploy?'
    answer: 'At the transfer layer you can. rsync -a preserves mtimes, so unchanged files keep their validators. But if your CI checks the repo out fresh and builds, the build output gets stamped with that run time regardless. Preserving mtimes only works when every stage of the pipeline cooperates. A content hash works no matter what the pipeline does.'
relatedPosts:
  - slug: sitemap-lastmod-crawl-scheduling-2026
    score: 0.72
    reason:
      ko: sitemap의 lastmod가 "정확할 때만 쓰인다"면, 응답 헤더의 Last-Modified는 "정확하지 않아도 그냥 쓰인다". 같은 날짜 값이 두 계층에서 반대로 취급되는 이유를 붙여 읽으면 잡힌다.
      ja: sitemapのlastmodが「正確なときだけ使われる」なら、レスポンスヘッダーのLast-Modifiedは「不正確でもそのまま使われる」。同じ日付値が二つの層で逆に扱われる理由が、並べて読むと見えてくる。
      en: If a sitemap's lastmod is only used when it is accurate, the Last-Modified response header is used whether it is accurate or not. Reading both explains why the same date behaves in opposite ways at two layers.
      zh: 如果说 sitemap 的 lastmod「只有准确时才被采用」，响应头里的 Last-Modified 则是「不准确也照用」。把两篇并读，就能看清同一个日期值在两个层面为何被反向对待。
  - slug: internal-link-trailing-slash-redirect-audit-2026
    score: 0.68
    reason:
      ko: 그 글은 크롤러가 링크 절반에서 301을 받는 낭비를 셌고, 이 글은 받아온 본문을 통째로 다시 받는 낭비를 잰다. 둘 다 빌드 산출물은 멀쩡한데 배송 계층에서 새는 경우다.
      ja: あちらはクローラーがリンクの半分で301を受け取る無駄を数え、こちらは同じ本文をまるごと再取得する無駄を測る。どちらもビルド成果物は正しいのに、配信の層で漏れている。
      en: That audit counted the waste of crawlers hitting 301s on half the internal links; this one measures the waste of re-downloading bodies that never changed. Both are leaks in delivery, not in the build.
      zh: 那篇数的是爬虫在一半内部链接上吃到 301 的浪费，本文测的是把没变过的正文整份重下的浪费。两者的构建产物都没问题，漏在投递层。
  - slug: crawl-depth-flat-archive-audit-2026
    score: 0.61
    reason:
      ko: 크롤러가 페이지에 닿는 경로를 셌던 글이다. 이번 글은 그 크롤러가 두 번째로 왔을 때 무엇을 받아가는지를 센다. 첫 방문과 재방문을 각각 재보면 내부 링크와 캐시 헤더가 서로 다른 문제라는 게 분명해진다.
      ja: あちらはクローラーがページへ到達する経路を数えた。今回は同じクローラーが二度目に来たとき何を受け取るかを数える。初回訪問と再訪をそれぞれ測ると、内部リンクとキャッシュヘッダーが別問題だと分かる。
      en: That post counted how a crawler reaches a page. This one counts what it carries away on the second visit. Measuring first visit and revisit separately makes clear that internal links and cache headers are different problems.
      zh: 那篇数的是爬虫如何抵达页面，本文数的是它第二次到访时带走了什么。把首访与回访分开测，就能看出内部链接与缓存头是两个问题。
  - slug: ai-crawlers-dont-render-javascript-csr-2026
    score: 0.55
    reason:
      ko: 크롤러가 무엇을 실행하지 않는지를 쟀던 글과, 크롤러가 무엇을 다시 받아가는지를 재는 글이다. 서버가 내보낸 바이트만이 전부라는 같은 전제 위에 서 있다.
      ja: あちらはクローラーが何を実行しないかを測り、こちらは何を再取得するかを測る。サーバーが送ったバイトだけが全てだという同じ前提の上に立っている。
      en: One post measured what crawlers refuse to execute; this one measures what they fetch all over again. Both rest on the same premise, that the bytes the server sent are all there is.
      zh: 一篇测的是爬虫不执行什么，一篇测的是爬虫又重下了什么。二者立足于同一个前提：服务器发出的字节就是全部。
---

There's a post on this site from last October. I haven't touched the body since I published it. Yesterday, while checking something unrelated, I ran `curl -I` against it and the `Last-Modified` header came back stamped with yesterday's date.

Not a typo fix, not a metadata tweak. Nothing. So I poked at eight more URLs: a 2025 post, a post from this year, the terms page, a Chinese translation, `robots.txt`. Every one of them said `Sun, 02 Aug 2026 16:08:29 GMT`. Same second, across the whole sample. That timestamp isn't when any page changed. It's when I deployed.

That part is ordinary static hosting behavior. What makes it interesting is the other half. I rebuilt the site from the same source and compared hashes: all 1,346 HTML files came out <strong>byte-identical to the previous build</strong>. The content is perfectly reproducible. The cache validators attached to that content are brand new every single deploy. So when a crawler comes back holding the validator it saved yesterday, the server tells it the page changed. It didn't. Not by one byte.

## The validator identifies the deploy, not the file

Start with the raw headers on a post I haven't edited in nearly a year.

```bash
$ curl -sSI https://jangwook.net/ko/blog/ko/playwright-ai-testing/
HTTP/2 200
server: GitHub.com
last-modified: Sun, 02 Aug 2026 16:08:29 GMT
etag: "6a6f6b7d-3279e"
cache-control: max-age=600
content-length: 206750
```

Pull the ETag apart and its origin is obvious. Both sides of the hyphen are hex.

```text
0x6a6f6b7d = 1785686909  -> Sun, 02 Aug 2026 16:08:29 GMT  (identical to Last-Modified)
0x3279e    = 206750      -> identical to Content-Length
```

File mtime plus file size. That's the default ETag shape Apache and nginx have used for decades, and GitHub Pages emits the same thing. Which means the two validators on this site aren't two independent signals at all. <strong>They're one fact, the file's mtime, expressed twice.</strong> When one goes stale, the other goes with it.

Rather than eyeball a few pages, I wrote an audit script and checked it into the repo. It pulls real URLs out of the build output, collects the headers, then sends each validator straight back to see whether a conditional request lands.

```bash
$ node scripts/audit-cache-validators.mjs --n=8
base                 https://jangwook.net
urls sampled         8
sends a validator    8/8
304 on revalidate    8/8
cache-control        max-age=600
distinct Last-Modified values across the sample: 1  <-- one shared timestamp: this is a deploy stamp, not a content date
ETags shaped "<hex>-<hex>" (mtime+size): 8/8  <-- validators will reset on the next deploy
  304  W/"6a6f6b7d-1c3"        Sun, 02 Aug 2026 16:08:29 GMT  /deepdiner/
  304  W/"6a6f6b7d-10147"      Sun, 02 Aug 2026 16:08:29 GMT  /en/blog/en/hindsight-mcp-agent-memory-learning/
  304  W/"6a6f6b7d-7e2e"       Sun, 02 Aug 2026 16:08:29 GMT  /en/social/
  304  W/"6a6f6b7d-10803"      Sun, 02 Aug 2026 16:08:29 GMT  /ja/blog/ja/heterogeneous-llm-agent-fleet-cost-optimization/
  304  W/"6a6f6b7d-810b"       Sun, 02 Aug 2026 16:08:29 GMT  /ja/social/
  304  W/"6a6f6b7d-1191a"      Sun, 02 Aug 2026 16:08:29 GMT  /ko/blog/ko/hindsight-mcp-agent-memory-learning/
  304  W/"6a6f6b7d-7791"       Sun, 02 Aug 2026 16:08:29 GMT  /ko/terms/
  304  W/"6a6f6b7d-1e36c"      Sun, 02 Aug 2026 16:08:29 GMT  /zh/blog/zh/hono-typescript-api-2026/
```

One distinct `Last-Modified` across eight URLs. A 2025 English post and a terms page nobody has edited both claim the same second.

The run turned up a side detail worth knowing. Because `fetch()` sends `Accept-Encoding: gzip`, the ETag came back as a weak validator with a `W/` prefix. Skip compression and you get the strong form. Same URL, same file on disk, different validator strength depending on what got negotiated.

```bash
$ curl -sSI https://jangwook.net/deepdiner/ | grep -i etag
etag: "6a6f6b7d-1c3"
$ curl -sSI -H 'Accept-Encoding: gzip' https://jangwook.net/deepdiner/ | grep -iE 'etag|content-encoding'
etag: W/"6a6f6b7d-1c3"
content-encoding: gzip
```

`0x1c3` is 451, and 451 bytes is the uncompressed size of that file. The tag belongs to the compressed representation, but the value came from the original. `If-None-Match` uses weak comparison, so revalidation still works. Where it bites is anywhere a strong validator is required, such as `If-Range` on a range request.

## What a conditional request actually exchanges

The `304` lines above don't mean much if you've never wired this up yourself.

The first time a crawler or browser fetches a URL, it stores the `ETag` and `Last-Modified` values that came back as markers for that URL. On the next request for the same URL, it sends those markers along: the ETag goes in `If-None-Match`, the date goes in `If-Modified-Since`. The server compares them against what it would generate right now. If they match, it answers `304 Not Modified` with no body at all, and the client reuses its stored copy.

Google states plainly that its crawling infrastructure participates in this. From [Crawling December: HTTP caching](https://developers.google.com/search/blog/2024/12/crawling-december-caching), published December 9, 2024:

> Google's crawlers that support caching will send the `ETag` value returned for a previous crawl of that URL in the `If-None-Match header`. If the `ETag` value sent by the crawler matches the current value the server generated, your server should return an HTTP `304` (Not modified) status code with no HTTP body.

The empty body is the point. That same post ([source](https://developers.google.com/search/blog/2024/12/crawling-december-caching)) spells out why: your server skips the compute of generating content, and skips the transfer. It also picks a favorite between the two mechanisms.

> We strongly recommend using `ETag` because it's less prone to errors and mistakes (the value is not structured unlike the `Last-Modified` value).

And here's the sentence that this whole post hinges on ([source](https://developers.google.com/search/blog/2024/12/crawling-december-caching)):

> Our recommendation is that you require a cache refresh on significant changes to your content; if you only updated the copyright date at the bottom of your page, that's probably not significant.

Bumping the copyright year in your footer isn't worth invalidating a cache over. My site invalidates every cached page it has without changing so much as the copyright year. One deploy does it.

The size of the difference is easy to measure. Three requests against one URL:

```bash
$ curl -sS -o /dev/null -w 'code=%{http_code} down=%{size_download} header=%{size_header} t=%{time_total}\n' \
    https://jangwook.net/ko/blog/ko/playwright-ai-testing/
code=200 down=206750 header=660 t=0.133967

# sending back the ETag that is currently valid
code=304 down=0 header=365 t=0.041801

# sending If-Modified-Since with a date from before the deploy
code=200 down=206750 t=0.064747
```

206,750 bytes versus zero. Even counting headers it's 660 bytes against 365. One page, one revisit, 200 KB on the wire. Negotiate gzip and it drops to 30,246 bytes, which is still 30 KB more than nothing.

That third request is the whole story. A crawler holding a pre-deploy value gets the entire body resent even though the file on disk is identical.

## Identical bytes, redeployed, and the server says 200

You can't manufacture a "pre-deploy validator" against production on demand, so I reproduced the conditions in a throwaway sandbox. Two servers, identical in every respect except how they generate validators. One builds the ETag from mtime and size, the GitHub Pages and Apache approach. The other builds it from a SHA-256 of the file contents.

```js
// mtime mode: the validator comes from file attributes
const st = statSync(file);
const mtime = Math.floor(st.mtimeMs / 1000);
etag = `"${mtime.toString(16)}-${st.size.toString(16)}"`;

// content mode: the validator comes from the bytes
etag = `"${createHash('sha256').update(body).digest('hex').slice(0, 16)}"`;
```

Three steps. Fetch once and save the validators. Redeploy the file byte for byte, wiping the directory and copying from the source again. Then send a conditional request using what was saved. Here's the run log.

```text
===== validator mode: mtime =====
1) first crawl        -> ETag="6a703515-3279e"  Last-Modified=Mon, 03 Aug 2026 06:28:37 GMT
200 206750B first crawl (unconditional GET)
304 0B revisit, nothing deployed  [If-None-Match]
304 0B revisit, nothing deployed  [If-Modified-Since]
2) redeploy: same bytes, fresh checkout (sha256 unchanged)
   sha256 before/after: c3f104574859d427 / c3f104574859d427
   new ETag: "6a703519-3279e"
200 206750B after redeploy             [If-None-Match]
200 206750B after redeploy             [If-Modified-Since]
3) real edit: one byte appended
200 206766B after real edit            [If-None-Match]

===== validator mode: content =====
1) first crawl        -> ETag="c3f104574859d427"  Last-Modified=Mon, 03 Aug 2026 06:28:42 GMT
200 206750B first crawl (unconditional GET)
304 0B revisit, nothing deployed  [If-None-Match]
304 0B revisit, nothing deployed  [If-Modified-Since]
2) redeploy: same bytes, fresh checkout (sha256 unchanged)
   sha256 before/after: c3f104574859d427 / c3f104574859d427
   new ETag: "c3f104574859d427"
304 0B after redeploy             [If-None-Match]
304 0B after redeploy             [If-Modified-Since]
3) real edit: one byte appended
200 206766B after real edit            [If-None-Match]
```

In mtime mode the ETag went from `"6a703515-3279e"` to `"6a703519-3279e"`. The size half (`3279e`) held steady; only the timestamp moved, by four seconds. Those four seconds cost 206,750 bytes. The content-hash server kept `"c3f104574859d427"` through the redeploy and answered 304, then flipped to 200 the moment I appended a single byte. It invalidated exactly when invalidation was warranted, and never otherwise.

![Body bytes transferred on the next crawl after a byte-identical redeploy. The mtime validator resends 206,750 bytes; the content-hash validator sends zero.](../../../assets/blog/etag-deploy-invalidation-conditional-requests-2026/redeploy-bytes.png)

RFC 9110 permits both designs. [Section 8.8.3.1](https://www.rfc-editor.org/rfc/rfc9110.html#section-8.8.3.1) lists a collision-resistant hash of representation content, a combination of various file attributes, and a sub-second modification timestamp as equally legitimate ways to build an entity tag. So an mtime ETag breaks no rule. But [section 8.8.1](https://www.rfc-editor.org/rfc/rfc9110.html#section-8.8.1) adds a caveat:

> A strong validator might change for reasons other than a change to the representation data, such as when a semantically significant part of the representation metadata is changed (e.g., Content-Type), but it is in the best interests of the origin server to only change the value when it is necessary to invalidate the stored responses held by remote caches and authoring tools.

Changing for other reasons is allowed. Changing when nothing needs invalidating is against your own interest. The same section names the alternative outright: "A collision-resistant hash function applied to the representation data is also sufficient."

## Rebuilt from the same source, 1,346 files, zero differences

Switching to content hashes doesn't stabilize anything on its own. If your build emits slightly different HTML on every run, hashing the output just moves the churn somewhere else. Embedded timestamps, random IDs, unordered class lists. It happens constantly.

So I rebuilt without touching a single source file.

```bash
$ find dist -name '*.html' -print0 | xargs -0 shasum -a 256 | sort -k2 > before.txt
$ TEST_FLG=false npm run build     # real 85.30s
$ find dist -name '*.html' -print0 | xargs -0 shasum -a 256 | sort -k2 > after.txt

before=1346 after=1346
identical bytes : 1346 (100.0%)
changed bytes   : 0 (0.0%)
```

Every one of the 1,346 files matched. This build is fully deterministic, which means content-hash validators here would hold steady across a hundred deploys.

Put the two numbers next to each other and the argument is done. <strong>Content reproducibility: 100%. Deployed validator stability: 0%.</strong> A perfectly deterministic pipeline, handing its output to a delivery layer that issues fresh identity papers every time.

For scale: the site is 1,346 HTML files, 109.4 MB uncompressed, 26.4 MB at gzip -6. Per page that's 85,207 and 20,537 bytes. A full re-fetch moves all of it. Had every conditional request succeeded, the same sweep would have cost 365 bytes of response headers apiece, under half a megabyte total.

## What 5.25 deploys a day does to your hit rate

Knowing the validators reset doesn't tell you the damage. That depends on two intervals: how often a crawler comes back, and how often you deploy. For a revisit to earn a 304, <strong>no deploy can have happened since the previous fetch</strong>. So the success rate of conditional requests equals the probability of zero deploys inside the revisit window.

That's measurable. I took 30 days of commit history and collapsed commits within five minutes of each other into one deploy, since this repo builds and publishes through GitHub Actions on every push to main.

```text
commits: 178
deploys (5-min clustering): 154
span days: 29.3  -> 5.25 deploys/day
gap hours: median=2.75 mean=4.60 p10=0.17 p90=15.84 max=16.80
```

Median gap between deploys: 2 hours 45 minutes. Largest gap in the whole month: 16 hours 48 minutes. Not one full day went by without a deploy. Sliding a window across that timeline in ten-minute steps and counting how often it contains zero deploys gives this:

| Crawler revisit interval | Chance of no deploy in between | Conditional request outcome |
|---|---|---|
| 1 hour | 83.7% | mostly 304 |
| 3 hours | 60.9% | 304 slightly more often than not |
| 6 hours | 37.0% | mostly 200 |
| 12 hours | 12.0% | almost always 200 |
| 24 hours | 0.0% | always 200 |
| 72 hours | 0.0% | always 200 |
| 7 days | 0.0% | always 200 |

Past a day it's zero. Not rounded down to zero, but literally no such window exists anywhere in the observed month. On a site that publishes and deploys daily, a crawler returning to yesterday's page today fails revalidation 100% of the time, even for a page that hasn't changed in a year.

I got suspicious of this layer in the first place while auditing something else: [half my internal links were resolving through 301s](/en/blog/en/internal-link-trailing-slash-redirect-audit-2026). The build output was correct there too. The leak was in delivery. Same shape of problem. Polish the source all you like; if the value changes on the last hop, none of that precision reaches the other side.

## When this waste is actually worth fixing

Impressive percentages are not the same thing as an emergency.

Google's [crawl budget guide](https://developers.google.com/search/docs/crawling-indexing/large-site-managing-crawl-budget) is explicit about who should care: "Large sites (1 million+ unique pages) with content that changes moderately often (once a week)" and "Medium or larger sites (10,000+ unique pages) with very rapidly changing content (daily)". My site has 1,346 pages. It clears neither bar. What the same document promises for 304 is one sentence: "Support `304 (Not Modified)` HTTP status codes. If a page hasn't changed since Google last crawled it, returning a `304` code tells Google to reuse the cached version, saving your server bandwidth and resources." Bandwidth and resources. Not rankings.

The honest list:

- <strong>Rankings are not in play.</strong> No official source connects 304 rates to ranking. I didn't measure any effect, and I have no instrument that could.
- <strong>I did not observe real crawler behavior.</strong> GitHub Pages gives me no access logs. The probability table is conditional on a revisit interval; it is not an observation of how often Googlebot actually returns. On hosting with server logs, that assumption becomes a measurement.
- <strong>Whether AI crawlers send conditional requests is unverified.</strong> Without logs I can't separate behavior by user agent. I could confirm [that crawlers don't run your JavaScript](/en/blog/en/ai-crawlers-dont-render-javascript-csr-2026) purely from responses. Revalidation habits don't work that way.
- <strong>Nothing here is a spec violation.</strong> RFC 9110 8.8.3.1, quoted above, allows mtime-derived tags. The host isn't broken. The scheme just doesn't fit a site that deploys every day.
- <strong>Five-minute clustering is an approximation.</strong> The real deploy count could be somewhat lower or higher. The 0% result at 24 hours barely depends on it, because no calendar day in the window was deploy-free.

There's still a reason to know the number. GitHub Docs' [GitHub Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits) page states that "GitHub Pages sites have a soft bandwidth limit of 100 GB per month," so bandwidth is not free even when you aren't billed per gigabyte. And Google's caching post reports the share of fetches that could be served from cache: "10 years ago about 0.026% of the total fetches were cacheable, which is already not that impressive; today that number is 0.017%." The whole web is leaving this on the floor, and the trend is going the wrong way.

## Diagnosing your own host in three minutes

Three steps settle it.

<strong>Step 1. Check whether you send validators at all.</strong>

```bash
curl -sSI https://example.com/ | grep -iE 'etag|last-modified|cache-control'
```

Nothing in the output means conditional requests can't happen, full stop. That's the case with the most room to gain.

<strong>Step 2. Check whether the values come from content.</strong> Collect `Last-Modified` across several different URLs. If they all point at the same second, you're looking at a deploy stamp. If the ETag has the shape `"<hex>-<hex>"`, it probably came from mtime and size. The script in the repo makes both calls at once.

```bash
node scripts/audit-cache-validators.mjs --base=https://example.com --n=12
```

<strong>Step 3. Redeploy and watch the value.</strong> Ship a deploy that changes no content, then compare the ETag for the same URL before and after. If it moved, your host's validators track deploys rather than content.

What you do next depends on where you land.

| Situation | Verdict | Action |
|---|---|---|
| You control the origin (own server, CDN worker) | Fixable, and cheap | Generate the ETag from a content hash. Compute static asset hashes at build time and cache them |
| Managed static hosting, under 10k pages | Worth knowing, not worth rushing | Record the finding, revisit when the site grows |
| Managed static hosting, large or bandwidth-constrained | The hosting layer is the bottleneck | Put a header-rewriting CDN in front, or move hosts |
| You deploy over rsync yourself | Partially fixable | `rsync -a` preserves mtimes. Useless if CI rebuilds from scratch each run, since the output is stamped fresh anyway |

If you do control the origin, the code is short. Same thing the sandbox ran:

```js
import { createHash } from 'node:crypto';

// Compute once at build time and keep a path -> ETag map so you're not
// hashing on every request
const etagOf = (buf) => `"${createHash('sha256').update(buf).digest('hex').slice(0, 16)}"`;
```

One catch. `Last-Modified` needs the same treatment. Switch the ETag to a content hash but leave `Last-Modified` reading the file's mtime, and any client revalidating with `If-Modified-Since` still gets a 200 every time. Both values have to describe the same fact. In the sandbox I recorded the first time each content hash appeared and served that as `Last-Modified`, which is [the same idea I used to make sitemap lastmod trustworthy](/en/blog/en/sitemap-lastmod-crawl-scheduling-2026). Wherever a date value shows up, it should mean "when the content changed."

## Wrapping up: validators should describe content, not deploys

Five lines for what I measured today.

- This site's `ETag` is `hex(mtime)-hex(size)`, restating the same fact as `Last-Modified`. All eight sampled URLs shared one `Last-Modified` down to the second.
- A rebuild from unchanged source produced 1,346 byte-identical HTML files, 100% of them. The content reproduces; the validators don't.
- In the sandbox, a byte-identical redeploy made the mtime validator resend 206,750 bytes while the content-hash validator sent zero.
- At 5.25 deploys per day, any revisit interval longer than 24 hours has a 0% chance of earning a 304.
- None of this touches rankings. It's bandwidth and origin compute, and under 10k pages, awareness is enough.

As a checklist:

- [ ] Run `curl -sSI` and confirm `ETag`, `Last-Modified` and `Cache-Control` are present
- [ ] Check whether `Last-Modified` is identical across unrelated URLs (identical means deploy stamp)
- [ ] Deploy without content changes and see if the ETag moves
- [ ] If you own the origin, switch the ETag to a content hash and `Last-Modified` to a content-change date
- [ ] Verify your build is deterministic first (build twice, diff the hashes), or the content hash churns too

We pick hosting on price and deploy ergonomics. Nobody asks whether the response headers describe the content honestly. Asking that question first, and answering it with numbers, is the work I do. Contact details live on my [profile](/en/about/).

---

*Sources: Google Search Central, [Crawling December: HTTP caching](https://developers.google.com/search/blog/2024/12/crawling-december-caching) (December 9, 2024) and [Large site owner's guide to managing your crawl budget](https://developers.google.com/search/docs/crawling-indexing/large-site-managing-crawl-budget); IETF [RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html) sections 8.8.1 and 8.8.3.1; GitHub Docs, [GitHub Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits). All official. Measurement setup: live responses from jangwook.net (GitHub Pages) on August 3, 2026; own Astro build output of 1,346 HTML files; Node 22.22; curl 8.7; sandbox served from a local HTTP server on macOS. Deploy statistics come from 178 git commits over the last 29.3 days, clustered at five-minute intervals. Every figure describes this site on this host and is not a claim about how Google schedules crawling.*
