---
title: '公式は「WebSocketはbfcacheを妨げない」と発表した。測り直すと三度とも妨げられた'
description: Chrome 149はWebSocketがbfcacheを妨げなくなったと発表した。Chrome 150の三環境で測り直すと、notRestoredReasonsは変わらずwebsocketを返した。
pubDate: '2026-07-24'
heroImage: ../../../assets/blog/websocket-bfcache-eligibility-remeasure/hero.png
tags:
  - performance
  - core-web-vitals
  - web-development
  - chrome
relatedPosts:
  - slug: bfcache-notrestoredreasons-audit-2026
    score: 0.92
    reason:
      ko: "이 글은 저 글의 정오표를 회수하러 왔다. 저기서 'WebSocket=차단'이라 쟀고, 여기서 그 결론이 시효를 다했는지 같은 프로브로 다시 확인했다."
      ja: "本稿はあちらの正誤表を回収しに来た回。あちらで測った『WebSocket=ブロック』が期限切れになったかを、同じプローブで確かめている。"
      en: "This post exists to settle the errata on that one. There I measured 'WebSocket = blocked'; here I re-ran the same probe to see whether that conclusion had expired."
      zh: "这篇是来兑现那篇的勘误的。那边测得『WebSocket=拦截』，这边用同一套探针复核这个结论是否已经过期。"
  - slug: content-visibility-auto-render-cost-measure-2026
    score: 0.7
    reason:
      ko: "저 글은 최초 렌더링 비용을, 이 글은 뒤로 가기로 그 비용을 통째로 건너뛰는 경로를 다룬다. bfcache가 걸릴 때만 성립하는 절약이라 짝이 된다."
      ja: "あちらは初回レンダリングのコスト、こちらは戻る操作でそれを丸ごと省く経路。bfcacheが効いて初めて成立する節約なので対になる。"
      en: "That one measures first-render cost; this one covers the back-navigation path that skips that cost entirely — a saving that only holds when bfcache actually engages."
      zh: "那篇量首次渲染成本，这篇讲后退时把这笔成本整个跳过的路径。只有 bfcache 真正生效时才成立，因此成对。"
  - slug: validate-structured-data-ci-jsonld-2026
    score: 0.66
    reason:
      ko: "측정을 CI 게이트로 굳히는 절차가 궁금하다면 저 글이 원형이다. 다만 이 글은 그 게이트가 브라우저 롤아웃 때문에 실사용자와 어긋날 수 있다는 반례이기도 하다."
      ja: "測定をCIゲートに固める手順の原型があちら。ただ本稿は、そのゲートがブラウザのロールアウトのせいで実ユーザーとズレうるという反例でもある。"
      en: "The template for hardening a measurement into a CI gate lives there. This post is also a counterexample: that gate can diverge from real users because of browser rollout."
      zh: "把测量固化成 CI 关卡的做法在那篇。而本文也是一个反例：由于浏览器分批放量，那道关卡可能与真实用户脱节。"
  - slug: robots-snippet-controls-ai-overviews-2026
    score: 0.5
    reason:
      ko: "둘 다 '공식 문서 한 줄'과 '내 페이지의 실제 동작'이 어긋나는 지점을 실측으로 좁힌 글이다. 저기선 스니펫 지시자가, 여기선 bfcache 자격이 대상이었다."
      ja: "どちらも『公式ドキュメント一行』と『自分のページの実挙動』のズレを実測で詰めた回。あちらはスニペット制御、こちらはbfcache適格性。"
      en: "Both narrow the gap between a line of official docs and how your page actually behaves, by measuring it. There it was snippet directives; here it's bfcache eligibility."
      zh: "两篇都用实测收窄『官方文档一行』与『自己页面实际表现』之间的差距。那边是摘要指令，这边是 bfcache 资格。"
---

公式は変わったと発表した。Chrome 149のリリースノートにはっきり書いてある。「アクティブなWebSocket接続は、もはやページのbfcache入りを妨げない」。7月22日の訂正記事で、私は旧測定の記事に「発表後の環境で同じプローブを回し、結果を更新する予定」と添えた。結論がひっくり返ることを、自分で予告していたわけだ。

今日、測り直した。ひっくり返らなかった。正確には、私が見た場所ではひっくり返らなかった。Chrome 150を三通りの方法で走らせたが、開いたWebSocketを抱えたページは三度とも復元されない。`notRestoredReasons`は毎回`websocket`を返した。本稿はそのズレを正直に記録する。発表と実測がなぜ割れたのか、そしてその割れ目が、CIからbfcacheを監視する人にとってなぜ実害のある罠なのかを整理する。

## bfcacheとは何で、なぜWebSocketがそれを妨げたのか

