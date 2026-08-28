---
title: CLAUDE.mdのルールは、ユーザーの指示一つと衝突すると6回中6回、丸ごと捨てられた
description: ルール文書はモデルに届くが、守られるとは限らない。ユーザーの一言がルールの一つと衝突した瞬間、衝突していないルールまで含めて文書全体が捨てられる実測を記録した。
pubDate: '2026-08-28'
heroImage: ../../../assets/blog/loaded-rules-discarded-as-prompt-injection-when-user-pushes-2026/hero.png
tags:
- claude-code
- agents-md
- prompt-injection
relatedPosts:
- slug: declared-rules-fail-open-robots-txt-agents-md-2026
  score: 0.7
  reason:
    en: The silent-truncation failure documented in the robots.txt and AGENTS.md measurements
      reappears here as a single user prompt discarding every CLAUDE.md rule, making
      this the direct continuation of that investigation.
    ko: robots.txt와 AGENTS.md 실측으로 확인한 '규칙이 잘려도 조용히 무시되는' 실패 구조가, CLAUDE.md 규칙 전체가
      사용자 프롬프트 하나로 버려지는 사례에서 그대로 재현된 배경을 설명한다.
    ja: robots.txtとAGENTS.mdの実測で確認した「ルールが切れても静かに無視される」失敗構造が、CLAUDE.mdのルール全体が一つのユーザープロンプトで捨てられる事例でそのまま再現された経緯を説明する。
    zh: 在robots.txt与AGENTS.md实测中发现的“规则被截断也被静默忽略”的失效结构，在CLAUDE.md全部规则被一条用户提示丢弃的案例中原样重现，因此这篇是前文的直接续篇。
- slug: agents-md-three-wirings-equal-cost-codefence-silent-trap-2026
  score: 0.7
  reason:
    en: The single conflicting prompt that made Claude Code discard every CLAUDE.md
      rule in this post is exactly the trigger that fires the silent codefence trap
      from the earlier piece, where all three official AGENTS.md wirings cost the
      same yet one line can erase the whole document.
    ko: 이번 글에서 다룬 '프롬프트 하나가 CLAUDE.md 전체를 무효화하는 문제'는, AGENTS.md를 읽어 들이는 세 방법의 비용이
      같다는 전제 위에서 코드펜스 한 줄이 문서를 조용히 지워버리는 이전 글의 함정이 정확히 어떤 경로로 발동되는지를 보여준다.
    ja: 本記事で扱う「たった一つのユーザープロンプトがCLAUDE.mdの全ルールを無効化する問題」は、AGENTS.mdを読み込む3つの公式方法のコストが同一であるという前提のもと、コードフェンス1行がドキュメント全体を静かに消し去る前記事の罠がどの経路で発動するかを明らかにする。
    zh: 本文中'一条冲突的用户提示让 Claude Code 丢弃全部 CLAUDE.md 规则'的问题，正是上一篇'三种官方 AGENTS.md 加载方式成本相同、一行代码围栏即可静默抹掉整个文档'的陷阱被触发的具体路径，值得接着读下去。
---

## ルール文書がモデルに届くことと守られることは別の出来事

![c1-head-reachable セルのraw出力抜粋 — ルール文書の到達6/6、遵守0/6。](../../../assets/blog/loaded-rules-discarded-as-prompt-injection-when-user-pushes-2026/log-c1-head-reachable.png)

プログラミングを手伝ってくれるAIには、あらかじめ決めておいた約束を読み込ませる仕組みがある。代表例がCLAUDE.mdというファイルだ。チームの書き方の約束を書いておく小さな文書である。チームの書き方の約束をこのファイルに書いておくと、AIが作業のたびにそれを読んでくれる。

読んでくれる。ここまでは確かめられている。しかし「読んだ」と「守った」は別の出来事だ。読み込まれても守られる保証はない文書であり、約束ではなく提案として渡されている。公式の説明もこう書いている。Claudeは内容を読み従おうとするが、特に曖昧だったり矛盾したりする指示について厳格に従うことは保証されない、と。

