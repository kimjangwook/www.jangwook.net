---
title: 'AIから除外するボタンを探して公式ドキュメントを全文カウントしたら、そのスイッチは存在しなかった'
description: 'Googleは2026年8月20日、Preferred Sourceの発表と同日に専用開発者文書を更新した。除外スイッチの側は2025年12月10日から止まったままだ。opt out・exclude の出現回数をゼロから数え、除外用のスイッチが存在しない理由を仕様レベルで確認した。'
pubDate: '2026-08-21'
heroImage: '../../../assets/blog/search-console-ai-features-opt-out-vs-official-docs-gap-2026/hero.png'
tags:
  - google-search-console
  - ai-overviews
  - seo
  - robots-txt
relatedPosts:
  - slug: robots-snippet-controls-ai-overviews-2026
    score: 0.85
    reason:
      ko: nosnippet·data-nosnippet가 AI 인용 입력까지 차단한다는 그 글의 결론이, 이 글에서 확인한 "배타 레버는 스니펫 통제뿐"이라는 판정의 근거 문서와 겹친다.
      ja: nosnippet・data-nosnippet がAI引用の入力まで遮断するという前稿の結論が、本検証で確認した「除外スイッチはスニペット制御のみ」という判定の根拠文書と重なる。
      en: That post's finding — nosnippet and data-nosnippet block AI citation input too — rests on the same document this post used to confirm that snippet controls are the only exclusion lever that exists.
      zh: 那篇文章的结论——nosnippet、data-nosnippet 会连 AI 引用输入一起挡掉——所依据的文档，与本文用来确认"排斥杠杆只有摘要控制"这一判断的文档是同一份。
  - slug: ai-crawler-control-robots-txt-llms-txt-2026
    score: 0.75
    reason:
      ko: Google-Extended가 검색 AI 배타 레버가 아니라 학습·그라운딩 범위라는 이 글의 판정이, robots.txt·llms.txt로 크롤러 접근 자체를 통제하는 그 글의 축과 정확히 나뉜다.
      ja: Google-Extended は検索AIの除外スイッチではなく学習・グラウンディング範囲を制御するものだという判定が、robots.txt・llms.txt でクローラーアクセス自体を制御する前稿の軸ときれいに分かれる。
      en: This post's finding that Google-Extended governs training and grounding, not search AI exclusion, sits cleanly apart from that post's axis of controlling crawler access itself via robots.txt and llms.txt.
      zh: 本文关于 Google-Extended 管的是训练与关联而非搜索 AI 排斥的判断，与那篇用 robots.txt、llms.txt 控制爬虫访问本身的主线正好分开。
  - slug: official-geo-subtraction-gsc-control-2026
    score: 0.72
    reason:
      ko: Search Console의 생성형 AI 스위치를 실측한 그 글과, 발표문이 퍼블리셔를 Search Console이 아니라 Search Central로 보냈다는 이 글의 발견이 서로 다른 문서를 가리킨다는 점에서 이어진다.
      ja: Search Console の生成AIスイッチを実測した前稿と、発表文が Search Console ではなく Search Central へ送っていたという検証結果が、指す文書の違いでつながる。
      en: That post measured Search Console's generative AI switch directly; this post found the announcement routes publishers to Search Central instead — the two point at different documents, and the gap is the connection.
      zh: 那篇实测了 Search Console 的生成式 AI 开关，本文则发现公告把发布者导向的是 Search Central 而非 Search Console——两者指向不同文档，这个落差正是连接点。
---

サイトのコンテンツをAI検索から外すスイッチがGoogle Search Consoleにあるのではないかという相談を現場で受けてきた。法務や広報から聞かれるたびに探した。公開されている公式ドキュメントを全文カウントした結果、公式仕様上にAI専用の除外スイッチは存在しなかった。あるのは一般検索のスニペット制御4項目だけで、絞ると通常検索とAI Overviewsの双方が同時に削られる。

AIから外すという要求を技術タスクだと誤解したまま設定を触ると、検索流入そのものを削っていることに気づかない。除外スイッチを探すのをやめ、スニペット予算をどれだけ使うかという経営判断に切り替える。結論はその一点に尽きる。

## 現場の問い — 「AIから外して」というチケット

