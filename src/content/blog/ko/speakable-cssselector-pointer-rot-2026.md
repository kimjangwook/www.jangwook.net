---
title: '음성으로 읽을 문단을 13개나 지목하고 있었다: speakable 선택자 실측'
description: 'speakable의 cssSelector를 빌드 산출물에 직접 걸어 재봤다. 네 개 중 하나는 아무것도 가리키지 않았고, 리드 문단 하나를 노렸던 선택자는 페이지당 13개를 잡고 있었다. 값을 담는 마크업과 DOM을 가리키는 마크업은 썩는 방식이 다르다. 검증기는 0만 잡는다.'
pubDate: '2026-08-11'
heroImage: '../../../assets/blog/speakable-cssselector-pointer-rot-2026/hero.png'
tags:
  - 구조화데이터
  - SEO
  - JSON-LD
  - 웹개발
  - CSS
faq:
  - question: 'speakable은 지금도 Google이 지원하는 구조화 데이터인가요?'
    answer: 'Search Gallery 목록에는 지금도 올라 있습니다. 다만 문서 첫머리에 베타 표기가 붙어 있고, 대상은 영어로 발행하는 퍼블리셔와 영어로 설정된 미국 내 Google Home 사용자로 한정된다고 명시돼 있습니다. 목록에 있다는 것과 내 사이트가 그 대상이라는 것은 다른 이야기입니다.'
  - question: 'cssSelector가 아무것도 못 잡으면 어떤 오류가 나나요?'
    answer: 'schema.org의 Schema Markup Validator로 페이지를 검사하면 errorType이 NO_MATCHES_FOUND로 나오고 isSevere가 true입니다. 제 라이브 페이지에서 실제로 이 오류가 1건 잡혔습니다. 반대로 선택자가 너무 많이 잡는 경우는 오류가 아니므로 검증기 화면에서는 아무 신호도 나오지 않습니다.'
  - question: 'p:first-of-type을 쓰면 문서의 첫 문단이 선택되는 것 아닌가요?'
    answer: '아닙니다. :first-of-type은 같은 부모 아래 형제 중 그 타입의 첫 번째를 고릅니다. article 아래에 문단을 가진 부모가 여러 개 있으면 그 부모마다 하나씩 잡힙니다. 제 표본에서는 페이지당 중앙값 13개가 잡혔고, 그중 실제 본문 리드는 하나뿐이었습니다.'
  - question: '이런 문제를 빌드에서 자동으로 막을 수 있나요?'
    answer: '가능합니다. 빌드 산출물 HTML을 파싱해 speakable의 선택자를 실제로 실행하고, 매치가 0이면 실패, 문단 선택자가 상한을 넘으면 실패로 처리하면 됩니다. 스키마 문법 검증만으로는 잡히지 않는 항목이라 별도 단언이 필요합니다.'
