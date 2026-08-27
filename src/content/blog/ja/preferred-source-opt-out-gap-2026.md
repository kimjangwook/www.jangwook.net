---
title: Preferred Source が専用ページを手に入れた日、除外は一文のままだった
pubDate: '2026-08-21'
description: Google が 2026 年 8 月に発表した preferred sources は発表文と専用文書とバッジを同日で揃えた。一方、AI
  機能からの除外は nosnippet 系 4 指示子を束ねた一文のみ。文書表面の実測と自社配備 12 URL の検証から、除外レバーの実在を数えた結果を運用者向けに整理する。
heroImage: ../../../assets/blog/preferred-source-opt-out-gap-2026/hero.png
relatedPosts:
- slug: ai-crawler-control-robots-txt-llms-txt-2026
  score: 0.7
  reason:
    en: While Google reshapes search exposure with preferred sources, the next step
      is controlling AI crawlers with robots.txt and llms.txt; blocking training while
      allowing citation.
    ko: 구글이 선호 소스로 검색 노출을 재편하는 동안, AI 크롤러까지 통제하려면 robots.txt와 llms.txt로 학습은 막고 인용은
      허용하는 전략이 이어집니다.
    ja: Googleが優先ソースで検索の露出を再編するなか、AIクローラーまで制御するにはrobots.txtとllms.txtで学習はブロックし引用は許可する戦略が続きます。
    zh: 在Google用首选来源重塑搜索曝光的同时，下一步是用robots.txt和llms.txt控制AI爬虫，阻止训练但允许引用。
- slug: declared-rules-fail-open-robots-txt-agents-md-2026
  score: 0.7
  reason:
    en: Google's preferred sources launch, shipped with only partial documentation,
      mirrors the 219-run finding that robots.txt and AGENTS.md pass silently when
      rules get truncated.
    ko: 선호 소스 기능이 문서화조차 반쪽으로 선 채 출시된 지금, 규칙이 누락돼도 조용히 통과되는 robots.txt와 AGENTS.md의
      219회 실측 결과가 그 실패 양상을 보여준다.
    ja: Googleがドキュメント付きで公開したpreferred sources機能も、ルールが欠落してもエラーなく動くrobots.txtとAGENTS.mdの219回実測が示す失敗モードと同じ構造を持つ。
    zh: Google带着文档仓促上线的preferred sources功能，正呼应了219次实测揭示的真相：robots.txt与AGENTS.md的规则即使被截断也静默通过。
---

robots.txt に Google-Extended の Disallow を足した時点で、AI Overviews から外れたつもりになっているエンジニアは少なくない。2026 年 8 月 21 日時点で、その前提は Google の公式文書の上でどうなっているのか。文書と自サイトの配備を同じ物差しで数えてみたところ、包含と除外の道具立ての差が、レバーの有無として測れる形で表に出た。除外統制を前提に置いているチームほど、この差分の受け止め方を今日から変える必要がある。

## 発表と文書が同日に着地した表面

2026 年 8 月 20 日、Google は Search に preferred sources を発表した。ユーザーが自分のサイトを優先ソースとして選ぶと、AI Mode と AI Overviews で "preferred" バッジ付きでコンテンツが強調される機能である。blog.google の発表文と、`developers.google.com/search/docs/appearance/preferred-sources` の開発者文書は同じ日に更新されており、文書は HTTP 200 で到達可能、最終更新 2026-08-20 UTC、本文中に preferred source が 24 回出現する。左側ナビ 154 パスの中に専用ページのパスが入っている。

包含側のレバーには、発表文、専用ページ、バッジの挙動まで揃っている。ここまでは通常のプロダクトローンチの姿だ。

問題は反対側の台帳である。Google の生成 AI 機能から自サイトを外したい場合、公式の指示は AI features 文書の中の一文だけだ。`nosnippet`、`data-nosnippet`、`max-snippet`、`noindex` の 4 つを束ねた一文である。専用ページはない。発表文もない。バッジもない。

## サービスレジストリとしての開発者文書

分散システムでサービスレジストリを扱う時の原則と同じ扱いを、Google の開発者文書に適用できる。デプロイされて到達可能なものが真実で、通りすがりに言及されたものは真実ではない。この視点で、この検証は 5 つの表面を取得してトークンを数えた。AI features 文書、robots meta tag 文書、Google-Extended クローラ文書、blog.google の発表文、そして自サイトの sitemap と robots.txt である。取得は curl 8.7.1 / macOS 26.5.2、デスクトップ Chrome の UA で行い、ボイラープレートノイズを除くため統制セルを差し引いた。6 セル × 3 ラン、計 18 ラン、すべて exit 0、fetch はすべて HTTP 200、バイト数は基準値と一致。モデル呼び出し 0 件の決定的カウントである。

