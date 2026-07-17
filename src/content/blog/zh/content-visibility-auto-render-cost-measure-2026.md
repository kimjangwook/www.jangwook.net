---
title: '一行 CSS 把强制布局从 27.3ms 压到 1.8ms：content-visibility 实测'
description: '同一份 HTML、同样的字节数，只多加一行 CSS，强制布局成本就降了 15 倍。我把一个 400 段的页面做了两个版本，用 Chrome 追踪和 Performance API 实测 content-visibility: auto 到底省了多少渲染，并讲清 contain-intrinsic-size 与无障碍陷阱。'
pubDate: '2026-07-17'
heroImage: '../../../assets/blog/content-visibility-auto-render-cost-measure-2026/hero.png'
tags:
  - Core Web Vitals
  - CSS
  - Web性能
  - 渲染
relatedPosts:
  - slug: cls-layout-shift-reserve-space-measure-2026
    score: 0.72
    reason:
      ko: 그 글의 핵심이 이미지 자리 예약이었는데, 여기 contain-intrinsic-size가 같은 발상을 오프스크린 섹션 전체에 적용한 것이다.
      ja: あちらは画像の場所を予約する話で、こちらの contain-intrinsic-size は同じ発想を画面外セクション全体へ広げたものだ。
      en: That post was about reserving space for images; the contain-intrinsic-size here is the same idea scaled up to entire off-screen sections.
      zh: 那篇讲的是"提前预留图片位置以防跳动"，而这里的 contain-intrinsic-size 正是把同一思路扩展到整段屏幕外内容。预留空间这一个原理，同时决定了 CLS 与渲染成本。
  - slug: lcp-image-preload-scanner-fetchpriority-2026
    score: 0.63
    reason:
      ko: LCP 글이 앞단이라면, 이 글은 안 보이는 건 안 그린다는 뒷단이다.
      ja: LCPの記事が前段なら、こちらは見えないものは描かないという後段だ。
      en: If that LCP post is the front end, this is the back end of "don't paint what isn't visible."
      zh: 如果那篇 LCP 是"浏览器画什么、何时画"的前端，这篇就是"看不见的干脆不画"的后端。两者都缩短初次渲染，但下手位置相反，成对读能看清渲染预算该从哪省。
  - slug: a11y-lighthouse-audit-fix-2026
    score: 0.55
    reason:
      ko: content-visibility로 콘텐츠를 숨겼다가 검색에서 사라지면 그게 사고다.
      ja: content-visibility で隠したつもりが検索から消えたら事故だ。
      en: Hide content and have it vanish from find-in-page, and that's the accident.
      zh: 性能优化有时会破坏无障碍。用 content-visibility 隐藏内容，却让它从屏幕阅读器或页内搜索中消失，就是这种事故。那篇的 Lighthouse 先测习惯，正是确认"快，但仍可达吗"的安全网。
---

同一份 HTML，同样的字节数。样式表里只多加了一行 CSS。强制布局成本从 27.3ms 掉到了 1.8ms，初次 LCP 从 464ms 变成 106ms。我没动 JavaScript，没做图片优化，也没改服务器配置。我只是告诉浏览器：现在屏幕上看不见的东西，别去算它。

这一行就是 `content-visibility: auto`。这次我把一个刻意做重的 400 段页面复制成两份，用 Chrome DevTools 追踪和 Performance API 实测，看这个属性到底省了什么、省了多少。下面每一个数字都来自那个沙盒的真实读数。最后我还会点出一个地方——这个优化可能悄悄把无障碍弄坏。

## 浏览器每一帧都在付的账

先把地基打好。浏览器每次把页面画上屏幕，都会跑一条固定的流水线：从 DOM 和 CSS 算出样式（Style），确定每个元素的位置和大小（Layout），把像素涂上去（Paint），再合成图层（Composite）。麻烦在于，这套活儿是对整个页面做的。折叠线下方三千像素处的一个表格单元格，和你正在看的首屏一样，照样要接受样式和布局计算。

对一篇短博客,这不成问题。可换成长文档、无限滚动的信息流、几百张卡片的仪表盘、庞大的商品列表，情况就变了。用户只看到一屏,浏览器却要为几万个看不见的节点每一帧重算布局。每次滚动、每次改窗口大小、每换一次字体,这笔账都得重付。重页面滚动起来发卡,主因就在这里。

于是有个很自然的问题:看不见的部分,能不能先不算?一直以来的答案是用 JavaScript 做虚拟化(virtualization)——只渲染进入视口的行,其余的从 DOM 里摘掉。它管用,但会引入库依赖,而且很容易在这个过程中把搜索、锚点链接和辅助技术弄坏。`content-visibility` 则把同样的活儿交给浏览器,只用一句 CSS 声明,DOM 原样保留。

## 官方定义：auto 到底开启了什么

