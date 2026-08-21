---
title: 'AI 검색에서 사이트를 빼는 스위치를 공식 문서에서 찾아봤더니 있는 건 포함 레버뿐이었다'
description: 'Google의 AI 기능 문서 원문 177,842바이트에서 opt out, opt-out, exclude를 전수로 세어보니 전부 0건이었다. AI Overviews와 AI Mode 전용 배타 레버가 왜 없는지, robots.txt 대신 무엇을 손봐야 하는지 18런 실측으로 정리했다.'
pubDate: '2026-08-21'
heroImage: '../../../assets/blog/search-console-ai-features-opt-out-vs-official-docs-gap-2026/hero.png'
tags:
  - SEO
  - GEO
  - AI Overview
  - 엔지니어링 매니지먼트
relatedPosts:
  - slug: robots-snippet-controls-ai-overviews-2026
    score: 0.86
    reason:
      ko: 그 글이 nosnippet 계열 네 레버가 실제로 어떻게 착지하는지를 페이지 단위로 실측한 기록이라면, 이 글은 그 네 레버 말고는 아무것도 없다는 사실이 왜 문서의 누락이 아니라 설계의 결과인지를 다룬다.
      ja: あちらが nosnippet 系の四つのレバーがページ単位でどう着地するかの実測記録なら、こちらはその四つ以外に何も無いことが文書の抜けではなく設計の結果である理由を扱う。
      en: That post measures how the four nosnippet-family levers actually land on a page. This one explains why there is nothing besides those four, and why that absence is a design outcome rather than a documentation gap.
      zh: 那篇是对 nosnippet 系四个开关在页面上如何落地的实测记录；这篇则解释为什么除了这四个什么都没有，以及这种缺席为何是设计结果而非文档遗漏。
  - slug: ai-crawler-control-robots-txt-llms-txt-2026
    score: 0.81
    reason:
      ko: robots.txt로 학습을 막는 일과 검색면 AI 인용에서 빠지는 일은 다른 결정이다. 그 글이 크롤러 토큰 쪽 지도라면, 이 글은 그 지도를 들고 잘못된 티켓을 닫아 온 팀에게 보내는 정정이다.
      ja: robots.txt で学習を止めることと、検索面のAI引用から外れることは別の決定だ。あちらがクローラートークン側の地図なら、こちらはその地図を手に誤ったチケットを閉じてきたチームへの訂正になる。
      en: Blocking training via robots.txt and dropping out of AI citations in Search are different decisions. That post maps the crawler-token side; this one is the correction for teams who have been closing the wrong ticket with that map in hand.
      zh: 用 robots.txt 拦训练，和从搜索面的 AI 引用中消失，是两个不同的决定。那篇画的是爬虫令牌那一侧的地图，这篇是写给拿着那张地图关错工单的团队的更正。
  - slug: official-geo-subtraction-gsc-control-2026
    score: 0.75
    reason:
      ko: 선언한 robots.txt와 실제 배포본이 어긋나 있던 그 경험이 이 글의 CI 게이트 제안으로 이어졌다. 파일을 읽는 검사와 렌더 결과를 세는 검사는 다른 것을 본다.
      ja: 宣言した robots.txt と実際の配信物がずれていたあの経験が、この記事の CI ゲート提案につながっている。ファイルを読む検査とレンダー結果を数える検査は別のものを見ている。
      en: The gap between a declared robots.txt and what actually shipped is what led to the CI gate proposed here. Reading a file and counting rendered output are two different inspections.
      zh: 声明的 robots.txt 与实际部署物之间的偏差，正是本文提出 CI 门禁的由来。读文件的检查和数渲染结果的检查，看的是两样东西。
---

