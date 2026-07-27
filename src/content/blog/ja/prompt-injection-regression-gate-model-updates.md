---
title: "モデルを上げるたびに注入テストを回し直す理由：ゲートを実際に組んでみた"
description: "LLMパイプラインに注入回帰スイートを実際に回した。素朴なガードは11件中2件、構造的なガードは11件すべてを止め、リファクタで落ちた検知もゲートが指し当てた。"
pubDate: '2026-07-27'
heroImage: ../../../assets/blog/prompt-injection-regression-gate-model-updates/hero.png
tags:
  - security
  - llm
  - web-development
  - ci-cd
relatedPosts:
  - slug: icml-prompt-injection-academic-review
    score: 0.88
    reason:
      ko: "저 글이 '논문 PDF에 숨은 인젝션'이라는 공격면을 보여줬다면, 이 글은 그 공격을 내 파이프라인에서 CI로 막는 방어면을 다룬다. 공격을 봤으면 게이트도 봐야 한다."
      ja: "あちらが『論文PDFに潜む注入』という攻撃面を見せた回なら、こちらはその攻撃を自分のパイプラインでCI遮断する防御面。攻撃を見たならゲートも見ておきたい。"
      en: "That post showed the attack surface — injections hidden in paper PDFs. This one covers the defense surface: blocking those attacks in your own pipeline via CI. If you saw the attack, look at the gate too."
      zh: "那篇展示了攻击面——藏在论文 PDF 里的注入；这篇讲防御面：在自己的流水线里用 CI 拦住它。看过攻击，也该看看关卡。"
  - slug: validate-structured-data-ci-jsonld-2026
    score: 0.8
    reason:
      ko: "측정을 CI 게이트로 굳히는 절차의 원형이 저 글이다. 저기선 구조화 데이터였고 여기선 인젝션 방어인데, exit 1로 배포를 막는 뼈대는 같다."
      ja: "測定をCIゲートに固める手順の原型があちら。あちらは構造化データ、こちらは注入防御だが、exit 1でデプロイを止める骨格は同じ。"
      en: "The template for hardening a measurement into a CI gate lives there. There it was structured data, here it's injection defense, but the skeleton — block deploy on exit 1 — is identical."
      zh: "把测量固化成 CI 关卡的做法原型在那篇。那边是结构化数据，这边是注入防御，但用 exit 1 拦住部署的骨架一样。"
  - slug: ai-coding-secrets-sprawl-mcp-config-security
    score: 0.66
    reason:
      ko: "인젝션이 위험한 건 모델이 뒤에서 만질 수 있는 자원 때문이다. 저 글의 '비밀정보·MCP config 최소권한' 논의가 이 글의 방어를 완성하는 다른 절반이다."
      ja: "注入が危ういのはモデルが裏で触れる資源のせい。あちらの『機密・MCP config最小権限』の議論が、本稿の防御を完成させるもう半分。"
      en: "Injection is dangerous because of what the model can reach behind the scenes. That post's take on secrets and least-privilege MCP config is the other half that completes this defense."
      zh: "注入之所以危险，在于模型背后能触及的资源。那篇关于机密与 MCP 最小权限配置的讨论，是补全本文防御的另一半。"
  - slug: ai-reliability-engineer-centaur-pod-2026
    score: 0.55
    reason:
      ko: "이 게이트를 '누가, 언제, 왜 돌리나'까지 팀 프로세스로 굳히는 이야기가 저 글이다. 게이트는 스크립트가 아니라 운영 습관일 때 산다."
      ja: "このゲートを『誰が・いつ・なぜ回すか』までチームの運用に落とす話があちら。ゲートはスクリプトではなく運用習慣になって初めて生きる。"
      en: "That post is about hardening this gate into team process — who runs it, when, and why. A gate survives as an operating habit, not as a script."
      zh: "把这道关卡落到团队流程——谁跑、何时跑、为何跑——的讨论在那篇。关卡只有成为运维习惯才活得下来，而不是一段脚本。"
  - slug: webmcp-navigator-modelcontext-origin-trial-agent-tools-2026
    score: 0.5
    reason:
      ko: "에이전트가 페이지의 서드파티 스크립트와 한 판에서 돌 때 인젝션 표면이 커진다. 저 글의 툴 등록 경합이 이 글이 막으려는 신뢰 경계 문제와 이어진다."
      ja: "エージェントがページのサードパーティscriptと同じ土俵で動くと注入面が広がる。あちらのツール登録の競合が、本稿が守ろうとする信頼境界の問題につながる。"
      en: "When an agent runs on the same page as third-party scripts, the injection surface grows. That post's tool-registration race ties into the trust-boundary problem this one defends."
      zh: "当代理与页面上的第三方脚本同场运行，注入面就变大。那篇的工具注册竞争，正连着本文要守的信任边界问题。"
