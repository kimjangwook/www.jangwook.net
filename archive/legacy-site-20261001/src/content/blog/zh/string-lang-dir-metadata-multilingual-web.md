---
title: 我的聚合 RSS 混着四种语言的 1,248 条，没有一条标了语言
description: W3C 在 2026-07-16 公开了字符串语言与方向元数据的首份草案。我照着它审计了自己的四语站点，发现聚合 RSS 的 1,248 条内容全是无标注输出。这里有实测、修复代码和防回归的构建关卡。
pubDate: '2026-07-20'
heroImage: ../../../assets/blog/string-lang-dir-metadata-multilingual-web/audit-summary.png
tags:
  - i18n
  - w3c
  - web-development
relatedPosts:
  - slug: hreflang-reciprocity-audit-multilingual-2026
    score: 0.84
    reason:
      ko: "저 글은 페이지끼리의 언어 관계(hreflang)를 감사했다. 이 글은 한 단계 더 안쪽, 페이지가 실어 나르는 문자열 자체에 언어 표시가 붙어 있는지를 잰다. 같은 사이트, 같은 감사 루프의 다음 층이다."
      ja: "あちらはページ間の言語関係(hreflang)の監査。本稿はもう一段内側、ページが運ぶ文字列そのものに言語表示が付いているかを測る。同じサイト、同じ監査ループの次の層。"
      en: "That post audits the language relationship between pages (hreflang). This one goes a layer deeper: whether the strings those pages carry declare their own language. Same site, next floor of the same audit loop."
      zh: "那篇审计的是页面之间的语言关系（hreflang）。本文再往里一层，测的是页面所承载的字符串本身有没有标出语言。同一个站点，同一条审计回路的下一层。"
  - slug: json-ld-graph-entity-linking-2026
    score: 0.78
    reason:
      ko: "@graph로 구조화 데이터를 하나로 묶은 그 글의 결과물이 이번 감사 대상이었다. 왜 그 @context에 @language를 넣지 않기로 했는지, 판단 근거가 이 글에 있다."
      ja: "@graphで構造化データを一つに束ねた、あの記事の成果物が今回の監査対象だった。なぜその@contextに@languageを入れないと決めたのか、その判断根拠が本稿にある。"
      en: "The @graph consolidation from that post is exactly what I audited here. Why I decided against adding @language to that @context is spelled out in this one."
      zh: "那篇把结构化数据用@graph合并的成果，正是本次审计的对象。为什么我决定不给那个@context加@language，理由写在本文里。"
  - slug: multilingual-blog-technical-audit-campaign-2026
    score: 0.75
    reason:
      ko: "'측정 → 최대 항목 수정 → 게이트로 상설화' 루프를 닷새간 돌린 기록이 저 글이다. 이 글은 그 루프를 한 번 더 돌린 결과이고, 이번에 추가된 게이트는 postbuild에 그대로 붙었다."
      ja: "「測る→一番効く箇所を直す→ゲートで常設化」のループを五日間回した記録があちら。本稿はそのループをもう一周した結果で、今回追加したゲートはpostbuildにそのまま繋いだ。"
      en: "That post is five days of running the measure-fix-gate loop. This is one more turn of the same loop, and the gate it produced is now wired into postbuild alongside the others."
      zh: "那篇是把「测量→修最要紧的一项→固化成关卡」这条回路跑了五天的记录。本文是同一条回路的又一圈，这次产出的关卡已经接进了postbuild。"
  - slug: accessible-name-agents-2026
    score: 0.68
    reason:
      ko: "접근성 이름이 틀리면 스크린리더가 엉뚱하게 읽는다는 이야기였다. 언어 표시가 없으면 그 스크린리더가 아예 틀린 언어의 음성 엔진으로 읽는다. 같은 문제의 한 칸 위 계층이다."
      ja: "アクセシブルネームが間違っていればスクリーンリーダーが変な読み方をする、という話だった。言語表示がなければ、そのスクリーンリーダーは そもそも別言語の音声エンジンで読む。同じ問題の一段上の階層。"
      en: "That one was about screen readers announcing the wrong thing when the accessible name is wrong. Without language metadata, the same screen reader reads the text with an entirely wrong voice engine. One layer up from the same problem."
      zh: "那篇讲的是可访问名称错了、屏幕阅读器就会念错。而没有语言标注时，同一个屏幕阅读器会直接用另一种语言的语音引擎去念。是同一问题的上一层。"
