---
title: 'アコーディオンを隠す17通りと、テキストフラグメントが白紙に跳ぶ条件'
description: 'アコーディオンの隠し方17通りをChromiumに通し、window.find、テキストフラグメント、アクセシビリティツリーでの到達と開示を測った。max-height:0は白紙のまま6083px跳び、hidden="until-found"はUAスタイルシートによって開かれた。到着と開示が別の仕事である理由を実測で整理する。'
pubDate: '2026-08-15'
heroImage: '../../../assets/blog/hidden-until-found-find-fragment-accordion-2026/hero.png'
tags:
  - Web開発
  - HTML
  - アクセシビリティ
  - ブラウザ仕様
  - CSS
faq:
  - question: 'hidden="until-found" を使えばどんなアコーディオンでも自動で開きますか。'
    answer: '開きません。レイアウト包含の影響が必要で、著者が display: none や display: inline を指定すると開示されません。Chromium以外や非対応ブラウザでは閉じたままなので、onbeforematch in HTMLElement.prototype を判定します。'
  - question: 'max-height: 0 で隠したアコーディオンにテキストフラグメントで飛ぶと何が起きますか。'
    answer: 'スクロール位置は座標まで移動しますが、開閉状態を示す属性や外枠の高さ（0px）は変わりません。開くイベントも発火せず、画面には閉じた外枠や白紙の領域だけが残ります。'
  - question: 'hidden="until-found" は display: none と何が違いますか。'
    answer: '通常の hidden 属性は display: none、hidden="until-found" はUAスタイルシートで content-visibility: hidden になります。描画を省略しつつ検索・フラグメントの対象に残り、一致時に beforematch とともに属性が除去されます。'
  - question: '<details> 要素を使っている場合は hidden="until-found" への移行が必要ですか。'
    answer: '移行は必須ではありません。閉じた <details> は検索・フラグメント遷移の対象で、一致時にブラウザが open 属性を付けて展開します。自サイトでも同様に展開しました。'
relatedPosts:
  - slug: text-fragment-citation-deep-link-audit-2026
    score: 0.90
    reason:
      ko: 그 글은 인용 링크가 도달하지 못하는 마크업 경계를 다뤘고, 이 글은 도달한 뒤 열리지 않는 펼침 메뉴 경계를 다룬다.
      ja: あちらは引用リンクが到達できないマークアップ境界を扱い、こちらは到達したあとに開かない開閉境界を扱う。
      en: That post covered markup boundaries where citation links fail to arrive. This one covers disclosure boundaries where links arrive but fail to open.
      zh: 那篇讲的是引用链接无法到达的标记边界，这篇讲的是到达后打不开的折叠边界。
  - slug: content-visibility-auto-render-cost-measure-2026
    score: 0.83
    reason:
      ko: content-visibility가 렌더링 비용을 건너뛰는 방식을 다룬 글이다. until-found는 같은 속성을 검색 가능성과 연결한다.
      ja: content-visibilityが描画コストを省く仕組みを扱った記事。until-foundは同じプロパティを検索可能性と繋ぐ。
      en: That post measured how content-visibility skips rendering cost. until-found ties that same property to searchability.
      zh: 那篇测了 content-visibility 如何跳过渲染开销。until-found 把同一个属性与可搜索性连在了一起。
  - slug: modal-focus-escape-inert-measure-2026
    score: 0.74
    reason:
      ko: inert가 포커스를 가두는 방식을 다룬 글이다. 이번 측정에서는 inert가 페이지 내 검색과 프래그먼트를 거부하는 동작을 확인했다.
      ja: inertがフォーカスを閉じ込める仕組みを扱った記事。今回の計測ではinertがページ内検索とフラグメントを拒絶する動作を確認した。
      en: That post covered how inert traps focus. This measurement confirms how inert rejects find-in-page and fragments.
      zh: 那篇讲了 inert 如何锁住焦点。这次测量确认了 inert 拒绝页面内查找和片段跳转的行为。
  - slug: faqpage-deprecation-ai-citation-2026
    score: 0.72
    reason:
      ko: FAQPage 구조화 데이터가 사라진 뒤 본문 접근성이 왜 중요해졌는지 다뤘다. 아코디언 안에 닫힌 텍스트가 바로 그 본문이다.
      ja: FAQPage構造化データの廃止後になぜ本文の到達性が重要になったかを扱った記事。アコーディオンの中に閉じたテキストがその本文にあたる。
      en: That post asked why body text accessibility matters after FAQPage deprecation. Text tucked inside accordions is that very body text.
      zh: 那篇讲了 FAQPage 结构化数据退场后正文可达性为何重要。折叠在手风琴里的文本正是这些正文。
  - slug: content-on-hover-focus-1413-tooltip-2026
    score: 0.63
    reason:
      ko: 호버와 포커스로 나타나는 콘텐츠의 이탈을 다뤘다. 닫힌 영역이 사용자의 의도와 어긋나게 닫혀 있는 구조를 공유한다.
      ja: ホバーやフォーカスで現れるコンテンツの消失を扱った記事。閉じた領域が利用者の意図と食い違って閉じ続ける構造を共有する。
      en: That post covered disappearing hover/focus content. Both share the failure mode where hidden areas stay closed against user intent.
      zh: 那篇讲了悬停和聚焦时出现的内容如何失控。两篇都涉及隐藏区域违背用户意图保持关闭的失效模式。
