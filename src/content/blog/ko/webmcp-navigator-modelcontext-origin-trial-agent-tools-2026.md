---
title: 'WebMCP가 오리진 트라이얼에 들어왔다 — provideContext는 왜 반년 만에 사라졌나'
description: WebMCP가 Chrome 149 오리진 트라이얼로 배포됐지만 2월 API는 이미 바뀌었다. navigator.modelContext는 document.modelContext로 옮겨졌고 provideContext는 보안 문제로 사라졌다. 지금 등록해야 할 툴 형태를 정리했다.
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

같은 페이지에 스크립트 두 개가 있다고 하자. 하나는 내가 붙인 결제 도우미, 다른 하나는 광고 태그가 끌어온 서드파티다. 2월 초안의 API대로라면 두 번째 스크립트가 이 한 줄을 실행하는 순간 내 툴은 조용히 사라진다.

```js
// 옛 초안 API — 지금은 제거됨
navigator.modelContext.provideContext({ tools: [ /* 이 배열이 전부를 덮어쓴다 */ ] });
```

`provideContext`는 "이 페이지의 툴 목록은 이제 이것"이라고 통째로 선언하는 방식이었다. 편해 보이지만, 여러 스크립트가 한 문서를 공유하는 실제 웹에서는 덮어쓰기가 곧 탈취다. 이 메서드는 반년을 못 버티고 스펙에서 빠졌다. WebMCP가 Chrome 149 오리진 트라이얼로 실제 배포되면서, 2월에 소개되던 인터페이스는 이미 두 번 바뀌었다. 이 글은 무엇이 어떻게 바뀌었는지, 그리고 지금 코드를 어떻게 짜야 하는지를 공식 문서 기준으로 정리한 기록이다.

## WebMCP가 무엇이고 왜 지금 다시 보는가

WebMCP(Web Model Context Protocol)는 웹페이지가 자기 기능을 AI 에이전트에게 "호출 가능한 툴"로 노출하는 브라우저 표준이다. 서버사이드 MCP가 로컬 앱이나 원격 서버를 에이전트에 연결했다면, WebMCP는 그 연결점을 브라우저 안, 문서 그 자체로 옮긴다. 페이지가 "상품 필터", "장바구니 담기" 같은 동작을 구조화된 툴로 등록하면, 브라우저에 붙은 에이전트가 그 툴을 스키마대로 호출한다. 사람이 클릭하던 버튼을 에이전트가 함수처럼 부르는 셈이다.

이 아이디어 자체는 새롭지 않다. W3C Web Machine Learning Community Group이 2026년 2월 10일 Google·Microsoft 엔지니어를 중심으로 처음 공개했고, 나도 그 무렵 [브라우저가 에이전트의 툴 서버가 되는 구조](/ko/blog/ko/webmcp-chrome-146-ai-tool-server/)를 개념 중심으로 한 번 다뤘다. 그때는 초안이었다. 지금은 다르다. Chrome 공식 문서는 "Join the WebMCP origin trial from Chrome 149"라고 명시하며, 실제 오리진 트라이얼 토큰을 받아 프로덕션 도메인에서 켜볼 수 있는 단계로 넘어왔다. 개념이 실물이 되면 늘 그렇듯, 설계도와 시공 결과가 어긋나는 지점이 생긴다. 그 어긋남이 이 글의 핵심이다.

왜 브라우저 안이어야 하는가라는 질문이 남는다. 서버사이드 MCP만으로도 에이전트에 툴을 줄 수 있기 때문이다. 답은 상태에 있다. 로그인 세션, 장바구니, 화면에 지금 떠 있는 필터 조건 같은 것들은 브라우저 탭 안에서만 온전하다. 서버 툴이 그 상태에 닿으려면 별도의 인증과 동기화를 다시 쌓아야 한다. 반면 페이지가 자기 툴을 직접 노출하면, 에이전트는 사용자가 이미 로그인한 그 세션 그대로 동작을 부른다. 로컬 앱 설치도, 별도 API 키 교환도 없다. 이 "이미 열려 있는 맥락을 그대로 쓴다"는 점이 WebMCP의 존재 이유이자, 동시에 다음 절에서 볼 보안 긴장의 근원이다.

