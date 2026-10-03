---
title: 'robots.txt can block AI training while keeping search exposure for OpenAI bots, but Google-Extended ties training and citation into one switch'
description: 'A robots.txt file decides whether AI crawlers may use your content, and providers differ in how finely you can control them. OpenAI documents independent tokens so you can allow search and block training, while Google-Extended bundles training and citation into a single lever.'
pubDate: '2026-09-03'
heroImage: ../../../assets/blog/google-extended-single-lever-training-grounding-tied-robots-txt-2026/hero.png
tags:
- robots-txt
- google-extended
- ai-crawlers
relatedPosts:
- slug: robots-snippet-controls-ai-overviews-2026
  score: 0.7
  reason:
    en: After learning how robots.txt tokens split search from AI training, read on
      to see measured results for the snippet directives that decide whether AI Overviews
      cite your page.
    ko: robots.txt로 크롤러별 차단 정책을 잡았다면, 이번 글은 AI Overview에 내 페이지가 인용될지 결정하는 스니펫 지시자
      실측 결과까지 이어서 확인할 수 있다.
    ja: robots.txtでのクローラー別制御を理解したら、次はAI Overviewに自分のページが引用されるかを決めるスニペット指示子の実測結果を確認するとよい。
    zh: 了解 robots.txt 如何按爬虫分别控制训练与搜索后，接着实测决定 AI Overview 是否引用你页面的代码片段指令。
- slug: ai-crawler-control-robots-txt-llms-txt-2026
  score: 0.7
  reason:
    en: This post digs deeper into per-token differences in robots.txt, filling in
      the fine-grained decisions needed to put the earlier 2026 AI crawler control
      strategy into practice.
    ko: 이 글은 robots.txt 토큰별 차이를 더 깊게 파고들며, 앞서 소개한 2026년 AI 크롤러 제어 전략을 실제 설정으로 옮길 때
      필요한 세부 판단을 채워 줍니다.
    ja: 本記事はrobots.txtのトークンごとの違いを掘り下げ、先の2026年AIクローラー制御戦略を実際の設定に落とし込む際の細かい判断を補ってくれます。
    zh: 本文深入剖析robots.txt各令牌的差异，补充将此前2026年AI爬虫控制策略落地时所需的细粒度判断。
- slug: search-console-ai-features-opt-out-vs-official-docs-gap-2026
  score: 0.7
  reason:
    en: If this post maps how AI crawler tokens differ per provider, the follow-up
      piece shows what actually happened when the official docs were searched for
      the opt-out switch and only an inclusion lever turned up.
    ko: AI 크롤러 제어 토큰이 providers마다 어떻게 다른지 이 글에서 다뤘다면, 그 스위치를 실제 공식 문서에서 찾아 헤맨 격차의
      실체는 기존 글에서 확인할 수 있다.
    ja: robots.txtのトークンがプロバイダごとにどう違うかを本稿で解説するなら、そのスイッチを公式ドキュメントで探して見つかった「包含レバー」の実態は、既存記事で確認できる。
    zh: 本文按供应商拆解 robots.txt 令牌的差异,而既有文章记录了在官方文档中寻找退出开关时只找到“包含”杠杆的落差真相。
---

## You control AI robots with one file, and today that file gives different answers from each provider

Every website has a small text file called robots.txt. It is a short list of instructions that tells visiting robots what they may and may not take from the site. If you run a site or a blog, this one file is where you decide whether AI companies may train their models on your writing.

It works like this. Think of the visitor list at a school front desk. The list can say that certain visitors may come in, and that others must stay out. Robots read this list before they enter. If a robot is on the do-not-enter line, a well-behaved robot turns back without taking anything.

On 2026-09-03 I opened my own site's file to set one specific combination. I want my pages to keep showing up in search results. I also want AI companies to stop using my writing as training material. The question I brought to the file was simple. Can search exposure and AI training really be separated?

The answer turned out to depend on which company's robot you are talking about. The list is the same file for everyone. But each provider reads different lines from it, and each provider offers different lines to write. The same intention works with one provider and does not work with another, because the instructions you can actually write differ from provider to provider.

## This site's live robots.txt mentions Google-Extended only in a comment, not as a rule

I fetched the live file at https://www.jangwook.net/robots.txt on 2026-09-03. The server returned HTTP 200, which is the normal "here it is" signal. The file is 22 lines long, and it ends with a Sitemap line pointing to https://jangwook.net/sitemap.xml. A sitemap is a plain list of all the pages on a site, and it helps robots find every page. That is the whole file. Small files can carry big decisions.

