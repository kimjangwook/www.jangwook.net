---
title: '@importとシンボリックリンク、CLAUDE.mdはどちらで壊れるか21回実測'
description: 'CLAUDE.mdにAGENTS.mdを読ませる三つの方法を7条件×3回、計21回headlessで実測した。リポジトリ外を指す@importだけが承認ゲートで0/3になり、警告もエラーも出ない。symlinkとどちらを選ぶかは好みではなく、対象ファイルの置き場所とだれが実行するかで決まる。'
pubDate: '2026-08-19'
heroImage: '../../../assets/blog/claude-md-at-import-agents-md-vs-symlink-2026/hero.png'
tags:
  - claude-code
  - agents-md
  - claude-md
  - ai-agent
  - devops
faq:
  - question: 'CLAUDE.mdでAGENTS.mdを読み込む方法は何がありますか。'
    answer: '公式ドキュメントは二つの経路を示す。ひとつはCLAUDE.mdの中に`@AGENTS.md`と書くimport、もうひとつは`ln -s AGENTS.md CLAUDE.md`のシンボリックリンクだ。加えてv2.1.213以上では`/import`スラッシュコマンドが一度きりのコピーを作る。'
  - question: 'リポジトリ外のファイルをimportするとどうなりますか。'
    answer: 'そのimportは外部importとして扱われ、初回に承認ダイアログが出る。ヘッドレス実行にはこのダイアログが存在しないため、実測では3回とも0/3、つまりAGENTS.mdの内容が一度もコンテキストに乗らなかった。警告もエラーも出ず、モデルは未展開の`@/tmp/...`という文字列を一行返しただけだった。'
  - question: 'symlinkと@importはどちらを使うべきですか。'
    answer: '判断基準は本文「誰に合うか」のとおり。結論だけ言えば、`@import`を選んだなら相対`@AGENTS.md`をCLAUDE.mdに書き、symlinkを選んだなら`ln -s AGENTS.md CLAUDE.md`を張って`core.symlinks`とWindows checkoutの扱いをオンボーディング手順に明記する。'
  - question: '指示ファイルがちゃんと読み込まれたか確認する方法はありますか。'
    answer: '対話セッションでは`/context`を実行するとMemory files欄にCLAUDE.mdが表示される。ヘッドレス実行にはこの画面がないため、AGENTS.mdの末尾にカナリアトークンを仕込み、`claude -p`の出力にそれが現れるかで生死を判定するしかない。'
relatedPosts:
  - slug: agents-md-vs-claude-md-loading-measured-2026
    score: 0.8
    reason:
      ko: 지난 글이 symlink 로딩을 3/3으로 측정하고 @import를 미측정으로 남겼다면, 이번 글은 그 미측정 구간을 21런으로 채우고 두 경로가 왜 다른 조건에서 실패하는지를 규명한다.
      ja: 前稿がsymlinkの読み込みを3/3と測り、@importを未測定のまま残した空白を、21回の実行で埋めて二つの経路がなぜ異なる条件で失敗するかを突き止める。
      en: The prior post measured symlink loading at 3/3 and left @import unmeasured. This post fills that gap with 21 runs and pins down why the two routes fail under different conditions.
      zh: 前文将symlink加载测得3/3，却把@import留作未测。本文用21次执行填补这一空白，并厘清两条路径为何在不同条件下失效。
  - slug: declared-rules-fail-open-robots-txt-agents-md-2026
    score: 0.74
    reason:
      ko: 선언된 규칙이 예외 없이 조용히 통과되는 실패 패턴을 공유한다. robots.txt와 AGENTS.md의 32KiB 절단이 파서 단의 침묵이었다면, 이번 글은 승인 게이트를 통과하지 못한 import가 어떻게 같은 침묵으로 끝나는지 보여준다.
      ja: 宣言された規則が例外なく静かに素通りする失敗パターンを共有する。robots.txtとAGENTS.mdの32KiB切り捨てがパーサー側の沈黙だったとすれば、承認ゲートを通らなかったimportが同じ沈黙で終わる様子を追う。
      en: Shares the fail-open pattern where declared rules pass through silently, no exception raised. Where the previous post found silence at the parser's 32KiB truncation, this one finds the same silence at an import that never cleared the approval gate.
      zh: 共享声明规则被静默放行、无异常抛出的失效模式。前文在解析器32KiB截断处发现了沉默，本文则在未通过审批门的import上发现了同样的沉默。
  - slug: cognitive-debt-agentic-coding-2026
    score: 0.62
    reason:
      ko: 에이전트에게 위임하는 설정 파일이 결국 신뢰의 단위가 된다는 문제의식을 공유한다. 코드 리뷰 부채가 사람이 검증을 미룬 결과였다면, 이번 글의 승인 게이트는 그 검증을 언제 어떻게 되돌려받을지를 다룬다.
      ja: エージェントに委ねる設定ファイルが結局は信頼の単位になるという問題意識を共有する。コードレビュー負債が人間の検証先送りの結果だったとすれば、承認ゲートはその検証をいつどう取り戻すかを扱う。
      en: Shares the concern that a config file handed to an agent becomes a unit of trust. Where code-review debt was the result of humans deferring verification, this post's approval gate is about when and how that verification comes back.
      zh: 共享交给Agent的配置文件最终会成为信任单位这一问题意识。如果说代码评审债务是人类推迟验证的结果，本文的审批门则关乎这种验证何时、如何被找回。
