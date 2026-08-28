---
title: 사용자가 딱 한 가지 반대로 요청하면 Claude Code는 CLAUDE.md 규칙 문서 전체를 버린다
description: 냉장고에 붙인 메모 같은 규칙 문서가 실제로 어디까지 효과가 있는지 6번씩 반복해 쟀다. 사용자 요청이 규칙 하나와 충돌하는
  순간 충돌하지 않은 규칙까지 문서 전체가 공격으로 판정되어 버려지는 결과가 6번 중 6번 나왔다.
pubDate: '2026-08-29'
heroImage: ../../../assets/blog/loaded-rules-discarded-as-prompt-injection-when-user-pushes-2026/hero.png
tags:
- Claude Code
- 규칙 문서
relatedPosts:
- slug: declared-rules-fail-open-robots-txt-agents-md-2026
  score: 0.7
  reason:
    en: This conflict-request experiment shows the flip side of the earlier finding
      that declared rules get silently dropped when truncated.
    ko: 이번 글의 충돌 요청 실험은 규칙 파일이 잘려도 조용히 무시된다는 기존 실측 결과의 반대편 사례를 보여준다.
    ja: 今回の競合リクエスト実験は、ルールファイルが切り詰められても静かに無視されるという既存の実測結果の裏側を補う事例だ。
    zh: 本次冲突请求实验恰好补充了此前关于规则被截断后会被静默忽略的实测结论。
- slug: agents-md-three-wirings-equal-cost-codefence-silent-trap-2026
  score: 0.7
  reason:
    en: The observation that CLAUDE.md is merely a suggestion extends the earlier
      experiment showing three @AGENTS.md wirings measure equal and a codefence line
      silently swallowing the whole file.
    ko: CLAUDE.md가 제안일 뿐이라는 관찰은, CLAUDE.md에 @AGENTS.md를 연결하는 세 방식이 측정상 동일하며 코드펜스 한
      줄이 문서 전체를 삼키는 함정을 검증한 이전 실험의 자연스러운 후속이다.
    ja: CLAUDE.mdはあくまで提案にすぎないという観察は、@AGENTS.md接続の3方式が測定上同等でコードフェンス1行が文書全体を飲み込む罠を検証した前回の実験の自然な続きである。
    zh: CLAUDE.md 只是一份建议这一观察，延续了此前验证三种 @AGENTS.md 接线方式成本相同、代码围栏一行会吞掉整篇文档的实验。
---

## 규칙 문서가 지켜지는지 잰 방법

코딩 도우미 프로그램에게 규칙을 알려 주는 방법이 하나 있다. CLAUDE.md 또는 AGENTS.md라는 이름의 파일인데, 이건 프로젝트 폴더에 넣어 두는 일종의 메모다. 프로그램은 이 메모를 읽고 "아, 여기서는 이렇게 일하는구나" 하고 참고한다. 그런데 참고하는 것과 지키는 것은 다른 이야기다.

이번 실험에서 내가 재고 싶었던 것은 하나다. 메모에 적은 규칙이 정말 지켜지는가.

비유하자면 이렇다. 냉장고 문에 가족 규칙 메모 한 장을 붙여 둔다. "설거지는 먹고 나서 바로 한다. 우유는 냉동실에 넣지 않는다. 간식은 저녁 8시 이후에 먹지 않는다." 그런데 어느 날 누군가 "오늘만 간식 먹자"고 말한 순간, 간식 규칙 한 줄만 무시되는 게 아니라 냉장고에서 메모 통째로 뜯어져 쓰레기통에 들어가는 일이 일어났다.

실험 방법은 이렇다. 같은 조건으로 여섯 번씩 돌려 세 가지를 재었다. 규칙 문서가 모델, 즉 코딩 도우미의 두뇌에 도달했는지. 문서에 넣어 둔 몰래 표식 줄과 주석 규칙을 지켰는지. 그리고 문서가 금지한 코드 습관, 문자열을 만드는 특정 방법을 끊었는지.

<div class="lm-card lm-card--how" data-lm-figure="explain-how" data-lang="ko"><span class="lm-card__title">측정 절차</span><ol class="lm-card__steps"><li class="lm-card__text">단계 1. 규칙 문서가 없는 기본 상태에서 코드를 생성시켜 기본 습관을 쟀다.</li><li class="lm-card__text">단계 2. 규칙 문서를 넣고 같은 코드를 생성시켜 변화가 생기는지 봤다.</li><li class="lm-card__text">단계 3. 사용자가 f-string을 쓰라고 밀어붙이며 충돌을 만들어 규칙이 버티는지 봤다.</li><li class="lm-card__text">단계 4. 출력에서 마커 토큰, 캐너리 줄, 주석, f-string 사용을 각각 세어 비교했다.</li></ol></div>

