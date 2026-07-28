---
title: 'FAQ Rich Results Are Dead. Don''t Delete the Q&A Markup'
description: Google fully retired FAQ rich results on May 7, 2026. A FAQPage JSON-LD passes the schema validator but comes back DEPRECATED. Here's what to change in code and content, from Google's own docs.
pubDate: '2026-07-25'
heroImage: ../../../assets/blog/faqpage-deprecation-ai-citation-2026/hero.png
tags:
  - SEO
  - StructuredData
  - JSON-LD
  - GEO
  - AIO
relatedPosts:
  - slug: restaurant-jsonld-opening-hours-validation-2026
    score: 0.72
    reason:
      ko: 저 글은 Restaurant JSON-LD가 검증기를 통과해도 값이 엉터리일 수 있다는 걸 쟀고, 이 글은 검증을 통과해도 리치 결과가 안 나오는 경우를 다룬다. "통과 ≠ 목적 달성"이라는 같은 함정의 두 얼굴이다.
      ja: あちらはRestaurant JSON-LDが検証を通っても値が出鱈目でありうると測った記事、本記事は検証を通ってもリッチリザルトが出ない場合を扱う。「通過≠目的達成」という同じ罠の裏表だ。
      en: That post measured how Restaurant JSON-LD can pass validation while holding garbage values; this one covers markup that passes validation yet produces no rich result. Two faces of the same "valid ≠ done" trap.
      zh: 那篇测的是Restaurant JSON-LD即便通过校验、值也可能是错的；本文讲的是通过校验却拿不到富媒体结果。同一个"通过≠达标"陷阱的两面。
  - slug: validate-structured-data-ci-jsonld-2026
    score: 0.68
    reason:
      ko: CI에서 JSON-LD를 자동 검증하는 파이프라인을 만들었다면, 그 게이트가 "스키마 유효성"만 보고 "실제 노출 가치"는 못 본다는 이 글의 지적이 바로 다음 질문이다.
      ja: CIでJSON-LDを自動検証するパイプラインを組んだなら、そのゲートが「スキーマ有効性」だけ見て「実際の露出価値」を見ないという本記事の指摘が次の問いになる。
      en: If you built a CI pipeline that auto-validates JSON-LD, this post's point — that the gate checks schema validity but not real-world value — is your next question.
      zh: 如果你已经搭好CI里自动校验JSON-LD的流水线，那么本文的提醒——门禁只看"schema有效性"却看不到"实际曝光价值"——正是下一个问题。
  - slug: robots-snippet-controls-ai-overviews-2026
    score: 0.6
    reason:
      ko: 리치 결과가 사라진 자리를 AI Overviews가 채우는 흐름이라면, 스니펫과 AI 노출을 robots 지시로 통제하는 저 글이 이 글의 GEO 파트와 짝을 이룬다.
      ja: リッチリザルトが消えた場所をAI Overviewsが埋める流れなら、スニペットとAI露出をrobots指示で制御するあの記事が本記事のGEOパートと対になる。
      en: If AI Overviews are filling the space rich results left behind, that post on controlling snippets and AI exposure via robots directives pairs with this article's GEO section.
      zh: 如果AI Overviews正在填补富媒体结果退场后的空位，那篇用robots指令控制摘要与AI曝光的文章，正好与本文的GEO部分配套。
  - slug: structured-data-syntax-comparison-jsonld-microdata-rdfa-2026
    score: 0.55
    reason:
      ko: FAQPage를 어떤 문법으로 넣든(JSON-LD/Microdata) 리치 결과 종료는 동일하게 적용된다. 문법 선택을 다룬 저 글과 함께 읽으면 "어떻게 넣나"와 "넣어서 뭐가 남나"가 이어진다.
      ja: FAQPageをどの構文で入れても(JSON-LD/Microdata)リッチリザルト終了は同じく適用される。構文選択を扱ったあの記事と併読すると「どう入れるか」と「入れて何が残るか」が繋がる。
      en: Whatever syntax you use for FAQPage (JSON-LD or Microdata), the rich-result shutdown applies equally. Read alongside that syntax-comparison post to connect "how to mark up" with "what's left after you do."
      zh: 无论用哪种语法写FAQPage（JSON-LD还是Microdata），富媒体结果的关停同样适用。与那篇讲语法选择的文章合读，就把"怎么写"和"写了还剩什么"串起来了。
---

Plenty of sites still ship FAQPage JSON-LD and wait for an accordion to unfold in the search results. In 2026, that accordion never comes. Google stopped showing FAQ rich results entirely as of May 7, 2026.

