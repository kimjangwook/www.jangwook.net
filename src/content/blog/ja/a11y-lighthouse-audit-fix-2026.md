---
title: 'アクセシビリティ55点から100点へ — LighthouseでWCAG違反を実際に直す'
description: '架空のベーカリーのランディングページをLighthouseのアクセシビリティ監査にかけて55点。6つのWCAG違反を1つずつ直して100点にした実測ログと、自動ツールが見逃したキーボードの罠までまとめた。'
pubDate: '2026-07-02'
heroImage: '../../../assets/blog/a11y-lighthouse-audit-fix-2026/hero.png'
tags:
  - a11y
  - WCAG
  - Lighthouse
  - ウェブアクセシビリティ
  - ウェブ開発
faq:
  - question: 'Lighthouseのアクセシビリティ100点はWCAG準拠を意味しますか？'
    answer: 'いいえ。Lighthouseのアクセシビリティスコアはaxe-coreで自動検査できる項目だけを計算します。web.dev公式ドキュメントも、自動検査は全体の一部しか捉えられず手動検査が必須だと明記しています。実際、私の実験ではキーボードで操作できない偽ボタン（div+onclick）とラベルなしのtextareaが、100点を取っても未解決のまま残りました。'
  - question: '自動ツールでどこまで捉えられますか？'
    answer: 'lang属性の欠落、画像のalt欠落、コントラスト不足、見出しの順序、リンク名の欠如、拡大禁止（user-scalable=no）など、マークアップだけで判定できる違反はよく捉えます。逆に「フォーカスが論理的な順序で移動するか」「キーボードだけで全機能を使えるか」「スクリーンリーダーで流れが理解できるか」は人が確認する必要があります。'
  - question: 'コントラストはどの程度合わせればいいですか？'
    answer: 'WCAG 2.1 AA基準で、本文テキストは背景と4.5:1以上、大きいテキスト（およそ24px以上、または太字の19px以上）は3:1以上です。私のbeforeページのグレー地に薄いグレーのCTAボタンはこの基準を大きく下回っており、色を濃くするだけでコントラスト違反が消えました。'
  - question: 'divにonclickを付けるとなぜ問題なのですか？'
    answer: 'divは既定でフォーカスを受け取れず、Enter/Spaceキーにも反応しません。マウスでは押せても、キーボードやスクリーンリーダーの利用者にとっては存在しないボタンです。Lighthouseのbutton-name検査はdivをボタンと認識すらしないため通過扱いにします。本物のbutton要素を使うか、やむを得ない場合はrole="button"とtabindex="0"とキーハンドラーをすべて付ける必要があります。'
relatedPosts:
  - slug: localbusiness-structured-data-server-side-vs-js-2026
    score: 0.6
    reason:
      ko: 둘 다 "화면에 보이는 것"이 아니라 "기계가 읽어가는 마크업"이 진짜 승부처라는 관점의 글이다. 그쪽은 크롤러가 읽는 JSON-LD를, 이 글은 스크린리더·자동 도구가 읽는 시맨틱 HTML을 다룬다.
      ja: どちらも「画面に見えるもの」ではなく「機械が読み取るマークアップ」が本当の勝負どころだという視点の記事だ。あちらはクローラーが読むJSON-LDを、本記事はスクリーンリーダーや自動ツールが読むセマンティックHTMLを扱う。
      en: Both argue that the real battleground is the markup machines read, not what shows on screen. That post covers the JSON-LD crawlers parse; this one covers the semantic HTML screen readers and audit tools parse.
      zh: 两篇都主张真正的关键在于"机器读取的标记"，而非"屏幕上看到的内容"。那篇讲爬虫读取的JSON-LD，本文讲屏幕阅读器和自动化工具读取的语义化HTML。
  - slug: multilingual-llm-token-tax-experiment
    score: 0.5
    reason:
      ko: 이 글도 내 사이트를 실측 대상으로 삼아 숫자로 확인한 글이다. Lighthouse 점수를 before/after로 직접 재본 이 글과 "믿지 말고 내 환경에서 재본다"는 접근이 같다.
      ja: この記事も自分のサイトを実測対象にして数字で確かめたものだ。Lighthouseスコアをbefore/afterで自分で測った本記事と「信じずに自分の環境で測る」というアプローチが同じだ。
      en: That post also treats my own site as the thing to measure and confirms it with numbers. It shares this article's approach of measuring before/after Lighthouse scores myself rather than trusting a claim.
      zh: 那篇文章同样把自己的网站当作实测对象、用数字来确认。与本文亲自测量before/after的Lighthouse分数一样，都是"不轻信、在自己环境里测"的思路。
