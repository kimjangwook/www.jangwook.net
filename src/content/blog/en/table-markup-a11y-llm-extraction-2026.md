---
title: 'What a div grid loses: a11y tree vs. text extraction'
description: 'I built one opening-hours table four ways, then ran axe-core and five extractors over it. axe passed all four, yet three lost all 7 rows once HTML became text.'
pubDate: '2026-07-29'
heroImage: '../../../assets/blog/table-markup-a11y-llm-extraction-2026/hero.png'
tags:
  - accessibility
  - semantic HTML
  - GEO
  - WCAG
  - web development
faq:
  - question: 'Is a div with role="table" equivalent to a semantic table?'
    answer: 'For the accessibility tree, largely yes: header cells get exposed either way. But the extraction pipelines that turn HTML into text or Markdown barely look at ARIA roles. In my measurements, a div grid with role="table" failed row-level recovery in all five extractors, scoring identically to a div grid with no roles at all.'
  - question: 'If axe reports zero violations, is my table markup fine?'
    answer: 'No. axe table rules mostly catch structural contradictions, like a th inside a layout table or a headers attribute pointing at a nonexistent id. "This should have been a table and is not" cannot be decided by a rule engine, so it passes silently. In my run, a table with zero header cells and a div grid with no roles both came back clean.'
  - question: 'Why do tables break when HTML is converted to Markdown?'
    answer: 'Because converter defaults often do not handle tables. turndown 7.2.4 ships no table rule, so it flattens every cell into a vertical list. Adding the GFM plugin gives you real Markdown tables, but even then a table with no heading row makes the converter give up and emit the raw HTML instead.'
  - question: 'Does this tell us how GPTBot or other AI crawlers behave?'
    answer: 'No. I measured open-source libraries such as turndown, html-to-text and Readability. No AI crawler publishes its ingestion pipeline. Since reducing HTML to text or Markdown is a widely used shape, treat these numbers as a reference point rather than official behavior.'
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

Here is what came out the far end of an extractor.

```text
Monday11:00-15:0014:30Lunch only
TuesdayClosedn/aRegular holiday
```

Closing time and last order fused into `15:0014:30`. On the source page this was an ordinary bordered table. It looked fine in the browser, and the accessibility audit came back with zero violations. Reduce the same HTML to text, though, and the values glue themselves together.

I assumed a library bug. Then I changed the markup and measured again, and the markup turned out to be what decided the outcome. So I built the identical dataset four different ways and pushed all four through accessibility tooling and extractors side by side. Every number below is real output from that sandbox.

## A table has three readers, not one

When you write table markup you usually picture one reader: a person looking at the grid. There are three.

The first is the <strong>accessibility tree</strong>. Browsers don't hand the DOM straight to assistive technology. They build a separate tree of roles, names and states and expose that to screen readers. For a table, the thing that tree has to carry isn't the cell values, it's the <strong>association between cells and headers</strong>. "14:30" on its own means nothing. It becomes information only when it arrives attached to the Monday row and the Last order column. The W3C WAI tables tutorial says so directly ([Tables Tutorial](https://www.w3.org/WAI/tutorials/tables/)):

> Data tables are used to organize data with a logical relationship in grids. Accessible tables need HTML markup that indicates header cells and data cells and defines their relationship. Assistive technologies use this information to provide context to users.

The same document adds one more line: "Relying on visual cues alone is not sufficient to create an accessible table." Bold text on a grey background is a header to human eyes only.

The second reader is the <strong>search crawler</strong>, which parses HTML directly and is therefore comparatively forgiving.

The third has gained a lot of weight in the past few years: <strong>pipelines that reduce HTML to text or Markdown</strong>. Tools that summarize or quote a page, RAG indexers, content collectors of every kind, they mostly don't work on raw HTML. They isolate the main content, strip tags, produce plain text or Markdown, and use that. What survives that reduction and what evaporates is decided entirely by your markup and the converter's settings. The W3C page drops a line about exactly this, almost in passing: "Tables markup is often lost when converting from one format to another, though some programs may provide functionality to assist converting table markup."