I then searched the file for the token Google-Extended. This is the name of Google's switch for AI use of your content. I expected to find a rule block that starts with "User-agent: Google-Extended" followed by a Disallow line. A rule block is the part of the file that actually blocks a robot. I did not find one.

What I found instead was a comment. Comments are notes written for humans, and robots ignore them. The comment says that Google-Extended is a single lever that bundles training and grounding, which means citation, so closing it closes the citation path too. The same comment explains that a blocking group made of GPTBot, ClaudeBot, CCBot, and Google-Extended was removed from the file. Those are the AI training crawlers from OpenAI, Anthropic, and Common Crawl, a project that collects copies of web pages.

The only live rules sit under "User-agent: *", which means "all robots". Those rules are Disallow lines for cross-language paths such as /ko/blog/en/. They are about web addresses, not about AI training. No separate Google-Extended Disallow group appears anywhere in the excerpt I checked.

So the observation is precise. Google-Extended appears only in comments in this file, twice, and never as an enforceable rule. The file does not block Google's AI switch. The only thing left is a comment saying that training and citation are blocked together.

## Six robots all got the same server answer, so any blocking would have to come from the file, not the server

A robots.txt rule only works if the robot chooses to obey it. The server itself can also refuse a robot directly, for example by returning an error instead of the page. To find out which layer does the blocking, I tested the server layer separately.

<div class="lm-card lm-card--cell" data-lm-figure="explain-cell-c3-ua6-http-status-uniformity" data-lang="en"><span class="lm-card__badge lm-card__badge--ok">pass</span><span class="lm-card__title">Six robot visits</span><span class="lm-card__text">All six robots returned 200 for both first and last responses.</span><div class="lm-card__numbers"><span class="lm-card__chip">Response code 200</span></div></div>

I requested the site six times, each time announcing myself as a different robot. The six identities were Google-Extended, Googlebot, GPTBot, ClaudeBot, OAI-SearchBot, and an ordinary browser identity called Mozilla/5.0. For each one I recorded two things. The first response code, and the final response code after any redirects. A redirect is when the server sends you to a different address instead of the page.

The result was completely uniform. Google-Extended returned first=200 and final=200. So did the other five. Every single identity got the normal page, with no redirects in between. That means the server does not refuse anyone. There is no blocking at the web server level for any of the six robots.

I also tried to read a special header called Content-Signal. Cloudflare is a company whose servers deliver many websites. Its servers can use this header to declare what they allow. One value covers search, another covers AI training, and a third covers AI input. A header is a small piece of information the server sends before the page. I ran that check three times. All three runs exited with code 1, produced zero usable results, and printed nothing. So I could not observe the search, ai-train, or ai-input values at all.

Since the server answers everyone the same way, the only place where a block could happen for these robots is the robots.txt token itself. That narrows the whole question down to one file.

## OpenAI's official documents promise independent switches, while Anthropic's could not be checked in this run

If the file is the only control point, the next question is what each provider officially allows you to write there. This is where the providers genuinely differ.

<div class="lm-card lm-card--cell" data-lm-figure="explain-cell-c5-official-docs-token-independence" data-lang="en"><span class="lm-card__badge lm-card__badge--ok">pass</span><span class="lm-card__title">OpenAI docs</span><span class="lm-card__text">The docs said search robots and training robots can be blocked separately.</span><div class="lm-card__numbers"><span class="lm-card__chip">Observed runs 3</span><span class="lm-card__chip">Hits 0</span></div></div>

OpenAI publishes an official page describing its crawlers and fetchers. A crawler is a robot program that visits websites to read their pages. It lists four tokens. OAI-SearchBot takes 9 lines, ChatGPT-User takes 6 lines, OAI-AdsBot takes 5 lines, and GPTBot takes 5 lines. These are separate names for separate jobs. OAI-SearchBot is the one that decides search visibility. GPTBot is the one that decides training use.

The important part is a sentence in that document. OpenAI states that the tokens are "independent of the others". In other words, a site owner can allow OAI-SearchBot and still show up in search results. At the same time, the owner can disallow GPTBot so that crawled content is not used for training. Read that slowly. The combination I want, visible in search but excluded from training, is officially promised by OpenAI for its own bots.

Now the other side. I requested the Anthropic docs three times to see whether Anthropic documents a similar split for its robots. All three requests returned HTTP 200. But the excerpt I received did not contain the document body. So I could not confirm, from this run, whether Anthropic states that its tokens can be set independently. That question stays open.

