---
title: "LocalBusiness Structured Data: JS Injection Works, but Server-Side Is Safer"
description: "Inject LocalBusiness JSON-LD with JavaScript and the raw HTML holds zero ld+json blocks. I compared it against server-side output, with Google's official stance and the ranking limits."
pubDate: '2026-07-01'
heroImage: '../../../assets/blog/localbusiness-structured-data-server-side-vs-js-2026/hero.png'
tags:
  - SEO
  - structured-data
  - MEO
  - JSON-LD
  - web-development
relatedPosts:
  - slug: llm-seo-aeo-practical-implementation
    score: 0.74
    reason:
      ko: SEO/AEO를 실무 로드맵으로 정리한 글이다. 이 글은 그 로드맵의 한 조각인 "구조화 데이터를 어떻게 확실히 크롤러에 전달하는가"를 코드 레벨로 파고든 셈이다.
      ja: SEO/AEOを実務ロードマップとして整理した記事だ。本記事はそのロードマップの一片である「構造化データをどう確実にクローラーへ届けるか」をコードレベルで掘り下げた形になる。
      en: That post lays out SEO/AEO as a practical roadmap. This one drills into one piece of it at the code level, on how to actually get structured data to the crawler reliably.
      zh: 那篇文章把SEO/AEO整理成实务路线图。本文则在代码层面深入其中一环——如何把结构化数据可靠地送达爬虫。
  - slug: astro-scheduled-publishing
    score: 0.6
    reason:
      ko: 정적 사이트가 빌드 시점에 HTML을 확정해 내보내는 구조를 다룬 글이다. 구조화 데이터를 서버사이드로 "미리 박아 두는" 이 글의 원리와 뿌리가 같다.
      ja: 静的サイトがビルド時にHTMLを確定して出力する仕組みを扱った記事だ。構造化データをサーバーサイドで「あらかじめ埋め込む」本記事の原理と根が同じだ。
      en: That post covers how a static site finalizes HTML at build time. It shares a root with this piece's idea of baking structured data into the server output ahead of time.
      zh: 那篇文章讲静态站点在构建时就确定并输出HTML。它与本文"预先把结构化数据写入服务端输出"的原理同源。
  - slug: metadata-based-recommendation-optimization
    score: 0.53
    reason:
      ko: 메타데이터를 어떻게 구조화해 다루느냐가 시스템 전체 효율을 바꾼 사례다. 페이지 메타를 기계가 읽기 좋게 명시한다는 점에서 구조화 데이터 설계와 문제의식이 겹친다.
      ja: メタデータをどう構造化して扱うかがシステム全体の効率を変えた事例だ。ページのメタを機械が読みやすく明示するという点で、構造化データ設計と問題意識が重なる。
      en: A case where how metadata is structured changed a whole system's efficiency. Making page meta explicit for machines overlaps with the mindset behind structured-data design.
      zh: 一个"如何组织元数据"改变整个系统效率的案例。让页面元信息对机器清晰可读，与结构化数据设计的思路相通。
faq:
  - question: "Can Google read structured data injected with JavaScript?"
    answer: "Yes. Google's docs state it processes JSON-LD dynamically injected into the DOM after rendering. But rendering is a resource-dependent second pass, so the block is absent from the raw HTML that the first crawl fetches. I built the same markup two ways and parsed only the raw HTML: server-side had one ld+json block, JS injection had zero."
  - question: "So is server-side always the right answer?"
    answer: "No. JS injection is not wrong and Google supports it. But for values like a store's name, address, and phone (NAP), where accuracy and consistency are the basis of trust, having the server emit them from the start is more defensive and predictable than betting on a successful render every time. Google itself notes dynamic markup can be less frequent and less reliable for fast-changing content."
  - question: "Does adding structured data improve search ranking?"
    answer: "It does not. Google's docs are clear that structured data only makes a page eligible for rich results; it guarantees neither the rich result nor a ranking boost. The real drivers of local ranking are Google Business Profile (GBP) operation, reviews, and category accuracy. Site markup only helps the crawler understand the page."
  - question: "How do I verify after deploying?"
    answer: "Use the Rich Results Test and Search Console's URL Inspection to check both the raw and the rendered HTML. With JS injection especially, confirm the ld+json actually appears in the rendered HTML. Then cross-check that the markup values match what's visible on the page and what's registered in GBP. A mismatch erodes trust instead of helping."
---