---

先週の金曜、同僚に聞かれた。「CLAUDE.mdに`@AGENTS.md`と書くのと、symlinkを張るのと、結局どっちが正しいの」。公式ドキュメントを読み直しても、両方が同じ目的地に着くと書いてあるだけで、条件による違いには触れていない。ドキュメントの記述だけでは分からないため、対象ファイルの置き場所と実行環境を変えながら手元で試すことにした。

[前稿](/ja/blog/ja/agents-md-vs-claude-md-loading-measured-2026/)ではsymlinkの読み込みを3/3と測り、`@import`を未測定のまま残した。試した結果、二つは同じ動作をしない。片方はファイルシステムが解決し、もう片方はClaude Code自身が解決する。壊れ方が違う。

## 事実整理 — 公式が示す三つの経路

Claude Codeのmemoryページはこう書いている。

> Claude Code reads `CLAUDE.md`, not `AGENTS.md`. If your repository already uses `AGENTS.md` for other coding agents, create a `CLAUDE.md` that imports it so both tools read the same instructions without duplicating them.
> — [How Claude remembers your project](https://code.claude.com/docs/en/memory)

続けて、Claude固有の追記が要らないならsymlinkでもよいとある。

> A symlink also works if you don't need to add Claude-specific content
> — [How Claude remembers your project](https://code.claude.com/docs/en/memory)

コマンドはそのまま `ln -s AGENTS.md CLAUDE.md` だ。v2.1.213以上には`/import`スラッシュコマンドがあり、AGENTS.mdだけでなくMCPサーバーやコマンド、サブエージェント、スキルまで一度きりでコピーする。三つ目の経路はコピーのため、以降ソースが変わっても追随しない。公式ドキュメントにはここまでの仕様しかなく、三つのうちどれを選ぶべきかの判断基準は書かれていない。

## 仕組み — なぜ壊れ方が違うのか

symlinkはファイルシステムが解決する。Claude Codeのmemoryローダーが`CLAUDE.md`を開く時点で、カーネルはすでにリンクをたどってターゲットのバイト列を渡し終えている。ローダーが見るのはプロジェクト直下にある一個の普通のファイルであり、中身がリポジトリ外から来たという情報は、その時点で存在しない。

一方、`@`によるimportはローダー自身が解決する。ローダーはパスを文字列のまま保持し、作業ディレクトリの外に出るかを判定できる。外に出るなら承認ゲートの前に置く。判断できるのは、情報を握っている側だけだ。

この仕組みを裏づけるのが条件fとgだ。絶対パスでもリポジトリ内を指せば3回とも読み込みが通り、symlinkでリポジトリ外を指しても3回とも通る。落ちるのは条件eだけ、つまり`@import`がリポジトリの外を指したときに限られる。

## 数字の検証 — 21回の実測

macOS、Claude Code 2.1.233、ヘッドレス実行で`--output-format json`、`~/.claude/CLAUDE.md`は全条件で固定した。AGENTS.mdにカナリアトークン`ZQ7CANARY`を仕込み、`claude -p 'Reply with exactly the word OK and nothing else.'`を7条件×3回、計21回走らせた。返答にカナリアが現れれば指示ファイルがコンテキストに届いた証拠になる。

| 条件 | 設定 | 結果 |
|---|---|---|
| a | `CLAUDE.md = "@AGENTS.md"`、相対パス、リポジトリ内 | 3/3 |
| b | `CLAUDE.md -> AGENTS.md`、symlink、リポジトリ内 | 3/3 |
| c | `CLAUDE.md`が`AGENTS.md`の一回限りコピー(`/import`出力の近似) | 3/3 |
| d | `AGENTS.md`のみ、`CLAUDE.md`なし(対照) | 0/3 |
| e | `CLAUDE.md = "@/tmp/claudemd-lab-ext/AGENTS.md"`、絶対パス、リポジトリ外 | 0/3 |
| f | `CLAUDE.md = "@<リポジトリ内の絶対パス>/AGENTS.md"` | 3/3 |
| g | `CLAUDE.md -> <リポジトリ外のファイル>`、symlink | 3/3 |

条件eだけが落ちた。「プロジェクトレベルのmemoryファイル内のimportは、そのパスが作業ディレクトリの外に出るとき外部とみなされる」という仕様のとおりで、外部importには初回に承認ダイアログが出るが、ヘッドレス実行にはその承認ダイアログを出す画面自体が存在しない。

> The first time Claude Code encounters external imports in a project, it shows an approval dialog listing the files. If you decline, the imports stay disabled and the dialog doesn't appear again.
> — [How Claude remembers your project](https://code.claude.com/docs/en/memory)

条件eで「ツールを使わず、このセッション開始時に受け取ったプロジェクト指示をそのまま出力せよ」と別途聞いてみると、モデルは`@/tmp/claudemd-lab-ext/AGENTS.md`という未展開の一行をそのまま返した。警告もエラーもない。import先の中身は一度もコンテキストに乗らなかった。承認状態が残っているかも確認したが、プロジェクトに`.claude/`ディレクトリは作られず、ホームの設定にもパスの記録はなかった。承認の有無はリポジトリにコミットされる情報ではない。

CLAUDE.mdを`@`で分割してもコンテキストの節約にはならない。読み込んだファイルはセッション開始時に丸ごと乗るからだ。三つの経路でトークン数を切り分けようとしても、キャッシュ生成とキャッシュ読み込みの変動幅がファイルサイズの差を上回り、経路ごとの差として取り出せなかった。ファイルを分けるのは整理のためであって、トークンを減らすためではない。

## 比較軸 — 六つの基準で並べる

| 基準 | @import | symlink | `/import`一回限りコピー |
|---|---|---|---|
| リポジトリ内読み込み | 3/3 | 3/3 | 3/3 |
| リポジトリ外参照 | 承認ゲート、ヘッドレスで0/3 | 3/3 | コピー時点で凍結 |
| ソースとの同期 | 保たれる | 保たれる | 崩れる |
| Windows対応 | 問題なし | 権限・checkout変数あり | 問題なし |
| Claude専用の追記可否 | 可 | 不可 | 可 |
| 失敗時のシグナル | 沈黙 | リンク切れ=ファイル不在 | 何もない、静かに古びるだけ |

一行目以外、三つの経路はすべて異なる値を持つ。「どちらでも同じ」が成り立たないのは、この違いがあるからだ。Windowsの行は実機で直接測っておらずドキュメントの記述とgitの挙動に基づく推論だが、Windowsでsymlinkを作るには管理者権限か開発者モードが要る。ドキュメントがWindowsユーザーに`@AGENTS.md`のimportを勧めるのはそのためだ。`core.symlinks=false`のWindows checkoutでは、リンクが生パス文字列の入ったテキストファイルとして落ちてくる。Claude Codeはそのテキストファイルを指示本文として読み込んでしまうため、Windows混在環境では`@import`が安全な選択肢になる。

## 明示的な反対 — 「対話なら一度承認すれば済む」という主張

この結果を見せると、反論が返ってくる。「条件eが落ちたのはヘッドレスにダイアログがないからだ。実際の作業は対話式で、一度承認すればそれで終わりじゃないか」。

この反論は半分正しい。一人の開発者が一台のマシンで対話的に作業する場合、承認は一度きりで、承認後のimportはClaude専用セクションを追記できる利点を保ったまま、symlinkと同じように振る舞う。この主張が通る場面はある。

だがCI、フック、cron、生成されたばかりのサブエージェントには操作者がいない。ダイアログを開く人間がいなければゲートは永遠に開かない。承認はユーザーとマシンに紐づく――前節で確かめたとおりリポジトリにはコミットされない情報だ。新しいメンバーが加わるたびに同じダイアログが出て、ドキュメントによれば一度でも誤って拒否すればその拒否状態は恒久的に固定される。取り消しや再承認の手順はドキュメントに書かれていない。今日対話専用のリポジトリだからといって、明日もそうだという保証はない。フックを一つ足し、夜間のcronを一つ足せば、その経路上では昨日までのルールが通知もなく黙って消える。

対話中心の作業なら反論のとおりで足りる。自動化が一つでも入る現場では、無人経路への配慮が欠かせない。

## 誰に合うか

リポジトリ内にある一つのAGENTS.mdを複数のツールに読ませたいモノレポには`@import`が向く。WindowsとmacOSとLinuxが混在するチームでも、symlinkの権限問題とcheckout変数を最初から消せるため選びやすい。共有規約の下にClaude専用ルールを重ねたい場合にも適している。

一方、ホームディレクトリの個人的な規約を複数のリポジトリで使い回したいならsymlinkが向く。ゲートに一度も出会わない。`claude -p`をCIやフック、cronで動かすパイプラインにも向く。

両方の条件が絡む場合、たとえばリポジトリ外のファイルをCIで読ませたいなら、外部依存を先にリポジトリ内へ移してから相対importを使う。もっとも向かないのは、ヘッドレス経路に置かれたリポジトリ外向けの`@import`だ。承認ダイアログを開く人間がいないまま、警告もエラーもなく指示が届かない状態に陥る。`core.symlinks`がoffのWindows checkout上のsymlink、トークン節約狙いのimport分割、`/import`一回限りコピーへの長期依存、指示到達を誰も確認しない構成も避けるべきだ。

## 実行可能性

判断が済んだら、あとは手を動かすだけだ。`@import`を選んだ場合は相対`@AGENTS.md`をCLAUDE.mdに書き、その行の下にClaude専用ルールを足す。symlinkを選んだ場合は`ln -s AGENTS.md CLAUDE.md`を張り、`core.symlinks`とWindows checkoutの扱いをオンボーディング手順に明記しておく。

読み込みが実際に生きているかを知る手段は二つしかない。対話セッションでは`/context`を実行し、Memory files欄にCLAUDE.mdが表示されるかを見る。ヘッドレス実行にはこの画面がない。AGENTS.mdの末尾にカナリアトークンを仕込み、`claude -p 'Reply with exactly the word OK and nothing else.' | grep -q 'ZQ7CANARY' && echo alive || echo silent`のような一行で生死を測る。

## 限界

今回測っていないことも書いておく。もっとも大きいのは対話式の承認ダイアログそのものを見ていないことだ。承認後どれくらいその状態が続くのか、拒否したあとに復旧する経路があるのかも、ドキュメントの記述からの推測にとどまる。次に大きいのはWindowsで、`core.symlinks=false`のcheckoutとsymlink作成権限のどちらも実機では検証していない。ほかに、4ホップの再帰の境界や、手動コピーで近似した`/import`コマンド自体、キャッシュ変動に埋もれて切り分けられなかったトークンのオーバーヘッドも未検証のままだ。金銭的なコストは三経路とも常にゼロだった。

条件eの結果を初めて見たとき、驚いたのは失敗そのものではなく、失敗の静かさだった。エラーも警告もなく、ただカナリアが返答に現れなかっただけだ。同僚の質問への答えは、ファイル形式の話では終わらない。「ファイルがどこにあるか」だけでなく「その経路を人間が承認できるか」までセットで確認しないと、指示が届いていない状態に誰も気づけない。この判断が崩れるとしたら、checkoutの`core.symlinks`設定を誰かが変えたときか、CIやフックのような無人の経路が新しく足されたときだ。そのときこそ、この測定条件を洗い直す番になる。

## 参考資料
- [How Claude remembers your project (Claude Code memory)](https://code.claude.com/docs/en/memory)
- [Claude Code CHANGELOG — 2.1.232](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md)
