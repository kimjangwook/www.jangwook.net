---
'title': 'Preferred Source（推奨ソース機能）は入れる案内が厚く、外す案内が薄い'
'description': 'Googleは2026年8月20日に、サイトをAI検索に入れる案内として専用文書とボタンコードを用意した。外す方法は公式文書の一文だけで、その指示は自社の12ページのどこにも反映されていなかった。'
pubDate: '2026-08-29'
heroImage: ../../../assets/blog/preferred-source-inclusion-only-exclusion-lever-unlanded-2026/hero.png
tags:
- google-search
- preferred-source
- ai-overviews
relatedPosts:
- slug: ai-crawler-control-robots-txt-llms-txt-2026
  score: 0.7
  reason:
    en: Google lavishing guidance on an AI search feature while squeezing the opt-out
      into one sentence makes self-managed AI crawler control more urgent, which is
      exactly what this robots.txt and llms.txt strategy guide delivers next.
    ko: 구글이 기능 안내에는 공을 들이고 탈출로는 한 문장으로 처리했다는 소식은 AI 크롤러를 스스로 통제하려는 전략이 더 절실해졌음을 보여주므로
      robots.txt와 llms.txt 기반 대응법이 담긴 이 글과 바로 이어져 읽을 만하다.
    ja: Googleが案内には力を注ぎ脱出方法を一文に圧縮したという事実は、AIクローラーを自分で制御する戦略の重要性を示しており、robots.txtとllms.txtによる2026年の対策法を扱うこの続きの記事として読む価値がある。
    zh: 谷歌将精力放在功能引导上却把退出机制压缩成一句话，恰恰说明自主控制AI爬虫的策略愈发紧迫，而这正是接下来这篇robots.txt与llms.txt实战指南所能提供的。
---

## 同じ日付で更新された三つの文書の表面

Googleの検索に新しく「Preferred Source」という機能が加わった。これは、読者が自分の好きなニュースサイトを選ぶと、GoogleのAIによる回答の中でそのサイトの名前に「preferred（推奨）」の目印が付く仕組みである。つまり、あなたのサイトが選ばれれば、AIの答えの中で目立つ位置に表示される。

今回、三つの文書を比べた。一つ目は開発者向けの公式文書。二つ目はGoogleの発表文。三つ目は自分たちのサイトそのもの。比べると、入れる側と外す側で案内の厚さが違う。

買い物にたとえるなら、商店街の一軒に大きな看板を付けてくれる一方で、店を閉める方法は入り口に一枚の小さなメモしかない。看板側には手数料も手順書も用意される。閉める側のメモは、読まなければ存在に気づかない。

気になるのは、この厚さの差が実際の運営にどれだけ響くかである。この差がどれだけ大きいかは、数で確かめられる。

## Preferred Sourceを知らせる専用文書とボタンコード

入れる側の準備は整っている。Preferred Sourceには専用の文書が用意され、左側のメニューの全154項目の中に独立したページが置かれている。その文書は2026年8月20日UTCに更新された表記を持つ。発表と同じ日付である。

発表文も運営者をその文書へ導く。発表文にはこうある。

