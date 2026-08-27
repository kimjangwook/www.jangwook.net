---
title: Preferred Source 的不对称：Google 上线了“被选入”的开关，“被排除”只剩一句话
pubDate: '2026-08-21'
description: Google 2026 年上线 preferred sources 当天就配齐了专用文档、发布公告和徽章；而从生成功能中排除站点的官方路径只有一句话。本文实测文档表面与自部署样本，讨论这对站点运营者的实际含义。
heroImage: ../../../assets/blog/preferred-source-opt-out-gap-2026/hero.png
relatedPosts:
- slug: ai-crawler-control-robots-txt-llms-txt-2026
  score: 0.7
  reason:
    en: While Google reshapes search exposure with preferred sources, the next step
      is controlling AI crawlers with robots.txt and llms.txt—blocking training while
      allowing citation.
    ko: 구글이 선호 소스로 검색 노출을 재편하는 동안, AI 크롤러까지 통제하려면 robots.txt와 llms.txt로 학습은 막고 인용은
      허용하는 전략이 이어집니다.
    ja: Googleが優先ソースで検索の露出を再編するなか、AIクローラーまで制御するにはrobots.txtとllms.txtで学習はブロックし引用は許可する戦略が続きます。
    zh: 在Google用首选来源重塑搜索曝光的同时，下一步是用robots.txt和llms.txt控制AI爬虫——阻止训练但允许引用。
- slug: declared-rules-fail-open-robots-txt-agents-md-2026
  score: 0.7
  reason:
    en: Google's preferred sources launch, shipped with only partial documentation,
      mirrors the 219-run finding that robots.txt and AGENTS.md pass silently when
      rules get truncated.
    ko: 선호 소스 기능이 문서화조차 반쪽으로 선 채 출시된 지금, 규칙이 누락돼도 조용히 통과되는 robots.txt와 AGENTS.md의
      219회 실측 결과가 그 실패 양상을 보여준다.
    ja: Googleがドキュメント付きで公開したpreferred sources機能も、ルールが欠落してもエラーなく動くrobots.txtとAGENTS.mdの219回実測が示す失敗モードと同じ構造を持つ。
    zh: Google带着文档仓促上线的preferred sources功能，正呼应了219次实测揭示的真相：robots.txt与AGENTS.md的规则即使被截断也静默通过。
---

## 一个发布日的两份工单

2026 年 8 月 20 日，Google 在 blog.google 发布了 Search 的 preferred sources：用户可以把某个站点选为偏好来源，此后在 AI Mode 和 AI Overviews 中，该站点的内容会带一个 "preferred" 徽章。同一日期，开发者文档 `developers.google.com/search/docs/appearance/preferred-sources` 已上线，HTTP 200，Last updated 2026-08-20 UTC，正文里 "preferred source" 出现 24 次。

同一天，另一份工单停在了排期之外。想在 Google 的生成功能里“把我的站点拿出去”，官方文档给出的全部指令就是 ai-features 页里的一句话：用 `nosnippet`、`data-nosnippet`、`max-snippet` 或 `noindex`。没有专用页面，没有公告，没有徽章。扣除控制单元后的词频：这四个指令各出现 1 次，"opt out" 0 次，"exclude" 0 次。

一边是发布当天配齐公告、文档、徽章的全套交付物；一边是只有一句话的说明。这就是本文要量化的不对称。

## 用排班表理解这两个方向

运维团队熟悉这种局面：值班表上，“把某人加进 on-call 轮换”有一整套流程——排班系统里有按钮，有日历视图，有交接文档，有提醒通知。而“把某人从轮换里暂时拿掉但保留他的其他权限”呢？排班工具里没有这个开关，唯一能写的是备注栏里一行字：“调整时注意此人不值夜班。”这行字不绑定任何逻辑，不会有人执行。

