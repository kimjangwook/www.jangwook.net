---
title: 'Measuring INP: one click cost 264ms, chunking it got 56ms'
description: 'INP replaced FID in Core Web Vitals in 2024. I ran 220ms of work as one blocking task versus sliced with scheduler.yield: 264ms fell to 56ms, in code and logs.'
pubDate: '2026-07-16'
heroImage: '../../../assets/blog/inp-yielding-measure-2026/hero.png'
tags:
  - Core Web Vitals
  - INP
  - Web Performance
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

Start with one log line.

```text
click   INP= 264ms  (input 7 + proc 223 + present 35)
```

I clicked a button once, and the screen took 264 milliseconds to repaint. From the moment a finger lands to the moment anything visible changes, more than a quarter of a second went by with nothing on screen. I edited the button's code and measured again: 56ms. The total CPU work stayed exactly the same. The only thing that changed was *when* the work paused to let the browser paint.

Most teams watch LCP and CLS. Loading speed and layout shift are easy to notice. But responsiveness after load, how fast a button reacts when you tap it, still gets deferred. I did the same for a long time. So this time I stopped guessing and read the numbers the browser hands you directly. Every log and table below is a real value pulled from the Event Timing API in Chrome 150.

## What INP measures: one click, three slices

INP stands for Interaction to Next Paint. It measures the delay from the moment a user presses something to the frame where the result actually paints. The key idea is that a single interaction is not one opaque number. It splits into three slices. Here is how the [official web.dev docs](https://web.dev/articles/inp) define them.

1. <strong>Input delay</strong>: the time before any callback for the interaction runs. If the main thread is busy with other work at that moment, this grows.
2. <strong>Processing duration</strong>: the time it takes your event callbacks to actually execute. A heavy click handler shows up here.
3. <strong>Presentation delay</strong>: the time after the callbacks finish until the next frame paints on screen.

Add the three and you get that interaction's latency. INP reports the (near) slowest interaction across the whole visit. That is the decisive break from the old metric, FID. FID measured only the input delay of the *first* interaction, the reaction of the very first button you pressed on the page. INP watches every click, tap, and key press, then reports something close to the worst. It grades the whole experience, not the first impression.

The thresholds, [per web.dev](https://web.dev/articles/inp), are read at the 75th percentile of field page loads.

| INP (p75) | Verdict | How it feels |
|---|---|---|
| ≤ 200ms | Good | responds right away |
| > 200ms and ≤ 500ms | Needs improvement | a slight hitch |
| > 500ms | Poor | feels dead, so you tap again |

One date worth pinning down: INP became a stable Core Web Vital on March 12, 2024, replacing FID ([web.dev announcement](https://web.dev/blog/inp-cwv-march-12)), and FID was removed from Chrome tooling on September 9 that year. So the single CWV metric representing responsiveness today is INP.

## Why a web developer should measure INP now

Two reasons. One is people, the other is search.

The people reason is plain. However fast a page loads, if a button freezes for 300ms on every press, it gets remembered as a slow site. And this overlaps with accessibility. When nothing responds, users with cognitive load or a hand tremor press the same button again, and a form gets submitted twice in the gap. That is exactly why I treat response time the same way I treated [measuring and fixing accessibility with Lighthouse](/en/blog/en/a11y-lighthouse-audit-fix-2026/).

The search reason needs honesty. Core Web Vitals is part of Google's page experience signals, and INP sits inside it. But Google describes it as a tiebreaker among pages of similar relevance, not something that overrides relevance. <strong>Getting INP under 200ms does not guarantee a ranking boost.</strong> That is not my opinion; it is the official position. The work still pays off, because the same effort moves a search signal and the actual felt experience at once. Even on one of those alone, it earns its keep.

Keep one property in mind. INP is fundamentally a field metric. It gets graded from data collected in real users' Chrome (CrUX). Lab tools *can* estimate it, but that value depends entirely on which interactions you perform. So this experiment controls exactly what I pressed and only claims what those conditions produced. It cannot stand in for a real visitor's slow phone. I come back to that limit at the end. This property pairs with the "how fast loading finishes" story from [my LCP measurement](/en/blog/en/lcp-image-preload-scanner-fetchpriority-2026/). LCP owns the front, INP owns the back. From the same Core Web Vitals set, I handled [measuring and taming layout shift (CLS)](/en/blog/en/cls-layout-shift-reserve-space-measure-2026/) and [cutting render cost with one line of CSS via content-visibility](/en/blog/en/content-visibility-auto-render-cost-measure-2026/) with the same posture. Field metrics do lie quietly when the measuring code is wrong, though. [A prerendered page reporting LCP at 6.2s](/en/blog/en/prerender-activationstart-cwv-measurement-2026/) is exactly that case.

## The sandbox: same work, two ways

The setup is deliberately small. One static HTML page with two buttons. Both do exactly 220ms of computation. The only difference is how they spend those 220ms.

The first button runs it in one shot. Inside the click handler it holds the main thread for 220ms and refuses to let go. This is a common pattern in the wild: one click that sorts a list, walks localStorage, and redraws a chart, all inside a single function.

```javascript
function busy(ms) {
  const end = performance.now() + ms;
  while (performance.now() < end) { /* hog the main thread */ }
}

document.getElementById('blocking').addEventListener('click', () => {
  busy(220);                        // one 220ms block
  document.body.style.background = '#fff7ed';
});
```

The second button slices the same 220ms into eleven 20ms pieces and hands the main thread back to the browser between each one.

```javascript
const yield_ = () =>
  ('scheduler' in window && 'yield' in scheduler)
    ? scheduler.yield()                       // supported: prioritized continuation
    : new Promise(r => setTimeout(r, 0));      // fallback: setTimeout

document.getElementById('yielding').addEventListener('click', async () => {
  for (let i = 0; i < 11; i++) {
    busy(20);
    await yield_();                            // yield after each slice
  }
  document.body.style.background = '#ecfdf5';
});
```

I let the browser do the measuring, with the same instrument that collects INP in the field: the Event Timing API. Observe the `event` type with a `PerformanceObserver`, and real user interactions arrive carrying an `interactionId`. From there you compute the three slices yourself.

```javascript
new PerformanceObserver((list) => {
  for (const e of list.getEntries()) {
    if (!e.interactionId) continue;                 // only genuine interactions
    const inputDelay    = e.processingStart - e.startTime;
    const processing    = e.processingEnd   - e.processingStart;
    const presentation  = (e.startTime + e.duration) - e.processingEnd;
    console.log(e.name, Math.round(e.duration), inputDelay, processing, presentation);
  }
}).observe({ type: 'event', durationThreshold: 16, buffered: true });
```

I opened the page in Chrome 150 and pressed each button three times, for real. A synthetic click from an automation script carries no `interactionId`, so this experiment never picks it up. Only trusted, actual clicks count here.

## How to read the log

<img src="../../../assets/blog/inp-yielding-measure-2026/event-timing-log.png" alt="Event Timing API log. Clicks on the blocking button recorded click INP=264ms (input 7 + proc 223 + present 35), 376ms, and 256ms; clicks on the yielding button recorded 56ms, 48ms, and 56ms." />

Above is the real log printed straight onto the page. The blocking button (top three groups) and the chunked button (bottom three) split cleanly. Here are the representative values.

| Approach | Representative INP | Input delay | Processing | Presentation | Verdict |
|---|---|---|---|---|---|
| One 220ms handler | 264ms | 7 | 223 | 35 | Needs improvement |
| One 220ms handler (worst) | 376ms | 1 | 220 | 155 | Needs improvement |
| Chunked with scheduler.yield | 56ms | 0 | 21 | 35 | Good |
| Chunked with scheduler.yield | 48ms | 0 | 20 | 28 | Good |

On the blocking side, `proc` (processing) landed in the 220ms range as one lump. The browser could not paint a frame until the whole click handler finished. All three runs cleared 200ms and fell into "needs improvement."

On the chunked side, the processing charged to a single event is about 20ms. It still does the full 220ms of computation, but the instant the first slice ends and yields, the browser gets a gap to paint, and the interaction closes at 56ms. Same work, 4.7× faster response. The CPU did not get lazier; it just stopped stealing the browser's chance to draw.

There is one more thing worth noticing in the log. A single click bundles three events (`pointerdown`, `pointerup`, `click`) under one `interactionId`. On the blocking button, `pointerup` shows zero processing yet a 258ms presentation delay. The computation happened in the `click` handler, but by holding the main thread it also pushed out the frame after `pointerup`. INP takes the longest single event in that bundle as the interaction's representative. That is why you sometimes get "the handler itself is fast, so why is INP high?" The answer is usually other work hogging the main thread nearby.

## The usual suspects that eat INP in production

My sandbox planted a 220ms loop on purpose, so the cause was obvious. On a real site that 220ms is rarely in one place. It's scattered across pieces, which makes it harder to find. Here are the culprits I keep running into, both while measuring and while poking at other people's pages.

<strong>First, hydration and re-renders.</strong> A page built with React or Vue hydrates right after load: JavaScript attaches events to the DOM and reconciles state. If that work is heavy, a click the user makes in the meantime waits until hydration finishes. That is the textbook case of a bloated input delay. Add a click that re-renders half the component tree, and processing swells too. "Fast framework" is exactly where people get complacent.

<strong>Second, third-party tags.</strong> Analytics scripts, ads, chat widgets, heatmap tools. These are usually someone else's code, so you can't chunk them, and they do their work on the main thread whenever they please. If the user presses a button at that exact moment, input delay spikes. It's a common reason INP grades poorly even when your own code is clean. This shares a root with [the CSR habit of injecting content late with JavaScript](/en/blog/en/ai-crawlers-dont-render-javascript-csr-2026/): an empty page for crawlers, a slow response for users. Work you defer onto the main thread always has a price.

<strong>Third, a heavy shared handler behind event delegation.</strong> Attaching one listener at the top of the document to catch every click is convenient, but if that handler does heavy branching and computation on each click, every click gets slow.

<strong>Fourth, an oversized DOM.</strong> A page with tens of thousands of nodes pays that much more for style recalculation and layout on a single click. This tends to surface as presentation delay: the callback finished quickly, but the browser struggles to paint the frame. If you run an infinite-scroll list or a giant table, reach for virtualization to cut the number of nodes you actually render.

The point is not to jump straight to "my click handler is heavy" the moment INP is bad. As the log showed, the computation can happen in one place while the delay gets charged to a different event. Look at which of the three slices is large first, then prescribe. Poke by guesswork and you'll keep polishing a perfectly fine handler while the real bottleneck, a third-party tag, sits untouched. Measure first, fix second.

## Chunking long tasks with scheduler.yield

`scheduler.yield()` does what the name says: it yields the main thread to the browser. It gives the browser room to handle queued rendering or pending input, then resumes execution right where your function left off. Anything over 50ms is a [long task by web.dev's definition](https://web.dev/articles/optimize-long-tasks), and a long task cannot accept input for its whole duration. Break the long task up, and input delay and presentation delay both come down.

`setTimeout(fn, 0)` also yields. But there is a difference. The remainder you hand to `scheduler.yield()` goes into a queue with slightly higher priority than brand-new tasks, so it resumes without getting shoved behind unrelated work that cut in. `setTimeout` gives no such guarantee; some other timer can jump ahead during the gap.

Now the honest caveat. `scheduler.yield()` is [not Baseline yet](https://developer.mozilla.org/en-US/docs/Web/API/Scheduler/yield). It does not run in every widely used browser. That is why the code above wraps it in progressive enhancement: use the prioritized continuation where it exists, fall back to `setTimeout` where it does not, and still get the basic "yield" effect. Put feature detection in front so the app never breaks on a browser that lacks it.

One more. Chunking is not always the answer. If the computation is genuinely heavy, get it off the main thread in the first place. Move it to a Web Worker, precompute the result, or simply don't do that work at that moment. `scheduler.yield()` is a tool for keeping work that *must* run on the main thread responsive by slicing it. It is not a spell that makes heavy work light.

## A checklist you can apply today

Here is the order I settled on after measuring.

- <strong>Look at the field first.</strong> Check your real INP p75 in the Search Console CWV report or CrUX. Start from lab numbers and you fall into "it's fine on my fast laptop, so why is the field bad?"
- <strong>Isolate the slow interaction.</strong> Record the problem interaction in the DevTools Performance panel, or attach the Event Timing API in production and log the three slices for events that carry an `interactionId`. The fix differs depending on whether input, processing, or presentation dominates.
- <strong>If input delay is large</strong>, find the other work (heavy init, third-party scripts, timers) hogging the main thread at that moment and defer or chunk it.
- <strong>If processing is large</strong>, the handler itself is heavy. Split the long task with `scheduler.yield()`, and push non-urgent parts (logging, analytics beacons) to after the interaction.
- <strong>If presentation delay is large</strong>, check whether your callback thrashes layout or touches too much DOM. Too much to draw in one frame pushes presentation out.
- <strong>Avoid</strong>: doing everything synchronously on one click, kicking off a heavy re-render immediately after an interaction, and calling `scheduler.yield()` with no feature detection.

## The honest limit

This experiment is a lab measurement on Chrome 150, desktop, a fast machine. Field INP spreads far wider, down to low-end Android. So these numbers (264ms to 56ms) are enough to show the direction and the mechanism (chunking makes the response faster), but they are not a prediction of your site's field INP. And as I said, making INP good guarantees no ranking gain. Core Web Vitals has never beaten relevance. Strip those two away and one real benefit remains: when someone actually using your site presses a button, the screen answers in 56ms instead of 264ms. That alone is worth measuring.

---

If you need structured data emitted reliably server-side, or a real measurement pass on an existing site's Core Web Vitals and accessibility, I take that on personally as consulting and implementation work. When this kind of measure-and-fix job comes up, the contact route on my profile is the way to reach me.