> If you're a publisher, you can find the new "Preferred Source" button code in our Google Search Central documentation to get started.
> — [Personalize search and discover news with preferred sources / Google blog 発表文](https://blog.google/products-and-platforms/products/search/personalize-search-discover-news/)

つまり、発行側はボタンのコードを公式文書で配っている。あなたのサイトにボタンを置けば、読者はそこからあなたのサイトを選ぶことができる。発表文の中で「preferred source」という言葉は7回出てきた。入れる方向の言葉が発表の中心にある。

入れてもらうための条件も軽い。公式文書には「There are no additional technical requirements.」とある。追加の技術条件はない、という意味である。看板を付けやすくするための手立ては、ここまで揃えられている。

## AI検索から外す方法を載せた一文

では、外す方法はどうなっているか。検索の上部にAIが作るまとめの機能（AI OverviewsやAI Mode）は、Googleの見解では検索の一部である。だから外す方法も、検索の表示を絞る既存の仕組みに一元化される。

外す方法を述べた文は、公式文書の中で一文しかない。その文は、説明文を隠す印やページを検索結果から外す印など、四つの印の名前を一つの文に並べたものだ。

> To limit the information shown from your pages in Search, use nosnippet, data-nosnippet, max-snippet, or noindex controls.
> — [AI features / Google Search Central](https://developers.google.com/search/docs/appearance/ai-features)

この一文だけで、外す方法の説明はすべて済ませられている。「opt out（脱退する）」という言葉や「exclude（除外する）」という言葉は、この文書の本文に一度も出てこなかった。専用ページもボタンも外す側にはない。

同じ文書には、別の案内も一つある。

> To limit AI training and grounding in some of Google's other systems, read more about Google-Extended.
> — [AI features / Google Search Central](https://developers.google.com/search/docs/appearance/ai-features)

Google-Extendedは、自分のサイトの情報を検索以外のGoogleの仕組みに使わせないための標識である。だがここには見落としやすい点がある。公式文書はこう明記している。

> Google-Extended does not impact a site's inclusion in Google Search nor is it used as a ranking signal in Google Search.
> — [Google-Extended / Google Search Central](https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers)

「Google-Extendedを止めても、Google検索への掲載には影響しない」という意味である。つまり、AI検索への掲載を絞るつもりでGoogle-Extendedの標識を立てても、検索の答えへの掲載そのものは絞れない。外し方を書く文が一本しかないうえ、その道が誤解されやすい。

反論を先に考える人はいるだろう。外す方法が一文で足りる、という見方は成立する。四つの文法は何年も検証済みの標準であり、Googleから見れば一貫した設計である。この反論の範囲内では正しい。ただし、同じ日に迎える側に専用ページとボタンのコードが届いており、外す側は文の数で比べれば圧倒的に薄い。文書の論理が整っていても、厚さの差は数字として実在する。

<div class="lm-card lm-card--cell" data-lm-figure="explain-cell-docs-exclusion-lever-inventory" data-lang="ja"><span class="lm-card__badge lm-card__badge--ok">成功</span><span class="lm-card__title">公式文書の除外文法調査</span><span class="lm-card__text">公式文書の本文で、文書が指摘した三つの文法がそれぞれ一度ずつ検出された。ページ全体非表示標識とGoogle-Extended標識も一度ずつあった。推奨ソースの語は本文で検出されなかった。</span><div class="lm-card__numbers"><span class="lm-card__chip">内容除外 1</span><span class="lm-card__chip">一部除外 1</span><span class="lm-card__chip">要約制限 1</span><span class="lm-card__chip">推奨ソース 0</span></div></div>

## 三つの文書表面と自社12 URLを数えた測定の手順

この差は、開いた感覚ではなく数で確かめるべきものだ。測定は2026年8月21日に行った。手順は次のとおりである。

<div class="lm-card lm-card--how" data-lm-figure="explain-how" data-lang="ja"><span class="lm-card__title">測定手順</span><ol class="lm-card__steps"><li class="lm-card__text">ステップ 1. 六つの枠を三回ずつ読み、十八件の観測を作った。</li><li class="lm-card__text">ステップ 2. 公式文書と発表文で入れる・外す言葉を数えた。</li><li class="lm-card__text">ステップ 3. 無関係な文書を対照として入れ、メニュー混入を除いた。</li><li class="lm-card__text">ステップ 4. 実際に稼働中の自社HTMLで文法の着地数を確認した。</li><li class="lm-card__text">ステップ 5. 十八件の観測すべてで正常ページを受け取ったか確認した。</li></ol></div>

まず公式文書と発表文の表面で言葉を数えた。次に、無関係な文書を対照に入れて、メニューの混入を差し引いた。最後に、自分たちのサイトのページで、その一文が指す文法が本当に置かれているかを確かめた。すべての観測で正常なページを受け取れていることを確認したうえで数えた。

## 自社ページ12 URLでの指示子の着地結果

その確認の結果、一文が示した指定方法は自社のページには一つも置かれていなかったことがわかった。

正式には、サイトマップから決定的な標本として12 URLを取り上げ、各ページのHTMLを開いて確認した。結果は0/12である。12ページすべてに、説明を絞るための印がどこにも着地していなかった。外す方法は文書に一文で書かれ（1）、自分のページのどこにも反映されていなかった（0/12）。この二つの数字を並べると、外す道の現状が見えてくる。

<div class="lm-card lm-card--cell" data-lm-figure="explain-cell-own-deployment-lever-landing" data-lang="ja"><span class="lm-card__badge lm-card__badge--ok">成功</span><span class="lm-card__title">自社ページの着地確認</span><span class="lm-card__text">文書が指摘した三つの文法は、実際に稼働中の自社HTMLでは着地したURLが一つもなかった。つまり文書の除外文法はページに反映されていなかった。</span><div class="lm-card__numbers"><div class="lm-card__bar"><div class="lm-card__bar-fill" style="--lm-bar-w:100.0%"></div><span class="lm-card__text">有効実行 3/3</span></div><span class="lm-card__chip">着地アドレス 0</span></div></div>

一方、自分たちのサイトで有効にしていたのは、Google-Extendedの標識（二行）と、別の信号表示の一行だった。つまり「AI系の利用は制限している」と思える設定は置いてある。だが公式文書の言葉を借りれば、その標識は検索への掲載には影響しない。AI検索に載せるかどうかの判断をしていたつもりでも、実際にはその判断を反映させる設定がページのどこにも置かれていなかった。

ここで自分に残るのは、方法の有無ではなく判断の着地点の問題である。入れる側の判断は、専用ページとボタンコードが届くので、会議の席で実装の議論が始まる。外す側の判断は、一文にたどり着く自分がいない限り、チェックリストに上がらない。

## 二種類のサイト運営者のための確認項目

結論に反対意見を付すなら、こうなる。一文で足りないという苦言は、設計の一貫性を崩すほどの重みはない。四つの文法は長年使われた標準であり、Googleの規格の中では筋が通っている。したがって問われるべきは文書の厚さではなく、自分のページに何が置かれているかである。

AI検索への載りを減らしたい運営者は、次の一行を実行すればよい。自分のページにその一文が指す印が実際に置かれているかを直接数える。そのうえで、「AIを止めた」と信じていた方法が検索への掲載とは無関係だと、公式文書の一文で確かめておく。

AI検証への載りを増やしたい運営者は、次の一行で足りる。自分のページに何の制限の印も置いておらず、資格が保たれていることだけを確認する。専用ページのボタンコードはその先に用意されている。

## この記事が確認できなかったこと

今回は文書の表面と自社12 URLしか確認していない。Googleがサイト運営者に貸す管理画面（Search Console）に、選択や解除の操作がどう並んでいるかは測定できていない。また、一文の文法がAI Overviewsの引用に実際どれだけ効くかは再現実験していない。他のサイトの採用状況も調べていないので、0/12は自社の状態を示す値であって一般の傾向ではない。

次に確認すべきことは、自社の標本を12より広げ、他社の文書の更新を後日もう一度数えることである。この記事の判断が覆る条件は一つである。Googleの公式文書が、Google-Extendedの設定で検索のAIの答えへの掲載も一緒に制限できると明記したときである。

<div class="lm-card lm-card--takeaway" data-lm-figure="explain-takeaway" data-lang="ja"><span class="lm-card__title">結論</span><p class="lm-card__takeaway">公式文書は除外文法に言及していたが、実際に稼働中の自社ページにはその文法が一つのURLにもなかった。</p></div>

## 参考資料

1. AI features / Google Search Central https://developers.google.com/search/docs/appearance/ai-features
2. AI features / Google Search Central (Google-Extended 分離文) https://developers.google.com/search/docs/appearance/ai-features
3. Google-Extended / Google Search Central (google-common-crawlers) — https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers
4. Preferred sources / Google Search Central — https://developers.google.com/search/docs/appearance/preferred-sources
5. Personalize search and discover news with preferred sources / Google blog 発表文 (Aug 20, 2026) — https://blog.google/products-and-platforms/products/search/personalize-search-discover-news/
6. AI features / Google Search Central (スニペット資格の文) — https://developers.google.com/search/docs/appearance/ai-features