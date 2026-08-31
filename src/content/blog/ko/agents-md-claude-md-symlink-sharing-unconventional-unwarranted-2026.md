---
title: AGENTS.md 와 CLAUDE.md 를 심볼릭 링크로 묶는 방법은 오늘도 통하지만, 이를 보증하는 문서는 어디에도 없다
description: 두 프로그램에 규칙 문서 한 벌을 나눠 먹이는 심볼릭 링크 방법이 흔한 관행이 됐다. 그러나 링크가 동작하는 것은 어느 도구의
  약속이 아니라 파일이 그 자리에 있어서이며, 폴더를 옮기면 절대 경로 링크는 끊긴다.
pubDate: '2026-08-31'
heroImage: ../../../assets/blog/agents-md-claude-md-symlink-sharing-unconventional-unwarranted-2026/hero.png
tags:
- AGENTS.md
- CLAUDE.md
relatedPosts:
- slug: claude-md-reachability-bound-to-cwd-lazy-loaded-rules-half-obeyed-2026
  score: 0.7
  reason:
    en: The symlink fragility examined here supplies the supporting evidence for the
      previous post's finding that CLAUDE.md loading depends on the session folder,
      not just where the file sits.
    ko: 이번 글이 다룬 CLAUDE.md 심링크의 취약성은, CLAUDE.md가 세션 폴더 기준으로 로딩된다는 기존 글의 규칙 도달 범위 분석이
      없었다면 발견하기 어려웠을 뒷받침 근거를 제공한다.
    ja: 本記事で扱うCLAUDE.mdのシンボリックリンクの脆弱性は、CLAUDE.mdがセッションフォルダを基準に読み込まれるという前記事のルール到達範囲の分析があってこそ見えてくる裏付けの根拠を示す。
    zh: 本文探讨的 CLAUDE.md 符号链接脆弱性，为上一篇关于 CLAUDE.md 依会话文件夹加载的规则适用范围分析提供了支撑证据。
- slug: loaded-rules-discarded-as-prompt-injection-when-user-pushes-2026
  score: 0.7
  reason:
    en: If the symlink trick for sharing CLAUDE.md with AGENTS.md carries no official
      guarantee and can break at any time, reading it alongside the earlier post where
      loaded CLAUDE.md rules get discarded entirely by a single contrary user request
      reveals the full fragility of rules files.
    ko: 심링크로 CLAUDE.md를 AGENTS.md와 공유하는 요령이 공식 보장 없이 언제든 깨질 수 있다면, 그 CLAUDE.md 규칙이
      실제로 로드됐다가도 사용자 반대 요청 한 번에 통째로 버려지는 기존 글과 함께 읽어야 규칙 파일의 취약성 전체가 보인다.
    ja: シムリンクで CLAUDE.md を AGENTS.md と共有する小技が公式保証なしにいつ壊れてもおかしくないなら、その CLAUDE.md ルールがユーザーの反対要求一回で丸ごと捨てられる既存記事と併せて読むことで、ルールファイルの脆さの全体像が見えてくる。
    zh: 既然用符号链接让 CLAUDE.md 与 AGENTS.md 共享的技巧没有官方保证、随时可能失效，那么把它与已有文章中 CLAUDE.md 规则被用户一句相反请求就整个丢弃的情况对照阅读，才能看清规则文件脆弱性的全貌。
---

## AGENTS.md 와 CLAUDE.md 를 한 벌로 묶는 공유 관행

요즘 AI 보조 프로그램은 자기 규칙이 적힌 문서를 폴더에서 찾아 읽는다. AGENTS.md 는 여러 프로그램이 함께 읽기로 약속된 설명서 이름이고, CLAUDE.md 는 Claude Code 라는 프로그램이 읽는 설명서 이름이다. 문제는 두 프로그램이 같은 일을 하는데 서로 다른 이름의 문서를 찾는다는 점이다.

그래서 사람들은 편법을 하나 썼다. 문서를 두 벌 만들지 않고, CLAUDE.md 라는 이름표를 붙인 링크를 AGENTS.md 에 걸어 두는 방법이다. 이 링크를 심볼릭 링크라고 부른다. 심볼릭 링크는 파일의 진짜 내용이 어디 있는지를 가리키기만 하는 작은 대리 파일이다.

