---
title: 'LocalBusiness 구조화 데이터, JS로 넣어도 되지만 서버사이드가 더 확실한 이유'
description: '매장 검색 페이지의 LocalBusiness JSON-LD를 JS로 주입하면 원시 HTML엔 블록이 0개다. 서버사이드 출력과 직접 비교하고, Google 공식 견해와 순위 한계까지 정리했다.'
pubDate: '2026-07-01'
heroImage: '../../../assets/blog/localbusiness-structured-data-server-side-vs-js-2026/hero.png'
tags:
  - SEO
  - 구조화데이터
  - MEO
  - JSON-LD
  - 웹개발
relatedPosts:
  - slug: multilingual-llm-token-tax-experiment
    score: 0.58
    reason:
      ko: 이 블로그 전체를 실측 대상으로 삼아 가설을 숫자로 검증한 글이다. 렌더링 방식을 curl로 직접 확인한 이 글과 "내 사이트에서 직접 재본다"는 접근이 같다.
      ja: このブログ全体を実測対象にして仮説を数字で検証した記事だ。レンダリング方式をcurlで直接確かめた本記事と「自分のサイトで直接測る」というアプローチが同じだ。
      en: That post used this very blog as a testbed and verified a hypothesis with numbers. It shares this article's approach of measuring things directly on my own site instead of trusting claims.
      zh: 那篇文章把整个博客当作实测对象，用数字验证假设。与本文用curl直接确认渲染方式一样，都是"在自己的网站上亲自测量"的思路。
  - slug: effiflow-automation-analysis-part1
    score: 0.55
    reason:
      ko: 메타데이터를 기계가 읽기 좋게 구조화하는 것이 시스템 효율을 어떻게 바꾸는지 다룬 사례다. 페이지 정보를 크롤러에게 명시적으로 전달하는 구조화 데이터 설계와 문제의식이 겹친다.
      ja: メタデータを機械が読みやすく構造化することがシステム効率をどう変えるかを扱った事例だ。ページ情報をクローラーへ明示的に届ける構造化データ設計と問題意識が重なる。
      en: A case study on how structuring metadata for machines changes a system's efficiency. The mindset overlaps with structured-data design, where page information is made explicit for crawlers.
      zh: 一个讲"为机器结构化元数据"如何改变系统效率的案例。与本文把页面信息明确传达给爬虫的结构化数据设计思路相通。
  - slug: llm-token-cost-data-format-experiment
    score: 0.52
    reason:
      ko: 같은 정보라도 어떤 포맷으로 기계에 전달하느냐에 따라 비용이 달라진다는 것을 실측한 글이다. JSON-LD라는 포맷 선택이 크롤러 인식을 좌우하는 이 글의 주제와 맞닿아 있다.
      ja: 同じ情報でもどのフォーマットで機械に渡すかによってコストが変わることを実測した記事だ。JSON-LDというフォーマット選択がクローラーの認識を左右する本記事のテーマと接している。
      en: That experiment measured how the format you feed machines changes the cost of the same information. It connects to this article's theme, where the choice of JSON-LD determines what crawlers actually see.
      zh: 那篇文章实测了同样的信息用不同格式喂给机器时成本的差异。这与本文"JSON-LD格式选择决定爬虫认知"的主题相通。
