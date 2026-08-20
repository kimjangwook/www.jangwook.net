---
title: '内部リンク46,382本のうち24,948本が301を踏んでいた'
description: 'アクセシビリティ指標を測るために書いたスクリプトが、URLのバグを掘り当てた。ビルド済みHTML 1,334ページの内部リンクを全数調査したところ、半分を超える24,948本が末尾スラッシュなしの、つまり301リダイレクトを経由するURLを指していた。原因の特定と4段階の修正、そしてゼロにするまでの記録。'
pubDate: '2026-07-31'
heroImage: '../../../assets/blog/internal-link-trailing-slash-redirect-audit-2026/hero.png'
tags:
  - SEO
  - 内部リンク
  - リダイレクト
  - canonical
  - Web開発
faq:
  - question: '末尾スラッシュがないと検索順位は下がりますか'
    answer: '下がりません。Googleは301をたどり、シグナルを統合します。順位が下がるという公式の根拠はなく、私もそう主張しません。実際のコストは別のところにあります。ユーザーは往復を一回余計に払い、サイトはcanonicalと食い違うURLを自ら宣伝することになります。Google公式ドキュメントは「サイト内でリンクする際は、重複URLではなくcanonical URLにリンクする」よう案内しています。'
  - question: 'スラッシュを付ける流儀と付けない流儀、どちらが正しいのですか'
    answer: 'どちらも正しいです。規則ではなく慣習で、ホスティングがどちらを200で返すかによって決まります。重要なのはcanonicalタグが宣言している形と、内部リンクの形が一致しているかどうかです。私のサイトはcanonical 1,330ページすべてがスラッシュ付きだったので、スラッシュなしのリンクが全部ずれている側でした。canonicalが逆なら、修正の向きも逆になります。'
  - question: 'クロールバジェットのために直すべきですか'
    answer: '私のサイト規模では違います。Googleのクロールバジェット文書は対象を「ユニークページ100万以上」または「1万ページ以上かつ毎日激しく変わるサイト」に限定しています。1,334ページのサイトはどちらにも入りません。同じ文書が「長いリダイレクトチェーンは避けよ」と述べてはいますが、私が直した理由はバジェットではなく、一貫性とユーザーの待ち時間でした。'
  - question: 'この監査をどう常設化しますか'
    answer: 'ビルド成果物をパースして内部のa hrefを全数検査し、canonicalと違う形のリンクが一本でもあれば終了コード1を返すようにします。本文に40行ほどのスクリプトを載せました。開発サーバーではなくdistを対象に回すのが肝です。ソースには存在せず、コンポーネントが組み立てて生成するリンクが実際に半分を占めていました。'
