---
title: 統合RSSの1,248件に言語表示がゼロだった話
description: W3Cが2026-07-16に公開した文字列の言語・方向メタデータ草案。その基準で四言語ブログを監査したら、統合RSS 1,248件が言語表示なしで配信されていた。first-strong推定が14件中4件外れる実測、dc:languageでの修正、回帰を止めるビルドゲートまで。
pubDate: '2026-07-20'
heroImage: ../../../assets/blog/string-lang-dir-metadata-multilingual-web/audit-summary.png
tags:
  - i18n
  - w3c
  - web-development
relatedPosts:
  - slug: hreflang-reciprocity-audit-multilingual-2026
    score: 0.84
    reason:
      ko: "저 글은 페이지끼리의 언어 관계(hreflang)를 감사했다. 이 글은 한 단계 더 안쪽, 페이지가 실어 나르는 문자열 자체에 언어 표시가 붙어 있는지를 잰다. 같은 사이트, 같은 감사 루프의 다음 층이다."
      ja: "あちらはページ間の言語関係(hreflang)の監査。本稿はもう一段内側、ページが運ぶ文字列そのものに言語表示が付いているかを測る。同じサイト、同じ監査ループの次の層。"
      en: "That post audits the language relationship between pages (hreflang). This one goes a layer deeper: whether the strings those pages carry declare their own language. Same site, next floor of the same audit loop."
      zh: "那篇审计的是页面之间的语言关系（hreflang）。本文再往里一层，测的是页面所承载的字符串本身有没有标出语言。同一个站点，同一条审计回路的下一层。"
  - slug: json-ld-graph-entity-linking-2026
    score: 0.78
    reason:
      ko: "@graph로 구조화 데이터를 하나로 묶은 그 글의 결과물이 이번 감사 대상이었다. 왜 그 @context에 @language를 넣지 않기로 했는지, 판단 근거가 이 글에 있다."
      ja: "@graphで構造化データを一つに束ねた、あの記事の成果物が今回の監査対象だった。なぜその@contextに@languageを入れないと決めたのか、その判断根拠が本稿にある。"
      en: "The @graph consolidation from that post is exactly what I audited here. Why I decided against adding @language to that @context is spelled out in this one."
      zh: "那篇把结构化数据用@graph合并的成果，正是本次审计的对象。为什么我决定不给那个@context加@language，理由写在本文里。"
  - slug: multilingual-blog-technical-audit-campaign-2026
    score: 0.75
    reason:
      ko: "'측정 → 최대 항목 수정 → 게이트로 상설화' 루프를 닷새간 돌린 기록이 저 글이다. 이 글은 그 루프를 한 번 더 돌린 결과이고, 이번에 추가된 게이트는 postbuild에 그대로 붙었다."
      ja: "「測る→一番効く箇所を直す→ゲートで常設化」のループを五日間回した記録があちら。本稿はそのループをもう一周した結果で、今回追加したゲートはpostbuildにそのまま繋いだ。"
      en: "That post is five days of running the measure-fix-gate loop. This is one more turn of the same loop, and the gate it produced is now wired into postbuild alongside the others."
      zh: "那篇是把「测量→修最要紧的一项→固化成关卡」这条回路跑了五天的记录。本文是同一条回路的又一圈，这次产出的关卡已经接进了postbuild。"
  - slug: accessible-name-agents-2026
    score: 0.68
    reason:
      ko: "접근성 이름이 틀리면 스크린리더가 엉뚱하게 읽는다는 이야기였다. 언어 표시가 없으면 그 스크린리더가 아예 틀린 언어의 음성 엔진으로 읽는다. 같은 문제의 한 칸 위 계층이다."
      ja: "アクセシブルネームが間違っていればスクリーンリーダーが変な読み方をする、という話だった。言語表示がなければ、そのスクリーンリーダーは そもそも別言語の音声エンジンで読む。同じ問題の一段上の階層。"
      en: "That one was about screen readers announcing the wrong thing when the accessible name is wrong. Without language metadata, the same screen reader reads the text with an entirely wrong voice engine. One layer up from the same problem."
      zh: "那篇讲的是可访问名称错了、屏幕阅读器就会念错。而没有语言标注时，同一个屏幕阅读器会直接用另一种语言的语音引擎去念。是同一问题的上一层。"
---

