---
title: "A wrong accessible name breaks voice control and AI agents"
description: >-
  aria-label can make the accessibility tree announce a word no one sees. A reproduced WCAG 2.5.3
  Label in Name failure, with Agentic Browsing going 0 to 100.
pubDate: '2026-07-10'
heroImage: ../../../assets/blog/accessible-name-agents-2026/hero.png
tags:
  - a11y
  - wcag
  - accessibility
  - geo
  - web-development
relatedPosts:
  - slug: a11y-lighthouse-audit-fix-2026
    score: 0.82
    reason:
      ko: "Lighthouse로 접근성 위반을 잡아 고치는 전체 흐름이 궁금하다면 이 글이 출발점이다. 여기서는 그중 accessible name 하나만 깊게 판다."
      ja: "Lighthouseでアクセシビリティ違反を捕まえて直す全体像はこの記事が出発点。本稿はそのうちaccessible nameだけを深掘りする。"
      en: "For the full flow of catching and fixing a11y violations with Lighthouse, start there; this post drills into just the accessible name."
      zh: "想了解用Lighthouse抓取并修复无障碍问题的完整流程，那篇是起点；本文只深入讲accessible name这一项。"
  - slug: axe-core-ci-a11y-jsdom-vs-browser-2026
    score: 0.8
    reason:
      ko: "여기서 손으로 확인한 접근성 트리 검사를, CI에서 axe-core로 자동화하려면 브라우저 실행 여부가 결과를 가른다는 걸 다룬 글이다."
      ja: "本稿で手動確認したアクセシビリティツリー検査を、CIでaxe-coreに自動化する際、ブラウザ実行の有無が結果を分ける話。"
      en: "This checks the accessibility tree by hand; that post shows why running axe-core in a real browser vs jsdom changes the result in CI."
      zh: "本文手动检查无障碍树；那篇讲在CI里用axe-core时，跑真实浏览器还是jsdom会左右结果。"
  - slug: ai-crawlers-dont-render-javascript-csr-2026
    score: 0.74
    reason:
      ko: "AI 크롤러가 raw HTML만 읽는다는 그 글과 짝이 된다. 크롤러는 텍스트를, 에이전트는 접근성 트리를 읽는다 — 둘 다 서버가 내보낸 마크업이 전부다."
      ja: "AIクローラーがraw HTMLしか読まないという記事と対になる。クローラーはテキストを、エージェントはアクセシビリティツリーを読む。"
      en: "A companion to the post on AI crawlers reading only raw HTML: crawlers read text, agents read the accessibility tree — both live off your markup."
      zh: "与「AI爬虫只读raw HTML」那篇互为一对：爬虫读文本，智能体读无障碍树，两者都只吃你输出的标记。"
  - slug: localbusiness-structured-data-server-side-vs-js-2026
    score: 0.68
    reason:
      ko: "접근성 이름을 서버가 확실히 내보내야 하듯, LocalBusiness 구조화 데이터도 JS가 아니라 서버 응답에 있어야 한다는 걸 실측한 글이다."
      ja: "アクセシブルネームをサーバーで確実に出すのと同じく、LocalBusiness構造化データもJSではなくサーバー応答に載せるべきだと実測した記事。"
      en: "Just as accessible names must ship from the server, this post measures why LocalBusiness structured data belongs in the server response, not JS."
      zh: "正如无障碍名称要从服务端稳稳输出，这篇实测了LocalBusiness结构化数据也该放在服务器响应里，而不是靠JS注入。"
---

I put `aria-label="Submit order"` on a button. Good intentions. The screen only says "Send," so I wanted screen reader users to hear something friendlier, like "Submit order." Then I opened that button's accessibility tree:

```text
button "Submit order"
```

The visible text is "Send." The name the machine reads is "Submit order." They don't match. And that single mismatch means a voice-control user who says "click Send" gets nothing. Anyone who's touched web accessibility knows this part. What's new is the third victim. I ran Lighthouse 13.3.0 and found an unfamiliar category on the scorecard, `Agentic Browsing`, where my icon button scored a flat <strong>zero</strong>. The accessibility tree is now the interface an AI agent reads.

So I didn't leave it as talk. I reproduced it in a sandbox: six ordinary buttons, each marked up a little differently, then I read the accessibility tree and measured the Accessibility and Agentic Browsing scores side by side. Every log and number below is real output from that run.

## What an accessible name is, and why three consumers break at once

