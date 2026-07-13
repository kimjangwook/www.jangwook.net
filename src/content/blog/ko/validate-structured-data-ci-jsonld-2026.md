---
title: '구조화 데이터를 배포 전에 잡아라 — JSON-LD를 CI에서 자동 검증하는 법'
description: 'JSON-LD 파서가 통과시켜도 검색엔진은 못 읽는 마크업이 있다. schema.org의 @vocab 때문에 오타와 대소문자 오류가 멀쩡한 JSON-LD로 확장된다. 60줄짜리 스키마 인지 검증기를 만들어 CI에서 배포 전에 잡은 실측 기록.'
pubDate: '2026-07-13'
heroImage: '../../../assets/blog/validate-structured-data-ci-jsonld-2026/hero.png'
tags:
  - 구조화데이터
  - JSON-LD
  - CI
  - SEO
relatedPosts:
  - slug: structured-data-syntax-comparison-jsonld-microdata-rdfa-2026
    score: 0.78
    reason:
      ko: 그 글이 "어떤 문법으로 쓸까"를 정했다면, 이 글은 "그렇게 쓴 JSON-LD가 실제로 맞게 쓰였는지 어떻게 매일 자동으로 확인할까"다. 문법 선택 다음의 운영 단계다.
      ja: あちらが「どの構文で書くか」を決めるなら、この記事は「そう書いたJSON-LDが本当に正しいかを毎日どう自動確認するか」だ。構文選択の次の運用段階。
      en: That post picks the syntax; this one asks how you keep verifying, every commit, that the JSON-LD you wrote is actually correct. It's the operations step after the choice.
      zh: 那篇决定"用哪种语法写"，这篇问的是"你写的 JSON-LD 到底对不对，怎么每次提交都自动验证"。是选定语法之后的运维环节。
  - slug: axe-core-ci-a11y-jsdom-vs-browser-2026
    score: 0.72
    reason:
      ko: 접근성을 CI에 넣었더니 color-contrast만 조용히 빠지던 그 이야기와 골격이 같다. 자동 검사가 "무엇을 검사하지 않는가"를 알아야 초록불을 오독하지 않는다.
      ja: アクセシビリティをCIに入れたらcolor-contrastだけ静かに抜けた——あの話と骨格が同じ。自動検査が「何を検査しないか」を知らないと緑を誤読する。
      en: Same skeleton as the a11y-in-CI story where color-contrast silently dropped out. You misread the green check until you know what the automated check does not cover.
      zh: 和"把无障碍放进 CI 后只有 color-contrast 悄悄消失"那篇骨架相同。不知道自动检查"不查什么"，就会误读那个绿灯。
  - slug: json-ld-graph-entity-linking-2026
    score: 0.66
    reason:
      ko: 이 글의 검증기가 노드 단위로 타입과 속성을 본다면, 그 글은 그 노드들을 @graph 하나로 잇는 문제를 다룬다. 검증 다음은 연결이다.
      ja: この記事の検証器がノード単位で型と属性を見るなら、あちらはそのノードを@graph一つに繋ぐ問題を扱う。検証の次は連結だ。
      en: This post's validator inspects types and properties node by node; that one handles wiring those nodes into a single @graph. Validation first, then connection.
      zh: 这篇的验证器逐节点检查类型和属性，那篇处理的是把这些节点连成一个 @graph。先验证，再连接。
  - slug: ai-crawlers-dont-render-javascript-csr-2026
    score: 0.6
    reason:
      ko: 검증을 통과한 JSON-LD도 JS로만 심으면 AI 크롤러 눈엔 없는 것과 같다. 이 글이 "맞게 썼나"라면 그 글은 "실려 나가긴 하나"다.
      ja: 検証を通ったJSON-LDもJSでしか差し込まなければAIクローラーには存在しない。この記事が「正しく書いたか」なら、あちらは「載って出るか」だ。
      en: Even validated JSON-LD is invisible to AI crawlers if it's injected only by JS. This post asks "did you write it right"; that one asks "does it even ship."
      zh: 通过验证的 JSON-LD，若只用 JS 注入，在 AI 爬虫眼里等于不存在。这篇问"写对了吗"，那篇问"到底发出去了没"。
