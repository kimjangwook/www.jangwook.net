---
title: '히어로 이미지는 117KB였는데 LCP는 1.2초 — 브라우저가 이미지를 늦게 찾는 진짜 이유'
description: 'LCP가 느린 건 이미지가 무거워서가 아니다. 브라우저가 그 이미지를 언제 "발견"하느냐의 문제다. CSS 배경 이미지가 프리로드 스캐너에 안 보이는 현상을 Chrome DevTools로 실측하고, fetchpriority·preload·렌더 차단 제거로 LCP 1247ms를 109ms까지 내린 기록.'
pubDate: '2026-07-14'
heroImage: '../../../assets/blog/lcp-image-preload-scanner-fetchpriority-2026/hero.png'
tags:
  - Core Web Vitals
  - LCP
  - 웹성능
  - 렌더링
relatedPosts:
  - slug: sitemap-lastmod-crawl-scheduling-2026
    score: 0.64
    reason:
      ko: 그 글은 크롤러가 sitemap의 어떤 필드를 읽고 무엇을 조용히 버리는지를 다뤘다. 이 글은 브라우저가 무엇을 일찍 발견하고 무엇을 늦게 그리는지를 다룬다. 둘 다 "당신이 내보낸 것을 상대가 언제 처리하는가"의 문제다.
      ja: あちらはクローラーがsitemapのどのフィールドを読み、何を静かに捨てるかの話。この記事はブラウザが何を早く発見し、何を遅れて描くかの話。どちらも「あなたが出したものを相手がいつ処理するか」だ。
      en: That post is about which sitemap fields a crawler reads and which it quietly discards. This one is about what the browser discovers early and paints late. Both ask the same thing, namely when the other side processes what you shipped.
      zh: 那篇讲爬虫读 sitemap 的哪些字段、又悄悄丢弃哪些。这篇讲浏览器早发现什么、晚绘制什么。两者问的是同一件事：你下发的东西，对方到底什么时候才处理。
  - slug: ai-crawlers-dont-render-javascript-csr-2026
    score: 0.68
    reason:
      ko: 렌더 차단 CSS가 페인트를 막는 이 글과 같은 뿌리다. 그쪽은 크롤러가 자바스크립트를 안 돌려 콘텐츠를 못 본다는 이야기고, 렌더링이 곧 가시성이라는 교훈이 겹친다.
      ja: レンダーブロッキングCSSがペイントを止める本記事と根が同じ。あちらはクローラーがJSを実行せずコンテンツを見られない話で、レンダリングこそ可視性という教訓が重なる。
      en: Same root as this render-blocking story. That post is about crawlers not running your JavaScript, and the lesson — rendering is visibility — carries straight over.
      zh: 与本文"渲染阻塞 CSS 拖住绘制"同源。那篇讲爬虫不执行 JS 就看不到内容，"渲染即可见性"的教训是相通的。
  - slug: a11y-lighthouse-audit-fix-2026
    score: 0.6
    reason:
      ko: 같은 Lighthouse·DevTools 계열 실측 워크플로우다. 접근성 점수를 눈으로 잡아 고쳤듯, 여기서는 LCP 분해를 눈으로 보고 병목을 하나씩 걷어낸다.
      ja: 同じLighthouse・DevTools系の実測ワークフロー。アクセシビリティのスコアを目で見て直したように、ここではLCP分解を見てボトルネックを一つずつ剥がす。
      en: The same Lighthouse/DevTools measure-then-fix workflow. Just as that post fixed a11y by reading the score, here we read the LCP breakdown and peel off bottlenecks one at a time.
      zh: 同属 Lighthouse / DevTools 的实测工作流。那篇靠读分数修无障碍，这篇靠读 LCP 分解逐个剥掉瓶颈。
---

히어로 이미지 하나를 놓고 트레이스를 떠봤다. 파일은 117KB짜리 PNG, 로컬에서 다운로드에 걸린 시간은 5밀리초. 그런데 그 페이지의 Largest Contentful Paint는 1,247밀리초로 찍혔다. 이미지가 5ms 만에 도착했는데 가장 큰 요소가 그려지기까지 1.2초가 걸렸다는 뜻이다. 나머지 1,242ms는 대체 어디로 샜을까.

