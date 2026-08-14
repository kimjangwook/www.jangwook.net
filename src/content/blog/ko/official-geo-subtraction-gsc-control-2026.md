---
title: 'GEO 가이드가 지운 일과 Search Console 스위치'
description: '공식 GEO 가이드는 llms.txt와 전용 스키마를 검색 신호로 쓰지 않는다. 오늘 공개 URL로 잰 것은 llms.txt 404, 라이브 robots.txt 106줄(git은 45줄), 그리고 코드 리뷰에 안 잡히는 Search Console 생성형 AI 속성 스위치다.'
pubDate: '2026-08-14'
updatedDate: '2026-08-14'
heroImage: '../../../assets/blog/official-geo-subtraction-gsc-control-2026/hero.png'
tags:
  - SEO
  - GEO
  - AIO
  - Search-Console
faq:
  - question: 'llms.txt를 만들면 Google AI Overview에 유리한가?'
    answer: '아니다. Google Search Central의 생성형 AI 최적화 가이드는 Google Search가 이 파일을 무시하며, 만들어도 노출·순위에 도움이 되지도 해가 되지도 않는다고 적는다. 다른 서비스가 읽는다면 유지해도 되지만 Google Search용 작업은 아니다.'
  - question: '생성형 검색용 특수 schema.org가 따로 있나?'
    answer: '공식 문서는 없다고 한다. 구조화 데이터는 리치 결과 자격에는 여전히 쓰이지만, 생성형 검색을 위한 전용 마크업을 추가할 필요는 없다. 구조화 데이터가 순위나 인용을 보장하지도 않는다.'
  - question: 'Search Console 생성형 AI 제어를 끄면 일반 검색에서도 빠지나?'
    answer: '공식 도움말은 이 제어가 특정 생성형 AI 기능의 표시에만 영향을 주고, 검색의 다른 부분에 대한 순위·포함 신호가 아니라고 적는다. 학습 제한은 Google-Extended, 검색 전체 제외는 noindex가 담당한다. 제어 UI는 아직 일부 속성에만 배포 중이다.'
relatedPosts:
  - slug: robots-snippet-controls-ai-overviews-2026
    score: 0.88
    reason:
      ko: 페이지에 nosnippet을 심으면 AI Overview 입력에서 빠진다. 오늘은 그 위층, Search Console 속성에 생긴 스위치를 본다.
      ja: ページに nosnippet を置くと AI Overview の入力から外れる。今日はその上、Search Console プロパティに付いたスイッチを見る。
      en: nosnippet takes a page out of AI Overview input. This one looks at the switch that landed above that, on the Search Console property.
      zh: 页面加上 nosnippet，就会从 AI Overview 的输入里拿掉。这篇看的是更上面那层：Search Console 资源上的开关。
  - slug: ai-crawler-control-robots-txt-llms-txt-2026
    score: 0.86
    reason:
      ko: 학습 봇과 검색 봇을 가르는 설계는 그쪽에 있다. 오늘은 그 robots.txt가 라이브에서 CDN 접두를 입고 길어진 상태를 잰다.
      ja: 学習ボットと検索ボットを分ける設計はあちらにある。今日はその robots.txt がライブで CDN 接頭辞を着て長くなった状態を測る。
      en: Splitting training bots from search bots is that post. This one measures the live file after a CDN prefix made it longer than git.
      zh: 训练爬虫和搜索爬虫怎么分开，写在那篇。这篇量的是线上 robots.txt 被 CDN 前缀拉长之后。
  - slug: faqpage-deprecation-ai-citation-2026
    score: 0.74
    reason:
      ko: 검증기를 통과한 FAQPage가 리치 결과에서는 이미 끝났다. 생성형 검색용 스키마를 하나 더 얹는 일도 같은 함정이다.
      ja: 検証を通った FAQPage はリッチリザルトではもう終わっている。生成検索用スキーマを足すのも同じ穴だ。
      en: A valid FAQPage already stopped producing a rich result. Adding a schema just for generative search is the same hole.
      zh: 通过校验的 FAQPage，富结果这边已经收场了。再为生成式搜索加一种 schema，是同一个坑。
  - slug: validate-structured-data-ci-jsonld-2026
    score: 0.7
    reason:
      ko: CI에서 JSON-LD를 막는 일은 리치 결과 쪽 일이다. 공식은 그 마크업을 생성형 검색의 입장권으로 보지 않는다.
      ja: CI で JSON-LD を止める仕事はリッチリザルト側だ。公式はそのマークアップを生成検索の入場券にしていない。
      en: Blocking bad JSON-LD in CI is still a rich-result job. Official text does not treat that markup as a ticket into generative search.
      zh: 在 CI 里拦住坏 JSON-LD，仍是富结果的事。官方没把这套标记当成生成式搜索的门票。
  - slug: json-ld-graph-entity-linking-2026
    score: 0.64
    reason:
      ko: 엔티티를 @graph로 묶는 작업은 남는다. 이유를 "AI Overview 전용 최적화"로 쓰면 공식 문서와 어긋난다.
      ja: エンティティを @graph で結ぶ仕事は残る。理由を「AI Overview 専用最適化」と書くと公式とずれる。
      en: Linking entities in an @graph still makes sense. Calling it an AI Overview-only optimization does not match the official guide.
      zh: 用 @graph 串实体，这件事还在。但若写成“AI Overview 专用优化”，就和官方指南拧着。
