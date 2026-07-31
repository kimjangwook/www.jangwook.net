---
title: '내부 링크 46,382개 중 24,948개가 301로 튕기고 있었다'
description: '접근성 지표를 재려고 만든 스크립트가 URL 버그를 잡아냈다. 빌드된 HTML 1,334장의 내부 링크를 전수 조사하니 절반이 넘는 24,948개가 트레일링 슬래시 없는 주소, 즉 301 리다이렉트를 거치는 주소를 가리키고 있었다. 원인과 네 단계의 수정, 그리고 0으로 만든 기록.'
pubDate: '2026-07-31'
heroImage: '../../../assets/blog/internal-link-trailing-slash-redirect-audit-2026/hero.png'
tags:
  - SEO
  - 내부링크
  - 리다이렉트
  - canonical
  - 웹개발
faq:
  - question: '트레일링 슬래시가 없으면 검색 순위가 떨어지나요?'
    answer: '아닙니다. Google은 301 리다이렉트를 따라가고 신호를 통합합니다. 순위가 떨어진다는 공식 근거는 없고, 저도 그렇게 주장하지 않습니다. 실제 비용은 다른 곳에 있습니다. 사용자는 왕복 한 번을 더 지불하고, 사이트는 canonical과 어긋나는 주소를 스스로 광고하게 됩니다. Google 공식 문서는 "사이트 안에서 링크할 때는 중복 URL이 아니라 canonical URL로 링크하라"고 안내합니다.'
  - question: '슬래시를 붙이는 쪽과 빼는 쪽 중 뭐가 맞나요?'
    answer: '둘 다 맞습니다. 규칙이 아니라 관례이고, 호스팅이 어느 쪽을 200으로 서빙하느냐로 결정됩니다. 중요한 것은 canonical 태그가 선언한 형태와 내부 링크의 형태가 같은지입니다. 제 사이트는 canonical 1,330장이 전부 슬래시를 붙이고 있었으므로, 슬래시 없는 링크가 전부 어긋난 쪽이었습니다. canonical이 반대라면 수정 방향도 반대가 됩니다.'
  - question: '크롤 예산 때문에 고쳐야 하나요?'
    answer: '제 사이트 규모에서는 아닙니다. Google의 크롤 예산 문서는 대상을 "고유 페이지 100만 개 이상" 또는 "1만 페이지 이상이면서 매일 급변하는 사이트"로 한정합니다. 1,334장짜리 사이트는 여기 들어가지 않습니다. 같은 문서가 "긴 리다이렉트 체인은 피하라"고 말하긴 하지만, 제가 고친 이유는 예산이 아니라 일관성과 사용자 대기 시간이었습니다.'
  - question: '이 감사를 어떻게 상설화하나요?'
    answer: '빌드 산출물을 파싱해 내부 a href를 전수 검사하고, canonical 형태와 다른 링크가 하나라도 있으면 종료 코드 1을 반환하게 만들면 됩니다. 본문에 40줄짜리 스크립트를 실었습니다. 개발 서버가 아니라 dist를 대상으로 돌리는 것이 핵심입니다. 소스에는 없고 컴포넌트가 만들어 내는 링크가 실제로 절반이었습니다.'
