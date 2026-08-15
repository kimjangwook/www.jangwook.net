---
title: 'The GEO Control That Never Appeared in My Pull Request'
description: "Live robots.txt was 106 lines; Git had 45. llms.txt returned 404. Google Search ignores it. Search Console's generative AI switch never lands in a pull request."
pubDate: '2026-08-14'
heroImage: '../../../assets/blog/official-geo-subtraction-gsc-control-2026/hero.png'
tags:
  - seo
  - geo
  - google-search-console
  - robots-txt
relatedPosts:
  - slug: robots-snippet-controls-ai-overviews-2026
    score: 0.86
    reason:
      ko: 이 글이 페이지 내부의 nosnippet으로 AI Overview 입력을 막는 경로를 다뤘다면, 이 글은 그보다 바깥의 Search Console 제어를 확인한다. robots.txt와 스니펫 지시자는 열려 있어도 속성 설정에서 제외할 수 있다.
      ja: この記事がページ内の nosnippet で AI Overview への入力を止める経路を扱ったなら、こちらはその外側にある Search Console の制御を確認する。robots.txt とスニペット指示子が開いていても、プロパティ設定で除外できる。
      en: That post covers the page-level nosnippet path into AI Overviews. This one checks the outer Search Console control, where a property can be excluded even when robots.txt and snippet directives are open.
      zh: 那篇文章讲的是页面内 nosnippet 如何阻止 AI Overview 使用内容。本文检查外层的 Search Console 控制：即使 robots.txt 和片段指令放行，站点属性仍可能被排除。
  - slug: ai-crawler-control-robots-txt-llms-txt-2026
    score: 0.82
    reason:
      ko: AI 크롤러가 들어오는지와 Google Search의 생성형 AI 기능에 사이트가 포함되는지는 다른 층이다. 이 글은 robots.txt와 llms.txt를 확인한 뒤, Git에 없는 세 번째 층을 분리한다.
      ja: AI クローラーを通すかどうかと、Google Search の生成 AI 機能にサイトを含めるかどうかは別の層だ。この記事では robots.txt と llms.txt を確認した後、Git に存在しない第三の層を切り分ける。
      en: Crawler access and inclusion in Google's Search generative AI features are different layers. After checking robots.txt and llms.txt, this post isolates the third layer that does not live in Git.
      zh: 是否允许 AI 爬虫进入，和是否加入 Google Search 的生成式 AI 功能，是两个不同层次。本文检查 robots.txt 与 llms.txt 后，再拆出 Git 中不存在的第三层。
  - slug: faqpage-deprecation-ai-citation-2026
    score: 0.72
    reason:
      ko: FAQPage 같은 구조화 데이터의 존재만으로 생성형 검색 노출을 보장할 수 없다는 점이 이어진다. 이 글은 실제 HTML의 JSON-LD 타입을 세었지만, 그것을 자격 증명으로 과장하지 않는다.
      ja: FAQPage などの構造化データがあるだけで生成 AI 検索への表示が保証されるわけではない。その続きとして、この記事では実際の HTML の JSON-LD タイプを数えるが、資格の証拠とは扱わない。
      en: Having FAQPage or other structured data does not guarantee generative-search visibility. This post counts the JSON-LD types in live HTML, then stops short of treating them as proof of eligibility.
      zh: 拥有 FAQPage 等结构化数据，并不能保证出现在生成式搜索中。本文统计线上 HTML 的 JSON-LD 类型，但不把它夸大为资格证明。
  - slug: validate-structured-data-ci-jsonld-2026
    score: 0.68
    reason:
      ko: 이 글은 DevTools 화면이 아니라 서버가 반환한 HTML을 파싱하는 같은 검증 습관을 robots.txt와 meta 지시자에 적용한다. 결과는 브라우저 화면이 아닌 원시 응답에서 나온다.
      ja: この記事では DevTools の画面ではなく、サーバーが返した HTML を解析する検証習慣を robots.txt と meta 指示子にも適用する。結果を見る場所はブラウザー画面ではなく生のレスポンスだ。
      en: 'This post applies the same verification habit to robots.txt and meta directives: parse what the server returned, not what DevTools shows after the browser changes the DOM.'
      zh: 本文把同一种验证习惯应用到 robots.txt 和 meta 指令：解析服务器返回的 HTML，而不是查看浏览器修改 DOM 后的 DevTools 画面。
  - slug: json-ld-graph-entity-linking-2026
    score: 0.6
    reason:
      ko: 홈과 포스트에서 JSON-LD 타입을 확인하는 측정이 엔티티 그래프 글과 연결된다. 다만 이 글의 결론은 구조화 데이터가 아니라 Search Console의 포함 여부다.
      ja: ホームと記事で JSON-LD タイプを確認する測定は、エンティティグラフの記事につながる。ただし、この記事の結論は構造化データではなく Search Console の包含設定だ。
      en: The live JSON-LD type check connects to the entity-graph post, but the conclusion here is about Search Console inclusion, not structured data.
      zh: 本文对首页和文章页 JSON-LD 类型的检查，与实体图谱那篇文章相连。但本文的结论是 Search Console 的包含设置，而不是结构化数据。
---

On August 14, `curl -sL https://jangwook.net/robots.txt | wc -l` returned `106`. `public/robots.txt` in Git was `45` lines. The live bytes disagreed with the diff, and the control that excludes a site sat outside both files.

`curl -sI https://jangwook.net/llms.txt` returned `HTTP/2 404`. The file third-party GEO checklists put first was not on this host. Instead of a missing file, I found a deployment mismatch and a setting outside the repository.

## The live file was not the file I was reviewing

