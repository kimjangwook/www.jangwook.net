---
title: 'unloadは弾かれ、beforeunloadは通った: bfcache実測6本'
description: 「戻る」が一瞬で開くかどうかは好みではなく計測対象だ。阻害要因を一つずつだけ仕込んだページを6枚用意し、実際にback遷移をかけてpageshow.persistedとnotRestoredReasonsを受け取った。unloadは弾かれ、beforeunloadとno-storeは通った。
pubDate: '2026-07-21'
updatedDate: '2026-07-24'
heroImage: ../../../assets/blog/bfcache-notrestoredreasons-audit-2026/hero.png
tags:
  - performance
  - core-web-vitals
  - web-development
  - chrome
relatedPosts:
  - slug: content-visibility-auto-render-cost-measure-2026
    score: 0.79
    reason:
      ko: "저 글은 최초 렌더링에서 브라우저가 얼마를 쓰는지를 쟀다. 이 글은 그다음, 뒤로 가기로 돌아올 때 그 비용을 아예 내지 않는 경로를 다룬다."
      ja: "あちらは初回レンダリングでブラウザがいくら払うかを測った回。こちらは戻る操作でその支払いを丸ごと省く経路の話。"
      en: "That one measures what the browser spends on first render. This one is about the path where a back navigation skips that bill entirely."
      zh: "那篇量的是首次渲染浏览器要花多少。这篇讲的是后退时如何把这笔账整个免掉。"
  - slug: validate-structured-data-ci-jsonld-2026
    score: 0.71
    reason:
      ko: "실측한 것을 CI 게이트로 굳히는 절차가 궁금하다면 저 글이 원형이다. 여기서 만든 bfcache 프로브도 같은 방식으로 배포마다 돌릴 수 있다."
      ja: "実測をCIゲートに固める手順の原型があちら。本稿のbfcacheプローブも同じ形でデプロイごとに回せる。"
      en: "The template for turning a measurement into a CI gate lives there. The bfcache probe from this post drops into the same shape."
      zh: "把测量固化成 CI 关卡的做法在那篇。本文的 bfcache 探针可以套进同一个模子。"
  - slug: ai-crawlers-dont-render-javascript-csr-2026
    score: 0.64
    reason:
      ko: "이쪽은 사람이 뒤로 갈 때 무엇이 복원되는가, 저쪽은 크롤러가 처음 올 때 무엇이 보이는가. 렌더링 시점이 누구의 것인지가 갈리는 두 사례다."
      ja: "こちらは人が戻るとき何が復元されるか、あちらはクローラーが来たとき何が見えるか。レンダリングの時点が誰のものかで分かれる二例。"
      en: "This post asks what survives when a human presses back; that one asks what exists when a crawler arrives. Same rendering timeline, different audience."
      zh: "这篇问人按下后退时什么被复原，那篇问爬虫到达时什么才存在。同一条渲染时间线，两种读者。"
  - slug: wcag22-target-size-audit-2026
    score: 0.55
    reason:
      ko: "자동 도구의 초록불이 통과를 뜻하지 않는다는 점에서 짝이 되는 글이다. 저기서는 점수가, 여기서는 'masked'가 사람의 판단을 요구했다."
      ja: "自動ツールの緑が合格を意味しないという点で対になる。あちらはスコアが、こちらは「masked」が人の判断を要求した。"
      en: "A companion piece on green automated results that aren't a pass. There it was the score; here it's \"masked\"."
      zh: "同样是自动工具亮绿灯却不等于合格。那边是分数，这边是「masked」。"
---

`beforeunload` を登録したページは、戻る操作でメモリからそのまま復元された。`unload` を登録したページは復元されなかった。違いは識別子ひとつ。

この二つを「離脱時の後始末」という一つの引き出しに放り込んでいるコード。実際、よく見る。だから阻害候補を一つずつだけ仕込んだページを6枚作り、それぞれに本物のback遷移をかけて、ブラウザが何を返すかを受け取った。以下がその6本の記録である。

## ネットワークに一度も触れない「戻る」

back/forward cache(bfcache)は、ユーザーがページを離れるときにそれを破棄せず、まるごとメモリに凍結しておくブラウザの機能だ。DOMもJavaScriptヒープもスクロール位置も残る。戻るを押すと、そのスナップショットが解凍される。web.dev の公式な説明はこうだ。"Instead of destroying a page when the user navigates away, we postpone destruction and pause JS execution." そして結果として "Loading the previous page is essentially instant, because the entire page can be restored from memory, without having to go to the network at all."

