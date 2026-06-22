---
title: 'ローカルLLMは同じ答えを二度返すか — temperatureとseedで出力再現性を実測した'
description: >-
  同じプロンプトをローカルのGemma 4へ数十回投げ、出力がどれだけ再現するかを測定した。temperature=0は決定的で、
  temperatureを上げてもseedを固定すると出力は一行に収束した。評価とCIにすぐ使える結論までまとめる。
pubDate: '2026-06-22'
heroImage: '../../../assets/blog/llm-determinism-temperature-seed-experiment/hero.png'
tags:
  - ローカルLLM
  - Ollama
  - LLM評価
  - 再現性
relatedPosts:
  - slug: ollama-structured-outputs-pydantic-local-llm-guide-2026
    score: 0.86
    reason:
      ko: 같은 Ollama + Gemma 4 스택에서 출력을 다룬다. 이 글에서 재현성을 확인했다면, 그 출력을 타입 안전하게 받는 다음 단계가 거기 있다.
      ja: 同じOllama + Gemma 4スタックで出力を扱う。本記事で再現性を確認したら、その出力を型安全に受け取る次の段階がそこにある。
      en: Works on the same Ollama and Gemma 4 stack. Once you trust reproducibility, that post shows how to capture those outputs with type safety.
      zh: 在相同的Ollama + Gemma 4技术栈上处理输出。确认可复现性后，那篇文章展示了如何以类型安全的方式接收这些输出。
  - slug: ollama-fastapi-production-deployment-guide-2026
    score: 0.74
    reason:
      ko: 로컬 모델을 동시 요청이 들어오는 서버로 올리면 이 글에서 본 결정성이 흔들릴 수 있다. 배포 단계의 변수를 먼저 보고 싶을 때 읽을 글이다.
      ja: ローカルモデルを同時リクエストが来るサーバーに載せると、本記事で見た決定性が揺らぐことがある。デプロイ段階の変数を先に見たいときに読む記事。
      en: Once you put a local model behind a server taking concurrent requests, the determinism seen here can break. Read this for the deployment-stage variables first.
      zh: 当把本地模型放到接收并发请求的服务器后，本文看到的确定性可能会动摇。想先了解部署阶段的变量时可读。
  - slug: claude-agent-sdk-tool-use-complete-guide-2026
    score: 0.7
    reason:
      ko: 에이전트의 도구 호출을 회귀 테스트하려면 출력이 재현돼야 한다. 클라우드 LLM으로 에이전트를 짤 때 seed 고정이 왜 까다로운지 이 글과 같이 보면 좋다.
      ja: エージェントのツール呼び出しを回帰テストするには出力が再現される必要がある。クラウドLLMでエージェントを組むとき、seed固定がなぜ難しいかを併せて読むとよい。
      en: Regression-testing an agent's tool calls needs reproducible outputs. Pair it with this to see why pinning a seed is harder once the agent runs on a cloud LLM.
      zh: 要对代理的工具调用做回归测试，输出必须可复现。搭配阅读可了解在云端LLM上构建代理时，为何固定seed更困难。
faq:
  - question: "temperature=0なら常に同じ答えが出ますか？"
    answer: "私のノートPCでOllamaを使って測定した範囲ではそうでした。同じプロンプトを2つのモデルに各12〜15回投げ、temperature=0では全て一種類の出力でした。ただしollama issue #586のようにOSや実行タイミングで微妙に変わるという報告もあり、『私の環境で決定的』と『どこでも決定的』は区別すべきです。"
  - question: "再現性を求めるならtemperatureとseedのどちらを固定すべきですか？"
    answer: "両方です。temperature=0ならgreedyデコードなのでseedは事実上意味を持ちませんが、temperatureを上げて多様性を使いつつ再現も必要ならseedを固定します。私の測定ではtemperature=0.8 + seed固定で出力が一行に収束し、別プロセスで再実行しても同じ文が出ました。"
  - question: "ローカルで決定的ならOpenAIやClaude APIでも決定的ですか？"
    answer: "いいえ。クラウドの推論サーバーは複数リクエストをまとめてバッチ処理するため、負荷に応じてバッチサイズが変わると同じプロンプトでも数値経路が分かれます。Thinking Machinesの『Defeating Nondeterminism in LLM Inference』がこのバッチ不変性の問題を説明しています。私はこの部分を直接再現できず、文書を根拠に引用するだけです。"
  - question: "gemma4:12bモデルが空応答を返したのはなぜですか？"
    answer: "コミュニティが公開したgemma4:12b-it-qatビルドが/api/generateと/api/chatの両方でeval_countは上がるのにcontentが空文字列でした。トークンは生成されたが表示テキストにマッピングされないパッケージング上の問題と見られます。そのため決定性の表からは除外しました。"