relatedPosts:
  - slug: crawl-depth-flat-archive-audit-2026
    score: 0.74
    reason:
      ko: 같은 빌드 산출물을 두고 그때는 "홈에서 이 글에 닿는가"를 셌고, 이번에는 "닿는 그 링크가 올바른 주소인가"를 센다. 도달성 다음에 오는 질문이 링크의 형태다.
      ja: 同じビルド成果物を相手に、あちらでは「ホームから記事に届くか」を数えた。今回数えるのは「届くその一本が正しいURLか」だ。到達性の次に来る問いがリンクの形になる。
      en: Same build output, different question. That post counted whether the homepage can reach an article at all; this one asks whether the link doing the reaching points at the right URL.
      zh: 同一份构建产物，上一篇数的是"首页能否抵达这篇文章"，这一篇数的是"抵达用的那条链接是否指向正确的地址"。可达性之后紧接着的问题就是链接的形态。
  - slug: hreflang-reciprocity-audit-multilingual-2026
    score: 0.69
    reason:
      ko: hreflang도 이번 슬래시 문제도 "한쪽만 어긋나면 조용히 무효가 되는" 부류다. 빌드 산출물을 전수로 훑어 짝이 맞는지 확인하는 방법이 그대로 겹친다.
      ja: hreflangも今回のスラッシュ問題も、片方がずれた瞬間に黙って無効化される類のものだ。ビルド成果物を全数走査して整合を確かめる手つきがそのまま重なる。
      en: "hreflang and this slash mismatch belong to the same family: one side drifts and the whole thing quietly stops meaning what you intended. The full-sweep method over build output carries over directly."
      zh: hreflang 与这次的斜杠问题属于同一类：只要一侧错位，整套声明就悄悄失效。对构建产物做全量扫描来核对一致性的手法，可以原样搬过来。
  - slug: sitemap-lastmod-crawl-scheduling-2026
    score: 0.6
    reason:
      ko: sitemap에 어떤 형태의 URL을 넣느냐가 이 글의 canonical 형태 논의와 바로 이어진다. 사이트맵과 내부 링크가 서로 다른 주소를 광고하면 통합 신호가 흐려진다.
      ja: sitemapにどの形のURLを載せるかは、本稿のcanonical形の話と地続きだ。サイトマップと内部リンクが別々の住所を宣伝すれば、統合の信号は濁る。
      en: Which URL form goes into your sitemap runs straight into the canonical-form question here. If the sitemap and the internal links advertise different addresses, the consolidation signal gets muddy.
      zh: 站点地图里放哪种形态的 URL，与本文关于 canonical 形态的讨论是同一件事。若站点地图和内部链接各自宣传不同的地址，归并信号就会变浑。
  - slug: ai-crawlers-dont-render-javascript-csr-2026
    score: 0.52
    reason:
      ko: 렌더링 없이 HTML만 읽는 크롤러에게는 href 문자열이 곧 전부다. 그 문자열이 리다이렉트를 거치는 주소라면 비용은 그쪽에서 더 크게 붙는다.
      ja: レンダリングせずHTMLだけを読むクローラーにとって、href文字列がすべてだ。その文字列がリダイレクト先を指しているなら、コストはむしろそちら側で膨らむ。
      en: For a crawler that reads HTML and never renders, the href string is the whole story. If that string points at a redirect, the cost lands harder on that side.
      zh: 对于只读 HTML、从不渲染的爬虫来说，href 字符串就是全部。如果那串字符指向一个会跳转的地址，代价反而落在它这一侧更重。
---

빌드된 HTML 1,334장에서 내부 링크 46,382개를 셌다. 그중 24,948개가 301 응답을 받는 주소를 가리키고 있었다. 절반이 넘는다.

더 민망한 건 이 숫자를 찾으려던 게 아니었다는 점이다. 나는 링크 텍스트 접근성을 재고 있었다. "같은 이름의 링크가 서로 다른 곳을 가리키면 스크린 리더 사용자는 목적지를 구분할 수 없다"는 WCAG 항목을 자동으로 세어보려고 스크립트를 짰다. 그 스크립트가 1,330장을 위반으로 찍었다. 열어보니 접근성 문제가 아니었다. `home`이라는 같은 이름의 링크가 헤더에서는 `/en/`으로, 푸터에서는 `/en`으로 가고 있었다.

## 트레일링 슬래시는 취향이 아니라 서로 다른 두 개의 URL이다

먼저 토대부터. `https://example.com/blog`와 `https://example.com/blog/`는 사람 눈에 같은 페이지지만, HTTP에서는 서로 다른 두 개의 리소스 식별자다. 어느 쪽이 실제 문서를 돌려주는지는 서버가 정한다. 정적 사이트 호스팅은 대개 디렉터리 형태(`/blog/index.html`)로 파일을 배치하므로, 슬래시가 붙은 쪽이 200을 반환하고 슬래시 없는 쪽은 301로 슬래시 쪽에 넘긴다. 반대로 설정한 호스팅도 있다. 규칙이 아니라 관례이고, 관례는 배포 대상마다 다르다.

