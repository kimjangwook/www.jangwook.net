---
title: 'aria-modal="true"は何も防いでいなかった — モーダルのフォーカス脱出実測とinert'
description: role="dialog"とaria-modal="true"を備えた「正しく見える」モーダルで、Tabを3回押すとフォーカスがオーバーレイの裏へ抜けた。axeの違反は0件。同じマークアップをaria-hidden、inertに切り替えながら、キーボードフォーカスが実際にどこへ落ちるかを記録した。
pubDate: '2026-07-23'
heroImage: ../../../assets/blog/modal-focus-escape-inert-measure-2026/hero.png
tags:
  - accessibility
  - wcag
  - web-development
relatedPosts:
  - slug: axe-automated-a11y-coverage-gap-2026
    score: 0.82
    reason:
      ko: "이 글에서 axe가 포커스 이탈을 위반으로 잡지 못한 이유가 궁금하다면, 자동 검사 도구가 구조적으로 무엇을 못 보는지를 정리한 저 글이 답의 절반을 갖고 있다."
      ja: "本稿でaxeがフォーカス脱出を違反として報告しなかった理由は、自動チェックが構造的に何を見られないかを整理したあちらに半分書いてある。"
      en: "Half the answer to why axe didn't flag the focus escape in this post lives there — a breakdown of what automated checkers structurally cannot see."
      zh: "想知道本文中 axe 为什么没把焦点逃逸报成违规，那篇梳理自动化工具结构性盲区的文章有一半答案。"
  - slug: wcag22-target-size-audit-2026
    score: 0.71
    reason:
      ko: "초록불 점수 뒤에 숨은 실패라는 점에서 같은 계열의 실측이다. 저기서는 24px 타깃이, 여기서는 Tab 세 번이 자동 도구의 한계를 드러냈다."
      ja: "緑のスコアの裏に隠れた不合格という意味で同系統の実測。あちらは24pxのターゲットが、こちらはTab三回が自動ツールの限界を暴いた。"
      en: "Same family of measurement: failure hiding behind a green score. There it was a 24px target; here it took three presses of Tab."
      zh: "同一类实测：绿灯分数背后藏着的不合格。那篇是 24px 的点击目标，这篇是按三次 Tab。"
  - slug: accessible-name-agents-2026
    score: 0.63
    reason:
      ko: "포커스가 도착한 요소를 보조기술이 뭐라고 읽어주는가의 문제로 이어진다. accessible name이 비어 있으면 이 글의 '포커스 블랙홀'과 같은 증상이 난다."
      ja: "フォーカスが着いた要素を支援技術が何と読み上げるかという問題に続く。accessible nameが空だと本稿の「フォーカスのブラックホール」と同じ症状になる。"
      en: "Continues into what assistive tech announces once focus lands somewhere. An empty accessible name produces the same symptom as this post's focus black hole."
      zh: "延伸到辅助技术如何朗读焦点所在元素的问题。accessible name 为空时，症状和本文的「焦点黑洞」一模一样。"
  - slug: a11y-lighthouse-audit-fix-2026
    score: 0.58
    reason:
      ko: "Lighthouse 접근성 점수를 100까지 끌어올린 기록인데, 그 100점조차 이 글의 포커스 이탈은 잡지 못한다. 점수와 실사용의 간극을 양쪽에서 보여준다."
      ja: "Lighthouseのアクセシビリティスコアを100に上げた記録。だがその100点でも本稿のフォーカス脱出は検出できない。スコアと実利用の溝を両側から見せる二本。"
      en: "The log of pushing a Lighthouse accessibility score to 100 — a 100 that still wouldn't catch this post's focus escape. Two views of the same gap."
      zh: "把 Lighthouse 无障碍分数拉到 100 的记录，而那个 100 分同样抓不到本文的焦点逃逸。从两侧看同一道鸿沟。"
---

マークアップは正しかった。`role="dialog"`、`aria-modal="true"`、開いたら最初の入力欄へフォーカス移動。コードレビューなら通る形だ。それでも、Tabを3回押したらフォーカスはオーバーレイの裏へ抜けた。

