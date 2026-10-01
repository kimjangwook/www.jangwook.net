---
title: 'Tab으로 0건, Shift+Tab으로 16건: 스티키 헤더가 삼킨 키보드 포커스'
description: '같은 6개 페이지를 Tab으로 내려가며 재면 WCAG 2.4.11 위반이 0건, Shift+Tab으로 올라가며 재면 16건이었다. 브라우저가 포커스 대상을 화면에 넣는 정렬이 진행 방향에 따라 달라지기 때문이다. CSS 한 줄로 16건을 0건으로 줄인 바로 그 실측이다.'
pubDate: '2026-08-04'
heroImage: '../../../assets/blog/focus-not-obscured-sticky-header-scroll-padding-2026/hero.png'
tags:
  - 접근성
  - WCAG
  - 키보드
  - CSS
  - 웹개발
faq:
  - question: 'axe나 Lighthouse로 2.4.11을 잡을 수 있나요?'
    answer: 'Deque가 공개한 axe 규칙 목록에는 포커스가 다른 콘텐츠에 덮이는지 판정하는 규칙이 없습니다. WCAG 2.2에서 신설된 기준 중 자동 규칙이 붙어 있는 것은 타깃 크기(2.5.8) 정도이고, 포커스 가림은 수동 검사 영역으로 남아 있습니다. 다만 자동화가 원리적으로 불가능한 것은 아닙니다. 스크롤 상태에서 히트 테스트를 해야 하므로 정적 DOM 검사기로는 판정할 수 없고, 브라우저를 띄우면 됩니다.'
  - question: 'scroll-padding-top 값은 얼마로 잡아야 하나요?'
    answer: '헤더의 실측 높이에 포커스 링이 들어갈 여유를 더한 값입니다. 제 사이트 헤더는 데스크톱 81px, 모바일 82px였고 calc(5rem + 1rem) = 96px으로 잡았습니다. 헤더 높이를 CSS 변수로 두고 그 변수를 참조하면 헤더 디자인이 바뀔 때 같이 따라옵니다. 스티키 푸터가 있으면 scroll-padding-bottom도 같이 필요합니다.'
  - question: '포커스 이벤트를 잡아 JavaScript로 스크롤을 보정하면 안 되나요?'
    answer: '동작은 합니다만 순서가 나쁩니다. 브라우저가 이미 스크롤을 끝낸 뒤에 한 번 더 스크롤하는 구조라 화면이 튀고, 스무스 스크롤 설정과 겹치면 어긋납니다. scroll-padding은 브라우저가 무엇을 "화면 안"으로 볼지의 정의 자체를 바꾸므로 처음부터 올바른 위치로 스크롤합니다. 계산도 브라우저가 합니다.'
  - question: '접근성을 고치면 검색 순위에 도움이 되나요?'
    answer: '제가 잰 범위에서는 그런 연결을 확인하지 못했고, 그렇게 주장할 근거도 없습니다. 2.4.11은 적합성과 사용성 기준입니다. 키보드로 사이트를 쓰는 사람이 자기가 어디에 있는지 볼 수 있게 하는 것이 목적이고, 그 이상을 약속하는 것은 과장입니다.'
