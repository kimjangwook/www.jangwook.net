---
title: >-
  I Ran Gemma 4 Locally — We're in an Era Where an 8B Model Can Do Function
  Calling
description: >-
  I installed Google's Gemma 4 (Apache 2.0) via Ollama and tested Korean
  language, structured output, and function calling firsthand. Can a 9.6GB local
  model actually become a building block for agent pipelines?
pubDate: '2026-04-06'
heroImage: ../../../assets/blog/gemma-4-local-agent-edge-ai-hero.jpg
tags:
  - gemma
  - google
  - open-source
  - local-llm
  - ai-agent
  - function-calling
relatedPosts:
  - slug: claude-code-insights-usage-analysis
    score: 0.95
    reason:
      ko: '자동화, AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: 'Covers similar topics in automation, AI/ML with comparable difficulty.'
      zh: 在自动化、AI/ML领域涵盖类似主题，难度相当。
  - slug: greptile-ai-coding-report-2025-review
    score: 0.94
    reason:
      ko: '자동화, AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: 'Covers similar topics in automation, AI/ML with comparable difficulty.'
      zh: 在自动化、AI/ML领域涵盖类似主题，难度相当。
  - slug: openai-agentkit-tutorial-part1
    score: 0.94
    reason:
      ko: '자동화, AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: 'Covers similar topics in automation, AI/ML with comparable difficulty.'
      zh: 在自动化、AI/ML领域涵盖类似主题，难度相当。
  - slug: sora-shutdown-ai-video-market-reshaping-veo4
    score: 0.94
    reason:
      ko: '자동화, AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: 'Covers similar topics in automation, AI/ML with comparable difficulty.'
      zh: 在自动化、AI/ML领域涵盖类似主题，难度相当。
  - slug: ai-presentation-automation
    score: 0.93
    reason:
      ko: '자동화, AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: 'Covers similar topics in automation, AI/ML with comparable difficulty.'
      zh: 在自动化、AI/ML领域涵盖类似主题，难度相当。
---

`ollama pull gemma4` — with this single line, a 9.6GB model landed on my MacBook.

On April 2nd, Google released Gemma 4 under the Apache 2.0 license. It comes in four sizes, from E2B to 31B Dense, but what caught my attention was the base 8B model. I wanted to see how much of the "run agents at the edge" marketing pitch actually holds up.

## Installation Really Was Just One Line

```bash
ollama pull gemma4
# ~9.6GB download, Q4_K_M quantization
```

Running `ollama show gemma4` lists the supported capabilities:

```
Capabilities
  completion
  vision
  audio
  tools
  thinking
```

I'll be honest — I was surprised. Vision, audio, tool calling, and thinking, all packed into an 8B model. These are features that didn't exist in Gemma 3, and they've all arrived at once.

## Korean Works Fine, But Just "Fine"

I asked it to introduce itself in Korean.

> 안녕하세요. 저는 사용자님의 질문에 정확하고 신속하게 답변해 드리는 AI입니다.

Grammatically correct. They claim support for 140 languages, but Korean quality still has a noticeable gap compared to Claude or the GPT-5 family. For questions that require complex context or nuance, the answers tend to stay surface-level. That said, for an 8B model running locally and offline, it's not bad.

## The Real Surprise Is Function Calling

I think the most meaningful change in Gemma 4 is native function calling. I tested it through the Ollama API:

```bash
curl -s http://localhost:11434/api/chat -d '{
  "model": "gemma4",
  "messages": [{"role": "user", "content": "도쿄 날씨 알려줘"}],
  "tools": [{
    "type": "function",
    "function": {
      "name": "get_weather",
      "description": "도시의 현재 날씨 조회",
      "parameters": {
        "type": "object",
        "properties": {
          "city": {"type": "string", "description": "도시명"}
        },
        "required": ["city"]
      }
    }
  }],
  "stream": false
}'
```

Response:

```json
{
  "role": "assistant",
  "content": "",
  "thinking": "1. 사용자가 도쿄 날씨를 물었다...\n2. get_weather 도구가 적합하다...",
  "tool_calls": [{
    "function": {
      "name": "get_weather",
      "arguments": {"city": "Tokyo"}
    }
  }]
}
```

Two things stand out here:
1. **The thinking field comes along with it** — you can see the model's reasoning for why it chose this tool
2. **The tool call is clean** — it extracts parameters into proper JSON format

Why does this matter? Until now, building agents with local LLMs meant you had to work around function calling through prompt engineering. You'd write a system prompt saying "output in this format," parse the output, and retry on failure. With Gemma 4, none of that is necessary.

## Structured Output Works Well Too

I also tested JSON format output:

```bash
echo 'Answer in JSON: {"capital": "<answer>"}. What is the capital of France?' \
  | ollama run gemma4
# → {"capital": "Paris"}
```

Personally, I think this is good enough to use as a local backend for an MCP server. For building agents that process internal data without external API calls, it's especially valuable in security-sensitive environments.

## So What Can You Actually Build With This?

I see three realistic use cases:

**1. Offline Code Review Agent**
— A local agent that takes Git diffs as input and generates code review comments. Useful in environments where source code can't leave the premises.

**2. Internal Document Search + Summarization**
— Replace the LLM component in a RAG pipeline with Gemma 4. With a 128K context window, it can handle fairly long documents.

**3. Natural Language Interface for IoT/Edge Devices**
— The E2B (2B) model reportedly runs on a Raspberry Pi 5. This opens the door to prototypes like adding natural language commands to a smart home controller.

## The Honest Downsides

I think it's still too early to declare that "the era of local agents has arrived" based on Gemma 4.

First, **the reasoning quality ceiling of an 8B model is clear**. Simple tool calls work fine, but for complex agent tasks requiring multi-step reasoning, mistakes will be frequent. The 31B model sits at #3 among open models on the Arena AI leaderboard, but the gap between 8B and 31B is substantial.

Second, **the disconnect between benchmarks and production**. Even if OSWorld or Arena scores look good, real-world stability in production environments is a different story. Especially for non-English languages like Korean, the perceived performance drops further.

Third, **quantization quality concerns**. What I downloaded is a Q4_K_M quantized version, and there's no officially published data on how much performance degrades compared to the original FP16. The quality loss from 4-bit quantization can be felt more acutely in tasks that require reasoning.

## Instead of a Conclusion

Here's my take after half a day with Gemma 4: **"Local LLMs can finally be used as agent tools. But for now, they're still in a supporting role."**

If I'm looking for an immediate application in my workflow, it would be things like processing internal data where security matters, or simple agent tasks in offline environments. Replacing my primary agents — Claude or GPT-5.4 — with Gemma 4 is still a stretch.

Still, the fact that an 8B model with native function calling under an Apache 2.0 license now exists is significant in itself. Just a year ago, you couldn't expect this level of capability running locally. It's just `ollama pull gemma4` and anyone can get started, so I'd recommend running it yourself and judging based on your own use case.
