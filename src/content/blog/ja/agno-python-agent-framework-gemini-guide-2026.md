---
title: "AgnoでAIエージェントを作る — GeminiとビルトインツールでPythonエージェントを実際に動かした"
description: "phidataからリブランドされたAgno v2.6.17をサンドボックスで検証。Calculator・Wikipedia・構造化出力・マルチエージェントチームまで実際の実行ログと共に記録。output_schema vs output_model の混同、非推奨モデルID、Team API変更点など実際に遭遇したトラップも正直に残す。"
pubDate: '2026-06-18'
heroImage: ../../../assets/blog/agno-python-agent-framework-gemini-guide-2026-hero.png
tags:
  - python
  - agno
  - ai-agent
relatedPosts:
  - slug: python-ai-agent-library-comparison-2026
    score: 0.92
    reason:
      ko: Agno를 PydanticAI, Instructor, Smolagents와 비교할 때 이 글이 기준점이 됩니다.
      en: This post provides the baseline when comparing Agno against PydanticAI, Instructor, and Smolagents.
      ja: AgnoをPydanticAI・Smolagentsと比較する際の基準になる記事です。
      zh: 这篇文章是比较 Agno 与 PydanticAI、Smolagents 时的参考基准。
  - slug: pydantic-ai-type-safe-agent-tutorial-2026
    score: 0.88
    reason:
      ko: Agno의 output_schema가 익숙해졌다면, PydanticAI의 타입 안전 패턴도 바로 이어서 볼 만합니다.
      en: Once you're comfortable with Agno's output_schema, PydanticAI's type-safe approach is the natural next read.
      ja: Agnoのoutput_schemaに慣れたら、PydanticAIのタイプセーフなアプローチも続けて読む価値があります。
      zh: 熟悉了 Agno 的 output_schema 之后，PydanticAI 的类型安全模式是自然的下一步。
  - slug: google-adk-vs-langgraph-agent-framework-comparison-2026
    score: 0.83
    reason:
      ko: Agno의 경량 철학과 Google ADK·LangGraph의 엔터프라이즈 접근법을 대조해서 읽으면 프레임워크 선택 기준이 더 명확해집니다.
      en: Reading Agno's lightweight philosophy alongside ADK and LangGraph's enterprise approaches clarifies the framework selection criteria.
      ja: Agnoの軽量哲学とGoogle ADK・LangGraphのエンタープライズアプローチを対比すると、フレームワーク選択基準が明確になります。
      zh: 将 Agno 的轻量哲学与 Google ADK、LangGraph 的企业级方法对比阅读，可以让框架选择标准更加清晰。
  - slug: mastra-ai-typescript-agent-framework-guide-2026
    score: 0.78
    reason:
      ko: Python 쪽은 Agno, TypeScript 쪽은 Mastra — 언어별 에이전트 프레임워크 생태계 전체 그림을 잡을 수 있습니다.
      en: Agno for Python, Mastra for TypeScript — together they map the agent framework landscape across both languages.
      ja: PythonはAgno、TypeScriptはMastra — 両方読むとエージェントフレームワークの全体像が見えます。
      zh: Python 用 Agno，TypeScript 用 Mastra — 两篇合读可以掌握两种语言的 Agent 框架全貌。
---

LangChainが重すぎると感じたことがあるなら、同じ結論に達した人はかなり多いだろう。依存関係のツリーが巨大で、抽象化レイヤーが積み重なっていくと、実際に何が起きているのか追うのが難しくなる。だからこそ最近は「LangChainなしでもエージェントが作れる」ことを証明する軽量フレームワークが増えている。

Agnoはそのひとつだ。もともとPhidataという名前だったが、2025年初頭にリブランドした。今回はAgno v2.6.17をサンドボックスに直接インストールして、Calculator、Wikipedia、構造化出力、マルチエージェントチームまで順番に実行してみた。この過程でドキュメントだけでは分からないトラップもいくつか踏んだので、それも含めて記録する。

## AgnoとはなにかとPhidataからの変遷

