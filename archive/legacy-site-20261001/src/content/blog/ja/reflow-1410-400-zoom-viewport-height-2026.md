---
title: 'リフローを320pxの幅だけで測ると半分しか測れない: 400%拡大の高さ200px'
description: 'WCAG 1.4.10 リフローを 320x844・320x256・320x200 の3条件で同時に測った。横方向の判定は3条件で1ピクセルも違わず、400%拡大で実際に変わるのは高さのほうだ。82pxの sticky ヘッダーがビューポートの41%を占め、本文の可視領域は6割を切っていた。測定スクリプトも置いた。'
pubDate: '2026-08-09'
heroImage: '../../../assets/blog/reflow-1410-400-zoom-viewport-height-2026/hero.png'
tags:
  - アクセシビリティ
  - WCAG
  - CSS
  - レスポンシブ
  - Web開発
faq:
  - question: 'リフローはブラウザ幅を320pxにすれば確認できるのでは?'
    answer: '横方向はそれで足ります。今回の測定でも 320x844・320x256・320x200 の3条件で、横あふれの発生ページも、あふれたピクセル値も完全に一致しました。ただし400%拡大は幅を320にするだけでなく、高さも200前後まで縮めます。窓を横にだけ縮める手順では、その高さを一度も見ないまま合格を出すことになります。'
  - question: 'sticky ヘッダーを使うと 1.4.10 違反になりますか?'
    answer: 'なりません。1.4.10 が判定するのは2方向スクロールの発生であって、ヘッダーが縦を占めること自体は違反項目に入っていません。ただし200pxのビューポートで82pxのヘッダーは画面の41%です。基準に合格したまま本文が4行しか残らない状態が成立します。拡大利用者を実際に想定するなら、短いビューポートではヘッダーを通常フローに戻すほうが筋が通ります。'
  - question: 'Tailwind の break-words で長いメールアドレスのあふれが直らないのはなぜですか?'
    answer: 'break-words は overflow-wrap: break-word で、CSS Text 仕様はこの値が生む改行機会を min-content 内在サイズの計算に含めないと明記しています。グリッドやフレックスの項目の min-width は既定で auto なので、トラックはその長い文字列の幅まで広がったままです。overflow-wrap: anywhere を使うか、項目に min-width: 0 を与えると解決します。'
  - question: 'コードブロックが横にはみ出していたら違反ですか?'
    answer: 'そのコードが自前の横スクロールコンテナの中にあるなら、ページの2方向スクロールにはなりません。今回の標本ではみ出した要素43個のうち24個がこれに当たり、585pxも外に出ている code 要素があってもページのあふれは2pxで済んでいました。判定の単位は要素ではなくスクロールコンテナです。'
