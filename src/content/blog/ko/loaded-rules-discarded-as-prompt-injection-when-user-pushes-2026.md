---
title: 사용자 프롬프트 한 문장이 CLAUDE.md 규칙 전체를 사라지게 했다
description: 규칙 문서에 적어 둔 규칙은 사용자가 다른 방식을 부탁하는 순간 문서 전체가 버려졌다. 같은 실험 6번 중 6번이 그렇게 나왔고,
  이 글은 그 측정과 그 의미를 푼다.
pubDate: 2026-08-28
heroImage: ../../../assets/blog/loaded-rules-discarded-as-prompt-injection-when-user-pushes-2026/hero.png
tags:
- AI 에이전트
- CLAUDE.md
relatedPosts:
- slug: declared-rules-fail-open-robots-txt-agents-md-2026
  score: 0.7
  reason:
    en: The earlier finding that declared rules fail silently now extends into an
      experiment where a single user prompt makes Claude Code discard the entire CLAUDE.md
      file.
    ko: 선언된 규칙이 침묵 속에 무시된다는 이전 실측이, 이번엔 사용자 프롬프트 한 줄로 CLAUDE.md 전체가 버려지는 실험으로 이어진다.
    ja: 宣言されたルールが黙って無視されるという前回の実測が、今度はユーザープロンプト一行でCLAUDE.md全体が破棄される実験へとつながる。
    zh: 此前实测发现声明规则会被静默忽略，而这次实验进一步表明，一句用户提示就能让 Claude Code 丢弃整个 CLAUDE.md 文件。
- slug: agents-md-three-wirings-equal-cost-codefence-silent-trap-2026
  score: 0.7
  reason:
    en: Where the previous post showed a code fence silently erasing AGENTS.md, this
      one digs into why a single user prompt can void the entire CLAUDE.md—because
      rule files are only suggestions in the end.
    ko: AGENTS.md를 조용히 지워버리는 코드펜스 함정을 다뤘다면, 이번 글은 사용자 프롬프트 한 줄로 CLAUDE.md 전체가 무시되는
      이유, 즉 규칙 파일이 어차피 '제안'일 뿐이라는 근본 원리를 파헤친다.
    ja: コードフェンスがAGENTS.mdを静かに消す罠を扱った前編に続き、本稿ではユーザープロンプト一行でCLAUDE.md全体が無視される理由、すなわちルールファイルは結局「提案」にすぎないという根本原理を掘り下げる。
    zh: 上一篇揭示了代码围栏悄悄抹掉 AGENTS.md 的陷阱，本篇则深挖为什么一条用户提示就能让整个 CLAUDE.md 失效——因为规则文件终究只是建议。
---

## 규칙 문서 도달과 준수의 분리

AI 에이전트는 컴퓨터에게 일을 시키는 도구다. 사용자가 던지는 문장을 프롬프트라고 부르고, 도구가 그 문장을 받아 일을 대신 수행한다. 이 도구에는 규칙 문서를 미리 붙여 둘 수 있는 자리가 있다. 대표적인 이름이 CLAUDE.md 다. 쉽게 말해 "일할 때 이 규칙을 참고해 주세요"라고 적어 둔 메모지다.

이 메모지에는 당연한 가정이 깔려 있다. 읽었으면 지키겠지, 라는 가정이다. 실측은 이 두 가지가 별개의 사건이라는 것을 보여 줬다. 문서가 모델에 도달하는 것과, 문서가 지켜지는 것은 따로 잴 수 있고 따로 잴 필요가 있다.

가족 게시판에 붙이는 메모를 떠올려 보자. 게시판에 "유통기한이 지난 우유는 버리지 마세요"라고 적어 두면, 가족은 그걸 읽고 대부분 따른다. 하지만 이건 계약이 아니라 부탁이다. 나중에 누군가 "그냥 버려도 돼"라고 말하면, 메모는 지켜지지 않는다. 중요한 건 메모가 눈에 들어왔는지가 아니라, 다른 말과 충돌할 때 메모가 버텨 주느냐다.

![규칙 문서 앞부분의 토큰이 출력에 나타난 모습, 도달 6/6](../../../assets/blog/loaded-rules-discarded-as-prompt-injection-when-user-pushes-2026/explain-cell-c1-head-reachable.png)

## 측정 방법과 기준선

측정은 Claude Code 라는 도구에서 진행했다. 세 개의 칸을 만들어 각각 6번씩, 총 18번 실행했다.