抜けた瞬間の写真がある。ダイアログが画面中央に開いたまま、オレンジ色のフォーカスリングは半透明のオーバーレイ越しに、背景ナビゲーションの「Contact」に掛かっている。今日はこの症状を、同じマークアップの3バリアントで測って記録した。背景を何も処理しない版、`aria-hidden="true"`を付ける版、`inert`を付ける版。それぞれで本物のTabキーを押し、フォーカスの着地点をログに取り、axe-core 4.12.1を併走させた。ブラウザはChrome 150である。

## 土台: 「モーダル」という言葉自体が仕様である

先に土台を固めておく。モーダルダイアログとは、開いている間、画面の残り全部が存在しないかのように振る舞うUIのことだ。W3CのWAI-ARIA Authoring Practices Guide(APG)はモーダルダイアログパターンでこう書く。"Windows under a modal dialog are inert. That is, users cannot interact with content outside an active dialog window." キーボード操作も明文化されている。Tabはダイアログ内の次のタブ可能要素へ、最後の要素で押せばダイアログ内の最初の要素へ戻る。フォーカスがオーバーレイの裏に出た時点で、それは仕様の定義するモーダルではない。

そして多くのコードが誤解している点がここにある。`aria-modal="true"`はこの挙動を作ってくれる属性ではない。この挙動が既に実装済みだと支援技術に<strong>宣言</strong>する属性だ。APGは条件まで付けている。アプリケーションコードが外部コンテンツとのやり取りを実際に全て防いでいて、かつ視覚的にも外が覆われているときだけ付けよ、と。宣言と実装がずれたら何が起きるか。それを測った。

実験ページの構成は素朴だ。背景にフォーカス可能要素が6個(ナビリンク4、検索入力、開くボタン)、モーダル内に3個(メール入力、Subscribe、Cancel)。オーバーレイは半透明にしてあり、背景のフォーカスリングが透けて見える。これが後で証拠写真になる。

計測方法にはひとつ原則を置いた。`dispatchEvent`で合成のTabキーイベントを撃つ方式は使っていない。合成イベントはuntrustedなのでブラウザの実際のフォーカス移動を起こさないからだ。代わりにDevToolsプロトコルで本物のTab入力を送り、文書に`focusin`リスナーを仕掛けて通過点のidを順に採取した。

```js
// 計測用: フォーカスの通過点を順に記録
window.__focusLog = [];
document.addEventListener('focusin',
  e => window.__focusLog.push(e.target.id || e.target.tagName), true);
```

## naive版: Tab3回でオーバーレイの裏へ

背景を無処理のままにした第1バリアント。開くとメール入力にフォーカスが移る。ここまでは体裁が良い。その後のTabログがこれだ。

```text
variant: naive  (role="dialog" + aria-modal="true"、背景は無処理)
open   → email          (初期フォーカス移動、正常)
Tab 1  → subscribe-btn
Tab 2  → cancel-btn
Tab 3  → nav-home       ← オーバーレイ裏のナビへ脱出
Tab 4  → nav-products
Tab 5  → nav-pricing
Tab 6  → nav-contact
```

3回目で脱出。画面にはダイアログが鎮座しているのに、実際のフォーカスはその裏のリンクを順に巡っている。マウスユーザーは気づかない。キーボードだけで操作するユーザーにとっては、見えているUIと操作できるUIが乖離した状態だ。

![naive版でフォーカスがオーバーレイ裏のナビリンクに掛かった実測スクリーンショット。モーダルが開いたまま、フォーカスリングは背景上部のContactリンクにある。](../../../assets/blog/modal-focus-escape-inert-measure-2026/focus-escape.png)

この状態でaxe-coreを回した。違反は`region`(ランドマーク不足、moderate)の1件だけ。フォーカス脱出に関する違反は0件だった。axeの手抜きではない。「Tabを押したらフォーカスがどこへ行くか」は静的なDOM検査では判定できない動的な性質だからだ。自動チェックが構造的に見られない領域については[axe自動検査のカバレッジ実測](/ja/blog/ja/axe-automated-a11y-coverage-gap-2026)で整理したが、この脱出はまさにその死角に入る。

正直に言うと、`aria-modal="true"`だけ付けて背景を放置したモーダルは、実務のコードレビューで何度も見てきた。マークアップだけ見れば非の打ち所がないから、レビューも通ってしまう。Tabを3回押した人間だけが知る。

## aria-hidden版: 脱出に沈黙が加わる

