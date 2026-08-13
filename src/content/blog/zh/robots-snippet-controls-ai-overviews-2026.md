---
title: '决定 AI Overview 能否引用你页面的那一行 meta —— 实测 robots 摘要指令'
description: '一行 nosnippet 已经不只是关掉搜索摘要。Google 官方文档明确写道：这条指令还会阻止内容被用作 AI Overview、AI Mode 的输入。我做了一个坏页面和一个好页面，再写解析器逐一审计，测出 max-snippet 与 data-nosnippet 的真实效果，以及"最严格者胜"这条规则如何咬人。'
pubDate: '2026-07-18'
heroImage: '../../../assets/blog/robots-snippet-controls-ai-overviews-2026/hero.png'
tags:
  - SEO
  - GEO
  - AI Overview
  - 结构化数据
relatedPosts:
  - slug: ai-crawler-control-robots-txt-llms-txt-2026
    score: 0.78
    reason:
      ko: 그 글이 "AI 크롤러를 robots.txt·llms.txt로 들어오게 할지 말지"의 앞단이라면, 이 글은 "들어온 뒤 무엇을 인용하게 둘지"의 뒷단이다. 접근 허용과 표시 제어는 다른 레버이고, 둘을 섞으면 사고가 난다.
      ja: あちらが「AIクローラーを robots.txt・llms.txt で入れるか」の前段なら、こちらは「入った後に何を引用させるか」の後段だ。アクセス許可と表示制御は別のレバーで、混同すると事故になる。
      en: That post is the front gate — whether AI crawlers get in via robots.txt and llms.txt. This is the back gate — what they may quote once inside. Access and display are different levers; conflating them causes accidents.
      zh: 那篇讲的是"用 robots.txt、llms.txt 决定是否放 AI 爬虫进来"的前门，这篇讲的是"进来之后允许它引用什么"的后门。放行与展示控制是两个不同的开关，混为一谈就会出事。
  - slug: ai-crawlers-dont-render-javascript-csr-2026
    score: 0.7
    reason:
      ko: 이 글에서 "data-nosnippet을 자바스크립트로 켜고 끄지 말라"는 공식 경고가 나오는데, 그 이유가 저 글의 핵심이다. 크롤러가 JS 실행 결과를 못 보면, 런타임에 붙인 속성도 없는 셈이 된다.
      ja: この記事の「data-nosnippet を JavaScript で付け外しするな」という公式警告の理由が、あちらの核心だ。クローラーがJSの実行結果を見なければ、実行時に付けた属性も無いのと同じになる。
      en: This post carries Google's warning not to toggle data-nosnippet with JavaScript, and the reason is exactly that post's thesis. If a crawler never sees your JS output, an attribute added at runtime effectively does not exist.
      zh: 本文引用了 Google"不要用 JavaScript 增删 data-nosnippet"的官方警告，而原因正是那篇的核心。若爬虫看不到 JS 执行结果，运行时添加的属性等于不存在。
  - slug: validate-structured-data-ci-jsonld-2026
    score: 0.68
    reason:
      ko: 눈으로 meta 태그를 훑어서 "가장 제한적인 것이 이긴다"를 판정하는 건 위험하다. 그 글에서 JSON-LD를 CI로 검증했던 것처럼, 스니펫 지시자도 파서로 자동 감사하는 게 맞다. 이 글의 audit.mjs가 바로 그 발상이다.
      ja: 目視で meta タグを追って「最も制限的なものが勝つ」を判定するのは危うい。あちらで JSON-LD を CI で検証したのと同じく、スニペット指示子もパーサーで自動監査すべきだ。この記事の audit.mjs がまさにその発想だ。
      en: Eyeballing meta tags to decide "most restrictive wins" is fragile. Just as that post validated JSON-LD in CI, snippet directives deserve an automated parser audit — which is exactly what audit.mjs in this post does.
      zh: 靠肉眼扫 meta 标签来判断"最严格者胜"很不可靠。正如那篇在 CI 里校验 JSON-LD，片段指令也应当用解析器自动审计——本文的 audit.mjs 正是这个思路。
  - slug: llm-seo-aeo-practical-implementation
    score: 0.66
    reason:
      ko: AI 답변에 인용되게 만드는 콘텐츠 전략(AEO)이 그 글의 주제였다면, 이 글은 그 전략을 자기 손으로 무효화하지 않는 기술적 전제 조건이다. 아무리 잘 써도 nosnippet이 걸려 있으면 인용 후보에서 통째로 빠진다.
      ja: AIの回答に引用させるコンテンツ戦略（AEO）があちらの主題なら、こちらはその戦略を自分で無効化しないための技術的前提だ。どれだけ良く書いても nosnippet が付いていれば、引用候補から丸ごと外れる。
      en: If that post is the content strategy for getting quoted in AI answers (AEO), this is the technical precondition for not sabotaging it yourself. However well you write, a stray nosnippet drops the whole page out of the citation pool.
      zh: 如果那篇讲的是让内容被 AI 回答引用的策略（AEO），这篇就是不让你亲手废掉该策略的技术前提。写得再好，只要挂着 nosnippet，整页都会被排除在引用候选之外。
