---
title: 'FAQPageのリッチリザルトは終わった。それでもQ&Aマークアップを消すな'
description: Googleが2026年5月7日にFAQリッチリザルトを完全終了した。オフライン検証器でFAQPage JSON-LDを測るとスキーマは通るのにリッチリザルトはDEPRECATEDと返る。検証通過と露出が分かれたこの地点で、Web開発者がコードとコンテンツをどう変えるべきかを公式文書に沿って整理した。
pubDate: '2026-07-25'
heroImage: ../../../assets/blog/faqpage-deprecation-ai-citation-2026/hero.png
tags:
  - SEO
  - 構造化データ
  - JSON-LD
  - GEO
  - AIO
relatedPosts:
  - slug: restaurant-jsonld-opening-hours-validation-2026
    score: 0.72
    reason:
      ko: 저 글은 Restaurant JSON-LD가 검증기를 통과해도 값이 엉터리일 수 있다는 걸 쟀고, 이 글은 검증을 통과해도 리치 결과가 안 나오는 경우를 다룬다. "통과 ≠ 목적 달성"이라는 같은 함정의 두 얼굴이다.
      ja: あちらはRestaurant JSON-LDが検証を通っても値が出鱈目でありうると測った記事、本記事は検証を通ってもリッチリザルトが出ない場合を扱う。「通過≠目的達成」という同じ罠の裏表だ。
      en: That post measured how Restaurant JSON-LD can pass validation while holding garbage values; this one covers markup that passes validation yet produces no rich result. Two faces of the same "valid ≠ done" trap.
      zh: 那篇测的是Restaurant JSON-LD即便通过校验、值也可能是错的；本文讲的是通过校验却拿不到富媒体结果。同一个"通过≠达标"陷阱的两面。
  - slug: validate-structured-data-ci-jsonld-2026
    score: 0.68
    reason:
      ko: CI에서 JSON-LD를 자동 검증하는 파이프라인을 만들었다면, 그 게이트가 "스키마 유효성"만 보고 "실제 노출 가치"는 못 본다는 이 글의 지적이 바로 다음 질문이다.
      ja: CIでJSON-LDを自動検証するパイプラインを組んだなら、そのゲートが「スキーマ有効性」だけ見て「実際の露出価値」を見ないという本記事の指摘が次の問いになる。
      en: If you built a CI pipeline that auto-validates JSON-LD, this post's point — that the gate checks schema validity but not real-world value — is your next question.
      zh: 如果你已经搭好CI里自动校验JSON-LD的流水线，那么本文的提醒——门禁只看"schema有效性"却看不到"实际曝光价值"——正是下一个问题。
  - slug: robots-snippet-controls-ai-overviews-2026
    score: 0.6
    reason:
      ko: 리치 결과가 사라진 자리를 AI Overviews가 채우는 흐름이라면, 스니펫과 AI 노출을 robots 지시로 통제하는 저 글이 이 글의 GEO 파트와 짝을 이룬다.
      ja: リッチリザルトが消えた場所をAI Overviewsが埋める流れなら、スニペットとAI露出をrobots指示で制御するあの記事が本記事のGEOパートと対になる。
      en: If AI Overviews are filling the space rich results left behind, that post on controlling snippets and AI exposure via robots directives pairs with this article's GEO section.
      zh: 如果AI Overviews正在填补富媒体结果退场后的空位，那篇用robots指令控制摘要与AI曝光的文章，正好与本文的GEO部分配套。
  - slug: structured-data-syntax-comparison-jsonld-microdata-rdfa-2026
    score: 0.55
    reason:
      ko: FAQPage를 어떤 문법으로 넣든(JSON-LD/Microdata) 리치 결과 종료는 동일하게 적용된다. 문법 선택을 다룬 저 글과 함께 읽으면 "어떻게 넣나"와 "넣어서 뭐가 남나"가 이어진다.
      ja: FAQPageをどの構文で入れても(JSON-LD/Microdata)リッチリザルト終了は同じく適用される。構文選択を扱ったあの記事と併読すると「どう入れるか」と「入れて何が残るか」が繋がる。
      en: Whatever syntax you use for FAQPage (JSON-LD or Microdata), the rich-result shutdown applies equally. Read alongside that syntax-comparison post to connect "how to mark up" with "what's left after you do."
      zh: 无论用哪种语法写FAQPage（JSON-LD还是Microdata），富媒体结果的关停同样适用。与那篇讲语法选择的文章合读，就把"怎么写"和"写了还剩什么"串起来了。
