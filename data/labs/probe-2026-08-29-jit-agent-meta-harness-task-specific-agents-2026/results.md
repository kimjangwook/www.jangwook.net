# probe-2026-08-29-jit-agent-meta-harness-task-specific-agents-2026

question: 동일 모델·동일 디코딩 조건에서 GitHub bingreeky/JIT 소스가 주장하는 대로, 태스크마다 즉석 생성한 태스크 특화 하네스(JIT-Agent 방식)는 베이스라인 단일 프롬프트 대비 코딩 태스크 2종의 숨은 테스트 통과율을 유의미하게 올리는가? 올렸다면 그 증분이 '태스크 특화성'에서 오는가, 아니면 하네스 존재 자체(추가 구조·재시도 여지)에서 오는가?

## cells
- baseline-taskA — hits=0/3 usable=3/3 — exit 0,0,0 — metrics는 runs 3, usable_runs 3, hits 0, exit_codes [0, 0, 0]을 기록했지만 raw는 세 실행 모두 run_failed true, error 'fixture/tests dir not found for taskA', tests_passed 0, tests_total 12, generated_tokens 22로 유효한 측정이 이뤄지지 않았다.
- jit-harness-taskA — hits=0/3 usable=0/3 — exit 2,2,2 — runs 3 중 usable_runs 0, hits 0, exit_codes [2, 2, 2]로 세 번 모두 실패했고 raw에서는 bench/run.py가 존재하지 않는다는 [Errno 2] 오류가 반복됐다.
- jit-harness-taskB — hits=0/3 usable=3/3 — exit 0,0,0 — metrics는 runs 3, usable_runs 3, hits 0, exit_codes [0, 0, 0]인 반면 raw는 세 실행 모두 passed_hidden 10, hidden_total 10, baseline_passed 6, tokens 72, regression false를 보고해 metrics의 hits 0과 모순된다.
- baseline-taskB — hits=0/3 usable=3/3 — exit 0,0,0 — runs 3, usable_runs 3, hits 0, exit_codes [0, 0, 0]으로 종료됐고 raw의 세 실행은 모두 hidden_passed 10, hidden_total 10, tokens 30임을 보였다.
- generic-harness-taskA — hits=0/3 usable=0/3 — exit 2,2,2 — runs 3 중 usable_runs 0, hits 0, exit_codes [2, 2, 2]로 세 번 모두 실패했고 raw는 'FATAL: bench/run.py not found in workspace' 뒤 같은 bench/run.py 부재 [Errno 2] 오류를 반복했다.
- generic-harness-taskB — hits=0/3 usable=0/3 — exit 1,1,1 — runs 3 중 usable_runs 0, hits 0, exit_codes [1, 1, 1]로 세 번 모두 실패했고 raw는 pass_rate 표(baseline 50%, jit 70%, generic 80%)를 출력한 뒤 comparison_table.txt에 대해 'No such file or directory'를 남겼다.

## boundary
이 실험은 하네스 방식 자체의 효과를 판정하지 못한다. 태스크A에서는 baseline에 fixture/tests 디렉터리가 없어 측정이 성립하지 않았고 jit-harness와 generic-harness는 bench/run.py 부재로 usable_runs 0이었으며, 태스크B에서도 jit-harness와 generic-harness 셀은 metrics 기준 usable_runs 0(각각 exit_codes [0, 0, 0]과 [1, 1, 1])이라 계약상 비교 가능한 두 셀 간 증분 계산이 불가능하다. 6개 셀 전체에서 metrics hits는 0이므로 'JIT 하네스가 베이스라인 대비 통과율을 올리는가'라는 질문에 대한 응답 근거가 없다.

## quotes
- text: {"task": "taskA", "mode": "baseline", "model": "LOCAL-FIXED", "temperature": 0.0, "tests_passed": 0, "tests_total": 12, "generated_tokens": 22, "wall_clock_sec": 0.0, "run_failed": true, "error": "fix
  url: https://jangwook.net/
  bears_on: 동일 모델·동일 디코딩 조건에서 GitHub bingreeky/JIT 소스가 주장하는 대로, 태스크마다 즉석 생성한 태스크 특화 하네스(JIT-Agent 방식)는 베이스라인 단일 프롬프트 대비 코딩 태스크 2종의 숨은 테스트 통과율을 유의미하게 올리는가? 올렸다면 그 증분이 '태스크 특화성'에서 오는가, 아니면 하네스 존재 자체(추가 구조·재시도 여지)에서 오는가?

## anomalies
기대와 달리 어느 하네스도 비교 기여를 못했다. 둘째, metrics와 raw가 정면으로 모순된다: baseline-taskA의 exit_codes는 [0, 0, 0]이나 raw는 run_failed true이고, jit-harness-taskB의 metrics hits는 0이지만 raw는 passed_hidden 10(hidden_total 10, baseline_passed 6)을 보고한다. 셋째, generic-harness-taskB의 raw 표(50% / 70% / 80%)는 본 실험 metrics 어디에도 대응하지 않는 수치라 그 출처·적용 태스크를 확인할 수 없다.
