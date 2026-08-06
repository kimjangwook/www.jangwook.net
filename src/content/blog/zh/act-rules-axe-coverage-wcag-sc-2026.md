---
title: 'CI 一直是绿的，审计报告却有三十条：用 W3C 的 1,213 个标准答案量自动检查的边界'
description: 'W3C ACT 公开了 1,213 个带人工标注的测试用例。把 axe-core 全量跑一遍，387 个「应该失败」的用例里只有 145 个（37.5%）报出了对应成功标准的违规，36 条标准中有 22 条挂零，而这些沉默里有一部分只是规则默认没开。'
pubDate: '2026-08-06'
heroImage: '../../../assets/blog/act-rules-axe-coverage-wcag-sc-2026/hero.png'
tags:
  - 无障碍
  - WCAG
  - CI
  - 测试
  - Web开发
faq:
  - question: '自动检查只有 37.5%，剩下的都得靠人工吗？'
    answer: '不全是。230 个沉默用例里有一部分只是规则默认关着，把实验性规则和 AAA 规则打开后能升到 166 个。真正剩下的是要读语义才能判的项目，比如链接文字有没有说清去哪儿、错误提示有没有讲明白错在哪里。有用的产出不是那个百分比而是那张清单：写清楚哪些成功标准由机器决定、哪些不由机器决定，人工时间就只花在第二张清单上。'
  - question: 'axe 的 experimental 规则可以开吗？'
    answer: '开是可以的，但别直接接到构建失败上。Deque 标 experimental 的意思是误报的可能性还在，所以我先把这类结果当成参考项累积几天，看清噪声再升级为阻断条件。target-size 是另一回事，它对应 WCAG 2.2 AA 却默认关闭，这种应该从第一天就放进阻断集合。'
  - question: '这个测量能直接用在我自己的站点上吗？'
    answer: '这是在审检查器，不是在审站点。被测对象是 W3C 公开的样例而不是你的页面，产出也不是「我这儿有几条违规」，而是「我的检查器到底能判哪些标准」。所以跑一次拿到清单，在换工具或换版本之前都可以复用。脚本在我的仓库里，首次拉取之后一分钟左右跑完。'
  - question: '换成 Lighthouse 或别的工具，结果会不一样吗？'
    answer: '会。本文所有数字只属于 axe-core 4.13.0。Lighthouse 的无障碍分类底层用的是 axe，但启用的规则集合又不一样，所以换工具就得重新生成一次覆盖清单。同一个脚本换个检查器也能跑，不过这个对比我还没做。'