relatedPosts:
  - slug: wcag22-target-size-audit-2026
    score: 0.76
    reason:
      ko: 같은 WCAG 2.2 신설 기준을 다루지만 축이 다르다. 그쪽은 포인터가 닿을 크기, 이쪽은 그 크기가 헤더에 덮였는지다. 두 기준이 서로를 대신하지 못한다는 점이 두 글을 붙여 읽으면 분명해진다.
      ja: 同じWCAG 2.2の新規基準でも軸が違う。あちらはポインターが届く大きさ、こちらはその大きさがヘッダーに覆われていないか。二つの基準が互いを代替しないことが、並べて読むと見えてくる。
      en: Both cover criteria new in WCAG 2.2, but on different axes. That one is whether a target is big enough to hit; this one is whether that target stays visible under a header. Read together, they show why passing one says nothing about the other.
      zh: 两篇都讲 WCAG 2.2 新增的标准，但轴不同：那篇是指针能否点得到，这篇是点得到的东西有没有被吸顶头部盖住。并读就知道，过了一条并不代表另一条也过。
  - slug: modal-focus-escape-inert-measure-2026
    score: 0.72
    reason:
      ko: 모달에서 포커스가 새어 나가는 걸 재던 글이다. 이번 글은 포커스가 제자리에 있는데도 보이지 않는 경우를 잰다. 포커스 관리에는 "어디로 가는가"와 "간 곳이 보이는가"라는 두 문제가 따로 있다.
      ja: モーダルからフォーカスが漏れる挙動を測った記事。今回はフォーカスが正しい場所にあるのに見えないケースを測る。フォーカス管理には「どこへ行くか」と「行った先が見えるか」という別の問題がある。
      en: That one measured focus leaking out of a modal. This one measures focus sitting exactly where it should while being invisible. Managing focus is two separate problems, where it goes and whether you can see where it went.
      zh: 那篇测的是焦点从模态框漏出去。这篇测的是焦点明明在该在的位置，却看不见。焦点管理其实是两件事：去了哪里，以及去了之后看不看得见。
  - slug: axe-core-ci-a11y-jsdom-vs-browser-2026
    score: 0.68
    reason:
      ko: jsdom이 색상 대비를 판정 못 하는 이유를 파던 글이다. 포커스 가림은 그보다 한 칸 더 나간 경우다. 레이아웃뿐 아니라 스크롤 상태까지 필요하므로, 정적 DOM 검사기에는 애초에 규칙이 없다.
      ja: jsdomがコントラスト比を判定できない理由を追った記事。フォーカスの隠れはさらに一段先で、レイアウトだけでなくスクロール状態まで必要になる。だから静的DOM検査には最初からルールが無い。
      en: That post dug into why jsdom cannot judge color contrast. Focus occlusion sits one step further out. It needs scroll state, not just layout, which is why static DOM checkers have no rule for it at all.
      zh: 那篇追的是 jsdom 为何判不了对比度。焦点被遮挡还要更进一步，它需要的是滚动状态而不只是布局，所以静态 DOM 检查器里根本没有这条规则。
  - slug: wcag-em-2-sampling-vs-full-sweep-audit-2026
    score: 0.63
    reason:
      ko: 표본이 페이지 축에서 무엇을 놓치는지 셌던 글이다. 이번 글은 같은 페이지를 어느 방향으로 걷는지가 결과를 뒤집는다는 걸 보여준다. 커버리지에는 페이지 수 말고 다른 축이 있다.
      ja: 標本がページ軸で何を取り落とすかを数えた記事。今回は同じページをどちらの向きに歩くかで結果が反転することを示す。カバレッジにはページ数以外の軸がある。
      en: That audit counted what a sample misses along the page axis. This one shows the same pages flipping their verdict depending on which direction you walk them. Coverage has axes other than page count.
      zh: 那篇数的是抽样在页面这条轴上漏了什么。这篇则显示同样的页面，走的方向不同结论就反过来。覆盖率不止「页面数」这一条轴。
---

Tab 키를 눌러 사이트를 끝까지 내려가며 포커스 위치를 확인했다. 위반 0건. 같은 페이지에서 이번엔 Shift+Tab으로 거슬러 올라가며 같은 검사를 돌렸다. 16건.

바뀐 것은 사이트가 아니라 내가 걸은 방향뿐이다.

브라우저는 포커스가 화면 밖 요소로 옮겨갈 때 그 요소를 화면 안으로 끌어온다. 이때 어느 위치에 놓을지는 어느 쪽에서 왔는지에 달려 있다. 아래로 내려가면 요소는 뷰포트 아래쪽 끝에 붙고, 위로 올라가면 위쪽 끝에 붙는다. 그리고 내 사이트의 위쪽 끝에는 81픽셀짜리 스티키 헤더가 앉아 있다.

## 2.4.11은 포커스 링이 있느냐를 묻지 않는다

포커스 표시가 보이는지는 오래된 기준이다. WCAG 2.2가 새로 넣은 것은 그 표시가 다른 콘텐츠에 덮이지 않는지다. 두 기준은 별개다. 링을 3픽셀로 굵게 그리고 대비를 맞춰도, 그 링이 헤더 밑에 있으면 사용자에게는 아무 일도 일어나지 않은 화면이다.

