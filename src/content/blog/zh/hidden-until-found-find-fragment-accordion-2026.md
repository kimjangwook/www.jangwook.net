---
title: '折叠面板里的文字，浏览器到底能不能搜到'
description: '把十七种隐藏方式放进 Chromium 143 实测：页面内搜索和文本片段只在十种情况下到达。max-height:0 的手写折叠会滚到坐标却不展开。hidden=until-found 靠浏览器默认样式打开。到达与展开不是同一件事。本文对照了 window.find、文本片段与无障碍树的一次结果。'
pubDate: '2026-08-15'
heroImage: '../../../assets/blog/hidden-until-found-find-fragment-accordion-2026/hero.png'
tags:
  - Web开发
  - HTML
  - CSS
  - 浏览器原理
  - 可访问性
faq:
  - question: '用 CSS 的 max-height 做折叠面板，为什么文本片段跳过去是白屏？'
    answer: '因为浏览器在执行文本片段跳转时，只负责把页面滚动到目标文本对应的布局矩形。如果外层容器加了 overflow: hidden 和 max-height: 0，虽然节点在文档树中占着坐标，但绘制被裁剪掉了。浏览器并不会自动修改你的 CSS 类名或 data 属性，到达目标与展开面板是两套独立的机制。'
  - question: 'hidden="until-found" 和普通 hidden 属性有什么区别？'
    answer: '普通 hidden 会被浏览器默认赋予 display: none，节点彻底不参与布局与页面搜索。hidden="until-found" 则会被赋予 content-visibility: hidden，浏览器跳过它的绘制但保留文字检索能力。一旦用户通过页面搜索或文本片段链接命中其中的文字，浏览器会自动派发 beforematch 事件并移除该属性，完成展开。'
  - question: '原生 details 元素为什么不需要额外写展开逻辑？'
    answer: 'HTML 规范对 details 元素做了特殊定义。在页面搜索或文本片段寻址开始时，浏览器会自动检索未展开 details 内部的内容。一旦发生匹配，浏览器会自动把 open 属性设为 true 并触发 toggle 事件，不需要任何手写 JavaScript 介入。'
  - question: '能在所有浏览器上直接用 hidden="until-found" 吗？'
    answer: '不能盲目全量上线。目前它是 Chromium 系浏览器的特性，需要先通过 onbeforematch in HTMLElement.prototype 确认当前浏览器是否支持。在不支持的浏览器上，若没有提供降级逻辑，被隐藏的内容将保持关闭状态，无法被搜索触发展开。'
