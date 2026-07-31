---
title: "WebMCP's Origin Trial: provideContext Is Already Gone"
description: 'WebMCP shipped as a Chrome 149 origin trial, but its API already moved: navigator.modelContext is now document.modelContext and provideContext is gone.'
pubDate: '2026-07-26'
heroImage: ../../../assets/blog/webmcp-navigator-modelcontext-origin-trial-agent-tools-2026/hero.png
tags:
  - WebMCP
  - AI-Agent
  - Chrome
  - web-development
  - security
relatedPosts:
  - slug: webmcp-chrome-146-ai-tool-server
    score: 0.82
    reason:
      ko: 저 글이 "브라우저가 툴 서버가 된다"는 개념을 소개한 2월 기록이라면, 이 글은 그 API가 오리진 트라이얼에서 실제로 어떻게 바뀌었는지를 추적한다. 같은 기술의 개념편과 배포편으로 이어 읽으면 좋다.
      ja: あちらが「ブラウザがツールサーバになる」という概念を紹介した2月の記録なら、本記事はそのAPIがオリジントライアルで実際にどう変わったかを追う。同じ技術の概念編と配備編として続けて読める。
      en: If that post introduced the concept that "the browser becomes a tool server" back in February, this one tracks how that API actually shifted once it hit the origin trial. Read them as the concept and the shipping chapters of the same technology.
      zh: 那篇是二月介绍"浏览器成为工具服务器"这一概念的记录，本文则追踪该API进入origin trial后实际发生了怎样的变化。可作为同一技术的概念篇与落地篇连读。
  - slug: mcp-vs-a2a-vs-open-responses-agent-protocol-comparison-2026
    score: 0.66
    reason:
      ko: WebMCP는 MCP를 브라우저 안으로 끌어온 것이다. 서버사이드 MCP·A2A·Open Responses가 어떻게 갈리는지 먼저 잡아두면, 브라우저판 툴 노출이 전체 프로토콜 지형에서 어디에 놓이는지 보인다.
      ja: WebMCPはMCPをブラウザの中へ持ち込んだものだ。サーバサイドのMCP・A2A・Open Responsesの違いを先に押さえておくと、ブラウザ版のツール公開がプロトコル地形のどこに座るか見えてくる。
      en: WebMCP pulls MCP into the browser. Once you have the server-side split between MCP, A2A, and Open Responses in your head, it's clearer where in-browser tool exposure sits on the protocol map.
      zh: WebMCP把MCP搬进了浏览器。先厘清服务端MCP、A2A与Open Responses的分野，就能看清浏览器端的工具暴露在整个协议版图中的位置。
  - slug: mcp-apps-interactive-ui-agent-ux
    score: 0.6
    reason:
      ko: 에이전트가 페이지의 툴을 호출하기 시작하면 UI가 곧 에이전트의 인터페이스가 된다. 인터랙티브 UI를 에이전트 UX로 다룬 저 글이 WebMCP 이후의 화면 설계 고민과 이어진다.
      ja: エージェントがページのツールを呼び始めると、UIはそのままエージェントのインターフェースになる。インタラクティブUIをエージェントUXとして扱ったあの記事が、WebMCP以後の画面設計の悩みに繋がる。
      en: Once agents start calling a page's tools, the UI effectively becomes the agent's interface. That post on interactive UI as agent UX connects to the screen-design questions WebMCP raises.
      zh: 一旦智能体开始调用页面的工具，UI就成了智能体的接口。那篇把交互式UI当作智能体UX来讨论的文章，正好接上WebMCP之后的界面设计问题。
---

Say a page carries two scripts. One is the checkout helper you wrote; the other is a third party your ad tag pulled in. Under February's draft API, the moment that second script runs one line, your tool quietly disappears.

```js
// old draft API — now removed
navigator.modelContext.provideContext({ tools: [ /* this array replaces everything */ ] });
```

`provideContext` declared the whole tool list at once: "the tools on this page are now these." Convenient on paper. But on the real web, where several scripts share one document, replace-all is just takeover. The method didn't last six months in the spec. Now that WebMCP has shipped as a Chrome 149 origin trial, the interface people were introduced to in February has already changed twice. This post walks through what changed, why, and how to write the code today, all against the official docs.

## What WebMCP is, and why look again now

WebMCP (Web Model Context Protocol) is a browser standard that lets a web page expose its own features to AI agents as callable tools. Server-side MCP wired local apps and remote servers into an agent; WebMCP moves that connection point into the browser, into the document itself. A page registers actions like "filter products" or "add to cart" as structured tools, and an agent attached to the browser calls them by their schema. The button a human used to click becomes a function the agent invokes.

