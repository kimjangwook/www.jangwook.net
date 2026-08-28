---
title: Claude CodeにAGENTS.mdを渡す公式の三つの方法と、コードフェンスで囲むと文書が読み込まれない現象
description: Claude CodeにAGENTS.mdを読ませる公式の三つの方法を実測で比べ、どれも同じ結果になることを示す。一方、コードフェンスで囲んだ一行が文書全体の読み込みを静かに止める現象を、公式文書と実測で確認する。
pubDate: '2026-08-28'
heroImage: ../../../assets/blog/agents-md-three-wirings-equal-cost-codefence-silent-trap-2026/hero.png
tags:
- claude-code
- agents-md
- 設定
relatedPosts:
- slug: declared-rules-fail-open-robots-txt-agents-md-2026
  score: 0.7
  reason:
    en: The new post maps the three official routes that explain the silent truncation
      failures measured in the 219-run AGENTS.md experiment.
    ko: 이 글에서 확인한 '규칙이 잘려도 에러 없이 실패한다'는 관측을 뒷받침하는 AGENTS.md 읽기 경로의 공식 스펙을 새 글이 세 가지
      경로로 정리한다.
    ja: 「ルールが切れてもエラーにならない」という実測の背景となる、AGENTS.mdを読む公式経路を新記事が3つに整理する。
    zh: 新文章用三条官方路径解释了旧文219次实测中AGENTS.md规则被静默截断却不出错的机制。
---

## AGENTS.mdだけ置いても、Claude Codeには届かない

AGENTS.mdを書いても、Claude Codeが読まなければ意味がない。文書が実際に読み込まれるには、置く場所と渡し方を決める必要がある。

AIのコーディング支援ツールにも同じことが起きる。Claude Codeは、プロジェクトの書き方や約束事を記した文書を読み込んでから仕事をする。その読み込み先として公式に決まっているファイル名はCLAUDE.mdだ。一方、AGENTS.mdは複数のAIツールで共通に使うことを目的とした、チームの約束事を書くための文書である。Claude CodeはCLAUDE.mdを読むのであって、AGENTS.mdを自動では読まない。公式文書がその点をはっきり述べている。

