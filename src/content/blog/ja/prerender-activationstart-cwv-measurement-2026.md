---
title: 'prerenderを入れたらLCPが6.2秒になった — activationStartを引かないRUMは嘘をつく'
description: Speculation Rulesでページを先読みすると、LCPの生値に待ち時間がまるごと乗る。Chrome 150で6244msと103.5msの差を実測し、補正すべき箇所を整理した。
pubDate: '2026-07-28'
heroImage: ../../../assets/blog/prerender-activationstart-cwv-measurement-2026/hero.png
tags:
  - performance
  - core-web-vitals
  - web-development
  - chrome
relatedPosts:
  - slug: lcp-image-preload-scanner-fetchpriority-2026
    score: 0.78
    reason:
      ko: "저 글은 LCP를 실제로 앞당기는 법이고, 이 글은 그렇게 앞당긴 LCP가 대시보드에 잘못 찍히는 경로다. 개선과 계측은 따로 검증해야 한다."
      ja: "あちらはLCPを実際に早める話、こちらは早めたLCPがダッシュボードに誤って載る話。改善と計測は別々に検証しないといけない。"
      en: "That post makes LCP genuinely faster; this one covers how that faster LCP can still land wrong in your dashboard. Improvement and measurement need separate proof."
      zh: "那篇讲怎样真正把 LCP 提前，这篇讲提前之后它为何仍会在看板上记错。优化和计量得分开验证。"
  - slug: websocket-bfcache-eligibility-remeasure
    score: 0.72
    reason:
      ko: "bfcache 복원도 prerender 활성화도, 브라우저가 페이지 수명주기를 건드리면 계측 기준점이 흔들린다. 저기선 복원 여부가, 여기선 시작 시각이 문제였다."
      ja: "bfcache復元もprerender活性化も、ブラウザがページのライフサイクルに手を入れると計測の基準点がぶれる。あちらは復元の可否、こちらは開始時刻が争点。"
      en: "Both bfcache restores and prerender activations move the ground under your metrics when the browser rewrites the page lifecycle. There the question was whether it restored; here it's when the clock started."
      zh: "无论 bfcache 恢复还是 prerender 激活，浏览器一改动页面生命周期，计量基准就会漂移。那边问的是能否恢复，这边问的是计时从何时开始。"
  - slug: axe-core-ci-a11y-jsdom-vs-browser-2026
    score: 0.68
    reason:
      ko: "테스트 환경이 조용히 거짓 음성을 내는 같은 함정이다. 저기선 jsdom이 위반을 못 봤고, 여기선 Playwright가 prerender 자체를 일으키지 못했다."
      ja: "テスト環境が静かに偽陰性を返すという同じ罠。あちらはjsdomが違反を見落とし、こちらはPlaywrightがprerenderそのものを起こせなかった。"
      en: "The same trap in a different guise: a test environment quietly returning a false negative. There jsdom missed real violations; here Playwright never triggered the prerender at all."
      zh: "同一个陷阱的两副面孔：测试环境悄悄给出假阴性。那边是 jsdom 漏掉真实违规，这边是 Playwright 根本没能触发预渲染。"
  - slug: content-visibility-auto-render-cost-measure-2026
    score: 0.6
    reason:
      ko: "렌더링 비용을 뒤로 미루는 기법과 아예 앞으로 당기는 기법. 방향은 반대인데 둘 다 '언제를 0으로 볼 것인가'라는 같은 질문에 걸린다."
      ja: "レンダリングコストを後ろにずらす手法と、まるごと前倒しする手法。向きは逆だが、どちらも「どこを0とみなすか」という同じ問いにぶつかる。"
      en: "One technique defers rendering cost, the other pulls it forward. Opposite directions, same underlying question: which moment counts as zero?"
      zh: "一个把渲染成本往后推，一个把它整体提前。方向相反，却撞上同一个问题：把哪一刻当作零点。"
---

この実験は一度、まるごと失敗している。Playwrightでprerenderを起こそうとして三回試し、三回とも起きなかった。規則は正しく解析されているのに、先読みが始まらない。

