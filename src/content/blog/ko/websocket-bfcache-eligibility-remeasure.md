---
title: '공식은 "WebSocket이 bfcache를 막지 않는다"고 했다 — 다시 재보니 세 번 다 막혔다'
description: Chrome 149가 열린 WebSocket의 bfcache 차단을 풀었다고 공식 발표했다. 지난 7월 22일 옛 측정에 "재측정 예정"이라 적어둔 그 항목을 오늘 다시 쟀다. Chrome 150 자동화·헤드리스 세 환경에서 notRestoredReasons는 여전히 websocket을 돌려줬다. 발표와 실측이 어긋나는 이유와, CI bfcache 게이트가 이걸 어떻게 오판하는지 정리했다.
pubDate: '2026-07-24'
heroImage: ../../../assets/blog/websocket-bfcache-eligibility-remeasure/hero.png
tags:
  - performance
  - core-web-vitals
  - web-development
  - chrome
relatedPosts:
  - slug: bfcache-notrestoredreasons-audit-2026
    score: 0.92
    reason:
      ko: "이 글은 저 글의 정오표를 회수하러 왔다. 저기서 'WebSocket=차단'이라 쟀고, 여기서 그 결론이 시효를 다했는지 같은 프로브로 다시 확인했다."
      ja: "本稿はあちらの正誤表を回収しに来た回。あちらで測った『WebSocket=ブロック』が期限切れになったかを、同じプローブで確かめている。"
      en: "This post exists to settle the errata on that one. There I measured 'WebSocket = blocked'; here I re-ran the same probe to see whether that conclusion had expired."
      zh: "这篇是来兑现那篇的勘误的。那边测得『WebSocket=拦截』，这边用同一套探针复核这个结论是否已经过期。"
  - slug: content-visibility-auto-render-cost-measure-2026
    score: 0.7
    reason:
      ko: "저 글은 최초 렌더링 비용을, 이 글은 뒤로 가기로 그 비용을 통째로 건너뛰는 경로를 다룬다. bfcache가 걸릴 때만 성립하는 절약이라 짝이 된다."
      ja: "あちらは初回レンダリングのコスト、こちらは戻る操作でそれを丸ごと省く経路。bfcacheが効いて初めて成立する節約なので対になる。"
      en: "That one measures first-render cost; this one covers the back-navigation path that skips that cost entirely — a saving that only holds when bfcache actually engages."
      zh: "那篇量首次渲染成本，这篇讲后退时把这笔成本整个跳过的路径。只有 bfcache 真正生效时才成立，因此成对。"
  - slug: validate-structured-data-ci-jsonld-2026
    score: 0.66
    reason:
      ko: "측정을 CI 게이트로 굳히는 절차가 궁금하다면 저 글이 원형이다. 다만 이 글은 그 게이트가 브라우저 롤아웃 때문에 실사용자와 어긋날 수 있다는 반례이기도 하다."
      ja: "測定をCIゲートに固める手順の原型があちら。ただ本稿は、そのゲートがブラウザのロールアウトのせいで実ユーザーとズレうるという反例でもある。"
      en: "The template for hardening a measurement into a CI gate lives there. This post is also a counterexample: that gate can diverge from real users because of browser rollout."
      zh: "把测量固化成 CI 关卡的做法在那篇。而本文也是一个反例：由于浏览器分批放量，那道关卡可能与真实用户脱节。"
  - slug: robots-snippet-controls-ai-overviews-2026
    score: 0.5
    reason:
      ko: "둘 다 '공식 문서 한 줄'과 '내 페이지의 실제 동작'이 어긋나는 지점을 실측으로 좁힌 글이다. 저기선 스니펫 지시자가, 여기선 bfcache 자격이 대상이었다."
      ja: "どちらも『公式ドキュメント一行』と『自分のページの実挙動』のズレを実測で詰めた回。あちらはスニペット制御、こちらはbfcache適格性。"
      en: "Both narrow the gap between a line of official docs and how your page actually behaves, by measuring it. There it was snippet directives; here it's bfcache eligibility."
      zh: "两篇都用实测收窄『官方文档一行』与『自己页面实际表现』之间的差距。那边是摘要指令，这边是 bfcache 资格。"
