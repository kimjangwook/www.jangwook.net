---
title: '我把技术SEO审计连跑了五天——比修好的五项更关键的是那几道门禁'
description: '对我的四语言博客做了五天实测审计。relatedPosts的404有12个、hreflang断链4对、渲染阻塞的字体CSS 405KB、翻译漂移21处、碎片化JSON-LD 7块。全都修了。但真正的成果是让它们再也回不来的构建门禁。附实测日志与检查器代码。'
pubDate: '2026-07-06'
heroImage: '../../../assets/blog/multilingual-blog-technical-audit-campaign-2026/hero.png'
tags:
  - 技术SEO
  - Web开发
  - hreflang
  - 结构化数据
  - CI
faq:
  - question: '技术SEO审计该多久做一次？'
    answer: '比起定期审计，先建防回归门禁。把修过的项目做成检查器接入构建，同一问题再次出现时构建本身就会失败。这样"定期审计"只需处理门禁抓不到的新类型，负担大幅下降。'
  - question: '修好结构化数据或hreflang能提升排名吗？'
    answer: '不能。Google官方文档明确指出，结构化数据只赋予富媒体结果的"资格"，并不保证排名。hreflang也不是排名信号，而是把用户引导到正确语言版本的路由装置。这些修复不是"制造原本没有的排名"，而是"让爬虫不误读你的站点"的卫生工作。'
  - question: '检查器该放在prebuild还是postbuild？'
    answer: '仅凭源文件（frontmatter、链接引用）就能判定的规则放prebuild；需要看渲染产物（dist里的真实HTML）的规则放postbuild。hreflang相互性和孤立页面必须爬取最终HTML才能准确判断，所以postbuild才对。'
relatedPosts:
  - slug: hreflang-reciprocity-audit-multilingual-2026
    score: 0.72
    reason:
      ko: 이 캠페인의 다섯 항목 중 하나를 통째로 파고든 글이다. 여기서는 "게이트로 상설화"까지만 요약했지만, hreflang 상호성이 왜 양방향이어야 하는지와 세 가지 구현 방법 비교는 그쪽에 있다.
      ja: このキャンペーンの5項目の一つを丸ごと深掘りした記事だ。ここでは「ゲートで常設化」までしか要約していないが、hreflang相互性がなぜ双方向でなければならないかと3つの実装比較はあちらにある。
      en: A full deep dive into one of this campaign's five items. Here I only summarized up to "made it a permanent gate"; the why of bidirectional hreflang and a three-way implementation comparison live there.
      zh: 把这次行动五个项目之一整个深挖的文章。这里只概括到"常设为门禁"，而hreflang为何必须双向以及三种实现的对比都在那篇。
  - slug: json-ld-graph-entity-linking-2026
    score: 0.68
    reason:
      ko: 표에 나온 "ld+json 7블록→1블록 연결"이 궁금했다면 그 수술 과정 전체가 이 글에 있다. 연결 컴포넌트를 그래프 알고리즘으로 세는 방법까지.
      ja: 表にある「ld+json 7ブロック→1ブロック連結」が気になったなら、その手術の全過程がこの記事にある。連結成分をグラフアルゴリズムで数える方法まで。
      en: If the "ld+json 7 blocks → 1 linked" row caught your eye, the whole operation is in this post — down to counting connected components with a graph algorithm.
      zh: 若你留意到表里"ld+json 7块→1块连通"，那台手术的全过程都在这篇——连用图算法数连通分量都讲了。
  - slug: a11y-lighthouse-audit-fix-2026
    score: 0.58
    reason:
      ko: 이 글이 말한 "검사기를 내 페이지에 돌려 숫자로 확인하고 하나씩 고친다" 루프를 접근성에 그대로 적용한 사례다. 성능 항목에서 91→100으로 오른 그 점수의 실측이 여기 있다.
      ja: 「検査器を自分のページに走らせ数字で確認して一つずつ直す」という本記事のループをアクセシビリティに当てた事例だ。性能項目で91→100に上がったそのスコアの実測がここにある。
      en: The same loop from this post — run a checker on your own pages, confirm in numbers, fix one at a time — applied to accessibility. The 91→100 score I mentioned is measured there.
      zh: 把本文"把检查器跑在自己页面上、用数字确认、逐个修"的循环用在无障碍上的案例。性能项里91→100那个分数的实测就在这篇。
  - slug: localbusiness-structured-data-server-side-vs-js-2026
    score: 0.5
    reason:
      ko: 이 글이 반복해서 말한 "화면이 아니라 서버가 크롤러에게 보내는 마크업"이라는 관점을 LocalBusiness 스키마로 구체화한 글이다. 서버사이드 vs JS 렌더링의 실측 비교가 핵심.
      ja: 本記事が繰り返した「画面ではなくサーバーがクローラーに送るマークアップ」という視点を、LocalBusinessスキーマで具体化した記事だ。サーバーサイド対JSレンダリングの実測比較が核心。
      en: It grounds this post's recurring "not the screen but the markup the server sends a crawler" viewpoint in LocalBusiness schema, centered on a server-side vs JS-rendering measurement.
      zh: 把本文反复强调的"不是画面，而是服务器发给爬虫的标记"这一视角，用LocalBusiness schema具体化的文章，核心是服务端与JS渲染的实测对比。
