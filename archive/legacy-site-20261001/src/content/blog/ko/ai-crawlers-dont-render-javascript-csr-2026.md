---
title: AI 크롤러는 당신의 자바스크립트를 실행하지 않는다
description: >-
  GPTBot·ClaudeBot 같은 AI 크롤러는 자바스크립트를 실행하지 않아, CSR로만 렌더링한 페이지는 AI 검색과 인용에서
  통째로 사라진다. 그 원인을 curl 요청으로 직접 재현해 확인하고, 서버사이드 렌더링과 프리렌더링으로 콘텐츠를 다시 노출시키는
  구체적 방법까지 정리했다.
pubDate: '2026-07-09'
heroImage: ../../../assets/blog/ai-crawlers-csr-invisible-2026-hero.png
tags:
  - geo
  - seo
  - ssr
  - ai-crawler
  - web-development
relatedPosts:
  - slug: localbusiness-structured-data-server-side-vs-js-2026
    score: 0.9
    reason:
      ko: "이 글에서 'JS로 주입한 JSON-LD는 AI 크롤러 눈에 사라진다'고 짚었는데, 그 서버사이드 vs JS 차이를 LocalBusiness 스키마로 실측한 글이다."
      ja: "本記事で触れた「JS注入のJSON-LDはAIクローラーから消える」を、LocalBusinessスキーマでサーバーサイドとJSを実測比較した記事。"
      en: "This post warns that JS-injected JSON-LD vanishes for AI crawlers; here the server-side vs JS gap is measured on a LocalBusiness schema."
      zh: "本文提到「JS注入的JSON-LD会在AI爬虫面前消失」，这篇用LocalBusiness结构化数据实测了服务端与JS注入的差别。"
  - slug: ai-crawler-control-robots-txt-llms-txt-2026
    score: 0.88
    reason:
      ko: "여기서 llms.txt를 CSR 해법으로 쓰지 말라고 했다면, AI 크롤러 허용·차단 정책 자체를 robots.txt로 어떻게 짜는지는 이 글에서 다룬다."
      ja: "ここでllms.txtをCSRの解決策にするなと書いたが、AIクローラーの許可・遮断ポリシー自体をrobots.txtでどう組むかはこの記事で扱う。"
      en: "If this post told you not to treat llms.txt as a CSR fix, this one covers how to actually shape AI-crawler allow/block policy with robots.txt."
      zh: "本文说别拿llms.txt当CSR的解药；这篇讲怎么用robots.txt真正制定AI爬虫的允许与拦截策略。"
  - slug: json-ld-graph-entity-linking-2026
    score: 0.85
    reason:
      ko: "구조화 데이터는 서버 응답에 있어야 의미 있다고 했는데, 그 JSON-LD를 @graph로 엔티티까지 연결하는 설계가 이 글에서 이어진다."
      ja: "構造化データはサーバー応答にあってこそ意味があると書いたが、そのJSON-LDを@graphでエンティティまでつなぐ設計はこの記事に続く。"
      en: "Structured data only pays off in the server response; this post extends that into wiring JSON-LD into an @graph entity model."
      zh: "结构化数据要在服务器响应里才有意义；这篇把JSON-LD进一步用@graph连成实体模型。"
  - slug: sitemap-lastmod-crawl-scheduling-2026
    score: 0.8
    reason:
      ko: "'크롤러가 실제로 무엇을 읽는가'라는 같은 질문을, 이번엔 sitemap에서 구글이 유일하게 신뢰하는 lastmod로 파고든 글이다."
      ja: "「クローラーが実際に何を読むか」という同じ問いを、今度はsitemapでGoogleが唯一信頼するlastmodで掘り下げた記事。"
      en: "Same question of what a crawler actually reads, this time drilling into lastmod, the one sitemap field Google genuinely trusts."
      zh: "同样是「爬虫到底读什么」这个问题，这篇钻研的是sitemap里Google唯一真正信赖的lastmod字段。"
  - slug: a11y-lighthouse-audit-fix-2026
    score: 0.72
    reason:
      ko: "같은 '샌드박스에서 직접 재현하고 실측한다' 방식으로, 이번엔 접근성 위반을 Lighthouse로 잡아 고친 기록이다."
      ja: "同じ「サンドボックスで再現して実測する」やり方で、今度はアクセシビリティ違反をLighthouseで捕まえて直した記録。"
      en: "Same 'reproduce in a sandbox and measure' approach, applied to catching and fixing accessibility violations with Lighthouse."
      zh: "同样是「在沙盒里复现并实测」的做法，这次是用Lighthouse抓出并修复无障碍问题的记录。"
