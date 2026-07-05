---
title: '把 JSON-LD 拧成一个 @graph — 让散落的结构化数据变成搜索与 AI 能读懂的实体模型'
description: '把自己页面的 JSON-LD 丢进校验工具，结果散成了三座孤岛。本文用 @id 节点引用把 Organization、WebSite、Article 拧进一个 @graph，并用 jsonld 实测连通性：三个分量如何合并成一个，以及 Google 不保证的地方。'
pubDate: '2026-07-05'
heroImage: '../../../assets/blog/json-ld-graph-entity-linking-2026/hero.png'
tags:
  - 结构化数据
  - JSON-LD
  - SEO
  - GEO
  - Web开发
relatedPosts:
  - slug: localbusiness-structured-data-server-side-vs-js-2026
    score: 0.72
    reason:
      ko: 그 글이 "크롤러가 마크업을 보긴 하는가(SSR vs JS)"였다면, 이 글은 "본 마크업이 서로 이어져 있는가"다. 같은 구조화 데이터를 렌더링과 연결성이라는 다른 축에서 짚는다.
      ja: あちらが「クローラーがマークアップを見るか(SSR vs JS)」なら、この記事は「見たマークアップが互いに繋がっているか」だ。同じ構造化データをレンダリングと連結性という別の軸で扱う。
      en: If that post asked "does the crawler even see the markup (SSR vs JS)," this one asks "is the markup it saw connected to itself." Same structured data, a different axis — rendering versus linkage.
      zh: 如果那篇问的是「爬虫到底看不看得到标记(SSR vs JS)」，这篇问的是「它看到的标记彼此连没连起来」。同一批结构化数据，换成渲染与连通两条不同的轴。
  - slug: hreflang-reciprocity-audit-multilingual-2026
    score: 0.6
    reason:
      ko: 그 글은 hreflang을 30줄 스크립트로 직접 감사해 어긋난 링크를 잡아냈다. 이 글이 jsonld로 연결 컴포넌트를 세는 것과 같은 "문서 말고 직접 검증" 태도를 다국어 SEO에서 보여준다.
      ja: あちらはhreflangを30行スクリプトで自ら監査し、ずれたリンクを捕まえた。本記事がjsonldで連結コンポーネントを数えるのと同じ「ドキュメントではなく自分で検証」の姿勢を、多言語SEOで示す。
      en: That post audited hreflang with a 30-line script and caught the mismatched link. It shows the same "verify it yourself, not the docs" stance this article takes with jsonld's component count, applied to multilingual SEO.
      zh: 那篇用 30 行脚本亲自审计 hreflang，抓出了不对称的链接。它把本文用 jsonld 数连通分量的"不信文档、自己验证"态度，用在了多语言 SEO 上。
  - slug: ai-crawler-control-robots-txt-llms-txt-2026
    score: 0.55
    reason:
      ko: robots.txt가 "누구에게 읽게 할 것인가"라면, @graph 연결은 "읽게 허용한 크롤러에게 무엇을 어떻게 이해시킬 것인가"다. 두 글이 AI 크롤러 대응의 앞뒤를 이룬다.
      ja: robots.txtが「誰に読ませるか」なら、@graph連結は「読ませると許可したクローラーに何をどう理解させるか」だ。二つの記事がAIクローラー対応の前後を成す。
      en: If robots.txt is "who gets to read it," @graph linkage is "what the allowed crawler understands and how." The two form the before-and-after of handling AI crawlers.
      zh: 如果 robots.txt 是「让谁来读」，@graph 连接就是「让获准的爬虫理解什么、怎么理解」。两篇构成应对 AI 爬虫的前后两半。
---

用 `jsonld` 库对自己的标记做一次 `flatten`，会冒出一个数字：连通分量的个数。多数网站算出来是 2 或 3。一个 `Organization`、一个 `WebSite`、一个 `Article`，各自是一座孤岛。

我很久都没意识到这是个问题。每个页面塞进两三段 `<script type="application/ld+json">`，Rich Results Test 亮起绿勾就算完事。平心而论，每一段单独看都是有效的：语法没错，必填属性也填齐了。但搜索引擎或 AI 爬虫能不能把「发布这篇文章的组织」「写它的人」「那人所属的公司」串成一个整体来理解，完全是另一回事。碎片之间互不相识，就连不起来。