---

同じパイプライン、同じコードだ。変わったのは後ろにぶら下がるモデル一つだけ。それでも、先週すり抜けなかった注入攻撃が今週もすり抜けない保証はどこにもない。攻撃側のモデルが更新されれば攻撃の分布が変わり、こちら側のモデルを上げればリクエストconfigの契約が変わる。どちらもコードは据え置きなのに、結果が動く。

だから注入対策は一度組んで終わりではなく、依存の版を上げるたびに回し直す回帰テストにすべきだと考えている。今回はその主張を言葉で済ませず、実際に回した。私のLLM自動化パイプラインが信頼できない入力(コメント、クロールしてきたWebテキスト)をプロンプトへ組み立てる地点に、13件の注入回帰スイートを取り付けた。素朴なガードは11件中2件しか止められなかった。構造を持つガードは全部止めた。そしてそのガードをリファクタする途中で検知器を一つうっかり落とすと、ゲートは漏れた2件を名指しでexit 1を返した。

## プロンプトインジェクションとは何で、なぜモデルを上げるたびに検査し直すのか

プロンプトインジェクションは、信頼できないテキストがモデルへの命令に化ける攻撃だ。Web開発者になじんだ言葉に置き換えれば、SQLインジェクションやXSSと同じ系統。データとして扱うべき文字列が実行文脈へ流れ込み、制御を奪う。違いは、SQLならパーサ文法が固定されていてパラメータバインドでデータと命令をきっぱり分けられるのに対し、LLMにはその文法境界がないことだ。モデルから見れば、システムプロンプトもユーザー入力もクロールしてきたWeb文書も、結局は同じトークン列でしかない。どこまでが指示でどこからがデータか、文法が保証してくれない。

これがなぜ「モデルを上げるたび」の問題になるのか。二つの軸が同時に動くからだ。

