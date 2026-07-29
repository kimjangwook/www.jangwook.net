---
title: 'div 그리드로 만든 표가 조용히 잃는 것: 접근성 트리와 텍스트 추출 동시 실측'
description: '같은 영업시간 표를 네 가지 마크업으로 만들어 axe-core와 추출기 다섯 벌에 통과시켰다. axe는 네 개 모두 위반 0건을 줬지만, HTML을 텍스트로 바꾸는 순간 7행이 통째로 사라지는 마크업이 셋이었다. role="table"이 못 구하는 층을 실측 로그로 정리했다.'
pubDate: '2026-07-29'
heroImage: '../../../assets/blog/table-markup-a11y-llm-extraction-2026/hero.png'
tags:
  - a11y
  - 시맨틱HTML
  - GEO
  - 웹접근성
  - 웹개발
faq:
  - question: 'div에 role="table"을 붙이면 시맨틱 table과 같은 건가요?'
    answer: '접근성 트리 관점에서는 헤더 셀이 노출되므로 상당 부분 대등해집니다. 하지만 HTML을 텍스트나 마크다운으로 바꾸는 추출 파이프라인은 ARIA role을 거의 보지 않습니다. 제 실측에서 role="table"을 붙인 div 그리드는 추출기 다섯 벌 중 어디에서도 행 단위 복원에 성공하지 못했고, 결과가 role이 전혀 없는 div 그리드와 동일했습니다.'
  - question: 'axe에서 위반 0건이면 표 마크업은 문제없는 건가요?'
    answer: '아닙니다. axe의 표 관련 규칙은 주로 구조적 모순(레이아웃 table 안의 th, 잘못된 headers 참조 등)을 잡습니다. "표여야 할 것이 표가 아님"은 규칙으로 판정할 수 없어 위반이 아닌 상태로 통과합니다. 제 실험에서 헤더 셀이 하나도 없는 table과 role 없는 div 그리드 모두 위반 0건을 받았습니다.'
  - question: 'HTML을 마크다운으로 바꾸면 표가 왜 깨지나요?'
    answer: '변환기 기본 설정이 표를 지원하지 않는 경우가 많기 때문입니다. turndown 7.2.4는 기본 규칙에 표가 없어 모든 셀을 세로 목록으로 펼쳐버립니다. GFM 플러그인을 붙이면 표로 변환되지만, 이때도 헤딩 행이 없는 table은 변환을 포기하고 원본 HTML을 그대로 뱉습니다.'
  - question: '이 결과가 GPTBot 같은 실제 AI 크롤러의 동작인가요?'
    answer: '아닙니다. 측정 대상은 turndown, html-to-text, Readability 같은 공개 라이브러리이고, 특정 AI 크롤러의 내부 파이프라인은 공개되어 있지 않습니다. 다만 HTML을 텍스트나 마크다운으로 환원하는 이 경로는 널리 쓰이는 공통 형태이므로, 참고값으로 읽는 것이 적절합니다.'
relatedPosts:
  - slug: axe-automated-a11y-coverage-gap-2026
    score: 0.72
    reason:
      ko: 그 글은 자동 검사가 초록불을 줘도 남는 장벽을 세었고, 이 글은 같은 초록불 뒤에서 마크업이 기계 판독까지 잃는 경우를 잰다. 둘 다 "위반 0건"의 의미를 좁히는 작업이다.
      ja: あちらは自動チェックが緑になっても残る障壁を数え、こちらは同じ緑の裏でマークアップが機械可読性まで失う場面を測る。どちらも「違反ゼロ」の意味を狭める作業だ。
      en: That post counts the barriers that survive a green automated audit; this one measures what the same green audit misses on the machine-readability side. Both narrow what "zero violations" is allowed to mean.
      zh: 那篇统计了自动检测亮绿灯后仍然存在的障碍，本文则测量同样的绿灯背后标记连机器可读性也一并丢失的情形。两篇都在收窄"零违规"的含义。
  - slug: localbusiness-structured-data-server-side-vs-js-2026
    score: 0.63
    reason:
      ko: LocalBusiness JSON-LD를 JS로 넣으면 원시 HTML에 0개로 잡히던 그 실험과 축이 같다. 화면에 보이는 것과 기계가 가져가는 것이 갈라지는 지점을 각각 구조화 데이터와 표 마크업에서 잰다.
      ja: LocalBusinessのJSON-LDをJSで注入すると生HTMLでは0件になる、あの実験と軸が同じだ。画面に見えるものと機械が持ち帰るものが分かれる地点を、構造化データと表マークアップでそれぞれ測っている。
      en: Same axis as the experiment where JS-injected LocalBusiness JSON-LD showed up as zero blocks in the raw HTML. Both measure the gap between what renders and what a machine actually carries away, one via structured data and one via table markup.
      zh: 与"用JS注入LocalBusiness JSON-LD后原始HTML里为0"那次实验是同一条轴。一个从结构化数据、一个从表格标记，测量的都是"屏幕所见"与"机器所取"的分岔点。
  - slug: json-ld-graph-entity-linking-2026
    score: 0.55
    reason:
      ko: 조각난 JSON-LD를 하나의 그래프로 잇는 문제와, 흩어진 셀을 행·열 관계로 복원하는 문제는 같은 질문의 두 형태다. 기계가 관계를 재구성할 수 있는가.
      ja: 断片化したJSON-LDを一つのグラフへつなぐ問題と、ばらけたセルを行と列の関係へ復元する問題は、同じ問いの二つの形だ。機械が関係を再構成できるか。
      en: "Stitching fragmented JSON-LD into one graph and rebuilding scattered cells into row-and-column relationships are two shapes of the same question: can a machine reconstruct the relationships you meant?"
      zh: 把碎片化的JSON-LD连成一张图，与把散落的单元格还原成行列关系，是同一个问题的两种形态：机器能否重建你想表达的关系。
