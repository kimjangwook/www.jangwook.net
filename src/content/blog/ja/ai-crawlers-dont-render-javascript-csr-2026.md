---
title: AIクローラーはあなたのJavaScriptを実行しない
description: GPTBotもClaudeBotもJSをレンダリングしない。CSRページがAI検索に見えない理由をcurlで再現し、サーバーサイドで直す手順をまとめた。
pubDate: '2026-07-09'
heroImage: ../../../assets/blog/ai-crawlers-csr-invisible-2026-hero.png
tags:
  - geo
  - seo
  - ssr
  - ai-crawler
  - web-development
relatedPosts:
  - slug: localbusiness-structured-data-server-side-vs-js-2026
    score: 0.9
    reason:
      ko: "이 글에서 'JS로 주입한 JSON-LD는 AI 크롤러 눈에 사라진다'고 짚었는데, 그 서버사이드 vs JS 차이를 LocalBusiness 스키마로 실측한 글이다."
      ja: "本記事で触れた「JS注入のJSON-LDはAIクローラーから消える」を、LocalBusinessスキーマでサーバーサイドとJSを実測比較した記事。"
      en: "This post warns that JS-injected JSON-LD vanishes for AI crawlers; here the server-side vs JS gap is measured on a LocalBusiness schema."
      zh: "本文提到「JS注入的JSON-LD会在AI爬虫面前消失」，这篇用LocalBusiness结构化数据实测了服务端与JS注入的差别。"
  - slug: ai-crawler-control-robots-txt-llms-txt-2026
    score: 0.88
    reason:
      ko: "여기서 llms.txt를 CSR 해법으로 쓰지 말라고 했다면, AI 크롤러 허용·차단 정책 자체를 robots.txt로 어떻게 짜는지는 이 글에서 다룬다."
      ja: "ここでllms.txtをCSRの解決策にするなと書いたが、AIクローラーの許可・遮断ポリシー自体をrobots.txtでどう組むかはこの記事で扱う。"
      en: "If this post told you not to treat llms.txt as a CSR fix, this one covers how to actually shape AI-crawler allow/block policy with robots.txt."
      zh: "本文说别拿llms.txt当CSR的解药；这篇讲怎么用robots.txt真正制定AI爬虫的允许与拦截策略。"
  - slug: json-ld-graph-entity-linking-2026
    score: 0.85
    reason:
      ko: "구조화 데이터는 서버 응답에 있어야 의미 있다고 했는데, 그 JSON-LD를 @graph로 엔티티까지 연결하는 설계가 이 글에서 이어진다."
      ja: "構造化データはサーバー応答にあってこそ意味があると書いたが、そのJSON-LDを@graphでエンティティまでつなぐ設計はこの記事に続く。"
      en: "Structured data only pays off in the server response; this post extends that into wiring JSON-LD into an @graph entity model."
      zh: "结构化数据要在服务器响应里才有意义；这篇把JSON-LD进一步用@graph连成实体模型。"
  - slug: sitemap-lastmod-crawl-scheduling-2026
    score: 0.8
    reason:
      ko: "'크롤러가 실제로 무엇을 읽는가'라는 같은 질문을, 이번엔 sitemap에서 구글이 유일하게 신뢰하는 lastmod로 파고든 글이다."
      ja: "「クローラーが実際に何を読むか」という同じ問いを、今度はsitemapでGoogleが唯一信頼するlastmodで掘り下げた記事。"
      en: "Same question of what a crawler actually reads, this time drilling into lastmod, the one sitemap field Google genuinely trusts."
      zh: "同样是「爬虫到底读什么」这个问题，这篇钻研的是sitemap里Google唯一真正信赖的lastmod字段。"
  - slug: a11y-lighthouse-audit-fix-2026
    score: 0.72
    reason:
      ko: "같은 '샌드박스에서 직접 재현하고 실측한다' 방식으로, 이번엔 접근성 위반을 Lighthouse로 잡아 고친 기록이다."
      ja: "同じ「サンドボックスで再現して実測する」やり方で、今度はアクセシビリティ違反をLighthouseで捕まえて直した記録。"
      en: "Same 'reproduce in a sandbox and measure' approach, applied to catching and fixing accessibility violations with Lighthouse."
      zh: "同样是「在沙盒里复现并实测」的做法，这次是用Lighthouse抓出并修复无障碍问题的记录。"
---