---

배포 파이프라인의 구조화 데이터 검증이 초록불이다. 그 초록불이 증명하는 건 딱 하나, 당신의 JSON-LD가 <strong>문법적으로 온전하다</strong>는 것뿐이다. 구글이 그 안의 필드를 한 개라도 읽을 수 있다는 뜻은 아니다. 이 둘은 같은 질문이 아닌데, 대부분의 팀이 하나로 착각한다.

내가 이걸 실감한 건 `@type`을 소문자 `article`로 잘못 쓴 마크업이 파서를 아무 소리 없이 통과하는 걸 봤을 때다. JSON-LD 프로세서 입장에선 완벽하게 유효하다. 구글 입장에선 그냥 모르는 타입이라 무시한다. 사이는 조용하다. 경고도, 에러도, 빨간불도 없다. 6개월 뒤 Search Console에서 리치 결과가 왜 안 뜨는지 뒤질 때가 돼서야 알게 된다.

## 검증에는 층이 두 개다

구조화 데이터를 "검증한다"고 할 때 사실 서로 다른 두 가지를 말한다.

첫째는 <strong>문법 검증</strong>이다. 이 JSON-LD가 파싱되는가? 중괄호가 맞고, `@context`가 있고, JSON-LD 1.1 처리기가 이걸 그래프로 확장할 수 있는가? 이건 `jsonld` 같은 라이브러리가 완벽하게 해준다.

둘째는 <strong>스키마 의미 검증</strong>이다. 타입 이름이 schema.org 어휘에 실제로 존재하는 철자·대소문자인가? 속성 이름에 오타는 없는가? 날짜가 ISO 8601인가? URL 필드가 절대 경로인가? 구글이 이 타입에 대해 권장하는 필드가 들어 있는가? 이건 파서가 <strong>해주지 않는다</strong>.

여기서 함정은, 두 번째가 실패해도 첫 번째는 태연히 통과한다는 데 있다. 그리고 구글의 공식 검증 도구인 Rich Results Test와 Schema Markup Validator(validator.schema.org)는 둘 다 <strong>브라우저에서 URL이나 코드를 붙여 넣는 수동 도구</strong>다. 당신의 빌드 파이프라인 안에 없다. 그러니 누군가 손으로 열어 확인하지 않는 한, 잘못된 스키마는 그대로 프로덕션까지 흘러간다.

[JSON-LD, Microdata, RDFa 중 무엇을 언제 쓸지](/ko/blog/ko/structured-data-syntax-comparison-jsonld-microdata-rdfa-2026)를 이미 정했다면, 그다음 질문은 이거다. 그렇게 고른 문법으로 매일 짜는 마크업이, 매 커밋마다 맞게 쓰였는지 누가 확인하는가.

## 왜 이 간격이 지금 더 비싸졌나

예전엔 구조화 데이터가 조용히 깨져도 손해가 리치 결과 스니펫 하나 정도였다. 지금은 다르다. 검색의 무게중심이 옮겨가는 중이고, AI 개요와 생성형 답변을 만드는 크롤러들이 페이지의 의미를 파악할 때 구조화 데이터에 기대는 비중이 커졌다. 그런데 이 크롤러들 상당수는 [자바스크립트를 실행하지 않고 raw HTML만 가져간다](/ko/blog/ko/ai-crawlers-dont-render-javascript-csr-2026). 즉 서버가 내보낸 JSON-LD가 이들이 보는 거의 전부다.

그 JSON-LD의 `@type`이 소문자 `article`이라면? 사람 눈엔 페이지가 멀쩡하고, 파서도 통과시키지만, 그걸 읽는 기계 입장에선 저자도 발행일도 없는 정체불명의 노드다. 실수 하나의 대가가 "스니펫을 놓친다"에서 "AI가 이 페이지를 잘못 이해한다"로 커졌다. 배포 전에 거르는 게 그만큼 더 남는 장사가 됐다는 뜻이다.

