---
title: 'Catch Broken JSON-LD in CI Before It Ships'
description: 'A JSON-LD parser passes markup no search engine can read: schema.org sets @vocab, so typos and wrong casing expand into valid JSON-LD. A 60-line schema-aware validator catches them in CI, with real logs.'
pubDate: '2026-07-13'
heroImage: '../../../assets/blog/validate-structured-data-ci-jsonld-2026/hero.png'
tags:
  - structured-data
  - JSON-LD
  - CI
  - SEO
relatedPosts:
  - slug: structured-data-syntax-comparison-jsonld-microdata-rdfa-2026
    score: 0.78
    reason:
      ko: 그 글이 "어떤 문법으로 쓸까"를 정했다면, 이 글은 "그렇게 쓴 JSON-LD가 매 커밋마다 맞게 쓰였는지 어떻게 자동 확인할까"다.
      ja: あちらが「どの構文で書くか」を決めるなら、この記事は「そう書いたJSON-LDが毎コミット正しいかをどう自動確認するか」だ。
      en: That post picks the syntax; this one asks how you keep verifying, every commit, that the JSON-LD you wrote is actually correct. It's the operations step after the choice.
      zh: 那篇决定"用哪种语法写"，这篇问的是"你写的 JSON-LD 到底对不对，怎么每次提交都自动验证"。
  - slug: axe-core-ci-a11y-jsdom-vs-browser-2026
    score: 0.72
    reason:
      ko: 접근성을 CI에 넣었더니 color-contrast만 조용히 빠지던 그 이야기와 골격이 같다.
      ja: アクセシビリティをCIに入れたらcolor-contrastだけ静かに抜けた——あの話と骨格が同じ。
      en: Same skeleton as the a11y-in-CI story where color-contrast silently dropped out. You misread the green check until you know what the automated check doesn't cover.
      zh: 和"把无障碍放进 CI 后只有 color-contrast 悄悄消失"那篇骨架相同。
  - slug: json-ld-graph-entity-linking-2026
    score: 0.66
    reason:
      ko: 이 글의 검증기가 노드 단위로 타입과 속성을 본다면, 그 글은 그 노드들을 @graph 하나로 잇는 문제를 다룬다.
      ja: この記事の検証器がノード単位で型と属性を見るなら、あちらはそのノードを@graph一つに繋ぐ問題を扱う。
      en: This post's validator inspects types and properties node by node; that one handles wiring those nodes into a single @graph. Validation first, then connection.
      zh: 这篇的验证器逐节点检查类型和属性，那篇处理的是把这些节点连成一个 @graph。
  - slug: ai-crawlers-dont-render-javascript-csr-2026
    score: 0.6
    reason:
      ko: 검증을 통과한 JSON-LD도 JS로만 심으면 AI 크롤러 눈엔 없는 것과 같다.
      ja: 検証を通ったJSON-LDもJSでしか差し込まなければAIクローラーには存在しない。
      en: Even validated JSON-LD is invisible to AI crawlers if it's injected only by JS. This post asks "did you write it right"; that one asks "does it even ship."
      zh: 通过验证的 JSON-LD，若只用 JS 注入，在 AI 爬虫眼里等于不存在。
---

The structured-data check in your deploy pipeline is green. That green proves exactly one thing: your JSON-LD is <strong>well-formed</strong>. It does not prove Google can read a single field inside it. These are two different questions, and most teams treat them as one.

It clicked for me the day I watched a `@type` written as lowercase `article` sail through a parser without a peep. To a JSON-LD processor it's perfectly valid. To Google it's an unknown type, silently ignored. Nothing in between. No warning, no error, no red. You find out six months later, digging through Search Console to figure out why the rich result never showed.

## Validation has two layers

When people say they "validate" structured data, they're usually pointing at two different things.

The first is <strong>syntactic validation</strong>. Does this JSON-LD parse? Are the braces balanced, is there a `@context`, can a JSON-LD 1.1 processor expand it into a graph? A library like `jsonld` nails this every time.

The second is <strong>schema-semantic validation</strong>. Is the type name a real schema.org term, in the right casing? Are the property names free of typos? Is the date ISO 8601? Are URL fields absolute? Does the node carry the properties Google recommends for that type? The parser <strong>won't tell you any of that</strong>.

Here's the trap: the second can fail while the first passes without blinking. And Google's own validators, the Rich Results Test and the Schema Markup Validator (validator.schema.org), are both <strong>manual, browser-based tools</strong> where you paste a URL or a blob of code. Neither lives in your build. So unless a human opens one by hand, broken schema flows straight to production.

If you've already decided [which syntax to use among JSON-LD, Microdata, and RDFa](/en/blog/en/structured-data-syntax-comparison-jsonld-microdata-rdfa-2026/), the next question is this: who checks that the markup you write in that syntax is actually correct, on every commit?

## Why this gap costs more now

