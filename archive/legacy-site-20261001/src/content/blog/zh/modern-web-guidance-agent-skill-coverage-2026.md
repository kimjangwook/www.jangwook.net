---
title: '我数了数 Chrome 的 agent skill：138 篇指南，无障碍 2 篇，搜索 0 篇'
description: '装上 Chrome 团队的 Modern Web Guidance 0.0.180，按分类数完 138 篇指南，再用三个领域 22 条查询去戳检索。首位相似度：UI 0.643，无障碍 0.508，结构化数据 0.267，另有 2 条完全没有返回。语料库空出来的地方怎么用项目规约补上，这篇一并写清楚。'
pubDate: '2026-08-10'
heroImage: '../../../assets/blog/modern-web-guidance-agent-skill-coverage-2026/hero.png'
tags:
  - Web开发
  - AI智能体
  - 无障碍
  - 结构化数据
  - Baseline
faq:
  - question: '装了 Modern Web Guidance，agent 就能顺手把无障碍做好吗？'
    answer: '期望值先往下调。0.0.180 里 138 篇指南，挂在 accessibility 分类下的只有 2 篇。表单和 HTML 指南里也掺着无障碍内容，作为伞状总纲的 accessibility 指南有 7131 个 token，篇幅不小。但「装了所以无障碍就解决了」这个结论，我的测量给不出依据。'
  - question: '结构化数据、canonical 这类搜索相关的活，它管吗？'
    answer: '就我投的 6 条查询看，不管。"canonical link tag for duplicate pages" 和 "sitemap and robots.txt for a static site" 返回 0 条；"add JSON-LD structured data for local business" 只返回一条 built-in-ai 分类下毫不相干的指南，相似度 0.357。搜索和结构化数据在这个语料库的射程之外。'
  - question: 'Baseline 目标写在哪里、怎么写？'
    answer: '在 AGENTS.md 或 CLAUDE.md 里用文字写下项目的浏览器支持策略就行，skill 那边没有规定格式。什么都不写，默认就是 Baseline Widely available；用「Baseline 2024」这类年份目标时，某个特性的 Baseline since 日期在该年份及以前，就算达标。'
  - question: '装完项目里会留下什么？遥测呢？'
    answer: '.agents/skills/modern-web-guidance/ 下面进来 1.2MB、140 个文件，根目录多一个 skills-lock.json，Claude Code 通过软链接接上。遥测默认开启，搜索查询、指南读取和安装都会作为匿名统计上报。设 DISABLE_TELEMETRY=1 可以关掉。'