---

我一直以为一行 robots meta 只是关掉搜索结果标题下面那句摘要。现在这行字还决定着 Google 的 AI Overview 能不能引用你的页面。Google Search Central 已经把文档改写得很明确。可很多站点仍旧带着多年前某人粘进布局模板里的一行 `nosnippet`，就这样把整站内容挡在 AI 搜索之外，谁都没察觉。

今天我没有只是读这些指令。我做了一个故意写坏的页面，再做一个改好的，然后写了个小小的审计脚本去解析 HTML，判断每个页面里"AI 实际上能引用什么"。下面每一段日志，都是那个沙箱里跑出来的真实输出。

## 摘要、AI Overview，以及 robots meta 到底管什么

先理清概念。**摘要（snippet）**是搜索结果里标题下方那句概述。以前它纯粹是"引你点击的预览"。**AI Overview** 和 **AI Mode** 是 Google 挂在搜索顶部（或对话界面）的生成式回答，它把多个页面的内容概括成一段话，并引用原页面作为依据。关键的变化就在这里：Google 决定，这些生成回答会不会把某个页面当作**输入**来用，由和旧摘要指令同一套开关控制。

那个开关就是写在 `<meta name="robots">` 里的摘要指令。这里常有一个混淆点。`robots.txt` 和 robots meta 标签是完全不同的两个开关。[用 robots.txt 与 llms.txt 控制 AI 爬虫是否能进来](/zh/blog/zh/ai-crawler-control-robots-txt-llms-txt-2026/)决定"能不能进"，robots meta 标签决定"进来之后，索引和展示时能拿出什么、怎么展示"。所以次序很要命。如果你在 robots.txt 里挡掉抓取，Google 根本读不到这页的 meta 标签。摘要指令要生效，页面必须可抓取、可索引。把"挡访问"和"调展示"搞混，得到的结果会和你想要的正好相反。

为什么现在要盯这件事？因为相当一部分搜索流量正从"一串链接"转向"一段被概括的回答"。被 AI 回答当作依据引用，本身已经成了一条曝光路径。而这条路径的门,就挂在一行很老的标记上。

## 官方规则 —— 四个指令，以及精确的取值

以下按 Google Search Central 的 robots meta 文档来梳理，不是猜测，是文档原文。

`nosnippet`。定义是："不在此页的搜索结果中显示文本摘要或视频预览。"接着是决定性的一句。这条规则适用于"所有形式的搜索结果（网页搜索、Google 图片、Discover、AI Overview、AI Mode），并且**会阻止内容被用作 AI Overview 和 AI Mode 的直接输入。**"也就是说，`nosnippet` 已经不是"隐藏摘要"，而是"把我从引用候选里剔除"。

`max-snippet:[数值]`。设定文本摘要的最大字符数。`0` 表示没有摘要（实际等同 `nosnippet`），`-1` 表示由 Google 自选长度，正整数则封顶到那个字数。文档对这条指令的说法一样：它"也会限制内容能在多大程度上被用作 AI Overview 和 AI Mode 的直接输入"。所以 `max-snippet:0` 是切断引用，`max-snippet:-1` 是全量可引。

`max-image-preview:[none|standard|large]`。搜索结果中图片预览的最大尺寸。要放到 `large` 才有大图预览的资格。默认往往是 `standard`，所以你想让首图大大地露出、却不动这个值，就只能停留在小缩略图。

