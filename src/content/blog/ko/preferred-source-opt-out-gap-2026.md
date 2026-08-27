---
title: 'Preferred Source 비대칭: Google 은 포함 레버를 통째로 출시하고 배제는 한 문장에 남겨 두었다'
pubDate: '2026-08-21'
description: Google 이 2026년 preferred sources 를 출시하면서 전용 문서와 발표와 배지를 함께 내놓았다. 생성 AI
  기능에서 사이트를 빼는 공식 경로는 스니펫 제어 넷을 묶은 단 한 문장뿐이다. 문서 표면과 실제 배포본을 실측해 이 비대칭이 사이트 운영에 무엇을
  의미하는지 정리한다.
heroImage: ../../../assets/blog/preferred-source-opt-out-gap-2026/hero.png
relatedPosts:
- slug: ai-crawler-control-robots-txt-llms-txt-2026
  score: 0.7
  reason:
    en: While Google reshapes search exposure with preferred sources, the next step
      is controlling AI crawlers with robots.txt and llms.txt—blocking training while
      allowing citation.
    ko: 구글이 선호 소스로 검색 노출을 재편하는 동안, AI 크롤러까지 통제하려면 robots.txt와 llms.txt로 학습은 막고 인용은
      허용하는 전략이 이어집니다.
    ja: Googleが優先ソースで検索の露出を再編するなか、AIクローラーまで制御するにはrobots.txtとllms.txtで学習はブロックし引用は許可する戦略が続きます。
    zh: 在Google用首选来源重塑搜索曝光的同时，下一步是用robots.txt和llms.txt控制AI爬虫——阻止训练但允许引用。
- slug: declared-rules-fail-open-robots-txt-agents-md-2026
  score: 0.7
  reason:
    en: Google's preferred sources launch, shipped with only partial documentation,
      mirrors the 219-run finding that robots.txt and AGENTS.md pass silently when
      rules get truncated.
    ko: 선호 소스 기능이 문서화조차 반쪽으로 선 채 출시된 지금, 규칙이 누락돼도 조용히 통과되는 robots.txt와 AGENTS.md의
      219회 실측 결과가 그 실패 양상을 보여준다.
    ja: Googleがドキュメント付きで公開したpreferred sources機能も、ルールが欠落してもエラーなく動くrobots.txtとAGENTS.mdの219回実測が示す失敗モードと同じ構造を持つ。
    zh: Google带着文档仓促上线的preferred sources功能，正呼应了219次实测揭示的真相：robots.txt与AGENTS.md的规则即使被截断也静默通过。
---

2026년 8월 20일, Google 은 Search 의 preferred sources 를 발표했다. 사용자가 특정 사이트를 선호 소스로 선택하면 AI Mode 와 AI Overviews 에서 그 사이트 콘텐츠에 preferred 배지가 붙어 강조되는 기능이다. 발표문이 blog.google 에 같은 날 올라왔고, 개발자 문서 `developers.google.com/search/docs/appearance/preferred-sources` 도 같은 날 문서군에 들어왔다. HTTP 200, last updated 2026-08-20 UTC, 본문에 preferred source 문자열이 24건. 발표와 문서가 같은 날 갱신됐다는 점이 이 글의 출발점이다.

반대쪽 대장부는 다르게 생겼다. Google 의 생성 AI 기능에서 내 사이트를 빼고 싶을 때, 공식 지시 집합 전체가 AI features 문서 본문의 한 문장이다. `nosnippet`, `data-nosnippet`, `max-snippet`, `noindex` 넷을 묶어 이것을 쓰라고 한다. 그게 전부다. 전용 페이지 없음, 발표 없음, 배지 없음.

이 글은 그 비대칭을 실측으로 재고, 실무 결론 하나를 내놓는다. 지금 시점에 검색 노출을 유지하면서 AI Overviews 나 AI Mode 만 선택적으로 빠지는 공식 경로는 존재하지 않는다. 컴플라이언스 전제에 그런 스위치가 있다고 가정하고 있다면, 그 가정은 오늘 기준으로 틀렸다.