このブログは統合RSSフィードを一本吐いている。ビルド済みのファイルを開いて数えたら、item は1,248件。日本語も韓国語も英語も中国語も、公開日順に一列に並んでいた。そのXMLのどこにも「この項目が何語なのか」は書かれていない。channel にもない。item にもない。

受け取る側はどうやって判断するのか。文字を見て推測する。それだけだ。

W3C国際化ワーキンググループが2026年7月16日、初期草案を二本まとめて公開した。一本が [Strings on the Web: Language and Direction Metadata](https://www.w3.org/TR/string-meta/)、もう一本が [Character Model for the World Wide Web: String Matching](https://www.w3.org/TR/charmod-norm/)。前者の冒頭はこう始まる。

> This document describes the best practices for identifying the language and direction for strings used on the Web.

つまり、まさに「文字を見て推測する」というあの慣行を正面から狙い撃ちにしている。草案を読んで自分のサイトを同じ基準で測り、一箇所直し、二度と壊れないようにビルドゲートを足した。以下に出てくる数字は全部その過程で出た実際の出力である。

## 文字列はHTMLを出た瞬間に言語を失う

なぜこれが問題になるのか。そこを押さえないと、後半の測定はただのXMLの重箱つつきに見える。

HTMLには `lang` と `dir` がある。`<p lang="ar" dir="rtl">` と書けば、この段落がアラビア語で右から左に読まれるという事実がマークアップの中に固定される。ブラウザはその通りにレンダリングし、スクリーンリーダーはアラビア語の音声エンジンを選び、検索エンジンは言語を判定する。マークアップ言語は拡張可能な属性を最初から持っていたので、こういう付帯情報を載せる場所があった。

ところが今のウェブで文字列が通る経路はHTMLだけではない。JSON API のレスポンス、JSON-LD の構造化データ、RSS/Atom のフィード、WebIDL のインターフェース定義、設定ファイル。この手のデータ言語はおおむね「文字列は文字列でしかない」という前提で設計されている。`{"title": "..."}` には、その title が何語かを書く欄がない。草案の言い方を借りれば、JSON や WebIDL のような非マークアップのデータ言語は一般に拡張可能な属性を提供せず、言語や方向のメタデータを内蔵するという発想自体が設計に入っていなかった。

だから文字列がHTMLを離れてJSONに載った瞬間、言語と方向は静かに蒸発する。CMSからAPIへ、APIからフロントエンドへ、そこからまたHTMLへ戻ってくるまでの間、誰もそれを持ち歩かない。最後にレンダリングする側に残された手は一つしかない。文字を見て推測すること。

草案の要求は明快だ。

> For any string field containing natural language text, it *MUST* be possible to determine the language and string direction of that specific string. Such determination *SHOULD* use metadata at the string or document level and *SHOULD NOT* depend on heuristics.

MUST と SHOULD NOT が同じ段落に並んでいる。判定できることは必須、しかし推測で判定するのは避けろ。この二つを同時に満たすには、文字列にメタデータを付けて運ぶしかない。

## 草案が具体的に何を勧めているか

要求だけ読んでも手は動かない。草案は具体的な形もいくつか挙げている。

単一言語のフィールドには `{value, lang, dir}` の三つ組。文字列そのものだけでなく、その言語タグと方向を同じオブジェクトに同居させる。ドキュメントレベルで `language` / `direction` の既定値を置くこともできるが、条件が付く。文字列レベルのメタデータがドキュメントレベルの既定を必ず上書きできること。これは MUST だ。既定値は便利だが、逃げ道のない既定値は毒になる。

複数言語版を持つフィールドには言語タグをキーにした language map。方向は `ltr` / `rtl` / `auto` のちょうど三値に限定される。増やさない。JSON-LD なら `@context` に `@language` と `@direction` を書く形が示されている。

そしてこれも引用しておくべきだろう。

> This is a draft document and may be updated, replaced, or obsoleted by other documents at any time. It is inappropriate to cite this document as other than a work in progress.

FPWD、つまり最初の公開草案である。フィールド名も推奨内容も変わりうる。この草案に厳密に合わせて新しいAPIスキーマを設計するのは、正直まだ早い。ただし「文字列に言語メタデータを添える」という発想自体は草案より前から存在していて、今やっても損はしない。この温度差は最後にもう一度書く。

## first-strongを14件で殴ってみた

草案が名指しで問題視するのが、方向の自動推定。`dir="auto"` が使う first-strong ルールだ。文字列を頭から走査して最初に見つかった強い方向性を持つ文字の向きを、文字列全体の向きとして採用する。

草案はこう書いている。

> The main problem with this approach is that it produces the wrong result for (1) strings that begin with a strong character with a different directionality than that needed for the string overall (eg. an Arabic tweet that starts with a hashtag) (2) strings that don't have a strong directional character (such as a telephone number), which are likely to be displayed incorrectly in a RTL context.

読んで納得はした。ただ、納得と実感はまるで別の話だ。どのくらい外すのかは手を動かさないと見えてこない。Pythonで first-strong をそのまま実装する。`unicodedata.bidirectional()` が `L` を返せば ltr、`R` か `AL` なら rtl。分離子（LRI/RLI/FSI から PDI まで）の内側は飛ばす。強い文字が一つもなければ既定の ltr。

```python
def first_strong(s):
    depth = 0
    for ch in s:
        if ch in ISOLATE_INIT: depth += 1; continue
        if ch == PDI: depth = max(0, depth-1); continue
        if depth: continue
        b = unicodedata.bidirectional(ch)
        if b == "L": return "ltr"
        if b in ("R","AL"): return "rtl"
    return "ltr"
```

テスト文字列を14件作り、それぞれに「本来こうあるべき」という方向を自分で宣言してから走らせた。結果は14件中4件の不一致。率にすれば28.6%。

外れた4件はきれいに同じ形をしていた。

- ラテン文字の製品名で始まるアラビア語タイトル。宣言は rtl、推定は ltr
- ASCIIの引用符で始まるヘブライ語文字列。宣言は rtl、推定は ltr
- ラテン文字の @handle で始まるアラビア語の著者名。宣言は rtl、推定は ltr
- アラビア語の単語で始まる英語タイトル。宣言は ltr、推定は rtl

RTLのコンテンツの前にラテン文字が乗っているか、その逆。それだけ。

面白いのはむしろ通った側だった。数字で始まるヘブライ語タイトル、数字始まりのアラビア語UIラベル、絵文字が先頭に来るアラビア語文字列。この三つは全部正しく解決している。数字も記号も絵文字も空白も、強い方向性を持つ文字ではないので飛ばされるからだ。つまり危険なのは「先頭にASCIIがあること」ではなく「先頭に強いラテン文字があること」。ここを取り違えると対策の当てどころを間違える。

正直に線を引いておく。28.6%はこの14件という自作セットの不一致率であって、ウェブ全体の統計ではない。この数字が示しているのは失敗の形であって、失敗の頻度ではない。

## 自分のdist/を数えた結果

草案の基準を持ったまま、ビルド済みの `dist/` に監査スクリプトを当てた。HTMLの `lang` / `dir`、JSON-LDの `@context`、そして全フィードを機械的に数えるだけのものだ。出てきた出力がこれ。

```text
== pages audited == 1248
html[lang] present : 1248/1248
html[dir]  present : 0/1248
== JSON-LD ==
blocks parsed          : 1248  (parse errors: 0)
@context has @language : 0
@context has @direction: 0
blocks containing inLanguage: 1248
== feeds ==
  rss-en.xml    xml:lang=False  <language>=True   items=312
  rss-ja.xml    xml:lang=False  <language>=True   items=312
  rss-ko.xml    xml:lang=False  <language>=True   items=312
  rss-zh.xml    xml:lang=False  <language>=True   items=312
  rss.xml       xml:lang=False  <language>=False  items=1248
```

言語別フィードは問題なかった。4本とも channel に `<language>` が入っている。以前 [hreflangの相互参照を全ページ突き合わせた](/ja/blog/ja/hreflang-reciprocity-audit-multilingual-2026) ときに言語別の出力周りは一通り締めていたので、ここは想定内。

最後の一行が想定外だった。`rss.xml`。全言語を混ぜた統合フィードで、item 1,248件、言語メタデータはゼロ。channel の `<language>` もなく、item ごとの言語表示もない。四つの言語が公開日順に一列で並んで、区別する手がかりが一切ないまま配信されていた。

問題だと考えたことすらなかった。統合フィードは「全部入り」だから言語を書けない、と無意識に処理していたのだと思う。監査スクリプトを回すまで、この行が視界に入らなかった。

## RSS 2.0に無い欄をdc:languageで補う

原因は仕様側にもある。RSS 2.0 には item 単位の言語要素が存在しない。`<language>` は channel の子要素として定義されていて、フィード全体が単一言語である前提で作られている。単一言語のフィードならそれで足りる。混在フィードは想定外。

こういうときに使えるのが Dublin Core だ。`dc:language` は要素単位で置けるので、item の中に入る。`@astrojs/rss` 側も揃っていた。`xmlns` オプションで名前空間を宣言でき、item ごとの `customData` で任意の子要素を差し込める。

```js
return rss({
  title: SITE_TITLE, description: SITE_DESCRIPTION, site: context.site,
  xmlns: { dc: 'http://purl.org/dc/elements/1.1/' },
  items: posts.map((post) => {
    const [lang, ...slugParts] = post.id.split('/');
    const slug = slugParts.join('/');
    return { title: post.data.title, description: post.data.description,
             pubDate: post.data.pubDate, link: `/${lang}/blog/${lang}/${slug}/`,
             customData: `<dc:language>${lang}</dc:language>` };
  }),
});
```

コンテンツのIDが `ko/post-name` の形なので、言語コードは先頭を切り出すだけで取れる。推測は一切していない。ファイルの置き場所という事実をそのまま転記しているだけだ。再ビルドして数える。

```bash
$ grep -o '<dc:language>[a-z]*</dc:language>' dist/rss.xml | sort | uniq -c
 312 <dc:language>en</dc:language>
 312 <dc:language>ja</dc:language>
 312 <dc:language>ko</dc:language>
 312 <dc:language>zh</dc:language>
```

0件から1,248件へ。四言語が312件ずつきれいに揃っているのは、全記事を四言語で並行運用しているから。

期待値の話も先にしておく。`dc:language` はフィードリーダーや、フィードを取り込む側のプログラムのためのものだ。検索順位のシグナルではない。構造化データが理解の助けにはなっても順位を保証するものではない、というGoogleの繰り返しの公式見解とも整合する。今回の修正でアクセスが増えるとは書かない。増えていない。

## 直した箇所より、直したままにする仕掛け

手で直したものは、次のリファクタで静かに消える。何度か経験している。だから監査に使ったスクリプトを `scripts/validate-string-meta.mjs` として残し、`package.json` に繋いだ。

```json
"postbuild": "node scripts/validate-hreflang.mjs && node scripts/validate-string-meta.mjs"
```

書いたら動作確認する。ゲートで一番よくある事故は「常に成功するチェック」を守護神だと思い込むことだ。ビルド済みの `rss.xml` から `dc:language` を意図的に3件削って走らせた。

```text
html[lang]: 1288/1288 pages
per-language feeds: 4 checked
mixed feed rss.xml: 1245/1248 items declare dc:language
❌ string metadata 検証失敗
  - rss.xml: dc:language 1245 / item 1248 — mismatch
exit=1
```

exit code 1。ファイルを元に戻したら通った。落ちることを確認していないゲートは、ゲートではない。以前 [五日間の技術監査キャンペーン](/ja/blog/ja/multilingual-blog-technical-audit-campaign-2026) で「測る→一番効く箇所を直す→ゲートで常設化」というループを回したが、今回はその一周分そのものだ。落とすところまで見て初めて一周が閉じる。

## JSON-LDに@languageを入れなかった理由

草案は JSON-LD の `@context` に `@language` と `@direction` を書くよう勧めている。監査結果を見れば、うちのサイトは該当0件。素直に読めば直すべき箇所だ。実際、書き換え自体は難しくない。

現状の `@context` は `"https://schema.org"` という素の文字列で、その下に `@graph` がぶら下がっている。オブジェクト形式にすれば済む。

```json
{
  "@context": {
    "@vocab": "https://schema.org/",
    "@language": "ko",
    "@direction": "ltr"
  },
  "@graph": [ ... ]
}
```

それでも入れないと決めた。理由は `@graph` の中身にある。あそこにはサイト全体で共有されるエンティティが並んでいて、その文字列はどの言語版でも英語のままだ。`/ko/` のページから実際に取り出したのがこれ。

```json
{"@type": "Organization", "name": "jangwook.net", "description": "Personal technology blog by Kim Jangwook", ...}
```

ドキュメント全体に `@language: "ko"` を宣言した瞬間、この英語の description は韓国語だと主張することになる。無いメタデータより、間違ったメタデータのほうが害が大きい。無ければ受け取る側は慎重に扱う。間違っていれば、そのまま信じられる。

もう一つ。監査ログにある通り、1,248ブロック全部に item 単位の `inLanguage` が入っている。これは記事本体という具体的な対象に紐づいた宣言で、ドキュメント全体の既定値より精度が高い。`@graph` でエンティティを一本に束ねた [あのときの設計](/ja/blog/ja/json-ld-graph-entity-linking-2026) が、結果的にこの判断を可能にしていた。

正しいルートは二つある。グローバルなエンティティの文字列を草案が示す language map の形に書き換えるか、`@context` には触らず item 単位の `inLanguage` に任せるか。今回は後者を選んだ。前者は構造化データの出力層をまるごと組み直す作業になるので、FPWD の段階でフィールド名が動く可能性を考えると、今やる仕事ではない。

## 直さなかったもう一箇所と、読めないものの扱い

`html[dir]` が 0/1248 という数字も、そのまま放置した。理由は単純で、四言語すべてがLTRだからだ。ブラウザの既定は ltr。宣言しなくても描画は正しい。暗黙的ではあるが、間違ってはいない。

ただしRTLの言語版を一つでも足した日、これは本物のバグになる。そのときはゲートに一行ルールが増える。今書かないのは「不要だから」ではなく「まだ不要だから」であって、この区別は自分用のメモとして残しておく価値がある。

もう一つ、能力の限界を明示しておく。私はアラビア語もヘブライ語も読めない。実験1のRTL判定は、Unicodeの文字プロパティを計算した結果であって、ネイティブによるレビューではない。方向解決自体は文字プロパティで機械的に決まるので計算で足りる。しかし画面上の見た目が自然かどうかは、私が保証できる範囲の外にある。ここを曖昧にしたまま「RTL対応を検証した」と書くことはできない。

## 明日の朝から回せる7項目

W3Cが2026年7月16日にFPWDを二本出した。文字列には言語と方向が判定可能な形で付いていなければならず、その判定は推測に頼るべきではない、というのが中身。first-strong推定を自作の14件に当てたら4件外れ、外れ方は全部「RTLの前に強いラテン文字」という同じ形をしていた。自分のサイトを測ったら、統合RSSの1,248件が言語表示なしで出ていた。`dc:language` で1,248件全部に付け、ビルドゲートを足し、わざと壊して落ちることを確認した。JSON-LDの `@context` には手を入れず、その理由も書いた。

自分のサイトで同じことをやるなら、この順番になる。

- 統合フィードや検索インデックスなど、複数言語が一本に混ざる出口を洗い出す。混ぜている場所ほど言語表示が抜けている
- RSS 2.0 の混在フィードには `dc:language` を item ごとに入れる。名前空間の宣言を忘れずに
- 言語コードは推測せずファイルパスやDBの列から取る。推測した瞬間、それは草案が禁じている heuristics になる
- `dir="auto"` に頼っている箇所を探し、RTLコンテンツの先頭にラテン文字が来る可能性を疑う。数字・記号・絵文字は無害、強いラテン文字だけが危険
- 新しいAPIやJSONスキーマを設計するなら、`{value, lang, dir}` の三つ組を検討する。ただしFPWD段階なのでフィールド名は固定しない
- ドキュメントレベルの既定言語は、その文書内の全文字列が本当にその言語であるときだけ宣言する。一つでも別言語が混ざるなら、宣言しないほうが安全
- 検証スクリプトを `postbuild` に繋ぐ。繋いだら意図的に壊して exit code 1 を確認する。ここまでやって初めてゲート

規模の小さい修正だし、順位が上がる類の話でもない。ただ、自分の出力に何が書かれていないかを一度も数えたことがなかった、という事実のほうが気になった。

---

多言語サイトの言語・方向メタデータや構造化データの配線を実際に測り、その結果をCIゲートとして残すところまで、個人で相談・実装を請けている。統合フィードやAPIレスポンスで言語表示が抜けていないか気になる方は、[お問い合わせ](/ja/contact)からどうぞ。
