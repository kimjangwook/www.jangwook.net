---
title: '刚要点按钮，页面却跳了一下 — 把 CLS 从 0.559 压到 0.014 的实测记录'
description: '加载时布局乱跳不是审美问题，而是一个能量化的指标。我把同一个页面做了两版，用 layout-shift PerformanceObserver 测 CLS，只靠给图片预留盒子、给动态内容预留槽位，就把 0.559（POOR）压到了 0.014（GOOD）。过程有代码，也有日志。'
pubDate: '2026-07-15'
heroImage: '../../../assets/blog/cls-layout-shift-reserve-space-measure-2026/hero.png'
tags:
  - Core Web Vitals
  - CLS
  - 网页性能
  - 无障碍
relatedPosts:
  - slug: lcp-image-preload-scanner-fetchpriority-2026
    score: 0.74
    reason:
      ko: 그 글은 브라우저가 이미지를 언제 발견하느냐(LCP)를 실측했고, 이 글은 그 이미지가 자리를 잡느냐(CLS)를 잰다.
      ja: あちらはブラウザが画像をいつ発見するか(LCP)を実測し、こちらはその画像が場所を確保できるか(CLS)を測る。
      en: That post measured when the browser discovers the image (LCP); this one measures whether that image holds its place (CLS).
      zh: 那篇实测浏览器何时发现图片（LCP），这篇测同一张图是否守住位置（CLS）。同一张主图同时牵动两个指标，成对读能把 Core Web Vitals 的前后串起来。
  - slug: ai-crawlers-dont-render-javascript-csr-2026
    score: 0.58
    reason:
      ko: 자바스크립트로 콘텐츠를 나중에 끼워 넣는 습관이 크롤러에겐 안 보이는 콘텐츠를, 사용자에겐 밀리는 화면을 만든다.
      ja: JSで後からコンテンツを差し込む癖は、クローラーには見えないコンテンツを、ユーザーにはずれる画面を作る。
      en: Injecting content late with JavaScript hides it from crawlers and shifts it for users.
      zh: 用 JS 事后插入内容，对爬虫是看不见的内容，对用户是跳动的页面。本文的横幅插入例子与那篇 CSR 问题同根同源。
  - slug: a11y-lighthouse-audit-fix-2026
    score: 0.56
    reason:
      ko: 레이아웃 이동은 성능 지표이자 접근성 문제다. 운동 장애가 있는 사용자에게 밀리는 버튼은 오조작으로 직결된다.
      ja: レイアウトのずれは性能指標であると同時にアクセシビリティの問題でもある。
      en: Layout shift is a performance metric and an accessibility problem at once.
      zh: 布局偏移既是性能指标，也是无障碍问题——对有运动障碍的用户，跳动的按钮意味着误触。那篇的 Lighthouse 实测工作流在这里同样管用。
---

你伸手去点结账按钮，指尖刚落下，整个页面往下一滑，结果按到了旁边的链接。多半是上面某张图片加载晚了，或者一条横幅硬挤了进来。烦躁只是一瞬间，但这不是情绪问题。Google 把这种"跳动"量化成一个数字，叫 <strong>Cumulative Layout Shift（CLS，累积布局偏移）</strong>，而这个数字，正是判断页面好坏的一条标准。

这次我把同一个 HTML 页面做了两版。一版原封不动地塞进了最常见的错误，另一版把它们改好。然后用浏览器计算 CLS 时所依赖的那个 API，分别测了两版。先说结论：从 0.559 降到了 0.014。下面这些数字，全部来自那个沙箱的实测。

## CLS 量的是"总移动量"，不是"移动了几次"

先把地基打好。Core Web Vitals 由三个指标构成：LCP（最大元素何时绘制）、[INP（对交互反应多快）](/zh/blog/zh/inp-yielding-measure-2026/)、还有 CLS（画面偏移了多少）。前两个是时间，以毫秒计；唯独 CLS 是一个没有单位的分数。这一点，恰恰是 CLS 最容易被误读的原因。

