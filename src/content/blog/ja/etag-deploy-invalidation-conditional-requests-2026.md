---
title: '1年前の記事のLast-Modifiedが昨日だった: デプロイが消すキャッシュ検証子'
description: '去年書いた記事にcurlをかけたら、Last-Modifiedが昨日のデプロイ時刻だった。ETagを分解すると、ファイルの更新時刻とサイズを16進数で繋いだ値だ。同じソースで再ビルドしたHTML 1,346枚が100%バイト一致するのに、デプロイ一回でサイト全体の条件付きリクエストが成立しなくなる。'
pubDate: '2026-08-03'
heroImage: '../../../assets/blog/etag-deploy-invalidation-conditional-requests-2026/hero.png'
tags:
  - SEO
  - クローリング
  - HTTPキャッシュ
  - 静的ホスティング
  - Web開発
faq:
  - question: '304を多く返すと検索順位は上がりますか。'
    answer: 'Googleの公式文書にそう書かれた箇所はありません。キャッシュに関する公式記事が挙げる利点は二つだけです。サーバーが本文を生成しなくて済むこと、本文を転送しなくて済むこと。つまりコストと帯域です。クロールバジェットの文書も304の効果を「帯域とリソースの節約」としか書いていません。順位への影響は私も測っていませんし、公式も保証していません。'
  - question: 'mtimeベースのETagはHTTP仕様違反ですか。'
    answer: '違反ではありません。RFC 9110の8.8.3.1は、エンティティタグの生成方法として「表現内容の衝突耐性ハッシュ、複数のファイル属性の組み合わせ、あるいは秒未満の解像度を持つ更新時刻」を並べて例示しています。mtimeとサイズを繋いだ値は二番目に当たります。問題は仕様違反かどうかではなく、その値がデプロイのたびに変わって再検証が成立しなくなるという実効性の側にあります。'
  - question: '静的ホスティングでこれを直せますか。'
    answer: 'オリジンのレスポンスヘッダーに手を入れられるかどうかで決まります。自前のサーバーやCDNワーカーを握っているなら、ファイル内容のハッシュをETagとして出せば終わりです。私のサイトが使っているGitHub Pagesのようにヘッダー設定の項目がないホスティングでは、その層では直せません。前段にヘッダーを書き換えるCDNを置く選択肢が残ります。ただし直す前に、自分の規模でこのコストが意味を持つかを判断するほうが先です。'
  - question: 'デプロイ時にファイルの更新時刻を保存すれば済みませんか。'
    answer: '転送ツールのレベルでは可能です。rsyncの-aはmtimeを保存するので、内容が変わらないファイルの検証子もそのまま残ります。ただしCIでリポジトリを新規チェックアウトしてビルドする流れなら、成果物のmtimeはその実行時刻で新しく打たれます。mtime保存はパイプライン全体がその時刻を守るときにだけ成立する解であり、内容ハッシュはパイプラインと無関係に成立します。'
