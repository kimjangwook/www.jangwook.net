---
title: '公式GEOガイドが消した項目と、Search Consoleの新しいスイッチ'
description: 'Google公式の生成AI最適化ガイドはllms.txtも専用スキーマも無視すると書く。開発者が触る新しい装置はSearch Consoleの生成AI制御と、gitではないライブのrobots.txtだ。'
pubDate: '2026-08-14'
heroImage: '../../../assets/blog/official-geo-subtraction-gsc-control-2026/hero.png'
tags:
  - SEO
  - GEO
  - AIO
  - Search-Console
faq:
  - question: 'llms.txtを置けばAI Overviewに有利か'
    answer: 'ならない。Search Centralの生成AI最適化ガイドは、Google Searchがこのファイルを無視し、作っても可視性や順位に得も損もないと書いている。別のサービスが読むなら残してよいが、Google Searchの作業ではない。'
  - question: '生成検索専用のschema.orgはあるか'
    answer: '公式文書はないとしている。構造化データはリッチリザルトの資格には今も使う。生成検索のための専用マークアップを足す必要はなく、順位や引用を保証もしない。'
  - question: 'Search Consoleの生成AI制御を切ると通常検索からも落ちるか'
    answer: 'ヘルプは、この制御が特定の生成AI機能の表示にだけ効き、検索の他の部分の順位・掲載シグナルではないと書く。学習制限はGoogle-Extended、検索全体からの除外はnoindex。制御UIはまだ一部プロパティへの段階公開だ。'
relatedPosts:
  - slug: robots-snippet-controls-ai-overviews-2026
    score: 0.88
    reason:
      ko: 그 글이 페이지 단위 nosnippet·max-snippet이 AI Overview 입력까지 잠그는 레버라면, 이 글은 그 위에 얹힌 속성 단위 Search Console 스위치와 공식 빼기 목록을 맞춘다.
      ja: あちらがページ単位の nosnippet・max-snippet で AI Overview 入力を閉じるレバーなら、こちらはその上に載るプロパティ単位の Search Console スイッチと公式の引き算リストを揃える。
      en: "That post is the page-level lever. nosnippet and max-snippet close AI Overview input. This one sits above it with the property-level Search Console switch and the official subtraction list."
      zh: 那篇是页面级开关，nosnippet、max-snippet 会关掉 AI Overview 的输入。这篇叠在上面：属性级 Search Console 开关，以及官方划掉的清单。
  - slug: ai-crawler-control-robots-txt-llms-txt-2026
    score: 0.86
    reason:
      ko: 크롤러를 들일지 말지는 그 글의 robots.txt 설계다. 오늘은 그 파일이 라이브에서 CDN 접두를 입고 길어졌고, 공식은 llms.txt를 Google Search가 무시한다고 다시 못 박은 지점을 잰다.
      ja: クローラーを入れるかはあちらの robots.txt 設計だ。今日はそのファイルがライブで CDN 接頭辞を着て長くなり、公式が llms.txt を Google Search は無視すると再確認した地点を測る。
      en: Whether a crawler gets in is that post's robots.txt design. Today the live file grew a CDN prefix, and the official guide restated that Google Search ignores llms.txt.
      zh: 爬虫进不进门，是那篇的 robots.txt 设计。今天量的是线上文件被 CDN 前缀拉长，以及官方再次写明 Google Search 会忽略 llms.txt。
  - slug: faqpage-deprecation-ai-citation-2026
    score: 0.74
    reason:
      ko: 검증기를 통과한 FAQPage가 리치 결과에서는 이미 끝난 이야기라면, 생성형 검색용 전용 스키마를 더 얹는 일도 같은 함정이다. 자격과 노출은 따로 논다.
      ja: 検証を通った FAQPage がリッチリザルトではすでに終わっているなら、生成検索用の専用スキーマを足すのも同じ罠だ。資格と露出は別物である。
      en: If a valid FAQPage already stopped producing a rich result, adding a special schema just for generative search is the same trap. Eligibility and appearance are not the same job.
      zh: 若通过校验的 FAQPage 在富结果里已经收场，再为生成式搜索加一套专用 schema，是同一个坑。资格和露出不是一回事。
  - slug: validate-structured-data-ci-jsonld-2026
    score: 0.7
    reason:
      ko: JSON-LD를 CI에서 막는 일은 리치 결과 자격을 지키는 쪽에 남는다. 공식은 그 마크업이 생성형 검색의 필수 조건이 아니라고 했으니, 게이트의 목적을 다시 적어야 한다.
      ja: JSON-LD を CI で止める仕事はリッチリザルト資格を守る側に残る。公式はそのマークアップが生成検索の必須ではないとしたので、ゲートの目的を書き直す必要がある。
      en: Catching JSON-LD in CI still belongs on the rich-result side. Official guidance says that markup is not required for generative search, so the gate's purpose has to be rewritten.
      zh: 在 CI 里拦住 JSON-LD，仍然是在守富结果资格。官方说这套标记不是生成式搜索的必要条件，门禁的目的得重写。
  - slug: json-ld-graph-entity-linking-2026
    score: 0.64
    reason:
      ko: 엔티티를 @graph로 묶는 작업은 사라지지 않는다. 다만 그 작업의 이유를 "AI Overview 전용 최적화"로 쓰면 공식 문서와 어긋난다.
      ja: エンティティを @graph で結ぶ仕事は消えない。ただしその理由を「AI Overview 専用最適化」と書くと公式文書とずれる。
      en: Linking entities in an @graph does not go away. Calling that work an AI Overview-only optimization, though, is out of line with the official guide.
      zh: 用 @graph 把实体串起来，这件事不会消失。但若把理由写成“AI Overview 专用优化”，就和官方指南拧着了。
