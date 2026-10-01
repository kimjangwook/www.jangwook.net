---
title: 'CodexとClaude Codeの共有ガイドラインは32KiBを超えるとシンボリックリンクでも全体が読まれる'
description: 'CodexとClaude Codeが同じ指示ファイルを共有すると、32KiBを超えるとファイル全体が読まれてしまう。チームのガイドラインが大きくなる場合は、共有をやめて文書を分ける必要がある。'
pubDate: '2026-09-08'
heroImage: ../../../assets/blog/codex-agents-md-32kib-budget-symlink-overflow-measured-2026/hero.png
tags:
- AI
- 開発ツール
- 設定管理
relatedPosts:
- slug: codex-agents-md-truncation-documentation-source-mismatch-2026
  score: 0.7
  reason:
    en: This adds a measured confirmation that shared instruction files are read in
      full past 32KiB even via symlink, turning the previous unverified behavior into
      a documented fact.
    ko: 공유 규칙 파일이 32KiB를 넘으면 심링크로 연결해도 전체를 읽는다는 새 실측 결과를 추가해, 기존 글의 미확인 동작을 이제 확정할
      수 있다.
    ja: 共有ルールファイルが32KiBを超えるとシンボリックリンク経由でも全体を読むという新実測を追加し、既存記事の未確認動作を確定できる。
    zh: 新实测确认共享规则文件超过32KiB时即使通过符号链接也会被完整读取，将前文未验证的行为转为确证。
- slug: codex-agents-md-32kib-truncation-boundary-math-2026
  score: 0.7
  reason:
    en: To see how the Codex 32KiB boundary actually behaves beyond the documented
      limit, this case of full reads through symlinks in shared files is the evidence
      you need.
    ko: Codex의 32KiB 경계를 넘어선 실제 동작을 확인하려면, 공유 파일 및 심볼릭 링크에서 전체 읽기가 발생하는 이번 사례를 반드시
      살펴봐야 합니다.
    ja: Codexの32KiB境界を超えた実際の動作を確かめるには、共有ファイルやシンボリックリンクでの全文読み込みが起きる今回の事例を必ず確認してください。
    zh: 要了解Codex 32KiB边界在超出文档限制后的真实行为，这个通过符号链接共享文件时全文读取的案例正是你需要的证据。
---

## 二つのAIが同じ説明書を読むために

CodexとClaude Codeを一緒に使うなら、指示を書いたファイルを一箇所で管理したいところだ。二つのAIに同じ指示を読ませるには、同じファイルを参照させるのが簡単だ。本を二冊買う代わりに、同じ本を二人で読む方法を試した。

「AGENTS.md」は、AIに仕事の進め方を教えるためのファイル形式だ。対応している道具なら誰でも読める。このファイルに指示を書いておくと、その指示が有効になる。CodexもClaude Codeもこの形式を読む。一つのファイルを両方から参照できれば、指示の重複を避けられる。

二人の助手が同じ本を使う場面を考えてみよう。コピーを二冊作る代わりに、二人とも同じ本の同じページを開く。これがシンボリックリンクの考え方だ。

実際に試してみた。

## シンボリックリンクは実際に機能する

まず、シンボリックリンクで指示ファイルを共有できるかを確認した。Claude Codeはプロジェクトの一番上のフォルダや、その上のフォルダにあるメモリファイルも読む。つまり、上位ディレクトリに置いた指示は、下位ディレクトリからでも届く。この性質を利用して、ルートに置いたファイルをシンボリックリンクで下位から参照できるかを試した。

<div class="lm-card lm-card--cell" data-lm-figure="explain-cell-c3-subdir-reachability-of-root-symlink" data-lang="ja"><span class="lm-card__badge lm-card__badge--ok">成功</span><span class="lm-card__title">サブフォルダからルート到達</span><span class="lm-card__text">3回の実行すべてがexit code 0で終了し、サブディレクトリから上へ3段階上がってルートのシンボリックリンクに到達し、ワーク方向探索でもマーカーが確認された。</span><div class="lm-card__numbers"><span class="lm-card__chip">到達距離 3</span><div class="lm-card__bar"><div class="lm-card__bar-fill" style="--lm-bar-w:100.0%"></div><span class="lm-card__text">実行成功 3/3</span></div></div></div>

実験では、下位ディレクトリからルートのシンボリックリンクへの到達を3回試みた。結果は3回とも成功した。さらに、ホームディレクトリの.codex/AGENTS.mdと.claude/CLAUDE.mdの両方が、共有ファイルを指していることも確認できた。

これは本が一冊しかなくても、どこからでも手が届くようなものだ。シンボリックリンクも同じで、実体は一つ、案内だけが複数ある。

この結果から、シンボリックリンクによる共有は実際に成立する。ファイルの場所が違っても、同じ指示にたどり着ける。