## 왜 파서로는 오타가 안 잡히나

이걸 말로만 하면 안 믿길 것 같아서 샌드박스에서 재현했다. Node v22, `jsonld` 8.x. 흔한 실수 다섯 개를 일부러 심은 `broken.json`을 만들었다.

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "article",
      "headline": "Broken sample",
      "datePublished": "07/13/2026",
      "authour": "Kim Jangwook",
      "image": "hero.png"
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "name": "Blog", "item": "https://example.com/blog" }
      ]
    }
  ]
}
```

소문자 `article`, 오타 `authour`, 미국식 날짜 `07/13/2026`, 상대 경로 `hero.png`, `position`이 빠진 `ListItem`. 이걸 `jsonld.expand()`에 넣으면 처리기가 각 용어를 어떤 IRI로 풀어내는지 볼 수 있다.

```text
$ node expand-demo.mjs

===== broken.json — jsonld.expand() =====
resolved @type IRIs : http://schema.org/article, http://schema.org/BreadcrumbList, http://schema.org/ListItem
resolved term IRIs  : http://schema.org/article, http://schema.org/authour,
                      http://schema.org/datePublished, http://schema.org/headline,
                      http://schema.org/image, http://schema.org/BreadcrumbList, ...
```

핵심은 여기다. `article`은 `http://schema.org/article`로, `authour`는 `http://schema.org/authour`로 <strong>말끔하게 확장된다</strong>. 에러 없이. 경고 없이. 버려지지도 않는다.

이유는 schema.org가 배포하는 JSON-LD 컨텍스트가 `@vocab`을 `https://schema.org/`로 설정해 두기 때문이다. `@vocab`이 있으면 처리기는 정의되지 않은 어떤 문자열이든 그 접두사에 <strong>그냥 이어 붙인다</strong>. `authour`라는 속성이 schema.org에 존재하는지 확인하지 않는다. 존재하지 않는 IRI를 만들어 낼 뿐이고, 그건 JSON-LD 문법상 완벽하게 합법이다. 파서가 검사하는 건 문법이지 어휘가 아니다.

그래서 "JSON-LD가 유효하다"와 "구글이 읽을 수 있다" 사이의 간격이 생긴다. 이 간격은 [흩어진 블록을 @graph로 잇는 문제](/ko/blog/ko/json-ld-graph-entity-linking-2026)와도 이어진다. 연결을 논하기 전에, 노드 하나하나가 애초에 유효한 타입·속성으로 쓰였는지부터 담보돼야 한다.

## 60줄짜리 스키마 인지 검증기

파서가 못 잡는다면, 스키마를 아는 검사를 직접 붙이면 된다. 거창할 필요 없다. 검사할 타입의 어휘 일부와 규칙 다섯 개만 있으면 된다.