The idea isn't new. The W3C Web Machine Learning Community Group first published it on February 10, 2026, led by engineers from Google and Microsoft, and around then I covered [how the browser becomes an agent's tool server](/en/blog/en/webmcp-chrome-146-ai-tool-server/) at the concept level. That was a draft. This is not. Chrome's docs now say "Join the WebMCP origin trial from Chrome 149" — you can pull an origin trial token and turn it on for a production domain. Whenever a concept becomes a real thing, the blueprint and the built result drift apart somewhere. That drift is the point of this post.

One question lingers: why does it have to be inside the browser? Server-side MCP can already hand tools to an agent. The answer is state. A login session, a cart, the filter conditions currently on screen — these only fully exist inside the browser tab. For a server tool to reach that state, you'd have to rebuild separate auth and synchronization. But when the page exposes its own tools, the agent invokes actions in the exact session the user is already logged into. No local app to install, no separate API key exchange. This "use the context that's already open" property is WebMCP's reason to exist — and, as the next section shows, the root of its security tension too.

Let me lower expectations up front. An origin trial is not a finalized standard. It can change any time, and it already has, twice. So don't memorize the code below as a settled API. Treat it as the shape at this moment, one that may move again next quarter.

## The two places the February draft and the shipped build diverged

Two things changed. One is where the API hangs; the other is how you register a tool.

| Aspect | Early draft (~February) | Current origin trial |
|---|---|---|
| Entry point | `navigator.modelContext` | `document.modelContext` (`navigator.modelContext` deprecated as of Chrome 150) |
| Registration | `provideContext({ tools })` declares the whole list | `registerTool(tool, { signal })` adds one at a time |
| Removal | `clearContext()` | `abort()` the `AbortSignal` you passed at registration |
| Name collision | provideContext clears existing tools first, then overwrites | `registerTool` throws if the name already exists |

Start with the entry point. The spec says "each Document object has an associated ModelContext," which makes `document.modelContext` canonical. But early origin-trial Chrome shipped it on `navigator.modelContext`. The current Chrome imperative-API examples use `document.modelContext`, and `navigator.modelContext` is marked deprecated in Chrome 150. So spec and implementation pointed at different places for a while, then the implementation caught up to the spec. Copy a February example verbatim and it breaks at the entry point.

The registration change matters more. `provideContext` was a replace-all model; `registerTool` is an add-one model. That difference isn't about convenience. It's a consequence of the security design.

## What registerTool actually looks like

Here's the tool you should register today, per Chrome's imperative-API docs.

```js
const controller = new AbortController();

await document.modelContext.registerTool(
  {
    name: "filter_products",
    description: "Filter the product list by category and max price.",
    inputSchema: {
      type: "object",
      properties: {
        category: { type: "string", description: "Product category" },
        maxPrice: { type: "number", minimum: 0, description: "Upper price bound" }
      },
      required: ["category"]
    },
    annotations: { readOnlyHint: true, untrustedContentHint: false },
    async execute({ category, maxPrice }) {
      // the real DOM work / state change happens here, in client JS
      applyFilter(category, maxPrice);
      return `Filtered by ${category}` + (maxPrice ? ` under ${maxPrice}` : "");
    }
  },
  { signal: controller.signal }
);

// when you no longer want this tool exposed
controller.abort();
```

Break it down. `name` identifies the tool. `description` is the natural-language cue the agent uses to decide when to call it. `inputSchema` is the input contract written as JSON Schema. `execute` is an async callback that receives the input, does the real work in client-side JavaScript, and returns a result string. `annotations` is optional but effectively mandatory in practice, for reasons I'll get to.

Watch the removal path. There's no standalone `unregisterTool` method in the docs. Instead you pass `{ signal }` as the second argument at registration, then call `controller.abort()` to tear the tool down later. If you want tools to come and go with your routing, making a fresh controller per route is the natural pattern. On the other side, the agent-facing code queries exposed tools with `getTools({ fromOrigins: [...] })` and invokes them with `executeTool(tool, '{"category":"shoes"}', { signal })`.

Forcing `inputSchema` to be JSON Schema will feel familiar if you've touched server-side MCP. Comparing [how MCP, A2A, and Open Responses each describe tools](/en/blog/en/mcp-vs-a2a-vs-open-responses-agent-protocol-comparison-2026/) gives you the context for why WebMCP insists on the same schema contract inside the browser. Same contract means an agent can handle a server tool and a page tool the same way.

