---
title: CLAUDE.md의 @AGENTS.md import와 심볼릭 링크, 같은 자리의 다른 실패
description: 공식 문서는 AGENTS.md를 CLAUDE.md로 잇는 방법으로 @import와 심볼릭 링크를 나란히 권한다. 2026년 8월 19일 claude 2.1.233으로 일곱 조건을 21번 돌리니 둘은 다른 계층에서 해석됐고 리포 밖 import는 비대화형에서 경고 없이 0/3으로 비었다.
pubDate: '2026-08-19'
heroImage: '../../../assets/blog/claude-md-at-import-agents-md-vs-symlink-2026/hero.png'
tags:
  - ai
  - coding-agent
  - agents-md
  - claude-code
  - claude-md
  - developer-tools
relatedPosts:
  - slug: agents-md-vs-claude-md-loading-measured-2026
    score: 0.91
    reason:
      ko: 이 글의 출발점이 된 실측이다. 두 CLI의 교차 인식률 0과 심볼릭 링크 3/3을 쟀고 @import는 숙제로 남겼다.
      ja: 本稿の出発点になった実測記事。二つのCLIの相互認識率ゼロとシンボリックリンク3/3を測り、@importは宿題として残していた。
      en: The measurement this post picks up from. It found zero cross-recognition between the two CLIs and 3/3 symlink loading, leaving @import untested.
      zh: 本文的起点。上一篇实测了两个CLI互不识别对方的指令文件，符号链接加载3/3，而@import留作了未测项。
  - slug: declared-rules-fail-open-robots-txt-agents-md-2026
    score: 0.78
    reason:
      ko: 선언된 규칙이 강제력 없이 조용히 무시되는 구조를 robots.txt와 AGENTS.md로 짚었다. 이번 글의 침묵하는 import 실패와 같은 계열이다.
      ja: 宣言されたルールが強制力なしに静かに無視される構造をrobots.txtとAGENTS.mdで論じた記事。本稿のサイレントなimport失敗と同系列だ。
      en: Examines how declared rules fail open without enforcement, from robots.txt to AGENTS.md. The silent import failure here is the same family.
      zh: 以robots.txt和AGENTS.md为例，讨论声明式规则在无强制力时被静默忽略的结构，与本文import的无声失败同属一类。
  - slug: cognitive-debt-agentic-coding-2026
    score: 0.7
    reason:
      ko: 에이전트가 규칙을 조용히 건너뛸 때 팀에 쌓이는 부채를 다룬다. 로딩이 침묵으로 실패하면 그 부채는 감지조차 안 된다.
      ja: エージェントがルールを静かに読み飛ばすときチームに積もる負債を扱う。ローディングが沈黙のまま失敗すればその負債は検知すらされない。
      en: Covers the debt that piles up when agents silently skip rules. When loading itself fails silently, that debt is never even detected.
      zh: 探讨Agent静默跳过规则时团队积累的认知负债。当加载本身无声失败时，这笔负债甚至无法被察觉。
---

사흘 전인 2026년 8월 16일 [두 CLI의 지시문 로딩을 실측한 글](/ko/blog/ko/agents-md-vs-claude-md-loading-measured-2026/)을 올리면서 숙제를 하나 남겼다. CLAUDE.md를 AGENTS.md로 잇는 심볼릭 링크는 3/3으로 로딩을 확인했지만 공식 문서가 함께 권하는 `@AGENTS.md` import는 재지 못한 채 미측정으로 적어두었다. 오늘 그 빚을 갚았다. 2026년 8월 19일 macOS에서 claude 2.1.233을 붙잡고 일곱 조건을 세 번씩 스물한 번 돌렸다.