Foundation first. The <strong>accessible name</strong> is what a machine calls a UI element. Interactive elements like buttons, links, and inputs each get one computed name. The rules come from a separate W3C standard, the [Accessible Name and Description Computation](https://www.w3.org/TR/accname-1.2/). Roughly, the precedence is:

1. Text of the element referenced by `aria-labelledby`
2. The `aria-label` value
3. The element's native name source (a `<label for>`, an image `alt`, the text inside a button, and so on)
4. The `title` attribute, as a last resort

The thing to internalize: <strong>higher entries override lower ones</strong>. Add `aria-label` and the visible text inside the button drops out of the name computation entirely. That was the trap up top. A well-meaning `aria-label` erased the on-screen "Send."

Those names, gathered together, form the <strong>accessibility tree</strong>. The browser doesn't hand off the DOM as-is. It strips the visual layer and builds a separate tree of roles, names, and states for assistive technology. And here's the fact that changes the stakes: three different consumers now read that tree.

- <strong>Screen readers.</strong> The name a blind user hears is the name in this tree.
- <strong>Voice control.</strong> When a user says "click OK," the software looks for a control whose accessible name is "OK."
- <strong>AI agents.</strong> An agent operating a page inside the browser reads this tree, not pixels, to build its list of "things I can click."

So when markup produces the wrong name, all three break together. To me that's the signal that accessibility crossed over from a kindness into a functional requirement. It used to be "for screen reader users." Now it's also "because the voice interface and the AI agent can't press this button." Same work, more reasons to do it.

I've written before about how [AI crawlers don't run your JavaScript and read only raw HTML](/en/blog/en/ai-crawlers-dont-render-javascript-csr-2026). Agents go one step further. Where a crawler scrapes text, an agent picks the "clickable controls" out of the tree and actually tries to operate them. Either way, the markup your server ships is all they get.

## Same button, different name — I opened the tree myself

Enough theory. I built one static HTML page in a throwaway sandbox and deliberately marked up six common controls in different ways, then snapshotted Chrome's accessibility tree. Here's the actual output:

```text
button "Submit order"          ← visible text is "Send" (mismatch)
button "Send order to warehouse"  ← contains visible "Send order" (pass)
button                         ← icon-only button, no name
button "Send message"          ← icon button with a name (pass)
StaticText "Delete"            ← a div styled as a button: not a control at all
textbox "Search"               ← name pulled from placeholder (fragile)
```

Read it line by line and you'll recognize mistakes you hit every week.

The <strong>first line</strong> is the Label in Name violation from the intro. `aria-label` overrode the visible text, so what you see and what gets read split apart.

The <strong>third line</strong> has an empty name. It's an icon-only button; the SVG carries `aria-hidden="true"` as decoration, which leaves the button with no name source at all. A screen reader just announces "button." Which button? Nobody knows.

The most striking one is the <strong>fifth line</strong>. A delete button built as `<div class="btn">Delete</div>` shows up in the tree as `StaticText`, not `button`. It <strong>does not exist as a control</strong>. It looks like a button, but to a screen reader, to voice control, and to an AI agent, it's a scrap of text. It takes no keyboard focus. Only someone with a mouse can press this delete button.

The sixth line, `textbox "Search"`, looks like a pass but it's a trap. The name came from `placeholder`. A placeholder is not a label. It disappears the moment you type, and some assistive tech won't accept it as a name. A search field with no visible label becomes, from an accessibility standpoint, indistinguishable from an unnamed input.

Why do these six lines matter? Because the browser's Accessibility panel and the tree snapshot show you the <strong>actual name, not a score</strong>. That's exactly why a Lighthouse 100 shouldn't put you at ease. A score summarizes pass/fail; "what this button is literally announced as" only comes from reading the tree.

## WCAG 2.5.3 Label in Name — when aria-label covers the visible text

The mismatch on line one isn't a hunch; it's a documented failure. W3C's [Understanding SC 2.5.3: Label in Name](https://www.w3.org/WAI/WCAG22/Understanding/label-in-name) puts it at <strong>Level A</strong>, the most basic tier. The official wording:

> To meet 2.5.3, the text string that makes up the visible label must occur, <strong>in its entirety</strong>, within the accessible name.

The reason W3C gives is concrete. Speech-input users operate controls by speaking the text they see. To press a button labeled "Send," they say "Send" — but if the accessible name is "Submit order," the software fails to match. The very word they read and spoke isn't in the name.

Let me correct a common misconception. `aria-label` is not a tool for adding "a friendlier description." It's a command that <strong>replaces</strong> the name outright. So if a control already has visible text, the safe move is not to slap an `aria-label` on it. If you genuinely need to extend it, do what W3C recommends: <strong>lead with the visible label</strong>, then append. Line two, "Send order to warehouse," is that pattern — it carries the visible "Send order" verbatim, so it passes 2.5.3.

In practice, the biggest source of this violation I see is the icon-plus-text button. A design system component takes `aria-label` as a prop, and a developer feeds it wording that differs from the visible text. Or the label and the aria-label live in separate translation files and only one gets updated. Your eyes will never catch it. You have to open the tree or run an automated check.

## Lighthouse now scores Agentic Browsing

Here's the genuinely surprising part of the run. On the same page, Lighthouse 13.3.0 showed a brand-new category next to the familiar Accessibility one: `Agentic Browsing`. The audit inside it is `agent-accessibility-tree`, and its description reads:

> A well-formed accessibility tree helps AI agents to navigate and interact with the page.

