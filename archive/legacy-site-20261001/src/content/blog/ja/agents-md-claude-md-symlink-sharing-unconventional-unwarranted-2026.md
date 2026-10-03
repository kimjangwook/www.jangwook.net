---
title: AGENTS.md をリンクで CLAUDE.md と共有する方法と、それを裏書きしない文書たち
description: 二つのAIツールに一つのルール文書を読ませるリンク共有が、今日なぜ動くのかを実測でたどる。同時に、この置き方を保証する文書がどこにもないことも確かめる。
pubDate: '2026-08-31'
heroImage: ../../../assets/blog/agents-md-claude-md-symlink-sharing-unconventional-unwarranted-2026/hero.png
tags:
- AGENTS.md
- CLAUDE.md
relatedPosts:
- slug: claude-md-reachability-bound-to-cwd-lazy-loaded-rules-half-obeyed-2026
  score: 0.7
  reason:
    en: The symlink fragility examined here supplies the supporting evidence for the
      previous post's finding that CLAUDE.md loading depends on the session folder,
      not just where the file sits.
    ko: 이번 글이 다룬 CLAUDE.md 심링크의 취약성은, CLAUDE.md가 세션 폴더 기준으로 로딩된다는 기존 글의 규칙 도달 범위 분석이
      없었다면 발견하기 어려웠을 뒷받침 근거를 제공한다.
    ja: 本記事で扱うCLAUDE.mdのシンボリックリンクの脆弱性は、CLAUDE.mdがセッションフォルダを基準に読み込まれるという前記事のルール到達範囲の分析があってこそ見えてくる裏付けの根拠を示す。
    zh: 本文探讨的 CLAUDE.md 符号链接脆弱性，为上一篇关于 CLAUDE.md 依会话文件夹加载的规则适用范围分析提供了支撑证据。
- slug: loaded-rules-discarded-as-prompt-injection-when-user-pushes-2026
  score: 0.7
  reason:
    en: If the symlink trick for sharing CLAUDE.md with AGENTS.md carries no official
      guarantee and can break at any time, reading it alongside the earlier post where
      loaded CLAUDE.md rules get discarded entirely by a single contrary user request
      reveals the full fragility of rules files.
    ko: 심링크로 CLAUDE.md를 AGENTS.md와 공유하는 요령이 공식 보장 없이 언제든 깨질 수 있다면, 그 CLAUDE.md 규칙이
      실제로 로드됐다가도 사용자 반대 요청 한 번에 통째로 버려지는 기존 글과 함께 읽어야 규칙 파일의 취약성 전체가 보인다.
    ja: シムリンクで CLAUDE.md を AGENTS.md と共有する小技が公式保証なしにいつ壊れてもおかしくないなら、その CLAUDE.md ルールがユーザーの反対要求一回で丸ごと捨てられる既存記事と併せて読むことで、ルールファイルの脆さの全体像が見えてくる。
    zh: 既然用符号链接让 CLAUDE.md 与 AGENTS.md 共享的技巧没有官方保证、随时可能失效，那么把它与已有文章中 CLAUDE.md 规则被用户一句相反请求就整个丢弃的情况对照阅读，才能看清规则文件脆弱性的全貌。
---

## AGENTS.md と CLAUDE.md をリンクで束ねる共有の慣行

AIに仕事を頼むとき、プロジェクトごとの約束事を書いたメモを用意するやり方が広がっている。AGENTS.md はその約束事を書くファイルの名前で、ある種類のAIツールが読む。CLAUDE.md は同じ役割のもので、別の種類のAIツールが読む。内容はほぼ同じなのに、読む道具が違うためにファイル名が二つ必要になる。

ここでよく使われるのが、シンボリックリンクという仕組みだ。シンボリックリンクとは、実体ではないが実体につながった紙のことで、見た目は一枚のファイルでありながら、開くともう一つのファイルの中身が出てくる。

このリンクを使うと、AGENTS.md と CLAUDE.md に一つの中身を同じように供給できる。手間が半分になり、直す場所も一つで済む。ところが、この方法には一つ気になる点がある。使っている人は多いのに、どこかが「この方法は正しい」と保証している文書が見当たらないのだ。今日たまたま動いているのと、明日も動くと約束されているのは別の話である。この距離は、実測で確かめる価値がある。

## 文書の表面三か所での確認結果

