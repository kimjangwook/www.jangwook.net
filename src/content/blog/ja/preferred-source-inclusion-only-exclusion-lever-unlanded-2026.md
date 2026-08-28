---
title: Preferred Source の専用文書と、Google AI 検索から外すためのスニペット指定の一文
description: Google は自サイトを AI 検索に取り込む仕組みに専用文書と登録手順を用意した。一方、外すための公式手段は開発者文書のたった一文に押し込まれている。
pubDate: '2026-08-28'
heroImage: ../../../assets/blog/preferred-source-inclusion-only-exclusion-lever-unlanded-2026/hero.png
tags:
- google-search
- preferred-source
- ai-overviews
- nosnippet
relatedPosts:
- slug: ai-crawler-control-robots-txt-llms-txt-2026
  score: 0.7
  reason:
    en: If Google shipped a dedicated publisher on-ramp on day one, this guide covers
      the hands-on strategy of using robots.txt and llms.txt to block AI training
      crawls while still permitting citation.
    ko: 구글이 발표 당일부터 언론사를 위한 전용 온보딩을 만들었다면, 이 글은 robots.txt와 llms.txt로 AI 크롤러의 학습은
      막고 인용은 허용하는 실전 제어 전략을 다룹니다.
    ja: Googleが発表当日からパブリッシャー向けの専用オンボーディングを用意したなら、この記事ではrobots.txtとllms.txtでAIクローラーの学習をブロックしつつ引用を許可する実践的な制御戦略を解説します。
    zh: 谷歌在发布当天就为出版方搭建了专用入口，而本文将讲解如何用 robots.txt 和 llms.txt 阻止 AI 爬虫训练、同时允许引用的实战策略。
---

ウェブサイトを持っている人にとって、Google の AI 検索に自分の記事が使われるかどうかは、もう「技術の話」ではなく商売の話になっている。Google は取り込む側の案内は手厚く作り、外す側の説明はほとんど用意していない。入り口の名前は Preferred Source という。

Google の AI 検索には、記事の上に AI が作った答えが表示される機能がある。読者が「このサイトを好みの情報源にする」と登録すると、AI の答えの中であなたのサイトが目立つように示される。「好みの情報源」の目印が付くのだ。これが Preferred Source だ。公式の説明文にはこうある。

