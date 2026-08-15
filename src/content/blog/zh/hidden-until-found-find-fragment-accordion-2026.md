---
title: '文本片段滚到了，CSS 手风琴没开'
description: '同一页 17 种藏法，同一句 TOKEN。关掉的 details 会被打开；max-height:0 滚到了，盒子仍是 0 高。hidden=until-found 认属性，同名 CSS 不认。'
pubDate: '2026-08-15'
heroImage: '../../../assets/blog/hidden-until-found-find-fragment-accordion-2026/hero.png'
tags:
  - SEO
  - 语义HTML
  - CSS
  - Web标准
  - 无障碍
faq:
  - question: '用 max-height:0 做手风琴，文本片段能打开它吗？'
    answer: '在我这份 Chromium 143 的 fixture 里打不开。点 TOKENCSSMAXH 之后 scrollY 到了 6083，data-open 仍是 0，盒子高度 0，elementFromPoint 点到 BODY。字节还在，画没出来。祖先打开算法只认 details 和 hidden=until-found。'
  - question: 'hidden=until-found 再写上 display:none，还能被搜到吗？'
    answer: '不能。规范写明，Hidden Until Found 要吃到布局包含才会被页内查找揭开。display 是 none、contents 或 inline 时，查找这条路不揭。我测到的是：文本片段点下去，beforematch 是 0，属性还在；hash 会剥掉 hidden，但作者样式还在，段落高度仍是 0。'
  - question: '关掉的 details 答案，爬虫会收录吗？'
    answer: '这篇答不了。关掉的答案不在 innerText 里，在 textContent 里，window.find 也是 true。这是浏览器 API，不是抓取日志。我没测任何 AI 爬虫，也没登录 Search Console。textContent 有字，推不出收录。'
  - question: 'Google 已经会往折叠答案上打文本片段链接了吗？'
    answer: 'Chrome 文档写过，搜索会生成滚到揭开片段的链接。那是厂商说法。我没看见搜索结果或 AI 回答吐出这种链接，也不拿它当已经发生的事。这篇只量：这种链接一旦点进来，这台 Chromium 会不会打开。'
relatedPosts:
  - slug: text-fragment-citation-deep-link-audit-2026
    score: 0.9
    reason:
      ko: 그 글은 문장이 페이지에 있을 때 인용 링크가 어디로 떨어지는지를 쟀다. 오늘은 그 문장이 접힌 상자 안에 있을 때 상자가 열리는지를 잰다.
      ja: あちらは文がページにあるとき引用リンクがどこへ落ちるかを測った。今日はその文が折りたたまれた箱の中にあるとき、箱が開くかを測る。
      en: That post measured where a citation lands when the sentence is already on the page. This one measures whether the box opens when the sentence sits inside a closed disclosure.
      zh: 那篇量的是句子已经在页面上时，引用链接落到哪儿。这篇量的是句子关在折叠盒子里时，盒子开不开。
  - slug: content-visibility-auto-render-cost-measure-2026
    score: 0.84
    reason:
      ko: "그 글은 content-visibility: auto가 레이아웃 비용을 얼마나 줄이는지 쟀다. 오늘은 같은 속성의 hidden 값이 속성 훅 없이 쓰이면 주소가 죽는 자리를 잰다."
      ja: "あちらは content-visibility: auto がレイアウト代をいくら削るかを測った。今日は同じプロパティの hidden を属性フックなしで書くと住所が死ぬ場所を測る。"
      en: "That post measured how much layout cost content-visibility: auto cuts. This one measures the dead address you get when the same property is used as hidden without the attribute hook."
      zh: "那篇量的是 content-visibility: auto 能砍掉多少布局账。这篇量的是同一个属性写成 hidden、又不挂 hidden 属性时，地址在哪儿死掉。"
  - slug: faqpage-deprecation-ai-citation-2026
    score: 0.78
    reason:
      ko: FAQPage 리치 결과가 끝난 다음, 보이는 Q&A를 무엇으로 감쌀지가 남았다. 오늘은 그 감싼 답이 닫혀 있을 때 텍스트 조각이 문을 여는지 본다.
      ja: FAQPage のリッチリザルトが終わったあと、見える Q&A を何で包むかが残った。今日はその包んだ答えが閉じているとき、テキスト断片が扉を開けるかを見る。
      en: After FAQPage rich results ended, the leftover question was what to wrap a visible Q&A in. This run asks whether a text fragment can open that wrapper when the answer is closed.
      zh: FAQPage 富结果收场之后，看得见的问答用什么包，还没完。这篇看的是答案关着的时候，文本片段会不会把门打开。
  - slug: modal-focus-escape-inert-measure-2026
    score: 0.72
    reason:
      ko: 그 글은 inert가 초점을 가두는 쪽을 쟀다. 오늘은 같은 속성이 페이지 내 찾기와 텍스트 조각을 거절하는 쪽을 잰다. hash는 통과한다.
      ja: あちらは inert が焦点を閉じ込める側を測った。今日は同じ属性がページ内検索とテキスト断片を拒む側を測る。hash は通る。
      en: That post measured inert as a focus trap. This one measures the same attribute refusing find-in-page and text fragments. A hash still lands.
      zh: 那篇量的是 inert 把焦点关在里面。这篇量的是同一个属性拒掉页内查找和文本片段。hash 还能落地。
  - slug: content-on-hover-focus-1413-tooltip-2026
    score: 0.66
    reason:
      ko: 둘 다 「숨김」이 한 스위치가 아님을 센다. 그쪽은 hover로 뜨는 레이어, 이쪽은 접힌 본문이다.
      ja: どちらも「隠し」が一つのスイッチではないことを数える。あちらはホバーで出る層、こちらは折りたたんだ本文だ。
      en: Both count the ways "hidden" is not one switch. That one is a hover layer. This one is collapsed body text.
      zh: 两篇都在数：藏起来不是一个开关。那边是悬停才冒出来的层，这边是折起来的正文。
