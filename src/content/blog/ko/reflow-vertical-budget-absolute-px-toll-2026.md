---
title: 웹 접근성 국제 기준 WCAG의 리플로우 검사를 통과해도 400% 확대 화면에서는 글이 읽히지 않을 수 있다
description: 가로 넘침 검사를 통과한 페이지도 세로로는 글이 거의 안 보일 수 있다. 화면을 가리는 고정 광고 칸 하나가 세로 공간을 90px
  통째로 가져가는 과정을 실측으로 따라 본다.
pubDate: '2026-08-28'
heroImage: ../../../assets/blog/reflow-vertical-budget-absolute-px-toll-2026/hero.png
tags:
- 웹 접근성
- WCAG
- 리플로우
- 세로 공간
relatedPosts:
- slug: declared-rules-fail-open-robots-txt-agents-md-2026
  score: 0.7
  reason:
    en: This piece on passing WCAG reflow while text still breaks echoes the robots.txt
      finding that truncated rules fail silently — showing that passing a check is
      not the same as actually working.
    ko: 리플로우를 통과해도 텍스트가 깨질 수 있다는 이 글은, 규칙이 잘려도 에러 없이 통과되는 robots.txt 실험과 마찬가지로 '검사를
      넘었다는 것'과 '실제로 읽을 수 있다는 것'이 다름을 보여준다.
    ja: リフローを通過してもテキストが崩れ得るというこの記事は、ルールが途切れてもエラーなしに通過するrobots.txtの実験と同様に、「チェックを通ったこと」と「実際に読めること」が異なることを示している。
    zh: 这篇文章说明通过重排检查后文本仍可能损坏，与 robots.txt 实验一样揭示了"通过检查"与"真正可用"是两回事，规则静默失效的问题一脉相承。
---

## 400% 확대에서 줄어드는 세로 읽기 공간

웹 페이지 접근성 검사에는 리플로우라는 항목이 있다. 리플로우는 화면을 크게 확대했을 때 글이 옆으로 잘리지 않고 아래로 재배치되는지를 보는 검사다. 화면을 400%까지 확대해도 글을 읽을 수 있어야 한다는 국제 기준이다.

이 검사에서 한 가지를 알아 두어야 한다. 400% 확대는 글자만 네 배로 키우는 게 아니다. 화면이 담을 수 있는 폭과 높이가 각각 4분의 1로 줄어든다. 규격 문서도 이렇게 말한다.

> 400% applies to the dimension, not the area
> — [Understanding Success Criterion 1.4.10: Reflow / W3C WAI](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)

문제는 이 검사가 옆으로 넘치는 것만 본다는 점이다. 세로로 글이 얼마나 보이는지는 재지 않는다. 그래서 가로 검사를 통과한 페이지에서도, 화면 위아래를 메뉴와 광고가 가려서 정작 글은 몇 줄 안 보이는 일이 생긴다.

실제로 공개된 사이트 하나를 320픽셀 너비, 200픽셀 높이의 아주 작은 화면 상태로 만들어 재 보았다. 화면 전체 높이 200픽셀 가운데, 글에 실제로 닿는 세로 공간은 118픽셀이었다. 나머지 82픽셀은 글을 읽는 데 쓸 수 없었다.

그러니까 검사 결과표에 통과라고 적혀 있어도, 내 눈 앞에 실제로 보이는 글은 절반도 안 될 수 있다는 뜻이다.

![320x200 화면에서 촬영한 실제 화면으로, 글에 닿는 세로 공간은 118px 다](../../../assets/blog/reflow-vertical-budget-absolute-px-toll-2026/shot-budget-ladder-320w-4heights-320x200.png)

## 네 화면 높이에서 같은 82px 손실

방 하나를 생각해 보자. 창 앞을 가리는 큰 가구가 놓여 있다. 집 전체가 넓든 좁든, 이 가구가 차지하는 크기는 그대로다. 집이 작아질수록 가구 몫이 차지하는 비율만 커진다. 화면 세로 공간도 똑같이 작동했다.

