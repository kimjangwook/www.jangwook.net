---
title: '로컬 LLM에 에이전트 8개를 동시에 붙였더니 — Ollama 동시성 처리량 실측'
description: >-
  서브에이전트를 병렬로 돌리면 로컬 모델도 그만큼 빨라질 줄 알았다. 직접 재보니 기본 Ollama는 요청을 줄 세워 처리해서 8개를 붙여도
  총 처리량이 그대로였다. OLLAMA_NUM_PARALLEL을 올렸을 때의 처리량 이득과 그 대가를 M1 16GB에서 실측했다.
pubDate: '2026-07-01'
heroImage: '../../../assets/blog/local-llm-concurrent-requests-num-parallel-experiment/hero.png'
tags:
  - 로컬LLM
  - Ollama
  - 동시성
  - AI에이전트
relatedPosts:
  - slug: multi-agent-orchestration-improvement
    score: 0.79
    reason:
      ko: 여러 에이전트를 동시에 굴리는 오케스트레이션 얘기를 그 글에서 다뤘다. 그 병렬 실행이 로컬 모델 뒤에서 실제로 어떻게 처리되는지가 이 글의 측정값이다.
      ja: 複数のエージェントを同時に回すオーケストレーションをあの記事で扱った。その並列実行がローカルモデルの裏で実際どう捌かれるかが本記事の測定値だ。
      en: That post covered orchestrating several agents at once. This one measures what that parallel execution actually does behind a local model.
      zh: 那篇文章讲了同时运行多个代理的编排。本文测量的正是这种并行执行在本地模型背后究竟如何被处理。
  - slug: ollama-num-ctx-silent-truncation-experiment
    score: 0.74
    reason:
      ko: 동시 요청 슬롯을 늘리면 컨텍스트 메모리가 슬롯 수만큼 곱해진다. num_ctx가 왜 메모리 예산의 핵심인지 그 글에서 먼저 잡아두면 이 글의 제약이 바로 이해된다.
      ja: 同時リクエストのスロットを増やすとコンテキストメモリがスロット数だけ掛け算される。num_ctxがなぜメモリ予算の要かをあの記事で押さえると本記事の制約がすぐ腑に落ちる。
      en: More parallel slots multiply context memory by the slot count. Grasping why num_ctx is the memory budget there makes this post's constraint click.
      zh: 增加并发请求槽位会让上下文内存按槽位数翻倍。先在那篇文章理解num_ctx为何是内存预算的关键，本文的限制就一目了然。
  - slug: local-llm-prefill-generation-latency-experiment
    score: 0.71
    reason:
      ko: 단일 요청의 지연을 prefill과 생성으로 쪼갠 글이다. 이 글은 그 위에 "요청이 여러 개면 어떻게 되나"를 얹은 셈이라, 지연의 기본기를 먼저 보면 좋다.
      ja: 単一リクエストの遅延をprefillと生成に分解した記事だ。本記事はその上に「リクエストが複数だとどうなるか」を重ねた形なので、遅延の基礎を先に見ると良い。
      en: That post split single-request latency into prefill and generation. This one stacks "what if there are many requests" on top, so the latency basics help first.
      zh: 那篇文章把单请求延迟拆成prefill和生成。本文是在其上叠加"多个请求时会怎样"，先看延迟基础会更顺。
  - slug: ai-agent-cost-reality
    score: 0.66
    reason:
      ko: 로컬로 돌리면 API 요금은 0이지만 시간이 곧 비용이다. 동시성으로 총 처리 시간을 줄일 수 있는지가 그 글에서 다룬 비용 감각과 바로 연결된다.
      ja: ローカルなら API 料金はゼロだが時間が即コストだ。同時実行で総処理時間を減らせるかは、あの記事のコスト感覚に直結する。
      en: Running locally makes the API bill zero, but time is the cost. Whether concurrency cuts total wall time ties straight into that post's cost sense.
      zh: 本地运行 API 费用为零，但时间就是成本。并发能否缩短总处理时间，直接关联那篇文章的成本观。
