---
title: 'aria-modal="true" 什么都没拦住：模态框焦点逃逸实测与 inert'
description: 一个带 role="dialog" 和 aria-modal="true" 的「标准」模态框，按第三次 Tab 时焦点就逃到了遮罩层背后，而 axe 报告的焦点类违规为 0。我把同一份标记分别换成 aria-hidden 和 inert，逐次记录键盘焦点的实际落点。
pubDate: '2026-07-23'
heroImage: ../../../assets/blog/modal-focus-escape-inert-measure-2026/hero.png
tags:
  - accessibility
  - wcag
  - web-development
relatedPosts:
  - slug: axe-automated-a11y-coverage-gap-2026
    score: 0.82
    reason:
      ko: "이 글에서 axe가 포커스 이탈을 위반으로 잡지 못한 이유가 궁금하다면, 자동 검사 도구가 구조적으로 무엇을 못 보는지를 정리한 저 글이 답의 절반을 갖고 있다."
      ja: "本稿でaxeがフォーカス脱出を違反として報告しなかった理由は、自動チェックが構造的に何を見られないかを整理したあちらに半分書いてある。"
      en: "Half the answer to why axe didn't flag the focus escape in this post lives there — a breakdown of what automated checkers structurally cannot see."
      zh: "想知道本文中 axe 为什么没把焦点逃逸报成违规，那篇梳理自动化工具结构性盲区的文章有一半答案。"
  - slug: wcag22-target-size-audit-2026
    score: 0.71
    reason:
      ko: "초록불 점수 뒤에 숨은 실패라는 점에서 같은 계열의 실측이다. 저기서는 24px 타깃이, 여기서는 Tab 세 번이 자동 도구의 한계를 드러냈다."
      ja: "緑のスコアの裏に隠れた不合格という意味で同系統の実測。あちらは24pxのターゲットが、こちらはTab三回が自動ツールの限界を暴いた。"
      en: "Same family of measurement: failure hiding behind a green score. There it was a 24px target; here it took three presses of Tab."
      zh: "同一类实测：绿灯分数背后藏着的不合格。那篇是 24px 的点击目标，这篇是按三次 Tab。"
  - slug: accessible-name-agents-2026
    score: 0.63
    reason:
      ko: "포커스가 도착한 요소를 보조기술이 뭐라고 읽어주는가의 문제로 이어진다. accessible name이 비어 있으면 이 글의 '포커스 블랙홀'과 같은 증상이 난다."
      ja: "フォーカスが着いた要素を支援技術が何と読み上げるかという問題に続く。accessible nameが空だと本稿の「フォーカスのブラックホール」と同じ症状になる。"
      en: "Continues into what assistive tech announces once focus lands somewhere. An empty accessible name produces the same symptom as this post's focus black hole."
      zh: "延伸到辅助技术如何朗读焦点所在元素的问题。accessible name 为空时，症状和本文的「焦点黑洞」一模一样。"
  - slug: a11y-lighthouse-audit-fix-2026
    score: 0.58
    reason:
      ko: "Lighthouse 접근성 점수를 100까지 끌어올린 기록인데, 그 100점조차 이 글의 포커스 이탈은 잡지 못한다. 점수와 실사용의 간극을 양쪽에서 보여준다."
      ja: "Lighthouseのアクセシビリティスコアを100に上げた記録。だがその100点でも本稿のフォーカス脱出は検出できない。スコアと実利用の溝を両側から見せる二本。"
      en: "The log of pushing a Lighthouse accessibility score to 100 — a 100 that still wouldn't catch this post's focus escape. Two views of the same gap."
      zh: "把 Lighthouse 无障碍分数拉到 100 的记录，而那个 100 分同样抓不到本文的焦点逃逸。从两侧看同一道鸿沟。"
---

先看一段焦点日志。这是一个带 `role="dialog"` 和 `aria-modal="true"`、打开时把焦点移进第一个输入框的「标准」模态框，打开之后每按一次 Tab，我记录一次 `document.activeElement`：