Putting the two together, the picture is lopsided. The provider that officially guarantees the search-allowed, training-blocked combination in this observation is OpenAI alone.

## Neither provider explains why the designs differ

You might expect a public reason for this gap. Why would one company split its switches and another bundle them? I looked for an official explanation and found none.

OpenAI's document describes what its tokens do. It does not discuss Google's design. Google's materials on Google-Extended describe what the token covers. I did not find an official statement explaining why training and citation are controlled by one setting rather than two.

There is also the question of what grounding means, and it is worth pausing on. Grounding is when an AI answer cites your page as its source. That citation is a form of exposure, much like appearing in search results. Whether a company ties that exposure to training permission, or keeps them separate, is a product and policy choice. The reason behind the choice is simply not documented in what I could observe.

This leaves a real limit on the argument. The reason for the difference is unknown. What remains as the basis for judgment is the observed fact of the design difference itself, not any stated motive behind it.

## The strongest objection: this is one site, observed on one day, with the Google group already removed

Let me take the hardest objection seriously before defending the claim. The objection is that everything above rests on a single website, on a single day. That is true, and it matters.

The strongest version goes like this. On the day I checked, the live robots.txt had the AI training group removed, and no separate Google-Extended Disallow group existed. So the single-lever claim was never tested by actually blocking Google-Extended and watching what happened to citations. The claim is supported by direction, not by a controlled comparison. The direction comes from two sources. One is my own file's comment stating that Google-Extended bundles training and grounding. The other is OpenAI's official independence wording. Neither source is a before-and-after measurement of AI citations.

I grant the objection fully on that point. I did not observe AI Overviews, which are Google's AI-generated answers shown at the top of search results, or any real search surface changing behavior. I did not run a comparison group.

But notice what survives. The claim, as stated, is about token design and official documentation. OpenAI documents four tokens and calls them independent. Google-Extended is one token that, per its own site's written description, covers training and grounding together. At that level, one day and one site is enough, because documents do not change by the hour. The claim holds up to the level of robots.txt token design and official document wording, and no further.

## What to check in your own robots.txt today

If you run a website, the practical takeaway from this experiment is simple: don't treat "the AI companies" as one switch. The controls are separate, and mixing them up can give away more than you intended, or block things you wanted to keep.

- **OpenAI: two separate switches, so you can pick and choose.** Their own documentation confirms the search door and the training door are independent. You can let the search assistant in so your site shows up in results, while telling the training crawler to stay out.
- **Google: one door, so decide all-or-nothing.** For Google's AI tools, training and citation travel together in a single lever. Block it and you also shut the citation path; allow it and you've accepted both. Because there's no middle setting, the useful step is to write down which of the two you chose and why; a one-line note now saves you from wondering later what you meant.
- **Check it yourself in five minutes.** Open `https://your-site.com/robots.txt` in a browser and see which crawler names actually appear. In our own live file, the training-block group had been removed, leaving only a comment explaining why. That is proof a file can quietly change meaning without looking broken.
- **Don't rely on the header alone.** We also tried to read the content-signal headers that are supposed to declare these choices separately; three attempts all failed to return anything usable. So treat any such signal as unverified until you can actually see it.

One caution: whether other providers allow this same fine-grained split is something our test could not confirm, so don't assume what works for one company works for all.

<div class="lm-card lm-card--takeaway" data-lm-figure="explain-takeaway" data-lang="en"><span class="lm-card__title">Takeaway</span><p class="lm-card__takeaway">This experiment suggests multiple blocking switches exist, but the header validation failed so it could not be confirmed.</p></div>

## What this article could not verify

- The actual values of the Cloudflare Content-Signal header, search, ai-train, and ai-input. All three runs failed, so none of them was observed.
- How citations actually change on real search surfaces such as AI Overview. That is outside the scope of this experiment.
- Whether Anthropic's bot tokens separate search from training. The document body did not appear in the excerpts, so this could not be confirmed.
- The cause of the difference between the live robots.txt and its original. The version-history tool called git had no saved copy of robots.txt, so I could not find out why the live file changed.
- This judgment would be wrong if Google starts offering a separate token or setting that controls training and grounding independently. It would also be wrong if a controlled observation shows AI search citations persisting after Google-Extended is blocked.

## References

1. [robots.txt](https://www.jangwook.net/robots.txt) jangwook.net
2. [OpenAI crawlers and fetchers](https://platform.openai.com/docs/crawlers) OpenAI
3. [Anthropic docs](https://docs.anthropic.com/) Anthropic