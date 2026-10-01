---
title: WCAG 2.2 최소 타깃 크기, 초록불 92점 뒤에 숨은 AA 실패
description: 손끝이 빗나가는 22×22 버튼에 Lighthouse는 접근성 92점을 줬다. WCAG 2.2 SC 2.5.8(최소 24×24)을 샌드박스에 심어 재보니 자동 도구는 크기 위반만 잡고 예외 조항은 사람에게 넘겼다. 스페이싱 예외 계산과 CSS 수정을 실측 로그로 정리한다.
pubDate: '2026-07-19'
heroImage: ../../../assets/blog/wcag22-target-size-audit-2026/target-size-demo.png
tags:
  - a11y
  - wcag
  - accessibility
  - web-development
relatedPosts:
  - slug: axe-automated-a11y-coverage-gap-2026
    score: 0.82
    reason:
      ko: "저 글은 'axe가 구조적으로 못 잡는 넷'을 다뤘다. 이 글은 그중 타깃 크기만은 axe가 이제 잡더라는 반례와, 그래도 예외 판정은 여전히 사람 몫이라는 경계를 실측했다."
      ja: "あちらは『axeが構造的に取りこぼす四つ』。本稿はそのうちタッチターゲットだけはaxeが今や捕まえるという反例と、それでも例外判定は人の仕事という境界を実測した。"
      en: "That post covers four things axe structurally misses. This one is the counter-case where axe now does catch target size, plus the boundary where exception judgment still falls to a human."
      zh: "那篇讲axe在结构上漏掉的四类问题。本文是其中的反例：目标尺寸axe如今能抓到，但例外判定仍归人来做。"
  - slug: a11y-lighthouse-audit-fix-2026
    score: 0.75
    reason:
      ko: "Lighthouse로 접근성 위반을 잡아 고치는 기본 흐름을 먼저 보고 싶다면 저 글이 출발점이다. 이 글은 그 92점 점수가 왜 통과가 아닌지를 파고든다."
      ja: "Lighthouseでアクセシビリティ違反を捕まえて直す基本の流れは、まずあちら。本稿はその92点が『合格』でない理由を掘る。"
      en: "For the basic flow of catching and fixing a11y issues with Lighthouse, start there. This post digs into why that 92 score is not a pass."
      zh: "想先看用Lighthouse抓取并修复无障碍问题的基本流程，从那篇开始。本文深挖那个92分为何不等于合格。"
  - slug: accessible-name-agents-2026
    score: 0.68
    reason:
      ko: "타깃이 충분히 크더라도 이름이 비어 있으면 무용지물이다. 접근성 이름이 어떻게 조용히 틀어지는지 한 케이스로 깊게 판 글이 저기다."
      ja: "ターゲットが十分大きくても、名前が空なら意味がない。アクセシブルネームがどう静かに狂うかを一例で深掘りしたのがあちら。"
      en: "A target can be big enough and still be useless if its name is empty. That post drills into one case of how the accessible name quietly breaks."
      zh: "目标够大，若名称为空也没用。那篇用一个案例深挖无障碍名称是怎么悄悄出错的。"
---

접근성 자동 검사 점수 92점. 화면 상단에 초록에 가까운 숫자가 떴다. 그런데 같은 페이지 아래쪽, 페이지네이션 숫자 링크는 한 변이 22px이다. 엄지로 3을 누르면 2나 4가 같이 눌린다. 점수는 통과처럼 보이는데 손끝은 계속 빗나간다.

이 어긋남이 오늘 글의 출발점이다. WCAG 2.2가 새로 넣은 성공 기준 하나, <strong>SC 2.5.8 Target Size (Minimum)</strong>를 샌드박스에 직접 심고, 커스텀 스크립트와 Lighthouse로 두 번 재봤다. 결론부터 적으면 이렇다. 자동 도구는 명백한 크기 위반은 이제 곧잘 잡는다. 하지만 이 기준의 진짜 난도는 크기가 아니라 <strong>예외 조항</strong>에 있고, 그 판정은 여전히 사람이 해야 한다.

## 24×24라는 숫자는 어디서 왔나

