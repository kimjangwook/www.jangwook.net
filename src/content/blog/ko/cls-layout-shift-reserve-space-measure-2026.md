---
title: '버튼을 누르려는 순간 화면이 밀렸다 — CLS 0.559를 0.014로 내린 실측 기록'
description: '로딩 중 레이아웃이 밀리는 건 취향 문제가 아니라 측정 가능한 지표다. 같은 페이지를 두 가지로 만들어 layout-shift PerformanceObserver로 CLS를 재고, 이미지 크기 예약과 슬롯 확보만으로 0.559(POOR)를 0.014(GOOD)까지 내린 기록이다.'
pubDate: '2026-07-15'
heroImage: '../../../assets/blog/cls-layout-shift-reserve-space-measure-2026/hero.png'
tags:
  - Core Web Vitals
  - CLS
  - 웹성능
  - 접근성
relatedPosts:
  - slug: lcp-image-preload-scanner-fetchpriority-2026
    score: 0.74
    reason:
      ko: 그 글은 브라우저가 이미지를 언제 발견하느냐(LCP)를 실측했고, 이 글은 그 이미지가 자리를 잡느냐(CLS)를 잰다. 같은 히어로 이미지가 두 지표를 동시에 흔든다는 점에서 짝으로 읽으면 Core Web Vitals의 앞뒤가 맞춰진다.
      ja: あちらはブラウザが画像をいつ発見するか(LCP)を実測し、こちらはその画像が場所を確保するか(CLS)を測る。同じヒーロー画像が両方の指標を揺らすので、対で読むとCore Web Vitalsの前後がつながる。
      en: That post measured when the browser discovers the image (LCP); this one measures whether that image holds its place (CLS). The same hero image moves both metrics, so reading them as a pair completes the Core Web Vitals picture.
      zh: 那篇实测浏览器何时发现图片（LCP），这篇测同一张图是否守住位置（CLS）。同一张主图同时牵动两个指标，成对阅读能把 Core Web Vitals 的前后串起来。
  - slug: ai-crawlers-dont-render-javascript-csr-2026
    score: 0.58
    reason:
      ko: 자바스크립트로 콘텐츠를 나중에 끼워 넣는 습관이 크롤러에겐 "안 보이는 콘텐츠"를, 사용자에겐 "밀리는 화면"을 만든다. 이 글의 프로모 배너 삽입 사례가 그쪽 CSR 문제와 정확히 같은 뿌리다.
      ja: JSで後からコンテンツを差し込む癖は、クローラーには「見えないコンテンツ」を、ユーザーには「ずれる画面」を作る。この記事のバナー挿入の例は、あちらのCSR問題と同じ根だ。
      en: Injecting content late with JavaScript hides it from crawlers and shifts it for users. The promo-banner example here shares the exact root cause with that CSR article.
      zh: 用 JS 事后插入内容，对爬虫是"看不见的内容"，对用户是"跳动的页面"。本文的横幅插入例子，与那篇 CSR 问题同根同源。
  - slug: a11y-lighthouse-audit-fix-2026
    score: 0.56
    reason:
      ko: 레이아웃 이동은 성능 지표이자 접근성 문제다. 운동 장애가 있는 사용자에게 밀리는 버튼은 오조작으로 직결된다. 그 글의 Lighthouse 실측 워크플로우가 여기서도 그대로 쓰인다.
      ja: レイアウトのずれは性能指標であると同時にアクセシビリティの問題でもある。運動機能に制約のある利用者にとって、ずれるボタンは誤操作に直結する。あちらのLighthouse実測ワークフローがここでも生きる。
      en: Layout shift is a performance metric and an accessibility problem at once — a moving button means mis-taps for users with motor impairments. The Lighthouse measure-and-fix workflow from that post applies directly here.
      zh: 布局偏移既是性能指标，也是无障碍问题——对有运动障碍的用户，跳动的按钮意味着误触。那篇的 Lighthouse 实测工作流在这里同样适用。
---

