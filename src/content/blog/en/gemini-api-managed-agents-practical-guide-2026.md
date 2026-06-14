---
draft: true
title: "Gemini API Managed Agents Practical Guide — Run AI Agents in an Isolated Sandbox with One Call"
description: "A hands-on walkthrough of Gemini Managed Agents from Google I/O 2026. Covers the sandbox architecture, multi-turn conversations, tool usage, and an honest comparison with Claude Managed Agents."
pubDate: '2026-05-30'
heroImage: '../../../assets/blog/gemini-api-managed-agents-practical-guide-2026-hero.png'
tags: ['Gemini API', 'AI Agents', 'Google IO 2026']
relatedPosts:
  - slug: "anthropic-claude-opus-4-7-managed-agents-2026"
    score: 0.92
    reason:
      ko: "Claude Managed Agents의 비용 구조와 설계 철학을 먼저 이해하면, Gemini 버전이 어떤 선택을 달리 했는지 훨씬 선명하게 보인다."
      ja: "Claude Managed AgentsのAPIコスト構조를 先に把握しておくと、Gemini版の設計差分がより明確に理解できる。"
      en: "Understanding Claude Managed Agents first makes the architectural differences in Gemini's approach much clearer."
      zh: "先了解Claude Managed Agents的成本结构和设计哲学，才能更清晰地看出Gemini版本做了哪些不同的选择。"
  - slug: "gemini-api-model-tier-benchmark-guide-2026"
    score: 0.85
    reason:
      ko: "Managed Agents가 내부적으로 어떤 모델 티어를 사용하는지 이해하려면 Gemini API 모델 선택 가이드를 함께 읽는 것이 도움이 된다."
      ja: "Managed Agentsが内部でどのモデルティアを使うかを把握するために、このGemini APIモデル選択ガイドも合わせて読むと理解が深まる。"
      en: "To understand which model tier Managed Agents uses internally, this Gemini API model selection guide is a useful companion read."
      zh: "要了解Managed Agents内部使用哪个模型层级，配合阅读Gemini API模型选择指南会很有帮助。"
  - slug: "google-io-2026-antigravity-2-agent-platform-analysis"
    score: 0.78
    reason:
      ko: "Gemini Managed Agents가 발표된 Google I/O 2026의 더 넓은 에이전트 플랫폼 전략을 분석한 글이다."
      ja: "Gemini Managed Agentsが発表されたGoogle I/O 2026の広域エージェントプラットフォーム戦略を分析した記事。"
      en: "A broader analysis of Google's agent platform strategy from Google I/O 2026, where Managed Agents was announced."
      zh: "分析Gemini Managed Agents发布所在的Google I/O 2026更广泛的智能体平台战略。"
---

Ten days have passed since Google I/O 2026 wrapped up. Every year, those keynote hours follow the same rhythm — a moment where you think "okay, this actually feels different," immediately followed by "but is this just a demo?" This year's Gemini API Managed Agents announcement was no exception.

So I installed it and ran the code myself. The pitch is accurate: one `pip install google-genai`, one API key, and you're off. But a few things behaved differently from what the official blog posts described, and those discrepancies turned out to be the most revealing parts of understanding how this feature actually works.

---

## What Gemini Managed Agents Actually Are

Anthropic shipped [Claude Managed Agents](/en/blog/en/anthropic-claude-opus-4-7-managed-agents-2026) first, and OpenAI is moving in a similar direction. Google made `Gemini API Managed Agents` official at Google I/O 2026.

One-sentence version: <strong>the SDK now has a `client.interactions` namespace, and a single `create()` call is all it takes to run an agent.</strong>

If the traditional `generate_content()` pattern is "I throw a prompt at an LLM and get a response back," Managed Agents is closer to "the agent receives a goal and figures out which tools to use on its own to produce a result." The execution control is handed to the SDK side — hence the word "Managed."

Three key characteristics I confirmed from the SDK itself.

First, execution state is tracked per `interaction`. Each response object contains `id`, `status` (one of `in_progress`, `requires_action`, `completed`, `failed`, and others), `outputs`, and `previous_interaction_id`. The state machine is explicit and visible.