faq:
  - question: 'JS로 넣은 구조화 데이터는 구글이 못 읽나요?'
    answer: '읽습니다. Google은 JavaScript로 DOM에 주입된 JSON-LD도 렌더링 후 처리한다고 공식 문서에 명시합니다. 다만 렌더링은 자원에 종속된 2차 처리라, 원시 HTML(1차 크롤)에는 그 블록이 존재하지 않습니다. 제가 같은 마크업을 두 방식으로 만들어 원시 HTML만 파싱했더니 서버사이드는 ld+json 블록 1개, JS 주입은 0개였습니다.'
  - question: '그럼 무조건 서버사이드가 정답인가요?'
    answer: '아닙니다. JS 주입도 틀린 방법이 아니고 Google이 지원합니다. 다만 매장명·주소·전화(NAP)처럼 정확성과 일관성이 신뢰의 근거가 되는 값이라면, 렌더링 성공에 매번 베팅하는 것보다 서버가 처음부터 내보내는 쪽이 더 방어적이고 예측 가능합니다. 자주 바뀌는 값에 대해 Google도 동적 마크업이 덜 빈번하고 덜 신뢰적일 수 있다고 언급합니다.'
  - question: '구조화 데이터를 넣으면 검색 순위가 오르나요?'
    answer: '오르지 않습니다. Google은 구조화 데이터가 리치 결과 표시의 "자격"을 줄 뿐 표시나 순위를 보장하지 않는다고 문서에서 분명히 합니다. 로컬 순위의 실제 동력은 구글 비즈니스 프로필(GBP) 운영·리뷰·카테고리 정확도이고, 사이트 마크업은 크롤러의 이해를 돕는 보조 장치입니다.'
  - question: '배포 후에는 무엇으로 확인하나요?'
    answer: 'Rich Results Test와 Search Console의 URL 검사 도구로 원시/렌더링 양쪽을 확인합니다. 특히 JS 주입 방식이면 "렌더링된 HTML"에 실제로 ld+json이 잡히는지 봐야 합니다. 그리고 마크업의 값이 화면에 보이는 내용, GBP 등록 정보와 어긋나지 않는지 대조합니다. 불일치는 도움이 되기는커녕 신뢰를 깎습니다.'
---

매장 검색 페이지를 만들 때 개발자가 가장 늦게, 가장 대충 처리하는 게 구조화 데이터다. 화면에 보이는 지도와 영업시간만 맞으면 끝난 것 같기 때문이다. 그런데 로컬 검색(구글 맵·로컬 팩)에서 내 매장이 제대로 잡히느냐는, 눈에 보이는 화면이 아니라 크롤러가 읽어가는 마크업에서 갈린다. 그리고 그 마크업을 자바스크립트로 나중에 그려 넣느냐, 서버가 처음부터 내보내느냐가 생각보다 큰 차이를 만든다.

먼저 오해 하나를 정리하자. "JS로 구조화 데이터를 넣으면 구글이 못 읽는다"는 말은 틀렸다.

## 구글 공식 입장: JS 구조화 데이터는 지원된다

구글은 명시적으로 지원한다고 밝히고 있다. 공식 문서의 표현을 그대로 옮기면:

> "Google can read JSON-LD data when it is dynamically injected into the page's contents, such as by JavaScript code or embedded widgets."
> — Google Search Central, *Intro to Structured Data*

즉 `document.createElement('script')`로 `application/ld+json` 블록을 나중에 붙여도 구글은 렌더링 후 DOM에서 그걸 읽는다. 여기까지만 보면 "그럼 JS로 넣어도 되네"가 맞다. 문제는 언제, 얼마나 확실하게 읽히느냐다.

## 직접 검증: 원시 HTML에 뭐가 남는가

크롤러는 페이지를 두 번 본다. 처음엔 원시 HTML을 그대로 가져가고(1차), 자원이 허락할 때 헤드리스 Chromium으로 JS를 실행해 다시 본다(2차). 그래서 1차 시점의 원시 HTML에 구조화 데이터가 이미 있는지가 실질적인 차이를 만든다.

같은 LocalBusiness 마크업을 두 방식으로 만들었다. 하나는 서버가 내보낸 정적 HTML, 하나는 JS가 런타임에 주입하는 방식이다.

```html
<!-- (A) 서버사이드: 원시 HTML에 그대로 존재 -->
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"LocalBusiness","name":"밝은눈 안경원 시부야점"}
</script>

<!-- (B) JS 주입: 원시 HTML엔 없고, 실행 후에만 생성 -->
<script>
  const ld = document.createElement('script');
  ld.type = 'application/ld+json';
  ld.textContent = JSON.stringify({ "@type": "LocalBusiness", name: "밝은눈 안경원 시부야점" });
  document.head.appendChild(ld);
</script>
```

