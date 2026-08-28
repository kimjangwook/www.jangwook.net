---
title: 구글 AI 검색에 들어가는 방법은 전용 문서가 생겼고 빼는 방법은 요약 금지 표시 한 문장뿐이다
description: 구글이 AI 검색에 사이트를 넣는 방법은 이틀 만에 전용 문서와 버튼 코드까지 갖춰 준 반면, 빼는 방법은 개발자 문서 한
  문장에 몰아 둔 비대칭을 실측으로 확인한다. 로봇 규칙 파일의 차단 설정이 검색의 AI 기능과 무관하다는 공식 문장까지 짚고, 운영자가 점검해야
  할 지점을 정리한다.
pubDate: '2026-08-28'
heroImage: ../../../assets/blog/preferred-source-inclusion-only-exclusion-lever-unlanded-2026/hero.png
tags:
- 검색
- AI
relatedPosts:
- slug: ai-crawler-control-robots-txt-llms-txt-2026
  score: 0.7
  reason:
    en: Now that Google has shipped a dedicated page for getting into AI search, pairing
      Preferred Sources setup with concrete robots.txt and llms.txt crawler control
      is essential.
    ko: Google이 AI 검색 진입용 전용 페이지를 공개한 지금, Preferred Sources 설정과 함께 robots.txt·llms.txt로
      크롤러를 제어하는 구체적 전략이 필요합니다.
    ja: GoogleがAI検索専用ページを公開した今、Preferred Sourcesの設定と合わせてrobots.txt・llms.txtでクローラーを制御する具体的な戦略が不可欠です。
    zh: 在Google上线AI搜索专用页面的当下，将Preferred Sources设置与robots.txt、llms.txt爬虫控制策略结合使用至关重要。
---

## 넣는 방법은 전용 문서가 있고 빼는 방법은 한 문장뿐이다

구글이 AI 검색에 사이트를 넣는 공식 방법이 생겼다. 이름은 Preferred Source이고, 이 기능을 쓰면 사이트가 AI 답변에서 "선호하는 출처"라는 표시를 달고 나올 수 있다. 발표는 2026년 8월 20일이었고, 같은 날짜로 전용 안내 문서가 만들어졌다.

관건은 빼는 방법이다. 구글의 AI 답변에서 내 사이트를 빼고 싶을 때 쓸 수 있는 공식 수단은, 개발자용 안내 문서에 딱 한 문장 있다. 그 문장은 nosnippet, data-nosnippet, max-snippet, noindex라는 네 가지 표시를 소개한다. 이름들은 차례로 검색 결과에 요약을 보여 주지 마라, 이 부분만 요약하지 마라, 요약 길이를 제한하라, 이 페이지를 결과에서 숨겨라라는 뜻이다. 이 표시들은 페이지에 "검색 결과에 요약하지 마라" 같은 뜻을 전달하는 약속된 문구다.

원래 표시 네 가지를 한 문장에 묶어 두었을 뿐, 빼는 전용 문서나 버튼은 없다. 같은 문서에서 "opt out"이나 "exclude" 같은 빼라는 뜻의 단어를 세어 보면 0건이다. 네 가지 표시는 각각 1건씩만 나온다.

![ai-features 문서 텍스트 카운트 raw 출력 — 배타 지시자 nosnippet·data-nosnippet·max-snippet·noindex 각 1건, opt out·exclude 0건.](../../../assets/blog/preferred-source-inclusion-only-exclusion-lever-unlanded-2026/log-docs-exclusion-lever-inventory.png)

포함 쪽과 비교하면 차이가 크다. 포함 쪽 전용 문서는 개발자 문서 내비게이션의 154개 경로에 올라 있고, 문서에는 "마지막 수정 2026년 8월 20일"이라고 적혀 있다. 발표 이틀 만에 문서와 버튼 코드가 모두 갖춰진 셈이다.

시장의 가게에 비유해 보자. 들어오라는 안내는 전단지와 명찰까지 챙겨 주는데, 나가는 방법은 구석의 규정 한 줄뿐인 가게가 있는 셈이다. 손님은 어디로 나가는지 찾기 어렵다.