まず、保証が書いてある可能性の高い三つの文書を調べた。一つ目はClaude Codeの変更履歴である。変更履歴とは、その道具がこれまでに何を新しく読めるようにしたかを書き並べた日記のような文書だ。そこにAGENTS.mdを直接読む機能が載っていれば、リンクを使う必要はすでに薄い。

調べ方の一例は素朴だ。公式の変更履歴を丸ごと取得し、AGENTS.mdという言葉が何回出てくるか数える。同じ方法で、AGENTS.mdの公式仕様書と、もう一つのAIツールCodexの公式文書も眺めた。結果は次のとおりだった。

<div class="lm-card lm-card--cell" data-lm-figure="explain-cell-claude-changelog-agents-md-native" data-lang="ja"><span class="lm-card__badge lm-card__badge--ok">成功</span><span class="lm-card__title">変更履歴の直接読み込み項目</span><span class="lm-card__text">変更履歴の3回の検索すべてでAGENTS.mdへの言及は0件だった。同じ履歴でCLAUDE.mdへの言及は59件、symlinkへの言及は72件あった。直接読み込むというドキュメント項目は確認されなかった。</span><div class="lm-card__numbers"><span class="lm-card__chip">AGENTSへの言及 0</span><span class="lm-card__chip">CLAUDEへの言及 59</span><span class="lm-card__chip">リンクへの言及 72</span></div></div>

同じ変更履歴でCLAUDE.mdへの言及が59件、リンクへの言及が72件あったことを考えると、0件という数から、この話題が扱われなかったことがはっきりわかる。書く人がこの話題を避けたのではない。話題として扱う機会がそもそもなかったことを示す数だ。

仕様書とCodexの文書にも、リンクで共有する置き方を薦める記述は見つからなかった。AGENTS.mdの仕様には symbolicLink という言葉が一か所だけ現れたが、それがリンクを許す話なのか禁じる話なのかは、この調査では読み切れていない。いずれにしても、リンクで共有する置き方を積極的に薦める文はどこにも見つからなかった。なお、文書に載っていないことが自動的に「存在しない」を意味しない点には限界がある。

## 測り方：四つのセル、12回の実行

文書を読むだけでは足りないので、ファイルの置き場所を管理する仕組みの側も測った。LinuxというOSの入った薄い箱の中で、AIそのものは一度も動かさず、ファイル操作だけを4種類、各3回、計12回の実行をした。AIを呼ばなかったのは、測りたいのがAIの判断ではなく、リンクという仕組みそのものだからだ。

<div class="lm-card lm-card--how" data-lm-figure="explain-how" data-lang="ja"><span class="lm-card__title">測定手順</span><ol class="lm-card__steps"><li class="lm-card__text">ステップ 1. Claude Codeの公式変更履歴でルールファイルを直接読むという項目があるか探した。</li><li class="lm-card__text">ステップ 2. ペアになるsymlinkが32KiBサイズ上限検査で同じファイルに見えるか検査を試みた。</li><li class="lm-card__text">ステップ 3. ルールファイルを別の場所へ移した後、symlinkがまだ正しく接続されているか確認した。</li><li class="lm-card__text">ステップ 4. ルールファイル標準ドキュメントとコデックスのドキュメントでsymlink規定があるか探した。</li><li class="lm-card__text">ステップ 5. AIツール自体は実行せず、ドキュメントの読み上げとファイル検査だけで答えを出した。</li></ol></div>

四つのうち三つは測定として完走した。残る一つの32KiBサイズ上限検査は、測定器具側の不具合で全試行が止まり、その項目だけは結果が出なかった。

## 再配置後の生存の差

測定の中心になったのは、フォルダごと引っ越したときにリンクが生き残るかどうかだ。ここには二種類の張り方がある。一つは相対パスのリンクで、「隣の家の方へ」と方向で指す紙。もう一つは絶対パスのリンクで、「本店の住所はここ」と壁に住所を書き込んだ紙である。

相対の紙なら、家ごと丸ごと引っ越しても方向はそのままで読める。住所の紙は、建物自体が変わらないうちは正しいが、場所が変わった瞬間に古い住所を指したまま台無しになる。実測はこの日常の見立てどおりに終わった。

| 張り方 | isSymlink | 解決 |
|---|---|---|
| 相対リンク CL_rel.md | true | true |
| 絶対リンク CL_abs.md | true | false |