大規模リニューアルの現場では、法務や広報から「うちのコンテンツがAIに使われないようにしてほしい」という要求が定期的に届く。エンジニアが最初に触るのはたいていrobots.txtだ。Google-ExtendedをDisallowにし、Content-Signal指示子（AI学習可否をクローラーに伝える一行）を`ai-train=no`と書き足し、対応完了としてチケットを閉じる。

本サイトの配信物でも同じ乖離が起きている。robots.txtにGoogle-Extendedを対象にしたDisallowグループが2つと、Content-Signal指示子が1行入っている。ところがsitemapから抽出した標本12件のURLを調べると、robotsやgooglebot向けのmetaタグは1つも着地していない。標本URLのレンダリング結果を並べて確かめて気づいた。学習は止めたが、検索のAI表面には手を付けていない。要求は「AIから外して」、実装は「学習データから外した」。どちらも「AI」という同じ単語を使うせいで、対象範囲がずれたまま完了報告が通ってしまう。完了の定義を決めない限り、「やった」と「実際に効いた」はこうして静かに分かれる。

## 公式ドキュメントが挙げる制御項目は4つだけ

Google Search Centralの公式ドキュメント「AI features and your website」を全文読んだ。検索結果に出る情報を絞る手段として、次の一文が挙がっている。

> To limit the information shown from your pages in Search, use nosnippet, data-nosnippet, max-snippet, or noindex controls.
> — [AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)

`nosnippet`（検索結果に要約文を出さない指示）、`data-nosnippet`（ページ内の特定要素だけをスニペット対象から外すHTML属性）、`max-snippet`（要約文の最大文字数を指定するパラメータ）、`noindex`（ページ自体を索引から外す指示）の4項目だ。この4項目はAI専用の新しい仕組みではない。もともと一般検索のスニペット表示を制御するパラメータだ。

なぜAI専用のスイッチがなく4項目で済むのか、ドキュメントの前段がその理由を説明している。

> AI is built into Search and integral to how Search functions, which is why robots.txt directives for Googlebot is the control for site owners to manage access to how their sites are crawled for Search.
> — [AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)

AI OverviewsやAI Modeは検索の外付け機能ではなく、検索そのものの一部として組み込まれている。制御点も検索用のクロール制御・スニペット制御と同じ場所にあり、AI専用の制御は用意されていない。

AI Overviewsの引用資格の判定基準も、通常検索の判定をそのまま再利用している。

> To be eligible to be shown as a supporting link in AI Overviews or AI Mode, a page must be indexed and eligible to be shown in Google Search with a snippet, fulfilling the Search technical requirements.
> — [AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)

AI Overviewsの根拠リンクとして出るための追加技術要件は無い。インデックス登録され、スニペット付きで検索結果に出る資格があれば、そのままAI回答の引用候補になる。

## なぜスイッチが二つに分かれないのか — 仕組みの話

ここが仕組みの核心だ。除外専用のスイッチが存在しないのは、ドキュメントの記述漏れではない。資格判定のパイプラインが1本しかないからだ。

通常検索に出るかを決める判定と、AI Overviewsの引用元として出るかを決める判定は、公式ドキュメント上、別のパイプラインとして分かれていない。「インデックスされスニペット表示の資格がある」という1つの判定を、AI Overviewsもそのまま参照している。「共有されている」と直接示す実装記述があるわけではなく、「追加の技術要件は無い」という記述からの推測である点は留保しておく必要がある。

判定ロジックが共通である以上、資格を操作するスイッチも1つにしかなり得ない。仮に「通常検索には出すがAI回答の入力には使わせない」という専用スイッチを作るなら、まず資格判定そのものを通常検索用とAI用の2本に分岐させる必要がある。分岐していないところにスイッチだけを後付けすることはできない。スイッチが無いのは文書の記述漏れではなく、現在のアーキテクチャ上、埋めようがない欄だからだ。

包含側、つまり自サイトをAI回答に優先引用させたい側の実装は、資格判定自体に手を加えていない。既存の判定の上に「ユーザーがこのサイトを選んだ」という条件を1つ重ねただけだ。ここでの「1本」は物理インフラではなく判定ロジックの共有を指す。ロジックを分岐させる必要がないからこそ、発表から1日で専用ドキュメントとボタンコードが揃った。

## 発表文とPreferred Source専用文書が向いている方向

