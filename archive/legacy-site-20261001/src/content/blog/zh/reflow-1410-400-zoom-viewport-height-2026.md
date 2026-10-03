---
title: '只按 320px 宽度测回流，只测了一半：400% 放大后的 200px 高度'
description: '把 WCAG 1.4.10 回流放在 320x844、320x256、320x200 三个条件下同时测量。横向判定三个条件一个像素都不差，400% 放大真正改变的是高度：82px 的 sticky 头部占掉了视口的 41%，正文可见区域最后只剩下不到六成，文末附上可复现的测量脚本与三档高度的完整数据。'
pubDate: '2026-08-09'
heroImage: '../../../assets/blog/reflow-1410-400-zoom-viewport-height-2026/hero.png'
tags:
  - 无障碍
  - WCAG
  - CSS
  - 响应式
  - 前端开发
faq:
  - question: '把浏览器窗口拖到 320px 检查，不就够了吗？'
    answer: '横向够了。这次测量里 320x844、320x256、320x200 三个条件给出的失败页面和溢出像素值完全一致。但 400% 放大不只把宽度压到 320，也把高度压到 200 上下。只往横向拖窗口，等于在从没看过那个高度的情况下判了通过。'
  - question: '用 sticky 头部算违反 1.4.10 吗？'
    answer: '不算。这条标准判的是「是否需要双向滚动」，头部占用纵向空间不在其中。但在 200px 高的视口里，82px 的头部占 41%。也就是说标准通过了，读者一屏只剩四行正文。真要照顾放大用户，短视口下应该把这段高度还回去。'
  - question: '为什么 Tailwind 的 break-words 修不好超长邮箱地址的溢出？'
    answer: 'break-words 对应 overflow-wrap: break-word，而 CSS Text 规范明确写着这个值带来的换行机会不计入 min-content 内在尺寸的计算。网格和弹性项目的 min-width 默认是 auto，轨道仍然会撑到那串不可断字符的宽度。改用 overflow-wrap: anywhere，或者给项目加 min-width: 0。'
  - question: '代码块横向溢出算不算回流失败？'
    answer: '如果它在自己的横向滚动容器里，就不构成页面的双向滚动。这次样本中 43 个溢出元素有 24 个属于这种情况，有个 code 元素跑出视口 585px，页面溢出却只有 2px。判定单位应该是滚动容器，不是元素。'
