---
title: '1년 전 글의 Last-Modified가 어제였다: 배포가 지우는 캐시 검증자'
description: '작년에 쓴 글을 curl로 찔러보니 Last-Modified가 어제 배포 시각이었다. ETag를 뜯어보니 파일 수정 시각과 크기를 16진수로 이어붙인 값이다. 같은 소스로 다시 빌드한 HTML 1,346장이 100% 바이트 동일한데도, 배포 한 번이 사이트 전체의 조건부 요청을 무효로 만든다.'
pubDate: '2026-08-03'
heroImage: '../../../assets/blog/etag-deploy-invalidation-conditional-requests-2026/hero.png'
tags:
  - SEO
  - 크롤링
  - HTTP캐싱
  - 정적호스팅
  - 웹개발
faq:
  - question: '304를 많이 돌려주면 검색 순위가 오르나요?'
    answer: 'Google 공식 문서 어디에도 그런 말은 없습니다. 캐싱 관련 공식 글이 말하는 이득은 서버가 본문을 생성하지 않아도 되고 전송하지 않아도 된다는 두 가지, 즉 비용과 대역폭입니다. 크롤 예산 문서도 304의 효과를 "대역폭과 리소스 절약"으로만 적습니다. 순위 상승은 제가 재지 못했고 공식도 보장하지 않습니다.'
  - question: 'ETag가 mtime 기반이면 HTTP 규격 위반인가요?'
    answer: '위반이 아닙니다. RFC 9110 8.8.3.1은 엔티티 태그 생성 방식으로 "콘텐츠의 충돌 저항 해시, 여러 파일 속성의 조합, 또는 초 이하 해상도를 가진 수정 시각"을 모두 예로 듭니다. mtime과 크기를 붙인 값은 이 중 두 번째에 해당합니다. 문제는 규격 위반이 아니라, 그 값이 배포마다 바뀌어 캐시 재검증이 성립하지 않는다는 실효성 쪽에 있습니다.'
  - question: '정적 호스팅에서 이걸 고칠 수 있나요?'
    answer: '오리진 응답 헤더를 만질 수 있느냐에 달려 있습니다. 직접 서버나 CDN 워커를 통제한다면 파일 내용의 해시를 ETag로 내보내면 끝납니다. 제 사이트가 쓰는 GitHub Pages처럼 응답 헤더 설정 항목이 없는 호스팅이면 그 계층에서는 고칠 수 없고, 앞단에 헤더를 다시 쓰는 CDN을 두는 선택지가 남습니다. 고치기 전에 먼저 이 비용이 자기 규모에서 의미 있는지 판단하는 편이 낫습니다.'
  - question: '배포 때 파일 수정 시각을 보존하면 되지 않나요?'
    answer: '전송 도구 수준에서는 가능합니다. rsync의 -a는 mtime을 보존하므로 내용이 그대로인 파일의 검증자도 그대로 남습니다. 다만 CI에서 저장소를 새로 체크아웃해 빌드하는 흐름이라면 빌드 산출물의 mtime은 그 실행 시각으로 새로 찍힙니다. 그래서 mtime 보존은 배포 파이프라인 전체가 그 시각을 지켜줄 때만 성립하는 해법이고, 내용 해시는 파이프라인과 무관하게 성립합니다.'
