---
title: 'ローカルエージェントがシステムプロンプトを忘れた理由 — Ollama num_ctxの無言truncationを測ってみた'
description: >-
  ローカルエージェントが長い会話で急に指示を無視しはじめた。プロンプトの先頭に秘密コードを隠し、長さを伸ばしながらrecallを測った。
  num_ctxを超えるとOllamaはエラーも出さずプロンプトの前方を切り落とす。そして「既定値は4096」という通説も私のMacでは外れていた。
pubDate: '2026-06-28'
heroImage: '../../../assets/blog/ollama-num-ctx-silent-truncation-experiment/hero.png'
tags:
  - ローカルLLM
  - Ollama
  - エージェント設計
  - コンテキスト管理
relatedPosts:
  - slug: local-llm-prefill-generation-latency-experiment
    score: 0.83
    reason:
      ko: 그 글은 컨텍스트가 길어질수록 첫 토큰이 늦게 나오는 '속도' 문제를 쟀다. 이 글은 같은 컨텍스트 길이가 일정 선을 넘으면 내용이 조용히 사라지는 '정확성' 문제를 본다. 길이를 두 각도에서 같이 보면 num_ctx를 얼마로 잡을지 감이 잡힌다.
      ja: あの記事はコンテキストが長いほど最初のトークンが遅れる「速度」の問題を測った。この記事は同じ長さが一線を越えると中身が静かに消える「正確さ」の問題を見る。長さを二つの角度で見ればnum_ctxの値が決めやすい。
      en: That post measured the speed problem, how a longer context delays the first token. This one looks at the correctness problem, how the same length silently drops content once it crosses a line. Seeing length from both angles makes it easier to pick a num_ctx.
      zh: 那篇测的是"速度"问题，上下文越长首个token越慢。这篇看的是"准确性"问题，同样的长度一旦越线，内容就被悄悄丢掉。从两个角度一起看长度，就更容易定num_ctx该取多少。
  - slug: local-llm-cold-start-load-duration-experiment
    score: 0.74
    reason:
      ko: 같은 맥북, 같은 Ollama로 응답에 딸려오는 숫자(load_duration)를 뜯어본 글이다. 여기서는 같은 응답의 prompt_eval_count를 뜯어 truncation을 잡아낸다. 둘 다 Ollama가 조용히 돌려주는 메타데이터로 실제 거동을 추적하는 방법이다.
      ja: 同じMacBook、同じOllamaで応答に付いてくる数値(load_duration)を調べた記事だ。ここでは同じ応答のprompt_eval_countを調べてtruncationを捕まえる。どちらもOllamaが静かに返すメタデータで実挙動を追う方法だ。
      en: That post dissects a number Ollama attaches to each response (load_duration) on the same laptop. Here I dissect prompt_eval_count from the same response to catch truncation. Both use metadata Ollama quietly returns to track real behavior.
      zh: 那篇在同一台MacBook、同一个Ollama上拆解了响应里附带的数字(load_duration)。这里我拆解同一个响应里的prompt_eval_count来抓truncation。两者都用Ollama悄悄返回的元数据追踪真实行为。
  - slug: ollama-structured-outputs-pydantic-local-llm-guide-2026
    score: 0.7
    reason:
      ko: 구조화 출력으로 로컬 모델의 답을 안정시켜봤다면, 그 답이 애초에 온전한 입력을 보고 나온 것인지부터 의심해볼 차례다. 입력이 잘리면 스키마가 아무리 깔끔해도 내용은 틀린다.
      ja: 構造化出力でローカルモデルの答えを安定させたなら、その答えがそもそも完全な入力を見て出たのかを疑う番だ。入力が切れればスキーマがいくら綺麗でも中身は間違う。
      en: If you stabilized a local model's answers with structured outputs, the next thing to question is whether the answer even saw the full input. If the input is truncated, the content is wrong no matter how clean the schema.
      zh: 如果你用结构化输出稳住了本地模型的答案，下一步该怀疑的是这答案到底有没有看到完整的输入。输入被截断，schema再干净，内容也是错的。
