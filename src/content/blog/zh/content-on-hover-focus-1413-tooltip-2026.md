---
title: '决定成败的不是那 8px，而是它长在哪儿：七种 tooltip 实测 SC 1.4.13'
description: '把同一句提示做成七种 tooltip，分别量 WCAG 2.2 SC 1.4.13 的 Dismissible、Hoverable、Persistent。纯 CSS 的三种全部倒在 Dismissible 上，popover="hint" 白送你 Dismissible，却在 Hoverable 上翻车。'
pubDate: '2026-08-12'
heroImage: '../../../assets/blog/content-on-hover-focus-1413-tooltip-2026/hero.png'
tags:
  - 无障碍
  - WCAG
  - CSS
  - 前端
  - Web开发
faq:
  - question: '给 tooltip 加上 :focus-visible，SC 1.4.13 就算过了吗？'
    answer: '不算。:focus-visible 解决的是「键盘也能打开」，而 1.4.13 要求的三条跟这个是两回事。我这次实测里，同时挂了 :hover 和 :focus-visible 的实现，Hoverable 和 Dismissible 两条都没过。能用键盘打开，和能用键盘关掉，是两个问题。'
  - question: '纯 CSS 能不能把 1.4.13 三条全满足？'
    answer: '在我做出来的范围里做不到。Hoverable 和 Persistent 靠 :has() 加内边距就能过，但 Dismissible 要接住 Escape 键，CSS 里没有对应的钩子。标准只对「不遮挡也不替换其他内容」的弹出层豁免 Dismissible，而我这份 fixture 里的六个 tooltip 全都盖住了正下方的段落。'
  - question: '用了 HTML 的 popover 属性，无障碍就交给浏览器了吗？'
    answer: '只交出去了 Dismissible。popover="hint" 的 Escape 响应由浏览器提供，所以指针不动也能关掉。但什么时候开、什么时候关，仍然是你自己挂的事件，指针一踏进那 8px 空隙，mouseleave 就先触发了，Hoverable 就是这样丢的。'
  - question: 'tooltip 两秒后自动消失，问题出在哪儿？'
    answer: '标准认可的消失条件只有三种：触发器被移除、用户主动关闭、信息不再有效。经过时间不在这个名单里。我这次量到的结果是，挂了 2 秒定时器的实现，指针原地不动等五秒就没了，Persistent 判负。'
relatedPosts:
  - slug: modal-focus-escape-inert-measure-2026
    score: 0.86
    reason:
      ko: 모달에서 Escape와 inert를 재던 글의 반대편이다. 그때는 닫히는 것이 당연한 컴포넌트를 다뤘고, 이번엔 아무도 Escape를 붙이지 않는 컴포넌트를 다룬다. 키 하나를 어디서 듣느냐는 문제는 두 글에서 같은 모양으로 반복된다.
      ja: モーダルのEscapeとinertを測った記事の裏面にあたる。あちらは閉じて当然の部品で、こちらは誰もEscapeを付けない部品だ。キー一つをどこで聞くかという問題は、二つの記事で同じ形をしている。
      en: The mirror image of the modal post that measured Escape and inert. That one dealt with a component everyone expects to close; this one deals with a component nobody wires Escape into. Where you listen for that single key is the same problem in both.
      zh: 那篇量模态框 Escape 和 inert 的文章的背面。那边处理的是理应能关掉的部件，这边处理的是没人给它接 Escape 的部件。这个键该在哪儿监听，两篇里是同一个形状的问题。
  - slug: act-rules-axe-coverage-wcag-sc-2026
    score: 0.81
    reason:
      ko: axe 4.13.0의 규칙 105개 중 1.4.13에 태그된 것이 0개라는 사실은 그 글에서 만든 목록으로 먼저 확인했다. 어떤 기준을 손으로 재야 하는지 고를 때 그 표를 먼저 펼친다.
      ja: axe 4.13.0の105ルールのうち1.4.13タグが0という事実は、あの記事で作った一覧で先に確かめた。どの基準を手で測るか選ぶとき、まずあの表を開く。
      en: The fact that 0 of axe 4.13.0's 105 rules carries a 1.4.13 tag came out of the inventory built in that post. It is the table I open first when deciding what has to be measured by hand.
      zh: axe 4.13.0 的 105 条规则里 0 条挂 1.4.13 标签，这件事是先在那篇做的清单里确认的。挑哪些标准得手动量时，先翻那张表。
  - slug: wcag22-target-size-audit-2026
    score: 0.72
    reason:
      ko: 같은 WCAG 2.2에서, 숫자로 적힌 기준이 실제로는 예외 조항에서 갈린다는 이야기를 했던 글이다. 이번 1.4.13도 판정을 가른 것은 8px이라는 숫자가 아니라 그 8px이 어디에 있느냐였다.
      ja: 同じWCAG 2.2で、数字で書かれた基準が実際には例外条項で分かれるという話をした記事だ。今回の1.4.13も判定を分けたのは8pxという数字ではなく、その8pxがどこにあるかだった。
      en: "The post that argued a criterion written as a number actually turns on its exception clauses. Same shape here: what split the verdicts was not the 8px, but where the 8px sat."
      zh: 那篇讲的是，同属 WCAG 2.2、写成数字的标准，实际分野在例外条款上。这次 1.4.13 也一样：分开判定的不是 8px 这个数，而是这 8px 落在哪儿。
