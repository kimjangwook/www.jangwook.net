---
title: 'sitemap.xml 里，Google 真正会读的只有 lastmod'
description: '给首页加上 priority 1.0 和 changefreq always，Google 全部丢弃。官方文档只用一个字段——lastmod，而且只在它可验证地准确时才用。我用官方 XSD 实际跑了三种 sitemap，看清什么通过校验、什么被悄悄忽略。'
pubDate: '2026-07-08'
heroImage: '../../../assets/blog/sitemap-lastmod-crawl-scheduling-2026/hero.png'
tags:
  - SEO
  - 站点地图
  - 抓取
  - Web开发
relatedPosts:
  - slug: multilingual-blog-technical-audit-campaign-2026
    score: 0.7
    reason:
      ko: "이 글의 「sitemap을 CI XSD 검증으로 굳혀라」를 실제로 실천한 기록이다. 감사를 한 번의 이벤트가 아니라 빌드 게이트 루프로 만든 캠페인."
      ja: "本記事の「sitemapをCIのXSD検証で固めろ」を実践した記録。監査を一度きりではなくビルドゲートのループにしたキャンペーン。"
      en: "The campaign that practiced this post's 'lock the sitemap with CI XSD validation' advice, turning an audit into a build-gate loop instead of a one-off."
      zh: "把本文「用 CI 的 XSD 校验把 sitemap 固定住」真正落地的记录——把审计做成构建门禁的循环，而非一次性事件。"
  - slug: hreflang-reciprocity-audit-multilingual-2026
    score: 0.64
    reason:
      ko: "sitemap과 나란히 다국어 사이트의 신뢰 신호를 이루는 hreflang을 30줄 스크립트로 직접 감사한 글. lastmod처럼 「정확하지 않으면 무시된다」는 원리가 똑같이 걸린다."
      ja: "sitemapと並んで多言語サイトの信頼信号をなすhreflangを、30行スクリプトで自ら監査した記事。lastmodと同じく「正確でなければ無視される」原理が効く。"
      en: "A hands-on audit of hreflang, the multilingual trust signal that sits alongside sitemaps, done with a 30-line script. The same 'inaccurate means ignored' principle as lastmod applies."
      zh: "用 30 行脚本亲手审计 hreflang——它和 sitemap 一样是多语言站点的信任信号。和 lastmod 同理:不准确就被忽略。"
  - slug: ai-crawler-control-robots-txt-llms-txt-2026
    score: 0.6
    reason:
      ko: "sitemap이 「무엇이 바뀌었나」를 알린다면, robots.txt는 「누구에게 보여줄까」를 정한다. 이 글에서 다룬 Sitemap 지시줄과 크롤러 노출 판단이 그 글로 이어진다."
      ja: "sitemapが「何が変わったか」を伝えるなら、robots.txtは「誰に見せるか」を決める。本記事のSitemap行とクローラー露出の判断がそこへ繋がる。"
      en: "If a sitemap says what changed, robots.txt decides who gets to see it. This post's `Sitemap:` directive and crawler-exposure calls lead straight into that one."
      zh: "如果说 sitemap 告诉的是「什么变了」，robots.txt 决定的是「让谁看见」。本文里的 `Sitemap:` 指令与爬虫暴露判断，正接到那篇。"
  - slug: json-ld-graph-entity-linking-2026
    score: 0.54
    reason:
      ko: "「검증기 초록불이면 끝」이라는 착각을 구조화 데이터 쪽에서 깬 글. 여기선 XSD가 통과해도 필드가 무시되고, 저기선 JSON-LD가 유효해도 조각이 안 이어진다. 같은 함정의 두 얼굴."
      ja: "「バリデータが緑なら完了」の錯覚を構造化データ側で崩した記事。こちらはXSDを通っても無視され、あちらはJSON-LDが有効でも断片が繋がらない。同じ罠の別の顔。"
      en: "The structured-data counterpart to this post's 'a green validator isn't the finish line.' Here the XSD passes but fields are ignored; there JSON-LD is valid but the pieces don't link. Two faces of one trap."
      zh: "从结构化数据一侧戳破「校验器亮绿就完事」的错觉。这边 XSD 过了字段却被忽略，那边 JSON-LD 有效碎片却连不起来。同一个陷阱的两张脸。"
---

