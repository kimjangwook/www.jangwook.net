---
title: '로컬 LLM의 첫 응답은 왜 가끔 10초씩 걸릴까 — 콜드 스타트(load_duration)를 직접 재봤다'
description: >-
  잠깐 쉬었다가 에이전트를 다시 부르면 첫 응답이 유독 굼떴다. Ollama가 응답마다 돌려주는 load_duration을 모델 크기별로
  뜯어보니, 2GB는 1.5초, 9.6GB는 최대 9.7초였다. 게다가 '콜드'에도 두 종류가 있었다. keep_alive 하나로 이 비용이
  어떻게 갈리는지 직접 측정해 정리했다.
pubDate: '2026-06-26'
heroImage: '../../../assets/blog/local-llm-cold-start-load-duration-experiment/hero.png'
tags:
  - 로컬LLM
  - Ollama
  - 추론최적화
  - 에이전트설계
relatedPosts:
  - slug: local-llm-prefill-generation-latency-experiment
    score: 0.86
    reason:
      ko: 어제 그 글에서는 load_duration을 일부러 빼고 prefill과 generation만 쟀다. 오늘은 그때 빼놓은 그 항목, 모델 적재 시간 자체를 정면으로 본다. 둘을 합치면 첫 토큰까지의 지연이 통째로 분해된다.
      ja: 昨日の記事ではload_durationをわざと外してprefillとgenerationだけ測った。今日はそのとき外した項目、モデル読み込み時間そのものを正面から見る。合わせれば最初のトークンまでの遅延が丸ごと分解される。
      en: "Yesterday's post deliberately excluded load_duration and measured only prefill and generation. Today I face that excluded piece head-on: the model load time itself. Put together, they fully decompose the latency to first token."
      zh: 昨天那篇故意剔除了load_duration，只测prefill和generation。今天正面看那个被剔除的项目，即模型加载时间本身。两者结合，到首个token的延迟就被完整拆解了。
  - slug: ollama-fastapi-production-deployment-guide-2026
    score: 0.79
    reason:
      ko: 콜드 스타트는 프로덕션 배포에서 가장 먼저 부딪히는 벽이다. 그 가이드에서 다룬 Ollama + FastAPI 서빙 구조에 오늘 측정한 keep_alive 설정을 얹으면 첫 요청 지연을 실제로 줄일 수 있다.
      ja: コールドスタートは本番デプロイで最初にぶつかる壁だ。あのガイドで扱ったOllama + FastAPIの構成に、今日測ったkeep_alive設定を重ねれば最初のリクエスト遅延を実際に減らせる。
      en: Cold start is the first wall you hit in production deployment. Layer today's keep_alive findings onto the Ollama plus FastAPI serving setup from that guide and you can actually cut first-request latency.
      zh: 冷启动是生产部署中最先撞上的墙。把今天测出的keep_alive设置叠加到那篇指南里的Ollama加FastAPI服务结构上，就能真正降低首次请求延迟。
  - slug: llm-determinism-temperature-seed-experiment
    score: 0.74
    reason:
      ko: 같은 노트북, 같은 Ollama로 측정한 실험 시리즈다. 거긴 출력이 재현되는지를, 여긴 적재 시간이 재현되는지를 본다. 둘 다 '문서에 안 적힌 로컬 추론의 실제 거동'을 직접 재본 기록이다.
      ja: 同じノートPC、同じOllamaで測った実験シリーズ。あちらは出力が再現するか、こちらは読み込み時間が再現するかを見る。どちらも「ドキュメントに書かれないローカル推論の実挙動」を自分で測った記録だ。
      en: Part of the same series measured on the same laptop and Ollama. That one asks whether outputs reproduce; this one asks whether load time does. Both are hands-on records of local inference behavior the docs never spell out.
      zh: 同一台笔记本、同一个Ollama测出的实验系列。那篇看输出是否可复现，这篇看加载时间是否可复现。两者都是亲手测量"文档不会写明的本地推理真实行为"的记录。
