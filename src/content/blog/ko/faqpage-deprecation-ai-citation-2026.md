---
title: 'FAQPage 리치 결과는 끝났다. 그런데 Q&A 마크업은 지우지 마라'
description: Google이 2026년 5월 7일 FAQ 리치 결과를 완전히 종료했다. 오프라인 검증기로 FAQPage JSON-LD를 실측하면 스키마는 통과하지만 리치 결과는 DEPRECATED다. 검증 통과와 노출이 갈라진 지금 코드와 콘텐츠를 어떻게 바꿀지 공식 문서로 정리했다.
pubDate: '2026-07-25'
heroImage: ../../../assets/blog/faqpage-deprecation-ai-citation-2026/hero.png
tags:
  - SEO
  - 구조화데이터
  - JSON-LD
  - GEO
  - AIO
relatedPosts:
  - slug: restaurant-jsonld-opening-hours-validation-2026
    score: 0.72
    reason:
      ko: 저 글은 Restaurant JSON-LD가 검증기를 통과해도 값이 엉터리일 수 있다는 걸 쟀고, 이 글은 검증을 통과해도 리치 결과가 안 나오는 경우를 다룬다. "통과 ≠ 목적 달성"이라는 같은 함정의 두 얼굴이다.
      ja: あちらはRestaurant JSON-LDが検証を通っても値が出鱈目でありうると測った記事、本記事は検証を通ってもリッチリザルトが出ない場合を扱う。「通過≠目的達成」という同じ罠の裏表だ。
      en: That post measured how Restaurant JSON-LD can pass validation while holding garbage values; this one covers markup that passes validation yet produces no rich result. Two faces of the same "valid ≠ done" trap.
      zh: 那篇测的是Restaurant JSON-LD即便通过校验、值也可能是错的；本文讲的是通过校验却拿不到富媒体结果。同一个"通过≠达标"陷阱的两面。
  - slug: validate-structured-data-ci-jsonld-2026
    score: 0.68
    reason:
      ko: CI에서 JSON-LD를 자동 검증하는 파이프라인을 만들었다면, 그 게이트가 "스키마 유효성"만 보고 "실제 노출 가치"는 못 본다는 이 글의 지적이 바로 다음 질문이다.
      ja: CIでJSON-LDを自動検証するパイプラインを組んだなら、そのゲートが「スキーマ有効性」だけ見て「実際の露出価値」を見ないという本記事の指摘が次の問いになる。
      en: If you built a CI pipeline that auto-validates JSON-LD, this post's point — that the gate checks schema validity but not real-world value — is your next question.
      zh: 如果你已经搭好CI里自动校验JSON-LD的流水线，那么本文的提醒——门禁只看"schema有效性"却看不到"实际曝光价值"——正是下一个问题。
  - slug: robots-snippet-controls-ai-overviews-2026
    score: 0.6
    reason:
      ko: 리치 결과가 사라진 자리를 AI Overviews가 채우는 흐름이라면, 스니펫과 AI 노출을 robots 지시로 통제하는 저 글이 이 글의 GEO 파트와 짝을 이룬다.
      ja: リッチリザルトが消えた場所をAI Overviewsが埋める流れなら、スニペットとAI露出をrobots指示で制御するあの記事が本記事のGEOパートと対になる。
      en: If AI Overviews are filling the space rich results left behind, that post on controlling snippets and AI exposure via robots directives pairs with this article's GEO section.
      zh: 如果AI Overviews正在填补富媒体结果退场后的空位，那篇用robots指令控制摘要与AI曝光的文章，正好与本文的GEO部分配套。
  - slug: structured-data-syntax-comparison-jsonld-microdata-rdfa-2026
    score: 0.55
    reason:
      ko: FAQPage를 어떤 문법으로 넣든(JSON-LD/Microdata) 리치 결과 종료는 동일하게 적용된다. 문법 선택을 다룬 저 글과 함께 읽으면 "어떻게 넣나"와 "넣어서 뭐가 남나"가 이어진다.
      ja: FAQPageをどの構文で入れても(JSON-LD/Microdata)リッチリザルト終了は同じく適用される。構文選択を扱ったあの記事と併読すると「どう入れるか」と「入れて何が残るか」が繋がる。
      en: Whatever syntax you use for FAQPage (JSON-LD or Microdata), the rich-result shutdown applies equally. Read alongside that syntax-comparison post to connect "how to mark up" with "what's left after you do."
      zh: 无论用哪种语法写FAQPage（JSON-LD还是Microdata），富媒体结果的关停同样适用。与那篇讲语法选择的文章合读，就把"怎么写"和"写了还剩什么"串起来了。