이 방법은 요즘 정답 해법처럼 퍼졌다. 그런데 이상한 점이 있다. 아무도 이 방법이 앞으로도 통한다고 약속한 적이 없다.

동네에 가게가 여러 개 있다고 상상해 보자. 손님이 헷갈리지 않게, 가게들은 자기 문 앞에 팻말을 내건다. 한 가게의 팻말이 옆집 가게 방향을 가리키는 셈이다. 오늘 손님은 팻말을 보고 옆집으로 잘 걸어 가서 거래를 마친다. 하지만 팻말이 옆집을 가리켜도 된다는 규칙은 어디에도 적혀 있지 않다. 손님이 그냥 팻말을 따라 걸을 뿐이다. 어느 날 손님이 팻말을 무시하면, 아무도 항의할 근거가 없다.

요즘 쓰이는 이 흔한 방법은 누구의 약속도 아니다. 오늘 파일이 그 자리에 있어서 통하는 것이고, 

## 문서 표면 세 곳에서의 확인 결과

관행이 퍼진 만큼, 어딘가에는 보증 문서가 있을 법하다. 그래서 문서 세 곳을 찾아 읽었다.

첫째는 Claude Code 의 변경 기록이다. 변경 기록은 프로그램이 버전을 올릴 때 무엇이 바뀌었는지 남기는 일지다. 여기에 AGENTS.md 를 직접 읽는다는 항목이 있었다면 그것이 보증이다. 세 번 조회해 확인해 본 결과, AGENTS.md 언급은 0건이었다. 같은 기록에서 CLAUDE.md 는 59건, 심볼릭 링크(앞서 소개한 대리 파일)는 72건 언급됐다. 직접 읽는다는 항목은 확인되지 않았다.

<div class="lm-card lm-card--cell" data-lm-figure="explain-cell-claude-changelog-agents-md-native" data-lang="ko"><span class="lm-card__badge lm-card__badge--ok">성공</span><span class="lm-card__title">변경 기록에 직접 읽기 항목</span><span class="lm-card__text">변경 기록 세 번 조회 모두 AGENTS.md 언급이 0건이었다. 같은 기록에서 CLAUDE.md 언급은 59건, symlink 언급은 72건 있었다. 직접 읽는다는 문서 항목은 확인되지 않았다.</span><div class="lm-card__numbers"><span class="lm-card__chip">AGENTS 언급 0</span><span class="lm-card__chip">CLAUDE 언급 59</span><span class="lm-card__chip">링크 언급 72</span></div></div>

둘째는 AGENTS.md 의 표준 문서다. 이 문서에서 symlink 관련 규정을 찾으면 금지든 허용이든 하나는 있어야 할 자리다. 결과는 심볼릭 링크라는 단어가 표기상 0건, symbolicLink라는 붙여쓰기 표기 1건뿐이었다. 이 한 건이 무엇을 뜻하는지는 이번에 확인하지 못했다.

셋째는 Codex 라는 프로그램의 공식 문서다. 심볼릭 링크 관련 단어와 크기 한도 등 관련 단어가 전부 0건이었다. 문서 세 곳 어디에도 이 배치의 보증은 없었다.

여기서 실제로 달라지는 건 이것이다. 링크 방법이 언제든 멈출 수 있다. 멈췄을 때 참고할 약속 문서는 존재하지 않는다.

## 측정 방법: 네 셀 열두 번의 실행

문장이 아니라 측정으로 확인했다. 검사를 네 칸으로 나눠 각각 3번씩 총 12번 돌렸다. 2026년 8월 30일, 리눅스라는 운영체제 환경에서 실행했다. 다른 프로그램이 끼어들지 못하게 갇혀 있는 작은 공간 안에서 돌렸다. AI 도구 자체는 한 번도 실행하지 않았다. 문서 읽기와 파일 검사만으로 답을 냈다.