먼저 토대부터. WCAG(Web Content Accessibility Guidelines)는 W3C 산하 WAI가 만드는 웹 접근성 표준이다. 2.2 버전은 2023년 10월 5일에 정식 W3C 권고안(Recommendation)이 됐고, 현재 판본은 2024년 12월 12일자이며, 2025년 10월 21일 ISO/IEC 40500:2025로도 승인됐다. 2.1 대비 성공 기준 9개가 새로 들어왔고, 오래된 4.1.1 Parsing 하나가 폐기됐다.

새로 들어온 9개 중 개발자가 당장 CSS를 바꿔야 하는 게 <strong>SC 2.5.8 Target Size (Minimum)</strong>, 레벨 AA다. 문구는 짧다. W3C 원문 그대로 옮기면 "The size of the target for pointer inputs is at least 24 by 24 CSS pixels, except when…". 포인터로 누르는 대상의 크기가 최소 24×24 CSS 픽셀이어야 한다는 뜻이다. 손가락이 두껍든, 손이 떨리든, 버스에서 흔들리든, 작은 조작 대상을 정확히 겨누기 어려운 사람을 위한 기준이다.

숫자를 헷갈리면 안 된다. 24×24는 AA의 <strong>최소선</strong>이다. 그 위에 SC 2.5.5 Target Size (Enhanced), 레벨 AAA가 44×44를 요구한다. 참고로 애플 휴먼 인터페이스 가이드라인은 44pt, 안드로이드 머티리얼은 48dp를 권한다. 이 둘은 W3C 표준이 아니라 플랫폼 권고값이니 "참고값"으로만 본다. 실무에서 나는 신규 컴포넌트는 처음부터 44 이상으로 잡되, 레거시 감사에서는 24를 통과선으로 쓴다.

여기서 CSS 픽셀이라는 단서가 중요하다. 물리 픽셀이 아니라 CSS 픽셀 기준이므로, 고해상도 화면에서 device pixel ratio가 3이어도 `min-height: 24px`면 요건을 만족한다. 반대로 뷰포트 메타 태그를 잘못 걸어 확대가 이상하게 걸리면 계산이 틀어질 수 있으니, 측정은 실제 렌더 후 `getBoundingClientRect()`로 하는 게 안전하다.

## 손으로 심고 손으로 재봤다

말로만 하면 감이 안 온다. 그래서 위반을 일부러 심은 정적 페이지를 만들었다. 임시 샌드박스에 네 구획을 뒀다.

- toolbar-bad: 16×16 아이콘 버튼 4개 (Bold / Italic / Underline / Link)
- pager-bad: 20×20에 1px 테두리가 붙어 실측 22×22가 된 페이지네이션 링크 5개, 간격 0
- toolbar-good: 같은 버튼을 `min-width/min-height: 24px` + 패딩으로 키운 버전
- pager-good: 24×24에 `margin: 2px`로 간격까지 준 버전

핵심 마크업은 이렇다.

```html
<!-- 위반: 16x16 -->
<section class="toolbar-bad">
  <button aria-label="Bold">B</button>
  <button aria-label="Italic">I</button>
</section>

<!-- 준수: 최소 24x24 -->
<section class="toolbar-good">
  <button aria-label="Bold">B</button>
  <button aria-label="Italic">I</button>
</section>
```

```css
.toolbar-bad button  { width: 16px; height: 16px; padding: 0; }
.toolbar-good button { min-width: 24px; min-height: 24px; padding: 4px; }
```

측정은 axe나 Lighthouse에 맡기기 전에, 기준 그대로 계산하는 스크립트를 먼저 짰다. 이렇게 하면 자동 도구가 무엇을 보고 무엇을 안 보는지 대조군이 생긴다. 이 감사기는 두 가지를 한다. 첫째, 모든 상호작용 대상의 렌더 크기를 재서 24 미만을 골라낸다. 둘째, 골라낸 것들에 <strong>스페이싱 예외</strong>를 적용한다. 각 대상 바운딩 박스 중심에 지름 24px 원을 그렸을 때 다른 원과 겹치는지를 유클리드 거리로 판정한다.