---

两个 tooltip 长得一模一样。触发按钮一样，提示文案一样，跟按钮之间都空了 8px。判定结果一个过一个不过。

差别不在选择器，在那 8px 是用 `margin` 撑出来的还是用 `padding` 顶出来的。前者在命中测试里也是 8px，指针一离开按钮就掉进空档，提示当场消失；后者的盒子紧贴按钮，空白只是盒子内部的内边距，脚本量出来的间距是 0px。看着一样，摸起来不一样。

WCAG 2.2 的成功标准 1.4.13 就卡在这类地方。它要的从来不是「能打开」，而是三件事：能不能关掉、指针能不能挪上去、能停留多久。于是我把同一句提示做成七种机制，扔进仓库外的临时目录，三条分开量。纯 CSS 的三种全部倒在 Dismissible 上，`popover="hint"` 一行代码不用就拿下 Dismissible，却在 Hoverable 上翻了车。七个里三条全过的只有一个。

![三种 tooltip 实现拿到三种不同判定的实拍画面](../../../assets/blog/content-on-hover-focus-1413-tooltip-2026/hero.png)

## 这条标准到底管什么

先把射程说清楚。1.4.13 是 AA 级，WCAG 2.1 时新增，延续到 2.2。它管的是「指针悬停或键盘聚焦时出现、撤掉就消失的附加内容」。tooltip 是典型，悬停展开的大菜单、用户名上浮出的资料卡、表单输入框旁边的帮助气泡，都在里面。

