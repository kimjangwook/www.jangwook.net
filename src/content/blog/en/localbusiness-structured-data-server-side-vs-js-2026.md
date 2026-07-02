---
title: 'LocalBusiness Structured Data: Server-Side Beats JS Injection'
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
  - slug: multilingual-llm-token-tax-experiment
    score: 0.58
    reason:
      ko: 이 블로그 전체를 실측 대상으로 삼아 가설을 숫자로 검증한 글이다. 렌더링 방식을 curl로 직접 확인한 이 글과 "내 사이트에서 직접 재본다"는 접근이 같다.
      ja: このブログ全体を実測対象にして仮説を数字で検証した記事だ。レンダリング方式をcurlで直接確かめた本記事と「自分のサイトで直接測る」というアプローチが同じだ。
      en: That post used this very blog as a testbed and verified a hypothesis with numbers. It shares this article's approach of measuring things directly on my own site instead of trusting claims.
      zh: 那篇文章把整个博客当作实测对象，用数字验证假设。与本文用curl直接确认渲染方式一样，都是"在自己的网站上亲自测量"的思路。
  - slug: effiflow-automation-analysis-part1
    score: 0.55
    reason:
      ko: 메타데이터를 기계가 읽기 좋게 구조화하는 것이 시스템 효율을 어떻게 바꾸는지 다룬 사례다. 페이지 정보를 크롤러에게 명시적으로 전달하는 구조화 데이터 설계와 문제의식이 겹친다.
      ja: メタデータを機械が読みやすく構造化することがシステム効率をどう変えるかを扱った事例だ。ページ情報をクローラーへ明示的に届ける構造化データ設計と問題意識が重なる。
      en: A case study on how structuring metadata for machines changes a system's efficiency. The mindset overlaps with structured-data design, where page information is made explicit for crawlers.
      zh: 一个讲"为机器结构化元数据"如何改变系统效率的案例。与本文把页面信息明确传达给爬虫的结构化数据设计思路相通。
  - slug: llm-token-cost-data-format-experiment
    score: 0.52
    reason:
      ko: 같은 정보라도 어떤 포맷으로 기계에 전달하느냐에 따라 비용이 달라진다는 것을 실측한 글이다. JSON-LD라는 포맷 선택이 크롤러 인식을 좌우하는 이 글의 주제와 맞닿아 있다.
      ja: 同じ情報でもどのフォーマットで機械に渡すかによってコストが変わることを実測した記事だ。JSON-LDというフォーマット選択がクローラーの認識を左右する本記事のテーマと接している。
      en: That experiment measured how the format you feed machines changes the cost of the same information. It connects to this article's theme, where the choice of JSON-LD determines what crawlers actually see.
      zh: 那篇文章实测了同样的信息用不同格式喂给机器时成本的差异。这与本文"JSON-LD格式选择决定爬虫认知"的主题相通。
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
