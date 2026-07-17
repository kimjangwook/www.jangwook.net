---
title: 'CSS一行で強制レイアウトが27.3ms→1.8msに — content-visibility実測'
description: '同じHTML・同じバイト数なのに、CSSを一行足しただけで強制レイアウトのコストが15倍縮んだ。400セクションのページを二つ作り、ChromeトレースとPerformance APIで content-visibility: auto の実際のレンダリング削減を測り、contain-intrinsic-size とアクセシビリティの落とし穴まで整理する。'
pubDate: '2026-07-17'
heroImage: '../../../assets/blog/content-visibility-auto-render-cost-measure-2026/hero.png'
tags:
  - Core Web Vitals
  - CSS
  - Web性能
  - レンダリング
relatedPosts:
  - slug: cls-layout-shift-reserve-space-measure-2026
    score: 0.72
    reason:
      ko: 그 글의 핵심이 "이미지 자리를 미리 예약해 화면이 안 밀리게" 였는데, 여기서 나오는 contain-intrinsic-size가 정확히 같은 발상을 오프스크린 섹션 전체에 적용한 것이다.
      ja: あちらは「画像の場所を先に予約してずれを防ぐ」話だった。こちらの contain-intrinsic-size は、その発想をそのまま画面外セクション全体へ広げたものだ。場所の予約という一つの原理が、CLSとレンダリングコストを同時に左右する。
      en: That post was about reserving space so images don't shove the layout; the contain-intrinsic-size here is the same idea applied to whole off-screen sections.
      zh: 那篇讲的是"提前预留图片位置以防跳动"，而这里的 contain-intrinsic-size 正是把同一思路扩展到整段屏幕外内容。
  - slug: lcp-image-preload-scanner-fetchpriority-2026
    score: 0.63
    reason:
      ko: LCP를 다룬 그 글이 앞단이라면, 이 글은 "안 보이는 건 아예 안 그린다"는 뒷단이다.
      ja: LCPを扱ったあちらが「ブラウザが何をいつ描くか」の前段なら、こちらは「見えないものは描かない」という後段だ。触る場所は正反対だが、どちらも初期レンダーを縮める。対で読むと予算の削りどころが見えてくる。
      en: If that LCP post is the front end of "what the browser paints and when," this is the back end of "don't paint what isn't visible."
      zh: 如果那篇 LCP 是"浏览器画什么、何时画"的前端，这篇就是"看不见的干脆不画"的后端。
  - slug: a11y-lighthouse-audit-fix-2026
    score: 0.55
    reason:
      ko: content-visibility로 콘텐츠를 숨겼다가 스크린 리더나 페이지 내 검색에서 사라지면 그게 바로 사고다.
      ja: 性能最適化がアクセシビリティを壊す瞬間がある。content-visibility で隠したつもりが、スクリーンリーダーやページ内検索から消えたらそれだ。あちらのLighthouse実測の習慣が「速いが到達可能か」を確かめる安全網になる。
      en: Hide content with content-visibility and have it vanish from a screen reader or find-in-page, and that's the accident. The Lighthouse measure-first habit is your safety net.
      zh: 用 content-visibility 隐藏内容，却让它从屏幕阅读器或页内搜索中消失，就是这种事故。那篇的 Lighthouse 先测习惯正是安全网。
---

同じHTML、同じバイト数。スタイルシートにCSSを一行足しただけ。強制レイアウトのコストが27.3msから1.8msへ落ちた。初期LCPは464msが106msになった。JavaScriptも画像最適化もサーバ設定も触っていない。ブラウザに「いま画面に見えていないものは計算しなくていい」と伝えただけだ。

その一行が `content-visibility: auto` だ。今回は400セクションの重いページを二つ用意し、Chrome DevToolsのトレースとPerformance APIで、この性質が実際に何をどれだけ削るのかを測った。以下の数値はすべてサンドボックスの実測値。そして最後に、この最適化が静かにアクセシビリティを壊す一点まで押さえておく。

## ブラウザがフレームごとに払うコスト — だから何を後回しにできるか

