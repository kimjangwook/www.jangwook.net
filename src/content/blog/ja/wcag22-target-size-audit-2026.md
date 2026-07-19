---
title: WCAG 2.2の最小ターゲットサイズ、92点の緑の裏に隠れたAA不合格
description: 指先が滑る22×22のボタンに、Lighthouseはアクセシビリティ92点を出した。WCAG 2.2が新設したSC 2.5.8(最小24×24)をサンドボックスに仕込み、自作スクリプトとLighthouseで二度測った。自動ツールはサイズ違反こそ捕まえるが、例外判定は人間に丸投げする。24pxの円が重なるかを計算するスペーシング例外まで、実測ログとCSS修正で整理する。
pubDate: '2026-07-19'
heroImage: ../../../assets/blog/wcag22-target-size-audit-2026/target-size-demo.png
tags:
  - a11y
  - wcag
  - accessibility
  - web-development
relatedPosts:
  - slug: axe-automated-a11y-coverage-gap-2026
    score: 0.82
    reason:
      ko: "저 글은 'axe가 구조적으로 못 잡는 넷'을 다뤘다. 이 글은 그중 타깃 크기만은 axe가 이제 잡더라는 반례와, 그래도 예외 판정은 여전히 사람 몫이라는 경계를 실측했다."
      ja: "あちらは『axeが構造的に取りこぼす四つ』。本稿はそのうちタッチターゲットだけはaxeが今や捕まえるという反例と、それでも例外判定は人の仕事という境界を実測した。"
      en: "That post covers four things axe structurally misses. This one is the counter-case where axe now does catch target size, plus the boundary where exception judgment still falls to a human."
      zh: "那篇讲axe在结构上漏掉的四类问题。本文是其中的反例：目标尺寸axe如今能抓到，但例外判定仍归人来做。"
  - slug: a11y-lighthouse-audit-fix-2026
    score: 0.75
    reason:
      ko: "Lighthouse로 접근성 위반을 잡아 고치는 기본 흐름을 먼저 보고 싶다면 저 글이 출발점이다. 이 글은 그 92점 점수가 왜 통과가 아닌지를 파고든다."
      ja: "Lighthouseでアクセシビリティ違反を捕まえて直す基本の流れは、まずあちら。本稿はその92点が『合格』でない理由を掘る。"
      en: "For the basic flow of catching and fixing a11y issues with Lighthouse, start there. This post digs into why that 92 score is not a pass."
      zh: "想先看用Lighthouse抓取并修复无障碍问题的基本流程，从那篇开始。本文深挖那个92分为何不等于合格。"
  - slug: accessible-name-agents-2026
    score: 0.68
    reason:
      ko: "타깃이 충분히 크더라도 이름이 비어 있으면 무용지물이다. 접근성 이름이 어떻게 조용히 틀어지는지 한 케이스로 깊게 판 글이 저기다."
      ja: "ターゲットが十分大きくても、名前が空なら意味がない。アクセシブルネームがどう静かに狂うかを一例で深掘りしたのがあちら。"
      en: "A target can be big enough and still be useless if its name is empty. That post drills into one case of how the accessible name quietly breaks."
      zh: "目标够大，若名称为空也没用。那篇用一个案例深挖无障碍名称是怎么悄悄出错的。"
---

アクセシビリティの自動検査スコアは92点。画面上部に緑に近い数字が出た。ところが同じページの下、ページネーションの数字リンクは一辺22px。親指で「3」を押すと「2」や「4」まで一緒に反応する。スコアは合格に見えるのに、指先はずっと滑る。

このズレが本稿の出発点だ。WCAG 2.2が新設した成功基準のひとつ、<strong>SC 2.5.8 Target Size (Minimum)</strong>をサンドボックスに仕込み、自作スクリプトとLighthouseで二度測った。先に結論を書く。自動ツールは明らかなサイズ違反なら今や十分に捕まえる。だがこの基準の本当の難しさはサイズではなく<strong>例外条項</strong>にあり、その判定は依然として人間の仕事だ。

## 24×24という数字の出どころ

まず土台から。WCAG(Web Content Accessibility Guidelines)は、W3C傘下のWAIが策定するウェブアクセシビリティの標準だ。2.2は2023年10月5日に正式なW3C勧告(Recommendation)となり、現行版は2024年12月12日付、2025年10月21日にはISO/IEC 40500:2025としても承認された。2.1から成功基準が9つ増え、古い4.1.1 Parsingがひとつ廃止された。

その9つのうち、開発者がすぐCSSを直すべきなのが<strong>SC 2.5.8 Target Size (Minimum)</strong>、レベルAAだ。条文は短い。W3C原文のまま引くと「The size of the target for pointer inputs is at least 24 by 24 CSS pixels, except when…」。ポインターで押す対象は最小24×24 CSSピクセルでなければならない。指が太い人、手が震える人、揺れるバスの中の人。小さな操作対象を正確に狙いにくい利用者のための基準だ。

