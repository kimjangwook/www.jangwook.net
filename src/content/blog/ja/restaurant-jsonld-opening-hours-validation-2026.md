---
title: '「L.O. 21:30」はJSON-LDに書けない — 飲食店の営業時間マークアップ、3層検証の実測'
description: 自分で運営する飲食店推薦PWAにRestaurant構造化データを実装した記録。曜日別の平文営業時間をopeningHoursSpecificationへ変換し、同じ欠陥3つを型チェック・スキーマバリデーター・ランタイムゲートに順に流して、どの層が何を捕まえるかを測った。MEOへの効果は公式ドキュメントを引いて正直に線を引く。
pubDate: '2026-07-22'
heroImage: ../../../assets/blog/restaurant-jsonld-opening-hours-validation-2026/hero.png
tags:
  - SEO
  - 構造化データ
  - MEO
  - JSON-LD
  - TypeScript
relatedPosts:
  - slug: localbusiness-structured-data-server-side-vs-js-2026
    score: 0.81
    reason:
      ko: 저 글은 LocalBusiness JSON-LD를 어떤 경로로 내보낼 것인가(SSR vs JS 주입)를 쟀고, 이 글은 그 안에 무엇을 어떻게 담을 것인가를 다룬다. 전달과 내용, 두 글이 한 세트다.
      ja: あちらはLocalBusiness JSON-LDをどう届けるか(SSRかJS注入か)を測った記事で、本記事は中身をどう設計するかを扱う。配信と内容、二つで一組だ。
      en: That post measured how to deliver LocalBusiness JSON-LD (SSR vs JS injection); this one covers what to put inside it. Delivery and payload, two halves of the same problem.
      zh: 那篇文章测的是LocalBusiness JSON-LD该怎么输出（SSR还是JS注入），本文讲的是里面该装什么。传输与内容，两篇正好配成一套。
  - slug: json-ld-graph-entity-linking-2026
    score: 0.63
    reason:
      ko: 개별 페이지의 Restaurant 마크업을 완성했다면, 다음 단계는 사이트 전체의 JSON-LD 노드를 하나의 그래프로 잇는 일이다. 부유 노드가 어떻게 생기고 어떻게 잡는지를 실측했다.
      ja: 個別ページのRestaurantマークアップができたら、次はサイト全体のJSON-LDノードを一つのグラフに繋ぐ番だ。浮遊ノードの発生と検出を実測した記事。
      en: Once a single page's Restaurant markup is done, the next step is linking every JSON-LD node on the site into one graph. That post measured how orphan nodes appear and how to catch them.
      zh: 单页的Restaurant标记完成后，下一步是把全站JSON-LD节点连成一张图。那篇文章实测了游离节点如何产生、如何捕获。
  - slug: axe-core-ci-a11y-jsdom-vs-browser-2026
    score: 0.55
    reason:
      ko: 도구가 무엇을 잡고 무엇을 놓치는지를 계층별로 재서 CI 게이트를 설계한다는 접근이 이 글과 같다. 대상이 a11y 검사기라는 점만 다르다.
      ja: ツールが何を捕まえ何を見逃すかを層ごとに測り、CIゲートを設計するという発想が本記事と同じ。対象がa11yチェッカーである点だけが違う。
      en: Same approach as this article — measure what each tool layer catches and misses, then design the CI gate around the gaps. Only the subject differs, axe-core instead of schema validators.
      zh: 思路与本文一致：逐层测量工具能抓住什么、漏掉什么，再据此设计CI门禁。区别只在对象是a11y检查器。
---

「L.O. 21:30」を構造化データでどう書くか。結論から言うと、書けない。schema.orgの営業時間語彙にラストオーダーに相当するプロパティは存在しないし、Googleのドキュメントも触れていない。日本の飲食店ページでは当たり前に載っている一行が、機械可読の世界には居場所がない。

これは今回、自分のサービスにRestaurant構造化データを実装して初めて体で理解したことの一つだ。実装の過程で、もっと不穏なことも見つけた。閉店時刻に時刻ですらない文字列を入れても、Googleが公開している型定義もschema.org公式バリデーターも、どちらも素通しにする。この記事はその実測記録である。