relatedPosts:
  - slug: validate-structured-data-ci-jsonld-2026
    score: 0.86
    reason:
      ko: 그 글에서 만든 CI 검증은 JSON-LD의 문법과 필수 속성을 봤다. 이번에 걸린 것은 문법이 완벽한데 가리키는 대상이 없는 경우라, 같은 파이프라인에 어떤 단언을 더 붙여야 하는지가 이어진다.
      ja: あの記事で組んだCI検証はJSON-LDの構文と必須プロパティを見るものだった。今回引っかかったのは構文が完璧なのに指す先が無い場合で、同じパイプラインにどんな断言を足すかという話につながる。
      en: The CI check built in that post looks at JSON-LD syntax and required properties. What broke here was syntactically perfect but pointed at nothing, so it extends naturally into what else that pipeline should assert.
      zh: 那篇里搭的 CI 校验看的是 JSON-LD 的语法和必填属性。这次出问题的markup语法完全正确，只是指向了空处，正好接着讨论同一条流水线还该断言什么。
  - slug: text-fragment-citation-deep-link-audit-2026
    score: 0.81
    reason:
      ko: 텍스트 프래그먼트도 문서 안의 특정 지점을 문자열로 가리키는 주소였고, 코드 블록에서 15개 중 14개가 끊겼다. 가리키는 쪽과 가리켜지는 쪽이 따로 움직일 때 무엇이 먼저 깨지는지 두 글이 같은 답을 낸다.
      ja: テキストフラグメントも文書内の一点を文字列で指すアドレスで、コードブロックでは15本中14本が外れた。指す側と指される側が別々に動くとき何が先に壊れるか、二つの記事は同じ答えに行き着く。
      en: Text fragments are also addresses that point into a document by string, and 14 of 15 broke inside code blocks. Both posts land on the same lesson about what fails first when the pointer and its target evolve separately.
      zh: 文本片段同样是用字符串指向文档某处的地址，在代码块里 15 条断了 14 条。指向方与被指向方各自演进时先坏的是什么，两篇给出的答案一致。
  - slug: json-ld-graph-entity-linking-2026
    score: 0.74
    reason:
      ko: 이 사이트의 JSON-LD를 하나의 @graph로 묶은 것이 그 글의 처방이고, 이번에 문제가 된 WebPage 노드도 그때 조립한 그래프 안에 들어 있다. 그래프를 잘 짜도 노드 하나가 헛것을 가리킬 수 있다는 반례에 해당한다.
      ja: このサイトのJSON-LDを一つの@graphにまとめたのがあの記事の処方で、今回問題になったWebPageノードもそのとき組んだグラフの中にある。グラフを整えてもノード一つが空を指しうるという反例になる。
      en: That post is where this site's JSON-LD got assembled into a single @graph, and the WebPage node that failed here sits inside that same graph. It works as the counterexample, since a tidy graph can still contain one node aimed at nothing.
      zh: 那篇把本站的 JSON-LD 收拢成一个 @graph，这次出问题的 WebPage 节点就在当时组的那张图里。它正好是个反例：图理得再顺，也可能有一个节点指着空气。
  - slug: faqpage-deprecation-ai-citation-2026
    score: 0.7
    reason:
      ko: FAQ 리치 결과가 끝났을 때는 "지원이 끝나도 어휘는 살아 있다"가 결론이었다. 이번 speakable은 반대편 사례다. 지원 목록에는 남아 있는데 내 사이트가 대상 범위 밖이라, 남길지 지울지를 다른 기준으로 판단해야 했다.
      ja: FAQリッチリザルトが終わったときは「サポートが切れても語彙は生きている」が結論だった。今回のspeakableは逆側の事例だ。サポート一覧には残っているのに自サイトは対象範囲の外で、残すか消すかを別の基準で判断する必要があった。
      en: When the FAQ rich result ended, the conclusion was that the vocabulary survives the feature. speakable is the mirror image, still on the supported list, yet my site sits outside its stated audience, so keep-or-remove needed a different test.
      zh: FAQ 富媒体结果下线时，结论是"功能没了，词汇还在"。speakable 是反过来的例子：还留在支持清单上，我的站点却不在它声明的受众里，留还是删得换一把尺子来量。
---

라이브 페이지 하나를 schema.org 검증기에 넣었더니 이런 게 돌아왔다.

```json
{
  "errorType": "NO_MATCHES_FOUND",
  "args": [".article-summary"],
  "isSevere": true,
  "begin": 7260,
  "end": 7278
}
```

`.article-summary`. 이 사이트의 HTML 어디에도 없는 클래스명이다. 그런데 이 문자열은 블로그 페이지 1,332장 전부에 실려 나가고 있었다. 구조화 데이터 안에서, "이 페이지를 소리 내어 읽을 때 여기를 읽어라"는 지시로.

## 값을 담는 마크업과 DOM을 가리키는 마크업

구조화 데이터를 붙인다는 건 대개 값을 적어 넣는 일이다. `headline`에 제목 문자열을 적고, `datePublished`에 날짜를 적고, `author`에 이름을 적는다. 적은 값이 곧 전달되는 값이라 틀리면 눈에 보인다. 제목이 비면 빈 제목이 나가고, 날짜 형식이 어긋나면 검증기가 형식 오류를 낸다.

