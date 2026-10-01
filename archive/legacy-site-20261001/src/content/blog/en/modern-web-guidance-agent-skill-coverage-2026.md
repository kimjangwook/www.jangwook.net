---
title: "Chrome's agent skill: 138 guides, 2 on a11y, 0 on search"
description: 'I counted the 138 guides in Chrome''s Modern Web Guidance 0.0.180 and probed its search with 22 queries: UI 0.643, accessibility 0.508, structured data 0.267.'
pubDate: '2026-08-10'
heroImage: '../../../assets/blog/modern-web-guidance-agent-skill-coverage-2026/hero.png'
tags:
  - Web Development
  - AI Agents
  - Accessibility
  - Structured Data
  - Baseline
faq:
  - question: 'If I install Modern Web Guidance, will my agent handle accessibility for me?'
    answer: 'Lower that expectation. In 0.0.180, two of the 138 guides sit in the accessibility category. Accessibility material is mixed into the forms and HTML guides too, and the umbrella accessibility guide is a hefty 7,131 tokens. But nothing in my measurements supports "installed it, so accessibility is handled".'
  - question: 'Does it help with structured data, canonicals, and other search work?'
    answer: 'Not across the six queries I tried. "canonical link tag for duplicate pages" and "sitemap and robots.txt for a static site" returned zero results. "add JSON-LD structured data for local business" returned exactly one hit, an unrelated built-in-ai guide, at 0.357 similarity. Search and structured data are outside this corpus.'
  - question: 'Where do I declare a Baseline target?'
    answer: 'Write your browser support policy as prose in AGENTS.md or CLAUDE.md. There is no prescribed format. With nothing declared, the default is Baseline Widely available. For a year target like "Baseline 2024", a feature qualifies when its Baseline since date is on or before that year.'
  - question: 'What lands in my repo, and what about telemetry?'
    answer: 'You get 1.2 MB across 140 files under .agents/skills/modern-web-guidance/, plus a skills-lock.json at the root. Claude Code is wired up through a symlink. Telemetry is on by default and collects search queries, guide retrievals, and installs as anonymous statistics. Set DISABLE_TELEMETRY=1 to turn it off.'
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

Chrome shipped Modern Web Guidance at I/O 2026. It's a bundle of skills that pushes web platform knowledge into your coding agent, and the announcement says it helps you build web experiences that are "more accessible, performant, and secure." Installing it takes one line of `npx`.

The first thing I did after that line finished was run `list` and count the guides. 138 of them, across 15 categories. Two sit in the accessibility category. There is no category for structured data or crawlability at all.

The count isn't a flaw by itself. But there's a gap between the developer who reads those three words and installs, and where the corpus actually puts its weight. Today I measure that gap, then write down what goes where to close it.

![Horizontal bar chart counting the 138 guides in Modern Web Guidance 0.0.180 by category. ui-behaviors leads with 29, then performance 24 and visual-design 16, while accessibility has 2 and the search / structured data category has none](../../../assets/blog/modern-web-guidance-agent-skill-coverage-2026/hero.png)

## An agent skill is a scope declaration, not a feature

Let's line up the terms first. An agent skill is a bundle of instructions your coding agent opens when it hits a particular kind of task. The core of it is a single `SKILL.md`, which says when to open the bundle and what to do once it's open. The agent reads that trigger description on every task and decides for itself whether to fire. So installing a skill isn't really adding a tool. It's drawing a line around the agent's judgment.

Baseline deserves a paragraph too. Baseline is the web.dev classification for whether a web feature is stable enough to rely on across the major browsers. Two stages matter: Newly available means it has just landed in every major engine, and Widely available means enough time has passed that it's safe essentially everywhere. Any honest answer to "can I use this yet" eventually comes back to that data.