relatedPosts:
  - slug: focus-not-obscured-sticky-header-scroll-padding-2026
    score: 0.88
    reason:
      ko: 같은 82px 헤더가 그때는 키보드 포커스를 가렸고 이번에는 확대 화면의 세로를 먹었다. 그때 넣은 scroll-padding-top 96px이 이번 200px 뷰포트에서는 오히려 짐이 됐다는 이야기까지 이어진다.
      ja: 同じ82pxのヘッダーが、あのときはキーボードフォーカスを隠し、今回は拡大画面の縦を食った。あのとき入れたscroll-padding-top 96pxが、200pxのビューポートでは逆に重荷になった話まで続く。
      en: The same 82px header hid keyboard focus back then; here it eats the vertical room at 400% zoom. The scroll-padding-top of 96px added in that post turns into a liability once the viewport is 200px tall.
      zh: 同一个 82px 的头部，那次遮住了键盘焦点，这次吃掉了放大后的纵向空间。那篇里加的 scroll-padding-top 96px，到了 200px 高的视口反而成了负担。
  - slug: text-spacing-1412-clamp-audit-2026
    score: 0.79
    reason:
      ko: 1.4.12 측정의 후속으로 잡았던 소재가 이 글이다. 그때는 자간을 넓혀 가로로 밀었고 이번엔 뷰포트를 320px로 좁혀 밀었다. 미는 방향은 반대인데 무너지는 곳은 꽤 겹친다.
      ja: 1.4.12の測定で次の宿題として置いた題材がこれだ。あのときは字間を広げて横に押し、今回はビューポートを320pxに狭めて押した。押す向きは逆でも、壊れる場所はよく重なる。
      en: This is the follow-up I parked at the end of the 1.4.12 run. That one pushed outward by widening spacing; this one pushes inward by shrinking the viewport to 320px. Opposite directions, largely the same casualties.
      zh: 这是 1.4.12 那次留下的后续题目。上次是把字距撑开、往外挤；这次是把视口压到 320px、往里挤。方向相反，塌的地方却大半重合。
  - slug: act-rules-axe-coverage-wcag-sc-2026
    score: 0.7
    reason:
      ko: axe 4.13.0의 105개 규칙 중 1.4.10에 태그된 것은 없다. 어느 기준이 자동 검사의 사정거리 밖인지 목록으로 확인해둔 글이라, 이번처럼 직접 재야 하는 항목을 고를 때 먼저 펼쳐보게 된다.
      ja: axe 4.13.0の105ルールに1.4.10のタグは一つもない。どの基準が自動検査の射程外かを一覧にしてある記事なので、今回のように手で測る項目を選ぶときにまず開くことになる。
      en: None of axe 4.13.0's 105 rules carries a 1.4.10 tag. That post is the inventory of which criteria sit outside automated reach, which is where you start when picking what to measure by hand.
      zh: axe 4.13.0 的 105 条规则里没有一条挂 1.4.10 的标签。那篇把哪些标准落在自动检测射程之外列成了清单，挑「得手动量」的项目时先翻它。
  - slug: wcag22-target-size-audit-2026
    score: 0.62
    reason:
      ko: 검사기 점수와 실제 기준 사이의 간격을 픽셀로 확인했던 글이다. 이번에도 통과 표시는 폭에 대해서만 나왔고 높이는 아무도 보지 않았다.
      ja: 検査ツールのスコアと実際の基準との隙間をピクセルで確かめた記事だ。今回も合格表示は幅についてだけ出て、高さは誰も見ていなかった。
      en: "That post measured, in pixels, the gap between a checker's score and the criterion itself. Same shape here: the pass covered width, and nobody looked at height."
      zh: 那篇用像素量了检测工具的分数和标准本身之间的缝。这次一样：通过只覆盖了宽度，高度没人看。
---

我站点的头部高 82px，`position: sticky`，滚动时一直钉在顶上。

在 844px 高的手机屏上，这是 9.7%，没人会在意。同样这个头部，放到 200px 高的视口里就是 41%。剩下 118px，正文行高 28px，一屏只装得下四行多一点。

200px 是怎么来的？1280x800 的笔记本开 400% 放大，视口就是 320x200 CSS px。宽度那个 320，做无障碍回流检查时人人都拿它当标准。高度那个 200，包括我在内都没看过。

今天我把宽度固定在 320，只改高度，三个条件并排跑了 16 个页面。横向的答案三次完全一样，纵向不是。

## 320 和 256 这两个数字的出处

