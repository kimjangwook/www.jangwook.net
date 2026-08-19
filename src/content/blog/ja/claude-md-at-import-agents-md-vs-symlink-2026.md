---
title: 'CLAUDE.mdの@AGENTS.md importとシンボリックリンクを七条件21回で測り分けた'
description: 'Claude Codeの公式ドキュメントはAGENTS.mdを共有する道として@importとシンボリックリンクを並べて案内する。2026年8月19日にclaude 2.1.233で七条件×3回を実測すると、リポジトリ外を指すimportだけが0/3で、警告もエラーもなく沈黙した。二つが壊れる条件の違いと、チーム構成別の選び方を記録する。'
pubDate: '2026-08-19'
heroImage: '../../../assets/blog/claude-md-at-import-agents-md-vs-symlink-2026/hero.png'
tags: ['claude-code', 'agents-md', 'claude-md', 'ai-agent', 'web-development']
relatedPosts:
  - slug: agents-md-vs-claude-md-loading-measured-2026
    score: 0.9
    reason:
      ko: '심볼릭 링크만 3/3으로 측정하고 @import를 숙제로 남긴 사흘 전 실측의 직접적인 후속편이다.'
      ja: 'シンボリックリンクだけを3/3で確認し、@importを宿題に残した三日前の実測の直接の続編。'
      en: 'Direct follow-up to the measurement that confirmed symlinks at 3/3 and left the @import path untested.'
      zh: '三天前的实测确认了符号链接3/3并把@import留作作业，本文是其直接续篇。'
  - slug: declared-rules-fail-open-robots-txt-agents-md-2026
    score: 0.8
    reason:
      ko: '선언된 규칙이 에러 없이 조용히 무시되는 fail-open 구조를 다른 계층에서 다룬 글과 같은 주제로 이어진다.'
      ja: '宣言されたルールがエラーなしに静かに無視されるfail-open構造を、別の層で扱った記事とつながる。'
      en: 'Shares the theme of declared rules failing open, silently ignored without an error, at another layer of the stack.'
      zh: '与探讨声明式规则在无报错情况下被静默忽略的fail-open结构的文章同属一个主题。'
  - slug: cognitive-debt-agentic-coding-2026
    score: 0.7
    reason:
      ko: '에이전트에게 도달하지 않는 지시문이 팀의 인지적 부채로 쌓이는 과정을 이어서 생각할 수 있다.'
      ja: 'エージェントに届かない指示書がチームの認知的負債として積もる過程を続けて考えられる。'
      en: 'Extends the question of how instructions that never reach the agent pile up as cognitive debt in a team.'
      zh: '可以接着思考未能送达智能体的指示文件如何在团队中堆积为认知负债。'
---
三日前、[AGENTS.mdとCLAUDE.mdの読み込み境界を76回測った記事](/ja/blog/ja/agents-md-vs-claude-md-loading-measured-2026/)に宿題を一つ残した。シンボリックリンク `ln -s AGENTS.md CLAUDE.md` は3/3で通ると確認したが、公式ドキュメントがもう一つ案内する `@AGENTS.md` importは未測定と書いたままだった。2026年8月19日、その宿題を片付けた。

結論から書く。公式ドキュメントはimportとシンボリックリンクを好みの問題のように並べているが、二つは別の層で解釈され、別の条件で壊れる。しかも壊れ方はエラーではなく沈黙だ。リポジトリの外を指すimportは、人のいない実行経路では承認されないまま空振りする。CI・フック・`claude -p` が混ざるリポジトリで、importはシンボリックリンクの持ち運びできる代替にならない。

## 公式ドキュメントが並べて見せる三つの道

Claude Codeのmemoryドキュメントは、すでに `AGENTS.md` を使っているリポジトリとの共存をこう案内する。