Modern Web Guidance welds the two together. Here is the definition from the [Chrome for Developers docs](https://developer.chrome.com/docs/modern-web-guidance), verbatim.

> Modern Web Guidance is a set of skills that embed web platform expertise, best practices, and browser compatibility data directly into your coding agents.

The [I/O 2026 post](https://developer.chrome.com/blog/chrome-at-io26) describes the Baseline hook. Also verbatim.

> It integrates directly with Baseline, letting you focus on what you want to build while your tools automatically figure out the right features and fallbacks to use within your chosen Baseline target.

The intent is clear and I think the direction is right. Injecting current compatibility data at the moment of work beats hand-stripping 2019-vintage CSS idioms out of model weights every single time. What matters is the shape of the map being injected. Off the map, the agent goes back to its weights. And it won't tell you that's what happened.

## What actually lands in your repo

On npm, the package first appeared on 2026-04-30 and reached 96 versions by 2026-08-03. That's a release every three days. The latest at the time I measured was 0.0.180, Apache-2.0, 36.6 MB unpacked across 198 files. Read all of this as a snapshot of an early-preview 0.0.x.

I ran the install in an empty directory.

```bash
npx modern-web-guidance@latest install
```

The installer brings up an interactive screen and detects your agents. Mine reported this.

```
✓ ./.agents/skills/modern-web-guidance
  universal: Amp, Antigravity, Antigravity CLI, Codex, Cursor +12 more
  symlinked: Claude Code
```

That's 1.2 MB and 140 files under `.agents/skills/modern-web-guidance/`, plus a `skills-lock.json` at the root. Claude Code gets a symlink. Every guide is plain Markdown, so you can open one and read it. I like that a lot. When the agent gives you an answer, you can go find the text it was reading.

The install ends with a telemetry notice. Straight from the [repository README](https://github.com/GoogleChrome/modern-web-guidance):

> Google collects anonymous usage statistics (such as search queries, guide retrievals, and installation) to improve the reliability, relevance, and performance of the tool.

Note that search queries are explicitly in scope. On an internal repo, query strings pick up project context fast. One environment variable turns it off.

```bash
export DISABLE_TELEMETRY=1
```

Worth mentioning: the installer prints third-party security assessments next to the package. My run showed Socket at 0 alerts and Snyk at Med Risk. Those are third-party scanner verdicts, not an official Google rating, and I didn't chase down the reasoning behind them. Treat them as reference values.

## Where the 138 guides pile up

The `list` command dumps every guide as JSON. Counted by category, it splits like this.

| Category | Guides |
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
| search / structured data | 0 |

The top five categories hold 98 guides, 71% of the corpus. The weight sits on making things that appear on screen.

One point of fairness. Two accessibility guides is not the total volume of accessibility content. One of those two, the umbrella `accessibility` guide, runs 7,131 tokens and is the third largest document in the whole package. Its table of contents moves through navigability and structure, semantic HTML and ARIA, accessible names, document metadata and language, keyboard and focus management, then alternate text and media. The fifteen forms guides carry label and autofill accessibility inside them too. So "only two accessibility guides" is a statement about category labels, not about substance.

The structural difference still stands, though. The UI side has twenty-nine narrow this-situation-use-this-feature guides laid out flat. Accessibility has its detail folded into one thick primer. In a system where the agent retrieves narrow answers by search, that difference shows up in the output.

Quality inside the covered territory deserves its own verdict. I opened `optimize-image-priority` in the performance category, and it's good. It does not stop at the usual "put `fetchpriority="high"` on your LCP image."

```
4. **Optimize lazy loading**: Never use `loading="lazy"` on the LCP image.
   For standard below-the-fold images, `loading="lazy"` is sufficient...
   Avoid adding `fetchpriority="low"` to these images, as you want them to
   load at normal priority once the user scrolls to them.
```

It separates ordinary below-the-fold images from images that are technically above the fold but not initially visible, like carousel slides behind the first one or a mega menu. Teams get that distinction wrong constantly, and getting it wrong costs you bandwidth contention rather than LCP. If that resolution of advice runs through a decent share of the 138, then yes, there is real territory where this tool beats the weights. The question is where that territory ends.

## Three kinds of question, one tool

So I probed it. Twenty-two queries: six on UI and CSS, ten on accessibility, six on search and structured data. For each I logged the top result's similarity and how many results came back. I wrote the queries as plain English task instructions, which is the favorable condition here, since the corpus is English.

```bash
npx modern-web-guidance@0.0.180 search "add JSON-LD structured data for local business"
```

```json
[{"id":"language-model","description":"...","category":"built-in-ai",
  "tokenCount":1984,"similarity":0.357}]
```

One hit, and it's the guide for the browser's built-in language model API. Nothing to do with structured data.

![Horizontal bar chart of top-1 similarity for 22 queries in three groups. UI and CSS queries range from 0.408 to 0.724, accessibility queries from 0.384 to 0.641, and search and structured-data queries from 0.357 to 0.506, with two of them returning no result at all](../../../assets/blog/modern-web-guidance-agent-skill-coverage-2026/query-probe.png)

By group:

| Query group | Queries | Mean top-1 similarity | Empty |
|---|---|---|---|
| UI / CSS | 6 | 0.643 | 0 |
| Accessibility | 10 | 0.508 | 0 |
| Search / structured data | 6 | 0.267 | 2 |

The UI queries land cleanly. "custom styled select dropdown" pulled `custom-select-picker-layouts` at 0.724; "view transition between pages" pulled `cross-document-transitions` at 0.703. All six found their answer inside the right category.

Accessibility queries always return something, but the aim wanders. In seven of ten, at least one accessibility-category guide appeared somewhere in the top five. The other three are the interesting ones. "associate a label with a form input" returned five forms guides about autofill and nothing else. "minimum target size for touch controls" landed on the css primer. "reflow at 400% zoom without horizontal scroll" landed on `defer-work-until-scroll-ends`, a performance guide. That last one is badly off: reflow at 400% zoom is a viewport-dimension problem, not a scroll-performance problem. [I measured that exact case and found the damage was vertical, not horizontal](/en/blog/en/reflow-1410-400-zoom-viewport-height-2026) — an answer this corpus doesn't contain anywhere.

The search group looks nothing like the other two. "canonical link tag for duplicate pages" and "sitemap and robots.txt for a static site" both returned zero results, meaning nothing cleared the tool's threshold. "render meta description and title tags" came back with an accessibility guide at 0.378, and "get cited by AI search answers" came back with the language-detection API guide at 0.362.

Now the limits. Twenty-two queries is a probe, not a benchmark. Reword a query and the similarity moves. The threshold and cutoff belong to the tool; I didn't touch them. And a miss at the top does not prove the agent writes bad code, because the umbrella guides are thick enough that the right passage sometimes lives inside a wrong-looking hit. Google's own eval in the README (July 6, 129 tasks and 1,071 assertions) reports codex_cli going from 57% to 84%, a 27-point lift, and claude_code from 52% to 87%, a 35-point lift. Those are their numbers. I did not run their suite.

What I can say from my own measurements is narrower: this corpus is strong at building the screen and silent about whether the page gets found and cited.

## Put the Baseline target in a project file

This part you can use today. The installed `SKILL.md` (package source, [GoogleChrome/modern-web-guidance](https://github.com/GoogleChrome/modern-web-guidance)) spells out how browser support gets decided. The default, verbatim:

> All guides assume <strong>Baseline Widely available</strong> features are safe to use without fallbacks.

Declare nothing and the agent treats only Widely available as unconditionally safe, attaching fallbacks to everything below that line. If your project can be more aggressive, say so. There's no required format; prose in `AGENTS.md` or `CLAUDE.md` is enough. The year-target rule is in `SKILL.md` as well: for a Baseline YYYY target, a feature qualifies when its "Baseline since" date is on or before that year.

Here's the shape I use.

```markdown
## Browser Support

Baseline target: Baseline 2024.
Newly available features are allowed when feature-detected.
Accept fallback code only if it stays under 20 lines and adds no dependency.
If it can't, change the implementation instead of writing the fallback.
```

Four lines, and the agent stops asking. The data it needs is already inside the guides: 74 of the 138 state Baseline status in the body. The image priority guide, for instance, carries this line.

```
Baseline status for Fetch priority: Newly available.
It's been Baseline since 2024-10-29.
```

I timed the calls too. The first run spent 10.7 seconds pulling the package down; once cached, three consecutive runs took 2.09s, 1.15s, and 1.22s. Since `SKILL.md` demands the agent run search first on every HTML, CSS, or client-side JS task, assume that round trip attaches to each task. The context cost is the bigger one. Search returns a `tokenCount` per guide: narrow guides run 900 to 3,000 tokens, while the umbrellas are css at 7,755, accessibility at 7,131, and performance at 5,599. Open two umbrellas and you've spent 15,000 tokens of context. That's not an argument against it. Just know the budget you're spending.

## Build a second rules layer where the corpus is empty

The behavior that matters most is what the agent does when search comes back empty. `SKILL.md` tells it to fall back to `list` and browse everything. But for a subject that isn't in the list either, the conclusion the agent reaches is "this project has no rule about that." No rule reads as freedom. Freely written JSON-LD tends to get injected client-side, canonicals go missing, and title tags get assembled somewhere inside a component.

So I ship a second rules layer alongside the skill, covering only the axes the corpus leaves alone.

```markdown
## Search & structured data (outside the skill corpus — project rules)

- Structured data ships in server-rendered HTML. Never inject it client-side.
- Every page carries a self-referencing canonical; localized pages cross-reference via hreflang.
- title and meta description come from the route definition, not assembled inside a component.
- Body text must exist in the response HTML without JS, including content inside tabs and accordions.
- Any JSON-LD change runs schema validation in CI.

## Accessibility acceptance (what automated checks won't catch)

- Judge every new overlay against WCAG 2.4.11, walking Shift+Tab in reverse as well.
- Interactive targets satisfy 2.5.8's 24x24 CSS px on both width and height.
- No two-dimensional scrolling at a 320x200 viewport (1.4.10).
- Verify all three separately, regardless of what axe reports.
```

That second block isn't arbitrary. Its items map onto exactly the queries where the aim wandered. [I once matched axe's rules against WCAG success criteria to see which criteria a scanner actually decides](/en/blog/en/act-rules-axe-coverage-wcag-sc-2026), and the lesson transfers directly: a tool won't tell you what it can't see. Someone has to write that list by hand and pin it up.

The first line of the search block isn't taste either. It's the conclusion from [measuring what really changes when LocalBusiness markup ships server-side versus getting attached with JavaScript](/en/blog/en/localbusiness-structured-data-server-side-vs-js-2026), compressed into one sentence of policy.

## A 30-minute check before you adopt it

None of this means don't install it. I did, and I plan to keep it. But five things are worth checking yourself first, and together they take about half an hour.

1. Run `npx modern-web-guidance@latest list` and count how many guides cover <strong>the work your team actually does</strong>. If a domain isn't there, drop it from your expectations up front.
2. Take five real task descriptions from your last sprint and feed them to `search` unchanged. If more than half come back under 0.5, the tool doesn't fit your team's main battlefield yet.
3. Put a Baseline target sentence in `AGENTS.md` or `CLAUDE.md`. If you skip it, make sure everyone knows the default is Widely available.
4. Write project rules for the axes the corpus omits: search and structured data, plus the accessibility criteria no scanner decides. Copy the blocks above and cut them down to your situation.
5. If sending query strings outside your org is a problem, put `DISABLE_TELEMETRY=1` in the shell profile and tell the team.

One question I still can't answer. As skills like this multiply, how should an agent handle "I searched and found nothing"? Right now it quietly returns to its weights. There are tasks where reporting the absence and stopping would be the better move, and I don't yet see how the skill format could express that difference.

Deciding what to delegate to an agent and what to hold down with rules is less a coding problem than an agreement problem. If you need someone to help write that agreement, my [contact page](/en/contact/) is open.

---

*Sources: Chrome for Developers' [Modern Web Guidance](https://developer.chrome.com/docs/modern-web-guidance), [Get started](https://developer.chrome.com/docs/modern-web-guidance/get-started), and [15 updates from Google I/O 2026](https://developer.chrome.com/blog/chrome-at-io26); the GoogleChrome/[modern-web-guidance](https://github.com/GoogleChrome/modern-web-guidance) repository README; web.dev's [Baseline](https://web.dev/baseline) (all official). The three English block quotes (the definition, the Baseline integration sentence, and the fallback default) were each checked against those documents and the installed `SKILL.md` at the time of writing, with the source linked next to the quote. Measurement environment: modern-web-guidance 0.0.180, Node 22.22, macOS, a throwaway sandbox directory, measured 2026-08-10. Raw guide list in `data/mwg-guide-list.json`, the 22 query results in `data/mwg-query-probe.json`, the probe script in `scripts/probe-modern-web-guidance.mjs`, figures generated by `scripts/chart-modern-web-guidance.py`. Twenty-two queries is a probe, not a benchmark, and results shift with query wording. The 27 to 35 point improvements in the README are Google's own published evaluation, not something I reproduced. Category counts follow the tool's own labels; I did not measure accessibility material embedded inside guides filed under other categories.*