まず概念を固める。本稿の結論は狭く技術的なので、土台がないと数字だけが宙に浮く。

back/forward cache(bfcache)は、ユーザーがページを離れるとき、そのページを破棄せずメモリごと丸ごと凍結するブラウザの機能だ。DOMもJavaScriptヒープもスクロール位置もそのまま残る。戻るを押すと、ブラウザはそのスナップショットを解凍する。web.dev の説明はこうだ。「Loading the previous page is essentially instant, because the entire page can be restored from memory, without having to go to the network at all.」文書の再パースも、スクリプトの再実行も、レイアウトの再計算もない。検索結果を行き来する往復が多いモバイルほど、体感は大きい。

先に期待値を下げておく。bfcacheは順位要素ではない。これを直したところで検索順位が上がる保証はどこにもないし、私もそう主張しない。あくまで実ユーザーが感じるナビゲーションの手触りの話だ。

やっかいなのは、どのページでも凍結できるわけではない点だ。ページが生きた接続やコールバックを握っていると、ブラウザは凍結せずそのまま捨てる。長らくその不適格リストに載っていたのが、開いたWebSocketだった。ライブチャット、通知ストリーム、価格ティッカー。WebSocketを握るページは、戻るたびにフルロードされていた。

この状態は推測しなくていい。ブラウザが二つのAPIで答えをくれる。`pageshow`イベントの`event.persisted`が`true`なら、bfcacheから復元されたページだ。復元され<strong>なかった</strong>ときは、`PerformanceNavigationTiming.notRestoredReasons`がその理由を持つ。このAPIはChrome 123から出荷された。私は[前回の六プローブ測定](/ja/blog/ja/bfcache-notrestoredreasons-audit-2026/)で、この二つのAPIを使って六つのブロック候補を一つずつ切り分け、開いたWebSocketが`reason: "websocket"`でページを妨げることを確かめている。

## 発表は明確だ。「もう妨げない」

その結論を揺さぶったのが、web.dev の2026年6月のプラットフォーム要約だった。原文はこう始まる。「In Chrome 149, pages with active WebSocket connections can now enter the Back/Forward Cache (bfcache). Previously, an open WebSocket connection rendered a page ineligible for bfcache. Now, the browser automatically closes active WebSocket connections upon bfcache entry.」

肝は最後の一文。ページを不適格と印づけて破棄する代わりに、<strong>ブラウザがbfcache入りの時点でWebSocketを代わりに閉じ</strong>、ページは凍結する。Chrome 149のリリースノートも同じことをもっと短く言う。「Active WebSocket connections no longer prevent a page from entering the Back/Forward Cache (bfcache).」blink-dev の変更告知(PSA)は開発者側の含意まで踏み込む。「By closing connections on BFCache entry instead of marking the document as ineligible...」そして、堅牢なWebSocketクライアントはすでに`close`イベントで切断を検知して再接続するので、たいていは無理なく吸収されると添える。

発表を額面どおり読めば、私の旧測定「WebSocket=ブロック」は旧ビルド基準の古い結論になる。だから私は正誤表に「再測定予定」と書き、今日その約束を果たしに来た。ただし、発表を確認することと、自分の環境で再現することは別の仕事だ。その二つが割れる瞬間こそ本論である。

## 同じプローブを回し直す。三度ともブロック

測定対象を混ぜれば結果は読めない。だから前回と同じ最小サーバーを立て直した。ルートは二つ。開いたWebSocketを一つだけ抱えた`/websocket`と、ブロック候補を一切持たない対照群`/clean`。今回は前回のしくじりを繰り返さないよう、WebSocketを受けるローカルのエコーサーバーを実際に起動し、遷移直前に`readyState`が`1`(OPEN)であることを毎回確認した。計測スクリプトは六行だ。

```js
window.addEventListener('pageshow', (e) => {
  const nav = performance.getEntriesByType('navigation')[0];
  window.__bfcache = {
    persisted: e.persisted,
    nrr: nav && nav.notRestoredReasons
      ? JSON.parse(JSON.stringify(nav.notRestoredReasons))
      : null,
  };
});
```

`JSON.parse(JSON.stringify(...))`を挟む理由は前回書いた。`notRestoredReasons`はそのままログに出すと`[object Object]`しか残らない形なので、一度シリアライズを強制しないと値が見えない。

手順は同じだ。`/websocket`を開く。`readyState === 1`を確認する。`/next`へ遷移する。履歴を戻す。復元されたページで`window.__bfcache`を読む。これを三つのChrome 150環境で繰り返した。

