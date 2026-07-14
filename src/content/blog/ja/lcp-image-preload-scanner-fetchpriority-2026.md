---
title: 'ヒーロー画像は117KB、なのにLCPは1.2秒 — ブラウザが画像を「遅れて見つける」理由'
description: 'LCPが遅いのは画像が重いからではない。ブラウザがその画像を「いつ発見するか」の問題だ。CSS背景画像がプリロードスキャナに見えない現象をChrome DevToolsで実測し、fetchpriority・preload・レンダーブロッキング除去でLCP 1247msを109msまで落とした記録。'
pubDate: '2026-07-14'
heroImage: '../../../assets/blog/lcp-image-preload-scanner-fetchpriority-2026/hero.png'
tags:
  - Core Web Vitals
  - LCP
  - Web性能
  - レンダリング
relatedPosts:
  - slug: sitemap-lastmod-crawl-scheduling-2026
    score: 0.64
    reason:
      ko: 그 글은 크롤러가 sitemap의 어떤 필드를 읽고 무엇을 조용히 버리는지를 다뤘다. 이 글은 브라우저가 무엇을 일찍 발견하고 무엇을 늦게 그리는지를 다룬다. 둘 다 "당신이 내보낸 것을 상대가 언제 처리하는가"의 문제다.
      ja: あちらはクローラーがsitemapのどのフィールドを読み、何を静かに捨てるかの話。この記事はブラウザが何を早く発見し、何を遅れて描くかの話。どちらも「あなたが出したものを相手がいつ処理するか」だ。
      en: That post is about which sitemap fields a crawler reads and which it quietly discards. This one is about what the browser discovers early and paints late. Both ask the same thing, namely when the other side processes what you shipped.
      zh: 那篇讲爬虫读 sitemap 的哪些字段、又悄悄丢弃哪些。这篇讲浏览器早发现什么、晚绘制什么。两者问的是同一件事：你下发的东西，对方到底什么时候才处理。
  - slug: ai-crawlers-dont-render-javascript-csr-2026
    score: 0.68
    reason:
      ko: 렌더 차단 CSS가 페인트를 막는 이 글과 같은 뿌리다. 그쪽은 크롤러가 자바스크립트를 안 돌려 콘텐츠를 못 본다는 이야기고, 렌더링이 곧 가시성이라는 교훈이 겹친다.
      ja: レンダーブロッキングCSSがペイントを止める本記事と根が同じ。あちらはクローラーがJSを実行せずコンテンツを見られない話で、レンダリングこそ可視性という教訓が重なる。
      en: Same root as this render-blocking story. That post is about crawlers not running your JavaScript, and the lesson — rendering is visibility — carries straight over.
      zh: 与本文"渲染阻塞 CSS 拖住绘制"同源。那篇讲爬虫不执行 JS 就看不到内容，"渲染即可见性"的教训是相通的。
  - slug: a11y-lighthouse-audit-fix-2026
    score: 0.6
    reason:
      ko: 같은 Lighthouse·DevTools 계열 실측 워크플로우다. 접근성 점수를 눈으로 잡아 고쳤듯, 여기서는 LCP 분해를 눈으로 보고 병목을 하나씩 걷어낸다.
      ja: 同じLighthouse・DevTools系の実測ワークフロー。アクセシビリティのスコアを目で見て直したように、ここではLCP分解を見てボトルネックを一つずつ剥がす。
      en: The same Lighthouse/DevTools measure-then-fix workflow. Just as that post fixed a11y by reading the score, here we read the LCP breakdown and peel off bottlenecks one at a time.
      zh: 同属 Lighthouse / DevTools 的实测工作流。那篇靠读分数修无障碍，这篇靠读 LCP 分解逐个剥掉瓶颈。
---

ヒーロー画像を一枚だけ置いて、トレースを取ってみた。ファイルは117KBのPNG、ローカルでのダウンロードは5ミリ秒。ところが、そのページのLargest Contentful Paintは1,247ミリ秒だった。画像は5msで届いているのに、最大要素が描かれるまで1.2秒。残りの1,242msは、どこへ消えたのか。

答えは「画像が重い」ではない。ブラウザがその画像を**いつ探し始めたか**という問題だ。LCPを画像サイズの問題だとだけ捉えていると、この1.2秒の大半は永遠に取り戻せない。今回は同じヒーローを三通りの方法で配信しながら、Chrome DevToolsのトレースでLCPを分解した。ボトルネックがどこに隠れるかを、数字で確かめている。以下の表とログは、すべてそのサンドボックスから出た実測値だ。