随便打开一个生成的 sitemap，首页上大概率有 `<priority>1.0</priority>`，下面紧跟着 `<changefreq>always</changefreq>`。这两行到达 Google 爬虫的那一刻，会被整段丢掉。官方文档写得明明白白。

我第一次确认这件事时有点泄气。我们的工具惯性吐出的字段，一半是装饰。更糟的是：Google 唯一在意的那个字段，恰恰是大多数站点写错的那个。它叫 `lastmod`。今天我做了三种 sitemap，用 sitemaps.org 的官方模式(XSD)逐一校验，具体看清什么通过、什么被默默丢弃。下面每一段日志，都是一次性沙箱里的真实输出。

## 为什么 priority 1.0 到不了爬虫的决策

先拆掉一个误解。sitemap.xml 不是一个告诉搜索引擎「按这个顺序、这个重要度去抓这些页面」的文件。很多开发者把 `priority` 当成排名权重，把 `changefreq` 当成抓取频率的命令。两个都想错了。

Google 在[官方文档](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)里直接写明它不用这两个字段:「Google ignores `<priority>` and `<changefreq>` values.」理由也讲了。`changefreq` 在概念上和 `lastmod` 重叠，`priority` 太主观，反映不了站内页面之间真实的相对重要度。想想也对。大部分站点给每个页面都打 `priority 0.8`，如果全是 0.8，那不是信息，是噪音。

于是只剩两个字段:`<loc>`(URL)和 `<lastmod>`(最后修改时间)。其中真正参与抓取调度的，只有 `lastmod`。而把这一个字段写对的站点，比你想的要少。每次构建都盖上当前时间。手搓日期格式然后搓坏。内容没变，却天天往上抬更新时间。这三件事，都是在教 Google 把你的 `lastmod` 归到「信不过」那一类。

## 从基础说起——sitemap 和 lastmod 到底做什么

有些读者没亲手做过 sitemap，那就先把地基打好。