---

評価スクリプトを二度走らせたら、スコアが違った。コードもプロンプトもモデルもそのままだ。何も変えていないのに、通っていたケースが一つ落ちた。

最初は自分が何か触ったかと疑った。ところが再実行するとまた通る。そこで疑いがモデル自体に移った。LLMは同じ入力に同じ答えを返す関数ではない。頭ではわかっていたが、いざ評価パイプラインが揺れると「では何を固定すれば出力が再現するのか」という問いが急に具体的になった。

だから自分で測ってみた。クラウドAPIではなく、最後まで制御できるローカルのOllama + Gemma 4環境で。同じプロンプトを数十回投げ、出力をハッシュでまとめて何種類出るか数える。結論から言うと、私の環境で再現性を決めたのはたった二つのつまみだった。

## 何も変えていないのに結果が揺れる理由から

LLMがトークンを選ぶ最後の段階は、確率分布から一つを引くサンプリングだ。このサンプリングの性格を変えるのが`temperature`である。temperatureが0なら、分布で最も確率の高いトークンを毎回そのまま取る(greedy)。ランダム性が入る隙がないので理論上は決定的なはずだ。temperatureを上げると2位、3位のトークンも引かれる余地が生まれ、その抽選を支配するのが`seed`だ。

もう一つ押さえておくつまみが`num_predict`だ。生成する最大トークン数で、これが短いとモデルが分かれる区間自体が少なく決定的に見え、長いと後ろに行くほど微小な差が積もる余地が増える。だから私は短いタグライン(約40トークン)で綺麗な信号を先に取り、長い出力は別に試した。結果としてこの長い出力の試行で後述する空応答問題に出くわすのだが、その話は後で扱う。

