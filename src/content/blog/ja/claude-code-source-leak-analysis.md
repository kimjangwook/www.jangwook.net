---
title: Claude Codeソース流出 — 51万行から読み解くエージェントアーキテクチャの内側
description: >-
  Anthropicのnpmパッケージ配布ミスでClaude
  Codeの全ソースが公開された。エージェントループ、メモリシステム、コスト最適化戦略まで、流出コードから開発者が持ち帰れるものを整理する。
pubDate: '2026-04-05'
heroImage: ../../../assets/blog/claude-code-source-leak-analysis-hero.jpg
tags:
  - claude-code
  - anthropic
  - ai-agent
  - source-code
  - security
relatedPosts:
  - slug: claude-code-local-model-inefficiency
    score: 0.95
    reason:
      ko: 'AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: 'Covers similar topics in AI/ML, architecture with comparable difficulty.'
      zh: 在AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: anthropic-pentagon-ai-governance-cto-lessons
    score: 0.95
    reason:
      ko: 'AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: 'Covers similar topics in AI/ML, architecture with comparable difficulty.'
      zh: 在AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: ccc-vs-gcc-ai-compiled-c-compiler
    score: 0.94
    reason:
      ko: 'AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: 'Covers similar topics in AI/ML, architecture with comparable difficulty.'
      zh: 在AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: gpt4o-retirement-model-dependency-risk
    score: 0.94
    reason:
      ko: 'AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: 'Covers similar topics in AI/ML, architecture with comparable difficulty.'
      zh: 在AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: nist-ai-agent-security-standards
    score: 0.94
    reason:
      ko: 'AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: 'Covers similar topics in AI/ML, architecture with comparable difficulty.'
      zh: 在AI/ML、架构领域涵盖类似主题，难度相当。
---

3月31日、AnthropicがnpmにClaude Code v2.1.88を配布した。普通のパッチアップデートのはずだったが、このパッケージの中に59.8MBの`.map`ソースマップファイルが入っていた。セキュリティ研究者のChaofan ShouがこれをXに投稿した後、数時間でGitHubで8万4千回フォークされた。

1,906個のTypeScriptファイル。約51万行のコード。Claude Codeのクライアントサイドエージェントハーネス全体がそのまま露出した。

自分でこのソースコードを読み込んでみたところ、いくつか興味深い設計判断を見つけた。「流出」という言葉が持つセンセーショナルなニュアンスよりも、このコードベースからエージェント開発者が実際に参考にできるパターンに集中したい。

## どうやって流出したのか

