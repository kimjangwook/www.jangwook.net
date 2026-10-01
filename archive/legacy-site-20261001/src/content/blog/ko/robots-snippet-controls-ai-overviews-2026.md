---
title: 'AI Overview가 내 페이지를 인용할지 정하는 meta 한 줄 — robots 스니펫 지시자 실측'
description: 'nosnippet 한 줄은 이제 검색 스니펫만 끄지 않는다. Google 공식 문서는 이 지시자가 AI Overview·AI Mode의 인용 입력까지 막는다고 못박았다. 두 페이지를 만들어 파서로 max-snippet·data-nosnippet의 실제 효과를 다시 재봤다.'
pubDate: '2026-07-18'
heroImage: '../../../assets/blog/robots-snippet-controls-ai-overviews-2026/hero.png'
tags:
  - SEO
  - GEO
  - AI Overview
  - 구조화
relatedPosts:
  - slug: ai-crawler-control-robots-txt-llms-txt-2026
    score: 0.78
    reason:
      ko: 그 글이 "AI 크롤러를 robots.txt·llms.txt로 들어오게 할지 말지"의 앞단이라면, 이 글은 "들어온 뒤 무엇을 인용하게 둘지"의 뒷단이다. 접근 허용과 표시 제어는 다른 레버이고, 둘을 섞으면 사고가 난다.
      ja: あちらが「AIクローラーを robots.txt・llms.txt で入れるか」の前段なら、こちらは「入った後に何を引用させるか」の後段だ。アクセス許可と表示制御は別のレバーで、混同すると事故になる。
      en: That post is the front gate — whether AI crawlers get in via robots.txt and llms.txt. This is the back gate — what they may quote once inside. Access and display are different levers; conflating them causes accidents.
      zh: 那篇讲的是"用 robots.txt、llms.txt 决定是否放 AI 爬虫进来"的前门，这篇讲的是"进来之后允许它引用什么"的后门。放行与展示控制是两个不同的开关，混为一谈就会出事。
  - slug: ai-crawlers-dont-render-javascript-csr-2026
    score: 0.7
    reason:
      ko: 이 글에서 "data-nosnippet을 자바스크립트로 켜고 끄지 말라"는 공식 경고가 나오는데, 그 이유가 저 글의 핵심이다. 크롤러가 JS 실행 결과를 못 보면, 런타임에 붙인 속성도 없는 셈이 된다.
      ja: この記事の「data-nosnippet を JavaScript で付け外しするな」という公式警告の理由が、あちらの核心だ。クローラーがJSの実行結果を見なければ、実行時に付けた属性も無いのと同じになる。
      en: This post carries Google's warning not to toggle data-nosnippet with JavaScript, and the reason is exactly that post's thesis. If a crawler never sees your JS output, an attribute added at runtime effectively does not exist.
      zh: 本文引用了 Google"不要用 JavaScript 增删 data-nosnippet"的官方警告，而原因正是那篇的核心。若爬虫看不到 JS 执行结果，运行时添加的属性等于不存在。
  - slug: validate-structured-data-ci-jsonld-2026
    score: 0.68
    reason:
      ko: 눈으로 meta 태그를 훑어서 "가장 제한적인 것이 이긴다"를 판정하는 건 위험하다. 그 글에서 JSON-LD를 CI로 검증했던 것처럼, 스니펫 지시자도 파서로 자동 감사하는 게 맞다. 이 글의 audit.mjs가 바로 그 발상이다.
      ja: 目視で meta タグを追って「最も制限的なものが勝つ」を判定するのは危うい。あちらで JSON-LD を CI で検証したのと同じく、スニペット指示子もパーサーで自動監査すべきだ。この記事の audit.mjs がまさにその発想だ。
      en: Eyeballing meta tags to decide "most restrictive wins" is fragile. Just as that post validated JSON-LD in CI, snippet directives deserve an automated parser audit — which is exactly what audit.mjs in this post does.
      zh: 靠肉眼扫 meta 标签来判断"最严格者胜"很不可靠。正如那篇在 CI 里校验 JSON-LD，片段指令也应当用解析器自动审计——本文的 audit.mjs 正是这个思路。
  - slug: llm-seo-aeo-practical-implementation
    score: 0.66
    reason:
      ko: AI 답변에 인용되게 만드는 콘텐츠 전략(AEO)이 그 글의 주제였다면, 이 글은 그 전략을 자기 손으로 무효화하지 않는 기술적 전제 조건이다. 아무리 잘 써도 nosnippet이 걸려 있으면 인용 후보에서 통째로 빠진다.
      ja: AIの回答に引用させるコンテンツ戦略（AEO）があちらの主題なら、こちらはその戦略を自分で無効化しないための技術的前提だ。どれだけ良く書いても nosnippet が付いていれば、引用候補から丸ごと外れる。
      en: If that post is the content strategy for getting quoted in AI answers (AEO), this is the technical precondition for not sabotaging it yourself. However well you write, a stray nosnippet drops the whole page out of the citation pool.
      zh: 如果那篇讲的是让内容被 AI 回答引用的策略（AEO），这篇就是不让你亲手废掉该策略的技术前提。写得再好，只要挂着 nosnippet，整页都会被排除在引用候选之外。
