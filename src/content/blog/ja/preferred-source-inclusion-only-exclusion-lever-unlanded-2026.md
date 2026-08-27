---
title: 当日できた「載せて」のボタンと、埋もれた「やめて」の一文
description: GoogleがAI検索に自サイトを載せる窓口は発表当日に整えられた一方、外す公式の方法は古い規則の一文だけにとどまっている。その一文が実際のサイトに届いていない現場の様子を、新聞の購読開始と配達停止の対比で読み解く。
pubDate: '2026-08-28'
heroImage: ../../../assets/blog/preferred-source-inclusion-only-exclusion-lever-unlanded-2026/hero.png
tags:
- google-search
- ai-search
- preferred-sources
relatedPosts:
- slug: ai-crawler-control-robots-txt-llms-txt-2026
  score: 0.7
  reason:
    en: Google's same-day sign-up kit for AI search shows exactly how the 2026 strategy
      of blocking training while permitting citation via robots.txt plays out on a
      real site.
    ko: 구글이 당일 출시한 AI 검색 가입 키트는 robots.txt로 학습과 인용을 갈라 놓는 2026 전략이 실제 사이트에 어떻게 적용되는지
      보여주는 실행 사례다.
    ja: Googleが当日公開したAI検索サインアップキットは、robots.txtで学習と引用を分ける2026戦略が実際のサイトでどう機能するかを示す実例である。
    zh: 谷歌当天上线的AI搜索注册套件，正是robots.txt“阻训练、允引用”2026策略在真实站点上落地的实例。
---

## 同じ欲求の二つの方向と二つの窓口

新聞の購読を思い浮かべてほしい。取りたいときは、専用の申込ページを開けば当日から済む。やめたいときは、同じ窓口で同じ手軽さで手続きできる、というのが普通の感覚だ。

自分のサイトをGoogleのAI検索に載せたい、という話にも同じ感覚で臨む人が多い。しかし2026年8月21日時点の公式文書を見ると、この窓口は一方通行になっている。載せる方向には当日からボタンと説明ページがある。外す方向には、古い規則の中の一文しか用意されていない。

この非対称は、サイトを運営する人にとって今日の判断に効いてくる。なぜなら、「AI検索への掲載は、自分がどこかで設定しておいたから大丈夫」と考えている人がいる。その設定が実際に届いていない可能性は、そういう人ほど高いからである。申込ボタンと解約窓口が同じ力を持つとは限らない。

## 「載せて」側の当日完備

Googleは2026年8月20日に「Preferred Source」という機能を発表した。これは、自分のサイトをAI検索の答えに使いやすい情報源として、読者自身に選んでもらえる機能である。読者があるサイトを「好みの情報源」として選ぶと、AI検索の答えの中で、そのサイトのコンテンツに「preferred」という目印付きで強調が出る。

取り組む側の手当てが充実している。開発者向けの専用文書が存在し、その文書には「Last updated 2026-08-20 UTC」と記されている。発表と同じ日に更新されているのである。さらに発表文には、サイト運営者がボタンを設置するための説明への導線まで書かれている。