原因を追ううちに、本題のほうがずっと重いことに気づいた。prerenderは正常に動いたときこそ、計測を静かに壊す。同じ一回のナビゲーションで、ユーザーが実際に待った時間は103.5msだった。LCPエントリの生の`startTime`は6244msだった。どちらをダッシュボードに送るかで、そのページは「良好」にも「不良」にもなる。

![Prerendered LCP: raw timing lies by about 6 seconds — measured across four Chrome launch configurations](../../../assets/blog/prerender-activationstart-cwv-measurement-2026/hero.png)

## prerenderとは何で、なぜ時計が二本になるのか

先に土台を固めておく。結論が狭いので、概念がないと数字だけが宙に浮く。

Speculation Rules APIは、ユーザーが次に行きそうなページをブラウザに先読みさせる標準だ。ドキュメントにこのスクリプトブロックを置く。

```html
<script type="speculationrules">
{
  "prerender": [
    { "urls": ["/next.html"], "eagerness": "immediate" }
  ]
}
</script>
```

`prefetch`が応答のバイト列だけ取り置くのに対し、`prerender`はもう一歩踏み込む。ブラウザは見えない場所でそのページを**完全にレンダリングする**。HTMLを解析し、スクリプトを実行し、レイアウトを組み、サブリソースを取る。ユーザーが実際にそのリンクへ移動すると、ブラウザは読み込み直さず、用意済みの文書を**アクティブ化（activate）**する。画面の切り替わりはほぼ即座だ。

ここで時計が割れる。文書の`performance`タイムラインの原点は、ユーザーがクリックした瞬間ではなく**prerenderが始まった瞬間**である。ユーザーが6秒後に移動したなら、その文書にとってアクティブ化はt+6000ms付近の出来事だ。そして最初のペイントはアクティブ化のあとにしか来ない。prerender中は何も描かれないからだ。

だからLCPエントリの`startTime`は「ユーザーが待った時間」ではなく「prerenderが始まってから流れた時間」になる。そこにはユーザーがまだリンクを押していない、純粋な待機時間がまるごと含まれている。

