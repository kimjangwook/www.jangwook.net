---
title: 320×200 里的 118px：1.4.10 通过之后纵向还剩什么
description: Reflow 判定只量横向，320×200 下正文可用纵向像素可能只剩 118px。本文用 27 次实测拆解 82px 与 90px 两笔固定通行费，并给出可直接落地的
  CI 检查与 C34 切换清单。
pubDate: 2026-08-27
heroImage: ../../../assets/blog/reflow-vertical-budget-absolute-px-toll-2026/hero.png
tags:
- accessibility
- wcag
relatedPosts:
- slug: declared-rules-fail-open-robots-txt-agents-md-2026
  score: 0.7
  reason:
    en: 'If you read how robots.txt rules were truncated yet passed silently, here
      you''ll see the same blind spot in viewport form: a Reflow pass that waves through
      vertically broken readability.'
    ko: 선언된 규칙이 잘려도 조용히 통과되던 robots.txt 사례를 읽었다면, 이번엔 Reflow 통과가 수직 가독성 붕괴를 그냥 놓쳐버리는
      측정의 사각지대가 그 공백의 뷰포트 버전임을 확인하게 된다.
    ja: 途中で切れてもエラーなく通過したrobots.txtの事例を読んだなら、今回はReflow合格が縦方向の可読性崩壊をそのまま見逃す測定の死角が、同じ空白のビューポート版であると確認できる。
    zh: 读过 robots.txt 规则被截断却静默通过案例的人,会在这里看到同一盲区的视口版本:Reflow 检测直接放行了纵向可读性的崩坏。
---

## 横向判定的盲区

WCAG 1.4.10 Reflow 的自动化判定在我们测试的全部单元格上通过：8/8，`clientWidth 320 = scrollWidth 320`，文档级横向溢出为 0。同一个页面、同一个 400% 缩放，在 320×200 视口下正文实际可达的纵向像素只有 118px，6/6 次复现。

这不是数据和规范打架。规范原文写得很清楚："Vertical scrolling content at a width equivalent to 320 CSS pixels"——只约束宽度，对高度一字未提 [2]。作为规范解释，反方的说法是对的：1.4.10 从未承诺过纵向可读性，我们的测量推翻不了合规判定。

问题在于实践中这个绿灯被怎么用。团队普遍把 1.4.10 通过当成"放大了也能读"的代理指标。这个代理关系在本次实测中断裂了，而且断裂的形状可以量化：一笔与视口无关的固定像素过路费。

先说一个结构性事实：400% 缩放不是把面积缩成四分之一，而是把每个维度都缩成四分之一。W3C 的理解文档原话是 "400% applies to the dimension, not the area" [1]。所以 320×200 不是刁钻的边界用例——它就是 1280×800 笔记本屏幕在该标准自己点名的缩放级别下的实际视口。规范文本只测宽度，而同一个缩放把纵向也压缩了同样的倍数，这一轴判定不碰。

## 320×200 的纵向预算 118px

测量方法：Playwright elementFromPoint 行级命中测试，2px 步进，x 取 25/50/75% 三列，输出正文可触达的纵向像素（usable_px）。27 个 run，覆盖四个视口高度（844/400/256/200）× 两个滚动状态（top/mid）× 逐元素移除，页型覆盖 post、post2、blog-index、home、local-control。

| 视口高度 | top usable_px | mid usable_px |
|---|---|---|
| 844 | 762 | — |
| 400 | 318 | — |
| 256 | 174 | — |
| 200 | 118 | 110 |

top 状态的损失是 844−762=400−318=256−174=200−118=82px，四个高度下精确一致。h=200 时 top 损失率 41.0%，mid 45.0%。而 1.4.10 的横向判定在全表中是 8/8 通过：clientWidth 320 = scrollWidth 320，h_overflow_px 0，reflow_pass true。

## 与高度无关的 82px 通行费

损失如果是按视口比例收缩的，"绝对值通行费"论点就该被驳回。实测不是：82px 在四个高度下分毫不差。原因是占编对视口高度不响应——底部广告容器在 h=844 时高 400px，在 h=200 时依然是 400px，6/6 复现。视口越小，这笔固定费用占产能的比例越大。同一笔 90px，在 844 里是 10.7%，在 200 里是 45.0%——不是比例变大，是分母变小。

## 阻断主体分解——90px 底部广告容器

在 320×200 视口下做了一次逐元素移除分解：把固定装饰元素一个个单独摘掉，再全部摘掉，测每次的可用像素恢复量。结果像一次排班复盘——把每个占编岗位逐一叫走，看产能恢复多少。

| 移除的元素 | mid 状态恢复量 |
|---|---|
| header | Δ0 |
| reading-progress | Δ0 |
| #back-to-top（fixed，h=48） | Δ0 |
| #fixed_container_bottom | Δ+90 |
| ALL | Δ+90 |

mid 状态的阻断者就是那个 90px 的底部广告容器，而且只有它。各元素单独移除的恢复量之和（0+0+0+90=90）与全部移除的恢复量（Δ+90）相等，说明没有重叠遮蔽——每个像素只被计了一次账。移除该容器后，mid 状态可用像素从 110 恢复到 200，3/3 次运行结果一致。这也是证伪检查：如果摘光全部 chrome 也拿不回纵向预算，"固定 chrome 吃预算"这条主轴就塌了。实测没有塌。

