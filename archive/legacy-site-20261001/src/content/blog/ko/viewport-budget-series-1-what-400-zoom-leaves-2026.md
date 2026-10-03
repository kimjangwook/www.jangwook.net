---
title: "400% 확대에서 남는 화면을 실측했더니, 뷰포트 높이와 무관한 고정 px 통행료가 나왔다"
description: "320px 리플로우 판정을 통과한 페이지에서도 짧은 뷰포트에서는 본문에 남는 세로 공간이 118px까지 줄었다. 손실은 비율이 아니라 82px짜리 고정 픽셀 통행료였고, 대부분 우리 CSS 밖의 제3자 고정 컨테이너에서 나왔다. 측정 방법과 배포 회귀 게이트 설계까지 정리했다."
pubDate: '2026-08-23'
heroImage: '../../../assets/blog/viewport-budget-series-1-what-400-zoom-leaves-2026/hero.png'
tags:
  - 접근성
  - WCAG
  - CSS
  - 반응형
  - 웹개발
relatedPosts:
  - slug: reflow-1410-400-zoom-viewport-height-2026
    score: 0.92
    reason:
      ko: "400% 확대에서 가로 리플로우 통과와 세로 읽기 공간이 왜 다른 문제인지 먼저 설명합니다."
      ja: "400%ズーム時の横方向リフロー合格と、縦方向の閲覧余地が別問題である理由を説明します。"
      en: "Explains why passing horizontal reflow at 400% zoom does not establish usable vertical reading space."
      zh: "说明为什么在 400% 缩放下通过横向重排，并不代表仍有足够的纵向阅读空间。"
  - slug: focus-not-obscured-sticky-header-scroll-padding-2026
    score: 0.85
    reason:
      ko: "스티키 영역이 키보드 포커스와 읽기 흐름을 가리는 문제를 구현 관점에서 다룹니다."
      ja: "スティッキー領域がキーボードフォーカスと閲覧の流れを遮る問題を、実装の観点から扱います。"
      en: "Covers the implementation consequences when sticky regions obscure keyboard focus and reading flow."
      zh: "从实现角度讨论粘性区域遮挡键盘焦点和阅读流程的问题。"
  - slug: wcag22-target-size-audit-2026
    score: 0.72
    reason:
      ko: "접근성 준거 판정과 실제 사용성 회귀를 분리해 관리하는 감사 방식을 함께 볼 수 있습니다."
      ja: "アクセシビリティ適合性の判定と実際の使いやすさの後退を分けて管理する監査方法を確認できます。"
      en: "Shows how to separate conformance evidence from operational usability regression monitoring."
      zh: "展示如何将合规证据与实际可用性回归监控分开管理。"
---

# 400% 확대에서 남는 화면을 실측했더니, 뷰포트 높이와 무관한 고정 px 통행료가 나왔다

400% 확대에 해당하는 320px 폭의 짧은 화면에서 본문에 남는 공간이 얼마인지 알고 싶었다. 뷰포트 높이, 스크롤 상태, 페이지 타입, 브라우저 크롬 조건을 바꿔가며 `article` 또는 `main`에 실제로 도달하는 세로 픽셀을 셌다. 페이지는 가로 리플로우 판정을 전부 통과했다. 그런데 320x200 조건의 상단에서 본문에 남은 공간은 118px이었고, 별개의 고정 컨테이너 효과로 페이지 중간에서는 110px까지 떨어졌다.

이 결과가 중요한 이유는 하나다. 적합성 판정이 참인 채로 읽기 경험이 운영상 취약할 수 있다. 내 결론은 단순하다. WCAG 준거 보고는 그대로 두고, 남는 세로 픽셀을 별도의 배포 회귀 지표로 신설해라.

## 가로 리플로우 통과는 읽기 경험을 설명하지 못했다

