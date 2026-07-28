---
title: '开了 prerender，LCP 却记成 6.2 秒：不减 activationStart 的 RUM 在骗你'
description: 用 Speculation Rules 预渲染后，LCP 原始值会把整段等待都算进去。我在 Chrome 150 上实测了 6244ms 与 103.5ms 的落差，并梳理出所有需要校正的位置。
pubDate: '2026-07-28'
heroImage: ../../../assets/blog/prerender-activationstart-cwv-measurement-2026/hero.png
tags:
  - performance
  - core-web-vitals
  - web-development
  - chrome
relatedPosts:
  - slug: lcp-image-preload-scanner-fetchpriority-2026
    score: 0.78
    reason:
      ko: "저 글은 LCP를 실제로 앞당기는 법이고, 이 글은 그렇게 앞당긴 LCP가 대시보드에 잘못 찍히는 경로다. 개선과 계측은 따로 검증해야 한다."
      ja: "あちらはLCPを実際に早める話、こちらは早めたLCPがダッシュボードに誤って載る話。改善と計測は別々に検証しないといけない。"
      en: "That post makes LCP genuinely faster; this one covers how that faster LCP can still land wrong in your dashboard. Improvement and measurement need separate proof."
      zh: "那篇讲怎样真正把 LCP 提前，这篇讲提前之后它为何仍会在看板上记错。优化和计量得分开验证。"
  - slug: websocket-bfcache-eligibility-remeasure
    score: 0.72
    reason:
      ko: "bfcache 복원도 prerender 활성화도, 브라우저가 페이지 수명주기를 건드리면 계측 기준점이 흔들린다. 저기선 복원 여부가, 여기선 시작 시각이 문제였다."
      ja: "bfcache復元もprerender活性化も、ブラウザがページのライフサイクルに手を入れると計測の基準点がぶれる。あちらは復元の可否、こちらは開始時刻が争点。"
      en: "Both bfcache restores and prerender activations move the ground under your metrics when the browser rewrites the page lifecycle. There the question was whether it restored; here it's when the clock started."
      zh: "无论 bfcache 恢复还是 prerender 激活，浏览器一改动页面生命周期，计量基准就会漂移。那边问的是能否恢复，这边问的是计时从何时开始。"
  - slug: axe-core-ci-a11y-jsdom-vs-browser-2026
    score: 0.68
    reason:
      ko: "테스트 환경이 조용히 거짓 음성을 내는 같은 함정이다. 저기선 jsdom이 위반을 못 봤고, 여기선 Playwright가 prerender 자체를 일으키지 못했다."
      ja: "テスト環境が静かに偽陰性を返すという同じ罠。あちらはjsdomが違反を見落とし、こちらはPlaywrightがprerenderそのものを起こせなかった。"
      en: "The same trap in a different guise: a test environment quietly returning a false negative. There jsdom missed real violations; here Playwright never triggered the prerender at all."
      zh: "同一个陷阱的两副面孔：测试环境悄悄给出假阴性。那边是 jsdom 漏掉真实违规，这边是 Playwright 根本没能触发预渲染。"
  - slug: content-visibility-auto-render-cost-measure-2026
    score: 0.6
    reason:
      ko: "렌더링 비용을 뒤로 미루는 기법과 아예 앞으로 당기는 기법. 방향은 반대인데 둘 다 '언제를 0으로 볼 것인가'라는 같은 질문에 걸린다."
      ja: "レンダリングコストを後ろにずらす手法と、まるごと前倒しする手法。向きは逆だが、どちらも「どこを0とみなすか」という同じ問いにぶつかる。"
      en: "One technique defers rendering cost, the other pulls it forward. Opposite directions, same underlying question: which moment counts as zero?"
      zh: "一个把渲染成本往后推，一个把它整体提前。方向相反，却撞上同一个问题：把哪一刻当作零点。"
---

同一次导航，两个数字。用户从点击到看见页面，等了 103.5 毫秒。而 LCP 条目里的 `startTime` 是 6244 毫秒。两个都没错，但只有一个该进你的看板。

这就是 Speculation Rules 预渲染对计量做的事，而且它不会出声提醒。页面确实变快了，图表也确实变难看了。我想把这两者分岔的地方，在 Chrome 150 上一个个量清楚。

![Prerendered LCP: raw timing lies by about 6 seconds — measured across four Chrome launch configurations](../../../assets/blog/prerender-activationstart-cwv-measurement-2026/hero.png)

## 预渲染的页面为什么会跑在两套时钟上

先把底子打好。这篇的结论很窄，没有概念垫底，数字就只是数字。

Speculation Rules API 用来告诉浏览器，用户接下来大概率会去哪个页面。往文档里放一段脚本块就行：