---

同じHTML一式を二度監査にかけた。最初のスコアは55、二度目は100。その間に変えたのはコード20行ほど。アクセシビリティは「予算が余ったら後で」と扱われがちだが、実際に手を入れてみると、その多くはこうした数行のマークアップの問題だ。

今回は口だけで済ませず、自分で測った。よくあるアクセシビリティのミスをわざと仕込んだベーカリーのランディングページを作り、Chrome DevToolsのLighthouseアクセシビリティ監査を回してスコアと違反リストを出した。そのあと違反を1つずつ直して再測定した。以下の数値とログは、すべてそのサンドボックスから出た実際の結果だ。

## なぜ今、ウェブ開発者が自分でアクセシビリティを測るべきか

アクセシビリティ（a11y）は、もはやスクリーンリーダーやキーボード利用者だけの問題ではなくなった。ページを「人の目」ではなくアクセシビリティツリーとして読み取る主体が増えたからだ。スクリーンリーダーがそうだったし、いまやAI検索クローラーやブラウジングエージェントも似た構造情報を読む。実際、今回の監査でアクセシビリティを直すと、LighthouseのAgentic Browsingスコアも50から100へ一緒に上がった。セマンティックなマークアップを正しく置けば、人間の利用者と機械の消費者の両方に同時に値がつく、というわけだ。

これは[クローラーが読むマークアップこそ本当の勝負どころだと整理した構造化データの記事](/ja/blog/ja/localbusiness-structured-data-server-side-vs-js-2026)と同じ筋だ。画面によく見えることと、機械が構造を理解することは別物である。アクセシビリティは、その「機械が読む層」を人間の利用者側から見た問題だ。

一つだけ先に釘を刺しておく。**Lighthouseのアクセシビリティ100点は「WCAG準拠」を意味しない。** web.dev公式ドキュメントが明言する通り、このスコアはaxe-coreで自動検査できる項目だけを計算し、自動検査は全体の一部しか捉えない。後半で、100点を取ってもなお残っていた実際の欠陥をそのまま見せる。

## 実験の設定: わざと壊したランディングページ

テスト対象は、repo外の一時ディレクトリに作った静的HTML1枚だ。架空のベーカリー「Nordic Bakes」のランディングページで、ヘッダーナビ、ヒーロー、画像カード、予約フォーム、フッターを備えたありふれた構成。ここに現場でよく出くわすアクセシビリティのミスを意図的に仕込んだ。

- `<html>`に`lang`属性なし
- メイン画像とリンク内のアイコン画像に`alt`なし
- 薄い背景の上にさらに薄いテキスト・ボタン（コントラスト不足）
- `<h1>`の直後に`<h3>`が来る見出し順序の崩壊
- 画像だけを包んだリンク（`<a>`の中にテキストなしで画像だけ）
- `<meta viewport>`に`user-scalable=no, maximum-scale=1`（拡大禁止）
- そして自動ツールが捉えにくいもの2つ。ラベルなしの`<textarea>`と、ボタンに見えて実は`<div onclick>`の「Send request」コントロール

ローカルに`python3 -m http.server`で立て、ChromeをそのURLへ送ってからLighthouse監査を`navigation`モード（デスクトップ）で実行した。

![修正前のNordic Bakesランディングページ。見た目は問題ないが、6つのアクセシビリティ違反が隠れている](../../../assets/blog/a11y-lighthouse-audit-fix-2026/before-page.png)

目で見る分には問題ない。問題は全部、画面の下、マークアップの中にある。

## 一次測定: 55点、6つの違反

最初の結果だ。

```text
URL: http://localhost:8765/before.html  (desktop, navigation)
Accessibility:      55
Best Practices:     100
SEO:                82
Agentic Browsing:   50
Passed: 32   Failed: 8
```

アクセシビリティカテゴリで失敗した監査項目をレポートJSONから抜くと、こうなる。

| 監査項目 | 違反内容 | 影響を受けたノード |
|---|---|---|
| `html-has-lang` | `<html>`に`[lang]`属性なし | 1 |
| `image-alt` | 画像に`[alt]`なし | 2 |
| `color-contrast` | 前景/背景のコントラスト不足 | 4 |
| `heading-order` | 見出しが順に下がっていない | 1 |
| `link-name` | リンクに識別可能な名前なし | 1 |
| `meta-viewport` | `user-scalable="no"` / `maximum-scale<5` | 1 |

