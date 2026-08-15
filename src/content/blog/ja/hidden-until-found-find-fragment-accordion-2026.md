---
title: 'フラグメントは届いたのに、閉じたアコーディオンは開かなかった'
description: '同じ文を17マスに入れてChromium 143で測った。max-height:0はscrollY 6083でも箱の高さ0。detailsは開く。本番FAQはすでにその扉だった。'
pubDate: '2026-08-15'
heroImage: '../../../assets/blog/hidden-until-found-find-fragment-accordion-2026/hero.png'
tags:
  - HTML
  - CSS
  - SEO
  - アクセシビリティ
  - Web標準
faq:
  - question: 'CSSのmax-height:0でもテキストフラグメントは届きますか。'
    answer: 'このChromiumでは届いた。scrollYは6083まで下がった。ただしアコーディオンのdata-openは"0"のままで、箱の高さは0、elementFromPointはBODYを返した。到達と開示は別の仕事だった。'
  - question: 'hidden=until-foundを足せば、検索がFAQの中までリンクしますか。'
    answer: 'Chromeの文書は、検索が開示されたフラグメントへスクロールするリンクを作ると書いている。こちらでは検索結果もAI回答も見ていない。ベンダーの主張として読む。順位の約束でもない。'
  - question: '閉じたdetailsの答えはインデックスされますか。'
    answer: '測っていない。閉じた答えはinnerTextには無く、textContentとwindow.findにはあった。ブラウザのAPIであって、クローラーのログではない。'
  - question: 'window.findはCmd+Fと同じですか。'
    answer: '同じとは書いていない。WHATWGはwindow.findを未規定とし、Issue #3539で追跡している。本番のページ内検索UIは押していない。'
relatedPosts:
  - slug: text-fragment-citation-deep-link-audit-2026
    score: 0.91
    reason:
      ko: 그 글은 인용 한 줄이 프로즈와 pre에서 도착하는지를 쟀다. 이번에는 그 문장이 닫힌 디스클로저 안에 있을 때 문이 열리는지를 잰다.
      ja: あちらは引用の一文が散文とpreで届くかを測った。こちらはその文が閉じたdisclosureの中にいるとき、扉が開くかを測る。
      en: That post measured whether a cited sentence arrived in prose versus pre. This one measures whether the door opens when that sentence sits in a closed disclosure.
      zh: 那篇量的是引用的一句在散文和 pre 里能不能到达。这篇量的是那句话待在关上的 disclosure 里时，门会不会开。
  - slug: content-visibility-auto-render-cost-measure-2026
    score: 0.83
    reason:
      ko: "그쪽은 content-visibility: auto가 레이아웃 비용을 깎는 이야기였다. 오늘은 같은 속성 이름에 hidden이 붙지 않으면 find도 hash도 죽은 주소가 되는 쪽을 잰다."
      ja: "あちらは content-visibility: auto がレイアウトのコストを削る話だった。今日は同じプロパティ名に hidden が付かないと、find も hash も死んだ住所になる側を測る。"
      en: "That one measured how content-visibility: auto cuts layout cost. This one measures the same property name with no hidden attribute: find and hash both stay dead addresses."
      zh: "那篇量的是 content-visibility: auto 怎么砍布局成本。这篇量的是同一个属性名、没有 hidden 时，find 和 hash 都是死地址。"
  - slug: faqpage-deprecation-ai-citation-2026
    score: 0.68
    reason:
      ko: FAQPage 마크업이 리치 결과에서 끝난 이야기를 그 글이 잡았다. 오늘은 그 FAQ의 닫힌 답이 브라우저에서 열릴 수 있는 주소인지를 잰다. 리치 결과는 다시 돌리지 않았다.
      ja: FAQPage のマークアップがリッチリザルトで終わった話はあちらにある。今日はそのFAQの閉じた答えが、ブラウザで開く住所かどうかを測る。リッチリザルトは回していない。
      en: That post caught FAQPage markup after the rich result ended. This one measures whether a closed FAQ answer is an address the browser can open. No rich-result re-run.
      zh: 那篇记下了 FAQPage 标记在富结果里收场。这篇量的是关上的 FAQ 答案在浏览器里是不是还能打开的地址。富结果没再跑。
  - slug: modal-focus-escape-inert-measure-2026
    score: 0.75
    reason:
      ko: inert를 모달 포커스용으로 잰 글이다. 오늘은 그 같은 속성이 페이지 안 검색과 텍스트 프래그먼트에서 무시되는 쪽을 본다.
      ja: inert をモーダルのフォーカス用に測った記事だ。今日はその同じ属性が、window.find とテキストフラグメントから無視される側を見る。
      en: That post measured inert for modal focus. This one watches the same attribute get ignored by find-in-page and by text fragments.
      zh: 那篇把 inert 当模态焦点来测。这篇看同一个属性在页内查找和文本片段里被忽略的那一面。
  - slug: content-on-hover-focus-1413-tooltip-2026
    score: 0.61
    reason:
      ko: 호버로 열린 콘텐츠가 키보드로 닫히는지를 잰 글이다. 닫혀 있는 답을 텍스트 주소로 다시 여는 문제는 이웃이지만 같은 문은 아니다.
      ja: ホバーで開いた中身をキーボードで閉じられるかを測った記事だ。閉じた答えをテキストの住所で開き直す問題は隣だが、同じ扉ではない。
      en: That one measured whether hover content can be dismissed from the keyboard. Reopening a closed answer from a text address is a neighbor, not the same door.
      zh: 那篇量的是悬停打开的内容能不能用键盘关掉。用文本地址重新打开关上的答案，是隔壁，不是同一扇门。
