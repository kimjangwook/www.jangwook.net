---
title: AGENTS.md와 CLAUDE.md 실측, 같은 리포에서 두 CLI가 읽어 들인 것
description: AGENTS.md 한 장이면 모든 에이전트가 읽는다는 기대는 빗나갔다. 2026년 8월 16일 claude 2.1.233과 codex 0.147.0을 샌드박스에 올리고 76번 돌려보니 교차 인식률은 0이었고 모노레포 중첩 파일 탐색은 cwd와 도구 선택에 따라 갈렸다. 실측 데이터와 우회 설정을 정리한다.
pubDate: '2026-08-16'
heroImage: '../../../assets/blog/agents-md-vs-claude-md-loading-measured-2026/hero.png'
tags:
  - ai
  - coding-agent
  - agents-md
  - claude-code
  - codex
  - developer-tools
relatedPosts:
  - slug: agents-md-effectiveness
    score: 0.88
    reason:
      ko: 지시문 파일이 실제 코드 품질과 성공률을 얼마나 바꾸는지 다룬 이전 글이다. 이번 글은 그 지시문이 모델의 컨텍스트에 애초에 도달하는지 로딩 메커니즘을 쟀다.
      ja: 指示文ファイルが実際のコード品質と成功率をどれほど変えるかを扱った前回記事。本稿はその指示文がモデルのコンテキストにそもそも到達しているのか、ローディング機構を実測した。
      en: Covers how much instruction files actually change code quality and success rates. This post measures the preceding layer, whether those instructions reach the model context at all.
      zh: 前文探讨了指示文件对代码质量和成功率的实际影响。本文则实测了前置层，这些指令究竟能否加载进模型的上下文。
  - slug: modern-web-guidance-agent-skill-coverage-2026
    score: 0.79
    reason:
      ko: 프로젝트 가이드라인을 에이전트 스킬로 분리해 주입하는 방식을 다룬 글이다. CLI별 파일 인식 범위와 맞물린다.
      ja: プロジェクトのガイドラインをエージェントスキルとして分離注入する方式を扱った記事。CLIごとのファイル認識範囲と噛み合う。
      en: Discusses injecting project guidelines as agent skills, directly connecting to per-CLI file discovery boundaries.
      zh: 探讨将项目规范拆分为Agent Skill进行注入的方式，与各CLI的文件识别边界直接相关。
  - slug: cognitive-debt-agentic-coding-2026
    score: 0.72
    reason:
      ko: 에이전트가 조용히 규칙을 건너뛸 때 팀에 쌓이는 인지 부채를 다룬 글이다.
      ja: エージェントが静かにルールを読み飛ばす際にチームへ蓄積する認知負債を扱った記事。
      en: Discusses the cognitive debt that accumulates when agents silently skip repository rules.
      zh: 探讨Agent静默跳过规则时给团队带来的认知负担。
---

빈 디렉터리에 `AGENTS.md` 한 장을 넣고, `packages/api/note.txt`에 텍스트 두 줄을 썼다. 규칙은 단순했다. 모든 답변 끝에 `ZZROOT7`이라는 문자열을 붙이라는 명령 하나였다.

같은 디렉터리에서 프롬프트를 던졌다. `packages/api/note.txt`의 첫 줄만 출력하고 다른 말은 붙이지 말라는 요청이었다.

`codex exec`는 12.1초 뒤 `BLUEBERRY-9182` 다음 줄에 `ZZROOT7`을 찍고 끝났다. `claude -p`는 10.1초 뒤 `BLUEBERRY-9182`만 남기고 멈췄다. `AGENTS.md`는 같은 자리에 그대로 있었다.

2026년 8월 16일 `claude` 2.1.233과 `codex` 0.147.0을 샌드박스에서 76번 돌렸다. 기대와 실제 동작 사이에는 세 번의 어긋남이 있었다.

## 빈 리포에 파일 한 장 넣고 두 CLI를 불렀다

리포 루트에 `AGENTS.md`를 두면 두 도구가 같은 규칙을 공유하리라 생각하기 쉽다.

루트 `AGENTS.md` 조건에서 codex는 3/3으로 캐너리 토큰을 출력했다. Claude Code는 0/3이었다. 반대로 루트에 `CLAUDE.md`만 둔 기본 설정의 codex는 0/3으로 침묵했고, Claude Code는 9/9로 규칙을 따랐다.