Phidataは「PythonでAIアシスタントを作るフレームワーク」として登場し、GitHubでスターを着実に集めていた。2025年初頭、PhidataはAgnoとしてリブランドし、設計哲学もより明確に整理された。核心メッセージは三つある。

まず、モデル不可知論(model-agnostic)だ。OpenAI、Anthropic、Google、Ollama、Cohereなど70以上のLLMを同じコード構造で接続できる。モデルを切り替えてもエージェントのロジックはそのまま使えるという意味だ。

次に、マルチモーダルをデフォルトで設計に組み込んだ。テキストだけでなく画像、音声、動画も処理できるエージェントを同じAPIで作れる。

三番目に、マルチエージェントオーケストレーションをファーストクラスとして扱う。`Team`クラスが内蔵されており、`coordinate`、`route`、`collaborate`などの協調モードをパラメータひとつで切り替えられる。

正直に言うと、こういう説明だけ見ると「それはLangChainと何が違うの?」と思う。実際にコードを書いてみると差が感じられた。Agnoはクラス継承よりコンポジションを優先し、エージェントひとつを作るために必要なボイラープレートがはるかに少ない。

## インストール: 依存関係の地獄はなかった

```bash
pip install agno google-genai ddgs wikipedia
```

依存関係が思ったよりすっきりしていた。`agno`パッケージ自体はコアのみインストールされ、使うツールに応じて追加パッケージを別途インストールする。例えばWikipediaツールを使うには`wikipedia`が、Geminiを使うには`google-genai`が必要だ。

```bash
$ python3 -c "import agno; print(agno.__version__)"
2.6.17
```

Gemini APIキーは環境変数で注入した。Agnoは`GOOGLE_API_KEY`か`GEMINI_API_KEY`のどちらかがあれば自動的にGeminiクライアントを初期化する。両方ある場合は`GOOGLE_API_KEY`が優先されるという警告がstdoutに出るが、コードで制御するのは難しい。小さな不便だ。

## 最初のエージェント: Calculatorツール

```python
from agno.agent import Agent
from agno.models.google import Gemini
from agno.tools.calculator import CalculatorTools

agent = Agent(
    model=Gemini(id="gemini-2.5-flash"),
    tools=[CalculatorTools()],
    description="数学計算を手伝うエージェント",
)

response = agent.run("2の10乗 + 3の5乗は? 計算機を使ってください。")
print(response.content)
```

実行結果:

```
2の10乗は1024で、3の5乗は243です。足すと1267です。
⏱ 8.98s
```

計算値は正確だ。1024 + 243 = 1267が合っている。エージェントがLLMに直接計算を任せず、Calculatorツールを呼び出したことが確認できた。レイテンシが約9秒なのはGemini APIの往復 + ツール呼び出しを含むためで、妥当な数値だ。

注意点がひとつある。古いAgnoのドキュメントやブログ記事で`show_tool_calls=True`というパラメータを見かけることがあるが、v2.6.17では`TypeError: Agent.__init__() got an unexpected keyword argument 'show_tool_calls'`が出る。APIが整理されて消えたようだ。現バージョンでツール呼び出しログを見るには`debug_mode=True`で代替する。

もうひとつ: `gemini-2.0-flash`をモデルIDとして使うと404エラーが出る。Googleが2.0-flashをdeprecated扱いにしたためだ。`gemini-2.5-flash`を使う必要がある。

```
ERROR    Error from Gemini API: 404 NOT_FOUND.
{'error': {'message': 'This model models/gemini-2.0-flash is no longer available.'}}
```

最初に試みたときに実際に遭遇したエラーだ。公式サイトで現在使用可能なモデルIDを先に確認するのが正しい。

## WikipediaツールでリサーチエージェントをつくるAI agent

```python
from agno.tools.wikipedia import WikipediaTools

agent = Agent(
    model=Gemini(id="gemini-2.5-flash"),
    tools=[WikipediaTools()],
)

response = agent.run(
    "What is 'attention mechanism' in neural networks? 2 sentences only."
)
print(response.content)
```

実行ログ:

```
INFO Searching wikipedia for: attention mechanism neural networks
ERROR Error searching Wikipedia for 'attention mechanism neural networks':
      Page id "attention mechanism neural network" does not match any pages.
INFO Searching wikipedia for: attention (machine learning)
⏱ 9.98s

In machine learning, attention is a method that determines the importance
of each component in a sequence relative to the other components. Inspired
by human attention, this mechanism was developed to address weaknesses in
recurrent neural networks by allowing the model to focus on relevant parts
of the input.
```

面白い部分がある。最初の検索語(`attention mechanism neural networks`)でWikipediaのページが見つからないと、エージェントが自分で検索語を`attention (machine learning)`に変えて再試行した。これはAgnoが内部でReActループを実行してツールの失敗を自動処理し、次のアクションを決定するということだ。コードを一行も追加せずに。

[Python AIエージェントライブラリ比較記事](/ja/blog/ja/python-ai-agent-library-comparison-2026)でSmolagentsのコード実行エージェントと比べると、Agnoはコード生成よりもツール組み合わせに強みがあることが感じられる。

## 構造化出力: output_schemaが正しい、output_modelではない

AgnoのAPIネーミングで最も混乱する部分がここにある。`output_model`というパラメータが存在するが、直感的に「Pydanticモデルをここに入れればいい」と思うと間違いだ。

```python
# こうするとエラー
agent = Agent(
    model=Gemini(id="gemini-2.5-flash"),
    output_model=DeveloperProfile,  # ← 間違い
)
# ValueError: Model must be a Model instance, string, or None
```

`output_model`はLLMモデルを受け取るパラメータだ。構造化出力が欲しい場合は`output_schema`を使う。

```python
from pydantic import BaseModel
from typing import List

class Skill(BaseModel):
    name: str
    level: str
    year_since: int

class DeveloperProfile(BaseModel):
    name: str
    skills: List[Skill]
    summary: str

agent = Agent(
    model=Gemini(id="gemini-2.5-flash"),
    output_schema=DeveloperProfile,  # ← 正しい
)

response = agent.run(
    "Create a developer profile for 'Kim Jangwook', a Korean developer "
    "specializing in Claude Code, MCP, Python, TypeScript."
)
print(type(response.content))  # <class '__main__.DeveloperProfile'>
print(response.content.name)   # Kim Jangwook
```

実行結果:

```
⏱ 4.00s
Type: DeveloperProfile
Name: Kim Jangwook
Skills:
  - Claude Code: Expert (since 2022)
  - MCP: Certified (since 2019)
  - Python: Senior (since 2018)
  - TypeScript: Intermediate (since 2020)
```

`output_schema`を使うと`response.content`が文字列ではなく実際のPydanticインスタンスを返す。パースが内部で処理され、型ヒントがそのままIDEのオートコンプリートで使える。[PydanticAIチュートリアルで扱った`output_type`](/ja/blog/ja/pydantic-ai-type-safe-agent-tutorial-2026)と似た方向だが、パラメータ名が違う。

## マルチエージェントチーム: members=とmode="coordinate"

Agnoのマルチエージェントは`Team`クラスで構成する。

```python
from agno.team import Team

researcher = Agent(
    name="Researcher",
    model=Gemini(id="gemini-2.5-flash"),
    tools=[WikipediaTools()],
    role="researcher",
)

calculator = Agent(
    name="Calculator",
    model=Gemini(id="gemini-2.5-flash"),
    tools=[CalculatorTools()],
    role="calculator",
)

team = Team(
    members=[researcher, calculator],  # ← agents= ではない
    model=Gemini(id="gemini-2.5-flash"),
    name="Research & Calc Team",
    mode="coordinate",
)
```

もうひとつのAPIトラップがある。`Team(agents=[...])`と書くと`TypeError: Team.__init__() got an unexpected keyword argument 'agents'`が出る。正しいパラメータは`members=[...]`だ。直接踏んでみないと分からない差だ。

実行:

```python
response = team.run(
    "「Attention is All You Need」論文が発表された年をWikipediaで調べ、"
    "2026年現在まで何年経ったか計算してください。"
)
print(response.content)
```

結果:

```
INFO Searching wikipedia for: Attention is All You Need
⏱ 13.83s

「Attention is All You Need」論文は2017年に発表され、
2026年現在まで9年が経過しました。
```

