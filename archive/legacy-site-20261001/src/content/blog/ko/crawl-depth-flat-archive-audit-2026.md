---
title: '언어별 아카이브 네 장을 지웠더니 296편이 도달 불가가 됐다: 크롤 깊이 실측'
description: '관련 글이 평균 8개씩 걸린 사이트의 내부 링크를 도달성 기준으로 다시 세어 봤다. 빌드된 HTML 1,330장을 너비 우선 탐색하니 글 1,288편 중 1,276편이 깊이 2였다. 그런데 언어별 목록 페이지 네 장을 링크 그래프에서 빼자 296편이 홈에서 닿지 않았다.'
pubDate: '2026-07-30'
heroImage: '../../../assets/blog/crawl-depth-flat-archive-audit-2026/hero.png'
tags:
  - SEO
  - 내부링크
  - 크롤러빌리티
  - 정보구조
  - 웹개발
faq:
  - question: '크롤 깊이는 Google이 실제로 쓰는 순위 요소인가요?'
    answer: 'Google이 공개한 순위 요소 목록에 "클릭 깊이"라는 항목은 없습니다. 이 글에서 재는 깊이는 제가 정한 자체 지표이고, 의미는 "홈에서 링크만 따라가 그 페이지에 닿는 데 필요한 최소 홉 수"입니다. Google 공식 문서가 보증하는 것은 훨씬 좁습니다. 링크는 href가 있는 a 요소일 때만 크롤할 수 있다는 사실뿐입니다. 깊이가 얕아야 순위가 오른다는 주장은 공식 근거가 없습니다.'
  - question: 'sitemap.xml에 올려두면 링크로 닿지 않아도 괜찮은가요?'
    answer: '발견 자체는 사이트맵으로도 됩니다. 그래서 "링크로 도달 불가"가 곧 "색인 불가"는 아닙니다. 다만 사이트맵은 URL 목록일 뿐이라 그 페이지가 사이트 안에서 무엇의 하위이고 어떤 글과 이어지는지에 대한 정보를 담지 않습니다. 링크 경로가 주는 문맥은 사이트맵으로 대체되지 않으므로, 저는 둘을 서로의 백업이 아니라 다른 역할로 취급합니다.'
  - question: '관련 글 추천 링크가 많으면 내부 링크는 충분한 건가요?'
    answer: '제 사이트가 정확히 그 착각의 사례였습니다. 글마다 인바운드 링크가 중앙값 8개였고 인바운드 0개인 글은 없었습니다. 그런데 목록 페이지를 그래프에서 빼고 다시 탐색하니 1,288편 중 296편이 홈에서 도달 불가였습니다. 추천 그래프는 방향이 있는 그래프라서, 링크 개수가 많아도 루트에서 들어오는 경로가 없는 덩어리가 생깁니다.'
  - question: '목록 페이지를 페이지네이션으로 쪼개면 안 되나요?'
    answer: '쪼개도 됩니다. 대신 다음 페이지로 가는 링크를 반드시 a href로 내보내야 합니다. Google 문서는 페이지 간 관계를 알리려면 각 페이지에서 다음 페이지로 a href 링크를 넣으라고 안내하고, rel=next/prev는 더 이상 쓰지 않는다고 명시합니다. 더보기 버튼이나 무한 스크롤만으로 뒷페이지를 만들면 그 뒤의 글은 링크 경로를 잃습니다.'