---

`#tf-css-maxh` を押した。飛び先は `#:~:text=TOKENCSSMAXH`。scrollY は 6083 まで跳ねた。アコーディオンの `data-open` はまだ `"0"`。箱の `getBoundingClientRect` の高さは 0。中の段落は高さ 18、y 399.7。`elementFromPoint(640, 409)` が返したのはその文ではなく BODY だった。

ページはクリップまでスクロールした。バイトはそこにあった。絵は出ていない。

マスごとに違う TOKEN 文を入れた。隠し方は17。ヘッドレス Chromium 143.0.7499.4、Playwright 1.57.0、Node 22.22、ビューポート 1280×800。静的サーバは `/tmp`。クリックのあと 200ms 待って、段落の矩形とビューポートを見比べた。

「隠す」はスイッチ一つだと思っていた。違った。

![フラグメントは scrollY 6083 まで跳ね、アコーディオンの高さは 0 のまま](../../../assets/blog/hidden-until-found-find-fragment-accordion-2026/hero.png)

## 祖先を開く手続きはdetailsにしか走らない

閉じた `<details>` の中に、同じ型のトークンを置いた。`#tf-details-closed` をクリックする。`toggle` イベントが一つ出た。`open` が true にひっくり返る。scrollY は 4907。段落の高さ 18、画面の中。祖先を開く手続きが走った。

CSS の `max-height: 0` には、その手続きが来なかった。フラグメントは「届いた」。箱は閉じたまま。