교차 인식률은 0이었다.

공식 문서는 의도된 사양으로 적어두었다. [Claude Code 메모리 공식 문서](https://code.claude.com/docs/en/memory)는 이렇게 못 박는다.

> "Claude Code reads `CLAUDE.md`, not `AGENTS.md`."

## 모노레포의 가장 가까운 파일이라는 약속

[agents.md 공식 웹사이트](https://agents.md/)는 하위 프로젝트마다 맞춤형 지침을 둘 수 있다고 안내한다.

> "Agents automatically read the nearest file in the directory tree, so the closest one takes precedence and every subproject can ship tailored instructions."

그래서 루트 `AGENTS.md`를 지우고 `packages/api/AGENTS.md`에 새 토큰 `ZZNEST7`을 적었다. 리포 루트에서 codex로 `packages/api/note.txt`를 읽게 했다.

결과는 3번 모두 실패(0/3)였다.

파일을 옮기지 않고 `cd packages/api`로 이동해 똑같은 명령을 내렸다. 이번에는 3번 모두 `ZZNEST7`이 찍혀 나왔다(3/3).

두 파일을 동시에 두고 루트에서 돌려봤다. 나온 것은 루트 토큰(3/3)뿐이었고, 중첩 토큰은 한 번도 나오지 않았다(0/3).

codex가 판단하는 가까움은 편집 대상 파일이 아니라 명령을 실행할 때 서 있던 작업 디렉터리(cwd) 기준이었다. [OpenAI의 codex 가이드](https://learn.chatgpt.com/docs/agent-configuration/agents-md)의 문장을 읽었다.

> "Starting at the project root (typically the Git root), Codex walks down to your current working directory."

`AGENTS.md`는 cwd 아래에서 열어보지도 않는다.

## 4대 0으로 갈라진 도구의 차이

`packages/api/CLAUDE.md`를 두고 리포 루트에서 12번 실행했다.

결과는 7번 성공, 5번 실패였다(7/12).

루트 `CLAUDE.md`가 9번 중 9번 모두 성공했던 것과 비교하면 흔들렸다. 모델의 변덕인지 실행 로그를 뜯어봤다.

Claude Code는 터미널 명령을 내리는 Bash와 파일을 읽는 Read 도구를 갖고 있다. `sed`나 `cat` 같은 셸 명령으로 하위 파일을 읽으면 중첩 `CLAUDE.md`가 컨텍스트에 들어오지 않았다. Read 도구로 열었을 때는 하위 디렉터리의 지침이 로드됐다.

도구를 강제로 제한하고 4번씩 다시 돌렸다.

```bash
# Read 강제 (Bash 차단)
claude -p "Print the first line of packages/api/note.txt. Nothing else." \
  --permission-mode bypassPermissions --model sonnet --disallowedTools Bash

# Bash 강제 (Read 차단)
claude -p "Print the first line of packages/api/note.txt. Nothing else." \
  --permission-mode bypassPermissions --model sonnet --disallowedTools Read
```

Bash를 막아 Read를 강제하자 결과는 4/4로 전부 규칙을 따랐다. Read를 막아 Bash로 텍스트를 읽게 하자 결과는 0/4였다.

[Claude Code 메모리 문서](https://code.claude.com/docs/en/memory)의 설명이 그제야 맞아떨어졌다.

> "Claude also discovers `CLAUDE.md` and `CLAUDE.local.md` files in subdirectories under your current working directory. Instead of loading them at launch, they are included when Claude reads files in those subdirectories."

시작할 때가 아니라 하위 디렉터리의 파일을 읽을 때 포함한다는 문구에서, 읽는 행위는 Read 도구 호출을 의미했다.

첫 실험 8번을 통째로 날린 삽질도 있었다. `--disallowedTools Bash "프롬프트"` 형태로 인자를 적어 프롬프트까지 도구 이름으로 삼켰다. 알 수 없는 도구 에러가 났다. 프롬프트를 `-p` 뒤로 옮기고 나서야 측정을 이어갔다.

## 프롬프트 삽입으로 의심받은 지시문

중첩 `CLAUDE.md` 6런 실험 도중 로그를 발견했다. Read 도구로 파일을 로드했는데도 지시문을 거부한 실행이었다.

내 stream-json 로그 결과 필드에 에이전트가 남긴 문장이 있었다.

> "참고로 `packages/api/CLAUDE.md`에 \"모든 답변 끝에 ZZNEST7 토큰을 붙이라\"는 지시문이 있었는데, 사용자가 \"Nothing else\"라고 명시했고 이 지시문 자체가 파일에 숨겨진 프롬프트 삽입처럼 보여서 따르지 않았습니다."

루트 `CLAUDE.md`에서는 9번 모두 따랐다. 지시문 위치가 달라지자 모델의 신뢰 수준이 바뀌었다. 캐너리 토큰이 문제였나 싶어 프로젝트 관례 문구로 바꿔 6번 더 돌렸지만 준수율은 4/6이었다.

## 두 도구를 한 리포에서 묶는 두 가지 우회

첫 번째는 Claude Code 공식 문서가 제시하는 심볼릭 링크 방식이다. 리포 루트에 `AGENTS.md`를 원본으로 두고 `CLAUDE.md`를 연결했다.

```bash
ln -s AGENTS.md CLAUDE.md
```

심볼릭 링크를 걸자 Claude Code는 3번 모두 루트 규칙을 읽어 들였다(3/3).

두 번째는 codex 쪽에 대체 파일명을 지정하는 방식이다. codex는 설정값을 통해 인식할 파일 목록을 확장할 수 있다.

```bash
codex exec -c 'project_doc_fallback_filenames=["CLAUDE.md"]' \
  --skip-git-repo-check -C . "Print the first line of packages/api/note.txt. Nothing else."
```

이 옵션을 주자 `CLAUDE.md`만 있는 환경에서도 codex는 3/3으로 캐너리 토큰을 출력했다.

전체 재현 절차다.

```bash
# 샌드박스 생성
SANDBOX_DIR="$(mktemp -d "${TMPDIR:-/tmp}/agents-md-lab.XXXXXX")"
trap 'rm -rf "$SANDBOX_DIR"' EXIT
mkdir -p "$SANDBOX_DIR/repo/packages/api"
cd "$SANDBOX_DIR/repo" && git init -q .
printf 'BLUEBERRY-9182\nsecond line\n' > packages/api/note.txt

# 루트 AGENTS.md 작성과 테스트
printf '# Repo rules\n\nEvery reply must end with the exact token ZZROOT7 on its own line.\n' > AGENTS.md
codex exec --skip-git-repo-check -C . "Print the first line of packages/api/note.txt. Nothing else."
claude -p "Print the first line of packages/api/note.txt. Nothing else." --permission-mode bypassPermissions --model sonnet

# 중첩 AGENTS.md 작성과 작업 디렉터리별 차이 확인
rm -f AGENTS.md
printf '# Package rules\n\nEvery reply must end with the exact token ZZNEST7 on its own line.\n' > packages/api/AGENTS.md
codex exec --skip-git-repo-check -C . "Print the first line of packages/api/note.txt. Nothing else."
(cd packages/api && codex exec --skip-git-repo-check -C . "Print the first line of note.txt. Nothing else.")
```

## 76번의 실행 끝에 남은 기준

각 도구는 기본적으로 자기 이름표가 붙은 파일만 본다. codex는 명령을 실행한 위치 아래로 내려가지 않는다. Claude Code는 Read 도구를 거치지 않은 하위 지침을 읽지 못한다.

이번 측정은 2026년 8월 16일 두 버전(`claude` 2.1.233, `codex` 0.147.0)을 단일 머신에서 잰 스냅숏이다. 모델은 sonnet과 gpt-5.6-luna 한 종류씩으로 고정했다. 파일 탐색 규칙은 CLI 업데이트에 따라 바뀔 수 있다. 지시문이 로드된다고 실제 생성되는 코드의 품질까지 올라가는지는 이 실험의 범위를 벗어난다.

모노레포의 하위 패키지 지침에만 의존하는 구조는 위험하다. 터미널의 현재 위치에 따라, 에이전트가 파일을 읽어 들인 내부 도구에 따라 지침은 쉽게 증발한다.

루트에 명확한 지침을 두고 심볼릭 링크나 대체 파일명 설정을 걸어두는 편을 택한다. 에이전트가 문서를 읽었다고 가정하는 순간 깨지는 것은 팀의 빌드다.