## 문서 표면에 실재하는 것을 센다

Google 개발자 문서를 분산 시스템의 서비스 레지스트리처럼 대한다. 배포돼서 도달 가능한 것이 진실이고, 지나가듯 언급된 것은 진실이 아니다. 사내에서 신규 기능이 실제로 출시됐는지 판단할 때 위키의 한 줄 언급이 아니라 배포된 엔드포인트 목록을 보는 것과 같은 원리다. 문서 표면도 마찬가지다. 전용 페이지가 있고 토큰이 반복 등장하면 실물이고, 다른 문장 속에 한 번 스치면 실물이 아니다.

랩은 다섯 표면을 fetch 했다. AI features 문서, robots meta tag 문서, Google-Extended 크롤러 문서, blog.google 발표문, 그리고 자사 배포본의 sitemap 과 robots.txt. 토큰을 세되, 보일러플레이트 잡음을 제거하기 위해 통제 셀을 차감했다. 6셀 × 3런, 총 18런 전부 exit 0, fetch 전부 HTTP 200, 바이트 수 기준치 일치. 모델 호출 0건의 결정적 카운팅이다.

카운트 결과가 이 표다.

| 레버 | 문서 표면 | 증거 |
|---|---|---|
| 포함 (preferred source) | 전용 페이지, HTTP 200, 2026-08-20 UTC 갱신 | 문서 본문 preferred source 24건, 좌측 내비 154 경로 중 해당 경로 존재 |
| 포함 (발표문) | blog.google, 2026-08-20 | preferred source 7건 |
| 배제 (AI features) | ai-features 문서 한 문장 | nosnippet 1 · data-nosnippet 1 · max-snippet 1 · noindex 1 (통제 셀 차감 후), opt out 0 · exclude 0 |
| Google-Extended 를 AI 배제 레버로 | google-common-crawlers 문서 | AI Overviews 0건, AI Mode 0건 |

마지막 행이 중요하다. 사이트 운영자가 가장 먼저 손이 가는 레버가 Google-Extended 이기 때문이다. 그런데 그 문서는 Google-Extended 가 Gemini 와 Vertex 그라운딩에 쓰이며 "Google 검색에 사이트가 포함되는 것에 영향을 주지 않고, 검색 랭킹 신호로도 사용되지 않는다"고 명시한다. AI features 문서는 더 나아가 AI 가 검색에 "내장되어 검색이 작동하는 방식의 일부"라고 규정하고, 그래서 검색용 크롤링 통제는 Googlebot 의 robots.txt 지시자라고 말한다. Google-Extended 만 막은 상태에서는 AI Overviews 도 AI Mode 도 건드리지 않은 것이다. Google-Extended 문서가 AI Overviews 나 AI Mode 를 지목하는지 확인하는 falsifier 검사는 부정으로 끝났다.

## 배포본 확인: 열두 URL, 지시자 0개

문서 표면과 실제 배포본은 별개다. 문서가 레버를 서술해도 배포본에 착지하지 않으면 통제는 없는 것이다. 랩은 자사 sitemap 의 351개 위치에서 결정적 표본 12 URL 을 뽑아(sitemap-ko.xml, 정렬 후 head 12, 4개 언어 동일 템플릿) HTML 원문에서 nosnippet 계열 meta 지시자를 세었다.

결과는 0/12다. 12개 URL 전부 meta 가 비어 있었다. robots meta 태그도 googlebot meta 태그도 아예 없다. 코퍼스에서 나온 유일한 nosnippet 문자열 히트는 과거 글 제목에 그 단어가 들어간 블로그 목록 카드 본문이지 meta 태그가 아니다.

이것이 문서 갭의 운영적 거울상이다. 아이러니는 배포본 robots.txt 가 배제향 라인을 실제로 갖고 있다는 점이다. Google-Extended Disallow 2행, Content-Signal: search=yes,ai-train=no,use=reference, GPTBot 2행, CCBot 2행. 배포본은 커뮤니티·벤더별 레버에 투자했는데, 그 어느 것도 Google 이 자기 AI 검색 기능의 공식 통제로 인정하는 것이 아니다. 공식 레버인 nosnippet 계열은 페이지 0개에 착지해 있다.