relatedPosts:
  - slug: act-rules-axe-coverage-wcag-sc-2026
    score: 0.86
    reason:
      ko: 도구가 스스로 밝히지 않는 사정거리를 목록으로 만들어 확인한다는 점에서 같은 작업이다. 그때는 axe 규칙과 성공기준을 맞춰봤고 이번엔 에이전트 스킬의 카테고리를 세어봤다.
      ja: ツールが自ら明かさない射程を一覧にして確かめる、という意味では同じ作業だ。あのときはaxeのルールと達成基準を突き合わせ、今回はエージェントスキルのカテゴリを数えた。
      en: Same job in a different costume — build the inventory a tool never prints about itself. That post matched axe rules to success criteria; this one counts an agent skill's categories.
      zh: 都是同一件事：把工具自己不会说明的射程列成清单。那篇比对的是 axe 规则和成功标准，这篇数的是 agent skill 的分类。
  - slug: localbusiness-structured-data-server-side-vs-js-2026
    score: 0.78
    reason:
      ko: 이번 코퍼스에 통째로 빠져 있던 영역이 바로 이 글의 주제다. JSON-LD를 서버에서 내보낼지 클라이언트에서 붙일지는 에이전트가 대신 판단해주지 않으니 규칙으로 적어둬야 한다.
      ja: 今回のコーパスからまるごと抜けていた領域が、この記事の主題そのものだ。JSON-LDをサーバーで出すかクライアントで足すかは、エージェントが代わりに判断してくれない。だから規則として書いておく。
      en: The domain missing from the whole corpus is exactly what that post covers. Whether JSON-LD ships from the server or gets bolted on client-side is not a call the agent will make for you.
      zh: 这次整个语料库缺席的领域，正是那篇文章的主题。JSON-LD 从服务端输出还是客户端补，agent 不会替你决定，得写成规则。
  - slug: reflow-1410-400-zoom-viewport-height-2026
    score: 0.71
    reason:
      ko: 이번 22개 질의 중 "reflow at 400% zoom"이 성능 카테고리 가이드로 새어나갔다. 그 질문에 실제로 필요한 답은 그때 직접 재서 쓴 이 글 쪽에 있다.
      ja: 今回の22件の質問のうち「reflow at 400% zoom」はパフォーマンス系のガイドに流れていった。その問いに本当に要る答えは、あのとき自分で測って書いたこちらにある。
      en: One of the 22 probe queries, "reflow at 400% zoom", drifted into a performance guide. The answer that query actually needs is in that post, measured by hand.
      zh: 这次 22 条查询里，「reflow at 400% zoom」漂到了性能类指南上。那条查询真正需要的答案，在那篇自己实测的文章里。
  - slug: anthropic-agent-skills-standard
    score: 0.64
    reason:
      ko: 스킬이라는 포맷 자체가 어떻게 생겼는지 먼저 보고 오면, SKILL.md 한 장이 에이전트의 행동 범위를 어떻게 규정하는지가 훨씬 빨리 읽힌다.
      ja: スキルというフォーマットそのものを先に見ておくと、SKILL.md一枚がエージェントの行動範囲をどう規定するのかが格段に速く読める。
      en: Read up on the skill format first and a single SKILL.md stops looking like documentation and starts looking like a scope contract.
      zh: 先看清 skill 这个格式本身，再回头读 SKILL.md，就很容易看出一张文件是怎么框定 agent 行为范围的。
  - slug: wcag22-target-size-audit-2026
    score: 0.58
    reason:
      ko: '"minimum target size for touch controls" 질의가 css 가이드로 떨어진 이유를 알고 싶다면, 그 기준이 실제로 무엇을 요구하는지 픽셀로 확인한 이 글이 대조군이 된다.'
      ja: 「minimum target size for touch controls」の質問がcssガイドに落ちた理由を知りたければ、その基準が実際に何を要求するのかをピクセルで確かめたこの記事が対照になる。
      en: If you want to know why "minimum target size for touch controls" landed on a css guide, that post is the control — it measures in pixels what the criterion actually demands.
      zh: 想知道「minimum target size for touch controls」为什么落到 css 指南上，那篇用像素核对了这条标准到底要求什么，正好当对照。
---

Chrome 团队在 I/O 2026 上放出了 Modern Web Guidance。它是一组 skill，把 Web 平台的知识灌进编码 agent 里，介绍语写的是能帮你做出「更无障碍、性能更好、更安全」的 Web 体验。安装就一行 `npx`。

跑完那一行，我做的第一件事是敲 `list` 数指南篇数。138 篇，15 个分类。挂在 accessibility 下的是 2 篇。至于结构化数据、可抓取性，分类列表里压根没有。

数字本身不是毛病。只是读着那三个并列的词去装它的开发者，和这个语料库真正的重心之间，隔着一段距离。今天就把这段距离量出来，再写清楚该在哪里补上什么。

![把 Modern Web Guidance 0.0.180 的 138 篇指南按分类统计的横向条形图。ui-behaviors 29 篇最多，其次 performance 24 篇、visual-design 16 篇，accessibility 只有 2 篇，检索与结构化数据分类为 0](../../../assets/blog/modern-web-guidance-agent-skill-coverage-2026/hero.png)

## agent skill 不是功能，是射程声明

先把词对齐。agent skill 是编码 agent 碰到某类任务时会翻开的一叠说明。核心是一张 `SKILL.md`，上面写着「什么时候翻开」和「翻开之后干什么」。agent 每接一个任务都会读这段触发说明，自己判断要不要启用。所以装一个 skill，与其说是加了工具，不如说是给 agent 的判断划了一条线。