---

공식은 바뀌었다고 발표했다. Chrome 149 릴리스 노트에 "열린 WebSocket 연결은 더 이상 페이지의 bfcache 진입을 막지 않는다"고 적혀 있다. 나는 지난 7월 22일 정오표에서, 옛 측정 글에 "그 발표 이후 환경에서 같은 프로브로 재측정한 뒤 결과를 갱신할 예정"이라고 적어뒀다. 뒤집힐 것을 예고까지 해둔 셈이다.

오늘 다시 쟀다. 뒤집히지 않았다. Chrome 150을 세 가지 방식으로 돌렸고, 열린 WebSocket이 걸린 페이지는 세 번 다 복원되지 않았다. `notRestoredReasons`는 매번 `websocket`을 돌려줬다. 이 글은 그 어긋남을 정직하게 기록하고, 왜 발표와 실측이 갈렸는지, 그리고 이게 bfcache를 CI로 감시하는 사람에게 왜 실질적인 함정인지를 정리한 것이다.

## bfcache가 뭐고, WebSocket이 왜 그걸 막았나

먼저 개념부터 다진다. 이 글의 결론은 좁고 기술적이므로, 토대가 없으면 숫자만 남는다.

back/forward cache(bfcache)는 사용자가 페이지를 떠날 때 그 페이지를 파괴하지 않고 통째로 메모리에 얼려두는 브라우저 기능이다. DOM도, JavaScript 힙도, 스크롤 위치도 그대로 남는다. 사용자가 뒤로 가기를 누르면 브라우저는 그 스냅샷을 되살린다. web.dev의 공식 설명은 이렇다. "Loading the previous page is essentially instant, because the entire page can be restored from memory, without having to go to the network at all." 문서를 다시 파싱하지 않고, 스크립트를 다시 실행하지 않고, 레이아웃을 다시 계산하지 않는다. 검색 결과를 오가는 왕복이 잦은 모바일에서 특히 체감이 크다.

여기서 기대치를 미리 깎아둔다. bfcache는 순위 요소가 아니다. 이걸 고쳤다고 검색 순위가 오른다는 보장은 어디에도 없고, 나도 그렇게 주장하지 않는다. 이건 실제 사용자가 겪는 내비게이션 체감의 문제다.

문제는 아무 페이지나 얼려둘 수 없다는 점이다. 페이지가 살아 있는 연결이나 콜백을 붙들고 있으면, 브라우저는 그 페이지를 얼리는 대신 그냥 파기해버린다. 오래도록 그 목록에 올라 있던 항목이 열린 WebSocket이었다. 실시간 채팅 위젯, 알림 스트림, 라이브 시세처럼 WebSocket을 물고 있는 페이지는 뒤로 가기에서 매번 풀 로드됐다.

그리고 이 상태는 추측할 필요가 없다. 브라우저가 두 개의 API로 답을 준다. `pageshow` 이벤트의 `event.persisted`가 `true`면 bfcache에서 복원된 것이다. 복원되지 <strong>않았을</strong> 때는 `PerformanceNavigationTiming.notRestoredReasons`가 그 이유를 담는다. 이 API는 Chrome 123부터 출시됐다. 나는 [지난번 6판 측정](/ko/blog/ko/bfcache-notrestoredreasons-audit-2026)에서 이 두 API로 여섯 가지 차단 후보를 하나씩 갈라냈고, 그중 열린 WebSocket이 `reason: "websocket"`으로 페이지를 차단하는 것을 확인했다.

## 공식은 분명히 "이제 안 막는다"고 했다