---

코드 리뷰에서 `robots.txt`와 `<meta name="robots">`는 자주 본다. Search Console 속성의 생성형 AI 제어는 그 화면에 안 올라온다. HTML을 고친 PR이 머지돼도, 부모 도메인 속성에서 누군가 제외를 눌러 두면 AI Overview와 AI Mode에서 링크가 빠진다.

오늘 아침 공개 URL만 받아 봤다. Search Console에는 로그인하지 않았다.

![공식 GEO는 빼는 목록과 스위치 하나다](../../../assets/blog/official-geo-subtraction-gsc-control-2026/hero.png)

## HTTP/2 404가 먼저 왔다

```bash
curl -sI https://jangwook.net/llms.txt
# HTTP/2 404
```

`LLMs.txt`도, `www` 호스트도 같은 404. 이 사이트는 그 파일을 깔아 두지 않은 상태다.

시중 GEO 체크리스트는 아직도 맨 위에 `llms.txt`를 둔다. Google Search Central이 2026년 5월 15일에 올린 [생성형 AI 기능 최적화 가이드](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)는 7월 10일에 한 번 더 고쳤다. LLMS.txt 항목은 짧다.

> Doing so will neither harm nor help your site's visibility or rankings in Google Search, as Google Search ignores them.

출처: 같은 [최적화 가이드](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)의 LLMS.txt 항목

다른 시스템이 읽는다면 그 목적만 남긴다. Google Search 백로그에서는 뺀다. [robots.txt와 llms.txt로 크롤러를 나누는 글](/ko/blog/ko/ai-crawler-control-robots-txt-llms-txt-2026)에서 학습용과 검색용을 이미 갈라 두었다면, 여기서 지울 착각은 하나다. Google이 이 파일을 읽는다.

라이브 `robots.txt` 안에는 그 글 URL이 주석으로만 남아 있다. 지시자가 아니다.

## 배포된 파일이 git보다 길다

저장소 `public/robots.txt`는 45줄, 1,101바이트. 라이브는 106줄, 2,937바이트.

```bash
curl -sL https://jangwook.net/robots.txt | wc -l
# 106
```

git 쪽은 학습 봇(`GPTBot`, `ClaudeBot`, `CCBot`, `Google-Extended`)을 막고, 검색 봇과 `*`에는 교차 언어 URL만 가린다. 라이브 응답은 그 앞에 CDN이 붙인 접두가 있다. `User-agent: *`에 `Content-Signal: search=yes,ai-train=no,use=reference`가 있고, 학습·확장 봇 `Disallow: /`가 한 번 더 있다. Google-Extended 차단 그룹은 라이브에서 두 번 보인다. 저장소 본문은 그 뒤에 이어진다.

![git의 robots.txt와 라이브 응답의 줄 수](../../../assets/blog/official-geo-subtraction-gsc-control-2026/robots-live-vs-git.png)

`Content-Signal`은 오늘 읽은 Search Central robots.txt 안내에서 지원 규칙으로 확인하지 못했다. 파일에 적혀 있다는 사실과, Googlebot이 그 토큰을 쓴다는 주장은 별개다. 후자는 단정하지 않는다.

