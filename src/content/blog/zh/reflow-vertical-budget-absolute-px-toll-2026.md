---
title: 通过 WCAG 1.4.10 重排检查的页面，在 400% 缩放下仍可能在纵向上无法阅读
description: 一项只检查横向滚动的官方检查，不能保证放大后正文还留有多少纵向空间。实测显示，200 像素的屏幕高度里真正能碰到正文的只剩 118 像素。
pubDate: '2026-08-28'
heroImage: ../../../assets/blog/reflow-vertical-budget-absolute-px-toll-2026/hero.png
tags:
- 无障碍
- WCAG
relatedPosts:
- slug: declared-rules-fail-open-robots-txt-agents-md-2026
  score: 0.7
  reason:
    en: A page that passes the WCAG 1.4.10 Reflow check can still lose most of its
      vertical content, and that mirrors how truncated rules in robots.txt and AGENTS.md
      fail silently—both are 'failures without errors,' so reading both pieces shows
      why passing validation is not the same as being safe.
    ko: WCAG 1.4.10 Reflow를 통과한 페이지조차 세로 스크롤로 내용을 잃는 것은 robots.txt와 AGENTS.md의 잘린
      규칙이 조용히 실패하는 방식과 같은 '에러 없는 실패'의 또 다른 사례이므로, 검증을 통과해도 무너지는 지점을 이해하려면 두 글을 함께
      봐야 한다.
    ja: WCAG 1.4.10 Reflowを通過したページでも縦スクロールで内容を失うのは、robots.txtとAGENTS.mdの切れたルールが静かに失敗するのと同じ「エラーなしの失敗」のもう一つの例であり、検証を通過しても崩れる箇所を理解するには両方の記事を読む価値がある。
    zh: 通过 WCAG 1.4.10 Reflow 检查的页面仍可能在垂直方向丢失大量内容,这与 robots.txt 和 AGENTS.md 中被截断的规则静默失效如出一辙——两者都是'没有报错的失败',同时阅读才能明白为何通过验证不等于安全。
---

## 400% 缩放会减少的东西——不是宽度，而是高度

先把结论用一句话说完：一项网页通过了官方的横向检查，不代表把它放大到 400% 之后，读者还能看到足够的正文。实际发生的情况很具体——放大屏幕读文章的人，可能一屏只能看到一小段字，其余位置被别的东西占着。

先解释几个词。缩放就是把网页画面整体放大，好比把一本书的字放大了看。重排检查是网页行业的一个官方测试项目，全名是 WCAG 1.4.10 重排。WCAG 是一份国际通用的网页无障碍标准，也就是“网页要怎么设计才不会把部分用户挡在门外”的规则手册。重排这一条要求的是：把页面放大到 400% 时，内容不要让人同时左右两个方向都要滚动，只要上下滚就行。

听起来很合理。但这里有个容易被忽略的数学事实：放大到 400%，是每个方向都放大 4 倍。宽度放大 4 倍，能装下的内容就少 4 倍；高度也一样放大 4 倍，所以一屏能装下的高度只剩四分之一。规则原文自己也写明了这一点——"400% 作用于每个维度，而不是作用于面积"。

## 重排检查不测的纵向

想象你的饭盒越换越小，从大饭盒换到小饭盒。重排检查相当于只检查“饭菜不会从左边或右边洒出去”。这个检查全部通过了。但没人检查饭盒的盖子内侧还挂了几个固定不动的小盒子——腌菜盒、广告盒、回到顶部的按钮盒。饭盒本身越小，这些占位的盒子就越显得大。

规则原文其实写得清清楚楚。WCAG 2.2 的 1.4.10 条文是这样规定的：

> Content can be presented without loss of information or functionality, and without requiring scrolling in two dimensions for: Vertical scrolling content at a width equivalent to 320 CSS pixels; Horizontal scrolling content at a height equivalent to 256 CSS pixels.
> — [Understanding Success Criterion 1.4.10: Reflow / W3C WAI](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)

这段条文的中文意思是：对于上下滚动的内容，标准只要求宽度缩到 320 CSS 像素时内容不丢失。CSS 像素是网页排版用来量长度的单位，和我们平时说的手机屏幕物理像素不是一回事；对高度，条文一个字都没提。所以公平地说，这个标准本来就没打算管纵向。问题出在实际工作中，很多人把“重排检查通过”当成了“放大后也能好好读”的证明。这次实测用数字说明：拿「检查通过」来证明「读起来没问题」，是靠不住的。

## 消失的纵向空间的去向——82 像素与 90 像素

先说清楚测量是怎么做的。我们拿一个真实在线运行的网站，把浏览器窗口逐步压矮：844、400、256、200 像素，宽度始终是 320 像素。每压矮一次，就量一次屏幕上到底有多少纵向像素真正摸得到正文。测量的办法是一小步一小步地“问”屏幕上的每一个点：这个点现在是谁占着？只有答案是正文的点，才算可用。

结果很整齐：不管窗口多高，损失都是同样的 82 像素。可用空间分别是 844 里的 762、400 里的 318、256 里的 174、200 里的 118。损失的绝对值一次都没变。

这个不变的损失值说明了问题。它说明占用者不理会屏幕的大小。如果损失按比例走，窗口越小它也该跟着变小；固定尺寸的东西才会在任何窗口里都吃掉同样多。