The important part is that these three fail under different conditions. The accessibility tree lives on the presence of header cells. The extraction pipeline lives on the `<table>` element itself. Which means markup that satisfies one and not the other can exist. That was the premise worth testing.

## One dataset, four markups

I built a seven-row, four-column opening-hours table. Columns: Day, Hours, Last order, Note. Rows: Monday through Sunday. The values are byte-identical across all four versions, as are the surrounding paragraphs and the CSS. Only the elements differ.

<strong>A. The full semantic table.</strong>

```html
<table>
  <caption>Opening hours</caption>
  <thead><tr><th scope="col">Day</th><th scope="col">Hours</th>…</tr></thead>
  <tbody>
    <tr><th scope="row">Monday</th><td>11:00-15:00</td><td>14:30</td>…</tr>
  </tbody>
</table>
```

<strong>B. A table with no header cells.</strong> No `<caption>`, no `<thead>`, every cell a `<td>`. This is the version you meet most often in real codebases. Tables pasted out of an admin screen or emitted by a CMS editor usually look like this.

```html
<table>
  <tr><td>Day</td><td>Hours</td><td>Last order</td><td>Note</td></tr>
  <tr><td>Monday</td><td>11:00-15:00</td><td>14:30</td><td>Lunch only</td></tr>
</table>
```

<strong>C. A div grid with ARIA roles.</strong> Cells drawn with CSS Grid, then `role="table"`, `role="row"`, `role="columnheader"`, `role="rowheader"` and `role="cell"` spelled out. Design systems that take accessibility seriously produce this shape all the time.

<strong>D. A div grid with nothing.</strong> A table to the eye and nowhere else.

Tooling: Node 22.22.0, axe-core 4.12.1 on jsdom 29.1.1, turndown 7.2.4, turndown-plugin-gfm, html-to-text 10.0.0, @mozilla/readability 0.6.0.

I scored three things in the extracted text. Does <strong>one output line carry a single weekday plus that row's four values in their original order</strong> (row recovery, out of 7)? Do <strong>adjacent values stay separated by some delimiter</strong> (cell delimiting)? Does a <strong>column-header line appear before the first data value</strong> (header retention)? The "exactly one weekday" condition in the first test exists so that a table collapsed onto a single line doesn't count as a win.

## axe waved all four through

The automated accessibility check ran first, with wcag2a, wcag2aa, wcag21a, wcag21aa and best-practice all enabled.

```text
A: headerCellsInDOM=11  violations=region(moderate)
B: headerCellsInDOM= 0  violations=region(moderate)
C: headerCellsInDOM=11  violations=region(moderate)
D: headerCellsInDOM= 0  violations=region(moderate)
```

`region` is a best-practice rule about page content sitting outside landmarks. Nothing to do with tables. Table-related violations: zero across all four. B, with no header cells whatsoever, passes. So does D, a div grid with no roles at all.

That isn't a defect in axe. Its table rules are built to catch structural contradictions: a `<th>` inside a layout table, a `headers` attribute pointing at an id that doesn't exist. Deciding that "this pile of divs should have been a table" requires understanding what the content means, and that isn't a job a rule engine can do. I've [counted the barriers that survive a green automated audit before](/en/blog/en/axe-automated-a11y-coverage-gap-2026/), and this belongs to the same family. What's different here is that the thing being missed isn't only human usability.

Count header cells in the DOM, though, and the four split. A and C expose 11 (four column headers plus seven row headers); B and D expose zero. Only A and C can hand a cell-to-header relationship to assistive technology. Stop reading here and the conclusion looks simple: a div grid with proper ARIA roles is equivalent to a semantic table.

## Five extractors reshuffle the ranking

Same four markups, now through the extraction pipelines.

![Run log from axe-core and five extractors, listing row recovery, cell delimiting and header retention for each of the four markups under both conditions](../../../assets/blog/table-markup-a11y-llm-extraction-2026/run-log.png)

Tabulated. The number is row recovery out of 7, D is cell delimiting, H is header retention.

