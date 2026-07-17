---
title: '클릭 한 번에 264ms — 같은 일을 쪼갰더니 56ms, INP 실측기'
description: 'INP는 2024년 FID를 대체한 Core Web Vitals 응답성 지표다. 같은 220ms 작업을 통짜로 돌릴 때와 scheduler.yield로 쪼갤 때를 Event Timing API로 측정했다. 264ms(개선 필요)가 56ms(양호)로 떨어지는 과정을 코드와 로그로 기록한다.'
pubDate: '2026-07-16'
heroImage: '../../../assets/blog/inp-yielding-measure-2026/hero.png'
tags:
  - Core Web Vitals
  - INP
  - 웹성능
relatedPosts:
  - slug: cls-layout-shift-reserve-space-measure-2026
    score: 0.78
    reason:
      ko: CLS는 화면이 밀리지 않느냐를, INP는 눌렀을 때 반응이 빠르냐를 잰다. 둘 다 PerformanceObserver로 브라우저가 직접 뱉는 숫자를 받아 고치는 방식이라, 측정 코드의 뼈대가 거의 똑같다. 한 편으로 재는 법을 익히면 다른 편이 쉬워진다.
      ja: CLSは画面がずれないか、INPは押したとき速く返るかを測る。どちらもPerformanceObserverでブラウザが吐く数字を受け取って直す流儀で、計測コードの骨格がほぼ同じ。片方を覚えるともう片方が楽になる。
      en: CLS measures whether the screen stays put; INP measures whether a tap responds fast. Both read numbers straight from a PerformanceObserver, so the measurement scaffolding is nearly identical — learn one and the other comes cheap.
      zh: CLS 测画面是否跳动，INP 测点击后是否快速响应。两者都用 PerformanceObserver 接收浏览器直接吐出的数字来修复，测量代码的骨架几乎相同，学会一个另一个就顺手了。
  - slug: lcp-image-preload-scanner-fetchpriority-2026
    score: 0.71
    reason:
      ko: LCP는 로딩이 끝나는 속도를, INP는 로딩 이후 상호작용의 속도를 본다. Core Web Vitals 세 지표 중 앞과 뒤를 맡는 짝이라, LCP를 잡았다면 다음 병목은 대개 INP다.
      ja: LCPは読み込みが終わる速さ、INPは読み込み後の操作の速さを見る。Core Web Vitals三指標の前と後ろを担う対で、LCPを片づけたら次のボトルネックはたいていINPだ。
      en: LCP watches how fast loading finishes; INP watches how fast interactions feel afterward. They are the front and back of the Core Web Vitals trio — once LCP is handled, INP is usually the next bottleneck.
      zh: LCP 看加载多快结束，INP 看加载之后交互多快。它们是 Core Web Vitals 三指标的前后两端，搞定 LCP 后，下一个瓶颈通常就是 INP。
  - slug: a11y-lighthouse-audit-fix-2026
    score: 0.55
    reason:
      ko: 느린 응답은 성능 문제이자 접근성 문제다. 눌렀는데 몇백 밀리초 동안 아무 반응이 없으면 인지 부하가 있는 사용자는 같은 버튼을 반복해 누른다. 그 글의 Lighthouse 실측 흐름이 여기서도 그대로 쓰인다.
      ja: 遅い応答は性能の問題であると同時にアクセシビリティの問題でもある。押しても数百ミリ秒無反応だと、認知負荷のある利用者は同じボタンを何度も押す。あちらのLighthouse実測の流れがここでも生きる。
      en: A slow response is a performance problem and an accessibility problem at once. When a tap does nothing for a few hundred milliseconds, users with cognitive load press the same button again. The Lighthouse measure-and-fix flow from that post applies here too.
      zh: 迟缓的响应既是性能问题，也是无障碍问题。点了几百毫秒没反应，有认知负荷的用户会反复点同一个按钮。那篇的 Lighthouse 实测流程在这里同样适用。
---

로그 한 줄부터 보자.

```text
click   INP= 264ms  (input 7 + proc 223 + present 35)
```

버튼을 한 번 눌렀는데 화면이 다시 그려지기까지 264밀리초가 걸렸다. 손가락이 화면에 닿고 나서 눈에 뭔가 바뀌기까지, 4분의 1초 넘게 아무 일도 없었다는 뜻이다. 같은 버튼의 코드를 손봐서 다시 재니 56ms로 떨어졌다. CPU가 한 일의 총량은 똑같았다. 바뀐 건 "일을 언제 멈추고 화면을 그리느냐" 하나뿐이었다.

