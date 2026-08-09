---
title: '320px로 재면 리플로우는 절반만 잰 것이다: 400% 확대의 높이 200px'
description: 'WCAG 1.4.10 리플로우를 320x844, 320x256, 320x200 세 조건으로 같이 재봤다. 가로 판정은 세 조건이 한 픽셀도 다르지 않았고, 400% 확대에서 달라지는 것은 높이였다. 82px짜리 sticky 헤더가 뷰포트의 41%를 먹고 있었다.'
pubDate: '2026-08-09'
heroImage: '../../../assets/blog/reflow-1410-400-zoom-viewport-height-2026/hero.png'
tags:
  - 접근성
  - WCAG
  - CSS
  - 반응형
  - 웹개발
faq:
  - question: '리플로우는 브라우저 창을 320px로 줄여서 확인하면 되는 것 아닌가요?'
    answer: '가로 방향은 그걸로 충분합니다. 제 측정에서 320x844, 320x256, 320x200 세 조건의 가로 넘침 판정은 페이지 목록도 넘침 픽셀 값도 완전히 같았습니다. 다만 400% 확대는 폭만 320으로 만드는 게 아니라 높이도 200 근처로 줄입니다. 창을 옆으로만 줄이면 그 높이는 재지 않은 채 통과 판정을 내리게 됩니다.'
  - question: 'sticky 헤더를 쓰면 1.4.10 위반인가요?'
    answer: '아닙니다. 1.4.10의 판정 대상은 2차원 스크롤 발생 여부고, 헤더가 세로를 차지하는 것 자체는 이 기준의 위반 항목이 아닙니다. 다만 200px 뷰포트에서 82px 헤더는 화면의 41%입니다. 기준을 통과한 채로 본문이 네 줄만 남는 상태가 되므로, 확대 사용자를 실제로 고려한다면 짧은 뷰포트에서 헤더를 흐름으로 되돌리는 편이 낫습니다.'
  - question: 'Tailwind의 break-words로 긴 이메일 주소 넘침이 안 고쳐지는 이유가 뭔가요?'
    answer: 'break-words는 overflow-wrap: break-word이고, CSS Text 스펙은 이 값이 만드는 줄바꿈 기회를 min-content 내재 크기 계산에 넣지 않는다고 못박고 있습니다. 그리드나 플렉스 항목의 기본 min-width는 auto이므로 트랙이 여전히 그 긴 문자열 폭까지 벌어집니다. overflow-wrap: anywhere를 쓰거나 항목에 min-width: 0을 주면 해결됩니다.'
  - question: '코드 블록이 가로로 삐져나가면 리플로우 위반인가요?'
    answer: '그 코드가 자체 가로 스크롤 컨테이너 안에 있으면 페이지의 2차원 스크롤은 아닙니다. 제 표본에서 삐져나간 요소 43개 중 24개가 그런 경우였고, 585px나 밖으로 나간 code 요소가 있어도 페이지 넘침은 2px에 그쳤습니다. 판정 단위를 요소가 아니라 스크롤 컨테이너로 잡아야 합니다.'