faq:
  - question: 'Ollama에서 첫 응답이 느린 게 모델이 느린 건가요, 아니면 다른 이유가 있나요?'
    answer: '대부분 추론 속도가 아니라 모델 적재(load) 때문입니다. Ollama는 응답마다 load_duration이라는 항목을 돌려주는데, 메모리에 모델이 없으면 디스크에서 읽어 올리는 이 시간이 첫 응답에 통째로 더해집니다. 제 맥북에서 7.2GB 모델은 콜드 상태에서 약 2.8〜9.0초, 9.6GB 모델은 최대 9.7초가 load_duration에 찍혔습니다. 모델이 메모리에 이미 떠 있는 워밍 상태면 같은 항목이 0.4초 안쪽으로 떨어집니다.'
  - question: 'keep_alive를 어떻게 설정해야 콜드 스타트를 줄일 수 있나요?'
    answer: '대화형이나 에이전트 용도라면 keep_alive를 길게(예: "30m" 또는 "-1"로 무기한) 두는 게 핵심입니다. 제 측정에서 keep_alive="0"으로 매번 언로드하면 7.2GB 모델이 요청마다 2.5초 이상을 적재에 썼지만, keep_alive="10m"으로 두니 첫 요청만 2.6초를 내고 이후 요청은 0.38초로 떨어졌습니다. 단, 모델이 메모리를 계속 점유하므로 여러 모델을 동시에 띄우면 RAM/VRAM 압박과 맞바꾸게 됩니다.'
  - question: '서버를 재부팅하면 콜드 스타트 시간이 더 길어지나요?'
    answer: '네, 그게 제가 측정에서 발견한 핵심입니다. 같은 "콜드"라도 OS 페이지 캐시에 모델 파일이 남아 있는지에 따라 두 배 가까이 차이가 났습니다. 모델을 멈췄지만 파일이 캐시에 남은 경우 7.2GB가 약 2.8초였는데, 캐시가 비어 디스크에서 처음 읽는 진짜 콜드(재부팅 직후 같은)는 9.0초였습니다. 그래서 벤치마크나 SLA를 잡을 때는 재부팅 직후의 최악값을 기준으로 잡는 게 안전합니다.'
---

내 맥북에서 로컬 에이전트를 며칠째 돌리고 있다. 작업하다 잠깐 다른 일을 보고 와서 다시 같은 에이전트를 부르면, 첫 응답이 유독 굼뜨다. 두세 번째부터는 멀쩡한데 첫 번째만 답답하게 느렸다. 어제 [prefill과 generation 비용을 분해한 글](/ko/blog/ko/local-llm-prefill-generation-latency-experiment)을 쓰면서, 측정 전에 모델을 한 번 워밍해서 "모델 로딩 시간(load_duration)이 측정에 섞이지 않게 했다"고 적었다. 그 한 줄을 쓰면서 좀 찔렸다. 일부러 빼버린 그 항목이, 사실 내가 평소에 제일 자주 체감하는 지연이었기 때문이다.

그래서 오늘은 어제 빼놓은 바로 그 비용을 정면으로 쟀다. 모델이 메모리에 올라오기까지 걸리는 시간, 흔히 콜드 스타트라 부르는 그것이다.

## load_duration이라는, 평소엔 안 보이는 항목

Ollama의 `/api/generate`는 응답마다 타임스탬프 묶음을 같이 돌려준다. 어제는 그중 `prompt_eval_duration`(prefill)과 `eval_duration`(generation)만 봤는데, 맨 앞에 `load_duration`이라는 항목이 하나 더 있다. 이름 그대로 모델을 적재하는 데 쓴 시간이다.

이게 평소엔 잘 안 보이는 이유가 있다. 같은 모델을 연속으로 부르면 두 번째 호출부터는 모델이 이미 메모리에 떠 있어서 `load_duration`이 거의 0에 가깝게 찍힌다. 그러다 한동안 안 쓰면 Ollama가 모델을 메모리에서 내려버리고(기본 5분), 그다음 호출에서 다시 적재 비용이 부활한다. 내가 "잠깐 쉬었다 부르면 느리다"고 느낀 정체가 정확히 이거였다.

측정 방법은 단순하게 잡았다. 적재 시간만 떼어 보려고 프롬프트는 `Reply with the single word: ok` 한 줄, `num_predict`는 8로 묶어 생성은 거의 0에 수렴시켰다. 콜드 상태를 강제로 만들려면 호출 직전에 `ollama stop <model>`로 모델을 내려버리면 된다. 그러고 나서 첫 호출의 `load_duration`을 읽으면 그게 콜드 스타트다.

```python
def gen(model, keep_alive="5m"):
    body = json.dumps({
        "model": model, "prompt": "Reply with the single word: ok",
        "stream": False, "keep_alive": keep_alive,
        "options": {"num_predict": 8, "temperature": 0}
    }).encode()
    req = urllib.request.Request(OLLAMA, data=body,
        headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=600) as r:
        d = json.loads(r.read())
    return d["load_duration"] / 1e6  # 나노초 -> 밀리초
```

직접 확인하고 싶으면 더 간단하게 curl 한 줄이면 된다. 모델을 한 번 내렸다가 호출해서 `load_duration`만 뽑아본다.