법무팀이나 홍보팀에서 "우리 콘텐츠가 AI 검색에 쓰이지 않게 해달라"는 요청이 내려왔을 때 Google Search Console이나 Search Central 공식 문서 어디에 배타 스위치가 있는지 확인하고 싶었다. Google Search Central의 AI 기능 문서, Google-Extended를 다루는 크롤러 문서, Preferred Source 도입 발표문을 원문 그대로 열어 배타와 포함 어휘를 전수로 세고 자사 배포본까지 18런에 걸쳐 프로브했다. 결과는 명확했다. AI Overviews나 AI Mode 전용 배타 스위치는 존재하지 않았다. 있는 것은 일반 검색의 스니펫 통제 넷을 그대로 가져다 쓰는 길뿐이었다.

판독 결과가 중요한 이유는 단순하다. 배타 스위치가 없다는 것은 실제 검색 스니펫 노출을 포기해야 하는 사업 결정이라는 뜻이다. AI 표면에서만 빠지고 일반 검색 노출은 유지하는 조합이 문서상 존재하지 않으므로 "AI에서 빼겠다"는 요구는 곧 검색 유입을 얼마나 포기할지 정하는 문제로 바뀐다. 이 구조를 모른 채 robots.txt에 크롤러 하나를 막아 놓고 요구를 처리했다고 보고하는 팀이 지금도 많다.

## "AI에서 빼달라"는 티켓은 실제로 무엇을 끄고 있나

대규모 웹 리뉴얼 현장에서 AI 배타 요구는 늘 같은 모양으로 온다. 법무나 홍보가 "AI에 우리 콘텐츠가 쓰이지 않게 해달라"고 하면 엔지니어는 십중팔구 robots.txt를 연다. Google-Extended를 Disallow하고 Content-Signal 지시자에 `ai-train=no`를 적은 뒤 완료 보고를 올린다. 크롤러 토큰 단위로 [학습은 막고 인용은 허용하는 설계](/ko/blog/ko/ai-crawler-control-robots-txt-llms-txt-2026) 자체는 유효하다. 다만 그 설계가 답하는 질문은 이 티켓이 던진 질문과 다르다.

자사 배포본이 정확히 이 상태였다. robots.txt를 열어보니 Google-Extended를 막는 그룹 두 개와 `Content-Signal: search=yes,ai-train=no,use=reference` 한 줄, GPTBot과 CCBot을 막는 지시자가 각각 두 개씩 있었다. sitemap-ko.xml에서 뽑은 결정적 표본 12개 URL의 렌더 결과를 확인하니 robots나 googlebot용 메타 태그를 내보내는 URL이 하나도 없었다. 학습만 막았다. 검색 AI 표면은 그대로였다.

문제는 요구와 구현이 같은 "AI"라는 단어를 썼다는 데 있다. 요구는 "AI에서 빼라"였고 구현은 "학습에서 뺐다"였다. Google 공식 문서도 이 둘을 갈라둔다.

> Google-Extended does not impact a site's inclusion in Google Search nor is it used as a ranking signal in Google Search.
> - [Google crawlers and fetchers - Google-Extended](https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers)

Google-Extended를 막아도 검색 결과 포함 여부나 랭킹에는 영향이 없다고 문서가 못 박는다. 그 문서의 어휘 분포가 이 토큰이 관할하는 영역을 그대로 보여준다. Google-Extended 6회, Gemini 4회, Vertex 8회가 나오는데 `AI Overviews`는 0회, `AI Mode`도 0회다. 토큰이 다루는 것은 Gemini와 Vertex 쪽 모델 학습과 그라운딩이고 검색면의 두 기능은 이 문서의 어휘 안에 아예 없다.

법무팀이 원한 것이 검색 AI 표면에서의 배제였다면 robots.txt 작업은 요구를 충족시키지 못한 채 티켓만 닫은 셈이다. CDP나 DSR에서 데이터 삭제 요청을 처리할 때와 구조가 같다. 요구 범위와 구현 범위가 다른데 "완료"의 정의가 없으면 "했다"와 "됐다"가 조용히 갈라진다. 아무도 거짓말하지 않았다. 리뷰어는 실재하는 파일을 열어 실재하는 지시자를 봤을 뿐이다.

## 왜 별도 스위치가 없나 - 자격 판정이 하나이기 때문

