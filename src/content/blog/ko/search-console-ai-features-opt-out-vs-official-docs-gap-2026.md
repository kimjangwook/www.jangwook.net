---
title: 'AI 검색에서 사이트를 빼는 스위치를 공식 문서에서 찾아봤더니 있는 건 포함 레버뿐이었다'
description: 'Google Search Central의 AI 기능 문서와 Preferred Source 문서를 원문 대조하고 자사 배포본까지 18런에 걸쳐 프로브했다. AI Overviews와 AI Mode 전용 배타 스위치는 존재하지 않았고 있는 것은 일반 검색 스니펫 통제 넷뿐이었다.'
pubDate: '2026-08-21'
heroImage: '../../../assets/blog/search-console-ai-features-opt-out-vs-official-docs-gap-2026/hero.png'
tags:
  - search-console
  - ai-overviews
  - robots-txt
  - seo
  - google-search-central
relatedPosts:
  - slug: robots-snippet-controls-ai-overviews-2026
    score: 0.88
    reason:
      ko: 스니펫 통제 넷이 AI Overviews에 어떻게 작동하는지를 다룬 글. "배타 레버가 없다"는 결론의 근거를 더 깊이 검증하고 싶다면 먼저 읽을 만하다.
      ja: スニペット制御4種がAI Overviewsに実際どう作用するかを扱った記事。本記事の「除外レバーは存在しない」という結論の根拠をさらに検証したいなら先に読む価値がある。
      en: Covers how the four snippet controls actually behave inside AI Overviews. Good prior reading if you want to dig deeper into why this piece concludes there is no exclusion lever.
      zh: 讲解四种摘要控制在AI Overviews中的实际作用。若想进一步验证本文"没有排除杠杆"这一结论的依据，值得先读这篇。
  - slug: ai-crawler-control-robots-txt-llms-txt-2026
    score: 0.81
    reason:
      ko: Google-Extended를 포함한 AI 크롤러 통제 전반을 다룬다. 학습 배타와 검색 AI 배타를 가르는 구분을 더 넓은 크롤러 지형에서 확인할 수 있다.
      ja: Google-Extendedを含むAIクローラー制御全般を扱う。学習除外と検索AI除外を分けるという本記事の核心的区分を、より広いクローラー地形の中で確認できる。
      en: Covers AI crawler controls broadly, including Google-Extended. Lets you see this piece's core distinction between training exclusion and search-AI exclusion play out across a wider crawler landscape.
      zh: 广泛涵盖包括Google-Extended在内的AI爬虫控制。可以在更广的爬虫格局中验证本文将训练排除与搜索AI排除区分开的核心论点。
  - slug: official-geo-subtraction-gsc-control-2026
    score: 0.79
    reason:
      ko: 공식 문서가 적어 둔 제어 지점과 실제 배포 사이의 간격을 다룬 전작. 같은 방법론(문서 원문 카운트 + 배포본 프로브)을 다른 대상에 적용했다.
      ja: 公式文書に記された制御点と実際の配信との差を扱った前作。同じ方法論（文書原文カウント＋配信プローブ）を別の対象に適用した。
      en: A companion piece on the gap between the control points official docs describe and what actually ships. Applies the same method — counting doc text plus probing the live deployment — to a different target.
      zh: 姊妹篇，讨论官方文档所写的控制点与实际交付之间的差距，将同样的方法论（文档原文计数+部署探测）应用于不同对象。
---

법무팀이나 홍보팀에서 "우리 콘텐츠가 AI 검색에 쓰이지 않게 해달라"는 요청이 내려왔을 때 Google Search Console이나 Search Central 공식 문서 어디에 배타 스위치가 있는지 확인하고 싶었다. Google Search Central의 AI 기능 문서, Preferred Source 문서, robots.txt 관련 규격 문서를 원문 그대로 열어 배타와 포함 어휘를 전수로 세고 자사 배포본까지 18런에 걸쳐 프로브했다. 결과는 명확했다. AI Overviews나 AI Mode 전용 배타 스위치는 존재하지 않았다. 있는 것은 일반 검색의 스니펫 통제 넷을 그대로 가져다 쓰는 길뿐이었다.