```bash
ollama stop gemma4:12b-it-qat
curl -s http://localhost:11434/api/generate -d '{
  "model": "gemma4:12b-it-qat", "prompt": "ok", "stream": false
}' | python3 -c 'import sys,json; print(json.load(sys.stdin)["load_duration"]/1e9, "초")'
```

값은 나노초로 오니까 1e9로 나눠 초로 본다. 이 한 줄을 모델을 바꿔가며 돌려보면, 아래 표가 자기 하드웨어에서 어떻게 달라지는지 바로 감이 온다.

이 측정을 믿어도 되는 이유가 하나 있다. Ollama는 `load_duration`을 `prompt_eval_duration`이나 `eval_duration`과 따로 떼어 돌려준다. 즉 적재 시간이 prefill이나 generation 숫자에 섞여 들어가지 않는다. 응답의 `total_duration`은 대략 이 셋의 합에 가깝게 떨어졌고, 그래서 적재만 깔끔하게 분리해서 볼 수 있었다. 어제는 이 셋 중 가운데 둘만 봤고, 오늘은 맨 앞 항목 하나만 집중해서 본 셈이다.

## 모델 크기별로 콜드 스타트를 재봤다

집에 받아둔 Gemma 4 계열 모델 네 개를 크기순으로 줄 세웠다. 각 모델을 `ollama stop`으로 내린 뒤 콜드 상태에서 세 번, 그리고 모델이 떠 있는 워밍 상태에서 한 번 호출했다. 결과를 초 단위로 정리하면 이렇다.

| 모델 | 디스크 크기 | 콜드 #1 | 콜드 #3 | 워밍 |
|---|---|---|---|---|
| melavisions/gemma4 | 2.0 GB | 3.33초 | 1.55초 | 0.20초 |
| yinw1590/gemma4-e2b | 3.1 GB | 3.57초 | 1.79초 | 0.38초 |
| gemma4:12b-it-qat | 7.2 GB | 9.00초 | 2.82초 | 0.37초 |
| gemma4:e4b | 9.6 GB | 9.71초 | 3.86초 | 0.37초 |

![모델 크기별 콜드 스타트 load_duration 비교](../../../assets/blog/local-llm-cold-start-load-duration-experiment/hero.png)

큰 흐름은 예상대로다. 모델이 클수록 적재가 오래 걸린다. 9.6GB 모델의 첫 콜드는 9.7초, 같은 호출이 워밍 상태에서는 0.37초였다. 26배 차이다. 7.2GB 모델로 로컬 챗봇을 띄워놓고 5분 넘게 방치했다가 다시 말을 걸면, 답이 나오기도 전에 몇 초를 그냥 까먹는다는 뜻이다.

눈에 띄는 건 워밍 값이다. 모델이 2GB든 9.6GB든 워밍 상태의 `load_duration`은 0.2〜0.4초로 거의 비슷했다. 모델 크기와 무관하다. 내가 이해하기로는, 이건 실제로 가중치를 다시 읽는 게 아니라 Ollama가 "이 모델 아직 떠 있네"를 확인하는 keep_alive 점검 정도의 오버헤드다. 진짜 적재가 아니라서 크기를 안 탄다. 정확히 무슨 작업인지까지는 단정하지 않겠다. 다만 워밍 상태의 0.4초는 "사실상 적재 비용 없음"으로 봐도 된다는 게 측정으로 본 결론이다.

## "콜드"인데 왜 콜드 #1과 콜드 #3이 두 배씩 차이 날까

표를 다시 보면 이상한 점이 하나 있다. 분명히 매번 `ollama stop`으로 모델을 내리고 다시 쟀는데, 콜드 #1이 콜드 #3보다 두 배 가까이 느리다. 7.2GB 모델은 9.00초에서 2.82초로, 9.6GB 모델은 9.71초에서 3.86초로 떨어졌다. 똑같이 "콜드"라고 불렀는데 값이 다르다.

여기서 한참 헤맸다. 처음엔 측정 버그를 의심했는데, 답은 운영체제의 페이지 캐시였다. `ollama stop`은 Ollama 프로세스의 메모리에서 모델을 내릴 뿐, OS는 한 번 읽은 모델 파일을 RAM의 페이지 캐시에 그대로 들고 있는다. 그래서 콜드 #2, #3은 디스크가 아니라 RAM에서 파일을 다시 읽는다. 디스크 I/O가 통째로 빠지니 빨라진다.

이게 왜 중요하냐면, 우리가 흔히 말하는 "콜드 스타트"가 사실 두 종류라는 뜻이기 때문이다.