relatedPosts:
  - slug: sitemap-lastmod-crawl-scheduling-2026
    score: 0.72
    reason:
      ko: sitemap의 lastmod가 "정확할 때만 쓰인다"면, 응답 헤더의 Last-Modified는 "정확하지 않아도 그냥 쓰인다". 같은 날짜 값이 두 계층에서 반대로 취급되는 이유를 붙여 읽으면 잡힌다.
      ja: sitemapのlastmodが「正確なときだけ使われる」なら、レスポンスヘッダーのLast-Modifiedは「不正確でもそのまま使われる」。同じ日付値が二つの層で逆に扱われる理由が、並べて読むと見えてくる。
      en: If a sitemap's lastmod is only used when it is accurate, the Last-Modified response header is used whether it is accurate or not. Reading both explains why the same date behaves in opposite ways at two layers.
      zh: 如果说 sitemap 的 lastmod「只有准确时才被采用」，响应头里的 Last-Modified 则是「不准确也照用」。把两篇并读，就能看清同一个日期值在两个层面为何被反向对待。
  - slug: internal-link-trailing-slash-redirect-audit-2026
    score: 0.68
    reason:
      ko: 그 글은 크롤러가 링크 절반에서 301을 받는 낭비를 셌고, 이 글은 받아온 본문을 통째로 다시 받는 낭비를 잰다. 둘 다 빌드 산출물은 멀쩡한데 배송 계층에서 새는 경우다.
      ja: あちらはクローラーがリンクの半分で301を受け取る無駄を数え、こちらは同じ本文をまるごと再取得する無駄を測る。どちらもビルド成果物は正しいのに、配信の層で漏れている。
      en: That audit counted the waste of crawlers hitting 301s on half the internal links; this one measures the waste of re-downloading bodies that never changed. Both are leaks in delivery, not in the build.
      zh: 那篇数的是爬虫在一半内部链接上吃到 301 的浪费，本文测的是把没变过的正文整份重下的浪费。两者的构建产物都没问题，漏在投递层。
  - slug: crawl-depth-flat-archive-audit-2026
    score: 0.61
    reason:
      ko: 크롤러가 페이지에 닿는 경로를 셌던 글이다. 이번 글은 그 크롤러가 두 번째로 왔을 때 무엇을 받아가는지를 센다. 첫 방문과 재방문을 각각 재보면 내부 링크와 캐시 헤더가 서로 다른 문제라는 게 분명해진다.
      ja: あちらはクローラーがページへ到達する経路を数えた。今回は同じクローラーが二度目に来たとき何を受け取るかを数える。初回訪問と再訪をそれぞれ測ると、内部リンクとキャッシュヘッダーが別問題だと分かる。
      en: That post counted how a crawler reaches a page. This one counts what it carries away on the second visit. Measuring first visit and revisit separately makes clear that internal links and cache headers are different problems.
      zh: 那篇数的是爬虫如何抵达页面，本文数的是它第二次到访时带走了什么。把首访与回访分开测，就能看出内部链接与缓存头是两个问题。
  - slug: ai-crawlers-dont-render-javascript-csr-2026
    score: 0.55
    reason:
      ko: 크롤러가 무엇을 실행하지 않는지를 쟀던 글과, 크롤러가 무엇을 다시 받아가는지를 재는 글이다. 서버가 내보낸 바이트만이 전부라는 같은 전제 위에 서 있다.
      ja: あちらはクローラーが何を実行しないかを測り、こちらは何を再取得するかを測る。サーバーが送ったバイトだけが全てだという同じ前提の上に立っている。
      en: One post measured what crawlers refuse to execute; this one measures what they fetch all over again. Both rest on the same premise, that the bytes the server sent are all there is.
      zh: 一篇测的是爬虫不执行什么，一篇测的是爬虫又重下了什么。二者立足于同一个前提：服务器发出的字节就是全部。
---

작년 10월에 쓴 글이 있다. 그 뒤로 본문을 손댄 적이 없다. 어제 다른 걸 확인하다가 그 URL에 `curl -I`를 걸었더니 `Last-Modified`가 어제 새벽으로 찍혀 있었다.

오타 하나 고친 적 없는 페이지다. 의심이 생겨 여덟 개 URL을 더 찔러봤다. 2025년 글, 올해 글, 약관 페이지, 중국어판, `robots.txt`까지 전부 `Sun, 02 Aug 2026 16:08:29 GMT`였다. 초 단위까지 같았다. 이 값은 페이지가 바뀐 시각이 아니라 내가 어제 배포한 시각이다.

여기까지는 흔한 정적 호스팅 이야기다. 문제는 그다음이다. 같은 소스로 사이트를 다시 빌드해 봤더니 HTML 1,346장이 SHA-256 기준으로 <strong>한 장도 빠짐없이 이전 빌드와 동일</strong>했다. 콘텐츠는 완벽하게 재현 가능한데, 그 콘텐츠에 붙는 캐시 검증자는 배포할 때마다 전부 새 값이 된다. 크롤러가 어제 받아간 검증자를 들고 다시 오면 서버는 매번 "바뀌었다"고 답한다. 실제로는 한 바이트도 바뀌지 않았는데.

## 검증자가 가리키는 것은 파일이 아니라 배포다

먼저 응답 헤더를 그대로 본다. 1년 가까이 수정하지 않은 글이다.

```bash
$ curl -sSI https://jangwook.net/ko/blog/ko/playwright-ai-testing/
HTTP/2 200
server: GitHub.com
last-modified: Sun, 02 Aug 2026 16:08:29 GMT
etag: "6a6f6b7d-3279e"
cache-control: max-age=600
content-length: 206750
```