Second, multi-turn conversations are linked via `previous_interaction_id`. This is the first place where the actual SDK diverges from some of the official announcement material, which described "reusing environments with an environment_id" — I'll cover this more carefully below.

Third, the feature is marked EXPERIMENTAL. When you first call `client.interactions` after installing the SDK, you get: `UserWarning: "Interactions usage is experimental and may change in future versions"`. Not a sign to ship this to production just yet.

---

## Installation and Basic Execution

```bash
pip install google-genai
```

That installs `google-genai==1.72.0`. On Python 3.12, no dependency conflicts. One important note: `google-generativeai` (the old SDK) and `google-genai` (the new SDK) are separate packages with similar names. Managed Agents requires `google-genai` specifically.

Right after installation, calling `client.interactions` for the first time produces this warning:

```
UserWarning: Interactions usage is experimental and may change in future versions.
  warnings.warn(
```

The SDK emits this itself. Execution continues fine — but in production code, a warning like this should be read as "this interface can change." Treat it accordingly.

Here is the basic execution structure:

```python
import google.genai as genai

client = genai.Client(api_key="YOUR_GEMINI_API_KEY")

response = client.interactions.create(
    model="gemini-2.5-flash",
    input="Summarize the pros and cons of AI agent memory architectures"
)

print(f"Interaction ID: {response.id}")
print(f"Status: {response.status}")

for content in (response.outputs or []):
    if hasattr(content, 'text'):
        print(content.text)
```

Models you can pass to the `model` parameter include `gemini-2.5-flash`, `gemini-2.5-pro`, `gemini-2.5-flash-lite`, `gemini-3-flash-preview`, `gemini-3-pro-preview`, and others — based on the Literal types in the SDK. As of May 2026, `gemini-3.x-preview` series models are also in there.

The API endpoint is `https://generativelanguage.googleapis.com/v1beta/interactions`. Without a valid API key you get HTTP 400, not 404 — which is itself informative. A 400 means the endpoint is live and the server is routing the request correctly.

Understanding the response object structure upfront makes writing code much easier:

```python
# Main fields on the response object
response.id                     # str: unique interaction ID (e.g. "interactions/abc123")
response.status                 # one of:
# 'in_progress'     — still running
# 'requires_action' — waiting for user input or confirmation
# 'completed'       — finished normally
# 'failed'          — something went wrong
# 'cancelled'       — explicitly cancelled
# 'incomplete'      — partially finished
response.outputs                # list: result content items
response.previous_interaction_id  # str | None: parent interaction ID
response.usage                  # token usage info
```

The explicit state machine is the defining difference from `generate_content()`. Previously, you sent a request and got a finished result. Managed Agents introduces the concept of an execution that can still be running, might need your input mid-way, or might fail — and handles all of that at the API level.

---

## Multi-Turn Conversations: It's previous_interaction_id, Not environment_id

Some official announcement materials and several tech blogs use the phrase "reuse the environment with environment_id to maintain conversation context." Looking at the actual SDK: that parameter does not exist.

<strong>The parameter for multi-turn conversation is `previous_interaction_id`.</strong>

```python
# First interaction
response1 = client.interactions.create(
    model="gemini-2.5-flash",
    input="How do you categorize memory in an AI agent design?"
)

# Second interaction — connect to the previous conversation context
response2 = client.interactions.create(
    model="gemini-2.5-flash",
    input="Show me a code example for the first category you mentioned.",
    previous_interaction_id=response1.id
)
```

This design gives each interaction its own unique ID and chains them together like links. Conceptually similar to Claude's `session_id` approach, but the implementation is different. Google chose to manage each interaction as an independent object and reference the previous one by ID.

Honestly, this design is more intuitive. You can trace any interaction back through its conversation lineage using IDs alone. On the other hand, the Claude pattern of explicitly opening and closing a session introduces separate session management overhead.

---

## Available Tools

The `tools` parameter lets you attach multiple capabilities. Here is what I confirmed from the SDK.

<strong>code_execution</strong>: runs code in a sandboxed environment.

```python
response = client.interactions.create(
    model="gemini-2.5-flash",
    input="Calculate Fibonacci numbers and show the code.",
    tools=[{"type": "code_execution"}]
)
```

