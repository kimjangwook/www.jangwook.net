---
title: '同じページを逆向きに辿ったら違反16件: 固定ヘッダーが飲み込むキーボードフォーカス'
description: '同じ6ページをTabで下りながら測ると WCAG 2.4.11 の違反は0件、Shift+Tabで上りながら測ると16件だった。ブラウザがフォーカス対象を画面内に入れる際の寄せ方が進行方向で変わるからだ。CSS一行で16件を0件にした実測記録。'
pubDate: '2026-08-04'
heroImage: '../../../assets/blog/focus-not-obscured-sticky-header-scroll-padding-2026/hero.png'
tags:
  - アクセシビリティ
  - WCAG
  - キーボード
  - CSS
  - ウェブ開発
faq:
  - question: 'axeやLighthouseで2.4.11を検出できますか。'
    answer: 'Dequeが公開しているaxeのルール一覧には、フォーカスが他のコンテンツに覆われているかを判定するルールがありません。WCAG 2.2で新設された基準のうち自動ルールが付いているのはターゲットサイズ(2.5.8)程度で、フォーカスの隠れは手動検査の側に残っています。ただし原理的に自動化できないわけではありません。スクロール状態でのヒットテストが必要なので静的DOM検査では判定できず、ブラウザを立ち上げれば済みます。'
  - question: 'scroll-padding-top の値はどう決めればいいですか。'
    answer: 'ヘッダーの実測高さに、フォーカスリングが収まる余白を足した値です。私のサイトのヘッダーはデスクトップ81px、モバイル82pxで、calc(5rem + 1rem) = 96pxにしました。ヘッダー高さをCSS変数にしてそれを参照すると、デザイン変更に追従します。スティッキーフッターがある場合は scroll-padding-bottom も併せて必要です。'
  - question: 'focusinを拾ってJavaScriptでスクロールを補正する方法ではだめですか。'
    answer: '動きはしますが順序が悪いです。ブラウザがスクロールを終えた後にもう一度スクロールする構造なので画面が跳ね、スムーススクロールと重なるとずれます。scroll-padding はブラウザが何を「画面内」と見なすかの定義そのものを変えるため、最初から正しい位置へスクロールします。計算もブラウザ側で済みます。'
  - question: 'アクセシビリティを直すと検索順位に効きますか。'
    answer: '私が測った範囲でその繋がりは確認できていませんし、主張する根拠もありません。2.4.11は適合性とユーザビリティの基準です。キーボードで操作する人が自分の居場所を目で確認できるようにするのが目的で、それ以上を約束するのは誇張になります。'