faq:
  - question: 'Ollama에 동시 요청을 보내면 자동으로 병렬 처리되나요?'
    answer: '항상은 아닙니다. OLLAMA_NUM_PARALLEL이 결정하는데, 이 값을 설정하지 않으면 가용 메모리에 따라 4 또는 1로 자동 선택됩니다. 제 M1 16GB에서 gemma4를 올렸을 때는 1로 잡혀서, 동시 요청 8개를 보내도 서버가 한 개씩 줄 세워 처리했습니다. 총 처리량은 단일 요청과 같은 초당 약 23토큰에 머물렀고 벽시계 시간만 8배로 늘었습니다.'
  - question: 'OLLAMA_NUM_PARALLEL을 올리면 얼마나 빨라지나요?'
    answer: '총 처리량은 오르지만 개별 요청은 느려집니다. 제 측정에서 num_parallel=4로 동시 4개를 돌리자 집계 처리량이 초당 18토큰에서 33토큰으로 약 1.8배 올랐습니다. 대신 요청 하나당 생성 속도는 초당 약 22토큰에서 10토큰으로 반 이하로 떨어졌습니다. 배치로 묶어 총량은 늘리되 각자는 양보하는 거래입니다.'
  - question: '동시성을 올릴 때 메모리는 얼마나 더 드나요?'
    answer: '공식 FAQ 기준으로 병렬 슬롯 수만큼 컨텍스트가 곱해집니다. 2K 컨텍스트에 병렬 4면 실효 8K가 되어 그만큼 KV 캐시 메모리가 더 필요합니다. 16GB M1처럼 메모리가 빠듯한 기기에서 Ollama가 기본값을 1로 낮춰 잡는 이유가 이것입니다. 무작정 num_parallel을 키우면 모델이 GPU에서 밀려나 오히려 느려질 수 있습니다.'
  - question: '에이전트를 여러 개 돌릴 때 로컬 모델이 병목이면 어떻게 하나요?'
    answer: '먼저 동시성이 실제로 처리량을 올리는지 재보세요. 슬롯이 1이면 에이전트를 늘려도 큐만 길어집니다. 처리량이 목표면 num_parallel을 코어와 메모리가 감당하는 선까지 올리고, 지연이 목표면 오히려 요청을 직렬화해 하나씩 빠르게 끝내는 편이 낫습니다. 둘을 동시에 만족시키는 마법값은 없었습니다.'
---

로컬에서 서브에이전트 몇 개를 동시에 굴리는 파이프라인을 만들다가, 당연하다고 여긴 가정 하나가 걸렸다. 클라우드 API는 요청을 병렬로 던지면 대체로 그만큼 빨리 끝난다. 그래서 로컬 Ollama에도 에이전트 8개를 한꺼번에 붙이면 GPU가 알아서 나눠 처리해 총 시간이 줄 거라고 막연히 믿고 있었다.

그런데 M1 맥북에서 실제로 8개를 붙여보니 체감이 이상했다. 하나 돌릴 때랑 여덟 개 돌릴 때 초당 나오는 토큰 총량이 거의 똑같았다. 그냥 오래 걸리기만 했다. 이게 내 착각인지 실제 동작인지 애매해서, 짐작을 접고 그 자리에서 재봤다.

## 무엇을 어떻게 쟀나

환경은 Apple M1, 16GB 통합 메모리, Ollama 0.30.7이다. 모델은 gemma4 계열의 작은 변형(약 4GB, `ollama ps`상 100% GPU 오프로드)을 썼다. 작은 모델을 고른 건 동시 요청을 8개까지 여러 번 돌려도 실험이 한 번에 끝나야 했기 때문이다.

측정 방식은 단순하다. 파이썬 `ThreadPoolExecutor`로 동일한 개수의 요청을 동시에 `/api/generate`에 던지고, 요청마다 `num_predict`를 100으로 고정해 각자 딱 100토큰씩 생성하게 했다. 프롬프트는 8개를 돌려쓰며 서로 다르게 줘서 prompt 캐시가 결과를 왜곡하지 않게 했다. 동시성(concurrency)을 1, 2, 4, 8로 올리며 두 가지를 봤다.

- 집계 처리량(aggregate tokens/sec): 배치 전체가 초당 몇 토큰을 뱉는가.
- 벽시계 시간(wall-clock): 배치가 다 끝나는 데 실제로 몇 초 걸리는가.

