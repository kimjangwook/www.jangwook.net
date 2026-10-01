---
title: WCAG 2.2 最小目标尺寸：藏在92分绿灯背后的AA不合格
description: 一排22×22的分页链接，拇指总按偏，Lighthouse却给了无障碍92分。我把WCAG 2.2新增的SC 2.5.8（最小24×24）种进沙箱，用自写脚本和Lighthouse各测一遍。自动工具如今能抓尺寸违规，却把例外判定甩回给你。连24px圆是否相交的间距例外计算，都用实测日志和CSS修复讲清楚。
pubDate: '2026-07-19'
heroImage: ../../../assets/blog/wcag22-target-size-audit-2026/target-size-demo.png
tags:
  - a11y
  - wcag
  - accessibility
  - web-development
relatedPosts:
  - slug: axe-automated-a11y-coverage-gap-2026
    score: 0.82
    reason:
      ko: "저 글은 'axe가 구조적으로 못 잡는 넷'을 다뤘다. 이 글은 그중 타깃 크기만은 axe가 이제 잡더라는 반례와, 그래도 예외 판정은 여전히 사람 몫이라는 경계를 실측했다."
      ja: "あちらは『axeが構造的に取りこぼす四つ』。本稿はそのうちタッチターゲットだけはaxeが今や捕まえるという反例と、それでも例外判定は人の仕事という境界を実測した。"
      en: "That post covers four things axe structurally misses. This one is the counter-case where axe now does catch target size, plus the boundary where exception judgment still falls to a human."
      zh: "那篇讲axe在结构上漏掉的四类问题。本文是其中的反例：目标尺寸axe如今能抓到，但例外判定仍归人来做。"
  - slug: a11y-lighthouse-audit-fix-2026
    score: 0.75
    reason:
      ko: "Lighthouse로 접근성 위반을 잡아 고치는 기본 흐름을 먼저 보고 싶다면 저 글이 출발점이다. 이 글은 그 92점 점수가 왜 통과가 아닌지를 파고든다."
      ja: "Lighthouseでアクセシビリティ違反を捕まえて直す基本の流れは、まずあちら。本稿はその92点が『合格』でない理由を掘る。"
      en: "For the basic flow of catching and fixing a11y issues with Lighthouse, start there. This post digs into why that 92 score is not a pass."
      zh: "想先看用Lighthouse抓取并修复无障碍问题的基本流程，从那篇开始。本文深挖那个92分为何不等于合格。"
  - slug: accessible-name-agents-2026
    score: 0.68
    reason:
      ko: "타깃이 충분히 크더라도 이름이 비어 있으면 무용지물이다. 접근성 이름이 어떻게 조용히 틀어지는지 한 케이스로 깊게 판 글이 저기다."
      ja: "ターゲットが十分大きくても、名前が空なら意味がない。アクセシブルネームがどう静かに狂うかを一例で深掘りしたのがあちら。"
      en: "A target can be big enough and still be useless if its name is empty. That post drills into one case of how the accessible name quietly breaks."
      zh: "目标够大，若名称为空也没用。那篇用一个案例深挖无障碍名称是怎么悄悄出错的。"
---

无障碍自动检测分数92。报告顶部一个接近绿色的数字。可同一页往下，分页的数字链接每边只有22px。拇指按“3”，“2”和“4”跟着一起响应。分数看着像通过，指尖却一直滑开。

这道错位就是本文的起点。我把WCAG 2.2新增的一条成功标准——<strong>SC 2.5.8 Target Size (Minimum)</strong>——种进沙箱，用自写脚本和Lighthouse各测一遍。结论先说：自动工具如今抓明显的尺寸违规已经够准。但这条标准真正难的不是尺寸，而是<strong>例外条款</strong>，而这部分判定，仍旧是人的活。

## 24×24这个数字从哪来

先打地基。WCAG（Web内容无障碍指南）是W3C旗下WAI制定的Web无障碍标准。2.2版于2023年10月5日成为正式的W3C推荐标准（Recommendation），现行版本日期为2024年12月12日，并在2025年10月21日通过为ISO/IEC 40500:2025。相比2.1新增了9条成功标准，废弃了一条老旧的4.1.1 Parsing。

