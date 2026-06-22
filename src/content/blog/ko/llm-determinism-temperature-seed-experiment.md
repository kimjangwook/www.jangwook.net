---
title: '로컬 LLM은 같은 답을 두 번 줄까 — temperature와 seed로 출력 재현성 직접 측정'
description: >-
  같은 프롬프트를 로컬 Gemma 4에 수십 번 던져 LLM 출력 재현성을 직접 측정한 실험 기록이다. temperature=0은 완전히 결정적이었고,
  온도를 올려도 seed를 고정하면 출력이 한 줄로 수렴했다. 평가와 CI 테스트에 바로 적용할 결론과 권장 설정값까지 정리한다.
pubDate: '2026-06-22'
heroImage: '../../../assets/blog/llm-determinism-temperature-seed-experiment/hero.png'
tags:
  - 로컬LLM
  - Ollama
  - LLM평가
  - 재현성
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
  - question: "temperature=0이면 항상 같은 답이 나오나요?"
    answer: "제 노트북에서 Ollama로 측정했을 때는 그랬습니다. 같은 프롬프트를 모델 두 개에 각각 12〜15번 던졌고 temperature=0에서는 전부 한 가지 출력만 나왔습니다. 다만 ollama 이슈 #586처럼 OS나 실행 시점에 따라 미세하게 달라진다는 보고도 있어, '내 환경에서 결정적'과 '어디서나 결정적'은 구분해야 합니다."
  - question: "재현성을 원하면 temperature와 seed 중 무엇을 고정해야 하나요?"
    answer: "둘 다입니다. temperature=0이면 greedy 디코딩이라 seed가 사실상 의미 없지만, temperature를 올려 다양성을 쓰면서도 재현이 필요하면 seed를 고정해야 합니다. 제 측정에서 temperature=0.8 + seed 고정은 출력이 한 줄로 수렴했고, 별도 프로세스에서 다시 돌려도 같은 문장이 나왔습니다."
  - question: "로컬에서 결정적이면 OpenAI나 Claude API에서도 결정적인가요?"
    answer: "아닙니다. 클라우드 추론 서버는 여러 요청을 묶어 배치로 처리하는데, 부하에 따라 배치 크기가 달라지면서 같은 프롬프트도 수치 경로가 갈립니다. Thinking Machines의 'Defeating Nondeterminism in LLM Inference'가 이 배치 불변성 문제를 설명합니다. 저는 이 부분을 직접 재현하지 못했고, 문서를 근거로만 인용합니다."
  - question: "gemma4:12b 모델이 빈 응답을 준 건 왜인가요?"
    answer: "커뮤니티가 올린 gemma4:12b-it-qat 빌드가 /api/generate와 /api/chat 양쪽에서 eval_count는 올라가는데 content가 빈 문자열로 나왔습니다. 토큰은 생성됐지만 화면에 보이는 텍스트로 매핑되지 않은 패키징 문제로 보입니다. 그래서 결정성 표에서는 제외했습니다."
---

평가 스크립트를 두 번 돌렸는데 점수가 달랐다. 코드도, 프롬프트도, 모델도 그대로였다. 바뀐 건 아무것도 없는데 통과하던 케이스 하나가 떨어졌다.

처음엔 내가 뭘 잘못 만졌나 싶었다. 그런데 다시 돌리니 또 통과했다. 그제서야 의심이 모델 자체로 옮겨갔다. LLM은 같은 입력에 같은 답을 주는 함수가 아니다. 이걸 머리로는 알고 있었는데, 막상 평가 파이프라인이 흔들리니 "그럼 대체 무엇을 고정해야 출력이 재현되는가"라는 질문이 구체적으로 다가왔다.

그래서 직접 재봤다. 클라우드 API 말고, 내가 끝까지 통제할 수 있는 로컬 Ollama + Gemma 4 환경에서. 같은 프롬프트를 수십 번 던지고 출력을 해시로 묶어 몇 가지 종류가 나오는지 셌다. 결론부터 말하면, 내 환경에서 재현성을 결정한 건 딱 두 개의 파라미터였다.

## 바꾼 게 없는데 결과가 흔들리는 이유부터