まず土台から。ブラウザがページを画面へ載せるとき、毎回決まったパイプラインを回す。DOMとCSSからスタイルを算出し(Style)、各要素の位置と大きさを決め(Layout)、ピクセルを塗り(Paint)、レイヤーを合成する(Composite)。厄介なのは、この仕事がページ全体に対して起こる点だ。画面のはるか下、3000ピクセル先の表のセル一つも、いま見えている最初の画面とまったく同じようにスタイルとレイアウトの計算を受ける。

短いブログ記事なら問題にならない。だが長いドキュメント、無限スクロールのフィード、数百枚のカードが並ぶダッシュボード、膨大な商品リストでは話が変わる。ユーザーは最初の画面しか見ていないのに、ブラウザは見えてもいない数万ノードのレイアウトを毎フレーム計算し直す。スクロールのたび、ウィンドウをリサイズするたび、フォントが一つ変わるたびに、そのコストを払い続ける。重いページがスクロールでもたつく主な理由がこれだ。

ここで自然な問いが出る。「見えないものは後で計算すればいいのでは?」。長く使われてきた答えはJavaScriptによる仮想化(virtualization)だった。画面に入った項目だけをDOMに描き、残りは外す方式だ。ただしライブラリ依存が増え、アクセシビリティ・検索・アンカーリンクが壊れやすい。`content-visibility` は、この仕事をCSS宣言一つで、DOMはそのまま残したままブラウザに委ねる。

## 公式の定義 — auto が有効にする四つの containment