`content-visibility: auto` 具体做什么，web.dev 的文档写得很清楚。带上这个属性的元素会获得 <strong>layout、style、paint 三种 containment</strong>。而当该元素位于屏幕外、又与用户无关时(它内部没有焦点或选区),还会再加上 <strong>size containment</strong>,并停止对内容的绘制和命中测试([web.dev, content-visibility](https://web.dev/articles/content-visibility))。

照文档原话说:"元素在屏幕外时,它的后代不会被渲染。浏览器不考虑任何内容就定下元素的尺寸,到此为止。"关键就是"到此为止"。样式重算、布局、绘制,对屏幕外的后代统统跳过。等用户滚到附近,才真正渲染。这就是把懒渲染(lazy rendering)放到了 CSS 这一层。

要分清 `auto` 和 `hidden`。`content-visibility: hidden` 永远跳过渲染,在你用程序把它重新画出来之前,内容对用户、对无障碍树都不可见。而 `auto` 是有条件的:在屏幕外就推迟,一旦相关就立刻画。就算把 `auto` 加在首屏内容上,它也会立即渲染。所以标准做法是把它加在长页面的屏幕外区块上。

## 同一个页面两份，只差一行 CSS

没有复现就不下结论。我在沙盒里做了两个静态 HTML:400 个 `<section>`,每段里有 4 个段落和一张 12 行的表。合计约 28,800 个 DOM 节点,HTML 约 689KB——一个刻意做重的页面,替仪表盘或长报告站台。

两个文件的 DOM <strong>完全一致</strong>,字节数也基本相同。唯一的区别,是只出现在 `cv.html` 里的这条规则:

```css
section.cv {
  content-visibility: auto;
  contain-intrinsic-size: auto 480px;
}
```

第二行为什么必要,后面单独讲。先记住:改动就这一块,没有一行 JavaScript。然后我用本地服务器把两个页面跑起来,在 Chrome(150 版,macOS,不做网络和 CPU 限速)里各自采集追踪。

## 测量结果：初次渲染与强制布局

第一个指标是 <strong>LCP(Largest Contentful Paint)</strong>,即最大内容元素画出来的时刻。按 Chrome 追踪,baseline 的 LCP 是 464ms(渲染延迟 462ms),`content-visibility` 版是 106ms(渲染延迟 104ms),快了约 4.4 倍。两个页面的 CLS 都是 0.00,没有跳动。

老实说一点。LCP 追踪每次跑都有波动。我重测 baseline,有一次读到 220ms(首次加载会受缓存和预热影响)。所以我另测了一个波动小得多的指标:<strong>强制回流(forced reflow)成本</strong>。我对整个文档施加样式失效,再读 `offsetHeight` 强制一次同步布局,计时,取 15 次的中位数。

<figure>
  <img src="../../../assets/blog/content-visibility-auto-render-cost-measure-2026/layout-cost.png" alt="Bar chart comparing forced style and layout cost (baseline 27.3ms vs content-visibility 1.8ms, 15.2x faster) and LCP (464ms vs 106ms, 4.4x faster)" />
  <figcaption>同一 DOM、同样字节,只差一行 CSS。全部为本地沙盒实测值。</figcaption>
</figure>

结果:baseline 中位数 27.3ms(最小 26.5,最大 39.6),`content-visibility` 版 1.8ms(最小 1.5,最大 2.7),约 15 倍。这个数比 LCP 波动小,也更诚实地反映原理。因为强制布局会直接暴露屏幕外内容是否参与计算:baseline 每次都要给全部 28,800 个节点重排,`auto` 版只排屏幕内的那几个。

再补一句。Chrome 追踪对 baseline 给出了"DOM 过大"的 DOMSize 警告,对 `content-visibility` 版则没有。从浏览器角度看,真正参与渲染的有效 DOM 变小了。

## 忘了 contain-intrinsic-size，滚动条就会乱跳

这就轮到 `contain-intrinsic-size` 登场了。一旦跳过屏幕外区块的渲染,浏览器就不知道这段的真实高度。什么都不做,这个元素的高度就是 0。400 段全部塌成 0 高度,再随着滚动一段段进来、展开成真实高度,整个文档高度就一直变。滚动条到处乱跳,滚动位置也会错位。

`contain-intrinsic-size` 替它把位置先占下——在跳过渲染期间,给浏览器一个占位尺寸,告诉它"这段大约这么高"。用文档的话说,它"指定元素在受 size containment 影响时的自然尺寸"。再加上 `auto` 关键字(像 `auto 480px`),浏览器渲染过一次后就会记住实际尺寸,以后复用。

这跟[给图片写死 width/height 来防止布局跳动](/zh/blog/zh/cls-layout-shift-reserve-space-measure-2026)是同一个直觉:提前把位置占好,等真实内容进来时,不会把四周挤走。实测里也印证了这点。`content-visibility` 页面的 `scrollHeight` 是 206,294px,baseline 是 302,454px。差值不是 bug——`auto` 版把还没渲染的段落按 480px 的估值占着。估得离真实值越远,滚动体验就越别扭,所以最好量几段有代表性的真实高度,填一个接近的近似值。

## 无障碍呢？auto 不是 display:none

只谈速度、把无障碍丢了,优化迟早会变成事故。`auto` 最重要的性质就在这里。web.dev 文档说得很直白:"屏幕外的内容仍然保留在 DOM 里,因此也在无障碍树里(不同于 visibility: hidden)。也就是说,这些内容可以在页面内被搜索到,也可以被导航到,而无需等它加载。"

这句话就是要点。`content-visibility: auto` 不是把内容 <strong>删掉</strong>,而是把渲染 <strong>推迟</strong>。屏幕阅读器照样能读到屏幕外的段落,页内搜索(Ctrl+F)照样能找到里头的文字并滚过去,锚点链接也照常工作。`display: none` 和 JS 虚拟化常常弄坏的东西,`auto` 都守住了。老实说,我觉得这才是这个属性真正的价值:性能和无障碍通常互相拉扯,而 `auto` 是少见地两头都拿到的情况。

不过有个该老实交代的限制。浏览器支持已经很广:Chrome、Edge 85+,Firefox 125+,Safari 18+。但有报告说,Safari 的页内搜索(Cmd+F)并不总能找到被 `content-visibility: auto` 推迟的文字(截至 Safari 18.3.x,属参考、非官方)。无障碍树的暴露,和各浏览器 find-in-page 的行为,是两码事。所以只要某段内容的可搜索性要紧,就该在目标浏览器里亲自验一遍,别想当然。

## 什么时候用，什么时候别用

它不是万能牌。用错了反而亏。我一边实测一边理出来的边界是这样。

适合用的地方:折叠线下方长长延伸的屏幕外区块,长文的下半段,以及卡片、列表、评论串、商品网格这类重复的重块。一句话:现在看不见、但必须留在 DOM 里的那些块。

不该用的地方:加在首屏一直可见的内容上没有收益(反正立刻就渲染)。而且它跟 CSS 滚动吸附、某些 `position: sticky` 组合、依赖容器尺寸的布局,可能相处不好。

最安静的陷阱是 <strong>强制布局</strong>。正如 web.dev 提醒的,只有当你不去调用那些会强制对已跳过子树进行渲染的 DOM API 时,浏览器才能跳过这份活。对屏幕外元素调 `getBoundingClientRect()`、`offsetTop`、`scrollHeight`,浏览器就会当场把它强制排一遍,省下来的全没了。如果你的滚动位置计算或动画钩子习惯性地调这些 API,该审一审。Chromium 在你对 `content-visibility: hidden` 的子树调用这类 API 时,会在控制台打出提示。

再老实说一句:这省的是 <strong>渲染 CPU,不是下载字节</strong>。完整的 HTML 照样全下来。初次绘制和滚动响应会变好,网络传输量不变。想减字节,得另外上[真正的懒加载或服务端分页](/zh/blog/zh/lcp-image-preload-scanner-fetchpriority-2026)。两种优化解决的是不同问题。

## 一份今天就能用的清单

要落到实处,我会按这个顺序走。

<strong>1. 先挑候选。</strong>页面在折叠线下方是不是很长?有没有重复的重块(卡片、行、区块)?没有的话,这个优化几乎没什么可拿的,别硬塞。

<strong>2. 只加在屏幕外的块上。</strong>首屏内容排除在外。

```css
.article-section,
.card,
.comment {
  content-visibility: auto;
  contain-intrinsic-size: auto 400px; /* 近似一个代表性块的真实高度 */
}
```

<strong>3. 一定要配上 contain-intrinsic-size。</strong>不加,滚动条就乱跳。量几个代表性块的真实高度,填个接近值,再用 `auto` 关键字让它记住渲染后的实际尺寸。

<strong>4. 审查强制布局的代码。</strong>只要对屏幕外元素有 `getBoundingClientRect`、`offsetTop` 这类调用,省下的就被抹掉。

<strong>5. 重新测,并确认它仍然可达。</strong>在应用前后实测强制布局时间或滚动响应。再用屏幕阅读器,以及目标浏览器的 Ctrl+F,确认屏幕外文字仍然找得到。变快了却到不了,那不叫改进。

一行 CSS 换来 15 倍,当然是这个极端做重的沙盒里的数,真实站点的收益完全取决于页面结构。但原理很硬:不画没人看得见的东西,页面就快。而 `content-visibility` 是少数几个能在不破坏无障碍的前提下做到这件事的办法。

如果你需要把结构化数据稳稳地从服务端输出,或者想基于真实测量、而不是拍脑袋,去处理长页面的渲染成本和 Core Web Vitals——这类活我私下接咨询和实现委托,可以通过我资料页上的联系方式找我。比起"看着挺快",我更愿意用一条追踪和一个数字来确认。