faq:
  - question: 'Ollamaで長いプロンプトを送るとエラーになるべきでは? なぜ無言で切られるのですか?'
    answer: 'Ollamaはnum_ctx(コンテキストウィンドウ)を超える入力にエラーを返しません。ウィンドウに収まるようトークンを切ってそのまま処理します。問題は切られるのが末尾ではなく先頭だという点です。システムプロンプトや指示文はふつう先頭に置きますが、まさにそこが先に消えます。私のMac(M1 16GB、Ollama 0.30.7)でnum_ctx=2048にして3464トークンのプロンプトを送ると、prompt_eval_countが2047に固定され、先頭に隠した秘密コードをモデルは一切答えられませんでした。'
  - question: 'Ollamaの既定num_ctxは4096では?'
    answer: '古い通説です。私の計測では、num_ctxを設定しないとき入力が16383トークンまで丸ごと入りました。つまりこのマシンの既定値は16384でした。最近のOllamaは利用可能なメモリに合わせて既定コンテキストを自動で決めます。だから同じコードが32GBマシンでは平気でも、8GBサーバーでは無言で切られることがあります。既定値に頼らず、リクエストごとにnum_ctxを明示するほうが安全です。'
  - question: '自分のリクエストが切られたかどうかを知るには?'
    answer: 'Ollama応答に含まれるprompt_eval_countを見てください。この値が入力として期待したトークン数より小さく、num_ctxにほぼ張り付いていれば(例: num_ctx-1)切られています。コード側でトークン数を事前に数えるか、応答のprompt_eval_countが設定したnum_ctxに近づいたら警告を出すガードを一行入れるだけで、デバッグが格段に速くなります。'
---

数日前、ローカルで動かしていた議事録要約エージェントが妙な振る舞いをした。短い議事録はちゃんと処理するのに、長い議事録を入れると先頭に書いた「JSONだけで答えよ」のような指示を丸ごと無視して、平文でだらだら答える。最初はモデルが間抜けなのだと思った。だが同じモデルが短い入力ではきちんと指示を守るのが引っかかった。モデルが馬鹿になったのではなく、モデルが私の指示を**そもそも見ていない**としたら?

[prefillとgenerationのコストを分解した前回の記事](/ja/blog/ja/local-llm-prefill-generation-latency-experiment)で、コンテキストが長いほど最初のトークンが遅れることは測った。あれは速度の話だ。今日疑ったのは別の側面だ。コンテキストがある線を越えると、速度ではなく**中身**が消えるのではないか。だから自分で測ってみた。

## 秘密コードを先頭に隠して長さを伸ばした

やり方はneedle-in-haystackを少しひねった。プロンプトの先頭(head)に秘密コードを一行差し込む。その下に議事録のようなフィラーテキストを長く敷いてトークン数を膨らませる。そして末尾で「先頭に書いた秘密コードは何だった?」と尋ねる。コードを正確に答えればモデルはheadを見たことになり、答えられなければheadが消えたことになる。

肝は**同じプロンプトをそのままにしてnum_ctxだけ変える**ことだ。入力が同一なのにrecallが崩れるなら、犯人はモデルではなくコンテキストウィンドウの設定だ。

```python
import json, urllib.request

SECRET = "ALPHA-7723-ZULU"
HEAD = (f"重要: この文書のどこかに秘密コードが隠れている。秘密コードは {SECRET} だ。\n"
        "以下の議事録を読み、最後の質問にだけ答えよ。\n\n")
FILLER = ("会議では四半期ロードマップ、デプロイ日程、オンコール輪番、コスト最適化を議論した。"
          "各チームは進捗を共有し、次スプリントの優先度を調整した。\n")
Q = "\n\n質問: この文書の先頭に書かれた秘密コードは何か? コードだけ正確に答えよ。"

def ask(num_ctx, n_filler):
    prompt = HEAD + (FILLER * n_filler) + Q
    body = {"model": "melavisions/gemma4:latest", "prompt": prompt,
            "stream": False,
            "options": {"num_predict": 40, "temperature": 0, "num_ctx": num_ctx}}
    req = urllib.request.Request("http://localhost:11434/api/generate",
            data=json.dumps(body).encode(), headers={"Content-Type": "application/json"})
    d = json.load(urllib.request.urlopen(req, timeout=600))
    return d["prompt_eval_count"], SECRET in d["response"], d["response"].strip()
```

テストモデルは`gemma4:latest`(3.2B、Q4_K_M)の量子化版を使った。小さくて速いし、この実験はモデルの賢さではなく入力の保存可否を見るので小型で十分だ。フィラーを40回繰り返すと全体のプロンプトが3464トークンになった。この数字を覚えておこう。

## num_ctxを変えただけでrecallが崩れた

3464トークンの同じプロンプトを、num_ctxだけ1024、2048、4096、8192に変えて四回投げた。結果はきれいに割れた。

| num_ctx | prompt_eval_count | 秘密コードrecall | モデルの答え |
|---|---|---|---|
| 1024 | 1023 | 失敗 | 「秘密コードはNoneです」 |
| 2048 | 2047 | 失敗 | 「秘密コードはロです」 |
| 4096 | 3464 | 成功 | `ALPHA-7723-ZULU` |
| 8192 | 3464 | 成功 | `ALPHA-7723-ZULU` |

![num_ctxごとのprompt_eval_countとrecallの成否](../../../assets/blog/ollama-num-ctx-silent-truncation-experiment/chart.png)