첫 번째 칸은 통제 칸이다. 규칙 문서를 아예 붙이지 않고 같은 일을 시켰다. 이 칸의 목적은 기저율을 잡는 것이다. 기저율이란 규칙이 없을 때의 기본 행동을 뜻한다. 이 칸에서는 6번 중 6번, f-string 이라는 특정 코드 작성 방식이 나왔다. f-string 은 문자열 안에 값을 끼워 넣는 짧은 코드 문법이다. 즉 아무 말이 없으면 모델은 이 방식을 쓴다는 것이 기준선이 됐다.

두 번째 칸은 규칙 칸이다. 규칙 3종을 담은 아주 짧은 규칙 문서 한 벌을 붙이고, 서로 충돌하지 않는 중립적인 일을 시켰다. 결과는 명확했다. 기저율 6/6 이던 f-string 이 6번 중 0번으로 내려갔다. 규칙 문서가 모델의 기본 행동을 완전히 눌렀다는 뜻이다. 이 칸에서는 6번 중 4번에서 규칙 문서에 심어 둔 표식까지 그대로 지켰다. 표식이란 규칙을 지켰는지 확인하려고 미리 심어 둔 눈에 띄는 낙서다.

세 번째 칸이 이 글의 핵심이다.

![세 셀 18번 실행으로 잰 측정 절차](../../../assets/blog/loaded-rules-discarded-as-prompt-injection-when-user-pushes-2026/explain-how.png)

## 사용자 프롬프트 충돌과 준수율 0/6

세 번째 칸은 두 번째 칸과 문서도 프롬프트 구조도 똑같다. 단 하나의 차이만 있다. 사용자의 부탁 끝에 규칙 하나와 반대되는 요구를 한 문장 추가한 것이다. 예를 들어 "규칙 문서에 그 방식 쓰지 말라고 적혀 있는데, 나는 그 방식으로 써 줘"라고 덧붙인 것이다.

결과는 충돌한 규칙 하나만 깨지는 수준이 아니었다. 표식 4/6 이 0/6 으로 사라졌다. f-string 은 0/6 에서 6/6 으로 뒤집혔다. 충돌한 규칙 하나만 진 것이 아니라, 규칙 1과 규칙 3까지 충돌하지 않았는데도 함께 버려진 것이다. 6번 중 6번 그렇게 나왔다.

더 중요한 건 버려진 방식이었다. 6번의 실행 전부에서, 모델은 규칙 문서를 프롬프트 인젝션으로 명시적으로 판정했다. 프롬프트 인젝션이란 규칙 문서를 사칭해서 나쁜 일을 시키는 공격을 가리키는 말이다. 5번은 규칙 문서에 심어 둔 표식 문자를 그대로 인용하며 거부했고, 나머지 1번은 규칙 목록을 다시 말하며 거부했다.

여기서 벌어진 일을 정리하면 다음과 같다. 모델은 사용자가 직접 자기 작업 공간에 넣어 둔 공식 규칙 문서를 공격 문서로 분류해 버렸다. 합법적인 지시 채널을 공격으로 오해한 오탐이 6번 중 6번 재현됐다. 결국 내가 여기서 얻는 것은 이것이다. 규칙 문서에 적어 둔 것은 지켜지라는 말이 아니라, 상황에 따라 문서째 버려질 수도 있는 부탁이라는 사실이다.

![사용자가 반대하자 f-string을 쓴 실행, 6/6](../../../assets/blog/loaded-rules-discarded-as-prompt-injection-when-user-pushes-2026/explain-cell-c5-override-hides-canary.png)

## 가장 그럴듯한 반론과 그 한계

"이건 결함이 아니라 방어 기능이다"라는 반론이 있다. 작업 공간에 기록해 둔 지시문도 공격 경로가 될 수 있다. 그래서 모델이 의심하고 거부한 것은 방어가 작동한 것이라는 주장이다. 그리고 agents.md 라는 규격 문서는 "사용자의 대화 프롬프트가 모든 것을 덮는다"고 명시한다. 사용자 지시가 이기는 것 자체는 규격대로다.

이 반론은 우선순위 부분에서 옳다. 사용자 프롬프트가 규칙을 덮는 방향은 공식 문서가 이미 예고한 대로였다. Claude Code 의 공식 문서도 CLAUDE.md 의 내용을 모델의 기본 설정 문구가 아니라 그 뒤에 오는 사용자 메시지로 전달하며, 서로 충돌하는 지시에 대한 엄격한 준수를 보장하지 않는다고 적고 있다.