relatedPosts:
  - slug: sitemap-lastmod-crawl-scheduling-2026
    score: 0.72
    reason:
      ko: sitemap의 lastmod가 "정확할 때만 쓰인다"면, 응답 헤더의 Last-Modified는 "정확하지 않아도 그냥 쓰인다". 같은 날짜 값이 두 계층에서 반대로 취급되는 이유를 붙여 읽으면 잡힌다.
      ja: sitemapのlastmodが「正確なときだけ使われる」なら、レスポンスヘッダーのLast-Modifiedは「不正確でもそのまま使われる」。同じ日付値が二つの層で逆に扱われる理由が、並べて読むと見えてくる。
      en: If a sitemap's lastmod is only used when it is accurate, the Last-Modified response header is used whether it is accurate or not. Reading both explains why the same date behaves in opposite ways at two layers.
      zh: 如果说 sitemap 的 lastmod「只有准确时才被采用」，响应头里的 Last-Modified 则是「不准确也照用」。把两篇并读，就能看清同一个日期值在两个层面为何被反向对待。
  - slug: internal-link-trailing-slash-redirect-audit-2026
    score: 0.68
    reason:
      ko: 그 글은 크롤러가 링크 절반에서 301을 받는 낭비를 셌고, 이 글은 받아온 본문을 통째로 다시 받는 낭비를 잰다. 둘 다 빌드 산출물은 멀쩡한데 배송 계층에서 새는 경우다.
      ja: あちらはクローラーがリンクの半分で301を受け取る無駄を数え、こちらは同じ本文をまるごと再取得する無駄を測る。どちらもビルド成果物は正しいのに、配信の層で漏れている。
      en: That audit counted the waste of crawlers hitting 301s on half the internal links; this one measures the waste of re-downloading bodies that never changed. Both are leaks in delivery, not in the build.
      zh: 那篇数的是爬虫在一半内部链接上吃到 301 的浪费，本文测的是把没变过的正文整份重下的浪费。两者的构建产物都没问题，漏在投递层。
  - slug: crawl-depth-flat-archive-audit-2026
    score: 0.61
    reason:
      ko: 크롤러가 페이지에 닿는 경로를 셌던 글이다. 이번 글은 그 크롤러가 두 번째로 왔을 때 무엇을 받아가는지를 센다. 첫 방문과 재방문을 각각 재보면 내부 링크와 캐시 헤더가 서로 다른 문제라는 게 분명해진다.
      ja: あちらはクローラーがページへ到達する経路を数えた。今回は同じクローラーが二度目に来たとき何を受け取るかを数える。初回訪問と再訪をそれぞれ測ると、内部リンクとキャッシュヘッダーが別問題だと分かる。
      en: That post counted how a crawler reaches a page. This one counts what it carries away on the second visit. Measuring first visit and revisit separately makes clear that internal links and cache headers are different problems.
      zh: 那篇数的是爬虫如何抵达页面，本文数的是它第二次到访时带走了什么。把首访与回访分开测，就能看出内部链接与缓存头是两个问题。
  - slug: ai-crawlers-dont-render-javascript-csr-2026
    score: 0.55
    reason:
      ko: 크롤러가 무엇을 실행하지 않는지를 쟀던 글과, 크롤러가 무엇을 다시 받아가는지를 재는 글이다. 서버가 내보낸 바이트만이 전부라는 같은 전제 위에 서 있다.
      ja: あちらはクローラーが何を実行しないかを測り、こちらは何を再取得するかを測る。サーバーが送ったバイトだけが全てだという同じ前提の上に立っている。
      en: One post measured what crawlers refuse to execute; this one measures what they fetch all over again. Both rest on the same premise, that the bytes the server sent are all there is.
      zh: 一篇测的是爬虫不执行什么，一篇测的是爬虫又重下了什么。二者立足于同一个前提：服务器发出的字节就是全部。
---

去年の10月に書いた記事がある。本文には一度も手を入れていない。昨日、別件を確認するついでにそのURLへ `curl -I` を投げたら、`Last-Modified` が昨日の未明になっていた。

誤字ひとつ直した覚えのないページだ。気になって他のURLも八つ叩いてみた。2025年の記事、今年の記事、利用規約、中国語版、`robots.txt`。全部 `Sun, 02 Aug 2026 16:08:29 GMT` だった。秒まで揃っている。この値はページが変わった時刻ではなく、私が昨日デプロイした時刻だ。

ここまでは静的ホスティングでよくある話。問題はその先にある。同じソースでサイトをもう一度ビルドしてみたら、HTML 1,346枚がSHA-256で<strong>一枚残らず前回のビルドと一致</strong>した。コンテンツは完璧に再現できるのに、そのコンテンツに付く検証子はデプロイのたびに全部が新しい値になる。クローラーが昨日持ち帰った検証子を携えて再訪すると、サーバーは毎回「変わった」と答える。実際には1バイトも変わっていないのに。

## 検証子が指しているのはファイルではなくデプロイだ

まずレスポンスヘッダーをそのまま見る。1年近く触っていない記事のものだ。

