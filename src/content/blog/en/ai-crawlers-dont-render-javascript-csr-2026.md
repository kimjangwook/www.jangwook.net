---
title: AI Crawlers Don't Run Your JavaScript
description: >-
  GPTBot and ClaudeBot don't render JS. Here's a curl experiment proving
  client-side pages are invisible to AI search, plus how to fix it server-side.
pubDate: '2026-07-09'
heroImage: ../../../assets/blog/ai-crawlers-csr-invisible-2026-hero.png
tags:
  - geo
  - seo
  - ssr
  - ai-crawler
  - web-development
relatedPosts:
  - slug: localbusiness-structured-data-server-side-vs-js-2026
    score: 0.9
    reason:
      ko: "이 글에서 'JS로 주입한 JSON-LD는 AI 크롤러 눈에 사라진다'고 짚었는데, 그 서버사이드 vs JS 차이를 LocalBusiness 스키마로 실측한 글이다."
      ja: "本記事で触れた「JS注入のJSON-LDはAIクローラーから消える」を、LocalBusinessスキーマでサーバーサイドとJSを実測比較した記事。"
      en: "This post warns that JS-injected JSON-LD vanishes for AI crawlers; here the server-side vs JS gap is measured on a LocalBusiness schema."
      zh: "本文提到「JS注入的JSON-LD会在AI爬虫面前消失」，这篇用LocalBusiness结构化数据实测了服务端与JS注入的差别。"
  - slug: ai-crawler-control-robots-txt-llms-txt-2026
    score: 0.88
    reason:
      ko: "여기서 llms.txt를 CSR 해법으로 쓰지 말라고 했다면, AI 크롤러 허용·차단 정책 자체를 robots.txt로 어떻게 짜는지는 이 글에서 다룬다."
      ja: "ここでllms.txtをCSRの解決策にするなと書いたが、AIクローラーの許可・遮断ポリシー自体をrobots.txtでどう組むかはこの記事で扱う。"
      en: "If this post told you not to treat llms.txt as a CSR fix, this one covers how to actually shape AI-crawler allow/block policy with robots.txt."
      zh: "本文说别拿llms.txt当CSR的解药；这篇讲怎么用robots.txt真正制定AI爬虫的允许与拦截策略。"
  - slug: json-ld-graph-entity-linking-2026
    score: 0.85
    reason:
      ko: "구조화 데이터는 서버 응답에 있어야 의미 있다고 했는데, 그 JSON-LD를 @graph로 엔티티까지 연결하는 설계가 이 글에서 이어진다."
      ja: "構造化データはサーバー応答にあってこそ意味があると書いたが、そのJSON-LDを@graphでエンティティまでつなぐ設計はこの記事に続く。"
      en: "Structured data only pays off in the server response; this post extends that into wiring JSON-LD into an @graph entity model."
      zh: "结构化数据要在服务器响应里才有意义；这篇把JSON-LD进一步用@graph连成实体模型。"
  - slug: sitemap-lastmod-crawl-scheduling-2026
    score: 0.8
    reason:
      ko: "'크롤러가 실제로 무엇을 읽는가'라는 같은 질문을, 이번엔 sitemap에서 구글이 유일하게 신뢰하는 lastmod로 파고든 글이다."
      ja: "「クローラーが実際に何を読むか」という同じ問いを、今度はsitemapでGoogleが唯一信頼するlastmodで掘り下げた記事。"
      en: "Same question of what a crawler actually reads, this time drilling into lastmod, the one sitemap field Google genuinely trusts."
      zh: "同样是「爬虫到底读什么」这个问题，这篇钻研的是sitemap里Google唯一真正信赖的lastmod字段。"
  - slug: a11y-lighthouse-audit-fix-2026
    score: 0.72
    reason:
      ko: "같은 '샌드박스에서 직접 재현하고 실측한다' 방식으로, 이번엔 접근성 위반을 Lighthouse로 잡아 고친 기록이다."
      ja: "同じ「サンドボックスで再現して実測する」やり方で、今度はアクセシビリティ違反をLighthouseで捕まえて直した記録。"
      en: "Same 'reproduce in a sandbox and measure' approach, applied to catching and fixing accessibility violations with Lighthouse."
      zh: "同样是「在沙盒里复现并实测」的做法，这次是用Lighthouse抓出并修复无障碍问题的记录。"
---

Here's the short version: if your site renders its content in the browser with JavaScript, most AI crawlers can't see it. Not "see it late" or "see it partially." They fetch your raw HTML, pull the text, and leave. GPTBot, ClaudeBot, and PerplexityBot don't render your page, and they don't wait around for a second pass.

That matters more every month. People ask ChatGPT, search on Perplexity, and read Google's AI Overview before they ever hit a blue link. The crawlers that build those answers behave nothing like Googlebot. So the old comfort ("Googlebot handles JS fine, we're covered") quietly stops being true. I didn't want to just assert this, so I reproduced it in a sandbox with curl.

