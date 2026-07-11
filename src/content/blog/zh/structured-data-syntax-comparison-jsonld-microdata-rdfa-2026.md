---
title: 'JSON-LD vs Microdata vs RDFa — 结构化数据语法，何时用哪个(实测对比)'
description: '把同一个 Product 实体用三种语法各写一遍，喂进解析器，实测字节数和易碎程度。Google 三者同等对待。那么推荐 JSON-LD 的真正理由不是排名，而是能在改版中活下来的耦合度。用官方文档和可复现日志梳理出的选型标准。'
pubDate: '2026-07-11'
heroImage: '../../../assets/blog/structured-data-syntax-comparison-jsonld-microdata-rdfa-2026/hero.png'
tags:
  - 结构化数据
  - JSON-LD
  - SEO
  - Web开发
relatedPosts:
  - slug: localbusiness-structured-data-server-side-vs-js-2026
    score: 0.74
    reason:
      ko: 이 글이 "어떤 문법으로 쓸까"라면, 그 글은 "그 마크업을 크롤러가 실제로 보긴 하는가(SSR vs JS)"다. 문법을 정했다면 다음은 그게 서버에서 확실히 나가는지다.
      ja: この記事が「どの構文で書くか」なら、あちらは「そのマークアップをクローラーが実際に見るのか(SSR vs JS)」だ。構文を決めたら次はそれが確実にサーバーから出るかだ。
      en: This post picks the syntax; that one asks whether the crawler even sees the markup you wrote (SSR vs JS). Once you've chosen JSON-LD, the next question is getting it out server-side.
      zh: 这篇选的是"用哪种语法写"，那篇问的是"爬虫到底看不看得到你写的标记(SSR vs JS)"。语法定了，下一步就是让它从服务端确实输出。
  - slug: json-ld-graph-entity-linking-2026
    score: 0.7
    reason:
      ko: 문법으로 JSON-LD를 골랐다면, 그 다음 과제는 흩어진 JSON-LD 블록을 @graph 하나로 잇는 것이다. 그 글이 바로 그 연결성을 jsonld로 실측한다.
      ja: 構文でJSON-LDを選んだなら、次の課題は散らばったJSON-LDブロックを@graph一つに繋ぐことだ。あちらはその連結性をjsonldで実測する。
      en: If you chose JSON-LD as the syntax, the next task is wiring the scattered blocks into a single @graph. That post measures exactly that connectivity with jsonld.
      zh: 语法上选了 JSON-LD，下一课题就是把散落的 JSON-LD 块连成一个 @graph。那篇正是用 jsonld 实测这种连通性。
  - slug: ai-crawlers-dont-render-javascript-csr-2026
    score: 0.58
    reason:
      ko: 구조화 데이터를 JS로 심으면 AI 크롤러는 못 본다. 문법 못지않게 그게 raw HTML에 실려 나가는지가 관건이라는 걸 그 글이 샌드박스로 보여준다.
      ja: 構造化データをJSで差し込むとAIクローラーは見ない。構文と同じくらい、それがraw HTMLに載って出るかが要だと、あちらはサンドボックスで示す。
      en: Inject structured data via JS and AI crawlers miss it. That post shows in a sandbox why shipping it in the raw HTML matters as much as the syntax you chose.
      zh: 用 JS 注入结构化数据，AI 爬虫看不到。那篇用沙箱证明：它能否随 raw HTML 输出，和你选哪种语法一样关键。
---

这个争论我在代码评审里见过不止一次。一方力推 Microdata，理由是「标记就该贴在人能看到的 HTML 上才算数」。另一方力推 JSON-LD，理由是「丢一个 `<script>` 块就完事了」。而多半没有结论，最后一句「反正都能用，随便吧」收场。

那句「随便」，半年后会悄悄让你还账。今天我把同一件商品用三种语法各写一遍，喂进解析器。量了字节数，也复现了改版发生时什么活下来、什么无声无息地坏掉。下面的日志全是那个沙箱里跑出来的真实输出。先把话挑明：这从来不是 SEO 性能问题，是<strong>耦合度</strong>问题。

