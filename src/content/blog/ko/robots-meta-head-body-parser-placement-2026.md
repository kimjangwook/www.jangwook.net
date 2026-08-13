---
title: '열 가지 중 세 가지는 요소조차 되지 못했다: robots meta의 실제 착지점'
description: 'Google이 2026년 3월 robots meta를 body에서도 존중한다는 문장을 문서에 넣었다. 그런데 head/body는 저자가 정하는 값이 아니라 파서가 정하는 결과다. 배치 열 가지를 parse5에 통과시켜 요소가 어디에 놓이는지, 어디서 아예 사라지는지 재봤다.'
pubDate: '2026-08-13'
heroImage: '../../../assets/blog/robots-meta-head-body-parser-placement-2026/hero.png'
tags:
  - SEO
  - 크롤링
  - HTML
  - 웹개발
  - 검색최적화
faq:
  - question: 'robots meta를 body에 넣어도 정말 괜찮은가요?'
    answer: 'Google 한정으로는 괜찮습니다. Google은 robots meta 문서에 head 배치를 강제하지 않으며 body에 있는 것도 존중한다고 적어두었습니다. 다만 다른 검색엔진과 사내 검사 도구까지 같은 판단을 한다는 보장은 없고, 제 측정에서 head를 기준으로 요소를 찾는 흔한 구현은 body에 놓인 지시자를 전부 놓쳤습니다.'
  - question: 'head 안에 썼는데 왜 body로 옮겨지나요?'
    answer: 'HTML 파서가 head를 닫는 시점이 저자가 쓴 </head>가 아니기 때문입니다. head 안에 head용이 아닌 내용이 하나라도 나오면 파서는 거기서 head를 닫고 body를 엽니다. 제 측정에서 head 안에 문자열 하나 또는 div 하나를 먼저 넣자, 그 뒤의 robots meta는 두 경우 모두 body의 자식으로 만들어졌습니다.'
  - question: 'noscript 안에 noindex를 넣는 방식은 어떤가요?'
    answer: '스크립팅이 켜진 파서에서는 그 안의 내용이 요소가 아니라 순수 텍스트가 됩니다. HTML 표준이 noscript의 동작 방식을 그렇게 정의하고 있고, Google은 상록 버전 Chromium으로 렌더링한다고 밝혀두었습니다. 제 측정에서도 스크립팅을 켠 파싱에서는 meta 요소가 트리에 존재하지 않았습니다.'
  - question: 'JavaScript로 robots meta를 붙이거나 지워도 되나요?'
    answer: 'Google 문서는 noindex를 만나면 렌더링과 JavaScript 실행을 건너뛸 수 있으므로 JavaScript로 robots meta를 바꾸거나 지우는 방식은 의도대로 동작하지 않을 수 있다고 적고 있습니다. 색인되기를 원하는 페이지라면 애초에 원본 코드에 noindex를 넣지 말라는 것이 문서의 권고입니다.'
relatedPosts:
  - slug: robots-snippet-controls-ai-overviews-2026
    score: 0.88
    reason:
      ko: 그 글은 지시자가 무엇을 정하는지를 다뤘고, 이 글은 그 지시자가 문서 트리 어디에 놓이는지를 다룬다. 값이 맞아도 요소가 없으면 값은 읽히지 않는다.
      ja: あちらは指示子が何を決めるかの話で、こちらはその指示子が文書ツリーのどこに落ちるかの話だ。値が正しくても要素がなければ読まれない。
      en: That post covered what the directives decide. This one covers where the directive lands in the document tree. A correct value in a node that was never built is not read at all.
      zh: 那篇讲的是指令决定什么，这篇讲的是指令最后落在文档树的哪里。值写对了，元素没生成，照样读不到。
  - slug: ai-crawler-control-robots-txt-llms-txt-2026
    score: 0.79
    reason:
      ko: robots.txt는 크롤러가 들어오기 전 층이고 robots meta는 들어온 뒤의 층이다. 두 층을 같이 봐야 "막았다고 믿었는데 안 막혔다"가 어디서 생기는지 보인다.
      ja: robots.txtはクローラーが入る前の層、robots metaは入った後の層だ。二つを並べて見ると「ブロックしたつもりが効いていない」がどこで生まれるか分かる。
      en: robots.txt is the layer before the crawler arrives; robots meta is the layer after. Reading both together is how you find where "I thought I blocked it" actually breaks.
      zh: robots.txt 是爬虫进来之前那层，robots meta 是进来之后那层。两层一起看，才知道"以为挡住了其实没挡住"是在哪儿出的。
  - slug: speakable-cssselector-pointer-rot-2026
    score: 0.74
    reason:
      ko: 마크업이 문자열로는 멀쩡한데 실행해 보면 다른 곳을 가리키고 있더라는 이야기를 그 글에서 먼저 했다. 이번에는 가리키는 쪽이 아니라 놓이는 쪽에서 같은 일이 벌어졌다.
      ja: マークアップは文字列としては正しいのに、動かすと別の場所を指していたという話をあの記事で先にした。今回は指す側ではなく置かれる側で同じことが起きた。
      en: That post made the case that markup can look correct as a string and still point somewhere else once you run it. Here the same thing happens on the placement side rather than the pointing side.
      zh: 那篇先讲过：标记作为字符串看着没问题，一跑起来却指向别处。这次同样的事发生在"落在哪里"这一侧，而不是"指向哪里"。
