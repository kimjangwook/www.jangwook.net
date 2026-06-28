---
title: '로컬 에이전트가 시스템 프롬프트를 까먹은 이유 — Ollama num_ctx 무음 truncation을 직접 재봤다'
description: >-
  로컬 에이전트가 긴 대화에서 갑자기 지시를 무시하길래, 프롬프트 맨 앞에 비밀 코드를 숨기고 길이를 늘여가며 recall을 측정했다.
  num_ctx를 넘기면 Ollama는 에러 없이 프롬프트 앞쪽을 잘라낸다. 그리고 기본값이 4096이라는 통설도 내 맥북에선 틀렸다.
pubDate: '2026-06-28'
heroImage: '../../../assets/blog/ollama-num-ctx-silent-truncation-experiment/hero.png'
tags:
  - 로컬LLM
  - Ollama
  - 에이전트설계
  - 컨텍스트관리
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
  - question: 'Ollama에서 긴 프롬프트를 보내면 에러가 나야 정상 아닌가요? 왜 조용히 잘리나요?'
    answer: 'Ollama는 num_ctx(컨텍스트 윈도우)를 넘는 입력에 에러를 내지 않습니다. 윈도우에 맞게 토큰을 잘라서 그냥 처리합니다. 문제는 잘리는 쪽이 끝이 아니라 앞쪽이라는 점입니다. 시스템 프롬프트나 지시문은 보통 맨 앞에 두는데, 바로 그게 먼저 사라집니다. 제 맥북(M1 16GB, Ollama 0.30.7)에서 num_ctx=2048로 3464토큰짜리 프롬프트를 보냈더니 prompt_eval_count가 2047로 고정됐고, 맨 앞에 숨겨둔 비밀 코드를 모델이 전혀 답하지 못했습니다.'
  - question: 'Ollama 기본 num_ctx는 4096 아닌가요?'
    answer: '오래된 통설입니다. 제 측정에서는 num_ctx를 설정하지 않았을 때 16383토큰까지 입력이 통째로 들어갔습니다. 즉 이 머신의 기본값은 16384였습니다. 최근 Ollama는 사용 가능한 메모리에 맞춰 기본 컨텍스트를 자동으로 잡습니다. 그래서 같은 코드가 32GB 머신에서는 멀쩡하다가 8GB 서버에서는 조용히 잘릴 수 있습니다. 기본값에 의존하지 말고 요청마다 num_ctx를 명시하는 편이 안전합니다.'
  - question: '내 요청이 잘렸는지 어떻게 알 수 있나요?'
    answer: 'Ollama 응답에 담겨오는 prompt_eval_count를 보세요. 이 값이 입력으로 기대한 토큰 수보다 작고 num_ctx에 거의 딱 붙어 있으면(예: num_ctx-1) 잘린 것입니다. 코드에서 토큰 수를 미리 세거나, 응답의 prompt_eval_count가 설정한 num_ctx에 근접하면 경고를 띄우는 가드를 한 줄 넣으면 디버깅이 훨씬 빨라집니다.'
---

며칠 전 로컬에서 돌리던 회의록 요약 에이전트가 이상하게 굴었다. 짧은 회의록은 잘 처리하는데, 긴 회의록을 넣으면 맨 위에 적어둔 "JSON으로만 답하라" 같은 지시를 통째로 무시하고 평문으로 줄줄 답했다. 처음엔 모델이 멍청해서 그런 줄 알았다. 그런데 같은 모델이 짧은 입력에서는 멀쩡하게 지시를 지킨다는 게 걸렸다. 모델이 멍청해진 게 아니라, 모델이 내 지시를 **아예 못 본** 것이라면?

[prefill과 generation 비용을 분해한 지난 글](/ko/blog/ko/local-llm-prefill-generation-latency-experiment)에서 컨텍스트가 길수록 첫 토큰이 늦어진다는 건 쟀었다. 그건 속도 얘기였다. 오늘 의심한 건 다른 쪽이다. 컨텍스트가 어느 선을 넘으면 속도가 아니라 **내용**이 사라지는 것 아니냐는 의심. 그래서 직접 재봤다.

