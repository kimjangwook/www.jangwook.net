---
title: 'div 网格做的表格悄悄丢掉了什么：无障碍树与文本抽取的同步实测'
description: '把同一张营业时间表用四种标记方式写出来，分别过 axe-core 和五个抽取器。axe 对四种都给出零违规，可一旦把 HTML 还原成 Markdown 或纯文本，其中三种只能复原 0/7 行。role="table" 到底在哪一层帮不上忙，这里用实测日志说清楚。'
pubDate: '2026-07-29'
heroImage: '../../../assets/blog/table-markup-a11y-llm-extraction-2026/hero.png'
tags:
  - 无障碍
  - 语义化HTML
  - GEO
  - WCAG
  - Web开发
faq:
  - question: '给 div 加上 role="table" 就等同于语义化的 table 吗？'
    answer: '从无障碍树的角度看，两者都会暴露表头单元格，相当程度上是对等的。但把 HTML 转成文本或 Markdown 的抽取管线基本不看 ARIA 的 role。实测中，带 role="table" 的 div 网格在五个抽取器里全部无法按行复原，成绩与完全不带 role 的 div 网格一模一样。'
  - question: 'axe 报告零违规，是不是表示表格标记没问题？'
    answer: '不是。axe 的表格规则主要抓结构性矛盾，比如布局用 table 里出现 th、headers 属性指向不存在的 id。"本该是表格却没写成表格"无法用规则判定，因此会静默通过。实验中，表头单元格为零的 table 和不带 role 的 div 网格都拿到了零违规。'
  - question: '把 HTML 转成 Markdown，表格为什么会坏？'
    answer: '因为转换器的默认配置往往不处理表格。turndown 7.2.4 的标准规则里没有表格，会把所有单元格摊成一列。加上 GFM 插件后能转成真正的表格，但此时若 table 没有标题行，转换器会直接放弃并原样吐出 HTML。'
  - question: '这些结果代表 GPTBot 之类真实 AI 爬虫的行为吗？'
    answer: '不代表。测量对象是 turndown、html-to-text、Readability 这类开源库，各家 AI 爬虫的内部管线并未公开。鉴于"把 HTML 还原成文本或 Markdown"是一条被广泛采用的路径，把这些数字当作参考值来读比较稳妥，它们不是官方数据。'
relatedPosts:
  - slug: axe-automated-a11y-coverage-gap-2026
    score: 0.72
    reason:
      ko: 그 글은 자동 검사가 초록불을 줘도 남는 장벽을 세었고, 이 글은 같은 초록불 뒤에서 마크업이 기계 판독까지 잃는 경우를 잰다. 둘 다 "위반 0건"의 의미를 좁히는 작업이다.
      ja: あちらは自動チェックが緑になっても残る障壁を数え、こちらは同じ緑の裏でマークアップが機械可読性まで失う場面を測る。どちらも「違反ゼロ」の意味を狭める作業だ。
      en: That post counts the barriers that survive a green automated audit; this one measures what the same green audit misses on the machine-readability side. Both narrow what "zero violations" is allowed to mean.
      zh: 那篇统计了自动检测亮绿灯后仍然存在的障碍，本文则测量同样的绿灯背后标记连机器可读性也一并丢失的情形。两篇都在收窄"零违规"的含义。
  - slug: localbusiness-structured-data-server-side-vs-js-2026
    score: 0.63
    reason:
      ko: LocalBusiness JSON-LD를 JS로 넣으면 원시 HTML에 0개로 잡히던 그 실험과 축이 같다. 화면에 보이는 것과 기계가 가져가는 것이 갈라지는 지점을 각각 구조화 데이터와 표 마크업에서 잰다.
      ja: LocalBusinessのJSON-LDをJSで注入すると生HTMLでは0件になる、あの実験と軸が同じだ。画面に見えるものと機械が持ち帰るものが分かれる地点を、構造化データと表マークアップでそれぞれ測っている。
      en: Same axis as the experiment where JS-injected LocalBusiness JSON-LD showed up as zero blocks in the raw HTML. Both measure the gap between what renders and what a machine actually carries away, one via structured data and one via table markup.
      zh: 与"用JS注入LocalBusiness JSON-LD后原始HTML里为0"那次实验是同一条轴。一个从结构化数据、一个从表格标记，测量的都是"屏幕所见"与"机器所取"的分岔点。
  - slug: json-ld-graph-entity-linking-2026
    score: 0.55
    reason:
      ko: 조각난 JSON-LD를 하나의 그래프로 잇는 문제와, 흩어진 셀을 행·열 관계로 복원하는 문제는 같은 질문의 두 형태다. 기계가 관계를 재구성할 수 있는가.
      ja: 断片化したJSON-LDを一つのグラフへつなぐ問題と、ばらけたセルを行と列の関係へ復元する問題は、同じ問いの二つの形だ。機械が関係を再構成できるか。
      en: "Stitching fragmented JSON-LD into one graph and rebuilding scattered cells into row-and-column relationships are two shapes of the same question: can a machine reconstruct the relationships you meant?"
      zh: 把碎片化的JSON-LD连成一张图，与把散落的单元格还原成行列关系，是同一个问题的两种形态：机器能否重建你想表达的关系。