I assumed deployed `robots.txt` matched `public/robots.txt`. The diff looked like the source of truth; it was not.

```sh
curl -sL https://jangwook.net/robots.txt | wc -l
# 106
wc -l public/robots.txt
# 45
wc -c public/robots.txt
# 1101
```

The live response was 2,937 bytes with a CDN-managed prefix before the repository body. Under `User-agent: *`, it contained `Content-Signal: search=yes,ai-train=no,use=reference`, an extra `Disallow: /` for training and extended bots, and two Google-Extended deny groups instead of Git's one.

That is 61 more lines on the wire. It does not prove Google consumes `Content-Signal`; I could not confirm that rule in Search Central documentation. Reviewing `public/robots.txt` alone cannot describe what this host serves.

The verification diff:

```sh
curl -sL https://example.com/robots.txt > /tmp/live-robots.txt
diff -u public/robots.txt /tmp/live-robots.txt
```

## `llms.txt` was a 404, not a missing ranking signal

I checked the host directly instead of adding a file from a checklist:

```sh
curl -sI https://jangwook.net/llms.txt | head -n 1
# HTTP/2 404
```

Google's generative AI optimization guide states:

> “Doing so will neither harm nor help your site's visibility or rankings in Google Search, as Google Search ignores them.”

The guide also notes: “From Google Search's perspective, optimizing for generative AI search is optimizing for the search experience, and thus still SEO.” [The guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) is the source, not a third-party GEO score.

I would not add `llms.txt` to this site's Google Search backlog. That is a decision about Google Search, not other systems. The 404 closes a proposed task without a deployment change. That sits on the same layer as [splitting robots.txt and llms.txt as crawler controls](/en/blog/en/ai-crawler-control-robots-txt-llms-txt-2026/). This time I put Google's ignore sentence next to a public 404.

## The switch that can cut off the whole site lives in Search Console

What can remove a site from AI Overviews, AI Mode, and Discover generative features when public files look fine? Google documents a property setting: the **Search generative AI control**.

The help page lists three states:

- `Include`: default; links and content can appear in generative AI features.
- `Exclude`: site links and content are excluded from those features, including grounding input, impressions, and traffic.
- `Inherit from parent`: a child property follows the nearest configured parent.

Google's wording is narrow:

> “This control only affects whether your content can appear in certain Search generative AI features; this control isn't used as a ranking or inclusion signal affecting other parts of Search.”

[Search Console Help: Search generative AI control](https://support.google.com/webmasters/answer/16908024)

Documented under `Settings > Search generative AI`, the control is rolling out to a subset of properties. I did not log into Search Console on August 14, so I cannot confirm whether this property shows the screen, its state, or if a parent property controls it. The repository cannot answer those questions.

An exclusion takes one to two days to take effect after the control goes live, though caching can stretch that. A domain property exclusion flows down to unconfigured URL-prefix children.

## The page still has to clear the ordinary search gates

The control is not a ranking switch or a replacement for indexing. A page must be indexed and snippet-eligible before appearing as a supporting link in AI Overviews or AI Mode, with no extra requirements:

> “There are no additional requirements to appear in AI Overviews or AI Mode, nor other special optimizations necessary.”

[Google Search Central: AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)

I checked eight public URLs: `/`, `/ko/`, `/en/`, `/ko/blog/`, three posts, and `/ko/contact/`. All eight returned HTTP 200, with zero `<meta name="robots">` tags and zero `data-nosnippet` attributes. One page contained `nosnippet` in body copy, not as a directive. [Snippet directives that cut AI Overview input](/en/blog/en/robots-snippet-controls-ai-overviews-2026/) live on this page layer. None of the eight responses carried them.

This raw-HTML check reads the server response, not the post-JavaScript DOM:

```sh
python3 - 'https://example.com/your-page/' <<'PY'
import re, sys, urllib.request
html = urllib.request.urlopen(sys.argv[1]).read().decode('utf-8', 'ignore')
print('robots meta:', re.findall(r"""<meta[^>]+name=["']robots["'][^>]*>""", html, re.I))
print('data-nosnippet attrs:', len(re.findall(r'<[^>]+data-nosnippet', html, re.I)))
PY
```

I did not re-run the `nosnippet` parser from the earlier post; this was a separate count of live HTML. The earlier post was [where robots meta actually lands after parsing](/en/blog/en/robots-meta-head-body-parser-placement-2026/). This count is live HTML, not the parser fixture. No page-level snippet directive appeared in these responses, but that does not establish indexing, an AI citation, or an enabled Search Console control.

JSON-LD was present: the home page emitted `Organization`, `ImageObject`, `Person`, and `WebSite`; `/ko/` and `/en/` added `FAQPage`; posts added `WebPage`, `SpeakableSpecification`, `BreadcrumbList`, and `BlogPosting`. I parsed these types from live HTML, not as a claim to a rich result or generative-search slot. Google states structured data is not required for generative AI search and has no dedicated type, though it feeds rich-result eligibility.

## The measurement stops before performance claims

Search Console documentation notes the generative AI performance report measures impressions for AI Overviews and AI Mode, rolling out to a subset of properties. I did not open that report. I measured no rankings, impressions, clicks, citations, dwell time, or conversions.

On one host, on one day, I established three facts:

- the live `robots.txt` was 106 lines and the Git file was 45;
- `llms.txt` returned 404, and Google's guide states Google Search ignores it;
- the control that can exclude content from Search generative AI features is a Search Console property setting outside both files.

The CDN prefix is this host's setup, not a general robots.txt finding. `Content-Signal` in the response is not evidence Googlebot reads it. `Include` plus crawlability, indexing, and snippets guarantees no citation. Without logging in, the property's actual control state remains unmeasured.