回流是 WCAG 2.2 的成功标准 1.4.10，AA 级。规范原文见 [W3C 的 WCAG 2.2 建议标准](https://www.w3.org/TR/WCAG22/#reflow)：

> Content can be presented without loss of information or functionality, and without requiring scrolling in two dimensions for:
>
> - Vertical scrolling content at a width equivalent to 320 CSS pixels;
> - Horizontal scrolling content at a height equivalent to 256 CSS pixels.
>
> Except for parts of the content which require two-dimensional layout for usage or meaning.

关键动词是 "requiring scrolling in two dimensions"。判的不是「有没有东西横着支出去」，而是「读它要不要往两个方向滚」。这个区别后来决定了样本里 24 个元素的去留。

320 的来历也写明了。[Understanding 文档](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)这样说：

> 320 CSS pixels is equivalent to a starting viewport width of 1280 CSS pixels wide at 400% zoom.

所以 320px 不是给小屏手机准备的数字，是给「在 1280px 窗口里开 400% 放大」的人准备的。同一份文档对竖排内容也给了对应值："256 CSS pixels is equivalent to a starting viewport height of 1024 CSS pixels at 400% zoom"。1024 的纵向空间放大四倍，剩 256。

顺着这个算式再走一步，就是这篇的起点：既然 400% 放大把宽度从 1280 压到 320，同一次放大也会把高度从 800 压到 200。标准只对宽度给数字，是因为纵向滚动的内容里损失出在宽度方向，不是因为高度不会缩。只把窗口往横向拖的做法，等于整整跳过了一半。

标准也有例外，Understanding 给的例子相当具体：

> Examples of content which requires two-dimensional layout are images required for understanding (such as maps and diagrams), video, games, presentations, data tables (not individual cells), and interfaces where it is necessary to keep toolbars in view while manipulating content.

数据表在例外之列，而且特意注明「不含单个单元格」。动手重排全站表格之前，这句值得先记住。

## 三个条件一起跑

测的是构建产物。`npm run build` 在 `dist/` 里生成 1,366 个 HTML，从中取了 16 个 URL 作样本：四种语言的首页、列表页、五篇正文、几个静态页。本地起静态服务器，用 Playwright 1.57.0 的 Chromium 打开。Node 22.22，`deviceScaleFactor` 锁 1，动效设为 `reduce`。

三个条件，宽度都是 320：

| 条件 | 视口 | 模拟什么 |
|---|---|---|
| `narrow` | 320 x 844 | 窄屏手机 |
| `floor` | 320 x 256 | 标准写明的高度下限 |
| `zoom400` | 320 x 200 | 1280x800 屏幕开 400% 放大 |

每页取两个量。一个是文档 `scrollWidth` 超出 `innerWidth` 的像素数，即页面级横向溢出。另一个是 `position` 为 `sticky` 或 `fixed` 的元素在视口上下缘占掉的高度，以及扣除之后剩下的可用内容高度。

基线结果：

| 条件 | 出现横向滚动的页面 | 最大溢出 | 可用高度中位数 | 可用比例 |
|---|---|---|---|---|
| 320 x 844 | 16 / 16 | 17 px | 762 px | 90.3% |
| 320 x 256 | 16 / 16 | 17 px | 174 px | 68.0% |
| 320 x 200 | 16 / 16 | 17 px | 118 px | 59.0% |

横向那几列不是「接近」，是完全一致。页面名单一样，溢出值的分布也一样：14 个 2px，1 个 10px，1 个 17px。测了三遍，三遍同一个答案。

这不是白跑。它说明 1.4.10 的横向判定跟视口高度无关。只看宽度的话，一个条件就够。于是跑三个条件的价值全落在另一列上：90.3% 和 59.0%，中间差 31 个百分点。

## 43 个溢出里有 24 个不算违反

下沉到元素层面，画面就乱了。整个样本里，自身矩形右边缘跑出视口的元素有 43 个。最夸张的是某篇正文里的一个 `code`，超出视口 585px。而那一页的页面级溢出是 2px。

原因很朴素：那个 `code` 待在设了 `overflow-x` 的 `pre` 里。`pre` 自己消化横向滚动，页面就不会横移。规范里 "requiring scrolling in two dimensions" 这句在这里起了作用：读者是在代码块内部横拖，不是在拖整页。

所以审计脚本里加了一段祖先追溯：

```js
let inScrollContainer = null;
for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
  const pcs = getComputedStyle(p);
  if ((pcs.overflowX === 'auto' || pcs.overflowX === 'scroll' || pcs.overflowX === 'hidden')
    && p.scrollWidth > p.clientWidth + 1) {
    inScrollContainer = p.tagName.toLowerCase() + ':' + pcs.overflowX;
    break;
  }
}
```

就这一段，把 43 拆成了 24 和 19。被吸收的 24 个里，18 个是 `pre` 中的 `code`，6 个是表格包装层里的 `thead`/`tbody`。剩下 19 个才是真的在把页面往旁边推。

如果按元素做回流审计，这 24 个会全部进清单。拿着那份清单坐下，就是花半天去「修」本来没坏的代码块。判定单位是滚动容器，不是元素。

有一处要如实说明：把表格包装层里的表格归为「已吸收」，和标准的例外条款是重叠区域，这里带了我的判断。Understanding 把数据表列为例外，方向没错，但脚本并没有替规范下判定。

## 真正把页面推歪的三类

剩下的 19 个干净地分成三类，成因不同，修法也不同。

<strong>第一类，头部的控件行。</strong>16 个页面全部命中同一个元素，各溢出 2px：头部右侧的主题切换加语言切换。320px 减去 `nav` 左右各 16px 的内边距，剩 288px，而品牌标、菜单按钮和右侧控件的固有宽度加起来是 290。观测到的 14 次溢出全出自这一处。

<strong>第二类，断不开的长字符串。</strong>联系页的两张卡片各溢出 10px。卡片里放着一个邮箱地址，整串不可断，把卡片顶出了 288px 的轨道。卡片实测宽 314px。

<strong>第三类，永不折行的多列网格。</strong>改进记录页的 `.before-after` 溢出 17px。它用 `grid-template-columns: 1fr auto 1fr` 把「改进前、箭头、改进后」横排，没有针对窄宽度的退路，到 320px 也硬撑三列。

这个分类的用处就在于三者性质不同：第一类调个间距就完事，第三类一条媒体查询就完事。第二类没那么省心。

## `break-word` 修不好，规范里写着

长邮箱撑破容器是老问题，我下意识挂了 Tailwind 的 `break-words`。重测：卡片还是 314px，溢出还是 10px。

这不是 Tailwind 的锅，是 CSS 规范就这么定的。[CSS Text Module Level 3](https://www.w3.org/TR/css-text-3/#overflow-wrap-property) 对这个值的定义是：

> As for `anywhere` except that soft wrap opportunities introduced by `break-word` are *not* considered when calculating min-content intrinsic sizes.

紧接着上一条，`anywhere` 的规定正好相反：

> Soft wrap opportunities introduced by `anywhere` *are considered* when calculating min-content intrinsic sizes.

网格和弹性项目的 `min-width` 默认是 `auto`，取的是内容的 min-content 尺寸。`break-word` 造出来的换行机会不计入这个尺寸，轨道就依然按整串邮箱的宽度撑着。屏幕上文字确实换行了，盒子却没缩。最容易让人以为自己修好了。

动博客代码之前，我先做了最小复现：288px 的网格轨道里放四张卡片，同一个邮箱，四种处方。

| 处方 | 卡片实测宽度 |
|---|---|
| 无 | 304 px |
| `overflow-wrap: break-word` | 304 px |
| `overflow-wrap: anywhere` | 288 px |
| 项目加 `min-width: 0` + `break-word` | 288 px |

和规范原文一字不差。`break-word` 一个像素都没动，`anywhere` 和 `min-width: 0` 精准贴合轨道宽度。线上改的是 `overflow-wrap: anywhere`。

这个坑难缠的地方在于失败很安静：样式加了，文字换行了，肉眼看着像是变了，只有页面溢出原地不动。和我在 [1.4.12 字距测量](/zh/blog/zh/text-spacing-1412-clamp-audit-2026)里遇到的是同一类坑——那次是指标看不见失败，这次是处方够不着病因。

## 400% 放大真正改变的东西

以上是横向。跑三个条件的理由在纵向。

sticky 头部实测 82px。在 844px 的视口里占 9.7%，在 200px 的视口里占 41%。剩下的可用高度是 118px，正文行高 28px，一屏四行多一点。

![320x200 视口下保留 sticky 头部与还原为常规流的实际画面对比。左侧头部覆盖 82px，正文只剩 118px；右侧 200px 全部是正文](../../../assets/blog/reflow-1410-400-zoom-viewport-height-2026/zoom400-before-after.png)

两张图是同一篇正文、同一个视口，滚到 2,600px 处各截一次。左边是原来的行为，右边是修改之后。

有一点要讲清楚：这不是 1.4.10 的违反。标准判的是双向滚动，头部占纵向空间不在其列。完全可以通过标准，同时只给读者留四行。

但我认为该改。既然 320 这个数字来自放大用户，那么同一次放大产生的 200 也是同一批人的屏幕。在宽度上照顾他们、在高度上视而不见，逻辑上说不通。何况例外清单里明写着 "interfaces where it is necessary to keep toolbars in view while manipulating content"。这说的是操作内容时必须持续可见的工具栏，那种界面才有占屏幕的理由。博客头部不属于这一类。读文章的时候，语言切换按钮没有必要一直浮在那里。

## 改完再测一遍

改了四处。

```css
/* Header.astro: 320px 下控件行溢出 2px */
@media (max-width: 400px) {
  .site-header > nav { padding-inline: 0.75rem; }
  .site-header__row { gap: 0.5rem; }
}

/* Header.astro: 短视口下把头部还给常规流 */
@media (max-height: 400px) {
  .site-header { position: static; }
}
```

```css
/* improvement-history: 窄宽度下解开三列，箭头转向 */
@media (max-width: 480px) {
  .before-after { grid-template-columns: 1fr; gap: 0.5rem; }
  .arrow { transform: rotate(90deg); }
}
```

邮箱地址那里挂上 `overflow-wrap: anywhere`。

第四处稍微绕一点。上个月修[被同一个 sticky 头部遮住的焦点](/zh/blog/zh/focus-not-obscured-sticky-header-scroll-padding-2026)时，我把 `scroll-padding-top` 设成了 96px，好让焦点落在 82px 的头部下方。可一旦到了头部不再吸顶的短视口，96px 留着不动，就等于把 200px 屏幕的近一半当成滚动留白扔掉。为一条成功标准加的值，在另一条标准的场景下成了负担。

```css
@media (max-height: 400px) {
  html {
    --header-height: 0px;
    scroll-padding-top: 1rem;
  }
}
```

重新构建，同一个脚本、同样 16 个 URL 再跑一遍。

| 条件 | 出现横向滚动的页面（前 → 后） | 最大溢出 | 可用比例（前 → 后） |
|---|---|---|---|
| 320 x 844 | 16 → 0 | 17 → 0 px | 90.3% → 90.3% |
| 320 x 256 | 16 → 0 | 17 → 0 px | 68.0% → 100.0% |
| 320 x 200 | 16 → 0 | 17 → 0 px | 59.0% → 100.0% |

400% 放大条件下，可用高度从 118px 变成 200px。换算成行数是 4.2 行到 7.1 行，增加 69%。844px 那档的 90.3% 是故意留着的：那个高度我要头部吸顶，媒体查询的断点也是照这个意思切的。

## 自动检测工具不看这里

`axe-core` 4.13.0 有 105 条规则，没有一条挂 `wcag1410` 标签。名字接近的几条性质完全不同：`meta-viewport` 查的是有没有禁用缩放（1.4.4），`scrollable-region-focusable` 查的是键盘能否进入滚动区域（2.1.1）。

这在意料之中。回流必须真的改视口、重新渲染才判得了，跟「把 DOM 扫一遍」的规则引擎工作方式对不上。哪些标准落在自动检测射程之外，我在[统计规则覆盖率那篇](/zh/blog/zh/act-rules-axe-coverage-wcag-sc-2026)里已经列过表。不过「射程之外」的意思是自己动手量，不是不用量。今天这个脚本一百来行，16 个页面三个条件跑完不到一分钟。

## 第一次运行时「通过」的两个页面

第一遍跑完，16 个里有两个显示溢出 0px、可用比例 100%。数字漂亮得很，我差点写下「有些页面已经达标」。

那两个 URL 根本不存在。本地服务器返回 404，404 页面没有头部，所以既没有溢出，也没有 sticky 元素可测。一个「什么都没测」换来的满分。

于是脚本里加了响应码校验：

```js
const resp = await page.goto(`http://localhost:${port}${u}`, { waitUntil: 'networkidle' });
if (!resp || resp.status() !== 200) {
  throw new Error(`${u} returned ${resp ? resp.status() : 'no response'} 请修正样本 URL`);
}
```

测量工具把失败报成通过，路径大多长这样：不是数字离谱到让人停下来查，而是数字好看到让人一眼滑过去。只要审计脚本里的 URL 是手写清单，响应码校验就不是可选项。

## 这次测量回答不了的事

一台 macOS、一个 Chromium 构建。其他引擎没验。

模拟和真实的浏览器放大不是一回事。我设的是 320x200 的视口，不是把浏览器缩放调到 400%。布局结果应该一致，1.4.10 判的也是布局，但设备像素比和 `srcset` 的选择在两种方式下会不同。要看清加载的是哪一档图片，得用真放大重测。

样本是 1,366 个里的 16 个。挑选时优先覆盖模板而不是数量，正文只看了五篇。代码块和表格越多的文章，滚动容器分类对结果的影响越大，加大这部分样本，数字有松动的余地。

只看了横排内容。标准的第二条「高度 256 CSS px 下的横向滚动内容」对应竖排排版，而我的站点没有 `writing-mode: vertical-rl` 的正文，没有可测对象。用竖排的站点，这条轴要单独看。

内容损失里的「重叠」类型没测。这个脚本看的只有文档级横向溢出和固定元素的纵向占用。

## 半天能跑完的检查顺序

1. 从构建产物里按模板取 10〜20 个 URL，首页、列表、正文、带表单的静态页混着来。
2. 先校验响应码是 200，杜绝「测了个 404 还写成通过」。
3. 用一个 320px 宽的条件测横向溢出，高度随便。三个高度给的是同一个答案。
4. 溢出的元素按「祖先里有没有真正的横向滚动容器」过一遍筛，被筛掉的不要改。
5. 剩下的分三类：控件行的固有宽度、断不开的长字符串、不折行的多列网格。
6. 长字符串用 `overflow-wrap: anywhere`，`break-word` 缩不了 min-content。
7. 单独跑一次 200px 高度的条件，算出 sticky 和 fixed 元素占了视口百分之多少。
8. 超过 30% 就考虑用 `@media (max-height: ...)` 放回常规流。如果配套设过 `scroll-padding-top`，一并调小。

第 7 步和第 8 步不属于 1.4.10 的判定项。它们回答的是另一个问题：无论通过与否，放大用户手里究竟还剩几行。我这边是 4.2 行。

400% 放大在无障碍检查清单上通常排在最后一行，也通常靠肉眼扫一眼就算过。把这一行换成实测数字和一个能反复重跑的脚本，这类活我接。入口只有一个：[联系页](/zh/contact/)。

---

*来源：W3C 的 [WCAG 2.2 成功标准 1.4.10 Reflow](https://www.w3.org/TR/WCAG22/#reflow)（W3C 建议标准，2024 年 12 月 12 日）、[Understanding SC 1.4.10](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)、[CSS Text Module Level 3](https://www.w3.org/TR/css-text-3/#overflow-wrap-property)（候选建议标准），均为官方一手来源。标准正文与 `overflow-wrap` 两个值的定义为原文照录，引用紧邻处附了原文链接。测量环境：jangwook.net 生产构建（HTML 1,366 个）中抽样 16 个 URL，视口 320×844、320×256、320×200，Playwright 1.57.0 + 无头 Chromium，Node 22.22，`deviceScaleFactor` 为 1，本地静态服务器，2026 年 8 月 9 日测量。脚本为 `scripts/audit-reflow.mjs`，原始数据在 `data/reflow-audit.json` 与 `data/reflow-audit-after.json`。设定视口并不等同于操作浏览器缩放，设备像素比与 `srcset` 的选择可能与真实的 400% 放大不同。所有数值都出自这一引擎、这一样本，不构成对其他站点违规率或其他渲染引擎行为的判断。重叠类型的内容损失和竖排内容未做测量。*
