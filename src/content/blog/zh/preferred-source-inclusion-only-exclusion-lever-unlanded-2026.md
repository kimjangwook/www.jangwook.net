---
title: Google 为进入 AI 搜索准备了专门文档，退出的方法却只剩一句摘要控制指令
description: Google 在 Preferred Source 发布两天内就配好了专属说明和按钮代码，但把网站从 AI 搜索里拿出来的方法，在官方文档里只有一句话。这篇文章用日常例子讲清这种不对称，以及网站经营者接下来该检查什么。
pubDate: '2026-08-28'
heroImage: ../../../assets/blog/preferred-source-inclusion-only-exclusion-lever-unlanded-2026/hero.png
tags:
- google-search
- ai-overviews
- preferred-source
relatedPosts:
- slug: ai-crawler-control-robots-txt-llms-txt-2026
  score: 0.7
  reason:
    en: Now that Google has shipped a dedicated page for getting into AI search, pairing
      Preferred Sources setup with concrete robots.txt and llms.txt crawler control
      is essential.
    ko: Google이 AI 검색 진입용 전용 페이지를 공개한 지금, Preferred Sources 설정과 함께 robots.txt·llms.txt로
      크롤러를 제어하는 구체적 전략이 필요합니다.
    ja: GoogleがAI検索専用ページを公開した今、Preferred Sourcesの設定と合わせてrobots.txt・llms.txtでクローラーを制御する具体的な戦略が不可欠です。
    zh: 在Google上线AI搜索专用页面的当下，将Preferred Sources设置与robots.txt、llms.txt爬虫控制策略结合使用至关重要。
---

想象你家门口开了个摊位。市场管理方第一天就给你送来了欢迎招牌、贴纸和宣传单，教你怎么让更多顾客找到你。可你要是想歇业或者撤出市场，翻遍手册，只有细则里的一句话。Google 的 AI 搜索现在就是这个摊位：请进来的路修得又宽又亮，出去的路只有一行小字。

## 进入 AI 搜索有专属页面，退出只有一句话

这件事跟你的日常有什么关系？如果你有自己的网站，或者公司有网站，它在 Google 的 AI 回答里出现多少、怎么出现，已经变成了和以前“搜索排名”差不多的资产。管理这份资产有两个方向：让它多出现、让它少出现。这两个方向能用的工具差得很远。

2026 年 8 月 20 日，Google 发布了一个叫 Preferred Source 的新功能。这个词的意思是：用户可以在 Google 里把某个网站设为“偏好来源”，之后这个网站的内容在 AI Mode 和 AI Overviews 这两种 AI 搜索结果里——前者是像聊天一样回答问题的搜索，后者是搜索结果顶部的 AI 总结——会带上一枚“preferred”徽章，被更醒目地展示出来。

发布同一天，Google 的开发者文档站上就出现了一个专门讲这个功能的页面，页面标注的更新日期就是 2026 年 8 月 20 日。发布文里还直接告诉出版方：想要的话，去 Search Central 文档拿“Preferred Source”按钮代码就行。也就是说，从“告诉你有这功能”到“给你可以贴上的按钮”，一天之内全齐了。

进入网站的方法很齐全。那退出的方法呢？我们实际数了数。

![ai-features 文档文本计数 raw 输出 — 排除指令 nosnippet、data-nosnippet、max-snippet、noindex 各 1 处，opt out、exclude 0 处。](../../../assets/blog/preferred-source-inclusion-only-exclusion-lever-unlanded-2026/log-docs-exclusion-lever-inventory.png)

Google 讲 AI 搜索功能的那份官方文档里，关于怎么把网站从这些功能中排除，正文里只有一句话。这句话把四个控制开关捆在一起说：

