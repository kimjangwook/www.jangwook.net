---
draft: true
title: 'RTK(Rust Token Killer)を実際に試した — LLMトークンコストを60〜90%削減するCLIプロキシ'
description: >-
  RTK(Rust Token Killer)はAIコーディングエージェントのBashコマンド出力をLLMに送信する前に圧縮するCLIプロキシだ。実際にインストールし、findで90%、lsで50%のトークン削減を確認した。効果がある場合とない場合、Claude Code統合方法、正直な限界まで整理する。
pubDate: '2026-05-22'
heroImage: >-
  ../../../assets/blog/rtk-rust-token-killer-hero.png
tags:
  - llm-cost
  - claude-code
  - developer-tools
  - rust
  - token-optimization
relatedPosts:
  - slug: claude-api-prompt-caching-cost-optimization-guide
    score: 0.91
    reason:
      ko: 프롬프트 캐싱이 LLM API 호출 비용을 줄인다면, RTK는 에이전트가 실행하는 명령어의 출력 토큰을 줄인다. 두 방식은 다른 레이어를 공략하므로 함께 쓰면 시너지가 있다.
      ja: プロンプトキャッシングがAPIコストを削減するなら、RTKはエージェントのコマンド出力トークンを削減する。異なるレイヤーへのアプローチなので、併用するとシナジーが生まれる。
      en: Prompt caching reduces API call costs; RTK reduces output tokens from shell commands. They target different layers and work well together.
      zh: 提示缓存减少API调用成本，RTK减少命令输出的token。两者针对不同层级，结合使用效果更好。
  - slug: mcp2cli-token-cost-optimization
    score: 0.88
    reason:
      ko: mcp2cli가 MCP 툴 스키마 주입 토큰을 줄인다면, RTK는 셸 명령어 출력 토큰을 줄인다. LLM 에이전트 비용 최적화의 두 축을 나란히 비교해볼 만하다.
      ja: mcp2cliがMCPツールスキーマのトークンを削減するなら、RTKはシェルコマンド出力トークンを削減する。LLMエージェントコスト最適化の両軸を比較してみるとよい。
      en: While mcp2cli cuts MCP schema injection tokens, RTK cuts shell command output tokens — two complementary axes of LLM agent cost optimization.
      zh: mcp2cli削减MCP工具schema注入token，RTK削减shell命令输出token——LLM代理成本优化的两个互补方向。
  - slug: deep-thinking-ratio-llm-cost-optimization
    score: 0.83
    reason:
      ko: 이 글에서 다룬 thinking budget 최적화처럼, RTK도 LLM이 소비하는 "불필요한" 토큰을 줄이는 전략이다. 비용 절감의 접근 방식이 상호 보완적이다.
      ja: thinking budget最適化と同様に、RTKもLLMが消費する「不要な」トークンを削減する戦略だ。コスト削減アプローチが相互補完的だ。
      en: Like thinking budget optimization in that post, RTK also reduces "unnecessary" tokens LLMs consume — complementary cost-reduction strategies.
      zh: 与thinking budget优化一样，RTK也是减少LLM消耗"不必要"token的策略，两种成本削减方法相互补充。
  - slug: claude-code-hooks-workflow
    score: 0.80
    reason:
      ko: RTK가 Claude Code에 통합되는 방식이 PreToolUse 훅이다. 이 글에서 훅의 작동 원리를 먼저 이해하면 RTK 통합이 왜 그렇게 설계됐는지 납득이 된다.
      ja: RTKがClaude Codeに統合される仕組みはPreToolUseフックだ。このフックの動作原理を理解すると、RTKの統合設計の意図がよくわかる。
      en: RTK integrates into Claude Code via PreToolUse hooks. Understanding how hooks work explains why RTK is designed the way it is.
      zh: RTK通过PreToolUse hook集成到Claude Code。了解hook工作原理有助于理解RTK的集成设计。
  - slug: ai-agent-cost-reality
    score: 0.79
    reason:
      ko: AI 에이전트를 프로덕션에 돌리면 실제 비용이 예상보다 훨씬 크다는 걸 이 글에서 다뤘다. RTK는 그 비용 중 셸 명령어 출력 부분을 줄이는 구체적인 해법 중 하나다.
      ja: AIエージェントをプロダクションで動かすと実際のコストが予想より大きいことをこの記事で扱った。RTKはそのコストのうちシェルコマンド出力部分を削減する具体的な解法の一つだ。
      en: That post covered how AI agent costs exceed expectations in production. RTK is one concrete solution for the shell command output portion of that cost.
      zh: 那篇文章讨论了AI代理在生产环境中的实际成本远超预期。RTK是减少其中shell命令输出成本的具体解决方案之一。