preferred sources 就是那个有按钮的流程：它是一个新增的用户侧表面，上线时带上了新表面需要的一切——公告、专用文档、徽章行为。而排除方向被 Google 重新归类过：AI Overviews 和 AI Mode 不是独立服务，而是 Search 的功能。既然 AI“内置在 Search 中、是 Search 运作方式的一部分”，那么从 Search 中退出就是唯一的排除路径——这句话本身就是文档的第一句。排班系统没有为“只不值夜班”造开关，因为在系统定义里，夜班和整个排班是同一个东西。

问题在于：规定不等于工具。一条已定义的政策要变成可执行的控件，文档必须把路径描述到运营者能落地的程度。一行备注做不到，一句话也做不到。

## 实测：文档表面与部署落地的两层数

把 Google 的开发者文档当作分布式系统里的服务注册表来读：已部署、可访问的是真相，顺嘴提一句的不算。这次实验抓取了五个表面——ai-features 文档、robots-meta-tag 文档、Google-Extended 爬虫文档、blog.google 公告，以及本站的 sitemap 和 robots.txt——做 token 计数，扣除控制单元的样板噪声。6 个单元各跑 3 次，共 18 次，全部 exit 0，全部 fetch HTTP 200，字节数与基线一致，零模型调用，完全确定性。

| 杠杆 | 文档表面 | 证据 |
|---|---|---|
| 包含（preferred source） | 专用页面，HTTP 200，更新于 2026-08-20 UTC | 文档正文 "preferred source" 出现 24 次；左侧导航 154 个路径中含该页 |
| 包含（公告） | blog.google，2026-08-20 | "preferred source" 出现 7 次 |
| 排除（AI 功能） | ai-features 文档里的一句话 | `nosnippet`、`data-nosnippet`、`max-snippet`、`noindex` 各 1 次；"opt out" 0、"exclude" 0 |
| Google-Extended 作为排除杠杆 | google-common-crawlers 文档 | "AI Overviews" 0 次、"AI Mode" 0 次 |

最后一行最关键。多数运营者遇到这个问题，第一反应是去 robots.txt 里加一条 Google-Extended。但那份文档明确说它只用于 Gemini 和 Vertex 的 grounding，并且“不影响站点在 Google Search 中的收录，也不作为 Google Search 的排名信号”。反证实验——Google-Extended 文档是否在任何地方点名 AI Overviews 或 AI Mode——结果是否定的。也就是说：只禁 Google-Extended，你没有碰到 AI Overviews 和 AI Mode 中的任何一个。

文档是一层，部署是另一层。本站 sitemap 共 351 个 URL，确定性取样 12 个（排序后取前 12，四语言共用同一模板），抓取原始 HTML 并统计 nosnippet 系 meta 指令：

```
样本 12 URL → meta=[] 全部为空
robots meta 标签：0/12
googlebot meta 标签：0/12
语料中唯一一次 "nosnippet" 命中：博客列表卡片里的旧文章标题（字符串，非 meta 标签）
```

结果是 0 比 12。更微妙的是 robots.txt：里面有两行 `Google-Extended` 的 Disallow、`Content-Signal: search=yes,ai-train=no,use=reference`、两行 GPTBot、两行 CCBot。部署侧已经投入大量精力于社区杠杆和厂商特定杠杆，而 Google 官方的那个杠杆——nosnippet 家族——在 0 个页面上落地。

## 最有力的反驳对了一半

最常见的反对是：这不是缺杠杆，而是有意设计。Google 把 AI 功能定义为 Search 的一部分，所以退出 Search 就是退出 AI 功能。这个读法在规定层面是对的——它就是 ai-features 文档的第一句，不是我的推断。

但规定要变成工具，中间还差一步。看这四个指令的实际语义，它们并不等价：