`speakable`은 그 방식이 아니다. schema.org의 `SpeakableSpecification`은 읽어야 할 텍스트를 직접 담지 않는다. 대신 `cssSelector`나 `xPath`로 <strong>문서 안의 위치를 가리킨다.</strong> 값은 문서 쪽에 있고, 마크업은 주소만 들고 있다. 음성 어시스턴트가 이 페이지를 읽어줄 때 어느 부분을 낭독할지 저자가 지정하라는 설계다.

주소를 들고 있는 마크업은 값을 들고 있는 마크업과 위험 구조가 다르다. 주소가 가리키는 곳이 사라져도 마크업 자체는 멀쩡하다. JSON 문법도 맞고, 스키마 타입도 맞고, 필수 속성도 다 있다. 클래스명 하나를 리팩터링한 그날부터 그 지시는 허공을 가리키기 시작하지만, 빌드는 초록불이고 테스트도 통과한다. 나는 이걸 <strong>포인터형 마크업</strong>이라 부르기로 했다. 구조화 데이터 중에서 이 성질을 가진 건 사실상 `speakable` 하나다.

포인터가 썩는 방향은 두 가지다. 아무것도 가리키지 않거나, 너무 많이 가리키거나. 내 사이트에서는 둘 다 일어나 있었다.

## Google 문서가 speakable에 걸어 둔 조건