这9条里，让开发者今天就得改CSS的，是<strong>SC 2.5.8 Target Size (Minimum)</strong>，AA级。条文很短，照W3C原文引：“The size of the target for pointer inputs is at least 24 by 24 CSS pixels, except when…”。指针操作的目标至少要有24×24 CSS像素。这是为那些难以精准点中小控件的人设的：手指粗、手会抖、在颠簸的公交上。

数字别搞混。24×24是AA的<strong>下限</strong>。它之上还有SC 2.5.5 Target Size (Enhanced)，AAA级，要求44×44。作为参考，苹果的Human Interface Guidelines建议44pt，安卓的Material建议48dp。这两者不是W3C标准，而是平台推荐值，只当“参考值”看。实务里我给新组件从一开始就按44以上来搭，审计遗留代码时才把24当及格线。

“CSS像素”这个限定词在这里很关键。规则按CSS像素算，不是物理像素，所以在device pixel ratio为3的高清屏上，`min-height: 24px`照样满足要求。反过来，viewport元标签设错、缩放行为怪异，计算就会跑偏。所以我测量一律用渲染后的`getBoundingClientRect()`，不信样式表里的写法。

## 亲手埋雷，亲手测量

光说不够。于是我做了一个故意埋了违规的静态页，在临时沙箱里放了四块。

- toolbar-bad：4个16×16的图标按钮（Bold / Italic / Underline / Link）
- pager-bad：5个分页链接，写的是20×20，加上1px边框实测变22×22，间距为0
- toolbar-good：同样的按钮，用`min-width/min-height: 24px`加内边距放大
- pager-good：24×24，再用`margin: 2px`把间距也给足

核心标记如下。

```html
<!-- 违规: 16x16 -->
<section class="toolbar-bad">
  <button aria-label="Bold">B</button>
  <button aria-label="Italic">I</button>
</section>

<!-- 合规: 最小24x24 -->
<section class="toolbar-good">
  <button aria-label="Bold">B</button>
  <button aria-label="Italic">I</button>
</section>
```

```css
.toolbar-bad button  { width: 16px; height: 16px; padding: 0; }
.toolbar-good button { min-width: 24px; min-height: 24px; padding: 4px; }
```

在交给axe或Lighthouse之前，我先写了一个直接照标准算的脚本。这样就有了对照组，能看清自动工具到底看见什么、漏掉什么。这个审计脚本做两件事。第一，量出所有交互目标的渲染尺寸，挑出小于24的。第二，对挑出来的目标套用<strong>间距例外</strong>：在每个目标包围盒中心画一个直径24px的圆，用欧氏距离判断两圆是否相交。

```javascript
// WCAG 2.2 SC 2.5.8 最小目标尺寸审计
(() => {
  const MIN = 24, R = 12; // 直径24px -> 半径12
  const sel = 'a[href],button,input,select,textarea,' +
              '[role="button"],[role="link"],[tabindex]:not([tabindex="-1"])';
  const els = [...document.querySelectorAll(sel)]
    .filter(el => el.offsetParent !== null);
  const boxes = els.map(el => {
    const r = el.getBoundingClientRect();
    return { w: Math.round(r.width), h: Math.round(r.height),
             cx: r.left + r.width / 2, cy: r.top + r.height / 2,
             label: el.getAttribute('aria-label') || el.textContent.trim().slice(0, 12) };
  });
  const findings = [];
  for (const b of boxes) {
    if (!(b.w < MIN || b.h < MIN)) continue;         // 24及以上通过
    const tooClose = boxes.some(c =>                  // 间距例外判定
      !(c.cx === b.cx && c.cy === b.cy) &&
      Math.hypot(c.cx - b.cx, c.cy - b.cy) < 2 * R);
    findings.push({ label: b.label, size: `${b.w}x${b.h}`,
                    verdict: tooClose ? 'FAIL' : 'PASS(spacing)' });
  }
  return { total: boxes.length, undersized: findings.length, findings };
})();
```

在Chrome里跑出来的实测结果。