一つ目はDevToolsプロトコルで操作する自動化用ビルド。`navigator.userAgent`は`Chrome/150.0.0.0`を返した。二つ目は私のMacに入った正規のGoogle Chrome 150.0.7871.186を`--headless=new`で新規起動し、CDPで直接駆動したもの。三つ目は同じ正規Chromeを、今度はWebSocket関連と当たりをつけた`--enable-features`フラグ数個を付けて起動した。結果は三つとも完全に同じだった。

![三つのChrome 150環境における、開いたWebSocketページのbfcache復元可否とnotRestoredReasonsの測定結果。対照群のみ復元された。](../../../assets/blog/websocket-bfcache-eligibility-remeasure/probe-results.png)

| 環境 | ページ条件 | `persisted` | `notRestoredReasons` | WS `close`イベント |
| --- | --- | --- | --- | --- |
| 自動化ビルド (Chrome/150.0.0.0) | 開いたWebSocket | `false` | `[{ reason: "websocket" }]` | なし |
| 正規 headless 150.0.7871.186 | 開いたWebSocket | `false` | `[{ reason: "websocket" }]` | なし |
| 正規 + `--enable-features`(当て推量) | 開いたWebSocket | `false` | `[{ reason: "websocket" }]` | なし |
| 正規 headless 150.0.7871.186 | 対照群(clean) | `true` | `null` | — |

目につくのは二点。まず、対照群は三環境すべてで`persisted: true`で復元された。つまり戻るハーネス自体は健全で、bfcacheはこのビルドでも正常に動く。ならばWebSocketページの`false`はハーネスの不具合ではなく、本物のブロックだ。次に、発表が言う「ブラウザがWebSocketを代わりに閉じる」挙動が、私の環境では起きなかった。復元失敗のあともソケットの`readyState`は`1`のまま、`close`イベントは一度も発火しない。新しいコード経路がそもそも点いていないのだ。

数字を読むときに足を取られやすい点も一つ。`persisted: false`だけでは「bfcacheがブロックされた」と「ただ普通に新規ロードされた」を区別できない。`pageshow`は初回ロードでも`persisted: false`で発火するからだ。両者を分けるのは二つ。ナビゲーション種別が`back_forward`か、そして`notRestoredReasons.reasons`に具体的な理由が入っているか。上の測定では正規headless版は`nav.type`が`back_forward`で、`reasons`が`[{ reason: "websocket" }]`だった。この二条件がそろって初めて「戻る操作なのにWebSocketのせいで復元に失敗した」と断定できる。`persisted`だけで判定する計測は、初回ロードをブロックと取り違える。

正直に書く。三つ目の環境の`--enable-features`のフラグ名は私の当て推量で、何の変化も生まなかった。私はこの機能の正確な`base::Feature`名を最後まで確定できていない。Chromeは知らない機能名を黙って無視するので、あの試みは「これらの名前ではなかった」以上を証明しない。

## なぜ発表と実測が割れたのか

ここから先は私の専門の外が混じるので、断定しない。順位アルゴリズムの内部も、ブラウザの実験配信サーバーのロジックも、私が覗いたわけではない。調べた範囲で最もありそうな候補を順に挙げる。

最有力は<strong>段階的ロールアウト</strong>だ。Chromeは「stableに出荷」と発表した機能でも、実際にはサーバー側の構成(Finchと呼ばれるフィールドトライアル)でユーザーへ徐々に点けることが多い。これは憶測ではなく観察できるパターンである。すぐ前の事例が`Cache-Control: no-store`のbfcache入りで、Chromeの公式ドキュメントはその変更を2025年3〜4月にかけて「全ユーザーへロールアウト完了」と明記する。「出荷」と「全員で点灯」の間に時差があることを、公式が自ら認めているわけだ。このフィールド構成は概してネットワークで取得したシードに依存する。ところが私が起動した正規Chromeは毎回まっさらな空プロファイルだった。シードのない新規プロファイルが機能の既定値(たいてい無効)で動くのは、むしろ自然だ。

第二の候補は<strong>ヘッドレス・自動化コンテキスト</strong>そのものの差だ。`--headless=new`はヘッドフルに近く動くとされるが、実験配信や一部の最適化が自動化下で違って解決される例はある。私はこの環境でしか測っておらず、人が手で操作するヘッドフルのstableプロファイルで同じ結果になるかは確認していない。むしろ発表を信じるなら、シードを受けた実ユーザーのヘッドフルChromeではすでに復元される公算が高い。

だから本稿の主張は「Chromeが発表を守らなかった」ではない。そう読めば誤りだ。正確な主張はこうだ。<strong>「stableに出荷済み」は「目の前のすべてのChrome 150で点いている」と同じではない。とりわけ新規プロファイルと自動化・ヘッドレス環境では。</strong>発表は真で、私の実測も真だ。両者は違う層を測っている。