---

页面滚到了 6083。手风琴还关着。

`#tf-css-maxh` 的链接是 `#:~:text=TOKENCSSMAXH`。点完，`data-open` 仍是 `"0"`。盒子高度 0，里面那句高度 18，y 在 399.7。我拿 `elementFromPoint(640, 409)` 去点那段字的中心，回来的是 BODY。字节在。画没出来。页面滚到的是被裁成 0 高的那一层。

同一张页上摆了 17 种藏法。每种盒子里同一句带 TOKEN 的话。Chromium 143.0.7499.4，无头，Playwright 1.57.0，Node 22.22，视口 1280×800，本地静态服务，目录在 `/tmp`。周六把这 17 格并排跑完。

换一格。关掉的 `<details>`，点 `#tf-details-closed`。`toggle` 响了，`open` 变成 true，scrollY 4907，那句话进了视口。祖先打开算法跑过。CSS 手风琴没进那份名单。

![文本片段滚到 6083，手风琴仍是 0 高，elementFromPoint 点到 BODY](../../../assets/blog/hidden-until-found-find-fragment-accordion-2026/hero.png)

## 0 高盒子里，有一句 18 像素

`window.find(token)` 在 17 格里 10 格为 true，7 格为 false。文本片段点下去，`inView` 也是 10 / 7。false 那 7 格几乎和 find 对得上：布尔 `hidden`、`hidden="hidden"`、`until-found` 再叠 `display:none`、作者 `display:none`、`visibility:hidden`、作者 `content-visibility:hidden`、`inert`。`until-found` 加 `display:inline` 是例外，find 是 true，片段也能滚。

hash 到 `id` 宽一点：12 格 `inView` true，5 格 false。那 5 格是空 `hidden`、`hidden="hidden"`、`until-found` 加 `display:none`、作者 `display:none`、作者 `content-visibility:hidden`。`visibility:hidden` 和 `inert` 拒片段，认 hash。门不是同一扇。

CDP `Accessibility.getFullAXTree` 里，名字带 TOKEN 的只有 6 格：可见、`until-found` 加 `display:inline`、打开的 details、`opacity:0`、sr-only clip、`max-height:0`。名字不在的包括普通 `until-found`、关掉的 details、`aria-hidden`、`inert`、`visibility:hidden`、作者 `content-visibility:hidden`、`display:none`、布尔 `hidden`。这不是读屏软件。只是这棵无障碍树的转储里有没有这个名字。