---

先说难看的那一半。我的站点对外输出一个聚合 RSS，把韩语、日语、英语、中文的文章按发布时间混在一条流里。我打开构建产物数了一下，1,248 条。整个 XML 里没有任何一处写着“这条是什么语言”。channel 上没有，item 上也没有。

订阅端怎么办？看字形猜。就这样。

W3C 国际化工作组在 2026 年 7 月 16 日同时公开了两份首次公开工作草案，其中一份 [Strings on the Web: Language and Direction Metadata](https://www.w3.org/TR/string-meta/) 正好瞄准的就是“看字形猜”这套做法。读完之后我照着它审了一遍自己的站，改了一处，然后把检查固化成构建关卡。下面所有数字都是那一轮跑出来的真实输出。

## 字符串一旦离开 HTML，语言就蒸发了

先把前提铺清楚，不然后面的测量看起来只像是在挑 XML 的毛病。

HTML 有 `lang` 和 `dir` 属性。写下 `<p lang="ar" dir="rtl">`，这段是阿拉伯语、从右往左读这个事实就钉在标记里了。浏览器照着渲染，屏幕阅读器挑阿拉伯语语音引擎，搜索引擎判定语言。标记语言天然带有可扩展的属性机制，所以这类附加信息从一开始就有地方安放。

麻烦在于，今天的字符串并不只走 HTML 这一条路。JSON API 响应、JSON-LD 结构化数据、RSS 与 Atom 订阅源、WebIDL 接口定义、各种配置文件。这些格式大多建立在“字符串就是字符串”的前提上。`{"title": "..."}` 里根本没有位置去说明这个 title 属于哪种语言。草案自己的说法是：JSON、WebIDL 这类非标记的数据语言通常不提供可扩展属性，设计之初就没有把语言和方向元数据考虑进去。

于是字符串从 HTML 装进 JSON 的那一刻，语言和方向就没了。CMS 传给 API，API 传给前端，前端再把它拼回 HTML，这一路上没有任何一环负责把这两个信息带着走。等到最后要渲染的那一端，能用的办法只剩一个：看字形猜。

草案的要求本身并不复杂。

> For any string field containing natural language text, it *MUST* be possible to determine the language and string direction of that specific string. Such determination *SHOULD* use metadata at the string or document level and *SHOULD NOT* depend on heuristics.

摘要开头那句更直白：

> This document describes the best practices for identifying the language and direction for strings used on the Web.

注意 `SHOULD NOT depend on heuristics` 这半句。它把矛头指向的，是几乎每个多语言项目都在用的那招：`dir="auto"`。

## 草案建议的形状：三个字段、三个取值

具体做法草案说得不算复杂。单语言字段用 `{value, lang, dir}` 这样一个三元组来装，值旁边就放着它的语言和方向。文档级也可以声明 `language` 和 `direction` 当默认值，但有个硬约束：字符串级的元数据**必须**能够覆盖文档级的。要装多语言内容，就用以语言标签为键的 language map。方向的取值被卡死在三个上，`ltr`、`rtl`、`auto`，没有别的。JSON-LD 这边，路径是 `@context` 里的 `@language` 和 `@direction`。

同一天发布的另一份是 [Character Model for the World Wide Web: String Matching](https://www.w3.org/TR/charmod-norm/)，管的是字符串比较与规范化，跟这一份互为邻居。

两份都是 FPWD，草案原文自己写得很清楚：

> This is a draft document and may be updated, replaced, or obsoleted by other documents at any time. It is inappropriate to cite this document as other than a work in progress.

这句我不打算跳过。它决定了后面哪些事我做了、哪些事我按住没做。

## 把 first-strong 写出来，跑 14 条字符串

`dir="auto"` 背后是 first-strong 启发式：从头扫字符，遇到第一个强方向字符就据此定方向。草案对它的批评是这么写的：

> The main problem with this approach is that it produces the wrong result for (1) strings that begin with a strong character with a different directionality than that needed for the string overall (eg. an Arabic tweet that starts with a hashtag) (2) strings that don't have a strong directional character (such as a telephone number), which are likely to be displayed incorrectly in a RTL context.

光看描述不够，我用 Python 把这套逻辑实现了一遍。判定依据是 `unicodedata.bidirectional()`：`L` 归为 ltr，`R` 和 `AL` 归为 rtl，隔离区间（LRI/RLI/FSI 到 PDI）整段跳过，扫完没有强字符就默认 ltr。

```python
def first_strong(s: str) -> str:
    depth = 0
    for ch in s:
        if ch in ISOLATE_INIT: depth += 1; continue
        if ch == PDI: depth = max(0, depth-1); continue
        if depth: continue
        b = unicodedata.bidirectional(ch)
        if b == "L": return "ltr"
        if b in ("R","AL"): return "rtl"
    return "ltr"
```

然后构造 14 条字符串，每条我以作者身份先声明正确方向，再让这段代码去判。

```text
case                                         declared  dir=auto  ok
------------------------------------------------------------------------
ar title starting with latin product name    rtl       ltr       MISMATCH
he title starting with a version number      rtl       rtl       OK
ar UI label starting with a digit            rtl       rtl       OK
he string starting with an ASCII quote       rtl       ltr       MISMATCH
ar author name with latin handle first       rtl       ltr       MISMATCH
en title starting with an arabic loanword    ltr       rtl       MISMATCH
ar plain sentence                            rtl       rtl       OK
he plain sentence                            rtl       rtl       OK
ko plain sentence                            ltr       ltr       OK
ja plain sentence                            ltr       ltr       OK
zh plain sentence                            ltr       ltr       OK
en plain sentence                            ltr       ltr       OK
numeric-only string (no strong char)         ltr       ltr       OK
emoji-led ar string                          rtl       rtl       OK
------------------------------------------------------------------------
total=14  mismatch=4  mismatch_rate=28.6%
```

14 条错 4 条。四个失败案例长得很像：阿拉伯语标题前面顶着一个拉丁字母的产品名、希伯来语句子以 ASCII 引号开头、阿拉伯语作者名前面挂着拉丁字母的 @handle，以及反过来的一条，英文标题以一个阿拉伯语借词打头。

真正让我改变认知的是那些**通过**的用例。以数字开头的希伯来语标题、以数字开头的阿拉伯语界面文案、以 emoji 起头的阿拉伯语字符串，三条全判对了。原因是数字、标点、emoji、空白在 Unicode 双向属性里都不算强字符，扫描时被直接跳过，方向由后面第一个真正的强字符决定。

所以风险的准确描述不是“ASCII 打头就出事”，而是“拉丁字母打头才出事”。这个区别很关键，因为它把审查范围缩小到一类具体模式：产品名、品牌名、用户 handle、URL、代码标识符出现在 RTL 文本开头。多语言产品里这种组合太常见了。

必须补一句：28.6% 是我这 14 条构造样本的失配率，不是任何全网统计。它说明的是失败的**形状**，不是失败的**频率**。拿它去推断“网上四分之一的字符串方向是错的”，属于我没做过的论证。

## 拿草案回头审自己的构建产物

看完别人的问题，接着看自己的。我写了个脚本去扫 `dist/`，也就是构建出来的完整站点。真实输出：

```text
== pages audited == 1248
html[lang] present : 1248/1248
html[dir]  present : 0/1248
== JSON-LD ==
blocks parsed          : 1248  (parse errors: 0)
@context has @language : 0
@context has @direction: 0
blocks containing inLanguage: 1248
== feeds ==
  rss-en.xml    xml:lang=False  <language>=True   items=312
  rss-ja.xml    xml:lang=False  <language>=True   items=312
  rss-ko.xml    xml:lang=False  <language>=True   items=312
  rss-zh.xml    xml:lang=False  <language>=True   items=312
  rss.xml       xml:lang=False  <language>=False  items=1248
```

`html[lang]` 全站 1,248 页满覆盖，JSON-LD 全部可解析、零错误，每个块都带着 `inLanguage`。分语言的四个 feed 也都在 channel 上声明了 `<language>`。这些是好消息。

坏消息在最后一行。`rss.xml` 是那个把四种语言混在一起的聚合 feed，1,248 条，语言元数据一处都没有。而在此之前，我从来没把它当成问题。之前做 [hreflang 互指关系的审计](/zh/blog/zh/hreflang-reciprocity-audit-multilingual-2026/)时我盯的是页面之间的语言关系，聚合 feed 压根不在视野里，因为它每种语言的入口都单独提供了，看上去已经交代过了。直到脚本跑出这一行，我才意识到聚合口是完全裸的。

单语言 feed 里 channel 级的 `<language>` 足够了，因为整个 feed 只有一种语言。聚合 feed 里这个假设直接不成立。

## RSS 2.0 没有条目级语言元素，就借 Dublin Core

RSS 2.0 规范里，`<language>` 只存在于 channel 层，没有对应的 item 级元素。要给每条内容单独标语言，通行做法是引入 Dublin Core 命名空间的 `dc:language`。

`@astrojs/rss` 支持 `xmlns` 选项声明额外命名空间，也支持每条 item 的 `customData` 注入自定义元素。两者拼起来就够了。

```js
return rss({
  title: SITE_TITLE, description: SITE_DESCRIPTION, site: context.site,
  xmlns: { dc: 'http://purl.org/dc/elements/1.1/' },
  items: posts.map((post) => {
    const [lang, ...slugParts] = post.id.split('/');
    const slug = slugParts.join('/');
    return { title: post.data.title, description: post.data.description,
             pubDate: post.data.pubDate, link: `/${lang}/blog/${lang}/${slug}/`,
             customData: `<dc:language>${lang}</dc:language>` };
  }),
});
```

语言值不用另外配置，从 `post.id` 的路径前缀里就能拿到，因为内容目录本来就按语言分。重新构建之后：

```bash
$ grep -o '<dc:language>[a-z]*</dc:language>' dist/rss.xml | sort | uniq -c
 312 <dc:language>en</dc:language>
 312 <dc:language>ja</dc:language>
 312 <dc:language>ko</dc:language>
 312 <dc:language>zh</dc:language>
```

0 变成 1,248。四种语言各 312 条，跟分语言 feed 的条目数对得上，说明没有漏掉也没有错配。

改动本身十分钟就写完了。真正花时间的是前面那一步，意识到有问题。

## 没失败过的关卡不算关卡

改完不设防，下次重构一样会掉回去。我把审计脚本整理成 `scripts/validate-string-meta.mjs`，挂进构建后钩子：

```json
"postbuild": "node scripts/validate-hreflang.mjs && node scripts/validate-string-meta.mjs"
```

它管三件事。所有 HTML 页面得有 `html[lang]`；四个分语言 feed 的 channel 得声明 `<language>`；聚合 feed 里带 `dc:language` 的条目数，必须等于总条目数。最后一条是这次真正新增的约束，前两条只是把已经成立的现状钉住。

然后我做了一步很多人会省掉的事：故意让它失败。我从构建好的 `rss.xml` 里手动删掉 3 条 `dc:language`，再跑一次。

```text
html[lang]: 1288/1288 pages
per-language feeds: 4 checked
mixed feed rss.xml: 1245/1248 items declare dc:language
FAILED: rss.xml: dc:language 1245 / item 1248 — mismatch
exit=1
```

1245 对 1248，差 3，退出码 1。把文件恢复之后重新变绿。

这一步的意义在于：一个从没红过的检查脚本，你其实不知道它是在检查，还是在无条件放行。我在之前那轮[多语言技术审计](/zh/blog/zh/multilingual-blog-technical-audit-campaign-2026/)里就被这个坑过一次，写了检查、上线、心安理得，后来才发现条件写错了永远为真。现在的规矩是：新加的关卡必须先给我看一次红色。

## 我决定不给 @context 加 @language

草案里对 JSON-LD 的建议是把 `@language` 和 `@direction` 放进 `@context`。我的站现在用的是最简形式：

```json
{ "@context": "https://schema.org", "@graph": [ ... ] }
```

要照建议改，写法大致是这样：

```json
{
  "@context": { "@vocab": "https://schema.org/", "@language": "zh", "@direction": "ltr" },
  "@graph": [ ... ]
}
```

我没改。理由跟 `@graph` 的内容结构有关。那里面除了当前文章的实体，还有一批全站共用的实体，它们的字符串在所有语言版本里都保持英文。从某个 `/ko/` 页面上摘一段：

```json
{"@type": "Organization", "name": "jangwook.net", "description": "Personal technology blog by Kim Jangwook", ...}
```

如果我在这个文档上声明 `@language: "ko"`，那么这句英文描述就会被标成韩语。文档级默认值的作用范围覆盖整个 `@graph`，而 `@graph` 里的语言并不统一。

错误的元数据比没有元数据更糟。缺失会让消费方保持谨慎，自己去推断；错误会被直接采信。这是我在[用 @graph 整合结构化数据](/zh/blog/zh/json-ld-graph-entity-linking-2026/)那次就定下的原则，这回它正好挡住了一次看起来“照着规范改总没错”的改动。

而且我的 JSON-LD 已经有更精确的一层：1,248 个块全都带 `inLanguage`，粒度落在条目上，比一个文档级默认值准确得多。

正确的走法有两条。要么把全站实体的字符串改成草案说的 language map 形式，让每个字符串自带语言；要么保持 `@context` 不动，继续依赖条目级的 `inLanguage`。我暂时选后者。等草案稳定、语言 map 的具体写法定型，再回来处理第一条路。

## 这次没做的事，以及我不能替它背书的部分

FPWD 是首份草案，字段名和建议都可能变。现在就照着它去严格设计一套新的 API schema，风险不小。但“给字符串附上语言元数据”这个原则比草案早得多，现在做完全安全，只是具体的承载形式先别写死。

`dc:language` 服务的是 feed 阅读器和各类消费方。它不是搜索排名信号，我没有任何流量或排名方面的说法要讲。Google 反复说过结构化数据帮助理解内容，但不保证排名，这条同样适用。

`html[dir]` 缺失 1,248 页，我原样留着没动。四种语言全是 LTR，浏览器默认方向就是 ltr，渲染结果正确。这属于隐式，不属于错误。真正变成 bug 是在我加入第一个 RTL 语言版本的那天，到时候关卡里再补一条规则。现在补，只是给一堆页面加上永远为真的属性。

最后一条，我不读阿拉伯语，也不读希伯来语。上面那些 RTL 判定全部来自 Unicode 字符属性的计算，不是母语者的审阅。方向解析本身由字符属性决定，所以计算足够；但屏幕上读起来是否自然，超出了我能担保的范围。这一点我不想含糊过去。

## 明天就能动手的七件事

草案给了一个判断标准：任何自然语言字符串，都应该能够确定它的语言和方向，靠元数据而不是靠猜。我拿这个标准量了自己的站，页面层面是满分，结构化数据层面有更精确的替代方案，唯一真正裸奔的是那个混了四种语言的聚合 feed，1,248 条，零标注。改动是一行 `customData`，代价几乎为零，问题在于我三年没看见它。

可以照着做的清单：

- 找出你项目里所有“多语言内容混在同一条流里”的出口。聚合 feed、搜索结果、通知列表、后台管理表格，这类地方最容易漏。
- 别信 `dir="auto"` 处理带前缀的文本。拉丁字母打头的 RTL 字符串会被判反，数字和 emoji 打头则不会。
- API 设计新字段时，给自然语言字段配上 `{value, lang, dir}` 的形状，方向只允许 `ltr`/`rtl`/`auto` 三个值。
- 文档级默认值要留出被字符串级覆盖的口子，草案对这一点用的是 MUST。
- JSON-LD 里，`@context` 的 `@language` 只在整个文档语言真正统一时才加。混杂内容用条目级 `inLanguage` 更安全。
- RSS 聚合 feed 用 `dc:language` 给每条内容标语言，channel 级的 `<language>` 在混合场景下不够用。
- 新写的校验脚本，先手工破坏一次数据让它报错，确认 exit code 非零，再接进 CI。

---

如果你手上的多语言站点也在往外输出这类混合数据流，而没人系统查过语言与方向元数据、结构化数据的接线是否成立，我个人接这类审计与落地的咨询：先量出现状，修掉最要紧的几项，再把检查固化成 CI 关卡，让它不会悄悄退回去。有需要可以从 [/zh/contact](/zh/contact/) 找我聊。