| Extractor | A semantic table | B no `th` | C div + ARIA | D div only |
|---|---|---|---|---|
| turndown 7.2.4, defaults | 0/7 D+ H- | 0/7 D+ H- | 0/7 D+ H- | 0/7 D+ H- |
| turndown + GFM plugin | <strong>7/7 D+ H+</strong> | 0/7 D+ H- | 0/7 D+ H- | 0/7 D+ H- |
| html-to-text 10, defaults | 0/7 D- H- | 0/7 D- H- | 0/7 D+ H- | 0/7 D+ H- |
| html-to-text + dataTable | <strong>7/7 D+ H+</strong> | <strong>7/7 D+ H+</strong> | 0/7 D+ H- | 0/7 D+ H- |
| Readability textContent | 7/7 D- H+ | 7/7 D- H+ | 7/7 D- H+ | 7/7 D- H+ |

Three things flip here.

<strong>ARIA roles do nothing at this layer.</strong> C and D score identically in every single extractor. Markup that dutifully declares `role="columnheader"` and a pile of styled divs are indistinguishable once reduced to text, because extractors read tag names, not role attributes. In the accessibility tree C was A's equal. Here it gets treated as D.

<strong>Converter defaults wreck even a perfect semantic table.</strong> turndown out of the box scores A at 0/7. It has no table rule at all, so it unrolls the cells into a vertical list:

```text
Opening hours
Day
Hours
Last order
Monday
11:00-15:00
```

Rows and columns gone, values left standing in a queue. Add the GFM plugin and A comes out as a clean Markdown table. <strong>B still scores 0/7 with the plugin installed.</strong> Open the output and you find the converter gave up and dumped the raw HTML:

```text
<table><tbody><tr><td>Day</td><td>Hours</td>…</tr>…</table>
```

GFM's table syntax requires a heading row. A table with no `<th>` can't produce one, so the converter walks away. A `<td>`-only table therefore renders fine in the browser, passes axe, and turns into an untransformed blob on the most common HTML-to-Markdown path. The `15:0014:30` from the opening is the same species of failure: html-to-text's default treats a table as a block and puts no delimiter between cells.

<strong>One line of config brings B back.</strong> Pass `{ selector: 'table', format: 'dataTable' }` to html-to-text and both A and B jump to 7/7, rendered as a fixed-width table with the header row intact. That card is only playable <strong>when you control the extraction side</strong>. The settings inside somebody else's pipeline, the one fetching your page, are not yours to set.

## Readability's 7/7 was down to whitespace

One row in that table looks odd: Readability scores 7/7 on all four markups. My first read was that a content extractor holds structure better. It didn't sit right, though. `textContent` strips tags and concatenates text nodes. It has no mechanism for creating row boundaries.

So I added a second condition: the same HTML with newlines and indentation between tags removed, the way a minifier or a template engine that doesn't pretty-print would emit it.

```text
=== inter-tag whitespace stripped ===
Readability 0.6 textContent   0/7   0/7   0/7   0/7
```

All four collapsed. The other four extractors returned byte-identical scores under both conditions. Readability's row recovery was never produced by the markup. It was <strong>an accident of newlines in the source file</strong>, and it disappears the moment your HTML ships on one line.

That was the most valuable moment in the experiment for me. Looking at the first table, I was one step away from a wrong conclusion. Without that second condition I'd have written that textContent-based extraction preserves tables too. Whether a measurement comes from the thing you're testing or from an incidental condition only becomes visible when you shake the incidental condition.

The measurement code had a bug of its own. My first scoring function matched strings case-sensitively, and html-to-text uppercases `<th>` content by default. A was recovering perfectly and scoring 0/7 because of it. The numbers above only appeared after I switched to case-insensitive matching. Worth remembering that the extractor itself mutates values: if your headers contain proper nouns, that mutation flows straight downstream.

## The layer role="table" can't reach

The four report cards line up like this.