---

Googlebot이 자바스크립트를 잘 읽는다는 건 이제 상식이다. 그래서 많은 팀이 "우리 SPA도 검색에는 문제없다"고 넘어간다. 반은 맞는 말이다. 문제는 검색의 무게중심이 옮겨가는 중이라는 것. ChatGPT에 물어보고, Perplexity로 찾고, 구글 AI 개요를 먼저 읽는 사용자가 늘어나는데, 이 답변을 만드는 크롤러들은 Googlebot과 전혀 다르게 움직인다.

핵심부터 말하면 이렇다. <strong>GPTBot, ClaudeBot, PerplexityBot은 당신의 자바스크립트를 실행하지 않는다.</strong> 페이지를 그리지도, 렌더링을 기다려주지도 않는다. raw HTML을 한 번 가져가서 텍스트를 뽑고 끝이다. 그래서 콘텐츠를 클라이언트에서만 그리는 사이트는 사람 눈엔 멀쩡해도 AI 크롤러의 눈엔 빈 페이지다. 오늘은 이걸 말로만 하지 않고 샌드박스에서 직접 재현했다.

![AI 크롤러가 받는 raw HTML — CSR은 빈 껍데기, SSR은 전체 콘텐츠](../../../assets/blog/ai-crawlers-csr-invisible-2026-hero.png)

## 렌더링이라는 단어를 먼저 정리하자

이 글을 제대로 읽으려면 "렌더링"이라는 말이 두 곳에서 다르게 쓰인다는 걸 짚어야 한다. 웹 페이지의 콘텐츠가 어디서 HTML로 조립되느냐의 문제다.

<strong>서버사이드 렌더링(SSR)</strong>과 정적 생성(SSG)은 서버가 완성된 HTML을 만들어 보낸다. 브라우저든 크롤러든 응답을 받는 순간 이미 `<h1>가게 이름</h1>`, 주소, 본문이 다 들어 있다. 반대로 <strong>클라이언트사이드 렌더링(CSR)</strong>은 서버가 거의 빈 껍데기(`<div id="app"></div>`)와 자바스크립트 번들만 보낸다. 실제 콘텐츠는 브라우저가 그 JS를 실행해서 채운다. React, Vue로 만든 전형적인 SPA가 이 방식이다.

사람이 브라우저로 볼 땐 둘의 차이가 안 느껴진다. 브라우저는 JS를 실행하니까. 차이는 <strong>JS를 실행하지 않는 방문자</strong>가 왔을 때 드러난다. 그리고 지금 인터넷에는 그런 방문자, 즉 AI 크롤러가 빠르게 늘고 있다.

## Googlebot과 AI 크롤러를 같은 상자에 넣지 마라

여기서 가장 많이 미끄러진다. Google 공식 문서(<a href="https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics">Understand JavaScript SEO Basics</a>)를 보면 Googlebot은 헤드리스 Chromium을 써서 페이지를 렌더링하고, JS를 실행한 뒤 그 결과 HTML을 색인한다. 실제로 Google은 오래전부터 동적 렌더링(dynamic rendering)을 "임시 우회책일 뿐 권장 해법이 아니다"라고 못박고 SSR·SSG·하이드레이션을 권한다(<a href="https://developers.google.com/search/docs/crawling-indexing/javascript/dynamic-rendering">Dynamic Rendering as a workaround</a>). 2026년 3월엔 JS SEO 문서에서 "자바스크립트 없이도 페이지가 동작하게 하라"는 경고 문구까지 지웠다. Google이 자기 렌더러를 그만큼 신뢰한다는 뜻이다.