---

meta 태그 한 줄이 검색 결과의 요약문만 끄는 줄 알았다. 이제는 그 한 줄이 Google의 AI Overview가 내 페이지를 인용할지 말지까지 정한다. Google Search Central 문서가 2025년 이후 명시적으로 그렇게 바꿔 적어놨다. 그런데도 많은 사이트가 레이아웃 템플릿에 옛날에 복붙해둔 `nosnippet` 한 줄 때문에, AI 검색이 자기 콘텐츠를 통째로 못 쓰게 막고 있다. 본인도 모른 채로.

오늘은 이 지시자들을 눈으로만 읽지 않았다. 일부러 망가뜨린 페이지와 고친 페이지를 각각 만들고, HTML을 파싱해 "이 페이지에서 AI가 실제로 인용할 수 있는 게 뭔가"를 판정하는 작은 감사 스크립트를 돌렸다. 아래 로그는 전부 그 샌드박스에서 나온 실제 출력이다.

## 스니펫, AI Overview, 그리고 robots meta가 뭘 정하는가

먼저 용어부터 정리하자. **스니펫(snippet)**은 검색 결과에서 제목 아래 나오는 요약 문장이다. 예전엔 이게 순전히 "클릭을 유도하는 미리보기"였다. **AI Overview**와 **AI Mode**는 Google이 검색 상단(또는 대화형 화면)에 붙이는 생성형 답변이다. 여러 페이지의 내용을 요약해 문장으로 만들어주고, 그 근거로 원문 페이지를 인용한다. 여기서 결정적인 변화가 있다. Google은 이 생성형 답변이 어떤 페이지를 **입력으로 쓸지**를, 기존 스니펫 지시자와 같은 스위치로 통제하기로 했다.

그 스위치가 `<meta name="robots">`에 넣는 스니펫 지시자다. 여기서 흔히 혼동하는 게 있다. `robots.txt`와 robots meta 태그는 전혀 다른 레버다. [robots.txt와 llms.txt로 AI 크롤러의 접근 자체를 통제하는 방법](/ko/blog/ko/ai-crawler-control-robots-txt-llms-txt-2026/)은 "들어올 수 있느냐"를 정하고, robots meta 태그는 "들어와서 색인·표시할 때 무엇을 어떻게 보여줄 수 있느냐"를 정한다. 그래서 순서가 중요하다. robots.txt로 크롤링을 막아버리면 Google은 그 페이지의 meta 태그 자체를 못 읽는다. 스니펫 지시자가 먹히려면 페이지는 크롤 가능하고 색인 가능한 상태여야 한다. 접근을 막는 것과 표시를 조절하는 것을 헷갈리면, 의도와 정반대의 결과가 나온다.

왜 지금 이게 중요한가. 검색 트래픽의 상당 부분이 "링크 목록"에서 "요약 답변"으로 옮겨가는 중이기 때문이다. AI 답변에 근거로 인용되는 것 자체가 새로운 노출 경로가 됐다. 그런데 그 노출의 문턱이, 아주 오래된 meta 태그 한 줄에 걸려 있다.

## 공식 규칙 — 네 개의 지시자, 그리고 정확한 값

Google Search Central의 robots meta 문서를 기준으로 정리한다. 추측이 아니라 문서에 적힌 그대로다.

`nosnippet`. 정의는 이렇다. "이 페이지의 검색 결과에 텍스트 스니펫이나 동영상 미리보기를 표시하지 않는다." 그리고 결정적인 문장이 이어진다. 이 규칙은 "웹 검색, 이미지, Discover, AI Overview, AI Mode 등 모든 형태의 검색 결과에 적용되며, **콘텐츠가 AI Overview와 AI Mode의 직접 입력으로 사용되는 것도 막는다.**" 즉 `nosnippet`은 이제 "요약문 끄기"가 아니라 "AI 인용 후보에서 빼기"다.

