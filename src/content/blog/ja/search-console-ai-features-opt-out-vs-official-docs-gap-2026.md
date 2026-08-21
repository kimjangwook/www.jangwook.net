---
title: "Google の AI features 文書に除外スイッチは一語も無い。抜けではなく設計の結果だ"
description: "AI features 文書の原文を全文カウントした。opt out、opt-out、exclude はいずれも 0 件。AI だけを外すレバーが存在しない理由と、その代わりに何をすべきか。"
pubDate: '2026-08-21'
heroImage: '../../../assets/blog/search-console-ai-features-opt-out-vs-official-docs-gap-2026/hero.png'
tags:
  - SEO
  - GEO
  - AI Overview
  - エンジニアリングマネジメント
relatedPosts:
  - slug: robots-snippet-controls-ai-overviews-2026
    score: 0.86
    reason:
      ko: 그 글이 nosnippet 계열 네 레버가 실제로 어떻게 착지하는지를 페이지 단위로 실측한 기록이라면, 이 글은 그 네 레버 말고는 아무것도 없다는 사실이 왜 문서의 누락이 아니라 설계의 결과인지를 다룬다.
      ja: あちらが nosnippet 系の四つのレバーがページ単位でどう着地するかの実測記録なら、こちらはその四つ以外に何も無いことが文書の抜けではなく設計の結果である理由を扱う。
      en: That post measures how the four nosnippet-family levers actually land on a page. This one explains why there is nothing besides those four, and why that absence is a design outcome rather than a documentation gap.
      zh: 那篇是对 nosnippet 系四个开关在页面上如何落地的实测记录；这篇则解释为什么除了这四个什么都没有，以及这种缺席为何是设计结果而非文档遗漏。
  - slug: ai-crawler-control-robots-txt-llms-txt-2026
    score: 0.81
    reason:
      ko: robots.txt로 학습을 막는 일과 검색면 AI 인용에서 빠지는 일은 다른 결정이다. 그 글이 크롤러 토큰 쪽 지도라면, 이 글은 그 지도를 들고 잘못된 티켓을 닫아 온 팀에게 보내는 정정이다.
      ja: robots.txt で学習を止めることと、検索面の AI 引用から外れることは別の決定だ。あちらがクローラートークン側の地図なら、こちらはその地図を手に誤ったチケットを閉じてきたチームへの訂正になる。
      en: Blocking training via robots.txt and dropping out of AI citations in Search are different decisions. That post maps the crawler-token side; this one is the correction for teams who have been closing the wrong ticket with that map in hand.
      zh: 用 robots.txt 拦训练，和从搜索面的 AI 引用中消失，是两个不同的决定。那篇画的是爬虫令牌那一侧的地图，这篇是写给拿着那张地图关错工单的团队的更正。
  - slug: official-geo-subtraction-gsc-control-2026
    score: 0.75
    reason:
      ko: 선언한 robots.txt와 실제 배포본이 어긋나 있던 그 경험이 이 글의 CI 게이트 제안으로 이어졌다. 파일을 읽는 검사와 렌더 결과를 세는 검사는 다른 것을 본다.
      ja: 宣言した robots.txt と実際の配信物がずれていたあの経験が、この記事の CI ゲート提案につながっている。ファイルを読む検査とレンダー結果を数える検査は別のものを見ている。
      en: The gap between a declared robots.txt and what actually shipped is what led to the CI gate proposed here. Reading a file and counting rendered output are two different inspections.
      zh: 声明的 robots.txt 与实际部署物之间的偏差，正是本文提出 CI 门禁的由来。读文件的检查和数渲染结果的检查，看的是两样东西。
---

通常の検索結果には残したまま、AI Overviews と AI Mode からだけ抜ける。そういうスイッチを Google が出したのかを知りたかった。だから Preferred Sources が発表された翌日、2026年8月21日に AI features 公式文書の生 HTML を落として語をカウントした。177,842バイトの全文で、`opt out` が 0 件、`opt-out` が 0 件、`exclude` が 0 件。

この不在は、誰かが書き忘れた抜けではない。アーキテクチャがそう出力しているだけだ。そしてこのスイッチの不在は、あなたのバックログに眠っている「AI に自社コンテンツを使わせないこと」という依頼が、エンジニアリングのタスクではないことを意味する。検索からの流入をどれだけ手放すか決める、事業側の判断だ。以下はその根拠と、この依頼が誤ったファイルに対して完了扱いされないよう自分が運用に入れた四つの規則だ。

## 語のカウントが示したもの

AI features 文書が、自社ページから検索に出る情報を減らす手段として名指しするのは、ちょうど四つだけだ。