不管什么也写明了。W3C 给标准正文附的第三条注释这样写，原文在 [W3C 的 WCAG 2.2 推荐标准](https://www.w3.org/TR/WCAG22/#content-on-hover-or-focus)：

> This criterion applies to content that appears in addition to the triggering component itself. Since hidden components that are made visible on keyboard focus (such as links used to skip to another part of a page) do not present additional content they are not covered by this criterion.

聚焦后显露自己的跳转链接不在这条标准之内。必须有独立于触发器的内容「额外」冒出来，才进入判定范围。这条线不先划好，半个页面都会被你按 1.4.13 误判。

三条要求各自在护着谁，也值得记一下。它们统统指向用屏幕放大的人和手不太稳的人。放大到 400% 时，tooltip 会盖住视口相当大一块，没法把它挪开，底下那段文字就等于没有了。指针控制不精细的人，为了读提示正文去挪鼠标，半路就把提示弄丢了。而几秒钟自动消失的弹出层，对阅读速度慢的人来说跟不存在没区别。Dismissible、Hoverable、Persistent 一条对一个场景。

## 标准原文要求了什么

规范正文很短，照 [W3C 的成功标准 1.4.13 原文](https://www.w3.org/TR/WCAG22/#content-on-hover-or-focus) 抄下来：

> Where receiving and then removing pointer hover or keyboard focus triggers additional content to become visible and then hidden, the following are true:
>
> **Dismissible:** A mechanism is available to dismiss the additional content without moving pointer hover or keyboard focus, unless the additional content communicates an input error or does not obscure or replace other content;
>
> **Hoverable:** If pointer hover can trigger the additional content, then the pointer can be moved over the additional content without the additional content disappearing;
>
> **Persistent:** The additional content remains visible until the hover or focus trigger is removed, the user dismisses it, or its information is no longer valid.
>
> Exception: The visual presentation of the additional content is controlled by the user agent and is not modified by the author.

有两处得读第二遍。

一是 Dismissible 后面挂了条件从句。附加内容如果是在报输入错误，或者不遮挡也不替换其他内容，这条要求就豁免。也就是说「什么都不盖」的 tooltip 可以没有关闭手段。只是这种 tooltip 很少见。我量了弹出层矩形和正下方段落矩形是否相交，六个全都相交。

二是例外只覆盖浏览器自己画、作者没碰过的呈现。同一页的第一条注释点了名：

> Examples of additional content controlled by the user agent include browser tooltips created through use of the HTML `title` attribute [HTML].

`title` 属性在标准之外。常见的误读从这里开始：在标准之外不等于通过了标准，只等于这把尺子不量它。`title` 提示照样在触摸设备上不出现，显示时机和停留时长作者都插不上手。豁免只是把判决延后，问题一件没少。

## 七种实现，同一把尺子

仓库外的临时目录里放一张静态 HTML。同一个按钮，同一句话（"Rate limit: 60 requests per minute per API key."），触发器和弹出层之间统一 8px。七行到这里完全一致，唯一的变量是开合的机械结构。

| | 实现 | 打开方式 |
|---|---|---|
| V1 | `title` 属性 | 浏览器自己画 |
| V2 | 只有 CSS `:hover` | 仅指针 |
| V3 | CSS `:hover` + `:focus-visible` | 指针、键盘 |
| V4 | CSS `:has()` + 内边距搭桥 | 指针、键盘 |
| V5 | JS 悬停/聚焦/Escape + 150ms 宽限 | 指针、键盘 |
| V6 | JS + 2 秒自动隐藏 | 指针、键盘 |
| V7 | 原生 `popover="hint"` | 指针、键盘 |

判定用 Playwright 打。每项检查都重新加载页面，免得状态串味，一共量五件事。

- 悬停会不会打开
- Tab 聚焦会不会打开
- **Dismissible**：打开状态下指针不动，按 Escape 会不会关
- **Hoverable**：指针从触发器中心分十二步走到弹出层中心，它还活着吗
- **Persistent**：悬停之后什么都不做，五秒过去还在吗

Hoverable 这一项的量法要多说两句。`mouse.move` 一步飞到终点，中间的命中测试会被跳过，空隙就这么被越过去了，那样七种实现全都能「过」。所以把坐标切成十二等份，每步隔 20ms 推进，尽量贴近真实的手划过去的轨迹。

```js
const path = 12, from = center(tb), to = center(pb);
for (let i = 1; i <= path; i++) {
  await page.mouse.move(
    from.x + (to.x - from.x) * i / path,
    from.y + (to.y - from.y) * i / path
  );
  await page.waitForTimeout(20);
}
r.hoverable = await page.locator(v.tip).isVisible();
```

环境是 Chromium 143.0.7499.4 无头、Playwright 1.57.0、Node 22.22、视口 900×1400。同一份脚本跑了两遍，七行数值完全一致。

![七种实现在五项检查下的判定矩阵](../../../assets/blog/content-on-hover-focus-1413-tooltip-2026/criteria-matrix.png)

## CSS 听不见 Escape

V2、V3、V4 一行 JavaScript 都没有，三个都倒在 Dismissible 上。这不是写得不好，是结构决定的。Dismissible 要的是「指针和焦点都不动就能关掉」的手段，现实中这个手段就是 Escape 键，而 CSS 里没有响应按键的选择器。

W3C 的 [Understanding 文档](https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus.html) 解释这条要求时举的正是按 Escape 清掉提示的例子（此处为概述，不是逐字引用）。除非落进前面那条豁免，纯 CSS 的 tooltip 没有路径通过这一项。

豁免当然可以争取，做一个「不遮挡也不替换其他内容」的提示就行。所以我把遮挡也一并量了，六个全部压住了下面那段。用最常见的那种摆法，绝对定位吊在触发器正下方，想不盖住后续内容反而更难。要是在布局流里预留位置、把弹出层塞进那个位置，豁免确实成立，但那东西已经更像折叠面板了。

由此得出一条我现在会守的判断：**「tooltip 纯 CSS 就能写」这句话，通常指的是「1.4.13 三条里的两条」。** 剩下那条最后还是要拖进键盘事件监听器，那就不如一开始用 JS 管状态，代码反而更短。两行 `:hover` 就以为收工的组件，其实是半成品上线了，这是整轮实验里重复得最多的一个发现。同样的结构我在[量模态框 Escape 与 inert 的那篇](/zh/blog/zh/modal-focus-escape-inert-measure-2026)里也见过，只是那边至少大家都认同「它该能关」。对 tooltip，连这份认同都没有。

## 8px 留在眼睛里，从盒子里删掉

Hoverable 这一项把 V3 和 V4 分成了两边。同样是 CSS，打开条件也一样，分野不在选择器，在盒子的尺寸。

V3 给弹出层加了 `margin-top: 8px`。视觉上离 8px，命中测试上也离 8px。指针离开触发器踩进那条空白的一瞬间，`:hover` 就松了，提示随即消失。脚本量到的触发器底边到弹出层顶边的距离，正好 8px。

V4 把同样的 8px 换成内边距做。弹出层的盒子本身贴着触发器，盒子内侧上方留 18px 透明内边距，只把内容往下推。脚本量到的间距是 0px。看着是分开的，对指针来说是连着的。再用 `:has()` 把「悬停在弹出层自己身上」也算进打开条件，纯 CSS 就能拿下 Hoverable。

```css
/* 弹出层贴住触发器，留白挪进盒子内部 */
#tip { display: none; margin-top: 0; padding-top: 18px; background: transparent; }
#tip .inner { background: #111827; color: #f9fafb; border-radius: 6px; padding: 10px 12px; }

.anchor:has(.trigger:hover) #tip,
.anchor:has(.trigger:focus-visible) #tip,
.anchor:has(#tip:hover) #tip { display: block; }
```

还有一条路是用时间换。V5 把 8px 空隙原样留着，`mouseleave` 时不立刻关，而是排一个 150ms 之后关闭的计划，指针一碰到弹出层就把这个计划取消。指针横穿那条空白的时候，提示还活着。

```js
let timer;
const open  = () => { clearTimeout(timer); tip.classList.add('open'); };
const close = () => tip.classList.remove('open');
const soft  = () => { clearTimeout(timer); timer = setTimeout(close, 150); };

trigger.addEventListener('mouseenter', open);
trigger.addEventListener('focus', open);
trigger.addEventListener('blur', close);
trigger.addEventListener('mouseleave', soft);
tip.addEventListener('mouseenter', open);
tip.addEventListener('mouseleave', soft);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
```

这二十行是七个里唯一三条全过的。没有什么高招：听 Escape，给空隙一点宽限，别用定时器藏起来。

不过 150ms 是我挑的数，不是标准给的数。无头浏览器走直线时够用；手慢一点、走个弧线要多少，这次没量。把宽限值扫一遍找出失败点，是下一次的作业。相对稳妥的是内边距那条路，间距为 0，宽限值该选多少这个问题本身就不存在了。

## popover 只给你一半

学到最多的一行是 V7。用 `popover` 属性，显示状态和顶层都交给浏览器管。`popover="hint"` 是其中冲着 tooltip 来的值，按 [WHATWG 的 HTML 标准](https://html.spec.whatwg.org/multipage/popover.html)，auto 和 hint 状态支持轻量关闭并响应关闭请求，manual 不响应（此处为概述，不是逐字引用）。关闭请求里就包含 Escape 键。

实测跟规范对上了。V7 在指针不动的情况下按 Escape 就关掉了。**七个里，一行代码不写就拿到 Dismissible 的只有它。** 平台标准功能整条顶掉一项无障碍要求，这个值为什么会进标准，我算是想明白了。

可 Hoverable 它没过，原因很平淡：`popover` 替你管的是「开着还是关着」这个状态，不是「什么时候开、什么时候关」。想做悬停触发的 tooltip，最后还是得在 `mouseenter` 里调 `showPopover()`、在 `mouseleave` 里调 `hidePopover()`，而这个 `mouseleave` 正好在指针踏进 8px 空隙时触发。哪怕弹出层在顶层，指针也还没走到它上面。

归拢一下：CSS 给你 Hoverable 和 Persistent，给不了 Dismissible；`popover` 给你 Dismissible，给不了 Hoverable。两个一半不重叠，所以要三条全过，用了 `popover` 也得把上一节的宽限逻辑或者内边距桥原样搭上去。下次看到「用 popover，tooltip 无障碍就解决了」的说法，先核这一处。

## 两秒后消失的提示

V6 出发点是一份体贴：提示一直挂在屏幕上碍事，那就两秒后自动收起来。不少 UI 库把这个当默认值，我以前也这么写过。

指针按着不动等了五秒，弹出层没了，Persistent 判负。标准允许的消失条件只有三条：触发器被移除、用户主动关闭、信息不再有效。经过时间不在这份名单上。

有人会想，「信息不再有效」能不能拿来给定时器兜底。确实有能用的场合，比如倒计时、有有效期的一次性验证码，内容本身就绑在时钟上。而一句讲 API 速率限制的说明，两秒后依旧成立，不构成把它从读得慢的人眼前拿走的理由。

V6 在 Hoverable 上也没过，那是跟定时器无关的另一处：它同样在 `mouseleave` 时立刻关。一个组件同时丢掉三条，并不难做到。

## axe 的 105 条规则里，看这条的是 0 条

把七个全部撑开，跑 axe-core 4.13.0。报出来的违规只有 `landmark-one-main` 和 `region` 两条，都是我这份 fixture 没写地标造成的，跟 tooltip 的行为没关系。

原因在规则清单里。axe-core 4.13.0 一共 105 条规则，挂 `wcag1413` 标签的是 0 条。

```
axe-core 4.13.0 total rules: 105
rules tagged wcag1413: 0 []
```

这不是在怪工具。Dismissible、Hoverable、Persistent 都不是能从静态 DOM 上读出来的性质，得按键、得挪指针、得等。我在[按成功标准清点 axe 规则标签的那篇](/zh/blog/zh/act-rules-axe-coverage-wcag-sc-2026)里列过的盲区，在这儿原样重现。跑分是绿的，和这条标准守住了，两件事之间没有任何关系。

所以这次测量的射程也照直写下来：一个引擎（Chromium 143）、一个间距值（8px）、一张自己搭的 fixture。它不是在说真实站点的违规率，也不是在说别的渲染引擎会有同样表现。触摸输入下的行为、辅助技术用户的体验，这把尺子都没量。还有，我的 fixture 过了三项探针，和真实页面的符合性判定是两回事，后者要连豁免条款和上下文一起算。

## 把 8px 删掉，或者给出 150ms

这轮量下来能拿去用的判断不多，就这些。

- **Escape 不住在 CSS 里。** tooltip 只要盖住了后面的内容，就挂键盘监听器。只有确信它什么都不盖时，才去靠豁免条款。
- **间距留给眼睛，从盒子里删掉。** `margin` 撑的 8px 是指针陷阱，`padding` 顶的 8px 不是。分判定的是命中测试上的距离，不是看上去的距离。
- **非留间距不可，就给宽限。** 别在 `mouseleave` 立刻关，排到 100〜200ms 之后，指针进来就取消。
- **别用定时器藏。** 自动隐藏只有在内容确实绑着时钟时才站得住。
- **用了 `popover` 也得自己写开合条件。** 浏览器替你扛的到 Dismissible 为止。
- **动手核。** 扫描器的规则清单里没有这条。把指针推进弹出层、按一下 Escape、等五秒，三个动作就够。

还有一件我没定下来。把弹出层贴死在触发器上，Hoverable 是稳了，可两者的视觉边界会糊在一起，到某个程度就分不清按钮到哪儿为止。内边距要厚到多少那道边界才重新看得见，以及这条路是不是真的比「留着间距、给宽限」更好，光靠这张 fixture 答不出来。下次把宽限值扫一遍，用同一把尺子把两条路摆一起比。

如果你面前是一屏叠着下拉、菜单和气泡的界面，不知道这三条该从哪儿下手，来问也行。把标准的句子搬成组件代码，再让脚本而不是人去反复复核判定，这就是我做的事。联系方式放在个人资料里。

---

*出处：W3C 的 [WCAG 2.2 成功标准 1.4.13 Content on Hover or Focus](https://www.w3.org/TR/WCAG22/#content-on-hover-or-focus)（W3C 推荐标准）、[Understanding SC 1.4.13](https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus.html)，以及 WHATWG 的 [HTML Standard, The popover attribute](https://html.spec.whatwg.org/multipage/popover.html)（均为官方）。成功标准正文与注释 1、3 是当场对照 W3C 推荐标准原文逐字抄录的，引用旁边放了原文链接。Understanding 文档和 HTML 标准的内容是概述后转述并附链接，不是逐字引用。测量环境：临时沙箱目录里的一张静态 HTML（七种 tooltip 实现）、Chromium 143.0.7499.4 无头、Playwright 1.57.0、Node 22.22、视口 900×1400、触发器与弹出层间距 8px、axe-core 4.13.0，2026 年 8 月 12 日测量。探针脚本为 `scripts/probe-hover-focus-1413.mjs`，fixture 为 `scripts/fixtures-hover-focus-1413.html`，原始数据为 `data/hover-focus-1413-probe.json`。同一脚本跑了两遍，结果一致。所有判定都出自这个引擎、这张 fixture、这个间距值，不构成对真实站点符合性或其他渲染引擎行为的断言。触摸输入与辅助技术下的行为，以及 `title` 属性由浏览器绘制的提示（DOM 上观测不到），均未测量。*
