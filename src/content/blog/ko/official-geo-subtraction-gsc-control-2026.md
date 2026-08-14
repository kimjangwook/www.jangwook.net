---
title: '공식 GEO 가이드가 지운 것들: Search Console에 생긴 스위치'
description: 'Google 공식 GEO 가이드는 llms.txt와 전용 스키마를 무시하라고 적는다. 개발자가 봐야 할 새 장치는 Search Console 생성형 AI 제어와, git이 아닌 라이브 robots.txt다.'
pubDate: '2026-08-14'
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
      ko: 그 글이 페이지 단위 nosnippet·max-snippet이 AI Overview 입력까지 잠그는 레버라면, 이 글은 그 위에 얹힌 속성 단위 Search Console 스위치와 공식 빼기 목록을 맞춘다.
      ja: あちらがページ単位の nosnippet・max-snippet で AI Overview 入力を閉じるレバーなら、こちらはその上に載るプロパティ単位の Search Console スイッチと公式の引き算リストを揃える。
      en: "That post is the page-level lever. nosnippet and max-snippet close AI Overview input. This one sits above it with the property-level Search Console switch and the official subtraction list."
      zh: 那篇是页面级开关，nosnippet、max-snippet 会关掉 AI Overview 的输入。这篇叠在上面：属性级 Search Console 开关，以及官方划掉的清单。
  - slug: ai-crawler-control-robots-txt-llms-txt-2026
    score: 0.86
    reason:
      ko: 크롤러를 들일지 말지는 그 글의 robots.txt 설계다. 오늘은 그 파일이 라이브에서 CDN 접두를 입고 길어졌고, 공식은 llms.txt를 Google Search가 무시한다고 다시 못 박은 지점을 잰다.
      ja: クローラーを入れるかはあちらの robots.txt 設計だ。今日はそのファイルがライブで CDN 接頭辞を着て長くなり、公式が llms.txt を Google Search は無視すると再確認した地点を測る。
      en: Whether a crawler gets in is that post's robots.txt design. Today the live file grew a CDN prefix, and the official guide restated that Google Search ignores llms.txt.
      zh: 爬虫进不进门，是那篇的 robots.txt 设计。今天量的是线上文件被 CDN 前缀拉长，以及官方再次写明 Google Search 会忽略 llms.txt。
  - slug: faqpage-deprecation-ai-citation-2026
    score: 0.74
    reason:
      ko: 검증기를 통과한 FAQPage가 리치 결과에서는 이미 끝난 이야기라면, 생성형 검색용 전용 스키마를 더 얹는 일도 같은 함정이다. 자격과 노출은 따로 논다.
      ja: 検証を通った FAQPage がリッチリザルトではすでに終わっているなら、生成検索用の専用スキーマを足すのも同じ罠だ。資格と露出は別物である。
      en: If a valid FAQPage already stopped producing a rich result, adding a special schema just for generative search is the same trap. Eligibility and appearance are not the same job.
      zh: 若通过校验的 FAQPage 在富结果里已经收场，再为生成式搜索加一套专用 schema，是同一个坑。资格和露出不是一回事。
  - slug: validate-structured-data-ci-jsonld-2026
    score: 0.7
    reason:
      ko: JSON-LD를 CI에서 막는 일은 리치 결과 자격을 지키는 쪽에 남는다. 공식은 그 마크업이 생성형 검색의 필수 조건이 아니라고 했으니, 게이트의 목적을 다시 적어야 한다.
      ja: JSON-LD を CI で止める仕事はリッチリザルト資格を守る側に残る。公式はそのマークアップが生成検索の必須ではないとしたので、ゲートの目的を書き直す必要がある。
      en: Catching JSON-LD in CI still belongs on the rich-result side. Official guidance says that markup is not required for generative search, so the gate's purpose has to be rewritten.
      zh: 在 CI 里拦住 JSON-LD，仍然是在守富结果资格。官方说这套标记不是生成式搜索的必要条件，门禁的目的得重写。
  - slug: json-ld-graph-entity-linking-2026
    score: 0.64
    reason:
      ko: 엔티티를 @graph로 묶는 작업은 사라지지 않는다. 다만 그 작업의 이유를 "AI Overview 전용 최적화"로 쓰면 공식 문서와 어긋난다.
      ja: エンティティを @graph で結ぶ仕事は消えない。ただしその理由を「AI Overview 専用最適化」と書くと公式文書とずれる。
      en: Linking entities in an @graph does not go away. Calling that work an AI Overview-only optimization, though, is out of line with the official guide.
      zh: 用 @graph 把实体串起来，这件事不会消失。但若把理由写成“AI Overview 专用优化”，就和官方指南拧着了。
