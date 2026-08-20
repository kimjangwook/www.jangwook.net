---
title: 'August 2026 spam updateの開始時刻、Search Consoleでは境界日が混ざる'
description: 'Google Search Status Dashboardのincidents.jsonはAugust 2026 spam updateの開始時刻を分単位UTCで公開する。Search Console APIの結合キーはPT日単位だ。解像度差を実測すると境界日は前後混在の一日になり、数値を補正する分解能は残らない。'
pubDate: '2026-08-20'
heroImage: '../../../assets/blog/spam-update-rollout-window-search-status-vs-gsc-2026/hero.png'
tags:
  - google-search-console
  - spam-update
  - seo
  - web-performance
relatedPosts:
  - slug: gsc-platform-properties-social-video-search-measurement-2026
    score: 0.83
    reason:
      ko: 공식 문서가 밝힌 것과 실제로 조인되는 것 사이의 간격을 같은 방식으로 확인한 글이다. 여기서도 Search Console 쪽 해상도가 병목이다.
      ja: 公式が公開したものと実際にジョインできるものの差を同じやり方で確認した記事。ここでもSearch Console側の解像度がボトルネックになる。
      en: Same method — checking the gap between what is officially published and what actually joins. Search Console's resolution is the bottleneck here too.
      zh: 用同样的方法核对官方公开的内容与实际可关联的数据之间的差距，这里 Search Console 一侧的分辨率同样是瓶颈。
  - slug: official-geo-subtraction-gsc-control-2026
    score: 0.76
    reason:
      ko: 공식 문서가 적어 둔 제어 지점과 실제 배포 사이의 간격을 다룬 글. 대시보드 문서를 그대로 믿을 때 생기는 함정이 겹친다.
      ja: 公式文書に書かれた制御点と実際の配信の差を扱った記事。ダッシュボードの文書をそのまま信じたときの落とし穴が重なる。
      en: On the gap between the control points official docs describe and what actually ships. The same trap of trusting dashboard docs at face value shows up.
      zh: 讨论官方文档所写的控制点与实际交付之间的差距，照单全收信任仪表盘文档时的陷阱与本文重合。
---

August 2026 spam updateの開始時刻は、Google Search Status Dashboardのincidents.jsonに分単位で公開されている。開始時刻をSearch Consoleの日次パフォーマンスデータに紐付ければ精度が上がるはずだと考え、curlで叩いて突き合わせた。結果は逆だった。Search Console側の結合キーがPT日単位しかないため、分単位の値は結合の瞬間に丸められるのではなく、境界日の中でロールアウト前後の状態が混ざって残る。

解像度の差は自動化しているチームほど効く。短いspam updateでは完全内部日がゼロか1日しかなく、境界日の中身がロールアウト前後で6割近く入れ替わることもある。この差への対処は、実装の段で具体的に詰める。

## 何が起きたか

2026年8月18日、Googleがspam updateをリリースした。Search Status Dashboardのincidents.jsonを見ると、ロールアウトの開始が機械可読フィールドとして記録されている。