그러니까 내 입장에서 달라지는 건, 내 사이트를 AI 검색에 넣거나 빼는 데 드는 노력이 방향에 따라 전혀 다르다는 점이다.

## Preferred Source 발표문의 어휘 분포

구글의 발표문이 어떤 말을 강조했는지 세어 보면 방향이 명확하다. 발표문에서 "preferred source"라는 표현은 7건 나온다. 구글의 AI 검색 화면인 AI Mode는 2건, 검색 결과 위에 AI가 요약 답변을 보여 주는 AI Overviews는 1건, 뉴스 기사 목록인 Top Stories는 1건이다. 반면 검색에서 빼라는 뜻의 어휘는 실질적으로 0건이다. 유일하게 "opt out"이라는 문구가 1건 나오는데, 이것은 뉴스레터 신청을 해지할 수 있다는 안내일 뿐 검색과 무관하다.

![Preferred Source 발표문 텍스트 카운트 raw 출력 — preferred source 7건, 배타 어휘 실질 0건.](../../../assets/blog/preferred-source-inclusion-only-exclusion-lever-unlanded-2026/log-announcement-inclusion-vs-exclusion-wording.png)

발표문은 사이트 운영자에게 검색 관리 도구가 아니라 개발자 문서로 가라고 안내한다. 원문을 옮기면 이렇다.

