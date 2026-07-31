---
title: 'JSON-LD vs Microdata vs RDFa — 구조화 데이터 문법, 무엇을 언제 쓸까 (실측 비교)'
description: '같은 Product 엔티티를 세 문법으로 각각 짜서 파서에 넣고 바이트 수와 취약성을 실측했다. Google은 셋 다 동등하게 취급한다. 그렇다면 JSON-LD를 권하는 진짜 이유는 순위가 아니라 재설계에서 살아남는 결합도였다. 공식 문서와 재현 로그로 정리한 실전 선택 기준.'
pubDate: '2026-07-11'
heroImage: '../../../assets/blog/structured-data-syntax-comparison-jsonld-microdata-rdfa-2026/hero.png'
tags:
  - 구조화데이터
  - JSON-LD
  - SEO
  - 웹개발
relatedPosts:
  - slug: localbusiness-structured-data-server-side-vs-js-2026
    score: 0.74
    reason:
      ko: 이 글이 "어떤 문법으로 쓸까"라면, 그 글은 "그 마크업을 크롤러가 실제로 보긴 하는가(SSR vs JS)"다. 문법을 정했다면 다음은 그게 서버에서 확실히 나가는지다.
      ja: この記事が「どの構文で書くか」なら、あちらは「そのマークアップをクローラーが実際に見るのか(SSR vs JS)」だ。構文を決めたら次はそれが確実にサーバーから出るかだ。
      en: This post picks the syntax; that one asks whether the crawler even sees the markup you wrote (SSR vs JS). Once you've chosen JSON-LD, the next question is getting it out server-side.
      zh: 这篇选的是"用哪种语法写"，那篇问的是"爬虫到底看不看得到你写的标记(SSR vs JS)"。语法定了，下一步就是让它从服务端确实输出。
  - slug: json-ld-graph-entity-linking-2026
    score: 0.7
    reason:
      ko: 문법으로 JSON-LD를 골랐다면, 그 다음 과제는 흩어진 JSON-LD 블록을 @graph 하나로 잇는 것이다. 그 글이 바로 그 연결성을 jsonld로 실측한다.
      ja: 構文でJSON-LDを選んだなら、次の課題は散らばったJSON-LDブロックを@graph一つに繋ぐことだ。あちらはその連結性をjsonldで実測する。
      en: If you chose JSON-LD as the syntax, the next task is wiring the scattered blocks into a single @graph. That post measures exactly that connectivity with jsonld.
      zh: 语法上选了 JSON-LD，下一课题就是把散落的 JSON-LD 块连成一个 @graph。那篇正是用 jsonld 实测这种连通性。
  - slug: ai-crawlers-dont-render-javascript-csr-2026
    score: 0.58
    reason:
      ko: 구조화 데이터를 JS로 심으면 AI 크롤러는 못 본다. 문법 못지않게 그게 raw HTML에 실려 나가는지가 관건이라는 걸 그 글이 샌드박스로 보여준다.
      ja: 構造化データをJSで差し込むとAIクローラーは見ない。構文と同じくらい、それがraw HTMLに載って出るかが要だと、あちらはサンドボックスで示す。
      en: Inject structured data via JS and AI crawlers miss it. That post shows in a sandbox why shipping it in the raw HTML matters as much as the syntax you chose.
      zh: 用 JS 注入结构化数据，AI 爬虫看不到。那篇用沙箱证明：它能否随 raw HTML 输出，和你选哪种语法一样关键。
---

코드 리뷰에서 이 논쟁을 몇 번이나 봤다. 한쪽은 "마크업은 눈에 보이는 HTML에 붙어 있어야 진짜다"라며 Microdata를 밀고, 다른 쪽은 "그냥 `<script>` 블록 하나 던지자"며 JSON-LD를 민다. 그리고 대개 결론 없이 "일단 되니까 아무거나"로 끝난다.