```javascript
// WCAG 2.2 SC 2.5.8 최소 타깃 크기 감사기
(() => {
  const MIN = 24, R = 12; // 지름 24px → 반지름 12
  const sel = 'a[href],button,input,select,textarea,' +
              '[role="button"],[role="link"],[tabindex]:not([tabindex="-1"])';
  const els = [...document.querySelectorAll(sel)]
    .filter(el => el.offsetParent !== null);
  const boxes = els.map(el => {
    const r = el.getBoundingClientRect();
    return { w: Math.round(r.width), h: Math.round(r.height),
             cx: r.left + r.width / 2, cy: r.top + r.height / 2,
             label: el.getAttribute('aria-label') || el.textContent.trim().slice(0, 12) };
  });
  const findings = [];
  for (const b of boxes) {
    if (!(b.w < MIN || b.h < MIN)) continue;         // 24 이상은 통과
    const tooClose = boxes.some(c =>                  // 스페이싱 예외 판정
      !(c.cx === b.cx && c.cy === b.cy) &&
      Math.hypot(c.cx - b.cx, c.cy - b.cy) < 2 * R);
    findings.push({ label: b.label, size: `${b.w}x${b.h}`,
                    verdict: tooClose ? 'FAIL' : 'PASS(spacing)' });
  }
  return { total: boxes.length, undersized: findings.length, findings };
})();
```

Chrome에서 이 스크립트를 돌린 실측 결과다.

```json
{
  "total": 18,
  "undersized": 9,
  "findings": [
    { "label": "Bold",  "size": "16x16", "verdict": "FAIL" },
    { "label": "Italic","size": "16x16", "verdict": "FAIL" },
    { "label": "Underline","size":"16x16","verdict":"FAIL" },
    { "label": "Link",  "size": "16x16", "verdict": "FAIL" },
    { "label": "1", "size": "22x22", "verdict": "FAIL" },
    { "label": "2", "size": "22x22", "verdict": "FAIL" },
    { "label": "3", "size": "22x22", "verdict": "FAIL" },
    { "label": "4", "size": "22x22", "verdict": "FAIL" },
    { "label": "5", "size": "22x22", "verdict": "FAIL" }
  ]
}
```

18개 대상 중 9개가 24 미만, 전부 FAIL. good 구획의 24×24 대상들은 애초에 골라내는 단계에서 걸리지 않았다. pager-bad가 22×22로 잡힌 게 재밌다. 나는 CSS에 20px을 적었는데, 1px 테두리가 양쪽에 붙어 실측은 22가 됐다. 눈으로 코드만 봐선 놓칠 오차를, 렌더 후 측정은 그대로 드러낸다.

## 자동 도구는 어디까지 봤나

이제 대조군. 같은 페이지를 Lighthouse 모바일 스냅샷으로 돌렸다. 접근성 점수 <strong>92점</strong>. 실패한 감사 항목은 `target-size`와 `landmark-one-main` 둘이었다. axe-core가 붙는 `target-size` 감사는 점수 0으로, 정확히 같은 9개 노드를 지목했다.

```
Accessibility: 92
Failed audits: target-size, landmark-one-main
target-size: score=0, flagged 9 nodes
  <button aria-label="Bold"> ... <a href="#5">
```

두 가지를 짚고 싶다.

첫째, 좋은 소식. "자동 도구는 접근성의 겉만 본다"는 통념이 이 항목에선 낡았다. axe-core는 이제 `target-size` 규칙을 갖고 있고, 내 커스텀 감사기와 <strong>완전히 같은 9개</strong>를 짚어냈다. 스페이싱 계산까지 포함한 내 판정과 axe의 판정이 일치했다는 건, 24px 원 겹침이라는 기준 로직을 도구가 실제로 구현했다는 뜻이다. 크기 위반만 놓고 보면 axe는 믿을 만하다. 이 지점은 [axe가 구조적으로 못 잡는 네 가지를 심어봤던 실험](/ko/blog/ko/axe-automated-a11y-coverage-gap-2026/)의 결론에 대한 반례이기도 하다. 그때는 사람 판단이 필요한 항목이 초록불 뒤에 남았지만, 타깃 크기만은 규칙형으로 떨어져 자동화가 따라잡았다.

둘째, 나쁜 소식. 그런데도 점수는 92였다. AA 성공 기준 하나가 명백히 깨진 페이지가 92점을 받는다. 점수는 가중 평균이라, 규칙 하나가 0이어도 나머지가 받쳐주면 숫자는 통과처럼 보인다. <strong>점수는 적합성이 아니다.</strong> WCAG는 통과/실패의 이진 기준이지 92점 같은 연속값이 아니다. AA를 주장하려면 2.5.8을 포함한 모든 AA 기준이 예외 없이 충족돼야 한다. 대시보드의 초록 숫자를 적합성 증거로 제출하면 안 되는 이유다. 이 함정은 [Lighthouse로 잡아 고치는 기본 흐름](/ko/blog/ko/a11y-lighthouse-audit-fix-2026/)을 익힌 뒤에도 계속 남는다.

