---
title: "Search Console can measure TikTok. Your pipeline can't."
description: "Platform properties went global on 2026-07-29. Search Console API docs still stop at 2024-07-23, so automated dashboards see Instagram, TikTok, X, YouTube last."
pubDate: '2026-08-18'
heroImage: '../../../assets/blog/gsc-platform-properties-social-video-search-measurement-2026/hero.png'
tags:
  - google-search-console
  - seo
  - analytics
  - measurement
  - social-media
relatedPosts:
  - slug: official-geo-subtraction-gsc-control-2026
    score: 0.84
    reason:
      ko: Search Console 안에만 있고 저장소에는 없는 제어를 확인한 글이다. 이번 속성도 같은 자리에 있다. 코드 리뷰가 볼 수 없는 곳에서 리포트의 범위가 정해진다.
      ja: リポジトリには存在せず Search Console の中だけにある制御を確認した記事。今回のプロパティも同じ場所にあり、コードレビューの外でレポートの範囲が決まる。
      en: That post checks a control that exists only inside Search Console and nowhere in the repository. This property type sits in the same place, where the scope of a report gets decided outside code review.
      zh: 那篇核对的是只存在于 Search Console、仓库里找不到的控制项。这次的资源类型也在同一个位置：报表的范围在代码审查之外被决定。
  - slug: google-analytics-mcp-automation
    score: 0.79
    reason:
      ko: 리포트를 자동화하는 쪽의 이야기다. 이 글의 결론은 그 파이프라인에 무엇을 넣지 말아야 하는지이므로, 자동화 구성을 먼저 읽으면 각주가 필요한 이유가 분명해진다.
      ja: レポート自動化の側の話。本稿の結論はそのパイプラインに何を入れないかなので、自動化の構成を先に読むと注記が必要な理由がはっきりする。
      en: The automation side of the same problem. This article's conclusion is about what to keep out of that pipeline, so reading the automated-reporting setup first makes the footnote feel necessary rather than pedantic.
      zh: 讲的是报表自动化的那一侧。本文的结论是哪些数字不要进那条流水线，先读自动化的搭建过程，就会明白脚注为什么必要。
  - slug: prerender-activationstart-cwv-measurement-2026
    score: 0.71
    reason:
      ko: 하나의 지표 이름이 서로 다른 기준을 감추고 있을 때 수치가 얼마나 어긋나는지 실측한 글이다. Insights 요약 카드와 하단 리스트가 둘 다 clicks 를 쓰는 문제와 같은 종류다.
      ja: ひとつの指標名が別々の基準を隠しているとき、数値がどれだけ食い違うかを実測した記事。Insights の要約カードと下部リストがどちらも clicks を使う問題と同種だ。
      en: A measurement where one metric name hid two different starting clocks. The Insights summary card and the list beneath it both say clicks while counting different populations, which is the same species of problem.
      zh: 那篇实测了同一个指标名掩盖两种基准时，数字会差多少。Insights 的摘要卡片和下方列表都叫 clicks 却统计不同范围，属于同一类问题。
---

On 2026-07-29 Google's Search Central blog announced that platform properties are globally available to everyone. Three weeks later, I pulled the two Search Console help pages that document the feature. Both still say the rollout is gradual. Same company, same feature, two answers about whether it exists for you.

My call before the details. If a human opens Search Console and reads the reports, connect all four accounts today: the cost is a login and there's nothing to lose. If those numbers feed a dashboard through the API or BigQuery, do almost the opposite. Connect the properties, keep them out of the pipeline, and write one line in the dashboard saying they're excluded. Not because of permissions. Google has not published a way to name one of these properties in a request.

## What Google actually added

Platform properties are a new property type, beside the URL-prefix and Domain properties you already have. The list is fixed.