`max-snippet:[숫자]`. 텍스트 스니펫의 최대 글자 수를 정한다. `0`이면 스니펫 없음(사실상 `nosnippet`과 동일), `-1`이면 Google이 알아서 길이를 고른다, 양수면 그 글자 수까지만. 이 지시자도 문서에 똑같이 적혀 있다. AI Overview·AI Mode가 "콘텐츠를 직접 입력으로 얼마나 쓸 수 있는지를 제한한다." 그러니까 `max-snippet:0`은 인용 차단, `max-snippet:-1`은 전량 인용 가능이다.

`max-image-preview:[none|standard|large]`. 검색 결과에 뜨는 이미지 미리보기의 최대 크기다. `large`로 열어줘야 큰 이미지 미리보기가 가능하다. 기본값은 대개 `standard`라, 히어로 이미지를 크게 노출하고 싶어도 이 값을 안 건드리면 작은 썸네일로만 나간다.

`data-nosnippet`. 이건 meta 태그가 아니라 HTML 요소에 붙이는 속성이다. 페이지 전체가 아니라 **특정 블록만** 스니펫에서 빼고 싶을 때 쓴다. 여기 함정이 두 개 있다. 첫째, 문서는 이 속성이 `span`, `div`, `section` **세 요소에서만** 동작한다고 못박는다. `<p data-nosnippet>`은 그냥 무시된다. 둘째, "기존 노드의 data-nosnippet 속성을 자바스크립트로 추가하거나 제거하지 말라"는 경고가 붙어 있다. 이유는 단순하다. [AI 크롤러 상당수는 자바스크립트를 렌더링하지 않기 때문에](/ko/blog/ko/ai-crawlers-dont-render-javascript-csr-2026/), 런타임에 JS로 붙인 속성은 크롤러 눈에는 존재하지 않는 것과 같다. 서버가 내보내는 최초 HTML에 박혀 있어야 한다.

## 충돌하면 '가장 제한적인 것'이 이긴다

실무에서 사고가 나는 지점이 여기다. 한 페이지에 지시자가 여러 개 걸릴 수 있다. 일반 `robots` 태그가 하나, `googlebot` 전용 태그가 하나, 거기에 CMS 플러그인이 심어둔 것까지. 이때 어느 게 이기나. 문서의 답은 명확하다. "충돌하는 robots 규칙이 있으면, **더 제한적인 규칙이 적용된다.** 예를 들어 한 페이지에 `max-snippet:50`과 `nosnippet`이 함께 있으면 `nosnippet`이 적용된다."

이 규칙의 무서운 점은 방향성이다. 느슨한 쪽으로는 못 풀고, 조이는 쪽으로만 합쳐진다. `googlebot` 태그에 `max-snippet:160`을 넣어 "구글엔 스니펫 좀 넉넉히 줄게"라고 해도, 일반 `robots` 태그에 `nosnippet`이 남아 있으면 결과는 스니펫 0이다. 관대하게 열어둔 줄 알았는데 실제로는 잠겨 있는 상태. 눈으로 태그 두 개를 번갈아 보면서 "괜찮겠지" 판단하는 게 위험한 이유다.

그래서 나는 이걸 파서로 감사하기로 했다.

## 두 페이지를 만들어 파서로 감사해봤다

repo 밖 임시 샌드박스에 정적 HTML 두 개를 만들었다. 하나는 현장에서 흔히 보는 실수를 그대로 담은 `broken.html`, 하나는 그걸 의도대로 고친 `fixed.html`.

`broken.html`의 `<head>`와 본문에는 이런 것들이 들어 있다.

```html
<!-- 실수 1: 일반 robots에 nosnippet — 템플릿 전역에 복붙된 흔한 케이스 -->
<meta name="robots" content="index,follow,nosnippet">
<!-- 실수 2: googlebot으로 스니펫을 열려 하지만, 위 nosnippet이 '가장 제한적'이라 이김 -->
<meta name="googlebot" content="max-snippet:160">
...
<!-- 실수 3: data-nosnippet을 p에 붙임 → 지원 안 되는 요소라 무시됨 -->
<p data-nosnippet>내부용 메모: 스니펫에서 빼고 싶지만 p에는 안 먹는다.</p>
```