## 예외 조항이 진짜 시험이다

여기가 이 기준의 핵심이다. 2.5.8은 24×24를 요구하되 다섯 예외를 둔다. W3C 원문 순서대로 옮긴다.

| 예외 | 요지 | 도구가 판정 가능한가 |
|---|---|---|
| Spacing(간격) | 작아도 24px 원들이 안 겹치면 통과 | 부분 가능 (기하 계산) |
| Equivalent(동등) | 같은 기능이 충분히 큰 다른 컨트롤로도 제공됨 | 불가 (사람 판단) |
| Inline(인라인) | 문장 안에 있거나 줄 높이에 크기가 묶인 대상 | 부분 가능 |
| User agent control | 크기를 저작자가 아니라 브라우저가 정함 | 부분 가능 |
| Essential(필수) | 그 표현이 본질적이거나 법으로 정해짐 | 불가 (사람 판단) |

스페이싱 예외가 실무에서 제일 자주 쓰인다. 원문은 이렇다. "Undersized targets … are positioned so that if a 24 CSS pixel diameter circle is centered on the bounding box of each, the circles do not intersect another target or the circle for another undersized target." 각 대상 중심에 지름 24px 원을 놓고, 그 원들이 서로 겹치지 않으면 24보다 작아도 통과다. 원 두 개가 안 겹치려면 중심 사이 거리가 24px 이상이어야 한다.

내 pager-bad가 왜 FAIL인지 이걸로 설명된다. 22×22 링크가 간격 없이 붙어 있으니 인접 중심 거리는 22px, 24보다 작아서 원이 겹친다. 그런데 링크를 그대로 22×22로 두더라도 `margin`을 줘 중심 간격을 24px 이상 벌리면, 크기를 안 키우고도 스페이싱 예외로 적합해진다. 조밀한 툴바나 데이터 밀도가 높은 표에서 아이콘을 물리적으로 못 키울 때 쓰는 탈출구다.

문제는 나머지 예외다. Equivalent와 Essential은 자동화가 원리적으로 판정 못 한다. "이 작은 삭제 아이콘과 같은 기능이 페이지 어딘가 큰 버튼으로도 있는가"는 페이지 의미를 이해해야 답할 수 있다. axe가 어떤 대상을 FAIL로 찍었어도, 그게 실제 위반인지 예외인지는 사람이 확인해야 한다. 정직하게 적으면 이렇다. <strong>자동 FAIL은 "사람이 예외를 검토하라"는 신호지, 그 자체로 최종 판정이 아니다.</strong> 반대로 자동 PASS도 적합성 보장이 아니다.

## 코드로 고치기

원인별로 처방이 갈린다.

가장 흔한 경우, 그냥 크기를 못 채운 대상. 최소값을 박아 넣는다. `width`가 아니라 `min-width`/`min-height`를 쓰는 게 중요하다. 콘텐츠가 더 크면 커지되, 절대 24 밑으로는 안 내려가게 하한만 거는 것이다.

```css
/* 아이콘 버튼: 시각 크기는 유지하되 히트 영역만 24로 */
.icon-btn {
  min-width: 24px;
  min-height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
```

시각적으로는 16px 아이콘을 유지하고 싶은데 손끝 영역만 넓히고 싶다면, 투명 패딩이나 가상 요소로 히트 영역을 확장한다.

```css
.tiny-icon {
  position: relative;
}
.tiny-icon::after {           /* 보이지 않는 24x24 히트 영역 */
  content: "";
  position: absolute;
  inset: 50% auto auto 50%;
  width: 24px;
  height: 24px;
  transform: translate(-50%, -50%);
}
```

크기를 도저히 못 키우는 조밀한 UI라면 스페이싱 예외로 간다. 중심 간격 24px 이상을 `gap`이나 `margin`으로 확보한다.

```css
/* 22x22를 유지하되 중심 간격 ≥24px → 스페이싱 예외 통과 */
.pager a {
  width: 22px;
  height: 22px;
  margin: 0 2px;   /* 22 + 2 + 2 = 26px 중심 간격 */
}
```

