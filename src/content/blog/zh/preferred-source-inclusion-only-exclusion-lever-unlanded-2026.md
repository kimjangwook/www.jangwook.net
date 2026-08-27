---
title: 当天上线的按钮与埋没的一句旧规则
description: Google 想让网站进入 AI 搜索的那扇门，发布当天就配好了按钮和说明书；想退出的那扇门，官方只留了老规章里的一句话。抽查的 12 个网页上，一句这样的字条都没贴。
pubDate: '2026-08-28'
heroImage: ../../../assets/blog/preferred-source-inclusion-only-exclusion-lever-unlanded-2026/hero.png
tags:
- google-search
- ai-overview
- 网站运营
relatedPosts:
- slug: ai-crawler-control-robots-txt-llms-txt-2026
  score: 0.7
  reason:
    en: Google's same-day sign-up kit for AI search shows exactly how the 2026 strategy
      of blocking training while permitting citation via robots.txt plays out on a
      real site.
    ko: 구글이 당일 출시한 AI 검색 가입 키트는 robots.txt로 학습과 인용을 갈라 놓는 2026 전략이 실제 사이트에 어떻게 적용되는지
      보여주는 실행 사례다.
    ja: Googleが当日公開したAI検索サインアップキットは、robots.txtで学習と引用を分ける2026戦略が実際のサイトでどう機能するかを示す実例である。
    zh: 谷歌当天上线的AI搜索注册套件，正是robots.txt“阻训练、允引用”2026策略在真实站点上落地的实例。
---

## 同一个话题的两个方向和两扇门

Google 新推了一个功能，让网站可以申请成为 AI 搜索里的"偏好来源"。什么是"偏好来源"？打个比方：AI 搜索在回答问题时会引用一些网站，就像班里出黑板报会引用同学交来的小报。被选为"偏好来源"的网站，就像被老师点名表扬、名字旁边加了个小星星的那份小报。

这件事有两个方向。一个方向是"请把我的网站放进 AI 搜索里"。另一个方向是"请把我的网站从 AI 搜索里拿出去"。这次要看的就是：这两扇门，各自准备好了什么。

对我来说这意味着什么：我用搜索引擎找资料，看到的内容很多已经是 AI 整理过的。哪些网站能进来、哪些能出去，直接决定我看到的答案里有什么。

## 学校公告栏的对比

想象学校有一面公告栏。你想让自己的通知贴上去，很简单。公告栏旁边放着申请表，还有一整页讲解怎么填，发布当天就齐了。

但你想要求"别贴我的东西"呢？官方的说法只有一句，藏在很老的一本规章里。而且我们挨个看了十几个教室的门，没有一扇门上贴着这样的字条。

想贴上去容易，想揭下来难。这就是这篇文章要讲的不对称。

## "请放进来"这一侧：当天就齐了

2026 年 8 月 20 日，Google 发布了"偏好来源"功能。同一天，专门的说明书页面就出现在开发者文档上，页面标注的更新日期正是 2026-08-20。

发布消息里写着，发布方可以拿到"偏好来源"按钮的代码，放到自己网站上用。