---


很多SEO审计以吐出一张工具报告收尾。跑一遍Lighthouse，截图Search Console的覆盖率，保存一张"发现12个问题"的面板，就算完事。问题是，这样收尾的审计结果大多在三个月后原样复原。有人发了新文章、重构了组件、换了字体，那一刻它就悄悄回来了。没人察觉。

过去五天，我实际审计了自己的四语言博客（ko/ja/en/zh，每种语言298篇）。项目共五个，全部修好。但我真正想说的不是"修了什么"，而是这五个修复远不如让它们再也回不来的<strong>构建门禁</strong>重要。审计应该是循环，而不是一次性事件。

## 为什么一张报告收尾的审计一定会回来

技术SEO的问题大多不是"代码错了"，而是"不变式从没在任何地方被强制"。比如"公开文章不得内链指向草稿"这条规则很清楚。但如果每次都要人去记，那么推荐生成器一旦拉进一个草稿slug，404就诞生了。报告会抓到那个404并展示给你，却挡不住下一次同样的错误。

所以我把审计当成三步循环来跑。测量。从最大的项目先修。再把那个项目<strong>做成检查器，钉进构建里</strong>。缺了第三步，前两步就变成每半年重复一次的苦工。门禁一旦就位，同类问题再次出现就会让`npm run build`失败。守规则的是流水线，而不是人的记性。

这不是新发明。它和测试防止bug回归是同一套逻辑，只是套用到了内容与标记这一层。只不过在SEO领域，这个习惯出奇地少见。多数团队把"SEO检查"留成每季度的手工活。

把这篇文章要讲的循环画成一张图：

```mermaid
graph TD
    A["全量测量<br/>用数字锁定基准线"] --> B["从最大的项目开始修"]
    B --> C["重新测量确认效果"]
    C --> D["把检查器常设为门禁<br/>prebuild·postbuild"]
    D --> E["保持警告为零"]
    E -->|"出现新违规"| A

    style D fill:#0066CC,color:#fff
```

## 五天里实际跑的五个项目

先测量。每个项目的before/after都用数字留档。不是"感觉好像好了"，而是可复现的数值。（五个项目的原始记录也留在[改进历史页面](/zh/improvement-history/)。）

| 日期 | 项目 | Before | After | 门禁 |
|---|---|---|---|---|
| 07-02 | relatedPosts完整性 | 指向草稿的404 <strong>12个</strong> | 0个 | prebuild |
| 07-04 | hreflang相互性 | 首页集群断链 <strong>4对</strong> | 253页损坏0 | postbuild |
| 07-05 | 性能关键路径 | 渲染阻塞字体CSS <strong>405KB</strong> | 渲染阻塞0 | 手动回归 |
| 07-05 | 翻译结构漂移 | 不一致slug <strong>21/50</strong> | 1（已接受遗留） | prebuild |
| 07-06 | JSON-LD实体模型 | 每篇ld+json <strong>7块</strong> | 1块，6节点连通 | 组件单一化 |

表面看是五个独立修复。实际上它们共享一个视角：全都是<strong>爬虫读取的标记，而非用户看到的画面</strong>的问题。hreflang、JSON-LD、草稿链接，人眼都看不见。所以肉眼QA永远抓不到，只有自动检查器能抓。