我原先把「藏」当成一个开关。字节至少拆成五份活：不渲染（`display:none` / 布尔 `hidden`）、跳过绘制但仍可搜（`hidden=until-found`，浏览器写成 `content-visibility:hidden`）、裁切但仍在树里（`max-height:0`）、从辅助技术里除名（`aria-hidden`）、页内查找当没看见（`inert`）。CSS 手风琴是第三种。find 是 true，无障碍名字也在，片段「到了」，`elementFromPoint` 仍是 BODY。到了不等于揭开。

8 月 8 日那篇[回到被引用那句话的链接](/zh/blog/zh/text-fragment-citation-deep-link-audit-2026/)量的是散文和 `<pre>` 谁接得住引用。这次换下一扇门：那句话坐在关掉的折叠里，链接还在不在。

## 浏览器自己的样式表只写了两行

WHATWG 给 `hidden` 的 `until-found` 状态就一句，原文在 [HTML Standard 的 hidden 属性](https://html.spec.whatwg.org/multipage/interaction.html#the-hidden-attribute)：

> Will not be rendered, but content inside will be accessible to find-in-page and fragment navigation.

渲染层怎么落地，同一节接着写：

> Web browsers will use 'content-visibility: hidden' instead of 'display: none' when the hidden attribute is in the Hidden Until Found state, as specified in the Rendering section.

[Rendering 的 Hidden elements](https://html.spec.whatwg.org/multipage/rendering.html#hidden-elements) 里，建议的默认样式就是这两条：

```css
[hidden]:not([hidden=until-found i]):not(embed) {
  display: none;
}

[hidden=until-found i]:not(embed) {
  content-visibility: hidden;
}
```

我在 fixture 上读计算样式。`hidden=""` 和 `hidden="hidden"` 是 `display:none`。`hidden="until-found"` 是 `content-visibility:hidden`，`display` 是 `block`。`HTMLElement.hidden` 的 IDL getter 在这个节点上返回 `"until-found"`，不是布尔 true。空值和 `"hidden"` 走同一家，不是手风琴那家。

Chrome 的 [hidden=until-found 文档](https://developer.chrome.com/docs/css-ui/hidden-until-found) 把作者为什么要换属性，写得很直：

> Collapsing content sections, sometimes described as an accordion, are a common UI pattern. However, content hidden in the collapsed sections becomes impossible to search using a find-in-page search. Also, it isn't possible to link to text fragments inside collapsed regions.

`#box-until` 挂着 `hidden="until-found"` 时，容器是 0×1230，子段落高度仍是 18。`innerText` 没有这句，`window.find` 是 true。点 `#tf-until`，`beforematch` 在 `#box-until` 上响了一次，`hidden` 没了，scrollY 4352，进了视口。Chromium 143 上 `'onbeforematch' in HTMLElement.prototype` 是 true。

给同一类盒子加上 8px margin、4px 灰边、16px padding。还关着的时候，`getBoundingClientRect` 是 1214×40，一个空镜框。片段点完，盒子从 40 长到 90。Chrome 警告过这件事：

> Child nodes of the hidden=until-found element won't be rendered, but the hidden=until-found element itself will still have a box. This means that CSS properties such as border and explicit size will still affect the rendering.

出处还是那篇 [Chrome 文档](https://developer.chrome.com/docs/css-ui/hidden-until-found)。40→90 是这份 fixture 上的框，不是通用常数。

规范还写了一句不该拿 `hidden` 干什么，同一节 [hidden 属性](https://html.spec.whatwg.org/multipage/interaction.html#the-hidden-attribute)：

> The hidden attribute must not be used to hide content that could legitimately be shown in another presentation. For example, it is incorrect to use hidden to hide panels in a tabbed dialog, because the tabbed interface is merely a kind of overflow presentation — one could equally well just show all the form controls in one big page with a scrollbar.

手风琴、选项卡这类「另一种排法」，布尔 `hidden` 本来就不是给它用的。

## 祖先打开名单里只有两扇门

页内查找开始搜的时候，规范要浏览器临时放开两样东西，且先不动标记。[Interaction with details and hidden=until-found](https://html.spec.whatwg.org/multipage/interaction.html#interaction-with-details-and-hidden=until-found) 原文：

> When find-in-page begins searching for matches, all details elements in the page which do not have their open attribute set should have the skipped contents of their second slot become accessible, without modifying the open attribute, in order to make find-in-page able to search through it. Similarly, all HTML elements with the hidden attribute in the Hidden Until Found state should have their skipped contents become accessible without modifying the hidden attribute in order to make find-in-page able to search through them.

祖先打开算法从目标往上走父节点，只收两样。一个是处于 Hidden Until Found 的 `hidden`。另一个是未打开的 `details` 里、`summary` 后面那截的祖先。命中之后，前者先触发 `beforematch`，再剥掉 `hidden`；后者给 `details` 补上 `open`。`max-height:0` 不在这份名单里。作者自己写的 `content-visibility:hidden` 也不在。

所以 `#box-cv-hidden` 才那么干脆。没有 `hidden` 属性，只有作者 CSS。`window.find` false，片段失败，hash 也失败，scrollY 0。算出来的属性和浏览器给 `until-found` 用的是同一个名字。挂钩是属性，不是 CSS 名字。我在[一行 CSS 把强制布局从 27.3ms 压到 1.8ms](/zh/blog/zh/content-visibility-auto-render-cost-measure-2026/) 里量过 `auto` 能省多少。`hidden` 这个值，单独写在样式表里，地址是死的。

关掉的 `<details>` 走另一扇门。点片段，`toggle` 响，`open` 翻成 true，句子进视口。算法认得它。

## 关掉的答案，其实已经在文档里

这个站的 `FAQ.astro` 已经挑了 details 这扇门：`<details class="faq-item">`，`open={index === 0}`。我没有往线上 FAQ 加 `hidden="until-found"`，也没为此重新发版。只读现有标记。

看的是 [文本片段那篇](/zh/blog/zh/text-fragment-citation-deep-link-audit-2026/) 的线上页，HTTP 200。四个 `details.faq-item`。第一条加载时已经开着。后面三条关着。跳转前，把这句韩文答案当查找目标：「코드 블록 자체를 인용 대상으로 만들기는 어렵습니다」。`document.body.innerText` 里没有。`textContent` 里有。`window.find` 返回 true。

直接把地址改成 `#:~:text=` 加这句。第二个 details 打开了（`hitOpen: true`），scrollY 8752，打开后的 `getBoundingClientRect.top` 是 373。关掉的答案本来就是页内查找的目标。片段要做的只是把门拉开。

`innerText` / `textContent` 不是 Googlebot。关掉的 `<details>` 在 `textContent` 里，推不出收录。FAQPage 富结果这边，我在[FAQ 富媒体结果已经结束](/zh/blog/zh/faqpage-deprecation-ai-citation-2026/)里写过：校验过也不等于还曝光。这篇没跑 Rich Results Test，也没跑 schema 校验器。结构化数据和片段都不保证富结果，更不保证一次 AI 引用。

Chrome 文档还有一句厂商说法，同一页 [hidden=until-found](https://developer.chrome.com/docs/css-ui/hidden-until-found)：

> In addition to allowing find-in-page search on hidden regions, this feature will allow this hidden content to be accessible to search engines. Google Search will even form links that scroll to the revealed fragment.

我没看见搜索结果或 AI 回答吐出这种链接。当厂商声明引用。不要读成「搜索已经链进我的 FAQ」。

垃圾信息政策把折叠展开列在「不算隐藏文本滥用」里，原文在 [Spam policies 的 Hidden text and link abuse](https://developers.google.com/search/docs/essentials/spam-policies#hidden-text-and-links)：

> Accordion or tabbed content that toggle between hiding and showing additional content

政策句子，不是排名承诺。只给读屏用、为了改善读屏体验的文字，同一节另有一行：

> Text that's only accessible to screen readers and is intended to improve the experience for those using screen readers

`aria-hidden` 不是这条的开关。WAI-ARIA 1.2 给它的定义是「这个元素还向无障碍 API 暴露吗」，原文在 [aria-hidden](https://www.w3.org/TR/wai-aria-1.2/#aria-hidden)：

> Indicates whether the element is exposed to an accessibility API.

可见段落挂 `aria-hidden="true"` 时，字画出来了，`innerText` true，`window.find` true，片段落到 scrollY 5542。CDP 名字列表里没有 TOKENARIAHIDDEN。查找还能指着一句，无障碍树不肯报名的话。作者要用它藏可见内容，规范写得很紧：

> Authors MAY, with caution, use aria-hidden to hide visibly rendered content from assistive technologies only if the act of hiding this content is intended to improve the experience for users of assistive technologies by removing redundant or extraneous content.

出处同上，[aria-hidden](https://www.w3.org/TR/wai-aria-1.2/#aria-hidden)。

## 自己加 display，挂钩就断了

规范把陷阱写死了，还是 [hidden 属性](https://html.spec.whatwg.org/multipage/interaction.html#the-hidden-attribute) 那一节：

> The element needs to be affected by layout containment in order to be revealed by find-in-page. This means that if the element in the Hidden Until Found state has a 'display' value of 'none', 'contents', or 'inline', then the element will not be revealed by find-in-page.

`#box-until-none` 是 `hidden="until-found" style="display:none"`。`window.find` false。点文本片段：属性还在，没有 `beforematch`，scrollY 0。点 hash 到 `#p-until-none`：`beforematch` 响了，`hidden` 剥掉了，剩下作者的 `display:none`，段落高度 0，scrollY 0。浏览器听了属性，然后输给样式表。

`#box-until-inline` 反过来。`hidden="until-found" style="display:inline"`。点之前，句子已经在 `innerText` 里，也在无障碍名字列表里。片段留下 `hidden="until-found"`（没有揭开步骤），照样滚到 scrollY 4729。hash 会剥掉 `hidden`。已经不按块来包了，「藏着」是假的。

`inert` 是另一扇拒查找的门。可见段落挂 `inert`：`innerText` true，画出来了，盒子 18×1230。`window.find` false。文本片段 scrollY 0。hash 到 `#p-inert` 仍落到 6085。[inert 子树](https://html.spec.whatwg.org/multipage/interaction.html#inert-subtrees) 写的是：

> The user agent should ignore the node for the purposes of find-in-page.

我在[模态框焦点逃逸](/zh/blog/zh/modal-focus-escape-inert-measure-2026/)里量过它挡焦点。今天量的是它挡查找。hash 不走这扇门。

并排看更清楚。数字都来自这一台 Chromium、这一张 fixture。

![十七种藏法在 find、片段、hash、无障碍名字上的分歧](../../../assets/blog/hidden-until-found-find-fragment-accordion-2026/hide-matrix.png)

| 藏法 | `window.find` | 文本片段 `inView` | hash `inView` |
| --- | --- | --- | --- |
| `max-height:0` | true | true（盒子仍 0 高） | true |
| 关掉的 `<details>` | true | true（会打开） | true |
| `hidden="until-found"` | true | true（剥掉 hidden） | true |
| `until-found` + `display:none` | false | false | false（属性剥了，仍 none） |
| 布尔 `hidden` / `display:none` | false | false | false |
| `visibility:hidden` | false | false | true |
| `inert` | false | false | true |
| 作者 `content-visibility:hidden` | false | false | false |
| `aria-hidden="true"` | true | true | true |

控制台里可以当场对计算样式。节点上挂着 `hidden="until-found"` 时：

```js
const el = document.querySelector('[hidden="until-found"]')
getComputedStyle(el).display
getComputedStyle(el).contentVisibility
el.getBoundingClientRect()
el.firstElementChild && el.firstElementChild.getBoundingClientRect()
```

线上 FAQ 用的是 `<details>`，先看四个开没开，再问关掉的那句在不在 `innerText` 里：

```js
[...document.querySelectorAll('details.faq-item')].map((d, i) => ({
  i,
  open: d.open,
  t: d.innerText.slice(0, 60),
}))
document.body.innerText.includes('코드 블록 자체를 인용 대상으로 만들기는 어렵습니다')
document.body.textContent.includes('코드 블록 자체를 인용 대상으로 만들기는 어렵습니다')
window.find('코드 블록 자체를 인용 대상으로 만들기는 어렵습니다')
```

`window.find` 不是页内查找界面。WHATWG 自己把标准化进度标在 [Find-in-page](https://html.spec.whatwg.org/multipage/interaction.html#find-in-page)：

> Issue #3539 tracks standardizing how find-in-page underlies the currently-unspecified window.find() API.

我没按过真正的查找框。用的是 `window.find()`，再点 `#:~:text=` 链接。真用查找框，结果可以不一样。片段点击在 fixture 上需要同文档激活。直接改 hash 导航，这台 Chromium 也会打开 `until-found` 和线上关掉的 FAQ。这是这个 UA、这个构建，不是爬虫。

## 折叠答案我还是交给 details

没测 Firefox，没测 WebKit。`hidden=until-found` 在那些引擎上怎样，这篇不声称。fixture 的 JSON 留在 `/tmp` 的实验室目录，没拷进仓库。线上只看了一篇文章、四个 FAQ、第一个默认打开，不是全站审计。

能写进评审单的就这几条。手风琴、选项卡这种用户可能搜、也可能被引用的正文，别用布尔 `hidden`，也别只用 `display:none`。地址要还在，用 `<details>`，或者 `hidden="until-found"` 加一个看得见的开关去剥掉它。`max-height:0` 在这台 Chromium 里能被 find 指到，但不进祖先打开算法。滚到了，看见的仍是 0 高的那一层。作者 `content-visibility:hidden` 看起来像浏览器给 `until-found` 用的那行，没有属性挂钩，hash 和片段一起死。

只拿 `until-found` 当唯一藏法之前，先探一下事件：

```js
if (!('onbeforematch' in HTMLElement.prototype)) {
  // 这台 UA 里，关掉的内容会继续关着
}
```

我这边 FAQ 继续用 details。这周没把 `hidden="until-found"` 推到线上。CSS 手风琴不当折叠答案用。哪一种该出货，这篇证不了。它只证：2026 年 8 月 15 日，这 17 格里，这台 Chromium 会找谁、给谁起名、跟谁 hash 滚、给谁打开门。

你那边如果已经用 `max-height` 藏答案，先在自己页上点一条文本片段，看滚到的是盒子还是 BODY。要一起对标记，[联系页](/zh/contact/)开着。

---

*来源：WHATWG [HTML Standard, The hidden attribute](https://html.spec.whatwg.org/multipage/interaction.html#the-hidden-attribute)、[Interaction with details and hidden=until-found](https://html.spec.whatwg.org/multipage/interaction.html#interaction-with-details-and-hidden=until-found)、[Inert subtrees](https://html.spec.whatwg.org/multipage/interaction.html#inert-subtrees)、[Find-in-page](https://html.spec.whatwg.org/multipage/interaction.html#find-in-page)、[Hidden elements](https://html.spec.whatwg.org/multipage/rendering.html#hidden-elements)；Chrome for Developers 的 [Making collapsed content accessible with hidden=until-found](https://developer.chrome.com/docs/css-ui/hidden-until-found)；Google Search Central 的 [Spam policies, Hidden text and link abuse](https://developers.google.com/search/docs/essentials/spam-policies#hidden-text-and-links)；W3C 的 [WAI-ARIA 1.2, aria-hidden](https://www.w3.org/TR/wai-aria-1.2/#aria-hidden)（均为官方）。正文英文块引用均从原页取回、去掉标记后对照，引用旁附原文链接。测量：2026-08-15，临时目录里一张 17 格 fixture + 线上文本片段文的 FAQ（HTTP 200），Chromium 143.0.7499.4 无头，Playwright 1.57.0，Node 22.22，视口 1280×800。未按查找框，未测 Gecko / WebKit，未登录 Search Console，未测 AI 爬虫，未把 until-found 推到线上 FAQ。数字只对这一引擎、这一天、这一份 fixture。*