응답 JSON의 `eval_count`와 `eval_duration`을 그대로 읽어 요청별 실제 생성 속도도 같이 기록했다. 여기서 `eval_duration`은 큐에서 기다린 시간이 아니라 순수 생성 시간만 담고 있어서, "줄 서 있었는지"와 "느리게 생성됐는지"를 구분하는 데 결정적이었다.

핵심 측정 코드는 이 정도가 전부다. 재현하고 싶으면 그대로 복사해서 자기 기기에서 돌려보면 된다.

```python
import json, time, urllib.request, concurrent.futures, statistics

URL = "http://localhost:11434/api/generate"
MODEL = "gemma4:latest"   # 자기 모델로 교체
NUM_PREDICT = 100

def one_request(idx):
    body = json.dumps({
        "model": MODEL,
        "prompt": PROMPTS[idx % len(PROMPTS)],  # 서로 다른 프롬프트 8개
        "stream": False,
        "options": {"num_predict": NUM_PREDICT, "seed": idx},
    }).encode()
    req = urllib.request.Request(URL, data=body,
                                headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=600) as r:
        d = json.loads(r.read())
    return d["eval_count"], d["eval_duration"] / 1e9  # 토큰 수, 순수 생성 초

def bench(concurrency):
    t0 = time.perf_counter()
    with concurrent.futures.ThreadPoolExecutor(max_workers=concurrency) as ex:
        res = list(ex.map(one_request, range(concurrency)))
    wall = time.perf_counter() - t0
    total_tokens = sum(c for c, _ in res)
    return total_tokens / wall  # 집계 처리량(tok/s)
```

`num_predict`를 고정하는 게 포인트다. 이걸 안 잡으면 요청마다 생성 길이가 제각각이라 처리량 비교가 흐려진다. 길이를 고정해야 "같은 일을 몇 개 동시에 시켰을 때"의 순수 처리량이 나온다.

## 기본 서버는 요청을 줄 세운다

먼저 평소 쓰던 기본 Ollama 서버(포트 11434, 환경변수 설정 없음)에 그대로 던졌다. 결과 요약은 이렇다.

| 동시 요청 | 벽시계(초) | 집계 처리량(tok/s) | 요청별 생성속도(tok/s) |
|---|---|---|---|
| 1 | 4.38 | 21.7 | 24.6 |
| 2 | 8.71 | 22.4 | 23.6 |
| 4 | 16.53 | 22.6 | 23.7 |
| 8 | 32.04 | 23.5 | 24.5 |

숫자가 너무 깔끔해서 처음엔 버그인 줄 알았다. 벽시계 시간이 동시성에 정확히 비례한다. 8개를 붙이면 1개일 때의 딱 8배가 걸린다. 반면 집계 처리량은 22~23 토큰/초에 붙박여서 꿈쩍도 안 한다.

핵심은 세 번째 열이다. 요청별 생성 속도가 동시성과 무관하게 항상 24토큰/초 근처로 유지된다. 이게 뭘 뜻하냐면, 각 요청은 혼자일 때의 최고 속도로 생성되고 있다는 것이다. 그런데 총량이 안 늘고 벽시계만 늘었다는 건, 요청들이 동시에 계산되는 게 아니라 한 번에 하나씩 순서대로 처리됐다는 뜻이다. 즉 서버가 요청을 큐에 넣고 직렬로 흘려보냈다. 병렬 슬롯이 1이었던 것이다.

숫자로 다시 확인해보면 앞뒤가 맞는다. 동시 8개일 때 벽시계는 32초인데, 요청 하나가 100토큰을 24토큰/초로 만드는 데 약 4.2초가 걸린다. 4.2초 × 8 = 33.6초. 관측된 32초와 거의 일치한다. 여덟 요청이 겹치지 않고 차례로 처리됐다는 뜻이다. 먼저 도착한 요청은 곧장 처리되지만, 여덟 번째로 큐에 선 요청은 앞선 일곱 개가 끝날 때까지 순수하게 대기만 하다가 마지막에 자기 4.2초를 쓴다. 이 대기 시간이 개별 요청의 체감 지연을 그대로 밀어 올린다.

이 지점에서 [num_ctx 때문에 긴 입력의 지시가 통째로 잘려나갔던 실험](/ko/blog/ko/ollama-num-ctx-silent-truncation-experiment)이 떠올랐다. 그때도 "모델이 멍청한 게 아니라 설정이 문제"였다. 이번에도 같은 냄새가 났다. 모델이 병렬을 못 하는 게 아니라, 서버가 병렬을 안 하도록 설정돼 있는 것 아니냐는 의심.

