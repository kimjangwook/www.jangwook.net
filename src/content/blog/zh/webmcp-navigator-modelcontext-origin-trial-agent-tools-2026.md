---
title: 'WebMCP进入origin trial——provideContext为何半年就消失了'
description: WebMCP以Chrome 149的origin trial正式落地，但二月介绍的那套API已经变了。navigator.modelContext迁到了document.modelContext，provideContext因安全问题被移除。本文以官方文档与规范Issue为依据，梳理现在该注册的工具形态与安全注解。
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

假设一个页面里有两段脚本。一段是你自己放的结算助手，另一段是广告标签引进来的第三方。按二月草案的API，第二段脚本执行下面这一行的瞬间，你的工具就会悄无声息地消失。

```js
// 旧草案API——现已移除
navigator.modelContext.provideContext({ tools: [ /* 这个数组会覆盖全部 */ ] });
```

`provideContext`是一次性声明整张工具清单的方式：“本页的工具从现在起就是这些。”看着省事。可在多段脚本共享同一个文档的真实网页里，覆盖就等于劫持。这个方法没撑过半年就被踢出了规范。随着WebMCP以Chrome 149的origin trial正式落地，二月里被介绍的那套接口，已经改了两次。本文就把改了什么、为什么改、以及现在该怎么写代码，按官方文档梳理一遍。

## WebMCP是什么，为什么现在要重看

WebMCP(Web Model Context Protocol)是一项浏览器标准，让网页把自身功能作为“可调用的工具”暴露给AI智能体。服务端MCP把本地应用和远程服务器接入智能体，而WebMCP把这个连接点搬进浏览器、搬进文档本身。页面把“筛选商品”“加入购物车”这类动作注册成结构化工具，接在浏览器上的智能体就按schema来调用。原本由人点击的按钮，变成了智能体像调函数一样调用的对象。

这个想法本身不新。W3C Web Machine Learning Community Group在2026年2月10日以Google和Microsoft的工程师为主首次公开，我当时也从概念层面写过一篇[浏览器如何成为智能体工具服务器](/zh/blog/zh/webmcp-chrome-146-ai-tool-server/)。那时是草案，现在不是了。Chrome官方文档明确写着“Join the WebMCP origin trial from Chrome 149”，已经进到可以领取origin trial令牌、在生产域名上开启的阶段。概念变成实物，总会在某处出现设计图和施工结果对不上的地方。这道错位正是本文的核心。

还有一个问题：为什么非得在浏览器里？服务端MCP本就能把工具交给智能体。答案在状态。登录会话、购物车、此刻屏幕上的筛选条件——这些只有在浏览器标签页里才完整成立。服务端工具要够到这些状态，就得另起一套认证与同步。而页面直接暴露自己的工具时，智能体就在用户已经登录的那个会话里调用动作，不必安装本地应用，也不必另换API密钥。这种"直接沿用已经打开的上下文"正是WebMCP存在的理由，同时也是下一节要看的安全张力的根源。

先把预期压下来。origin trial不是正式标准，随时可能变，而且已经变了两次。所以别把下面的代码当作“定型API”去背，把它当成“此刻的形态、下个季度还可能再动的东西”来看更稳妥。

## 二月草案与现行落地版分岔的两处

变动主要有两处。一处是API挂载的位置，另一处是注册工具的方式。

| 项目 | 早期草案(约二月) | 现行origin trial |
|---|---|---|
| 入口 | `navigator.modelContext` | `document.modelContext`(自Chrome 150起`navigator.modelContext`废弃) |
| 工具注册 | `provideContext({ tools })`整张清单一次声明 | `registerTool(tool, { signal })`逐个添加 |
| 工具移除 | `clearContext()` | 对注册时传入的`AbortSignal`调用`abort()` |
| 命名冲突 | provideContext先清空既有工具再覆盖 | 同名已存在时`registerTool`抛错 |

先说入口的迁移。规范文档写的是“each Document object has an associated ModelContext”，因此`document.modelContext`才是正本。可origin trial早期的Chrome是挂在`navigator.modelContext`上发出去的。现在Chrome开发者文档的命令式API示例用的是`document.modelContext`，而`navigator.modelContext`在Chrome 150被标为废弃。也就是说，规范和实现一度指向不同位置，随后实现向规范靠拢，这是一个过渡期。要是把二月的示例原样复制粘贴，在如今的Chrome里从入口就对不上。

注册方式的变化更要紧。`provideContext`是“整体替换”模型，`registerTool`是“逐个添加”模型。这个差别不是便利与否的问题，而是安全设计的结果。

## registerTool的实际形态

现在该注册的工具长这样，依据是Chrome命令式API文档。

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
      // 真正的DOM操作、状态变更在这里，用客户端JS完成
      applyFilter(category, maxPrice);
      return `Filtered by ${category}` + (maxPrice ? ` under ${maxPrice}` : "");
    }
  },
  { signal: controller.signal }
);

