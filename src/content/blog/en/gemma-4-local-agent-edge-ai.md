---
title: >-
  I Ran Gemma 4 Locally — We're in an Era Where an 8B Model Can Do Function Calling
description: >-
  I installed Google's Gemma 4 (Apache 2.0) via Ollama and tested Korean language, structured output, and function calling firsthand.
  Can a 9.6GB local model actually become a building block for agent pipelines?
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
  - slug: qwen3-coder-8gb-vram
    score: 0.88
    reason:
      ko: Qwen3-Coder를 8GB VRAM에서 돌리는 방법을 다뤘다. 제한된 하드웨어에서 로컬 LLM을 활용하는 관점에서 Gemma 4와 직접 비교해볼 수 있다.
      ja: Qwen3-Coderを8GB VRAMで動かす方法を扱った。限られたハードウェアでローカルLLMを活用する観点からGemma 4と直接比較できる。
      en: Covers running Qwen3-Coder on 8GB VRAM. Directly comparable to Gemma 4 from the perspective of utilizing local LLMs on limited hardware.
      zh: 介绍了在8GB VRAM上运行Qwen3-Coder的方法。从在有限硬件上利用本地LLM的角度来看，可以与Gemma 4直接比较。
  - slug: google-turboquant-kv-cache-3bit-compression
    score: 0.85
    reason:
      ko: Gemma 4의 Q4_K_M 양자화가 신경 쓰인다면, Google의 TurboQuant 3-bit KV 캐시 압축 기술이 양자화 품질 문제를 어떻게 접근하는지 참고할 만하다.
      ja: Gemma 4のQ4_K_M量子化が気になるなら、GoogleのTurboQuant 3bit KVキャッシュ圧縮技術が量子化品質問題にどうアプローチしているか参考になる。
      en: If the Q4_K_M quantization of Gemma 4 concerns you, see how Google's TurboQuant 3-bit KV cache compression approaches quantization quality issues.
      zh: 如果你关心Gemma 4的Q4_K_M量化问题，可以参考Google的TurboQuant 3-bit KV缓存压缩技术如何解决量化质量问题。
  - slug: dapr-agents-v1-cncf-production-ai-framework
    score: 0.82
    reason:
      ko: Gemma 4로 로컬 에이전트를 만들겠다면, 프로덕션 레벨의 에이전트 프레임워크가 필요하다. Dapr Agents가 그 선택지 중 하나다.
      ja: Gemma 4でローカルエージェントを作るなら、プロダクションレベルのエージェントフレームワークが必要だ。Dapr Agentsはその選択肢の一つ。
      en: If you plan to build local agents with Gemma 4, you'll need a production-grade agent framework. Dapr Agents is one such option.
      zh: 如果你打算用Gemma 4构建本地Agent，就需要一个生产级的Agent框架。Dapr Agents就是选择之一。
  - slug: mistral-voxtral-tts-open-weight-speech
    score: 0.80
    reason:
      ko: 오픈 웨이트 모델의 또 다른 사례. Mistral의 음성 합성 모델과 Google의 Gemma 4를 비교하면 오픈소스 AI 생태계의 현주소가 보인다.
      ja: オープンウェイトモデルのもう一つの事例。MistralのTTSモデルとGoogleのGemma 4を比較すると、オープンソースAIエコシステムの現在地が見える。
      en: Another example of open-weight models. Comparing Mistral's TTS model with Google's Gemma 4 reveals the current state of the open-source AI ecosystem.
      zh: 开源权重模型的另一个案例。将Mistral的TTS模型与Google的Gemma 4对比，可以看到开源AI生态系统的现状。
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