그 결론이 흔들린 계기는 web.dev의 2026년 6월 플랫폼 요약이었다. 원문은 이렇게 시작한다. "In Chrome 149, pages with active WebSocket connections can now enter the Back/Forward Cache (bfcache). Previously, an open WebSocket connection rendered a page ineligible for bfcache. Now, the browser automatically closes active WebSocket connections upon bfcache entry."

핵심은 마지막 문장이다. 페이지를 "부적격"으로 찍어 파기하는 대신, <strong>브라우저가 bfcache 진입 시점에 WebSocket을 대신 닫아주고</strong> 페이지는 얼린다는 것이다. Chrome 149 릴리스 노트도 같은 말을 더 짧게 한다. "Active WebSocket connections no longer prevent a page from entering the Back/Forward Cache (bfcache)." blink-dev의 변경 공지(PSA)는 개발자 쪽 함의까지 짚는다. "By closing connections on BFCache entry instead of marking the document as ineligible..." 그리고 견고하게 짠 WebSocket 클라이언트는 이미 `close` 이벤트로 끊김을 감지해 재연결하므로 대개 무리 없이 흡수된다고 덧붙인다.

발표를 있는 그대로 읽으면, 내 옛 측정의 "WebSocket=차단"은 구버전 기준의 낡은 결론이 된다. 그래서 나는 정오표에 "재측정 예정"이라고 적었고, 오늘 그 약속을 지키러 왔다. 다만 발표를 확인하는 것과 내 환경에서 재현되는 것은 별개의 일이다. 그 둘이 갈리는 순간이 이 글의 본론이다.

## 같은 프로브를 다시 돌렸다 — 세 번 다 막혔다

측정 대상을 섞으면 결과를 해석할 수 없다. 그래서 지난번과 동일한 최소 서버를 다시 세웠다. 라우트는 두 개다. 열린 WebSocket 하나만 붙은 `/websocket`, 아무 차단 후보도 없는 대조군 `/clean`. 이번에는 지난번의 헛발질을 되풀이하지 않으려고, WebSocket을 받아줄 로컬 에코 서버를 실제로 띄우고 이동 직전 `readyState`가 `1`(OPEN)인 것을 매번 확인했다. 계측 스크립트는 6줄이다.

```js
window.addEventListener('pageshow', (e) => {
  const nav = performance.getEntriesByType('navigation')[0];
  window.__bfcache = {
    persisted: e.persisted,
    nrr: nav && nav.notRestoredReasons
      ? JSON.parse(JSON.stringify(nav.notRestoredReasons))
      : null,
  };
});
```

`JSON.parse(JSON.stringify(...))`를 거치는 이유는 지난 글에 적어뒀다. `notRestoredReasons`는 그냥 로그에 찍으면 `[object Object]`만 남는 형태라, 한 번 직렬화를 강제해야 값이 보인다.

절차는 동일하다. `/websocket`을 연다. `readyState === 1`을 확인한다. `/next`로 이동한다. 히스토리를 뒤로 돌린다. 복원된 페이지에서 `window.__bfcache`를 읽는다. 이걸 세 가지 Chrome 150 환경에서 반복했다.

첫째는 DevTools 프로토콜로 조작하는 자동화용 빌드다. `navigator.userAgent`는 `Chrome/150.0.0.0`을 돌려줬다. 둘째는 내 맥에 설치된 정식 Google Chrome 150.0.7871.186을 `--headless=new`로 새로 띄워 CDP로 직접 몰았다. 셋째는 같은 정식 Chrome을 이번엔 WebSocket 관련으로 짐작되는 `--enable-features` 플래그 몇 개를 걸어 띄웠다. 결과는 셋이 완전히 같았다.

![세 가지 Chrome 150 환경에서 열린 WebSocket 페이지의 bfcache 복원 여부와 notRestoredReasons 측정 결과. 대조군만 복원됐다.](../../../assets/blog/websocket-bfcache-eligibility-remeasure/probe-results.png)