这次我没停在嘴上，而是实际量了一遍。用同一批信息做了一个散落版和一个用 `@id` 拧起来的 `@graph` 版，各自送进 W3C 的 JSON-LD 处理器展开、扁平化，把「会裂成几座岛」用数字取出来。下面的日志和表格，全是那个沙盒里的真实输出。

## 为什么「碎片化的 JSON-LD」如今更成问题

几年前，碎片化的标记基本无所谓。搜索引擎按页面抽取丰富结果，只要有一个规范的 `Article`，文章卡片就能出。可当搜索转向以实体为中心，再叠上 AI 搜索(生成引擎)之后，局面变了。

AI Overview 和聊天式搜索不只看单个页面，而是要读<strong>实体之间的关系</strong>。「这篇文章的作者是谁，那位作者属于哪个组织，那个组织的官方网站是什么。」当这些关系在标记里被明确写出，机器就直接照单全收，不必推断。反过来，如果 `Article` 的 `author` 只写着 `{"@type": "Person", "name": "Jane Doe"}`，那这个 Jane Doe 与网站的 `Organization` 是什么关系，标记里哪儿都没说，只能指望机器自己把它们串起来。

我认为开发者在这里该做的事很清楚：别依赖推断，把关系写下来。这正是 `@graph` 和 `@id` 存在的理由。给 AI 爬虫暴露什么、怎么暴露，我在[用 robots.txt 分开控制训练与引用的策略](/zh/blog/zh/ai-crawler-control-robots-txt-llms-txt-2026)里讲过；这篇是下一步。当你已允许某个爬虫来读，如何递给它一个<strong>正确的实体模型</strong>。

## @id 与节点引用：W3C 定义的连接方式

主角工具有两个：`@graph` 和 `@id`。

`@graph` 是一个容器，把多个实体装进一个数组。与其在页面上撒三段 `<script>`，不如在一段脚本里用 `@graph` 数组装下所有实体。到这一步只是收拾整齐。真正的关键是 `@id`。

`@id` 给每个实体一个唯一标识符。W3C 的 JSON-LD 规范把只含 `@id` 的对象称作<strong>节点引用(node reference)</strong>——其定义为「一个只包含 @id 属性的节点对象，可表示对文档中别处某节点对象的引用」。于是在 `Article` 的 `publisher` 里，不必重写整个组织，只写一行 `{"@id": "https://example.com/#org"}`，就指向「上面定义过的那个组织」。

标识符的取值有惯例：域名加片段(`#org`、`#website`、`#article`)。关键在于，这个 URI 不需要是能真正打开的页面。`@id` 是<strong>标识符</strong>，不是 URL。它唯一的职责是：在文档任何地方指向同一实体时，始终用同一个值。反过来，若给不同实体用同一个 `@id`，处理器会把两者合并成一个，所以要避免。

Google 也支持这种方式。官方文档把 JSON-LD 列为推荐格式，能顺畅读取一个 `@graph` 内多个实体相互引用的结构。补一句：这不是 Google 独有的规则，而是 W3C 标准。所以不止 Google、Bing，凡是遵循标准的 JSON-LD 处理器都会一样解读。

## 亲手试了一遍：散落的碎片 vs 一个 @graph

「能连起来」作为抽象说法我没感觉，于是做了两个版本，真的喂给处理器。

第一个是随处可见的散落版。`Organization`、`WebSite`、`Article` 三块碎片各带 `@context`、彼此独立。`Article` 的 `author` 和 `publisher` 内联，只写了名字。

```json
[
  { "@context": "https://schema.org", "@type": "Organization", "name": "Acme Bakery", "url": "https://example.com" },
  { "@context": "https://schema.org", "@type": "WebSite", "name": "Acme Bakery", "url": "https://example.com" },
  { "@context": "https://schema.org", "@type": "Article", "headline": "Sourdough at 4am",
    "author": { "@type": "Person", "name": "Jane Doe" },
    "publisher": { "@type": "Organization", "name": "Acme Bakery" } }
]
```

第二个把同样的信息放进一个 `@graph`，用 `@id` 相连。`Article` 的 `author` 引用 `{"@id": ".../#jane"}`、`publisher` 引用 `{"@id": ".../#org"}`；`Person` 又用 `worksFor` 指回 `Organization`。并明确 `WebPage` 是 `WebSite` 的一部分，`BreadcrumbList` 归属于那个 `WebPage`。

