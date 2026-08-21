---
title: '「AIから除外」ボタンを探して公式文書を読み倒した。存在しない、そこに理由がある'
description: '法務が「コンテンツをAI Overviewsから除外してくれ」とチケットを切る。エンジニアはrobots.txtを一行いじってクローズする。四つの公式文書を語彙単位で数えたら、そのチケットが一度も閉じていなかった理由が見えた。'
pubDate: '2026-08-21'
heroImage: '../../../assets/blog/search-console-ai-features-opt-out-vs-official-docs-gap-2026/hero.png'
tags:
  - SEO
  - GEO
  - Search Console
  - AI Overview
relatedPosts:
  - slug: robots-snippet-controls-ai-overviews-2026
    score: 0.8
    reason:
      ko: 그 글은 nosnippet 이 AI Overviews 인용 자격까지 끈다는 사실을 다뤘다. 이 글은 그 넷(nosnippet, data-nosnippet, max-snippet, noindex) 말고는 배타 레버가 아예 없다는 것, 그리고 그것이 왜 문서의 누락이 아니라 설계인지를 다룬다.
      ja: あちらは nosnippet が AI Overviews の引用資格まで止めることを扱った。こちらはその4つ（nosnippet, data-nosnippet, max-snippet, noindex）以外に排他レバーが存在しないこと、それが文書の欠落ではなく設計である理由を扱う。
      en: That post showed nosnippet also cuts AI Overviews citation eligibility. This one shows there is no fifth lever beyond those four, and why that absence is architecture, not a documentation gap.
      zh: 那篇讲的是 nosnippet 也会切断 AI Overviews 的引用资格。这篇讲的是除了这四个（nosnippet, data-nosnippet, max-snippet, noindex）之外根本没有第五个排他开关，以及这为什么是架构问题而不是文档遗漏。
  - slug: ai-crawler-control-robots-txt-llms-txt-2026
    score: 0.72
    reason:
      ko: 그 글은 크롤러를 들여보낼지 말지의 문제였다. 이 글은 이미 들어온 뒤 검색과 AI 표면 중 어디에 인용될지를 나누는 자격 판정 자체가 하나로 묶여 있다는 것을 다룬다. 층이 다르다.
      ja: あちらはクローラーを入れるか否かの問題だった。こちらは既に入った後、検索とAI表面のどちらに引用されるかを分ける資格判定そのものが一本に束ねられている点を扱う。層が違う。
      en: That post was about letting crawlers in or not. This one is about the eligibility judgment itself, made after entry, that decides both search and AI surfaces at once — a different layer entirely.
      zh: 那篇讲的是让不让爬虫进来。这篇讲的是爬虫进来之后，决定它能否出现在搜索和 AI 界面的资格判定其实是同一条判定线——这是完全不同的层。
  - slug: official-geo-subtraction-gsc-control-2026
    score: 0.68
    reason:
      ko: 그 글이 GSC 로 무엇을 뺄 수 있는지의 공식 범위를 다뤘다면, 이 글은 그 범위 밖에 있는 것 — AI 전용 배타 항목의 부재 — 을 문서 원문 어휘 카운트로 증명한다.
      ja: あちらが GSC で何を除外できるかの公式範囲を扱ったなら、こちらはその範囲の外にあるもの — AI専用の排他項目の不在 — を文書原文の語彙カウントで裏付ける。
      en: If that post mapped the official scope of what GSC lets you subtract, this one proves what sits outside that scope — the absence of an AI-only exclusion — with a raw word count from the source documents.
      zh: 如果那篇梳理的是 GSC 能减掉什么的官方范围，这篇证明的就是这个范围之外的东西——AI 专属排除项的缺失——用的是源文档的原文词频统计。
---

