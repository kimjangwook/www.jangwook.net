---
title: "我把 Google AI features 文档逐字数了一遍：没有退出开关，这是架构决定的"
description: "AI features 文档全文 177,842 字节里，opt out、opt-out、exclude 各 0 次。为什么不存在 AI 专属排除开关，以及团队该拿什么替代它。"
pubDate: '2026-08-21'
heroImage: '../../../assets/blog/search-console-ai-features-opt-out-vs-official-docs-gap-2026/hero.png'
tags:
  - SEO
  - GEO
  - AI Overview
  - Engineering Management
relatedPosts:
  - slug: robots-snippet-controls-ai-overviews-2026
    score: 0.86
    reason:
      ko: 그 글이 nosnippet 계열 네 레버가 실제로 어떻게 착지하는지를 페이지 단위로 실측한 기록이라면, 이 글은 그 네 레버 말고는 아무것도 없다는 사실이 왜 문서의 누락이 아니라 설계의 결과인지를 다룬다.
      ja: あちらが nosnippet 系の四つのレバーがページ単位でどう着地するかの実測記録なら、こちらはその四つ以外に何も無いことが文書の抜けではなく設計の結果である理由を扱う。
      en: That post measures how the four nosnippet-family levers actually land on a page. This one explains why there is nothing besides those four, and why that absence is a design outcome rather than a documentation gap.
      zh: 那篇是对 nosnippet 系四个开关在页面上如何落地的实测记录；这篇则解释为什么除了这四个什么都没有，以及这种缺席为何是设计结果而非文档遗漏。
  - slug: ai-crawler-control-robots-txt-llms-txt-2026
    score: 0.81
    reason:
      ko: robots.txt로 학습을 막는 일과 검색면 AI 인용에서 빠지는 일은 다른 결정이다. 그 글이 크롤러 토큰 쪽 지도라면, 이 글은 그 지도를 들고 잘못된 티켓을 닫아 온 팀에게 보내는 정정이다.
      ja: robots.txt で学習を止めることと、検索面のAI引用から外れることは別の決定だ。あちらがクローラートークン側の地図なら、こちらはその地図を手に誤ったチケットを閉じてきたチームへの訂正になる。
      en: Blocking training via robots.txt and dropping out of AI citations in Search are different decisions. That post maps the crawler-token side; this one is the correction for teams who have been closing the wrong ticket with that map in hand.
      zh: 用 robots.txt 拦训练，和从搜索面的 AI 引用中消失，是两个不同的决定。那篇画的是爬虫令牌那一侧的地图，这篇是写给拿着那张地图关错工单的团队的更正。
  - slug: official-geo-subtraction-gsc-control-2026
    score: 0.75
    reason:
      ko: 선언한 robots.txt와 실제 배포본이 어긋나 있던 그 경험이 이 글의 CI 게이트 제안으로 이어졌다. 파일을 읽는 검사와 렌더 결과를 세는 검사는 다른 것을 본다.
      ja: 宣言した robots.txt と実際の配信物がずれていたあの経験が、この記事の CI ゲート提案につながっている。ファイルを読む検査とレンダー結果を数える検査は別のものを見ている。
      en: The gap between a declared robots.txt and what actually shipped is what led to the CI gate proposed here. Reading a file and counting rendered output are two different inspections.
      zh: 声明的 robots.txt 与实际部署物之间的偏差，正是本文提出 CI 门禁的由来。读文件的检查和数渲染结果的检查，看的是两样东西。
---

我想弄清楚 Google 到底有没有做过一个 AI 专属的排除开关：让页面继续留在普通搜索结果里，同时从 AI Overviews 和 AI Mode 中消失。2026 年 8 月 21 日，也就是 Preferred Sources 发布的第二天，我把官方 AI features 文档的原始 HTML 拉下来数了一遍词。全文 177,842 字节里，`opt out` 0 次，`opt-out` 0 次，`exclude` 0 次。

这种缺席不是谁忘了补的文档窟窿，而是架构本身长出来的结果。这种缺席意味着积压在待办列表里的那条需求——“别让 AI 用我们的内容”——根本不是一项工程任务，而是一个商业决定：你愿意放弃多少自然搜索流量。下面是证据，以及我现在强制执行的四条规则，好让这类需求不再被关到错误的文件上。