---

いまだに多くのサイトがFAQPage JSON-LDを仕込み、検索結果にアコーディオンが開くのを待っている。2026年の今、そのアコーディオンは出ない。Googleが2026年5月7日をもってFAQリッチリザルトの表示を完全に停止したからだ。

とはいえ「ならFAQPageマークアップを全部消せ」が正解だとは、私は思わない。リッチリザルトが死んだことと、Q&A構造が無用になったことは別の問題だ。本記事はその二つを切り分ける記録である。オフライン検証器でFAQPageを実際に走らせ、「スキーマは通るのに露出はない」地点を目で確かめ、公式文書を根拠に、今コードとコンテンツをどう手入れすべきかを整理した。

## FAQPageとQAPage、そもそも何が違ったのか

まず土台から。読者が構造化データを初めて触ると仮定して書く。

構造化データとは、人間が読むHTMLの上に、機械が読むための意味情報を別に載せるものだ。schema.orgがその語彙を定め、たいていは `<script type="application/ld+json">` ブロックでページに入れる。検索エンジンはこのヒントを参考に、検索結果へ特別な見た目(リッチリザルト)を作ってくれることがある。肝は「作ってくれることがある」であって「作ってくれる」ではない。この差が本日の論点のすべてだ。

FAQPageはそのうち「一つの質問に、発行者が定めた一つの公式回答」が並ぶページを表す。製品ヘルプ、料金案内、配送ポリシーのページが典型だ。いとこ分のQAPageは性格が違う。ユーザーが回答を複数つけ、その一つが採用されるコミュニティ型ページ、つまりフォーラムやQ&A掲示板向けである。発行者の単一回答ならFAQPage、複数のユーザー回答ならQAPage。この区別は今も有効で、本日終わったのはFAQPage側のリッチリザルトだ。

FAQPage JSON-LDの最小骨格はこうなる。

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "配送は何日かかりますか？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "営業日ベースで2〜3日です。"
      }
    }
  ]
}
```

必須は単純。`FAQPage` の下に `mainEntity` 配列、各項目は `Question` で、`name`(質問文)と `acceptedAnswer`(`Answer` + `text`)を持つ。この骨格自体は2019年の導入以来変わっていない。変わったのは、これを入れたときにGoogleがしてくれる仕事のほうだ。

## 何が起きたのか：2023年の縮小、2026年の終了

GoogleがFAQリッチリザルトに手を入れたのは今回が初めてではない。時系列で押さえる。

2023年8月、Googleは[HowToとFAQリッチリザルトの変更](https://developers.google.com/search/blog/2023/08/howto-faq-changes)を告知した。公式の文はこうだ。FAQリッチリザルトは「よく知られた権威ある政府・医療(government and health)サイト」にのみ表示され、それ以外のサイトには定常的には出なくなる。HowToリッチリザルトはそもそも全廃された。この時点ですでに、大半の一般サイトからFAQアコーディオンは消えていた。

その後、2026年に残りの手続きが完了した。Google公式のchangelogとFAQPage文書に沿って整理するとこうなる。

| 時点 | 何が終了したか |
|---|---|
| 2023-08 | FAQリッチリザルトを政府・医療の権威サイトに限定、HowToを全廃 |
| 2026-05-07 | FAQリッチリザルトがGoogle検索で表示を完全停止(公式文書にサポート終了を明記) |
| 2026-06 | Search Consoleのリッチリザルトレポート・Rich Results Test・検索での見え方フィルターからFAQサポート終了、FAQPage公式文書を削除 |
| 2026-08 | Search Console APIのFAQリッチリザルトデータ対応終了 |

まとめると、もはやどんなサイトでもFAQPage JSON-LDで検索結果のアコーディオンは得られない。検証ツールですらこのタイプをレポートしなくなった。

ここで必ず押さえるべき公式の限界がひとつある。Googleは最初から「構造化データはリッチリザルトも順位も保証しない」と明記してきた。FAQPageの没落は、その原則が極端な形で実現した事例だ。仕様どおり完璧に入れても、表示するかどうかは検索エンジンの一存である。参考までに、ある業界分析(SearchEngineLand、公式ではない)は、2023年の縮小直後にFAQリッチリザルトの露出がSERPの約54%から約17%へ落ちたと集計した。数値そのものは参考値だが、向きは公式の終了と一致している。

## 検証器を通っても露出はない。実際に測った

口先だけで「通っても無駄」と言っても空虚だ。そこで一時サンドボックスで、FAQPage JSON-LDをオフライン検証器に直接かけた。ネットワークなしでschema.orgの必須構造だけを調べる40行ほどのNodeスクリプトである。正常サンプル一つと、わざと壊したサンプル一つを入れた。

検査ロジックの核はこうだ。

```javascript
function validateFaqPage(doc) {
  const errors = [];
  if (doc["@type"] !== "FAQPage") errors.push('@typeが"FAQPage"でない');
  const items = Array.isArray(doc.mainEntity) ? doc.mainEntity : [];
  if (items.length === 0) errors.push("mainEntityにQuestionがない");
  items.forEach((q, i) => {
    if (!q.name?.trim()) errors.push(`mainEntity[${i}] name欠落 — 必須`);
    const a = q.acceptedAnswer;
    if (!a) errors.push(`mainEntity[${i}] acceptedAnswer欠落 — 必須`);
    else if (!a.text?.trim()) errors.push(`mainEntity[${i}] answer.text欠落 — 必須`);
  });
  return errors;
}
```

走らせた結果はこう返ってきた。

```text
[faqpage-sample.jsonld]
  schema-structure   : PASS
  google-rich-result : DEPRECATED (2026-05-07 リッチリザルト表示停止)

