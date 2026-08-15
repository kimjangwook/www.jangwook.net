---
title: '닫힌 아코디언 속 글자를 링크로 열 수 있는가: hidden=until-found 17개 조건 실측'
description: '아코디언 안에 숨긴 텍스트는 링크나 검색으로 찾아갈 수 있을까? Chromium 143에서 17가지 숨김 방식을 만들고 텍스트 프래그먼트와 window.find, 접근성 트리를 대조했다. 도착과 열림이 왜 서로 다른 일인지 정리한다.'
pubDate: '2026-08-15'
heroImage: '../../../assets/blog/hidden-until-found-find-fragment-accordion-2026/hero.png'
tags:
  - 아코디언
  - 웹접근성
  - HTML
  - 브라우저
  - 검색최적화
faq:
  - question: 'hidden="until-found"를 쓰면 검색과 링크 이동 시 자동으로 펼쳐지나요?'
    answer: '지원 브라우저에서는 그렇습니다. Chromium 기반 브라우저는 페이지 내 검색이나 텍스트 프래그먼트 링크에서 beforematch를 발생시키고 hidden 속성을 제거합니다. 다만 display: none이나 display: inline이 함께 적용되면 펼쳐지지 않습니다.'
  - question: '기존 details 요소와 hidden="until-found"는 어떻게 다른가요?'
    answer: 'details는 open 속성으로 제어하는 내장 요소이고, hidden="until-found"는 임의의 요소에 붙이는 HTML 속성입니다. 둘 다 평소에는 페인트를 생략하되 검색 시 트리를 탐색할 수 있게 합니다.'
  - question: 'max-height: 0으로 닫아둔 CSS 아코디언은 검색에 걸리지 않나요?'
    answer: '실측 결과 텍스트는 브라우저 검색(window.find)과 접근성 트리에 잡히고 프래그먼트 링크는 좌표로 스크롤합니다. 하지만 컨테이너 높이가 0px라 눈에는 흰 여백만 보입니다.'
  - question: '모든 브라우저에서 hidden="until-found"를 바로 써도 되나요?'
    answer: '아직 주의가 필요합니다. 이번 측정은 Chromium 143뿐입니다. onbeforematch를 지원하지 않는 브라우저에서는 닫힌 내용이 남을 수 있으니 지원 여부를 확인해야 합니다.'
relatedPosts:
  - slug: text-fragment-citation-deep-link-audit-2026
    score: 0.90
    reason:
      ko: '텍스트 프래그먼트 링크가 특정 구절로 이동하는지 다룬 선행 실측이다. 이번 글은 그 링크가 닫힌 UI를 만났을 때 열리는지 본다.'
      ja: 'テキストフラグメントリンクが特定の一節へ到達するかを扱った先行計測。本稿はそのリンクが閉じたUIに当たったとき開くかを見る。'
      en: 'That post measured whether text-fragment links reach a specific passage. This one asks whether the same link opens the UI it lands in when that UI is closed.'
      zh: '那篇实测了文本片段链接能否定位到指定段落。这篇看的是同一条链接撞上折叠界面时会不会把它打开。'
  - slug: content-visibility-auto-render-cost-measure-2026
    score: 0.83
    reason:
      ko: 'content-visibility가 렌더링 비용을 줄이는 방식을 측정한 글이다. hidden=until-found가 내부적으로 사용하는 속성이기도 하다.'
      ja: 'content-visibilityが描画コストを削る仕組みを計測した記事。hidden=until-foundが内部で使うプロパティでもある。'
      en: 'That post measured how content-visibility cuts rendering cost. It is also the property the UA applies under hidden=until-found.'
      zh: '那篇测了 content-visibility 如何降低渲染开销。它也正是 hidden=until-found 在底层被赋予的属性。'
  - slug: modal-focus-escape-inert-measure-2026
    score: 0.74
    reason:
      ko: 'inert 속성이 포커스와 탐색을 차단하는 동작을 실측했다. 이번 글에서는 검색과 해시 링크를 어떻게 다르게 거부하는지 비교한다.'
      ja: 'inert属性がフォーカスと移動を遮断する挙動を実測した記事。本稿ではinertが検索とハッシュリンクをどう別々に扱うかを比べる。'
      en: 'That post measured how inert blocks focus and traversal. Here inert refuses find-in-page and fragments while still accepting a hash link.'
      zh: '那篇实测了 inert 如何阻断焦点与移动。本文里 inert 拒绝页面搜索和文本片段，却接受锚点跳转。'
  - slug: faqpage-deprecation-ai-citation-2026
    score: 0.72
    reason:
      ko: 'FAQ 구조화 데이터와 아코디언 본문의 인용 관계를 다룬 글이다. 마크업과 브라우저 노출의 차이를 이해하는 글이다.'
      ja: 'FAQ構造化データとアコーディオン本文の引用関係を扱った記事。マークアップとブラウザ上の露出の差を掴むのに役立つ。'
      en: 'That post covered how FAQ structured data relates to the answer text itself. It helps separate what the markup declares from what the browser exposes.'
      zh: '那篇讲了 FAQ 结构化数据与折叠正文之间的引用关系，便于分清标记声明与浏览器实际暴露的差别。'
  - slug: content-on-hover-focus-1413-tooltip-2026
    score: 0.63
    reason:
      ko: '마우스 오버나 포커스로 숨겨진 콘텐츠를 여닫을 때의 접근성 기준을 다뤘다. UI 상태 제어라는 맥락을 공유한다.'
      ja: 'ホバーやフォーカスで開閉するコンテンツのアクセシビリティ基準を扱った記事。UIの状態制御という文脈を共有する。'
      en: 'That post covered the accessibility criteria for content revealed on hover or focus. Both posts turn on who controls the open state.'
      zh: '那篇讲了悬停或聚焦才显示的内容要满足的无障碍标准。两篇都落在谁来控制展开状态这个问题上。'