表里有两处值得停下来看。第一，header 的 Δ0 不是异常：在 h=200 时 header 的 `position` 是 `static`（6/6 复现），它会随文档一起滚走，根本不在 mid 探针的路径上。82px 的 top 损失归属因此被证伪流程修正过——最初的预期是"固定 chrome 的份额"，但那 82px 实际属于文档流内的静态 header 块，是在 top 滚动状态下、它滚走之前收的费。绝对像素这个结论活了下来，被指控的元素换了人。

第二，`#back-to-top` 的单独恢复量是 0px。这个元素在 mid 滚动时可见、fixed、高 48px，但在这份数据里拿回了 0px。至于它为何没有造成阻断——是完全未遮蔽，还是仅在探针未覆盖的条件下遮蔽——这份数据无法区分。换句话说，"存在但不计费"和"存在但计费方式探针看不见"这两种状态，在这套指标下是同一个读数。此外，WAI 文档点名的另一个轴向——遮挡键盘焦点[1]——这次没有测量，命中测试对它是沉默的。

还有一处归属失败，如实记录：home 页在 h=200 top 状态 `usable_px` 掉到 0，而 `blocked_px` 返回为空——剩下的 118px 无法归到任何元素头上。这是唯一打破 82px 模式的页面，我们选择留白而不是补一个说法。同理，底部容器的阻断在部分运行中间歇消失（怀疑是广告加载时机，原因未查明），所以 mid 的数字是 3/3 和 6/6，而不是全绿。

排班类比在这里落点很清楚：底部的 90px 容器是一个不随班次缩减的固定占编。当班人数（视口高度）从 844 缩到 200，这个占编一个像素都没让——同一个 90px，在 h=844 上占 10.7%，在 h=200 上占 45.0%。比例变大不是因为岗位多了，是因为人少了。

## falsifier 修正过的归属——static 头部的份额

原假设是"82px 损失归固定 chrome"。证伪条件设了两条：若全移除 chrome 后纵向像素不恢复，论点崩塌；若损失随高度比例递减，绝对通行费论点被驳回。实测结果保留了主张但修正了归属：h=200 mid 全移除后 110→200（+90，3/3 一致），缺口全部来自广告容器。而 82px 的 top 损失，测量显示 header 在 h=844 时是 sticky、h=200 时已降级为 static——它随文档流走，不是 fixed 阻断者。82px 实际是文档流内头部块的份额，不是固定 chrome 的份额。归因写错了，数字没写错。

## elementFromPoint 命中测试与对照单元

指标可信度需要一个对照：一份无任何 chrome 的本地散文文档，全行 ratio 1.0——命中测试方法本身不制造损失。另外 post 页有 offenders 97、worst_overflow_px 604，但这是子元素溢出，文档级横向滚动为 0，不影响 1.4.10 判定。

## 诚实清单：没测的部分

- header sticky→static 的确切阈值未确认，只 narrowed 到 (400, 844] 区间，480 只是 C34 示例值。
- fixed_container_bottom 的阻断在部分 run 中缺席，疑似广告加载时序，原因未查明。
- home 页 h=200 top usable_px 为 0，其余 118px 的归属失败（blocked_px 为空），是全部数据里唯一偏离 82px 模式的单元格。
- offenders 97 个子元素在哪里被裁剪，未测。
- 广告容器移除对收入的成本，本实验未计量。

## 作为独立门禁的纵向预算审计与 C34 切换

建议按页面类型分开，因为固定占编不同：

**如果你的站点真实服务放大用户**——有 sticky 头部、固定容器——就在 1.4.10 自动化判定旁边，把纵向预算审计作为独立门禁加入。跑同一套梯子：320px 宽，高度梯子（200 是底线，可加 256、400、844），top 和 mid 两个滚动状态，逐行 elementFromPoint 命中测试。为你的内容的行高设定一个可用像素阈值，在 CI 里像跑 reflow 检查一样跑它。成本接近零：Playwright 加一个公开站点，一台机器 27 次运行。

**在小高度下固定 chrome 无法避免的地方**，套用 C34：以 `min-height` 为键的媒体查询，在阈值以下把 sticky 头部和固定底部容器切换为静态定位 [3]。我们的数据说，光底部广告容器一项在 h=200 mid 就值 90px 的恢复量——占视口的 45%。这是这个页面上杠杆最高的开关。

**如果你的页面没有固定 chrome**——本地报告、对照文档、纯文页——1.4.10 通过就足够了，纵向预算门禁属于过度设计。对照格证明了这一点：每一行都是 ratio 1.0。

一条成本上的提醒：本实验没有为移除广告容器对收入的影响定价。测量是免费的；整改不是，这笔权衡由你自己做。

这个教训超出无障碍范畴。当一个合规检查通过时，通过只在标准选择测量的轴上有效。纵向预算按设计就在 1.4.10 的轴之外——规范本身没有任何错。但任何把绿灯读成"放大了也能用"的团队，都把一个窄保证换成了宽保证，而这次兑换恰好在 82px + 90px 处违约。审计你的门禁没有测的轴；要紧的是用户实际使用的那些轴。

## 参考资料

1. Understanding Success Criterion 1.4.10: Reflow / W3C WAI — [Understanding Success Criterion 1.4.10: Reflow / W3C WAI](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)
2. WCAG 2.2 Success Criterion 1.4.10 Reflow (spec) / W3C — [WCAG 2.2 Success Criterion 1.4.10 Reflow (spec) / W3C](https://www.w3.org/TR/WCAG22/#reflow)
3. CSS technique C34: Using media queries to un-fixing sticky headers / W3C WAI — [CSS technique C34: Using media queries to un-fixing sticky headers / W3C WAI](https://www.w3.org/WAI/WCAG22/Techniques/css/C34)