CLS 把页面存活期间发生的<strong>意外布局偏移</strong>累加起来。单次偏移的分数，是两个值相乘得到的：屏幕上有多大区域动了（impact fraction），以及这块区域移动了多远（distance fraction）。一个占据视口一半的元素，往下挪了视口高度的一半，分数大约是 0.5 × 0.5 = 0.25。一条小脚注挪几像素，和半个屏幕整块下沉，分量完全不同。

这里有个必须纠正的误解。CLS 不数"偏移发生了几次"。一次偏移把整屏推下去，光这一下就能把你打进 POOR。反过来，十次细碎偏移，只要每次都极小，加起来也可能微不足道。而且关键的是，用户点击或点按之后 <strong>500 毫秒以内</strong>发生的偏移，会被排除在外。你按了"展开"，手风琴随之打开——那是预期之内的移动。`layout-shift` 条目上的 `hadRecentInput` 标志，就是用来划这条线的。

阈值写在 Google 的官方文档里。<strong>0.1 及以下为 GOOD，超过 0.25 为 POOR</strong>，中间那段属于需要改进（[web.dev, Cumulative Layout Shift](https://web.dev/articles/cls)）。0.1 这个数也不是随手定的：内部测试发现，0.15 及以上的偏移，人们会一致地觉得"碍事"，而 0.1 及以下虽然能察觉，却不至于难受（[web.dev, thresholds](https://web.dev/articles/defining-core-web-vitals-thresholds)）。

## 同一个页面，两种做法，错误是故意埋进去的

没有复现，就没有主张。我在沙箱里放了两个静态 HTML，就是那种图文混排的普通菜谱画廊。

`bad.html` 里，我原样塞进了实战中最常见的三个错误。

```html
<!-- 错误 1: 图片没有尺寸信息 → 加载时把下面的内容顶走 -->
<style>.hero img{width:100%}</style>
<div class="hero"><img src="cat.svg" alt="hero"></div>

<div class="card"><button>Save recipe</button></div>

<script>
  // 错误 2: 500ms 后往顶部插横幅 → 下面全部下移
  setTimeout(() => {
    const d = document.createElement('div');
    d.textContent = 'Subscribe now';
    document.body.insertBefore(d, document.body.firstChild);
  }, 500);
  // 错误 3: 900ms 后往 hero 上方插一条公告
  setTimeout(() => { /* 在 hero 上方插入 <p> */ }, 900);
</script>
```

要点在于，这三个不是三个独立的 bug，而是<strong>同一个错误的三张脸</strong>：没有提前告诉浏览器"这里给我留这么大地方"。图片要等下载完才知道自己多大，横幅和公告是后来由 JavaScript 造出来的。在那一刻到来之前，浏览器把这些位置当成 0 像素，等内容一到，突然撑开空间，把下面的一切全推下去。

`good.html` 的内容和时序完全一样。横幅照样 500ms 进来，公告照样 900ms 进来。唯一的差别，是它提前把地方告诉了浏览器。这个对照很关键。这个实验的论点不是"别晚插内容"，而是"晚插可以，但先把地方空出来"。

## 我用浏览器数 CLS 的那个 API 直接测

测量时，我没取 Lighthouse 分数那样的汇总值，而是把原始数据直接抠出来。用 `PerformanceObserver` 把 `layout-shift` 条目一条条收集起来。这正是 Chrome 计算 CLS 时在内部读取的那个事件。

```js
new PerformanceObserver((list) => {
  for (const e of list.getEntries()) {
    if (!e.hadRecentInput) {        // 排除用户输入后紧接着的偏移
      cls += e.value;               // value = impact × distance
      shifts.push({ value: e.value, t: Math.round(e.startTime) });
    }
  }
}).observe({ type: 'layout-shift', buffered: true });
```

我用 Playwright 启动系统 Chrome，以移动端视口（390px）分别加载两个页面，等动态插入在 2 秒时结束后读取累计值。选移动端，是因为屏幕越窄，同一个元素占的比例越大，CLS 也越"疼"。

<img src="../../../assets/blog/cls-layout-shift-reserve-space-measure-2026/shift-breakdown.png" alt="把 before 和 after 页面的 layout-shift 条目按事件拆开的表格。before：图片加载 0.446、横幅 0.066、公告 0.048，合计 0.559。after：合计 0.014。" />

| 事件（加载后时刻） | 原因 | before | after |
|---|---|---|---|
| ~148ms | hero 与缩略图在没有盒子的情况下解码 | 0.446 | 0.000 |
| ~694ms | 促销横幅插到 body 最顶部 | 0.066 | 0.000 |
| ~1070〜1135ms | 公告段落插到 hero 上方 | 0.048 | 0.014 |
| <strong>合计（CLS）</strong> | | <strong>0.559 (POOR)</strong> | <strong>0.014 (GOOD)</strong> |

最大的元凶是图片。全部偏移的 80% 都来自图片解码那一下。横幅和公告分别是 0.06、0.05，排在后面。有意思的是，三次偏移散落在 148ms、694ms、1135ms，却被合成了一个分数。这不是巧合。

CLS 不是简单求和，而是按<strong>会话窗口（session window）</strong>来算。偏移接连爆发，就归进一个窗口；安静超过 1 秒，就开一个新窗口；单个窗口最长 5 秒（[web.dev, optimize CLS](https://web.dev/articles/optimize-cls)）。我这三次偏移的间隔分别是 546ms、441ms，都不到 1 秒，于是归进了同一个窗口，所以我的简单求和（0.559）刚好等于真实的会话窗口 CLS。要是它们之间各隔 2 秒，情况就不一样了。这个差别，我后面会老实说清楚。

## 三行就搞定的修复 — 先把地方占住

`good.html` 里只改了三处。写成代码，短得让人有点意外。

<strong>1) 给图片写明 width/height。</strong>

```html
<img src="cat.svg" alt="hero" width="800" height="450">
```

这两个属性，早已不是几十年前那种"强制按这个像素渲染"的意思。现代浏览器会从这两个值算出<strong>宽高比</strong>，在文件到达之前就先按这个比例占好一个盒子。你用 CSS 给 `width:100%`，高度也会跟着这个比例走。响应式图片再配上 CSS 的 `aspect-ratio`，就更稳妥。

```css
.hero img { width: 100%; height: auto; aspect-ratio: 16 / 9; }
```

<strong>2) 把稍后要填的内容，先在 DOM 里空出位置。</strong>