relatedPosts:
  - slug: text-fragment-citation-deep-link-audit-2026
    score: 0.90
    reason:
      ko: '텍스트 프래그먼트가 브라우저와 검색엔진에서 어떻게 주소로 동작하는지 다룬 글이다. 이번 글은 그 주소가 도착했을 때 닫힌 DOM을 열어주는 메커니즘을 다룬다.'
      ja: 'テキストフラグメントがブラウザと検索エンジンでどうアドレスとして機能するかを扱った記事だ。今回はそのアドレスが到達した時に閉じたDOMを開く仕組みを検証した。'
      en: 'That post covered how text fragments act as addresses in browsers and search engines. This post tests the mechanism that opens closed DOM nodes once the address arrives.'
      zh: '那篇讲文本片段如何在浏览器和搜索引擎中充当定位地址。这篇测的是当地址到达后，浏览器如何把关着的节点翻开。'
  - slug: content-visibility-auto-render-cost-measure-2026
    score: 0.83
    reason:
      ko: 'content-visibility: auto가 렌더링 비용을 줄이는 방식을 실측한 글이다. hidden=until-found가 내부적으로 사용하는 content-visibility: hidden의 렌더링 생략 특성과 바로 연결된다.'
      ja: 'content-visibility: autoによる描画コスト削減を実測した記事だ。hidden=until-foundが内部で使うcontent-visibility: hiddenの描画スキップ特性と直結している。'
      en: 'That post measured how content-visibility: auto cuts render cost. It connects directly to the paint-skipping behavior of content-visibility: hidden used under hidden=until-found.'
      zh: '那篇实测了 content-visibility: auto 节省渲染成本的机制。hidden=until-found 底层调用的 content-visibility: hidden 正是这套跳过绘制特性的同源实现。'
  - slug: modal-focus-escape-inert-measure-2026
    score: 0.74
    reason:
      ko: 'inert가 포커스와 상호작용을 가두는 방식을 실측한 글이다. 이번 매트릭스에서 inert는 페이지 검색과 텍스트 프래그먼트만 거절하고 앵커 이동은 받아들였다.'
      ja: 'inertがフォーカスと操作を閉じ込める挙動を実測した記事だ。今回の行列でinertはページ内検索とテキストフラグメントだけを拒み、アンカー遷移は受け入れた。'
      en: 'That post measured how inert locks away focus and interaction. In this matrix inert refused find-in-page and text fragments while still accepting an anchor jump.'
      zh: '那篇实测了 inert 如何锁住焦点与交互。在本文的矩阵里，inert 只拒绝页面搜索和文本片段，却接受锚点跳转。'
  - slug: faqpage-deprecation-ai-citation-2026
    score: 0.72
    reason:
      ko: 'FAQPage 마크업의 검색 노출 변화를 다룬 글이다. 구조화 데이터 선언과 실제 DOM에 숨겨진 FAQ 본문의 검색 가능성을 함께 점검할 때 필요하다.'
      ja: 'FAQPage構造化データの検索表示の変遷を扱った記事だ。メタデータ宣言と実際のDOM内に隠されたFAQ本文の検索性を併せて確認するのに役立つ。'
      en: 'That post covered the shifts in FAQPage structured data visibility. It pairs with this post to audit both metadata declarations and real DOM searchability inside collapsed FAQs.'
      zh: '那篇梳理了 FAQPage 结构化数据的展示变迁。把元数据声明与折叠区域里真实 DOM 的可检索性放在一起看，能看清问答模块的整体可达性。'
  - slug: content-on-hover-focus-1413-tooltip-2026
    score: 0.63
    reason:
      ko: '호버나 포커스로만 나타나는 콘텐츠의 접근성 기준을 다룬 글이다. 열림 상태를 누가 제어하느냐는 같은 문제를 공유한다.'
      ja: 'ホバーやフォーカスでのみ現れるコンテンツのアクセシビリティ基準を扱った記事だ。開いた状態を誰が制御するかという同じ問題を共有する。'
      en: 'That post covered the accessibility criteria for content that appears only on hover or focus. Both posts turn on who controls the open state.'
      zh: '那篇讲了只在悬停或聚焦时才出现的内容要满足的无障碍标准。两篇都落在谁来控制展开状态这个问题上。'
---

我点了页面上的 `#tf-css-maxh` 链接。它的跳转目标是文本片段 `#:~:text=TOKENCSSMAXH`。页面滚动条跳到了 6083 像素，但折叠面板依然关着，`data-open` 属性停在 0。

外层容器高度是 0 像素，里面的段落高度是 18 像素，纵坐标停在 399.7。取段落正中心（640，409）所在的元素，返回的不是那句文字，而是最外层的 BODY。字节确实存在于页面里，绘制却没有发生。页面滚到了一个被裁剪掉的空白位置。

![折叠面板中的文本片段定位与展开状态差异](../../../assets/blog/hidden-until-found-find-fragment-accordion-2026/hero.png)

## 滚到位置不等于让人看见

前端手写折叠面板，最顺手的做法是外层容器加 `max-height: 0` 和 `overflow: hidden`，靠修改类名做高度过渡。Chrome 开发者文档这样描述折叠内容：

