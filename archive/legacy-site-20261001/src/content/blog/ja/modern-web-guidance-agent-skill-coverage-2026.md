---
title: 'Chromeのエージェントスキルを数えた：ガイド138本、アクセシビリティ2本、検索0本'
description: 'Google Chromeチームの Modern Web Guidance 0.0.180 を入れ、ガイド138本をカテゴリ別に数え、3領域22件のクエリで検索を突いた。上位類似度はUI 0.643、アクセシビリティ0.508、構造化データ0.267で無応答2件。コーパスの空白を規約で埋める手順まで書く。'
pubDate: '2026-08-10'
heroImage: '../../../assets/blog/modern-web-guidance-agent-skill-coverage-2026/hero.png'
tags:
  - Web開発
  - AIエージェント
  - アクセシビリティ
  - 構造化データ
  - Baseline
faq:
  - question: 'Modern Web Guidance を入れれば、エージェントがアクセシビリティまで面倒を見てくれますか。'
    answer: '期待値は下げておいたほうがいいです。0.0.180 時点で、138本のガイドのうち accessibility カテゴリに属するのは2本です。フォームやHTMLのガイドにもアクセシビリティの記述は混ざっていますし、傘にあたる accessibility ガイドは7,131トークンとかなり厚い。ただ「入れたからアクセシビリティは片付いた」と言える根拠は、私の計測からは出てきませんでした。'
  - question: '構造化データや canonical のような検索まわりの作業も助けてくれますか。'
    answer: '私が投げた6件のクエリの範囲では、助けてくれませんでした。"canonical link tag for duplicate pages" と "sitemap and robots.txt for a static site" は結果0件。"add JSON-LD structured data for local business" は built-in-ai カテゴリの無関係なガイドが類似度0.357で1本返ってきただけです。検索・構造化データはこのコーパスの範囲外です。'
  - question: 'Baseline のターゲットはどこにどう書きますか。'
    answer: 'AGENTS.md か CLAUDE.md に、プロジェクトのブラウザサポート方針を文章で書けば通ります。スキル側が決めたフォーマットはありません。何も書かなければ Baseline Widely available が既定値で、「Baseline 2024」のような年ターゲットを使う場合は、機能の Baseline since の日付がその年以下なら満たすと判定されます。'
  - question: 'インストールするとプロジェクトに何が残りますか。テレメトリは。'
    answer: '.agents/skills/modern-web-guidance/ の下に1.2MB・140ファイルが入り、ルートに skills-lock.json ができます。Claude Code はシンボリックリンクで繋がります。テレメトリは既定で有効で、検索クエリ・ガイドの取得・インストールが匿名統計として収集されます。DISABLE_TELEMETRY=1 で無効化できます。'