别再用 `insertBefore` 把横幅硬塞进去，而是一开始就在文档里放一个空槽，只往里填文字。

```html
<div id="promo" style="min-height:64px"></div>
<script>
  // 地方已经有了，只放内容 → 零偏移
  setTimeout(() => {
    document.getElementById('promo').textContent = 'Subscribe now';
  }, 500);
</script>
```

用 `min-height` 保住最小高度，`:empty` 时用 `visibility:hidden` 藏起来，这样内容还没来时，布局也不会晃。凡是尺寸能提前知道的位置——广告、嵌入、横幅——都吃这一套（[Google Publisher Tag, minimize layout shift](https://developers.google.com/publisher-tag/guides/minimize-layout-shift)）。

<strong>3) 别往已有内容的上方插东西。</strong> 实在非插不可，就只在响应用户操作时插。这跟前面那条 500ms 规则是对上的：用户按按钮触发的偏移属于预期，会被 CLS 排除；而没有任何输入、脚本硬推的偏移，会原封不动地计入分数。如果你的页面靠 JavaScript 事后绘制内容，那多半你同时还在扛[爬虫不渲染你的 JavaScript](/zh/blog/zh/ai-crawlers-dont-render-javascript-csr-2026/) 这个问题。渲染时机，对性能和可爬取性是同时起作用的。

结果就在表里。三处修复里，光改图片一项就抹掉了 80% 的 CLS；把另外两项也处理掉，只剩 0.014。这残余的 0.014 来自公告插入的一次小偏移，大约是 GOOD 阈值的七分之一，实际使用中感觉不到。

## 老实说的局限 — 这个数字不保证排名