대규모 현대화 프로젝트의 접근성 보고는 대개 깔끔한 한 문장으로 압축된다. 자동 검사 위반 0건, 리플로우 통과, 배포 승인. 유용한 문장이다. 그리고 저시력 사용자가 높이가 부족한 화면에서 페이지를 훑고 있을 때는 불완전한 문장이기도 하다. 첫 항목이 실제로 어디까지 커버하는지는 [정답지 1,213장에 검사기를 걸어 따로 쟀다](/ko/blog/ko/act-rules-axe-coverage-wcag-sc-2026). 여기서 보려는 것은 두 번째 항목이다.

WCAG 2.2 성공 기준 1.4.10은 세로 스크롤 콘텐츠가 320 CSS 픽셀 폭에서 동작할 것을 요구한다. 그 콘텐츠에 세로로 얼마가 남아야 하는지는 규정하지 않는다.

> Content can be presented without loss of information or functionality, and without requiring scrolling in two dimensions for: Vertical scrolling content at a width equivalent to 320 CSS pixels; Horizontal scrolling content at a height equivalent to 256 CSS pixels.
>
> — [Web Content Accessibility Guidelines (WCAG) 2.2 — SC 1.4.10 Reflow](https://www.w3.org/TR/WCAG22/#reflow)

측정값에서 이 구분이 선명하게 드러났다. 가로 판정은 테스트한 8개 페이지-높이 조합에서 전부 통과했다. `clientWidth`와 `scrollWidth`가 모두 320이었고 문서 레벨 가로 넘침은 0이었다. 같은 시점에 320x200 상단 조건은 본문 공간 118px을 남겼다. 실측 행간 기준으로 4.2줄이다.

CTO 입장에서 이건 조항을 공격하는 이야기가 아니다. 애초에 감지하도록 설계되지 않은 연속적 경험 회귀를 이진값 하나로 잡아내라고 요구하는 쪽이 문제라는 이야기다.

## 400% 확대는 폭만이 아니라 높이도 4분의 1로 만든다

감사에서 놀랄 만큼 자주 나오는 실수가 있다. 폭만 좁히고 높이는 데스크톱처럼 넉넉하게 남겨둔 채 시뮬레이션한다. 확대 조건의 절반만 재는 셈이다. [폭만 재면 리플로우는 절반만 잰 것](/ko/blog/ko/reflow-1410-400-zoom-viewport-height-2026)이라는 앞선 측정이 정확히 이 지점을 다뤘다.

> It should be noted that 400% applies to the dimension, not the area. It means four times the default zoom level viewport width and four times the default zoom level height.
>
> — [Understanding Success Criterion 1.4.10: Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)

폭은 320px로 고정하고 높이를 844, 400, 256, 200으로 바꿔가며 쟀다. 상단 스크롤 상태에서 본문 가용 공간은 각각 762px, 318px, 174px, 118px이었다. 네 줄 모두 정확히 82px씩 잃었다.

여기가 아키텍처 관점의 핵심이다. 손실은 뷰포트가 짧아질수록 같이 줄어드는 비율이 아니었다. 절대 픽셀 통행료였다. 분자가 상수인 채 뷰포트 높이라는 분모만 줄어드니, 화면이 짧을수록 피해 비율이 폭증했다.

844px에서 82px은 대수롭지 않다. 200px에서는 뷰포트의 41.0%를 먹는다. 통상적인 데스크톱 리뷰에서는 무해해 보이는 컴포넌트가, 확대 사용자가 실제로 일하는 화면에서는 읽기를 가로막는 물리적 장애물이 된다.

## 범인은 헤더가 아니었다

이런 조사에서 첫 번째 본능은 스티키 헤더 쪽으로 간다. 합리적인 본능이다. W3C 문서도 스티키 영역이 작거나 확대된 화면의 상당 부분을 잡아먹을 수 있다고 명시적으로 경고한다.

> Sticky regions always stay visible in the viewport while the other content will disappear underneath when scrolling. In terms of content visibility, this is often not a problem on the desktop and on mobile devices in portrait orientation. However, when using mobile devices in landscape orientation or when zooming in on the desktop, sticky regions may block a big portion of the screen: the height of the sticky region may leave only a small part of the screen for the display of page content.
>
> — [C34: Using media queries to un-fixing sticky headers / footers](https://www.w3.org/WAI/WCAG22/Techniques/css/C34)

그런데 측정은 두 메커니즘을 갈라놓았다.

페이지 상단에서 82px짜리 헤더는 짧은 높이 조건일 때 문서 흐름 안에 있었다. fixed도 sticky도 아닌 static이었고, 그래서 히트 테스트 출력에 겹쳐진 차단 영역으로 잡히지 않았다. 사용자가 스크롤하는 순간 헤더는 문서와 함께 위로 흘러갔고 뷰포트 공간 비용은 사라졌다.

좁은 화면에서 W3C가 권하는 구현 방향과 정확히 일치하는 동작이다.

> It is strongly suggested that at smaller viewport sizes that such components are modified to have static positioning, or their display can be toggled by the user.
>
> — [Understanding Success Criterion 1.4.10: Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)

팀이 소유한 헤더는 이미 제대로 처리돼 있었다는 뜻이다. 짧은 뷰포트의 페이지 중간에서 헤더 비용은 0px이었다. 운영 관점에서 이 대목이 중요하다. 팀은 자기가 고칠 수 있는 눈에 보이는 컴포넌트를 계속 다듬는데, 정작 예산은 런타임에 다른 무언가가 깎아먹고 있는 경우가 흔하다.

## 페이지 중간의 예산은 제3자 고정 컨테이너가 먹었다

320x200의 중간 스크롤 상태에서 가용 공간은 110px까지 떨어졌다. 브라우저 크롬 요소를 하나씩 제거하며 회복량을 쟀다.

헤더 제거는 0px 회복. 읽기 진행 표시줄 제거도 0px. 맨 위로 가기 버튼 제거도 0px. 하단 고정 광고 컨테이너를 제거하자 90px이 돌아왔고, 가용 공간이 110px에서 200px로 올라갔다. 크롬을 전부 제거해도 회복량은 똑같은 90px이었다. 개별 회복량의 합이 전체와 정확히 일치했으니 요소 간 겹침은 없다.

컨테이너의 높이는 뷰포트가 844px이든 200px이든 400px로 측정됐다. `pointer-events: none`이 걸려 있었고, 실제 차단은 런타임에 삽입된 그 영역 안쪽 90px 구간에서 나왔다. 400px 중 어느 자식 요소가 그 90px을 차지하는지는 아직 규명하지 못했다. 맨 위로 가기 버튼이 페이지 중간에서 보이는 상태였는데도 단독 회복량이 0px로 나온 것 역시 이번 테스트로는 갈라내지 못했다.

DOM 세부보다 상업적 함의가 더 크다. 우리 저장소에 존재하지도 않는 태그 하나가 사용자에게 읽을 만한 본문이 보이는지 아닌지를 결정한다. 외부 분석 도구, 광고, 챗, 동의 배너, 실험 도구를 물고 데이터 플랫폼과 웹서비스를 굴려본 팀이면 익숙한 구조다. 소스 코드의 소유권은 전달되는 경험의 소유권이 아니다.

높이 844px에서 같은 90px은 뷰포트의 10.7%다. 200px에서는 45.0%다. 고정 픽셀 비용은 짧은 화면에 매기는 역진세다.

## 애매한 불만을 반복 가능한 엔지니어링 절차로 바꿨다

쓸모 있는 지표는 의도적으로 좁혀서 정의했다.

`usable_px = 히트 테스트가 article 또는 main에 도달하는 세로 픽셀`

접근성 평가를 대체하는 지표가 아니다. 릴리스 프로세스가 소유할 수 있는 측정값이다.

테스트 하네스는 Playwright 1.58.2와 Chromium 145.0.7632.6으로 라이브 사이트를 쳤다. 가로 위치 세 곳에서 2px 스텝으로 행을 샘플링하고, 도달한 요소를 기준으로 세로 픽셀을 분류했다. 높이 4단, 스크롤 상태 2단, 크롬 조건 3단, 페이지 타입 5종을 조합해 주 측정 세트에서 총 27런을 돌렸다.

지표를 받아들이기 전에 세 가지 통제를 걸었다. 새로운 경험 지표가 경영 보고에 들어오려면 반드시 요구할 절차다.

첫째, 크롬이 없는 로컬 산문 페이지는 모든 조건에서 비율 1.0을 냈다. 가용 공간이 뷰포트 전체와 일치했다. 계측기 자체가 손실을 만들어내지 않는다는 뜻이다.

둘째, 반증 임계값을 데이터를 보기 전에 못 박았다. 320x200 페이지 중간에서 크롬을 전부 벗겨냈을 때 회복량이 10px 미만이면 "고정 크롬이 예산을 먹는다"는 주장을 폐기하기로 했다. 관측된 회복량은 3런 모두 90px이었다.

셋째, 불안정한 값은 결론에서 뺐다. 하단 컨테이너 효과는 높이가 큰 조건과 일부 페이지 타입에서 산발적이었다. 짧은 높이에서는 일관되게 나타났지만 다른 곳에서는 모든 상태에 통용될 절대 기준선을 세울 만큼 일관되지 않았다.

유용한 내부 지표가 대시보드 연극으로 변질되지 않게 하는 방법이 이것이다. 숫자 하나를 정의한다. 계측기가 그 효과를 만들어내지 않음을 증명한다. 데이터를 보기 전에 가설이 무효가 되는 조건을 정한다. 그다음 재현되는 신호와 수상하지만 미해결인 변동을 구분한다.

## 걸어야 할 것은 회귀 게이트지 절대 기준점이 아니다

모든 페이지가 세로 몇 px을 유지해야 한다는 선언부터 하지는 않겠다. 근거가 보편 임계값을 지지하지 않고, 산발적인 런타임 동작 때문에 게이트가 시끄럽게 거짓 실패한다.

대신 대표 페이지들을 320x200 상단 상태에서 재서 기준선으로 기록한다. 그리고 `usable_px`가 그 기준선 대비 10% 이상 떨어지면 릴리스를 실패시킨다.

상단 상태를 첫 게이트로 삼는 것이 방어 가능한 이유는 안정성이다. 테스트한 높이 사다리 전체에서 6런이 바이트 단위로 동일했고, 118px이라는 값은 앞선 감사 결과를 그대로 재현했다. 중간 상태는 제3자 로딩 동작을 이해할 때까지 리포트 전용 진단으로 남겨야 한다. 관측된 런에서 차단 효과는 뷰포트와 페이지 맥락에 따라 6번 중 3번에서 6번까지 흔들렸다. 이 상태에 CI 하드 게이트를 걸면 엔지니어링 주의력을 거짓 실패에 쏟게 된다.

이 구분에는 직접적인 단위 경제 가치가 있다. CI 잡 하나면 페이지 표본을 두 조건에서 테스트할 수 있다. 측정 비용은 크지 않다. 출시 후에야 매출·동의·지원 관련 의존성이 사용자가 읽어야 할 바로 그 화면에서 본문을 밀어냈다는 사실을 발견하는 쪽에 비하면 그렇다. 더 중요한 건 지표가 리뷰 논의에 가격표를 붙인다는 점이다. 헤더에 12px을 더하는 결정은 더 이상 미감의 문제만이 아니다. 제약된 뷰포트 예산에서 측정 가능한 만큼을 인출하는 결정이다. 레이아웃이 밀리는 비용을 숫자로 바꿔놓으면 리뷰 논의가 달라진다는 것은 [CLS 0.559를 0.014로 내린 기록](/ko/blog/ko/cls-layout-shift-reserve-space-measure-2026)에서도 확인했다.

## 반론은 준거 판정에 관한 한 옳다

118px을 WCAG 1.4.10 위반이라고 부르면 틀린다.

일반적인 세로 스크롤 콘텐츠의 규범 요구는 320 CSS 픽셀 폭이다. 이 사이트는 측정한 가로 리플로우 판정을 통과했다. 조항은 세로로 남아야 할 최소 읽기 높이를 정하지 않는다. 이 내부 측정값을 계약, 조달, 법적 준거 판정의 근거로 쓰는 것은 공표된 요구 수준을 넘어 기준을 부풀리는 일이다.

감사 역량이 유한하기 때문에 이 구분이 중요하다. 바람직하지 않은 경험 패턴을 전부 공식 미준수로 이름 붙이면, 진짜 실패 항목의 긴급성이 희석되고 개선 대기열의 신뢰도가 떨어진다. 경영진은 법적 노출과 제품 품질 위험이 뒤섞인 보고서를 받게 된다.

이 반론이 위험해지는 지점은 하나뿐이다. 너무 멀리 밀고 나갈 때다. "조항 위반이 아니다"가 "운영상 결함이 아니다"를 뜻하지는 않는다. 가로 320px 리플로우를 유지한 릴리스가 짧은 화면에서는 고정 런타임 컨테이너 때문에 읽기를 어렵거나 불가능하게 만들 수 있다. W3C 문서 자체가 확대 시 고정 콘텐츠의 경험 위험을 인정한다.

> Such sticky or fixed content can pose significant issues for those who would benefit from Reflow, as aside from obscuring keyboard focus, such sticky or fixed content can make reading content difficult if not impossible.
>
> — [Understanding Success Criterion 1.4.10: Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)

올바른 거버넌스 모델은 분리다. WCAG 증거는 준거 판정에 쓰고, 뷰포트 예산 증거는 회귀 관리에 쓴다. 둘을 섞지 마라. 앞의 것이 컴플라이언스 보고의 무결성을 지키고, 뒤의 것이 컴플라이언스 보고가 볼 수 없는 변화를 잡는다.

## CEO와 CTO가 다음 릴리스 사이클에 바꿔야 할 것

재설계가 아니라 인벤토리부터다. 뷰포트에 붙어 있을 수 있는 모든 요소를 식별해라. 헤더, 푸터, 프로모션 유닛, 챗 런처, 동의 배너, 읽기 진행 표시줄, 플로팅 액션, 그리고 외부에서 주입되는 컨테이너까지. 구현 주체가 벤더라도 소유자를 지정해라.

그다음 작고 대표성 있는 페이지 세트를 320x200 상단 상태에서 재서 현재값을 기준선으로 보관해라. 그 숫자를 배포 리포트에 성능, 오류율, 접근성 요약과 나란히 올려라. 기준선이 생기기 전에 릴리스 게이트로 걸지 마라.

팀이 소유한 스티키 영역에는 높이 인식 동작을 쓴다. C34가 실무 패턴을 설명한다. 가용 뷰포트 높이에 따라 스티키 동작을 바꾸는 방식이다.

> Define the first sticky regions using media query min-height properties, so they get fixed or un-fixed depending on the available space
>
> — [C34: Using media queries to un-fixing sticky headers / footers](https://www.w3.org/WAI/WCAG22/Techniques/css/C34)

제3자 컨테이너에는 CSS만으로 푸는 해법이 없을 수 있다. 비용이 우리 애플리케이션 코드가 실행된 뒤에 발생하기 때문이다. 세로 점유량을 벤더 승인 기준과 배포 검증 항목에 넣어라. "이 태그 붙여도 됩니까"는 잘못된 승인 질문이다. "제약 조건에서 뷰포트를 세로로 몇 px 먹고, 롤백은 누가 책임집니까"가 전환율과 접근성 경험을 동시에 지키는 질문이다.

다음 실무 단계는 대표 페이지에서 자기 사이트의 320x200 상단 기준선을 재는 것이다. 그 기준선이 안정적인데도 사용자가 계속 읽기 공간이 막힌다고 알려온다면, 이 고정 픽셀 예산 모델은 틀린 것이다.

## 참고 자료

1. [Web Content Accessibility Guidelines (WCAG) 2.2 — SC 1.4.10 Reflow](https://www.w3.org/TR/WCAG22/#reflow)
2. [Understanding Success Criterion 1.4.10: Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)
3. [C34: Using media queries to un-fixing sticky headers / footers](https://www.w3.org/WAI/WCAG22/Techniques/css/C34)
4. [CSS Text Module Level 3](https://www.w3.org/TR/css-text-3/)
