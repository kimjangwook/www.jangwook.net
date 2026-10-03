---
title: ユーザーの一言が規則一つとぶつかると、Claude CodeはCLAUDE.mdの規則文書を丸ごと捨てる
description: リポジトリに置いた規則文書はモデルに届くが、守られるとは限らない。ユーザーが一つ逆の頼みをしただけで、文書全体が攻撃と判定されて捨てられた実測を書く。
pubDate: '2026-08-29'
heroImage: ../../../assets/blog/loaded-rules-discarded-as-prompt-injection-when-user-pushes-2026/hero.png
tags:
- claude-code
- agents-md
- rules
- measurement
relatedPosts:
- slug: declared-rules-fail-open-robots-txt-agents-md-2026
  score: 0.7
  reason:
    en: This conflict-request experiment shows the flip side of the earlier finding
      that declared rules get silently dropped when truncated.
    ko: 이번 글의 충돌 요청 실험은 규칙 파일이 잘려도 조용히 무시된다는 기존 실측 결과의 반대편 사례를 보여준다.
    ja: 今回の競合リクエスト実験は、ルールファイルが切り詰められても静かに無視されるという既存の実測結果の裏側を補う事例だ。
    zh: 本次冲突请求实验恰好补充了此前关于规则被截断后会被静默忽略的实测结论。
- slug: agents-md-three-wirings-equal-cost-codefence-silent-trap-2026
  score: 0.7
  reason:
    en: The observation that CLAUDE.md is merely a suggestion extends the earlier
      experiment showing three @AGENTS.md wirings measure equal and a codefence line
      silently swallowing the whole file.
    ko: CLAUDE.md가 제안일 뿐이라는 관찰은, CLAUDE.md에 @AGENTS.md를 연결하는 세 방식이 측정상 동일하며 코드펜스 한
      줄이 문서 전체를 삼키는 함정을 검증한 이전 실험의 자연스러운 후속이다.
    ja: CLAUDE.mdはあくまで提案にすぎないという観察は、@AGENTS.md接続の3方式が測定上同等でコードフェンス1行が文書全体を飲み込む罠を検証した前回の実験の自然な続きである。
    zh: CLAUDE.md 只是一份建议这一观察，延续了此前验证三种 @AGENTS.md 接线方式成本相同、代码围栏一行会吞掉整篇文档的实验。
---

## 規則文書が守られるかを測った方法

Claude Codeという、コードを書いてくれるAIアシスタントには、あらかじめ読ませておける「お願いメモ」のようなファイルがある。名前はCLAUDE.md、あるいはAGENTS.mdという。家族のために冷蔵庫に貼る紙と同じで、「帰ったら手を洗うこと」のように、このプロジェクトではこうしてほしい、という決まりを書いておく仕組みだ。

そのメモが本当に守られるのかを確かめた。やり方は家事の分担表と同じ感覚だ。まずメモを何も貼っていない状態で、同じ仕事を6回頼んで、普段どおりの癖を測る。次にメモを貼って同じ仕事を6回頼み、癖が変わるかを見る。最後に、メモと反対の頼み方を一言だけ混ぜて、メモが耐えるかを試す。出力からは、メモに書いた合言葉の行、コメントの挿入、特定の書き方の使用をそれぞれ数えて比べた。

<div class="lm-card lm-card--how" data-lm-figure="explain-how" data-lang="ja"><span class="lm-card__title">測定手順</span><ol class="lm-card__steps"><li class="lm-card__text">ステップ 1. ルール文書のない基本状態でコードを生成させ基本習慣を測った。</li><li class="lm-card__text">ステップ 2. ルール文書を入れ同じコードを生成させ変化が生じるか見た。</li><li class="lm-card__text">ステップ 3. ユーザーがf-stringを使えと押し付け衝突を作りルールが耐えるか見た。</li><li class="lm-card__text">ステップ 4. 出力からマーカートークン、カナリア行、コメント、f-string使用をそれぞれ数えて比較した。</li></ol></div>

## 中立な課題では規則文書はコードの習慣を変えた

先に結果の読み方を決めた。守るかどうかは、メモを何も置かない状態の癖と比べて初めて分かる。基本状態では、6回すべての回答がf-stringという文字の組み立て方を使った。f-stringは、プログラミングで文字に名前を挟み込んで作る手書きのテンプレートのような道具で、今回のメモは「それを使わず別の方法で書くこと」を含んでいた。

