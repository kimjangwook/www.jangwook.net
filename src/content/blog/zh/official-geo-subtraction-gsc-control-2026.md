---
title: '官方 GEO 指南先划掉的几项，以及 Search Console 里多出的开关'
description: 'Google 官方生成式 AI 指南写明：llms.txt 和专用 schema 可忽略。开发者该看的是 Search Console 的纳入开关，以及线上 robots.txt，不是 git 里那份。'
pubDate: '2026-08-14'
updatedDate: '2026-08-14'
heroImage: '../../../assets/blog/official-geo-subtraction-gsc-control-2026/hero.png'
tags:
  - SEO
  - GEO
  - AIO
  - Search-Console
faq:
  - question: '放一份 llms.txt，AI Overview 会更好吗？'
    answer: '不会。Search Central 的生成式 AI 优化指南写明，Google Search 会忽略该文件，做了既不帮也不害可见度和排名。只有别的系统要读时才值得留。这不是 Google Search 的活。'
  - question: '生成式搜索有没有专用的 schema.org？'
    answer: '官方文档说没有。结构化数据仍用于富结果资格。不必为 AI Overview 另做一套标记，它也不保证排名或被引用。'
  - question: '在 Search Console 里关掉生成式 AI 控制，普通搜索也会掉吗？'
    answer: '帮助文档写的是：该控制只影响部分生成式 AI 功能的展示，不是搜索其余部分的排名或收录信号。限制训练用 Google-Extended，整站退出搜索用 noindex。控制界面仍在向部分资源分批开放。'
relatedPosts:
  - slug: robots-snippet-controls-ai-overviews-2026
    score: 0.88
    reason:
      ko: 페이지에 nosnippet을 심으면 AI Overview 입력에서 빠진다. 오늘은 그 위층, Search Console 속성에 생긴 스위치를 본다.
      ja: ページに nosnippet を置くと AI Overview の入力から外れる。今日はその上、Search Console プロパティに付いたスイッチを見る。
      en: nosnippet takes a page out of AI Overview input. This one looks at the switch that landed above that, on the Search Console property.
      zh: 页面加上 nosnippet，就会从 AI Overview 的输入里拿掉。这篇看的是更上面那层：Search Console 资源上的开关。
  - slug: ai-crawler-control-robots-txt-llms-txt-2026
    score: 0.86
    reason:
      ko: 학습 봇과 검색 봇을 가르는 설계는 그쪽에 있다. 오늘은 그 robots.txt가 라이브에서 CDN 접두를 입고 길어진 상태를 잰다.
      ja: 学習ボットと検索ボットを分ける設計はあちらにある。今日はその robots.txt がライブで CDN 接頭辞を着て長くなった状態を測る。
      en: Splitting training bots from search bots is that post. This one measures the live file after a CDN prefix made it longer than git.
      zh: 训练爬虫和搜索爬虫怎么分开，写在那篇。这篇量的是线上 robots.txt 被 CDN 前缀拉长之后。
  - slug: faqpage-deprecation-ai-citation-2026
    score: 0.74
    reason:
      ko: 검증기를 통과한 FAQPage가 리치 결과에서는 이미 끝났다. 생성형 검색용 스키마를 하나 더 얹는 일도 같은 함정이다.
      ja: 検証を通った FAQPage はリッチリザルトではもう終わっている。生成検索用スキーマを足すのも同じ穴だ。
      en: A valid FAQPage already stopped producing a rich result. Adding a schema just for generative search is the same hole.
      zh: 通过校验的 FAQPage，富结果这边已经收场了。再为生成式搜索加一种 schema，是同一个坑。
  - slug: validate-structured-data-ci-jsonld-2026
    score: 0.7
    reason:
      ko: CI에서 JSON-LD를 막는 일은 리치 결과 쪽 일이다. 공식은 그 마크업을 생성형 검색의 입장권으로 보지 않는다.
      ja: CI で JSON-LD を止める仕事はリッチリザルト側だ。公式はそのマークアップを生成検索の入場券にしていない。
      en: Blocking bad JSON-LD in CI is still a rich-result job. Official text does not treat that markup as a ticket into generative search.
      zh: 在 CI 里拦住坏 JSON-LD，仍是富结果的事。官方没把这套标记当成生成式搜索的门票。
  - slug: json-ld-graph-entity-linking-2026
    score: 0.64
    reason:
      ko: 엔티티를 @graph로 묶는 작업은 남는다. 이유를 "AI Overview 전용 최적화"로 쓰면 공식 문서와 어긋난다.
      ja: エンティティを @graph で結ぶ仕事は残る。理由を「AI Overview 専用最適化」と書くと公式とずれる。
      en: Linking entities in an @graph still makes sense. Calling it an AI Overview-only optimization does not match the official guide.
      zh: 用 @graph 串实体，这件事还在。但若写成“AI Overview 专用优化”，就和官方指南拧着。