여기서 미리 기대치를 깎아둔다. 오리진 트라이얼은 정식 표준이 아니다. 언제든 바뀔 수 있고, 실제로 이미 두 번 바뀌었다. 그러니 아래 코드를 "확정된 API"로 외우지 말고, "지금 이 시점의 형태이며 다음 분기에 또 움직일 수 있는 것"으로 받아들이는 편이 안전하다.

## 2월 초안과 지금 배포판이 갈린 두 지점

바뀐 곳은 크게 둘이다. 하나는 API가 매달린 자리, 다른 하나는 툴을 등록하는 방식이다.

| 항목 | 초기 초안(2월경) | 현재 오리진 트라이얼 |
|---|---|---|
| 진입점 | `navigator.modelContext` | `document.modelContext` (Chrome 150부터 `navigator.modelContext`는 deprecated) |
| 툴 등록 | `provideContext({ tools })`로 목록 통째 선언 | `registerTool(tool, { signal })`로 하나씩 추가 |
| 툴 제거 | `clearContext()` | 등록 시 넘긴 `AbortSignal`을 `abort()` |
| 이름 충돌 | provideContext가 기존 툴을 먼저 비우고 덮어씀 | 같은 이름이 이미 있으면 `registerTool`이 에러를 던짐 |

진입점 이동부터 짚자. 스펙 문서는 "each Document object has an associated ModelContext"라고 적고 있어 `document.modelContext`가 정본이다. 그런데 오리진 트라이얼 초기 Chrome은 `navigator.modelContext`로 실어 보냈다. 지금 Chrome 개발자 문서의 명령형 API 예제는 `document.modelContext`를 쓰고, `navigator.modelContext`는 Chrome 150에서 deprecated로 표시됐다. 즉 스펙과 구현이 한동안 다른 자리를 가리키다가, 구현이 스펙 쪽으로 따라온 과도기다. 2월 초안 예제를 그대로 복사해 붙였다면 지금 Chrome에서는 진입점부터 어긋난다.

등록 방식의 변화가 더 중요하다. `provideContext`는 "전체 교체" 모델이었고, `registerTool`은 "개별 추가" 모델이다. 이 차이는 편의성 문제가 아니라 보안 설계의 결과다.

## registerTool의 실제 형태

지금 등록해야 할 툴은 이렇게 생겼다. Chrome 명령형 API 문서 기준이다.

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
      // 실제 DOM 조작·상태 변경은 여기서, 클라이언트 JS로
      applyFilter(category, maxPrice);
      return `Filtered by ${category}` + (maxPrice ? ` under ${maxPrice}` : "");
    }
  },
  { signal: controller.signal }
);