ブラウザはこの差を埋める値を一つ用意している。`PerformanceNavigationTiming.activationStart`だ。Chrome公式ドキュメントの記述はこうなっている。"Once a prerendered document is activated, `PerformanceNavigationTiming`'s `activationStart` will also be set to a non-zero time representing the time between when the prerender was started and the document was actually activated."（出典: [Prerender pages in Chrome for instant page navigations](https://developer.chrome.com/docs/web-platform/prerender-pages)）

ユーザーの体感時間は、生値からこれを引いたものになる。

## 6244msと103.5msを実際に切り分ける

一時ディレクトリに静的サーバーを立てた。入口ページAは対象ページBへのprerender規則を持ち、6秒後にスクリプトでBへ遷移する。6秒は私が決めた間隔だ。ユーザーがリンクの前で迷う時間を大きめに取り、差を目に見えるようにした。

対象ページBは自分の計測結果を`navigator.sendBeacon`でサーバーへ投げ返す。ブラウザ自動化ツールを使わなかった理由は後で述べる。

```js
const nav = () => performance.getEntriesByType('navigation')[0];

new PerformanceObserver((list) => {
  for (const e of list.getEntries()) {
    const a = nav()?.activationStart ?? 0;
    send({ event: 'LCP', raw: e.startTime, activationStart: a,
           corrected: Math.max(e.startTime - a, 0) });
  }
}).observe({ type: 'largest-contentful-paint', buffered: true });
```

Chrome 150.0.7871.187をそのまま起動してAへ送った。サーバーに溜まったログがこれだ。

```json
{"event":"script-eval","prerendering":true,"activationStartAtEval":0}
{"event":"nav-timing","activationStart":0,"type":"navigate",
 "domContentLoadedEventStart":46.8,"loadEventStart":47.7,"responseEnd":0.1}
{"event":"activated","perfNow":6186.8,"activationStart":6136.9}
{"event":"FCP","raw":6244,"activationStart":6136.9,"corrected":107.1}
{"event":"LCP","raw":6244,"activationStart":6136.9,"corrected":107.1}
```

読むべきものは四行に出揃っている。

`document.prerendering`はスクリプト評価の時点で`true`。文書はバックグラウンドで生きていた。`domContentLoadedEventStart`が46.8ms、`loadEventStart`が47.7ms。この二つは**prerenderの最中に発火している**。ユーザーはまだそのページを見てすらいないのに、読み込みは終わっていた。

アクティブ化は6136.9msの地点で起きた。FCPとLCPは6244msに記録された。引けば107.1msだ。

ここははっきりさせておきたい。この実験でprerenderは正常に、しかも非常によく効いた。ユーザーが実際に待ったのは0.1秒である。問題は、その事実が計測値にそのまま現れないことのほうだ。

![Two clocks after activation: which value each API reports for the same prerendered navigation](../../../assets/blog/prerender-activationstart-cwv-measurement-2026/two-clocks.png)

## activationStartはアクティブ化まで0を返す

ログの二行目をもう一度見てほしい。その時点の`activationStart`は**0**だった。

これはバグではなく仕様だ。WICGのprerendering仕様は、すべてのDocumentがアクティブ化開始時刻を持ち、その初期値がゼロであると定めている（[Prerendering Revamped](https://wicg.github.io/nav-speculation/prerendering.html)）。アクティブ化が実際に起きて初めて値が入る。

実務でこれがなぜ罠になるか。計測コードをこう書いているチームは多い。ロード時点でナビゲーションエントリを一度読んで変数に持ち、あとは指標が出るたびにその変数を使う。

```js
// prerenderされたページで静かに壊れる書き方
const activationStart = performance.getEntriesByType('navigation')[0].activationStart;
// ... ずっと後で ...
report('LCP', lcpEntry.startTime - activationStart);   // activationStartは0のまま固まっている
```

私のログで`load`直後にスナップショットを取った値は、まさに0だった。その後6秒経ってアクティブ化が起き、値は6136.9に変わる。しかし変数に写した側は永久に0だ。補正するはずのコードが、一切補正しないまま「補正した」と信じ込む状態になる。

規則は単純だ。**`activationStart`は報告する瞬間に読む**。スクリプト評価時でも、`DOMContentLoaded`でも、`load`でもない。

同じ理由で、ビーコンの送信自体もアクティブ化以降に遅らせる必要がある。Chromeのドキュメントもこの点に触れている。"However—particularly when using the Speculation Rules API—prerendered pages may have an impact on analytics and site owners may need to add extra code to only enable analytics for prerendered pages on activation, as not all analytics providers may do this by default."（出典: [Prerender pages in Chrome for instant page navigations](https://developer.chrome.com/docs/web-platform/prerender-pages)）

## 四つの起動条件での実測と、web-vitalsの扱い

一回測って結論を出すのは危うい。起動条件を変えて四回回した。今度は自作のオブザーバーではなく[web-vitals](https://github.com/GoogleChrome/web-vitals) v5.1.0をそのまま載せている。

| 起動条件 | navigationType | TTFB | FCP | LCP | LCPの生startTime | activationStart |
|---|---|---|---|---|---|---|
| 通常起動 | `prerender` | 0 | 103.5 | 103.5 | 6240 | 6136.5 |
| `--enable-automation` | `prerender` | 0 | 106.5 | 106.5 | 6244 | 6137.5 |
| `--remote-debugging-port` | `prerender` | 0 | 109.9 | 109.9 | 6252 | 6142.1 |
| `--incognito` | `prerender` | 0 | 96.9 | 96.9 | 6220 | 6123.1 |

（単位はms。条件ごとに1回の測定なので、ミリ秒単位のばらつきに意味は持たせない。見るべきは列と列のあいだの桁の違いだ。）

四回とも、ライブラリが報告するLCPは100ms前後、生の`startTime`は6.2秒台。補正はライブラリが勝手にやっている。`node_modules`に入っているv5.1.0のソースを開くと、LCPとFCPは`Math.max(entry.startTime - activationStart, 0)`で値を作り、TTFBは`Math.max(responseStart - activationStart, 0)`を使う。そして`document.prerendering`が真、または`activationStart`が0より大きければ`navigationType`に`'prerender'`を立てる。

TTFB列がすべて0なのも同じ式の帰結だ。prerenderされた文書の`responseStart`はアクティブ化よりはるか手前にあるので、引くと負になり、`Math.max`が0で切る。これは誤りではない。ユーザーから見ればそのバイトはもう届いていたのだから、待ち時間は本当にゼロに近い。ただしこの値がフィールドデータに混ざると、TTFBの分布はまるごと左へずれる。集計時に`navigationType`で分けなければ、原因のわからない「改善」を前に振り返り会をやる羽目になる。

実際に送るコードはこの形になる。アクティブ化を待ち、補正はライブラリに任せ、ナビゲーション種別をタグとして添える。

```js
import { onLCP, onFCP, onINP, onCLS, onTTFB } from 'web-vitals';

function whenActivated(fn) {
  if (document.prerendering) {
    document.addEventListener('prerenderingchange', () => fn(), { once: true });
  } else {
    fn();
  }
}

whenActivated(() => {
  const send = (m) => navigator.sendBeacon('/rum', JSON.stringify({
    metric: m.name,
    value: m.value,              // activationStartは既に引かれている
    rating: m.rating,
    navType: m.navigationType,   // 'prerender'なら集計で分ける
  }));
  [onTTFB, onFCP, onLCP, onINP, onCLS].forEach((fn) => fn(send));
});
```

肝は`navType`を捨てないことだ。このフィールドさえ残っていれば、「prerenderの比率が上がって良くなった」のか「ページが本当に速くなった」のかを後から切り分けられる。無ければ切り分ける手段がない。

もう一点。表に載っていない値がある。`domContentLoadedEventStart`の46.8msは**いかなる補正も受けない**。Navigation Timingのマークは依然としてprerender開始が基準のままだ。補正済みのLCPと未補正の「読み込み完了時間」を同じダッシュボードに並べれば、二つの数字は違う時計を読んでいることになる。このズレは[リソース優先度を触ってLCPを前倒しする作業](/ja/blog/ja/lcp-image-preload-scanner-fetchpriority-2026)の効果を検証するとき、とりわけ厄介になる。動いた分だけ動いたのかを判定する基準線が揺れるからだ。

## Playwrightではこの実験自体が成立しなかった

冒頭に戻る。三回とも`document.prerendering`は`false`、`activationStart`は0、`navigationType`は`navigate`。prerenderが起きていない。規則の書き方を疑い、CDPの`Preload`ドメインを繋いで確認した。

```json
{"ev":"Preload.preloadEnabledStateUpdated","d":{
  "disabledByPreference":false,"disabledByDataSaver":false,"disabledByBatterySaver":false,
  "disabledByHoldbackPrefetchSpeculationRules":false,
  "disabledByHoldbackPrerenderSpeculationRules":false}}
{"ev":"Preload.ruleSetUpdated","d":{"ruleSet":{"id":"49930.0", ... }}}
{"ev":"Preload.preloadingAttemptSourcesUpdated","d":{"preloadingAttemptSources":[
  {"key":{"action":"Prerender","url":"http://127.0.0.1:8899/next.html"}, ... }]}}
```

規則は正常に解析されている。試行も登録されている。無効化されている項目は一つもない。それなのに`prerenderStatusUpdated`イベントは**一件も来なかった**。開始すらしていない。

原因を絞ろうと、起動フラグを一つずつ切り分けた。Playwrightが付ける`--disable-features`のリストを丸ごとコピーしてChromeを直接起動してみると、prerenderは正常に動く。怪しいと踏んだ`RenderDocument`だけを切った場合も、`OptimizationHints`だけを切った場合も動いた。`--enable-automation`も`--remote-debugging-port`も`--incognito`も、すべて動いた。

正直に書くと、原因は特定しきれていない。フラグは犯人ではなかった。同じバイナリでも、Playwrightが**実際に駆動しているときだけ**prerenderが抑制される。それ以上は今回の実行時間内では詰められなかった。

ただし実務に必要な結論はもう出ている。**Speculation RulesをPlaywrightやPuppeteerで検証してはいけない**。規則が正しくても「動いていません」という偽陰性が返る。これは[jsdomでaxe-coreを回して実際の違反を取りこぼした件](/ja/blog/ja/axe-core-ci-a11y-jsdom-vs-browser-2026)とまったく同じ種類の罠だ。テスト環境が、静かに、しかも緑のランプで間違った答えを返す。

結局使った手は二つ。一つはこの記事のハーネスのように、ページ自身に`sendBeacon`で結果を投げ返させ、Chromeはただ起動するだけにすること。もう一つはChromeのドキュメントが薦める手軽な確認法だ。"The easiest way to see if a page was prerendered (either in full or partially) is to open DevTools after the page is activated and type `performance.getEntriesByType('navigation')[0].activationStart` in the console."（出典: [Prerender pages in Chrome for instant page navigations](https://developer.chrome.com/docs/web-platform/prerender-pages)）

## この測定が言っていないこと

期待値を削っておく場所だ。

条件ごとに1回の測定である。ローカルマシン1台で、ローカルサーバーを相手に測った。ミリ秒単位の数字はベンチマークではなく、仕組みを見せるためのものだ。6秒という間隔も私がスクリプトで作った値で、実ユーザーの逡巡とは関係がない。ただしその間隔が長いほど、未補正の値の誤差もきっちり同じだけ大きくなる。

prerenderを効かせたページと素で開いたページの速度も比較していない。対照として同じページを直接開いたときのLCPは532msだったが、その値には新しいプロファイルでウィンドウを立ち上げるコストが混ざっている。同条件の比較ではないので、「prerenderで5倍速い」といった言い方はこのデータからはできない。

そしてこれはChromeの話だ。SafariとFirefoxはSpeculation Rulesによるprerenderを出荷していない。ユーザーの半分がそれらのブラウザなら、この補正ロジックが効くのも半分だけになる。

最後に順位の話はしない。prerenderはランキング要因ではないし、本稿のどの内容も検索成果を保証しない。ここで扱ったのはユーザーの体感と、それを正確に測る方法だけだ。Core Web Vitalsについて、Chromeのドキュメントはこう書いている。"For Core Web Vitals, measured by Chrome through the Chrome User Experience Report, these are intended to measure the user experience."（出典: [Prerender pages in Chrome for instant page navigations](https://developer.chrome.com/docs/web-platform/prerender-pages)）測る対象はユーザー体験であって、文書の内部時計ではない。

## まとめ: アクティブ化時刻を引いてから数字を信じる

Speculation Rulesを入れる前に、計測側を先に直す。順番を逆にすると、改善を退行として読み違える。

チェックリストは六行だ。

1. 自作の`PerformanceObserver`ではなくweb-vitals v5以降を使う。どうしても自作するなら、LCP・FCP・TTFBのすべてに`Math.max(value - activationStart, 0)`を当てる。
2. `activationStart`は**報告するその瞬間に**読む。ロード時点で変数に固定しない。
3. 解析の初期化とビーコン送信は、`document.prerendering`を見て`prerenderingchange`まで遅らせる。
4. RUMの集計を`navigationType === 'prerender'`で分離する。混ぜるとTTFBが0に寄り、LCPが不自然に良く見える。
5. `domContentLoadedEventStart`や`loadEventStart`といったNavigation Timingのマークは補正されない。この点をダッシュボードに明記し、補正済み指標と並べない。
6. Speculation Rulesの動作確認は、ブラウザ自動化ツールではなく、ページ自身が結果を投げ返すハーネスかDevToolsのApplicationパネルで行う。

この六つはprerenderを使っていないサイトでも無害だ。今のうちに入れておけば、導入した日にダッシュボードが揺れない。

RUMのパイプラインがprerenderやbfcacheのようなページライフサイクルの変化をきちんと反映できているか確かめたい場合や、Core Web Vitalsの計測設計をやり直す必要がある場合は、個人で相談と実装の依頼を受けている。[プロフィール](/ja/about)に連絡先を置いてある。