我特意把before/after钉成数字，是有理由的。"感觉好了"无法复现，无法复现就建不了门禁。门禁归根结底是一个判定："这个数字越过阈值就失败"。指向草稿的404如果是12个，门禁的条件就变成"超过0就构建报错"。把测量记成数字的那一刻，这个测量就成了回归测试的基线。这是把审计从事件变成循环的第一步。顺带一提，298篇公开文章里可索引的只有55篇，其余972篇（四语言合计）作为草稿被排除在信息流之外——这个比例本身也是测量才看清的。不知道它，就会去查"为什么站点地图里文章这么少"之类的错方向。

五个项目各自已有专文深挖，这里不重复。hreflang相互性为何必须双向，写在[实测审计hreflang并发现首页bug的文章](/zh/blog/zh/hreflang-reciprocity-audit-multilingual-2026/)里；把schema碎片连成单一`@graph`的理由，写在[用JSON-LD @graph连接实体的文章](/zh/blog/zh/json-ld-graph-entity-linking-2026/)里。本文的焦点不是单个手法，而是贯穿五者的循环本身。

## 从最大的项目先修，但我先怀疑了测量值

优先级很简单：影响范围 × 复发概率最大的先修。按这个标准，翻译结构漂移（21/50 slug）排第一。

这里我学到一点。<strong>处理异常值之前，先核对度量方法。</strong>打开"漂移最大的slug"一看，其实不是翻译粗糙，而是嵌套代码围栏坏了、渲染本身崩了。韩语文件里，三个反引号的代码块里又套了三个反引号的块，导致解析器把一半读成代码、一半读成正文。度量器以"结构不一致"抓到的最大值，不是翻译质量问题，而是解析污染。

要是我信了数字直接冲去"重新翻译"，就会在错的地方烧掉好几天。先核对度量器在数什么，21处里最大的异常值原来是代码围栏问题，其余则归结为恢复翻译中丢失的章节（约40个）和图表（12张）。恢复时我没有逐语言手搬，而是往共享模板里只换字符串参数。这样才能挡住二次漂移。

性能项目也一样。渲染阻塞的字体CSS是405KB，但优化的第一问不是"怎么加载得更快"，而是"到底需不需要加载"。我把任何语言都用不到的字形也一并搬运了。把Google Fonts按语言拆成子集后，405KB随语言降到1〜137KB，再把字体CSS异步化，渲染阻塞归零。附带地，无障碍分数也从91升到100。怎么把无障碍钉成数字，我另写在[实际跑Lighthouse无障碍审计并修复的文章](/zh/blog/zh/a11y-lighthouse-audit-fix-2026/)里。

## 不是修好，而是让它回不来

循环的第三步才是这次行动的真正产物。每个修好的项目都配了一个检查器。

以relatedPosts的404为例，我没有只修生成器的过滤就收工，而是在消费前的门禁强制不变式。构建前运行的`validate-publishing.mjs`检查这条规则。

```javascript
// 只有可索引的文章之间才能互相推荐。
// 指向草稿/noindex/未来文章/缺失slug就构建报错。
const indexableSlugsByLang = new Map(languages.map((lang) => [lang, new Set()]));
for (const post of posts.filter((item) => item.indexable)) {
  indexableSlugsByLang.get(post.lang).add(post.slug);
}

for (const post of posts.filter((item) => item.indexable)) {
  const related = Array.isArray(post.data.relatedPosts) ? post.data.relatedPosts : [];
  for (const rec of related) {
    if (!rec?.slug) continue;
    if (!indexableSlugsByLang.get(post.lang).has(rec.slug)) {
      errors.push(`${post.relPath}: relatedPosts references non-indexable post "${rec.slug}"`);
    }
  }
}
```

关键在于<strong>在消费前的一层拦，而不是在生成层</strong>。生成推荐的代码就算有一百处，只要真正发布的文章指向了草稿，就在一处被抓住。这道门禁上线后，草稿404在算术上归零，且会一直保持为零。

hreflang单凭源文件判定不了。必须爬取最终HTML，看页面之间是否真的互相指向，所以这个放在构建后（postbuild）跑。Google官方规则很明确：A把B指定为替代版本，B就必须回指A（相互性），且每个页面都要指向自己（self-reference）。我把这两条规则原样搬进了代码。

```javascript
for (const [url, targets] of annotations) {
  if (!targets.has(url)) missingSelf.push(url);        // 缺self-reference
  for (const target of targets) {
    if (target === url) continue;
    const back = annotations.get(target);
    if (back && !back.has(url)) {
      brokenPairs.push(`${url} -> ${target} (无回链)`);  // 相互性损坏
    }
  }
}
```

