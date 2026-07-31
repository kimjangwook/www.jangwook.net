---
title: 'beforeunload는 통과했고 unload는 막혔다: bfcache 실측 6판'
description: 뒤로 가기가 즉시 열리는지 아닌지는 취향이 아니라 측정 대상이다. 차단 조건을 하나씩 심은 페이지 여섯 개에 back 내비게이션을 걸어 pageshow.persisted와 notRestoredReasons를 받아냈다. unload는 막혔고 beforeunload와 no-store는 통과했다.
pubDate: '2026-07-21'
updatedDate: '2026-07-24'
heroImage: ../../../assets/blog/bfcache-notrestoredreasons-audit-2026/hero.png
tags:
  - performance
  - core-web-vitals
  - web-development
  - chrome
relatedPosts:
  - slug: content-visibility-auto-render-cost-measure-2026
    score: 0.79
    reason:
      ko: "저 글은 최초 렌더링에서 브라우저가 얼마를 쓰는지를 쟀다. 이 글은 그다음, 뒤로 가기로 돌아올 때 그 비용을 아예 내지 않는 경로를 다룬다."
      ja: "あちらは初回レンダリングでブラウザがいくら払うかを測った回。こちらは戻る操作でその支払いを丸ごと省く経路の話。"
      en: "That one measures what the browser spends on first render. This one is about the path where a back navigation skips that bill entirely."
      zh: "那篇量的是首次渲染浏览器要花多少。这篇讲的是后退时如何把这笔账整个免掉。"
  - slug: validate-structured-data-ci-jsonld-2026
    score: 0.71
    reason:
      ko: "실측한 것을 CI 게이트로 굳히는 절차가 궁금하다면 저 글이 원형이다. 여기서 만든 bfcache 프로브도 같은 방식으로 배포마다 돌릴 수 있다."
      ja: "実測をCIゲートに固める手順の原型があちら。本稿のbfcacheプローブも同じ形でデプロイごとに回せる。"
      en: "The template for turning a measurement into a CI gate lives there. The bfcache probe from this post drops into the same shape."
      zh: "把测量固化成 CI 关卡的做法在那篇。本文的 bfcache 探针可以套进同一个模子。"
  - slug: ai-crawlers-dont-render-javascript-csr-2026
    score: 0.64
    reason:
      ko: "이쪽은 사람이 뒤로 갈 때 무엇이 복원되는가, 저쪽은 크롤러가 처음 올 때 무엇이 보이는가. 렌더링 시점이 누구의 것인지가 갈리는 두 사례다."
      ja: "こちらは人が戻るとき何が復元されるか、あちらはクローラーが来たとき何が見えるか。レンダリングの時点が誰のものかで分かれる二例。"
      en: "This post asks what survives when a human presses back; that one asks what exists when a crawler arrives. Same rendering timeline, different audience."
      zh: "这篇问人按下后退时什么被复原，那篇问爬虫到达时什么才存在。同一条渲染时间线，两种读者。"
  - slug: wcag22-target-size-audit-2026
    score: 0.55
    reason:
      ko: "자동 도구의 초록불이 통과를 뜻하지 않는다는 점에서 짝이 되는 글이다. 저기서는 점수가, 여기서는 'masked'가 사람의 판단을 요구했다."
      ja: "自動ツールの緑が合格を意味しないという点で対になる。あちらはスコアが、こちらは「masked」が人の判断を要求した。"
      en: "A companion piece on green automated results that aren't a pass. There it was the score; here it's \"masked\"."
      zh: "同样是自动工具亮绿灯却不等于合格。那边是分数，这边是「masked」。"
---

`beforeunload` 리스너를 단 페이지는 뒤로 가기에서 메모리째 복원됐다. `unload` 리스너를 단 페이지는 복원되지 않았다. 코드 한 줄 차이다.

이 둘을 한 서랍에 넣어둔 코드베이스를 여러 번 봤다. "떠날 때 뭔가 정리하는 핸들러"라는 서랍이다. 그래서 차단 조건을 하나씩만 심은 페이지를 여섯 개 만들고, 각각에 실제 back 내비게이션을 걸어 브라우저가 무엇을 돌려주는지 받아냈다. 아래가 그 여섯 판의 기록이다.

## 뒤로 가기가 네트워크를 한 번도 타지 않는 순간