但这里有个容易误会的地方。屏幕压到最矮时，页头其实已经不再是吸顶的了。吸顶的意思是：你往下滚动时，它一直钉在屏幕顶上不动。而在 200 像素高的小窗口里，页头已经退回普通的文档排版，跟着页面一起滚走了，不再遮住任何东西。所以这 82 像素不是被“浮在正文上面的东西”挡走的，而是页头这个模块在文档内部占掉的位置——它在文档里就占那么大一块地。这也是为什么在滚动到一半的状态下把它删掉，一个像素也回不来。

真正压在正文上的固定元素出现在滚动到一半的时候。我们做了逐个删除的实验：每次只拆掉一个固定元素，看有多少纵向像素回来。结果如下：

| 删掉的元素 | 回来的像素（320x200，滚动中） |
|---|---|
| 页头 | 0 |
| 阅读进度条 | 0 |
| 回到顶部按钮 | 0 |
| 底部广告容器 | 90 |
| 全部一起删 | 90 |

滚动状态下的全部损失，就是底部广告容器一个元素造成的——整整 90 像素，没有别人分走。把它删掉，200 像素全部恢复。删掉回到顶部按钮，一个像素也没回来。全删和只删广告的结果一样，说明各个元素挡住的地方互不重叠。

W3C 自己的指南警告的正是这一类元素：

> Such sticky or fixed content can pose significant issues for those who would benefit from Reflow, as aside from obscuring keyboard focus, such sticky or fixed content can make reading content difficult if not impossible.
> — [Understanding Success Criterion 1.4.10: Reflow / W3C WAI](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)

它对这类固定内容的定义也很直白：

> Sticky regions always stay visible in the viewport while the other content will disappear underneath when scrolling.
> — [CSS technique C34: Using media queries to un-fixing sticky headers / W3C WAI](https://www.w3.org/WAI/WCAG22/Techniques/css/C34)

那个底部广告容器在所有窗口高度下都保持着固定的高度，从 844 一直到 200 像素，屏幕怎么缩它都不让步。换句话说，如果你在这样的网站上放大阅读，挡住我的不是放大这个动作，而是页面上几件尺寸不变的固定元素。

## 损失没有变大，是分母变小了

同样的 90 像素，在 844 像素高的屏幕上只占 10.7%；在 200 像素高的屏幕上就变成 45%。数字本身一个都没变，变的是它除以的那个总数。这就是“分母变小”的意思：不是页面上的东西越来越大，而是留给正文的空间越来越小，同样大的占位就显得越来越挤。

另外，删掉回到顶部按钮之后，可用纵向像素一点都没涨。它确实悬在那里，但在这个测量里不挡正文。不过标准原文提醒过，这类悬浮内容还有别的代价——用键盘操作的人会在页面上留下一个高亮的“当前位置”标记，它们会把这个标记挡在下面。那部分的账，这次没有算进去。

如果你的网站要服务放大屏幕或使用屏幕朗读器的读者，光看“横向检查通过”那个绿色标记，是不够的。

## 建议增加的纵向预算测量

这次实验里，8 个测试格子全部通过了重排的横向判定——没有一格出现左右滚动。判定是真的，通过也是真的。但同一批格子里，纵向损失最严重时达到 45%。

所以实际的建议分两类，各一句话：

- 如果你的网站确实接收放大屏幕、屏幕朗读器的用户——那就把“320 像素宽、200 像素高的状态下正文可达像素”的测量，作为一项独立检查，跟横向判定分开跑。
- 如果你的页面是内部文档、报告这类没有任何固定悬浮元素的——横向检查通过就够了，纵向测量可以省掉。

顺带一提，官方也给了修法：WCAG 的 C34 技巧建议用媒体查询来修。媒体查询就是一段“根据屏幕条件改变样式”的规则。做法是让吸顶的页头变回普通排版，跟着内容一起滚动。标准原文这样解释悬浮区域的毛病：

> Sticky regions always stay visible in the viewport while the other content will disappear underneath when scrolling.
> — [CSS technique C34: Using media queries to un-fixing sticky headers / W3C WAI](https://www.w3.org/WAI/WCAG22/Techniques/css/C34)

## 本文未能核实的部分

先交代测量范围。这次的结果来自一个公开网站、一台设备、一个版本的浏览器。结构不同的其他网站能不能照搬，本文没有测过，也不应默认成立。

还有一些问题这次没有解决。页头从吸顶退回普通排版的准确临界高度没有找到，只知道在 400 到 844 像素之间的某处。底部广告容器偶尔测不到它挡东西，怀疑和广告加载的时机有关，但原因没有查明。这份数据也回答不了纵向空间变小是否真的让放大用户更快离开——那需要行为数据，本文没测。

最后用一句大白话说清楚，这个判断在什么条件下会错：在 320x200 的窗口里，如果把页面上所有浮着的元素全部删光，而摸得到正文的纵向像素连 1 像素都没有从 110 涨上去，那么“损失是这些固定元素吃掉的”这个结论就是错的。

## 参考资料

1. [Understanding Success Criterion 1.4.10: Reflow / W3C WAI](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html) — W3C
2. [WCAG 2.2 Success Criterion 1.4.10 Reflow (spec) / W3C](https://www.w3.org/TR/WCAG22/#reflow) — W3C
3. [CSS technique C34: Using media queries to un-fixing sticky headers / W3C WAI](https://www.w3.org/WAI/WCAG22/Techniques/css/C34) — W3C