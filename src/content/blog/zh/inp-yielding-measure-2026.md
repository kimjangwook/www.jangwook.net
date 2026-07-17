---
title: '点一下花了264ms — 同样的活儿切碎后只要56ms：一次INP实测'
description: 'INP在2024年取代FID成为Core Web Vitals的响应性指标。我用Event Timing API直接测量同样220ms的工作在一口气跑完与用scheduler.yield切碎两种做法下的差异，并用代码和日志完整记录264ms(需改进)如何降到56ms(良好)的全过程。'
pubDate: '2026-07-16'
heroImage: '../../../assets/blog/inp-yielding-measure-2026/hero.png'
tags:
  - Core Web Vitals
  - INP
  - Web性能
relatedPosts:
  - slug: cls-layout-shift-reserve-space-measure-2026
    score: 0.78
    reason:
      ko: CLS는 화면이 밀리지 않느냐를, INP는 눌렀을 때 반응이 빠르냐를 잰다. 둘 다 PerformanceObserver로 브라우저가 직접 뱉는 숫자를 받아 고치는 방식이라, 측정 코드의 뼈대가 거의 똑같다. 한 편으로 재는 법을 익히면 다른 편이 쉬워진다.
      ja: CLSは画面がずれないか、INPは押したとき速く返るかを測る。どちらもPerformanceObserverでブラウザが吐く数字を受け取って直す流儀で、計測コードの骨格がほぼ同じ。片方を覚えるともう片方が楽になる。
      en: CLS measures whether the screen stays put; INP measures whether a tap responds fast. Both read numbers straight from a PerformanceObserver, so the measurement scaffolding is nearly identical — learn one and the other comes cheap.
      zh: CLS 测画面是否跳动，INP 测点击后是否快速响应。两者都用 PerformanceObserver 接收浏览器直接吐出的数字来修复，测量代码的骨架几乎相同，学会一个另一个就顺手了。
  - slug: lcp-image-preload-scanner-fetchpriority-2026
    score: 0.71
    reason:
      ko: LCP는 로딩이 끝나는 속도를, INP는 로딩 이후 상호작용의 속도를 본다. Core Web Vitals 세 지표 중 앞과 뒤를 맡는 짝이라, LCP를 잡았다면 다음 병목은 대개 INP다.
      ja: LCPは読み込みが終わる速さ、INPは読み込み後の操作の速さを見る。Core Web Vitals三指標の前と後ろを担う対で、LCPを片づけたら次のボトルネックはたいていINPだ。
      en: LCP watches how fast loading finishes; INP watches how fast interactions feel afterward. They are the front and back of the Core Web Vitals trio — once LCP is handled, INP is usually the next bottleneck.
      zh: LCP 看加载多快结束，INP 看加载之后交互多快。它们是 Core Web Vitals 三指标的前后两端，搞定 LCP 后，下一个瓶颈通常就是 INP。
  - slug: a11y-lighthouse-audit-fix-2026
    score: 0.55
    reason:
      ko: 느린 응답은 성능 문제이자 접근성 문제다. 눌렀는데 몇백 밀리초 동안 아무 반응이 없으면 인지 부하가 있는 사용자는 같은 버튼을 반복해 누른다. 그 글의 Lighthouse 실측 흐름이 여기서도 그대로 쓰인다.
      ja: 遅い応答は性能の問題であると同時にアクセシビリティの問題でもある。押しても数百ミリ秒無反応だと、認知負荷のある利用者は同じボタンを何度も押す。あちらのLighthouse実測の流れがここでも生きる。
      en: A slow response is a performance problem and an accessibility problem at once. When a tap does nothing for a few hundred milliseconds, users with cognitive load press the same button again. The Lighthouse measure-and-fix flow from that post applies here too.
      zh: 迟缓的响应既是性能问题，也是无障碍问题。点了几百毫秒没反应，有认知负荷的用户会反复点同一个按钮。那篇的 Lighthouse 实测流程在这里同样适用。
---

先看一行日志。

```text
click   INP= 264ms  (input 7 + proc 223 + present 35)
```

按钮只点了一下，屏幕重绘却花了264毫秒。手指落到屏上，到眼睛看见变化，中间隔了四分之一秒多，什么都没发生。我改了这个按钮的代码，再测一次：56ms。CPU干的活总量一点没变，变的只是它在什么时候停下来、把画面让给浏览器去画。

多数团队都盯着LCP和CLS。加载快不快、布局跳不跳，一眼就看得出。可加载完之后点按钮的反应速度，也就是INP，还常被排在后面。我以前也这样。这次不靠嘴说，直接接住浏览器吐给你的数字。下面每一条日志、每一张表，都是Chrome 150里用Event Timing API取的真实值。

