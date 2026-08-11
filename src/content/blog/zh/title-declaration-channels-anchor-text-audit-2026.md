---
title: '声明标题的七个位置里，只有六个是我写的'
description: '一篇文章的标题会在 title、h1、og:title、headline、RSS 等六处被声明，1,296 篇全部一致。真正出问题的是第七处：指向文章的 18,296 条内部链接里，锚文本与目标标题完全一致的只有 0.7%，根源是包住整张卡片的那一个 a 标签。本文给出七个渠道的实测数据与可照做的修复路径。'
pubDate: '2026-08-01'
heroImage: '../../../assets/blog/title-declaration-channels-anchor-text-audit-2026/hero.png'
tags:
  - SEO
  - 无障碍
  - 锚文本
  - 结构化数据
  - Web开发
faq:
  - question: '把锚文本和标题对齐能提升排名吗？'
    answer: '没有这样的依据，我也不这么说。Google 的文档只是把锚文本和"指向该页面的链接内的文字"列为生成标题链接时会参考的来源，通篇没有提到排名。我动手改的理由是另外三条：屏幕阅读器念出来的链接名长达 367 字符；一条链接把日期、标题、摘要、标签整个吞了进去；而 Google 明确说会参考的这段文字，我一次都没有检查过。'
  - question: '既要整张卡片可点击，又要缩短链接文字，做得到吗？'
    answer: '做得到。让链接只包住标题文字，给卡片加 position: relative，再给链接的 ::after 加上 position: absolute 和 inset: 0。点击区域仍然是整张卡片，而锚文本和可访问名称缩成一行标题。代价也有：被遮罩覆盖的正文用鼠标不好选中。'
  - question: '把 JSON-LD 的 headline 和 title 对齐，标题链接会变吗？'
    answer: '不会。Google 列出的标题链接来源里并没有 Article 或 BlogPosting 的 headline。它是 Article 结构化数据的推荐属性，文档提醒长标题在部分设备上可能被截断，建议写得简洁。对齐它属于一致性维护，不是操控标题链接的手段。'
  - question: '这套标题通道审计怎么常态化？'
    answer: '解析构建产物，逐页取出 title、h1、og:title、headline 和 RSS 标题做字符串比对，只要有一处对不上就返回非零退出码。再加两条会更有用：指向内容页的锚文本长度上限，以及 title 的文字体系是否与 html lang 相符。我站上真正被抓出来的 bug 正是后者。'
