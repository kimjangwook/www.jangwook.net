---
title: 'unload被拦，beforeunload放行：bfcache实测六轮'
description: 「后退」能不能瞬间打开，不是口味问题，是可以量的。我做了六个页面，每个只埋一种阻断条件，逐一执行真实的后退导航，读取 pageshow.persisted 与 notRestoredReasons。unload 被拦，beforeunload 和 no-store 都放行了。
pubDate: '2026-07-21'
updatedDate: '2026-07-24'
heroImage: ../../../assets/blog/bfcache-notrestoredreasons-audit-2026/hero.png
tags:
  - performance
  - core-web-vitals
  - web-development
  - chrome
relatedPosts:
  - slug: content-visibility-auto-render-cost-measure-2026
    score: 0.79
    reason:
      ko: "저 글은 최초 렌더링에서 브라우저가 얼마를 쓰는지를 쟀다. 이 글은 그다음, 뒤로 가기로 돌아올 때 그 비용을 아예 내지 않는 경로를 다룬다."
      ja: "あちらは初回レンダリングでブラウザがいくら払うかを測った回。こちらは戻る操作でその支払いを丸ごと省く経路の話。"
      en: "That one measures what the browser spends on first render. This one is about the path where a back navigation skips that bill entirely."
      zh: "那篇量的是首次渲染浏览器要花多少。这篇讲的是后退时如何把这笔账整个免掉。"
  - slug: validate-structured-data-ci-jsonld-2026
    score: 0.71
    reason:
      ko: "실측한 것을 CI 게이트로 굳히는 절차가 궁금하다면 저 글이 원형이다. 여기서 만든 bfcache 프로브도 같은 방식으로 배포마다 돌릴 수 있다."
      ja: "実測をCIゲートに固める手順の原型があちら。本稿のbfcacheプローブも同じ形でデプロイごとに回せる。"
      en: "The template for turning a measurement into a CI gate lives there. The bfcache probe from this post drops into the same shape."
      zh: "把测量固化成 CI 关卡的做法在那篇。本文的 bfcache 探针可以套进同一个模子。"
  - slug: ai-crawlers-dont-render-javascript-csr-2026
    score: 0.64
    reason:
      ko: "이쪽은 사람이 뒤로 갈 때 무엇이 복원되는가, 저쪽은 크롤러가 처음 올 때 무엇이 보이는가. 렌더링 시점이 누구의 것인지가 갈리는 두 사례다."
      ja: "こちらは人が戻るとき何が復元されるか、あちらはクローラーが来たとき何が見えるか。レンダリングの時点が誰のものかで分かれる二例。"
      en: "This post asks what survives when a human presses back; that one asks what exists when a crawler arrives. Same rendering timeline, different audience."
      zh: "这篇问人按下后退时什么被复原，那篇问爬虫到达时什么才存在。同一条渲染时间线，两种读者。"
  - slug: wcag22-target-size-audit-2026
    score: 0.55
    reason:
      ko: "자동 도구의 초록불이 통과를 뜻하지 않는다는 점에서 짝이 되는 글이다. 저기서는 점수가, 여기서는 'masked'가 사람의 판단을 요구했다."
      ja: "自動ツールの緑が合格を意味しないという点で対になる。あちらはスコアが、こちらは「masked」が人の判断を要求した。"
      en: "A companion piece on green automated results that aren't a pass. There it was the score; here it's \"masked\"."
      zh: "同样是自动工具亮绿灯却不等于合格。那边是分数，这边是「masked」。"
---

挂了 `beforeunload` 的页面，后退时整份从内存里复原了。挂了 `unload` 的页面，没有。差别就是一个标识符。

把这两个当成同一类东西的代码，我见过不止一次，都归在「离开页面时收个尾」的抽屉里。所以我做了六个页面，每个只埋一种阻断候选，逐个跑真实的后退导航，看浏览器到底返回什么。下面是这六轮的记录。

## 一次不碰网络的后退