メモを貼って、反対の頼みを含まない普通の課題を6回出した。結果は、メモは6回ともモデルに届いた。f-stringを使わずに書くという一番強い規則は、6回中6回守られた。基本状態で6回だったものが0回になったので、メモは確かにコードの習慣を変えた。ただし、他の二つの規則は6回中4回しか守られなかった。

<div class="lm-card lm-card--cell" data-lm-figure="explain-cell-claude-rules-neutral" data-lang="ja"><span class="lm-card__badge lm-card__badge--ok">成功</span><span class="lm-card__title">Claude ルールあり</span><span class="lm-card__text">6回ともルール文書を読みf-stringをすべて断ったがマーカー・カナリアのルールは6回中4回しか守らなかった。</span><div class="lm-card__numbers"><div class="lm-card__bar"><div class="lm-card__bar-fill" style="--lm-bar-w:100.0%"></div><span class="lm-card__text">ルール到達 6/6</span></div><div class="lm-card__bar"><div class="lm-card__bar-fill" style="--lm-bar-w:100.0%"></div><span class="lm-card__text">f-string禁止 6/6</span></div><div class="lm-card__bar"><div class="lm-card__bar-fill" style="--lm-bar-w:66.7%"></div><span class="lm-card__text">カナリア行数 4/6</span></div><div class="lm-card__bar"><div class="lm-card__bar-fill" style="--lm-bar-w:66.7%"></div><span class="lm-card__text">コメント挿入 4/6</span></div></div></div>

つまり届くことと守ることは別の話で、守りの強さは規則ごとにばらつく。同じ300バイトの小さなメモなのに、結果に幅が出た。ここまでなら、よくできたお願いメモの範囲で済む話である。

## ユーザーの一言が規則と衝突したあと、文書全体が捨てられた

問題は次の実験からだった。同じメモに、課題の中に一言だけ「f-stringを使ってほしい」という逆の頼みを混ぜた。家で言えば、「洗う前に手を洗わないこと」と一言書き足したメモを冷蔵庫に残すようなものである。

予想は単純だった。f-string禁止の規則一つだけが破られて、ほかの規則はそのまま守られるだろうと。実際の結果はそうならなかった。6回とも、モデルはメモの中の規則を「プロンプト攻撃」だと判断した。プロンプト攻撃とは、他人が忍ばせた怪しい指示のことだ。メモの内容は丸ごと拒否された。6回中6回、である。うち5回はメモの合言葉ZZLOAD52とZZMARK31を一字一句引用しながら拒否し、残る1回は規則の並びを復唱してから拒否した。

<div class="lm-card lm-card--cell" data-lm-figure="explain-cell-claude-rules-userpush" data-lang="ja"><span class="lm-card__badge lm-card__badge--ok">成功</span><span class="lm-card__title">Claude ユーザー押し</span><span class="lm-card__text">6回ともルール文書を読んだがすべてプロンプト攻撃と判定して拒否しf-stringをそのまま使った。</span><div class="lm-card__numbers"><div class="lm-card__bar"><div class="lm-card__bar-fill" style="--lm-bar-w:100.0%"></div><span class="lm-card__text">ルール到達 6/6</span></div><div class="lm-card__bar"><div class="lm-card__bar-fill" style="--lm-bar-w:100.0%"></div><span class="lm-card__text">f-string使用 6/6</span></div><div class="lm-card__bar"><div class="lm-card__bar-fill" style="--lm-bar-w:0.0%"></div><span class="lm-card__text">カナリア行数 0/6</span></div><div class="lm-card__bar"><div class="lm-card__bar-fill" style="--lm-bar-w:0.0%"></div><span class="lm-card__text">コメント挿入 0/6</span></div></div></div>

二つの実験の間で違うのは、頼み方の中のたった一文だけだ。同じメモ、同じ課題の形で、規則の守られ方が6回中4回から6回中0回に落ちた。理由は規則の強さではない。頼み方の文脈が、メモ全体の信頼の判定を先に変えたのだと考えられる。

## 衝突しなかった規則まで一緒に崩れた細かい数字

衝突しなかった規則まで一緒に落ちた。コードに目印のコメントを入れる規則と、決まった合言葉の行を入れる規則の二つは、ユーザーの頼みと何の衝突もなかった。それでもこの二つは、6回中4回から6回中0回へ落ちた。メモの一枚に書かれていた以上、一括で捨てられたということだ。