「GooglebotはJavaScriptを読めるから、うちのSPAも検索は大丈夫」。これ、半分は正しい。ただ検索の重心が動いているのが問題だ。ChatGPTに聞き、Perplexityで調べ、GoogleのAI概要を先に読むユーザーが増えている。そしてその答えを組み立てるクローラーは、Googlebotとまるで違う動きをする。

結論から書く。<strong>GPTBot・ClaudeBot・PerplexityBotは、あなたのJavaScriptを実行しない。</strong>ページを描画もしないし、レンダリングを待ってもくれない。生のHTMLを一度取得して、テキストを抜き取って終わり。だからコンテンツをクライアント側でしか描かないサイトは、人の目には普通でも、AIクローラーの目には空っぽのページに映る。今日はこれを口で言うだけでなく、サンドボックスで実際に再現した。

![AIクローラーが受け取る生HTML — CSRは空の器、SSRは全コンテンツ](../../../assets/blog/ai-crawlers-csr-invisible-2026-hero.png)

## まず「レンダリング」という語を整理する

この話を正確に読むには、「レンダリング」がどこでコンテンツをHTMLに組み立てるかの問題だと押さえておきたい。

<strong>サーバーサイドレンダリング(SSR)</strong>と静的生成(SSG)は、サーバーが完成したHTMLを送る。ブラウザだろうとクローラーだろうと、応答を受け取った瞬間に`<h1>店名</h1>`も住所も本文も入っている。対して<strong>クライアントサイドレンダリング(CSR)</strong>は、サーバーがほぼ空の器(`<div id="app"></div>`)とJavaScriptバンドルだけを送る。実際のコンテンツはブラウザがそのJSを実行して埋める。ReactやVueで作る典型的なSPAがこれだ。

人がブラウザで見る限り、両者の差は感じない。ブラウザはJSを実行するからだ。差が出るのは<strong>JSを実行しない訪問者</strong>が来たとき。そして今のウェブには、その訪問者、つまりAIクローラーが急増している。

## GooglebotとAIクローラーを同じ箱に入れるな

ここでいちばん足を滑らせる。Google公式ドキュメント(<a href="https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics">JavaScript SEOの基本を理解する</a>)によれば、GooglebotはヘッドレスChromiumでページをレンダリングし、JSを実行したうえで、その結果のHTMLをインデックスする。実際Googleは以前からダイナミックレンダリングを「一時的な回避策であって推奨解ではない」と明言し、SSR・SSG・ハイドレーションを勧めている(<a href="https://developers.google.com/search/docs/crawling-indexing/javascript/dynamic-rendering">Dynamic Rendering as a workaround</a>)。2026年3月にはJS SEOドキュメントから「JavaScriptなしでもページが動くようにせよ」という警告文まで削除した。Googleが自前のレンダラーをそれだけ信頼している、ということだ。

だがこれを「もうCSRはどこでも安全」と読むと大けがをする。あのドキュメントは<strong>Googlebot</strong>の話であって、AIクローラーの話ではない。私が確認した範囲、そして業界のクロールデータ分析(Vercel「The rise of the AI crawler」。参考値であり公式ではない)が一貫して示すところでは、GPTBot・OAI-SearchBot・ClaudeBot・PerplexityBot・BytespiderはJSをレンダリングしない。5億件を超えるGPTBotリクエストを分析してもJS実行の痕跡がゼロだった、という報告もある(参考値、公式ではない)。GPTBotがJSファイルをダウンロードすることはあっても、実行はしないという。

例外は一つある。Google GeminiはGooglebotのレンダリング基盤(Web Rendering Service)を使うため、JSを実行できる。だからGoogleのAI概要はCSRページを見られることもある。しかしChatGPT、Claude、Perplexityは見られない。「AIがうちのSPAを読めていた」をGoogleひとつで一般化してはいけない理由だ。

## curl一本でクローラーの視界をそのまま再現した

口ではいくらでも言えるので、実際に測った。方法は単純。<strong>curlはJavaScriptを実行しない。</strong>だからレンダリングしないAIクローラーがサーバーから受け取る生HTMLを、curlでそのまま再現できる。完璧な代役だ。

サンドボックスに架空のカフェサイトを二種類用意した。コンテンツは同一。片方はCSR、片方はSSR。

