---
title: '접근성 점수 55에서 100까지 — Lighthouse로 WCAG 위반 직접 잡아 고치기'
description: '가상의 베이커리 랜딩 페이지를 Lighthouse 접근성 감사에 돌려 55점을 받았다. 6개 WCAG 위반을 하나씩 고쳐 100점을 만든 실측 로그와, 자동 도구가 놓친 키보드 함정까지 정리했다.'
pubDate: '2026-07-02'
heroImage: '../../../assets/blog/a11y-lighthouse-audit-fix-2026/hero.png'
tags:
  - a11y
  - WCAG
  - Lighthouse
  - 웹접근성
  - 웹개발
faq:
  - question: 'Lighthouse 접근성 100점이면 WCAG를 준수한 건가요?'
    answer: '아닙니다. Lighthouse 접근성 점수는 axe-core로 자동 검사할 수 있는 항목만 계산합니다. web.dev 공식 문서는 자동 검사가 전체 접근성 문제의 일부만 잡으며 수동 검사가 반드시 필요하다고 명시합니다. 실제로 제 실험에서 키보드로 조작 불가능한 가짜 버튼(div+onclick)과 라벨 없는 textarea는 100점을 받고도 통과되지 않은 채 남아 있었습니다.'
  - question: '자동 도구로 어디까지 잡을 수 있나요?'
    answer: 'lang 속성 누락, 이미지 alt 누락, 색 대비 부족, 헤딩 순서, 링크 이름 없음, 확대 차단(user-scalable=no)처럼 마크업만 보고 판정 가능한 위반은 잘 잡습니다. 반대로 "포커스가 논리적 순서로 이동하는가", "키보드만으로 모든 기능을 쓸 수 있는가", "스크린리더로 흐름이 이해되는가"는 사람이 직접 확인해야 합니다.'
  - question: '색 대비는 어느 정도 맞춰야 하나요?'
    answer: 'WCAG 2.1 AA 기준으로 본문 텍스트는 배경과 4.5:1 이상, 큰 텍스트(약 24px 이상 또는 굵은 19px 이상)는 3:1 이상입니다. 제 before 페이지의 회색 위 연회색 CTA 버튼은 이 기준에 한참 못 미쳤고, 색만 진하게 바꿔도 대비 위반이 사라졌습니다.'
  - question: 'div에 onclick을 달면 왜 문제인가요?'
    answer: 'div는 기본적으로 포커스를 받지 못하고 Enter/Space 키에 반응하지 않습니다. 마우스로는 눌리지만 키보드·스크린리더 사용자에게는 존재하지 않는 버튼입니다. Lighthouse의 button-name 검사는 div를 버튼으로 인식조차 하지 않아 통과로 처리합니다. 실제 button 요소를 쓰거나, 불가피하면 role="button" + tabindex="0" + 키 핸들러를 모두 붙여야 합니다.'
relatedPosts:
  - slug: localbusiness-structured-data-server-side-vs-js-2026
    score: 0.6
    reason:
      ko: 둘 다 "화면에 보이는 것"이 아니라 "기계가 읽어가는 마크업"이 진짜 승부처라는 관점의 글이다. 그쪽은 크롤러가 읽는 JSON-LD를, 이 글은 스크린리더·자동 도구가 읽는 시맨틱 HTML을 다룬다.
      ja: どちらも「画面に見えるもの」ではなく「機械が読み取るマークアップ」が本当の勝負どころだという視点の記事だ。あちらはクローラーが読むJSON-LDを、本記事はスクリーンリーダーや自動ツールが読むセマンティックHTMLを扱う。
      en: Both argue that the real battleground is the markup machines read, not what shows on screen. That post covers the JSON-LD crawlers parse; this one covers the semantic HTML screen readers and audit tools parse.
      zh: 两篇都主张真正的关键在于"机器读取的标记"，而非"屏幕上看到的内容"。那篇讲爬虫读取的JSON-LD，本文讲屏幕阅读器和自动化工具读取的语义化HTML。
  - slug: multilingual-llm-token-tax-experiment
    score: 0.5
    reason:
      ko: 이 글도 내 사이트를 실측 대상으로 삼아 숫자로 확인한 글이다. Lighthouse 점수를 before/after로 직접 재본 이 글과 "믿지 말고 내 환경에서 재본다"는 접근이 같다.
      ja: この記事も自分のサイトを実測対象にして数字で確かめたものだ。Lighthouseスコアをbefore/afterで自分で測った本記事と「信じずに自分の環境で測る」というアプローチが同じだ。
      en: That post also treats my own site as the thing to measure and confirms it with numbers. It shares this article's approach of measuring before/after Lighthouse scores myself rather than trusting a claim.
      zh: 那篇文章同样把自己的网站当作实测对象、用数字来确认。与本文亲自测量before/after的Lighthouse分数一样，都是"不轻信、在自己环境里测"的思路。