---

抽取器吐出来的字符串长这样。

```text
Monday11:00-15:0014:30Lunch only
TuesdayClosedn/aRegular holiday
```

打烊时间和最后点单时间黏在一起，成了 `15:0014:30`。原页面上那是一张画着边框的普通表格。浏览器里看不出任何毛病，无障碍审计也给了零违规。可同一份 HTML 一旦被还原成文本，值就互相粘住了。

一开始我怀疑是库的 bug。换了几种标记方式重测之后才发现不是，真正决定结果的是表格怎么写。于是我把同一份数据做成四种标记，并排送进无障碍工具和抽取器。下面所有数字都来自那个沙箱的真实输出。

## 表格有三类读者

写表格标记的时候，脑子里通常只有一类读者：用眼睛看表格的人。实际上有三类。

第一类是<strong>无障碍树</strong>。浏览器不会把 DOM 原样交给辅助技术，而是另建一棵只保留角色、名称和状态的树，暴露给屏幕阅读器。对表格来说，这棵树必须承载的核心不是单元格的值，而是<strong>单元格与表头的关联</strong>。孤零零一个"14:30"没有任何意义，只有当它带着"周一那一行、最后点单那一列"抵达时才成为信息。W3C WAI 的表格教程把这一点写得很明白（[Tables Tutorial](https://www.w3.org/WAI/tutorials/tables/)）。

> Data tables are used to organize data with a logical relationship in grids. Accessible tables need HTML markup that indicates header cells and data cells and defines their relationship. Assistive technologies use this information to provide context to users.

同一份文档还补了一句：「Relying on visual cues alone is not sufficient to create an accessible table.」加粗字体和灰色底纹，只在人眼里才叫表头。

第二类是<strong>搜索爬虫</strong>。它直接解析 HTML，这一层相对宽容。

第三类的分量这几年迅速变重：<strong>把 HTML 还原成文本或 Markdown 的抽取管线</strong>。摘要或引用页面正文的工具、RAG 索引器、各类内容采集器，大多不会整份处理 HTML。它们先切出正文区域，剥掉标签，转成纯文本或 Markdown，然后用这段文本干活。这个还原过程里什么留下、什么消失，完全由标记和转换器配置决定。前面那份 W3C 文档顺手写下的一句话，指的正是这个位置：「Tables markup is often lost when converting from one format to another, though some programs may provide functionality to assist converting table markup.」

关键在于，这三类读者的失败条件互不相同。无障碍树靠表头单元格的存在活着，抽取管线靠 `<table>` 这个元素本身活着。也就是说，只满足其中一方的标记是存在的。实验就是从这里开始的。

## 同一份数据，四种写法

我做了一张七行四列的营业时间表。列是 Day / Hours / Last order / Note，行从周一到周日。四个版本的值逐字相同，包裹表格的段落和 CSS 也一致。不同的只有构成表格的元素。

<strong>A. 完整的语义化表格</strong>

```html
<table>
  <caption>Opening hours</caption>
  <thead><tr><th scope="col">Day</th><th scope="col">Hours</th>…</tr></thead>
  <tbody>
    <tr><th scope="row">Monday</th><td>11:00-15:00</td><td>14:30</td>…</tr>
  </tbody>
</table>
```

<strong>B. 是 table，但没有表头单元格</strong>。没有 `<caption>`，没有 `<thead>`，每一格都是 `<td>`。这是实际项目里最常撞见的形态，从后台界面粘贴过来的表格、CMS 编辑器吐出来的表格，基本都长这样。

```html
<table>
  <tr><td>Day</td><td>Hours</td><td>Last order</td><td>Note</td></tr>
  <tr><td>Monday</td><td>11:00-15:00</td><td>14:30</td><td>Lunch only</td></tr>
</table>
```

<strong>C. div 网格加上 ARIA role</strong>。用 CSS Grid 画格子，然后老老实实写上 `role="table"`、`role="row"`、`role="columnheader"`、`role="rowheader"`、`role="cell"`。认真对待无障碍的设计系统经常产出这种形态。

<strong>D. 什么都不加的 div 网格</strong>。只在视觉上是表格。

测量工具跑在 Node 22.22.0 上：axe-core 4.12.1（jsdom 29.1.1）、turndown 7.2.4、turndown-plugin-gfm、html-to-text 10.0.0、@mozilla/readability 0.6.0。

判定分三项。抽取后的文本里，<strong>是否有一行同时装着一个星期几和该行的四个值，且顺序不变</strong>（按行复原，满分 7 行）。<strong>相邻的值之间是否还有分隔，没有粘连</strong>（单元格分隔）。<strong>列名那一行是否出现在第一个数据值之前</strong>（表头保留）。按行复原里加上"星期几恰好出现一次"这个条件，是为了不把整张表压成一行的情况算作成功。

## axe 给四种都开了绿灯

先跑无障碍自动检查，标签把 wcag2a、wcag2aa、wcag21a、wcag21aa、best-practice 全部打开。

```text
A: headerCellsInDOM=11  violations=region(moderate)
B: headerCellsInDOM= 0  violations=region(moderate)
C: headerCellsInDOM=11  violations=region(moderate)
D: headerCellsInDOM= 0  violations=region(moderate)
```

`region` 是"页面内容不在地标区域内"的 best-practice 规则，和表格无关。表格相关违规，四种全是零。表头单元格一个都没有的 B 通过了，没有任何角色的 div 网格 D 也通过了。

这不是 axe 的缺陷。它的表格规则设计用来抓结构性矛盾：布局用表格里出现 `<th>`、`headers` 属性指向不存在的 id，诸如此类。"这堆 div 本该是一张表格"这种判断需要理解内容含义，规则引擎做不到。我[数过自动检查亮绿灯之后仍然留在页面上的障碍](/zh/blog/zh/axe-automated-a11y-coverage-gap-2026)，这次属于同一族。区别在于，这回被漏掉的不只是人的可用性。

不过直接数 DOM 里的表头单元格，差别就出来了。A 和 C 各有 11 个（四个列表头加七个行表头），B 和 D 是零。能把单元格与表头的关系交给辅助技术的，只有 A 和 C。看到这里结论似乎很简单：ARIA role 写规范的 div 网格与语义化表格对等。

## 过完五个抽取器，排名变了

同样这四种，送进抽取管线。

![axe-core 与五个抽取器的运行日志，按条件列出四种标记在按行复原、单元格分隔、表头保留三项上的判定](../../../assets/blog/table-markup-a11y-llm-extraction-2026/run-log.png)

整理成表。数字是按行复原（满分 7），D 表示单元格分隔，H 表示表头保留。

| 抽取器 | A 语义化表格 | B 无 th 的表格 | C div+ARIA | D 仅 div |
|---|---|---|---|---|
| turndown 7.2.4 默认 | 0/7 D+ H- | 0/7 D+ H- | 0/7 D+ H- | 0/7 D+ H- |
| turndown + GFM 插件 | <strong>7/7 D+ H+</strong> | 0/7 D+ H- | 0/7 D+ H- | 0/7 D+ H- |
| html-to-text 10 默认 | 0/7 D- H- | 0/7 D- H- | 0/7 D+ H- | 0/7 D+ H- |
| html-to-text + dataTable | <strong>7/7 D+ H+</strong> | <strong>7/7 D+ H+</strong> | 0/7 D+ H- | 0/7 D+ H- |
| Readability textContent | 7/7 D- H+ | 7/7 D- H+ | 7/7 D- H+ | 7/7 D- H+ |

这里有三处翻盘。

<strong>第一，ARIA role 在这一层什么也没做。</strong>C 和 D 在每一个抽取器里的成绩完全一致。老实写了 `role="columnheader"` 的标记，和只套了样式的一堆 div，被还原成文本之后无从分辨。抽取器看的是标签名，不是 role 属性。无障碍树里 C 与 A 对等，这一层它被当成 D。

<strong>第二，转换器的默认值连语义化表格都能毁掉。</strong>turndown 开箱即用时 A 也只有 0/7。它根本没有表格规则，会把单元格摊成一列。实际输出是这样：

```text
Opening hours
Day
Hours
Last order
Monday
11:00-15:00
```

行没了，列也没了，只剩一串值。加上 GFM 插件，A 能输出整齐的 Markdown 表格。可<strong>B 装了插件依然是 0/7</strong>。打开输出一看，转换器干脆放弃转换，把原始 HTML 整块吐了出来。

```text
<table><tbody><tr><td>Day</td><td>Hours</td>…</tr>…</table>
```

GFM 的 Markdown 表格语法要求必须有标题行。一个 `<th>` 都没有的表格造不出标题行，转换器只好撒手。于是只用 `<td>` 写成的表格，在浏览器里正常、在 axe 那里过关，却在最常见的 HTML 转 Markdown 路径上变成一坨未转换的原文。开头那个 `15:0014:30` 也是同一类：html-to-text 默认只把表格当作块级元素处理，单元格之间不插分隔符。

<strong>第三，一行配置能把 B 救回来。</strong>给 html-to-text 传 `{ selector: 'table', format: 'dataTable' }`，A 和 B 都升到 7/7，渲染成对齐列宽的等宽表格，表头行也保住了。但这张牌<strong>只有在抽取一侧由你掌控时</strong>才打得出去。来抓你页面的别人家管线怎么配置，不在你手里。

## Readability 的 7/7 靠的是换行

表里 Readability 那一行格外扎眼：四种标记全是 7/7。我最初读成"正文抽取器更能保住结构"，可越想越不对。`textContent` 只是去掉标签、把文本节点连起来，它没有任何制造行边界的手段。

于是我加了一个条件：把标签之间的换行和缩进去掉，同一份 HTML 再跑一遍。这正是压缩工具、或者不做 pretty-print 的模板引擎输出的形态。

```text
=== 去掉标签间空白之后 ===
Readability 0.6 textContent   0/7   0/7   0/7   0/7
```

四种全部塌到 0/7。另外四个抽取器在两种条件下数值完全相同。也就是说，Readability 的按行复原不是标记带来的，而是<strong>源文件里的换行碰巧造出来的</strong>。HTML 一旦压成一行就消失。

对我个人而言，这是整个实验最值钱的一段。看到第一张表时，我差点走向错误结论。要是没有再造一个条件，我大概会写"基于 textContent 的抽取同样能保住表格"。一个实测值究竟来自被测对象还是来自附带条件，只有把附带条件晃一晃才分得清。

测量代码本身也抓出一个毛病。最初的判定函数按大小写敏感去匹配字符串，而 html-to-text 默认会把 `<th>` 的内容转成大写。结果 A 明明完整复原了，却被判成 0/7。改成忽略大小写之后，上面那张表的数字才出来。抽取工具本身会改写值，这件事也值得记住：表头里若含专有名词，这种改写会原样流向下游。

## role="table" 够不到的那一层

四份成绩单是这样分开的。

| 标记 | 无障碍树里的单元格与表头关系 | 文本抽取 |
|---|---|---|
| A `<table>` + `<th scope>` | 有 | 保住 |
| B `<table>` 只有 `<td>` | 无 | 大半损毁 |
| C `<div role="table">` | 有 | 全部损毁 |
| D 只有 `<div>` | 无 | 全部损毁 |

两边都过的只有 A。而这张表里没有任何一格是自动审计会告诉你的。

我由此得出的实务判断是：<strong>用 div 搭数据网格、再靠 ARIA 把语义补回来，单看无障碍是成立的，但放到整体机器可读性上是明确的倒退。</strong>ARIA 是只瞄准无障碍树这一个读者的修正装置，而 table 元素同时作用于包含它在内的更大范围。当两种做法能拿到同样的无障碍结果时，选顺带损失更小的那个，并不难决定。

这个判断与 W3C 很早就写下的原则方向一致，[Using ARIA](https://www.w3.org/TR/using-aria/) 的第一条规则：

> If you can use a native HTML element or attribute with the semantics and behavior you require already built in, instead of re-purposing an element and adding an ARIA role, state or property to make it accessible, then do so.

这条规则通常只被当作无障碍依据引用。这次的测量给它添了第二条依据：用原生元素，无障碍之外的读者会一并跟过来；用 ARIA 模仿语义，那份语义就走不出无障碍树。

同样的道理我在另一层说过。[用 JS 注入 LocalBusiness JSON-LD，原始 HTML 里结构化数据块是 0 个](/zh/blog/zh/localbusiness-structured-data-server-side-vs-js-2026)——浏览器里查验一切正常，到机器取走的那一步却形同不存在。表格标记的结构完全一样：你在屏幕上验过的结果，和机器带走的结果，是两回事。挂在字符串上的元数据也在同一处漏掉。[语言和方向信息不跟着字符串一起走，会在哪一步崩掉](/zh/blog/zh/string-lang-dir-metadata-multilingual-web)，我另外测过。

## 这个实验没有主张的事

把界限老实划出来。

测量对象是开源库。GPTBot、ClaudeBot 这类真实 AI 爬虫内部用什么管线并未公开，这些结果不足以断定它们的行为。把"HTML 还原成文本或 Markdown 是一条被广泛采用的路径"作为依据，将这些数字读作<strong>参考值</strong>才准确。它们不是官方数据。

我也不主张改好表格标记就能提升搜索排名或 AI 引用。Google 对结构化数据的官方立场，很好地说明了这类问题的性质（[结构化数据通用准则](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)）。

> Google does not guarantee that your structured data will show up in search results, even if your page is marked up correctly according to the Rich Results Test.

标记打开的是可能性，不是保证。这次的工作性质也一样：它<strong>拿掉一种失败模式</strong>，而不是买来一个结果。

测量环境也是 jsdom 而非真实浏览器。我没有用屏幕阅读器实际读这些表格，只是在 DOM 层面数了表头单元格是否会暴露到无障碍树。axe-core 也只是众多规则集中的一套，换个引擎可能给出不同判定。

## 收尾：动表格之前先确认这六件事

只留能直接落到代码上的部分。

1. <strong>数据网格用 `<table>` 写。</strong>`<div role="table">` 只满足一个读者，其余全丢。如果是视觉设计约束逼你用 div，现在的 `display: grid` 配合 `display: contents`，能在保留 `<table>` 的前提下实现绝大多数布局。
2. <strong>把一个 `<th>` 都没有的 `<table>` 找出来。</strong>就是这次的 B：数量最多、axe 不吭声、Markdown 转换里整块报废。值得用 grep 全库扫一遍。
3. <strong>补上 `scope` 和 `<caption>`。</strong>列表头写 `scope="col"`，行表头用 `<th scope="row">`。`<caption>` 以文本形式留下"这张表是关于什么的"，抽取之后同样存活。
4. <strong>自己跑抽取管线的话，先看配置。</strong>turndown 不装 GFM 插件就会把表格摊平，html-to-text 不给 `format: 'dataTable'` 就会让单元格粘连。别默认"默认值是安全的"。
5. <strong>不要相信基于 textContent 的抽取。</strong>行看起来还在，可能只是源码换行的功劳。拿压缩过的 HTML 再跑一遍，看结果是否一致。
6. <strong>往 CI 里加一条规则。</strong>"每个 `<table>` 至少有一个 `<th>`，且存在 `<caption>` 或 `aria-label`"完全可以静态判定。自动无障碍检查照不到的地方，这一行就补上了。

我以实务身份承接这类工作：按无障碍与机器可读性两套标准，审计表格、表单和落地页的标记。手上运营的站点若需要按这个尺度过一遍，从个人资料页的联系方式找我聊即可。