relatedPosts:
  - slug: crawl-depth-flat-archive-audit-2026
    score: 0.74
    reason:
      ko: 같은 빌드 산출물을 두고 그때는 "홈에서 이 글에 닿는가"를 셌고, 이번에는 "닿는 그 링크가 올바른 주소인가"를 센다. 도달성 다음에 오는 질문이 링크의 형태다.
      ja: 同じビルド成果物を相手に、あちらでは「ホームから記事に届くか」を数えた。今回数えるのは「届くその一本が正しいURLか」だ。到達性の次に来る問いがリンクの形になる。
      en: Same build output, different question. That post counted whether the homepage can reach an article at all; this one asks whether the link doing the reaching points at the right URL.
      zh: 同一份构建产物，上一篇数的是"首页能否抵达这篇文章"，这一篇数的是"抵达用的那条链接是否指向正确的地址"。可达性之后紧接着的问题就是链接的形态。
  - slug: hreflang-reciprocity-audit-multilingual-2026
    score: 0.69
    reason:
      ko: hreflang도 이번 슬래시 문제도 "한쪽만 어긋나면 조용히 무효가 되는" 부류다. 빌드 산출물을 전수로 훑어 짝이 맞는지 확인하는 방법이 그대로 겹친다.
      ja: hreflangも今回のスラッシュ問題も、片方がずれた瞬間に黙って無効化される類のものだ。ビルド成果物を全数走査して整合を確かめる手つきがそのまま重なる。
      en: "hreflang and this slash mismatch belong to the same family: one side drifts and the whole thing quietly stops meaning what you intended. The full-sweep method over build output carries over directly."
      zh: hreflang 与这次的斜杠问题属于同一类：只要一侧错位，整套声明就悄悄失效。对构建产物做全量扫描来核对一致性的手法，可以原样搬过来。
  - slug: sitemap-lastmod-crawl-scheduling-2026
    score: 0.6
    reason:
      ko: sitemap에 어떤 형태의 URL을 넣느냐가 이 글의 canonical 형태 논의와 바로 이어진다. 사이트맵과 내부 링크가 서로 다른 주소를 광고하면 통합 신호가 흐려진다.
      ja: sitemapにどの形のURLを載せるかは、本稿のcanonical形の話と地続きだ。サイトマップと内部リンクが別々の住所を宣伝すれば、統合の信号は濁る。
      en: Which URL form goes into your sitemap runs straight into the canonical-form question here. If the sitemap and the internal links advertise different addresses, the consolidation signal gets muddy.
      zh: 站点地图里放哪种形态的 URL，与本文关于 canonical 形态的讨论是同一件事。若站点地图和内部链接各自宣传不同的地址，归并信号就会变浑。
  - slug: ai-crawlers-dont-render-javascript-csr-2026
    score: 0.52
    reason:
      ko: 렌더링 없이 HTML만 읽는 크롤러에게는 href 문자열이 곧 전부다. 그 문자열이 리다이렉트를 거치는 주소라면 비용은 그쪽에서 더 크게 붙는다.
      ja: レンダリングせずHTMLだけを読むクローラーにとって、href文字列がすべてだ。その文字列がリダイレクト先を指しているなら、コストはむしろそちら側で膨らむ。
      en: For a crawler that reads HTML and never renders, the href string is the whole story. If that string points at a redirect, the cost lands harder on that side.
      zh: 对于只读 HTML、从不渲染的爬虫来说，href 字符串就是全部。如果那串字符指向一个会跳转的地址，代价反而落在它这一侧更重。
---

ビルド済みのHTML 1,334ページから、内部リンクを46,382本数えた。そのうち24,948本が、301を返すURLを指していた。半分を超えている。

しかもこの数字、探しに行って見つけたものではない。私が測っていたのはリンクテキストのアクセシビリティだった。「同じ名前のリンクが別々の場所を指していると、スクリーンリーダー利用者は行き先を区別できない」というWCAGの観点を機械的に数えるつもりでスクリプトを書いた。それが1,330ページを違反として吐き出した。開いてみると、アクセシビリティの問題ではなかった。`home`という同じ名前のリンクが、ヘッダーでは`/en/`へ、フッターでは`/en`へ向かっていたのだ。

## 末尾スラッシュは好みではなく、別々の二つのURLである

土台から確認しておく。`https://example.com/blog`と`https://example.com/blog/`は、人間の目には同じページに見えても、HTTPの上では異なる二つのリソース識別子だ。どちらが実体を返すかを決めるのはサーバーである。静的サイトのホスティングはたいていディレクトリ形式（`/blog/index.html`）でファイルを置くので、スラッシュ付きが200を返し、スラッシュなしは301でスラッシュ付きへ送る。逆に構成しているホスティングもある。規則ではなく慣習であり、慣習はデプロイ先ごとに違う。

肝心なのは「どちらが正しいか」ではない。一つのサイトの中で両方の形が混ざった瞬間、そのサイトは自分のページを二つの住所で宣伝しはじめる。canonicalタグは片方だけを指しているのに、内部リンクはもう片方を指している状態。私のサイトで起きていたのはこれだった。

自分のデプロイ環境で実際の応答を確かめると、こうなる。

```text
$ curl -sS -o /dev/null -w "%{http_code} -> %{redirect_url}\n" https://jangwook.net/en
301 -> https://jangwook.net/en/

$ curl -sS -o /dev/null -w "%{http_code}\n" https://jangwook.net/en/
200
```

ブラウザはこの301を自動でたどるから、ユーザーは何も気づかない。画面は同じように出る。ただしリクエストは二回飛ぶ。

## アクセシビリティを測っていたら、URLのバグが出てきた

当初の目的はリンクテキストの監査だった。ビルド済みの全ページから`<a>`のアクセシブルネームを取り出し（`aria-label` → テキスト → 画像の`alt` → `title`の順）、一つのページの中で同じ名前が二つ以上の行き先を持つケースを数える。