## INP测的是什么：一次点击，切成三段

INP是Interaction to Next Paint，直译是"从交互到下一次绘制"。它测的是：用户按下某个东西的那一刻，到结果真正画到屏幕上那一帧之间的延迟。关键在于，一次交互不是一个笼统的数字，而是分成三段。[web.dev官方文档](https://web.dev/articles/inp)是这么定义的。

1. <strong>输入延迟（input delay）</strong>：从用户按下，到与之绑定的回调第一次运行之间的时间。如果这一刻主线程正被别的活儿占着，这段就会变长。
2. <strong>处理时间（processing duration）</strong>：事件回调实际执行的时间。你挂上去的点击处理函数越重，这段越长。
3. <strong>呈现延迟（presentation delay）</strong>：回调跑完之后，到下一帧真正画上屏幕之间的时间。

三段相加，就是这次交互的延迟。而INP会挑出整次访问里（几乎）最慢的那一次，当作代表报出来。这正是它和旧指标FID最要命的区别。FID只测第一次交互的"输入延迟"，也就是你在页面上按的第一个按钮的反应。INP盯着每一次点击、轻触和按键，把接近最差的那个报出来。它看的不是第一印象，是整场体验。

阈值方面，[按web.dev的口径](https://web.dev/articles/inp)，是在字段数据的第75百分位上这样划的。

| INP (p75) | 判定 | 感受 |
|---|---|---|
| ≤ 200ms | 良好（good） | 一按就有反应 |
| > 200ms 且 ≤ 500ms | 需要改进 | 有点卡顿 |
| > 500ms | 差（poor） | 像没反应，于是又按一次 |

日期也钉一下。INP在2024年3月12日成为Core Web Vitals的正式指标，取代了FID（[web.dev公告](https://web.dev/blog/inp-cwv-march-12)），FID则在同年9月9日从Chrome工具里移除。所以今天代表"响应性"的CWV指标，只剩INP一个。

## 为什么现在，Web开发者该亲手测INP

在意INP有两个理由。一个是人，一个是搜索。

人这边很直白。不管加载多快，只要每次按按钮都卡上300ms，这站就会被记成"慢"。而且它和无障碍是重叠的。没反应时，有认知负荷或者手会抖的用户会反复按同一个按钮，那个空档里表单就被提交了两次。所以我把响应速度，和[用Lighthouse实测并修复无障碍那篇](/zh/blog/zh/a11y-lighthouse-audit-fix-2026)放在同一条线上看。

搜索这边得说实话。Core Web Vitals是Google页面体验信号的一部分，INP在里面。但Google的说法是：它只是在关联度相近的页面之间起个"分高下"的作用，并不能推翻关联度。<strong>把INP降到200ms以内，并不保证排名上升。</strong>这不是我的看法，是官方立场。它仍然值得测、值得修，因为同一份力气同时动了搜索信号和真实体感。哪怕只冲着其中一头，也划算。

这里要记住INP的一个性质：它本质上是字段（field）指标。判定用的是真实用户Chrome里采集的数据（CrUX）。实验室（lab）工具也能估，但那个值完全取决于"你按了哪些交互"。所以这次实验把"我按了什么"控制得很死，只用这个条件下跑出来的数字说话。它替代不了真实访客那台慢手机。这个限制我留到最后再说。这个性质和[我实测LCP那篇](/zh/blog/zh/lcp-image-preload-scanner-fetchpriority-2026)讲的"加载多快结束"正好成对：LCP管前半段，INP管后半段。在同一套 Core Web Vitals 里，[实测并压住画面偏移（CLS）的那次记录](/zh/blog/zh/cls-layout-shift-reserve-space-measure-2026)和[用一行 CSS 削减渲染成本的 content-visibility 实验](/zh/blog/zh/content-visibility-auto-render-cost-measure-2026)，我也用同样的姿态处理。

## 沙盒：同样的活儿，两种跑法

实验刻意做得很小。一个静态HTML页，两个按钮。两个都精确地做220ms的计算。区别只在于这220ms怎么花。

第一个按钮一口气跑完。在点击处理函数里霸住主线程220ms不撒手。这在实战里很常见：一次点击又排序列表、又翻localStorage、又重画图表，全塞进一个函数。

```javascript
function busy(ms) {
  const end = performance.now() + ms;
  while (performance.now() < end) { /* 霸占主线程 */ }
}

document.getElementById('blocking').addEventListener('click', () => {
  busy(220);                        // 一整块220ms
  document.body.style.background = '#fff7ed';
});
```

第二个按钮把同样的220ms切成11个20ms的小片，每片之间都把主线程还给浏览器。

```javascript
const yield_ = () =>
  ('scheduler' in window && 'yield' in scheduler)
    ? scheduler.yield()                       // 支持的浏览器：带优先级的续跑
    : new Promise(r => setTimeout(r, 0));      // 不支持：setTimeout兜底

document.getElementById('yielding').addEventListener('click', async () => {
  for (let i = 0; i < 11; i++) {
    busy(20);
    await yield_();                            // 每片之后让出
  }
  document.body.style.background = '#ecfdf5';
});
```

测量交给浏览器，用的正是字段里采集INP的同一件工具：Event Timing API。用`PerformanceObserver`观测`event`类型，真实的用户交互会带着`interactionId`过来。从这里你就能自己算出三段。

```javascript
new PerformanceObserver((list) => {
  for (const e of list.getEntries()) {
    if (!e.interactionId) continue;                 // 只要真实交互
    const inputDelay    = e.processingStart - e.startTime;
    const processing    = e.processingEnd   - e.processingStart;
    const presentation  = (e.startTime + e.duration) - e.processingEnd;
    console.log(e.name, Math.round(e.duration), inputDelay, processing, presentation);
  }
}).observe({ type: 'event', durationThreshold: 16, buffered: true });
```

我在Chrome 150里打开这个页，每个按钮都实打实点了三次。自动化脚本造出来的假点击不带`interactionId`，这个实验根本收不到。所以只用受信任（trusted）的真实点击去按。

## 怎么读这份日志

<img src="../../../assets/blog/inp-yielding-measure-2026/event-timing-log.png" alt="Event Timing API日志。点blocking按钮记录到click INP=264ms（input 7 + proc 223 + present 35）、376ms、256ms；点yielding按钮记录到56ms、48ms、56ms。" />

上面是直接打印在页面上的实测日志。一口气跑的按钮（上面三组）和切碎的按钮（下面三组）分得清清楚楚。代表值列成表是这样。

| 做法 | 代表INP | 输入延迟 | 处理 | 呈现延迟 | 判定 |
|---|---|---|---|---|---|
| 一整块220ms处理函数 | 264ms | 7 | 223 | 35 | 需要改进 |
| 一整块220ms处理函数（最差） | 376ms | 1 | 220 | 155 | 需要改进 |
| 用scheduler.yield切碎 | 56ms | 0 | 21 | 35 | 良好 |
| 用scheduler.yield切碎 | 48ms | 0 | 20 | 28 | 良好 |

一口气跑那边，`proc`（处理时间）整块记成了220ms上下。点击处理函数不跑完，浏览器就画不出一帧。三次全过了200ms，掉进"需要改进"。

切碎那边，记到单个事件上的处理时间才20ms出头。它照样把220ms的计算全做完，可第一片一结束、一让给浏览器，画面就有了缝隙去绘制，这次交互56ms就收工。同样的活儿，响应快了4.7倍。不是CPU偷懒了，是它没再抢走浏览器画图的机会。

日志里还有一处有意思。一次点击会把`pointerdown`、`pointerup`、`click`三个事件用同一个`interactionId`绑在一起。在一口气跑的按钮上，`pointerup`处理时间是0，呈现延迟却记成了258ms。计算是`click`处理函数干的，可它霸住主线程，把`pointerup`之后那一帧也一起拖了。INP会拿这一组里最长的那个事件当整次交互的代表。所以你有时会遇到"处理函数本身很快，INP怎么还高"。答案往往是：附近有别的活儿在霸占主线程。

## 实战里啃噬INP的常见元凶

我的沙盒是故意埋了个220ms循环，原因一目了然。真实站点上，这220ms往往不在一处，而是散成好几块，反而更难找。测的时候，以及翻别人页面的时候，我反复撞见的几个元凶，记在这里。

<strong>第一，水合与重渲染。</strong>用React或Vue做的页面，加载完立刻要水合：JavaScript给DOM挂事件、对齐状态。这活儿一重，用户在这期间点的那一下，就得等水合跑完。这是输入延迟整块变大的教科书情形。再叠上一次点击就重画半棵组件树的重渲染，处理时间也跟着膨胀。"框架快"恰恰是最容易让人松懈的地方。

<strong>第二，第三方标签。</strong>分析脚本、广告、聊天挂件、热图工具。这些多半是别人的代码，你切不了，而且它想什么时候用主线程就什么时候用。偏赶上那一刻用户按了按钮，输入延迟就飙。这是你自己代码再干净、INP照样难看的常见原因。它和[用JS事后插入内容的CSR习惯](/zh/blog/zh/ai-crawlers-dont-render-javascript-csr-2026)同根：对爬虫是空页面，对用户是慢响应。事后丢到主线程上的活儿，总要还账。

<strong>第三，事件委托背后那个重的公共处理函数。</strong>在文档最上层挂一个监听接住所有点击，很省事，可要是那个处理函数每次点击都做重的分支和计算，所有点击就一起慢。

<strong>第四，过大的DOM。</strong>节点上万的页面，一次点击引发的样式重算和布局开销就那么大。这常表现为呈现延迟：回调很快结束，浏览器却在为画那一帧发愁。要是你用无限滚动列表或巨型表格，先考虑用虚拟化（virtualization）把真正渲染的节点数砍下来。

关键是，别一看INP差就立刻断定"我的点击处理函数重"。就像日志里看到的，计算在一处发生，延迟却可能记到不相干的事件上。先看三段里哪段大，再开药方。不用眼睛确认、凭猜就动手，你会一直打磨那个本来没问题的处理函数，而真正的瓶颈，那个第三方标签，原封不动。先测，再修。

## 用scheduler.yield把长任务切开

`scheduler.yield()`如其名，把主线程让给浏览器。它给浏览器腾出空档去处理积压的绘制或等待中的输入，然后回到你函数刚才停下的那个位置继续跑。超过50ms的活儿，[按web.dev的定义](https://web.dev/articles/optimize-long-tasks)就是长任务（long task），而长任务在整段时间里都收不了输入。把长任务切开，输入延迟和呈现延迟就一起降下来。

`setTimeout(fn, 0)`也能让出。但有区别。你交给`scheduler.yield()`的剩余部分，会进一个比新任务优先级略高的队列，续跑时不会被中途插进来的无关任务挤到后面。`setTimeout`没这个保证，让出的空档里，别的定时器可能先插队。

也得把限制说清楚。`scheduler.yield()`还[不是Baseline](https://developer.mozilla.org/en-US/docs/Web/API/Scheduler/yield)，意思是并非所有主流浏览器都能跑。所以像上面那样用渐进增强包起来才对：支持就用带优先级的续跑，不支持就退回`setTimeout`，至少"让出"这个效果还在。把特性检测放在前面，别让不支持的浏览器把应用搞崩。

还有一点。切碎不总是正解。要是计算真的很重，一开始就该把它挪出主线程。搬去Web Worker、提前把结果算好、或者干脆那一刻别做这件事，先考虑这些。`scheduler.yield()`是"非得在主线程上做的活儿，切细了保住响应性"的工具，不是把重活变轻的魔法。

## 今天就能用的清单

这是我测完之后定下来的顺序。

- <strong>先看字段。</strong>在Search Console的CWV报告或CrUX里看真实的INP p75。从实验室数字起步，你就会掉进"我这台快笔记本上没事，字段怎么这么差"。
- <strong>锁定那次慢交互。</strong>用DevTools的Performance面板录下问题交互，或者像上面那样把Event Timing API挂到线上，记录带`interactionId`事件的三段。到底是输入延迟大、处理大、还是呈现大，药方完全不同。
- <strong>输入延迟大</strong>，就去找那一刻霸占主线程的别的活儿（重初始化、第三方脚本、定时器），把它推后或切开。
- <strong>处理时间大</strong>，说明处理函数本身重。用`scheduler.yield()`切开长任务，把不着急的部分（打点、分析上报）挪到交互之后。
- <strong>呈现延迟大</strong>，看看回调里是不是抖动了布局、或者动了太多DOM。一帧要画的东西太多，呈现就会往后拖。
- <strong>别做的事</strong>：一次点击里把所有事都同步处理；交互刚结束就立刻触发重渲染；不做特性检测就直接调`scheduler.yield()`。

## 一句诚实的话

这个实验是Chrome 150、桌面、一台快机器上的实验室测量。字段里的INP铺得宽得多，一直到低端安卓。所以这里的数字（264ms→56ms）足够说明方向和原理（切碎能让响应更快），但它不是对你站点字段INP的预测。而且前面说了，把INP做到良好，不保证排名有涨。Core Web Vitals从来没赢过关联度。把这两样刨掉，剩下的真好处只有一个：真正在用你站点的人按下按钮时，屏幕是56ms回应，而不是264ms。就为这个，也值得测。

---

想把结构化数据从服务端稳稳地输出，或者给现有站点的Core Web Vitals和无障碍做一次实测体检，我个人接这类咨询和落地。需要这种"测了再修"的活儿，走我资料页上的联系方式找我就行。