back/forward cache（bfcache）是浏览器在用户离开页面时不销毁它、而是整份冻进内存的能力。DOM、JavaScript 堆、滚动位置都留着。按下后退，浏览器把这份快照解冻。web.dev 的官方说法是："Instead of destroying a page when the user navigates away, we postpone destruction and pause JS execution."，效果则是 "Loading the previous page is essentially instant, because the entire page can be restored from memory, without having to go to the network at all."

分量在最后半句。HTTP 缓存命中良好的普通后退，文档还是要重新解析，脚本还是要重新执行，布局还是要重新计算。bfcache 复原把这些全跳过。没有重算，也就不会产生新的 LCP 和新的布局偏移。

为什么现在值得管它。从搜索结果点进来读一页、退回去、再点下一条，这个来回在手机上尤其常见。如果每一次来回都是完整加载，首屏再快，用户体感到的仍然是「后退很慢」。而且这类优化不是要你写新代码，是<strong>把已经上线的代码里让页面失去资格的那部分摘掉</strong>，投入产出比在性能工作里算高的。

先把预期压下去。bfcache 不是排名因素。修好它不保证搜索排名有任何变化，官方没这么讲，我也不这么讲。它解决的是真实用户在页面之间来回时的手感。

好在这件事不需要猜，浏览器用两个 API 直接给答案。

- `pageshow` 事件上的 `event.persisted`。为 `true` 就是从 bfcache 复原的。
- `PerformanceNavigationTiming.notRestoredReasons`，在<strong>没能</strong>复原时装着原因。按 Chrome 文档："The `notRestoredReasons` API has shipped from Chrome 123 and is being rolled out gradually."

## 六个页面，各只改一个变量

条件混在一起，结果就没法读。所以我在本地服务器上按路由拆开，每个页面<strong>只带一个阻断候选</strong>，其余标记和埋点脚本完全一致。

```js
// server.mjs — 每种条件一条路由
const page = (title, body, extraHead = '') => `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>${title}</title>${extraHead}</head>
<body><h1>${title}</h1>${body}
<script>
window.addEventListener('pageshow', (e) => {
  const nav = performance.getEntriesByType('navigation')[0];
  window.__bfcache = {
    persisted: e.persisted,
    nrr: nav && nav.notRestoredReasons
      ? JSON.parse(JSON.stringify(nav.notRestoredReasons))
      : null,
  };
});
</script></body></html>`;

const routes = {
  '/clean':        () => ({ headers: {}, html: page('clean', '<p>no blockers</p>') }),
  '/nostore':      () => ({ headers: { 'Cache-Control': 'no-store' }, html: page('nostore', '') }),
  '/unload':       () => ({ headers: {}, html: page('unload', '',
                      '<script>window.addEventListener("unload", function(){});</script>') }),
  '/beforeunload': () => ({ headers: {}, html: page('beforeunload', '',
                      '<script>window.addEventListener("beforeunload", function(e){});</script>') }),
  '/websocket':    () => ({ headers: {}, html: page('websocket', '',
                      '<script>window.__ws = new WebSocket("ws://127.0.0.1:8099");</script>') }),
  '/next':         () => ({ headers: {}, html: page('next', '<p>second page</p>') }),
};
```

埋点里那一趟 `JSON.parse(JSON.stringify(...))` 不是装饰。`notRestoredReasons` 返回的不是普通对象，直接打日志只会拿到 `[object Object]`。第一轮就栽在这儿。

六轮的步骤一样：打开目标页，跳到 `/next`，回退历史，在复原后的页面读 `window.__bfcache`。浏览器是 macOS 上的 Chrome 150，用 DevTools 协议驱动而不是手点。只有最后一轮换成了这个博客线上运行的文章页。

## 拦下两个，放行四个