결제 버튼을 누르려는데 바로 그 순간 화면이 아래로 쓱 밀려서, 손가락이 엉뚱한 링크를 누른 적 있을 것이다. 위쪽 어딘가에서 이미지가 뒤늦게 로드됐거나, 배너 하나가 끼어들었기 때문이다. 짜증은 잠깐이지만 이건 감정의 문제가 아니다. 구글은 이 "밀림"을 <strong>Cumulative Layout Shift(CLS)</strong>라는 숫자로 재고, 그 숫자는 페이지가 좋은지 나쁜지를 가르는 기준이 된다.

오늘은 같은 HTML 페이지를 두 벌 만들었다. 한 벌은 흔한 실수를 그대로 담았고, 다른 한 벌은 그걸 고쳤다. 그리고 브라우저가 CLS를 계산할 때 쓰는 바로 그 API로 둘을 재봤다. 결과부터 말하면 0.559에서 0.014로 떨어졌다. 아래 숫자는 전부 그 샌드박스에서 나온 실제 측정값이다.

## CLS가 재는 건 "총 이동량"이지 "이동 횟수"가 아니다

먼저 토대부터. Core Web Vitals는 세 지표로 이뤄진다. LCP(가장 큰 요소가 언제 그려지는가), [INP(상호작용에 얼마나 빨리 반응하는가)](/ko/blog/ko/inp-yielding-measure-2026/), 그리고 CLS(화면이 얼마나 밀리는가)다. 앞의 둘은 시간(밀리초)이지만 CLS만은 단위 없는 점수다. 이 점 때문에 CLS를 오해하기 쉽다.

CLS는 페이지가 살아있는 동안 발생한 <strong>예상치 못한 레이아웃 이동</strong>을 모아 계산한다. 개별 이동 하나의 점수는 두 값을 곱해서 나온다. 화면에서 얼마나 넓은 영역이 움직였는가(impact fraction), 그리고 그 영역이 얼마나 멀리 움직였는가(distance fraction). 뷰포트의 절반을 차지하는 요소가 뷰포트 높이의 절반만큼 아래로 밀리면 대략 0.5 × 0.5 = 0.25가 된다. 작은 각주 하나가 몇 픽셀 움직이는 것과, 화면 절반이 통째로 내려앉는 건 전혀 다른 무게를 갖는다.

여기서 중요한 오해 하나. CLS는 "이동이 몇 번 일어났나"를 세지 않는다. 이동 한 번이 화면 전체를 밀면 그 한 번으로 POOR가 된다. 반대로 자잘한 이동이 열 번 일어나도 각각이 미세하면 합이 작을 수 있다. 그리고 결정적으로, 사용자가 클릭이나 탭을 한 <strong>직후 500밀리초 안</strong>에 일어난 이동은 계산에서 제외된다. 사용자가 "펼치기"를 눌러서 아코디언이 열리는 건 예상된 이동이니까. `layout-shift` 엔트리의 `hadRecentInput` 플래그가 이걸 구분한다.

