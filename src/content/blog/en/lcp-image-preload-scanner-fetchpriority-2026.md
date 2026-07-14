---
title: 'A 117KB hero with a 1.2s LCP: the browser found it too late'
description: 'Slow LCP is rarely about image weight — it is about when the browser discovers the image. I traced a CSS background hero going invisible to the preload scanner, then cut LCP from 1247ms to 109ms.'
pubDate: '2026-07-14'
heroImage: '../../../assets/blog/lcp-image-preload-scanner-fetchpriority-2026/hero.png'
tags:
  - Core Web Vitals
  - LCP
  - Web Performance
  - Rendering
relatedPosts:
  - slug: sitemap-lastmod-crawl-scheduling-2026
    score: 0.64
    reason:
      ko: 그 글은 크롤러가 sitemap의 어떤 필드를 읽고 무엇을 조용히 버리는지를 다뤘다. 이 글은 브라우저가 무엇을 일찍 발견하고 무엇을 늦게 그리는지를 다룬다. 둘 다 "당신이 내보낸 것을 상대가 언제 처리하는가"의 문제다.
      ja: あちらはクローラーがsitemapのどのフィールドを読み、何を静かに捨てるかの話。この記事はブラウザが何を早く発見し、何を遅れて描くかの話。どちらも「あなたが出したものを相手がいつ処理するか」だ。
      en: That post is about which sitemap fields a crawler reads and which it quietly discards. This one is about what the browser discovers early and paints late. Both ask the same thing, namely when the other side processes what you shipped.
      zh: 那篇讲爬虫读 sitemap 的哪些字段、又悄悄丢弃哪些。这篇讲浏览器早发现什么、晚绘制什么。两者问的是同一件事：你下发的东西，对方到底什么时候才处理。
  - slug: ai-crawlers-dont-render-javascript-csr-2026
    score: 0.68
    reason:
      ko: 렌더 차단 CSS가 페인트를 막는 이 글과 같은 뿌리다. 그쪽은 크롤러가 자바스크립트를 안 돌려 콘텐츠를 못 본다는 이야기고, 렌더링이 곧 가시성이라는 교훈이 겹친다.
      ja: レンダーブロッキングCSSがペイントを止める本記事と根が同じ。あちらはクローラーがJSを実行せずコンテンツを見られない話で、レンダリングこそ可視性という教訓が重なる。
      en: Same root as this render-blocking story. That post is about crawlers not running your JavaScript, and the lesson — rendering is visibility — carries straight over.
      zh: 与本文"渲染阻塞 CSS 拖住绘制"同源。那篇讲爬虫不执行 JS 就看不到内容，"渲染即可见性"的教训是相通的。
  - slug: a11y-lighthouse-audit-fix-2026
    score: 0.6
    reason:
      ko: 같은 Lighthouse·DevTools 계열 실측 워크플로우다. 접근성 점수를 눈으로 잡아 고쳤듯, 여기서는 LCP 분해를 눈으로 보고 병목을 하나씩 걷어낸다.
      ja: 同じLighthouse・DevTools系の実測ワークフロー。アクセシビリティのスコアを目で見て直したように、ここではLCP分解を見てボトルネックを一つずつ剥がす。
      en: The same Lighthouse/DevTools measure-then-fix workflow. Just as that post fixed a11y by reading the score, here we read the LCP breakdown and peel off bottlenecks one at a time.
      zh: 同属 Lighthouse / DevTools 的实测工作流。那篇靠读分数修无障碍，这篇靠读 LCP 分解逐个剥掉瓶颈。
---

I traced a single hero image. The file was a 117KB PNG, and it downloaded in 5 milliseconds on localhost. Yet the page's Largest Contentful Paint landed at 1,247 milliseconds. The image arrived in 5ms, but the largest element took 1.2 seconds to paint. So where did the other 1,242ms go?

The answer is not "the image is heavy." It is a question of *when* the browser started looking for that image. If you treat LCP purely as an image-weight problem, most of that 1.2 seconds stays out of reach forever. Today I shipped the same hero three different ways and used Chrome DevTools traces to break LCP apart, watching exactly where the bottleneck hides. Every table and log below is a real measurement from that sandbox.

## LCP is not one number — it is four segments