`data-nosnippet`。这个是加在 HTML 元素上的属性，不是 meta 标签。当你只想把**某一个区块**排除出摘要、而非整页时用它。这里有两个坑。第一，文档明确写明它只在 `span`、`div`、`section` 三种元素上生效。`<p data-nosnippet>` 会被直接忽略。第二，文档警告"不要通过 JavaScript 给已有节点增删 data-nosnippet 属性"。原因很直白：[很多 AI 爬虫不渲染 JavaScript](/zh/blog/zh/ai-crawlers-dont-render-javascript-csr-2026/)，你在运行时挂上去的属性，在爬虫眼里等于不存在。它必须写死在服务器返回的初始 HTML 里。

## 一旦冲突，最严格的那条胜出

真实站点翻车的地方就在这。一个页面可能同时挂着好几条指令：一条通用 `robots` 标签、一条 `googlebot` 专用标签，再加上某个 CMS 插件塞进去的。谁说了算？文档回答得干脆："当 robots 规则相互冲突时，采用更严格的那一条。例如某页同时有 `max-snippet:50` 和 `nosnippet`，则采用 `nosnippet`。"

可怕的是它的方向性。规则从不往"更松"的方向合并，只往"更紧"的方向合并。你在 `googlebot` 标签里写 `max-snippet:160`，想着"给 Google 宽一点的摘要"，可只要通用 `robots` 标签里还留着 `nosnippet`，结果就是摘要为零。你以为门开着，其实上着锁。这正是为什么盯着两个标签来回看、然后判断"应该没问题"很危险。

于是我决定用解析器来审计它。

## 我做了两个页面，用解析器审计

在 repo 之外的临时沙箱里，我建了两个静态 HTML。一个是 `broken.html`，把现实里常见的错误照单塞进去；另一个是 `fixed.html`，按本意改好。

`broken.html` 的 `<head>` 和正文里有这些：

```html
<!-- 错误 1：nosnippet 写在通用 robots 上 —— 典型的模板级粘贴 -->
<meta name="robots" content="index,follow,nosnippet">
<!-- 错误 2：想用 googlebot 打开摘要，但上面的 nosnippet"最严格"，胜出 -->
<meta name="googlebot" content="max-snippet:160">
...
<!-- 错误 3：data-nosnippet 放在 p 上 → 不支持的元素，被忽略 -->
<p data-nosnippet>内部备注：想把它排出摘要，但 p 上不生效。</p>
```

`fixed.html` 把整页放开，只把要排除的那一个区块隔离到受支持的元素上：

```html
<!-- 页面级：允许全量摘要 + 大图预览 -->
<meta name="robots" content="index,follow,max-snippet:-1,max-image-preview:large">
...
<!-- 元素级：只排除内部备注，放在受支持的 span 上 -->
<span data-nosnippet>内部备注：排除出摘要。</span>
```

接着我写了 `audit.mjs`：用 `node-html-parser` 解析 HTML，把通用 `robots` 和 `googlebot` 两组指令都读出来，按"最严格者胜"合并，再检查每个带 `data-nosnippet` 的元素的标签名。合并的核心是这样：

```js
// 只要出现一个 nosnippet 或 max-snippet:0，就全量切断
function effectiveSnippetPolicy(dirsList) {
  let hardZero = false, cap = -1; // -1 = 由 Google 选长度
  for (const d of dirsList) {
    if (d.nosnippet) hardZero = true;
    if (d.maxSnippet === 0) hardZero = true;
    else if (d.maxSnippet > 0) cap = cap === -1 ? d.maxSnippet : Math.min(cap, d.maxSnippet);
  }
  if (hardZero) return { chars: 0, aiInput: 'blocked' };
  return { chars: cap, aiInput: cap === -1 ? 'full' : `capped@${cap}` };
}
```

两个文件跑出来的真实输出：

```text
========================================================
FILE: broken.html
  effective text snippet : 0 chars
  AI Overview text input : blocked
  image preview          : standard(default)
  data-nosnippet elements: 1
  [ERROR] PAGE_SNIPPET_BLOCKED
  [WARN]  CONFLICT_MOST_RESTRICTIVE: robots=nosnippet 与 googlebot=max-snippet:160 冲突 → 更严格的 nosnippet 胜出（官方）。
  [INFO]  IMAGE_PREVIEW_LIMITED
  [ERROR] DATA_NOSNIPPET_BAD_ELEMENT: <p data-nosnippet> 被忽略。仅 span/div/section 生效（官方）。
========================================================
FILE: fixed.html
  effective text snippet : full (Google chooses)
  AI Overview text input : full
  image preview          : large
  data-nosnippet elements: 1
  findings               : none — clean
========================================================
```