One thing worth flagging here. Official announcements describe "an isolated Ubuntu environment (4-core CPU, 16 GB RAM, Python 3.12, Node.js 22)." What I found in the SDK is that `code_execution` is a sandboxed Python interpreter. The `computer_use` tool only supports `environment='browser'` — Linux VM access is not available in the current public API. The announcement appears to be describing Google's internal agent infrastructure, not the public Managed Agents API.

<strong>google_search</strong>: the agent calls real-time web search directly.

```python
response = client.interactions.create(
    model="gemini-2.5-flash",
    input="Summarize the latest AI features announced at Google I/O 2026.",
    tools=[{"type": "google_search"}]
)
```

<strong>url_context</strong>: reads URLs directly and uses them as context.

<strong>mcp_server</strong>: connects to an MCP (Model Context Protocol) server. This is interesting because Anthropic and Google share MCP as a common standard. Standardization of agent tool interfaces is happening in practice. You can run your own MCP server and have the Gemini agent call that server's tools.

<strong>computer_use</strong>: computer control in a browser environment. As noted above, `environment='browser'` only — Linux VM is not in the public API yet.

<strong>google_maps</strong>: access to map and location data.

<strong>file_search</strong>: file search capability.

You can combine multiple tools in a single call:

```python
response = client.interactions.create(
    model="gemini-2.5-flash",
    input="Find highly rated restaurants in Tokyo and search for their latest reviews.",
    tools=[
        {"type": "google_search"},
        {"type": "google_maps"}
    ]
)
```

To see which tools the agent called and in what order, parse the `response.outputs` list. Tool call results are included inside `outputs`, so you can follow the agent's reasoning path to a reasonable degree.

---

## Streaming and Background Execution

Long-running tasks need either streaming or background execution.

```python
# Streaming
with client.interactions.create(
    model="gemini-2.5-flash",
    input="Explain agent memory architecture in three sentences.",
    stream=True
) as stream:
    for event in stream:
        if event.outputs:
            for output in event.outputs:
                if hasattr(output, 'text'):
                    print(output.text, end="", flush=True)
```

Background execution starts the task asynchronously and lets you fetch results later:

```python
# Start background execution
response = client.interactions.create(
    model="gemini-2.5-flash",
    input="Write a deep analysis of AI agent memory architectures.",
    background=True,
    store=True  # required if you want to retrieve results later
)

interaction_id = response.id

# Fetch results later
result = client.interactions.get(interaction_id)
print(result.status)  # 'completed', 'in_progress', etc.
```

If you forget `store=True`, calling `client.interactions.get()` later will return 404. Background execution and result persistence are separate options — not linked by default. This is an easy mistake to make since the documentation does not make it obvious.

---

## Deep Research Agent

The Managed Agents namespace also supports a `agent` parameter for purpose-built agents. The only one currently public is `deep-research-pro-preview-12-2025`.

```python
response = client.interactions.create(
    agent="deep-research-pro-preview-12-2025",
    input="Compare and analyze Gemini, Claude, and OpenAI agent architectures.",
    agent_config={"type": "deep-research"}
)
```

The name gives it away: this is a `12-2025` versioned preview. The concept is that a deep research agent browses the web itself and synthesizes results from multiple sources. How well it actually performs at that is something you need to verify with a real API key running a real query.

The distinction between `model` mode and `agent` mode: with `model`, you point directly at a Gemini language model and attach tools. With `agent`, you invoke a pre-defined agent specification that already has specific tools and settings baked in — the Deep Research agent is an example of the latter.

Google will likely add more purpose-built agents to this namespace over time. Coding agents, data analysis agents, financial research agents are the obvious next candidates.

---

## Claude Managed Agents vs Gemini Managed Agents

Having used Claude Managed Agents first, the comparison comes naturally.

<strong>Context management works differently.</strong> Claude opens a session and multi-turn conversation happens within that session scope. Gemini creates each interaction as an independent object and links them via `previous_interaction_id`. This reflects a difference in state management philosophy.

<strong>The tool sets reflect each company's infrastructure strengths.</strong> Claude puts more emphasis on real OS-level tools: bash, computer use on Linux and macOS, text editor. Gemini has more tools tied into Google's own infrastructure: google_search, google_maps, url_context. Not surprising — each company ships the tools they already have a competitive advantage in.