back/forward cache(bfcache)는 사용자가 페이지를 떠날 때 그 페이지를 파괴하지 않고 통째로 메모리에 얼려두는 브라우저 기능이다. DOM도, JavaScript 힙도, 스크롤 위치도 그대로 남는다. 사용자가 뒤로 가기를 누르면 브라우저는 그 스냅샷을 되살린다. web.dev의 공식 설명은 이렇다. "Instead of destroying a page when the user navigates away, we postpone destruction and pause JS execution." 그리고 그 결과는 "Loading the previous page is essentially instant, because the entire page can be restored from memory, without having to go to the network at all."

여기서 중요한 것은 "네트워크를 타지 않는다"는 부분이다. 일반적인 뒤로 가기는 HTTP 캐시가 잘 잡혀 있어도 문서를 다시 파싱하고, 스크립트를 다시 실행하고, 레이아웃을 다시 계산한다. bfcache 복원은 그 전부를 건너뛴다. 재계산할 것이 없으니 LCP도 CLS도 새로 발생하지 않는다.

이게 왜 지금 중요한가. 검색 결과에서 들어와 한 페이지를 읽고 뒤로 가서 다음 결과로 넘어가는 행동은 모바일에서 특히 흔하다. 그 왕복이 매번 풀 로드라면, 사이트가 아무리 빨라도 사용자는 "느린 뒤로 가기"를 반복해서 겪는다. 반대로 bfcache가 걸리면 그 왕복은 사실상 0ms에 가깝다. 코드를 새로 쓰는 게 아니라 <strong>이미 있는 코드에서 차단 요인을 걷어내는</strong> 종류의 개선이라, 투입 대비 효과가 큰 편에 속한다.

먼저 기대치를 깎아두자. bfcache는 순위 요소가 아니다. 이걸 고쳤다고 검색 순위가 오른다는 보장은 어디에도 없고, 나도 그렇게 주장하지 않는다. 이건 실제 사용자가 겪는 내비게이션 체감의 문제다.

그리고 이 상태는 추측할 필요가 없다. 브라우저가 두 개의 API로 답을 준다.

- `pageshow` 이벤트의 `event.persisted` — `true`면 bfcache에서 복원된 것이다.
- `PerformanceNavigationTiming.notRestoredReasons` — 복원되지 <strong>않았을</strong> 때 그 이유를 담는다. Chrome 문서 기준 "The `notRestoredReasons` API has shipped from Chrome 123 and is being rolled out gradually."

## 조건 하나씩만 다른 페이지 여섯 개

측정 대상을 섞으면 결과를 해석할 수 없다. 그래서 로컬 서버에 라우트를 나눠 페이지를 찍어냈고, 각 페이지는 <strong>차단 후보를 정확히 하나씩만</strong> 갖는다. 나머지 마크업과 계측 스크립트는 전부 동일하다.

```js
// server.mjs — 조건별 페이지를 찍어내는 최소 서버
const page = (title, body, extraHead = '') => `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>${title}</title>${extraHead}</head>
<body><h1>${title}</h1>${body}
<script>
window.addEventListener('pageshow', (e) => {
  const nav = performance.getEntriesByType('navigation')[0];
  window.__bfcache = {
    persisted: e.persisted,
    nrr: nav && nav.notRestoredReasons
      ? JSON.parse(JSON.stringify(nav.notRestoredReasons))
      : null,
  };
});
</script></body></html>`;

const routes = {
  '/clean':        () => ({ headers: {}, html: page('clean', '<p>no blockers</p>') }),
  '/nostore':      () => ({ headers: { 'Cache-Control': 'no-store' }, html: page('nostore', '') }),
  '/unload':       () => ({ headers: {}, html: page('unload', '',
                      '<script>window.addEventListener("unload", function(){});</script>') }),
  '/beforeunload': () => ({ headers: {}, html: page('beforeunload', '',
                      '<script>window.addEventListener("beforeunload", function(e){});</script>') }),
  '/websocket':    () => ({ headers: {}, html: page('websocket', '',
                      '<script>window.__ws = new WebSocket("ws://127.0.0.1:8099");</script>') }),
  '/next':         () => ({ headers: {}, html: page('next', '<p>second page</p>') }),
};
```