화면 높이를 844, 400, 256, 200픽셀의 네 단계로 바꾸어 가며, 글에 닿는 세로 공간을 재었다. 화면의 각 위치에 무엇이 놓여 있는지 기계로 하나하나 확인하는 방식이다. 결과는 이렇다.

| 화면 높이 | 글에 닿는 세로 픽셀 | 잃은 픽셀 |
|---|---|---|
| 844 | 762 | 82 |
| 400 | 318 | 82 |
| 256 | 174 | 82 |
| 200 | 118 | 82 |

잃은 크기가 화면 높이에 비례하지 않았다. 네 높이 모두 정확히 82픽셀이었다. 그래서 화면이 작아질수록 잃는 비율만 커진다. 844픽셀 화면에서 82픽셀은 약 10분의 1이지만, 200픽셀 화면에서는 41퍼센트다. 비율이 커진 게 아니라 전체가 작아진 것이다.

여기서 알아 둘 점은, 작은 화면을 쓰는 사람일수록 같은 크기의 고정 요소에 더 큰 영향을 받는다는 사실이다.

![네 화면 높이에서 잰 글에 닿는 세로 픽셀로, 손실은 네 높이 모두 82px 였다](../../../assets/blog/reflow-vertical-budget-absolute-px-toll-2026/chart-budget-ladder-320w-4heights.png)

## 90px 손실의 출처와 완전한 회복

그런데 위 표의 82픽셀은 화면 맨 위에서 재었을 때의 값이다. 화면을 아래로 조금 내린 상태에서는 손실이 더 컸다. 200픽셀 화면에서 글에 닿는 세로 공간이 110픽셀로 떨어진 것이다. 이 상태의 손실 주체를 찾기 위해, 화면을 가리는 요소를 하나씩 없애 보았다.

먼저 화면 위에 붙어 있는 메뉴 막대를 없앴다. 회복된 양은 0픽셀이었다. 화면 맨 위의 읽기 진행 막대를 없애도 0픽셀이었다. 맨 위로 가기 단추를 없애도 0픽셀이었다. 그런데 화면 아래에 붙어 있는 고정 광고 칸을 없애자 세로 공간이 110픽셀에서 200픽셀로 늘어났다. 딱 90픽셀이 전부 돌아온 것이다.

이 광고 칸의 원래 크기는 400픽셀이다. 화면 높이가 844픽셀이든 200픽셀이든 상관하지 않고 항상 400픽셀을 유지했다. 화면이 작아져도 자기 크기를 줄이지 않는 요소였던 것이다. 없애 보니 네 가지 요소의 회복량 합이 0 더하기 0 더하기 0 더하기 90으로, 전체 없앴을 때의 90픽셀과 정확히 같았다. 손실을 차지한 주체는 고정 광고 칸 하나뿐이라는 뜻이다.

결국 정리하면 이렇다. 화면이 좁아져서 곤란할 때가 아니라, 화면이 낮아져서 곤란할 때 고정 광고 칸이 가장 큰 원인이라는 것이다.

![요소를 하나씩 없애며 잰 글에 닿는 세로 픽셀로, 아래 고정 칸을 없애자 90px 가 돌아왔다](../../../assets/blog/reflow-vertical-budget-absolute-px-toll-2026/chart-removal-decomposition-at-320x200.png)

## 가로 판정과 세로 가독성의 분리

이 사이트에 정식 리플로우 검사를 돌려 보면 통과한다. 검사는 화면 여덟 조합에서 옆으로 넘치는 양을 재고, 0픽셀이면 통과로 판정한다. 이 사이트의 결과는 여덟 조합 모두 옆 넘침 0픽셀, 통과였다.

여기에 규격 문서의 근거도 있다. 세로로 읽는 내용에 대해서 규격이 요구하는 것은 폭 320픽셀뿐이다. 높이에 대해서는 아무 말도 하지 않는다.