Here's where I part ways with the obvious reaction. "Rich results are gone, so rip out the FAQPage markup" is not the right call. The death of the rich result and the death of the Q&A structure are two different things, and this post is about keeping them separate. I ran FAQPage JSON-LD through an offline validator to see the exact spot where "the schema passes" and "nothing shows up" diverge, then worked out what to change in code and content, grounded in Google's own docs.

## FAQPage vs QAPage: what were they, exactly

Foundations first. I'll assume you're new to structured data.

Structured data is a separate layer of machine-readable meaning that sits on top of the HTML humans read. schema.org defines the vocabulary, and you usually drop it into the page as a `<script type="application/ld+json">` block. Search engines may use these hints to build a special appearance (a rich result) in the results. The operative word is *may*, not *will*. That single distinction is the whole story today.

FAQPage represents a page where each question has one official answer, written by the publisher. Product help, pricing pages, shipping policy pages are the classic cases. Its cousin, QAPage, is a different animal: it's for community pages where users post multiple answers and one gets accepted, like a forum or a Q&A board. Publisher's single answer means FAQPage; multiple user answers mean QAPage. That distinction still holds, and what died is the FAQPage rich result specifically.

The minimal skeleton of FAQPage JSON-LD looks like this:

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How long does shipping take?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Two to three business days."
      }
    }
  ]
}
```

The required fields are simple. Under `FAQPage`, a `mainEntity` array; each item is a `Question` with `name` (the question text) and `acceptedAnswer` (an `Answer` with `text`). That skeleton hasn't changed since it launched in 2019. What changed is the work Google does when you add it.

## What actually happened: the 2023 cut, the 2026 shutdown

This wasn't Google's first pass at FAQ rich results. Here's the timeline.

In August 2023, Google announced [changes to HowTo and FAQ rich results](https://developers.google.com/search/blog/2023/08/howto-faq-changes). The official wording: FAQ rich results would show only for "well-known, authoritative government and health websites," and would no longer appear regularly for anyone else. HowTo rich results were dropped altogether. By that point, the FAQ accordion had already vanished from most ordinary sites.

Then in 2026 the remaining steps landed. Consolidating Google's official changelog and the FAQPage docs:

| Date | What was retired |
|---|---|
| 2023-08 | FAQ rich results limited to authoritative gov/health sites; HowTo removed entirely |
| 2026-05-07 | FAQ rich results stop appearing in Google Search completely (docs marked deprecated) |
| 2026-06 | FAQ support dropped from Search Console rich result reporting, the Rich Results Test, and search appearance filters; FAQPage docs removed |
| 2026-08 | Search Console API support for FAQ rich result data removed |

Net result: no site can get a results-page accordion from FAQPage JSON-LD anymore. Even the testing tools no longer report the type.

One official limit is worth nailing down here. Google has always stated that structured data doesn't guarantee a rich result or a ranking. The fall of FAQPage is that principle taken to its extreme. You can implement it perfectly to spec, and whether it shows is entirely the search engine's call. For reference, one industry analysis (SearchEngineLand, not official) counted FAQ rich result presence dropping from roughly 54% of SERPs to about 17% right after the 2023 cut. Treat the number as a reference point, but the direction matches the official shutdown.

## Passing the validator doesn't buy you visibility. I measured it

Saying "passing is pointless" without proof is hollow. So in a throwaway sandbox I ran FAQPage JSON-LD through an offline validator: a ~40-line Node script that checks only the schema.org required structure, no network. I fed it one clean sample and one deliberately broken one.

The core of the check:

```javascript
function validateFaqPage(doc) {
  const errors = [];
  if (doc["@type"] !== "FAQPage") errors.push('@type is not "FAQPage"');
  const items = Array.isArray(doc.mainEntity) ? doc.mainEntity : [];
  if (items.length === 0) errors.push("mainEntity has no Question");
  items.forEach((q, i) => {
    if (!q.name?.trim()) errors.push(`mainEntity[${i}] missing name (required)`);
    const a = q.acceptedAnswer;
    if (!a) errors.push(`mainEntity[${i}] missing acceptedAnswer (required)`);
    else if (!a.text?.trim()) errors.push(`mainEntity[${i}] missing answer.text (required)`);
  });
  return errors;
}
```

The run came back like this:

```text
[faqpage-sample.jsonld]
  schema-structure   : PASS
  google-rich-result : DEPRECATED (feature removed 2026-05-07)

[faqpage-broken.jsonld]
  schema-structure   : FAIL
  google-rich-result : DEPRECATED (feature removed 2026-05-07)
    - mainEntity[0] missing acceptedAnswer (required)
    - mainEntity[1] missing name (required)
