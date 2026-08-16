---
title: '把列表页从链接图里拿掉，296篇就再也走不到了：抓取深度实测'
description: '每篇文章都挂着中位数8条内链，我以为内链已经够了。对1,330个构建产物页做广度优先遍历后，1,288篇文章中有1,276篇位于深度2。可是一旦把四个语言的列表页从链接图里拿掉，296篇从首页再也走不到。相关文章模块再多，也替代不了四个语言列表页这个入口。从首页出发时，四个列表页才是通往深度2的门。'
pubDate: '2026-07-30'
heroImage: '../../../assets/blog/crawl-depth-flat-archive-audit-2026/hero.png'
tags:
  - SEO
  - 内链
  - 可抓取性
  - 信息架构
  - Web开发
faq:
  - question: '抓取深度是Google真正使用的排名因素吗？'
    answer: 'Google公开的排名相关说明里没有"点击深度"这一项。本文的深度是我自己定义的指标，含义是"只沿链接从首页走到该页所需的最少跳数"。官方文档保证的范围窄得多，只到"能被抓取的链接必须是带href的a元素"这一条。至于深度浅就能提升排名，没有任何官方依据。'
  - question: '只要URL在sitemap.xml里，链接走不到也没关系吗？'
    answer: '发现这一步靠站点地图也能完成，所以"链接不可达"并不等于"不会被收录"。但站点地图只是一份URL清单，它不携带上下文：这个页面隶属于什么、属于哪个主题簇、读完之后该看哪一篇。这些只有链接能表达。因此我把两者当成不同职责，而不是彼此的备份。'
  - question: '文章挂了很多相关文章链接，内链是不是就够了？'
    answer: '我的站点恰好就是这种错觉的样本。每篇的入链中位数是8条，入链为0的文章一篇都没有。可把列表页从图里拿掉重新遍历，1,288篇中有296篇从首页不可达。推荐图是有向图，即使链接数量很多，也会形成从根节点无路可进的团块。'
  - question: '列表页做分页不行吗？'
    answer: '可以做，前提是通往下一页的链接必须是真正的a href。Google文档明确要求用a href从每一页链到下一页，好让搜索引擎理解分页之间的关系，同时说明它已不再使用rel=next/prev。如果后续页只藏在"加载更多"按钮或无限滚动背后，第一页之后的文章就失去了链接路径。'
relatedPosts:
  - slug: ai-crawlers-dont-render-javascript-csr-2026
    score: 0.71
    reason:
      ko: 그 글은 크롤러가 JS를 실행하지 않을 때 본문이 비는 것을 쟀고, 이 글은 같은 조건에서 링크 경로가 끊기는 것을 잰다. 렌더 전 HTML이 전부라는 전제를 두 방향에서 확인한다.
      ja: あちらはJSを実行しないクローラーの前で本文が空になることを測り、こちらは同じ条件でリンク経路が切れることを測る。レンダリング前のHTMLだけが残るという前提を、二つの角度から確かめた記録だ。
      en: That post measures how the body empties out when a crawler skips JavaScript; this one measures how the link paths break under the same condition. Two angles on the same premise, that the pre-render HTML is all you get.
      zh: 那篇测量的是爬虫不执行JS时正文如何整块消失，本文测量的是同样条件下链接路径如何断裂。两个角度验证同一个前提：渲染之前的HTML就是全部。
  - slug: sitemap-lastmod-crawl-scheduling-2026
    score: 0.66
    reason:
      ko: sitemap의 lastmod가 재방문 시점의 신호라면, 크롤 깊이는 첫 도달 경로의 문제다. 사이트맵이 무엇을 대신할 수 없는지가 둘을 붙여 읽으면 분명해진다.
      ja: sitemapのlastmodが再訪のタイミングに関する信号なら、クロール深度は最初にたどり着く経路の問題だ。発見と再発見をそれぞれ扱うので、並べて読むとサイトマップが代替できない部分がはっきりする。
      en: If sitemap lastmod is a signal about when to come back, crawl depth is about how a crawler arrives the first time. Read together, they make clear what a sitemap cannot stand in for.
      zh: 如果sitemap的lastmod是关于"何时回访"的信号，抓取深度则关乎"第一次如何抵达"。一篇讲发现、一篇讲再发现，并读就能看清站点地图替代不了什么。
  - slug: hreflang-reciprocity-audit-multilingual-2026
    score: 0.58
    reason:
      ko: 4언어 사이트의 링크 관계를 빌드 산출물에서 전수 검사한다는 점이 같다. 그때는 언어판 상호 참조를 셌고, 이번에는 홈에서 각 글까지의 경로를 센다.
      ja: 4言語サイトのリンク関係をビルド成果物から全数検査する点が同じだ。あのときは言語版どうしの相互参照を数え、今回はホームから各記事までの経路を数えている。
      en: Same method, a full sweep over the build output of a four-language site. Last time I counted reciprocal references between language versions; this time I count the path from the homepage to every article.
      zh: 方法相同：对四语言站点的构建产物做全量检查。上次数的是语言版本之间的互相引用，这次数的是从首页到每篇文章的路径。
  - slug: recommendation-system-v3
    score: 0.54
    reason:
      ko: 도달성 검사에 걸린 대상이 바로 그 추천 시스템이 만든 링크 그래프다. 추천 품질과 크롤 도달은 다른 축이라는 것이 이번 실측으로 드러났다.
      ja: 本稿の到達性チェックに掛けた対象が、まさにあの推薦システムが生成したリンクグラフだ。推薦の質とクロール到達は別軸だと今回の実測が示している。
      en: The link graph put under the reachability test here is the one that recommendation system generates. This measurement shows recommendation quality and crawl reachability are separate axes.
      zh: 本文接受可达性检验的，正是那套推荐系统生成的链接图。这次实测说明推荐质量与抓取可达是两条不同的轴。
