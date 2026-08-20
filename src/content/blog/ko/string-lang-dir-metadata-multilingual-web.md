---
title: 내 피드에 네 언어 1,248건이 섞여 있었고, 언어 표시는 하나도 없었다
description: W3C가 공개한 문자열 언어·방향 메타데이터 초안을 기준으로 4개 언어 블로그를 감사했다. 통합 RSS 1,248건이 언어 표시 없이 나갔고 dir="auto" 휴리스틱은 14건 중 4건을 틀렸다. dc:language 수정 코드와 회귀를 막는 빌드 게이트까지 정리한다.
pubDate: '2026-07-20'
heroImage: ../../../assets/blog/string-lang-dir-metadata-multilingual-web/audit-summary.png
tags:
  - i18n
  - w3c
  - web-development
relatedPosts:
  - slug: hreflang-reciprocity-audit-multilingual-2026
    score: 0.84
    reason:
      ko: "저 글은 페이지끼리의 언어 관계(hreflang)를 감사했다. 이 글은 한 단계 더 안쪽, 페이지가 실어 나르는 문자열 자체에 언어 표시가 붙어 있는지를 잰다. 같은 사이트, 같은 감사 루프의 다음 층이다."
      ja: "あちらはページ間の言語関係(hreflang)の監査。本稿はもう一段内側、ページが運ぶ文字列そのものに言語表示が付いているかを測る。同じサイト、同じ監査ループの次の層。"
      en: "That post audits the language relationship between pages (hreflang). This one goes a layer deeper: whether the strings those pages carry declare their own language. Same site, next floor of the same audit loop."
      zh: "那篇审计的是页面之间的语言关系（hreflang）。本文再往里一层，测的是页面所承载的字符串本身有没有标出语言。同一个站点，同一条审计回路的下一层。"
  - slug: json-ld-graph-entity-linking-2026
    score: 0.78
    reason:
      ko: "@graph로 구조화 데이터를 하나로 묶은 그 글의 결과물이 이번 감사 대상이었다. 왜 그 @context에 @language를 넣지 않기로 했는지, 판단 근거가 이 글에 있다."
      ja: "@graphで構造化データを一つに束ねた、あの記事の成果物が今回の監査対象だった。なぜその@contextに@languageを入れないと決めたのか、その判断根拠が本稿にある。"
      en: "The @graph consolidation from that post is exactly what I audited here. Why I decided against adding @language to that @context is spelled out in this one."
      zh: "那篇把结构化数据用@graph合并的成果，正是本次审计的对象。为什么我决定不给那个@context加@language，理由写在本文里。"
  - slug: multilingual-blog-technical-audit-campaign-2026
    score: 0.75
    reason:
      ko: "'측정 → 최대 항목 수정 → 게이트로 상설화' 루프를 닷새간 돌린 기록이 저 글이다. 이 글은 그 루프를 한 번 더 돌린 결과이고, 이번에 추가된 게이트는 postbuild에 그대로 붙었다."
      ja: "「測る→一番効く箇所を直す→ゲートで常設化」のループを五日間回した記録があちら。本稿はそのループをもう一周した結果で、今回追加したゲートはpostbuildにそのまま繋いだ。"
      en: "That post is five days of running the measure-fix-gate loop. This is one more turn of the same loop, and the gate it produced is now wired into postbuild alongside the others."
      zh: "那篇是把「测量→修最要紧的一项→固化成关卡」这条回路跑了五天的记录。本文是同一条回路的又一圈，这次产出的关卡已经接进了postbuild。"
  - slug: accessible-name-agents-2026
    score: 0.68
    reason:
      ko: "접근성 이름이 틀리면 스크린리더가 엉뚱하게 읽는다는 이야기였다. 언어 표시가 없으면 그 스크린리더가 아예 틀린 언어의 음성 엔진으로 읽는다. 같은 문제의 한 칸 위 계층이다."
      ja: "アクセシブルネームが間違っていればスクリーンリーダーが変な読み方をする、という話だった。言語表示がなければ、そのスクリーンリーダーは そもそも別言語の音声エンジンで読む。同じ問題の一段上の階層。"
      en: "That one was about screen readers announcing the wrong thing when the accessible name is wrong. Without language metadata, the same screen reader reads the text with an entirely wrong voice engine. One layer up from the same problem."
      zh: "那篇讲的是可访问名称错了、屏幕阅读器就会念错。而没有语言标注时，同一个屏幕阅读器会直接用另一种语言的语音引擎去念。是同一问题的上一层。"