Alongside this imperative approach, Chrome's docs describe a declarative one too. You expose a tool by annotating an existing HTML form with attributes like `toolname` and `tooldescription`, and the form's fields become the tool's parameters. Instead of writing `execute` in JS, you layer agent-readable hints onto markup you already have. Which one fits depends on the case. If your site already runs on server-rendered forms and links, declarative adds less code; if the action needs fine-grained client-state manipulation, imperative `registerTool` gives you the control. My guess is most real sites will mix both — read-only actions declaratively and lightly, state-changing actions imperatively with annotations attached.

## Why provideContext was removed

This is the part I most wanted to write. `provideContext` didn't go away as tidy-up refactoring. It went away over a clear security flaw.

Issue #101 in the W3C WebMCP repo framed it like this: "While the `navigator.modelContext.registerTool()` method throws an error if a tool with the same name already exists, this security mechanism is bypassed with `navigator.modelContext.provideContext()` that first clears the existing tools before registering new ones." So `registerTool` throws on a duplicate name to block overwrites, but `provideContext` wipes existing tools before registering, which defeats that guard.

The question is what happens once the guard is defeated. The issue's threat model spells it out: "a malicious or accidental third-party script can overwrite it. This could allow the third party to proxy tool calls, effectively observing the entire agent-user interaction, which may include private data." Picture an online store where first-party and third-party scripts share one page. Malicious or accidental, a third-party script that swaps your checkout tool for its own can then proxy every tool call between agent and user and watch it all. Private data included.

The proposals were to make provideContext fail on any name conflict, add a strict flag, or expose a lookup API for pre-flight checks. In the end, issue #101 was closed via PR #132, and the current implementation dropped `provideContext`/`clearContext` and converged on `registerTool`. One convenient replace-all method turned into a takeover vector in shared-script environments. I think the call was right. A browser API that says "erase everything and fill it with mine" is almost always someone's trap.

## What I verified, and what I couldn't

Let me draw the line honestly. Running the origin trial end to end with a real agent needs Chrome 149+, an origin trial token, and an agent that consumes the API. In the environment where I wrote this, I did not reproduce the browser-agent round trip. So what I verified stops at "does the tool's input contract actually hold."

Because `inputSchema` is JSON Schema, the arguments an agent sends get validated against it. So I compiled the schema from the example above with Ajv in Node and ran a few argument sets through it.

```
{"category":"shoes","maxPrice":120} => PASS
{"maxPrice":120}                     => FAIL ["must have required property 'category'"]
{"category":"shoes","maxPrice":-5}   => FAIL ["must be >= 0"]
description length: 50 (within 500 budget)
```

Drop the `required` `category` and it's rejected; break `minimum: 0` with a negative and it's rejected. Obvious enough, but running it makes one thing plain: you re-defend input inside `execute` less, but a loose schema means loose validation by exactly that much. Leave `minimum` off `maxPrice` and a negative price flows straight into `execute`. The schema is the defense line.

I'll be clear on the limit too. This checks the schema contract, not the browser round trip. Whether a real agent reads the description and picks this tool correctly, or confuses it with others, is a separate question, and that you only learn by re-measuring on a live site with the origin trial enabled.

## What to do now

To sum up: WebMCP is no longer a "someday" — it's a "you can turn it on today" origin-trial technology. But the API is still moving, and the direction of that movement is consistently security. Here's the checklist for anyone touching it now.

- **Entry point is `document.modelContext`.** February's `navigator.modelContext` is deprecated in Chrome 150. If you copied old code, fix this first.
- **Design tools as individual register / individual teardown.** `registerTool` plus `AbortSignal` is canonical. Drop the replace-all mindset.
- **Keep names unique; take collisions as errors.** `registerTool` throws on a duplicate name. Don't route around it — namespace with a prefix.
- **Always annotate.** `untrustedContentHint` for tools handling user-generated or externally sourced data; `readOnlyHint` for read-only tools that don't change state. Chrome's security docs recommend it explicitly.
- **Make origin your trust boundary.** The docs are blunt: "Only expose your tools to origins that you trust." Especially for tools that touch user data.
- **Respect the character budgets.** 500 characters for a tool description, 150 for a parameter description, 1.5K per tool output.

One last line, straight from Chrome's own docs on its limits: "it's impossible to guarantee safety inside of a large language model (LLM)." Design your tools well and the safety inside the LLM is still not guaranteed. WebMCP's security annotations and origin limits reduce risk; they don't remove it. Designing with that premise, versus forgetting it and trusting "the standard will block it for me," is a large gap.

If you're designing site tools for agents to call, or checking the security boundary of WebMCP exposure on a page with third-party scripts mixed in, I take consulting and implementation work personally. Reach out through the contact link on my profile.
