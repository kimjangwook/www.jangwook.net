---
title: "1,248 Feed Items, Four Languages, Zero Language Metadata"
description: "W3C published a first draft on language and direction metadata for strings. I audited my four-language blog against it, measured where dir=auto guesses wrong, and shipped a build gate."
pubDate: '2026-07-20'
heroImage: ../../../assets/blog/string-lang-dir-metadata-multilingual-web/audit-summary.png
tags:
  - i18n
  - w3c
  - web-development
relatedPosts:
  - slug: hreflang-reciprocity-audit-multilingual-2026
    score: 0.84
    reason:
      ko: "저 글은 페이지끼리의 언어 관계(hreflang)를 감사했다. 이 글은 한 단계 더 안쪽, 페이지가 실어 나르는 문자열 자체에 언어 표시가 붙어 있는지를 잰다. 같은 사이트, 같은 감사 루프의 다음 층이다."
      ja: "あちらはページ間の言語関係(hreflang)の監査。本稿はもう一段内側、ページが運ぶ文字列そのものに言語表示が付いているかを測る。同じサイト、同じ監査ループの次の層。"
      en: "That post audits the language relationship between pages (hreflang). This one goes a layer deeper: whether the strings those pages carry declare their own language. Same site, next floor of the same audit loop."
      zh: "那篇审计的是页面之间的语言关系（hreflang）。本文再往里一层，测的是页面所承载的字符串本身有没有标出语言。同一个站点，同一条审计回路的下一层。"
  - slug: json-ld-graph-entity-linking-2026
    score: 0.78
    reason:
      ko: "@graph로 구조화 데이터를 하나로 묶은 그 글의 결과물이 이번 감사 대상이었다. 왜 그 @context에 @language를 넣지 않기로 했는지, 판단 근거가 이 글에 있다."
      ja: "@graphで構造化データを一つに束ねた、あの記事の成果物が今回の監査対象だった。なぜその@contextに@languageを入れないと決めたのか、その判断根拠が本稿にある。"
      en: "The @graph consolidation from that post is exactly what I audited here. Why I decided against adding @language to that @context is spelled out in this one."
      zh: "那篇把结构化数据用@graph合并的成果，正是本次审计的对象。为什么我决定不给那个@context加@language，理由写在本文里。"
  - slug: multilingual-blog-technical-audit-campaign-2026
    score: 0.75
    reason:
      ko: "'측정 → 최대 항목 수정 → 게이트로 상설화' 루프를 닷새간 돌린 기록이 저 글이다. 이 글은 그 루프를 한 번 더 돌린 결과이고, 이번에 추가된 게이트는 postbuild에 그대로 붙었다."
      ja: "「測る→一番効く箇所を直す→ゲートで常設化」のループを五日間回した記録があちら。本稿はそのループをもう一周した結果で、今回追加したゲートはpostbuildにそのまま繋いだ。"
      en: "That post is five days of running the measure-fix-gate loop. This is one more turn of the same loop, and the gate it produced is now wired into postbuild alongside the others."
      zh: "那篇是把「测量→修最要紧的一项→固化成关卡」这条回路跑了五天的记录。本文是同一条回路的又一圈，这次产出的关卡已经接进了postbuild。"
  - slug: accessible-name-agents-2026
    score: 0.68
    reason:
      ko: "접근성 이름이 틀리면 스크린리더가 엉뚱하게 읽는다는 이야기였다. 언어 표시가 없으면 그 스크린리더가 아예 틀린 언어의 음성 엔진으로 읽는다. 같은 문제의 한 칸 위 계층이다."
      ja: "アクセシブルネームが間違っていればスクリーンリーダーが変な読み方をする、という話だった。言語表示がなければ、そのスクリーンリーダーは そもそも別言語の音声エンジンで読む。同じ問題の一段上の階層。"
      en: "That one was about screen readers announcing the wrong thing when the accessible name is wrong. Without language metadata, the same screen reader reads the text with an entirely wrong voice engine. One layer up from the same problem."
      zh: "那篇讲的是可访问名称错了、屏幕阅读器就会念错。而没有语言标注时，同一个屏幕阅读器会直接用另一种语言的语音引擎去念。是同一问题的上一层。"