```json
{
  "total": 18,
  "undersized": 9,
  "findings": [
    { "label": "Bold",  "size": "16x16", "verdict": "FAIL" },
    { "label": "Italic","size": "16x16", "verdict": "FAIL" },
    { "label": "Underline","size":"16x16","verdict":"FAIL" },
    { "label": "Link",  "size": "16x16", "verdict": "FAIL" },
    { "label": "1", "size": "22x22", "verdict": "FAIL" },
    { "label": "2", "size": "22x22", "verdict": "FAIL" },
    { "label": "3", "size": "22x22", "verdict": "FAIL" },
    { "label": "4", "size": "22x22", "verdict": "FAIL" },
    { "label": "5", "size": "22x22", "verdict": "FAIL" }
  ]
}
```

18个目标里9个不足24，全部FAIL。good两块里的24×24目标，在挑选阶段就没被选中。有意思的是pager-bad测出22×22。CSS里我写的是20px，可两侧各1px的边框把实测撑到了22。只用眼睛读代码会漏掉的误差，渲染后测量直接摊开给你看。

## 自动工具看到哪一步

现在上对照组。同一个页面用Lighthouse移动端快照跑一遍。无障碍分数<strong>92</strong>。失败的审计项有两个：`target-size`和`landmark-one-main`。由axe-core驱动的`target-size`审计得分0，指向的正是同样那9个节点。

```
Accessibility: 92
Failed audits: target-size, landmark-one-main
target-size: score=0, flagged 9 nodes
  <button aria-label="Bold"> ... <a href="#5">
```

两点想钉住。

先说好消息。“自动工具只看无障碍的表面”这句老话，在这一项上过时了。axe-core现在带了`target-size`规则，指出的<strong>正是我脚本挑出的同样9个</strong>。我那套含间距计算的判定和axe完全一致，说明工具真的实现了24px圆相交这套逻辑。单论尺寸违规，axe靠得住。这一点也是我此前那次实验的反例——[axe在结构上漏掉的四类问题](/zh/blog/zh/axe-automated-a11y-coverage-gap-2026/)。那时候需要人判断的项藏在绿灯背后，而目标尺寸因为能落成规则，自动化追上了。

再说坏消息。可分数还是92。一个明显破了一条AA成功标准的页面拿到了92分。分数是加权平均，一条规则为0，其余撑住，数字看着就像通过。<strong>分数不是符合性。</strong>WCAG是通过/不通过的二值标准，不是92这样的连续值。要主张AA，就得满足包括2.5.8在内的每一条AA标准，没有例外。这就是为什么别把仪表盘上的绿数字当成符合性的证据。哪怕你已经掌握了[用Lighthouse抓取并修复的基本流程](/zh/blog/zh/a11y-lighthouse-audit-fix-2026/)，这个陷阱依然在。

## 例外条款才是真正的考题

这里是这条标准的核心。2.5.8要求24×24，同时留了五个例外。按W3C原文顺序排。

| 例外 | 要点 | 工具能否判定 |
|---|---|---|
| Spacing（间距） | 小也行，只要24px的圆不相交 | 部分可（几何计算） |
| Equivalent（等效） | 同一功能有另一个足够大的控件提供 | 不可（人判断） |
| Inline（行内） | 目标在句子中，或尺寸被行高约束 | 部分可 |
| User agent control | 尺寸由浏览器决定，非作者设定 | 部分可 |
| Essential（必要） | 该呈现是本质需要或法律要求 | 不可（人判断） |

间距例外在实务里用得最多。原文是：“Undersized targets … are positioned so that if a 24 CSS pixel diameter circle is centered on the bounding box of each, the circles do not intersect another target or the circle for another undersized target.”在每个目标中心放一个直径24px的圆，只要这些圆彼此不重叠，小于24的目标也算通过。两圆不重叠，中心间距就得不小于24px。

我那个pager-bad为什么FAIL，用这个就说清了。22×22的链接紧挨着没间隔，相邻中心距离22px，小于24，圆就重叠。可要是把链接仍留在22×22，用`margin`把中心间距撑到24px以上，不放大尺寸也能靠间距例外过关。这正是密集工具栏、数据密度高的表格里图标实在放不大时的逃生口。

麻烦在其余的例外。Equivalent和Essential，自动化原理上判不了。“页面别处有没有一个大按钮，跟这个小小的删除图标是同一个功能？”得理解页面含义才答得出。所以就算axe把某个目标标成FAIL，那到底是真违规还是被例外覆盖，得由你来确认。老实讲：<strong>自动FAIL是“请人复核是否属于例外”的信号，本身不是终判。</strong>反过来，自动PASS也不是符合性的保证。