---

배치 열 가지를 HTML 파서에 통과시켜 `<meta name="robots">`가 실제로 어디에 놓이는지 세어봤다. head에 남은 것은 두 가지였다. body로 옮겨진 것이 다섯 가지. 나머지 세 가지에서는 meta 요소가 문서 트리에 아예 만들어지지 않았다.

세 번째 분류가 이 글의 이유다. head냐 body냐는 눈으로 보이는 차이지만, 요소가 있느냐 없느냐는 파싱해 보기 전에는 보이지 않는다. 그리고 지시자를 읽는 쪽 입장에서 없는 요소는 잘못 놓인 요소보다 훨씬 나쁘다.

![저자가 쓴 마크업과 파서가 만든 트리가 갈라지는 지점](../../../assets/blog/robots-meta-head-body-parser-placement-2026/hero.png)

## 지시자가 놓이는 자리는 저자가 정하지 않는다

먼저 기초부터 정리한다. `<meta name="robots">`는 검색엔진에게 이 페이지를 색인할지, 스니펫을 얼마나 보여줄지, 링크를 따라갈지를 알려주는 HTML 태그다. `noindex`, `nosnippet`, `max-snippet:50` 같은 값이 여기 들어간다. 값이 무엇을 뜻하는지는 [AI Overview가 내 페이지를 인용할지 정하는 meta 한 줄](/ko/blog/ko/robots-snippet-controls-ai-overviews-2026)에서 지시자별로 정리해 두었으니 여기서는 다루지 않는다. 오늘의 관심사는 값이 아니라 자리다.

자리 이야기를 하려면 HTML 파서가 무엇을 하는지 알아야 한다. 브라우저는 우리가 쓴 HTML 문자열을 그대로 쓰지 않는다. 문자열을 토큰으로 쪼갠 다음, 규칙에 따라 요소 트리를 만든다. 이 과정을 트리 구성이라 부르고, 여기에는 "지금 어느 삽입 모드인가"라는 상태가 있다. `<head>` 안을 처리하는 동안에는 in head 모드다.

핵심은 이 모드가 언제 끝나느냐다. 저자가 쓴 `</head>`에서 끝난다고 생각하기 쉽다. 실제로는 그렇지 않다. in head 모드에서 head에 들어갈 수 없는 것이 하나라도 나오면, 파서는 그 자리에서 head를 닫고 body를 연 다음 그것부터 다시 처리한다. `</head>`는 여러 종료 경로 중 하나일 뿐이다.

그래서 head와 body의 경계는 저자가 선언하는 값이 아니라 파서가 계산하는 결과다. 이 구분이 왜 중요한지는 아래에서 숫자로 나온다.

## Google이 3월에 붙인 한 줄

Google의 robots meta 문서는 오래전부터 이렇게 안내해 왔다. "Place the robots `meta` tag in the `<head>` section of a given page." head에 두라는 것이다.