There was a time when silently broken structured data cost you, at most, a rich-result snippet. Not anymore. Search is shifting, and the crawlers that build AI overviews and generative answers lean harder on structured data to work out what a page means. Many of those crawlers [don't run your JavaScript; they grab the raw HTML and leave](/en/blog/en/ai-crawlers-dont-render-javascript-csr-2026/). The JSON-LD your server emits is nearly all they see.

So what happens when that JSON-LD carries a lowercase `article`? To a human the page looks fine, and the parser waves it through, but to the machine reading it, that's an unidentified node with no author and no publish date. The price of a single slip has grown from "you miss a snippet" to "an AI misreads your page." Catching it before deploy pays off more than it used to.

## Why the parser can't catch the typo

I didn't want to just assert this, so I reproduced it in a sandbox. Node v22, `jsonld` 8.x. I built a `broken.json` seeded with five everyday mistakes.

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "article",
      "headline": "Broken sample",
      "datePublished": "07/13/2026",
      "authour": "Kim Jangwook",
      "image": "hero.png"
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "name": "Blog", "item": "https://example.com/blog" }
      ]
    }
  ]
}
```

Lowercase `article`, the typo `authour`, a US-style date `07/13/2026`, a relative `hero.png`, and a `ListItem` missing `position`. Run that through `jsonld.expand()` and you can see which IRI the processor resolves each term to.

```text
$ node expand-demo.mjs

===== broken.json — jsonld.expand() =====
resolved @type IRIs : http://schema.org/article, http://schema.org/BreadcrumbList, ...
resolved term IRIs  : http://schema.org/article, http://schema.org/authour,
                      http://schema.org/datePublished, http://schema.org/headline, ...
```

This is the whole point. `article` expands to `http://schema.org/article`, and `authour` expands to `http://schema.org/authour`, <strong>cleanly</strong>. No error. No warning. Nothing dropped.

The reason is that schema.org's hosted JSON-LD context sets `@vocab` to `https://schema.org/`. When `@vocab` is present, the processor <strong>just concatenates</strong> any undefined string onto that prefix. It never checks whether a property called `authour` exists in schema.org. It manufactures a nonexistent IRI, and that is entirely legal JSON-LD. The parser inspects syntax, not vocabulary.

That's where the gap between "valid JSON-LD" and "readable by Google" opens up. The same gap runs through [wiring scattered blocks into one @graph](/en/blog/en/json-ld-graph-entity-linking-2026/): before you talk about connecting nodes, each node has to be written with a valid type and valid properties in the first place.

## A 60-line schema-aware validator

If the parser won't catch it, bolt on a check that knows the schema. It doesn't need to be elaborate. A slice of vocabulary for the types you care about, plus five rules.

```javascript
const VOCAB = {
  Article: {
    props: ['headline','datePublished','dateModified','author','image','description'],
    // Google lists NO required properties for Article (only recommended).
    // Enforcing headline is our team policy, not a Google rule.
    recommended: ['headline'],
    urlProps: ['image'], dateProps: ['datePublished','dateModified'],
  },
  BreadcrumbList: { props: ['itemListElement'], required: ['itemListElement'] },
  ListItem: { props: ['position','name','item'], required: ['position','name'], urlProps: ['item'] },
};
const KNOWN = Object.keys(VOCAB);
const ISO = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2})?([+-]\d{2}:\d{2}|Z)?)?$/;
const ABS = /^https?:\/\//;

function checkNode(node, errors) {
  let t = node['@type'];
  if (!KNOWN.includes(t)) {
    const near = KNOWN.find(k => k.toLowerCase() === String(t).toLowerCase());
    if (near) { errors.push(`@type "${t}" is wrong casing → "${near}"`); t = near; }
    else return;
  }
  const spec = VOCAB[t];
  for (const key of Object.keys(node)) {
    if (key.startsWith('@')) continue;
    if (!spec.props.includes(key)) {
      const near = spec.props.find(p => p.toLowerCase() === key.toLowerCase());
      errors.push(`${t}.${key}: not a valid property${near ? ` → "${near}"?` : ''}`);
    }
  }
  for (const r of (spec.required || [])) if (!(r in node)) errors.push(`${t}: missing required field "${r}"`);
  for (const d of (spec.dateProps || [])) if (node[d] && !ISO.test(node[d])) errors.push(`${t}.${d}: not ISO 8601`);
  for (const u of (spec.urlProps || [])) { const v = node[u]; if (v && !ABS.test(v)) errors.push(`${t}.${u}: not an absolute URL`); }
  // recurse into nested nodes and itemListElement
  for (const v of Object.values(node))
    (Array.isArray(v) ? v : [v]).forEach(x => x && typeof x === 'object' && x['@type'] && checkNode(x, errors));
}
```

Notice that when it hits a casing error, it doesn't throw and stop. It <strong>recovers to the correct type and keeps checking</strong>. That way you see both that `article` is wrong and that the same node has an `authour`, a bad date, and a relative URL, all in one pass. My first cut skipped that recovery, reported the one type error, and missed the other four. CI has to show everything at once, or you burn a round trip per fix.

