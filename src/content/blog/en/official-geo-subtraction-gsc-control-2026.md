---
title: "Official GEO is a subtraction list plus one Search Console switch"
description: "Google official generative-AI guide says to ignore llms.txt and special schema. What a developer should check is the Search Console include switch and the live robots.txt, not git."
pubDate: '2026-08-14'
updatedDate: '2026-08-14'
heroImage: '../../../assets/blog/official-geo-subtraction-gsc-control-2026/hero.png'
tags:
  - SEO
  - GEO
  - AIO
  - Search-Console
faq:
  - question: 'Does shipping an llms.txt help in AI Overviews?'
    answer: 'No. Google Search Central’s generative-AI guide says Google Search ignores the file, and creating it neither helps nor hurts visibility or rankings. Keep it only if some other system reads it. It is not a Google Search task.'
  - question: 'Is there a special schema.org type for generative search?'
    answer: 'Official docs say there is not. Structured data still matters for rich-result eligibility. You do not add a dedicated type for AI Overviews, and structured data does not guarantee ranking or citations.'
  - question: 'If I exclude the site in the Search generative AI control, does it drop out of regular Search?'
    answer: 'The help page says the control only affects certain generative AI features and is not a ranking or inclusion signal for the rest of Search. Training limits belong to Google-Extended. Full removal from Search is noindex. The control UI is still rolling out to a subset of properties.'
relatedPosts:
  - slug: robots-snippet-controls-ai-overviews-2026
    score: 0.88
    reason:
      ko: 페이지에 nosnippet을 심으면 AI Overview 입력에서 빠진다. 오늘은 그 위층, Search Console 속성에 생긴 스위치를 본다.
      ja: ページに nosnippet を置くと AI Overview の入力から外れる。今日はその上、Search Console プロパティに付いたスイッチを見る。
      en: nosnippet takes a page out of AI Overview input. This one looks at the switch that landed above that, on the Search Console property.
      zh: 页面加上 nosnippet，就会从 AI Overview 的输入里拿掉。这篇看的是更上面那层：Search Console 资源上的开关。
  - slug: ai-crawler-control-robots-txt-llms-txt-2026
    score: 0.86
    reason:
      ko: 학습 봇과 검색 봇을 가르는 설계는 그쪽에 있다. 오늘은 그 robots.txt가 라이브에서 CDN 접두를 입고 길어진 상태를 잰다.
      ja: 学習ボットと検索ボットを分ける設計はあちらにある。今日はその robots.txt がライブで CDN 接頭辞を着て長くなった状態を測る。
      en: Splitting training bots from search bots is that post. This one measures the live file after a CDN prefix made it longer than git.
      zh: 训练爬虫和搜索爬虫怎么分开，写在那篇。这篇量的是线上 robots.txt 被 CDN 前缀拉长之后。
  - slug: faqpage-deprecation-ai-citation-2026
    score: 0.74
    reason:
      ko: 검증기를 통과한 FAQPage가 리치 결과에서는 이미 끝났다. 생성형 검색용 스키마를 하나 더 얹는 일도 같은 함정이다.
      ja: 検証を通った FAQPage はリッチリザルトではもう終わっている。生成検索用スキーマを足すのも同じ穴だ。
      en: A valid FAQPage already stopped producing a rich result. Adding a schema just for generative search is the same hole.
      zh: 通过校验的 FAQPage，富结果这边已经收场了。再为生成式搜索加一种 schema，是同一个坑。
  - slug: validate-structured-data-ci-jsonld-2026
    score: 0.7
    reason:
      ko: CI에서 JSON-LD를 막는 일은 리치 결과 쪽 일이다. 공식은 그 마크업을 생성형 검색의 입장권으로 보지 않는다.
      ja: CI で JSON-LD を止める仕事はリッチリザルト側だ。公式はそのマークアップを生成検索の入場券にしていない。
      en: Blocking bad JSON-LD in CI is still a rich-result job. Official text does not treat that markup as a ticket into generative search.
      zh: 在 CI 里拦住坏 JSON-LD，仍是富结果的事。官方没把这套标记当成生成式搜索的门票。
  - slug: json-ld-graph-entity-linking-2026
    score: 0.64
    reason:
      ko: 엔티티를 @graph로 묶는 작업은 남는다. 이유를 "AI Overview 전용 최적화"로 쓰면 공식 문서와 어긋난다.
      ja: エンティティを @graph で結ぶ仕事は残る。理由を「AI Overview 専用最適化」と書くと公式とずれる。
      en: Linking entities in an @graph still makes sense. Calling it an AI Overview-only optimization does not match the official guide.
      zh: 用 @graph 串实体，这件事还在。但若写成“AI Overview 专用优化”，就和官方指南拧着。
---

I didn't open Search Console for this. I fetched the public bytes the site already ships, then put them next to the official text.

Google Search Central published [Optimizing your website for generative AI features](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) on 15 May 2026 and touched it again on 10 July. Third-party AEO/GEO lists still start with `llms.txt`. Then chunking. Then a special schema.org type. Then a rewrite "for the model." The official mythbusting section deletes that column first.

