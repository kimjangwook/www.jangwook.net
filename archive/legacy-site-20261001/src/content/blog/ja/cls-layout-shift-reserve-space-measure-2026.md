---
title: 'ボタンを押す瞬間、画面がずれた — CLS 0.559を0.014まで下げた実測記録'
description: '読み込み中にレイアウトがずれるのは好みの問題ではなく、数値で測れる指標だ。同じページを二通り作り、layout-shift PerformanceObserverでCLSを計測。画像サイズの予約とスロット確保だけで0.559(POOR)を0.014(GOOD)まで下げた過程を、コードとログで残す。'
pubDate: '2026-07-15'
heroImage: '../../../assets/blog/cls-layout-shift-reserve-space-measure-2026/hero.png'
tags:
  - Core Web Vitals
  - CLS
  - Web性能
  - アクセシビリティ
relatedPosts:
  - slug: lcp-image-preload-scanner-fetchpriority-2026
    score: 0.74
    reason:
      ko: 그 글은 브라우저가 이미지를 언제 발견하느냐(LCP)를 실측했고, 이 글은 그 이미지가 자리를 잡느냐(CLS)를 잰다. 같은 히어로 이미지가 두 지표를 동시에 흔든다.
      ja: あちらはブラウザが画像をいつ発見するか(LCP)を実測し、こちらはその画像が場所を確保できるか(CLS)を測る。同じヒーロー画像が両方の指標を揺らすので、対で読むとCore Web Vitalsの前後がつながる。
      en: That post measured when the browser discovers the image (LCP); this one measures whether that image holds its place (CLS). The same hero image moves both metrics.
      zh: 那篇实测浏览器何时发现图片（LCP），这篇测同一张图是否守住位置（CLS）。同一张主图同时牵动两个指标。
  - slug: ai-crawlers-dont-render-javascript-csr-2026
    score: 0.58
    reason:
      ko: 자바스크립트로 콘텐츠를 나중에 끼워 넣는 습관이 크롤러에겐 안 보이는 콘텐츠를, 사용자에겐 밀리는 화면을 만든다.
      ja: JSで後からコンテンツを差し込む癖は、クローラーには「見えないコンテンツ」を、ユーザーには「ずれる画面」を作る。この記事のバナー挿入の例は、あちらのCSR問題と同じ根だ。
      en: Injecting content late with JavaScript hides it from crawlers and shifts it for users. The banner example here shares the same root cause with that CSR article.
      zh: 用 JS 事后插入内容，对爬虫是看不见的内容，对用户是跳动的页面。本文的横幅插入例子与那篇 CSR 问题同根。
  - slug: a11y-lighthouse-audit-fix-2026
    score: 0.56
    reason:
      ko: 레이아웃 이동은 성능 지표이자 접근성 문제다. 운동 장애가 있는 사용자에게 밀리는 버튼은 오조작으로 직결된다.
      ja: レイアウトのずれは性能指標であると同時にアクセシビリティの問題でもある。運動機能に制約のある利用者にとって、ずれるボタンは誤操作に直結する。あちらのLighthouse実測ワークフローがここでも生きる。
      en: Layout shift is a performance metric and an accessibility problem at once — a moving button means mis-taps for users with motor impairments.
      zh: 布局偏移既是性能指标，也是无障碍问题——对有运动障碍的用户，跳动的按钮意味着误触。
---

購入ボタンを押そうとした瞬間、画面がすっと下にずれて、指が別のリンクを踏んでしまった。誰しも一度は経験があるはずだ。上のほうで画像が遅れて読み込まれたか、バナーが一つ割り込んできたか。イライラは一瞬で消えるが、これは感情の話ではない。Googleはこの「ずれ」を<strong>Cumulative Layout Shift(CLS)</strong>という数値で測り、その数値がページの良し悪しを分ける基準になる。

今回、同じHTMLページを二通り作った。片方にはよくあるミスをそのまま詰め、もう片方ではそれを直した。そしてブラウザがCLSを計算するときに使う、まさにそのAPIで両者を測った。結論から言えば、0.559が0.014まで下がった。以下の数字はすべて、そのサンドボックスから出た実測値だ。

## CLSが測るのは「総移動量」であって「移動回数」ではない

まず土台から。Core Web Vitalsは三つの指標でできている。LCP(最大の要素がいつ描かれるか)、[INP(操作にどれだけ速く反応するか)](/ja/blog/ja/inp-yielding-measure-2026/)、そしてCLS(画面がどれだけずれるか)。前の二つは時間(ミリ秒)だが、CLSだけは単位のないスコアだ。ここがCLSを誤解しやすい理由になっている。