```bash
$ curl -sSI https://jangwook.net/ko/blog/ko/playwright-ai-testing/
HTTP/2 200
server: GitHub.com
last-modified: Sun, 02 Aug 2026 16:08:29 GMT
etag: "6a6f6b7d-3279e"
cache-control: max-age=600
content-length: 206750
```

`ETag` を分解すると出所がすぐ割れる。ハイフンの前後がそれぞれ16進数になっている。

```text
0x6a6f6b7d = 1785686909  -> Sun, 02 Aug 2026 16:08:29 GMT  (= Last-Modifiedと同一)
0x3279e    = 206750      -> Content-Lengthと同一
```

ファイルの更新時刻とサイズを繋いだ値だ。Apacheやnginxのデフォルトが昔から使ってきた形式で、GitHub Pagesも同じ形を採る。つまりこのサイトの二つの検証子、`ETag` と `Last-Modified` は<strong>独立した二つの信号ではなく、一つの事実(ファイルのmtime)を二度表現したもの</strong>にすぎない。片方が崩れればもう片方も同時に崩れる。

数枚の目視で終わらせず標本で確かめたかったので、監査スクリプトを書いてリポジトリに入れた。ビルド成果物から実在のURLを拾ってヘッダーを集め、受け取った検証子をそのまま送り返して条件付きリクエストが成立するかを見る。

```bash
$ node scripts/audit-cache-validators.mjs --n=8
base                 https://jangwook.net
urls sampled         8
sends a validator    8/8
304 on revalidate    8/8
cache-control        max-age=600
distinct Last-Modified values across the sample: 1  <-- one shared timestamp: this is a deploy stamp, not a content date
ETags shaped "<hex>-<hex>" (mtime+size): 8/8  <-- validators will reset on the next deploy
  304  W/"6a6f6b7d-1c3"        Sun, 02 Aug 2026 16:08:29 GMT  /deepdiner/
  304  W/"6a6f6b7d-10147"      Sun, 02 Aug 2026 16:08:29 GMT  /en/blog/en/hindsight-mcp-agent-memory-learning/
  304  W/"6a6f6b7d-7e2e"       Sun, 02 Aug 2026 16:08:29 GMT  /en/social/
  304  W/"6a6f6b7d-10803"      Sun, 02 Aug 2026 16:08:29 GMT  /ja/blog/ja/heterogeneous-llm-agent-fleet-cost-optimization/
  304  W/"6a6f6b7d-810b"       Sun, 02 Aug 2026 16:08:29 GMT  /ja/social/
  304  W/"6a6f6b7d-1191a"      Sun, 02 Aug 2026 16:08:29 GMT  /ko/blog/ko/hindsight-mcp-agent-memory-learning/
  304  W/"6a6f6b7d-7791"       Sun, 02 Aug 2026 16:08:29 GMT  /ko/terms/
  304  W/"6a6f6b7d-1e36c"      Sun, 02 Aug 2026 16:08:29 GMT  /zh/blog/zh/hono-typescript-api-2026/
```

標本八件の `Last-Modified` が一種類しかない。2025年に書いた英語記事も、去年から触っていない利用規約も、同じ秒を指している。

この実行でもう一つ引っかかったことがある。`fetch()` が `Accept-Encoding: gzip` を付けた途端、ETagが `W/` 付きの弱い検証子で返ってきた。圧縮を要求しなければ強い検証子になる。同じURL、同じファイルなのに、ネゴシエーションの結果で検証子の強度が変わる。

```bash
$ curl -sSI https://jangwook.net/deepdiner/ | grep -i etag
etag: "6a6f6b7d-1c3"
$ curl -sSI -H 'Accept-Encoding: gzip' https://jangwook.net/deepdiner/ | grep -iE 'etag|content-encoding'
etag: W/"6a6f6b7d-1c3"
content-encoding: gzip
```

`0x1c3` は451で、このファイルの圧縮前サイズがちょうど451バイト。圧縮表現に付いたタグなのに、値そのものは元サイズから来ている。`If-None-Match` は弱い比較を使うので再検証自体は通る。ただし強い検証子が要る場面、たとえばレンジリクエストの `If-Range` では、この差がそのまま効く。

