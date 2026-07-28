---
title: 'prerender에서 LCP가 6.2초로 찍힌 이유 — activationStart를 뺀 RUM만 맞다'
description: Speculation Rules로 페이지를 미리 렌더링하면 LCP 원본값에 사용자 대기 시간이 통째로 들어간다. Chrome 150에서 6244ms와 103.5ms의 간극을 실측하고, activationStart로 보정해야 할 지점을 RUM 계측 코드 기준으로 하나씩 정리했다.
pubDate: '2026-07-28'
heroImage: ../../../assets/blog/prerender-activationstart-cwv-measurement-2026/hero.png
tags:
  - performance
  - core-web-vitals
  - web-development
  - chrome
relatedPosts:
  - slug: lcp-image-preload-scanner-fetchpriority-2026
    score: 0.78
    reason:
      ko: "저 글은 LCP를 실제로 앞당기는 법이고, 이 글은 그렇게 앞당긴 LCP가 대시보드에 잘못 찍히는 경로다. 개선과 계측은 따로 검증해야 한다."
      ja: "あちらはLCPを実際に早める話、こちらは早めたLCPがダッシュボードに誤って載る話。改善と計測は別々に検証しないといけない。"
      en: "That post makes LCP genuinely faster; this one covers how that faster LCP can still land wrong in your dashboard. Improvement and measurement need separate proof."
      zh: "那篇讲怎样真正把 LCP 提前，这篇讲提前之后它为何仍会在看板上记错。优化和计量得分开验证。"
  - slug: websocket-bfcache-eligibility-remeasure
    score: 0.72
    reason:
      ko: "bfcache 복원도 prerender 활성화도, 브라우저가 페이지 수명주기를 건드리면 계측 기준점이 흔들린다. 저기선 복원 여부가, 여기선 시작 시각이 문제였다."
      ja: "bfcache復元もprerender活性化も、ブラウザがページのライフサイクルに手を入れると計測の基準点がぶれる。あちらは復元の可否、こちらは開始時刻が争点。"
      en: "Both bfcache restores and prerender activations move the ground under your metrics when the browser rewrites the page lifecycle. There the question was whether it restored; here it's when the clock started."
      zh: "无论 bfcache 恢复还是 prerender 激活，浏览器一改动页面生命周期，计量基准就会漂移。那边问的是能否恢复，这边问的是计时从何时开始。"
  - slug: axe-core-ci-a11y-jsdom-vs-browser-2026
    score: 0.68
    reason:
      ko: "테스트 환경이 조용히 거짓 음성을 내는 같은 함정이다. 저기선 jsdom이 위반을 못 봤고, 여기선 Playwright가 prerender 자체를 일으키지 못했다."
      ja: "テスト環境が静かに偽陰性を返すという同じ罠。あちらはjsdomが違反を見落とし、こちらはPlaywrightがprerenderそのものを起こせなかった。"
      en: "The same trap in a different guise: a test environment quietly returning a false negative. There jsdom missed real violations; here Playwright never triggered the prerender at all."
      zh: "同一个陷阱的两副面孔：测试环境悄悄给出假阴性。那边是 jsdom 漏掉真实违规，这边是 Playwright 根本没能触发预渲染。"
  - slug: content-visibility-auto-render-cost-measure-2026
    score: 0.6
    reason:
      ko: "렌더링 비용을 뒤로 미루는 기법과 아예 앞으로 당기는 기법. 방향은 반대인데 둘 다 '언제를 0으로 볼 것인가'라는 같은 질문에 걸린다."
      ja: "レンダリングコストを後ろにずらす手法と、まるごと前倒しする手法。向きは逆だが、どちらも「どこを0とみなすか」という同じ問いにぶつかる。"
      en: "One technique defers rendering cost, the other pulls it forward. Opposite directions, same underlying question: which moment counts as zero?"
      zh: "一个把渲染成本往后推，一个把它整体提前。方向相反，却撞上同一个问题：把哪一刻当作零点。"
---