relatedPosts:
  - slug: internal-link-trailing-slash-redirect-audit-2026
    score: 0.76
    reason:
      ko: 같은 dist 전수 스윕을 쓰지만 보는 곳이 다르다. 그쪽은 링크가 가리키는 주소의 형태를 셌고, 이쪽은 그 링크 안에 들어 있는 글자를 센다.
      ja: 同じdist全数スイープを使いながら、見ている場所が違う。あちらはリンクが指す住所の形を数えた。
      en: Same full sweep over build output, different target. That post counted the shape of the URL a link points at; this one counts the characters sitting inside the link.
      zh: 同样是对构建产物做全量扫描，看的地方却不同。那一篇数的是链接指向的地址形态，这一篇数的是链接内部装着的文字。语言切换器在两边都作为结构性噪声出现。
  - slug: accessible-name-agents-2026
    score: 0.71
    reason:
      ko: 링크의 접근성 이름이 무엇으로 계산되는지 알고 나면, 카드 전체를 감싼 앵커가 왜 367자짜리 이름을 만들어내는지가 바로 보인다.
      ja: リンクのアクセシブルネームが何から計算されるかを知ると、カード全体を包んだアンカーの挙動が一目でわかる。
      en: Once you know how a link's accessible name gets computed, it becomes obvious why an anchor wrapped around a whole card produces a 367-character name.
      zh: 一旦了解链接的可访问名称是如何计算出来的，就能立刻看懂包裹整张卡片的锚点为何会生成一个 367 字的名称。本文的修法正是反过来利用了那套规则。
  - slug: table-markup-a11y-llm-extraction-2026
    score: 0.64
    reason:
      ko: 마크업 하나를 바꿨을 때 접근성 트리와 텍스트 추출이 동시에 흔들린다는 점이 같다.
      ja: マークアップを一つ変えると、アクセシビリティツリーとテキスト抽出が同時に揺れる。
      en: Change one bit of markup and both the accessibility tree and text extraction shift at once.
      zh: 改动一处标记，可访问性树和文本抽取会同时受影响。表格里崩掉的是行的还原，链接里被埋掉的是标题。
  - slug: json-ld-graph-entity-linking-2026
    score: 0.58
    reason:
      ko: headline이 어느 엔티티에 붙어 있는지가 이 글의 채널 정리와 이어진다.
      ja: headlineがどのエンティティに付いているのかは、本稿のチャネル整理とつながる。
      en: Which entity carries the headline connects straight to the channel inventory here.
      zh: headline 挂在哪个实体上、那个实体又指向页面的哪个 URL，与本文的通道梳理是同一条线。结构化数据这一侧的标题正是搭在那套实体模型之上。
  - slug: hreflang-reciprocity-audit-multilingual-2026
    score: 0.55
    reason:
      ko: 언어별 파일이 한 벌로 움직이는 사이트에서는 한 언어판만 어긋나도 조용히 잘못된 신호가 나간다.
      ja: 言語別ファイルが一組で動くサイトでは、一つの言語版がずれるだけで静かに誤った信号が出る。
      en: On a site where the language files move as one set, a single drifting version quietly emits the wrong signal.
      zh: 在各语言文件成组移动的站点上，只要一个语言版本错位，就会悄悄发出错误信号。这次出问题的不是 hreflang，而是标题本身的语言。
---

用一个 `<a>` 把整张卡片包起来。日期、标题、摘要、标签，全都塞进这一条链接里。点哪儿都能进文章，实现起来最省事。我也这么写了很久。

这条链接里到底装了多少字，我从来没数过。把构建产物全部抠出来量了一遍，最长的一条 367 个字符。

## 标题只写一次，却要发布七遍

先把地基打好。在 Web 上，"页面标题"不是一个值，而是一束通道，每条通道的读者都不一样。