```javascript
const VOCAB = {
  Article: {
    props: ['headline','datePublished','dateModified','author','image','description'],
    // Google은 Article에 "필수" 속성이 없다(권장만). headline 강제는 우리 팀 정책이다.
    recommended: ['headline'],
    urlProps: ['image'], dateProps: ['datePublished','dateModified'],
  },
  BreadcrumbList: { props: ['itemListElement'], required: ['itemListElement'] },
  ListItem: { props: ['position','name','item'], required: ['position','name'], urlProps: ['item'] },
};
const KNOWN = Object.keys(VOCAB);
const ISO = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2})?([+-]\d{2}:\d{2}|Z)?)?$/;
const ABS = /^https?:\/\//;

function checkNode(node, errors) {
  let t = node['@type'];
  if (!KNOWN.includes(t)) {
    const near = KNOWN.find(k => k.toLowerCase() === String(t).toLowerCase());
    if (near) { errors.push(`@type "${t}" 대소문자 오류 → "${near}"`); t = near; }
    else return;
  }
  const spec = VOCAB[t];
  for (const key of Object.keys(node)) {
    if (key.startsWith('@')) continue;
    if (!spec.props.includes(key)) {
      const near = spec.props.find(p => p.toLowerCase() === key.toLowerCase());
      errors.push(`${t}.${key}: 유효하지 않은 속성${near ? ` → "${near}"?` : ''}`);
    }
  }
  for (const r of (spec.required || [])) if (!(r in node)) errors.push(`${t}: 필수 필드 "${r}" 누락`);
  for (const d of (spec.dateProps || [])) if (node[d] && !ISO.test(node[d])) errors.push(`${t}.${d}: ISO 8601 아님`);
  for (const u of (spec.urlProps || [])) { const v = node[u]; if (v && !ABS.test(v)) errors.push(`${t}.${u}: 절대 URL 아님`); }
  // 중첩 노드·itemListElement 재귀
  for (const v of Object.values(node))
    (Array.isArray(v) ? v : [v]).forEach(x => x && typeof x === 'object' && x['@type'] && checkNode(x, errors));
}
```

여기서 대소문자 오류를 만나면 그냥 에러만 던지고 끝내지 않고, 바른 타입으로 <strong>복구해 검사를 이어간다</strong>. 그래야 `article`이 잘못됐다는 것과 그 노드 안의 `authour`·날짜·URL 문제까지 한 번에 다 보인다. 처음 만들었을 때 이 복구를 안 넣었더니, 타입 오류 하나만 보고하고 나머지 네 개를 놓쳤다. CI에서 한 번에 다 보여줘야 왕복이 줄어든다.

Article에 `required`가 아니라 `recommended`로 적은 걸 눈여겨보라. 구글 공식 문서상 <strong>Article에는 필수 속성이 없다</strong>. `author`, `datePublished`, `dateModified`, `headline`, `image`는 전부 "권장"일 뿐이다. 그래서 headline을 강제하는 건 구글 규칙이 아니라 우리 팀의 편집 정책이다. 검증기는 바로 그 지점, "공식 권장 위에 우리 조직이 세운 최소 기준"을 코드로 못 박는 자리다.

## 실제 돌린 결과

`good.json`(멀쩡한 Article + 2단계 BreadcrumbList)과 `broken.json`을 같은 검증기에 넣었다.

![구조화 데이터 검증기의 실제 CI 실행 로그. good.json은 PASS 0 problems, broken.json은 FAIL 5 problems로 대소문자·오타·날짜·URL·필수필드 누락을 모두 잡고 exit 1로 빌드를 중단시킨다](../../../assets/blog/validate-structured-data-ci-jsonld-2026/ci-run-log.png)

```text
===== good.json =====
PASS — 0 problems

===== broken.json =====
FAIL — 5 problems
  x @type "article" is wrong casing → "Article"
  x Article.authour: not a valid property → "author"
  x Article.datePublished: "07/13/2026" is not ISO 8601
  x Article.image: "hero.png" must be an absolute URL
  x ListItem: missing Google-required field "position"
process exit code = 1
```

다섯 개를 전부 잡았고, `broken.json`에서 프로세스가 <strong>exit 1</strong>로 끝났다. 이 종료 코드가 전부다. `good.json`은 exit 0. 이 한 줄이 있으면 CI는 아무 추가 설정 없이 빌드를 막는다.

`ListItem`의 `position` 누락만 "Google-required"로 표시된 데 주목하라. 이건 정확하다. BreadcrumbList는 최소 두 개의 ListItem을 요구하고, 각 ListItem은 `position`과 `name`을 실제로 요구한다(공식). 반면 Article 쪽 오류 넷 중에는 "필수" 딱지가 하나도 없다. 검증기가 공식 규칙과 팀 정책을 구분해 말하고 있는 것이다.

## CI 게이트로 거는 법