> "Select one of the four available platforms: Instagram, TikTok, X, YouTube."
>
> — [See how content from social and video platforms performs on Google Search](https://developers.google.com/search/blog/2026/07/search-console-social-video-platforms)

The first announcement, on 2026-07-07, promised availability gradually over the coming weeks. Twenty-two days later the second announcement flipped availability to everyone and named the surfaces: your posts as they perform on Google Search, Discover, and Google News. The Discover and News reports appear only when those surfaces send traffic, so an empty sidebar is information rather than a bug.

Connected, you get the metrics you already read every week: clicks, impressions, average CTR, average position. Same four names as your site property. That symmetry sells the feature and sets the trap, because one help-center sentence draws a boundary the metric names don't.

> "Platform properties only show how your content performs on Google Search. They don’t track when people see your content on the platform itself (for example, they won’t show how many times your video appeared on TikTok)."
>
> — [About platform properties in Search Console](https://support.google.com/webmasters/answer/17148418)

## The two pages that disagree about whether you have it

Strip the tags off the help page and grep for the rollout sentence:

```bash
curl -sSL -A "Mozilla/5.0" "https://support.google.com/webmasters/answer/17148418?hl=en" \
  | python3 -c "import sys,re,html;s=sys.stdin.read();s=re.sub(r'<[^>]+>',' ',s);print('HIT' if 'rolling out this feature gradually' in html.unescape(s) else 'GONE')"
# HIT
```

HIT, around 17:40 JST on 2026-08-18, anonymous request from a Japanese IP. Help article 34592, which covers adding a property, carries the same sentence.

> "We’re rolling out this feature gradually, so it might not be available to everyone yet."
>
> — [About platform properties in Search Console](https://support.google.com/webmasters/answer/17148418)

> "Today, platform properties are globally available to everyone."
>
> — [Platform properties roll out globally, plus a new social and video performance guide](https://developers.google.com/search/blog/2026/07/platform-properties-social-video-guide)

The documentation update log dates the new analysis guide to that same day, so the blog and the docs log moved together while the help center stayed put. Which page is right? I don't know, and both answers point at the same action: open the add-property screen and look.

## Why the pipeline can't point at it

The failure here isn't access. It's naming, which is duller and worse.

The Search Console API identifies a property with a single string called `siteUrl`. Its reference page documents two grammars for that string.

> "The URL of the property to retrieve, as defined by Search Console. Examples: http://www.example.com/ (for a URL-prefix property) or sc-domain:example.com (for a Domain property)"
>
> — [Sites: get, Search Console API](https://developers.google.com/webmaster-tools/search-console-api-original/v3/sites/get)

A platform property's identifier is not a URL. Help article 34592 shows `instagram.com/username`, an account path. A third grammar has to exist, yet the reference has not changed since long before this shipped:

```bash
curl -sSL "https://developers.google.com/webmaster-tools/search-console-api-original/v3/sites/get" \
  | grep -o "sc-domain:example.com\|Last updated 2024-07-23 UTC\|instagram" | sort | uniq -c
#   1 Last updated 2024-07-23 UTC
#   1 sc-domain:example.com
```

Zero lines for `instagram`. Last updated 2024-07-23, two years before the announcement. Your pipeline isn't locked out of this data; it doesn't know what to ask for. What the live endpoint accepts is a separate question from what the reference documents, and an undocumented string is a guess.

The same problem turns up inside the UI.

> "On the Insights page, the top summary card shows all clicks to your property across Google (including web, image, video, and news searches). However, the detailed lists below the summary card focus specifically on traffic from web search results."
>
> — [About platform properties in Search Console](https://support.google.com/webmasters/answer/17148418)

Two numbers, two populations, one word: clicks. Screenshot the summary card into a slide, let somebody recompute it from the list below, and you'll spend a meeting explaining documented behavior. Same shape as when [a prerendered page reported LCP at 6.2 seconds](/en/blog/en/prerender-activationstart-cwv-measurement-2026/) because the metric name never said which clock it started on.

## Three axes, and only one of them lines up

<strong>What proves you own it.</strong> A site property is a DNS record, a file, or a tag: infrastructure you control. A platform property is neither.

> "Automated connection via an existing website property, or direct platform login."
>
> — [Add a website or platform property to Search Console](https://support.google.com/webmasters/answer/34592)

A DNS record is a key you cut yourself; a platform login is a guest badge someone else reissues. The analogy breaks on the data, which is worth knowing before you panic.

> "For security, ownership is periodically checked. If your connection is lost, either because an external login expired, access to your platform property will pause until you re-verify. Once you re-verify, you get access to the same report and you don't need to wait for data to accumulate."
>
> — [About platform properties in Search Console](https://support.google.com/webmasters/answer/17148418)

Lose the badge and the room is as you left it. What you lose is the days in between, and whatever job was scheduled to read the report during them.

<strong>What gets counted.</strong> The one axis where the two types match: the same four metrics, across the same three surfaces. Whatever you already know about arguing over average position carries over.

<strong>How you get it out.</strong> A site property has an API, a BigQuery export, a Looker Studio connector. Here's the official guide on comparing platforms:

> "Click Export and choose your preferred file format. Repeat for all other platform properties you have."
>
> — [Analyze your social and video platform content performance in Search Console](https://developers.google.com/search/docs/monitor-debug/analyze-social-video-content)

The guide notes that filtering for a playlist measures the playlist page itself rather than the videos inside it. It separates long-form from short-form video by filtering URLs containing `/watch` against `/shorts/`, because Search Console provides no content-type dimension. Cross-platform comparison remains a manual export.

## What it costs

| Line item | What you pay |
|---|---|
| Feature fee | Nothing |
| Property slots | Up to 1,000 per Search Console account; one per platform account or channel |
| Setup labor | Four platforms times every brand account you run, verified one at a time |
| Time to first number | A few days to collect and process after setup |
| Default window | 28 days, on both Insights and the Performance report |
| History | None. A new property fills in only from the moment collection starts |
| Re-verification | Access pauses when an external login expires; no waiting for data afterward |
| API and BigQuery | Not applicable, because the path isn't documented |

The row that costs a quarter is History: no prior-year column exists, and none will until a year after you connect.

If you already claimed your Search profile, every verified account became a property automatically. Check the list before you start clicking.

## Where the "this is a creator feature" objection is right

I've heard the blunt version and I think it's mostly correct. On a technical or B2B site, Google-search traffic into your social and video posts is a rounding error. YouTube Studio and Instagram Insights already give finer numbers about your own content. A report shipped for creators is no reason for an engineering organization to touch its measurement design.

Grant the range, because it's wide. If you post a few times a quarter and nearly all your traffic is organic web search into pages you own, the new property type changes nothing about your work. Connect the platform accounts, look once, move on. I concede the core claim: this is not a reason to redesign how you measure. I argue for something smaller: a reason to annotate what you already measure.

The objection breaks on queries. Platform-native insights tell you traffic arrived from search; they don't hand you the terms it arrived on. Platform properties don't count what happens inside the platform either. These aren't a coarse and a fine measurement of the same quantity; they're two instruments blind in different places, and for a brand name the gap in your own setup is the expensive one. Somebody types your product into Google and lands on your YouTube channel instead of your docs. The site property misses that click because it never touched your site. YouTube Studio sees the view without the query behind it.

Where I part ways is the conclusion, the "so don't bother" part. One login buys a query list you've never seen.

## What I'd change on Monday

Not the numbers in the weekly report. The footnote under it.

- Add the properties, by automated connection from an existing website property or by direct platform login.
- Read the 28-day window once beside the same window on your site property. You want brand-name queries earning clicks your site never recorded.
- Write the footnote. One line: this total excludes platform properties. For a team that already [automates its analytics reporting](/en/blog/en/google-analytics-mcp-automation/), that sentence is the whole deliverable here.
- Monthly, if you want the cross-platform picture, export each property into a sheet that is visibly not the pipeline. No join key, no scheduled refresh.
- Rewrote a batch of captions? Drop an annotation on the change date and read across it.

The last time I found a Search Console control that existed nowhere in my repository, [it was the generative-AI switch that never appears in a pull request](/en/blog/en/official-geo-subtraction-gsc-control-2026/). Same shape one layer over: what your reporting can see is decided outside your codebase, so no diff will tell your team it moved.

## Who this fits, and who it doesn't

Platform properties fit an organization that suspects a YouTube channel or Instagram profile absorbs its brand queries, with no report to size the volume. They fit when social and video belong to a separate team, since both sides share clicks and impressions. And they fit publishers with no website at all, a group Search Console has never served.

The feature does not fit platform-internal recommendation traffic, nor per-video performance inside a playlist. It does not fit an automated dashboard total today, for want of a documented identifier. And it does not fit a company KPI, because the history behind a new property is empty.

Here's where I land. Teams who read Search Console by hand should connect platform properties today; the cost is a login and the return is a list of queries nobody has seen. Teams who automated Search Console should connect them and then deliberately keep them out of reports, which feels backwards and is right. The group that did the more mature engineering gets the new data later.

The line I'd hold is narrow. Nothing enters an automated total until Google documents an identifier for platform properties, not because the numbers are wrong but because a sum whose members you can't name is a sum you can't audit. What would prove me wrong is a third grammar on that reference page, a documented string for `instagram.com/username` in `siteUrl`. The week Google documents that syntax, I'd wire it in.

Something quieter changed with this property type. Proof of ownership moved from a thing I control to a session someone else can end. A DNS record sits there until I delete it; a platform login expires on a policy I didn't write, and the report stops until I go re-verify. This is the first Search Console property whose continuity of observation isn't in my hands, and I doubt it's the last thing I'll be asked to measure that way.

## References

- [See how content from social and video platforms performs on Google Search](https://developers.google.com/search/blog/2026/07/search-console-social-video-platforms)
- [Platform properties roll out globally, plus a new social and video performance guide](https://developers.google.com/search/blog/2026/07/platform-properties-social-video-guide)
- [About platform properties in Search Console](https://support.google.com/webmasters/answer/17148418)
- [Analyze your social and video platform content performance in Search Console](https://developers.google.com/search/docs/monitor-debug/analyze-social-video-content)
- [Add a website or platform property to Search Console](https://support.google.com/webmasters/answer/34592)
- [Sites: get, Search Console API](https://developers.google.com/webmaster-tools/search-console-api-original/v3/sites/get)
- [Latest Google Search Documentation Updates](https://developers.google.com/search/updates)