그런데 [Search Central 문서 업데이트 기록](https://developers.google.com/search/updates)의 2026년 3월 24일 항목에 robots meta 문서에 HTML head 바깥의 태그 처리에 관한 노트를 추가했다는 줄이 있다. 그 노트를 [robots meta 태그 사양 문서](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag)에서 확인하면 이렇게 적혀 있다.

> Google Search doesn't enforce placement of meta robots in the HTML head and will respect robots meta tags in the body section of an HTML document as well.

배치를 강제하지 않으며 body에 있는 것도 존중한다. 명료한 문장이다.

나는 이 문장이 "이제 body에 써도 된다"는 허가로 읽히는 것을 경계한다. body에 robots meta를 일부러 쓰는 사람은 거의 없기 때문이다. 현실에서 body에 놓인 robots meta는 대부분 저자가 head에 썼는데 파서가 옮겨놓은 것이다. 그러니까 이 노트가 실제로 하는 일은 새로운 자유를 주는 것이 아니라, 그동안 조용히 실패하던 사고 한 종류를 Google 쪽에서 실패가 아니게 만든 것이다.

바꿔 말하면 관대해진 것은 Google이고, 그 사고 자체는 그대로 남아 있다. 그래서 실제로 어떤 마크업이 그 사고를 일으키는지 세어볼 필요가 있었다.

## 열 가지 배치를 파서에 통과시켰다

임시 샌드박스에 문서 열 개를 만들었다. 넣는 태그는 전부 동일하다. `<meta name="robots" content="noindex">` 한 줄이고, 달라지는 것은 그 줄이 놓인 자리뿐이다. 파서는 parse5 8.0.1을 썼다. HTML 표준의 트리 구성 알고리즘을 그대로 구현한 라이브러리이고, 스크립팅 플래그를 켜고 끌 수 있어서 이번 실험에 맞았다.

각 문서를 파싱한 뒤 트리를 순회해 `meta[name=robots]`를 찾고, 그 요소의 조상 사슬을 기록했다. 요소가 없으면 원문 문자열이 텍스트 노드 안에 남아 있는지도 같이 확인했다.

![열 가지 배치와 두 가지 스크립팅 플래그의 판정 행렬](../../../assets/blog/robots-meta-head-body-parser-placement-2026/placement-matrix.png)

| 마크업 | 스크립팅 켬 | 스크립팅 끔 |
| --- | --- | --- |
| A. head 안 (기준선) | `head > meta` | `head > meta` |
| B. head 안, 주석 뒤 | `head > meta` | `head > meta` |
| C. head 안, 문자열 뒤 | `body > meta` | `body > meta` |
| D. head 안, `<div>` 뒤 | `body > meta` | `body > meta` |
| E. body 첫 자식 | `body > meta` | `body > meta` |
| F. body 마지막 자식 | `body > meta` | `body > meta` |
| G. `<noscript>` 안 | 요소 없음 (텍스트) | `head > noscript > meta` |
| H. `<template>` 안 | 별도 프래그먼트 | 별도 프래그먼트 |
| I. head 안, `<title>` 미닫힘 | 요소 없음 (텍스트) | 요소 없음 (텍스트) |
| J. body 안, `<div>` 안 | `body > div > meta` | `body > div > meta` |

C와 D가 앞 절에서 말한 그 사고다. head 안에 문자열 `hello` 하나를 먼저 넣었을 뿐인데 뒤따르는 meta는 body의 자식이 됐다. `<div>` 하나를 먼저 넣어도 결과는 같다. 주석은 head에 들어갈 수 있으므로 B는 영향이 없었다. 이 차이가 중요하다. 분석 태그를 붙이는 스크립트, 서버가 삽입하는 배너, 템플릿 엔진이 남긴 공백 아닌 문자 하나가 head를 조기에 닫는다. 그리고 그 뒤로 밀려 나가는 것은 robots meta만이 아니다. canonical도, hreflang도 같이 나간다.

Google은 이제 이 세 줄(C, D, 그리고 의도적인 E·F·J)을 전부 존중한다. 여기까지는 안심해도 되는 이야기다.

## noscript 안의 noindex는 정확히 반대로 작동한다

G가 이번 실험에서 가장 오래 붙들고 있던 줄이다.

`<noscript>` 안에 `noindex`를 넣는 패턴은 방어적으로 보인다. 스크립트가 안 도는 환경에서도 지시자가 남게 하려는 의도로 읽힌다. 실제로는 정반대로 작동한다.

HTML 표준이 `noscript`의 동작 방식을 이렇게 정의한다. 원문은 [WHATWG HTML의 noscript 요소 절](https://html.spec.whatwg.org/multipage/scripting.html#the-noscript-element)에 있다.

> The `noscript` element is only effective in the HTML syntax, it has no effect in the XML syntax. This is because the way it works is by essentially "turning off" the parser when scripts are enabled, so that the contents of the element are treated as pure text and not as real elements.

스크립트가 켜져 있으면 그 안의 내용은 진짜 요소가 아니라 순수 텍스트로 취급된다. 요소가 아니므로 트리에 meta 노드가 만들어지지 않고, 만들어지지 않았으므로 존중할 대상 자체가 없다.

그러면 Google은 스크립팅을 켠 쪽인가 끈 쪽인가. Google의 [JavaScript SEO 기초 문서](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)가 답한다. "Google Search runs JavaScript with an evergreen version of Chromium." 상록 버전 Chromium으로 JavaScript를 실행한다. 스크립팅이 켜진 쪽이다.

즉 `<noscript>` 안에 넣은 robots 지시자는 Google이 보는 트리에는 존재하지 않는다. body에 있어서 무시되는 것이 아니라, 애초에 요소가 아니라서 읽을 것이 없다.

여기서 한 번 더 갈라지는 지점이 있다. 같은 마크업을 jsdom 30.0.1에 넣고 옵션만 바꿔봤다.

```
runScripts=undefined      -> meta 요소 존재: true  | noscript 텍스트 길이: 0
runScripts=outside-only   -> meta 요소 존재: true  | noscript 텍스트 길이: 0
runScripts=dangerously    -> meta 요소 존재: false | noscript 텍스트 길이: 38
```

기본값에서는 요소가 있다고 답하고, 스크립팅을 실제로 켜면 없다고 답한다. 같은 문자열, 같은 라이브러리, 정반대의 결론이다. 그리고 CI에서 jsdom을 쓸 때 대부분은 기본값을 쓴다. 검사기가 통과시킨 지시자를 Google은 보지 못하는 조합이 여기서 만들어진다.

H와 I는 더 단순하다. `<template>` 안의 내용은 문서 트리가 아니라 별도의 DocumentFragment로 들어간다. `document.querySelector`로 찾을 수 없고, 당연히 지시자로 읽히지도 않는다. I는 `<title>`을 닫지 않은 경우인데, `title`은 내용을 텍스트로 먹는 요소라서 뒤따르는 마크업이 통째로 제목 문자열이 됐다. 스크립팅 플래그와 무관하게 요소는 없었다.

## 내 검사기가 Google보다 엄격했다

지시자가 어디 있는지 알았으니, 이번엔 그것을 찾는 쪽을 봤다. 사내 린터든 SEO 크롤러든 프리렌더 검증이든, robots meta를 확인하는 코드는 대개 한 줄짜리 셀렉터다. 그 한 줄을 두 가지 흔한 형태로 놓고 jsdom 30.0.1에서 같은 픽스처들을 다시 돌렸다.

| 마크업 | `document.head.querySelector` | `document.querySelector` |
| --- | --- | --- |
| A. head 안 (기준선) | 찾음 | 찾음 |
| C. head 안, 문자열 뒤 | 못 찾음 | 찾음 |
| D. head 안, `<div>` 뒤 | 못 찾음 | 찾음 |
| E. body 첫 자식 | 못 찾음 | 찾음 |
| G. `<noscript>` 안 | 찾음 | 찾음 |
| H. `<template>` 안 | 못 찾음 | 못 찾음 |
| I. head 안, `<title>` 미닫힘 | 못 찾음 | 못 찾음 |
| K. JS로 나중에 삽입 | 원본 false / 실행 후 true | 원본 false / 실행 후 true |

head를 기준으로 찾는 구현은 C, D, E에서 지시자를 놓쳤다. 이 세 경우는 Google이 존중한다고 문서에 적어둔 바로 그 배치다. 내 검사기가 Google보다 엄격해진 것이다. 엄격한 것 자체는 나쁘지 않지만, 이 엄격함은 방향이 틀렸다. "지시자가 없다"고 보고하는데 실제로는 있고 작동한다. 반대로 G에서는 "지시자가 있다"고 보고하는데 Google이 보는 트리에는 없다. 두 오류가 서로 반대 방향으로 난다.

문서 전체를 훑는 쪽은 C, D, E를 정확히 잡았다. 대신 G를 그대로 통과시켰다. 어느 한쪽 셀렉터만으로는 이 표를 다 덮을 수 없다는 뜻이다.

## JS로 붙이는 지시자는 렌더러를 기다린다

K는 초기 HTML에 robots meta가 없고 스크립트가 나중에 `document.head`에 붙이는 경우다. 파싱 직후에는 없고 스크립트 실행 후에는 있다. 당연한 결과지만, 이 "나중에"가 검색 쪽에서는 조건부다.

같은 JavaScript SEO 문서가 렌더링 순서를 이렇게 적는다.

> Googlebot queues all pages with a `200` HTTP status code for rendering, unless a robots `meta` tag or header tells Google not to index the page.

그리고 바로 이어지는 경고가 핵심이다.

> When Google encounters the `noindex` tag, it may skip rendering and JavaScript execution, which means using JavaScript to change or remove the robots `meta` tag from `noindex` may not work as expected.

noindex를 만나면 렌더링과 JavaScript 실행을 건너뛸 수 있다. 그러니 JavaScript로 noindex를 지우는 방식은 의도대로 동작하지 않을 수 있다. 문서는 색인되기를 원한다면 애초에 원본 코드에 noindex를 넣지 말라고 못박는다.

이 문장을 파싱 실험과 겹쳐 놓으면 하나의 규칙으로 정리된다. **초기 HTML의 바이트가 가장 강한 보장이고, 렌더러가 돌아야 생기는 것은 전부 그보다 약하다.** `<noscript>`도, `<template>`도, JS 삽입도 같은 이유로 약하다. 앞의 둘은 렌더러가 돌아도 요소가 안 생기고, 마지막 하나는 렌더러가 돌아야만 생긴다.

크롤러가 페이지에 들어오기 전 층인 robots.txt까지 함께 보고 싶다면 [AI 크롤러를 robots.txt로 제대로 제어하기](/ko/blog/ko/ai-crawler-control-robots-txt-llms-txt-2026)에 정리해 두었다. 이 글은 들어온 다음 층의 이야기다.

## 배포 전에 파서에게 물어볼 다섯 줄

여기까지의 결과를 점검 항목으로 옮기면 이렇게 된다.

1. **문서 전체 범위로 찾는다.** `document.head.querySelector`가 아니라 `document.querySelector`다. head 기준으로 찾으면 Google이 존중하는 배치를 못 찾았다고 보고한다.
2. **찾은 다음 조상 사슬을 확인한다.** `template` 또는 `noscript`가 조상에 있으면 그 지시자는 없는 것으로 취급한다. 있음/없음이 아니라 어디 있음까지 봐야 한다.
3. **스크립팅을 켜고 파싱한다.** Google은 상록 Chromium으로 렌더링한다. 검사기의 파싱 조건을 거기 맞춘다. jsdom 기본값은 반대쪽이다.
4. **head/body는 오류가 아니라 경고로 둔다.** body에 있어도 Google은 존중한다. 다만 body에 있다는 사실 자체가 head가 조기에 닫혔다는 신호이므로, canonical과 hreflang이 같이 밀려났는지 함께 본다.
5. **noindex는 초기 HTML에 넣거나 아예 넣지 않는다.** JS로 붙였다 지웠다 하지 않는다. 이건 내 취향이 아니라 Google 문서의 권고다.

2번과 3번을 코드로 옮기면 다음 정도다. 검사기에 추가하기 쉽도록 짧게 남긴다.

```js
import { parse } from 'parse5';

export function findRobotsDirective(html) {
  const doc = parse(html, { scriptingEnabled: true }); // Google과 같은 조건
  const stack = [{ node: doc, path: [] }];
  while (stack.length) {
    const { node, path } = stack.pop();
    const name = node.tagName ?? node.nodeName;
    if (node.tagName === 'meta') {
      const attrs = Object.fromEntries(node.attrs.map((a) => [a.name, a.value]));
      if ((attrs.name ?? '').toLowerCase() === 'robots') {
        return { content: attrs.content, path: [...path, name] };
      }
    }
    // template의 내용은 childNodes가 아니라 content 프래그먼트에 있다
    if (node.tagName === 'template') stack.push({ node: node.content, path: [...path, name] });
    for (const child of node.childNodes ?? []) stack.push({ node: child, path: [...path, name] });
  }
  return null;
}

// 사용: 조상에 template/noscript가 끼어 있으면 읽히지 않는 지시자다
const found = findRobotsDirective(servedHtml);
const dead = found?.path.some((n) => n === 'template' || n === 'noscript');
```

내 사이트에도 돌려봤다. 빌드 산출물에서 세 페이지를 골라 같은 파서로 확인하니 head의 자식은 60개였고 그중 head에 들어갈 수 없는 요소는 0개였다. 조기 종료는 없었다는 뜻이다. 다만 이건 자랑할 결과가 아니다. `BaseHead.astro`는 `noindex` 값이 있을 때만 robots meta를 내보내므로 대부분의 페이지에는 이 태그가 애초에 없다. 조기 종료가 없어서 안전한 게 아니라, 밀려날 태그가 없어서 조용했던 쪽에 가깝다. 정작 지시자를 내보내는 404 페이지 같은 곳이 위험 구간이고, 그쪽은 이번에 세지 않았다.

측정 범위도 분명히 해둔다. 나는 parse5와 jsdom이 HTML 표준을 어떻게 구현하는지를 쟀지 Googlebot이 무엇을 하는지를 재지 않았다. 두 라이브러리는 표준 알고리즘을 구현한 것이고 Google은 Chromium을 쓴다. 트리 구성 규칙이 같으니 결과도 같을 것이라고 보는 것은 추론이지 실측이 아니다. Bing이나 다른 크롤러의 동작은 확인하지 않았고, 여기에 대해서는 아무 주장도 하지 않는다. 그리고 지시자가 제자리에 있다는 것은 색인·표시 자격에 관한 이야기이지 순위에 관한 이야기가 아니다.

## 남은 질문: 관대해진 쪽은 Google뿐이다

이 글을 쓰면서 계속 걸린 것이 하나 있다. Google이 배치를 강제하지 않기로 한 것은 크롤러 쪽 현실을 받아들인 결과에 가깝다. 세상의 HTML은 깨져 있고, 깨진 head에서 지시자를 건져내는 편이 무시하는 편보다 사용자에게 낫다는 판단이었을 것이다. 합리적이다.

문제는 그 관대함이 한 곳에만 생겼다는 점이다. 내 빌드 파이프라인은 여전히 head를 기준으로 검사하고, 다른 검색엔진이 같은 문장을 문서에 적어둔 것도 아니고, 무엇보다 head가 조기에 닫혔다는 사실 자체는 여전히 버그다. robots meta가 살아남았다고 해서 그 옆에 있던 canonical까지 살아남는다는 보장은 없다.

그래서 나는 이 노트를 "body도 괜찮다"로 읽지 않기로 했다. "body에서 발견됐다면 head가 어디서 닫혔는지 찾아봐라"로 읽는 쪽이 실무에서 더 쓸모 있다. 다만 이 판단이 언제까지 유효할지는 모르겠다. 다른 엔진들도 같은 문장을 적어 넣고, 프레임워크들이 head 관리를 전부 가져가 버리면, 그때는 이 검사 항목 자체가 사라져도 될 것이다. 아직은 아니다.

렌더링 파이프라인 어디에서 지시자가 사라지는지 추적하는 작업은 내 일감의 한 축이다. 문의는 [문의 페이지](/ko/contact/)로.

---

*출처: Google Search Central의 [Robots Meta Tags Specifications](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag), [JavaScript SEO Basics](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics), [Latest Google Search Documentation Updates](https://developers.google.com/search/updates), WHATWG의 [HTML Standard, The noscript element](https://html.spec.whatwg.org/multipage/scripting.html#the-noscript-element)(모두 공식). 본문의 영문 블록인용 네 건은 각 원문 페이지를 그 자리에서 가져와 대조한 문자열이고, 인용 곁에 원문 링크를 두었다. 측정 환경: 임시 샌드박스 디렉터리의 픽스처 문서 10종, parse5 8.0.1, jsdom 30.0.1, Node 22.22, macOS, 2026년 8월 13일 측정. 프로브 스크립트는 `scripts/probe-robots-meta-placement.mjs`와 `scripts/probe-robots-meta-consumer.mjs`, 원자료는 `data/robots-meta-placement.json`과 `data/robots-meta-consumer.json`, 그림 생성은 `scripts/chart-robots-meta-placement.py`. 측정 대상은 두 라이브러리의 트리 구성 결과이며 Googlebot의 실제 처리 결과가 아니다. Bing 등 다른 크롤러의 동작은 확인하지 않았다. robots 지시자는 색인과 표시 자격을 정하는 장치이지 순위를 정하는 장치가 아니다.*