relatedPosts:
  - slug: focus-not-obscured-sticky-header-scroll-padding-2026
    score: 0.88
    reason:
      ko: 같은 82px 헤더가 그때는 키보드 포커스를 가렸고 이번에는 확대 화면의 세로를 먹었다. 그때 넣은 scroll-padding-top 96px이 이번 200px 뷰포트에서는 오히려 짐이 됐다는 이야기까지 이어진다.
      ja: 同じ82pxのヘッダーが、あのときはキーボードフォーカスを隠し、今回は拡大画面の縦を食った。あのとき入れたscroll-padding-top 96pxが、200pxのビューポートでは逆に重荷になった話まで続く。
      en: The same 82px header hid keyboard focus back then; here it eats the vertical room at 400% zoom. The scroll-padding-top of 96px added in that post turns into a liability once the viewport is 200px tall.
      zh: 同一个 82px 的头部，那次遮住了键盘焦点，这次吃掉了放大后的纵向空间。那篇里加的 scroll-padding-top 96px，到了 200px 高的视口反而成了负担。
  - slug: text-spacing-1412-clamp-audit-2026
    score: 0.79
    reason:
      ko: 1.4.12 측정의 후속으로 잡았던 소재가 이 글이다. 그때는 자간을 넓혀 가로로 밀었고 이번엔 뷰포트를 320px로 좁혀 밀었다. 미는 방향은 반대인데 무너지는 곳은 꽤 겹친다.
      ja: 1.4.12の測定で次の宿題として置いた題材がこれだ。あのときは字間を広げて横に押し、今回はビューポートを320pxに狭めて押した。押す向きは逆でも、壊れる場所はよく重なる。
      en: This is the follow-up I parked at the end of the 1.4.12 run. That one pushed outward by widening spacing; this one pushes inward by shrinking the viewport to 320px. Opposite directions, largely the same casualties.
      zh: 这是 1.4.12 那次留下的后续题目。上次是把字距撑开、往外挤；这次是把视口压到 320px、往里挤。方向相反，塌的地方却大半重合。
  - slug: act-rules-axe-coverage-wcag-sc-2026
    score: 0.7
    reason:
      ko: axe 4.13.0의 105개 규칙 중 1.4.10에 태그된 것은 없다. 어느 기준이 자동 검사의 사정거리 밖인지 목록으로 확인해둔 글이라, 이번처럼 직접 재야 하는 항목을 고를 때 먼저 펼쳐보게 된다.
      ja: axe 4.13.0の105ルールに1.4.10のタグは一つもない。どの基準が自動検査の射程外かを一覧にしてある記事なので、今回のように手で測る項目を選ぶときにまず開くことになる。
      en: None of axe 4.13.0's 105 rules carries a 1.4.10 tag. That post is the inventory of which criteria sit outside automated reach, which is where you start when picking what to measure by hand.
      zh: axe 4.13.0 的 105 条规则里没有一条挂 1.4.10 的标签。那篇把哪些标准落在自动检测射程之外列成了清单，挑「得手动量」的项目时先翻它。
  - slug: wcag22-target-size-audit-2026
    score: 0.62
    reason:
      ko: 검사기 점수와 실제 기준 사이의 간격을 픽셀로 확인했던 글이다. 이번에도 통과 표시는 폭에 대해서만 나왔고 높이는 아무도 보지 않았다.
      ja: 検査ツールのスコアと実際の基準との隙間をピクセルで確かめた記事だ。今回も合格表示は幅についてだけ出て、高さは誰も見ていなかった。
      en: "That post measured, in pixels, the gap between a checker's score and the criterion itself. Same shape here: the pass covered width, and nobody looked at height."
      zh: 那篇用像素量了检测工具的分数和标准本身之间的缝。这次一样：通过只覆盖了宽度，高度没人看。
---

접근성 감사에서 리플로우 항목이 나오면 대개 브라우저 창을 320px까지 좁힌다. 가로 스크롤바가 안 생기면 통과다. 나도 그렇게 해왔다.

그런데 이 방법에는 재지 않고 지나가는 축이 하나 있다. 400% 확대는 폭만 320으로 만드는 게 아니라 높이도 같이 줄인다. 1280x800짜리 노트북에서 400% 확대를 걸면 뷰포트는 320x200 CSS px이 된다. 세로가 200이다. 내 사이트 헤더는 82px이고, 그 헤더는 sticky다.

오늘 세 조건을 나란히 걸어 16개 페이지를 쟀다. 320x844(좁은 휴대폰), 320x256(기준이 명시한 높이 하한), 320x200(400% 확대). 가로 판정은 세 조건이 한 픽셀도 다르지 않았다. 달라진 건 세로였고, 세로를 먹은 건 콘텐츠가 아니라 내가 붙인 헤더였다.

## 320과 256이라는 숫자가 어디서 나왔나