그런데 이걸 "이제 CSR은 어디서나 안전하다"로 읽으면 크게 다친다. 저 문서는 <strong>Googlebot</strong> 이야기지 AI 크롤러 이야기가 아니다. 내가 확인한 바로는, 그리고 업계 크롤 데이터 분석(Vercel, "The rise of the AI crawler". 참고값, 공식 아님)이 일관되게 말하는 바로는, GPTBot·OAI-SearchBot·ClaudeBot·PerplexityBot·Bytespider는 JS를 렌더링하지 않는다. 5억 건 넘는 GPTBot 요청을 분석했더니 JS 실행 흔적이 하나도 없었다는 보고도 있다(참고값, 공식 아님). GPTBot이 JS 파일을 다운로드하는 경우는 있어도 실행은 안 한다는 것이다.

예외가 하나 있긴 하다. Google Gemini는 Googlebot의 렌더링 인프라(Web Rendering Service)를 쓰기 때문에 JS를 실행할 수 있다. 그래서 구글 AI 개요는 CSR 페이지를 볼 수도 있다. 하지만 ChatGPT, Claude, Perplexity는 못 본다. "AI가 내 SPA를 읽더라"를 구글 하나로 일반화하면 안 되는 이유다.

## curl 하나로 크롤러의 시야를 그대로 재현했다

말로는 얼마든 할 수 있으니 직접 재봤다. 방법은 단순하다. <strong>curl은 자바스크립트를 실행하지 않는다.</strong> 그러니 렌더링을 안 하는 AI 크롤러가 서버에서 받아가는 raw HTML을 curl로 그대로 재현할 수 있다. 완벽한 대역이다.

샌드박스에 가상의 카페 사이트를 두 벌 만들었다. 콘텐츠는 동일하다. 하나는 CSR, 하나는 SSR.

```html
<!-- csr.html — 콘텐츠를 클라이언트에서만 주입 -->
<div id="app"><p>Loading…</p></div>
<script>
  fetch('/data.json').then(r => r.json()).then(d => {
    document.getElementById('app').innerHTML =
      '<h1>' + d.name + '</h1><p>' + d.tagline + '</p>' +
      '<address>' + d.address + '</address>' +
      '<p>대표 메뉴: ' + d.signature + '</p>';
  });
</script>
```

```html
<!-- ssr.html — 서버 응답에 콘텐츠가 이미 들어 있음 -->
<main id="app">
  <h1>Aria Coffee Roasters</h1>
  <p>싱글오리진 스페셜티 커피와 직접 로스팅한 원두</p>
  <address>서울시 마포구 어딘가로 12</address>
  <p>대표 메뉴: 게이샤 핸드드립</p>
</main>
```

이제 GPTBot 흉내를 내서 두 페이지를 가져와 봤다. User-Agent만 GPTBot으로 바꿨을 뿐, curl은 어차피 JS를 안 돌린다.

```bash
curl -A "GPTBot/1.2" http://127.0.0.1:8971/csr.html | grep -c "게이샤 핸드드립"
# → 0

curl -A "GPTBot/1.2" http://127.0.0.1:8971/ssr.html | grep -c "게이샤 핸드드립"
# → 1
```

대표 메뉴 "게이샤 핸드드립"은 이 가게를 검색 결과에 인용하게 만들 바로 그 정보다. CSR 응답에는 <strong>0번</strong> 나온다. `<title>`에 박아둔 상호명만 겨우 걸리고, 본문·주소·메뉴는 전부 사라진다. 크롤러가 뽑아가는 텍스트를 실제로 추출해보면 격차가 더 선명하다.

![curl로 뽑은 크롤러 추출 텍스트 — CSR 29자 vs SSR 107자](../../../assets/blog/ai-crawlers-csr-invisible-2026-evidence.png)

CSR 페이지에서 크롤러가 건진 본문은 `"Aria Coffee Roasters Loading…"` 딱 29자. 로딩 스피너 문구까지 같이 긁어간 게 저 정도다. SSR 페이지는 107자, 상호·설명·주소·대표 메뉴가 그대로 다 들어온다. 같은 콘텐츠, 같은 디자인, 사람 눈엔 똑같은 페이지인데 크롤러가 읽는 실체는 이렇게 다르다.

