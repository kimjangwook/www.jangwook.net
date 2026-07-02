---
title: '无障碍分数从55到100 — 用Lighthouse实测并修复WCAG违规'
description: '把一个虚构的面包店落地页扔进Lighthouse无障碍审计，得了55分。这里是逐条修复6个WCAG违规、做到100分的实测日志，以及自动化工具始终没能发现的键盘陷阱。'
pubDate: '2026-07-02'
heroImage: '../../../assets/blog/a11y-lighthouse-audit-fix-2026/hero.png'
tags:
  - a11y
  - WCAG
  - Lighthouse
  - 网页无障碍
  - 网页开发
faq:
  - question: 'Lighthouse无障碍100分是否等于符合WCAG？'
    answer: '不是。Lighthouse的无障碍分数只统计axe-core能自动检测的项目。web.dev官方文档明确指出，自动检测只覆盖一部分无障碍问题，手动测试不可或缺。在我的实验中，一个键盘无法操作的假按钮（div加onclick）和一个没有标签的textarea，在满分100分下依然原封不动地留着。'
  - question: '自动化工具能查到什么程度？'
    answer: '仅凭标记就能判定的违规它查得很好：缺少lang属性、图片缺alt、对比度不足、标题层级错乱、链接没有名称、禁止缩放（user-scalable=no）。但"焦点是否按逻辑顺序移动""是否仅用键盘就能使用全部功能""屏幕阅读器读起来流程是否通顺"，这些必须由人来确认。'
  - question: '对比度要达到多少？'
    answer: '按WCAG 2.1 AA标准，正文文字与背景至少4.5:1，大号文字（约24px以上，或加粗19px以上）至少3:1。我before页面里浅灰底上更浅灰字的CTA按钮远远不达标，仅把颜色调深，对比度违规就消失了。'
  - question: '给div加onclick为什么有问题？'
    answer: 'div默认不能获得焦点，也不响应Enter和Space键。用鼠标能点，但对键盘和屏幕阅读器用户来说是一个不存在的按钮。Lighthouse的button-name检测根本不把这个div当按钮，于是判为通过。应当使用真正的button元素；实在不得已时，必须同时加上role="button"、tabindex="0"和键盘事件处理。'
relatedPosts:
  - slug: localbusiness-structured-data-server-side-vs-js-2026
    score: 0.6
    reason:
      ko: 둘 다 "화면에 보이는 것"이 아니라 "기계가 읽어가는 마크업"이 진짜 승부처라는 관점의 글이다. 그쪽은 크롤러가 읽는 JSON-LD를, 이 글은 스크린리더·자동 도구가 읽는 시맨틱 HTML을 다룬다.
      ja: どちらも「画面に見えるもの」ではなく「機械が読み取るマークアップ」が本当の勝負どころだという視点の記事だ。あちらはクローラーが読むJSON-LDを、本記事はスクリーンリーダーや自動ツールが読むセマンティックHTMLを扱う。
      en: Both argue that the real battleground is the markup machines read, not what shows on screen. That post covers the JSON-LD crawlers parse; this one covers the semantic HTML screen readers and audit tools parse.
      zh: 两篇都主张真正的关键在于"机器读取的标记"，而非"屏幕上看到的内容"。那篇讲爬虫读取的JSON-LD，本文讲屏幕阅读器和自动化工具读取的语义化HTML。
  - slug: multilingual-llm-token-tax-experiment
    score: 0.5
    reason:
      ko: 이 글도 내 사이트를 실측 대상으로 삼아 숫자로 확인한 글이다. Lighthouse 점수를 before/after로 직접 재본 이 글과 "믿지 말고 내 환경에서 재본다"는 접근이 같다.
      ja: この記事も自分のサイトを実測対象にして数字で確かめたものだ。Lighthouseスコアをbefore/afterで自分で測った本記事と「信じずに自分の環境で測る」というアプローチが同じだ。
      en: That post also treats my own site as the thing to measure and confirms it with numbers. It shares this article's approach of measuring before/after Lighthouse scores myself rather than trusting a claim.
      zh: 那篇文章同样把自己的网站当作实测对象、用数字来确认。与本文亲自测量before/after的Lighthouse分数一样，都是"不轻信、在自己环境里测"的思路。
