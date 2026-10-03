---
title: 'Google-Extendedは学習拒否と引用許可を1つのトークンに束ねており、OpenAIのbotは分けて設定できる'
description: '検索には出続けながらAI学習だけを拒否するrobots.txtの設定は、OpenAIでは公式文書がbotトークンの独立性を保証する。Google-Extendedは学習と引用を単一のトークンにまとめ、その分離を提供しない。'
pubDate: '2026-09-03'
heroImage: ../../../assets/blog/google-extended-single-lever-training-grounding-tied-robots-txt-2026/hero.png
tags:
- robots-txt
- google-extended
- ai-crawler
relatedPosts:
- slug: robots-snippet-controls-ai-overviews-2026
  score: 0.7
  reason:
    en: After learning how robots.txt tokens split search from AI training, read on
      to see measured results for the snippet directives that decide whether AI Overviews
      cite your page.
    ko: robots.txt로 크롤러별 차단 정책을 잡았다면, 이번 글은 AI Overview에 내 페이지가 인용될지 결정하는 스니펫 지시자
      실측 결과까지 이어서 확인할 수 있다.
    ja: robots.txtでのクローラー別制御を理解したら、次はAI Overviewに自分のページが引用されるかを決めるスニペット指示子の実測結果を確認するとよい。
    zh: 了解 robots.txt 如何按爬虫分别控制训练与搜索后，接着实测决定 AI Overview 是否引用你页面的代码片段指令。
- slug: ai-crawler-control-robots-txt-llms-txt-2026
  score: 0.7
  reason:
    en: This post digs deeper into per-token differences in robots.txt, filling in
      the fine-grained decisions needed to put the earlier 2026 AI crawler control
      strategy into practice.
    ko: 이 글은 robots.txt 토큰별 차이를 더 깊게 파고들며, 앞서 소개한 2026년 AI 크롤러 제어 전략을 실제 설정으로 옮길 때
      필요한 세부 판단을 채워 줍니다.
    ja: 本記事はrobots.txtのトークンごとの違いを掘り下げ、先の2026年AIクローラー制御戦略を実際の設定に落とし込む際の細かい判断を補ってくれます。
    zh: 本文深入剖析robots.txt各令牌的差异，补充将此前2026年AI爬虫控制策略落地时所需的细粒度判断。
- slug: search-console-ai-features-opt-out-vs-official-docs-gap-2026
  score: 0.7
  reason:
    en: If this post maps how AI crawler tokens differ per provider, the follow-up
      piece shows what actually happened when the official docs were searched for
      the opt-out switch and only an inclusion lever turned up.
    ko: AI 크롤러 제어 토큰이 providers마다 어떻게 다른지 이 글에서 다뤘다면, 그 스위치를 실제 공식 문서에서 찾아 헤맨 격차의
      실체는 기존 글에서 확인할 수 있다.
    ja: robots.txtのトークンがプロバイダごとにどう違うかを本稿で解説するなら、そのスイッチを公式ドキュメントで探して見つかった「包含レバー」の実態は、既存記事で確認できる。
    zh: 本文按供应商拆解 robots.txt 令牌的差异,而既有文章记录了在官方文档中寻找退出开关时只找到“包含”杠杆的落差真相。
---

## 自分のサイトに来るAIのロボットを1つのファイルで決めている現状

公開しているWebサイトに、AI会社のロボットが来る。そのロボットがあなたの記事を学習に使っていいかどうかは、robots.txtという1つのファイルで決まる。robots.txtとは、サイトの入り口に置かれたテキストファイルで、どのロボットにどのページを見てよいかを書いておく場所だ。

仕組みは学校の玄関にある訪問者名簿に近い。「Aさんは入ってよし」「Bさんは入らないで」と書いておけば、ロボットはその通りに動く。この書き方のルール自体はどの会社でも共通で、誰でも書ける。

ところが今日、「検索には出続けるが、学習だけは断る」という設定を書こうとすると、提供会社ごとに書ける項目が違うことが分かる。同じrobots.txtという方式なのに、同じ意図が会社によって実現できたりできなかったりする。

## このサイトのrobots.txtでは、Google-Extendedがルールではなくコメントにしか書かれていなかった

