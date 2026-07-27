---
title: "WebSockets and bfcache: Chrome 150 Still Said 'websocket'"
description: Chrome 149 said active WebSockets no longer block bfcache. I re-measured on three Chrome 150 builds and notRestoredReasons still returned 'websocket'. Why?
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

The platform announced the change. Chrome 149's release notes say plainly: "Active WebSocket connections no longer prevent a page from entering the Back/Forward Cache (bfcache)." In the July 22 erratum I appended to my old measurement post, I promised to re-run the same probe under the new behavior and update the result. I had already pre-committed to being wrong.

Today I re-measured. I wasn't wrong — or rather, the flip didn't happen where I looked. I drove Chrome 150 three different ways, and a page holding an open WebSocket failed to restore in all three. `notRestoredReasons` came back with `websocket` every single time. This post records that gap honestly: why the announcement and my measurement split apart, and why that split is a real trap for anyone who watches bfcache from CI.

## What bfcache is, and why a WebSocket blocked it

Start with the concept, because the conclusion here is narrow and technical. Without the foundation, you're left with numbers and no floor under them.

The back/forward cache (bfcache) is a browser feature that freezes a whole page in memory when you navigate away, instead of destroying it. The DOM, the JavaScript heap, the scroll position — all preserved. Press back, and the browser thaws that snapshot. web.dev puts it directly: "Loading the previous page is essentially instant, because the entire page can be restored from memory, without having to go to the network at all." No re-parsing the document, no re-running scripts, no recomputing layout. On mobile, where people bounce in and out of search results, the difference is felt.

Set expectations before we go further. bfcache is not a ranking factor. Fixing it does not raise your search position, and nobody official claims it does. This is about the navigation feel a real user experiences.

The catch is that not every page can be frozen. If a page is holding a live connection or callback open, the browser discards it rather than caching it. An open WebSocket sat on that ineligibility list for a long time. Pages carrying a live chat widget, a notification stream, or a price ticker got a full reload on every back navigation.

You don't have to guess at this state — the browser answers with two APIs. `event.persisted` on the `pageshow` event is `true` when the page came back from bfcache. When it did *not* restore, `PerformanceNavigationTiming.notRestoredReasons` carries the reason. That API shipped in Chrome 123. In [my earlier six-probe run](/en/blog/en/bfcache-notrestoredreasons-audit-2026) I used those two APIs to isolate six blocking candidates one at a time, and confirmed that an open WebSocket blocked the page with `reason: "websocket"`.

## The announcement is unambiguous: it no longer blocks

What shook that conclusion loose was web.dev's June 2026 platform roundup. Its wording: "In Chrome 149, pages with active WebSocket connections can now enter the Back/Forward Cache (bfcache). Previously, an open WebSocket connection rendered a page ineligible for bfcache. Now, the browser automatically closes active WebSocket connections upon bfcache entry."

That last sentence is the mechanism. Instead of marking the page ineligible and destroying it, the browser closes the WebSocket for you on bfcache entry and freezes the page anyway. The blink-dev PSA spells out the developer-side implication: "By closing connections on BFCache entry instead of marking the document as ineligible..." — and notes that robust WebSocket clients already detect the disconnect via the `close` event and reconnect, so most absorb it cleanly.

Read at face value, my old "WebSocket = blocked" becomes a stale result from an older build. So I wrote "will re-measure" in the errata, and today I came to keep that promise. But confirming an announcement and reproducing it in your own environment are two different jobs. The moment those two split is the point of this post.

## Same probe, re-run — blocked all three times

Mix your test conditions and you can't interpret the result. So I stood up the same minimal server as last time. Two routes: `/websocket`, carrying exactly one open WebSocket, and a control `/clean` with no blocking candidate at all. This time, to avoid last run's mistake, I actually ran a local echo server to accept the socket and confirmed `readyState === 1` (OPEN) right before every navigation. The instrumentation is six lines:

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