Look closely at Article being tagged `recommended` rather than `required`. Per Google's own docs, <strong>Article has no required properties</strong>. `author`, `datePublished`, `dateModified`, `headline`, and `image` are all merely recommended. So enforcing headline is a call your team makes, not a rule Google imposes. That's exactly what a validator is for: encoding "the floor our org sets on top of Google's recommendations" as code.

## What the run actually produced

I fed `good.json` (a clean Article plus a two-step BreadcrumbList) and `broken.json` into the same validator.

![Real CI run log of the structured-data validator. good.json returns PASS with 0 problems; broken.json returns FAIL with 5 problems, catching the casing error, the property typo, the bad date, the relative URL, and the missing required field, then exits 1 to block the build](../../../assets/blog/validate-structured-data-ci-jsonld-2026/ci-run-log.png)

```text
===== good.json =====
PASS — 0 problems

===== broken.json =====
FAIL — 5 problems
  x @type "article" is wrong casing → "Article"
  x Article.authour: not a valid property → "author"
  x Article.datePublished: "07/13/2026" is not ISO 8601
  x Article.image: "hero.png" must be an absolute URL
  x ListItem: missing Google-required field "position"
process exit code = 1
```

All five caught, and the process ended on `broken.json` with <strong>exit 1</strong>. That exit code is the whole game. `good.json` exits 0. With that one line, CI blocks the build with no extra configuration.

Notice only the `ListItem` missing `position` is labeled "Google-required." That's accurate. A BreadcrumbList requires at least two ListItems, and each ListItem genuinely requires `position` and `name` (official). None of the four Article errors carry a "required" tag. The validator is speaking precisely, keeping Google's rules and your team's policy on separate lines.

## Wiring it into a CI gate

Since the exit code is already 1, the rest is plumbing. One script in `package.json`.

```json
{ "scripts": { "validate:schema": "node scripts/validate-schema.mjs" } }
```

And one step in a GitHub Actions job.

```yaml
- name: Validate structured data
  run: npm run validate:schema
```

If the validator fails, the job fails, and a PR carrying broken schema doesn't merge. To sweep the whole site, scrape every `<script type="application/ld+json">` block out of the built HTML and pipe each into the same `checkNode`. Same principle. It's the same skeleton as [putting accessibility checks in CI](/en/blog/en/axe-core-ci-a11y-jsdom-vs-browser-2026/): take the thing a human used to eyeball by hand and turn it into a deterministic gate that goes red on failure.

## What this validator can't do

The post is only honest if I draw the line clearly.

<strong>This is not a replacement for the Rich Results Test.</strong> It knows a hand-picked slice of vocabulary (Article, BreadcrumbList, ListItem, Person). For real coverage you'd generate the type and property lists from schema.org's public dump and fill `VOCAB` from that. What you saw here is a proof of concept, not a finished product.

<strong>Passing validation does not guarantee a rich result.</strong> That's not my opinion, it's Google's official stance. The General Structured Data Guidelines say it plainly: using structured data "enables a feature to be present, it does not guarantee that it will be present." Even with flawless markup, Google's algorithm may decide, based on the user, device, or location, that a plain text result is better. The same guidelines state that structured data "by itself is not a generic ranking factor." What the validator passes is "the shape is correct," not "a rich result will appear" and certainly not "your ranking will rise." Some types even lose their rich result eligibility outright. FAQPage did, and deleting the markup still wasn't the right move. I laid out that reasoning in [FAQ Rich Results Are Dead. Don't Delete the Q&A Markup](/en/blog/en/faqpage-deprecation-ai-citation-2026/).

<strong>Fields that point at the DOM instead of carrying a value slip right past this check.</strong> A value like `speakable`'s `cssSelector` names some part of the page, and as a string it is always well formed. Whether the selector matches nothing or matches thirteen places, the schema-aware check waves it through. I measured that particular kind of rot in The markup said 'read this aloud' and pointed at 13 paragraphs.

<strong>Expansion only sees syntax.</strong> As shown above, `@vocab` expands even a typo into a valid IRI. So don't mistake a successful expansion for validation. The two layers don't substitute for each other. Leave syntax to the parser and meaning to a schema-aware check.

## What to do today

- Paste your build's JSON-LD into the Rich Results Test once by hand to set a baseline. Then move that check into code.
- Start `VOCAB` with the types you actually use most (usually Article/BlogPosting, BreadcrumbList, Organization, WebSite). Don't try to fill everything; start with what you get wrong.
- Always check the four things a parser will never flag: casing, property typos, date format, and relative URLs.
- Label Google's "required" and your team's "policy" separately in code. Later, nobody wonders why a field is enforced.
- Bind exit code 1 to the CI step. A check that only prints a report and passes is a check nobody reads.

If you want structured data emitted reliably server-side, or an existing site's schema, accessibility, and crawler handling reviewed at the pipeline level, I take on consulting and implementation work personally. Reach me through the contact link on my profile. Looking behind the green check is the work I do.