![What AI crawlers receive as raw HTML — CSR is an empty shell, SSR carries the content](../../../assets/blog/ai-crawlers-csr-invisible-2026-hero.png)

## Two meanings of "rendering," sorted out first

To read the rest of this cleanly, pin down where your content actually becomes HTML.

With <strong>server-side rendering (SSR)</strong> and static generation (SSG), the server sends finished HTML. Whether a browser or a crawler receives it, the response already contains `<h1>Business Name</h1>`, the address, and the body copy. With <strong>client-side rendering (CSR)</strong>, the server ships a near-empty shell (`<div id="app"></div>`) plus a JavaScript bundle. The real content gets filled in when the browser runs that JS. A typical React or Vue SPA works this way.

A human in a browser never notices the difference, because browsers execute JavaScript. The gap only shows up for a visitor that <strong>doesn't run JS</strong>. And the web now has a fast-growing population of exactly those visitors: AI crawlers.

## Don't put Googlebot and AI crawlers in the same box

This is where most people slip. Google's own docs (<a href="https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics">Understand JavaScript SEO Basics</a>) explain that Googlebot renders pages with a headless Chromium, executes the JavaScript, and indexes the rendered HTML. Google has long called dynamic rendering "a workaround and not a recommended solution," steering you toward SSR, SSG, or hydration instead (<a href="https://developers.google.com/search/docs/crawling-indexing/javascript/dynamic-rendering">Dynamic Rendering as a workaround</a>). In March 2026 they even removed the old warning about keeping pages functional without JavaScript. Google trusts its own renderer that much.

Reading that as "CSR is safe everywhere now" will burn you. Those docs are about <strong>Googlebot</strong>, not about AI crawlers. From what I've verified, and consistent with industry crawl-data analysis (Vercel, "The rise of the AI crawler"; reference, not official), GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot, and Bytespider don't render JS at all. One analysis of over 500 million GPTBot fetches reportedly found zero evidence of JavaScript execution (reference, not official). GPTBot may download JS files, but it doesn't run them.

There's one exception worth naming. Google Gemini leans on Googlebot's Web Rendering Service, so it can execute JavaScript. That means Google's AI Overviews might see a CSR page. ChatGPT, Claude, and Perplexity won't. So don't generalize "an AI read my SPA" from a single Google data point.

## One line of curl reproduces exactly what a crawler sees

Talk is cheap, so I measured it. The trick is simple: <strong>curl doesn't execute JavaScript.</strong> That makes it a faithful stand-in for a non-rendering AI crawler fetching your raw HTML off the server.

I built two versions of a fictional cafe site in a sandbox. Identical content. One CSR, one SSR.

```html
<!-- csr.html — content injected only on the client -->
<div id="app"><p>Loading…</p></div>
<script>
  fetch('/data.json').then(r => r.json()).then(d => {
    document.getElementById('app').innerHTML =
      '<h1>' + d.name + '</h1><p>' + d.tagline + '</p>' +
      '<address>' + d.address + '</address>' +
      '<p>Signature: ' + d.signature + '</p>';
  });
</script>
```

```html
<!-- ssr.html — the server response already carries the content -->
<main id="app">
  <h1>Aria Coffee Roasters</h1>
  <p>Single-origin specialty coffee, roasted in-house</p>
  <address>12 Somewhere-ro, Mapo-gu, Seoul</address>
  <p>Signature: Geisha hand-drip</p>
</main>
```

Then I fetched both while spoofing GPTBot. Changing the User-Agent is cosmetic here; curl wasn't going to run the JS anyway.

```bash
curl -A "GPTBot/1.2" http://127.0.0.1:8971/csr.html | grep -c "Geisha"
# → 0

curl -A "GPTBot/1.2" http://127.0.0.1:8971/ssr.html | grep -c "Geisha"
# → 1
```

The signature drink is exactly the detail that would get this cafe cited in an answer. It shows up <strong>zero times</strong> in the CSR response. Only the business name in the `<title>` survives; the body, address, and menu all vanish. Extract the readable text a crawler would keep, and the gap gets starker.

![Crawler-extracted text via curl — CSR yields 29 chars, SSR yields 107](../../../assets/blog/ai-crawlers-csr-invisible-2026-evidence.png)

From the CSR page, the crawler salvaged `"Aria Coffee Roasters Loading…"`. It kept 29 characters, loading spinner and all. The SSR page gave up 107 characters: name, description, address, signature menu, intact. Same content, same design, indistinguishable to a human. What the crawler reads is night and day.

## So which one is your site? A 30-second check

It sounds like someone else's problem until you check, and checking takes half a minute. Two ways.

First, look at the crawler's view straight from your terminal. Drop in your URL and a phrase that must be on the page.

```bash
curl -A "GPTBot" https://example.com/my-page | grep "your key phrase"
```