---

GEO 체크리스트를 받아 스프린트에 넣으려다 첫 줄에서 멈춘 적이 있을 것이다. 맨 위가 `llms.txt`다. 그 아래는 문단을 200자로 쪼개라는 항목, 생성형 검색 전용 schema.org, "AI가 좋아하는 문장"으로 다시 쓰라는 항목이 이어진다.

2026년 5월 15일에 Google Search Central이 [생성형 AI 기능 최적화 가이드](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)를 올렸고, 7월 10일에 다시 고쳤다. 그 문서를 끝까지 읽으면 체크리스트의 위쪽은 대부분 지우는 쪽이 맞다. 개발자가 새로 만져야 하는 장치는 파일이 아니라 Search Console 속성의 스위치다.

오늘은 그 공식 문장과, 내 사이트가 실제로 내보내는 HTML·robots.txt를 나란히 놓는다. 순위 이야기도, 인용률 이야기도 아니다.

![공식 GEO는 빼는 목록과 스위치 하나다](../../../assets/blog/official-geo-subtraction-gsc-control-2026/hero.png)

## 생성형 검색이 페이지를 집어 올리는 자리

먼저 용어부터 고정한다. **AI Overview**는 복잡한 질문에 짧은 요지와 근거 링크를 붙이는 검색 기능이다. **AI Mode**는 비교·추론처럼 여러 번 찾아봐야 하던 질문을 한 흐름으로 다루는 대화형 검색이다. 둘 다 Google Search의 일부이고, 둘 다 라이브 인덱스의 페이지를 가져와 답을 만든다. Google은 이 과정을 검색 순위 시스템 위에 올린 **RAG(검색 증강 생성)** 와, 원래 질의 주변의 관련 질의를 동시에 던지는 **query fan-out** 으로 설명한다. 잔디 잡초를 어떻게 없애느냐는 질문이면, 제초제와 무화학 제거와 예방이 따로 검색될 수 있다는 식이다.