原因はBunだ。Claude CodeはNode.jsではなくBunランタイム上で動いているが、Bunにはプロダクションビルドでもソースマップをサーブしてしまう[既知のバグ](https://github.com/oven-sh/bun/issues/28001)があった。このイシューは3月11日にすでに報告されていたが、流出時点までに修正されていなかった。

Anthropic側は「デプロイパッケージングプロセスのヒューマンエラーであり、セキュリティ侵害ではない」とCNBC、VentureBeatに説明した。顧客データや認証情報は含まれていないとのこと。

ところが、これは2回目だ。数日前にもCMS設定ミスで未公開モデル「Mythos」関連の内部ドキュメントが流出していた。IPO準備中という噂が流れている時期に、運用セキュリティがこれでいいのかと思ってしまう。

## エージェントループ — 思ったより単純じゃない

流出コードで最初に目に留まったのはエージェントループの構造だ。

基本的にClaude Codeはリアクティブシステムだ。ユーザーがメッセージを送ったら、そのとき反応する。ここまでは普通。ところがコードの中に`PROACTIVE`というフィーチャーフラグがあり、これをオンにすると`KAIROS`というモードが有効になる。KAIROSはハートビートメカニズムで定期的に「今やるべきことはあるか？」を評価し、ユーザー入力なしでも自律的に行動する。

簡単に言えば、バックグラウンドで24/7回りながら「メモリを整理しようか？」「このコードのリファクタリングを提案しようか？」といった判断を自分で下すデーモンモードだ。

この構造で注目したのは、「イニシアティブ（何をするか決める）」と「実行（実際にやる）」が明確に分離されている点だ。KAIROSが「これはやる価値がある」と判断しても、実行権限は別のゲートを通過しなければならない。自律エージェントを作るとき最も危険なのは「AIが勝手にやって大変なことになった」シナリオだが、この分離設計がそのリスクをある程度軽減している。

まだリリースされていない機能なので、実際にどれくらいうまく動くかはわからない。

## プロンプトキャッシング — コストを抑える技術

Claude Codeをそれなりに使ったことがある人なら、トークンコストがかなりかかることを知っているだろう。流出コードを見ると、Anthropicもこれを深刻に気にしている。

核心は`SYSTEM_PROMPT_DYNAMIC_BOUNDARY`というパターンだ。システムプロンプトを「変わらない前半部分」と「毎回変わる後半部分」に分割する。前半部分をキャッシュに入れて再利用することで、高価なプロンプト処理コストを削減する。

```typescript
// 流出コードで見つかったパターン（簡略化）
const systemPrompt = [
  STATIC_INSTRUCTIONS,        // キャッシュ済み — ツール定義、行動ルールなど
  SYSTEM_PROMPT_DYNAMIC_BOUNDARY,  // 境界マーカー
  DYNAMIC_CONTEXT              // 毎回新規 — 現在のファイル状態、git情報など
];
```

Reddit r/ClaudeAIでは、流出コードをもとに「キャッシュ無効化バグ」を見つけ出し、トークン消費を10〜20倍削減したという報告もあった。Theo Browneのような開発者は、このキャッシュ無効化バグがユーザーに不必要なコストを転嫁していたと批判した。

このパターン自体は自分のプロジェクトでも使える。LLM APIを呼び出すときにシステムプロンプトの静的部分を分離してプロンプトキャッシングを活用すれば、特に長い会話セッションでコストをかなり抑えられる。

## 3階層メモリ — なぜClaude Codeはコンテキストをよく覚えているのか

メモリアーキテクチャが印象的だった。3階層構造になっている：

<strong>第1層 — 軽量インデックスポインタ</strong>：常にメモリに常駐。「あるトピックに関する記憶がどこに保存されているか」だけを示す目次の役割。

<strong>第2層 — トピックファイル</strong>：必要なときだけロード。プロジェクト別、トピック別に分離された実際の記憶内容。

<strong>第3層 — トランスクリプト</strong>：grep演算でのみアクセス。過去の会話全体を保存しているが、検索時のみ参照。

ここに`autoDream`というプロセスがある。アイドル状態のときにメモリを整理し、重複を除去し、統合する。名前が「autoDream」なのが面白い — 人間が寝ている間に記憶を整理するように、エージェントも休んでいるときに記憶を整理するというメタファーだ。

この設計を見て思ったこと：自分がCLAUDE.mdにプロジェクトコンテキストを書いておくとClaude Codeがそれをうまく活用する理由が、このメモリ構造にあったのか。第1層インデックスが「このプロジェクトの情報はCLAUDE.mdにある」というポインタを持っていて、必要なときに第2層で実際の内容を読み込む仕組みだ。

## アンダーカバーモード — これはちょっと気になる

流出コードの中に`undercover.ts`という90行のファイルがある。何をするかというと、Claude Codeが外部オープンソースプロジェクトにコントリビュートするとき、Anthropicの痕跡を消す機能だ。

システムプロンプトにこんな内容が含まれている：

> "You are operating UNDERCOVER... Your commit messages... MUST NOT contain ANY Anthropic-internal information. Do not blow your cover."

コミットメッセージから内部コードネーム（Capybara、Numbat、Fennec、Tengu）やSlackチャンネル名を削除し、「Claude Code」が作成したという表示も消す。不可逆的（irreversible）な抑制だという。

これはちょっと気になる。オープンソースコミュニティでAIがコントリビュートすること自体は問題ではないが、それを隠すのは別の話だ。コントリビューションの出所を意図的に隠すのは、オープンソースの透明性原則と衝突すると思う。Anthropicがこの機能をなぜ作ったか説明しない限り、信頼に傷がつく。

もちろん、これが実際に使われている機能なのか、それとも実験的に作っただけで使っていないのかは、コードだけ見てはわからない。フィーチャーフラグで管理されているので、無効状態の可能性もある。

## 競合他社への防御メカニズム

ソースコードから競合を意識した防御装置もいくつか見つかった。

<strong>アンチディスティレーション</strong>：APIリクエストに`anti_distillation: ['fake_tools']`フラグを入れて、偽のツール定義を注入する。競合他社がトラフィックを傍受して学習データとして使うとき、この偽データが混入するようにする仕組みだ。`CONNECTOR_TEXT`というサーバーサイドメカニズムは、アシスタント出力を要約しつつ暗号化署名を挿入し、推論チェーン全体のキャプチャを防止する。

<strong>DRM</strong>：APIリクエストに`cch=ed1b0`のようなプレースホルダー値が入り、BunのZigベースHTTPスタックが送信直前にこれを計算済みハッシュに置き換える。JavaScriptランタイムの下で動作するため、ランタイムパッチングでの回避ができない。

調べた限りでは、このレベルのアンチディスティレーション防御をクライアントサイドコードに入れたのは初めて見るパターンだ。通常こういうのはサーバーで処理するのでは？クライアントに入れると、結局コードが流出したとき（今のように）メカニズムが全部露出するリスクがある。

## 隠された機能たち — 44個のフィーチャーフラグ

44個の未リリースフィーチャーフラグが見つかった。そのうちいくつかを紹介する：

- <strong>バックグラウンドエージェント</strong>：24/7常時実行。1つのClaudeが複数のワーカーClaudeをオーケストレーションするマルチエージェント構成。
- <strong>クロンスケジューリング</strong>：決められた時間に自動実行。
- <strong>ボイスコマンドモード</strong>：音声で指示。
- <strong>Playwrightブラウザオートメーション</strong>：ブラウザを直接操作。
- <strong>自己修復エージェント</strong>：スリープ後に自動再開。
- <strong>サブエージェント実行モデル3種</strong>：fork、teammate、worktree。

そして冗談みたいなのもある。`buddy/companion.ts`というファイルに18種のバーチャルペットを育てる「バディシステム」が実装されている。レア等級ティアがあり、1%の確率で光る（shiny）ペットが出る。ポケモンかよ。

これらの機能のうち一部は、すでに最近のClaude Codeアップデートで正式リリースされた。バックグラウンドエージェントやクロンスケジューリングは、流出後に素早く公式化された印象がある。流出がリリースを前倒しした可能性もあるのではないだろうか。

## セキュリティの観点で押さえておくべきこと

流出そのものより深刻な問題がある。すでにCVE-2025-59536、CVE-2026-21852といった脆弱性が特定されており、ソースコードが公開されたことで悪用がずっと容易になった。

具体的には：
- 悪意のある`.claude/`設定ファイルが含まれたリポジトリをクローンすると、任意コード実行（RCE）が可能
- MCPサーバーや環境変数を通じたAPIキーの窃取

BleepingComputerの報道によると、実際にGitHubで「Claude Code流出分析」を餌にインフォスティーラーマルウェアを配布するケースが見つかった。流出コードを見ただけでハッキングされるわけではないが、「流出コード分析ツール」を名乗るリポジトリには注意が必要だ。

個人的には、コードが公開されること自体は長期的にはセキュリティにプラスになる可能性もある。より多くの目がコードをレビューできるからだ。問題は「意図しない公開」だという点。Anthropicが準備なしにコードが流出してしまい、その間に攻撃者が先に脆弱性を見つけていたら危険だ。

## 開発者が持ち帰れるもの

流出コードを直接フォークして使うのはDMCAの問題があるのでお勧めしない。AnthropicはGitHubで8,100以上のリポジトリにDMCAテイクダウンをかけた。ただし、アーキテクチャパターンを参考にするのは別の話だ。

自分が最も参考になると思ったもの：

<strong>プロンプトキャッシング戦略</strong>。システムプロンプトを静的/動的に分離するパターンは、LLM APIを使うすべてのプロジェクトに適用できる。Anthropic APIのprompt caching機能を使えば、繰り返し呼び出しのコストを大幅に削減できる。

<strong>3階層メモリ設計</strong>。インデックス → トピック → 元データの階層構造は、RAGシステムや長期記憶が必要なエージェントにそのまま適用可能だ。特に「常にメモリにあるもの」と「必要なときだけロードするもの」の分離が鍵となる。

<strong>イニシアティブと実行の分離</strong>。自律エージェントを作るとき、「何をするか決めるモジュール」と「実際に実行するモジュール」を分離し、間に権限ゲートを置くパターン。これはプロダクションエージェントで事故を減らすのに直接的に役立つ。

## それでAnthropicはどうするのか

Sigrid Jinという開発者が、流出したTypeScriptコードをOpenAI CodexでPythonに書き直して「claw-code」というプロジェクトを作った。2時間でGitHubスター5万個を達成し、現在は10万5千個だ。AIで書き直したコードに著作権が適用されるかは、まだ法的に明確ではない。

AnthropicはDMCAテイクダウンで対応したが、一度インターネットに広まったコードは消えない。すでに分析結果が数十のブログ、Wiki、フォーラムに拡散している。ある意味、これは「強制オープンソース」になった格好だ。

1つ気になるのは、この事件がAnthropicのオープンソース戦略に影響を与えるかどうかだ。すでにコードが全部公開された状態で、クローズドソースを貫くことに意味があるのか。むしろ公式にオープンソースに転換してコミュニティコントリビューションを受け入れるほうが賢い選択かもしれない。もちろん、アンチディスティレーションのような競争防御装置を公式に公開したくはないだろうが。

この事件の最大の教訓は技術的なことではないかもしれない。npmに配布するパッケージの`.map`ファイルをもう一度確認すること。`files`フィールドや`.npmignore`でソースマップを明示的に除外しているか — 自分のプロジェクトも点検してみなければ。

## 参考資料

- [Engineer's Codex — Diving into Claude Code's Source Code Leak](https://read.engineerscodex.com/p/diving-into-claude-codes-source-code)
- [Kilo Blog — Claude Code Source Leak: A Timeline](https://blog.kilo.ai/p/claude-code-source-leak-a-timeline)
- [Fortune — Anthropic leaks its own AI coding tool's source code](https://fortune.com/2026/03/31/anthropic-source-code-claude-code-data-leak-second-security-lapse-days-after-accidentally-revealing-mythos/)
- [VentureBeat — Claude Code's source code appears to have leaked](https://venturebeat.com/technology/claude-codes-source-code-appears-to-have-leaked-heres-what-we-know)
- [SecurityWeek — Critical Vulnerability in Claude Code Emerges Days After Source Leak](https://www.securityweek.com/critical-vulnerability-in-claude-code-emerges-days-after-source-leak/)
- [Kir Shatrov — Reverse engineering Claude Code](https://kirshatrov.com/posts/claude-code-internals)
- [BleepingComputer — Claude Code leak used to push infostealer malware](https://www.bleepingcomputer.com/news/security/claude-code-leak-used-to-push-infostealer-malware-on-github/)