속도를 올렸는데 대시보드가 나빠지는 경험을 해본 적 있을 것이다. Speculation Rules로 prerender를 켠 다음 주에 RUM의 LCP 분포가 무너져 있다면, 페이지가 느려진 게 아니다. 계측이 어긋난 것이다.

나는 이걸 재보려고 Chrome 150에서 prerender를 실제로 걸었다. 사용자가 이동한 뒤 화면이 그려지기까지 걸린 시간은 103.5ms였다. 그런데 LCP 엔트리의 원본 `startTime`은 6244ms였다. 같은 페이지, 같은 한 번의 내비게이션에서 나온 두 숫자다. 어느 쪽을 대시보드에 보내느냐가 "좋음"과 "나쁨"을 가른다.

![Prerendered LCP: raw timing lies by about 6 seconds — measured across four Chrome launch configurations](../../../assets/blog/prerender-activationstart-cwv-measurement-2026/hero.png)

## prerender가 무엇이고, 왜 시계가 두 개가 되나

먼저 토대를 다진다. 결론이 좁고 기술적이라, 개념이 없으면 숫자만 남는다.

Speculation Rules API는 사용자가 다음에 갈 법한 페이지를 브라우저가 미리 가져오게 하는 표준이다. 문서에 이런 스크립트 블록을 넣으면 된다.

```html
<script type="speculationrules">
{
  "prerender": [
    { "urls": ["/next.html"], "eagerness": "immediate" }
  ]
}
</script>
```

`prefetch`가 응답 바이트만 미리 받아두는 것이라면, `prerender`는 한 발 더 나간다. 브라우저는 보이지 않는 곳에서 그 페이지를 **완전히 렌더링한다.** HTML을 파싱하고, 스크립트를 실행하고, 레이아웃을 잡고, 하위 리소스를 받는다. 사용자가 실제로 그 링크로 이동하면 브라우저는 새로 로드하지 않고 이미 만들어둔 문서를 **활성화(activate)** 한다. 화면 전환이 거의 즉시 일어난다.

여기서 시계가 갈라진다. 문서의 `performance` 타임라인 원점은 사용자가 클릭한 순간이 아니라 **prerender가 시작된 순간**이다. 사용자가 6초 뒤에 이동했다면, 그 문서 입장에서 활성화는 t+6000ms 언저리에 일어난 사건이다. 그리고 화면에 뭔가 처음 칠해지는 것은 활성화 이후다. prerender 중에는 아무것도 그려지지 않기 때문이다.

그래서 LCP 엔트리의 `startTime`은 "사용자가 기다린 시간"이 아니라 "prerender가 시작된 뒤 흐른 시간"이 된다. 그 안에는 사용자가 아직 링크를 누르지 않고 있던 순수한 대기 시간이 통째로 들어 있다.