---

같은 HTML 한 벌을 두 번 감사에 돌렸다. 처음 점수는 55, 두 번째는 100. 그사이에 바뀐 건 코드 스무 줄 남짓이었다. 접근성은 흔히 "예산이 남으면 나중에" 취급받는데, 실제로 손을 대보면 상당수는 이렇게 몇 줄짜리 마크업 문제다.

이번엔 말로만 하지 않고 직접 재봤다. 흔히 나오는 접근성 실수를 일부러 심은 베이커리 랜딩 페이지를 만들고, 크롬 DevTools의 Lighthouse 접근성 감사를 돌려 점수와 위반 목록을 뽑았다. 그다음 위반을 하나씩 고쳐 다시 측정했다. 아래 숫자와 로그는 전부 그 샌드박스에서 나온 실제 결과다.

## 왜 지금, 웹 개발자가 접근성을 직접 재봐야 하나

접근성(a11y)은 스크린리더·키보드 사용자만의 문제가 아니게 됐다. 페이지를 "사람 눈"이 아니라 접근성 트리(accessibility tree)로 읽어가는 주체가 늘었기 때문이다. 스크린리더가 그랬고, 이제는 AI 검색 크롤러와 브라우징 에이전트도 비슷한 구조 정보를 읽는다. 실제로 이번 감사에서 접근성을 고치자 Lighthouse의 Agentic Browsing 점수가 50에서 100으로 같이 올라갔다. 시맨틱 마크업 하나를 제대로 두면 사람 사용자와 기계 소비자 양쪽에 동시에 값이 매겨지는 셈이다.

이건 [크롤러가 읽어가는 마크업이 진짜 승부처라고 정리했던 구조화 데이터 글](/ko/blog/ko/localbusiness-structured-data-server-side-vs-js-2026)과 같은 결이다. 화면에 잘 보이느냐와, 기계가 구조를 이해하느냐는 별개다. 접근성은 그 "기계가 읽는 층"을 사람 사용자 쪽에서 본 문제다.

한 가지는 미리 못 박아둔다. **Lighthouse 접근성 100점은 "WCAG 준수"를 뜻하지 않는다.** web.dev 공식 문서가 분명히 하듯, 이 점수는 axe-core로 자동 검사 가능한 항목만 계산하며 자동 검사는 전체 접근성 문제의 일부만 잡는다. 뒤에서 100점을 받고도 남아 있던 실제 결함을 그대로 보여주겠다.

## 실험 설정: 일부러 망가뜨린 랜딩 페이지

테스트 대상은 repo 밖 임시 디렉터리에 만든 정적 HTML 한 장이다. 가상의 베이커리 "Nordic Bakes" 랜딩 페이지로, 헤더 내비게이션, 히어로, 이미지 카드, 예약 폼, 푸터를 갖춘 평범한 구성이다. 여기에 현업에서 자주 마주치는 접근성 실수를 의도적으로 심었다.

