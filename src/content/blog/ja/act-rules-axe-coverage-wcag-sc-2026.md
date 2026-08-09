---
title: 'WCAG 2.2 AAのルールが既定で無効だった: 正解付き1,213件で測った自動チェックの守備範囲'
description: 'W3C ACTが公開する正解ラベル付きテストケース1,213件にaxe-coreを全件通した。失敗するはずの387件のうち、当該達成基準で違反が出たのは145件(37.5%)。基準36個のうち22個は0件で、沈黙の一部はルールが既定でオフだったことに起因する。'
pubDate: '2026-08-06'
heroImage: '../../../assets/blog/act-rules-axe-coverage-wcag-sc-2026/hero.png'
tags:
  - アクセシビリティ
  - WCAG
  - CI
  - テスト
  - Web開発
faq:
  - question: '自動チェックが37.5%なら、残りは全部手動で見るしかないのですか。'
    answer: '全部ではありません。沈黙した230件のうち一部はルールが無効だっただけで、実験的ルールとAAAルールを有効にすると166件まで上がりました。残るのはリンクテキストが目的を説明しているか、エラーメッセージが何を間違えたか伝えているかなど、人が意味を読まないと判定できない項目です。重要なのは割合ではなく一覧です。どの達成基準が自動で決まり、どれが残るかを書き出しておけば、人の時間をその一覧だけに使えます。'
  - question: 'axeのexperimentalルールは有効にしてよいのですか。'
    answer: '有効化自体は問題ありませんが、いきなりゲートの失敗条件にするのは勧めません。Dequeがexperimentalと付けているのは誤検知の余地が残るという意味なので、私はまずビルド失敗ではなくレポート項目として数日分ためてから昇格させます。一方でtarget-sizeのようにWCAG 2.2 AAに対応するルールが既定で無効な場合は話が別で、これは有効にして失敗条件に入れるべきです。'
  - question: 'この測定を自分のサイトにそのまま使えますか。'
    answer: 'これはサイト監査ではなくチェッカー監査です。対象は自分のサイトではなくW3Cが公開する例で、得られるのも「自分のサイトに違反が何件」ではなく「自分のチェッカーがどの基準を決められるか」です。だから一度回して一覧を作れば、ツールやバージョンを変えるまで使い回せます。スクリプトはリポジトリに置いてあり、引数なしで1分程度です。'
  - question: 'axeではなくLighthouseや他のツールなら結果は変わりますか。'
    answer: '変わります。この記事の数値はaxe-core 4.13.0ひとつについてのものです。Lighthouseのアクセシビリティカテゴリは内部でaxeを使いますが、ルール集合はまた別です。ツールを替えるならカバレッジ一覧も取り直す必要があります。同じスクリプトに別のチェッカーを噛ませれば比較できますが、その比較はまだやっていません。'