```text
open   → email          (初始焦点移动，正常)
Tab 1  → subscribe-btn
Tab 2  → cancel-btn
Tab 3  → nav-home       ← 逃到了遮罩层背后
Tab 4  → nav-products
Tab 5  → nav-pricing
```

第三次 Tab，焦点离开了对话框，落在遮罩层背后的导航链接上。与此同时，axe-core 对这个页面报告的焦点类违规是 0 条。

今天做的事就是把这个症状钉死在数字上。同一份模态框标记，三种背景处理：什么都不做、加 `aria-hidden="true"`、加 `inert`。每种状态下按真实的 Tab 键记录焦点落点，并同步跑 axe-core 4.12.1。浏览器为 Chrome 150。

## 打底：「模态」这个词本身就是需求

先把地基打好。所谓模态对话框，是指它打开期间，页面其余部分要表现得像不存在一样。W3C 的 WAI-ARIA Authoring Practices Guide（APG）在模态对话框模式里写得很直接："Windows under a modal dialog are inert. That is, users cannot interact with content outside an active dialog window."。键盘行为也有明文约定：Tab 移动到对话框内的下一个可聚焦元素，在最后一个元素上按 Tab 则回到对话框内的第一个。焦点一旦落到遮罩层背后，这个组件按规范定义就已经不是模态框了。

很多代码栽在同一个误解上：`aria-modal="true"` 并不会创造这套行为，它只是向辅助技术<strong>声明</strong>这套行为已经实现。APG 甚至给这个属性加了前置条件：只有当应用代码确实阻断了与外部内容的一切交互、并且外部在视觉上被遮蔽时，才允许标记。声明和实现对不上时会发生什么？这正是我要量的。

实验页面很朴素：背景有 6 个可聚焦元素（4 个导航链接、1 个搜索框、1 个打开按钮），模态框内有 3 个（邮箱输入、Subscribe、Cancel）。遮罩层是半透明的，背景上的焦点圈能透出来。这个细节马上会变成证据。

测量方法上守了一条原则：不用 `dispatchEvent` 发合成的 Tab 键事件。合成键盘事件是 untrusted 的，驱动不了浏览器真实的焦点移动，量了等于没量。我改用 DevTools 协议发送真实的 Tab 按键，并在文档上挂一个 `focusin` 监听器，按顺序采集焦点经过的每个元素：

```js
// 测量埋点：按顺序记录焦点落过的元素
window.__focusLog = [];
document.addEventListener('focusin',
  e => window.__focusLog.push(e.target.id || e.target.tagName), true);
```

## naive 版：焦点巡游遮罩层背后

第一种状态的完整日志就是开头那段。对话框稳稳地摆在屏幕中央，真实焦点却在它背后的链接间逐个巡游。鼠标用户毫无感觉；对只用键盘的用户来说，看得见的界面和摸得着的界面已经分裂成两层。

![naive 版实测截图：模态框开着，橙色焦点圈却落在半透明遮罩层背后顶部的 Contact 导航链接上。](../../../assets/blog/modal-focus-escape-inert-measure-2026/focus-escape.png)

对这个状态跑 axe，违规只有一条 `region`（landmark 缺失，moderate 级），与焦点相关的违规为零。这不是 axe 偷懒。「按下 Tab 后焦点去哪」是动态属性，静态扫描 DOM 判定不了。自动化检查在结构上看不到哪些东西，我在[axe 自动检测覆盖率实测](/zh/blog/zh/axe-automated-a11y-coverage-gap-2026/)里梳理过，这次的焦点逃逸恰好落在那个盲区正中央。

说实话，这种只挂 `aria-modal="true"`、背景放着不管的模态框，我在实际的代码评审里见过不止一次。光看标记无可挑剔，评审也就放行了。只有按过三次 Tab 的人知道真相。

## aria-hidden 版：逃逸之外再加一层沉默

第二种状态：打开模态框时给背景容器加 `aria-hidden="true"`。这是从屏幕阅读器里隐藏背景的经典手法。