coordinateモードでチームリーダー(modelパラメータで指定したGemini)がタスクを分析し、ResearcherとCalculatorに適切に委任した。実際のWikipedia検索が実行され、2026 - 2017 = 9年の計算も正確に出た。レイテンシが約14秒なのは複数のエージェントを順次呼び出したためだ。

## 100個以上の内蔵ツール

Agnoの隠れた強みのひとつだ。インストール直後に`agno.tools`パッケージを確認すると以下のようなリストが出てくる。

```python
import agno.tools as t
import pkgutil
tools = [name for _, name, _ in pkgutil.iter_modules(t.__path__)]
# 結果: ['arxiv', 'bravesearch', 'calculator', 'csv_toolkit',
#         'dalle', 'docker', 'duckduckgo', 'email', 'github',
#         'gmail', 'google_bigquery', 'jira', 'mcp', 'mem0',
#         'notion', 'postgres', 'slack', 'sql', 'tavily',
#         'wikipedia', 'yfinance', 'youtube', ... 100個以上]
```

これが実質的に意味することは、「Agno + BRAVE_API_KEY」さえあれば5分以内にウェブ検索エージェントが動くということだ。外部APIを直接ラップするコードを書く必要がない。

ただし、すべてのツールが追加インストールなしにすぐ使えるわけではない。`ddgs`、`wikipedia`、`google-genai`、`yfinance`など各ツールが依存するパッケージを別途インストールする必要がある。

## 感じた限界と惜しい点

良いことばかりではなかった。

**レイテンシが想定より高い。** Calculator一回の呼び出しで9秒、マルチエージェントは14秒かかった。Agno自体というよりはGemini APIの往復コストとツール呼び出し構造の問題だが、プロダクションで応答時間が重要なサービスでは考慮が必要だ。

**デバッグがしにくい。** `debug_mode=True`にするとログが多く出るが、フォーマットが定型化されておらずパースしにくい。LangSmithやLangFuseのような外部トレーシングツールとの連携ガイドはまだ見つけられなかった。

**ドキュメントとAPIのバージョン不一致。** `show_tool_calls`、`output_model`、`agents=`などのパラメータ名がドキュメントには残っているが、実際のコードでは消えていたり意味が変わっていたりするケースがあった。

**TeamのcoordinateモードはV2.6.17では常に順次実行だ。** 並列実行はできないようだった。複雑な条件分岐が必要なら[Google ADK vs LangGraph比較記事](/ja/blog/ja/google-adk-vs-langgraph-agent-framework-comparison-2026)を参考にすることをすすめる。

## Agnoを使うべき場面

私が思うにAgnoが最も合うシナリオは三つある。

**高速プロトタイピング。** Gemini(またはOpenAI)APIキーさえあれば10行でエージェントが作れる。検証用PoC、社内ツール、個人プロジェクトでスピードが重要な時。

**マルチツールエージェント。** 100個以上の内蔵ツールがあり、APIキーを渡すだけで使える。Slack、Gmail、Notion、GitHub、Postgresなどの実務ツールをエージェントで繋ぐ作業に強い。

**単一エージェントまたは小規模チーム。** Agent 2〜3個をTeamとして束ねる程度はAgnoがすっきりしている。数十個のエージェントを複雑な依存関係でオーケストレーションする必要があるなら、LangGraphやMicrosoft AutoGenのような状態グラフベースのフレームワークの方が適している可能性がある。

## まとめ

- Agno v2.6.17: `pip install agno`でインストール、Calculator/Wikipedia/Team全て実動作確認
- `gemini-2.5-flash`が現在有効なモデルID (2.0-flashはdeprecated)
- 構造化出力: `output_schema=PydanticModel` (output_modelではない)
- Team: `members=[...]` (agents=ではない)
- 内蔵ツール100個以上、追加依存関係はそれぞれ別途インストール必要
- 高速プロトタイピングとマルチツールエージェントに強み、複雑な状態マシンはLangGraph系が適切

軽量で直感的なAPIという印象を受けた。LangChainに疲れたPython開発者には試してみる価値があるフレームワークだ。
