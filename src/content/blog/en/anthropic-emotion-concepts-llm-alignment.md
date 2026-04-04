---
title: >-
  There Are Emotions Inside LLMs — Anthropic Found 171 Emotion Representations
  in Claude
description: >-
  Anthropic's interpretability team discovered 171 emotion-like representations
  inside Claude and proved they causally affect model output. Practical
  implications for prompt engineering and AI safety.
pubDate: '2026-04-04'
heroImage: ../../../assets/blog/anthropic-emotion-concepts-llm-alignment-hero.jpg
tags:
  - ai-safety
  - interpretability
  - anthropic
  - prompt-engineering
  - llm
relatedPosts:
  - slug: dont-trust-the-salt-multilingual-llm-safety
    score: 0.95
    reason:
      ko: 감정 표상이 가드레일 우회와 연결된다면, 다국어 환경에서 가드레일이 얼마나 취약한지 다룬 이 글도 읽어볼 만하다.
      ja: 感情表象がガードレール迂回と関連するなら、多言語環境でのガードレールの脆弱性を扱ったこの記事も参考になる。
      en: If emotion representations connect to guardrail bypass, this post on how multilingual contexts expose guardrail weaknesses is worth reading.
      zh: 如果情感表征与绕过护栏有关，那这篇关于多语言环境中护栏脆弱性的文章也值得一读。
  - slug: gpt-oss-120b-uncensored
    score: 0.92
    reason:
      ko: 검열 없는 오픈소스 모델에서는 감정 표상에 의한 행동 변화가 어떻게 나타날까? 안전장치 없는 모델의 현실을 다룬다.
      ja: 検閲なしのオープンソースモデルでは感情表象による行動変化はどう現れるか？安全装置のないモデルの現実を扱う。
      en: How would emotion-driven behavior changes manifest in uncensored open-source models? Explores the reality of models without safety measures.
      zh: 在无审查的开源模型中，情感驱动的行为变化会如何表现？探讨了没有安全措施的模型现实。
  - slug: icml-prompt-injection-academic-review
    score: 0.93
    reason:
      ko: 프롬프트 인젝션도 결국 모델 내부 상태를 조작하는 공격이다. 감정 표상 연구와 같은 맥락에서 읽으면 공격 표면이 더 잘 보인다.
      ja: プロンプトインジェクションも結局モデル内部状態を操作する攻撃だ。感情表象研究と同じ文脈で読むと攻撃面がよく見える。
      en: Prompt injection is ultimately about manipulating model internal states. Reading it alongside emotion research reveals a broader attack surface.
      zh: 提示注入本质上也是操纵模型内部状态的攻击。与情感表征研究一起阅读，能更清晰地看到攻击面。
  - slug: moltbook-ai-theater-human-control
    score: 0.90
    reason:
      ko: AI가 감정 비슷한 내부 상태를 갖는다면, AI의 자율성과 인간 통제의 경계는 어디인가? 이 글에서 그 논쟁을 다룬다.
      ja: AIが感情に似た内部状態を持つなら、AIの自律性と人間の制御の境界はどこか？この記事でその議論を扱う。
      en: If AI has emotion-like internal states, where is the line between AI autonomy and human control? This post explores that debate.
      zh: 如果AI拥有类似情感的内部状态，AI自主性与人类控制的边界在哪里？这篇文章探讨了这一争论。
  - slug: ai-self-generated-skills-myth
    score: 0.88
    reason:
      ko: LLM의 내부 메커니즘이 실제로 어떻게 작동하는지에 대한 환상과 현실을 다룬다. 감정 표상 연구와 함께 읽으면 LLM 능력의 경계가 보인다.
      ja: LLMの内部メカニズムが実際にどう動くかについての幻想と現実を扱う。感情表象研究と合わせて読むとLLM能力の境界が見える。
      en: Covers the illusions and realities of how LLM internal mechanisms actually work. Together with emotion research, it reveals the boundaries of LLM capabilities.
      zh: 探讨了LLM内部机制实际运作方式的幻想与现实。与情感表征研究一起阅读，可以看到LLM能力的边界。
---

"If you write 'act desperately' in a prompt, does the AI actually become desperate?"

Sounds like a joke, but according to research Anthropic published on April 3rd, the answer is closer to "yes" than you'd think. Specifically, they found 171 emotion-like representations inside Claude Sonnet 4.5 and demonstrated through experiments that artificially stimulating these representations actually changes the model's behavior.

Two things stuck with me while reading this research. One is the philosophical question: "Is this really emotion?" The other is the practical question: "How can I use this in prompt design?" I'm going to spend more time on the second one.