`content-visibility: auto` が何をするかは、web.devのドキュメントに明快に書かれている。この属性が付いた要素は <strong>layout・style・paint の containment</strong> を得る。さらに、その要素が画面外にあってユーザーと無関係なら(フォーカスや選択範囲がその中になければ)、ここに <strong>size containment</strong> が加わり、コンテンツのペイントとヒットテストを止める([web.dev, content-visibility](https://web.dev/articles/content-visibility))。

ドキュメントの言い回しをそのまま引けば、こうだ。「要素が画面外にあれば、その子孫はレンダリングされない。ブラウザはコンテンツを考慮せずに要素の大きさを決め、そこで止まる」。肝は「そこで止まる」。スタイルの再計算も、レイアウトも、ペイントも、画面外の子孫については飛ばす。そしてユーザーがその近くまでスクロールして初めてレンダリングする。遅延レンダリング(lazy rendering)をCSSのレベルでやるわけだ。

注意したいのは `auto` と `hidden` の違い。`content-visibility: hidden` は常にレンダリングを飛ばし、プログラムで描き直すまでユーザーにもアクセシビリティツリーにも見えない。対して `auto` は「いま画面外なら後回し、関連したら即描画」という条件付きだ。最初の画面のコンテンツに `auto` をかけても、それは即座にレンダリングされる。だから長いページの画面外セクションに掛けるのが定石になる。

## 同じページを二つ — 違いはCSS一行だけ

再現のない主張はしない。サンドボックスに静的HTMLを二つ作った。400個の `<section>`、各セクションに段落4つと12行の表が一つ。合わせて約28,800のDOMノード、HTMLサイズは約689KB。ダッシュボードや長いレポートを模した、わざと重いページだ。

二つのファイルのDOMは <strong>完全に同一</strong>。バイト数も実質同じ。ただ一つ、`cv.html` にだけこのスタイルを入れた。

```css
section.cv {
  content-visibility: auto;
  contain-intrinsic-size: auto 480px;
}
```

二行目がなぜ要るかは後で扱う。まずはこの一ブロックが全部だと覚えておいてほしい。JavaScriptは一行もない。そのうえでローカルサーバで二ページを立て、Chrome(バージョン150、macOS、ネットワーク・CPUのスロットリングなし)でそれぞれトレースを取った。

## 測定結果 — 初期レンダーと強制レイアウト

一つ目の指標は <strong>LCP(Largest Contentful Paint)</strong>、最大のコンテンツが描かれる時点だ。Chromeトレースでは baseline がLCP 464ms(レンダー遅延462ms)、`content-visibility` 版が106ms(レンダー遅延104ms)。およそ4.4倍速い。両ページともCLSは0.00で、ずれは起きていない。

正直に断っておく。LCPのトレースは実行ごとに揺れた。baseline を測り直すと220msになったこともある(初回はキャッシュやウォームアップの影響を受ける)。そこで揺れの小さい二つ目の指標を別に測った。<strong>強制レイアウト(forced reflow)のコスト</strong>だ。ドキュメント全体にスタイルの無効化を与えたあと `offsetHeight` を読んで同期レイアウトを強制し、その時間を15回測って中央値を取った。

<figure>
  <img src="../../../assets/blog/content-visibility-auto-render-cost-measure-2026/layout-cost.png" alt="Bar chart comparing forced style and layout cost (baseline 27.3ms vs content-visibility 1.8ms, 15.2x faster) and LCP (464ms vs 106ms, 4.4x faster)" />
  <figcaption>同じDOM・同じバイト、違いはCSS一行。すべてローカルサンドボックスの実測値。</figcaption>
</figure>

結果は baseline の中央値27.3ms(最小26.5、最大39.6)、`content-visibility` 版が1.8ms(最小1.5、最大2.7)。約15倍だ。この数値はLCPより揺れが小さく、原理を正直に映す。強制レイアウトは、画面外コンテンツが計算に参加するかしないかがそのまま出る指標だからだ。baseline は毎回28,800ノード全部のレイアウトを取り直すが、`auto` 版は画面内の数個だけを取る。

もう一つ余談。Chromeトレースは baseline に対して「DOMが大きい」というDOMSizeの警告を出したが、`content-visibility` 版には出さなかった。ブラウザから見て、レンダリングに参加する実効DOMが減ったということだ。

## contain-intrinsic-size を忘れるとスクロールバーが踊る

ここで `contain-intrinsic-size` を併用する理由が出てくる。画面外セクションのレンダリングを飛ばすと、ブラウザはそのセクションの実際の高さを知らない。何もしなければ、その要素の高さは0になる。400セクションが全部0の高さに畳まれ、スクロールで一つずつ入ってくるたびに本来の高さへ開き、文書全体の高さが変わり続ける。スクロールバーがあちこちに跳び、スクロール位置がずれる。

`contain-intrinsic-size` がこの場所を代わりに予約する。レンダリングを飛ばしている間、「このセクションはだいたいこの高さ」とブラウザに知らせるプレースホルダーの寸法だ。web.devの表現では「size containment の影響を受けるときの要素の自然な大きさを指定する」値。さらに `auto` キーワードを付ければ(`auto 480px` のように)、ブラウザは一度レンダリングしたあとその実寸を覚え、以降は再利用する。

これは画像に `width`/`height` を指定して[レイアウトのずれを防ぐ発想](/ja/blog/ja/cls-layout-shift-reserve-space-measure-2026)とまったく同根だ。場所を先に予約し、あとで実コンテンツが入っても周りを押しのけないようにする。実測でもそれが出た。`content-visibility` ページの `scrollHeight` は206,294px、baseline は302,454px。差はバグではなく、`auto` 版がまだ描かれていないセクションを480pxの推定値で押さえているためだ。推定が実際とずれるほどスクロール体験が不自然になるので、代表セクションの実高を測って近似値を入れるとよい。

## アクセシビリティは? auto は display:none ではない

性能の話ばかりでアクセシビリティを落とすと、最適化が事故に変わる。ここで `auto` の最も大事な性質が出る。web.devのドキュメントはこう明言する。「画面外のコンテンツは <strong>DOMに、したがってアクセシビリティツリーに残る</strong>(visibility: hidden とは違って)。つまりそのコンテンツはページ内で検索でき、ロードを待たずに辿って移動できる」。

この一文が核心だ。`content-visibility: auto` はコンテンツを <strong>消す</strong> のではなく、レンダリングを <strong>後回しにする</strong>。スクリーンリーダーは画面外セクションを依然として読めるし、ブラウザ内検索(Ctrl+F)はその中のテキストを見つけてスクロールしてくれる。アンカーリンクも動く。`display: none` やJS仮想化がよく壊すものを、`auto` は守る。私はここがこの属性の本当の値打ちだと思う。性能とアクセシビリティはたいてい相反するのに、`auto` は珍しく両方を取りにいく。

ただし正直に断る限界がある。ブラウザ対応はもう広く、Chrome・Edge 85+、Firefox 125+、Safari 18+ で動く。ところがSafariのページ内検索(Cmd+F)は、`content-visibility: auto` で後回しにされたテキストを常に見つけられるわけではないという報告がある(Safari 18.3.x時点、参考値・公式ではない)。アクセシビリティツリーへの露出とブラウザごとのfind-in-pageの挙動は別物なので、検索性が重要なコンテンツなら対象ブラウザで直接確かめるのが安全だ。

## どこで使い、どこで使わないか

万能ではない。むしろ誤用すると損だ。実測しながら整理した境界はこうだ。

使いどころ。最初の画面から下へ長く続く画面外セクション、長い記事の下位段落、カード・リスト・コメントスレッド・商品グリッドのような繰り返しの重いブロック。要は「いま見えないが、DOMには存在すべき」かたまりだ。

使うべきでないところ。最初の画面に常に見えるコンテンツに掛けても得はない(どうせ即レンダリングされる)。そしてCSSスクロールスナップ、一部の `position: sticky` の組み合わせ、コンテナ寸法に依存するレイアウトとは相性が悪いことがある。

もっとも静かな落とし穴は <strong>強制レイアウト</strong> だ。web.devが警告するとおり、ブラウザは、後回しにしたサブツリーへレンダリングを強制するDOM APIをあなたが呼ばないときにだけ、作業を飛ばせる。`getBoundingClientRect()`、`offsetTop`、`scrollHeight` などを画面外要素に対して呼ぶと、ブラウザはその場でレイアウトを強制的に回し、削減がまるごと消える。スクロール位置の計算やアニメーションのフックで、こうしたAPIを習慣的に呼ぶコードがあるなら監査したほうがいい。Chromiumは `content-visibility: hidden` のサブツリーに対してこうした呼び出しが起きると、コンソールに警告を出してくれる。

もう一つ正直に。これは <strong>レンダリングのCPUを節約するのであって、ダウンロードのバイトを減らすのではない</strong>。HTMLはそのまま全部落ちてくる。初期ペイントとスクロールの反応はよくなるが、ネットワーク転送量は変わらない。バイトを減らしたいなら、[本物の遅延ロードやサーバ側ページネーション](/ja/blog/ja/lcp-image-preload-scanner-fetchpriority-2026)が別途要る。二つの最適化は目的が違う。

## すぐ使えるチェックリスト

実務へ移す順序はこうだ。

<strong>1. 候補を選ぶ。</strong> 最初の画面から下へ長いページか? 繰り返しの重いブロック(カード・行・セクション)があるか? なければこの最適化の得はほぼない。無理に入れない。

<strong>2. 画面外ブロックだけに掛ける。</strong> 最初の画面のコンテンツは除く。

```css
.article-section,
.card,
.comment {
  content-visibility: auto;
  contain-intrinsic-size: auto 400px; /* 代表ブロックの実高を近似 */
}
```

<strong>3. contain-intrinsic-size を必ず併記する。</strong> 抜くとスクロールバーが跳ねる。代表ブロックいくつかの実高を測って近似値を入れ、`auto` キーワードでレンダー後の実寸を覚えさせる。

<strong>4. 強制レイアウトのコードを監査する。</strong> 画面外要素に `getBoundingClientRect`・`offsetTop` の呼び出しがあれば削減は消える。

<strong>5. 測り直し、到達可能か確かめる。</strong> 適用の前後で強制レイアウト時間やスクロール応答を実際に測る。そしてスクリーンリーダーと対象ブラウザのCtrl+Fで、画面外テキストがまだ見つかるか確認する。速くなったが辿れなくなったなら、それは改善ではない。

CSS一行で15倍という数字は、もちろんこの極端に重いサンドボックスから出た値で、実サイトの得はページ構造しだいだ。だが原理は堅い。見えないものを描かなければ速くなる。そして `content-visibility` は、それをアクセシビリティを壊さずにやれる数少ない方法だ。

構造化データをサーバサイドで確実に出したい、あるいは長いページのレンダリングコストとCore Web Vitalsを実測ベースで手当てしたい — そんなときは個人的に相談・実装の依頼を受けている。プロフィールの問い合わせ経路から連絡してほしい。「速そう」ではなく、トレースと数字で確かめるやり方を好む。