![robots 摘要指令审计结果 —— broken.html 阻断 AI 输入，fixed.html 全量放行](../../../assets/blog/robots-snippet-controls-ai-overviews-2026/audit-report.png)

数字说得很清楚。`broken.html` 无论内容多好，都被整页剔出 AI Overview 的输入。那位在 `googlebot` 标签里写下 `max-snippet:160`、相信"摘要是开着的"开发者，其实站在一扇上了锁的门前。`fixed.html` 全量可引，大图预览也开着，只精确排除了一行——那条内部备注。审计脚本抓到的四个问题（整页阻断、元素误用、冲突、图片受限），都是真实站点上反复出现的模式。

审计时一定要针对**服务器实际返回的 HTML**。浏览器开发者工具的 Elements 面板显示的是 JavaScript 执行之后的 DOM，若有运行时改动过的 meta 标签，就会和爬虫看到的不一致。用 `curl -s <URL> | grep -i 'name="robots"'` 直接取原始响应更稳妥。我踩过的坑正是这个：开发者工具里显示得干干净净是 `max-snippet:-1`，服务器原始响应里却还留着 CMS 塞进去的 `nosnippet`。真相在最初的字节里，不在渲染后的画面里。就算标签写在最初的字节里，解析器若没把它做成 `<head>` 里的元素，搜索引擎仍然读不到。[robots meta 实际落在哪里](/zh/blog/zh/robots-meta-head-body-parser-placement-2026/)，我用十种夹具量过。

别靠肉眼判断这些。就像我[在 CI 里校验 JSON-LD 结构化数据](/zh/blog/zh/validate-structured-data-ci-jsonld-2026/)那样，摘要指令也该在构建流水线里让解析器自动检查。某个标签落错的那一瞬间，人眼会漏，解析器不会。

## 诚实的边界 —— 是引用"资格"，不是引用"保证"

该把预期压下来了。放开 `max-snippet:-1` 和 `max-image-preview:large`，并不会让 AI Overview 就去引用你的页面。这些指令只打开**被引用的资格**，究竟引不引用由 Google 决定。它们也不会提升排名。Google 从未说过摘要指令是排名信号。去掉 `nosnippet` 就带来更多访客，这样的承诺哪里都没有。

反方向的取舍也要看诚实。挂 `nosnippet` 并不总是错。付费内容的正文、只该登录后可见的信息、一旦在结果里整段露出就没人点进来的页面，收紧摘要是合理的。只是现在做这个选择时要清楚：你放弃的是被 AI 回答引用的机会。以前你只是隐藏摘要，现在连同你在生成式搜索里的存在感一起隐去了。

我的立场是：面向公众的内容，尤其是人们为找答案而来的文档、指南、产品说明，几乎没有理由收紧摘要。真要收，就用 `data-nosnippet` 精确排除出问题的区块，而不是整页。整页 `nosnippet` 往往停留在"当年为什么加没人记得"的状态里，悄悄啃食你的引用机会。

## 开发者今天该做的

汇总成今天的检查清单：

- **先打开布局模板里的全局 robots meta。** 若公共头部里埋着 `nosnippet` 或 `max-snippet:0`，那一刻整站已经被排除在 AI 引用候选之外。
- **想被引用的内容，默认值就用** `max-snippet:-1, max-image-preview:large`。这是"可以把我当作 AI 回答依据"的明确信号。
- **要排除的是区块，不是页面。** 内部备注、样板文字、付费正文的引子，用 `data-nosnippet` 隔离到 `span`、`div`、`section` 上。`p` 或别的元素都不生效。
- **别用 JavaScript 切换 `data-nosnippet`。** 把它写进服务器返回的初始 HTML。在不渲染的爬虫面前，运行时属性等于不存在。
- **用解析器抓冲突。** 把通用 `robots` 和 `googlebot` 一起读进来，按"最严格者胜"合并出实际策略，用 CI 脚本核验，而不是靠眼睛。

如果你需要把结构化数据稳妥地在服务器端输出，或想从摘要与爬虫的角度审计现有站点、看它在 AI 搜索里如何被暴露，我个人接受咨询与落地实现的委托，可通过我资料页上的联系入口找我。一行老旧的 meta 挡住整条流量路径的情况，比你以为的更常见。