LLM이 토큰을 고르는 마지막 단계는 확률 분포에서 하나를 뽑는 샘플링이다. 이 샘플링의 성격을 바꾸는 게 `temperature`다. temperature가 0이면 분포에서 가장 확률 높은 토큰을 매번 그냥 집는다(greedy). 무작위성이 들어갈 틈이 없으니 이론상 결정적이어야 한다. temperature를 올리면 2등, 3등 토큰도 뽑힐 여지가 생기고, 그 무작위 추첨을 지배하는 게 `seed`다.

한 가지 더 짚어둘 파라미터는 `num_predict`다. 생성할 최대 토큰 수인데, 이게 짧으면 모델이 갈라질 구간 자체가 적어 결정성이 좋아 보이고, 길면 뒤로 갈수록 미세한 차이가 누적될 여지가 커진다. 그래서 나는 짧은 태그라인(약 40토큰)으로 깔끔한 신호를 먼저 잡고, 긴 출력은 별도로 시험했다. 결과적으로 이 긴 출력 시험에서 앞서 말한 빈 응답 문제를 만났는데, 그 얘기는 뒤에서 다룬다.

여기까지는 문서에 다 적힌 이야기다. 문제는 이 이론이 내 노트북에서 실제로 그대로 작동하느냐다. ollama 이슈 트래커만 봐도 "seed를 고정했는데 답이 바뀐다"(#4660), "temperature=0 + seed 고정인데도 첫 실행과 두 번째 실행이 미세하게 다르다"(#586) 같은 보고가 줄줄이 올라온다. 그래서 믿지 말고 재보기로 했다.

## 같은 프롬프트를 수십 번 던지는 실험 설계

실험 환경은 repo 밖 임시 디렉터리에 만들었다. Ollama 0.30.7, Apple Silicon, 모델은 두 개를 썼다. 하나는 2GB짜리 작은 Gemma 4 빌드, 하나는 9.6GB짜리 `gemma4:e4b`. 크기가 다른 모델에서 같은 패턴이 보이는지 확인하려는 의도였다.

측정 방법은 단순하다. 똑같은 프롬프트를 한 조건당 12〜15번 보내고, 각 출력을 SHA-256으로 해시한 뒤 서로 다른 해시가 몇 개인지 센다. 1이면 완전히 결정적, 숫자가 클수록 출력이 흩어진다는 뜻이다.

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

조건은 다섯 가지로 나눴다. temperature=0 / temperature>0 각각에 대해 seed를 고정한 경우와 안 한 경우, 그리고 마지막으로 seed를 고정한 채 파이썬 프로세스를 새로 띄워 한 번 더 돌리는 경우다. 마지막 조건이 중요한데, "같은 프로세스 안에서 재현되는 것"과 "프로세스를 껐다 켜도 재현되는 것"은 평가/CI 관점에서 전혀 다른 보증이기 때문이다.

프롬프트는 변주 여지가 있는 생성형으로 골랐다. "새 AI 코딩 어시스턴트의 짧은 마케팅 태그라인 한 줄을 써라." 정답이 하나로 좁혀지지 않는 과제라야 다양성이 드러난다. 만약 "2+2는?" 같은 닫힌 질문을 썼다면 temperature를 올려도 거의 안 흩어졌을 것이고, 그러면 seed의 효과를 관찰할 수 없다.

지표는 두 개를 같이 봤다. 하나는 방금 말한 distinct 개수, 다른 하나는 majority share다. majority share는 가장 자주 나온 출력 하나가 전체 N번 중 몇 번을 차지했는지의 비율이다. distinct가 5라도 그중 하나가 11번이면 사실상 거의 안정적이라는 뜻이고, 5종이 고르게 흩어졌으면 majority share가 0.3 근처로 떨어진다. 분포의 모양을 한 숫자로 압축하기엔 이 둘을 같이 보는 게 안전하다고 판단했다.

## 측정 결과: 결정 요인은 둘뿐이었다

![두 로컬 모델에서 조건별 distinct output 개수](../../../assets/blog/llm-determinism-temperature-seed-experiment/hero.png)

표로 보면 패턴이 더 또렷하다.

| 조건 | gemma4 ~2GB (N=15) | gemma4:e4b 9.6GB (N=12) |
|------|------|------|
| temperature=0, seed 없음 | 1종 (결정적) | 1종 (결정적) |
| temperature=0, seed 고정 | 1종 | 1종 |
| temperature>0, seed 없음 | **5종** | **7종** |
| temperature>0, seed 고정 | 1종 | 1종 |
| temperature>0, seed 고정 (프로세스 재실행) | 1종 | 1종 |

![조건별 측정 결과 로그](../../../assets/blog/llm-determinism-temperature-seed-experiment/results-table.png)

읽히는 이야기는 이렇다. temperature=0에서는 두 모델 다 출력이 한 종류뿐이었다. 15번, 12번을 던져도 글자 하나 안 틀리고 같은 문장이 나왔다. seed를 줘도 안 줘도 결과는 같았다. greedy 디코딩에서는 seed가 할 일이 없다는 게 그대로 확인됐다.

흩어진 건 정확히 한 칸, temperature>0에 seed가 없을 때뿐이다. 2GB 모델은 15번 중 5종, 9.6GB 모델은 12번 중 7종으로 갈라졌다. 그런데 같은 temperature에서 seed만 42로 고정하자 다시 1종으로 붙었다. 더 인상적인 건 마지막 줄이다. 파이썬 프로세스를 완전히 새로 띄워 다시 돌렸는데도 seed가 같으니 똑같은 문장이 나왔다. "Code faster, effortlessly smart." 두 번의 독립 실행이 글자 단위로 일치했다.

실제로 나온 문장을 보면 감이 더 온다. temperature=0에서는 2GB 모델이 매번 "Code Smarter, Not Harder"만 뱉었다. temperature를 0.8로 올리고 seed를 떼자 "Code Smarter, Not Harder", "Code Smarter, Not Harder with Ada" 같은 변주가 섞여 나왔다. 그런데 seed를 42로 박으니 "Code Smarter, Not Harder with Ada" 한 줄로 굳었고, 프로세스를 새로 띄운 재실행에서도 그 한 줄이 그대로 나왔다. 9.6GB 모델도 똑같았다. seed 없는 temperature 0.8에서 "Code faster, smarter, effortlessly" 류로 7종까지 갈렸다가, seed 고정에서 "Code faster, effortlessly smart"로 수렴했다.

majority share로 보면 차이가 더 선명하다. seed 없는 temperature 0.8에서 9.6GB 모델의 majority share는 0.333이었다. 가장 흔한 출력조차 세 번에 한 번꼴이라는 뜻이다. 나머지 모든 조건에서는 majority share가 1.0, 즉 전부 같은 출력이었다.

나는 이 결과가 깔끔해서 오히려 한 번 더 의심했다. 그래서 모델을 바꿔 다시 돌렸고, 크기가 5배 차이 나는 두 모델에서 같은 패턴이 나왔다. 적어도 내 환경에서는 재현성을 좌우한 변수가 temperature와 seed 둘로 충분했다.

## 빈 응답 하나가 더 큰 교훈을 줬다

원래는 12B짜리 `gemma4:12b-it-qat`를 주력으로 쓰려 했다. 그런데 이 커뮤니티 빌드는 끝까지 빈 문자열만 돌려줬다. `/api/generate`로 보내도, `/api/chat`으로 보내도 `done_reason`은 `length`, `eval_count`는 40, 200으로 멀쩡히 올라가는데 정작 `content`는 빈 문자열이었다.

```text
content repr: ''
done_reason: length   eval_count: 200
```

토큰은 분명히 생성됐다. 28초씩 GPU가 돌았다. 그런데 사용자에게 보이는 텍스트로는 아무것도 안 나왔다. 이 QAT 빌드의 채팅 템플릿이 깨졌거나, 모델이 보이지 않는 제어 토큰만 뱉은 것으로 보인다. 정확한 원인까지는 내 전문 범위 밖이라 단정하지 않겠다.

다만 여기서 얻은 교훈은 분명하다. "모델이 돌았다"와 "모델이 답했다"는 다른 명제다. eval_count만 보고 성공으로 처리하는 파이프라인이었다면 이 빈 응답이 그대로 평가 데이터에 섞여 들어갔을 것이다. 출력 길이가 0인 응답을 거르는 가드 하나가 왜 필요한지, 이 실패가 코드 한 줄보다 설득력 있게 알려줬다. 실패도 글감이라는 말을 이번에 다시 실감했다. 로컬 모델을 다룰 때 이런 패키징 변수는 [Ollama 구조화 출력을 다룬 글](/ko/blog/ko/ollama-structured-outputs-pydantic-local-llm-guide-2026)에서도 작은 모델의 스키마 처리 한계로 비슷하게 겪은 적이 있다.

## 내 노트북에서 맞는다고 클라우드에서도 맞는 건 아니다

여기서 선을 분명히 긋고 싶다. 내가 측정한 건 "로컬 Ollama에서, 요청을 하나씩 순차적으로 보낼 때"의 결정성이다. 이 조건을 OpenAI나 Claude 같은 클라우드 API로 옮기면 이야기가 달라진다.

왜 달라지는지에 대해선 Thinking Machines가 2025년 9월에 낸 "Defeating Nondeterminism in LLM Inference"가 가장 설득력 있는 설명을 준다. 흔히 "GPU 부동소수점 연산이 비결정적이라 그렇다"고 말하지만, 이 글은 진짜 원인을 다른 데서 찾는다. 추론 서버는 여러 사용자의 요청을 묶어 배치로 처리하는데, 그 순간의 서버 부하에 따라 배치 크기가 들쭉날쭉 바뀐다. 그리고 핵심 커널들이 배치 크기에 따라 미세하게 다른 수치 경로를 타기 때문에, 같은 프롬프트도 greedy 디코딩에서조차 다른 토큰으로 갈라질 수 있다는 것이다. 내가 이해하기로는, 비결정성의 진짜 범인은 무작위성이 아니라 "내 요청이 그때그때 다른 크기의 배치에 끼어든다"는 점이다.

로컬 ollama도 완전히 안전지대는 아니다. ollama 이슈 #586에는 같은 seed, 같은 temperature=0, 같은 num_ctx인데도 첫 실행과 두 번째 실행의 출력이 미세하게 달랐다는 보고가 있고, 더 흥미롭게도 같은 코드가 Ubuntu와 Windows에서 서로 다른 "고정된" 출력을 냈다는 관찰도 있다. 즉 결정성은 플랫폼에 묶인 성질일 수 있다. 내 측정이 깨끗했던 건 한 대의 Mac에서, 한 버전의 ollama로, 짧은 출력을 받았기 때문일 가능성이 크다. 출력이 길어지고 num_ctx가 커질수록 미세한 수치 차이가 누적돼 갈라질 여지도 커진다.

나는 이 배치 비결정성을 직접 재현하지는 못했다. 동시 부하를 거는 환경을 만들지 않았기 때문이다. 그래서 이 부분은 문서를 근거로만 인용한다. 내가 손으로 확인한 범위는 어디까지나 "순차 요청 + 로컬 + 짧은 출력"이다. 이 경계를 흐리면 내 글도 검증 안 된 주장을 사실처럼 파는 글이 된다.

그래서 솔직히 말하면, 평가의 재현성을 클라우드 API 위에 세우는 건 생각보다 까다롭다. seed 파라미터를 받아주는 API라도 배치 비결정성까지 막아주지는 않는다. 이게 LLM 평가가 단위 테스트처럼 깔끔하게 떨어지지 않는 근본 이유라고 본다.

## 평가와 에이전트 테스트에 바로 적용할 것

측정을 끝내고 내 워크플로우에 바로 반영한 것들이다.

첫째, 회귀 평가는 temperature=0 + seed 고정으로 못 박는다. 출력의 "품질"을 보는 평가가 아니라 "달라졌는지"를 보는 회귀 테스트라면, 모델의 창의성은 필요 없다. 재현 가능한 한 가지 출력으로 고정해 두고 그게 바뀌는 순간을 잡는 게 낫다. 내 환경에서 이 조합은 프로세스를 새로 띄워도 같은 문장을 줬으니 CI에 걸기에 충분하다.

둘째, 단 한 번의 실행을 근거로 결론 내리지 않는다. temperature를 올려 쓰는 기능(태그라인 생성처럼 다양성이 가치인 경우)은 본질적으로 흩어진다. 이런 출력을 평가할 때는 한 번 돌려 "됐다/안 됐다"를 판정하면 안 되고, N번 돌려 분포로 봐야 한다. 내 측정에서 7/12까지 갈라진 걸 보면, 한 번의 운 좋은 출력으로 기능을 판단하는 게 얼마나 위험한지 알 수 있다.

셋째, 출력 유효성 가드를 평가 앞단에 둔다. 빈 응답을 준 12B 모델 사례가 직접적인 이유다. 길이 0, JSON 파싱 실패, 기대 필드 누락 같은 경우를 "실패"로 명시적으로 분류하지 않으면, 깨진 모델이 멀쩡한 점수로 둔갑한다. 내가 회귀 테스트에 쓰는 골격은 이 정도로 단순하다.

```python
def assert_reproducible(model, prompt, expected_hash, n=5):
    outs = [gen(model, prompt, temperature=0, seed=42) for _ in range(n)]
    # 1) 빈 응답 가드 — "돌았다"와 "답했다"를 분리
    assert all(len(o) > 0 for o in outs), "empty output detected"
    # 2) 같은 실행 안에서 한 종류로 고정되는지
    hashes = {hashlib.sha256(o.encode()).hexdigest()[:12] for o in outs}
    assert len(hashes) == 1, f"non-deterministic: {len(hashes)} variants"
    # 3) 이전에 박아둔 기대 출력과 일치하는지
    assert hashes.pop() == expected_hash, "output drifted from baseline"
```

기대 해시를 한 번 박아두면, 모델 버전이나 ollama 업그레이드로 출력이 바뀌는 순간을 CI가 잡아준다. 이게 "LLM은 테스트할 수 없다"는 흔한 체념에 대한 내 반론이다. 전부는 못 해도, 재현 조건을 통제한 일부는 분명히 테스트할 수 있다.

에이전트로 넓혀 봐도 같다. 에이전트의 도구 호출 시퀀스를 회귀 테스트하려면 그 시퀀스가 재현돼야 한다. 로컬 모델로 [완전 오프라인 MCP 서버를 만든 경험](/ko/blog/ko/local-llm-private-mcp-server-gemma4-fastmcp)이 있다면, 그 위에서 seed를 고정해 도구 호출을 재현하는 건 비교적 통제 가능하다. 반면 클라우드 LLM 위의 에이전트는 배치 비결정성 때문에 같은 보증을 받기 어렵다. 결국 "어디서 추론하느냐"가 "테스트를 얼마나 단단하게 짤 수 있느냐"를 정한다는 게 이번 실험의 가장 실용적인 수확이었다.

다음엔 동시 요청을 거는 환경을 만들어 로컬 ollama에서도 배치 비결정성이 재현되는지 직접 확인해 볼 생각이다. 그게 되면 "로컬은 안전하다"는 내 잠정 결론에도 단서가 붙을 것이다.

## 참고자료

- [Ollama API 문서 — 생성 옵션](https://github.com/ollama/ollama/blob/main/docs/api.md): `temperature`와 `seed`를 담는 `options` 객체, 그리고 재현 가능한 출력을 위해 `seed`에 숫자를 지정하라는 안내가 있다.
- [Ollama Modelfile 레퍼런스](https://docs.ollama.com/modelfile): `PARAMETER` 지시어로 `seed`("같은 프롬프트에 같은 텍스트를 생성")와 `temperature`를 정의한다.
- [OpenAI Cookbook — seed 파라미터로 재현 가능한 출력](https://developers.openai.com/cookbook/examples/reproducible_outputs_with_the_seed_parameter): 클라우드에서 `seed`와 `system_fingerprint`가 맞아도 출력이 "대체로 동일"할 뿐 보장은 아니라는 이유를 설명한다.
- [Thinking Machines — Defeating Nondeterminism in LLM Inference](https://thinkingmachines.ai/blog/defeating-nondeterminism-in-llm-inference/): 본문에서 인용했지만 직접 재현하지 못한 클라우드 비결정성의 배치 불변성 논거.