---

Search Centralの生成AI最適化ガイドに、こう書いてある。生成AI検索への最適化は検索体験への最適化であり、したがって今もSEOだ、と。文書の更新日は2026年7月10日。5月15日に新設されたガイドだ。

その一文を先に置く。AEOやGEOという名前で届くチェックリストの先頭が、たいてい `llms.txt` だからだ。次の行は文章を短く切れ、専用のschema.orgを足せ、AI向けに書き直せ、と続く。公式文書の神話崩し節は、その列を先に消す。

開発者が新しく触る装置はファイルではない。Search Consoleプロパティのスイッチだ。今日はその公式の引き算と、公開面のHTML・robots.txtを並べる。順位の話ではない。

![公式GEOは引き算リストとスイッチ一つ](../../../assets/blog/official-geo-subtraction-gsc-control-2026/hero.png)

## AI Overviewがページを拾う条件

言葉を固定する。**AI Overview**は複雑な問いに要旨と根拠リンクを添える検索機能。**AI Mode**は比較や推論のように、以前なら複数回の検索が要った問いを一つの流れで扱う対話型検索。どちらもGoogle検索の一部で、ライブのインデックスからページを取って答えを作る。Googleはこの過程を、中核のランキングの上に載せた **RAG** と、元の問いの周辺へ同時に関連クエリを飛ばす **query fan-out** として説明する。芝生の雑草をどう除くか、という問いなら、除草剤と無化学の除去と予防が別クエリになり得る、という例が文書にある。

