---
title: '제목을 선언하는 일곱 곳 중 여섯 곳만 내가 썼다: 앵커 텍스트 18,296개 실측'
description: '한 페이지의 제목은 title·h1·og:title·headline·RSS까지 여섯 곳에서 선언된다. 전부 일치했다. 문제는 일곱 번째 채널이었다. 내 사이트로 들어오는 내부 링크 18,296개 중 목표 글의 제목과 일치하는 앵커 텍스트는 0.7%뿐이었고, 그 원인은 카드 전체를 감싼 링크 하나였다.'
pubDate: '2026-08-01'
heroImage: '../../../assets/blog/title-declaration-channels-anchor-text-audit-2026/hero.png'
tags:
  - SEO
  - 접근성
  - 앵커텍스트
  - 구조화데이터
  - 웹개발
faq:
  - question: '앵커 텍스트를 제목과 똑같이 맞추면 검색 순위가 올라가나요?'
    answer: '그런 근거는 없고, 저도 그렇게 주장하지 않습니다. Google 문서는 앵커 텍스트와 "페이지를 가리키는 링크 안의 텍스트"를 제목 링크를 만들 때 참고하는 출처로 나열할 뿐, 순위에 대한 언급은 없습니다. 제가 고친 이유는 순위가 아니라 세 가지입니다. 스크린 리더가 읽는 링크 이름이 367자였고, 링크 하나가 날짜·제목·설명·태그를 통째로 삼키고 있었고, Google이 제목을 다시 쓸 때 참고한다고 밝힌 텍스트를 제가 한 번도 검토한 적이 없었기 때문입니다.'
  - question: '카드 전체를 클릭 가능하게 유지하면서 링크 텍스트만 줄일 수 있나요?'
    answer: '가능합니다. 링크는 제목 텍스트만 감싸고, 카드에 position: relative를 준 뒤 링크의 ::after에 position: absolute와 inset: 0을 주면 됩니다. 클릭 영역은 카드 전체로 유지되고 앵커 텍스트와 접근성 이름은 제목 한 줄이 됩니다. 대가도 있습니다. 오버레이가 덮인 영역의 본문 텍스트는 마우스로 선택하기 어려워집니다.'
  - question: 'JSON-LD의 headline을 title과 맞추면 제목 링크가 바뀌나요?'
    answer: '아닙니다. Google이 제목 링크의 출처로 나열한 항목에 Article이나 BlogPosting의 headline은 없습니다. headline은 Article 구조화 데이터의 권장 속성이고, 문서는 긴 제목이 일부 기기에서 잘릴 수 있으니 간결하게 쓰라고 안내합니다. 맞춰 두는 것은 일관성 때문이지 제목 링크를 조종하기 위해서가 아닙니다.'
  - question: '제목 채널 감사를 어떻게 상설화하나요?'
    answer: '빌드 산출물을 파싱해 페이지마다 title·h1·og:title·headline·RSS 제목을 뽑아 비교하고, 하나라도 어긋나면 종료 코드 1을 반환하게 만들면 됩니다. 여기에 두 가지를 더 붙이는 편이 좋습니다. 콘텐츠 페이지를 가리키는 앵커 텍스트의 길이 상한, 그리고 title의 문자 체계가 html lang과 맞는지 확인하는 규칙입니다. 제 사이트에서 실제로 걸린 버그가 후자였습니다.'