relatedPosts:
  - slug: ai-crawlers-dont-render-javascript-csr-2026
    score: 0.71
    reason:
      ko: 그 글은 크롤러가 JS를 실행하지 않으면 본문이 통째로 비는 것을 쟀고, 이 글은 같은 조건에서 링크 경로가 끊기는 것을 잰다. 렌더 없이 남는 HTML이 전부라는 전제를 두 방향에서 확인한 기록이다.
      ja: あちらはJSを実行しないクローラーの前で本文が空になることを測り、こちらは同じ条件でリンク経路が切れることを測る。レンダリング前のHTMLだけが残るという前提を、二つの角度から確かめた記録だ。
      en: That post measures how the body empties out when a crawler skips JavaScript; this one measures how the link paths break under the same condition. Two angles on the same premise, that the pre-render HTML is all you get.
      zh: 那篇测量的是爬虫不执行JS时正文如何整块消失，本文测量的是同样条件下链接路径如何断裂。两个角度验证同一个前提：渲染之前的HTML就是全部。
  - slug: sitemap-lastmod-crawl-scheduling-2026
    score: 0.66
    reason:
      ko: sitemap의 lastmod가 재방문 시점에 관한 신호라면, 크롤 깊이는 첫 방문 경로에 관한 문제다. 발견과 재발견을 각각 다루므로 둘을 붙여 읽으면 사이트맵이 무엇을 대신할 수 없는지가 분명해진다.
      ja: sitemapのlastmodが再訪のタイミングに関する信号なら、クロール深度は最初にたどり着く経路の問題だ。発見と再発見をそれぞれ扱うので、並べて読むとサイトマップが代替できない部分がはっきりする。
      en: If sitemap lastmod is a signal about when to come back, crawl depth is about how a crawler arrives the first time. Read together, they make clear what a sitemap cannot stand in for.
      zh: 如果sitemap的lastmod是关于"何时回访"的信号，抓取深度则关乎"第一次如何抵达"。一篇讲发现、一篇讲再发现，并读就能看清站点地图替代不了什么。
  - slug: hreflang-reciprocity-audit-multilingual-2026
    score: 0.58
    reason:
      ko: 4언어 사이트의 링크 관계를 빌드 산출물에서 전수 검사한다는 점이 같다. 그때는 언어판끼리의 상호 참조를 셌고, 이번에는 홈에서 각 글까지의 경로를 센다.
      ja: 4言語サイトのリンク関係をビルド成果物から全数検査する点が同じだ。あのときは言語版どうしの相互参照を数え、今回はホームから各記事までの経路を数えている。
      en: Same method, a full sweep over the build output of a four-language site. Last time I counted reciprocal references between language versions; this time I count the path from the homepage to every article.
      zh: 方法相同：对四语言站点的构建产物做全量检查。上次数的是语言版本之间的互相引用，这次数的是从首页到每篇文章的路径。
  - slug: recommendation-system-v3
    score: 0.54
    reason:
      ko: 이 글에서 도달성 검사에 걸린 대상이 바로 그 추천 시스템이 만든 링크 그래프다. 추천 품질과 크롤 도달은 다른 축이라는 것을 이번 실측이 보여준다.
      ja: 本稿の到達性チェックに掛けた対象が、まさにあの推薦システムが生成したリンクグラフだ。推薦の質とクロール到達は別軸だと今回の実測が示している。
      en: The link graph put under the reachability test here is the one that recommendation system generates. This measurement shows recommendation quality and crawl reachability are separate axes.
      zh: 本文接受可达性检验的，正是那套推荐系统生成的链接图。这次实测说明推荐质量与抓取可达是两条不同的轴。
---

관련 글이 글마다 8개씩 걸려 있으니 내부 링크는 충분하다고 생각했다. 그 숫자는 아무것도 보장하지 않았다.

어제 표 마크업을 재느라 빌드 산출물을 뒤지다 엉뚱한 의심이 붙었다. 내가 링크를 세는 방식이 애초에 틀렸다는 의심이다. 나는 그동안 내부 링크를 "이 글에 들어오는 링크가 몇 개인가"로만 봤다. 그런데 크롤러 입장에서 중요한 값은 개수가 아니라 경로다. 링크가 스무 개 걸려 있어도 그 스무 개가 전부 홈에서 닿지 않는 글에서 온 것이라면, 루트에서 출발한 크롤러에게는 링크가 0개인 것과 다르지 않다.

그래서 빌드된 HTML 1,330장을 홈에서부터 너비 우선으로 훑는 스크립트를 짰다. 60줄 남짓이고 브라우저도 쓰지 않는다. 결과는 두 갈래로 나왔다. 현재 구조는 글 1,288편 중 1,276편이 깊이 2에 들어와 있어 아주 건강했다. 그리고 목록 페이지 네 장을 그래프에서 빼자 296편이 홈에서 도달 불가로 떨어졌다. 인바운드 링크 중앙값 8개짜리 추천 그래프가 그 296편을 구하지 못했다.

