---
title: 'sitemap.xml에서 구글이 실제로 읽는 건 lastmod 하나다'
description: 'priority 1.0에 changefreq always를 붙여도 구글은 다 버린다. 공식 문서가 쓰는 필드는 lastmod 하나뿐이고, 그마저 검증 가능하게 정확할 때만 쓴다. 세 종류의 sitemap을 공식 XSD로 직접 돌려 무엇이 통과하고 무엇이 조용히 무시되는지 실측했다.'
pubDate: '2026-07-08'
heroImage: '../../../assets/blog/sitemap-lastmod-crawl-scheduling-2026/hero.png'
tags:
  - SEO
  - 사이트맵
  - 크롤링
  - 웹개발
relatedPosts:
  - slug: multilingual-blog-technical-audit-campaign-2026
    score: 0.7
    reason:
      ko: "이 글의 「sitemap을 CI XSD 검증으로 굳혀라」를 실제로 실천한 기록이다. 감사를 한 번의 이벤트가 아니라 빌드 게이트 루프로 만든 캠페인."
      ja: "本記事の「sitemapをCIのXSD検証で固めろ」を実践した記録。監査を一度きりではなくビルドゲートのループにしたキャンペーン。"
      en: "The campaign that practiced this post's 'lock the sitemap with CI XSD validation' advice, turning an audit into a build-gate loop instead of a one-off."
      zh: "把本文「用 CI 的 XSD 校验把 sitemap 固定住」真正落地的记录——把审计做成构建门禁的循环，而非一次性事件。"
  - slug: hreflang-reciprocity-audit-multilingual-2026
    score: 0.64
    reason:
      ko: "sitemap과 나란히 다국어 사이트의 신뢰 신호를 이루는 hreflang을 30줄 스크립트로 직접 감사한 글. lastmod처럼 「정확하지 않으면 무시된다」는 원리가 똑같이 걸린다."
      ja: "sitemapと並んで多言語サイトの信頼信号をなすhreflangを、30行スクリプトで自ら監査した記事。lastmodと同じく「正確でなければ無視される」原理が効く。"
      en: "A hands-on audit of hreflang, the multilingual trust signal that sits alongside sitemaps, done with a 30-line script. The same 'inaccurate means ignored' principle as lastmod applies."
      zh: "用 30 行脚本亲手审计 hreflang——它和 sitemap 一样是多语言站点的信任信号。和 lastmod 同理:不准确就被忽略。"
  - slug: ai-crawler-control-robots-txt-llms-txt-2026
    score: 0.6
    reason:
      ko: "sitemap이 「무엇이 바뀌었나」를 알린다면, robots.txt는 「누구에게 보여줄까」를 정한다. 이 글에서 다룬 Sitemap 지시줄과 크롤러 노출 판단이 그 글로 이어진다."
      ja: "sitemapが「何が変わったか」を伝えるなら、robots.txtは「誰に見せるか」を決める。本記事のSitemap行とクローラー露出の判断がそこへ繋がる。"
      en: "If a sitemap says what changed, robots.txt decides who gets to see it. This post's `Sitemap:` directive and crawler-exposure calls lead straight into that one."
      zh: "如果说 sitemap 告诉的是「什么变了」，robots.txt 决定的是「让谁看见」。本文里的 `Sitemap:` 指令与爬虫暴露判断，正接到那篇。"
  - slug: json-ld-graph-entity-linking-2026
    score: 0.54
    reason:
      ko: "「검증기 초록불이면 끝」이라는 착각을 구조화 데이터 쪽에서 깬 글. 여기선 XSD가 통과해도 필드가 무시되고, 저기선 JSON-LD가 유효해도 조각이 안 이어진다. 같은 함정의 두 얼굴."
      ja: "「バリデータが緑なら完了」の錯覚を構造化データ側で崩した記事。こちらはXSDを通っても無視され、あちらはJSON-LDが有効でも断片が繋がらない。同じ罠の別の顔。"
      en: "The structured-data counterpart to this post's 'a green validator isn't the finish line.' Here the XSD passes but fields are ignored; there JSON-LD is valid but the pieces don't link. Two faces of one trap."
      zh: "从结构化数据一侧戳破「校验器亮绿就完事」的错觉。这边 XSD 过了字段却被忽略，那边 JSON-LD 有效碎片却连不起来。同一个陷阱的两张脸。"
