---
title: '官方 GEO 指南先划掉的几项，以及 Search Console 里多出的开关'
description: 'Google 官方生成式 AI 指南写明：llms.txt 和专用 schema 可忽略。开发者该看的是 Search Console 的纳入开关，以及线上 robots.txt，不是 git 里那份。'
pubDate: '2026-08-14'
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
      ko: 그 글이 페이지 단위 nosnippet·max-snippet이 AI Overview 입력까지 잠그는 레버라면, 이 글은 그 위에 얹힌 속성 단위 Search Console 스위치와 공식 빼기 목록을 맞춘다.
      ja: あちらがページ単位の nosnippet・max-snippet で AI Overview 入力を閉じるレバーなら、こちらはその上に載るプロパティ単位の Search Console スイッチと公式の引き算リストを揃える。
      en: "That post is the page-level lever. nosnippet and max-snippet close AI Overview input. This one sits above it with the property-level Search Console switch and the official subtraction list."
      zh: 那篇是页面级开关，nosnippet、max-snippet 会关掉 AI Overview 的输入。这篇叠在上面：属性级 Search Console 开关，以及官方划掉的清单。
  - slug: ai-crawler-control-robots-txt-llms-txt-2026
    score: 0.86
    reason:
      ko: 크롤러를 들일지 말지는 그 글의 robots.txt 설계다. 오늘은 그 파일이 라이브에서 CDN 접두를 입고 길어졌고, 공식은 llms.txt를 Google Search가 무시한다고 다시 못 박은 지점을 잰다.
      ja: クローラーを入れるかはあちらの robots.txt 設計だ。今日はそのファイルがライブで CDN 接頭辞を着て長くなり、公式が llms.txt を Google Search は無視すると再確認した地点を測る。
      en: Whether a crawler gets in is that post's robots.txt design. Today the live file grew a CDN prefix, and the official guide restated that Google Search ignores llms.txt.
      zh: 爬虫进不进门，是那篇的 robots.txt 设计。今天量的是线上文件被 CDN 前缀拉长，以及官方再次写明 Google Search 会忽略 llms.txt。
  - slug: faqpage-deprecation-ai-citation-2026
    score: 0.74
    reason:
      ko: 검증기를 통과한 FAQPage가 리치 결과에서는 이미 끝난 이야기라면, 생성형 검색용 전용 스키마를 더 얹는 일도 같은 함정이다. 자격과 노출은 따로 논다.
      ja: 検証を通った FAQPage がリッチリザルトではすでに終わっているなら、生成検索用の専用スキーマを足すのも同じ罠だ。資格と露出は別物である。
      en: If a valid FAQPage already stopped producing a rich result, adding a special schema just for generative search is the same trap. Eligibility and appearance are not the same job.
      zh: 若通过校验的 FAQPage 在富结果里已经收场，再为生成式搜索加一套专用 schema，是同一个坑。资格和露出不是一回事。
  - slug: validate-structured-data-ci-jsonld-2026
    score: 0.7
    reason:
      ko: JSON-LD를 CI에서 막는 일은 리치 결과 자격을 지키는 쪽에 남는다. 공식은 그 마크업이 생성형 검색의 필수 조건이 아니라고 했으니, 게이트의 목적을 다시 적어야 한다.
      ja: JSON-LD を CI で止める仕事はリッチリザルト資格を守る側に残る。公式はそのマークアップが生成検索の必須ではないとしたので、ゲートの目的を書き直す必要がある。
      en: Catching JSON-LD in CI still belongs on the rich-result side. Official guidance says that markup is not required for generative search, so the gate's purpose has to be rewritten.
      zh: 在 CI 里拦住 JSON-LD，仍然是在守富结果资格。官方说这套标记不是生成式搜索的必要条件，门禁的目的得重写。
  - slug: json-ld-graph-entity-linking-2026
    score: 0.64
    reason:
      ko: 엔티티를 @graph로 묶는 작업은 사라지지 않는다. 다만 그 작업의 이유를 "AI Overview 전용 최적화"로 쓰면 공식 문서와 어긋난다.
      ja: エンティティを @graph で結ぶ仕事は消えない。ただしその理由を「AI Overview 専用最適化」と書くと公式文書とずれる。
      en: Linking entities in an @graph does not go away. Calling that work an AI Overview-only optimization, though, is out of line with the official guide.
      zh: 用 @graph 把实体串起来，这件事不会消失。但若把理由写成“AI Overview 专用优化”，就和官方指南拧着了。
---

仓库里的 `public/robots.txt` 是 45 行。线上 `https://jangwook.net/robots.txt` 是 106 行。同一天，`llms.txt` 返回 404。

