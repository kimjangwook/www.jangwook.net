---
title: '스팸 업데이트 시작 시각을 분 단위로 긁어봤더니 Search Console 조인 키는 하루 단위 그대로였다'
description: 'Google Search Status Dashboard는 랭킹 업데이트 시작 시각을 초 단위 JSON으로 공개한다. Search Console은 여전히 PT 날짜로만 묶인다. 두 해상도를 대조해 분 단위 정밀도가 조인 순간 어디로 사라지는지 확인했다.'
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
  - slug: official-geo-subtraction-gsc-control-2026
    score: 0.76
    reason:
      ko: 공식 문서가 적어 둔 제어 지점과 실제 배포 사이의 간격을 다룬 글. 대시보드 문서를 그대로 믿을 때 생기는 함정이 겹친다.
      ja: 公式文書に書かれた制御点と実際の配信の差を扱った記事。ダッシュボードの文書をそのまま信じたときの落とし穴が重なる。
      en: On the gap between the control points official docs describe and what actually ships. The same trap of trusting dashboard docs at face value shows up.
      zh: 讨论官方文档所写的控制点与实际交付之间的差距，照单全收信任仪表盘文档时的陷阱与本文重合。
---

Google Search Status Dashboard의 incidents.json이 랭킹 업데이트 시작 시각을 초 단위까지 공개한다는 걸 알았다. 시작 시각을 Search Console 성과 데이터에 직접 붙이면 상관분석 정밀도가 올라가는지 확인하고 싶었다. curl로 대시보드 엔드포인트 다섯 개를 전부 찔러보고 지난 사건 10건의 타임스탬프를 초 단위로 뜯어봤다. 정밀도는 올라가지 않았다. 조인 키가 PT 날짜 하나뿐이라 분 단위 시각은 조인하는 순간 경계일 한 칸 안에서 두 상태로 섞인다.

시각을 억지로 맞추기보다 경계일에 혼합 라벨을 붙여두는 편이 통한다는 결론을 얻었다.

## 8월 18일에 뜬 사건, 세 가지 표기로 본다

2026년 8월 18일 16:27:00 UTC에 August 2026 spam update가 롤아웃을 시작했다. incidents.json에는 이렇게 찍혀 있다.

