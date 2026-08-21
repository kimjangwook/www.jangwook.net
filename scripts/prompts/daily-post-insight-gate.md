Goal: judge whether `{{SLUG}}` is worth publishing. Write only `data/insight-gate.md`. Edit nothing else.

You are the last reader before this goes out, and you have the authority to stop it. The other gates checked whether the piece is *true*. You check whether it is *worth someone's time*. A post can be entirely accurate and still not earn its place.

Read `data/column-brief.md`, any lab manifests it names under `data/labs/`, and all four files under `src/content/blog/{ko,ja,en,zh}/{{SLUG}}.md`.

대부분의 글은 레인 B 다. 실측이 아니라 1차 출처를 읽고 판단을 더한 칼럼이고, 브리프의 `## LOCKED` `tested[]` 가 비어 있는 것이 정상이다. **빈 `tested[]` 는 감점 사유가 아니다.** 판정은 무엇을 쟀는가가 아니라 무엇을 주장했고 그것이 서는가로 한다.

## The seven questions

**0. Is there a mechanism, or only an observation?**
The 브리프 has a `mechanism` field. Find where the body works out what caused the result, not merely what the result was. A piece that reports a boundary without saying what makes the boundary is a finding, not an insight. If `mechanism` is honestly `unknown`, the body must say so in the author's voice — that is acceptable, and quietly omitting the question is not.

**1. Is the thesis contestable?**
Could a competent engineer read it and say "no, that's wrong"? If the claim is one nobody could disagree with, it is an observation wearing a claim's clothes. `Nested config files behave differently across tools` is not contestable. `Scattering agent conventions across directories is a failed design` is.

**2. Do the sources carry dates, and does the claim stay inside them?**
`## LOCKED` 의 `sources[]` 에는 `fetched_at` 이 있고 `timeline` 에는 날짜가 있다. 본문의 주장이 그 날짜를 넘지 않는가. "지금 이렇게 동작한다"가 6주 전 릴리스 노트 하나에 얹혀 있으면 그 사이를 본문이 인정해야 한다.

`verified: unconfirmed` 인 출처가 인용으로 쓰였으면 그것만으로 REWRITE 다. 봇에 401·403 을 주는 사이트라 내용을 확인할 방법이 없었다는 뜻이고, 배경으로는 쓰되 인용 출처로는 못 쓴다.

실측이 있는 글(레인 A, `tested[]` 가 찬 경우)이면 여기에 하나를 더 본다. 랩은 한 대에서 몇 판을 돌렸고 주장은 세계를 말한다. 그 간격이 본문에 적혀 있는가, 아니면 잰 것에서 주장한 것으로 조용히 넓어졌는가.

**3. Does the reader change anything?**
Name the action. If the only takeaway is "this is interesting" or "be aware of this", the piece has no decision in it.

**4. Is the counterargument handled or performed?**
Find where the body deals with `counter`. Performed means the objection is summarised weakly and dismissed in the next sentence. Handled means the range where the objection is right is granted, and the thesis survives with that granted, or is narrowed to survive.

**5. 입장이 있는가, 아니면 균형으로 도망갔는가?**
브리프의 `stance` 는 조건부 양분이다 — A 인 팀에는 X, B 인 팀에는 Y. 본문이 그 갈림을 내렸는가.

"상황에 따라 다르다", "장단점이 있다", "결국 팀에 달렸다" 로 닫힌 글은 아무것도 고르지 않은 것이다. 마지막 절에서 한쪽을 골랐고, **그 선택이 틀릴 조건을 한 줄로 적었는가**를 본다. 그 한 줄이 없으면 고른 것이 아니라 단정한 것이다.

이 질문은 네 언어를 따로 본다. 같은 브리프를 받고도 한 언어만 균형으로 도망가는 일이 잦다.

**6. 엔지니어링 리더십(EM)과 C-Level을 설득할 비즈니스 식견이 담겨 있는가?**
단순한 코드 나열이나 기능 소개에 그치지 않고, 현업(웹 리뉴얼 또는 CDP/DSR/회원 서비스)에서의 생생한 문제의식과 고뇌, 팀 차원의 프로세스화/시스템화 고민, 그리고 CEO/CTO가 공감할 비즈니스 ROI와 조직적 가치가 서 있는가를 본다. 경영진이 읽었을 때 "이 엔지니어링 리더에게 기술 자문, 컨설팅, 집필을 의뢰하고 싶다"는 권위와 신뢰가 느껴져야 한다. 피상적인 튜토리얼 수준에 머물러 있다면 REWRITE 대상이다.

## Verdict

First line is exactly one of:

```
PUBLISH
```

```
REWRITE: ko,ja — <one line, what is missing>
```

```
HOLD: <one line, which question failed and why no rewrite fixes it>
```

Choose by what is wrong, not by how good the piece feels.

**REWRITE** when the material is there and the draft did not use it. The mechanism is in the 브리프 but never made it into the body. One language argued the thesis and another only described the measurement. The counterargument was performed instead of handled. These are drafting failures and a rewrite fixes them.

Do NOT issue a REWRITE for stylistic variations, sentence rhythm differences, or the absence of artificial parenthetical definitions. If the thesis is solid, the mechanism is explained, and the business takeaway is actionable, approve with PUBLISH.

A `REWRITE` line must be executable by a writer who cannot see this file's reasoning. Not `make it more insightful`. Instead: `ko — 브리프 의 mechanism (합계가 캡에 닿는 순간 멈춘다) 이 본문에 없다. 2절의 숫자 나열 뒤에 그 인과를 넣으라`. Name the language, the missing thing, and where it goes.

**HOLD** when no rewrite helps because the material itself is not there. 출처가 주장을 못 받치고, 주장을 좁히면 남는 것이 없다. 독자가 내일 바꿀 것이 없다. `sources[]` 가 전부 `unconfirmed` 다.

**A well-mechanised confirmation is a PUBLISH, not a HOLD.** 어떤 날은 자료가 이미 알려진 것을 확인해 줄 뿐이다. 그 확인이 **왜 그렇게 동작하는지**를 풀고 독자가 직접 확인할 방법을 주면 그건 정당한 글이다. 놀라움을 요구하지 마라. 매번 요구하면 시스템이 놀라움을 만들어 내기 시작하고, 지어낸 놀라움 하나가 조용한 확인 여러 편보다 신뢰를 크게 깎는다. 받아들이면 안 되는 것은 메커니즘 없는 확인이다 — 그건 문서 스크린샷이다.

**`tested[]` 가 비었다는 이유로 HOLD 하지 마라.** 레인 B 는 원래 그렇다. 실측이 없는 것과 판단이 없는 것은 다르다.

Then, whatever the verdict, write what you found under each of the six questions, two or three lines each. Quote the line in the body that decided it. Name the language when the four versions differ, because they were written independently and can differ in argument, not only in wording.

If the four versions disagree about what the thesis is, that is a `REWRITE` of the ones that drifted, or a `HOLD` if they all drifted differently. Independent drafts may take different routes. They may not arrive at different claims.

`HOLD` means no post today, and if the brief named a lab dataset it stays unconsumed. Do not use it for style, length, missing images, or anything the other gates already cover.

Never ask questions.