relatedPosts:
  - slug: act-rules-axe-coverage-wcag-sc-2026
    score: 0.86
    reason:
      ko: 도구가 스스로 밝히지 않는 사정거리를 목록으로 만들어 확인한다는 점에서 같은 작업이다. 그때는 axe 규칙과 성공기준을 맞춰봤고 이번엔 에이전트 스킬의 카테고리를 세어봤다.
      ja: ツールが自ら明かさない射程を一覧にして確かめる、という意味では同じ作業だ。あのときはaxeのルールと達成基準を突き合わせ、今回はエージェントスキルのカテゴリを数えた。
      en: Same job in a different costume — build the inventory a tool never prints about itself. That post matched axe rules to success criteria; this one counts an agent skill's categories.
      zh: 都是同一件事：把工具自己不会说明的射程列成清单。那篇比对的是 axe 规则和成功标准，这篇数的是 agent skill 的分类。
  - slug: localbusiness-structured-data-server-side-vs-js-2026
    score: 0.78
    reason:
      ko: 이번 코퍼스에 통째로 빠져 있던 영역이 바로 이 글의 주제다. JSON-LD를 서버에서 내보낼지 클라이언트에서 붙일지는 에이전트가 대신 판단해주지 않으니 규칙으로 적어둬야 한다.
      ja: 今回のコーパスからまるごと抜けていた領域が、この記事の主題そのものだ。JSON-LDをサーバーで出すかクライアントで足すかは、エージェントが代わりに判断してくれない。だから規則として書いておく。
      en: The domain missing from the whole corpus is exactly what that post covers. Whether JSON-LD ships from the server or gets bolted on client-side is not a call the agent will make for you.
      zh: 这次整个语料库缺席的领域，正是那篇文章的主题。JSON-LD 从服务端输出还是客户端补，agent 不会替你决定，得写成规则。
  - slug: reflow-1410-400-zoom-viewport-height-2026
    score: 0.71
    reason:
      ko: 이번 22개 질의 중 "reflow at 400% zoom"이 성능 카테고리 가이드로 새어나갔다. 그 질문에 실제로 필요한 답은 그때 직접 재서 쓴 이 글 쪽에 있다.
      ja: 今回の22件の質問のうち「reflow at 400% zoom」はパフォーマンス系のガイドに流れていった。その問いに本当に要る答えは、あのとき自分で測って書いたこちらにある。
      en: One of the 22 probe queries, "reflow at 400% zoom", drifted into a performance guide. The answer that query actually needs is in that post, measured by hand.
      zh: 这次 22 条查询里，「reflow at 400% zoom」漂到了性能类指南上。那条查询真正需要的答案，在那篇自己实测的文章里。
  - slug: anthropic-agent-skills-standard
    score: 0.64
    reason:
      ko: 스킬이라는 포맷 자체가 어떻게 생겼는지 먼저 보고 오면, SKILL.md 한 장이 에이전트의 행동 범위를 어떻게 규정하는지가 훨씬 빨리 읽힌다.
      ja: スキルというフォーマットそのものを先に見ておくと、SKILL.md一枚がエージェントの行動範囲をどう規定するのかが格段に速く読める。
      en: Read up on the skill format first and a single SKILL.md stops looking like documentation and starts looking like a scope contract.
      zh: 先看清 skill 这个格式本身，再回头读 SKILL.md，就很容易看出一张文件是怎么框定 agent 行为范围的。
  - slug: wcag22-target-size-audit-2026
    score: 0.58
    reason:
      ko: '"minimum target size for touch controls" 질의가 css 가이드로 떨어진 이유를 알고 싶다면, 그 기준이 실제로 무엇을 요구하는지 픽셀로 확인한 이 글이 대조군이 된다.'
      ja: 「minimum target size for touch controls」の質問がcssガイドに落ちた理由を知りたければ、その基準が実際に何を要求するのかをピクセルで確かめたこの記事が対照になる。
      en: If you want to know why "minimum target size for touch controls" landed on a css guide, that post is the control — it measures in pixels what the criterion actually demands.
      zh: 想知道「minimum target size for touch controls」为什么落到 css 指南上，那篇用像素核对了这条标准到底要求什么，正好当对照。
---

Chromeチームが I/O 2026 で Modern Web Guidance を出した。コーディングエージェントにウェブプラットフォームの知識を仕込むスキル群で、紹介文には「よりアクセシブルで、パフォーマンスがよく、安全な」ウェブ体験を作れるようになる、とある。インストールは `npx` の一行だ。

その一行を走らせたあと、私が最初にやったのは `list` を叩いてガイドの本数を数えることだった。138本。カテゴリは15。うち accessibility カテゴリに属するのは2本だった。構造化データやクローラビリティを扱うカテゴリは、そもそも一覧に存在しない。

数字そのものが欠点だと言いたいのではない。ただ、あの三語が並んだ紹介文を読んで入れる開発者と、実際のコーパスの重心のあいだには隙間がある。今日はその隙間を測り、隙間をどこに何と書いて埋めるかまで残しておく。

![Modern Web Guidance 0.0.180 のガイド138本をカテゴリ別に数えた横棒グラフ。ui-behaviors 29本、performance 24本、visual-design 16本と続き、accessibility は2本、検索・構造化データのカテゴリは0本](../../../assets/blog/modern-web-guidance-agent-skill-coverage-2026/hero.png)

## エージェントスキルは機能ではなく、射程の宣言である

先に言葉を揃えておく。エージェントスキルとは、コーディングエージェントが特定の作業に出くわしたときに開く指示書の束だ。核になるのは `SKILL.md` 一枚で、そこに「いつ開くか」と「開いたら何をするか」が書かれる。エージェントは作業のたびにこのトリガー説明を読み、発動するかどうかを自分で決める。つまりスキルを入れるという行為は、道具を足すというより、エージェントの判断に線を一本引くことに近い。