---

내 블로그는 통합 RSS 피드를 하나 내보낸다. 방금 그 파일을 열어 세어보니 항목이 1,248건이었고, 한국어·일본어·영어·중국어 글이 발행일 순서로 뒤섞여 있었다. 그런데 그 XML 어디에도 "이 항목이 무슨 언어인지"를 적어둔 곳이 없었다. 채널에도 없고, 항목에도 없다.

받는 쪽은 어떻게 알까. 글자를 보고 짐작한다. 그게 전부다.

W3C 국제화 워킹그룹이 2026년 7월 16일에 초안 두 건을 동시에 공개했다. 그중 하나가 [Strings on the Web: Language and Direction Metadata](https://www.w3.org/TR/string-meta/)이고, 하필 "글자를 보고 짐작하는" 바로 그 관행을 정면으로 겨눈다. 초안을 읽고 나서 내 사이트를 그 기준으로 감사했고, 한 군데를 고쳤고, 다시 깨지지 않게 빌드 게이트를 붙였다. 아래 숫자는 전부 그 과정에서 나온 실제 출력이다.

## 문자열은 원래 언어를 잃어버린다

먼저 왜 이게 문제가 되는지부터 짚는다. 이 부분을 건너뛰면 뒤의 측정이 그냥 사소한 XML 트집으로 보인다.

HTML에는 `lang`과 `dir` 속성이 있다. `<p lang="ar" dir="rtl">`라고 쓰면 이 단락이 아랍어이고 오른쪽에서 왼쪽으로 읽힌다는 사실이 마크업 안에 박힌다. 브라우저는 그대로 렌더링하고, 스크린리더는 아랍어 음성 엔진을 고르고, 검색엔진은 언어를 판정한다. 마크업 언어는 확장 가능한 속성을 갖고 있어서 이런 부가 정보를 붙일 자리가 처음부터 있었다.

문제는 요즘 웹에서 문자열이 이동하는 경로가 HTML만이 아니라는 점이다. JSON API 응답, JSON-LD 구조화 데이터, RSS/Atom 피드, WebIDL 인터페이스, 설정 파일. 이 형식들은 대부분 "문자열은 그냥 문자열"이라는 전제로 설계됐다. `{"title": "..."}`에는 그 title이 무슨 언어인지 적을 자리가 없다. 초안의 표현을 그대로 옮기면, 이 데이터 언어들은 마크업과 달리 확장 가능한 속성을 제공하지 않으며 언어나 방향 메타데이터를 내장한다는 발상 자체가 설계에 없었다.

그래서 문자열이 HTML을 떠나 JSON에 담기는 순간, 언어와 방향 정보가 조용히 증발한다. CMS에서 API로, API에서 프론트엔드로, 프론트엔드에서 다시 HTML로 돌아오는 동안 아무도 그걸 들고 다니지 않는다. 마지막에 렌더링하는 쪽은 남은 방법이 하나뿐이다. 글자를 보고 짐작하는 것.

초안이 요구하는 바는 단순하다.

> For any string field containing natural language text, it *MUST* be possible to determine the language and string direction of that specific string. Such determination *SHOULD* use metadata at the string or document level and *SHOULD NOT* depend on heuristics.
>
> — W3C, Strings on the Web: Language and Direction Metadata (FPWD, 2026-07-16)

핵심은 마지막 절이다. 휴리스틱에 의존하지 말라. 그러면 지금 우리가 의존하고 있는 그 휴리스틱은 얼마나 틀릴까. 그걸 재보는 게 이 글의 첫 번째 실험이다.

## dir="auto"가 틀리는 지점을 세어봤다

브라우저가 방향을 짐작하는 표준 방식은 first-strong이다. HTML의 `dir="auto"`가 이걸 쓴다. 문자열을 앞에서부터 훑다가 처음 만나는 "강한 방향성 문자"의 방향을 문자열 전체의 기본 방향으로 삼는다. 라틴 문자와 한글·가나·한자는 강한 LTR이고, 아랍 문자와 히브리 문자는 강한 RTL이다. 숫자와 문장부호, 이모지, 공백은 강하지 않아서 건너뛴다.

이 규칙을 파이썬으로 그대로 구현했다. `unicodedata.bidirectional()`이 각 문자의 양방향 분류를 돌려주므로, `L`이면 ltr, `R`이나 `AL`이면 rtl을 반환하고, 격리 문자 구간은 건너뛰도록 했다.

```python
def first_strong(s: str) -> str:
    """HTML dir="auto"와 같은 방식: 처음 만나는 강한 문자의 방향을 취한다."""
    depth = 0
    for ch in s:
        if ch in ISOLATE_INIT:      # LRI, RLI, FSI
            depth += 1
            continue
        if ch == PDI:
            depth = max(0, depth - 1)
            continue
        if depth:
            continue
        b = unicodedata.bidirectional(ch)
        if b == "L":
            return "ltr"
        if b in ("R", "AL"):
            return "rtl"
    return "ltr"   # 강한 문자가 하나도 없으면 기본값
```

여기에 다국어 CMS나 JSON API가 실제로 실어 나를 법한 문자열 14건을 넣었다. 각 문자열마다 "작성자가 알고 있는 올바른 방향"을 정답으로 붙여두고, 휴리스틱의 판정과 비교했다. 결과다.

```text
case                                         declared  dir=auto  ok
------------------------------------------------------------------------
ar title starting with latin product name    rtl       ltr       MISMATCH
he title starting with a version number      rtl       rtl       OK
ar UI label starting with a digit            rtl       rtl       OK
he string starting with an ASCII quote       rtl       ltr       MISMATCH
ar author name with latin handle first       rtl       ltr       MISMATCH
en title starting with an arabic loanword    ltr       rtl       MISMATCH
ar plain sentence                            rtl       rtl       OK
he plain sentence                            rtl       rtl       OK
ko plain sentence                            ltr       ltr       OK
ja plain sentence                            ltr       ltr       OK
zh plain sentence                            ltr       ltr       OK
en plain sentence                            ltr       ltr       OK
numeric-only string (no strong char)         ltr       ltr       OK
emoji-led ar string                          rtl       rtl       OK
------------------------------------------------------------------------
total=14  mismatch=4  mismatch_rate=28.6%
```

14건 중 4건이 틀렸다. 틀린 것들의 공통점이 뚜렷하다. 전부 RTL 내용인데 앞머리에 라틴 문자가 한 덩어리 붙어 있다. 제품명이 앞에 온 아랍어 제목, ASCII 따옴표로 시작하는 히브리어 문자열, `@핸들`이 이름 앞에 붙은 경우. 마지막 한 건은 반대 방향이다. 아랍어 단어를 인용하며 시작하는 영어 제목이 RTL로 판정됐다.

초안도 정확히 이 실패 유형을 지목한다.

> The main problem with this approach is that it produces the wrong result for (1) strings that begin with a strong character with a different directionality than that needed for the string overall (eg. an Arabic tweet that starts with a hashtag) (2) strings that don't have a strong directional character (such as a telephone number), which are likely to be displayed incorrectly in a RTL context.

측정하면서 오히려 흥미로웠던 건 통과한 쪽이다. 숫자로 시작하는 히브리어 제목, 숫자로 시작하는 아랍어 UI 라벨, 이모지가 앞에 붙은 아랍어 문자열은 전부 정답을 맞혔다. 숫자와 이모지는 강한 문자가 아니라서 스캐너가 그냥 지나치기 때문이다. 그러니까 "앞에 뭐가 붙으면 위험한가"의 답은 "라틴 글자"이지 "ASCII 전부"가 아니다. 이 구분을 모르면 엉뚱한 데를 방어하게 된다.

한 가지는 분명히 해둔다. 저 28.6%는 내가 구성한 14건짜리 시험 집합에서 나온 값이지, 웹 전체의 오류율이 아니다. 케이스를 다르게 고르면 숫자도 달라진다. 이 실험이 말해주는 건 비율이 아니라 **실패의 모양**이다. 라틴 접두사가 붙은 RTL 문자열에서 무너진다는 것.

## 내 사이트를 같은 기준으로 감사했다

남의 문제를 재는 건 쉽다. 그래서 빌드 산출물을 그대로 감사 대상으로 놓고, `dist/`를 훑어 네 가지를 셌다. 페이지의 `html[lang]`과 `html[dir]`, JSON-LD의 언어 표시, 피드의 언어 표시.

```text
== pages audited == 1248
html[lang] present : 1248/1248
html[dir]  present : 0/1248
== JSON-LD ==
blocks parsed          : 1248  (parse errors: 0)
@context has @language : 0
@context has @direction: 0
blocks containing inLanguage: 1248
== feeds ==
  rss-en.xml    xml:lang=False  <language>=True   items=312
  rss-ja.xml    xml:lang=False  <language>=True   items=312
  rss-ko.xml    xml:lang=False  <language>=True   items=312
  rss-zh.xml    xml:lang=False  <language>=True   items=312
  rss.xml       xml:lang=False  <language>=False  items=1248
```

좋은 소식부터. `html[lang]`은 1,248개 페이지 전부에 있었다. JSON-LD도 1,248블록 전부가 `inLanguage`를 싣고 있었고 파싱 오류는 0이었다. 언어별 피드 네 개도 채널 `<language>`를 갖고 있다. [예전에 hreflang 상호성을 감사하면서](/ko/blog/ko/hreflang-reciprocity-audit-multilingual-2026/) 다국어 배선을 한 차례 훑어둔 게 여기서 값을 했다.

문제는 마지막 줄이다. `rss.xml`. 항목 1,248건, 언어 표시 0건.

이 파일은 네 언어를 전부 합친 통합 피드다. 채널 레벨에 `<language>`를 넣을 수 없다는 건 맞다. 하나의 언어가 아니니까. 그런데 그 사실을 근거로 **아무 데도 안 넣은 채로** 배포되고 있었다. 항목마다 언어가 다른 피드에서 언어 표시를 통째로 생략한 것은, 받는 쪽에게 "글자 보고 알아서 짐작하라"고 말한 것과 같다. 초안이 하지 말라고 한 바로 그것이다.

솔직히 이 항목은 감사 스크립트를 돌리기 전까지 문제라고 생각해본 적이 없다. 언어별 피드를 잘 만들어뒀으니 통합 피드는 편의용이라고 여겼다. 감사의 값어치는 대개 이런 데서 나온다. 잘 만든 걸 확인해주는 게 아니라, 신경 쓴 적 없는 곳을 들춰내는 것.

## dc:language 한 줄로 고치고, 게이트로 묶었다

RSS 2.0에는 항목 단위 언어 요소가 없다. `<language>`는 채널에만 있다. 그래서 관행적으로 쓰이는 방법이 Dublin Core의 `dc:language`이고, 네임스페이스만 선언하면 항목 안에 그대로 넣을 수 있다. Astro의 `@astrojs/rss`는 `xmlns` 옵션과 항목별 `customData`를 둘 다 지원하므로 수정은 짧게 끝났다.

```js
// src/pages/rss.xml.js
return rss({
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  site: context.site,
  xmlns: { dc: 'http://purl.org/dc/elements/1.1/' },
  items: posts.map((post) => {
    const [lang, ...slugParts] = post.id.split('/');
    const slug = slugParts.join('/');
    return {
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: `/${lang}/blog/${lang}/${slug}/`,
      customData: `<dc:language>${lang}</dc:language>`,
    };
  }),
});
```

빌드 후 결과다.

```text
$ grep -o '<dc:language>[a-z]*</dc:language>' dist/rss.xml | sort | uniq -c
 312 <dc:language>en</dc:language>
 312 <dc:language>ja</dc:language>
 312 <dc:language>ko</dc:language>
 312 <dc:language>zh</dc:language>
```

312건씩 네 언어, 합계 1,248건. 0에서 전부로 올라왔다.

여기서 멈추면 반쪽이다. 이런 종류의 수정은 반년쯤 뒤 다른 리팩터링에 조용히 쓸려나가고, 아무도 모른다. [닷새짜리 기술 감사를 돌렸을 때](/ko/blog/ko/multilingual-blog-technical-audit-campaign-2026/) 배운 게 그거였다. 고친 항목보다 고친 상태를 붙잡아두는 장치가 오래 간다. 그래서 검사기를 `scripts/validate-string-meta.mjs`로 남기고 `postbuild`에 hreflang 게이트 뒤로 이어 붙였다.

```json
"postbuild": "node scripts/validate-hreflang.mjs && node scripts/validate-string-meta.mjs"
```

게이트가 진짜로 잡는지는 깨뜨려서 확인해야 한다. 빌드된 `rss.xml`에서 `dc:language` 3건을 지우고 다시 돌렸다.

```text
$ node scripts/validate-string-meta.mjs
html[lang]: 1288/1288 pages
per-language feeds: 4 checked
mixed feed rss.xml: 1245/1248 items declare dc:language

❌ string metadata 검증 실패
  - rss.xml: dc:language 1245건 / item 1248건 — 불일치
exit=1
```

3건이 빠지자 exit code 1로 떨어졌다. 원상 복구하니 다시 통과했다. 이제 이 회귀는 사람이 눈치채기 전에 빌드가 먼저 멈춘다.

## JSON-LD에는 일부러 넣지 않았다

초안은 JSON-LD에 대해 `@context`에 `@language`와 `@direction`을 넣어 문서 기본값을 선언하라고 권한다. 내 JSON-LD는 현재 `"@context": "https://schema.org"`라는 문자열 하나여서, 객체로 바꿔 다음처럼 쓸 수 있다.

```json
{
  "@context": {
    "@vocab": "https://schema.org/",
    "@language": "ko",
    "@direction": "ltr"
  },
  "@graph": [ ... ]
}
```

권고대로면 이걸 넣는 게 맞다. 그런데 넣지 않기로 했고, 이유는 내 문서 구조에 있다. 한국어 페이지의 `@graph`를 열어보면 이렇다.

```json
{"@type": "Organization", "name": "jangwook.net",
 "description": "Personal technology blog by Kim Jangwook", ...}
```

`/ko/` 경로의 페이지인데 Organization의 `description`은 영어다. Person의 `jobTitle`도 마찬가지다. 사이트 전역 엔티티라서 언어판마다 번역하지 않고 영어로 고정해뒀기 때문이다. 이 상태에서 `@context`에 `@language: "ko"`를 선언하면, 문서 안의 모든 문자열이 한국어라고 **선언**된다. 실제로는 영어인 문자열에 한국어 딱지가 붙는다.

없는 메타데이터보다 틀린 메타데이터가 나쁘다. 없으면 소비하는 쪽이 최소한 조심하지만, 틀린 값은 그대로 믿는다. 게다가 나는 `inLanguage`를 이미 항목 단위로 1,248블록 전부에 싣고 있다. 문서 전역 기본값보다 정확한 층위다. [구조화 데이터를 @graph 하나로 묶으면서](/ko/blog/ko/json-ld-graph-entity-linking-2026/) 만들어둔 구조가 여기서 유리하게 작동했다.

제대로 하려면 두 갈래다. 전역 엔티티의 다국어 문자열을 초안이 말하는 language map 형태로 바꾸거나, 아니면 `@context` 기본값을 건드리지 않고 항목 단위 `inLanguage`를 유지하는 것. 오늘은 후자를 택했다. 전자는 스키마 소비자들이 language map을 어떻게 다루는지 확인하지 않은 채로 손댈 영역이 아니고, 애초에 초안이 아직 초안이다.

## 이 초안을 얼마나 믿을 것인가

기대치를 먼저 깎아두는 편이 낫다.

첫째, 이건 First Public Working Draft다. 문서 자체가 이렇게 적어놨다.

> This is a draft document and may be updated, replaced, or obsoleted by other documents at any time. It is inappropriate to cite this document as other than a work in progress.

필드 이름이 바뀔 수도 있고 권고 방향이 뒤집힐 수도 있다. 오늘 이 초안대로 새 API 스키마를 설계하는 건 이르다. 반면 "문자열에 언어 표시를 붙여라"라는 원칙 자체는 초안 이전부터 있던 이야기이고, 그 수준의 조치는 지금 해도 손해가 없다. 내가 오늘 한 것도 딱 그 선까지다.

둘째, `dc:language`는 피드 리더와 소비자를 위한 것이다. 검색 순위와는 관계없다. 이 수정으로 트래픽이 오른다는 주장은 하지 않는다. 구조화 데이터에 대해 Google이 반복해서 밝혀온 입장도 같다. 마크업은 이해를 돕지만 순위를 보장하지 않는다.

셋째, `html[dir]`이 1,248페이지 전부에서 비어 있다는 감사 결과는 그대로 두었다. 내 네 언어는 전부 LTR이고 브라우저 기본값이 `ltr`이라 렌더링은 정확하다. 명시적이지 않을 뿐 틀리지는 않았다. RTL 언어판을 추가하는 날 이 항목은 즉시 실제 버그가 되고, 그때는 게이트에 규칙을 한 줄 더 넣으면 된다.

넷째, 나는 아랍어와 히브리어를 읽지 못한다. 이 글의 RTL 판정은 유니코드 속성 계산의 결과이지 원어민 검수를 거친 문장 평가가 아니다. 방향 판정 자체는 문자 속성이 결정하므로 계산으로 충분하지만, 실제 화면에서의 자연스러움까지 내가 보증할 수 있는 범위는 아니다.

## 정리: 문자열이 자기 언어를 들고 다니게 하라

오늘 확인한 것을 압축하면 세 줄이다. 방향 휴리스틱은 라틴 접두사가 붙은 RTL 문자열에서 무너진다. 언어를 섞어 내보내는 출력물은 감사하기 전까지 언어 표시가 빠져 있기 쉽다. 그리고 고친 상태는 게이트로 묶지 않으면 유지되지 않는다.

다국어 사이트를 운영한다면 오늘 안에 돌려볼 수 있는 점검 목록이다.

- **언어를 섞어 내보내는 출력물을 먼저 찾는다.** 통합 RSS/Atom, 사이트 전역 검색 인덱스, 통합 sitemap, 다국어를 한 번에 반환하는 JSON API가 후보다. 각 항목이 자기 언어를 선언하는지 확인한다.
- **RSS 통합 피드는 `dc:language`를 항목마다 붙인다.** 채널 `<language>`는 단일 언어 피드에만 쓴다. 네임스페이스 선언(`xmlns:dc`)을 빠뜨리지 않는다.
- **JSON API의 자연어 필드는 `{value, lang, dir}` 형태를 검토한다.** 초안이 권하는 기본형이다. 문서 레벨 기본값을 둘 수는 있지만, 문자열 레벨이 그걸 덮어쓸 수 있어야 한다.
- **`dir`에는 `ltr`, `rtl`, `auto` 세 값만 허용한다.** 초안이 명시적으로 세 값으로 제한한다.
- **문서 전역 언어 기본값을 선언하기 전에 그 문서 안의 문자열이 정말 전부 그 언어인지 확인한다.** 전역 엔티티 하나가 영어로 남아 있으면 그 선언은 거짓말이 된다.
- **`dir="auto"`에 의존하는 지점을 목록으로 만든다.** 사용자 입력 표시 영역, 제목, 작성자명이 주로 걸린다. 실제 값이 라틴 문자로 시작할 수 있는 필드라면 방향을 저장해서 함께 내보낸다.
- **고친 것은 빌드 게이트에 넣는다.** 검사기를 스크립트로 남기고 `postbuild`에 연결한 뒤, 일부러 깨뜨려서 exit code가 1로 떨어지는지 확인한다. 확인하지 않은 게이트는 게이트가 아니다.

감사에 쓴 스크립트는 60줄이 안 되고, 수정은 두 줄이었다. 시간이 든 곳은 코드가 아니라 판단이었다. `@context`에 `@language`를 넣지 않기로 정한 그 부분.

---

다국어 사이트의 언어·방향 메타데이터나 구조화 데이터 배선을 점검하고, 그 결과를 CI 게이트로 상설화하는 작업을 개인적으로 상담·구현 의뢰로 받고 있다. 지금 운영 중인 사이트의 어느 출력물이 언어 표시 없이 나가고 있는지 궁금하다면 [문의 페이지](/ko/contact/)로 연락 주면 된다.