AI 기능 문서 원문을 열어 전수로 세어보니 새로운 사실이 나왔다. `opt out`, `opt-out`, `exclude` 세 어휘가 문서 원문 HTML(177,842바이트) 전체에서 0건이었다. 단순히 빠뜨린 것일 수도 있어 자격 판정 구조부터 다시 짚어봤다.

Search Central 문서는 AI Overviews나 AI Mode에서 인용되는 자격을 별도 파이프라인으로 정의하지 않는다.

> To be eligible to be shown as a supporting link in AI Overviews or AI Mode, a page must be indexed and eligible to be shown in Google Search with a snippet, fulfilling the Search technical requirements.
> - [AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)

"색인돼 있고 스니펫과 함께 표시될 자격이 있는가"라는 기존 검색 자격 판정을 그대로 재사용한다. 포함 조건을 공유하니 배타 조건도 같은 판정을 뒤집는 방식이 된다. AI 전용 배타 다이얼을 만들려면 먼저 자격 판정 자체를 검색용과 AI용으로 갈라야 하는데 갈려 있지 않으니 다이얼이 생길 자리가 없다.

여기서 내 표현 하나를 짚어두고 싶다. 이 공유 판정을 "게이트 하나"라고 부르는 것은 내가 종합해 붙인 말이지 Google이 쓴 표현이 아니다. 문서에 적힌 말은 "fulfilling the Search technical requirements"까지다. 나는 그 한 문장에서 판정이 하나로 묶여 있다고 읽었고, 나중에 Google이 원래부터 두 갈래였다고 문서화한다면 플랫폼이 바뀐 것이 아니라 내 판독이 틀렸던 것이 된다. 문서가 게을러서 빈칸이 남았다고는 보지 않는다. 아키텍처가 채울 수 없게 만든 빈칸에 가깝다. 문서는 그 대신 넷을 지목한다.

> To limit the information shown from your pages in Search, use nosnippet, data-nosnippet, max-snippet, or noindex controls.
> - [AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)

`nosnippet`은 페이지 전체의 스니펫 노출을 끄는 메타 태그, `data-nosnippet`은 페이지 안 특정 HTML 요소만 스니펫에서 제외하는 속성, `max-snippet`은 스니펫에 노출할 최대 글자 수를 지정하는 태그, `noindex`는 색인 자체를 막는 태그다. 넷 다 AI 전용 도구가 아니다. 원래 있던 일반 검색 스니펫 통제를 그대로 쓴다. AI가 Search에 내장돼 있으므로 통제 지점도 하나라는 것이 공식 문서의 논리다. 이 넷이 페이지 단위에서 실제로 어떻게 착지하는지는 [robots 스니펫 지시자를 페이지마다 실측한 기록](/ko/blog/ko/robots-snippet-controls-ai-overviews-2026)에 따로 정리해뒀다.

> AI is built into Search and integral to how Search functions, which is why robots.txt directives for Googlebot is the control for site owners to manage access to how their sites are crawled for Search.
> - [AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)

AI Overviews를 피하려고 Googlebot을 막는다는 것은 검색 자체에서 나간다는 뜻이다. 가격표가 문장 하나에 그대로 적혀 있다.

포함 방향은 정반대로 가볍다. 문서는 새로 만들 것이 없다고 명시한다.

> You don't need to create new machine readable files, AI text files, or markup to appear in these features.
> - [AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)

## 넷으로 충분하다는 반대는 어디까지 맞을까

이 결론에 나올 수 있는 가장 진지한 반박은 이렇다. "배타 레버가 따로 없는 게 아니라 필요 없는 것이다. 기존 넷이 이미 충분히 정밀하다."

콘텐츠 입도만 놓고 보면 이 반대가 맞다. 약하게 되받지 않고 그대로 인정한다. `data-nosnippet`은 요소 단위로 걸린다. 문단 하나, 뽑아 쓴 인용구 하나, 가격표 하나를 감쌀 수 있다. `max-snippet`은 글자 수 단위로 조절된다. 도구가 `noindex`와 페이지 단위 `nosnippet`뿐이었다면 "계기가 너무 거칠다"는 비판이 성립했겠지만 성립하지 않는다. 계기는 충분히 잘게 나뉘어 있고 나는 거칠다는 논거를 더 쓰지 않기로 했다.