```html
<!-- csr.html — コンテンツをクライアント側でのみ注入 -->
<div id="app"><p>Loading…</p></div>
<script>
  fetch('/data.json').then(r => r.json()).then(d => {
    document.getElementById('app').innerHTML =
      '<h1>' + d.name + '</h1><p>' + d.tagline + '</p>' +
      '<address>' + d.address + '</address>' +
      '<p>看板メニュー: ' + d.signature + '</p>';
  });
</script>
```

```html
<!-- ssr.html — サーバー応答にコンテンツが入っている -->
<main id="app">
  <h1>Aria Coffee Roasters</h1>
  <p>シングルオリジンのスペシャルティコーヒーと自家焙煎の豆</p>
  <address>ソウル市麻浦区どこか路 12</address>
  <p>看板メニュー: ゲイシャのハンドドリップ</p>
</main>
```

GPTBotを名乗って両ページを取得してみた。User-Agentをやめただけで、curlはどのみちJSを回さない。

```bash
curl -A "GPTBot/1.2" http://127.0.0.1:8971/csr.html | grep -c "ゲイシャ"
# → 0

curl -A "GPTBot/1.2" http://127.0.0.1:8971/ssr.html | grep -c "ゲイシャ"
# → 1
```

看板メニューは、この店を検索結果に引用させるまさにその情報だ。CSR応答には<strong>0回</strong>しか出てこない。`<title>`に埋めた店名だけがかろうじて引っかかり、本文・住所・メニューは全部消える。クローラーが抜き取るテキストを実際に取り出すと、差はもっとくっきりする。

![curlで抽出したクローラー取得テキスト — CSR 29文字 vs SSR 107文字](../../../assets/blog/ai-crawlers-csr-invisible-2026-evidence.png)

CSRページからクローラーが拾えた本文は`"Aria Coffee Roasters Loading…"`のわずか29文字。ローディング表示まで一緒に拾ってその程度だ。SSRページは107文字、店名・説明・住所・看板メニューがそのまま入る。同じコンテンツ、同じデザイン、人の目には同じページ。なのにクローラーが読む実体はここまで違う。

## では自分のサイトはどっちか、30秒の点検

他人事に見えるが、確認は30秒で済む。二つ勧めたい。

一つ目。ターミナルでクローラーの視界を直接見る。サイトのURLと、そのページに必ずあるべき核心のフレーズを入れて回すだけだ。

```bash
curl -A "GPTBot" https://example.com/my-page | grep "ここに核心フレーズ"
```

このフレーズが結果に出てこなければ、AIクローラーもそれを見られないということ。タイトルタグだけ拾えて本文が出てこないなら、CSR依存が高い。

二つ目。ブラウザの開発者ツールでJavaScriptを切ってリロードする。Chromeならコマンドパレット(Cmd+Shift+P)で「Disable JavaScript」を実行すればいい。ページが空になったり「Loading…」で止まったりしたら、それがGPTBotの見ている画面だ。私はクライアントのサイトを点検するとき、まずこれを使う。レポートを待たず、目で即断できるからだ。

## 直す方向、フレームワーク別に

解決策は新しいものではない。<strong>核心コンテンツをサーバー応答のHTMLに載せる。</strong>使っているスタックによって触る場所が違う。

- <strong>Next.js</strong>: App Routerのサーバーコンポーネント(RSC)か、`getServerSideProps`/静的生成でデータ取得をサーバーへ移す。コンテンツを`useEffect`内の`fetch`だけで取ってこない。
- <strong>Nuxt</strong>: 既定でユニバーサルモードだ。`ssr: true`が生きているか、問題のコンポーネントが`<ClientOnly>`で包まれていないかを確認する。
- <strong>Astro</strong>: 静的生成が既定なので大抵は安全。ただし`client:only`アイランド内だけにあるテキストは初期HTMLに入らないので注意。
- <strong>SvelteKit / Angular</strong>: SvelteKitは`load`関数のサーバー実行を、AngularはAngular Universal(SSR)を有効にする。

とくに気をつけたいものが一つ。構造化データ(JSON-LD)やメタタグを、Google Tag Managerのようなクライアントスクリプトで注入するパターンだ。人の目にはちゃんと入るが、AIクローラーはそのスクリプトを回さないので、JSON-LDごと消える。この落とし穴は[LocalBusiness構造化データをJSで入れる場合とサーバーサイドで入れる場合の違い](/ja/blog/ja/localbusiness-structured-data-server-side-vs-js-2026)で実測したことがあるが、AIクローラーの時代には「サーバーサイドのほうが確実」という原則の重みがずっと増した。エンティティを正しくつなぐ[JSON-LDの@graph構造](/ja/blog/ja/json-ld-graph-entity-linking-2026)を使っても、それがサーバー応答にあってこそ意味がある。

