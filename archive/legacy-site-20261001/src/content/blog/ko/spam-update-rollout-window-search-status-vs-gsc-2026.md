---
title: '스팸 업데이트 시작 시각을 분 단위로 긁어봤더니 Search Console 조인 키는 하루 단위 그대로였다'
description: 'Google Search Status Dashboard의 incidents.json은 스팸 업데이트 시작 시각을 초 단위로 공개한다. Search Console 조인 키는 PT 날짜 하나다. 두 해상도를 대조해, 분 단위 정밀도가 경계일 조인에서 사라지는지 직접 확인했다.'
pubDate: '2026-08-20'
heroImage: '../../../assets/blog/spam-update-rollout-window-search-status-vs-gsc-2026/hero.png'
tags:
  - search-console
  - search-status
  - seo
  - measurement
  - api
relatedPosts:
  - slug: gsc-platform-properties-social-video-search-measurement-2026
    score: 0.83
    reason:
      ko: 공식 문서가 밝힌 것과 실제로 조인되는 것 사이의 간격을 같은 방식으로 확인한 글이다. 여기서도 Search Console 쪽 해상도가 병목이다.
      ja: 公式が公開したものと実際にジョインできるものの差を同じやり方で確認した記事。ここでもSearch Console側の解像度がボトルネックになる。
      en: Same method — checking the gap between what is officially published and what actually joins. Search Console's resolution is the bottleneck here too.
      zh: 用同样的方法核对官方公开的内容与实际可关联的数据之间的差距，这里 Search Console 一侧的分辨率同样是瓶颈。
---

Google Search Status Dashboard(구글 검색의 시스템 장애와 랭킹 알고리즘 업데이트 현황을 컴퓨터가 읽을 수 있는 데이터로 제공하는 공식 상태 대시보드)의 `incidents.json` 데이터 주소(엔드포인트)가 업데이트 시작 시각을 초 단위까지 공개한다는 점에 주목했다. 이 초 단위 시작 시각을 Google Search Console(웹사이트의 검색 노출 순위와 클릭 성과를 집계하는 공식 도구) 데이터와 결합하면, 알고리즘 변경에 따른 순위 변동 분석의 정밀도를 크게 끌어올릴 수 있을지 검증해보고 싶었다. curl 명령어로 대시보드 데이터 주소 다섯 개를 직접 호출하고, 지난 사건 10건의 시각 기록(타임스탬프)을 초 단위로 뜯어보았다. 결과적으로 분석 정밀도는 올라가지 않았다. Search Console 쪽에서 두 데이터를 서로 묶기 위한 기준 열(조인 키, Join Key)이 미국 태평양 시간(PT, Pacific Time) 기준의 '하루(1일)' 단위 날짜 하나뿐이라, 분·초 단위 시각 데이터를 합치는 순간 업데이트 시작 당일(경계일) 24시간 안에서 업데이트 전후 상태가 뒤섞여버리기 때문이다.

시각을 억지로 맞추려 하기보다, 업데이트가 걸친 경계일 데이터에 '혼합 구간' 라벨을 붙여 분석에서 따로 분리해두는 편이 실질적인 해결책이라는 결론을 얻었다.

## 8월 18일에 뜬 사건, 세 가지 표기로 본다

2026년 8월 18일 16:27:00 UTC(영국 그리니치 기준 세계 표준시)에 August 2026 spam update(검색 스팸 알고리즘 업데이트)가 롤아웃(전 세계 검색 서버로의 순차 배포)을 시작했다. `incidents.json` 데이터에는 이렇게 기록되어 있다.

