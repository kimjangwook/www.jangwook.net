---
title: 'head内に書いたrobots metaがbodyに落ちる条件'
description: 'Googleは2026年3月、robots metaをbodyに置いても尊重すると文書に書き加えた。ただしhead/bodyの境界は著者が宣言する値ではなく、パーサーが計算する結果だ。配置10通りをparse5に通し、要素がどこに置かれ、3通りで要素自体が消えるかを実測した。着地点を先に確認する記録だ。'
pubDate: '2026-08-13'
heroImage: '../../../assets/blog/robots-meta-head-body-parser-placement-2026/hero.png'
tags:
  - SEO
  - クローリング
  - HTML
  - Web開発
  - 検索最適化
faq:
  - question: 'robots metaをbodyに置いても問題ないのですか。'
    answer: 'Googleに限れば問題ありません。Googleはrobots metaの仕様文書で、head内への配置を強制せず、body内のrobots metaも尊重すると明記しています。ただし他の検索エンジンや社内の検査ツールが同じ判断をする保証はなく、私の計測では、headを起点に要素を探す一般的な実装はbodyに落ちた指示子をすべて取り逃がしました。'
  - question: 'head内に書いたのに、なぜbodyへ移されるのですか。'
    answer: 'パーサーがheadを閉じる時点が、著者の書いた</head>とは限らないからです。head内にhead用ではない内容が一つでも現れると、パーサーはそこでheadを閉じてbodyを開きます。計測では、head内に文字列を一つ、あるいはdivを一つ先に置いただけで、後続のrobots metaは両方ともbodyの子として構築されました。'
  - question: 'noscriptの中にnoindexを入れる方法はどうですか。'
    answer: 'スクリプティングが有効なパーサーでは、その中身は要素ではなく純粋なテキストとして扱われます。HTML標準がnoscriptの動作をそう定義しており、Googleは常緑版のChromiumでレンダリングすると公表しています。計測でもスクリプティングを有効にしたパースでは、meta要素はツリー上に存在しませんでした。'
  - question: 'JavaScriptでrobots metaを付けたり消したりしてもよいですか。'
    answer: 'Googleの文書は、noindexに遭遇するとレンダリングとJavaScriptの実行を省略する場合があるため、JavaScriptでrobots metaを変更したり削除したりする方法は期待どおりに動かないことがあると述べています。インデックスさせたいページなら、そもそも元のコードにnoindexを書くなというのが文書の勧告です。'
relatedPosts:
  - slug: robots-snippet-controls-ai-overviews-2026
    score: 0.88
    reason:
      ko: 그 글은 지시자가 무엇을 정하는지를 다뤘고, 이 글은 그 지시자가 문서 트리 어디에 놓이는지를 다룬다. 값이 맞아도 요소가 없으면 값은 읽히지 않는다.
      ja: あちらは指示子が何を決めるかの話で、こちらはその指示子が文書ツリーのどこに落ちるかの話だ。値が正しくても要素がなければ読まれない。
      en: That post covered what the directives decide. This one covers where the directive lands in the document tree. A correct value in a node that was never built is not read at all.
      zh: 那篇讲的是指令决定什么，这篇讲的是指令最后落在文档树的哪里。值写对了，元素没生成，照样读不到。
  - slug: ai-crawler-control-robots-txt-llms-txt-2026
    score: 0.79
    reason:
      ko: robots.txt는 크롤러가 들어오기 전 층이고 robots meta는 들어온 뒤의 층이다. 두 층을 같이 봐야 "막았다고 믿었는데 안 막혔다"가 어디서 생기는지 보인다.
      ja: robots.txtはクローラーが入る前の層、robots metaは入った後の層だ。二つを並べて見ると「ブロックしたつもりが効いていない」がどこで生まれるか分かる。
      en: robots.txt is the layer before the crawler arrives; robots meta is the layer after. Reading both together is how you find where "I thought I blocked it" actually breaks.
      zh: robots.txt 是爬虫进来之前那层，robots meta 是进来之后那层。两层一起看，才知道"以为挡住了其实没挡住"是在哪儿出的。
  - slug: speakable-cssselector-pointer-rot-2026
    score: 0.74
    reason:
      ko: 마크업이 문자열로는 멀쩡한데 실행해 보면 다른 곳을 가리키고 있더라는 이야기를 그 글에서 먼저 했다. 이번에는 가리키는 쪽이 아니라 놓이는 쪽에서 같은 일이 벌어졌다.
      ja: マークアップは文字列としては正しいのに、動かすと別の場所を指していたという話をあの記事で先にした。今回は指す側ではなく置かれる側で同じことが起きた。
      en: That post made the case that markup can look correct as a string and still point somewhere else once you run it. Here the same thing happens on the placement side rather than the pointing side.
      zh: 那篇先讲过：标记作为字符串看着没问题，一跑起来却指向别处。这次同样的事发生在"落在哪里"这一侧，而不是"指向哪里"。