relatedPosts:
  - slug: wcag-em-2-sampling-vs-full-sweep-audit-2026
    score: 0.78
    reason:
      ko: 그 글은 페이지를 몇 장 보느냐를 셌고, 이 글은 규칙이 몇 개를 결정하느냐를 센다. 전수로 훑어도 검사기가 판정하지 못하는 기준은 그대로 남는다.
      ja: あちらは「何ページ見るか」を数えた。この記事は「ルールが何を決められるか」を数える。全ページ走査しても判定できない基準は残る。
      en: That audit counted how many pages you look at. This one counts how many criteria the checker can decide. Sweep every page and the undecidable criteria are still there.
      zh: 那篇数的是「看几页」，这篇数的是「规则能判几条」。就算全量扫描，判不了的标准照样留在原地——同一个洞的两个面。
  - slug: axe-core-ci-a11y-jsdom-vs-browser-2026
    score: 0.74
    reason:
      ko: jsdom에서 색상 대비가 조용히 빠지는 걸 확인했던 글이다. 이번에는 브라우저를 띄워 그 변수를 없앤 뒤에도 남는 공백을 성공기준 단위로 셌다.
      ja: jsdomでコントラスト比が黙って抜ける件を確かめた記事。今回はブラウザを立てて変数を消した上で、なお残る空白を達成基準ごとに数えた。
      en: That post found color contrast quietly dropping out under jsdom. This one removes that variable with a real browser and counts what is still missing.
      zh: 那篇发现对比度在 jsdom 里会悄悄消失。这篇干脆开真浏览器把这个变量去掉，再按成功标准数还剩多少空白。运行环境和规则覆盖是两层问题。
  - slug: wcag22-target-size-audit-2026
    score: 0.71
    reason:
      ko: 그때 타깃 크기를 직접 재면서 axe에 관련 규칙이 있다는 건 알고 있었다. 이번 측정에서 그 규칙이 기본 비활성이라는 걸 알았다.
      ja: あの時ターゲットサイズを測りながら、axeに該当ルールがあることは知っていた。今回の測定で、そのルールが既定で無効だと分かった。
      en: While measuring target sizes back then I knew axe had a rule for it. This measurement showed that rule ships disabled.
      zh: 当时手测目标尺寸时，我知道 axe 有对应规则。这次测量才发现那条规则默认是关的——明明对应 WCAG 2.2 AA，裸跑却根本不执行。
  - slug: focus-not-obscured-sticky-header-scroll-padding-2026
    score: 0.66
    reason:
      ko: 포커스 가림은 axe에 규칙 자체가 없어서 스크립트를 직접 짜야 했던 사례다. 규칙이 없는 기준과 규칙이 꺼진 기준은 대응이 다르다.
      ja: フォーカスの隠れはaxeにルール自体が無く、スクリプトを自分で書くしかなかった事例だ。ルールが無い基準と切れている基準では打ち手が違う。
      en: Focus occlusion has no axe rule at all, which is why 2.4.11 never appears in this article's table.
      zh: 焦点被遮挡在 axe 里压根没有规则，只能自己写脚本。这也是本文表格里看不到 2.4.11 的原因。没有规则和规则被关掉，处理方式并不一样。
---

CI 上的无障碍检查连续三个月是绿的，外部审计报告寄回来，上面列着三十几条。

这个场面见过的人不少，通常的解释是「自动工具只能覆盖一部分」。听着合理，但它没有回答任何一个能落地的问题：覆盖的是哪一部分，漏掉的是哪一部分，明天该把人工时间花在哪里。

要回答这些，得有标准答案。自己的站点上没有。想知道页面里到底有几条违规，得靠人一页页看，而如果人能做到这件事，检查器本来也就不需要了。

答案其实是公开的。W3C 为无障碍测试发布了一整套带人工标注的样例：每条规则配上通过的例子、失败的例子、不适用的例子。1,213 个文件，87 条规则。把检查器喂进去，覆盖率就不再是猜测。

我把 axe-core 喂了进去。387 个「应该失败」的用例里，报出对应成功标准违规的有 145 个。

## 绿灯把两句话压成了一个字

自动检查器是一堆规则的集合。每条规则在文档里找自己的目标，对找到的每个目标给出通过、违规或无法判定。以 axe-core 为例，结果分四摞：`violations`、`passes`、`incomplete`（需要人看）、`inapplicable`（没有可测对象）。

接进 CI 的时候，我们看的通常只有第一摞。`violations.length === 0` 就放行。这个设计里藏着一个默认假设：<strong>规则不覆盖的问题，压根不会被计数</strong>。链接文字有没有说明目的地、错误提示有没有讲清错在哪里、标题有没有描述下面那段内容，这些要么规则放弃判定，要么根本没有规则，结果都不会进 `violations`。

于是这个 0 把两句话压成了一个字符。「看过了，没问题」和「没看」在日志里长得一模一样。

## W3C 发的是标准答案，不是又一份指南

工具之间结果打架，是这个领域的老问题。同一个页面丢进两个产品，违规数不一样，而且没有尺子判断谁对。W3C 的 ACT（Accessibility Conformance Testing）就是冲这个来的：把规则的书写格式标准化，并为每条规则附上<strong>通过、失败、不适用</strong>三类样例，让不同工具在同一份输入上比较。