2026年8月20日、GoogleはPreferred Sourceという機能を発表した。読者がTop Stories・AI Overviews・AI Modeで好みの情報源を選べる仕組みで、選ばれたサイトには「preferred」バッジが付く。発表文の本文をpreferred source・Top Stories・AI Overviews・AI Mode・publisherといった語で数えると、露出を増やす方向の語彙に集中している。逆にturn off・exclude・remove・blockといった除外方向の語はゼロだ。opt outという文字列は1件現れるが、ニュースレター購読解除の注意書き「You may opt out at any time.」であり、検索での除外とは無関係だ。

> Readers more easily find their favorite publications in Top Stories, AI Overviews, and AI Mode, while publishers gain a more seamless way to connect with readers across Google. So far, people have already selected more than 600,000 unique sources.
> — [A more personalized Search, Discover and News](https://blog.google/products-and-platforms/products/search/personalize-search-discover-news/)

発表文は60万件以上のユニークソースが選択されたと公表している。ただしこの数値は読者側の選択数であり、パブリッシャー側の流入効果を示す数字ではない。

Googleは発表文の中で、パブリッシャー向けの案内先をSearch ConsoleではなくSearch Centralの開発者ドキュメントに指定した。

> If you're a publisher, you can find the new "Preferred Source" button code in our Google Search Central documentation to get started.
> — [A more personalized Search, Discover and News](https://blog.google/products-and-platforms/products/search/personalize-search-discover-news/)

発表文の本文にSearch Consoleという語は一度も登場しない。

Preferred Source専用のドキュメントは、発表と同日の2026年8月20日付けで更新されている。

> In AI Mode and AI Overviews, your content can be highlighted with a "preferred" badge for users who have selected your site as a preferred source.
> — [Preferred sources](https://developers.google.com/search/docs/appearance/preferred-sources)

Preferred Sourceドキュメントの本文をカウントすると、preferred sourceという語だけで24回、AI Overviews・AI Mode・Top Storiesがそれぞれ2回ずつ現れる。opt outという語はここでも一度も出てこない。

対照的に、除外手段を説明する「AI features and your website」の最終更新表記は2025年12月10日のままだ。包含側には発表と同日に更新された専用ドキュメントが付き、除外側は8か月以上前の状態で止まっている。opt out・opt-out・excludeという語を全文検索してもゼロ件だ。公式文書の語彙からも、Googleの更新が包含側のみに向けられている実態が分かる。

## 反論 — 専用制御の不在は設計の誠実さだという見方

除外専用のスイッチが無いことを欠陥と決めつける前に、逆の立場を検討しておく。AIが検索そのものに組み込まれている以上、別の制御を作ること自体が守れない約束になる。インデックス・スニペット・AI引用が同じ判定を共有しているのに、AI入力だけを個別に切る設計は内部に矛盾を抱え込む。Googleはその約束をしなかった。

既存の4制御は精密に作られている。`data-nosnippet`は要素単位で効く。ページ全体ではなく、有料本文の一部や会員限定の要約、引用されると困る特定の段落だけを対象にできる。`max-snippet`は文字数単位で調整できる。ただし要素ごとの除外はマークアップを打ち分けられるテンプレート構造を前提とするため、共通テンプレートで量産されたサイトでは実装コストが嵩む。

既存の制御が効かない組み合わせが1つだけある。「AI回答の表面では引用させないが、通常検索のスニペットは維持したい」という要求だ。4つの選択肢をどのように組み合わせても、この状態は作れない。判定ロジックが1本である以上、AI側だけを閉じて検索側だけを開ける操作は成立せず、両方の露出を同時に引き受けるかどうかの選択になる。

## Google-Extendedは別の話

除外手段を探す過程で混同されやすいのがGoogle-Extendedだ。robots.txtでGoogle-ExtendedをDisallowにすればAI検索からも外れると誤解される場面は多い。公式ドキュメントはこの見解を否定している。

> Google-Extended does not impact a site's inclusion in Google Search nor is it used as a ranking signal in Google Search.
> — [Google crawlers and fetchers — Google-Extended](https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers)

Google-Extendedは検索のAI表面への露出には影響しない。では何を制御しているのか。「AI features and your website」のドキュメントでも、Google-Extendedを検索AI機能ではなく別のカテゴリーへ切り離している。

> To limit AI training and grounding in some of Google's other systems, read more about Google-Extended.
> — [AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)

Google-Extendedが制御するのは、Geminiなどの学習・グラウンディング（回答生成時に外部情報を根拠として参照する処理）に関わる範囲であり、検索結果やAI Overviewsへの掲載可否ではない。学習データから除外しても、検索AI表面への露出は手付かずのまま残る。検索側の露出を動かすなら、スニペット制御を直接設定する必要がある。

## 実行への落とし込み — 完了の定義を配信物で数える

この判定をもとに、現場の運用ルールを4つ定めた。

1つ目、ポリシー文書の中で「AI検索からの除外（スニペット予算の消費）」と「学習データからの除外（クローラートークンの制御）」を別項目に分け、同じ「AI」という単語で括らない。

2つ目、robots.txtだけを読んで完了と判定するチェックをやめる。sitemapから標本URLを抽出し、各URLのレンダリング結果でrobots・googlebot向けmetaタグの着地個数を数えるリンターをCIゲートに組み込む。今回の検証で行ったC4（sitemapから決定的な標本を選び、meta着地個数を数える手順）がこのリンターの最小形だ。宣言と実際の配信物がずれた瞬間にビルドを止める。

3つ目、除外設定を有効化するプルリクエストは、対象ページ群のオーガニック流入比率を本文に書かなければ通さない。スニペットを手放す判断である以上、レビュアーが確認すべき数字はコードの差分ではなく流入の数値だ。

4つ目、「AIクローラーを止める」という曖昧な表現を禁止し、どの表面の何を止めるのかをトークン名と対象機能名で正確に書かせる。

## CTOへの視点 — 包含と除外の単価は対称ではない

経営判断として整理すると、包含側と除外側でコスト構造は対称ではない。

包含側は公式ドキュメントが新しいファイルもマークアップも不要と明言している。実装コストは実質ゼロで、すでに通常検索に正常に出ているサイトは何もしなくてもAI引用の候補になる。

除外側は無料ではない。唯一の手段がスニペット制御である以上、AIから外れるコストは通常検索の結果からスニペットが消えることで支払われる。「AIから外すか」を問う前に、対象ページ群の検索スニペットへの依存度を測定する必要がある。数値を把握しないまま下りてきた除外指示は、コストを知らずに支払う決定になる。

コストの非対称性を踏まえると、方針は2つに割れる。中間はない。有料記事やリサーチレポート、独自データベースのようにコンテンツ自体が商品であるチームなら、対象ページ群のオーガニック流入を並べ、流入減を購読収益で埋め合わせられる範囲に絞って`data-nosnippet`を要素単位で仕掛ける。B2BサービスやEC、コーポレートサイトのように検索流入がリード獲得の主経路であるチームは、除外スイッチには触れず、Preferred Sourceボタンの実装とスニペット資格の維持に注力する。判定ロジックが1本である以上、同じスイッチを両方向に切り替えることはできない。どちらかを選ぶことになる。

組織のスケールという観点でもう1点付け加える。人数が増えるほど、法務が投げた「AIから外して」の一言が複数のエンジニアを経由し、そのたびに範囲の解釈がずれていく。なお、ログイン後のGoogle Search Console管理画面自体にAI専用の設定項目が存在するかどうかは今回の検証では直接測定できていない。公式ドキュメントの記述と仕様から除外レバーの不在を判定したものであり、画面を直接確認するまでは管理画面UI上の存在有無を断定しない。また、今回数えたのは本サイトの配信物1件分だけで、他のCMSやヘッドレス構成でrobots.txtとContent-Signalの宣言がどこまで実際のmetaタグと一致するかは、まだ確かめていない。

GoogleがAI表面の資格判定を通常検索のスニペット判定から切り離す仕様を発表した場合に限り、この線引きは前提から崩れる。判定が2本に分かれれば除外専用スイッチが生まれる余地ができ、今回の「中間はない」という整理ごと見直すことになる。

## 参考資料

- [A more personalized Search, Discover and News](https://blog.google/products-and-platforms/products/search/personalize-search-discover-news/)
- [AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)
- [Preferred sources](https://developers.google.com/search/docs/appearance/preferred-sources)
- [Google crawlers and fetchers — Google-Extended](https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers)
- [Robots meta tag, data-nosnippet, and X-Robots-Tag specifications](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag)