> "begin":"2026-08-18T16:27:00+00:00"
> — [Search Status Dashboard incidents.json](https://status.search.google.com/incidents.json)

同じ瞬間をHTMLダッシュボードはPacific時間で表示する。

> August 2026 spam update Active Start Time: 18 Aug 2026, 09:27 PDT Last update: 18 Aug 2026, 09:28 PDT Impacted products: Ranking
> — [Google Search Status Dashboard](https://status.search.google.com/)

curlで叩くとincidents.jsonは認証もAPIキーも要らずに200を返した。robots.txtも全許可だ。[宣言したrobots.txtがフェイルオープンで残る場合](/ja/blog/ja/declared-rules-fail-open-robots-txt-agents-md-2026/)とは逆で、ここでは宣言どおりに開いている。

> allow: /
> — [Search Status Dashboard incidents.json](https://status.search.google.com/incidents.json)

macOS 15.5・curl 8.7.1で `curl -sS -A "curl/8.7.1" https://status.search.google.com/incidents.json` を叩くと、12,903バイトのJSONがそのまま返る。中に10件のインシデントが入っている。8月20日時点でAugust 2026 spam updateはまだActiveで、endフィールドは値がnullなのではなく、キー自体が存在しない。進行中のインシデントにはendキーを生成しない仕様だ。

## 表記が三つある

同じ瞬間を三つの面で見ると、パース難度が三段階違う。HTMLダッシュボードは `18 Aug 2026, 09:27 PDT`、incidents.jsonは `2026-08-18T16:27:00+00:00` とRFC3339のUTCで、HTMLとJSONは表記こそ違えど機械的に読み替えられる。一番厄介なのはAtomフィードだ。`<summary>` の `Incident began at 2026-08-18 09:27 (all times are US/Pacific)` はオフセットなしのPT文字列で、タイムゾーンをコード側にハードコードしないと変換できない。

Atomには、`<updated>` タグの値と `<summary>` 内の開始時刻が別物だという落とし穴もある。

> feed/updated = 2026-08-18T16:28:47+00:00, entry/updated = 2026-08-18T16:28:47+00:00 vs incidents.json begin = 2026-08-18T16:27:00+00:00
> — [Google Search Status Dashboard Updates (Atom)](https://status.search.google.com/feed.atom)

`<updated>` はロールアウトが始まった16:27:00Zではなく、ダッシュボードが告知を生成した16:28:47Zを指している。1分47秒のズレだ。Atom購読でアラートを組んでいるなら、`<updated>` を開始時刻として読むコードはここで間違える。

## begin/endは宣言値、created/modifiedは機械記録

incidents.jsonのタイムスタンプを並べて秒の桁を見ると、はっきりした差が出た。

> begin 10件 seconds 全て 00、分値 {0,25,27,40,55}。end 9件 seconds 全て 00、分値 {0,10,30,40} — 全て5の倍数。created 10件 seconds は実際の値（2,3,14,18,21,25,28,33,43分台に散らばる）
> — [Search Status Dashboard incidents.json](https://status.search.google.com/incidents.json)

begin と end は人間が入力した宣言値で、秒はすべて00、endの分値は5の倍数しか出てこない。created と modified だけが秒まで持つ機械記録だ。[公式文書に書かれた制御点と実際の配信がずれた記録](/ja/blog/ja/official-geo-subtraction-gsc-control-2026/)と同じ層で、スキーマがあることと値の意味が契約されていることは別だ。宣言値と機械記録の乖離は実態とのズレを生む。August 2025 spam updateでは、完了告知が自身が宣言した終了時刻より46分早く出た。

> August 2025 spam update は完了告知が2025-09-22T06:14:22Zなのに、自身が宣言したendは2025-09-22T07:00:00Z — 告知が終了宣言より46分先に上がった
> — [Search Status Dashboard incidents.json](https://status.search.google.com/incidents.json)

分単位に見える値の実際の信頼区間は、分ではない。

## Search Console側の解像度

Search Console APIのsearchanalytics.queryは、日付を次のように定義している。

> Start date of the requested date range, in YYYY-MM-DD format, in PT time (UTC - 7:00/8:00). Must be less than or equal to the end date.
> — [Search Console API — Search Analytics: query](https://developers.google.com/webmaster-tools/v1/searchanalytics/query)

時刻ではなく日付だ。[プラットフォーム属性も画面にはあり API 文書にはなかった](/ja/blog/ja/gsc-platform-properties-social-video-search-measurement-2026/)のと同じ層で、画面の解像度とパイプラインが受け取れる解像度が違う。PTのUTC-7とUTC-8のどちらを使うかは夏時間次第で、判定方法はドキュメントに明示されていない。Google自身が公式に推奨している対照方法がある。

> Check the Search Status Dashboard and take note of the start and end date of the core update. Compare the right dates: We recommend waiting at least a full week after a core update completes before analyzing your site in Search Console.
> — [Google Search core updates and your website](https://developers.google.com/search/updates/core-updates)

「日付をメモして手動で照合しろ」だ。分単位のタイムスタンプをどう扱うかについては何も書いていない。

## 境界日で何が混ざるか

UTCの日付文字列をPTの日付軸にそのまま置くとズレが生じる。過去のインシデント19個のタイムスタンプで確認すると、2件でズレが出た。もっとも、19件の母数で算出したズレの比率をそのまま将来に当てはめてよいかは、正直まだ判断がつかない。ズレた2件は両方とも2026年2月のServing障害で、beginとendがUTC 2026-02-25なのにPTでは2026-02-24だった。ランキングアップデート7件はUTC 16:00前後に始まるため、たまたまUTC日付とPT日付が一致していた——保証ではなく偶然だ。PDTならUTC 00:00-07:00、PSTなら00:00-08:00に始まるインシデントは必ずズレる。
UTCの日付文字列をPTの日付軸にそのまま置くとズレが生じる。過去のインシデント19個のタイムスタンプで確認すると、2件でズレが出た。もっとも、19件の母数で算出したズレの比率をそのまま将来に当てはめてよいかは、正直まだ判断がつかない。ズレた2件は両方とも2026年2月のServing障害で、beginとendがUTC 2026-02-25なのにPTでは2026-02-24だった。ランキングアップデート7件はUTC 16:00前後に始まるため、たまたまUTC日付とPT日付が一致していた——保証ではなく偶然だ。PDTならUTC 00:00-07:00、PSTならUTC 00:00-08:00に始まるインシデントは必ずズレる。

開始日がロールアウト前後にどれだけ混じるかも計算した。

> 2026-08 spam 39%/61%, 2026-03 core 8%/92%, 2026-03 spam 50%/50%, 2026-02 Serving 83%/17%
> — [Search Status Dashboard incidents.json](https://status.search.google.com/incidents.json)

混合比を決めるのはロールアウトの長さではなく、PT基準の開始時刻の位置だ。PT 02:00に始まった2026年3月のcore updateは開始日の92%がロールアウト後だが、PT 12:00に始まった2026年3月のspam updateは正確に50%/50%になる。ランキングアップデートの大半はPT午前8時から9時台に始まるため、開始日の約6割はすでにロールアウト後という計算になる。開始日を「更新前」として除外すると、その日のトラフィックの半分以上を誤ってラベル付けしてしまう。

短いロールアウトほど境界日の混在が重く効く。ロールアウト期間をPT日単位で区切り、完全内部日を数えると、2026年3月のspam updateは19時間30分しか続かなかったのに跨いだPT日は2日、そのうち完全内部日はゼロだった。GSCの日付軸にきれいな1日が存在しない。2日1時間続いた2026年6月のspam updateは完全内部日が1日だけだ。対照的に、21日17時間の2026年2月Discover障害は21日、26日15時間の2025年8月spam updateは26日ある。ロールアウトが長いほど、境界日の影響は薄まって消える。

## 明示的な反論 — Googleの推奨自体がこの分析を無効化しないか

もっとも強い反論は、Google自身の推奨から来る。「core update完了後、少なくとも丸一週間待ってからSearch Consoleを見よ」というのが公式の姿勢だ。1週間待って見るつもりなら、開始時刻の分単位の精度は最初から雑音であり、28日間の分析窓の中で境界日1マスの混在比率は3.6%に過ぎない。この指摘は正しい。ただし、正しい範囲が決まっている。

完全内部日が11日以上ある長いロールアウトでは、Googleの推奨がそのまま成立する。11日21時間の2026年5月core update、21日17時間の2026年2月Discover障害、26日15時間の2025年8月spam updateが該当する。1週間待ってから見れば、境界日の混在は誤差に収まる。

正しくない範囲も同じくらい明確だ。2026年3月のspam updateは19時間30分しか続かず、跨いだPT日は2日なのに完全内部日はゼロだった。「完了後」に待つべき期間は存在しても、比較できるきれいな1日そのものが存在しない。2026年6月のspam updateも完全内部日は1日しかない。短いspam updateでは、Googleの推奨は前提が崩れる——待つ場所がないのに待てとは言えない。

## 実装するならどこで詰まるか

詰まる場所は一つだけだ。GSC APIを日次バッチで回しているパイプラインに、incidents.jsonのbegin/endをそのまま突っ込むと、境界日のフラグが1日ずれる。UTCのまま切り詰めると、8月18日16:27Zの開始が「8月18日」のフラグになるが、PTでは同じ8月18日09:27になるとは限らない。DSTを跨ぐ時期ならUTC-7とUTC-8のどちらで切るかで結果が変わる。手元で試した範囲では境界日は必ずロールアウト前後の状態が混ざっていて、きれいに片側に寄ったケースは一度も見ていない。数値を補正しようとしても補正できるだけの分解能がGSC側に存在せず、PT変換を怠ればフラグ列そのものが無意味になる。

Atomフィードだけで運用しているチームにも落とし穴がある。アラートに表示された時刻を開始時刻として読むと、実際には告知が生成された時刻を見ていることになる。1分47秒のズレは小さく見えるが、コードに書いた瞬間に告知時刻を開始時刻とみなした前提は消える。

ラベルを付けるか付けないかの二択で、「参考程度に見る」という中間状態は次のロールアウトで必ず読み違える。

## 誰に向くか、向かないか

GSC APIを定期バッチで回して日別成果を蓄積しているチームなら、ラベル列一つで回帰分析のノイズ区間を切り離せる。短いspam updateのように完全内部日が0日から1日しかないケースでは、窓の取り方自体が結論を左右するので、ラベル付けが特に効く。

インシデント情報の自動取得は、複数サイトや複数プロパティを一つのダッシュボードに集約し、人間が都度画面を開けない運用で威力を発揮する。裏返せば、ロールアウトの相関を因果として扱おうとする分析には向かない。境界日の混在を消す方法はなく、順位変動の原因も特定できないからだ。次の場面でも不要になる。

- GSCをブラウザだけで見る一人運用。ダッシュボードのブックマークで足りる
- 時間単位のレポートを求める要件。GSCは時刻を返さないため自動化では解決できない
- ロールアウト中のリアルタイム対応。Googleの推奨は完了後1週間の待機だ

コストは金銭ゼロだ。認証・APIキー不要、robots.txt全面許可、応答は12,903バイト・10件のインシデントで済む。ポーリングのクォータやレート制限は公開文書に見つからず、未確認のままだ。実装時間はUTCからPTへの変換、日単位への切り落とし、境界日フラグ付与といった正規化ロジックだけなので半日程度に見えるが、実装時間も実測していない。

Googleは自らのインシデントデータにJSON Schemaまで付けて機械可読で公開しているのに、その値を受け取るべき自らの計測ツールは相変わらず日付しか受け取らない。公開されていることと、結合できることは別の問題だ。Search Console API側の解像度が分単位まで上がる日が来るのかどうか、今の公開情報からは読み取れない。

## 参考資料
- [Google Search Status Dashboard](https://status.search.google.com/)
- [Search Status Dashboard incidents.json](https://status.search.google.com/incidents.json)
- [incidents.schema.json](https://status.search.google.com/incidents.schema.json)
- [Google Search Status Dashboard Updates (Atom)](https://status.search.google.com/feed.atom)
- [Search Console API — Search Analytics: query](https://developers.google.com/webmaster-tools/v1/searchanalytics/query)
- [Google Search core updates and your website](https://developers.google.com/search/updates/core-updates)
- [History for Ranking | Google Search Status Dashboard](https://status.search.google.com/products/rGHU1u87FJnkP6W2GwMi/history)
- [Spam updates and your site](https://developers.google.com/search/docs/appearance/spam-updates)