페이지 여덟 장(`/`, `/ko/`, `/en/`, `/ko/blog/`, 글 세 편, `/ko/contact/`)은 전부 HTTP 200이었다. `<meta name="robots">` 0건, `data-nosnippet` 0건. 본문에 `nosnippet`이라는 단어가 나온 페이지는 있었지만 지시자 태그는 아니었다. `noindex`를 켠 페이지만 태그를 넣는 지금 템플릿과 맞는다.

홈 JSON-LD는 `Organization`·`ImageObject`·`Person`·`WebSite`였다. `/ko/`와 `/en/`에는 `FAQPage`가 하나 더 붙는다. 글은 거기에 `WebPage`·`SpeakableSpecification`·`BreadcrumbList`·`BlogPosting`이 얹힌다. 오늘 문서 기준으로 그 마크업은 생성형 검색 입장권이 아니다. 리치 결과와 엔티티 정리 쪽에 남는다. [FAQPage 리치 결과가 끝난 뒤에도 Q&A 마크업을 남긴 이유](/ko/blog/ko/faqpage-deprecation-ai-citation-2026)와 같은 선이다.

GEO 작업을 "저장소에 파일 하나 추가"로 생각하면, 크롤러가 이미 읽는 파일은 저장소 밖에서 커져 있다. 볼 대상은 `public/robots.txt` diff가 아니라 배포된 URL이다.

## 시중 목록에서 지울 네 칸

가이드의 신화 깨기 절은 AEO·GEO를 검색 경험 최적화의 다른 이름처럼 다룬다.

> From Google Search's perspective, optimizing for generative AI search is optimizing for the search experience, and thus still SEO.

출처: [Optimizing your website for generative AI features](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)

시중 목록에서 내가 백로그에서 빼는 칸은 네 개다.

`llms.txt`와 전용 AI 파일. Google Search는 쓰지 않는다. 만들어도 노출·순위에 득도 해도 없다. Google Search용으로 만들지 않는다.

모델을 위해 글을 잘게 쪼개기. 요구하지 않는다. 한 페이지의 여러 주제를 이해한다고 적혀 있다. 길이는 독자 기준으로 정한다.