副産物として出た衛生指標は悪くなかった。名前が空の内部リンクはゼロ。「こちら」「詳細」「click here」のような中身のないリンクテキストもゼロ。`alt`のない画像リンクもゼロ。ユニークなリンク名は7,153種類。

ところが「同じ名前で別の行き先」の項目が1,330ページで引っかかった。事実上の全ページである。上位を眺めると、二種類が混ざっていた。

一つは誤検知だった。言語切り替えリンクは、どのページでも名前が`🇯🇵 日本語`で共通なのに、行き先はページごとに違う。一つの名前に323個の行き先がぶら下がるので機械は違反と言うが、人間にとってはそれが正常な挙動だ。WCAGの判定はリンクテキスト単独ではなく文脈を含めて行うので、現在のページ自体が文脈になる言語切り替えは、この規則で拾うべき対象ではない。自動指標を作るとき、こういう構造的な誤検知を先に切り分けておかないと、リストは丸ごとゴミになる。

もう一つが本物だった。`home`、`blog`、`about`、`contact`、`social`。五つの名前がそれぞれ二つの行き先を持っていて、その二つの違いは末尾のスラッシュ一文字だけ。アクセシビリティ検査ではなくURL正規化の検査で捕まえるべき欠陥が、先にアクセシビリティ指標に引っかかったわけだ。

ソースを開くと、原因は一行だった。

```astro
<!-- src/components/Header.astro -->
<a href={`/${lang}/`}>{t("nav.home")}</a>

<!-- src/components/Footer.astro -->
<a href={`/${lang}`}>{t("nav.home")}</a>
```

二つのコンポーネントは別の日に書かれ、その間、形を強制する仕組みは誰も置かなかった。自動チェックも捕まえられない。リンクは壊れていないからだ。実際このリポジトリのビルドゲートには`broken internal links: 0`を確認する検査がすでに入っているが、301は壊れたリンクではないので素通りする。[クロール深度を測って到達不能ゼロを確認したとき](/ja/blog/ja/crawl-depth-flat-archive-audit-2026/)も同じだった。届くことは届いていたのだから。

## 46,382本を分解した数字

全数調査の結果である。対象は`dist/`のHTML 1,334ページ。集計対象は同一オリジンのパス型内部リンク（外部・`mailto:`・`tel:`・アンカーのみ・拡張子付き静的ファイルは除外）。

| 項目 | 値 |
|---|---|
| ビルド済みHTMLページ | 1,334 |
| 内部パスリンク総数 | 46,382 |
| スラッシュで終わるリンク | 21,434（46.2%） |
| スラッシュなしのリンク | 24,948（53.8%） |
| うちスラッシュ側に実ページが存在＝301確定 | 24,944 |
| 該当リンクを一本以上含むページ | 1,330 / 1,334 |
| `<link rel="canonical">`がスラッシュ形式 | 1,330 / 1,330 |

最後の行が要点だ。canonicalは例外なくスラッシュ形式を宣言していた。つまりスラッシュなしの24,948本は、すべて「このサイト自身が正典ではないと宣言したURL」を指していたことになる。

発生箇所で割ると、責任の所在が見えてくる。

| 箇所 | 該当リンク数 |
|---|---|
| フッター・ヘッダーなどテンプレート | 10,640 |
| 本文（`article`/`main`）の中 | 14,300 |
| その他 | 8 |

本文側のほうが多い。これはこたえた。この14,300本は、記事ごとに私が手で書き入れた内部リンクと、関連記事コンポーネントが生成したリンクである。内部リンクを熱心に張るほど、誤った形が増えていく構造だったわけだ。

## 公式が言っていること、言っていないこと

ここで期待値を正確に合わせておきたい。Googleのドキュメントから直接確認できる文はこの二つだ。

> When linking within your site, link to the canonical URL rather than a duplicate URL. Linking consistently to the URL that you consider to be canonical helps Google understand your preference.

（[Consolidate duplicate URLs — Google Search Central](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)）

> Avoid long redirect chains, which have a negative effect on crawling.

