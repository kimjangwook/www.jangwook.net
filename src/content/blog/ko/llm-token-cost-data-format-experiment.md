---
title: 'JSON을 그대로 LLM에 넣지 마라 — 데이터 포맷 9종 토큰 비용 실측'
description: '같은 50개 레코드를 JSON·YAML·CSV·TSV·XML 등 9가지 포맷으로 직렬화해 tiktoken으로 토큰을 직접 측정했다. 평탄한 데이터는 TSV가 pretty JSON 대비 62% 저렴했고, 중첩 데이터는 결론이 뒤집힌다.'
pubDate: '2026-06-21'
heroImage: ../../../assets/blog/llm-token-cost-data-format-experiment.png
tags:
  - llm
  - context-engineering
  - tokenization
relatedPosts:
  - slug: ai-agent-cost-reality
    score: 0.83
    reason:
      ko: 에이전트 운용 비용을 실제 숫자로 따져본 글이다. 포맷 선택으로 토큰을 줄이는 건 그 비용 구조의 한 레버라서 같이 읽으면 그림이 맞춰진다.
      ja: エージェント運用コストを実数で検証した記事。フォーマット選択でトークンを削るのはそのコスト構造の一つのレバーなので、合わせて読むと全体像がつかめる。
      en: Breaks down agent operating cost in real numbers. Cutting tokens via format choice is one lever on that cost structure, so the two posts complete each other.
      zh: 用真实数字拆解智能体运营成本。通过格式选择削减token是该成本结构中的一个杠杆，两篇一起读能拼出全貌。
  - slug: claude-agent-sdk-tool-use-complete-guide-2026
    score: 0.8
    reason:
      ko: 툴이 돌려주는 결과를 어떤 포맷으로 컨텍스트에 넣느냐가 이 실험의 핵심 적용처다. Tool Use를 직접 구현해봤다면 바로 와닿을 것이다.
      ja: ツールが返す結果をどの形式でコンテキストに入れるかが、この実験の主な適用先だ。Tool Useを実装したことがあればすぐ腑に落ちる。
      en: How a tool's result gets serialized into context is the prime place this experiment applies. If you've built Tool Use yourself, it lands immediately.
      zh: 工具返回结果以何种格式进入上下文，正是本实验的主要落地点。亲手实现过Tool Use的人会立刻理解。
  - slug: ollama-structured-outputs-pydantic-local-llm-guide-2026
    score: 0.74
    reason:
      ko: 출력을 구조화 JSON으로 강제하는 쪽 이야기라면, 이 글은 입력으로 들어가는 데이터의 포맷 비용을 다룬다. 입출력 양쪽을 보면 토큰 가계부가 완성된다.
      ja: 出力を構造化JSONに強制する話の裏で、この記事は入力データの形式コストを扱う。入出力の両面を見るとトークン家計簿が完成する。
      en: That post forces output into structured JSON; this one measures the cost of the data going in. Seeing both sides completes your token budget.
      zh: 那篇讲把输出强制为结构化JSON，本文衡量输入数据的格式成本。看清输入输出两端，token账本才算完整。