사이트를 운영한다면 같은 확인을 오늘 해 보라. sitemap 에서 12개 URL 을 뽑고, HTML 을 fetch 하고, meta 태그 안의 nosnippet, data-nosnippet, max-snippet 을 세면 된다. 나온 수가 이 축에서 실제로 통제하고 있는 URL 의 개수다. 대부분의 배포본에서 그 수는 0일 것이고, 그 0이라는 사실은 GPTBot 규칙이 커버한다고 미뤄둘 갭이 아니라 컴플라이언스 가정이 흡수해야 할 사실이다.

## 비대칭이 생긴 이유, 그리고 흔한 반론이 절반만 맞는 지점

가장 강한 반론은 이렇다. 빠진 레버가 아니라 의도된 설계라는 것. Google 은 AI 기능을 검색의 일부로 규정하므로, 검색에서 빠지는 것 자체가 곧 배제 레버라는 논리다. 이 독해는 규정 수준에서 옳다. 추론이 아니라 AI features 문서의 첫 문장이 그렇게 말하기 때문이다.

그러나 규정은 도구가 아니다. 정의된 정책이 실행 가능한 통제가 되려면 문서가 운영자가 구현할 수 있을 만큼 경로를 실제로 서술해야 한다. 넷을 묶은 한 문장은 그러지 못한다. 넷이 동등하지 않기 때문이다.

- `noindex` 는 페이지를 검색에서 완전히 뺀다. 완전한 배제, 완전한 비용.
- `nosnippet` 은 스니펫을 없앤다. AI features 문서에 따르면 이것은 검색이 페이지에서 보여줄 수 있는 정보를 제한한다. 즉 AI 기능에 닿는 동시에 평범한 검색 결과 노출도 깎는다.
- `data-nosnippet` 은 페이지의 조각을 표시한다. 부분 제어지만, 생성 인용과의 상호작용은 문서화된 표면 어디에도 설명돼 있지 않다.
- `max-snippet` 은 스니펫 길이를 제한한다. `max-snippet:0` 같은 조합이 AI Overviews 인용 자격과 스니펫 표시 자격을 분리할 수 있는지는 문서가 답하지 않는다. 이 랩은 문서 표면을 측정했고, 문서는 컴플라이언스를 신경 쓰는 운영자가 원하는 바로 그 조합에 대해 침묵한다.

그래서 반론은 정확한 경계까지 옳다. "검색에는 남고 스니펫 자격도 유지하되 AI Overviews 에서만 빠진다"는 선택적 배제는 문서상 실행 가능한 경로로 존재하지 않는다. 존재하는 것은 배제 레버가 검색 자산 가치까지 함께 태우는 묶음 거래다. 조직에 비유하면, 이것은 세밀한 권한 설계가 없는 시스템에서 퇴사 처리가 유일한 접근 권한 회수 수단인 상황과 같다. 부서만 옮기고 권한을 조정하는 경로가 없으니, 남아 일할 것인지 완전히 나갈 것인지 이지선다만 남는다.

비대칭의 메커니즘은 기술 난이도가 아니라 제품 방향이다. AI Overviews 와 AI Mode 는 별도 서비스가 아니라 검색의 기능으로 재분류돼 왔다. 그러니 Google 입장에서 새 배제 인터페이스를 만들 유인이 없다. 기존 검색 통제가 정의상 그 통제이기 때문이다. 반대로 preferred source 는 사용자 선택이라는 신규 표면이라, 신규 표면에 필요한 전부를 갖춰 출시했다. 발표, 전용 문서, 배지 동작, 버튼 코드. 문서에서 레버의 유무는 제품 로드맵이 남기는 발자국이다. 발표와 문서가 같은 날 배포됐다는 사실이 그 증거다. 문서는 제품의 사후 기록이 아니라 제품의 일부다.

