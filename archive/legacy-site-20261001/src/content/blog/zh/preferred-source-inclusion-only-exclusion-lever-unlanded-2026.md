---
'title': 'Preferred Source 进入AI搜索有完整文档，移出的方法只有一句话'
'description': '谷歌同一天为新功能"首选来源"准备了专门文档和按钮代码，把网站从AI搜索里移出的方法却只占官方文档里的一句话。我们数了自己12个页面，那一句话指向的标记一个都没有落上。'
pubDate: '2026-08-29'
heroImage: ../../../assets/blog/preferred-source-inclusion-only-exclusion-lever-unlanded-2026/hero.png
tags:
- Google搜索
- AI搜索
relatedPosts:
- slug: ai-crawler-control-robots-txt-llms-txt-2026
  score: 0.7
  reason:
    en: Google lavishing guidance on an AI search feature while squeezing the opt-out
      into one sentence makes self-managed AI crawler control more urgent, which is
      exactly what this robots.txt and llms.txt strategy guide delivers next.
    ko: 구글이 기능 안내에는 공을 들이고 탈출로는 한 문장으로 처리했다는 소식은 AI 크롤러를 스스로 통제하려는 전략이 더 절실해졌음을 보여주므로
      robots.txt와 llms.txt 기반 대응법이 담긴 이 글과 바로 이어져 읽을 만하다.
    ja: Googleが案内には力を注ぎ脱出方法を一文に圧縮したという事実は、AIクローラーを自分で制御する戦略の重要性を示しており、robots.txtとllms.txtによる2026年の対策法を扱うこの続きの記事として読む価値がある。
    zh: 谷歌将精力放在功能引导上却把退出机制压缩成一句话，恰恰说明自主控制AI爬虫的策略愈发紧迫，而这正是接下来这篇robots.txt与llms.txt实战指南所能提供的。
---

## 同一天更新的三份文档

2026年8月20日，谷歌发布了一个新功能，叫 Preferred Source，中文可以叫"首选来源"。它的意思是：用户可以在谷歌搜索里选几家自己喜欢的网站。之后在AI生成的回答里，这些网站的内容会被加上"preferred"的标记，更容易被看到。

我们做了件很朴素的事：把这个功能相关的三样东西各读了三遍——谷歌的官方开发者文档、谷歌的发布公告，还有我们自己网站的实际页面。为什么读三遍？因为看一遍容易被标题吸引，数三遍才知道里面到底写了什么、没写什么。这篇文章要做的就是数一数，"把网站放进AI搜索"和"把网站从AI搜索里拿出来"，谷歌分别给了多少帮助。

## 一边有专门文档和按钮代码

先说要被放进去的那一边。公告里明确写着，经营网站的人可以去谷歌给网站管理员的官方文档里拿"Preferred Source"按钮代码。