relatedPosts:
  - slug: internal-link-trailing-slash-redirect-audit-2026
    score: 0.76
    reason:
      ko: 같은 dist 전수 스윕을 쓰지만 보는 곳이 다르다. 그쪽은 링크가 가리키는 주소의 형태를 셌고, 이쪽은 그 링크 안에 들어 있는 글자를 센다. 언어 스위처가 구조적 잡음으로 남는 지점도 겹친다.
      ja: 同じdist全数スイープを使いながら、見ている場所が違う。あちらはリンクが指す住所の形を数え、こちらはそのリンクの中に入っている文字を数えた。言語スイッチャーが構造的ノイズとして残る点も重なる。
      en: Same full sweep over build output, different target. That post counted the shape of the URL a link points at; this one counts the characters sitting inside the link. The language switcher shows up as structural noise in both.
      zh: 同样是对构建产物做全量扫描，看的地方却不同。那一篇数的是链接指向的地址形态，这一篇数的是链接内部装着的文字。语言切换器在两边都作为结构性噪声出现。
  - slug: accessible-name-agents-2026
    score: 0.71
    reason:
      ko: 링크의 접근성 이름이 무엇으로 계산되는지 알고 나면, 카드 전체를 감싼 앵커가 왜 367자짜리 이름을 만들어내는지가 바로 보인다. 이 글의 수정은 그 계산 규칙을 역으로 이용한 것이다.
      ja: リンクのアクセシブルネームが何から計算されるかを知ると、カード全体を包んだアンカーがなぜ367文字の名前を作るのかが一目でわかる。本稿の修正はその計算規則を逆手に取ったものだ。
      en: Once you know how a link's accessible name gets computed, it becomes obvious why an anchor wrapped around a whole card produces a 367-character name. The fix here just works that algorithm backwards.
      zh: 一旦了解链接的可访问名称是如何计算出来的，就能立刻看懂包裹整张卡片的锚点为何会生成一个 367 字的名称。本文的修法正是反过来利用了那套规则。
  - slug: table-markup-a11y-llm-extraction-2026
    score: 0.64
    reason:
      ko: 마크업 하나를 바꿨을 때 접근성 트리와 텍스트 추출이 동시에 흔들린다는 점이 같다. 표에서는 행 복원이 무너졌고, 링크에서는 제목이 묻힌다.
      ja: マークアップを一つ変えると、アクセシビリティツリーとテキスト抽出が同時に揺れる。表では行の復元が崩れ、リンクではタイトルが埋もれる。
      en: Change one bit of markup and both the accessibility tree and text extraction shift at once. With tables it was row recovery that broke; with links it's the title that gets buried.
      zh: 改动一处标记，可访问性树和文本抽取会同时受影响。在表格里崩掉的是行的还原，在链接里被埋掉的是标题。
  - slug: json-ld-graph-entity-linking-2026
    score: 0.58
    reason:
      ko: headline이 어느 엔티티에 붙어 있는지, 그 엔티티가 페이지의 어느 URL을 가리키는지가 이 글의 채널 정리와 이어진다. 구조화 데이터 쪽 제목은 그 엔티티 모델 위에 얹힌다.
      ja: headlineがどのエンティティに付いているのか、そのエンティティがページのどのURLを指すのかは、本稿のチャネル整理とつながる。構造化データ側のタイトルはそのエンティティモデルの上に載る。
      en: Which entity carries the headline, and which URL that entity claims, connects straight to the channel inventory here. The structured-data title rides on top of that entity model.
      zh: headline 挂在哪个实体上、那个实体又指向页面的哪个 URL，与本文的通道梳理是同一条线。结构化数据这一侧的标题正是搭在那套实体模型之上。
  - slug: hreflang-reciprocity-audit-multilingual-2026
    score: 0.55
    reason:
      ko: 언어별 파일이 한 벌로 움직이는 사이트에서는 한 언어판만 어긋나도 조용히 잘못된 신호가 나간다. 이번에 걸린 것은 hreflang이 아니라 제목의 언어였다.
      ja: 言語別ファイルが一組で動くサイトでは、一つの言語版がずれるだけで静かに誤った信号が出る。今回引っかかったのはhreflangではなくタイトルの言語だった。
      en: On a site where the language files move as one set, a single drifting version quietly emits the wrong signal. This time the drift wasn't in hreflang but in the language of the title itself.
      zh: 在各语言文件成组移动的站点上，只要一个语言版本错位，就会悄悄发出错误信号。这次出问题的不是 hreflang，而是标题本身的语言。
---

