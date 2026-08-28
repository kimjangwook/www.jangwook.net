---
title: 谷歌一天内为 Preferred Source 配齐了专用文档，而让网站退出谷歌 AI 搜索的官方手段只有一句片段指令
description: 谷歌在 8 月 20 日发布 Preferred Source 的同一天，就配好了专用文档、按钮代码和发布公告；但想让网站不被 AI 搜索采用，官方文档里只剩一句片段指令。本文用数字说明这种不平衡，以及网站运营者今天该做的两件事。
pubDate: '2026-08-28'
heroImage: ../../../assets/blog/preferred-source-inclusion-only-exclusion-lever-unlanded-2026/hero.png
tags:
- google-search
- preferred-source
- ai-overviews
relatedPosts:
- slug: ai-crawler-control-robots-txt-llms-txt-2026
  score: 0.7
  reason:
    en: If Google shipped a dedicated publisher on-ramp on day one, this guide covers
      the hands-on strategy of using robots.txt and llms.txt to block AI training
      crawls while still permitting citation.
    ko: 구글이 발표 당일부터 언론사를 위한 전용 온보딩을 만들었다면, 이 글은 robots.txt와 llms.txt로 AI 크롤러의 학습은
      막고 인용은 허용하는 실전 제어 전략을 다룹니다.
    ja: Googleが発表当日からパブリッシャー向けの専用オンボーディングを用意したなら、この記事ではrobots.txtとllms.txtでAIクローラーの学習をブロックしつつ引用を許可する実践的な制御戦略を解説します。
    zh: 谷歌在发布当天就为出版方搭建了专用入口，而本文将讲解如何用 robots.txt 和 llms.txt 阻止 AI 爬虫训练、同时允许引用的实战策略。
---

如果你的网站或公众号的内容会被谷歌的 AI 搜索拿来回答别人的问题，这篇文章讲的事和你有关。谷歌为"把你的内容放进来"准备了完整的入口：有专门的说明文档、有可以直接复制的按钮代码、还有当天的发布公告。但"把你的内容从 AI 回答里拿出来"这条路，官方文档里只有一句话。这不只是感觉，数字可以证明：一边是一整页产品文档，一边是四个词组成的一句话。

先给一个类比。这就像街角新开的店办会员卡：办卡的手续，店员替你跑，宣传单满街都是；可是想退卡，你得自己去翻墙角那张贴着的小告示，上面一行字就是全部说明。两条路都存在，但详细程度完全不同。一家店真正希望你做哪件事，看它把哪份说明写得更用心就知道了。谷歌也一样：文档写得越细，说明它投入得越多。

## 8 月 20 日发布公告里"加入"一侧的分量

2026 年 8 月 20 日，谷歌发布了 Preferred Source。意思是读者可以把你选成"偏好的来源"。之后在 AI 搜索的回答里，你的内容会带上一个"首选"的标记，更容易被看到。我们把这篇公告的原文拿来数了词：表达 preferred source 的地方出现了 7 次，还提到谷歌新闻栏目 Top Stories 1 次、AI Overviews 1 次、AI Mode 2 次。AI Overviews 和 AI Mode 是谷歌搜索里由 AI 直接生成回答的功能。同一篇公告里，表达"退出搜索收录"的词实际上一次都没出现——仅有的 1 处表示退出的英文 opt out 是新闻订阅页的"你可以随时退订"，跟搜索无关。

![8月 20日发布公告文本计数结果，preferred source 表达出现了 7 次。](../../../assets/blog/preferred-source-inclusion-only-exclusion-lever-unlanded-2026/log-announcement-inclusion-vs-exclusion-wording.png)

这篇公告还告诉发布者：想加按钮，去 Search Central 的文档里找按钮代码。Search Central 是谷歌给网站运营者看的官方说明中心。也就是说，谷歌不但发布了功能，还指明了你要去哪里、复制哪段代码。这条路从公告到落地，当天就通了。

## "加入"一侧的专用文档确实存在

我们检查了 Search Central 左侧导航里的全部 154 个文档路径，确认其中有一个叫 preferred-sources 的专用文档。它能正常打开，页面上标注的最后更新日期是 2026-08-20——和发布公告是同一天。功能发布当天，说明文档同步上线，这是"产品级投入"的标准动作。

![Search Central 导航 154 个路径中确认了 preferred-sources 专用文档 1 个的记录。](../../../assets/blog/preferred-source-inclusion-only-exclusion-lever-unlanded-2026/log-docs-inclusion-lever-absence.png)

## "退出"一侧的全部官方说明只有一句话

那想让 AI 回答里少出现自己的内容怎么办？谷歌关于 AI 搜索功能的开发者文档里，答案只有一句话：如果你想让页面信息在搜索里少被展示，就用 nosnippet、data-nosnippet、max-snippet 或 noindex 这几个控制项。这四个词都是网站页面上可以放的小标记，作用分别是"不要展示摘要"之类。同一份文档里，opt out、exclude 这类明确的"退出"字眼出现了 0 次。

![在 ai-features 开发者文档的文字里计数，退出类指令共 4 处。](../../../assets/blog/preferred-source-inclusion-only-exclusion-lever-unlanded-2026/log-docs-exclusion-lever-inventory.png)

