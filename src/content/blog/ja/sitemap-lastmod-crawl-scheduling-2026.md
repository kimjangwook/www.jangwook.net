---
title: 'sitemap.xmlでGoogleが本当に読むのは lastmod だけだ'
description: 'priority 1.0 に changefreq always を付けても、Googleは全部捨てる。公式ドキュメントが使うフィールドは lastmod ひとつ。しかも検証可能なほど正確なときだけ使う。三種類のsitemapを公式XSDで実際に通し、何が検証を通り、何が黙って無視されるかを実測した。'
pubDate: '2026-07-08'
heroImage: '../../../assets/blog/sitemap-lastmod-crawl-scheduling-2026/hero.png'
tags:
  - SEO
  - サイトマップ
  - クローリング
  - Web開発
relatedPosts:
  - slug: multilingual-blog-technical-audit-campaign-2026
    score: 0.7
    reason:
      ko: "이 글의 「sitemap을 CI XSD 검증으로 굳혀라」를 실제로 실천한 기록이다. 감사를 한 번의 이벤트가 아니라 빌드 게이트 루프로 만든 캠페인."
      ja: "本記事の「sitemapをCIのXSD検証で固めろ」を実践した記録。監査を一度きりではなくビルドゲートのループにしたキャンペーン。"
      en: "The campaign that practiced this post's 'lock the sitemap with CI XSD validation' advice, turning an audit into a build-gate loop instead of a one-off."
      zh: "把本文「用 CI 的 XSD 校验把 sitemap 固定住」真正落地的记录——把审计做成构建门禁的循环，而非一次性事件。"
  - slug: hreflang-reciprocity-audit-multilingual-2026
    score: 0.64
    reason:
      ko: "sitemap과 나란히 다국어 사이트의 신뢰 신호를 이루는 hreflang을 30줄 스크립트로 직접 감사한 글. lastmod처럼 「정확하지 않으면 무시된다」는 원리가 똑같이 걸린다."
      ja: "sitemapと並んで多言語サイトの信頼信号をなすhreflangを、30行スクリプトで自ら監査した記事。lastmodと同じく「正確でなければ無視される」原理が効く。"
      en: "A hands-on audit of hreflang, the multilingual trust signal that sits alongside sitemaps, done with a 30-line script. The same 'inaccurate means ignored' principle as lastmod applies."
      zh: "用 30 行脚本亲手审计 hreflang——它和 sitemap 一样是多语言站点的信任信号。和 lastmod 同理:不准确就被忽略。"
  - slug: ai-crawler-control-robots-txt-llms-txt-2026
    score: 0.6
    reason:
      ko: "sitemap이 「무엇이 바뀌었나」를 알린다면, robots.txt는 「누구에게 보여줄까」를 정한다. 이 글에서 다룬 Sitemap 지시줄과 크롤러 노출 판단이 그 글로 이어진다."
      ja: "sitemapが「何が変わったか」を伝えるなら、robots.txtは「誰に見せるか」を決める。本記事のSitemap行とクローラー露出の判断がそこへ繋がる。"
      en: "If a sitemap says what changed, robots.txt decides who gets to see it. This post's `Sitemap:` directive and crawler-exposure calls lead straight into that one."
      zh: "如果说 sitemap 告诉的是「什么变了」，robots.txt 决定的是「让谁看见」。本文里的 `Sitemap:` 指令与爬虫暴露判断，正接到那篇。"
  - slug: json-ld-graph-entity-linking-2026
    score: 0.54
    reason:
      ko: "「검증기 초록불이면 끝」이라는 착각을 구조화 데이터 쪽에서 깬 글. 여기선 XSD가 통과해도 필드가 무시되고, 저기선 JSON-LD가 유효해도 조각이 안 이어진다. 같은 함정의 두 얼굴."
      ja: "「バリデータが緑なら完了」の錯覚を構造化データ側で崩した記事。こちらはXSDを通っても無視され、あちらはJSON-LDが有効でも断片が繋がらない。同じ罠の別の顔。"
      en: "The structured-data counterpart to this post's 'a green validator isn't the finish line.' Here the XSD passes but fields are ignored; there JSON-LD is valid but the pieces don't link. Two faces of one trap."
      zh: "从结构化数据一侧戳破「校验器亮绿就完事」的错觉。这边 XSD 过了字段却被忽略，那边 JSON-LD 有效碎片却连不起来。同一个陷阱的两张脸。"
---

サイトマップ生成ツールが吐く `<priority>1.0</priority>` と `<changefreq>always</changefreq>`。この二行、Googleのクローラーに届いた瞬間まるごと捨てられる。命令だと思って書いていた人には、ちょっとした事件だろう。私も最初に確認したときは拍子抜けした。

