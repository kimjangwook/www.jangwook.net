---
name: voice-anti-ai
description: Pattern file for native, non-translated daily posts. The launch prompt stays short. This file does the work.
---

# Apply this file. Do not recap it.

Writer prompts live in `scripts/prompts/daily-post-lang-{ko,ja,en,zh}.md`, written in that language. This file is the shared pattern list. Do not stuff don't-lists into the launchd plist.

Selected from X (2025-09 - 2026-08):

- Short prompt + pattern file. 400-word "don't sound like AI" prompts fail. The model drops a don't-list by sentence three. (@comfortfajugbag 2026-03, 4.3만 뷰; @rubenhassid 2026-04, 2.3만 뷰)
- Name the output. Prefer positives. "Write the Korean file" beats "don't translate." Samples beat adjectives. (@AiwithAliya6 2026-08, Anthropic guide distill)
- Start from bullets. Edit sentences, do not one-shot a four-language essay. Feed a real past post. (@hosseeb 2025-09, 8.1만 뷰)
- Write in the market language from the first sentence. Translation is for readers after shipping, not for drafts. (@grok 2026-08)
- Rejected: stuffing "here's the thing / let's dive in" replacements into the prompt (@alex_prompter). Those are new tells. Rejected: write-then-translate to beat a detector (@danrobinson). This blog is for native readers.
- Requirement count is a cost. Compliance drops as a prompt piles on requirements — measured at about 19% (arXiv:2505.13360, 2025-05). That is why the per-language prompts stay short and this file carries the shared load. Adding a line here means earning it.

## The reader is not only an engineer

This is the part the 2026 research moved most, and it applies to all four languages.

**Stakes are countable consequences for named people.** Not "this matters." Who loses what: money, a deleted history, the next project, 61 lines nobody reviewed. Toss's most-shared 2026 piece led with 5,600억 vs 350억 and drew comments from a 사회과학 reader and a 금융권 practitioner. Findy's most-shared piece fixed its scope in three paragraphs — one person, one month, almost no hand-written code — before making any claim.

**A term's job comes from context, not parenthetical dictionary glosses.** Never drop a parenthetical definition like `Search Console(웹사이트 검색 노출을 확인하는 도구)` or `ADB(안드로이드 기기를 명령으로 제어하는 도구)`. Parenthetical glosses read like a machine textbook or AI slop. Instead, let the mechanism and practical impact show through the natural narrative flow. Professional domain words (robots.txt, PR, CI/CD, crawler, rollout, status code) are used naturally without halting the sentence to define them. If a concept is crucial to non-technical readers, explain its real-world cause and effect within the sentence itself, never inside parentheses.

**Analogy budget: one per article, and say where it breaks.** Allowed only when the analogy is shorter than the plain statement and cannot be misread. An analogy nobody corrects becomes the reader's wrong model.

**Put other roles in the room.** A PO who looked at the number, a designer who filed the bug, a 비개발자 colleague who asked the question in Slack. Report it as an event, never as a lecture aimed at them.

**Substance test, per paragraph.** After each one the reader must be able to repeat a name, a number, a date, a cause, or a trade-off. If deleting the paragraph loses nothing, it was decoration. (SlopDetector 2026-07 signal 12.)

## Patterns to avoid (AI clichés & unnatural patterns)

- **상투적인 AI 어휘 지양**:
  - en: delve, unleash, game-changing, revolutionary, transformative, leverage, unlock, landscape, tapestry, in today's fast-paced, let's dive in, moreover, furthermore.
  - ko: 혁신적인, 패러다임, 여정이 시작된다, 말할 필요도 없이, 단순한 A가 아닌 B, ~로 보여진다, ~되어지고 있다 등 불필요한 피동·상투어.
  - ja: 本節では, 重要なのは, レバー, 架け橋, 見ていきましょう 등 상투적 번역투.
  - zh: 先把词钉死, 不容忽视, 值得警惕, 并非A而是B 등 상투어.
- **사전식 괄호 주석 금지**: `Search Console(웹사이트 노출 확인 도구)` 같은 교과서식 정의 대신 문맥과 인과관계 안에서 자연스럽게 의미를 녹여낸다.
- **부자연스러운 단문 분절 지양**: 단문을 쓰되, 문맥의 논리적 연결(접속사, 설명)을 억지로 잘라내어 암호문처럼 만들지 않는다. 생각이 자연스럽게 이어지도록 쓴다.
- **균형 잡힌 마무리**: 기계적인 교훈/요약 대신, 결론에서는 내가 주장한 선택의 전제 조건이나 트레이드오프를 솔직하고 담백하게 제시한다.

## Typography

- **제목 이모지 금지, `---` 구분선 금지.**
- **물결표(`~`, `〜`, `～`) 일체 금지**: 모든 언어에서 범위는 하이픈(`-`) 또는 문장형(`10에서 20`, `10 to 20`)으로 표기.
- **불필요한 볼드 남발 금지**: 첫 언급 고유명사 위주로 사용.
- **특수 기호 절제**: 키보드에 없는 특수문자나 상자 그림문자 배제.

## How a {{LANG}} file should sound

**ko** 단단하고 자연스러운 해라체(평서문). 현장감 있는 실무 개발 용어는 자연스럽게 살리고, 번역투를 배제한 명쾌한 논리 전개.

**ja** 명쾌한 だ体. 자연스러운 기술 어휘와 군더더기 없는 논증.

**en** Active voice, direct and authoritative. Professional yet conversational peer-to-peer register.

**zh** 书面为主, 结构清晰, 表达地道.

## Process the scheduler already enforces

`scripts/daily-post-pipeline.sh` orchestrates the execution flow: English Master writing first, followed by high-quality multilingual transcreation (`ko`, `ja`, `zh`) via Native SDK (`daily-post-write-sdk.mjs`).

1. **core** — claude (opus) writes `data/column-brief.md` (bullets). Topic gate, lane, evidence, real-world team context, and executive insights.
2. **master English (`en`)** — native SDK (`sonnet:chief+3`) writes `src/content/blog/en/<slug>.md` as the authoritative Master Article (Source of Truth).
3. **multilingual transcreation (`ko`, `ja`, `zh`)** — native SDK (`sonnet:chief+3`) translates and transcreates the English master into natural, professional, and authoritative Korean (해라체), Japanese (だ体), and Chinese prose without machine translation quirks.
4. **polish** — edits each file (20-30% shorter, no added fluff). Prompts in `scripts/prompts/daily-post-polish-{en,ko,ja,zh}.md`.
5. **review-1** — checks facts against the brief, quotes, frontmatter, links, and truncation.
6. **seal-check** — claude opus at effort `medium` reads all four plus the first-pass notes, ensuring facts, quotes, formatting, and high-quality human tone.
7. **insight-gate** — claude opus at effort `medium` verifies executive value, concrete mechanism, and actionable takeaways (`PUBLISH` / `REWRITE` / `HOLD`).
8. **seal-publish** — static build verification (1,414+ pages), git commit, push, Telegram report.
