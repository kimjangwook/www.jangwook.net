---
title: "Official GEO is a subtraction list plus one Search Console switch"
description: "Google official generative-AI guide says to ignore llms.txt and special schema. What a developer should check is the Search Console include switch and the live robots.txt, not git."
pubDate: '2026-08-14'
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
      ko: 그 글이 페이지 단위 nosnippet·max-snippet이 AI Overview 입력까지 잠그는 레버라면, 이 글은 그 위에 얹힌 속성 단위 Search Console 스위치와 공식 빼기 목록을 맞춘다.
      ja: あちらがページ単位の nosnippet・max-snippet で AI Overview 入力を閉じるレバーなら、こちらはその上に載るプロパティ単位の Search Console スイッチと公式の引き算リストを揃える。
      en: "That post is the page-level lever. nosnippet and max-snippet close AI Overview input. This one sits above it with the property-level Search Console switch and the official subtraction list."
      zh: 那篇是页面级开关，nosnippet、max-snippet 会关掉 AI Overview 的输入。这篇叠在上面：属性级 Search Console 开关，以及官方划掉的清单。
  - slug: ai-crawler-control-robots-txt-llms-txt-2026
    score: 0.86
    reason:
      ko: 크롤러를 들일지 말지는 그 글의 robots.txt 설계다. 오늘은 그 파일이 라이브에서 CDN 접두를 입고 길어졌고, 공식은 llms.txt를 Google Search가 무시한다고 다시 못 박은 지점을 잰다.
      ja: クローラーを入れるかはあちらの robots.txt 設計だ。今日はそのファイルがライブで CDN 接頭辞を着て長くなり、公式が llms.txt を Google Search は無視すると再確認した地点を測る。
      en: Whether a crawler gets in is that post's robots.txt design. Today the live file grew a CDN prefix, and the official guide restated that Google Search ignores llms.txt.
      zh: 爬虫进不进门，是那篇的 robots.txt 设计。今天量的是线上文件被 CDN 前缀拉长，以及官方再次写明 Google Search 会忽略 llms.txt。
  - slug: faqpage-deprecation-ai-citation-2026
    score: 0.74
    reason:
      ko: 검증기를 통과한 FAQPage가 리치 결과에서는 이미 끝난 이야기라면, 생성형 검색용 전용 스키마를 더 얹는 일도 같은 함정이다. 자격과 노출은 따로 논다.
      ja: 検証を通った FAQPage がリッチリザルトではすでに終わっているなら、生成検索用の専用スキーマを足すのも同じ罠だ。資格と露出は別物である。
      en: If a valid FAQPage already stopped producing a rich result, adding a special schema just for generative search is the same trap. Eligibility and appearance are not the same job.
      zh: 若通过校验的 FAQPage 在富结果里已经收场，再为生成式搜索加一套专用 schema，是同一个坑。资格和露出不是一回事。
  - slug: validate-structured-data-ci-jsonld-2026
    score: 0.7
    reason:
      ko: JSON-LD를 CI에서 막는 일은 리치 결과 자격을 지키는 쪽에 남는다. 공식은 그 마크업이 생성형 검색의 필수 조건이 아니라고 했으니, 게이트의 목적을 다시 적어야 한다.
      ja: JSON-LD を CI で止める仕事はリッチリザルト資格を守る側に残る。公式はそのマークアップが生成検索の必須ではないとしたので、ゲートの目的を書き直す必要がある。
      en: Catching JSON-LD in CI still belongs on the rich-result side. Official guidance says that markup is not required for generative search, so the gate's purpose has to be rewritten.
      zh: 在 CI 里拦住 JSON-LD，仍然是在守富结果资格。官方说这套标记不是生成式搜索的必要条件，门禁的目的得重写。
  - slug: json-ld-graph-entity-linking-2026
    score: 0.64
    reason:
      ko: 엔티티를 @graph로 묶는 작업은 사라지지 않는다. 다만 그 작업의 이유를 "AI Overview 전용 최적화"로 쓰면 공식 문서와 어긋난다.
      ja: エンティティを @graph で結ぶ仕事は消えない。ただしその理由を「AI Overview 専用最適化」と書くと公式文書とずれる。
      en: Linking entities in an @graph does not go away. Calling that work an AI Overview-only optimization, though, is out of line with the official guide.
      zh: 用 @graph 把实体串起来，这件事不会消失。但若把理由写成“AI Overview 专用优化”，就和官方指南拧着了。