<div class="lm-card lm-card--how" data-lm-figure="explain-how" data-lang="ko"><span class="lm-card__title">측정 절차</span><ol class="lm-card__steps"><li class="lm-card__text">단계 1. Claude Code의 공식 변경 기록에서 규칙 파일을 직접 읽는다는 항목이 있는지 찾았다.</li><li class="lm-card__text">단계 2. 짝을 이루는 symlink가 32KiB 크기 한도 검사에 같은 파일로 보이는지 검사를 시도했다.</li><li class="lm-card__text">단계 3. 규칙 파일들을 다른 위치로 옮긴 뒤 symlink가 아직 잘 연결되는지 확인했다.</li><li class="lm-card__text">단계 4. 규칙 파일 표준 문서와 코뎃스 문서에서 symlink 규정이 있는지 찾았다.</li><li class="lm-card__text">단계 5. AI 도구 자체는 실행하지 않고 문서 읽기와 파일 검사만으로 답을 냈다.</li></ol></div>

네 칸은 이렇다. 첫째, 변경 기록에서 직접 읽기 항목 찾기. 둘째, 링크가 파일 크기 한도 검사를 그대로 통과하는지 보기. 셋째, 파일을 다른 위치로 옮긴 뒤 링크가 살아 있는지 보기. 넷째, 규정 문서에서 링크 규정 찾기. 12번의 실행에서 결과가 매번 같게 나왔다.

이건 누군가의 인상이 아니라 같은 결과가 12번 반복된 측정이다.

## 폴더를 옮겼을 때 링크는 어떻게 되나

가장 뚜렷한 결과는 파일을 옮겼을 때 나왔다. 링크를 만드는 방식은 두 가지다. 절대 경로 링크는 진짜 파일의 전체 주소를 적어 둔 것이고, 상대 경로 링크는 지금 자리에서의 근처 위치만 가리킨 것이다.

비유로 덧붙이면 이렇다. 절대 링크는 팻말에 "서울시 ○○구 ○○동 123번지"라고 주소를 몽땅 박아 둔 것이다. 상대 링크는 "옆집 두 번째 문"이라고만 쓴 것이다. "옆집 두 번째 문"은 그대로 맞다. 하지만 "○○동 123번지"는 이제 텅 빈 옛터를 가리킨다.

측정이 이 비유대로 나왔다. 폴더를 통째로 옮긴 뒤 링크가 진짜 파일에 닿는지 확인한 세 번의 실행에서, 상대 링크는 세 번 모두 살아 있었다. 절대 링크는 세 번 모두 대상 파일을 찾지 못했다. 복사본은 애초에 링크가 아니라 진짜 사본이라 살아 있었다.

<div class="lm-card lm-card--cell" data-lm-figure="explain-cell-symlink-survives-relocation" data-lang="ko"><span class="lm-card__badge lm-card__badge--ok">성공</span><span class="lm-card__title">이동 후 생존</span><span class="lm-card__text">세 번 모두 상대 경로 링크는 이동 후에도 잘 연결됐다. 반면 절대 경로 링크는 대상을 못 찾았고, 복사본은 링크가 아닌 일반 파일이 됐다.</span><div class="lm-card__numbers"><div class="lm-card__bar"><div class="lm-card__bar-fill" style="--lm-bar-w:100.0%"></div><span class="lm-card__text">상대 링크 생존 3/3</span></div><div class="lm-card__bar"><div class="lm-card__bar-fill" style="--lm-bar-w:0.0%"></div><span class="lm-card__text">절대 링크 생존 0/3</span></div></div></div>

참고로 절대 링크가 죽을 때 나는 오류 이름이 있다. 파일 시스템이 "그런 파일이 없다"고 답하는 오류인데, 측정 기록에는 ENOENT 라고 남는다. 이 오류는 도구가 링크를 고의로 무시해서 생긴 것이 아니다. 링크라는 방식 자체가 옮겨진 뒤 대상을 찾지 못해서 생긴 것이다.

그러니까 내 입장에서 달라지는 건 이것이다. 내 프로젝트 폴더를 옮기거나 다른 컴퓨터로 가져가면, 절대 주소로 걸어 둔 링크는 오늘은 멀쩡하다가 그 순간 끊긴다.

## 32KiB 크기 한도 검사가 멈춘 자리

이 검사에는 막힌 자리도 있다. 규칙 문서에 크기 한도가 있을 수 있다는 점 때문에, 링크가 한도 검사에 진짜 파일처럼 보이는지를 확인하는 칸을 마련했다. 한도는 32KiB, 곧 파일 크기를 재는 단위로 3만 2768바이트에 해당하는 크기다. 링크를 건 파일이 이 크기를 넘으면 어떻게 처리되는지가 관심이었다.

