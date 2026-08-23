---
title: '400% 放大之后正文只剩 118px：一笔与视口高度无关的固定像素通行费'
description: "横向回流判定 8 行全过，320x200 条件下正文顶部却只剩 118px，页面中部更掉到 110px。损失不是随视口缩放的百分比，而是一笔 82px 的恒定像素代价，大半来自应用 CSS 之外的第三方固定容器。本文给出可复现的测量口径、发布回归门槛该怎么划，以及为什么不该定一条通用及格线、而要改用回归比较。"
pubDate: '2026-08-23'
heroImage: '../../../assets/blog/viewport-budget-series-1-what-400-zoom-leaves-2026/hero.png'
tags:
  - 无障碍
  - WCAG
  - CSS
  - 响应式
  - 前端开发
relatedPosts:
  - slug: reflow-1410-400-zoom-viewport-height-2026
    score: 0.92
    reason:
      ko: "400% 확대에서 가로 리플로우 통과와 세로 읽기 공간이 왜 다른 문제인지 먼저 설명합니다."
      ja: "400%ズーム時の横方向リフロー合格と、縦方向の閲覧余地が別問題である理由を説明します。"
      en: "Explains why passing horizontal reflow at 400% zoom does not establish usable vertical reading space."
      zh: "说明为什么在 400% 缩放下通过横向重排，并不代表仍有足够的纵向阅读空间。"
  - slug: focus-not-obscured-sticky-header-scroll-padding-2026
    score: 0.85
    reason:
      ko: "스티키 영역이 키보드 포커스와 읽기 흐름을 가리는 문제를 구현 관점에서 다룹니다."
      ja: "スティッキー領域がキーボードフォーカスと閲覧の流れを遮る問題を、実装の観点から扱います。"
      en: "Covers the implementation consequences when sticky regions obscure keyboard focus and reading flow."
      zh: "从实现角度讨论粘性区域遮挡键盘焦点和阅读流程的问题。"
  - slug: wcag22-target-size-audit-2026
    score: 0.72
    reason:
      ko: "접근성 준거 판정과 실제 사용성 회귀를 분리해 관리하는 감사 방식을 함께 볼 수 있습니다."
      ja: "アクセシビリティ適合性の判定と実際の使いやすさの後退を分けて管理する監査方法を確認できます。"
      en: "Shows how to separate conformance evidence from operational usability regression monitoring."
      zh: "展示如何将合规证据与实际可用性回归监控分开管理。"
---

# 400% 放大之后正文只剩 118px：一笔与视口高度无关的固定像素通行费

我想知道，一个把浏览器放大到 400%、拿到 320px 宽且高度被压扁的视口的读者，屏幕上究竟还剩多少地方能读正文。于是我们逐格测量了在不同视口高度、不同滚动位置、不同页面类型和不同页面装饰条件下，真正能落到 `article` 或 `main` 上的纵向像素。横向回流全部通过。可是在 320x200 的条件下，页面顶部只剩 118px 正文空间；滚到页面中部时，另一套完全不同的机制又把它压到 110px。

这个结果值得管理层看一眼，原因不在数字本身。合规判定为真，阅读体验依然可能脆弱到不能用。我的建议很直白：WCAG 合规报告照旧，另外把"可用纵向像素"单独立成一条发布回归指标。

## 横向通过，说的不是读者看到的东西

大型改造项目里，无障碍结论常常被压缩成一句漂亮话：自动化检测零违规，Reflow 通过，允许发布。这句话有用。但对一个视口高度本来就所剩无几的低视力用户，它没说完。第一项到底能盖住多少，我们[用 W3C 的 1,213 个标准答案单独量过](/zh/blog/zh/act-rules-axe-coverage-wcag-sc-2026)。这里要看的是第二项。

WCAG 2.2 的 1.4.10 要求纵向滚动内容在等价于 320 CSS 像素的宽度下仍然可用。它没有规定这些内容还得剩下多少纵向阅读高度。