> If you're a publisher, you can find the new "Preferred Source" button code in our Google Search Central documentation to get started.
> [Personalize Search and Discover with preferred sources](https://blog.google/products-and-platforms/products/search/personalize-search-discover-news/)
> — [Personalize Search and Discover with preferred sources](https://blog.google/products-and-platforms/products/search/personalize-search-discover-news/)

> In AI Mode and AI Overviews, your content can be highlighted with a "preferred" badge for users who have selected your site as a preferred source.
> [Preferred sources (appearance docs)](https://developers.google.com/search/docs/appearance/preferred-sources)
> — [Preferred sources — appearance docs](https://developers.google.com/search/docs/appearance/preferred-sources)

新聞でいえば、取りたい人には当日から玄関先に申込書と専用デスクが用意された状態だ。しかも規模の数字まで揃っている。発表文が出す唯一の規模の数値は、この好みの情報源を選んだ情報源の数で、それは600,000を超えている。

## 「やめて」側に残った一文

では逆方向はどうか。AI検索の答えに自サイトを使われたくない場合、公式文書の表面に書かれている方法は、古い規則の中の一文だけである。開発者文書のAI機能のページには、表示を制限する方法としてこう書かれている。

> To limit the information shown from your pages in Search, use nosnippet, data-nosnippet, max-snippet, or noindex controls.
> [AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)
> — [AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)

ここで四つの道具の名前が出てくる。それぞれを一言で言い換えるとこうなる。nosnippet は検索結果に載る本文の抜き出しを抑える印、data-nosnippet はページの一部だけ抜き出しを抑える印、max-snippet は抜き出せる長さの上限を決める印、noindex はページそのものを検索から外す印である。

調べた限り、公式文書の表面にはこれ以外に、検索のAI機能から外す方法を示す記述が見つからなかった。発表文の外す方向の語は実質ゼロで、あった一箇所はメール購読の「やめたいときはいつでもやめられます」という文面だった。

新聞の話に戻す。取りたい人には当日から専用デスクができたのに、やめたい人の窓口は、何年も前の規則集の中の一節のまま、という状態である。それでも足りるという反論はある。noindex を入れてしまえば検索から完全に外れるのだから、一文で十分ではないか、と。

この反論は道具の存在については正しい。しかし道具があることと、その道具が実際に使われていることは別である。そして、この唯一の窓口が現場に届いているかどうかを実際に見てみると、様子が変わってくる。

## その一文が実際のページに届いた場所

実際に手を動かして確かめたことがある。自分のサイト（jangwook.net）の日本語のサイトマップ（ページ一覧のファイル）から12のページを取り上げた。各ページを3回、公開ページをそのまま取得して、上の四つの印のどれかが書き込まれているかを数えた。

結果はこうだ。12のページの所在（URL）を調べ、印がどこか一つでも書かれていたページは0件だった。3回の測定はすべて同じ数値で、取得はすべて成功していた。つまり、いちばん基本的な掲載の依頼文（sitemap）が配達されているのに、配達を止めたいという印は、玄関先の一軒にも貼られていなかった。

これは意外な結果である。この調査の前には「開発者文書が新しい発表に追いついていないはずだ」という見立てがあった。しかし実際には、載せる側の専用文書は発表当日に存在していた。追いついていなかったのは、外す側の実物のほうである。

つまりこういうことだ。外すための道具は確かに存在する。だがその道具が実際のページに届いていないなら、「道具があるから制御されている」という前提は、現場では成り立たない。新聞の例でいえば、規則集の一文を暗唱できる人と、玄関先にその一文を貼った家があることは、まったく別の話である。

## 「もう止めてある」と信じられている設定の居場所

新聞配達のたとえでは、止めるためにさまざまなメモを玄関に貼ることがある。しかしメモが貼ってあっても、配達員がそれを読む義務がなければ、止まらない。

Google-Extended はその典型である。これはGeminiなどの生成AIがサイトを学習や参照に使うことに関係する設定だが、公式文書ははっきりこう書いている。

> Google-Extended does not impact a site's inclusion in Google Search nor is it used as a ranking signal in Google Search.
> [Google common crawlers (Google-Extended)](https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers)
> — [Google common crawlers — Google-Extended](https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers)

訳すとこうなる。Google-Extended は、サイトがGoogle検索に載ることには影響せず、検索の順位の材料にも使われない。つまり、このメモを貼っても新聞は止まらない、と公式が明言しているわけである。

AI検索そのものを止めるための公式の道具は、前述のとおり四つの印のどれかをページに書き込む一文に集約されている。発信の量にも差がある。載せる方向には専用文書とボタンの設置方法と600,000という規模の数値が揃っている。外す方向には、五年前からある道具を束ねた一文が残っているだけだ。

プラットフォームが望む方向には発表当日に説明書とボタンが付き、望まない方向は古い規則の一行で済まされる。「自分が設定しておいた」という思い込みと、その規則が実際にページに届いていることは、別のことである。説明文の量の配り方を見ると、そのプラットフォームの本心が読める。

## なら、こうする

AI検索にサイトを外したいと考える人には、こうしたい。信じていた止める設定をまず見直すこと。そのために、四つの印のどれかが自分のページに直接書き込まれているかを、一つずつ確認するところから始めるのが近道だ。

逆に、AI検索に引用されたいと考える人には、こうしたい。止めるためのメモをさらに作るのではなく、発表された好みの情報源の申込ボタンとその説明文書のほうに向かうこと。そちらの窓口は当日から開いていて、設置方法まで用意されている。

## この記事が確認できなかったこと

今回確かめられたのは、公式文書の表面の文と、自分のサイト一つの配布物12URLだった。Googleのサイト管理者用画面（Search Console）に切り替えスイッチがあるかどうかは、ログインが必要なため、この調査では判定できていない。また、他のサイトの配布物がどうなっているかも調べていないので、0件という結果を他のサイトに当てはめることはできない。次に確認すべきは、ログイン状態でのSearch Consoleの画面、そして四つの印のどれが実際にAI検索の引用にどう響くかという実測である。この判断が覆る条件は二つある。公式文書がこの一文以外の新しい外すスイッチを示したとき。または、調べたサイトで外す規則が実際に広く見つかったときである。

## 参考資料

1. [AI features and your website](https://developers.google.com/search/docs/appearance/ai-features) — Google Search Central
2. [Preferred sources — appearance docs](https://developers.google.com/search/docs/appearance/preferred-sources) — Google Search Central
3. [Personalize Search and Discover with preferred sources](https://blog.google/products-and-platforms/products/search/personalize-search-discover-news/) — Google (The Keyword)
4. [Google common crawlers — Google-Extended](https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers) — Google Search Central