<strong>Cost is hard to predict.</strong> Claude Managed Agents lets you set an explicit `task_budget`, so costs are relatively foreseeable. Gemini Managed Agents does not clearly document per-interaction pricing in public docs right now. Given the EXPERIMENTAL status, the billing model may not even be finalized yet. As I wrote in [AI Agent Cost Reality](/en/blog/en/ai-agent-cost-reality), the key cost driver in agents is how many tool calls happen and how many tokens get consumed. Managed Agents makes that execution more of a black box, which makes cost control harder.

<strong>SDK maturity is still different.</strong> The Anthropic SDK's Managed Agents features are fairly well organized with clear error messages. The `interactions` namespace in google-genai carries an EXPERIMENTAL warning, and there are gaps between what external documentation describes and what the SDK actually implements (environment_id vs previous_interaction_id is a concrete example). This looks like a gap that opened up from shipping quickly — it will probably get cleaned up soon.

| Comparison | Gemini Managed Agents | Claude Managed Agents |
|---|---|---|
| Multi-turn approach | `previous_interaction_id` | Session-based |
| Environment isolation | Browser sandbox, Python sandbox | Linux VM, macOS |
| Specialized tools | Google Search, Maps, MCP | bash, text editor, computer use |
| Billing unit | Undisclosed (EXPERIMENTAL) | task_budget-based |
| SDK status | EXPERIMENTAL | Stable (beta) |
| Purpose-built agents | Deep Research Agent | — (model-based) |

This is not a ranking. The use cases are different. If your agent needs to work directly with Google infrastructure data — search, maps, documents — Gemini is the natural fit. If the work involves OS-level automation, code execution, and file manipulation, Claude is better suited.

---

## Honest Assessment: Is It Production-Ready?

<strong>Putting this in production right now is premature.</strong>

Three reasons.

First, it is EXPERIMENTAL. The SDK prints a warning itself. API interface changes in future versions is a real possibility — and given that major parameter names already differ between external documentation and the actual implementation, that probability is not low.

Second, cost is unpredictable. You cannot easily control how many tool calls the agent makes or what it ends up spending. When [choosing an AI agent framework](/en/blog/en/ai-agent-framework-comparison-2026-langgraph-crewai-dapr-production), cost controllability is a meaningful selection criterion. Gemini Managed Agents is weak on that front right now.

Third, the available tools are more limited than the announcement implied. Linux sandbox access, a 4-core/16 GB environment — none of that is confirmed in the current public API. Taking the announcement at face value leads to a mismatch with what you actually get.

That said, <strong>now is a reasonable time to experiment and get ready.</strong>

The interface is considerably simpler than `generate_content()`. The concept of managing agent execution results as a state machine is clean. The ability to quickly invoke purpose-built agents like the Deep Research agent is genuinely interesting as a model. And the integration with Google infrastructure tools — Search, Maps — is territory Anthropic and OpenAI cannot easily replicate.

In 6 to 12 months, if this reaches GA and pricing becomes public, it will be worth serious consideration.

---

## Code Reference: Patterns You Can Actually Use

Here are the practical patterns collected in one place, ready to run once you have an API key.