6項目すべて、マークアップだけで判定できる、自動検査にうってつけの型だ。そして6つとも実際の利用者にとって具体的な壁になる。`lang`がなければスクリーンリーダーはどの言語の音声エンジンで読むか決められない。`alt`がなければ画像はただ「画像」かファイル名として読まれる。拡大禁止は弱視の利用者が画面を大きくするのを妨げる。

## 1つずつ直す: コードdiffで見る6つの修正

修正は難しくない。肝は「装飾ではなく意味をコードに込める」ことだ。

**1) 文書言語の宣言。** 一文字の問題だ。

```html
<!-- before -->
<html>
<!-- after -->
<html lang="en">
```

**2) 画像の代替テキスト。** 情報を持つ画像には内容を、純粋な装飾画像には空の`alt=""`を与える。ここの2枚はどちらも意味があるので説明文で埋めた。

```html
<!-- before -->
<img src="/hero.jpg" width="320" height="180">
<a href="/story"><img src="/icon.svg" width="24" height="24"></a>
<!-- after -->
<img src="/hero.jpg" width="320" height="180"
     alt="Loaves of sourdough cooling on a wooden rack">
<a href="/story"><img src="/icon.svg" width="24" height="24"
     alt="Read our full story"></a>
```

2つ目の修正は`image-alt`だけでなく`link-name`も同時に解決する。テキストなしで画像だけのリンクは、altが埋まった瞬間にそのaltがリンクのアクセシブルな名前になるからだ。1つの違反を直すと別の違反が付いて消えるのは、アクセシビリティ修正でよくあるパターンだ。

**3) 色のコントラスト。** beforeのCTAボタンは薄い青の背景（`#c8d8e4`）に、さらに薄いグレーの文字（`#aab8c2`）だった。AA基準（本文4.5:1、大きいテキスト3:1）を大きく下回る。色を濃くしただけだ。

```css
/* before */
.cta { background:#c8d8e4; color:#aab8c2; }
.hero p { color:#9a9a9a; }
/* after */
.cta { background:#1f4e5a; color:#ffffff; }   /* コントラスト大幅アップ */
.hero p { color:#595959; }                     /* #f2f2f2 背景上でAA通過 */
```

**4) 見出しの順序。** beforeは`<h1>`の直後に`<h3>`が来ていた。スクリーンリーダー利用者は見出しだけをたどってページ構造を掴むので、レベルを飛ばすと「途中段が抜けた」目次のように聞こえる。見た目の大きさはCSSで調整し、マークアップのレベルは論理どおり`<h2>`に下げた。

```html
<!-- before -->
<h1>Fresh Sourdough, Baked Daily</h1>
<h3>Order before 9am for same-day pickup</h3>
<!-- after -->
<h1>Fresh Sourdough, Baked Daily</h1>
<h2>Order before 9am for same-day pickup</h2>
```

**5) 拡大の許可。** ビューポートメタから拡大を止める属性を外した。拡大禁止は、開発者が「レイアウト崩れ防止」の名目で何気なく入れがちな代表的アンチパターンだ。

```html
<!-- before -->
<meta name="viewport" content="width=device-width, initial-scale=1,
      user-scalable=no, maximum-scale=1">
<!-- after -->
<meta name="viewport" content="width=device-width, initial-scale=1">
```

加えて、ナビを`<div>`から`<nav aria-label="Primary">`へ変え、アイコンボタン（🛒）に`aria-label="Open cart"`を付ける整理も一緒にやった。これは監査スコアに直接は出なかったが、スクリーンリーダー体験を実際に改善する。

## 二次測定: 100点、そして残るSEOの一行

同じ手順でafterページを再監査した。

```text
URL: http://localhost:8765/after.html  (desktop, navigation)
Accessibility:      100    (was 55)
Best Practices:     100
SEO:                91     (was 82)
Agentic Browsing:   100    (was 50)
Passed: 46   Failed: 1
```

![修正後のNordic Bakesランディングページ。見た目はほぼそのままだが、アクセシビリティ違反が0になった](../../../assets/blog/a11y-lighthouse-audit-fix-2026/after-page.png)