## grepの結果は0件だった

訪日観光客向けに飲食店を推薦するPWAをサイドプロジェクトとして作り、運営している。SvelteKitベースで、地図と多言語の店舗情報が中心の構成だ。構造化データを整備しようと `ld+json` をgrepしたら、ヒットは0件。飲食店情報のサービスなのにRestaurantマークアップが一行もなかった。他所のサイトの構造化データを測って記事を書いてきた人間として、正直に恥ずかしい結果だ。

サービス内部で営業時間はこう保存されている。

```json
{"monday":"11:00-22:00","tuesday":"11:00-22:00","wednesday":"11:00-22:00",
 "thursday":"11:00-22:00","friday":"11:00-23:00","saturday":"11:00-23:00",
 "sunday":"11:00-21:00"}
```

曜日キーに平文の時間帯文字列。画面表示にはこれで足りる。だがこれは構造化データではなく<strong>表示用の文字列</strong>だ。「今営業中か」を機械が計算するには、opensとclosesが分離された形式が要る。多くの店舗系サービスがこの形から始まるはずだ。最初はそれで十分だから。構造化データが必要になった時点で、この文字列を機械可読形式へ引き戻すコストを払うことになる。そのコストがどこで発生するかを、自分のデータで一つずつ確かめた。

## 土台: openingHoursSpecificationという語彙