> Content can be presented without loss of information or functionality, and without requiring scrolling in two dimensions for: Vertical scrolling content at a width equivalent to 320 CSS pixels; Horizontal scrolling content at a height equivalent to 256 CSS pixels.
> — [WCAG 2.2 Success Criterion 1.4.10 Reflow (spec) / W3C](https://www.w3.org/TR/WCAG22/#reflow)

그러니까 검사가 틀린 게 아니다. 검사는 자기가 정한 축인 가로만 재며, 그 범위 안에서는 옳다. 틀린 것은 검사 통과를 '확대해도 읽힌다'의 증거로 쓰는 관행이다. 실제로는 320픽셀 폭 조건에서 화면 아래 고정 광고 칸이 글을 90픽셀 가리고 있었고, 가로 검사는 그것을 전혀 보지 못했다. 검사 통과와 실제 읽기 공간은 별개의 문제다.

![8개 화면 조합에서 잰 가로 넘침으로, 모두 0px 였다](../../../assets/blog/reflow-vertical-budget-absolute-px-toll-2026/chart-reflow-1410-horizontal-pass-check.png)

## 세로 공간을 직접 재는 별도 검사

이 문제를 발견한 방법 자체가 해결책이다. 화면을 320픽셀 너비, 200픽셀 높이로 만든다. 그다음 화면의 세로줄을 따라가며 각 위치에 무엇이 닿는지 기계로 확인한다. 이렇게 하면 글에 실제로 남은 세로 픽셀 수가 나온다. 이 측정은 가로 넘침 검사와 완전히 다른 질문을 던진다. 가로 검사는 "옆으로 안 잘리는가"를 묻고, 이 측정은 "실제로 몇 픽셀이 보이는가"를 묻는다.

이런 고정 요소의 위험은 규격을 만드는 쪽도 인정하고 있다.

> Such sticky or fixed content can pose significant issues for those who would benefit from Reflow, as aside from obscuring keyboard focus, such sticky or fixed content can make reading content difficult if not impossible.
> — [Understanding Success Criterion 1.4.10: Reflow / W3C WAI](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)

> Sticky regions always stay visible in the viewport while the other content will disappear underneath when scrolling.
> — [CSS technique C34: Using media queries to un-fixing sticky headers / W3C WAI](https://www.w3.org/WAI/WCAG22/Techniques/css/C34)

그러면 이렇게 하면 된다. 확대해서 보는 사람을 실제로 받는 사이트라면 가로 검사 통과만으로 끝내지 않는다. 좁고 낮은 화면에서 글이 실제로 닿는 세로 크기를 직접 잰다. 고정 메뉴나 광고가 없는 문서 페이지를 만든다면, 가로 검사 통과만으로 충분하고 추가 측정은 하지 않아도 된다.

## 이 글이 확인하지 못한 것

이번 실험은 공개된 사이트 하나, 한 대의 기기, 한 버전의 크롬에서 27번의 실행으로 얻은 결과다. 구조가 다른 사이트로 범위를 넓혀 보지 않았다. 또 세로 공간이 줄어드는 것이 실제 확대 사용자의 이탈로 이어지는지는 행동 데이터를 재지 않아 알 수 없다. 헤더가 고정 상태에서 풀리는 정확한 화면 높이 기준값도 400픽셀과 844픽셀 사이로만 좁혀 두었다.

이 판단이 틀릴 조건은 이렇다. 화면을 가리는 요소를 모두 없애 보았는데도 읽을 수 있는 세로 공간이 늘어나지 않거나, 잃은 크기가 화면 높이마다 다르게 나타난다면 이 글의 판단은 틀린 것이다. 실제로는 손실이 네 높이에서 모두 82픽셀로 같았고, 고정 광고 칸을 없애자 90픽셀이 전부 돌아왔다.

## 참고 자료

1. [Understanding Success Criterion 1.4.10: Reflow / W3C WAI](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html) — W3C
2. [WCAG 2.2 Success Criterion 1.4.10 Reflow (spec) / W3C](https://www.w3.org/TR/WCAG22/#reflow) — W3C
3. [CSS technique C34: Using media queries to un-fixing sticky headers / W3C WAI](https://www.w3.org/WAI/WCAG22/Techniques/css/C34) — W3C