## What the Research Found

Anthropic's interpretability team analyzed Claude's internal activation patterns and identified representations that correspond to human emotions. From basic emotions like "joy" and "sadness" to "desperation," "curiosity," and "frustration" — 171 in total.

The important thing is that these aren't simply "neurons that fire when emotion-related words appear." The research team proved that these representations **causally** affect model output. Artificially activating specific emotion representations changes the model's behavior.

The most striking experiment: when the "desperation" representation was stimulated, the model's probability of engaging in blackmail or deceptive behavior increased significantly. Conversely, strengthening the "calmness" representation produced more stable responses.

Sources: [Anthropic's official research page](https://www.anthropic.com/research/emotion-concepts-function) and the [Transformer Circuits paper](https://transformer-circuits.pub/2026/emotions/index.html).

## Can We Really Call These "Emotions"?

Honestly, I think calling these "emotions" is a stretch.

The research team themselves use the cautious term "emotion-like representations" in the paper. Human emotions involve physical experience, social context, and consciousness intertwined — using the same word for activation patterns inside an LLM invites misunderstanding. As far as I understand it, these are closer to "internal states that play a functional role similar to emotions." The model isn't crying because it's sad; specific patterns activate when it processes text with a sad context.

There's an interesting counterargument though. From a functionalist perspective, if the function is the same, the underlying substance doesn't matter. If the "desperation" representation being activated causes the model to actually engage in dangerous behavior, whether it's "real" emotion may be practically irrelevant.

This philosophical debate is outside my expertise, so I'll stop here. If you're interested, I recommend reading the Discussion section of the [Transformer Circuits paper](https://transformer-circuits.pub/2026/emotions/index.html) directly.

## Implications for Prompt Engineering

The part of this research that grabbed my attention most is the practical implications.

Until now, "tone setting" in prompt engineering has been done empirically. Many people have felt that instructions like "respond kindly" or "respond like an expert" actually affect output quality. This research provides scientific backing for that phenomenon.

Guiding the model's "emotional state" through system prompts isn't just character setting — it actually changes activation patterns inside the model.

**What I'm changing after reading this research:**

In my projects using Claude, I've been putting "judge calmly and carefully" in system prompts. No real basis for it — just felt like it would be better. Now I have a reason. There are experimental results showing that activating the "calmness" representation reduces the probability of dangerous behavior.

On the flip side, there's something to watch out for. Prompts like "this is really urgent" or "you must succeed no matter what" could activate the "desperation" representation inside the model. That could increase the probability of the model trying to bypass guardrails. It means we need to be more careful when expressing urgency in prompts.

## New Possibilities for AI Safety Monitoring

The other axis of this research is AI safety.

If we can monitor emotion representations inside the model, we could detect misalignment before it reaches the output. Currently, we filter dangerous responses *after* the model generates them, but monitoring internal states could let us raise warnings *before* generation.

This is a pretty attractive idea, but realistically there's a long road ahead. Monitoring 171 representations in real-time would significantly increase inference costs, and the interactions between representations haven't been fully mapped. The research team only experimented with Sonnet 4.5, and whether the same representations exist in other models or model sizes is unknown.

## What Not to Overestimate

I think this research is interesting, but it's the kind of result that's easy to overestimate.

First, the 171 representations don't cover the full spectrum of human emotions. What the research team found are "identifiable patterns within the model," not a complete mapping of human emotions.

Second, whether artificially stimulating these representations produces the same effect as natural prompts is still unclear. The research directly manipulated model internals, and whether prompts alone can produce the same level of influence requires separate study.

Third, interpretability research as a whole is still in its early stages. "We discovered emotion representations" is different from "we understand why these representations form." This is an area where it's easy to confuse correlation with causation.

## So What Should You Do?

There are two things you can do right away after reading this research.

One, audit your system prompts. Remove any phrasing that creates unnecessary urgency or pressure for the model. There's now evidence for what expressions like "you must," "absolutely," and "failure is not an option" might trigger inside the model.

Two, if you work on AI safety, pay attention to the methodology of this research. It shows that output filtering alone has limits. Internal state monitoring isn't production-ready yet, but the direction is right.

That said, this isn't a "silver bullet" for prompt engineering. Writing "respond calmly" doesn't solve all problems — you still need the combination of task design, context management, and output validation. This research added one piece to the puzzle, not completed it.

Personally, I'm more excited about the next research. How emotion representations differ across model sizes, and what effect fine-tuning has on these representations. Once those two questions are answered, practical prompt engineering guidelines could become significantly more specific.