relatedPosts:
  - slug: focus-not-obscured-sticky-header-scroll-padding-2026
    score: 0.88
    reason:
      ko: 같은 82px 헤더가 그때는 키보드 포커스를 가렸고 이번에는 확대 화면의 세로를 먹었다. 그때 넣은 scroll-padding-top 96px이 이번 200px 뷰포트에서는 오히려 짐이 됐다는 이야기까지 이어진다.
      ja: 同じ82pxのヘッダーが、あのときはキーボードフォーカスを隠し、今回は拡大画面の縦を食った。あのとき入れたscroll-padding-top 96pxが、200pxのビューポートでは逆に重荷になった話まで続く。
      en: The same 82px header hid keyboard focus back then; here it eats the vertical room at 400% zoom. The scroll-padding-top of 96px added in that post turns into a liability once the viewport is 200px tall.
      zh: 同一个 82px 的头部，那次遮住了键盘焦点，这次吃掉了放大后的纵向空间。那篇里加的 scroll-padding-top 96px，到了 200px 高的视口反而成了负担。
  - slug: text-spacing-1412-clamp-audit-2026
    score: 0.79
    reason:
      ko: 1.4.12 측정의 후속으로 잡았던 소재가 이 글이다. 그때는 자간을 넓혀 가로로 밀었고 이번엔 뷰포트를 320px로 좁혀 밀었다. 미는 방향은 반대인데 무너지는 곳은 꽤 겹친다.
      ja: 1.4.12の測定で次の宿題として置いた題材がこれだ。あのときは字間を広げて横に押し、今回はビューポートを320pxに狭めて押した。押す向きは逆でも、壊れる場所はよく重なる。
      en: This is the follow-up I parked at the end of the 1.4.12 run. That one pushed outward by widening spacing; this one pushes inward by shrinking the viewport to 320px. Opposite directions, largely the same casualties.
      zh: 这是 1.4.12 那次留下的后续题目。上次是把字距撑开、往外挤；这次是把视口压到 320px、往里挤。方向相反，塌的地方却大半重合。
  - slug: act-rules-axe-coverage-wcag-sc-2026
    score: 0.7
    reason:
      ko: axe 4.13.0의 105개 규칙 중 1.4.10에 태그된 것은 없다. 어느 기준이 자동 검사의 사정거리 밖인지 목록으로 확인해둔 글이라, 이번처럼 직접 재야 하는 항목을 고를 때 먼저 펼쳐보게 된다.
      ja: axe 4.13.0の105ルールに1.4.10のタグは一つもない。どの基準が自動検査の射程外かを一覧にしてある記事なので、今回のように手で測る項目を選ぶときにまず開くことになる。
      en: None of axe 4.13.0's 105 rules carries a 1.4.10 tag. That post is the inventory of which criteria sit outside automated reach, which is where you start when picking what to measure by hand.
      zh: axe 4.13.0 的 105 条规则里没有一条挂 1.4.10 的标签。那篇把哪些标准落在自动检测射程之外列成了清单，挑「得手动量」的项目时先翻它。
  - slug: wcag22-target-size-audit-2026
    score: 0.62
    reason:
      ko: 검사기 점수와 실제 기준 사이의 간격을 픽셀로 확인했던 글이다. 이번에도 통과 표시는 폭에 대해서만 나왔고 높이는 아무도 보지 않았다.
      ja: 検査ツールのスコアと実際の基準との隙間をピクセルで確かめた記事だ。今回も合格表示は幅についてだけ出て、高さは誰も見ていなかった。
      en: "That post measured, in pixels, the gap between a checker's score and the criterion itself. Same shape here: the pass covered width, and nobody looked at height."
      zh: 那篇用像素量了检测工具的分数和标准本身之间的缝。这次一样：通过只覆盖了宽度，高度没人看。
---

うちのサイトのヘッダーは82pxある。sticky で、上に貼り付いたまま動かない。

844pxのスマートフォン画面なら、これは9.7%だ。誰も気にしない。同じヘッダーが200pxのビューポートでは41%になる。残りは118px、本文の行の高さが28pxだから、一画面に4行と少ししか入らない。

200pxという数字がどこから来るのか。1280x800のノートPCで400%拡大をかけたときのビューポートが、320x200 CSS px だ。幅の320は、アクセシビリティのリフロー確認で誰もが使う数字である。高さの200は、私も含めて誰も見ていなかった。

今日、幅を320で固定したまま高さだけ変えた3条件を並べて、16ページを測った。横方向の答えは3つとも同じだった。

## 320と256という数字の出どころ

