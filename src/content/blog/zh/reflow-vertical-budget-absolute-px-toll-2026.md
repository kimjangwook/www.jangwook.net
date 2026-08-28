---
title: 通过 WCAG 1.4.10 Reflow 检查，也不保证 400% 放大后文字还能阅读
description: 一个网页通过了横向检查，但放大到 400% 后，竖向上能读到的空间可能只剩一小条。这篇文章用实测数字说明：损失是一笔固定扣款，屏幕越小，被占掉的比例越大。
pubDate: '2026-08-28'
heroImage: ../../../assets/blog/reflow-vertical-budget-absolute-px-toll-2026/hero.png
tags:
- accessibility
- wcag
relatedPosts:
- slug: declared-rules-fail-open-robots-txt-agents-md-2026
  score: 0.7
  reason:
    en: This piece on passing WCAG reflow while text still breaks echoes the robots.txt
      finding that truncated rules fail silently — showing that passing a check is
      not the same as actually working.
    ko: 리플로우를 통과해도 텍스트가 깨질 수 있다는 이 글은, 규칙이 잘려도 에러 없이 통과되는 robots.txt 실험과 마찬가지로 '검사를
      넘었다는 것'과 '실제로 읽을 수 있다는 것'이 다름을 보여준다.
    ja: リフローを通過してもテキストが崩れ得るというこの記事は、ルールが途切れてもエラーなしに通過するrobots.txtの実験と同様に、「チェックを通ったこと」と「実際に読めること」が異なることを示している。
    zh: 这篇文章说明通过重排检查后文本仍可能损坏，与 robots.txt 实验一样揭示了"通过检查"与"真正可用"是两回事，规则静默失效的问题一脉相承。
---

先说这件事对我的生活意味着什么。把网页放大到 400% 来看字时，页面明明“合格”，我却可能只能看到一条窄窄的文字，其余全被固定的菜单和广告挡住。合格不代表我能读。这就是这篇文章要讲清楚的一件事。

## 400% 放大下变小的竖向阅读空间

有一个国际标准叫 WCAG，它是全世界网站都遵守的无障碍阅读规范。这里用到的是它的第 1.4.10 条，名字叫 Reflow，意思是“重新排版”：屏幕变窄时，内容应该重新排布，让你不用横向滚动也能读完。这个标准检查的是横向——宽度够不够、有没有左右溢出。

但很多人（包括不少做网站的人）把“通过这项检查”当成“放大了也能读”。这里有个被忽略的事实：放大 400% 时，不只宽度变成四分之一，高度也变成四分之一。原文写得很清楚："400% applies to the dimension, not the area"——放大作用在每一边上，不是在面积上。所以屏幕不只是变窄，还变得很矮。

我们在一个真实上线的网站上做了测量，用的是最窄最矮的 320x200 屏幕。我们一行一行地看：屏幕上每个点到底被谁占着，文字真正能碰到的地方还有多少。答案是 118 像素，六次测试全都复现。200 像素高的屏幕，只有 118 像素能读到字。

![320x200 屏幕上拍摄的真实画面，文字能碰到的竖向空间是 118px](../../../assets/blog/reflow-vertical-budget-absolute-px-toll-2026/shot-budget-ladder-320w-4heights-320x200.png)

## 四种屏幕高度上同样的 82px 损失

这里要用一个买东西的比喻。想象一个商场在门口放了一台占地的服务台。不管这家店是大店还是小店，服务台占的地面是一样的。大店里它只占一小块地方，小店里就可能占掉大半。扣掉的量是固定的，扣掉的比例却随钱包大小变化。

我们用了四种高度不同的屏幕：844、400、256、200 像素。每一种都量“文字实际够得着的竖向像素”。结果非常有规律：

- 844 高的屏幕，剩下 762，损失 82
- 400 高的屏幕，剩下 318，损失 82
- 256 高的屏幕，剩下 174，损失 82
- 200 高的屏幕，剩下 118，损失 82

四次的损失都是同样的 82 像素。这就是固定损失：不管屏幕多高，损失都是同样的像素数。屏幕越矮，同样的 82 像素占掉的比例就越大——在最高的屏幕上它不到一成，在最矮的 200 像素屏幕上占掉 41%。

![在四种屏幕高度上量到的、文字实际够得着的竖向像素；损失在四种高度上都是 82px](../../../assets/blog/reflow-vertical-budget-absolute-px-toll-2026/chart-budget-ladder-320w-4heights.png)