Google's Lighthouse team turned "accessibility tree = the AI agent's interface" into an audit. The thing I was about to argue in this post, the tool was already scoring. Here's the broken page next to the fixed one:

| Category | Broken | Fixed |
|---|---|---|
| Accessibility | 90 | 100 |
| Agentic Browsing | 0 | 100 |
| SEO | 75 | 100 |
| Best Practices | 100 | 100 |

![The fixed sandbox page — every control has a name and the div is now a real button](../../../assets/blog/accessible-name-agents-2026/fixed-page.png)

Accessibility moved a modest ten points, 90 to 100. Agentic Browsing jumped from <strong>0 to 100</strong>. The automated check flagged three accessibility failures:

- `label-content-name-mismatch` — the 2.5.3 violation on line one. It named `<button aria-label="Submit order">` as the failing node, exactly.
- `button-name` — the unnamed icon button.
- `landmark-one-main` — no `<main>` landmark.

What I did in the fixed version was nothing clever. I changed the `aria-label` to wording that contains the visible text, gave the icon button a name, turned `<div class="btn">` into a real `<button>`, tied the input to a `<label for>`, and wrapped the body in `<main>`. A few lines of markup. But those few lines open the page to all three consumers. I've written up the [full flow of catching and fixing a11y violations with Lighthouse](/en/blog/en/a11y-lighthouse-audit-fix-2026) separately, so here I'm staying on the one name.

Honestly, I'm both glad and cautious about this Agentic Browsing category. Glad because the claim "get accessibility right and you're set up for the AI era too" finally has a tool behind it. The cautious part comes next.

## Honest limits — 100 is not "accessible"

The most important caveat first. <strong>A Lighthouse accessibility 100 is not proof the page is accessible.</strong> axe and Lighthouse say this themselves in their docs. Automated checks catch only rule-detectable violations. Whether the flow actually makes sense through a screen reader, whether focus order is sane, whether a name reads correctly <strong>in context</strong> — a person still has to verify that. A 100 means you cleared the floor, not that you touched the ceiling.

Second, the Agentic Browsing category is <strong>new and experimental</strong>. Its scoring method and weights can change freely. So don't read the score as a guarantee that AI agents will operate your page. It's one signal. Any specific number tied to this category should be treated as a <strong>reference figure, not an official guarantee</strong>.

Third, fixing accessible names does not guarantee better search rankings or AI citations. No such guarantee exists anywhere. Accessibility isn't a trick for buying rank; it's the foundation that lets users and agents who've already arrived (or are trying to act) actually use the page. The moment you sell it as rank points, it stops being accessibility and becomes a slogan.

Fourth, for a case like line six, where a placeholder acts as the name, Lighthouse can show it as a pass. But as noted, a placeholder is not a label and assistive tech handles it inconsistently. It's another reminder that "the tool passed it" is not "it's safe." That gap between automated checks and real accessibility bites in CI too, which is the same thread as [why running axe-core in a real browser vs jsdom changes the result](/en/blog/en/axe-core-ci-a11y-jsdom-vs-browser-2026).

## A checklist you can apply today

Enough talk; here's what changes in the code. The mistakes that wreck an accessible name come down to a handful.

<strong>1. If there's visible text, don't cover it with aria-label.</strong> If you must extend, lead with the visible label.

```html
<!-- Avoid: visible text and name diverge (2.5.3 violation) -->
<button aria-label="Submit order">Send</button>

<!-- Do: no explicit name needed; the button text is the name -->
<button type="button">Send order</button>

<!-- If you must extend, put the visible label first -->
<button aria-label="Send order to warehouse">Send order</button>
```

<strong>2. Icon-only controls always need a name.</strong> Hide the decorative SVG with `aria-hidden` and put the name on the button.

```html
<button aria-label="Send message">
  <svg aria-hidden="true" viewBox="0 0 24 24"><path d="…" /></svg>
</button>
```

<strong>3. Don't put onclick on a div/span — use a real button/a.</strong> This is the single biggest reason a control vanishes from the tree. Keyboard focus, Enter/Space behavior, and the role all come for free.

<strong>4. Tie inputs to a `<label for>`.</strong> A placeholder is not a label.

```html
<label for="q">Search</label>
<input id="q" type="text">
```

<strong>5. Add landmarks.</strong> Wrap the body in `<main>`. Screen reader users and agents both scan the page by this structure.

<strong>6. Check the tree, not the score.</strong> In Chrome DevTools' Accessibility panel, read each control's computed name directly. Comparing what you see on screen against what actually gets read — that 30 seconds tells you more than a Lighthouse 100.

None of these six is fancy. But get one wrong and screen reader users, voice-control users, and now AI agents all stall at the same button. Web development in the AI era doesn't mean suddenly learning something new. An old accessibility principle just got heavier because it picked up one more consumer.

If you want structured data shipped reliably server-side, or an existing site's accessibility tree and GEO/AIO posture checked, I take on consulting and implementation work personally — reach me through the contact link on my profile. I'd rather look at whether a single button reads correctly for all three consumers than at a flashy rebrand.