---

My blog ships one aggregate RSS feed. I opened the built file and counted: 1,248 items, Korean, Japanese, English and Chinese posts interleaved by publication date. Nowhere in that XML does anything say which language a given item is written in. Not on the channel. Not on any item.

So how does a consumer figure it out? It looks at the characters and guesses.

The W3C Internationalization Working Group published two First Public Working Drafts on 2026-07-16. One of them, [Strings on the Web: Language and Direction Metadata](https://www.w3.org/TR/string-meta/), goes straight at that guessing habit. The companion draft, [Character Model for the World Wide Web: String Matching](https://www.w3.org/TR/charmod-norm/), covers the adjacent problem of comparing strings across normalization forms. I read the first one, audited my own site against it, fixed one thing, and bolted a build gate on so it can't rot back. Every number below is real output from that process.

## Strings forget their language the moment they leave HTML

Start with why this matters at all, because skipping it makes the measurements later look like pedantic XML nitpicking.

HTML has `lang` and `dir`. Write `<p lang="ar" dir="rtl">` and the fact that this paragraph is Arabic and reads right-to-left is baked into the markup itself. The browser renders accordingly. A screen reader picks the Arabic voice engine instead of mangling the text through an English one. Search engines get a declared answer instead of a statistical one. Markup languages were built with extensible attributes, so there has always been somewhere to hang this information.

The trouble is that strings on the modern web don't travel through HTML alone. They move through JSON API responses, JSON-LD blocks, RSS and Atom feeds, WebIDL interfaces, config files, message queues. Most of those formats were designed on the assumption that a string is just a string. There is no slot in `{"title": "..."}` for saying what language that title is in. The draft puts it plainly: JSON, WebIDL and other non-markup data languages generally do not provide extensible attributes, and were not conceived with built-in language or direction metadata.

So the metadata evaporates. A string authored in a CMS with a perfectly good `lang` attribute gets serialized to JSON, handed to an API, passed to a frontend, and re-rendered into HTML somewhere else entirely. Nobody carried the language along. Whatever component does the final render is left with one option, and it's the bad one.

Here's the requirement the draft states:

> For any string field containing natural language text, it *MUST* be possible to determine the language and string direction of that specific string. Such determination *SHOULD* use metadata at the string or document level and *SHOULD NOT* depend on heuristics.

The abstract sets the tone before that: "This document describes the best practices for identifying the language and direction for strings used on the Web."

Concretely, the draft recommends a small set of moves. For a single-language field, carry a `{value, lang, dir}` triple instead of a bare string. Allow document-level `language` and `direction` defaults, but require that string-level metadata be able to override them. For fields that hold several translations at once, use a language map keyed by language tag. Restrict direction to exactly three values: `ltr`, `rtl`, `auto`. And for JSON-LD specifically, declare `@language` and `@direction` in `@context`.

One caveat belongs right here, up front, before I build anything on top of this:

> This is a draft document and may be updated, replaced, or obsoleted by other documents at any time. It is inappropriate to cite this document as other than a work in progress.

## What `dir="auto"` actually does, and where it breaks

The heuristic the draft is warning about has a name: first-strong. Scan a string character by character, find the first character with a strong directional property, and adopt its direction. That's what `dir="auto"` implements in browsers. It costs nothing and it's usually right, which is exactly why it spreads.

The draft is specific about how it fails:

> The main problem with this approach is that it produces the wrong result for (1) strings that begin with a strong character with a different directionality than that needed for the string overall (eg. an Arabic tweet that starts with a hashtag) (2) strings that don't have a strong directional character (such as a telephone number), which are likely to be displayed incorrectly in a RTL context.

Reading a failure description isn't the same as watching it happen, so I implemented first-strong myself and ran it against strings I built to probe those exact edges.

```python
import unicodedata

ISOLATE_INIT = {"⁦", "⁧", "⁨"}  # LRI, RLI, FSI
PDI = "⁩"

def first_strong(s: str) -> str:
    depth = 0
    for ch in s:
        if ch in ISOLATE_INIT: depth += 1; continue
        if ch == PDI: depth = max(0, depth-1); continue
        if depth: continue
        b = unicodedata.bidirectional(ch)
        if b == "L": return "ltr"
        if b in ("R","AL"): return "rtl"
    return "ltr"
```

Fourteen test strings, each tagged with the direction I declared correct as the author. The run:

```text
case                                         declared  dir=auto  ok
------------------------------------------------------------------------
ar title starting with latin product name    rtl       ltr       MISMATCH
he title starting with a version number      rtl       rtl       OK
ar UI label starting with a digit            rtl       rtl       OK
he string starting with an ASCII quote       rtl       ltr       MISMATCH
ar author name with latin handle first       rtl       ltr       MISMATCH
en title starting with an arabic loanword    ltr       rtl       MISMATCH
ar plain sentence                            rtl       rtl       OK
he plain sentence                            rtl       rtl       OK
ko plain sentence                            ltr       ltr       OK
ja plain sentence                            ltr       ltr       OK
zh plain sentence                            ltr       ltr       OK
en plain sentence                            ltr       ltr       OK
numeric-only string (no strong char)         ltr       ltr       OK
emoji-led ar string                          rtl       rtl       OK
------------------------------------------------------------------------
total=14  mismatch=4  mismatch_rate=28.6%
```

Four wrong out of fourteen. Every failure has the same shape: Latin-script text sitting in front of right-to-left content, or the mirror case where an Arabic word opens an English sentence. An Arabic article title that leads with a Latin product name. A Hebrew string opening on an ASCII quotation mark. An Arabic author byline where the `@handle` comes first. And in reverse, an English title beginning with an Arabic loanword, which first-strong flips to RTL.

The passes taught me more than the failures did. A Hebrew title starting with a version number resolved correctly. So did an Arabic UI label beginning with a digit, and an Arabic string led by an emoji. Digits, punctuation and emoji carry no strong directional property, so the scan skips right over them and lands on the first real letter. My working intuition before running this was "ASCII in front breaks it." Wrong. Strong Latin *letters* in front break it. That distinction changes which of your fields are actually at risk.

About that 28.6%: it is the mismatch rate of this constructed fourteen-case set and nothing more. I picked the cases to stress the boundary, so the number is not a web-wide statistic and I'm not going to pretend otherwise. What the run establishes is the shape of the failure, not its frequency in the wild.

## Auditing my own build output

Reading a spec and nodding along is cheap. So I wrote a script that walks `dist/` after a production build and reports what my site declares rather than what I assume it declares. Real output:

```text
== pages audited == 1248
html[lang] present : 1248/1248
html[dir]  present : 0/1248

== JSON-LD ==
blocks parsed          : 1248  (parse errors: 0)
@context has @language : 0
@context has @direction: 0
blocks containing inLanguage: 1248

== feeds ==
  rss-en.xml    xml:lang=False  <language>=True   items=312
  rss-ja.xml    xml:lang=False  <language>=True   items=312
  rss-ko.xml    xml:lang=False  <language>=True   items=312
  rss-zh.xml    xml:lang=False  <language>=True   items=312
  rss.xml       xml:lang=False  <language>=False  items=1248
```

The HTML layer held up. Every page declares `html[lang]`, and every JSON-LD block carries `inLanguage` at the item level. That's the payoff from earlier passes over this site, including the [hreflang reciprocity audit](/en/blog/en/hreflang-reciprocity-audit-multilingual-2026) that forced me to get the per-page language story straight in the first place.

The last line is the problem. `dist/rss.xml` is the aggregate feed, the one that mixes all four language editions into a single chronological stream, and it declares nothing. No channel `<language>`. No per-item language. Twelve hundred and forty-eight items going out the door with their language stripped off, to be reconstructed by whatever guesswork the consumer felt like implementing.

The per-language feeds were fine, which is exactly why I'd never looked closer. `rss-ko.xml` says `ko`, `rss-ja.xml` says `ja`, and that felt like the job being done. The aggregate feed had been sitting there for as long as the site has been multilingual and I had never once considered it a defect. It took a script that didn't share my assumptions to surface it.

## Fixing the mixed feed with `dc:language`

RSS 2.0 has a channel-level `<language>` element and no per-item equivalent. For a feed where every item is a different language, channel-level is useless. You cannot declare one language for a stream that has four.

Dublin Core solves this. `dc:language` is defined per-element, which is precisely the granularity the draft asks for: metadata attached to the string, not inferred from context. `@astrojs/rss` supports both an `xmlns` option for declaring the namespace and per-item `customData` for arbitrary child elements, so the change is small.

```js
return rss({
  title: SITE_TITLE, description: SITE_DESCRIPTION, site: context.site,
  xmlns: { dc: 'http://purl.org/dc/elements/1.1/' },
  items: posts.map((post) => {
    const [lang, ...slugParts] = post.id.split('/');
    const slug = slugParts.join('/');
    return { title: post.data.title, description: post.data.description,
             pubDate: post.data.pubDate, link: `/${lang}/blog/${lang}/${slug}/`,
             customData: `<dc:language>${lang}</dc:language>` };
  }),
});
```

The language code already lives in the content collection ID, since posts are stored as `ko/slug`, `ja/slug` and so on. Splitting on the first slash gives both the language tag and the slug, and I need the slug for the link anyway. Rebuild, then count:

```bash
$ grep -o '<dc:language>[a-z]*</dc:language>' dist/rss.xml | sort | uniq -c
 312 <dc:language>en</dc:language>
 312 <dc:language>ja</dc:language>
 312 <dc:language>ko</dc:language>
 312 <dc:language>zh</dc:language>
```

Zero to 1,248. Even distribution across four languages, which is the expected shape given the site publishes every post in all four.

Be clear about what this buys. `dc:language` serves feed readers, aggregators and anything else consuming the XML programmatically. It is not a search ranking signal, and I'm making no traffic claim here. Google's position on structured data has been consistent for years: it helps machines understand the content, it does not guarantee a ranking outcome. Language metadata sits in the same category. It makes the data honest. That's the whole return.

## An unverified gate is not a gate

Fixing a thing once means it's fixed once. The interesting question is whether it's still fixed in three months after twenty commits touch the feed code.

I saved the checker as `scripts/validate-string-meta.mjs` and hung it off postbuild next to the hreflang validator:

```json
"postbuild": "node scripts/validate-hreflang.mjs && node scripts/validate-string-meta.mjs"
```

Then came the part people skip. A checker that has only ever printed "pass" has proven nothing about its ability to print "fail." I deleted three `dc:language` entries from the built `rss.xml` by hand and reran it:

```text
html[lang]: 1288/1288 pages
per-language feeds: 4 checked
mixed feed rss.xml: 1245/1248 items declare dc:language
FAILED: rss.xml: dc:language 1245 / item 1248 — mismatch
exit=1
```

Caught all three, correct count, nonzero exit. Restoring the file made it pass again. Two minutes of work to convert "I believe this gate works" into "I watched this gate fail on purpose." Every validator I add to this pipeline gets that treatment now, because a gate that can't fail is decoration with a runtime cost. That habit came out of the [five-day audit campaign](/en/blog/en/multilingual-blog-technical-audit-campaign-2026) where I ran measure, fix, and freeze-as-a-gate on repeat, and it has caught more than one script that was quietly passing on a typo'd selector.

## Why I did not add `@language` to my JSON-LD context

This is the decision I spent the most time on, and I landed against the draft's recommendation.

The draft says to declare language and direction in the JSON-LD `@context`. My site currently emits `"@context": "https://schema.org"` as a plain string, with an `@graph` array underneath. The upgrade looks like a two-minute edit:

```json
{
  "@context": {
    "@vocab": "https://schema.org/",
    "@language": "en",
    "@direction": "ltr"
  },
  "@graph": [ ... ]
}
```

I didn't ship it. Here's why.

That `@graph` holds site-wide entities that appear identically on every language edition. Pull up any Korean page and you'll find this inside it:

```json
{
  "@type": "Organization",
  "name": "jangwook.net",
  "description": "Personal technology blog by Kim Jangwook"
}
```

Those strings are English. They're English on the Korean page, the Japanese page, and the Chinese page, because I write the organization description once and reuse it. If I set a document-level `@language` matching the page language, every one of those global entity strings gets labeled `ko` on Korean pages and `ja` on Japanese pages. I'd be attaching a confident, machine-readable, verifiably false claim to a string that hasn't changed.

Missing metadata and wrong metadata are not the same failure. When metadata is absent, a consumer knows it's operating on inference and can hedge. When metadata is present and wrong, it gets believed. Wrong is worse than absent, and it's worse in a way that's harder to detect downstream because everything looks well-formed.

There's a second reason, which is that the audit already told me I have a more precise layer in place: `inLanguage` on all 1,248 blocks, at the item level, where it actually varies. A document-wide default would be a coarser statement sitting on top of a finer one. The [`@graph` consolidation work](/en/blog/en/json-ld-graph-entity-linking-2026) is what put that item-level coverage there, and it would be strange to now paper over it with a blunter declaration.

Two routes are defensible. Convert the global entity strings to the draft's language-map form, so each one declares its own language regardless of which page it lands on. Or leave `@context` untouched and let per-item `inLanguage` carry the load. I took the second, for now, because the first depends on the draft's field-name conventions settling down. This is a First Public Working Draft. Those names may not survive it.

## What I'm leaving broken on purpose

Three open items, stated plainly.

`html[dir]` is missing on 1,248 of 1,248 pages and I left it that way. Korean, Japanese, English and Chinese are all left-to-right, the browser default is `ltr`, and the rendering is correct today. The declaration is implicit rather than wrong. That changes the day I add an RTL edition, and on that day one more rule goes into the gate. Writing `dir="ltr"` on twelve hundred pages right now would be motion, not progress.

The draft is a first draft. Field names and recommendations can change before it becomes a Recommendation, so designing a new API schema strictly against it would be premature. What is not premature is the underlying principle. Attaching language metadata to strings predates this document by a long stretch, and doing it with an established mechanism like `dc:language` is safe regardless of where the draft ends up.

Last one, and it's the limit I'm least comfortable with. I don't read Arabic or Hebrew. Every RTL verdict in the experiment above came from computing Unicode character properties, not from a native speaker looking at rendered output. Direction resolution is defined in terms of character properties, so computation is the right tool for deciding what the algorithm returns. Whether the result looks natural on screen to someone who reads the script daily is outside what I can vouch for.

## Seven things to check in your own build output

The short version: the W3C draft asks that every natural-language string be able to declare its own language and direction without heuristics. I implemented the heuristic it warns about and watched it miss 4 of 14 constructed cases, all of them Latin-letter prefixes on RTL content or the reverse. I audited my built site, found an aggregate RSS feed shipping 1,248 items with zero language metadata, fixed it with per-item `dc:language`, and wired a validator into postbuild that I verified by breaking the file on purpose. I also declined the draft's JSON-LD advice, because applying it to my `@graph` would attach wrong language tags to English entity strings on non-English pages.

Run these against your own `dist/`, not your source:

- Count `html[lang]` coverage across every built page. Coverage on the templates you remember is not coverage.
- Find every string field crossing a JSON boundary and ask whether the language survives the trip. API responses, feeds, structured data blobs, config.
- Grep for `dir="auto"` and check whether any of those fields can start with a strong letter from the opposite script. Digits, punctuation and emoji are fine; letters are not.
- If you emit a mixed-language feed, put `dc:language` on each item. RSS 2.0 gives you nothing per-item, so pull in the Dublin Core namespace.
- Check whether your JSON-LD carries item-level `inLanguage` before you reach for a document-level `@language` default, and check what's actually in your `@graph` first.
- Never set a language tag on a string you haven't confirmed. Absent metadata makes consumers cautious. Wrong metadata gets trusted.
- Break your own validator on purpose and confirm it exits nonzero. Then restore and confirm it passes.

---

If your site serves several languages and you're not certain what its build output actually declares, that's a measurable question rather than a matter of opinion. I take on consulting and implementation work in this area personally: auditing language and direction metadata across pages, feeds and structured data, then turning whatever the audit finds into CI gates so the fix survives the next twenty commits. If that's useful to you, [get in touch](/en/contact).