もっと厄介なのは、Googleが唯一気にするフィールドを、多くのサイトが間違った形で書いていることだ。そのフィールドが `lastmod`。今日は三種類のsitemapを作り、sitemaps.orgの公式スキーマ(XSD)で検証して、何が通り何が黙殺されるかを数字で確かめた。以下のログはすべて、使い捨てのサンドボックスから出た実際の出力だ。

## priority 1.0 を付けてもクローラーが見ない理由

まず誤解をひとつ外そう。sitemap.xml は「このページをこの順で、この重要度でクロールしろ」と検索エンジンに指示するファイルではない。多くの開発者が `priority` をランキングの重みのように、`changefreq` をクロール周期の命令のように扱う。どちらも誤解だ。

Googleはこの二つを使わないと[公式ドキュメント](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)に明記している。「Google ignores `<priority>` and `<changefreq>` values.」理由も書かれている。`changefreq` は概念的に `lastmod` と重なり、`priority` は主観的すぎてサイト内のページ間の実際の優先度を反映しない。当然だ。全ページに `priority 0.8` を打つサイトが大半なのに、全部 0.8 ならそれは情報ではなくノイズだ。

残るのは二つ。`<loc>`(URL)と `<lastmod>`(最終更新時刻)。このうちクロールのスケジュールに実際に関わるのは `lastmod` だけ。ところが、この一つを正しく書けているサイトは意外と少ない。ビルドのたびに現在時刻を打つ。日付フォーマットを手で組んで壊す。中身が変わっていないのに毎日更新時刻を上げる。どれも、Googleにこの値を「信用できない信号」と分類させる行為だ。

## 基礎から — sitemap と lastmod の本当の仕事

sitemapを一度も自分で作ったことがない人もいるだろうから、土台から。