- `noindex`：整个页面从 Search 移除。完全排除，完全代价。
- `nosnippet`：移除摘要。按文档说法，这同时限制了 Search 能从你的页面展示的信息——同一个指令既影响 AI 功能，也降低了普通搜索结果的质量。
- `data-nosnippet`：标记页面片段。部分控制，但它与生成式引用的交互在文档表面上没有任何说明。
- `max-snippet`：限制摘要长度。`max-snippet:0` 这类组合能否把“在 AI Overviews 中被引用”与“显示为摘要”这两个资格分开？文档对这个问题沉默。

所以反驳对到的精确边界是：文档里不存在一条可实现的路径，能让你“留在 Search、保留摘要资格、但退出 AI Overviews”。存在的是一捆绑交易——排除杠杆会连同你的搜索资产价值一起烧掉。这像一个没有粒度的 feature flag：你只有整个子系统的关停开关，没有按模块的灰度。

不对称背后的机制是产品方向，不是技术难度。AI Overviews 和 AI Mode 被重新归类为 Search 的功能，Google 就没有动力为它们新造排除界面——现有的 Search 控件按定义就是控件。preferred sources 反过来是新的用户侧表面，所以带着新表面需要的全部东西发布。文档和公告同日上线，这个细节说明：文档不是产品的事后记录，它是产品的一部分。杠杆在文档中的有无，是产品路线图留下的脚印。

## 两条应对路径

**如果你真的需要排除**——数据授权内容、合规敏感材料——nosnippet 家族是唯一的官方杠杆，并且它会同时牺牲你在普通 Search 中的摘要资格。把这个代价算进去。不要让一条 Google-Extended 的 robots.txt 记录或一个 Content-Signal 头制造出“已有控制”的错觉：社区杠杆对训练类爬虫有用，但它们不是 Google 自家搜索生成功能认可的官方路径。

**如果你不需要排除**——多数发布者不需要——就停止寻找那个不存在的开关。可测量、可行动的表面在包含侧。preferred sources 带着完整文档和徽章机制上线，公告还提到用户已经选择了超过 600,000 个独立来源。检查你的站点是否为它做了准备，并审计哪些 URL 有摘要资格——在当前设计里，摘要资格是普通搜索展示和 AI 引用共同的下层基础。

这个审计便宜且确定：从 sitemap 抽 12 个 URL，抓 HTML，grep meta 标签里的 `nosnippet`、`data-nosnippet`、`max-snippet`。得到的数字就是你在这一轴上实际控制的 URL 数。对多数部署，这个数字是 0——它应该写进风险登记表，而不是等有人问“为什么这篇页面出现在了 AI Overview 里”之后再补。

## 本文没有测的三件事

第一，Search Console 界面里是否有 preferred source 开关——需要认证会话，本实验只停在官方文档表面。第二，真实的 AI Overviews 和 AI Mode 管线是否按文档尊重 nosnippet 系指令——本实验测的是文档和部署，不是 Googlebot 解析器的实机行为。第三，部署样本是一个站点的四个语言模板，不要直接推广到你的集群，先跑自己的计数。另外 support.google.com 是 JS 壳（可见文本仅 2,697 字节），无法作为缺席证据。

能推广的是方法。当一个发布让文档和公告同日上线，数一数文档表面上的实物——专用页面、token 频率、对真实 HTML 的指令落地数——是区分真杠杆和传说的可靠办法。在下一次“加一行 robots.txt 就完事”的迁移之前，先跑一遍。

## 参考资料

1. "AI features in Search," Google Search Central, developers.google.com — https://developers.google.com/search/docs/appearance/ai-features (fetched 2026-08-21)
2. "Google-Extended (google-common-crawlers)," Google Search Central — https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers (fetched 2026-08-21)
3. "Personalize news in Search and Discover," Google, blog.google — https://blog.google/products-and-platforms/products/search/personalize-search-discover-news/ (fetched 2026-08-21)
4. "Preferred sources," Google Search Central, last updated 2026-08-20 UTC — https://developers.google.com/search/docs/appearance/preferred-sources (fetched 2026-08-21)