문제는 "어느 쪽이 옳은가"가 아니다. 한 사이트 안에서 두 형태가 섞이는 순간, 사이트는 자기 페이지를 두 개의 주소로 광고하기 시작한다. canonical 태그는 한쪽만 가리키는데 내부 링크는 다른 쪽을 가리키는 상태. 이게 내 사이트에서 벌어진 일이었다.

내 배포 환경에서 실제 응답을 확인해보면 이렇다.

```text
$ curl -sS -o /dev/null -w "%{http_code} -> %{redirect_url}\n" https://jangwook.net/en
301 -> https://jangwook.net/en/

$ curl -sS -o /dev/null -w "%{http_code}\n" https://jangwook.net/en/
200
```

브라우저는 이 301을 자동으로 따라가므로 사용자는 아무것도 눈치채지 못한다. 화면은 똑같이 뜬다. 대신 요청이 두 번 나간다.

## 접근성 지표를 돌렸는데 URL 버그가 나왔다

원래 목적은 링크 텍스트 감사였다. 빌드된 모든 페이지에서 `<a>`의 접근 가능한 이름을 뽑고(`aria-label` → 텍스트 → 이미지 `alt` → `title` 순), 한 페이지 안에서 같은 이름이 두 개 이상의 목적지를 가리키는 경우를 셌다.

부수적으로 나온 위생 지표는 나쁘지 않았다. 내부 링크 중 이름이 비어 있는 것 0개, "여기"·"자세히"·"click here" 같은 무의미한 링크 텍스트 0개, `alt` 없는 이미지 링크 0개. 고유한 링크 이름은 7,153개였다.

그런데 "같은 이름, 다른 목적지" 항목이 1,330장에서 걸렸다. 사실상 전 페이지다. 상위 목록을 보니 두 종류가 섞여 있었다.

하나는 오탐이었다. 언어 전환 링크는 모든 페이지에서 이름이 `🇰🇷 한국어`로 같고 목적지는 페이지마다 다르다. 323개 목적지가 한 이름에 붙어 있으니 기계는 위반이라고 말하지만, 사람에게는 그게 정상이다. WCAG의 판정 기준은 링크 텍스트 단독이 아니라 문맥을 포함하므로, 현재 페이지가 문맥이 되는 언어 전환기는 이 규칙으로 잡을 대상이 아니다. 자동 지표를 만들 때 이런 구조적 오탐을 먼저 분리하지 않으면 목록 전체가 쓰레기가 된다.

다른 하나가 진짜였다. `home`, `blog`, `about`, `contact`, `social`. 다섯 개 이름이 각각 두 개의 목적지를 갖고 있었고, 두 목적지의 차이는 마지막 슬래시 하나뿐이었다. 접근성 검사가 아니라 URL 정규화 검사에 걸렸어야 할 결함이 접근성 지표에 먼저 걸린 것이다.

소스를 열어보니 원인은 한 줄이었다.

```astro
<!-- src/components/Header.astro -->
<a href={`/${lang}/`}>{t("nav.home")}</a>

<!-- src/components/Footer.astro -->
<a href={`/${lang}`}>{t("nav.home")}</a>
```

두 컴포넌트를 다른 날 작성했고, 그 사이에 아무도 형태를 강제하지 않았다. 자동 검사도 이걸 잡지 못했다. 링크는 깨지지 않았기 때문이다. 실제로 이 저장소의 빌드 게이트에는 `broken internal links: 0`을 확인하는 검사가 이미 있었는데, 301은 깨진 링크가 아니라서 통과한다. [크롤 깊이를 재면서 도달성 0을 확인했을 때](/ko/blog/ko/crawl-depth-flat-archive-audit-2026/)도 마찬가지였다. 닿기는 닿았으니까.

## 46,382개를 분해한 숫자

전수 조사 결과다. 대상은 `dist/`의 HTML 1,334장, 집계 대상은 같은 오리진의 경로형 내부 링크(외부·`mailto:`·`tel:`·순수 앵커·확장자 있는 정적 파일 제외).

