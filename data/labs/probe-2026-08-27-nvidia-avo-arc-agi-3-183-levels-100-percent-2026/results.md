## cells
- verbatim-public-form — 6/6 hit — exit 0,0,0,0,0,0 — raw 6개 전부 `HIT`. 대조군·하네스 점검 통과, 나머지 셀 수치를 읽어도 된다
- color-permuted — 6/6 hit — exit 0,0,0,0,0,0 — 색 라벨 전단사(0>0,1>5,2>9,3>4,4>2,5>8,6>1,7>7,8>3,9>6) 치환 후에도 verbatim 과 동일. 하락 0회
- transposed — 6/6 hit — exit 0,0,0,0,0,0 — 모든 격자 전치. 하락 0회. 계획서가 예상 폭을 4~6/6 으로 넓게 잡았던 유일한 셀인데 상한에 붙었다
- permuted-and-transposed — 6/6 hit — exit 0,0,0,0,0,0 — 색 치환+전치 동시 적용, 가장 먼 표면 형태. 하락 0회
- example-order-reversed — 6/6 hit — exit 0,0,0,0,0,0 — falsifier 셀. 격자 원본 유지, 예시 쌍 순서만 반전. 6/6 이므로 폐기 조건 (b) 미발동, 위 네 셀의 수치는 유효하다
- perturbation-is-lossless — 미실행 0/3 — raw 없음, results.jsonl 에 "실행 예산 소진" 기록. 이 셀이 빠졌으므로 status 는 partial
  - 미실행분 중 확인 가능한 부분: PERM 의 치역이 {0,5,9,4,2,8,1,7,3,6} 으로 0~9 의 순열이라 색 사상이 전단사라는 것은 정의만으로 성립한다. 실제 격자에 대한 왕복 항등(rec∘rec⁻¹) 과 전치 대합(tr∘tr) 검증, 격자 개수·shape 목록 출력은 수행되지 않았다

## totals
- 실행 셀 5 / 계획 셀 6, 실행 런 30 / 계획 런 33, HIT 30, MISS 0, non-zero exit 0, 105초 타임아웃(종료코드 142) 0회
- 과제는 ARC-AGI-2 public evaluation set 의 e8686506.json 단 하나 (train 2쌍 13x13->5x5 및 13x13->8x5, test 15x15 -> 8x5, 등장색 1,2,3,4,5,6,8,9)
- 모델은 claude-opus-5, claude CLI 2.1.245 headless `-p`, 도구 전면 차단 (Bash Write Edit Read Glob Grep WebSearch WebFetch Task NotebookEdit)
- codex CLI 0.147.0 은 사용량 한도(2026-09-15 까지)로 미사용. CLI 두 열 비교는 계획 단계에서 이미 포기됨
- ARC-AGI-3 자체는 arcprize API 키가 없어 미접촉. AVO 의 183레벨 결과는 재현도 반증도 되지 않았다

## boundary
- 뒤집힘 없음. 네 표면 축(색 전단사, 전치, 색+전치, 예시 순서) 어디를 넘어도 30/30 이 유지되어 경계가 관측되지 않았다. 계획서가 뒤집힘의 첫 지점으로 지목한 permuted-and-transposed 도 6/6 이다

## quotes
- text: "AVO achieved a 100.00 RHAE score across all 25 environments in the ARC-AGI-3 public set, completing all 183 levels."
  url: https://developer.nvidia.com/blog/nvidia-avo-reaches-100-on-arc-agi-3-demonstrating-a-frontier-level-general-purpose-architecture-for-long-horizon-autonomous-agents/
  bears_on: 이 실험 전체가 겨냥한 발표문. 측정 대상이 public set 이라는 것이 발표문 자체에 명시돼 있다
- text: "These results cover the 25-environment ARC-AGI-3 public set using the official scorecard and RHAE metric."
  url: https://developer.nvidia.com/blog/nvidia-avo-reaches-100-on-arc-agi-3-demonstrating-a-frontier-level-general-purpose-architecture-for-long-horizon-autonomous-agents/
  bears_on: 다섯 셀 전부. 이 실험도 public evaluation set 위에서만 이루어졌으므로 같은 범위 제약을 공유한다
- text: "Using Claude Opus 5, AVO completed the full 25-environment public set with a 100.00 RHAE score, solving all 183 levels in 6,624 environment actions."
  url: https://developer.nvidia.com/blog/nvidia-avo-reaches-100-on-arc-agi-3-demonstrating-a-frontier-level-general-purpose-architecture-for-long-horizon-autonomous-agents/
  bears_on: 이 실험이 부른 모델(claude-opus-5)이 AVO 안에서 도는 모델과 같다. 다만 이쪽은 하네스가 없는 순수 추론 한 턴이라 AVO 와 같은 것을 잰 것이 아니다