- 진짜 콜드: 재부팅 직후나 메모리 압박으로 캐시가 비워진 상태. 디스크에서 가중치를 처음 읽는다. 콜드 #1에 해당.
- 캐시된 콜드: 모델은 메모리에서 내려갔지만 파일은 페이지 캐시에 남은 상태. 콜드 #3에 해당.

벤치마크할 때 이 둘을 구분 안 하면, 두 번째 측정부터는 은근슬쩍 캐시된 값이 찍혀서 "콜드 스타트가 생각보다 빠르네"라는 낙관적 결론이 나온다. 실제 프로덕션 서버는 재부팅도 하고, 여러 모델을 번갈아 띄우면서 페이지 캐시가 밀려나기도 한다. 그러니 SLA나 콜드 스타트 예산을 잡을 때는 콜드 #3이 아니라 콜드 #1, 즉 재부팅 직후의 최악값을 기준으로 잡는 게 안전하다. 나도 이걸 모르고 한 번만 쟀으면 7.2GB 모델 콜드 스타트를 "2.8초"로 적었을 텐데, 실제 최악은 9초였다.

흥미로운 건 작은 모델에서는 이 격차가 훨씬 작다는 점이다. 2.0GB 모델은 콜드 #1이 3.33초, 콜드 #3이 1.55초로 약 1.8초 차이인데, 9.6GB 모델은 9.71초와 3.86초로 6초 가까이 벌어졌다. 디스크에서 읽어야 할 바이트가 많을수록, 페이지 캐시가 아껴주는 시간도 그만큼 커진다는 뜻이다. 큰 모델일수록 "재부팅 직후 첫 사용자"가 떠안는 페널티가 가파르게 커진다. 로컬에서 13B급 이상을 서빙할 생각이라면 이 캐시 의존성을 운영 변수로 진지하게 봐야 한다.

## keep_alive 하나로 비용이 갈린다

콜드 스타트를 피하는 가장 직접적인 설정값은 `keep_alive`다. 모델을 메모리에 얼마나 붙잡아둘지 정하는 값이다. 이걸 두 극단으로 놓고 같은 7.2GB 모델에 세 번씩 요청해봤다.

| 요청 | keep_alive="0" (매번 언로드) | keep_alive="10m" (워밍 유지) |
|---|---|---|
| 요청 #1 | 7.10초 | 2.56초 |
| 요청 #2 | 2.55초 | 0.38초 |
| 요청 #3 | 2.55초 | 0.38초 |

![keep_alive 설정에 따른 load_duration 비교](../../../assets/blog/local-llm-cold-start-load-duration-experiment/keepalive.png)

차이가 선명하다. `keep_alive="0"`은 요청을 처리한 직후 모델을 바로 내려버린다. 그래서 모든 요청이 콜드다. 매 요청이 2.5초 이상씩 적재에 깔고 들어간다. `ollama ps`로 확인해보면 요청 사이사이 모델이 메모리에 없다.

반대로 `keep_alive="10m"`은 첫 요청만 콜드 값(2.56초)을 내고, 이후 요청은 0.38초로 떨어진다. 콜드 스타트를 첫 요청에 한 번만 몰아넣고, 나머지는 워밍으로 처리하는 셈이다. 요청 #1의 keep_alive=0 값이 7.1초로 유독 튄 건 그 시점에 페이지 캐시도 비어 있던 진짜 콜드여서다. 앞 절에서 본 그 효과가 여기서도 그대로 나타났다.

명령행에서도 `OLLAMA_KEEP_ALIVE` 환경변수나 API의 `keep_alive` 필드로 같은 걸 조절한다. `-1`로 두면 무기한 메모리에 붙잡아둔다.

## 그래서 로컬 에이전트를 어떻게 띄울 것인가

측정하고 나니 평소에 막연하던 운영 판단이 몇 개 또렷해졌다.

첫째, 대화형이나 에이전트 용도라면 `keep_alive`를 넉넉히 줘야 한다. 사용자가 한 번 말 걸 때마다 모델이 내려가 있으면, 매 턴이 콜드 스타트다. 7.2GB 모델 기준으로 턴마다 2.5초씩 깔고 들어가는 건 대화 경험을 망친다. 메모리가 허락하는 한 `keep_alive`를 길게 두거나 `-1`로 박아두는 게 낫다. 이건 [Ollama와 FastAPI로 프로덕션 서빙을 구성한 글](/ko/blog/ko/ollama-fastapi-production-deployment-guide-2026)에서 다룬 배포 구조에 바로 얹을 수 있는 설정이다.

