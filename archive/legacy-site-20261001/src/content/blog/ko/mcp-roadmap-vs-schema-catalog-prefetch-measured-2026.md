---
title: 'MCP 로드맵에 적힌 기능은 MCP 스키마에 아직 없다'
description: '시장 앞 전단지에 적힌 물건과 진열대에 실제 놓인 물건은 다르다. 공식 계획 문서에 이름이 있는 기능이 규격 문서에는 없는 현실을 직접 재서 확인했다.'
pubDate: '2026-09-02'
heroImage: ../../../assets/blog/mcp-roadmap-vs-schema-catalog-prefetch-measured-2026/hero.png
tags:
- MCP
- 실측
---

## 측정한 것과 측정 방법

프로그램끼리 서로 도구를 빌려 쓰게 해 주는 규칙인 MCP 에는 두 종류의 문서가 있다. 하나는 앞으로 만들 기능을 적은 계획 문서인 로드맵이다. 다른 하나는 지금 실제로 존재하는 기능만 적은 규격 문서인 스키마다. 이 글은 이 두 문서가 얼마나 다른지, 그리고 프로그램을 연결하는 순간 무엇이 일어나는지를 직접 재었다.

재는 방법은 단순했다. 먼저 규격 문서 네 버전에서 계획 문서에 적힌 기능 이름들이 몇 번 나오는지 세었다. 다음으로 도구 목록이 20개인 경우와 200개인 경우를 비교했다. 프로그램이 연결되는 순간 오가는 데이터 크기를 재었다.

<div class="lm-card lm-card--how" data-lm-figure="explain-how" data-lang="ko"><span class="lm-card__title">측정 절차</span><ol class="lm-card__steps"><li class="lm-card__text">단계 1. schema-surface-classify 를 실행해 결과를 셌다.</li><li class="lm-card__text">단계 2. docs-corpus-surface-classify 를 3회 실행해 결과를 셌다.</li><li class="lm-card__text">단계 3. claude-catalog-200-page20 를 3회 실행해 결과를 셌다.</li><li class="lm-card__text">단계 4. codex-catalog-200-page20 를 3회 실행해 결과를 셌다.</li><li class="lm-card__text">단계 5. claude-catalog-20-singlepage 를 3회 실행해 결과를 셌다.</li></ol></div>

측정은 2026-08-25 하루, 한 대의 컴퓨터에서 했다. 그러니 결과는 그날 그 환경에서 확인된 사실이고, 모든 환경에서 똑같다고 단언할 수는 없다.

## 연결 시점 카탈로그 크기 실측

이 부분이 이 글의 두 번째 질문이다. 프로그램이 도구를 제공하는 쪽에 연결되는 순간, 그 안의 목록이 어떻게 들어오는가.

시장에 가면 진열대에 물건이 줄지어 있다. 사장은 물건을 다 꺼내 놓았는데, 손님이 장바구니에 뭘 담을지는 손님이 정한다. 그런데 어떤 가게는 손님이 문을 여는 순간 진열대의 물건 전부를 장바구니에 담아 준다.

claude 라는 프로그램이 그런 가게였다. 도구가 200개인 목록에 연결하자, claude 는 목록을 10페이지로 나눠 담는 방식대로 10페이지 전부를 한꺼번에 가져왔다. 3번 재어 3번 모두 그랬다. 데이터 크기로는 총 62,708바이트였다. 도구가 20개뿐인 목록에서 한 번에 오는 크기는 6,235B 였으니, 정확히 10.06배다.

<div class="lm-card lm-card--cell" data-lm-figure="explain-cell-claude-catalog-200-page20" data-lang="ko"><span class="lm-card__badge lm-card__badge--ok">성공</span><span class="lm-card__title">claude-catalog-200-p</span><span class="lm-card__text">사용 가능한 실행 3/3회, 조건 충족 3회.</span><div class="lm-card__numbers"><div class="lm-card__bar"><div class="lm-card__bar-fill" style="--lm-bar-w:100.0%"></div><span class="lm-card__text">실행 성공 3/3</span></div><div class="lm-card__bar"><div class="lm-card__bar-fill" style="--lm-bar-w:100.0%"></div><span class="lm-card__text">조건 충족 3/3</span></div></div></div>

여기서 중요한 점이 하나 있다. 규격 문서는 목록을 나눠 담는 방법만 정해 놓았을 뿐, 끝까지 다 읽으라고 요구하지 않는다. 첫 장만 가져가도 규칙 위반이 아니다. 10페이지를 통째로 가져온 것은 claude 가 그렇게 동작하기 때문이다. 즉 진열대를 통째로 장바구니에 담는 것은 가게 규칙의 결함이 아니다. 그 장바구니를 든 손님 쪽 습관의 문제다.

도구를 목록으로 만들어 건네는 쪽이라면 미리 크기를 재야 한다. 연결되는 순간 목록 전체가 한 번에 들어오는 크기를 비용 계산에 넣어야 한다.

## 스키마 네 버전 키워드 집계 결과

이제 첫 번째 질문으로 돌아가자. 계획 문서에 적힌 기능이 규격 문서에도 실제로 있는가.

규격 문서는 버전이 찍혀서 나온다. 이번에는 2025-06-18, 2025-11-25, 2026-07-28, 그리고 아직 확정되지 않은 초안을 비교했다. 계획 문서에 이름이 올라온 기능 네 가지를 찾아 세었다. 찾은 기준은 단순하다. 그 이름이 문서 안에서 몇 번 나오는가.