- `<html>`에 `lang` 속성 없음
- 대표 이미지와 링크 안 아이콘 이미지에 `alt` 없음
- 연한 배경 위 더 연한 텍스트·버튼(색 대비 부족)
- `<h1>` 다음에 바로 `<h3>`가 오는 헤딩 순서 붕괴
- 이미지만 감싼 링크(`<a>` 안에 텍스트 없이 이미지만)
- `<meta viewport>`에 `user-scalable=no, maximum-scale=1` (확대 차단)
- 그리고 자동 도구가 잘 못 잡는 것 두 개: 라벨 없는 `<textarea>`, 그리고 버튼처럼 생겼지만 실은 `<div onclick>`인 "Send request" 컨트롤

로컬에 `python3 -m http.server`로 띄우고, 크롬을 그 URL로 보낸 뒤 Lighthouse 감사를 `navigation` 모드(데스크톱)로 실행했다.

![수정 전 Nordic Bakes 랜딩 페이지: 겉보기엔 멀쩡하지만 여섯 개의 접근성 위반이 숨어 있다](../../../assets/blog/a11y-lighthouse-audit-fix-2026/before-page.png)

눈으로 보면 멀쩡하다. 문제는 전부 화면 아래, 마크업 안에 있다.

## 1차 측정: 55점, 여섯 개의 위반

첫 결과다.

```text
URL: http://localhost:8765/before.html  (desktop, navigation)
Accessibility:      55
Best Practices:     100
SEO:                82
Agentic Browsing:   50
Passed: 32   Failed: 8
```

접근성 카테고리에서 실패한 감사 항목을 리포트 JSON에서 뽑으면 이렇게 나온다.

| 감사 항목 | 위반 내용 | 영향받은 노드 |
|---|---|---|
| `html-has-lang` | `<html>`에 `[lang]` 속성 없음 | 1 |
| `image-alt` | 이미지에 `[alt]` 없음 | 2 |
| `color-contrast` | 전경/배경 대비 부족 | 4 |
| `heading-order` | 헤딩이 순차적으로 내려가지 않음 | 1 |
| `link-name` | 링크에 식별 가능한 이름 없음 | 1 |
| `meta-viewport` | `user-scalable="no"` / `maximum-scale<5` | 1 |

여섯 항목 모두 마크업만 보고 판정할 수 있는, 자동 검사에 딱 맞는 유형이다. 그리고 여섯 개 전부 실제 사용자에게 구체적인 장벽이 된다. `lang`이 없으면 스크린리더가 어떤 언어 음성 엔진으로 읽을지 못 정한다. `alt`가 없으면 이미지는 그냥 "이미지" 또는 파일명으로 읽힌다. 확대 차단은 저시력 사용자가 화면을 키우는 걸 막는다.

## 하나씩 고치기: 코드 diff로 보는 여섯 개 수정

수정은 어렵지 않다. 핵심은 "장식이 아니라 의미를 코드에 담는 것"이다.

**1) 문서 언어 선언.** 한 글자짜리 문제다.

```html
<!-- before -->
<html>
<!-- after -->
<html lang="en">
```

**2) 이미지 대체 텍스트.** 정보를 담은 이미지에는 내용을, 순수 장식 이미지에는 빈 `alt=""`를 준다. 여기 두 이미지는 둘 다 의미가 있어 서술형으로 채웠다.

```html
<!-- before -->
<img src="/hero.jpg" width="320" height="180">
<a href="/story"><img src="/icon.svg" width="24" height="24"></a>
<!-- after -->
<img src="/hero.jpg" width="320" height="180"
     alt="Loaves of sourdough cooling on a wooden rack">
<a href="/story"><img src="/icon.svg" width="24" height="24"
     alt="Read our full story"></a>
```

두 번째 수정은 `image-alt`뿐 아니라 `link-name`도 같이 해결한다. 텍스트 없이 이미지만 든 링크는 alt가 채워지는 순간 그 alt가 링크의 접근 가능한 이름이 되기 때문이다. 위반 하나를 고치면 다른 위반이 딸려 사라지는 건 접근성 수정에서 흔한 패턴이다.