Chrome の文書。[Making collapsed content accessible with hidden=until-found](https://developer.chrome.com/docs/css-ui/hidden-until-found)。

> Collapsing content sections, sometimes described as an accordion, are a common UI pattern. However, content hidden in the collapsed sections becomes impossible to search using a find-in-page search. Also, it isn't possible to link to text fragments inside collapsed regions.

仕様側の手続きは、アコーディオン一般ではなく、二つのフックにしか書いてない。[Interaction with details and hidden=until-found](https://html.spec.whatwg.org/multipage/interaction.html#interaction-with-details-and-hidden=until-found)。

> When find-in-page begins searching for matches, all details elements in the page which do not have their open attribute set should have the skipped contents of their second slot become accessible, without modifying the open attribute, in order to make find-in-page able to search through it. Similarly, all HTML elements with the hidden attribute in the Hidden Until Found state should have their skipped contents become accessible without modifying the hidden attribute in order to make find-in-page able to search through them.

`max-height: 0` は、この文のどちらにも入っていない。find は true。アクセシビリティ名にも TOKEN は残っていた。フラグメントはスクロールした。`elementFromPoint` は BODY。到着は開示ではない。

## 飛ぶ前からfindは閉じた答えを持っていた

本番の FAQ を見た。対象は `/ko/blog/ko/text-fragment-citation-deep-link-audit-2026/`。HTTP は 200。`details.faq-item` は 4 つ。コンポーネントが `open={index === 0}` なので、先頭だけ開いている。1〜3 は閉じたまま。

閉じた答えの文は「코드 블록 자체를 인용 대상으로 만들기는 어렵습니다」。飛ぶ前、`document.body.innerText` には無かった。`textContent` にはあった。`window.find` は true を返した。

`#:~:text=` をその文に向けて直接飛ばす。二つ目の details が開いた。`hitOpen: true`。scrollY 8752。開いた details の `getBoundingClientRect.top` は 373。

このサイトの FAQ は、仕様が開ける扉をすでに使っていた。`FAQ.astro` のマークアップは `<details class="faq-item">`。[先の計測](/ja/blog/ja/text-fragment-citation-deep-link-audit-2026/) は散文と `<pre>` への到達だった。今日はその次の扉。文が閉じた details の中にいる場合。

`hidden="until-found"` を本番 FAQ に足して出し直してはいない。見たのは、いま乗っている `<details>` だけ。

閉じた答えが `textContent` にあることは、インデックスの証明ではない。Googlebot は回していない。リッチリザルトも Schema 検証も回していない。[FAQPage のマークアップがリッチリザルトで終わった話](/ja/blog/ja/faqpage-deprecation-ai-citation-2026/) は別の仕事のまま置いてある。

## hiddenの二つの計算結果

フィクスチャの `#box-until` に `hidden="until-found"` を付けた。計算値は `display: block` と `content-visibility: hidden`。コンテナの箱は 0×1230。子の段落は高さ 18 を返した。`innerText` は false。`window.find` は true。

`#tf-until` をクリックする。`beforematch` が `#box-until` で一度出た。`hidden` 属性は消えていた。scrollY 4352。画面の中。

ただの `hidden`、`hidden="hidden"`、著者の `display: none` は一つの家族。`window.find` は false。フラグメントも hash も 0。既定の `hidden` はアコーディオンの家族ではない。

計算値は UA ルールと揃っていた。`hidden=""` / `hidden="hidden"` の `display` は `none`。[Hidden elements](https://html.spec.whatwg.org/multipage/rendering.html#hidden-elements)。

```css
[hidden]:not([hidden=until-found i]):not(embed) {
  display: none;
}

[hidden=until-found i]:not(embed) {
  content-visibility: hidden;
}
```

`hidden="until-found"` のノードで、`HTMLElement.hidden` の IDL ゲッタが返したのは boolean の true ではなく、文字列 `"until-found"`。Chromium 143 では `'onbeforematch' in HTMLElement.prototype` が true。

WHATWG の [hidden 属性](https://html.spec.whatwg.org/multipage/interaction.html#the-hidden-attribute)。

> Will not be rendered, but content inside will be accessible to find-in-page and fragment navigation.

[同じ節](https://html.spec.whatwg.org/multipage/interaction.html#the-hidden-attribute) の続き。

> Web browsers will use 'content-visibility: hidden' instead of 'display: none' when the hidden attribute is in the Hidden Until Found state, as specified in the Rendering section.

Chrome の文書。[Making collapsed content accessible with hidden=until-found](https://developer.chrome.com/docs/css-ui/hidden-until-found)。

> hidden=until-found applies the content-visibility:hidden CSS property instead of the display:none property that the regular hidden attribute applies.

タブのパネルを `hidden` で隠すな、とも仕様は書く。

> The hidden attribute must not be used to hide content that could legitimately be shown in another presentation. For example, it is incorrect to use hidden to hide panels in a tabbed dialog, because the tabbed interface is merely a kind of overflow presentation — one could equally well just show all the form controls in one big page with a scrollbar.

出典は同じ [hidden 属性](https://html.spec.whatwg.org/multipage/interaction.html#the-hidden-attribute)。

## paddingが残す40pxの枠

`#box-until` は、padding 無しだと高さ 0、幅 1230。子は 18 を返す。Chrome が警告していた余り寸法が、そのまま出た。

`#box-until-box` に margin 8、灰色の border 4、padding 16 を足した。`hidden="until-found"` のまま `getBoundingClientRect` は 1214×40。中身の無い枠。フラグメントのあと `hidden` は剥がれ、箱は 40 から 90 へ伸びた。`beforematch` は 1。この 40→90 は、このフィクスチャの余白の合計であって、定数ではない。

出典は [Making collapsed content accessible with hidden=until-found](https://developer.chrome.com/docs/css-ui/hidden-until-found)。

> Some layout APIs such as getBoundingClientRect will report that the hidden content inside the hidden=until-found element takes up space and has a position in the page.

> Child nodes of the hidden=until-found element won't be rendered, but the hidden=until-found element itself will still have a box. This means that CSS properties such as border and explicit size will still affect the rendering.

仕様が先に置いている罠を、そのまま踏んだ。`hidden="until-found" style="display:none"`。`#box-until-none`。`window.find` は false。テキストフラグメントのクリックでは属性は残った。`beforematch` は 0。scrollY は 0。`#p-until-none` への hash では `beforematch` が一度走り、`hidden` は剥がれた。残りは著者の `display: none`。段落の高さは 0。scrollY は 0 のまま。ブラウザは属性に従ったあと、スタイルシートに負けた。

`hidden="until-found" style="display:inline"` は反対側だった。クリック前から文は `innerText` にあり、アクセシビリティ名の一覧にも乗っていた。フラグメントは `hidden="until-found"` を残したままスクロールした。scrollY 4729。hash は `hidden` を剥がした。レイアウト containment はすでに壊れていたので、「隠れている」は嘘だった。

[hidden 属性](https://html.spec.whatwg.org/multipage/interaction.html#the-hidden-attribute)。

> The element needs to be affected by layout containment in order to be revealed by find-in-page. This means that if the element in the Hidden Until Found state has a 'display' value of 'none', 'contents', or 'inline', then the element will not be revealed by find-in-page.

## 属性のないcontent-visibilityは死んだ住所

著者 CSS で `content-visibility: hidden` だけを付けた。属性は無し。`#box-cv-hidden`。`window.find` は false。フラグメントは届かない。hash も scrollY 0。

UA が `until-found` に使うのと同じプロパティ名。祖先開示の手続きが見るのは属性と `<details>` だけで、プロパティ単体は死んだ住所だった。

[content-visibility: auto で強制レイアウトを削った回](/ja/blog/ja/content-visibility-auto-render-cost-measure-2026/) は、見える側のコストの話だった。今日のマスは、同じ名前を隠しに使った側。フックが無い。

コンソールに残した確認はこれだけだ。

```js
const el = document.querySelector('[hidden="until-found"]')
getComputedStyle(el).display
getComputedStyle(el).contentVisibility
el.getBoundingClientRect()
el.firstElementChild && el.firstElementChild.getBoundingClientRect()
```

## findが無視するもの、名前が消えるもの

見える段落に `inert` を付けた。`innerText` は true。描画されている。箱は 18×1230。`window.find` は false。テキストフラグメントの scrollY は 0。`#p-inert` への hash は着いた。scrollY 6085。`window.find` と id-hash は同じ扉ではない。

[Inert subtrees](https://html.spec.whatwg.org/multipage/interaction.html#inert-subtrees)。

> The user agent should ignore the node for the purposes of find-in-page.

`inert` をモーダルのフォーカス用に測ったのは[別の回](/ja/blog/ja/modal-focus-escape-inert-measure-2026/)。

`visibility: hidden` も、find とフラグメントは拒んで hash は受けた側に入った。

`aria-hidden="true"` を付けた見える段落は、描画されていた。`innerText` は true。`window.find` は true。フラグメントは着いた。scrollY 5542。CDP の `Accessibility.getFullAXTree` が出した名前に、TOKENARIAHIDDEN は無かった。find は、アクセシビリティツリーが名前にしない文を指せた。

WAI-ARIA 1.2 の [aria-hidden](https://www.w3.org/TR/wai-aria-1.2/#aria-hidden)。

> Indicates whether the element is exposed to an accessibility API.

[同じ節](https://www.w3.org/TR/wai-aria-1.2/#aria-hidden) の続き。

> Authors MAY, with caution, use aria-hidden to hide visibly rendered content from assistive technologies only if the act of hiding this content is intended to improve the experience for users of assistive technologies by removing redundant or extraneous content.

名前が無い、はこのダンプに TOKEN を含む name 値が無かった、という意味だ。スクリーンリーダーは回していない。

スパムポリシーは、アコーディオンやタブの出し入れを隠しテキスト悪用の側に置いていない。[Hidden text and links](https://developers.google.com/search/docs/essentials/spam-policies#hidden-text-and-links) の例外の行。

> Accordion or tabbed content that toggle between hiding and showing additional content

別の行。

> Text that's only accessible to screen readers and is intended to improve the experience for those using screen readers

ポリシーの文であって、順位の約束ではない。構造化データもフラグメントも、リッチリザルトや AI 引用を保証しない。

## 17マスを一度に置いた

呼び出しのあいだに selection は消した。10 / 17 が `window.find` で true。フラグメントの `inView` も 10 / 17。hash は 12 / 17。

![17マスの find・フラグメント・hash・AX名](../../../assets/blog/hidden-until-found-find-fragment-accordion-2026/hide-matrix.png)

| マス | find | フラグメント | hash | AX名にTOKEN |
| --- | --- | --- | --- | --- |
| visible | あり | あり | あり | あり |
| hidden="" | なし | なし | なし | なし |
| hidden="hidden" | なし | なし | なし | — |
| until-found | あり | あり | あり | なし |
| until-found+box | あり | あり | あり | — |
| until-found+display:none | なし | なし | なし | — |
| until-found+display:inline | あり | あり | あり | あり |
| details 閉じ | あり | あり | あり | なし |
| details 開き | あり | あり | あり | あり |
| display:none | なし | なし | なし | なし |
| visibility:hidden | なし | なし | あり | なし |
| content-visibility:hidden CSS | なし | なし | なし | なし |
| aria-hidden | あり | あり | あり | なし |
| inert | なし | なし | あり | なし |
| opacity:0 | あり | あり | あり | あり |
| sr-only clip | あり | あり | あり | あり |
| max-height:0 | あり | あり | あり | あり |

hash だけ残ったのが `visibility: hidden` と `inert`。名前に TOKEN があったのは 6 / 17。表の「—」は、名前の有無を取り切っていないマス。

バイトは少なくとも五つの仕事に割れていた。描かない (`display: none` / ただの `hidden`)。スキップするが探せる (`hidden=until-found` → UA の `content-visibility: hidden`)。クリップするがツリーに残る (`max-height: 0`)。支援技術の名前から外す (`aria-hidden`)。find から外す (`inert`)。

## 押していないCmd+F

本番のページ内検索 UI は押していない。使ったのは `window.find()` と、`#:~:text=` リンクのクリック。[Find-in-page](https://html.spec.whatwg.org/multipage/interaction.html#find-in-page)。

> Issue #3539 tracks standardizing how find-in-page underlies the currently-unspecified window.find() API.

Firefox も WebKit も回していない。`hidden=until-found` の対応を、そちらのエンジンについて主張しない。Search Console にも入っていない。検索結果や AI 回答がテキストフラグメント付きのリンクを出すところも見ていない。

Chrome の文書は、検索がそのリンクを作ると書く。

> In addition to allowing find-in-page search on hidden regions, this feature will allow this hidden content to be accessible to search engines. Google Search will even form links that scroll to the revealed fragment.

出典: [Making collapsed content accessible with hidden=until-found](https://developer.chrome.com/docs/css-ui/hidden-until-found)

こちらで再観測していない。ベンダーの主張として置く。「検索がもう FAQ の中までリンクしている」とは書かない。

フィクスチャ側のテキストフラグメントは、同一文書のアクティベーションが要った。直接の `#:~:text=` 遷移でも、この Chromium では until-found と本番の閉じた FAQ は開いた。この UA、このビルド。クローラーではない。

until-found だけを隠し方にして出す前に、手元の UA で見た一行。

```js
if (!('onbeforematch' in HTMLElement.prototype)) {
  // このUAでは閉じた中身は閉じたまま
}
```

本番 FAQ をコンソールで突いた手順。

```js
[...document.querySelectorAll('details.faq-item')].map((d, i) => ({
  i,
  open: d.open,
  t: d.innerText.slice(0, 60),
}))
document.body.innerText.includes('코드 블록 자체를 인용 대상으로 만들기는 어렵습니다')
document.body.textContent.includes('코드 블록 자체를 인용 대상으로 만들기는 어렵습니다')
window.find('코드 블록 자체를 인용 대상으로 만들기는 어렵습니다')
```

どの隠し方をチームが出せばよいかは、この17マスでは証明できない。証明できたのは、2026-08-15 のこの Chromium が、どのマスを find し、名前に載せ、hash でスクロールし、フラグメントで開いたかだ。JSON は `/tmp` のラボディレクトリに置いたままで、リポジトリには入れてない。

閉じた答えにフラグメントが届くかを測る仕事は、自分の実務だ。連絡先はプロフィールにある。

---

*出典: WHATWG [HTML Standard, The hidden attribute](https://html.spec.whatwg.org/multipage/interaction.html#the-hidden-attribute)・[Interaction with details and hidden=until-found](https://html.spec.whatwg.org/multipage/interaction.html#interaction-with-details-and-hidden=until-found)・[Inert subtrees](https://html.spec.whatwg.org/multipage/interaction.html#inert-subtrees)・[Find-in-page](https://html.spec.whatwg.org/multipage/interaction.html#find-in-page)・[Hidden elements](https://html.spec.whatwg.org/multipage/rendering.html#hidden-elements)、Chrome for Developers [Making collapsed content accessible with hidden=until-found](https://developer.chrome.com/docs/css-ui/hidden-until-found)、Google Search Central [Spam Policies, Hidden text and links](https://developers.google.com/search/docs/essentials/spam-policies#hidden-text-and-links)、W3C [WAI-ARIA 1.2, aria-hidden](https://www.w3.org/TR/wai-aria-1.2/#aria-hidden)（いずれも公式）。本文の英文ブロック引用は公式ページの文で、引用のそばに原文リンクを置いた。計測環境: 一時サンドボックスの隠し方17マス、ヘッドレス Chromium 143.0.7499.4、Playwright 1.57.0、Node 22.22、ビューポート 1280×800、ローカル静的サーバ、2026年8月15日計測。本番確認はテキストフラグメント記事1本、FAQ 4件。フィクスチャ JSON はリポジトリ外。Gecko / WebKit は未計測。Cmd+F は未使用。クローラーログは無い。順位と引用は保証しない。*