faq:
  - question: "LLM 토큰이 가장 싼 데이터 포맷은 무엇인가?"
    answer: "데이터 모양에 따라 다르다. 평탄하고 균일한 레코드라면 이 실측에서 TSV가 pretty JSON 대비 62% 적은 토큰으로 가장 쌌고, CSV와 Markdown 표가 바로 뒤를 이었다. 중첩 데이터에서는 표 계열을 쓸 수 없어 compact JSON이 pretty JSON보다 45.7% 싸게 1등을 차지한다. XML은 모든 경우에서 가장 비쌌다."
  - question: "왜 TSV나 CSV가 JSON보다 싼가?"
    answer: "표 계열은 필드 이름을 헤더 한 줄에만 적고 행에서는 값만 나열한다. 반면 JSON은 `\"warehouse\":` 같은 키를 레코드마다 반복하므로, 50개 레코드면 모든 키가 50번씩 반복되고 그걸 감싸는 따옴표와 중괄호까지 붙는다. 50개 평탄 레코드 기준 pretty JSON은 레코드당 약 82토큰, TSV는 31토큰으로 같은 데이터에 2배 이상 차이가 났다."
  - question: "평탄 데이터와 중첩 데이터에서 가장 싼 포맷이 달라지나?"
    answer: "그렇다. 결론이 뒤집힌다. CSV·TSV·Markdown 표는 가변 길이 배열이나 중첩 객체를 담을 수 없어 후보에서 빠진다. 중첩 데이터에서는 compact JSON(separators를 준 json.dumps)이 pretty JSON 대비 45.7% 싸게 가장 저렴했다. 규칙은 간단하다. 균일한 행은 표 계열, 중첩 구조는 compact JSON."
  - question: "토큰 비용을 직접 측정하려면 어떻게 하나?"
    answer: "OpenAI의 tiktoken 라이브러리를 쓰면 된다. 모델에 맞는 인코딩을 불러오고(GPT-4o·GPT-5 계열은 o200k_base, 구형 GPT-4·3.5는 cl100k_base) len(enc.encode(직렬화_문자열))로 센다. 같은 데이터를 여러 포맷으로 직렬화해 비교하면 \"글자 수 × 0.75\" 어림 대신 포맷별 실제 차이를 바로 볼 수 있다."
---

에이전트에 상품 카탈로그 50줄을 컨텍스트로 물려야 했다. 평소 하던 대로 `json.dumps(records, indent=2)`로 예쁘게 찍어 넣었는데, 토큰 카운터를 보니 4천 토큰을 넘겼다. 데이터 자체는 그대로인데 들여쓰기와 따옴표가 토큰의 절반 가까이를 먹고 있는 게 아닐까 하는 의심이 들었다. 그래서 같은 데이터를 9가지 포맷으로 직렬화한 뒤 실제 토크나이저로 세어봤다.

결론부터: **데이터 모양이 평탄하면 TSV가 pretty JSON보다 62% 싸다.** 그런데 데이터가 중첩되면 이 결론이 통째로 뒤집힌다. 그 경계가 어디인지 직접 재보며 정리했다.

## 측정 환경: 추측 대신 tiktoken으로 센다

