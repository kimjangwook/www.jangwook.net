---
title: 접근성 이름이 틀리면 음성 제어도 AI 에이전트도 버튼을 못 누른다
description: >-
  버튼에 aria-label을 붙였는데 접근성 트리는 화면에 없는 글자를 읽는다. WCAG 2.5.3 Label in Name 위반을
  샌드박스에서 재현해 확인하고, Lighthouse 13.3.0의 Agentic Browsing 점수가 0점에서 100점으로 바뀌는 과정을
  실측했다.
pubDate: '2026-07-10'
heroImage: ../../../assets/blog/accessible-name-agents-2026/hero.png
tags:
  - a11y
  - wcag
  - accessibility
  - geo
  - web-development
relatedPosts:
  - slug: a11y-lighthouse-audit-fix-2026
    score: 0.82
    reason:
      ko: "Lighthouse로 접근성 위반을 잡아 고치는 전체 흐름이 궁금하다면 이 글이 출발점이다. 여기서는 그중 accessible name 하나만 깊게 판다."
      ja: "Lighthouseでアクセシビリティ違反を捕まえて直す全体像はこの記事が出発点。本稿はそのうちaccessible nameだけを深掘りする。"
      en: "For the full flow of catching and fixing a11y violations with Lighthouse, start there; this post drills into just the accessible name."
      zh: "想了解用Lighthouse抓取并修复无障碍问题的完整流程，那篇是起点；本文只深入讲accessible name这一项。"
  - slug: axe-core-ci-a11y-jsdom-vs-browser-2026
    score: 0.8
    reason:
      ko: "여기서 손으로 확인한 접근성 트리 검사를, CI에서 axe-core로 자동화하려면 브라우저 실행 여부가 결과를 가른다는 걸 다룬 글이다."
      ja: "本稿で手動確認したアクセシビリティツリー検査を、CIでaxe-coreに自動化する際、ブラウザ実行の有無が結果を分ける話。"
      en: "This checks the accessibility tree by hand; that post shows why running axe-core in a real browser vs jsdom changes the result in CI."
      zh: "本文手动检查无障碍树；那篇讲在CI里用axe-core时，跑真实浏览器还是jsdom会左右结果。"
  - slug: ai-crawlers-dont-render-javascript-csr-2026
    score: 0.74
    reason:
      ko: "AI 크롤러가 raw HTML만 읽는다는 그 글과 짝이 된다. 크롤러는 텍스트를, 에이전트는 접근성 트리를 읽는다 — 둘 다 서버가 내보낸 마크업이 전부다."
      ja: "AIクローラーがraw HTMLしか読まないという記事と対になる。クローラーはテキストを、エージェントはアクセシビリティツリーを読む。"
      en: "A companion to the post on AI crawlers reading only raw HTML: crawlers read text, agents read the accessibility tree — both live off your markup."
      zh: "与「AI爬虫只读raw HTML」那篇互为一对：爬虫读文本，智能体读无障碍树，两者都只吃你输出的标记。"
  - slug: localbusiness-structured-data-server-side-vs-js-2026
    score: 0.68
    reason:
      ko: "접근성 이름을 서버가 확실히 내보내야 하듯, LocalBusiness 구조화 데이터도 JS가 아니라 서버 응답에 있어야 한다는 걸 실측한 글이다."
      ja: "アクセシブルネームをサーバーで確実に出すのと同じく、LocalBusiness構造化データもJSではなくサーバー応答に載せるべきだと実測した記事。"
      en: "Just as accessible names must ship from the server, this post measures why LocalBusiness structured data belongs in the server response, not JS."
      zh: "正如无障碍名称要从服务端稳稳输出，这篇实测了LocalBusiness结构化数据也该放在服务器响应里，而不是靠JS注入。"
---

버튼 하나에 `aria-label="Submit order"`를 붙였다. 배려였다. 화면에는 "Send"라고만 떠 있으니, 스크린 리더 사용자에겐 좀 더 친절하게 "주문 제출"이라고 읽어주고 싶었던 거다. 그런데 이 버튼의 접근성 트리를 열어보면 이렇게 나온다.