測定結果は次の通り。

| レバー | 文書表面 | 証拠 |
|---|---|---|
| 包含（preferred source） | 専用ページ、HTTP 200、更新 2026-08-20 UTC | 文書本文で "preferred source" × 24、ナビ 154 パスに含まれる |
| 包含（発表文） | blog.google、2026-08-20 | "preferred source" × 7 |
| 除外（AI 機能） | ai-features 文書の一文 | `nosnippet` × 1、`data-nosnippet` × 1、`max-snippet` × 1、`noindex` × 1（統制セル差し引き後）。「opt out」× 0、「exclude」× 0 |
| Google-Extended を AI 除外レバーとして | google-common-crawlers 文書 | 「AI Overviews」× 0、「AI Mode」× 0 |

最終行が一番重い。多くのサイト運営者が最初に手を伸ばすのが Google-Extended だからだ。文書は Google-Extended が Gemini と Vertex のグラウンディングに使われ、「Google 検索への掲載には影響せず、ランキングシグナルとしても使われない」と明記する。AI features 文書はさらに踏み込んで、AI は検索に組み込まれておりその機能の仕方に不可欠であるため、Googlebot への robots.txt 指示こそが検索クロールの制御だと述べる。Google-Extended だけをブロックしても、AI Overviews と AI Mode には触れていない。falsifier として「Google-Extended 文書は AI Overviews か AI Mode をどこかで名指しているか」を確認したが、答えは否定だった。

## 書類と実働の差分

障害対応の現場で繰り返される失敗に、「設定ファイルにその行が書いてあるから大丈夫」という報告を鵜呑みにするパターンがある。書類上の設定と、実働プロセスに実際に読み込まれた設定は別物であり、最初にやるべきは `ps` と `curl` での実地確認だと経験を積んだ現場ほど口をそろえて語る。今回の話も同じ構造をしている。文書という書類と、配備という実働プロセスの間に差分があるかを、確認せずに進めてはならない。

差分確認の結果がこれだ。本サイトの sitemap（全 351 ロケーション）から決定的な方法で 12 URL を標本化し（ソート後 head -12、4 言語共通テンプレート）、HTML 原文を取得して nosnippet 系 meta 指示子を数えた。結果は 0/12。全 URL で `meta=[]`、robots meta も googlebot meta も 1 つも載っていない。コーパス内の唯一の nosnippet 文字列ヒットは、過去記事タイトルにその語が含まれていたブログ一覧カードの本文文字列で、meta タグではない。

一方で robots.txt は除外っぽい行を複数持っている。Google-Extended の Disallow 2 行、`Content-Signal: search=yes,ai-train=no,use=reference`、GPTBot 2 行、CCBot 2 行だ。つまり配備側は、コミュニティレバーとベンダー個別レバーに投資しながら、Google 自身の公式レバーである nosnippet 系がゼロページにしか載っていない状態だった。障害対応の言葉で言えば、監視に入れていない別系統のメトリクスを大量に集め、肝心の SLO を測っていない状態に近い。

ここで読者に反問を投げたい。あなたの配備で、この数字はいくつか。sitemap から 12 URL を引いて HTML を取得し、meta タグ内の指示子を数える。コマンドにすれば数行で済む。

```console
$ curl -s https://example.com/page.html \
  | grep -Eo 'nosnippet|data-nosnippet|max-snippet' | sort | uniq -c
```

出てきた数が、この軸であなたが実際に統制している URL の数である。0 が出たなら、それは GPTBot の行で埋められる隙間ではなく、コンプライアンスの前提が今日吸収すべき事実だ。

## 反対意見が正しい範囲の境界

最も強い反対意見はこうなる。「レバーが欠けているのではない。意図された設計だ。Google は AI 機能を Search の一部と定義しているのだから、Search から抜けること自体がオプトアウトである」。この読みは規定のレベルで正しい。AI features 文書の第一文そのものであり、推論ではない。

ただし規定は道具ではない。定義された方針が実行可能な統制になるには、文書が実務者が実装できる粒度で経路を記述する必要がある。4 つの指示子を束ねた一文はその条件を満たさない。理由は、4 つが等価でないからだ。

- `noindex` はページを Search から丸ごと外す。完全な除外に完全なコストが対になる。
- `nosnippet` はスニペットを外す。AI features 文書の記述に従えば、これは検索があなたのページから表示できる情報を制限するものでもあり、AI 機能に触れる同じ指示子が通常の検索リスティングも劣化させる。
- `data-nosnippet` はページ断片をマークする。部分的な統制だが、生成引用との相互作用は文書表面のどこにも記述されていない。
- `max-snippet` はスニペット長を上限する。「max-snippet:0 が AI Overviews での引用資格と通常スニペット表示を分離できるか」は、コンプライアンス志向の運営者が最も知りたい組み合わせなのに、文書は沈黙している。