---

`#:~:text=TOKENCSSMAXH` 링크를 눌렀다. `window.scrollY`는 6083으로 튀었지만, 아코디언의 `data-open` 속성은 여전히 `0`이었다.

단락 한가운데에 `elementFromPoint(640, 409)`를 던지자 문장이 아니라 `BODY`가 돌아왔다. 바이트는 문서 안에 있었지만 페인트는 없었다. 페이지는 잘려나간 빈 상자로 스크롤했을 뿐이다.

![아코디언 숨김 방식 17가지와 브라우저 탐색 결과](../../../assets/blog/hidden-until-found-find-fragment-accordion-2026/hero.png)

## 도착과 열림은 서로 다른 일이었다

솔직히 나도 `max-height: 0`과 `overflow: hidden`으로 만든 CSS 아코디언이 이 검색 불가능의 대표 사례일 줄 알았다. 내 오판이었다.

문제는 그 다음이다. 브라우저는 텍스트의 좌표를 찾아 6083px 아래로 스크롤했지만, 아코디언을 열어주는 자바스크립트는 돌지 않았다. 높이 0px짜리 상자 안의 문장은 뷰포트에 들어왔지만 눈에는 흰 여백만 보였다.

브라우저에게 도착은 좌표 이동이었고, 열림은 스타일 변경이었다. 둘은 애초에 다른 작업이었다.

## 숨김이라는 다섯 갈래의 일

로컬 `/tmp`에 숨김 방식 17가지를 넣은 픽스처 페이지를 띄웠다.

페이지 로드 직후 `window.find(token)`, 두 링크를 누른 뒤 단락의 뷰포트 진입 여부, CDP 접근성 트리의 토큰 존재 여부를 물었다.

![17가지 숨김 셀의 검색·프래그먼트·접근성 매트릭스](../../../assets/blog/hidden-until-found-find-fragment-accordion-2026/hide-matrix.png)

17개 셀 중 `window.find`가 찾은 것은 10개, 텍스트 프래그먼트 링크로 단락이 뷰포트에 들어온 셀도 10개였다. 실패한 7개 셀은 둘 다 완전히 같았다. `#id` 해시 링크로 화면 안에 들어온 셀은 12개였다.

| 숨김 방식 | `window.find` | 텍스트 프래그먼트 | ID 해시 | 접근성 트리 이름 |
| --- | --- | --- | --- | --- |
| visible 기준 | 참 | 참 | 참 | 있음 |
| `hidden=""` 불리언 | 거짓 | 거짓 | 거짓 | 없음 |
| `hidden="hidden"` | 거짓 | 거짓 | 거짓 | — 미수집 |
| `hidden="until-found"` | 참 | 참 | 참 | 없음 |
| until-found + 패딩 상자 | 참 | 참 | 참 | — 미수집 |
| until-found + `display:none` | 거짓 | 거짓 | 거짓 | — 미수집 |
| until-found + `display:inline` | 참 | 참 | 참 | 있음 |
| `<details>` 닫힘 | 참 | 참 | 참 | 없음 |
| `<details>` 열림 | 참 | 참 | 참 | 있음 |
| 작성자 `display:none` | 거짓 | 거짓 | 거짓 | 없음 |
| `visibility:hidden` | 거짓 | 거짓 | 참 | 없음 |
| 작성자 `content-visibility:hidden` | 거짓 | 거짓 | 거짓 | 없음 |
| `aria-hidden="true"` | 참 | 참 | 참 | 없음 |
| `inert` | 거짓 | 거짓 | 참 | 없음 |
| `opacity:0` | 참 | 참 | 참 | 있음 |
| sr-only 클리핑 | 참 | 참 | 참 | 있음 |
| `max-height:0` CSS 아코디언 | 참 | 참 | 참 | 있음 |