---

每篇文章都挂着八条左右的内链，我据此认定内链结构没问题。那个数字什么也没保证。

念头是前一天冒出来的。为了测表格标记，我在构建产物里翻来翻去，忽然觉得自己数链接的方式不对。这些年我看内链只问一句：指向这篇文章的链接有几条。可爬虫花的不是链接数量，是路径。哪怕挂了二十条，只要这二十条全部来自首页走不到的文章，对从根节点出发的爬虫来说就跟零条一样。

于是我写了个脚本，从 `/` 出发对1,330个构建好的HTML页做广度优先遍历。六十行左右，不用浏览器。结论分两段。现有结构非常健康：1,288篇文章中1,276篇位于深度2，不可达为0。接着我把四个语言的列表页从链接图里抽掉，296篇当即从首页变成不可达。入链中位数8条的推荐图，一篇都没救回来。

## 抓取深度数的是路径，不是数量

本文说的抓取深度，指"从首页(`/`)出发只沿链接走，到达该页所需的最少跳数"。首页是深度0，被首页直接链接的页面是深度1。这就是图论里的最短路径，跑一次广度优先遍历，全站的值一次算完。

为什么这个值比入链数量更要紧？因为搜索引擎和AI爬虫认识一个站点的基本途径就是跟着链接走，而这里"链接"的定义比想象中窄。Google官方文档写得很硬：

> Google can only crawl your link if it's an `<a>` HTML element (also known as *anchor element*) with an `href` attribute.

