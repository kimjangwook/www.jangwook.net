---
title: '写在 head 里的 robots meta，为什么落到了 body'
description: 'Google 在 2026 年 3 月往文档里加了一句：body 里的 robots meta 同样尊重。可 head 和 body 的分界不是作者声明的值，而是解析器算出来的结果。我把十种摆放位置送进 parse5，看元素落在哪儿，又在哪三种摆放下连元素都建不出来、指令也跟着消失。先确认落点再写。'
pubDate: '2026-08-13'
heroImage: '../../../assets/blog/robots-meta-head-body-parser-placement-2026/hero.png'
tags:
  - SEO
  - 爬虫
  - HTML
  - Web开发
  - 技术SEO
faq:
  - question: 'robots meta 放在 body 里真的没问题吗？'
    answer: '就 Google 而言没问题。Google 在 robots meta 规范文档里写明，不强制要求放在 HTML head 中，body 里的 robots meta 同样会被尊重。但别的搜索引擎没有写过同样的话，你自己的检查工具多半也没跟上。我实测下来，以 head 为起点查找元素的常见写法，把落到 body 里的指令全漏了。'
  - question: '明明写在 head 里，怎么会跑到 body 去？'
    answer: '因为解析器关闭 head 的位置，不一定是你写的那个 </head>。只要 head 里出现一个不能待在 head 的内容，解析器就在那里关掉 head、打开 body，再从那段内容重新处理。我的用例里，在标签前面先放一段文字或者一个 div，后面的 robots meta 就都成了 body 的子节点。'
  - question: '把 noindex 包在 noscript 里这种写法呢？'
    answer: '在开启脚本的解析器里，noscript 的内容会被当成纯文本，而不是真正的元素。HTML 标准就是这么定义 noscript 的，而 Google 公开说明自己用常青版 Chromium 渲染。我在开启脚本的解析中，树里根本不存在 meta 元素。'
  - question: '能用 JavaScript 添加或删除 robots meta 吗？'
    answer: 'Google 文档提醒，遇到 noindex 时可能跳过渲染和 JavaScript 执行，所以用 JavaScript 修改或移除 robots meta 未必按预期生效。如果希望页面被收录，文档给的建议是一开始就别在原始代码里写 noindex。'
relatedPosts:
  - slug: robots-snippet-controls-ai-overviews-2026
    score: 0.88
    reason:
      ko: 그 글은 지시자가 무엇을 정하는지를 다뤘고, 이 글은 그 지시자가 문서 트리 어디에 놓이는지를 다룬다. 값이 맞아도 요소가 없으면 값은 읽히지 않는다.
      ja: あちらは指示子が何を決めるかの話で、こちらはその指示子が文書ツリーのどこに落ちるかの話だ。値が正しくても要素がなければ読まれない。
      en: That post covered what the directives decide. This one covers where the directive lands in the document tree. A correct value in a node that was never built is not read at all.
      zh: 那篇讲的是指令决定什么，这篇讲的是指令最后落在文档树的哪里。值写对了，元素没生成，照样读不到。
  - slug: ai-crawler-control-robots-txt-llms-txt-2026
    score: 0.79
    reason:
      ko: robots.txt는 크롤러가 들어오기 전 층이고 robots meta는 들어온 뒤의 층이다. 두 층을 같이 봐야 "막았다고 믿었는데 안 막혔다"가 어디서 생기는지 보인다.
      ja: robots.txtはクローラーが入る前の層、robots metaは入った後の層だ。二つを並べて見ると「ブロックしたつもりが効いていない」がどこで生まれるか分かる。
      en: robots.txt is the layer before the crawler arrives; robots meta is the layer after. Reading both together is how you find where "I thought I blocked it" actually breaks.
      zh: robots.txt 是爬虫进来之前那层，robots meta 是进来之后那层。两层一起看，才知道"以为挡住了其实没挡住"是在哪儿出的。
  - slug: speakable-cssselector-pointer-rot-2026
    score: 0.74
    reason:
      ko: 마크업이 문자열로는 멀쩡한데 실행해 보면 다른 곳을 가리키고 있더라는 이야기를 그 글에서 먼저 했다. 이번에는 가리키는 쪽이 아니라 놓이는 쪽에서 같은 일이 벌어졌다.
      ja: マークアップは文字列としては正しいのに、動かすと別の場所を指していたという話をあの記事で先にした。今回は指す側ではなく置かれる側で同じことが起きた。
      en: That post made the case that markup can look correct as a string and still point somewhere else once you run it. Here the same thing happens on the placement side rather than the pointing side.
      zh: 那篇先讲过：标记作为字符串看着没问题，一跑起来却指向别处。这次同样的事发生在"落在哪里"这一侧，而不是"指向哪里"。