판독 결과가 중요한 이유는 단순하다. 배타 스위치가 없다는 것은 실제 검색 스니펫 노출을 포기해야 하는 사업 결정이라는 뜻이다. AI 표면에서만 빠지고 일반 검색 노출은 유지하는 조합이 문서상 존재하지 않으므로 "AI에서 빼겠다"는 요구는 곧 검색 유입을 얼마나 포기할지 정하는 문제로 바뀐다. 이 구조를 모른 채 robots.txt에 크롤러 하나를 막아 놓고 요구를 처리했다고 보고하는 팀이 지금도 많다.

## "AI에서 빼달라"는 티켓 실제로 무엇을 끄고 있나

대규모 웹 리뉴얼 현장에서 AI 배타 요구는 늘 같은 모양으로 온다. 법무나 홍보가 "AI에 우리 콘텐츠가 쓰이지 않게 해달라"고 하면 엔지니어는 십중팔구 robots.txt를 연다. Google-Extended를 Disallow하고 Content-Signal 지시자에 `ai-train=no`를 적은 뒤 완료 보고를 올린다.

자사 배포본이 정확히 이 상태였다. robots.txt를 열어보니 Google-Extended를 막는 그룹 두 개와 `Content-Signal: search=yes,ai-train=no,use=reference` 한 줄, GPTBot과 CCBot을 막는 지시자가 각각 두 개씩 있었다. sitemap-ko.xml에서 뽑은 결정적 표본 12개 URL의 렌더 결과를 확인하니 robots나 googlebot용 메타 태그를 내보내는 URL이 하나도 없었다. 학습만 막았다. 검색 AI 표면은 그대로였다.

문제는 요구와 구현이 같은 "AI"라는 단어를 썼다는 데 있다. 요구는 "AI에서 빼라"였고 구현은 "학습에서 뺐다"였다. Google 공식 문서도 이 둘을 갈라둔다.

> Google-Extended does not impact a site's inclusion in Google Search nor is it used as a ranking signal in Google Search.
> - [Google crawlers and fetchers - Google-Extended](https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers)

Google-Extended를 막아도 검색 결과 포함 여부나 랭킹에는 영향이 없다고 문서가 못 박는다. 법무팀이 원한 것이 검색 AI 표면에서의 배제였다면 robots.txt 작업은 요구를 충족시키지 못한 채 티켓만 닫은 셈이다. CDP나 DSR에서 데이터 삭제 요청을 처리할 때와 구조가 같다. 요구 범위와 구현 범위가 다른데 "완료"의 정의가 없으면 "했다"와 "됐다"가 조용히 갈라진다.

## 왜 별도 스위치가 없나 - 자격 판정이 하나이기 때문

AI 기능 문서 원문을 열어 전수로 세어보니 새로운 사실이 나왔다. `opt out`, `opt-out`, `exclude` 세 어휘가 문서 원문 HTML(177,842바이트) 전체에서 0건이었다. 단순히 빠뜨린 것일 수도 있어 자격 판정 구조부터 다시 짚어봤다.

Search Central 문서는 AI Overviews나 AI Mode에서 인용되는 자격을 별도 파이프라인으로 정의하지 않는다.

> To be eligible to be shown as a supporting link in AI Overviews or AI Mode, a page must be indexed and eligible to be shown in Google Search with a snippet, fulfilling the Search technical requirements.
> - [AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)

"색인돼 있고 스니펫과 함께 표시될 자격이 있는가"라는 기존 검색 자격 판정을 그대로 재사용한다. 포함 조건을 공유하니 배타 조건도 같은 판정을 뒤집는 방식일 수밖에 없다. AI 전용 배타 다이얼을 만들려면 먼저 자격 판정 자체를 검색용과 AI용으로 갈라야 하는데 갈려 있지 않으니 다이얼이 생길 자리가 없다. 문서가 게을러서 빈 게 아니다. 아키텍처가 채울 수 없게 만든 빈칸이다. 문서는 그 대신 넷을 지목한다.

