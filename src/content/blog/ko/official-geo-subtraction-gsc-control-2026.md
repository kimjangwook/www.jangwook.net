---
title: 'robots.txt는 45줄인데 배포본은 106줄이었다: 공식 GEO 제어를 내 사이트에서 확인한 날'
description: '공개 robots.txt는 106줄이고 저장소 파일은 45줄이었다. llms.txt는 404였고 Google은 검색에 쓰지 않는다고 적는다. Search Console 생성형 AI 스위치는 PR에 없다. 공식 GEO 문서를 공개 URL 여덟 장의 바이트와 대조한 기록이다.'
pubDate: '2026-08-14'
heroImage: '../../../assets/blog/official-geo-subtraction-gsc-control-2026/hero.png'
tags:
  - seo
  - geo
  - robots-txt
  - search-console
  - html
relatedPosts:
  - slug: robots-snippet-controls-ai-overviews-2026
    score: 0.92
    reason:
      ko: 생성형 검색에서 줄일 수 있는 제어 지점을 실제 배포본과 속성 설정까지 이어서 확인한다.
      ja: この記事は生成検索で絞れる制御点を、実際の配信ファイルとプロパティ設定まで追って確認する。
      en: This post follows the controls that can reduce generative-search eligibility from the deployed file to the property setting.
      zh: 这篇文章把生成式搜索中可以收紧的控制点，从线上文件一直追到属性设置。
  - slug: ai-crawler-control-robots-txt-llms-txt-2026
    score: 0.89
    reason:
      ko: robots.txt와 llms.txt를 할 일 목록으로 소비하지 않고, Google 공식 문서가 실제로 인정하는 효과와 내 사이트의 바이트를 나란히 본다.
      ja: robots.txtとllms.txtを作業リストにせず、Google公式文書が認める効果と自サイトのバイトを並べて見る。
      en: It compares the effects Google documents with the bytes served by the site instead of treating robots.txt and llms.txt as a checklist.
      zh: 不把 robots.txt 和 llms.txt 当成待办清单，而是把 Google 文档写明的效果和网站实际返回的字节并排比较。
  - slug: faqpage-deprecation-ai-citation-2026
    score: 0.78
    reason:
      ko: 생성형 검색에서 마크업 이름을 좇기보다 어떤 제어가 노출 범위를 끊고 어떤 것은 순위와 무관한지 구분한다.
      ja: 生成検索でマークアップ名を追うのではなく、露出範囲を切る制御と順位に関係しない制御を分けている。
      en: It separates controls that cut feature eligibility from markup choices that do not act as ranking signals.
      zh: 把会切断功能资格的控制，与不构成排名信号的标记选择区分开来。
  - slug: validate-structured-data-ci-jsonld-2026
    score: 0.73
    reason:
      ko: 실제 HTML과 JSON-LD를 확인하되, 구조화 데이터가 생성형 검색의 필수 조건이라는 식으로 부풀리지 않는다.
      ja: 実際のHTMLとJSON-LDを確認しつつ、構造化データを生成検索の必須条件に膨らませない。
      en: It checks the live HTML and JSON-LD without inflating structured data into a requirement for generative search.
      zh: 检查线上 HTML 和 JSON-LD，但不把结构化数据夸大成生成式搜索的必需条件。
  - slug: json-ld-graph-entity-linking-2026
    score: 0.66
    reason:
      ko: JSON-LD 타입이 응답에 있다는 사실과 검색 시스템이 그것을 쓰는 방식은 다른 층이라는 점을 이어서 본다.
      ja: JSON-LDの型が応答にあることと、検索システムがそれをどう使うかは別の層だと続けて確認する。
      en: It follows the gap between JSON-LD types appearing in a response and how search systems actually use them.
      zh: 接着看 JSON-LD 类型出现在响应里，和搜索系统实际如何使用它，是两个不同层次。
---

공개 URL의 `robots.txt`는 106줄이었다. 그날 아침 편집하던 저장소의 `public/robots.txt`는 45줄이었다.

저장소 diff만 보고 배포본을 다 확인했다고 생각했다. 틀렸다. 공개 파일이 61줄 더 길었다. 45줄만 승인했다면 서버에 붙은 61줄은 리뷰를 거치지 않은 셈이다.

로그인하지 않고 공개 URL 여덟 개만 요청했다. Google 공식 문서 네 곳을 다시 읽었다. 순위나 인용 수가 아니라 노출 자격을 어디서 줄일 수 있는지, 그 제어가 pull request 안에 있는지 확인했다.

![저장소의 robots.txt와 공개 응답의 줄 수 비교](../../../assets/blog/official-geo-subtraction-gsc-control-2026/robots-live-vs-git.png)

## 45줄을 검토했는데, 공개된 것은 106줄이었다

터미널에 먼저 친 명령이다.

```text
$ curl -sL https://jangwook.net/robots.txt | wc -l
106

$ wc -l public/robots.txt
45 public/robots.txt
```