```json
{
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Organization", "@id": "https://example.com/#org", "name": "Acme Bakery", "url": "https://example.com" },
    { "@type": "WebSite", "@id": "https://example.com/#website", "url": "https://example.com",
      "publisher": { "@id": "https://example.com/#org" } },
    { "@type": "WebPage", "@id": "https://example.com/blog/sourdough#webpage",
      "isPartOf": { "@id": "https://example.com/#website" },
      "breadcrumb": { "@id": "https://example.com/blog/sourdough#breadcrumb" } },
    { "@type": "Article", "@id": "https://example.com/blog/sourdough#article", "headline": "Sourdough at 4am",
      "isPartOf": { "@id": "https://example.com/blog/sourdough#webpage" },
      "author": { "@id": "https://example.com/#jane" },
      "publisher": { "@id": "https://example.com/#org" } },
    { "@type": "Person", "@id": "https://example.com/#jane", "name": "Jane Doe",
      "worksFor": { "@id": "https://example.com/#org" } }
  ]
}
```

接着写了一段短短的 Node 脚本。用 `jsonld` 库把两份文档各自 `flatten`，把节点间的 `@id` 引用看作无向图，数连通分量的个数。分量为 1，说明所有实体连成一整块；有多个，就裂成了相应数量的孤岛。

```javascript
const flat = await jsonld.flatten(doc);
const graph = flat['@graph'] || flat;
// 从每个节点指向其他节点 @id 的引用计算出边，
// 再在无向图中数连通分量个数(DFS)。
```

运行结果如下，原样照搬。

```text
[disconnected islands]
  total nodes (after flatten): 5
  nodes with a stable @id:     0
  @id reference edges:         2
  connected components:        3  => 3 disconnected islands

[connected @graph]
  total nodes (after flatten): 10
  nodes with a stable @id:     7
  @id reference edges:         11
  connected components:        1  => ONE entity graph
```

数字很明确。散落版裂成<strong>三座岛</strong>，带稳定 `@id` 的节点为 0。内联写的 `author` 和 `publisher` 被处理器变成了匿名空白节点，因此仅凭标记无法判断 `Article` 的 `publisher` 是否就是上面那个 `Organization`。而 `@graph` 版靠 11 条引用边把所有节点连成<strong>一个分量</strong>，带稳定标识符的节点有 7 个。

![Disconnected islands versus connected @graph：将实测连通分量数可视化的示意图](../../../assets/blog/json-ld-graph-entity-linking-2026/graph-comparison.png)

这里要澄清一个误读。「三座岛」不等于「结构化数据无效」。散落版的每块碎片都有效，Google 也能好好读取多段独立脚本块。我测的不是有效性，而是<strong>关系的显式程度</strong>。碎片化的标记把实体关系交给机器去推断，连通的 `@graph` 则把关系钉死后递过去。如果说[把 LocalBusiness 标记从服务端稳妥输出](/zh/blog/zh/localbusiness-structured-data-server-side-vs-js-2026)讲的是「爬虫到底看不看得到标记」，这篇讲的就是「它看到的标记彼此连没连起来」。

## Google 保证什么，不保证什么

这里必须诚实划线。用 `@graph` 把实体连起来，排名就会涨？这话我不说，也说不了。

直接照搬 Google 官方文档(General Structured Data Guidelines、Intro to Structured Data)的说法：结构化数据只能让某项功能<strong>有资格</strong>出现，并不保证它一定出现。Google 的算法会权衡搜索历史、位置、设备等诸多变量，再当场挑它认为最好的形式，可能是丰富结果，也可能纯文本更合适。而且，结构化数据相关的手动处置只会让页面失去丰富结果的<strong>展示资格</strong>，并不影响该页面在网页搜索里的排名。也就是说，结构化数据和核心排名是两条不同的轴。

所以连通 `@graph` 的价值不在「排名上升」，而在别处。第一，稳定地保住丰富结果的<strong>展示资格</strong>(因为必填属性精准落在正确的实体上)。第二，关系被显式写出后，搜索引擎和 AI 有更多凭据去构建关于你网站的正确知识模型——而这第二点，是我<strong>无法断言</strong>的领域。AI 搜索究竟如何消化我的标记并未公开。所以诚实的上限是「按标准把关系写明，读取一方就少些推断负担」，而不是「AI 就这样读」。再往上就是作为参考值(非官方)流传的业界说法了。

## 四个常见错误及避法

这是我一边动手写、一边看别人标记时反复踩到的地方。

<strong>错误 1. 同一实体在不同页面用不同 `@id`。</strong> 组织在整站是同一个。要在每个页面都统一成 `https://example.com/#org`，搜索引擎才会认成「同一个组织」。若按页面裂成 `#org1`、`#org2`，就连不起来。