> "id":"LEubPCm2octf2uMqCFKE","number":"453832737276420062","begin":"2026-08-18T16:27:00+00:00","created":"2026-08-18T16:28:47+00:00","external_desc":"August 2026 spam update"
> — [Search Status Dashboard incidents.json](https://status.search.google.com/incidents.json)

같은 시점을 대시보드 웹페이지(HTML) 화면에서는 구글 본사가 있는 미국 서부 시간(PDT, 태평양 일광 절약 시간) 기준으로 표기한다.

> August 2026 spam update Active Start Time: 18 Aug 2026, 09:27 PDT Last update: 18 Aug 2026, 09:28 PDT Impacted products: Ranking
> — [Google Search Status Dashboard](https://status.search.google.com/)

또한 변경 사항을 실시간으로 자동 수신하기 위한 XML 규격 피드인 Atom 피드(`feed.atom`)를 열어보면, 갱신 시각 태그(`<updated>`)에는 국제 표준 규격(UTC RFC3339)이 들어가지만 사건 본문 요약(`<summary>`) 안에는 시간대 오프셋(표준시와의 시차 정보)이 누락된 문자열로만 적혀 있다. 세 번째 표기 방식이다.

> Incident began at <strong>2026-08-18 09:27</strong> <span>(all times are <strong>US/Pacific</strong>).</span>
> — [Search Status Dashboard Updates](https://status.search.google.com/feed.atom)

세 가지 표면이 동일한 발생 시점을 JSON 오프셋, HTML 시간대 접미사, Atom 무오프셋 문자열로 각기 다르게 표현하고 있다. 이는 데이터 파싱(프로그램으로 문장을 해석해 값을 추출하는 작업) 난이도만의 문제가 아니다. Atom 피드의 `<updated>` 시각(16:28:47Z)은 실제 롤아웃이 시작된 시각(16:27:00Z)이 아니라 '구글 담당자가 공지 글을 작성해 시스템에 등록한 시각'이다. 실제 배포 시작 시각과 1분 47초 어긋나 있다. 만약 피드 알림을 감지해 자동 모니터링을 돌리는 코드를 작성했다면, 시작 시각부터 잘못된 데이터를 기준으로 삼게 된다.

August 2026 spam update는 8월 20일 현재도 진행 중이다. `incidents.json`에는 배포 종료 시각을 뜻하는 `end` 필드가 아예 존재하지 않는다. 값이 비어있는(null) 것이 아니라 키 자체가 생성되지 않는 방식이다. 웹 대시보드 이력 페이지 역시 진행 중인 사건에는 "Information" 상태만 표시하고 지속 시간 항목을 공란으로 둔다.

## 값이 어디서 왔는지가 다르다

지난 사건 10건의 타임스탬프 29개를 초 단위로 분석해보니 뚜렷한 패턴이 드러났다. 배포 시작(`begin`)과 종료(`end`)는 초 단위가 항상 '00'이었고, 종료 시각 분 단위는 9건 모두 '5분' 배수(00분, 10분, 30분 등)로 떨어졌다. 반면 공지 생성(`created`)과 수정(`modified`) 시각은 2분, 18분, 43분처럼 실제 초와 분 단위를 그대로 갖고 있었다. 이는 사람이 관리자 화면에서 수동으로 입력한 선언값과, 서버 시스템이 자동으로 찍은 실제 기록값이 동일한 데이터 구조 안에 섞여 있음을 뜻한다.

대시보드 데이터 규격서인 `incidents.schema.json`은 시작 시각(`begin`) 필드를 이렇게만 정의한다.

> "begin": {"description": "Time in RFC3339 format when this incident started.", "type": "string"}
> — [incidents.schema.json](https://status.search.google.com/incidents.schema.json)

RFC3339라는 시간 표기 포맷(시차 정보를 포함하는 전산 표준 규격)만 규정할 뿐, 이 시작 시각이 시스템 자동 관측값인지 관리자의 사후 선언값인지는 문서 어디에도 설명되어 있지 않다. 공식 문서가 적어 둔 제어 지점과 실제 배포가 어긋난 기록과 같다. 스키마가 있는 것과, 그 값이 무엇을 의미하는지 계약이 있는 것은 다르다. 숫자의 자릿수 분포를 직접 역산해야만 비로소 파악할 수 있는 정보다.

선언값과 시스템 기록의 괴리가 실제로 드러난 사례도 있다. 2025년 8월 spam update의 경우, 완료 공지 생성 시각(`most_recent_update.created`)은 2025-09-22T06:14:22Z에 올라왔는데, 공식 선언된 배포 종료 시각(`end`)은 2025-09-22T07:00:00Z로 기록되어 있다. 공지가 종료 선언 시각보다 46분 먼저 올라온 셈이다. 나머지 8건은 반대로 선언된 종료 시각이 실제 완료 공지보다 0분에서 58분 앞섰다. 겉보기에는 분 단위로 정밀해 보이는 숫자의 실제 신뢰 오차 범위가 수분이 아니라 최대 한 시간에 가깝다는 뜻이다.

## Search Console은 여전히 하루 단위로만 받는다

과거 사건 타임스탬프 19개를 전수 대조해보니 2건에서 날짜 자체가 불일치했다. 둘 다 2026년 2월에 발생한 Google 검색 결과 서빙 장애(Serving 장애, 검색 색인 데이터를 실제 사용자 화면에 띄워주는 서빙 서버의 장애) 사건으로, 상태 대시보드의 `begin`과 `end`는 세계 표준시(UTC) 기준 2026-02-25였지만 Search Console에서는 2026-02-24 날짜에 해당했다. 원인은 두 시스템의 데이터를 하나로 매칭하는 기준 열(조인 키) 자체의 한계에 있다. Search Console API 문서는 조회 기간 기준을 다음과 같이 못 박아두고 있다.

> Start date of the requested date range, in YYYY-MM-DD format, in PT time (UTC - 7:00/8:00). Must be less than or equal to the end date.
> — [Search Analytics: query](https://developers.google.com/webmaster-tools/v1/searchanalytics/query)

Search Console 성과 데이터에는 시간·분 단위 필드가 아예 존재하지 않는다. [플랫폼 속성도 화면에는 있고 API 문서에는 없었던](/ko/blog/ko/gsc-platform-properties-social-video-search-measurement-2026/) 것과 같은 층이다. 화면이 보여주는 정밀도와 파이프라인이 받을 수 있는 정밀도가 다르다. 상태 대시보드가 초 단위까지 이벤트를 공개하더라도, 트래픽 데이터 쪽의 결합 키는 오직 '미국 태평양 시간(PT) 기준 하루(YYYY-MM-DD)'뿐이다. 따라서 UTC 타임스탬프를 그대로 PT 기준 날짜축에 얹으면 2026년 2월 장애처럼 날짜가 하루씩 어긋난다. 과거 랭킹 업데이트 7건은 모두 UTC 16:00 전후(미국 서부 기준 오전 8-9시경)에 시작했기 때문에 UTC 날짜와 PT 날짜가 우연히 일치했을 뿐이다. PDT(서머타임) 기준 00:00부터 07:00 사이나 PST(표준시) 기준 00:00부터 08:00 사이에 시작하는 사건은 필연적으로 날짜가 어긋난다.

## 경계일이 얼마나 섞이는지 계산해봤다

업데이트가 시작된 당일 하루(24시간)가 롤아웃 전과 후로 나뉘는 비율을 과거 10건에 걸쳐 직접 계산해보았다. 2026년 8월 spam update는 배포 전 39%와 배포 후 61%, 2026년 2월 Serving 장애는 83%와 17%로 사건마다 제각각이었다. 롤아웃 전체 기간 길이로는 일정한 규칙이 나오지 않아 시작 시각을 따로 떼어내 분석했다. 비율을 결정짓는 것은 전체 배포 기간이 아니라, 'PT 기준 하루 중 몇 시에 시작했는가'였다. 랭킹 업데이트의 대부분이 미국 서부 기준 오전 8시에서 9시 사이에 시작하기 때문에, 시작일 하루 트래픽의 약 60%는 이미 업데이트가 적용된 이후의 수치다. 반면 PT 02:00에 시작한 2026년 3월 core update는 시작일의 92%가 업데이트 이후 수치였고, PT 12:00에 시작한 2026년 3월 spam update는 정확히 50% 대 50%로 갈렸다.

완료된 사건 9건에 대해 롤아웃 기간을 PT 일 단위로 쪼개어, 배포 시작일과 종료일 사이에 끼어 하루 24시간 내내 100% 업데이트 상태로 집계된 순수한 날인 '완전 내부일(Fully Enclosed Days)'을 세어보았다. 21일 17시간 동안 지속된 2026년 2월 Discover 업데이트는 완전 내부일이 21일이었고, 26일 15시간 동안 진행된 2025년 8월 spam update는 26일이었다. 롤아웃 기간이 길수록 전후가 섞이는 경계일(시작일·종료일)의 영향은 전체 통계에서 희석된다. 하지만 짧은 업데이트는 사정이 완전히 다르다. 19시간 30분 만에 끝난 2026년 3월 spam update는 걸친 날짜가 2일이었지만 완전 내부일은 0일이었다. Search Console 일별 데이터상 온전하게 업데이트 효과만 담긴 날이 단 하루도 없었다는 뜻이다. 2일 1시간 동안 지속된 2026년 6월 spam update 역시 완전 내부일은 단 1일에 불과했다.

## 완료 후 일주일을 기다리라는 공식 권고, 어디까지 통하나

Google Search Central의 공식 가이드 문서는 분 단위 정밀 분석의 전제 자체를 짚고 넘어간다.

> Check the Search Status Dashboard and take note of the start and end date of the core update. Compare the right dates: We recommend waiting at least a full week after a core update completes before analyzing your site in Search Console.
> — [Google Search core updates and your website](https://developers.google.com/search/updates/core-updates)

업데이트 완료 후 최소 일주일 동안 기다린 다음 Search Console 데이터를 분석하라는 것이 구글의 권고다. 일주일 뒤에 장기 추세를 볼 목적이라면 시작 시각의 분 단위 정밀도는 사실상 큰 의미가 없는 잡음이 된다. 경계일 하루의 데이터 혼합이 28일 분석 창에서 차지하는 비중은 약 3.6%에 불과하기 때문이다.

구글의 권고가 들어맞는 범위는 명확하다. 11일 동안 이어진 2026년 5월 core update, 21일간 이어진 Discover 업데이트, 26일간 진행된 2025년 8월 spam update처럼 완전 내부일이 11일 이상 확보되는 긴 롤아웃에서는 경계일의 혼합 문제를 신경 쓸 필요가 없다. 일주일을 기다리는 동안 경계일의 오차는 통계적으로 자연스럽게 묻힌다.

반면 2026년 3월 spam update처럼 19시간 30분짜리 짧은 롤아웃은 걸친 날짜가 이틀이어도 완전 내부일이 0일이다. 완료 후 기다릴 시점은 있어도, 배포 전과 배포 후를 비교할 수 있는 깨끗한 하루 단위 표본이 존재하지 않는다. 2026년 6월 spam update도 완전 내부일이 하루뿐이었다. 최근 spam update 3건 중 2건이 이와 같은 단기 롤아웃에 해당했다. 긴 롤아웃을 전제로 만들어진 구글의 일괄적인 안내를 단기 롤아웃에 무비판적으로 대입하면 데이터 분석의 기본 축 자체가 깨져버린다.

## 오늘 바꿀 것

Search Console API를 정기 배치 프로그램으로 수집해 전사 데이터 웨어하우스(통합 데이터 저장소)에 적재하는 개발·데이터 팀이라면, 적재 테이블에 `rollout_label` 컬럼을 추가하고 상태 대시보드의 `incidents.json` 시각을 PT 시간대로 정규화하여 시작일과 종료일 레코드에 `exclude(제외)` 플래그를 달아두는 것을 권장한다. 억지로 숫자를 시간별로 쪼개 보정하려 하지 않고 "이 두 날짜는 롤아웃 전후가 섞인 혼합 구간"이라고만 표시해두어도, 알고리즘 변경 효과를 통계적으로 추정하는 성과 회귀분석 시 오염된 구간을 깔끔하게 분리해낼 수 있다. Atom 피드 알림을 자동화에 활용하고 있다면 `<updated>` 태그를 시작 시각으로 잘못 읽는 코드를 수정해 공지 생성 시각과 롤아웃 시작 시각을 분리해야 한다. 별도의 자동화 파이프라인 없이 웹 브라우저로 Search Console을 직접 확인하는 1인 운영자나 기획자라면 복잡한 파이프라인을 짤 필요가 없다. 대시보드를 북마크해두고 배포 완료 공지가 올라온 뒤 확인하는 편이 훨씬 경제적이다.

대시보드의 수집 접근성을 점검하기 위해 `robots.txt`를 확인하고 curl로 `incidents.json`을 직접 호출해보았다. `robots.txt`는 `user-agent: *`에 `allow: /`로 설정되어 있어 자동화 접근을 차단하지 않으며, 일반 `curl/8.7.1` 요청으로도 정상(HTTP 200, JSON 포맷, 약 12.9KB) 응답을 반환했다. [선언된 robots.txt가 페일 오픈으로 남는 경우](/ko/blog/ko/declared-rules-fail-open-robots-txt-agents-md-2026/)와 반대로, 여기서는 선언대로 열린다. 그러나 데이터에 쉽게 접근할 수 있다는 것과, 그 데이터가 실무 분석 지표와 정확히 맞아떨어진다는 것은 전혀 다른 차원의 문제다. incidents.json이 최근 10건의 사건만 남기는 보존 정책을 쓰는 것인지, 혹은 API 응답의 최대 상한이 10건으로 고정되어 있는 것인지는 공식 문서에 명시되어 있지 않아 추가적인 관측이 필요하다.

## 참고 자료

- [Google Search Status Dashboard](https://status.search.google.com/)
- [Search Status Dashboard incidents.json](https://status.search.google.com/incidents.json)
- [incidents.schema.json](https://status.search.google.com/incidents.schema.json)
- [Google Search Status Dashboard Updates (Atom)](https://status.search.google.com/feed.atom)
- [Search Console API — Search Analytics: query](https://developers.google.com/webmaster-tools/v1/searchanalytics/query)
- [Google Search core updates and your website](https://developers.google.com/search/updates/core-updates)
- [History for Ranking | Google Search Status Dashboard](https://status.search.google.com/products/rGHU1u87FJnkP6W2GwMi/history)
- [Spam updates and your site](https://developers.google.com/search/docs/appearance/spam-updates)