Google 문서에는 검색 결과의 제목 링크를 만들 때 참고하는 출처가 아홉 줄로 나열돼 있다. `<title>` 요소, 페이지에 크게 보이는 제목, `<h1>` 같은 헤딩, `og:title`, 스타일로 크고 두드러지게 표시된 텍스트, 페이지의 다른 텍스트, 페이지 안의 앵커 텍스트, **이 페이지를 가리키는 링크 안의 텍스트**, 그리고 `WebSite` 구조화 데이터다. 출처는 [Control your title links in search results](https://developers.google.com/search/docs/appearance/title-link)다.

앞쪽 항목들은 내가 쓴 것이다. 굵게 표시한 여덟 번째 줄만 아니었다. 나는 내 글을 가리키는 링크 안에 어떤 글자가 들어 있는지 한 번도 확인한 적이 없었다. 빌드된 사이트에서 그 글자들을 전부 긁어 세어 보니 18,296개였고, 그중 목표 글의 `<h1>`과 일치하는 것은 121개, 0.7%였다.

## 제목은 한 번 쓰지만 일곱 번 발행된다

먼저 토대부터 정리한다. 웹에서 "페이지 제목"은 하나의 값이 아니다. 읽는 쪽이 저마다 다른 여러 채널의 묶음이고, 채널마다 보는 선언이 따로 있다.

`<title>`은 브라우저 탭과 북마크, 그리고 검색 결과의 기본 재료다. W3C의 WCAG 2.2 성공 기준 2.4.2 Page Titled는 이것을 레벨 A로 요구한다. 기준 문장은 "Web pages have titles that describe topic or purpose"이고, [해설 문서](https://www.w3.org/WAI/WCAG22/Understanding/page-titled.html)는 사용자 에이전트가 페이지를 식별할 수 있도록 제목을 쉽게 노출한다는 점, 그리고 인지 장애나 단기 기억 제약이 있는 사용자가 제목으로 콘텐츠를 식별하는 데서 이득을 본다는 점을 든다. 즉 `<title>`은 SEO 이전에 접근성 요구 사항이다.

`<h1>`은 화면에 보이는 제목이고, 문서 구조의 최상위이며, 스크린 리더의 헤딩 내비게이션 출발점이다. `og:title`은 소셜 카드와 메신저 미리보기가 읽는다. `twitter:title`은 그 변종이다. RSS의 `<title>`은 피드 리더가 목록에 그린다. JSON-LD의 `headline`은 Article 구조화 데이터의 속성이다.

여기서 하나 짚어야 할 게 있다. Google이 제목 링크의 출처로 나열한 아홉 줄에 `headline`은 없다. Article 구조화 데이터 문서에서 `headline`은 필수가 아니라 **권장** 속성으로 분류되고, 안내 문구는 긴 제목이 일부 기기에서 잘릴 수 있으니 간결한 제목을 고려하라는 정도다. 같은 문서에 "Google does not guarantee that features that consume structured data will show up in search results"라는 문장도 함께 있다([Article structured data](https://developers.google.com/search/docs/appearance/structured-data/article)). `headline`을 `<title>`과 맞춰 두는 것은 일관성 관리이지 제목 링크를 조종하는 수단이 아니다. 이 구분을 흐리면 구조화 데이터로 순위를 산다는 이야기로 미끄러진다.

그리고 마지막 채널이 있다. 다른 페이지에서 이 페이지로 걸린 링크의 텍스트. 이건 그 페이지 파일 안에 없다. 사이트의 다른 1,300장 어딘가에 흩어져 있고, 대개는 사람이 아니라 컴포넌트가 만든다.

## 여섯 개 채널은 전수로 일치했다

내 사이트는 언어당 324편, 네 언어를 합쳐 1,296편의 글을 낸다. 빌드 산출물 `dist/`를 통째로 파싱해 글 페이지마다 다섯 개 채널을 뽑고, 별도로 생성되는 RSS까지 붙여 비교했다.

```js
// dist/의 글 페이지마다 제목 채널을 뽑아 문자열로 대조한다
const $ = cheerio.load(readFileSync(file, 'utf8'));
const rec = {
  title:    norm($('head > title').first().text()),
  h1:       norm($('h1').first().text()),
  ogTitle:  norm($('meta[property="og:title"]').attr('content')),
  twTitle:  norm($('meta[property="twitter:title"]').attr('content')),
  headline: null,
};
$('script[type="application/ld+json"]').each((_, el) => {
  const data = JSON.parse($(el).contents().text());
  const nodes = Array.isArray(data) ? data : (data['@graph'] ?? [data]);
  for (const n of nodes) if (n?.headline && !rec.headline) rec.headline = norm(n.headline);
});
```

결과는 시시했다. 1,296편 전부가 다섯 채널을 모두 갖고 있었고, `title == og:title`, `title == h1`, `title == headline`, `h1 == RSS 제목`이 전부 100% 일치했다. 길이도 안정적이었다. 최소 13자, 중앙값 46자, p90 59자, 최대 70자. 60자를 넘는 것이 97편 있었는데, 60자는 업계 관행상의 눈대중이지 Google이 문서로 정한 상한이 아니다. 공식 문서는 글자 수를 제시하지 않는다. 참고값으로만 본다.

일치율이 100%인 이유는 설계가 잘돼서가 아니라 단순해서다. 다섯 채널 모두가 frontmatter의 `title` 필드 하나에서 나온다. 소스가 하나면 드리프트가 생길 자리가 없다. 반대로 말하면, CMS나 SSR 템플릿에서 채널마다 다른 필드를 참조하는 구조라면 이 100%는 절대 그냥 나오지 않는다. 그런 사이트라면 이 스크립트가 첫날부터 뭔가를 잡아낼 것이다.

## 일곱 번째 채널은 아무도 손으로 쓰지 않았다

문제는 여기부터였다. 글 페이지를 가리키는 내부 링크 18,296개의 앵커 텍스트를 뽑아, 목표 페이지의 `<h1>`과 비교했다.

| 항목 | 수정 전 |
|---|---|
| 글을 가리키는 내부 링크 | 18,296개 |
| 앵커 텍스트가 대상 `<h1>`과 정확히 일치 | 121개 (0.7%) |
| 대상 `<h1>`을 포함하되 더 긴 경우 | 5,185개 (28.3%) |
| 둘 다 아닌 경우 | 12,990개 (71%) |
| 앵커 텍스트 길이 p90 / p99 / 최대 | 144자 / 290자 / 367자 |
| 151자 이상 앵커 | 1,716개 |

367자짜리 링크 텍스트를 열어봤다. 이렇게 시작한다.

```
2026년 7월 31일 내부 링크 46,382개 중 24,948개가 301로 튕기고 있었다
접근성 지표를 재려고 만든 스크립트가 URL 버그를 잡아냈다. 빌드된 HTML 1,334장의
내부 링크를 전수 조사하니 절반이 넘는 24,948개가 트레일링 슬래시 없는 주소, 즉
301 리다이렉트를 거치는 주소를 가리키고 있었다. ... #SEO #내부링크 #리다이렉트 더 읽기
```

블로그 카드 한 장의 내용 전체다. 날짜, 읽는 시간, 제목, 설명, 태그 세 개, 그리고 "더 읽기". 원인은 감싸는 방식 하나였다. 카드 컴포넌트가 `<article>` 안의 모든 것을 앵커 하나로 감싸고 있었다.

```astro
<!-- 수정 전: 카드 전체가 링크 하나 -->
<article class="post-card">
  <a href={href} class="post-card__link">
    <div class="post-card__media">
      <Image src={heroImage} alt={title} ... />
    </div>
    <div class="post-card__body">
      <time>{date}</time> · <span>{readingTime}분</span>
      <h3>{title}</h3>
      <p>{description}</p>
      <div class="post-card__tags">...</div>
      <span>{readMoreLabel}</span>
    </div>
  </a>
</article>
```

이 패턴은 흔하다. 카드 어디를 눌러도 글로 넘어가게 하려면 가장 쉬운 방법이기 때문이다. 대가는 세 군데에서 한꺼번에 치른다.

첫째, 접근성이다. 링크의 접근성 이름은 그 안에 들어 있는 텍스트를 이어 붙여 계산된다. 이미지의 `alt`까지 제목으로 넣어놨으니 제목이 두 번 들어갔다. 스크린 리더 사용자가 링크 목록을 훑을 때 항목 하나가 367자짜리 문단으로 읽힌다. 이 계산 규칙 자체는 [접근성 이름이 어떻게 정해지는지 다룬 글](/ko/blog/ko/accessible-name-agents-2026/)에서 정리한 적이 있는데, 그때는 버튼 이름을 봤고 이번에는 그 규칙이 반대 방향으로 나를 물었다.

둘째, Google이 제목 링크를 만들 때 참고한다고 밝힌 텍스트가 이것이다. 문서는 페이지에 문제가 감지되면 앵커나 본문 텍스트에서 더 나은 제목 링크를 생성하려 시도한다고 적고 있다. 내 사이트의 모든 글은 "날짜 + 제목 + 설명 + 태그 + 더 읽기"라는 덩어리로 서로를 가리키고 있었다.

셋째, 링크 그래프를 읽는 쪽 전부다. 자바스크립트를 실행하지 않고 HTML만 읽는 크롤러에게 앵커 텍스트는 문서 사이의 관계를 설명하는 거의 유일한 단서다. [AI 크롤러가 렌더링을 하지 않는다는 실측](/ko/blog/ko/ai-crawlers-dont-render-javascript-csr-2026/)을 정리한 뒤로 나는 이 채널을 특히 신경 쓰고 있었는데, 정작 내 카드가 그 단서를 뭉개고 있었다.

## 링크는 제목만 감싸고, 클릭 영역은 되살린다

수정 방향은 이미 알려져 있다. 앵커는 제목 텍스트만 감싼다. 내준 클릭 영역은 가상 요소로 되찾는다.

```astro
<article class="post-card">
  <div class="post-card__media" aria-hidden="true">
    <Image src={heroImage} alt="" ... />
  </div>
  <div class="post-card__body">
    <time>{date}</time> · <span>{readingTime}분</span>
    <h3><a href={href} class="post-card__link">{title}</a></h3>
    <p>{description}</p>
    <div class="post-card__tags">...</div>
    <span class="post-card__read" aria-hidden="true">{readMoreLabel}</span>
  </div>
</article>

<style>
  .post-card { position: relative; }

  /* 링크는 제목만 감싼다. 카드 전체의 클릭 영역은 오버레이가 담당한다 */
  .post-card__link::after {
    content: '';
    position: absolute;
    inset: 0;
  }

  .post-card__link:focus-visible {
    outline: 2px solid var(--flow-deep);
    outline-offset: 3px;
  }
</style>
```

세 가지를 같이 손봐야 한다. 썸네일의 `alt`는 빈 문자열로 바꾼다. 제목 링크가 목적지를 이미 말하고 있으므로 같은 문장을 한 번 더 읽힐 이유가 없다. `더 읽기` 같은 장식 텍스트에는 `aria-hidden="true"`를 준다. 그리고 호버 스타일의 선택자를 `.post-card__link:hover`에서 `.post-card:hover`로 옮겨야 한다. 이걸 빼먹으면 카드 위에서 마우스를 움직여도 아무 반응이 없다.

포커스 링을 명시적으로 지정하는 것도 필수다. 링크가 제목 텍스트 크기로 줄어들면서 기본 포커스 표시가 카드 안에서 눈에 덜 띄게 되기 때문이다.

오버레이 방식에는 정직하게 밝혀 둘 대가가 있다. `inset: 0`으로 덮인 영역의 본문 텍스트는 마우스로 드래그 선택하기 어려워진다. 카드 안의 설명 문구를 사용자가 복사할 일이 있는 UI라면 이 패턴을 다시 생각해야 한다. 블로그 목록 카드에서는 그럴 일이 드물다고 판단해 받아들였다.

같은 수정을 세 곳에 적용했다. 블로그 목록의 카드 컴포넌트, 글 하단의 관련 글 목록, 그리고 다국어 랜딩 페이지의 최신 글 카드다. 관련 글 목록은 제목 아래에 추천 이유 문장이 한 줄 더 붙어 있어서, 앵커가 그 문장까지 삼키고 있었다.

## 고치고 다시 쟀다

같은 스크립트를 다시 돌렸다. 링크 개수는 18,296개로 동일하다. 바뀐 것은 그 안의 글자다.

| 앵커 텍스트 길이 | 수정 전 | 수정 후 |
|---|---|---|
| 1〜30자 | 11,792 | 12,294 |
| 31〜70자 | 2,132 | 5,947 |
| 71〜150자 | 2,656 | 55 |
| 151〜300자 | 1,605 | 0 |
| 300자 초과 | 111 | 0 |
| p90 / p99 / 최대 | 144 / 290 / 367자 | 52 / 67 / 111자 |
| 대상 `<h1>`과 정확히 일치 | 121 (0.7%) | 5,285 (28.9%) |

![수정 전후 앵커 텍스트 길이 분포. 151자 이상 링크 1,716개가 0개가 됐고, 대상 제목과 정확히 일치하는 앵커는 121개에서 5,285개로 늘었다.](../../../assets/blog/title-declaration-channels-anchor-text-audit-2026/anchor-text-length.png)

브라우저에서도 확인했다. Playwright의 헤드리스 Chromium으로 목록 페이지를 열어 첫 카드를 재니 1036×329픽셀이고, 카드 안의 앵커는 정확히 한 개다. 카드 박스의 가로 75%·세로 80% 지점, 그러니까 태그가 놓인 아래쪽 여백에서 `document.elementFromPoint`를 호출하면 링크가 잡힌다. 오버레이가 클릭 영역을 그대로 유지하고 있다는 뜻이다. 레이아웃도 그대로였다.

![수정 후 블로그 목록 카드. 2단 그리드와 여백은 그대로이고, 링크가 감싸는 범위만 제목 한 줄로 줄었다.](../../../assets/blog/title-declaration-channels-anchor-text-audit-2026/card-after.png)

여기서 오해할 만한 숫자가 하나 있다. "대상 `<h1>`과 일치"가 28.9%밖에 안 된다는 것. 나머지 71%는 여전히 제목과 다르다. 이건 버그가 아니다. 컴포넌트 클래스별로 나눠 보면 정체가 분명하다.

| 제목과 다른 앵커 12,990개 | 개수 | 판단 |
|---|---|---|
| 헤더의 언어 스위처 | 5,184 | 정상. "KO 한국어"가 목적지를 말한다 |
| 글 페이지의 언어 스위처 | 3,888 | 정상. 같은 글의 다른 언어판을 가리킨다 |
| 본문 안의 문맥 링크 | 3,846 | 정상. 문장 안에서 대상을 설명하는 표현이어야 한다 |
| 기타 | 72 | 목록·네비게이션 |

본문 문맥 링크를 대상 글의 제목으로 획일화하면 오히려 나빠진다. 문장 흐름 안에서는 "AI 크롤러가 렌더링을 하지 않는다는 실측"처럼 읽는 사람에게 맞는 표현이 낫다. 언어 스위처도 마찬가지다. 이건 [트레일링 슬래시 감사 때 구조적 오탐으로 분리해 둔 것](/ko/blog/ko/internal-link-trailing-slash-redirect-audit-2026/)과 같은 종류다. 목표는 "모든 앵커가 제목이어야 한다"가 아니라 "제목을 말해야 할 자리에서 제목이 아닌 것을 말하지 않는다"이다.

수정 후에도 70자를 넘는 앵커가 55개 남아 있다. 전부 본문 안의 문맥 링크다. 컴포넌트가 만든 것은 하나도 남지 않았다.

## 채널별로 무엇을 신경 쓸지

일곱 채널을 소비자와 관리 주체 기준으로 정리하면 판단이 쉬워진다.

| 채널 | 주로 읽는 쪽 | 누가 쓰는가 | 흔한 실패 | 할 것 |
|---|---|---|---|---|
| `<title>` | 브라우저·검색·보조기술 | 사람(템플릿) | 비어 있음, 중복, 사이트명 반복 | WCAG 2.4.2 레벨 A. 페이지마다 고유하게 |
| `<h1>` | 화면·헤딩 내비게이션 | 사람 | 페이지에 없거나 여러 개 | 한 개, 화면 제목과 동일하게 |
| `og:title` | 소셜·메신저 미리보기 | 템플릿 | title과 따로 놀기 | 같은 소스에서 생성 |
| `twitter:title` | 일부 클라이언트 | 템플릿 | 갱신 누락 | og:title과 동일하게 두거나 생략 |
| JSON-LD `headline` | 구조화 데이터 소비자 | 템플릿 | 순위 도구로 오해 | 권장 속성. 간결하게, 일관되게 |
| RSS `<title>` | 피드 리더 | 피드 생성기 | 본문 제목과 어긋남 | 같은 필드에서 생성 |
| 인바운드 앵커 텍스트 | 검색·크롤러·스크린 리더 | **컴포넌트** | 카드 통째 삼킴, 장문화 | 링크는 제목만, 클릭 영역은 오버레이 |

이 표에서 실질적으로 위험한 줄은 마지막 하나다. 앞의 여섯은 한 파일 안에서 눈으로 확인되고, 값이 틀리면 눈에 띈다. 마지막 줄은 어느 파일에도 적혀 있지 않다. 컴포넌트를 고치기 전까지는 존재조차 세어지지 않는다.

조직 관점에서 보면 이건 기술 부채의 전형적인 형태다. 선언 지점이 일곱 곳인데 리뷰 대상은 여섯 곳뿐이고, 나머지 하나는 UI 변경의 부산물로만 바뀐다. "카드 전체를 클릭 가능하게 해달라"는 요청이 SEO나 접근성 리뷰를 거칠 이유는 보통 없다. 그래서 이런 종류는 사람의 주의력이 아니라 게이트로 막아야 한다.

## 제목의 문자 체계가 본문과 다르면 Google이 다시 쓴다

같은 스윕으로 WCAG 2.4.2를 전수 점검했다. 1,336장 중 `<title>`이 비어 있는 페이지가 한 장 나왔다. 확인해 보니 `public/`에 들어 있는 광고 네트워크 소유권 확인용 스텁 HTML이었다. 콘텐츠 페이지가 아니니 접근성 위반으로 세기는 어렵지만, 빈 제목의 HTML이 배포물에 섞여 있다는 사실 자체는 기록해 둔다.

더 의미 있는 것은 중복 제목이었다. 서로 다른 페이지가 완전히 같은 `<title>`을 갖는 그룹이 두 개, 페이지로는 네 장이었다.

- `en/iterative-review-cycle-methodology`: 본문은 영어인데 `<title>`과 `description`이 한국어였다
- `ko/barracuda-cuda-amd-compiler`: 본문은 한국어인데 `<title>`이 일본어였다

Google의 제목 링크 문서는 제목을 다시 쓰는 이유 중 하나로 페이지의 주 언어·문자 체계와 제목이 맞지 않는 경우를 명시한다. 문서가 이름 붙인 상황에 내 페이지가 정확히 들어가 있었던 셈이다. 네 언어판을 한 벌로 굴리는 사이트에서 이런 드리프트는 놀랍지 않다. 한 언어판의 frontmatter만 복사한 채로 제목을 갈아 끼우지 않으면 그대로 남는다. 둘 다 고쳤고, 중복 제목 그룹은 0이 됐다.

추출기 쪽도 한 번 확인했다. Readability 0.6.0에 글 페이지를 넣으면 `<h1>`과 동일한 제목을 돌려준다. 반면 `<head>`를 무시하고 `<body>`만 텍스트로 변환하면 첫 줄이 "본문으로 건너뛰기", 그다음이 헤더 네비게이션이다. 제목은 `<h1>`에 닿을 때까지 나오지 않는다. 본문만 긁는 파이프라인에서 `<h1>`이 사실상 유일한 제목 신호라는 뜻이다.

## 여기까지가 내가 확인한 범위다

정직하게 선을 그어 둔다.

측정한 것은 **내 사이트가 무엇을 내보내는가**이지, Google이 그것으로 무엇을 하는가가 아니다. 나는 내 글의 제목 링크가 검색 결과에서 다시 쓰였는지 확인하지 않았고, 수정 전후의 노출 데이터도 갖고 있지 않다. 앵커 텍스트를 제목에 맞췄다고 순위가 오른다는 주장은 하지 않는다. 공식 문서는 제목 링크를 순위와 연결짓지 않고, 구조화 데이터에 대해서도 기능이 검색 결과에 나타남을 보장하지 않는다고 못 박는다.

60자라는 제목 길이 기준도 관행이지 공식 수치가 아니다. 내 글 97편이 그 선을 넘지만, 그것 자체로 고칠 이유가 되지는 않는다고 본다.

확실한 것은 접근성 쪽이다. 367자짜리 링크 이름은 어떤 해석에서도 좋은 설계가 아니다. 그리고 제목을 말해야 할 자리에서 카드 전체를 읊는 링크는, 검색엔진이 어떻게 처리하든 사람에게 먼저 불편하다. 나는 그 이유만으로도 충분하다고 판단했다.

## 점검 목록: 오늘 돌려볼 수 있는 네 줄

빌드 산출물을 대상으로 다음 네 가지를 세면 된다. 개발 서버가 아니라 `dist/`를 봐야 한다. 문제의 절반은 소스에 없고 컴포넌트가 만들어 낸다.

1. **채널 대조.** 페이지마다 `title` / `h1` / `og:title` / JSON-LD `headline` / RSS 제목을 뽑아 문자열로 비교한다. 하나라도 어긋나면 실패.
2. **앵커 길이 상한.** 콘텐츠 페이지를 가리키는 앵커 텍스트 중 임계값(내 기준 70자)을 넘는 것을 센다. 넘는 것이 컴포넌트 출력이면 실패, 본문 문맥 링크면 통과.
3. **제목 유일성.** `<title>`이 비어 있거나 두 페이지 이상에서 중복되면 실패. WCAG 2.4.2 레벨 A가 여기 걸린다.
4. **제목 언어 일치.** `<title>`의 문자 체계가 `html[lang]`과 맞는지 본다. 다국어 사이트라면 이게 가장 자주 걸린다.

게이트로 만들 때의 뼈대는 짧다.

```js
const fails = [];
for (const page of articles) {
  if (page.title !== page.h1) fails.push(`h1 drift: ${page.path}`);
  if (page.title !== page.ogTitle) fails.push(`og:title drift: ${page.path}`);
  if (page.title !== page.headline) fails.push(`headline drift: ${page.path}`);
}
for (const a of componentAnchors) {
  if (a.len > 70) fails.push(`anchor ${a.len} chars: ${a.from} -> ${a.to}`);
}
if (fails.length) { console.error(fails.join('\n')); process.exit(1); }
```

카드 하나를 어떻게 감싸느냐가 사이트 전체의 링크 텍스트를 결정한다. 나는 그 사실을 1,296편을 세고 나서야 알았다. 컴포넌트가 만들어 내는 텍스트를 한 번도 세어 보지 않은 사이트를 운영 중이라면, 아마 비슷한 숫자가 나올 것이다. 같이 열어볼 사람은 [프로필](/ko/about/)의 연락처로 부르면 된다.

---

*출처: Google Search Central의 [Control your title links in search results](https://developers.google.com/search/docs/appearance/title-link), [Article (Article, NewsArticle, BlogPosting) structured data](https://developers.google.com/search/docs/appearance/structured-data/article), W3C WAI의 [Understanding SC 2.4.2: Page Titled](https://www.w3.org/WAI/WCAG22/Understanding/page-titled.html). 측정 환경: 자체 Astro 빌드 산출물 HTML 1,336〜1,338장, 글 페이지 1,296편, Node 22.22 + cheerio 1.2.0으로 전수 파싱. 브라우저 확인은 Playwright Chromium(headless, 뷰포트 1100px), 추출기 확인은 @mozilla/readability 0.6.0과 html-to-text 10.0.0. 모든 수치는 이 사이트의 이 빌드에서 나온 값이며, Google의 처리 방식에 대한 진술이 아니다.*