([Links Google can crawl](https://developers.google.com/search/docs/crawling-indexing/links-crawlable)，Google Search Central) 同一份文档对靠脚本事件充当链接的元素也划了界：“Google can't reliably extract URLs from `<a>` elements that don't have an `href` attribute or other tags that perform as links because of script events.” 靠点击处理器跳转的卡片、挂了路由的 `<div>` 列表、加载更多按钮，在屏幕上看着都像链接，在链接图里并不存在。

深度变深之后究竟坏在哪里，官方并没有给出断言。Google没有公开点击深度的阈值，也没说链接结构能保证排名。倒是抓取预算那份文档交代了前提：“Google defines a site's crawl budget as the set of URLs that Google can and wants to crawl.” 紧接着它自己划定了读者范围：“If your site doesn't have a large number of pages that change rapidly, or if your pages seem to be crawled the same day that they are published, you don't need to read this guide.”([Large site owner's guide to managing your crawl budget](https://developers.google.com/search/docs/crawling-indexing/large-site-managing-crawl-budget))

我的站点正落在"不必读这份指南"那一档。所以我不把深度当成预算问题，而是拿它回答一个朴素得多的问题：**对只会跟着链接走的访客来说，这篇文章存在吗。** 那个访客可能是人，可能是Googlebot，也可能是一个从不执行JavaScript的AI爬虫。关于最后这类访客还能看到什么，我在[AI爬虫不渲染JavaScript时还剩下什么](/zh/blog/zh/ai-crawlers-dont-render-javascript-csr-2026/)里单独测过。可达性只有建立在那个前提上才有意义。

## 对着构建产物跑的六十行

测量对象是 `npm run build` 产出的 `dist/`，不是开发服务器。理由有两条：它和真正上线的字节完全一致；客户端后来才长出来的链接从一开始就不计入。不计入正是目的。

规则尽量保守。只承认 `<a href>` 是链接；带 `rel="nofollow"` 的锚点跳过；图片、CSS、JS、订阅源这类资源扩展名丢掉；片段标识和查询串截去后再归一化；绝对URL只保留本域。

```javascript
// 抽取链接：仅 <a href>，排除 nofollow
const linksOf = (url) => {
  const html = readFileSync(pages.get(url), 'utf8');
  const out = new Set();
  for (const m of html.matchAll(/<a\b[^>]*?href\s*=\s*["']([^"']+)["'][^>]*>/gi)) {
    if (/\brel\s*=\s*["'][^"']*nofollow/i.test(m[0])) continue;
    const t = norm(m[1], url);          // 归一化 + 排除资源扩展名
    if (t && pages.has(t)) out.add(t);  // 只算真正构建出来的页面
  }
  return out;
};

// 从首页开始广度优先
const depth = new Map([['/', 0]]);
let q = ['/'], d = 0;
while (q.length) {
  const next = [];
  for (const u of q) for (const t of linksOf(u)) {
    inbound.set(t, (inbound.get(t) || 0) + 1);
    if (!depth.has(t)) { depth.set(t, d + 1); next.push(t); }
  }
  q = next; d++;
}
```

用正则解析HTML通常是坏习惯。这次审计的对象是我自己写的一套模板，锚点标签的形态可预测，就没换。要去测别人的站点，前面加个解析器更稳妥。

## 1,276篇在深度2，不可达为0

第一次跑出来的结果比我预想的好。

| 项目 | 数值 |
|---|---|
| 构建出的HTML页 | 1,330个 |
| 文章页（四语言） | 1,288篇 |
| 最大深度 | 3 |
| 深度1的文章 | 12篇 |
| 深度2的文章 | 1,276篇 |
| 不可达的文章 | 0篇 |
| 每篇入链中位数 | 8条 |
| 入链为0的文章 | 0篇 |
| 入链不超过2条的文章 | 0篇 |

非文章页里有5个没被走到：`/404/`、另一个应用的落地页及其下两页，以及广告网络用于验证所有权的HTML。这些本来就没有理由进链接图，我原样留着。

深度2之所以占绝对多数，看一眼结构就明白：首页到语言列表页(`/zh/blog/`)一跳，列表页到任意文章第二跳。列表页没有分页，一口气把322篇全排在一张页面上，于是四年前的文章和昨天的文章坐在同一个深度2。这不是设计出来的。那份列表是文章只有几十篇时写的，一路没动就到了三百篇。

## 抽掉四个页面，296篇跟着消失

真正让我在意的不是这个平坦结果，而是它由什么撑着。是推荐图足够密，还是一张列表页扛住了全部？光看"入链中位数8条"，会以为是前者。

于是我把四个语言列表页排除在链接采集之外，重跑同一次遍历。页面照样存在，只是爬虫收不到它上面的链接。列表改成客户端渲染、被塞进加载更多按钮背后、或者不小心挂上 `noindex, nofollow` 的时候，现实里发生的就是这件事。

![从首页可达的文章页深度分布。有扁平列表页时1,276篇聚在深度2；把列表页拿掉后深度一直摊到9，并且有296篇不可达](../../../assets/blog/crawl-depth-flat-archive-audit-2026/depth-distribution.png)

| 条件 | 最大深度 | 各深度文章数 | 不可达 |
|---|---|---|---|
| 现有结构 | 3 | 1: 12 / 2: 1,276 | 0篇 |
| 排除列表页 | 9 | 1: 12 / 2: 52 / 3: 129 / 4: 253 / 5: 274 / 6: 154 / 7: 83 / 8: 25 / 9: 10 | **296篇** |
| 列表只显示最新10篇 | 9 | 1: 12 / 2: 64 / 3: 121 / 4: 249 / 5: 274 / 6: 154 / 7: 83 / 8: 25 / 9: 10 | **296篇** |

296篇，占全站23%。在一个每篇都有入链、中位数还有八条的站点上，每种语言少一张页面，就有接近四分之一的文章从首页走不到。

原因在推荐图的性质。相关文章链接是有方向的：A推荐B，不代表B推荐A。而推荐又按相似度挑选，相似的文章自然抱团。结果就出现了一批彼此密集互指、却没有任何箭头从外面射进来的团块，也就是强连通的孤岛。岛内的文章即使有八条入链，从根节点依然不可达。**入链数量不是衡量可达性的指标。**

第三行更值得贴在墙上。它模拟的是列表只显示最新10篇、第一页活着但通往第二页的不是 `<a href>` 的情形。不可达仍然是296篇，一篇没少。第一页活着并不能救谁，只要后面那些页缺少可抓取的链接。Google关于分页的要求，落点正好在这里：

> To make sure search engines understand the relationship between pages of paginated content, include links from each page to the following page using `<a href>` tags.

([Pagination and incremental page loading](https://developers.google.com/search/docs/specialty/ecommerce/pagination-and-incremental-page-loading)，Google Search Central) 同一份文档对 `rel="next"`/`rel="prev"` 的说法是：“Google no longer uses these tags, although these links may still be used by other search engines.” 也就是说，传达关系的手段是正文里的锚点，不是头部的提示。

## 扁平列表的账单：670KB与7,257个DOM节点

那么把322篇排在一页上的代价是什么？我把生产构建放在本地服务，用Chrome测了一遍。

| 指标 | `/zh/blog/`（列表） | 单篇文章页 |
|---|---|---|
| 传输字节（gzip） | 86,431 | 24,168 |
| 解码后字节 | 670,699 | 83,719 |
| DOM节点 | 7,257 | 684 |
| 锚点 | 349（去重文章链接322） | 45 |
| 图片 | 320（其中319带 `loading="lazy"`） | 未测 |
| DOMContentLoaded | 387ms | 423ms |
| loadEventEnd | 1,861ms | 未测 |

655KB的原始HTML压到84KB。列表页几乎全是重复标记，gzip对这种内容特别有效。分语言看：ko 655.0KB（84.1KB）、ja 659.7KB（85.1KB）、zh 628.5KB（83.9KB）、en 604.4KB（66.7KB）。四种语言都是349个锚点、322条去重文章链接。

说实话，7,257个DOM节点让我有点在意，是文章页的十倍以上。不过缓冲已经在了：320张缩略图里319张带 `loading="lazy"`，首屏之外的图根本不会发起请求。DOMContentLoaded是387ms，反而比文章页的423ms更快。这组比较是本地服务加热缓存的条件，绝对值不能照搬到线上。能说的是，在这个条件下并没有观察到"列表页特别慢"的迹象。

我的判断是这样：这份账单**只结在一张页面上，能被测量，上限看得见。** 而296篇丢掉链接路径的损失既不局部，也说不清什么时候恢复。我付前一笔。这类页面真正危险的不是字节，而是布局稳定性和渲染成本，那一侧按[把CLS从0.559降到0.014](/zh/blog/zh/cls-layout-shift-reserve-space-measure-2026/)里的做法预留空间，基本就压住了。

## 如果要做分页，深度的算术先摆出来

哪天真想拆列表，账我先算好了。以322篇为准。

| 每页篇数 | 列表页数 | 仅"下一页"链接时的最坏深度 | 五格数字分页器的最坏深度 |
|---|---|---|---|
| 10篇 | 32页 | 33 | 9 |
| 20篇 | 16页 | 17 | 6 |
| 50篇 | 7页 | 8 | 4 |
| 100篇 | 4页 | 5 | 3 |
| 322篇（现状） | 1页 | 2 | 2 |

"仅下一页"就是 `1 → 2 → 3 → …` 那种典型的链式分页器。按每页10篇拆，最老的文章坐到深度33。同样是32页，数字分页器每次露五格，深度降到9。换句话说，分页器的UI怎么画，直接决定了信息架构的深度。我一直归在UI决策里的东西，其实是抓取路径设计。

由此得出的实务规则很简单：要做分页，别用只有下一页的分页器。用数字分页器，或者在列表之外另留一张把所有文章排在一页的索引页。后者就是老派的HTML站点地图页。和sitemap.xml不同，它人能读，爬虫也能当链接跟着走。

## 这次测量没有说的事

边界如实划出来。

**深度是我自己的指标。** 没有官方文档说Google把某个深度当作基准线，链接结构也不保证排名。官方保证的范围止于可抓取链接的形态(`<a href>`)和抓取预算这个概念的定义。本文的深度数字，只能读作"我搭的结构靠链接把自己说明到什么程度"。

**不可达不等于不能收录。** URL只要在sitemap.xml里，没有链接路径也可能被发现，所以这不是说296篇马上就会消失。不过站点地图推动发现的力度也不是无限的，改写`lastmod`之后重新抓取的间隔是否真的会动，我[另做过实测](/zh/blog/zh/sitemap-lastmod-crawl-scheduling-2026/)。再者，站点地图只是一份平铺的URL清单，不承载上下文：隶属于什么、属于哪个主题簇、接着该读哪一篇。这些只有链接能表达。用站点地图补发现，和用链接表达结构，不是互相的替代品。

**第二行和第三行是模拟。** 我没有观测Googlebot的真实行为，只是从自己的链接图里删掉特定边再重算最短路径。被验证的命题止于"那份列表一旦不再输出可抓取链接，我的链接图就从根节点丢掉296篇"。

**只数了静态HTML。** 客户端生成的链接没有进入计算。这是设计，不是缺口。目标本来就是测一个不执行脚本的爬虫看到的图。

**入链中位数8条是我这个站的数。** 那张图由我自己的推荐生成器产出，形态对我特殊。同样的实验换个站点，数字会变。可复现的是方法，不是数字。

## 收尾：链接别按数量数，要从根节点量

今天的结论留成清单。不分站点规模，半小时能跑完。

1. **在构建产物上测。** 不是开发服务器，也不是CMS里的数据，而是真正上线的HTML；只收集 `<a href>`，从首页做广度优先遍历。客户端生成的链接掉出来才是正常的。
2. **把不可达数量当KPI，而不是入链数量。** 只看入链为0（孤儿页）的审计，会让强连通孤岛整块通过。该看的是从根节点不可达的数量和深度分布。边的数量填满之后，剩下的问题是这些边在说什么，我把锚文本当作[标题被声明的七个渠道之一做过一次审计](/zh/blog/zh/title-declaration-channels-anchor-text-audit-2026/)，那是另一篇。
3. **跑一次枢纽移除模拟。** 把列表、标签、分类这类枢纽页逐个从图里抽掉，看不可达数量跳多少。抽掉一页就飞走几百篇，那一页就是单点故障。知道之后仍然保留，和压根不知道，是两种状态。
4. **别把内容藏在加载更多和无限滚动背后。** 靠脚本事件跳转的元素不是可抓取链接（Google官方）。要用无限滚动，就同时提供一套 `<a href>` 分页器。
5. **分页器避开"只有下一页"。** 322篇按10篇拆，最坏深度33；同样页数换成数字分页器，降到9。深度是UI选择的结果。
6. **扁平列表的成本要测出来，别靠猜。** 我这边是传输86KB、DOM 7,257个、320张缩略图里319张懒加载。这个量级我付。关键是先看数字再决定，而不是凭"应该挺重"就动手改结构。

那么你的站点现在正丢着多少篇？把这个问题换算成数字，就是我做的事：信息架构审计、内链重构、爬虫可达性测量。想知道答案的话，[个人页](/zh/about/)上的联系方式一直开着。

---

*出处：Google Search Central 的 [Links Google can crawl](https://developers.google.com/search/docs/crawling-indexing/links-crawlable)、[Pagination and incremental page loading](https://developers.google.com/search/docs/specialty/ecommerce/pagination-and-incremental-page-loading)、[Large site owner's guide to managing your crawl budget](https://developers.google.com/search/docs/crawling-indexing/large-site-managing-crawl-budget)（均为官方）。测量环境：本站Astro构建产物1,330个页面，用Node 24脚本做广度优先遍历，并用Chrome对该构建的本地预览计测。深度指标与枢纽移除结果都是本站数值，不是Google的抓取模型。*