relatedPosts:
  - slug: wcag-em-2-sampling-vs-full-sweep-audit-2026
    score: 0.78
    reason:
      ko: 그 글은 페이지를 몇 장 보느냐를 셌고, 이 글은 규칙이 몇 개를 결정하느냐를 센다. 전수로 훑어도 검사기가 판정하지 못하는 기준은 그대로 남는다.
      ja: あちらは「何ページ見るか」を数えた。この記事は「ルールが何を決められるか」を数える。全ページ走査しても判定できない基準は残る。同じ穴を別の面から見ている。
      en: That audit counted how many pages you look at. This one counts how many criteria the checker can actually decide. Sweep every page and the undecidable criteria are still there.
      zh: 那篇数的是「看几页」，这篇数的是「规则能判几条」。就算全量扫描，判不了的标准照样留在原地。
  - slug: axe-core-ci-a11y-jsdom-vs-browser-2026
    score: 0.74
    reason:
      ko: jsdom에서 색상 대비가 조용히 빠지는 걸 확인했던 글이다. 이번에는 브라우저를 띄워 그 변수를 없앤 뒤에도 남는 공백을 성공기준 단위로 셌다.
      ja: jsdomでコントラスト比が黙って抜ける件を確かめた記事。今回はブラウザを立ててその変数を消した上で、なお残る空白を達成基準ごとに数えた。実行環境の問題とルール網羅の問題は別の層にある。
      en: That post found color contrast quietly dropping out under jsdom. This one removes that variable with a real browser, then counts what is still missing, criterion by criterion.
      zh: 那篇发现对比度在 jsdom 里会悄悄消失。这篇干脆开真浏览器把这个变量去掉，再按成功标准数还剩多少空白。
  - slug: wcag22-target-size-audit-2026
    score: 0.71
    reason:
      ko: 그때 타깃 크기를 직접 재면서 axe에 관련 규칙이 있다는 건 알고 있었다. 이번 측정에서 그 규칙이 기본 비활성이라는 걸 알았다.
      ja: あの時ターゲットサイズを自分で測りながら、axeに該当ルールがあることは知っていた。今回の測定で、そのルールが既定で無効だと分かった。WCAG 2.2 AAなのに、設定なしでは走らない。
      en: While measuring target sizes back then I knew axe had a rule for it. This measurement showed that rule ships disabled, even though it maps to a WCAG 2.2 AA criterion.
      zh: 当时手测目标尺寸时，我知道 axe 有对应规则。这次测量才发现那条规则默认是关的——明明对应 WCAG 2.2 AA。
  - slug: focus-not-obscured-sticky-header-scroll-padding-2026
    score: 0.66
    reason:
      ko: 포커스 가림은 axe에 규칙 자체가 없어서 스크립트를 직접 짜야 했던 사례다. 규칙이 없는 기준과 규칙이 꺼진 기준은 대응이 다르다.
      ja: フォーカスの隠れはaxeにルール自体が無く、スクリプトを自分で書くしかなかった事例だ。本記事の表に2.4.11が現れない理由でもある。ルールが無い基準と、切れている基準では打ち手が違う。
      en: Focus occlusion had no axe rule at all, so I wrote the script myself. That is also why 2.4.11 never appears in this article's table.
      zh: 焦点被遮挡在 axe 里压根没有规则，只能自己写脚本。这也是本文表格里看不到 2.4.11 的原因。
---

axe-core 4.13.0 のルール定義を開くと、`target-size` にこう書いてある。

```js
{ id: 'target-size', tags: ['cat.sensory-and-visual-cues', 'wcag22aa', 'wcag258'], enabled: false }
```

`wcag22aa`。WCAG 2.2 で AA として新設された達成基準 2.5.8 に対応するルールだ。そして `enabled: false`。`axe.run(document)` を引数なしで呼ぶ限り、このルールは走らない。

「CI で WCAG 2.2 AA を見ています」と言ってきたパイプラインが、達成基準をひとつ丸ごと素通りしていた。気づいたのは、自動チェックの守備範囲を数字にしようとして全件測定を回している最中だった。

## 緑ランプは二つの意味を一文字で覆う

自動アクセシビリティチェッカーはルールの集合体だ。ルールひとつが文書内から自分の対象を探し、見つけたそれぞれに合格・違反・判定保留のいずれかを付ける。axe-core なら結果は四つの山に分かれる。`violations`、`passes`、`incomplete`(人が見る必要あり)、`inapplicable`(対象なし)だ。

CI に組み込むとき、私たちが見るのはたいてい最初の山ひとつ。`violations.length === 0` なら通す。ここに静かな前提が入り込む。<strong>ルールが扱わない問題は、そもそも数えられない</strong>という前提だ。

つまり「見たけれど問題なかった」と「見ていない」が、ログ上では同じ 0 になる。外部監査を受けたことがあるチームなら、この落差を体験しているはずだ。CI は何か月も緑なのに、監査報告書には指摘が数十件並ぶ。

落差の大きさを測るには正解が要る。自分のサイトには正解がない。違反が何件あるかを知るには人が全件見るしかなく、それができるならチェッカーは要らない。

## W3C が正解を配っている

アクセシビリティツール同士で結果が食い違う問題は古い。同じページを二つのツールに通すと違反数が違い、どちらが正しいか判断する物差しがなかった。W3C の ACT(Accessibility Conformance Testing)はここに応えて作られた枠組みだ。ルールの記述形式を標準化し、ルールごとに<strong>合格する例・違反する例・対象外の例</strong>を添えて公開する。ツールをその例に通せば、ツール同士を比べられる。