---

`#tf-css-maxh` をクリックした。リンク先は `#:~:text=TOKENCSSMAXH`。`window.scrollY` は 6083 まで跳んだが、アコーディオンの `data-open="0"` は動かない。外枠の高さは 0px、内側の段落は高さ 18px、y座標 399.7 だった。段落の中央で `elementFromPoint(640, 409)` を叩くと、返ったのは文ではなく `BODY`。バイト列はあるが描画はなく、ページは切り取られた不可視の領域へスクロールしていた。

![アコーディオンの隠し方17通りとテキストフラグメントの到達](../../../assets/blog/hidden-until-found-find-fragment-accordion-2026/hero.png)

## 到着と開示は別の仕事である

私は `max-height: 0` が「検索不能な領域」に該当すると思い込んでいた。だが実測値は違った。`window.find('TOKENCSSMAXH')` は `true`、アクセシビリティツリーにも名前があり、フラグメントの探索も一致した。欠けていたのは検索可能性ではなく、開示（reveal）の一手だった。

「隠す」は一つのスイッチではない。内部処理では、完全除外、描画省略、領域の切り抜き、支援技術ツリーからの除外、対話と検索の無効化という五つの仕事に分かれる。

到達は対象の座標を特定してスクロールを完了すること、開示は隠された要素を表示状態へ戻すこと。この二つは別の処理だ。

## 17通りの隠し方をChromiumに通した

推測で議論するのをやめ、ローカルサーバーにHTMLフィクスチャを作った。17通りの隠し方を並べ、各領域に固有のトークンを置いた。

環境は Node 22.22、Playwright 1.57.0、ヘッドレスChromium 143.0.7499.4。画面は 1280×800 に固定した。

各セルで、読み込み直後の `window.find(TOKEN)`、テキストフラグメントとIDハッシュをクリックした200ミリ秒後の段落の位置、CDPの `Accessibility.getFullAXTree` 出力におけるトークンの有無を調べた。

![17通りの隠し方における検索、フラグメント到達、IDハッシュ到達、アクセシビリティツリーの判定行列](../../../assets/blog/hidden-until-found-find-fragment-accordion-2026/hide-matrix.png)

| 隠し方 | `window.find()` | テキストフラグメント到達 | IDハッシュ到達 | AXツリー名（CDP） |
| --- | --- | --- | --- | --- |
| visible（表示中） | true | true | true | あり |
| `hidden=""`（真偽値hidden） | false | false | false | なし |
| `hidden="hidden"` | false | false | false | — |
| `hidden="until-found"` | true | true | true | なし |
| until-found + 余白枠（padding/border） | true | true | true | — |
| until-found + `display:none` | false | false | false | — |
| until-found + `display:inline` | true | true | true | あり |
| `<details>` 閉鎖 | true | true | true | なし |
| `<details>` 開放 | true | true | true | あり |
| 著者 `display:none` | false | false | false | なし |
| `visibility:hidden` | false | false | true | なし |
| 著者 `content-visibility:hidden` | false | false | false | なし |
| `aria-hidden="true"` | true | true | true | なし |
| `inert` | false | false | true | なし |
| `opacity:0` | true | true | true | あり |
| sr-only clip（クリップ隠し） | true | true | true | あり |
| `max-height:0` | true | true | true | あり |

`window.find()` が `true` を返したのは 17 セル中 10 セル。テキストフラグメントで到達したのも同じ 10 セルで、失敗したのは表の 7 種類だ。

IDハッシュは 12 セルで成功した。`visibility:hidden` と `inert` はフラグメントを拒絶するが、ハッシュは受け入れる。検索とフラグメントは同じ門ではない。

## UAスタイルシートが適用するcontent-visibility

WHATWGのレンダリング仕様にあるUAスタイルシートの規則を、Chromium 143 の `#box-until`（`hidden="until-found"` の要素）で確かめた。

`display` は `block` のまま、`content-visibility` だけが `hidden` だった。余白のない `#box-until` の `getBoundingClientRect()` は高さ 0px、幅 1230pxの `0×1230`、内側の段落は高さ 18pxを返した。