有一种反驳值得认真对待：一句话就够了。这些小标记用了好多年，经过验证，谷歌也把 AI 功能划为搜索的一部分，所以用它们来控制退出是一致的设计——运营者不用，是自己的选择，不是路太薄。这个说法在规则内部是成立的。但数字摆在那里：同一天，"加入"一侧拿到了专用页面、按钮代码和发布公告，"退出"一侧只有这 4 个词的一句话。这种不平衡是客观存在的。

## 我们自己网站的 12 个页面里，标记实际落在 0 个

规则里写了这个做法，和页面上真的配置了这个做法，是两回事。我们从自家网站给搜索引擎看的网址清单（站点地图）里抽了 12 个网址，逐个检查页面代码里有没有真的放那些"别展示"的标记。结果是：12 个页面里，一个都没有。也就是说，即便我们想退出，这条唯一的官方通道，在我们自己的部署里一次也没有用过。

![自家站点地图样本 12 个 URL 中指令落地为 0 的记录。](../../../assets/blog/preferred-source-inclusion-only-exclusion-lever-unlanded-2026/log-own-deployment-lever-landing.png)

这里要澄清一个常见的误会。有些网站在另一个叫 robots.txt 的文件里写了 Google-Extended 的屏蔽规则。robots.txt 是网站用来告诉爬虫程序"哪些内容你可以看"的清单，Google-Extended 是谷歌的一个爬虫名称。很多人以为屏蔽了它，AI 回答就不会用自己。但谷歌官方文档明确写着：Google-Extended 不影响你的网站在谷歌搜索中的收录，也不作为搜索排名的信号。换句话说，屏蔽了它，你在搜索和 AI 回答里的出现方式一点都不会变。我们查证过，目前的官方文档确实把 Google-Extended 归到"谷歌的其他系统"，和搜索分开。

## 应该放进团队检查清单的两项

不管你的目标是把内容从 AI 回答里拿出来，还是多放进去，解决“以为做到了”和“实际做到了”之间落差的方法都一样：动手数一遍。落到日常操作上，就是两个检查项。

**想把内容从 AI 回答里拿出来的团队**，在每次页面更新发布的检查清单里加一条：从网站给搜索引擎看的页面清单里挑几个网址，逐个打开页面。数一数“不要展示这页的摘要”的标记是不是真的贴在了页面上。我们自己数的结果是 12 个页面里 0 个贴了——在我们抽查的 12 个页面里，贴了这个标记的是 0 个——就这份样本而言，退出路径一次也没有真正落地。同时把谷歌的官方原话写进团队维基。谷歌明确写过：屏蔽 Google-Extended 这个爬虫名字，并不影响网站在谷歌搜索里的收录。钉上这句话，团队就不会再把“屏蔽了 AI 爬虫”误当成“退出了 AI 回答”。

**想让内容更多出现在 AI 回答里的团队**，这种不对称反而对你有利。你只需要确认页面上没有贴任何阻止摘要的标记——谷歌说了，进入 AI 功能没有额外的技术要求，所以什么都不贴本身就是资格。然后照着谷歌发布当天就写进 Search Central 文档的那个按钮代码去做：到 Search Central 文档里的 Preferred Sources 页面，把现成的按钮代码复制过来贴上。

不管选哪边，把这两项写在下一次发布前大家都会看到的检查清单里。清单条目能撑过人员变动；“我记得我们处理过这件事”撑不过。

## robots.txt 里管 AI 的那行，和能不能出现在搜索里，是两回事

Google 官方文档里有一句话说得很直白：用来限制 AI 训练的 Google-Extended，“不会影响网站在 Google 搜索中的收录，也不会被用作搜索排名的依据”。用日常的话打个比方：robots.txt 里那行“不许 AI 进来”的标记，就像家门口挂的一块“谢绝推销”的牌子——它管的是推销员（AI 模型），但邮递员（搜索爬虫）照样会按地址把你的页面送到搜索结果里。

这一点很重要，因为很容易产生误会：有的站长看到自己的内容被 AI 用了，第一反应是“那我把它挡住，搜索里是不是也别展示了”。按 Google 自己的说明，这两个门是分开的。想控制内容在搜索结果里怎么被摘录展示，走的是另一套开关（比如限制摘要的那几个标记）；想限制 AI 训练，走的是 Google-Extended。一块牌子管一扇门，别指望挂错地方也能起作用。

## 本文未能核实的部分

这次只测了官方文档和公告的文字表面，没有登录过谷歌给网站管理者用的后台 Search Console 的实际操作界面，所以界面上有没有对应的开关，本文不能下结论。帮助中心的页面因为是脚本外壳，测不到内容，只能算未测量。另外，那些屏蔽标记对 AI 回答引用的实际效果，以及别的网站有没有真的用这些标记，本文都没有测。接下来要核实的是界面里的实际开关形态，以及标记与 AI 引用之间的因果关系。

这个判断在什么条件下会错：如果哪天谷歌改了官方说明，"从 AI 回答里排除自己的规则"也拿到了专用文档、注册流程和发布公告，或者"屏蔽爬虫与 AI 回答无关"的说法被推翻，这篇文章的结论就算过时作废。

## 参考资料

1. [AI features / Google Search Central](https://developers.google.com/search/docs/appearance/ai-features) — Google
2. [Google-Extended / Google Search Central (google-common-crawlers)](https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers) — Google
3. [Preferred sources / Google Search Central](https://developers.google.com/search/docs/appearance/preferred-sources) — Google
4. [Personalize search and discover news with preferred sources / Google blog 발표문 (Aug 20, 2026)](https://blog.google/products-and-platforms/products/search/personalize-search-discover-news/) — Google