法務がチケットを切った。うちのコンテンツをAI Overviewsから除外してくれ、と。私はAI除外の設定を探しに行った。Googleの公式AI機能ドキュメントを一語ずつ読み、昨日出たGoogleの発表文にも同じ語彙カウントをかけた。自社の本番robots.txt（サイトがクローラーに何を許可し何を禁止するかを記す設定ファイル）とレンダー後のページを両方の基準に照らし、トグルがどこにあるべきかを確認した。設定は存在しない。理由が分かってしまえば、探すのをやめられる。

GoogleのAI機能ドキュメントが検索での露出を減らす手段として名指ししているのは、`nosnippet`（スニペット表示そのものを止める）、`data-nosnippet`（ページ内の特定要素だけをスニペットの対象から外す）、`max-snippet`（スニペットの文字数上限を制限する）、`noindex`（検索結果への掲載自体を止める）の4つだけだ。どれもAI専用ではない。通常の検索スニペットはそのままに、AI Overviewsからだけコンテンツを引き抜く5つ目のスイッチはない。この不在は文書の書き漏らしではない。一つの資格判定が両方の表面を同時に決めているから、こうなる。「AIから除外してくれ」というチケットをrobots.txtの編集でクローズしているチームがいるなら、間違ったチケットを閉じている。

食い違いが起きるのは、チケットの要求がエンジニアリングの成果物と一致しないからだ。法務が求めているのは事業上の結果、つまり生成AIの回答にコンテンツが使われないことである一方、エンジニアリングが納品するのはrobots.txtの1行でしかない。要求と修正が同じに見えるのは、両方が「AI」という語を使っているからだ。切り分けてしまえば、5分の設定変更に見えていた作業は、事業上の代償を伴う経営判断に変わる。

## 何が変わり、何が変わらなかったか

