---
title: 구글 AI 검색에 사이트를 넣는 방법은 하루 만에 전용 문서가 생겼고, 빼는 방법은 요약 표시 지시자 한 문장뿐이다
description: 구글이 같은 날짜에 발표한 문서 세 장을 세어 보면, 내 글을 AI 검색에 넣는 길은 전용 안내와 버튼 코드까지 갖춰져 있고
  빼는 길은 한 문장뿐이다. 자사 사이트 12개 페이지를 직접 확인한 결과 그 한 문장이 가리키는 표시는 어디에도 붙어 있지 않았다.
pubDate: '2026-08-28'
heroImage: ../../../assets/blog/preferred-source-inclusion-only-exclusion-lever-unlanded-2026/hero.png
tags:
- 검색
- AI
relatedPosts:
- slug: ai-crawler-control-robots-txt-llms-txt-2026
  score: 0.7
  reason:
    en: If Google shipped a dedicated publisher on-ramp on day one, this guide covers
      the hands-on strategy of using robots.txt and llms.txt to block AI training
      crawls while still permitting citation.
    ko: 구글이 발표 당일부터 언론사를 위한 전용 온보딩을 만들었다면, 이 글은 robots.txt와 llms.txt로 AI 크롤러의 학습은
      막고 인용은 허용하는 실전 제어 전략을 다룹니다.
    ja: Googleが発表当日からパブリッシャー向けの専用オンボーディングを用意したなら、この記事ではrobots.txtとllms.txtでAIクローラーの学習をブロックしつつ引用を許可する実践的な制御戦略を解説します。
    zh: 谷歌在发布当天就为出版方搭建了专用入口，而本文将讲解如何用 robots.txt 和 llms.txt 阻止 AI 爬虫训练、同时允许引用的实战策略。
---

## 발표문이 보여 주는 넣는 방법의 규모

구글이 8월 20일에 내놓은 발표문에는 새 기능이 하나 들어 있다. 이름은 선호 출처 기능이다. 내가 자주 보는 사이트를 내가 직접 골라 등록하면 그렇게 표시된다. 그러면 AI Mode 나 AI Overviews 에서 그 사이트의 글에 선호라는 딱지가 붙는다.

이 발표문에는 숫자가 몇 개 박혀 있다. 8월 20일자 발표문 원문에서 선호 출처라는 표현이 7번 나왔다. 단수 형태로만 세면 4번이다. 반면 검색 결과에서 내 글을 빼는 방법을 뜻하는 말은 사실상 나오지 않았다. 유일하게 빼기와 비슷한 문장은 뉴스레터 구독을 언제든 취소할 수 있다는 안내 한 줄이었다. 이것은 검색과 무관한 문구다. 발표문에는 검색 관리 도구를 여는 입구에 대한 언급도 없었다.