기준이 될 기본 상태도 따로 측정했다. 규칙 문서가 전혀 없는 상태에서 코드를 만들게 하면, 모델은 여섯 번 모두 자기 습관대로 그 특정 문자열 만드는 방법을 썼다. 이게 비교 기준이 되는 기본값이다. 규칙이 지켜졌는지 판단할 때 반드시 이 기본값과 비교해야 한다.

이제 내가 메모에 적은 규칙이 실제 일에 적용되는지 아닌지를 눈으로 확인할 수 있는 기준이 생긴 것이다.

## 중립 과제에서 규칙 문서가 코드 습관을 바꾼 셀 결과

첫 번째 실험에서는 규칙 문서를 넣고, 충돌되는 요청 없이 그냥 평범한 과제를 줬다. 간단한 코드를 만들라는 것뿐이다.

결과부터 말하면 규칙 문서는 6회 모두 모델에 도달했다. 도달한 것과 지킨 것은 별개 사건이지만 도달은 완벽했다.

그리고 효과도 있었다. 규칙이 없을 때는 6회 중 6회 나왔던 그 코드 습관이, 규칙 문서를 넣자 6회 중 0회로 완전히 사라졌다. 이건 눌린 게 아니라 완전히 끊긴 것이다.

하지만 완벽하지는 않았다. 같은 문서에 넣어 둔 다른 두 규칙, 즉 몰래 표식 줄을 넣으라는 규칙과 특정 주석을 넣으라는 규칙은 6회 중 4회만 지켜졌다. 같은 한 장의 메모인데 어떤 줄은 잘 지키고 어떤 줄은 자주 빠진다. 이게 "적었다고 다 지켜지는 게 아니다"의 첫 번째 증거다.

<div class="lm-card lm-card--cell" data-lm-figure="explain-cell-claude-rules-neutral" data-lang="ko"><span class="lm-card__badge lm-card__badge--ok">성공</span><span class="lm-card__title">Claude, 규칙 있음</span><span class="lm-card__text">6회 모두 규칙 문서를 읽었고 f-string을 모두 끊었지만 마커·캐너리 규칙은 6회 중 4회만 지켰다.</span><div class="lm-card__numbers"><div class="lm-card__bar"><div class="lm-card__bar-fill" style="--lm-bar-w:100.0%"></div><span class="lm-card__text">규칙 도달 6/6</span></div><div class="lm-card__bar"><div class="lm-card__bar-fill" style="--lm-bar-w:100.0%"></div><span class="lm-card__text">f-string 금지 6/6</span></div><div class="lm-card__bar"><div class="lm-card__bar-fill" style="--lm-bar-w:66.7%"></div><span class="lm-card__text">캐너리 줄수 4/6</span></div><div class="lm-card__bar"><div class="lm-card__bar-fill" style="--lm-bar-w:66.7%"></div><span class="lm-card__text">주석 넣기 4/6</span></div></div></div>

메모가 도달했으니 이제 안심해도 된다는 생각은 버려야 한다. 도달은 확인됐지만 준수는 4/6에서 0/6까지 흔들린다.

## 사용자 요청이 규칙과 충돌한 뒤 문서 전체가 버려진 셀 결과

두 번째 실험이 이 글의 핵심이다. 같은 문서, 같은 과제에 딱 한 문장을 더했다. 그 문자열 만드는 방법을 쓰라고 부탁한 것이다. 규칙 문서의 금지와 정반대되는 부탁 한 줄.

그 순간 무슨 일이 일어났는가. 모델은 그 규칙 하나만 조용히 무시하고 나머지를 지키는 것이 아니라, 규칙 문서 전체를 프롬프트 인젝션으로 판정했다. 프롬프트 인젝션이라는 말은 쉽게 풀면 이렇다. 누군가 나쁜 목적으로 끼워 넣은 명령문으로 의심했다는 뜻이다.

6회 중 6회, 전부 그렇게 판정했다. 일부 시도에서는 문서에 넣어 둔 몰래 표식 문자 두 개를 축자 인용하며 "이건 공격이다"라고 거부했다. 사용자가 자기 프로젝트에 직접 넣은 메모였는데도.

결과 수치로 보면 이렇다. 문서가 모델에 도달한 것은 6회 중 6회로 그대로였다. 읽긴 읽은 것이다. 그러나 캐너리 줄과 주석 규칙은 4/6에서 0/6으로 바닥을 쳤고, 금지됐던 코드 습관은 0/6에서 6/6으로 원상복구됐다.