계측 스크립트에서 `JSON.parse(JSON.stringify(...))`를 거치는 이유가 있다. `notRestoredReasons`가 돌려주는 값은 평범한 객체가 아니라 직렬화가 필요한 형태라, 로그에 그냥 찍으면 `[object Object]`만 남는다. 처음 실행에서 이걸로 한 번 헛돌았다.

절차는 여섯 판 모두 동일하다. 대상 페이지를 연다. `/next`로 이동한다. 브라우저 히스토리를 뒤로 돌린다. 복원된 페이지에서 `window.__bfcache`를 읽는다. 브라우저는 Chrome 150(macOS)이고, 사람 손 대신 DevTools 프로토콜로 조작했다. 마지막 한 판만 로컬 샌드박스가 아니라 실제로 운영 중인 이 블로그의 한국어 글 페이지를 대상으로 했다.

## 막힌 둘, 통과한 넷

여섯 판의 결과다.

![조건별 bfcache 복원 여부와 notRestoredReasons 측정 결과](../../../assets/blog/bfcache-notrestoredreasons-audit-2026/probe-results.png)

| 페이지 조건 | `event.persisted` | `notRestoredReasons.reasons` |
| --- | --- | --- |
| 차단 요인 없음 | `true` (복원) | `null` |
| `Cache-Control: no-store` | `true` (복원) | `null` |
| `beforeunload` 리스너 | `true` (복원) | `null` |
| `unload` 리스너 | `false` (차단) | `[{ reason: "masked" }]` |
| 열린 WebSocket | `false` (차단) | `[{ reason: "websocket" }]` |
| 운영 중인 블로그 글 | `true` (복원) | `null` |

`unload`가 걸린 것은 예상대로다. web.dev는 이 문제에 대해 표현을 아끼지 않는다. "Never use the `unload` event. Ever!" 그리고 이유도 명시한다. "On desktop, Chrome and Firefox have chosen to make pages ineligible for bfcache if they add an `unload` listener." 리스너 안이 비어 있어도 소용없다. 내가 심은 핸들러는 본문이 완전히 비어 있었는데도 차단됐다. 브라우저는 <strong>리스너의 존재 자체</strong>를 보고 판단한다.

반면 `beforeunload`는 통과했다. 둘을 뭉뚱그려 "이탈 시 핸들러"로 관리하던 코드베이스라면, 여기서 정리할 게 생긴다. 떠날 때 정리 작업이 필요하다면 `unload` 대신 `pagehide`를 쓴다. 공식 설명대로 "The `pagehide` event fires in all cases where the `unload` event fires, and it also fires when a page is put in the bfcache."

## "masked"라는, 답이 아닌 답

여기서 이 API의 실무적 한계가 드러난다. WebSocket 케이스는 `"websocket"`이라는 구체적인 문자열을 돌려줬다. 그런데 `unload` 케이스는 `"masked"`만 돌려줬다. 페이지에 iframe은 하나도 없었는데도 그랬다.

Chrome 문서는 이 값을 이렇게 설명한다. "For all the cross-origin iframes, we report `null` for the `reasons` value for the frame, and the top-level frame will shows a reason of `"masked"`." 여기까지는 프라이버시 보호 장치로 이해할 수 있다. 문제는 바로 뒤에 붙은 단서다. "`"masked"` may also be used for user agent-specific reasons so may not always indicate an issue in an iframe."

즉 `"masked"`를 받았다고 해서 원인이 iframe이라고 단정할 수 없다. 내 실측이 정확히 그 경우였다. iframe이 없는 단일 문서에서, 원인이 명백히 `unload` 리스너인데도 필드는 이유를 가렸다.

원인을 직접 보고 싶다면 경로가 따로 있다. Chrome DevTools의 Application 패널에는 Back/forward cache 항목이 있고, 거기서 "Test back/forward cache"를 누르면 브라우저가 자동으로 이동과 복귀를 수행한 뒤 차단 사유를 목록으로 보여준다. 이쪽은 필드 API와 달리 사유를 가리지 않는다. 대신 내가 지금 열어둔 한 페이지에 대해서만 답을 준다. 두 도구의 성질이 정확히 반대라, 역할을 나눠 쓰는 게 맞다.