---

我把十份 HTML 文档送进一个符合规范的解析器，数了数 `<meta name="robots">` 最后落在哪里。留在 head 里的有两份。挪到 body 的有五份。剩下三份，压根没生成 meta 元素。

第三类才是我写这篇的原因。head 还是 body，是肉眼看得见的差别；有元素还是没元素，不解析就看不见。而对读取指令的一方来说，一个从未被构建出来的节点，比一个放错位置的节点糟糕得多。

![作者写下的标记与解析器构建出的树，在哪里分道扬镳](../../../assets/blog/robots-meta-head-body-parser-placement-2026/hero.png)

## 到底是谁关掉了 head

先把机制铺开，后面全靠它。

浏览器不会照单全收你写的 HTML 字符串。它先切成 token，再按固定规则构建元素树。这个过程叫树构建，中间带着一个状态，叫插入模式。解析器处理 `<head>` 期间，处在 in head 模式。

关键在于这个模式什么时候结束。大多数人默认它结束在自己敲的那个 `</head>`。并不是。只要出现一个不能待在 head 里的内容，解析器立刻关掉 head、打开 body，再把那段内容拿到 body 里重新处理。你写的 `</head>` 只是若干出口之一。

所以 head 与 body 的分界，不是作者声明的值，而是解析器算出来的结果。指令的值写得再准，落在分界的哪一侧也不由你说了算。至于这些值各自决定什么，我在[决定 AI Overview 会不会引用你页面的那行 meta](/zh/blog/zh/robots-snippet-controls-ai-overviews-2026) 里按指令逐条梳理过，这篇不重复。今天只谈位置。

## Google 三月加的那一句

Google 的 robots meta 文档一直是这么说的：「Place the robots `meta` tag in the `<head>` section of a given page.」放在 head 里。