`ETag` 값을 뜯어보면 이 헤더가 어디서 나왔는지 바로 드러난다. 하이픈 앞뒤가 각각 16진수다.

```text
0x6a6f6b7d = 1785686909  -> Sun, 02 Aug 2026 16:08:29 GMT  (= Last-Modified와 동일)
0x3279e    = 206750      -> Content-Length와 동일
```

파일의 수정 시각과 크기를 이어 붙인 값이다. Apache와 nginx의 기본 ETag가 오래전부터 써 온 형식이고, GitHub Pages도 같은 형식을 쓴다. 즉 이 사이트의 두 검증자, `ETag`와 `Last-Modified`는 <strong>서로 다른 두 개의 신호가 아니라 하나의 사실(파일 mtime)을 두 번 표현한 것</strong>이다. 하나가 무너지면 다른 하나도 같이 무너진다.

이걸 페이지 몇 장이 아니라 표본으로 확인하려고 감사 스크립트를 하나 만들어 저장소에 넣었다. 빌드 산출물에서 실제 URL을 뽑아 헤더를 수집하고, 받은 검증자를 그대로 되돌려 보내 조건부 요청이 성립하는지 본다.

```bash
$ node scripts/audit-cache-validators.mjs --n=8
base                 https://jangwook.net
urls sampled         8
sends a validator    8/8
304 on revalidate    8/8
cache-control        max-age=600
distinct Last-Modified values across the sample: 1  <-- one shared timestamp: this is a deploy stamp, not a content date
ETags shaped "<hex>-<hex>" (mtime+size): 8/8  <-- validators will reset on the next deploy
  304  W/"6a6f6b7d-1c3"        Sun, 02 Aug 2026 16:08:29 GMT  /deepdiner/
  304  W/"6a6f6b7d-10147"      Sun, 02 Aug 2026 16:08:29 GMT  /en/blog/en/hindsight-mcp-agent-memory-learning/
  304  W/"6a6f6b7d-7e2e"       Sun, 02 Aug 2026 16:08:29 GMT  /en/social/
  304  W/"6a6f6b7d-10803"      Sun, 02 Aug 2026 16:08:29 GMT  /ja/blog/ja/heterogeneous-llm-agent-fleet-cost-optimization/
  304  W/"6a6f6b7d-810b"       Sun, 02 Aug 2026 16:08:29 GMT  /ja/social/
  304  W/"6a6f6b7d-1191a"      Sun, 02 Aug 2026 16:08:29 GMT  /ko/blog/ko/hindsight-mcp-agent-memory-learning/
  304  W/"6a6f6b7d-7791"       Sun, 02 Aug 2026 16:08:29 GMT  /ko/terms/
  304  W/"6a6f6b7d-1e36c"      Sun, 02 Aug 2026 16:08:29 GMT  /zh/blog/zh/hono-typescript-api-2026/
```

표본 여덟 개의 `Last-Modified`가 하나뿐이다. 2025년에 쓴 영어 글도, 어제 만진 적 없는 약관 페이지도 같은 초를 가리킨다.

여담이지만 이 실행에서 하나 더 걸렸다. `fetch()`가 `Accept-Encoding: gzip`을 붙이자 ETag가 `W/` 접두사가 붙은 약한 검증자로 돌아왔다. 압축을 요청하지 않으면 강한 검증자다. 같은 URL, 같은 파일인데 협상 결과에 따라 검증자의 강도가 달라진다.

```bash
$ curl -sSI https://jangwook.net/deepdiner/ | grep -i etag
etag: "6a6f6b7d-1c3"
$ curl -sSI -H 'Accept-Encoding: gzip' https://jangwook.net/deepdiner/ | grep -iE 'etag|content-encoding'
etag: W/"6a6f6b7d-1c3"
content-encoding: gzip
```

`0x1c3`은 451이고, 이 파일의 압축 전 크기가 정확히 451바이트다. 압축 표현에 붙은 태그인데 값 자체는 원본 크기에서 나왔다. `If-None-Match`는 약한 비교를 쓰므로 재검증 자체는 성립한다. 다만 강한 검증자가 필요한 상황, 예를 들어 범위 요청의 `If-Range`에서는 이 차이가 실제로 갈린다.

## 조건부 요청은 무엇을 주고받는가

조건부 요청을 직접 붙여본 적이 없다면 위 로그의 `304`가 왜 의미 있는지 잡히지 않는다.