Baseline のほうも押さえておく。Baseline は、あるウェブ機能が主要ブラウザで十分に安定して使える状態かどうかを示す web.dev の分類だ。段階は大きく二つ。主要エンジンすべてに入ったばかりの状態が Newly available、そこから十分な期間が経って事実上どこでも安全になった状態が Widely available。フロントエンドで「これ、もう使っていいのか」に答えるには、結局このデータを見ることになる。

Modern Web Guidance はこの二つを繋いだものだ。[Chrome for Developers のドキュメント](https://developer.chrome.com/docs/modern-web-guidance)の定義を原文のまま引く。

> Modern Web Guidance is a set of skills that embed web platform expertise, best practices, and browser compatibility data directly into your coding agents.

Baseline との連動については [I/O 2026 の発表記事](https://developer.chrome.com/blog/chrome-at-io26)にある。これも原文だ。

> It integrates directly with Baseline, letting you focus on what you want to build while your tools automatically figure out the right features and fallbacks to use within your chosen Baseline target.

狙いははっきりしているし、方向としては正しいと思う。モデルの重みに焼き付いた2019年ふうのCSS慣用句を毎回手で剥がすより、最新の互換性データを作業のその場で注入するほうが構造的に筋がいい。問題は、注入される知識の地図がどんな形をしているかだ。地図に載っていない土地では、エージェントは相変わらず重みに頼って答える。しかもそのことを利用者に告げない。

## インストールで何がプロジェクトに入るのか

npm レジストリ上、このパッケージの初公開は2026年4月30日。8月3日までに96バージョンが出ている。三日に一度のペースだ。私が測った時点の最新は 0.0.180、ライセンスは Apache-2.0、展開サイズは36.6MBで198ファイル。初期プレビューの 0.0.x であることは差し引いて読む必要がある。

空のディレクトリでインストールを走らせた。

```bash
npx modern-web-guidance@latest install
```

インストーラは対話画面を出し、対象エージェントを判別してくれる。結果はこうだ。

```
✓ ./.agents/skills/modern-web-guidance
  universal: Amp, Antigravity, Antigravity CLI, Codex, Cursor +12 more
  symlinked: Claude Code
```

`.agents/skills/modern-web-guidance/` の下に1.2MB・140ファイル。ルートには `skills-lock.json` ができる。Claude Code はシンボリックリンク経由だ。ガイドはすべて素のMarkdownなので、開けばそのまま読める。ここは気に入っている。エージェントが何を読んでそう答えたのか、人間があとから追える。

インストールの最後にテレメトリの告知が出る。[リポジトリのREADME](https://github.com/GoogleChrome/modern-web-guidance)の文をそのまま引く。

> Google collects anonymous usage statistics (such as search queries, guide retrievals, and installation) to improve the reliability, relevance, and performance of the tool.

検索クエリが収集対象として明記されている点が重要だ。社内リポジトリで回すエージェントなら、クエリ文字列にプロジェクトの文脈が混ざりやすい。切る手段は環境変数ひとつ。

```bash
export DISABLE_TELEMETRY=1
```

インストーラの画面にサードパーティのセキュリティ評価が併記されることも書いておく。私の実行では Socket が 0 alerts、Snyk が Med Risk と出た。これはサードパーティスキャナの判定であってGoogleの公式評価ではないし、私も判定根拠までは追っていない。参考値として扱うのが妥当だろう。

## 138本はどこに寄っているのか

`list` コマンドは全ガイドをJSONで吐く。カテゴリ別に数えると、こう割れる。

| カテゴリ | ガイド数 |
|---|---|
| ui-behaviors | 29 |
| performance | 24 |
| visual-design | 16 |
| forms | 15 |
| css | 14 |
| ui-atoms | 9 |
| js | 8 |
| security | 7 |
| built-in-ai | 4 |
| ui-components | 4 |
| webmcp | 3 |
| accessibility | 2 |
| css-layout | 1 |
| html | 1 |
| privacy | 1 |
| 検索・構造化データ | 0 |

上位5カテゴリで98本、全体の71%。画面に見えるものを作る作業にコーパスが寄っている。

ここは公平に言っておきたい。accessibility が2本という数字は、アクセシビリティ記述の総量ではない。その2本のうち傘にあたる `accessibility` は7,131トークンで、全体で三番目に大きい文書だ。目次はナビゲーション構造、セマンティックHTMLとARIA、アクセシブルな名前、文書メタデータと言語、キーボードとフォーカス管理、代替テキストとメディアへと続く。フォーム系15本にも、ラベルや自動入力まわりのアクセシビリティが混ざっている。だから「アクセシビリティが2本しかない」はカテゴリラベルの話であって、中身の話ではない。

それでも構造の差は残る。UI側は「この状況にはこの機能」という細い単位のガイドが29本敷かれていて、アクセシビリティは厚い総論一枚に細部が畳み込まれている。エージェントが検索で細い答えを拾い上げる仕組みでは、この差が結果に出る。

コーパスが覆っている領域の質も、別に評価しないとフェアではない。performance の `optimize-image-priority` を開いてみた。結論から言うと、いい。よくある「LCP画像に `fetchpriority="high"` を付けましょう」で止まっていない。

```
4. **Optimize lazy loading**: Never use `loading="lazy"` on the LCP image.
   For standard below-the-fold images, `loading="lazy"` is sufficient...
   Avoid adding `fetchpriority="low"` to these images, as you want them to
   load at normal priority once the user scrolls to them.
```

折り返しより下の通常画像と、折り返しより上にはあるが最初は見えない画像（カルーセルの後続スライド、メガメニュー）を分けて別扱いにしろと指示している。実務でよく取り違える箇所で、間違えるとLCPではなく帯域の奪い合いで損をする。この解像度の指示が138本のかなりの部分に入っているなら、この道具が重みより良い答えを返す領域は確かに存在する。問題はその領域の境界がどこかだ。

## 同じ道具に、三種類の質問を投げた

というわけで突いてみた。UI/CSS 6件、アクセシビリティ10件、検索・構造化データ6件、計22件のクエリを `search` に投げ、上位結果の類似度と件数を記録した。クエリは実際の作業指示のように英語の平文で書いた。英語コーパスなので、英語で訊くのはこの道具に有利な条件である。

```bash
npx modern-web-guidance@0.0.180 search "add JSON-LD structured data for local business"
```

```json
[{"id":"language-model","description":"...","category":"built-in-ai",
  "tokenCount":1984,"similarity":0.357}]
```

1件。しかもブラウザ内蔵の言語モデルAPIのガイドだ。構造化データとは関係がない。

![22件のクエリの上位類似度を3グループに分けて描いた横棒グラフ。UI/CSSは0.408から0.724、アクセシビリティは0.384から0.641、検索・構造化データは0.357から0.506に分布し、うち2件は結果自体が返らない](../../../assets/blog/modern-web-guidance-agent-skill-coverage-2026/query-probe.png)

グループ別にまとめるとこうなる。

| クエリ群 | 件数 | 上位類似度の平均 | 無応答 |
|---|---|---|---|
| UI/CSS | 6 | 0.643 | 0 |
| アクセシビリティ | 10 | 0.508 | 0 |
| 検索・構造化データ | 6 | 0.267 | 2 |

UI系はきれいに当たる。"custom styled select dropdown" は0.724で `custom-select-picker-layouts` を、"view transition between pages" は0.703で `cross-document-transitions` を掴んだ。6件すべてが自分のカテゴリの中で答えを返している。

アクセシビリティ系は、結果は必ず返るが照準がぶれる。10件のうち、上位5件に accessibility カテゴリのガイドが一度でも入ったのは7件。残る3件が問題だ。"associate a label with a form input" の上位5件はすべて forms の自動入力ガイド、"minimum target size for touch controls" は css の総論、"reflow at 400% zoom without horizontal scroll" は `defer-work-until-scroll-ends` というパフォーマンスのガイドに落ちた。最後のは特に見当違いである。400%拡大のリフローはスクロール性能の問題ではなく、ビューポート寸法の問題だ。[400%拡大で実際に潰れるのは高さのほうだった、と自分で測ったことがある](/ja/blog/ja/reflow-1410-400-zoom-viewport-height-2026)が、その答えはこのコーパスのどこにもない。

検索・構造化データ系は絵柄がまるで違う。"canonical link tag for duplicate pages" と "sitemap and robots.txt for a static site" は結果0件。道具側のしきい値を下回り、何も返らなかったということだ。"render meta description and title tags" はアクセシビリティのガイドを0.378で、"get cited by AI search answers" は言語判定APIのガイドを0.362で咥えてきた。

この計測の限界も書いておく。22件はプローブであってベンチマークではない。クエリの文言を変えれば類似度は動く。しきい値とカットオフは道具側の設定で、私は触っていない。何より、上位が外れたからエージェントが必ず悪いコードを書く、という話ではない。傘のガイドが厚いおかげで、照準がずれても必要な記述がその中に入っている場合がある。READMEに載っている自前の評価（7月6日、129タスク・1,071アサーション）では、codex_cli が57%から84%へ27ポイント、claude_code が52%から87%へ35ポイント上がったとある。これはGoogleの数字で、私はその評価スイートを回していない。

私が測って言えるのは一つだけだ。このコーパスは画面を作る作業に強く、ページが見つかり引用される作業には関与しない。

## Baseline ターゲットはプロジェクトのファイルに一行で書く

ここからはそのまま使える部分だ。インストールされた `SKILL.md`（パッケージ原文、[GoogleChrome/modern-web-guidance](https://github.com/GoogleChrome/modern-web-guidance)）には、ブラウザサポートの判定規則が明記されている。既定値の文をそのまま引く。

> All guides assume <strong>Baseline Widely available</strong> features are safe to use without fallbacks.

何も設定しなければ、エージェントは Widely available だけを無条件に安全とみなし、それ未満の機能にはフォールバックを付ける。プロジェクトがもっと攻めていい状況なら、方針を書く必要がある。フォーマットは決まっておらず、`AGENTS.md` か `CLAUDE.md` に文章で書けばいい。年ターゲットの判定規則も `SKILL.md` にある。Baseline YYYY ターゲットでは、機能の "Baseline since" の日付がその年以下であれば満たすとみなす。

私が使っている形はこれだ。

```markdown
## Browser Support

Baseline target: Baseline 2024.
Newly available の機能は、機能検出を付けるなら許可する。
フォールバックは20行以内・外部依存の追加なしで済むものだけ受ける。
その条件を満たせない場合はフォールバックではなく実装方針を変える。
```

四行書いておけば、エージェントが毎回訊いてくる事態はなくなる。138本のうち74本が本文に Baseline 状態を明記しているので、判定に使うデータはガイドの中にすでに入っている。たとえば画像優先度のガイドにはこんな行が埋まっている。

```
Baseline status for Fetch priority: Newly available.
It's been Baseline since 2024-10-29.
```

呼び出しコストも測った。初回はパッケージのダウンロードで10.7秒。キャッシュが効いてからは3回連続で2.09秒、1.15秒、1.22秒だった。`SKILL.md` が「すべてのHTML/CSS・クライアントJS作業でまず実行」を求めるので、この往復は作業ごとに乗ると見ておくべきだ。コンテキスト側のコストのほうが大きい。検索結果が各ガイドの `tokenCount` を一緒に返してくるのだが、細いガイドは900〜3,000トークン、傘のガイドは css 7,755、accessibility 7,131、performance 5,599 である。傘を二枚開けば1万5千トークンがコンテキストに乗る。悪いと言っているのではない。予算を知って使え、という話だ。

## コーパスが空けた場所に、第二の規約層を置く

肝は、検索で何も見つからなかったときにエージェントが取る態度のほうだ。`SKILL.md` は、結果が薄ければ `list` で全体を眺めろと案内している。だが一覧にも無い主題なら、エージェントに残る結論は「このプロジェクトに関連規約はない」になる。規約がないことは自由と解釈される。そして自由に書かれたJSON-LDはたいていクライアントで挿入され、canonical は抜け、タイトルタグはコンポーネントのどこかで組み立てられる。

だから私は、スキルを入れたリポジトリに第二の規約層を一緒に置く。コーパスが扱わない軸だけを選んで書く。

```markdown
## Search & structured data（スキルのコーパス範囲外 — プロジェクト規約）

- 構造化データはサーバーレンダリングのHTMLに含める。クライアントで注入しない。
- 全ページに self-referencing canonical を入れる。多言語は hreflang の相互参照まで。
- title と meta description はルート定義から値が出ること。コンポーネント内部で組み立てない。
- 本文テキストはJSなしでレスポンスHTMLに存在すること。タブやアコーディオンの中身も同じ。
- JSON-LD を追加・変更したら、スキーマ検証をCIで回す。

## Accessibility acceptance（自動検査で拾えない項目）

- 新しいオーバーレイは WCAG 2.4.11 で判定する。Shift+Tab の逆方向まで確認する。
- インタラクティブ要素は 2.5.8 の 24x24 CSS px を幅・高さの両方で満たすこと。
- 320x200 のビューポートで二次元スクロールが発生しないこと（1.4.10）。
- 上の三つは axe の合否と無関係に、別途確認する。
```

二つ目のブロックの項目は適当に選んだのではない。私の22件のうち照準が外れたものと、きれいに重なっている。自動検査ツールがどの達成基準を実際に判定しているのか、[axeのルールとWCAGの達成基準を突き合わせて一覧にしたことがある](/ja/blog/ja/act-rules-axe-coverage-wcag-sc-2026)。そのとき得た教訓がここでそのまま効く。道具は自分に見えない領域を教えてくれない。その一覧は人間が作って貼るものだ。

構造化データ側の一行目も好みの問題ではない。[LocalBusiness マークアップをサーバーサイドで出す場合とJavaScriptで足す場合で実際に何が変わるかを測った記事](/ja/blog/ja/localbusiness-structured-data-server-side-vs-js-2026)の結論を、規約の一文に圧縮したものだ。

## 導入前、30分で終わる確認手順

入れるなという話ではない。私は入れたし、使い続けるつもりだ。ただ入れる前に、次の五つは自分で確かめたほうがいい。全部で30分あれば終わる。

1. `npx modern-web-guidance@latest list` を走らせ、<strong>自分のチームが実際にやっている作業</strong>のカテゴリが一覧にあるか数える。無ければ、その領域は最初から期待から外す。
2. 直近スプリントの実際の作業指示を5件、そのまま `search` に投げる。類似度0.5未満が半分を超えるなら、この道具はそのチームの主戦場にまだ合っていない。
3. `AGENTS.md` か `CLAUDE.md` に Baseline ターゲットの一文を入れる。入れないなら、既定値が Widely available であることをチーム全員が知っている必要がある。
4. コーパスに無い軸（検索・構造化データ、自動検査の外側のアクセシビリティ）をプロジェクト規約として書く。上のブロックを写して、自分の事情に合わせて削ればいい。
5. 組織の方針でクエリ文字列の外部送信が引っかかるなら、`DISABLE_TELEMETRY=1` をシェルのプロファイルに入れ、チームに周知する。

ひとつ、まだ答えが出ていない。この種のスキルが増えたとき、エージェントは「検索したが無い」をどう扱うべきなのか。いまは無ければ黙って重みに戻る。無いという事実自体を利用者に報告して止まるほうがいい作業も確実にあるのに、その区別をスキルという形式が表現する手立ては、まだ見当たらない。

エージェントに何を任せ、何を規約で縛るか。これは結局コードより合意の問題だ。その合意文書を一緒に書く必要があるなら、[問い合わせページ](/ja/contact/)を開けてある。

---

*出典: Chrome for Developers の [Modern Web Guidance](https://developer.chrome.com/docs/modern-web-guidance)、[Get started](https://developer.chrome.com/docs/modern-web-guidance/get-started)、[15 updates from Google I/O 2026](https://developer.chrome.com/blog/chrome-at-io26)、GoogleChrome/[modern-web-guidance](https://github.com/GoogleChrome/modern-web-guidance) リポジトリのREADME、web.dev の [Baseline](https://web.dev/baseline)（すべて公式）。本文中の英文引用3件（定義文、Baseline連動の文、フォールバック既定値の文）は、それぞれ上記ドキュメントおよびインストールされた `SKILL.md` の原文とその場で照合して引き、引用のそばに出典を置いた。計測環境: modern-web-guidance 0.0.180、Node 22.22、macOS、使い捨てのサンドボックスディレクトリ、2026年8月10日計測。ガイド一覧の生データは `data/mwg-guide-list.json`、22件のクエリ結果は `data/mwg-query-probe.json`、クエリスクリプトは `scripts/probe-modern-web-guidance.mjs`、グラフ生成は `scripts/chart-modern-web-guidance.py`。22件はプローブでありベンチマークではなく、クエリの文言によって結果は変わる。READMEに載る27〜35ポイントの改善値はGoogleが公開した自己評価であり、私が再現したものではない。カテゴリ数は道具が付けたラベルに基づくもので、他カテゴリのガイド内に混ざるアクセシビリティ記述の分量は数えていない。*