---

많은 사이트가 아직도 FAQPage JSON-LD를 심으며 검색결과에 아코디언이 펼쳐지길 기대한다. 2026년 지금, 그 아코디언은 나오지 않는다. Google이 2026년 5월 7일부로 FAQ 리치 결과 표시를 완전히 중단했기 때문이다.

그런데 나는 이 상황에서 "그럼 FAQPage 마크업을 다 지워라"가 정답이라고 보지 않는다. 리치 결과가 죽은 것과 Q&A 구조가 쓸모없어진 것은 다른 문제다. 이 글은 그 둘을 갈라내는 기록이다. 오프라인 검증기로 FAQPage를 실제로 돌려서 "스키마는 통과하는데 노출은 없는" 지점을 눈으로 확인하고, 공식 문서를 근거로 지금 코드와 콘텐츠를 어떻게 손봐야 하는지 정리했다.

## FAQPage와 QAPage, 애초에 뭐가 달랐나

먼저 토대를 다진다. 이 글을 읽는 사람이 구조화 데이터를 처음 만진다고 가정하겠다.

구조화 데이터는 사람이 읽는 HTML 위에, 기계가 읽으라고 얹는 별도의 의미 정보다. schema.org가 그 어휘를 정의하고, 대개 `<script type="application/ld+json">` 블록으로 페이지에 넣는다. 검색엔진은 이 힌트를 참고해 검색결과에 특별한 모양(리치 결과)을 만들어줄 수 있다. 핵심은 "만들어줄 수 있다"이지 "만들어준다"가 아니다. 이 차이가 오늘 글의 전부다.

FAQPage는 그중 "하나의 질문에 발행자가 정한 하나의 공식 답"이 나열된 페이지를 표현한다. 제품 도움말, 요금 안내, 배송 정책 페이지가 전형적이다. 사촌 격인 QAPage는 성격이 다르다. QAPage는 사용자들이 답을 여럿 달고 그중 하나가 채택되는 커뮤니티형 페이지, 즉 포럼이나 Q&A 게시판을 위한 것이다. 발행자 단일 답이면 FAQPage, 여러 사용자 답이면 QAPage. 이 구분은 지금도 유효하고, 오늘 종료된 건 FAQPage 쪽 리치 결과다.