変換コードの前に基礎を固めておく。一次情報は[Google Search CentralのLocalBusinessドキュメント](https://developers.google.com/search/docs/appearance/structured-data/local-business)だ。検索結果のナレッジパネルなどに営業時間や所在地を表示する材料として、GoogleはLocalBusiness構造化データを読む。要点を絞るとこうなる。

| 区分 | プロパティ | 備考 |
|---|---|---|
| 必須 | `name`, `address` | この2つがなければ対象外 |
| 推奨 | `geo` | 座標精度は<strong>小数点以下5桁以上</strong> |
| 推奨 | `openingHoursSpecification` | 営業時間の機械可読形式 |
| 推奨 | `priceRange` | 100文字以上だと表示されない |
| 推奨 | `servesCuisine`, `url`, `telephone`, `menu` | 飲食店なら実質全部埋める |

型は `LocalBusiness` ではなく、できるだけ具体的なサブタイプを使えというのが公式ガイドライン。ドキュメント原文が例に挙げているのがまさに `Restaurant` だ。営業時間は `OpeningHoursSpecification` オブジェクトで表し、同じ時間帯の曜日は `dayOfWeek` の配列にまとめる。深夜営業(土曜18:00開店、翌3:00閉店)は一つのオブジェクトに `opens: "18:00", closes: "03:00"` と書き、終日営業は00:00〜23:59、定休日はopensとclosesの両方を "00:00" にする。年末年始のような期間限定の変更は `validFrom`/`validThrough` を付けた別スペックを重ねる。どのパターンも公式ドキュメントに例がある。

先に釘を刺しておくと、このマークアップを入れてもマップの順位は上がらない。その話は限界の節で公式ドキュメントを引用して整理する。

## 平文文字列をスキーマへ運ぶ変換器

変換器はTypeScriptで書き、型にはGoogleが公開している[schema-dts](https://github.com/google/schema-dts) 2.0.0を使った。schema.orgの語彙全体がTypeScriptの型として提供されるパッケージだ。中核は30行ほど。

```typescript
import type { OpeningHoursSpecification, DayOfWeek } from "schema-dts";

const DAY_MAP: Record<string, DayOfWeek> = {
  monday: "Monday", tuesday: "Tuesday", wednesday: "Wednesday",
  thursday: "Thursday", friday: "Friday", saturday: "Saturday", sunday: "Sunday",
};
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export function toOpeningHours(raw: string): OpeningHoursSpecification[] {
  const parsed: Record<string, string> = JSON.parse(raw);
  const groups = new Map<string, DayOfWeek[]>();
  for (const [day, hours] of Object.entries(parsed)) {
    const dow = DAY_MAP[day.toLowerCase()];
    if (!dow) throw new Error(`unknown day key: ${day}`);
    // "11:00-14:00,17:00-22:00" のような中休み営業もカンマで分けて別スペックに
    const ranges = hours.trim().toLowerCase() === "closed"
      ? ["00:00-00:00"] : hours.split(",");
    for (const range of ranges) {
      const key = range.trim();
      (groups.get(key) ?? groups.set(key, []).get(key)!).push(dow);
    }
  }
  return [...groups.entries()].map(([hours, days]) => {
    const [opens, closes] = hours.split("-").map(s => s.trim());
    if (!TIME_RE.test(opens) || !TIME_RE.test(closes))
      throw new Error(`unparseable hours "${hours}"`);
    return { "@type": "OpeningHoursSpecification" as const,
      dayOfWeek: days.length === 1 ? days[0] : days, opens, closes };
  });
}
```

実データを流すと、7曜日が3オブジェクトにまとまった。月〜木 11:00-22:00、金・土 11:00-23:00、日 11:00-21:00。Googleドキュメントの例と同じグルーピングだ。name・address・geoと合わせた最終マークアップがこれになる。

```json
{
  "@context": "https://schema.org",
  "@type": "Restaurant",
  "name": "新宿ラーメン通り",
  "alternateName": "Shinjuku Ramen Street",
  "address": { "@type": "PostalAddress", "streetAddress": "東京都新宿区西新宿1-1-1",
               "addressLocality": "新宿区", "addressRegion": "東京都", "addressCountry": "JP" },
  "geo": { "@type": "GeoCoordinates", "latitude": 35.6919, "longitude": 139.7038 },
  "servesCuisine": "Ramen",
  "priceRange": "$$",
  "url": "https://example.com/restaurants/mock-1",
  "openingHoursSpecification": [
    { "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday"], "opens": "11:00", "closes": "22:00" },
    { "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Friday","Saturday"], "opens": "11:00", "closes": "23:00" },
    { "@type": "OpeningHoursSpecification", "dayOfWeek": "Sunday", "opens": "11:00", "closes": "21:00" }
  ]
}
```

多言語サービスなので店名の扱いも決めた。現地表記(日本語店名)を `name` に、ローマ字表記を `alternateName` に載せる。地図やローカル検索で実際に照合されるのは現地表記だからだ。このマークアップをschema.org公式バリデーターに通した結果はエラー0件、警告0件だった。

出力位置はサーバーサイド一択にした。SvelteKitなら店舗詳細ページのサーバーロードで変換器を回し、`svelte:head` でシリアライズして埋め込む。`JSON.stringify` の後に `<` を `\u003c` へエスケープするのを忘れないこと。店名や説明文に混じった文字がscriptタグを壊すのを防ぐ最低限の防御だ。クライアントサイド注入を避ける理由は[以前の実測](/ja/blog/ja/localbusiness-structured-data-server-side-vs-js-2026/)で確認した通り。生のHTMLに無い構造化データは、レンダリングを省略する収集系には存在しないのと同じである。

## モデルが表現できないもの: 中休み、L.O.、座標精度

変換器の初版は `"11:00-14:00,17:00-22:00"` という中休み入力で例外を投げた。最初はスキーマの限界かと思ったが、違った。schema.orgは<strong>同じ曜日にOpeningHoursSpecificationを2つ</strong>置くことで昼夜二部営業を素直に表現できる。月曜11:00-14:00のオブジェクトと、月曜17:00-22:00のオブジェクト。表現できないのはスキーマではなく、「曜日ごとに文字列一本」で固めた自分の内部モデルの方だった。v2でカンマ分割を入れて解決した。

一方で、本当にスキーマに無いものもある。冒頭のラストオーダーだ。`"11:00-22:00 (L.O. 21:30)"` のように文字列へ押し込んだ情報は、変換時に捨てるか、マークアップ対象外の表示専用情報として残すかの二択になる。自分は後者を選んだ。構造化データには22:00閉店だけを載せ、L.O.は画面表示と `description` に留める。閉店時刻を21:30へ繰り上げて書くのは事実と異なるマークアップなのでやらない。

期間限定の変更は逆で、スキーマ側の支度は整っているのに内部モデルに置き場がないパターンだ。年末年始の休業を公式パターンで書くとこうなる。

```json
{ "@type": "OpeningHoursSpecification",
  "opens": "00:00", "closes": "00:00",
  "validFrom": "2026-12-30", "validThrough": "2027-01-03" }
```

平常時のスペックはそのまま、このオブジェクトを重ねるだけ。「曜日ごとに文字列一本」モデルよりよほど柔軟だ。臨時休業テーブルを内部モデルへ足し、変換器がこのスペックを生成するところまでを次の作業にした。

座標でも一つ引っかかった。Googleは `geo` の精度を小数点以下5桁以上と推奨しているが、手元のデータは全件4桁だった。4桁は約11m、5桁は約1.1mの粒度。東京の路地なら11mは隣のビルだ。変換器に桁数チェックを入れて4桁座標を全部フラグさせた。座標の精度はジオコーディングの時点で決まるので、収集段階で5桁を強制しない限りマークアップ段階では直せない。これも今回確認できた収穫だ。

## 同じ欠陥3つを、3つの層に流す

ここからが本題の実測になる。検証手段は3つある。schema-dtsによるコンパイル時型チェック、schema.org公式バリデーター、そして変換器内のランタイム正規表現ゲート。ちなみにバリデーターはブラウザUI無しでも使える。HTMLをそのままPOSTすればJSONが返るので、CIに組み込みやすい。

```bash
curl -s -X POST "https://validator.schema.org/validate" \
  --data-urlencode "html@dist/restaurants/mock-1/index.html"
# 応答先頭の )]}'  を剥がすと tripleGroups[].nodes[] に
# プロパティ別の errors と numErrors/numWarnings が入っている
```

意図的に壊した欠陥3つを各層に流した結果がこれだ。

![Validation matrix — which layer catches which defect](../../../assets/blog/restaurant-jsonld-opening-hours-validation-2026/validation-matrix.png)

| 仕込んだ欠陥 | tsc --strict + schema-dts | validator.schema.org | 救ってくれる層 |
|---|---|---|---|
| `dayOfWeek: "monday"` (小文字) | <strong>TS2820</strong>: Did you mean "Monday"? | エラー無し、`schema.org/Monday` へ静かに正規化 | 型チェック |
| `"adress"` (プロパティのtypo) | <strong>TS2561</strong>: Did you mean 'address'? | <strong>INVALID_PREDICATE</strong> (severe) | 両方 |
| `opens: "eleven"` | 素通し(Time型は結局string) | 素通し(エラー0件) | <strong>誰もいない</strong> |

3行だが、それぞれ含意が違う。

小文字の曜日は、内部データが `"monday"` で保存されている以上、マッピングを外せばそのまま漏れる種類のミスだ。これをコンパイル時に止めたのはschema-dtsだけだった。バリデーターはエラー扱いせず、黙って直して見せてくる。便利に見えるが、自分はこの挙動を信用しない側に倒した。バリデーターの正規化はバリデーターの実装であって、Googleの実際の取り込みパイプラインが同じ寛容さを持つという文書上の根拠は見つけられなかった。公式ドキュメント表記の `"Monday"` で出すのが安全だ。

プロパティ名のtypoは両方が捕まえ、どちらも「addressのことか」とサジェストまで付く。これは想定通り。

問題は3つ目だ。`opens: "eleven"`。時刻ですらない値が<strong>どの層にも捕まらない</strong>。schema-dtsの `Time` は実体がstringの別名なので型チェックは無力、バリデーターは値の形式を検査しない。営業時間マークアップで一番致命的な欠陥(時刻が時刻でない)が、一番よく通る。だから変換器の `TIME_RE` は飾りではなく<strong>唯一の防衛線</strong>になる。このゲートが無ければ "eleven" はコンパイルを通り、バリデーターを通り、本番HTMLまで到達する。

この構図は[axe-coreをjsdomと実ブラウザで比べたとき](/ja/blog/ja/axe-core-ci-a11y-jsdom-vs-browser-2026/)と同じだ。ツールはそれぞれ違う欠陥を捕まえ、どのツールが何を見逃すかはドキュメントではなく実測でしか分からない。そして見逃される場所には、自前のゲートを立ててCIに常設するしかない。

## 正直な限界: このマークアップはMEOの順位を動かさない

期待値を先に削っておく。第一に、構造化データを入れてもリッチリザルトの表示は保証されない。ドキュメント原文は "Google does not guarantee that features that consume structured data will show up in search results" と明言している。第二に、MEO、つまりマップ検索・ローカルパックの順位についてはさらに冷静であるべきだ。[Googleビジネスプロフィールのローカル順位公式ドキュメント](https://support.google.com/business/answer/7091)が挙げる要因は関連性・距離・知名度の3つで、このページには<strong>構造化データという語が一度も出てこない</strong>。ローカルパックの主戦場はビジネスプロフィールの充実度とクチコミであって、ウェブサイトのJSON-LDではない。

では何のために入れるのか。自分の判断はこうだ。Restaurantマークアップの仕事は順位の押し上げではなく、<strong>ウェブページ側の情報を機械可読にする</strong>こと。検索結果のナレッジパネルや営業時間表示といったリッチリザルトの材料になり、ページを読むのがクローラーだけではなくなった今は、AI検索や生成エンジンが店舗情報を正確に拾うための土台にもなる。「この店、日曜やってる?」という質問にAIが答えるとき、根拠ページにopens/closesが機械可読形式で在るのと表示用文字列しか無いのとでは差が出ると見ている。ただしこれ自体は未実測の推定なので、AI回答への引用効果は別の測定テーマとして残しておく。

最後の限界も書いておく。今回の検証はschema-dtsの型チェックとバリデーターのPOST APIまで。GoogleのリッチリザルトテストはブラウザUIが必要で、今回のパイプラインには入れられなかった。公開前の最終確認は従来通り[リッチリザルトテスト](https://search.google.com/test/rich-results)で行うのが公式の推奨経路だ。

## 公開前ゲート: 営業時間マークアップのチェックリスト

今回の実測で固まったリストを置いておく。飲食店に限らず店舗型ビジネス全般でそのまま使えるはずだ。

- [ ] 型は `LocalBusiness` ではなく可能な限り具体的に(`Restaurant` など)。公式ガイドライン
- [ ] 営業時間は表示用文字列ではなくopens/closes分離の構造で内部管理する
- [ ] 同じ時間帯の曜日は `dayOfWeek` 配列に、昼夜二部営業は同じ曜日にスペック2つ
- [ ] 定休日はopens=closes="00:00"、深夜営業は一つのオブジェクトで日跨ぎ、期間限定は `validFrom`/`validThrough`
- [ ] L.O.のようにスキーマに無い情報で閉店時刻を歪めない。マークアップ外に置く
- [ ] `geo` は小数点以下5桁以上。収集時点で強制しないと後から直せない
- [ ] schema-dtsで型チェック(曜日・プロパティ名のtypo)、時刻形式は<strong>自前の正規表現ゲート</strong>で。既成のどの層も見てくれない
- [ ] validator.schema.orgのPOST APIをCIに掛けて構造エラーを監視、最終確認はリッチリザルトテスト

構造化データは、入れないことより間違ったまま放置されることの方が害が大きい。誤った営業時間が検索結果に載れば、無駄足を踏んだ客の不信はその情報を載せたページに返ってくる。検証の各層が何を見逃すかを知り、見逃される場所にゲートを立てるところまでが実装だ。

---

店舗・地域ビジネスサイトの構造化データ設計や、既存マークアップの検証体制の点検が必要であれば、こうした実測ベースの診断と実装を個人で相談・依頼として受けている。[お問い合わせはこちら](/ja/contact/)。
