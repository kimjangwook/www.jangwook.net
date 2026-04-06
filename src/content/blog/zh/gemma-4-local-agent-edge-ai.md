---
title: >-
  在本地跑了一下Gemma 4——8B模型居然能做函数调用了
description: >-
  Google以Apache 2.0开源了Gemma 4，我用Ollama亲自安装并测试了中文、结构化输出和函数调用。
  一个9.6GB的本地模型，能成为Agent流水线的构建模块吗？
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

`ollama pull gemma4`——就这一行命令，9.6GB的模型就下载到了我的MacBook上。

4月2日，Google以Apache 2.0许可证开源了Gemma 4。从E2B到31B Dense一共有4种规格，但我最感兴趣的是基础的8B模型。因为我想搞清楚"在边缘端跑Agent"这句营销话术到底有几分真实。

## 安装真的只需一行

```bash
ollama pull gemma4
# 约9.6GB下载，Q4_K_M量化
```

用`ollama show gemma4`查看，可以看到支持的功能列表：

```
Capabilities
  completion
  vision
  audio
  tools
  thinking
```

说实话我挺惊讶的。一个8B模型竟然同时支持视觉、音频、工具调用，还有thinking。这些在Gemma 3里都没有的功能，一次性全加上了。

## 中文还行，但也就是"还行"的水平

我让它用中文做了个自我介绍。

> 您好。我是一个能够准确快速回答您问题的AI。

语法上没问题。据说支持140种语言，但中文质量跟Claude或GPT-5系列比还是有差距。遇到需要复杂语境和微妙表达的问题时，回答往往比较表面。不过考虑到这是一个在本地离线运行的8B模型，也不算差了。

## 真正让我惊讶的是Function Calling

我认为Gemma 4这次最有意义的变化就是原生函数调用。我通过Ollama API实际测试了一下：

```bash
curl -s http://localhost:11434/api/chat -d '{
  "model": "gemma4",
  "messages": [{"role": "user", "content": "东京天气怎么样"}],
  "tools": [{
    "type": "function",
    "function": {
      "name": "get_weather",
      "description": "查询城市的当前天气",
      "parameters": {
        "type": "object",
        "properties": {
          "city": {"type": "string", "description": "城市名"}
        },
        "required": ["city"]
      }
    }
  }],
  "stream": false
}'
```

响应：

```json
{
  "role": "assistant",
  "content": "",
  "thinking": "1. 用户问了东京的天气...\n2. get_weather工具很合适...",
  "tool_calls": [{
    "function": {
      "name": "get_weather",
      "arguments": {"city": "Tokyo"}
    }
  }]
}
```

有两点值得注意：
1. **thinking字段一起返回了**——能看到模型为什么选择这个工具的推理过程
2. **工具调用很干净**——参数以正确的JSON格式输出

这为什么重要呢？因为以前用本地LLM做Agent，函数调用只能靠prompt工程来曲线救国。写个系统提示词说"请按以下格式输出"，然后解析输出，失败了就重试。Gemma 4不需要这些了。

## 结构化输出也表现不错

我也测试了JSON格式输出：

```bash
echo 'Answer in JSON: {"capital": "<answer>"}. What is the capital of France?' \
  | ollama run gemma4
# → {"capital": "Paris"}
```

个人觉得到这个程度的话，可以用作MCP服务器的本地后端了。在不调用外部API、处理公司内部数据来构建Agent的场景下，对安全要求高的环境特别有价值。

## 那实际能拿来做什么

我想到的现实可行的应用场景有三个：

**1. 离线代码审查Agent**
——接收Git diff作为输入，生成代码审查评论的本地Agent。在源码不能外传的环境下特别有用。

**2. 内部文档搜索+摘要**
——把RAG流水线中的LLM部分替换成Gemma 4。有128K上下文窗口，处理相当长的文档也没问题。

**3. IoT/边缘设备的自然语言接口**
——据说E2B（2B）模型在树莓派5上都能跑。给智能家居控制器加上自然语言指令这种原型变得可行了。

## 说实话还有遗憾

我认为现在就宣称"本地Agent时代来了"还为时尚早。

第一，**8B模型的推理质量瓶颈**很明显。简单的工具调用没问题，但需要多步推理的复杂Agent任务肯定会频繁出错。Arena AI排行榜上31B模型排开源第三，但8B和31B之间的差距相当大。

第二，**基准测试和实战的落差**。OSWorld或Arena分数再好看，在实际工作环境中的稳定性是另一回事。特别是中文这种非英语语言，体感性能还会再打折扣。

第三，**量化质量问题**。我下载的是Q4_K_M量化版本，但相比原始FP16到底损失了多少性能，官方没有公开数据。4-bit量化的质量下降在需要推理能力的任务上感受会更明显。

## 代替结论

Gemma 4玩了半天，我的感受是这样的：**"本地LLM终于可以当Agent工具用了。但目前还是辅助角色。"**

要说我的工作流里马上能用在哪里，大概是安全敏感的内部数据处理，或者离线环境下的简单Agent任务。想把主力Agent从Claude或GPT-5.4换成Gemma 4，现在还不现实。

话说回来，一个Apache 2.0许可证、原生支持函数调用的8B模型能面世，这件事本身就很有意义。一年前在本地根本不敢期望这种水平的能力。`ollama pull gemma4`一行命令谁都能开始，建议自己跑跑看，在自己的使用场景里做判断。
