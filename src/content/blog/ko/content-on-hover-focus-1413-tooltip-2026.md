---
title: 'CSS로는 Escape를 받을 수 없다: 툴팁 일곱 개로 잰 SC 1.4.13'
description: '툴팁에 :focus-visible만 붙이면 접근성은 끝난 줄 알았다. 구현 일곱 개를 만들어 Dismissible·Hoverable·Persistent 세 항목을 각각 재보니 CSS만으로 통과한 것은 하나도 없었고, popover="hint"조차 절반만 대신해 주었다.'
pubDate: '2026-08-12'
heroImage: '../../../assets/blog/content-on-hover-focus-1413-tooltip-2026/hero.png'
tags:
  - 접근성
  - WCAG
  - CSS
  - 프론트엔드
  - 웹개발
faq:
  - question: '툴팁에 :focus-visible을 추가하면 SC 1.4.13은 통과인가요?'
    answer: '아닙니다. :focus-visible은 "키보드로도 열린다"를 해결할 뿐이고, 1.4.13이 요구하는 세 항목은 그와 별개입니다. 제 측정에서 :hover와 :focus-visible을 함께 건 구현은 Hoverable과 Dismissible을 둘 다 통과하지 못했습니다. 키보드로 열리는 것과 키보드로 닫히는 것은 다른 문제입니다.'
  - question: 'CSS만으로 1.4.13을 전부 만족시킬 수 있나요?'
    answer: '제가 만든 범위에서는 불가능했습니다. Hoverable과 Persistent는 :has()와 패딩만으로 통과시킬 수 있었지만, Dismissible은 Escape 키 입력을 받는 일이라 CSS에 대응하는 장치가 없습니다. 팝업이 다른 콘텐츠를 가리지 않는 경우에 한해 기준이 Dismissible을 면제하는데, 제 픽스처의 툴팁 여섯 개는 전부 아래 문단을 덮었습니다.'
  - question: 'HTML popover 속성을 쓰면 접근성 처리가 끝나나요?'
    answer: 'Dismissible만 끝납니다. popover="hint"는 Escape에 반응하는 동작을 브라우저가 제공하므로 포인터를 움직이지 않고도 닫을 수 있었습니다. 반면 여는 조건과 닫는 조건은 여전히 개발자가 붙이는 이벤트라, 포인터가 8px 간격을 건널 때 mouseleave가 먼저 발생해 Hoverable에서 떨어졌습니다.'
  - question: '툴팁을 2초 뒤 자동으로 감추는 패턴은 왜 문제가 되나요?'
    answer: '기준이 정한 소멸 조건은 트리거가 제거되거나, 사용자가 닫거나, 정보가 더 이상 유효하지 않게 되는 세 가지입니다. 타이머는 그중 어디에도 해당하지 않습니다. 제 측정에서 2초 타이머를 건 구현은 포인터를 그대로 둔 채 5초를 기다렸을 때 사라져 Persistent에서 떨어졌습니다.'
