---
title: "同じルールをCLAUDE.md、スキル、サブエージェントに移して分かった、判断軸はコストではないという事実"
description: "CLAUDE.md、SKILL.md、サブエージェントは到達範囲とライフサイクルの異なる問題を解く。三層の本当の境界線は強制力にあり、どれ一つとして制御層ではない。"
pubDate: 2026-08-24
heroImage: '../../../assets/blog/claude-md-vs-skill-vs-subagent-same-rule-three-layers-measured-2026/hero.png'
tags:
  - AI Engineering
  - Agent Architecture
  - Developer Productivity
relatedPosts: []
---

同じルールをCLAUDE.mdからスキルへ、さらにサブエージェントへ移したとき、コンテキストのコストが本当に下がるのかを知りたかった。公式に記載されたロード経路を追い、トークンの数字を信じる前に計測ハーネス自体を検証するためClaude CLIのコマンドを統制した条件で走らせた。結論としては、層の選択は到達範囲、ライフサイクル、隔離、強制力の判断であって、コストを下げるための単純な移設ではない。

この判断軸が効いてくるのは、エージェントへの指示がそのまま本番の業務手順になりつつあるからだ。私の立場は単純で、配置ルールを決め、重複した指示を消し、譲れない統制はフックへ移す。

## ルールをどこに書くか、という問いの手前にあるもの

アーキテクチャの刷新に関わっていると、この問いは決まった形でやってくる。エージェントに守らせたいなら、この指示はどこに置けばいいのか。

まずプロジェクトのルールがCLAUDE.mdに一行増える。それが育つ。長くなった手順を誰かがSKILL.mdへ切り出す。それでも守られない気がして、専用のサブエージェントが生まれる。数回そうしているうちに、同じ指示が三か所に存在し、あの実行ではどのコピーが読み込まれていたのかを誰も言えなくなり、後から入った修正が矛盾を作る。

これはトークン効率の話にとどまらない。ID情報や財務記録、個人データを扱うシステムでは監査の問題になる。「PIIをログに書くな」がコンテキストに載っていたことは、その行為が止められた証拠にはならない。プロンプトに置いたルールは振る舞いへの働きかけであり、行為を遮断する統制はまったく別種の部品だ。

Claude Codeはその区別をはっきり書いている。

> "Both are loaded at the start of every conversation. Claude treats them as context, not enforced configuration. To block an action regardless of what Claude decides, use a PreToolUse hook instead."