> Content can be presented without loss of information or functionality, and without requiring scrolling in two dimensions for: Vertical scrolling content at a width equivalent to 320 CSS pixels; Horizontal scrolling content at a height equivalent to 256 CSS pixels.
>
> — [Web Content Accessibility Guidelines (WCAG) 2.2 — SC 1.4.10 Reflow](https://www.w3.org/TR/WCAG22/#reflow)

这条界线在数据里显得格外清楚。8 组页面与高度组合的横向检查全部通过，`clientWidth` 与 `scrollWidth` 都是 320，文档层面没有任何横向溢出。同一时刻，320x200 顶部状态下留给正文的只有 118px，按实测行高折算是 4.2 行。

站在 CTO 的角度，这不是在质疑条款本身。这是在说，别指望一个二值合规信号去捕捉一段连续变化的体验退化，它根本不是为这件事设计的。

## 放大 400%，宽度和高度是一起塌下去的

审计里有个常见错误：把窗口拉窄到 320，高度却仍留着桌面级的舒适空间。这样只测到了放大条件的一半。[只按 320px 宽度测回流，只测了一半](/zh/blog/zh/reflow-1410-400-zoom-viewport-height-2026)，之前那次测量说的正是这件事。

> It should be noted that 400% applies to the dimension, not the area. It means four times the default zoom level viewport width and four times the default zoom level height.
>
> — [Understanding Success Criterion 1.4.10: Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)

我们把宽度锁在 320px，高度依次取 844、400、256、200。顶部状态下的正文可用空间分别是 762px、318px、174px、118px。四档高度，每一档都不多不少损失 82px。

这才是真正的架构结论。损失不是一个随视口变矮而按比例缩小的百分比，而是一笔绝对的像素通行费。分子恒定，分母却在缩，所以视口越矮，伤得越狠。

844px 时，82px 只是个零头。到了 200px，它吃掉 41.0% 的视口。一个组件在常规桌面评审里看着人畜无害，落到放大用户真正工作的那块屏幕上，就成了实打实的阅读障碍。

## 我们以为是头部，结果不是

碰上这种问题，第一反应总是怪 sticky 头部。这样的怀疑不算错，W3C 的技术文档也明确提醒过，粘性区域会在小屏或放大场景下吃掉相当大一块。

> Sticky regions always stay visible in the viewport while the other content will disappear underneath when scrolling. In terms of content visibility, this is often not a problem on the desktop and on mobile devices in portrait orientation. However, when using mobile devices in landscape orientation or when zooming in on the desktop, sticky regions may block a big portion of the screen: the height of the sticky region may leave only a small part of the screen for the display of page content.
>
> — [C34: Using media queries to un-fixing sticky headers / footers](https://www.w3.org/WAI/WCAG22/Techniques/css/C34)

数据把两套机制拆开了。

页面顶部那 82px 来自头部。在矮视口下，它是普通文档流里的一个块。它是 static，既不 fixed 也不 sticky，所以命中测试里根本没有把它记成遮挡区域。读者一往下滚，它跟着文档走掉，占用的视口空间归零。

这正是 W3C 对受限视口给出的实现方向。

> It is strongly suggested that at smaller viewport sizes that such components are modified to have static positioning, or their display can be toggled by the user.
>
> — [Understanding Success Criterion 1.4.10: Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)

换句话说，这个由我们自己维护的头部，早就写对了。它在矮视口页面中部的成本是 0px。这一点在运维层面很要紧：团队往往盯着自己能改的那个可见组件反复调，而真正的预算漏洞是第三方脚本在运行时凿出来的。

## 页面中部的预算，被一个第三方固定容器吃掉了

320x200、滚到页面中部时，可用内容空间掉到 110px。我们逐个摘掉页面上的装饰元素，看每摘一个能收回多少。

摘掉头部，收回 0px。摘掉阅读进度条，收回 0px。摘掉返回顶部按钮，收回 0px。摘掉底部固定广告容器，收回 90px，可用空间从 110px 回到 200px。把所有被测装饰元素一起摘掉，收回的还是这 90px。单项之和恰好等于总量，说明它们彼此没有重叠。

这个容器实测高度是 400px，视口高 844px 还是 200px 都一样。它自身是 `pointer-events: none`，实际造成遮挡的，是这块运行时插入区域里的其中 90px。到底是哪个子元素占着这 90px，目前没查清；返回顶部按钮虽然在页面中部可见，但在这次测试里单独摘掉它并不能收回像素。

比 DOM 细节更值得说的是商业含义。一个根本不在你代码仓库里的标签，能决定用户到底能不能读到文章。运营数据平台和 Web 服务的团队，身上挂着外部分析、广告、客服、同意管理、实验平台一大串依赖，对这种结构再熟悉不过：拥有源码，不等于拥有交付出去的体验。

844px 下，同样这 90px 相当于视口的 10.7%。200px 下是 45.0%。固定像素代价对矮视口是一种累退税。

## 把一句含糊的抱怨，做成一条能重复跑的流程

指标的口径故意收得很窄：

`usable_px = 命中测试能落到 article 或 main 上的纵向像素数`

它替代不了无障碍评估。它的价值在于，发布流程接得住它，也有人能对这个数负责。

测试用 Playwright 1.58.2 搭配 Chromium 145.0.7632.6，直接跑线上站点。脚本以 2px 为步长逐行采样，在三个横向位置取点，按命中的元素给每一个纵向像素归类。测量覆盖四档高度、两种滚动状态、三种装饰条件、五类页面，主测量集合共 27 次运行。

在把这个数写进任何汇报之前，我们先加了三道对照。任何一条新的体验指标想进管理层视野，我都会要求走完这三步。

第一道是空白对照。一个不带任何装饰元素的本地纯文本页面，在每一种被测条件下比值都是 1.0，可用空间等于整个视口。仪器本身没有凭空造出损失。

第二道是先划好证伪线。我们事先说定：如果在 320x200 页面中部摘光全部装饰元素、收回不到 10px，就放弃"固定装饰吃掉预算"这个假设。三次运行的实际收回量都是 90px。

第三道是把不稳定的东西挡在结论之外。底部容器的效应在较大高度和部分页面类型上时有时无。矮视口下它稳定复现，别处的复现率还不足以支撑一条适用于所有状态的绝对基线。

内部指标变成仪表盘表演，通常就是缺了这三步。定死一个数。证明测量工具本身不制造效应。在看到数据之前先说清什么结果会推翻假设。最后，把能重复的信号和可疑却没查清的波动分开写。

## 该建的是回归门槛，不是一个放之四海的及格线

我不会一上来就规定每个页面必须保留多少纵向像素。证据支撑不了一条通用阈值，而且运行时那点不稳定会制造一堆噪声失败。

要做的是：给一小组代表性页面记下 320x200 顶部状态的基线，之后 `usable_px` 相对基线下跌 10% 或更多，就让这次发布失败。

顶部状态适合当第一道门，因为它稳。四档高度梯子上的 6 次运行结果逐字节一致，118px 也复现了 8 月 9 日那次审计的数字。页面中部状态先只出报告，等第三方脚本的加载行为搞清楚再说。实测里，中部的遮挡效应随视口和页面场景在 3/6 到 6/6 之间浮动。在这种状态上硬卡 CI，只会把工程注意力耗在假失败上。

这条区分直接落到单位经济学上。一个 CI 任务就能跑完一批页面样本的两种条件，成本有限。相比之下，上线之后才发现某个营收、同意管理或客服依赖，恰好挡在用户要读的那块屏幕上，代价完全是另一个量级。更重要的是，这个数给评审讨论标上了价签。给头部再加 12px 不再只是审美取舍，它是从一份紧绷的视口预算里实打实划走的一块。把布局位移换算成数字之后，评审讨论就不一样了，这一点在[把 CLS 从 0.559 压到 0.014](/zh/blog/zh/cls-layout-shift-reserve-space-measure-2026) 的记录里也验证过。

## 反方意见在合规判定上是对的

把 118px 的可用高度说成 1.4.10 不合规，是错的。

规范文本对普通纵向滚动内容的要求是等价于 320 CSS 像素的宽度。这个站点通过了全部实测横向回流检查。条款没有规定最低剩余纵向阅读高度。把一条内部指标搬进合同、采购或法律层面的合规判断，等于擅自把标准抬高到它公开要求之上。

这件事之所以要紧，是因为审计产能有限。团队一旦把每一种不理想的体验都贴上正式不合规的标签，真正的违规项就失去了紧迫感，整改队列失去可信度，管理层拿到的报告则把法律风险和产品质量风险搅成一团。

这个反方意见只有被推得太远才危险。"不构成条款失败"不等于"不构成运营缺陷"。一次发布完全可以在保住 320px 横向回流的同时，让一个运行时固定容器把矮视口下的阅读变得困难甚至不可能。W3C 自己的文档就承认了放大场景下固定内容的体验风险。

> Such sticky or fixed content can pose significant issues for those who would benefit from Reflow, as aside from obscuring keyboard focus, such sticky or fixed content can make reading content difficult if not impossible.
>
> — [Understanding Success Criterion 1.4.10: Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)

治理上正确的做法是分开：WCAG 证据用于合规，视口预算证据用于回归管理。别把两者合并。前者保住合规报告的完整性，后者捕捉合规报告看不见的变化。

## 下个发布周期里，CEO 和 CTO 能改的事

从盘点开始，别从重新设计开始。把所有可能贴在视口上的元素列出来：头部、底部、推广位、客服入口、同意弹层、阅读进度条、浮动按钮，以及外部脚本注入的容器。哪怕实现方是供应商，也要指定一个负责人。

然后测一小组有代表性的页面，取 320x200 顶部状态，把当前值存成基线。把这个数放进部署报告，跟性能、错误率、无障碍摘要摆在一起。基线还没攒够之前，先别拿它卡发布。

自家维护的粘性区域，改成看高度行事。C34 给了可直接照抄的写法：按可用视口高度切换粘性行为。

> Define the first sticky regions using media query min-height properties, so they get fixed or un-fixed depending on the available space
>
> — [C34: Using media queries to un-fixing sticky headers / footers](https://www.w3.org/WAI/WCAG22/Techniques/css/C34)

第三方容器则可能根本没有纯 CSS 解法，因为这笔成本是在你的应用代码跑完之后才产生的。把纵向占用写进供应商验收标准和上线验证清单。"这个标签能不能加"是错的审批问题。"它在受限条件下吃掉多少视口像素，回滚由谁负责"，才是同时守住转化率和无障碍体验的那个问题。

下一步很具体：在自己的代表性页面上量出 320x200 顶部状态的基线。如果这条基线一直稳，用户却还在反馈阅读空间被挡，那这套固定像素预算模型就是错的。

## 参考资料

1. [Web Content Accessibility Guidelines (WCAG) 2.2 — SC 1.4.10 Reflow](https://www.w3.org/TR/WCAG22/#reflow)
2. [Understanding Success Criterion 1.4.10: Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)
3. [C34: Using media queries to un-fixing sticky headers / footers](https://www.w3.org/WAI/WCAG22/Techniques/css/C34)
4. [CSS Text Module Level 3](https://www.w3.org/TR/css-text-3/)