---

The official GEO document is not a shopping list. It is a subtraction list, plus one Search Console switch.

Google Search Central published [Optimizing your website for generative AI features](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) on 15 May 2026 and touched it again on 10 July. Third-party AEO/GEO checklists still open with `llms.txt`, then chunking, then a special schema.org type, then a rewrite "for the model." The official mythbusting section deletes that column first.

I did not log into Search Console for this piece. I did fetch the public bytes this site already serves. Ranking is not in scope.

![Official GEO is a subtraction list plus one switch](../../../assets/blog/official-geo-subtraction-gsc-control-2026/hero.png)

## What AI Overviews actually pick up

Two names, one index. **AI Overviews** attach a short gist and supporting links to a hard question. **AI Mode** is the conversational surface for comparisons and multi-step reasoning. Both sit inside Google Search. Both pull live pages. Google describes the machinery as **RAG** on top of the core ranking systems, plus **query fan-out**: a lawn-weeds question can spawn separate retrievals for herbicides, chemical-free removal, and prevention.

Eligibility is older than the names. A page has to be indexed and allowed to show a snippet. [AI features and your website](https://developers.google.com/search/docs/appearance/ai-features) puts it this way:

> There are no additional requirements to appear in AI Overviews or AI Mode, nor other special optimizations necessary.

Source: [AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)

No extra technical bar. No special optimization. The same page still wants the technical requirements, the spam policies, and people-first content. Meeting all of that still does not guarantee a crawl, an index, or a serving slot. That hedge is the same hedge Search has always used.

Snippet eligibility is a lever I already measured. `nosnippet` and `max-snippet:0` close the page as direct input to AI Overviews and AI Mode. The write-up lives in [robots snippet directives](/en/blog/en/robots-snippet-controls-ai-overviews-2026). I am not rerunning that parser today. A layer landed above it.

The optimization guide adds this: besides the usual technical requirements, a site must be **included** in Search generative AI features in Search Console before it is eligible to appear there. That is a property setting, not a template ticket.

## Four backlog items the official guide deletes

The mythbusting section treats "AEO" and "GEO" as nicknames for optimizing the search experience. The point fits in one sentence.

> From Google Search's perspective, optimizing for generative AI search is optimizing for the search experience, and thus still SEO.

Source: [Optimizing your website for generative AI features](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)

What drops out of an engineering backlog:

| Item on third-party lists | Official stance | What to do in code |
| --- | --- | --- |
| `llms.txt` and other "AI files" | Google Search does not use them. Creating them neither helps nor hurts visibility or rankings | Do not add one for Google Search. Keep it only if some other system actually reads it |
| Chunking copy for the model | Not required. The systems can follow more than one topic on a page | Size the page for readers |
| Rewriting only for AI | Synonyms and meaning are already understood. You do not need a page per long-tail variant | Keep the human draft. Farming variant pages collides with [scaled content](https://developers.google.com/search/docs/essentials/spam-policies#scaled-content) |
| A special schema.org type for generative search | Not required. There is no special markup to add | Leave rich-result markup in place. Do not invent an "AI Overview schema" |

The `llms.txt` line is blunt.

> Doing so will neither harm nor help your site's visibility or rankings in Google Search, as Google Search ignores them.

Source: the LLMS.txt item in the same [optimization guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)

Harmless and useless, for Google Search. Fine to keep for some other consumer. Off the Google Search board. If [robots.txt already splits training bots from search bots](/en/blog/en/ai-crawler-control-robots-txt-llms-txt-2026), today's job is not another file. It is dropping the idea that Google Search reads this one.

Read the structured-data paragraph twice. It is not required for generative search and there is no dedicated type. It still helps rich-result eligibility, so keep it in the wider SEO plan. I do not read that as "delete JSON-LD." I read it as "do not add a type because AI Overviews exist." Structured data has never guaranteed rankings. It does not guarantee citations either.

Inauthentic mentions around the web are, officially, not as helpful as they sound. Core ranking looks at quality. Other systems block spam. Generative features depend on both. That is not a sprint ticket.

Third-party tools that claim "internal" Google metrics get the same haircut. No third-party tool has access to internal ranking or AI systems. The [third-party SEO guidance](https://developers.google.com/search/docs/fundamentals/third-party-seo) says to check AEO/GEO advice against official docs. Using a tool in a workflow is fine. Treating its number as Google's number is not.

## The Search Console switch, and who inherits it

"Included in Search Console" points at the [Search generative AI control](https://support.google.com/webmasters/answer/16908024). Path: Settings > Search generative AI.

Three states. Include the site's links and content in generative AI features. Exclude them. Inherit from the parent. Include is the default for every property. Exclude removes the site from AI Overviews, AI Mode, and generative features in Discover: no links, no grounding input, no impressions or traffic from those features.

The limit, in the help page's own words:

> This control only affects whether your content can appear in certain Search generative AI features; this control isn't used as a ranking or inclusion signal affecting other parts of Search.

Source: [Search generative AI control](https://support.google.com/webmasters/answer/16908024)

Not a ranking signal for the rest of Search. Not a training switch either. Training limits sit on [Google-Extended](https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers#google-extended). Full removal from Search is `noindex`. After the control goes live, exclusion usually lands in 1〜2 days. Cache can stretch that.

This is an ownership problem. Flip exclude on the domain property and every child URL-prefix property that still inherits follows it. A blog living at `https://example.com/blog/` can fall out of generative features because someone touched the parent. Clean HTML and a careful robots.txt do not reopen that layer.

The control and the report are still on a subset of sites. The [3 June 2026 announcement](https://developers.google.com/search/blog/2026/06/gen-ai-performance-reports) of the Generative AI performance report is explicit about that. The report counts impressions, not clicks or positions. Search Labs experiments are out. A missing screen does not mean the site is excluded. It may not be in the rollout, or it may not have enough generative impressions yet.

I did not open Search Console for this article. I will not claim the menu exists on this property. What I can claim is the documented default (include) and the documented inheritance.

For a team, invert the order of work. Read the parent property first. Write down whether each child inherits or overrides. Only then audit robots meta and the live robots.txt. Reverse that and you can spend a week on markup while the site is simply not included. The help page already says 1〜2 days, so an unchanged report the same afternoon is not a reason to revert. If the people who ship HTML and the people who own Search Console are different groups, this layer never shows up in a pull request.

![Eligibility is three layers](../../../assets/blog/official-geo-subtraction-gsc-control-2026/three-layers.png)

## The live robots.txt was not the file in git

After the official subtraction list, I did not add a file. I fetched what a crawler is offered. 14 August 2026, public URLs on `https://jangwook.net` only.

```bash
curl -sI https://jangwook.net/llms.txt
# HTTP/2 404

curl -sL https://jangwook.net/robots.txt | wc -l
# 106

# public/robots.txt in git: 45 lines, 1,101 bytes
# live response: 106 lines, 2,937 bytes
```

`llms.txt` is 404. So are `LLMs.txt` and the `www` host. That matches a site that did not plant a file Google Search says it ignores.

robots.txt did not match git. The repo file is 45 lines: training bots (`GPTBot`, `ClaudeBot`, `CCBot`, `Google-Extended`) are disallowed, search bots and `*` only lose the cross-language URLs. The live response prepends a CDN-managed block and becomes 106 lines. `User-agent: *` carries `Content-Signal: search=yes,ai-train=no,use=reference`. Several training and extended bots get another `Disallow: /`. The repo body is still there, after the prefix.

![Line counts: git robots.txt versus the live response](../../../assets/blog/official-geo-subtraction-gsc-control-2026/robots-live-vs-git.png)

I did not find `Content-Signal` listed as a supported rule in the Search Central robots.txt material I used for this piece. Presence in the live file and consumption by Googlebot are different claims. I am not making the second one. Treat the token as a third-party convention. Do not hang Google Search eligibility on it.

Eight pages (`/`, `/ko/`, `/en/`, `/ko/blog/`, three posts, `/ko/contact/`) all returned HTTP 200. Zero `<meta name="robots">` tags. Zero `data-nosnippet` attributes. One post's description mentions the word nosnippet. That is copy, not a directive. The template only emits a robots tag when `noindex` is on.

JSON-LD on the home page included `Organization`, `Person`, and `WebSite`. Posts carried `BlogPosting`, `WebPage`, and `BreadcrumbList`. Under today's official text, that markup is not a ticket into generative search. It stays on the rich-result and entity side, the same split I used when [FAQ rich results ended and the Q&A markup stayed](/en/blog/en/faqpage-deprecation-ai-citation-2026). Validation and visibility were never the same event.

The live/git split is the measurement. If GEO work means "add a file to the repo," the file a crawler already reads has grown outside the repo. Diff the deployed URL, not `public/robots.txt` against itself.

## Agents also read the accessibility tree

The guide's last stretch is browser agents: booking, comparing specs. Different job from search citations. Same surface. [web.dev's agent-friendly note](https://web.dev/articles/ai-agent-site-ux) lists three views: screenshots, raw HTML, the accessibility tree.

The accessibility tree keeps roles, names, and states, and drops visual noise. It is the same tree a screen reader uses. Style a `div` as a button and the DOM-only path never sees a button. The screenshot path may see where it sits and still miss what it does. Semantic HTML and `label for` are not a score chase. They are how a machine avoids guessing the wrong action.

The optimization guide talks about semantic HTML as readability and assistive parsing, not "perfect code." The web is not valid HTML. Google can still read it. The reason to use semantic elements anyway is not only Googlebot. Agents walk the same tree.

The leftover work is dull. Prefer `button` and `a`. Wire labels with `for`. Do not hide hit targets under a transparent overlay. Do not let the layout jump by category. That is WCAG work. It is not a new agent file format.

web.dev also says a screenshot-only path is slow and expensive, a backup when structure is muddy. Put the main path on the tree and the DOM and the text a crawler reads comes from the same markup an agent uses. That is the opposite of stuffing hidden search copy.

## What leaves the sprint, what stays

The official GEO page is not asking for more surface area. It deletes the market list, then keeps the technical Search surface and one Search Console switch.

Leave the sprint:

- A new `llms.txt` for Google Search, a special AI markdown file, a generative-search-only schema.org type
- Chunking and AI-only rewrites, and a page per query variant
- Third-party "internal" metrics as a deploy gate

Keep:

- Indexing and snippet eligibility. No stray `nosnippet` in the template. `noindex` only where you meant it
- Fetch the live `robots.txt` and diff it against git. Confirm a CDN prefix did not invert training bots and search bots
- The generative AI control on parent and child properties. Default is include. A missing UI can mean "not in the rollout," not "excluded"
- Semantic HTML and the accessibility tree. Agent guidance is existing markup
- Rewrite the purpose line on rich-result JSON-LD from "required for generative search" to "rich-result eligibility"

The smallest commands:

```bash
curl -sI https://example.com/llms.txt | head -n 1

curl -sL https://example.com/robots.txt > /tmp/live-robots.txt
diff -u public/robots.txt /tmp/live-robots.txt

python3 - <<'PY'
import re, sys, urllib.request
html = urllib.request.urlopen(sys.argv[1]).read().decode("utf-8", "ignore")
print("robots meta:", re.findall(r"<meta[^>]+name=[\"']robots[\"'][^>]*>", html, re.I))
print("data-nosnippet attrs:", len(re.findall(r"<[^>]+data-nosnippet", html, re.I)))
PY
https://example.com/your-page/
```

Those three lines still cannot see the Search Console switch. That layer is a property setting. A pull request will not catch it.

Nothing here promises an AI Overview. Include can stay on, snippets can stay allowed, the page can be indexed, and Google still does not owe a citation. I measured the layers of eligibility, not the size of an effect.

If you line up the repo, the live URL, and the property setting and cannot see which layer is open, bring that layer. Matching official text to the bytes you actually ship is the work I do.
---
*Sources: Google Search Central [generative AI optimization guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) (updated 2026-07-10), [AI features and your website](https://developers.google.com/search/docs/appearance/ai-features), [third-party SEO guidance](https://developers.google.com/search/docs/fundamentals/third-party-seo), [Generative AI performance reports announcement](https://developers.google.com/search/blog/2026/06/gen-ai-performance-reports) (2026-06-03), Search Console Help [Search generative AI control](https://support.google.com/webmasters/answer/16908024) and [Generative AI performance report](https://support.google.com/webmasters/answer/16984139), web.dev [Build agent-friendly websites](https://web.dev/articles/ai-agent-site-ux) (all official). The four English block quotes were fetched from those pages, whitespace-folded, and checked against the source; each quote sits next to its URL. Live fetch: 2026-08-14, robots.txt, llms.txt, and eight pages on `https://jangwook.net`, curl plus HTML parse. Data: `data/official-geo-gsc-control-probe-2026.json`. Figures: `scripts/chart-official-geo-gsc-control.py`. Search Console was not opened. Content-Signal appears in the live robots.txt and was not confirmed as a supported Search Central robots.txt rule. Structured data and this switch do not guarantee rankings.*