## LCPは一つの数字ではなく、四つの区間だ

まず土台から。LCP(Largest Contentful Paint)は、ビューポート内で最も大きなコンテンツ要素 — たいていはヒーロー画像や大きな見出し — が画面に描かれた時刻を指す。Googleはこの値がページ読み込み開始から**2.5秒以内**に起きることを推奨している([Google Search Central, Core Web Vitals](https://developers.google.com/search/docs/appearance/core-web-vitals))。これは実ユーザーデータ(CrUX)の75パーセンタイル基準だ。

肝心なのはその先だ。LCPは単一の測定値に見えるが、web.devの[Optimize LCP](https://web.dev/articles/optimize-lcp)は、これを四つの区間に分解する。

- **TTFB**: サーバーが最初のバイトを返すまで
- **Load delay(読み込み遅延)**: ブラウザがLCPリソースを**発見してリクエストを始めるまで**
- **Load duration(読み込み時間)**: そのリソースを実際にダウンロードするのにかかった時間
- **Render delay(描画遅延)**: 受け取り終えてから、画面に描かれるまで

この四分割モデルが好きな理由はシンプルだ。「LCPが遅い」は診断ではなく症状にすぎない。四つの区間のどれが膨らんでいるかを見て、はじめて処方が決まる。そして遅いヒーローの多くは、Load duration(ダウンロード)ではなく**Load delay(発見)**で時間を溶かしている。以下がその証拠だ。

## 実測：背景画像として配信したヒーロー

一つ目のバージョンはありふれたパターンだ。ヒーローを`<img>`ではなく、CSSの`background-image`で敷いた。

```css
.hero {
  width: 100%;
  height: 600px;
  background-image: url("hero.png");
  background-size: cover;
}
```

```html
<link rel="stylesheet" href="style.css">
<div class="hero"></div>
```

計測環境はこうだ。ローカルのスレッド化HTTPサーバー、全レスポンスに`Cache-Control: no-store`(毎回取り直す)、そしてスタイルシートには1秒の遅延を仕込んだ。レンダーブロッキングCSSが遅い、という現実の状況を再現するための仕掛けだ。Chrome DevToolsの`performance`トレースをリロード付きで取った。結果はこうなる。

```text
LCP: 1247 ms
  TTFB:          8 ms
  Load delay: 1184 ms   ← ここ
  Load duration: 5 ms
  Render delay:  51 ms
DevTools インサイト: 「LCP request discovery」フラグ
```

Load delayが1,184ms。画像のダウンロードは5msなのに、ブラウザはそれを**発見するまで**に1.2秒を使った。なぜか。ヒーローのURLがCSSの中に隠れているからだ。

ここで一つ、重要な概念を。ブラウザには**プリロードスキャナ(preload scanner)**というものがある。HTMLのレスポンスバイトが届くと、メインパーサーが走る前に、このスキャナが生のHTMLを走査して`<img src>`や`<script src>`、`<link href>`といったリソースを先回りで発見し、リクエストを前倒しする。問題は、このスキャナがHTMLしか見ないことだ。**CSS内の`background-image`のURLは、スキャナには見えない**([web.dev, Don't fight the browser preload scanner](https://web.dev/preload-scanner/))。だから背景画像は、CSSがダウンロードされてパースされるまでリクエストすら始まらない。私の実験ではCSSに1秒を仕込んであるので、ヒーローはきっちりその分だけ遅れて発見された。Chrome自身がこれを「LCP request discovery」インサイトとして名指しで指摘してくれた([LCP discovery, Chrome for Developers](https://developer.chrome.com/docs/performance/insights/lcp-discovery))。

この現象は、[AIクローラーがJavaScriptを実行せずコンテンツを見られないという話](/ja/blog/ja/ai-crawlers-dont-render-javascript-csr-2026)と根が同じだ。リソースがどこにどう置かれたかが、それがいつ(あるいはそもそも)処理されるかを決める。

## fetchpriorityとpreloadを掛けた — なのにLCPは動かない

二つ目のバージョン。ヒーローを本物の`<img>`に変え、`fetchpriority="high"`を付け、`<head>`にpreloadヒントまで入れた。

```html
<link rel="preload" as="image" href="hero.png" fetchpriority="high">
...
<img src="hero.png" alt="Product launch hero"
     width="1200" height="600" fetchpriority="high">
```

`fetchpriority="high"`は、ブラウザに「このリソースは他より先に、高い優先度で取ってこい」と伝えるヒントだ([web.dev, Fetch Priority API](https://web.dev/articles/fetch-priority))。なぜ必要か。ブラウザはレイアウト前の段階では画像が画面のどこに来るか分からないので、たいていの画像を最初は低い優先度に置く。ヒーローだろうがフッターの飾りアイコンだろうが、初期の扱いは同じというわけだ。`fetchpriority="high"`は、そのうちの一枚 — ヒーロー — だけを手で引き上げる。`<img>`に変えたので、URLはHTMLの中にある。プリロードスキャナはこれを即座に見つける。計測値は。

```text
LCP: 1226 ms
  TTFB:          3 ms
  Load delay:   37 ms   ← 1184から37へ急落
  Load duration: 2 ms
  Render delay: 1185 ms  ← 今度はここが膨らんだ
```

Load delayが1,184ms → 37msへ崩れた。発見の問題は完璧に解けた。画像はナビゲーションから42msの時点で、もう受信し終えている。ところが**LCPは1226msでほぼそのまま**だ。正直、この結果を最初に見たとき一瞬固まった。発見を30倍速くしたのに最終指標が動かないなら、何かを見落としている。

ボトルネックが移動したのだ。今度はRender delayが1,185msを食う。画像は42msで用意できたのに、**画面に描けない**。レンダーブロッキングのスタイルシート(私が1秒仕込んだ、あれ)がまだ届いていないからだ。ブラウザはCSSが到着して最初のペイントができるようになるまで、何も描かない。画像が手元にあっても、筆を持てない。

これが、この記事で一番言いたいことだ。**fetchpriorityとpreloadは必要条件であって、十分条件ではない。** この二つは「発見」のボトルネックを消す。だがLCP分解の残り三区間のどれかが膨らんでいれば、発見をいくら前倒ししても、最終の数字はその分しか動かない。四区間を見ずにfetchpriorityだけ撒くと、「良くなった」と錯覚しやすい。

## レンダーブロッキングまで剥がすと、LCP 1247 → 109ms

三つ目のバージョン。上の`<img fetchpriority>`はそのままに、今度はレンダーブロッキングを消した。ヒーローが見えるのに最低限必要なCSS(クリティカルCSS)だけを`<style>`でインライン化し、残りのスタイルシートはペイントを止めないように読み込む。

```html
<style>
  .herowrap{width:100%;height:600px;overflow:hidden}
  .herowrap img{width:100%;height:600px;object-fit:cover}
</style>
<link rel="stylesheet" href="style.css"
      media="print" onload="this.media='all'">
```

`media="print"`にしておくと画面描画を止めず、`onload`で`all`に切り替えて実際に適用する。よく使われる非ブロッキングCSS読み込みのパターンだ。計測値は。

```text
LCP: 109 ms
  TTFB:          5 ms
  Load delay:   43 ms
  Load duration: 1 ms
  Render delay:  60 ms
```

1,247msから109msへ。三区間がすべて二桁に落ち着いた。発見も速く(43ms)、描くのを止めるものもない(Render delay 60ms)。三バージョンを並べるとこうなる。

| ヒーローの配信方法 | Load delay(発見) | Render delay | LCP |
|---|---|---|---|
| CSS `background-image` | 1,184 ms | 51 ms | 1,247 ms |
| `<img fetchpriority>` + preload | 37 ms | 1,185 ms | 1,226 ms |
| + クリティカルCSSインライン(非ブロッキング) | 43 ms | 60 ms | **109 ms** |

一つの数字だけ直したときはボトルネックが横へ逃げ、二つのボトルネックを両方潰したとき、ようやく指標が崩れた。この表が、四分割モデルの値打ちをそのまま示している。

![三つのヒーロー配信方法ごとのLCP分解スタック棒グラフ — Chrome DevToolsトレースの実測値。background-imageはLoad delay 1184ms、fetchpriority+preloadはRender delay 1185ms、クリティカルCSSインラインはLCP 109ms](../../../assets/blog/lcp-image-preload-scanner-fetchpriority-2026/lcp-breakdown.png)

## では、開発者が今日やること(チェックリスト)

上の実験を実務のアクションに移すとこうなる。

1. **ヒーローはCSS背景ではなく、HTMLの`<img>`で配信する。** プリロードスキャナが見て、はじめて早く発見される。デザイン上どうしても背景にする場合は、`<link rel="preload" as="image" href="..." fetchpriority="high">`でスキャナの代わりに発見を前倒しする([web.dev preload-scanner](https://web.dev/preload-scanner/))。
2. **LCP画像に`fetchpriority="high"`を付ける。** ブラウザは初期に画像を低優先度で扱うことが多い。ヒーローだけを上げる。
3. **LCP画像に`loading="lazy"`は絶対に付けない。** フォールド下の画像には有効だが、ビューポート最上部のヒーローに掛けると、自ら発見を遅らせる自傷行為になる([web.dev, LCPの誤解](https://web.dev/blog/common-misconceptions-lcp))。
4. **クリティカルCSSをインライン化し、残りは非ブロッキングに。** 画像を早く受け取っても、レンダーブロッキングCSSがあれば描けない。
5. **`width`/`height`(または`aspect-ratio`)を必ず明示する。** レイアウトシフト(CLS)を防ぐ。上の実験ではCLSは三バージョンとも0.00だった。
6. **何より、LCP分解を先に読む。** DevToolsのPerformanceパネルがTTFB / Load delay / Load duration / Render delayをそのまま見せてくれる。一番大きい区間から潰す。この計測ワークフロー自体は、[Lighthouseでアクセシビリティのスコアを直接直した記事](/ja/blog/ja/a11y-lighthouse-audit-fix-2026)でさらに掘り下げた。

## 正直な限界 — この数字を誤読しないこと

私の実験値は**ラボ(lab)の数字**だ。ローカルサーバー、ネットワークスロットルなし、CPU等倍。スタイルシートに掛けた1秒の遅延も、効果を目に見えるようにするために私が人為的に入れた値だ。だから「1247 → 109」という倍率を、あなたのサイトにそのまま当てはめないでほしい。これらの数字は**メカニズムを見せる実演**であって、あなたが期待できる絶対的な改善幅ではない。実際にGoogleが順位に使うのはCrUXのフィールド(実ユーザー)データで、改善幅はあなたのページの本物のクリティカルパス次第だ。

二つ目、もっと重要な限界。**LCPを2.5秒以内に入れても、検索順位が上がる保証はない。** Googleは公式文書で「単一の順位シグナルは存在しない」と明言し、ページ体験が良くても「優れた関連性の高いコンテンツを代替しない」と記している([Google Search Central](https://developers.google.com/search/docs/appearance/core-web-vitals))。Core Web Vitalsは多くのシグナルの一つにすぎない。私はLCP最適化を「順位のレバー」ではなく「離脱を減らすUXの仕事」として売るのが誠実だと思う。速いページはユーザーが離れないから良いのであって、それ自体が上位表示を買ってくれるわけではない。

ここで、再現中に私を二度だました落とし穴も正直に書いておく。最初はPythonのシングルスレッドサーバーを使ったのだが、`fetchpriority`版は画像を早く発見しているのにLCPが下がらなかった。サーバーが1秒のCSSを返すのにブロックされている間、早く発見された画像リクエストがその後ろに並んでしまったのだ。実際のHTTP/2オリジンならマルチプレクシングで同時に降りてきたはずのものを、サーバーのアーティファクトが本当の効果を覆い隠していた。スレッド化サーバーに変えて、ようやく数字が正直になった。二つ目の落とし穴はキャッシュだ。`no-store`を掛けずにいたら、ブラウザが前回実行のCSSをディスクキャッシュから引っ張り出し、1秒の遅延が消え、「before」のペナルティが丸ごと蒸発した。計測を信じる前に、まず計測環境を疑うべきだと改めて学んだ。

三つ目。preloadも乱発すれば毒になる。何でもかんでもpreloadで高い優先度を与えると、肝心なリソースの帯域を奪い、条件によっては画像を二度取りすることもある。preloadは**LCP要素ただ一つ**にだけ、惜しんで使うのが原則だ。

この記事を一文にまとめるとこうだ。LCPが遅いなら、まず画像サイズを疑うのではなく、ブラウザがそれをいつ発見していつ描くのか — 四つの区間を先に開いてみること。ボトルネックはたいてい、ダウンロードではなく、発見とレンダーブロッキングに隠れている。多言語ブログを実際に監査してレンダーブロッキングリソースを剥がした[技術SEO監査の記録](/ja/blog/ja/multilingual-blog-technical-audit-campaign-2026)でも、同じ結論にたどり着いた。

---

*構造化データをサーバーサイドで確実に出力したい、あるいは既存サイトのCore Web Vitals・アクセシビリティ・クローラー対応を実測で点検したい — そんなときは個人的に相談・実装のご依頼をお受けしている。プロフィールの問い合わせ経路から気軽に連絡いただければと思う。*