[ACT Rules Format 1.1](https://www.w3.org/TR/act-rules-format-1.1/) は 2026 年 2 月 5 日に W3C 勧告になった。ルール一覧とテストケースは [ACT Rules のページ](https://www.w3.org/WAI/standards-guidelines/act/rules/)にあり、機械可読な形でも出ている。`testcases.json` 一本に全部入りだ。

```json
{
  "ruleId": "674b10",
  "ruleName": "Role attribute has valid value",
  "ruleAccessibilityRequirements": {
    "wcag-technique:ARIA4": { "failed": "not satisfied" },
    "wcag20:4.1.2": { "secondary": "This success criterion is less strict than this rule..." }
  },
  "expected": "passed",
  "relativePath": "testcases/674b10/c181f7267bf9f4fc0f9ad9e2a69c1ad7da504f4d.html"
}
```

取得したら 1,213 件あった。ACT ルール 87 個から出たもので、ラベルは合格 472 件、失敗 393 件、対象外 348 件に分かれる。87 個のうち 63 個は WCAG 達成基準を一次要件として指し、残り 24 個は達成基準ではなく WCAG 達成方法(technique)だけを指す。一次要件として登場する達成基準を数えると 37 個だった。

小さな罠があった。w3.org に Node の `fetch` で叩くと HTTP 429 が返る。`curl` なら通るのにスクリプトからは全滅する。ここで 40 分を溶かした。最終的に同じファイルが [w3c/wcag-act-rules リポジトリ](https://github.com/w3c/wcag-act-rules)にそのまま置かれているのを確認し、そちらから取得した。両者が同一かは SHA-256 で照合した。同一だった。

1,213 件のうち 453 件は `/WAI/content-assets/wcag-act-rules/test-assets/` 以下の画像・動画・下位ページを絶対パスで参照している。そこでローカル HTTP サーバーを同じパス構造で立てて配った。アセット 96 個を併せて取得し、2MB を超えるサンプル動画 6 本(最大 35.5MB)は省いた。動画のピクセルを見て判定するルールは無い。

## 「違反が一件でも出た」は信号にならなかった

最初は素朴に数えた。失敗例で axe が違反をひとつでも吐けば捕捉と見なす方式だ。387 件中 386 件、99.7%。一瞬喜びかけた。

同じ計算を合格例に回すと、461 件中 458 件が違反として出ていた。99.3%。理由はすぐ分かった。ACT のテストケースはルールひとつを見せるための最小文書で、`<main>` も `<h1>` も無い。だからページ構造を見るルールがほぼ全件で発火する。

失敗ではない例 799 件について、axe が出した違反をルール別に数えるとこうなる。

| axe ルール | 発火 | 割合 | タグ |
|---|---|---|---|
| `landmark-one-main` | 784 | 98% | best-practice |
| `page-has-heading-one` | 754 | 94% | best-practice |
| `region` | 572 | 72% | best-practice |
| `document-title` | 192 | 24% | wcag2a |
| `html-has-lang` | 74 | 9% | wcag2a |

上位三つはすべて `best-practice` タグ。WCAG 適合の項目ではなく Deque が推奨する慣行だ。ゲートを組むときタグで絞らないと、この三つが信号を覆い尽くす。下の二つは WCAG タグ付きだが、ここでは断片文書を検査したことによる産物だ。

そこで判定基準を変えた。<strong>失敗例で axe が出した結果のタグに、その ACT ルールが指す達成基準が含まれているときだけ捕捉と数える。</strong>ACT ルール `674b10` が 4.1.2 を指すなら、axe の結果に `wcag412` タグが要る。そのうえで結果を三つに割った。違反として断定した場合、`incomplete` で人に渡した場合、何も言わなかった場合だ。

この三つ目がこの測定の肝になる。人に渡すのと黙るのは CI 上では全く別の事件なのに、既定のレポーターはどちらも静かに通り過ぎる。

## 37.5% という総計では何も決められない

axe-core 4.13.0 をヘッドレス Chromium 143 に載せて全件回した。1 分かからない。

```
failing examples evaluated: 387 (unevaluable 6, page errors 27)
  criterion-matched violation : 145 (37.5%)
  needs-review only           :  12 ( 3.1%)
  silent                      : 230 (59.4%)
```

37.5%。「自動ツールは三分の一くらい」という業界の相場観と大きくは違わない。だがこの数字ひとつでは何も決まらない。明日どこを直すか、手動チェックの時間をどこに使うかは、総計からは出てこない。

達成基準ごとに割ると話が変わる。

![WCAG達成基準ごとに、axe-coreがACTの失敗例に対して出した判定を違反・要確認・沈黙の三つに分けた横棒グラフ。4.1.2は52件中48件が違反として出る一方、2.5.3・1.4.6・2.4.9・2.4.6は0件](../../../assets/blog/act-rules-axe-coverage-wcag-sc-2026/sc-coverage.png)

| 達成基準 | 失敗例 | 違反 | 要確認 | 沈黙 |
|---|---|---|---|---|
| 4.1.2 Name, Role, Value | 52 | 48 | 2 | 2 |
| 1.1.1 Non-text Content | 26 | 18 | 0 | 8 |
| 2.4.4 Link Purpose (In Context) | 25 | 11 | 0 | 14 |
| 1.3.1 Info and Relationships | 21 | 18 | 2 | 1 |
| 2.5.3 Label in Name | 16 | 0 | 0 | 16 |
| 1.4.12 Text Spacing | 14 | 13 | 0 | 1 |
| 1.4.6 Contrast (Enhanced) | 13 | 0 | 0 | 13 |
| 2.4.9 Link Purpose (Link Only) | 11 | 0 | 0 | 11 |
| 1.3.5 Identify Input Purpose | 10 | 10 | 0 | 0 |
| 2.4.6 Headings and Labels | 10 | 0 | 0 | 10 |

4.1.2 は 52 件中 48 件。名前・役割・値は DOM とアクセシビリティツリーを見れば決まる領域で、チェッカーが強い。1.3.5 と 1.4.12 も同様だ。反対側には 0 が並ぶ。2.5.3(見えるラベルがアクセシブルネームに含まれるか)は 16 件中 0 件、2.4.6(見出しとラベルが内容を説明するか)は 10 件中 0 件、2.4.9(リンクテキスト単体で目的が分かるか)は 11 件中 0 件。

全体では<strong>登場した達成基準 36 個のうち 22 個で違反がゼロ</strong>だった。ACT ルール 87 個のうち 54 個は、自分の失敗例すべてに対して違反も要確認も出していない。

ここを誤読してはいけない。この 0 の多くは axe の欠陥ではない。「リンクテキストが目的を説明しているか」は意味を読む判断で、確信のないままチェッカーが違反を吐けば誤検知が溜まり、誰も結果を見なくなる。W3C も[評価ツールの概要](https://www.w3.org/WAI/test-evaluate/tools/)で線を引いている。「However, tools can't do it all. Some accessibility checks just cannot be automated and require manual intervention.」

ひとつ付け加えておきたい。意味を読む必要があって残る基準のほかに、ビューポートを実際に動かさないと判定できない基準もこの一覧には混ざる。1.4.10 リフローがそれだ。固定ビューポートで DOM だけを走査する今回の測定からは、そもそも出てこない項目である。[3つの高さで同時に測ってみると、判定が分かれたのは横ではなく縦だった](/ja/blog/ja/reflow-1410-400-zoom-viewport-height-2026/)。沈黙の一覧を書くときは、「人が読むしかないもの」と「別の条件で測り直すもの」を分けておいたほうがいい。

私の判断はこうだ。問題はツールが黙ることではなく、<strong>その沈黙がパイプラインのどこにも記録されないこと</strong>にある。自動で決まらない 22 基準の一覧は、ツールを選んだ時点ですでに確定している。なのにその一覧を持っているチームを、私はほとんど見たことがない。

## 沈黙の一部は能力ではなく設定だった

表を眺めていて 2.5.3 が引っかかった。axe には `label-content-name-mismatch` というルールがあり、タグに `wcag253` が付いている。ルールがあるのに 16 件全部沈黙というのは辻褄が合わない。

ルールのメタデータを開くと、このルールには `experimental` タグが付いていた。そして [axe-core の API ドキュメント](https://github.com/dequelabs/axe-core/blob/develop/doc/API.md)にそのまま書いてある。

> The default operation for axe.run is to run all rules except for rules with the "experimental" tag.

同じ文書のタグ表にはこうある。「`experimental` | Cutting-edge rules, disabled by default」。冒頭の `target-size` も同じ穴の話だった。

axe-core 4.13.0 のルールを数えると全部で 105 個。WCAG タグ付きが 75 個、`best-practice` が 30 個。このうち `enabled: false` で配布されるルールが 9 個、`experimental` タグ付きが 7 個。合わせて<strong>16 個のルールが既定の実行対象から外れている。</strong>

| ルール | タグ | どこに効くか |
|---|---|---|
| `color-contrast-enhanced` | wcag2aaa, wcag146 | 1.4.6 の失敗例 13 件が全部沈黙した原因 |
| `identical-links-same-purpose` | wcag2aaa, wcag249 | 2.4.9 の 0 件 |
| `label-content-name-mismatch` | wcag21a, wcag253, experimental | 2.5.3 の 0 件 |
| `meta-refresh-no-exceptions` | wcag2aaa, wcag224, wcag325 | 2.2.4・3.2.5 の 0 件 |
| `target-size` | <strong>wcag22aa</strong>, wcag258 | WCAG 2.2 AA なのに既定で無効 |

`target-size` だけは AAA でも experimental でもない。[この基準は以前に自分で測って直した](/ja/blog/ja/wcag22-target-size-audit-2026)。それでも設定なしでは走らない。

というわけで全ルールを有効にして回し直した。

```
failing examples evaluated: 383 (unevaluable 10, page errors 38)
  criterion-matched violation : 166 (43.3%)
  needs-review only           :  21 ( 5.5%)
  silent                      : 196 (51.2%)
```

37.5% から 43.3% へ。違反 0 件だった達成基準は 22 個から 18 個に減った。回復したのは 2.5.3(0→14 件)、1.4.6(0→9 件)、2.2.4 と 3.2.5(各 0→2 件)。2.4.9 は違反としては依然 0 だが `incomplete` が 6 件出るようになり、少なくとも「人が見るべき」という信号は立つ。

既定と全実行で実際に発火したルール数は 45 個と 52 個。ルール 7 個の差が達成基準 4 個を復活させた。

## ゲートをこう組む

測定から出た処方は三つ。順にコードに落とす。

<strong>一つ、タグで範囲を明示する。</strong>`best-practice` を混ぜると、さきほどの `landmark-one-main` のようなルールが信号を覆う。悪いルールだからではなく、適合ゲートとコーディング慣行レポートでは失敗条件が違うべきだからだ。

<strong>二つ、無効なルールのうち必要なものを明示的に有効化する。</strong>とりわけ `target-size`。遵守目標に AAA を含むなら `color-contrast-enhanced` と `identical-links-same-purpose` も。

<strong>三つ、`incomplete` を出力する。</strong>失敗条件にしろという話ではない。ログに数字が残って初めて「ゲートは通ったが 12 件は人が見る必要がある」が見える。

```js
const AXE_OPTIONS = {
  runOnly: {
    type: 'tag',
    values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'],
  },
  rules: {
    // WCAG 2.2 AA なのに既定で無効。有効にしないと 2.5.8 は誰も見ない。
    'target-size': { enabled: true },
    // experimental。ゲート失敗ではなくレポートとして先にためる。
    'label-content-name-mismatch': { enabled: true },
  },
  resultTypes: ['violations', 'incomplete'],
};

const result = await new AxePuppeteer(page).options(AXE_OPTIONS).analyze();

const blocking = result.violations.filter((v) => !v.tags.includes('experimental'));
const advisory = result.violations.filter((v) => v.tags.includes('experimental'));

console.log(`violations ${blocking.length} / advisory ${advisory.length} / needs review ${result.incomplete.length}`);
for (const item of result.incomplete) {
  console.log(`  review: ${item.id} (${item.nodes.length} nodes) — ${item.help}`);
}

if (blocking.length > 0) process.exit(1);
```

ここまでが自動で決まる側だ。残る側は一覧にする必要がある。今回の測定で違反 0 件だった達成基準をそのまま移せば手動チェック項目になる。2.4.6(見出しとラベル)、2.4.9(リンクテキスト)、3.3.1(エラーの特定)、1.3.3(感覚的な特徴)、2.1.2(キーボードトラップ)、1.4.5 と 1.4.9(文字画像)、1.2.x(メディアの代替)系だ。この一覧はページごとに作り直す必要がない。ツールとバージョンが固定なら一覧も固定される。

私の順序はこうだ。全件自動チェックで決まる基準を落とし、人の時間は上の一覧だけに使う。[標本をどう取るかで悩んでいた問題](/ja/blog/ja/wcag-em-2-sampling-vs-full-sweep-audit-2026)と対になる軸だ。あちらが「何ページ見るか」なら、こちらは「何を見られるか」。両方に答えがあって初めて監査計画が立つ。

## この数字が言っていないこと

測定条件をそのまま書く。

ACT のテストケースはルールひとつを見せるための最小文書であって、実際のページではない。実ページでは文脈が豊かでチェッカーがより判定できる場合も、要素が多くて取りこぼす場合もある。この数字は実務サイトの検出率ではなく、<strong>ルール網羅の上限に近い指標</strong>として読むべきだ。

読み込み自体が通らないケースがある。`meta refresh` が仕込まれていたり画面の向きを制限する例で、ブラウザがページを遷移させてしまう。実行ごとに 27〜38 件がこれに当たり、評価対象数が毎回数件揺れる。百分率は 1 ポイント以内で動いた。

W3C はツール別の ACT 実装レポートを別途公開している。この記事はそれではない。あちらはルール単位の実装一致度を見る。こちらは「設定なしで CI に載せたとき達成基準ごとに何が決まるか」を見る。問いが違うので数字を並べてはいけない。

そしてこの数字は axe-core 4.13.0 ひとつについてのものだ。別のチェッカーは別の一覧を持つ。最後に、当たり前だが書いておく。<strong>自動ルールを全部通ったことは WCAG 適合ではない。</strong>適合は人が判定する。この隔たりが一番はっきり出るのが 1.4.12 テキストの間隔だ。[字間を基準どおりに広げて 570 か所が切れるのを実測した](/ja/blog/ja/text-spacing-1412-clamp-audit-2026/)ことがあるが、そのページはチェッカー上ではすべて AA 通過だった。

## まとめ: 今日作っておく二つの一覧

- 使っているチェッカーのバージョンを固定し、そのバージョンで<strong>既定無効のルール一覧</strong>を取る。axe なら `enabled: false` と `experimental` を合わせて 16 個。
- そのうち遵守目標に入るルールを明示的に有効化する。`target-size` は WCAG 2.2 AA を目標にするなら選択肢ではない。
- ゲートの `runOnly` をタグで絞り、`best-practice` が適合信号を覆わないようにする。
- `incomplete` の件数をログに残す。緑ランプと「判定保留 12 件」が区別して見えること。
- 違反 0 件だった達成基準をそのまま<strong>手動チェック一覧</strong>にする。この一覧が無いと手動チェックは毎回その場しのぎになる。
- ツールやバージョンを上げたら二つの一覧を取り直す。ルールひとつの有効・無効で達成基準ひとつが丸ごと動く。

スクリプトは `scripts/act-coverage-audit.mjs` としてリポジトリに置いた。引数なしなら既定ルールセット、`--all-rules` を付ければ全ルール基準で同じ表が出る。初回はテストケースの取得で少しかかり、以降は 1 分以内だ。

いま動かしているアクセシビリティゲートが、どの達成基準を実際に決めているか。一覧として書き出したことがあるだろうか。無いなら、その一覧を作るところから始めればいい。声をかけるなら[プロフィール](/ja/about/)へ。

---

*出典: W3C の [ACT Rules Format 1.1](https://www.w3.org/TR/act-rules-format-1.1/)(W3C 勧告、2026年2月5日)、[ACT Rules](https://www.w3.org/WAI/standards-guidelines/act/rules/)、[Web Accessibility Evaluation Tools List](https://www.w3.org/WAI/test-evaluate/tools/)、Deque の [axe-core API ドキュメント](https://github.com/dequelabs/axe-core/blob/develop/doc/API.md)(いずれも公式)。測定環境: W3C ACT Task Force テストケース 1,213 件(2026年8月6日取得、ルール 87 個)、axe-core 4.13.0、Playwright 1.57 + Chromium 143.0.7499.4 ヘッドレス、Node 22.22、ビューポート 1280×800、ローカル HTTP サーバー。テストケースのファイルは w3c/wcag-act-rules リポジトリから取得し、w3.org の原本と SHA-256 で照合した。すべての数値はこのツール・このバージョン・このテストスイートで得た値であり、実際のウェブサイトでの検出率や他の検査ツールの性能についての記述ではない。*