## 비밀 코드를 맨 앞에 숨기고 길이를 늘여봤다

방법은 needle-in-haystack을 살짝 비틀었다. 프롬프트 맨 앞(head)에 비밀 코드 한 줄을 박는다. 그 아래로 회의록 같은 filler 텍스트를 길게 깔아서 토큰 수를 부풀린다. 그리고 맨 끝에서 "맨 위에 적힌 비밀 코드가 뭐였지?"라고 묻는다. 코드를 정확히 답하면 모델이 head를 본 것이고, 못 답하면 head가 사라진 것이다.

핵심은 **같은 프롬프트를 그대로 두고 num_ctx만 바꾸는** 것이다. 입력이 동일하니 recall이 무너진다면 범인은 모델이 아니라 컨텍스트 윈도우 설정이다.

```python
import json, urllib.request

SECRET = "ALPHA-7723-ZULU"
HEAD = (f"중요: 이 문서 어딘가에 비밀 코드가 숨어 있다. 비밀 코드는 {SECRET} 이다.\n"
        "아래 회의록을 읽되, 마지막 질문에만 답하라.\n\n")
FILLER = ("회의에서는 분기 로드맵, 배포 일정, 온콜 로테이션, 비용 최적화 항목을 논의했다. "
          "각 팀은 진행 상황을 공유했고 다음 스프린트의 우선순위를 조정했다.\n")
Q = "\n\n질문: 이 문서 맨 위에 적힌 비밀 코드는 무엇인가? 코드만 정확히 답하라."

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

테스트 모델은 `gemma4:latest`(3.2B, Q4_K_M) 양자화판을 썼다. 작아서 빠르고, 이 실험은 모델 지능이 아니라 입력 보존 여부를 보는 거라 작은 모델로 충분했다. filler를 40번 반복하니 전체 프롬프트가 3464토큰이 됐다. 이 숫자를 기억해두자.

## num_ctx만 바꿨더니 recall이 무너졌다

3464토큰짜리 동일 프롬프트를 num_ctx만 1024, 2048, 4096, 8192로 바꿔가며 네 번 던졌다. 결과가 깔끔하게 갈렸다.

| num_ctx | prompt_eval_count | 비밀 코드 recall | 모델 답변 |
|---|---|---|---|
| 1024 | 1023 | 실패 | "비밀 코드는 None입니다" |
| 2048 | 2047 | 실패 | "비밀 코드는 로입니다" |
| 4096 | 3464 | 성공 | `ALPHA-7723-ZULU` |
| 8192 | 3464 | 성공 | `ALPHA-7723-ZULU` |

![num_ctx별 prompt_eval_count와 recall 성공/실패](../../../assets/blog/ollama-num-ctx-silent-truncation-experiment/chart.png)

여기서 한 가지가 눈에 확 들어왔다. num_ctx가 1024일 때 `prompt_eval_count`가 정확히 1023, 2048일 때 정확히 2047이다. 내가 보낸 프롬프트는 분명 3464토큰인데, 모델이 실제로 읽은 토큰 수는 num_ctx에 딱 맞춰 잘려 있었다. 윈도우보다 긴 입력을 Ollama가 윈도우 크기로 깎아낸 것이다. 그리고 깎인 쪽이 head였기 때문에, 맨 앞에 숨긴 비밀 코드가 통째로 사라졌다.

에러는 없었다. 경고도 없었다. 그냥 "None"이라고, 혹은 "로"라고 천연덕스럽게 답했다. 솔직히 이게 제일 무서운 지점이다. 입력이 잘렸다는 신호를 모델 답변 어디에서도 주지 않는다. num_ctx 4096부터는 3464가 윈도우 안에 들어가니 `prompt_eval_count`가 온전히 3464로 찍히고 recall도 정확했다. 임계선은 2048과 4096 사이, 즉 내 프롬프트 길이 3464에 정확히 걸쳐 있었다.

## 왜 끝이 아니라 앞을 자를까

처음엔 직관과 반대라 좀 의아했다. 보통 "잘린다" 하면 뒤가 잘릴 것 같은데, 여기선 앞이 사라진다. 이유는 대화형 추론의 구조에 있다. LLM이 다음 토큰을 만들 때 직접적으로 의존하는 건 바로 앞의 최근 토큰들이다. 그래서 윈도우가 모자라면 런타임은 가장 최근 토큰(끝)을 살리고 오래된 토큰(앞)을 버린다. `/api/chat`으로 멀티턴 대화를 돌릴 때도 같은 원리로, [Ollama 공식 FAQ](https://docs.ollama.com/faq)는 컨텍스트가 넘치면 "가장 오래된 메시지부터 조용히 떨어뜨린다"고 적어두었다.

문제는 우리가 가장 안 잘렸으면 하는 것들이 죄다 앞쪽에 산다는 점이다. 시스템 프롬프트, 역할 지시, 도구 정의, 출력 형식 규칙. 이것들은 관습적으로 맨 앞에 둔다. 그런데 잘림은 정확히 거기서 시작한다. 긴 대화를 이어가던 에이전트가 갑자기 페르소나를 잃거나 도구 호출 형식을 어기기 시작한다면, 모델이 변덕을 부린 게 아니라 시스템 프롬프트가 윈도우 밖으로 밀려난 것일 수 있다. 내 회의록 에이전트가 딱 이 꼴이었다.

실무적으로 한 가지 방어선이 여기서 나온다. 정말 절대 잃으면 안 되는 지시는 맨 앞이 아니라 **질문 바로 앞**, 즉 끝쪽에 한 번 더 박아두는 것이다. 잘려도 살아남는 자리에 두는 셈이다. 우아하진 않지만, num_ctx를 통제할 수 없는 상황에선 꽤 효과가 있었다.

## prompt_eval_count이 잘림을 일러바친다

이 실험에서 건진 가장 실용적인 사실은 따로 있다. **잘림은 응답 안에 흔적을 남긴다.** Ollama가 `/api/generate` 응답에 돌려주는 `prompt_eval_count`는 모델이 실제로 prefill한 입력 토큰 수다. 이 값이 내가 보낸 프롬프트의 토큰 수보다 작고 num_ctx에 바짝 붙어 있으면, 백이면 백 잘린 것이다.

이게 왜 중요하냐면, 평소엔 이 숫자를 아무도 안 본다. 답이 그럴듯하게 나오면 입력이 온전히 들어갔다고 믿어버린다. 하지만 [구조화 출력으로 답을 안정화](/ko/blog/ko/ollama-structured-outputs-pydantic-local-llm-guide-2026)해놓아도, 애초에 모델이 본 입력이 반쪽이면 스키마만 깔끔하고 내용은 틀린 답이 나온다. 스키마 검증은 통과하는데 사실관계가 어긋나는, 디버깅하기 제일 골치 아픈 종류의 버그다.

## 그런데 기본값이 4096이 아니었다

여기서 멈췄으면 "Ollama 기본 num_ctx는 4096이니 조심하라"는 흔한 결론으로 끝났을 거다. 그런데 num_ctx를 **아예 설정하지 않고** 3464토큰 프롬프트를 보냈더니 recall이 성공했다. `prompt_eval_count`도 3464로 온전했다. 기본값이 4096이라는 통설대로면 3464는 당연히 통과니까 여기까진 말이 된다. 그래서 입력을 더 키워봤다.

| filler 반복 | 기본 num_ctx에서의 prompt_eval_count | 비고 |
|---|---|---|
| 70 | 5911 | 온전히 들어감 |
| 100 | 8431 | 온전히 들어감 |
| 150 | 12631 | 온전히 들어감 |
| 200 | 16383 | 16384에서 잘림 |
| 250 | 16383 (recall 실패, 답변 "secret") | head 잘림 |

기본값이 4096이었다면 5911에서 이미 잘렸어야 한다. 그런데 12631토큰까지 멀쩡히 들어가다가 16383(=16384−1)에서 천장을 쳤다. 즉 내 맥북에서 Ollama 0.30.7이 잡은 **기본 num_ctx는 4096이 아니라 16384**였다. [Ollama 공식 FAQ](https://docs.ollama.com/faq)와 커뮤니티 문서를 찾아보니, 최근 버전은 기본 컨텍스트를 사용 가능한 메모리에 맞춰 자동으로 키운다고 한다. 16GB M1에서 16384가 잡힌 것이다.

이게 단순한 트리비아가 아닌 이유는 portability다. 내 32GB 데스크탑에서 잘 돌던 에이전트가 8GB 클라우드 인스턴스에 올라가면 기본 num_ctx가 더 작게 잡혀서, 똑같은 코드가 똑같은 입력에 조용히 잘릴 수 있다. 로컬에서 테스트할 땐 멀쩡하다가 배포하면 품질이 무너지는, 재현하기 까다로운 사고로 이어진다. 나는 "기본값을 믿지 말고 항상 명시하라"는 쪽이다. 기본값이 머신마다 다르다면 그건 사실상 신뢰할 수 없는 값이다.

## 그래서 코드에 가드를 하나 넣었다

대단한 해법은 아니다. 두 가지를 했다. 첫째, 요청마다 `num_ctx`를 명시적으로 박았다. 둘째, 응답이 돌아오면 `prompt_eval_count`가 num_ctx에 근접했는지 확인하는 가드를 넣었다. 잘렸을 가능성을 즉시 로그로 잡으려는 것이다.

```python
def guarded_generate(prompt, num_ctx=8192, model="melavisions/gemma4:latest"):
    body = {"model": model, "prompt": prompt, "stream": False,
            "options": {"num_ctx": num_ctx, "num_predict": 256}}
    req = urllib.request.Request("http://localhost:11434/api/generate",
            data=json.dumps(body).encode(), headers={"Content-Type": "application/json"})
    d = json.load(urllib.request.urlopen(req, timeout=600))

    used = d["prompt_eval_count"]
    # 윈도우의 98%를 넘게 채웠으면 잘렸을 가능성이 높다고 보고 경고
    if used >= num_ctx * 0.98:
        print(f"[warn] prompt_eval_count={used} ≈ num_ctx={num_ctx}: "
              f"입력이 잘렸을 수 있음. num_ctx를 키우거나 입력을 줄이세요.")
    return d["response"]
