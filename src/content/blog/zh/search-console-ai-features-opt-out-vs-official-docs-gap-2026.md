---
title: '我们在 Search Central 文档里找"退出 AI"的开关，没有，这就是问题所在'
description: '法务提工单要求内容不出现在 AI Overviews 里，工程团队改了一行 robots.txt 就把工单关了。我们把 Google 四份官方文档逐字数了一遍，发现那张工单从没真正关过。'
pubDate: '2026-08-21'
heroImage: '../../../assets/blog/search-console-ai-features-opt-out-vs-official-docs-gap-2026/hero.png'
tags:
  - SEO
  - GEO
  - Search Console
  - AI Overview
relatedPosts:
  - slug: robots-snippet-controls-ai-overviews-2026
    score: 0.8
    reason:
      ko: 그 글은 nosnippet 이 AI Overviews 인용 자격까지 끈다는 사실을 다뤘다. 이 글은 그 넷(nosnippet, data-nosnippet, max-snippet, noindex) 말고는 배타 레버가 아예 없다는 것, 그리고 그것이 왜 문서의 누락이 아니라 설계인지를 다룬다.
      ja: あちらは nosnippet が AI Overviews の引用資格まで止めることを扱った。こちらはその四つ（nosnippet, data-nosnippet, max-snippet, noindex）以外に排他レバーが存在しないこと、それが文書の欠落ではなく設計である理由を扱う。
      en: That post showed nosnippet also cuts AI Overviews citation eligibility. This one shows there is no fifth lever beyond those four, and why that absence is architecture, not a documentation gap.
      zh: 那篇讲的是 nosnippet 也会切断 AI Overviews 的引用资格。这篇讲的是除了这四个（nosnippet, data-nosnippet, max-snippet, noindex）之外根本没有第五个排他开关，以及这为什么是架构问题而不是文档遗漏。
  - slug: ai-crawler-control-robots-txt-llms-txt-2026
    score: 0.72
    reason:
      ko: 그 글은 크롤러를 들여보낼지 말지의 문제였다. 이 글은 이미 들어온 뒤 검색과 AI 표면 중 어디에 인용될지를 나누는 자격 판정 자체가 하나로 묶여 있다는 것을 다룬다. 층이 다르다.
      ja: あちらはクローラーを入れるか否かの問題だった。こちらは既に入った後、検索とAI表面のどちらに引用されるかを分ける資格判定そのものが一本に束ねられている点を扱う。層が違う。
      en: That post was about letting crawlers in or not. This one is about the eligibility judgment itself, made after entry, that decides both search and AI surfaces at once — a different layer entirely.
      zh: 那篇讲的是让不让爬虫进来。这篇讲的是爬虫进来之后，决定它能否出现在搜索和 AI 界面的资格判定其实是同一条判定线——这是完全不同的层。
  - slug: official-geo-subtraction-gsc-control-2026
    score: 0.68
    reason:
      ko: 그 글이 GSC 로 무엇을 뺄 수 있는지의 공식 범위를 다뤘다면, 이 글은 그 범위 밖에 있는 것 — AI 전용 배타 항목의 부재 — 을 문서 원문 어휘 카운트로 증명한다.
      ja: あちらが GSC で何を除外できるかの公式範囲を扱ったなら、こちらはその範囲の外にあるもの — AI専用の排他項目の不在 — を文書原文の語彙カウントで裏付ける。
      en: If that post mapped the official scope of what GSC lets you subtract, this one proves what sits outside that scope — the absence of an AI-only exclusion — with a raw word count from the source documents.
      zh: 如果那篇梳理的是 GSC 能减掉什么的官方范围，这篇用源文档的原文词频，证明范围之外缺失了 AI 专属排除项。
---

法务提了工单：让我们的内容别出现在 AI Overviews 里。我去找对应的开关，把 Google 的 AI features 文档逐字读了一遍，又对 Google 昨天发布的公告跑了词频统计。转头再拿生产环境的 robots.txt 和渲染后的页面对照两份文档，看开关该长在哪。结果根本没有开关。搞清楚原因后，不用再找了。