---

同一份HTML，我跑了两次审计。第一次55分，第二次100分。中间改动的不过二十来行代码。无障碍常被当成"有预算再说"的事，可真正动手去看标记，你会发现其中很大一部分就是这种几行的问题。

这次我不只是嘴上说，而是亲自测了。我做了一个故意埋进常见无障碍错误的面包店落地页，用Chrome DevTools的Lighthouse无障碍审计跑出分数和违规清单，然后逐条修复再重新测量。下面的数字和日志，全部来自那个沙箱。

## 为什么网页开发者现在该亲自测无障碍

无障碍（a11y）已经不再只是屏幕阅读器和键盘用户的事了。因为把页面当作无障碍树（accessibility tree）而非"人眼"来读取的一方越来越多。屏幕阅读器一直如此，如今AI搜索爬虫和浏览智能体也在读取类似的结构信息。实际上，这次审计里我修好无障碍后，Lighthouse的Agentic Browsing分数也一起从50涨到了100。把语义化标记摆对，人类用户和机器消费者两边会被同时打分。

这和我那篇[主张"爬虫读取的标记才是真正胜负手"的结构化数据文章](/zh/blog/zh/localbusiness-structured-data-server-side-vs-js-2026)是同一条思路。在屏幕上好看，和被机器理解结构，是两回事。无障碍就是从人类用户这一侧去看那个"机器读取层"的问题。

先把一件事钉死。**Lighthouse无障碍100分并不意味着"符合WCAG"。** 正如web.dev官方文档所言，这个分数只统计axe-core能自动检测的项目，而自动检测只覆盖一部分问题。后文我会原样展示那些拿到100分后仍然残留的真实缺陷。

## 实验设置: 一个被故意弄坏的落地页

测试对象是在repo外临时目录里做的一张静态HTML。虚构面包店"Nordic Bakes"的落地页，配置很普通：头部导航、主视觉、图片卡片、预约表单、页脚。我在里面故意埋进了现场常遇到的无障碍错误。

- `<html>`上没有`lang`属性
- 主图和链接里的图标图片都没有`alt`
- 浅背景上更浅的文字和按钮（对比度不足）
- `<h1>`后面紧跟`<h3>`，标题层级断裂
- 只包着一张图片的链接（`<a>`里没有文字，只有图片）
- `<meta viewport>`里写了`user-scalable=no, maximum-scale=1`（禁止缩放）
- 以及两个自动化工具不太容易查到的：没有标签的`<textarea>`，还有一个看着像按钮、实为`<div onclick>`的"Send request"控件

本地用`python3 -m http.server`起服务，把Chrome指向那个URL，用`navigation`模式（桌面）跑Lighthouse审计。

![修复前的Nordic Bakes落地页。看上去没问题，实则藏着六个无障碍违规](../../../assets/blog/a11y-lighthouse-audit-fix-2026/before-page.png)

用眼睛看是好好的。问题全在画面之下，在标记里。

## 第一次测量: 55分，六个违规

第一次结果如下。

```text
URL: http://localhost:8765/before.html  (desktop, navigation)
Accessibility:      55
Best Practices:     100
SEO:                82
Agentic Browsing:   50
Passed: 32   Failed: 8
```

把无障碍类目里失败的审计项从报告JSON里抽出来，是这样。