```text
variant: ariahidden  (背景加 aria-hidden="true")
open   → email
Tab 1  → subscribe-btn
Tab 2  → cancel-btn
Tab 3  → nav-home       ← 照样逃逸
Tab 4  → nav-products
```

`aria-hidden` 只把元素从无障碍树里移除，完全不碰 Tab 顺序，所以焦点照样往外漏。而且这次更糟：焦点落到的 nav-home 在无障碍树里根本不存在。屏幕阅读器用户按下 Tab，什么也听不到——焦点还在，名字和角色却没了，掉进一个黑洞。焦点落点被辅助技术读成什么，是[accessible name 实测](/zh/blog/zh/accessible-name-agents-2026/)讨论过的话题；这一次连可读的名字都被从树里删掉了。

axe 的反应是全文最有意思的部分。axe 有一条正对这个场景的规则 `aria-hidden-focus`。但这次实测里它返回的不是违规（violation），而是 <strong>incomplete</strong>：

```text
rule: aria-hidden-focus → incomplete (target: #app)
check: focusable-modal-open
message: "Check that focusable elements are not tabbable in the current state"
```

模态框开着的时候，背景那些可聚焦元素到底还在不在 Tab 顺序里，axe 静态判断不了，于是把检查移交给人。作为规则设计，这是诚实的做法。问题在于，多数 CI 流水线只拿 violations 数组当关卡，incomplete 直接丢掉。「零违规」的报告背后，一份写给人类的确认请求被悄悄扔进了垃圾桶。我刚才用 Tab 键做的，恰恰就是 axe 请求人类去做的那次手动检查。

## inert 版：背景落点归零

第三种状态：打开模态框时给背景容器挂上 `inert`。就一行代码。

```js
// 打开时
app.inert = true;
modal.querySelector('input').focus();

// 关闭时
app.inert = false;
openBtn.focus();
```

同样的流程按六次 Tab：

```text
variant: inert  (背景加 inert)
open   → email
Tab 1  → subscribe-btn
Tab 2  → cancel-btn
Tab 3  → (浏览器 UI：地址栏区域)
Tab 4  → email          ← 回到文档时落在模态框第一个元素
Tab 5  → subscribe-btn
Tab 6  → cancel-btn
```

背景落点：零次。焦点在模态框的三个元素之间循环，而我一行焦点陷阱 JavaScript 都没写。按 MDN 的说明，`inert` 把整棵子树移出 Tab 顺序、移出无障碍树，同时屏蔽点击和页内查找。`aria-hidden` 干的活，加上它从来没干过的焦点拦截，一个属性全包了。

测量过程中还捞到两个细节。其一，挂了 `inert` 的元素，computed style 里的 `pointer-events` 仍然是 `auto`——拦截发生在用户代理内部，不走样式。其二，`inert` 状态下 JavaScript 的 `el.click()` 照常触发。`inert` 拦的是用户交互，不是程序调用。这也意味着测试套件靠 `.click()` 跑通，不代表真实用户点得动。

Tab 3 时焦点短暂跑到地址栏，这是正常行为。APG 要求的循环针对的是文档内的 Tab 顺序，浏览器 UI 本来就在文档之外。回到文档时落在模态框第一个元素上，约定就算履行了。

有个提醒值得带走：MDN 明确警告，`inert` 生效时没有任何默认的视觉标识，不会像 `disabled` 那样变灰。在模态框场景里遮罩层顶了这个岗，所以不成问题；但如果把 `inert` 用到别处，比如多步表单里冻结未激活的步骤，视觉区分就得自己设计。另外，只想禁用单个表单控件的话，正确工具是 `disabled` 而不是 `inert`，语义和样式钩子都在它那边。

## 用哪个：梯子共三级

基于这次实测，我的取舍顺序是：

| 顺位 | 方案 | 背景阻断 | 依据 |
|---|---|---|---|
| 1 | `<dialog>` + `showModal()` | 浏览器自动处理 | MDN：使用 `showModal()` 时，将对话框外全部置为 inert「由浏览器提供这一行为」 |
| 2 | 自定义遮罩 + 背景 `inert` | 一行显式阻断 | 本次实测——背景落点零次 |
| 3 | JS 焦点陷阱循环 | 代码拦截 keydown | 只在必须兼容老浏览器时 |