relatedPosts:
  - slug: wcag22-target-size-audit-2026
    score: 0.76
    reason:
      ko: 같은 WCAG 2.2 신설 기준을 다루지만 축이 다르다. 그쪽은 포인터가 닿을 크기, 이쪽은 그 크기가 헤더에 덮였는지다. 두 기준이 서로를 대신하지 못한다는 점이 두 글을 붙여 읽으면 분명해진다.
      ja: 同じWCAG 2.2の新規基準でも軸が違う。あちらはポインターが届く大きさ、こちらはその大きさがヘッダーに覆われていないか。二つの基準が互いを代替しないことが、並べて読むと見えてくる。
      en: Both cover criteria new in WCAG 2.2, but on different axes. That one is whether a target is big enough to hit; this one is whether that target stays visible under a header. Read together, they show why passing one says nothing about the other.
      zh: 两篇都讲 WCAG 2.2 新增的标准，但轴不同：那篇是指针能否点得到，这篇是点得到的东西有没有被吸顶头部盖住。并读就知道，过了一条并不代表另一条也过。
  - slug: modal-focus-escape-inert-measure-2026
    score: 0.72
    reason:
      ko: 모달에서 포커스가 새어 나가는 걸 재던 글이다. 이번 글은 포커스가 제자리에 있는데도 보이지 않는 경우를 잰다. 포커스 관리에는 "어디로 가는가"와 "간 곳이 보이는가"라는 두 문제가 따로 있다.
      ja: モーダルからフォーカスが漏れる挙動を測った記事。今回はフォーカスが正しい場所にあるのに見えないケースを測る。フォーカス管理には「どこへ行くか」と「行った先が見えるか」という別の問題がある。
      en: That one measured focus leaking out of a modal. This one measures focus sitting exactly where it should while being invisible. Managing focus is two separate problems, where it goes and whether you can see where it went.
      zh: 那篇测的是焦点从模态框漏出去。这篇测的是焦点明明在该在的位置，却看不见。焦点管理其实是两件事：去了哪里，以及去了之后看不看得见。
  - slug: axe-core-ci-a11y-jsdom-vs-browser-2026
    score: 0.68
    reason:
      ko: jsdom이 색상 대비를 판정 못 하는 이유를 파던 글이다. 포커스 가림은 그보다 한 칸 더 나간 경우다. 레이아웃뿐 아니라 스크롤 상태까지 필요하므로, 정적 DOM 검사기에는 애초에 규칙이 없다.
      ja: jsdomがコントラスト比を判定できない理由を追った記事。フォーカスの隠れはさらに一段先で、レイアウトだけでなくスクロール状態まで必要になる。だから静的DOM検査には最初からルールが無い。
      en: That post dug into why jsdom cannot judge color contrast. Focus occlusion sits one step further out. It needs scroll state, not just layout, which is why static DOM checkers have no rule for it at all.
      zh: 那篇追的是 jsdom 为何判不了对比度。焦点被遮挡还要更进一步，它需要的是滚动状态而不只是布局，所以静态 DOM 检查器里根本没有这条规则。
  - slug: wcag-em-2-sampling-vs-full-sweep-audit-2026
    score: 0.63
    reason:
      ko: 표본이 페이지 축에서 무엇을 놓치는지 셌던 글이다. 이번 글은 같은 페이지를 어느 방향으로 걷는지가 결과를 뒤집는다는 걸 보여준다. 커버리지에는 페이지 수 말고 다른 축이 있다.
      ja: 標本がページ軸で何を取り落とすかを数えた記事。今回は同じページをどちらの向きに歩くかで結果が反転することを示す。カバレッジにはページ数以外の軸がある。
      en: That audit counted what a sample misses along the page axis. This one shows the same pages flipping their verdict depending on which direction you walk them. Coverage has axes other than page count.
      zh: 那篇数的是抽样在页面这条轴上漏了什么。这篇则显示同样的页面，走的方向不同结论就反过来。覆盖率不止「页面数」这一条轴。
---

```text
2.4.11  AA      0    forward 1072 stops
2.4.11  AA     16    reverse 1069 stops
```

同じサイト、同じ6ページ、同じ判定ロジック。上の行はTabで下りながら測った結果で、下の行はShift+Tabで上りながら測った結果である。違うのはキーの向きだけだ。

ブラウザはフォーカスが画面外の要素へ移るとき、その要素を画面内に引き寄せる。どの位置に置くかは、どちら側から来たかで決まる。下へ進めば要素はビューポートの下端に付き、上へ戻れば上端に付く。そして私のサイトの上端には81ピクセルの固定ヘッダーが座っている。

## 「フォーカスリングが見えるか」とは別の基準である

フォーカス表示があるかどうかは古い基準だ。WCAG 2.2が新しく加えたのは、その表示が他のコンテンツに覆われていないかである。両者は別物だ。リングを3ピクセルで太く描いてコントラストを合わせても、そのリングがヘッダーの下にあるなら、利用者の画面では何も起きていない。