`<title>` 供给浏览器标签页、书签，以及搜索结果的原始素材。W3C 的 WCAG 2.2 在成功标准 2.4.2 Page Titled 里把它定为 A 级要求，标准原文是 "Web pages have titles that describe topic or purpose"。[理解文档](https://www.w3.org/WAI/WCAG22/Understanding/page-titled.html)说明，用户代理会把标题以易于获取的方式呈现，好让人识别页面；认知障碍、短期记忆受限或阅读障碍的用户，也从"靠标题识别内容"中受益。也就是说，标题先是无障碍要求，其次才是 SEO 资产。

`<h1>` 是屏幕上看得见的标题，是文档大纲的顶点，也是屏幕阅读器标题导航的起点。`og:title` 由社交卡片和聊天工具的预览读取，`twitter:title` 是它的变体。RSS 的 `<title>` 被订阅器画进列表。JSON-LD 的 `headline` 则是 Article 结构化数据的一个属性。

这里有一条界线值得先划清楚。Google 列出的标题链接来源里，并没有 `headline`。[Control your title links in search results](https://developers.google.com/search/docs/appearance/title-link) 点名的是：`<title>` 元素的内容、页面上主要的可见标题、`<h1>` 之类的标题元素、`og:title` meta 标签的内容、通过样式处理显得又大又醒目的文字、页面上的其他文字、页面内的锚文本、指向该页面的链接内的文字，以及 `WebSite` 结构化数据。`headline` 只是 [Article 结构化数据](https://developers.google.com/search/docs/appearance/structured-data/article)的推荐属性，文档在那里提醒长标题在部分设备上可能被截断，建议写得简洁；同一页还写着 "Google does not guarantee that features that consume structured data will show up in search results"。把 `headline` 和 `<title>` 对齐属于一致性维护，不是撬动搜索展示的杠杆。这条界线一模糊，话头就会滑向"用结构化数据买排名"。

然后是最后一条通道：别的页面指向这个页面时，链接里写的那段文字。它不在这个页面的文件里，而是散落在站内另外 1,300 张页面上，并且通常不是人写的，是组件写的。

## 六条通道全量比对，一处不差

我的站每种语言 324 篇，四种语言合计 1,296 篇。把构建产物 `dist/` 整个解析一遍，逐页抽出五条通道，再把单独生成的 RSS 拼进来比对。

```js
// 逐页抽出标题通道，按字符串比对
const $ = cheerio.load(readFileSync(file, 'utf8'));
const rec = {
  title:    norm($('head > title').first().text()),
  h1:       norm($('h1').first().text()),
  ogTitle:  norm($('meta[property="og:title"]').attr('content')),
  twTitle:  norm($('meta[property="twitter:title"]').attr('content')),
  headline: null,
};
$('script[type="application/ld+json"]').each((_, el) => {
  const data = JSON.parse($(el).contents().text());
  const nodes = Array.isArray(data) ? data : (data['@graph'] ?? [data]);
  for (const n of nodes) if (n?.headline && !rec.headline) rec.headline = norm(n.headline);
});
```

结果平淡得让人踏实。1,296 篇全都带齐五条通道，`title == og:title`、`title == h1`、`title == headline`、`h1 == RSS 标题`四组比对全部 100% 命中。长度也稳：最短 13 字符，中位数 46，p90 是 59，最长 70。超过 60 字符的有 97 篇，不过 60 是业界的经验数字，并非 Google 白纸黑字定下的上限，官方文档根本没给字数。当参考值看就好。

一致率 100% 的原因不是架构设计得好，而是它够简单：五条通道统统由 frontmatter 里的同一个 `title` 字段渲染出来，源头只有一个，漂移无处发生。反过来说警示就很明白了——如果你的 CMS 或 SSR 模板让各条通道读取不同字段，这个 100% 基本不会出现。那样的站点，这段脚本第一天就能捞到东西。

## 第七条通道，没有一个字是手写的

有意思的部分从这里开始。我把指向文章页的 18,296 条内部链接的锚文本全部取出来，逐条和目标页的 `<h1>` 比。

| 指标 | 修改前 |
|---|---|
| 指向文章的内部链接 | 18,296 条 |
| 锚文本与目标 `<h1>` 完全一致 | 121 条（0.7%） |
| 包含目标 `<h1>` 但更长 | 5,185 条（28.3%） |
| 两者都不是 | 12,990 条（71%） |
| 锚文本长度 p90 / p99 / 最长 | 144 / 290 / 367 字符 |
| 超过 151 字符的锚点 | 1,716 条 |

我把那条 367 字符的打开看了看：日期、阅读时长、标题、摘要、三个标签，最后跟着"阅读更多"。一整张博客卡片的内容，被压平成了一条链接。

祸根是一层包裹。

```astro
<!-- 修改前：整张卡片是一条链接 -->
<article class="post-card">
  <a href={href} class="post-card__link">
    <div class="post-card__media">
      <Image src={heroImage} alt={title} ... />
    </div>
    <div class="post-card__body">
      <time>{date}</time> · <span>{readingTime} 分钟</span>
      <h3>{title}</h3>
      <p>{description}</p>
      <div class="post-card__tags">...</div>
      <span>{readMoreLabel}</span>
    </div>
  </a>
</article>
```

这种写法随处可见，因为它是让整张卡片可点击的最省力方案。而账单会在三个地方同时到来。

第一是无障碍。链接的可访问名称由它内部的文字拼接算出，而我连缩略图的 `alt` 都填了标题，于是标题在名称里出现了两次。屏幕阅读器用户逐条浏览链接时，一个条目会被念成 367 字符的一整段。这套计算规则我在[讲可访问名称怎么定下来的那篇](/zh/blog/zh/accessible-name-agents-2026/)里梳理过，当时看的是按钮名称，这回同一套规则从反方向咬了我一口。

第二，Google 明确说生成标题链接时会参考的正是这段文字。文档写到，一旦在页面上检测到问题，它可能尝试从锚点、页面文字或其他来源生成更好的标题链接。而我站上每篇文章，都在用"日期＋标题＋摘要＋标签＋阅读更多"这么一大坨互相指认。

第三是所有读链接图的一方。对于只解析 HTML、不执行 JavaScript 的爬虫来说，锚文本几乎是描述两份文档关系的唯一线索。我在[实测 AI 爬虫不会渲染 JavaScript](/zh/blog/zh/ai-crawlers-dont-render-javascript-csr-2026/) 之后一直留意这条通路，结果自家的卡片正在把这条线索抹平。

## 链接只包标题，点击区域再拿回来

改法是现成的：锚点只包住标题文字，然后用伪元素把让出去的点击区域补回来。

```astro
<article class="post-card">
  <div class="post-card__media" aria-hidden="true">
    <Image src={heroImage} alt="" ... />
  </div>
  <div class="post-card__body">
    <time>{date}</time> · <span>{readingTime} 分钟</span>
    <h3><a href={href} class="post-card__link">{title}</a></h3>
    <p>{description}</p>
    <div class="post-card__tags">...</div>
    <span class="post-card__read" aria-hidden="true">{readMoreLabel}</span>
  </div>
</article>

<style>
  .post-card { position: relative; }

  /* 链接只包标题，整卡的点击区域交给遮罩 */
  .post-card__link::after {
    content: '';
    position: absolute;
    inset: 0;
  }

  .post-card__link:focus-visible {
    outline: 2px solid var(--flow-deep);
    outline-offset: 3px;
  }
</style>
```

有三个细节要跟着一起改。缩略图的 `alt` 置空——标题链接已经说清了去向，没必要让同一句话被念第二遍。"阅读更多"这类装饰性文字加上 `aria-hidden="true"`。悬停样式的选择器要从 `.post-card__link:hover` 挪到 `.post-card:hover`，忘了这一步，鼠标划过卡片就毫无反应。

焦点环也必须显式声明。链接缩到标题文字那么大之后，默认的焦点指示在卡片里就没那么显眼了。

遮罩方案的代价要老实写出来：被 `inset: 0` 盖住的正文，用鼠标拖选会变得别扭。如果你的界面需要用户复制卡片里的描述文字，这个模式就得重新考虑。博客列表卡片上这种场景很少，我就接受了。

同样的改动落在三处：博客列表的卡片组件、文章底部的相关文章列表，以及多语言落地页的最新文章卡片。相关文章列表比列表页更严重，因为标题下面还挂着一句推荐理由，锚点连那句话一起吞了。

## 改完再量一遍

同一段脚本，同一份语料。链接数量仍是 18,296 条，变的是里面的字。

| 锚文本长度 | 修改前 | 修改后 |
|---|---|---|
| 1〜30 字符 | 11,792 | 12,294 |
| 31〜70 字符 | 2,132 | 5,947 |
| 71〜150 字符 | 2,656 | 55 |
| 151〜300 字符 | 1,605 | 0 |
| 超过 300 字符 | 111 | 0 |
| p90 / p99 / 最长 | 144 / 290 / 367 | 52 / 67 / 111 |
| 与目标 `<h1>` 完全一致 | 121（0.7%） | 5,285（28.9%） |

![修改前后的锚文本长度分布。超过 151 字符的 1,716 条链接归零，与目标标题完全一致的锚点从 121 条增至 5,285 条。](../../../assets/blog/title-declaration-channels-anchor-text-audit-2026/anchor-text-length.png)

浏览器里也验了。用 Playwright 的无头 Chromium 打开列表页，视口宽 1100 像素，第一张卡片量出来 1036×329，卡内锚点恰好一个；在卡片盒子横向 75%、纵向 80% 的位置，也就是标签那一行的空白处调用 `document.elementFromPoint`，返回的是链接。说明遮罩把点击区域守住了。布局也没有走样。

![修改后的博客列表卡片。两栏网格和留白照旧，只有链接包裹的范围缩成了一行标题。](../../../assets/blog/title-declaration-channels-anchor-text-audit-2026/card-after.png)

表里有个数字容易被误读："与目标 `<h1>` 完全一致"只有 28.9%，剩下 71% 依旧和标题不同。这不是缺陷。按生成链接的组件拆开，面目就清楚了。

| 与标题不同的 12,990 条锚点 | 条数 | 判断 |
|---|---|---|
| 页头的语言切换器 | 5,184 | 正常。"KO 한국어"说的就是去向 |
| 文章页的语言切换器 | 3,888 | 正常。指向同一篇的其他语言版本 |
| 正文里的上下文链接 | 3,846 | 正常。本就该用句子自身的说法描述目标 |
| 其余 | 72 | 列表与导航 |

硬把正文的上下文链接统一成目标标题，只会更糟。在句子里，"AI 爬虫不会渲染 JavaScript"这种贴合读者的说法更顺。语言切换器同理，它和我在[尾部斜杠审计里单独摘出来的结构性误报](/zh/blog/zh/internal-link-trailing-slash-redirect-audit-2026/)是同一类。目标从来不是"所有锚点都得是标题"，而是"该说标题的位置，别说别的"。

改完之后仍有 55 条锚点超过 70 字符，全部是我在正文里手写的上下文链接，组件生成的一条都没剩。

## 逐条通道，各自该盯什么

按"谁读"和"谁写"把七条通道排开，判断就好下了。

| 通道 | 主要读者 | 谁在写 | 常见翻车 | 该做什么 |
|---|---|---|---|---|
| `<title>` | 浏览器、搜索、辅助技术 | 人（经模板） | 为空、重复、站名反复 | WCAG 2.4.2 A 级，逐页唯一 |
| `<h1>` | 屏幕、标题导航 | 人 | 缺失或一页多个 | 只留一个，与可见标题一致 |
| `og:title` | 社交与聊天预览 | 模板 | 与 title 各走各的 | 同源渲染 |
| `twitter:title` | 部分客户端 | 模板 | 忘了更新 | 与 og:title 保持一致或干脆省略 |
| JSON-LD `headline` | 结构化数据消费方 | 模板 | 误当成排名工具 | 推荐属性，写得简洁一致 |
| RSS `<title>` | 订阅器 | 订阅源生成器 | 与正文标题脱节 | 同字段渲染 |
| 入站锚文本 | 搜索、爬虫、屏幕阅读器 | <strong>组件</strong> | 吞掉整张卡片、越写越长 | 链接只包标题，点击区域交给遮罩 |

真正危险的只有最后一行。前六条都待在同一个文件里，肉眼可见，值不对一眼就看得出来。最后一行哪份文件里都没写，在你动组件之前，连数都数不出来。

从团队角度看，这是技术债非常典型的形状：声明点有七处，评审覆盖六处，剩下那一处只作为 UI 改动的副产品而变化。一张"让整张卡片可点击"的工单，本来也没有理由走 SEO 或无障碍评审。正因如此，这类问题得靠闸门拦，而不是靠谁多留个心眼。

## 标题的文字体系与正文不符，是文档点名的改写理由

同一次扫描顺手把 WCAG 2.4.2 全量查了一遍。1,336 张页面里有一张 `<title>` 为空，查下来是放在 `public/` 里的广告网络所有权验证桩页。它不是内容页，算作无障碍违规有点勉强，但构建产物里混进了一份没有标题的 HTML，这件事本身值得记一笔。

更有分量的是重复标题：两组页面拥有完全相同的 `<title>`，合计四张。

- `en/iterative-review-cycle-methodology` 正文是英文，`<title>` 和 `description` 却是韩文
- `ko/barracuda-cuda-amd-compiler` 正文是韩文，`<title>` 却是日文

Google 的标题链接文档把"标题与页面主要语言或文字体系不符"列为它可能改写标题链接的理由之一。我的页面正好落在文档点过名的情形里。四个语言版本成组运转的站点上，这种漂移并不稀奇：照抄某一版的 frontmatter，忘了替换标题，它就留在那儿了。两处都已修好，重复标题组归零。

抽取端也顺手确认了。把文章页喂给 Readability 0.6.0，返回的标题与 `<h1>` 完全相同。反过来，忽略 `<head>` 只把 `<body>` 转成纯文本，第一行是"跳到正文"，第二行是页头导航，一直到 `<h1>` 才出现标题。对只抓正文的管线来说，`<h1>` 实际上是唯一的标题信号。

## 我能确认的到此为止

把界线划清楚。

我量的是<strong>自己的站输出了什么</strong>，不是 Google 拿它做了什么。我没有观察到自己哪篇文章的标题链接被改写，也没有修改前后的展现数据。我不主张把锚文本对齐标题就能提升排名。官方文档没有把标题链接和排名挂钩，对结构化数据也明确表示不保证相关功能会出现在搜索结果里。

60 字符的标题长度同样是惯例而非官方数字。我有 97 篇越过这条线，我并不认为这本身构成重写的理由。

没有歧义的是无障碍那一侧。367 字符的链接名，怎么解释都不是好设计。该说标题的地方却把整张卡片念一遍的链接，无论搜索引擎如何处理，首先难为的是人。对我来说，这个理由已经够了。

## 检查清单：今天就能跑的四项计数

对着构建产物跑，不是开发服务器，是 `dist/`。一半的问题在源码里根本看不到，是组件造出来的。

1. <strong>通道比对</strong>：逐页取出 `title`、`h1`、`og:title`、JSON-LD `headline` 和 RSS 标题，按字符串比对，有一处不符即失败。
2. <strong>锚文本长度上限</strong>：统计指向内容页且超过阈值（我取 70 字符）的锚文本。若来自组件输出则判失败，若是正文里的上下文链接则通过。
3. <strong>标题唯一性</strong>：`<title>` 为空，或两张以上页面标题相同，判失败。WCAG 2.4.2 A 级正卡在这里。
4. <strong>标题语言一致</strong>：检查 `<title>` 的文字体系与 `html[lang]` 是否相符。多语言站点里，这一条抓到的最多。

做成闸门，骨架很短。

```js
const fails = [];
for (const page of articles) {
  if (page.title !== page.h1) fails.push(`h1 drift: ${page.path}`);
  if (page.title !== page.ogTitle) fails.push(`og:title drift: ${page.path}`);
  if (page.title !== page.headline) fails.push(`headline drift: ${page.path}`);
}
for (const a of componentAnchors) {
  if (a.len > 70) fails.push(`anchor ${a.len} chars: ${a.from} -> ${a.to}`);
}
if (fails.length) { console.error(fails.join('\n')); process.exit(1); }
```

一张卡片怎么包，决定了整站的链接文字长什么样。我数到第 1,296 篇才明白这件事。如果你手上的站从没数过组件生成的那些文字，数字大概和我的差不多。想一起打开看看的，从[个人主页](/zh/about/)留的联系方式找我。

---

*来源：Google Search Central 的 [Control your title links in search results](https://developers.google.com/search/docs/appearance/title-link)、[Article (Article, NewsArticle, BlogPosting) structured data](https://developers.google.com/search/docs/appearance/structured-data/article)，以及 W3C WAI 的 [Understanding SC 2.4.2: Page Titled](https://www.w3.org/WAI/WCAG22/Understanding/page-titled.html)。测量环境：本站 Astro 构建产物 HTML 1,336〜1,338 张，文章页 1,296 篇，用 Node 22.22 + cheerio 1.2.0 全量解析。浏览器验证使用 Playwright Chromium（无头，视口 1100px），抽取端验证使用 @mozilla/readability 0.6.0 与 html-to-text 10.0.0。所有数值均来自本站这一次构建，并非对 Google 处理方式的陈述。*