## 词频数出来的东西

AI features 文档指名的、能减少页面在搜索中展示内容的手段，只有四个：

> To limit the information shown from your pages in Search, use nosnippet, data-nosnippet, max-snippet, or noindex controls.
> — [AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)

这四个手段没有一个是专门为 AI 打造的。它们就是多年来管着普通搜索结果展示的那套摘要控制机制。文档的末次更新时间戳写着 2025-12-10 UTC，也就是说，在我统计词频的那天，文档已经八个多月没动过。

再看同样这八个月里的另一个方向。Google 8 月 20 日的公告推出了 Preferred Sources，对应的开发者文档更新时间戳是 2026-08-20 UTC，和公告同一天。公告正文 9,045 字节，里面 `preferred source` 7 次，`publisher` 8 次，`Top Stories` 1 次，`AI Overviews` 1 次，`AI Mode` 2 次。而 `Search Console`、`turn off`、`exclude`、`remove`、`block` 全是 0 次。公告里确实出现过一次 `opt out`，但那属于页尾邮件订阅退订的提示语：“You may opt out at any time.”

公告给出的唯一一个规模数字，是用户侧的。

> Readers more easily find their favorite publications in Top Stories, AI Overviews, and AI Mode, while publishers gain a more seamless way to connect with readers across Google. So far, people have already selected more than 600,000 unique sources.
> — [A more personalized Search, Discover and News](https://blog.google/products-and-platforms/products/search/personalize-search-discover-news/)

60 万是用户选中的独立来源数量。它不是发布方的效果指标，谁也不该把它端到高管面前当成效果指标讲。

## 那个旋钮没有地方可装

机制就是文档里的一句话，下游的一切都由它决定。

> To be eligible to be shown as a supporting link in AI Overviews or AI Mode, a page must be indexed and eligible to be shown in Google Search with a snippet, fulfilling the Search technical requirements.
> — [AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)

AI 引用资格不是一条带独立输入的新流水线，它直接复用已有的那次判定：有没有建索引，能不能带摘要展示。想在这上面装一个 AI 专属的排除旋钮，Google 得先把这次资格判定劈成搜索和 AI 两条分支。但 Google 并没有做拆分，旋钮也就没有安装面。

这里我要对自己的措辞留一句余地。把它称作“共用的同一道关口”是我的归纳，不是 Google 的原话。文档写的是 "fulfilling the Search technical requirements"，我从这句话里读出了一次共用判定；如果 Google 日后把两条一直存在的分支写进文档，那是我读错了，而不是平台变了。

收录方向也支持同一套结构。Preferred Sources 完全没有改动基础资格，只是在上面叠了一层信号。

> In AI Mode and AI Overviews, your content can be highlighted with a "preferred" badge for users who have selected your site as a preferred source.
> — [Preferred sources](https://developers.google.com/search/docs/appearance/preferred-sources)

同一份文档还把话说死了，收录侧不需要任何新建工作：“You don't need to create new machine readable files, AI text files, or markup to appear in these features.” 而讲到访问控制，文档把控制权直接指回了 Googlebot 本身：“AI is built into Search and integral to how Search functions, which is why robots.txt directives for Googlebot is the control for site owners to manage access to how their sites are crawled for Search.” 想靠拦 Googlebot 躲开 AI Overviews，代价就是离开 Search。价签写得明明白白。

## 工单关到了错误的文件上

大型网站改版的现场，AI 排除需求永远是同一副长相。法务或公关说一句“别让 AI 用我们的内容”，工程师打开 robots.txt，把 Google-Extended 设成 Disallow，在 Content-Signal 那行补上 `ai-train=no`，报完成。需求是“把我们从 AI 里拿掉”，实现是“我们退出了训练”。两句话都带着 AI 这个词，于是审核的人看到 `Google-Extended` 底下那条 `Disallow: /` 就批了 PR，工单关闭。

问题在于 Google-Extended 压根不碰 Search。

> Google-Extended does not impact a site's inclusion in Google Search nor is it used as a ranking signal in Google Search.
> — [Google crawlers and fetchers](https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers)

那份爬虫文档的词频分布直接告诉你这个令牌管的是哪块地：Google-Extended 出现 6 次，Gemini 4 次，Vertex 8 次；`AI Overviews` 0 次，`AI Mode` 0 次。Google-Extended 管的是模型训练和 Gemini、Vertex 那侧的 grounding。AI Overviews 和 AI Mode 不在 Google-Extended 的控制范围里。

在客户数据平台处理过删除请求的人，会对这种脱节感到眼熟。需求的口径很宽，系统只够得着它知道怎么碰的那条最窄的技术边界，而只要没有一份写下来的 definition of done，“我做了”和“这事成了”就会悄悄分家。没有人撒谎。审核者读的是真文件，看到的是真指令。

我同一天对自己的生产站点跑了一次探针，想看看在我自己能控制的站点上实际差距有多大。六个配置单元，每个重复三次，共 18 次运行。每次请求都返回 exit 0 和 HTTP 200，接收字节数与预登记的基准完全一致，零次撞上机器人拦截页。这实际验证的是我自己部署版本的健康状况，并没有检验 Google-Extended 的边界落在哪里。我另外跑了一个单元，专门试着推翻“Google-Extended 管得着搜索面 AI 功能”这个前提，没有跑出能证伪该前提的数据。没能推翻，比确认要弱得多，我也只按这个分量算它。

真正有分量的是更小的那部分。`sitemap-ko.xml` 71,340 字节，列了 351 个 URL。我抽了一个确定性样本，12 个，逐个看渲染后的页面带了什么。12 个页面的 `robots` 和 `googlebot` meta 标签全是空的。四个控制手段里，一个都没有在样本中生效。而我的 robots.txt 里有两组 Disallow Google-Extended，一行 `Content-Signal: search=yes,ai-train=no,use=reference`，还有拦 GPTBot 和 CCBot 的指令。所有打开的开关都在训练那一侧。搜索面的摘要，一个都没开。12 是个小样本，扩大样本之后结果可能有所变动，但样本指向的方向正是我预料的那个：配置文件里声明的东西，渲染结果从来没有承接。

## 四条轴线，用来终结评审里的争论

**收录方向对排除方向。** 同样的八个月里，收录方向拿到了专属文档、一段发布在 Search Central 的按钮代码，以及一次发布当天的更新；排除方向拿到的是一份从十二月起就没动过的文档。收录的实现成本是零，不需要新文件，不需要标记。排除的成本是那条摘要原本给你带来的全部流量。

**训练排除对搜索面排除。** Google-Extended、GPTBot、CCBot 关掉的是模型训练与 grounding，对 Search 的收录和排名没有影响。nosnippet 系列控制手段关掉的是搜索中的展示，而由于资格是共用的，它会连带波及 AI 表面。不同的开关，不同的代价，只共用一个词，而这个词一直在讨论中把两者搅在一起。

**内容颗粒度对表面区分。** 你能控制哪些句子出现，控制不了它们出现在哪个表面。这条留到下一节讲，因为对我这套解读最有力的反驳就在那里。

**声明对着陆。** robots.txt 是声明，渲染出来的 meta 标签才是实际部署物。我那 12 个样本的对比结果，就是把声明与落地当成两项独立检查的全部理由。

## “四个控制已经够精细了”

针对上面所有内容，认真的反驳是这样的：不是没有独立的 AI 排除开关，而是压根不需要，现有的四个已经足够精细。

在颗粒度这一层，这个反驳是对的，我想把它完整承认下来，而不是复述一个削弱版本。`data-nosnippet` 作用在元素级，你可以只包住一个段落、一段引文、一张价目表。`max-snippet` 按字符数调节。如果工具只有 `noindex` 和页面级的 `nosnippet`，那句“这些器械太钝了”的批评就站得住。但事实并非如此。控制手段本身足够精细，我已经不再拿“工具太钝”当论据。

反驳崩掉的地方在于：精度回答的是“我删掉什么”，不是“它从哪里消失”。给一个段落挂上 `data-nosnippet`，这个段落会同时从 AI Overviews、从 AI Mode、从普通搜索摘要里消失。这一控制手段没有表面参数。一个想离开 AI、留在 Search 的发布方，要的不是更细的工具，而是 API 里根本不存在的一根轴。

还有一笔成本，这个反驳通常会跳过。元素级精度的前提，是模板能分支。用一套共用模板批量生产出来的站点，在有人先把条件分支搭出来之前，任何选择性应用都做不了。对这类站点，诚实的估算不是一行标记，而是先改造模板结构，再加那一行标记。

所以范围我认，立场我保留。在一个页面内部，工具箱是够用的。跨表面，什么都没有，而团队真正想要的恰恰是跨表面的控制。

## 四条规则，按这个顺序

我把 linter 放在第一位，因为只有它能抓住已经躺在生产环境里的错误。

从 sitemap 里抽一个确定性样本，渲染每个 URL，统计渲染输出中的 `robots` 和 `googlebot` meta 标签数量，一旦渲染结果与声明的策略对不上就让构建失败。我那 12 个 URL 的样本就是这件事的最小可用版本。读一遍 robots.txt 就当验证完毕，正是让这种偏差长期潜伏的无效检查方式。

第二，把策略文档拆开。“搜索面 AI 排除”是花摘要预算的商业决定，“训练排除”是碰一个爬虫令牌的技术决定。两个独立条目，绝不合成一条。

第三，任何打开排除开关的 PR，描述里不写清受影响页面群承担的自然搜索流量占比，就不许合并。如果没人拿得出这个数字，该 PR 就还没准备好——数字本身就是决定。

第四，“屏蔽 AI 爬虫”在内部是禁用说法。要么说令牌，要么说表面。训练就说 Google-Extended，搜索摘要和引用就说 `data-nosnippet`。

有一件事我没查：登录后的 Search Console 界面里，到底有没有 AI 功能相关的栏目。我没数它，也不主张它不存在。公告把发布方引向 Search Central 文档而不是 Search Console，这只是旁证，仅此而已。

## 签工单之前该量的东西

别从“我们要不要退出 AI”起手。先量“这个页面群的收入有多少压在搜索摘要的可见性上”。没有这个数字就发下来的排除指令，等于一笔不知道金额就授权的付款。

单位经济学是不对称的，这正是提问顺序必须颠倒过来的原因。收录基本免费，没有新文件，没有标记，连工程工单都不用开。排除要你交出那条摘要原本带着的自然流量，而这个损失幅度 Google 不公布任何数字，每一次估算都只能来自你自家的分析数据。于是便宜的一侧可测，昂贵的一侧不可测，而这恰恰是团队把昂贵那侧定价过低的典型条件。

对于搜索流量就是线索来源的团队——B2B 平台、电商、企业官网——我会把“不要碰排除开关”直接写进标准，把力气花在 Preferred Sources 接入和维持摘要资格上。对于内容本身就是商品的团队——付费文章、订阅数据库、会员专属编辑内容——元素级的 `data-nosnippet` 是站得住的，前提是那些页面群的自然流量下滑在标签上线之前就进了预算，而不是在下个季度的报表里被发现。

我的判断是这样。AI 专属排除开关的缺席，不是等着 Google 某次发布来解决的临时状态。它是共用资格判定的推论；在这一判定被拆分为两条路径之前，人们想要的那个组合造不出来。能证明我错的条件很窄也很具体：Google 在文档里写出一个控制手段，让页面从 AI Overviews 和 AI Mode 中移除，同时继续带着摘要出现在普通结果里。不是一篇暗示这件事的博客，是文档里的一个控制手段。

我也把这一保留说明摆在明处。一份文档静止八个月，并不能确立排除政策已成定局，它同样可以只是一次还没发布的文档更新。更新历史不陈述政策。

它反映的是平台的重心往哪儿倾斜。数一数哪个方向的文档在发布当天被同步更新，哪个方向的文档搁置了八个月，仅凭词汇分布就能看出：平台当下在向用户推销什么，又回避了什么。

## 参考资料

- [A more personalized Search, Discover and News](https://blog.google/products-and-platforms/products/search/personalize-search-discover-news/)
- [AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)
- [Preferred sources](https://developers.google.com/search/docs/appearance/preferred-sources)
- [Google crawlers and fetchers](https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers)
- [Robots meta tag, data-nosnippet, and X-Robots-Tag specifications](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag)