---

`https://jangwook.net/llms.txt` 今天早返回 404。`LLMs.txt` 和 `www` 主机一样。

同一天，仓库里的 `public/robots.txt` 是 45 行、1,101 字节。线上是 106 行、2,937 字节。

第三方 GEO 清单还爱把 `llms.txt` 放第一行。后面跟着切段、专用 schema、按模型口味重写。Google Search Central 在 2026 年 5 月 15 日上线 [生成式 AI 功能优化指南](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)，7 月 10 日又改过一版。读完那份指南，清单上半截该删。开发者要动手的新装置不是文件，是 Search Console 资源上的开关。

![官方 GEO 是一份减法清单加一枚开关](../../../assets/blog/official-geo-subtraction-gsc-control-2026/hero.png)

## 仓库 45 行，线上 106 行

2026 年 8 月 14 日，只对公开 URL 跑了 `curl`。

```bash
curl -sI https://jangwook.net/llms.txt
# HTTP/2 404

curl -sL https://jangwook.net/robots.txt | wc -l
# 106
```

Google Search 写明会忽略的文件，这个站没有放。

robots.txt 是在仓库外头变长的。git 里拦的是训练爬虫（`GPTBot`、`ClaudeBot`、`CCBot`、`Google-Extended`），搜索爬虫和 `*` 只挡跨语言 URL。线上响应前面多了一截 CDN 前缀。`User-agent: *` 上有 `Content-Signal: search=yes,ai-train=no,use=reference`，学习、扩展类爬虫的 `Disallow: /` 又来一轮。仓库正文接在后面。

![git 里的 robots.txt 和线上响应的行数](../../../assets/blog/official-geo-subtraction-gsc-control-2026/robots-live-vs-git.png)

今天读的 Search Central robots.txt 说明里，我没把 `Content-Signal` 确认成受支持的规则。文件里写着，和 Googlebot 会不会消费这个 token，不是一回事。后者这里不断言。

八个页面（`/`、`/ko/`、`/en/`、`/ko/blog/`、三篇文章、`/ko/contact/`）都是 HTTP 200。`<meta name="robots">` 0 个，`data-nosnippet` 0 个。有的正文里出现了 `nosnippet` 这个词，那不是指令。现在的模板只在打开 `noindex` 的页面才出标签。

首页 JSON-LD 是 `Organization`、`Person`、`WebSite`。文章是 `BlogPosting`、`WebPage`、`BreadcrumbList`。按今天的官方文本，这套标记不是生成式搜索的门票。它留在富结果和实体整理那边。和 [FAQPage 富结果结束后仍留下问答标记](/zh/blog/zh/faqpage-deprecation-ai-citation-2026) 是一条线。

把 GEO 理解成“往仓库加个文件”，爬虫已经在读的那份已经在仓库外头变长了。该 diff 的是线上 URL。

## 指南先删的是清单，不是 HTML

“破除迷思”一节把 AEO、GEO 当成搜索体验优化的别名。

> From Google Search's perspective, optimizing for generative AI search is optimizing for the search experience, and thus still SEO.

出处：[Optimizing your website for generative AI features](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)

工程待办里该拿掉的，是这四行。