결과는 아쉽게도 측정 자체가 이루어지지 못했다. 세 번의 시도 모두 파일이 없다는 오류로 멈췄고, 크기 비교는 한 번도 수행되지 못했다. 측정을 돕는 도구의 결함이 원인이어서, 링크가 크기 한도를 어떻게 통과하는지는 아직 아무도 모른다는 뜻이다.

<div class="lm-card lm-card--cell" data-lm-figure="explain-cell-symlink-projects-through-32k-boundary" data-lang="ko"><span class="lm-card__badge lm-card__badge--fail">실패</span><span class="lm-card__title">크기 한도 검사</span><span class="lm-card__text">세 번 시도 모두 파일이 없다는 오류로 멈췄다. 크기 비교는 한 번도 수행되지 못했고 실패로 기록됐다.</span><div class="lm-card__numbers"><div class="lm-card__bar"><div class="lm-card__bar-fill" style="--lm-bar-w:0.0%"></div><span class="lm-card__text">성공 시도 0/3</span></div></div></div>

여기서 내가 챙겨야 할 건 솔직함이다. 이 글은 링크의 거동을 전부 밝히지 못했다. 이 칸은 확인도 반증도 되지 않은 미지 상태로 남는다.

## 이 글이 확인하지 못한 것

이 글은 문서 표면 조사와 파일 검사만으로 답을 얻었다. 그래서 확인하지 못한 것이 세 가지다. 첫째, AI 도구를 실제로 실행해 보지 않았기 때문에 도구가 링크 너머의 진짜 파일을 실제로 읽었는지는 프로그램을 직접 돌려 봐야만 확정할 수 있다. 이번 측정에는 도구 실행이 금지돼 있었다. 둘째, 32KiB 크기 한도 검사는 도구 결함으로 시작되자마자 멈춰서, 링크가 한도에 그대로 통과되는지는 확인도 반증도 안 됐다. 셋째, AGENTS.md 표준 문서에 남은 symbolicLink 1건이 금지인지 허용인지 문맥을 읽지 못했다. 다음에 할 일은 크기 한도 검사를 고쳐 재실행하고, 도구를 실제로 실행해 링크가 가리키는 파일을 도구가 읽는지 검증하는 것이다.

또 하나 짚어 둘 반론이 있다. "기록 한 벌을 뒤졌다고 직접 읽지 않는다고 할 수 있냐"는 지적은 옳다. 기록에 없어도 프로그램이 파일을 읽을 수 있으므로, 이 글이 확정한 범위는 좁다. 문서 표면 어디에도 이 배치의 보증이 없다는 것, 그리고 폴더를 옮기는 사건에서 상대 링크만 살아 남는다는 것. 이 좁은 범위 안에서는 12번의 재현이 지지해 주고 있다.

이 판단이 틀릴 조건은 이것이다. Claude Code 의 변경 기록에 AGENTS.md 를 직접 읽는 항목이 새로 나타나거나, 문서 어디에선가 링크 쓰는 법을 보증하는 문장이 발견되면 이 글의 결론은 거둔다. 이 판단은 2026년 8월 30일에 기록 표면과 파일 측정에만 근거한다.

마지막으로, 이 관행을 어떻게 대할지는 두 부류로 나뉜다. 링크가 저절로 풀린 경험이 있어서 빼고 싶은 사람은, 점대점 주소 대신 옆방향만 가리키는 링크로 바꾸거나, 링크 대신 진짜 사본 파일을 두면 된다. 이 방식을 팀 규칙으로 정하려는 사람은, 팻말을 규칙에 적지 말고 팻말을 만들어 주는 사람과 매일 확인하는 사람을 자기 팀 쪽에 두면 된다.

## 참고 자료

1. [Claude Code CHANGELOG (raw scan target)](https://raw.githubusercontent.com/anthropics/claude-code/main/CHANGELOG.md) — Anthropic (raw.githubusercontent.com)
2. [AGENTS.md spec page (symlink 규정 부재 확인 대상)](https://agents.md/) — agents.md
3. [Codex 공식 문서·README (symlink·한도 규정 부재 확인 대상)](https://raw.githubusercontent.com/openai/codex) — OpenAI