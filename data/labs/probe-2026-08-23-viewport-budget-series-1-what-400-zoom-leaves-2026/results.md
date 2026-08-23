## cells
- budget-ladder-320w-4heights — 6/6 runs, exit 0×6 — top 상태는 6/6 바이트 동일: usable_px 762(h=844) / 318(h=400) / 174(h=256) / 118(h=200), ratio .903/.795/.680/.590. 네 높이 모두 손실이 정확히 82px 로 같다(844−762=400−318=256−174=200−118=82). h=200 top 의 118px 는 6/6 재현 — 2026-08-09 자체 감사의 118px 와 일치. blocked_px 귀속은 h=844 에서만 header.site-header:82 이고 h=400/256/200 에서는 빈 객체다(그 높이의 헤더는 static 이라 fixed/sticky 탐지에 걸리지 않는다). mid 상태: h=200 usable_px 110(6/6), h=256 166(6/6), h=400 310(5/6, run6 은 400), h=844 672(5/6, run3 은 762). mid 의 blocked_px 는 fixed_container_bottom:90 이 h=200/256 에서 6/6, h=400 에서 5/6, h=844 에서 4/6. h=844 mid 만 header.site-header:82 가 추가된다. 손실률은 h=844 mid 20.4%, h=200 top 41.0%, h=200 mid 45.0%.
- chrome-stripped-recovery-844-vs-200 — 3/3 runs, exit 0×3 — falsifier 셀. h=200 mid: present 110 → stripped 200, 회복 +90px 이 3/3 동일(hidden_count 9). 반증 임계값(+10px 미만)을 넘겼으므로 mid 상태에서 고정 크롬이 세로 예산을 먹는다는 진술은 유지된다. h=844 mid: stripped 는 3/3 모두 844(ratio 1.0)이고 present 가 672/672/762 이라 회복량은 172/172/82 로 흔들린다. 두 높이가 공유하는 회복 성분은 90px 뿐이고, h=844 의 초과분 82px 는 그 높이에서만 sticky 인 헤더다.
- removal-decomposition-at-320x200 — 6/6 runs, exit 0×6, 6개 파일 md5 완전 동일 — baseline 110(matched 0). header 제거 110(Δ0, matched 2), #reading-progress 제거 110(Δ0, matched 1), #back-to-top 제거 110(Δ0, matched 1), #fixed_container_bottom 제거 200(Δ+90, matched 1), ALL 제거 200(Δ+90, matched 5). 개별 회복량 합 0+0+0+90=90 이 ALL 의 90 과 정확히 일치 — 겹침 없음. 계획서가 지속 비용으로 지목한 #back-to-top(mid 에서 visible, h=48)의 단독 회복량은 0px 이다.
- control-local-prose-no-chrome — 3/3 runs, exit 0×3, 3개 파일 md5 동일 — 네 줄(h=844/200 × top/mid) 모두 ratio 1.0, usable_px = ih(844/844/200/200). 히트 테스트 지표 자체는 손실을 만들지 않는다.
- reflow-1410-horizontal-pass-check — 3/3 runs, exit 0×3, 3개 파일 md5 동일 — 8줄(post/post2/index/home × h=844/200) 전부 clientWidth 320 = scrollWidth 320, h_overflow_px 0, reflow_pass true. 8/8 통과. 단 post 만 offenders 97, worst_overflow_px 604 (자손 요소는 넘치지만 문서 레벨 가로 스크롤은 0). post2/index/home 은 offenders 0.
- page-type-and-scroll-persistence-boundary — 0/6 runs 가 계획서 기준 충족, exit 0×6 — 10줄 전부 산출됨. (1) header.h 는 전 페이지·전 높이 82 로 고정이고 pos 는 h=844 에서 sticky, h=200 에서 static 이 6/6. h=200 mid 의 header.top 은 −scrollY(예: −15992)로 문서와 함께 흘러갔다. (2) adBottom.h 는 h=844 에서 400, h=200 에서도 400 — 뷰포트 높이와 무관한 고정값이 6/6. 위치는 h=844 에서 top:444, h=200 에서 top:−200 이고 컨테이너 자체는 pointer-events:none, 실제 차단은 90px. (3) 계획서의 'adBottom 은 post/post2 한정' 주장은 깨졌다: mid 에서 adBottom 이 non-null 인 비율은 post 6/6, post2 6/6, home 6/6, index 4/6(run1·run4 만 null). 실제로 90px 를 차단한 비율은 post 5/6(run4 미차단), post2 6/6, index 3/6(run2·3·6), home 3/6(run1·4·6). (4) home 은 h=200 top 에서 usable_px 0, ratio 0 이 6/6 — 첫 200px 안에 article/main 픽셀이 하나도 없다. (5) #reading-progress 는 post/post2 에서만 fixed h=4, index/home 에서 null. #back-to-top 은 전 페이지 fixed h=48, top 에서 visibility hidden, mid 에서 visible. (6) mid 줄의 scrollY 는 전부 0 초과(post 15992·16090, post2 12249, index 82093, home 2854)라 스크롤은 실제로 일어났다. (7) post 의 docH 는 top 31984 → mid 32136(+152).