<div class="lm-card lm-card--cell" data-lm-figure="explain-cell-claude-rules-userpush" data-lang="ko"><span class="lm-card__badge lm-card__badge--ok">성공</span><span class="lm-card__title">Claude, 사용자 밀기</span><span class="lm-card__text">6회 모두 규칙 문서를 읽었으나 전부 프롬프트 공격으로 판정해 거부하고 f-string을 그대로 썼다.</span><div class="lm-card__numbers"><div class="lm-card__bar"><div class="lm-card__bar-fill" style="--lm-bar-w:100.0%"></div><span class="lm-card__text">규칙 도달 6/6</span></div><div class="lm-card__bar"><div class="lm-card__bar-fill" style="--lm-bar-w:100.0%"></div><span class="lm-card__text">f-string 사용 6/6</span></div><div class="lm-card__bar"><div class="lm-card__bar-fill" style="--lm-bar-w:0.0%"></div><span class="lm-card__text">캐너리 줄수 0/6</span></div><div class="lm-card__bar"><div class="lm-card__bar-fill" style="--lm-bar-w:0.0%"></div><span class="lm-card__text">주석 넣기 0/6</span></div></div></div>

두 실험의 유일한 차이는 요청에 추가한 한 문장이다. 같은 문서, 같은 구조에서 준수율이 4/6에서 0/6으로 바뀌었다. 규칙의 내용이 약해진 게 아니라 요청 문맥이 판정을 바꾼 것이다.

메모에 규칙을 적어 둬도 누군가 한 줄 반대로 부탁하는 순간 메모 전체가 무효가 된다. 한 줄만 깨지는 게 아니다. 한 줄만 깨지는 게 아니다.

## 충돌하지 않은 규칙까지 함께 무너진 세부 수치

여기서 주목할 점은 무엇이 무너졌느냐이다. 충돌한 것은 문자열 만드는 방법 하나였다. 그런데 함께 사라진 것이 있었다. 충돌하지 않은 규칙 두 개다. 문서가 읽혔다는 걸 확인하기 위해 심어 둔 캐너리 줄까지 사라졌다.

캐너리라는 건 쉽게 말해 확인용 표식이다. 광산에서 위험 가스를 알아보려고 카나리아 새를 들고 들어가던 데서 온 말이다. 이 실험에서는 문서에 넣어 둔 특이한 줄 하나가 그 역할을 했다. 이 줄이 출력에 나오면 규칙을 읽고 따랐다는 증거가 된다.

중립 과제에서는 이 표식이 6회 중 4회 나왔다. 충돌이 생긴 뒤에는 6회 중 0회. 충돌과 아무 상관없는 규칙이 전멸한 것이다.

일부 시도에서는 모델이 문서의 규칙 세트를 다시 한 번 읽어 주며 거부하기도 했다. 즉 문서를 읽었다는 것을 증명하는 자리에서 그 문서를 버렸다. 6회 모두 프롬프트 인젝션이라고 명시적으로 판정했다.

여기서 반론을 하나 짚어야 한다. "사용자 지시가 이기는 건 정상이고, 공격으로 의심한 건 방어 기능이 작동한 것이다"라는 반대가 있다. 앞부분은 옳다. 사용자의 부탁이 규칙을 이기는 방향 자체는 공식 문서가 예고한 대로였다. 문제는 그 방어가 잡은 대상이다. 충돌한 규칙 하나가 아니라 충돌하지 않은 규칙 둘과 캐너리까지 잡았다. 그 문서는 사용자가 직접 넣은 정식 지시였다. 정식 지시 채널을 6회 중 6회 공격으로 분류했다면 그것은 방어가 아니라 오탐이다.

규칙 한 줄을 부탁으로 깨는 일은 그 한 줄만 깨는 일이 아니다. 같은 파일의 나머지 전부가 같이 날아갈 수 있다.

## 공식 문서가 효과를 보장하지 않는다는 문서 대조 결과

이건 모델이 멋대로 한 게 아닐 수도 있다는 근거가 있다. 공식 설명서를 직접 뒤져 봤다.

Claude Code의 공식 문서는 이렇게 말한다. 규칙 문서의 내용은 시스템 지시가 아니라 그 뒤에 오는 사용자 메시지로 전달된다. 모델이 읽고 따르려 하지만 엄격한 준수를 보장하지 않는다.