重いのは最後の一節である。HTTPキャッシュが効いた通常の戻る操作でも、文書は再パースされ、スクリプトは再実行され、レイアウトは再計算される。bfcacheからの復元はその全部を飛ばす。再計算がないので、LCPもレイアウトシフトも新たには発生しない。

なぜ今これを気にするのか。検索結果から入って1ページ読み、戻って次の結果へ移る。この往復はスマートフォンでとりわけ多い。往復のたびにフルロードが走るなら、初回表示がどれだけ速くてもユーザーは「遅い戻る」を繰り返し体験する。しかもこの改善は新しくコードを書く話ではない。<strong>すでに動いているコードから、資格を失わせている要素を取り除く</strong>種類の作業だ。手数に対する見返りは大きい部類に入る。

先に期待値を削っておく。bfcacheは順位要因ではない。これを直したから検索順位が上がるという保証はどこにもないし、私もそう主張しない。あくまで実際の利用者が感じる遷移の体感の話である。

そして、この状態は推測しなくていい。ブラウザが二つのAPIで答えを返す。

- `pageshow` イベントの `event.persisted`。`true` ならbfcacheからの復元。
- `PerformanceNavigationTiming.notRestoredReasons`。復元<strong>されなかった</strong>ときに理由が入る。Chromeのドキュメントによれば "The `notRestoredReasons` API has shipped from Chrome 123 and is being rolled out gradually."

## 変数を一つに絞った6枚

条件を混ぜると結果を読めなくなる。そこでローカルサーバーのルートを分け、各ページが<strong>阻害候補をちょうど一つだけ</strong>持つようにした。マークアップも計測スクリプトも残りは全部同じだ。

```js
// server.mjs — 条件ごとに1ルート
const page = (title, body, extraHead = '') => `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>${title}</title>${extraHead}</head>
<body><h1>${title}</h1>${body}
<script>
window.addEventListener('pageshow', (e) => {
  const nav = performance.getEntriesByType('navigation')[0];
  window.__bfcache = {
    persisted: e.persisted,
    nrr: nav && nav.notRestoredReasons
      ? JSON.parse(JSON.stringify(nav.notRestoredReasons))
      : null,
  };
});
</script></body></html>`;

const routes = {
  '/clean':        () => ({ headers: {}, html: page('clean', '<p>no blockers</p>') }),
  '/nostore':      () => ({ headers: { 'Cache-Control': 'no-store' }, html: page('nostore', '') }),
  '/unload':       () => ({ headers: {}, html: page('unload', '',
                      '<script>window.addEventListener("unload", function(){});</script>') }),
  '/beforeunload': () => ({ headers: {}, html: page('beforeunload', '',
                      '<script>window.addEventListener("beforeunload", function(e){});</script>') }),
  '/websocket':    () => ({ headers: {}, html: page('websocket', '',
                      '<script>window.__ws = new WebSocket("ws://127.0.0.1:8099");</script>') }),
  '/next':         () => ({ headers: {}, html: page('next', '<p>second page</p>') }),
};
```

計測スクリプトで `JSON.parse(JSON.stringify(...))` を挟んでいるのには理由がある。`notRestoredReasons` が返すのは素直なオブジェクトではなく、そのままログに流すと `[object Object]` しか残らない。初回の実行はこれで一度空振りした。

手順は6本とも同じ。対象ページを開く。`/next` へ移動する。履歴を戻す。復元されたページで `window.__bfcache` を読む。ブラウザはmacOS上のChrome 150で、手ではなくDevToolsプロトコル経由で操作した。最後の1本だけはローカルのサンドボックスではなく、実際に運用しているこのブログの記事ページを対象にしている。

## 弾かれた2本、通った4本

| ページの条件 | `event.persisted` | `notRestoredReasons.reasons` |
| --- | --- | --- |
| 阻害要因なし | `true`(復元) | `null` |
| `Cache-Control: no-store` | `true`(復元) | `null` |
| `beforeunload` リスナー | `true`(復元) | `null` |
| `unload` リスナー | `false`(阻害) | `[{ reason: "masked" }]` |
| 接続中のWebSocket | `false`(阻害) | `[{ reason: "websocket" }]` |
| 運用中のブログ記事 | `true`(復元) | `null` |