```

이 가드가 truncation을 직접 막아주진 않는다. 다만 잘렸을 때 조용히 넘어가지 않게 만든다. 내 경우엔 이 한 줄 덕분에 회의록 요약 에이전트가 왜 긴 입력에서만 지시를 무시했는지 5분 만에 답이 나왔다. 입력 토큰이 기본 윈도우를 넘으면서 맨 앞 시스템 프롬프트가 날아가고 있었던 것이다. num_ctx를 충분히 키우니 같은 입력에서 지시를 다시 지켰다.

응답을 받고 나서야 아는 사후 가드가 찜찜하면, 보내기 전에 토큰 수를 미리 세는 사전 가드도 가능하다. Ollama에는 별도 토크나이저 엔드포인트가 없어서 나는 `/api/generate`에 `num_predict: 0`을 줘서 생성 없이 `prompt_eval_count`만 받아오는 식으로 길이를 미리 잰다. 한 번의 가벼운 prefill 비용으로 입력이 윈도우에 들어갈지 먼저 확인하는 것이다. 입력이 들쭉날쭉한 RAG 파이프라인이라면, 이 사전 측정으로 num_ctx를 동적으로 키우거나 컨텍스트 청크 수를 줄이는 분기를 넣을 수 있다.

근본 처방을 원하면 선택지는 세 가지다. 요청마다 `options.num_ctx`를 주거나, `OLLAMA_CONTEXT_LENGTH` 환경변수로 서버 기본값을 올리거나, Modelfile에 `PARAMETER num_ctx 32768`을 박아 모델을 다시 굽는 것이다. 셋 다 메모리를 더 먹는다는 비용이 따라온다. num_ctx를 키우면 KV 캐시가 그만큼 커지니, 무작정 크게 잡는 것도 답은 아니다. 입력 길이를 보수적으로 잡되 실제 최대 입력보다 넉넉한 선에서 명시하는 게 내 결론이다.

## 이 실험이 말해주지 않는 것

정직하게 경계를 그어두자. 첫째, 나는 3.2B 양자화 모델 하나로만 쟀다. 잘림 자체는 Ollama 런타임 레벨의 동작이라 모델과 무관하지만, "head가 잘렸을 때 모델이 얼마나 그럴듯하게 환각하는지"는 모델마다 다를 것이다. 더 큰 모델은 "모르겠다"고 답할 수도 있다.

둘째, 비밀 코드를 맨 앞에 둔 건 최악의 경우를 일부러 만든 설정이다. 실제 RAG나 에이전트에서 중요한 정보가 항상 head에 있는 건 아니다. 다만 시스템 프롬프트와 도구 정의는 거의 항상 맨 앞에 오고, 그게 잘리는 게 가장 치명적이라 이렇게 설계했다.

셋째, 기본 num_ctx가 16384로 잡힌 건 내 16GB M1 + Ollama 0.30.7 조합의 결과다. 버전과 메모리, 동시에 떠 있는 모델 수에 따라 달라진다. 그래서 "기본값이 16384다"가 아니라 "기본값은 환경마다 다르니 믿지 마라"가 내가 가져갈 교훈이다.

그리고 솔직히 못 푼 게 하나 남았다. OpenAI 호환 엔드포인트(`/v1/chat/completions`)로도 같은 테스트를 돌려봤는데, 여기선 `options.num_ctx`를 요청마다 줄 방법이 없고 `usage.prompt_tokens`가 `/api/generate`의 `prompt_eval_count`와 다른 숫자(같은 텍스트인데 3464 대 2384)로 찍혔다. 게다가 내 머신에선 긴 입력에서도 head가 살아남아 recall이 됐다. 토큰 집계 방식이 달라서 두 엔드포인트를 1:1로 비교할 수 없다는 것까진 알겠는데, 왜 잘림 거동까지 달라 보였는지는 깔끔하게 설명하지 못하겠다. 다만 [OpenAI 호환 API에서 num_ctx가 안 먹혀 4096으로 조용히 잘린다는 이슈](https://github.com/ollama/ollama/issues/2714)가 실제로 보고돼 있으니, `/v1` 경로를 쓴다면 서버 기본값(`OLLAMA_CONTEXT_LENGTH`)에 전적으로 의존한다는 점은 기억해두는 게 좋다.

[콜드 스타트 때 load_duration을 추적](/ko/blog/ko/local-llm-cold-start-load-duration-experiment)했던 것과 결이 같다. Ollama가 응답에 슬쩍 끼워 돌려주는 숫자들은 문서엔 잘 안 적혀 있어도, 실제 거동을 추적하는 가장 정직한 단서다. `load_duration`이 콜드 스타트를 일러바쳤듯, `prompt_eval_count`는 잘림을 일러바친다. 로컬 모델을 진지하게 굴릴 거면 이 숫자들을 한 번씩 들여다보길 권한다.

## 참고자료

- [Ollama API 레퍼런스](https://github.com/ollama/ollama/blob/main/docs/api.md) — 요청 `options` 안의 `num_ctx`로 Modelfile 컨텍스트 크기를 요청마다 덮어쓰는 방법.
- [Ollama 컨텍스트 길이 문서](https://docs.ollama.com/context-length) — 기본 컨텍스트 윈도우가 가용 메모리에 따라 어떻게 잡히는지(24GiB VRAM 미만이면 4k, 그 이상은 더 크게).
- [Ollama FAQ](https://docs.ollama.com/faq) — 기본 컨텍스트 윈도우 설정과, 컨텍스트가 넘치면 가장 오래된 메시지부터 떨어진다는 설명.
- [Ollama Modelfile 레퍼런스](https://docs.ollama.com/modelfile) — `PARAMETER num_ctx`로 고정 컨텍스트 크기를 모델에 굽는 방법.