> — [How Claude remembers your project](https://code.claude.com/docs/en/memory)

EMとしては、レビューで投げる質問がここで変わる。指示の書き方が良いかどうかだけを見ない。事業がそれを助言として頼っているのか、作業手順として頼っているのか、隔離として頼っているのか、それとも実際の予防統制として頼っているのかを聞く。

## 三つの層はロード経路が違う

CLAUDE.mdは常駐コンテキストだ。セッション冒頭で読み込まれ、会話と並んでトークンを食う。

> "CLAUDE.md files are loaded into the context window at the start of every session, consuming tokens alongside your conversation."

> — [How Claude remembers your project](https://code.claude.com/docs/en/memory)

だからCLAUDE.mdが向いているのは、短く安定したプロジェクトの事実だ。リポジトリの規約、動かせないアーキテクチャ上の制約、作業の全体で本当に必要な少数のルール。ただしシステムプロンプトではない。ドキュメントによれば、その内容はシステムプロンプトの後にユーザーメッセージとして届く。つまり強制設定ではなく、あくまでコンテキストだ。

スキルはコストの形が違う。エージェントが見つけられるように説明文だけが並び、本体の指示は呼び出されたときにだけ読み込まれる。

> "Unlike CLAUDE.md content, a skill's body loads only when it's used, so long reference material costs almost nothing until you need it."

> — [Extend Claude with skills](https://code.claude.com/docs/en/skills)

これが段階的開示で、確かに価値がある。ただし「必要になるまではほぼゼロ」は「必要になった後もほぼゼロ」を意味しない。いったん呼び出されたスキルの本文は、そのセッションの残り全体に居座る。ドキュメントはその経済的な帰結を明示している。

> "Once a skill loads, its content stays in context across turns, so every line is a recurring token cost."

> — [Extend Claude with skills](https://code.claude.com/docs/en/skills)

だからスキルは本質的に安いわけではない。コストの開始時点を後ろにずらしているだけだ。コンパクション時、Claude Codeは各スキルの直近の呼び出しを要約の後ろに再添付し、合計25,000トークンの枠の中でスキルごとに先頭5,000トークンを残す。多くのスキルを呼んでいれば、古いものは丸ごと落ちる。

サブエージェントはさらに別のカテゴリだ。親の会話を引き継がず、隔離されたコンテキストから始まる。

> "Each subagent starts with a fresh, isolated context window. It doesn't see your conversation history, the skills you've already invoked, or the files Claude has already read."

> — [Subagents](https://code.claude.com/docs/en/sub-agents)

この隔離は、放っておけば本流の作業コンテキストを汚す種類のタスクで効く。ただし、サブエージェントが空から始まるという意味ではない。

## 最適化が崩れるのは継承が始まる地点

よく語られる移設の物語はこうだ。CLAUDE.mdは高い、スキルは遅延ロード、サブエージェントは隔離されている。だから指示を下へ下へと動かせばコストは下がる。

公式に書かれた仕組みは、それを一般則としては支えない。

フォークではないサブエージェントは、自分のタスクメッセージとシステムコンテキストから始まるが、同時に本流の会話が読み込むCLAUDE.mdの階層も受け取る。その階層が無人実行で実際に何を読むかは、@importとシンボリックリンクを21回試した記録にまとめてある。ユーザーレベル、プロジェクト、ローカル、管理ポリシーのファイルが含まれる。組み込みのExploreとPlanが例外として明記されている。

起動経路は、事前ロードされたスキルの意味も変える。通常のセッションなら、スキルは必要になるまで開示されないままでいられる。しかしスキルを設定したサブエージェントでは、起動時に本文が丸ごと注入される。

> "Subagents with preloaded skills work differently: the full skill content is injected at startup."

> — [Extend Claude with skills](https://code.claude.com/docs/en/skills)

経営層に持ち帰ってほしいアーキテクチャ上の要点はここだ。段階的開示はファイル形式の性質ではない。ロード経路の性質だ。

SKILL.mdの形式は[オープン標準として公開](/ja/blog/ja/anthropic-agent-skills-standard)され、対応するエージェント製品が増えたことで移植性が上がった。だから再利用する手順の置き場所としては筋がいい。とはいえ、どのランタイムでも同じ遅延ロードの挙動が保たれる保証にはならない。特にサブエージェントの実装をまたぐと差が出る。

> "Discovery: At startup, agents load only the name and description of each available skill... Full instructions load only when a task calls for them, so agents can keep many skills on hand with only a small context footprint."

> — [Agent Skills Overview](https://agentskills.io/home)

アーキテクチャの統制としては、「何が継承されるのか」と「いつ読み込まれるのか」を別々の列として文書化しなければならない。この二つを一つの頭の中のモデルにまとめてしまうチームが、コストの不意打ちとコンプライアンスの死角を作る。

## 反論が正しくなる範囲

いちばん強い反論は、サブエージェントが親の会話履歴を受け取らないという点だ。長く走ったセッションなら、その履歴は引き締まったCLAUDE.mdより桁違いに大きい。サブエージェントが短い要約だけを返すなら、長い履歴を渡さずに済む分の節約が、継承したプロジェクト指示のコストを大きく上回る。

この主張は、三つの条件がそろったときに正しい。

- 親セッションにすでに相当量の会話履歴が積み上がっている。
- CLAUDE.mdが200行という運用指針の内側に保たれている。
- サブエージェントが詳細な作業ログではなく、簡潔な結果を返す。

この条件下ではサブエージェントを使うほうが経済的に有利になりうる。隔離は出力の質も上げる。探索の残骸、騒がしいリポジトリ走査、途中の推論を本流のタスクコンテキストから遠ざけられるからだ。

ただし、この反論は「ルールをサブエージェントへ移せば一般に安くなる」までは証明しない。セッション序盤の短い委譲では弱まる。CLAUDE.mdが層状に膨らんだモノレポでも弱まる。サブエージェントが詳細な結果を返す場合も弱まる。戻り経路が効くのは、完了したサブエージェントの結果が本流の会話に入ってくるからだ。

ドキュメントはその往復について直接警告している。

> "When subagents complete, their results return to your main conversation. Running many subagents that each return detailed results can consume significant context."

> — [Subagents](https://code.claude.com/docs/en/sub-agents)

だからサブエージェントの採否は、ワークフローの一取引として評価すべきだ。起動時のコンテキスト、隔離された中での作業、親へ返る結果。新しいコンテキストウィンドウだけを見るのは、分散サービスをリクエストハンドラの実行コストだけで評価し、シリアライズも転送もレスポンス本体も勘定に入れないのと変わらない。

## トークン計測に本番テレメトリと同じ厳密さが要る理由

層ごとのトークン計測値は報告できない。予定していた一連の実行はexit code 0で終わったのに、パーサーが最上位をJSONオブジェクトと決め打ちしていたため、CLIが配列を返した時点で使える計測値は一つも残らなかった。ここから引くべき結論は、ある層が安かった高かったではない。計測が取れていなかった、である。

統制した実行を1本行ったところ、Claude CLI 2.1.241で`claude --output-format json`は辞書ではなく最上位のリストを返した。リストには`system`、`assistant`、`rate_limit_event`、`result`の要素が入っており、使用量のデータは`result`要素の中にあった。ヘッドレスモードのドキュメントは形式を別のように説明している。

> "json: structured JSON with result, session ID, and metadata"

> — [Headless mode](https://code.claude.com/docs/en/headless)

地味な失敗だが、経営上の意味は小さくない。AIのコスト統制を、最上位の型を確かめずに出力スキーマを決め打ちするスクリプトの上に置くことはできない。ダッシュボードは、実際には計測できていない実行について、きれいなゼロを表示してしまう。データが欠けているより悪い。誤った自信で意思決定を呼び込むからだ。

公式のサブエージェントのドキュメントも、2026-08-24時点でspawnあたりのトークン数を示していない。二次情報がマルチエージェントのワークフローに4-7倍という係数を当てているが、その公式出典とされる記述は、対応する公式ページや声明として確認できなかった。参考点であって、予算モデルではない。

> "Anthropic's own documentation notes that multi-agent workflows use roughly 4-7x more tokens than single-agent sessions"

> — [Claude Code Agents & Subagents — What They Actually Unlock](https://www.ksred.com/claude-code-agents-and-subagents-what-they-actually-unlock/)

CFOとCTOは、クラウドのユニットエコノミクスに求めるのと同じ基準を要求していい。観測された消費、文書に書かれた上限、モデルの仮定、外部の主張。この四つは交換可能ではない。

## 配置をチームの運用系に落とす

実務的な答えは、プルリクエストでレビューできる四つの配置方針だ。

| 必要なもの | 置き場所 | レビューで聞くこと |
| --- | --- | --- |
| 作業全体で必要な安定した事実 | CLAUDE.md | 本当に毎セッション必要か |
| 特定の作業で使う複数ステップの手順 | SKILL.md | 手順をもっと短くできるか、関連する時だけ呼ばれているか |
| 要約された結果を返す隔離された調査 | サブエージェント | 隔離の価値が起動と戻りのコンテキストコストを上回るか |
| 行為を止めなければならないルール | PreToolUseフック | モデルの遵守と切り離して統制をテストし監査できるか |

この方針は、掲げるだけでなく動かす形にしたい。

第一に、CLAUDE.mdを200行で止めるチーム規律を敷く。数字に魔法はない。決めることに意味がある。常駐する一行ごとに問いを通す。これは毎セッション必要なのか、それとも手順やテスト、リンタールール、フックの欠落を埋め合わせているだけなのか。

第二に、サブエージェントがスキルを事前ロードするなら、長さの明示的な申告を必須にする。PRの説明に、spawnのたびにスキル本文が起動時に注入されると書かせる。いちばん高くつく誤解を、本番のワークフローに届く前に捕まえられる。

第三に、CLAUDE.md、スキル、サブエージェントのプロンプトを横断して重複したルールを洗う。重複は継続的なコンテキストコストを生むが、より深刻なのは食い違いだ。二つのコピーが違う内容になった瞬間、チームは文書化されていない優先順位の仕組みを抱えることになる。

第四に、コンテキストの確認をオンボーディングに入れる。エンジニアはリポジトリの構造から推測するのではなく、読み込まれたメモリファイルを実際に確認すべきだ。規律は単純で、読み込ませたつもりのものと実際に読み込まれたものを区別する。

最後に、計測ハーネスを本番ツールとしてバージョン管理する。出力は防御的にパースし、生のアーティファクトを保持し、スキーマの不一致はコストゼロの結果ではなく失敗した計測として扱う。

## CEOとCTOの判断はプロンプト最適化ではなくガバナンス

この規律の事業的な根拠は、削減できるトークンの割合ではない。歯止めのない運用挙動が減ることだ。

配置方針がなければ、指示の総量はチームの人数とともに増える。新しく入ったエンジニアは、いちばん目につくファイルにルールを足す。専門家は並行するスキルを作る。自動化の担当者はそれをサブエージェントに事前ロードする。コストの帰属は難しくなり、重要なワークフローが走ったときにどの方針が有効だったのかを誰も証明できない。

配置方針があれば、三つが同時に良くなる。

ユニットエコノミクスはレビュー可能になる。常駐コンテキスト、呼び出される手順、spawnされるワークロードに名前のついた持ち主と見える境界ができるからだ。利用が増えればコストは増えるが、それは静かな重複ではなく観測できる判断を通って増える。

コンプライアンスは説明しやすくなる。チームが文脈上の指示を統制と呼ぶのをやめるからだ。機微データの制限、本番コマンドのゲート、シークレットの取り扱いは[フックへ移せる](/ja/blog/ja/claude-code-hooks-workflow)。そこでは、遵守をお願いするのではなくシステムが遮断できる。

市場投入は速くなる。エージェント関連のPRのたびに、エンジニアが配置を原理から議論しなくて済む。運用モデルがはっきりしていれば設計のやり直しが減り、チームの注意は本来のプロダクトや移行の作業に向く。

私の推奨は、CLAUDE.md、SKILL.md、サブエージェントを三段階の値札として扱うのをやめることだ。CLAUDE.mdは短い常駐コンテキストに、スキルは選択的に呼び出す手順に、サブエージェントは隔離に、フックは強制に使う。この推奨を変えるとすれば、層ごとの信頼できるテレメトリが、重複して継承される指示を残すほうが消すより一貫して安いと示したときだけだ。

## 参考資料

1. [Extend Claude with skills](https://code.claude.com/docs/en/skills)
2. [Subagents](https://code.claude.com/docs/en/sub-agents)
3. [How Claude remembers your project](https://code.claude.com/docs/en/memory)
4. [Agent Skills Overview](https://agentskills.io/home)
5. [Headless mode](https://code.claude.com/docs/en/headless)
6. [Claude Code Agents & Subagents — What They Actually Unlock](https://www.ksred.com/claude-code-agents-and-subagents-what-they-actually-unlock/)