반대가 무너지는 지점은 축이 다르다. 정밀도가 답하는 것은 "무엇을 지울까"이지 "어느 표면에서 사라질까"가 아니다. 문단 하나에 `data-nosnippet`을 걸면 그 문단은 AI Overviews에서도, AI Mode에서도, 일반 검색 스니펫에서도 동시에 사라진다. 레버에 표면 파라미터가 없다. 검색에는 남고 AI에서만 빠지겠다는 퍼블리셔는 더 정밀한 도구를 요구하는 게 아니다. API에 없는 축을 요구하는 것이다.

반대가 잘 건너뛰는 비용도 하나 더 있다. 요소 단위 정밀도는 조건 분기가 가능한 템플릿을 전제로 한다. 공통 템플릿으로 양산된 사이트는 누가 분기를 먼저 만들어 두지 않으면 선택 적용 자체가 안 된다. 그런 사이트에서 정직한 견적은 마크업 한 줄이 아니라 템플릿 개조 다음의 마크업 한 줄이다.

그래서 반대가 옳은 범위는 인정하고 입장은 유지한다. 페이지 안에서라면 도구는 충분하다. 표면 사이에는 아무것도 없고 사람들이 실제로 요구하는 제어가 바로 표면을 가르는 축이다.

## 포함과 배타 문서가 대접하는 무게가 다르다

발표문과 개발자 문서를 포함과 배타 두 방향으로 나눠 세어보면 비대칭이 숫자로 드러난다. Google이 2026년 8월 20일 게시한 발표문(Mrinalini Loew, Google Search Ecosystem 총괄 명의)은 Preferred Source 도입을 알렸다.