## 그럼 내 사이트는 어느 쪽일까: 30초 점검

남 이야기 같지만 확인은 30초면 된다. 두 가지 방법을 권한다.

첫째, 터미널에서 크롤러 시야를 직접 확인한다. 사이트 주소와 페이지에 반드시 있어야 할 핵심 문구를 넣어 돌려보면 된다.

```bash
curl -A "GPTBot" https://example.com/my-page | grep "여기_핵심_문구"
```

이 문구가 결과에 안 잡히면, AI 크롤러도 그 문구를 못 본다는 뜻이다. 제목 태그만 걸리고 본문이 안 나온다면 CSR 의존도가 높은 것이다.

둘째, 브라우저 개발자도구에서 자바스크립트를 끄고 새로고침한다. Chrome이라면 명령 팔레트(Cmd+Shift+P)에서 "Disable JavaScript"를 실행하면 된다. 페이지가 텅 비거나 "Loading…"에서 멈춘다면, 그게 바로 GPTBot이 보는 화면이다. 나는 이 방법을 클라이언트 사이트 점검할 때 제일 먼저 쓴다. 리포트 없이 눈으로 바로 판정이 되니까.

## 고치는 방향, 프레임워크별로

해법은 새로운 게 아니다. <strong>핵심 콘텐츠를 서버 응답 HTML에 담아라.</strong> 사용 중인 스택에 따라 손대는 지점이 다르다.

- <strong>Next.js</strong>: App Router의 서버 컴포넌트(RSC)나 `getServerSideProps`/정적 생성으로 데이터 페칭을 서버로 옮긴다. 콘텐츠를 `useEffect` 안 `fetch`로만 가져오지 말 것.
- <strong>Nuxt</strong>: 기본이 유니버설 모드다. `ssr: true`가 살아 있는지, 문제 컴포넌트가 `<ClientOnly>`로 감싸여 있지 않은지 확인한다.
- <strong>Astro</strong>: 정적 생성이 기본이라 대개 안전하다. 다만 `client:only` 아일랜드 안에만 있는 텍스트는 초기 HTML에 안 들어가니 주의.
- <strong>SvelteKit / Angular</strong>: SvelteKit은 `load` 함수의 서버 실행을, Angular는 Angular Universal(SSR)을 켠다.

특히 조심할 게 하나 있다. 구조화 데이터(JSON-LD)나 메타 태그를 Google Tag Manager 같은 클라이언트 스크립트로 주입하는 패턴이다. 사람 눈엔 잘 들어가지만 AI 크롤러는 그 스크립트를 안 돌리니 JSON-LD도 통째로 사라진다. 이 함정은 [LocalBusiness 구조화 데이터를 JS로 넣을 때와 서버사이드로 넣을 때의 차이](/ko/blog/ko/localbusiness-structured-data-server-side-vs-js-2026/)에서 실측으로 다룬 적이 있는데, AI 크롤러 시대에는 그 "서버사이드가 더 확실하다"는 원칙의 무게가 훨씬 커졌다. 엔티티를 제대로 연결하는 [JSON-LD @graph 구조](/ko/blog/ko/json-ld-graph-entity-linking-2026/)를 쓰더라도, 그게 서버 응답에 있어야 의미가 있다.

전면 SSR 전환이 부담스럽다면 하이브리드도 괜찮다. 껍데기와 핵심 텍스트는 서버에서 그리고, 상호작용이 필요한 위젯만 클라이언트에서 하이드레이션하는 방식이다. 판단 기준은 딱 하나. <strong>의미 있는 본문 텍스트가 초기 HTML에 들어 있는가.</strong>

고친 뒤에는 반드시 같은 curl 명령으로 다시 확인한다. 배포 파이프라인이 프리렌더 단계를 건너뛰거나, CDN이 봇에게 다른 응답을 캐시로 내주거나, 특정 라우트만 여전히 클라이언트에서 그려지는 경우가 흔하다. 나는 핵심 랜딩 페이지 몇 개를 골라 `curl -A "GPTBot" ... | grep` 를 배포 후 체크리스트에 넣어둔다. 한 줄이면 회귀를 잡는다.

