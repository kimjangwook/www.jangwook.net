---
title: 'Restaurant JSON-LD: Nobody Catches opens: "eleven"'
description: I added Restaurant structured data to my restaurant-discovery PWA, then fed the same three defects to three validation layers to measure which one catches what.
pubDate: '2026-07-22'
heroImage: ../../../assets/blog/restaurant-jsonld-opening-hours-validation-2026/hero.png
tags:
  - SEO
  - structured-data
  - local-seo
  - JSON-LD
  - TypeScript
relatedPosts:
  - slug: localbusiness-structured-data-server-side-vs-js-2026
    score: 0.81
    reason:
      ko: 저 글은 LocalBusiness JSON-LD를 어떤 경로로 내보낼 것인가(SSR vs JS 주입)를 쟀고, 이 글은 그 안에 무엇을 어떻게 담을 것인가를 다룬다. 전달과 내용, 두 글이 한 세트다.
      ja: あちらはLocalBusiness JSON-LDをどう届けるか(SSRかJS注入か)を測った記事で、本記事は中身をどう設計するかを扱う。配信と内容、二つで一組だ。
      en: That post measured how to deliver LocalBusiness JSON-LD (SSR vs JS injection); this one covers what to put inside it. Delivery and payload, two halves of the same problem.
      zh: 那篇文章测的是LocalBusiness JSON-LD该怎么输出（SSR还是JS注入），本文讲的是里面该装什么。传输与内容，两篇正好配成一套。
  - slug: json-ld-graph-entity-linking-2026
    score: 0.63
    reason:
      ko: 개별 페이지의 Restaurant 마크업을 완성했다면, 다음 단계는 사이트 전체의 JSON-LD 노드를 하나의 그래프로 잇는 일이다. 부유 노드가 어떻게 생기고 어떻게 잡는지를 실측했다.
      ja: 個別ページのRestaurantマークアップができたら、次はサイト全体のJSON-LDノードを一つのグラフに繋ぐ番だ。浮遊ノードの発生と検出を実測した記事。
      en: Once a single page's Restaurant markup is done, the next step is linking every JSON-LD node on the site into one graph. That post measured how orphan nodes appear and how to catch them.
      zh: 单页的Restaurant标记完成后，下一步是把全站JSON-LD节点连成一张图。那篇文章实测了游离节点如何产生、如何捕获。
  - slug: axe-core-ci-a11y-jsdom-vs-browser-2026
    score: 0.55
    reason:
      ko: 도구가 무엇을 잡고 무엇을 놓치는지를 계층별로 재서 CI 게이트를 설계한다는 접근이 이 글과 같다. 대상이 a11y 검사기라는 점만 다르다.
      ja: ツールが何を捕まえ何を見逃すかを層ごとに測り、CIゲートを設計するという発想が本記事と同じ。対象がa11yチェッカーである点だけが違う。
      en: Same approach as this article — measure what each tool layer catches and misses, then design the CI gate around the gaps. Only the subject differs, axe-core instead of schema validators.
      zh: 思路与本文一致：逐层测量工具能抓住什么、漏掉什么，再据此设计CI门禁。区别只在对象是a11y检查器。
---

Here's the validator output that started this whole article. I deliberately broke a Restaurant JSON-LD block and posted it to validator.schema.org:

```text
prop opens=eleven errors=[]   ← not a time, zero complaints
nodeProp adress → INVALID_PREDICATE (isSevere: true)
prop dayOfWeek=http://schema.org/Monday errors=[]  ← lowercase input, silently fixed
```

A property-name typo gets flagged as a severe error. The word "eleven" sitting where a time should be sails straight through. And a lowercase `"monday"` isn't an error or a pass; the validator just quietly rewrites it and shows you the corrected version. That asymmetry is what this post is about. Validating structured data isn't one gate, and the most damaging defect turned out to be the one no off-the-shelf layer checks.

## The grep that returned nothing

I build and run a PWA that recommends restaurants to travelers visiting Japan. SvelteKit, a map, multilingual listings. When I sat down to audit its structured data, I grepped the codebase for `ld+json` and got zero hits. A restaurant-discovery service with not a single line of Restaurant markup. I've spent months measuring other sites' structured data on this blog, so finding my own service empty was honestly embarrassing.

The internal data model stores opening hours like this:

```json
{"monday":"11:00-22:00","tuesday":"11:00-22:00","wednesday":"11:00-22:00",
 "thursday":"11:00-22:00","friday":"11:00-23:00","saturday":"11:00-23:00",
 "sunday":"11:00-21:00"}
```

Day keys, flat display strings. Perfectly fine for rendering a hours table. But it's a display format, not structured data. For a machine to answer "is this place open right now," it needs `opens` and `closes` as separate machine-readable values, and schema.org already defines that vocabulary. I suspect a lot of local-business sites start exactly here, because a display string is all you need on day one. The bill arrives later, when you have to convert those strings back into structure. I wanted to know precisely where that conversion bites, so I measured it on my own data.

## Groundwork: the openingHoursSpecification vocabulary

Before the code, the foundation. The primary source is [Google Search Central's LocalBusiness documentation](https://developers.google.com/search/docs/appearance/structured-data/local-business). Google reads LocalBusiness structured data as material for knowledge panels and business details in search results. The property table boils down to this:

| Level | Property | Notes |
|---|---|---|
| Required | `name`, `address` | Without these, you're not in the game |
| Recommended | `geo` | Coordinate precision of <strong>at least 5 decimal places</strong> |
| Recommended | `openingHoursSpecification` | Machine-readable hours |
| Recommended | `priceRange` | Ignored if 100 characters or longer |
| Recommended | `servesCuisine`, `url`, `telephone`, `menu` | For a restaurant, fill them all |

The official guideline says to use the most specific LocalBusiness subtype possible, and the example the docs reach for is `Restaurant`. Hours are expressed as `OpeningHoursSpecification` objects: days sharing the same hours go into one object with a `dayOfWeek` array, days that differ get their own objects. Late-night hours (open Saturday 18:00, close 03:00) live in a single object that crosses midnight. All-day is 00:00 to 23:59. A closed day sets both `opens` and `closes` to "00:00". Seasonal changes get a separate spec with `validFrom` and `validThrough`. Every one of these patterns has a worked example in the official doc.

One expectation to kill early: adding this markup will not move your map-pack ranking. I'll come back to that with official sources in the limits section.

## A converter from flat strings to schema

I wrote the converter in TypeScript, typed against Google's own [schema-dts](https://github.com/google/schema-dts) 2.0.0, which ships the entire schema.org vocabulary as TypeScript types. The core is about thirty lines:

```typescript
import type { OpeningHoursSpecification, DayOfWeek } from "schema-dts";

const DAY_MAP: Record<string, DayOfWeek> = {
  monday: "Monday", tuesday: "Tuesday", wednesday: "Wednesday",
  thursday: "Thursday", friday: "Friday", saturday: "Saturday", sunday: "Sunday",
};
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export function toOpeningHours(raw: string): OpeningHoursSpecification[] {
  const parsed: Record<string, string> = JSON.parse(raw);
  const groups = new Map<string, DayOfWeek[]>();
  for (const [day, hours] of Object.entries(parsed)) {
    const dow = DAY_MAP[day.toLowerCase()];
    if (!dow) throw new Error(`unknown day key: ${day}`);
    // split-shift hours like "11:00-14:00,17:00-22:00" become separate specs
    const ranges = hours.trim().toLowerCase() === "closed"
      ? ["00:00-00:00"] : hours.split(",");
    for (const range of ranges) {
      const key = range.trim();
      (groups.get(key) ?? groups.set(key, []).get(key)!).push(dow);
    }
  }
  return [...groups.entries()].map(([hours, days]) => {
    const [opens, closes] = hours.split("-").map(s => s.trim());
    if (!TIME_RE.test(opens) || !TIME_RE.test(closes))
      throw new Error(`unparseable hours "${hours}"`);
    return { "@type": "OpeningHoursSpecification" as const,
      dayOfWeek: days.length === 1 ? days[0] : days, opens, closes };
  });
}
```

Fed the real stored data, seven days collapsed into three objects: Monday through Thursday 11:00-22:00, Friday and Saturday 11:00-23:00, Sunday 11:00-21:00. Same grouping style as the Google examples. Combined with name, address, and geo, the final markup looks like this:

```json
{
  "@context": "https://schema.org",
  "@type": "Restaurant",
  "name": "新宿ラーメン通り",
  "alternateName": "Shinjuku Ramen Street",
  "address": { "@type": "PostalAddress", "streetAddress": "東京都新宿区西新宿1-1-1",
               "addressLocality": "新宿区", "addressRegion": "東京都", "addressCountry": "JP" },
  "geo": { "@type": "GeoCoordinates", "latitude": 35.6919, "longitude": 139.7038 },
  "servesCuisine": "Ramen",
  "priceRange": "$$",
  "url": "https://example.com/restaurants/mock-1",
  "openingHoursSpecification": [
    { "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday"], "opens": "11:00", "closes": "22:00" },
    { "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Friday","Saturday"], "opens": "11:00", "closes": "23:00" },
    { "@type": "OpeningHoursSpecification", "dayOfWeek": "Sunday", "opens": "11:00", "closes": "21:00" }
  ]
}
```

The service is multilingual, so I had to pick a naming policy: the local script (Japanese shop name) goes in `name`, the romanized form in `alternateName`. Local search and maps match against the local script, not the transliteration. The full block came back from the schema.org validator with zero errors and zero warnings.

Delivery is server-side, no debate. In SvelteKit that means running the converter in the page's server load and serializing into `svelte:head`, escaping `<` as `\u003c` so a stray character in a shop name can't break out of the script tag. Why not inject client-side? [I measured that earlier](/en/blog/en/localbusiness-structured-data-server-side-vs-js-2026/): structured data that isn't in the raw HTML simply doesn't exist for any collector that skips rendering.

## What the model can't say: split shifts, last order, coordinate precision

The first converter version threw on `"11:00-14:00,17:00-22:00"`, a lunch-and-dinner split shift. My first assumption was a schema limitation. Wrong. Schema.org handles split shifts cleanly with <strong>two OpeningHoursSpecification objects on the same day</strong>: one for Monday 11:00-14:00, another for Monday 17:00-22:00. The thing that couldn't express a split shift was my own "one string per day" internal model. Version two splits on commas and moves on.

Some things genuinely have no home in the schema, though. Japanese restaurant listings almost always carry a last-order time, "L.O. 21:30". There is no last-order property anywhere in schema.org's hours vocabulary, and Google's docs don't address it. Information stuffed into the string like `"11:00-22:00 (L.O. 21:30)"` either gets dropped at conversion or stays display-only. I chose display-only: the markup carries the true 22:00 close, and last order lives in the visible UI and `description`. Bending `closes` to 21:30 would be markup that lies about the facts, so that option was out.

Seasonal changes are the mirror image: the schema is ready, my model has no slot for them. The official pattern for a year-end closure is compact:

```json
{ "@type": "OpeningHoursSpecification",
  "opens": "00:00", "closes": "00:00",
  "validFrom": "2026-12-30", "validThrough": "2027-01-03" }
```

Regular specs stay untouched; this object just layers on top. Considerably more flexible than my flat strings. Adding a temporary-closure table to the data model is now on my list.

Coordinates tripped me too. Google recommends at least 5 decimal places for `geo`, and every coordinate in my dataset had 4. Four decimals is roughly 11 meters; five is about 1.1. In a Tokyo alley, 11 meters is the building next door. The converter now flags any 4-decimal coordinate. The uncomfortable part: precision is fixed at geocoding time. If collection doesn't enforce 5 decimals, no markup-stage fix exists.

## Same three defects, three layers

Now the core experiment. I had three validation layers available: compile-time type checking via schema-dts, the schema.org validator, and the runtime regex gate inside the converter. Worth knowing: the validator works headlessly. POST the HTML and you get JSON back, which makes it CI-friendly:

```bash
curl -s -X POST "https://validator.schema.org/validate" \
  --data-urlencode "html@dist/restaurants/mock-1/index.html"
# strip the leading )]}' and tripleGroups[].nodes[] holds
# per-property errors plus numErrors/numWarnings
```

I planted the same three defects and pushed them through each layer.

![Validation matrix — which layer catches which defect](../../../assets/blog/restaurant-jsonld-opening-hours-validation-2026/validation-matrix.png)

| Injected defect | tsc --strict + schema-dts | validator.schema.org | Who saves you |
|---|---|---|---|
| `dayOfWeek: "monday"` (lowercase) | <strong>TS2820</strong>: Did you mean "Monday"? | No error, silently normalized to `schema.org/Monday` | Type check |
| `"adress"` (property typo) | <strong>TS2561</strong>: Did you mean 'address'? | <strong>INVALID_PREDICATE</strong> (severe) | Both |
| `opens: "eleven"` | Passes (Time is just a string alias) | Passes (zero errors) | <strong>Nobody</strong> |

Three rows, three different lessons.

The lowercase day is exactly the mistake my data invites, since everything is stored as `"monday"`. Only the type check stopped it at compile time. The validator doesn't error; it normalizes and displays the fixed value. That looks helpful, but I decided not to trust it. The normalization is the validator's implementation detail, and I found no documented guarantee that Google's actual ingestion pipeline extends the same generosity. Emitting the documented `"Monday"` form is the safe move.

The property typo gets caught by both layers, each with a helpful "did you mean address" suggestion. Cheap to fix, as expected.

The third row is the problem. A value that isn't a time at all clears every layer. In schema-dts, `Time` is ultimately an alias for string, so the compiler has nothing to say. The validator doesn't check value formats. The single most damaging defect an hours markup can have (a time that isn't a time) is the one that travels furthest. Which means the `TIME_RE` regex in my converter isn't decoration; it's the <strong>only line of defense</strong>. Remove it and "eleven" compiles, validates, and ships to production HTML.

The shape of this finding matches what I saw [comparing axe-core under jsdom and a real browser](/en/blog/en/axe-core-ci-a11y-jsdom-vs-browser-2026/): every tool catches a different slice, the gaps only show up when you measure, and the gaps you find need custom gates wired into CI.

## Honest limits: this markup won't move your local ranking

Let's cut expectations down to documented size. First, Google's own line: "Google does not guarantee that features that consume structured data will show up in search results." Structured data makes you eligible for rich results; it doesn't entitle you. Second, on local pack rankings the picture is starker. [Google Business Profile's official page on local ranking](https://support.google.com/business/answer/7091) names three factors: relevance, distance, prominence. The phrase "structured data" <strong>does not appear on that page at all</strong>. The local pack battle is fought with profile completeness and reviews, not with your website's JSON-LD.

So why bother? My take: Restaurant markup isn't a ranking lever, it's <strong>machine readability for the website's side of the story</strong>. It feeds knowledge panels and hours displays in regular search, and now that crawlers aren't the only readers, it's also the substrate AI search engines pull business facts from. When someone asks an AI assistant "is this place open Sunday," I'd rather be the page with machine-readable opens/closes than the page with a display string. That last sentence is a judgment call, not a measurement; the effect on AI answer citations is a separate experiment I haven't run yet, and I'm flagging it as such.

One more limit for the record: this pipeline covered schema-dts type checking and the validator's POST API. Google's Rich Results Test needs a browser UI and didn't fit this headless run, so the official pre-launch check still goes through [the Rich Results Test](https://search.google.com/test/rich-results) by hand.

## Pre-ship gate: the hours-markup checklist

The list this experiment settled into. It applies to any brick-and-mortar business, not just restaurants.

- [ ] Use the most specific type available (`Restaurant`, not bare `LocalBusiness`) — official guideline
- [ ] Store hours internally as separated opens/closes structure, not display strings
- [ ] Group same-hours days into a `dayOfWeek` array; split shifts get two specs on the same day
- [ ] Closed days: opens=closes="00:00". Overnight hours cross midnight in one object. Temporary changes use `validFrom`/`validThrough`
- [ ] Never bend `closes` to encode last-order time; keep schema-less info out of the markup
- [ ] `geo` needs 5+ decimal places, and only collection-time enforcement can guarantee that
- [ ] Type-check with schema-dts (catches day and property typos); time formats need <strong>your own regex gate</strong>, because no existing layer checks them
- [ ] Wire the validator.schema.org POST API into CI for structural errors; finish with the Rich Results Test

Wrong structured data is worse than none. If bad hours surface in search results, the customer who shows up to a closed door blames the page that told them otherwise. Knowing what each validation layer misses, and standing a gate in every gap, is part of the implementation, not an afterthought.

---

If you need Restaurant or LocalBusiness structured data designed properly, or an existing markup pipeline audited with this kind of measurement, I take on consulting and implementation work individually. [Get in touch here](/en/contact/).