**3) 색 대비.** before의 CTA 버튼은 연한 파랑 배경(`#c8d8e4`)에 더 연한 회색 글자(`#aab8c2`)였다. AA 기준(본문 4.5:1, 큰 텍스트 3:1)에 한참 못 미친다. 색만 진하게 바꿨다.

```css
/* before */
.cta { background:#c8d8e4; color:#aab8c2; }
.hero p { color:#9a9a9a; }
/* after */
.cta { background:#1f4e5a; color:#ffffff; }   /* 대비 큰 폭 상승 */
.hero p { color:#595959; }                     /* #f2f2f2 배경 위 AA 통과 */
```

**4) 헤딩 순서.** before는 `<h1>` 바로 뒤에 `<h3>`가 왔다. 스크린리더 사용자는 헤딩만 훑어 페이지 구조를 파악하는데, 레벨을 건너뛰면 "중간 단계가 빠진" 목차처럼 들린다. 시각적 크기는 CSS로 조절하고, 마크업 레벨은 논리대로 `<h2>`로 낮췄다.

```html
<!-- before -->
<h1>Fresh Sourdough, Baked Daily</h1>
<h3>Order before 9am for same-day pickup</h3>
<!-- after -->
<h1>Fresh Sourdough, Baked Daily</h1>
<h2>Order before 9am for same-day pickup</h2>
```

**5) 확대 허용.** 뷰포트 메타에서 확대를 막는 속성을 뺐다. 확대 차단은 개발자가 "레이아웃 깨짐 방지" 명목으로 무심코 넣는 대표적 안티패턴이다.

```html
<!-- before -->
<meta name="viewport" content="width=device-width, initial-scale=1,
      user-scalable=no, maximum-scale=1">
<!-- after -->
<meta name="viewport" content="width=device-width, initial-scale=1">
```

여기에 내비게이션을 `<div>`에서 `<nav aria-label="Primary">`로 바꾸고, 아이콘 버튼(🛒)에 `aria-label="Open cart"`를 붙이는 정리도 함께 했다. 이건 감사 점수에 직접 잡히진 않았지만 스크린리더 경험을 실제로 개선한다.

## 2차 측정: 100점, 그리고 남은 SEO 한 줄

같은 절차로 after 페이지를 다시 감사했다.

```text
URL: http://localhost:8765/after.html  (desktop, navigation)
Accessibility:      100    (was 55)
Best Practices:     100
SEO:                91     (was 82)
Agentic Browsing:   100    (was 50)
Passed: 46   Failed: 1
```

![수정 후 Nordic Bakes 랜딩 페이지: 화면은 거의 그대로지만 접근성 위반이 0개가 됐다](../../../assets/blog/a11y-lighthouse-audit-fix-2026/after-page.png)

접근성은 위반 0개로 100점. 남은 실패 하나는 접근성이 아니라 SEO 카테고리의 `meta-description`(설명 메타 태그 없음)이었다. 이건 이번 실험 범위 밖이라 그대로 뒀다. 눈여겨볼 건 Agentic Browsing이 50에서 100으로 같이 뛴 점이다. 시맨틱 요소(`nav`, 제대로 된 헤딩 계층, 이름 있는 컨트롤)는 브라우징 에이전트가 페이지 구조를 파싱하는 데도 그대로 쓰인다. 접근성 수정 하나가 세 카테고리를 동시에 밀어 올렸다.

## 자동 도구가 100점을 주고도 놓친 것

여기가 이 실험에서 제일 하고 싶은 얘기다. **100점 페이지에도 실제 접근성 결함이 남아 있었다.**

before 페이지에 심어둔 두 함정을 기억할 것이다. 라벨 없는 `<textarea>`, 그리고 버튼처럼 스타일링했지만 실체는 `<div onclick="submitForm()">`인 "Send request" 컨트롤. 리포트 JSON에서 관련 감사 항목의 점수를 직접 확인해봤다.

```text
label                          => score: 1   (통과)
button-name                    => score: 1   (통과)
focusable-controls             => score: null (수동 확인 항목)
interactive-element-affordance => score: null (수동 확인 항목)
```