リフローは WCAG 2.2 の達成基準 1.4.10、レベル AA。規範本文は [W3C の WCAG 2.2 勧告](https://www.w3.org/TR/WCAG22/#reflow)にある。

> Content can be presented without loss of information or functionality, and without requiring scrolling in two dimensions for:
>
> - Vertical scrolling content at a width equivalent to 320 CSS pixels;
> - Horizontal scrolling content at a height equivalent to 256 CSS pixels.
>
> Except for parts of the content which require two-dimensional layout for usage or meaning.

効いているのは "requiring scrolling in two dimensions" という言い回しだ。何かが横にはみ出したかどうかではない。読むために2方向へスクロールしなければならなくなったかどうかを見る。この区別が、後の測定で要素24個の扱いを決めた。

320の出どころも明記されている。[Understanding 文書](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)はこう書く。

> 320 CSS pixels is equivalent to a starting viewport width of 1280 CSS pixels wide at 400% zoom.

320pxは小さなスマートフォンのための数字ではない。1280pxの窓で400%拡大をかけた利用者のための数字だ。同じ文書は縦書きコンテンツについて "256 CSS pixels is equivalent to a starting viewport height of 1024 CSS pixels at 400% zoom" とも書いている。1024の縦を4倍に拡大すれば256が残る、という計算である。

ここから一歩進めたところが、この記事の出発点だ。400%拡大が幅を1280から320に縮めるなら、同じ拡大は高さも800から200に縮める。基準が幅にだけ数字を与えたのは、縦スクロールのコンテンツで損失が幅方向に出るからであって、高さが縮まないからではない。窓を横にだけ縮める手順は、その半分を丸ごと飛ばしている。

例外規定もある。Understanding が挙げる例は具体的だ。

> Examples of content which requires two-dimensional layout are images required for understanding (such as maps and diagrams), video, games, presentations, data tables (not individual cells), and interfaces where it is necessary to keep toolbars in view while manipulating content.

データテーブルが例外に入っていること、そして「個々のセルは除く」という但し書きまで付いていることは覚えておく価値がある。

## 3条件を並べて測る

対象はビルド成果物だ。`npm run build` が吐いた `dist/` に1,366枚のHTMLがあり、そこから16のURLを標本に取った。4言語のトップ、一覧ページ、本文記事5本、静的ページが数枚。ローカルの静的サーバーを立て、Playwright 1.57.0 の Chromium で開いた。Node は 22.22、`deviceScaleFactor` は 1、モーションは `reduce` に固定した。

条件は3つ、幅はすべて320である。

| 条件 | ビューポート | 何を模しているか |
|---|---|---|
| `narrow` | 320 x 844 | 幅の狭いスマートフォン |
| `floor` | 320 x 256 | 基準が明示した高さの下限 |
| `zoom400` | 320 x 200 | 1280x800 画面の400%拡大 |

各ページから2つを取り出した。1つは文書の `scrollWidth` が `innerWidth` を超えたピクセル数、つまりページ単位の横あふれ。もう1つは `position` が `sticky` または `fixed` の要素がビューポートの上下で占める高さと、それを引いた利用可能なコンテンツ高さである。

修正前の結果はこうだった。

| 条件 | 横スクロールが出たページ | 最大あふれ | 利用可能高さの中央値 | 利用可能率 |
|---|---|---|---|---|
| 320 x 844 | 16 / 16 | 17 px | 762 px | 90.3% |
| 320 x 256 | 16 / 16 | 17 px | 174 px | 68.0% |
| 320 x 200 | 16 / 16 | 17 px | 118 px | 59.0% |

横の3行が完全に一致している。ページの顔ぶれも同じ、あふれたピクセル値の分布も同じ。16件のうち14件が2px、1件が10px、1件が17pxだった。3回別々に測って、3回とも同じ答えが返ってきたことになる。

これは悪い知らせではない。リフローの横判定はビューポートの高さに依存しない。その実測がひとつ立った。横だけ見るなら条件は1つでいい。だとすれば3条件を回す価値は別の列にある。90.3%と59.0%、31ポイントの差のほうだ。

## はみ出した43個のうち24個は違反ではなかった

要素単位まで降りると、絵はもっと散らかっている。標本全体で、自分の矩形の右端がビューポートの外に出た要素は43個あった。最もひどいのは、ある記事本文の `code` 要素で、ビューポートを585px超えていた。ところが、そのページのページ単位のあふれは2pxである。

理由は単純だ。その `code` は `overflow-x` の効いた `pre` の中にいる。`pre` が自分の内側で横スクロールを引き受けるので、ページは横に動かない。規範本文の "requiring scrolling in two dimensions" がここで効いてくる。読者はコードブロックの中を横に送っているのであって、ページを横に送っているわけではない。

そこで監査スクリプトに祖先探索を入れた。ある要素がはみ出したとき、祖先に実際に横スクロールしているコンテナがあるかを遡って確かめる。

```js
let inScrollContainer = null;
for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
  const pcs = getComputedStyle(p);
  if ((pcs.overflowX === 'auto' || pcs.overflowX === 'scroll' || pcs.overflowX === 'hidden')
    && p.scrollWidth > p.clientWidth + 1) {
    inScrollContainer = p.tagName.toLowerCase() + ':' + pcs.overflowX;
    break;
  }
}
```

この一片で43個が24対19に割れた。吸収された24個は `pre` の中の `code` が18個、テーブルのラッパー内の `thead`/`tbody` が6個。残る19個が実際にページを横へ押していた。

リフロー監査を要素単位でやると、この24個が全部違反として上がってくる。その一覧を持って座れば、直す必要のないコードブロックを半日いじることになる。判定の単位は要素ではなくスクロールコンテナだ。

ひとつ正直に残しておく。テーブルのラッパー内を「吸収された」に分類したのは、基準の例外規定と重なる領域で、私の判断が入っている。Understanding がデータテーブルを例外に挙げているので向きは合っているが、スクリプトが仕様判定を代行したわけではない。

## ページを実際に横へ押した3種類

残った19個は、きれいに3種類へ分かれた。原因が違い、直し方も違う。

<strong>1つめ、ヘッダーのコントロール列。</strong>16ページすべてで同じ要素が2pxずつあふれた。ヘッダー右側のテーマ切り替えと言語切り替えの塊である。320pxから `nav` の左右パディング16pxずつを引くと288pxが残る。ブランドマークとメニューボタンと右側コントロールの固有幅の合計が、その288を2px超えた。観測された14件のあふれが、この1か所から出ている。

<strong>2つめ、切れない長い文字列。</strong>問い合わせページのカード2枚が10pxずつあふれた。カードの中にメールアドレスが一塊で入っていて、そのアドレスがカードを288pxのトラックの外へ押し出した。カードの実測幅は314pxだった。

<strong>3つめ、絶対に畳まれない多列グリッド。</strong>改善履歴ページの `.before-after` が17pxあふれた。`grid-template-columns: 1fr auto 1fr` で「改善前・矢印・改善後」を横に並べる構成だが、狭い幅への例外がないため320pxでも3列を保とうとする。

3つの性格が違うことが、この分類の使いどころだ。1つめは余白の調整で終わり、3つめはメディアクエリ1つで終わる。2つめはそう簡単ではなかった。

## `break-word` では直らない

長いメールアドレスが箱を広げる話はよくある。反射的に Tailwind の `break-words` を付けた。測り直したら、カードは相変わらず314px、あふれも相変わらず10pxだった。

これは Tailwind の問題ではなく、CSS 仕様がそう決めている。`break-words` は `overflow-wrap: break-word` であり、[CSS Text Module Level 3](https://www.w3.org/TR/css-text-3/#overflow-wrap-property) はこの値をこう定義する。

> As for `anywhere` except that soft wrap opportunities introduced by `break-word` are *not* considered when calculating min-content intrinsic sizes.

すぐ次の行で `anywhere` は逆に規定される。

> Soft wrap opportunities introduced by `anywhere` *are considered* when calculating min-content intrinsic sizes.

グリッドやフレックスの項目の `min-width` は既定で `auto` で、その値は中身の min-content サイズに従う。`break-word` が生んだ改行機会はその計算に入らないので、トラックは切れないままのメールアドレスの幅まで広がり続ける。画面上のテキストは折り返されるのに箱の寸法は縮まない。これ以上ないほど紛らわしい。

ブログのコードに触る前に、最小再現で切り分けた。288pxのグリッドトラックに同じメールアドレスを入れたカードを4枚作り、それぞれ別の処方をかけた。

| 処方 | カードの実測幅 |
|---|---|
| なし | 304 px |
| `overflow-wrap: break-word` | 304 px |
| `overflow-wrap: anywhere` | 288 px |
| 項目に `min-width: 0` + `break-word` | 288 px |

仕様の文どおりの結果だ。`break-word` は1pxも縮められず、`anywhere` と `min-width: 0` はトラック幅にぴたりと合わせる。実際の修正は `overflow-wrap: anywhere` を入れた。

この罠が厄介なのは、失敗が静かだからである。スタイルは当てた。テキストは折り返る。目で見ると何か変わった気がする。ページのあふれだけがそのまま残る。[1.4.12 の字間測定](/ja/blog/ja/text-spacing-1412-clamp-audit-2026)で出くわしたのと同種の罠で、あのときは指標が失敗を見落とし、今回は処方が原因に届かなかった。

## 400%拡大で本当に変わるのは高さ

ここまでが横の話だ。3条件を全部回した理由は、縦にある。

sticky ヘッダーの実測高さは82px。844pxのビューポートでは9.7%、200pxのビューポートでは41%。残る利用可能高さは118px、本文記事の行の高さが28pxなので、一画面に本文が4行と少し。

![320x200 のビューポートで sticky ヘッダーを保った場合と通常フローに戻した場合の実画面比較。左はヘッダーが82pxを覆って本文が118pxしか残らず、右は200px全部が本文](../../../assets/blog/reflow-1410-400-zoom-viewport-height-2026/zoom400-before-after.png)

上のキャプチャは、記事本文を2,600pxスクロールした地点で同じビューポートを2回撮ったものだ。左が従来の挙動、右が修正後である。

はっきりさせておくことがある。これは 1.4.10 違反ではない。基準が判定するのは2方向スクロールの発生であって、ヘッダーが縦を占めることはその項目に入っていない。基準に合格したまま本文が4行しか見えない状態が成立する。

それでも直すほうが筋が通る、と私は考える。320pxという数字が拡大利用者から出てきた数字なら、同じ拡大が作る200pxも同じ利用者の画面だ。幅についてだけその人を気遣い、高さは見ない、では話が合わない。しかも Understanding の例外一覧には "interfaces where it is necessary to keep toolbars in view while manipulating content" が入っている。操作中にツールバーを表示し続ける必要があるインターフェースなら、画面を占有する根拠がある、という意味だ。私のブログのヘッダーはそれに当たらない。記事を読んでいる間、言語切り替えボタンが浮いていなければならない理由はない。

## 直して測り直した

修正は4か所。

```css
/* Header.astro: 320px でコントロール列が2pxあふれる件 */
@media (max-width: 400px) {
  .site-header > nav { padding-inline: 0.75rem; }
  .site-header__row { gap: 0.5rem; }
}

/* Header.astro: 短いビューポートではヘッダーを通常フローへ戻す */
@media (max-height: 400px) {
  .site-header { position: static; }
}
```

```css
/* improvement-history: 狭い幅で3列をほどき、矢印を寝かせる */
@media (max-width: 480px) {
  .before-after { grid-template-columns: 1fr; gap: 0.5rem; }
  .arrow { transform: rotate(90deg); }
}
```

メールアドレスには `overflow-wrap: anywhere` をかけた。

4つめが少し込み入っている。[先月の 2.4.11 フォーカス隠れの修正](/ja/blog/ja/focus-not-obscured-sticky-header-scroll-padding-2026)で `scroll-padding-top` を96pxにしてある。ヘッダーが82pxだから、その下へ着地させるための値だ。ところがヘッダーが消える短いビューポートで96pxを残すと、200pxの画面の半分近くをスクロール余白として捨てることになる。ある達成基準のために入れた値が、別の達成基準の条件で重荷になる。

```css
@media (max-height: 400px) {
  html {
    --header-height: 0px;
    scroll-padding-top: 1rem;
  }
}
```

ビルドし直し、同じスクリプトを同じ16のURLに回した。

| 条件 | 横スクロールのページ（前 → 後） | 最大あふれ | 利用可能率（前 → 後） |
|---|---|---|---|
| 320 x 844 | 16 → 0 | 17 → 0 px | 90.3% → 90.3% |
| 320 x 256 | 16 → 0 | 17 → 0 px | 68.0% → 100.0% |
| 320 x 200 | 16 → 0 | 17 → 0 px | 59.0% → 100.0% |

400%拡大の条件で、利用可能高さが118pxから200pxになった。行数に直せば4.2行から7.1行、69%増である。844pxの90.3%はあえてそのままにした。あの高さでは sticky のほうがよいと考えているし、メディアクエリの条件もそこに合わせて切ってある。

## 自動チェッカーはここを見ない

`axe-core` 4.13.0 には105のルールがあるが、`wcag1410` のタグが付いたものは1つもない。名前が近くて引っかかるものは性格が違う。`meta-viewport` は拡大を禁止していないかを見る 1.4.4 のルール、`scrollable-region-focusable` はスクロール領域にキーボードが届くかを見る 2.1.1 のルールだ。

当然の結果ではある。リフローはビューポートを実際に変えて描画をやり直させないと判定できない基準で、DOM を一度なめるルールエンジンの動き方と合わない。この項目が自動チェックの射程外だということ自体は、[ルールの網羅率を数えた記事](/ja/blog/ja/act-rules-axe-coverage-wcag-sc-2026)で確認済みだ。ただし射程外というのは手で測れという意味であって、測るなという意味ではない。今日書いたスクリプトは100行ほど、16ページ3条件を回すのに1分かからなかった。

## 最初の実行で「合格」した2ページ

初回、16ページのうち2つがあふれ0px・利用可能率100%で出た。見栄えのよい数字で、危うく「一部のページはすでに合格」と書くところだった。

その2つのURLは存在しない経路だった。ローカルサーバーが404を返し、404の本文にはヘッダーがないのであふれもなく、sticky 要素もない。完璧な合格に見える結果が出た理由がそれである。

そこでスクリプトにレスポンスコードの確認を入れた。

```js
const resp = await page.goto(`http://localhost:${port}${u}`, { waitUntil: 'networkidle' });
if (!resp || resp.status() !== 200) {
  throw new Error(`${u} returned ${resp ? resp.status() : 'no response'} 標本URLを直せ`);
}
```

測定ツールが失敗を合格に変えて報告する経路は、だいたいこういう形をしている。値がおかしくて目に留まるのではなく、値が良すぎて素通りする。標本URLを手で書く監査スクリプトなら、レスポンスコードの確認は選択肢ではない。

## この測定が答えていないこと

macOS 1台、Chromium 1ビルドで測った値だ。他のエンジンの結果は確認していない。

エミュレーションと実際のブラウザ拡大は同じではない。私はビューポートを 320x200 に指定したのであって、ブラウザの拡大率を400%にしたのではない。レイアウトの結果は一致するはずだし、1.4.10 が判定するのもレイアウトだが、デバイスピクセル比や `srcset` の選択はこの2つで違って出る。画像の選択まで見るなら、実拡大で測り直す必要がある。

標本は1,366枚のうち16枚。テンプレートを万遍なく覆うように選んだが全数ではなく、とくに記事本文は5本しか見ていない。コードブロックとテーブルが多い記事ほどスクロールコンテナの分類が結果を左右するので、そちらの標本を増やせば数字は動く余地がある。

横書きコンテンツしか見ていない。基準の2項目めである「高さ256 CSS px での横スクロールコンテンツ」は縦書き組版に当たるが、うちのサイトには `writing-mode: vertical-rl` の本文がないので測る対象がなかった。縦書きを使う日本語サイトなら、この軸は別に見る必要がある。

コンテンツ損失の類型のうち、重なりは測っていない。今回のスクリプトが見るのは文書の横あふれと固定要素の縦占有だけだ。

## 半日で一巡する点検手順

1. ビルド成果物からテンプレートごとに10〜20のURLを取る。トップ、一覧、記事、フォームのある静的ページを混ぜる。
2. レスポンスコードが200かを先に確かめる。404を測って合格と書く事故を止める。
3. 幅320pxの1条件で横あふれを測る。高さは何でもよい。3つの高さが同じ答えを返す。
4. はみ出した要素は、祖先に横スクロールコンテナがあるかでふるいにかける。落ちたものは直さない。
5. 残りを3系統に分ける。コントロール列の固有幅、切れない長い文字列、畳まれない多列グリッド。
6. 長い文字列には `overflow-wrap: anywhere` を使う。`break-word` は min-content を縮めない。
7. 高さ200pxの条件を別に1回かける。sticky/fixed の要素がビューポートの何パーセントを占めるかを計算する。
8. 30%を超えるなら `@media (max-height: ...)` で通常フローへ戻すことを検討する。一緒に入れてある `scroll-padding-top` があれば、それも縮める。

7と8は 1.4.10 の判定項目ではない。合否とは関係なく、拡大利用者の手元に実際に何行残るのかを知る作業である。うちの場合は4.2行だった。

400%拡大は、アクセシビリティのチェックリストではたいてい最後の行にあって、たいてい目視ひとつで通過する。その一行を実測値と回し直せるスクリプトに置き換える仕事なら引き受けられる。窓口は[お問い合わせページ](/ja/contact/)ひとつだ。

---

*出典: W3C の [WCAG 2.2 達成基準 1.4.10 Reflow](https://www.w3.org/TR/WCAG22/#reflow)（W3C 勧告、2024年12月12日）、[Understanding SC 1.4.10](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)、[CSS Text Module Level 3](https://www.w3.org/TR/css-text-3/#overflow-wrap-property)（Candidate Recommendation）（いずれも公式）。達成基準の本文と `overflow-wrap` 2値の定義は原文をそのまま引き、引用の直前に原文リンクを置いた。測定環境: jangwook.net の本番ビルド（HTML 1,366枚）から標本16 URL、ビューポート 320×844・320×256・320×200、Playwright 1.57.0 + Chromium ヘッドレス、Node 22.22、`deviceScaleFactor` 1、ローカル静的サーバー、2026年8月9日測定。スクリプトは `scripts/audit-reflow.mjs`、生データは `data/reflow-audit.json` と `data/reflow-audit-after.json`。ビューポート指定はブラウザ拡大率の操作ではないため、デバイスピクセル比と `srcset` の選択は実際の400%拡大と異なりうる。すべての数値はこのエンジン・この標本から出た値であり、他サイトの違反率や他のレンダリングエンジンの挙動についての言明ではない。重なり型のコンテンツ損失と縦書きコンテンツは測っていない。*