When developers build a store-finder page, structured data is the thing they leave for last and handle most carelessly. The map and the opening hours look right on screen, so it feels done. But whether your store surfaces properly in local search (Google Maps, the local pack) is decided not by the visible page but by the markup the crawler reads. And whether you paint that markup in later with JavaScript, or the server emits it from the start, makes a bigger difference than you'd expect.

First, let's clear up one misconception. "If you inject structured data with JS, Google can't read it" is wrong.

## Google's official stance: JS structured data is supported

Google says so explicitly. In the words of the official docs:

> "Google can read JSON-LD data when it is dynamically injected into the page's contents, such as by JavaScript code or embedded widgets."
> — Google Search Central, *Intro to Structured Data*

So even if you attach an `application/ld+json` block later with `document.createElement('script')`, Google reads it from the DOM after rendering. Taken this far, "JS is fine" holds. The question is when, and how reliably, it gets read.

## Hands-on check: what survives in the raw HTML

A crawler looks at a page twice. First it fetches the raw HTML as-is (first wave); when resources allow, it executes the JS with a headless Chromium and looks again (second wave). So whether the structured data is already present in the raw HTML at first-wave time is what makes the practical difference.

I built the same LocalBusiness markup two ways. One is static HTML emitted by the server; the other injects it at runtime with JS.

```html
<!-- (A) Server-side: present in the raw HTML as-is -->
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"LocalBusiness","name":"Clear Eyes Optical, Shibuya"}
</script>

<!-- (B) JS injection: absent from raw HTML, created only after execution -->
<script>
  const ld = document.createElement('script');
  ld.type = 'application/ld+json';
  ld.textContent = JSON.stringify({ "@type": "LocalBusiness", name: "Clear Eyes Optical, Shibuya" });
  document.head.appendChild(ld);
</script>
```

I parsed only the actual `<script type="application/ld+json">` blocks out of the raw, un-executed HTML.

```
[A] Server-side: 1 ld+json block, @type=['LocalBusiness']
[B] JS injection: 0 ld+json blocks, @type=[]
```

The server-side version already carries the block in the raw HTML the first wave fetches. The JS-injection version has zero blocks in the raw HTML. That block only appears in the DOM after the browser runs the JS. To the crawler, it's data that exists only once the second-wave render happens.

## Why this gap matters most for local

Google itself acknowledges the risk of dynamically generated markup. The guidance is framed for commerce, but the principle is the same.

> "dynamically-generated markup can make Shopping crawls less frequent and less reliable, which can be an issue for fast-changing content."
> — Google Search Central, *Generate Structured Data with JavaScript*

The render queue always depends on resources. If the second-wave render is delayed, or a third-party script fails to load mid-execution, that day's JSON-LD for that page is never generated at all. There's no reason to bet on a successful render every time for data like a store's name, address, and phone (NAP), where accuracy and consistency are the whole basis of trust. Server-side output carries no such dependency.

## The honest limit — structured data does not lift ranking

Here's the part you must not skip. Even if you emit structured data perfectly server-side, that alone will not raise your search ranking. Google's docs are clear that structured data only makes you eligible for a rich result; it guarantees neither the display nor a ranking boost. The real drivers of local ranking sit on the Google Business Profile (GBP) side: operation, reviews, category accuracy. Site markup only assists that effect.

One more thing. Structured data must faithfully reflect what's visible on the page.

> "don't add structured data about information that is not visible to the user, even if the information is accurate."
> — Google Search Central

If the address registered in GBP and the address in your page markup disagree, it doesn't help. It just chips away at trust.

## What you can do today

- Emit the store's NAP, coordinates, and URL statically from the server (route/template). Don't depend on JS injection.
- Match those values exactly with GBP. Don't include inconsistent, dummy, or unverified values (a placeholder social URL, for instance).
- Don't mark up information that isn't visible on the page.
- After deploying, verify both the raw and the rendered HTML with the Rich Results Test and URL Inspection. Don't stop at "I injected it with JS, it'll be fine."
- Don't promise a ranking effect. Hold the line that markup is an aid to the crawler's understanding.

To sum up: JS structured data is not a wrong method. But for data like local store info, where certainty is trust, emitting it from the server beforehand is more defensive and predictable than leaving it to the render queue.

---

If you want to emit a store-finder page's structured data reliably from the server, or have your existing site's local SEO and markup structure reviewed, I take on consulting and implementation work personally. Reach me through the contact on my jangwook.net profile.