The new thing a developer can actually flip is a property setting. Ranking is out of scope.

![Official GEO is a subtraction list plus one switch](../../../assets/blog/official-geo-subtraction-gsc-control-2026/hero.png)

## A pull request will not see this switch

"Included in Search Console" points at the [Search generative AI control](https://support.google.com/webmasters/answer/16908024). Path: Settings > Search generative AI.

Three states. Include the site's links and content in generative AI features. Exclude them. Inherit from the parent. Include is the default. Exclude takes the site out of AI Overviews, AI Mode, and generative features in Discover. No links. No grounding input. No impressions or traffic from those features.

> This control only affects whether your content can appear in certain Search generative AI features; this control isn't used as a ranking or inclusion signal affecting other parts of Search.

Source: [Search generative AI control](https://support.google.com/webmasters/answer/16908024)

It is not a ranking signal for the rest of Search. It is not a training switch. Training limits sit on [Google-Extended](https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers#google-extended). Full removal from Search is `noindex`. After the control goes live, exclusion usually lands in 1〜2 days. Cache can stretch that.

Flip exclude on the domain property and every child URL-prefix that still inherits follows it. A blog at `https://example.com/blog/` can fall out because someone touched the parent. Clean HTML does not reopen that.

The control and the report are still on a subset of sites. The [3 June 2026 announcement](https://developers.google.com/search/blog/2026/06/gen-ai-performance-reports) of the Generative AI performance report is explicit about that. The report counts impressions, not clicks or positions. Search Labs experiments are out. A missing screen does not mean the site is excluded. It may not be in the rollout, or it may not have enough generative impressions yet.

I will not claim the menu exists on this property. I can claim the documented default (include) and the documented inheritance.

For a team, invert the order of work. Read the parent property first. Write down whether each child inherits or overrides. Only then audit robots meta and the live robots.txt. Reverse that and you can spend a week on markup while the site is simply not included. If the people who ship HTML and the people who own Search Console are different groups, this never shows up in a pull request.

![Eligibility is three layers](../../../assets/blog/official-geo-subtraction-gsc-control-2026/three-layers.png)

AI Overviews attach a short gist and supporting links to a hard question. AI Mode is the conversational surface for comparisons and multi-step reasoning. Both sit inside Google Search. Both pull live pages. Google describes the machinery as RAG on top of the core ranking systems, plus query fan-out. A lawn-weeds question can spawn separate retrievals for herbicides, chemical-free removal, and prevention.

A page has to be indexed and allowed to show a snippet. [AI features and your website](https://developers.google.com/search/docs/appearance/ai-features) puts it this way:

> There are no additional requirements to appear in AI Overviews or AI Mode, nor other special optimizations necessary.

Source: [AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)

The same page still wants the technical requirements, the spam policies, and people-first content. Meeting all of that still does not guarantee a crawl, an index, or a serving slot.

Snippet eligibility is a lever I already measured. `nosnippet` and `max-snippet:0` close the page as direct input to AI Overviews and AI Mode. That write-up is in [robots snippet directives](/en/blog/en/robots-snippet-controls-ai-overviews-2026). I am not rerunning that parser today.

## Four items the official guide deletes

> From Google Search's perspective, optimizing for generative AI search is optimizing for the search experience, and thus still SEO.

Source: [Optimizing your website for generative AI features](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)

What I would drop from an engineering backlog:

| Item on third-party lists | Official stance | What to do in code |
| --- | --- | --- |
| `llms.txt` and other "AI files" | Google Search does not use them. Creating them neither helps nor hurts visibility or rankings | Do not add one for Google Search. Keep it only if some other system actually reads it |
| Chunking copy for the model | Not required. The systems can follow more than one topic on a page | Size the page for readers |
| Rewriting only for AI | Synonyms and meaning are already understood. You do not need a page per long-tail variant | Keep the human draft. Farming variant pages collides with [scaled content](https://developers.google.com/search/docs/essentials/spam-policies#scaled-content) |
| A special schema.org type for generative search | Not required. There is no special markup to add | Leave rich-result markup in place. Do not invent an "AI Overview schema" |

The `llms.txt` line is blunt.

> Doing so will neither harm nor help your site's visibility or rankings in Google Search, as Google Search ignores them.

Source: the LLMS.txt item in the same [optimization guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)

Harmless and useless, for Google Search. Fine to keep for some other consumer. Off the Google Search board. If [robots.txt already splits training bots from search bots](/en/blog/en/ai-crawler-control-robots-txt-llms-txt-2026), today's job is not another file.

Read the structured-data paragraph twice. It is not required for generative search and there is no dedicated type. It still helps rich-result eligibility, so keep it in the wider SEO plan. I do not read that as "delete JSON-LD." I read it as "do not add a type because AI Overviews exist." Structured data has never guaranteed rankings. It does not guarantee citations either.

Inauthentic mentions around the web are, officially, not as helpful as they sound. Third-party tools that claim "internal" Google metrics get the same haircut. No third-party tool has access to internal ranking or AI systems. The [third-party SEO guidance](https://developers.google.com/search/docs/fundamentals/third-party-seo) says to check AEO/GEO advice against official docs. Using a tool in a workflow is fine. Treating its number as Google's number is not.

## 45 lines in git, 106 in production

On 14 August 2026 I curled the public surface of `https://jangwook.net`.

```bash
curl -sI https://jangwook.net/llms.txt
# HTTP/2 404

curl -sL https://jangwook.net/robots.txt | wc -l
# 106
```

`LLMs.txt` and the `www` host 404'd as well. This site does not ship the file Google Search says it ignores.

robots.txt had grown outside the repo. git is 45 lines, 1,101 bytes: training bots (`GPTBot`, `ClaudeBot`, `CCBot`, `Google-Extended`) blocked, search bots and `*` only blocked on cross-language URLs. The live response is 106 lines, 2,937 bytes. A CDN-managed prefix sits in front. `User-agent: *` carries `Content-Signal: search=yes,ai-train=no,use=reference`, plus extra `Disallow: /` groups. The repo body continues after that.

![Line counts for git robots.txt versus the live response](../../../assets/blog/official-geo-subtraction-gsc-control-2026/robots-live-vs-git.png)

I did not find `Content-Signal` listed as a supported rule in the Search Central robots.txt docs I used for this piece. Presence in the file is not the same as Googlebot consuming the token. I am not claiming the latter.

Eight pages (`/`, `/ko/`, `/en/`, `/ko/blog/`, three posts, `/ko/contact/`) returned HTTP 200. Zero `<meta name="robots">`. Zero `data-nosnippet` attributes. One page used the word `nosnippet` in body copy. That was not a directive. The template only emits a robots tag when `noindex` is on.

Home JSON-LD carried `Organization`, `Person`, `WebSite`. Posts carried `BlogPosting`, `WebPage`, `BreadcrumbList`. Under today's official text, that markup is not a ticket into generative search. It stays on the rich-result side, the same split I used when [FAQ rich results ended and the Q&A markup stayed](/en/blog/en/faqpage-deprecation-ai-citation-2026).

If GEO work means "add a file to the repo," the file a crawler already reads has grown outside the repo. Diff the deployed URL.

## Agents walk the same tree as a screen reader

The last stretch of the guide is browser agents. Booking. Comparing specs. Different job from search citations. Same surface. [web.dev's agent-friendly note](https://web.dev/articles/ai-agent-site-ux) lists three views: screenshots, raw HTML, the accessibility tree.

The accessibility tree keeps roles, names, and states. It drops visual noise. It is the same tree a screen reader uses. Style a `div` as a button and the DOM-only path never sees a button. The screenshot path may see where it sits and still miss what it does.

The leftover work is dull. Prefer `button` and `a`. Wire labels with `for`. Do not hide hit targets under a transparent overlay. That is WCAG work. It is not a new agent file format.

web.dev also says a screenshot-only path is slow and expensive. Put the main path on the tree and the DOM, and the text a crawler reads comes from the same markup an agent uses. That is the opposite of stuffing hidden search copy.

## Monday morning

```bash
curl -sI https://example.com/llms.txt | head -n 1

curl -sL https://example.com/robots.txt > /tmp/live-robots.txt
diff -u public/robots.txt /tmp/live-robots.txt
```

Those two lines still cannot see the Search Console switch. That layer is a property setting.

Drop from the sprint: a new `llms.txt` for Google Search, a special AI markdown file, a generative-search-only schema.org type, chunking, a page per query variant, third-party "internal" metrics as a deploy gate.

Keep: indexing and snippet eligibility, a live robots.txt diff against git, the generative AI control on parent and child properties, semantic HTML, and a purpose line on rich-result JSON-LD that says "rich-result eligibility" rather than "required for generative search."

Include can stay on. Snippets can stay allowed. The page can be indexed. Google still does not owe a citation. I measured where eligibility breaks, not the size of an effect.

If the live robots.txt and git do not match, or you cannot even find the parent-property control, bring that page. Matching official text to the bytes you actually ship is the work I do.
---
*Sources: Google Search Central [generative AI optimization guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) (updated 2026-07-10), [AI features and your website](https://developers.google.com/search/docs/appearance/ai-features), [third-party SEO guidance](https://developers.google.com/search/docs/fundamentals/third-party-seo), [Generative AI performance reports announcement](https://developers.google.com/search/blog/2026/06/gen-ai-performance-reports) (2026-06-03), Search Console Help [Search generative AI control](https://support.google.com/webmasters/answer/16908024) and [Generative AI performance report](https://support.google.com/webmasters/answer/16984139), web.dev [Build agent-friendly websites](https://web.dev/articles/ai-agent-site-ux) (all official). The four English block quotes were fetched from those pages, whitespace-folded, and checked against the source; each quote sits next to its URL. Live fetch: 2026-08-14, robots.txt, llms.txt, and eight pages on `https://jangwook.net`, curl plus HTML parse. Data: `data/official-geo-gsc-control-probe-2026.json`. Figures: `scripts/chart-official-geo-gsc-control.py`. Search Console was not opened. Content-Signal appears in the live robots.txt and was not confirmed as a supported Search Central robots.txt rule. Structured data and this switch do not guarantee rankings.*