到这里就打住，是危险的。测出来了，不等于它就能换来搜索排名，那样说是夸大。有三点得说清楚。

其一，<strong>实验室（lab）数据和现场（field）数据是两回事。</strong> 我测的是受控环境下的合成读数。Google 拿来当排名信号的 CLS，是真实用户 Chrome 汇集的现场数据（CrUX）的第 75 百分位值。实验室测量在找原因、修问题上无可替代，但"这个数字就是我的排名"，它不是。上线之后，还得用现场数据再核一遍。

其二，<strong>Core Web Vitals 好，并不会单凭这一点把排名推上去。</strong> Google 把页面体验当信号用，但内容相关性的权重压倒性地高。CLS 0.014 传递的是"这个页面尊重用户"的信号，而不是排名上升的保证书。这也是 Google 的官方立场。糟糕的 CLS 会拖你后腿，但好的 CLS 不会单独把你顶上去。

其三，<strong>我的测量方法本身就带着一层近似。</strong> 我把 `layout-shift` 的值简单相加。这次所有偏移都落进了同一个会话窗口，和真实 CLS 对上了；但在偏移相隔好几秒才发生的长寿命页面（无限滚动、SPA）上，简单求和与会话窗口值会分道扬镳。需要准确值时，就该用 Google 发布的 `web-vitals` JavaScript 库，它把会话窗口的逻辑替你实现好了。另外，这个实验没涉及 Web 字体替换（FOUT）引起的偏移，那也是常见的 CLS 来源。

想通了这些局限，实测的用处反而更清楚了。实验室测量不是排名预言，而是一件<strong>调试工具</strong>：亲眼看清什么在动、动了多少，再把原因一个个剥掉。这就是这套工作流的全部，也是它的核心。同样的姿态，也支撑着[用 trace 把 LCP 瓶颈拆开的那次记录](/zh/blog/zh/lcp-image-preload-scanner-fetchpriority-2026/)和[实测 content-visibility 渲染成本的那次记录](/zh/blog/zh/content-visibility-auto-render-cost-measure-2026/)。有时候该被怀疑的是量具本身。[prerender 页面的 LCP 报成 6.2 秒](/zh/blog/zh/prerender-activationstart-cwv-measurement-2026/)，并不是页面慢，而是没把起点减掉。别猜，去测。

## 今天就能跑一遍的清单

要用到自己站点上，照这个顺序走一遍即可。

- <strong>所有 `<img>` 和 `<video>` 都写上 width/height 了吗？</strong> 如果因为响应式、像素是浮动的，就用 CSS 的 `aspect-ratio` 把比例锁住。光这一步，通常就能清掉 CLS 的大头。
- <strong>广告、嵌入、横幅的位置，用 min-height 预留空间了吗？</strong> 尺寸不确定，就先按最常见的高度占住，填进来后在这个盒子里处理。
- <strong>有没有用 JavaScript 往已有内容上方插东西？</strong> Cookie 横幅、公告条、懒加载小组件都是惯犯。只要不是响应用户输入，就提前把地方空出来。
- <strong>Web 字体替换时，布局会不会跳？</strong> 用 `font-display` 和 `size-adjust`，缩小后备字体和 Web 字体的度量差。
- <strong>改完之后，用现场数据核过了吗？</strong> 实验室里出 GOOD，到了真实用户环境（慢设备、慢网络）也可能不一样。用 `web-vitals` 库或 CrUX 看看实际使用值。

CLS 不是什么花哨的优化。它可以浓缩成一句话——提前把地方告诉浏览器——而只要你守住它，回报是实打实的。而且在成为性能指标之前，它更是一种礼貌：别让用户伸手要点的按钮，临了跑掉。

---

从把结构化数据在服务端稳妥地输出，到给现有站点的 Core Web Vitals、无障碍做实测体检，我把网页开发当实务来做，也以个人身份承接咨询与实现的委托。如果像布局乱跳、LCP 偏慢这种"得靠数字去抓"的问题正在你这边堆积，欢迎通过我资料页上的联系方式随时来聊。
