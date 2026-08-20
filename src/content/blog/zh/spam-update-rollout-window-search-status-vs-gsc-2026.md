---
title: 'Google把spam update的开始时刻精确到分钟公开，接进Search Console后精度依然磨平'
description: 'August 2026 spam update在incidents.json里留下精确到秒的开始时间戳，抓取无需认证。但Search Console的日期轴按太平洋时间整天对齐，分钟级信息一进连接键就变成边界日里前后混合的一天。查了八份官方文档、跑了九次实测：这个数据值得抓，但只能用来打标签，不能用来提高相关分析精度。'
pubDate: '2026-08-20'
heroImage: '../../../assets/blog/spam-update-rollout-window-search-status-vs-gsc-2026/hero.png'
tags:
  - search-console
  - google-search-status
  - spam-update
  - gsc-api
  - seo-measurement
relatedPosts:
  - slug: gsc-platform-properties-social-video-search-measurement-2026
    score: 0.88
    reason:
      ko: 같은 Search Console을 다루지만 이번엔 '언제'가 아니라 '어디서'의 문제다. API 필드와 문서 사이의 시차라는 같은 종류의 어긋남을 다룬다.
      ja: 同じSearch Consoleを扱うが、今回は「いつ」ではなく「どこ」の問題だ。APIフィールドと文書の間の時差という同種のズレを扱う。
      en: Same Search Console surface, but a different mismatch — API fields versus what the docs say is available, not when.
      zh: 同样围绕Search Console，这次问的是"哪里"——API字段与文档之间同一类落差。
  - slug: official-geo-subtraction-gsc-control-2026
    score: 0.82
    reason:
      ko: 공식 문서와 실제 배포 사이의 행 단위 차이를 추적한 글. 이번 글의 '선언값 vs 기계 기록'과 같은 종류의 틈을 다른 표면에서 확인한다.
      ja: 公式文書と実際のデプロイの行単位の差を追った記事。今回の「宣言値 vs 機械記録」と同種の隙間を別の表面で確認する。
      en: Tracks a line-by-line gap between official docs and what is actually deployed — the same declared-versus-observed gap, on a different surface.
      zh: 追踪官方文档与实际部署之间逐行差异的一篇。和"声明值 vs 机器记录"是同一类缝隙，只是换了个表面。
---

Google状态面板把每次排名更新的开始时刻标到了分钟级。把开始时刻直接接进Search Console分析管道，能不能让相关分析更准？拉下incidents.json、Atom订阅、HTML面板、Search Console API文档四份材料核对，跑了几段Python算边界，答案是不能。时刻本身没有问题，问题出在Search Console的连接键：按太平洋时间整天切，分钟级信息一进去就磨平了。

把Search Console API跑成定期批处理的团队会直接撞上这道落差。8月18日这次spam update在太平洋时间早上9点27分开始，如果直接用日期对齐性能数据，管道会把起点那天当成完全正常的一天算进去——实际上那天已有六成时间在新算法下跑了。

## 三个入口，三种时间写法

同一个开始时刻，三个官方入口给出三种写法。HTML面板：

> August 2026 spam update Active Start Time: 18 Aug 2026, 09:27 PDT Last update: 18 Aug 2026, 09:28 PDT Impacted products: Ranking