숨김은 하나의 스위치가 아니었다. 렌더링 자체가 생략된 층(`display:none`, 불리언 `hidden`), 그리기는 건너뛰되 검색에는 열어둔 층(`hidden="until-found"`, UA 기본 `content-visibility:hidden`), 트리에 남겨두고 화면 밖으로 잘라낸 층(`max-height:0`), 보조공학 이름에서만 지운 층(`aria-hidden`), 검색과 포커스에서 격리한 층(`inert`). 다섯 작업이 각자 다른 잣대로 돌아갔다.

## until-found는 닫혀 있어도 테두리 자리를 차지한다

일반 `hidden`은 `display: none`, `until-found`는 `content-visibility: hidden`을 쓴다.

`#box-until`의 계산된 스타일은 `display: block`, `content-visibility: hidden`이었다. `el.hidden`은 `true`가 아니라 문자열 `"until-found"`를 돌려줬다.

패딩과 테두리가 있는 `#box-until-box`의 `getBoundingClientRect`는 닫힌 상태에서 1214×40이었다. 내용은 렌더링되지 않았지만 빈 프레임은 남았다.

프래그먼트 링크를 누르자 `beforematch` 이벤트가 한 번 발생하며 `hidden` 속성이 벗겨졌다. 상자 크기는 1214×40에서 1214×90이 되었다.

`hidden="until-found" style="display:none"`인 `#box-until-none`은 `window.find`와 프래그먼트가 실패했다. 해시 링크는 `beforematch`를 발생시키고 `hidden`을 벗겼지만, 스타일시트의 `display: none`이 남아 단락 높이는 0이었다.

## 내 사이트 FAQ 컴포넌트를 열어봤다

`src/components/FAQ.astro` 파일을 열었다. 컴포넌트는 `<details class="faq-item">` 태그를 쓰고 있었다. 라이브 페이지의 네 FAQ 항목 중 첫 번째만 `open`이었고, 1~3번은 닫혀 있었다.

`document.body.innerText`는 화면에 렌더링된 텍스트만 보므로 `false`를 냈다. 하지만 돔 트리에 텍스트 노드가 살아 있어 `document.body.textContent`와 `window.find`는 `true`였다.

`window.scrollY`가 8752로 이동했다. 두 번째 `details` 요소가 열리며 `hitOpen: true`를 기록했고, 열린 아코디언의 상단 위치는 `getBoundingClientRect().top` 373을 찍었다.

## 남은 한계와 아직 풀지 못한 것

이번 실험은 2026년 8월 15일, Node 22.22, Playwright 1.57.0, Chromium 143.0.7499.4 단일 빌드, 1280×800 뷰포트 환경에서 로컬 정적 서버로 측정한 결과다. Firefox의 Gecko나 Safari의 WebKit은 돌리지 않았다. 다른 엔진에서 `hidden="until-found"`가 동일하게 작동한다고 단정할 수 없다.

```javascript
if (!('onbeforematch' in HTMLElement.prototype)) {
  // 지원하지 않는 브라우저에서는 닫힌 내용이 열리지 않는다
}
```

Google 검색 센터 문서에는 아코디언이나 탭 콘텐츠로 숨긴 텍스트를 스팸으로 보지 않는다는 문구가 있다.

이 문장은 스팸으로 보지 않겠다는 정책 선언일 뿐, 닫힌 텍스트가 검색 결과나 AI 스니펫에 인용된다는 보장이 아니다.

실험에서 쓴 `window.find()`는 사용자가 키보드로 여는 검색창 UI와 같지 않다. 픽스처 JSON은 `/tmp`에 남겨 두었고 저장소로 복사하지 않았다. 다시 돌리면 `scrollY` 수치가 달라진다.

도착과 열림을 일치시키는 일, 그리고 브라우저 지원이 없는 환경에서 닫힌 문장이 침묵하지 않게 만드는 안전장치. 이 두 가지를 컴포넌트 레벨에서 어떻게 상설화할지는 아직 내 과제로 남아 있다.