중요한 건 그 다음이다. 생성형 기능에 링크·근거로 나가려면 페이지가 **색인되어 있고**, **스니펫을 보여줄 자격이 있어야** 한다. [AI features and your website](https://developers.google.com/search/docs/appearance/ai-features) 문서의 문장은 이렇다.

> There are no additional requirements to appear in AI Overviews or AI Mode, nor other special optimizations necessary.

출처: [AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)

추가 요건이 없고 특수 최적화도 필요 없다. 같은 문서는 그래도 기술 요건과 스팸 정책과 사람 대상 콘텐츠 가이드는 지키라고 이어간다. 자격이 된다고 해서 크롤·색인·게재가 보장되지는 않는다. 그 유보는 검색 일반과 같다.

스니펫 자격은 이미 한 번 재봤다. `<meta name="robots">`의 `nosnippet`과 `max-snippet:0`이 AI Overview·AI Mode의 직접 입력까지 막는다는 공식 정의는 [robots 스니펫 지시자 실측](/ko/blog/ko/robots-snippet-controls-ai-overviews-2026)에 적어 두었다. 오늘은 그 레버를 다시 재지 않는다. 그 위에 얹힌 층이 늘었기 때문이다.

생성형 검색 최적화 가이드는 그 층을 이렇게 적는다. 검색 기술 요건에 더해, 사이트가 Search Console의 생성형 AI 기능에 **포함**되어 있어야 생성형 기능에 표시될 자격이 생긴다. 문장 하나만 놓고 보면 SEO 체크리스트가 아니라 속성 설정 이야기다.

## 공식 문서가 지운 네 가지

가이드의 신화 깨기 절은 AEO·GEO라는 이름을 검색 경험 최적화의 별칭으로 취급한다. 관점은 한 줄로 끝난다.

> From Google Search's perspective, optimizing for generative AI search is optimizing for the search experience, and thus still SEO.

출처: [Optimizing your website for generative AI features](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)

그래서 개발자 백로그에서 먼저 지울 항목이 분명해진다.

| 시중에 도는 항목 | 공식 입장 | 코드/설정에서 할 일 |
| --- | --- | --- |
| `llms.txt`·전용 AI 파일 | Google Search는 쓰지 않는다. 만들어도 노출·순위에 득도 해도 없다 | Google Search용으로 만들지 않는다. 다른 시스템이 읽는다면 그 목적만 남긴다 |
| 모델을 위해 글을 잘게 쪼개기 | 요구하지 않는다. 여러 주제를 한 페이지에서 이해한다고 적혀 있다 | 독자 단위로 길이를 정한다 |
| AI만 노린 문장 재작성 | 동의어·의미를 이해하니 모든 롱테일을 따로 쓸 필요가 없다 | 사람 독자용 초안을 유지한다. 변형 페이지를 양산하면 [scaled content](https://developers.google.com/search/docs/essentials/spam-policies#scaled-content) 정책과 충돌한다 |
| 생성형 검색 전용 schema.org | 필요 없다. 전용 마크업도 없다 | 리치 결과용 마크업은 그대로 두되, "AI Overview용 스키마"를 새로 깔지 않는다 |

`llms.txt`에 대한 문장은 더 직접적이다.

> Doing so will neither harm nor help your site's visibility or rankings in Google Search, as Google Search ignores them.

출처: 같은 [최적화 가이드](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)의 LLMS.txt 항목

해롭지도 이롭지도 않다. 다른 서비스가 읽는다면 유지해도 된다. Google Search 작업 목록에서는 빠져야 한다. [robots.txt와 llms.txt로 크롤러를 나누는 글](/ko/blog/ko/ai-crawler-control-robots-txt-llms-txt-2026)에서 이미 학습용 봇과 검색용 봇을 갈라 놓았다면, 오늘은 그 파일 하나를 "Google이 읽는 레버"로 착각하지 않으면 된다.

구조화 데이터 절은 한 번 더 읽어야 한다. 생성형 검색에 필수가 아니고 전용 타입이 없다. 그러면서도 리치 결과 자격에는 계속 쓰이니, 전체 SEO 전략의 일부로는 남기라고 한다. 나는 이 문장을 "JSON-LD를 지워라"로 읽지 않는다. "생성형 검색 때문에 스키마를 하나 더 얹지 마라"로 읽는다. 구조화 데이터가 순위를 보장하지 않는다는 점은 Google이 오래 적어 온 한계이고, 인용도 보장하지 않는다.

가짜 언급을 웹 여기저기에 심는 일도 공식은 도움이 안 된다고 본다. 핵심 순위 시스템은 품질에 기대고, 스팸 시스템은 그걸 걸러 내며, 생성형 기능은 둘 다에 의존한다. 개발 티켓으로 만들 일이 아니다.

제3자 도구가 "내부 지표"를 본다는 주장도 같은 문서가 잘라 낸다. 내부 순위·AI 시스템에 접근하는 제3자 도구는 없다. [제3자 SEO 조언 평가 가이드](https://developers.google.com/search/docs/fundamentals/third-party-seo)는 AEO·GEO 조언을 공식 문서와 대조하라고 한다. 도구를 워크플로에 쓰는 것 자체는 막지 않는다. 그 숫자를 Google 숫자처럼 다루면 안 된다.

## Search Console에 생긴 스위치, 그리고 상속

최적화 가이드가 "Search Console에 포함되어 있어야 한다"고 적은 대상은, 도움말의 [Search generative AI control](https://support.google.com/webmasters/answer/16908024)이다. 설정 경로가 문서에 있다. Settings > Search generative AI.

선택지는 세 가지다. 사이트 링크와 콘텐츠를 생성형 AI 기능에 포함한다. 제외한다. 부모 속성을 따른다. 포함이 모든 속성의 기본값이다. 제외하면 AI Overview, AI Mode, Discover의 생성형 기능에서 링크와 그라운딩 입력으로 쓰이지 않는다. 그 기능에서 오는 노출·트래픽도 없다.

한계를 공식 문장으로 고정한다.

> This control only affects whether your content can appear in certain Search generative AI features; this control isn't used as a ranking or inclusion signal affecting other parts of Search.

출처: [Search generative AI control](https://support.google.com/webmasters/answer/16908024)

검색 나머지에 대한 순위 신호가 아니다. 학습 제한도 이 스위치의 일이 아니다. 학습을 줄이려면 [Google-Extended](https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers#google-extended)를 쓰고, 검색 전체에서 빼려면 `noindex`를 쓴다. 제외 반영은 제어가 살아난 뒤 대체로 1〜2일, 캐시 때문에 더 걸릴 수 있다.

여기가 팀 이야기다. 도메인 속성에서 누군가 제외를 누르면, 따로 설정하지 않은 URL-prefix 자식 속성은 그걸 상속한다. 블로그가 `https://example.com/blog/` 속성으로 분리되어 있어도, 부모가 먼저 손을 댔으면 자식은 기본으로 따라간다. HTML을 아무리 깨끗이 내보내고 robots.txt를 아무리 나눠 짜도, 속성 스위치가 꺼져 있으면 생성형 기능 자격은 그 층에서 끊긴다.

제어와 리포트는 아직 일부 사이트에만 열린다. 2026년 6월 3일 [생성형 AI 실적 보고서 발표](https://developers.google.com/search/blog/2026/06/gen-ai-performance-reports)도 일부 속성부터다. 리포트가 보이는 숫자는 노출(impression)이다. 클릭과 순위가 아니다. Search Labs 실험 데이터는 빠진다. 화면이 없다고 사이트가 제외된 것은 아니다. 배포 대상이 아니거나, 생성형 기능 노출이 아직 모자랄 수 있다.

나는 이 글을 쓰기 위해 Search Console에 로그인하지 않았다. 내 속성에 그 메뉴가 있는지는 여기서 단정하지 않는다. 단정할 수 있는 쪽은 문서의 기본값이 포함이라는 점, 그리고 상속이 문서에 적혀 있다는 점이다. 조직이라면 부모 속성과 자식 속성을 같은 표에 놓고 누가 이 스위치를 소유하는지부터 적는 편이 맞다. 페이지 마크업을 만지는 사람과 Search Console 소유자가 다른 팀이면, 이 층은 코드 리뷰에 안 잡힌다.

배포 순서를 팀 기준으로 다시 쓰면 이렇게 된다. 먼저 부모 도메인 속성의 현재 값을 확인한다. 자식 URL-prefix가 상속 중인지, 수동으로 덮었는지 적는다. 그다음에야 템플릿의 robots meta와 라이브 robots.txt를 본다. 순서를 뒤집으면, 마크업을 일주일 고치고도 생성형 기능에서 통째로 빠져 있는 상태를 설명하지 못한다. 스위치 변경의 반영 시간도 문서가 1〜2일이라고 못 박아 두었으니, 바꾼 날 오후에 리포트가 안 바뀌었다고 롤백할 일은 아니다.

![자격은 세 층이다](../../../assets/blog/official-geo-subtraction-gsc-control-2026/three-layers.png)

## 라이브 robots.txt가 git과 달랐다

공식 빼기 목록을 읽고 나서 내가 한 일은 새 파일을 만드는 쪽이 아니었다. 크롤러가 실제로 받는 바이트를 받는 쪽이었다. 2026년 8월 14일, `https://jangwook.net`에 대해 `curl`로 공개 표면만 집었다.

```bash
curl -sI https://jangwook.net/llms.txt
# HTTP/2 404

curl -sL https://jangwook.net/robots.txt | wc -l
# 106

# repo의 public/robots.txt 는 45줄, 1,101바이트
# 라이브는 106줄, 2,937바이트
```

`llms.txt`는 404다. `LLMs.txt`와 `www` 호스트도 같았다. Google Search가 무시하는 파일을 일부러 깔아 두지 않은 상태와 일치한다.

robots.txt는 달랐다. 저장소 파일은 학습 봇(`GPTBot`, `ClaudeBot`, `CCBot`, `Google-Extended`)을 막고, 검색 봇과 `*`에는 교차 언어 URL만 막는 45줄이다. 라이브 응답은 그 앞에 CDN 관리 접두가 붙어 106줄이 된다. `User-agent: *`에 `Content-Signal: search=yes,ai-train=no,use=reference`가 있고, 여러 학습·확장 봇에 대한 `Disallow: /`가 한 번 더 있다. 저장소 본문은 그 뒤에 그대로 이어진다.

![git의 robots.txt와 라이브 응답의 줄 수](../../../assets/blog/official-geo-subtraction-gsc-control-2026/robots-live-vs-git.png)

`Content-Signal`은 이 글의 공식 출처인 Search Central robots.txt 안내에서 지원 규칙으로 확인하지 못했다. 라이브 파일에 적혀 있다는 사실과, Googlebot이 그 토큰을 소비한다는 주장은 다른 층이다. 후자는 여기서 단정하지 않는다. 제3자 관례로 보고, Google Search 자격의 근거로 쓰지 않는다.

페이지 여덟 장(`/`, `/ko/`, `/en/`, `/ko/blog/`, 글 세 편, `/ko/contact/`)은 모두 HTTP 200이었다. `<meta name="robots">`는 0건, `data-nosnippet` 속성은 0건이었다. 글 본문에 `nosnippet`이라는 단어가 등장하는 페이지는 있었지만, 지시자 태그는 아니었다. 기본 템플릿이 robots 태그를 비워 두는 설계와 맞는다. `noindex`를 켠 페이지만 태그를 넣는다.

JSON-LD는 홈에 `Organization`·`Person`·`WebSite`, 글에 `BlogPosting`·`WebPage`·`BreadcrumbList`가 실려 있었다. 오늘 문서 기준으로 그 마크업은 생성형 검색의 입장권이 아니다. 리치 결과와 엔티티 정리 쪽에 남는 일이다. [FAQPage 리치 결과가 끝난 뒤에도 Q&A 마크업을 남긴 이유](/ko/blog/ko/faqpage-deprecation-ai-citation-2026)와 같은 선이다. 검증 통과와 검색 노출은 원래 다른 사건이다.

라이브와 git이 갈라진 지점이 오늘의 실측이다. GEO 작업을 "저장소에 파일 하나 추가"로 생각하면, 크롤러가 읽는 파일은 이미 저장소 밖에서 길어져 있다. 검사 항목은 `public/robots.txt` diff가 아니라 배포된 URL이다.

## 에이전트가 읽는 것은 접근성 트리이기도 하다

공식 가이드의 마지막 절은 브라우저 에이전트다. 예약을 대신하거나 사양을 비교하는 쪽이고, 검색 인용과는 결이 다르다. 그래도 개발자가 만지는 표면은 같다. [web.dev의 agent-friendly 안내](https://web.dev/articles/ai-agent-site-ux)는 에이전트가 사이트를 보는 경로를 세 가지로 적는다. 스크린샷, 원본 HTML, 접근성 트리.

접근성 트리는 역할·이름·상태를 남기고 시각 장식을 버린 요약이다. 스크린 리더가 쓰는 그 트리와 같다. `div`를 버튼처럼 보이게 만들어 두면, DOM만 읽는 쪽은 버튼을 못 보고, 스크린샷만 보는 쪽은 위치를 알아도 동작은 모른다. 시맨틱 HTML과 라벨 연결은 접근성 점수 이야기가 아니라, 기계가 동작을 오인하지 않게 하는 신호다.

최적화 가이드도 시맨틱 HTML을 "완벽한 코드"가 아니라 사람 가독성과 보조기술 파싱 쪽으로 설명한다. 웹 전체가 유효한 HTML이 아니며 Google은 그걸 이해한다고 적혀 있다. 그래도 가능하면 쓰라는 이유는 검색 크롤러만이 아니다. 에이전트가 같은 트리를 읽는다.

그래서 남은 구현은 화려하지 않다. 버튼은 `button`과 `a`로 내보낸다. 입력에는 `label for`를 붙인다. 투명 오버레이로 클릭 영역을 가리지 않는다. 레이아웃이 카테고리마다 크게 뛰지 않게 한다. 이 목록은 WCAG를 다시 쓰는 일이기도 하고, 에이전트 안내용 새 포맷을 만드는 일이 아니기도 하다.

web.dev 문서는 스크린샷만 믿는 경로가 느리고 비싸다고 적는다. 구조가 흐릴 때의 보조 수단이다. 주 경로를 접근성 트리와 DOM에 두면, 검색 크롤러가 읽는 텍스트와 에이전트가 읽는 역할이 같은 마크업에서 나온다. 검색용 숨은 텍스트를 하나 더 심는 일과는 방향이 반대다.

## 스프린트 백로그에서 지울 줄, 남길 줄

오늘 대조에서 내가 택한 쪽을 적는다. Google 공식 GEO 문서는 더하기 가이드가 아니다. 시중 항목을 지운 뒤에, 검색에 쓰이던 기술 표면과 Search Console 스위치 하나를 남긴 문서다.

지울 줄:

- Google Search용 `llms.txt` 신규 작성, 전용 AI 마크다운, 생성형 검색 전용 schema.org
- 모델을 위한 문단 쪼개기와 AI 전용 문장 재작성, 질의 변형마다 페이지를 늘리는 일
- 제3자 도구의 "내부 지표"를 배포 게이트의 숫자로 쓰는 일

남길 줄:

- 색인·스니펫 자격. 템플릿에 `nosnippet`이 숨어 있지 않은지, `noindex`가 의도한 페이지만 붙는지
- 배포된 `robots.txt`를 URL로 받아 git과 diff. CDN 접두가 학습 봇과 검색 봇을 의도와 반대로 바꾸지 않았는지
- Search Console 부모·자식 속성의 생성형 AI 제어. 기본값은 포함. 화면이 아직 없으면 배포 대상이 아닐 수 있다. 없다고 제외로 단정하지 않는다
- 시맨틱 HTML과 접근성 트리. 에이전트 안내는 새 포맷이 아니라 기존 마크업이다
- 리치 결과용 JSON-LD는 목적 란을 "생성형 검색 필수"가 아니라 "리치 결과 자격"으로 다시 쓴다

바로 적용할 최소 명령은 이것이다.

```bash
# 1) Google Search가 무시한다고 한 파일이 실수로 200을 내는지
curl -sI https://example.com/llms.txt | head -n 1

# 2) 크롤러가 받는 robots.txt가 저장소와 같은지
curl -sL https://example.com/robots.txt > /tmp/live-robots.txt
diff -u public/robots.txt /tmp/live-robots.txt

# 3) 페이지에 robots meta가 있는지 (지시자인지 본문 단어인지는 속성으로 가린다)
python3 - <<'PY'
import re, sys, urllib.request
html = urllib.request.urlopen(sys.argv[1]).read().decode("utf-8", "ignore")
print("robots meta:", re.findall(r"<meta[^>]+name=[\"']robots[\"'][^>]*>", html, re.I))
print("data-nosnippet attrs:", len(re.findall(r"<[^>]+data-nosnippet", html, re.I)))
PY
https://example.com/your-page/
```

이 세 줄이 통과해도 Search Console 스위치는 보이지 않는다. 그 층은 브라우저가 아니라 속성 설정에 있다. 코드 리뷰만으로 닫히지 않는 구멍이 거기 있다.

생성형 기능 노출은 보장되지 않는다. 포함으로 두어도, 스니펫 자격이 있어도, 색인이 되어도, Google이 그 페이지를 집어 올린다는 약속은 문서 어디에도 없다. 오늘 잰 것은 자격의 층이지 효과의 크기가 아니다.

한 가지 더 적는다. 생성형 AI 실적 보고서가 열려도 그 숫자는 배포 판단의 전부가 되면 안 된다. 공식 발표가 세는 것은 노출이고, 클릭과 체류와 전환은 그 화면에 없다. 노출이 늘었다고 마크업을 더 얹거나, 노출이 없다고 스위치를 켜고 끄는 실험을 하루에 여러 번 반복하는 일은, 문서가 적어 둔 반영 시간과도 안 맞는다. 리포트가 아직 없는 속성에서 할 수 있는 일은 노출을 추정하는 게 아니라, 세 층이 열려 있는지만 확인하는 일이다.

세 층을 저장소와 라이브 URL과 속성 설정에 대조하다 어디서 끊기는지 안 보이면, 그 층만 들고 와도 된다. 나는 공식 문서와 배포된 바이트 사이를 맞추는 일을 한다.
---
*출처: Google Search Central의 [생성형 AI 기능 최적화 가이드](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)(2026-07-10 갱신), [AI features and your website](https://developers.google.com/search/docs/appearance/ai-features), [제3자 SEO 조언 가이드](https://developers.google.com/search/docs/fundamentals/third-party-seo), [생성형 AI 실적 보고서 발표](https://developers.google.com/search/blog/2026/06/gen-ai-performance-reports)(2026-06-03), Search Console 도움말의 [Search generative AI control](https://support.google.com/webmasters/answer/16908024)·[Generative AI performance report](https://support.google.com/webmasters/answer/16984139), web.dev의 [Build agent-friendly websites](https://web.dev/articles/ai-agent-site-ux)(모두 공식). 본문의 영문 블록인용 네 건은 각 원문 페이지를 가져와 공백을 접은 뒤 대조한 문자열이고, 인용 곁에 원문 링크를 두었다. 라이브 측정: 2026-08-14, `https://jangwook.net`의 robots.txt·llms.txt·페이지 8장, curl + HTML 파싱. 원자료는 `data/official-geo-gsc-control-probe-2026.json`, 그림은 `scripts/chart-official-geo-gsc-control.py`. Search Console에는 로그인하지 않았다. Content-Signal은 라이브 robots.txt에 존재할 뿐, Google Search Central robots.txt 지원 규칙으로 확인하지 못했다. 구조화 데이터와 이 스위치는 순위를 보장하지 않는다.*