資格の話はそのあとだ。生成機能のリンクや根拠になるには、ページが **インデックスされ**、**スニペットを出せる状態**でなければならない。[AI features and your website](https://developers.google.com/search/docs/appearance/ai-features) の文はこうだ。

> There are no additional requirements to appear in AI Overviews or AI Mode, nor other special optimizations necessary.

出典: [AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)

追加要件はなく、特別な最適化も要らない。同じ文書は、技術要件とスパムポリシーと人向けコンテンツの指針は守れと続ける。資格を満たしてもクロール・インデックス・掲載は保証されない。検索一般と同じ留保だ。

スニペット資格そのものは、すでに一度測った。`<meta name="robots">` の `nosnippet` と `max-snippet:0` が AI Overview・AI Mode の直接入力まで閉じる、という公式の定義は [robotsスニペット指示子の実測](/ja/blog/ja/robots-snippet-controls-ai-overviews-2026) に書いた。今日はあのレバーを測り直さない。その上に層が増えたからだ。

最適化ガイドはこう足す。検索の技術要件に加え、サイトがSearch Consoleの生成AI機能に **含まれて** いなければ、生成機能へ出る資格が立たない。チェックリストではなく、プロパティ設定の文だ。

## 公式が先に消した四つの行

神話崩しの節は AEO・GEO を、検索体験最適化の別名として扱う。視点は先に引いた一文に尽きる。

> From Google Search's perspective, optimizing for generative AI search is optimizing for the search experience, and thus still SEO.

出典: [Optimizing your website for generative AI features](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)

バックログから消す行が決まる。

| 市場に出回る項目 | 公式の立場 | コードと設定ですること |
| --- | --- | --- |
| `llms.txt` と専用AIファイル | Google Searchは使わない。作っても可視性・順位に得も損もない | Google Search用には作らない。別システムが読むならその目的だけ残す |
| モデル向けに文章を細かく割る | 要求しない。一ページの複数トピックを理解すると書く | 長さは読者の単位で決める |
| AIだけを狙った書き直し | 同義語と意味を理解する。ロングテールを全部別ページにする必要はない | 人向けの草稿を残す。変形ページの量産は [scaled content](https://developers.google.com/search/docs/essentials/spam-policies#scaled-content) とぶつかる |
| 生成検索専用のschema.org | 不要。専用マークアップもない | リッチリザルト用は残し、「AI Overview用スキーマ」を新設しない |

`llms.txt` の文はさらに直接だ。

> Doing so will neither harm nor help your site's visibility or rankings in Google Search, as Google Search ignores them.

出典: 同じ [最適化ガイド](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) の LLMS.txt 項

害にも得にもならない。別サービスが読むなら残してよい。Google Searchの作業リストからは外す。[robots.txtとllms.txtでクローラーを分ける記事](/ja/blog/ja/ai-crawler-control-robots-txt-llms-txt-2026) で学習用ボットと検索用ボットを分けてあるなら、今日確認するのは「Googleが読むレバー」という思い込みを外すことだ。

構造化データの節は二度読む。生成検索の必須ではなく、専用タイプもない。リッチリザルトの資格には今も使うので、全体のSEOの一部としては残せ、と続く。私はこの文を「JSON-LDを消せ」とは読まない。「生成検索の名目でスキーマを一つ足すな」と読む。構造化データが順位を保証しないのはGoogleが長く書いてきた限界で、引用も保証しない。

ウェブのあちこちに不自然な言及を植える行為も、公式は役に立たないと見る。中核のランキングは品質に依り、スパム対策がそれを濾し、生成機能は両方に依存する。開発チケットにする仕事ではない。

第三者ツールが「内部指標」を見ているという主張も、同じ文書が切る。内部のランキングやAIシステムに触れる第三者ツールはない。[第三者SEO助言の評価ガイド](https://developers.google.com/search/docs/fundamentals/third-party-seo) は AEO・GEO の助言を公式文書と突き合わせろと言う。ツールを作業に使うこと自体は止めていない。その数字をGoogleの数字のように扱うな、という話だ。

## Search Consoleのスイッチと、継承

ガイドが「Search Consoleに含まれていなければならない」と書いた対象は、ヘルプの [Search generative AI control](https://support.google.com/webmasters/answer/16908024) だ。経路は Settings > Search generative AI。

選択肢は三つ。リンクとコンテンツを生成AI機能に含める。除外する。親プロパティに従う。含めが全プロパティの既定値。除外すると AI Overview、AI Mode、Discoverの生成機能からリンクもグラウンディング入力も消える。その機能からのインプレッションとトラフィックも消える。

限界は公式の文で固定する。

> This control only affects whether your content can appear in certain Search generative AI features; this control isn't used as a ranking or inclusion signal affecting other parts of Search.

出典: [Search generative AI control](https://support.google.com/webmasters/answer/16908024)

検索の残りに対する順位シグナルではない。学習制限もこのスイッチの仕事ではない。学習を絞るなら [Google-Extended](https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers#google-extended)、検索全体から外すなら `noindex`。反映は制御が生きてからおおむね1〜2日。キャッシュで延びることがある。

ここから先はチームの話になる。ドメインプロパティで誰かが除外を押すと、個別設定していない URL-prefix の子はそれを継承する。ブログが `https://example.com/blog/` として分かれていても、親が先に手を入れていれば子は既定で従う。HTMLをいくら綺麗に出し、robots.txtをいくら分けても、プロパティのスイッチが切れていれば生成機能の資格はその層で終わる。

制御もレポートも、まだ一部サイトへの段階公開だ。2026年6月3日の [生成AIパフォーマンスレポート発表](https://developers.google.com/search/blog/2026/06/gen-ai-performance-reports) も一部プロパティから。レポートの数字はインプレッションであり、クリックでも順位でもない。Search Labsの実験データは入らない。画面が無いから除外されている、とは限らない。配信対象外か、生成機能のインプレッションがまだ足りないだけかもしれない。

この記事のために Search Console へはログインしていない。自分のプロパティにそのメニューがあるかは、ここで断言しない。断言できるのは、文書上の既定値が含めであることと、継承が文書に書いてあることだ。

チーム向けに順序を書き直すとこうなる。先に親ドメインプロパティの現在値を見る。子の URL-prefix が継承中か、手動で上書きしたかを書く。そのあとでテンプレートの robots meta とライブの robots.txt を見る。逆にすると、マークアップを一週間直しても生成機能から丸ごと抜けている状態を説明できない。反映が1〜2日と書いてある以上、変えた日の午後にレポートが動かないからといって戻す判断は早い。マークアップを触る人と Search Console の所有者のチームが違うなら、この層はコードレビューに乗らない。

![資格は三層](../../../assets/blog/official-geo-subtraction-gsc-control-2026/three-layers.png)

## ライブのrobots.txtはgitと違った

公式の引き算を読んだあと、新しいファイルは作らなかった。クローラーが実際に受け取るバイトを取った。2026年8月14日、`https://jangwook.net` の公開面だけを `curl` した。

```bash
curl -sI https://jangwook.net/llms.txt
# HTTP/2 404

curl -sL https://jangwook.net/robots.txt | wc -l
# 106

# repo の public/robots.txt は 45行、1,101バイト
# ライブは 106行、2,937バイト
```

`llms.txt` は404。`LLMs.txt` も `www` ホストも同じ。Google Searchが無視するとしたファイルを、こちらから置いていない状態と一致する。

robots.txtは違った。リポジトリは学習ボット（`GPTBot`、`ClaudeBot`、`CCBot`、`Google-Extended`）を止め、検索ボットと `*` には言語横断URLだけを止める45行。ライブ応答はその前にCDN管理の接頭辞が付き、106行になる。`User-agent: *` に `Content-Signal: search=yes,ai-train=no,use=reference` があり、複数の学習・拡張ボットへの `Disallow: /` がもう一度ある。リポジトリ本文はその後ろにそのまま続く。

![gitのrobots.txtとライブ応答の行数](../../../assets/blog/official-geo-subtraction-gsc-control-2026/robots-live-vs-git.png)

`Content-Signal` は、この記事が引いた Search Central の robots.txt 案内では、対応ルールとして確認できなかった。ライブファイルに書いてある事実と、Googlebotがそのトークンを消費するという主張は別の層だ。後者はここで断言しない。第三者の慣例として扱い、Google Searchの資格の根拠にはしない。

ページ8枚（`/`、`/ja/` ではなく測定したのは `/` `/ko/` `/en/` `/ko/blog/`、記事3本、`/ko/contact/`）はすべて HTTP 200。`<meta name="robots">` は0件、`data-nosnippet` 属性は0件。本文に `nosnippet` という語が出るページはあったが、指示子タグではなかった。既定テンプレートが robots タグを空にする設計と合う。`noindex` を付けたページだけタグが入る。

JSON-LDはホームに `Organization`・`Person`・`WebSite`、記事に `BlogPosting`・`WebPage`・`BreadcrumbList` が載っていた。今日の文書では、そのマークアップは生成検索の入場券ではない。リッチリザルトとエンティティ整理の側に残る仕事だ。[FAQPageのリッチリザルトが終わったあともQ&Aマークアップを残した理由](/ja/blog/ja/faqpage-deprecation-ai-citation-2026) と同じ線。検証通過と検索露出は、もともと別の出来事だ。

ライブとgitが割れた地点が、今日の実測だ。GEOを「リポジトリにファイルを足す」作業だと思うと、クローラーが読むファイルはすでにリポジトリの外で長くなっている。見るべきは `public/robots.txt` のdiffではなく、配信されたURLだ。

## エージェントが読むのはアクセシビリティツリーでもある

ガイド末尾はブラウザエージェントの節だ。予約代行や仕様比較の話で、検索の引用とは肌合いが違う。触る表面は同じだ。[web.devの agent-friendly 案内](https://web.dev/articles/ai-agent-site-ux) は、エージェントがサイトを見る経路を三つ書く。スクリーンショット、生HTML、アクセシビリティツリー。

アクセシビリティツリーは役割・名前・状態を残し、視覚の装飾を捨てた要約だ。スクリーンリーダーが使うあのツリーと同じ。`div` をボタンに見せかけると、DOMだけ読む側はボタンを見ず、スクリーンショットだけ見る側は位置は分かっても動作は分からない。セマンティックHTMLとラベルの接続は、点数の話ではない。機械が動作を取り違えないための信号だ。

最適化ガイドもセマンティックHTMLを「完璧なコード」ではなく、人の読みやすさと支援技術のパースの側で説明する。ウェブ全体が妥当なHTMLではなく、Googleはそれを理解すると書いてある。それでも使え、と言う理由は検索クローラーだけではない。エージェントが同じツリーを読む。

残る実装は地味だ。ボタンは `button` と `a`。入力には `label for`。透明なオーバーレイでクリック領域を隠さない。カテゴリごとにレイアウトが大きく跳ねないようにする。WCAGを書き直す仕事でもあり、エージェント専用の新しい形式を作る仕事ではない。

web.devは、スクリーンショットだけを信じる経路が遅くて高いと書く。構造が濁ったときの補助だ。主経路をツリーとDOMに置けば、検索クローラーが読むテキストとエージェントが読む役割が同じマークアップから出る。検索用の隠しテキストを足すのとは逆方向だ。

## バックログから消す行、残す行

今日の対照で取った側を書く。公式のGEO文書は足し算のガイドではない。市場の項目を消したあと、検索で使っていた技術面と Search Console のスイッチ一つを残した文書だ。

消す行:

- Google Search用の `llms.txt` 新規作成、専用AIマークダウン、生成検索専用schema.org
- モデル向けの段落分割とAI専用の書き直し、クエリ変形ごとのページ増殖
- 第三者ツールの「内部指標」をデプロイゲートの数字にすること

残す行:

- インデックスとスニペット資格。テンプレートに `nosnippet` が潜んでいないか、`noindex` が意図したページだけか
- 配信された `robots.txt` をURLで取り、gitとdiffする。CDN接頭辞が学習ボットと検索ボットを意図と逆にしていないか
- Search Consoleの親子プロパティの生成AI制御。既定は含め。画面がまだ無いなら配信対象外の可能性がある。無いことを除外と決めない
- セマンティックHTMLとアクセシビリティツリー。エージェント案内は新しい形式ではなく既存のマークアップだ
- リッチリザルト用JSON-LDの目的欄を「生成検索の必須」から「リッチリザルト資格」へ書き直す

すぐ回せる最小のコマンドはこれだ。

```bash
curl -sI https://example.com/llms.txt | head -n 1

curl -sL https://example.com/robots.txt > /tmp/live-robots.txt
diff -u public/robots.txt /tmp/live-robots.txt

python3 - <<'PY'
import re, sys, urllib.request
html = urllib.request.urlopen(sys.argv[1]).read().decode("utf-8", "ignore")
print("robots meta:", re.findall(r"<meta[^>]+name=[\"']robots[\"'][^>]*>", html, re.I))
print("data-nosnippet attrs:", len(re.findall(r"<[^>]+data-nosnippet", html, re.I)))
PY
https://example.com/your-page/
```

三行が通っても Search Console のスイッチは見えない。その層はブラウザではなくプロパティ設定にある。コードレビューだけでは閉じない穴がそこにある。

生成機能への露出は保証されない。含めのままでも、スニペット資格があっても、インデックスされていても、Googleがそのページを拾う約束は文書のどこにもない。今日測ったのは資格の層であって、効果の大きさではない。

三層をリポジトリとライブURLとプロパティ設定に突き合わせて、どこで切れるかが見えないなら、その層だけ持ってきてほしい。公式文書と配信バイトのあいだを合わせる仕事は、こちらでしている。
---
*出典: Google Search Central の [生成AI機能最適化ガイド](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)（2026-07-10更新）、[AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)、[第三者SEO助言ガイド](https://developers.google.com/search/docs/fundamentals/third-party-seo)、[生成AIパフォーマンスレポート発表](https://developers.google.com/search/blog/2026/06/gen-ai-performance-reports)（2026-06-03）、Search Consoleヘルプの [Search generative AI control](https://support.google.com/webmasters/answer/16908024)・[Generative AI performance report](https://support.google.com/webmasters/answer/16984139)、web.dev の [Build agent-friendly websites](https://web.dev/articles/ai-agent-site-ux)（いずれも公式）。本文の英文ブロック引用4件は各原文を取得し空白を畳んで対照した文字列で、引用のそばに原文リンクを置いた。ライブ測定: 2026-08-14、`https://jangwook.net` の robots.txt・llms.txt・ページ8枚、curl + HTML解析。原データは `data/official-geo-gsc-control-probe-2026.json`、図は `scripts/chart-official-geo-gsc-control.py`。Search Consoleにはログインしていない。Content-Signalはライブrobots.txtに存在するだけで、Search Centralのrobots.txt対応ルールとしては確認していない。構造化データもこのスイッチも順位を保証しない。*