> 발행인이라면, 구글 검색 센터 문서의 새로운 "Preferred Source" 버튼 코드에서 시작할 수 있다.
> — [Personalize search and discover news with preferred sources](https://blog.google/products-and-platforms/products/search/personalize-search-discover-news/)

즉 발표문 전체가 "넣는 방법"을 알리는 방향으로 쓰여 있다. 공식 소식만 읽으면 넣는 방법은 금방 따라 하겠지만 빼는 방법은 소식 어디에도 나오지 않는다.

## Google-Extended 와 검색 포함의 공식 분리

여기서 많은 사람이 착각하는 지점이 있다. 사이트마다 로봇 규칙 파일이라는 것이 있다. 이 파일은 "이 프로그램은 내 사이트를 읽지 마라"라고 미리 적어 두는 곳이다. 구글에는 Google-Extended라는 이름의 프로그램이 있다. 이것을 막으면 구글의 AI 학습에 쓰이지 않는다고 생각하기 쉽다.

하지만 구글 공식 문서는 다르게 말한다. 원문을 옮기면 이렇다.

> Google-Extended는 사이트가 구글 검색에 포함되는 데 영향을 주지 않으며, 구글 검색의 순위 신호로도 쓰이지 않는다.
> — [Google-Extended / Google Search Central](https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers)

구글의 입장은 이렇다. AI Overviews와 AI Mode는 검색에 내장된 기능이다. 그러니 이 기능에 사이트를 넣거나 빼는 일은 검색의 기존 규칙, 그러니까 앞서 나온 네 가지 표시로 통제한다는 것이다. AI 학습용 프로그램 차단은 검색과 별개의 일로 분리해 놓았다.

![Google-Extended 문서 해당 절 raw 출력 — 검색 포함에 영향 없다는 문장 1건 확인.](../../../assets/blog/preferred-source-inclusion-only-exclusion-lever-unlanded-2026/log-falsifier-google-extended-covers-search-ai.png)

결국 내 사이트에서는, 로봇 규칙 파일에 AI 관련 차단을 적어 두어도 구글 검색의 AI 기능에는 아무 변화가 없다. "차단했다"는 믿음이 실제 보호가 아니다.

## 우리 사이트 12개 페이지의 요약 금지 표시 점검 결과

그렇다면 실제 사이트에서는 어떤 상태인가. 우리 사이트에서 주소 목록 12개를 뽑아 하나씩 점검했다. 점검 방법은 간단하다. 각 페이지 안에 위에서 말한 네 가지 표시 중 하나라도 붙어 있는지 확인하는 것이다.

결과는 0이었다. 12개 중 표시가 붙어 있는 곳은 한 곳도 없었다. 한편 우리 사이트는 로봇 규칙 파일에 Google-Extended 차단을 2행 적어 두었고, 내 콘텐츠를 AI가 그대로 답변에 쓰지 말라는 설정도 하나 켜 두었다. 즉 "AI 차단"을 했다고 믿을 만한 설정은 있지만, 실제로 검색의 AI 기능을 통제하는 표시는 아무데도 실려 있지 않은 상태였다.

![자사 사이트맵 표본 12 URL 점검 raw 출력 — 지시자 착지 0/12.](../../../assets/blog/preferred-source-inclusion-only-exclusion-lever-unlanded-2026/log-own-deployment-lever-landing.png)

여기서 내가 챙겨야 할 건 이것이다. 설정 파일에 차단을 적어 두는 것과, 각 페이지에 실제 표시가 붙어 있는 것은 전혀 다른 점검이라는 점이다. 우리처럼 표시가 0개여도 사이트는 문제없이 돌아간다. 다만 빼거나 남기는 선택을 아직 한 번도 하지 않았다는 뜻이다.

반론도 있다. 네 가지 표시는 수년간 검증된 표준이고, 구글이 AI 기능을 검색의 일부로 보는 것은 일관된 설계라는 주장이다. 규칙의 논리 자체는 맞다. 하지만 같은 날짜에 넣는 쪽은 전용 문서와 버튼 코드와 규모 수치를 받았다. 빼는 쪽은 한 문장뿐이었다. 그리고 그 문장이 가리키는 표시는 실제 사이트 어디에도 붙어 있지 않았다. 논리는 맞아도 비대칭은 숫자로 실재한다.

## 이 판단이 틀릴 조건과 운영자의 다음 점검

이 글의 판단은 다음 조건에서 틀린 것이 된다. 구글이 공식 문서에 "로봇 규칙 파일의 Google-Extended 같은 토큰 하나로 검색의 AI 기능에서도 사이트가 빠진다"고 명시하면 이 판단은 틀린 것이 된다. 네 가지 표시 말고 빼는 별도의 공식 방법을 문서에 올려도 마찬가지다.

빼고 싶은 사람은 이렇게 하면 된다. 사이트 주소 목록 몇 개를 뽑아 각 페이지에 "요약하지 마라"는 표시가 붙어 있는지 세어 보고, 그 결과를 점검 기록으로 남겨라.

더 많이 나오고 싶은 사람은 이렇게 하면 된다. 차단 표시가 붙어 있지 않은지만 확인하면 된다. 로봇 규칙 파일의 AI 관련 설정은 검색 노출과 무관하므로 그것으로 안심하거나 걱정하지 않아도 된다.

결국 남는 결론은 이것이다. 넣는 방법은 구글이 문서와 버튼까지 만들어 준다. 빼는 방법은 페이지마다 실제로 표시를 세어 봐야 안다.

## 이 글이 확인하지 못한 것

이번에는 공식 문서와 발표문, 우리 사이트 배포본 세 표면만 확인했다. 검색 관리 도구의 실제 화면에 어떤 스위치가 있는지는 로그인이 필요해 확인하지 못했다. 다른 사이트들의 표시 사용률도 세지 않았고, 네 가지 표시가 실제 AI 답변 인용에 어떤 효과를 내는지도 측정하지 못했다. 다음에는 도구 화면의 실제 모습과 표시의 실제 효과를 확인할 것이다.

## 참고 자료

1. [AI features / Google Search Central](https://developers.google.com/search/docs/appearance/ai-features) — Google
2. [Google-Extended / Google Search Central (google-common-crawlers)](https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers) — Google
3. [Preferred sources / Google Search Central](https://developers.google.com/search/docs/appearance/preferred-sources) — Google
4. [Personalize search and discover news with preferred sources / Google blog 발표문 (Aug 20, 2026)](https://blog.google/products-and-platforms/products/search/personalize-search-discover-news/) — Google