AI만 노린 문장 재작성. 동의어·의미를 이해하니 롱테일마다 페이지를 늘릴 필요가 없다. 사람용 초안을 유지한다. 변형 페이지 양산은 [scaled content](https://developers.google.com/search/docs/essentials/spam-policies#scaled-content)와 충돌한다.

생성형 검색 전용 schema.org. 필요 없다. 전용 마크업도 없다. 리치 결과용은 남기고, "AI Overview용 스키마"를 새로 깔지 않는다.

구조화 데이터 절은 두 번 읽었다. 생성형 검색에 필수가 아니고 전용 타입도 없다. 리치 결과 자격에는 그대로 쓰이니 SEO 일부로는 남기라고 한다. 나는 그걸 "JSON-LD를 지워라"로 읽지 않았다. "생성형 검색 때문에 타입을 하나 더 얹지 마라"로 읽었다. 순위 보장도, 인용 보장도 원래 없다.

가짜 언급을 웹에 심는 일도 공식은 도움이 안 된다고 본다. 제3자 도구가 "내부 지표"를 본다는 주장도 같은 문서가 잘라 낸다. 내부 순위나 AI 시스템에 들어가는 제3자 도구는 없다. [제3자 SEO 조언 평가 가이드](https://developers.google.com/search/docs/fundamentals/third-party-seo)는 AEO·GEO 조언을 공식 문서와 대조하라고 한다. 도구를 워크플로에 쓰는 것 자체는 막지 않는다. 그 숫자를 Google 숫자처럼 다루면 안 된다.

## 포함, 제외, 부모를 따름

최적화 가이드가 "Search Console에 포함되어 있어야 한다"고 적은 대상은 도움말의 [Search generative AI control](https://support.google.com/webmasters/answer/16908024)이다. 경로: Settings > Search generative AI.

선택지는 세 개다. 포함, 제외, 부모 속성을 따름. 포함이 기본값이다. 제외하면 AI Overview, AI Mode, Discover의 생성형 기능에서 링크와 그라운딩 입력이 빠지고, 그 기능에서 오는 노출·트래픽도 없다.

> This control only affects whether your content can appear in certain Search generative AI features; this control isn't used as a ranking or inclusion signal affecting other parts of Search.

출처: [Search generative AI control](https://support.google.com/webmasters/answer/16908024)

학습 제한도 이 스위치 일이 아니다. 학습을 줄이려면 [Google-Extended](https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers#google-extended), 검색 전체에서 빼려면 `noindex`. 반영은 제어가 살아난 뒤 대체로 1〜2일. 캐시 때문에 더 걸릴 수 있다.

도메인 속성에서 누군가 제외를 누르면, 따로 설정하지 않은 URL-prefix 자식은 그걸 상속한다. 블로그가 `https://example.com/blog/`로 갈라져 있어도 부모가 먼저 손을 댔으면 자식은 기본으로 따라간다. HTML을 깨끗이 내보내고 robots.txt를 나눠 짜도, 속성 스위치가 꺼져 있으면 생성형 기능 자격은 거기서 끊긴다.

제어와 리포트는 아직 일부 사이트에만 열린다. 2026년 6월 3일 [생성형 AI 실적 보고서 발표](https://developers.google.com/search/blog/2026/06/gen-ai-performance-reports)도 일부 속성부터다. 리포트가 세는 숫자는 노출이다. 클릭이 아니고 순위도 아니다. Search Labs 실험 데이터는 빠진다. 화면이 없다고 제외된 것은 아니다. 배포 대상이 아니거나, 생성형 노출이 아직 모자랄 수 있다.

내 속성에 그 메뉴가 있는지는 여기서 단정하지 않는다. 문서상 기본값이 포함이라는 점, 상속이 적혀 있다는 점만 단정한다.

팀이라면 순서를 이렇게 두는 편이 맞다. 부모 도메인 속성의 현재 값부터 본다. 자식 URL-prefix가 상속 중인지, 수동으로 덮었는지 적는다. 그다음에 템플릿의 robots meta와 라이브 robots.txt를 본다. 순서를 뒤집으면 마크업을 일주일 고치고도 생성형 기능에서 통째로 빠진 상태를 설명하지 못한다. 바꾼 날 오후에 리포트가 안 움직였다고 롤백할 일도 아니다. 문서가 이미 1〜2일이라고 적어 두었다.

HTML을 만지는 사람과 Search Console 소유자가 다른 팀이면, 이 층은 코드 리뷰에 안 올라온다.

![자격은 세 층이다](../../../assets/blog/official-geo-subtraction-gsc-control-2026/three-layers.png)

AI Overview는 어려운 질문에 요지와 근거 링크를 붙인다. AI Mode는 비교·추론처럼 예전엔 여러 번 찾아봐야 하던 질문을 한 흐름으로 다룬다. 둘 다 Google 검색 안에 있고, 둘 다 라이브 인덱스에서 페이지를 가져온다. Google은 이 과정을 핵심 순위 위에 올린 RAG와, 원래 질의 주변으로 관련 질의를 동시에 던지는 query fan-out으로 설명한다.

생성형 기능의 링크·근거가 되려면 페이지가 색인되어 있고 스니펫을 보여줄 수 있어야 한다. [AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)의 문장은 이렇다.

> There are no additional requirements to appear in AI Overviews or AI Mode, nor other special optimizations necessary.

출처: [AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)

기술 요건과 스팸 정책과 사람 대상 콘텐츠 가이드는 그대로다. 그걸 지켜도 크롤·색인·게재는 보장되지 않는다. 검색이 원래 하던 유보다.

스니펫 쪽은 이미 한 번 쟀다. `nosnippet`과 `max-snippet:0`이 AI Overview·AI Mode의 직접 입력까지 막는다는 정의는 [robots 스니펫 지시자 실측](/ko/blog/ko/robots-snippet-controls-ai-overviews-2026)에 있다. 오늘은 그 파서를 다시 돌리지 않는다. 위에 속성 스위치가 얹혔기 때문이다.

## 버튼처럼 보이는 div

가이드 끝부분은 브라우저 에이전트다. 예약, 사양 비교. 검색 인용과는 결이 다르다. 만지는 표면은 같다. [web.dev의 agent-friendly 안내](https://web.dev/articles/ai-agent-site-ux)는 경로를 셋으로 적는다. 스크린샷, 원본 HTML, 접근성 트리.

접근성 트리는 역할·이름·상태를 남기고 장식을 버린다. 스크린 리더가 쓰는 그 트리와 같다. `div`를 버튼처럼 보이게 만들어 두면 DOM만 읽는 쪽은 버튼을 못 보고, 스크린샷만 보는 쪽은 위치는 알아도 동작은 모른다.

최적화 가이드도 시맨틱 HTML을 "완벽한 코드"가 아니라 가독성과 보조기술 파싱 쪽으로 설명한다. 웹 전체가 유효한 HTML이 아니며 Google은 그걸 이해한다고 적혀 있다. 그래도 `button`과 `a`를 쓰는 이유는 검색 크롤러만이 아니다.

남은 구현은 밋밋하다. 입력에는 `label for`. 투명 오버레이로 클릭 영역을 가리지 않는다. 카테고리마다 레이아웃이 크게 뛰지 않게 한다. WCAG를 다시 쓰는 일이기도 하고, 에이전트용 새 포맷을 만드는 일이 아니기도 하다.

web.dev는 스크린샷만 믿는 경로가 느리고 비싸다고 적는다. 구조가 흐릴 때의 보조 수단이다. 주 경로를 트리와 DOM에 두면, 크롤러가 읽는 텍스트와 에이전트가 읽는 역할이 같은 마크업에서 나온다. 검색용 숨은 텍스트를 하나 더 심는 일과는 반대다.

## PR에 안 올라오는 설정

바로 적용할 최소 명령은 이것이다.

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

이 세 줄이 통과해도 Search Console 스위치는 안 보인다. 그 층은 브라우저가 아니라 속성 설정에 있다.

지울 일: Google Search용 `llms.txt` 신규 작성, 전용 AI 마크다운, 생성형 검색 전용 schema.org, 모델용 문단 쪼개기, 질의마다 페이지 늘리기, 제3자 "내부 지표"를 배포 게이트 숫자로 쓰기.

남길 일: 색인·스니펫 자격, 라이브 robots.txt와 git의 diff, 부모·자식 속성의 생성형 AI 제어, 시맨틱 HTML, 리치 결과용 JSON-LD의 목적 란을 "생성형 검색 필수"가 아니라 "리치 결과 자격"으로 고쳐 쓰기.

포함으로 두어도, 스니펫이 열려 있어도, 색인이 되어도, Google이 그 페이지를 집어 올린다는 약속은 문서 어디에도 없다. 오늘 잰 것은 자격이 어디서 끊기는지다. 효과의 크기가 아니다.

생성형 AI 실적 보고서가 열려도 그 숫자는 배포 판단의 전부가 되면 안 된다. 세는 것은 노출이다. 클릭과 체류와 전환은 그 화면에 없다. 노출이 늘었다고 마크업을 더 얹거나, 없다고 스위치를 하루에 여러 번 뒤집는 일은 문서가 적어 둔 반영 시간과도 안 맞는다.

라이브 robots.txt와 속성 스위치가 어긋난 지점을 맞추는 일은 내 실무다. 문의는 프로필로.

---
*출처: Google Search Central의 [생성형 AI 기능 최적화 가이드](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)(2026-07-10 갱신), [AI features and your website](https://developers.google.com/search/docs/appearance/ai-features), [제3자 SEO 조언 가이드](https://developers.google.com/search/docs/fundamentals/third-party-seo), [생성형 AI 실적 보고서 발표](https://developers.google.com/search/blog/2026/06/gen-ai-performance-reports)(2026-06-03), Search Console 도움말의 [Search generative AI control](https://support.google.com/webmasters/answer/16908024)·[Generative AI performance report](https://support.google.com/webmasters/answer/16984139), web.dev의 [Build agent-friendly websites](https://web.dev/articles/ai-agent-site-ux)(모두 공식). 본문의 영문 블록인용 네 건은 각 원문 페이지를 가져와 공백을 접은 뒤 대조한 문자열이고, 인용 곁에 원문 링크를 두었다. 라이브 측정: 2026-08-14, `https://jangwook.net`의 robots.txt·llms.txt·페이지 8장, curl + HTML 파싱. 원자료는 `data/official-geo-gsc-control-probe-2026.json`, 그림은 `scripts/chart-official-geo-gsc-control.py`. Search Console에는 로그인하지 않았다. Content-Signal은 라이브 robots.txt에 존재할 뿐, Google Search Central robots.txt 지원 규칙으로 확인하지 못했다. 구조화 데이터와 이 스위치는 순위를 보장하지 않는다.*