The `JSON.parse(JSON.stringify(...))` round-trip is there for a reason I hit last time: `notRestoredReasons` logs as `[object Object]` unless you force one serialization pass.

The procedure is fixed. Open `/websocket`. Confirm `readyState === 1`. Navigate to `/next`. Walk history back. Read `window.__bfcache` on the restored page. I repeated that across three Chrome 150 environments.

The first is the automation build driven over the DevTools protocol; `navigator.userAgent` reported `Chrome/150.0.0.0`. The second is the real Google Chrome 150.0.7871.186 installed on my Mac, freshly launched with `--headless=new` and driven directly over CDP. The third is that same real Chrome, this time launched with a few `--enable-features` flags I guessed might be the WebSocket one. All three gave the identical result.

![bfcache restoration and notRestoredReasons for the open-WebSocket page across three Chrome 150 environments; only the control restored.](../../../assets/blog/websocket-bfcache-eligibility-remeasure/probe-results.png)

| Environment | page condition | `persisted` | `notRestoredReasons` | WS `close` event |
| --- | --- | --- | --- | --- |
| Automation build (Chrome/150.0.0.0) | open WebSocket | `false` | `[{ reason: "websocket" }]` | none |
| Stable headless 150.0.7871.186 | open WebSocket | `false` | `[{ reason: "websocket" }]` | none |
| Stable + `--enable-features` (guessed) | open WebSocket | `false` | `[{ reason: "websocket" }]` | none |
| Stable headless 150.0.7871.186 | control (clean) | `true` | `null` | — |

Two things stand out. First, the control restored with `persisted: true` in all three environments. So the back-navigation harness is sound and bfcache works fine on this build — which means the WebSocket page's `false` is a real block, not a harness artifact. Second, the "browser closes the WebSocket for you" behavior the announcement described simply didn't happen in my environment. After the failed restore, the socket's `readyState` was still `1` and the `close` event never fired. The new code path wasn't switched on at all.

One more place people trip when reading these numbers. `persisted: false` on its own can't tell "bfcache was blocked" apart from "the page just loaded fresh," because `pageshow` also fires with `persisted: false` on a first load. Two things separate them: whether the navigation type is `back_forward`, and whether `notRestoredReasons.reasons` carries a concrete reason. In the run above, the stable headless case had `nav.type === "back_forward"` and `reasons` of `[{ reason: "websocket" }]`. Both conditions have to hold before you can claim "this was a back navigation that failed to restore because of the WebSocket." Instrumentation that judges a block from `persisted` alone will misread a first load as a block.

To be honest about it: the third environment's `--enable-features` names were my guesses, and they changed nothing. I never pinned down the exact `base::Feature` name for this change. Chrome silently ignores unknown feature names, so that attempt proves no more than "it wasn't these names."

## Why the announcement and my measurement split

From here I'm partly outside my lane, so I won't state it as fact. I haven't read the ranking internals or the browser's experiment-delivery server logic. Here are the most plausible candidates I could find, in order.

The strongest is a **staged rollout**. Chrome routinely announces a feature as "shipped to stable" while actually turning it on for users gradually through a server-side configuration — the field trial mechanism often called Finch. This isn't speculation; it's an observable pattern. The immediately prior case is `Cache-Control: no-store` becoming bfcache-eligible, and Chrome's own docs pin that rollout as "completed to all users" across March–April 2025. The docs themselves concede a lag between "shipped" and "on for everyone." That field configuration generally depends on a seed fetched over the network. But every stable Chrome I launched used a brand-new empty profile. A fresh profile with no seed running at the feature's default (usually off) is exactly what you'd expect.

The second candidate is the **headless / automation context** itself. `--headless=new` is meant to track headful closely, but experiment delivery and some optimizations have been known to resolve differently under automation. I only measured in that context; I did not verify whether a hand-driven headful stable profile gives the same answer. If anything, taking the announcement at its word, a real user's seeded headful Chrome probably already restores.