그 "아무거나"가 6개월 뒤에 조용히 값을 치른다. 오늘은 같은 상품 하나를 세 가지 문법으로 직접 짜서 파서에 넣어봤다. 바이트 수를 쟀고, 재설계가 일어났을 때 무엇이 살아남고 무엇이 소리 없이 깨지는지도 재현했다. 아래 로그는 전부 그 샌드박스에서 나온 실제 출력이다. 결론부터 말하면, 이건 SEO 성능 문제가 아니라 <strong>결합도</strong> 문제였다.

## 구조화 데이터가 뭐고, 왜 문법이 세 개나 있나

먼저 토대부터. 구조화 데이터는 검색엔진과 AI 크롤러가 페이지의 의미를 기계적으로 읽을 수 있게 붙이는 표준 꼬리표다. "이 텍스트는 상품 이름", "이건 가격", "이건 평점"이라고 명시하면, 크롤러는 추측 대신 확정으로 이해한다. 어휘(vocabulary)는 [schema.org](https://schema.org)가 제공한다. `Product`, `Offer`, `AggregateRating` 같은 타입과 속성이 거기서 나온다.

여기서 헷갈리는 지점. schema.org는 "무엇을 말할지"(어휘)를 정의하고, 그걸 HTML에 "어떻게 적을지"(문법, syntax)는 별개다. 같은 어휘를 세 가지 문법으로 적을 수 있다.

- **JSON-LD**: 페이지 어딘가에 `<script type="application/ld+json">` 블록을 넣고, 그 안에 JSON으로 엔티티를 통째로 기술한다. 화면에는 안 보인다.
- **Microdata**: 보이는 HTML 태그에 `itemscope`, `itemtype`, `itemprop` 속성을 직접 얹어 마크업한다.
- **RDFa**: 역시 보이는 HTML에 `vocab`, `typeof`, `property` 속성을 얹는다. RDFa는 원래 schema.org 전용이 아니라 임의의 어휘를 다루는 범용 표준이다.

[Google 공식 문서](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data)는 이 셋을 모두 지원한다고 명시하고, 그중 JSON-LD를 권장한다. 그런데 같은 문서가 이렇게도 말한다. "세 형식 모두 올바르게 구현되면 Google에는 동등하게 문제없다(equally fine)." 이 두 문장을 같이 읽는 게 중요하다. 권장은 하지만, 셋 중 무엇을 써도 검색 결과에서 손해 보지 않는다는 뜻이다. 그러면 권장의 근거는 순위가 아니라 다른 데 있다는 얘기가 된다.

## 같은 상품을 세 번 짰다

추상론으로 끝내기 싫어서 샌드박스를 만들었다. Node v22, 파서는 실제 크롤러들이 쓰는 계열의 오픈소스(`web-auto-extractor`, `microdata-node`, `jsonld`)다. 대상은 흔한 상품 하나. 이름, 브랜드, 가격/통화/재고, 평점/리뷰 수를 담았다.

JSON-LD는 이렇게 생겼다.

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Aeropress Go",
  "brand": {"@type": "Brand", "name": "Aeropress"},
  "offers": {"@type": "Offer", "price": "39.95", "priceCurrency": "USD",
             "availability": "https://schema.org/InStock"},
  "aggregateRating": {"@type": "AggregateRating", "ratingValue": "4.8",
                      "reviewCount": "1027"}
}
</script>
```

같은 내용을 Microdata로 옮기면 속성이 보이는 태그마다 흩어진다.

```html
<div itemscope itemtype="https://schema.org/Product">
  <h1 itemprop="name">Aeropress Go</h1>
  <span itemprop="brand" itemscope itemtype="https://schema.org/Brand">
    <span itemprop="name">Aeropress</span>
  </span>
  <div itemprop="offers" itemscope itemtype="https://schema.org/Offer">
    <span itemprop="price">39.95</span>
    <meta itemprop="priceCurrency" content="USD">
    <link itemprop="availability" href="https://schema.org/InStock">
  </div>
  <div itemprop="aggregateRating" itemscope itemtype="https://schema.org/AggregateRating">
    <span itemprop="ratingValue">4.8</span>
    <span itemprop="reviewCount">1027</span>
  </div>
