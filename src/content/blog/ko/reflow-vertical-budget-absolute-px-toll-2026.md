---
title: 400% 확대에서 남는 세로가 118px일 때 — 1.4.10 통과가 말해주지 않는 것
description: WCAG 1.4.10 Reflow 를 통과한 페이지가 320×200 뷰포트에서 세로 가용 픽셀 118px 까지 붕괴하는 실험
  기록이다. 손실이 비율이 아니라 절대 px 통행료임을 수치로 확인하고, 세로 예산 감사를 별도 게이트로 둘지 말지의 판단 기준을 정리한다.
pubDate: 2026-08-27
heroImage: ../../../assets/blog/reflow-vertical-budget-absolute-px-toll-2026/hero.png
tags:
- 웹접근성
- WCAG
relatedPosts:
- slug: declared-rules-fail-open-robots-txt-agents-md-2026
  score: 0.7
  reason:
    en: 'If you read how robots.txt rules were truncated yet passed silently, here
      you''ll see the same blind spot in viewport form: a Reflow pass that waves through
      vertically broken readability.'
    ko: 선언된 규칙이 잘려도 조용히 통과되던 robots.txt 사례를 읽었다면, 이번엔 Reflow 통과가 수직 가독성 붕괴를 그냥 놓쳐버리는
      측정의 사각지대가 그 공백의 뷰포트 버전임을 확인하게 된다.
    ja: 途中で切れてもエラーなく通過したrobots.txtの事例を読んだなら、今回はReflow合格が縦方向の可読性崩壊をそのまま見逃す測定の死角が、同じ空白のビューポート版であると確認できる。
    zh: 读过 robots.txt 规则被截断却静默通过案例的人,会在这里看到同一盲区的视口版本:Reflow 检测直接放行了纵向可读性的崩坏。
---

## 가로 판정의 사각지대

자체 감사에서 이상한 숫자가 나왔다. 320×200 뷰포트 — 400% 확대된 데스크톱 화면과 폭이 같은 상황 — 에서 본문에 실제로 닿는 세로 픽셀이 118px 라는 것. 뷰포트 높이 200px 중 82px 가 글 읽기와 무관한 영역에 잡혀 있었다. 더 이상한 것은, 같은 페이지에 돌린 WCAG 1.4.10 Reflow 자동화 판정이 8/8 전 셀 통과였다는 점이다. `clientWidth 320 = scrollWidth 320`, 가로 넘침 0. 규격이 잴 축에서는 완벽하게 통과한 페이지가, 실제 확대 사용자가 마주하는 세로 축에서는 화면의 41%를 잃고 있었다.

먼저 반대 쪽 논리를 정직하게 적어둔다. WCAG 1.4.10 은 애초 세로를 규정 대상으로 삼지 않았다. 규범 텍스트는 이렇게만 요구한다.

