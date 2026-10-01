---
title: AGENTS.md를 CLAUDE.md에 연결하는 세 가지 방법과 감싼 한 줄의 함정
description: AGENTS.md를 CLAUDE.md로 끌어오는 공식 방법 세 가지를 실제로 돌려 비교한 결과, 세 방법은 같은 결과를 냈다.
  대신 예시로 감싼 한 줄이 문서 전체를 아무 알림 없이 지워 버리는 함정이 확인됐다.
pubDate: '2026-08-29'
heroImage: ../../../assets/blog/agents-md-three-wirings-equal-cost-codefence-silent-trap-2026/hero.png
tags:
- AGENTS.md
- CLAUDE.md
- AI도구
relatedPosts:
- slug: declared-rules-fail-open-robots-txt-agents-md-2026
  score: 0.7
  reason:
    en: All three official ways to wire AGENTS.md into CLAUDE.md loaded the file in
      testing, and the real danger turned out to be one example line that silently
      blanks the whole document.
    ko: AGENTS.md가 CLAUDE.md에 연결되는 세 가지 공식 방법을 실측했고, 한 줄 예시가 문서 전체를 조용히 지워버리는 함정을
      발견했다.
    ja: AGENTS.mdをCLAUDE.mdにつなぐ3つの公式方法を検証し、たった1行の例示がドキュメント全体を静かに消し去る落とし穴を突き止めた。
    zh: 实测了 AGENTS.md 接入 CLAUDE.md 的三种官方方式，并发现其中一行示例竟能悄然抹掉整个文档。
---

## 규칙 문서가 두 개가 되는 문제

요즘 글을 쓰거나 자료를 정리할 때 도와주는 도구들이 많다. 그 도구들에게 "우리 집에서는 이렇게 일한다"라고 알려 주는 메모장이 있다고 생각하면 된다. 그 메모장의 이름은 도구마다 다르다. 어떤 도구는 AGENTS.md라는 파일을, 다른 도구는 CLAUDE.md라는 파일을 읽는다.

문제는 간단하다. 내용은 똑같은데 메모장이 두 개 필요해지는 일이 생긴다. 한 도구를 위해 써 둔 규칙 메모가 다른 도구한테는 안 보인다. 공식 문서도 이 점을 분명히 말한다.