LCP와 CLS는 다들 챙긴다. 로딩이 빠른지, 화면이 밀리지 않는지는 눈에 잘 띄니까. 그런데 로딩이 끝난 뒤 버튼을 눌렀을 때의 반응 속도, 즉 INP는 아직 뒷전인 팀이 많다. 나도 그랬다. 이번엔 말로만 하지 않고 브라우저가 직접 뱉는 숫자를 받아 재봤다. 아래 로그와 표는 전부 크롬 150에서 Event Timing API로 뽑은 실제 값이다.

## INP가 재는 것: 클릭 한 번을 세 토막으로

INP는 Interaction to Next Paint, 우리말로 옮기면 "상호작용에서 다음 페인트까지"다. 사용자가 뭔가를 누르거나 입력한 순간부터, 그 결과가 화면에 그려지는 프레임까지의 지연을 잰다. 여기서 핵심은 하나의 상호작용이 통짜 숫자가 아니라 세 구간으로 쪼개진다는 점이다. [web.dev 공식 문서](https://web.dev/articles/inp)가 정의하는 세 구간은 이렇다.

1. <strong>입력 지연(input delay)</strong>: 사용자가 누른 순간부터, 그에 묶인 콜백이 처음 실행되기까지의 시간. 이때 메인 스레드가 다른 작업으로 막혀 있으면 이 값이 커진다.
2. <strong>처리 시간(processing duration)</strong>: 이벤트 콜백들이 실제로 도는 시간. 여러분이 붙인 클릭 핸들러가 무거우면 여기가 커진다.
3. <strong>표시 지연(presentation delay)</strong>: 콜백이 다 끝난 뒤, 다음 프레임이 실제로 화면에 그려지기까지의 시간.

세 구간을 더한 값이 그 상호작용의 지연이고, INP는 방문 내내 일어난 상호작용 중 (거의) 가장 느린 값을 대표로 보고한다. 여기가 이전 지표였던 FID와 결정적으로 다르다. FID는 첫 상호작용의 "입력 지연"만 쟀다. 페이지에서 처음 누른 버튼 하나의 반응만 봤다는 얘기다. INP는 클릭·탭·키 입력 전부를 관찰하고, 그중 최악에 가까운 걸 대표로 삼는다. 첫인상이 아니라 체감 전체를 본다.

임계값은 [web.dev 기준](https://web.dev/articles/inp)으로 필드 데이터의 75번째 백분위에서 이렇게 나뉜다.

| INP (p75) | 판정 | 체감 |
|---|---|---|
| 200ms 이하 | 양호(good) | 눌렀을 때 바로 반응한다 |
| 200ms 초과 ~ 500ms 이하 | 개선 필요 | 살짝 끊긴다, 느리다 싶다 |
| 500ms 초과 | 나쁨(poor) | 눌렀는데 먹통인가 싶어 다시 누른다 |

무엇이 "상호작용"으로 잡히는지도 헷갈리기 쉬운 지점이다. 탭·클릭·키 입력은 INP에 포함되지만, 마우스 호버나 스크롤은 상호작용으로 세지 않는다. 스크롤이 버벅여도 그건 INP가 아니라 다른 렌더링 문제다. 그래서 "우리 페이지는 스크롤이 부드러운데 INP가 왜 나쁘지"라는 질문이 나온다. 답은, INP가 보는 건 스크롤이 아니라 여러분이 누른 버튼·링크·입력창의 반응이기 때문이다. 이 구분을 흐리면 엉뚱한 곳을 최적화하게 된다.

날짜도 짚어두자. INP는 2024년 3월 12일에 Core Web Vitals의 정식 지표가 되면서 FID를 대체했고([web.dev 공지](https://web.dev/blog/inp-cwv-march-12)), FID는 그해 9월 9일자로 Chrome 도구에서 제거됐다. 즉 지금 "응답성"을 대표하는 CWV 지표는 INP 하나다.

## 왜 지금, 웹 개발자가 INP를 직접 재야 하나

INP를 챙길 이유는 두 가지다. 하나는 사람, 하나는 검색이다.

사람 쪽은 분명하다. 로딩이 아무리 빨라도, 버튼을 눌렀을 때 300ms씩 먹통이 되는 페이지는 "느린 사이트"로 기억된다. 특히 이건 접근성 문제와 겹친다. 반응이 없으면 인지 부하가 있는 사용자나 손 떨림이 있는 사용자는 같은 버튼을 반복해서 누르고, 그 사이 폼이 두 번 제출되기도 한다. 응답 속도를 [Lighthouse로 접근성을 실측해 고친 이야기](/ko/blog/ko/a11y-lighthouse-audit-fix-2026)와 같은 결로 봐야 하는 이유다.

검색 쪽은 정직하게 말해야 한다. Core Web Vitals는 Google의 페이지 경험 신호의 일부이고 INP도 그 안에 있다. 다만 Google은 이걸 "비슷하게 관련성 높은 페이지들 사이의 판가름 요소" 정도로 설명하지, 관련성을 뒤집는 결정타로 말하지 않는다. <strong>INP를 200ms 밑으로 내렸다고 순위가 오른다는 보장은 없다.</strong> 이건 내 의견이 아니라 공식 입장이 그렇다. 그래도 재고 고칠 값어치가 있는 이유는, 같은 노력이 검색 신호와 실제 사용자 체감을 동시에 건드리기 때문이다. 한쪽만 봐도 남는 장사다.

여기서 한 가지 성질을 기억해야 한다. INP는 근본적으로 필드(field) 지표다. 실제 사용자의 크롬에서 수집된 데이터(CrUX)로 판정된다. 랩(lab) 도구에서도 추정할 수는 있지만, 그 값은 "당신이 어떤 상호작용을 눌렀느냐"에 전적으로 달려 있다. 그래서 이번 실험도 "내가 무엇을 눌렀는지"를 명확히 통제하고, 그 조건에서 나온 숫자로만 이야기한다. 실제 방문자의 느린 기기까지 대신할 수는 없다는 뜻이다. 이 한계는 뒤에서 다시 짚는다. 이 성질은 [LCP를 실측한 글](/ko/blog/ko/lcp-image-preload-scanner-fetchpriority-2026)에서 다룬 "로딩 완료 속도"와 짝을 이룬다. LCP가 앞을 맡고 INP가 뒤를 맡는 셈이다. 같은 Core Web Vitals 묶음에서 [화면 밀림(CLS)을 실측해 잡은 기록](/ko/blog/ko/cls-layout-shift-reserve-space-measure-2026)과 [렌더 비용을 CSS 한 줄로 줄인 content-visibility 실험](/ko/blog/ko/content-visibility-auto-render-cost-measure-2026)도 같은 태도로 다뤘다.

## 샌드박스: 같은 일을, 두 방식으로

실험은 단순하게 짰다. 버튼 두 개를 둔 정적 HTML 페이지 하나. 둘 다 정확히 220ms 분량의 계산을 한다. 차이는 그 220ms를 어떻게 쓰느냐뿐이다.

첫 번째 버튼은 통짜로 돌린다. 클릭 핸들러 안에서 220ms 동안 메인 스레드를 붙잡고 놔주지 않는다. 실무에서 흔한 패턴이다. 클릭 한 번에 목록을 정렬하고, 로컬 스토리지를 훑고, 차트를 다시 그리는 걸 한 함수 안에서 다 해버리는 경우.

```javascript
function busy(ms) {
  const end = performance.now() + ms;
  while (performance.now() < end) { /* 메인 스레드 점유 */ }
}

document.getElementById('blocking').addEventListener('click', () => {
  busy(220);                        // 한 덩어리로 220ms
  document.body.style.background = '#fff7ed';
});
```

두 번째 버튼은 같은 220ms를 20ms짜리 열한 조각으로 쪼개고, 조각 사이마다 메인 스레드를 브라우저에 돌려준다.

```javascript
const yield_ = () =>
  ('scheduler' in window && 'yield' in scheduler)
    ? scheduler.yield()                       // 지원 브라우저: 우선순위 있는 재개
    : new Promise(r => setTimeout(r, 0));      // 미지원: setTimeout 폴백

document.getElementById('yielding').addEventListener('click', async () => {
  for (let i = 0; i < 11; i++) {
    busy(20);
    await yield_();                            // 조각마다 양보
  }
  document.body.style.background = '#ecfdf5';
});
```

측정은 브라우저에 맡겼다. 필드에서 INP를 수집하는 것과 똑같은 도구, Event Timing API다. `PerformanceObserver`로 `event` 타입을 관찰하면, 실제 사용자 상호작용에는 `interactionId`가 붙어서 넘어온다. 여기서 세 구간을 직접 계산할 수 있다.

```javascript
new PerformanceObserver((list) => {
  for (const e of list.getEntries()) {
    if (!e.interactionId) continue;                 // 진짜 상호작용만
    const inputDelay    = e.processingStart - e.startTime;
    const processing    = e.processingEnd   - e.processingStart;
    const presentation  = (e.startTime + e.duration) - e.processingEnd;
    console.log(e.name, Math.round(e.duration), inputDelay, processing, presentation);
  }
}).observe({ type: 'event', durationThreshold: 16, buffered: true });
```

이 페이지를 크롬 150에서 열고, 각 버튼을 세 번씩 실제로 눌렀다. 자동화 스크립트로 만든 가짜 클릭은 `interactionId`가 붙지 않아서 이 실험에 안 잡힌다. 그래서 신뢰된(trusted) 실제 클릭으로만 눌렀다.

## 로그를 읽는 법

<img src="../../../assets/blog/inp-yielding-measure-2026/event-timing-log.png" alt="Event Timing API 로그. blocking 버튼 클릭은 click INP=264ms(input 7 + proc 223 + present 35), 376ms, 256ms를 기록했고, yielding 버튼 클릭은 56ms, 48ms, 56ms를 기록했다." />

위는 페이지에 그대로 찍힌 실제 로그다. 통짜 버튼(위쪽 세 묶음)과 쪼갠 버튼(아래쪽 세 묶음)이 확연히 갈린다. 대표값을 표로 정리하면 이렇다.

| 방식 | 대표 INP | 입력 지연 | 처리 | 표시 지연 | 판정 |
|---|---|---|---|---|---|
| 통짜 220ms 핸들러 | 264ms | 7 | 223 | 35 | 개선 필요 |
| 통짜 220ms 핸들러 (최악) | 376ms | 1 | 220 | 155 | 개선 필요 |
| scheduler.yield로 쪼갬 | 56ms | 0 | 21 | 35 | 양호 |
| scheduler.yield로 쪼갬 | 48ms | 0 | 20 | 28 | 양호 |

통짜 쪽은 `proc`(처리 시간)이 220ms대로 통째로 잡혔다. 클릭 핸들러가 다 끝날 때까지 브라우저가 프레임을 못 그린 것이다. 세 번 다 200ms를 넘겨 "개선 필요" 구간에 떨어졌다.

쪼갠 쪽은 한 이벤트에 잡힌 처리 시간이 20ms 남짓이다. 여전히 220ms 분량의 계산을 다 하는데도, 첫 조각이 끝나고 브라우저에 양보하는 순간 화면이 그려질 틈이 생겨 상호작용이 56ms에 마감됐다. 같은 일, 4.7배 빠른 응답. CPU가 게을러진 게 아니라, 화면 그릴 기회를 뺏지 않은 것뿐이다.

로그를 보면 재미있는 지점이 하나 더 있다. 하나의 클릭은 `pointerdown`, `pointerup`, `click` 세 이벤트가 같은 `interactionId`로 묶인다. 통짜 버튼에서는 `pointerup`이 처리 시간 0인데도 표시 지연이 258ms로 잡혔다. 계산은 `click` 핸들러가 했지만, 그게 메인 스레드를 붙잡는 바람에 `pointerup` 다음 프레임도 같이 밀린 것이다. INP는 이렇게 묶인 이벤트 중 가장 긴 하나를 그 상호작용의 대표로 삼는다. 그래서 "핸들러 자체는 빠른데 왜 INP가 높지?"라는 상황이 생긴다. 답은 대개 근처에서 메인 스레드를 붙잡은 다른 작업이다.

## 실무에서 INP를 갉아먹는 흔한 범인

내 샌드박스는 220ms 루프를 일부러 심어서 원인이 뻔했다. 실제 사이트에서는 이 220ms가 한 군데가 아니라 여러 조각으로 흩어져 있어서 찾기가 더 어렵다. 재보면서, 그리고 여러 페이지를 들여다보면서 반복해서 마주친 범인들을 정리해둔다.

<strong>첫째, 하이드레이션과 리렌더.</strong> React나 Vue로 만든 페이지는 로딩 직후 자바스크립트가 DOM에 이벤트를 붙이고 상태를 맞추는 하이드레이션을 한다. 이 작업이 무거우면, 사용자가 그 사이에 누른 클릭은 하이드레이션이 끝날 때까지 기다린다. 입력 지연이 통째로 커지는 전형적인 경우다. 여기에 클릭 한 번이 컴포넌트 트리 절반을 다시 그리는 리렌더까지 얹히면 처리 시간도 같이 부푼다. "빠른 프레임워크"라는 말에 방심하면 안 되는 지점이다.

<strong>둘째, 서드파티 태그.</strong> 분석 스크립트, 광고, 채팅 위젯, 히트맵 도구. 이것들은 대개 남의 코드라 우리가 쪼갤 수 없고, 아무 때나 메인 스레드에서 자기 일을 한다. 사용자가 하필 그 순간 버튼을 누르면 입력 지연이 튄다. 우리 코드가 아무리 깨끗해도 INP가 나쁘게 잡히는 흔한 이유다. 이건 [자바스크립트로 콘텐츠를 나중에 끼워 넣는 CSR 습관](/ko/blog/ko/ai-crawlers-dont-render-javascript-csr-2026)이 크롤러에겐 빈 페이지를, 사용자에겐 느린 반응을 만드는 것과 같은 뿌리다. 나중에 메인 스레드에서 하는 일은 언제나 대가가 있다.

<strong>셋째, 이벤트 위임 뒤의 무거운 공통 핸들러.</strong> 문서 최상단에 리스너 하나를 붙여 모든 클릭을 받는 패턴은 편하지만, 그 핸들러가 매 클릭마다 무거운 분기·계산을 하면 클릭 전부가 느려진다.

<strong>넷째, 지나치게 큰 DOM.</strong> 노드가 수만 개인 페이지는 클릭 한 번에 일어나는 스타일 재계산과 레이아웃 비용이 그만큼 커진다. 이건 표시 지연으로 나타나기 쉽다. 콜백은 금방 끝났는데 브라우저가 그 프레임을 그리느라 낑낑대는 상황이다. 무한 스크롤 목록이나 거대한 테이블을 쓴다면 가상화(virtualization)로 실제 그리는 노드 수를 줄이는 걸 먼저 본다.

핵심은, INP가 높다고 곧장 "내 클릭 핸들러가 무겁다"로 단정하지 않는 것이다. 위 로그에서 봤듯 계산은 다른 데서 하고 지연은 엉뚱한 이벤트에 찍힐 수 있다. 그래서 세 구간 중 어디가 큰지를 먼저 봐야 처방이 맞는다. 원인을 눈으로 확인하지 않고 짐작으로 손대면, 멀쩡한 핸들러만 계속 다듬으면서 정작 진짜 병목인 서드파티 태그는 그대로 두는 헛수고를 하게 된다. 측정이 먼저이고 수정은 그다음이다.

## scheduler.yield로 긴 작업을 쪼개기

`scheduler.yield()`는 이름 그대로 메인 스레드를 브라우저에 양보한다. 브라우저가 밀린 렌더링이나 대기 중인 입력을 처리할 틈을 준 뒤, 원래 함수의 그 자리에서 실행을 이어간다. 50ms를 넘는 작업은 [web.dev 정의상](https://web.dev/articles/optimize-long-tasks) 긴 작업(long task)이고, 긴 작업은 그 시간 내내 입력을 받을 수 없다. 그래서 긴 작업을 조각내면 입력 지연과 표시 지연이 같이 줄어든다.

`setTimeout(fn, 0)`으로도 양보는 된다. 다만 차이가 있다. `scheduler.yield()`로 넘긴 나머지 작업은 새 작업들보다 살짝 높은 우선순위 큐에 들어가, 도중에 끼어든 무관한 작업에 밀리지 않고 이어진다. `setTimeout`은 그 보장이 없어서, 양보한 사이 다른 타이머가 먼저 껴들 수 있다.

주의할 한계도 정직하게. `scheduler.yield()`는 아직 [Baseline이 아니다](https://developer.mozilla.org/en-US/docs/Web/API/Scheduler/yield). 널리 쓰이는 브라우저 전부에서 되는 건 아니라는 뜻이다. 그래서 위 코드처럼 점진적 향상(progressive enhancement)으로 감싸는 게 맞다. 지원하면 우선순위 있는 재개를 쓰고, 없으면 `setTimeout` 폴백으로도 최소한 "양보"라는 효과는 얻는다. 미지원 브라우저에서 앱이 깨지지 않게, 기능 감지를 반드시 앞에 둔다.

한 가지 더. 쪼개는 게 항상 정답은 아니다. 진짜 무거운 계산이라면 애초에 메인 스레드에서 빼는 게 낫다. Web Worker로 옮기거나, 결과를 미리 계산해두거나, 아예 그 시점에 그 일을 안 하는 방법을 먼저 본다. `scheduler.yield()`는 "메인 스레드에서 꼭 해야 하는 일을 잘게 나눠 응답성을 지키는" 도구지, 무거운 일을 가볍게 만드는 마법이 아니다.

## 바로 적용할 체크리스트

내가 이번에 재보고 정리한, 오늘 당장 손댈 수 있는 순서다.

- <strong>먼저 필드부터 본다.</strong> Search Console의 CWV 리포트나 CrUX에서 실제 INP p75를 확인한다. 랩 수치로 시작하면 "내 빠른 노트북에선 괜찮은데 왜 필드는 나쁘지"에 빠진다.
- <strong>느린 상호작용을 특정한다.</strong> DevTools의 Performance 패널에서 문제 상호작용을 녹화하거나, 위처럼 Event Timing API를 프로덕션에 붙여 `interactionId`가 있는 이벤트의 세 구간을 로깅한다. 입력 지연이 큰지, 처리가 큰지, 표시가 큰지에 따라 처방이 다르다.
- <strong>입력 지연이 크면</strong> 그 순간 메인 스레드를 붙잡는 다른 작업(무거운 초기화, 서드파티 스크립트, 타이머)을 찾아 미루거나 쪼갠다.
- <strong>처리 시간이 크면</strong> 핸들러 자체가 무겁다는 뜻이다. 긴 작업을 `scheduler.yield()`로 나누고, 시급하지 않은 부분(로깅, 분석 전송)은 상호작용 이후로 미룬다.
- <strong>표시 지연이 크면</strong> 콜백에서 레이아웃을 뒤흔들거나 DOM을 과하게 건드리지 않았는지 본다. 한 프레임에 그릴 게 너무 많으면 표시가 밀린다.
- <strong>피할 것</strong>: 클릭 한 번에 모든 걸 동기로 처리하기, 상호작용 직후 즉시 무거운 리렌더 걸기, 기능 감지 없이 `scheduler.yield()`를 곧바로 호출하기.

## 정직한 한계

이 실험은 크롬 150, 데스크톱, 빠른 기기에서 나온 랩 측정이다. 필드의 INP는 저사양 안드로이드까지 포함해 훨씬 넓게 퍼진다. 그러니 여기 숫자(264ms→56ms)는 "쪼개면 응답이 빨라진다"는 방향과 그 원리를 보여주는 데는 충분하지만, 여러분 사이트의 필드 INP를 예측하는 값은 아니다.

그 간극을 조금이라도 좁히려면, 랩에서 잴 때 실제 기기 조건을 흉내 내는 게 좋다. DevTools의 Performance 패널에는 CPU 스로틀링이 있다. 4배나 6배 느리게 걸어두고 같은 상호작용을 재보면, 내 빠른 노트북에서는 56ms로 나오던 것이 훨씬 크게 잡힌다. 그 상태에서도 통짜 방식과 쪼갠 방식의 상대적 차이는 그대로 유지되는지, 오히려 저사양에서 그 차이가 더 벌어지는지를 확인하면 판단이 단단해진다. 느린 기기일수록 220ms 통짜 블록의 대가가 커지기 때문이다. 그래도 스로틀링은 어디까지나 근사다. 최종 판정은 필드 데이터로 해야 한다는 원칙은 바뀌지 않는다. 그리고 앞서 말했듯, INP를 양호로 만든다고 검색 순위가 오른다는 보장은 없다. Core Web Vitals는 관련성을 이긴 적이 없다. 이 두 가지를 걷어내고 남는 진짜 이득은 하나다. 여러분 사이트를 실제로 쓰는 사람이 버튼을 눌렀을 때, 264ms가 아니라 56ms 만에 화면이 반응한다는 것. 그거면 충분히 잴 값어치가 있다.

---

구조화 데이터를 서버사이드로 확실히 내보내거나, 기존 사이트의 Core Web Vitals와 접근성을 실측으로 점검하고 싶다면 개인적으로 상담과 구현 의뢰를 받는다. 이런 "재보고 고치는" 작업이 필요하면 프로필의 문의 경로로 연락 주면 된다.