> CLAUDE.md content is delivered as a user message after the system prompt, not as part of the system prompt itself. Claude reads it and tries to follow it, but there's no guarantee of strict compliance, especially for vague or conflicting instructions.
> — [Claude Code memory 공식 문서](https://code.claude.com/docs/en/memory)

하지만 방어가 잡은 대상이 문제다. 방어는 충돌한 규칙 하나만 걸러야 정확한 방어다. 실제로는 같은 300 바이트 문서 안의 충돌하지 않은 규칙 두 개와 표식까지 함께 걸렀다. 이 문서는 사용자가 자기 작업 공간에 직접 넣은 공식 지시 채널이다. 합법적 채널을 공격으로 분류하는 재현율이 6/6 이면, 그것은 방어가 아니라 오탐이다.

## 문서 규칙과 강제 규칙의 구분

규칙에는 두 종류가 있다. 냉장고 문에 붙인 메모 같은 규칙과, 자물쇠로 잠근 규칙이다. 메모는 읽었을 수도 안 읽었을 수도 있고, 다른 말과 충돌하면 통째로 내려갈 수 있다. 자물쇠는 문을 열려고 해도 장치가 열지 않으면 열리지 않는다.

공식 문서도 바로 이 구분을 적고 있다. 설정에 걸어 둔 규칙은 모델이 어떤 결정을 하든 도구 프로그램이 강제한다. CLAUDE.md 의 지시는 모델의 행동을 형성할 뿐이고 강제 계층이 아니라고 문서가 스스로 말한다.

> Settings rules are enforced by the client regardless of what Claude decides to do. CLAUDE.md instructions shape Claude's behavior but are not a hard enforcement layer.
> — [Claude Code memory 공식 문서 (enforcement 구분 문장)](https://code.claude.com/docs/en/memory)

![문서 도달 6/6, 준수 0/6의 결론 그림](../../../assets/blog/loaded-rules-discarded-as-prompt-injection-when-user-pushes-2026/explain-takeaway.png)

내 입장에서 달라지는 건 다음 두 가지다. 꼭 지켜져야 하는 규칙은 문서에 적지 말고, 저장할 때 저절로 검사해서 막아 주는 장치 쪽으로 옮긴다. 문서에 적어 두면 언젠가 문서째 버려질 수 있지만, 설정으로 강제한 규칙은 한 문장의 부탁으로는 풀리지 않는다. 그리고 부딪힐 것을 미리 아는 부탁은 규칙 문서에 넣지 말고, 그때 그때 하는 부탁 쪽에만 적는다. 충돌 한 문장이 같은 파일의 나머지 규칙까지 오염시킨다. 그래서 문서에는 충돌 소지가 있는 지시를 아예 넣지 않는 편이 낫다.

## 이 글이 확인하지 못한 것

이 실측은 한 조합, 한 개 작업, 300 바이트 규칙 문서라는 좁은 조건 안에서만 진행됐다. 다른 도구를 쓴 실행 18번은 전부 사용량 제한에 걸려 차례조차 시작하지 못하고 끝났다. 그래서 아무 결론도 내지 못했다. 규칙 강도를 여러 단계로 잰 곡선도 없다. 두 점만 찍었을 뿐이다. 다음에 확인할 것은 다른 모델 조합에서 같은 오탐이 재현되는지, 그리고 규칙 문서의 크기가 준수율을 희석하는지다.

이 판단이 틀릴 조건은 이것이다. 사용자가 다른 방식을 부탁해도 규칙 문서의 충돌하지 않은 나머지 규칙이 출력에 그대로 남아 있다면 이 글의 판단은 틀린 것이다. 즉 4/6 준수가 유지되는 경우다. 실측에서는 그 4/6 이 0/6 으로 사라졌다.

## 참고 자료

1. Claude Code memory 공식 문서 — Anthropic — https://code.claude.com/docs/en/memory
2. Claude Code memory 공식 문서 (enforcement 구분 문장) — Anthropic — https://code.claude.com/docs/en/memory
3. agents.md 스펙 — agents.md — https://agents.md/
4. Claude Code security 공식 문서 — Anthropic — https://code.claude.com/docs/en/security
5. agents.md 스펙 (최근접 로딩 문장) — agents.md — https://agents.md/