> 要限制搜索结果中来自你网页的信息展示，请使用 nosnippet、data-nosnippet、max-snippet 或 noindex 控制。
> — [AI features / Google Search Central](https://developers.google.com/search/docs/appearance/ai-features)

这四个词是“摘要控制指令”。解释一下：网页可以给搜索机器人贴小标签，比如“请不要摘录我的内容”或者“干脆别收录这一页”。这四个指令就是这类标签里的四个名字，都是 Google 用了很多年的老标准。同一个文档里，“opt out”（选择退出）和“exclude”（排除）这两个词，数出来是 0 处。

一句话，四个老标签，再没有别的。这就是退出方法在官方文档表面能看到的全部。

## Preferred Source 发布文里的用词分布

进入和退出的不对称，在发布文本身的用词里也能数出来。

我们把 8 月 20 日那篇发布文的全文做了词频统计。"preferred source"这个词组出现了 7 处，Top Stories 出现 1 处，AI Overviews 1 处，AI Mode 2 处。而表示“退出、排除”的词，实际有效的出现次数是 0——全文里唯一一处 "You may opt out at any time"（你可以随时退出）出现在新闻通讯订阅栏的说明里，跟搜索退出毫无关系。

对出版方的指引也一样。发布文没有让出版方去 Search Console（Google 给网站管理者的后台），而是让他们去 Search Central 文档拿按钮代码。进入这条路，是有人领着、有现成工具、一步到位的。

![Preferred Source 发布文文本计数 raw 输出 — preferred source 7 处，排除类词汇实际 0 处。](../../../assets/blog/preferred-source-inclusion-only-exclusion-lever-unlanded-2026/log-announcement-inclusion-vs-exclusion-wording.png)

具体到你的网站：想让它多露脸，Google 已经把工具送到你手边了。反过来，如果你想控制露出，Google 预期你自己动手贴标签——没有人给你做按钮。

## Google-Extended 和搜索收录被官方明确分开

这里有个很多人会踩的坑，值得单独讲。

有一种叫 robots.txt 的文件，是网站放在根目录下的“访客守则”，用来告诉各种爬虫机器人哪些地方不许进。其中有一个针对 AI 的条目叫 Google-Extended，很多网站都写了它，以为这样就能“不被 AI 用到”。

但 Google 的官方文档写得很清楚：

> Google-Extended 不影响网站在 Google 搜索中的收录，也不作为 Google 搜索的排名信号使用。
> — [Google-Extended / Google Search Central (google-common-crawlers)](https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers)

同一份 AI 功能文档里也有一句分工说明：

> 要限制在 Google 其他系统中的 AI 训练和 grounding，请阅读 Google-Extended 的相关内容。
> — [AI features / Google Search Central](https://developers.google.com/search/docs/appearance/ai-features)

翻译成日常的话：Google-Extended 管的是 Google 别的 AI 系统，比如训练模型那部分；而搜索里的 AI 功能（AI Overviews、AI Mode）被 Google 划定为“搜索本身的一部分”。所以守则里写了“AI 别来”，搜索里的 AI 照样可以来。就像你在门口贴了“谢绝推销”，快递员照样能敲门——因为你挡的是推销员，不是快递。

![Google-Extended 文档相关段落 raw 输出 — 确认有 1 句说明对搜索收录无影响。](../../../assets/blog/preferred-source-inclusion-only-exclusion-lever-unlanded-2026/log-falsifier-google-extended-covers-search-ai.png)

换句话说，想控制搜索 AI 功能里的露出，唯一写在文档上的路就是那四个摘要控制指令，而且它们得贴在网页本身上，不是贴在 robots.txt 里。

## 我们自己 12 个网页的检查结果

光看文档还不够，我们检查了自己的网站。

做法是：从网站的站点地图——也就是把全站网址列成一张清单的目录页——里取了 12 个网页作为样本，逐个查看这些页面有没有贴上前面说的那种“摘要控制指令”。结果是 0/12——12 个页面里，一个贴了指令的都没有。

![自有网站地图 12 个 URL 检查 raw 输出 — 指令落点 0/12。](../../../assets/blog/preferred-source-inclusion-only-exclusion-lever-unlanded-2026/log-own-deployment-lever-landing.png)

同一时间，我们的网站在 robots.txt 里也写了针对 AI 的拦截条目——Google-Extended 的 2 行禁止规则，外加一条内容信号声明。我们“以为”自己在管理 AI 露出，实际上按 Google 的官方标准，这 12 个页面对搜索的 AI 功能完全敞开着。

关键在于：写没写拦截文件，和页面实际在不在 AI 搜索里，是两件互不相干的事。以为前者能管住后者，就是这次测量抓到的落差。这不一定是我们独有的问题——凡是写了“AI 拦截”就以为安全的网站，都可能处于同样的状态。

## 什么情况下这个判断会错，以及接下来该做什么

有一种公平的反驳值得摆出来：nosnippet 这类指令是经过多年验证的标准，Google 把搜索 AI 功能当作搜索的一部分来管理，统一归到摘要控制里，本身是自洽的设计。运营者不去用这些指令，可能不是工具太薄，而是自己的选择。

这个反驳在规则逻辑上是对的。但同一份发布、同一天，进入方向拿到了专属页面、按钮代码和公开数字，退出方向只有一句四个词的小字——不对称有数字为证，不是靠讲道理就能否认的。

那么，这个判断什么时候会错？用大白话说：如果 Google 哪天在官方文档里写明“用 Google-Extended 这类条目也能让网站从搜索的 AI 功能里退出”，或者在摘要控制指令之外另外公布了正式的退出方法，这篇文章的判断就作废了。

给两类读者各一句“那就这样做”：

- **想让网站在搜索和 AI 回答里出现得更多的人**：检查你的页面没有贴“别摘录”的标签就可以了。robots.txt 里的 AI 相关条目跟搜索曝光无关，不用因为它放心，也不用为它担心。
- **想控制或退出 AI 露出的网站负责人**：从站点地图里抽一批网址，逐页数一下有没有 nosnippet 系列指令实际贴在页面上，把这份清单留成检查记录。别再把 robots.txt 里那两行当成“已经退出”的证据。

## 本文未能核实的部分

这次只测了文档的文字表面，没有测三样东西：Search Console 后台里实际界面上有没有开关（需要登录，这次没能验证）；其他网站的摘要指令使用比例（只查了我们自己的 12 个页面）；以及这些指令对 AI Overviews 实际引用效果的因果影响。接下来要核实的是：等 Search Console 的界面能用工具检查时补上界面验证，并在更大的页面样本上重新清点有没有贴这些指令。

## 参考资料

1. [AI features / Google Search Central](https://developers.google.com/search/docs/appearance/ai-features) — Google
2. [Google-Extended / Google Search Central (google-common-crawlers)](https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers) — Google
3. [Preferred sources / Google Search Central](https://developers.google.com/search/docs/appearance/preferred-sources) — Google
4. [Personalize search and discover news with preferred sources / Google blog 발표문 (Aug 20, 2026)](https://blog.google/products-and-platforms/products/search/personalize-search-discover-news/) — Google