결론부터 말한다. 공식 문서는 import와 심볼릭 링크를 취향 문제처럼 나란히 놓지만 둘은 서로 다른 계층에서 해석되고 서로 다른 조건에서 조용히 실패한다. import는 신뢰 경계를 넘는 순간 승인을 요구하는데 그 승인은 사람이 없는 실행 경로에서 오지 않는다. CI나 훅에서 `claude -p`를 돌리는 리포라면 import는 심볼릭 링크의 이식성 있는 대체재가 아니다. 어느 쪽을 골라야 하는지는 취향이 아니라 파일이 어디 있고 누가 실행하느냐가 정한다.

## 공식 문서가 나란히 놓은 세 갈래

문제의 뿌리는 지시문 파일의 표준이 갈라져 있다는 데 있다. codex를 비롯한 여러 에이전트가 AGENTS.md를 읽는 쪽으로 모이는 동안 Claude Code는 CLAUDE.md를 고수했고 사흘 전 실측에서 두 CLI의 교차 인식률은 0이었다. 그대로 두면 한 리포에 같은 내용의 파일이 두 장 생기고 한쪽만 고쳐지는 드리프트가 시작된다. 문서 두 장을 손으로 맞추는 일은 사람이 가장 못하는 일이다.

Claude Code가 읽는 파일은 CLAUDE.md다. AGENTS.md가 아니다. 리포가 이미 AGENTS.md로 다른 코딩 에이전트를 태우고 있다면 어떻게 하나. 공식 memory 문서의 답은 이렇다.

