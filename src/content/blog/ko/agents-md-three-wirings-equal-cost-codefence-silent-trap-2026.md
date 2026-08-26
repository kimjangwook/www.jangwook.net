---
pubDate: '2026-08-26'
title: AGENTS.md를 세 가지 방식으로 Claude Code에 물렸더니, 코드펜스 한 줄이 import를 통째로 껐다
description: '@import, 심볼릭 링크, 복사 세 배선의 실측 차이는 2,920 토큰 문서의 4%인 116 토큰. 진짜 함정은 CLAUDE.md
  안에 예시로 쓴 코드펜스 안의 @AGENTS.md 한 줄이다. 에러도, 신호도, 토큰 스파이크도 없다.'
heroImage: ../../../assets/blog/agents-md-three-wirings-equal-cost-codefence-silent-trap-2026/hero.png
tags:
- claude-code
- agents-md
- llm-engineering
- prompt-engineering
---

@import, 심볼릭 링크, 파일 복사. 이 세 가지가 AGENTS.md를 Claude Code에 연결하는 방식인지 알고 싶었다. 도구와 MCP 서버를 전부 껐다. `--tools ""`로 모델이 스스로 파일을 열 수 없게 하고, `--strict-mcp-config`로 MCP 서버를 전부 내렸다. 여섯 셀, 열여덟 런. claude 2.1.233, macOS darwin 25.5.0, 셀당 3회 반복. 결과가 나온 뒤 나는 세 배선이 아니라 코드펜스 한 줄을 보고 있었다.

2,920 토큰 문서, 세 배선의 차이는 116 토큰. 문서 한 벌의 4%다. 그런데 CLAUDE.md 안에 마크다운 코드펜스로 감싸 둔 `@AGENTS.md` 한 줄, 배선된 셀 중 유일하게 문서가 로드가 안 된다. 에러도 없다. 토큰 스파이크도 없다. total_input이 141 토큰만 오른다. 펜스 마커 세 줄과 `@AGENTS.md` 문자열 자체가 비활성 텍스트로 프롬프트에 들어간 것뿐이다.

팀에 CLAUDE.md에 코드펜스 안에서 `@AGENTS.md`를 언급하는 라인이 있으면, 그 import는 이미 죽었다. 나는 화요일 아침에 그 패턴을 grep하는 쪽이, 어떤 배선이 더 예쁜지 회의하는 쪽보다 낫다고 생각한다.

## 파서는 펜스 안을 보지 않는다