```

The clean sample passes the structural check (`PASS`). The line right next to it says `DEPRECATED`. However green your validator turns, the stage where Google Search would render that has already closed. That's the one-line summary: schema validity and visibility are separate axes, and a CI gate only sees the first one. Anyone running a [CI pipeline that auto-validates structured data](/en/blog/en/validate-structured-data-ci-jsonld-2026) should keep this blind spot in mind. A passing gate does not mean traffic value attaches. There's a second axis validators miss: whether the value itself makes any sense. When I [ran restaurant opening-hours markup through three layers of validation](/en/blog/en/restaurant-jsonld-opening-hours-validation-2026), a value like `opens: "eleven"` sailed through every one of them.

There's a second thing to notice in the broken sample. The validator still catches missing required fields precisely. The structural check itself isn't dead. What died is the Google rich-result reward that used to ride on top of it. That distinction drives the next decision.

## So do you delete it or keep it? Google's answer and mine

The most common question: "Rich results are gone, so should I strip out all the FAQPage markup?"

Google's official guidance is clear. There's no need to proactively remove it. Structured data that isn't being used doesn't cause problems for Search, but it also has no visible effect. Keeping it does no harm; deleting it costs you nothing. On the Google-rich-result axis alone, FAQPage JSON-LD is now neutral dead code.

For new pages, I won't invest fresh effort adding FAQPage JSON-LD for Google's benefit. There's no reason to grow my maintenance surface with markup that pays zero visual dividend. On the flip side, if a legacy site already has it embedded at scale, I won't rush a sweeping migration to strip it either. Google said it's harmless, and the removal work itself introduces regression risk. Honestly, this is one of those rare cases where actively doing nothing is the best move.

One condition, though. "Don't delete" refers to the JSON-LD block. The Q&A *content* inside it follows a completely different fate. If anything, it's about to matter more.

## Where rich results died, AI is reading

This is the real reason I wrote the piece.

The results-page space that FAQ rich results left behind is filling fast with AI Overviews and other generative answers. And the way an AI answer engine pulls information off a page is fundamentally different from a Google rich result. Rich results read a separate channel called JSON-LD. Most AI crawlers, by contrast, extract meaning from the [rendered HTML body itself](/en/blog/en/ai-crawlers-dont-render-javascript-csr-2026). And a "clear question → short, self-contained answer" pattern is the most quotable shape a machine can find.

So the real asset in FAQPage was never the JSON-LD type name. It was the discipline it forced: a sharp question, and an answer that resolves on the spot. Don't lock that discipline inside JSON-LD. Pull it out into visible, semantic HTML. That's the move now. Concretely:

- Mark up questions as real heading elements (`<h2>`/`<h3>`) or a definition list (`<dl><dt>`). AI crawlers read them straight from the body.
- Make the answer self-contained in the paragraph right after the question. An answer that leans on context ("as explained above") falls apart the moment it's sliced into an extraction unit.
- One question, one answer. Keep FAQPage's original character (the publisher's single authoritative answer) at the content level.

Now the honest limit. That AI engines actually quote this structure more readily is my practitioner's judgment plus a synthesis of observations, not an official number Google has guaranteed (reference, not official). The selection logic behind AI Overviews is undisclosed, and I don't make claims about the internals of ranking systems. What I will state flatly is this: the channel machines read has moved from JSON-LD to the rendered body, so it's rational to move your investment there too.

## The takeaway: the call to make in front of FAQ markup

Compressed to one line: FAQPage JSON-LD aimed at Google rich results is over, but the Q&A content structure is appreciating in the AI era.

I'll close with a checklist you can apply now.

- **New pages**: don't add FAQPage JSON-LD for the sake of Google rich results. The visual payoff is zero.
- **Existing JSON-LD**: don't rush to strip it. Google calls it harmless, and removal is the bigger regression risk. Keep it if you want Bing/other engines or schema.org completeness.
- **Q&A content**: don't hide it inside JSON-LD. Expose it in rendered semantic HTML (`<h2>`, `<dl>`). That's the channel AI crawlers read.
- **Answer shape**: resolve it in the paragraph right after the question. Context-dependent answers break on extraction.
- **Validation gate**: your CI schema check only guarantees structural validity. Make it explicit to the team that visibility and citation value are a separate axis.
- **Expectations**: structured data guarantees neither ranking nor visibility (Google, official). FAQPage is the living proof.

I take on private consulting and implementation work for getting structured data out server-side reliably, and for auditing a site's Q&A structure and schema against the rich-result shutdown and the shift toward AI citation. If you need a call on which markup to keep and which to promote into content, my contact is on the profile.