まず、このサイト(jangwook.net)が公開しているrobots.txtを実際に取得して読んだ。ファイルはHTTP 200という正常な応答で返り、行数は22行、最後はSitemap(サイトの地図を示す行、https://jangwook.net/sitemap.xml)で終わっていた。22行は短い。この短い数行のルールで、ファイルは全てのロボットの出入りを管理している。

その中でGoogle-Extendedという名前を探すと、奇妙な場所にだけ現れた。Google-Extendedとは、GoogleのAI学習に使われるロボットを指す名前だ。ルール行ではなく、コメント行だけに書かれていた。コメントとは、ロボットが読み飛ばす説明文のことで、ルールとしては扱われない。

そのコメントはこう説明していた。以前は学習を拒否するグループを設けていた。GPTBot、ClaudeBot、CCBot、Google-Extendedの4つだ。このグループを削除した。理由はこうだ。Google-Extendedは学習と引用を1つの名前にまとめた仕組みで、学習を断ると引用の通り道まで一緒に閉じる。

一方、User-agent: *のグループを確認すると、/ko/blog/en/のような言語横断のパスを、ロボットにページを見せないという指示(Disallow)だけが確認できた。User-agent: *とは「全てのロボット共通のルール」を意味する行だ。つまりGoogle-Extendedを個別に拒否するルールのグループは、確認した抜粋範囲には存在しなかった。このサイトのファイルには、Google-Extendedを学習だけ阻む規則がなく、残っているのは学習と引用が一緒に閉じるというコメントだけだ。

## 6種類のロボットでHTTP応答を試した結果、ブロックはどこでも起きていなかった

robots.txtは約束事にすぎない。書いたとおりにロボットが従うか、サーバーが物理的に扉を閉めるかは、別の話になる。そこでこのサイトのページを、名前を変えながら6回要求してみた。使った名前はGoogle-Extended、Googlebot、GPTBot、ClaudeBot、OAI-SearchBot、そしてふつうのブラウザが名乗るMozilla/5.0の6種類だ。

<div class="lm-card lm-card--cell" data-lm-figure="explain-cell-c3-ua6-http-status-uniformity" data-lang="ja"><span class="lm-card__badge lm-card__badge--ok">成功</span><span class="lm-card__title">六ロボット接続</span><span class="lm-card__text">六ロボットすべてで最初と最後の応答が200で同じだった。</span><div class="lm-card__numbers"><span class="lm-card__chip">応答コード 200</span></div></div>

結果はそろっていた。6種類の要求すべてで、最初の応答も最後の応答もHTTP 200だった。HTTP 200は「ページを渡せます」というサーバーの合図である。途中で別のアドレスに回される転送も一度も観測されなかった。つまり、このサイトはどのロボットに対しても、ページの取得を拒否していなかった。Google-Extendedも含めて、だ。

もう一つ確認しようとしたものがある。Cloudflareが用意したContent-Signalという仕組みだ。これはサイト側が「検索には使ってよし、AIの学習には使うな」という意思をヘッダという別の方法で宣言できる機能だ。search、ai-train、ai-inputという値を持つ。この値が取れれば、もう一つの面から確かめられたはずだった。Google-Extendedの学習と引用が一本に束ねられているかどうかを、ヘッダの側からも確かめられたはずだ。しかし3回の実行はすべて失敗し、出力は空だった。使える結果は0回で、3つの値を一つも観測できていない。

サーバーの応答では6種類のロボットのどれも通れて、ヘッダによる意思表示の値も読めなかった。すると「検索には出るが学習は拒む」の可否を決める場所は、残るrobots.txtの書き方だけに絞られる。

## OpenAIの公式文書はトークンの独立性を明記し、Anthropicの文書は今回の実行では読めなかった

robots.txtに書くロボットの名前の層で、提供会社ごとに何が約束されているのか。まずOpenAIの公式文書を開いた。OpenAIはbotの名前を複数に分けて公開している。OAI-SearchBotが9行、ChatGPT-Userが6行、OAI-AdsBotが5行、GPTBotが5行の説明として並んでいた。OAI-SearchBotは検索に現れるためのロボット、GPTBotは学習に使われるロボットだ。

<div class="lm-card lm-card--cell" data-lm-figure="explain-cell-c5-official-docs-token-independence" data-lang="ja"><span class="lm-card__badge lm-card__badge--ok">成功</span><span class="lm-card__title">OpenAI案内文書</span><span class="lm-card__text">検索ロボットと学習ロボットを別々に遮断できると文書に書かれていた。</span><div class="lm-card__numbers"><span class="lm-card__chip">観測実行 3</span><span class="lm-card__chip">ヒット 0</span></div></div>

そして文書には、この名前たちが互いに独立だと書かれていた。

> independent of the others – for example, a webmaster can allow OAI-SearchBot in order to appear in search results while disallowing GPTBot to indicate that crawled content should not be used for training OpenAI's generative AI foundation models
> （[OpenAI crawlers and fetchers](https://platform.openai.com/docs/crawlers)）

これは日本語で言うと、名前は互いに独立しているという意味だ。サイト運営者はOAI-SearchBotを許可して検索に現れながら、GPTBotを拒否して学習に使われないようにできる。検索は許し学習は断るという組み合わせが、公式文書として保証されている。

次にAnthropicの文書を同じように請求した。こちらは応答としてHTTP 200を3回全て返した。だが取得できた抜粋に文書の本文が含まれていなかった。そのためAnthropicが検索用と学習用の名前を分けているかどうかは、この実行では確認できなかった。検索の許可と学習の拒否の組み合わせを公式文書で保証している提供者は、今回の観測ではOpenAIだけだった。

## なぜ2社の設計が違うのか、公式の説明は見つからなかった

OpenAIとGoogle-Extendedで名前の設計が違う。なぜそうなっているのか、その理由を探した。OpenAI側の文書は独立性を説明するが、GoogleがGoogle-Extendedを1本の名前にまとめた理由を公式に述べた文書は、今回の実行では確認できなかった。理由の説明が見つからない以上、判断の根拠として残るのは「設計が違う」という観測された事実だけで、ここが限界だ。

## この主張は1サイトの1日の観測の上に立つという反論を先に受ける

この記事の主張に対する最も強い反対は、根拠が自分のサイト1つ、そして1日分の観測であるという点だ。この反論には正しい部分がある。実際、公開中のrobots.txtではGoogle-Extendedのグループは削除済みで、個別の拒否グループも観測されなかった。つまり「単一レバーである」という主張は、自分のファイルのコメントとOpenAI文書の独立文言で方向が支持されたに過ぎない。Google-Extendedを実際に拒否に置いて、AI検索での引用が消えるかを対比で見た結果ではない。

この反論を踏まえた上で、主張が成り立つ範囲を限定できる。robots.txtの名前の設計と公式文書の言葉という層に限れば、OpenAIは分離を文書で保証し、Google-Extendedはそれを提供しない。この記述は観測どおり成立する。主張が成り立つのはこの層までだ。

## 今日自分のrobots.txtで確認して記録しておくべき2つの行動

「OpenAIのロボットについては、検索用のロボットは通し、学習用のロボットは止めるという『検索は許可・学習は拒否』の組み合わせが公式に可能であること。一方、Googleは細かいスイッチが見つからず、全体で受け入れるか全体で止めるかのどちらかになっていること」。

記録しておくべき行動は2つだ。1つ目は、自分のrobots.txtに学習用ロボットの名前が書かれているかを今日チェックしておくこと。さらに、検索用と学習用が別々の項目として分かれているかも確認する。2つ目は、確認した結果(どのロボットを通して、どれを止めたか)をメモしておくこと。設定は後から変わることもあるため、日付つきで残しておけば「いつ・どうだったか」を振り返れる。

なお、ウェブサーバーが返す特殊なヘッダー(応答の目印)で細かい設定を示す仕組みについても調べたが、今回は何も観測できなかった。確定できなかった部分は確定できない、と正直に記録しておくのが安全だ。

## この記事が確認できなかったこと

- Cloudflare Content-Signalヘッダの実際のsearch、ai-train、ai-inputの値。3回の実行が全て失敗し、1つも観測できなかった
- AI Overviewのような実際の検索画面で引用がどう変わるか。この実験の範囲外だった
- Anthropicのロボット名ごとの設定が検索と学習を分離しているか。文書本文が取得物に含まれず確認できなかった
- gitの作業フォルダにrobots.txtがなく、ライブのファイルと元データの違いの原因は解明できなかった
- この判断が覆る条件。Googleが学習と引用を別々に設定できる名前や設定を公式に提供し始めた場合は、この主張は誤りになる。Google-Extendedを拒否に置いてもAI検索の引用が維持される対比観測が得られた場合も同じだ。

## 参考資料

1. [robots.txt](https://www.jangwook.net/robots.txt)（jangwook.net）
2. [OpenAI crawlers and fetchers](https://platform.openai.com/docs/crawlers)（OpenAI）
3. [Anthropic docs](https://docs.anthropic.com/)（Anthropic）