[faqpage-broken.jsonld]
  schema-structure   : FAIL
  google-rich-result : DEPRECATED (2026-05-07 リッチリザルト表示停止)
    - mainEntity[0] acceptedAnswer欠落 — 必須
    - mainEntity[1] name欠落 — 必須
```

正常サンプルはスキーマ構造検査を通る(`PASS`)。ところが隣の行は `DEPRECATED` だ。検証器がいくら青信号を灯しても、Google検索がそれをレンダリングする段階はすでに閉じている。これが本記事の一行要約だ。スキーマ有効性と露出価値は別の軸で、CIゲートは前者しか見ない。この死角は、[CIで構造化データを自動検証するパイプライン](/ja/blog/ja/validate-structured-data-ci-jsonld-2026/)を回している人ほど心に留めておくべきだ。ゲートが通ったからといって、トラフィック価値が付くわけではない。検証器が見落とす軸はもう一つある。値そのものが意味を成すか、だ。[飲食店の営業時間マークアップを3層で検証してみると](/ja/blog/ja/restaurant-jsonld-opening-hours-validation-2026/)、`opens: "eleven"` のような値はどの層にも引っかからなかった。

二つ目のサンプルで確かめる点もある。検証器は今も必須フィールドの欠落を正確に捕まえる。つまり構造検査そのものは死んでいない。死んだのは、その後ろに付いていたGoogleのリッチリザルトという報酬だ。この区別が次の判断を分ける。

## では消すか残すか：Googleの公式回答と私の判断

いちばんよくある質問。「リッチリザルトが終わったのだから、FAQPageマークアップを全部剥がすべきか？」

Googleの公式案内は明快だ。わざわざ削除する必要はない、という。使われていない構造化データは検索に問題を起こさないが、目に見える効果もない。つまり残しても害はなく、消しても損はない。純粋にGoogleのリッチリザルトだけで見れば、FAQPage JSON-LDはもはや中立的な死んだコードだ。

私なら新規ページには、Googleのために新しくFAQPage JSON-LDを手間をかけて入れることはしない。視覚的報酬がゼロのマークアップを、保守対象として増やす理由がない。逆に既存サイトにすでに大量に埋まっているなら、それを剥がす大掛かりな移行も急がない。Googleが問題ないと明言したし、削除作業そのものが回帰リスクを生む。正直これは「積極的に何もしないのが最善」という珍しいケースだ。

ただし条件が付く。消すなというのはJSON-LDブロックの話であって、その中に入っているQ&Aコンテンツ自体はまったく別の運命をたどる。むしろこれから、より重みを増す。

## リッチリザルトが死んだ場所を、AIが読む

ここからが、私がこの記事を書いた本当の理由だ。

FAQリッチリザルトが消えた検索結果の画面を、AI Overviewsをはじめとする生成的な回答が急速に埋めている。そしてAI回答エンジンがページから情報を抜き出すやり方は、Googleのリッチリザルトとは根本的に違う。リッチリザルトはJSON-LDという別チャネルを読んでいた。一方、大半のAIクローラーは[レンダリングされた実際のHTML本文](/ja/blog/ja/ai-crawlers-dont-render-javascript-csr-2026/)から意味を抽出する。ここで「質問 → その場で完結する短い回答」というパターンは、機械が引用するのにいちばん都合がいい形だ。ただし、その引用枠にどこまで出るかはマークアップだけでは決まらない。[`max-snippet`や`nosnippet`といったロボット向けスニペット制御がAI Overviewsにどこまで効くのか](/ja/blog/ja/robots-snippet-controls-ai-overviews-2026/)も併せて確認しておいたほうがいい。

つまりFAQPageで本当の資産だったのは、JSON-LDの型名ではなく、それを書かせた規律のほうだった。明確な質問文と、その場で完結する簡潔な回答。この規律をJSON-LDに閉じ込めず、目に見えるセマンティックHTMLへ引き出すのが今の正解だと私は見る。具体的にはこうする。

- 質問は本物の見出し要素(`<h2>`/`<h3>`)か定義リスト(`<dl><dt>`)としてマークアップする。AIクローラーが本文から直接読む。
- 回答はその質問の直後、一段落の中で自己完結させる。「上で説明したように」のように文脈に依存する回答は、抽出単位に切られた瞬間に崩れる。
- 一問一答。発行者の単一の公式回答というFAQPage本来の性格を、コンテンツの次元で保つ。

ただし正直に限界を刻む。AIエンジンがこうした構造を実際により引用しやすいというのは、私の実務判断と複数の観察の総合であって、Googleが保証した公式数値ではない(参考値、公式ではない)。AI Overviewsの選択ロジックは非公開で、私は順位アルゴリズムの内部を断定しない。断定できるのは一つ。機械が読むチャネルがJSON-LDからレンダリング本文へ移った以上、投資先もそちらへ移すのが合理的だ、ということだ。

## まとめ：FAQマークアップを前に、今下す判断

核を一行に縮めるとこうだ。Googleのリッチリザルトを狙ったFAQPage JSON-LDは終わったが、Q&Aというコンテンツ構造はAI時代にむしろ値上がりする。

すぐ使えるチェックリストで閉じる。

- **新規ページ**：Googleのリッチリザルト目的のFAQPage JSON-LDは新たに入れない。視覚的報酬がゼロ。
- **既存のJSON-LD**：急いで剥がさない。Google公式で無害、削除のほうが回帰リスク。Bing等の他エンジンやschema.org完結性のためなら残してよい。
- **Q&Aコンテンツ**：JSON-LDの中に隠さず、`<h2>`・`<dl>` などレンダリングされるセマンティックHTMLで露出する。ここがAIクローラーの読むチャネルだ。
- **回答の形**：質問の直後で自己完結させる。文脈依存の回答は抽出時に壊れる。
- **検証ゲート**：CIのスキーマ検証は「構造の有効性」しか保証しない。「露出・引用の価値」は別軸だとチームに明示する。
- **期待値の管理**：構造化データは順位も露出も保証しない(Google公式)。FAQPageがその生き証人だ。

構造化データをサーバーサイドで確実に出力すること、あるいはリッチリザルト終了・AI引用の流れに合わせて既存サイトのQ&A構造とスキーマを点検することを、個人的に相談・実装依頼として受けている。今あるマークアップのうち何を残し、何をコンテンツへ引き上げるかの判断が要るなら、プロフィールの連絡先から声をかけてほしい。