Google 的 AI features 文档只点名了四个能减少页面在 Search 中曝光的开关：`nosnippet` 切断搜索摘要和 AI Overviews 的引用资格，但不影响索引本身；`data-nosnippet` 把切断精确到页面里的特定元素；`max-snippet` 限定摘要显示的字符长度；`noindex` 把页面从索引里整体拿掉，连带切断一切摘要和引用资格。没有一个是专为 AI 设计的。同一套资格判定同时决定普通搜索摘要和 AI Overviews 两个表面，判定从未拆分成两条线，第五个能只把内容从 AI Overviews 拿掉、又保留普通搜索摘要的开关，也就从未出现过。如果团队靠改 robots.txt——那份告诉爬虫哪些页面可以抓取的配置文件——来关闭"别让我们出现在 AI 里"的工单，那就关错了工单。

工单要的东西和工程交付的东西经常对不上。法务要的是业务结果——不让生成式回答消费内容。工程交付的是一行 robots.txt。请求和实现看起来一样，只是因为两边都用了"AI"这个词。拆开来看，实质是要决定愿意牺牲多少自然搜索流量。

## 变了什么，没变什么

先看两份关键文档。Google Search Central 的 [AI features and your website](https://developers.google.com/search/docs/appearance/ai-features) 页面，是唯一一份讲怎么降低 AI 曝光的文档，末次修改时间标注为 2025-12-10（UTC，即全世界通用的标准时间基准）。2026-08-20，Google 发布了 [A more personalized Search, Discover and News](https://blog.google/products-and-platforms/products/search/personalize-search-discover-news/)，推出"Preferred Source"——让用户选出自己想优先看到的站点，配套的 [Preferred sources](https://developers.google.com/search/docs/appearance/preferred-sources) 页面写明 Preferred 徽章会展示"in AI Mode and AI Overviews"，文档时间戳正是发布当天 2026-08-20 UTC。

对比时间线：讲怎么获得曝光的文档在功能上线当天就更新了，讲怎么减少曝光的文档八个多月没动过。我无法断言这代表 Google 内部决定冻结排除工具，文档更新滞后同样说得通。但公开文本毫不含糊，词频统计摆在那里。

我统计了 AI features 页面全文（177,842 字节）的字面字符串。"Opt out"：0 次。"Opt-out"：0 次。"Exclude"：0 次。一份专讲页面如何出现在 AI 功能里的文档，从未出现过关闭这类呈现的词汇。公告里恰好出现 1 次"opt out"，落在一句和搜索排除毫无关系的退订提示中。公告正文共 9,045 字节，"preferred source"出现 7 次，"publisher" 8 次，"Top Stories" 1 次，"AI Overviews" 1 次，"AI Mode" 2 次，而"Search Console"、"turn off"、"exclude"、"remove"、"block"全是 0。公告的所有词汇都在指向收录，两份文档找不到任何排除词汇。

## 机制——第五个开关为什么从未出现

AI features 文档直接写明了资格判定规则："To be eligible to be shown as a supporting link in AI Overviews or AI Mode, a page must be indexed and eligible to be shown in Google Search with a snippet, fulfilling the Search technical requirements."（要在 AI Overviews 或 AI Mode 中作为支持性链接展示，页面必须已建索引，并有资格在 Google Search 中以摘要形式展示，满足 Search 的技术要求。）没有另立一套 AI 资格判定。AI Overviews 和 AI Mode 的引用资格，走的是和普通搜索摘要相同的关口：已索引，且有摘要资格。

这句话解释了整套架构。如果 AI 引用用的是独立关口，Google 早该为它配一个专属开关，就像 Google-Extended 是 AI 训练和 grounding 的专属开关那样——为 AI 回答实时喂入网页数据，而不是纯粹靠记忆生成。但两边共用同一个关口。Google 为什么不索性把它拆开？重读资格判定就能看出答案：要建只针对 AI 的排除开关，得先把资格判定拆成两条流水线——一条给搜索，一条给 AI。既然没有拆分，专属开关也就没地方装。文档写得很直白：AI 内建于 Search 之中，是 Search 运作方式不可分割的一部分，这正是为什么 Googlebot 的 robots.txt 指令是站点所有者管理站点抓取访问的控制手段（原文："AI is built into Search and integral to how Search functions, which is why robots.txt directives for Googlebot is the control for site owners to manage access to how their sites are crawled for Search."）。同一套资格判定，既决定人类在搜索结果下方看到什么，也决定语言模型能引用什么。

收录侧遵循同一套逻辑。根据文档，Preferred Source 也没有改动基础资格判定，只是在上面叠加了一个信号——选择站点的用户会看到内容标注"preferred"徽章（原文："your content can be highlighted with a 'preferred' badge for users who have selected your site as a preferred source."）。底层关口原封不动，只是在上面加了一个条件。这是架构设计的必然，不是时间巧合。

## 大家转而求助的那份文档，回答的是另一个问题

Google-Extended 是工程师收到 AI 排除工单时第一个想到的爬虫标识——拿它当开关是有据可查的错误。Google 的 [crawlers and fetchers](https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers) 指南写道："Google-Extended does not impact a site's inclusion in Google Search nor is it used as a ranking signal in Google Search."（Google-Extended 不影响站点在 Google Search 中的收录，也不作为 Google Search 的排名信号使用。）在 robots.txt 里禁止 Google-Extended，阻止的是把内容用于训练 Gemini 模型或为 Vertex AI 应用提供 grounding 数据，不会改变页面在 Google Search 或 AI Overviews 中的展示状态。

crawlers and fetchers 文档的词频统计印证了这一范围：Google-Extended 出现 6 次，Gemini 4 次，Vertex 8 次，AI Overviews 0 次，AI Mode 0 次。文档词汇集中在模型训练和企业级 grounding，没有触及工程师以为 Google-Extended 能控制的搜索表面。

我对自家 robots.txt 和站点地图跑了一轮健康探针——六个配置单元、每单元重复三次，共十八次运行，每次请求都返回 exit 0（意味着执行过程没有出错、正常结束）和 HTTP 200，接收字节数与预设基准完全一致，零次触发机器人拦截页面。这十八次运行只证明部署本身健康，不构成对 Google-Extended 边界的证伪。为了检验"Google-Extended 会不会其实也影响 AI Overviews，跟文档说的不一样"这条假设，我单独跑了一个反证单元来推翻前提。虽然 Google 可能随时更新文档与爬虫行为，但这次反证尝试没有推翻前提：Google-Extended 确实只作用于训练端。

## 我们的部署踩中了这种失败模式

区分搜索与训练不是纸上谈兵。我们在生产环境的 robots.txt 里维护着两组 Google-Extended 禁止指令，以及针对 GPTBot（OpenAI 的训练爬虫）和 CCBot（Common Crawl 的抓取机器人）的指令。我们还写了一行 Content-Signal 标头——按用途声明爬虫权限的语法——内容是 `search=yes,ai-train=no,use=reference`。每一条指令拦的都是训练或第三方抓取，没有一条启用 Google 明文列出、用于降低搜索面 AI 曝光的四个开关。

我从站点地图里抽取了十二个 URL 的确定性样本——地图共 351 个 URL、71,340 字节 XML——逐个检查渲染后 HTML 中的 robots 或 googlebot meta 标签。十二个 URL 都没有带这四个摘要指令。团队上个月如果仅凭 robots.txt 就把"让内容别出现在 AI Overviews"的工单标记为完成，部署对目标毫无作用，只是表面上结了单。

工单标题和配置改动的 diff 里都出现了"AI"这个词，审核者一看到 `Google-Extended` 下面的 `Disallow: /`，就批准了 pull request（代码变更合并请求）。审核时谁也没有回头核对 AI features 文档里关于摘要资格的说明，也没抽查过渲染后的 HTML——批准依据始终只是 diff 里的指令与工单标题在字面上重合。

## 反方的论点，以及它真正成立的地方

主要的反方论点是：现有的四个开关已经足够精细，用不着再加专属开关。论点在哪里站得住、哪里站不住，取决于问的是"删哪些内容"还是"谁能看到这次删除"。精细度回答的是前一个问题——把一段文字包进 `data-nosnippet`，删除范围可以细到页面里的单个元素，不必牵连整页。但后一个问题答不了：一旦删掉文字，会同时从 AI Overviews、AI Mode、普通搜索摘要以及所有依赖摘要资格的表面上一并消失，四个开关谁也没法只挑其中一个表面下手。反方论点的边界就在这里——对颗粒度成立，对表面区分不成立。

反方论点在内容颗粒度上站得住脚。`data-nosnippet` 是元素级控制，不是页面级控制。工程师可以只把一段付费墙内容或会员专属摘要包起来，单独排除那一小块，页面其余部分照样保有完整的摘要资格。类似地，`max-snippet` 控制字符长度，而不是非此即彼的一刀切。如果 Google 只提供页面级的 `noindex` 和 `nosnippet`，"工具太粗糙"的批评就成立。元素级颗粒度已经有了，在内容层面运作精准，只是无法按表面分区。

团队常忽略元素级精度带来的工程成本：它假定模板能按元素分支渲染。跨数百个页面共用一套模板的站点，无法直接对特定元素选择性添加 `data-nosnippet`，必须先搭出条件分支路径。做选择性排除，模板层的工程改造必须走在标签上线之前。

## 这要付出什么代价，不需要付出什么代价

收录是免费的。文档写得很清楚：要出现在这些功能里，不需要新建机器可读文件、AI 文本文件或额外标记（原文："You don't need to create new machine readable files, AI text files, or markup to appear in these features."）。正常建立索引、具备摘要资格的页面，什么都不用做就已经是 AI Overviews 的引用候选。Preferred Source 也是同一套模式：不需要新数据结构，只需要一个按钮和一层叠加在既有资格判定之上的官方信号。

排除是要付费的。唯一可用的开关全都依附于摘要控制，无法区分 AI 消费还是搜索摘要展示。一旦启用排除指令，就会连带牺牲 AI 引用和普通搜索摘要。Google 不公布排除会造成多少流量损失，团队想知道答案，只能自己算。Google 公告给出了一个具体数字——用户选择了"超过 60 万个独立来源"——但这反映的是用户偏好，不是发布方的流量影响。缺少官方数据时，这个数字只能算用户采纳指标，不能作为业务 ROI 指标。

排除决策真正的成本，是关掉摘要所损失的自然搜索流量。工程团队在修改 robots.txt 或加 `data-nosnippet` 之前，必须要求工单附带流量估算。

## 团队要定的四条规则

发现的脱节要定成四条规则：

第一条最花功夫：工单模板得把"让内容别出现在 AI 里"这一句拆成两条独立条目，一条叫"搜索面 AI 排除"，本质是用摘要可见性去交换的业务决策；另一条叫"训练排除"，纯粹是配置爬虫指令的技术决策。两条混在一起写，审核的人根本分不清自己批的是哪一种代价。第二，开启排除开关的 pull request 必须在描述里写明目标页面群的自然搜索流量占比——审核者核准的是业务影响，不是代码 diff。第三，人工查看 robots.txt 的验收环节该退场了，换成自动化的持续集成关卡（CI 关卡）：从站点地图抽样 URL，核对生产环境渲染 HTML 中的 `robots` 与 `googlebot` meta 标签，声明和渲染对不上就中止部署，站点地图抽样探针本身就是关卡的最小雏形。第四条最简单：内部文档禁用"屏蔽 AI 爬虫"这类模糊说法，训练写 Google-Extended，搜索摘要和引用写 `data-nosnippet`。

这种脱节和处理 CDP（客户数据平台）与 DSR（数据主体请求）中的数据删除请求如出一辙：业务需求范围很宽，技术实现边界很窄，团队容易在未满足原始需求时误将工单标记为完成。个人警惕性靠不住，团队必须为"完成"给出明确定义，才能防止这种错位。

拿我们自己举例：像我们这样靠自然搜索获取线索和商机的 B2B 平台，一条搜索摘要没了就可能少一个进线，法务工单的正确结单方式是完全不碰排除开关，把精力放在 Preferred Source 接入与摘要资格维护上——在这套架构里，收录免费，排除才需付费，我们没有理由主动付费。销售付费研报或订阅数据库的团队则不同：内容本身是商品，对付费段落挂 `data-nosnippet` 才划算，只是同样要先把流量损失算进预算。这些发现全部来自公开文档、官方公告与生产环境探针，尚未验证登录后的 Search Console 后台界面是否藏有未公开配置。但在 Google 真正将资格判定拆为两条流水线之前，只要判定依然合并，"只在 AI 中排除"就仍是一场必须用搜索摘要流量来买单的业务决策。

## 参考资料

- [A more personalized Search, Discover and News](https://blog.google/products-and-platforms/products/search/personalize-search-discover-news/)
- [AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)
- [Preferred sources](https://developers.google.com/search/docs/appearance/preferred-sources)
- [Google crawlers and fetchers — Google-Extended](https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers)
- [Robots meta tag, data-nosnippet, and X-Robots-Tag specifications](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag)