達成基準の原文を[W3C勧告](https://www.w3.org/TR/WCAG22/)(2024年12月12日版)からそのまま引く。

> When a user interface component receives keyboard focus, the component is not entirely hidden due to author-created content.

要は `entirely` である。このAA基準は「全部隠れたら不適合」であって、一部が隠れることは許している。全部見えていなければならないという要求はAAAの2.4.12として別にある。同じ文書の表現だ。

> When a user interface component receives keyboard focus, no part of the component is hidden by author-created content.

AAがなぜ半分の隠れを許すのかは、[解説文書](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html)が自ら述べている。

> In recognition of the complex responsive designs common today, this AA criterion allows for the component receiving focus to be partially obscured by other author-created content.

同じ文書は、何が主に覆うのかも名指しで書いている。

> Typical types of content that can overlap focused items are sticky footers, sticky headers, and non-modal dialogs.

ここから判断の分かれ目が二つ出てくる。ひとつは `author-created content` という限定だ。ブラウザのUIや利用者が入れた拡張が覆う分は、この基準の責任ではない。もうひとつは、利用者が自分で片付けられるコンテンツの例外である。

> Content opened by the user may obscure the component receiving focus. If the user can reveal the focused component without advancing the keyboard focus, the component with focus is not considered visually hidden due to author-created content.

利用者が開き、フォーカスを移さずに退けられるものは不適合ではない。固定ヘッダーはここに当てはまらない。利用者が開いたわけでもなく、退ける手段もない。

## 自動チェックのルール一覧にこの基準は無い

Dequeが公開しているaxeのルール一覧を見た。フォーカスが他のコンテンツに覆われているかを判定するルールは無い。WCAG 2.2で新設された基準のうち自動ルールが付いているのは、ターゲットサイズ(2.5.8)程度である。

自分のサイトでも同じだった。二日前にaxe-core 4.12.1でビルド成果物1,342枚を全数走査したとき、挙がった違反ルールはラベル、リスト構造、文書タイトル、言語属性の四種だけだった。フォーカスの隠れはその一覧に名前を載せていない。その全数走査が何を捕まえて何を捕まえなかったかは、[標本26枚と全数1,342枚を突き合わせた記録](/ja/blog/ja/wcag-em-2-sampling-vs-full-sweep-audit-2026/)に別途書いた。

私はこれを「自動化できない」とは読まない。ルールが無いのは、判定に必要な情報が静的DOMに無いからだ。要素がどこに描かれるのか、その上に何が重なるのか、スクロールがどこまで下りた状態なのか。レイアウトエンジンとヒットテストが要るという意味であり、それはブラウザを立ち上げれば解決する。だからルールを待つ代わりに測定を書いた。

## キーを本当に押し、フォーカス矩形を25点で突く

判定ロジックは短い。フォーカスされた要素のクライアント矩形をビューポートで切り取り、その中に5×5の格子で25点を打つ。各点で `document.elementFromPoint` を呼び、最前面の要素を確かめる。25点すべてが別の要素に取られたら全部隠れており、一部だけ取られたら部分的な隠れだ。

```js
const x0 = Math.max(0, r.left), y0 = Math.max(0, r.top);
const x1 = Math.min(innerWidth, r.right), y1 = Math.min(innerHeight, r.bottom);
let visible = 0, total = 0;
for (let i = 0; i < 5; i++) {
  for (let j = 0; j < 5; j++) {
    const x = x0 + (x1 - x0) * (i + 0.5) / 5;
    const y = y0 + (y1 - y0) * (j + 0.5) / 5;
    total++;
    const top = document.elementFromPoint(x, y);
    if (!top || top === el || el.contains(top) || top.contains(el)) { visible++; continue; }
    // 覆っている要素は、それ自身ではなく最も近い sticky/fixed の祖先に帰属させる。
    const key = anchored(top) || desc(top);
    blockers[key] = (blockers[key] || 0) + 1;
  }
}
```

祖先要素が取られた場合を隠れとして数えない条件が肝心だ。二行に折り返したインラインリンクは矩形が二行をまとめて包むので、行間の余白まで矩形の中に入る。その地点ではリンクの親が取られる。これを隠れに数えると、無事なリンクが片端から違反になる。

歩き方で二度つまずいた。最初の版はTabを押した回数をそのまま数えていた。Shift+Tabは先頭要素を過ぎると末尾要素へ戻るので、同じ要素を延々と測り直しており、2,141であるべき測定が4,149に膨らんだ。そこで検査前にフォーカス可能な全要素へ `data-fidx` の番号を振り、既に見た番号なら数えないよう直した。

二つめの方が痛い。当初は楽に `element.focus()` を呼んで巡回するつもりだった。その方法では何も挙がらない。Chromiumはスクリプトが呼んだ `focus()` に対して要素を画面中央へ置く。800ピクセルのビューポートで着地点はy=367だった。一方、実際のTabとShift+Tabは最も近い端へ寄せる。同じ要素がy=24に来る。不具合は後者でしか再現しない。

<strong>この不具合を探すスクリプトは、キーを本当に押さなければならない。</strong>`focus()` で巡回する監査ツールは、サイトがどうであれ0件と報告する。この一点が今回の測定で最も実務に効く結果だった。

## 向きを変えたら0件が16件になった

測定範囲はビルド成果物1,350枚のうち6ページ(ホーム、記事一覧、長い記事二本、自己紹介、問い合わせ)に、デスクトップ1280×800とモバイル390×844を掛けた12通りである。各通りでTabを一周、Shift+Tabを一周した。

```text
$ node scripts/audit-focus-obscured.mjs --path /ko/ --path /ko/blog/ ...
  pages           6 x viewports 2   (chromium 1.57)
  focus stops     2141   (forward 1072 / reverse 1069)
  2.4.11  AA      16   forward 0 / reverse 16
  2.4.12  AAA     199   forward 6 / reverse 193
  invisible focus 4
  AA blockers     {"header.site-header.sticky[sticky]":16}
```

AA違反16件を覆っていた要素は、16件すべてが同一だった。固定ヘッダーだ。他の候補は出なかった。

![フォーカスされたsummary要素が固定ヘッダーに完全に覆われた画面。下に回答テキストだけが見え、質問行とフォーカスリングは見えない](../../../assets/blog/focus-not-obscured-sticky-header-scroll-padding-2026/fully-obscured-summary.png)

上の画面が不適合の姿だ。ホームのFAQアコーディオンの `<summary>` がフォーカスを受け、矩形はy=0からy=72まで。ヘッダーはy=81まで覆う。25点のうち0点が生き残った。画面には回答テキストだけが残るので、キーボード利用者にはShift+Tabを押したのに何も起きなかったように見える。

隠れた要素の種類を数えると、カード見出しのリンクが9件で最も多い。ここで一つ、自分の首を絞めた話がある。三日前に私は、カード全体を `<a>` で包んでいたマークアップを、見出しだけをリンクにして `::after` のオーバーレイでクリック領域を広げる形に変えた。[被リンクのアンカーテキストが367文字まで伸びていた問題を直す作業](/ja/blog/ja/title-declaration-channels-anchor-text-audit-2026/)だった。結果としてリンクのフォーカス矩形は、カード全体の300ピクセル余りから見出し二行分の65ピクセルへ縮んだ。ヘッダーの81ピクセルより小さくなったのである。カード全体を包んでいた頃は、上端に寄せられても下半分は見えていた。アクセシビリティの指標を一つ直しながら、別の基準の不適合を作ったわけだ。

向きとビューポートで割るとこうなる。

| 区分 | フォーカス停止点 | 2.4.11 (AA) | 2.4.12 (AAA) |
|---|---|---|---|
| Tab (下へ) | 1,072 | 0 | 6 |
| Shift+Tab (上へ) | 1,069 | 16 | 193 |
| デスクトップ 1280×800 | 1,093 | 10 | 174 |
| モバイル 390×844 | 1,048 | 6 | 25 |

デスクトップとモバイルの差は、同じ見出しが何行に折り返すかで決まる。行が増えて矩形がヘッダーより高くなれば下側が生き残る。要素ごとにその関係を全部測ったわけではないので、ここまでにしておく。

## 一行で終わった修正と、残った25件

直す場所はフォーカス側ではなくスクロール側である。ブラウザが「要素を画面内に入れた」と判断する領域を、ヘッダーの下から始まるように変えればよい。その領域を定義するプロパティが `scroll-padding` で、[CSS Scroll Snap Module Level 1](https://www.w3.org/TR/css-scroll-snap-1/#propdef-scroll-padding)の定義をそのまま引くとこうなる。

> This property specifies (for all scroll containers, not just scroll snap containers) offsets that define the optimal viewing region of a scrollport: the region used as the target region for placing things in view of the user. This allows the author to exclude regions of the scrollport that are obscured by other content (such as fixed-positioned toolbars or sidebars)

このプロパティは普段、ハッシュリンクで飛んだときに見出しがヘッダーに隠れる問題の対処として紹介される。実際の役割はもっと広い。同じ領域がフォーカス移動に伴うスクロールにも使われるので、これはキーボードアクセシビリティの設定値だ。

私のサイトに入れたのは次の三行だ。

```css
html {
  --header-height: 5rem;
  scroll-padding-top: calc(var(--header-height) + 1rem);
}
```

ヘッダーの実測高さがデスクトップ81ピクセル、モバイル82ピクセルだったので、5remにフォーカスリングの余白1remを足して96ピクセルにした。ヘッダー高さを変数にしたのは、デザインが変わったときに両方の値が一緒に動くようにするためだ。

![同じ要素、同じShift+Tabの段。上は scroll-padding-top が auto のときで着地点y=24、ヘッダーに覆われている。下は96pxのときで着地点y=96、フォーカスリングが完全に見える](../../../assets/blog/focus-not-obscured-sticky-header-scroll-padding-2026/focus-landing-before-after.png)

同じページの同じShift+Tabの段で到達するカードリンクの着地点が、y=24からy=96へ移った。96は今入れた値と正確に一致する。25点のうち5点だった可視域が25点全部になる。

ソースを直して再ビルドし、同じスクリプトをそのまま回した。

| 指標 | 修正前 | 修正後 |
|---|---|---|
| 固有のフォーカス停止点 | 2,141 | 2,133 |
| 2.4.11 (AA) 違反 | 16 | 0 |
| 2.4.12 (AAA) 違反 | 199 | 25 |
| フォーカスは来たが要素が透明 | 4 | 0 |
| AA違反を覆っていた主体 | 固定ヘッダー16件 | なし |

AAは0になった。残ったAAA 25件は一件ずつ手で見た。結論は、数字をそのまま信じてはいけないという側だ。14件は最上部へ戻る円形ボタンだ。直径48ピクセルの円なのに矩形の四隅は円の外なので、その四点が背後のコンテンツに取られる。25点のうち4点、つまり16%が隠れたと出るが、実際に重なっているものは無い。格子が非矩形の要素を誤判定した例だ。10件は関連記事一覧のインラインリンクで、二行に折り返した矩形の行間で隣のリンクが取られた。残る1件は問い合わせページに埋めた高さ1,000ピクセルのフォーム `<iframe>` である。ビューポートが800ピクセルなので、この要素はどうスクロールしても全部は見えない。ビューポートより大きいコンポーネントにAAAは構造的に届かない。

まとめると、AAの軸はCSS一行で閉じ、AAAの軸の数字は人が分類して初めて結論になる。

JavaScriptで直す道もある。`focusin` を拾って `scrollBy` で押し上げるコードは何度か見たことがある。私はその方法を勧めない。ブラウザがスクロールを終えた後にもう一度スクロールする構造なので、画面が目に見えて跳ねるし、スムーススクロールと重なるとずれる。`scroll-padding` は判断基準そのものを変えるので、最初から正しい位置へスクロールする。計算もブラウザ側で済む。

## opacity: 0 で隠したボタンはタブ順に残る

測定にはおまけが一つ付いた。4つの停止点で、フォーカスは要素に届いているのに要素自身が透明だった。最上部へ戻るボタンである。

```css
/* 修正前 */
.back-to-top {
  @apply opacity-0 translate-y-4 pointer-events-none;
}
.back-to-top.visible {
  @apply opacity-100 translate-y-0 pointer-events-auto;
}
```

`opacity: 0` も `pointer-events: none` も、要素をタブ順から外さない。だからページ最上部でTabを押し続けると、見えないボタンにフォーカスが止まる。`pointer-events` はポインターしか止めないので、その状態でEnterを押せばボタンは動く。これは覆われた問題ではなく、そもそも描かれていない問題であり、2.4.11ではなくフォーカスの可視性(2.4.7)側に掛かる。

`visibility: hidden` を足せば要素は順次フォーカス移動から外れる。`visibility` は離散的に切り替わるので、既存のフェードインも保たれる。最初はTailwindのユーティリティで `@apply invisible` と `@apply visible` を書いたところ、ビルドが壊れた。`.back-to-top.visible` というセレクタの中で `visible` ユーティリティを呼んだので自分自身を参照する形になり、PostCSSが循環依存だと止めた。ユーティリティではなくプロパティを直に書いた。

```css
/* 修正後 */
.back-to-top {
  @apply opacity-0 translate-y-4 pointer-events-none;
  visibility: hidden;
}
.back-to-top.visible {
  @apply opacity-100 translate-y-0 pointer-events-auto;
  visibility: visible;
}
```

修正後、固有のフォーカス停止点が2,141から2,133へ減った。8つ消えたことが、ボタンがタブ順から外れた証拠になる。見えないコントロールを隠すなら、不透明度ではなく可視性か `inert` を使う。

## この測定が言えないこと

ヒットテストは知覚ではない。`elementFromPoint` はその座標の最前面がどの要素かにしか答えない。半透明に重なったヘッダーの下で文字が読めるのか、フォーカスリングのコントラストが足りているのかは別の問題で、人が見るしかない。

5×5の格子は非矩形の要素で外す。上の円形ボタン14件がその証拠だ。格子を細かくしても円の隅の問題は残る。要素の実際に描かれた形を知る必要があるが、その情報はヒットテストからは得られない。

解説文書が認める例外を、スクリプトは判断できない。利用者が開き、フォーカスを移さずに退けられるコンテンツは不適合ではないという条項だが、何が利用者の操作で開いたものかはコードには分からない。クッキーバナーや非モーダルのダイアログを使うサイトなら、このスクリプトの出力は最終判定ではなく候補一覧である。

測ったのはChromium一つだけだ。フォーカス対象を画面に入れる寄せ方はユーザーエージェントの裁量なので、他のエンジンでは着地点が違い得る。ただし `scroll-padding` は仕様に明記されたプロパティなので、方向は同じだろうと見ている。

最後に、検索順位とは関係がない。私はこの修正で順位への効果を測っていないし、主張する根拠もない。構造化データが順位を保証しないのと同じ文脈で、アクセシビリティの修正も順位を保証しない。これは適合性とユーザビリティの基準である。

## まとめ: 両方向に歩き、CSS一行を確かめる

同じ問題を自分のサイトで確かめる手順を順に書く。

1. <strong>スティッキーまたは固定の要素の実測高さを先に測る。</strong>`getBoundingClientRect().height` をデスクトップとモバイルで別々に測り、`getComputedStyle(document.documentElement).scrollPaddingTop` を確認する。この値が `auto` で上部に固定ヘッダーがあるなら、違反の候補はすでに存在している。
2. <strong>`scroll-padding-top` にヘッダー高さ＋余白を入れる。</strong>ヘッダー高さはCSS変数にして参照する。スティッキーフッターがあれば `scroll-padding-bottom` も併せて入れる。私の場合、この三行がAA違反16件を0件にした。
3. <strong>監査スクリプトはキーを本当に押す。</strong>`element.focus()` はChromiumで要素を中央に置くため、この不具合を再現しない。TabとShift+Tabを両方向に回し、要素ごとに番号を振って重複を除く。
4. <strong>不透明度で隠したコントロールを探す。</strong>`opacity: 0` や `pointer-events: none` だけで隠した要素はタブ順に残る。`visibility: hidden`、`display: none`、`inert` のいずれかを使う。
5. <strong>AAAの数字は手で分類してから使う。</strong>円形の要素、複数行に折り返したインライン要素、ビューポートより大きいコンポーネントは、格子方式では構造的に部分的な隠れとして出る。

測定スクリプトは `scripts/audit-focus-obscured.mjs` としてリポジトリに置いた。静的ビルドをローカルに立てて、パスを幾つか渡せば動く。

キーボードで両方向に歩いてみるだけの検査を、まだ一度も通していないサイトは多い。その一往復を代わりに歩いて、判定できる形の報告書にするところまでが私の仕事だ。窓口は[プロフィール](/ja/about/)。

---

*出典: W3Cの[Web Content Accessibility Guidelines (WCAG) 2.2](https://www.w3.org/TR/WCAG22/)(W3C勧告、2024年12月12日)、[Understanding SC 2.4.11: Focus Not Obscured (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html)、[CSS Scroll Snap Module Level 1](https://www.w3.org/TR/css-scroll-snap-1/#propdef-scroll-padding)(Candidate Recommendation Snapshot、2021年3月11日)、自動ルール一覧はDequeの[axeルール一覧](https://dequeuniversity.com/rules/axe/4.10)(いずれも公式)。測定環境: 自前のAstroビルド成果物、Playwright 1.57 + Chromium、ビューポート1280×800と390×844、ページ6件、固有のフォーカス停止点2,141件(修正後2,133件)、判定はフォーカス矩形の5×5格子に対する `document.elementFromPoint` の結果。すべての数値はこのサイトのこのビルドとこのブラウザで得た値であり、他のユーザーエージェントのスクロール寄せ挙動についての記述ではない。*