反対意見が正しい範囲の境界はここで正確に引ける。Search に残り、スニペット資格を保ち、AI Overviews だけから抜けるという選択的除外は、文書上実装可能な経路として存在しない。存在するのは、除外レバーが検索資産価値と一緒に燃える束ねられた取引だけだ。機能フラグに言い換えれば、サブシステム全体を落とすフラグしか出荷できない状態である。

非対称の背後にあるのは技術的難度ではなく製品の方向だ。AI Overviews と AI Mode は別サービスではなく検索の機能として再分類されてきたため、既存の Search 統制が定義上そのまま統制であり、新たな除外インターフェースを作る誘因が Google の側に生まれない。逆に preferred sources はユーザー選択という新しい表面であり、新しい表面が要するもの、つまり発表、専用文書、バッジ挙動、ボタンコードを、発表と同じ日に全部載せてきた。レバーの有無は、プロダクトロードマップが文書表面に残す足跡である。発表と文書の同日出荷がその証拠だ。文書は製品の事後記録ではなく、製品の一部として出荷されている。

## 運用側の二つの姿勢

対応は、除外が本当に必要かどうかで二つに分かれる。

**除外を真に必要とする場合**、つまりライセンス付きデータやコンプライアンス上の機微素材を扱う場合、nosnippet 系が唯一の公式レバーであり、通常検索でのスニペット資格を同時に失う。このコストを見積もりに含めること。そして Google-Extended の robots.txt 行や Content-Signal ヘッダが「Google の AI 検索機能が認める統制」の錯覚を作らないようにすること。コミュニティレバーは学習クローラには居場所があるが、Search の生成機能への公式経路ではない。

**除外を必要としない場合**、大半のパブリッシャーはこちらだが、存在しないオプトアウトのスイッチを探す工数を止めること。測れて動かせる表面は包含側にある。preferred sources は専用文書ページと、サイトを選んだユーザー向けのバッジ機構つきで出荷され、発表文によれば既に 60 万を超えるユニークソースがユーザーによって選ばれている。自サイトがこの土俵に乗っているかを確認し、どの URL がスニペット資格を持っているかを棚卸しする。現行の設計では、スニペット資格こそが通常の検索表示と AI 引用の両方が汲む水源だからだ。

監査そのものは安価で決定的である。コンプライアンス上の含意はそうではない。実配備での除外統制数が 0 なら、誰かに「なぜこのページが AI Overview に出たのか」と聞かれる前に、リスク登録簿に書き込むべきだ。

## 測らなかったもの

この主張には三つの境界がある。第一に、Search Console の画面が preferred source のスイッチを公開しているかどうか。認証セッションが必要なため、この検証は公式文書表面までしか測っていない。第二に、実物の AI Overviews と AI Mode のパイプラインが nosnippet 系指示子を文書どおりに尊重するかどうか。測ったのは文書と配備であり、Googlebot のパーサーの実動作ではない。第三に、配備標本は 4 言語で同一テンプレートを共有する 1 サイトであり、自分のフリートへの一般化は自分のカウントを実行してからにすべきだ。加えて support.google.com は可視テキスト 2,697 バイトの JS シェルで、ヘッドレスでは取得不能のため、不在証拠には使えなかった。

一般化できるのは方法の方だ。ローンチが文書と発表を同日に出荷する時代には、専用ページの有無、トークン頻度、実 HTML に対する指示子数という「文書表面に何が実在するか」のカウントが、レバーの実在と folklore を見分ける確実な手段になる。次に「robots.txt に 1 行足すだけ」の移行を誰かが提案する前に、一度走らせてほしい。そして最初に置いた問い、つまり Google-Extended の行を足した時点で AI 検索から外れたのかという問いへの答えは、もう出ている。外れていない。文書は最初からそう言っており、数えたのはそれを確かめるためだった。

## 参考資料

1. "AI features in Search," Google Search Central, developers.google.com、https://developers.google.com/search/docs/appearance/ai-features（2026-08-21 取得）
2. "Google-Extended (google-common-crawlers)," Google Search Central、https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers（2026-08-21 取得）
3. "Personalize news in Search and Discover," Google, blog.google、https://blog.google/products-and-platforms/products/search/personalize-search-discover-news/（2026-08-21 取得）
4. "Preferred sources," Google Search Central、最終更新 2026-08-20 UTC、https://developers.google.com/search/docs/appearance/preferred-sources（2026-08-21 取得）