| 审计项 | 违规内容 | 受影响节点 |
|---|---|---|
| `html-has-lang` | `<html>`没有`[lang]`属性 | 1 |
| `image-alt` | 图片没有`[alt]` | 2 |
| `color-contrast` | 前景/背景对比度不足 | 4 |
| `heading-order` | 标题未按顺序递减 | 1 |
| `link-name` | 链接没有可识别的名称 | 1 |
| `meta-viewport` | `user-scalable="no"` / `maximum-scale<5` | 1 |

这六项全是仅凭标记就能判定的类型，正好是自动检测擅长的。而且六项每一个都会成为真实用户的具体障碍。没有`lang`，屏幕阅读器无法决定用哪种语言的语音引擎来读。没有`alt`，图片只会被读成"图片"或文件名。禁止缩放，会挡住低视力用户放大屏幕。

## 逐条修复: 用代码diff看六处改动

修起来不难。关键是"把意义而非装饰写进代码"。

**1）声明文档语言。** 一个字符的问题。

```html
<!-- before -->
<html>
<!-- after -->
<html lang="en">
```

**2）图片替代文本。** 有信息的图片给出内容，纯装饰图片给空的`alt=""`。这里两张都有意义，所以用描述文字填上。

```html
<!-- before -->
<img src="/hero.jpg" width="320" height="180">
<a href="/story"><img src="/icon.svg" width="24" height="24"></a>
<!-- after -->
<img src="/hero.jpg" width="320" height="180"
     alt="Loaves of sourdough cooling on a wooden rack">
<a href="/story"><img src="/icon.svg" width="24" height="24"
     alt="Read our full story"></a>
```

第二处改动不仅解决`image-alt`，也顺带解决`link-name`。只包图片、没有文字的链接，一旦alt填上，那个alt就成了链接的可访问名称。修好一个违规、另一个跟着消失，是无障碍修复里常见的现象。

**3）颜色对比度。** before的CTA按钮是浅蓝背景（`#c8d8e4`）配更浅的灰字（`#aab8c2`），远低于AA（正文4.5:1，大号文字3:1）。我只是把颜色调深。

```css
/* before */
.cta { background:#c8d8e4; color:#aab8c2; }
.hero p { color:#9a9a9a; }
/* after */
.cta { background:#1f4e5a; color:#ffffff; }   /* 对比度大幅提升 */
.hero p { color:#595959; }                     /* 在 #f2f2f2 背景上通过AA */
```

**4）标题顺序。** before里`<h1>`后面直接跟了`<h3>`。屏幕阅读器用户靠浏览标题来把握页面结构，跳级就像目录缺了一层，听起来很怪。视觉大小用CSS调，标记层级按逻辑降为`<h2>`。

```html
<!-- before -->
<h1>Fresh Sourdough, Baked Daily</h1>
<h3>Order before 9am for same-day pickup</h3>
<!-- after -->
<h1>Fresh Sourdough, Baked Daily</h1>
<h2>Order before 9am for same-day pickup</h2>
```

**5）允许缩放。** 从viewport meta里去掉禁止缩放的属性。禁止缩放是开发者以"防止布局错乱"为由随手加进去的典型反模式。

```html
<!-- before -->
<meta name="viewport" content="width=device-width, initial-scale=1,
      user-scalable=no, maximum-scale=1">
<!-- after -->
<meta name="viewport" content="width=device-width, initial-scale=1">
```

此外我还把导航从`<div>`改成`<nav aria-label="Primary">`，给图标按钮（🛒）加上`aria-label="Open cart"`。这些没有直接体现在分数里，却真真切切改善了屏幕阅读器体验。

## 第二次测量: 100分，以及剩下的一行SEO

用同样的流程重新审计after页面。

```text
URL: http://localhost:8765/after.html  (desktop, navigation)
Accessibility:      100    (was 55)
Best Practices:     100
SEO:                91     (was 82)
Agentic Browsing:   100    (was 50)
Passed: 46   Failed: 1
```

![修复后的Nordic Bakes落地页。画面几乎没变，但无障碍违规降到了0](../../../assets/blog/a11y-lighthouse-audit-fix-2026/after-page.png)