바이트 수도 달랐다. 저장소 파일은 1,101바이트, 공개 응답은 2,937바이트였다.

저장소 `public/robots.txt`를 CDN이 그대로 내보낼 것으로 봤다. 실제 응답에는 저장소 내용 앞에 CDN 관리 영역이 붙어 있었다. `User-agent: *` 아래에 `Content-Signal: search=yes,ai-train=no,use=reference`가 들어갔고, 학습·확장 봇용 `Disallow: /`도 추가됐다. Google-Extended 거부 그룹도 공개 응답에는 두 번, 저장소에는 한 번 있었다.

`Content-Signal`이 응답에 있음을 확인했으나, Google Search Central 문서에서 Googlebot이 이 규칙을 지원하는지는 확인하지 못했다. 파일에 있다는 사실과 Google이 읽는다는 사실은 다르다.

저장소 diff만 보면 45줄 변경은 검토해도 공개 응답의 61줄은 놓친다. 리뷰어는 크롤러가 받는 제어문을 보지 못하고, 다음 담당자는 저장소만 고치며 서버 접두사를 남겨 둔다. 파일 이름이 같아도 제어 지점은 하나가 아니었다.

## 없는 llms.txt보다 보이지 않는 스위치가 컸다

다음 명령은 더 짧았다.

```text
$ curl -sI https://jangwook.net/llms.txt
HTTP/2 404
```

`www` 호스트도 404였다. 외부 GEO 체크리스트라면 이 파일을 만들라고 적을 상태다. 하지만 Google [생성형 AI 최적화 가이드](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)의 설명은 다르다.

> Doing so will neither harm nor help your site's visibility or rankings in Google Search, as Google Search ignores them.

404라는 사실만으로 파일을 만들 이유는 생기지 않았다. [robots.txt와 llms.txt를 크롤러 제어로 나눈 기록](/ko/blog/ko/ai-crawler-control-robots-txt-llms-txt-2026/)과 같은 층이다. 이번엔 Google이 그 파일을 검색에 쓰지 않는다고 명시한 문장을 공개 URL의 404와 나란히 둔다. 외부 GEO 도구를 쓰지 않았고 수치를 믿지도 않았다. 같은 가이드는 생성형 검색을 별개 순위로 떼어놓지 않는다.

> From Google Search's perspective, optimizing for generative AI search is optimizing for the search experience, and thus still SEO.