---

Claude Codeを1ヶ月使った後に請求書を見て驚いた。API呼び出し自体より、**エージェントが実行したBashコマンドの出力**がコンテキストを大量に埋めていた。`find . -name "*.ts"`の結果が数百行、`cargo test`のログが数千行 — これが全部トークンになる。

RTK(Rust Token Killer)は、その問題をピンポイントで狙ったツールだ。AIコーディングエージェントとシェルの間に座って、コマンド出力をLLMに渡す前に圧縮する。「60〜90%トークン削減」という主張を実際に検証してみた。

## RTKが何をするツールか

一言で: **コマンド出力フィルター**。`git status`、`find`、`ls -la`といったコマンドの結果を受け取り、LLMが理解するのに必要な情報だけを残して残りを削除する。

動作方式は4つの戦略の組み合わせだ。

- **Smart Filtering**: 不要な行を削除（進行表示、タイムスタンプ、繰り返しヘッダーなど）
- **Grouping**: 類似項目をまとめて表現（`28 .ts files`のような形式）
- **Truncation**: 一定以上の長さの出力を切り捨てて`...(truncated)`と表示
- **Deduplication**: 繰り返し出力の重複除去

Claude Codeとの統合は`PreToolUse`フックを通じて行われる。[Claude Codeのフックシステム](/ja/blog/ja/claude-code-hooks-workflow)を知っていれば理解しやすい構造だ — `rtk init -g`一発で`~/.claude/hooks/`以下に自動登録される。その後Claude Codeが`git status`を実行すると、フックがそれをインターセプトして`rtk git status`に書き換える。Claude Codeはこの過程を認識しない。

対応エージェント: Claude Code、Cursor、Windsurf、Cline、GitHub Copilot CLI、Gemini CLI、Antigravity、Hermes。単一のRustバイナリで依存関係はゼロ。

## 実際にインストールして測定した

```bash
cargo install --git https://github.com/rtk-ai/rtk
```

Rustのコンパイルが必要だ。M3 Mac基準で約1分40秒かかった。インストール後の確認:

```bash
rtk --version
# rtk 0.40.0
```

Claude Codeに統合する前に、まず手動でコマンドごとの削減率を測定した。私が運用しているブログリポジトリ(Astroベース、ファイル258個)を対象にテストした。

**テスト1: `find`コマンド**

```
find src/content/blog/ko/ -name "*.md" -type f
```

- オリジナル: **15,360 chars**
- RTK: **2,070 chars**
- 削減率: **86.5%(トークン換算99.9%)**

RTKのfind出力はこんな感じになる:

```
28F 1D:

./ claude-agent-sdk-subagents-orchestration-tutorial-2026.md
claude-api-prompt-caching-cost-optimization-guide.md
claude-code-agentic-workflow-patterns-5-types.md
...
```

ファイル数のサマリー(`28F 1D: 28 files, 1 directory`)とパスを圧縮した。findの出力の大部分は繰り返しのパスプレフィックスなので、ここで劇的な削減が生まれる。

**テスト2: `ls -la`(大型ディレクトリ)**

```
ls -la src/content/blog/ko/
```

- オリジナル: **23,848 chars**(権限、所有者、タイムスタンプ含む全体)
- RTK: **12,069 chars**
- 削減率: **49.4%**

権限文字列(`drwxr-xr-x`)、所有者(`jangwook staff`)、正確なタイムスタンプを除去して、ファイル名とサイズだけを残す。LLMが実際に必要なのは大抵ファイル名とサイズなので、合理的な選択だ。

**テスト3: `git status`(小規模な出力)**

- オリジナル: **274 chars**
- RTK: むしろ増えた(追跡ファイルの詳細リストが展開される)
- 削減率: **なし(逆効果)**

これが重要な発見だ。git statusのような短い出力はRTKが逆に膨らませてしまう。

**テスト4: `git log --oneline -20`**

- 削減率: **0%**(パススルー)

短い構造化出力はRTKが手を加えない。

**全体統計(`rtk gain`)**:

```
RTK Token Savings (Global Scope)
════════════════════════════════════════════════════════════

Total commands:    6
Input tokens:      9.1K
Output tokens:     3.8K
Tokens saved:      5.5K (60.6%)
Total exec time:   153ms (avg 25ms)
Efficiency meter: ███████████████░░░░░░░░░ 60.6%

By Command
  rtk ls:    49.4% saved
  rtk find:  99.9% saved (トークン換算)
  rtk git:   0% saved
```

6回のコマンド実行で平均60.6%削減という結果が出た。ただしfindやlsのような大容量出力コマンドが多く含まれたテストなので、数字が有利に出た面はある。

## 効果がある場合とない場合

正直に言うと、主張する「60〜90%」削減は常にそう出るわけではない。コマンドの種類によって効果が明確に分かれる。

**RTKが効果的なコマンド**:

| コマンド | 理由 |
|---------|------|
| `find` | パスの繰り返しが大半 → 要約時に劇的な圧縮 |
| `ls -la`(大型ディレクトリ) | 権限・所有者情報削除の効果 |
| `cargo test` | 成功ケースを削除し、失敗のみを残す |
| `npm test` / `jest` | テストサマリーの圧縮 |
| `docker ps` | 長いコンテナID・ポート情報の圧縮 |
| `grep -r`(大容量) | コンテキスト行の削除 |

**RTKが効果を発揮しないコマンド**:

| コマンド | 理由 |
|---------|------|
| `git status`(小規模変更) | 既に短い出力 → 圧縮の余地なし |
| `git log --oneline` | 既に圧縮された形式 |
| `cat`(単一ファイル) | 内容自体が必要 → 圧縮不可 |
| `echo`、`pwd`等のシンプルなコマンド | パススルー |

プロジェクトの特性によって結果は異なる。TypeScriptモノレポで`tsc --noEmit`を頻繁に実行するなら、RTKの効果は大きいだろう。主にAPI呼び出しと単純なファイル修正が繰り返されるプロジェクトなら、体感できないかもしれない。

## Claude Codeへの統合方法

2ステップだ。

**ステップ1: インストール**

```bash
cargo install --git https://github.com/rtk-ai/rtk
```

**ステップ2: Claude Codeフック登録**

```bash
rtk init -g
```

`-g`はグローバル設定(`~/.claude/`)。プロジェクトごとにのみ適用したい場合は`-g`なしで実行する。実行すると次のことを聞かれる:

- `~/.claude/settings.json`にフックを自動追加するか(y推奨)
- `~/.claude/RTK.md`を作成するか(Claudeがrtk使用法を認識するファイル)

インストール後にClaude Codeを再起動すると、以降のBashツール呼び出しが自動的にRTKを通じて書き換えられる。`git status`を実行して`rtk gain`に記録が生成されれば統合成功だ。

注意点が一つある。RTKフックは**Bashツール呼び出しにのみ**適用される。Claude Code内蔵ツールのRead、Grep、Globはフックを経由しないため、RTKの影響を受けない。実際の削減効果は、エージェントがどれだけBashを通じてファイル探索を行うかにかかっている。