relatedPosts:
  - slug: modal-focus-escape-inert-measure-2026
    score: 0.86
    reason:
      ko: 모달에서 Escape와 inert를 재던 글의 반대편이다. 그때는 닫히는 것이 당연한 컴포넌트를 다뤘고, 이번엔 아무도 Escape를 붙이지 않는 컴포넌트를 다룬다. 키 하나를 어디서 듣느냐는 문제는 두 글에서 같은 모양으로 반복된다.
      ja: モーダルのEscapeとinertを測った記事の裏面にあたる。あちらは閉じて当然の部品で、こちらは誰もEscapeを付けない部品だ。キー一つをどこで聞くかという問題は、二つの記事で同じ形をしている。
      en: The mirror image of the modal post that measured Escape and inert. That one dealt with a component everyone expects to close; this one deals with a component nobody wires Escape into. Where you listen for that single key is the same problem in both.
      zh: 那篇量模态框 Escape 和 inert 的文章的背面。那边处理的是理应能关掉的部件，这边处理的是没人给它接 Escape 的部件。这个键该在哪儿监听，两篇里是同一个形状的问题。
  - slug: act-rules-axe-coverage-wcag-sc-2026
    score: 0.81
    reason:
      ko: axe 4.13.0의 규칙 105개 중 1.4.13에 태그된 것이 0개라는 사실은 그 글에서 만든 목록으로 먼저 확인했다. 어떤 기준을 손으로 재야 하는지 고를 때 그 표를 먼저 펼친다.
      ja: axe 4.13.0の105ルールのうち1.4.13タグが0という事実は、あの記事で作った一覧で先に確かめた。どの基準を手で測るか選ぶとき、まずあの表を開く。
      en: The fact that 0 of axe 4.13.0's 105 rules carries a 1.4.13 tag came out of the inventory built in that post. It is the table I open first when deciding what has to be measured by hand.
      zh: axe 4.13.0 的 105 条规则里 0 条挂 1.4.13 标签，这件事是先在那篇做的清单里确认的。挑哪些标准得手动量时，先翻那张表。
  - slug: wcag22-target-size-audit-2026
    score: 0.72
    reason:
      ko: 같은 WCAG 2.2에서, 숫자로 적힌 기준이 실제로는 예외 조항에서 갈린다는 이야기를 했던 글이다. 이번 1.4.13도 판정을 가른 것은 8px이라는 숫자가 아니라 그 8px이 어디에 있느냐였다.
      ja: 同じWCAG 2.2で、数字で書かれた基準が実際には例外条項で分かれるという話をした記事だ。今回の1.4.13も判定を分けたのは8pxという数字ではなく、その8pxがどこにあるかだった。
      en: "The post that argued a criterion written as a number actually turns on its exception clauses. Same shape here: what split the verdicts was not the 8px, but where the 8px sat."
      zh: 那篇讲的是，同属 WCAG 2.2、写成数字的标准，实际分野在例外条款上。这次 1.4.13 也一样：分开判定的不是 8px 这个数，而是这 8px 落在哪儿。
---

툴팁에 `:focus-visible`을 붙여두면 접근성 쪽은 정리됐다고 여기는 관행이 있다. 키보드로도 열리니 됐다는 것이다. 나도 오래 그렇게 처리했다.

그런데 WCAG 2.2의 성공기준 1.4.13은 "열린다"를 요구한 적이 없다. 요구하는 것은 닫는 방법, 포인터를 옮길 수 있는지, 그리고 언제까지 남아 있는지 세 가지다. 열림은 그 세 항목의 전제 조건일 뿐 항목이 아니다.

그래서 오늘은 같은 문장을 붙이는 툴팁을 일곱 가지 방식으로 만들어 임시 샌드박스에 올리고, 세 항목을 각각 따로 쟀다. 결과부터 적는다. CSS만으로 만든 세 개는 전부 Dismissible에서 떨어졌고, 브라우저가 제공하는 `popover="hint"`는 Dismissible을 공짜로 줬지만 Hoverable에서 떨어졌다. 일곱 개 중 세 항목을 다 통과한 것은 하나였다.

![세 가지 툴팁 구현이 각각 다른 판정을 받은 실제 화면](../../../assets/blog/content-on-hover-focus-1413-tooltip-2026/hero.png)

## 툴팁 하나가 성공기준 세 개를 동시에 요구한다

먼저 이 기준이 무엇을 대상으로 하는지부터 정리한다. 1.4.13은 레벨 AA이고, WCAG 2.1에서 새로 들어와 2.2로 이어졌다. 대상은 "포인터를 올리거나 키보드 포커스를 주면 나타났다가, 그것을 거두면 사라지는 추가 콘텐츠"다. 툴팁이 대표적이고, 호버로 펼쳐지는 메가 메뉴, 사용자 이름 위에 뜨는 프로필 카드, 폼 입력란 옆의 도움말 말풍선이 전부 여기 들어간다.