토큰 비용은 "대충 글자 수 × 0.75" 같은 어림으로 자주 이야기되는데, 포맷별 차이는 그렇게 잡히지 않는다. 그래서 OpenAI가 공개한 [tiktoken](https://github.com/openai/tiktoken)을 그대로 썼다. GPT-4o·o-series·GPT-5 계열이 쓰는 `o200k_base`와, 구형 GPT-4 계열의 `cl100k_base` 두 인코딩을 같이 돌렸다.

테스트 데이터는 현실적인 "툴 결과"를 흉내 냈다. 상품 레코드 50개, 각각 `id`·`sku`·`name`·`category`·`price`·`stock`·`warehouse`·`status`·`rating` 9개 필드를 갖는 평탄한 배열이다. 이걸 9가지 포맷으로 찍어 각각 토큰을 셌다.

```python
import json, io, csv, yaml, tomli_w, tiktoken

records = json.load(open("records.json"))  # 50개 평탄 레코드
enc = tiktoken.get_encoding("o200k_base")  # GPT-4o / GPT-5 계열

def tok(s): return len(enc.encode(s))

print("pretty :", tok(json.dumps(records, indent=2)))
print("compact:", tok(json.dumps(records, separators=(",",":"))))
print("csv    :", tok(to_csv(records)))
```

샌드박스는 repo 밖 `mktemp -d` 디렉터리에서 돌렸고, 결과 로그와 차트만 남기고 환경은 지웠다. 이런 1회성 검증 환경을 분리하는 습관은 [에이전트를 8체 굴리며 비용을 따졌던 경험](/ko/blog/ko/ai-agent-cost-reality)에서 굳어진 것이다. 토큰을 줄이는 일은 결국 그 비용 가계부의 한 줄이다.

## 평탄한 데이터: TSV가 압도적으로 싸다

50개 평탄 레코드를 9가지로 직렬화한 실측 결과다. `o200k_base` 기준, pretty JSON(4128 토큰)을 0%로 잡았다.

| 포맷 | 글자 수 | o200k 토큰 | cl100k 토큰 | pretty JSON 대비 |
|---|---|---|---|---|
| TSV | 3,742 | **1,568** | 1,663 | −62.0% |
| CSV | 3,742 | 1,650 | 1,650 | −60.0% |
| Markdown 표 | 4,766 | 1,897 | 1,897 | −54.0% |
| JSON (compact) | 7,985 | 2,578 | 2,593 | −37.5% |
| key: value 줄 | 6,982 | 2,708 | 2,708 | −34.4% |
| YAML | 7,834 | 3,159 | 3,159 | −23.5% |
| TOML | 8,533 | 3,176 | 3,191 | −23.1% |
| JSON (pretty) | 10,986 | 4,128 | 4,143 | 0.0% |
| XML | 13,654 | 4,777 | 4,778 | +15.7% |

![데이터 포맷별 LLM 토큰 비용 막대 그래프 — 같은 50개 레코드를 TSV로 넣으면 pretty JSON 대비 62% 적은 토큰을 쓴다](../../../assets/blog/llm-token-cost-data-format-experiment.png)

가장 눈에 띄는 건 pretty JSON과 TSV 사이가 2.6배라는 점이다. 같은 정보다. 모델이 받는 사실은 한 글자도 안 달라진다. 그런데 들여쓰기 2칸, 키 이름 반복, 따옴표, 중괄호가 토큰을 2.6배로 부풀린다. XML은 여기서 한술 더 떠 닫는 태그까지 모든 필드를 두 번 적으니 pretty JSON보다도 16% 비싸다. 나는 XML을 LLM 입력 포맷으로 쓰는 선택은 거의 항상 손해라고 본다.

CSV/TSV/Markdown 표가 싼 이유는 단순하다. **키 이름을 헤더 한 줄에만 적고, 50개 행에서는 값만 나열하기 때문이다.** JSON 계열은 레코드마다 `"warehouse":` 같은 키를 50번 반복한다. 필드가 많고 행이 길수록 이 반복 비용이 커진다.

숫자로 쪼개보면 더 분명하다. pretty JSON은 4,128토큰을 50개 레코드가 나눠 가지니 레코드당 약 82토큰이다. TSV는 헤더 한 줄(약 18토큰)을 빼면 1,550토큰을 50줄이 나눠 가져 레코드당 31토큰꼴이다. 같은 9개 필드를 한 줄에 담는데, 한쪽은 82토큰을 쓰고 한쪽은 31토큰을 쓴다. 차이의 정체는 데이터가 아니라 키 이름 9개 × 50회 반복, 그리고 그걸 감싸는 따옴표와 중괄호다. 모델 입장에서 `"category":"books"`와 `books`는 같은 사실인데, 앞쪽은 그 사실을 전달하는 데 토큰을 서너 배 쓴다.

## 키 반복이 비싼 게 아니라, 보일러플레이트가 비싸다

여기서 한 가지 오해를 짚고 싶다. "JSON이 느리다"가 아니라 "구조 표시 문자가 비싸다"가 정확한 표현이다. compact JSON이 pretty JSON보다 37.5% 싼 건 키 개수가 줄어서가 아니다. 키는 똑같이 50번 반복된다. 줄어든 건 들여쓰기 공백과 줄바꿈뿐이다.

```text
indent 2칸 "  "  -> 1 token (220)
3 commas  ",,,"  -> 1 token
```

`o200k_base`에서 2칸 들여쓰기는 그 자체로 토큰 하나(ID 220)를 차지한다. 50개 레코드가 각각 9개 필드를 2칸씩 들여쓰면, 이 공백 토큰만 수백 개가 깔린다. 거기에 줄마다 줄바꿈, 객체마다 여는/닫는 중괄호가 더해진다. 사람 눈엔 가독성이지만 모델 눈엔 그냥 비용이다. 그래서 나는 "사람이 직접 읽을 게 아니면 pretty 금지"를 기본값으로 삼기로 했다.

## TSV가 CSV보다 미세하게 싼 건 우연에 가깝다

표를 보면 TSV(1,568)가 CSV(1,650)보다 82토큰 적다. 글자 수는 3,742로 완전히 같은데 토큰만 다르다. 처음엔 "탭이 콤마보다 토큰 효율이 좋은가?" 싶어 따로 재봤다.

```text
comma row -> "in_stock,4521,electronics,12.5"   -> 12 tokens
tab row   -> "in_stock\t4521\telectronics\t12.5" -> 12 tokens
```

한 줄 단위로는 콤마든 탭이든 똑같이 12토큰이다. 구분자 자체가 싼 게 아니다. 차이는 BPE(Byte Pair Encoding)가 문서 전체에서 인접 바이트를 병합하는 과정에서, 탭과 그 주변 값이 우연히 더 잘 합쳐졌기 때문이다. 그래서 나는 이 5% 차이를 "TSV를 써라"의 근거로 일반화하지 않는다. **헤더 한 줄 + 값만 나열하는 표 계열을 골랐다는 큰 결정이 95%고, 탭이냐 콤마냐는 나머지 5%의 노이즈다.** 정직하게 말하면 그 5%는 데이터에 따라 뒤집힐 수 있다.

다만 실무 팁은 하나 분명하다. 들여쓰기는 비싸다. pretty JSON의 2칸 들여쓰기(`"  "`)는 그 자체로 토큰 하나를 차지하고, 50개 레코드 × 9개 필드면 그 토큰이 수백 번 깔린다. 사람이 읽을 게 아니라면 `indent`를 빼는 것만으로 JSON에서 37.5%가 빠진다.

## 중첩 데이터에서는 결론이 뒤집힌다

여기서 멈췄으면 "무조건 CSV"라는 틀린 교훈을 얻었을 것이다. 그래서 모양이 다른 데이터를 한 번 더 쟀다. 주문 20건인데, 각 주문이 고객 객체(주소까지 중첩)와 가변 길이 품목 배열을 갖는 중첩 구조다.

| 포맷 | o200k 토큰 | pretty JSON 대비 |
|---|---|---|
| JSON (compact) | **1,538** | −45.7% |
| YAML | 1,958 | −30.9% |
| TOML | 2,021 | −28.7% |
| JSON (pretty) | 2,835 | 0.0% |

CSV·TSV·Markdown 표는 아예 후보에서 빠진다. 가변 길이 품목 배열과 중첩 객체를 2차원 표에 우겨넣을 방법이 없기 때문이다. 그리고 평탄 데이터에서 −34%로 중위권이던 compact JSON이, 중첩에서는 −45.7%로 1등이 된다. YAML은 평탄에서나 중첩에서나 들여쓰기 비용 때문에 생각만큼 싸지 않았다. "YAML이 사람도 읽기 좋고 토큰도 적다"는 통념은 적어도 이 측정에서는 맞지 않았다.

정리하면 경계는 이렇다. **데이터가 균일한 행이면 표 계열(CSV/TSV/Markdown), 중첩되면 compact JSON.** 이 한 줄이 오늘 실험에서 건진 가장 쓸모 있는 규칙이다.

## 에이전트 루프에서 이 차이가 복리로 붙는다

토큰 몇 천 개가 별것 아닌 것 같지만, 에이전트는 같은 컨텍스트를 매 턴 다시 보낸다. 50개짜리 카탈로그를 pretty JSON으로 시스템 프롬프트에 박아두고 30턴짜리 대화를 돌린다고 하자. 포맷만 TSV로 바꿔도 턴당 약 2,560토큰(4,128 → 1,568)이 빠진다. 30턴이면 7만 6천 토큰이다. 컨텍스트 윈도가 빠듯한 모델에서는 이게 "들어가느냐 마느냐"를 가르고, 과금 모델에서는 그대로 입력 토큰 비용이다.

여기서 한 가지 반론이 나올 수 있다. "프롬프트 캐싱을 쓰면 같은 컨텍스트는 싸지지 않나?" 맞다. 시스템 프롬프트에 고정으로 박힌 카탈로그라면 캐시 히트로 비용이 크게 준다. 그런데 캐싱은 토큰 수 자체를 줄이지 않는다. 캐시된 토큰도 컨텍스트 윈도 한도는 그대로 잡아먹고, 캐시는 보통 짧은 TTL이 지나면 만료돼 다시 전체 가격으로 채워진다. 게다가 툴 결과처럼 매 턴 내용이 바뀌는 데이터는 애초에 캐시 대상이 못 된다. 포맷으로 토큰을 줄이는 건 캐싱과 경쟁하는 기법이 아니라 보완하는 기법이다. 둘 다 켜면 둘 다 이득이다.

이건 MCP 툴이 큰 결과를 돌려줄 때 특히 크게 작용한다. [FastMCP로 만든 서버](/ko/blog/ko/fastmcp-python-mcp-server-build-guide-2026)가 DB 조회 결과를 그대로 JSON으로 반환하면, 그 포맷이 곧 모델 입력 비용이다. 서버 쪽에서 평탄한 결과를 CSV/TSV로 직렬화해 돌려주는 작은 결정 하나가 에이전트 전체의 토큰 가계부를 바꾼다.

물론 한계도 분명하다. 나는 토큰 수만 쟀지, **모델이 각 포맷을 똑같이 잘 이해하는지는 측정하지 않았다.** API 호출 없이 재현 가능한 범위가 여기까지여서다. 직관적으로는 CSV처럼 헤더-값 거리가 먼 포맷이 필드 많은 데이터에서 모델을 헷갈리게 할 수 있다고 본다. 헤더가 위에 한 번뿐이라 30번째 행의 7번째 값이 무슨 필드인지 모델이 위치로 세야 하기 때문이다. 토큰을 아끼려다 정확도를 잃으면 본전도 못 찾는다. 그래서 실제 적용할 땐 토큰 절감과 응답 품질을 한 번은 같이 A/B로 봐야 한다. 이 검증은 다음 실험으로 미룬다.

## 내일부터 바로 적용할 것

오늘 실측으로 내 기본값을 이렇게 바꿨다.

- 평탄한 레코드 배열을 컨텍스트에 넣을 땐 CSV 또는 Markdown 표. pretty JSON 금지.
- 중첩 구조는 `json.dumps(x, separators=(",",":"))`로 compact하게. 사람이 디버깅용으로 볼 때만 `indent=2`.
- LLM 입력에 XML은 쓰지 않는다. 같은 정보에 토큰을 가장 많이 먹는다.
- 포맷을 바꿔 토큰을 크게 줄였다면, 그 포맷에서 모델 정확도가 유지되는지 한 번은 확인한다.

데이터 포맷은 코드에서 거의 자동으로 정해지는 값이라 평소 의식하지 않는다. 그런데 LLM 컨텍스트에 들어가는 순간, 그 무심한 `indent=2` 하나가 토큰 청구서의 절반을 만들 수 있다. 직접 재보기 전엔 나도 그 크기를 과소평가하고 있었다.

## 참고자료

- [tiktoken (OpenAI)](https://github.com/openai/tiktoken) — OpenAI 공식 BPE 토크나이저. 이 글의 모든 토큰 측정과 `o200k_base`·`cl100k_base` 인코딩에 사용한 라이브러리다.
- [JSON 명세 (json.org)](https://www.json.org/json-en.html) — JSON 교환 포맷의 표준 레퍼런스. 이 실험의 기준 포맷이다.
- [YAML 1.2.2 명세 (yaml.org)](https://yaml.org) — YAML 공식 명세. 토큰 비용을 끌어올리는 들여쓰기 규칙을 이해하는 데 유용하다.
- [TOML 명세 (toml.io)](https://toml.io) — TOML 공식 명세. 측정한 9개 포맷 중 하나다.

> 측정 코드와 전체 로그는 샌드박스에서 1회 실행 후 `docs/evidence/llm-token-cost-data-format-experiment.md`에 보존했다. tiktoken 0.12.0, Python 3.12.8 기준.