もう一つ: `rtk`という名前のRustツールがもう一つある — [reachingforthejack/rtk](https://github.com/reachingforthejack/rtk)(Rust Type Kit)。インストール後に`rtk gain`が動作しない場合、別のツールが名前衝突を引き起こしている可能性がある。

## 開発者コスト最適化の文脈で見ると

LLMエージェントコストを削減する方法は大きく3レイヤーある:

1. **モデル選択**: 安いモデルに切り替え(Haiku、Flashなど)
2. **APIレイヤー**: [プロンプトキャッシング](/ja/blog/ja/claude-api-prompt-caching-cost-optimization-guide)、バッチAPI、[MCPスキーマ圧縮](/ja/blog/ja/mcp2cli-token-cost-optimization)
3. **シェルレイヤー**: RTK(コマンド出力圧縮)

RTKは3番のレイヤーに属する。まだここまで最適化していないプロジェクトなら導入価値がある。しかし既にモデル選択やキャッシングでコストを管理しているなら、RTKの貢献分は相対的に小さくなる。

個人的に最も気に入っている点は**インストール後に何もしなくていいという点**だ。`rtk init -g`一発で終わる。毎回コマンドを`rtk xxx`に変えて書く必要がなく、既に行っていたようにClaude Codeに指示するだけでよい。このような透過的な最適化は、心理的な抵抗が低い。

## 正直な限界

RTKを数日使って感じた不便な点もある。

**一つ目**: RTKがコマンド出力を圧縮する過程で、重要な情報を削除することがある。失敗したテストケースでエラースタックトレースの一部が切り捨てられる経験をした。`rtk err <command>`または`rtk proxy <command>`で元の出力を確認できるが、Claude Codeが自動的にこの判断を下すのは難しい。

**二つ目**: インストールにRustツールチェーンが必要だ。チーム全体がRustなしで作業する環境では、オンボーディングが面倒だ。公式バイナリ配布がない(v0.40.0時点)。

**三つ目**: 貢献分を誇張しないことが重要だ。私の実際の開発ワークフローで、Claude Codeコストの相当な部分はRead、Grep、コード生成自体だ — RTKが触れない領域。「60〜90%削減」はfind/ls集中テストの数字であり、混合ワークロードでは10〜30%程度が現実的だと思う。

RTKを過大評価されたツールとは見ていない。しかし「Claude Codeコストを半分にしてくれる」という期待も持たないほうがいい。**大容量ファイル探索やテスト実行が多いプロジェクト**なら、確実に効果的だ。そうでなければ一桁台の削減にとどまる可能性がある。

## 見逃した節約を探す: `rtk discover`

RTKで過小評価されている機能の一つが`discover`だ。既存のClaude Codeセッション履歴を分析して、「このコマンドをrtkで実行していたらいくら節約できたか」を逆算してくれる。

```bash
rtk discover
```

私の場合、履歴の中で最もトークンを無駄にしていたコマントはTOP3が`find`、`npm install`(verboseログ)、`docker logs`だった。このうちClaude Codeを通じてBashで実行していたのは`find`がほとんどで、残り二つは直接ターミナルで実行していたので、フックの範囲外だった。

セッションごとの統計も確認できる:

```bash
rtk session
```

セッションごとの総トークン節約とフックリライト率が表示される。自分がClaude Codeを使う際のBash重視 vs ネイティブツール使用パターンを実データで把握できて、意外と参考になる。

## 他のトークン最適化方法との比較

コスト最適化の観点でRTKをどこに位置づけるかを整理するとこうなる。

| 方法 | レイヤー | 適用対象 | 実装複雑度 | 期待節約 |
|------|---------|---------|---------|--------|
| モデル切り替え(Haiku/Flash) | 価格 | 全API呼び出し | 低 | 5〜20倍(価格差) |
| プロンプトキャッシング | API | 繰り返しシステムプロンプト | 中 | 40〜70% |
| MCPスキーマ圧縮(mcp2cli) | API | MCPツール注入 | 中 | 96〜99% |
| RTK | シェル | Bashコマンド出力 | 低 | 0〜90%(コマンドによる) |

[プロンプトキャッシング](/ja/blog/ja/claude-api-prompt-caching-cost-optimization-guide)は繰り返しワークフローで強力だ。[MCPスキーマ圧縮](/ja/blog/ja/mcp2cli-token-cost-optimization)は多くのMCPツールを使う環境で劇的な節約が可能だ。RTKは実装の摩擦が最も低く、既存のワークフローをまったく変えずに済む点で「とりあえず入れておく」ツールに近い。

エージェントのコストは複数の要素が複合的に積み重なる構造だ。RTKは「シェルコマンド出力」というその一角を扱い、それを透過的にこなす。「コストスタックのもう一つのレイヤー」として捉えるのが正しい見方で、銀の弾丸ではない。

## インストールすべきか

私の判断は: **インストールしてみて、期待値は低く保て。** `cargo install`で1分40秒の投資をして`rtk init -g`一発でいい。`rtk gain`を一週間後に開けて10%以上削減が出たら使い続けて、そうでなければ`rtk init -g --uninstall`で削除すればいい。

RTK自体はよく作られたツールだ。50以上のサポートコマンド、きれいなエージェント統合、しっかりしたトラッキング。期待値の調整が鍵で、「コストを半分にしてくれる」ではなく「あると便利な最適化レイヤー」として捉えるのが正解だ。

MITライセンス、無料、オープンソース。損は何もない。

GitHub: [rtk-ai/rtk](https://github.com/rtk-ai/rtk)  
公式サイト: [rtk-ai.app](https://www.rtk-ai.app/)