> In AI Mode and AI Overviews, your content can be highlighted with a "preferred" badge for users who have selected your site as a preferred source.
> — [Preferred sources / Google Search Central](https://developers.google.com/search/docs/appearance/preferred-sources)

つまり、好みの情報源に登録されたサイトの記事には、目印が付いて強調されるということだ。これは Google が 2026 年 8 月 20 日に発表した新しい仕組みである。

## 発表文が映し出す取り込み側の規模

この発表の当日、Google は取り込む側の準備を当日のうちに整えた。発表文は、サイト運営者に登録のやり方を教えるための文書へ直接案内している。発表文の言葉をそのまま引く。

> If you're a publisher, you can find the new "Preferred Source" button code in our Google Search Central documentation to get started.
> — [Personalize search and discover news with preferred sources / Google blog](https://blog.google/products-and-platforms/products/search/personalize-search-discover-news/)

訳すとこうなる。サイトを運営する人は、Google Search Central の文書にある新しい「Preferred Source」ボタンのコードを見つければ、すぐ始められる。ボタンとは、読者のサイト上に置く「このサイトを好みの情報源にする」という登録ボタンのことだ。

実際にどれほど力が入っていたかを確かめるため、発表文の文字を数えた。単語の並びを数えるだけでよい。数え方は簡単で、発表文の中に「preferred source」という言葉が何回出てくるかを数える。出てきた回数は 7 回だった。単数形が 4 回。一方で「外したい」「除外したい」という方向の言葉は、実質的にゼロだった。唯一見つかった「opt out（脱退する）」という言葉は、ニュースレターの申込欄の説明で、検索とは無関係だった。

![8月20日の発表文のテキストを数えた結果、preferred source という表現が7回出てきた。](../../../assets/blog/preferred-source-inclusion-only-exclusion-lever-unlanded-2026/log-announcement-inclusion-vs-exclusion-wording.png)

## 取り込み側専用文書の存在

取り込む側には、発表と同じ日に専用の文書が公開された。Google の検索まわりの公式文書は、Google Search Central という開発者向けサイトにまとまっている。そこには左側に目次があり、文書へのリンクが並んでいる。そのリンクの数を数えると 154 本あった。その中に「preferred-sources」という専用の文書が一本、きちんと存在する。文書には「最終更新 2026 年 8 月 20 日」と記されており、発表された日そのものである。

![Search Central の目次にある154本の道の中に、preferred-sources 専用文書が1本あることを確認した記録だ。](../../../assets/blog/preferred-source-inclusion-only-exclusion-lever-unlanded-2026/log-docs-inclusion-lever-absence.png)

買い物にたとえると分かりやすい。新しいお店がオープンして、店員が町中に招待状を配って歩く。会員になると特典が付くと書かれた紙が、手に取れる場所に置かれている。これが Preferred Source の扱いである。では、会員をやめたいとき、返品したいときはどうか。店の隅の掲示一枚に、小さく手続きが書いてあるだけ。

## 外す側のたった一文

外したい場合の公式の説明は、同じ Google Search Central の中にある「AI features」という文書に集約されている。そこに書かれているのは、たった一文だ。

> To limit the information shown from your pages in Search, use nosnippet, data-nosnippet, max-snippet, or noindex controls.
> — [AI features / Google Search Central](https://developers.google.com/search/docs/appearance/ai-features)

この一文には、名前が四つ並んでいる。nosnippet、data-nosnippet、max-snippet、noindex。どれも「ページの要約や内容をどこまで見せてよいか」を Google に伝えるための合図である。たとえば nosnippet は「このページは要約して見せないで」という合図だ。noindex はもっと強く「このページは検索結果にすら出さないで」という合図になる。つまり、AI 検索から自分のサイトを外す方法は、既存のこの四つの合図にすべて任されている。

同じ文書で「外す」「除外する」を意味する言葉を探して数えてみた。opt out が 0 回、exclude が 0 回だった。AI 検索から抜けるための専用の説明は、この文書の表面には存在しない。

![ai-features の開発者文書の表面を数えると、外すための合図は4つだけだった。](../../../assets/blog/preferred-source-inclusion-only-exclusion-lever-unlanded-2026/log-docs-exclusion-lever-inventory.png)

## 自社配信12URLでの指定の着地

文書に書いてあるだけでは、現場でそのまま使えるかどうかは分からない。そこで自分たちのサイトで確かめた。手順はこうだ。まず自分のサイトに置いてある「サイトマップ」（サイトの中の全ページの住所録のようなもの）を開く。そこから決めた基準に従って 12 個のページを選び、一つずつ開いて、Google への「見せないで」という合図が本当に埋め込まれているかを数えた。

結果は 0 だった。12 ページのうち、合図が実際に置かれていたページは一つもない。言い方を変えると、0/12 である。つまり「外したい」と思ったときに頼るべき合図は、自分のページのどこにも埋まっていなかった。合図そのものは昔から存在するのに、自社のページには誰も埋め込んでいなかった。

![自社のサイトマップから選んだ12個のURLを調べたところ、合図が置かれていたのは0個だった。](../../../assets/blog/preferred-source-inclusion-only-exclusion-lever-unlanded-2026/log-own-deployment-lever-landing.png)

「一文しかないのは問題ではない。nosnippet や noindex は何年も使われてきた信頼できる合図で、Google は AI 検索を検索の一部として位置づけているのだから、既存の合図で一元化するのは一貫した設計だ。使わないのは運営者の選択だ」という意見は、理屈としては正しい。実際、この文書には「追加の技術条件はない」とも書いてある。

> There are no additional technical requirements.
> — [AI features / Google Search Central](https://developers.google.com/search/docs/appearance/ai-features)

しかし理屈が正しくても、数字は別のことを教えてくれる。発表と同じ日に、取り込む側は専用ページとボタンのコードを手に入れた。外す側は、四つの単語が並んだ一文だけだ。しかもその一文が指し示す合図は、実測した 12 ページのどこにも埋まっていなかった。理屈の整合と、現場の厚みは、別の物である。

## robots.txtのAIトークンと検索取り込みの公式な分離

もう一つ、知らないと損をする仕組みがある。robots.txt という、自分のサイトを訪れてよい機械を指定するための約束事のファイルがある。ここに Google-Extended という名前を書いて「見せないで」と指定する方法が知られている。だがこの指定は、検索に影響しないと公式文書が明言している。

> To limit AI training and grounding in some of Google's other systems, read more about Google-Extended.
> — [AI features / Google Search Central](https://developers.google.com/search/docs/appearance/ai-features)

この一文の意味は、Google-Extended は「Google のその他のシステム」の話であり、AI 検索の話ではないということだ。さらに Google-Extended の説明文書には、こう明記されている。

> Google-Extended does not impact a site's inclusion in Google Search nor is it used as a ranking signal in Google Search.
> — [Google-Extended / Google Search Central](https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers)

訳すと、Google-Extended は Google 検索への掲載に影響せず、順位の材料にも使われない、という意味だ。つまり「robots.txt で AI をブロックしたから、うちの記事は AI 検索から外れた」という思い込みは、公式の説明の上では成立しない。実際に自分たちのサイトを調べると、この Google-Extended の指定が二行、書かれていた。検索側の AI 機能を外すつもりで書いたのかどうかは分からないが、公式の説明の上では、その二行は検索には何も変えない。

## チームの点検リストに入れる二項目

サイト運営の点検リストに入れるべき項目は二つある。一つ目は、外したい場合の備えである。自分のページの中で「AI には要約を見せたくない」ページを決め、そこに nosnippet などの合図が本当に埋め込まれているかを確認する。二つ目は、安心のための備えである。「AI をブロックした」という名目の robots.txt の指定は、Google の公式基準では検索への掲載に影響しない。そのことを、チームの文書に引用付きで書き留めておく。安心の勘違いは、この引用文一つで防げる。

ここで読者を二つに分けて、それぞれ「ならこうする」を示す。まず、AI 検索から自分の記事を外したい人。自分のサイトのページをいくつか開き、「このページは要約して見せないで」という合図が実際に付いているか、自分の目で数えること。この調査では 12 ページ中 0 ページだった。次に、逆に AI 検索に自分の記事をもっと使われたい人。ブロックの合図が付いていないことだけ確かめたうえで、Google が新たに開いた Preferred Source の登録手順に従ってボタンを設置すること。

Google はどちらの方向を「基本」にしているのか。文書の厚みを数えれば分かる。取り込む側には発表当日に専用文書とボタンが用意され、外す側には既存の仕組みに吸収された一文だけが残った。文書の量の差は、Google の力の入れ方の差をそのまま示している。

## この記事が確認できなかったこと

今回測ったのは文書の表面と、自社サイト 12 ページという小さな標本である。Search Console（Google が運営者に見せる管理画面）に実際に外すための操作があるかどうかは、ログインが必要なため確認できていない。また、nosnippet の合図が AI 検索の引用に実際どう効くかの効果も測っていない。次に確認すべきは、管理画面の実際の操作と、他サイトでの合図の設置状況だ。

なお、この判断が覆る条件は一つある。Google の公式説明が変わり、AI 検索から外すための規則が専用の文書と登録手順を持つ日だ。あるいは「ブロックの合図は AI 検索とは無関係」という説明が覆る日も同じだ。その日が来れば、この記事の主張は間違いとみなす。

## 参考資料

1. [AI features / Google Search Central](https://developers.google.com/search/docs/appearance/ai-features) — Google
2. [Google-Extended / Google Search Central (google-common-crawlers)](https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers) — Google
3. [Preferred sources / Google Search Central](https://developers.google.com/search/docs/appearance/preferred-sources) — Google
4. [Personalize search and discover news with preferred sources / Google blog 발표문 (Aug 20, 2026)](https://blog.google/products-and-platforms/products/search/personalize-search-discover-news/) — Google