> "id":"LEubPCm2octf2uMqCFKE","number":"453832737276420062","begin":"2026-08-18T16:27:00+00:00","created":"2026-08-18T16:28:47+00:00","external_desc":"August 2026 spam update"
> — [Search Status Dashboard incidents.json](https://status.search.google.com/incidents.json)

같은 순간을 대시보드 HTML은 이렇게 적는다.

> August 2026 spam update Active Start Time: 18 Aug 2026, 09:27 PDT Last update: 18 Aug 2026, 09:28 PDT Impacted products: Ranking
> — [Google Search Status Dashboard](https://status.search.google.com/)

`<updated>` 태그에는 UTC RFC3339가 들어가는데 사건 시작 시각 자체는 `<summary>` 안에 오프셋 없는 문자열로만 박혀 있다. 세 번째 표기다.

> Incident began at <strong>2026-08-18 09:27</strong> <span>(all times are <strong>US/Pacific</strong>).</span>
> — [Search Status Dashboard Updates](https://status.search.google.com/feed.atom)

세 표면이 같은 순간을 JSON offset, HTML 타임존 접미사, Atom 무오프셋 문자열로 다르게 적는다. 파싱 난이도만 다른 게 아니다. Atom의 `<updated>`는 16:28:47Z로 롤아웃 시작 시각이 아니라 공지 생성 시각이다. 선언된 시작 시각 16:27:00Z와 1분 47초 어긋나 있다. Atom 알림을 시작 시각으로 읽는 코드를 쓰고 있다면 틀린 값을 받는 셈이다.

August 2026 spam update는 8월 20일 현재도 진행 중이다. incidents.json에는 `end` 필드가 아예 없다. null이 아니라 키 자체가 없다. HTML 이력 페이지도 진행 중인 사건에는 "Information"만 적어두고 지속시간을 비워둔다.

## 값이 어디서 왔는지가 다르다

지난 사건 10건의 타임스탬프 29개를 초 단위로 뜯어보니 패턴이 나왔다. `begin`과 `end`는 초가 항상 00이고 `end`는 9건 전부 5분 단위 배수다. `created`와 `modified`는 2분, 18분, 43분처럼 초가 실제 값을 갖는다. 사람이 입력한 선언값과 기계가 기록한 값이 같은 스키마 안에 섞여 있다는 뜻이다.

incidents.schema.json은 `begin`을 이렇게만 규정한다.

> "begin": {"description": "Time in RFC3339 format when this incident started.", "type": "string"}
> — [incidents.schema.json](https://status.search.google.com/incidents.schema.json)

RFC3339 포맷이라는 것만 규정할 뿐 시작 시각이 관측값인지 선언값인지는 스키마 어디에도 적혀 있지 않다. 초 자릿수 분포로 역산해야 알 수 있는 정보다.

선언값과 기계 기록이 어긋난 사례가 있다. 2025년 8월 spam update는 완료 공지 시각 `most_recent_update.created`가 2025-09-22T06:14:22Z에 올라왔는데 선언한 종료 시각 `end`는 2025-09-22T07:00:00Z다. 공지가 종료 선언보다 46분 먼저 떴다. 나머지 8건은 반대로 `end`가 완료 공지보다 0~58분 앞선다. 분 단위로 보이는 숫자의 실제 신뢰 구간은 분이 아니라 최대 한 시간에 가깝다.

## Search Console은 여전히 하루 단위로만 받는다

타임스탬프 19개를 확인했더니 2건의 날짜가 어긋났다. 둘 다 2026년 2월 Serving 장애 사건으로 `begin`·`end`가 UTC 기준 2026-02-25인데 PT로는 2026-02-24다. 원인은 조인 키 자체에 있다. Search Console API 문서는 조인 키를 이렇게 규정한다.

> Start date of the requested date range, in YYYY-MM-DD format, in PT time (UTC - 7:00/8:00). Must be less than or equal to the end date.
> — [Search Analytics: query](https://developers.google.com/webmaster-tools/v1/searchanalytics/query)

시각 단위 필드가 없다. 대시보드가 초 단위까지 공개해도 성과 데이터 쪽 조인 키는 PT 날짜 하나다. UTC 타임스탬프를 그대로 PT 날짜축에 얹으면 2026년 2월 장애처럼 날짜가 어긋난다. 랭킹 업데이트 7건은 전부 UTC 16:00 전후에 시작해 UTC 날짜와 PT 날짜가 우연히 같았을 뿐이다. PDT 기준 00:00~07:00나 PST 기준 00:00~08:00에 시작하는 사건은 전부 날짜가 어긋난다.

## 경계일이 얼마나 섞이는지 계산해봤다

시작일 하루가 롤아웃 전/후로 나뉘는 비율을 10건에 걸쳐 계산해봤다. 2026년 8월 spam update는 39%/61%, 2026년 2월 Serving 장애는 83%/17%로 사건마다 제각각이다. 롤아웃 길이로는 규칙이 잡히지 않아 시작 시각을 따로 뽑아봤다. 비율을 정하는 것은 롤아웃 길이가 아니라 PT 기준 시작 시각의 위치였다. 랭킹 업데이트 대부분이 PT 오전 8~9시대에 시작해 경계일의 약 60%가 롤아웃 이후 값이다. PT 02:00에 시작한 2026년 3월 core update는 시작일의 92%가 롤아웃 이후지만 PT 12:00에 시작한 2026년 3월 spam update는 정확히 50%/50%다.

완료된 사건 9건에서 롤아웃 창을 PT 일 단위로 쪼개 완전 내부일을 세어봤다. 21일 17시간 지속된 2026년 2월 Discover 업데이트는 21일이다. 26일 15시간 지속된 2025년 8월 spam update는 26일이 완전 내부일이다. 롤아웃이 길수록 경계일 혼합 문제는 희석된다. 짧은 롤아웃은 사정이 다르다. 19시간 30분 동안 진행된 2026년 3월 spam update는 걸친 PT 일수가 2일인데 완전 내부일이 0이다. Search Console 날짜축에서 깨끗한 하루가 하나도 없다. 2일 1시간 지속된 2026년 6월 spam update도 완전 내부일이 1일이다.

## 완료 후 일주일을 기다리라는 공식 권고, 어디까지 통하나

Google Search Central의 공식 안내가 분 단위 분석의 전제를 흔든다.

> Check the Search Status Dashboard and take note of the start and end date of the core update. Compare the right dates: We recommend waiting at least a full week after a core update completes before analyzing your site in Search Console.
> — [Google Search core updates and your website](https://developers.google.com/search/updates/core-updates)

완료 후 최소 일주일을 기다리라는 게 구글의 권고다. 일주일 뒤에 볼 거라면 시작 시각의 분 단위 정밀도는 잡음이다. 경계일 한 칸의 혼합이 28일 창에서 차지하는 비중은 3.6%다.

구글 권고가 들어맞는 범위는 명확하다. 11일 동안 이어진 2026년 5월 core update, 21일의 Discover 업데이트, 26일의 2025년 8월 spam update처럼 완전 내부일이 11일 이상인 긴 롤아웃에서는 경계일 혼합을 신경 쓸 이유가 없다. 일주일을 기다리는 동안 경계일의 잡음은 통계적으로 묻힌다.

반면 2026년 3월 spam update는 19시간 30분짜리라 걸친 PT 일수가 2일인데 완전 내부일이 0이다. 기다릴 완료 후 시점은 있어도 비교할 깨끗한 하루가 없다. 2026년 6월 spam update도 완전 내부일이 1일뿐이다. 최근 spam update 세 건 중 두 건이 짧은 롤아웃에 속했다. 긴 롤아웃을 전제로 한 안내를 짧은 롤아웃에 그대로 적용하면 분석 창 자체가 깨진다.

## 오늘 바꿀 것

Search Console API를 정기 배치로 돌려 성과 데이터를 쌓는 팀이라면 적재 테이블에 `rollout_label` 열을 추가하고 incidents.json을 PT로 정규화해 시작일과 종료일 두 칸에 exclude 플래그를 찍는다. 숫자를 보정하지 않고 "이 두 칸은 롤아웃 전/후 혼합"이라고만 표시해두면 회귀분석에서 혼합 구간을 격리할 수 있다. Atom 알림을 쓰고 있다면 `<updated>`를 시작 시각으로 읽던 코드를 고쳐 공지 생성 시각과 롤아웃 시작 시각을 분리한다. 배치 없이 브라우저로 Search Console을 직접 여는 1인 운영이라면 파이프라인을 만들 필요가 없다. 대시보드를 북마크해두고 완료 공지가 뜰 때 확인하는 편이 더 싸다.

robots.txt를 확인하고 incidents.json을 curl로 직접 찔러봤다. robots.txt는 `user-agent: *`에 `allow: /`뿐이라 접근을 막는 규칙이 없고 curl은 `curl/8.7.1` 에이전트로도 http=200, type=application/json, size=12903으로 응답했다. 접근이 쉽다는 것과 사건 데이터가 붙여야 할 곳에 정확히 붙는다는 것은 다른 문제다. 지난 사건 10건이라는 표본 자체도 아직 풀리지 않았다. incidents.json이 보존 정책상 최근 10건만 남기는 것인지, 애초에 상한이 10건으로 걸려 있는 것인지는 API 문서 어디에도 나와 있지 않다.

## 참고 자료

- [Google Search Status Dashboard](https://status.search.google.com/)
- [Search Status Dashboard incidents.json](https://status.search.google.com/incidents.json)
- [incidents.schema.json](https://status.search.google.com/incidents.schema.json)
- [Google Search Status Dashboard Updates (Atom)](https://status.search.google.com/feed.atom)
- [Search Console API — Search Analytics: query](https://developers.google.com/webmaster-tools/v1/searchanalytics/query)
- [Google Search core updates and your website](https://developers.google.com/search/updates/core-updates)
- [History for Ranking | Google Search Status Dashboard](https://status.search.google.com/products/rGHU1u87FJnkP6W2GwMi/history)
- [Spam updates and your site](https://developers.google.com/search/docs/appearance/spam-updates)