全面SSR移行が重いなら、ハイブリッドでいい。器と核心テキストはサーバーで描き、操作が必要なウィジェットだけクライアントでハイドレーションする。判断基準はただ一つ。<strong>意味のある本文テキストが初期HTMLに入っているか。</strong>

直した後は必ず同じcurlコマンドで再確認する。デプロイパイプラインがプリレンダー工程を飛ばしたり、CDNがボットに別の応答をキャッシュで返したり、特定ルートだけ相変わらずクライアントで描かれたり。こういうのはよくある。私は主要なランディングページをいくつか選んで、`curl -A "GPTBot" ... | grep`をデプロイ後のチェックリストに入れている。一行で回帰を捕まえられる。

もう一つ。SSRはGooglebotにとっても得だ。GooglebotはJSを実行するが、クロールとレンダリングを別のキューで処理する。CSRページは「先にHTMLを取り、レンダリング資源が空いたら後で描き直してインデックス」という二段階を踏むため、コンテンツがインデックスに反映されるまでに時差が出うる。サーバーが完成HTMLを渡せば、このレンダーキュー待ちが丸ごと消える。狙いはAIクローラー対応だが、インデックスの鮮度という副次効果もついてくる。

## llms.txtが解決してくれる、という話は割り引いて聞く

この話題を出すと「じゃあllms.txt置けばいいんでしょ?」という反応がよく返ってくる。私はllms.txtをCSR問題の解決策として売るのは方向が違うと思っている。

llms.txtは、サイトのコンテンツをMarkdownで要約してクローラーに提供しようというコミュニティ提案だ。着想自体は悪くない。問題は現実のほう。Googleは公式に非対応だと明言し(2025年7月のSearch Central Live、Gary Illyes)、John Muellerはこれを、もう10年以上無視され続けているkeywordsメタタグになぞらえた。サイト運営者が「うちはこういう内容です」と自称するファイルなので、操作に弱いという論理だ。主要なAIサービスでこのファイルを推論に使うと公式に認めたところはない。採用率は30万ドメイン調査で10%ほど、有効なllms.txtの97%が2026年5月の一か月間に一件のリクエストも受けなかった、という集計もある(参考値、公式ではない)。

まとめると、AIクローラーが読めない根本原因は「要約ファイルがないから」ではなく「本文がJSの後ろに隠れているから」だ。原因を放置して迂回路から敷く格好になる。AIクローラーのアクセスそのものをどう制御するかは[robots.txtでAIクローラーを制御する戦略](/ja/blog/ja/ai-crawler-control-robots-txt-llms-txt-2026)で別に扱ったので、許可・遮断のポリシーはそちらを見てほしい。ただ「引用させる」の一番目は、いつだってサーバーサイドの可視性だ。

## 正直に残す限界

二つははっきりさせておきたい。

まず今回の実験はcurlで<strong>非レンダリングのフェッチを再現</strong>したものであって、実際のGPTBotトラフィックを捕捉したわけではない。ただ再現しようとしたメカニズム、つまり「JSを実行しない」はこれらクローラーの文書化された挙動そのものなので、結果の方向は信頼できる。

もう一つ、より重要な限界だ。<strong>SSRで見えるようにしたところで、引用や順位が保証されるわけではない。</strong>可視性は必要条件であって十分条件ではない。クローラーが読めるようになった先で、コンテンツの質や信頼性、構造化データが働く。Googleが構造化データについて「順位を保証しない」と繰り返すのと同じ文脈だ。この記事が約束するのはここまで。見えなかったものを見えるようにすること。その先はコンテンツの仕事だ。

私の結論は単純だ。AI検索を本気で気にするなら、派手なGEOテクニックを乗せる前に`curl -A "GPTBot"`を一行回してみてほしい。あなたの核心フレーズがそこになければ、残りの最適化はぜんぶ空のページの上に建てることになる。

---

構造化データをサーバーサイドで確実に出力したい、あるいは既存のSPAやヘッドレス構成がAI検索とクローラーにきちんと露出しているか点検したい。そんなときは個人で相談・実装のご依頼をお受けしている。プロフィールの問い合わせ経路から気軽にご連絡を。