> — [Google Search Status Dashboard](https://status.search.google.com/)

Atom订阅的`<summary>`标签里：

> Incident began at 2026-08-18 09:27 (all times are US/Pacific).

> — [Google Search Status Dashboard Updates](https://status.search.google.com/feed.atom)

incidents.json里是RFC3339格式的UTC：`"begin":"2026-08-18T16:27:00+00:00"`。三处指向同一分钟，解析难度却不同：JSON能直接程序处理，HTML和Atom都要靠正则或字符串匹配去抠自然语言时间。更容易踩坑的是Atom：`<updated>`标签写着`2026-08-18T16:28:47+00:00`，看着像开始时刻，实际是公告生成时刻，比开始晚了1分47秒。如果拿`<updated>`当开始时间，遇到公告延迟更久的事故就会放大偏差。

## 发生了什么

三种写法对应同一起事件。Search Status Dashboard的incidents.json里，August 2026 spam update记录写着：

> "id":"LEubPCm2octf2uMqCFKE","number":"453832737276420062","begin":"2026-08-18T16:27:00+00:00","created":"2026-08-18T16:28:47+00:00","external_desc":"August 2026 spam update"

> — [Search Status Dashboard incidents.json](https://status.search.google.com/incidents.json)

同一份公告里写明了适用范围和进度：

> Released the August 2026 spam update, which applies globally and to all languages. The rollout may take a few days to complete.

> — [Search Status Dashboard incidents.json](https://status.search.google.com/incidents.json)

截至8月20日，更新仍在进行。太平洋时间8月19日23点30分49秒查看时，记录依然标为Active，里面没有end字段——进行中的事件由键缺失表示，而不是null。

## 机制：日期一对齐，吃掉分钟信息

Search Console API的文档写得很清楚，查询窗口用的是什么单位：

> Start date of the requested date range, in YYYY-MM-DD format, in PT time (UTC - 7:00/8:00). Must be less than or equal to the end date.

> — [Search Console API — Search Analytics: query](https://developers.google.com/webmaster-tools/v1/searchanalytics/query)

一边是UTC分钟级时间戳，一边是PT日期级连接键，两边分辨率差了三个数量级。[平台资源也是屏幕上有、API 文档里没有](/zh/blog/zh/gsc-platform-properties-social-video-search-measurement-2026/)同一层：界面精度和管道能接住的精度不是同一份合同。分辨率往下走时，分钟信息摊进边界整天：一部分请求发生在更新前，一部分在更新后，在Search Console看来只有一行数据。

2026年8月这次spam update的边界日混合比是39%/61%，2026年3月core update是8%/92%，3月spam update是50%/50%，2月Serving故障是83%/17%——摊多摊少不取决于更新跑了多久，而取决于开始时刻落在PT的哪个点。排名类更新大多在PT上午8点到9点之间开始，边界日大约六成时间落在更新之后——但这只是巧合，不是规律。

UTC日期和PT日期本身也会错位。核对19个时间戳，有2个错位，都出在2026年2月的Serving故障：begin和end在UTC下是2026-02-25，换算成PT却是2026-02-24。排名类更新的7个样本都在UTC 16点前后开始，UTC日期和PT日期碰巧一致，只因为开始时刻都落在这个窄区间里。

begin的10个样本秒位全是00，分钟值集中在{0,25,27,40,55}；end的9个样本秒位同样全是00，分钟值全是5的倍数；created的10个样本秒位却分布在2、3、14、18、21、25、28、33、43这些真实值上——begin和end是人工填写的声明值，created和modified带着机器记录才有的零散秒位。[官方文档写的控制点与实际部署对不上的记录](/zh/blog/zh/official-geo-subtraction-gsc-control-2026/)是同一道缝：有 schema 不等于值的来源有合同。差距会累积成什么样？算过声明的end和完成公告即 most_recent_update.created 之间的间隔，9起里差值从-46分钟到+58分钟不等。2025年8月的spam update最极端：完成公告是2025-09-22T06:14:22Z，声明的end却是2025-09-22T07:00:00Z——公告比声明的结束时刻早发了46分钟。看似精确的分钟级数字，实际置信区间不是分钟。

## 核对数字

公告延迟在0.8分钟到158.7分钟之间波动，排名类更新收窄到0.8到18.1分钟：2025年12月core update是0.8分钟，2026年8月spam update是1.8分钟，2026年3月spam update是18.1分钟。

完全内部日最能说明短更新的问题。把已完成事件的窗口按PT整天切开，算完全落在窗口内、不跨边界的天数：2026年3月spam update持续19小时30分钟，跨了2个PT日，2个都是边界日，完全内部日是0——Search Console日期轴上找不到整天干净数据。2026年6月spam update持续2天1小时，完全内部日是1天。2026年2月Discover更新跑了21天17小时，完全内部日21天；2025年8月spam update跑了26天15小时，完全内部日26天。窗口越长，边界日占比越小，边界混合就越不吃重。

HTML历史表格的Duration列和JSON里end减begin算出来的值，9起事件全部一致。HTML按小时四舍五入（如把18天1小时35分钟显示成"18 days, 2 hours"），JSON保留分钟原值。人看到的数字和机器拿到的同源，两者口径并无冲突。

## 成本

抓取数据不花钱。robots.txt对所有UA全放行，用`curl -A "curl/8.7.1"`直接能拿到incidents.json，返回200，application/json，12,903字节，10起事件，不需要认证和API key。[声明的 robots.txt 以失败开放收场的情况](/zh/blog/zh/declared-rules-fail-open-robots-txt-agents-md-2026/)正好相反，这里声明和实际打开是对齐的。探测`/`、`/incidents.json`、`/feed.atom`、`/products.json`、`/incidents.schema.json`、`/history.rss`、`/summary.json`七个路径，前五个返回200，后两个猜测路径返回404——面板页脚明确列出的公开端点只有前五个。

轮询配额和速率限制的文档没有公开，属于未知。实现成本主要是归一化逻辑：把UTC转成PT、按天截断、给边界日打标记。这部分工作量预估半天，但没有实测计时，只是估算。

## 明确的反方

Google官方给出了最有力的反对意见：

> Check the Search Status Dashboard and take note of the start and end date of the core update. Compare the right dates: We recommend waiting at least a full week after a core update completes before analyzing your site in Search Console.

> — [Google Search core updates and your website](https://developers.google.com/search/updates/core-updates)

按官方建议等更新完成后满一周才看Search Console，开始时刻的分钟级精度确实是噪音——在28天分析窗口里，单日边界混合只占3.6%。这个反驳在长更新面前完全站得住：2026年5月core update有11天完全内部日，2月Discover更新有21天，2025年8月spam update有26天，窗口够长，足以稀释边界日混合。但反驳对短更新完全失效。2026年3月spam update只有19小时30分钟，完全内部日是0天；6月spam update也只有1天。“完成后等一周”解决的是什么时候看，解决不了看的时候拿哪一天对比——等完一周回头看，窗口里没有一天是干净基准。边界日标记处理的就是这个缺口。

## 能不能落地，适合谁

把Search Console API跑成定期批处理、按日期存性能数据、管理多个站点的团队，可以给入库表加rollout_label字段，把incidents.json归一化到PT，给起始日和结束日打上exclude标记——不用修正数字，只标注“这两格是混合值”。用Atom订阅接提醒的团队只需改一行代码：别把`<updated>`当开始时间读，那是公告时间。

这份数据帮不上忙的场景也很明确。只用浏览器看Search Console的一人运营，把面板加进书签就够，没必要写归一化逻辑。想在更新期间做实时应对的团队也绕不开Google“完成后等一周”的建议，数据不是为实时响应准备的。剩下两类需求的问题在别处：想拿滚动窗口相关做因果推断的分析，边界日混合本身消不掉，排名波动无法单独归因给某次更新，多一个标记字段解决不了因果问题；需要小时级报表的需求，卡在Search Console不提供小时粒度，自动化解决不了源头缺失。

截至8月20日，8月18日spam update的end字段仍未出现，更新仍在继续。这次声明的end和完成公告相差多久，要等更新结束才能知道。incidents.json里只保留10条记录，若上限固定，做长期分析就需要及早建表归档。

## 参考资料
- [Google Search Status Dashboard](https://status.search.google.com/)
- [Search Status Dashboard incidents.json](https://status.search.google.com/incidents.json)
- [incidents.schema.json](https://status.search.google.com/incidents.schema.json)
- [Google Search Status Dashboard Updates](https://status.search.google.com/feed.atom)
- [Search Console API — Search Analytics: query](https://developers.google.com/webmaster-tools/v1/searchanalytics/query)
- [Google Search core updates and your website](https://developers.google.com/search/updates/core-updates)
- [History for Ranking | Google Search Status Dashboard](https://status.search.google.com/products/rGHU1u87FJnkP6W2GwMi/history)
- [Spam updates and your site](https://developers.google.com/search/docs/appearance/spam-updates)