FAQPage JSON-LD의 최소 골격은 이렇게 생겼다.

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "배송은 며칠 걸리나요?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "영업일 기준 2~3일 걸립니다."
      }
    }
  ]
}
```

필수는 단순하다. `FAQPage` 아래 `mainEntity` 배열, 각 항목은 `Question`이고 `name`(질문 텍스트)과 `acceptedAnswer`(`Answer` + `text`)를 가진다. 이 골격 자체는 2019년 도입 이후 바뀌지 않았다. 바뀐 건 이걸 넣었을 때 Google이 해주는 일이다.

## 무슨 일이 있었나: 2023년의 축소, 2026년의 종료

Google이 FAQ 리치 결과를 손본 건 이번이 처음이 아니다. 시간순으로 짚는다.

2023년 8월, Google은 [HowTo와 FAQ 리치 결과 변경](https://developers.google.com/search/blog/2023/08/howto-faq-changes)을 공지했다. 공식 문장은 이렇다. FAQ 리치 결과는 "잘 알려진 권위 있는 정부 및 보건(government and health) 사이트"에만 표시되며, 그 외 사이트에는 더 이상 정기적으로 나오지 않는다. HowTo 리치 결과는 아예 전면 폐지됐다. 이때 이미 대부분의 일반 사이트에서 FAQ 아코디언은 사라졌다.

그 뒤 2026년에 남은 절차가 마무리됐다. Google 공식 changelog와 FAQPage 문서 기준으로 정리하면 이렇다.

| 시점 | 무엇이 종료됐나 |
|---|---|
| 2023-08 | FAQ 리치 결과를 정부·보건 권위 사이트로 제한, HowTo 전면 폐지 |
| 2026-05-07 | FAQ 리치 결과가 Google 검색에서 완전히 표시 중단(공식 문서에 지원 종료 명시) |
| 2026-06 | Search Console 리치 결과 보고서·Rich Results Test·검색 표현 필터에서 FAQ 지원 종료, FAQPage 공식 문서 제거 |
| 2026-08 | Search Console API의 FAQ 리치 결과 데이터 지원 종료 |

정리하면, 이제 어떤 사이트든 FAQPage JSON-LD로 검색결과 아코디언을 얻을 수 없다. 검증 도구에서조차 이 타입을 더는 리포트하지 않는다.

여기서 반드시 짚어야 할 공식 한계가 하나 있다. Google은 처음부터 "구조화 데이터가 리치 결과나 순위를 보장하지 않는다"고 명시해 왔다. FAQPage의 몰락은 그 원칙이 극단적으로 실현된 사례다. 스펙에 맞게 완벽히 넣어도, 표시 여부는 전적으로 검색엔진의 결정이다. 참고로 한 업계 분석(SearchEngineLand, 공식 아님)은 2023년 축소 직후 FAQ 리치 결과 노출이 SERP의 약 54%에서 약 17%로 떨어졌다고 집계했다. 수치 자체는 참고값이지만, 방향은 공식 종료와 일치한다.

## 검증기를 통과해도 노출은 없다, 직접 재봤다

말로만 "통과해도 소용없다"고 하면 공허하다. 그래서 임시 샌드박스에서 FAQPage JSON-LD를 오프라인 검증기로 직접 돌렸다. 네트워크 없이 schema.org 필수 구조만 검사하는 40줄짜리 Node 스크립트다. 정상 샘플 하나와 고의로 망가뜨린 샘플 하나를 넣었다.

검사 로직의 핵심은 이렇다.

```javascript
function validateFaqPage(doc) {
  const errors = [];
  if (doc["@type"] !== "FAQPage") errors.push('@type가 "FAQPage"가 아님');
  const items = Array.isArray(doc.mainEntity) ? doc.mainEntity : [];
  if (items.length === 0) errors.push("mainEntity에 Question이 없음");
  items.forEach((q, i) => {
    if (!q.name?.trim()) errors.push(`mainEntity[${i}] name 누락 — 필수`);
    const a = q.acceptedAnswer;
    if (!a) errors.push(`mainEntity[${i}] acceptedAnswer 누락 — 필수`);
    else if (!a.text?.trim()) errors.push(`mainEntity[${i}] answer.text 누락 — 필수`);
  });
  return errors;
}
```

돌린 결과는 이렇게 나왔다.

```text
[faqpage-sample.jsonld]
  schema-structure   : PASS
  google-rich-result : DEPRECATED (2026-05-07 리치 결과 표시 중단)

[faqpage-broken.jsonld]
  schema-structure   : FAIL
  google-rich-result : DEPRECATED (2026-05-07 리치 결과 표시 중단)
    - mainEntity[0] acceptedAnswer 누락 — 필수
    - mainEntity[1] name 누락 — 필수