`fixed.html`은 페이지 전역은 열어주고, 빼고 싶은 딱 한 블록만 지원되는 요소로 격리했다.

```html
<!-- 페이지 전역: 전량 스니펫 + 큰 이미지 프리뷰 허용 -->
<meta name="robots" content="index,follow,max-snippet:-1,max-image-preview:large">
...
<!-- 요소 단위: 내부 메모만, 지원되는 span으로 -->
<span data-nosnippet>내부용 메모: 스니펫에서 제외.</span>
```

그다음 `node-html-parser`로 HTML을 파싱해서, 일반 `robots`와 `googlebot` 지시자를 모두 읽고 "가장 제한적인 것이 이긴다" 규칙으로 병합한 뒤, `data-nosnippet`이 붙은 요소의 태그명을 검사하는 스크립트(`audit.mjs`)를 짰다. 핵심 병합 로직은 이렇다.

```js
// nosnippet 또는 max-snippet:0 이 하나라도 있으면 전량 차단
function effectiveSnippetPolicy(dirsList) {
  let hardZero = false, cap = -1; // -1 = Google이 길이 선택
  for (const d of dirsList) {
    if (d.nosnippet) hardZero = true;
    if (d.maxSnippet === 0) hardZero = true;
    else if (d.maxSnippet > 0) cap = cap === -1 ? d.maxSnippet : Math.min(cap, d.maxSnippet);
  }
  if (hardZero) return { chars: 0, aiInput: 'blocked' };
  return { chars: cap, aiInput: cap === -1 ? 'full' : `capped@${cap}` };
}
```

두 파일을 넣고 돌린 실제 출력이다.

```text
========================================================
FILE: broken.html
  effective text snippet : 0 chars
  AI Overview text input : blocked
  image preview          : standard(default)
  data-nosnippet elements: 1
  [ERROR] PAGE_SNIPPET_BLOCKED: nosnippet(또는 max-snippet:0)이 페이지 전체에 걸려 텍스트 스니펫·AI Overview 인용이 완전히 차단됨.
  [WARN] CONFLICT_MOST_RESTRICTIVE: robots=nosnippet 와 googlebot=max-snippet:160 충돌 → 더 제한적인 nosnippet 이 이김(공식). 스니펫 0.
  [INFO] IMAGE_PREVIEW_LIMITED: max-image-preview=(미설정, 기본 standard) → 큰 이미지 프리뷰 비활성.
  [ERROR] DATA_NOSNIPPET_BAD_ELEMENT: <p data-nosnippet> 는 무시됨. data-nosnippet 은 span/div/section 에서만 동작(공식).
========================================================
FILE: fixed.html
  effective text snippet : full (Google chooses)
  AI Overview text input : full
  image preview          : large
  data-nosnippet elements: 1
  findings               : none — clean
========================================================
```

![robots 스니펫 지시자 감사 결과 — broken.html은 AI 입력 차단, fixed.html은 전량 허용](../../../assets/blog/robots-snippet-controls-ai-overviews-2026/audit-report.png)

숫자로 보면 명확하다. `broken.html`은 콘텐츠가 아무리 좋아도 AI Overview 입력에서 통째로 빠진다. 개발자가 `googlebot`에 `max-snippet:160`을 넣으며 "스니펫 좀 열어놨다"고 믿었던 게, 실제로는 잠긴 문이었다. `fixed.html`은 전량 인용 가능하고 큰 이미지 프리뷰도 열려 있으며, 내부 메모 한 줄만 정확히 스니펫에서 빠진다. 감사 스크립트가 잡아낸 네 가지 문제(전역 차단, 요소 오용, 충돌, 이미지 제한)는 전부 실제 사이트에서 반복해 나오는 패턴이다.

감사할 때 반드시 **서버가 실제로 내보내는 HTML**을 대상으로 해야 한다. 브라우저 개발자도구의 Elements 탭은 자바스크립트 실행 후의 DOM을 보여주기 때문에, 런타임에 조작된 meta 태그가 있으면 크롤러가 보는 것과 다르다. `curl -s <URL> | grep -i 'name="robots"'`처럼 원본 응답을 그대로 떠서 확인하는 게 안전하다. 내가 겪은 함정도 이거였다. 개발자도구에서는 `max-snippet:-1`로 멀쩡히 보이는데, 서버 응답 원본에는 CMS가 심어둔 `nosnippet`이 그대로 있던 경우다. 렌더링된 화면이 아니라 최초 바이트를 봐야 진실이 나온다. 최초 바이트 안에 태그가 있어도, 파서가 그걸 `<head>` 요소로 만들지 못하면 검색엔진은 못 읽는다. robots meta가 실제로 어디에 착지하는지를 10종 픽스처로 재봤다.