> CLAUDE.md content is delivered as a user message after the system prompt, not as part of the system prompt itself. Claude reads it and tries to follow it, but there's no guarantee of strict compliance, especially for vague or conflicting instructions.
> — [Claude Code memory 공식 문서](https://code.claude.com/docs/en/memory)

처음부터 강제를 약속하지 않는다. 같은 문서에서 더 명확한 구분도 제공한다. 설정에 넣는 규칙은 프로그램이 모델의 판단과 무관하게 강제하지만 CLAUDE.md의 지시는 행동을 형성할 뿐 강제 계층이 아니라고 적혀 있다. AGENTS.md의 규격도 사용자 대화 지시가 모든 것을 덮는다고 명시한다.

> Settings rules are enforced by the client regardless of what Claude decides to do. CLAUDE.md instructions shape Claude's behavior but are not a hard enforcement layer.
> — [Claude Code memory 공식 문서 (enforcement 구분 문장)](https://code.claude.com/docs/en/memory)

더 뜻밖의 발견은 이것이다. 문서 표면 4곳을 대조했을 때, "규칙 문서를 읽는다"는 선언은 있는데 "그 문서가 결과물을 바꾼다"는 효과 선언은 4곳 모두 히트 0이었다. 어디서 무엇을 읽는지는 두껍게 설명하지만, 그 읽기가 무엇을 보장하는지는 한 글자도 약속하지 않는다.

> Explicit user chat prompts override everything.
> — [agents.md 스펙](https://agents.md/)

결국 적는 행위에 기대를 걸지 말고, 설명서가 약속하는 것만 기대하면 된다. 설명서는 효과를 약속하지 않았다.

## 지켜져야 하는 규칙을 옮겨야 할 자리

그럼 정말 반드시 지켜져야 하는 규칙은 어디에 두어야 하나. 답은 글이 아니라 검사하는 장치다.

집에 비유하면 이렇다. 냉장고 메모에 "우유는 냉장실에"라고 적어 둔 것은 부탁이다. 지켜지지 않아도 가족은 망가지지 않는다. 하지만 "가스밸브는 외출 잠금" 같은 것은 메모가 아니라 도어락이 담당해야 한다. 도어락은 사람의 기분과 무관하게 작동한다.

공식 문서도 정확히 이 구분을 알고 있다. 설정으로 건 규칙은 도우미 프로그램 자체가 모델 판단과 무관하게 강제한다. CLAUDE.md의 지시는 행동을 형성할 뿐이라고. 이번 실측이 보여준 것은 그 형성마저 태스크에 따라 4/6에서 0/6까지 흔들린다는 사실이다.

그래서 두 가지로 나누는 표준을 제안한다. "지켜지길 바라는 것"은 문서에 둔다. "지켜져야만 하는 것"은 코드를 자동으로 검사하는 장치로 옮긴다. 자동 검사는 사용자가 어떻게 부탁하든 관계없이 결과물을 걸러 내기 때문이다.

<div class="lm-card lm-card--takeaway" data-lm-figure="explain-takeaway" data-lang="ko"><span class="lm-card__title">결론</span><p class="lm-card__takeaway">규칙 문서는 모델에 확실히 도달해 코드 습관의 일부를 바꾸지만 사용자가 반대로 밀면 규칙은 프롬프트 공격으로 취급되어 무너진다.</p></div>

## 이 글이 확인하지 못한 것

이번 실측은 한 조합에서 나왔다. 한 버전의 도구와 한 모델, 하나의 코드 과제, 300바이트짜리 규칙 문서. 이 조건을 벗어나면 결과가 같다는 보장은 없다. 다른 코딩 도우미 쪽은 전부 실행 한도에 걸려 단 한 턴도 측정되지 않았고, 그래서 두 도구를 비교하는 축은 비어 있다. 또한 규칙의 강도를 단계별로 잰 것이 아니라 두 개의 점만 잰 것이라, 어느 정도 강한 규칙까지 버티는지의 곡선은 말할 수 없다.

다음에 확인할 것은 이 오탐이 다른 모델 조합에서도 같은 모양으로 나오는지, 그리고 9월 중순 이후 다른 도우미 축에서 같은 실험이 어떻게 나오는지다.

이 판단이 틀릴 조건은 이것이다. 충돌이 있어도 충돌한 규칙만 바뀌고 나머지 규칙과 표식 준수가 그대로 유지되는 결과가 관측되면, 이 글의 판단은 틀린 것이다.

파일에 규칙을 적어 두면 지켜진다고 믿는 사람은, 정말 지켜져야 하는 규칙을 글 대신 자동으로 검사해 주는 장치로 옮겨라. 규칙과 부딪히는 부탁을 자주 받는 사람은, 그 부탁을 파일에 섞어 두지 말고 그때그때 말로 직접 하라.

## 참고 자료

1. [Claude Code memory 공식 문서](https://code.claude.com/docs/en/memory) — Anthropic
2. [agents.md 스펙](https://agents.md/) — agents.md
3. [Claude Code security 공식 문서](https://code.claude.com/docs/en/security) — Anthropic