> Claude Code reads `CLAUDE.md`, not `AGENTS.md`.
> — [Manage Claude's memory (CLAUDE.md) / Claude Code Docs](https://code.claude.com/docs/en/memory)

つまり、AGENTS.mdをCLAUDE.mdにつながない限り、Claude Codeには約束事が一行も届かない。届かなければ、AIは文書に書いた規律を知らないままコードを書く。問題は、三つのうちどのつなぎ方を選ぶかである。

## 文書をつなぐ三つの公式の方法

つなぎ方には、公式文書が示す三つの方法がある。

一つ目は、CLAUDE.mdの中に`@AGENTS.md`と一行書く方法だ。@から始まるこの書き方をimportと呼ぶ。importは「別のファイルをそこに展開して読み込む」という指示で、公式文書に次の説明がある。

> CLAUDE.md files can import additional files using `@path/to/import` syntax. Imported files are expanded and loaded into context at launch alongside the CLAUDE.md that references them.
> — [Manage Claude's memory (CLAUDE.md) / Claude Code Docs (import syntax)](https://code.claude.com/docs/en/memory)

二つ目は、シンボリックリンクを作る方法だ。シンボリックリンクとは、同じファイルに別の名前を付け、どちらの名前で開いても同じ中身が見えるようにする仕組みである。実体は一つのままで、名前だけが増える。AGENTS.mdという実体にCLAUDE.mdという別名を付ければ、Claude CodeはCLAUDE.mdという名前で同じ文書を読む。

三つ目は、AGENTS.mdの中身をCLAUDE.mdとして写して置く方法だ。

三つとも公式の方法だ。ならば、どれを選んでも同じ結果になるのか。読み込みにかかる費用に違いはあるのか。

## 三つの方法の到達と費用の実測

実測は2026年8月19日に、6つの設定を用意して行った。各設定で3回ずつ、合計18回Claude Codeを動かし、文書が届いたかどうかと、読み込みにかかった量を測った。文書が届いたかは、文書の冒頭に埋め込んだ決まり文字がClaudeの返答に出るかで判定した。読み込みの量はトークンという単位で測る。トークンとは、AIが文章を扱うときの、単語や文字のかたまりのような単位のことだ。

結果は次のとおりだ。まず、つなぎを一切作らなかった設定では、3回中3回とも決まり文字が出なかった。つまり文書は一行も届いていない。読み込み量は、そもそも文書を置いていない対照の設定と2トークンしか変わらない。これはAGENTS.mdを置くだけでは何も起きないことの裏取りである。

一方、三つの公式の方法はすべて、3回中3回とも決まり文字が現れた。到達率は三つとも満点で、違いはなかった。

費用の面では、文書一式が読み込まれると約2,920トークンが毎回のやり取りに加算される。三つの方法の間で読み込み量の差は最大でも122トークンだった。2,920トークンの4%以内に収まる差だ。手で写した方法と比べ、importの方法が余分に読み込むのは116トークンで、文書が二重に読み込まれる現象は起きなかった。

![複写方式のセルの元の出力抜粋。3回とも到達し、入力トークンは17,862×3だった。](../../../assets/blog/agents-md-three-wirings-equal-cost-codefence-silent-trap-2026/log-copy.png)

この結果から、方法選びに悩む時間は要らなくなる。どの方法でも文書は確実に届き、費用の差は無視できる大きさしかない。

![つなぎのないAGENTS.mdセルの元の出力抜粋。3回とも決まり文字は出ず、入力トークンは14,940×3だった。](../../../assets/blog/agents-md-three-wirings-equal-cost-codefence-silent-trap-2026/log-bare-agents.png)

## コードフェンスの一行が文書全体の読み込みを止める

ここまでの話なら、どれを選んでも安全に見える。ところが、方法の選択より危険な落とし穴が文法の側にある。

設定ファイルの書き方を説明するとき、人は見本を「コードフェンス」という記号で囲むことがある。コードフェンスとは、Markdownという文書の書式で、三つの逆引用符の行で前後を挟む書き方だ。挟まれた部分は「これは見本のコードだ」という表示のかたまりになる。

実験では、CLAUDE.mdの一行に`@AGENTS.md`と書き、それをこのコードフェンスで囲んだ設定も動かした。人間の目には、importの設定とほとんど同じに見える。違いはフェンスの記号があるかないかだけだ。

結果は正反対だった。3回中3回とも決まり文字は現れなかった。読み込み量は、つなぎを一切作らなかった設定より141トークン多いだけだ。つまり、文書は到達しなかっただけでなく、一バイトも読み込まれていなかった。フェンスで囲んだという一行の書式の違いが、文書一式、約2,920トークンぶんの読み込みを消した。

![コードフェンスで囲んだセルの元の出力抜粋。3回とも決まり文字は出ず、入力トークンは15,081だった。](../../../assets/blog/agents-md-three-wirings-equal-cost-codefence-silent-trap-2026/log-fenced-import.png)

なぜそうなるのか。Claude Codeは設定ファイルを読むとき、まずimportの指示だけを探して全体にざっと目を通す工程がある。公式文書はこの工程について、「コードの表示かたまりは読み飛ばす」と明記している。見本としてフェンスで囲んだ`@AGENTS.md`は、この工程で本物の指示ではなくただの文字と判定される。すると文書を繋ぐ指示は存在しなかったことになり、文書そのものが読み込まれない。書いてあることと、実際に読まれることは、ここで別物になる。

## どの方法を選ぶかは状況が決める

費用と到達率が同じなら、選ぶ基準は性能ではなく各チームの事情になる。

Windowsで作業するチームは注意が要る。Windowsでシンボリックリンクを作るには特別な権限か開発者モードが必要だ。公式文書は、その場合の代わりとしてimportの方法を使うよう案内している。

> On Windows, creating a symlink requires Administrator privileges or Developer Mode, so use the `@AGENTS.md` import instead.
> — [Manage Claude's memory (CLAUDE.md) / Claude Code Docs](https://code.claude.com/docs/en/memory)

Claude専用の追加の約束事を文書の下に足したいチームも、importの方法が向いている。CLAUDE.mdを独立したファイルとして持てるからだ。反対に、複数のAIツールで一つの文書を共通に使い、二重管理を避けたいチームは、実体が一つのままで済む方法が合う。

設定ファイルの中で見本として囲んだ記号一行が、文書全体を読ませなくすることがある。文書に書いてあることと、実際に読まれることは別である。三つの正しいつなぎ方は費用が同じなので、どれを選んでもよい。

では、実際に何をするか。複数のAIツールを一緒に使わず、Claude専用の設定も特に要らないなら、何もつなげず今のAGENTS.mdをそのまま置いておいてよい。ただし、文書のどこにも見本を囲む記号を作らないこと。Claudeにも同じ約束事を読ませたいなら、三つの方法から今日一つを選ぶ。Windowsで権限を取りにくい場合や、Claude専用の内容を下に足す予定があるなら、importの方法を選ぶ。そうでなければ、実体を一つにしてつなぐ方法を選ぶ。いずれの場合も、経路を文中に書く場面では必ず囲まずに置くこと。

## この記事が確認できなかったこと

この実測は各設定3回の繰り返しだ。めったに起きない偶然の漏れは捉えられていないし、122トークンの差が毎回同じ幅で出るかも確かめられていない。同じ実験では原因不明の109トークンの揺らぎが、6セルのうち4セルで観測された。CodexのようにAGENTS.mdを自分で読む別のAIツールとの比較も、このデータには含まれていない。Windowsでのシンボリックリンクや、大きな文書でのコードフェンスの再現も含まれていない。次に確認すべきは、繰り返し回数を増やしたときの揺らぎの正体と、大きな文書でフェンスの落とし穴が同じ形で出るかどうかだ。

![どの方法の対象でもない対照セルの元の出力抜粋。3回とも決まり文字は出ず、入力トークンは14,942×3だった。](../../../assets/blog/agents-md-three-wirings-equal-cost-codefence-silent-trap-2026/log-notes-control.png)

この記事の「三つの方法は同等だ」という判断が覆る条件は次のとおりだ。同じ実験を繰り返して、三つの方法のどれかが3回中3回の到達を示さなかったり、方法の間に文書一式ぶん（約2,920トークン）に近い費用差が出たら、この判断は間違いである。

## 参考資料

1. [https://code.claude.com/docs/en/memory](https://code.claude.com/docs/en/memory)（2026-08-19取得）
2. [https://agents.md/](https://agents.md/)（2026-08-19取得）