이걸 눈으로 판정하려 하지 말자. [JSON-LD 구조화 데이터를 CI에서 검증했던 것](/ko/blog/ko/validate-structured-data-ci-jsonld-2026/)과 똑같이, 스니펫 지시자도 빌드 파이프라인에서 파서로 자동 검사하는 게 맞다. 태그 하나가 잘못 걸리는 순간을 사람 눈은 놓치지만, 파서는 안 놓친다.

## 정직한 한계 — 인용 '자격'이지 인용 '보장'이 아니다

여기서 기대치를 깎아야 한다. `max-snippet:-1`과 `max-image-preview:large`를 열어둔다고 AI Overview가 내 페이지를 인용해주는 게 아니다. 이 지시자들은 **인용될 자격**을 여는 것일 뿐, 실제로 인용될지는 Google이 정한다. 순위를 올려주지도 않는다. Google은 스니펫 지시자가 순위 신호라고 말한 적이 없다. `nosnippet`을 풀었다고 방문자가 늘어난다는 보장은 어디에도 없다. 페이지 지시자 위에는 Search Console 속성 스위치가 하나 더 있다. HTML PR이 머지돼도 부모 도메인에서 제외를 누르면 AI Overview에서 빠진다. 공식 GEO 가이드가 남긴 그 스위치를 공개 URL로 재봤다.

반대 방향의 트레이드오프도 정직하게 봐야 한다. `nosnippet`을 거는 게 항상 실수는 아니다. 유료 콘텐츠의 본문, 로그인 뒤에만 보여야 할 정보, 검색 결과에 통째로 노출되면 클릭 유인이 사라지는 페이지라면 스니펫을 조이는 게 합리적이다. 다만 이제는 그 선택에 "AI 답변에 인용될 기회를 포기한다"는 비용이 붙는다는 걸 알고 결정해야 한다. 예전엔 스니펫만 껐지만, 지금은 생성형 검색에서의 존재감까지 함께 끄는 것이다.

내 입장은 이렇다. 공개용 콘텐츠, 특히 사람들이 답을 찾으러 오는 문서·가이드·제품 설명이라면 스니펫을 조일 이유가 거의 없다. 조이려면 페이지 전체가 아니라 `data-nosnippet`으로 문제 블록만 정밀하게 빼는 게 맞다. 전역 `nosnippet`은 대개 "옛날에 무슨 이유로 넣었는지 아무도 기억 못 하는" 상태로 남아, 조용히 인용 기회를 갉아먹는다.

## 개발자가 오늘 할 것

정리하면 오늘 확인할 체크리스트는 이렇다.

- **레이아웃 템플릿의 전역 robots meta를 먼저 열어본다.** 공통 헤더에 `nosnippet`이나 `max-snippet:0`이 박혀 있으면, 그 순간 사이트 전체가 AI 인용 후보에서 빠져 있는 것이다.
- **인용되길 원하는 콘텐츠의 기본값은** `max-snippet:-1, max-image-preview:large`. 이게 "AI 답변에 근거로 쓰여도 좋다"는 명시적 신호다.
- **빼고 싶은 건 페이지가 아니라 블록.** 내부 메모, 보일러플레이트, 유료 본문 티저는 `span`·`div`·`section`에 `data-nosnippet`으로 격리한다. `p`나 다른 요소엔 안 먹는다.
- **`data-nosnippet`을 자바스크립트로 토글하지 않는다.** 서버가 내보내는 최초 HTML에 박아둔다. 렌더링 안 하는 크롤러 앞에서 런타임 속성은 없는 것과 같다.
- **충돌은 파서로 잡는다.** 일반 `robots`와 `googlebot` 태그를 함께 읽어 "가장 제한적인 것이 이긴다"로 병합한 실효 정책을, 눈이 아니라 CI 스크립트로 확인한다.

구조화 데이터를 서버사이드로 확실히 내보내거나, 기존 사이트가 AI 검색에 어떻게 노출되는지 스니펫·크롤러 관점에서 점검하고 싶다면, 개인적으로 상담과 구현 의뢰를 받고 있다. 프로필의 문의 경로로 연락하면 된다. 오래된 meta 한 줄이 트래픽 경로를 통째로 막고 있는 경우가 생각보다 많다.