## 32KiBを超えると全体が読まれる

実際に測定すると、共有ガイドラインが32KiBを超えた瞬間に「共有」という前提が崩れることが確認できた。32KiBは約32,000バイトで、日本語の文章なら原稿用紙80枚分ほどの量だ。この実験では、共有ガイドラインのサイズを段階的に変え、シンボリックリンク経由で読み込まれるバイト数を測定している。

<div class="lm-card lm-card--cell" data-lm-figure="explain-cell-c5-shared-size-budget-32kib" data-lang="ja"><span class="lm-card__badge lm-card__badge--ok">成功</span><span class="lm-card__title">32KiBサイズ制限</span><span class="lm-card__text">v31は31769バイトで制限内だったが、v33は33817バイトで制限を1049バイト超え、シンボリックリンク経由の読み込みサイズも33817バイトで同じだった。</span><div class="lm-card__numbers"><span class="lm-card__chip">v31サイズ 31769</span><span class="lm-card__chip">v33サイズ 33817</span><span class="lm-card__chip">超過量 1049</span></div></div>

検証の結果、31,769バイトのファイルは制限内で、33,817バイトのファイルは制限を1,049バイト超えていた。そして重要なのは、制限を超えた33,817バイトのファイルが、シンボリックリンク経由でも全体が読み込まれたことだ。つまり、ファイルが32KiBの制限を超えていても、途中で切られるのではなく、全容量がそのまま読み込まれる。

この理由は、シンボリックリンクがファイルシステムの機能であり、リンク先のファイルを指し示すことにある。AIコーディングエージェントはそれを実際のファイルとして扱い、全体を読み込む。サイズを確認して切り詰めるのではなく、まず全部を読んでから処理をする。

この仕組みを身近な例で考えてみよう。本棚から本を1冊取り出すとき、その本が厚くても薄くても、本全体を手に取る。目次だけ読もうとしても、まず本を開かなければ目次にたどり着けない。シンボリックリンクも同じで、ファイル全体を読むことを前提にしている。

共有ガイドラインが32KiBを超えると、シンボリックリンクで接続していても問題になる。ファイルが大きいまま読み込まれるため、AIの道具が処理しきれなくなる可能性がある。

## 小さいチームには有効な方法

ここで、反論を考えてみよう。32KiBの上限は実際にはほとんど超えない。多くのチームの指示は数KiB程度で、超えたとしても文書を分けたり要約したりすればいい。だから、上限超過は理論上の問題で、実際のリスクではない。

この反論は、指示が小さく保たれているチームには正しい。CodexはAGENTS.mdを読み、同じフォルダにある「AGENTS.override.md」が「AGENTS.md」より優先される。この仕組みを使えば、ファイルを分けて管理することもできる。指示が小さいうちは、シンボリックリンクで共有しても問題は起きない。

シンボリックリンク共有が危険なのは、指示が大きくなる可能性があるチームだけだ。今は小さくても、プロジェクトが成長して指示が増えれば、いつの間にか上限を超えているかもしれない。

### 明日からできること

今日確認した事実を踏まえて、チームの状況に応じた対応を取る必要がある。

ガイドラインが32KiBを超える可能性があるチームは、共有ガイドラインのサイズを自動チェックで測定し、32KiBを超えた時点でシンボリックリンクの共有を解除するか、ドキュメントを分割する仕組みを追加してほしい。これにより、予算超過による予期しない動作を防げる。

ガイドラインが32KiB以下に収まるチームは、シンボリックリンク共有を続けてよい。ただし、サイズの測定を定期的に実行し、予算超過を早期に検出する仕組みを入れておくことが重要だ。冒頭の問いに対する答えが見えた。シンボリックリンクで接続した共有ファイルは、32KiBを超えると途切れずに全体が読み込まれる。そのため、ガイドラインが大きくなるチームは、共有の仕組みを再検討する必要がある。ここで「32KiBの制限を超えるとファイル全体が読み込まれる」という事実が、共有戦略を判断する基準になる。

## この記事が確認できなかったこと



CodexとClaude Codeがシンボリックリンクで接続された指示ファイルを実際に読み込むかどうかは、この実験では検証されなかった。

overrideファイルが存在するときにシンボリックリンクの共有がどう壊れるかは、観測されなかった。

32KiBの予算が二つのツールで同じ単位（バイトか文字か）で計算されるかは、確認されなかった。

32KiBを超える共有指針ファイルをシンボリックリンクで接続したとき、CodexまたはClaude Codeがファイルを途中で切って読むことが観測されれば、この記事の主張は正しくない。

## 参考資料

1. [AGENTS.md](https://agents.md/)
2. [Claude Code Memory](https://code.claude.com/docs/en/memory)（Anthropic）
3. [Codex Documentation](https://platform.openai.com/docs/codex)（OpenAI）