브라우저는 이 간극을 메우라고 값을 하나 준다. `PerformanceNavigationTiming.activationStart`다. 크롬 공식 문서의 설명은 이렇다. "Once a prerendered document is activated, `PerformanceNavigationTiming`'s `activationStart` will also be set to a non-zero time representing the time between when the prerender was started and the document was actually activated." (출처: [Prerender pages in Chrome for instant page navigations](https://developer.chrome.com/docs/web-platform/prerender-pages))

즉 사용자가 체감한 시간은 원본값에서 이 값을 뺀 것이다.

## 6244ms와 103.5ms — 샌드박스에서 실제로 갈라놓기

임시 디렉터리에 정적 서버를 하나 띄웠다. 진입 페이지 A는 대상 페이지 B에 대한 prerender 규칙을 갖고 있고, 6초 뒤 스크립트로 B로 이동한다. 6초는 내가 임의로 정한 간격이다. 사용자가 링크를 보고 머뭇거리는 시간을 크게 잡아 눈에 보이게 만든 것이다.

대상 페이지 B는 자기 계측 결과를 `navigator.sendBeacon`으로 서버에 되쏜다. 브라우저 자동화 도구를 쓰지 않은 이유는 뒤에서 따로 다룬다.

```js
const nav = () => performance.getEntriesByType('navigation')[0];

new PerformanceObserver((list) => {
  for (const e of list.getEntries()) {
    const a = nav()?.activationStart ?? 0;
    send({ event: 'LCP', raw: e.startTime, activationStart: a,
           corrected: Math.max(e.startTime - a, 0) });
  }
}).observe({ type: 'largest-contentful-paint', buffered: true });
```

Chrome 150.0.7871.187을 그대로 띄워 A로 보냈다. 서버에 쌓인 로그다.

```json
{"event":"script-eval","prerendering":true,"activationStartAtEval":0}
{"event":"nav-timing","activationStart":0,"type":"navigate",
 "domContentLoadedEventStart":46.8,"loadEventStart":47.7,"responseEnd":0.1}
{"event":"activated","perfNow":6186.8,"activationStart":6136.9}
{"event":"FCP","raw":6244,"activationStart":6136.9,"corrected":107.1}
{"event":"LCP","raw":6244,"activationStart":6136.9,"corrected":107.1}
```

읽어야 할 것이 네 줄에 다 있다.

`document.prerendering`은 스크립트가 처음 실행될 때 `true`였다. 문서는 백그라운드에서 살아 있었다. `domContentLoadedEventStart`가 46.8ms, `loadEventStart`가 47.7ms다. 이 두 이벤트는 **prerender 도중에 발생했다.** 사용자는 아직 그 페이지를 보지도 않았는데 로드는 끝나 있었다.

활성화는 6136.9ms 지점에서 일어났다. 그리고 FCP와 LCP는 6244ms에 찍혔다. 빼면 107.1ms다.

여기서 한 가지를 분명히 해두는 게 좋겠다. 이 실험에서 prerender는 정상적으로, 아주 잘 작동했다. 사용자가 실제로 기다린 시간은 0.1초다. 문제는 그 사실이 계측값에 그대로 나타나지 않는다는 것이다.

![Two clocks after activation: which value each API reports for the same prerendered navigation](../../../assets/blog/prerender-activationstart-cwv-measurement-2026/two-clocks.png)

## activationStart는 활성화 전까지 0이다

로그 두 번째 줄을 다시 본다. 그 시점의 `activationStart`는 **0**이었다.

이건 버그가 아니라 명세다. WICG의 prerendering 명세는 모든 Document가 활성화 시작 시각을 갖고 그 초기값이 0이라고 규정한다 ([Prerendering Revamped](https://wicg.github.io/nav-speculation/prerendering.html)). 활성화가 실제로 일어나야 값이 채워진다.

실무에서 이게 왜 함정이 되는지는 바로 나온다. 많은 팀이 계측 코드를 이렇게 짠다. 로드 시점에 네비게이션 엔트리를 한 번 읽어 변수에 담아두고, 나중에 지표가 나올 때마다 그 변수를 쓴다.

```js
// 이렇게 하면 prerender된 페이지에서 조용히 깨진다
const activationStart = performance.getEntriesByType('navigation')[0].activationStart;
// ... 한참 뒤 ...
report('LCP', lcpEntry.startTime - activationStart);   // activationStart는 0으로 굳어 있다
```

내 로그에서 `load` 이벤트 직후 스냅숏을 뜬 값이 정확히 0이었다. 그 뒤 6초가 지나 활성화가 일어나고 값이 6136.9로 바뀌었지만, 변수에 담아둔 쪽은 영영 0이다. 보정하려던 코드가 보정을 하나도 하지 않은 채 "보정했다"고 믿는 상태가 된다.

규칙은 단순하다. **`activationStart`는 보고하는 순간에 읽어라.** 스크립트 평가 시점도, `DOMContentLoaded`도, `load`도 아니다.

같은 이유로 비콘 자체를 활성화 이후로 미뤄야 한다. 크롬 문서도 이 점을 짚는다. "However—particularly when using the Speculation Rules API—prerendered pages may have an impact on analytics and site owners may need to add extra code to only enable analytics for prerendered pages on activation, as not all analytics providers may do this by default." (출처: [Prerender pages in Chrome for instant page navigations](https://developer.chrome.com/docs/web-platform/prerender-pages))

패턴은 이렇게 된다.

```js
function whenActivated(fn) {
  if (document.prerendering) {
    document.addEventListener('prerenderingchange', () => fn(), { once: true });
  } else {
    fn();
  }
}
whenActivated(() => initAnalytics());
```

## 네 가지 실행 조건에서 재본 결과와 web-vitals의 처리

한 번 재고 결론 내리는 건 위험하다. 실행 조건을 바꿔가며 네 번 돌렸고, 이번에는 직접 짠 옵저버 대신 [web-vitals](https://github.com/GoogleChrome/web-vitals) v5.1.0을 그대로 올렸다.

| 실행 조건 | navigationType | TTFB | FCP | LCP | LCP 원본 startTime | activationStart |
|---|---|---|---|---|---|---|
| 기본 실행 | `prerender` | 0 | 103.5 | 103.5 | 6240 | 6136.5 |
| `--enable-automation` | `prerender` | 0 | 106.5 | 106.5 | 6244 | 6137.5 |
| `--remote-debugging-port` | `prerender` | 0 | 109.9 | 109.9 | 6252 | 6142.1 |
| `--incognito` | `prerender` | 0 | 96.9 | 96.9 | 6220 | 6123.1 |

(단위 ms. 조건당 1회 측정이라 밀리초 단위 편차는 의미를 두지 않는다. 봐야 할 것은 열 사이의 자릿수 차이다.)

네 번 모두 라이브러리가 보고한 LCP는 100ms 안팎이고, 원본 `startTime`은 6.2초대다. 라이브러리는 이 보정을 알아서 한다. `node_modules`에 들어 있는 v5.1.0 소스를 열어보면 LCP와 FCP는 `Math.max(entry.startTime - activationStart, 0)`으로 값을 만들고, TTFB는 `Math.max(responseStart - activationStart, 0)`을 쓴다. 그리고 `document.prerendering`이 참이거나 `activationStart`가 0보다 크면 `navigationType`을 `'prerender'`로 붙인다.

TTFB 열이 전부 0인 것도 이 식의 결과다. prerender된 문서의 `responseStart`는 활성화보다 한참 앞이라 뺀 값이 음수가 되고, `Math.max`가 0으로 자른다. 이건 오류가 아니다. 사용자 입장에서 그 바이트는 이미 도착해 있었으니 대기 시간은 정말로 0에 가깝다. 다만 이 값이 필드 데이터에 섞여 들어가면 TTFB 분포가 통째로 왼쪽으로 밀린다. 그래서 집계할 때 `navigationType`으로 갈라 보지 않으면, 원인 모를 지표 개선을 놓고 회고를 하게 된다.

크롬 문서도 prerender가 지표에 미치는 영향을 이렇게 표현한다. "This can therefore also have a direct impact on a site's Core Web Vitals, with near zero LCP, reduced CLS (since any load CLS happens before the initial view), and improved INP (since the load should be completed before the user interacts)." (출처: [Prerender pages in Chrome for instant page navigations](https://developer.chrome.com/docs/web-platform/prerender-pages))

그래서 실제로 보낼 코드는 이 모양이 된다. 활성화를 기다리고, 라이브러리에 보정을 맡기고, 내비게이션 종류를 태그로 붙여 보낸다.

```js
import { onLCP, onFCP, onINP, onCLS, onTTFB } from 'web-vitals';

function whenActivated(fn) {
  if (document.prerendering) {
    document.addEventListener('prerenderingchange', () => fn(), { once: true });
  } else {
    fn();
  }
}

whenActivated(() => {
  const send = (m) => navigator.sendBeacon('/rum', JSON.stringify({
    metric: m.name,
    value: m.value,              // 라이브러리가 activationStart를 이미 뺀 값
    rating: m.rating,
    navType: m.navigationType,   // 'prerender'면 집계에서 갈라낸다
  }));
  [onTTFB, onFCP, onLCP, onINP, onCLS].forEach((fn) => fn(send));
});
```

핵심은 `navType`을 버리지 않는 것이다. 이 필드가 있으면 나중에 "prerender 비중이 늘어서 좋아진 것"과 "페이지가 실제로 빨라진 것"을 사후에 갈라낼 수 있다. 없으면 갈라낼 방법이 없다.

한 가지 더. 표에 없는 값이 하나 있다. `domContentLoadedEventStart` 46.8ms는 **어떤 보정도 받지 않는다.** Navigation Timing의 마크들은 여전히 prerender 시작 기준이다. 그러니 보정된 LCP와 보정되지 않은 "로드 완료 시간"을 한 대시보드에 나란히 두면, 두 숫자는 서로 다른 시계를 읽고 있는 셈이 된다. 이 어긋남은 [LCP를 앞당기는 리소스 우선순위 작업](/ko/blog/ko/lcp-image-preload-scanner-fetchpriority-2026)의 효과를 검증할 때 특히 성가시다. 개선한 만큼 숫자가 움직였는지를 판단할 기준선이 흔들리기 때문이다.

## Playwright로는 이 실험이 아예 안 됐다

처음에 나는 이 측정을 Playwright로 하려고 했다. 세 번 시도해서 세 번 다 실패했다.

`document.prerendering`은 계속 `false`였고, `activationStart`는 0이었고, `navigationType`은 `navigate`였다. prerender가 일어나지 않은 것이다. 규칙을 잘못 썼나 싶어 CDP의 `Preload` 도메인을 붙여 확인했다.

```json
{"ev":"Preload.preloadEnabledStateUpdated","d":{
  "disabledByPreference":false,"disabledByDataSaver":false,"disabledByBatterySaver":false,
  "disabledByHoldbackPrefetchSpeculationRules":false,
  "disabledByHoldbackPrerenderSpeculationRules":false}}
{"ev":"Preload.ruleSetUpdated","d":{"ruleSet":{"id":"49930.0", ... }}}
{"ev":"Preload.preloadingAttemptSourcesUpdated","d":{"preloadingAttemptSources":[
  {"key":{"action":"Prerender","url":"http://127.0.0.1:8899/next.html"}, ... }]}}
```

규칙은 정상 파싱됐다. 시도도 등록됐다. 어떤 항목도 비활성화돼 있지 않았다. 그런데 `prerenderStatusUpdated` 이벤트는 **한 건도 오지 않았다.** 시작조차 안 한 것이다.

원인을 좁히려고 실행 플래그를 하나씩 갈랐다. Playwright가 붙이는 `--disable-features` 목록 전체를 그대로 복사해 크롬을 직접 띄워봤다. prerender는 정상 작동했다. 그중 의심스러웠던 `RenderDocument`만 끈 경우, `OptimizationHints`만 끈 경우도 각각 작동했다. `--enable-automation`도, `--remote-debugging-port`도, `--incognito`도 전부 작동했다.

정직하게 적자면, 원인을 끝까지 특정하지 못했다. 플래그는 범인이 아니었다. 같은 바이너리를 Playwright가 **실제로 구동할 때만** prerender가 억제됐다. 그 이상은 이번 실행 시간 안에서 좁히지 못했다.

다만 실무적으로 필요한 결론은 이미 나와 있다. **Speculation Rules를 Playwright나 Puppeteer로 검증하지 마라.** 규칙이 멀쩡해도 "동작 안 함"이라는 거짓 음성을 받는다. 이건 [jsdom에서 axe-core를 돌렸을 때 실제 위반을 놓쳤던 일](/ko/blog/ko/axe-core-ci-a11y-jsdom-vs-browser-2026)과 정확히 같은 종류의 함정이다. 테스트 환경이 틀린 답을 조용히, 초록불로 준다.

내가 결국 쓴 방법은 두 가지다. 하나는 이 글의 하네스처럼 페이지가 스스로 `sendBeacon`으로 결과를 되쏘게 하고 크롬을 그냥 띄우는 것. 다른 하나는 크롬 문서가 권하는 손쉬운 확인법이다. "The easiest way to see if a page was prerendered (either in full or partially) is to open DevTools after the page is activated and type `performance.getEntriesByType('navigation')[0].activationStart` in the console." (출처: [Prerender pages in Chrome for instant page navigations](https://developer.chrome.com/docs/web-platform/prerender-pages))

## 이 측정이 말하지 않는 것

기대치를 깎아둘 자리다.

조건당 1회 측정이다. 로컬 머신 한 대에서 로컬 서버를 상대로 쟀다. 밀리초 단위 숫자는 벤치마크가 아니라 메커니즘을 보이기 위한 것이다. 6초라는 간격도 내가 스크립트로 만든 값이라 실제 사용자의 머뭇거림과는 무관하다. 다만 그 간격이 길수록 보정하지 않은 값의 오차도 정확히 그만큼 커진다.

prerender를 켠 페이지와 그냥 연 페이지의 속도를 비교하지도 않았다. 대조군으로 같은 페이지를 직접 열었을 때 LCP는 532ms였지만, 그 값에는 새 프로필로 브라우저 창을 띄우는 비용이 섞여 있다. 동일 조건 비교가 아니므로 "prerender가 5배 빠르다" 같은 말은 이 데이터로 할 수 없다.

그리고 이건 크롬 이야기다. Safari와 Firefox는 Speculation Rules 기반 prerender를 출시하지 않았다. 사용자 절반이 그 브라우저를 쓴다면 이 보정 로직은 절반에게만 발동한다.

마지막으로 순위 이야기는 하지 않는다. prerender는 순위 요소가 아니고, 이 글의 어떤 내용도 검색 성과를 보장하지 않는다. 여기서 다룬 것은 사용자 체감과 그것을 정확히 재는 방법뿐이다. Core Web Vitals에 대해 크롬 문서가 쓴 표현을 그대로 옮기면 "For Core Web Vitals, measured by Chrome through the Chrome User Experience Report, these are intended to measure the user experience." (출처: [Prerender pages in Chrome for instant page navigations](https://developer.chrome.com/docs/web-platform/prerender-pages)) 재는 대상은 사용자 경험이지 문서의 내부 시계가 아니다.

## 정리: 활성화 시각을 빼고 나서 숫자를 믿어라

Speculation Rules를 도입하기 전에, 계측 쪽을 먼저 손봐야 한다. 순서를 뒤집으면 개선을 퇴행으로 오독하게 된다.

체크리스트는 여섯 줄이다.

1. 직접 짠 `PerformanceObserver` 대신 web-vitals v5 이상을 쓴다. 굳이 직접 짜야 한다면 LCP·FCP·TTFB 모두에 `Math.max(value - activationStart, 0)`을 적용한다.
2. `activationStart`는 **보고하는 순간에** 읽는다. 로드 시점에 변수로 굳혀두지 않는다.
3. 분석 초기화와 비콘 전송은 `document.prerendering` 확인 후 `prerenderingchange`까지 미룬다.
4. RUM 집계를 `navigationType === 'prerender'`로 분리한다. 섞으면 TTFB가 0에 몰리고 LCP가 비정상적으로 좋아 보인다.
5. `domContentLoadedEventStart`·`loadEventStart` 같은 Navigation Timing 마크는 보정되지 않는다는 점을 대시보드에 명시한다. 보정된 지표와 나란히 두지 않는다.
6. Speculation Rules 동작 검증은 브라우저 자동화 도구 대신, 페이지가 스스로 결과를 되쏘는 하네스나 DevTools의 Application 패널로 한다.

이 여섯 가지는 prerender를 쓰지 않는 사이트에서도 무해하다. 지금 넣어두면, 나중에 도입하는 날 대시보드가 흔들리지 않는다.

RUM 파이프라인이 prerender나 bfcache 같은 페이지 수명주기 변화를 제대로 반영하고 있는지 확인하고 싶거나, Core Web Vitals 계측을 새로 설계해야 하는 상황이라면 개인적으로 상담과 구현 의뢰를 받고 있다. [프로필](/ko/about)에 연락 경로를 열어두었다.