확인할 것은 `llms.txt`가 아니라 Search Console 속성 제어였다. [Google 도움말](https://support.google.com/webmasters/answer/16908024)은 경로를 `Settings > Search generative AI`로, 상태를 `include`, `exclude`, `inherit from parent` 세 가지로 안내한다. 기본값은 `include`다. 제외하면 AI Overviews, AI Mode, Discover 생성형 기능의 링크와 근거 입력, 노출과 트래픽이 빠진다.

도메인 속성의 제외는 개별 설정이 없는 URL 접두사 하위 속성으로 상속된다. 저장소 diff로는 Search Console 스위치 상태를 알 수 없다.

Search Console에 로그인하지 않아 이 속성에 메뉴가 실제로 보이는지는 확인하지 못했다. 기능이 순차 적용 중이라 화면이 없다고 제외 상태인 것은 아니다. 이 제어 역시 특정 생성형 기능 노출 여부만 다룰 뿐, 다른 검색 영역의 순위 신호로는 쓰이지 않는다.

## HTML 여덟 장에는 내가 찾던 태그가 없었다

`/`, `/ko/`, `/en/`, `/ko/blog/`, 글 세 편, `/ko/contact/` 여덟 장을 공개 URL로 가져왔다. 모두 HTTP 200이었다.

HTML을 정규식으로 확인했다. `<meta name="robots">`와 `data-nosnippet` 속성은 0개였다. [robots meta가 head 밖으로 떨어지는 착지점](/ko/blog/ko/robots-meta-head-body-parser-placement-2026/)을 잰 뒤에 다시 센 값이다. 이번엔 파서 픽스처가 아니라 공개 여덟 장의 생 HTML이다. 본문에 `nosnippet` 단어가 들어간 페이지가 하나 있었으나 지시자가 아닌 설명 문장이었다.

여덟 페이지 안에 스니펫 축소 지시자가 없음을 확인했을 뿐, Google의 표시 판단 전체를 뜻하지는 않는다.

JSON-LD도 확인했다. 홈에는 `Organization`, `ImageObject`, `Person`, `WebSite`가 있었다. `/ko/`와 `/en/`에는 `FAQPage`가, 글에는 `WebPage`, `SpeakableSpecification`, `BreadcrumbList`, `BlogPosting`이 더해졌다.

이 타입들이 생성형 검색 자격을 주지는 않는다. Google은 구조화 데이터가 생성형 검색에 필수라거나 전용 타입이 있다고 하지 않는다. 구조화 데이터는 리치 결과 자격에 연결된다.

[Google AI 기능 문서](https://developers.google.com/search/docs/appearance/ai-features)에도 다음 문장이 있다.

> There are no additional requirements to appear in AI Overviews or AI Mode, nor other special optimizations necessary.

태그를 늘리기 전에 현재 응답에 없는 것부터 셌다.

## GEO를 세 층으로 나누니, 고칠 곳이 달라졌다

![생성형 검색에 닿는 세 제어 층](../../../assets/blog/official-geo-subtraction-gsc-control-2026/three-layers.png)

측정 결과를 “SEO 설정을 점검했다”고 뭉뚱그리면 각자 다른 일을 떠올린다. 실제로는 세 층이 서로 다른 역할을 한다.

첫째는 Search Console 속성 스위치다. 생성형 AI 기능 포함 여부를 정한다. 기본값은 포함이며, 제외를 고르면 링크와 근거 입력, 노출과 트래픽이 빠진다. 이 층은 PR diff에 나타나지 않으므로 화면에서 확인해야 한다.

둘째는 색인과 스니펫을 다루는 페이지 지시자다. 검색에서 완전히 빼는 `noindex`, 스니펫을 줄이는 robots meta와 `data-nosnippet`가 속한다. [스니펫 지시자가 AI Overview 입력을 끊는 경로](/ko/blog/ko/robots-snippet-controls-ai-overviews-2026/)는 이 둘째 층이다. 여덟 장에는 그 지시자가 없었다. `robots.txt`는 크롤러가 먼저 받는 응답이며, 내 사이트는 저장소 45줄과 공개 106줄로 갈렸다.

셋째는 구조화 데이터다. JSON-LD는 리치 결과 자격과 연결될 뿐 생성형 검색 전용 자격을 만들지 않는다.

속성 스위치를 파일 설정이라 부르면 콘솔을 놓치고, CDN 접두사를 저장소 정책이라 부르면 리뷰받지 않은 바이트가 남는다. 층을 나눠야 개발자는 공개 응답을 대조하고, 운영자는 콘솔을 열며, 콘텐츠 담당자는 불필요한 마크업을 멈춘다.

## 재현한 명령과 재현하지 않은 화면

확인한 조건은 공개 URL뿐이다. 다른 사이트에서도 호스트만 바꿔 확인할 수 있다.

```bash
curl -sI https://example.com/llms.txt | head -n 1

curl -sL https://example.com/robots.txt > /tmp/live-robots.txt
diff -u public/robots.txt /tmp/live-robots.txt

python3 - <<'PY'
import re, sys, urllib.request
html = urllib.request.urlopen(sys.argv[1]).read().decode("utf-8", "ignore")
print("robots meta:", re.findall(r"<meta[^>]+name=[\"']robots[\"'][^>]*>", html, re.I))
print("data-nosnippet attrs:", len(re.findall(r"<[^>]+data-nosnippet", html, re.I)))
PY
https://example.com/your-page/
```

Python 코드는 HTML 태그 유무만 확인하며 Search Console 스위치까지 보여주지는 못한다. 속성 화면은 명령줄과 다른 권한 층에 있다.

`nosnippet` 파서를 다시 돌리지 않았고, 순위·노출·AI Overview 인용·클릭·체류 시간·전환도 측정하지 않았다. 증명할 수 있는 범위는 자격을 끊는 위치이지 효과의 크기가 아니다.

## 다음 PR에 들어가지 않는 한 칸

측정 대상은 2026년 8월 14일 `https://jangwook.net` 하나다. `robots.txt`의 CDN 접두사는 이 호스트 설정이며, `Content-Signal`이 응답에 있다고 Googlebot이 읽는다는 뜻은 아니다.

Search Console의 생성형 AI 제어 메뉴가 이 속성에 열려 있는지, 설정값이 `include`인지 상속인지는 확인하지 않았다. 로그인하지 않았으므로 답을 만들지 않는다.

확실히 말할 수 있는 사실은 더 작다. 저장소의 45줄과 공개 응답의 106줄은 달랐다. `llms.txt`는 404였으나 Google은 순위와 노출에 영향이 없다고 밝힌다. HTML 여덟 장에는 robots meta와 `data-nosnippet`가 없었고, JSON-LD에 생성형 검색 전용 타입은 없었다. 가장 큰 제어는 PR에 올라오지 않는다.

그 한 칸을 확인하기 전에는 사이트의 GEO를 줄였다고도 늘렸다고도 말하지 않겠다.

---

*출처: Google Search Central의 [AI features and your website](https://developers.google.com/search/docs/appearance/ai-features), [생성형 AI 최적화 가이드](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide), [Google-Extended](https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers#google-extended), [Search Console 생성형 AI 제어 도움말](https://support.google.com/webmasters/answer/16908024). 공개 측정은 2026년 8월 14일 `https://jangwook.net`에서 했고, 원자료는 `data/official-geo-gsc-control-probe-2026.json`, 그림 생성은 `scripts/chart-official-geo-gsc-control.py`에 남겼다. 측정하지 않은 순위·노출·인용·클릭 수는 본문에 넣지 않았다.*