---

Googleのrobots meta仕様文書に、2026年3月24日づけで一文が加わった。配置を強制しない、という趣旨の注記だ。

その一文を読んだとき、私が最初に思ったのは「助かった」ではなく「では、いま自分のページのrobots metaは実際どこに置かれているのか」だった。head内に書いたつもりの要素が本当にhead内にあるかどうかを、私は一度も確かめたことがなかった。

確かめてみたら、配置10通りのうちheadに残ったのは2通りだった。bodyへ移ったのが5通り。残る3通りでは、meta要素そのものが文書ツリーに構築されなかった。

![著者の書いたマークアップとパーサーの構築したツリーが分かれる地点](../../../assets/blog/robots-meta-head-body-parser-placement-2026/hero.png)

## Googleが3月に加えた一文

まず出典を押さえる。[Search Centralの文書更新履歴](https://developers.google.com/search/updates)の2026年3月24日の項に、robots meta文書へHTML head外のタグの扱いに関する注記を追加した、という行がある。当の注記は[robots metaタグの仕様文書](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag)にこうある。

> Google Search doesn't enforce placement of meta robots in the HTML head and will respect robots meta tags in the body section of an HTML document as well.

配置を強制せず、body内のrobots metaも尊重する。同じ文書はいまも「Place the robots `meta` tag in the `<head>` section of a given page」と案内しているので、推奨はheadのままで、許容範囲が明文化されたという構図になる。

ここで一つ立ち止まりたい。この注記を「これからはbodyに書いてよい」という許可として読むのは、たぶん筋が悪い。robots metaをわざわざbodyに書く人はほとんどいないからだ。現実にbodyへ置かれているrobots metaの大半は、著者がheadに書いたものがパーサーによって運ばれた結果である。

つまりこの注記が実際にやっているのは、新しい自由を与えることではない。これまで静かに失敗していた事故を、Google側でだけ失敗でなくしたことだ。事故そのものは残っている。

## head/bodyの境界は著者が決めていない

なぜ運ばれるのか。ここは基礎から置く。

ブラウザは受け取ったHTML文字列をそのまま使わない。トークンに分割し、規則に従って要素ツリーを構築する。この過程がツリー構築で、そこには「いまどの挿入モードか」という状態がある。`<head>`の中を処理しているあいだはin headモードだ。

問題はこのモードがいつ終わるかである。著者の書いた`</head>`で終わる、と考えるのが自然だろう。実際には違う。in headモードでheadに入れられない内容が一つでも現れた時点で、パーサーはそこでheadを閉じ、bodyを開き、その内容から改めて処理し直す。`</head>`は終了経路の一つにすぎない。

だからhead要素とbody要素の境界は、著者が宣言する値ではなくパーサーが計算する結果になる。指示子の値をどれだけ正確に書いても、この計算の結果しだいで置かれる場所が変わる。値の話は[AI Overviewが自分のページを引用するか決めるmeta一行](/ja/blog/ja/robots-snippet-controls-ai-overviews-2026)に指示子ごとにまとめたので、この記事では扱わない。今日の関心は場所だけだ。

## 10通りの配置をパーサーに通した

一時的なサンドボックスに文書を10個作った。入れるタグは全部同じで、`<meta name="robots" content="noindex">`の一行。変えたのはその行が置かれる位置だけである。パーサーにはparse5 8.0.1を使った。HTML標準のツリー構築アルゴリズムを実装したライブラリで、スクリプティングフラグを切り替えられる点が今回の目的に合っていた。

各文書をパースしたあとツリーを走査して`meta[name=robots]`を探し、その要素の祖先の連なりを記録した。要素が見つからない場合は、元の文字列がテキストノードとして残っているかも併せて確認している。

![10通りの配置と2つのスクリプティングフラグによる判定行列](../../../assets/blog/robots-meta-head-body-parser-placement-2026/placement-matrix.png)

| マークアップ | スクリプティング有効 | スクリプティング無効 |
| --- | --- | --- |
| A. head内（基準） | `head > meta` | `head > meta` |
| B. head内、コメントの後 | `head > meta` | `head > meta` |
| C. head内、文字列の後 | `body > meta` | `body > meta` |
| D. head内、`<div>`の後 | `body > meta` | `body > meta` |
| E. bodyの最初の子 | `body > meta` | `body > meta` |
| F. bodyの最後の子 | `body > meta` | `body > meta` |
| G. `<noscript>`の中 | 要素なし（テキスト） | `head > noscript > meta` |
| H. `<template>`の中 | 別フラグメント | 別フラグメント |
| I. head内、`<title>`未閉鎖 | 要素なし（テキスト） | 要素なし（テキスト） |
| J. body内、`<div>`の中 | `body > div > meta` | `body > div > meta` |

CとDが前節で言った事故そのものだ。head内に`hello`という文字列を一つ先に置いただけで、後続のmetaはbodyの子になった。`<div>`を一つ先に置いても同じ結果になる。コメントはheadに入れられるのでBには影響がない。

この差は実務で効く。計測タグを差し込むスクリプト、サーバーが挿入するバナー、テンプレートエンジンが残した空白でない一文字。どれもheadを早期に閉じうる。そして押し出されるのはrobots metaだけではない。canonicalもhreflangも一緒に出ていく。

C、D、そして意図的に置いたE・F・Jは、Googleがいま尊重すると明記している配置にあたる。ここまでは安心してよい話だ。

## noscriptの中のnoindexは逆に働く

今回いちばん長く手が止まったのはGだった。

`<noscript>`の中に`noindex`を入れるパターンは、防御的に見える。スクリプトが動かない環境でも指示子を残したい、という意図に読める。実際の動きは正反対だ。

HTML標準は`noscript`の仕組みをこう定義している。原文は[WHATWG HTMLのnoscript要素の節](https://html.spec.whatwg.org/multipage/scripting.html#the-noscript-element)にある。

> The `noscript` element is only effective in the HTML syntax, it has no effect in the XML syntax. This is because the way it works is by essentially "turning off" the parser when scripts are enabled, so that the contents of the element are treated as pure text and not as real elements.

スクリプトが有効なら中身は本物の要素ではなく純粋なテキストとして扱われる。要素でないからツリーにmetaノードは作られず、作られないから尊重する対象そのものが存在しない。

ではGoogleは有効側か無効側か。Googleの[JavaScript SEOの基本](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)がこう答える。「Google Search runs JavaScript with an evergreen version of Chromium」。常緑版のChromiumでJavaScriptを実行する。有効側である。

`<noscript>`に入れたrobots指示子は、Googleが見るツリーには存在しない。bodyにあるから無視されるのではなく、そもそも要素ではないので読むものがない。

ここでもう一段の分岐がある。同じマークアップをjsdom 30.0.1に入れ、オプションだけを変えてみた。

```
runScripts=undefined      -> meta要素あり: true  | noscriptのテキスト長: 0
runScripts=outside-only   -> meta要素あり: true  | noscriptのテキスト長: 0
runScripts=dangerously    -> meta要素あり: false | noscriptのテキスト長: 38
```

既定値では「ある」と答え、スクリプティングを実際に有効にすると「ない」と答える。同じ文字列、同じライブラリ、正反対の結論。そしてCIでjsdomを使うとき、たいていは既定値のままだ。検査が通した指示子をGoogleは見ていない、という組み合わせがここで生まれる。

HとIはもっと単純である。`<template>`の中身は文書ツリーではなく別のDocumentFragmentに入る。`document.querySelector`では見つからないし、当然指示子としても読まれない。Iは`<title>`を閉じ忘れた場合で、`title`は中身をテキストとして飲み込む要素なので、後続のマークアップがまるごとタイトル文字列になった。こちらはスクリプティングフラグと無関係に要素が消える。

## 自前の検査のほうが厳しかった

指示子がどこに置かれるかが分かったので、次は探す側を見た。社内のリンターでもSEOクローラーでもプリレンダーの検証でも、robots metaを確認するコードはたいてい一行のセレクタである。その一行をよくある2形態に置き、同じフィクスチャをjsdom 30.0.1で回し直した。

| マークアップ | `document.head.querySelector` | `document.querySelector` |
| --- | --- | --- |
| A. head内（基準） | 見つかる | 見つかる |
| C. head内、文字列の後 | 見つからない | 見つかる |
| D. head内、`<div>`の後 | 見つからない | 見つかる |
| E. bodyの最初の子 | 見つからない | 見つかる |
| G. `<noscript>`の中 | 見つかる | 見つかる |
| H. `<template>`の中 | 見つからない | 見つからない |
| I. head内、`<title>`未閉鎖 | 見つからない | 見つからない |
| K. JSで後から挿入 | 元HTML false / 実行後 true | 元HTML false / 実行後 true |

headを起点に探す実装はC、D、Eで指示子を取り逃がした。この3件はGoogleが尊重すると明記した、まさにその配置である。自分の検査のほうがGoogleより厳しくなっていた。

厳しいこと自体は悪くない。ただしこの厳しさは向きが違う。「指示子がない」と報告するが実際にはあって効いている。逆にGでは「指示子がある」と報告するが、Googleの見るツリーには存在しない。二つの誤りが反対方向に出る。

文書全体を走査する側はC、D、Eを正しく捕まえた。代わりにGをそのまま通した。どちらか一方のセレクタだけでこの表を覆うことはできない。

## JSで付ける指示子はレンダラー待ちになる

Kは、初期HTMLにrobots metaがなく、スクリプトが後から`document.head`に追加する場合だ。パース直後にはなく、スクリプト実行後にはある。当たり前の結果だが、この「後から」が検索側では条件つきになる。

同じJavaScript SEO文書がレンダリングの順序をこう書いている。

> Googlebot queues all pages with a `200` HTTP status code for rendering, unless a robots `meta` tag or header tells Google not to index the page.

そして直後の警告が肝心なところだ。

> When Google encounters the `noindex` tag, it may skip rendering and JavaScript execution, which means using JavaScript to change or remove the robots `meta` tag from `noindex` may not work as expected.

noindexに遭遇するとレンダリングとJavaScript実行を省略する場合がある。だからJavaScriptでnoindexを消す方法は期待どおりに動かないことがある。文書は、インデックスさせたいならそもそも元のコードにnoindexを書くな、と明言している。

この一文をパースの実測と重ねると、規則が一つに畳める。**初期HTMLのバイトがいちばん強い保証で、レンダラーが動いて初めて生じるものはすべてそれより弱い。**`<noscript>`も`<template>`も、JSによる挿入も、理由は違うが同じ弱さを持つ。前の二つはレンダラーが動いても要素にならず、最後の一つはレンダラーが動かないと要素にならない。

クローラーが入ってくる前の層まで含めて見たい場合は、[AIクローラーをrobots.txtで正しく制御する](/ja/blog/ja/ai-crawler-control-robots-txt-llms-txt-2026)にまとめてある。この記事は入ってきた後の層の話だ。

## デプロイ前にパーサーへ尋ねる5項目

ここまでの結果を点検項目に移すとこうなる。

1. **探索範囲は文書全体にする。**`document.head.querySelector`ではなく`document.querySelector`。head起点で探すと、Googleが尊重する配置を「ない」と報告してしまう。
2. **見つけたら祖先の連なりを確認する。**祖先に`template`か`noscript`があれば、その指示子はないものとして扱う。あるかないかではなく、どこにあるかまで見る。
3. **スクリプティングを有効にしてパースする。**Googleは常緑Chromiumでレンダリングする。検査側のパース条件をそこに合わせる。jsdomの既定値は反対側だ。
4. **head/bodyはエラーではなく警告にとどめる。**bodyにあってもGoogleは尊重する。ただしbodyにあること自体がheadの早期終了の兆候なので、canonicalとhreflangが一緒に押し出されていないかを併せて見る。
5. **noindexは初期HTMLに書くか、書かないかのどちらかにする。**JSで付けたり消したりしない。これは好みではなくGoogle文書の勧告である。

2と3をコードに落とすとこの程度になる。検査に足しやすいよう短く残す。

```js
import { parse } from 'parse5';

export function findRobotsDirective(html) {
  const doc = parse(html, { scriptingEnabled: true }); // Googleと同じ条件
  const stack = [{ node: doc, path: [] }];
  while (stack.length) {
    const { node, path } = stack.pop();
    const name = node.tagName ?? node.nodeName;
    if (node.tagName === 'meta') {
      const attrs = Object.fromEntries(node.attrs.map((a) => [a.name, a.value]));
      if ((attrs.name ?? '').toLowerCase() === 'robots') {
        return { content: attrs.content, path: [...path, name] };
      }
    }
    // templateの中身はchildNodesではなくcontentフラグメントにある
    if (node.tagName === 'template') stack.push({ node: node.content, path: [...path, name] });
    for (const child of node.childNodes ?? []) stack.push({ node: child, path: [...path, name] });
  }
  return null;
}

// 使い方: 祖先にtemplate/noscriptが挟まっていれば、読まれない指示子だ
const found = findRobotsDirective(servedHtml);
const dead = found?.path.some((n) => n === 'template' || n === 'noscript');
```

自分のサイトにも回した。ビルド成果物から3ページを選んで同じパーサーで確認したところ、headの子は60個で、そのうちheadに入れられない要素は0個だった。早期終了は起きていない。

ただしこれは誇れる結果ではない。`BaseHead.astro`は`noindex`の値があるときだけrobots metaを出力するので、大半のページにはこのタグがそもそもない。早期終了がないから安全なのではなく、押し出される対象がなかったから静かだった、というほうが近い。指示子を実際に出す404ページのような場所こそ危険区間で、そちらは今回数えていない。

計測範囲もはっきりさせておく。私が測ったのは、parse5とjsdomがHTML標準をどう実装しているかだ。Googlebotが何をするかは測っていない。両ライブラリは標準のアルゴリズムを実装したもので、GoogleはChromiumを使う。ツリー構築の規則が同じなら結果も揃うはずだ、と見込んではいる。だがそれは推論であって実測ではない。Bingや他のクローラーの挙動は未確認で、そこについては何も主張しない。もう一点。指示子が正しい場所にあるかどうかは、インデックスと表示の資格に関わる話であって、順位とは関係がない。

## 残る問いは、寛容になったのがGoogleだけだという点

書きながらずっと引っかかっていたことがある。Googleが配置を強制しないと決めたのは、クローラー側の現実を受け入れた結果に近いはずだ。世のHTMLは壊れていて、壊れたheadから指示子を拾うほうが無視するよりユーザーに資する。その判断は理にかなっている。

引っかかるのは、その寛容さが一か所にしか生まれていない点だ。私のビルドパイプラインは相変わらずheadを基準に検査するし、他の検索エンジンが同じ文を文書に書いたわけでもない。何より、headが早期に閉じたという事実そのものは依然としてバグだ。robots metaが生き延びたからといって、その隣にいたcanonicalまで生き延びる保証はない。

だから私はこの注記を「bodyでも構わない」とは読まないことにした。「bodyで見つかったなら、headがどこで閉じたのかを探せ」と読むほうが実務では役に立つ。この読み方がいつまで有効かは分からない。他のエンジンも同じ一文を書き加え、フレームワークがhead管理を全部引き取ってしまえば、その時点でこの検査項目は消えてよい。まだそうなっていない。HTML に現れない制御もある。Search Console プロパティの生成 AI スイッチは PR に乗らない。[公式 GEO が消した一覧とそのスイッチ](/ja/blog/ja/official-geo-subtraction-gsc-control-2026/)を続けて見た。

レンダリングパイプラインのどこで指示子が消えるかを追う作業は、私の仕事の一角だ。相談は[お問い合わせページ](/ja/contact/)から。

---

*出典: Google Search Centralの[Robots Meta Tags Specifications](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag)、[JavaScript SEO Basics](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)、[Latest Google Search Documentation Updates](https://developers.google.com/search/updates)、WHATWGの[HTML Standard, The noscript element](https://html.spec.whatwg.org/multipage/scripting.html#the-noscript-element)（いずれも公式）。本文の英文ブロック引用4件は各原文ページをその場で取得して照合した文字列で、引用のそばに原文リンクを置いた。計測環境: 一時サンドボックスのフィクスチャ文書10種、parse5 8.0.1、jsdom 30.0.1、Node 22.22、macOS、2026年8月13日計測。プローブは`scripts/probe-robots-meta-placement.mjs`と`scripts/probe-robots-meta-consumer.mjs`、生データは`data/robots-meta-placement.json`と`data/robots-meta-consumer.json`、図の生成は`scripts/chart-robots-meta-placement.py`。計測対象は2つのライブラリのツリー構築結果であり、Googlebotの実際の処理結果ではない。Bingなど他のクローラーの挙動は確認していない。robots指示子はインデックスと表示の資格を決める仕組みであって、順位を決める仕組みではない。*