크롤러나 브라우저가 어떤 URL을 처음 받아 가면, 응답에 붙은 `ETag`와 `Last-Modified`를 그 URL의 표식으로 저장해 둔다. 다음에 같은 URL을 다시 요청할 때는 저장해 둔 표식을 요청 헤더에 실어 보낸다. `ETag`는 `If-None-Match`에, `Last-Modified`는 `If-Modified-Since`에 넣는다. 서버는 그 표식이 지금 값과 같은지 보고, 같으면 `304 Not Modified`를 본문 없이 돌려준다. 클라이언트는 자기 캐시에 있던 사본을 그대로 쓴다.

Google은 자사 크롤링 인프라가 이 방식을 지원한다고 공식 블로그에 적어 뒀다. [Crawling December: HTTP caching](https://developers.google.com/search/blog/2024/12/crawling-december-caching)(2024년 12월 9일)에서 인용한다.

> Google's crawlers that support caching will send the `ETag` value returned for a previous crawl of that URL in the `If-None-Match header`. If the `ETag` value sent by the crawler matches the current value the server generated, your server should return an HTTP `304` (Not modified) status code with no HTTP body.

본문이 없다는 점이 핵심이라고 같은 글이 이어서 설명한다. 서버는 콘텐츠를 생성할 컴퓨트를 쓰지 않아도 되고, 본문을 전송할 대역폭도 쓰지 않는다. 같은 글은 둘 중 무엇을 쓸지에 대한 권고도 남겼다.

> We strongly recommend using `ETag` because it's less prone to errors and mistakes (the value is not structured unlike the `Last-Modified` value).

그리고 이 글에서 가장 중요한 한 문장이 이것이다.

> Our recommendation is that you require a cache refresh on significant changes to your content; if you only updated the copyright date at the bottom of your page, that's probably not significant.

페이지 하단의 저작권 연도만 바꿨다면 캐시를 갱신시킬 만한 변화가 아니라는 얘기다. 그런데 내 사이트는 저작권 연도조차 바꾸지 않았는데 사이트 전체의 캐시를 갱신시키고 있었다. 배포 한 번이 그렇게 만든다.

실제로 얼마나 차이가 나는지는 재보면 된다. 같은 URL에 세 가지 요청을 던졌다.

```bash
$ curl -sS -o /dev/null -w 'code=%{http_code} down=%{size_download} header=%{size_header} t=%{time_total}\n' \
    https://jangwook.net/ko/blog/ko/playwright-ai-testing/
code=200 down=206750 header=660 t=0.133967

# 지금 유효한 ETag를 그대로 되돌려 보낸 경우
code=304 down=0 header=365 t=0.041801

# 배포 이전 날짜로 If-Modified-Since를 보낸 경우
code=200 down=206750 t=0.064747
```

206,750바이트와 0바이트. 응답 헤더까지 세도 660바이트 대 365바이트다. 이 페이지 하나에서 재방문 한 번당 200KB가 오간다. 참고로 gzip을 협상하면 30,246바이트로 줄지만, 0과 비교하면 여전히 30KB다.

세 번째 요청이 이 글의 주제다. 크롤러가 배포 이전에 받아 둔 값을 들고 오면, 파일이 그대로여도 서버는 전체 본문을 다시 보낸다.

## 바이트가 같아도 재배포하면 200이 돌아온다

라이브 사이트에서는 "배포 전 검증자"를 자유롭게 만들어낼 수 없으니, 같은 조건을 임시 샌드박스에서 재현했다. 검증자 생성 방식만 다른 두 서버를 세우고 나머지는 똑같이 맞췄다. 하나는 mtime과 크기로 ETag를 만들고(GitHub Pages·Apache 방식), 다른 하나는 파일 내용의 SHA-256으로 만든다.

```js
// mtime 방식: 파일 속성에서 검증자를 만든다
const st = statSync(file);
const mtime = Math.floor(st.mtimeMs / 1000);
etag = `"${mtime.toString(16)}-${st.size.toString(16)}"`;

// 내용 해시 방식: 바이트에서 검증자를 만든다
etag = `"${createHash('sha256').update(body).digest('hex').slice(0, 16)}"`;
```

절차는 세 단계다. 첫 요청으로 검증자를 받아 저장하고, 파일을 바이트 단위로 동일하게 다시 배포한 뒤(디렉터리를 지우고 원본에서 다시 복사), 저장해 둔 검증자로 조건부 요청을 보낸다. 실행 로그를 그대로 옮긴다.

```text
===== validator mode: mtime =====
1) first crawl        -> ETag="6a703515-3279e"  Last-Modified=Mon, 03 Aug 2026 06:28:37 GMT
200 206750B first crawl (unconditional GET)
304 0B revisit, nothing deployed  [If-None-Match]
304 0B revisit, nothing deployed  [If-Modified-Since]
2) redeploy: same bytes, fresh checkout (sha256 unchanged)
   sha256 before/after: c3f104574859d427 / c3f104574859d427
   new ETag: "6a703519-3279e"
200 206750B after redeploy             [If-None-Match]
200 206750B after redeploy             [If-Modified-Since]
3) real edit: one byte appended
200 206766B after real edit            [If-None-Match]

===== validator mode: content =====
1) first crawl        -> ETag="c3f104574859d427"  Last-Modified=Mon, 03 Aug 2026 06:28:42 GMT
200 206750B first crawl (unconditional GET)
304 0B revisit, nothing deployed  [If-None-Match]
304 0B revisit, nothing deployed  [If-Modified-Since]
2) redeploy: same bytes, fresh checkout (sha256 unchanged)
   sha256 before/after: c3f104574859d427 / c3f104574859d427
   new ETag: "c3f104574859d427"
304 0B after redeploy             [If-None-Match]
304 0B after redeploy             [If-Modified-Since]
3) real edit: one byte appended
200 206766B after real edit            [If-None-Match]
```

mtime 방식에서 재배포 후 ETag는 `"6a703515-3279e"`에서 `"6a703519-3279e"`로 바뀌었다. 크기 부분(`3279e`)은 그대로고 앞쪽 시각만 4초 움직였다. 그 4초가 206,750바이트를 다시 흐르게 한다. 내용 해시 방식은 재배포 뒤에도 `"c3f104574859d427"`을 유지해 304로 답했고, 정말로 한 바이트를 덧붙이자 그때는 정확히 200으로 돌아섰다. 무효화되어야 할 때만 무효화된 셈이다.

![같은 파일을 재배포한 뒤 다음 크롤에서 전송되는 본문 바이트. mtime 검증자는 206,750바이트를 다시 보내고, 내용 해시 검증자는 0바이트로 끝난다](../../../assets/blog/etag-deploy-invalidation-conditional-requests-2026/redeploy-bytes.png)

RFC 9110은 이 두 방식을 모두 허용한다. 8.8.3.1은 엔티티 태그 생성 예시로 "표현 콘텐츠의 충돌 저항 해시, 여러 파일 속성의 조합, 또는 초 이하 해상도를 가진 수정 시각"을 나란히 든다. 그러니 mtime ETag는 규격 위반이 아니다. 다만 같은 문서 8.8.1이 이렇게 덧붙인다.

> A strong validator might change for reasons other than a change to the representation data, such as when a semantically significant part of the representation metadata is changed (e.g., Content-Type), but it is in the best interests of the origin server to only change the value when it is necessary to invalidate the stored responses held by remote caches and authoring tools.

바뀔 수는 있지만, 원격 캐시를 정말 무효화해야 할 때만 바꾸는 것이 오리진 서버에게 이롭다는 뜻이다. 같은 절은 내용 해시를 대안으로 명시한다. "A collision-resistant hash function applied to the representation data is also sufficient."

## 같은 소스로 다시 빌드한 1,346장이 전부 같았다

내용 해시로 바꾼다고 검증자가 저절로 안정되지는 않는다. 빌드가 실행할 때마다 조금씩 다른 HTML을 뱉는다면 해시도 매번 달라져 결국 같은 문제로 돌아온다. 타임스탬프 주입, 무작위 ID, 정렬되지 않은 클래스 목록 같은 것들이 흔한 원인이다.

그래서 소스를 건드리지 않고 그냥 다시 빌드했다.

```bash
$ find dist -name '*.html' -print0 | xargs -0 shasum -a 256 | sort -k2 > before.txt
$ TEST_FLG=false npm run build     # real 85.30s
$ find dist -name '*.html' -print0 | xargs -0 shasum -a 256 | sort -k2 > after.txt

before=1346 after=1346
identical bytes : 1346 (100.0%)
changed bytes   : 0 (0.0%)
```

1,346장 전부가 바이트 단위로 동일했다. 이 사이트의 빌드는 완전히 재현 가능하다. 내용 해시를 검증자로 쓴다면 배포를 백 번 해도 검증자는 움직이지 않는다는 뜻이다.

두 숫자를 나란히 놓으면 이 글의 전부다. <strong>콘텐츠의 재현율은 100%, 배포된 검증자의 안정성은 0%.</strong> 완벽하게 결정적인 파이프라인이 만들어 낸 결과물이, 마지막 배송 단계에서 매번 새 신원증을 발급받는다.

참고로 이 사이트 전체 HTML은 1,346장, 압축 전 109.4MB, gzip -6 기준 26.4MB다. 페이지당 평균은 각각 85,207바이트와 20,537바이트다. 전면 재수집이 한 번 일어나면 그만큼이 다시 흐른다. 조건부 요청이 전부 성립했다면 304 응답 헤더 365바이트씩 해서 0.5MB 아래로 끝났을 트래픽이다.

## 하루 5.25회 배포가 만드는 확률 0퍼센트

그런데 배포할 때마다 검증자가 리셋된다는 사실만으로는 피해 규모를 알 수 없다. 크롤러의 재방문 간격과 배포 간격, 둘의 관계가 실제 값을 정한다. 크롤러가 어떤 URL을 다시 찾아왔을 때 304를 받으려면, <strong>직전 방문 이후로 배포가 한 번도 없어야 한다</strong>. 그러니 조건부 요청의 성공률은 "재방문 간격 안에 배포가 0회일 확률"과 같다.

이건 잴 수 있다. 최근 30일 커밋 로그를 뽑아 5분 이내 연속 커밋을 한 번의 배포로 묶었다. 이 저장소는 main에 푸시가 들어올 때마다 GitHub Actions가 빌드해 배포한다.

```text
commits: 178
deploys (5-min clustering): 154
span days: 29.3  -> 5.25 deploys/day
gap hours: median=2.75 mean=4.60 p10=0.17 p90=15.84 max=16.80
```

배포 간격 중앙값이 2시간 45분, 최대가 16시간 48분이다. 하루를 통째로 비운 날이 30일 동안 한 번도 없다. 이 타임라인 위에서 10분 간격으로 창을 밀며 "이 창 안에 배포가 0회인가"를 세면 다음과 같다.

| 크롤러 재방문 간격 | 그 사이 배포가 없을 확률 | 조건부 요청 결과 |
|---|---|---|
| 1시간 | 83.7% | 대체로 304 |
| 3시간 | 60.9% | 절반 조금 넘게 304 |
| 6시간 | 37.0% | 대부분 200 |
| 12시간 | 12.0% | 거의 전부 200 |
| 24시간 | 0.0% | 전부 200 |
| 72시간 | 0.0% | 전부 200 |
| 7일 | 0.0% | 전부 200 |

하루를 넘어가는 순간 0이다. 근사값이 아니라 관측된 타임라인에서 그런 창이 하나도 나오지 않았다. 매일 글을 쓰고 매일 배포하는 사이트에서, 크롤러가 어제 온 페이지에 오늘 다시 오면 조건부 요청은 100% 실패한다. 그 페이지가 1년째 그대로여도 마찬가지다.

내가 이 구조를 처음 의심한 계기는 [내부 링크 절반이 301로 튕기던 감사](/ko/blog/ko/internal-link-trailing-slash-redirect-audit-2026)였다. 그때도 빌드 산출물은 멀쩡했고 새는 곳은 배송 계층이었다. 이번 것도 같은 종류다. 소스를 아무리 다듬어도 마지막 한 홉에서 값이 바뀌면 앞의 정밀함은 전달되지 않는다.

## 이 낭비가 실제로 문제인 조건

위 숫자는 눈에 띄지만, 그게 내 사이트의 응급 상황이라는 뜻은 아니다.

Google의 [크롤 예산 관리 가이드](https://developers.google.com/search/docs/crawling-indexing/large-site-managing-crawl-budget)는 이 문제를 신경 쓸 대상을 명시적으로 한정한다. "Large sites (1 million+ unique pages) with content that changes moderately often (once a week)", 그리고 "Medium or larger sites (10,000+ unique pages) with very rapidly changing content (daily)". 내 사이트는 1,346장이다. 두 기준 어디에도 들지 않는다. 같은 문서가 304에 대해 약속하는 것도 딱 한 줄이다. "Support `304 (Not Modified)` HTTP status codes. If a page hasn't changed since Google last crawled it, returning a `304` code tells Google to reuse the cached version, saving your server bandwidth and resources." 대역폭과 리소스를 아낀다는 말이지 순위 이야기가 아니다.

정직하게 나열하면 이렇다.

- <strong>순위와는 무관하다.</strong> 304를 늘려서 검색 순위가 오른다는 공식 근거는 없다. 나도 재지 못했고, 잴 방법도 없다.
- <strong>실제 크롤러 행동은 측정하지 못했다.</strong> GitHub Pages는 액세스 로그를 주지 않는다. 위 확률표는 "재방문 간격이 X시간이라면"이라는 조건부 계산이지, Googlebot이 실제로 몇 시간마다 오는지를 관측한 값이 아니다. 서버 로그가 있는 호스팅이라면 이 부분은 가정이 아니라 실측으로 바꿀 수 있다.
- <strong>AI 크롤러가 조건부 요청을 보내는지는 확인하지 못했다.</strong> 로그가 없으니 사용자 에이전트별 동작을 구분할 방법이 없다. [크롤러가 JavaScript를 실행하지 않는다는 것](/ko/blog/ko/ai-crawlers-dont-render-javascript-csr-2026)은 응답만으로 확인할 수 있었지만, 재검증 습관은 그렇지 않다.
- <strong>규격 위반이 아니다.</strong> 앞서 인용한 RFC 9110 8.8.3.1이 mtime 기반 태그를 허용한다. 호스팅이 잘못 만든 게 아니라, 이 방식이 매일 배포하는 사이트와 맞지 않을 뿐이다.
- <strong>5분 클러스터링은 근사다.</strong> 실제 배포 횟수는 이보다 적거나 많을 수 있다. 다만 24시간 창에서 0%라는 결론은 클러스터링 방식에 거의 영향을 받지 않는다. 배포가 하루도 빠짐없이 있었기 때문이다.

그래도 이 값을 알아 둘 이유는 남는다. GitHub Docs의 [GitHub Pages 제한](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits) 문서는 "GitHub Pages sites have a soft bandwidth limit of 100 GB per month"라고 적는다. 대역폭이 무한한 자원이 아니라는 뜻이다. 그리고 Google의 캐싱 글은 전체 페치 중 캐시로 처리 가능한 비율이 "10 years ago about 0.026% of the total fetches were cacheable, which is already not that impressive; today that number is 0.017%"라고 밝혔다. 웹 전체가 이 값을 방치하고 있다는 뜻이기도 하다.

## 내 호스트를 3분 만에 판정하는 절차

세 단계면 자기 사이트의 상태를 판정할 수 있다.

<strong>1단계. 검증자를 보내는지 본다.</strong>

```bash
curl -sSI https://example.com/ | grep -iE 'etag|last-modified|cache-control'
```

아무것도 안 나오면 조건부 요청 자체가 성립하지 않는다. 이 경우는 개선 여지가 가장 크다.

<strong>2단계. 그 값이 콘텐츠에서 나왔는지 본다.</strong> 서로 다른 URL 여러 개의 `Last-Modified`를 모아 본다. 전부 같은 초를 가리키면 그건 배포 시각이다. ETag가 `"<16진수>-<16진수>"` 꼴이면 mtime과 크기에서 나온 값일 가능성이 높다. 저장소에 넣어 둔 스크립트가 이 두 판정을 한 번에 해 준다.

```bash
node scripts/audit-cache-validators.mjs --base=https://example.com --n=12
```

<strong>3단계. 재배포해 보고 값이 움직이는지 본다.</strong> 콘텐츠를 바꾸지 않은 배포를 한 번 돌린 뒤, 같은 URL의 ETag를 배포 전후로 비교한다. 값이 바뀌었다면 그 호스팅의 검증자는 콘텐츠가 아니라 배포를 가리킨다.

판정 결과에 따라 할 일이 갈린다.

| 상황 | 판단 | 할 일 |
|---|---|---|
| 오리진을 직접 통제(자체 서버·CDN 워커) | 고칠 수 있고 비용도 낮다 | ETag를 파일 내용 해시로 생성. 정적 자산은 빌드 시점에 계산해 캐싱 |
| 관리형 정적 호스팅 + 페이지 1만 장 미만 | 알아 두되 서두를 필요 없다 | 값만 기록해 두고 규모가 커질 때 재검토 |
| 관리형 정적 호스팅 + 대규모 또는 대역폭 제약 | 호스팅 계층이 병목 | 앞단에 헤더를 다시 쓰는 CDN을 두거나 호스팅을 옮긴다 |
| 배포를 rsync로 직접 한다 | 부분적으로 고칠 수 있다 | `rsync -a`로 mtime 보존. 단 CI가 매번 새로 빌드하면 그 시각이 새로 찍히므로 효과 없음 |

오리진을 통제한다면 코드는 정말 짧다. 앞의 샌드박스에서 쓴 것과 같다.

```js
import { createHash } from 'node:crypto';

// 빌드 시점에 한 번 계산해 파일 경로 -> ETag 맵으로 들고 있으면
// 요청마다 해싱하지 않아도 된다
const etagOf = (buf) => `"${createHash('sha256').update(buf).digest('hex').slice(0, 16)}"`;
```

주의할 점 하나. `Last-Modified`도 같이 손봐야 한다. ETag만 내용 해시로 바꾸고 `Last-Modified`를 파일 mtime 그대로 두면, `If-Modified-Since`로 재검증하는 클라이언트는 여전히 매번 200을 받는다. 두 값 모두 같은 사실을 가리키게 맞춰야 한다. 나는 콘텐츠 해시가 처음 등장한 시각을 별도 파일에 기록해 `Last-Modified`로 쓰는 방식을 샌드박스에서 확인했다. sitemap의 lastmod를 정확하게 만들 때 [썼던 것과 같은 발상](/ko/blog/ko/sitemap-lastmod-crawl-scheduling-2026)이다. 날짜 값은 어디에 쓰이든 "내용이 바뀐 시각"이어야 한다.

## 정리: 검증자는 배포가 아니라 콘텐츠를 가리켜야 한다

오늘 잰 것을 다섯 줄로 줄인다.

- 이 사이트의 `ETag`는 `hex(mtime)-hex(size)`이고 `Last-Modified`와 같은 사실을 두 번 표현한다. 표본 8개 URL의 `Last-Modified`가 초 단위까지 동일했다.
- 같은 소스로 다시 빌드한 HTML 1,346장이 100% 바이트 동일했다. 콘텐츠는 재현되는데 검증자는 재현되지 않는다.
- 샌드박스에서 바이트 동일 재배포를 하자 mtime 검증자는 206,750바이트를 다시 보냈고, 내용 해시 검증자는 0바이트로 끝냈다.
- 배포 5.25회/일 환경에서 재방문 간격이 24시간을 넘으면 조건부 요청 성공 확률은 0%다.
- 순위와는 무관하다. 이건 대역폭과 오리진 컴퓨트 이야기이고, 1만 장 미만 사이트라면 알아 두는 정도로 충분하다.

체크리스트로 옮기면 이렇게 된다.

- [ ] `curl -sSI`로 `ETag`·`Last-Modified`·`Cache-Control`이 나오는지 확인
- [ ] 서로 다른 URL의 `Last-Modified`가 전부 같은 값인지 확인(같으면 배포 시각)
- [ ] 콘텐츠 변경 없는 배포 전후로 ETag가 움직이는지 확인
- [ ] 오리진을 통제한다면 ETag를 내용 해시로, `Last-Modified`를 내용 변경 시각으로 교체
- [ ] 빌드가 결정적인지 먼저 확인(두 번 빌드해 해시 비교). 결정적이지 않으면 내용 해시도 흔들린다

호스팅을 고를 때 우리는 가격표와 배포 편의를 본다. 응답 헤더가 콘텐츠의 신원을 제대로 가리키는지는 아무도 묻지 않는다. 나는 그 질문을 먼저 던지고 숫자로 답하는 쪽 일을 한다. 연락은 [프로필](/ko/about/)에.

---

*출처: Google Search Central의 [Crawling December: HTTP caching](https://developers.google.com/search/blog/2024/12/crawling-december-caching)(2024년 12월 9일), [Large site owner's guide to managing your crawl budget](https://developers.google.com/search/docs/crawling-indexing/large-site-managing-crawl-budget), IETF [RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html) 8.8.1·8.8.3.1, GitHub Docs의 [GitHub Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)(모두 공식). 측정 환경: jangwook.net 라이브 응답(GitHub Pages, 2026년 8월 3일), 자체 Astro 빌드 산출물 HTML 1,346장, Node 22.22, curl 8.7, 샌드박스는 macOS 로컬 HTTP 서버. 배포 통계는 최근 29.3일 git 커밋 178개를 5분 간격으로 클러스터링한 값이다. 모든 수치는 이 사이트와 이 호스팅에서 나온 값이며 Google의 크롤 스케줄링 동작에 대한 진술이 아니다.*