> Readers more easily find their favorite publications in Top Stories, AI Overviews, and AI Mode, while publishers gain a more seamless way to connect with readers across Google. So far, people have already selected more than 600,000 unique sources.
> - [A more personalized Search, Discover and News](https://blog.google/products-and-platforms/products/search/personalize-search-discover-news/)

발표문 본문(9,045바이트)의 어휘를 전수로 세어보면 `preferred source` 7건, `publisher` 8건, `Top Stories` 1건, `AI Overviews` 1건, `AI Mode` 2건이 나오는데 `Search Console`, `turn off`, `exclude`, `remove`, `block`은 전부 0건이다. `opt out`은 1건 있지만 뉴스레터 구독 해지 문구("You may opt out at any time.")일 뿐 검색 배타와는 무관하다. 발표문은 퍼블리셔를 Search Console이 아니라 별도 개발자 문서로 안내한다.

> If you're a publisher, you can find the new "Preferred Source" button code in our Google Search Central documentation to get started.
> - [A more personalized Search, Discover and News](https://blog.google/products-and-platforms/products/search/personalize-search-discover-news/)

전용 문서는 발표와 같은 날 갱신됐다.

> In AI Mode and AI Overviews, your content can be highlighted with a "preferred" badge for users who have selected your site as a preferred source.
> - [Preferred sources](https://developers.google.com/search/docs/appearance/preferred-sources)

Preferred Source는 기본 자격에 손을 대지 않는다. 그 위에 시그널 한 겹을 얹을 뿐이라 앞서 본 구조를 그대로 뒷받침한다.

`preferred-sources` 문서의 갱신 표기는 2026-08-20 UTC다. 배타 레버를 다루는 AI 기능 문서의 갱신 표기는 2025-12-10 UTC로 8개월 넘게 멈춰 있다. 포함 쪽은 발표와 동시에 전용 문서와 버튼 코드가 나왔고 배타 쪽은 한 문장짜리 언급에 8개월째 손이 가지 않았다. 이 정지가 배타 정책을 확정 지은 결과인지 단순히 문서 갱신 배포가 밀린 것인지는 갱신 이력만으로 가릴 근거가 없다. 다만 공개된 텍스트가 어느 방향으로 쏠려 있는지는 갱신 이력만으로도 드러난다.

또 하나. 60만 건은 사용자가 고른 고유 소스 수다. 퍼블리셔가 얻는 효과를 재는 수치가 아니고 경영진 보고에 그렇게 올려서도 안 된다.

## 18런에 걸쳐 직접 확인한 것

주장을 확인 없이 옮기지 않으려고 여섯 개 셀에 각 세 번씩 18런으로 원문과 배포본을 직접 프로브했다. 18런이 확인한 것은 문서 원문의 어휘 분포와 자사 배포본의 상태다. Google-Extended의 경계 자체를 검증한 것이 아니라 자사 배포본의 건강 상태를 점검한 것에 가깝다. 모든 요청이 exit 0과 HTTP 200으로 정상 응답했고 수신 바이트 수도 사전 기준치와 전부 일치해 봇 차단 페이지를 받은 적은 한 번도 없었다.

자사 sitemap에서 표본을 뽑아 실제 배포 결과도 확인했다. sitemap-ko.xml(71,340바이트, 총 URL 351개)에서 표본 12개를 뽑아 각 페이지의 HTML을 렌더링한 뒤 robots와 googlebot 메타 태그 착지 개수를 셌다. 결과는 12개 URL 전부 메타 태그가 비어 있었다. 표본이 12개로 작으니 표본을 늘리면 이 결과가 움직일 여지는 남아 있다. 공식 문서가 지목한 넷(nosnippet, data-nosnippet, max-snippet, noindex) 중 실제로 배포본에 걸려 있는 것이 하나도 없었다는 뜻이다.

여기서 결론을 성급하게 굳히지 않으려고 "Google-Extended가 검색 AI 기능까지 덮는다"는 가설을 무너뜨릴 수 있는지도 별도 셀로 시험해봤다. 가설이 틀렸다는 증거는 나오지 않았다. 반증에 실패한 것은 확증보다 약한 결과이고 나도 그 정도로만 다룬다. 자사 robots.txt를 확인해보니 켜져 있는 것은 학습 차단뿐이었고 검색 AI 스니펫 계열 지시자는 켜져 있지 않았다. 선언한 파일과 렌더된 결과가 갈리는 지점이 여기다.

## 팀에 안착시키려면 무엇을 바꿔야 하나

결과를 개인 지식으로 남기지 않으려면 팀 프로세스에 규칙 네 가지를 세워야 한다.

첫째, 정책 문서에서 "검색면 AI 배타"와 "학습 배타"를 다른 항목으로 분리한다. 전자는 검색 스니펫 예산을 쓰는 사업 결정이고 후자는 크롤러 토큰 하나만 건드리는 기술 결정이라고 명시한다. 두 요구가 같은 티켓에 섞여 들어오는 것을 막는 최소한의 장치다.

둘째, robots.txt 파일만 읽고 완료로 치는 체크를 버린다. 대신 sitemap에서 결정적 표본을 뽑아 각 URL의 렌더 결과에서 robots와 googlebot 메타 태그 착지 개수를 세고, 선언한 정책과 렌더된 태그가 어긋나면 빌드를 멈추는 린터를 CI 게이트에 넣는다. 12개 표본 프로브가 이 린터의 최소 형태다. 파일을 읽고 확인했다고 치는 검사가 바로 그 어긋남을 살려둔 검사다. 선언한 규칙이 닿지 않아도 어느 쪽에서도 에러가 나지 않는 성질은 [robots.txt와 AGENTS.md를 219런으로 실측했을 때](/ko/blog/ko/declared-rules-fail-open-robots-txt-agents-md-2026)도 똑같았다.

셋째, 배타 레버를 켜는 PR은 대상 페이지군의 오가닉 유입 비중을 본문에 적어야만 통과시킨다. 그 숫자를 아무도 제시하지 못한다면 PR이 아직 준비되지 않은 상태다. 숫자가 곧 결정이다.

넷째, "AI 크롤러 차단"이라는 표현 자체를 사내 금지어로 지정한다. 토큰을 말하거나 표면을 말한다. 학습이면 Google-Extended, 검색 스니펫과 인용이면 `data-nosnippet`이다.

## CTO가 먼저 물어야 할 질문의 순서

포함과 배타의 단가는 대칭이 아니다. 이 전제 위에서 경영 판단의 순서를 뒤집어야 한다. "AI에서 뺄까"를 먼저 묻지 말고 "이 페이지군의 매출이 검색 스니펫 노출에 얼마나 걸려 있는가"를 먼저 재야 한다. 그 수치 없이 내려온 배타 지시는 금액을 모른 채 승인한 지불이다. 포함은 새 파일도 마크업도 필요 없어 사실상 0원이고, 배타는 스니펫이 물고 있던 오가닉 유입을 잃는데 그 폭을 Google이 공표하지 않으니 사내 분석에서만 추정이 나온다. 싼 쪽은 측정되고 비싼 쪽은 측정되지 않는다. 팀이 비싼 쪽을 싸게 어림잡는 원인이 바로 이 측정 공백이다.

자사 robots.txt도 학습 차단 지시자만 켜져 있었다. 방치된 것은 기술 문제가 아니라 이 지시가 얼마짜리인지 아무도 계산해보지 않았기 때문이다. 학습 배타와 검색 AI 배타를 한 단어로 부르는 습관이 남아 있는 한 팀 규모가 커지고 요청 경로가 늘어날수록 같은 실수가 반복된다. 용어를 가르는 일은 리스크 관리다. 문서 정리가 아니다.

이 판단 순서를 세운 뒤라면 권하는 방향은 사실상 정해져 있다. 유료 기사나 구독형 데이터베이스, 회원 전용 편집물처럼 콘텐츠 자체가 상품인 팀은 `data-nosnippet`을 요소 단위로 걸 만하다. 단 조건이 붙는다. 대상 페이지군의 오가닉 감소가 태그를 내보내기 전에 예산에 들어가 있어야지, 다음 분기 리포트에서 발견돼서는 안 된다. B2B 서비스나 커머스, 기업 사이트는 셈법이 정반대다. 검색 유입이 리드 소스인 이런 팀에서는 배타 레버를 건드리지 않는 것을 표준에 박고 Preferred Source 접속과 스니펫 자격 유지 쪽에만 손을 대는 편이 맞다.

내 결론은 이렇다. AI 전용 배타 스위치의 부재는 Google의 다음 릴리스를 기다리는 임시 상태가 아니다. 자격 판정을 공유하는 구조에서 나온 결과이고 그 판정이 갈리기 전까지 사람들이 원하는 조합은 만들어질 수 없다. 내가 틀렸음을 증명할 조건은 좁고 구체적이다. 어떤 페이지를 AI Overviews와 AI Mode에서 빼면서 일반 검색에는 스니펫과 함께 계속 노출시키는 제어 수단을 Google이 문서에 적는 일이다. 암시하는 블로그 글이 아니라 문서에 들어간 제어 수단이어야 한다.

로그인 뒤에 있는 Search Console 화면 자체에 AI 기능 관련 칸이 있는지는 이번에 세지 못했다. 발표문이 퍼블리셔를 Search Console이 아니라 Search Central 문서로 보낸 것은 정황일 뿐이고 화면을 직접 열어 확인하기 전까지는 부재로 단정하지 않는다.

어느 방향의 문서가 기능 출시 당일에 손이 가고 어느 방향이 8개월째 멈춰 있는지를 세는 일. 이 비교만으로도 어휘 분포는 플랫폼이 지금 사용자에게 무엇을 팔고 있고 무엇을 팔지 않는지를 말해준다.

## 참고 자료

- [A more personalized Search, Discover and News](https://blog.google/products-and-platforms/products/search/personalize-search-discover-news/)
- [AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)
- [Preferred sources](https://developers.google.com/search/docs/appearance/preferred-sources)
- [Google crawlers and fetchers - Google-Extended](https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers)
- [Robots meta tag, data-nosnippet, and X-Robots-Tag specifications](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag)