라벨 없는 textarea는 `label` 감사를 **통과**했다. 가짜 버튼 div는 `button-name` 감사를 **통과**했다. 도구가 그 div를 버튼으로 인식조차 하지 않기 때문이다. 버튼이 아닌 것에 "버튼 이름 있음" 규칙은 적용되지 않는다. 그리고 이 div의 진짜 문제(키보드로 포커스도, 실행도 안 됨)를 잡을 `focusable-controls` 항목은 자동 채점이 아니라 "사람이 직접 확인하세요"로 분류돼 점수에 안 들어간다.

정리하면 이렇다. div에 onclick만 달면 마우스로는 눌리지만 키보드 사용자에게는 존재하지 않는 버튼이다. `<div>`는 기본적으로 포커스를 못 받고 Enter/Space에 반응하지 않는다. 제대로 고치려면 `<button type="submit">`을 쓰거나, 정말 불가피할 때만 `role="button"` + `tabindex="0"` + 키 핸들러를 전부 붙여야 한다. after 페이지에서는 그냥 실제 `<button>`으로 바꿨다.

솔직히 나는 이 대목이 접근성 점수의 가장 큰 함정이라고 본다. 100점은 "자동으로 잡히는 문제가 없다"는 뜻이지 "쓸 수 있는 페이지"라는 보증이 아니다. 점수를 목표로 삼으면 도구가 못 보는 곳에 결함을 몰아넣는 최적화를 하게 된다.

## 그래서 개발자가 바로 할 일 (체크리스트)

이번 실험에서 건진 실무 순서다.

- **자동 감사를 CI에 넣되, 통과를 최종 승인으로 착각하지 않는다.** Lighthouse CI나 `axe-core`를 빌드에 붙여 회귀(regression)를 막는 용도로 쓴다. `lang`·`alt`·대비·헤딩·링크 이름 같은 기계 판정 가능한 위반은 이 층에서 전부 걸러진다.
- **점수가 100이어도 키보드 패스를 손으로 한 번 돈다.** Tab만으로 모든 인터랙티브 요소에 도달·실행되는지, 포커스 순서가 시각 순서와 맞는지 확인한다. `<div onclick>` 같은 가짜 컨트롤은 여기서만 잡힌다.
- **아이콘 전용 버튼에는 접근 가능한 이름을 반드시 준다.** `aria-label`이든 시각적으로 숨긴 텍스트든. 🛒 하나만 든 버튼은 스크린리더에서 그냥 "button"으로 읽힌다.
- **색은 디자인 확정 단계에서 대비를 잰다.** 나중에 고치면 브랜드 색 전체를 다시 만져야 한다. AA는 본문 4.5:1, 큰 텍스트 3:1.
- **헤딩 레벨은 크기가 아니라 문서 구조로 정한다.** 크게 보이고 싶으면 CSS로 키운다. `h3`가 `h1` 바로 밑에 오지 않게 한다.
- **확대를 막지 않는다.** `user-scalable=no`와 작은 `maximum-scale`은 저시력 사용자를 배제한다.

이 순서의 핵심은 자동과 수동의 역할 분담이다. 자동 도구는 반복 가능한 기계적 위반을 값싸게 막아주고, 사람은 도구가 원리상 못 보는 "실제로 쓸 수 있는가"를 본다. 둘 중 하나만 하면 반쪽이다. 그리고 어느 쪽이든, 남의 벤치마크를 믿기 전에 [내 사이트를 직접 실측 대상으로 삼아 숫자를 뽑았던 것](/ko/blog/ko/multilingual-llm-token-tax-experiment)처럼 내 환경에서 before/after를 손수 재보는 게 먼저다.

기존 사이트의 접근성을 실제 점수와 키보드 패스로 점검하거나, 디자인 시스템 단계에서 대비·시맨틱 구조를 잡아두고 싶다면, 개인적으로 상담·점검을 받는다. 프로필의 문의 경로로 연락하면 된다. 판매가 아니라, 이 층을 실무로 다루는 사람이 옆에서 한 번 봐주는 정도의 이야기다.