리플로우는 WCAG 2.2의 성공기준 1.4.10, 레벨 AA다. 규범 본문은 이렇다. 원문은 [W3C의 WCAG 2.2 권고안](https://www.w3.org/TR/WCAG22/#reflow)에 있다.

> Content can be presented without loss of information or functionality, and without requiring scrolling in two dimensions for:
>
> - Vertical scrolling content at a width equivalent to 320 CSS pixels;
> - Horizontal scrolling content at a height equivalent to 256 CSS pixels.
>
> Except for parts of the content which require two-dimensional layout for usage or meaning.

핵심 동사는 "requiring scrolling in two dimensions"다. 가로로 뭔가가 삐져나갔는지가 아니라, 읽기 위해 두 방향으로 스크롤해야 하는 상태가 되었는지를 본다. 이 구분은 나중에 실제 측정에서 요소 24개의 운명을 갈랐다.

320이라는 숫자의 출처도 명시돼 있다. [Understanding 문서](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)는 이렇게 적는다.

> 320 CSS pixels is equivalent to a starting viewport width of 1280 CSS pixels wide at 400% zoom.

즉 320px은 작은 휴대폰을 위한 숫자가 아니다. 1280px 창에서 400% 확대를 건 사용자를 위한 숫자다. 저시력 사용자가 브라우저 확대에 의존할 때 실제로 마주하는 화면의 폭이 그 값이라는 뜻이다. 같은 문서는 세로 쓰기 콘텐츠에 대해 "256 CSS pixels is equivalent to a starting viewport height of 1024 CSS pixels at 400% zoom"이라고도 적는다. 1024짜리 세로 공간을 네 배 확대하면 256이 남는다는 계산이다.

여기서 한 걸음 더 나가면 이 글의 출발점이 나온다. 400% 확대가 폭을 1280에서 320으로 줄인다면, 같은 확대는 높이도 800에서 200으로 줄인다. 기준이 폭에 대해서만 숫자를 준 이유는 세로 스크롤 콘텐츠에서 손실이 폭에서 발생하기 때문이지, 높이가 안 줄어들어서가 아니다. 창을 옆으로만 좁히는 테스트는 이 절반을 통째로 건너뛴다.

기준에는 예외도 있다. Understanding 문서가 드는 예시는 구체적이다.

> Examples of content which requires two-dimensional layout are images required for understanding (such as maps and diagrams), video, games, presentations, data tables (not individual cells), and interfaces where it is necessary to keep toolbars in view while manipulating content.

데이터 표가 예외 목록에 들어 있다는 점은 기억해둘 만하다. 표 전체는 예외지만 개별 셀은 아니라는 단서까지 달려 있다.

## 세 조건을 같이 걸어봤다

측정은 빌드 산출물을 대상으로 했다. `npm run build`로 나온 `dist/`에 1,366장의 HTML이 있고, 그중 16개 URL을 표본으로 잡았다. 4개 언어 홈, 목록 페이지, 본문 글 5편, 정적 페이지 몇 장이다. 로컬 정적 서버를 띄우고 Playwright 1.57.0의 Chromium으로 접속했다. Node는 22.22, `deviceScaleFactor`는 1, 모션은 `reduce`로 고정했다.

조건은 셋이고 폭은 전부 320이다.

| 조건 | 뷰포트 | 무엇을 흉내 내는가 |
|---|---|---|
| `narrow` | 320 x 844 | 좁은 휴대폰 |
| `floor` | 320 x 256 | 기준이 명시한 높이 하한 |
| `zoom400` | 320 x 200 | 1280x800 화면의 400% 확대 |

각 페이지에서 두 가지를 뽑았다. 하나는 문서의 `scrollWidth`가 `innerWidth`를 넘는 픽셀 수, 즉 페이지 단위의 가로 넘침. 다른 하나는 `position`이 `sticky`나 `fixed`인 요소가 뷰포트 위아래에서 차지하는 높이와 그것을 뺀 가용 콘텐츠 높이다.

기준선 결과부터 적는다.

| 조건 | 가로 스크롤 발생 페이지 | 최대 넘침 | 가용 높이 중앙값 | 가용 비율 |
|---|---|---|---|---|
| 320 x 844 | 16 / 16 | 17 px | 762 px | 90.3% |
| 320 x 256 | 16 / 16 | 17 px | 174 px | 68.0% |
| 320 x 200 | 16 / 16 | 17 px | 118 px | 59.0% |

가로 열 세 줄이 완전히 같다. 페이지 목록도 같고 넘침 픽셀 값의 분포도 같다. 16개 중 14개가 2px, 하나가 10px, 하나가 17px이었다. 세 번을 다르게 재고 같은 답을 얻었다.

이건 나쁜 소식이 아니라 쓸모 있는 소식이다. 리플로우의 가로 판정은 뷰포트 높이와 무관하다는 뜻이므로, 폭만 볼 거라면 조건을 하나만 걸어도 된다. 그러니 세 조건을 다 돌리는 값어치는 다른 열에 있다. 가용 비율 90.3%와 59.0% 사이의 31포인트 차이다.

## 삐져나간 43개 중 24개는 위반이 아니었다

요소 단위로 내려가면 그림이 훨씬 지저분하다. 표본 전체에서 자기 사각형의 오른쪽 끝이 뷰포트 밖으로 나간 요소는 43개였다. 그중 가장 심한 것은 어떤 본문 글의 `code` 요소로, 뷰포트를 585px 넘어갔다. 그런데 그 페이지의 페이지 단위 넘침은 2px이었다.

이유는 단순하다. 그 `code`는 `overflow-x`가 걸린 `pre` 안에 있다. `pre`가 자기 안에서 가로 스크롤을 처리하니 페이지는 넘어가지 않는다. 기준 본문이 "requiring scrolling in two dimensions"라고 쓴 것이 여기서 효력을 발휘한다. 독자는 코드 블록 안에서 옆으로 미는 것이지, 페이지를 옆으로 미는 게 아니다.

그래서 감사 스크립트에 조상 탐색을 넣었다. 어떤 요소가 삐져나갔을 때, 조상 중에 실제로 가로 스크롤이 걸린 컨테이너가 있는지를 올라가며 확인한다.

```js
let inScrollContainer = null;
for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
  const pcs = getComputedStyle(p);
  if ((pcs.overflowX === 'auto' || pcs.overflowX === 'scroll' || pcs.overflowX === 'hidden')
    && p.scrollWidth > p.clientWidth + 1) {
    inScrollContainer = p.tagName.toLowerCase() + ':' + pcs.overflowX;
    break;
  }
}
```

이 한 조각으로 43개가 24 대 19로 갈렸다. 흡수된 24개는 `pre` 안의 `code` 18개, 표 래퍼 안의 `thead`/`tbody` 6개다. 남은 19개가 실제로 페이지를 옆으로 밀고 있었다.

리플로우 감사를 요소 단위로 하면 이 24개가 전부 위반으로 잡힌다. 그 목록을 들고 앉으면 고칠 필요 없는 코드 블록을 반나절 손보게 된다. 판정 단위는 요소가 아니라 스크롤 컨테이너다.

한 가지는 정직하게 남겨둔다. 표 래퍼 안의 표를 "흡수됨"으로 분류한 것은 기준의 예외 조항과 겹치는 영역이라 내 판단이 들어간 부분이다. Understanding 문서가 데이터 표를 예외로 들고 있으니 방향은 맞지만, 스크립트가 스펙 판정을 대신한 건 아니다.

## 페이지를 실제로 옆으로 민 세 가지

남은 19개는 세 종류로 깔끔하게 나뉘었다. 원인이 다르고 고치는 방법도 다르다.

<strong>첫째, 헤더의 컨트롤 줄.</strong> 16개 페이지 전부에서 같은 요소가 2px씩 넘쳤다. 헤더 오른쪽의 테마 토글과 언어 전환 묶음이다. 320px에서 `nav`의 좌우 패딩 16px씩을 빼면 288px이 남는데, 브랜드 마크와 메뉴 버튼과 오른쪽 컨트롤의 고유 폭 합이 그 288을 2px 넘겼다. 16개 페이지에서 관측된 넘침 14건이 이 하나에서 나왔다.

<strong>둘째, 끊기지 않는 긴 문자열.</strong> 문의 페이지의 카드 두 장이 10px씩 넘쳤다. 카드 안에 이메일 주소가 한 덩어리로 들어 있고, 그 주소가 카드를 288px 트랙 밖으로 밀어냈다. 카드 실측 폭은 314px이었다.

<strong>셋째, 절대 안 접히는 다열 그리드.</strong> 개선 이력 페이지의 `.before-after`가 17px 넘쳤다. `grid-template-columns: 1fr auto 1fr`로 개선 전, 화살표, 개선 후를 가로로 놓는 구성인데, 좁은 폭에 대한 예외가 없어 320px에서도 3열을 유지하려 든다.

세 원인의 성격이 다르다는 게 이 분류의 쓸모다. 첫째는 여백 조정으로 끝나고, 셋째는 미디어 쿼리 하나로 끝난다. 둘째는 그렇게 간단하지 않았다.

## `break-word`로는 안 고쳐진다

긴 이메일 주소가 상자를 벌리는 문제는 흔하다. 반사적으로 Tailwind의 `break-words`를 붙였다. 다시 재봤더니 카드는 여전히 314px, 넘침도 여전히 10px이었다.

이건 Tailwind 문제가 아니라 CSS 스펙이 그렇게 정해둔 것이다. `break-words`는 `overflow-wrap: break-word`이고, [CSS Text Module Level 3](https://www.w3.org/TR/css-text-3/#overflow-wrap-property)은 그 값을 이렇게 정의한다.

> As for `anywhere` except that soft wrap opportunities introduced by `break-word` are *not* considered when calculating min-content intrinsic sizes.

바로 다음 줄에서 `anywhere`는 반대로 규정된다.

> Soft wrap opportunities introduced by `anywhere` *are considered* when calculating min-content intrinsic sizes.

그리드나 플렉스 항목의 기본 `min-width`는 `auto`이고, 그 값은 내용물의 min-content 크기를 따라간다. `break-word`가 만든 줄바꿈 기회는 그 계산에 안 들어가므로, 트랙은 여전히 끊기지 않은 이메일 주소 폭까지 벌어진다. 화면에 보이는 텍스트는 줄바꿈이 되는데 상자 크기는 안 줄어드는, 딱 헷갈리기 좋은 상태가 된다.

블로그 코드를 건드리기 전에 최소 재현으로 따로 확인했다. 288px짜리 그리드 트랙 안에 같은 이메일 주소를 넣은 카드를 네 벌 만들고 각각 다른 처방을 걸었다.

| 처방 | 카드 실측 폭 |
|---|---|
| 없음 | 304 px |
| `overflow-wrap: break-word` | 304 px |
| `overflow-wrap: anywhere` | 288 px |
| 항목에 `min-width: 0` + `break-word` | 288 px |

스펙 문장 그대로 나왔다. `break-word`는 한 픽셀도 못 줄이고, `anywhere`와 `min-width: 0`은 트랙 폭으로 정확히 맞춘다. 실제 수정은 `overflow-wrap: anywhere` 쪽으로 넣었다.

이 함정이 성가신 이유는 실패가 조용하기 때문이다. 스타일을 넣었고, 텍스트는 줄바꿈되고, 눈으로 보면 뭔가 달라진 것 같다. 페이지 넘침만 그대로다. [1.4.12 자간 측정](/ko/blog/ko/text-spacing-1412-clamp-audit-2026)에서 만났던 것과 같은 종류의 함정인데, 그때는 지표가 실패를 못 봤고 이번엔 처방이 원인을 못 건드렸다.

## 400% 확대에서 진짜로 달라지는 것

여기까지가 가로 이야기다. 그런데 세 조건을 다 돌린 이유는 세로에 있었다.

sticky 헤더의 실측 높이는 82px이다. 844px 뷰포트에서 이건 9.7%다. 눈에 거슬리지 않는다. 같은 헤더가 200px 뷰포트에서는 41%다. 남는 가용 높이는 118px이고, 본문 글의 줄 높이가 28px이니 한 화면에 본문이 네 줄 조금 넘게 남는다.

![320x200 뷰포트에서 sticky 헤더 유지 시와 흐름으로 되돌린 뒤의 실제 화면 비교. 왼쪽은 헤더가 82px을 덮어 본문 118px만 남고, 오른쪽은 200px 전체가 본문이다](../../../assets/blog/reflow-1410-400-zoom-viewport-height-2026/zoom400-before-after.png)

위 캡처는 본문 글을 2,600px 스크롤한 지점에서 같은 뷰포트를 두 번 찍은 것이다. 왼쪽이 기존 동작, 오른쪽이 수정 후다.

분명히 해둘 것이 있다. 이건 1.4.10 위반이 아니다. 기준이 판정하는 것은 2차원 스크롤 발생 여부이고, 헤더가 세로를 차지하는 것은 그 목록에 없다. 기준을 통과한 채로 본문이 네 줄만 보이는 상태가 성립한다.

그래도 나는 이걸 고치는 쪽이 맞다고 본다. 320px이라는 숫자가 확대 사용자에게서 나온 숫자라면, 같은 확대가 만드는 200px도 같은 사용자의 화면이다. 폭에 대해서만 그 사용자를 배려하고 높이는 안 보는 건 앞뒤가 안 맞는다. 게다가 Understanding 문서의 예외 목록에는 "interfaces where it is necessary to keep toolbars in view while manipulating content"가 들어 있다. 조작 중에 도구 모음을 계속 보여야 하는 인터페이스라면 화면을 점유할 근거가 있다는 뜻이다. 내 블로그 헤더는 그런 인터페이스가 아니다. 글을 읽는 동안 언어 전환 버튼이 계속 떠 있어야 할 이유는 없다.

## 고치고 다시 쟀다

수정은 네 군데다.

```css
/* Header.astro: 320px에서 컨트롤 줄이 2px 넘치는 문제 */
@media (max-width: 400px) {
  .site-header > nav { padding-inline: 0.75rem; }
  .site-header__row { gap: 0.5rem; }
}

/* Header.astro: 짧은 뷰포트에서는 헤더를 흐름으로 되돌린다 */
@media (max-height: 400px) {
  .site-header { position: static; }
}
```

```css
/* improvement-history: 좁은 폭에서 3열을 풀고 화살표를 눕힌다 */
@media (max-width: 480px) {
  .before-after { grid-template-columns: 1fr; gap: 0.5rem; }
  .arrow { transform: rotate(90deg); }
}
```

이메일 주소에는 `overflow-wrap: anywhere`를 걸었다.

네 번째가 조금 미묘하다. [지난달 2.4.11 포커스 가림 수정](/ko/blog/ko/focus-not-obscured-sticky-header-scroll-padding-2026)에서 `scroll-padding-top`을 96px로 넣어뒀다. 헤더가 82px이니 그 아래로 착지시키려던 값이다. 그런데 헤더가 사라지는 짧은 뷰포트에서 96px을 그대로 두면, 200px짜리 화면의 절반가량을 스크롤 여백으로 버리게 된다. 한 성공기준을 위해 넣은 값이 다른 성공기준의 조건에서 짐이 되는 셈이다.

```css
@media (max-height: 400px) {
  html {
    --header-height: 0px;
    scroll-padding-top: 1rem;
  }
}
```

다시 빌드하고 같은 스크립트를 같은 16개 URL에 돌렸다.

| 조건 | 가로 스크롤 페이지 (전 → 후) | 최대 넘침 | 가용 비율 (전 → 후) |
|---|---|---|---|
| 320 x 844 | 16 → 0 | 17 → 0 px | 90.3% → 90.3% |
| 320 x 256 | 16 → 0 | 17 → 0 px | 68.0% → 100.0% |
| 320 x 200 | 16 → 0 | 17 → 0 px | 59.0% → 100.0% |

400% 확대 조건에서 가용 높이가 118px에서 200px로 늘었다. 줄 수로 환산하면 4.2줄에서 7.1줄, 69% 증가다. 844px 조건의 90.3%는 일부러 그대로 뒀다. 그 높이에서는 헤더가 sticky인 편이 낫다고 보기 때문이고, 미디어 쿼리 조건도 거기에 맞춰 걸었다.

## 자동 검사기는 이걸 안 본다

`axe-core` 4.13.0에는 105개 규칙이 있고, 그중 `wcag1410` 태그가 붙은 것은 하나도 없다. 이름이 비슷해서 걸리는 것들은 성격이 다르다. `meta-viewport`는 확대를 막았는지를 보는 1.4.4 규칙이고, `scrollable-region-focusable`은 스크롤 영역에 키보드가 닿는지를 보는 2.1.1 규칙이다.

당연한 결과다. 리플로우는 뷰포트를 실제로 바꿔 렌더링을 다시 시켜야 판정되는 기준이고, DOM을 한 번 훑는 규칙 엔진의 작동 방식과 맞지 않는다. 이 항목이 자동 검사의 사정거리 밖이라는 사실 자체는 [규칙 커버리지를 세어본 글](/ko/blog/ko/act-rules-axe-coverage-wcag-sc-2026)에서 이미 확인해뒀다. 다만 사정거리 밖이라는 말은 손으로 재라는 뜻이지, 재지 말라는 뜻이 아니다. 오늘 쓴 스크립트는 100줄 남짓이고 16개 페이지 세 조건을 도는 데 1분이 안 걸렸다.

## 첫 실행에서 통과한 두 페이지

처음 돌렸을 때 16개 중 두 페이지가 넘침 0px에 가용 비율 100%로 나왔다. 보기 좋은 숫자였고, 하마터면 "일부 페이지는 이미 통과"라고 적을 뻔했다.

그 두 URL은 존재하지 않는 경로였다. 로컬 서버가 404를 돌려줬고, 404 응답 본문에는 헤더가 없으니 넘침도 없고 sticky 요소도 없었다. 완벽한 통과처럼 보이는 결과가 나온 이유가 그거였다.

그래서 스크립트에 응답 코드 확인을 넣었다.

```js
const resp = await page.goto(`http://localhost:${port}${u}`, { waitUntil: 'networkidle' });
if (!resp || resp.status() !== 200) {
  throw new Error(`${u} returned ${resp ? resp.status() : 'no response'} 표본 URL을 고쳐라`);
}
```

측정 도구가 실패를 통과로 바꿔 보고하는 경로는 대체로 이렇게 생겼다. 값이 이상해서 눈에 띄는 게 아니라, 값이 너무 좋아서 그냥 넘어간다. 표본 URL을 손으로 적는 감사 스크립트라면 응답 코드 확인은 선택이 아니다.

## 이 측정이 답하지 못하는 것

한 대의 macOS 기기, 하나의 Chromium 빌드에서 잰 값이다. 다른 엔진의 결과는 확인하지 않았다.

에뮬레이션과 실제 브라우저 확대는 같지 않다. 나는 뷰포트를 320x200으로 지정했지 브라우저의 확대 배율을 400%로 올린 게 아니다. 레이아웃 결과는 같아야 맞고 1.4.10이 판정하는 것도 레이아웃이지만, 기기 픽셀 비율이나 `srcset` 선택 같은 것은 두 방식에서 다르게 나온다. 이미지 선택까지 확인하려면 실제 확대로 다시 재야 한다.

표본은 1,366장 중 16장이다. 템플릿을 고르게 덮도록 골랐지만 전수는 아니고, 특히 본문 글은 5편만 봤다. 코드 블록과 표가 많은 글일수록 스크롤 컨테이너 분류가 결과를 좌우하니, 그쪽 표본을 늘리면 숫자가 흔들릴 여지가 있다.

가로 쓰기 콘텐츠만 봤다. 기준의 두 번째 항목인 "높이 256 CSS px에서의 가로 스크롤 콘텐츠"는 세로 쓰기 조판에 해당하는데, 내 사이트에는 `writing-mode: vertical-rl`을 쓰는 본문이 없어 측정 대상이 없었다. 세로 쓰기를 쓰는 일본어 사이트라면 이 축을 따로 봐야 한다.

마지막으로, 콘텐츠 손실 유형 중 겹침은 안 쟀다. 이번 스크립트가 보는 것은 문서의 가로 넘침과 고정 요소의 세로 점유뿐이다.

## 반나절이면 도는 점검 순서

1. 빌드 산출물에서 템플릿별로 10~20개 URL을 뽑는다. 홈, 목록, 본문, 폼이 있는 정적 페이지를 섞는다.
2. 응답 코드가 200인지 먼저 확인한다. 404를 재고 통과라고 적는 사고를 막는다.
3. 320px 폭 하나로 가로 넘침을 잰다. 높이는 아무 값이나 좋다. 세 높이가 같은 답을 준다.
4. 삐져나간 요소는 조상에 가로 스크롤 컨테이너가 있는지로 걸러낸다. 걸러진 것은 고치지 않는다.
5. 남은 것을 세 갈래로 분류한다. 컨트롤 줄의 고유 폭, 끊기지 않는 긴 문자열, 안 접히는 다열 그리드.
6. 긴 문자열에는 `overflow-wrap: anywhere`를 쓴다. `break-word`는 min-content를 안 줄인다.
7. 높이 200px 조건을 따로 한 번 건다. sticky/fixed 요소가 뷰포트의 몇 퍼센트를 먹는지 계산한다.
8. 30%를 넘으면 `@media (max-height: ...)`로 흐름에 돌려놓는 걸 검토한다. 같이 걸어둔 `scroll-padding-top`이 있다면 그것도 같이 줄인다.

7번과 8번은 1.4.10의 판정 항목이 아니다. 통과 여부와 무관하게, 확대 사용자에게 실제로 남는 화면이 몇 줄인지를 아는 일이다. 내 경우엔 4.2줄이었다.

확대 400%는 접근성 체크리스트에서 대개 마지막 줄에 있고, 대개 눈으로 한 번 보고 넘어간다. 그 한 줄을 실측 숫자와 다시 돌릴 수 있는 스크립트로 바꿔놓는 일이라면 맡을 수 있다. 경로는 [문의 페이지](/ko/contact/) 하나다.

---

*출처: W3C의 [WCAG 2.2 성공기준 1.4.10 Reflow](https://www.w3.org/TR/WCAG22/#reflow)(W3C 권고안, 2024년 12월 12일), [Understanding SC 1.4.10](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html), [CSS Text Module Level 3](https://www.w3.org/TR/css-text-3/#overflow-wrap-property)(Candidate Recommendation)(모두 공식). 성공기준 본문과 `overflow-wrap` 두 값의 정의는 원문을 축자로 옮겼고, 인용 바로 앞에 원문 링크를 두었다. 측정 환경: jangwook.net 프로덕션 빌드(HTML 1,366장) 중 표본 16개 URL, 뷰포트 320×844·320×256·320×200, Playwright 1.57.0 + Chromium 헤드리스, Node 22.22, `deviceScaleFactor` 1, 로컬 정적 서버, 2026년 8월 9일 측정. 스크립트는 `scripts/audit-reflow.mjs`, 원자료는 `data/reflow-audit.json`과 `data/reflow-audit-after.json`. 뷰포트 지정은 브라우저 확대 배율 조작이 아니므로 기기 픽셀 비율과 `srcset` 선택은 실제 400% 확대와 다를 수 있다. 모든 수치는 이 엔진·이 표본에서 나온 값이며, 다른 사이트의 위반율이나 다른 렌더링 엔진의 동작에 대한 진술이 아니다. 겹침 유형의 콘텐츠 손실과 세로 쓰기 콘텐츠는 측정하지 않았다.*