第2バリアントは、モーダルを開くとき背景コンテナに`aria-hidden="true"`を付ける。スクリーンリーダーから背景を隠す古典的な処理だ。

```text
variant: ariahidden  (背景にaria-hidden="true")
open   → email
Tab 1  → subscribe-btn
Tab 2  → cancel-btn
Tab 3  → nav-home       ← やはり脱出する
Tab 4  → nav-products
```

`aria-hidden`が消すのはアクセシビリティツリーからの存在だけで、タブ順序には手を触れない。だからフォーカスはnaive版と同じように抜ける。しかも今回はもっと悪い。着地先のnav-homeはアクセシビリティツリーに存在しない要素だ。スクリーンリーダーの利用者から見れば、Tabを押したのに何も読み上げられない。フォーカスはあるのに名前も役割もない、ブラックホールに落ちる。フォーカスの着地先を支援技術が何と読むかは[accessible nameの実測](/ja/blog/ja/accessible-name-agents-2026)で扱ったテーマだが、今回は読み上げる名前ごとツリーから消えている。

面白いのはaxeの反応だった。axeにはこの状況を狙い撃つ`aria-hidden-focus`というルールがある。ところが今回の実測でこのルールは違反(violation)ではなく<strong>incomplete</strong>として返ってきた。ノードのメッセージはこうだ。

```text
rule: aria-hidden-focus → incomplete (target: #app)
check: focusable-modal-open
message: "Check that focusable elements are not tabbable in the current state"
```

モーダルが開いている状態では、背景のフォーカス可能要素が実際にタブ順序に残っているかを静的には断定できない。だから人間に確認を委ねる。ルール設計としては誠実だと思う。問題は、大半のCIパイプラインがviolations配列だけをゲートにして、incompleteを捨てていることだ。「違反0件」のレポートの裏で、人間宛の確認依頼が黙って消えていく。私がさっきTabキーでやったことこそ、axeが人間に頼んだその手動確認だった。

## inert版: 背景への着地0回

第3バリアントは、開くときに背景コンテナへ`inert`を掛ける。コードは1行だ。

```js
// 開くとき
app.inert = true;
modal.querySelector('input').focus();

// 閉じるとき
app.inert = false;
openBtn.focus();
```

同じ手順でTabを6回。

```text
variant: inert  (背景にinert)
open   → email
Tab 1  → subscribe-btn
Tab 2  → cancel-btn
Tab 3  → (ブラウザUI: アドレスバー領域)
Tab 4  → email          ← 文書に戻るときモーダル先頭へ
Tab 5  → subscribe-btn
Tab 6  → cancel-btn
```

背景への着地は0回。フォーカスはモーダル内の3要素を循環する。フォーカストラップのJavaScriptは1行も書いていない。`inert`がサブツリー全体をタブ順序から外し、アクセシビリティツリーからも取り除き、クリックもページ内検索も遮断するからだ(MDNの記載に基づく)。`aria-hidden`がやっていた仕事とフォーカス遮断を、ひとつの属性がまとめて引き受ける。

計測中に拾った細部を2つ残しておく。ひとつ、`inert`が掛かった要素のcomputed styleでは`pointer-events`は`auto`のままだった。遮断はスタイルではなくユーザーエージェント内部で行われている。もうひとつ、`inert`状態でもJavaScriptの`el.click()`は普通に発火する。`inert`が防ぐのはユーザー操作であって、プログラムからの呼び出しではない。テストが`.click()`で通ることと、実際のユーザーがクリックできることは別物だという話でもある。

Tab 3でフォーカスが一度アドレスバーへ出るのは正常だ。APGが求める循環は文書内のタブ順序についてであり、ブラウザUIはもともとその外にある。文書へ戻るときにモーダルの先頭要素へ入れば要件は満たされる。

注意点もある。MDNが明示的に警告している通り、`inert`が掛かっていることを示すデフォルトの見た目の変化は一切ない。`disabled`のようにグレーアウトもしない。モーダルではオーバーレイがその役を担うから問題にならないが、ページの一部だけをinertで眠らせる他の用途に持ち出すなら、視覚的な区別を自分で設計する必要がある。また、フォームコントロールを個別に無効化したいだけなら`inert`ではなく`disabled`が正解だ。セマンティクスもスタイルのフックもあちらが本職である。