기준선은 구글 공식 문서에 정해져 있다. <strong>0.1 이하면 GOOD, 0.25를 넘으면 POOR</strong>, 그 사이는 개선이 필요한 구간이다([web.dev, Cumulative Layout Shift](https://web.dev/articles/cls)). 이 0.1이라는 숫자는 임의로 정한 게 아니라, 내부 테스트에서 0.15 이상의 이동은 사람들이 일관되게 "거슬린다"고 느꼈고 0.1 이하는 눈에 띄어도 심하지 않았다는 근거에서 나왔다([web.dev, thresholds](https://web.dev/articles/defining-core-web-vitals-thresholds)).

## 같은 페이지를 두 벌로 — 흔한 실수를 일부러 심었다

재현이 없으면 주장도 없다. 샌드박스에 두 개의 정적 HTML을 만들었다. 레시피 갤러리처럼 이미지와 텍스트가 섞인 평범한 페이지다.

`bad.html`에는 실무에서 가장 자주 보는 세 가지 실수를 그대로 넣었다.

```html
<!-- 실수 1: 이미지에 크기 정보가 없다 → 로드되며 아래를 밀어냄 -->
<style>.hero img{width:100%}</style>
<div class="hero"><img src="cat.svg" alt="hero"></div>

<div class="card"><button>Save recipe</button></div>

<script>
  // 실수 2: 500ms 뒤 상단에 배너 삽입 → 아래 모든 것이 내려감
  setTimeout(() => {
    const d = document.createElement('div');
    d.textContent = 'Subscribe now';
    document.body.insertBefore(d, document.body.firstChild);
  }, 500);
  // 실수 3: 900ms 뒤 히어로 위에 공지 삽입
  setTimeout(() => { /* 히어로 위에 <p> 삽입 */ }, 900);
</script>
```

핵심은 이 셋이 별개의 버그가 아니라 <strong>같은 실수의 세 얼굴</strong>이라는 점이다. 브라우저에게 "여기에 이만큼 공간을 잡아둬"라고 미리 말하지 않은 것. 이미지는 다운로드가 끝나야 자기 크기를 알고, 배너와 공지는 나중에 자바스크립트가 만들어 낸다. 브라우저는 그 순간이 오기 전까지 그 자리를 0픽셀로 취급하다가, 콘텐츠가 도착하면 갑자기 공간을 벌리며 아래를 전부 밀어낸다.

`good.html`은 내용과 타이밍이 완전히 똑같다. 배너도 500ms에, 공지도 900ms에 들어온다. 딱 하나, 브라우저에게 미리 자리를 알려주는 것만 다르다. 이 대조가 중요하다. "콘텐츠를 늦게 넣지 마라"가 아니라 "늦게 넣되 자리를 비워둬라"가 이 실험의 논지다.

## 브라우저가 CLS를 세는 그 API로 직접 쟀다

측정에는 Lighthouse 점수 같은 요약값 대신, 원자료를 그대로 뽑았다. `PerformanceObserver`로 `layout-shift` 엔트리를 하나하나 수집했다. 이게 크롬이 CLS를 계산할 때 내부적으로 읽는 바로 그 이벤트다.

```js
new PerformanceObserver((list) => {
  for (const e of list.getEntries()) {
    if (!e.hadRecentInput) {        // 사용자 입력 직후 이동은 제외
      cls += e.value;               // value = impact × distance
      shifts.push({ value: e.value, t: Math.round(e.startTime) });
    }
  }
}).observe({ type: 'layout-shift', buffered: true });
```

Playwright로 시스템 크롬을 띄우고 모바일 뷰포트(390px)로 두 페이지를 각각 로드한 뒤, 동적 삽입이 끝나는 2초까지 기다렸다가 누적값을 읽었다. 모바일을 고른 건 화면이 좁을수록 같은 요소가 더 큰 비율을 차지해 CLS가 더 아프게 나오기 때문이다.

<img src="../../../assets/blog/cls-layout-shift-reserve-space-measure-2026/shift-breakdown.png" alt="before와 after 페이지의 layout-shift 엔트리를 이벤트별로 분해한 표. before는 이미지 로드 0.446, 배너 0.066, 공지 0.048로 합계 0.559. after는 합계 0.014." />

| 이벤트 (로드 후 시각) | 원인 | before | after |
|---|---|---|---|
| ~148ms | 히어로·썸네일이 자리 없이 디코드 | 0.446 | 0.000 |
| ~694ms | 프로모 배너를 body 최상단에 삽입 | 0.066 | 0.000 |
| ~1070〜1135ms | 공지 문단을 히어로 위에 삽입 | 0.048 | 0.014 |
| <strong>합계 (CLS)</strong> | | <strong>0.559 (POOR)</strong> | <strong>0.014 (GOOD)</strong> |

가장 큰 범인은 이미지였다. 전체 이동의 80%가 이미지 디코드 한 방에서 나왔다. 배너와 공지는 각각 0.06, 0.05로 그 다음이었다. 흥미로운 건 세 이동이 각각 148ms, 694ms, 1135ms에 흩어져 일어났는데도 하나의 점수로 합산됐다는 점이다. 이건 우연이 아니다.

CLS는 단순 총합이 아니라 <strong>세션 윈도우</strong> 방식으로 계산된다. 이동들이 연달아 터지면 하나의 윈도우로 묶고, 1초 넘게 조용하면 새 윈도우를 연다. 윈도우 하나의 최대 길이는 5초다([web.dev, evolving CLS](https://web.dev/articles/optimize-cls)). 내 세 이동은 간격이 각각 546ms, 441ms로 모두 1초 미만이라 한 윈도우로 묶였고, 그래서 단순 합(0.559)이 실제 세션 윈도우 CLS와 일치했다. 만약 이동 사이에 2초씩 공백이 있었다면 이야기가 달라졌을 것이다. 이 차이는 뒤에서 정직하게 짚는다.

## 세 줄로 끝나는 수정 — 자리를 미리 잡아라

`good.html`에서 바꾼 건 세 가지뿐이다. 코드로 보면 허무할 만큼 짧다.

<strong>1) 이미지에 width/height를 명시한다.</strong>

```html
<img src="cat.svg" alt="hero" width="800" height="450">
```

이 두 속성은 옛날처럼 이미지를 그 픽셀로 강제 렌더하라는 뜻이 아니다. 현대 브라우저는 이 값에서 <strong>가로세로비</strong>를 계산해, 파일이 도착하기 전에 그 비율만큼의 박스를 미리 잡아둔다. CSS로 `width:100%`를 줘도 높이는 이 비율을 따라간다. 반응형 이미지에는 CSS `aspect-ratio`를 함께 쓰면 더 확실하다.

```css
.hero img { width: 100%; height: auto; aspect-ratio: 16 / 9; }
```

<strong>2) 늦게 채울 콘텐츠의 자리를 DOM에 미리 비워둔다.</strong>

배너를 나중에 `insertBefore`로 밀어 넣는 대신, 빈 슬롯을 처음부터 문서에 두고 텍스트만 채운다.

```html
<div id="promo" style="min-height:64px"></div>
<script>
  // 자리는 이미 있으니 내용만 넣는다 → 이동 0
  setTimeout(() => {
    document.getElementById('promo').textContent = 'Subscribe now';
  }, 500);
</script>
```

`min-height`로 최소 높이를 확보하고 `:empty`일 때 `visibility:hidden`으로 감추면, 콘텐츠가 없을 때도 레이아웃은 흔들리지 않는다. 광고나 임베드처럼 크기를 미리 알 수 있는 자리는 전부 이 방식이 먹힌다([Google Publisher Tag, minimize layout shift](https://developers.google.com/publisher-tag/guides/minimize-layout-shift)).

<strong>3) 기존 콘텐츠 위에 무언가를 끼워 넣지 않는다.</strong> 정말 필요하면 사용자 상호작용에 대한 반응으로만 한다. 이건 앞서 말한 500ms 규칙과 맞물린다. 사용자가 버튼을 눌러서 열리는 이동은 예상된 것이라 CLS에서 빠지지만, 아무 입력 없이 스크립트가 밀어내는 이동은 고스란히 점수에 잡힌다. 이 페이지가 자바스크립트로 콘텐츠를 나중에 그리는 구조라면, [크롤러가 자바스크립트를 렌더하지 않는 문제](/ko/blog/ko/ai-crawlers-dont-render-javascript-csr-2026/)까지 함께 겪고 있을 가능성이 높다. 렌더 타이밍은 성능과 크롤러빌리티에 동시에 영향을 준다.

결과는 표 그대로다. 세 수정 중 이미지 하나만 잡아도 CLS의 80%가 사라졌고, 나머지 둘까지 처리하니 0.014만 남았다. 이 잔여 0.014는 공지 삽입에서 나온 작은 이동인데, GOOD 기준의 7분의 1 수준이라 실사용에선 체감되지 않는다.

## 정직한 한계 — 이 숫자는 순위를 보장하지 않는다

여기서 멈추면 위험하다. 실측을 했다고 해서 그게 곧 검색 순위로 이어진다고 말하는 건 과장이다. 세 가지를 분명히 해두자.

첫째, <strong>랩(lab) 데이터와 필드(field) 데이터는 다르다.</strong> 내가 잰 건 통제된 환경의 합성 측정이다. 구글이 랭킹 신호로 쓰는 CLS는 실제 사용자들의 크롬에서 모인 필드 데이터(CrUX)의 75번째 백분위수다. 랩 측정은 원인을 찾고 고치는 데는 최고지만, "이 숫자가 곧 내 순위"는 아니다. 실제 배포 후엔 필드 데이터로 다시 확인해야 한다.

둘째, <strong>Core Web Vitals가 좋다고 순위가 오르는 게 아니다.</strong> 구글은 페이지 경험을 신호로 쓰지만, 콘텐츠 관련성이 압도적으로 우선한다. CLS 0.014는 "이 페이지가 사용자를 존중한다"는 신호이지 순위 상승의 보증수표가 아니다. 이건 구글 공식 입장이기도 하다. 나쁜 CLS가 발목을 잡을 수는 있어도, 좋은 CLS 하나로 앞서 나가지는 못한다.

셋째, <strong>내 측정 방식 자체에 근사가 들어있다.</strong> 나는 `layout-shift` 값을 단순 합산했다. 이번엔 모든 이동이 한 세션 윈도우에 들어와 실제 CLS와 일치했지만, 이동이 몇 초씩 떨어져 발생하는 오래 사는 페이지(무한 스크롤, SPA)에서는 단순 합과 세션 윈도우 값이 벌어진다. 정확한 값이 필요하면 구글이 배포하는 `web-vitals` 자바스크립트 라이브러리를 쓰는 게 맞다. 그게 세션 윈도우 로직을 그대로 구현해준다. 또한 이번 실험은 웹폰트 교체(FOUT)로 인한 이동은 다루지 않았다. 그것도 흔한 CLS 원인이다.

이 한계들을 알고 나면 오히려 실측의 쓸모가 분명해진다. 랩 측정은 순위 예언이 아니라 <strong>디버깅 도구</strong>다. "무엇이 얼마나 밀리는가"를 눈으로 보고 원인을 하나씩 걷어내는 것. 그게 이 워크플로우의 전부이자 핵심이다. 같은 방식으로 [LCP 병목을 트레이스로 분해했던 기록](/ko/blog/ko/lcp-image-preload-scanner-fetchpriority-2026/)이나 [content-visibility의 렌더 비용을 실측한 기록](/ko/blog/ko/content-visibility-auto-render-cost-measure-2026/)도 결국 같은 태도다. 재는 순간 계측기 자체를 의심해야 하는 경우도 있다. [prerender 페이지의 LCP가 6.2초로 잡혔던 건](/ko/blog/ko/prerender-activationstart-cwv-measurement-2026/) 페이지가 느려서가 아니라 시작점을 빼지 않아서였다. 추측하지 말고 재라.

## 오늘 바로 할 수 있는 체크리스트

내 사이트에 적용한다면 이 순서로 훑으면 된다.

- <strong>모든 `<img>`와 `<video>`에 width/height를 넣었는가.</strong> 반응형이라 픽셀이 유동적이면 CSS `aspect-ratio`로 비율을 고정한다. 이거 하나가 대개 CLS의 대부분을 잡는다.
- <strong>광고·임베드·배너 자리에 min-height로 공간을 예약했는가.</strong> 크기를 모르면 가장 흔한 높이로라도 잡아두고, 채워지면 그 안에서 처리한다.
- <strong>자바스크립트로 기존 콘텐츠 위에 뭔가를 삽입하고 있지 않은가.</strong> 쿠키 배너, 공지 바, 지연 로딩 위젯이 흔한 범인이다. 사용자 입력에 대한 반응이 아니라면 자리를 미리 비워라.
- <strong>웹폰트 교체 시 레이아웃이 튀지 않는가.</strong> `font-display`와 `size-adjust`로 대체 폰트와 웹폰트의 메트릭 차이를 줄인다.
- <strong>고친 뒤 필드 데이터로 확인했는가.</strong> 랩에서 GOOD이 나와도 실제 사용자 환경(느린 기기, 느린 네트워크)에선 다를 수 있다. `web-vitals` 라이브러리나 CrUX로 실사용값을 본다.

CLS는 화려한 최적화가 아니다. "브라우저에게 자리를 미리 알려준다"는 한 문장으로 요약되는, 대신 지키면 확실히 보상받는 기본기다. 그리고 이건 성능 지표이기 전에 예의의 문제다. 사용자가 누르려던 버튼이 도망가지 않게 하는 것.

---

구조화 데이터를 서버사이드로 확실히 내보내는 일부터 기존 사이트의 Core Web Vitals·접근성 실측 점검까지, 웹 개발을 실무로 다루면서 개인적으로 상담과 구현 의뢰를 받습니다. 밀리는 레이아웃이나 느린 LCP처럼 "숫자로 잡아야 하는 문제"가 쌓여 있다면 프로필의 연락 경로로 편하게 문의해 주세요.