```text
button "Submit order"
```

눈에 보이는 글자는 "Send", 기계가 읽는 이름은 "Submit order". 둘이 다르다. 그리고 이 어긋남 하나 때문에 음성 제어 사용자가 "Send 눌러줘"라고 말하면 아무 일도 일어나지 않는다. 여기까지는 웹 접근성을 좀 다뤄본 사람이면 아는 이야기다. 새로운 건 세 번째 피해자다. Lighthouse 13.3.0을 돌렸더니 `Agentic Browsing`이라는 낯선 카테고리가 점수판에 올라와 있었고, 내 아이콘 버튼은 거기서 <strong>0점</strong>을 받았다. 접근성 트리가 이제 AI 에이전트가 페이지를 읽는 인터페이스이기 때문이다.

오늘은 이걸 말로만 하지 않고 샌드박스에서 직접 재현했다. 흔한 버튼 여섯 개를 서로 다르게 마크업해 접근성 트리를 열어보고, Lighthouse로 접근성 점수와 Agentic Browsing 점수를 나란히 측정했다. 아래 로그와 숫자는 전부 그 실험에서 나온 실제 출력이다.

## 접근성 이름이 뭐고, 왜 셋이 한꺼번에 걸리나

먼저 토대부터. <strong>접근성 이름(accessible name)</strong>은 어떤 UI 요소를 기계가 부를 때 쓰는 이름이다. 버튼, 링크, 입력 필드 같은 인터랙티브 요소에는 각각 이 이름이 하나씩 계산되어 붙는다. 계산 규칙은 W3C의 [Accessible Name and Description Computation](https://www.w3.org/TR/accname-1.2/)이라는 별도 표준이 정의한다. 대략의 우선순위는 이렇다.

1. `aria-labelledby`가 가리키는 요소의 텍스트
2. `aria-label` 속성값
3. 요소 본래의 이름 소스 (`<label for>`로 연결된 라벨, 이미지의 `alt`, 버튼 안의 텍스트 등)
4. `title` 속성 (최후의 보루)

핵심은 <strong>위에 있는 게 아래를 덮어쓴다</strong>는 점이다. `aria-label`을 달면 버튼 안에 보이는 글자는 이름 계산에서 무시된다. 이게 맨 앞의 함정이었다. 배려로 붙인 `aria-label`이 정작 화면의 "Send"를 지워버린 것이다.

이 우선순위를 실제로 체감하려면 `aria-labelledby`를 보면 된다. 다른 요소의 id를 가리켜 그 텍스트를 이름으로 빌려오는 방식이다.

```html
<h2 id="section-title">배송 설정</h2>
<button aria-labelledby="section-title">저장</button>
```

이 버튼의 접근성 이름은 화면에 보이는 "저장"이 아니라 "배송 설정"이 된다. `aria-labelledby`가 1순위라서 버튼 안의 "저장"을 완전히 밀어낸 것이다. 이게 왜 위험한지 감이 올 것이다. 우선순위가 높은 속성 하나가, 개발자가 의도한 이름을 조용히 갈아치운다. 그래서 나는 이 계산 규칙을 "편의 기능"이 아니라 "덮어쓰기 규칙"으로 외워두라고 말한다. 무엇을 얹느냐가 아니라, 무엇을 지우느냐를 먼저 생각해야 한다.

이 이름들이 모여 만들어지는 게 <strong>접근성 트리(accessibility tree)</strong>다. 브라우저는 DOM을 그대로 노출하지 않는다. 시각 정보를 걷어내고, 역할(role)과 이름과 상태만 남긴 별도의 트리를 만들어 보조기술에 넘긴다. 여기서 중요한 사실 하나. 이 트리를 소비하는 쪽이 지금 셋으로 늘었다.

- <strong>스크린 리더</strong>: 시각장애 사용자가 듣는 이름이 곧 이 트리의 이름이다.
- <strong>음성 제어</strong>: 사용자가 "OK 눌러줘"라고 말하면, 소프트웨어는 접근성 이름이 "OK"인 컨트롤을 찾는다.
- <strong>AI 에이전트</strong>: 브라우저 안에서 페이지를 조작하는 에이전트는 픽셀이 아니라 이 트리를 읽어 "누를 수 있는 것"의 목록을 만든다.

그래서 마크업이 이름을 틀리게 만들면 셋이 동시에 무너진다. 이건 접근성이 착한 일에서 실무 기능으로 넘어왔다는 신호다. 예전엔 "스크린 리더 사용자를 위해" 이름을 챙겼다면, 이제는 "음성 인터페이스와 AI 에이전트가 이 버튼을 못 누르니까" 챙겨야 한다. 같은 작업, 늘어난 이유.

AI 크롤러가 [자바스크립트를 실행하지 않아 raw HTML만 읽는다는 이야기](/ko/blog/ko/ai-crawlers-dont-render-javascript-csr-2026)를 전에 다뤘는데, 에이전트는 거기서 한 발 더 들어간다. 크롤러가 텍스트를 긁는다면, 에이전트는 접근성 트리에서 "클릭 가능한 컨트롤"을 추려 실제로 조작을 시도한다. 둘 다 결국 서버가 내보낸 마크업이 전부라는 점은 같다.

## 같은 버튼, 다른 이름 — 접근성 트리를 직접 열어봤다

이론은 여기까지. 임시 샌드박스에 정적 HTML 한 장을 만들고, 흔히 보는 컨트롤 여섯 개를 일부러 다르게 마크업했다. 그리고 Chrome의 접근성 트리를 스냅샷으로 떴다. 실제 출력은 이렇다.

```text
button "Submit order"          ← 화면 텍스트는 "Send" (불일치)
button "Send order to warehouse"  ← 화면 텍스트 "Send order" 포함 (통과)
button                         ← 아이콘만 있는 버튼, 이름 없음
button "Send message"          ← 아이콘 버튼에 이름 부여 (통과)
StaticText "Delete"            ← div로 만든 버튼: 컨트롤이 아예 아님
textbox "Search"               ← placeholder에서 끌어온 이름 (취약)
```

한 줄씩 뜯어보면 실무에서 매일 마주치는 실수가 그대로 담겨 있다.

<strong>첫째 줄</strong>이 앞서 말한 Label in Name 위반이다. `aria-label`이 화면 텍스트를 덮어써서, 보는 글자와 읽히는 이름이 갈라졌다.

<strong>세 번째 줄</strong>은 이름이 통째로 비었다. 아이콘만 넣은 버튼인데 SVG에 `aria-hidden="true"`를 걸어 장식 처리했고, 그럼 버튼 자체엔 이름 소스가 하나도 안 남는다. 스크린 리더는 이걸 그냥 "버튼"이라고만 읽는다. 무슨 버튼인지는 아무도 모른다.

가장 인상적인 건 <strong>다섯 번째 줄</strong>이다. `<div class="btn">Delete</div>`로 만든 삭제 버튼은 접근성 트리에서 `button`이 아니라 `StaticText`로 나온다. 즉 컨트롤로 <strong>존재하지 않는다</strong>. 시각적으로는 버튼처럼 보여도, 스크린 리더에게도 음성 제어에게도 AI 에이전트에게도 이건 그냥 글자 조각이다. 키보드 포커스도 안 간다. 이 삭제 버튼은 마우스를 쓰는 사람만 누를 수 있다.

여섯 번째 줄의 `textbox "Search"`는 통과처럼 보이지만 함정이다. 이름을 `placeholder`에서 끌어왔다. placeholder는 라벨이 아니다. 입력을 시작하면 사라지고, 일부 보조기술은 이걸 이름으로 인정하지 않는다. 화면에 라벨이 안 보이는 검색창이 접근성 관점에선 이름 없는 입력과 다를 게 없어지는 순간이다.

이 여섯 줄이 왜 중요하냐면, 브라우저 개발자 도구의 접근성 패널이나 접근성 트리 스냅샷은 <strong>점수가 아니라 실제 이름</strong>을 보여주기 때문이다. Lighthouse 점수 100점을 봐도 안심하면 안 되는 이유가 여기 있다. 점수는 합격/불합격을 요약할 뿐, "이 버튼이 정확히 뭐라고 읽히는가"는 트리를 직접 봐야 안다.

## WCAG 2.5.3 Label in Name — aria-label이 화면 글자를 덮을 때

첫째 줄의 불일치는 감이 아니라 명문화된 기준 위반이다. W3C의 [Understanding SC 2.5.3: Label in Name](https://www.w3.org/WAI/WCAG22/Understanding/label-in-name)은 이걸 <strong>Level A</strong>, 즉 가장 기본 등급으로 못 박는다. 공식 문구는 이렇다.

> 2.5.3을 충족하려면, 눈에 보이는 라벨을 이루는 텍스트 문자열이 접근성 이름 안에 <strong>온전히 그대로</strong> 나타나야 한다.

W3C가 드는 이유가 명확하다. 음성 입력 사용자는 화면에 보이는 글자를 소리 내어 컨트롤을 조작한다. "Send"라고 적힌 버튼을 누르려면 "Send"라고 말하는데, 접근성 이름이 "Submit order"면 소프트웨어는 매칭에 실패한다. 사용자가 보고 말한 그 단어가 이름 안에 없기 때문이다.

여기서 자주 하는 오해 하나를 짚고 싶다. `aria-label`은 "더 친절한 설명"을 얹는 도구가 아니다. 이건 이름 자체를 <strong>교체</strong>하는 명령이다. 그러니 화면에 텍스트가 이미 있는 컨트롤이라면, `aria-label`을 함부로 붙이지 않는 게 안전하다. 정말 보강이 필요하면, W3C 권고대로 <strong>보이는 라벨을 앞에 두고</strong> 뒤에 덧붙인다. 둘째 줄의 "Send order to warehouse"가 그 예다. 화면의 "Send order"를 그대로 품고 있으니 2.5.3을 통과한다.

내가 실무에서 본 이 위반의 가장 흔한 출처는 아이콘 + 텍스트 버튼이다. 디자인 시스템 컴포넌트가 `aria-label`을 프롭으로 받는데, 개발자가 거기에 화면 텍스트와 다른 문구를 넣는다. 번역 파일에서 라벨과 aria-label을 따로 관리하다 한쪽만 바뀌는 경우도 많다. 눈으로는 절대 안 잡힌다. 접근성 트리를 열거나 자동 검사를 돌려야 보인다.

## Lighthouse가 이제 Agentic Browsing을 점수로 매긴다

여기서 오늘 실험의 진짜 놀라운 대목. 같은 페이지에 Lighthouse 13.3.0을 돌렸더니, 익숙한 Accessibility 옆에 `Agentic Browsing`이라는 카테고리가 새로 붙어 있었다. 그 안의 감사 항목 이름은 `agent-accessibility-tree`, 설명은 이렇게 적혀 있다.

> 잘 구성된 접근성 트리는 AI 에이전트가 페이지를 탐색하고 상호작용하도록 돕는다.

구글의 Lighthouse 팀이 "접근성 트리 = AI 에이전트의 인터페이스"라는 명제를 아예 감사 항목으로 만들어 넣은 것이다. 내가 이 글에서 주장하려던 걸 도구가 먼저 점수화하고 있었다. 망가진 페이지와 고친 페이지를 나란히 측정한 결과다.

| 카테고리 | 망가진 버전 | 고친 버전 |
|---|---|---|
| Accessibility | 90 | 100 |
| Agentic Browsing | 0 | 100 |
| SEO | 75 | 100 |
| Best Practices | 100 | 100 |

![수정한 샌드박스 페이지 — 모든 컨트롤이 이름을 갖고 div는 진짜 버튼이 됐다](../../../assets/blog/accessible-name-agents-2026/fixed-page.png)

접근성 점수는 90에서 100으로 10점 오르는 데 그쳤지만, Agentic Browsing은 <strong>0에서 100</strong>으로 뛰었다. 자동 검사가 실패로 잡은 접근성 항목은 셋이었다.

- `label-content-name-mismatch` — 첫째 줄의 2.5.3 위반. 실패 노드로 `<button aria-label="Submit order">`를 정확히 지목했다.
- `button-name` — 이름 없는 아이콘 버튼.
- `landmark-one-main` — `<main>` 랜드마크 부재.

고친 버전에서 한 일은 특별할 게 없다. `aria-label`을 화면 텍스트를 품는 문구로 바꾸고, 아이콘 버튼에 이름을 주고, `<div class="btn">`을 진짜 `<button>`으로 바꾸고, 입력에 `<label for>`를 연결하고, 본문을 `<main>`으로 감쌌다. 마크업 몇 줄. 그런데 그 몇 줄이 세 종류의 소비자 모두에게 페이지를 열어준다. [Lighthouse로 접근성 위반을 잡아 고치는 전체 흐름](/ko/blog/ko/a11y-lighthouse-audit-fix-2026)은 따로 정리해뒀으니, 이번엔 이름 하나에 집중한다.

솔직히 말하면 나는 이 Agentic Browsing 카테고리가 반가우면서도 조심스럽다. 반가운 이유는 "접근성을 잘 해두면 AI 시대에도 유리하다"는 주장에 드디어 도구의 뒷받침이 생겼다는 점이다. 조심스러운 이유는 다음 문단에서 말한다.

## 정직한 한계 — 100점이 접근성 완성이 아니다

먼저 가장 중요한 한계. <strong>Lighthouse 접근성 100점은 "이 페이지가 접근 가능하다"는 증명이 아니다.</strong> 이건 axe와 Lighthouse 공식 문서가 스스로 밝히는 내용이다. 자동 검사는 규칙으로 잡을 수 있는 위반만 잡는다. 실제로 스크린 리더로 흐름을 따라가 봤을 때 말이 되는지, 포커스 순서가 자연스러운지, 이름이 <strong>맥락에서</strong> 이해되는지는 사람이 확인해야 한다. 100점은 바닥을 통과했다는 뜻이지, 천장에 닿았다는 뜻이 아니다.

둘째, Agentic Browsing 카테고리는 <strong>새롭고 실험적</strong>이다. 점수 산정 방식과 가중치는 앞으로 얼마든지 바뀔 수 있다. 그러니 이 점수를 "AI 에이전트가 확실히 우리 페이지를 조작한다"는 보장으로 읽으면 안 된다. 하나의 신호일 뿐이다. 이 카테고리와 관련한 구체적 수치는 <strong>참고값(공식 보장 아님)</strong>으로 다루는 게 맞다.

셋째, 접근성 이름을 고친다고 검색 순위나 AI 인용이 올라간다는 보장은 없다. 그런 보장은 어디에도 없다. 접근성은 순위를 사는 트릭이 아니라, 이미 방문한(또는 조작하려는) 사용자와 에이전트가 페이지를 제대로 쓰게 하는 토대다. 효과를 순위로 환산해 파는 순간 그건 접근성이 아니라 마케팅 문구가 된다.

넷째, placeholder를 이름으로 쓰는 여섯째 줄 같은 경우, Lighthouse는 통과처럼 보여줄 수 있다. 하지만 앞서 말했듯 placeholder는 라벨이 아니고 보조기술마다 처리가 다르다. 도구가 통과시켰다고 안전한 게 아니라는 걸 보여주는 또 다른 예다. 뒤집어 말하면, 자동 검사가 놓치는 게 있다고 해서 자동 검사를 버리라는 뜻은 아니다. 오늘 다룬 Label in Name 불일치와 이름 없는 버튼은 규칙으로 <strong>확실히 잡히는</strong> 부류다. 그러니 실무 순서는 이렇다. 먼저 자동 검사로 확실히 잡히는 걸 전부 없애고, 그 다음에 사람이 트리와 실제 흐름을 확인한다. 자동화는 바닥을 보장하고, 사람이 천장을 확인한다. 자동 검사와 실제 접근성 사이의 간극은 CI에서도 그대로 문제가 되는데, [axe-core를 브라우저에서 돌리느냐 jsdom에서 돌리느냐가 결과를 가르는 이유](/ko/blog/ko/axe-core-ci-a11y-jsdom-vs-browser-2026)도 같은 맥락이다.

## 개발자가 오늘 바로 할 체크리스트

말은 여기까지 하고, 실제로 코드에서 바꿀 것들이다. 접근성 이름을 무너뜨리는 실수는 몇 개로 압축된다.

<strong>1. 화면에 텍스트가 있으면, aria-label로 덮지 마라.</strong> 꼭 필요하면 보이는 라벨을 앞에 두고 확장한다.

```html
<!-- 피할 것: 화면 글자와 이름이 어긋남 (2.5.3 위반) -->
<button aria-label="Submit order">Send</button>

<!-- 할 것: 이름이 없어도 됨. 버튼 텍스트가 곧 이름 -->
<button type="button">Send order</button>

<!-- 보강이 필요하면 보이는 라벨을 앞에 -->
<button aria-label="Send order to warehouse">Send order</button>
```

<strong>2. 아이콘만 있는 컨트롤엔 반드시 이름을 준다.</strong> 장식 SVG는 `aria-hidden`으로 감추고, 이름은 버튼에 건다.

```html
<button aria-label="Send message">
  <svg aria-hidden="true" viewBox="0 0 24 24"><path d="…" /></svg>
</button>
```

<strong>3. div/span에 onclick 달지 말고 진짜 button/a를 써라.</strong> 이게 접근성 트리에서 컨트롤을 아예 사라지게 하는 가장 큰 원인이다. 키보드 포커스, 엔터/스페이스 동작, 역할까지 공짜로 딸려 온다.

<strong>4. 입력에는 `<label for>`를 연결한다.</strong> placeholder는 라벨이 아니다.

```html
<label for="q">검색</label>
<input id="q" type="text">
```

<strong>5. 랜드마크를 넣는다.</strong> 본문은 `<main>`으로 감싼다. 스크린 리더 사용자와 에이전트 모두 이 구조로 페이지를 훑는다.

<strong>6. 점수가 아니라 트리를 확인한다.</strong> Chrome 개발자 도구의 Accessibility 패널에서 각 컨트롤의 계산된 접근성 이름(Computed name)을 직접 본다. 화면에 보이는 글자와 실제로 읽히는 이름이 같은지 눈으로 대조하는 이 30초가, Lighthouse 100점보다 많은 걸 알려준다.

이 여섯 개 중에서 딱 하나만 고르라면 세 번째다. div 버튼을 진짜 버튼으로 바꾸는 것 하나만으로도 접근성 트리에서 사라졌던 컨트롤이 되살아나고, 키보드·음성·에이전트가 한꺼번에 그 버튼에 닿는다. 나머지는 그 위에 얹는 정밀 작업이다.

이 여섯 개는 대단한 기술이 아니다. 그런데 하나만 어긋나도 스크린 리더 사용자, 음성 제어 사용자, 그리고 이제 AI 에이전트까지 세 부류가 동시에 버튼 앞에서 멈춘다. AI 시대의 웹 개발이라고 해서 갑자기 새로운 걸 배워야 하는 게 아니다. 오래된 접근성 원칙이, 새로운 소비자 하나가 늘면서 더 중요해졌을 뿐이다.

구조화 데이터를 서버사이드로 확실히 내보내거나, 기존 사이트의 접근성 트리와 GEO/AIO 대응을 점검하고 싶다면 개인적으로 상담과 구현 의뢰를 받는다. 프로필의 문의 경로로 연락하면 된다. 화려한 리브랜딩보다, 버튼 하나가 세 부류의 사용자에게 제대로 읽히는지부터 같이 보는 편이다.