sitemap.xml は、サイトが検索エンジンに手渡すURLの一覧だ。形式は [sitemaps.org プロトコル 0.9](https://www.sitemaps.org/protocol.html) で標準化されていて、`<urlset>` の下に `<url>` エントリが並ぶだけの単純なXML。各エントリの必須フィールドは `<loc>` ひとつ。残りの `<lastmod>`、`<changefreq>`、`<priority>` は全部任意だ。

肝心なのは、sitemapが<strong>発見(discovery)</strong>を助ける道具だという点。検索エンジンはリンクをたどってページを見つけるが、リンクが浅いページや新着ページは取りこぼしやすい。sitemapは「ここにこのURL群がある」と一度に伝えて、発見の確率を上げる。それだけだ。順位を上げもしないし、インデックスを保証もしない。

では `lastmod` はなぜ特別か。検索エンジンにとって最も高くつく作業は、すでに知っているURLをいつ再訪するか決めることだ。何千、何万ページを毎日すべて再クロールはできない。だから「このページは最近変わったから先に見よう」と優先度を付ける必要がある。`lastmod` はまさにそのスケジューリングへの入力だ。Googleは [ping エンドポイント廃止を告げた2023年の公式ブログ](https://developers.google.com/search/blog/2023/06/sitemaps-lastmod-ping)で、lastmod を「すでに発見したURLの再クロール予定を組むための信号」として使うと説明している。正確なら役に立ち、不正確なら無視される。条件付きの信号だ。

ここで「正確」の基準が効いてくる。公式ドキュメントの表現はこうだ。Googleは lastmod が「consistently and verifiably (for example by comparing to the last modification of the page) accurate」なときだけ使う。噛み砕くと、クローラーが実際にページを取得して最終更新の状態と照合したとき、sitemapの lastmod とズレていないこと。毎ビルドで `new Date()` を打っておいて本文は変えていなければ、何度か照合された後にこのサイトの lastmod はまるごと信用を失う。

## 公式スキーマで三つの sitemap を通してみた

言葉だけでは伝わらないので、実際に測った。使い捨てのサンドボックスで sitemaps.org の公式XSDを取得し、三種類のsitemapを `xmllint --schema` で検証する。狙いはひとつ。「スキーマを通る」と「Googleに役立つ」がどれだけ別の話かを目で見ることだ。

一つ目はよく見る形。全フィールドを埋めた版。

```xml
<url>
  <loc>https://example.com/</loc>
  <lastmod>2026-07-08</lastmod>
  <changefreq>always</changefreq>
  <priority>1.0</priority>
</url>
```

二つ目は、日付を手で組むときにやりがちなミス。`T` 区切りなしの空白、タイムゾーン欠落の lastmod。

```xml
<lastmod>2026-07-08 15:20:00</lastmod>
```

三つ目は私が勧める形。余計なフィールドを全部落とし、W3C Datetime にタイムゾーンオフセットまで付けた lastmod だけを残す。

```xml
<lastmod>2026-07-08T15:20:11+09:00</lastmod>
```

公式XSDで三つを通した結果だ。

```
# [A] priority + changefreq を埋めた版
$ xmllint --noout --schema sitemap.xsd sitemap-bad.xml
sitemap-bad.xml validates

# [B] 手組みの lastmod "2026-07-08 15:20:00"
$ xmllint --noout --schema sitemap.xsd sitemap-malformed.xml
element lastmod: Schemas validity error :
  '2026-07-08 15:20:00' is not a valid value of the union type 'tLastmod'.
sitemap-malformed.xml fails to validate

# [C] 正確な W3C Datetime lastmod のみ
$ xmllint --noout --schema sitemap.xsd sitemap-good.xml
sitemap-good.xml validates
```

![公式 sitemap XSD で三種類の sitemap を xmllint 検証した実ログ](../../../assets/blog/sitemap-lastmod-crawl-scheduling-2026/xmllint-validation.png)

三つの結果が、それぞれ別の教訓をくれる。

[A]が一番の落とし穴だ。`priority 1.0` に `changefreq always` を付けた sitemap がスキーマ検証を<strong>通る</strong>。XSDは文法しか見ない。Googleがそのフィールドを捨てるという事実は、スキーマの関心事ではない。だから「sitemap validator が緑」を信じた瞬間、実際には何の効果もないフィールドを大量に運びながら、よくできたと錯覚する。検証通過と有用性は別物だ。

[B]は逆に、実務で本当によく出るバグ。日付をライブラリなしで文字列に組み立て、`toISOString()` の代わりに `Date` の既定文字列やロケール形式をそのまま使うとこうなる。`tLastmod` のユニオン型は `2026-07-08` の日付単独や `2026-07-08T15:20:11+09:00` の完全な datetime は受けるが、空白でつないだ `2026-07-08 15:20:00` は拒否する。これはGoogleが無視するレベルではなく、スキーマ段階で壊れる。Search Console が sitemap 全体をパースエラーで突き返すこともある。

[C]は通る。これが目標の状態だ。

## 正確な lastmod を実際に作る方法

では [C] をどう自動で出すか。守る原則はひとつだけ。<strong>lastmod はビルド時刻ではなく、コンテンツが実際に変わった時刻であるべき</strong>だ。

最も単純な近似はファイルの更新時刻(mtime)。静的サイトなら各ページのソースファイルの mtime を読んでそのまま lastmod にすれば、「このファイルが最後に変わった時点」という検証可能な根拠ができる。サンドボックスで回した生成器がこれだ。

```javascript
import { readdirSync, statSync } from 'node:fs';

// W3C Datetime + ローカルのタイムゾーンオフセット (例: 2026-07-08T15:26:10+09:00)
function w3cLocal(d) {
  const p = (n) => String(n).padStart(2, '0');
  const tz = -d.getTimezoneOffset();
  const sign = tz >= 0 ? '+' : '-';
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}` +
    `T${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}` +
    `${sign}${p(Math.floor(Math.abs(tz) / 60))}:${p(Math.abs(tz) % 60)}`;
}

const urls = readdirSync('content')
  .filter((f) => f.endsWith('.html'))
  .map((f) => ({
    loc: 'https://example.com/' + (f === 'index.html' ? '' : f.replace(/\.html$/, '')),
    lastmod: w3cLocal(statSync(`content/${f}`).mtime),
  }));
```

ファイルを二つ、1秒間隔で作ってこの生成器を回すとこうなった。

```
<lastmod>2026-07-08T15:26:10+09:00</lastmod>   index.html
<lastmod>2026-07-08T15:26:11+09:00</lastmod>   about.html
```

二ページの lastmod が実際の更新時刻に沿ってそれぞれ違う値で刻まれた。ここが肝だ。サイト全体が同じビルドタイムスタンプを共有すると、Googleは「このサイトは毎回全ページが同時に変わると主張している」と読み、その信号を捨てる。ファイルごとに本物の更新時刻が違って刻まれてこそ、信頼が積まれる。

mtime にも弱点はある。チェックアウトや rsync でデプロイすると mtime はリセットされる。だからより堅牢なのはバージョン管理の履歴を使う手だ。Gitなら各ファイルの最終コミット時刻を lastmod にする。

```bash
git log -1 --format=%cI -- content/about.html
# 2026-07-08T15:26:11+09:00
```

`%cI` はコミット時刻を ISO 8601(=W3C Datetime 互換)で出す。フォーマット変換が要らず、「このファイルの最後の意味ある変更」という定義にも近い。私は多言語ブログでこの手を使っている。sitemap や hreflang を CI で強制するビルドゲートのやり方は[多言語ブログを監査して二度と戻らないよう固めたキャンペーン](/ja/blog/ja/multilingual-blog-technical-audit-campaign-2026)にまとめた。そこでも、監査をイベントではなくループにするのが肝だった。

もうひとつ。lastmod は<strong>意味のある</strong>変更のときだけ更新する。誤字ひとつ直した、フッターの年号を変えた、そんなことで lastmod を上げてはいけない。毎回「変わった」と叫ぶ sitemap は狼少年になる。何度か空振りしたクローラーは、その後あなたの lastmod を無視する。本文・見出し・主要な構造が変わったときだけ時刻を上げるのが正しい。

## lastmod がしてくれないこと(正直な限界)

ここまで読んで「正確な lastmod を入れればクロールが速くなる」とまとめると、半分だけ正しい。公式ドキュメントの限界の一文をそのまま引く。

「Keep in mind that submitting a sitemap is merely a hint: it doesn't guarantee that Google will download the sitemap or use the sitemap for crawling URLs on the site.」sitemap の送信は<strong>ヒント</strong>にすぎず、Googleがそれをダウンロードする保証も、それでクロールする保証もない。lastmod が正確でも同じ。再クロールの予定に<strong>影響しうる</strong>信号であって、クロールを<strong>させる</strong>命令ではない。

そして sitemap はインデックスとは無関係だ。クロールされたからインデックスされるわけでも、sitemap に入れたから索引に載るわけでもない。順位は言うまでもない。構造化データにせよ sitemap にせよ、順位を保証するSEO要素は存在しない、というのがGoogleの一貫した公式見解だ。lastmod で得られるのは「発見したページの再訪優先度を、もう少し正確な根拠で判断させること」、ちょうどそこまで。

もうひとつ、2023年から sitemap の ping エンドポイントが廃止された。以前は sitemap が変わるたびに `google.com/ping?sitemap=...` を呼んで知らせたが、今そのエンドポイントは死んでいる。検索エンジンは自分のスケジュールで sitemap を取りに来る。sitemap の場所は robots.txt の `Sitemap:` 行か Search Console 登録で一度伝えれば十分で、変更ごとに ping するコードが残っているなら消していい。どのクローラーに sitemap を見せ、どれを止めるかの判断は、[robots.txt と llms.txt で AI クローラーを制御する話](/ja/blog/ja/ai-crawler-control-robots-txt-llms-txt-2026)ともつながる。

## すぐ使えるチェックリスト

まとめると、sitemap.xml を触るとき今日できることだ。

- `<priority>` と `<changefreq>` を<strong>消す</strong>。Googleは無視し、他の主要エンジンも事実上信用しない。消せばファイルは軽くなり、誤解も減る。
- `<lastmod>` を<strong>ビルド時刻ではなく</strong>コンテンツの変更時刻(ファイル mtime か Git のコミット時刻)から生成する。
- フォーマットは W3C Datetime を使う。日付単独(`2026-07-08`)も有効だが、できればタイムゾーンオフセット付きの完全形(`2026-07-08T15:20:11+09:00`)が正確だ。空白でつないだ形はスキーマで壊れる。
- lastmod は<strong>意味のある変更</strong>のときだけ更新する。誤字や自動リビルドで全ページのタイムスタンプを一括更新しない。
- CI に公式XSD検証を入れる。`curl -s -o sitemap.xsd https://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd && xmllint --noout --schema sitemap.xsd public/sitemap.xml` の一行で、パースエラーをデプロイ前に捕まえる。
- sitemap の場所は robots.txt の `Sitemap:` 行と Search Console に一度だけ登録する。変更ごとに ping するコードは廃止済みなので消す。

sitemap ひとつで順位は上がらない。だがクローラーがあなたのサイトの変更を<strong>タイミングよく、信じて</strong>追ってくるかは、この小さな信号の正確さの勝負だ。そしてその正確さは、スキーマ検証の緑ではなく、lastmod が実際のコンテンツ状態とズレていないかにかかっている。

構造化データにせよ sitemap にせよ、検索・AIクローラーがサーバーから出す信号を実際どう受け取るかは、ドキュメントを読むだけでは掴めない。サーバーサイドレンダリングとクローラー対応、多言語サイトの sitemap・hreflang パイプラインの点検や CI ゲートでの固め込みを考えているなら、個人的に相談と実装の依頼を受けている。プロフィールの連絡先からサイトの状況を教えてほしい。