![条件ごとのbfcache復元可否とnotRestoredReasonsの実測結果](../../../assets/blog/bfcache-notrestoredreasons-audit-2026/probe-results.png)

`unload` が弾かれたのは想定どおり。公式ガイドはここで言葉を選んでいない。"Never use the `unload` event. Ever!" 仕組みもすぐ後に書いてある。"On desktop, Chrome and Firefox have chosen to make pages ineligible for bfcache if they add an `unload` listener."

注目すべきは、私が仕込んだハンドラの中身だ。空である。関数の本体が空でもページは資格を失った。ブラウザが見ているのは<strong>リスナーが登録されているかどうか</strong>であって、そこで何をしているかではない。棚卸しの前に知っておく価値がある。「怪しい後始末処理」だけを目で追うと、空のリスナーを見落とす。

一方 `beforeunload` は素通りした。チームがこの二つを同じ引き出しに入れているなら、引き出しを分けるところから始まる。後始末が本当に必要なら `pagehide` を使う。ドキュメントいわく "The `pagehide` event fires in all cases where the `unload` event fires, and it also fires when a page is put in the bfcache."

## no-storeはもう死刑宣告ではない

一番意外だったのは `Cache-Control: no-store` のページが復元されたことだ。長年身についたルールと逆の結果である。web.dev も過去の挙動をはっきり書いている。`no-store` が付いていると "browsers have chosen not to store the page in bfcache."

ただ、同じ記事に続きがある。"There is work underway to change this behavior for Chrome in a privacy-preserving manner." その作業はすでに着地した。Chrome公式のドキュメント(Enabling bfcache for `Cache-Control: no-store`)は、この変更が2025年3月から4月にかけて全ユーザーへのロールアウトを完了したと記している。私の計測はそれを追認した形だ。

ここは誤読すると危ないので、条件を正確に写しておく。公式の説明によれば、`no-store` のページがbfcacheに入ったとしても、<strong>Cookieをはじめとする認証状態が変われば Chrome はそのページをキャッシュから追い出す</strong>。ログアウト後に戻る操作でログイン済み画面へ到達する事故を防ぐための仕掛けだ。さらに、`no-store` のページが特定のAPIを使う場合は依然として対象外になり、そのページが投げた fetch や XHR のレスポンスにも `no-store` が付いていれば、機微な情報を含みうるとして同じく追い出される。

読み方をまとめる。`no-store` をbfcache無効化のスイッチとして使う運用は、もう根拠が薄い。かといって機微なページが無防備にメモリへ残るわけでもない。守りの責任がヘッダー1行から、認証状態の変化という、より正確な信号へ移った。ブラウザ挙動に依存する話なので結論は強く置かない。ただ「`no-store` だから当然キャッシュされない」という前提で書いたコードがあるなら、今週のうちに測り直すのが妥当だ。

付け加えると、`Cache-Control` はキャッシュ判断の一方の軸でしかない。もう一方の軸である検証子(ETagとLast-Modified)は、保存の可否ではなく再検証のコストを決める。その検証子がデプロイ一度で丸ごとリセットされる件は[デプロイが消すキャッシュ検証子](/ja/blog/ja/etag-deploy-invalidation-conditional-requests-2026/)で別に測った。

## 開いている接続が問題であって、コードではない

> **【追記 2026-07-22】** web.dev の2026年6月の発表(「New to the web platform in June 2026」)によれば、接続中のWebSocketがあるページも bfcache に入る方向へブラウザの挙動が変わった可能性がある。以下の節の計測はその発表より前の環境(Chrome 150)で測った値なので、同じプローブで測り直したうえで結果を更新する予定だ。それまで、この節のWebSocket阻害の結論は旧バージョン基準として読んでほしい。
>
> **【追記 2026-07-24・再測定済み】** 同じプローブをChrome 150の三環境(自動化ビルド・正規headless・フラグ試行)で回し直した。開いたWebSocketは三度とも`reason: "websocket"`でブロックされ、対照群だけ復元された。つまりこの節の結論は<strong>私の自動化・ヘッドレス測定環境ではまだ有効</strong>だ。ただし公式発表は真であり、シードを受けた実ユーザー環境ではすでに復元される公算が高い。発表と実測が割れた理由(段階的ロールアウト・新規プロファイル・ヘッドレス)とCIゲートが誤判定する点は、[WebSocket bfcache 再測定の記事](/ja/blog/ja/websocket-bfcache-eligibility-remeasure/)にまとめた。