数字を取り違えてはいけない。24×24はAAの<strong>下限</strong>である。その上にSC 2.5.5 Target Size (Enhanced)、レベルAAAが44×44を求める。参考までに、AppleのHuman Interface Guidelinesは44pt、AndroidのMaterialは48dpを推奨する。この二つはW3C標準ではなくプラットフォームの推奨値なので、あくまで「参考値」として見る。実務では、新規コンポーネントは最初から44以上で組み、レガシー監査では24を合格線にしている。

ここでCSSピクセルという但し書きが効いてくる。物理ピクセルではなくCSSピクセル基準なので、高解像度画面でdevice pixel ratioが3でも、`min-height: 24px`なら要件を満たす。逆にビューポートのメタタグを誤って設定し拡大が変にかかると計算が狂う。だから測定はレンダー後の`getBoundingClientRect()`で行うのが安全だ。

## 手で仕込み、手で測った

言葉だけでは掴めない。そこで違反をわざと仕込んだ静的ページを用意した。一時サンドボックスに四つの区画を置く。

- toolbar-bad: 16×16のアイコンボタン4つ(Bold / Italic / Underline / Link)
- pager-bad: 20×20に1pxの枠がついて実測22×22になったページネーションリンク5つ、間隔0
- toolbar-good: 同じボタンを`min-width/min-height: 24px`＋パディングで広げた版
- pager-good: 24×24に`margin: 2px`で間隔まで与えた版

要となるマークアップはこうだ。

```html
<!-- 違反: 16x16 -->
<section class="toolbar-bad">
  <button aria-label="Bold">B</button>
  <button aria-label="Italic">I</button>
</section>

<!-- 準拠: 最小24x24 -->
<section class="toolbar-good">
  <button aria-label="Bold">B</button>
  <button aria-label="Italic">I</button>
</section>
```

```css
.toolbar-bad button  { width: 16px; height: 16px; padding: 0; }
.toolbar-good button { min-width: 24px; min-height: 24px; padding: 4px; }
```

測定は、axeやLighthouseに任せる前に、基準そのままを計算するスクリプトを先に書いた。こうすれば自動ツールが何を見て何を見ないかの対照群ができる。この監査スクリプトは二つのことをする。第一に、すべての操作対象のレンダーサイズを測って24未満を拾う。第二に、拾ったものに<strong>スペーシング例外</strong>を適用する。各対象のバウンディングボックス中心に直径24pxの円を描き、他の円と重なるかをユークリッド距離で判定する。

```javascript
// WCAG 2.2 SC 2.5.8 最小ターゲットサイズ監査
(() => {
  const MIN = 24, R = 12; // 直径24px → 半径12
  const sel = 'a[href],button,input,select,textarea,' +
              '[role="button"],[role="link"],[tabindex]:not([tabindex="-1"])';
  const els = [...document.querySelectorAll(sel)]
    .filter(el => el.offsetParent !== null);
  const boxes = els.map(el => {
    const r = el.getBoundingClientRect();
    return { w: Math.round(r.width), h: Math.round(r.height),
             cx: r.left + r.width / 2, cy: r.top + r.height / 2,
             label: el.getAttribute('aria-label') || el.textContent.trim().slice(0, 12) };
  });
  const findings = [];
  for (const b of boxes) {
    if (!(b.w < MIN || b.h < MIN)) continue;         // 24以上は通過
    const tooClose = boxes.some(c =>                  // スペーシング例外の判定
      !(c.cx === b.cx && c.cy === b.cy) &&
      Math.hypot(c.cx - b.cx, c.cy - b.cy) < 2 * R);
    findings.push({ label: b.label, size: `${b.w}x${b.h}`,
                    verdict: tooClose ? 'FAIL' : 'PASS(spacing)' });
  }
  return { total: boxes.length, undersized: findings.length, findings };
})();
```

Chromeでこのスクリプトを走らせた実測結果だ。

```json
{
  "total": 18,
  "undersized": 9,
  "findings": [
    { "label": "Bold",  "size": "16x16", "verdict": "FAIL" },
    { "label": "Italic","size": "16x16", "verdict": "FAIL" },
    { "label": "Underline","size":"16x16","verdict":"FAIL" },
    { "label": "Link",  "size": "16x16", "verdict": "FAIL" },
    { "label": "1", "size": "22x22", "verdict": "FAIL" },
    { "label": "2", "size": "22x22", "verdict": "FAIL" },
    { "label": "3", "size": "22x22", "verdict": "FAIL" },
    { "label": "4", "size": "22x22", "verdict": "FAIL" },
    { "label": "5", "size": "22x22", "verdict": "FAIL" }
  ]
}
```