---

`<priority>1.0</priority>`. 홈페이지 sitemap 첫 줄에 이걸 박아 넣은 사람이 아마 이 글을 읽는 당신을 포함해 수백만 명일 것이다. `<changefreq>always</changefreq>`도 같이 붙였을 것이다. 그리고 그 두 줄은 구글 크롤러에 도착하는 순간 통째로 버려진다. 공식 문서가 그렇게 말한다.

내가 이걸 처음 확인했을 때 좀 허탈했다. 사이트맵 생성기들이 관성적으로 뱉어내는 필드의 절반이 사실상 장식이었다는 뜻이니까. 더 나쁜 건, 정작 구글이 유일하게 신경 쓰는 필드 하나를 대부분의 사이트가 틀리게 쓰고 있다는 점이다. 그 필드가 `lastmod`다. 오늘은 세 종류의 sitemap을 만들어 공식 스키마(XSD)로 직접 검증하고, 무엇이 통과하고 무엇이 조용히 무시되는지 숫자로 확인했다. 아래 로그는 전부 그 샌드박스에서 나온 실제 출력이다.

## priority 1.0을 붙여도 크롤러가 안 보는 이유

먼저 오해를 하나 걷어내자. sitemap.xml은 "이 페이지들을 이 순서로, 이 중요도로 크롤링하라"고 검색엔진에 지시하는 파일이 아니다. 많은 개발자가 `priority`를 순위 가중치처럼, `changefreq`를 크롤링 주기 명령처럼 다룬다. 둘 다 오해다.

구글은 이 두 필드를 쓰지 않는다고 [공식 문서](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)에 명시해 뒀다. "Google ignores `<priority>` and `<changefreq>` values." 이유도 밝혀져 있다. `changefreq`는 개념적으로 `lastmod`와 겹치고, `priority`는 지나치게 주관적이라 사이트 안에서 페이지 간 실제 우선순위를 제대로 반영하지 못한다는 것이다. 생각해 보면 당연하다. 모든 페이지에 `priority 0.8`을 찍는 사이트가 태반인데, 전부 0.8이면 그건 정보가 아니라 노이즈다.

그래서 남는 건 두 필드다. `<loc>`(URL)와 `<lastmod>`(마지막 수정 시각). 이 중 크롤링 스케줄에 실제로 개입하는 건 `lastmod` 하나다. 그런데 이 하나를 제대로 쓰는 사이트가 의외로 드물다. 빌드할 때마다 현재 시각을 찍거나, 날짜 포맷을 손으로 만들다 깨뜨리거나, 콘텐츠가 안 바뀌었는데도 매일 갱신 시각을 올린다. 셋 다 구글이 이 값을 "믿지 못할 신호"로 분류하게 만드는 짓이다.

## 기초부터 — sitemap과 lastmod가 하는 진짜 일

이 글을 읽는 사람 중 sitemap을 한 번도 직접 만들어보지 않은 경우도 있을 테니, 토대를 먼저 깔자.