无障碍零违规，满分100。剩下的那一个失败不是无障碍，而是SEO类目的`meta-description`（缺少描述meta标签）。这在本次实验范围之外，就留着了。值得注意的是Agentic Browsing也一起从50跳到100。语义化元素（`nav`、正确的标题层级、有名称的控件）正是浏览智能体解析页面结构时要用的东西。一组无障碍修复，同时抬升了三个类目。

## 自动化工具给了100分却漏掉的东西

这才是这次实验我最想说的。**100分的页面里仍然残留着真实的无障碍缺陷。**

还记得我在before页面埋的两个陷阱：没有标签的`<textarea>`，和一个被样式伪装成按钮、实体却是`<div onclick="submitForm()">`的"Send request"控件。我在报告JSON里直接查了相关审计项的分数。

```text
label                          => score: 1   (通过)
button-name                    => score: 1   (通过)
focusable-controls             => score: null (需手动确认)
interactive-element-affordance => score: null (需手动确认)
```

没有标签的textarea**通过**了`label`审计。假按钮div**通过**了`button-name`审计，因为工具根本不把这个div当按钮。"按钮要有名称"的规则不会套用在一个非按钮上。而能查出这个div真正问题（键盘既无法聚焦也无法触发）的`focusable-controls`项，被归为手动检查、不进分数。

说白了就是：给div只加onclick，鼠标能点，但对键盘用户来说是个不存在的按钮。`<div>`默认拿不到焦点，也不响应Enter和Space。要好好修，就用`<button type="submit">`；真的迫不得已时，才同时加上`role="button"`、`tabindex="0"`和键盘事件处理。after页面里我干脆换成了真正的`<button>`。

老实说，我认为这是无障碍分数最大的陷阱。100分的意思是"没有能被自动检测到的问题"，而不是"一个可用的页面"。一旦把分数当目标，你就会去做那种把缺陷塞进工具看不到的角落的优化。

## 所以开发者该马上做的事（清单）

这次实验里我总结出的实操顺序。

- **把自动审计放进CI，但别把通过当成最终放行。** 用Lighthouse CI或`axe-core`接进构建，防止回归。`lang`、`alt`、对比度、标题、链接名称这些机器可判定的违规，在这一层全部拦下。
- **哪怕100分，也要手动跑一遍键盘。** 确认仅用Tab就能到达并触发每一个交互元素，焦点顺序和视觉顺序一致。`<div onclick>`这类假控件只有在这里才抓得到。
- **只有图标的按钮一定要给可访问名称**，`aria-label`或视觉上隐藏的文字都行。只放一个🛒的按钮，在屏幕阅读器里只会被读成"button"。
- **在设计定稿阶段就量对比度**，别拖到后面。事后再改就得重做整套品牌配色。AA是正文4.5:1，大号文字3:1。
- **标题层级按文档结构定，而不是按大小。** 想显得大就用CSS放大。别把`h3`直接放在`h1`下面。
- **不要禁止缩放。** `user-scalable=no`和过小的`maximum-scale`会把低视力用户挡在门外。

这个顺序的核心，是自动与手动的分工。自动化工具用很低的成本挡住可重复的机械违规；人则去看工具原理上看不到的那件事——它到底能不能用。只做其中一样，就只做了一半。而无论哪一样，在轻信别人的基准之前，第一步都是在自己的环境里亲手跑出before/after的数字——就像我当初[把自己的网站当作实测对象](/zh/blog/zh/multilingual-llm-token-tax-experiment)那样。

如果你想用真实分数加一遍键盘走查来检查现有站点，或者想在设计系统阶段就把对比度和语义结构定下来，我个人接受咨询与检查。通过我资料页上的联系方式找我即可。这不是推销，只是一个把这一层当日常工作来做的人，在旁边帮你看一眼。