ここで一つ目を引いた。num_ctxが1024のとき`prompt_eval_count`はちょうど1023、2048のときちょうど2047だ。私が送ったプロンプトは確かに3464トークンなのに、モデルが実際に読んだトークン数はnum_ctxに合わせて切られていた。ウィンドウより長い入力をOllamaがウィンドウ幅に削ったのだ。そして削られた側がheadだったため、先頭に隠した秘密コードが丸ごと消えた。

エラーはなかった。警告もない。ただ「None」と、あるいは「ロ」としれっと答えた。正直これが一番こわい。入力が切られたという合図を、モデルの答えのどこも出してくれない。num_ctx 4096からは3464がウィンドウに収まるので`prompt_eval_count`が丸ごと3464になり、recallも正確だった。しきい線は2048と4096のあいだ、つまり私のプロンプト長3464のちょうど上に乗っていた。

## なぜ末尾ではなく先頭を切るのか

最初は直感と逆で少し意外だった。ふつう「切れる」といえば末尾が切れそうだが、ここでは先頭が消える。理由は対話型推論の構造にある。LLMが次のトークンを作るとき直接頼るのは、直前の最近のトークンたちだ。だからウィンドウが足りなければランタイムは最新トークン(末尾)を残し、古いトークン(先頭)を捨てる。`/api/chat`でマルチターン会話を回すときも同じ原理で、[Ollama公式FAQ](https://docs.ollama.com/faq)はコンテキストが溢れると「もっとも古いメッセージから静かに落とす」と記している。

問題は、いちばん切られたくないものが軒並み先頭に住んでいる点だ。システムプロンプト、役割指示、ツール定義、出力形式のルール。これらは慣習的に先頭へ置く。なのに切り落としは正確にそこから始まる。長い会話を続けていたエージェントが急にペルソナを失ったりツール呼び出しの形式を破りはじめたら、モデルが気まぐれを起こしたのではなく、システムプロンプトがウィンドウの外へ押し出された可能性がある。私の議事録エージェントがまさにこれだった。

実務的にここから一本の防御線が引ける。本当に絶対失えない指示は、先頭ではなく**質問の直前**、つまり末尾側にもう一度差し込む。切られても生き残る位置に置くわけだ。優雅ではないが、num_ctxを制御できない状況ではかなり効いた。

## prompt_eval_countが切り落としを密告する

この実験で得た一番実用的な事実は別にある。**切り落としは応答の中に痕跡を残す。** Ollamaが`/api/generate`応答で返す`prompt_eval_count`は、モデルが実際にprefillした入力トークン数だ。この値が自分の送ったプロンプトのトークン数より小さく、num_ctxにぴたりと張り付いていれば、まず間違いなく切られている。

これがなぜ大事かというと、ふだん誰もこの数字を見ないからだ。答えがそれっぽく出れば入力が丸ごと入ったと信じてしまう。だが[構造化出力で答えを安定化](/ja/blog/ja/ollama-structured-outputs-pydantic-local-llm-guide-2026)しておいても、そもそもモデルが見た入力が半分なら、スキーマだけ綺麗で中身は間違った答えが出る。スキーマ検証は通るのに事実関係がずれる、デバッグが一番厄介な種類のバグだ。

## ところが既定値は4096ではなかった

ここで止めていたら「Ollamaの既定num_ctxは4096だから気をつけろ」という、ありがちな結論で終わっていた。ところがnum_ctxを**まったく設定せず**3464トークンのプロンプトを送るとrecallが成功した。`prompt_eval_count`も3464で丸ごとだった。既定値が4096という通説どおりなら3464は当然通るので、ここまでは筋が通る。だから入力をもっと大きくしてみた。

| フィラー回数 | 既定num_ctxでのprompt_eval_count | 備考 |
|---|---|---|
| 70 | 5911 | 丸ごと入る |
| 100 | 8431 | 丸ごと入る |
| 150 | 12631 | 丸ごと入る |
| 200 | 16383 | 16384で切られる |
| 250 | 16383 (recall失敗、答え「secret」) | head切り落とし |

既定値が4096なら5911の時点でもう切られていたはずだ。ところが12631トークンまで平気で入り、16383(=16384−1)で天井を打った。つまり私のMacでOllama 0.30.7が決めた**既定num_ctxは4096ではなく16384**だった。[Ollama公式FAQ](https://docs.ollama.com/faq)とコミュニティ文書を調べると、最近のバージョンは既定コンテキストを利用可能メモリに合わせて自動で大きくするという。16GB M1で16384が選ばれたわけだ。

これが単なる豆知識でない理由はportabilityだ。私の32GBデスクトップで快調だったエージェントが8GBクラウドインスタンスに載ると、既定num_ctxがより小さく決まり、同じコードが同じ入力で無言で切られうる。ローカルでテストすると平気なのにデプロイすると品質が崩れる、再現の難しい事故につながる。私は「既定値を信じず常に明示せよ」という立場だ。既定値がマシンごとに違うなら、それは事実上信頼できない値だ。

## だからコードにガードを一つ入れた

たいした解法ではない。二つやった。まずリクエストごとに`num_ctx`を明示で打ち込んだ。次に応答が返ったら`prompt_eval_count`がnum_ctxに近づいたかを確認するガードを入れた。切られた可能性をすぐログで捕まえるためだ。

```python
def guarded_generate(prompt, num_ctx=8192, model="melavisions/gemma4:latest"):
    body = {"model": model, "prompt": prompt, "stream": False,
            "options": {"num_ctx": num_ctx, "num_predict": 256}}
    req = urllib.request.Request("http://localhost:11434/api/generate",
            data=json.dumps(body).encode(), headers={"Content-Type": "application/json"})
    d = json.load(urllib.request.urlopen(req, timeout=600))

    used = d["prompt_eval_count"]
    # ウィンドウの98%超を埋めていたら切られた可能性が高いとみて警告
    if used >= num_ctx * 0.98:
        print(f"[warn] prompt_eval_count={used} ≈ num_ctx={num_ctx}: "
              f"入力が切られた可能性。num_ctxを上げるか入力を減らしてください。")
    return d["response"]
```

このガードは切り落としを直接は防がない。ただ切られたとき静かに見過ごさせない。私の場合はこの一行のおかげで、議事録要約エージェントがなぜ長い入力でだけ指示を無視したのか五分で答えが出た。入力トークンが既定ウィンドウを超えて、先頭のシステムプロンプトが飛んでいたのだ。num_ctxを十分上げると同じ入力で指示を再び守った。

応答を受けてから知る事後ガードが気持ち悪ければ、送る前にトークン数を数える事前ガードもできる。Ollamaには独立したトークナイザーのエンドポイントがないので、私は`/api/generate`に`num_predict: 0`を与えて生成なしで`prompt_eval_count`だけ受け取り、長さを先に測る。一度の軽いprefillコストで、入力がウィンドウに収まるかを先に確認するわけだ。入力がばらつくRAGパイプラインなら、この事前計測でnum_ctxを動的に上げたり、コンテキストのチャンク数を減らす分岐を入れられる。

## この実験が語らないこと

正直に境界を引いておく。第一に、私は3.2B量子化モデル一つでしか測っていない。切り落とし自体はOllamaランタイム層の動作なのでモデルに依らないが、「headが切られたときモデルがどれだけそれっぽく幻覚するか」はモデルごとに違うだろう。より大きなモデルは「わからない」と答えるかもしれない。

第二に、秘密コードを先頭に置いたのは最悪ケースをわざと作った設定だ。実際のRAGやエージェントで重要情報が常にheadにあるとは限らない。ただシステムプロンプトとツール定義はほぼ常に先頭に来て、それが切られるのが一番致命的なので、こう設計した。

第三に、既定num_ctxが16384に決まったのは私の16GB M1 + Ollama 0.30.7の組み合わせの結果だ。バージョンとメモリ、同時に載っているモデル数で変わる。だから「既定値は16384だ」ではなく「既定値は環境ごとに違うから信じるな」が私の持ち帰る教訓だ。

そして正直、解けなかったものが一つ残った。OpenAI互換エンドポイント(`/v1/chat/completions`)でも同じテストを回したが、ここでは`options.num_ctx`をリクエストごとに渡す方法がなく、`usage.prompt_tokens`が`/api/generate`の`prompt_eval_count`と違う数(同じテキストなのに3464対2384)で出た。しかも私のマシンでは長い入力でもheadが生き残ってrecallできた。トークン集計方式が違うので二つのエンドポイントを1:1で比べられないところまではわかるが、なぜ切り落としの挙動まで違って見えたのかは綺麗に説明できない。ただ[OpenAI互換APIでnum_ctxが効かず4096で無言に切られるという報告](https://github.com/ollama/ollama/issues/2714)が実際にあるので、`/v1`経路を使うならサーバー既定値(`OLLAMA_CONTEXT_LENGTH`)に全面的に依存する点は覚えておくといい。

[コールドスタート時にload_durationを追跡した](/ja/blog/ja/local-llm-cold-start-load-duration-experiment)ときと同じ筋だ。Ollamaが応答にそっと添えて返す数字たちは、ドキュメントにあまり書かれていなくても、実挙動を追う一番正直な手がかりだ。`load_duration`がコールドスタートを密告したように、`prompt_eval_count`は切り落としを密告する。ローカルモデルを本気で回すなら、この数字たちを一度のぞいてみることをすすめる。