JS를 실행하지 않은 원시 HTML에서 실제 `<script type="application/ld+json">` 블록만 파싱해봤다.

```
[A] 서버사이드: ld+json 블록 1개, @type=['LocalBusiness']
[B] JS 주입:    ld+json 블록 0개, @type=[]
```

서버사이드는 1차 크롤이 가져가는 원시 HTML에 이미 블록이 들어 있다. JS 주입 방식은 원시 HTML엔 블록이 0개다. 그 블록은 브라우저가 JS를 실행한 뒤에야 DOM에 생긴다. 크롤러 입장에선 2차 렌더링을 기다려야 비로소 존재하는 데이터다.

## 왜 이 차이가 로컬에서 특히 중요한가

구글도 동적 생성 마크업의 리스크를 인정한다. 상거래 맥락의 안내지만 원리는 같다.

> "dynamically-generated markup can make Shopping crawls less frequent and less reliable, which can be an issue for fast-changing content."
> — Google Search Central, *Generate Structured Data with JavaScript*

렌더링 큐는 항상 자원에 종속된다. 2차 렌더링이 지연되거나, JS 실행 중 외부 스크립트 로딩이 실패하면 그날 그 페이지의 JSON-LD는 아예 생성되지 않는다. 매장명·주소·전화(NAP)처럼 정확성과 일관성이 신뢰의 근거가 되는 데이터를, 매번 렌더링 성공에 베팅할 이유가 없다. 서버사이드 출력엔 그 종속성이 없다.

## 정직한 한계 — 구조화 데이터가 순위를 올려주지 않는다

여기서 반드시 짚어야 할 게 있다. 구조화 데이터를 서버사이드로 완벽히 내보내도 그 자체로 검색 순위가 오르지 않는다. 구글은 구조화 데이터가 리치 결과 표시의 자격을 줄 뿐 표시나 순위를 보장하지 않는다고 문서에서 분명히 한다. 로컬 순위의 실제 동력은 구글 비즈니스 프로필(GBP) 운영, 리뷰, 카테고리 정확도 쪽이다. 사이트 마크업은 그 효과를 보조할 뿐이다.

한 가지 더. 구조화 데이터는 화면에 보이는 내용을 충실히 반영해야 한다.

> "don't add structured data about information that is not visible to the user, even if the information is accurate."
> — Google Search Central

GBP에 등록된 주소와 페이지 마크업의 주소가 어긋나면, 도움이 되기는커녕 신뢰만 깎인다.

## 개발자가 오늘 할 수 있는 것

- 매장 NAP과 좌표, URL을 서버사이드(라우트/템플릿)에서 정적으로 출력한다. JS 주입에 의존하지 않는다.
- 그 값들을 GBP와 정확히 일치시킨다. 불일치·더미·미검증 값(가짜 SNS URL 등)은 넣지 않는다.
- 화면에 보이지 않는 정보는 마크업하지 않는다.
- 배포 후 Rich Results Test와 URL 검사 도구로 원시와 렌더링 양쪽을 확인한다. "JS로 넣었는데 되겠지"로 끝내지 않는다.
- 순위 효과를 약속하지 않는다. 마크업은 크롤러의 이해를 돕는 보조 장치라는 선을 지킨다.

정리하면, JS 구조화 데이터가 틀린 방법은 아니다. 다만 로컬 매장 정보처럼 확실성이 곧 신뢰인 데이터라면, 렌더링 큐에 운을 맡기는 대신 서버가 처음부터 내보내는 쪽이 더 방어적이고 예측 가능하다.

---

매장 검색 페이지의 구조화 데이터를 서버사이드로 확실히 내보내거나, 기존 사이트의 로컬 SEO·마크업 구조를 점검하고 싶다면 개인적으로 상담·구현 의뢰를 받고 있다. jangwook.net 프로필의 연락처로 편하게 문의하면 된다.