## boundary
- 뒤집히는 축은 viewport_h 가 아니라 scroll_state × 차단 주체다. top 상태에서는 네 높이 모두 정확히 82px 를 잃고 blocked_px 가 비어 있어(h≥844 제외) 손실 주체가 고정 크롬이 아니다. mid 상태로 넘어가면 손실 주체가 90px 고정 하단 컨테이너 하나로 교체되고, 제거하면 100% 회복된다. viewport_h 축에서 뒤집히는 것은 헤더의 position 뿐이다 — h=400 에서 static, h=844 에서 sticky 로, 임계값은 데이터로 (400, 844] 구간까지만 좁혀진다.

## quotes
- text: "Content can be presented without loss of information or functionality, and without requiring scrolling in two dimensions for: Vertical scrolling content at a width equivalent to 320 CSS pixels; Horizontal scrolling content at a height equivalent to 256 CSS pixels."
  url: https://www.w3.org/TR/WCAG22/#reflow
  bears_on: reflow-1410-horizontal-pass-check — 8/8 이 통과 판정을 받은 그 조항. 규범 텍스트는 세로 방향 콘텐츠에 대해 폭 320px 만 요구하고 높이는 규정하지 않는다. 그래서 usable_px 118 은 이 조항을 위반하지 않는다.
- text: "320 CSS pixels is equivalent to a starting viewport width of 1280 CSS pixels wide at 400% zoom. For web content which is designed to scroll horizontally (e.g., with vertical text), 256 CSS pixels is equivalent to a starting viewport height of 1024 CSS pixels at 400% zoom."
  url: https://www.w3.org/TR/WCAG22/#reflow
  bears_on: 측정에 쓴 320 폭과 256 높이의 출처. 실험이 추가로 잰 200 높이는 이 문서가 정의하는 어떤 값도 아니다.
- text: "It should be noted that 400% applies to the dimension, not the area. It means four times the default zoom level viewport width and four times the default zoom level height."
  url: https://www.w3.org/WAI/WCAG22/Understanding/reflow.html
  bears_on: budget-ladder 의 높이 사다리(844→400→256→200)가 왜 폭 고정 실험의 정당한 짝인지. 400% 는 폭만 4분의 1로 만드는 게 아니라 높이도 4분의 1로 만든다.
- text: "Such sticky or fixed content can pose significant issues for those who would benefit from Reflow, as aside from obscuring keyboard focus, such sticky or fixed content can make reading content difficult if not impossible."
  url: https://www.w3.org/WAI/WCAG22/Understanding/reflow.html
  bears_on: chrome-stripped 의 h=200 회복 +90px, removal-decomposition 의 #fixed_container_bottom 단독 +90px.