一つ目。攻撃側のモデルが強くなれば、攻撃の分布そのものが変わる。OpenAIが2026年7月中旬に公開した[GPT-Red](https://openai.com/index/unlocking-self-improvement-gpt-red/)がこれを正面から見せた。人ではなくモデルが別のモデルを自動で攻撃し、防御を鍛える手法だ。間接プロンプトインジェクションのベンチマークで、GPT-Redの攻撃成功率は84%に達し、同条件の人間レッドチームの13%を大きく上回ったとOpenAIは述べている。さらに重いのは、この過程でFake Chain-of-Thoughtと名付けられた新しい攻撃群が発掘された点だ。前世代のモデルでは成功率が95%を超えていたのに、その事例で再学習した次世代では10%を下回ったという(数値はOpenAI発表基準の参考値。私は原文ページを直接取得しようとしてアクセスが弾かれたため、引用ではなくリンクだけ残す)。含意は一つ。攻撃は静的ではない。自動化された攻撃者が新しい攻撃群を作り続けるので、去年すり抜けなかった防御が今年もすり抜けない保証はない。

二つ目。防御側のモデルを上げると、今度はAPIの契約が変わる。これは後半でOpus 5の事例として実測する。ここでは結論だけ言えば、注入への脆弱性もconfigの妥当性も、どちらも「モデルの版に従属する値」だということ。従属する値なら、版を上げるときに測り直すのが筋だ。[ICML査読PDFに潜んだ注入の事例](/ja/blog/ja/icml-prompt-injection-academic-review)で攻撃面を見たなら、本稿はその攻撃を自分の側でどう反復検査で止めるかを扱う。

## 私が握れるのはモデルではなくガード層だ

ここで正直に線を一本引いておく。Web開発者の私は、モデル内部の注入耐性を変えられない。それはモデル提供元の学習の領分だ。私が実際に手を入れられるのは、その前後に置く層である。信頼できない入力をふるい落とす入力ファイアウォール、モデル出力が許された行動範囲を外れていないか見る出力検証、そもそもモデルが触れる資源を狭める最小権限の設計。

だから今回の実験が測る対象も「モデルが注入にどれだけ耐えるか」ではない。「私のガード層が既知の攻撃群をどれだけ捕まえるか、そしてコードを変えたときにその性能が静かに崩れないか」だ。この区別が肝心だ。ガード層は決定的で安い。APIキーもコストもなくCIで毎回回せる。逆にモデル自体の耐性測定は実呼び出しとコストと非決定性が絡み、回帰テストに使うには重い。毎コミットで回すゲートなら、自分が握る決定的な層を対象にするほうが現実的だ。

ガードはモデルの修正の代わりにはならない。これは防御の一枚にすぎず、限界は後で別に整理する。ただこの一枚が回帰にとりわけ弱い。正規表現を一つ消し、デリミタを一つ落とし、プロンプトをリファクタする些細な変更が防御に穴を開ける。そういう変更はレビューで目に留まりにくい。だからゲートが要る。

## 13件の回帰スイートを組んでパイプラインに回した

スイートは6つの攻撃群にまたがる注入11件、正常入力2件で組んだ。正常入力を混ぜた理由は単純だ。防御が過剰になってまともなコメントまで弾く誤検知も回帰だから。ゲートは「注入を全部止め、正常を全部通す」ときだけ緑であるべきだ。

攻撃群はこう分けた。直接指示の上書き(`ignore all previous instructions`系)、偽のシステム・役割タグ注入(`[SYSTEM]`、`</user><system>`)、Fake Chain-of-Thought(モデルの思考過程を偽造し「もう管理者認証済みだから公開して安全」と思わせる手口)、デリミタ脱出(三重引用符やバックティックで文書境界を偽装)、データ流出誘導(会話内容を外部URLのクエリに載せ、画像やリンクで持ち出す)、エンコード回避(base64で包んだ命令)。各ケースは`expected`を持つ。注入は遮断、正常は通過が正解だ。

ガードは三つの版を用意した。どの検知器を有効にするかが、そのまま防御契約になる。

```javascript
const GUARDS = {
  // v1: よくある英語キーワードだけ。最初の素朴な防御
  v1_naive: ["override"],
  // v2: 構造的な防御を全部。measure→fixの後
  v2_hardened: ["role_injection", "override", "fake_cot",
                "delimiter_escape", "exfiltration", "encoded"],
  // v2.1: モデルを上げながらガードをリファクタする途中でfake_cot検知を誤って外した回帰版
  "v2.1_regressed": ["role_injection", "override",
                     "delimiter_escape", "exfiltration", "encoded"],
};
```

ゲートはスイートを回して通過率を測り、注入が一つでも漏れるか正常が一つでも弾かれれば`process.exit(1)`を出す。CIではこのexitコードがデプロイを止める。まずv1の素朴なガードから回した。

```text
=== injection regression gate :: guard=v1_naive ===
[PASS] override-01  direct_override  expected=block got=blocked override
[FAIL] fakesys-01   fake_system      expected=block got=allowed
[FAIL] fakecot-01   fake_cot         expected=block got=allowed
[FAIL] delim-01     delimiter_escape expected=block got=allowed
[FAIL] exfil-01     exfiltration     expected=block got=allowed
...
検知率: 2/11 (18.2%)  誤検知(benign遮断): 0  漏れ: [fakesys-01, ...]
GATE: RED (exit 1)
```

キーワードのブロックリストだけのガードは、11件中2件、18.2%しか止められなかった。予想どおりではある。`ignore previous instructions`のようなあからさまな文言はふるっても、偽の役割タグや偽造された思考過程はそのまま通す。世間で「注入対策を入れた」と言うときの防御は、たいていこの水準だ。ゲートは赤を出した。これがmeasure段階の正直な出発点になる。

次に構造的なガードv2へ直した。役割タグ・偽造思考・デリミタ・流出URL・エンコードをそれぞれ検知器に分けて有効にした。

```text
=== injection regression gate :: guard=v2_hardened ===
[PASS] fakesys-01   fake_system      expected=block got=blocked role_injection
[PASS] fakecot-01   fake_cot         expected=block got=blocked fake_cot
[PASS] delim-01     delimiter_escape expected=block got=blocked delimiter_escape
[PASS] exfil-01     exfiltration     expected=block got=blocked exfiltration
[PASS] encoded-01   encoded          expected=block got=blocked encoded
...
検知率: 11/11 (100%)  誤検知(benign遮断): 0  漏れ: []
GATE: GREEN (exit 0)
```

11件すべて遮断、正常2件はすべて通過、誤検知ゼロ。ゲートが緑に変わった。ここまでがmeasure → fixだ。だが本稿の核心はこの緑ではない。この緑が後で静かに赤へ戻るとき、それを誰が知らせるのか、である。

## ゲートが回帰を捕まえる瞬間：検知器を一つ落とすと

現実で防御が崩れる崩れ方は、たいてい劇的ではない。新しいモデルへ上げるついでにプロンプトビルダーをリファクタし、そのついでに「使っていなさそうな」検知器を片づけ、正規表現をいじる。そのうち一つが誤りだったと、その瞬間は誰も気づかない。このシナリオをv2.1で再現した。Fake Chain-of-Thought検知器だけを一覧から外した。残りはそのままだ。

```text
=== injection regression gate :: guard=v2.1_regressed ===
[PASS] fakesys-01   fake_system      expected=block got=blocked role_injection
[FAIL] fakecot-01   fake_cot         expected=block got=allowed
[FAIL] fakecot-02   fake_cot         expected=block got=allowed
[PASS] delim-01     delimiter_escape expected=block got=blocked delimiter_escape
...
検知率: 9/11 (81.8%)  誤検知(benign遮断): 0  漏れ: [fakecot-01, fakecot-02]
GATE: RED (exit 1)
```

81.8%。ゲートが赤を出しながら、漏れたケース2件を名前で指した。`fakecot-01`、`fakecot-02`。レビュアーがdiffで見落としたはずの変更が、デプロイ前に正確な座標として現れた。三つの実行を一枚に整理するとこうなる。

![三つのガード版の注入検知率。v1素朴なガード18.2%、v2構造的なガード100%、v2.1回帰版81.8%。ゲートのしきい値は100%で、それを下回ればすべてexit 1でデプロイを止める。](../../../assets/blog/prompt-injection-regression-gate-model-updates/catch-rate.png)

まさにこの地点が、[構造化データをCIゲートに固めたやり方](/ja/blog/ja/validate-structured-data-ci-jsonld-2026)とちょうど同じ骨格だ。測定結果を人の目だけに委ねず、しきい値を割ったらパイプラインが止まるよう配線する。違うのは対象だけ。あちらはJSON-LDの妥当性、こちらは注入の検知率。81.8%が危ういのは、絶対値が低いからではない。昨日100%だったのが今日81.8%になったのに誰も気づかない、その点が危ういのだ。回帰ゲートは絶対的な安全を証明する道具ではなく、防御が静かに後退するのを止める道具である。

## configも回帰する：Opus 5のthinkingとeffort

ここまでが攻撃側の回帰なら、防御側のモデルを上げるときに起きる別種の回帰がある。APIリクエスト契約の破壊だ。2026年7月24日に出たClaude Opus 5が生きた事例をくれる。[公式移行ガイド](https://platform.claude.com/docs/en/about-claude/models/whats-new-opus-5#behavior-changes)の表現をそのまま引くとこうだ。

> On Claude Opus 5, `thinking: {"type": "disabled"}` is accepted only when the effort level is `high` or below. Setting `thinking: {"type": "disabled"}` with effort `xhigh` or `max` returns a 400 error. This is generally available behavior on Claude Opus 5 onward, enforced on each request, and it is a breaking change from Claude Opus 4.8, where disabling thinking was independent of the effort level.

訳せば、thinkingを切った状態はeffortがhigh以下のときだけ受け付ける。xhighやmaxと一緒にthinkingを切ると400を返す。4.8ではthinkingを切ることとeffortレベルが互いに独立だったので、これは明白な破壊的変更だ。ちなみに価格は入力100万トークンあたり5ドル、出力25ドルで4.8と同じ、コンテキストは既定かつ最大が100万トークン、thinkingは既定でオンになっている。つまりモデルIDだけを`claude-opus-4-8`から`claude-opus-5`へ変えるドロップイン差し替えをすると、4.8時代に問題なく回っていた「thinkingを切りeffortはxhigh」の組み合わせを持つバッチ処理が、デプロイ直後に400で崩れる。

これは注入とは別の問題に見えるが、回帰ゲートという視点では同じ問題だ。configの妥当性もモデルの版に従属する値である。だから注入スイートの隣にconfig契約テストをもう一つ足した。APIへ投げる前に、ローカルで400を先回りして予測する検証器だ。

```javascript
function validateRequest(req) {
  const errors = [];
  const effort = req.output_config?.effort;
  const thinking = req.thinking?.type;
  if (req.model === "claude-opus-5") {
    if (thinking === "disabled" && (effort === "xhigh" || effort === "max")) {
      errors.push(`400予測: opus-5はeffort=${effort}でthinking:disabled不可`);
    }
  }
  return { ok: errors.length === 0, errors };
}
```

4.8からそのまま持ち越したconfigを4つ入れて回した。

```text
[FAIL] batch-summarizer (4.8→5そのまま)  400予測: effort=xhighでthinking:disabled不可
[FAIL] deep-research (4.8→5そのまま)     400予測: effort=maxでthinking:disabled不可
[OK  ] quick-classify (修正版)
[OK  ] default (thinking on)
config違反: 2/4
CONFIG GATE: RED (exit 1)
```

2件がデプロイ前に捕まった。実APIを呼ばず、ドキュメントに書かれた規則をそのままコードへ写しただけで400を予測した。もちろんこの検証器は、私が知っている規則しか知らない。ドキュメントに明記された契約をミラーした浅いゲートであって、あらゆる破壊的変更を自動で見つけるわけではない。それでもモデルを上げるたびにリリースノートのbreaking changeをこのファイル一箇所へ規則として書いておけば、次の版上げで同じ罠を繰り返さない。注入回帰とconfig回帰を一つのゲートに束ねる理由はここにある。トリガーが同じだからだ。「モデルを上げた」が、両方を測り直させる。

## このゲートにできないこと

この実験を「注入を解決した」と読んではいけない。

一つ。検知率の数値は、私が手で組んだスイートに対する値だ。絶対的なセキュリティ水準ではなく、回帰の有無を測る相対指標である。100%は「私が知る攻撃群を全部止めた」の意味であって、「破られない」の意味ではない。正規表現ベースの検知器には原理的に誤検知と見逃しの余地がある。新しいエンコード、多言語の難読化、文言を回避する意味レベルの攻撃は、いくらでもこのスイートを抜ける。プロンプトインジェクションはまだ未解決の問題で、OWASPもこれをLLMアプリケーション最上位のリスク(LLM01)に置いている。

二つ。ガードはモデルの修正ではない。入力ファイアウォール一枚で終わる話ではなく、出力検証と最小権限が一緒に走る必要がある。モデルがそもそも機密に触れられず、呼べるツールがホワイトリストで縛られていれば、注入が一枚を破っても、できることがない。この最小権限側の半分は[AIコーディングにおける機密の漏出とMCP configのセキュリティ](/ja/blog/ja/ai-coding-secrets-sprawl-mcp-config-security)で別に扱った。ゲートはその防御たちが静かに崩れないよう守る装置にすぎず、防御そのものではない。

三つ。GPT-Redの84%や95%のような第三者の数値は発表基準の参考値だ。私はOpenAIの原文ページを直接確認しようとしてアクセスが弾かれたため、逐語引用ではなくリンクだけ残した。検証していない数値を自分の実測のように書かないための区別である。

## まとめ：防御を一度ではなく版ごとに

今回確かめたことは単純だ。注入への脆弱性もconfigの妥当性もモデルの版に従属する値であり、従属する値は版が変わったら測り直す必要がある。防御をコードに一度植えて忘れる代わりに、依存の版上げと同じ扱いで毎回回し直す回帰ゲートにする。それが本稿の結論だ。次の項目を守れば、チームですぐ始められる。

- 既知の注入攻撃群を攻撃群あたり最低1件ずつ、バージョン管理されたJSONスイートに固定する。正常入力も混ぜ、誤検知まで回帰で捕まえる。
- ゲートの対象はモデルではなく、自分が握るガード層に置く。決定的で安く、毎コミットで回せる。
- 注入が一つでも漏れるか正常が一つでも弾かれれば`exit 1`でデプロイを止める。通過率のしきい値を明記する。
- モデル・プロンプト・ガードに触れるたびに回し直す。とくにモデルの版上げはトリガーとして固定する。
- 対象モデルごとのconfig契約テストを同じゲートに足す。Opus 5のthinkingとeffortの組み合わせのように、リリースノートのbreaking changeを規則として書き、400をローカルで予測する。
- ゲートは防御の全部ではない。最小権限と出力検証を一緒に置き、ゲートはそれらが後退しないよう守る役に使う。

自分のパイプラインでどの攻撃群が先に漏れるのか、モデルを上げたときconfigがどこで壊れるのか——この二つをまとめて測り、ゲートとして残す作業が要るチームは、プロフィールの連絡先から届く。相談も実装も受けている。