결과는 0회였다. 네 가지 기능 모두, 네 버전 모두에서 한 번도 나오지 않았다.

<div class="lm-card lm-card--cell" data-lm-figure="explain-cell-schema-surface-classify" data-lang="ko"><span class="lm-card__badge lm-card__badge--ok">성공</span><span class="lm-card__title">schema-surface-class</span><span class="lm-card__text">사용 가능한 실행 3/3회, 조건 충족 3회.</span><div class="lm-card__numbers"><div class="lm-card__bar"><div class="lm-card__bar-fill" style="--lm-bar-w:100.0%"></div><span class="lm-card__text">실행 성공 3/3</span></div><div class="lm-card__bar"><div class="lm-card__bar-fill" style="--lm-bar-w:100.0%"></div><span class="lm-card__text">조건 충족 3/3</span></div></div></div>

이는 전단지에 적혀 있는데 진열대에 없는 물건과 같은 상황이다. 기능 소식을 접하고 도입을 검토하는 사람은 주의해야 한다. 전단지 문장을 근거로 쓰면, 실제로 쓸 수 있는 것이 하나도 없는 설계를 만들 수 있다.

물론 반대 말도 있다. 계획 문서는 원래 아직 안 온 것들을 적는 곳이니, 그걸 규격처럼 읽는 건 독자 탓이라는 주장이다. 절반은 맞다. 그러나 실측 결과가 보여 주는 건 다른 것이다. 계획 문서에 적힌 항목끼리도 실제 규격까지의 거리가 제각각인데, 문장에는 그 차이가 전혀 드러나지 않는다. 같은 문체로 적혀 있으니 읽는 사람은 구별할 방법이 없다.

## tasks 항목의 스키마 진입과 제외

항목마다 그 거리가 다르다는 것은 실제 사례로 확인됐다. 계획 문서에 적힌 항목 가운데 tasks 라는 이름의 기능은 한때 규격에 실제로 들어갔다.

2025-11-25 에 나온 규격 버전에서 tasks 라는 단어는 25번 나왔다. 진열대에 실제로 올라온 것이다. 그런데 현행 2026-07-28 버전에서는 0회다. 규격에서 다시 빠진 것이다.

전단지에 있던 물건이 진열대에 올라왔다가 다시 내려간 셈이다. 이 한 사례만으로도 계획에 있다는 말은 규격에 들어 있다는 보장이 아니다. 심지어 들어갔던 것도 나갈 수 있다는 것이 확인된다. 다만 왜 빠졌는지는 이번 측정으로 알 수 없었다.

문서를 읽고 도입을 판단하는 쪽이라면, 근거 문장에서 계획에 있다는 표현을 지우고 몇 번째 버전에서 몇 번 나오는지로 바꿔 적어야 한다.

## 로드맵 인용 대신 스키마 버전 표기

그래서 결론은 간단하다. 같은 문서 사이트 안에도 갱신 속도와 구속력이 다른 층이 여러 개 있다. 계획 문서는 바뀌기 쉽고, 버전이 찍힌 규격은 그때그때 확정된 것만 담는다. 두 문서를 같은 눈으로 읽으면 안 된다.

결국 남는 요점은 한 가지다. 기술 문서에서 계획에 있다는 말과 규격에 들어 있다는 것은 다르며, 프로그램을 연결하는 순간 그 안의 목록 전체가 한꺼번에 불러와질 수 있다는 사실이다.

<div class="lm-card lm-card--takeaway" data-lm-figure="explain-takeaway" data-lang="ko"><span class="lm-card__title">결론</span><p class="lm-card__takeaway">자동 요약을 만들지 못해 측정 숫자만 싣는다.</p></div>

## 이 글이 확인하지 못한 것

이번에 확인하지 못한 것도 분명히 해 둔다. 첫째, codex 라는 또 다른 프로그램은 같은 목록을 어떻게 처리하는지 재지 못했다. 사용량 한도에 걸려 세 번 모두 실행되지 않았으니, 여러 프로그램이 그렇다고 말할 근거는 없다. 둘째, 데이터 크기를 실제 대화에 쓰이는 양으로 환산한 점유율과, 62,708B 가 한꺼번에 들어올 때 응답 속도나 품질에 미치는 영향은 재지 않았다. 셋째, 목록을 나눠 담는 방식에서 첫 장에서 멈추게 만드는 설정이 있는지도 확인하지 못했다. 다음에는 다른 프로그램의 연결 시점 동작과 그 설정의 존재 여부를 확인할 것이다.

그리고 이 판단이 틀릴 조건은 두 가지다. 지금 규격 문서에서 계획 단계의 항목이 실제로 발견되면 이 판단은 바뀐다. 목록을 끝까지 읽으라고 규격이 요구하는 문장이 발견되어도 마찬가지다.

## 참고 자료

1. [MCP Roadmap](https://modelcontextprotocol.io/development/roadmap) — modelcontextprotocol.io, 2026-08-25 확인
2. [MCP JSON Schema (2025-06-18, 2025-11-25, 2026-07-28, draft)](https://raw.githubusercontent.com/modelcontextprotocol/modelcontextprotocol/main/schema/2026-07-28/schema.json) — github.com/modelcontextprotocol, 2026-08-25 확인
3. [MCP 문서 코퍼스 (llms-full.txt, 약 2.37MB)](https://modelcontextprotocol.io/llms-full.txt) — modelcontextprotocol.io, 2026-08-25 확인