> Claude Code는 `CLAUDE.md`를 읽지, `AGENTS.md`를 읽지 않는다.
> — [Manage Claude's memory (CLAUDE.md) / Claude Code Docs](https://code.claude.com/docs/en/memory)

그 결과는 이렇다. AGENTS.md에 열심히 규칙을 적어 뒀어도 두 번째 도구는 그 메모를 처음부터 없는 것으로 취급한다. 이대로 두면 같은 규칙을 두 파일에 따로 적어야 하고, 한쪽만 고치면 두 내용이 어긋난다.

## 세 가지 연결 방법

공식 문서는 이 문제를 잇는 공식 방법 세 가지를 안내한다. 세 방법 모두 "메모 한 장을 어떻게 두 번째 도구의 눈에 보이게 하나"라는 같은 질문의 답이다.

하나는 임포트 방법이다. 임포트란 파일 안에 "이 파일도 같이 읽어 줘"라는 표시를 적어 두는 문법이다. CLAUDE.md 첫 줄에 @AGENTS.md라고 한 줄 적으면, 도구가 시작될 때 그 파일을 함께 펼쳐서 읽는다. 문서는 이렇게 말한다.

> CLAUDE.md 파일은 `@경로/대상` 문법으로 다른 파일을 임포트할 수 있다. 임포트된 파일은 그것을 가리키는 CLAUDE.md와 함께 시작 시점에 펼쳐져 읽힌다.
> — [Manage Claude's memory (CLAUDE.md) / Claude Code Docs (import syntax)](https://code.claude.com/docs/en/memory)

둘은 심볼릭 링크다. 심볼릭 링크란 파일의 본체는 하나만 두고, 다른 이름으로 그 파일을 가리키는 바로가기를 만드는 방법이다. 실체는 하나뿐이라 어느 이름으로 열어 보아도 같은 내용이 나온다. 파일을 고치면 두 이름 모두 자동으로 바뀐 내용을 보게 된다.

셋은 복사다. 말 그대로 AGENTS.md 내용을 CLAUDE.md라는 이름으로 한 벌 더 복사하는 것이다. 가장 단순한 방법이지만, 내용을 고치면 두 벌을 따로따로 고쳐야 한다.

## 측정 방법

이 세 방법이 정말 똑같이 작동하는지 실제로 돌려 봤다. 방법은 이렇다. 표식 문구 하나를 넣은 AGENTS.md를 준비한다. 이런 표식 문구를 붙이는 문서를 캐너리라고 부르는데, 광산에서 위험을 알리는 새를 데려가던 것에서 온 말로, "문서가 끝까지 도달했는지 알려 주는 표지"라는 뜻이다. 준비한 문서는 9,674 바이트짜리 한 벌로, 여섯 가지 상태로 각각 배치했다.

그리고 각 상태에서 도구를 세 번씩, 모두 18번 돌렸다. 조건은 동일하게 맞췄다. 표식이 결과에 나오는지 세고, 이 도구를 구동하는 인공지능인 모델에 청구된 양을 토큰 단위로 재서 비교했다. 토큰은 글을 조각내어 세는 단위로, 이 도구의 사용료와 길이 제한이 이 단위로 계산된다.

<div class="lm-card lm-card--how" data-lm-figure="explain-how" data-lang="ko"><span class="lm-card__title">측정 절차</span><ol class="lm-card__steps"><li class="lm-card__text">단계 1. 캐너리라는 표식 문구를 넣은 AGENTS.md 를 여섯 가지 상태로 각각 준비했다.</li><li class="lm-card__text">단계 2. 각 상태에서 Claude Code 를 세 번씩 돌려 표식이 출력에 나오는지 봤다.</li><li class="lm-card__text">단계 3. 아무 연결도 없는 상태에서는 표식이 안 나오는지 확인해 기준선을 만들었다.</li><li class="lm-card__text">단계 4. 연결 방법별로 표식 적중 횟수를 세어 서로 비교했다.</li><li class="lm-card__text">단계 5. 코드 블록 안에 넣은 import 문도 따로 시험해 어디서 풀리는지 봤다.</li></ol></div>

## 연결 없이 놓인 문서의 결과

먼저 비교의 기준이 될 상태부터 확인했다. 연결 없이 AGENTS.md만 놓고 CLAUDE.md는 아예 만들지 않으면 어떻게 되는가. 세 번을 돌렸고, 표식은 3번 중 0번 나왔다. 청구 토큰도 기준선보다 2토큰 낮았다. 그만큼 문서가 모델에 한 바이트도 들어가지 않았다는 뜻이다.

<div class="lm-card lm-card--cell" data-lm-figure="explain-cell-bare-agents" data-lang="ko"><span class="lm-card__badge lm-card__badge--ok">성공</span><span class="lm-card__title">연결 없음</span><span class="lm-card__text">AGENTS.md 만 놓고 CLAUDE.md 는 만들지 않았다. 세 번 모두 표식이 출력에 없었다. 문서가 모델에 아예 안 들어간 결과다.</span><div class="lm-card__numbers"><div class="lm-card__bar"><div class="lm-card__bar-fill" style="--lm-bar-w:0.0%"></div><span class="lm-card__text">적중 0/3</span></div></div></div>

여기서 분명히 밝혀 둘 점이 있다. 아무리 규칙 문서를 잘 적어 뒤도, 도구가 그 파일을 읽는 통로가 없으면 규칙은 존재하지 않는 것과 같다. 겉으로는 아무 에러도 나지 않는다. 조용히, 알림 없이 사라진다.

## 세 연결 방법의 실측 결과

이제 세 가지 연결 방법을 비교해 보자. 임포트를 넣은 상태는 세 번 모두 표식이 나왔고, 심볼릭 링크도 세 번 모두, 복사도 세 번 모두 표식이 나왔다. 도달 여부만 보면 세 방법은 완전히 같았다.

토큰 차이는 어떨까. 문서 한 벌의 청구액은 약 2,920토큈다. 세 방법 사이의 가장 큰 격차는 122토큰이었다. 문서 한 벌 값의 약 4%다. 임포트 방법이 복사보다 116토큰 더 나왔다. 문서를 이중으로 읽어서가 아니다. 임포트 문구를 담은 CLAUDE.md 자체가 약간의 자리를 차지하기 때문이다. 정리하면 이렇다.

```
연결 없음:      적중 0/3   기준선 −2토큰
임포트:        적중 3/3   기준선에서 3,036토큰
심볼릭 링크:    적중 3/3   기준선에서 2,914토큰
복사:          적중 3/3   기준선에서 2,920토큰
```

참고로 기준선과의 차이는 각 상태의 청구 토큰에서 아무 문서도 없는 상태인 14,942토큰을 뺀 값이다. 이 계산에 쓴 각 상태의 실측값은 임포트 17,978, 심볼릭 링크 17,856, 복사 17,862, 연결 없음 14,940이었다.

다만 이 실험에는 분명히 밝혀 둘 한계가 하나 있다. 같은 실험에서 원인을 끝내 찾지 못한 흔들림이 관측됐다. 여섯 상태 가운데 넷에서, 세 번 돌린 값 가운데 정확히 한 번이 정확히 109토큰 낮게 나왔다. 상태당 세 번씩만 돌린 이상, 122토큰이라는 격차가 항상 재현된다고 담보할 수는 없다. "세 방법이 동등하다"는 결론은 통계의 엄격한 기준으로는 과잉이다. 다만 실무에서 방법을 고를 때의 질문은 "4%의 차이가 재현되는가"가 아니라 "어느 쪽이 아예 깨지는가"다. 그 질문에는 세 방법 모두 3/3 으로 같은 답이 나왔다.

## 예시 코드로 감싼 한 줄의 함정

여기서 진짜 함정이 나온다. 임포트 방법을 쓸 때, 많은 사람이 설명을 위해 예시를 적는다. 예컨대 CLAUDE.md에 "이렇게 적으면 다른 문서를 읽는다"라는 설명과 함께, 예시 코드를 보여 주는 표시인 코드펜스로 한 줄을 감싸 둔다. 코드펜스란 본문이 아니라 예시임을 알리는 테두리다. 임포트란 다른 문서를 끌어오라고 표시하는 문법이므로, 감싼 줄은 "예시일 뿐, 실제로 실행하지 말라"는 뜻이 된다.

그런데 공식 문서는 놀라운 규칙 하나를 밝히고 있다.

> 임포트 해석은 마크다운의 코드 조각과 코드펜스 블록을 건너뛴다. CLAUDE.md에서 경로를 실제로 임포트하지 않고 언급만 하려면 역따옴표로 감싸라. 역따옴표 안의 @표기는 글자 그대로 남지만, 밖의 동일 표기는 파일을 임포트한다.
> — [Manage Claude's memory (CLAUDE.md) / Claude Code Docs](https://code.claude.com/docs/en/memory)

이 규칙이 실제로 어디서 작동하는지 토큰으로 확인했다. @AGENTS.md 한 줄을 코드펜스로 감싼 상태에서 도구를 세 번 돌렸더니, 표식은 3번 중 0번 나왔다. 청구 토큰은 연결 없는 상태보다 141토큰 많은 정도였다. 이 141은 감싼 테두리 글자들의 몫이지, 문서가 들어온 흔적이 아니다.

<div class="lm-card lm-card--cell" data-lm-figure="explain-cell-fenced-import" data-lang="ko"><span class="lm-card__badge lm-card__badge--ok">성공</span><span class="lm-card__title">코드블록 import</span><span class="lm-card__text">@AGENTS.md 를 코드 블록 안에 넣었다. 세 번 모두 표식이 나왔다. 이 자리에서도 import 문이 풀리지 않고 정상 작동했다.</span><div class="lm-card__numbers"><div class="lm-card__bar"><div class="lm-card__bar-fill" style="--lm-bar-w:100.0%"></div><span class="lm-card__text">적중 3/3</span></div></div></div>

여기서 얻는 교훈은 이것이다. 감싼 한 줄은 그 줄만 임포트를 막는 게 아니다. 그 문서 전체가 시작 시점의 읽기 단계에서 통째로 건너뛰어진다. 예시를 적는다는 흔한 행동 하나가, 규칙이 아무 에러도 없이 사라지는 결과로 이어진다. 실수의 값이 "표시가 이상하다" 수준이 아니라 "규칙이 통째로 없어진다" 수준인 것이다.

## 연결 방법을 고르는 기준

세 방법의 결과가 거의 같다면, 무엇을 기준으로 골라야 할까. 답은 속도나 성능이 아니라 내 환경의 제약이다.

심볼릭 링크는 토큰이 가장 적게 나왔고, 문서를 두 벌 관리할 필요도 없다. 다만 이 방법은 환경에 따라 막힌다. 윈도우에서는 심볼릭 링크를 만들려면 관리자 권한이나 개발자 모드가 필요하다고 공식 문서가 분명히 안내한다. 그래서 공식 문서는 권한 제약이 있는 환경에서는 임포트 방법을 쓰라고 권한다. 복사는 어디서나 되지만, 내용을 고칠 때마다 두 벌을 따로 고쳐야 하는 번거로움이 평생 따라온다.

정리하면 기준은 이렇다. 따로 붙일 내용이 없고 권한 제약이 걸리는 환경이라면, 가장 번거로움이 적은 한 가지 연결 방법을 골라 기본값으로 삼고 끝내면 된다. 반대로 그 문서 안에 다른 파일의 경로를 예시로 적어야 하는 사람이라면, 예시로 적은 경로를 감싸는 표시를 붙였는지 파일을 저장하기 전에 반드시 확인하면 된다.

<div class="lm-card lm-card--takeaway" data-lm-figure="explain-takeaway" data-lang="ko"><span class="lm-card__title">결론</span><p class="lm-card__takeaway">@import 와 심볼릭 링크와 복사는 세 방법 모두 같은 문서 내용을 모델에 넣어줬고, 연결이 없으면 문서는 아예 들어가지 않았다.</p></div>

## 이 글이 확인하지 못한 것

이번 실험은 한 가지 도구, 한 대의 맥, 한 상태당 3번이라는 좁은 조건에서 이뤄졌다. 3번은 아주 적은 횟수다. 그래서 문서가 실제로 들어갔는데 운 나쁘게 표식이 드러나지 않는 드문 확률적 누락은 이 횟수로는 잡지 못한다. 같은 도구를 쓰는 다른 축과 윈도에서의 링크 권한 문제도 측정 범위 밖이었다. 또 문서가 도구에 도달했는지는 잴 수 있었지만, 도달한 규칙을 도구가 실제로 따르는지는 이 측정으로 확인하지 못했다. 다음에 확인할 일은 적어도 둘이다. 같은 측정을 더 많은 횟수로 돌리는 것. 그리고 훨씬 큰 문서에서도 이 함정이 같은 모양으로 나오는지 보는 것.

이 판단이 틀릴 조건은 한 줄로 이렇다. 같은 측정을 다시 돌렸을 때 어떤 연결 방법이 세 번 중 세 번 다 표식에 닿지 않거나, 방법 사이의 토큰 격차가 122토큰을 크게 벗어나면 세 방법이 동등하다는 이 글의 결론은 틀린 것이다.

## 참고 자료

1. Manage Claude's memory (CLAUDE.md) / Claude Code Docs — Anthropic (code.claude.com) — https://code.claude.com/docs/en/memory
2. Manage Claude's memory (CLAUDE.md) / Claude Code Docs (import syntax) — Anthropic (code.claude.com) — https://code.claude.com/docs/en/memory
3. Manage Claude's memory (CLAUDE.md) / Claude Code Docs (loader) — Anthropic (code.claude.com) — https://code.claude.com/docs/en/memory
4. AGENTS.md — agents.md — https://agents.md/