sitemap.xml 是站点递给搜索引擎的一份 URL 清单。格式由 [sitemaps.org 协议 0.9](https://www.sitemaps.org/protocol.html) 标准化，就是一段简单的 XML:`<urlset>` 下面重复着 `<url>` 条目。每个条目唯一必填的是 `<loc>`。其余的 `<lastmod>`、`<changefreq>`、`<priority>` 全是可选。

关键在于,sitemap 是一个帮助<strong>发现(discovery)</strong>的工具。搜索引擎靠跟随链接找页面，但链接埋得深的页面、刚发布的页面，容易漏掉。sitemap 一次性告诉它「这里有这些 URL」，提高被发现的概率。就这么多。它不抬排名，也不保证被收录。

那 `lastmod` 为什么特别?对搜索引擎来说，关于一个已知 URL 最贵的决定，是什么时候再访问它。几万个页面不可能每天全部重抓，所以必须排优先级:「这个页面最近变了，先看它。」`lastmod` 就是喂给这套调度的输入。Google 在[宣布 ping 端点下线的 2023 年官方博客](https://developers.google.com/search/blog/2023/06/sitemaps-lastmod-ping)里说明，它把 lastmod 当作「为已发现 URL 安排重抓」的信号。准确就有用，不准就被忽略。一个有条件的信号。

「准确」的判定才是要害。文档的原话是:Google 只在 lastmod「consistently and verifiably (for example by comparing to the last modification of the page) accurate」时才用它。翻成人话:当爬虫真的取回页面、比对它的最后修改状态时，你 sitemap 里的 lastmod 不能和它矛盾。每次构建都盖 `new Date()`，正文却纹丝不动,被比对几次之后，你整站的 lastmod 就失去可信度。

## 用官方模式跑了三个 sitemap

光说没感觉，就实际测。我在一次性沙箱里拉下 sitemaps.org 的官方 XSD，用 `xmllint --schema` 校验三种 sitemap。目的只有一个:亲眼看清「通过模式校验」和「对 Google 有用」是多么不同的两回事。

第一种是随处可见的样子。字段填满。

```xml
<url>
  <loc>https://example.com/</loc>
  <lastmod>2026-07-08</lastmod>
  <changefreq>always</changefreq>
  <priority>1.0</priority>
</url>
```

第二种是手搓日期时常犯的错。用空格代替 `T` 分隔符，还漏掉时区。

```xml
<lastmod>2026-07-08 15:20:00</lastmod>
```

第三种是我推荐的。把多余字段全部去掉，只留一个带时区偏移的 W3C Datetime 格式 lastmod。

```xml
<lastmod>2026-07-08T15:20:11+09:00</lastmod>
```

官方 XSD 对这三种给出的结果如下。

```
# [A] priority + changefreq 填满
$ xmllint --noout --schema sitemap.xsd sitemap-bad.xml
sitemap-bad.xml validates

# [B] 手搓 lastmod "2026-07-08 15:20:00"
$ xmllint --noout --schema sitemap.xsd sitemap-malformed.xml
element lastmod: Schemas validity error :
  '2026-07-08 15:20:00' is not a valid value of the union type 'tLastmod'.
sitemap-malformed.xml fails to validate

# [C] 只有准确的 W3C Datetime lastmod
$ xmllint --noout --schema sitemap.xsd sitemap-good.xml
sitemap-good.xml validates
```

![用官方 sitemap XSD 对三种 sitemap 做 xmllint 校验的真实日志](../../../assets/blog/sitemap-lastmod-crawl-scheduling-2026/xmllint-validation.png)

三个结果，各给一个教训。

[A] 是最大的陷阱。带着 `priority 1.0` 和 `changefreq always` 的 sitemap<strong>通过</strong>了模式校验。XSD 只看语法。Google 会丢掉那些字段这件事，不在模式的管辖范围内。所以你一旦相信「sitemap validator 亮绿灯」,就会一边搬运着一堆毫无作用的字段，一边以为自己做对了。通过校验和真正有用，是两码事。

[B] 反过来,是实务里经常冒出来的 bug。不用库、把日期拼成字符串，随手用了 `Date` 的默认字符串或本地化格式，而不是 `toISOString()`，就成了这样。`tLastmod` 联合类型接受 `2026-07-08` 这种单独日期，也接受 `2026-07-08T15:20:11+09:00` 这种完整 datetime，但拒绝用空格连接的 `2026-07-08 15:20:00`。这已经不是 Google 忽略你的层面,而是在模式这一步就坏了，Search Console 可能会以解析错误把整份 sitemap 退回。

[C] 通过。这就是目标状态。

## 怎样真正生成一个准确的 lastmod

那关键就是怎么自动产出 [C]。守住一条原则就够了:<strong>lastmod 应该是内容真正改变的时刻，而不是你构建的时刻。</strong>

最简单的近似是文件修改时间(mtime)。静态站点里，读每个页面源文件的 mtime，直接当 lastmod,你就有了一个可验证的依据:「这个文件最后一次变动的时间。」沙箱里跑的生成器就是这个。

```javascript
import { readdirSync, statSync } from 'node:fs';

// W3C Datetime + 本地时区偏移 (例如 2026-07-08T15:26:10+09:00)
function w3cLocal(d) {
  const p = (n) => String(n).padStart(2, '0');
  const tz = -d.getTimezoneOffset();
  const sign = tz >= 0 ? '+' : '-';
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}` +
    `T${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}` +
    `${sign}${p(Math.floor(Math.abs(tz) / 60))}:${p(Math.abs(tz) % 60)}`;
}

const urls = readdirSync('content')
  .filter((f) => f.endsWith('.html'))
  .map((f) => ({
    loc: 'https://example.com/' + (f === 'index.html' ? '' : f.replace(/\.html$/, '')),
    lastmod: w3cLocal(statSync(`content/${f}`).mtime),
  }));
```

隔一秒建两个文件，跑这个生成器，出来是这样。

```
<lastmod>2026-07-08T15:26:10+09:00</lastmod>   index.html
<lastmod>2026-07-08T15:26:11+09:00</lastmod>   about.html
```

两个页面的 lastmod 各自跟着真实修改时间，盖出了不同的值。这种「各不相同」很重要。如果整站共用一个构建时间戳，Google 会读成「这个站声称每次全部页面同时改动」，然后把信号扔掉。只有每个文件盖上自己真实的变动时间,信任才会累积。

mtime 也有软肋。检出仓库或用 rsync 部署，mtime 会被重置。所以更稳的做法是用版本控制的历史。用 Git 时，把每个文件的最后提交时间当作它的 lastmod。

```bash
git log -1 --format=%cI -- content/about.html
# 2026-07-08T15:26:11+09:00
```

`%cI` 把提交时间以 ISO 8601(兼容 W3C Datetime)输出。不需要格式转换，也更贴近「这个文件最后一次有意义的改动」这个定义。我在多语言博客上用的就是这套。用构建门禁在 CI 里强制 sitemap 和 hreflang 的做法，我写在[审计多语言博客并让修复不再回退的那次行动](/zh/blog/zh/multilingual-blog-technical-audit-campaign-2026)里，那篇的核心也是把审计做成循环而非一次性事件。

还有一条。lastmod 只在<strong>有意义的</strong>改动时更新。改个错别字、把页脚年份换一下，不该动 lastmod。每次都喊「变了」的 sitemap 就成了狼来了。空跑几次之后，爬虫从此忽略你的 lastmod。只有正文、标题、核心结构真的变了，才抬时间。

## lastmod 不会替你做的事(诚实的边界)

读到这里若总结成「放准确的 lastmod，抓取就会更快」，那只对一半。把文档里的边界原话搬过来:「Keep in mind that submitting a sitemap is merely a hint: it doesn't guarantee that Google will download the sitemap or use the sitemap for crawling URLs on the site.」提交 sitemap 只是一个<strong>提示</strong>,既不保证 Google 会下载它，也不保证会据它抓取。lastmod 准确也一样。它是一个<strong>可能影响</strong>重抓调度的信号，不是<strong>强制</strong>抓取的命令。

而且 sitemap 与收录无关。被抓取不等于被收录，进了 sitemap 不等于进了索引。排名就更不用说了。无论结构化数据还是 sitemap,没有哪个 SEO 要素能保证排名——这是 Google 一贯的官方口径。lastmod 给你的，是让「对已发现页面的重访优先级」判断，多一点更准的依据。仅此而已。

再补一条,2023 年起 sitemap 的 ping 端点已经废弃。以前 sitemap 一变就调用 `google.com/ping?sitemap=...` 去通知,现在那个端点已经死了。搜索引擎按自己的节奏来取 sitemap。sitemap 的位置，用 robots.txt 里的 `Sitemap:` 行或 Search Console 登记一次就够,如果还留着每次变更就 ping 的代码，删掉即可。让哪些爬虫看到 sitemap、拦住哪些，这个判断和[用 robots.txt 与 llms.txt 控制 AI 爬虫](/zh/blog/zh/ai-crawler-control-robots-txt-llms-txt-2026)也是连着的。

## 今天就能用的检查清单

收拢一下，动 sitemap.xml 时现在就能做的:

- <strong>删掉</strong> `<priority>` 和 `<changefreq>`。Google 忽略它们，其他主流引擎实际上也不信。删了文件更轻，意图也更清楚。
- `<lastmod>` 从内容变更时间(文件 mtime 或 Git 提交时间)生成,<strong>不要</strong>用构建时间。
- 格式用 W3C Datetime。单独日期(`2026-07-08`)也有效，但条件允许时，带时区偏移的完整形式(`2026-07-08T15:20:11+09:00`)更精确。空格连接的形式会在模式这步坏掉。
- lastmod 只在<strong>有意义的改动</strong>时更新。不要因为错别字或自动重建就一次性抬高所有页面的时间戳。
- 在 CI 里加官方 XSD 校验。一行 `curl -s -o sitemap.xsd https://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd && xmllint --noout --schema sitemap.xsd public/sitemap.xml`，就能在部署前抓出解析错误。
- sitemap 位置在 robots.txt 的 `Sitemap:` 行和 Search Console 各登记一次。每次变更就 ping 的代码,既已废弃就删掉。

单靠一份 sitemap，排名不会涨。但爬虫会不会<strong>及时且信任地</strong>跟上你站点的变化，拼的就是这个小信号的准确度。而这份准确度，靠的不是模式校验的绿灯，而是 lastmod 有没有和内容的真实状态对得上。

无论结构化数据还是 sitemap，搜索与 AI 爬虫究竟怎样接收你服务器发出的信号，光读文档是抓不住的。比如[AI 爬虫不会执行你的 JavaScript，会把 CSR 页面整个漏掉](/zh/blog/zh/ai-crawlers-dont-render-javascript-csr-2026)这个事实，也得自己用 curl 打一遍才看得出来。如果你在权衡服务端渲染与爬虫处理，或想让多语言站点的 sitemap、hreflang 流水线经过审查并用 CI 门禁固定下来，我个人接咨询与实现的委托。通过我资料页上的联系方式，把你站点的情况告诉我就好。