> If you're a publisher, you can find the new "Preferred Source" button code in our Google Search Central documentation to get started.
> — [Personalize search and discover news with preferred sources](https://blog.google/products-and-platforms/products/search/personalize-search-discover-news/)

专门讲这个功能的文档页面也存在。我们在官方文档的导航目录里数了154个页面路径，其中就有这一个，而且它能正常打开，页面标注的更新日期正是2026年8月20日，和发布公告同一天。功能发布当天，文档、按钮代码、使用说明就全都到位了。

## 另一边只剩一句话

现在换到另一边：想让谷歌的AI搜索别把自己的网站放进去，该怎么办。谷歌把“怎么加入”写得清清楚楚，“怎么退出”却只给了极少的说明。而想退出该怎么写，在谷歌AI功能的官方文档里能找到的，只有一句话。

先说说这份文档是什么。它讲的是AI Overviews和AI Mode，这两个名字指的是谷歌搜索里直接生成一段回答、而不只是列链接的那两个功能。想控制自己的网站在那段回答里露出的内容，这份文档给出的全部指导是下面这一句：

> To limit the information shown from your pages in Search, use nosnippet, data-nosnippet, max-snippet, or noindex controls.
> — [AI features / Google Search Central](https://developers.google.com/search/docs/appearance/ai-features)

这句话点名了4个控制开关。用大白话讲：第1个是贴在页面上的标记，告诉谷歌不要展示来自这页的文字预览；第2个更细，只藏起页面上选定的某一段，像遮住一封信里的某一段话；第3个是限制预览的字数上限；第4个最直接，请求谷歌干脆把这一页从搜索结果中整个去掉。四个工具挤在一句话里，这就是官方文档对“退出”给出的全部内容。

数字也可以数出来。我们统计了这份文档的正文，4个语法各出现1次，就这么多。而“退出”“排除"这类更直白的词，出现次数是0。谷歌的发布公告里，"opt out"这个词只出现1次，还是在“你可以随时退订”这个和搜索无关的场合。所以这种厚薄差别不是我们的感觉，是数出来的。

<div class="lm-card lm-card--cell" data-lm-figure="explain-cell-docs-exclusion-lever-inventory" data-lang="zh"><span class="lm-card__badge lm-card__badge--ok">成功</span><span class="lm-card__title">官方文档排除语法调查</span><span class="lm-card__text">在官方文档正文中，文档指出的四种语法各出现一次。整页隐藏标记和谷歌扩展标记也各出现一次。推荐来源一词未在正文中出现。</span><div class="lm-card__numbers"><span class="lm-card__chip">内容排除 1</span><span class="lm-card__chip">部分排除 1</span><span class="lm-card__chip">摘要限制 1</span><span class="lm-card__chip">推荐来源 0</span></div></div>

有一个替谷歌说话的理由值得认真听。这4个控制开关是用了多年的老标准，谷歌也把AI回答看作搜索本身的一部分，所以用老规则来管新功能，设计上是说得通的。运营方没用这些标记，也可以说是自己的选择，不是方法缺失。这个道理在它自己的逻辑里是对的。但它抹不掉数字：加入方向在发布公告当天就有了专门页面和按钮代码，退出方向只有一句话，而下一节会数到，这句话指向的标记在我们自己的页面上一个都没落地。

## 谷歌把两边帮到了什么程度

两边放在一起看，差距很明显。想被放进AI搜索的那一侧，公告给出了文档、按钮代码、使用说明，都是现成的，拿来就能用。想退出的那一侧，只有一句把四种写法打包在一起的话，具体怎么写、写到哪些页面，全要网站自己完成。能不能退出是一回事，愿不愿意动手是另一回事，很多人会以为装了别的开关就等于退出了。这正是下面要数的问题。

## 我们数了什么、怎么数的

我们查了三样东西：开发者文档、发布公告、我们自己网站的页面。三个对象、六个板块各读三遍，一共把页面下载查看18次（这个过程叫抓取），统计"加入"和"退出"相关的词出现了几次；同时拿一份无关文档做对照，防止把菜单栏之类的杂字算进去。第三步是数我们自己：从我们网站的地址清单里抽12个页面的地址，逐个看这些页面里到底有没有那个"限制语"。

<div class="lm-card lm-card--how" data-lm-figure="explain-how" data-lang="zh"><span class="lm-card__title">测量步骤</span><ol class="lm-card__steps"><li class="lm-card__text">步骤 1. 将六个板块各读三遍，得到十八项观测。</li><li class="lm-card__text">步骤 2. 在官方文档和公告中统计加入、排除相关词汇。</li><li class="lm-card__text">步骤 3. 加入无关文档作为对照，排除菜单混入。</li><li class="lm-card__text">步骤 4. 在实际服务的我们的 HTML 中确认语法落地数量。</li><li class="lm-card__text">步骤 5. 确认十八项观测是否都收到了正常页面。</li></ol></div>

## 我们12个页面上，那个标记一个都没有

结果是这样：我们抽的12个页面，没有一处带着那句"退出方法"所指的任何一种标记。这12个页面里，页面内的指令全部为空，真正写上的数量是0/12。

也就是说，谷歌文档里唯一指出的退出方法，在我们自己的网站上没有任何一处真的被启用。对运营网站的人来说，这就是关键："我们想在AI搜索里少出现"这个意愿，如果只是存在于想法里，页面上的实际状态一查就会发现是零。

还有一个容易误会的地方。我们的页面设置里确实写了 Google-Extended 的两行禁止规则。Google-Extended 是谷歌专门给AI用的数据开关，管的是AI训练抓取，看起来能"挡住谷歌AI"。但谷歌官方文档写得很清楚：

> Google-Extended does not impact a site's inclusion in Google Search nor is it used as a ranking signal in Google Search.
> — [Google-Extended / Google Search Central](https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers)

翻成大白话：这个开关管的是别的系统，不影响你的网站会不会出现在谷歌搜索本身，也不影响排名。所以"我设了它，AI搜索里就不会有我"这种安心，按官方的说法是不成立的。

<div class="lm-card lm-card--cell" data-lm-figure="explain-cell-own-deployment-lever-landing" data-lang="zh"><span class="lm-card__badge lm-card__badge--ok">成功</span><span class="lm-card__title">我们页面落地确认</span><span class="lm-card__text">文档指出的三种语法在实际服务的我们的 HTML 中没有任何落地的 URL。即文档中的排除语法未反映到页面上。</span><div class="lm-card__numbers"><div class="lm-card__bar"><div class="lm-card__bar-fill" style="--lm-bar-w:100.0%"></div><span class="lm-card__text">有效执行 3/3</span></div><span class="lm-card__chip">落地地址 0</span></div></div>

## 想退出的说法站得住吗

有人会说：退出方法只有一句话，这不算问题。那四种写法都是用了多年的老标准，谷歌把AI功能当作搜索的一部分，用现有的限制方式来管它，设计上是自洽的。网站不用那些标记，是自己的选择，不是谷歌给的方法太薄。

这个说法在规则内部是对的。但同一份公告发布的那天，一边得到了专门页面、按钮代码，另一边只有一句把四个词打包的话，而这句话指向的标记在我们实际抽查的12个页面里一个都没出现。规则讲得通，两边文档的厚薄差距却是数得出来的。文档篇幅的差别告诉我们：哪边是谷歌替你做好的，哪边要你自己动手。

## 想退出的人和想进入的人分别怎么做

如果你想让自己的网站在AI搜索里少出现：先别信"设过某个开关"就安全。去数一数自己的页面上，那句话说的四种标记到底有没有真的写上去；同时记住：给谷歌AI数据用的那个单独开关，不影响网站会不会出现在搜索里。把这条写进团队的检查清单。

如果你想让自己的网站在AI搜索里多出现：事情简单得多。确认自己的页面上没有那些限制标记，资格就自动保住了。文档明确写着，AI相关功能"没有额外的技术要求"。

## 本文未能核实的部分

这次没有量到的东西有三样。"那些标记真的能让AI回答里少引用你"这件事本身没有实测，我们只量了文档里写了什么、页面上有没有。别的网站的情况我们不知道，样本只有自己这12个地址。接下来要去核实的是：文档下次更新时那句话会不会变化，以及我们这个0/12的结果以后会不会变。

顺便交底：这个判断在什么条件下会错——如果谷歌在官方文档里直接写明，那个"挡AI"的开关也能一并挡住网站在搜索AI功能里的出现，这篇文章的判断就错了。截至本文的数据，那样的说明在文档里没有出现。

<div class="lm-card lm-card--takeaway" data-lm-figure="explain-takeaway" data-lang="zh"><span class="lm-card__title">结论</span><p class="lm-card__takeaway">官方文档提到了排除语法，但在实际服务的我们的页面上，该语法未出现在任何一个 URL 中。</p></div>

一句话带走：谷歌把"多出现"做成了拿来就能用的按钮和文档，"少出现"却只留一句话，要你自己写进页面里。所以至少去数一次，你的页面上到底有没有那一行标记。

## 参考资料

1. [AI features / Google Search Central](https://developers.google.com/search/docs/appearance/ai-features) — Google
2. [Google-Extended / Google Search Central](https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers) — Google
3. [Preferred sources / Google Search Central](https://developers.google.com/search/docs/appearance/preferred-sources) — Google
4. [Personalize search and discover news with preferred sources](https://blog.google/products-and-platforms/products/search/personalize-search-discover-news/) — Google