跑一遍构建，两个检查器实际会这样通过。下面是我写这篇文章时跑出来的日志。

```text
[publishing-check] posts by language: {"ko":{"total":298,"published":55,"indexable":55}, ...}
[publishing-check] past draft/noindex posts kept out of feeds: 972
[publishing-check] OK
...
[hreflang-check] annotated pages: 257
[hreflang-check] self-reference missing: 0
[hreflang-check] broken return-link pairs: 0
[orphan-check] pages: 260, orphans (排除allowlist): 0
[hreflang-check] OK
```

`orphan-check`也搭在同一个postbuild上。任何内链都到不了的孤立页面，爬虫很难发现，即便发现也读成孤立信号。审计途中我把一个原本孤立的页面用Footer链接接上，再把这项检查常设化以防复发。承认限度也是循环的一部分。翻译漂移从21处降到1处，那1处我故意留着。一篇非常老的遗留文章跨语言结构不同，如今硬要对齐就得动已索引的URL结构，风险大于收益。所以我把那一个slug明确登记进检查器的allowlist。与其"不为0就直接失败"，更现实的立场是"决定接受的例外，把理由留在代码里放行"。目标不是每个指标都归零，而是挡住意外复发。怎么对AI爬虫做差别化控制，我另写在[用robots.txt与llms.txt管控爬虫的文章](/zh/blog/zh/ai-crawler-control-robots-txt-llms-txt-2026/)里。

## Google不保证的东西

这里要诚实地划一条线。这次行动<strong>不是</strong>提排名的工作。Google Search Central官方文档说得很直白：结构化数据只赋予富媒体结果的<strong>资格</strong>，不保证展示或排名。hreflang也被描述为"把用户引导到合适的语言/地区版本"的路由装置，而非排名信号。填错的hreflang不会制造你原本没有的排名，相互性一坏，那段注释就直接被忽略。

所以这五个项目准确的效用应该这样讲：它们是<strong>减少爬虫误读你站点余地的卫生工作</strong>。404链接浪费抓取预算，损坏的hreflang让语言定位失效，碎片化的JSON-LD切断"这个组织、这个作者、这篇文章"的连接。修好它们，爬虫按你意图读取的概率就上升。至于是否转化为更高排名，取决于内容质量和无数其他变量，而我是Web开发者，不是了解搜索算法内部的人。那部分我不下断言。

性能这边也看到了限度。实验室数值（Lighthouse模拟）和实测（observed LCP 2.4秒）不一致。只盯实验室分数冲进过度优化，真实用户环境毫无体感，代码却更复杂了。知道实验室与现场的差距，恰恰告诉你该在哪里收手。

## 今天就能用的清单

把我在博客上做的一般化，任何站点都能这样启动这个循环。

- <strong>先测量，再怀疑。</strong> 发现异常值时，修之前先核对"度量器到底在数什么"。我最大的漂移不是翻译问题，而是代码围栏的解析污染。
- <strong>按影响 × 复发概率排优先级。</strong> 先处理会悄悄反复回来的，而非最显眼的。
- <strong>在消费前的一层拦截。</strong> 生成代码有多处时，别逐个去修，而是在发布前的一处强制不变式。
- <strong>能靠源判定就prebuild，需要看渲染产物就postbuild。</strong> frontmatter和链接引用放prebuild；hreflang相互性和孤立页面放爬取最终HTML的postbuild。
- <strong>每个修复都要变成检查器。</strong> 没有检查器的修复就是预约回归。一个30行的检查器胜过每季度的手工审计。
- <strong>不承诺排名。</strong> 这是卫生，不是魔法。减少爬虫误读，就是开发者职责的边界。

回望这五天，最有价值的产物不是修好的五项，而是仓库里留下的三个检查器。五项终会被遗忘，检查器却在我每次犯错时替我记着。把审计做成循环而非事件，说到底就是这个意思。

如果你想在服务端可靠地输出结构化数据，或想对多语言站点的hreflang、JSON-LD、性能做实测排查并给修复配上回归门禁，我私下接受咨询与实现委托。用代码控制服务器到底发给爬虫什么，正是我的专长。若想从"服务器输出的标记"这一视角重新审视你的站点，[在服务端输出LocalBusiness结构化数据的文章](/zh/blog/zh/localbusiness-structured-data-server-side-vs-js-2026/)也是同一路数的内容。