## 어느 쪽에 공수를 둘 것인가

배제가 필요한지 여부에 따라 자세가 둘로 나뉜다.

배제가 실제로 필요한 팀 — 라이선스된 데이터 콘텐츠, 컴플라이언스 민감 소재 — 에게는 nosnippet 계열이 유일한 공식 레버고, 동시에 일반 검색의 스니펫 자격을 희생한다는 비용을 포함해 가격을 매겨야 한다. Google-Extended 를 위한 robots.txt 항목이나 Content-Signal 헤더가 Google 자체 AI 검색 기능이 인정하지 않는 통제처럼 보이게 두지 마라. 커뮤니티 레버는 학습 크롤러 상대로는 자리가 있지만, 검색의 생성 기능에 대한 공식 경로는 아니다.

배제가 필요 없는 팀 — 대부분의 발행자가 여기다 — 는 없는 옵트아웃 스위치를 찾는 공수를 끊어라. 측정 가능하고 실행 가능한 표면은 포함 쪽에 있다. preferred source 는 전용 문서 페이지와 배지 메커니즘을 갖춰 출시됐고, 발표문은 사람들이 이미 600,000개가 넘는 고유 소스를 선택했다고 밝힌다. 사이트가 그 표면에 제대로 올라와 있는지 점검하고, 어떤 URL 이 애초에 스니펫 자격이 있는지 감사하라. 현재 설계에서는 스니펫 자격이 평범한 검색 표시와 AI 인용이 함께 뽑아 쓰는 기반 재료이기 때문이다.

감사 자체는 싸고 결정적이다. 컴플라이언스 함의는 그렇지 않다. 실제 배포본에서 배제 통제 건수가 0이라면, 누군가 어떤 페이지가 AI Overview 에 왜 나왔는지 묻기 전에 지금 리스크 레지스터에 적어 두라.

## 여기서 측정하지 않은 것

이 글의 주장에는 세 개의 경계가 있다. 첫째, Search Console 화면에 preferred source 토글이 실제로 노출되는지 여부. 인증 세션이 필요해 이 랩은 공식 문서 표면까지만 간다. 둘째, 실물 AI Overviews 와 AI Mode 파이프라인이 nosnippet 계열 지시자를 문서대로 실제로 존중하는지 여부. 이 랩은 문서와 배포본을 재었지 Googlebot 파서의 동작을 재지 않았다. 셋째, 배포본 표본이 4개 언어가 하나의 템플릿을 공유하는 자사 하나다. 자기 플릿으로 일반화하기 전에 자기 카운트를 돌려야 한다. 참고로 support.google.com 은 부재 증거로 못 쓴다. 가시 텍스트 2,697바이트짜리 JS 셸이라 헤드리스로 판별할 수 없었다.

일반화되는 것은 방법이다. 출시가 발표와 문서를 같은 날 배포하는 시대에는, 문서 표면에서 실재하는 것을 세는 일 — 전용 페이지의 유무, 토큰 빈도, 실제 HTML 에 대한 지시자 카운트 — 이 어떤 레버가 실물이고 어떤 것이 속설인지 가리키는 신뢰할 만한 방법이다. 다음에 "robots.txt 에 한 줄만 추가하면 된다"는 이전이 들려오기 전에 돌려 보라.

## 참고 자료

1. "AI features in Search," Google Search Central, developers.google.com — https://developers.google.com/search/docs/appearance/ai-features (2026-08-21 fetch)
2. "Google-Extended (google-common-crawlers)," Google Search Central — https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers (2026-08-21 fetch)
3. "Personalize news in Search and Discover," Google, blog.google — https://blog.google/products-and-platforms/products/search/personalize-search-discover-news/ (2026-08-21 fetch)
4. "Preferred sources," Google Search Central, last updated 2026-08-20 UTC — https://developers.google.com/search/docs/appearance/preferred-sources (2026-08-21 fetch)