| 환경 | 페이지 조건 | `persisted` | `notRestoredReasons` | WS `close` 이벤트 |
| --- | --- | --- | --- | --- |
| 자동화 빌드 (Chrome/150.0.0.0) | 열린 WebSocket | `false` | `[{ reason: "websocket" }]` | 없음 |
| 정식 headless 150.0.7871.186 | 열린 WebSocket | `false` | `[{ reason: "websocket" }]` | 없음 |
| 정식 + `--enable-features`(짐작) | 열린 WebSocket | `false` | `[{ reason: "websocket" }]` | 없음 |
| 정식 headless 150.0.7871.186 | 대조군(clean) | `true` | `null` | — |

두 가지가 눈에 띈다. 첫째, 대조군은 세 환경 모두에서 `persisted: true`로 복원됐다. 즉 뒤로 가기 하니스 자체는 멀쩡하고, bfcache는 이 빌드에서도 정상 동작한다. 그러니 WebSocket 페이지의 `false`는 하니스 결함이 아니라 진짜 차단이다. 둘째, 발표가 말한 "브라우저가 WebSocket을 대신 닫아준다"는 동작이 내 환경에선 일어나지 않았다. 복원 실패 후에도 소켓의 `readyState`는 `1`로 남아 있었고, `close` 이벤트는 한 번도 발화하지 않았다. 새 코드 경로가 아예 켜지지 않은 것이다.

여기서 측정을 해석할 때 걸려 넘어지기 쉬운 지점을 하나 짚어둔다. `persisted: false` 하나만으로는 "bfcache가 차단됐다"와 "그냥 평범하게 새로 로드됐다"를 구별할 수 없다. `pageshow`는 최초 로드에서도 `persisted: false`로 발화하기 때문이다. 둘을 가르는 것은 두 가지다. 내비게이션 타입이 `back_forward`인지, 그리고 `notRestoredReasons.reasons`에 구체적 사유가 담겼는지. 위 측정에서 정식 headless 판은 `nav.type`이 `back_forward`였고 `reasons`가 `[{ reason: "websocket" }]`이었다. 이 두 조건이 함께 성립해야 "뒤로 가기였는데 WebSocket 때문에 복원에 실패했다"고 단정할 수 있다. `persisted`만 보고 차단을 판정하는 계측은 최초 로드를 차단으로 오해한다.

정직하게 밝힌다. 셋째 환경의 `--enable-features` 플래그 이름은 내가 짐작한 것이고, 아무 변화도 만들지 못했다. 나는 이 기능의 정확한 `base::Feature` 이름을 끝내 확정하지 못했다. Chrome은 모르는 기능 이름을 조용히 무시하므로, 저 시도는 "이 이름들은 아니었다" 이상을 증명하지 못한다.

## 왜 발표와 내 측정이 어긋났나

여기서부터는 내 전문 영역이 아닌 부분이 섞이므로 단정하지 않는다. 순위 알고리즘 내부나 브라우저의 실험 배포 서버 로직을 내가 들여다본 것은 아니다. 찾아본 범위에서 가장 그럴듯한 후보를 순서대로 적는다.

가장 유력한 것은 <strong>단계적 롤아웃</strong>이다. Chrome은 "스테이블에 출시"라고 발표한 기능도 실제로는 서버 쪽 구성(흔히 Finch라 부르는 필드 트라이얼)으로 사용자에게 점진적으로 켜는 경우가 많다. 이건 추측이 아니라 관찰 가능한 패턴이다. 바로 앞 사례가 `Cache-Control: no-store`의 bfcache 진입인데, Chrome 공식 문서는 그 변경이 2025년 3월〜4월에 걸쳐 "전체 사용자에게 롤아웃 완료"됐다고 못박는다. "출시"와 "모든 사용자에게 켜짐" 사이에 시차가 있다는 것을 공식 문서 스스로 인정하는 셈이다. 이 필드 구성은 대체로 네트워크로 내려받은 시드에 의존한다. 그런데 내가 띄운 정식 Chrome은 매번 갓 만든 빈 프로필이었다. 시드가 없는 새 프로필은 기능의 기본값(대개 꺼짐)으로 도는 것이 자연스럽다.