- text: "The most important result was not simply the 100.00 score, but that the same agent architecture transferred from highly specialized GPU-kernel optimization to a very different interactive reasoning task."
  url: https://developer.nvidia.com/blog/nvidia-avo-reaches-100-on-arc-agi-3-demonstrating-a-frontier-level-general-purpose-architecture-for-long-horizon-autonomous-agents/
  bears_on: 발표문이 일반화의 근거로 내세우는 것이 점수가 아니라 아키텍처 이식이라는 지점. 표면 섭동 검사(이 실험)는 이 주장과 직접 부딪히지 않는다
- text: "ARC-AGI-3 is an interactive reasoning benchmark which challenges AI agents to explore novel environments, acquire goals on the fly, build adaptable world models, and learn continuously."
  url: https://arcprize.org/arc-agi/3
  bears_on: 대리 기질의 한계. 이 실험이 쓴 ARC-AGI-2 단일 정적 과제는 대화형·목표 탐색·연속 학습 요소를 전혀 담지 않는다
- text: "Fully open source and available for anyone to use. These are published in our GitHub repositories and are intended for research, development, and community experimentation."
  url: https://arcprize.org/policy
  bears_on: public evaluation set 의 공식 용도 규정. 이 실험이 쓴 e8686506.json 이 여기 해당한다
- text: "Used for frontier model testing on the Verified Leaderboard."
  url: https://arcprize.org/policy
  bears_on: semi-private set 의 용도. AVO 의 100% 는 여기서 측정된 것이 아니다
- text: "We monitor for overfitting by tracking the performance gap between Public and Semi-Private tasks over time."
  url: https://arcprize.org/policy
  bears_on: 공개 세트 점수의 과적합 여부를 판정하는 공식 방법이 표면 섭동이 아니라 semi-private 과의 격차라는 것. 이 실험의 검사법이 공식 절차의 대체물이 아님을 못박는다
- text: "New scores are accepted when the Semi-Private and Public Evaluation sets are in good agreement."
  url: https://arcprize.org/policy
  bears_on: 공개 세트 단독 점수가 검증 점수로 인정되지 않는다는 규정. AVO 발표와 이 실험 양쪽에 동일하게 걸린다
- text: "Because tasks are sent to external APIs, we acknowledge the possibility of limited leakage over time."
  url: https://arcprize.org/policy
  bears_on: 오염 가능성을 운영 주체가 공식 인정하는 대목. verbatim 6/6 을 암기 배제의 증거로 읽지 못하게 막는다
- text: "We rely on two primary defenses: zero data retention agreements with providers, and the release of successive ARC-AGI benchmark versions on a roughly annual basis."
  url: https://arcprize.org/policy
  bears_on: 위 오염에 대한 공식 방어책. 표면 섭동 재검사는 이 목록에 없다
- text: "Access is extremely restricted to a small number of trusted parties. This set is used for the ARC Prize competition private leaderboard."
  url: https://arcprize.org/policy
  bears_on: private set 의 접근 제약. 이 기계에서 AVO 결과를 검증할 수 없었던 이유의 공식 근거

## anomalies
- raw/ 의 30개 파일이 바이트 단위로 완전히 동일하다 (각 187바이트). 내용은 setup 의 `ls p_*.txt e_*.json` 출력 10줄 + `HIT` 한 줄이다. grade.py 가 한 토큰만 찍도록 짜인 결과라 HIT/MISS 판정 자체는 정상이지만, 부작용으로 raw 만 봐서는 어느 셀이 어느 프롬프트 파일(p_verbatim/p_permuted/p_transposed/p_permuted_transposed/p_reordered)을 먹었는지 구별할 수 없다. 즉 셀별 command 가 실제로 서로 다른 프롬프트를 먹였다는 것은 raw 로 확인되지 않고 plan.json 의 command 문자열로만 보증된다
- 같은 이유로 모델이 실제 반환한 격자가 어디에도 기록되지 않았다. HIT 은 grade.py 의 판정으로만 존재하며 원본 답안과의 대조를 사후 재검할 수 없다. results.jsonl 이 verbatim-public-form 과 transposed 두 줄에 남긴 note 가 가리키는 것이 이것이다
- 30/30 이라는 완전 무결점은 재시도 없이 1차 실행에서 나왔다. 재실행으로 흔들리는지는 확인되지 않았다 (예산 소진)