> 如果你是发布方，可以在我们的 Google Search Central 文档里找到新的 "Preferred Source" 按钮代码，马上开始使用。
> — [Personalize Search and Discover with preferred sources](https://blog.google/products-and-platforms/products/search/personalize-search-discover-news/)
> — [Personalize Search and Discover with preferred sources](https://blog.google/products-and-platforms/products/search/personalize-search-discover-news/)

这次发布给出的唯一一个规模数字，是选择了偏好来源的独立来源数量：超过 600,000 个。也就是说，已经有六十多万个来源选择"请放我进来"。

落到我身上的事：如果我希望我的网站被 AI 搜索引用，路是现成的。当天就有按钮、有说明书、有人数。

## "请拿出去"这一侧：只剩一句老规则

想退出的那扇门呢？官方开发者文档里，能找到的正式方法只有一句话。这句话把 4 种标记捆在一起说：网站可以用 nosnippet、data-nosnippet、max-snippet 或 noindex 这几种控制方式。这 4 个词是网页上的小纸条，告诉搜索引擎"这里别引用""整页别收录"之类的意思。

原文是这样写的：

> To limit the information shown from your pages in Search, use nosnippet, data-nosnippet, max-snippet, or noindex controls.
> — [AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)
> — [AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)

发布消息那边，"退出"方向的用词实际上没有出现，唯一一处"你可以随时退出"是 newsletters 的说法。没有按钮，没有当天上线的说明页。

很多人以为自己早就挡住了 AI 爬虫。爬虫就是自动来抓取网页内容的程序。一个常见的做法是在一个专门写给搜索引擎看的指令文件里，这个文件叫 robots.txt，挡住一个叫 Google-Extended 的程序。但官方文档明确说，挡住它不影响你的网站进不进 Google 搜索。所以它不是退出 AI 搜索的那扇门。

对我实际有影响的地方是：我如果自以为"已经设置过了"，可能只是关了一扇根本不通向那个房间的门。

## 那句话实际落到了几个页面上

规则写在文档里，但得有人真的把它放到自己网页上才管用。就像规章里写"想请假要交纸条"，可如果没人交纸条，这条规则就等于不存在。

我们抽查了一个实际运营的网站（jangwook.net），按它网站自己列出的一份网页目录取了 12 个网页，这份目录叫站点地图，检查有没有那 4 种标记里的任何一种落到页面上。结果是 0，12 个里一个都没有。

12 个网页，0 个有退出标记。

有人会说：一句规则就够用了，反正 noindex 一种就能让整页从搜索里消失；一个六十多万来源在用的新功能，退出开关当然不需要很多说明书。这个说法对了一半，开关确实存在。但不对的是另一半：进来的方向当天就有专用文档和按钮，出去的方向只剩老规章里的一句话，而且这句话在实际网页上一次都没出现。开关躺在文档里，没装到任何一扇门上。

这里我需要留意的是："我设置过了"和"规则真的贴到了我的页面上"是两回事。

## 常被当成挡箭牌的几个设置

现在把常见的几个"我以为挡住了"的设置摆出来看它们到底站在哪。

Google-Extended：官方明说不影响搜索收录，不是这个用途的开关。llms.txt 这类给 AI 看的说明文件：不在官方文档的退出路径里。这些都不是那扇门。

官方文档表面真正列出的退出路径，就是那一句捆绑的 4 种页面标记。想在 AI 搜索里不出现，就得让这 4 种标记中的一种真正写进自己网站的页面模板里。写没写，得去自己的页面上一条条查。

最后落到我身上的：文档的篇幅怎么分配，就说明平台真正想让什么发生。想进来的方向，当天全套；想出去的方向，一句话，而且没人用。

## 本文未能核实的部分

这次没有确认两件事：一是 Google 给网站管理员用的管理后台 Search Console 里有没有开关，因为需要登录，没测到；二是只测了一个网站的 12 个页面，不能代表所有网站都这样。接下来要核实的，是更多网站和登录界面里的实际情况。

这个判断在什么条件下会错：如果官方文档指出了这一句之外的新的退出开关，或者被调查的那个网站上普遍能找到退出规则，这篇文章的判断就不成立。

想退出的人：别再相信"我早就设置过了"，先去自己的页面上查那 4 种标记里到底有没有一种真的写上去了。想被引用的人：别再往文件里加新东西，直接去用新发布的"偏好来源"按钮和它的说明书。

## 参考资料

1. [AI features and your website](https://developers.google.com/search/docs/appearance/ai-features) — Google Search Central
2. [Preferred sources — appearance docs](https://developers.google.com/search/docs/appearance/preferred-sources) — Google Search Central
3. [Personalize Search and Discover with preferred sources](https://blog.google/products-and-platforms/products/search/personalize-search-discover-news/) — Google (The Keyword)
4. [Google common crawlers — Google-Extended](https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers) — Google Search Central