## 90px 损失的来源与完全恢复

扣款是固定数字，那这笔钱到底付给了谁？我们把屏幕上挡东西的元素一个一个摘掉，每次摘掉后重新量。

结果出乎意料地干净。顶部的标题栏，摘掉后恢复 0 像素。阅读进度条，0 像素。回到顶部按钮，0 像素。只有底部那个固定位置的广告栏，摘掉后一次性恢复 90 像素。四个单独恢复量加起来是 0+0+0+90，等于全部一起摘掉时恢复的 90 像素，不多不少，互不重叠。

换句话说，在滚动到中间的状态下，这 90 像素全部是底部广告栏一个人的账。它的高度是固定的 400 像素，屏幕从 844 高变成 200 高它也不变，所以屏幕越小它吃掉的比例越大。所以对我这个读者来说，被占掉的主要就是这一块广告的位置。

![逐个移除元素后量到的文字可达竖向像素，移除底部固定栏后 90px 全部恢复](../../../assets/blog/reflow-vertical-budget-absolute-px-toll-2026/chart-removal-decomposition-at-320x200.png)

## 横向判定与竖向可读性的分离

那标准检查为什么没发现？因为在标准关心的那个方向上，页面确实全对。我们在 8 种屏幕组合里量横向溢出：内容宽度和屏幕宽度完全相等，溢出 0 像素，8 次全部通过。标准的原文也只要求："Vertical scrolling content at a width equivalent to 320 CSS pixels"——对竖向滚动的内容，只规定了 320 像素的宽度，没有规定高度。

有人会说：这本来就是标准的本意，它从没承诺过竖向，拿它当竖向的保证是我们自己的误会。从条文角度看，这个反驳是对的。但现实是，很多团队就是拿这项检查的通过来当“放大也能读”的凭据。我们的实验用数字说明，这个凭据并不可靠。通过横向检查，和竖向上能不能读，是两件事。

![8 种屏幕组合中量到的横向溢出，全部为 0px](../../../assets/blog/reflow-vertical-budget-absolute-px-toll-2026/chart-reflow-1410-horizontal-pass-check.png)

标准自己的文档也承认这个风险："Such sticky or fixed content can pose significant issues for those who would benefit from Reflow, as aside from obscuring keyboard focus, such sticky or fixed content can make reading content difficult if not impossible."（固定不动的内容会给需要重排版的用户带来严重问题，除了遮挡键盘焦点，还可能让阅读变得困难甚至不可能。）

## 需要单独测量的竖向空间

结论落到一句话：横向合格证不证明竖向能读。竖向上还剩多少空间，得单独去量。标准文档里也提供了做法，比如在屏幕变矮时把固定元素切换成普通流动的元素（官方技巧编号 C34），让它们不再一直占着屏幕。

如果你在做一个真的有放大用户、屏幕用户访问的网站，那就这样做：横向检查照跑，但在它旁边单独加一道检查，在又窄又矮的屏幕上直接量文字实际够得着的竖向像素是多少。

如果你做的是像本地文档、报告这种没有固定菜单和广告的页面，那就这样做：通过横向检查就够了，不需要再加额外的测量。

## 本文未能核实的部分

这次没有测的东西有三件。第一，顶部标题栏从固定变成普通排列的准确触发高度，我们只把它缩小到了 400 到 844 像素之间，具体数值没确定。另外，底部广告栏偶尔不出现。我们怀疑是广告加载时机的问题，但没有查实。还有，竖向空间不足是否真的让放大用户放弃阅读，这属于行为数据，不在本次实验范围内。下一步会去核实那个触发高度的具体数值。

这个判断在什么条件下会错：如果把所有挡着屏幕的元素都摘干净，能读的竖向空间却一点没增加，或者损失的像素在不同高度的屏幕上各不相同，那这篇文章的结论就是错的。（实际情况是，损失在四种高度上都是同样的 82 像素，把挡住屏幕的元素摘掉后，90 像素全部回来了。）

## 参考资料

1. [Understanding Success Criterion 1.4.10: Reflow / W3C WAI](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html) — W3C
2. [WCAG 2.2 Success Criterion 1.4.10 Reflow (spec) / W3C](https://www.w3.org/TR/WCAG22/#reflow) — W3C
3. [CSS technique C34: Using media queries to un-fixing sticky headers / W3C WAI](https://www.w3.org/WAI/WCAG22/Techniques/css/C34) — W3C