Baseline 也顺手说清楚。Baseline 是 web.dev 的一套标注，用来表示某个 Web 特性在主流浏览器上是否已经稳定到可以放心用。主要两档：刚在所有主流引擎落地的叫 Newly available，再过足够长时间、基本哪儿都安全了的叫 Widely available。前端那句「这个现在能用了吗」，最后都得回到这份数据上找答案。

Modern Web Guidance 就是把这两样焊在一起的东西。[Chrome for Developers 文档](https://developer.chrome.com/docs/modern-web-guidance)里的定义，原文照录：

> Modern Web Guidance is a set of skills that embed web platform expertise, best practices, and browser compatibility data directly into your coding agents.

关于和 Baseline 的联动，[I/O 2026 的发布文](https://developer.chrome.com/blog/chrome-at-io26)里有一句，也是原文：

> It integrates directly with Baseline, letting you focus on what you want to build while your tools automatically figure out the right features and fallbacks to use within your chosen Baseline target.

意图很清楚，方向我也认同。与其每次动手去剥模型权重里那些 2019 年味儿的 CSS 写法，不如在干活的当口把最新的兼容性数据喂进去，结构上更合理。问题在于，喂进去的那张知识地图长什么样。地图之外的地方，agent 照样靠权重作答。而且它不会告诉你这一点。

## 装完之后项目里多了什么

npm 上这个包首发于 2026 年 4 月 30 日，到 8 月 3 日已经发了 96 个版本，差不多三天一个。我测的时候最新是 0.0.180，Apache-2.0 许可，解包后 36.6MB、198 个文件。这是早期预览的 0.0.x，读的时候得把这点折进去。

在空目录里跑安装。

```bash
npx modern-web-guidance@latest install
```

安装器会弹交互界面，自己识别目标 agent。我这边的结果是：

```
✓ ./.agents/skills/modern-web-guidance
  universal: Amp, Antigravity, Antigravity CLI, Codex, Cursor +12 more
  symlinked: Claude Code
```

`.agents/skills/modern-web-guidance/` 下面 1.2MB、140 个文件，根目录多出 `skills-lock.json`，Claude Code 走软链接。所有指南都是纯 Markdown，打开就能读。这点我挺喜欢：agent 给出答案之后，人能回头找到它读的到底是哪段字。

安装最后会弹遥测告知。[仓库 README](https://github.com/GoogleChrome/modern-web-guidance) 里的原句是：

> Google collects anonymous usage statistics (such as search queries, guide retrievals, and installation) to improve the reliability, relevance, and performance of the tool.

要留意的是「搜索查询」明确在收集范围里。跑在公司内部仓库上的 agent，查询串很容易带上项目上下文。关掉只要一个环境变量。

```bash
export DISABLE_TELEMETRY=1
```

还有一点值得记：安装界面会并排显示第三方安全评估。我这次跑出来 Socket 是 0 alerts，Snyk 是 Med Risk。这是第三方扫描器的判定，不是 Google 的官方评价，我也没去追它凭什么这么判。当参考值看就行。

## 138 篇都堆在哪儿

`list` 命令会把全部指南吐成 JSON。按分类数下来是这样：

| 分类 | 指南数 |
|---|---|
| ui-behaviors | 29 |
| performance | 24 |
| visual-design | 16 |
| forms | 15 |
| css | 14 |
| ui-atoms | 9 |
| js | 8 |
| security | 7 |
| built-in-ai | 4 |
| ui-components | 4 |
| webmcp | 3 |
| accessibility | 2 |
| css-layout | 1 |
| html | 1 |
| privacy | 1 |
| 检索 / 结构化数据 | 0 |

前五个分类合计 98 篇，占全部的 71%。重心压在「做出屏幕上看得见的东西」这件事上。

有一点得说公道话。accessibility 只有 2 篇，不等于无障碍内容的总量只有这么多。这 2 篇里作为伞状总纲的 `accessibility`，有 7131 个 token，是整个包里第三大的文档。目录一路走过导航结构、语义化 HTML 与 ARIA、可访问名称、文档元数据与语言、键盘与焦点管理、替代文本与媒体。15 篇表单指南里也掺着标签和自动填充相关的无障碍内容。所以「无障碍只有 2 篇」说的是分类标签，不是内容体量。

不过结构上的差别还在。UI 那边铺了 29 篇「这种场景用这个特性」的细颗粒指南，无障碍则把细节折进一篇厚总纲里。在 agent 靠检索捞细颗粒答案的机制下，这个差别会落到结果上。

被覆盖到的那部分，质量也得单独评一句才算公平。我翻了 performance 分类下的 `optimize-image-priority`，写得好。它没停在「给 LCP 图片加 `fetchpriority="high"`」这种常见程度上。

```
4. **Optimize lazy loading**: Never use `loading="lazy"` on the LCP image.
   For standard below-the-fold images, `loading="lazy"` is sufficient...
   Avoid adding `fetchpriority="low"` to these images, as you want them to
   load at normal priority once the user scrolls to them.
```

它把折叠线以下的普通图片，和折叠线以上但初始不可见的图片（轮播后面的幻灯片、大型下拉菜单）拆开，分别处理。这个区分实务里经常搞混，搞混之后亏的不是 LCP，是带宽被抢。如果这个颗粒度的指令在 138 篇里占了相当比例，那这工具确实有胜过权重的地盘。问题只是这块地盘的边界在哪。

## 同一个工具，三类问题

于是我去戳它。UI/CSS 6 条、无障碍 10 条、检索与结构化数据 6 条，一共 22 条查询丢给 `search`，记下首位结果的相似度和返回条数。查询按真实任务指令那样用英文平白写——语料是英文的，用英文问对它有利。

```bash
npx modern-web-guidance@0.0.180 search "add JSON-LD structured data for local business"
```

```json
[{"id":"language-model","description":"...","category":"built-in-ai",
  "tokenCount":1984,"similarity":0.357}]
```

一条。而且是浏览器内置语言模型 API 的指南，跟结构化数据没关系。

![把 22 条查询的首位相似度分成三组画出的横向条形图。UI/CSS 组分布在 0.408 到 0.724，无障碍组在 0.384 到 0.641，检索与结构化数据组在 0.357 到 0.506，其中 2 条完全没有返回](../../../assets/blog/modern-web-guidance-agent-skill-coverage-2026/query-probe.png)

按组汇总：

| 查询组 | 条数 | 首位相似度均值 | 无返回 |
|---|---|---|---|
| UI / CSS | 6 | 0.643 | 0 |
| 无障碍 | 10 | 0.508 | 0 |
| 检索 / 结构化数据 | 6 | 0.267 | 2 |

UI 组打得很准。"custom styled select dropdown" 以 0.724 命中 `custom-select-picker-layouts`，"view transition between pages" 以 0.703 命中 `cross-document-transitions`。6 条全都在各自分类里找到了答案。

无障碍组一定有返回，但准星是飘的。10 条里，前五位中至少出现过一次 accessibility 分类指南的有 7 条。剩下 3 条才是问题所在。"associate a label with a form input" 的前五位清一色是 forms 的自动填充指南；"minimum target size for touch controls" 落到 css 总纲上；"reflow at 400% zoom without horizontal scroll" 落到了 `defer-work-until-scroll-ends` 这篇性能指南上。最后这条尤其偏——400% 放大下的回流是视口尺寸问题，不是滚动性能问题。[我实测过这一条，真正塌的是高度而不是宽度](/zh/blog/zh/reflow-1410-400-zoom-viewport-height-2026)，而那个答案在这套语料里哪儿都没有。

检索组则完全是另一幅画面。"canonical link tag for duplicate pages" 和 "sitemap and robots.txt for a static site" 都返回 0 条，也就是没有任何结果越过工具设定的阈值。"render meta description and title tags" 叼回来一篇无障碍指南，0.378；"get cited by AI search answers" 叼回来语言检测 API 的指南，0.362。

这次测量的边界也得讲明白。22 条是探针，不是基准测试。换个措辞，相似度就会动。阈值和截断是工具自己的设定，我没改过。更要紧的是，首位打偏不等于 agent 一定会写出烂代码——伞状指南够厚，准星歪了，需要的那段有时也在里面。README 里 Google 自己的评测（7 月 6 日，129 个任务、1071 条断言）写着 codex_cli 从 57% 到 84%，涨 27 个点；claude_code 从 52% 到 87%，涨 35 个点。那是他们的数字，那套评测我没跑。

我能凭自己的测量说的只有一句：这套语料在「把屏幕做出来」上很强，在「页面能不能被找到、被引用」上不发一言。

## Baseline 目标就写在项目文件里，一行的事

从这儿开始是能直接拿走用的。装好的 `SKILL.md`（包内原文，[GoogleChrome/modern-web-guidance](https://github.com/GoogleChrome/modern-web-guidance)）里明确写了浏览器支持的判定规则。默认值那句，原文照录：

> All guides assume <strong>Baseline Widely available</strong> features are safe to use without fallbacks.

什么都不声明，agent 就只把 Widely available 当作无条件安全，比这一档低的特性一律配降级方案。如果你的项目可以更激进，那就得写出来。格式没有硬性要求，在 `AGENTS.md` 或 `CLAUDE.md` 里用文字写就行。年份目标的判定规则也在 `SKILL.md` 里：Baseline YYYY 目标下，某特性的 "Baseline since" 日期在该年份及以前，即视为达标。

我自己用的是这个形状：

```markdown
## Browser Support

Baseline target: Baseline 2024。
Newly available 的特性，只要做了特性检测就允许使用。
降级代码只接受 20 行以内、且不新增外部依赖的写法。
达不到这个条件，就改实现思路，别硬写降级。
```

四行写下去，agent 就不用每次来问。判定要用的数据其实已经在指南里：138 篇中有 74 篇在正文里写明了 Baseline 状态。比如那篇图片优先级指南里就嵌着这么一行。

```
Baseline status for Fetch priority: Newly available.
It's been Baseline since 2024-10-29.
```

调用开销我也量了。首次因为要下包花了 10.7 秒，缓存起来之后连跑三次是 2.09 秒、1.15 秒、1.22 秒。`SKILL.md` 要求「所有 HTML/CSS 与客户端 JS 任务先执行检索」，所以这趟往返要按「每个任务都加一次」来算。上下文那头的开销更大。检索结果会一并返回每篇指南的 `tokenCount`：细颗粒指南 900 到 3000 token，伞状的 css 是 7755、accessibility 7131、performance 5599。开两篇伞，一万五千 token 就进上下文了。不是说这样不好，是说花之前要知道自己在花什么。

## 语料空掉的地方，自己铺第二层规约

真正关键的，是检索什么都没找到时 agent 会怎么办。`SKILL.md` 的指引是：结果稀薄就用 `list` 通览一遍。可如果这个主题在总目录里也没有，agent 得到的结论就变成「这个项目对此没有规约」。没有规约，会被读成自由。而自由写出来的 JSON-LD 多半是客户端注入的，canonical 会漏，title 标签会在某个组件里被拼出来。

所以我在装了 skill 的仓库里，会一并放上第二层规约，只挑语料库不管的那些轴来写。

```markdown
## Search & structured data（skill 语料射程之外 —— 项目规约）

- 结构化数据必须出现在服务端渲染的 HTML 里，不要客户端注入。
- 每个页面都带自引用 canonical；多语言页面之间用 hreflang 互指。
- title 和 meta description 的值来自路由定义，不在组件内部拼装。
- 正文文本在不执行 JS 的响应 HTML 里就要存在，标签页和折叠面板里的内容同理。
- 只要动了 JSON-LD，CI 里就跑一次 schema 校验。

## Accessibility acceptance（自动检测抓不到的部分）

- 新增的浮层一律按 WCAG 2.4.11 判定，Shift+Tab 反向也要走一遍。
- 可交互元素在宽和高两个方向上都要满足 2.5.8 的 24x24 CSS px。
- 320x200 视口下不得出现二维滚动（1.4.10）。
- 以上三条与 axe 是否通过无关，另行确认。
```

第二块里的条目不是随手挑的，它们和我那 22 条里准星打偏的那几条正好对上。自动检测工具到底判定了哪些成功标准，[我把 axe 的规则和 WCAG 成功标准逐条对过一次并列成清单](/zh/blog/zh/act-rules-axe-coverage-wcag-sc-2026)，当时的教训在这里原样成立：工具不会告诉你它看不见什么。那张清单得人来写、人来贴。

结构化数据那块的第一行也不是口味问题。它是[实测 LocalBusiness 标记走服务端输出和用 JavaScript 补挂到底差在哪](/zh/blog/zh/localbusiness-structured-data-server-side-vs-js-2026)之后，把结论压成的一句规约。

## 落地前 30 分钟的核对顺序

我不是让你别装。我装了，也打算继续用。只是装之前，下面五件事最好自己确认一遍，加起来半小时够了。

1. 跑 `npx modern-web-guidance@latest list`，数一数<strong>你们团队真正在做的活</strong>对应的分类在不在。不在，就从一开始把这块从期待里划掉。
2. 把上个迭代里五条真实的任务描述原样丢进 `search`。相似度低于 0.5 的超过一半，说明这工具还没对上你们的主战场。
3. 在 `AGENTS.md` 或 `CLAUDE.md` 里写下 Baseline 目标那句话。不写的话，得让全组都知道默认值是 Widely available。
4. 把语料库缺的那几个轴写成项目规约：检索与结构化数据，加上自动检测判不了的无障碍项。上面那两块抄过去，按自己情况删减即可。
5. 如果组织策略卡查询串外发，就把 `DISABLE_TELEMETRY=1` 写进 shell 配置，并且通知到人。

有一个问题我还没答上来。这类 skill 越来越多之后，agent 该怎么处理「查过了，没有」？现在的做法是没有就默默退回权重。可确实有些任务，把「没有」这件事本身报告出来然后停下才是更好的选择，而 skill 这个格式要怎么表达这层区分，我暂时没看到路子。

把什么交给 agent、把什么用规约摁住，说到底不是代码问题，是共识问题。这份共识文档需要有人一起写的话，[联系页](/zh/contact/)一直开着。

---

*来源：Chrome for Developers 的 [Modern Web Guidance](https://developer.chrome.com/docs/modern-web-guidance)、[Get started](https://developer.chrome.com/docs/modern-web-guidance/get-started)、[15 updates from Google I/O 2026](https://developer.chrome.com/blog/chrome-at-io26)，GoogleChrome/[modern-web-guidance](https://github.com/GoogleChrome/modern-web-guidance) 仓库 README，web.dev 的 [Baseline](https://web.dev/baseline)（均为官方）。正文中三处英文块引用（定义句、Baseline 联动句、降级默认值句）分别与上述文档及安装后的 `SKILL.md` 原文当场逐字核对后引用，并在引用旁给出出处。测量环境：modern-web-guidance 0.0.180、Node 22.22、macOS、一次性沙箱目录，2026 年 8 月 10 日测量。指南清单原始数据在 `data/mwg-guide-list.json`，22 条查询结果在 `data/mwg-query-probe.json`，查询脚本为 `scripts/probe-modern-web-guidance.mjs`，图表由 `scripts/chart-modern-web-guidance.py` 生成。22 条是探针而非基准测试，结果随查询措辞变化。README 里 27 到 35 个百分点的提升是 Google 公开的自评数据，不是我复现出来的。分类数按工具自带的标签统计，混在其他分类指南内部的无障碍内容分量没有计入。*