> Claude Code reads `CLAUDE.md`, not `AGENTS.md`. If your repository already uses `AGENTS.md` for other coding agents, create a `CLAUDE.md` that imports it so both tools read the same instructions without duplicating them.
> — [How Claude remembers your project](https://code.claude.com/docs/en/memory)

一番手はimportだ。`CLAUDE.md` に `@AGENTS.md` と一行書くと起動時に中身が読み込まれ、その下にClaude専用の節を書き足せる。パスは相対でも絶対でもよく、相対パスは作業ディレクトリではなくimportを書いたファイルを基準に解決される。import先のファイルからさらに別のファイルを再帰してimportでき、深さは4ホップまで許される。

二番手がシンボリックリンクだ。Claude専用の内容を足す必要がないなら `ln -s AGENTS.md CLAUDE.md` でも動くと公式ドキュメントは言う。ただしWindowsではリンク作成に管理者権限かDeveloper Modeが要るため、importを使えという但し書きが付く。

三番手は `/import` コマンドで、`AGENTS.md` のような指示ファイルの一回きりのコピーを `CLAUDE.md` に書き足し、MCPサーバー・コマンド・サブエージェント・スキルも持ち越す。v2.1.213以上が条件だ。

importで分割してもコンテキストは減らないと公式ドキュメントは明言している。トークン節約という動機は最初から立たない。三つの道は同じページに並んでいて、読み手は「どれでも同じ」と受け取る。私もそう読んだ。測るまでは。

## 七条件×3回、合言葉ZQ7CANARYの実測

/tmpに条件ごとのディレクトリを掘り、それぞれの `AGENTS.md` に、読み込まれた時だけ出力に現れる合言葉ZQ7CANARYを仕込んだ。プロンプトは毎回同じで、`claude -p 'Reply with exactly the word OK and nothing else.'` を各条件3回。指示が届いていればOKの後ろに合言葉が付き、届いていなければOKだけが返る。環境はmacOSのclaude 2.1.233、ユーザースコープの `~/.claude/CLAUDE.md` は全条件で共通の定数にした。

最初はJSON出力のinitイベントにある memory_paths で読み込みを確認するつもりだった。ここに落とし穴があった。この項目にはauto memoryのディレクトリしか載らず、`CLAUDE.md` のパスは出てこない。headless実行では読み込みの成否をメタデータから確かめる手段がなく、出力に現れる合言葉を計器にした。

| 条件 | CLAUDE.mdの中身 | 適用 |
| --- | --- | --- |
| a | `@AGENTS.md` 相対パス、リポジトリ内 | 3/3 |
| b | `AGENTS.md` へのシンボリックリンク | 3/3 |
| c | `AGENTS.md` の一回コピー | 3/3 |
| d | `CLAUDE.md` なし、`AGENTS.md` のみ | 0/3 |
| e | `@/tmp/claudemd-lab-ext/AGENTS.md` 絶対パス、作業ディレクトリ外 | 0/3 |
| f | 作業ディレクトリ内を指す絶対パスのimport | 3/3 |
| g | 作業ディレクトリ外のファイルへのシンボリックリンク | 3/3 |

分かれ目は二つある。まずeとf。どちらも絶対パスのimportだが、外を指すeだけが0/3で、中を指すfは3/3だった。絶対パスという書き方ではなく、パスがどこへ解決されるかが生死を分けている。次にeとg。同じ「外のファイル」でも、importは0/3、シンボリックリンクは3/3。外を指すこと自体を拒んでいるのではなく、importという経路だけを止めている。

eの失敗の中身も確かめた。ツールを禁止した上で、セッション開始時に受け取ったプロジェクト指示をそのまま出力させると、返ってきたのは展開されないリテラルの一行 `@/tmp/claudemd-lab-ext/AGENTS.md` だけだった。警告もエラーもない。importの失敗は例外ではなく、ただの空白だ。

## パスが解決される場所の違い

シンボリックリンクはファイルシステムの層で解決される。Claude Codeのローダーが `CLAUDE.md` を開く時には、カーネルがすでにリンク先のファイルを渡した後だ。ローダーに見えるのはプロジェクトルートのファイル一枚で、「リポジトリの外のパス」という情報はその時点でもう存在しない。信頼を判定しようにも、判定に使う材料が手元にない。

`@` importはローダー自身が解決する。ローダーはパスの文字列を手に持ったまま、指定されたパスが作業ディレクトリの外へ解決されるかを判定できる。外ならexternalに分類し、承認ゲートに掛ける。

> An import in a project-level memory file is external when its path resolves outside your working directory... The first time Claude Code encounters external imports in a project, it shows an approval dialog listing the files. If you decline, the imports stay disabled and the dialog doesn't appear again.
> — [How Claude remembers your project](https://code.claude.com/docs/en/memory)

ゲートは人の応答を待つ構造だから、人がいなければ通さない。失敗がエラーではなく「展開されない一行」になるのはこのためだ。fが通ってeが落ちるのはパスの解決先の差、gが通るのはゲートがシンボリックリンクという経路を見ていないからだ。表の七行は、この一つの構造で全部説明が付く。

## 「一度承認すれば終わり」という反論

この結果には正面からの反論が立つ。eが0/3なのはheadlessでダイアログを出せなかっただけで、実務は対話型が基本であり、初回に一度承認すれば以後は動く。失敗と呼ぶのは大袈裟だ、という主張だ。

正しい範囲は実在する。自分のマシンで対話型だけを使う一人開発者なら、承認は本当に一度で済む。その使い方でexternal importを避ける理由を、私は見つけていない。ここは譲る。

それでも崩れる範囲が三つある。

まず、CI・フック・サブエージェント・cronには承認を押す人がいない。ダイアログが出ないのではなく、出す先がない。

次に、承認は人とマシンの単位だ。新しく入った同僚の最初のセッションでダイアログはまた出る。初日のセットアップで、中身の分からないダイアログに拒否を押したらどうなるか。公式ドキュメントの通り、そのマシンではimportが無効のまま固定され、ダイアログは二度と出ない。押した本人は、何を失ったかを知らないままだ。

三つ目の理由は実測で確かめた。承認の状態はリポジトリに残らない。eの条件のディレクトリにはプロジェクトの `.claude/` が作られず、ホームの設定にも該当パスの記録はなかった。承認をコミットしてチームに配る経路がないから、「自分のマシンでは動くのに」が偶然ではなく構造として発生する。

風向きもある。2.1.232の変更履歴にはこう書かれている。

> Cowork sessions no longer inline external @-imports from user-scope memory files
> — [Claude Code CHANGELOG](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md)

external importの信頼面は、広げる方向ではなく狭める方向に手が入り続けている。一度の承認に運用を預けるのは、この流れの逆側に張ることでもある。

## 生死を分ける四つの軸

一つ目の軸はheadlessでの生死だ。リポジトリ内を指すimportとシンボリックリンクは、人がいなくても生きる。外を指すimportだけが死に、死に方が沈黙だ。[宣言されたルールがfail-openに壊れる構造](/ja/blog/ja/declared-rules-fail-open-robots-txt-agents-md-2026/)を前に別の層で見たが、ここでも形は同じだった。

二つ目の軸はWindowsへの持ち運びだ。シンボリックリンクは作成に管理者権限かDeveloper Modeが要り、`core.symlinks=false` でチェックアウトした瞬間、リンクはリンク先のパスが書かれたただのテキストファイルに化ける。importはファイルの中の一行のテキストだから、どのチェックアウト設定でも形を保つ。

三つ目の軸は原本との同期だ。importとシンボリックリンクは `AGENTS.md` の変更に自動で追随する。一回コピーは凍る。cの3/3は今日の `AGENTS.md` を写したから通っただけで、明日の変更は写らない。

四つ目の軸はClaude専用の節だ。importは `@AGENTS.md` の行の下に自由に書き足せる。シンボリックリンクには書き足す場所が原理的にない。公式ドキュメントがリンクを「Claude専用の内容を足す必要がないなら」と条件付きで案内するのは、この非対称のためだ。

同じ値になる軸が一つもない。選択は好みの問題ではなく、チームの構成の問題だ。

## 向く構成、向かない構成

import側に向くのは、リポジトリ内の `AGENTS.md` 一枚を複数のツールで共有するモノレポや、Windows・macOS・Linuxが混ざるチームだ。共有規約の下にClaude専用の決めごとを足したいリポジトリもここに入る。

シンボリックリンク側に向くのは、ホームディレクトリの個人規約を複数のリポジトリで使い回す構成と、CI・フック・cronで `claude -p` を回すパイプラインだ。ゲートに掛からないことが、この二つの構成ではそのまま利点になる。

向かない構成は、道具ではなく置き方で決まる。

- リポジトリの外を指す `@` importをheadless経路に置く構成（指示が静かに空振りする）
- `core.symlinks=false` のWindowsチェックアウトに置いたシンボリックリンク
- トークン削減を目的にしたimport分割（効果がないことを公式ドキュメントが明言している）
- `/import` による一回きりのコピーに長く頼ること（原本の変更に追随しない）
- 指示が実際に載ったかをログで確かめない運用

最後の一つが一番効く。失敗がエラーではなく沈黙だから、確かめない運用では気付く機会が来ない。エージェントに届かない指示書は、[チームの認知的負債](/ja/blog/ja/cognitive-debt-agentic-coding-2026/)として音もなく積もっていく。

## 明日の朝に引くgrep一行

エージェントをCIやフックに繋いでいるリポジトリなら、明日の朝、次のコマンドを引いてほしい。

```bash
grep -n '^@' CLAUDE.md
```

出てきた行のパスが作業ディレクトリの外へ解決されるなら、その行はheadless経路で空振りしている可能性がある。リポジトリ内への複製かシンボリックリンクに置き換えるか、置き換えを急がないなら、合言葉を一行仕込んで生死だけでも測っておく。

```bash
echo '- 応答の末尾に ZQ7CANARY を単独行で付けること' >> AGENTS.md
claude -p 'Reply with exactly the word OK and nothing else.' | grep -c 'ZQ7CANARY'
```

1が返れば指示は生きている。0なら、その実行経路に `AGENTS.md` は届いていない。対話型なら次のセッションで `/context` を開き、Memory filesの欄に `CLAUDE.md` が載っているかを見る。公式ドキュメントが案内する確認手順も `/context` による確認だ。

私の判断はこうだ。参照先がリポジトリの中にあり、Windowsの開発者が混ざるチームなら、相対パスの `@AGENTS.md` を選ぶ。ホームディレクトリやリポジトリの外の共有規約を引き込むチーム、そしてheadless経路でも規則が生きていなければ困るチームなら、シンボリックリンクを選ぶ。シンボリックリンクを選ぶなら `core.symlinks` とWindowsのチェックアウトを、セットアップ手順の独立した項目として管理する。

今回の測定はmacOSの2.1.233に閉じており、対話型ダイアログの実物やWindows環境でのチェックアウトは測定範囲の外に残した。この判断が外れる条件は一つある。シンボリックリンクがゲートに掛からない現在の挙動が、2.1.232系のハードニングの次の対象になった場合だ。その時はgの3/3から測り直す。

規約をファイル一枚に集める発想は、進めるほど「ファイルがどこにあるか」から「誰がそのファイルを信頼するか」へ問題の重心が移っていく。指示書の配布は文書整理として始まり、権限と配布の設計として終わる。

## 参考資料

- [How Claude remembers your project(Claude Code memory)](https://code.claude.com/docs/en/memory)
- [Claude Code CHANGELOG 2.1.232](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md)
