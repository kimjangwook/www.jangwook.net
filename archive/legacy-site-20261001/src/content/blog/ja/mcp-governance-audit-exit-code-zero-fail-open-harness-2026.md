---
title: 'MCPガバナンス監査で「成功終了」は成功を証明しない — 15回の実行すべてがexit 0でも測定は失敗していた'
description: '検証パイプラインが「成功」と表示しても、実際には何も測定できていないことがある。MCPガバナンス監査の15回の実行はすべて成功終了コード0で終わったが、結果ファイルは生成されず、出力が空のセルもあった。成功信号をそのまま信じる前に、成果物の存在を確認する必要がある。'
pubDate: '2026-09-06'
heroImage: ../../../assets/blog/mcp-governance-audit-exit-code-zero-fail-open-harness-2026/hero.png
tags:
- MCP
- ガバナンス
- 検証パイプライン
- OWASP
relatedPosts:
- slug: declared-rules-fail-open-robots-txt-agents-md-2026
  score: 0.7
  reason:
    ko: '''규칙이 잘려도 에러는 나지 않는다 robots.txt와 AGENTS.md 219런 실측''와 같은 문제를 다른 측정으로 다시 잰
      글이다.'
    ja: '「ルールが届かないとき処理は止まらず素通りする: robots.txtとAGENTS.mdの実測」と同じ問題を別の実測で捉え直した記事。'
    en: Revisits the same problem as 'robots.txt and AGENTS.md both fail open' with
      a different measurement.
    zh: 用另一组实测重新审视与《规则没有生效，为什么两边都当成通过了》相同的问题。
- slug: mcp-builtin-vs-external-harness-cost-28x-measured-2026
  score: 0.7
  reason:
    en: This piece on exit code 0 masking failed measurements forces a re-check of
      the earlier claim that harness choice drives the 28x cost gap.
    ko: 측정 실패를 성공으로 위장하는 exit code의 함정을 다룬 이번 글이, 하네스 선택이 비용 격차를 만든다는 기존 분석의 신뢰성을
      다시 검증하게 만든다.
    ja: 終了コード0が測定失敗を隠す問題を扱う本稿は、ハーネス選定がコスト差を生むという既存分析の信頼性を再検証させる。
    zh: 本文揭示退出码0掩盖测量失败的问题，促使你重新审视此前关于工具链选择导致28倍成本差异的结论。
---

## 検証パイプラインの「成功」表示は何を保証するのか

検証パイプラインが「成功」と表示しても、実際には何も測定できていないことがある。この記事で扱うのは、MCP（Model Context Protocol）サーバーの設定をOWASP（Open Worldwide Application Security Project）のガバナンス基準で監査するパイプラインの話だ。MCPとは、AIアシスタントが外部のツールやデータに接続するための共通規格である。OWASPは、Webアプリケーションのセキュリティ基準を策定する国際的な非営利団体だ。

監査パイプラインは、設定ファイルからMCPサーバーを列挙し、そのインストール方法や権限範囲を評価して、問題があれば「フラグ」を立てる仕組みになっている。フラグとは、監査基準に照らして問題が検出されたことを示す印のことだ。今回の実験では、このパイプラインを15回実行した。すべての実行が「成功」と報告された。しかし、その成功の内実を調べると、測定そのものが機能していなかったことが分かった。

これは、試験の答案用紙に答えを書かずに「問題をすべて解きました」と提出するのと同じだ。提出用の用紙は揃っている。名前も書いてある。しかし、採点者が中身を見れば、そこには何もない。パイプラインの「成功」表示も同じで、プロセスが最後まで到達したことしか示しておらず、実際に何かを測定したかどうかとは無関係なのだ。



## 15回すべてが「成功」— しかし何も検出されなかった

実験の結果は、一致した。5つの評価セルすべてで、ヒット数（検出された問題の数）が0だった。OWASP基準に基づくフラグは、1つも算出されなかった。しかも、各セルを3回ずつ実行した15回すべてが、終了コード0（成功を意味する標準的な値）で終わっている。

<div class="lm-card lm-card--how" data-lm-figure="explain-how" data-lang="ja"><span class="lm-card__title">測定手順</span><ol class="lm-card__steps"><li class="lm-card__text">ステップ 1. ハーネスの設定ファイルから接続されたMCPサーバーの一覧を列挙した。</li><li class="lm-card__text">ステップ 2. 各サーバーをOWASP基準のインストールスキーマのセルに当てはめてスコアリングを試みた。</li><li class="lm-card__text">ステップ 3. 同じ方法で権限スコープのセルを評価しようとした。</li><li class="lm-card__text">ステップ 4. 更新欠如のセルはリモートアドレスの根拠ファイルを探して評価しようとした。</li><li class="lm-card__text">ステップ 5. 最後に全体の結果をOWASP基準表に対応させて集計しようとした。</li></ol></div>

具体的な実行結果を見ていこう。まず、c1-inventory-enumerationは、設定ファイルからMCPサーバーの一覧を列挙するセルだ。このセルは3回実行され、毎回終了コード0で、ヒット数は0だった。184322バイトのclaude.jsonという設定ファイルから、analytics-mcpというサーバーがstdioタイプ・pipxインストールのスキーマで列挙された。stdioとは、標準入出力を通じて通信する方式のことだ。pipxは、Python製のコマンドラインツールを隔離環境にインストールするためのツールである。

次に、c2-install-schema-scoringは、OWASPのインストールスキーマに基づくスコアを算出するセルだ。このセルも3回とも終了コード0で、ヒット数は0だった。しかし、実行内容を詳しく見ると、6376バイトの参照ドキュメントを確認しただけで、スコアの算出は行われていなかった。

さらに、c3-permission-scope-scoringは、権限範囲のスコアを算出するセルだ。このセルも3回とも終了コード0で、ヒット数は0だった。しかし、出力は完全に空だった。何も計算されていないのに、成功として報告されたのである。

フラグ0という数字は、実際の測定結果ではなく、空の結果である可能性がある。

## ファイルが見つからないのに「成功」— 矛盾した実行結果

さらに深刻な問題が、4回目と5回目の実行で起きていた。

<div class="lm-card lm-card--cell" data-lm-figure="explain-cell-c5-owasp-rubric-crosswalk" data-lang="ja"><span class="lm-card__badge lm-card__badge--ok">成功</span><span class="lm-card__title">基準表集計</span><span class="lm-card__text">3回すべて正常終了したが、結果ファイルがなく、集計ツールがファイルを開けず失敗した。</span><div class="lm-card__numbers"><div class="lm-card__bar"><div class="lm-card__bar-fill" style="--lm-bar-w:100.0%"></div><span class="lm-card__text">正常終了 3/3</span></div><span class="lm-card__chip">フラグ 0</span></div></div>

4回目の実行（c4）は、リモートサーバーの更新が行われているかを評価する作業だった。3回実行して、終了コードはすべて0、ヒット数は0だった。しかし、設定ファイルが「ファイルが見つからない」という状態で、リモートのURLも見つからなかった。評価の根拠となる材料が最初から存在しなかったのである。

5回目の実行（c5）は、OWASPの基準と照合するための集計作業だった。3回実行して、終了コードはすべて0、ヒット数は0だった。しかし、集計に必要な結果ファイルが存在せず、ファイルを開こうとしてエラーが出ていた。

材料を買い忘れたのに「料理ができました」と報告するのと同じだ。材料がなければ料理は完成しない。評価の材料となるファイルがなければ、評価も成立しない。



## なぜ終了コードは成功を示したのか

すべてのセルが終了コード0で終わったのに、ヒット数はすべて0で、3回目のセルは出力が完全に空で、5回目のセルはファイルが見つからないエラーを出していた。成功終了コードと実際の成果物の不一致が、3つのセルで繰り返し観察された。

この不一致が起きた理由は、セルのスクリプトが「ファイルを生成する作業」と「終了コードを返す作業」を別々の経路で扱っていたからだ。ファイルの生成に失敗しても、スクリプト全体としては正常に終了したというコードを返すことができてしまう。さらに、ファイルが欠落しても、後続のセルが止まることなく実行を続ける構造になっていた。

終了コード0は、プロセスが最後まで到達したことしか示さない。

## 「ヒット0は安全」という解釈が正しい範囲

ここで、もっとも強い反論を検討する。「ヒット数が0だったのは、問題がなかったからだ。つまり安全だ」という解釈だ。この解釈は、ファイルが存在し、集計が正常に完了したパイプラインに限って正しい。

しかし、今回の実行では、根拠となるファイルが欠落し、集計がファイル不足で失敗していた。この環境では「問題がなかった」と「測定ができなかった」を区別する方法がない。期待していた「少なくとも2つの評価項目で複数の問題が検出される」という判定は、そもそもできなかった。



## 自分のパイプラインで「成功」の裏側を確認する



<div class="lm-card lm-card--takeaway" data-lm-figure="explain-takeaway" data-lang="ja"><span class="lm-card__title">結論</span><p class="lm-card__takeaway">すべてのセルでフラグが0であり集計も失敗したため、どのサーバーがどのセルで問題なのかをこの実験では判定できなかった。</p></div>

終了コードだけで検証を通過させているチームは、結果ファイルが実際に生成されているか、出力が空でないかを最初に確認する手順を追加してほしい。すでに成果物の場所と最低限のヒット数を明示しているチームは、この実験は自分たちの構造が正しいことを確認する材料にすぎない。変更する必要はない。

自分のパイプラインで「終了コード0なのに成果物がない」ケースを探してほしい。

## この記事が確認できなかったこと

- OWASPの基準による実際のフラグ判定は測定できなかった。
- 他のハーネスや他の監査スクリプトで同じ失敗が再現されるという一般化は、この記事の範囲外である。
- あるパイプラインで終了コード0とともに結果ファイルが常に存在し、内容が空でないなら、そのパイプラインには失敗を成功と見なす構造はない。

## 参考資料

1. [OWASP MCP Governance and Risk Project](https://github.com/OWASP/OWASP-MCP-Governance-and-Risk-Project)（OWASP）
2. [Model Context Protocol documentation](https://modelcontextprotocol.io)（modelcontextprotocol.io）
3. [Anthropic Claude Code documentation](https://docs.anthropic.com)（docs.anthropic.com）
4. [Claude Code settings and configuration](https://code.claude.com)（code.claude.com）