둘째, 서버를 띄울 때 모델을 미리 한 번 워밍해두는 게 좋다. 부팅 스크립트에서 더미 프롬프트로 한 번 호출해 콜드 스타트를 미리 치러두면, 첫 실사용자가 9초를 떠안는 일이 없다. 첫 요청에 콜드 비용을 몰아넣는 건 피할 수 없지만, 그 첫 요청이 진짜 사용자일 필요는 없다.

셋째, 여러 모델을 번갈아 쓰는 라우팅은 생각보다 비싸다. 요청마다 다른 모델을 부르면 그때마다 적재가 다시 일어나고, 메모리가 부족하면 서로의 페이지 캐시를 밀어내며 진짜 콜드(#1 수준)로 떨어진다. 모델 4개를 돌려쓰는 라우터를 짠다면, 적재 비용 × 전환 횟수를 미리 계산해보는 게 좋다. 가령 7.2GB와 9.6GB 모델을 요청마다 번갈아 부르면, 메모리가 둘을 동시에 못 올리는 순간부터 매 전환이 3〜9초짜리 콜드가 된다. 작은 모델 하나로 분류를 먼저 하고 무거운 모델은 꼭 필요할 때만 깨우는 식으로, 전환 자체를 줄이는 설계가 적재 비용을 가장 크게 아꼈다.

넷째, 추론 속도 벤치마크는 반드시 워밍 후에 재야 한다. 어제 글에서 내가 측정 전 워밍을 한 이유가 이거다. 콜드 상태로 한 번만 재면 `load_duration`이 prefill·generation 위에 9초씩 얹혀서, 모델이 느린 건지 적재가 느린 건지 구분이 안 된다. [출력 재현성을 쟀던 실험](/ko/blog/ko/llm-determinism-temperature-seed-experiment)에서도 같은 원칙이 적용됐다. 측정하려는 항목 외의 변수는 먼저 고정해야 한다.

다섯째, 메모리와 응답성은 맞바꾸는 관계다. `keep_alive`를 길게 잡으면 첫 요청 외 콜드 스타트는 사라지지만, 그 모델이 RAM을 계속 점유한다. 9.6GB 모델을 무기한 띄워두면 그만큼 다른 작업이 쓸 메모리가 줄고, 다른 모델을 또 띄우려는 순간 페이지 캐시가 밀려 콜드가 부활한다. 그래서 나는 "어떤 모델을 항상 띄워둘지"를 먼저 정하고, 자주 쓰는 한두 개만 `keep_alive`를 길게, 나머지는 짧게 두는 식으로 갈랐다. 모든 모델을 워밍으로 붙들어두는 건 메모리가 받쳐줄 때만 가능한 사치다. 콜드 스타트를 0으로 만들겠다고 무작정 `keep_alive=-1`을 박으면, 다음 모델 적재에서 더 큰 콜드로 되돌아온다.

## 한계와 아직 모르는 것

정직하게 경계를 그어두자. 이건 맥북(애플 실리콘, 통합 메모리) 한 대에서 잰 값이다. CUDA GPU가 달린 서버는 적재 경로가 디스크에서 시스템 RAM을 거쳐 VRAM으로 복사되는 단계가 더 끼기 때문에, 절대값은 다르게 나올 것이다. 내 숫자를 그대로 다른 하드웨어에 옮기지는 말 것. 다만 "콜드는 크기를 타고, 워밍은 안 탄다", "페이지 캐시 유무로 콜드가 두 종류로 갈린다", "keep_alive가 첫 요청 외 비용을 결정한다"는 구조적 결론은 하드웨어가 바뀌어도 유지될 거라 본다.

또 하나, `load_duration`이 정확히 어떤 작업들의 합인지는 Ollama 내부를 깊게 파지 않아서 단정하지 않는다. 파일 읽기만이 아니라 연산 그래프 구성 같은 초기화도 섞여 있을 수 있다. 내가 관측할 수 있는 건 API가 돌려주는 그 숫자고, 그 숫자가 모델 크기·페이지 캐시·keep_alive에 어떻게 반응하는지까지가 오늘 측정의 범위다. 워밍 상태에서도 0.37초가 찍히는 정체도 추정만 했지 확정은 못 했다.

마지막으로, 페이지 캐시 거동은 빈 RAM 양에 달려 있다. 메모리가 빠듯한 서버라면 콜드 #2, #3조차 캐시가 금방 밀려나 콜드 #1처럼 느려질 수 있다. 내 측정은 RAM이 넉넉한 상태에서의 낙관적 케이스에 가깝다. 다음엔 메모리 압박을 인위적으로 걸어두고 캐시가 얼마나 버티는지 재보고 싶다. 콜드 스타트는 한 번 측정으로 끝나는 주제가 아니라, 환경마다 다시 재야 하는 종류의 비용이다.