| 항목 | 값 |
|---|---|
| 빌드된 HTML 페이지 | 1,334장 |
| 내부 경로 링크 총계 | 46,382개 |
| 슬래시로 끝나는 링크 | 21,434개 (46.2%) |
| 슬래시 없는 링크 | 24,948개 (53.8%) |
| 그중 슬래시 경로에 실제 페이지가 존재 = 301 확정 | 24,944개 |
| 문제 링크를 하나 이상 가진 페이지 | 1,330장 / 1,334장 |
| `<link rel="canonical">`이 슬래시 형태 | 1,330장 / 1,330장 |

마지막 줄이 핵심이다. canonical은 예외 없이 슬래시 형태를 선언하고 있었다. 즉 슬래시 없는 링크 24,948개는 전부 "내 사이트가 스스로 정본이 아니라고 선언한 주소"를 가리키고 있었다.

발생 위치를 나눠보면 책임 소재가 갈린다.

| 위치 | 문제 링크 수 |
|---|---|
| 푸터·헤더 등 템플릿 | 10,640개 |
| 본문(`article`/`main`) 내부 | 14,300개 |
| 기타 | 8개 |

본문 쪽이 더 많다는 사실이 뼈아팠다. 저 14,300개는 내가 글마다 손으로 적어 넣은 내부 링크와 관련 글 컴포넌트가 만들어 낸 링크다. 다시 말해, 내부 링크를 열심히 심을수록 잘못된 형태가 늘어나는 구조였다.

## 공식 문서가 말하는 것과 말하지 않는 것

여기서 기대치를 정확히 맞춰둘 필요가 있다. Google 문서에서 직접 확인되는 문장은 다음 두 가지다.

> When linking within your site, link to the canonical URL rather than a duplicate URL. Linking consistently to the URL that you consider to be canonical helps Google understand your preference.

([Consolidate duplicate URLs — Google Search Central](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls))

> Avoid long redirect chains, which have a negative effect on crawling.