第三方 GEO 清单却常把 `llms.txt` 放在第一行，后面跟着切段、专用 schema、按模型口味重写。Google Search Central 在 2026 年 5 月 15 日上线 [生成式 AI 功能优化指南](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)，7 月 10 日又改过一版。把那份指南读完，清单上半截该删。开发者要动手的新装置不是文件，是 Search Console 资源上的开关。

今天把官方原文和这个站点实际送出的字节放在一起。不谈排名，也不谈引用率。

![官方 GEO 是一份减法清单加一枚开关](../../../assets/blog/official-geo-subtraction-gsc-control-2026/hero.png)

## 生成式搜索到底捡哪类页面

先把词钉死。**AI Overview** 给难题一段要义，再挂上依据链接。**AI Mode** 处理比较、推理这类从前要搜好几轮的问题。两者都在 Google 搜索里，都从线上索引取页。Google 把过程写成叠在核心排名之上的 **RAG**，再加上 **query fan-out**：问怎么除草坪杂草，除草剂、无化学清除、预防可能被拆成并行检索。

资格比名字旧。页面得已被收录，并且有资格出摘要。[AI features and your website](https://developers.google.com/search/docs/appearance/ai-features) 里的句子是：

> There are no additional requirements to appear in AI Overviews or AI Mode, nor other special optimizations necessary.

出处：[AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)

没有额外技术门槛，也不需要特殊优化。同一页仍要求满足技术条件、垃圾政策、面向人的内容准则。都满足了，抓取、收录、展示也仍不保证。这和普通搜索是同一句留白。

摘要资格我测过一轮。`nosnippet` 和 `max-snippet:0` 会把页面从 AI Overview、AI Mode 的直接输入里拿掉，写在 [robots 摘要指令实测](/zh/blog/zh/robots-snippet-controls-ai-overviews-2026)。今天不再跑那套解析。上面又多了一层。

优化指南补了一句：除了搜索技术要求，站点还得在 Search Console 的生成式 AI 功能里被 **纳入**，才有资格出现在那些功能中。这是资源设置，不是模板工单。

## 官方先划掉的四行

“破除迷思”一节把 AEO、GEO 当成搜索体验优化的别名。立场就一句。

> From Google Search's perspective, optimizing for generative AI search is optimizing for the search experience, and thus still SEO.

出处：[Optimizing your website for generative AI features](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)

工程待办里该删的行因此清楚了。

| 市面上的条目 | 官方立场 | 代码和配置里做什么 |
| --- | --- | --- |
| `llms.txt` 和专用 AI 文件 | Google Search 不用。做了既不帮也不害可见度、排名 | 不为 Google Search 新建。只有别的系统要读时才留 |
| 为模型把文章切碎 | 不要求。文档写明能理解一页里的多个主题 | 篇幅按读者来定 |
| 只为 AI 重写 | 能理解同义和意思，不必为每个长尾单独成页 | 保留给人看的稿。按问法铺页会撞上 [scaled content](https://developers.google.com/search/docs/essentials/spam-policies#scaled-content) |
| 生成式搜索专用 schema.org | 不需要，也没有专用标记 | 富结果用的标记留下，不要新做“AI Overview 专用 schema” |

`llms.txt` 那句更直。

> Doing so will neither harm nor help your site's visibility or rankings in Google Search, as Google Search ignores them.

出处：同一份 [优化指南](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) 的 LLMS.txt 项

对 Google Search 而言，无害也无益。别的服务要读，可以留。Google Search 的任务清单里应拿掉。若已经用 [robots.txt 把训练爬虫和搜索爬虫分开](/zh/blog/zh/ai-crawler-control-robots-txt-llms-txt-2026)，今天要去掉的是“Google 会读这份文件”的误会。

结构化数据那一段要读两遍。生成式搜索不要求它，也没有专用类型。富结果资格仍用它，所以还可以留在整体 SEO 里。我不当成“删掉 JSON-LD”，而当成“别因为有了 AI Overview 再加一种类型”。结构化数据从不保证排名，也不保证被引用。

满网种不真实提及，官方也认为没那么有用。核心排名看质量，另一套系统拦垃圾，生成式功能靠这两边。这不该进开发工单。

第三方工具声称能看到“内部指标”，同一份指南也砍掉了。没有任何第三方工具能进入内部排名或 AI 系统。[第三方 SEO 建议评估指南](https://developers.google.com/search/docs/fundamentals/third-party-seo) 要求拿 AEO、GEO 建议去对官方文档。工具可以进工作流，数字不能当成 Google 自己的数。

## Search Console 上的开关，以及谁继承它

“须纳入 Search Console”指向帮助文档里的 [Search generative AI control](https://support.google.com/webmasters/answer/16908024)。路径是 Settings > Search generative AI。

三个选项：纳入站点的链接和内容；排除；跟随父资源。纳入是所有资源的默认值。排除之后，AI Overview、AI Mode、Discover 里的生成式功能不再用你的链接，也不再拿你的内容做 grounding，那些功能带来的展示和流量也没有。

限度用原文钉住。

> This control only affects whether your content can appear in certain Search generative AI features; this control isn't used as a ranking or inclusion signal affecting other parts of Search.

出处：[Search generative AI control](https://support.google.com/webmasters/answer/16908024)

不是搜索其余部分的排名信号。也不是训练开关。限制训练走 [Google-Extended](https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers#google-extended)，整站退出搜索走 `noindex`。控制生效后，排除一般要 1〜2 天，缓存还可能拖长。

这是组织问题。有人在域名资源上点了排除，未单独设置的 URL-prefix 子资源会继承。博客就算挂在 `https://example.com/blog/`，父资源先动手，子资源默认跟着走。HTML 再干净、robots.txt 再细分，属性开关关掉，生成式功能的资格就在这一层断掉。

控制和报告都还在向部分站点开放。2026 年 6 月 3 日的 [生成式 AI 效果报告公告](https://developers.google.com/search/blog/2026/06/gen-ai-performance-reports) 写明是子集。报告里的数是展示次数，不是点击，也不是名次。Search Labs 实验数据不计入。看不见界面，不等于已被排除。可能还没轮到，也可能生成式展示还不够。

写这篇时我没有登录 Search Console。我的资源有没有这个菜单，这里不断言。能断言的是：文档里的默认是纳入，继承关系写在帮助页上。

按团队重排顺序：先看父域名资源的当前值，记下每个子 URL-prefix 是在继承还是手动覆盖，再查模板里的 robots meta 和线上 robots.txt。顺序反了，改一周标记也解释不了为什么生成式功能里整站不在。文档已经写了 1〜2 天，当天下午报告没动，不够构成回滚理由。改 HTML 的人和握 Search Console 的人若分属两组，这一层进不了代码评审。

![资格是三层](../../../assets/blog/official-geo-subtraction-gsc-control-2026/three-layers.png)

## 线上 robots.txt 和 git 不是同一份

读完官方减法之后，我没有新建文件，而是把爬虫会拿到的字节拉下来。2026 年 8 月 14 日，只动 `https://jangwook.net` 的公开面。

```bash
curl -sI https://jangwook.net/llms.txt
# HTTP/2 404

curl -sL https://jangwook.net/robots.txt | wc -l
# 106

# 仓库 public/robots.txt：45 行，1,101 字节
# 线上响应：106 行，2,937 字节
```

`llms.txt` 是 404。`LLMs.txt` 和 `www` 主机一样。这和“没有专门放一份 Google Search 声明会忽略的文件”对得上。

robots.txt 对不上。仓库那份 45 行：挡住训练爬虫（`GPTBot`、`ClaudeBot`、`CCBot`、`Google-Extended`），搜索爬虫和 `*` 只挡跨语言 URL。线上响应前面多了一段 CDN 管理前缀，变成 106 行。`User-agent: *` 带着 `Content-Signal: search=yes,ai-train=no,use=reference`，若干训练和扩展爬虫再写一遍 `Disallow: /`。仓库正文还在，跟在前缀后面。

![git 里的 robots.txt 与线上响应的行数](../../../assets/blog/official-geo-subtraction-gsc-control-2026/robots-live-vs-git.png)

在本文所用的 Search Central robots.txt 材料里，我没有把 `Content-Signal` 确认为受支持的规则。文件里写着，和 Googlebot 会消费这个词，是两层说法。后者这里不断言。把它当第三方惯例，不要当成 Google Search 资格的依据。

八个页面（`/`、`/ko/`、`/en/`、`/ko/blog/`、三篇文章、`/ko/contact/`）都是 HTTP 200。`<meta name="robots">` 零条，`data-nosnippet` 属性零个。有的文章描述里出现了 nosnippet 这个词，那是正文，不是指令。默认模板在未开 `noindex` 时不输出 robots 标签。

首页 JSON-LD 里有 `Organization`、`Person`、`WebSite`，文章里有 `BlogPosting`、`WebPage`、`BreadcrumbList`。按今天的官方表述，这些标记不是生成式搜索的入场券，仍留在富结果和实体整理一侧。和 [FAQ 富结果结束后仍留下问答标记](/zh/blog/zh/faqpage-deprecation-ai-citation-2026) 是同一条线。校验通过和搜索露出从来不是同一件事。

线上和 git 的分叉，才是今天的实测。若把 GEO 理解成“往仓库加一个文件”，爬虫正在读的那份已经在仓库外面变长了。该 diff 的是已部署的 URL，不是 `public/robots.txt` 自己跟自己比。

## 智能体读的也包括无障碍树

指南末节谈到浏览器智能体：代订、比参数。和搜索引用不是同一类活，动手的表面却一样。[web.dev 的 agent-friendly 说明](https://web.dev/articles/ai-agent-site-ux) 写了三条路径：截图、原始 HTML、无障碍树。

无障碍树留下角色、名字、状态，丢掉视觉装饰。屏幕阅读器用的就是这棵树。把 `div` 扮成按钮，只读 DOM 的一侧看不见按钮，只看截图的一侧可能知道位置，仍不知道动作。语义 HTML 和 `label for` 不是刷分，是避免机器猜错动作。

优化指南谈语义 HTML 时，说的是人好读、辅助技术好解析，不是“完美代码”。整个网页本就不是合法 HTML，Google 也能读。即便如此仍建议用语义标签，理由不只是搜索爬虫。智能体走同一棵树。

剩下的实现很素。按钮用 `button` 和 `a`。输入绑 `label for`。别用透明遮罩挡住可点区域。别让布局按类目乱跳。这既是在重做 WCAG，也不是在发明智能体专用格式。

web.dev 还写：只信截图的路径又慢又贵，结构发糊时才当备用。主路径放在树和 DOM 上，爬虫读的文本和智能体读的角色就从同一套标记出来。这和再塞一层给搜索看的隐藏文字，方向相反。

## 待办里删哪几行，留哪几行

对照之后我站的边是：官方 GEO 文档不是加法指南。它先划掉市面条目，再留下搜索一直在用的技术面，以及 Search Console 上的一枚开关。

删：

- 为 Google Search 新建 `llms.txt`、专用 AI Markdown、生成式搜索专用 schema.org
- 为模型切段、只为 AI 重写、按问法铺页
- 把第三方“内部指标”写成发布门禁

留：

- 收录和摘要资格。模板里有没有误挂的 `nosnippet`，`noindex` 是否只出现在打算屏蔽的页
- 用 URL 拉取线上 `robots.txt`，和 git 做 diff。CDN 前缀有没有把训练爬虫和搜索爬虫弄反
- 父子资源上的生成式 AI 控制。默认是纳入。看不见界面，可能只是还没轮到，不要当成已被排除
- 语义 HTML 和无障碍树。给智能体看的不是新格式，是现有标记
- 富结果 JSON-LD 的目的栏，从“生成式搜索必需”改回“富结果资格”

能立刻跑的最小命令：

```bash
curl -sI https://example.com/llms.txt | head -n 1

curl -sL https://example.com/robots.txt > /tmp/live-robots.txt
diff -u public/robots.txt /tmp/live-robots.txt

python3 - <<'PY'
import re, sys, urllib.request
html = urllib.request.urlopen(sys.argv[1]).read().decode("utf-8", "ignore")
print("robots meta:", re.findall(r"<meta[^>]+name=[\"']robots[\"'][^>]*>", html, re.I))
print("data-nosnippet attrs:", len(re.findall(r"<[^>]+data-nosnippet", html, re.I)))
PY
https://example.com/your-page/
```

这三行仍然看不见 Search Console 开关。那一层在资源设置里，不在浏览器里。只靠代码评审堵不上。

生成式功能的露出没有保证。维持纳入、摘要资格还在、页面已被收录，Google 也不承诺会捡这一页。今天量的是资格分层，不是效果大小。

仓库、线上 URL、资源设置对完，仍看不出哪一层断了，把那一层拿来就行。我对的是官方文本和实际发出的字节。
---
*来源：Google Search Central [生成式 AI 功能优化指南](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)（2026-07-10 更新）、[AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)、[第三方 SEO 建议指南](https://developers.google.com/search/docs/fundamentals/third-party-seo)、[生成式 AI 效果报告公告](https://developers.google.com/search/blog/2026/06/gen-ai-performance-reports)（2026-06-03），Search Console 帮助 [Search generative AI control](https://support.google.com/webmasters/answer/16908024)、[Generative AI performance report](https://support.google.com/webmasters/answer/16984139)，web.dev [Build agent-friendly websites](https://web.dev/articles/ai-agent-site-ux)（均为官方）。正文四段英文块引均取自对应页面，空白折叠后对照，引用旁附原文链接。线上测量：2026-08-14，`https://jangwook.net` 的 robots.txt、llms.txt 与 8 个页面，curl + HTML 解析。原始数据 `data/official-geo-gsc-control-probe-2026.json`，图 `scripts/chart-official-geo-gsc-control.py`。未登录 Search Console。Content-Signal 只出现在线上 robots.txt，未确认为 Search Central robots.txt 支持规则。结构化数据和此开关均不保证排名。*