## 条件付きリクエストは何をやり取りしているのか

条件付きリクエストを自分で組んだ経験がないと、上のログの `304` がなぜ大事なのか掴めない。

クローラーやブラウザがあるURLを最初に取得すると、レスポンスに付いてきた `ETag` と `Last-Modified` をそのURLの目印として保存する。次に同じURLを要求するとき、保存した目印をリクエストヘッダーに載せて送る。`ETag` は `If-None-Match` へ、`Last-Modified` は `If-Modified-Since` へ。サーバーはその目印が現在の値と一致するかを見て、一致すれば `304 Not Modified` を本文なしで返す。クライアントは手元のキャッシュをそのまま使う。

Googleは自社のクロールインフラがこの仕組みに対応していると公式ブログに書いている。[Crawling December: HTTP caching](https://developers.google.com/search/blog/2024/12/crawling-december-caching)(2024年12月9日)から引く。

> Google's crawlers that support caching will send the `ETag` value returned for a previous crawl of that URL in the `If-None-Match header`. If the `ETag` value sent by the crawler matches the current value the server generated, your server should return an HTTP `304` (Not modified) status code with no HTTP body.

本文がないことが肝心だ、と同じ記事([原典](https://developers.google.com/search/blog/2024/12/crawling-december-caching))は続ける。サーバーはコンテンツを生成する計算資源を使わずに済み、本文を転送する帯域も使わずに済む。どちらを使うべきかについての推奨も明記されている。

> We strongly recommend using `ETag` because it's less prone to errors and mistakes (the value is not structured unlike the `Last-Modified` value).

そして、この記事にとって最も重い一文がこれだ([原典](https://developers.google.com/search/blog/2024/12/crawling-december-caching))。

> Our recommendation is that you require a cache refresh on significant changes to your content; if you only updated the copyright date at the bottom of your page, that's probably not significant.

ページ下部の著作権表示の年を変えただけなら、キャッシュを更新させるほどの変更ではない。そういう趣旨だ。ところが私のサイトは、著作権の年すら変えていないのにサイト全体のキャッシュを更新させていた。デプロイ一回がそうさせる。

実際にどれだけ差が出るかは測ればいい。同じURLに三種類のリクエストを投げた。

```bash
$ curl -sS -o /dev/null -w 'code=%{http_code} down=%{size_download} header=%{size_header} t=%{time_total}\n' \
    https://jangwook.net/ko/blog/ko/playwright-ai-testing/
code=200 down=206750 header=660 t=0.133967

# 現在有効なETagをそのまま送り返した場合
code=304 down=0 header=365 t=0.041801

# デプロイ以前の日付でIf-Modified-Sinceを送った場合
code=200 down=206750 t=0.064747
```

206,750バイトと0バイト。ヘッダーまで数えても660バイト対365バイト。このページ一枚で、再訪一回につき200KB強が流れる。gzipをネゴシエートすれば30,246バイトまで落ちるが、0と比べれば依然として30KBだ。

三番目のリクエストがこの記事の主題になる。クローラーがデプロイ前に受け取った値を携えて来ると、ファイルが同一でもサーバーは本文を丸ごと送り直す。

## バイトが同じでも、再デプロイすれば200が返る

本番サイトでは「デプロイ前の検証子」を自由に作れないので、同じ条件を一時サンドボックスで再現した。検証子の生成方法だけが違う二つのサーバーを立て、他は揃えてある。片方はmtimeとサイズからETagを作り(GitHub Pages・Apache方式)、もう片方はファイル内容のSHA-256から作る。

```js
// mtime方式: ファイル属性から検証子を作る
const st = statSync(file);
const mtime = Math.floor(st.mtimeMs / 1000);
etag = `"${mtime.toString(16)}-${st.size.toString(16)}"`;

// 内容ハッシュ方式: バイトから検証子を作る
etag = `"${createHash('sha256').update(body).digest('hex').slice(0, 16)}"`;
```

手順は三段。最初のリクエストで検証子を受け取って保存し、ファイルをバイト単位で同一のまま再デプロイし(ディレクトリを消して原本から再コピー)、保存しておいた検証子で条件付きリクエストを送る。実行ログをそのまま貼る。

```text
===== validator mode: mtime =====
1) first crawl        -> ETag="6a703515-3279e"  Last-Modified=Mon, 03 Aug 2026 06:28:37 GMT
200 206750B first crawl (unconditional GET)
304 0B revisit, nothing deployed  [If-None-Match]
304 0B revisit, nothing deployed  [If-Modified-Since]
2) redeploy: same bytes, fresh checkout (sha256 unchanged)
   sha256 before/after: c3f104574859d427 / c3f104574859d427
   new ETag: "6a703519-3279e"
200 206750B after redeploy             [If-None-Match]
200 206750B after redeploy             [If-Modified-Since]
3) real edit: one byte appended
200 206766B after real edit            [If-None-Match]

===== validator mode: content =====
1) first crawl        -> ETag="c3f104574859d427"  Last-Modified=Mon, 03 Aug 2026 06:28:42 GMT
200 206750B first crawl (unconditional GET)
304 0B revisit, nothing deployed  [If-None-Match]
304 0B revisit, nothing deployed  [If-Modified-Since]
2) redeploy: same bytes, fresh checkout (sha256 unchanged)
   sha256 before/after: c3f104574859d427 / c3f104574859d427
   new ETag: "c3f104574859d427"
304 0B after redeploy             [If-None-Match]
304 0B after redeploy             [If-Modified-Since]
3) real edit: one byte appended
200 206766B after real edit            [If-None-Match]
```

mtime方式では、再デプロイ後のETagが `"6a703515-3279e"` から `"6a703519-3279e"` に変わった。サイズ部分(`3279e`)はそのままで、前半の時刻だけが4秒動いている。その4秒が206,750バイトを再び流す。内容ハッシュ方式は再デプロイ後も `"c3f104574859d427"` を保ち、304で応じた。本当に1バイト足したときには、そこで初めて200に切り替わっている。無効化すべきときにだけ無効化された、ということだ。

![同じファイルを再デプロイした後、次のクロールで転送される本文バイト数。mtime検証子は206,750バイトを送り直し、内容ハッシュ検証子は0バイトで済む](../../../assets/blog/etag-deploy-invalidation-conditional-requests-2026/redeploy-bytes.png)

RFC 9110はこの二つをどちらも認めている。[8.8.3.1](https://www.rfc-editor.org/rfc/rfc9110.html#section-8.8.3.1)はエンティティタグの生成例として「表現内容の衝突耐性ハッシュ、複数のファイル属性の組み合わせ、秒未満の解像度を持つ更新時刻」を並べて挙げる。mtimeベースのETagは仕様違反ではない。ただし同じ文書の[8.8.1](https://www.rfc-editor.org/rfc/rfc9110.html#section-8.8.1)がこう付け加える。

> A strong validator might change for reasons other than a change to the representation data, such as when a semantically significant part of the representation metadata is changed (e.g., Content-Type), but it is in the best interests of the origin server to only change the value when it is necessary to invalidate the stored responses held by remote caches and authoring tools.

変わってもよいが、リモートのキャッシュを本当に無効化すべきときにだけ変えるのがオリジンサーバーにとって得だ、という意味になる。同じ節は代替案も名指ししている。"A collision-resistant hash function applied to the representation data is also sufficient."

## 同じソースで再ビルドした1,346枚が全部一致した

内容ハッシュに切り替えれば検証子が自動的に安定する、という話でもない。ビルドが実行ごとに少しずつ違うHTMLを吐くなら、ハッシュも毎回変わって同じ問題に戻る。タイムスタンプの埋め込み、ランダムなID、順序の定まらないクラス列。よくある原因だ。

そこでソースに一切触れず、ただ再ビルドした。

```bash
$ find dist -name '*.html' -print0 | xargs -0 shasum -a 256 | sort -k2 > before.txt
$ TEST_FLG=false npm run build     # real 85.30s
$ find dist -name '*.html' -print0 | xargs -0 shasum -a 256 | sort -k2 > after.txt

before=1346 after=1346
identical bytes : 1346 (100.0%)
changed bytes   : 0 (0.0%)
```

1,346枚すべてがバイト単位で一致した。このサイトのビルドは完全に再現可能で、内容ハッシュを検証子に使えばデプロイを百回繰り返しても値は動かない。

二つの数字を並べると、この記事の主張は尽きる。<strong>コンテンツの再現率は100%、デプロイされた検証子の安定性は0%。</strong>完全に決定的なパイプラインの成果物が、最後の配信段階で毎回あたらしい身分証を発行され直している。

ちなみにサイト全体のHTMLは1,346枚、非圧縮で109.4MB、gzip -6で26.4MB。1ページ平均はそれぞれ85,207バイトと20,537バイトになる。全面再取得が一度起きればその分が流れる。条件付きリクエストが全部成立していれば、304のレスポンスヘッダー365バイトずつ、合計0.5MB弱で終わっていたトラフィックだ。

## 1日5.25回のデプロイが作る確率ゼロ

とはいえ、デプロイのたびに検証子がリセットされるという事実だけでは被害の規模が分からない。クローラーの再訪間隔とデプロイ間隔、その関係が実際の値を決める。クローラーがあるURLに戻ってきて304を受け取るには、<strong>前回の訪問以降にデプロイが一度もない</strong>ことが要る。だから条件付きリクエストの成功率は「再訪間隔の中でデプロイが0回である確率」と等しい。

これは測れる。直近30日のコミットログを取り、5分以内に連続するコミットを一回のデプロイとしてまとめた。このリポジトリはmainへのpushごとにGitHub Actionsがビルドしてデプロイする。

```text
commits: 178
deploys (5-min clustering): 154
span days: 29.3  -> 5.25 deploys/day
gap hours: median=2.75 mean=4.60 p10=0.17 p90=15.84 max=16.80
```

デプロイ間隔の中央値は2時間45分、最大でも16時間48分。丸一日空いた日が30日間で一度もない。このタイムライン上を10分刻みで窓をずらし、「この窓の中にデプロイが0回か」を数えるとこうなる。

| クローラーの再訪間隔 | その間にデプロイがない確率 | 条件付きリクエストの結果 |
|---|---|---|
| 1時間 | 83.7% | おおむね304 |
| 3時間 | 60.9% | 半分強が304 |
| 6時間 | 37.0% | 多くは200 |
| 12時間 | 12.0% | ほぼ全部200 |
| 24時間 | 0.0% | 全部200 |
| 72時間 | 0.0% | 全部200 |
| 7日 | 0.0% | 全部200 |

一日を越えた瞬間にゼロになる。近似ではなく、観測したタイムライン上にそういう窓が一つも現れなかったという意味だ。毎日書いて毎日デプロイするサイトでは、クローラーが昨日訪れたページに今日また来ると、条件付きリクエストは100%失敗する。そのページが1年前から一字も変わっていなくても同じだ。

この構造を疑い始めたきっかけは、[内部リンクの半数が301で弾かれていた監査](/ja/blog/ja/internal-link-trailing-slash-redirect-audit-2026)だった。あのときもビルド成果物は正しく、漏れていたのは配信の層だった。今回も同じ種類の話になる。ソースをどれだけ磨いても、最後の一ホップで値が変わってしまえば、手前の精密さは相手に届かない。

## この無駄が本当に問題になる条件

上の数字は見栄えがするが、それが私のサイトの緊急事態を意味するわけではない。

Googleの[クロールバジェット管理ガイド](https://developers.google.com/search/docs/crawling-indexing/large-site-managing-crawl-budget)は、この問題を気にすべき対象を明示的に絞っている。"Large sites (1 million+ unique pages) with content that changes moderately often (once a week)"、そして "Medium or larger sites (10,000+ unique pages) with very rapidly changing content (daily)"。私のサイトは1,346枚で、どちらの線にも届かない。同じ文書が304について約束しているのも一行だけだ。"Support `304 (Not Modified)` HTTP status codes. If a page hasn't changed since Google last crawled it, returning a `304` code tells Google to reuse the cached version, saving your server bandwidth and resources." 帯域とリソースを節約するという話であって、順位の話ではない。

正直に並べるとこうなる。

- <strong>順位とは無関係だ。</strong>304を増やせば検索順位が上がるという公式の根拠はない。私も測っていないし、測る手段もない。
- <strong>実際のクローラーの挙動は測れていない。</strong>GitHub Pagesはアクセスログを提供しない。上の確率表は「再訪間隔がX時間なら」という条件付きの計算であって、Googlebotが実際に何時間おきに来るかを観測した値ではない。サーバーログが取れるホスティングなら、ここは仮定ではなく実測に置き換えられる。
- <strong>AIクローラーが条件付きリクエストを送るかは確認できていない。</strong>ログがない以上、ユーザーエージェント別の挙動を切り分ける手立てがない。[クローラーがJavaScriptを実行しないこと](/ja/blog/ja/ai-crawlers-dont-render-javascript-csr-2026)はレスポンスだけで確かめられたが、再検証の習慣はそうはいかない。
- <strong>仕様違反ではない。</strong>先に引いたRFC 9110の8.8.3.1がmtimeベースのタグを認めている。ホスティングが間違った作りをしているのではなく、この方式が毎日デプロイするサイトと噛み合わないだけだ。
- <strong>5分クラスタリングは近似だ。</strong>実際のデプロイ回数はこれより少ないことも多いこともありうる。ただし24時間の窓で0%という結論は、まとめ方をどう変えてもほぼ動かない。デプロイのない日が一日もなかったからだ。

それでもこの値を把握しておく理由は残る。GitHub Docsの[GitHub Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)には "GitHub Pages sites have a soft bandwidth limit of 100 GB per month" と書かれている。帯域は無限の資源ではない、ということだ。加えてGoogleのキャッシュ記事は、全フェッチのうちキャッシュで処理できた割合について "10 years ago about 0.026% of the total fetches were cacheable, which is already not that impressive; today that number is 0.017%" と明かしている。ウェブ全体がこの値を放置しているという話でもある。

## 自分のホスティングを3分で判定する手順

三段階で、自分のサイトの状態は判定できる。

<strong>1段目。検証子を送っているかを見る。</strong>

```bash
curl -sSI https://example.com/ | grep -iE 'etag|last-modified|cache-control'
```

何も出てこなければ、条件付きリクエストはそもそも成立しない。この場合がいちばん伸びしろが大きい。

<strong>2段目。その値がコンテンツ由来かを見る。</strong>異なるURLをいくつか集めて `Last-Modified` を並べる。全部が同じ秒を指していれば、それはデプロイ時刻だ。ETagが `"<16進数>-<16進数>"` の形なら、mtimeとサイズから来ている可能性が高い。リポジトリに置いたスクリプトはこの二つを一度に判定する。

```bash
node scripts/audit-cache-validators.mjs --base=https://example.com --n=12
```

<strong>3段目。再デプロイして値が動くかを見る。</strong>コンテンツを変えないデプロイを一度回し、同じURLのETagを前後で比べる。値が変わったなら、そのホスティングの検証子はコンテンツではなくデプロイを指している。

判定の結果で、やることが分かれる。

| 状況 | 判断 | やること |
|---|---|---|
| オリジンを直接握っている(自前サーバー・CDNワーカー) | 直せるし、コストも低い | ETagをファイル内容のハッシュで生成。静的アセットはビルド時に計算してキャッシュ |
| マネージド静的ホスティング + 1万ページ未満 | 把握はしておく。急ぐ必要はない | 値を記録しておき、規模が伸びたら再検討 |
| マネージド静的ホスティング + 大規模または帯域制約あり | ホスティング層がボトルネック | 前段にヘッダーを書き換えるCDNを置くか、ホスティングを移す |
| デプロイをrsyncで自前運用している | 部分的に直せる | `rsync -a` でmtimeを保存。ただしCIが毎回ビルドし直すなら時刻が新しく打たれて効果なし |

オリジンを握っているなら、コードは本当に短い。先のサンドボックスで使ったものと同じだ。

```js
import { createHash } from 'node:crypto';

// ビルド時に一度計算して「ファイルパス -> ETag」のマップで持てば、
// リクエストごとにハッシュを取り直さずに済む
const etagOf = (buf) => `"${createHash('sha256').update(buf).digest('hex').slice(0, 16)}"`;
```

注意が一点。`Last-Modified` も併せて直す必要がある。ETagだけ内容ハッシュにして `Last-Modified` をファイルのmtimeのまま残すと、`If-Modified-Since` で再検証するクライアントは相変わらず毎回200を受け取る。二つの値が同じ事実を指すように揃えないと片肺になる。私はサンドボックスで、内容ハッシュが最初に現れた時刻を別ファイルに記録して `Last-Modified` に使う方式を確かめた。sitemapのlastmodを正確にするときに[使ったのと同じ発想](/ja/blog/ja/sitemap-lastmod-crawl-scheduling-2026)だ。日付の値は、どこで使われるにせよ「内容が変わった時刻」でなければならない。

## まとめ: 検証子はデプロイではなくコンテンツを指すべきだ

今日測ったことを五行に畳む。

- このサイトの `ETag` は `hex(mtime)-hex(size)` であり、`Last-Modified` と同じ事実を二度表現している。標本8件の `Last-Modified` は秒まで同一だった。
- 同じソースで再ビルドしたHTML 1,346枚が100%バイト一致した。コンテンツは再現されるのに、検証子は再現されない。
- サンドボックスでバイト同一の再デプロイを行うと、mtime検証子は206,750バイトを送り直し、内容ハッシュ検証子は0バイトで終えた。
- 1日5.25回デプロイする環境では、再訪間隔が24時間を越えた時点で条件付きリクエストの成功確率は0%になる。
- 順位とは無関係だ。これは帯域とオリジンの計算資源の話で、1万ページ未満のサイトなら把握しておく程度で足りる。

チェックリストに落とすとこうなる。

- [ ] `curl -sSI` で `ETag`・`Last-Modified`・`Cache-Control` が出るか確認
- [ ] 異なるURLの `Last-Modified` が全部同じ値でないか確認(同じならデプロイ時刻)
- [ ] コンテンツ変更なしのデプロイ前後でETagが動くか確認
- [ ] オリジンを握っているならETagを内容ハッシュに、`Last-Modified` を内容変更時刻に差し替え
- [ ] ビルドが決定的かを先に確認(二度ビルドしてハッシュ比較)。決定的でなければ内容ハッシュも揺れる

ホスティングを選ぶとき、私たちは価格表とデプロイの手軽さを見る。レスポンスヘッダーがコンテンツの身元を正しく指しているかを訊く人はいない。私はその問いを先に投げて、数字で答えを出す仕事をしている。連絡先は[プロフィール](/ja/about/)に。

---

*出典: Google Search Centralの[Crawling December: HTTP caching](https://developers.google.com/search/blog/2024/12/crawling-december-caching)(2024年12月9日)、[Large site owner's guide to managing your crawl budget](https://developers.google.com/search/docs/crawling-indexing/large-site-managing-crawl-budget)、IETF [RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html) 8.8.1・8.8.3.1、GitHub Docsの[GitHub Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)(すべて公式)。測定環境: jangwook.netのライブレスポンス(GitHub Pages、2026年8月3日)、自前のAstroビルド成果物HTML 1,346枚、Node 22.22、curl 8.7、サンドボックスはmacOSローカルのHTTPサーバー。デプロイ統計は直近29.3日のgitコミット178件を5分間隔でクラスタリングした値。すべての数値はこのサイトとこのホスティングで得た値であり、Googleのクロールスケジューリング動作についての主張ではない。*