| Markup | Cell-to-header relation in the a11y tree | Text extraction |
|---|---|---|
| A `<table>` + `<th scope>` | present | survives |
| B `<table>` with only `<td>` | absent | mostly broken |
| C `<div role="table">` | present | entirely broken |
| D `<div>` only | absent | entirely broken |

One markup passes both, and no automated audit reports a single cell of that table.

The practical call I take from it: <strong>building a data grid out of divs and restoring meaning with ARIA holds up on accessibility alone, but it is a clear downgrade across machine readability as a whole.</strong> ARIA is a corrective aimed at exactly one consumer, the accessibility tree. The table element serves that consumer plus a wider set at the same time. When two approaches reach the same accessibility outcome, take the one that loses less on the side. That's not a hard call.

It also runs in the same direction as a principle W3C wrote down long ago, the first rule in [Using ARIA](https://www.w3.org/TR/using-aria/):

> If you can use a native HTML element or attribute with the semantics and behavior you require already built in, instead of re-purposing an element and adding an ARIA role, state or property to make it accessible, then do so.

That rule normally gets cited on accessibility grounds alone. This measurement adds a second one. Use the native element and the non-accessibility consumers come along free. Imitate the semantics with ARIA and those semantics never leave the accessibility tree.

I've made the same argument at a different layer before. [Injecting LocalBusiness JSON-LD with JavaScript left the raw HTML showing zero structured-data blocks](/en/blog/en/localbusiness-structured-data-server-side-vs-js-2026/): correct in the browser, absent at the moment a machine carried the page away. Table markup has the identical shape. What you verified on screen and what the machine took home are two different results. Metadata attached to strings leaks at the same seam. I measured separately [where things break when language and direction never travel with the string itself](/en/blog/en/string-lang-dir-metadata-multilingual-web/).

## What this experiment does not claim

Drawing the lines honestly.

I measured open-source libraries. How real AI crawlers such as GPTBot or ClaudeBot ingest pages internally is not published, and nothing here establishes their behavior. Read these numbers as a <strong>reference point</strong> that leans on how common the HTML-to-text reduction is. They are not official figures.

I'm also not claiming that fixing table markup lifts rankings or AI citations. Google's official position on structured data captures the character of this problem well ([structured data general guidelines](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)):

> Google does not guarantee that your structured data will show up in search results, even if your page is marked up correctly according to the Rich Results Test.

Markup opens a possibility; it doesn't buy an outcome. This work has the same character. It <strong>removes a failure mode</strong>. It doesn't purchase a result.

And the environment is jsdom, not a browser. I did not read these tables with an actual screen reader; I counted, at the DOM level, whether header cells are exposed to the accessibility tree. axe-core is one rule set among several, and another engine could return a different verdict.

## Six things to check before you touch a table

Only what maps directly onto code.

1. <strong>Build data grids with `<table>`.</strong> `<div role="table">` satisfies exactly one reader and loses all the others. If visual design constraints pushed you to divs, today's `display: grid` plus `display: contents` covers most of those layouts while keeping the `<table>` intact.
2. <strong>Hunt down every `<table>` with no `<th>`.</strong> That's variant B: the most common one, silent under axe, and broken wholesale in Markdown conversion. Worth a single grep across the codebase.
3. <strong>Add `scope` and `<caption>`.</strong> `scope="col"` on column headers, `<th scope="row">` for row headers. `<caption>` records what the table is about as text, and it survives extraction intact.
4. <strong>If you run an extraction pipeline, start with its config.</strong> turndown flattens tables without the GFM plugin; html-to-text glues cells together without `format: 'dataTable'`. Don't assume the defaults are safe.
5. <strong>Don't trust textContent-based extraction.</strong> If rows appear to survive, that may be your source newlines talking. Run it once more against minified HTML and see whether the result holds.
6. <strong>Add one CI rule.</strong> "Every `<table>` has at least one `<th>` and either a `<caption>` or an `aria-label`" is decidable by static analysis. That single line covers ground automated accessibility checks leave open.

Auditing table, form and landing markup against both the accessibility bar and the machine-readability bar is work I take on. If a site you run needs a pass at that standard, the contact route on my profile is open.