```

정상 샘플은 스키마 구조 검사를 통과한다(`PASS`). 그런데 그 옆줄은 `DEPRECATED`다. 검증기가 아무리 초록불을 켜도, Google 검색이 그걸 렌더링하는 단계는 이미 닫혔다. 이게 오늘 글의 한 줄 요약이다. 스키마 유효성과 노출 가치는 다른 축이고, CI 게이트는 앞의 것만 본다. 이 사각지대는 [CI에서 구조화 데이터를 자동 검증하는 파이프라인](/ko/blog/ko/validate-structured-data-ci-jsonld-2026)을 운영하는 사람이라면 특히 유념해야 한다. 게이트가 통과했다고 트래픽 가치가 붙는 게 아니다. 검증기가 놓치는 축은 하나 더 있다. 값 자체가 말이 되는가. [음식점 영업시간 마크업을 3계층으로 검증해보니](/ko/blog/ko/restaurant-jsonld-opening-hours-validation-2026) `opens: "eleven"` 같은 값은 어느 층에서도 걸리지 않았다.

두 번째 샘플에서 확인할 점도 있다. 검증기는 여전히 필수 필드 누락을 정확히 잡아낸다. 즉 구조 검사 자체는 죽지 않았다. 죽은 건 그 뒤에 붙던 Google의 리치 결과 보상이다. 이 구분이 다음 결정을 가른다.

## 그럼 지우나 두나: Google의 공식 답과 내 판단

가장 흔한 질문. "리치 결과가 끝났으니 FAQPage 마크업을 다 걷어내야 하나?"

Google의 공식 안내는 명확하다. 굳이 제거할 필요는 없다는 것이다. 사용되지 않는 구조화 데이터는 검색에 문제를 일으키지 않지만, 눈에 보이는 효과도 없다. 즉 남겨둬도 해롭지 않고, 지워도 손해가 없다. 순수하게 Google 리치 결과만 놓고 보면 FAQPage JSON-LD는 이제 중립적인 죽은 코드다.

나라면 신규 페이지에는 Google을 위한 FAQPage JSON-LD를 새로 공들여 넣지 않는다. 시각적 보상이 0인 마크업을 유지보수 대상으로 늘릴 이유가 없다. 반대로 기존 사이트에 이미 대량으로 박혀 있다면, 그걸 걷어내는 대대적 마이그레이션도 서두르지 않는다. Google이 문제없다고 못 박았고, 제거 작업 자체가 회귀 위험을 만든다. 솔직히 이건 "적극적으로 아무것도 하지 않는 게 최선"인 드문 경우다.

단, 여기엔 조건이 붙는다. 지우지 말라는 건 JSON-LD 블록 이야기이고, 그 안에 담긴 Q&A 콘텐츠 자체는 전혀 다른 운명이다. 오히려 지금부터 더 중요해진다.

## 리치 결과가 죽은 자리, AI가 읽는다

여기부터가 내가 이 글을 쓴 진짜 이유다.

FAQ 리치 결과가 사라진 검색결과 화면을, AI Overviews를 비롯한 생성형 답변이 빠르게 채우고 있다. 그리고 AI 답변 엔진이 페이지에서 정보를 뽑는 방식은 Google 리치 결과와 근본이 다르다. 리치 결과는 JSON-LD라는 별도 채널을 읽었다. 반면 대다수 AI 크롤러는 [렌더링된 실제 HTML 본문](/ko/blog/ko/ai-crawlers-dont-render-javascript-csr-2026)에서 의미를 추출한다. 여기서 "질문 → 자기완결적인 짧은 답" 패턴은 기계가 인용하기 가장 좋은 형태다. 다만 그 인용 자리에 얼마나 노출될지는 마크업만으로 정해지지 않는다. [`max-snippet`·`nosnippet` 같은 로봇 스니펫 제어가 AI Overviews에 어디까지 먹히는지](/ko/blog/ko/robots-snippet-controls-ai-overviews-2026)도 같이 확인해두는 편이 낫다.

그러니까 FAQPage에서 진짜 자산이었던 건 JSON-LD 타입 이름이 아니라, 그걸 쓰게 만든 규율이었다. 명확한 질문 문장, 그 자리에서 완결되는 간결한 답. 이 규율을 JSON-LD에 가두지 말고, 눈에 보이는 시맨틱 HTML로 끌어내는 게 지금의 정답이라고 나는 본다. 구체적으로는 이렇게 한다.

- 질문은 실제 제목 요소(`<h2>`/`<h3>`)나 정의 목록(`<dl><dt>`)으로 마크업한다. AI 크롤러가 본문에서 바로 읽는다.
- 답은 그 질문 바로 뒤, 한 단락 안에서 자기완결적으로 끝낸다. "위에서 설명했듯"처럼 문맥에 의존하는 답은 추출 단위로 쪼개졌을 때 무너진다.
- 한 질문에 한 답. 발행자의 단일 공식 답이라는 FAQPage의 원래 성격을, 콘텐츠 차원에서 유지한다.

다만 정직하게 한계를 못 박는다. AI 엔진이 이런 구조를 실제로 더 잘 인용한다는 것은 내 실무 판단이자 여러 관찰의 종합이지, Google이 보장한 공식 수치가 아니다(참고값, 공식 아님). AI Overviews의 선택 로직은 비공개고, 나는 순위 알고리즘 내부를 단정하지 않는다. 내가 단정할 수 있는 건 하나다. 기계가 읽는 채널이 JSON-LD에서 렌더링된 본문으로 옮겨갔으니, 투자처도 그쪽으로 옮기는 게 합리적이라는 것.

## JSON-LD에 갇힌 Q&A를 본문으로 끌어내는 법

추상론으로 끝내지 않기 위해 구체적인 전후를 붙인다. 아래는 흔히 보는 안티패턴이다. 사람이 읽는 본문에는 마케팅 문구만 있고, 정작 질문과 답은 JSON-LD 블록 안에만 들어 있다.

```html
<!-- 안티패턴: Q&A가 JSON-LD에만 존재 -->
<section>
  <h2>자주 묻는 질문</h2>
  <p>궁금한 점이 있으신가요? 아래에서 확인하세요!</p>