原生 `<dialog>` 排第一的理由很简单：调用 `showModal()` 后，对话框之外的整个文档都会进入 inert 状态，top layer 层叠、`::backdrop`、Esc 关闭全由平台代劳。本文手工搭的这些东西，它全部免费赠送。自定义工具提示没法用 CSS 接到这个 Esc。[七个工具提示对照 SC 1.4.13 的实测](/zh/blog/zh/content-on-hover-focus-1413-tooltip-2026/)就是那条轴。如果设计系统绑死了自定义遮罩，那就是第二级：给背景容器加一行 `inert`。按 Baseline 口径，`inert` 从 2023 年 4 月起在所有主流浏览器可用（Chrome 2022 年、Firefox 和 Safari 2023 年）。至于拦截 keydown、手动把首尾元素接起来的经典焦点陷阱，如今只配排第三。它能跑，但你得自己计算并维护可聚焦元素清单，模态框里每加一个元素，就多一次出错的机会。

有个立场我直说：把 `aria-hidden="true"` 单独当背景阻断用的写法，应该退役了。实测摆在那里——焦点畅通无阻地穿过去，落点还偏偏是屏幕阅读器的静音区。既然 `inert` 连无障碍树的移除都一并做了，在支持 `inert` 的环境里再搭一个 `aria-hidden`，没有任何收益。

## 诚实的边界

这次测量说明不了的事，也要写清楚。第一，这是键盘 Tab 顺序的实测，不是屏幕阅读器行为的实测。VoiceOver 和 NVDA 的阅读光标独立于 Tab 顺序移动，`aria-modal` 和 `inert` 在朗读导航下的表现需要单独实测，本文没有做。第二，别把 axe 的 incomplete 当成缺陷。不拿静态规则去武断动态状态、转而升级给人类，这是规则设计里诚实的一面；缺口在运营侧——流水线里没有接收这份移交的人。第三，本文处理的只是 WCAG 2.4.3（Focus Order）范畴内的一种症状，修好它不等于页面整体合规。[WCAG 2.2 点击目标尺寸审计](/zh/blog/zh/wcag22-target-size-audit-2026/)得出过同样的结论：自动化绿灯和真正合规之间的距离，比看上去远得多。第四，本次测量只在 Chrome 150 一个浏览器上做。按 Baseline 的口径，`inert` 在各浏览器的行为应当一致，但 Firefox 和 Safari 下的 Tab 顺序这次没有实测。要覆盖跨浏览器回归，下一步是用 Playwright 之类的工具把同一套探针在三个引擎上各跑一遍。

## 上线前的模态框检查·五条

- 打开模态框，按（元素数 + 2）次 Tab。焦点只要有一次落到遮罩层背后，就算不合格。
- 页面上有 `aria-modal="true"` 的话，去代码里找支撑这个声明的实际阻断（`showModal()` 或 `inert`）。没有支撑，就别挂属性。
- 背景阻断如果只靠 `aria-hidden`，换成 `inert`。
- 看 axe/CI 报告时，除了 violations，把 incomplete 数组也打开。里面有 `focusable-modal-open` 的话，上面那个 Tab 测试就是它要的答案。
- 关闭时确认焦点回到打开模态框的那个触发元素（APG 要求）。回来的焦点被吸顶头部挡住而看不见的情况，我在[吸顶头部吞掉的键盘焦点](/zh/blog/zh/focus-not-obscured-sticky-header-scroll-padding-2026/)里单独量过。

键盘焦点是自动化工具永远替你按不完的那部分。三次 Tab 就能验证的事没人验证，绿灯报告倒是攒了一摞——这样的站点不少。线上站点的模态框、遮罩层键盘行为体检，以及把无障碍审计固化成 CI 关卡的落地工作，我个人接咨询与实现。有需要可以从[联系页面](/zh/contact/)找我。