> CLAUDE.md content is delivered as a user message after the system prompt, not as part of the system prompt itself. Claude reads it and tries to follow it, but there's no guarantee of strict compliance, especially for vague or conflicting instructions.
> — [Claude Code memory 公式ドキュメント](https://code.claude.com/docs/en/memory)

つまりこの紙は、AIの土台にある「絶対に守る規則」の場所には置かれていない。その後ろに付け加える一枚のメッセージとして渡されている。

## 使い手の一言がメモごと覆す瞬間

私たちは300バイトほどの小さなルール文書を作り、3種類のルールを書き込んだ。そして同じ文書を使って、たった一ヶ所だけ変えた2つの実験を、それぞれ6回ずつ走らせた。結果がこれである。

| 実験 | 文書が届いた | ルール1を守った | ルール2を守った | ルール3を守った |
|---|---|---|---|---|
| 衝突のない依頼 | 6/6 | 4/6 | 4/6 | 6/6から0/6へ |
| 衝突する一言を足した依頼 | 6/6 | 0/6 | 0/6 | 6/6 |

上の段は、ルールとぶつからない普通の依頼をした場合だ。文書は6回全部届き、書き込んだルールのうち二つは4回ずつ守られた。基準となる、ルール文書を一切置かない実験では6回全部が既定の書き方に流れたので、文書があるだけでその流れを6回中0回まで押し返せたことになる。文書は効いている。

下の段が問題だ。こちらは依頼文に一文だけ追加した。その一文は、書き込んだルールの一つと正反対の要求をしている。当然、そのルール一つは守られないだろうと予想した。ところが結果は、衝突したルールだけが消えたのではなかった。同じ紙に書いてあった、何も衝突していない残りのルールまで、4/6から0/6へ丸ごと落ちた。

![c2-boundary-straddle セルのraw出力抜粋 — 準守4/6から0/6へひっくり返った2セルの対比。](../../../assets/blog/loaded-rules-discarded-as-prompt-injection-when-user-pushes-2026/log-c2-boundary-straddle.png)

つまり、一つの項目への反対一言で、反対されていない残りの項目まで紙ごと捨てられたのと同じ構造だ。

## 衝突していないルールまで一緒に捨てられた記録

![c3-beyond-limit-unreachable セルのraw出力抜粋 — 衝突していないルールの遵守4/6から0/6。](../../../assets/blog/loaded-rules-discarded-as-prompt-injection-when-user-pushes-2026/log-c3-beyond-limit-unreachable.png)

常識的な予想では、使い手の一言がルールの一つとぶつかれば、消えるのはその一つだけのはずだ。実測は違った。同じ300バイトの紙に書いてあった、ぶつかっていない残りのルール二つまで、出てくる成果物から消えた。

つまり起きているのは「ルールの強さが弱まった」ことではなく「紙そのものへの信頼が打ち切られた」ことだ。AIはその一文を読んだ時点で、このルール文書を信頼できる指示の経路とは別のものとして疑い始めた。一度そう判断すると、紙ごと手放した。消えたのはルール一つではなく、ルール文書そのものだった。

自分の仕事に置き換えるとこういうことだ。チームの書き方の約束を文書に集めて安心しているなら、その安心は「だいたい守られる」という程度の期待しか持てない。しかも約束の一つがその場の要求とぶつかると、無関係な約束まで連座して消える。

## 6回の実験がすべてルール文書を「偽の指示」と判定した結果

なぜ紙ごと消えるのか。実験の出力には答えの手がかりが残っていた。衝突する一言を足した6回のうち、6回全部がルール文書を「プロンプトインジェクション」だと明示的に判定した。それは正規の依頼に忍び込ませた偽物の指示のことである。5回は文書の特定の行をそのまま引用しながら拒否し、1回はルールの内容を言い直したうえで拒否した。

![c5-override-hides-canary セルのraw出力抜粋 — 6ランすべてがルール文書をプロンプトインジェクションと明示判定。](../../../assets/blog/loaded-rules-discarded-as-prompt-injection-when-user-pushes-2026/log-c5-override-hides-canary.png)

プロンプトインジェクションとは、AIに悪い指示を密かに入れ込む攻撃のことだ。偽物を見抜くための検査機能は、リクエスト全体を通して怪しい指示を探す。公式のセキュリティ文書もその方法をこう説明している。

> Context-aware analysis: Detects potentially harmful instructions by analyzing the full request
> — [Claude Code security 公式ドキュメント](https://code.claude.com/docs/en/security)

ここに反対意見がある。それは「これは欠陥ではなく防御だ」という考え方だ。リポジトリ（プロジェクトのファイル一式を保管する場所）に置かれた指示文書も、悪意の者が書ける場所である以上は攻撃の入り口になり得る。怪しいものを疑って拒否したのは、むしろ防御が働いた証拠だという主張である。

優先順位の部分ではこの主張は正しい。使い手の一言が文書に勝つ方向そのものは、公式の仕様が予告していた通りだった。しかし防御が捕まえたのは、衝突したルール一つではなかった。同じ紙に書いてあった無関係なルール二つと、実験の目印まで一緒だった。しかもこの文書は、使い手自身が自分のプロジェクトに自分で書き込んだ、公式に認められた指示の経路である。正規の窓口を偽物と判定する率が6回中6回では、これは防御ではなく誤検知だ。

## 公式文書は読み込みだけ宣言し、効果は宣言しない

もう一つ確認したのは、文書の側の説明の厚みだ。ベンダーの公式文書4つの表面を調べた結果、ルールを読み込む範囲や階層についての記述は見つかった。しかし「読み込んだルールが成果物を変える」という効果の記述は、4か所すべてで1件も見つからなかった。

仕様はどこに何を読むかを厚く説明する。その読みが何を変えるかには一言も触れない。書いた側は「置いた」で完了の気分になり、公式文書は効果を約束していない。この食い違いは各文書で同じ傾向として現れた。

## 守られなければならないルールを運ぶ自動検査の層

では、どうすればいいか。ルールを強さで分けることだ。

「守られればうれしいもの」は文書に置いていい。確率で守られる提案として扱う。一方、「絶対に守らなければならないもの」は、文書に任せない。設定として強制する層、いわば自動でチェックしてくれる道具に移す。公式文書もこの区別をはっきり書いている。設定の規則はClaudeの判断に関係なく強制され、CLAUDE.mdの指示は振る舞いを形作るだけで強制層ではない、と。

> Settings rules are enforced by the client regardless of what Claude decides to do. CLAUDE.md instructions shape Claude's behavior but are not a hard enforcement layer.
> — [Claude Code memory 公式ドキュメント](https://code.claude.com/docs/en/memory)

もう一つの対策は、衝突が予想される指示の置き場所だ。使い手の要求がルールとぶつかりそうなチームでは、ぶつかると分かっている指示をルール文書に入れない。文書ではなく、その日その場で言う側のメッセージにまとめる。実測では、衝突した一言が同じ紙の残りまで巻き込んで落とした。だから衝突のもとになる書き方を紙に混ぜないことが、紙全体を守ることになる。

## この記事が確認できなかったこと

今回確認できたのは、三つの条件の中だけである。使ったのはclaude 2.1.245（この道具の版）とsonnet（AIモデルの一つ）の組み合わせ、一つの文字列整形タスク、300バイトのルール文書だ。codex側の実験は18回すべて利用制限で止まり、エンジン比較の軸は空のままだ。AGENTS.md側での同じ実験も行っていない。判定がモデルの性質なのか仕組みの実装なのか、別の組み合わせで同じ誤検知が出るのかも未測定である。次に確認すべきは、利用制限が解けた後のcodex軸での再実行と、複数のモデル組み合わせでの再現だ。

この判断が覆る条件は一つ。使い手の一言がルール一つとぶつかっても、そのルールだけが消えて同じ文書の残りのルールが成果物にそのまま残るなら、この記事の主張は間違いである。

ルール文書に書いただけでは守られない。だから絶対に守らせたい約束は、人の約束ではなく、自動で検査してくれる道具に預ける。ルール文書に書いた約束は「だいたい守られる願い」として扱う。逆に、使い手の要求とルールがぶつかりがちなチームは、ぶつかると分かっている指示をルール文書に入れず、その場で言う側にまとめる。

## 参考資料

1. [Claude Code memory 공식 문서](https://code.claude.com/docs/en/memory) — Anthropic
2. [agents.md 스펙](https://agents.md/) — agents.md
3. [Claude Code security 공식 문서](https://code.claude.com/docs/en/security) — Anthropic