## では開発者は何をすべきか

このズレは抽象論ではない。前回の記事で私は、bfcache測定をヘッドレススクリプトへ移し、[デプロイごとにCIゲートとして回せ](/ja/blog/ja/validate-structured-data-ci-jsonld-2026/)と勧めた。今日の測定は、その助言の盲点をそのまま突く。CIのブラウザは十中八九、新規プロファイルのヘッドレスだ。その環境は今見たとおり、実ユーザーよりプラットフォームのロールアウトを遅れて反映する。プラットフォームが「直した」と発表したあとも、あなたのゲートはしばらく`websocket`をブロック理由として吐き続けうる。

すぐ適用できる順に整理する。

- <strong>CIのbfcacheゲートにブラウザのビルドとチャンネルをログとして残す。</strong>`navigator.userAgent`とバージョン文字列を結果に併記する。ある日ゲートがフィールドデータと食い違ったら、犯人はコードではなくロールアウトの時差かもしれない。
- <strong>ゲートを実ユーザーのフィールドデータで突き合わせる。</strong>`notRestoredReasons`を`sendBeacon`で集めるRUMスニペットは前回の記事にそのままある。CIが緑なのにフィールドから`websocket`が消えていたら(あるいはその逆なら)、その差そのものが信号だ。どちらか一方だけを信じない。
- <strong>WebSocketは今もなお`pagehide`で閉じる。</strong>ブラウザが入場時に代わりに閉じてくれるとしても、その挙動が全ユーザーで点いていると仮定してコードを書いてはいけない。ロールアウトの届いていないユーザーには旧ルールがそのまま適用される。明示的に閉じるコードは両方の世界で安全だ。
- <strong>`pageshow`で必ず`event.persisted === true`の分岐を作る。</strong>ブラウザがWebSocketを閉じてページを凍結すると、戻ってきた画面のリアルタイム接続は切れている。この分岐で再接続し、凍結中に古くなった値(通知、在庫、価格)を取り直す。この分岐がないと「速いが切れた」画面を見せることになる。

```js
let socket;
function connect() { socket = new WebSocket('wss://example.com/live'); }
connect();

// 入場時にブラウザが閉じてくれても、明示的にも閉じる。どちらのロールアウトでも安全に。
window.addEventListener('pagehide', () => {
  if (socket && socket.readyState === WebSocket.OPEN) socket.close();
});

// 復元されたら再接続し、凍結中に古くなった画面を更新する。
window.addEventListener('pageshow', (event) => {
  if (event.persisted) { connect(); refreshStaleUI(); }
});
```

## まとめ。正誤表は半分だけ回収する

今回の再測定の要点は短い。公式はChrome 149で開いたWebSocketのbfcacheブロックを解いたと発表した。私はその発表を信じ、旧結論がひっくり返ると予告した。ところがChrome 150の自動化・ヘッドレス三環境で測り直すと、開いたWebSocketは依然として`reason: "websocket"`でページを妨げた。対照群は正常に復元されたので、ハーネスのせいではない。

そこで旧正誤表をこう更新する。WebSocketのブロックは<strong>プラットフォーム側で解消されつつある</strong>。シードを受けた実ユーザー環境では、すでに復元へ切り替わっている公算が高い。ただし新規プロファイルの自動化・ヘッドレスChromeでは、まだ旧挙動が観察される。だから「もうWebSocketは妨げない」を前提にコードを消す前に、<strong>あなたの測定環境が実ユーザーと同じロールアウト段階にあるか</strong>を先に確かめるべきだ。

限界も正直に置く。この三本は一台のmacOSマシンでChrome 150系で測った値だ。SafariとFirefoxはブロック条件が異なり、`notRestoredReasons`自体がChromium系のAPIである。私はシードを受けたヘッドフルのstableプロファイルを再現しておらず、機能の正確なフラグ名も確定していない。ここの結果を「Chrome 150はWebSocketを妨げる」という一般命題として読めば誤りだ。正確には「私が測った三つの自動化環境ではまだ妨げられた」である。再現手順はそのまま残したので、各自の対象環境で同じ三本を回せば、自分のロールアウト段階の答えが出る。

測定が発表を確認することと、その発表が目の前のブラウザで実際に点いていることは、別の問いだ。後者は意見ではなく測定でしか答えられず、その答えは環境ごとに違う。稼働中サイトのbfcache適格性を実測し、その結果を実ユーザーのフィールドデータとズレないゲートに落とし込む仕事を、個人で相談・実装の依頼として受けている。役に立ちそうなら[問い合わせページ](/ja/contact/)から連絡してほしい。