그리고 앞의 감사기 스크립트를 CI나 북마클릿으로 상비해 둔다. axe만으로 충분해 보여도, 렌더 후 실측값을 직접 보는 습관은 1px 테두리 같은 오차를 잡아준다. 나는 이걸 배포 전 수동 체크의 마지막 칸으로 쓴다.

## 자주 걸리는 함정

감사를 몇 번 돌리다 보면 같은 자리에서 반복해서 넘어진다. 네 가지만 미리 적어 둔다.

첫째, `width`와 `min-width`를 혼동하는 것. `width: 24px`는 콘텐츠가 넘치면 잘리거나 딱 24에 갇힌다. 우리가 원하는 건 하한이지 고정값이 아니다. 반드시 `min-width`/`min-height`를 쓴다. 이 차이 하나로 반응형에서 텍스트가 늘어난 버튼이 조용히 위반으로 돌아서는 걸 막는다.

둘째, 겹치는 히트 영역을 만드는 것. `::after`로 24×24 히트 영역을 확장할 때, 인접한 두 아이콘의 확장 영역이 서로 포개지면 엉뚱한 대상이 눌린다. 시각 크기는 작아도 실제 클릭 판정은 넓어졌기 때문이다. 확장은 하되 이웃과 겹치지 않는 선까지만 한다. 여기서도 24px 원 겹침 계산이 그대로 쓸모가 있다.

셋째, `transform: scale()`로 줄인 대상. CSS `transform`은 레이아웃 크기가 아니라 그리기 단계에서만 작아 보이게 한다. 그래서 `getBoundingClientRect()`는 스케일이 적용된 실제 화면 크기를 돌려주는데, 저작 의도와 어긋나기 쉽다. 아이콘을 `scale`로 축소했다면 축소 후 크기로 다시 재는 걸 잊지 않는다.

넷째, 포커스 링만 보고 안심하는 것. 키보드 포커스가 잘 보인다고 해서 포인터 대상이 충분히 큰 건 아니다. 2.5.8은 마우스·터치 같은 포인터 입력을 위한 기준이고, 키보드 접근성(2.1.1)이나 포커스 표시(2.4.11)와는 별개 축이다. 접근성은 한 축을 통과했다고 다른 축이 자동으로 따라오지 않는다. [접근성 이름이 조용히 비는 경우](/ko/blog/ko/accessible-name-agents-2026/)처럼, 크기와 이름과 포커스는 각자 확인해야 한다.

## 정리: 24px 앞에서 개발자가 할 일

핵심을 압축하면 이렇다. WCAG 2.2 SC 2.5.8은 포인터 대상의 최소 크기를 24×24 CSS 픽셀로 못 박은 AA 기준이고, 자동 도구는 크기 위반은 잘 잡지만 예외 판정은 사람에게 남긴다. 92점 같은 점수는 적합성 증거가 아니다.

배포 전 체크리스트로 옮기면.

- 모든 버튼·링크·입력의 렌더 크기를 실측한다. CSS 값이 아니라 `getBoundingClientRect()` 결과로 본다.
- 24 미만이 나오면 세 갈래로 처방한다. ① `min-width/min-height: 24px`로 키운다 ② 시각 크기 유지가 필요하면 투명 히트 영역을 확장한다 ③ 정말 못 키우면 중심 간격 24px 이상으로 스페이싱 예외를 만든다.
- axe가 FAIL로 찍은 항목은 Equivalent·Essential 예외에 해당하는지 사람이 마지막으로 확인한다.
- 대시보드 점수를 적합성 보고로 제출하지 않는다. AA는 이진 통과다.
- 신규 컴포넌트는 처음부터 44 이상으로 잡아 두면 AA·AAA를 한 번에 넘긴다.

작은 숫자 하나지만, 손끝이 계속 빗나가는 UI는 점수가 아무리 초록이어도 쓰기 힘든 UI다. 24px은 그 손끝을 위한 최소한의 배려다.

구조화 데이터를 서버사이드로 확실히 내보내거나, 기존 사이트의 접근성·타깃 크기·GEO 대응을 코드 레벨에서 점검하고 싶다면 개인적으로 상담과 구현 의뢰를 받는다. 프로필의 문의 경로로 편히 연락 주면 된다.