```html
<script type="speculationrules">
{
  "prerender": [
    { "urls": ["/next.html"], "eagerness": "immediate" }
  ]
}
</script>
```

`prefetch` 只是把响应字节先取回来。`prerender` 走得远得多：浏览器会在你看不见的地方把那个页面**完整渲染一遍**。解析 HTML、执行脚本、做布局、拉子资源，全都做完。等用户真的点进那个链接，什么都不用加载，浏览器直接**激活（activate）**那份已经准备好的文档，切换几乎是瞬间完成的。

时钟就是在这里裂开的。文档 `performance` 时间线的原点，是**预渲染开始的那一刻**，不是用户点击的那一刻。如果用户过了六秒才点，那么对这份文档来说，激活是发生在 t+6000ms 附近的事件。而首次绘制不可能早于激活，因为预渲染期间什么都不会画出来。

于是 LCP 条目的 `startTime` 就不再表示"用户等了多久"，而变成"预渲染开始后流逝了多久"，里面把用户迟迟没点击的那段纯等待整个包了进去。

浏览器给了一个值来抹平这段差距：`PerformanceNavigationTiming.activationStart`。Chrome 官方文档的原话是："Once a prerendered document is activated, `PerformanceNavigationTiming`'s `activationStart` will also be set to a non-zero time representing the time between when the prerender was started and the document was actually activated."（出处：[Prerender pages in Chrome for instant page navigations](https://developer.chrome.com/docs/web-platform/prerender-pages)）

用户的体感时间，就是原始值减去这个数。

## 在沙箱里把 6244ms 和 103.5ms 拆开

我在临时目录里起了个静态服务器。入口页 A 带着指向目标页 B 的预渲染规则，六秒后由脚本跳转到 B。六秒是我随手定的，故意把"用户在链接前犹豫"的时间放大，好让落差一眼可见。

目标页 B 用 `navigator.sendBeacon` 把自己的测量结果回传给服务器。为什么不用浏览器自动化工具，后面单独说。

```js
const nav = () => performance.getEntriesByType('navigation')[0];

new PerformanceObserver((list) => {
  for (const e of list.getEntries()) {
    const a = nav()?.activationStart ?? 0;
    send({ event: 'LCP', raw: e.startTime, activationStart: a,
           corrected: Math.max(e.startTime - a, 0) });
  }
}).observe({ type: 'largest-contentful-paint', buffered: true });
```

直接启动 Chrome 150.0.7871.187 打开页面 A。服务器上堆下来的日志是这样：

```json
{"event":"script-eval","prerendering":true,"activationStartAtEval":0}
{"event":"nav-timing","activationStart":0,"type":"navigate",
 "domContentLoadedEventStart":46.8,"loadEventStart":47.7,"responseEnd":0.1}
{"event":"activated","perfNow":6186.8,"activationStart":6136.9}
{"event":"FCP","raw":6244,"activationStart":6136.9,"corrected":107.1}
{"event":"LCP","raw":6244,"activationStart":6136.9,"corrected":107.1}
```

要看的东西，四行里全有了。

脚本第一次执行时 `document.prerendering` 是 `true`，文档在后台活着。`domContentLoadedEventStart` 是 46.8ms，`loadEventStart` 是 47.7ms，也就是说这两个事件**是在预渲染过程中触发的**。用户连看都还没看那个页面，加载就已经结束了。

激活发生在 6136.9ms 这个点上。FCP 和 LCP 都记在 6244ms。一减，107.1ms。

有句话得说明白：这次实验里预渲染工作得非常好。用户实际只等了零点一秒。问题不在这个特性，而在于它的成功没能体现在原始指标上。

![Two clocks after activation: which value each API reports for the same prerendered navigation](../../../assets/blog/prerender-activationstart-cwv-measurement-2026/two-clocks.png)

## 激活之前，activationStart 一直读作 0

再看日志第二行。那一刻的 `activationStart` 是 **0**。

这是规范，不是 bug。WICG 的预渲染规范规定，每个 Document 都有一个激活开始时间，初始值为零（[Prerendering Revamped](https://wicg.github.io/nav-speculation/prerendering.html)）。只有激活真正发生，这个值才会被填上。

在生产环境里它为什么咬人，一说就明白。不少团队的埋点是这么写的：加载时把导航条目读一次存进变量，之后每次指标到达就复用这个变量。

```js
// 在预渲染页面上会悄无声息地失效
const activationStart = performance.getEntriesByType('navigation')[0].activationStart;
// ...很久以后...
report('LCP', lcpEntry.startTime - activationStart);   // activationStart 早被冻死在 0
```

我在 `load` 之后立刻取的那个快照，值正是 0。六秒后激活触发，真实值变成 6136.9，可存进变量的那份永远是 0。本来用来做校正的代码一点校正都没做，却还以为自己做了。

规则很短：**在上报的那一刻去读 `activationStart`。** 不是脚本求值时，不是 `DOMContentLoaded`，也不是 `load`。

同理，信标本身也要推迟到激活之后再发。Chrome 文档直接点了这一条："However—particularly when using the Speculation Rules API—prerendered pages may have an impact on analytics and site owners may need to add extra code to only enable analytics for prerendered pages on activation, as not all analytics providers may do this by default."（出处：[Prerender pages in Chrome for instant page navigations](https://developer.chrome.com/docs/web-platform/prerender-pages)）

## 四种启动条件下的实测，以及 web-vitals 已经做了什么

测一次就下结论太冒险。我换启动条件又跑了四轮，这回把自己写的观察器换成了 [web-vitals](https://github.com/GoogleChrome/web-vitals) v5.1.0。

| 启动条件 | navigationType | TTFB | FCP | LCP | LCP 原始 startTime | activationStart |
|---|---|---|---|---|---|---|
| 普通启动 | `prerender` | 0 | 103.5 | 103.5 | 6240 | 6136.5 |
| `--enable-automation` | `prerender` | 0 | 106.5 | 106.5 | 6244 | 6137.5 |
| `--remote-debugging-port` | `prerender` | 0 | 109.9 | 109.9 | 6252 | 6142.1 |
| `--incognito` | `prerender` | 0 | 96.9 | 96.9 | 6220 | 6123.1 |

（单位毫秒，每种条件各测一次。别去读毫秒级的抖动，要看的是列与列之间的数量级差。）

四轮里库报出来的 LCP 都在 100ms 上下，而原始 `startTime` 全在 6.2 秒这一档。校正是库自己做的。打开 `node_modules` 里 v5.1.0 的源码就能看到：LCP 和 FCP 用 `Math.max(entry.startTime - activationStart, 0)` 算值，TTFB 用 `Math.max(responseStart - activationStart, 0)`；只要 `document.prerendering` 为真，或者 `activationStart` 大于零，`navigationType` 就被标成 `'prerender'`。

TTFB 那一列全是 0，也是同一个公式的结果。预渲染文档的 `responseStart` 远在激活之前，相减为负，被 `Math.max` 截成 0。这不算错。站在用户那边，那些字节早就到了，等待时间确实接近于零。但这些值一旦混进现场数据，整个 TTFB 分布就会整体左移。聚合时不按 `navigationType` 拆开，你迟早要为一次没人做过的"优化"开复盘会。

所以真正要上线的代码长这样：等激活、把校正交给库、顺手把导航类型作为标签带出去。

```js
import { onLCP, onFCP, onINP, onCLS, onTTFB } from 'web-vitals';

function whenActivated(fn) {
  if (document.prerendering) {
    document.addEventListener('prerenderingchange', () => fn(), { once: true });
  } else {
    fn();
  }
}

whenActivated(() => {
  const send = (m) => navigator.sendBeacon('/rum', JSON.stringify({
    metric: m.name,
    value: m.value,              // activationStart 已经减掉了
    rating: m.rating,
    navType: m.navigationType,   // 是 'prerender' 就在聚合时拆出来
  }));
  [onTTFB, onFCP, onLCP, onINP, onCLS].forEach((fn) => fn(send));
});
```

最容易被省掉的恰恰是 `navType`。留着这个字段，事后才分得清"预渲染命中率上去了"和"页面真的变快了"。不留，就没有别的办法分。

还有一个值没进那张表。`domContentLoadedEventStart` 的 46.8ms **完全不会被校正**。Navigation Timing 的各个标记仍然跑在预渲染那套时钟上。把校正过的 LCP 和没校正的"加载完成时间"并排放进同一块看板，这两个数就是在读两只不同的表。当你想验证[通过资源优先级把 LCP 往前拉的改动](/zh/blog/zh/lcp-image-preload-scanner-fetchpriority-2026)有没有生效时，这种错位尤其磨人，因为你用来对照的基线自己也在动。

## 这个实验用 Playwright 根本跑不起来

一开始我是想全程用 Playwright 做的。试了三次，三次都没成。

`document.prerendering` 一直是 `false`，`activationStart` 一直是 0，`navigationType` 回来的是 `navigate`。预渲染压根没发生。我怀疑规则写错了，就接上 CDP 的 `Preload` 域去看：

```json
{"ev":"Preload.preloadEnabledStateUpdated","d":{
  "disabledByPreference":false,"disabledByDataSaver":false,"disabledByBatterySaver":false,
  "disabledByHoldbackPrefetchSpeculationRules":false,
  "disabledByHoldbackPrerenderSpeculationRules":false}}
{"ev":"Preload.ruleSetUpdated","d":{"ruleSet":{"id":"49930.0", ... }}}
{"ev":"Preload.preloadingAttemptSourcesUpdated","d":{"preloadingAttemptSources":[
  {"key":{"action":"Prerender","url":"http://127.0.0.1:8899/next.html"}, ... }]}}
```

规则解析正常。尝试也登记了。没有任何一项处于禁用状态。可 `prerenderStatusUpdated` 事件**一条都没来**。连启动都没启动。

我转头去排查启动参数。把 Playwright 加的那一整串 `--disable-features` 原样抄过来直接启动 Chrome，预渲染正常。只关掉我最怀疑的 `RenderDocument`，正常。只关掉 `OptimizationHints`，正常。`--enable-automation`、`--remote-debugging-port`、`--incognito`，全都正常。

老实说，我没能定位到底。参数不是凶手。同一个二进制，只有在 Playwright **真正驱动它**的时候预渲染才被抑制。这次执行的时间里，我没能再往下收窄。

不过实务上要的结论已经摆在那儿了：**别用 Playwright 或 Puppeteer 去验证 Speculation Rules。** 规则明明是对的，你却会拿到一个"没生效"的假阴性。这和[在 jsdom 里跑 axe-core、结果漏掉真实违规](/zh/blog/zh/axe-core-ci-a11y-jsdom-vs-browser-2026)是同一类陷阱：测试环境安安静静地给你一个错误答案，旁边还打着绿勾。

最后管用的是两招。一是本文这套装置：让页面自己用 `sendBeacon` 把结果回传，Chrome 只管正常启动。二是 Chrome 文档推荐的快速确认法："The easiest way to see if a page was prerendered (either in full or partially) is to open DevTools after the page is activated and type `performance.getEntriesByType('navigation')[0].activationStart` in the console."（出处：[Prerender pages in Chrome for instant page navigations](https://developer.chrome.com/docs/web-platform/prerender-pages)）

## 这次测量没有主张的事

每种条件只测了一次，一台笔记本，对着本地服务器。毫秒级的数字是用来说明机制的，不是基准测试。那六秒的间隔也是我在 `setTimeout` 里编出来的，和真实用户的犹豫无关。不过间隔拖得越长，未校正值的误差就按比例长得越大。

我也没有拿预渲染和普通加载去比速度。作为对照直接打开同一个页面时 LCP 是 532ms，但那个数里掺着用全新配置文件拉起浏览器窗口的开销。这不是同条件对比，所以"预渲染快五倍"这种话，这份数据支撑不了。

而且这是 Chrome 的事。Safari 和 Firefox 都没有发布基于 Speculation Rules 的预渲染。如果你有一半流量在那边，这套校正逻辑也只对另一半生效。

最后不谈排名。预渲染不是排名因素，本文任何内容都不保证搜索表现。这里谈的只有体感速度，以及怎么老老实实地把它量准。关于 Core Web Vitals，Chrome 文档写的是："For Core Web Vitals, measured by Chrome through the Chrome User Experience Report, these are intended to measure the user experience."（出处：[Prerender pages in Chrome for instant page navigations](https://developer.chrome.com/docs/web-platform/prerender-pages)）要量的是用户体验，不是文档的内部时钟。

## 先把计量修好，再把加速发出去

上 Speculation Rules 之前，先动埋点。顺序反过来，你就会把改进读成退化。

六条：

1. 别手写 `PerformanceObserver`，用 web-vitals v5 以上。非要自己写，就对 LCP、FCP、TTFB 一律套上 `Math.max(value - activationStart, 0)`。
2. **在上报那一刻**读 `activationStart`，绝不在加载时冻进变量。
3. 分析初始化和信标发送，都先看 `document.prerendering`，等到 `prerenderingchange` 再放行。
4. RUM 聚合按 `navigationType === 'prerender'` 拆开。混在一起会把 TTFB 压到零附近，让 LCP 好看得不真实。
5. 在看板上写明：`domContentLoadedEventStart`、`loadEventStart` 这类 Navigation Timing 标记不会被校正，别和校正过的指标放同一块面板。
6. 验证 Speculation Rules 用自回传装置或 DevTools 的 Application 面板，别用浏览器自动化工具。

这六条对完全不做预渲染的站点也无害。现在就放进去，等哪天真开起来，看板不会突然抖一下。

如果你想找人复核 RUM 管线能不能扛住预渲染、bfcache 这类页面生命周期变化，或者需要把 Core Web Vitals 的计量设计重做一遍，我以个人身份承接咨询与实现委托。联系方式放在[个人主页](/zh/about)。