한 가지 덧붙이면, SSR은 Googlebot 입장에서도 이득이다. Googlebot은 JS를 실행하긴 하지만, 크롤과 렌더링을 분리된 큐로 처리한다. CSR 페이지는 "먼저 HTML을 긁고, 렌더링 자원이 날 때 나중에 다시 그려서 색인"하는 2단계를 거치기 때문에 콘텐츠가 색인에 반영되기까지 시차가 생길 수 있다. 서버가 완성된 HTML을 주면 이 렌더 큐 대기가 통째로 사라진다. AI 크롤러 대응이 주목적이지만, 색인 신선도라는 부수 효과도 따라온다.

## llms.txt가 해결해준다는 이야기는 걸러 듣자

이 주제를 꺼내면 "그래서 llms.txt 깔면 되죠?"라는 반응이 자주 나온다. 나는 llms.txt를 CSR 문제의 해법으로 파는 건 방향이 틀렸다고 본다.

llms.txt는 사이트 콘텐츠를 마크다운으로 요약해 크롤러에게 제공하자는 커뮤니티 제안이다. 아이디어 자체는 나쁘지 않다. 문제는 현실이다. Google은 공식적으로 지원하지 않는다고 못박았고(2025년 7월 Search Central Live, Gary Illyes), John Mueller는 이걸 이미 10년 넘게 무시당해온 keywords 메타 태그에 비유했다. 사이트 운영자가 "우리 사이트는 이런 내용입니다"라고 스스로 주장하는 파일이라 조작에 취약하다는 논리다. 어느 주요 AI 서비스도 이 파일을 추론에 쓴다고 공식 확인한 곳이 없다. 채택률은 30만 도메인 조사에서 10% 남짓, 유효한 llms.txt의 97%가 2026년 5월 한 달간 아무 요청도 못 받았다는 집계도 있다(참고값, 공식 아님).

정리하면, AI 크롤러가 못 읽는 근본 원인은 "요약 파일이 없어서"가 아니라 "본문이 JS 뒤에 숨어서"다. 원인을 두고 우회로부터 까는 셈이다. AI 크롤러 접근 자체를 어떻게 통제할지는 [robots.txt로 AI 크롤러를 제어하는 전략](/ko/blog/ko/ai-crawler-control-robots-txt-llms-txt-2026/)에서 따로 다뤘으니, 허용·차단 정책은 그쪽을 참고하면 된다. 다만 "인용되게 하기"의 1번은 언제나 서버사이드 가시성이다.

## 정직하게 남기는 한계

두 가지는 분명히 해두고 싶다.

먼저 이번 실험은 curl로 <strong>비렌더링 페치를 재현</strong>한 것이지, 실제 GPTBot 트래픽을 포착한 게 아니다. 다만 재현하려던 메커니즘, 즉 "JS를 실행하지 않는다"는 이들 크롤러의 문서화된 동작 그 자체라, 결과의 방향은 신뢰할 만하다.

둘째, 더 중요한 한계다. <strong>SSR로 보이게 만든다고 인용이나 순위가 보장되지는 않는다.</strong> 가시성은 필요조건이지 충분조건이 아니다. 크롤러가 읽을 수 있게 된 다음에 콘텐츠 품질, 신뢰도, 구조화 데이터가 작동한다. Google이 구조화 데이터에 대해 "순위를 보장하지 않는다"고 반복해서 밝히는 것과 같은 맥락이다. 이 글이 약속하는 건 딱 여기까지다. 안 보이던 걸 보이게 만드는 것. 그다음은 콘텐츠의 몫이다.

내 결론은 단순하다. AI 검색을 진지하게 신경 쓴다면, 화려한 GEO 기법을 얹기 전에 `curl -A "GPTBot"` 한 줄부터 돌려봐라. 당신의 핵심 문구가 거기 없으면, 나머지 최적화는 전부 빈 페이지 위에 짓는 것이다.

---

구조화 데이터를 서버사이드로 확실히 내보내거나, 기존 SPA·헤드리스 구성이 AI 검색과 크롤러에 제대로 노출되는지 점검하고 싶다면 개인적으로 상담·구현 의뢰를 받는다. 프로필의 문의 경로로 편하게 연락 주면 된다.