종료 코드가 이미 1이니, 나머지는 배관 작업이다. `package.json`에 스크립트 한 줄.

```json
{ "scripts": { "validate:schema": "node scripts/validate-schema.mjs" } }
```

그리고 GitHub Actions 잡에 한 스텝.

```yaml
- name: Validate structured data
  run: npm run validate:schema
```

검증기가 실패하면 잡이 실패하고, 잘못된 스키마가 든 PR은 머지되지 않는다. 사이트 전체를 훑고 싶으면 빌드된 HTML에서 `<script type="application/ld+json">` 블록을 긁어 같은 `checkNode`에 흘려 넣으면 된다. 원리는 똑같다. [접근성 검사를 CI에 붙였던](/ko/blog/ko/axe-core-ci-a11y-jsdom-vs-browser-2026) 방식과 뼈대가 같다. 사람이 매번 손으로 확인하던 걸, 실패하면 빨간불이 뜨는 결정적 게이트로 바꾸는 것.

## 이 검증기가 하지 못하는 것

솔직하게 선을 그어야 이 글이 정직해진다.

<strong>이건 Rich Results Test의 대체품이 아니다.</strong> 손으로 고른 어휘 일부(Article, BreadcrumbList, ListItem, Person)만 안다. 실무에서는 schema.org의 공개 덤프에서 타입·속성 목록을 생성해 채워야 전체 커버리지가 나온다. 여기서 보인 건 개념 증명이지 완제품이 아니다.

<strong>검증을 통과해도 리치 결과가 뜬다는 보장은 없다.</strong> 이건 내 의견이 아니라 구글 공식 입장이다. 일반 구조화 데이터 가이드라인은 이렇게 못 박는다. "구조화 데이터를 쓰면 기능이 <strong>나타날 수 있게</strong> 될 뿐, 나타난다고 보장하지는 않는다." 마크업이 완벽해도 구글 알고리즘이 사용자·기기·위치에 따라 그냥 텍스트 결과가 낫다고 판단할 수 있다. 그리고 "구조화 데이터 자체는 일반적인 순위 요소가 아니다"라고도 명시한다. 검증기가 통과시키는 건 "형식이 맞다"까지지, "리치 결과가 뜬다"나 "순위가 오른다"가 아니다.

<strong>파서의 확장은 문법만 본다.</strong> 위에서 봤듯 `@vocab` 때문에 오타도 유효한 IRI로 확장된다. 그러니 확장이 성공했다는 사실을 검증으로 착각하면 안 된다. 두 층은 서로를 대신하지 못한다. 문법은 파서에게, 의미는 스키마 인지 검사에게 맡겨야 한다.

## 개발자가 오늘 할 것

- 빌드 산출물의 JSON-LD를 한 번이라도 Rich Results Test에 손으로 넣어 기준선을 잡는다. 그다음 그 검사를 코드로 옮긴다.
- 자주 쓰는 타입(대개 Article/BlogPosting, BreadcrumbList, Organization, WebSite)의 어휘와 규칙부터 `VOCAB`에 넣는다. 전부 채우려 하지 말고 자주 틀리는 것부터.
- 대소문자·오타·날짜 형식·상대 URL 네 가지는 무조건 검사한다. 파서가 절대 안 잡아주는 것들이다.
- 구글 "필수"와 팀 "정책"을 코드에서 분리해 표기한다. 나중에 왜 이 필드를 강제하는지 헷갈리지 않는다.
- 종료 코드 1을 CI 스텝에 물린다. 리포트만 찍고 통과시키면 아무도 안 본다.

구조화 데이터를 서버사이드로 확실히 내보내거나, 기존 사이트의 스키마·접근성·크롤러 대응을 배포 파이프라인 차원에서 점검하고 싶다면, 개인적으로 상담과 구현 의뢰를 받는다. 프로필의 문의 경로로 연락하면 된다. 초록불 뒤에 무엇이 남는지 함께 들여다보는 일을 한다.