> "Content can be presented without loss of information or functionality, and without requiring scrolling in two dimensions for: Vertical scrolling content at a width equivalent to 320 CSS pixels"
> — [WCAG 2.2 Success Criterion 1.4.10 Reflow (spec) / W3C](https://www.w3.org/TR/WCAG22/#reflow)

세로 스크롤 콘텐츠에는 폭 320 CSS 픽셀만 요구하고, 높이에 대해선 아무 말도 하지 않는다. 이것은 버그가 아니라 설계다. 준수 판정이 세로를 보증한다고 주장한 적도 없다. 규범 해석으로는 이 반대가 옳다.

그러나 실무에서는 1.4.10 통과가 "확대해도 읽힌다"의 대리 지표로 쓰인다. 접근성 체크리스트에 리플로우 항목이 초록불이면 확대 관련 이슈는 없는 것으로 넘어가는 관행이 그렇다. 이 글의 범위는 규격 문서가 아니라 그 판정 관행이다. 대리 지표가 실제로 무엇을 보증하지 않는지, 수치로 확인한 기록이다.

## 320×200 세로 예산 118px

비유하자면 이것은 고정비 문제다. 매출(뷰포트 높이)이 줄어도 고정비는 그대로 청구된다. 회사 규모가 작아질수록 고정비가 차지하는 비율만 커진다. h=844 에서 사소해 보이던 크롬 요소들이 h=200 에서는 예산을 통째로 잠식하는 구조가 정확히 그것이다.

실험은 2026-08-23, 공개 라이브 사이트 하나에서 playwright 1.58.2 / chromium 145 로 돌렸다. 뷰포트 높이 4단(844/400/256/200) × 스크롤 상태 2(top/mid) × 크롬 제거 조건을 합쳐 27회 실행. 가용 픽셀의 정의는 elementFromPoint 히트 테스트 기반으로, 세로를 2px 스텝으로 훑으면서 각 지점의 히트 대상이 본문인지를 x=25/50/75% 세 열에서 판정한 것이다. 히트가 본문으로 돌아오는 세로 픽셀의 합이 usable_px 다.

측정 결과가 이 표다.

| 뷰포트 높이 | top usable_px | mid usable_px | top 손실 |
|---|---|---|---|
| 844 | 762 | — | 82px |
| 400 | 318 | — | 82px |
| 256 | 174 | — | 82px |
| 200 | 118 | 110 | 82px (41.0%) |

여기서 눈에 띄는 것은 손실의 패턴이다. 뷰포트가 4배 이상 작아졌는데도 top 상태의 손실은 네 높이 모두에서 정확히 82px 로 동일했다. 844−762=82, 400−318=82, 256−174=82, 200−118=82. 손실이 비율이 아니라 절대값이라는 뜻이고, 그래서 h=844 에서는 9.7% 수준이던 손실이 h=200 에서는 41.0% 가 된다. 비율이 커진 게 아니라 분모가 작아진 것이다.

## 높이와 무관한 82px 통행료

왜 절대값인가. 차단 주체가 뷰포트 크기에 응답하지 않기 때문이다. 400% 확대는 폭만 4분의 1로 만드는 게 아니라 높이도 4분의 1로 만든다 — W3C 의 설명대로 "400% applies to the dimension, not the area" 다. 그런데 고정 크롬은 확대에 맞춰 줄어들지 않는다.

이 지점에서 W3C 자신도 경고하고 있다. Understanding 1.4.10 문서의 표현을 빌리면:

> "Such sticky or fixed content can pose significant issues for those who would benefit from Reflow, as aside from obscuring keyboard focus, such sticky or fixed content can make reading content difficult if not impossible."
> — [Understanding Success Criterion 1.4.10: Reflow / W3C WAI](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)

즉 고정 크롬이 세로 예산을 갉아먹는 문제 자체는 규격 문서가 인지하고 있는 함정이다. 다만 그 함정을 잴 축을 1.4.10 판정이 갖고 있지 않을 뿐이다.

## 차단 주체 분해 — 90px 하단 광고 컨테이너

82px 통행료가 mid 상태에서는 다른 모습으로 나타난다. 스크롤을 내린 mid 상태의 h=200 손실은 90px 였고, 이것이 누구 몫인지를 요소별 개별 제거로 분해했다.

| 제거한 요소 | 회복량(Δ) |
|---|---|
| header | 0 |
| reading-progress | 0 |
| back-to-top | 0 |
| #fixed_container_bottom (하단 광고 컨테이너) | +90 |
| ALL (전부) | +90 |

읽는 방법이 중요하다. 개별 제거 회복량의 합이 0+0+0+90=90 이고 ALL 제거 회복량과 정확히 같다. 겹침이 없다는 뜻이다. 이 실험에서 손실을 만든 것은 문서 흐름 상단의 헤더 블록과 하단 고정 광고 컨테이너였다. reading-progress 와 back-to-top 은 개별 제거에서 Δ0 이었다. mid 상태의 세로 손실 전부가 하단 광고 컨테이너 단독 몫이고, 이 컨테이너는 뷰포트 높이와 무관하게 400px 높이를 유지했다 — h=844 에서든 h=200 에서든 400px. 노드가 작아져도 리저브 용량이 고정 청구되는 구조 그대로다.

같은 90px 가 h=844 에서는 10.7%, h=200 에서는 45.0% 가 된다. 이번에도 손실률이 커진 것이 아니라 분모가 작아진 것이다.

그리고 이것이 바로 1.4.10 통과가 무엇을 보증하지 않는지를 보여주는 지점이다. 가로 스크롤이 0인지 확인하는 판정은 이 90px 를 볼 방법이 없다. 판정의 축에 세로가 없기 때문이다.

## elementFromPoint 히트 테스트와 통제 셀

usable_px 라는 숫자가 측정 도구의 인공물이 아닌지는 따로 확인했다. 통제 셀로 로컬 문서 — 고정 크롬이 전혀 없는 페이지 — 를 같은 히트 테스트로 돌렸고, 전 줄 ratio 1.0. 지표 자체가 손실을 만들지 않는다는 확인이다.

반대 방향의 확인도 있었다. reflow 가로 판정은 8/8 통과였지만, post 페이지에서 자손 수준의 넘침은 존재했다 — offenders 97개, worst_overflow_px 604. 다만 문서 레벨의 가로 스크롤은 0이라 판정에는 영향이 없었다. 즉 가로 판정이 통과해도 요소 내부의 클리핑은 남아 있을 수 있고, 그것조차 이 판정이 보고하지 않는다.

## 반증 조건이 고친 귀속 — static 헤더 몫

여기서 이 실험에서 가장 배울 가치가 있는 부분을 숨기지 않고 적는다. 처음 예상은 "82px 통행료 = 고정 크롬의 몫"이었다. 그래서 반증 조건을 두 가지로 설계했다.

첫 번째 조건: 고정 크롬을 전부 제거했을 때 세로 가용 픽셀이 회복되지 않으면 논지의 축이 무너진다. 실측은 h=200 mid 에서 110→200, +90 회복(3/3 동일). 유지됐다.

두 번째 조건: 손실이 뷰포트 높이에 따라 비례 감소한다면 — 절대 px 가 아니라면 — "절대값 통행료" 논지는 기각된다. 실측은 네 높이에서 정확히 82px 로 동일. 역시 유지됐다.

그런데 반증 조건을 통과하면서 귀속이 하나 수정됐다. 개별 제거 분해에서 header 의 회복량은 Δ0 이었다. 그런데 헤더의 position 을 확인해보니 h=844 에서는 sticky, h=200 에서는 static 이었다. 즉 h=200 에서 헤더는 더 이상 고정 크롬이 아니고, 문서 흐름 안의 평범한 블록으로 흘러가 있었다. top 상태의 82px 는 고정 크롬이 아니라 그 static 헤더 블록의 몫이라는 것이다.

"손실은 절대 px 통행료"라는 예상은 맞았지만, 차단 주체가 고정 크롬이라는 귀속은 틀렸고, 실험이 그걸 고쳤다. 예상이 맞았을 때만 실험이 가치 있는 게 아니라, 예상의 어느 부분이 틀렸는지를 정확히 가르는 것이 실험의 산물이다. 임계값 자체는 아직 모른다 — h=844 에서 sticky, h=200 에서 static 이 6/6 확인됐고, 전환점은 (400, 844] 구간 안에 있다는 것까지만 좁혀져 있다.

## 별도 게이트로서의 세로 예산 감사와 C34 전환

권고는 페이지 유형에 따라 두 갈래로 나뉜다. 고정비가 다르면 감사 게이트의 필요 여부도 달라진다.

**확대 사용자를 실제로 받는 사이트** — sticky 헤더, 고정 컨테이너가 있는 곳 — 에는 세로 예산 감사를 1.4.10 자동화 판정 옆에 **별도 게이트**로 돌려야 한다. 조직 프로세스로 읽으면 단순하다. 현재 품질 심사는 가로 축 검사원 한 명이다. 그 검사원의 합격 도장이 세로 축까지 커버한다고 기대하는 것은, 회계 감사 합격이 안전 감사를 대신한다고 믿는 것과 같다. 검사원을 한 명 더 세우는 비용은 거의 없다. 이번 실험의 사다리를 그대로 돌리면 된다. 폭 320px, 높이는 200px 를 하한으로 256·400·844px 를 추가한 사다리, 스크롤 상태는 top 과 mid 두 가지로 잡고, 행마다 `elementFromPoint` 히트 테스트를 돌린다. 자기 콘텐츠의 줄 높이에 맞춰 usable_px 임계값을 정하고 그 값을 단언한다. 리플로우 검사를 CI에 거는 것과 똑같은 방식으로 게이트에 건다. 측정 자체는 playwright 와 공개 사이트, 한 머신에서 27회 실행 — 사실상 무료다.

**작은 높이에서 고정 크롬을 없앨 수 없는 곳**에는 C34 를 적용한다. W3C 자신의 기법 문서가 "Sticky regions always stay visible in the viewport while the other content will disappear underneath when scrolling" 라고 관찰하고, 좁은 뷰포트에서 미디어 쿼리로 sticky 헤더를 고정 해제하도록 규정한다 [3]. 정확히는 `min-height` 에 키를 둔 미디어 쿼리로, 임계값 아래에서는 sticky 헤더와 하단 고정 컨테이너를 static 위치로 전환하는 것이다. 이번 데이터가 말하는 전환의 가치는 명확하다. 하단 광고 컨테이너 단독으로 h=200 mid 에서 90px 회복 — 뷰포트의 45%다. 이 페이지에서 가장 회당 수익이 큰 스위치 하나다.

**고정 크롬이 아예 없는 페이지** — 로컬 리포트, 통제 문서, 순수 산문 — 에는 1.4.10 통과만으로 충분하고, 세로 예산 게이트는 과잉이다. 통제 셀이 증명했다. 크롬 없는 로컬 산문 페이지는 전 줄에서 ratio 1.0. 게이트 비용이 무료라 해도, 검사원이 잴 것이 없는 라인에 검사 공정을 붙이는 것은 프로세스 낭비다.

비용 하나는 정직하게 남긴다. 이 실험은 광고 컨테이너 제거가 수익에 미치는 비용을 재지 않았다. 측정은 무료지만 구제는 아니고, 그 트레이드오프는 팀의 몫이다.

마지막 교훈은 접근성을 넘어선다. 준수 검사가 통과를 내면, 그 통과는 규격이 임의로 선택한 축 안에서만 유효하다. 세로 예산은 설계상 1.4.10 의 축 밖이었고, 규격 텍스트 그 어디도 잘못되지 않았다. 반대의 규범 해석이 옳은 이유다. 그러나 그린 체크를 "확대해도 동작한다"로 읽는 순간, 팀은 좁은 보증을 넓은 보증으로 바꿔 적은 것이고, 그 변환은 정확히 82px + 90px 에서 깨진다. 회계 감사 합격 서류를 안전 점검 완료 증서로 건네는 일이 없어야 하듯, 검사원이 잴 수 없는 축은 검사원에게 묻지 말고 별도의 측정에 물어야 한다.

## 참고 자료

1. Understanding Success Criterion 1.4.10: Reflow / W3C WAI — W3C, [Understanding Success Criterion 1.4.10: Reflow / W3C WAI](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)
2. WCAG 2.2 Success Criterion 1.4.10 Reflow (spec) / W3C — W3C, [WCAG 2.2 Success Criterion 1.4.10 Reflow (spec) / W3C](https://www.w3.org/TR/WCAG22/#reflow)
3. CSS technique C34: Using media queries to un-fixing sticky headers / W3C WAI — W3C, [CSS technique C34: Using media queries to un-fixing sticky headers / W3C WAI](https://www.w3.org/WAI/WCAG22/Techniques/css/C34)