둘째 후보는 <strong>헤드리스·자동화 컨텍스트</strong> 자체의 차이다. `--headless=new`가 헤드풀과 대부분 같게 동작한다고는 하나, 실험 배포나 일부 최적화가 자동화 환경에서 다르게 잡히는 사례가 있다. 나는 이 환경에서만 쟀고, 사람이 손으로 조작하는 헤드풀 스테이블 프로필에서 같은 결과가 나올지는 확인하지 못했다. 오히려 발표를 그대로 믿는다면, 시드를 받은 실사용자의 헤드풀 Chrome에서는 이미 복원될 가능성이 높다.

그래서 이 글의 주장은 "Chrome이 발표를 안 지켰다"가 아니다. 그렇게 읽으면 틀린다. 정확한 주장은 이거다. <strong>"스테이블에 출시됨"은 "당신 앞의 모든 Chrome 150에서 켜져 있음"과 같지 않다. 특히 갓 만든 프로필과 자동화·헤드리스 환경에서는.</strong> 발표는 참이고, 내 실측도 참이다. 둘은 서로 다른 층위를 재고 있다.

## 그래서 개발자는 무엇을 해야 하나

이 어긋남은 추상적인 이야기가 아니다. 지난 글에서 나는 bfcache 측정을 헤드리스 스크립트로 옮겨 [배포마다 CI 게이트로 돌리라](/ko/blog/ko/validate-structured-data-ci-jsonld-2026)고 권했다. 오늘 측정이 바로 그 권고의 맹점을 드러낸다. CI의 브라우저는 십중팔구 갓 만든 프로필의 헤드리스다. 그 환경은 방금 본 대로 실사용자보다 플랫폼 롤아웃을 늦게 반영한다. 플랫폼이 "고쳤다"고 발표한 뒤에도 당신의 게이트는 한동안 `websocket`을 차단 사유로 계속 뱉을 수 있다.

바로 적용할 수 있는 순서로 정리한다.

- <strong>CI bfcache 게이트에 브라우저 빌드·채널을 로그로 남긴다.</strong> `navigator.userAgent`와 버전 문자열을 결과에 함께 기록한다. 어느 날 게이트 결과가 실사용자 필드 데이터와 어긋나면, 범인은 코드가 아니라 브라우저 롤아웃 시차일 수 있다.
- <strong>게이트를 실사용자 필드 데이터로 교차검증한다.</strong> `notRestoredReasons`를 `sendBeacon`으로 수집하는 RUM 스니펫은 지난 글에 그대로 있다. CI가 초록불인데 필드에서 `websocket`이 사라졌다면(또는 그 반대라면), 그 격차 자체가 신호다. 어느 한쪽만 믿지 않는다.
- <strong>WebSocket을 여전히 `pagehide`에서 닫는다.</strong> 브라우저가 진입 시점에 대신 닫아준다 해도, 그 동작이 모든 사용자에게 켜졌다고 가정하고 코드를 짜면 안 된다. 롤아웃이 덜 닿은 사용자에게는 옛 규칙이 그대로 적용된다. 명시적으로 닫는 코드는 양쪽 세계에서 다 안전하다.
- <strong>`pageshow`에서 `event.persisted === true` 분기를 반드시 만든다.</strong> 브라우저가 WebSocket을 대신 닫아 페이지가 복원되면, 돌아온 화면의 실시간 연결은 끊겨 있다. 이 분기에서 다시 연결하고, 얼어 있던 값(알림, 재고, 시세)을 새로 가져온다. 이 분기가 없으면 "빠르지만 끊긴" 화면을 보여주게 된다.