18対象のうち9つが24未満、すべてFAIL。good区画の24×24対象は、そもそも拾う段階で引っかからなかった。pager-badが22×22で捕まったのが面白い。CSSには20pxと書いたのに、1pxの枠が両側について実測は22になった。コードを目で追うだけでは見落とす誤差を、レンダー後の測定はそのまま暴く。

## 自動ツールはどこまで見たか

ここで対照群。同じページをLighthouseのモバイルスナップショットで走らせた。アクセシビリティスコアは<strong>92点</strong>。失敗した監査項目は`target-size`と`landmark-one-main`の二つ。axe-coreが担う`target-size`監査はスコア0で、まさに同じ9ノードを指した。

```
Accessibility: 92
Failed audits: target-size, landmark-one-main
target-size: score=0, flagged 9 nodes
  <button aria-label="Bold"> ... <a href="#5">
```

二点を押さえたい。

まず良い知らせ。「自動ツールはアクセシビリティの表面しか見ない」という通念は、この項目では古い。axe-coreは今や`target-size`ルールを持ち、自作監査とまったく同じ9つを指摘した。スペーシング計算まで含めた自分の判定とaxeの判定が一致したということは、24pxの円の重なりという基準ロジックをツールが実際に実装しているという意味だ。サイズ違反に限れば、axeは信頼できる。この点は、[axeが構造的に取りこぼす四つを仕込んでみた実験](/ja/blog/ja/axe-automated-a11y-coverage-gap-2026)の結論への反例でもある。あのときは人の判断を要する項目が緑の裏に残ったが、ターゲットサイズだけはルール型に落ちて自動化が追いついた。

次に悪い知らせ。それでもスコアは92だった。AA成功基準がひとつ明らかに壊れたページが92点をもらう。スコアは加重平均だから、ルールが一つ0でも残りが支えれば数字は合格に見える。<strong>スコアは適合ではない。</strong>WCAGは合否の二値基準であって、92点のような連続値ではない。AAを主張するなら、2.5.8を含むすべてのAA基準を例外なく満たす必要がある。ダッシュボードの緑の数字を適合の証拠として提出してはならない理由だ。この落とし穴は、[Lighthouseで捕まえて直す基本の流れ](/ja/blog/ja/a11y-lighthouse-audit-fix-2026)を身につけた後も残り続ける。

## 例外条項こそ本当の試験だ

ここがこの基準の核心だ。2.5.8は24×24を求めつつ、五つの例外を置く。W3C原文の順に並べる。

| 例外 | 要旨 | ツールで判定可能か |
|---|---|---|
| Spacing(間隔) | 小さくても24pxの円が重ならなければ通過 | 一部可(幾何計算) |
| Equivalent(同等) | 同じ機能が十分大きい別コントロールでも提供される | 不可(人の判断) |
| Inline(インライン) | 文中にある、または行の高さにサイズが縛られる対象 | 一部可 |
| User agent control | サイズを著者ではなくブラウザが決める | 一部可 |
| Essential(必須) | その表現が本質的、または法で定められている | 不可(人の判断) |

スペーシング例外が実務で最もよく使われる。原文はこうだ。「Undersized targets … are positioned so that if a 24 CSS pixel diameter circle is centered on the bounding box of each, the circles do not intersect another target or the circle for another undersized target.」各対象の中心に直径24pxの円を置き、その円同士が重ならなければ、24より小さくても通過する。円が二つ重ならないためには、中心間の距離が24px以上であればいい。

私のpager-badがなぜFAILかはこれで説明がつく。22×22のリンクが間隔なしに並ぶから、隣り合う中心の距離は22px、24より小さくて円が重なる。ところがリンクを22×22のまま残しても、`margin`を与えて中心間隔を24px以上に広げれば、サイズを増やさずスペーシング例外で適合する。密なツールバーやデータ密度の高い表で、アイコンを物理的に大きくできないときの抜け道だ。

問題は残りの例外だ。EquivalentとEssentialは、自動化が原理的に判定できない。「この小さな削除アイコンと同じ機能が、ページのどこかに大きなボタンとしてもあるか」は、ページの意味を理解しないと答えられない。axeがある対象をFAILと打っても、それが実際の違反か例外かは人が確かめる必要がある。正直に書けばこうだ。<strong>自動FAILは「人が例外を検討せよ」という合図であって、それ自体が最終判定ではない。</strong>逆に自動PASSも適合の保証ではない。

## コードで直す

原因ごとに処方が分かれる。