而 [Search Central 文档更新记录](https://developers.google.com/search/updates) 里，2026 年 3 月 24 日那条写着：往 robots meta 文档里加了一条关于 Google 如何处理 HTML head 之外标签的说明。这条说明在 [robots meta 标签规范文档](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag)里是这样的：

> Google Search doesn't enforce placement of meta robots in the HTML head and will respect robots meta tags in the body section of an HTML document as well.

不强制位置，body 里的也照样尊重。推荐位置仍然是 head，只是把容忍范围写进了文档。

不过我不太赞成把这句读成「以后可以往 body 里写了」。几乎没人会特意把 robots meta 写进 body。现实中出现在 body 里的 robots meta，绝大多数是作者写在 head、被解析器搬出去的。

换句话说，这条说明真正做的事，不是给你新的自由，而是把一类原本悄无声息的事故，在 Google 这一侧变成了不算事故。事故本身还在。

## 十种摆放，一个规范解析器

我在临时沙箱里建了十份文档。塞进去的标签完全一样，都是 `<meta name="robots" content="noindex">` 这一行，变的只有这行所在的位置。解析器用的是 parse5 8.0.1，它实现了 HTML 标准的树构建算法，而且脚本标志可以开关，正好合用。

每份文档解析完，我遍历整棵树去找 `meta[name=robots]`，记下它的祖先链。找不到元素时，再确认原字符串是不是以文本节点的形式留在了某处。

![十种摆放位置在两种脚本标志下的判定矩阵](../../../assets/blog/robots-meta-head-body-parser-placement-2026/placement-matrix.png)

| 标记写法 | 脚本开启 | 脚本关闭 |
| --- | --- | --- |
| A. head 内（基准） | `head > meta` | `head > meta` |
| B. head 内，注释之后 | `head > meta` | `head > meta` |
| C. head 内，散落文字之后 | `body > meta` | `body > meta` |
| D. head 内，`<div>` 之后 | `body > meta` | `body > meta` |
| E. body 首个子节点 | `body > meta` | `body > meta` |
| F. body 末个子节点 | `body > meta` | `body > meta` |
| G. `<noscript>` 之内 | 无元素（文本） | `head > noscript > meta` |
| H. `<template>` 之内 | 独立片段 | 独立片段 |
| I. head 内，`<title>` 未闭合 | 无元素（文本） | 无元素（文本） |
| J. body 内，`<div>` 之内 | `body > div > meta` | `body > div > meta` |

C 和 D 就是上一节说的那类事故。head 里先放一段 `hello`，紧跟其后的 meta 就成了 body 的子节点。换成一个 `<div>`，结果一样。注释本来就允许出现在 head 里，所以 B 毫发无损。

这点差别在真实站点上很要命。埋点脚本、服务端注入的横幅、模板引擎留下的一个非空白字符，任何一样都能提前关掉 head。而且被挤出去的不只有 robots meta，canonical 和 hreflang 会一起出去。

C、D，加上我故意放的 E、F、J，全都落在 Google 现在明说会尊重的范围里。到这里为止，是可以放心的部分。

## noscript 里的 noindex，效果正好反过来

这轮里我盯得最久的是 G。

把 `noindex` 包进 `<noscript>`，看上去像一种防守动作，意思是「就算脚本不跑，指令也还在」。实际行为恰好相反。

HTML 标准对 `noscript` 的说明相当直白。原文在 [WHATWG HTML 标准的 noscript 元素一节](https://html.spec.whatwg.org/multipage/scripting.html#the-noscript-element)：

> The `noscript` element is only effective in the HTML syntax, it has no effect in the XML syntax. This is because the way it works is by essentially "turning off" the parser when scripts are enabled, so that the contents of the element are treated as pure text and not as real elements.

脚本开着，里面的内容就是纯文本，不是元素。不是元素，树里就不会生成 meta 节点；没有节点，也就没有可尊重的对象。

那 Google 站在开着还是关着这一边？[JavaScript SEO 基础](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)一句话给了答案：「Google Search runs JavaScript with an evergreen version of Chromium.」开着这一边。

也就是说，塞进 `<noscript>` 的 robots 指令，在 Google 看到的那棵树里根本不存在。不是因为位置不对被忽略，而是压根没东西可读。

这里还有第二重分叉，值得知道。同样的标记喂给 jsdom 30.0.1，只改选项：

```
runScripts=undefined      -> meta 元素存在: true  | noscript 文本长度: 0
runScripts=outside-only   -> meta 元素存在: true  | noscript 文本长度: 0
runScripts=dangerously    -> meta 元素存在: false | noscript 文本长度: 38
```

默认值说「有」，真把脚本打开，同一个库说「没有」。同一串字符，同一个解析器，结论完全相反。而团队把 jsdom 接进 CI 时，绝大多数是默认值原样不动。检查放行的指令 Google 根本看不到，这个组合就是这么来的。

H 和 I 简单得多。`<template>` 里的内容进的是独立的 DocumentFragment，不在文档树上，`document.querySelector` 够不着，自然也不会被当成指令。I 是 `<title>` 忘了闭合，而 `title` 会把内容当文本吞掉，于是后面的标记整段变成了标题字符串。这一个跟脚本标志无关，元素照样消失。

## 我自己的检查比 Google 还严

知道指令落在哪儿之后，我转过头看找它的那一侧。内部 lint 也好，SEO 爬虫也好，预渲染校验也好，确认 robots meta 的代码通常就是一行选择器。我挑了最常见的两种写法，把同一批用例在 jsdom 30.0.1 上再跑一遍。

| 标记写法 | `document.head.querySelector` | `document.querySelector` |
| --- | --- | --- |
| A. head 内（基准） | 找到 | 找到 |
| C. head 内，散落文字之后 | 漏掉 | 找到 |
| D. head 内，`<div>` 之后 | 漏掉 | 找到 |
| E. body 首个子节点 | 漏掉 | 找到 |
| G. `<noscript>` 之内 | 找到 | 找到 |
| H. `<template>` 之内 | 漏掉 | 漏掉 |
| I. head 内，`<title>` 未闭合 | 漏掉 | 漏掉 |
| K. 解析后由 JS 插入 | 原始 false / 执行后 true | 原始 false / 执行后 true |

以 head 为起点的写法，在 C、D、E 三处漏掉了指令。而这三处恰恰是 Google 白纸黑字说会尊重的位置。我的检查比 Google 还严。

严本身不是毛病，方向错了才是。它在指令确实存在并且生效的页面上报「没有指令」；到了 G 又反过来报「有指令」，而 Google 那棵树里什么都没有。两种错误，指向相反。

遍历整份文档的写法，把 C、D、E 都准确抓住了，代价是原样放行 G。单靠任何一种选择器，都盖不住这张表。

## 靠渲染器才生成的东西，保证都更弱

K 是初始 HTML 里没有 robots meta、脚本随后往 `document.head` 上追加的情形。解析完没有，脚本跑完有了。单看很平常，但这个「随后」在搜索这边是带条件的。

同一份 JavaScript SEO 文档这样描述渲染顺序：

> Googlebot queues all pages with a `200` HTTP status code for rendering, unless a robots `meta` tag or header tells Google not to index the page.

紧跟着的提醒才是要害：

> When Google encounters the `noindex` tag, it may skip rendering and JavaScript execution, which means using JavaScript to change or remove the robots `meta` tag from `noindex` may not work as expected.

遇到 noindex，渲染和 JavaScript 执行可能整个被跳过，那么用 JavaScript 去抹掉这个 noindex 就可能永远不会发生。Google 自己给的建议是：想让页面被收录，一开始就别在原始代码里写 noindex。

把这句话和解析实测叠在一起，能收成一条规则。**初始 HTML 里的字节是你能拿到的最强保证，凡是要等渲染器动起来才有的东西，都比它弱。**`<noscript>`、`<template>`、JS 插入，弱的理由各不相同：前两个即使渲染器跑起来也不会生成元素，最后一个则是渲染器不跑就什么都没有。

如果想连爬虫进门之前那一层一起看，我写在[用 robots.txt 正确管控 AI 爬虫](/zh/blog/zh/ai-crawler-control-robots-txt-llms-txt-2026)里了。这篇讲的是进门之后那一层。

## 上线前该问解析器的五件事

把结果落成检查项，是这样：

1. **查找范围放到整份文档。**用 `document.querySelector`，别用 `document.head.querySelector`。以 head 为起点，会把 Google 尊重的位置报成「缺失」。
2. **找到之后再看祖先链。**只要祖先里有 `template` 或 `noscript`，这条指令就按不存在处理。不能只判断有没有，还得判断在哪儿。
3. **开着脚本解析。**Google 用常青版 Chromium 渲染，检查侧的解析条件对齐过去。jsdom 的默认值站在另一边。
4. **head 还是 body，算警告不算错误。**放在 body 里 Google 照样尊重。但在 body 里发现它，本身就说明 head 提前关了，顺手看看 canonical 和 hreflang 是不是也被挤出去了。
5. **noindex 要么写进初始 HTML，要么干脆不写。**别用 JavaScript 来回开关。这是 Google 文档的建议，不是我的个人口味。

第 2 条和第 3 条落成代码，大致就这么多，够短，方便直接塞进现有的检查里。

```js
import { parse } from 'parse5';

export function findRobotsDirective(html) {
  const doc = parse(html, { scriptingEnabled: true }); // 与 Google 相同的条件
  const stack = [{ node: doc, path: [] }];
  while (stack.length) {
    const { node, path } = stack.pop();
    const name = node.tagName ?? node.nodeName;
    if (node.tagName === 'meta') {
      const attrs = Object.fromEntries(node.attrs.map((a) => [a.name, a.value]));
      if ((attrs.name ?? '').toLowerCase() === 'robots') {
        return { content: attrs.content, path: [...path, name] };
      }
    }
    // template 的内容在 content 片段里，不在 childNodes 上
    if (node.tagName === 'template') stack.push({ node: node.content, path: [...path, name] });
    for (const child of node.childNodes ?? []) stack.push({ node: child, path: [...path, name] });
  }
  return null;
}

// 用法：祖先里夹着 template 或 noscript，就是读不到的指令
const found = findRobotsDirective(servedHtml);
const dead = found?.path.some((n) => n === 'template' || n === 'noscript');
```

我也拿自己的站跑了一遍。从构建产物里挑三个页面，用同一个解析器看，head 有 60 个子节点，其中不能待在 head 的元素是 0 个。没有提前关闭。

不过这不算什么值得炫耀的结果。`BaseHead.astro` 只在设了 `noindex` 时才输出 robots meta，所以大多数页面本来就没有这个标签。head 之所以安静，不是因为守得好，而是因为没有可挤出去的东西。真正输出指令的地方，比如 404 页面，才是危险区间，而这次我没数它。

测量边界也讲清楚。我测的是 parse5 和 jsdom 如何实现 HTML 标准，不是 Googlebot 做了什么。两个库实现的是标准算法，Google 用的是 Chromium，树构建规则相同所以结果应该一致，这是推断，不是实测。Bing 和其他爬虫我没测，也不做任何断言。另外，指令待在正确的位置，说的是收录和展示的资格，跟排名没有关系。

## 剩下的问题是：只有 Google 变宽容了

写的过程里，有件事一直硌着我。Google 决定不强制位置，更像是工程团队接受了现实：这世上的 HTML 是坏的，从坏掉的 head 里把指令捞出来，比丢掉它对用户更有益。这个判断站得住。

硌人的地方在于，这份宽容只出现在一处。我的构建流水线照旧按 head 来检查，别的搜索引擎也没把同一句话写进文档。更要紧的是，head 提前关闭这件事本身仍然是个 bug。robots meta 活下来了，不代表它旁边那条 canonical 也活下来了。

所以我决定不把这条说明读成「body 也行」。读成「在 body 里发现它，就去查 head 是在哪儿关的」，在实务里更好用。这个读法能管多久，我说不准。等别的引擎也写上同一句，等框架把 head 管理整个接管过去，这条检查项就可以删掉了。现在还不到时候。还有不写在 HTML 里的控制。Search Console 资源上的生成式 AI 开关，不会出现在 PR 里。我接着看了[官方 GEO 划掉的清单和那只开关](/zh/blog/zh/official-geo-subtraction-gsc-control-2026/)。

追查指令在渲染流水线的哪一环消失，是我吃饭的活计之一。要聊的话走[联系页面](/zh/contact/)。

---

*来源：Google Search Central 的 [Robots Meta Tags Specifications](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag)、[JavaScript SEO Basics](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)、[Latest Google Search Documentation Updates](https://developers.google.com/search/updates)，以及 WHATWG 的 [HTML Standard, The noscript element](https://html.spec.whatwg.org/multipage/scripting.html#the-noscript-element)（均为官方）。正文中四处英文块引用，都是当场抓取原文页面逐字比对过的字符串，引用旁边放了原文链接。测量环境：临时沙箱目录下的 10 份用例文档，parse5 8.0.1，jsdom 30.0.1，Node 22.22，macOS，2026 年 8 月 13 日测量。探针脚本为 `scripts/probe-robots-meta-placement.mjs` 和 `scripts/probe-robots-meta-consumer.mjs`，原始数据为 `data/robots-meta-placement.json` 和 `data/robots-meta-consumer.json`，图由 `scripts/chart-robots-meta-placement.py` 生成。测量对象是两个库的树构建结果，不是 Googlebot 的实际处理结果。Bing 等其他爬虫的行为未做验证。robots 指令决定的是收录与展示资格，不是排名。*