- text: "However, when attempting to zoom in the page, the ads remain in their fixed position. They obscure not only the focusable elements of the page, providing no way to dismiss the ad without finding / keyboard navigating to its close button, but significantly reduce the available space for reading."
  url: https://www.w3.org/WAI/WCAG22/Understanding/reflow.html
  bears_on: page-type 셀의 adBottom — h=844 와 h=200 에서 adBottom.h 가 똑같이 400 이라는 측정값이 이 문단이 서술하는 "remain in their fixed position" 의 정량 형태다.
- text: "Beyond this sticky advertisement example, commonly toolbars, menubars, navigation and other \"sidebar\" content may be presented with sticky or fixed positions at larger viewport sizes. It is strongly suggested that at smaller viewport sizes that such components are modified to have static positioning, or their display can be toggled by the user."
  url: https://www.w3.org/WAI/WCAG22/Understanding/reflow.html
  bears_on: page-type 셀이 잰 header.pos = sticky(h=844) / static(h=200). 측정 대상 사이트의 헤더는 이 권고를 이미 따르고 있고, 그래서 mid 상태 h=200 의 헤더 비용은 0 이다.
- text: "Sticky regions always stay visible in the viewport while the other content will disappear underneath when scrolling. In terms of content visibility, this is often not a problem on the desktop and on mobile devices in portrait orientation. However, when using mobile devices in landscape orientation or when zooming in on the desktop, sticky regions may block a big portion of the screen: the height of the sticky region may leave only a small part of the screen for the display of page content."
  url: https://www.w3.org/WAI/WCAG22/Techniques/css/C34
  bears_on: 같은 90px 컨테이너가 h=844 에서 손실률 10.7%, h=200 에서 45.0% 라는 대비.
- text: "Define the first sticky regions using media query min-height properties, so they get fixed or un-fixed depending on the available space"
  url: https://www.w3.org/WAI/WCAG22/Techniques/css/C34
  bears_on: 헤더가 h=400 에서 static, h=844 에서 sticky 로 갈리는 측정값의 메커니즘. C34 예시 코드는 `@media (min-height: 480px)` 를 쓰는데, 이 실험은 임계값을 (400, 844] 로만 좁혔고 480 이라고 확인하지는 않았다.
- text: "Be aware that sticky regions can create disadvantages for keyboard users and should therefore be used judiciously."
  url: https://www.w3.org/WAI/WCAG22/Techniques/css/C34
  bears_on: #back-to-top(fixed, h=48, mid 에서 visible)의 단독 회복량이 0px 로 나온 결과 — 세로 예산 비용은 0 이어도 이 문단이 말하는 다른 축의 비용은 이 실험이 측정하지 않았다.

## anomalies
- fixed_container_bottom 의 차단이 재시도해도 산발적으로 사라진다. budget-ladder 에서 h=844 mid 4/6, h=400 mid 5/6, h=256/200 mid 6/6. page-type 에서 post mid 5/6, index mid 3/6, home mid 3/6. 같은 URL·같은 대기 시간(1800ms)인데 뷰포트가 클수록 결측이 잦다는 방향성만 보이고 원인은 규명하지 못했다. 광고 로드 타이밍이 의심되지만 확인하지 않았다.
- adBottom 요소는 index/home 의 mid 에서도 non-null(h=400)로 존재하지만 90px 차단은 그 절반에서만 일어난다(index 4/6 존재 대 3/6 차단, home 6/6 존재 대 3/6 차단). 요소가 붙어 있는데도 차단되지 않는 상태가 무엇인지 이 데이터로는 구분되지 않는다.
- home 의 h=200 top 에서 usable_px 가 0(ratio 0)이 6/6 재현된다. 82px 손실이라는 다른 모든 페이지의 top 패턴과 유일하게 다르고, 나머지 118px 이 무엇에 먹혔는지 blocked_px 가 비어 있어 귀속되지 않는다.
- reflow-1410 에서 post 만 offenders 97, worst_overflow_px 604 인데 문서 레벨 h_overflow_px 는 0 이다. 넘치는 자손 97개가 어디서 클리핑되는지는 측정하지 않았다.