この状態で `innerText` にトークンはなく（`false`）、`window.find()` は `true` を返した。

フラグメントリンク `#tf-until` をクリックすると `window.scrollY` は 4352 に移動した。`#box-until` 上で `beforematch` が 1 回発火し、`hidden` 属性が消え、段落の `inView` は `true` になった。

もう一つ予想が外れた。JavaScriptのプロパティ `el.hidden` は真偽値の `true` ではなく、文字列 `"until-found"` を返した。属性値がそのまま返されている。

## 著者のCSSがブラウザの親切を押し潰した境界

`hidden="until-found"` を書けばすべて解決するわけではない。著者のスタイルシートが標準動作を破壊する場面を二つ観測した。WHATWGの[HTML仕様](https://html.spec.whatwg.org/multipage/interaction.html#the-hidden-attribute)は、レイアウト包含の影響を受けない `display:none`、`contents`、`inline` の要素は検索時に開示されないと定めている。

一つ目は `#box-until-none`（`hidden="until-found"` に `style="display:none"` を重ねた要素）だ。`window.find()` は `false`、フラグメントをクリックしても `beforematch` は発火せず、スクロール位置は 0 のままだった。

IDハッシュでは `beforematch` が発火して `hidden` 属性が外れた。しかし著者の `display: none` は残り、段落の高さとスクロール位置は 0 のまま。ブラウザは属性を取り除いたが、スタイルシートに敗北した。

二つ目は余白と枠線だ。margin 8px、border 4px、padding 16pxの `#box-until-box` は、折りたたみ中の `getBoundingClientRect()` が `1214×40`。中身は描画されず、外枠と内余白だけが残る。フラグメントリンクのあと `beforematch` が発火して属性が外れ、ボックスは `1214×90` へ広がった。この変化はフィクスチャの余白等の合計で、普遍的な定数ではない。

`hidden="until-found"` を使うなら、閉じている最中の境界線やパディングをゼロにするか、コンテナ自体の余白設計を見直さなければならない。

## 自サイトのFAQで4つの回答を検索した

本番の jangwook.net の技術ブログ記事 `https://jangwook.net/ko/blog/ko/text-fragment-citation-deep-link-audit-2026/` を開いた。4 つの `details.faq-item` は `FAQ.astro` の `open={index === 0}` により先頭だけが開き、1〜3 は閉じていた。

閉じていた 2 番目の回答文「코드 블록 자체를 인용 대상으로 만들기는 어렵습니다」は、遷移前の `innerText` にはなく（`false`）、`textContent` にはあり、`window.find()` は `true` を返した。

その文へテキストフラグメントで遷移すると、`window.scrollY` は 8752 へ跳び、2 番目の `<details>` は自動展開した。`hitOpen` は `true`、展開後の `getBoundingClientRect().top` は 373 だった。

自サイトのアコーディオンをわざわざ `hidden="until-found"` に書き換える必要はなかった。標準の `<details>` を使っていれば、ブラウザは最初から開示の手順を知っている。

## 測らなかったことと、残すべき分岐

今回の数字は、2026年8月15日に手元のChromium 143.0.7499.4、Playwright 1.57.0で取得した記録にすぎない。FirefoxやSafariは計測しておらず、`hidden="until-found"` の対応状況について主張しない。

`window.find()` は実際のページ内検索UIではなく、WHATWGの Issue #3539 に残る代替の計測値だ。CDPのアクセシビリティツリーに名前がないことはスクリーンリーダーの証明ではなく、GooglebotやAIクローラーも測定していない。

テスト用フィクスチャのJSONデータは `/tmp` 配下にのみ存在し、リポジトリにはコミットしていない。

[Chrome for Developersの解説文書](https://developer.chrome.com/docs/css-ui/hidden-until-found)は、Google検索が開示されたフラグメントへのリンクを形成すると述べる。魅力的な約束だが、今回の検証では生成を観測していない。ベンダーの主張と、手元で動くバイト列の挙動は分けて管理すべきだ。

自作のコンポーネントで `hidden="until-found"` を本番採用するなら、対応確認が要る。

```javascript
if (!('onbeforematch' in HTMLElement.prototype)) {
  // beforematch に非対応のブラウザでは、閉じたコンテンツが永久に開かないリスクがある
}
```

この判定なしに `hidden="until-found"` だけで組むと、非対応環境では検索からもフラグメントからも閉ざされたままになる。アニメーションやCSSの都合で隠す前に、まず `<details>` で組めないかを考える。それができないUIでのみ `hidden="until-found"` を選び、`display` や枠線の余白で動作を潰していないかを実測する。到着した読者に白紙を見せないための境界線は、そこにある。