| 页面条件 | `event.persisted` | `notRestoredReasons.reasons` |
| --- | --- | --- |
| 无阻断因素 | `true`（复原） | `null` |
| `Cache-Control: no-store` | `true`（复原） | `null` |
| `beforeunload` 监听器 | `true`（复原） | `null` |
| `unload` 监听器 | `false`（拦下） | `[{ reason: "masked" }]` |
| 处于连接中的 WebSocket | `false`（拦下） | `[{ reason: "websocket" }]` |
| 线上博客文章页 | `true`（复原） | `null` |

![各条件下 bfcache 复原情况与 notRestoredReasons 的实测结果](../../../assets/blog/bfcache-notrestoredreasons-audit-2026/probe-results.png)

`unload` 被拦在意料之中，官方指引在这一点上没客气："Never use the `unload` event. Ever!" 机制也写在后面："On desktop, Chrome and Firefox have chosen to make pages ineligible for bfcache if they add an `unload` listener."

值得注意的是我那个处理函数的内容：空的。函数体空着，页面照样失去资格。浏览器看的是<strong>监听器有没有注册</strong>，不是它做了什么。开始排查之前先知道这点，能省事，因为只盯着「看起来在收尾」的代码，会漏掉那些空壳。

`beforeunload` 则一路通过。如果团队把这两个放在同一个抽屉里，先把抽屉分开。确实需要收尾就用 `pagehide`，文档的说法是 "The `pagehide` event fires in all cases where the `unload` event fires, and it also fires when a page is put in the bfcache."

## 「masked」不算答案

这个 API 的实务上限也在这轮暴露了。WebSocket 那次返回了具体的 `"websocket"`，而 `unload` 那次只返回 `"masked"`，页面里一个 iframe 都没有。

Chrome 文档这样解释这个值："For all the cross-origin iframes, we report `null` for the `reasons` value for the frame, and the top-level frame will shows a reason of `"masked"`." 作为隐私保护可以理解。麻烦的是紧跟着的但书："`"masked"` may also be used for user agent-specific reasons so may not always indicate an issue in an iframe."

也就是说，拿到 `"masked"` 并不能断定原因出在 iframe。我这轮正好就是这种情况：单文档、没有框架、原因明摆着是 `unload` 监听器，字段还是不肯点名。

于是我的判断是这样。<strong>把 `notRestoredReasons` 当成告诉你「哪些 URL 有问题」的工具，而不是「问题是什么」。</strong>用现场采集的数据把阻断率高的模板圈出来，再把那个页面拉到本地，用 DevTools 的 Back/forward cache 面板复现，找真正的原因。把现场数据当诊断书用，一遇上 `"masked"` 就卡住。这不是工具的毛病，是得顺着工具的纹理用。

## no-store 不再是死刑

最意外的是 `Cache-Control: no-store` 的页面复原了，跟大家熟记多年的规则相反。web.dev 也把旧行为写得很明白：带上 `no-store` 时 "browsers have chosen not to store the page in bfcache."

不过同一篇里还有后续："There is work underway to change this behavior for Chrome in a privacy-preserving manner." 这项工作已经落地。Chrome 官方文档（Enabling bfcache for `Cache-Control: no-store`）记录这次变更在 2025 年 3 月到 4 月之间完成了对全体用户的推送。我这轮测量算是把它确认了一遍。

这里读错了有风险，所以把条件原样抄过来。按官方说明，`no-store` 页面即便进了 bfcache，<strong>只要 Cookie 或其他授权状态发生变化，Chrome 就会把它从缓存里驱逐</strong>，正是为了防止用户登出后按后退还能回到已登录的界面。此外，`no-store` 页面用到某些 API 时仍然不具备资格；这类页面发出的 fetch 或 XHR，如果响应也带 `no-store`，同样会触发驱逐，因为其中可能含敏感数据。

读法归纳一下。拿 `no-store` 当 bfcache 的关闭开关，现在依据已经很薄。但这不等于敏感页面就裸露在内存里。防护的责任从一行响应头，移到了认证状态变化这个更准的信号上。这毕竟依赖浏览器行为，结论我不说死。可如果你有代码建立在「我们发了 `no-store`，当然不会被缓存」这个前提上，这周就该重新量一次。