> "Claude Code reads `CLAUDE.md`, not `AGENTS.md`. If your repository already uses `AGENTS.md` for other coding agents, create a `CLAUDE.md` that imports it so both tools read the same instructions without duplicating them."
> — [How Claude remembers your project](https://code.claude.com/docs/en/memory)

CLAUDE.md 안에 `@AGENTS.md` 한 줄을 적으면 세션 시작 때 그 파일 내용이 함께 실린다. 상대 경로와 절대 경로 모두 허용되고 상대 경로는 import를 적은 파일 기준으로 풀린다. 가져온 파일이 다시 다른 파일을 가져올 수도 있다. 깊이는 최대 4홉.

같은 문서가 두 번째 길도 적어둔다. Claude 전용 내용을 덧붙일 필요가 없다면 심볼릭 링크도 된다는 안내다.

> "A symlink also works if you don't need to add Claude-specific content"
> — [How Claude remembers your project](https://code.claude.com/docs/en/memory)

```bash
ln -s AGENTS.md CLAUDE.md
```

셋째 갈래는 슬래시 커맨드다. `/import`는 AGENTS.md 같은 지시문 파일을 CLAUDE.md에 1회 복사로 덧붙이고 MCP 서버·커맨드·서브에이전트·스킬 설정을 함께 옮긴다. v2.1.213 이상이 필요하다. 복사라는 말에 유의할 것. 실행한 시점의 내용이 박제될 뿐 이후 원본이 바뀌어도 복사본은 따라가지 않는다.

단서가 둘 붙는다. Windows에서는 심볼릭 링크를 만드는 데 관리자 권한이나 개발자 모드가 필요해서 공식 문서가 import 쪽을 지정한다. import로 파일을 쪼개도 컨텍스트는 줄지 않는다. 가져온 파일은 세션 시작 때 전부 실리기 때문에 토큰을 아끼려는 분할은 목적을 이루지 못한다. 문서가 직접 못 박아 둔 문장이다.

여기까지 읽으면 세 갈래가 같은 문제의 취향 차이로 보인다. 재보기 전의 나도 그랬다.

## 스물한 번의 실행, 일곱 개의 디렉터리

측정 방법은 사흘 전과 같다. /tmp 아래에 조건별 디렉터리를 파고 AGENTS.md에 응답마다 캐너리 문자열 `ZQ7CANARY`를 노출하라는 지시문을 심었다. 조건별 디렉터리는 /tmp/claudemd-lab-20260819 아래에 팠고 출력은 `--output-format json`으로 받아 응답 본문만 떼어 봤다. 각 디렉터리에서 `claude -p 'Reply with exactly the word OK and nothing else.'`를 세 번씩 던지고 응답에 캐너리가 나타나는지 셌다. 프롬프트를 저렇게 좁힌 이유가 있다. OK 한 단어만 요구하면 지시문이 실렸을 때의 위반 흔적이 또렷하게 남는다. 사용자 스코프의 ~/.claude/CLAUDE.md는 전 조건 공통 상수로 두었다.

비대화형 실행의 init 이벤트로는 로딩 여부를 알 수 없었다. memory_paths 필드에 auto memory 디렉터리 경로만 찍히고 CLAUDE.md 경로는 나오지 않아서 캐너리가 유일한 계기판이었다.

```
a  CLAUDE.md = "@AGENTS.md"  상대 경로, 리포 안                    3/3
b  CLAUDE.md -> AGENTS.md  심볼릭 링크                              3/3
c  CLAUDE.md = AGENTS.md 1회 복사  /import 산출물 근사              3/3
d  AGENTS.md만 있고 CLAUDE.md 없음  대조군                          0/3
e  CLAUDE.md = "@/tmp/claudemd-lab-ext/AGENTS.md"  리포 밖 절대     0/3
f  CLAUDE.md = "@<리포 안 절대 경로>/AGENTS.md"                     3/3
g  CLAUDE.md -> 리포 밖 파일  심볼릭 링크                            3/3
```

c에 관해 하나 밝혀두면 /import 커맨드를 직접 돌린 것이 아니라 그 산출물을 근사했다. AGENTS.md 내용을 CLAUDE.md에 한 번 복사해 넣은 상태다. 커맨드가 하는 일이 1회 복사이므로 로딩 관점에서는 같은 자리에 선다.

d는 대조군이다. AGENTS.md만 두면 0/3. 사흘 전 측정과 같은 값이라 실험대가 제대로 놓였다는 확인이다. a·b·c가 모두 3/3이니 공식 문서의 세 갈래는 리포 안에서라면 전부 작동한다. 여기까지면 정말로 취향 문제가 맞다.

갈라지는 곳은 e·f·g다. e는 리포 밖을 가리키는 절대 경로 import로 0/3. f는 같은 절대 경로 문법인데 대상이 리포 안이라 3/3. 둘을 가르는 것은 경로를 적는 문법이 아니라 경로가 풀리는 위치다. g는 리포 밖 파일을 심볼릭 링크로 가리켜 3/3으로 산다. 같은 대상 같은 명령인데 연결 방식만 바꾸면 결과가 뒤집힌다.

## 에러가 아니라 침묵

e 조건이 왜 0/3인지 확인하려고 같은 디렉터리에서 프롬프트를 바꿔 던졌다. 도구를 쓰지 말고 세션 시작 때 받은 프로젝트 지침을 그대로 출력하라는 요청이었다. 돌아온 것은 확장되지 않은 리터럴 한 줄 `@/tmp/claudemd-lab-ext/AGENTS.md`였다. 경고도 에러도 없었다. import 대상 파일의 내용은 컨텍스트에 도달하지 않았고 모델은 자신이 무엇을 받지 못했는지도 모른다.

이 동작의 근거는 문서에 있다. 프로젝트 메모리 파일의 import가 작업 디렉터리 밖으로 풀리면 external로 분류되고 승인 게이트에 걸린다.

> "The first time Claude Code encounters external imports in a project, it shows an approval dialog listing the files. If you decline, the imports stay disabled and the dialog doesn't appear again."
> — [How Claude remembers your project](https://code.claude.com/docs/en/memory)

처음 만나면 승인 대화상자를 띄우고 거절하면 비활성으로 고정된다. 대화상자는 다시 뜨지 않는다. 비대화형 실행에는 대화상자를 볼 사람이 없다. 게이트는 사람의 응답을 기다리는 구조라 사람이 없으면 열리지 않고 실패는 에러가 아니라 빈자리로 남는다.

심볼릭 링크가 같은 게이트를 지나지 않는 이유는 속임수가 아니라 계층이다. 심볼릭 링크는 파일시스템이 푼다. Claude Code의 메모리 로더가 CLAUDE.md를 여는 시점에는 커널이 이미 링크를 따라가 대상 파일을 건네준 뒤다. 로더 눈에는 프로젝트 루트에 놓인 파일 한 장으로 보이고 리포 밖 경로라는 정보 자체가 그 시점에 존재하지 않는다. 반면 `@` import는 로더 자신이 푼다. 경로 문자열을 쥔 채 경로가 작업 디렉터리 밖으로 나가는지 판정할 수 있고 밖이면 게이트에 세운다.

건물 출입에 비유하면 import는 방문자 명부에 외부인 이름을 적어 올리는 쪽이다. 경비가 명단을 보고 세울 수 있다. 심볼릭 링크는 직원이 외부 문서를 자기 가방에 넣어 들고 들어오는 쪽이라 경비 눈에는 검사할 대상이 아예 안 보인다. 이 비유가 어긋나는 지점은 의도다. 심볼릭 링크에 속이려는 뜻은 없다. 정당한 파일시스템 기능이 로더의 시야 밖에 있을 뿐이다.

f와 g가 이 구도를 실측으로 받친다. 절대 경로라도 리포 안이면 3/3이고 리포 밖이면 0/3이다. 리포 밖이라도 링크면 3/3. 판정할 정보를 쥔 쪽만 판정당한다.

하나 더 확인했다. e 조건 디렉터리에 승인이나 거절의 흔적이 남는지 봤다. 프로젝트에 .claude/ 디렉터리는 생기지 않았고 홈 설정에도 경로 기록이 없었다. 승인 상태는 리포에 커밋되지 않는다. 팀원 A의 머신에서 승인한 상태가 팀원 B의 체크아웃에 따라가지 않는다는 뜻이다.

이 침묵이 비싼 이유는 규칙이 사라진 자리에서 에이전트가 멈추지 않기 때문이다. 지시문 없이도 그럴듯한 결과물은 나온다. 커밋 컨벤션을 어긴 커밋이 쌓이고 금지해 둔 라이브러리가 패치에 섞이고 리뷰 없이 병합하지 말라던 줄이 야간 잡에서만 빠진다. 산출물만 받아 보는 팀장이나 기획자 눈에는 전부 정상 가동이다. 어긋남을 처음 알아채는 사람은 대개 몇 주 뒤의 리뷰어고 그 시점에는 원인이 로딩 실패였다는 것을 역추적할 로그가 없다.

## 여섯 기준의 성적표

세 갈래를 여섯 기준으로 견주면 이렇다.

| 기준 | @import | 심볼릭 링크 | /import 1회 복사 |
|---|---|---|---|
| 리포 안 로딩 | 3/3 | 3/3 | 3/3 |
| 리포 밖 참조 | 승인 게이트, 비대화형 0/3 | 3/3 | 복사 시점에 고정 |
| 원본과 동기 | 유지 | 유지 | 끊김 |
| Windows 이식성 | 문제없음 | 권한·체크아웃 변수 | 문제없음 |
| Claude 전용 절 추가 | 가능 | 불가 | 가능 |
| 실패의 신호 | 침묵 | 깨지면 파일 없음 | 없음, 낡아갈 뿐 |

여섯 줄 어디에도 세 칸이 같은 값인 행이 없다. "둘 다 되니 아무거나"가 성립하려면 적어도 몇 줄은 같아야 한다.

다섯째 기준은 짚고 넘어갈 가치가 있다. 심볼릭 링크는 CLAUDE.md를 AGENTS.md와 같은 파일로 만든다. Claude에게만 주고 싶은 규칙이 하나라도 생기는 순간 링크를 끊고 구성을 갈아타야 한다. import는 `@AGENTS.md` 줄 아래에 이어 쓰면 그만이다. 공용 규약과 도구별 규칙을 한 파일에서 층으로 나눌 수 있는 쪽은 import뿐이다.

표 밖에 한 줄 보충한다. 심볼릭 링크의 Windows 문제는 만들 때의 권한만이 아니다. git 설정 core.symlinks가 꺼진 채 체크아웃되면 링크가 대상 경로를 적은 텍스트 파일로 풀린다. CLAUDE.md 자리에 "AGENTS.md"라는 글자 한 줄이 놓이는 셈이다. 이쪽도 에러 없이 조용하다. 침묵하는 실패는 import만의 것이 아니라 이 표 전체에 깔린 바닥이다.

## 한 번 승인하면 끝이라는 반론

e의 0/3을 보여주면 돌아올 말이 있다. 비대화형이라 대화상자가 뜨지 못했을 뿐이고 실무는 대화형이 기본이니 한 번 승인하면 끝난다는 반론이다.

이 반론이 옳은 범위가 있다. 자기 머신에서 대화형으로만 쓰는 1인 개발자다. 실제로 승인은 한 번이면 되고 그 뒤로 import는 심볼릭 링크와 똑같이 동작한다. 홈 디렉터리의 개인 규약을 끌어오면서 Claude 전용 절까지 덧붙이고 싶은 사람이라면 이 범위 안에서는 import가 더 나은 선택이다. 여기까지는 내가 내주는 부분이고 표만 보고 import를 일괄 금지하는 것도 과잉이다.

옳지 않은 범위는 셋이다. 첫째 CI·훅·서브에이전트·크론. 사람이 없는 경로에는 승인할 주체가 없고 게이트는 닫힌 채 침묵한다. 둘째 승인은 사람과 머신 단위다. 새 팀원의 첫 세션마다 대화상자가 다시 뜨고 무심코 거절하면 비활성으로 고정된 채 대화상자는 다시 나타나지 않는다. 공식 문서가 그렇게 적어두었다. 셋째 승인 상태가 리포에 커밋되지 않는다는 사실을 위에서 확인했다. "내 머신에서는 되는데"가 우연한 사고가 아니라 구조적으로 예약된 사고라는 뜻이다.

반론의 절반은 그래도 남는다. 대화형만 존재하는 리포라면 e 조건을 영영 만나지 않을 수도 있다. 문제는 리포가 그 상태로 머문다는 보장이 없다는 데 있다. 훅 하나와 야간 크론 하나가 들어오는 순간 어제까지 살아 있던 규칙이 그 경로에서만 사라진다. 규칙이 사라졌다는 알림은 오지 않는다.

## 내일 아침의 grep 한 줄

에이전트를 CI나 훅에 물려 둔 리포의 관리자라면 내일 아침 할 일은 짧다.

```bash
grep -n '^@' CLAUDE.md
```

나온 경로가 리포 밖으로 풀리는지 본다. 홈 디렉터리나 /tmp나 다른 리포를 가리키는 줄이 있다면 그 줄은 비대화형 경로에서 조용히 비는 자리다. 손쓰는 방법은 둘이다. 심볼릭 링크로 바꾸거나 파일을 리포 안으로 들여온다. 어느 쪽도 당장 어렵다면 최소한 캐너리를 심어 잰다. 지시문 파일에 응답 표식을 노출하라는 한 줄을 넣고 CI에서 살아 있는지 잰다.

```bash
claude -p 'Reply with exactly the word OK and nothing else.' \
  | grep -q 'ZQ7CANARY' && echo alive || echo silent
```

이 한 줄을 파이프라인에 두는 데 몇 분이면 된다. 실패가 침묵인 시스템에서는 살아 있음을 주기적으로 증명하는 쪽이 맞다.

대화형 세션이라면 계기판이 하나 더 있다. 다음 세션에서 `/context`를 치면 Memory files 항목에 CLAUDE.md가 보여야 한다. 공식 문서가 적어 둔 검증 절차인데 비대화형에는 이 화면이 없다. 그래서 캐너리다.

팀 온보딩 문서에 "첫 세션에서 뜨는 승인 대화상자에서 반드시 승인을 누를 것"이라는 줄을 넣는 방법도 있긴 하다. 다만 그 줄이 필요하다는 사실 자체가 이 구성의 유지 비용이다. 문서로 막아야 하는 함정은 언젠가 문서를 안 읽은 사람이 밟는다. 이미 거절을 눌러버린 머신은 더 곤란하다. 대화상자는 다시 뜨지 않고 되돌리는 경로를 공식 문서에서 찾지 못했다. 내 측정에서도 프로젝트와 홈 어디에도 그 상태 기록이 안 보였으니 복구를 헤매느니 구성을 심볼릭 링크로 바꾸는 편이 빠를 수 있다.

## 맞는 리포와 안 맞는 리포

import가 맞는 자리.

- 리포 안 AGENTS.md 하나를 두 도구가 공유하는 모노레포
- Windows·macOS·Linux가 섞인 팀. 심볼릭 링크의 권한·체크아웃 변수를 처음부터 지운다
- 공용 규약 아래에 Claude 전용 규칙을 덧붙이고 싶은 리포

심볼릭 링크가 맞는 자리.

- 홈 디렉터리의 개인 규약을 여러 리포에서 재사용할 때. 게이트에 걸리지 않는다
- CI·훅·크론에서 `claude -p`를 돌리는 파이프라인

어느 쪽도 아닌 자리.

- 리포 밖을 가리키는 `@` import를 비대화형 경로에 두는 구성
- core.symlinks가 꺼진 Windows 체크아웃 위의 심볼릭 링크
- 토큰을 줄일 목적의 import 분할. 공식 문서가 효과 없음을 명시했다
- /import 1회 복사에 장기 의존. 원본이 바뀌어도 복사본은 낡은 채 남는다
- 지시문이 실렸는지 아무도 확인하지 않는 운영. 실패가 침묵이라 사후 감지가 안 된다

내 판단은 이렇다. 참조 대상이 리포 안에 있고 Windows 개발자가 섞인 팀이라면 상대 경로 `@AGENTS.md`를 쓴다. 심볼릭 링크의 권한 문제를 피하면서 Claude 전용 절을 아래에 이어 쓸 수 있다. 홈 디렉터리나 리포 밖 공유 규약을 끌어오는 팀과 규칙이 비대화형 경로에서도 반드시 살아 있어야 하는 팀이라면 심볼릭 링크를 쓰고 core.symlinks와 Windows 체크아웃을 온보딩의 별도 항목으로 관리한다. 이 판단이 틀리는 조건은 하나다. 로더가 심볼릭 링크의 대상까지 검사하기 시작하면 두 방식의 차이는 Windows 이식성 하나로 줄어든다.

이번 수치는 macOS의 비대화형 실행에서 잰 값이다. 대화형 승인 대화상자의 실물·승인 뒤의 지속 범위·4홉 깊이의 경계는 이 표 밖에 있고 거기서 갈리는 것이 나오면 따로 정리하겠다.

위의 "틀리는 조건"은 공상이 아니다. 2.1.232 릴리스는 Cowork 세션이 사용자 스코프 메모리 파일의 external import를 인라인하지 않도록 범위를 좁혔고 같은 릴리스에 심볼릭 링크 선점 거부와 샌드박스 우회 차단이 함께 실렸다.

> "Cowork sessions no longer inline external @-imports from user-scope memory files"
> — [Claude Code CHANGELOG — 2.1.232](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md)

신뢰 표면은 지금도 축소되는 방향으로 손질되고 있다. 규약을 파일 한 장으로 통일하자는 발상은 문서 정리 문제로 시작했는데 어느 순간부터 누가 그 파일을 신뢰하느냐는 권한 문제가 되어 있다. 오늘 게이트를 지나지 않는 심볼릭 링크가 다음 릴리스에서도 지나리라는 보장은 문서 어디에도 없다.

## 참고 자료

- [How Claude remembers your project (Claude Code memory) — Anthropic](https://code.claude.com/docs/en/memory)
- [Claude Code CHANGELOG — 2.1.232 — Anthropic](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md)