> If you're a publisher, you can find the new "Preferred Source" button code in our Google Search Central documentation to get started.
> — [Personalize search and discover news with preferred sources](https://blog.google/products-and-platforms/products/search/personalize-search-discover-news/)

이 문장을 풀면 이렇다. 글을 운영하는 사람은 구글의 개발자 안내 문서에서 선호 출처 버튼 코드를 받으면 된다는 뜻이다. 즉 발표문이 독자를 다음 단계 문서로 곧바로 안내한다.

![8월 20일 발표문 텍스트 카운트 결과, preferred source 표현이 7건 나왔다.](../../../assets/blog/preferred-source-inclusion-only-exclusion-lever-unlanded-2026/log-announcement-inclusion-vs-exclusion-wording.png)

여기서 내 입장에서 달라지는 건 이것이다. 내 글을 검색에 더 잘 보이게 하고 싶다면 구글이 이미 문까지 마중 나와 있다는 뜻이다.

## 넣는 방법만 전용 문서가 따로 있었다

앞 절에서 말한 전용 문서가 실제로 있는지 확인했다. 구글은 웹사이트 운영자를 위한 개발자 안내 사이트를 따로 운영한다. 그 사이트 왼쪽 메뉴에는 문서 경로가 모두 154개 걸려 있다. 그 154개 경로 가운데 선호 출처만을 설명하는 전용 문서가 1개 존재했다. 문서를 열면 정상 응답이 돌아왔고, 마지막 갱신 날짜는 2026년 8월 20일로 발표와 같은 날이었다. 이 전용 문서에는 빼는 방법을 뜻하는 문구가 0건이었다.

![Search Central 내비게이션 154개 경로 가운데 preferred-sources 전용 문서 1개를 확인한 기록이다.](../../../assets/blog/preferred-source-inclusion-only-exclusion-lever-unlanded-2026/log-docs-inclusion-lever-absence.png)

동네 가게에 비유하면 이렇다. 가게가 새 손님 모시기 안내 전단지를 동네에 널려 놓고, 회원 카드 만드는 절차까지 안내 데스크에서 친절하게 알려 준다. 그런데 회원 탈퇴 방법은 안내 데스크 한 편에 종이 한 장만 놓여 있는 셈이다. 이 비유에서 말하는 회원 탈퇴 종이 한 장이 다음 절의 주제다.

## 빼는 방법을 적은 문장은 단 하나였다

빼는 방법을 적은 그 종이 한 장을 찾아냈다. 구글의 AI 검색 기능 운영자용 안내 문서를 통째로 긁어 와서, 빼기와 관련된 단어가 몇 번 나오는지 세었다. 세기 전에 나는 문서의 다른 부분에서 우연히 같은 단어가 걸리는 경우를 빼고, 순수하게 본문만 남겼다.

결과는 이렇다. 스니펫을 제한하는 지시자가 4개 나왔다. 스니펫은 검색 결과에서 내 글 제목 아래에 붙는 요약 문장이다. 요약을 보여 주지 말라는 표시가 1건, 글 안의 일부만 감추라는 표시가 1건, 요약 길이를 제한하라는 표시가 1건, 아예 검색에서 지우라는 표시가 1건이었다. 이 넷이 한 문장에 묶여 있다.

> To limit the information shown from your pages in Search, use nosnippet, data-nosnippet, max-snippet, or noindex controls.
> — [AI features / Google Search Central](https://developers.google.com/search/docs/appearance/ai-features)

같은 문서에서 빼기, 제외를 뜻하는 단어는 0건이었다. AI 기능에서 나를 빼기라는 단어 자체가 문서에 존재하지 않는다. 대신 문서는 요약 표시만 없어도 되는 자격을 설명한다.

> There are no additional technical requirements.
> — [AI features / Google Search Central](https://developers.google.com/search/docs/appearance/ai-features)

이 반론을 받아 볼 필요가 있다. 네 지시자는 수년간 검증된 표준 규칙이고, 구글은 AI 답변을 검색의 일부로 보기 때문에 요약 표시 하나로 묶는 것은 일관된 설계라고 반박할 수 있다. 이 반론은 규정 안에서만 보면 맞다. 그러나 같은 발표 날짜에 넣는 쪽은 전용 문서와 버튼 코드를 받았고, 빼는 쪽은 단어 4개짜리 한 문장이었다. 비대칭은 문서 논리로 지워지지 않는 수치로 실재한다.

![ai-features 개발자 문서 표면에서 세어 배타 지시자가 4건 나왔다.](../../../assets/blog/preferred-source-inclusion-only-exclusion-lever-unlanded-2026/log-docs-exclusion-lever-inventory.png)

정리하면 이렇다. 빼는 방법은 누가 상품으로 만들어 주지 않는다. 규정 한 줄을 직접 찾아서 내 페이지에 직접 심어야 한다.

## 우리 사이트 12개 페이지에는 그 표시가 없었다

그 한 문장에 든 표시가 실제로 우리 사이트에 붙어 있는지 확인했다. 우리 사이트의 목록에서 12개 페이지를 뽑아 각각 열어 보고, 요약하지 말라는 표시가 붙어 있는지 세었다. 결과는 12개 중 0개였다. 12개 페이지 전부 그런 표시가 없었다.

![자사 사이트맵 표본 12개 URL 에서 지시자 착지가 0개로 나왔다.](../../../assets/blog/preferred-source-inclusion-only-exclusion-lever-unlanded-2026/log-own-deployment-lever-landing.png)

빼기 규정은 존재하지만 그 규정이 실제로 적용된 자리는 우리 사이트에 한 곳도 없었다. 규정상 빠질 경로는 있으나 제품처럼 만들어진 경로는 없다는 주장이 여기서 수치로 확인된다. 여기서 내가 챙겨야 할 건 단순하다. 빼려고 했는데 못 빼고 있는 건지, 빼 생각이 없었던 건지 구분해 보는 일부터 시작이다.

## AI 차단 규칙은 검색 결과와 상관이 없다고 구글이 밝혔다

여기서 헷갈리기 쉬운 부분이 하나 있다. 사이트에는 찾아가는 로봇에게 규칙을 알려 주는 약속 파일이 있다. 이 파일에 AI 관련 차단 토큰을 넣으면 AI에게 내 글을 안 준다고 믿는 경우가 많다. 우리 사이트도 그 차단 토큰 두 줄을 켜 두고 있었다.

하지만 구글 공식 문서는 다르게 말한다.

> Google-Extended does not impact a site's inclusion in Google Search nor is it used as a ranking signal in Google Search.
> — [Google-Extended / Google Search Central](https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers)

즉 그 차단 토큰은 구글의 다른 시스템에 대한 약속이지 검색에 들어가는 것과는 무관하다. 같은 문서에 그 사실이 명시되어 있다.

> To limit AI training and grounding in some of Google's other systems, read more about Google-Extended.
> — [AI features / Google Search Central](https://developers.google.com/search/docs/appearance/ai-features)

이 점을 정리하면 이렇다. 차단 토큰을 켰는데 AI 답변에서 내 글이 계속 나온다면 그것은 고장이 아니라 설계다. 빼고 싶다면 요약 표시를 심어야 하고, 그 외의 방법은 공식 문서가 만들어 주지 않았다.

## 팀 점검 목록에 넣을 두 항목

이번 결과를 팀 점검 목록에 넣는 방법은 두 줄이면 끝난다.

첫째, AI 답변에서 내 글을 빼고 싶은 사람이라면 이렇게 한다. 내 사이트의 페이지 몇 개를 골라 열어 보고, 이 페이지는 요약해 보여 주지 말라는 표시가 실제로 붙어 있는지 직접 센다. 이번 조사에서는 12페이지 중 0개였다.

둘째, AI 답변에 내 글을 더 넣고 싶은 사람이라면 이렇게 한다. 그런 차단 표시가 없는지만 확인하고, 구글이 새로 연 선호 출처 등록 절차를 따라 하면 된다. 문서 표면만 본 이번 조사에서는 그 문서가 존재한다는 것까지 확인했을 뿐, 검색 관리 도구 화면에 등록 스위치가 실제로 어떻게 보이는지는 확인하지 못했다.

그래서 문서의 두께를 세면 어느 쪽이 기본값인지 안다. 넣는 길은 구글이 제품으로 지었고, 빼는 길은 한 문장이었다. 그 한 문장이 우리 사이트 어디에도 착지하지 않았다는 사실이 두 방향의 기본값을 말해 준다.

## 이 글이 확인하지 못한 것

이번 조사는 세 표면의 문서 원문과 자사 12개 페이지만 잤다. 검색 관리 도구 실제 화면의 스위치 유무는 로그인이 필요해 확인하지 못했고, 요약 표시가 AI 답변 인용에 실제로 어떤 효과를 주는지도 재지 않았다. 다른 사이트들에 그 표시가 얼마나 붙어 있는지도 표본이 없으니 모른다. 다음에는 로그인 세션으로 도구 화면의 스위치를 직접 확인할 것이다.

이 판단이 틀릴 조건은 이것이다. 구글의 공식 설명이 바뀌어 AI 답변에 내 글을 빼는 규칙이 전용 안내 문서와 등록 절차를 받게 되는 날, 또는 차단 토큰이 AI 답변과 무관하다는 설명이 뒤집히는 날, 이 글의 주장은 틀린 것으로 간주한다.

## 참고 자료

1. [AI features / Google Search Central](https://developers.google.com/search/docs/appearance/ai-features) — Google
2. [Google-Extended / Google Search Central (google-common-crawlers)](https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers) — Google
3. [Preferred sources / Google Search Central](https://developers.google.com/search/docs/appearance/preferred-sources) — Google
4. [Personalize search and discover news with preferred sources / Google blog 발표문 (Aug 20, 2026)](https://blog.google/products-and-platforms/products/search/personalize-search-discover-news/) — Google