> To limit the information shown from your pages in Search, use nosnippet, data-nosnippet, max-snippet, or noindex controls.
> — [AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)

四つのどれも AI 専用ではない。通常の検索結果の表示を何年も前から司ってきた、あのスニペット制御そのものだ。文書の最終更新表記は 2025-12-10 UTC。カウントした時点で、8か月以上そのまま止まっていた。

同じ8か月を逆方向から見る。Google の8月20日の発表が Preferred Sources を持ち込み、専用の開発者文書には 2026-08-20 UTC の更新表記が入っている。発表と同じ日だ。発表文の本文は 9,045バイト。その中に `preferred source` が 7 件、`publisher` が 8 件、`Top Stories` が 1 件、`AI Overviews` が 1 件、`AI Mode` が 2 件。`Search Console`、`turn off`、`exclude`、`remove`、`block` は全部 0 件。発表文には `opt out` が 1 件だけあるが、その 1 件は末尾のニュースレター登録欄に属している。「You may opt out at any time.」

発表文が出した唯一の規模の数字は、ユーザー側のものだった。

> Readers more easily find their favorite publications in Top Stories, AI Overviews, and AI Mode, while publishers gain a more seamless way to connect with readers across Google. So far, people have already selected more than 600,000 unique sources.
> — [A more personalized Search, Discover and News](https://blog.google/products-and-platforms/products/search/personalize-search-discover-news/)

60万というのは、ユーザーが選んだ固有ソースの数だ。パブリッシャーが得た成果の指標ではないし、その数値を経営層に成果として差し出す者がいてはならない。

## ダイヤルを取り付ける面が無い

仕組みは文書のたった一文にある。その一文が下流のすべてを決める。

> To be eligible to be shown as a supporting link in AI Overviews or AI Mode, a page must be indexed and eligible to be shown in Google Search with a snippet, fulfilling the Search technical requirements.
> — [AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)

AI 引用の資格は、独自の入力を持つ別パイプラインではない。既存の判定、つまりインデックスされているか、スニペット付きで表示される資格があるか、をそのまま使い回している。ここに AI 専用の除外ダイヤルを付けるには、Google 側の誰かがまず資格判定を検索用と AI 用の二本に割らなければならない。割れていない。だからダイヤルが載る面そのものが存在しない。

ここで自分の言い回しについて一つ断っておく。この判定構造を「共有された判定ひとつ」と呼ぶのは私の総合であって、Google の逐語表現ではない。文書が書いている語は "fulfilling the Search technical requirements" だ。私はその一文から共有判定を読み取っている。もし後から Google が、最初から二本あった分岐を文書化したなら、プラットフォームが変わったのではなく私の読みが誤っていたことになる。

包含の側も同じ構造を裏づける。Preferred Sources は基本の資格には一切手を触れず、その上にシグナルを一枚重ねるだけだ。

> In AI Mode and AI Overviews, your content can be highlighted with a "preferred" badge for users who have selected your site as a preferred source.
> — [Preferred sources](https://developers.google.com/search/docs/appearance/preferred-sources)

AI features 文書は、包含側に新規の実装が要らないことも明言している。「You don't need to create new machine readable files, AI text files, or markup to appear in these features.」その一方で、アクセス制御についての記述は Googlebot 自身を指し返す。「AI is built into Search and integral to how Search functions, which is why robots.txt directives for Googlebot is the control for site owners to manage access to how their sites are crawled for Search.」AI Overviews から逃れるために Googlebot を止めるとは、検索から出ていくことだ。値札はそこにはっきり書いてある。

## 誤ったファイルに対して閉じられるチケット

大規模なウェブリニューアルの現場で、AI 除外の要求はいつも同じ形で降りてくる。法務か広報が「AI に自社コンテンツが使われないようにしてほしい」と言う。エンジニアが robots.txt を開き、Google-Extended を Disallow して、Content-Signal の行に `ai-train=no` を足し、完了と報告する。要求は「AI から外せ」だった。実装は「学習から外した」だった。両方の文に AI という語が入っているので、レビュアーは `Google-Extended` の下の `Disallow: /` を見て PR を承認し、チケットが閉じる。

ところが Google-Extended は検索に一切触れない。

> Google-Extended does not impact a site's inclusion in Google Search nor is it used as a ranking signal in Google Search.
> — [Google crawlers and fetchers](https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers)

その crawlers 文書の語の分布が、このトークンの守備範囲を教えてくれる。Google-Extended が 6 回、Gemini が 4 回、Vertex が 8 回。`AI Overviews` は 0 回。`AI Mode` も 0 回。このトークンが司るのは Gemini と Vertex 側のモデル学習とグラウンディングだ。AI Overviews と AI Mode は、そもそも語彙に入っていない。

顧客データ基盤で削除要求を捌いた経験があれば、この失敗の形には見覚えがあるはずだ。要求の範囲は広く、システムは自分が触れる最も狭い技術境界までしか届かない。そして完了の定義が文書化されていないと、「やった」と「なっている」が静かに乖離する。誰も嘘はついていない。レビュアーは実在のファイルを読み、実在の指示子を見たのだから。

同じ日に、自分が管理する本番サイトでも配信物のプローブを回した。この乖離が手元でどれくらい開いているかを見るためだ。六つのセルを各三回、計18ラン。全リクエストが exit 0 と HTTP 200 で返り、受信バイト数も事前に登録した基準値と全部一致し、ボット遮断ページは 0 回。ただし、この 18 ランが実際に検証したのは自社配信物の健康状態であって、Google-Extended の境界がどこにあるかを試したわけではない。「Google-Extended が検索の AI 機能まで覆う」という仮説を壊しにいくセルも別に回したが、その仮説を反証する材料は出てこなかった。反証に失敗したことは、確認したことよりも弱い。そのように扱う。

意味があったのは、もっと小さい部分だ。`sitemap-ko.xml` は 71,340バイトで、351本の URL が並んでいる。そこから決定的な手順で12本を抜き、レンダー後のページが何を積んでいるかを調べた。12本すべてで `robots` と `googlebot` のメタタグが空だった。四つの制御のうち、この標本のどこにも生きているものは一つも無い。一方、自社の robots.txt には Google-Extended を止めるグループが二つ、`Content-Signal: search=yes,ai-train=no,use=reference` の行が一つ、そして GPTBot と CCBot を止める指示子が入っている。オンになっていたものは全部が学習側だった。検索面のスニペットについては何一つオンになっていない。12は小さい標本で、広げれば結果が動く余地は残る。それでも指している向きは予想どおりだった。ファイルが言っていたことを、配信物は一度も運んでいなかった。

## レビューで議論を終わらせる四つの軸

**包含か、除外か。** 同じ8か月で、包含の側は専用文書とボタンのコード片が Search Central に載り、ローンチ当日の更新まで受け取った。除外の側は、12月から動いていない文書だけを持っている。包含の実装費はゼロだ。新しいファイルもマークアップも要らない。除外の費用は、そのスニペットが稼いでいた流入そのものになる。

**学習の除外か、検索面の除外か。** Google-Extended、GPTBot、CCBot はモデル学習とグラウンディングを止め、検索の収録にもランキングにも影響しない。nosnippet 系の四つは検索での表示を止め、資格が共有されている以上、表示の停止が AI 面まで波及する。別のレバー、別の代価、そして共通する一語が Slack の中で両者を混ぜ続ける。

**コンテンツの粒度と、表面の切り分け。** どの文が出るかは制御できる。どの表面に出るかは制御できない。ここは私の読みに対する最も強い反論が存在する論点なので、次の節で扱う。

**宣言と、着地。** robots.txt は宣言だ。レンダーされたメタタグが実際に出荷されたものだ。自社で得た 12/12 の結果は、宣言と着地を別の検査として扱うべき理由のすべてになる。

## 「四つの制御はもう十分に精密だ」

ここまでに対する真面目な反論はこうなる。AI 専用の除外レバーが別に無いのではなく、要らないのだ。既存の四つがもう十分に精密なのだから。

粒度の話に限れば、この反論は正しい。弱く言い直すのではなく、全面的に認めておきたい。`data-nosnippet` は要素単位で効く。段落ひとつ、引用の抜き出し、価格表を丸ごと囲める。`max-snippet` は文字数で調整が効く。もし道具が `noindex` とページ単位の `nosnippet` しか無かったなら、「器具が粗い」という批判は成立していたはずだ。だが実際には成立しない。器具は細かい。だから私は粗さを論拠にするのをやめた。

反論が崩れるのは、精密さが答えているのが「何を消すか」であって「どこから消えるか」ではない点だ。段落に `data-nosnippet` を掛ければ、その段落は AI Overviews からも、AI Mode からも、通常の検索スニペットからも同時に消える。このレバーには表面を指すパラメータが無い。検索に残りつつ AI から抜けたいパブリッシャーが求めているのは、より細かい道具ではない。API に存在しない軸のほうだ。

反論が飛ばしがちな第二の費用もある。要素単位の精密さは、条件分岐できるテンプレートを前提にしている。共通テンプレートで量産されたサイトでは、誰かが先に分岐を作るまで選択適用そのものが成り立たない。その種のサイトでの正直な見積りは、マークアップ一行ではない。テンプレート改修があって、そのあとにマークアップ一行だ。

だから範囲は認めたうえで、立場は変えない。ページの内側については道具は足りている。表面を切り分ける側には何も無く、現場が実際に求めているのはその制御だ。

## 四つの規則、この順で

リンターを先頭に置く。すでに本番に入っている誤りを捕まえられるのはリンターだけだからだ。

sitemap から決定的な手順で標本を抜き、各 URL をレンダーし、出力上の `robots` と `googlebot` のメタタグを数え、レンダー結果が宣言した方針と食い違ったらビルドを落とす。自社の12本の標本は、この検査の最小構成にすぎない。robots.txt を読んで検証済みとみなす従来の手順こそが、乖離をそのまま残しておいた原因だ。

二つめ、方針文書を割る。「検索面の AI 除外」はスニペット予算を使う事業判断。「学習の除外」はクローラートークン一つに触れる技術判断。常に別項目で、決して一つにしない。

三つめ、除外レバーをオンにする PR は、対象ページ群が担っている自然検索流入の比率を説明欄に書かないかぎりマージしない。誰もその数字を出せないなら、その PR はまだ準備できていない。数字こそが判断そのものだ。

四つめ、「AI クローラーを遮断する」は社内の禁止表現にした。トークン名か表面名のどちらかを言う。学習なら Google-Extended。検索のスニペットと引用なら `data-nosnippet`。

確認できていないことを一つ挙げておく。ログイン後の Search Console 画面に AI 機能の項目があるかどうかは、今回数えていない。だから不在だとも主張しない。発表文がパブリッシャーを Search Console ではなく Search Central の文書へ送ったのは状況証拠であって、それ以上ではない。

## チケットに署名する前に測るもの

「AI から抜けるべきか」から始めない。「このページ群の売上が、検索でのスニペット露出にどれだけ乗っているか」から測る。その数字を欠いたまま降りてきた除外指示は、金額を知らずに承認する支払いだ。

包含と除外の単価が非対称だから、問いの順序をひっくり返す必要がある。包含は事実上ゼロだ。新しいファイルも、マークアップも、エンジニアリングのチケットも要らない。除外は、そのスニペットが運んでいた自然検索流入を差し出すことになり、その幅について Google は数字を公表していない。見積りはすべて自社の分析から出すしかない。つまり安い側は測れて、高い側は測れない。チームが高い側を安く見積もってしまう条件が、まさにこの非対称性だ。

検索流入がリードの供給源になっているチーム、B2B プラットフォームやコマース、企業サイトなら、私は標準に「除外レバーには触れない」と書き込み、その工数を Preferred Sources への対応とスニペット資格の維持に回す。コンテンツそのものが商品のチーム、有料記事や購読型データベース、会員限定の編集物であれば、要素単位の `data-nosnippet` は擁護できる。ただし対象ページ群の自然検索の落ち込みが、タグを出す前に予算へ入っていることが条件だ。翌四半期のレポートで発見するのでは遅い。

私の結論はこうなる。AI 専用の除外スイッチが無いのは、Google のリリース待ちの一時的な状態ではない。共有された資格判定から導かれる帰結であり、その判定が割れないかぎり、人が欲しがっている組み合わせは作れない。私が間違いだと証明されるとしたら、その形は狭くて具体的だ。通常の検索結果にはスニペット付きで出続けたまま、AI Overviews と AI Mode からページを外す制御を、Google が文書化すること。可能性を匂わせるブログ記事ではなく、公式文書の中の制御だ。

正直な留保も一つ卓上に残しておく。文書が8か月動かないことは、除外の方針が固まった証明にはならない。単に文書更新の配信が出ていないだけ、という説明とも同じくらい整合する。更新履歴は方針を語らない。

語るのは、手がどちらに伸びているかだ。どちらの方向の文書が機能の出る日に更新され、どちらが8か月止まっているかを数えるだけで、語の分布という以上のものを使わずに、そのプラットフォームがいま利用者に何を売っていて何を売っていないかが見えてくる。

## 参考資料

- [A more personalized Search, Discover and News](https://blog.google/products-and-platforms/products/search/personalize-search-discover-news/)
- [AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)
- [Preferred sources](https://developers.google.com/search/docs/appearance/preferred-sources)
- [Google crawlers and fetchers](https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers)
- [Robots meta tag, data-nosnippet, and X-Robots-Tag specifications](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag)