## 挡住的是开着的连接，不是代码

> **【追记 2026-07-22】** 据 web.dev 2026 年 6 月的公告（「New to the web platform in June 2026」），浏览器行为可能已经改变，带有活动 WebSocket 连接的页面现在也能进入 bfcache。下面这一节的测量是在那次公告之前的环境（Chrome 150）里测的，所以我打算用同一套探针重新测量后再更新结论。在那之前，本节关于 WebSocket 阻断的结论请按旧版本行为来读。
>
> **【追记 2026-07-24 · 已重测】** 我把同一套探针在 Chrome 150 的三个环境（自动化构建、正式版 headless、标志尝试）里重跑了一遍。打开的 WebSocket 三次都以 `reason: "websocket"` 被拦，只有对照组复原。也就是说本节结论在**我的自动化、无头测量环境里仍然成立**。不过官方发布是真的，拿到种子的真实用户环境很可能已经切到复原。发布与实测为何分叉（分阶段放量、新配置文件、无头）以及 CI 关卡会怎样误判，都写在了 [WebSocket bfcache 重测那篇](/zh/blog/zh/websocket-bfcache-eligibility-remeasure/)里。

WebSocket 这轮我先做砸了一次。最初没起服务端，只埋了 `new WebSocket('ws://127.0.0.1:8099')` 就跑。结果是 `persisted: true`，根本没被拦。

想想也理所当然。没人接，握手立刻失败，等我按下后退时那个页面一条打开的连接都没有。于是我起了真正的 WebSocket 服务，在离开前打印 `readyState` 确认是 `1`（OPEN），再测一遍。这才拿到 `persisted: false` 和 `reasons: [{ reason: "websocket" }]`。

这次空转反倒是全篇最实用的一段。浏览器看的是<strong>导航发生那一刻开着的连接</strong>，不是你的代码里有没有出现 WebSocket。同一个道理适用于其余连接类的阻断因素。官方列出的是：打开的 IndexedDB 连接、进行中的 fetch 或 XMLHttpRequest、以及处于连接状态的 WebSocket 与 WebRTC。建议是一致的：在 `pagehide` 或 `freeze` 时关掉它们。

这不是让你放弃实时功能，是让连接的生命周期跟着页面的可见状态走。

```js
let socket;

function connect() {
  socket = new WebSocket('wss://example.com/live');
}

connect();

// 离开时关掉，用 pagehide，不是 unload。
window.addEventListener('pagehide', () => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.close();
  }
});

// 复原后重新连接，并刷新冻住期间过期的界面。
window.addEventListener('pageshow', (event) => {
  if (event.persisted) {
    connect();
    refreshStaleUI();
  }
});
```

`event.persisted` 为 `true` 的分支一定要写。从 bfcache 回来的页面，停在用户离开的那一帧。购物车数量、剩余库存、通知角标、会话倒计时，凡是放一会儿就会变错的值，都要在这个时刻重新取。否则你交付的是一个「又快又旧」的界面。拿正确性换速度，是披着性能优化外衣的坏交易。

`window.opener` 属于同一类。官方写得很直接："A page with a non-null `window.opener` reference can't safely be put into bfcache"。给外链加 `rel="noopener"` 通常被当成安全习惯，它对 bfcache 资格同样有效。

## 到现场去收原因

本地测量复现性好，覆盖面却很窄。真实用户的浏览器、扩展、网络组合会制造出你在本地摆不出来的阻断。把下面这段埋上，就能开始收集哪些 URL 丢了复原。