([Large site owner's guide to managing your crawl budget — Google Search Central](https://developers.google.com/search/docs/crawling-indexing/large-site-managing-crawl-budget))

두 문장이 실제로 보증하는 범위는 좁다. 첫 문장은 "내부 링크를 canonical에 맞추면 Google이 네 선호를 이해하는 데 도움이 된다"이지, 안 맞추면 벌점을 준다가 아니다. 둘째 문장은 "긴 체인"을 말한다. 내 경우는 홉이 하나다.

그리고 크롤 예산 이야기는 애초에 내 사이트에 해당하지 않는다. 같은 문서가 대상을 이렇게 좁혀둔다.

> Large sites (1 million+ unique pages) with content that changes moderately often (once a week)
> Medium or larger sites (10,000+ unique pages) with very rapidly changing content (daily)

1,334장짜리 사이트는 어느 쪽도 아니다. 그러니 "크롤 예산을 아끼려고 고쳤다"고 쓰면 그건 거짓말이다. 순위가 오른다는 주장은 더더욱 할 수 없다. 구조화 데이터든 링크 형태든 순위를 보장하지 않는다는 게 Google의 일관된 입장이고, 나도 그 선을 넘지 않는다.

그럼 왜 고쳤나. 이유는 세 가지고, 전부 검색 순위 바깥에 있다.

첫째, 사용자 대기 시간. 같은 URL을 각각 일곱 번 호출해 측정한 값이다. 301 응답 자체는 중앙값 33.6ms로 오히려 빠르다. 최종 문서를 받는 200 응답이 중앙값 43.0ms. 문제는 사용자가 둘 다 지불한다는 것이다. 약 77ms 대 43ms. 노트북 한 대, 캐시가 따뜻한 엣지에서 잰 일곱 번의 표본이라 절대값을 그대로 믿을 값은 아니다. 다만 방향은 분명하다. 두 번 가는 것보다 한 번 가는 게 빠르다.

둘째, 자기모순 제거. canonical이 A를 가리키는데 내부 링크 절반이 B를 가리키는 상태는 어느 각도에서 봐도 설명하기 어렵다.

셋째, 이게 링크만의 문제로 끝나지 않는다는 점. 슬래시 없는 주소가 외부에 공유되면 분석 도구에서 두 개의 경로로 쪼개져 집계된다. 순위 이야기를 꺼내지 않아도 계측 품질만으로 고칠 이유가 된다.

## 24,948을 0으로 만든 네 단계

한 번에 안 끝났다. 고칠 때마다 다시 재고, 남은 숫자를 보고 다음 원인을 찾는 식이었다.

![Internal links pointing at a redirecting URL, measured across four fix stages](../../../assets/blog/internal-link-trailing-slash-redirect-audit-2026/redirect-bound-links.png)

<strong>1단계. 템플릿 수정 (13개 파일, 29줄).</strong> `Footer.astro`, `AuthorBox.astro`, `HeroSection.astro`, `BlogPost.astro`와 몇 개 페이지에서 `/${lang}/blog` 형태의 href를 슬래시 붙은 형태로 바꿨다. 결과는 24,948 → 7,808. 29줄로 17,140개가 사라졌다. 템플릿 한 줄이 1,330장에 복사되는 구조라 수정의 지렛대가 크다.

<strong>2단계. 마크다운 본문 정규화 (1,276개 파일).</strong> 글 본문에 손으로 적은 `](/ko/blog/ko/slug)` 형태를 일괄 치환했다. 앵커가 붙은 경우(`...slug#section`)는 슬래시를 앵커 앞에 넣어야 한다.

```perl
perl -pi -e 's{\]\((/[a-z]{2}/[^)\s#]*[^/)\s#])(#[^)\s]*)?\)}{"](" . $1 . "/" . ($2//"") . ")"}ge' "$f"
```

결과는 7,808 → 3,905.

<strong>3단계. 관련 글 컴포넌트 (1줄).</strong> 남은 3,905개를 페이지 하나 열어 추적하니 전부 `recommendation-item` 클래스 안에 있었다. `RelatedPosts.astro`가 slug로 URL을 조립하는 한 줄이 범인이었다. 고치니 3,905 → 85.

<strong>4단계. 잔여물 85개.</strong> 11개 페이지에 남았다. 정체는 세 갈래였다. 마크다운 안에 `](...)`가 아니라 생 HTML `<a href="...">`로 적힌 링크 세 편, 개선 이력 데이터 JSON의 `sourceReport` 필드, 그리고 `404.astro`의 하드코딩 링크. 마지막 잔여물이 늘 가장 이상한 곳에 숨어 있다.

네 단계를 거쳐 리다이렉트를 타는 내부 링크는 0개가 됐다. 정확히는 4개가 슬래시 없이 남아 있는데, 옛 글이 참조하는 `/research/seo/*.svelte` 경로라 애초에 페이지가 아니다(그건 그것대로 따로 고칠 일이다). 재미있는 건 1단계가 파일 13개로 전체의 69%를 처리했고, 나머지 세 단계가 파일 1,280여 개를 건드려 31%를 처리했다는 점이다. 손으로 쓴 링크는 언제나 이런 식으로 비싸다.

## 그대로 돌릴 수 있는 감사 스크립트

브라우저도 헤드리스 도구도 필요 없다. 빌드 산출물을 파싱하면 끝난다. `cheerio` 하나만 있으면 된다.

```js
import fs from 'node:fs';
import path from 'node:path';
import * as cheerio from 'cheerio';

const DIST = process.argv[2] ?? 'dist';
const SITE = 'https://example.com';

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}

let total = 0;
const bad = [];

for (const file of walk(DIST)) {
  const rel = '/' + path.relative(DIST, file).replace(/index\.html$/, '');
  const $ = cheerio.load(fs.readFileSync(file, 'utf8'));

  $('a[href]').each((_, a) => {
    const href = $(a).attr('href');
    if (!href || /^(https?:|mailto:|tel:|javascript:|#|\/\/)/i.test(href)) return;
    const { pathname } = new URL(href, SITE + rel);
    if (/\.[a-z0-9]{2,5}$/i.test(pathname)) return;  // 정적 파일은 제외
    total++;
    // canonical 형태가 슬래시 없는 쪽이라면 조건을 뒤집을 것
    if (!pathname.endsWith('/')) bad.push(`${rel} -> ${href}`);
  });
}

console.log(`internal links: ${total}, non-canonical form: ${bad.length}`);
for (const b of bad.slice(0, 20)) console.log('  ' + b);
if (bad.length) process.exit(1);
```

`dist`를 대상으로 돌리는 게 핵심이다. 소스를 grep하면 컴포넌트가 조립해서 만들어 내는 링크를 놓친다. 내 경우 그 몫이 절반이었다.

마지막 두 줄이 CI 게이트다. 0이 아니면 빌드가 실패한다. 이미 존재하는 위반 때문에 게이트를 못 켜는 상황이라면, 먼저 0으로 만든 다음 게이트를 거는 순서가 맞다. 임계값을 두고 "현재 수준 유지"로 타협하면 그 수치는 반드시 다시 올라간다. [측정한 다음 게이트로 상설화한다](/ko/blog/ko/hreflang-reciprocity-audit-multilingual-2026/)는 순서를 이 저장소에서 계속 쓰는 이유다.

## 정리: 링크는 canonical과 같은 문자열로만

- <strong>먼저 정본 형태를 확인한다.</strong> `<link rel="canonical">`이 슬래시를 붙이는지 빼는지 본다. 그게 기준이고, 내부 링크는 거기에 맞춘다. 반대로 맞춰도 된다. 섞이는 것만 안 된다.
- <strong>소스가 아니라 빌드 산출물을 검사한다.</strong> 템플릿·컴포넌트·데이터 파일·마크다운이 각각 링크를 만든다. 최종 HTML에서만 전부가 한자리에 모인다.
- <strong>"깨진 링크 0"과 "리다이렉트 0"은 다른 검사다.</strong> 301은 깨진 링크가 아니다. 기존 링크 체커는 이걸 통과시킨다.
- <strong>템플릿부터 고친다.</strong> 파일 13개가 전체의 69%였다. 지렛대가 가장 긴 곳이 거기다.
- <strong>잔여물을 끝까지 쫓는다.</strong> 생 HTML 앵커, JSON 데이터의 URL 필드, 404 페이지. 마지막 몇 십 개는 항상 예상 밖에 있다.
- <strong>0으로 만든 다음 게이트를 건다.</strong> 종료 코드 1을 반환하는 20줄이면 재발이 막힌다.
- <strong>순위 이야기는 하지 않는다.</strong> 이 수정으로 순위가 오른다는 근거는 없다. 얻는 것은 왕복 한 번의 절약, 일관된 canonical 신호, 그리고 쪼개지지 않는 분석 데이터다.

접근성 지표를 만들다 URL 버그를 잡은 게 우연처럼 보이지만, 따지고 보면 우연이 아니다. 링크 하나는 사람에게는 목적지의 이름이고, 크롤러에게는 정본 주소의 선언이며, 분석 도구에게는 집계 키다. 세 관점 중 하나만으로 검사하면 나머지 두 곳의 결함이 그림자로 남는다.

빌드 산출물을 이런 식으로 훑어 무엇이 새고 있는지 숫자로 바꾸는 일을 업으로 다룬다. 지금 운영 중인 사이트에서 그 숫자가 궁금하다면 [프로필](/ko/about/)에 적어둔 경로로 물어보면 된다.

---

*출처: Google Search Central의 [Consolidate duplicate URLs](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls), [Large site owner's guide to managing your crawl budget](https://developers.google.com/search/docs/crawling-indexing/large-site-managing-crawl-budget) (둘 다 공식). 측정 환경: 자체 Astro 빌드 산출물 HTML 1,334장, Node 24 + cheerio 1.2.0으로 전수 파싱, 응답 코드·지연은 curl 7회 표본. 링크 수치와 지연 값은 이 사이트·이 배포 환경에서 나온 값이며 Google의 처리 방식에 대한 진술이 아니다.*