Groundwork first. LCP (Largest Contentful Paint) marks the moment the largest content element in the viewport — usually a hero image or a big heading block — gets painted. Google recommends this happen within **2.5 seconds** of the page starting to load ([Google Search Central, Core Web Vitals](https://developers.google.com/search/docs/appearance/core-web-vitals)). That threshold is the 75th percentile of real-user field data (CrUX).

Here is the part that matters. LCP looks like a single metric, but web.dev's [Optimize LCP](https://web.dev/articles/optimize-lcp) guide splits it into four sub-parts:

- **TTFB** — time to the server's first byte
- **Load delay** — time until the browser *discovers the LCP resource and starts the request*
- **Load duration** — time spent actually downloading that resource
- **Render delay** — time from finishing the download to painting it on screen

I love this four-segment model for a plain reason. "LCP is slow" is a symptom, not a diagnosis. You have to see which of the four is bloated before you can prescribe anything. And most slow heroes bleed time in **Load delay (discovery)**, not Load duration (download). Here is the proof.

## Measured: the hero shipped as a background image

The first version is a common pattern. I laid the hero down as a CSS `background-image` rather than an `<img>`.

```css
.hero {
  width: 100%;
  height: 600px;
  background-image: url("hero.png");
  background-size: cover;
}
```

```html
<link rel="stylesheet" href="style.css">
<div class="hero"></div>
```

The test rig: a local threaded HTTP server, `Cache-Control: no-store` on every response (so nothing gets reused), and a 1-second delay bolted onto the stylesheet. That delay simulates a real-world slow render-blocking CSS file. I captured a Chrome DevTools `performance` trace with a reload. The result:

```text
LCP: 1247 ms
  TTFB:          8 ms
  Load delay: 1184 ms   ← here
  Load duration: 5 ms
  Render delay:  51 ms
DevTools insight: "LCP request discovery" flagged
```

Load delay: 1,184ms. The image download took 5ms, but the browser spent 1.2 seconds just **discovering** it. Why? Because the hero URL is buried inside CSS.

One key concept here. Browsers run a **preload scanner**. When the HTML response bytes arrive, before the main parser even runs, this scanner skims the raw HTML and finds resources like `<img src>`, `<script src>`, and `<link href>` so it can kick off those requests early. The catch: the scanner only reads HTML. **A `background-image` URL sitting in CSS is invisible to it** ([web.dev, Don't fight the browser preload scanner](https://web.dev/preload-scanner/)). So a background image cannot even be requested until the CSS downloads and parses. My CSS carried a 1-second delay, so the hero got discovered exactly that late. Chrome itself called this out as an "LCP request discovery" insight ([LCP discovery, Chrome for Developers](https://developer.chrome.com/docs/performance/insights/lcp-discovery)).

This shares a root with the story about [AI crawlers not running your JavaScript and therefore never seeing your content](/en/blog/en/ai-crawlers-dont-render-javascript-csr-2026). Where and how a resource is placed decides when — or whether — it gets processed at all.

## I added fetchpriority and preload — and LCP barely moved

Second version. I switched the hero to a real `<img>`, added `fetchpriority="high"`, and put a preload hint in the `<head>`.

```html
<link rel="preload" as="image" href="hero.png" fetchpriority="high">
...
<img src="hero.png" alt="Product launch hero"
     width="1200" height="600" fetchpriority="high">
```

`fetchpriority="high"` is a hint that tells the browser to fetch this resource ahead of others, at high priority ([web.dev, Fetch Priority API](https://web.dev/articles/fetch-priority)). Why does it help? Before layout, the browser has no idea where an image will land on screen, so it assigns most images a low initial priority. The hero and a decorative footer icon get the same early treatment. `fetchpriority="high"` pulls exactly one of them — the hero — up by hand. Because it is now an `<img>`, the URL lives in the HTML, and the preload scanner spots it immediately. The measurement:

```text
LCP: 1226 ms
  TTFB:          3 ms
  Load delay:   37 ms   ← plunged from 1184 to 37
  Load duration: 2 ms
  Render delay: 1185 ms  ← this one swelled instead
```

Load delay collapsed from 1,184ms to 37ms. The discovery problem is completely solved. The image is fully received by 42ms into the navigation. And yet **LCP is still 1226ms**, basically unchanged. I will be honest: the first time I saw this I stopped for a second. If you speed up discovery 30x and the headline metric does not move, you missed something.

The bottleneck had moved. Now Render delay eats 1,185ms. The image is ready at 42ms, but **the browser cannot paint it** — the render-blocking stylesheet (my 1-second file) has not arrived. Chrome paints nothing until the CSS lands and it can produce a first paint. You are holding the image, but you cannot pick up the brush.

This is the whole point I want to land. **fetchpriority and preload are necessary, not sufficient.** They erase the discovery bottleneck. But if any of LCP's other three segments is swollen, pulling discovery earlier only moves the number by that much. Spray fetchpriority everywhere without reading the four segments, and it is easy to fool yourself into thinking things got better.

## Kill render-blocking too, and LCP goes 1247 → 109ms

Third version. I kept the `<img fetchpriority>` from before and removed the render-blocking CSS. I inlined only the critical CSS the hero needs to render into a `<style>` block, and loaded the rest of the stylesheet without blocking paint.

```html
<style>
  .herowrap{width:100%;height:600px;overflow:hidden}
  .herowrap img{width:100%;height:600px;object-fit:cover}
</style>
<link rel="stylesheet" href="style.css"
      media="print" onload="this.media='all'">
```

Setting `media="print"` keeps it from blocking screen render, then `onload` flips it to `all` so it actually applies. It is a well-worn non-blocking CSS pattern. The measurement:

```text
LCP: 109 ms
  TTFB:          5 ms
  Load delay:   43 ms
  Load duration: 1 ms
  Render delay:  60 ms
```

From 1,247ms to 109ms. All three segments settled into double digits. Discovery is fast (43ms), and nothing is blocking the paint (Render delay 60ms). Line the three versions up:

| Hero delivery | Load delay (discovery) | Render delay | LCP |
|---|---|---|---|
| CSS `background-image` | 1,184 ms | 51 ms | 1,247 ms |
| `<img fetchpriority>` + preload | 37 ms | 1,185 ms | 1,226 ms |
| + inline critical CSS (non-blocking) | 43 ms | 60 ms | **109 ms** |

Fix one number and the bottleneck ran sideways. Fix both bottlenecks and the metric finally caved. This table is the four-segment model earning its keep.

![Stacked bar chart of LCP breakdown per hero delivery strategy, measured with Chrome DevTools traces. background-image shows Load delay 1184ms, fetchpriority+preload shows Render delay 1185ms, inline critical CSS reaches LCP 109ms](../../../assets/blog/lcp-image-preload-scanner-fetchpriority-2026/lcp-breakdown.png)

## So here is what to do today (a checklist)

Translated into practice, the experiment says:

1. **Ship the hero as an HTML `<img>`, not a CSS background.** The preload scanner has to see it to discover it early. If the design truly demands a background, front-run discovery yourself with `<link rel="preload" as="image" href="..." fetchpriority="high">` ([web.dev preload-scanner](https://web.dev/preload-scanner/)).
2. **Put `fetchpriority="high"` on the LCP image.** Browsers often assign images a low initial priority. Raise the hero, and only the hero.
3. **Never put `loading="lazy"` on the LCP image.** Great for below-the-fold images, self-inflicted harm on a top-of-viewport hero — you are delaying your own discovery ([web.dev, LCP misconceptions](https://web.dev/blog/common-misconceptions-lcp)).
4. **Inline critical CSS and make the rest non-blocking.** Receiving the image early does nothing if render-blocking CSS still gates the paint.
5. **Always set `width`/`height` (or `aspect-ratio`).** It prevents layout shift (CLS). Across all three versions above, CLS was 0.00.
6. **Above all, read the LCP breakdown first.** The DevTools Performance panel hands you TTFB / Load delay / Load duration / Render delay directly. Attack the biggest segment. I dug into this measure-then-fix workflow in the post on [reading Lighthouse to catch and fix accessibility violations](/en/blog/en/a11y-lighthouse-audit-fix-2026).

## Honest limits — do not misread these numbers

My numbers are **lab figures**. Local server, no network throttling, CPU at 1x. Even the 1-second stylesheet delay is a value I injected on purpose to make the effect visible. So do not paste the "1247 → 109" ratio onto your own site. These numbers are a **demonstration of the mechanism**, not the absolute gain you should expect. What Google actually uses for ranking is CrUX field data from real users, and your gain depends on your page's real critical path.

The second limit matters more. **Landing LCP under 2.5s does not guarantee a ranking bump.** Google states plainly that "there's no single ranking signal," and that good page experience "doesn't override having great, relevant content" ([Google Search Central](https://developers.google.com/search/docs/appearance/core-web-vitals)). Core Web Vitals is one signal among many. I think the honest pitch for LCP work is "a UX job that reduces bounce," not "a ranking lever." A fast page is good because people do not leave, not because speed buys you a top spot.

Let me also log, honestly, the two traps that fooled me while reproducing this. I started with a single-threaded Python server, and the `fetchpriority` version discovered the image early yet LCP would not drop. While the server sat blocked serving the 1-second CSS, the early-discovered image request queued up behind it. A real HTTP/2 origin would have multiplexed both down at once; a server artifact was masking the real win. Only after switching to a threaded server did the numbers get honest. The second trap was caching. Without `no-store`, the browser pulled the previous run's CSS from disk cache, the 1-second delay vanished, and the entire "before" penalty evaporated. A good reminder to distrust the test rig before you trust the measurement.

Third: preload backfires when overused. Hand high priority to everything via preload and you starve the resources that actually matter, and depending on conditions you can even double-download an image. Spend preload sparingly, on the **single LCP element**.

One sentence sums it up. When LCP is slow, do not suspect image weight first — open the four segments and see when the browser discovers the element and when it paints it. The bottleneck usually hides in discovery and render-blocking, not download. I reached the same conclusion while auditing a multilingual blog and stripping out render-blocking resources in [this technical SEO audit log](/en/blog/en/multilingual-blog-technical-audit-campaign-2026).

---

*If you want structured data emitted reliably server-side, or an existing site's Core Web Vitals, accessibility, and crawler handling checked with real measurements, I take on consulting and implementation work personally. Reach me through the contact link on my profile.*