> To limit the information shown from your pages in Search, use nosnippet, data-nosnippet, max-snippet, or noindex controls.
> - [AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)

`nosnippet`은 페이지 전체의 스니펫 노출을 끄는 메타 태그, `data-nosnippet`은 페이지 안 특정 HTML 요소만 스니펫에서 제외하는 속성, `max-snippet`은 스니펫에 노출할 최대 글자 수를 지정하는 태그, `noindex`는 색인 자체를 막는 태그다. 넷 다 AI 전용 도구가 아니다. 원래 있던 일반 검색 스니펫 통제를 그대로 쓴다. AI가 Search에 내장돼 있으므로 통제 지점도 하나라는 것이 공식 문서의 논리다.

> AI is built into Search and integral to how Search functions, which is why robots.txt directives for Googlebot is the control for site owners to manage access to how their sites are crawled for Search.
> - [AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)

포함 방향은 정반대로 가볍다. 문서는 새로 만들 것이 없다고 명시한다.

> You don't need to create new machine readable files, AI text files, or markup to appear in these features.
> - [AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)

## 넷으로 충분하다는 반대는 어디까지 맞을까

이 결론에 나올 수 있는 반박은 이렇다. "배타 레버가 따로 없는 게 아니라 필요 없는 것이다. 기존 넷이 이미 충분히 정밀하다." 이 반론은 절반은 옳다.

`data-nosnippet`은 요소 단위로 걸린다. 뺄 수 있는 것은 유료 본문의 특정 문단, 회원 전용 요약, 인용되면 곤란한 문장 하나 정도다. `max-snippet`도 글자 수 단위로 세밀하게 조절할 수 있다. 페이지 전체를 죽이는 `noindex`나 `nosnippet`만 있었다면 "도구가 너무 거칠다"는 반박이 가능했겠지만 요소 단위 도구가 이미 있는 상황에서 "더 정밀한 AI 전용 스위치가 필요하다"고 주장하기는 어렵다. 반대가 옳은 범위는 명확하다. 페이지의 일부만 빼고 싶은 경우 `data-nosnippet`은 작동하는 정밀 도구이고 손실도 그 요소에 국한된다.

반대가 무너지는 지점은 하나다. "AI 표면에서만 빠지고 일반 검색 스니펫은 유지"하는 조합은 네 가지 제어 수단의 어떤 조합으로도 만들 수 없다. `data-nosnippet`을 걸면 지정한 요소는 일반 검색 스니펫에서도 AI Overviews의 근거 문장에서도 동시에 빠진다. AI만 겨냥해서 끄는 다이얼은 애초에 설계해 두지 않았다. 넷으로 충분하다는 주장은 "부분 배제"에는 맞고 "전면적인 AI만 배제"에는 성립하지 않는다. AI가 Search의 일부인 이상 "검색에는 남기고 AI에서만 뺀다"는 조합은 설계 층위에서 불가능하기 때문이다.

## 포함과 배타 문서가 대접하는 무게가 다르다

발표문과 개발자 문서를 포함과 배타 두 방향으로 나눠 세어보면 비대칭이 숫자로 드러난다. Google이 2026년 8월 20일 게시한 발표문(Mrinalini Loew, Google Search Ecosystem 총괄 명의)은 Preferred Source 도입을 알렸다.