ここまでは文書に書いてある話だ。問題は、この理論が私のノートPCで実際にそのまま動くかである。ollamaのissueトラッカーを見るだけで「seedを固定したのに答えが変わる」(#4660)、「temperature=0 + seed固定なのに初回と二回目が微妙に違う」(#586)といった報告が並ぶ。だから信じずに測ることにした。

## 同じプロンプトを数十回投げる実験設計

実験環境はrepo外の一時ディレクトリに作った。Ollama 0.30.7、Apple Silicon、モデルは二つ使った。一つは2GBの小さなGemma 4ビルド、もう一つは9.6GBの`gemma4:e4b`。サイズの違うモデルで同じパターンが見えるか確認する意図だった。

測定方法は単純だ。同じプロンプトを一条件あたり12〜15回送り、各出力をSHA-256でハッシュして異なるハッシュが何個あるか数える。1なら完全に決定的、数が大きいほど出力が散らばる。

```python
import json, hashlib, urllib.request
from collections import Counter

def gen(model, prompt, temperature, seed=None, num_predict=40):
    opts = {"temperature": temperature, "num_predict": num_predict}
    if seed is not None:
        opts["seed"] = seed
    body = {"model": model, "messages": [{"role": "user", "content": prompt}],
            "stream": False, "options": opts}
    req = urllib.request.Request("http://localhost:11434/api/chat",
            data=json.dumps(body).encode(),
            headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req) as r:
        return json.load(r)["message"]["content"].strip()

def count_unique(model, prompt, temperature, seed, n):
    outs = [gen(model, prompt, temperature, seed) for _ in range(n)]
    hashes = [hashlib.sha256(o.encode()).hexdigest()[:12] for o in outs]
    return len(set(hashes)), Counter(hashes).most_common(1)[0][1]
```

条件は五つに分けた。temperature=0 / temperature>0それぞれに対しseedを固定した場合としない場合、そして最後にseedを固定したままPythonプロセスを新たに立ち上げてもう一度回す場合だ。この最後の条件が重要で、「同じプロセス内で再現すること」と「プロセスを落として立て直しても再現すること」は評価/CIの観点で全く別の保証だからである。

プロンプトは変化の余地がある生成型を選んだ。「新しいAIコーディングアシスタントの短いマーケティングタグラインを一行書け」。答えが一つに絞られない課題でこそ多様性が現れる。もし「2+2は?」のような閉じた質問なら、temperatureを上げてもほぼ散らばらず、seedの効果を観察できない。

指標は二つを併せて見た。一つはdistinct数、もう一つはmajority shareだ。majority shareは最も多く出た出力一つが全N回中何回を占めたかの比率である。distinctが5でもそのうち一つが11回ならほぼ安定、5種が均等に散らばればmajority shareは0.3付近に落ちる。分布の形を一つの数字に圧縮するには、この二つを併せて見るのが安全だと判断した。

## 測定結果：つまみは二つだけだった

![2つのローカルモデルの条件別distinct output数](../../../assets/blog/llm-determinism-temperature-seed-experiment/hero.png)

表で見るとパターンがさらに明確だ。

| 条件 | gemma4 ~2GB (N=15) | gemma4:e4b 9.6GB (N=12) |
|------|------|------|
| temperature=0, seedなし | 1種 (決定的) | 1種 (決定的) |
| temperature=0, seed固定 | 1種 | 1種 |
| temperature>0, seedなし | **5種** | **7種** |
| temperature>0, seed固定 | 1種 | 1種 |
| temperature>0, seed固定 (プロセス再実行) | 1種 | 1種 |

![条件別の測定結果ログ](../../../assets/blog/llm-determinism-temperature-seed-experiment/results-table.png)

読み取れる話はこうだ。temperature=0では二つのモデルとも出力が一種類だけだった。15回、12回投げても文字一つ違わず同じ文が出た。seedを与えても与えなくても結果は同じだった。greedyデコードではseedの出番がないことがそのまま確認できた。

散らばったのは正確に一マス、temperature>0でseedがないときだけだ。2GBモデルは15回中5種、9.6GBモデルは12回中7種に分かれた。ところが同じtemperatureでseedだけ42に固定すると再び1種に揃った。さらに印象的なのが最後の行だ。Pythonプロセスを完全に新しく立ち上げて回し直したのに、seedが同じなら同じ文が出た。「Code faster, effortlessly smart.」二回の独立実行が文字単位で一致した。

実際に出た文を見ると感覚がつかめる。temperature=0では2GBモデルが毎回「Code Smarter, Not Harder」だけを吐いた。temperatureを0.8に上げseedを外すと「Code Smarter, Not Harder with Ada」のような変化が混ざった。だがseedを42で固定するとその一行に固まり、プロセスを立て直した再実行でもそのまま出た。9.6GBモデルも同じで、seedなしtemperature 0.8で7種まで分かれた後、seed固定で「Code faster, effortlessly smart」に収束した。majority shareで見ると差はさらに鮮明で、seedなしtemperature 0.8の9.6GBモデルは0.333、最も多い出力でも三回に一回だった。残りの全条件は1.0、つまり全て同じ出力だった。

私はこの結果が綺麗すぎて、むしろもう一度疑った。だからモデルを変えて回し直し、サイズが5倍違う二つのモデルで同じパターンが出た。少なくとも私の環境では、再現性のつまみはtemperatureとseedの二つで足りた。

## 空応答一つが、より大きな教訓をくれた

本当は12Bの`gemma4:12b-it-qat`を主力にするつもりだった。ところがこのコミュニティビルドは最後まで空文字列だけを返した。`/api/generate`で送っても`/api/chat`で送っても、`done_reason`は`length`、`eval_count`は40や200ときちんと上がるのに、肝心の`content`は空文字列だった。

```text
content repr: ''
done_reason: length   eval_count: 200
```

トークンは確かに生成された。28秒ずつGPUが回った。なのにユーザーに見えるテキストは何も出なかった。このQATビルドのチャットテンプレートが壊れているか、モデルが見えない制御トークンだけを吐いたものと見られる。正確な原因までは私の専門範囲の外なので断定しない。

ただここで得た教訓は明確だ。「モデルが回った」と「モデルが答えた」は別の命題である。eval_countだけ見て成功扱いするパイプラインなら、この空応答がそのまま評価データに紛れ込んでいただろう。出力長0の応答を弾くガード一つがなぜ必要か、この失敗がコード一行より説得力をもって教えてくれた。失敗もネタだという言葉を改めて実感した。ローカルモデルを扱うときのこの種のパッケージング変数は、[Ollama構造化出力を扱った記事](/ja/blog/ja/ollama-structured-outputs-pydantic-local-llm-guide-2026)でも小さなモデルのスキーマ処理の限界として似た形で経験したことがある。

## 私のノートPCで合うからクラウドでも合うとは限らない

ここで線をはっきり引いておきたい。私が測ったのは「ローカルOllamaで、リクエストを一つずつ順次送るとき」の決定性だ。この条件をOpenAIやClaudeのようなクラウドAPIに移すと話が変わる。

なぜ変わるかについては、Thinking Machinesが2025年9月に出した「Defeating Nondeterminism in LLM Inference」が最も説得力ある説明をくれる。よく「GPUの浮動小数点演算が非決定的だからだ」と言われるが、この記事は真の原因を別のところに見る。推論サーバーは複数ユーザーのリクエストをまとめてバッチ処理するが、その瞬間のサーバー負荷に応じてバッチサイズがまちまちに変わる。そして主要カーネルがバッチサイズによって微妙に異なる数値経路を通るため、同じプロンプトでもgreedyデコードですら異なるトークンに分かれうるというのだ。私が理解したところでは、非決定性の真犯人はランダム性ではなく「自分のリクエストがその都度違うサイズのバッチに紛れ込む」点である。

ローカルollamaも完全な安全地帯ではない。ollama issue #586には、同じseed、同じtemperature=0、同じnum_ctxなのに初回と二回目の出力が微妙に違ったという報告があり、さらに興味深いことに同じコードがUbuntuとWindowsで異なる「固定された」出力を出したという観察もある。つまり決定性はプラットフォームに紐づく性質かもしれない。私の測定が綺麗だったのは、一台のMacで、一つのバージョンのollamaで、短い出力を受けたからである可能性が高い。出力が長くnum_ctxが大きくなるほど、微小な数値差が積もって分かれる余地も増える。

私はこのバッチ非決定性を直接再現できなかった。同時負荷をかける環境を作らなかったからだ。だからこの部分は文書を根拠に引用するだけだ。私が手で確認した範囲はあくまで「順次リクエスト + ローカル + 短い出力」である。この境界を曖昧にすれば、私の記事も検証されていない主張を事実のように売る記事になる。

だから正直に言うと、評価の再現性をクラウドAPIの上に立てるのは思ったより厄介だ。seedパラメータを受け付けるAPIでも、バッチ非決定性までは防いでくれない。これがLLM評価がユニットテストのように綺麗に決まらない根本的な理由だと私は見ている。

## 評価とエージェントテストにすぐ適用すること

測定を終えて自分のワークフローにすぐ反映したことだ。

第一に、回帰評価はtemperature=0 + seed固定で釘を打つ。出力の「品質」を見る評価ではなく「変わったか」を見る回帰テストなら、モデルの創造性は要らない。再現可能な一つの出力に固定し、それが変わる瞬間を捉える方がいい。私の環境ではこの組み合わせがプロセスを立て直しても同じ文を返したので、CIに掛けるに十分だ。

第二に、たった一度の実行を根拠に結論を出さない。temperatureを上げて使う機能(タグライン生成のように多様性が価値の場合)は本質的に散らばる。こうした出力を評価するときは一度回して「できた/できない」を判定してはならず、N回回して分布で見るべきだ。私の測定で7/12まで分かれたのを見れば、一度の幸運な出力で機能を判断するのがいかに危ういかわかる。

第三に、出力妥当性ガードを評価の手前に置く。空応答を返した12Bモデルの事例が直接の理由だ。長さ0、JSONパース失敗、期待フィールド欠落のような場合を「失敗」と明示的に分類しなければ、壊れたモデルがまともなスコアに化ける。私が回帰テストに使う骨格はこの程度に単純だ。

```python
def assert_reproducible(model, prompt, expected_hash, n=5):
    outs = [gen(model, prompt, temperature=0, seed=42) for _ in range(n)]
    # 1) 空応答ガード — 「回った」と「答えた」を分ける
    assert all(len(o) > 0 for o in outs), "empty output detected"
    # 2) 同じ実行内で一種類に固定されるか
    hashes = {hashlib.sha256(o.encode()).hexdigest()[:12] for o in outs}
    assert len(hashes) == 1, f"non-deterministic: {len(hashes)} variants"
    # 3) 以前に釘を打った期待出力と一致するか
    assert hashes.pop() == expected_hash, "output drifted from baseline"
```

期待ハッシュを一度釘付けすれば、モデルバージョンやollamaのアップグレードで出力が変わる瞬間をCIが捕まえてくれる。これが「LLMはテストできない」というよくある諦めへの私の反論だ。全部は無理でも、再現条件を制御した一部は確かにテストできる。

エージェントに広げても同じだ。エージェントのツール呼び出しシーケンスを回帰テストするには、そのシーケンスが再現される必要がある。ローカルモデルで[完全オフラインのMCPサーバーを作った経験](/ja/blog/ja/local-llm-private-mcp-server-gemma4-fastmcp)があるなら、その上でseedを固定してツール呼び出しを再現するのは比較的制御可能だ。一方クラウドLLM上のエージェントはバッチ非決定性のため同じ保証を得にくい。結局「どこで推論するか」が「テストをどれだけ堅く組めるか」を決めるというのが、今回の実験の最も実用的な収穫だった。

次は同時リクエストをかける環境を作り、ローカルollamaでもバッチ非決定性が再現するか直接確かめるつもりだ。それができれば「ローカルは安全だ」という私の暫定結論にも但し書きが付くだろう。

## 参考資料

- [Ollama API ドキュメント — 生成オプション](https://github.com/ollama/ollama/blob/main/docs/api.md): `temperature`と`seed`を含む`options`オブジェクト、そして再現可能な出力のために`seed`に数値を指定するよう案内している。
- [Ollama Modelfile リファレンス](https://docs.ollama.com/modelfile): `PARAMETER`命令で`seed`(「同じプロンプトに同じテキストを生成する」)と`temperature`を定義する。
- [OpenAI Cookbook — seedパラメータによる再現可能な出力](https://developers.openai.com/cookbook/examples/reproducible_outputs_with_the_seed_parameter): クラウドで`seed`と`system_fingerprint`が一致しても出力は「ほぼ同一」にとどまり保証ではない、その理由を説明する。
- [Thinking Machines — Defeating Nondeterminism in LLM Inference](https://thinkingmachines.ai/blog/defeating-nondeterminism-in-llm-inference/): 本文で引用したが直接再現できなかった、クラウド非決定性のバッチ不変性の論拠。