```js
window.addEventListener('pageshow', (event) => {
  const nav = performance.getEntriesByType('navigation')[0];

  // 从 bfcache 复原，计一次命中
  if (event.persisted) {
    navigator.sendBeacon('/rum/bfcache', JSON.stringify({ hit: true, url: location.pathname }));
    return;
  }

  // 只挑没能复原的前进/后退导航
  if (nav && nav.type === 'back_forward' && nav.notRestoredReasons) {
    const nrr = JSON.parse(JSON.stringify(nav.notRestoredReasons));
    navigator.sendBeacon('/rum/bfcache', JSON.stringify({
      hit: false,
      url: nrr.url,
      reasons: (nrr.reasons || []).map((r) => r.reason),
      frames: (nrr.children || []).length,
    }));
  }
});
```

就算收回来的 `reasons` 大半是 `"masked"`，这份数据照样有用。它的价值在 URL 的分布，不在那几个字符串。

读数字时还有一个坑。线上那篇文章复原之后，我去读 navigation 条目，`type` 仍是 `"navigate"`，`duration` 是 1315.2ms，`transferSize` 是 22218 字节。这些是<strong>首次加载的数据，不是复原的性能</strong>。bfcache 复原不会新建 navigation 条目，想用 `nav.duration` 量复原速度，等于在看一个不存在的数。判定复原与否，交给 `event.persisted`。

量完、改完之后让它不再退回去的办法，永远是同一个：自动化，留成关卡。跟当初[把 JSON-LD 校验固化成 CI 关卡](/zh/blog/zh/validate-structured-data-ci-jsonld-2026/)的结构没有区别。这六轮说到底就是「打开、跳转、后退、读 `persisted`」的重复，完全可以搬进无头浏览器脚本，对主要模板每次部署都跑一遍。如果说[用 `content-visibility` 实测渲染成本那次](/zh/blog/zh/content-visibility-auto-render-cost-measure-2026/)管的是首屏，这次管的是首屏之后的每一次跳转。

## 收尾：一行代码换掉的后退体验

六轮拦下两轮，原因分别是一个注册过的监听器和一条开着的 socket。另外四轮通过，其中一轮还是长期被认定会被拦的 `Cache-Control: no-store`。

按我实际动手的顺序排：

- <strong>把 `unload` 监听器全查一遍并删掉。</strong>函数体空着也会被拦。第三方脚本也算，不只是自家代码。grep 时把 `addEventListener('unload'` 和 `onunload` 一起搜。
- <strong>收尾逻辑迁到 `pagehide`。</strong>`unload` 会触发的场合它都触发，进 bfcache 时也触发。`beforeunload` 不是阻断因素，离开确认弹窗可以留着。
- <strong>在 `pagehide` 里关掉 WebSocket、WebRTC、IndexedDB 连接。</strong>判据是跳转那一刻连接开没开，不是代码里有没有这些 API。
- <strong>在 `pageshow` 里加 `event.persisted === true` 分支。</strong>重连，再把过期的显示值取一遍。没有这个分支，留给用户的就是又快又旧的界面。
- <strong>外链加上 `rel="noopener"`。</strong>`window.opener` 非空的页面进不了缓存。
- <strong>重新量那些建立在 `no-store` 假设上的代码。</strong>Chrome 在 2025 年改了这个行为，附带条件是 Cookie 与认证状态变化时会被驱逐。
- <strong>现场埋点要做，但看 URL。</strong>原因可能被遮蔽，这份数据是用来找阻断集中的模板的。

老实交代边界：这六轮出自一台 macOS 机器、一个 Chrome 150 构建。Safari 和 Firefox 划资格线的方式不同，`notRestoredReasons` 本身也是 Chromium 系的 API。别把这里的字符串当成标准层面的保证。好在复现步骤都留下了，对着你自己要支持的浏览器再跑一遍这六轮，就能拿到属于你环境的答案。

---

线上站点的「后退」到底有没有从缓存复原、哪些模板因为什么原因丢了资格，这类问题靠量而不靠讨论就能有答案。这种实测，以及把结果固化成 CI 关卡的落地工作，我个人接咨询与实现。有需要可以从[联系页面](/zh/contact/)找我。