If that phrase isn't in the output, AI crawlers can't see it either. If only your title tag comes back and the body doesn't, you're leaning hard on CSR.

Second, disable JavaScript in DevTools and reload. In Chrome, open the command palette (Cmd+Shift+P) and run "Disable JavaScript." If the page goes blank or sticks on "Loading…," that's the screen GPTBot is looking at. This is the first thing I reach for when auditing a client site. No report needed; you can call it by eye.

## How to fix it, by framework

The fix isn't novel: <strong>put your core content in the server's HTML response.</strong> Where you touch it depends on your stack.

- <strong>Next.js</strong>: move data fetching to the server via App Router server components (RSC), `getServerSideProps`, or static generation. Don't fetch content only inside a `useEffect`.
- <strong>Nuxt</strong>: universal mode is the default. Confirm `ssr: true` is still on and that the component in question isn't wrapped in `<ClientOnly>`.
- <strong>Astro</strong>: static generation by default, so usually safe. Watch out for text that lives only inside a `client:only` island; it won't be in the initial HTML.
- <strong>SvelteKit / Angular</strong>: turn on server execution in SvelteKit's `load` functions, or Angular Universal (SSR) for Angular.

One pattern deserves special caution: injecting structured data (JSON-LD) or meta tags through a client script like Google Tag Manager. It looks fine to a human, but AI crawlers never run that script, so the JSON-LD disappears with it. I measured this trap in [why server-side beats JS for LocalBusiness structured data](/en/blog/en/localbusiness-structured-data-server-side-vs-js-2026/), and in the AI-crawler era that "server-side is more reliable" principle carries a lot more weight. Even a well-formed [JSON-LD @graph entity model](/en/blog/en/json-ld-graph-entity-linking-2026/) only pays off if it's in the server response.

If a full SSR migration feels heavy, hybrid is fine. Render the shell and the core text on the server, then hydrate only the interactive widgets on the client. There's a single test that matters: <strong>is the meaningful body text in the initial HTML?</strong>

Once you've fixed it, re-run the same curl command. Deploy pipelines skip prerender steps, CDNs cache a different response for bots, and specific routes quietly keep rendering client-side. I pick a few key landing pages and keep `curl -A "GPTBot" ... | grep` in the post-deploy checklist. One line catches the regression.

Worth adding: SSR helps Googlebot too. Googlebot does run JS, but it crawls and renders on separate queues. A CSR page goes through two stages (grab the HTML, then re-render later when rendering resources free up) that can delay when content lands in the index. Serve finished HTML and that render-queue wait disappears. AI crawler coverage is the goal; fresher indexing is the side benefit.

## The llms.txt "fix" is oversold

Raise this topic and someone always says, "so just drop an llms.txt, right?" I think selling llms.txt as the cure for a CSR problem points in the wrong direction.

llms.txt is a community proposal to hand crawlers a Markdown summary of your site's content. The idea isn't bad. The reality is the issue. Google has flatly said it doesn't support llms.txt and has no plans to (Search Central Live, July 2025, Gary Illyes), and John Mueller likened it to the keywords meta tag that search engines have ignored for over a decade. It's a file where the site owner asserts what the site is about, which makes it easy to game. No major AI service has officially confirmed using it during inference. Adoption sat around 10% in a 300,000-domain study, and roughly 97% of valid llms.txt files reportedly received zero requests during May 2026 (reference, not official).

The point: the root reason an AI crawler can't read you isn't a missing summary file — it's body content hidden behind JavaScript. An llms.txt paves a detour around the cause instead of removing it. How to control AI-crawler access in the first place is its own topic, which I covered in [controlling AI crawlers with robots.txt](/en/blog/en/ai-crawler-control-robots-txt-llms-txt-2026/), so use that for allow/block policy. But step one of "get cited" is always server-side visibility.

## Limits, stated honestly

Two things I want to be clear about.

First, this experiment reproduced a <strong>non-rendering fetch</strong> with curl; it didn't capture live GPTBot traffic. But the mechanism I reproduced, not executing JavaScript, is these crawlers' documented behavior, so the direction of the result holds.

Second, and more important: <strong>making your content visible with SSR does not guarantee a citation or a ranking.</strong> Visibility is necessary, not sufficient. Once a crawler can read you, content quality, trust, and structured data do the rest. It's the same reasoning behind Google's repeated line that structured data doesn't guarantee rankings. All this post promises is the first step: turning invisible into visible. What comes after is the content's job.

My takeaway is blunt. If you actually care about AI search, run `curl -A "GPTBot"` before you layer on any fancy GEO tactic. If your key phrase isn't in that output, every other optimization is being built on top of a blank page.

---

If you want structured data delivered reliably server-side, or a check on whether an existing SPA or headless setup is actually exposed to AI search and crawlers, I take on consulting and implementation work personally. The contact path on my profile is the easiest way to reach me.