## 用代码修

按成因分开开药方。

最常见的一类，目标单纯没够到尺寸。设个下限。用`min-width`/`min-height`，别用`width`；你要的是目标随内容变大，但绝不掉到24以下。

```css
/* 图标按钮：视觉尺寸保留，只把命中区放大到24 */
.icon-btn {
  min-width: 24px;
  min-height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
```

如果视觉上想保住16px的图标，只想扩大指尖区域，就用透明内边距或伪元素把命中区撑开。

```css
.tiny-icon { position: relative; }
.tiny-icon::after {           /* 看不见的24x24命中区 */
  content: "";
  position: absolute;
  inset: 50% auto auto 50%;
  width: 24px;
  height: 24px;
  transform: translate(-50%, -50%);
}
```

实在放不大的密集UI，就走间距例外。用`gap`或`margin`保住24px以上的中心间距。

```css
/* 保留22x22，但把中心间距顶到 >=24px -> 走间距例外通过 */
.pager a {
  width: 22px;
  height: 22px;
  margin: 0 2px;   /* 22 + 2 + 2 = 26px 的中心间距 */
}
```

然后把前面那段审计脚本常备着，做成书签工具或CI步骤。就算axe看着够用，亲眼读渲染后实测值这个习惯，能帮你抓住像1px边框这种误差。我把它放在部署前手动检查的最后一格。

## 常踩的坑

审计跑几遍，就会在同一处反复摔。先记四个。

第一，混淆`width`和`min-width`。`width: 24px`在内容溢出时会被裁掉，或被死死锁在24。我们要的是下限，不是固定值。一定用`min-width`/`min-height`。就这一个区别，能防住响应式里文字变长的按钮悄悄转成违规。

第二，做出重叠的命中区。用`::after`把命中区扩到24×24时，如果相邻两个图标的扩展区互相压上，按下去响应的就是错的目标。视觉上小，实际点击判定却变宽了。可以扩，但只扩到不和邻居重叠那条线。这里，24px圆相交的计算照样管用。

第三，用`transform: scale()`缩小的目标。CSS的`transform`只在绘制阶段缩小，不改布局尺寸。所以`getBoundingClientRect()`返回的是缩放后的实际屏幕尺寸，容易和你的本意对不上。图标要是用`scale`缩过，别忘了按缩放后的尺寸重测。

第四，只看焦点框就放心。键盘焦点清晰可见，不代表指针目标够大。2.5.8针对的是鼠标、触摸这类指针输入，和键盘无障碍（2.1.1）、焦点可见性（2.4.11）是不同的轴。无障碍不会因为过了一条轴，别的轴就自动跟上。就像[无障碍名称悄悄变空](/zh/blog/zh/accessible-name-agents-2026/)那样，尺寸、名称、焦点各查各的。

## 收尾：面对24px，开发者该做什么

压缩成一句：WCAG 2.2 SC 2.5.8把指针目标的最小尺寸钉在24×24 CSS像素、AA级；自动工具抓尺寸违规抓得好，例外判定却留给你；92这样的分数不是符合性的证据。

落成部署前清单。

- 量每一个按钮、链接、输入框的渲染尺寸。看`getBoundingClientRect()`的结果，不是CSS里的值。
- 出现小于24时，分三条开方。一，用`min-width/min-height: 24px`放大；二，需要保住视觉尺寸就扩透明命中区；三，实在放不大就做出24px以上的中心间距，走间距例外。
- axe标成FAIL的项，由人最后确认是否落入Equivalent或Essential例外。
- 别把仪表盘分数当符合性报告提交。AA是二值通过。
- 新组件从一开始按44以上搭，AA和AAA一步跨过。

只是一个小数字，可指尖一直按偏的UI，分数再绿也难用。24px，是对那根指尖最起码的体谅。

想把结构化数据稳稳地在服务端输出，或者想在代码层面体检既有站点的无障碍、目标尺寸、GEO适配，我个人接咨询和实现委托。从我资料页的联系入口找我就行。