답은 "이미지가 무겁다"가 아니다. 브라우저가 그 이미지를 **언제 찾기 시작했는가**의 문제다. LCP를 이미지 용량 문제로만 보면 이 1.2초의 대부분을 영영 못 잡는다. 오늘은 같은 히어로를 세 가지 방식으로 내보내면서 Chrome DevTools 트레이스로 LCP를 분해했고, 병목이 어디에 숨는지를 숫자로 확인했다. 아래 표와 로그는 전부 그 샌드박스에서 나온 실제 측정값이다.

## LCP는 하나의 숫자가 아니라 네 토막이다

먼저 토대부터. LCP(Largest Contentful Paint)는 뷰포트 안에서 가장 큰 콘텐츠 요소 — 대개 히어로 이미지나 큰 제목 블록 — 가 화면에 그려진 시각이다. Google은 이 값이 페이지 로드 시작 후 **2.5초 안**에 일어나기를 권장한다([Google Search Central, Core Web Vitals 문서](https://developers.google.com/search/docs/appearance/core-web-vitals)). 이건 실제 사용자 데이터(CrUX)의 75번째 백분위 기준이다.

중요한 건 그다음이다. LCP는 단일 측정치처럼 보이지만, web.dev의 [Optimize LCP](https://web.dev/articles/optimize-lcp) 문서는 이걸 네 개의 하위 구간으로 쪼갠다.

- **TTFB**: 서버가 첫 바이트를 보내기까지
- **Load delay(로드 지연)**: 브라우저가 LCP 리소스를 **발견해서 요청을 시작하기까지**
- **Load duration(로드 시간)**: 그 리소스를 실제로 내려받는 데 걸린 시간
- **Render delay(렌더 지연)**: 다 받은 다음, 화면에 그려지기까지

내가 이 네 토막 모델을 좋아하는 이유는 단순하다. "LCP가 느리다"는 진단이 아니라 증상이다. 네 구간 중 어디가 부풀었는지를 봐야 처방이 나온다. 그리고 대부분의 느린 히어로는 Load duration(다운로드)이 아니라 **Load delay(발견)**에서 시간을 흘린다. 아래가 그 증거다.

## 실측: 배경 이미지로 내보낸 히어로

첫 번째 버전은 흔한 패턴이다. 히어로를 `<img>`가 아니라 CSS `background-image`로 깔았다.

```css
.hero {
  width: 100%;
  height: 600px;
  background-image: url("hero.png");
  background-size: cover;
}
```

```html
<link rel="stylesheet" href="style.css">
<div class="hero"></div>
```

측정 환경은 이렇다. 로컬 스레드 HTTP 서버, 모든 응답에 `Cache-Control: no-store`(매번 새로 받게), 그리고 스타일시트에는 1초 지연을 걸었다. 렌더 차단 CSS가 느린 실제 상황을 재현하기 위한 장치다. Chrome DevTools의 `performance` 트레이스를 리로드와 함께 떴다. 결과:

```text
LCP: 1247 ms
  TTFB:          8 ms
  Load delay: 1184 ms   ← 여기
  Load duration: 5 ms
  Render delay:  51 ms
DevTools 인사이트: "LCP request discovery" 플래그
```

Load delay가 1,184ms. 이미지 다운로드는 5ms인데, 브라우저가 그 이미지를 **발견하기까지** 1.2초를 썼다. 왜냐면 히어로 URL이 CSS 안에 숨어 있기 때문이다.

여기서 핵심 개념 하나. 브라우저에는 **프리로드 스캐너(preload scanner)**라는 게 있다. HTML 응답 바이트가 도착하면, 메인 파서가 돌기도 전에 이 스캐너가 원시 HTML을 훑어 `<img src>`, `<script src>`, `<link href>` 같은 리소스를 미리 발견해 요청을 앞당긴다. 문제는 이 스캐너가 HTML만 본다는 것이다. **CSS 안의 `background-image` URL은 스캐너에 보이지 않는다**([web.dev, Don't fight the browser preload scanner](https://web.dev/preload-scanner/)). 그래서 배경 이미지는 CSS가 다운로드되고 파싱될 때까지 요청조차 시작되지 않는다. 내 실험에서 CSS에 1초를 걸어놨으니, 히어로는 정확히 그만큼 늦게 발견됐다. Chrome이 이걸 "LCP request discovery" 인사이트로 직접 짚어줬다([LCP discovery, Chrome for Developers](https://developer.chrome.com/docs/performance/insights/lcp-discovery)).

이 현상은 [AI 크롤러가 자바스크립트를 실행하지 않아 콘텐츠를 못 본다는 이야기](/ko/blog/ko/ai-crawlers-dont-render-javascript-csr-2026)와 뿌리가 같다. 리소스가 어디에 어떻게 놓였느냐가 그것이 언제(혹은 아예) 처리되는지를 결정한다.

## fetchpriority와 preload를 걸었더니 — 그런데 LCP는 그대로

두 번째 버전. 히어로를 진짜 `<img>`로 바꾸고, `fetchpriority="high"`를 붙이고, `<head>`에 preload 힌트까지 넣었다.

```html
<link rel="preload" as="image" href="hero.png" fetchpriority="high">
...
<img src="hero.png" alt="Product launch hero"
     width="1200" height="600" fetchpriority="high">
```

`fetchpriority="high"`는 브라우저에 "이 리소스는 다른 것보다 먼저, 높은 우선순위로 가져와라"고 알려주는 힌트다([web.dev, Fetch Priority API](https://web.dev/articles/fetch-priority)). 왜 이게 필요하냐면, 브라우저는 레이아웃 이전 단계에서 이미지가 화면 어디에 오는지 모르기 때문에 대부분의 이미지를 처음엔 낮은 우선순위로 잡아둔다. 히어로든 푸터의 장식 아이콘이든 초기 취급은 같다는 뜻이다. `fetchpriority="high"`는 그중 딱 하나 — 히어로 — 를 손으로 끌어올려 준다. `<img>`로 바꿨으니 이제 URL이 HTML 안에 있고, 프리로드 스캐너가 이걸 즉시 본다. 측정값:

```text
LCP: 1226 ms
  TTFB:          3 ms
  Load delay:   37 ms   ← 1184에서 37로 급감
  Load duration: 2 ms
  Render delay: 1185 ms  ← 이번엔 여기가 부풀었다
```

Load delay가 1,184ms → 37ms로 무너졌다. 발견 문제는 완벽하게 풀렸다. 이미지는 나비게이션 42ms 만에 이미 다 받아졌다. 그런데 **LCP는 1226ms로 거의 그대로다.** 솔직히 이 결과를 처음 봤을 때 잠깐 멈칫했다. 발견을 30배 빠르게 했는데 최종 지표가 안 움직이면 뭔가 놓친 거다.

병목이 이동한 거였다. 이제 Render delay가 1,185ms를 먹는다. 이미지는 42ms에 준비됐지만, **화면에 그릴 수가 없다.** 렌더 차단 스타일시트(내가 1초 걸어둔 그것)가 아직 안 왔기 때문이다. 브라우저는 CSS가 도착해 첫 페인트를 할 수 있을 때까지 아무것도 그리지 않는다. 이미지가 손안에 있어도 붓을 못 든다.

이게 내가 이 글에서 가장 하고 싶은 말이다. **fetchpriority와 preload는 필요조건이지 충분조건이 아니다.** 이 둘은 "발견" 병목을 없앤다. 하지만 LCP 분해의 다른 세 토막 중 하나가 커져 있으면, 발견을 아무리 앞당겨도 최종 숫자는 그만큼만 움직인다. 네 토막을 안 보고 fetchpriority만 뿌리면, 좋아졌다고 착각하기 딱 좋다.

## 렌더 차단까지 걷어내자 LCP 1247 → 109ms

세 번째 버전. 위의 `<img fetchpriority>`는 그대로 두고, 이번엔 렌더 차단을 없앴다. 히어로가 보이는 데 꼭 필요한 최소 CSS(크리티컬 CSS)만 `<style>`로 인라인하고, 나머지 스타일시트는 페인트를 막지 않게 로드했다.

```html
<style>
  .herowrap{width:100%;height:600px;overflow:hidden}
  .herowrap img{width:100%;height:600px;object-fit:cover}
</style>
<link rel="stylesheet" href="style.css"
      media="print" onload="this.media='all'">
```

`media="print"`으로 걸어두면 화면 렌더를 막지 않고, `onload`에서 `all`로 바꿔 실제 적용한다. 널리 쓰이는 비차단 CSS 로딩 패턴이다. 측정값:

```text
LCP: 109 ms
  TTFB:          5 ms
  Load delay:   43 ms
  Load duration: 1 ms
  Render delay:  60 ms
```

1,247ms에서 109ms. 세 토막이 모두 두 자릿수로 내려앉았다. 발견도 빠르고(43ms), 그릴 것을 막는 것도 없다(Render delay 60ms). 세 버전을 나란히 보면 이렇다.

| 히어로 전달 방식 | Load delay(발견) | Render delay | LCP |
|---|---|---|---|
| CSS `background-image` | 1,184 ms | 51 ms | 1,247 ms |
| `<img fetchpriority>` + preload | 37 ms | 1,185 ms | 1,226 ms |
| + 크리티컬 CSS 인라인(비차단) | 43 ms | 60 ms | **109 ms** |

숫자 하나만 고쳤을 때는 병목이 옆으로 도망갔고, 두 병목을 다 잡았을 때 비로소 지표가 무너졌다. 이 표가 네 토막 모델의 값어치를 그대로 보여준다.

![세 가지 히어로 전달 방식별 LCP 분해 스택 막대 — Chrome DevTools 트레이스 실측값. background-image는 Load delay 1184ms, fetchpriority+preload는 Render delay 1185ms, 크리티컬 CSS 인라인은 LCP 109ms](../../../assets/blog/lcp-image-preload-scanner-fetchpriority-2026/lcp-breakdown.png)

## 그래서 개발자가 오늘 할 것 (체크리스트)

위 실험을 실무 액션으로 옮기면 이렇게 된다.

1. **히어로는 CSS 배경이 아니라 HTML `<img>`로 내보내라.** 프리로드 스캐너가 봐야 일찍 발견한다. 디자인상 배경으로 써야만 한다면, `<link rel="preload" as="image" href="..." fetchpriority="high">`로 스캐너 대신 발견을 앞당겨라([web.dev preload-scanner](https://web.dev/preload-scanner/)).
2. **LCP 이미지에 `fetchpriority="high"`를 붙여라.** 브라우저는 초기에 이미지를 대개 낮은 우선순위로 잡는다. 히어로만 높여준다.
3. **LCP 이미지에는 절대 `loading="lazy"`를 걸지 마라.** 폴드 아래 이미지엔 좋지만, 뷰포트 최상단 히어로에 걸면 발견을 스스로 늦추는 자해다([web.dev, LCP 오해](https://web.dev/blog/common-misconceptions-lcp)).
4. **크리티컬 CSS를 인라인하고 나머지는 비차단으로.** 이미지를 일찍 받아도 렌더 차단 CSS가 있으면 못 그린다.
5. **`width`/`height`(또는 `aspect-ratio`)를 항상 명시하라.** 레이아웃 시프트(CLS)를 막는다. 위 실험에서 CLS는 세 버전 모두 0.00이었다.
6. **무엇보다, LCP 분해를 먼저 읽어라.** DevTools Performance 패널이 TTFB / Load delay / Load duration / Render delay를 그대로 보여준다. 가장 큰 토막부터 잡는다. 이 측정 워크플로우 자체는 [Lighthouse로 접근성 점수를 직접 잡아 고친 글](/ko/blog/ko/a11y-lighthouse-audit-fix-2026)에서 더 다뤘다.

## 정직한 한계 — 이 숫자를 오해하지 말 것

내 실험값은 **실험실(lab) 수치**다. 로컬 서버, 네트워크 스로틀 없음, CPU 1배속. 스타일시트에 건 1초 지연도 효과를 눈에 보이게 하려고 내가 인위적으로 넣은 값이다. 그러니 "1247 → 109"라는 배율을 당신 사이트에 그대로 대입하지 마라. 이 숫자들은 **메커니즘을 보여주는 시연**이지, 당신이 기대할 절대 개선폭이 아니다. 실제로 Google이 순위에 쓰는 건 CrUX의 필드(실사용자) 데이터이고, 개선폭은 당신 페이지의 진짜 크리티컬 패스에 달렸다.

두 번째, 더 중요한 한계. **LCP를 2.5초 안으로 넣어도 검색 순위가 오른다는 보장은 없다.** Google은 공식 문서에서 "단일 순위 신호는 없다"고 못 박고, 페이지 경험이 좋아도 "훌륭하고 관련성 높은 콘텐츠를 대체하지 못한다"고 명시한다([Google Search Central](https://developers.google.com/search/docs/appearance/core-web-vitals)). Core Web Vitals는 여러 신호 중 하나다. 나는 LCP 최적화를 "순위 레버"가 아니라 "이탈을 줄이는 UX 작업"으로 파는 게 정직하다고 본다. 빠른 페이지는 사용자가 안 떠나서 좋은 거지, 그 자체로 상위 노출을 사주는 게 아니다.

여기에 재현하다 나를 두 번 속인 함정도 정직하게 적어둔다. 처음엔 파이썬 단일 스레드 서버를 썼는데, `fetchpriority` 버전에서 이미지를 일찍 발견해놓고도 LCP가 안 떨어졌다. 서버가 1초짜리 CSS를 응답하느라 블로킹된 사이, 일찍 발견된 이미지 요청이 그 뒤에 줄을 서버린 것이다. 실제 HTTP/2 오리진이라면 멀티플렉싱으로 동시에 내려갔을 텐데, 서버 인공물이 진짜 효과를 가렸다. 스레드 서버로 바꾸고 나서야 숫자가 정직해졌다. 두 번째 함정은 캐시였다. `no-store`를 안 걸었더니 브라우저가 이전 실행의 CSS를 디스크 캐시에서 꺼내 써서 1초 지연이 사라졌고, "before"의 페널티가 통째로 증발했다. 측정을 믿기 전에 측정 환경부터 의심해야 한다는 걸 다시 배웠다.

세 번째. preload도 남발하면 독이다. 아무거나 preload로 높은 우선순위를 주면 정작 중요한 리소스의 대역폭을 뺏고, 조건에 따라 이미지를 두 번 받는 일도 생긴다. preload는 **LCP 요소 하나**에만 아껴 쓰는 게 원칙이다.

이 글을 요약하면 한 문장이다. LCP가 느리면 이미지 용량부터 의심하지 말고, 브라우저가 그걸 언제 발견하고 언제 그리는지 — 네 토막을 먼저 열어봐라. 병목은 대개 다운로드가 아니라 발견과 렌더 차단에 숨어 있다. 다국어 블로그를 실제로 감사하며 렌더 차단 리소스를 걷어낸 [기술 SEO 감사 기록](/ko/blog/ko/multilingual-blog-technical-audit-campaign-2026)에서도 같은 결론에 닿았다.

---

*구조화 데이터를 서버사이드로 확실히 내보내거나, 기존 사이트의 Core Web Vitals·접근성·크롤러 대응을 실측으로 점검하고 싶다면 개인적으로 상담·구현 의뢰를 받는다. 프로필의 문의 경로로 편하게 연락 주면 된다.*