들어가지 않는 것도 명시돼 있다. W3C가 기준 본문에 붙인 세 번째 노트는 이렇게 적는다. 원문은 [W3C의 WCAG 2.2 권고안](https://www.w3.org/TR/WCAG22/#content-on-hover-or-focus)에 있다.

> This criterion applies to content that appears in addition to the triggering component itself. Since hidden components that are made visible on keyboard focus (such as links used to skip to another part of a page) do not present additional content they are not covered by this criterion.

즉 포커스를 받았을 때 자기 자신이 드러나는 스킵 링크는 이 기준의 대상이 아니다. 트리거와 별개의 콘텐츠가 추가로 나타나야 판정 대상이 된다. 이 구분을 먼저 세워두지 않으면 페이지의 절반을 1.4.13으로 잘못 감사하게 된다.

기준이 왜 이 세 항목을 골랐는지도 짚어둘 만하다. 셋 다 화면 확대를 쓰는 사용자와 손 떨림이 있는 사용자를 향한다. 400%로 확대한 화면에서 툴팁은 뷰포트의 상당 부분을 덮는다. 덮은 것을 치울 방법이 없으면 그 아래 내용을 읽을 길이 사라진다. 포인터 조작이 정밀하지 않은 사용자는 툴팁 본문을 읽으려고 마우스를 옮기다가 툴팁을 놓친다. 그리고 짧은 시간 뒤 자동으로 사라지는 팝업은 읽기 속도가 느린 사용자에게는 없는 것과 같다. Dismissible, Hoverable, Persistent는 각각 이 세 상황에 대응한다.

## 기준 원문이 정확히 무엇을 요구하는가

세 항목의 규범 본문은 짧다. [W3C의 성공기준 1.4.13 원문](https://www.w3.org/TR/WCAG22/#content-on-hover-or-focus)을 그대로 옮긴다.

> Where receiving and then removing pointer hover or keyboard focus triggers additional content to become visible and then hidden, the following are true:
>
> **Dismissible:** A mechanism is available to dismiss the additional content without moving pointer hover or keyboard focus, unless the additional content communicates an input error or does not obscure or replace other content;
>
> **Hoverable:** If pointer hover can trigger the additional content, then the pointer can be moved over the additional content without the additional content disappearing;
>
> **Persistent:** The additional content remains visible until the hover or focus trigger is removed, the user dismisses it, or its information is no longer valid.
>
> Exception: The visual presentation of the additional content is controlled by the user agent and is not modified by the author.

읽을 때 걸리는 지점이 두 군데다.

첫째, Dismissible에는 조건절이 붙어 있다. 추가 콘텐츠가 입력 오류를 알리는 경우, 또는 다른 콘텐츠를 가리거나 대체하지 않는 경우에는 이 요구가 면제된다. 그러니까 "아무것도 덮지 않는 툴팁"이라면 닫는 수단이 없어도 된다. 다만 그런 툴팁은 드물다. 뒤에서 보겠지만 내가 만든 여섯 개는 전부 아래 문단을 덮었다.

둘째, 예외는 "저자가 손대지 않은, 브라우저가 그리는 표현"에만 적용된다. 같은 문서의 첫 번째 노트가 그 대상을 지목한다.

> Examples of additional content controlled by the user agent include browser tooltips created through use of the HTML `title` attribute [HTML].

`title` 속성은 기준 밖이다. 여기서 흔한 오해가 생긴다. 기준 밖이라는 것은 통과했다는 뜻이 아니라 이 자로 재지 않는다는 뜻이다. `title` 툴팁은 여전히 터치 기기에서 나타나지 않고, 표시 시점과 지속 시간을 저자가 통제할 수 없다. 면제는 판정을 유예할 뿐 문제를 없애지 않는다.

## 일곱 개를 만들어 같은 자를 댔다

repo 바깥 임시 디렉터리에 정적 HTML 한 장을 만들었다. 같은 버튼, 같은 한 문장("Rate limit: 60 requests per minute per API key."), 트리거와 팝업 사이 간격 8px. 여기까지는 일곱 행이 전부 같고, 다른 것은 팝업을 여닫는 기계장치뿐이다.

| | 구현 | 여는 방식 |
|---|---|---|
| V1 | `title` 속성 | 브라우저가 그린다 |
| V2 | CSS `:hover`만 | 포인터만 |
| V3 | CSS `:hover` + `:focus-visible` | 포인터·키보드 |
| V4 | CSS `:has()` + 패딩 브리지 | 포인터·키보드 |
| V5 | JS 호버·포커스·Escape·150ms 유예 | 포인터·키보드 |
| V6 | JS + 2초 자동 숨김 | 포인터·키보드 |
| V7 | 네이티브 `popover="hint"` | 포인터·키보드 |

판정은 Playwright로 매겼다. 항목마다 페이지를 새로 로드해 상태가 섞이지 않게 했고, 다섯 가지를 잰다.

- 포인터를 올리면 열리는가
- Tab으로 포커스를 주면 열리는가
- **Dismissible**: 열린 상태에서 포인터를 그대로 둔 채 Escape를 눌렀을 때 닫히는가
- **Hoverable**: 트리거 중앙에서 팝업 중앙까지 포인터를 12단계로 이동시켰을 때 팝업이 살아 있는가
- **Persistent**: 포인터를 올린 뒤 5초 동안 아무것도 하지 않았을 때 남아 있는가

Hoverable 측정이 이 실험의 핵심이라 조금 더 적는다. `mouse.move`를 한 번에 목적지로 던지면 중간 지점의 hit-test가 생략돼 간격을 통과해버린다. 그래서 좌표를 12등분해 20ms 간격으로 밀어 넣었다. 실제 손이 지나가는 경로에 가깝게 만들려는 것이다.

```js
const path = 12, from = center(tb), to = center(pb);
for (let i = 1; i <= path; i++) {
  await page.mouse.move(
    from.x + (to.x - from.x) * i / path,
    from.y + (to.y - from.y) * i / path
  );
  await page.waitForTimeout(20);
}
r.hoverable = await page.locator(v.tip).isVisible();
```

환경은 Chromium 143.0.7499.4 헤드리스, Playwright 1.57.0, Node 22.22, 뷰포트 900×1400이다. 같은 스크립트를 두 번 돌려 일곱 행의 값이 전부 같은 것을 확인했다.

![일곱 가지 구현의 다섯 항목 판정을 정리한 표](../../../assets/blog/content-on-hover-focus-1413-tooltip-2026/criteria-matrix.png)

## CSS로는 Escape를 받을 수 없다

V2, V3, V4는 자바스크립트를 한 줄도 쓰지 않았다. 셋 다 Dismissible에서 떨어졌다. 이건 구현 실수가 아니라 구조다. Dismissible이 요구하는 것은 "포인터나 포커스를 움직이지 않고 닫는 수단"이고, 현실적으로 그 수단은 Escape 키다. CSS에는 키 입력에 반응하는 선택자가 없다.

W3C의 [Understanding 문서](https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus.html)도 이 요구를 설명할 때 Escape로 툴팁을 지우는 예를 든다(원문 요약이며 축자 인용은 아니다). 즉 CSS 전용 툴팁은 앞서 본 면제 조항에 걸리지 않는 한 이 항목을 통과할 방법이 없다.

면제 조항을 노려볼 수는 있다. "다른 콘텐츠를 가리거나 대체하지 않는" 툴팁이면 된다. 그래서 팝업 박스와 바로 아래 문단의 사각형이 겹치는지도 같이 쟀다. 여섯 개 전부 겹쳤다. 트리거 바로 아래에 절대 위치로 띄우는 흔한 배치에서는 뒤 콘텐츠를 덮지 않기가 오히려 어렵다. 레이아웃 흐름 안에 자리를 미리 비워두고 팝업을 그 자리에 넣는 설계라면 면제가 성립하지만, 그건 툴팁이라기보다 아코디언에 가깝다.

여기서 실무 판단이 하나 나온다. **툴팁을 CSS만으로 만들 수 있다는 말은 대개 "1.4.13의 셋 중 둘까지"라는 뜻이다.** 나머지 하나를 위해 결국 키보드 이벤트 리스너가 필요하고, 그렇다면 처음부터 JS로 상태를 관리하는 편이 코드가 짧아진다. `:hover` 선택자 두 줄로 끝났다고 생각한 컴포넌트가 실제로는 미완성인 채 배포된다는 것이 이 실험에서 가장 반복적으로 확인된 지점이다. 비슷한 구조를 [모달의 Escape·inert 처리를 쟀던 글](/ko/blog/ko/modal-focus-escape-inert-measure-2026)에서도 봤는데, 그때는 적어도 "닫아야 한다"는 인식이 있었다. 툴팁에는 그 인식조차 없다.

## 8px은 눈에만 있어야 하는 간격이다

Hoverable에서 V3과 V4의 운명이 갈렸다. 둘 다 CSS이고 여는 조건도 같은데, V3은 실패하고 V4는 통과했다. 차이는 선택자가 아니라 상자의 크기였다.

V3은 팝업에 `margin-top: 8px`을 줬다. 화면에서 8px 떨어져 보이고, hit-test에서도 8px 떨어져 있다. 포인터가 트리거를 벗어나 그 8px 위에 놓이는 순간 `:hover`가 풀리고 팝업이 사라진다. 스크립트가 잰 트리거 하단과 팝업 상단의 거리는 정확히 8px이었다.

V4는 같은 8px을 마진이 아니라 패딩으로 만들었다. 팝업 상자 자체는 트리거에 붙어 있고, 상자 안쪽 위에 18px의 투명한 패딩을 두어 내용물만 아래로 밀어냈다. 스크립트가 잰 간격은 0px이다. 눈에는 떨어져 보이지만 포인터에게는 붙어 있다. 보이는 크기와 히트 영역이 갈리는 이 구조는 [타깃 크기 기준을 실측했을 때](/ko/blog/ko/wcag22-target-size-audit-2026)와 같은 축 위에 있다. 여기에 `:has()`로 팝업 자신에 대한 호버까지 열림 조건에 넣으면 CSS만으로 Hoverable이 성립한다.

```css
/* 팝업을 트리거에 붙이고, 여백은 상자 안쪽으로 밀어 넣는다 */
#tip { display: none; margin-top: 0; padding-top: 18px; background: transparent; }
#tip .inner { background: #111827; color: #f9fafb; border-radius: 6px; padding: 10px 12px; }

.anchor:has(.trigger:hover) #tip,
.anchor:has(.trigger:focus-visible) #tip,
.anchor:has(#tip:hover) #tip { display: block; }
```

또 하나의 통과 경로는 시간이다. V5는 간격을 8px 그대로 두고, `mouseleave`에서 곧바로 닫는 대신 150ms 뒤에 닫도록 예약한 다음 팝업에 포인터가 닿으면 그 예약을 취소한다. 포인터가 빈 8px 위를 지나가는 동안 팝업은 살아 있다.

```js
let timer;
const open  = () => { clearTimeout(timer); tip.classList.add('open'); };
const close = () => tip.classList.remove('open');
const soft  = () => { clearTimeout(timer); timer = setTimeout(close, 150); };

trigger.addEventListener('mouseenter', open);
trigger.addEventListener('focus', open);
trigger.addEventListener('blur', close);
trigger.addEventListener('mouseleave', soft);
tip.addEventListener('mouseenter', open);
tip.addEventListener('mouseleave', soft);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
```

이 스무 줄이 일곱 개 중 유일하게 세 항목을 다 통과한 구현이다. 특별한 기법은 없다. Escape를 듣고, 간격에 유예를 주고, 타이머로 감추지 않는다. 그게 전부다.

다만 150ms라는 값은 내가 고른 숫자이지 기준에서 나온 숫자가 아니다. 헤드리스 브라우저의 직선 경로에서는 충분했지만, 손이 느리거나 곡선으로 돌아가는 실제 조작에서 얼마가 필요한지는 이번에 재지 않았다. 유예 값을 바꿔가며 실패 지점을 찾는 스윕은 다음 숙제로 남는다. 확실한 쪽은 패딩 브리지다. 간격이 0이면 유예 시간을 고를 필요 자체가 없다.

## popover는 절반을 준다

가장 배운 게 많았던 행은 V7이다. HTML의 `popover` 속성을 쓰면 브라우저가 표시 상태와 최상단 레이어를 관리해준다. `popover="hint"`는 그중 툴팁을 겨냥한 값으로, [WHATWG HTML 명세](https://html.spec.whatwg.org/multipage/popover.html)에 따르면 auto와 hint 상태는 light dismiss와 close request에 반응하고 manual은 반응하지 않는다(요약이며 축자 인용은 아니다). close request에는 Escape 키가 포함된다.

측정값이 그대로 나왔다. V7은 포인터를 그대로 둔 채 Escape를 눌렀을 때 닫혔다. **Dismissible을 코드 한 줄 없이 얻은 것은 일곱 개 중 이것뿐이다.** 브라우저가 표준으로 제공하기 시작한 기능이 접근성 기준 하나를 통째로 대신해주는 사례라, 이 값이 왜 들어왔는지 납득이 갔다.

그런데 Hoverable은 떨어졌다. 이유는 단순하다. `popover`가 관리해주는 것은 "열림과 닫힘이라는 상태"이지 "언제 열고 언제 닫을지"가 아니다. 호버로 여는 툴팁을 만들려면 결국 `mouseenter`에서 `showPopover()`, `mouseleave`에서 `hidePopover()`를 부르게 되고, 그 `mouseleave`는 포인터가 8px 간격에 들어서는 순간 발생한다. 팝업이 최상단 레이어에 있어도 포인터는 아직 그 위에 도착하지 않았다.

정리하면 이렇다. CSS는 Hoverable과 Persistent를 주고 Dismissible을 못 준다. `popover`는 Dismissible을 주고 Hoverable을 못 준다. 두 절반은 겹치지 않으므로, 셋을 다 만족시키려면 `popover`를 쓰더라도 앞 절의 유예 로직이나 패딩 브리지를 그대로 얹어야 한다. `popover` 하나로 툴팁 접근성이 끝났다는 설명을 보면 이 지점을 확인하는 편이 좋다.

## 2초 뒤 사라지는 툴팁

V6은 흔한 배려에서 출발한 구현이다. 툴팁이 화면에 계속 떠 있으면 거슬리니 2초 뒤 알아서 사라지게 한다. 여러 UI 라이브러리가 이런 기본값을 갖고 있고, 나도 예전에 이 패턴을 썼다.

포인터를 올린 채 5초를 기다렸더니 팝업은 없었다. Persistent 실패다. 기준이 허용하는 소멸 조건은 세 개뿐이다. 트리거가 제거되거나, 사용자가 닫거나, 정보가 더 이상 유효하지 않게 되거나. 경과 시간은 그 목록에 없다.

여기서 "정보가 더 이상 유효하지 않게 되는" 조건을 타이머의 근거로 삼을 수 있는지 궁금해질 수 있다. 쓸 수 있는 경우가 있긴 하다. 남은 시간을 세는 카운트다운이나 만료되는 일회용 코드처럼, 내용 자체가 시간에 묶인 경우다. API 요청 한도를 설명하는 문장은 2초 뒤에도 그대로 참이다. 읽는 속도가 느린 사용자에게서 문장을 뺏을 근거가 되지 못한다.

V6은 Hoverable에서도 떨어졌는데, 타이머와 별개로 `mouseleave`에서 즉시 닫는 구조였기 때문이다. 하나의 컴포넌트가 세 항목을 동시에 놓치는 것은 어렵지 않다.

## axe 규칙 105개 중 이 기준을 보는 것은 0개

일곱 개를 전부 열어둔 상태로 axe-core 4.13.0을 돌렸다. 보고된 위반은 `landmark-one-main`과 `region` 둘뿐이었다. 픽스처 HTML에 랜드마크를 안 넣어서 나온 것이고, 툴팁 동작과는 무관하다.

이유는 규칙 목록에 있다. axe-core 4.13.0이 가진 규칙은 105개이고, 그중 `wcag1413` 태그가 붙은 것은 0개다.

```
axe-core 4.13.0 total rules: 105
rules tagged wcag1413: 0 []
```

자동 검사기를 탓할 일은 아니다. Dismissible과 Hoverable과 Persistent는 정적 DOM에서 판정할 수 있는 성질이 아니다. 키를 눌러야 하고, 포인터를 옮겨야 하고, 기다려야 한다. [axe 규칙 태그를 성공기준별로 세어본 글](/ko/blog/ko/act-rules-axe-coverage-wcag-sc-2026)에서 확인한 사각지대가 여기서도 그대로 나타난다. 검사 점수가 초록이라는 것과 이 기준을 지켰다는 것 사이에는 아무 관계가 없다.

그래서 이번 측정의 범위도 좁게 잡아 적어둔다. 엔진 하나(Chromium 143), 간격 값 하나(8px), 직접 만든 픽스처 한 장이다. 실제 사이트의 위반율을 말하는 수치가 아니고, 다른 렌더링 엔진에서 같은 코드가 같게 동작한다는 진술도 아니다. 터치 기기의 동작과 스크린 리더 사용자의 경험은 이 자로 재지 않았다. 그리고 내 픽스처가 세 항목을 통과했다는 것이 실제 페이지의 적합성 판정과 같은 말도 아니다. 판정에는 면제 조항과 맥락이 함께 들어간다.

## 8px을 지우거나, 150ms를 주거나

이번 측정이 남긴 판단 기준은 짧다.

- **Escape는 CSS 밖에 있다.** 툴팁이 뒤 콘텐츠를 조금이라도 덮는다면 키보드 리스너를 붙인다. 덮지 않는다는 확신이 있을 때만 면제 조항에 기댄다.
- **간격은 눈에만 두고 상자에서 지운다.** `margin`으로 만든 8px은 포인터의 함정이고, `padding`으로 만든 8px은 아니다. 판정을 가르는 것은 보이는 거리가 아니라 hit-test 상의 거리다.
- **간격을 남겨야 한다면 유예를 준다.** `mouseleave`에서 즉시 닫지 말고 100〜200ms 뒤에 닫되, 팝업 진입 시 취소한다.
- **타이머로 감추지 않는다.** 자동 숨김은 내용이 실제로 시간에 묶여 있을 때만 정당하다.
- **`popover`를 쓰더라도 여닫는 조건은 직접 짠다.** 브라우저가 대신해주는 것은 Dismissible까지다.
- **손으로 확인한다.** 자동 검사기의 규칙 목록에 이 기준은 없다. 포인터를 팝업으로 밀어보고, Escape를 눌러보고, 5초 기다려보는 세 동작이면 된다.

아직 정하지 못한 것도 하나 남았다. 팝업을 트리거에 붙여 hit-test 간격을 0으로 만들면 Hoverable은 확실해지지만, 트리거와 팝업의 경계가 시각적으로 흐려져 어디까지가 버튼인지 알기 어려워지는 순간이 온다. 패딩을 얼마나 두껍게 만들어야 그 경계가 다시 보이는지, 그 값이 8px 간격을 유지하면서 유예 시간을 주는 쪽보다 정말 나은지는 이번 픽스처만으로는 답이 나오지 않았다. 다음에는 유예 값을 스윕해 두 경로를 같은 자로 비교해볼 생각이다.

드롭다운과 메뉴와 말풍선이 겹겹이 깔린 화면에서 이 세 항목을 어디부터 손대야 할지 막막하다면 물어와도 좋다. 나는 기준 문장을 컴포넌트 코드로 옮기고, 그 판정을 사람 손이 아니라 스크립트로 반복시키는 일을 한다. 연락 경로는 프로필에 적어두었다.

---

*출처: W3C의 [WCAG 2.2 성공기준 1.4.13 Content on Hover or Focus](https://www.w3.org/TR/WCAG22/#content-on-hover-or-focus)(W3C 권고안), [Understanding SC 1.4.13](https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus.html), WHATWG의 [HTML Standard, The popover attribute](https://html.spec.whatwg.org/multipage/popover.html)(모두 공식). 성공기준 본문과 노트 1·3은 W3C 권고안 원문을 그 자리에서 대조해 축자로 옮겼고, 인용 곁에 원문 링크를 두었다. Understanding 문서와 HTML 명세의 내용은 요약해 옮긴 뒤 링크로 대신했다. 측정 환경: 임시 샌드박스 디렉터리의 정적 HTML 1장(툴팁 구현 7종), Chromium 143.0.7499.4 헤드리스, Playwright 1.57.0, Node 22.22, 뷰포트 900×1400, 트리거·팝업 간격 8px, axe-core 4.13.0, 2026년 8월 12일 측정. 프로브 스크립트는 `scripts/probe-hover-focus-1413.mjs`, 픽스처는 `scripts/fixtures-hover-focus-1413.html`, 원자료는 `data/hover-focus-1413-probe.json`. 같은 스크립트를 두 번 실행해 동일한 결과를 확인했다. 모든 판정은 이 엔진·이 픽스처·이 간격 값에서 나온 것이며, 실제 사이트의 적합성 판정이나 다른 렌더링 엔진의 동작에 대한 진술이 아니다. 터치 입력과 보조기술 사용 시의 동작, `title` 속성이 그리는 브라우저 툴팁은 DOM에서 관측할 수 없어 측정하지 않았다.*