> "You can also reference other files using the @ syntax. For example, you can add @AGENTS.md to your CLAUDE.md file to import its contents."
> — [Memory files — Claude Code documentation](https://docs.anthropic.com/en/docs/claude-code/memory)

로더는 세션 시작 시 CLAUDE.md를 읽고 `@filename` 패턴을 스캔한다. 매치를 import 지시로 처리한다. 이 스캔은 마크다운 코드펜스와 코드 스팬 경계 밖에서만 일어난다. 펜스 안의 텍스트는 파서한테 그냥 문자열이다. `@AGENTS.md`가 펜스 마커 사이에 있으면 로더는 파일을 열지 않는다. 경고를 로그하지도 않고, 재시도하지도 않는다. 코드 블록 안의 달러 기호가 화폐가 아닌 것과 같은 이치다. `@`는 거기서 그냥 한 글자다.

펜스 셀의 total_input이 141 토큰 오른 것은 펜스 마커와 `@AGENTS.md` 문자열이 비활성 텍스트로 들어간 것이다. 2,920 토큰 문서는 프롬프트에 없다. "펜스 안에서 `@`를 찾지 못했다"는 실패 경로가 로더에 없다. 파일을 못 찾은 것이 아니라, 거기 보지 않은 것이다.

## 2,920 토큰 문서에 116 토큰

> "bare-agents 0/3 hit, total_input −2 vs control. at-import 3/3, 17978. symlink 3/3, 17856. copy 3/3, 17862. fenced-import ZZFENC85 0/3, total_input 15081."
> — [probe-2026-08-19 — lab.json + results](data/labs/probe-2026-08-19-claude-md-at-import-agents-md-vs-symlink-2026/)

| 셀 | 히트율 | total_input | copy 대비 |
|---|---|---|---|
| bare-agents (배선 없음) | 0/3 | control −2 | — |
| @import | 3/3 | 17,978 | +116 |
| symlink | 3/3 | 17,856 | −6 |
| copy | 3/3 | 17,862 | 0 |
| fenced @import | 0/3 | 15,081 | −2,781 |

캐너리 문서는 9,674 바이트. 3.31 바이트/토큰으로 2,920 토큰이 청구된다. @import는 copy보다 116 토큰 크고, symlink는 6 토큰 작다. 2,920 토큰 문서, 4퍼센트 차이. 세 방법은 기능적으로 동일하다. 전부 같은 2,920 토큰을 프롬프트에 넣는다. 차이는 import 메커니즘 자체의 오버헤드지, 품질 차이가 아니다.

## 세 배선, 하나의 기능

공식 문서가 @import, symlink, copy를 AGENTS.md를 참조하는 세 가지 방식으로 나란히 적어 둔다. 실제로는 세 가지가 로더 또는 파일시스템이 경로를 어떻게 해석하는지만 다르다. @import는 로더가 파싱 시점에 전개하는 문자열이고, symlink는 로더가 따라가는 파일시스템 엔트리이며, copy는 로더가 직접 읽는 리터럴 파일이다. 모델이 받는 프롬프트는 세 경우 모두 같은 2,920 토큰이다.

그러니까 이 선택은 기능 판단이 아니라 유지보수 취향이다. 하나 고르고, 커밋하고, 다시 안 고친다. 누군가 블로그 포스트를 읽고 symlink에서 @import로 바꾸는 팀은 116 토큰 차이를 두고 리뷰 시간을 태우는 것이다.

## "동등하다"가 멈추는 지점

가장 강한 반론을 먼저 받는다. 9,674 바이트, 셀당 3회, macOS 한 머신, claude 2.1.233 한 버전에서 잰 것이 "세 방법이 동등하다"를 뒷받침하지 못한다는 것이다. 2026-08-16 랩에서 같은 로더가 31 KiB, 48 KiB 문서에서 확률적 누락을 보였다. 50 KiB 이상 문서에서 세 배선의 총량이 여전히 116 토큰 이내로 붙는지 미확인이다.

그리고 codex 축. 2026-08-18 랩에서 이 계정의 codex 60 런이 전부 usage limit으로 죽었고, 해제 시각은 2026-09-15다. 같은 리포지토리에 codex와 claude를 동시에 돌리는 팀에게는 이 데이터셋이 절반만 답한다. "AGENTS.md를 어떻게 물리나"는 그 팀에 단일 도구 질문이 아니다.

범위를 인정한다. AGENTS.md가 32 KiB를 넘거나, codex와 claude를 나란히 돌리는 팀에게는 "동등하다"는 아직 확인되지 않은 주장이다. 9,674 바이트 문서, 단일 claude 세션에서는 세 배선이 같다.

## grep 한 줄과 lint 룰

팀에 한 말: `grep -n '@' CLAUDE.md`를 돌려, 코드펜스 안에 있는 @ 경로를 찾아라. 문서 템플릿 lint에 한 줄을 넣는다. 펜스 마커 사이에 @ 경로 금지. 30초 체크다.

펜스 함정은 버전 관련이 아니다. OS 관련도 아니다. 파싱 규칙이다. 로더는 2.1.233에서 펜스 안을 보지 않고, 다음 분기 ships 하는 버전에서도 펜스 안을 보지 않는다. 패치가 고치는 버그가 아니라 구조다.

마크다운 포맷터, prettier 설정, CI lint, CLAUDE.md를 포맷팅하는 어떤 도구가 예시 라인을 코드펜스로 감쌀 수 있다. 그 포맷팅 이후에 새 세션을 여는 사람은 import가 죽었다는 걸 모른다. 신호가 없다. 에러가 없다. 성능 지표가 degrad되지도 않는다. 2,920 토큰이 그냥 없는 것이다.

## 죽은 import가 분기마다 먹히는 비용

엔지니어 8명 팀, 각자 하루에 세 번 새 세션을 연다고 하면 분기당 1,440 세션이다. 규칙 문서가 2,920 토큰이고 프롬프트에 없으면, 그 세션 전부 컨텍스트 없이 시작한다. 모델은 추측한다. 쓸데없는 확인 질문으로 턴을 태운다. 당신이 쓴 컨벤션을 위반하는 코드를 뽑는다.

이건 대시보드에 안 나온다. 느려진 코드 리뷰로 보인다. 모델이 네이밍 컨벤션을 몰라서 두 바퀴 더 도는 PR로 보인다. 문서에 이미 답한 질문을 주니어가 슬랙에 던지는 장면으로 보인다. 2,920 토큰은 싸다. 그 토큰이 막아 주는 리뷰 시간은 아니다.

## 이 데이터셋이 답하지 못하는 것

4홉 재귀 import. 공식 문서가 최대 4홉이라고 적지만, 이번 셀은 1홉만 걸었다. 펜스 규칙이 2홉, 3홉, 4홉에서 성립하는지 미확인.

삽입 위치. total_input으로 문서가 프롬프트에 들어간 것은 확인된다. 어디에 들어가는지는 모른다. 시스템 프롬프트 이후? 첫 유저 메시지 앞? raw 데이터에 여섯 셀 중 두 셀에서 109 토큰 변이가 있는데, 가용 필드로 설명이 안 된다.

50 KiB 이상 문서. codex 축. 둘 다 열려 있다.

내 판단은 이렇다. AGENTS.md를 아직 Claude Code에 연결하지 않은 팀은 세 방법 중 아무거나 고르고, 고른 뒤 다시 안 고친다. 116 토큰 차이는 의사결정 축이 아니다. 이미 연결해 쓰고 있는 팀은 이번 주에 CLAUDE.md에서 펜스 안의 @ 경로를 grep하라. 그게 유일한 체크다.

32 KiB 경계와 codex 축은 열린 질문이다. 2026-09-15에 usage limit이 해제되면 재측정한다. 9,674 바이트, 3회, 단일 버전 데이터셋에서 말할 수 있는 것과 프로덕션 분기에서 말할 수 있는 것은 다른 것이다.

펜스 마커 세 줄이 2,920 토큰 문서의 로드 여부를 가른다. 문서 형식이 곧 로드 프로토콜이라는 뜻이다. manifest도 없다. config 파일도 없다. CLAUDE.md 자체의 마크다운 문법이 import 메커니즘이다. 그러니까 CLAUDE.md를 포맷팅하는 모든 도구가 로드 패스 의존성이고, 그 어느 것도 펜스를 삽입할 때 경고하지 않는다.

## 참고 자료

- [Memory files — Claude Code documentation](https://docs.anthropic.com/en/docs/claude-code/memory)
- [probe-2026-08-19 — lab.json + results](data/labs/probe-2026-08-19-claude-md-at-import-agents-md-vs-symlink-2026/)