<strong>错误 2. 把 `@id` 当成能打开的 URL，还给它做真锚点。</strong> `@id` 是标识符，不是链接。像 `#org` 这样的片段不必指向实际的页面元素。只要唯一且一致即可。

<strong>错误 3. 内联重复，造出多份实体。</strong> 在 `author` 里整个写一遍人物对象，另一篇文章又整个写一遍，在处理器看来每次都是全新的空白节点。应先用 `@id` 定义一次 `Person`，之后用 `{"@id": ".../#jane"}` 引用。

<strong>错误 4. 只往 `@graph` 里塞，却不建引用。</strong> 放进数组不会自动相连。就算在同一数组里，没有 `@id` 引用它们仍是孤岛。我实测中制造连通的不是数组，而是那 11 条引用边。

## 在静态站点里只组装一次 @graph

理论说够了，真正的关键是在实际网站上怎么维护。每个页面都手搓 `@graph`，`@id` 极易漂移。我把实体分两层管理。

<strong>全站实体</strong>钉在一处。像 `Organization`、`WebSite`、主要作者 `Person` 这类整站不变的东西，在布局(或公共辅助函数)里只定义一次，把 `@id` 设为常量。这样站内每个页面都指向同一个 `#org`、`#website`，错误 1 从源头被掐断。

<strong>页面级实体</strong>在各页面里造。`WebPage`、`Article`、`BreadcrumbList` 因页而异，就在本地生成，但不重写全站实体，只用 `@id` 引用它们。组装函数大致长这样。

```javascript
// 全局常量。站内处处相同
const ORG_ID = 'https://example.com/#org';
const SITE_ID = 'https://example.com/#website';

function buildGraph({ pageUrl, article }) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      globalOrganization,          // @id: ORG_ID (只定义一次)
      globalWebSite,               // publisher -> { '@id': ORG_ID }
      buildWebPage(pageUrl),       // isPartOf -> { '@id': SITE_ID }
      buildBreadcrumb(pageUrl),
      buildArticle(article, pageUrl), // author/publisher -> @id 引用
    ],
  };
}
```

关键是把全站实体<strong>按引用而非按值复用</strong>。若像这个博客一样用 Astro 构建静态站点，把 `buildGraph` 做成组件，在 `<head>` 输出为单段 `ld+json` 脚本即可。爬虫无需执行 JS 就能直接从 HTML 读到，也就避开了因渲染方式导致标记缺失的问题。

## 今天就能落地的清单

要把它用到自己网站上，按这个顺序做就行。

1. 把页面里的 `<script type="application/ld+json">` 各块合并成<strong>一个 `@graph`</strong>。
2. 给复用的实体(`Organization`、`WebSite`、作者 `Person`)一个<strong>全站不变的 `@id`</strong>。
3. 把 `WebSite.publisher`、`Article.author`、`Article.publisher`、`Person.worksFor` 等，从内联对象换成<strong>`{"@id": ...}` 引用</strong>。
4. 接上页面层级：`WebPage.isPartOf` → `WebSite`，`BreadcrumbList` → `WebPage.breadcrumb`。
5. 把标记送进 [Schema Markup Validator](https://validator.schema.org/) 和 Google Rich Results Test，确认有效性。
6. (可选)用 `jsonld` 做 `flatten` 后，用脚本校验连通分量是否为 <strong>1</strong>。若大于等于 2，说明某处漏了引用。

到这里就是「我把关系写明了」的可实测终点。没有排名保证。但你稳住了丰富结果的资格，也为机器无误读地读懂你网站的实体模型打好了底。我认为这是结构化数据里最被低估的活儿。大家都盯着加新的 schema 类型，却跳过了把已经上线的碎片<strong>互相接起来</strong>这件事。

<strong>2026-07-06 后续</strong>：该处方已原样应用到本博客。把分散的 JSON-LD 块合并成了单个 `@graph`（Organization、Person、WebSite、WebPage、BreadcrumbList、BlogPosting 共 6 个节点），author、publisher、isPartOf、breadcrumb 全部换成 `@id` 引用。按清单第 6 条跑连通性检查：文章页未解决引用 0，连通分量 <strong>1 个</strong>——三个碎片变成了一张图。

如果你想把结构化数据从服务端稳妥输出，或想把既有网站的 JSON-LD 梳理成一个实体图谱，我个人接受咨询与实现委托，会基于这类实测来诊断。
