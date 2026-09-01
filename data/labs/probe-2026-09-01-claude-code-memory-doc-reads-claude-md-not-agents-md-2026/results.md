# probe-2026-09-01-claude-code-memory-doc-reads-claude-md-not-agents-md-2026

question: 같은 디렉터리에 CLAUDE.md와 AGENTS.md가 나란히 있을 때 Claude Code의 메모리/컨텍스트 로딩은 어느 파일의 내용을 읽는가 — AGENTS.md 단독일 때는 읽히는가

## cells
- c1-both-files — hits=0/3 usable=0/3 — exit 1,1,1 — CLAUDE.md와 AGENTS.md가 나란히 있는 상태에서 3회 실행은 모두 exit code 1로 끝났고 usable run 0회, 마커 관측 0회였으며, raw 출력은 'bash: /stdout.txt: Read-only file system' 오류만 보여준다.
- c2-agents-md-only — hits=0/3 usable=3/3 — exit 0,0,0 — AGENTS.md 단독 조건에서 3회 실행이 모두 exit code 0으로 끝났으나 마커 관측은 0회였고, raw 출력에는 'mkdir: : No such file or directory' 오류가 반복된다.
- c3-claude-md-only — hits=0/3 usable=0/3 — exit 1,1,1 — CLAUDE.md 단독 조건에서 3회 실행은 모두 exit code 1로 끝났고 usable run 0회, 마커 관측 0회였으며, raw 출력은 'Read-only file system' 오류만 담고 있다.
- c4-no-memory-file — hits=0/3 usable=0/3 — exit 1,1,1 — 메모리 파일이 없는 대조 조건에서 3회 실행은 모두 exit code 1로 끝났고 usable run 0회, 마커 관측 0회였으며, raw 출력에는 mkdir 오류와 'Read-only file system' 오류가 섞여 있다.

## boundary
이 실행은 네 조건 중 세 조건(c1-both-files, c3-claude-md-only, c4-no-memory-file)이 3회 실행 모두 실패(exit code 1, usable 0)했고 유일하게 usable run 3회를 남긴 c2-agents-md-only에서도 마커 관측 0회였다. 따라서 공존 시 CLAUDE.md가 읽히는지, AGENTS.md 단독일 때 무시되는지를 보여주는 관측이 하나도 확보되지 않았으며, 기대 서술에 명시된 확인 조건(CLAUDE.md 마커 관측 + AGENTS.md 마커 미로드)은 어느 쪽도 충족되지 않았다. 실험 결과는 무결성(inconclusive)이며, 원인은 'Read-only file system'과 'mkdir: : No such file or directory'로 보이는 샌드박스 파일시스템 오류이다.

## quotes
- text: bash: /stdout.txt: Read-only file system
bash: /stderr.log: Read-only file system
  url: https://code.claude.com/docs/en/memory
  bears_on: c1-both-files, c3-claude-md-only, c4-no-memory-file의 전면 실패 원인 — 출력 파일을 쓸 수 없어 마커 관측이 불가
- text: mkdir: : No such file or directory
  url: https://agents.md/
  bears_on: c2-agents-md-only의 셋업 오류 — AGENTS.md 단독 조건의 usable run 판정에 영향
- text: bash: /stdout.txt: Read-only file system
bash: /stderr.log: Read-only file system

[c1-both-files-2] bash: /stdout.txt: Read-only file system
  url: https://docs.anthropic.com/en/docs/claude-code/memory
  bears_on: 공존 조건(c1) 3회 실행이 모두 동일한 읽기전용 오류로 반복됨을 보여주는 원문

## anomalies
c2-agents-md-only만 exit code 0과 usable run 3회를 기록했으나 raw 출력에는 'mkdir: : No such file or directory' 오류가 3회 실행마다 반복되어, 마커 0회가 'AGENTS.md가 무시되어서'인지 '셋업이 깨져서'인지 구분되지 않는다. 또한 exit code 1 조건들의 오류가 메모리 파일 유무와 무관하게 동일해(c1/c3 동일 출력, c4는 mkdir 오류 추가), 실패가 조건 간 차이가 아니라 실행 환경에서 비롯된 것으로 보인다.