</section>
<script type="application/ld+json">
{ "@type": "FAQPage", "mainEntity": [ /* 질문·답이 전부 여기 */ ] }
</script>
```

리치 결과가 살아 있던 시절엔 이래도 됐다. Google이 JSON-LD를 읽어 화면을 대신 그려줬으니까. 그 보상이 사라진 지금, 이 구조는 사람에게도 AI 크롤러에게도 질문과 답을 감춘 셈이 된다. 렌더링되는 본문으로 끌어내면 이렇게 바뀐다.

```html
<!-- 개선: Q&A가 시맨틱 HTML 본문에 존재 -->
<section>
  <h2>배송은 며칠 걸리나요?</h2>
  <p>영업일 기준 2~3일 걸립니다. 제주·도서산간은 하루 더 걸립니다.</p>

  <h2>교환은 언제까지 가능한가요?</h2>
  <p>상품 수령 후 7일 이내에 신청하면 됩니다.</p>
</section>
```

차이는 단순하지만 결정적이다. 질문이 실제 `<h2>`가 되어 문서 구조에 편입되고, 답은 그 자리에서 끝난다. 사람은 목차와 스크롤로 바로 찾고, AI 크롤러는 본문에서 질문-답 쌍을 그대로 뽑아간다. JSON-LD를 함께 남기고 싶다면 남겨도 된다. 다만 그건 이제 "혹시 모를 타 엔진용 보조 채널"이지 주력이 아니다. 주력은 눈에 보이는 이 HTML이다.

한 가지 더. 개별 페이지의 Q&A 구조를 정리했다면, 다음 단계는 사이트 전체의 [JSON-LD 노드를 하나의 그래프로 잇는 일](/ko/blog/ko/json-ld-graph-entity-linking-2026)이다. FAQ가 죽었다고 구조화 데이터 전체를 방치하면, 정작 살아 있는 Article·Organization 마크업이 고아 노드로 흩어진다.

## 정리: FAQ 마크업 앞에서 지금 할 결정

핵심을 한 줄로 줄이면 이렇다. Google 리치 결과를 노린 FAQPage JSON-LD는 끝났지만, Q&A라는 콘텐츠 구조는 AI 시대에 더 값이 나간다.

바로 적용할 체크리스트로 닫는다.

- **신규 페이지**: Google 리치 결과 목적의 FAQPage JSON-LD는 새로 넣지 않는다. 시각적 보상이 0이다.
- **기존 JSON-LD**: 서둘러 걷어내지 않는다. Google 공식으로 무해하며, 제거가 오히려 회귀 위험이다. Bing 등 타 엔진·schema.org 완결성 목적이면 그대로 둬도 된다.
- **Q&A 콘텐츠**: JSON-LD 안에 숨기지 말고 `<h2>`·`<dl>` 등 렌더링되는 시맨틱 HTML로 노출한다. 이게 AI 크롤러가 읽는 채널이다.
- **답의 형태**: 질문 바로 뒤에서 자기완결적으로 끝낸다. 문맥 의존 답은 추출 시 깨진다.
- **검증 게이트**: CI의 스키마 검증은 "구조 유효성"만 보증한다. "노출·인용 가치"는 별도 축이라는 걸 팀에 명시한다.
- **기대치 관리**: 구조화 데이터는 순위도 노출도 보장하지 않는다(Google 공식). FAQPage가 그 산증인이다.

구조화 데이터를 서버사이드로 확실히 내보내는 일이나, 리치 결과 종료·AI 인용 흐름에 맞춰 기존 사이트의 Q&A 구조와 스키마를 점검하는 일을 개인적으로 상담하거나 구현 의뢰로 받는다. 지금 있는 마크업 중 무엇을 남기고 무엇을 콘텐츠로 끌어올릴지 판단이 필요하다면, 프로필의 연락처로 문의해도 좋다.