sitemap.xml은 사이트가 검색엔진에 건네는 URL 목록이다. 형식은 [sitemaps.org 프로토콜 0.9](https://www.sitemaps.org/protocol.html)로 표준화돼 있고, `<urlset>` 아래 `<url>` 엔트리가 반복되는 단순한 XML이다. 각 엔트리의 필수 필드는 `<loc>` 하나뿐. 나머지 `<lastmod>`, `<changefreq>`, `<priority>`는 전부 선택이다.

핵심은 sitemap이 <strong>발견(discovery)</strong>을 돕는 도구라는 점이다. 검색엔진은 링크를 따라가며 페이지를 찾지만, 링크가 얕게 걸린 페이지나 새로 올라온 페이지는 놓치기 쉽다. sitemap은 "여기 이 URL들이 있다"고 한 번에 알려줘 발견 확률을 높인다. 그게 전부다. 순위를 올리지도, 인덱싱을 보장하지도 않는다.

그럼 `lastmod`는 왜 특별한가. 검색엔진 입장에서 가장 비싼 작업은 이미 아는 URL을 언제 다시 방문할지 정하는 것이다. 수천, 수만 페이지를 매일 다 재크롤링할 수는 없으니, "이 페이지는 최근 바뀌었으니 먼저 보자"는 우선순위를 매겨야 한다. `lastmod`는 바로 그 스케줄링에 들어가는 입력값이다. 구글은 [ping 엔드포인트 폐지를 알린 2023년 공식 블로그](https://developers.google.com/search/blog/2023/06/sitemaps-lastmod-ping)에서 lastmod를 "이미 발견한 URL의 재크롤링 스케줄을 잡는 신호"로 쓴다고 설명했다. 정확하면 도움이 되고, 부정확하면 무시된다. 조건부 신호라는 뜻이다.

여기서 "정확하다"의 기준이 중요하다. 공식 문서의 표현은 이렇다. 구글은 lastmod가 "consistently and verifiably (for example by comparing to the last modification of the page) accurate"할 때만 쓴다. 풀어 쓰면, 크롤러가 실제로 페이지를 가져와서 마지막 수정 상태와 대조했을 때 sitemap의 lastmod와 어긋나지 않아야 한다. 매 빌드마다 `new Date()`를 찍어 놓고 정작 본문은 안 바뀌었다면, 몇 번 대조당한 뒤 이 사이트의 lastmod는 통째로 신뢰를 잃는다.

## 공식 스키마로 세 개의 sitemap을 돌려봤다

말로만 하면 감이 안 오니 직접 재봤다. 임시 샌드박스에서 sitemaps.org의 공식 XSD를 받아, 세 종류의 sitemap을 `xmllint --schema`로 검증했다. 목적은 하나다. "스키마를 통과한다"와 "구글에 쓸모 있다"가 얼마나 다른 이야기인지 눈으로 보는 것.

첫 번째는 흔히 보는 형태다. 모든 필드를 꽉 채운 버전.

```xml
<url>
  <loc>https://example.com/</loc>
  <lastmod>2026-07-08</lastmod>
  <changefreq>always</changefreq>
  <priority>1.0</priority>
</url>
```

두 번째는 손으로 날짜를 만들다 흔히 내는 실수. `T` 구분자 없이 공백을 넣고 타임존을 빼먹은 lastmod다.

```xml
<lastmod>2026-07-08 15:20:00</lastmod>
```

세 번째는 내가 권하는 형태. 군더더기 필드를 다 빼고, W3C Datetime 포맷에 타임존 오프셋까지 붙인 lastmod만 남긴 버전이다.

```xml
<lastmod>2026-07-08T15:20:11+09:00</lastmod>
```

공식 XSD로 셋을 돌린 결과다.

```
# [A] priority + changefreq 꽉 채운 버전
$ xmllint --noout --schema sitemap.xsd sitemap-bad.xml
sitemap-bad.xml validates

# [B] 손으로 만든 lastmod "2026-07-08 15:20:00"
$ xmllint --noout --schema sitemap.xsd sitemap-malformed.xml
element lastmod: Schemas validity error :
  '2026-07-08 15:20:00' is not a valid value of the union type 'tLastmod'.
sitemap-malformed.xml fails to validate

# [C] 정확한 W3C Datetime lastmod만
$ xmllint --noout --schema sitemap.xsd sitemap-good.xml
sitemap-good.xml validates
```

![공식 sitemap XSD로 세 종류의 sitemap을 xmllint 검증한 실제 로그](../../../assets/blog/sitemap-lastmod-crawl-scheduling-2026/xmllint-validation.png)

세 결과가 각각 다른 교훈을 준다.

[A]가 제일 함정이다. `priority 1.0`에 `changefreq always`를 붙인 sitemap이 스키마 검증을 <strong>통과</strong>한다. XSD는 문법만 본다. 구글이 그 필드를 버린다는 사실은 스키마의 관심사가 아니다. 그래서 "sitemap validator 초록불"을 신뢰하는 순간, 실제로는 아무 효과 없는 필드를 잔뜩 실어 나르면서도 잘 만든 줄 착각하게 된다. 검증 통과와 유용함은 별개다.

[B]는 반대로, 실무에서 진짜 자주 나는 버그다. 날짜를 라이브러리 없이 문자열로 조립하다가 `toISOString()` 대신 `Date`의 기본 문자열이나 로케일 포맷을 그대로 쓰면 이렇게 된다. `tLastmod` 유니온 타입은 `2026-07-08` 같은 날짜 단독형이나 `2026-07-08T15:20:11+09:00` 같은 완전한 datetime은 받지만, 공백으로 이은 `2026-07-08 15:20:00`은 거부한다. 이건 구글이 무시하는 수준이 아니라 스키마 단계에서 깨지는 것이라, Search Console이 sitemap 전체를 파싱 오류로 반려할 수도 있다.

[C]는 통과한다. 이게 목표 상태다.

## 정확한 lastmod를 실제로 만드는 법

그럼 [C]를 어떻게 자동으로 뽑느냐가 관건이다. 핵심 원칙 하나만 지키면 된다. <strong>lastmod는 빌드 시각이 아니라 콘텐츠가 실제로 바뀐 시각이어야 한다.</strong>

가장 간단한 근사는 파일 수정 시각(mtime)이다. 정적 사이트라면 각 페이지 소스 파일의 mtime을 읽어 그대로 lastmod로 쓰면, "이 파일이 마지막으로 바뀐 시점"이라는 검증 가능한 근거가 생긴다. 샌드박스에서 돌린 생성기가 이거다.

```javascript
import { readdirSync, statSync } from 'node:fs';

// W3C Datetime + 로컬 타임존 오프셋 (예: 2026-07-08T15:26:10+09:00)
function w3cLocal(d) {
  const p = (n) => String(n).padStart(2, '0');
  const tz = -d.getTimezoneOffset();
  const sign = tz >= 0 ? '+' : '-';
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}` +
    `T${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}` +
    `${sign}${p(Math.floor(Math.abs(tz) / 60))}:${p(Math.abs(tz) % 60)}`;
}

const urls = readdirSync('content')
  .filter((f) => f.endsWith('.html'))
  .map((f) => ({
    loc: 'https://example.com/' + (f === 'index.html' ? '' : f.replace(/\.html$/, '')),
    lastmod: w3cLocal(statSync(`content/${f}`).mtime),
  }));
```

파일 두 개를 1초 간격으로 만들고 이 생성기를 돌리니 이렇게 나왔다.

```
<lastmod>2026-07-08T15:26:10+09:00</lastmod>   index.html
<lastmod>2026-07-08T15:26:11+09:00</lastmod>   about.html
```

두 페이지의 lastmod가 실제 수정 시각을 따라 각각 다르게 찍혔다. 이게 중요하다. 사이트 전체가 같은 빌드 타임스탬프를 공유하면 구글은 "너희 사이트는 매번 전 페이지가 동시에 바뀐다고 주장하네"라고 읽고 그 신호를 버린다. 파일마다 진짜 수정 시각이 다르게 찍혀야 신뢰가 쌓인다.

mtime의 약점도 있다. 체크아웃하거나 rsync로 배포하면 mtime이 리셋된다. 그래서 더 견고한 방법은 버전 관리 이력을 쓰는 것이다. Git이라면 각 파일의 마지막 커밋 시각을 lastmod로 삼는다.

```bash
git log -1 --format=%cI -- content/about.html
# 2026-07-08T15:26:11+09:00
```

`%cI`는 커밋 시각을 ISO 8601(=W3C Datetime 호환)로 뽑아준다. 포맷 변환이 필요 없고, "이 파일의 마지막 의미 있는 변경"이라는 정의에도 더 가깝다. 나는 다국어 블로그에서 이 접근을 쓴다. 관련해서 빌드 게이트로 sitemap과 hreflang을 CI에서 강제하는 방식은 [다국어 블로그를 감사하고 되돌아오지 못하게 막은 캠페인](/ko/blog/ko/multilingual-blog-technical-audit-campaign-2026)에 정리해 뒀는데, 거기서도 감사를 이벤트가 아니라 루프로 만드는 게 핵심이었다.

한 가지 더. lastmod는 <strong>의미 있는</strong> 변경에만 갱신해야 한다. 오타 하나 고쳤다고, 푸터 연도를 바꿨다고 lastmod를 올리면 안 된다. 매번 "바뀌었다"고 외치는 sitemap은 양치기 소년이 된다. 몇 번 헛걸음한 크롤러는 그 다음부터 당신의 lastmod를 무시한다. 본문·제목·핵심 구조가 바뀔 때만 시각을 올리는 게 맞다.

## lastmod가 해주지 않는 것 (정직한 한계)

여기까지 읽고 "정확한 lastmod를 넣으면 크롤링이 빨라지겠구나"로 정리하면 절반만 맞다. 공식 문서의 한계 진술을 그대로 옮긴다.

"Keep in mind that submitting a sitemap is merely a hint: it doesn't guarantee that Google will download the sitemap or use the sitemap for crawling URLs on the site." sitemap 제출은 <strong>힌트</strong>일 뿐이고, 구글이 그 sitemap을 내려받는다는 보장도, 그걸로 크롤링한다는 보장도 없다. lastmod가 정확해도 마찬가지다. 재크롤링 스케줄에 <strong>영향을 줄 수 있는</strong> 신호이지, 크롤링을 <strong>시키는</strong> 명령이 아니다.

그리고 sitemap은 인덱싱과 무관하다. 크롤링됐다고 인덱싱되는 게 아니고, sitemap에 넣었다고 색인에 오르는 게 아니다. 순위는 말할 것도 없다. 구조화 데이터든 sitemap이든, 순위를 보장하는 SEO 요소는 존재하지 않는다는 게 구글의 일관된 공식 입장이다. lastmod로 얻는 건 "발견한 페이지의 재방문 우선순위를 조금 더 정확한 근거로 판단하게 만드는 것", 딱 거기까지다.

또 하나, 2023년부터 sitemap ping 엔드포인트가 폐지됐다. 예전엔 sitemap이 바뀔 때마다 `google.com/ping?sitemap=...`을 호출해 알렸는데, 이제 그 엔드포인트는 죽었다. 검색엔진은 자기 스케줄대로 sitemap을 가지러 온다. sitemap 위치는 robots.txt의 `Sitemap:` 줄이나 Search Console 등록으로 한 번 알리면 되고, 변경마다 ping하는 코드가 남아 있다면 지워도 된다. 어떤 크롤러에 sitemap을 노출하고 어떤 크롤러를 막을지의 판단은 [robots.txt와 llms.txt로 AI 크롤러를 제어하는 이야기](/ko/blog/ko/ai-crawler-control-robots-txt-llms-txt-2026)와도 이어진다.

## 바로 적용할 체크리스트

정리하면, sitemap.xml을 손볼 때 오늘 당장 할 수 있는 것들이다.

- `<priority>`와 `<changefreq>`를 <strong>제거</strong>한다. 구글은 무시하고, 다른 주요 엔진도 사실상 신뢰하지 않는다. 없애면 파일이 가벼워지고 오해도 준다.
- `<lastmod>`를 <strong>빌드 시각이 아니라</strong> 콘텐츠 변경 시각(파일 mtime 또는 Git 커밋 시각)에서 생성한다.
- 포맷은 W3C Datetime을 쓴다. 날짜 단독(`2026-07-08`)도 유효하지만, 가능하면 타임존 오프셋까지 붙인 완전형(`2026-07-08T15:20:11+09:00`)이 더 정확하다. 공백으로 이은 형태는 스키마에서 깨진다.
- lastmod는 <strong>의미 있는 변경</strong>에만 갱신한다. 오타·자동 리빌드로 전 페이지 타임스탬프를 일괄 갱신하지 않는다.
- CI에 공식 XSD 검증을 넣는다. `curl -s -o sitemap.xsd https://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd && xmllint --noout --schema sitemap.xsd public/sitemap.xml` 한 줄이면 파싱 오류를 배포 전에 잡는다.
- sitemap 위치는 robots.txt의 `Sitemap:` 줄과 Search Console에 한 번만 등록한다. 변경마다 ping하는 코드는 폐지됐으니 지운다.

sitemap 하나로 순위가 오르지는 않는다. 하지만 크롤러가 당신 사이트의 변경을 <strong>제때, 믿고</strong> 따라오게 만드는 건 이 작은 신호의 정확도 싸움이다. 그리고 그 정확도는 스키마 검증 초록불이 아니라, lastmod가 실제 콘텐츠 상태와 어긋나지 않는지에 달려 있다.

구조화 데이터든 sitemap이든, 검색·AI 크롤러가 서버에서 내보내는 신호를 실제로 어떻게 받아들이는지는 문서만 읽어서는 안 잡힌다. 서버사이드 렌더링과 크롤러 대응, 다국어 사이트의 sitemap·hreflang 파이프라인을 점검하거나 CI 게이트로 굳히고 싶다면 개인적으로 상담과 구현 의뢰를 받는다. 프로필의 연락 경로로 사이트 상황을 알려주면 된다.