## 结构化数据是什么，为什么会有三种语法

先打地基。结构化数据是一套标准标签，贴上去让搜索引擎和 AI 爬虫能机械地读懂页面的含义。你明说「这段文字是商品名、这是价格、这是评分」，爬虫就把它当成确定事实,而不是靠猜。词汇(vocabulary)来自 [schema.org](https://schema.org),`Product`、`Offer`、`AggregateRating` 这些类型和属性都出自那里。

这里有个常被混淆的点。schema.org 定义「说什么」(词汇),而把它「怎么写进 HTML」(语法,syntax)是另一回事。同一套词汇能用三种语法写出来。

- **JSON-LD**:在页面某处放一个 `<script type="application/ld+json">` 块,里面用 JSON 把实体整块描述出来。画面上看不见。
- **Microdata**:在可见的 HTML 标签上直接加 `itemscope`、`itemtype`、`itemprop` 属性来标记。
- **RDFa**:同样在可见 HTML 上加 `vocab`、`typeof`、`property` 属性。RDFa 本来不是 schema.org 专用,而是能处理任意词汇的通用标准。

[Google 官方文档](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data)三种全都支持,并在其中推荐 JSON-LD。可同一个页面又说:三种格式只要实现正确,对 Google 而言「同等没问题(equally fine)」。这两句要连起来读才对。推荐归推荐,但三种里用哪种,在搜索上都不吃亏。那推荐的依据就不在排名,而在别处。

## 同一件商品写了三遍

不想停在空谈,所以我搭了个沙箱。Node v22,解析器用的是真实爬虫依赖的那一系开源库(`web-auto-extractor`、`microdata-node`、`jsonld`)。对象是一件普通商品:名称、品牌、价格/币种/库存、评分和评论数。

JSON-LD 长这样。

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Aeropress Go",
  "brand": {"@type": "Brand", "name": "Aeropress"},
  "offers": {"@type": "Offer", "price": "39.95", "priceCurrency": "USD",
             "availability": "https://schema.org/InStock"},
  "aggregateRating": {"@type": "AggregateRating", "ratingValue": "4.8",
                      "reviewCount": "1027"}
}
</script>
```

同样的内容搬到 Microdata,属性就散落到每一个可见标签上。

```html
<div itemscope itemtype="https://schema.org/Product">
  <h1 itemprop="name">Aeropress Go</h1>
  <span itemprop="brand" itemscope itemtype="https://schema.org/Brand">
    <span itemprop="name">Aeropress</span>
  </span>
  <div itemprop="offers" itemscope itemtype="https://schema.org/Offer">
    <span itemprop="price">39.95</span>
    <meta itemprop="priceCurrency" content="USD">
    <link itemprop="availability" href="https://schema.org/InStock">
  </div>
  <div itemprop="aggregateRating" itemscope itemtype="https://schema.org/AggregateRating">
    <span itemprop="ratingValue">4.8</span>
    <span itemprop="reviewCount">1027</span>
  </div>