CLSは、ページが生きている間に起きた<strong>予期しないレイアウト移動</strong>を集めて計算する。個々の移動一つのスコアは、二つの値の掛け算で出る。画面上でどれだけ広い領域が動いたか(impact fraction)と、その領域がどれだけ遠くへ動いたか(distance fraction)だ。ビューポートの半分を占める要素が、ビューポートの高さの半分だけ下にずれれば、およそ0.5 × 0.5 = 0.25になる。小さな脚注が数ピクセル動くのと、画面の半分がまるごと沈み込むのとでは、まったく重みが違う。

ここで大事な誤解を一つ。CLSは「移動が何回起きたか」を数えない。一度の移動が画面全体を押せば、その一回でPOORになる。逆に細かい移動が十回起きても、各々が微小なら合計は小さいままだ。そして決定的に、ユーザーがクリックやタップをした<strong>直後500ミリ秒以内</strong>に起きた移動は計算から除かれる。「開く」を押してアコーディオンが開くのは、予期された移動だからだ。`layout-shift`エントリの`hadRecentInput`フラグがこれを区別する。

基準線はGoogleの公式ドキュメントに定められている。<strong>0.1以下ならGOOD、0.25を超えればPOOR</strong>、その間は改善が必要な範囲だ([web.dev, Cumulative Layout Shift](https://web.dev/articles/cls))。この0.1という数字は恣意的なものではない。内部テストで0.15以上の移動は人が一貫して「気になる」と感じ、0.1以下は目に入っても過度ではなかった、という根拠から来ている([web.dev, thresholds](https://web.dev/articles/defining-core-web-vitals-thresholds))。

## 同じページを二通りに — よくあるミスをわざと仕込んだ

再現がなければ主張もない。サンドボックスに二つの静的HTMLを用意した。レシピギャラリーのような、画像とテキストが混ざったごく普通のページだ。

`bad.html`には、現場で最もよく見る三つのミスをそのまま入れた。

```html
<!-- ミス1: 画像にサイズ情報がない → 読み込み時に下を押しのける -->
<style>.hero img{width:100%}</style>
<div class="hero"><img src="cat.svg" alt="hero"></div>

<div class="card"><button>Save recipe</button></div>

<script>
  // ミス2: 500ms後に上部へバナー挿入 → 下の全てが下がる
  setTimeout(() => {
    const d = document.createElement('div');
    d.textContent = 'Subscribe now';
    document.body.insertBefore(d, document.body.firstChild);
  }, 500);
  // ミス3: 900ms後にヒーローの上へ告知を挿入
  setTimeout(() => { /* ヒーロー上に <p> を挿入 */ }, 900);
</script>
```

肝心なのは、この三つが別々のバグではなく<strong>同じミスの三つの顔</strong>だという点だ。ブラウザに「ここにこれだけ場所を取っておいて」と前もって伝えていない。画像はダウンロードが終わって初めて自分のサイズを知り、バナーと告知は後からJavaScriptが作り出す。ブラウザはその瞬間が来るまでその場所を0ピクセルとして扱い、コンテンツが届くと突然スペースを広げて下を全部押し下げる。

`good.html`は内容もタイミングも完全に同じ。バナーも500msに、告知も900msに入る。違うのはただ一点、ブラウザに前もって場所を教えることだけだ。この対比が大事になる。「コンテンツを遅く入れるな」ではなく「遅く入れてもいいから場所を空けておけ」が、この実験の論点だ。

## ブラウザがCLSを数えるそのAPIで直接測った

計測にはLighthouseのスコアのような要約値ではなく、生データをそのまま抜いた。`PerformanceObserver`で`layout-shift`エントリを一つずつ集める。これがChromeがCLSを計算するとき内部で読む、まさにそのイベントだ。

```js
new PerformanceObserver((list) => {
  for (const e of list.getEntries()) {
    if (!e.hadRecentInput) {        // ユーザー入力直後の移動は除外
      cls += e.value;               // value = impact × distance
      shifts.push({ value: e.value, t: Math.round(e.startTime) });
    }
  }
}).observe({ type: 'layout-shift', buffered: true });
```

Playwrightでシステムのchromeを起動し、モバイルビューポート(390px)で二つのページをそれぞれ読み込み、動的挿入が終わる2秒まで待ってから累積値を読んだ。モバイルを選んだのは、画面が狭いほど同じ要素がより大きな割合を占め、CLSがより痛く出るからだ。

<img src="../../../assets/blog/cls-layout-shift-reserve-space-measure-2026/shift-breakdown.png" alt="beforeとafterのlayout-shiftエントリをイベント別に分解した表。beforeは画像読み込み0.446、バナー0.066、告知0.048で合計0.559。afterは合計0.014。" />

| イベント(読み込み後の時刻) | 原因 | before | after |
|---|---|---|---|
| ~148ms | ヒーロー・サムネイルが場所なしでデコード | 0.446 | 0.000 |
| ~694ms | プロモバナーをbody最上部に挿入 | 0.066 | 0.000 |
| ~1070〜1135ms | 告知の段落をヒーロー上に挿入 | 0.048 | 0.014 |
| <strong>合計(CLS)</strong> | | <strong>0.559 (POOR)</strong> | <strong>0.014 (GOOD)</strong> |

最大の犯人は画像だった。移動全体の80%が、画像デコード一発から出ている。バナーと告知はそれぞれ0.06、0.05でその次。面白いのは、三つの移動が148ms、694ms、1135msとばらけて起きたのに、一つのスコアに合算された点だ。これは偶然ではない。

CLSは単純な総和ではなく<strong>セッションウィンドウ</strong>方式で計算される。移動が立て続けに起きればひとつのウィンドウにまとめ、1秒以上静かならば新しいウィンドウを開く。ウィンドウ一つの最大長は5秒だ([web.dev, optimize CLS](https://web.dev/articles/optimize-cls))。私の三つの移動は間隔がそれぞれ546ms、441msと、いずれも1秒未満だったので一つのウィンドウにまとまり、単純合計(0.559)が実際のセッションウィンドウCLSと一致した。もし移動の間に2秒ずつの空白があれば、話は変わっていた。この差は後で正直に触れる。

## 三行で終わる修正 — 場所を先に取れ

`good.html`で変えたのは三つだけ。コードで見ると拍子抜けするほど短い。

<strong>1) 画像にwidth/heightを明示する。</strong>

```html
<img src="cat.svg" alt="hero" width="800" height="450">
```

この二つの属性は、昔のように画像をそのピクセルで強制描画しろという意味ではない。現代のブラウザはこの値から<strong>アスペクト比</strong>を計算し、ファイルが届く前にその比率ぶんの箱を先に取っておく。CSSで`width:100%`を与えても、高さはこの比率に従う。レスポンシブ画像にはCSSの`aspect-ratio`を併用するとより確実だ。

```css
.hero img { width: 100%; height: auto; aspect-ratio: 16 / 9; }
```

<strong>2) 後から埋めるコンテンツの場所を、DOMに先に空けておく。</strong>

バナーを後から`insertBefore`で押し込むのではなく、空のスロットを最初から文書に置き、テキストだけを埋める。

```html
<div id="promo" style="min-height:64px"></div>
<script>
  // 場所はもうあるので中身だけ入れる → 移動ゼロ
  setTimeout(() => {
    document.getElementById('promo').textContent = 'Subscribe now';
  }, 500);
</script>
```

`min-height`で最小高さを確保し、`:empty`のとき`visibility:hidden`で隠せば、コンテンツがないときもレイアウトは揺れない。広告や埋め込みのように、サイズを前もって知れる場所にはすべてこの方法が効く([Google Publisher Tag, minimize layout shift](https://developers.google.com/publisher-tag/guides/minimize-layout-shift))。

<strong>3) 既存コンテンツの上に何かを差し込まない。</strong> どうしても必要なら、ユーザー操作への反応としてのみ行う。これは先ほどの500msルールと噛み合う。ユーザーがボタンを押して開く移動は予期されたものとしてCLSから外れるが、何の入力もなくスクリプトが押しのける移動は、そのままスコアに乗る。このページがJavaScriptでコンテンツを後から描く構造なら、[クローラーがJavaScriptをレンダリングしない問題](/ja/blog/ja/ai-crawlers-dont-render-javascript-csr-2026/)まで同時に抱えている可能性が高い。レンダリングのタイミングは、性能とクローラビリティの両方に効いてくる。

結果は表のとおり。三つの修正のうち画像一つを直すだけでCLSの80%が消え、残る二つまで処理して0.014だけが残った。この残りの0.014は告知挿入で出た小さな移動だが、GOOD基準の7分の1ほどなので、実使用では体感されない。

## 正直な限界 — この数値は順位を保証しない

ここで止まると危うい。実測したからといって、それがそのまま検索順位につながると言うのは誇張だ。三つ、はっきりさせておこう。

一つ目、<strong>ラボ(lab)データとフィールド(field)データは違う。</strong> 私が測ったのは統制された環境の合成計測だ。Googleがランキング信号に使うCLSは、実ユーザーのChromeから集まったフィールドデータ(CrUX)の75パーセンタイル値だ。ラボ計測は原因を見つけて直すには最高だが、「この数字がそのまま順位」ではない。デプロイ後はフィールドデータで確かめ直す必要がある。

二つ目、<strong>Core Web Vitalsが良いから順位が上がるわけではない。</strong> Googleはページ体験を信号に使うが、コンテンツの関連性が圧倒的に優先する。CLS 0.014は「このページはユーザーを尊重している」という信号であって、順位上昇の保証書ではない。これはGoogleの公式見解でもある。悪いCLSが足を引っ張ることはあっても、良いCLS一つで抜け出せはしない。

三つ目、<strong>私の計測方法そのものに近似が入っている。</strong> 私は`layout-shift`値を単純に合算した。今回はすべての移動が一つのセッションウィンドウに収まって実際のCLSと一致したが、移動が数秒ずつ離れて起きる長寿命ページ(無限スクロール、SPA)では、単純合計とセッションウィンドウ値がずれる。正確な値が必要なら、Googleが配布する`web-vitals`JavaScriptライブラリを使うのが正しい。それがセッションウィンドウのロジックをそのまま実装してくれる。加えて今回の実験は、Webフォント差し替え(FOUT)による移動は扱っていない。それもよくあるCLSの原因だ。

これらの限界を知ると、かえって実測の使いどころがはっきりする。ラボ計測は順位の予言ではなく<strong>デバッグの道具</strong>だ。「何がどれだけずれるか」を目で見て、原因を一つずつ剥がしていく。それがこのワークフローの全てであり核心だ。同じやり方で[LCPのボトルネックをトレースで分解した記録](/ja/blog/ja/lcp-image-preload-scanner-fetchpriority-2026/)や[content-visibilityのレンダーコストを実測した記録](/ja/blog/ja/content-visibility-auto-render-cost-measure-2026/)も、結局は同じ姿勢だ。測った瞬間に計測器そのものを疑うべき場面もある。[prerenderしたページのLCPが6.2秒と出た件](/ja/blog/ja/prerender-activationstart-cwv-measurement-2026/)は、ページが遅かったのではなく起点を引いていなかったせいだった。推測するな、測れ。

## 今日すぐできるチェックリスト

自分のサイトに当てはめるなら、この順で見ていけばいい。

- <strong>すべての`<img>`と`<video>`にwidth/heightを入れたか。</strong> レスポンシブでピクセルが流動的なら、CSSの`aspect-ratio`で比率を固定する。これ一つでたいていCLSの大半が片づく。
- <strong>広告・埋め込み・バナーの場所にmin-heightで空間を予約したか。</strong> サイズが分からなければ最もよくある高さで取っておき、埋まったらその中で処理する。
- <strong>JavaScriptで既存コンテンツの上に何かを挿入していないか。</strong> クッキーバナー、告知バー、遅延読み込みウィジェットがよくある犯人だ。ユーザー入力への反応でなければ、場所を先に空けておく。
- <strong>Webフォント差し替え時にレイアウトが跳ねないか。</strong> `font-display`と`size-adjust`で、代替フォントとWebフォントのメトリクス差を縮める。
- <strong>直したあと、フィールドデータで確認したか。</strong> ラボでGOODが出ても、実ユーザー環境(遅い端末、遅い回線)では違うことがある。`web-vitals`ライブラリやCrUXで実使用値を見る。

CLSは華やかな最適化ではない。「ブラウザに場所を前もって教える」の一文で要約できる、その代わり守れば確実に報われる基本だ。そしてこれは性能指標である前に、礼儀の問題でもある。ユーザーが押そうとしたボタンが、逃げないようにすること。

---

構造化データをサーバーサイドで確実に出力することから、既存サイトのCore Web Vitals・アクセシビリティの実測点検まで、Web開発を実務として扱いながら、個人的に相談と実装のご依頼を受けています。ずれるレイアウトや遅いLCPのように「数字で捕まえるべき問題」が積もっているなら、プロフィールの連絡先から気軽にお問い合わせください。