アクセシビリティは違反0で100点。残った失敗1つはアクセシビリティではなく、SEOカテゴリの`meta-description`（説明メタタグなし）だった。これは今回の実験の範囲外なのでそのまま残した。注目すべきはAgentic Browsingが50から100へ一緒に跳ねた点だ。セマンティックな要素（`nav`、正しい見出し階層、名前付きコントロール）は、ブラウジングエージェントがページ構造をパースするのにもそのまま使われる。アクセシビリティ修正1つが3カテゴリを同時に押し上げた。

## 自動ツールが100点を付けても見逃したもの

ここがこの実験で一番言いたいところだ。**100点のページにも実際のアクセシビリティ欠陥が残っていた。**

beforeページに仕込んだ2つの罠を思い出してほしい。ラベルなしの`<textarea>`と、ボタン風にスタイリングしたが実体は`<div onclick="submitForm()">`の「Send request」コントロール。レポートJSONで関連する監査項目のスコアを直接確認した。

```text
label                          => score: 1   (通過)
button-name                    => score: 1   (通過)
focusable-controls             => score: null (手動確認項目)
interactive-element-affordance => score: null (手動確認項目)
```

ラベルなしのtextareaは`label`監査を**通過**した。偽ボタンのdivは`button-name`監査を**通過**した。ツールがそのdivをボタンと認識すらしないからだ。ボタンでないものに「ボタン名あり」ルールは適用されない。そしてこのdivの本当の問題（キーボードでフォーカスも実行もできない）を捉えるはずの`focusable-controls`項目は、自動採点ではなく「人が確認してください」に分類されてスコアに入らない。

まとめるとこうだ。divにonclickだけを付けると、マウスでは押せてもキーボード利用者には存在しないボタンになる。`<div>`は既定でフォーカスを受け取れず、Enter/Spaceに反応しない。まともに直すなら`<button type="submit">`を使うか、本当にやむを得ないときだけ`role="button"`と`tabindex="0"`とキーハンドラーをすべて付ける。afterページでは素直に本物の`<button>`に変えた。

正直に言うと、私はここがアクセシビリティスコアの最大の落とし穴だと思う。100点は「自動で捉えられる問題がない」という意味であって、「使えるページ」の保証ではない。スコアを目標にすると、ツールが見えない場所に欠陥を寄せる最適化をしてしまう。

## だから開発者がすぐやること（チェックリスト）

今回の実験で得た実務の順序だ。

- **自動監査はCIに入れるが、通過を最終承認と勘違いしない。** Lighthouse CIや`axe-core`をビルドに組み込み、リグレッションを防ぐ用途で使う。`lang`・`alt`・コントラスト・見出し・リンク名のような機械判定可能な違反は、この層で全部弾ける。
- **スコアが100でもキーボードパスを手で一度回す。** Tabだけで全インタラクティブ要素に到達・実行できるか、フォーカス順序が視覚順序と合うかを確認する。`<div onclick>`のような偽コントロールはここでしか捉えられない。
- **アイコンだけのボタンには必ずアクセシブルな名前を与える。** `aria-label`でも視覚的に隠したテキストでも。🛒一つだけのボタンはスクリーンリーダーでただ「button」と読まれる。
- **色はデザイン確定の段階でコントラストを測る。** 後で直すとブランドカラー全体を作り直すことになる。AAは本文4.5:1、大きいテキスト3:1。
- **見出しレベルは大きさではなく文書構造で決める。** 大きく見せたいならCSSで大きくする。`h3`を`h1`の直下に置かない。
- **拡大を止めない。** `user-scalable=no`と小さい`maximum-scale`は弱視の利用者を締め出す。

この順序の肝は、自動と手動の役割分担だ。自動ツールは繰り返し可能な機械的違反を安く防ぎ、人はツールが原理上見えない「実際に使えるか」を見る。どちらか一方だけでは片手落ちだ。そしてどちらにせよ、他人のベンチマークを信じる前に、[自分のサイトを実測対象にして数字を出したとき](/ja/blog/ja/multilingual-llm-token-tax-experiment)のように、自分の環境でbefore/afterを自分の手で測るのが先だ。

既存サイトのアクセシビリティを実際のスコアとキーボードパスで点検したい、あるいはデザインシステムの段階でコントラストやセマンティック構造を固めておきたい、という場合は、個人的に相談・点検を受けている。プロフィールの問い合わせ経路から連絡してほしい。売り込みではなく、この層を実務で扱う人間が横で一度見る、という程度の話だ。