성공 기준 원문을 [W3C 권고안](https://www.w3.org/TR/WCAG22/)(2024년 12월 12일자)에서 그대로 옮기면 이렇다.

> When a user interface component receives keyboard focus, the component is not entirely hidden due to author-created content.

핵심은 `entirely`다. 이 AA 기준은 "전부 가려지면 실패"이고, 일부만 가려지는 것은 허용한다. 전부 보여야 한다는 요구는 AAA인 2.4.12로 따로 있다. 같은 문서의 표현이다.

> When a user interface component receives keyboard focus, no part of the component is hidden by author-created content.

왜 AA가 절반의 가림을 허용하는지는 [해설 문서](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html)가 직접 밝힌다.

> In recognition of the complex responsive designs common today, this AA criterion allows for the component receiving focus to be partially obscured by other author-created content.

같은 문서는 무엇이 주로 가리는지도 이름을 대어 적어 놓았다.

> Typical types of content that can overlap focused items are sticky footers, sticky headers, and non-modal dialogs.

여기서 두 가지가 판단 기준으로 남는다. 하나는 `author-created content`라는 한정이다. 브라우저 UI나 사용자가 켠 확장 기능이 가리는 것은 이 기준의 책임이 아니다. 다른 하나는 사용자가 스스로 치울 수 있는 콘텐츠에 대한 예외다.

> Content opened by the user may obscure the component receiving focus. If the user can reveal the focused component without advancing the keyboard focus, the component with focus is not considered visually hidden due to author-created content.

사용자가 열었고, 포커스를 옮기지 않고도 걷어낼 수 있는 것은 실패가 아니다. 스티키 헤더는 여기에 해당하지 않는다. 사용자가 열지 않았고, 치울 방법도 없다.

## 자동 검사 목록에 이 기준은 없다

Deque가 공개한 axe 규칙 목록을 훑어봤다. 포커스가 다른 콘텐츠에 덮이는지 판정하는 규칙은 없다. WCAG 2.2에서 신설된 기준 중 자동 규칙이 붙은 것은 타깃 크기(2.5.8) 정도다.

내 사이트에서도 같은 결과였다. 이틀 전 axe-core 4.12.1로 빌드 산출물 1,342장을 전수로 훑었을 때 나온 위반 규칙은 라벨, 리스트 구조, 문서 제목, 언어 속성 네 종뿐이었다. 포커스 가림은 그 목록에 이름을 올리지 않았다. 그 전수 스캔이 무엇을 잡고 무엇을 못 잡았는지는 [표본 26장과 전수 1,342장을 맞대어 본 기록](/ko/blog/ko/wcag-em-2-sampling-vs-full-sweep-audit-2026/)에 따로 적어 뒀다.

나는 이걸 "자동화 불가"로 읽지 않는다. 규칙이 없는 이유는 판정에 필요한 정보가 정적 DOM에 없기 때문이다. 요소가 어디에 그려지는지, 그 위에 무엇이 겹치는지, 스크롤이 어디까지 내려간 상태인지를 알아야 한다. 레이아웃 엔진과 히트 테스트가 필요하다는 뜻이고, 그건 브라우저를 띄우면 해결된다. 그래서 규칙을 기다리는 대신 측정을 썼다.

## 키를 실제로 누르고, 포커스 사각형을 25점으로 찍는다

판정 논리는 짧다. 포커스된 요소의 클라이언트 사각형을 뷰포트로 자르고, 그 안에 5×5 격자로 25개 점을 찍는다. 각 점에서 `document.elementFromPoint`를 불러 맨 위에 있는 요소를 확인한다. 25점 전부가 다른 요소에 잡히면 전부 가려진 것이고, 일부만 잡히면 부분 가림이다.

```js
const x0 = Math.max(0, r.left), y0 = Math.max(0, r.top);
const x1 = Math.min(innerWidth, r.right), y1 = Math.min(innerHeight, r.bottom);
let visible = 0, total = 0;
for (let i = 0; i < 5; i++) {
  for (let j = 0; j < 5; j++) {
    const x = x0 + (x1 - x0) * (i + 0.5) / 5;
    const y = y0 + (y1 - y0) * (j + 0.5) / 5;
    total++;
    const top = document.elementFromPoint(x, y);
    // 조상 요소가 잡히는 것은 가려진 게 아니라 그 점이 요소 위가 아닌 것이다.
    // 두 줄로 접힌 인라인 링크의 줄 간격이 이 경우에 해당한다.
    if (!top || top === el || el.contains(top) || top.contains(el)) { visible++; continue; }
    // 가린 요소는 자신이 아니라 가장 가까운 sticky/fixed 조상으로 귀속시킨다.
    const key = anchored(top) || desc(top);
    blockers[key] = (blockers[key] || 0) + 1;
  }
}
```

조상 요소가 잡히면 가려진 것으로 세지 않는다는 조건이 중요하다. 두 줄로 접힌 인라인 링크는 사각형이 두 줄을 통째로 감싸므로 줄 사이 빈 공간이 사각형 안에 들어온다. 그 지점에서는 링크의 부모가 잡힌다. 이걸 가림으로 세면 멀쩡한 링크가 전부 위반이 된다.

가린 요소를 기록할 때는 그 요소 자체가 아니라 가장 가까운 `position: sticky` 또는 `fixed` 조상을 적었다. 개발자가 손을 대야 하는 대상은 헤더 안의 `div`가 아니라 헤더다.

걷는 방식에서 두 번 걸렸다. 첫 버전은 Tab을 누른 횟수를 그대로 셌다. Shift+Tab은 첫 요소를 지나면 마지막 요소로 되돌아오므로 같은 요소를 계속 다시 재고 있었고, 2,141개여야 할 측정이 4,149개로 부풀었다. 그래서 검사 전에 모든 포커스 가능 요소에 `data-fidx` 번호를 붙이고, 이미 본 번호가 다시 나오면 세지 않도록 고쳤다.

두 번째가 더 중요하다. 처음에는 편하게 `element.focus()`를 불러 순회할 생각이었다. 그렇게 하면 아무것도 잡히지 않는다. Chromium은 스크립트가 부른 `focus()`에 대해 요소를 화면 중앙에 놓는다. 800픽셀 뷰포트에서 착지점이 y=367이었다. 반면 실제 Tab과 Shift+Tab은 가장 가까운 끝에 붙인다. 같은 요소가 y=24에 놓인다. 결함은 후자에서만 재현된다.

<strong>이 결함을 찾는 스크립트는 키를 실제로 눌러야 한다.</strong> `focus()`로 순회하는 감사 도구는 사이트가 어떻든 0건을 보고한다. 이번 측정에서 건진 것 중 가장 쓸 만한 사실이 이거다.

## 방향을 바꾸자 0건이 16건이 됐다

측정 범위는 빌드 산출물 1,350장 중 6개 페이지(홈, 글 목록, 긴 글 두 편, 소개, 문의)에 데스크톱 1280×800과 모바일 390×844를 곱한 12개 조합이다. 각 조합에서 Tab으로 한 바퀴, Shift+Tab으로 한 바퀴 돌았다.

```text
$ node scripts/audit-focus-obscured.mjs --path /ko/ --path /ko/blog/ ...
  pages           6 x viewports 2   (chromium 1.57)
  focus stops     2141   (forward 1072 / reverse 1069)
  2.4.11  AA      16   forward 0 / reverse 16
  2.4.12  AAA     199   forward 6 / reverse 193
  invisible focus 4
  AA blockers     {"header.site-header.sticky[sticky]":16}
```

AA 위반 16건의 가린 요소는 16건 모두 같은 하나다. 스티키 헤더. 다른 후보는 없었다.

![포커스된 summary 요소가 스티키 헤더에 완전히 덮인 화면. 아래에 답변 텍스트만 보이고 질문 행과 포커스 링은 보이지 않는다](../../../assets/blog/focus-not-obscured-sticky-header-scroll-padding-2026/fully-obscured-summary.png)

위 화면이 실패의 모습이다. 홈의 FAQ 아코디언 `<summary>` 하나가 포커스를 받았고, 사각형은 y=0에서 y=72까지다. 헤더는 y=81까지 덮는다. 25점 중 0점이 살아남았다. 화면에는 답변 텍스트만 남아서, 키보드 사용자에게는 Shift+Tab을 눌렀는데 아무 일도 일어나지 않은 것으로 보인다.

가려진 요소의 종류를 세어 보면 카드 제목 링크가 9건으로 가장 많다. 여기서 뜨끔한 대목이 하나 나온다. 사흘 전에 나는 카드 전체를 `<a>`로 감싸던 마크업을 제목만 링크하고 `::after` 오버레이로 클릭 영역을 넓히는 패턴으로 바꿨다. [인바운드 앵커 텍스트가 367자까지 늘어나던 문제를 고치려던 작업](/ko/blog/ko/title-declaration-channels-anchor-text-audit-2026/)이었다. 그 결과 링크의 포커스 사각형이 카드 전체 300여 픽셀에서 제목 두 줄 65픽셀로 줄었다. 헤더 81픽셀보다 작아졌다. 카드 전체를 감싸던 시절에는 위쪽 끝에 걸려도 아래 절반이 보였다. 접근성 지표 하나를 고치면서 다른 기준의 실패를 만든 셈이다.

방향과 뷰포트로 갈라 보면 이렇다.

| 구분 | 포커스 정지 지점 | 2.4.11 (AA) | 2.4.12 (AAA) |
|---|---|---|---|
| Tab (아래로) | 1,072 | 0 | 6 |
| Shift+Tab (위로) | 1,069 | 16 | 193 |
| 데스크톱 1280×800 | 1,093 | 10 | 174 |
| 모바일 390×844 | 1,048 | 6 | 25 |

데스크톱과 모바일의 차이는 같은 카드 제목이 몇 줄로 접히는지에 달려 있다. 줄이 늘어나 사각형이 헤더보다 커지면 아래쪽이 살아남는다. 요소별로 그 관계를 다 재보지는 않았으니 여기까지만 적는다.

## 한 줄로 끝난 수정, 그리고 남은 25건

고칠 자리는 포커스 쪽이 아니라 스크롤 쪽이다. 브라우저가 "요소를 화면 안에 넣었다"고 판단하는 영역을 헤더 아래부터 시작하도록 바꾸면 된다. 그 영역을 정의하는 속성이 `scroll-padding`이고, [CSS Scroll Snap Module Level 1](https://www.w3.org/TR/css-scroll-snap-1/#propdef-scroll-padding)의 정의를 그대로 옮기면 이렇다.

> This property specifies (for all scroll containers, not just scroll snap containers) offsets that define the optimal viewing region of a scrollport: the region used as the target region for placing things in view of the user. This allows the author to exclude regions of the scrollport that are obscured by other content (such as fixed-positioned toolbars or sidebars)

이 속성은 보통 해시 앵커로 점프할 때 제목이 헤더에 가리는 문제의 해법으로 소개된다. 실제 역할은 그보다 넓다. 같은 영역이 포커스 이동에 따른 스크롤에도 쓰이므로, 이건 키보드 접근성 설정값이다.

내 사이트에 넣은 것은 이 세 줄이다.

```css
html {
  --header-height: 5rem;
  scroll-padding-top: calc(var(--header-height) + 1rem);
}
```

헤더 실측 높이가 데스크톱 81픽셀, 모바일 82픽셀이었으므로 5rem에 포커스 링 여유 1rem을 더해 96픽셀로 잡았다. 헤더 높이를 변수로 둔 이유는 디자인이 바뀔 때 두 값이 같이 움직이게 하려는 것이다.

![같은 요소, 같은 Shift+Tab 단계. 위는 scroll-padding-top이 auto일 때 착지점 y=24로 헤더에 덮인 상태, 아래는 96px일 때 착지점 y=96으로 포커스 링이 온전히 보이는 상태](../../../assets/blog/focus-not-obscured-sticky-header-scroll-padding-2026/focus-landing-before-after.png)

같은 페이지에서 같은 Shift+Tab 단계에 도달하는 카드 링크의 착지점이 y=24에서 y=96으로 옮겨갔다. 96은 방금 넣은 값과 정확히 같다. 25점 중 5점이 살아남던 것이 25점 전부가 된다.

소스를 고치고 다시 빌드한 뒤 같은 스크립트를 그대로 돌렸다.

| 지표 | 수정 전 | 수정 후 |
|---|---|---|
| 고유 포커스 정지 지점 | 2,141 | 2,133 |
| 2.4.11 (AA) 위반 | 16 | 0 |
| 2.4.12 (AAA) 위반 | 199 | 25 |
| 포커스는 갔는데 요소가 투명 | 4 | 0 |
| AA 위반의 가림 주체 | 스티키 헤더 16건 | 없음 |

AA는 0이 됐다. 남은 AAA 25건은 손으로 하나씩 뜯어봤다. 결론은 이 숫자를 그대로 믿으면 안 된다는 쪽이다. 14건은 맨 위로 가는 원형 버튼이다. 지름 48픽셀 원인데 사각형의 네 모서리는 원 밖이므로 그 네 점이 뒤쪽 콘텐츠에 잡힌다. 25점 중 4점, 즉 16%가 가려진 것으로 나오지만 실제로 겹친 것은 없다. 격자가 비사각형 요소를 오판한 경우다. 10건은 관련 글 목록의 인라인 링크로, 두 줄로 접힌 사각형의 줄 간격에서 옆 링크가 잡혔다. 나머지 1건은 문의 페이지에 박힌 높이 1,000픽셀 폼 `<iframe>`이다. 뷰포트가 800픽셀이므로 이 요소는 어떻게 스크롤해도 전부 보일 수 없다. 뷰포트보다 큰 컴포넌트에 AAA는 구조적으로 도달할 수 없다.

정리하면 AA 축은 CSS 한 줄로 닫혔고, AAA 축의 숫자는 사람이 분류해야 결론이 된다.

JavaScript로 고치는 길도 있다. `focusin`을 잡아 `scrollBy`로 밀어주는 코드를 몇 번 본 적이 있다. 나는 그 방식을 권하지 않는다. 브라우저가 이미 스크롤을 마친 뒤에 한 번 더 스크롤하는 구조이므로 화면이 눈에 보이게 튀고, 스무스 스크롤과 겹치면 어긋난다. `scroll-padding`은 판단 기준 자체를 바꾸므로 처음부터 옳은 위치로 스크롤한다. 계산도 브라우저가 한다.

## opacity: 0으로 숨긴 버튼은 탭 순서에 남아 있다

측정에는 덤이 하나 붙었다. 4개 정지 지점에서 포커스는 요소에 도달했는데 그 요소 자체가 투명했다. 맨 위로 가는 버튼이었다.

```css
/* 수정 전 */
.back-to-top {
  @apply opacity-0 translate-y-4 pointer-events-none;
}
.back-to-top.visible {
  @apply opacity-100 translate-y-0 pointer-events-auto;
}
```

`opacity: 0`도 `pointer-events: none`도 요소를 탭 순서에서 빼지 않는다. 그래서 페이지 맨 위에서 Tab을 계속 누르면 보이지 않는 버튼에 포커스가 멎는다. `pointer-events`는 포인터만 막으므로 그 상태에서 Enter를 누르면 버튼은 작동한다. 이건 가려진 문제가 아니라 아예 그려지지 않은 문제이고, 2.4.11이 아니라 포커스 표시(2.4.7) 쪽에 걸린다.

`visibility: hidden`을 더하면 요소가 순차 포커스 순회에서 빠진다. `visibility`는 이산적으로 전환되므로 기존 페이드 인 트랜지션도 유지된다. 처음엔 Tailwind 유틸리티로 `@apply invisible`과 `@apply visible`을 썼는데 빌드가 깨졌다. `.back-to-top.visible`이라는 선택자 안에서 `visible` 유틸리티를 불렀으니 자기 자신을 참조하는 셈이고, PostCSS가 순환 의존이라며 막았다. 유틸리티 대신 속성을 직접 썼다.

```css
/* 수정 후 */
.back-to-top {
  @apply opacity-0 translate-y-4 pointer-events-none;
  visibility: hidden;
}
.back-to-top.visible {
  @apply opacity-100 translate-y-0 pointer-events-auto;
  visibility: visible;
}
```

수정 후 고유 포커스 정지 지점이 2,141에서 2,133으로 줄었다. 8개가 사라진 것이 버튼이 탭 순서에서 빠졌다는 증거다. 보이지 않는 컨트롤을 숨기려면 투명도가 아니라 가시성이나 `inert`를 써야 한다.

## 이 측정이 말할 수 없는 것

히트 테스트는 지각이 아니다. `elementFromPoint`는 어느 요소가 그 좌표의 맨 위에 있는지만 답한다. 반투명하게 겹친 헤더 밑에서 글자가 읽히는지, 포커스 링의 대비가 충분한지는 다른 문제이고 사람이 봐야 한다.

5×5 격자는 비사각형 요소에서 틀린다. 위의 원형 버튼 14건이 그 증거다. 격자를 촘촘하게 해도 원의 모서리 문제는 남는다. 요소가 실제로 그려진 모양을 알아야 하는데, 그 정보는 히트 테스트로 나오지 않는다.

해설 문서가 인정하는 예외를 스크립트는 판단하지 못한다. 사용자가 열었고 포커스를 옮기지 않고 치울 수 있는 콘텐츠는 실패가 아니라는 조항인데, 무엇이 사용자가 연 것인지는 코드가 알 수 없다. 쿠키 배너나 비모달 대화상자를 쓰는 사이트라면 이 스크립트의 출력은 최종 판정이 아니라 후보 목록이다.

Chromium 하나에서만 쟀다. 포커스 대상을 화면에 넣는 정렬 방식은 사용자 에이전트 재량이므로 다른 엔진에서 착지점이 다를 수 있다. 다만 `scroll-padding`은 스펙에 명시된 속성이므로 방향은 같을 것으로 본다.

마지막으로, 검색 순위와는 무관하다. 나는 이 수정에서 순위 효과를 재지 않았고 그렇게 주장할 근거도 없다. 구조화 데이터가 순위를 보장하지 않는다는 것과 같은 맥락에서, 접근성 수정도 순위를 보장하지 않는다. 이건 적합성과 사용성 기준이다.

## 정리: 두 방향으로 걷고 CSS 한 줄을 확인한다

같은 문제를 자기 사이트에서 확인하려면 순서는 이렇다.

1. <strong>스티키하거나 고정된 요소의 실측 높이를 먼저 잰다.</strong> `getBoundingClientRect().height`를 데스크톱과 모바일에서 각각 재고, `getComputedStyle(document.documentElement).scrollPaddingTop`을 확인한다. 이 값이 `auto`이고 위쪽에 스티키 헤더가 있으면 위반 후보는 이미 존재한다.
2. <strong>`scroll-padding-top`을 헤더 높이 더하기 여유로 넣는다.</strong> 헤더 높이를 CSS 변수로 두고 참조한다. 스티키 푸터가 있으면 `scroll-padding-bottom`도 같이 넣는다. 내 경우 이 세 줄이 AA 위반 16건을 0건으로 만들었다.
3. <strong>감사 스크립트는 키를 실제로 누른다.</strong> `element.focus()`는 Chromium에서 요소를 중앙에 놓기 때문에 이 결함을 재현하지 못한다. Tab과 Shift+Tab을 양방향으로 돌리고, 요소마다 번호를 붙여 중복을 제거한다.
4. <strong>투명도로 숨긴 컨트롤을 찾는다.</strong> `opacity: 0`이나 `pointer-events: none`만으로 숨긴 요소는 탭 순서에 남는다. `visibility: hidden`, `display: none`, `inert` 중 하나를 쓴다.
5. <strong>AAA 숫자는 손으로 분류한 뒤에 쓴다.</strong> 원형 요소와 여러 줄로 접힌 인라인 요소, 뷰포트보다 큰 컴포넌트는 격자 방식에서 구조적으로 부분 가림으로 나온다.

측정 스크립트는 `scripts/audit-focus-obscured.mjs`로 저장소에 넣어 뒀다. 정적 빌드를 로컬에 띄우고 경로 몇 개를 넘기면 돌아간다.

이 스크립트는 셀렉터만 바꾸면 다른 사이트에서도 그대로 돈다. 남의 빌드에 물려 결과를 판정 가능한 리포트로 묶는 것도 내가 하는 일이다. 창구는 [프로필](/ko/about/).

---

*출처: W3C의 [Web Content Accessibility Guidelines (WCAG) 2.2](https://www.w3.org/TR/WCAG22/)(W3C 권고안, 2024년 12월 12일), [Understanding SC 2.4.11: Focus Not Obscured (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html), [CSS Scroll Snap Module Level 1](https://www.w3.org/TR/css-scroll-snap-1/#propdef-scroll-padding)(Candidate Recommendation Snapshot, 2021년 3월 11일), 자동 규칙 목록은 Deque의 [axe 규칙 목록](https://dequeuniversity.com/rules/axe/4.10)(모두 공식). 측정 환경: 자체 Astro 빌드 산출물, Playwright 1.57 + Chromium, 뷰포트 1280×800과 390×844, 페이지 6개, 고유 포커스 정지 지점 2,141개(수정 후 2,133개), 판정은 포커스 사각형 5×5 격자의 `document.elementFromPoint` 결과. 모든 수치는 이 사이트의 이 빌드와 이 브라우저에서 나온 값이며, 다른 사용자 에이전트의 스크롤 정렬 동작에 대한 진술이 아니다.*