그래서 이 API를 어떻게 쓸 것인가에 대한 내 판단은 이렇다. <strong>`notRestoredReasons`는 "무엇이 문제인지"보다 "어느 URL이 문제인지"를 알려주는 도구로 쓰는 게 정확하다.</strong> 필드에서 수집한 데이터로 차단이 발생하는 페이지 목록을 좁히고, 실제 원인은 그 페이지를 로컬에서 DevTools의 Back/forward cache 패널로 재현해 확인한다. 필드 데이터를 원인 진단서로 취급하면 `"masked"` 앞에서 막힌다. 이건 도구를 탓할 일이 아니라 도구의 결을 알고 쓰는 문제다.

## no-store는 더 이상 사형선고가 아니다

가장 뜻밖이었던 건 `Cache-Control: no-store` 페이지가 복원됐다는 점이다. 오래 알려진 규칙과 반대 결과다. web.dev도 과거 동작을 이렇게 적어뒀다. `Cache-Control: no-store`가 붙으면 "browsers have chosen not to store the page in bfcache."

다만 같은 문서에 이어지는 문장이 있다. "There is work underway to change this behavior for Chrome in a privacy-preserving manner." 그 작업은 이미 끝났다. Chrome 공식 문서(Enabling bfcache for `Cache-Control: no-store`)는 이 변경이 2025년 3월〜4월에 걸쳐 전체 사용자에게 롤아웃 완료됐다고 밝히고 있다. 내 측정은 그 결과를 확인한 셈이다.

여기서 오해하면 위험한 지점이 있으므로 조건을 정확히 옮긴다. 공식 설명 기준으로, `no-store` 페이지가 bfcache에 들어가더라도 <strong>쿠키를 비롯한 인증 정보가 바뀌면 Chrome이 그 페이지를 캐시에서 축출한다.</strong> 로그아웃한 뒤 뒤로 가기로 로그인 상태 화면에 접근하는 사고를 막기 위한 장치다. 또한 `no-store` 페이지가 특정 API를 쓰면 여전히 대상에서 제외되고, 그 페이지가 보낸 fetch나 XHR의 응답에 다시 `no-store`가 붙어 있으면 그것 역시 축출 사유가 된다.

정리하면 이렇다. `no-store`를 bfcache 차단용 스위치로 쓰던 관행은 이제 근거가 약하다. 하지만 그렇다고 민감한 페이지가 무방비로 캐시에 남는 것도 아니다. 보호 책임이 헤더 한 줄에서 쿠키·인증 상태 변화라는 더 정확한 신호로 옮겨간 것에 가깝다. 브라우저 동작에 기대는 부분이므로 결론을 세게 내리지는 않겠다. 다만 "`no-store`니까 당연히 안 걸린다"는 전제로 짜둔 코드가 있다면 지금 다시 재보는 게 맞다.

## 열린 연결이 문제지 코드가 문제가 아니다

> **【추기 2026-07-22】** web.dev의 2026년 6월 발표(「New to the web platform in June 2026」)에 따르면, 활성 WebSocket 연결이 있는 페이지도 bfcache에 진입하는 방향으로 브라우저 동작이 바뀌었을 가능성이 있다. 아래 절의 측정은 그 발표 이전 환경(Chrome 150)에서 잰 값이므로, 같은 프로브로 재측정한 뒤 결과를 갱신할 예정이다. 그때까지 이 절의 WebSocket 차단 결론은 구버전 기준으로 읽어야 한다.
>
> **【추기 2026-07-24 · 재측정 완료】** 같은 프로브를 Chrome 150 세 환경(자동화 빌드·정식 headless·플래그 시도)에서 다시 돌렸다. 열린 WebSocket은 세 번 다 `reason: "websocket"`으로 차단됐고, 대조군만 복원됐다. 즉 이 절의 결론은 <strong>내 자동화·헤드리스 측정 환경에서는 아직 유효</strong>하다. 다만 공식 발표는 참이며, 시드를 받은 실사용자 환경에서는 이미 복원될 가능성이 높다. 발표와 실측이 갈린 이유(단계적 롤아웃·새 프로필·헤드리스)와 CI 게이트가 이를 오판하는 지점은 [WebSocket bfcache 재측정 글](/ko/blog/ko/websocket-bfcache-eligibility-remeasure/)에 정리했다.

WebSocket 판은 한 번 실패하고 다시 했다. 처음에는 서버 없이 `new WebSocket('ws://127.0.0.1:8099')`만 심어두고 돌렸다. 결과는 `persisted: true`. 차단되지 않았다.