## 왜 1이었나 — 문서로 확인

Ollama 공식 FAQ가 답을 갖고 있었다. `OLLAMA_NUM_PARALLEL`이 모델 하나가 동시에 처리할 최대 요청 수를 정하는데, 이 값을 지정하지 않으면 가용 메모리에 따라 4 또는 1로 자동 선택된다([Ollama FAQ](https://docs.ollama.com/faq)). 그리고 결정적인 한 줄이 더 있다. 병렬 요청은 컨텍스트 크기를 병렬 수만큼 곱한다. 2K 컨텍스트에 병렬 4면 실효 8K가 되고 그만큼 메모리를 더 잡아먹는다.

그러니까 16GB M1은 메모리가 빠듯해서 Ollama가 알아서 병렬을 1로 낮춰 잡은 것이다. 내가 게을러서가 아니라 기기가 그렇게 판단했다. 이건 노트북에서 로컬 모델을 돌리는 사람 대부분에게 해당하는 기본값이라는 뜻이기도 하다.

## 슬롯을 4로 열면 무슨 일이 벌어지나

가정을 확인하려고 두 번째 서버를 다른 포트(11500)에 `OLLAMA_NUM_PARALLEL=4`로 띄웠다. 기존 서버는 건드리지 않았다. 서버 로그에서 `OLLAMA_NUM_PARALLEL:4`가 실제로 먹은 걸 확인하고 같은 벤치를 돌렸다.

```
model=gemma4(small) num_predict=100  OLLAMA_NUM_PARALLEL=4
concurrency=1  wall=5.15s  aggregate=18.4 tok/s  per_req=21.7 tok/s
concurrency=2  wall=10.57s aggregate=18.5 tok/s  per_req=9.8 tok/s
concurrency=4  wall=11.36s aggregate=33.2 tok/s  per_req=9.9 tok/s
concurrency=8  wall=22.30s aggregate=33.6 tok/s  per_req=10.0 tok/s
```

여기서 그림이 완전히 달라진다. 동시 4개 지점에서 집계 처리량이 18토큰/초에서 33토큰/초로 뛴다. 단일 스트림 대비 약 1.8배다. 벽시계로 봐도 동시 4개가 11.4초로, 기본 서버가 같은 4개를 처리하던 16.5초보다 확실히 짧다. 병렬 배치가 실제로 작동한 것이다.

그런데 공짜가 아니다. 요청별 생성 속도를 보면 동시 2개부터 이미 22에서 10토큰/초로 반토막이 났다. 요청들이 진짜로 동시에 계산되지만, GPU 하나를 나눠 쓰니 각자는 그만큼 느려진다. 그래서 동시 2개일 때는 재밌게도 집계 처리량이 안 오른다(18.5 그대로). 둘이 절반씩 나눠 가지니 합이 그대로다. 이득은 4개까지 슬롯을 다 채웠을 때 비로소 나온다.

동시 8개는 어떨까. 집계 처리량이 33.6으로 4개와 거의 같다. 슬롯이 4개뿐이니 나머지 4개는 큐에서 기다린다. 그래서 벽시계는 다시 늘고(22.3초), 큐 뒤에 선 요청의 체감 지연은 최대 22초까지 벌어진다. 처리량은 이미 4에서 천장을 쳤다.

이 대비를 한 장으로 그리면 아래와 같다. 왼쪽이 집계 처리량, 오른쪽이 벽시계 시간이다. 회색이 기본(직렬), 파랑이 num_parallel=4다.

![gemma4 동시성 처리량과 벽시계 시간 비교 차트](../../../assets/blog/local-llm-concurrent-requests-num-parallel-experiment/hero.png)

## 그래서 에이전트를 몇 개 붙일 것인가

이 측정이 내 [멀티 에이전트 오케스트레이션](/ko/blog/ko/multi-agent-orchestration-improvement) 설계를 바로 바꿨다. 정리하면 이렇다.

첫째, 기본값에서 동시성은 처리량을 안 올린다. 슬롯이 1이면 에이전트를 8개로 늘려도 큐만 길어지고 총 시간은 8배가 된다. "병렬로 던졌으니 빠르겠지"는 로컬에선 틀린 직관이다. 클라우드 API의 감각을 그대로 가져오면 안 된다.

둘째, 처리량이 목표라면 `OLLAMA_NUM_PARALLEL`을 올리는 게 맞고, 슬롯을 꽉 채웠을 때만 이득이 난다. 슬롯 4개에 요청 2개를 보내면 이득이 0이다. 배치를 슬롯 수에 맞춰 모아서 던져야 한다.

셋째, 지연이 목표라면 오히려 직렬이 낫다. 사용자가 한 응답을 기다리는 대화형이라면, 요청을 하나씩 최고 속도로 끝내는 편이 각 응답을 빨리 돌려준다. 여러 개를 배치로 묶으면 개당 속도가 반토막 나니까.

내 결론은 이렇다. 나는 백그라운드 배치성 작업(문서 여러 개 요약, 대량 분류)은 num_parallel을 올려 묶어 던지고, 사람이 기다리는 대화형 경로는 직렬로 두기로 했다. 하나의 마법값으로 둘을 다 만족시키는 설정은 없었다.

## 내 기기의 슬롯 수부터 확인하라

설계를 바꾸기 전에 먼저 자기 서버가 지금 병렬을 몇 개로 잡고 있는지 알아야 한다. 이건 추측할 게 아니라 바로 확인할 수 있다. 서버를 띄운 터미널의 로그에 `server config`가 찍히는데, 거기서 `OLLAMA_NUM_PARALLEL` 값을 그대로 읽으면 된다. 자동 선택이면 실측으로 확인하는 게 확실하다. 위 스크립트로 동시 4개를 던져보고, 벽시계가 단일 요청의 4배로 늘면 슬롯이 1, 거의 그대로면 슬롯이 4 이상이다.

값을 바꾸려면 서버를 그 환경변수와 함께 다시 띄우면 된다.

```bash
# 병렬 슬롯을 4로 열고 서버 실행
OLLAMA_NUM_PARALLEL=4 ollama serve
```

앱으로 자동 실행되는 Ollama라면 시스템 서비스 환경에 이 변수를 넣어야 한다. 그리고 바꾼 뒤에는 반드시 다시 재라. 슬롯을 늘렸는데 모델이 메모리에서 밀려나면 오히려 느려질 수 있어서, 설정값만 보고 안심하면 안 된다. 나는 이 확인 절차를 건너뛰고 "4로 줬으니 됐겠지" 했다가, 큰 모델에서 슬롯이 안 열리는 걸 뒤늦게 발견한 적이 있다.

## 이 측정의 한계

정직하게 짚는다. 이건 M1 16GB에 작은 gemma4를 올린 특정 조건의 숫자다. 메모리가 넉넉한 기기나 별도 GPU가 있는 환경이면 기본 num_parallel이 4로 잡힐 테고, 큰 모델은 슬롯당 KV 캐시가 커서 애초에 병렬 슬롯을 몇 개 못 띄운다. 병렬 슬롯이 컨텍스트 메모리를 곱한다는 점 때문에, 긴 컨텍스트를 쓰는 에이전트일수록 동시성을 올리기 어렵다. 그래서 [단일 요청의 prefill 비용을 쟀던 글](/ko/blog/ko/local-llm-prefill-generation-latency-experiment)에서 본 긴 입력의 무게가 여기서 다시 발목을 잡는다.

또 하나. 집계 처리량 1.8배는 이 하드웨어에서 GPU가 놀고 있던 여유가 있었다는 뜻이기도 하다. 단일 스트림이 GPU를 이미 100% 쓰고 있었다면 병렬로 묶어도 이득이 거의 없었을 것이다. 이득의 크기는 기기마다 다르니, 결론은 하나다. 설정을 바꿨으면 반드시 자기 기기에서 다시 재라. 30줄짜리 스크립트면 충분하다.

다음엔 큰 모델(gemma4:12b)로 같은 실험을 돌려서, 모델이 커질 때 병렬 슬롯이 몇 개까지 버티는지와 그 지점에서 GPU가 포화하는 경계를 재볼 생각이다. 로컬에서 에이전트를 여러 개 굴리는 이상, 이 경계값이 곧 내 파이프라인의 실질 상한이 된다.