| 市面上的条目 | 官方立场 | 代码和配置里做什么 |
| --- | --- | --- |
| `llms.txt` 和专用 AI 文件 | Google Search 不用。做了既不帮也不害可见度、排名 | 不为 Google Search 新建。只有别的系统要读时才留 |
| 为模型把文章切碎 | 不要求。文档写明能理解一页里的多个主题 | 篇幅按读者来定 |
| 只为 AI 重写 | 能理解同义和意思，不必为每个长尾单独成页 | 保留给人看的稿。按问法铺页会撞上 [scaled content](https://developers.google.com/search/docs/essentials/spam-policies#scaled-content) |
| 生成式搜索专用 schema.org | 不需要，也没有专用标记 | 富结果用的标记留下，不要新做“AI Overview 专用 schema” |

`llms.txt` 那句更短。

> Doing so will neither harm nor help your site's visibility or rankings in Google Search, as Google Search ignores them.

出处：同一份 [优化指南](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) 的 LLMS.txt 项

别的服务要读，可以留。Google Search 的任务清单里应拿掉。若已经用 [robots.txt 把训练爬虫和搜索爬虫分开](/zh/blog/zh/ai-crawler-control-robots-txt-llms-txt-2026)，今天要去掉的是“Google 会读这份文件”的误会。

结构化数据那一段我读了两遍。生成式搜索不要求它，也没有专用类型。富结果资格仍用它，所以还可以留在整体 SEO 里。我不当成“删掉 JSON-LD”，而当成“别因为有了 AI Overview 再加一种类型”。排名从来不保证，引用也不保证。

满网种不真实提及，官方也认为没那么有用。第三方工具声称能看到“内部指标”，同一份指南也砍掉了。没有任何第三方工具能进入内部排名或 AI 系统。[第三方 SEO 建议评估指南](https://developers.google.com/search/docs/fundamentals/third-party-seo) 要求拿 AEO、GEO 建议去对官方文档。工具可以进工作流，数字不能当成 Google 自己的数。

## 开关在 Search Console，不在模板

“须纳入 Search Console”指向帮助文档里的 [Search generative AI control](https://support.google.com/webmasters/answer/16908024)。路径是 Settings > Search generative AI。

三个选项：纳入、排除、跟随父资源。纳入是默认值。排除之后，AI Overview、AI Mode、Discover 里的生成式功能不再用你的链接，也不再拿你的内容做 grounding，那些功能带来的展示和流量也没有。

> This control only affects whether your content can appear in certain Search generative AI features; this control isn't used as a ranking or inclusion signal affecting other parts of Search.

出处：[Search generative AI control](https://support.google.com/webmasters/answer/16908024)

不是搜索其余部分的排名信号。也不是训练开关。限制训练走 [Google-Extended](https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers#google-extended)，整站退出搜索走 `noindex`。控制生效后，排除一般要 1〜2 天，缓存还可能拖长。

有人在域名资源上点了排除，未单独设置的 URL-prefix 子资源会继承。博客就算挂在 `https://example.com/blog/`，父资源先动手，子资源默认跟着走。HTML 再干净，属性开关关掉，生成式功能的资格就在这一层断掉。

控制和报告都还在向部分站点开放。2026 年 6 月 3 日的 [生成式 AI 效果报告公告](https://developers.google.com/search/blog/2026/06/gen-ai-performance-reports) 写明是子集。报告里的数是展示次数，不是点击，也不是名次。Search Labs 实验数据不计入。看不见界面，不等于已被排除。可能还没轮到，也可能生成式展示还不够。

写这篇时我没有登录 Search Console。我的资源有没有这个菜单，这里不断言。能断言的是：文档里的默认是纳入，继承关系写在帮助页上。

按团队重排顺序：先看父域名资源的当前值，记下每个子 URL-prefix 是在继承还是手动覆盖，再查模板里的 robots meta 和线上 robots.txt。顺序反了，改一周标记也解释不了为什么生成式功能里整站不在。改 HTML 的人和握 Search Console 的人若分属两组，这一层进不了代码评审。

![资格分三层](../../../assets/blog/official-geo-subtraction-gsc-control-2026/three-layers.png)

AI Overview 给难题一段要义，再挂上依据链接。AI Mode 处理比较、推理这类从前要搜好几轮的问题。两者都在 Google 搜索里，都从线上索引取页。Google 把过程写成叠在核心排名之上的 RAG，再加上 query fan-out。

页面得已被收录，并且有资格出摘要。[AI features and your website](https://developers.google.com/search/docs/appearance/ai-features) 里的句子是：

> There are no additional requirements to appear in AI Overviews or AI Mode, nor other special optimizations necessary.

出处：[AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)

技术条件、垃圾政策、面向人的内容准则都还在。都满足了，抓取、收录、展示也仍不保证。

摘要资格我测过一轮。`nosnippet` 和 `max-snippet:0` 会把页面从 AI Overview、AI Mode 的直接输入里拿掉，写在 [robots 摘要指令实测](/zh/blog/zh/robots-snippet-controls-ai-overviews-2026)。今天不再跑那套解析。上面又多了一层属性开关。

## 无障碍树就是代理在读的那棵

指南末尾写的是浏览器代理。订座、比参数。和搜索引用不是一回事。下手的表面一样。[web.dev 的 agent-friendly 说明](https://web.dev/articles/ai-agent-site-ux) 列了三条路：截图、原始 HTML、无障碍树。

无障碍树留下角色、名字、状态，丢掉装饰。屏幕阅读器用的就是这棵。把 `div` 做成按钮的样子，只读 DOM 的那边看不见按钮。只看截图的那边知道位置，仍不知道动作。

剩下的实现很土。按钮用 `button` 和 `a`。输入配 `label for`。别用透明层挡住点击区域。别让每个类目的布局乱跳。这既是 WCAG 的活，也不是给代理另做一种格式。

web.dev 写过，只信截图的路径又慢又贵。主路径放在树和 DOM 上，爬虫读的文本和代理读的角色就从同一套标记出来。和再埋一段给搜索看的隐藏文案，方向相反。

## 周一先对哪一层

```bash
curl -sI https://example.com/llms.txt | head -n 1

curl -sL https://example.com/robots.txt > /tmp/live-robots.txt
diff -u public/robots.txt /tmp/live-robots.txt
```

这两行看不到 Search Console 的开关。那一层在资源设置里。

该删的：为 Google Search 新建 `llms.txt`、专用 AI markdown、生成式搜索专用 schema.org、给模型切段、按问法铺页、把第三方“内部指标”当发布门禁。

该留的：收录和摘要资格、线上 robots.txt 对 git 的 diff、父子资源的生成式 AI 控制、语义 HTML、富结果 JSON-LD 的目的栏改成“富结果资格”而不是“生成式搜索必需”。

纳入开着、摘要开着、已经收录，Google 也没答应一定把这页捡起来。今天量的是资格在哪一层断，不是效果有多大。

线上 robots.txt 和 git 对不上，或者父资源上开关在哪都找不到，把那一页拿来就行。我对的是官方文档和线上实际送出的字节。
---
*来源：Google Search Central [生成式 AI 功能优化指南](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)（2026-07-10 更新）、[AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)、[第三方 SEO 建议指南](https://developers.google.com/search/docs/fundamentals/third-party-seo)、[生成式 AI 效果报告公告](https://developers.google.com/search/blog/2026/06/gen-ai-performance-reports)（2026-06-03）、Search Console 帮助 [Search generative AI control](https://support.google.com/webmasters/answer/16908024)·[Generative AI performance report](https://support.google.com/webmasters/answer/16984139)、web.dev [Build agent-friendly websites](https://web.dev/articles/ai-agent-site-ux)（均为官方）。正文四段英文引用均从原页取回、折叠空白后对照，引用旁附原文链接。线上测量：2026-08-14，`https://jangwook.net` 的 robots.txt、llms.txt、8 个页面，curl + HTML 解析。原始数据 `data/official-geo-gsc-control-probe-2026.json`，图 `scripts/chart-official-geo-gsc-control.py`。未登录 Search Console。Content-Signal 仅出现在线上 robots.txt，未确认为 Search Central robots.txt 支持规则。结构化数据和该开关都不保证排名。*