So the claim of this post is not "Chrome didn't honor its announcement." Read that way, it's wrong. The precise claim is this: **"shipped to stable" is not the same as "on in every Chrome 150 in front of you" — especially in fresh profiles and automation/headless contexts.** The announcement is true, and my measurement is true. They're measuring different layers.

## What a developer should actually do

This gap isn't abstract. In the last post I recommended porting bfcache measurement into a headless script and running it as a [CI gate on every deploy](/en/blog/en/validate-structured-data-ci-jsonld-2026). Today's measurement exposes the blind spot in that advice. Your CI browser is, nine times out of ten, a fresh-profile headless instance. As we just saw, that environment reflects platform rollouts later than real users do. After the platform announces "fixed," your gate may keep emitting `websocket` as a block reason for a while.

Here's the order I'd apply it in.

- **Log the browser build and channel in your CI bfcache gate.** Record `navigator.userAgent` and the version string alongside the result. The day the gate disagrees with field data, the culprit may be rollout lag, not your code.
- **Cross-check the gate against real-user field data.** The RUM snippet that collects `notRestoredReasons` via `sendBeacon` is in the last post, unchanged. If CI is green while `websocket` has vanished from the field (or the reverse), that divergence is itself the signal. Don't trust either side alone.
- **Keep closing your WebSocket in `pagehide` anyway.** Even if the browser closes it for you on entry, don't write code assuming that behavior is on for every user. Users the rollout hasn't reached still get the old rule. An explicit close is safe in both worlds.
- **Always branch on `event.persisted === true` in `pageshow`.** When the browser closes the WebSocket to freeze the page, the restored view comes back with a dead connection. In that branch, reconnect and re-fetch the values that went stale while frozen (notifications, stock, prices). Skip it and you show a "fast but disconnected" screen.

```js
let socket;
function connect() { socket = new WebSocket('wss://example.com/live'); }
connect();

// Even if the browser closes it on entry, close it explicitly — safe under either rollout.
window.addEventListener('pagehide', () => {
  if (socket && socket.readyState === WebSocket.OPEN) socket.close();
});

// On restore, reconnect and refresh the frozen view.
window.addEventListener('pageshow', (event) => {
  if (event.persisted) { connect(); refreshStaleUI(); }
});
```

## Wrap-up: I retract the errata, but only halfway

The gist of this re-measurement is short. The platform announced that Chrome 149 lifted the WebSocket block on bfcache. I trusted the announcement and pre-committed to my old conclusion flipping. Then, re-measuring across three Chrome 150 automation/headless environments, an open WebSocket still blocked the page with `reason: "websocket"`. The control restored normally, so the harness isn't to blame.

So I update the old errata this way. The WebSocket block is **being resolved at the platform level**, and seeded real-user environments have likely already flipped to restoring. But in fresh-profile automation and headless Chrome, the old behavior is still observable. Before you delete code on the assumption that "WebSockets don't block anymore," verify that **your measurement environment sits at the same rollout stage as your real users.**

The honest limits. These three probes came off one macOS machine on the Chrome 150 line. Safari and Firefox block on different conditions, and `notRestoredReasons` is itself a Chromium-family API. I did not reproduce a seeded headful stable profile, and I never confirmed the exact feature flag name. Read the result as "Chrome 150 blocks WebSockets" and you're wrong; read it precisely as "the three automation environments I tested still blocked" and you're right. The reproduction steps are all here, so run the same three probes in your target environment and you'll get the answer for your rollout stage.

Confirming an announcement is one question; whether that announcement is actually switched on in the browser in front of you is another. The second isn't a matter of opinion — only measurement answers it, and the answer differs by environment. I take on this kind of work personally: measuring a live site's bfcache eligibility and hardening the result into a gate that won't drift from real-user field data. If that's useful, reach me through the [contact page](/en/contact).