最も多いのは、単にサイズが足りない対象。最小値を打ち込む。`width`ではなく`min-width`/`min-height`を使うのが肝心だ。コンテンツが大きければ広がるが、絶対に24を下回らない下限だけをかける。

```css
/* アイコンボタン: 見た目の大きさは保ちつつヒット領域だけ24に */
.icon-btn {
  min-width: 24px;
  min-height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
```

見た目は16pxのアイコンを保ちたいが、指先の領域だけ広げたいなら、透明なパディングや擬似要素でヒット領域を拡張する。

```css
.tiny-icon { position: relative; }
.tiny-icon::after {           /* 見えない24x24のヒット領域 */
  content: "";
  position: absolute;
  inset: 50% auto auto 50%;
  width: 24px;
  height: 24px;
  transform: translate(-50%, -50%);
}
```

どうしてもサイズを増やせない密なUIなら、スペーシング例外へ回す。中心間隔24px以上を`gap`や`margin`で確保する。

```css
/* 22x22を保ちつつ中心間隔 ≥24px → スペーシング例外で通過 */
.pager a {
  width: 22px;
  height: 22px;
  margin: 0 2px;   /* 22 + 2 + 2 = 26px の中心間隔 */
}
```

そして先の監査スクリプトを、CIやブックマークレットとして常備しておく。axeだけで十分に見えても、レンダー後の実測値を自分の目で見る習慣は、1pxの枠のような誤差を拾ってくれる。私はこれを、デプロイ前の手動チェックの最後の一マスにしている。

## よく引っかかる落とし穴

監査を何度か回すと、同じ場所で繰り返しつまずく。四つだけ先に書いておく。

一つ目、`width`と`min-width`の取り違え。`width: 24px`はコンテンツが溢れれば切れるか、24ちょうどに閉じ込められる。欲しいのは下限であって固定値ではない。必ず`min-width`/`min-height`を使う。この違い一つで、レスポンシブでテキストが伸びたボタンが静かに違反へ回るのを防げる。

二つ目、重なるヒット領域を作ること。`::after`で24×24のヒット領域を広げるとき、隣り合う二つのアイコンの拡張領域が重なると、狙いと違う対象が押される。見た目は小さくても、実際のクリック判定が広がっているからだ。広げるのはいいが、隣と重ならない線までにとどめる。ここでも24pxの円の重なり計算がそのまま役立つ。

三つ目、`transform: scale()`で縮めた対象。CSSの`transform`はレイアウトサイズではなく描画段階だけで小さく見せる。だから`getBoundingClientRect()`はスケール適用後の実画面サイズを返し、著者の意図とずれやすい。アイコンを`scale`で縮めたなら、縮小後のサイズで測り直すのを忘れない。

四つ目、フォーカスリングだけ見て安心すること。キーボードフォーカスがよく見えるからといって、ポインター対象が十分大きいとは限らない。2.5.8はマウスやタッチのようなポインター入力のための基準で、キーボードアクセシビリティ(2.1.1)やフォーカスの可視性(2.4.11)とは別の軸だ。アクセシビリティは一つの軸を通ったから他の軸も自動でついてくる、とはならない。[アクセシブルネームが静かに空になる場合](/ja/blog/ja/accessible-name-agents-2026)のように、サイズと名前とフォーカスはそれぞれ確かめる必要がある。

## まとめ: 24pxの前で開発者がやること

要点を圧縮する。WCAG 2.2 SC 2.5.8はポインター対象の最小サイズを24×24 CSSピクセルと定めたAA基準で、自動ツールはサイズ違反こそよく捕まえるが、例外判定は人に残す。92点のようなスコアは適合の証拠にならない。

デプロイ前チェックリストに落とすと。

- すべてのボタン・リンク・入力のレンダーサイズを実測する。CSS値ではなく`getBoundingClientRect()`の結果で見る。
- 24未満が出たら三通りで処方する。① `min-width/min-height: 24px`で広げる ② 見た目維持が必要なら透明ヒット領域を拡張する ③ どうしても無理なら中心間隔24px以上でスペーシング例外を作る。
- axeがFAILと打った項目は、EquivalentやEssentialの例外に当たるかを人が最後に確かめる。
- ダッシュボードのスコアを適合報告として提出しない。AAは二値の合否だ。
- 新規コンポーネントは最初から44以上で組めば、AAとAAAを一度に越えられる。

小さな数字ひとつだが、指先がずっと滑るUIは、スコアがどれだけ緑でも使いにくいUIだ。24pxは、その指先への最低限の配慮である。

構造化データをサーバーサイドで確実に出したい、あるいは既存サイトのアクセシビリティ・ターゲットサイズ・GEO対応をコードレベルで点検したい。そんなときは個人的に相談と実装のご依頼を受けている。プロフィールの問い合わせ経路から気軽に連絡してほしい。