// 不想再暴露这个工具时
controller.abort();
```

拆开看。`name`是工具标识，`description`是智能体判断何时调用这个工具的自然语言说明，`inputSchema`是用JSON Schema写的输入契约。`execute`是异步回调，接收输入、用客户端JavaScript执行真正的动作、返回结果字符串。`annotations`可选，但实务上几乎是必填，原因下一节讲。

值得留意的是移除工具的做法。文档里看不到独立的`unregisterTool`方法。取而代之，注册时把`{ signal }`作为第二个参数传入，之后调用`controller.abort()`把工具撤下。如果想让工具随路由出入，为每条路由新建一个控制器来管理是自然的写法。另一侧，面向智能体的代码用`getTools({ fromOrigins: [...] })`查询已暴露的工具，用`executeTool(tool, '{"category":"shoes"}', { signal })`调用。

强制`inputSchema`为JSON Schema这一点，碰过服务端MCP的人会觉得眼熟。把[MCP、A2A、Open Responses各自如何描述工具](/zh/blog/zh/mcp-vs-a2a-vs-open-responses-agent-protocol-comparison-2026/)对比一遍，就能理解WebMCP为什么非要在浏览器里也要求同一套schema契约。契约相同，智能体才能用同样的流程处理服务端工具和页面工具。

除了这套命令式(imperative)方式，Chrome文档还一并介绍了声明式(declarative)方式：给现有的HTML表单加上`toolname`、`tooldescription`之类的属性，就能把它暴露成工具，表单的字段直接成为工具的参数。不必用JS写`execute`，而是在已有的标记上叠加智能体可读的提示。哪种更合适看情况。若你的站点本就靠服务端渲染的表单和链接运转，声明式增加的代码更少；若这个动作需要精细操作客户端状态，命令式`registerTool`给你控制力。我的判断是大多数实站会两者混用——只读动作用声明式轻量处理，改状态的动作用命令式并附上注解。

## provideContext为何被移除

这是本文最想讲的一段。`provideContext`的消失不是为整洁而做的重构，而是因为一个明确的安全缺陷。

W3C WebMCP仓库的Issue #101这样描述问题：“While the `navigator.modelContext.registerTool()` method throws an error if a tool with the same name already exists, this security mechanism is bypassed with `navigator.modelContext.provideContext()` that first clears the existing tools before registering new ones.”也就是说，`registerTool`在同名工具已存在时会抛错以阻止覆盖，而`provideContext`在注册前先把既有工具全部清空，于是那道防护被绕过了。

问题在于，这道防护被绕过之后会发生什么。Issue的威胁模型写得很清楚：“a malicious or accidental third-party script can overwrite it. This could allow the third party to proxy tool calls, effectively observing the entire agent-user interaction, which may include private data.”想象一个在线商店，首方和第三方脚本混在同一页面里。无论是恶意还是失误，第三方脚本把你的结算工具替换成它自己的，那么这个第三方就能中转智能体与用户之间的每一次工具调用并全程窥视，其中夹着个人数据。

提出的解法有三条：让provideContext在任何命名冲突时失败、加一个strict开关、或暴露一个供预检的查询API。最终Issue #101通过PR #132关闭，现行实现拿掉了`provideContext`/`clearContext`，收敛到以`registerTool`为中心。一个“整体替换”的便利方法，在共享脚本环境里就成了劫持通道。我认为这个决定是对的。浏览器API里“把现有的全清掉、用我的填满”这种动作，几乎总会变成某人的陷阱。

## 我验证了什么，又没能验证什么

老实划条线。要用真实智能体把origin trial跑通，需要Chrome 149以上、origin trial令牌，以及一个消费这套API的智能体。在我写这篇文章的环境里，并没有复现浏览器与智能体的往返。所以我验证的范围止于“工具的输入契约是否真的成立”。

既然`inputSchema`是JSON Schema，智能体发来的参数就会按这套schema校验。于是我把上面示例里的schema用Node的Ajv编译，跑了几组参数。

```
{"category":"shoes","maxPrice":120} => PASS
{"maxPrice":120}                     => FAIL ["must have required property 'category'"]
{"category":"shoes","maxPrice":-5}   => FAIL ["must be >= 0"]
description length: 50 (within 500 budget)
```

漏掉写进`required`的`category`会被拦，违反`minimum: 0`的负数也会被拦。看着理所当然，但真跑一遍就清楚了一件事：你在`execute`回调里重复防御输入的必要性下降了，可schema写得松，校验就松那么多。要是没给`maxPrice`加`minimum`，负价格会直接流进`execute`。schema本身就是防线。

限度也说明白。这只验证了schema契约，不是浏览器往返。真实智能体是否看着description正确选中这个工具、会不会在多个工具间混淆，是另一个问题，那得在开启origin trial的实站上重新测量才知道。

## 现在，开发者该做的

总结一下：WebMCP不再是“某一天”，而是处于origin trial阶段、“今天就能开启来试”的技术。但API还在动，而且动的方向始终是“安全”。给马上要动手的人一份清单收尾。

- **入口用`document.modelContext`。** 二月示例里的`navigator.modelContext`在Chrome 150已废弃。复制了旧代码就先改这里。
- **工具按逐个注册、逐个撤下来设计。** `registerTool`加`AbortSignal`是正本，丢掉“整体替换”的思路。
- **名字保持唯一，冲突以抛错接住。** `registerTool`对重名抛错。别绕过它，用前缀做命名空间管理。
- **务必加注解。** 处理用户生成或外部流入数据的工具加`untrustedContentHint`，不改状态的只读工具加`readOnlyHint`。这是Chrome安全文档的明确建议。
- **把origin当作信任边界。** 文档说得很直白：“Only expose your tools to origins that you trust。”尤其是触碰用户数据的工具。
- **守住字符预算。** 工具说明500字、参数说明150字、工具输出1.5K是推荐值。

最后引一句Chrome文档自己承认的限度：“it's impossible to guarantee safety inside of a large language model (LLM)。”工具设计得再好，LLM内部的安全依旧无法保证。WebMCP的安全注解与origin限制是把风险减小的装置，不是消除它的装置。带着这个前提去设计，和忘掉它、相信“标准会替我拦住”，两者差距很大。

如果你要为智能体设计可调用的站点工具，或想在混有第三方脚本的页面上检查WebMCP暴露的安全边界，我个人接受咨询与实现委托。通过我资料页的联系方式找我即可。