WebSocketの回は一度失敗してやり直した。最初は待ち受けサーバーを立てないまま `new WebSocket('ws://127.0.0.1:8099')` だけ仕込んで実行した。結果は `persisted: true`。阻害されない。

当然だった。受け手がいないので接続は即座に失敗し、戻るを押した時点でそのページに開いた接続は一つもなかった。そこで本物のWebSocketサーバーを起動し、離脱直前に `readyState` を出力して `1`(OPEN)であることを確認してから測り直した。ここでようやく `persisted: false` と `reasons: [{ reason: "websocket" }]` が出た。

この空振りから拾えたものが、実はこの記事で一番実務的な部分である。ブラウザが見るのは<strong>遷移した時点で開いている接続</strong>であって、コードにWebSocketが登場するかどうかではない。同じ理屈が接続系の阻害要因すべてに当てはまる。公式が挙げる一覧は、開いたIndexedDB接続、処理中の fetch や XMLHttpRequest、そして接続中のWebSocketとWebRTC。勧告は一貫している。これらを `pagehide` あるいは `freeze` の時点で閉じよ、というものだ。

リアルタイム機能を諦めろという話ではない。接続の寿命をページの可視状態に合わせろ、という話である。

```js
let socket;

function connect() {
  socket = new WebSocket('wss://example.com/live');
}

connect();

// 離れるときに閉じる。unload ではなく pagehide。
window.addEventListener('pagehide', () => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.close();
  }
});

// 復元されたら繋ぎ直し、凍っていた画面を更新する。
window.addEventListener('pageshow', (event) => {
  if (event.persisted) {
    connect();
    refreshStaleUI();
  }
});
```

`event.persisted` が `true` の分岐は必ず用意する。bfcacheから戻ったページは、ユーザーが離れた瞬間のまま止まっている。カートの数量、残り在庫、通知バッジ、セッションの残り時間。時間が経てば嘘になる値は、この時点で取り直す。そうしないと「速いが古い画面」を出すことになる。速度と引き換えに正しさを失うのは、性能改善の顔をした悪い取引だ。

`window.opener` も同じ系統である。公式の記述は "A page with a non-null `window.opener` reference can't safely be put into bfcache" と言い切っている。外部リンクに `rel="noopener"` を付ける習慣はセキュリティの作法として知られているが、bfcacheの資格にもそのまま効く。

## フィールドで理由を集める

ローカル計測は再現性こそ高いが、カバー範囲が狭い。実際の利用者のブラウザ、拡張、回線の組み合わせで何が阻害されるかは、現場でしか見えない。以下を仕込めば、復元を失っているURLと、取れる範囲の理由が集まる。

```js
window.addEventListener('pageshow', (event) => {
  const nav = performance.getEntriesByType('navigation')[0];

  // bfcacheから復元された場合はヒットとして数える
  if (event.persisted) {
    navigator.sendBeacon('/rum/bfcache', JSON.stringify({ hit: true, url: location.pathname }));
    return;
  }

  // 復元されなかった戻る/進む遷移だけを拾う
  if (nav && nav.type === 'back_forward' && nav.notRestoredReasons) {
    const nrr = JSON.parse(JSON.stringify(nav.notRestoredReasons));
    navigator.sendBeacon('/rum/bfcache', JSON.stringify({
      hit: false,
      url: nrr.url,
      reasons: (nrr.reasons || []).map((r) => r.reason),
      frames: (nrr.children || []).length,
    }));
  }
});
```

集まった `reasons` の大半が `"masked"` で埋まっても、このデータは仕事をしている。価値は理由の文字列ではなくURLの分布のほうにある。

## 「masked」という、答えでない答え

そのURL寄りの読み方を勧めるのには根拠がある。WebSocketの回は `"websocket"` という具体的な文字列を返した。ところが `unload` の回が返したのは `"masked"` だけ。ページにiframeは一つもなかったのに、である。

Chromeのドキュメントはこの値をこう説明する。"For all the cross-origin iframes, we report `null` for the `reasons` value for the frame, and the top-level frame will shows a reason of `"masked"`." プライバシー保護の仕掛けとしては理解できる。問題はその直後の但し書きだ。"`"masked"` may also be used for user agent-specific reasons so may not always indicate an issue in an iframe."