[ACT Rules Format 1.1](https://www.w3.org/TR/act-rules-format-1.1/) 在 2026 年 2 月 5 日成为 W3C 建议标准。规则清单和测试用例在 [ACT Rules 页面](https://www.w3.org/WAI/standards-guidelines/act/rules/)上，也有机器可读的形式，全部装在一个 `testcases.json` 里。

```json
{
  "ruleId": "674b10",
  "ruleName": "Role attribute has valid value",
  "ruleAccessibilityRequirements": {
    "wcag-technique:ARIA4": { "failed": "not satisfied" },
    "wcag20:4.1.2": { "secondary": "This success criterion is less strict than this rule..." }
  },
  "expected": "passed",
  "relativePath": "testcases/674b10/c181f7267bf9f4fc0f9ad9e2a69c1ad7da504f4d.html"
}
```

拉下来是 1,213 个用例，出自 87 条 ACT 规则，标注分别是通过 472、失败 393、不适用 348。87 条规则里有 63 条把 WCAG 成功标准列为一级要求，另外 24 条只指向 WCAG 技术（technique）。作为一级要求出现的成功标准去重后是 37 条。

中间踩了个坑。用 Node 的 `fetch` 访问 w3.org 会稳定拿到 HTTP 429，同一个 URL 用 `curl` 却是 200。不管它按什么特征拦，脚本是过不去的，我在这儿耗了四十分钟。后来发现同样的文件就放在 [w3c/wcag-act-rules 仓库](https://github.com/w3c/wcag-act-rules)里，改从那边拉，并用 SHA-256 跟 w3.org 上的原文件对了一遍，一致。

1,213 个用例里有 453 个用绝对路径引用 `/WAI/content-assets/wcag-act-rules/test-assets/` 下面的图片、视频和子页面，所以我起了一个本地 HTTP 服务器，按同样的路径前缀提供。附带拉了 96 个静态资源，超过 2MB 的示例视频有 6 个（最大 35.5MB）跳过了。没有哪条规则是靠看视频像素来判定的。

## 「有没有报出任何违规」这个信号是废的

第一版统计写得很直白：失败用例里 axe 只要吐出任意一条违规，就算抓到。387 个里抓到 386 个，99.7%。差点就高兴了。

把同样的算法套到通过用例上，461 个里有 458 个也被判成有违规，99.3%。原因回头看很明显：ACT 的测试用例是为了展示单条规则而写的最小文档，没有 `<main>`，也没有 `<h1>`，于是看页面结构的规则几乎在每个文件上都发火。

在 799 个非失败用例上，axe 报出的违规按规则统计是这样：

| axe 规则 | 触发次数 | 占比 | 标签 |
|---|---|---|---|
| `landmark-one-main` | 784 | 98% | best-practice |
| `page-has-heading-one` | 754 | 94% | best-practice |
| `region` | 572 | 72% | best-practice |
| `document-title` | 192 | 24% | wcag2a |
| `html-has-lang` | 74 | 9% | wcag2a |

前三条全是 `best-practice`，属于 Deque 推荐的编码习惯，不是 WCAG 合规项。做门禁的时候不按标签收窄，这三条会把信号整个盖掉。后两条虽然带 WCAG 标签，但在这里是「检查片段而不是页面」带来的副产物。

所以我换了判定口径：<strong>只有当 axe 报出的结果带着该 ACT 规则所指成功标准的标签时，才算抓到。</strong>规则 `674b10` 指向 4.1.2，axe 就必须报出带 `wcag412` 标签的东西。然后把结果分成三类：判为违规、通过 `incomplete` 交给人、什么都没说。

第三类才是这次测量的重点。交给人和保持沉默，在流水线上是完全不同的两件事，而默认的 reporter 对这两者一视同仁地放过去。

## 37.5% 这个总数没法拿来做决定

axe-core 4.13.0，无头 Chromium 143，全量跑，不到一分钟。

```
failing examples evaluated: 387 (unevaluable 6, page errors 27)
  criterion-matched violation : 145 (37.5%)
  needs-review only           :  12 ( 3.1%)
  silent                      : 230 (59.4%)
```

37.5%，跟业内常说的「自动工具大概能覆盖三分之一」差不太多。但这个数字什么都决定不了：明天先修哪里、人工评审的半天花在什么上，从总数里读不出来。

按成功标准拆开，画面完全变了。

![按 WCAG 成功标准分组的横向堆叠柱状图，展示 axe-core 在 ACT 失败用例上给出的判定分为违规、需人工复核、沉默三类。4.1.2 在 52 个用例中抓到 48 个，而 2.5.3、1.4.6、2.4.9、2.4.6 均为 0](../../../assets/blog/act-rules-axe-coverage-wcag-sc-2026/sc-coverage.png)

| 成功标准 | 失败用例 | 违规 | 需复核 | 沉默 |
|---|---|---|---|---|
| 4.1.2 Name, Role, Value | 52 | 48 | 2 | 2 |
| 1.1.1 Non-text Content | 26 | 18 | 0 | 8 |
| 2.4.4 Link Purpose (In Context) | 25 | 11 | 0 | 14 |
| 1.3.1 Info and Relationships | 21 | 18 | 2 | 1 |
| 2.5.3 Label in Name | 16 | 0 | 0 | 16 |
| 1.4.12 Text Spacing | 14 | 13 | 0 | 1 |
| 1.4.6 Contrast (Enhanced) | 13 | 0 | 0 | 13 |
| 2.4.9 Link Purpose (Link Only) | 11 | 0 | 0 | 11 |
| 1.3.5 Identify Input Purpose | 10 | 10 | 0 | 0 |
| 2.4.6 Headings and Labels | 10 | 0 | 0 | 10 |

4.1.2 是 52 个里抓到 48 个。名称、角色、值这类东西看 DOM 和无障碍树就能定，正是检查器的强项，1.3.5 和 1.4.12 也是同样的道理。另一端则是一串零：2.5.3（可见标签是否包含在可访问名称里）16 个里 0 个，2.4.6（标题和标签是否描述了内容）10 个里 0 个，2.4.9（只看链接文字能否知道目的）11 个里 0 个。

整体上，<strong>出现过的 36 条成功标准里有 22 条一条违规都没报</strong>；87 条 ACT 规则里有 54 条，对自己全部的失败用例既没报违规也没要求复核。

这些零不能读成 axe 的缺陷。「链接文字有没有说清目的地」需要读语义，检查器在没把握的情况下硬报违规，误报会堆到没人再看结果为止。W3C 在[评估工具概览](https://www.w3.org/WAI/test-evaluate/tools/)里也划了这条线：「However, tools can't do it all. Some accessibility checks just cannot be automated and require manual intervention.」

我的判断是：问题不在工具沉默，而在<strong>这份沉默没有被记录在流水线的任何地方</strong>。自动化决定不了的那 22 条标准，在你选定工具的那一刻就已经确定了。可是把这份清单写下来的团队，我几乎没见过。

## 有一部分沉默不是能力问题，是配置问题

看表的时候 2.5.3 让我停住了。axe 里有一条叫 `label-content-name-mismatch` 的规则，标签里明明白白带着 `wcag253`。规则存在，16 个用例却全部沉默，这说不通。

翻规则元数据才看到，这条规则带 `experimental` 标签。[axe-core 的 API 文档](https://github.com/dequelabs/axe-core/blob/develop/doc/API.md)写得很清楚：

> The default operation for axe.run is to run all rules except for rules with the "experimental" tag.

同一份文档的标签表里写着：「`experimental` | Cutting-edge rules, disabled by default」。

数一下 4.13.0 随包发布的规则：一共 105 条，带 WCAG 标签的 75 条，`best-practice` 30 条。其中 `enabled: false` 的有 9 条，带 `experimental` 标签的有 7 条，<strong>合起来 16 条规则不在裸跑的执行范围内。</strong>

| 规则 | 标签 | 代价 |
|---|---|---|
| `color-contrast-enhanced` | wcag2aaa, wcag146 | 1.4.6 的 13 个用例全部沉默 |
| `identical-links-same-purpose` | wcag2aaa, wcag249 | 2.4.9 的 0 |
| `label-content-name-mismatch` | wcag21a, wcag253, experimental | 2.5.3 的 0 |
| `meta-refresh-no-exceptions` | wcag2aaa, wcag224, wcag325 | 2.2.4 与 3.2.5 的 0 |
| `target-size` | <strong>wcag22aa</strong>, wcag258 | 对应 WCAG 2.2 AA，却默认关闭 |

最后一行值得单独说。`target-size` 既不是 AAA 也不是实验性，它对应的 2.5.8 是 WCAG 2.2 新增的 AA 标准，我还[专门量过并修过这一条](/zh/blog/zh/wcag22-target-size-audit-2026)。可是不做任何配置地跑 axe，这条规则根本不执行。也就是说，凡是声称「在 CI 里检查 WCAG 2.2 AA」的流水线，都整条跳过了一个标准。

于是我把所有规则打开重跑了一遍。

```
failing examples evaluated: 383 (unevaluable 10, page errors 38)
  criterion-matched violation : 166 (43.3%)
  needs-review only           :  21 ( 5.5%)
  silent                      : 196 (51.2%)
```

从 37.5% 到 43.3%，挂零的成功标准从 22 条降到 18 条。回来的是 2.5.3（0→14）、1.4.6（0→9）、以及 2.2.4 和 3.2.5（各 0→2）。2.4.9 的违规依然是 0，但多了 6 条 `incomplete`，至少「该让人看看」这个信号立起来了。

实际发火的规则数，默认是 45 条，全开是 52 条。7 条规则的差别，救回了 4 条成功标准。

## 门禁现在这么搭

从测量里出来的处方有三条，按顺序落到代码上。

<strong>一，用标签框定范围。</strong>混进 `best-practice`，前面那个 `landmark-one-main` 之类的规则就会把信号盖住。不是规则不好，而是合规门禁和编码习惯报告本来就该有不同的失败条件。

<strong>二，把需要的默认关闭规则显式打开。</strong>首先是 `target-size`。如果合规目标包含 AAA，再加上 `color-contrast-enhanced` 和 `identical-links-same-purpose`。

<strong>三，把 `incomplete` 打出来。</strong>不是让它变成失败条件，而是让日志里有个数字，这样「门禁过了，但有 12 项要人看」才看得见。

```js
const AXE_OPTIONS = {
  runOnly: {
    type: 'tag',
    values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'],
  },
  rules: {
    // 对应 WCAG 2.2 AA，却默认关闭。不打开，2.5.8 就没人查。
    'target-size': { enabled: true },
    // 实验性规则：先当参考项累积，摸清噪声后再升级为阻断。
    'label-content-name-mismatch': { enabled: true },
  },
  resultTypes: ['violations', 'incomplete'],
};

const result = await new AxePuppeteer(page).options(AXE_OPTIONS).analyze();

const blocking = result.violations.filter((v) => !v.tags.includes('experimental'));
const advisory = result.violations.filter((v) => v.tags.includes('experimental'));

console.log(`violations ${blocking.length} / advisory ${advisory.length} / needs review ${result.incomplete.length}`);
for (const item of result.incomplete) {
  console.log(`  review: ${item.id} (${item.nodes.length} nodes) — ${item.help}`);
}

if (blocking.length > 0) process.exit(1);
```

到这里是机器能决定的那一半。另一半得写成清单，而这次测量正好替你写好了：所有挂零的成功标准就是人工复核项。2.4.6（标题与标签）、2.4.9（链接文字）、3.3.1（错误识别）、1.3.3（感官特征）、2.1.2（键盘陷阱）、1.4.5 与 1.4.9（文字图片），以及 1.2.x 的媒体替代系列。这份清单不需要按页重做，工具和版本钉住了，清单也就钉住了。

我自己的顺序是：先让全量自动检查把能判的都清掉，人的注意力只花在上面那份清单上。这跟我前阵子折腾的[抽样问题](/zh/blog/zh/wcag-em-2-sampling-vs-full-sweep-audit-2026)正好配成一对——那边问「看几页」，这边问「看得见什么」。审计计划要两个答案都有才立得住。

## 这些数字没有说的事

把条件原样写出来。

ACT 的测试用例是为隔离单条规则而造的最小文档，不是真实页面。真实页面有时上下文更丰富，检查器反而判得更准；有时元素太多又会漏。所以这些数字应该读成<strong>规则覆盖的上限</strong>，而不是生产站点上的检出率。

有些用例根本加载不完。带 `meta refresh` 或者锁定屏幕方向的例子会让浏览器中途跳走，每次跑有 27〜38 个落在这里，评估总数因此每次浮动几个。百分比在一个点以内摆动。

W3C 另外发布过按工具划分的 ACT 实现报告，这篇文章不是那个东西。那边看的是规则级别的实现一致度，这边看的是「不做配置直接接进 CI 时，每条成功标准分别能得到什么结论」。问题不同，数字不能并排比。

另外，所有结果只属于 axe-core 4.13.0，换个检查器就是另一份清单。最后一句虽然是常识但还是要写：<strong>把自动规则全跑通，不等于 WCAG 合规。</strong>合规是人来判定的。

## 收尾：今天就该生成的两份清单

- 把检查器版本钉死，导出该版本<strong>默认关闭的规则清单</strong>。axe 的话，`enabled: false` 加 `experimental` 一共 16 条。
- 其中落在合规目标内的显式打开。目标是 WCAG 2.2 AA 的话，`target-size` 不是可选项。
- 用标签收窄门禁的 `runOnly`，别让 `best-practice` 淹掉合规信号。
- 把 `incomplete` 的条数写进日志。绿灯和「12 项待复核」必须看得出区别。
- 把所有零违规的成功标准直接变成<strong>人工复核清单</strong>。没有这份清单，人工测试每次都是临时发挥。
- 每次升工具或升版本，两份清单都重新导一遍。一条规则的开关，能让一整条成功标准换位置。

脚本放在仓库里，叫 `scripts/act-coverage-audit.mjs`。不带参数是默认规则集，加 `--all-rules` 就是全规则口径的同一张表。首次运行要花点时间拉测试用例，之后一分钟以内。

你现在跑的这套无障碍门禁，究竟在替你决定哪些成功标准？如果没列过，就从列这张清单开始。要找我的话，走[个人页](/zh/about/)。

---

*来源：W3C 的 [ACT Rules Format 1.1](https://www.w3.org/TR/act-rules-format-1.1/)（W3C 建议标准，2026 年 2 月 5 日）、[ACT Rules](https://www.w3.org/WAI/standards-guidelines/act/rules/)、[Web Accessibility Evaluation Tools List](https://www.w3.org/WAI/test-evaluate/tools/)，以及 Deque 的 [axe-core API 文档](https://github.com/dequelabs/axe-core/blob/develop/doc/API.md)。以上均为官方来源。测量环境：W3C ACT Task Force 测试用例 1,213 个（2026 年 8 月 6 日取得，覆盖 87 条规则），axe-core 4.13.0，Playwright 1.57 + 无头 Chromium 143.0.7499.4，Node 22.22，视口 1280×800，本地 HTTP 服务器。测试用例文件从 w3c/wcag-act-rules 仓库拉取，并与 w3.org 原件做过 SHA-256 比对。所有数字都出自这个工具、这个版本、这套测试集，不构成对真实网站检出率或其他检查工具性能的陈述。*