먼저 공식 문서를 다시 읽었다. [speakable 구조화 데이터 문서](https://developers.google.com/search/docs/appearance/structured-data/speakable)는 첫머리부터 조건을 깔고 시작한다.

> This feature is in beta and subject to change. We're currently developing this feature and you may see changes in requirements or guidelines.

대상 범위는 더 좁다.

> The `speakable` property works for users in the U.S. that have Google Home devices set to English, and publishers that publish content in English.

영어로 발행하는 퍼블리셔, 영어로 설정된 미국 내 Google Home 사용자. 한국어·일본어·중국어 판을 같이 내는 1인 기술 블로그는 이 문장 어디에도 해당하지 않는다. 선택자 사용법에 대한 지시도 짧고 분명하다.

> Use either `cssSelector` or `xPath`; don't use both.

그리고 늘 그렇듯 보장은 없다.

> Google does not guarantee that features that consume structured data will show up in search results.

한편 [Search Gallery](https://developers.google.com/search/docs/appearance/structured-data/search-gallery)의 지원 타입 목록에는 Speakable이 지금도 올라 있다. 목록에 있다는 사실과 내 사이트가 그 기능의 대상이라는 사실은 별개다. 이 구분을 흐리면 "공식 지원 목록에 있으니 붙여두면 언젠가 이득"이라는 막연한 기대만 남는다. 참고로 Google은 최근 몇 년간 지원 타입을 늘리기보다 줄여 왔다. [문서 업데이트 로그](https://developers.google.com/search/updates)를 보면 2026-05-08에 FAQ 리치 결과에 지원 종료 공지가 붙었고("This feature will no longer appear in Google Search starting May 7, 2026."), 2026-06-15에 관련 문서가 삭제됐다. 연습문제(practice problem) 타입 문서도 2026-01-06에 사라졌다. 그때 나는 [FAQ 마크업은 지우지 말라는 결론](/ko/blog/ko/faqpage-deprecation-ai-citation-2026)을 냈는데, 그건 어휘가 값을 담고 있어서 다른 파서가 계속 읽을 수 있기 때문이었다. 포인터는 그 논리가 통하지 않는다. 가리키는 곳이 없으면 누가 읽어도 없는 것이다.

## 선택자 네 개를 빌드 산출물에 직접 걸어봤다

내 사이트가 내보내던 값은 이랬다.

```json
{
  "@type": "SpeakableSpecification",
  "cssSelector": [
    "article h1",
    "article h2",
    "article p:first-of-type",
    ".article-summary"
  ]
}
```

의도는 명백하다. 제목과 소제목, 그리고 리드 문단. 문제는 의도가 아니라 실행 결과다. 그래서 빌드된 HTML을 jsdom으로 열어 네 선택자를 실제로 실행했다. Node 22.22, jsdom 29.1.1, 2026-08-11 시점의 `dist`. 블로그 페이지 1,336장 중 1,332장이 `SpeakableSpecification`을 싣고 있었고, 그중 4개 언어에서 5장씩 뽑은 20장을 DOM으로 파싱했다.

| 선택자 | 페이지당 매치(중앙값) | 표본 20장 합계 | 판정 |
|---|---:|---:|---|
| `article h1` | 1 | 24 | 4장에서 h1이 2개 |
| `article h2` | 9 | 229 | 소제목 전부 |
| `article p:first-of-type` | 13 | 272 | 과다 지시 |
| `.article-summary` | 0 | 0 | 아무것도 없음 |

`.article-summary`가 0인 이유는 단순하다. 그런 클래스를 쓰는 컴포넌트가 없다. 언젠가 있었는지, 아니면 처음부터 계획만 있었는지는 커밋 로그로도 확정하지 못했다. 확실한 건 이 선택자가 1,332장에 실려 나가는 동안 한 번도 무언가를 가리킨 적이 없다는 것이다.

여기서 재미있는 함정이 하나 있다. 문자열 `article-summary`를 `dist` 전체에서 grep하면 1,332장 전부에서 걸린다. 그래서 "있네" 하고 넘어가기 쉽다. 실제로 열어보면 페이지당 딱 한 번 등장하고, 그 한 번은 JSON-LD 안의 선택자 값 자기 자신이다.

```
...akableSpecification","cssSelector":["article h1","article h2",
"article p:first-of-type",".article-summary"]},"url":"https://jangwo...
```

<strong>포인터가 자기 이름만으로 grep에 잡히는 상태.</strong> 문자열 검색으로는 이 부류의 썩음을 절대 못 잡는다. 선택자는 실행해봐야 안다.

![speakable cssSelector가 실제로 도달하는 노드 수 — 의도한 1개 대비 측정값](../../../assets/blog/speakable-cssselector-pointer-rot-2026/hero.png)

## p:first-of-type은 첫 문단이 아니다

0보다 흥미로운 건 13이었다. `article p:first-of-type`이 리드 문단 하나를 잡을 거라고 생각했는데 페이지당 중앙값 13개, 표본 20장에서 272개가 잡혔다.

원인은 CSS 선택자의 정의에 있다. `:first-of-type`은 "문서에서 처음 나오는 그 타입"이 아니라 <strong>"같은 부모 아래 형제들 중 그 타입의 첫 번째"</strong>다. `article` 안에 문단을 자식으로 갖는 부모가 여러 개 있으면, 그 부모마다 하나씩 매치된다. 후손 결합자 `article p`는 깊이를 가리지 않고 훑기 때문에, 결과적으로 문단을 가진 모든 컨테이너의 첫 문단이 전부 걸린다.

272개가 어디에 살고 있었는지 부모 요소로 분류해봤다.

![매치된 문단 272개의 부모 요소 분포 — 실제 본문 리드는 20개뿐](../../../assets/blog/speakable-cssselector-pointer-rot-2026/paragraph-owners.png)

| 부모 요소 | 매치된 문단 수 | 그게 실제로 무엇인가 |
|---|---:|---|
| `li` | 73 | 목록 항목 안의 문단 |
| `div.item-content` | 60 | 관련글 추천 카드 |
| `blockquote` | 59 | 인용 블록 |
| `header.article-shell__header` | 20 | 포스트 헤더 |
| `div.article-prose` | 20 | 본문 리드 문단 |
| `div.text-center` | 20 | 레이아웃 요소 |
| `div.flex-1` | 20 | 레이아웃 요소 |

내가 노린 건 `div.article-prose` 줄의 20개다. 272개 중 20개. 나머지 252개는 목록 항목이거나 인용문이거나 레이아웃 껍데기였다.

그중 `div.item-content` 60개가 특히 마음에 걸렸다. 관련글 추천 카드의 추천 사유 문구다. 즉 이 페이지를 소리 내어 읽는 기계가 있었다면, 저자가 "여기가 이 글의 핵심"이라고 표시해둔 곳에 본문 리드 한 문단과 함께 <strong>추천 카드 문구 세 개가 같은 자격으로 들어가 있었다.</strong> 자기 글의 요지 대신 사이트 내비게이션 문구를 낭독 후보로 올려둔 셈이다.

이 감각은 [텍스트 프래그먼트로 인용 딥링크를 재봤을 때](/ko/blog/ko/text-fragment-citation-deep-link-audit-2026)와 같다. 그때도 문서 안의 한 지점을 문자열로 가리키는 주소를 다뤘고, 가리키는 쪽과 가리켜지는 쪽이 따로 진화하면서 코드 블록에서 15개 중 14개가 끊겼다. 포인터는 만들 때가 아니라 <strong>주변이 바뀔 때</strong> 깨진다.

## 검증기가 잡은 것과 놓친 것

schema.org의 Schema Markup Validator는 `.article-summary`를 잡았다. `NO_MATCHES_FOUND`, `isSevere: true`. 라이브 URL을 넣어 검사했더니 객체 3개 중 오류 1건으로 정확히 이 한 줄을 지목했다. 검증기가 단순히 JSON 문법만 보는 게 아니라 <strong>선택자를 실제 문서에 실행해본다</strong>는 뜻이다. 이건 생각보다 강력한 기능이다.

그런데 13은 잡지 못했다. 당연하다. 선택자가 13개를 매치하는 건 오류가 아니다. `speakable`은 배열을 받고 여러 노드를 가리켜도 되는 속성이라, 스펙상 완벽하게 유효하다. 검증기 화면에는 초록불만 뜬다.

| 실패 유형 | 스키마 검증기 | 빌드 오류 | 문자열 grep | 필요한 것 |
|---|---|---|---|---|
| 선택자가 0개 매치 | 잡는다 (severe) | 못 잡는다 | 못 잡는다 | 배포 게이트 |
| 선택자가 과다 매치 | 못 잡는다 | 못 잡는다 | 못 잡는다 | 개수 상한 단언 |
| 대상 범위 밖 사용 | 못 잡는다 | 못 잡는다 | 못 잡는다 | 사람의 판단 |

세 번째 줄은 도구로 해결되지 않는다. 공식 문서가 미국·영어·Google Home이라고 못박아 둔 기능을 다국어 개인 블로그가 쓰는 것이 맞느냐는 질문에는 자동 검사가 답을 주지 않는다.

## 고친 선택자와 그것을 지키는 게이트

수정은 두 줄이다. 선택자를 네 개에서 두 개로 줄이고, 각각 하나만 잡도록 범위를 좁혔다.

```js
// src/components/BaseHead.astro
const speakableSchema = articleData ? {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  'speakable': {
    '@type': 'SpeakableSpecification',
    'cssSelector': ['.article-shell__header h1', '.article-prose > p:first-of-type']
  },
  'url': canonicalURL.toString()
} : null;
```

핵심은 후손 결합자를 자식 결합자로 바꾼 부분이다. `.article-prose > p:first-of-type`은 본문 컨테이너의 직계 자식 문단만 보므로, 목록 안이나 인용 블록 안의 문단은 애초에 후보에 오르지 않는다. 같은 표본 20장에서 재보니 두 선택자 모두 페이지당 정확히 1개였다.

| 선택자 | 매치된 페이지 | 페이지당 노드 수 |
|---|---:|---:|
| `.article-shell__header h1` | 20 / 20 | 1 |
| `.article-prose > p:first-of-type` | 20 / 20 | 1 |

그리고 이게 다시 썩지 않도록 postbuild에 단언을 하나 걸었다. 빌드 산출물을 열어 선택자를 실행하고, 0개면 실패, 문단 선택자가 상한을 넘으면 실패다.

```js
// scripts/validate-speakable.mjs (요지)
for (const selector of selectors) {
  const count = dom.window.document.querySelectorAll(selector).length;
  if (count === 0) {
    failures.push(`${file}: "${selector}" 가 아무것도 매치하지 않는다`);
  } else if (/\bp\b|paragraph/.test(selector) && count > MAX_PARAGRAPH_MATCHES) {
    failures.push(`${file}: "${selector}" 가 ${count}개를 매치한다`);
  }
}
```

이 게이트를 고치기 전의 `dist`에 돌려보면 표본 20장 × 선택자 2개 = 40건으로 정확히 실패한다.

```
❌ validate-speakable 실패 (40건)
  - dist/en/blog/en/45-day-analytics-report-2025-11/index.html:
      "article p:first-of-type" 가 24개를 매치한다 (허용 2)
  - dist/en/blog/en/45-day-analytics-report-2025-11/index.html:
      ".article-summary" 가 아무것도 매치하지 않는다
  ...
```

[JSON-LD를 CI에서 검증하는 파이프라인](/ko/blog/ko/validate-structured-data-ci-jsonld-2026)을 만들 때 나는 문법과 필수 속성을 봤다. 그 검사는 이번 건을 하나도 잡지 못했을 것이다. 문법은 완벽했으니까. 포인터형 속성에는 <strong>"해석 결과가 몇 개냐"</strong>는 질문을 따로 던져야 한다.

정직하게 덧붙일 것이 하나 있다. 이 수정으로 검색 노출이 좋아진다는 주장은 하지 않는다. 나는 미국의 영어 Google Home 사용자를 대상으로 하는 영어 뉴스 퍼블리셔가 아니고, Google은 구조화 데이터가 결과 노출을 보장하지 않는다고 문서에 적어 두었다. LLM 크롤러가 `speakable`을 읽는다는 근거도 나는 확인하지 못했고, 그래서 그렇게 쓰지 않는다. 내가 고친 것은 <strong>내 사이트가 기계에게 하는 진술의 정확성</strong>이다. 틀린 진술을 1,332장에 실어 보내는 것보다는, 맞는 진술 두 줄이 낫다. 표본은 20장이고 전수가 아니라는 점도 함께 적어둔다.

## 포인터를 쓰는 마크업을 내보내기 전에

- 구조화 데이터 안에 `cssSelector`나 `xPath`가 있는지 먼저 찾는다. 값이 아니라 주소를 담은 속성은 별도 관리 대상이다.
- 선택자는 grep이 아니라 실행으로 확인한다. 선택자 문자열은 자기 자신 때문에 항상 grep에 걸린다.
- `:first-of-type`, `:first-child`, 후손 결합자가 들어 있으면 매치 개수를 세어본다. 의도가 1개인데 두 자릿수가 나오면 결합자를 `>`로 좁힌다.
- 스키마 검증기는 0개 매치를 severe로 잡아주지만 과다 매치는 통과시킨다. 상한 단언은 직접 만들어야 한다.
- 클래스명을 리팩터링할 때 구조화 데이터를 같이 검색한다. CSS와 JSON-LD가 같은 클래스명에 의존하고 있다는 사실은 어느 린터도 알려주지 않는다.
- 붙이기 전에 공식 문서의 대상 범위를 확인한다. 베타 표기와 지역·언어 제한은 대개 문서 첫 문단에 있다.

아직 답을 못 낸 게 하나 남았다. 대상 범위 밖인 걸 알면서도 이 두 줄을 남겨둔 판단이 옳은지다. 지우면 관리할 것이 사라지고, 남기면 "이 페이지의 핵심은 제목과 첫 문단"이라는 기계 판독 가능한 진술이 하나 남는다. 지금은 게이트가 그 진술의 정확성을 지켜주니 남기는 쪽을 골랐지만, 반년 뒤에도 같은 답일지는 모르겠다.

구조화 데이터를 배포 게이트로 묶는 일은 내가 업으로 다루는 영역이다. 문의 경로는 프로필에 있다.
