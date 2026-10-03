---
title: 'MCPサーバーのリスク点検は結果ファイルが無いと0点で記録される — リスク0と測定不能を区別する規約が先だ'
description: '点検ツールが「成功」と表示しても、結果ファイルが空ならその0点は「リスクなし」ではなく「測定できなかった」ことを意味する。点検ツールを導入する前に、入力と結果がファイルとして残る保存規約を先に整えるべきだ。'
pubDate: '2026-09-06'
heroImage: ../../../assets/blog/mcp-governance-inventory-snapshot-first-zero-not-measured-2026/hero.png
tags:
- MCP
- OWASP
- ガバナンス
- リスク評価
relatedPosts:
- slug: mcp-governance-audit-exit-code-zero-fail-open-harness-2026
  score: 0.7
  reason:
    ko: '''MCP 거버넌스 감사에서 exit code 0은 안전을 증명하지 않는다''와 같은 문제를 다른 측정으로 다시 잰 글이다.'
    ja: 「MCPガバナンス監査でexit code 0は安全性を証明しない」と同じ問題を別の実測で捉え直した記事。
    en: Revisits the same problem as 'Exit code 0 does not prove safety in MCP governance audits'
      with a different measurement.
    zh: 用另一组实测重新审视与《MCP治理审计中，退出码0不能证明安全性》相同的问题。
- slug: mcp-server-production-deployment-kubernetes-guide
  score: 0.7
  reason:
    en: If the deployment guide focuses on keeping servers alive, this article shows
      why a live server's score can still signal false safety.
    ko: 배포 가이드가 서버를 살리는 데 집중했다면, 이 글은 살아난 서버의 점수가 왜 거짓 안전을 부를 수 있는지 보여준다.
    ja: デプロイガイドがサーバーを生かすことに焦点を当てたなら、この記事は生きたサーバーのスコアがなぜ偽りの安全を招くかを示す。
    zh: 若部署指南专注于让服务器存活，本文则揭示存活服务器的评分为何仍可能带来虚假的安全感。
---

## 点検は成功したのに、結果が何も残らなかった

今日、あなたが運用するシステムに接続されたAIツール群が安全かどうかを確かめようと、監査スクリプトを実行した。画面にはすべての項目が成功と表示された。ところが、肝心の点検結果は何ひとつ残っていなかった。

この矛盾は、MCPサーバーのリスク点検ツールを試したときに起きた。MCP（Model Context Protocol）は、AIアシスタントが外部のデータやツールに接続するための共通規格だ。この規格に沿って作られたサーバーを点検するために、OWASP（Open Worldwide Application Security Project、Webアプリケーションのセキュリティ基準を策定する国際団体）が公開しているリスク評価基準を、自前の点検スクリプトに当てはめてみた。

点検は5つの項目で構成され、各項目を3回ずつ実行した。合計15回の実行は、すべて「終了コード0」で成功した。終了コード0は、プログラムがエラーを出さずに最後まで動いたことを示す標準的な値だ。ところが、問題を検出した回数（hits）はすべて0だった。さらに、3番目の項目は出力が完全に空で、5番目の項目は参照するファイルがないというエラーを出していた。

これは、レストランの衛生点検に出かけたのに、点検表のどこにも記入せずに「点検完了」の印だけを押して帰ってきたようなものだ。点検したという事実だけが残り、何を確認したのかが一切わからない。

監査ツールの「成功」表示は、実際に点検が完了したことを意味しない。

## 見つかったのはサーバー1台の存在だけだった

点検ツールが実際に何を観測したのかを、項目ごとに見ていく。

<div class="lm-card lm-card--cell" data-lm-figure="explain-cell-c1-inventory-enumeration" data-lang="ja"><span class="lm-card__badge lm-card__badge--ok">成功</span><span class="lm-card__title">サーバー一覧化</span><span class="lm-card__text">3回の実行すべて正常終了したが、フラグはなくanalytics-mcpサーバー1つの設定項目だけを列挙した。</span><div class="lm-card__numbers"><div class="lm-card__bar"><div class="lm-card__bar-fill" style="--lm-bar-w:100.0%"></div><span class="lm-card__text">正常終了 3/3</span></div><span class="lm-card__chip">フラグ 0</span></div></div>

1つ目の項目は、設定ファイルからMCPサーバーの一覧を列挙するものだ。点検対象の設定ファイルは184322バイトあった。この中から見つかったMCPサーバーは、analytics-mcpの1台だけだった。このサーバーはstdioタイプで、pipxというPythonパッケージ管理ツールでインストールされていた。stdioタイプとは、AIアシスタントと同じコンピューター上で動くサーバーの形式だ。

2つ目の項目は、サーバーのインストール方法に問題がないかを採点するものだった。OWASPの基準書（6376バイト）を参照して評価する設計だったが、採点結果は確認できなかった。

3つ目の項目は、サーバーがどのような権限で動いているかを採点するものだった。この項目の出力は完全に空で、どのサーバーにも権限スコアが付与されなかった。

4つ目の項目は、サーバーの更新状況を確認するものだった。この評価には、過去の設定ファイルのスナップショットが必要だったが、そのファイルが見つからなかった。

5つ目の項目は、OWASPの評価基準に照らして総合判定を出すものだった。この項目も、集計に必要なファイルが見つからず失敗した。

点検ツールが見つけ出したのは、サーバーが1台存在するという事実だけだった。残りの4つの評価項目は、すべて空欄のままだ。

## 結果が空だったのは、評価に必要なファイルがなかったからだ

なぜ結果が空になったのか。原因は評価ロジックではなく、評価の入力になるファイルが存在しなかったことにある。

<div class="lm-card lm-card--cell" data-lm-figure="explain-cell-c4-update-absence-remote" data-lang="ja"><span class="lm-card__badge lm-card__badge--ok">成功</span><span class="lm-card__title">更新欠如</span><span class="lm-card__text">3回すべて正常終了したが、評価根拠ファイルが欠落していてリモートアドレスを見つけられなかった。</span><div class="lm-card__numbers"><div class="lm-card__bar"><div class="lm-card__bar-fill" style="--lm-bar-w:100.0%"></div><span class="lm-card__text">正常終了 3/3</span></div><span class="lm-card__chip">フラグ 0</span></div></div>

4つ目の項目（更新状況の確認）では、snapshot/.mcp.jsonとsnapshot/claude.jsonという2つのスナップショットファイルが必要だった。これらは過去の設定を記録したファイルで、サーバーの設定が変わっていないかを確認するために使う。しかし、両方とも「ファイルなし」と表示され、サーバーの更新元となる遠隔のURLも見つからなかった。

5つ目の項目（総合判定）では、jqというJSONデータ処理ツールを使って、各項目の結果ファイルを集計する設計だった。ところが、実行時に「results/c*.jsonというファイルを開けません」というエラーが出た。c*.jsonは各項目の結果を保存する想定だったファイル群だ。このファイルが1つも生成されていなかったため、集計そのものが実行できなかった。

これは、料理の評価をしようとしたら、材料のリストもレシピもすべてなくて、何の料理なのかさえわからない状況に似ている。評価者の腕前の問題ではなく、評価の対象がそもそも揃っていなかったのだ。

空の結果の原因は、評価基準の不備ではなく、評価の入力ファイルが存在しなかったことだ。

## 「サーバーが1台だけなら0点で正しい」という反論の成立範囲

ここで最も強い反論が考えられる。「点検対象のサーバーが1台だけの小規模な環境なら、リスクはもともと小さい。hitsが0というのは正常な結果ではないか」という主張だ。

<div class="lm-card lm-card--cell" data-lm-figure="explain-cell-c5-owasp-rubric-crosswalk" data-lang="ja"><span class="lm-card__badge lm-card__badge--ok">成功</span><span class="lm-card__title">基準表集計</span><span class="lm-card__text">3回すべて正常終了したが、結果ファイルがなく、集計ツールがファイルを開けず失敗した。</span><div class="lm-card__numbers"><div class="lm-card__bar"><div class="lm-card__bar-fill" style="--lm-bar-w:100.0%"></div><span class="lm-card__text">正常終了 3/3</span></div><span class="lm-card__chip">フラグ 0</span></div></div>

この反論が正しい範囲は明確だ。1台のコンピューターで、1台のサーバーだけを対象にした、この1回の点検に限って言えば、リスクが低いと出るのは自然なことかもしれない。

しかし、この反論が成立するには前提がある。それは、結果ファイルが正常に生成されていることだ。今回の点検では、5つ目の項目（総合判定）が、結果ファイルの不存在によって実行できなかった。これは「リスクが0点だった」のではなく「集計が実行できなかった」ことを意味する。正常な0点と、測定不能は、明確に区別されなければならない。

サーバーが1台だけでも、集計そのものが失敗したのは正常な0点とは異なる。

## 結果ファイルがなければ失敗と記録する規約を先に作る

では、何を変えるべきか。結論は、リスク点検ツールを導入する前に、点検の入力と結果がファイルとして残る保存規約を先に整えることだ。

<div class="lm-card lm-card--takeaway" data-lm-figure="explain-takeaway" data-lang="ja"><span class="lm-card__title">結論</span><p class="lm-card__takeaway">すべてのセルでフラグが0であり集計も失敗したため、どのサーバーがどのセルで問題なのかをこの実験では判定できなかった。</p></div>

具体的には、2つのルールが必要になる。

1つ目は、点検の入力になる設定ファイルのスナップショットを、点検実行前に必ず保存すること。今回の点検では、このスナップショットがなかったために、更新状況の評価ができなかった。

2つ目は、各項目の結果ファイルが生成されなかった場合、その項目を「成功」ではなく「失敗」として記録すること。今回の点検では、結果ファイルが空でも終了コード0が返り、すべて成功として記録された。これが「リスク0」と「測定不能」を混同する根本原因だ。

すでにリスク点検ツールを動かしているチームは、今日の点検ログを確認してほしい。終了コードが0なのに結果ファイルが空になっていないか。空であれば、それは「測定不能」として記録し直すべきだ。

これからリスク点検ツールを導入しようとしているチームは、先に保存規約を作ることだ。設定ファイルのスナップショットと、項目ごとの結果ファイルが「存在しなければ失敗として記録される」仕組みを、ツールの導入より先に整える。この順序を間違えると、監査の証拠ではなく監査をしたという錯覚だけが残る。

冒頭の問いに戻る。成功で終わった点検がなぜ何も結果を残せなかったのか。答えは、点検ツールが「成功」と判定する基準が、結果ファイルの存在ではなくプログラムの終了コードだけだったからだ。リスク点検ツールを導入する前に、点検の入力と結果がファイルとして残る保存規約から整えるべきだという行動指針が、ここから得られる。

## この記事が確認できなかったこと

スナップショットファイルがなぜ生成されなかったのか。生成する手順がそもそもなかったのか、保存先のパスが想定と異なっていたのか。この点は測定できなかった。

この実験は、1台のコンピューターにサーバーが1台だけという環境での1回の測定だ。遠隔サーバーが複数ある環境には、この結果をそのまま当てはめることはできない。

この判断が覆る条件は、結果ファイルが正常に生成された状態でも、すべての項目がhits 0になる環境が観測された場合だ。その場合は「リスク0」が実際に測定されたことになり、今回の主張は成立しなくなる。

## 参考資料

1. [OWASP MCP Governance and Risk Project](https://github.com/OWASP/OWASP-MCP-Governance-and-Risk-Project)（OWASP）
2. [Model Context Protocol documentation](https://modelcontextprotocol.io)（modelcontextprotocol.io）
3. [Claude Code documentation — settings and MCP configuration](https://code.claude.com)（code.claude.com）