</div>
```

RDFa도 구조는 비슷하다. `itemprop` 대신 `property`, `itemtype` 대신 `typeof`를 쓴다. 세 파일을 파서에 넣고 정규화했더니, 세 결과가 완전히 동일한 엔티티로 나왔다. name, brand, offers, aggregateRating이 하나도 빠짐없이 같은 형태로 복원됐다. 여기까지는 예상대로다. 문법이 뭐든 의미는 같으니까.

## 바이트 수가 처음으로 갈라진 지점

파싱 결과는 같아도, 마크업 자체의 무게는 달랐다. 동일한 Product 엔티티를 표현하는 데 든 바이트 수다.

![세 문법의 마크업 바이트 수 비교 — JSON-LD 477B, RDFa 594B, Microdata 698B](../../../assets/blog/structured-data-syntax-comparison-jsonld-microdata-rdfa-2026/bytes-comparison.png)

| 문법 | 바이트 수 | Google 입장 | 사는 위치 |
|------|---------|-----------|---------|
| JSON-LD | 477 B | 권장 | 별도 `<script>` 블록 |
| RDFa | 594 B | 지원 | 보이는 HTML에 인라인 |
| Microdata | 698 B | 지원 | 보이는 HTML에 인라인 |

Microdata가 JSON-LD보다 약 46% 무거웠다. 이유는 단순하다. 인라인 문법은 값 하나하나를 감싸는 태그와 반복되는 `itemscope`/`itemtype` 선언이 필요하다. 가격을 보이지 않게 넣으려고 `<meta>`, `<link>` 같은 우회 태그까지 동원해야 한다.

솔직히 이 숫자 자체는 결정타가 아니다. 200바이트 차이로 성능이 바뀌진 않는다. 하지만 이 수치는 더 중요한 사실의 증상이다. 인라인 문법은 의미를 표현하려고 DOM 구조에 얹혀 있다는 것. 그 얹혀 있음이 다음 실험에서 진짜 대가를 드러낸다.

## 재설계 한 번에 평점이 사라졌다

실무에서 마크업이 깨지는 방식은 문법 오류가 아니다. 재설계다. 디자이너가 평점 위젯을 상품 본문에서 사이드바로 옮긴다. 화면상으로는 아무 문제 없다. 별점은 여전히 잘 보인다. 그런데 Microdata에서는 그 순간 `aggregateRating`이 Product의 자식이 아니게 된다. `itemprop`은 DOM 중첩 구조로 소속을 판단하기 때문이다.

재현해봤다. 평점 블록을 `<aside>`로 옮긴 "재설계 후" HTML을 다시 파싱했다.

```text
Product after redesign has aggregateRating? -> false
Keys: @context, @type, name, brand, offers
```

Product에서 평점이 통째로 떨어져 나갔다. `name`, `brand`, `offers`만 남았다. 검색 결과의 별점 리치 결과가 조용히 사라지는 시나리오다. 아무도 문법을 틀리지 않았다. `itemprop="aggregateRating"`은 여전히 페이지 어딘가에 멀쩡히 있다. 그저 부모를 잃었을 뿐이다. 그리고 이런 건 빌드가 깨지지 않으니 리뷰에서도 안 잡힌다.

JSON-LD였다면? 평점 위젯을 사이드바로 옮기든 푸터로 보내든, `<script>` 블록은 그대로다. 의미가 DOM 위치와 분리돼 있으니 재설계가 건드릴 수 없다. 이게 Google이 JSON-LD를 권장하는 진짜 이유다. 순위가 아니라 "유지보수가 쉽다"는 것. 공식 문서의 표현 그대로 "구현하고 유지보수하기 가장 쉽다". 나는 이 문장이 실무에서 무슨 뜻인지 오늘 눈으로 확인했다. 재설계에서 살아남는다는 뜻이다. 이 결합도 문제는 [구조화 데이터를 서버사이드로 확실히 내보내는 문제](/ko/blog/ko/localbusiness-structured-data-server-side-vs-js-2026/)와도 이어진다. 문법을 결정했으면, 그게 크롤러에게 실제로 도달하는지가 다음 관문이다.

## 그래도 유효한 마크업이라고 리치 결과가 보장되진 않는다

여기서 반드시 짚어야 할 한계. 문법을 잘 골라도, 마크업이 완벽하게 유효해도, 리치 결과나 순위 상승은 보장되지 않는다. 이건 내 의견이 아니라 [Google 구조화 데이터 정책 문서](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)의 공식 입장이다. 유효한 구조화 데이터는 리치 결과에 "자격을 줄 뿐(eligible)", 표시를 확정하지 않는다. Google은 품질, 페이지 상태, 여러 신호를 함께 본다.

그래서 JSON-LD를 골랐다고 별점이 뜨는 게 아니다. 문법 선택은 "리치 결과가 뜰 확률을 높이는" 일이 아니라, "일단 뜬 리치 결과가 재설계에도 안 깨지게 지키는" 일에 가깝다. 이 구분을 흐리면 안 된다. 나는 문법 선택을 SEO 성능 최적화로 파는 글들이 이 지점에서 정직하지 못하다고 본다.

JSON-LD가 의미적으로도 멀쩡한지도 확인했다. `jsonld` 라이브러리로 RDF로 확장하니 14개의 트리플이 나왔다. 문법당 파싱만 되는 게 아니라, 표준 RDF 그래프로 온전히 풀린다는 뜻이다.

```text
JSON-LD expands to 14 RDF triples
_:b0 <http://schema.org/aggregateRating> _:b1 .
_:b0 <http://schema.org/brand> _:b2 .
_:b0 <http://schema.org/name> "Aeropress Go" .
_:b0 <http://schema.org/offers> _:b3 .
```

## JSON-LD의 유일한 약점, 그리고 그게 함정인 이유

JSON-LD를 미는 글에서 잘 안 짚는 약점이 하나 있다. 눈에 안 보인다는 점이다. `<script>` 블록은 화면과 분리돼 있으니, 개발자가 JSON-LD의 값과 실제 페이지에 보이는 값을 따로 관리하게 된다. 가격을 39.95로 표시하면서 JSON-LD에는 갱신 전 가격 34.95가 남아 있는 사고가 여기서 나온다. Microdata는 애초에 보이는 텍스트를 마크업하니 이런 어긋남이 구조적으로 덜 생긴다.

문제는 이게 실제로 Google 정책 위반이라는 것이다. 구조화 데이터는 사용자에게 보이는 콘텐츠와 일치해야 한다. 보이지 않는 정보를 마크업하거나 화면 값과 다른 값을 넣으면, 리치 결과 자격을 잃거나 수동 조치를 받을 수 있다. 그러니 JSON-LD의 "분리"는 양날이다. 재설계에는 강하지만, 값의 진실성을 사람이 따로 보증해야 한다.

내 대응은 단순하다. JSON-LD를 손으로 쓰지 않는다. 페이지를 렌더링하는 바로 그 데이터 소스에서 JSON-LD를 함께 생성한다. 가격을 그리는 변수와 JSON-LD의 `price`가 같은 변수를 참조하면, 애초에 어긋날 수가 없다. 이게 서버사이드 생성이 단순한 편의가 아니라 정합성 장치인 이유다. 손으로 관리하는 JSON-LD는 Microdata의 취약성을 다른 형태로 되사오는 것과 같다.

## 그럼 언제 무엇을 쓰나 (결정 기준)

세 문법이 Google에 동등하다면, 선택은 검색 성능이 아니라 엔지니어링 기준으로 내려야 한다. 내가 쓰는 결정 기준은 이렇다.

- **기본은 JSON-LD.** 99%의 경우 정답이다. 서버에서 객체 하나로 생성하고, 페이지당 블록 하나로 관리하고, 단위 테스트로 검증할 수 있다. DOM과 분리돼 있어 재설계에 강하다.
- **Microdata/RDFa는 `<script>`를 못 넣을 때만.** 잠긴 CMS, 템플릿 편집 권한이 제한된 환경, 스크립트 삽입이 막힌 이메일 HTML 같은 경우다. 이때는 보이는 태그에 얹는 인라인 문법이 유일한 선택지다.
- **RDFa는 schema.org 밖의 어휘까지 섞어야 할 때.** 순수 schema.org만 쓸 거면 RDFa의 범용성은 실익이 없다. 정부·도서관 데이터처럼 여러 어휘를 RDF로 상호운용해야 하는 특수 상황에서만 값을 한다.

피해야 할 것도 명확하다. **같은 페이지에서 같은 엔티티를 두 문법으로 중복 마크업하지 마라.** JSON-LD로 Product를 쓰면서 같은 걸 Microdata로도 얹으면, 크롤러가 중복이나 충돌로 읽을 수 있다. 하나만 골라 일관되게 간다.

그리고 어떤 문법이든 **CI에서 검증하라.** 나는 빌드 단계에서 JSON-LD를 RDF로 확장해 트리플 수와 연결 컴포넌트를 확인한다. 오늘 실험에서 본 것처럼, 마크업은 문법 오류 없이도 조용히 의미가 빠질 수 있다. 사람 눈으로는 안 잡힌다. 이 "흩어진 조각을 하나로 잇고 검증하는" 이야기는 [JSON-LD를 @graph로 묶는 글](/ko/blog/ko/json-ld-graph-entity-linking-2026/)에서 더 깊이 다뤘다. 그리고 애초에 이 마크업이 [AI 크롤러가 실행하지 않는 JS에 묻혀 있지는 않은지](/ko/blog/ko/ai-crawlers-dont-render-javascript-csr-2026/)도 함께 점검할 문제다.

## 실무에서 자주 나오는 질문

**이미 Microdata로 사이트를 다 짰다. 지금 JSON-LD로 바꿔야 하나?** 급하지 않다. 잘 동작하고 재설계 계획이 없다면 그대로 둬도 Google은 문제 삼지 않는다. 다만 다음 대규모 템플릿 개편 때 JSON-LD로 옮기는 걸 로드맵에 넣어두면 된다. 개편은 어차피 인라인 마크업이 깨지기 가장 쉬운 순간이니, 그때가 전환 적기다.

**둘을 섞으면 왜 안 되나? 백업처럼 안전하지 않나?** 안전하지 않다. 같은 엔티티를 두 문법으로 쓰면 값이 서로 어긋날 때 크롤러가 어느 쪽을 믿을지 모른다. 백업이 아니라 충돌 지점을 하나 더 만드는 것이다. 문법은 엔티티당 하나로 통일한다.

**검증은 Rich Results Test만 돌리면 되나?** 그것도 필요하지만, 온라인 도구는 한 페이지씩 수동으로 도는 거라 회귀를 못 잡는다. 나는 빌드 파이프라인에서 JSON-LD를 파싱·확장해 필수 속성 존재와 연결성을 자동 확인한다. 오늘 재현한 "재설계로 평점이 소리 없이 빠지는" 사고는 이런 CI 게이트가 있어야 다음 배포 전에 잡힌다.

## 내가 오늘 확인한 결론

문법 논쟁은 처음부터 잘못된 질문이었다. "어느 게 SEO에 유리한가"를 물으면 답이 없다. Google이 셋을 동등하게 취급하니까. 옳은 질문은 "어느 게 우리 코드베이스에서 6개월 뒤에도 안 깨지는가"다. 그 질문에는 답이 명확하다. 의미를 DOM에서 떼어내 별도 블록으로 관리하는 JSON-LD다.

측정으로 요약하면 이렇다. 세 문법은 파싱 결과가 같지만(동일 엔티티 복원), 바이트는 JSON-LD가 가장 가볍고(477 대 594 대 698), 재설계 취약성에서 인라인 문법은 소리 없이 데이터를 잃는다(평점 탈락 재현). Google 공식은 셋을 동등하게 보되 유지보수를 이유로 JSON-LD를 권한다. 유효한 마크업도 리치 결과를 보장하지 않는다는 한계는 그대로다.

구조화 데이터를 서버사이드로 확실히 내보내거나, 재설계에도 안 깨지도록 기존 사이트의 마크업 구조와 검증 파이프라인을 점검하고 싶다면, 개인적으로 상담과 구현 의뢰를 받고 있다. 프로필의 문의 경로로 편하게 연락 주면 된다.