## 크롤 깊이는 개수가 아니라 경로를 세는 값이다

이 글에서 말하는 크롤 깊이는 "홈(`/`)에서 출발해 링크만 따라갈 때 해당 페이지에 닿기까지 필요한 최소 홉 수"다. 홈이 깊이 0, 홈에서 직접 링크된 페이지가 깊이 1이다. 그래프 이론의 최단 경로이고, 계산은 너비 우선 탐색으로 한 번에 끝난다.

왜 이 값이 인바운드 링크 개수보다 중요한가. 검색엔진과 AI 크롤러가 사이트를 파악하는 기본 경로가 링크 추적이기 때문이다. 여기서 링크의 정의는 생각보다 좁다. Google 공식 문서는 이렇게 못박는다.

> Google can only crawl your link if it's an `<a>` HTML element (also known as *anchor element*) with an `href` attribute.

([Links Google can crawl](https://developers.google.com/search/docs/crawling-indexing/links-crawlable), Google Search Central) 같은 문서는 스크립트 이벤트로 링크처럼 동작하는 요소에 대해서도 분명하게 선을 긋는다. "Google can't reliably extract URLs from `<a>` elements that don't have an `href` attribute or other tags that perform as links because of script events." 클릭 핸들러로 페이지를 이동시키는 카드, `<div>`에 라우터를 물린 목록, 더보기 버튼은 이 정의 밖이다. 화면에서는 링크처럼 보이지만 링크 그래프에는 존재하지 않는다.

깊이가 커질 때 무엇이 나빠지는지도 공식 문서에 단정적으로 적혀 있지는 않다. Google은 클릭 깊이 임계값을 공개하지 않고, 링크 구조가 순위를 보장한다고 말하지도 않는다. 대신 크롤 예산 문서가 전제를 알려준다. "Google defines a site's crawl budget as the set of URLs that Google can and wants to crawl." 그리고 같은 문서는 대상을 좁힌다. "If your site doesn't have a large number of pages that change rapidly, or if your pages seem to be crawled the same day that they are published, you don't need to read this guide."([Large site owner's guide to managing your crawl budget](https://developers.google.com/search/docs/crawling-indexing/large-site-managing-crawl-budget))

내 사이트는 이 문서가 말하는 "읽을 필요 없는" 규모다. 그래서 나는 깊이를 예산 문제로 다루지 않는다. 대신 훨씬 단순한 질문으로 쓴다. **링크만 따라가는 방문자에게 이 글이 존재하는가.** 여기서 방문자는 사람일 수도, Googlebot일 수도, JS를 실행하지 않는 AI 크롤러일 수도 있다. 실행 없이 HTML만 읽는 쪽에 대해서는 [AI 크롤러가 JavaScript를 렌더링하지 않을 때 남는 것](/ko/blog/ko/ai-crawlers-dont-render-javascript-csr-2026/)에서 따로 쟀다. 도달성은 그 전제 위에서만 의미가 있는 지표다.

## 빌드 산출물을 너비 우선으로 훑는 60줄

측정 대상은 개발 서버가 아니라 `npm run build`가 뱉은 `dist/`다. 이유는 두 가지다. 실제로 배포되는 바이트와 같고, 클라이언트에서 뒤늦게 붙는 링크는 애초에 세지 않기 때문이다. 세지 않는 것이 목적이다.

규칙은 최대한 보수적으로 잡았다. `<a href>`만 링크로 인정하고, `rel="nofollow"`가 붙은 앵커는 제외하고, 이미지·CSS·JS·피드 같은 자산 확장자는 버리고, 프래그먼트와 쿼리는 잘라 정규화했다. 절대 URL은 자기 도메인만 남겼다.

```javascript
// 링크 추출: <a href>만, nofollow 제외
const linksOf = (url) => {
  const html = readFileSync(pages.get(url), 'utf8');
  const out = new Set();
  for (const m of html.matchAll(/<a\b[^>]*?href\s*=\s*["']([^"']+)["'][^>]*>/gi)) {
    if (/\brel\s*=\s*["'][^"']*nofollow/i.test(m[0])) continue;
    const t = norm(m[1], url);          // 정규화 + 자산 확장자 제외
    if (t && pages.has(t)) out.add(t);  // 실제 빌드된 페이지만
  }
  return out;
};

// 홈에서 너비 우선 탐색
const depth = new Map([['/', 0]]);
let q = ['/'], d = 0;
while (q.length) {
  const next = [];
  for (const u of q) for (const t of linksOf(u)) {
    inbound.set(t, (inbound.get(t) || 0) + 1);
    if (!depth.has(t)) { depth.set(t, d + 1); next.push(t); }
  }
  q = next; d++;
}
```

정규식으로 HTML을 파싱하는 것은 일반적으로 나쁜 습관이다. 여기서는 감사 대상이 내가 만든 템플릿 한 벌이고, 앵커 태그의 형태가 예측 가능해서 그대로 뒀다. 남의 사이트를 잴 때라면 파서를 붙이는 편이 낫다.

## 1,276편이 깊이 2, 도달 불가는 0편

첫 실행 결과는 예상보다 좋았다.

| 항목 | 값 |
|---|---|
| 빌드된 HTML 페이지 | 1,330장 |
| 글 페이지(4언어) | 1,288편 |
| 최대 깊이 | 3 |
| 깊이 1의 글 | 12편 |
| 깊이 2의 글 | 1,276편 |
| 도달 불가한 글 | 0편 |
| 글당 인바운드 링크 중앙값 | 8개 |
| 인바운드 0개인 글 | 0편 |
| 인바운드 2개 이하인 글 | 0편 |

글이 아닌 페이지 중 5장은 홈에서 닿지 않았다. `/404/`, 별도 앱의 랜딩과 하위 두 장, 광고 네트워크 소유권 확인용 HTML이다. 전부 링크 그래프에 들어갈 이유가 없는 페이지라 그대로 뒀다.

깊이 2가 압도적인 이유는 구조를 보면 바로 나온다. 홈에서 언어별 목록 페이지(`/ko/blog/`)로 한 홉, 그 목록에서 각 글로 한 홉이다. 목록 페이지가 페이지네이션 없이 322편을 한 장에 전부 나열하기 때문에, 4년 전 글도 어제 글과 같은 깊이 2에 앉는다. 처음부터 의도한 설계는 아니었다. 글이 몇십 편일 때 만든 목록을 손대지 않고 300편까지 왔을 뿐이다.

## 목록 페이지 네 장을 지우자 296편이 사라졌다

여기서 진짜로 궁금해진 것은 저 깊이 2가 무엇 덕분인가였다. 추천 그래프가 촘촘해서인가, 아니면 목록 페이지 한 장이 전부 떠받치고 있는 것인가. 인바운드 중앙값 8개라는 숫자만 보면 앞쪽처럼 보인다.

그래서 링크 그래프에서 언어별 목록 페이지 네 장만 빼고 같은 탐색을 다시 돌렸다. 페이지는 그대로 두고, 크롤러가 그 페이지의 링크만 수확하지 못하는 조건을 만들었다. 목록이 클라이언트 렌더링으로 바뀔 때, 더보기 버튼 뒤로 들어갈 때, 실수로 `noindex, nofollow`가 붙을 때 실제로 벌어지는 일이다.

![홈에서 도달한 글 페이지의 깊이 분포. 평면 아카이브가 있을 때는 1,276편이 깊이 2에 모여 있지만, 아카이브를 빼면 깊이가 9까지 퍼지고 296편이 도달 불가가 된다](../../../assets/blog/crawl-depth-flat-archive-audit-2026/depth-distribution.png)

| 조건 | 최대 깊이 | 깊이별 글 수 | 도달 불가 |
|---|---|---|---|
| 현재 구조 | 3 | 1: 12 / 2: 1,276 | 0편 |
| 목록 페이지 제외 | 9 | 1: 12 / 2: 52 / 3: 129 / 4: 253 / 5: 274 / 6: 154 / 7: 83 / 8: 25 / 9: 10 | **296편** |
| 목록에 최근 10편만 노출 | 9 | 1: 12 / 2: 64 / 3: 121 / 4: 249 / 5: 274 / 6: 154 / 7: 83 / 8: 25 / 9: 10 | **296편** |

296편이다. 전체의 23%다. 인바운드 링크가 중앙값 8개씩 걸려 있고 인바운드 0개인 글이 하나도 없는 사이트에서, 언어마다 목록 한 장씩 네 장을 빼자 네 편 중 한 편 가까이가 홈에서 닿지 않게 됐다.

원인은 추천 그래프의 성질이다. 관련 글 링크는 방향이 있다. A가 B를 추천해도 B가 A를 추천하지는 않는다. 그리고 추천은 유사도로 뽑히므로 비슷한 글끼리 뭉친다. 그 결과 서로를 촘촘히 가리키지만 외부에서 들어오는 화살은 없는 덩어리가 생긴다. 강하게 연결된 섬이다. 섬 안의 글은 인바운드 링크가 여덟 개씩 있어도 루트에서 도달 불가다. **인바운드 개수는 도달성을 재는 지표가 아니다.**

세 번째 줄이 더 인상적이다. 목록 페이지가 최근 10편만 노출하는 경우, 즉 페이지네이션 1페이지는 살아 있지만 다음 페이지로 가는 링크가 `<a href>`가 아닌 경우를 흉내냈다. 도달 불가는 296편 그대로였다. 첫 페이지가 살아 있어도 뒷페이지로 가는 크롤 가능한 링크가 없으면 아무것도 구제되지 않는다. Google 문서가 페이지네이션에 관해 요구하는 것이 정확히 이 지점이다.

> To make sure search engines understand the relationship between pages of paginated content, include links from each page to the following page using `<a href>` tags.

([Pagination and incremental page loading](https://developers.google.com/search/docs/specialty/ecommerce/pagination-and-incremental-page-loading), Google Search Central) 같은 문서는 `rel="next"`/`rel="prev"`에 대해 "Google no longer uses these tags, although these links may still be used by other search engines"라고 적는다. 즉 관계를 알리는 수단은 메타 힌트가 아니라 본문의 앵커다.

## 평면 목록의 청구서는 670KB와 DOM 7,257개

그럼 322편을 한 장에 나열하는 대가는 무엇인가. 프로덕션 빌드를 로컬에서 서빙하고 Chrome으로 재봤다.

| 지표 | `/ko/blog/` (목록) | 글 페이지 1장 |
|---|---|---|
| 전송 바이트(gzip) | 86,431 | 24,168 |
| 디코드 후 바이트 | 670,699 | 83,719 |
| DOM 노드 | 7,257 | 684 |
| 앵커 | 349 (고유 글 링크 322) | 45 |
| 이미지 | 320 (`loading="lazy"` 319) | 측정 안 함 |
| DOMContentLoaded | 387ms | 423ms |
| loadEventEnd | 1,861ms | 측정 안 함 |

원본 HTML 655KB가 gzip으로 84KB까지 줄어든다. 마크업 반복이 심한 목록 페이지는 압축이 잘 먹는다. 언어별로는 ko 655.0KB(84.1KB), ja 659.7KB(85.1KB), zh 628.5KB(83.9KB), en 604.4KB(66.7KB)였다. 네 언어 모두 앵커 349개, 고유 글 링크 322개로 같다.

솔직히 DOM 노드 7,257개는 마음에 걸린다. 글 페이지의 열 배가 넘는다. 다만 여기엔 완충 장치가 이미 걸려 있다. 이미지 320장 중 319장이 `loading="lazy"`이므로 초기 뷰포트 밖 썸네일은 요청되지 않는다. DOMContentLoaded 387ms는 글 페이지(423ms)보다 오히려 빨랐다. 이 비교는 로컬 서빙·따뜻한 캐시 조건이라 절대값을 그대로 믿을 수는 없다. 다만 "목록 페이지가 특별히 느려지는 조짐"은 이 조건에서 관측되지 않았다.

내 판단은 이렇다. 이 청구서는 **한 장에 국소적으로 청구되고, 계측 가능하며, 상한이 보인다.** 반대로 296편이 링크 경로를 잃는 손해는 국소적이지 않고, 언제 회복되는지도 알 수 없다. 나는 전자를 낸다. 이런 페이지에서 실제로 위험한 것은 바이트가 아니라 레이아웃 안정성과 렌더 비용인데, 그쪽은 [CLS를 0.559에서 0.014로 내린 실측](/ko/blog/ko/cls-layout-shift-reserve-space-measure-2026/)에서 다룬 방식대로 공간을 미리 잡아두면 대체로 통제된다.

## 페이지네이션을 넣으면 깊이가 어떻게 늘어나는가

목록을 쪼개고 싶은 날이 올 수도 있으니 산수를 미리 해뒀다. 글 322편 기준이다.

| 페이지당 글 | 목록 페이지 수 | 다음 링크만 있을 때 최악 깊이 | 5칸 번호 페이저일 때 최악 깊이 |
|---|---|---|---|
| 10편 | 32장 | 33 | 9 |
| 20편 | 16장 | 17 | 6 |
| 50편 | 7장 | 8 | 4 |
| 100편 | 4장 | 5 | 3 |
| 322편(현재) | 1장 | 2 | 2 |

"다음 링크만"은 `1 → 2 → 3 → …`으로 이어지는 전형적인 next-only 페이저다. 페이지당 10편으로 쪼개면 가장 오래된 글은 깊이 33에 앉는다. 반면 번호 페이저를 다섯 칸씩 노출하면 같은 32장이 깊이 9로 줄어든다. 페이저 UI를 어떻게 그리느냐가 정보 구조의 깊이를 직접 결정한다는 뜻이다. UI 선택이라고 생각했던 것이 실은 크롤 경로 설계였다.

여기서 나오는 실무 규칙은 단순하다. 페이지네이션을 넣을 때 next-only 페이저는 피한다. 번호 페이저를 쓰거나, 목록과 별개로 전체 글을 한 장에 나열하는 색인 페이지를 남긴다. 후자가 흔히 말하는 사이트맵 페이지다. 사이트맵 XML과 달리 사람도 읽고 크롤러도 링크로 따라갈 수 있다.

## 이 측정이 말하지 않는 것

이 숫자들이 보증하지 않는 것이 몇 가지 있다.

**깊이는 내 지표다.** Google이 특정 깊이를 기준선으로 쓴다는 공식 문서는 없다. 링크 구조로 순위가 보장되지도 않는다. 공식 문서가 보증하는 것은 크롤 가능한 링크의 형태(`<a href>`)와, 크롤 예산이라는 개념의 정의까지다. 이 글의 깊이 숫자는 "내가 만든 구조가 링크만으로 얼마나 자기 자신을 설명하는가"의 지표로 읽어야 한다.

**도달 불가가 색인 불가는 아니다.** sitemap.xml에 URL이 올라 있으면 링크 경로 없이도 발견될 수 있다. 그래서 296편이 곧 사라진다는 뜻이 아니다. 다만 사이트맵이 발견을 얼마나 밀어주는지도 무한정은 아니어서, `lastmod`를 고쳐 넣었을 때 재크롤 주기가 실제로 움직이는지는 [따로 재봤다](/ko/blog/ko/sitemap-lastmod-crawl-scheduling-2026/). 그리고 사이트맵은 URL 목록일 뿐 문맥을 담지 않는다. 어떤 글의 하위인지, 어떤 주제 묶음에 속하는지, 무엇 다음에 읽어야 하는지는 링크만이 표현한다. 사이트맵으로 발견을 보완하는 것과 링크로 구조를 표현하는 것은 서로의 대체재가 아니다.

**두 번째와 세 번째 줄은 시뮬레이션이다.** Googlebot의 실제 행동을 관측한 것이 아니라, 내 링크 그래프에서 특정 간선을 제거한 뒤 최단 경로를 다시 계산한 값이다. 검증한 명제는 "저 목록이 사라지면 내 링크 그래프는 296편을 루트에서 잃는다"까지다.

**정적 HTML만 셌다.** 클라이언트에서 붙는 링크는 계산에 들어가지 않았다. 이것은 한계가 아니라 설계다. JS를 실행하지 않는 크롤러가 보는 그래프를 재는 것이 목적이었다.

**인바운드 중앙값 8개는 내 사이트 값이다.** 그 그래프는 내 추천 생성기가 만든 것이므로 형태가 내 사이트에 특수하다. 다른 사이트에서 같은 실험을 하면 숫자는 달라진다. 재현되는 것은 숫자가 아니라 방법이다.

## 정리: 링크는 개수로 세지 말고 루트에서 재라

오늘 얻은 결론을 체크리스트로 남긴다. 사이트 규모와 무관하게 30분 안에 돌려볼 수 있다.

1. **빌드 산출물에서 재라.** 개발 서버나 CMS 데이터가 아니라 배포되는 HTML에서 `<a href>`만 모아 홈에서 너비 우선 탐색을 돌린다. 클라이언트에서 붙는 링크가 빠지는 것이 정상이다.
2. **인바운드 개수 대신 도달 불가 건수를 KPI로 삼아라.** 인바운드 0개(고아)만 보는 감사는 강하게 연결된 섬을 통과시킨다. 봐야 할 값은 루트에서의 도달 불가 건수와 깊이 분포다. 간선 개수를 채운 다음에 남는 질문은 그 간선이 무엇이라고 말하느냐인데, 앵커 텍스트를 [제목이 선언되는 일곱 채널 중 하나로 놓고 감사한 기록](/ko/blog/ko/title-declaration-channels-anchor-text-audit-2026/)이 따로 있다.
3. **허브 제거 시뮬레이션을 한 번 돌려라.** 목록·태그·카테고리 같은 허브 페이지를 하나씩 그래프에서 빼고 도달 불가 건수가 얼마나 튀는지 본다. 한 장을 빼서 수백 편이 날아가면 그 페이지가 단일 장애점이다. 그 사실을 알고 유지하는 것과 모르고 유지하는 것은 다르다.
4. **더보기·무한 스크롤 뒤에 콘텐츠를 숨기지 마라.** 스크립트 이벤트로 동작하는 요소는 크롤 가능한 링크가 아니다(Google 공식). 무한 스크롤을 쓰더라도 같은 목록을 `<a href>` 페이저로 병행 노출한다.
5. **페이저는 next-only를 피하라.** 322편을 10편씩 쪼개면 최악 깊이가 33이 되고, 같은 페이지 수를 번호 페이저로 노출하면 9로 준다. 깊이는 UI 선택의 결과다.
6. **평면 목록의 비용은 계측해서 상한을 알아라.** 내 경우 전송 86KB, DOM 7,257개, 썸네일 320장 중 319장 지연 로딩이었다. 이 정도면 낸다. 대신 감으로 "무겁겠지"라고 넘기지 말고 숫자를 확인한 다음 결정한다.

그럼 우리 사이트는 지금 몇 편을 잃고 있을까. 이 질문을 숫자로 바꾸는 일이 내 작업이다. 정보 구조 감사, 내부 링크 재설계, 크롤러 도달성 계측. 답이 궁금하면 [프로필](/ko/about/)의 경로로 물어봐도 된다.

---

*출처: Google Search Central의 [Links Google can crawl](https://developers.google.com/search/docs/crawling-indexing/links-crawlable), [Pagination and incremental page loading](https://developers.google.com/search/docs/specialty/ecommerce/pagination-and-incremental-page-loading), [Large site owner's guide to managing your crawl budget](https://developers.google.com/search/docs/crawling-indexing/large-site-managing-crawl-budget) (모두 공식). 측정 환경: 자체 Astro 빌드 산출물 1,330장, Node 24 스크립트로 너비 우선 탐색, Chrome으로 로컬 프리뷰 계측. 깊이 지표와 허브 제거 결과는 이 사이트에서 나온 값이며 Google의 크롤 모델이 아니다.*