</div>
```

RDFa 结构相近,把 `itemprop` 换成 `property`、`itemtype` 换成 `typeof`。三个文件喂进解析器归一化后,三个结果是完全相同的实体。name、brand、offers、aggregateRating 一个不少,以同样的形态还原出来。到这一步不意外。语法是什么,含义都一样。

## 字节数是它们第一次分道扬镳的地方

解析结果一样,但标记本身的重量不同。这是表达那一个 Product 实体各自花掉的字节数。

![三种语法的标记字节数对比 — JSON-LD 477B、RDFa 594B、Microdata 698B](../../../assets/blog/structured-data-syntax-comparison-jsonld-microdata-rdfa-2026/bytes-comparison.png)

| 语法 | 字节数 | Google 立场 | 存放位置 |
|------|-------|-----------|---------|
| JSON-LD | 477 B | 推荐 | 独立的 `<script>` 块 |
| RDFa | 594 B | 支持 | 内联在可见 HTML 上 |
| Microdata | 698 B | 支持 | 内联在可见 HTML 上 |

Microdata 比 JSON-LD 重了约 46%。原因很直白。内联语法要给每个值套一个包裹标签,还得反复声明 `itemscope`/`itemtype`,为了把不该显示的值塞进去,还动用 `<meta>`、`<link>` 这类绕路标签。

老实说,这个数字本身不是决定性的。差两百来字节动不了你的性能。但它是一件更要紧的事的症状:内联语法为了表达含义,是搭在 DOM 结构上的。这个「搭在上面」,会在下一个实验里露出真正的代价。

## 一次改版,评分就消失了

实际工作中标记坏掉的方式,不是语法错误,是改版。设计师把评分组件从商品正文挪到侧边栏。画面上毫无问题,星星照样好好地显示。可在 Microdata 里,那一刻 `aggregateRating` 就不再是 Product 的子节点了,因为 `itemprop` 是靠 DOM 的嵌套结构来判断归属的。

我复现了。把评分块挪进 `<aside>` 当作「改版后」的 HTML,再解析一遍。

```text
Product after redesign has aggregateRating? -> false
Keys: @context, @type, name, brand, offers
```

评分从 Product 上整块脱落了。只剩 `name`、`brand`、`offers`。这正是搜索结果里星级富媒体结果悄悄消失的场景。没人写错语法。`itemprop="aggregateRating"` 此刻仍好端端地在页面某处,只是丢了父节点。而且这种事构建不会报错,评审也逮不到。

换成 JSON-LD 呢?把评分组件挪去侧边栏、挪去页脚,随便挪,`<script>` 块纹丝不动。含义跟 DOM 位置是解耦的,改版碰不到它。这才是 Google 推荐 JSON-LD 的真正理由,不是排名,是「好维护」。用官方文档的原话就是「最容易实现和维护」。这一句在实务里到底意味着什么,我今天亲眼看到了:意味着它能在改版里活下来。这个耦合度问题,和[把结构化数据从服务端确实输出](/zh/blog/zh/localbusiness-structured-data-server-side-vs-js-2026)是连着的。语法定了,它是否真的抵达爬虫,是下一道关。

## 但有效的标记并不保证富媒体结果

这里必须挑明的界限。语法选得再对,标记再完美有效,也不保证富媒体结果、不保证排名上升。这不是我的看法,是 [Google 结构化数据政策](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)的官方立场。有效的结构化数据只是给你富媒体结果的「资格(eligible)」,并不锁定展示。Google 会连同质量、页面状态和多种信号一起看。

所以选了 JSON-LD 不等于星星就会出来。选语法不是「提高富媒体结果出现的概率」的活,更接近「一旦出现的富媒体结果,保它别在下一次改版里坏掉」。这个区分不能含糊。把选语法当成 SEO 性能优化来卖的文章,恰恰在这一点上不诚实,这是我的判断。

我也确认了 JSON-LD 在语义上没问题。用 `jsonld` 库展开成 RDF,得到 14 条三元组。不只是按语法解析得动,而是能整块解成标准的 RDF 图。

```text
JSON-LD expands to 14 RDF triples
_:b0 <http://schema.org/aggregateRating> _:b1 .
_:b0 <http://schema.org/brand> _:b2 .
_:b0 <http://schema.org/name> "Aeropress Go" .
_:b0 <http://schema.org/offers> _:b3 .
```

## JSON-LD 唯一的短板,以及它为什么是个陷阱

力推 JSON-LD 的文章往往不提它一个真实的短板:看不见。`<script>` 块跟画面是分离的,于是开发者会把 JSON-LD 的值和页面上真正显示的值分开维护。价格显示 39.95、JSON-LD 里却还留着改价前的 34.95,这种事故就是这么来的。Microdata 本来就是给可见文字打标记,这种偏差在结构上更不容易发生。

麻烦在于,这种偏差是实打实的 Google 政策违规。结构化数据必须和用户可见的内容一致。给看不见的信息打标记,或塞进跟画面不一致的值,可能失去富媒体结果资格,甚至吃到人工处罚。所以 JSON-LD 的「分离」是双刃剑。它抗改版,但值的真实性得靠人另行担保。

我的应对很简单:从不手写 JSON-LD。让渲染页面的那个数据源顺带把 JSON-LD 一起生成。画价格的变量和 JSON-LD 的 `price` 引用同一个变量,它俩从根上就没法偏。这就是为什么服务端生成不是图方便,而是一致性的机制。手工维护的 JSON-LD,等于换个形态把 Microdata 的脆弱又买回来。

## 那到底何时用哪个(决策标准)

既然三种语法对 Google 同等,选择就该按工程标准来,而不是搜索性能。我用的决策标准是这样。

- **默认 JSON-LD。** 99% 的情况都是它对。在服务端作为一个对象生成,每页一个块来管理,还能写单测验证。它跟 DOM 分离,抗改版。
- **Microdata/RDFa 只在无法注入 `<script>` 时用。** 被锁死的 CMS、模板编辑权限受限的环境、脚本被剥掉的邮件 HTML,这些场景下,贴在可见标签上的内联语法是唯一选项。
- **RDFa 只在要混用 schema.org 之外的词汇时用。** 如果纯用 schema.org,RDFa 的通用性没有实际收益。只有像政务、图书馆数据那样,需要多套词汇以 RDF 互操作的特殊场合,它才值回票价。

要避开的也很清楚。**别在同一页面用两种语法给同一个实体重复打标记。** 用 JSON-LD 写了 Product,又用 Microdata 把同一份再贴一遍,爬虫可能读成重复或冲突。选一种,一贯到底。

而且不管哪种语法,**都要在 CI 里验证。** 我在构建阶段把 JSON-LD 展开成 RDF,核对三元组数量和连通分量。正如今天的实验所示,标记可以在没有任何语法错误的情况下悄悄丢掉含义,人眼逮不到。这个「把散落的碎片连成一体再验证」的话题,我在[把 JSON-LD 归并成单个 @graph](/zh/blog/zh/json-ld-graph-entity-linking-2026)那篇里讲得更深。另外还得一并检查这份标记是不是[埋在了 AI 爬虫根本不执行的 JS 里](/zh/blog/zh/ai-crawlers-dont-render-javascript-csr-2026)。

## 实务中常被问到的问题

**我的站已经全用 Microdata 搭好了,现在必须换 JSON-LD 吗?** 不急。运行正常又没有改版计划,就那么放着,Google 也不会因此惩罚你。只要把「迁移到 JSON-LD」放进下一次大模板改造的路线图即可。改造本来就是内联标记最容易坏的时刻,那正是转换的好时机。

**为什么不能两种混用?多一份副本不是更保险?** 不保险。同一个实体用两种语法写,值一旦对不上,爬虫不知道该信哪个。那不是副本,是多加了一个冲突点。语法按每个实体统一成一种。

**验证是不是跑一下 Rich Results Test 就够了?** 那也需要,但在线工具是一页一页手动跑的,逮不住回归。我在构建流水线里解析并展开 JSON-LD,自动核对必填属性是否存在、连通性如何。今天复现的「改版把评分悄悄漏掉」那种事故,只有配了这样的 CI 门,才能在下次部署前逮住。

## 我今天确认的结论

语法之争从一开始就是个错的问题。问「哪个对 SEO 更有利」,没有答案,因为 Google 三者同等对待。对的问题是「哪个在我们的代码库里,半年后也不会坏」。这个问题答案很清楚:把含义从 DOM 上剥下来、作为独立块管理的 JSON-LD。

用测量来总结就是:三种语法解析结果一致(还原出同一实体),字节上 JSON-LD 最轻(477 对 594 对 698),改版脆弱性上,内联语法会无声地丢数据(评分脱落已复现)。Google 官方视三者同等,却因可维护性而推荐 JSON-LD。有效标记仍不保证富媒体结果这条界限,原封不动地留着。

想把结构化数据从服务端确实输出,或者想让人检查一遍现有站点的标记结构和验证流水线、保它经得起改版,我个人承接咨询与实现委托。欢迎从个人资料里的联系入口找我。