<div class="lm-card lm-card--cell" data-lm-figure="explain-cell-symlink-survives-relocation" data-lang="ja"><span class="lm-card__badge lm-card__badge--ok">成功</span><span class="lm-card__title">移動後の生存</span><span class="lm-card__text">3回すべてで相対パスのリンクは移動後も正しく接続された。一方、絶対パスのリンクは対象を見つけられず、コピーはリンクではなく通常ファイルになった。</span><div class="lm-card__numbers"><div class="lm-card__bar"><div class="lm-card__bar-fill" style="--lm-bar-w:100.0%"></div><span class="lm-card__text">相対リンクの生存 3/3</span></div><div class="lm-card__bar"><div class="lm-card__bar-fill" style="--lm-bar-w:0.0%"></div><span class="lm-card__text">絶対リンクの生存 0/3</span></div></div></div>

コピーにした置き方は、リンクではない普通のファイルとして生き残った。ここで差が出る原因は道具の賢さではなく、リンクのもつ意味そのものにある。相対リンクは相手を「自分との距離」で記憶し、絶対リンクは「当時の場所の住所」を文字として記憶する。引っ越したとき、相対リンクの記憶方法は意味を保ち、絶対リンクの記憶方法は正しくなくなる。結果を作ったのは ln という命令の性質であって、AIツールのどの処理でもない。

## 32KiB サイズ上限検査が止まった場所

AIツールの中には、読み込むメモの大きさに上限を設けているものがある。その上限が32キロバイトで、サイズ超過時にどう処理されるかは、今回の実測では確認できていない。ここで自然な疑問が出る。リンクを張った場合、この大きさの測定は、シンボリックリンクそのものに対して行われるのか、リンク先の実ファイルに対して行われるのか。

<div class="lm-card lm-card--cell" data-lm-figure="explain-cell-symlink-projects-through-32k-boundary" data-lang="ja"><span class="lm-card__badge lm-card__badge--fail">失敗</span><span class="lm-card__title">サイズ上限検査</span><span class="lm-card__text">3回の試行すべてでファイルが存在しないというエラーで止まった。サイズ比較は一度も実行されず、失敗として記録された。</span><div class="lm-card__numbers"><div class="lm-card__bar"><div class="lm-card__bar-fill" style="--lm-bar-w:0.0%"></div><span class="lm-card__text">成功した試行 0/3</span></div></div></div>

この疑問には今回は答えられなかった。3回の試行はいずれも、対象のファイルが見付からないというエラーで止まり、大きさの比較が一度も実行されなかった。停止の原因は測り方の側にある。リンクの生成を確認した同じ手順では解決できたのに、この検査だけが決まった場所で落ちたので、準備の段階の不具合と考えるのが自然だ。つまり「リンクは上限検査にそのまま投影される」という予想は、確認も否定もされていない状態で残る。

## この記事が確認できなかったこと

今回は三つの限界が残った。第一に、AI道具がリンクの中身を実際に読んでいるかどうかの実行検証をしなかった。第二に、32KiBの検査が全試行失敗で、上限との関わりが完全に未測定のままだ。第三に、仕様書に現れた symbolicLink のただ一つの文を読んでいない。この置き方の唯一の文書的根拠がそこにある可能性は、排除できない。次に見るべきは、その一文の文脈と、リンクを実際に置いた状態での道具の読み取りである。また、変更履歴は日々更新されるため、ここに書いた0件という数は調べた時点の値だ。なお、リンク共有をやめたい場合には、相対パスのリンクに置き換えるか、リンクの代わりにファイルの複製を配ればよい。チームの決まりとしてこの繋ぎ方を採用したい人は、紙を決まりの文に書くのではなく、紙を作る係と毎日折り返し確認する係を自分のチームの中に置くこと。そして、Claude Codeの変更履歴にAGENTS.mdを直接読む項目が新たに現れたら、この結論は引き上げる。どこかの文書がこのリンクの使い方を保証する文言を載せた場合も同じだ。この判断は、2026-08-30時点の文書の記録とファイルシステムの測定だけに基づく。

## 参考資料

1. [Claude Code CHANGELOG (raw scan target)](https://raw.githubusercontent.com/anthropics/claude-code/main/CHANGELOG.md) — Anthropic (raw.githubusercontent.com)
2. [AGENTS.md spec page (symlink 규정 부재 확인 대상)](https://agents.md/) — agents.md
3. [Codex 공식 문서·README (symlink·한도 규정 부재 확인 대상)](https://raw.githubusercontent.com/openai/codex) — OpenAI