2つの公式文書から確認する。Google Search Centralの[AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)は、AI露出を減らす方法を扱う唯一の文書だ。最終更新の表記は2025-12-10 UTCで止まっている。2026-08-20、Googleは[A more personalized Search, Discover and News](https://blog.google/products-and-platforms/products/search/personalize-search-discover-news/)を公開し、「Preferred Source」を導入した。ユーザーが好みのサイトを選ぶ機能で、併設の[Preferred sources](https://developers.google.com/search/docs/appearance/preferred-sources)ページによればAI Mode（対話型の検索インターフェース）とAI Overviews（検索結果上部に出る要約）の両方で「preferred」バッジが表示される。更新表記は発表と同じ2026-08-20 UTCだ。可視性を増やす側の文書は機能公開の当日に更新され、可視性を減らす側の文書は8か月以上動いていない。私はこの更新差を、Googleが排除ツールの整備を凍結した証拠だと断言するつもりはない。単に文書更新のサイクルが遅れている可能性も残る。公開されているテキスト自体に曖昧さはなく、語彙カウントがその傾向を裏付ける。AI featuresページ全体、177,842バイトに対して文字列カウントをかけたところ、「opt out」は0件、「opt-out」も0件、「exclude」も0件だった。発表記事には「opt out」が1件あるが、検索除外とは無関係なニュースレター配信停止の一文に埋まっているだけだ。本文9,045バイトを数えると「preferred source」が7件、「publisher」が8件、「Top Stories」が1件、「AI Overviews」が1件、「AI Mode」が2件で、「Search Console」「turn off」「exclude」「remove」「block」はいずれも0件だった。本文の語彙はすべて包摂の方向を向いている。

## メカニズム — 第五の統制手段が現れなかった理由

AI featuresのドキュメントは資格判定のルールを直接記している。「AI OverviewsまたはAI Modeでサポートリンクとして表示される資格を得るには、ページがインデックス登録され、検索技術要件を満たす形でスニペット付きのGoogle検索結果に表示される資格を持つ必要がある」。AI専用の別立て審査は存在しない。AI OverviewsとAI Modeの引用は、通常の検索スニペットとまったく同じ合否ゲートに乗っている。インデックス登録されているか、スニペット表示の資格があるか、それだけだ。

この一文が、Google検索のアーキテクチャを示している。もしAI引用が独立したゲートを使っているなら、GoogleはAI専用の統制点を用意していたはずだ——Google-ExtendedがAI学習とグラウンディング専用の統制点として機能しているように。AIの回答をメモリからの生成ではなく、生きたウェブデータを与えて成立させるための仕組みがGoogle-Extendedだ。だが実際には、そうなっていない。AI Overviewsの資格ゲートは独立しておらず、通常の検索ゲートと共有されている。この判定を「共有」と表現するのは私の分析上の言い換えであって、Google自身の文言そのものではない。文書が使っているのは「検索の技術要件を満たす」という表現だ。AI専用の除外スイッチを作るには、まず資格判定を検索用とAI用の2系統に分ける必要がある。パイプラインが1本である以上、専用の統制点を設ける場所自体が存在しない。ドキュメントはこの構造を明言している。「AIはSearchに組み込まれ、Searchの機能そのものに不可欠であるため、Googlebot向けのrobots.txtディレクティブこそが、サイト運営者がクロールを管理する統制点になる」。一つのクロール制御、一つの資格判定、一組のスニペットディレクティブが、人間が検索結果の下に見るものと、言語モデルが引用してよいものの両方を同時に支配している。

包摂側のロジックもまったく同じだ。Preferred Sourceは、文書によれば基本の資格判定自体には手を加えていない。既存の判定の上にシグナルを1枚重ねているだけだ。「あなたのサイトをpreferred sourceとして選んだユーザーに対して、あなたのコンテンツは『preferred』バッジで強調表示されうる」。土台のゲートには触れず、条件を1つ積み上げる。これは偶然のタイミングではなく、一貫した設計思想の表れだ。

## みんなが代わりに手を伸ばす文書、そしてそれが答えていない問い

Google-Extendedは、AI除外のチケットが来たときにエンジニアが真っ先に引っ張り出すトークンだ。だが文書に明記された仕様から見て、誤った統制手段だ。Googleの[crawlers and fetchers](https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers)ガイドはこう述べる。「Google-Extendedはサイトの検索への収録には影響せず、検索でのランキングシグナルとしても使われない」。robots.txtでGoogle-Extendedをdisallowすれば、そのコンテンツがGeminiモデルの学習に使われることや、Vertex AIアプリケーションのグラウンディングに使われることは防げる。だがGoogle検索やAI Overviewsでの露出は一切変わらない。

crawlersページに対する語彙カウントがこの範囲を裏付けている。Google-Extendedが6回、Geminiが4回、Vertexが8回登場する一方、AI Overviewsは0回、AI Modeも0回だ。語彙はモデル学習とグラウンディングに集中しており、チームが制御を期待する検索表面には一度も触れていない。

この検証で確かめたかったのは、自社のデプロイが文書の記述どおりに振る舞っているか、Google-Extendedが検索側の挙動に漏れ出していないかだった。自社の本番robots.txtと、sitemap（サイト内の全URLをGoogleに知らせる一覧ファイル）から抽出した決定的な標本——無作為抽出ではなく、毎回同じ基準で同じURL群を選び直せるようにした標本、再現性のために必要な条件だ——を文書と照合した。6つの構成セル、それぞれ3回ずつの反復で計18回走らせた結果、すべての試行がexit 0とHTTP 200を返し、受信バイト数は事前の基準値と完全に一致し、ボットブロックのチャレンジも一度も発生しなかった。この18回はあくまで自社デプロイの健全性チェックであり、Google-Extendedの境界そのものを検証したものではない。反証を狙った試行は別立てで走らせた。「Google-Extendedがドキュメントの主張に反して実はAI Overviewsにまで及んでいるのではないか」という仮説だけを狙い撃ちにした1本だ。この仮説を支持する証拠は一つも出なかった。Googleは予告なくドキュメントとクローラーの挙動を変更しうるため、この結果は恒久的な証明にはならない。だが前提を崩そうとしたあらゆる試みを、その前提は生き延びた。Google-Extendedは学習側だけで厳密に動いている。

## 自社の実装がその失敗パターンをそのまま体現していた

この食い違いは仮想の話ではない。自社の本番robots.txtには、Google-Extendedのdisallowグループが2つあり、GPTBot（OpenAIの学習用クローラー）とCCBot（Common Crawlのスクレイピングボット）向けのディレクティブも並んでいる。クローラーの用途を指定するContent-Signalヘッダー行も入っており、`search=yes,ai-train=no,use=reference`という内容だ。どのディレクティブも学習またはサードパーティのスクレイピングを止めているだけで、Googleが検索側のAI露出を減らすために指定している4つの除外ディレクティブは1つも入っていない。

sitemapから決定的な標本として12個のURLを抜き出し、それぞれのレンダー後HTMLをrobotsまたはgooglebotのmetaタグの有無で検査した。12件のうち、4つのスニペットディレクティブを1つでも持っていたURLはゼロだった。12件は小さな標本であり、サンプルを増やせば結果が動く余地はある。それでも先月、robots.txtの確認だけで「コンテンツをAI Overviewsから除外してくれ」というチケットを閉じていたなら、要求された目的は何一つ達成できていなかったことになる。

チケット名にも差分にも「AI」の文字があるため、レビュアーは`Google-Extended`の`Disallow: /`を見ただけでプルリクエストを承認してしまう。差分の実効性ではなく、チケット名と設定ブロックの見た目の一致だけで判断した結果だ。

## 反論、そしてそれが成立する範囲

主要な反論はこうだ。「別の除外ディレクティブが欠けているのではなく、必要ないのだ。既存の4つで十分に精密である」。この反論は前提の取り違えで崩れる。精密さが決めるのはどのコンテンツを消すかであって、どの表面から消すかではない。ある段落を`data-nosnippet`で囲むと、その記述はAI Overviews、AI Mode、通常の検索スニペットを含むすべての検索表面から同時に消える。4つの除外ディレクティブをどう組み合わせても、「AI表面からだけ消して通常の検索スニペットは維持する」という結果は作れない。法務が求めるこの二重状態こそ、検索アーキテクチャが原理上提供できない唯一の結果だ。

この反論には、コンテンツの粒度に関する限り一理ある。`data-nosnippet`属性はページ単位ではなく要素単位で動く。有料の1段落や会員限定の要約だけを囲めば、その断片だけを除外しつつページの残りはスニペット資格を保てる。`max-snippet`も二者択一ではなく文字数で制限できる。ページ全体の`noindex`や`nosnippet`しかなければ「大雑把すぎる」という批判も当たっただろう。要素単位の粒度は確かにあり、コンテンツに対しては精密に機能する。できないのは表面ごとの切り分けだけだ。

要素単位の精密さには見落としがちな実装コストが伴う。テンプレートが要素ごとに分岐できる構造を前提としているからだ。共通テンプレートで量産されたサイトでは、条件分岐の仕組みを先に作らないかぎり`data-nosnippet`を選択適用できない。タグを1行入れる前にテンプレートの改修が必要になる。

## これは何にコストがかかり、何にはかからないか

包摂と除外のコスト構造は非対称だ。包摂は無料だ。文書は明確に述べている。「これらの機能に表示されるために、新しい機械可読ファイルやAIテキストファイル、マークアップを作成する必要はない」。通常どおりインデックス登録され、スニペット資格を持つページは、追加の設定なしにAI Overviewsの引用候補になる。Preferred Sourceも同じパターンをたどる。新しいデータスキーマは要らず、既存の資格判定の上にボタン1つと文書化されたシグナルを重ねるだけだ。

一方、除外には直接のコストがかかる。利用できる設定項目がスニペット制御しかないため、AIによる消費と検索スニペット表示を切り分けられない。除外のディレクティブを適用すると、AI引用と一緒に検索スニペットも手放すことになる。Googleの発表文は1つの指標を強調している。ユーザーが選んだ「60万を超えるユニークソース」という数字だ。だがこれはユーザー側の選択数であって、パブリッシャー側のトラフィックへの影響を示すものではない。公式なデータがない以上、この数字から事業の費用対効果は測れない。

除外の判断が実際に負う代償は、無効化するスニペットに紐づいたオーガニックトラフィックそのものだ。Googleはこの数字を公表していない。社内の分析基盤が補うしかなく、エンジニアリングチームはrobots.txtを変更したり`data-nosnippet`を適用したりする前に、そのトラフィック見積もりをチケットに求めるべきだ。

## チームが仕組みとして備えるべきこと

この食い違いが示しているのは、いくつかの運用ルールだ。どれもGoogleが第5の除外ディレクティブを出すのを待たずに仕組み化できる。最も重要なのは検証の穴を塞ぐことだ。robots.txtの目視確認だけで完了とみなすチェックはやめる。ディレクティブがファイルに正しく書かれていても、対象ページに反映されていないケースがあるからだ。sitemapから決定的なURLを抽出し、本番のレンダー後HTMLで`robots`と`googlebot`のmetaタグを検証する——自社デプロイで行った検査——は、CIゲート（デプロイ前の自動チェック）が強制できるリンターの最小形になる。宣言したポリシーとレンダー後のタグが食い違えば、デプロイを止めればいい。この修正のまわりに、残りの穴を塞ぐ3つの習慣を置く。第1に、「AIから除外」のチケットを、スニペット可視性を天秤にかける事業判断である「検索面のAI除外」と、クローラーのトークン1つを扱う技術判断である「学習除外」の2つの項目に分ける。第2に、4つの文書化された除外ディレクティブのいずれかを変更するプルリクエストには、対象ページ群のオーガニックトラフィック比率を説明欄に書くよう求め、レビュアーがコード差分だけでなく事業インパクトも見られるようにする。第3に、社内文書では「AIクローラーをブロックする」という曖昧な表現を禁止し、クローラーのトークンと対象表面を必ずセットで書かせる——学習ならGoogle-Extended、検索スニペットと引用なら`data-nosnippet`と明記する。

この断絶は、CDP（Customer Data Platform）やDSR（データ主体からの削除要求）を扱う際の構造とよく似ている。事業側のステークホルダーはスコープを広く定義し、システムは狭い技術的境界だけを実装し、チームは元の要求を満たさないままチケットを完了扱いにする。この食い違いを防ぐには、個人の注意力に頼るのではなく、完了の定義そのものを明文化する必要がある。

有料記事、購読制のデータベース、会員限定の編集コンテンツのようにコンテンツ自体が商品となる組織であれば、先に触れた要素単位の粒度がそのまま使える。収益化された段落だけを`data-nosnippet`で囲み、テンプレート改修のコストとオーガニックスニペットの損失を事前に織り込んでおけばよい。一方、B2Bプラットフォームやコーポレートサイトのようにオーガニック検索がリードやパイプラインを生む組織にとっては、除外側の設定はそもそも選択肢に入らない。Preferred Sourceは既存の資格判定に無料で乗るだけの仕組みだから、導入を進めて様子を見るほうが理にかなっている。もしGoogleがいつか文書化された表面別の除外統制を出荷すれば、この計算は変わる。それまでは、この4つの除外ディレクティブがツールキットのすべてであり、AI専用の統制点には構造上の足場がない。

認証済みのSearch Console管理画面に未発表のAI関連設定項目があるかどうかは確認していない。ここに記した知見はすべて公開文書、パブリッシャー向け発表、そして本番プローブから導いたものだ。Googleがログイン画面の裏に専用の統制を準備しているのか、それとも既存の4つの仕組みを維持し続けるのかは、開かれた問いのままだ。

## 参考資料

- [A more personalized Search, Discover and News](https://blog.google/products-and-platforms/products/search/personalize-search-discover-news/)
- [AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)
- [Preferred sources](https://developers.google.com/search/docs/appearance/preferred-sources)
- [Google crawlers and fetchers — Google-Extended](https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers)
- [Robots meta tag, data-nosnippet, and X-Robots-Tag specifications](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag)