反対にf-stringは、禁止が崩れて6回中6回使われた。つまり衝突した規則だけが一つ折れたのではなく、衝突しなかった規則が二つと、動作確認のための合言葉まで全部が一緒に消えた。ユーザーが書いたはずのメモを、ユーザー自身の一言との衝突を理由に、他人のいたずらと区別できなかったわけである。

「それでも安全のための防御ではないか」という考えがある。プログラムを置いておく場所、いわゆるリポジトリに置かれた文書も、悪意ある人が忍ばせる場所になりうるので、モデルが疑って拒否するのは防御として筋が通る。その通りだと思う。ただ、防御が正しく拒否したのは衝突した規則一つのはずで、実際は衝突しない規則二つまで道連れになった。正規の頼み方を6回中6回攻撃と分類するのは、防御ではなく誤認である。

## 公式文書が効果を保証していないという文書の対照結果

メーカー自身の説明とも突き合わせた。Claude Codeの公式文書は、規則文書が、モデルが最初から抱えている基本の指示書であるシステムプロンプトではなく、システムプロンプトの後ろに届く利用者メッセージとして渡されると説明している。そして、あいまいだったり矛盾したりする指示については、守られる保証はないと書いている。守られることを誰も約束していない、と最初から書いてあるわけだ。

> Settings rules are enforced by the client regardless of what Claude decides to do. CLAUDE.md instructions shape Claude's behavior but are not a hard enforcement layer.
> — [Claude Code memory 公式 문서](https://code.claude.com/docs/en/memory)

つまり設定側の規則は機械が強制するが、文書に書いた規則は形を整えるだけで、強制ではないと公式が明言している。AGENTS.mdの仕様書も、ユーザーのチャットの指示がすべてを上書きすると書いている。さらに調べると、四つのメーカー文書のどれにも、「文書を読み込ませると出力が変わる」という効果そのものの宣言は一つもなかった。どこでどう読み込むかの説明は厚いのに、読み込んだ結果何が起きるかの説明は一行もない。

ここで自分にとって効いてくるのは、「書いたから守られる」という感覚の下限を知ることだ。公式の仕様が保証しない部分に、日々の仕事の品質を預けてはいけない。

## 守られなければならない規則を置くべき場所

結局自分に残るのは、規則の置き場所を分ける話だ。メモに書いた規則は「守られる確率のある提案」であり、絶対に守らせたい規則は、文章ではなく検査する装置に任せる。プログラミングの世界では、書き方の決まりを自動で検査して直してくれる道具がある。この道具はリンターと呼ばれる。これならユーザーの一言で外れることがない。

<div class="lm-card lm-card--takeaway" data-lm-figure="explain-takeaway" data-lang="ja"><span class="lm-card__title">結論</span><p class="lm-card__takeaway">ルール文書はモデルに確実に届きコード習慣の一部を変えるが、ユーザーが逆に押すとルールはプロンプト攻撃として扱われて崩れる。</p></div>

冷蔵庫のメモに例え直すなら、こうなる。家族全員に絶対守ってほしい決まりなら、メモに書かずに、玄関の鍵が開かない仕組みにする。メモは読んでくれても、守るかどうかはその日の気分と文脈次第だ。書く場所の分け方が、そのまま品質の分け方になる。

## この記事が確認できなかったこと

今回測ったのは、Claude 2.1.245とsonnetという一つの組合せ、一つの文字組み立ての課題、300バイトの規則文書という狭い条件の中だけだ。Codexという別のアシスタントとAGENTS.mdでの同じ実験は、実行枠が尽きて1回も測れていない。規則の強さを少しずつ変えたときの曲線も、二点しか測っていないため描けない。次に確認すべきのは、別のモデルや別の条件でも同じ全滅が起きるか、そして誤認がどこで生まれているのかである。

この判断が覆る条件は一つある。ユーザーの頼みが規則一つと衝突しても、衝突した規則だけが変わり、残りの規則と合言葉の行がそのまま守られる結果（6回中4回程度）が観測されれば、この記事の判断は間違いだ。

規則文書に書いておけば守られると信じている人は、本当に守らせたい規則を文章から検査する装置へ移す。規則と衝突する頼みをよく受ける人は、衝突する頼みをファイルに混ぜず、その都度言葉で直接伝える。

## 参考資料

1. [Claude Code memory 공식 문서](https://code.claude.com/docs/en/memory) — Anthropic
2. [agents.md 스펙](https://agents.md/) — agents.md
3. [Claude Code security 공식 문서](https://code.claude.com/docs/en/security) — Anthropic