// 이 툴을 더 노출하고 싶지 않을 때
controller.abort();
```

구성 요소를 뜯어보면 이렇다. `name`은 툴 식별자, `description`은 에이전트가 언제 이 툴을 부를지 판단하는 자연어 설명, `inputSchema`는 JSON Schema로 쓴 입력 계약이다. `execute`는 비동기 콜백으로, 입력을 받아 실제 동작을 클라이언트 JavaScript로 수행하고 결과 문자열을 돌려준다. `annotations`는 선택이지만 실무에서는 사실상 필수인데, 이유는 다음 절에서 다룬다.

눈여겨볼 대목은 툴 제거 방식이다. 별도의 `unregisterTool` 메서드가 문서에 보이지 않는다. 대신 등록할 때 두 번째 인자로 `{ signal }`을 넘기고, 나중에 `controller.abort()`를 호출해 걷어낸다. 페이지 라우팅에 따라 툴을 켜고 끄려면 각 라우트에서 컨트롤러를 새로 만들어 관리하는 패턴이 자연스럽다. 반대편에서 에이전트 쪽 코드는 `getTools({ fromOrigins: [...] })`로 노출된 툴을 조회하고 `executeTool(tool, '{"category":"shoes"}', { signal })`로 호출한다.

`inputSchema`를 JSON Schema로 강제한다는 점은 서버사이드 MCP를 다뤄본 사람에게 익숙할 것이다. [MCP·A2A·Open Responses가 각자 어떻게 툴을 기술하는지](/ko/blog/ko/mcp-vs-a2a-vs-open-responses-agent-protocol-comparison-2026/) 비교해두면, WebMCP가 왜 굳이 브라우저 안에서 같은 스키마 계약을 요구하는지 맥락이 잡힌다. 계약이 같아야 에이전트가 서버 툴이든 페이지 툴이든 동일한 방식으로 다룰 수 있다.

Chrome 문서는 이 명령형(imperative) 방식 외에 선언형(declarative) 방식도 함께 소개한다. 폼처럼 이미 존재하는 DOM 요소에 속성을 붙여 툴을 노출하는 접근이다. JS로 `execute`를 직접 쓰는 대신, 기존 마크업에 에이전트가 읽을 수 있는 힌트를 얹는 셈이다. 어느 쪽이 맞는지는 상황에 달렸다. 이미 서버 렌더링된 폼과 링크로 동작하는 사이트라면 선언형이 코드를 덜 늘리고, 클라이언트 상태를 세밀하게 조작해야 하는 동작이라면 명령형 `registerTool`이 통제력을 준다. 나는 대부분의 실사이트가 둘을 섞어 쓰게 될 것이라 본다. 조회성 동작은 선언형으로 가볍게, 상태를 바꾸는 동작은 명령형으로 주석까지 붙여서.

## provideContext는 왜 제거됐나

여기가 이 글에서 가장 하고 싶은 이야기다. `provideContext`가 사라진 건 정리 차원의 리팩터링이 아니라 명백한 보안 결함 때문이다.

W3C WebMCP 저장소 이슈 #101이 문제를 이렇게 적었다. "While the `navigator.modelContext.registerTool()` method throws an error if a tool with the same name already exists, this security mechanism is bypassed with `navigator.modelContext.provideContext()` that first clears the existing tools before registering new ones." 번역하면, `registerTool`은 같은 이름의 툴이 이미 있으면 에러를 던져 덮어쓰기를 막는데, `provideContext`는 등록 전에 기존 툴을 싹 비우기 때문에 그 방어가 무력화된다는 것이다.

문제는 이 방어가 무력화됐을 때 무슨 일이 벌어지느냐다. 이슈의 위협 모델은 이렇게 설명한다. "a malicious or accidental third-party script can overwrite it. This could allow the third party to proxy tool calls, effectively observing the entire agent-user interaction, which may include private data." 온라인 스토어처럼 퍼스트파티와 서드파티 스크립트가 한 페이지에 섞이는 환경을 떠올리면 된다. 악의적이든 실수든 서드파티 스크립트가 내 결제 툴을 자기 것으로 갈아끼우면, 그 서드파티는 에이전트와 사용자 사이의 모든 툴 호출을 중계하며 엿볼 수 있다. 거기엔 개인정보가 섞여 있다.

제안된 해법은 provideContext를 이름 충돌 시 실패하게 만들거나, strict 플래그를 붙이거나, 사전 점검용 조회 API를 노출하는 세 갈래였다. 결과적으로 이슈 #101은 PR #132로 닫혔고, 현재 구현은 `provideContext`/`clearContext`를 걷어내고 `registerTool` 중심으로 수렴했다. "전체 교체"라는 편의 메서드 하나가, 공유 스크립트 환경에서는 탈취 벡터가 된다는 판단이다. 나는 이 결정이 옳다고 본다. 브라우저 API에서 "기존 걸 다 지우고 내 걸로 채운다"는 동작은 거의 항상 누군가의 함정이 된다.

## 내가 확인한 것과 확인하지 못한 것

정직하게 선을 긋는다. 오리진 트라이얼을 실제 에이전트로 끝까지 돌려보려면 Chrome 149 이상과 오리진 트라이얼 토큰, 그리고 이 API를 소비하는 에이전트가 필요하다. 이 글을 쓰는 환경에서 브라우저·에이전트 왕복까지 재현하지는 못했다. 그래서 내가 검증한 범위는 "툴의 입력 계약이 실제로 성립하는가"까지다.

`inputSchema`가 JSON Schema인 이상, 에이전트가 보내는 인자는 그 스키마로 검증된다. 그래서 위 예제의 스키마를 Node에서 Ajv로 컴파일해 몇 가지 인자를 통과시켜봤다.

```
{"category":"shoes","maxPrice":120} => PASS
{"maxPrice":120}                     => FAIL ["must have required property 'category'"]
{"category":"shoes","maxPrice":-5}   => FAIL ["must be >= 0"]
description length: 50 (within 500 budget)
```

`required`에 넣은 `category`가 빠지면 걸러지고, `minimum: 0`을 어긴 음수도 걸러진다. 당연해 보이지만, 이걸 직접 돌려보면 한 가지가 분명해진다. `execute` 콜백 안에서 입력을 다시 방어할 필요는 줄지만, 스키마를 느슨하게 쓰면 그만큼 검증도 느슨해진다는 것이다. `maxPrice`에 `minimum`을 안 걸었다면 음수 가격이 그대로 `execute`까지 들어온다. 스키마가 곧 방어선이다.

한계도 명확히 해둔다. 이건 브라우저 왕복이 아니라 스키마 계약만 검증한 것이다. 실제 에이전트가 description을 보고 이 툴을 제대로 고르는지, 여러 툴 사이에서 혼동하지 않는지는 별개 문제이고, 그건 오리진 트라이얼을 붙인 실사이트에서 재봐야 안다. 또 하나 눈여겨볼 대목은 `getTools`가 `fromOrigins`로 다른 오리진의 툴까지 조회하도록 설계됐다는 점이다. 크로스 오리진 툴 발견이 실제로 어떻게 동작하고 어디까지 허용되는지는 트라이얼이 진행되며 가장 먼저 시험대에 오를 부분이라 본다. 지금 단계에서 단정하지 않고, 다음 재측정 과제로 남겨둔다.

## 지금 개발자가 할 것

정리하면, WebMCP는 "언젠가"가 아니라 오리진 트라이얼 단계의 "지금 켜볼 수 있는" 기술이 됐다. 다만 API는 아직 움직이는 중이고, 그 움직임의 방향은 일관되게 "보안"이다. 당장 손댈 사람을 위한 체크리스트로 맺는다.

- **진입점은 `document.modelContext`로.** 2월 예제의 `navigator.modelContext`는 Chrome 150에서 deprecated다. 옛 코드를 복사했다면 여기부터 고친다.
- **툴은 개별 등록·개별 해제로 설계한다.** `registerTool` + `AbortSignal` 조합이 정본이다. "전체 교체" 사고방식은 버린다.
- **이름을 고유하게, 충돌은 에러로 받는다.** `registerTool`은 중복 이름에 에러를 던진다. 이걸 우회하려 들지 말고, 네임스페이스를 접두어로 관리한다.
- **주석을 반드시 단다.** 사용자 생성·외부 유입 데이터를 다루는 툴엔 `untrustedContentHint`, 상태를 바꾸지 않는 조회 툴엔 `readOnlyHint`. Chrome 보안 문서의 명시적 권고다.
- **오리진을 신뢰 기준으로 삼는다.** 문서는 "Only expose your tools to origins that you trust"라고 못박는다. 특히 사용자 데이터를 만지는 툴일수록.
- **문자 예산을 지킨다.** 툴 설명 500자, 파라미터 설명 150자, 툴 출력 1.5K가 권고치다.

마지막으로 Chrome 문서 자체가 인정하는 한계를 옮겨둔다. "it's impossible to guarantee safety inside of a large language model (LLM)." 툴을 잘 설계해도 LLM 내부의 안전은 보장되지 않는다. WebMCP의 보안 주석과 오리진 제한은 위험을 없애는 장치가 아니라 줄이는 장치다. 이 전제를 깔고 설계하는 것과, 이걸 잊고 "표준이 알아서 막아준다"고 믿는 것의 차이는 크다.

에이전트가 호출할 수 있게 사이트의 툴을 설계하거나, 서드파티 스크립트가 섞인 페이지에서 WebMCP 노출의 보안 경계를 점검하고 싶다면, 개인적으로 상담과 구현 의뢰를 받는다. 프로필의 문의 경로로 연락하면 된다.