```python
import google.genai as genai
import warnings
import time

# Uncomment below to turn the EXPERIMENTAL warning into an error
# warnings.filterwarnings('error', category=UserWarning)

client = genai.Client(api_key="YOUR_GEMINI_API_KEY")


# --- Pattern 1: Basic single-shot execution ---
def run_basic(prompt: str, model: str = "gemini-2.5-flash") -> str:
    response = client.interactions.create(
        model=model,
        input=prompt
    )
    texts = []
    for content in (response.outputs or []):
        if hasattr(content, 'text'):
            texts.append(content.text)
    return "\n".join(texts)


# --- Pattern 2: Multi-turn conversation ---
class GeminiConversation:
    def __init__(self, model: str = "gemini-2.5-flash"):
        self.model = model
        self.last_interaction_id: str | None = None

    def send(self, message: str) -> str:
        kwargs = {
            "model": self.model,
            "input": message,
        }
        if self.last_interaction_id:
            kwargs["previous_interaction_id"] = self.last_interaction_id

        response = client.interactions.create(**kwargs)
        self.last_interaction_id = response.id

        texts = []
        for content in (response.outputs or []):
            if hasattr(content, 'text'):
                texts.append(content.text)
        return "\n".join(texts)


# --- Pattern 3: With web search ---
def run_with_search(prompt: str) -> str:
    response = client.interactions.create(
        model="gemini-2.5-flash",
        input=prompt,
        tools=[{"type": "google_search"}]
    )
    texts = []
    for content in (response.outputs or []):
        if hasattr(content, 'text'):
            texts.append(content.text)
    return "\n".join(texts)


# --- Pattern 4: Background execution with polling ---
def run_background(prompt: str, poll_interval: float = 2.0) -> str:
    response = client.interactions.create(
        model="gemini-2.5-flash",
        input=prompt,
        background=True,
        store=True  # store=True is required
    )

    interaction_id = response.id
    while True:
        result = client.interactions.get(interaction_id)
        if result.status in ("completed", "failed", "cancelled"):
            break
        time.sleep(poll_interval)

    if result.status != "completed":
        raise RuntimeError(f"Interaction ended with status: {result.status}")

    texts = []
    for content in (result.outputs or []):
        if hasattr(content, 'text'):
            texts.append(content.text)
    return "\n".join(texts)


# --- Pattern 5: Deep Research Agent ---
def run_deep_research(query: str) -> str:
    response = client.interactions.create(
        agent="deep-research-pro-preview-12-2025",
        input=query,
        agent_config={"type": "deep-research"}
    )
    texts = []
    for content in (response.outputs or []):
        if hasattr(content, 'text'):
            texts.append(content.text)
    return "\n".join(texts)
```

---

## Error Handling and Edge Cases

A few edge cases come up in practice. Knowing them in advance saves time.

<strong>When status is 'failed', outputs may be None.</strong> Always use `response.outputs or []` — skipping that will cause a `TypeError`.

<strong>Background execution without store=True means no retrieval.</strong> Calling `client.interactions.get(interaction_id)` later returns 404. Background execution and result storage are separate flags.

<strong>Streaming must use a context manager.</strong> The correct form is `with client.interactions.create(..., stream=True) as stream:`. Accessing the stream object outside the `with` block means accessing a closed connection.

<strong>The tools parameter is a list of dicts, not a single dict.</strong> Type hints and documentation are not fully clear here, so passing `tools={"type": "google_search"}` as a plain dict will fail. Always wrap in a list.

```python
# Error-safe pattern
def safe_run(prompt: str) -> str | None:
    try:
        response = client.interactions.create(
            model="gemini-2.5-flash",
            input=prompt
        )
        if response.status == "failed":
            print(f"Interaction failed: {response.id}")
            return None

        texts = []
        for content in (response.outputs or []):
            if hasattr(content, 'text') and content.text:
                texts.append(content.text)
        return "\n".join(texts) if texts else None

    except Exception as e:
        print(f"API error: {e}")
        return None
```

---

## Closing

Gemini Managed Agents from Google I/O 2026 is pointing in the right direction. Abstracting agent execution behind a single API call, managing interactions as a state machine, integrating with Google's infrastructure toolset — the design is clean without unnecessary complexity.

The gap between the announcement and what the SDK actually delivers is real, and the EXPERIMENTAL label has not come off yet. My read: rather than rushing to wire this into a service, this is a good time to internalize the SDK structure and understand how purpose-built agents like Deep Research work. Experimenting in personal projects or internal tools is already worthwhile.

One thing is clear: after Anthropic shipped Claude Managed Agents, both Google and OpenAI have moved quickly in the same direction. "Managed agent execution as a service" is now an industry-wide trajectory, not a single company's bet. When this interface stabilizes in a year or two, the real question will be which provider's agent runtime to pick. Agent execution cost, tool access rights, context management approach, and monitoring ergonomics will be the actual selection criteria then.

For concrete updates, track the `google-genai` package release notes and the Google AI for Developers blog. Watch the interactions-related changelog entries as new SDK versions ship.