당연한 일이었다. 받아줄 서버가 없으니 연결은 즉시 실패했고, 뒤로 가기를 누른 시점에 그 페이지에는 열린 연결이 하나도 없었다. 그래서 실제 WebSocket 서버를 띄우고, 이동 직전에 `readyState`를 찍어 `1`(OPEN)인 것을 확인한 뒤에 다시 측정했다. 그제야 `persisted: false`와 `reasons: [{ reason: "websocket" }]`이 나왔다.

이 헛발질에서 건진 게 실은 이 글에서 가장 실무적인 대목이다. 브라우저가 보는 것은 <strong>내비게이션 시점에 열려 있는 연결</strong>이지 코드에 WebSocket이 등장하는지가 아니다. 같은 원리가 나머지 연결 계열 차단 요인에도 적용된다. 공식 문서가 드는 목록은 열린 IndexedDB 연결, 진행 중인 fetch나 XMLHttpRequest, 열린 WebSocket과 WebRTC다. 권고는 일관된다. 이들을 `pagehide`나 `freeze` 시점에 닫으라는 것이다.

이건 실시간 기능을 포기하라는 뜻이 아니다. 연결의 수명을 페이지 가시성에 맞춰 관리하라는 뜻이다.

```js
let socket;

function connect() {
  socket = new WebSocket('wss://example.com/live');
}

connect();

// 떠날 때 닫는다. unload가 아니라 pagehide다.
window.addEventListener('pagehide', () => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.close();
  }
});

// 복원되면 다시 연결하고, 얼어 있던 화면을 갱신한다.
window.addEventListener('pageshow', (event) => {
  if (event.persisted) {
    connect();
    refreshStaleUI();
  }
});
```

`event.persisted`가 `true`인 분기를 반드시 챙겨야 한다. bfcache에서 돌아온 페이지의 화면은 사용자가 떠나던 순간에 멈춰 있다. 장바구니 수량, 잔여 재고, 알림 배지처럼 시간이 지나면 틀려지는 값은 이 시점에 다시 가져와야 한다. 그러지 않으면 "빠르지만 낡은 화면"을 보여주게 된다. 속도를 얻고 정확성을 잃는 교환이 되면 안 된다.

`window.opener`도 같은 계열이다. 공식 설명은 "A page with a non-null `window.opener` reference can't safely be put into bfcache"라고 못 박는다. 외부 링크에 `rel="noopener"`를 붙이는 습관은 보안 관행으로 알려져 있지만, bfcache 적격성에도 그대로 영향을 준다.

## 필드에서 이유를 모으는 코드

로컬 측정은 재현에는 좋지만 커버리지가 좁다. 실제 사용자의 브라우저·확장·네트워크 조합에서 무엇이 막히는지는 필드에서만 보인다. 아래 스니펫을 심으면 차단이 발생한 URL과 (얻을 수 있다면) 이유가 수집된다.

```js
window.addEventListener('pageshow', (event) => {
  const nav = performance.getEntriesByType('navigation')[0];

  // bfcache로 복원된 경우: 히트로 집계
  if (event.persisted) {
    navigator.sendBeacon('/rum/bfcache', JSON.stringify({ hit: true, url: location.pathname }));
    return;
  }

  // 복원되지 않은 뒤로 가기만 골라낸다
  if (nav && nav.type === 'back_forward' && nav.notRestoredReasons) {
    const nrr = JSON.parse(JSON.stringify(nav.notRestoredReasons));
    navigator.sendBeacon('/rum/bfcache', JSON.stringify({
      hit: false,
      url: nrr.url,
      reasons: (nrr.reasons || []).map((r) => r.reason),
      frames: (nrr.children || []).length,
    }));
  }
});
```

수집된 `reasons` 배열이 대부분 `"masked"`로 채워져도 낙담할 필요는 없다. 앞서 정리한 대로 이 데이터의 값어치는 이유가 아니라 URL 분포에 있다. 차단율이 높은 템플릿을 특정한 뒤, 그 템플릿 하나를 로컬에서 파면 된다.

측정 결과를 해석할 때 걸려 넘어지기 쉬운 지점이 하나 더 있다. 운영 중인 블로그 글을 복원한 직후 navigation 항목을 읽어보니 `type`은 여전히 `"navigate"`였고 `duration`은 1315.2ms, `transferSize`는 22218바이트로 남아 있었다. 이건 <strong>복원 성능이 아니라 최초 로드 때의 값</strong>이다. bfcache 복원은 새 navigation 항목을 만들지 않는다. `nav.duration`으로 복원 속도를 재려고 하면 존재하지 않는 숫자를 보게 된다. 복원 여부는 `event.persisted`로 판정하는 게 맞다.