つまり `"masked"` を受け取っても、原因がiframeだと断定はできない。私の実測がまさにその例だった。フレームのない単一文書で、原因は明らかに `unload` リスナーなのに、フィールドはそれを名指ししなかった。

だから私の判断はこうなる。<strong>`notRestoredReasons` は「何が問題か」より「どのURLが問題か」を教える道具として使うのが正確だ。</strong>フィールドで集めた分布から阻害率の高いテンプレートを絞り、原因はそのページをローカルで開いてDevToolsのBack/forward cacheパネルで再現して突き止める。フィールドデータを診断書として扱うと、`"masked"` の前で止まる。道具を責める話ではなく、道具の目を知って使う話だ。

数字の読み方でもう一つ落とし穴がある。運用中のブログ記事が復元された直後にnavigationエントリを読むと、`type` は依然 `"navigate"`、`duration` は1315.2ms、`transferSize` は22218バイトのままだった。これは<strong>復元の性能ではなく初回ロード時の値</strong>である。bfcacheからの復元は新しいnavigationエントリを作らない。`nav.duration` で復元速度を測ろうとすると、存在しない数字を眺めることになる。復元の判定は `event.persisted` に任せる。

測って直したものを二度と壊れないようにする方法は、いつも同じだ。自動化してゲートに残す。[JSON-LDの検証をCIのゲートとして常設化した](/ja/blog/ja/validate-structured-data-ci-jsonld-2026/)ときと構造は変わらない。この6本も結局「開く、移動する、戻る、`persisted` を読む」の繰り返しなので、ヘッドレスブラウザのスクリプトに移して主要テンプレートに対しデプロイごとに回せる。[`content-visibility` でレンダリングコストを実測した回](/ja/blog/ja/content-visibility-auto-render-cost-measure-2026/)が初回表示を扱ったとすれば、こちらは2回目以降の遷移を扱う。

## まとめ: 戻るを失う一行

6本のうち2本が弾かれ、その原因はそれぞれ登録済みのリスナー1個と開いたソケット1本だった。残り4本は通り、そのうち1本は長らく阻害要因と信じられてきた `Cache-Control: no-store` である。

着手する順に並べる。

- <strong>`unload` リスナーを全数洗い出して消す。</strong>中身が空でも弾かれる。自社コードだけでなくサードパーティのスニペットも対象。`addEventListener('unload'` と `onunload` を併せて grep する。
- <strong>後始末は `pagehide` へ移す。</strong>`unload` が発火する全状況で発火し、bfcache投入時にも発火する。`beforeunload` は阻害要因ではないので、離脱確認のダイアログはそのままでいい。
- <strong>WebSocket、WebRTC、IndexedDBの接続を `pagehide` で閉じる。</strong>判定はコードにAPIがあるかではなく、遷移時に接続が開いているかどうか。
- <strong>`pageshow` に `event.persisted === true` の分岐を作る。</strong>接続を張り直し、古くなった表示値を取り直す。これがないと速くて古い画面が残る。
- <strong>外部リンクに `rel="noopener"` を付ける。</strong>`window.opener` が空でなければキャッシュ対象にならない。
- <strong>`no-store` 前提のコードを測り直す。</strong>Chromeは2025年にこの挙動を変えた。ただしCookieや認証状態が変われば追い出される、という条件付きで。
- <strong>フィールド計測は入れる。ただしURLを見る。</strong>理由は隠されうる。阻害が集中するテンプレートを見つけるために使う。

正直に限界も書いておく。この6本はmacOSマシン1台、Chrome 150という1ビルドで測った値だ。SafariとFirefoxは阻害条件が異なり、`notRestoredReasons` 自体がChromium系のAPIである。ここに並んだ文字列を標準の保証として読んではいけない。ただ再現手順はそのまま残したので、自分の対象ブラウザで同じ6本を回せば、自分の環境の答えが出る。

---

運用中のサイトで「戻る」が本当にキャッシュから復元されているのか、どのテンプレートがどの理由で資格を失っているのか。これは意見ではなく計測で答えが出る問いです。こうした実測と、その結果をCIゲートとして残すところまでを個人で相談・実装として請けています。必要でしたら[お問い合わせ](/ja/contact/)からどうぞ。