> Collapsing content sections, sometimes described as an accordion, are a common UI pattern. However, content hidden in the collapsed sections becomes impossible to search using a find-in-page search. Also, it isn't possible to link to text fragments inside collapsed regions.
>
> 来源: [Chrome for Developers - hidden=until-found](https://developer.chrome.com/docs/css-ui/hidden-until-found)

我原先以为 `max-height: 0` 正是文档里说的“搜不到也跳不到”的典型用例，实际跑起来却相反。

调用 `window.find`、拉取无障碍名称列表、点击文本片段链接后的段落视口判定，都返回了 `true`。浏览器算出了文字在文档里的坐标，并把视口推到了对应位置。

真正缺失的是展开动作。浏览器到达了坐标，却没有谁来把折叠容器撑开。到达和展开是两套独立的机制。手写的 CSS 折叠不会接收文本片段到达的通知，用户停在一片空白前，只能看到一条拉长的滚动条。[回到被引那句话的文本片段](/zh/blog/zh/text-fragment-citation-deep-link-audit-2026/)测的是散文能否到达。这篇看到达之后，关上的界面会不会打开。

## 17 种隐藏写法，只有 10 种能把人带到文字面前

我搭建了一份测试页面，把常见隐藏方式排成 17 个独立单元格。每个单元格放入结构相同、带唯一标记词的段落，防止查找指令跳到别处。每次测试后清空当前选区。

环境配置：Node 22.22，Playwright 1.57.0，Chromium 143.0.7499.4 无头模式，视口 1280×800，运行在本地静态服务下。

每个单元格回答四个问题：
1. 页面加载后执行 `window.find(token)` 能否命中。
2. 点击 `<a href="#:~:text=TOKEN">` 文本片段链接，等待 200 毫秒后，段落是否落在视口内。
3. 点击 `<a href="#p-…">` 锚点链接，等待 200 毫秒后，段落是否落在视口内。
4. CDP 的 `Accessibility.getFullAXTree` 树结构中，节点的名称列表是否包含该标记词。

![17 种隐藏标记在页面搜索、文本片段跳转与可访问性树中的表现矩阵](../../../assets/blog/hidden-until-found-find-fragment-accordion-2026/hide-matrix.png)

| 隐藏方式 | `window.find()` | 文本片段跳转 | `#id` 锚点跳转 | 辅助功能树名称 |
| --- | --- | --- | --- | --- |
| 正常可见 (visible) | 命中 | 到达 | 到达 | 存在 |
| `hidden=""` | 未命中 | 未到达 | 未到达 | 缺失 |
| `hidden="hidden"` | 未命中 | 未到达 | 未到达 | — |
| `hidden="until-found"` | 命中 | 到达 | 到达 | 缺失 |
| until-found + 边框内边距 | 命中 | 到达 | 到达 | — |
| until-found + `display:none` | 未命中 | 未到达 | 未到达 | — |
| until-found + `display:inline` | 命中 | 到达 | 到达 | 存在 |
| `<details>` 闭合 | 命中 | 到达 | 到达 | 缺失 |
| `<details>` 展开 | 命中 | 到达 | 到达 | 存在 |
| 自定义 `display:none` | 未命中 | 未到达 | 未到达 | 缺失 |
| `visibility:hidden` | 未命中 | 未到达 | 到达 | 缺失 |
| 自定义 `content-visibility:hidden` | 未命中 | 未到达 | 未到达 | 缺失 |
| `aria-hidden="true"` | 命中 | 到达 | 到达 | 缺失 |
| `inert` | 未命中 | 未到达 | 到达 | 缺失 |
| `opacity:0` | 命中 | 到达 | 到达 | 存在 |
| 屏幕阅读器专用裁剪 (sr-only) | 命中 | 到达 | 到达 | 存在 |
| `max-height:0` (CSS 折叠) | 命中 | 到达 | 到达 | 存在 |

17 种方式中，`window.find()` 在 10 种情况下返回 `true`。未命中的 7 种包括布尔值 `hidden`、`hidden="hidden"`、until-found 加 `display:none`、自定义 `display:none`、`visibility:hidden`、自定义 `content-visibility:hidden` 和 `inert`。

文本片段跳转同样能到达这 10 种。`#id` 锚点跳转到达了 12 种，`visibility:hidden` 和 `inert` 拒绝文本片段，却接受锚点定位。在辅助功能树的名称数据中，确认存在标记词的有 6 种，确认缺失的有 8 种，另有 3 种未采集。

## 隐藏不是一个开关，而是五种完全不同的机制

实测中，“隐藏”分成了五种行为：

1. 彻底不参与渲染与检索：`display: none` 与布尔值 `hidden`。
2. 跳过绘制但保留检索能力：`hidden="until-found"` 与浏览器应用的 `content-visibility: hidden`。[content-visibility 如何降低渲染开销](/zh/blog/zh/content-visibility-auto-render-cost-measure-2026/)里测过的 hidden 状态，正是 until-found 的默认样式。
3. 视觉上裁剪但完整保留在文档树中：`max-height: 0`、`opacity: 0` 以及屏幕阅读器专用裁剪类。
4. 从辅助技术接口中剥离：`aria-hidden="true"`。
5. 从页面查找算法中屏蔽：`inert`。

WAI-ARIA 规范这样定义 `aria-hidden`：

> Indicates whether the element is exposed to an accessibility API.
>
> Authors MAY, with caution, use aria-hidden to hide visibly rendered content from assistive technologies only if the act of hiding this content is intended to improve the experience for users of assistive technologies by removing redundant or extraneous content.
>
> 来源: [WAI-ARIA 1.2 - aria-hidden](https://www.w3.org/TR/wai-aria-1.2/#aria-hidden)

在加了 `aria-hidden="true"` 的可见段落上，点击文本片段后滚动条跳到了 5542 像素，`innerText` 和 `window.find` 都成功，但 CDP 导出的名称树里没有这个标记词。

`inert` 则是另一个极端。WHATWG 规范对 `inert` 子树规定：

> The user agent should ignore the node for the purposes of find-in-page.
>
> 来源: [WHATWG HTML Standard - inert subtrees](https://html.spec.whatwg.org/multipage/interaction.html#inert-subtrees)

实测中加了 `inert` 的段落占据 18×1230 像素的正常渲染区域，`innerText` 能读到文字，`window.find` 却返回 `false`。文本片段点击后滚动条停在 0，点击 `#id` 锚点时跳到了 6085 像素。[inert 如何阻断焦点与移动](/zh/blog/zh/modal-focus-escape-inert-measure-2026/)是同一属性在模态框里的记录。这里它只拒绝搜索和文本片段，锚点跳转仍通过。

## 浏览器的默认样式表如何接管 until-found

`hidden="until-found"` 是 HTML 标准为“收起但可搜”设计的属性状态。它的默认样式规则是：

```css
[hidden]:not([hidden=until-found i]):not(embed) {
  display: none;
}

[hidden=until-found i]:not(embed) {
  content-visibility: hidden;
}
```

在带有 `hidden="until-found"` 的 `#box-until` 节点上，计算样式中的 `display` 为 `block`，`content-visibility` 为 `hidden`。未设置内边距时，容器矩形大小为 0×1230 像素，子段落仍是 18 像素高。此时容器的 `innerText` 为空，`window.find` 却返回 `true`。

点击文本片段链接 `#tf-until`，滚动条跳到 4352 像素。容器触发一次 `beforematch` 事件，浏览器自动移除 `hidden` 属性，段落的视口判定变为 `true`。

读取属性时还有个细节。在直到匹配节点上访问 `element.hidden`，返回的值不是布尔值 `true`，而是字符串 `"until-found"`。

这个属性有两处边界：

第一处是盒模型残留。测试里的 `#box-until-box` 设置了 8 像素外边距、4 像素灰色边框和 16 像素内边距。在收起状态下，由于子元素跳过渲染但容器本身依然生成盒子，屏幕上出现了一个 1214×40 像素的空框。点击文本片段触发展开后，高度变为了 1214×90 像素。

第二处是样式层叠冲突。给 until-found 节点强行写上 `style="display:none"`（`#box-until-none`），`window.find` 立即返回 `false`，文本片段点击无法唤起 `beforematch`，滚动条停在 0。点击 `#id` 锚点虽触发 `beforematch` 并剥离 `hidden` 属性，作者样式的 `display: none` 仍然生效，段落高度最终停在 0。

而在 `#box-until-inline`（`style="display:inline"`）上，文本片段点击跳到了 4729 像素，但 `hidden="until-found"` 没有被移除，因为行内元素不具备布局包含条件。

在终端里可以用这一段脚本直接检查节点的真实渲染状态：

```js
const el = document.querySelector('[hidden="until-found"]');
getComputedStyle(el).display;
getComputedStyle(el).contentVisibility;
el.getBoundingClientRect();
el.firstElementChild && el.firstElementChild.getBoundingClientRect();
```

## 我在自己的线上博客测了原生 details

原生 `<details>` 元素在 HTML 规范里有特殊的搜索处理。页面搜索或文本片段寻址开始时，浏览器会检索未展开 `<details>` 内部的内容。

我在自己的线上博客验证了这个行为。打开线上页面 `https://jangwook.net/ko/blog/ko/text-fragment-citation-deep-link-audit-2026/`（状态码 200）。

页面底部有 4 个 `details.faq-item` 元素。站点组件 `FAQ.astro` 把索引 0 的项设为 `open`，索引 1 到 3 处于收起状态。

定位前检查第二项收起里的韩文字符串「코드 블록 자체를 인용 대상으로 만들기는 어렵습니다」：
- `document.body.innerText.includes(...)` 返回 `false`。
- `document.body.textContent.includes(...)` 返回 `true`。
- `window.find(...)` 返回 `true`。

通过控制台将页面重定向到带该句文本片段的 URL：

```js
location.href =
  location.pathname +
  '#:~:text=' +
  encodeURIComponent('코드 블록 자체를 인용 대상으로 만들기는 어렵습니다');
```

页面滚动条跳到了 8752 像素。第二个 `details` 元素自动翻转 `open` 属性并派发 `toggle` 事件，展开后的元素顶部距离视口上边缘停在 373 像素。原生实现不需要额外监听事件手动展开容器。

## 这次测试的限制

这次测量只在 Chromium 143.0.7499.4 单一内核上完成，没有在 Firefox 的 Gecko 或 Safari 的 WebKit 上运行。规范尚未全面落地的引擎上不能假定 `hidden="until-found"` 行为一致。

测试使用的是 `window.find()` 接口与文本片段链接点击，没有模拟用户按快捷键呼出真实浏览器查找界面的交互。WHATWG 标准 Issue #3539 目前仍在推进 `window.find()` 与页面搜索底层逻辑的标准化。

另外，Chrome 文档中提到的“Google Search 甚至会生成滚动到展开片段的链接”属于厂商声明，这次实验没有在搜索结果或 AI 摘要中抓到对应外链。Google 搜索防滥用政策将折叠与标签内容排除在恶意隐藏文本之外：

> Accordion or tabbed content that toggle between hiding and showing additional content
>
> 来源: [Google Search Central - Spam Policies](https://developers.google.com/search/docs/essentials/spam-policies#hidden-text-and-links)

这项政策保证的是合规资格，不代表折叠区域的内容能获得更高的收录权重或富媒体摘要。

在正式上线 `hidden="until-found"` 前，先在脚本中加入这行环境判断：

```js
if (!('onbeforematch' in HTMLElement.prototype)) {
  // 当前浏览器不支持 until-found，需降级为常规展开或备用逻辑
}
```

测试生成的 JSON 数据留在实验目录的临时路径中，没有提交进代码库。手写高度过渡的折叠层必须补上文本定位的展开逻辑。