---

추출기를 통과한 뒤의 문자열이 이렇게 나왔다.

```text
Monday11:00-15:0014:30Lunch only
TuesdayClosedn/aRegular holiday
```

영업 종료 시각과 라스트오더가 붙어 `15:0014:30`이 됐다. 원본 페이지에서는 테두리가 그어진 멀쩡한 표였다. 브라우저에서 보면 아무 문제가 없고, 접근성 감사도 위반 0건을 줬다. 그런데 같은 HTML을 텍스트로 환원한 순간 값들이 서로 들러붙었다.

이게 특정 라이브러리의 버그라고 생각했는데, 마크업을 바꿔가며 재보니 아니었다. 표를 어떤 요소로 짰느냐가 결과를 갈랐다. 그래서 동일한 데이터를 네 가지 마크업으로 만들어 접근성 도구와 추출기에 나란히 넣어봤다. 아래 숫자는 전부 그 샌드박스에서 나온 실제 출력이다.

## 표에는 독자가 셋 있다

표 마크업을 다룰 때 대개 눈에 보이는 독자만 생각한다. 화면으로 표를 보는 사람이다. 그런데 실제로는 셋이다.

첫째는 <strong>접근성 트리</strong>다. 브라우저는 DOM을 그대로 보조기술에 넘기지 않는다. 요소의 역할·이름·상태만 추린 별도의 트리를 만들어 스크린리더에 노출한다. 표에서 이 트리가 담아야 하는 핵심 정보는 셀의 값이 아니라 <strong>셀과 헤더의 연결</strong>이다. "14:30"이라는 값 하나만으로는 아무 의미가 없고, 그것이 월요일 행의 라스트오더 열이라는 사실이 붙어야 정보가 된다. W3C WAI의 표 튜토리얼은 이 점을 명시한다([Tables Tutorial](https://www.w3.org/WAI/tutorials/tables/)).

> Data tables are used to organize data with a logical relationship in grids. Accessible tables need HTML markup that indicates header cells and data cells and defines their relationship. Assistive technologies use this information to provide context to users.

같은 문서는 한 문장 더 붙인다. "Relying on visual cues alone is not sufficient to create an accessible table." 굵은 글씨와 회색 배경은 사람 눈에만 헤더다.

둘째는 <strong>검색 크롤러</strong>다. 이쪽은 HTML을 그대로 파싱하므로 상대적으로 관대하다.

셋째가 최근 몇 년 사이 무게가 커진 쪽이다. <strong>HTML을 텍스트나 마크다운으로 환원하는 추출 파이프라인</strong>. 페이지 원문을 요약하거나 인용하는 도구, RAG 인덱서, 각종 콘텐츠 수집기는 대체로 HTML을 통째로 다루지 않는다. 본문 영역을 뽑고, 태그를 걷어내고, 평문 또는 마크다운으로 만든 다음 그 텍스트를 쓴다. 이 환원 과정에서 무엇이 살아남고 무엇이 사라지는지는 순전히 마크업과 변환기 설정에 달려 있다. 앞서 W3C 문서가 지나가듯 적어둔 문장이 정확히 이 지점을 가리킨다. "Tables markup is often lost when converting from one format to another, though some programs may provide functionality to assist converting table markup."

핵심은 이 셋의 실패 조건이 서로 다르다는 것이다. 접근성 트리는 헤더 셀의 존재로 살고, 추출 파이프라인은 `<table>`이라는 요소 자체로 산다. 한쪽만 만족시키는 마크업이 존재한다는 뜻이다. 그게 이 실험의 출발점이었다.

## 같은 데이터, 네 벌의 마크업

7행 4열짜리 영업시간 표 하나를 만들었다. 열은 Day / Hours / Last order / Note, 행은 월요일부터 일요일까지다. 값은 네 벌 모두 문자 단위로 동일하고, 표를 감싼 문단과 CSS도 같다. 다른 것은 표를 구성한 요소뿐이다.

<strong>A. 시맨틱 표 완전판</strong>

```html
<table>
  <caption>Opening hours</caption>
  <thead><tr><th scope="col">Day</th><th scope="col">Hours</th>…</tr></thead>
  <tbody>
    <tr><th scope="row">Monday</th><td>11:00-15:00</td><td>14:30</td>…</tr>
  </tbody>
</table>
```

<strong>B. table이지만 헤더 셀이 없는 것</strong>. `<caption>`도 `<thead>`도 없고 모든 칸이 `<td>`다. 실무에서 가장 흔하게 마주치는 형태다. 관리자 화면에서 붙여넣거나 CMS 에디터가 뱉은 표가 대개 이렇다.

```html
<table>
  <tr><td>Day</td><td>Hours</td><td>Last order</td><td>Note</td></tr>
  <tr><td>Monday</td><td>11:00-15:00</td><td>14:30</td><td>Lunch only</td></tr>
</table>
```

<strong>C. div 그리드에 ARIA role을 붙인 것</strong>. CSS Grid로 칸을 그리고 `role="table"`, `role="row"`, `role="columnheader"`, `role="rowheader"`, `role="cell"`을 명시했다. 접근성을 신경 쓰는 디자인 시스템에서 자주 나오는 형태다.

<strong>D. div 그리드에 아무것도 없는 것</strong>. 시각적으로만 표다.

측정 도구는 Node 22.22.0 위에서 axe-core 4.12.1(jsdom 29.1.1), turndown 7.2.4, turndown-plugin-gfm, html-to-text 10.0.0, @mozilla/readability 0.6.0을 썼다.

판정 기준은 세 가지로 나눴다. 추출 결과 텍스트에서 <strong>한 줄이 요일 하나와 그 행의 값 넷을 원래 순서대로 담고 있는가</strong>(행 복원, 7행 만점). <strong>인접한 값이 구분자 없이 들러붙지 않았는가</strong>(셀 구분). <strong>열 이름 줄이 첫 데이터 값보다 앞에 나오는가</strong>(헤더 보존). 행 복원 판정에서 "요일이 정확히 하나"라는 조건을 넣은 이유는, 표 전체가 한 줄로 뭉개진 경우를 성공으로 세지 않기 위해서다.

## axe는 네 개 모두에 초록불을 줬다

먼저 접근성 자동 검사부터 돌렸다. 태그는 wcag2a, wcag2aa, wcag21a, wcag21aa, best-practice 전부를 켰다.

```text
A: headerCellsInDOM=11  violations=region(moderate)
B: headerCellsInDOM= 0  violations=region(moderate)
C: headerCellsInDOM=11  violations=region(moderate)
D: headerCellsInDOM= 0  violations=region(moderate)
```

`region`은 페이지 콘텐츠가 랜드마크 안에 없다는 best-practice 규칙이라 표와 무관하다. 표 관련 위반은 네 벌 모두 0건이다. 헤더 셀이 하나도 없는 B도, 아무 역할도 없는 div 그리드 D도 통과다.

이건 axe의 결함이 아니다. axe의 표 규칙은 구조적 모순을 잡도록 설계돼 있다. 레이아웃 목적의 표 안에 `<th>`가 있다든가, `headers` 속성이 존재하지 않는 id를 가리킨다든가 하는 경우다. "이 div 뭉치는 사실 표여야 한다"는 판정은 콘텐츠 의미를 알아야 가능하고, 규칙 엔진이 할 수 있는 일이 아니다. [자동 검사가 초록불을 준 뒤에도 남아 있던 장벽들을 따로 세어본 적이 있는데](/ko/blog/ko/axe-automated-a11y-coverage-gap-2026), 이번 경우도 같은 계열이다. 다만 이번엔 놓치는 대상이 사람의 사용성만이 아니었다.

한편 DOM에서 헤더 셀 개수를 직접 세면 갈린다. A와 C는 11개(열 헤더 4 + 행 헤더 7), B와 D는 0개다. 보조기술에 셀-헤더 관계를 넘길 수 있는 마크업은 A와 C뿐이라는 뜻이다. 여기까지만 보면 결론은 단순하다. ARIA role을 제대로 붙인 div 그리드는 시맨틱 표와 대등하다.

## 추출기 다섯 벌을 통과시키자 순위가 바뀌었다

같은 네 벌을 추출 파이프라인에 넣었다.

![axe-core와 추출기 다섯 벌의 실행 결과 로그. 네 가지 마크업에 대한 행 복원, 셀 구분, 헤더 보존 판정이 조건별로 나열돼 있다](../../../assets/blog/table-markup-a11y-llm-extraction-2026/run-log.png)

정리하면 이렇다. 숫자는 행 복원(7행 만점), D는 셀 구분, H는 헤더 보존이다.

| 추출기 | A 시맨틱 표 | B th 없는 표 | C div+ARIA | D div만 |
|---|---|---|---|---|
| turndown 7.2.4 기본 | 0/7 D+ H- | 0/7 D+ H- | 0/7 D+ H- | 0/7 D+ H- |
| turndown + GFM 플러그인 | <strong>7/7 D+ H+</strong> | 0/7 D+ H- | 0/7 D+ H- | 0/7 D+ H- |
| html-to-text 10 기본 | 0/7 D- H- | 0/7 D- H- | 0/7 D+ H- | 0/7 D+ H- |
| html-to-text + dataTable | <strong>7/7 D+ H+</strong> | <strong>7/7 D+ H+</strong> | 0/7 D+ H- | 0/7 D+ H- |
| Readability textContent | 7/7 D- H+ | 7/7 D- H+ | 7/7 D- H+ | 7/7 D- H+ |

여기서 세 가지가 뒤집힌다.

<strong>첫째, ARIA role은 이 층에서 아무것도 하지 않는다.</strong> C와 D의 결과가 모든 추출기에서 완전히 같다. `role="columnheader"`를 정직하게 붙여둔 마크업과 스타일만 입힌 div 뭉치가 텍스트로 환원되면 구별되지 않는다. 추출기들은 태그 이름을 보지 role 속성을 보지 않기 때문이다. 접근성 트리에서는 C가 A와 대등했는데, 이 층에서는 D와 같은 취급을 받는다.

<strong>둘째, 변환기 기본값이 시맨틱 표까지 망가뜨린다.</strong> turndown 기본 설정은 A조차 0/7이다. 표 규칙이 아예 없어 셀을 세로 목록으로 펼쳐버린다. 실제 출력은 이렇다.

```text
Opening hours
Day
Hours
Last order
Monday
11:00-15:00
```

행도 열도 사라지고 값만 줄줄이 남는다. GFM 플러그인을 붙이면 A는 온전한 마크다운 표로 나온다. 그런데 <strong>B는 플러그인을 붙여도 0/7이다.</strong> 출력을 열어보니 변환 자체를 포기하고 원본 HTML을 통째로 뱉어놨다.

```text
<table><tbody><tr><td>Day</td><td>Hours</td>…</tr>…</table>
```

GFM 마크다운 표 문법에는 헤딩 행이 필수다. `<th>`가 하나도 없는 표는 헤딩 행을 만들 수 없으니 변환기가 손을 뗀다. 그러니까 `<td>`만으로 짠 표는 브라우저에서 멀쩡하고 axe도 통과하지만, 가장 흔한 HTML→마크다운 경로에서 통째로 미변환 덩어리가 된다. 도입부의 `15:0014:30`도 같은 계열이다. html-to-text 기본 설정은 표를 블록으로만 처리해 셀 사이에 구분자를 넣지 않는다.

<strong>셋째, 설정 한 줄이 B를 되살린다.</strong> html-to-text에 `{ selector: 'table', format: 'dataTable' }`를 주면 A와 B 모두 7/7로 올라온다. 열 폭을 맞춘 고정폭 표로 렌더링되고, 헤더 행도 보존된다. 다만 이건 <strong>내가 추출 쪽을 통제할 수 있을 때만</strong> 쓸 수 있는 카드다. 내 페이지를 가져가는 남의 파이프라인 설정은 내 손에 없다.

## Readability의 7/7은 공백 덕분이었다

표에서 Readability 행만 유독 모든 마크업에서 7/7이다. 처음엔 본문 추출기가 구조를 더 잘 붙든다고 읽었는데, 아무래도 이상했다. `textContent`는 태그를 지우고 텍스트 노드를 이어 붙일 뿐이라 행 구분을 만들 수단이 없다.

그래서 조건을 하나 추가했다. 태그 사이의 줄바꿈과 들여쓰기만 제거한 같은 HTML을 다시 넣었다. 미니파이어나 pretty-print를 하지 않는 템플릿 엔진이 내보내는 형태다.

```text
=== 태그 사이 공백 제거 후 ===
Readability 0.6 textContent   0/7   0/7   0/7   0/7
```

네 벌 모두 0/7로 무너졌다. 나머지 네 추출기는 두 조건에서 숫자가 완전히 동일했다. 즉 Readability의 행 복원은 마크업이 만든 게 아니라 <strong>소스 파일의 줄바꿈이 우연히 만든 것</strong>이었다. HTML을 한 줄로 내보내는 순간 사라진다.

이 실험에서 개인적으로 가장 값이 나갔던 대목이 여기다. 처음 표를 봤을 때 나는 잘못된 결론으로 갈 뻔했다. 조건을 하나 더 만들지 않았으면 "textContent 기반 추출도 표를 지킨다"고 썼을 것이다. 실측값이 마크업 때문인지 부수 조건 때문인지는, 그 부수 조건을 흔들어봐야만 갈린다.

측정 코드 쪽에서도 하나 잡았다. 처음 판정 함수는 문자열을 대소문자 구분해서 찾았는데, html-to-text는 `<th>` 내용을 기본값으로 대문자화한다. 그래서 A가 실제로는 완벽하게 복원됐는데도 0/7로 찍혔다. 대소문자 무시로 고치고 나서야 위 표의 숫자가 나왔다. 측정 도구가 값을 변형한다는 사실 자체도 기억해둘 만하다. 고유명사가 섞인 헤더라면 그 변형이 그대로 다운스트림에 흘러간다.

## role="table"이 구해주지 못하는 층

정리하면 네 벌의 성적표는 이렇게 갈린다.

| 마크업 | 접근성 트리의 셀-헤더 관계 | 텍스트 추출 |
|---|---|---|
| A `<table>` + `<th scope>` | 있음 | 살아남음 |
| B `<table>` + `<td>`만 | 없음 | 대부분 깨짐 |
| C `<div role="table">` | 있음 | 전부 깨짐 |
| D `<div>`만 | 없음 | 전부 깨짐 |

둘 다 통과하는 것은 A 하나다. 그리고 이 표의 어느 칸도 자동 감사가 알려주지 않는다.

여기서 내가 내리는 실무 판단은 이렇다. <strong>데이터 그리드를 div로 짜고 ARIA로 의미를 복구하는 방식은, 접근성만 놓고 보면 성립하지만 기계 판독 전체로 보면 명백한 하향이다.</strong> ARIA는 접근성 트리라는 단일 소비자만 겨냥한 보정 장치다. 표 요소는 그 소비자를 포함해 더 넓은 범위에 동시에 작동한다. 같은 접근성 결과를 얻는 두 방법이 있을 때, 부수적으로 잃는 게 적은 쪽을 고르는 것은 어렵지 않은 선택이다.

이 판단은 W3C가 오래전부터 적어둔 원칙과 방향이 같다. [Using ARIA](https://www.w3.org/TR/using-aria/)의 첫 번째 규칙이다.

> If you can use a native HTML element or attribute with the semantics and behavior you require already built in, instead of re-purposing an element and adding an ARIA role, state or property to make it accessible, then do so.

이 규칙은 보통 접근성 근거로만 인용된다. 이번 측정은 근거를 하나 더한다. 네이티브 요소를 쓰면 접근성 외의 소비자들도 덤으로 따라온다. 반대로 ARIA로 의미를 흉내 내면 그 의미는 접근성 트리 밖으로 나가지 못한다.

같은 얘기를 다른 층에서도 한 적이 있다. [LocalBusiness JSON-LD를 JS로 주입했더니 원시 HTML에서는 0개로 잡혔던 실험](/ko/blog/ko/localbusiness-structured-data-server-side-vs-js-2026)이 그렇다. 브라우저에서 확인하면 멀쩡한데 기계가 가져가는 단계에서는 없는 것과 같았다. 표 마크업도 구조는 동일하다. 화면에서 확인한 결과와 기계가 가져간 결과가 다르다. 문자열에 붙는 메타데이터도 같은 자리에서 새어나간다. [언어와 방향 정보를 문자열과 함께 나르지 않으면 어디서 깨지는지](/ko/blog/ko/string-lang-dir-metadata-multilingual-web) 따로 재본 적이 있다.

## 이 실험이 말하지 않는 것

정직하게 선을 그어둔다.

측정 대상은 공개 라이브러리다. GPTBot이나 ClaudeBot 같은 실제 AI 크롤러가 내부에서 어떤 파이프라인을 쓰는지는 공개되지 않았고, 이 결과로 그 동작을 단정할 수 없다. HTML을 텍스트나 마크다운으로 환원하는 경로가 널리 쓰인다는 사실에 기대어 <strong>참고값</strong>으로 읽는 것이 정확하다. 공식 수치가 아니다.

표 마크업을 고쳤다고 검색 순위나 AI 인용이 오른다는 주장도 하지 않는다. 구조화 데이터 쪽에 대한 Google의 공식 입장이 이 문제의 성격을 잘 보여준다([구조화 데이터 일반 가이드라인](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)).

> Google does not guarantee that your structured data will show up in search results, even if your page is marked up correctly according to the Rich Results Test.

마크업은 가능성을 여는 것이지 결과를 보장하는 것이 아니다. 이번 작업의 성격도 같다. <strong>실패 모드 하나를 제거하는 일</strong>이지 성과를 사는 일이 아니다.

측정 환경도 브라우저가 아니라 jsdom이다. 실제 스크린리더로 표를 읽어본 것은 아니고, 헤더 셀이 접근성 트리에 노출되는지를 DOM 수준에서 셌다. axe-core는 axe-core의 규칙 집합일 뿐이라 다른 엔진은 다른 판정을 낼 수 있다.

## 정리: 표를 손보기 전에 확인할 여섯 가지

이번 실측에서 바로 코드로 옮길 수 있는 것만 남긴다.

1. <strong>데이터 그리드는 `<table>`로 짠다.</strong> `<div role="table">`은 접근성 트리 하나만 만족시키고 나머지 소비자를 전부 잃는다. 시각 디자인 제약 때문에 div를 쓰고 있다면, 요즘의 `display: grid`와 `display: contents` 조합으로 `<table>`을 그대로 두고도 대부분의 레이아웃이 가능하다.
2. <strong>`<th>`가 하나도 없는 `<table>`을 찾아낸다.</strong> 이번 실험의 B다. 가장 흔하고, axe도 조용하고, 마크다운 변환에서 통째로 깨진다. `grep`으로 한 번 훑을 가치가 있다.
3. <strong>`scope`와 `<caption>`을 붙인다.</strong> 열 헤더에 `scope="col"`, 행 헤더는 `<th scope="row">`. `<caption>`은 표가 무엇에 관한 것인지 텍스트로 남기며, 추출 결과에서도 그대로 살아남는다.
4. <strong>내가 돌리는 추출 파이프라인이 있다면 설정부터 본다.</strong> turndown은 GFM 플러그인 없이는 표를 펼쳐버리고, html-to-text는 `format: 'dataTable'` 없이는 셀을 들러붙게 만든다. 기본값이 안전할 것이라 가정하지 않는다.
5. <strong>textContent 기반 추출을 신뢰하지 않는다.</strong> 행이 살아 보인다면 소스의 줄바꿈 덕일 수 있다. 미니파이한 HTML로 한 번 더 돌려서 같은 결과가 나오는지 확인한다.
6. <strong>CI에 규칙 하나를 넣는다.</strong> "모든 `<table>`에 `<th>`가 최소 1개, `<caption>` 또는 `aria-label`이 존재"는 정적 검사로 판정 가능하다. 자동 접근성 검사가 잡아주지 않는 자리를 이 한 줄이 메운다.

표·폼·랜딩 마크업을 접근성과 기계 판독 양쪽 기준으로 감사하는 일을 실무로 다룬다. 운영 중인 사이트를 이 기준으로 한 번 훑어야 할 상황이라면 프로필 쪽 연락처로 이야기를 걸어도 좋다.