（[Large site owner's guide to managing your crawl budget — Google Search Central](https://developers.google.com/search/docs/crawling-indexing/large-site-managing-crawl-budget)）

この二文が保証する範囲は狭い。前者は「内部リンクをcanonicalに揃えるとGoogleが好みを理解する助けになる」であって、揃えなければ罰を与える、ではない。後者が言うのは「長いチェーン」だ。私のケースはホップ一つである。

そもそもクロールバジェットの話は、私のサイトには当てはまらない。同じ文書が対象をこう絞っている。

> Large sites (1 million+ unique pages) with content that changes moderately often (once a week)
> Medium or larger sites (10,000+ unique pages) with very rapidly changing content (daily)

1,334ページのサイトはどちらでもない。だから「クロールバジェットの節約のために直した」と書けば、それは嘘になる。順位が上がるという主張はなおさらできない。構造化データにせよリンクの形にせよ順位を保証しないというのがGoogleの一貫した立場で、私もその線を越えない。

では、なぜ直したのか。理由は三つあり、いずれも検索順位の外側にある。

一つ目、ユーザーの待ち時間。同じURLをそれぞれ七回叩いて測った。301の応答自体は中央値33.6ms。むしろ速い。実体を返す200の応答が中央値43.0ms。問題は、ユーザーがその両方を払う点だ。およそ77ms対43ms。ノートPC一台、キャッシュの温まったエッジで取った七サンプルなので、絶対値をそのまま信じる値ではない。ただ向きははっきりしている。二回行くより一回のほうが速い。

二つ目、自己矛盾の解消。canonicalがAを指しているのに内部リンクの半分がBを指している状態は、どの角度から見ても説明しづらい。

三つ目、これがリンクだけの話で終わらないこと。スラッシュなしのURLが外部で共有されると、解析ツールでは二つのパスに割れて集計される。順位の話を持ち出さなくても、計測品質だけで直す理由になる。

## 24,948をゼロにするまでの4段階

一度では終わらなかった。直しては測り直し、残った数字を見て次の原因を探す、その繰り返しだった。

![Internal links pointing at a redirecting URL, measured across four fix stages](../../../assets/blog/internal-link-trailing-slash-redirect-audit-2026/redirect-bound-links.png)

<strong>第1段階。テンプレートの修正（13ファイル、29行）。</strong> `Footer.astro`、`AuthorBox.astro`、`HeroSection.astro`、`BlogPost.astro`といくつかのページで、`/${lang}/blog`形式のhrefをスラッシュ付きに変えた。結果は24,948 → 7,808。29行で17,140本が消えた。テンプレートの一行が1,330ページに複製される構造なので、修正のてこが長い。

<strong>第2段階。Markdown本文の正規化（1,276ファイル）。</strong> 記事本文に手書きした`](/ja/blog/ja/slug)`形式を一括置換した。アンカー付き（`...slug#section`）はスラッシュをアンカーの前に入れる必要がある。

```perl
perl -pi -e 's{\]\((/[a-z]{2}/[^)\s#]*[^/)\s#])(#[^)\s]*)?\)}{"](" . $1 . "/" . ($2//"") . ")"}ge' "$f"
```

結果は7,808 → 3,905。

<strong>第3段階。関連記事コンポーネント（1行）。</strong> 残った3,905本をページ一枚開いて追跡すると、全部が`recommendation-item`クラスの中にあった。`RelatedPosts.astro`がslugからURLを組み立てる一行が犯人だった。直して3,905 → 85。

<strong>第4段階。残り85本。</strong> 11ページに残っていた。正体は三系統。Markdownの中に`](...)`ではなく生のHTML `<a href="...">`で書かれたリンクが3記事、改善履歴データJSONの`sourceReport`フィールド、そして`404.astro`のハードコードされたリンク。最後の残りかすは、いつも一番変なところに隠れている。

4段階を経て、リダイレクトを踏む内部リンクはゼロになった。厳密には4本がスラッシュなしで残っているが、古い記事が参照する`/research/seo/*.svelte`というパスで、そもそもページではない（それはそれで別途直す話だ）。面白いのは、第1段階が13ファイルで全体の69%を片付け、残る三段階が1,280ほどのファイルを触って31%を片付けたことだ。手で書いたリンクは、いつもこういう形で高くつく。

## そのまま回せる監査スクリプト

ブラウザもヘッドレスツールも要らない。ビルド成果物をパースすれば終わる。`cheerio`が一つあればいい。

```js
import fs from 'node:fs';
import path from 'node:path';
import * as cheerio from 'cheerio';

const DIST = process.argv[2] ?? 'dist';
const SITE = 'https://example.com';

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}

let total = 0;
const bad = [];

for (const file of walk(DIST)) {
  const rel = '/' + path.relative(DIST, file).replace(/index\.html$/, '');
  const $ = cheerio.load(fs.readFileSync(file, 'utf8'));

  $('a[href]').each((_, a) => {
    const href = $(a).attr('href');
    if (!href || /^(https?:|mailto:|tel:|javascript:|#|\/\/)/i.test(href)) return;
    const { pathname } = new URL(href, SITE + rel);
    if (/\.[a-z0-9]{2,5}$/i.test(pathname)) return;  // 静的ファイルは除外
    total++;
    // canonicalがスラッシュなし側なら条件を反転させる
    if (!pathname.endsWith('/')) bad.push(`${rel} -> ${href}`);
  });
}

console.log(`internal links: ${total}, non-canonical form: ${bad.length}`);
for (const b of bad.slice(0, 20)) console.log('  ' + b);
if (bad.length) process.exit(1);
```

`dist`を対象に回すのが肝だ。ソースをgrepすると、コンポーネントが組み立てて出すリンクを取りこぼす。私の場合、その取りこぼしが半分だった。

最後の二行がCIゲートになる。ゼロでなければビルドが落ちる。既存の違反が多すぎてゲートを立てられないなら、先にゼロにしてからゲートを掛ける順番が正しい。しきい値を置いて「現状維持」で妥協すると、その数字は必ずまた増える。[測ってからゲートとして常設化する](/ja/blog/ja/hreflang-reciprocity-audit-multilingual-2026/)順番をこのリポジトリで使い続けているのは、そのためだ。

## まとめ：リンクはcanonicalと同じ文字列でだけ書く

- <strong>まず正典の形を確認する。</strong> `<link rel="canonical">`がスラッシュを付けているか外しているかを見る。それが基準で、内部リンクをそこに合わせる。逆向きに揃えてもいい。混ざるのだけが駄目だ。
- <strong>ソースではなくビルド成果物を検査する。</strong> テンプレート、コンポーネント、データファイル、Markdownがそれぞれリンクを作る。全部が一箇所に集まるのは最終HTMLだけである。
- <strong>「壊れたリンク0」と「リダイレクト0」は別の検査だ。</strong> 301は壊れたリンクではない。既存のリンクチェッカーはこれを通す。
- <strong>テンプレートから直す。</strong> 13ファイルで全体の69%だった。てこが一番長いのはそこだ。
- <strong>残りかすを最後まで追う。</strong> 生のHTMLアンカー、JSONデータのURLフィールド、404ページ。最後の数十本は必ず予想の外にある。
- <strong>ゼロにしてからゲートを掛ける。</strong> 終了コード1を返す20行で再発は止まる。
- <strong>順位の話はしない。</strong> この修正で順位が上がる根拠はない。得られるのは往復一回分の節約、一貫したcanonicalシグナル、そして割れない解析データだ。

アクセシビリティ指標を作っていてURLのバグを掘り当てたのは偶然に見えるが、突き詰めると偶然ではない。リンク一本は、人にとっては行き先の名前であり、クローラーにとっては正典URLの宣言であり、解析ツールにとっては集計キーである。三つの視点のうち一つだけで検査すれば、残り二つの欠陥は影に残る。

ビルド成果物をこうして洗い、何が漏れているのかを数字に変える仕事を業としている。運用中のサイトでその数字が気になるなら、[プロフィール](/ja/about/)に置いてある経路から声をかけてもらえればいい。

---

*出典: Google Search Centralの[Consolidate duplicate URLs](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)、[Large site owner's guide to managing your crawl budget](https://developers.google.com/search/docs/crawling-indexing/large-site-managing-crawl-budget)（いずれも公式）。測定環境: 自サイトのAstroビルド成果物HTML 1,334ページ、Node 24 + cheerio 1.2.0で全数パース、応答コードと遅延はcurl 7サンプル。リンクの数値と遅延値はこのサイト・このデプロイ環境で出た値であり、Googleの処理についての記述ではない。*