내 브라우저가 지금 어느 롤아웃 단계에 있는지는 직접 확인할 수 있다. WebSocket을 물고 있는 실제 페이지를 열어둔 채 Chrome DevTools의 Application 패널에서 Back/forward cache 항목의 "Test back/forward cache"를 누르면, 브라우저가 자동으로 이동과 복귀를 수행한 뒤 차단 사유를 목록으로 보여준다. 이 도구는 필드 API와 달리 사유를 `masked`로 가리지 않는다. 거기서 `websocket`이 여전히 뜬다면 당신의 이 프로필은 아직 옛 동작이고, 뜨지 않는다면 이미 새 동작으로 넘어간 것이다. CI 게이트를 손대기 전에 이 한 번의 확인으로 자기 환경의 단계를 못박아두는 편이 낫다.

```js
let socket;
function connect() { socket = new WebSocket('wss://example.com/live'); }
connect();

// 진입 시점에 브라우저가 닫아주더라도, 명시적으로도 닫아 양쪽 롤아웃에서 안전하게.
window.addEventListener('pagehide', () => {
  if (socket && socket.readyState === WebSocket.OPEN) socket.close();
});

// 복원되면 다시 연결하고, 얼어 있던 화면을 갱신한다.
window.addEventListener('pageshow', (event) => {
  if (event.persisted) { connect(); refreshStaleUI(); }
});
```

## 정리: 정오표를 반만 회수한다

이번 재측정의 요지는 짧다. 공식은 Chrome 149에서 열린 WebSocket의 bfcache 차단을 풀었다고 발표했다. 나는 그 발표를 신뢰하고 내 옛 결론이 뒤집힐 것이라 예고했다. 그런데 Chrome 150 자동화·헤드리스 세 환경에서 다시 재보니, 열린 WebSocket은 여전히 `reason: "websocket"`으로 페이지를 차단했다. 대조군은 정상 복원됐으니 하니스 탓은 아니다.

그래서 지난 글의 정오표를 이렇게 갱신한다. WebSocket 차단은 <strong>플랫폼 차원에서 해소되는 중</strong>이며, 시드를 받은 실사용자 환경에서는 이미 복원될 가능성이 높다. 다만 갓 만든 프로필의 자동화·헤드리스 Chrome에서는 아직 옛 동작이 관찰된다. 그러니 "이제 WebSocket은 안 막힌다"를 전제로 코드를 지우기 전에, <strong>당신의 측정 환경이 실사용자 환경과 같은 롤아웃 단계에 있는지</strong>부터 확인해야 한다.

정직하게 한계도 적어둔다. 이 세 판은 한 대의 macOS 머신에서 Chrome 150 계열로 잰 값이다. Safari와 Firefox는 차단 조건이 다르고, `notRestoredReasons` 자체가 Chromium 계열 API다. 나는 헤드풀 스테이블 프로필에서 시드를 받은 상태로는 재현하지 못했고, 기능의 정확한 플래그 이름도 확정하지 못했다. 여기 적힌 결과를 "Chrome 150은 WebSocket을 막는다"는 일반 명제로 읽으면 틀린다. 정확히는 "내가 잰 세 자동화 환경에서는 아직 막혔다"이다. 재현 절차는 그대로 남겼으니, 각자의 대상 환경에서 같은 세 판을 돌려보면 자기 롤아웃 단계의 답이 나온다.

측정이 발표를 확인하는 것과, 그 발표가 내 앞의 브라우저에서 실제로 켜져 있는 것은 다른 질문이다. 후자는 의견이 아니라 측정으로만 답할 수 있고, 그 답은 환경마다 다르다. 운영 중인 사이트의 bfcache 자격을 실측하고 그 결과를 실사용자 필드 데이터와 어긋나지 않게 게이트로 남기는 작업을 개인적으로 상담·구현 의뢰로 받고 있다. 필요하다면 [문의 페이지](/ko/contact)로 연락 주면 된다.