> Readers more easily find their favorite publications in Top Stories, AI Overviews, and AI Mode, while publishers gain a more seamless way to connect with readers across Google. So far, people have already selected more than 600,000 unique sources.
> - [A more personalized Search, Discover and News](https://blog.google/products-and-platforms/products/search/personalize-search-discover-news/)

발표문 본문(9,045바이트)의 어휘를 전수로 세어보면 `preferred source` 7건, `publisher` 8건이 나오는데 `turn off`, `exclude`, `remove`, `block`은 전부 0건이다. `opt out`은 1건 있지만 뉴스레터 구독 해지 문구("You may opt out at any time.")일 뿐 검색 배타와는 무관하다. 발표문은 퍼블리셔를 Search Console이 아니라 별도 개발자 문서로 안내한다.

> If you're a publisher, you can find the new "Preferred Source" button code in our Google Search Central documentation to get started.
> - [A more personalized Search, Discover and News](https://blog.google/products-and-platforms/products/search/personalize-search-discover-news/)

전용 문서는 발표와 같은 날 갱신됐다.

> In AI Mode and AI Overviews, your content can be highlighted with a "preferred" badge for users who have selected your site as a preferred source.
> - [Preferred sources](https://developers.google.com/search/docs/appearance/preferred-sources)

`preferred-sources` 문서의 갱신 표기는 2026-08-20 UTC다. 배타 레버를 다루는 AI 기능 문서의 갱신 표기는 2025-12-10 UTC로 8개월 넘게 멈춰 있다. 포함 쪽은 발표와 동시에 전용 문서와 버튼 코드가 나왔고 배타 쪽은 한 문장짜리 언급에 8개월째 손이 가지 않았다. 이 정지가 배타 정책을 확정 지은 결과인지 단순히 문서 갱신 배포가 밀린 것인지는 갱신 이력만으로 가릴 근거가 없다. 다만 공개된 텍스트가 어느 방향으로 쏠려 있는지는 갱신 이력만으로도 드러난다.

## 18런에 걸쳐 직접 확인한 것

주장을 확인 없이 옮기지 않으려고 여섯 개 셀에 각 세 번씩 18런으로 원문과 배포본을 직접 프로브했다. 18런이 확인한 것은 문서 원문의 어휘 분포와 자사 배포본의 상태다. Google-Extended의 경계 자체를 검증한 것이 아니라 자사 배포본의 건강 상태를 점검한 것에 가깝다. 모든 요청이 exit 0과 HTTP 200으로 정상 응답했고 수신 바이트 수도 사전 기준치와 전부 일치해 봇 차단 페이지를 받은 적은 한 번도 없었다.

자사 sitemap에서 표본을 뽑아 실제 배포 결과도 확인했다. sitemap-ko.xml(71,340바이트, 총 URL 351개)에서 표본 12개를 뽑아 각 페이지의 HTML을 렌더링한 뒤 robots와 googlebot 메타 태그 착지 개수를 셌다. 결과는 12개 URL 전부 메타 태그가 비어 있었다. 표본이 12개로 작으니 표본을 늘리면 이 결과가 움직일 여지는 남아 있다. 공식 문서가 지목한 넷(nosnippet, data-nosnippet, max-snippet, noindex) 중 실제로 배포본에 걸려 있는 것이 하나도 없었다는 뜻이다.

여기서 결론을 성급하게 굳히지 않으려고 "Google-Extended가 검색 AI 기능까지 덮는다"는 가설을 무너뜨릴 수 있는지도 별도로 시험해봤다. 가설이 틀렸다는 증거는 나오지 않았다. 전제는 살아남았다. 자사 robots.txt를 확인해보니 켜져 있는 것은 학습 차단(Google-Extended, GPTBot, CCBot 관련 지시자)뿐이었고 검색 AI 스니펫 계열 지시자는 켜져 있지 않았다.

구현 비용은 양쪽 다 설정 수준이라 사실상 0이다. 문제는 배타를 켰을 때의 검색 유입 손실 폭을 알 수 없다는 점이다. 사이트와 페이지군마다 다르고 Google이 공식 수치를 내지 않는다. AI 표면 인용이 유입에 얼마나 기여하는지도 미지수다. 발표문이 낸 유일한 규모 수치는 사용자가 선택한 고유 소스 수 60만 건 이상인데 사용자 쪽 선택 수일 뿐 퍼블리셔가 얻는 효과 수치가 아니다.

## 팀에 안착시키려면 무엇을 바꿔야 하나

결과를 개인 지식으로 남기지 않으려면 팀 프로세스에 규칙 네 가지를 세워야 한다.

첫째, 정책 문서에서 "AI 배타"와 "학습 배타"를 다른 항목으로 분리한다. 전자는 검색 스니펫 예산을 쓰는 사업 결정이고 후자는 크롤러 토큰 하나만 건드리는 기술 결정이라고 명시한다. 두 요구가 같은 티켓에 섞여 들어오는 것을 막는 최소한의 장치다.

둘째, robots.txt 파일만 읽고 완료로 치는 체크를 버린다. 대신 sitemap에서 표본을 뽑아 각 URL의 렌더 결과에서 robots와 googlebot 메타 태그 착지 개수를 세는 린터를 CI 게이트에 넣는다. sitemap 표본 프로브가 이 린터의 최소 형태다.

셋째, 배타 레버를 켜는 PR는 대상 페이지군의 오가닉 유입 비중을 본문에 적어야만 통과시킨다.

넷째, "AI 크롤러 차단"이라는 표현 자체를 금지어로 지정한다. 대신 "Google-Extended 학습 차단"처럼 크롤러 토큰과 표면 이름을 항상 붙여 쓴다.

## CTO가 먼저 물어야 할 질문의 순서

포함과 배타의 단가는 대칭이 아니다. 이 전제 위에서 경영 판단의 순서를 뒤집어야 한다. "AI에서 뺄까"를 먼저 묻지 말고 "이 페이지군의 매출이 검색 스니펫 노출에 얼마나 걸려 있는가"를 먼저 재야 한다. 그 수치 없이 내려온 배타 지시는 비용을 모른 채 지불하는 결정이다. 자사 robots.txt도 학습 차단 지시자만 켜져 있었다. 방치된 것은 기술 문제가 아니라 이 지시가 얼마짜리인지 아무도 계산해보지 않았기 때문이다. 학습 배타와 검색 AI 배타를 한 단어로 부르는 습관이 남아 있는 한 팀 규모가 커지고 요청 경로가 늘어날수록 같은 실수가 반복된다. 용어를 가르는 일은 리스크 관리다. 문서 정리가 아니다.

이 판단 순서를 세운 뒤라면 권하는 방향은 사실상 정해져 있다. 유료 기사나 리서치 리포트, 독점 데이터베이스처럼 콘텐츠 자체가 상품인 팀을 생각해보면 답이 빠르다. 이런 팀에서는 `data-nosnippet`을 요소 단위로 걸고 대상 페이지군의 오가닉 유입 감소를 미리 예산에 반영하는 쪽이 합리적이다. 스니펫이 곧 상품 미리보기이므로 일부를 죽여도 손실을 계산하고 감당할 수 있다. B2B 서비스나 커머스, 기업 사이트는 셈법이 정반대다. 검색 유입이 리드 소스인 이런 팀에서는 스니펫 하나를 잃는 손실이 곧바로 매출 손실이고 그 대가로 얻는 것이 "AI에 안 쓰였다"는 심리적 안도뿐이라면 교환이 성립하지 않는다. 배타 레버는 건드리지 않는 것을 표준으로 박고 Preferred Source 버튼과 스니펫 자격 유지 쪽에만 손을 대는 편이 맞다. 다만 Google이 검색 AI 표면의 자격 판정을 일반 검색과 분리하는 순간에는 지금 세운 기준 전체를 다시 그려야 한다.

로그인 뒤에 있는 Search Console 화면 자체에 AI 기능 관련 칸이 있는지는 이번에 세지 못했다. 발표문이 퍼블리셔를 Search Console이 아니라 Search Central 문서로 보낸 것으로 미루어 짐작만 할 뿐 화면을 직접 열어 확인하기 전까지는 부재로 단정하지 않는다.

## 참고 자료

- [A more personalized Search, Discover and News](https://blog.google/products-and-platforms/products/search/personalize-search-discover-news/)
- [AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)
- [Preferred sources](https://developers.google.com/search/docs/appearance/preferred-sources)
- [Google crawlers and fetchers - Google-Extended](https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers)
- [Robots meta tag, data-nosnippet, and X-Robots-Tag specifications](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag)