## どれを使うか: 梯子は三段

今回の実測を踏まえた私の選択順はこうだ。

| 順位 | 方法 | 背景の遮断 | 根拠 |
|---|---|---|---|
| 1 | `<dialog>` + `showModal()` | ブラウザが自動処理 | MDN: ダイアログ外の要素は "become inert (as if the inert attribute is specified)" |
| 2 | カスタムオーバーレイ + 背景`inert` | 1行で明示的に遮断 | 今回の実測 — 背景着地0回 |
| 3 | JSフォーカストラップ | keydownを横取り | レガシー対応が必須のときだけ |

1位がネイティブ`<dialog>`である理由は明快で、`showModal()`を呼べばダイアログ外の文書全体がinert化され、top layerへの配置、`::backdrop`、Escでの閉じるまでプラットフォームが面倒を見る。この記事で手作りしたものが全部ただで付いてくる。デザインシステムの都合でカスタムオーバーレイを維持するなら2位、背景コンテナに`inert`1行。`inert`はBaseline基準で2023年4月から全主要ブラウザで使える(Chrome 2022、Firefox・Safari 2023)。keydownを奪って先頭・末尾要素を手動で循環させる古典的フォーカストラップは、もう3位だ。動きはするが、タブ可能要素の一覧を自前で計算・維持する必要があり、モーダルに要素が増えるたびに壊れる機会が生まれる。

ひとつ立場を明確にしておく。背景遮断の用途で`aria-hidden="true"`を単独で使うパターンは、もう引退させるべきだと私は考えている。実測が示した通りフォーカスは素通りし、しかも抜けた先がスクリーンリーダーにとって沈黙の場所になる。`inert`がアクセシビリティツリーの除去まで兼ねる以上、`inert`が使える環境で`aria-hidden`を併用する利点はない。

## 正直な限界

この測定が語らないことを書いておく。第一に、これはキーボードのタブ順序の実測であって、スクリーンリーダー挙動の実測ではない。VoiceOverやNVDAの探索カーソルはタブ順序とは別に動くため、`aria-modal`と`inert`が読み上げナビゲーションでどう効くかは別途の実測が要る。本稿はそれをやっていない。第二に、axeのincompleteを欠陥のように読まないでほしい。動的な状態を静的ルールで断定せず人間に委ねるのは、設計として誠実な側だ。問題はその委任を受け取る人間がパイプラインにいないという運用の空白である。第三に、ここで扱ったのはWCAG 2.4.3(Focus Order)系統のひとつの症状であって、これを直せばページの適合性が保証されるわけではない。[WCAG 2.2ターゲットサイズの実測](/ja/blog/ja/wcag22-target-size-audit-2026)でも同じ結論だったが、自動スコアと適合性の距離は思いのほか遠い。第四に、計測はChrome 150の単一ブラウザで行った。`inert`はBaseline上どのブラウザでも同じに動くはずだが、FirefoxとSafariでのタブ順序の実測は今回の範囲に入れていない。クロスブラウザの回帰まで押さえるなら、同じプローブをPlaywrightで3エンジンに回すのが次の一手になる。

## リリース前のモーダル点検・五行

- モーダルを開き、要素数+2回Tabを押す。フォーカスが一度でもオーバーレイ裏の要素に掛かったら不合格。
- `aria-modal="true"`があるなら、その宣言を裏付ける実際の遮断(`showModal()`または`inert`)がコードに存在するか確認する。
- 背景遮断を`aria-hidden`だけに頼っているなら`inert`へ置き換える。
- axe/CIレポートのviolationsだけでなくincomplete配列を開く。`focusable-modal-open`があれば、上のTabテストがその回答になる。
- 閉じたときフォーカスがモーダルを開いたトリガーへ戻るか確認する(APGの要件)。

キーボードフォーカスは、自動ツールが最後まで代わりに押してくれない領域だ。Tab数回で確かめられることを確かめないまま、緑のレポートだけが積み上がっているサイトは多い。運用中サイトのモーダル・オーバーレイのキーボード挙動点検や、アクセシビリティ監査をCIゲートまで落とし込む作業は、個人で相談・実装を請けています。必要でしたら[お問い合わせ](/ja/contact)からどうぞ。