이렇게 측정하고 고친 것을 한 번 더 깨지지 않게 만드는 방법은 늘 같다. 자동화해서 게이트로 남기는 것이다. 구조화 데이터를 [CI에서 JSON-LD를 검증하는 게이트로 상설화한 방식](/ko/blog/ko/validate-structured-data-ci-jsonld-2026/)과 구조가 똑같다. 이 글의 여섯 판도 결국 "페이지를 연다 → 이동한다 → 뒤로 간다 → `persisted`를 읽는다"의 반복이라, 헤드리스 브라우저 스크립트로 옮겨 주요 템플릿에 대해 매 배포마다 돌릴 수 있다. 렌더링 시점의 비용을 [`content-visibility`로 실측했던 작업](/ko/blog/ko/content-visibility-auto-render-cost-measure-2026/)이 최초 로드를 다뤘다면, 이쪽은 두 번째 이후의 내비게이션을 다룬다.

## 정리: 뒤로 가기를 잃는 두 줄

이번 측정의 요지는 짧다. 여섯 판 중 둘이 막혔고, 그 둘의 원인은 각각 코드 한 줄과 열린 연결 하나였다. 나머지 넷은 통과했으며, 그중 하나는 오랫동안 차단 요인으로 알려져 있던 `Cache-Control: no-store`다.

바로 적용할 수 있는 순서로 정리한다.

- <strong>`unload` 리스너를 전수 조사해 제거한다.</strong> 본문이 비어 있어도 차단된다. 자사 코드뿐 아니라 서드파티 스니펫도 대상이다. `grep`으로 `addEventListener('unload'`와 `onunload`를 함께 훑는다.
- <strong>정리 로직은 `pagehide`로 옮긴다.</strong> `unload`가 발화하는 모든 상황에서 발화하고, bfcache 진입 시에도 발화한다. `beforeunload`는 차단 요인이 아니므로 이탈 확인 다이얼로그는 그대로 둬도 된다.
- <strong>WebSocket·WebRTC·IndexedDB 연결을 `pagehide`에서 닫는다.</strong> 판정 기준은 코드에 그 API가 있는지가 아니라 이동 시점에 연결이 열려 있는지다.
- <strong>`pageshow`에서 `event.persisted === true` 분기를 만든다.</strong> 연결을 되살리고, 시간이 지나 틀려진 화면 값을 다시 가져온다. 이 분기가 없으면 빠른 대신 낡은 화면이 남는다.
- <strong>외부 링크에 `rel="noopener"`를 붙인다.</strong> `window.opener`가 비어 있지 않으면 캐시 대상이 되지 못한다.
- <strong>`no-store` 전제로 짠 코드를 다시 잰다.</strong> Chrome은 2025년에 이 동작을 바꿨다. 다만 쿠키·인증 상태가 바뀌면 축출된다는 조건이 함께 있다.
- <strong>필드 계측을 붙이되 URL을 본다.</strong> `notRestoredReasons`의 이유는 `"masked"`로 가려질 수 있다. 이유 대신 차단이 몰리는 템플릿을 찾는 데 쓴다.

정직하게 한계도 적어둔다. 이 여섯 판은 한 대의 macOS 머신에서 Chrome 150 한 빌드로 잰 값이다. Safari와 Firefox는 차단 조건이 다르고, `notRestoredReasons` 자체가 Chromium 계열 API다. 여기 적힌 문자열을 표준 보장으로 읽으면 안 된다. 그래도 재현 절차는 그대로 남겨뒀으니, 각자의 대상 브라우저에서 같은 여섯 판을 돌려보면 자기 환경의 답이 나온다.

---

운영 중인 사이트에서 뒤로 가기가 실제로 캐시에서 복원되는지, 어느 템플릿이 어떤 이유로 자격을 잃는지는 의견이 아니라 측정으로 답할 수 있는 질문이다. 이런 종류의 실측과 그 결과를 CI 게이트로 남기는 작업을 개인적으로 상담·구현 의뢰로 받고 있다. 필요하다면 [문의 페이지](/ko/contact/)로 연락 주면 된다.
