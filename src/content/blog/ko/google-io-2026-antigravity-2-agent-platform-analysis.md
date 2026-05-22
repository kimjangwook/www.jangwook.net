---
title: 'Google I/O 2026 Antigravity 2.0 — Gemini CLI 종료와 에이전트 IDE 전쟁'
description: >-
  Google이 I/O 2026에서 Antigravity 2.0을 발표하며 Gemini CLI를 6월 18일부로 종료한다. 실제 설치된
  앱의 확장 구조와 Gemini 3.5 Flash API를 직접 분석하고, Claude Code와 비교한다.
pubDate: '2026-05-21'
heroImage: ../../../assets/blog/google-io-2026-antigravity-hero.png
tags:
  - google
  - antigravity
  - ai
  - developer-tools
  - gemini
relatedPosts:
  - slug: cursor-3-vs-claude-code-vs-windsurf-2026
    score: 0.92
    reason:
      ko: AI 코딩 IDE 3파전(Cursor, Claude Code, Windsurf)을 다룬 이 글을 읽었다면, Antigravity 2.0이 새 경쟁자로 어떻게 자리잡는지 맥락이 생긴다.
      ja: AIコーディングIDE 3社対決(Cursor, Claude Code, Windsurf)を扱った記事を読んでいれば、Antigravity 2.0が新たな競合としてどう位置づけられるかの文脈が生まれる。
      en: If you read this piece on the three-way AI coding IDE battle (Cursor, Claude Code, Windsurf), Antigravity 2.0's entry as a new contender makes much more sense in context.
      zh: 如果你读过这篇关于AI编码IDE三强争霸（Cursor、Claude Code、Windsurf）的文章，就能更好理解Antigravity 2.0作为新竞争者的定位。
  - slug: gemini-31-pro-release
    score: 0.88
    reason:
      ko: Gemini 3.1 Pro를 분석한 이 글과 이어서 읽으면, Gemini 모델이 3.1→3.5로 이동하면서 API 가격과 성능이 어떻게 변화했는지 추적할 수 있다.
      ja: Gemini 3.1 Proを分析したこの記事と併せて読むと、Geminiモデルが3.1→3.5へ移行する中でAPIの価格と性能がどう変化したか追跡できる。
      en: Read alongside this Gemini 3.1 Pro analysis to track how the model's API pricing and performance evolved from 3.1 to 3.5.
      zh: 与这篇Gemini 3.1 Pro分析文章一起阅读，可以追踪Gemini模型从3.1到3.5的API价格和性能变化。
  - slug: claude-code-parallel-sessions-git-worktree
    score: 0.85
    reason:
      ko: Claude Code로 병렬 에이전트를 실행하는 방법을 이미 알고 있다면, Antigravity 2.0의 parallel subagent 설계가 어디서 다르고 어디서 비슷한지 더 정확히 판단할 수 있다.
      ja: Claude Codeで並列エージェントを実行する方法を知っていれば、Antigravity 2.0のparallel subagent設計がどこで違いどこで似ているかをより正確に判断できる。
      en: If you already know how to run parallel agents in Claude Code, you can more precisely judge where Antigravity 2.0's parallel subagent design diverges and where it converges.
      zh: 如果你已经了解如何在Claude Code中运行并行代理，就能更准确地判断Antigravity 2.0的并行子代理设计在哪里不同、哪里相似。
  - slug: llm-api-pricing-comparison-2026-gpt5-claude-gemini-deepseek
    score: 0.83
    reason:
      ko: 2026년 주요 LLM API 가격을 비교한 이 글과 함께 보면, Gemini 3.5 Flash의 $1.50/MTok이 경쟁 가격 대비 어떤 위치인지 직접 숫자로 비교할 수 있다.
      ja: 2026年の主要LLM API価格を比較したこの記事と合わせると、Gemini 3.5 Flashの$1.50/MTokが競合価格対比でどの位置にあるか直接数字で比較できる。
      en: Read alongside this 2026 LLM API pricing comparison to place Gemini 3.5 Flash's $1.50/MTok in direct numerical context against competitors.
      zh: 与这篇2026年主要LLM API价格对比文章一起看，可以直接用数字比较Gemini 3.5 Flash的$1.50/MTok在竞争价格中的位置。
  - slug: multi-agent-orchestration-routing
    score: 0.81
    reason:
      ko: 멀티 에이전트 오케스트레이션 라우팅 패턴을 다룬 이 글의 개념들이 Antigravity 2.0의 parallel subagent 설계에 그대로 적용된다.
      ja: マルチエージェントオーケストレーションのルーティングパターンを扱ったこの記事の概念が、Antigravity 2.0のparallel subagent設計にそのまま適用される。
      en: The multi-agent orchestration routing patterns covered here map directly onto Antigravity 2.0's parallel subagent design.
      zh: 本文中关于多代理编排路由模式的概念直接适用于Antigravity 2.0的并行子代理设计。
---

Google I/O 2026이 열린 지 이틀이 지났다. 키노트 영상을 다시 돌려보다가 문득 터미널을 열었다. 혹시 Antigravity가 이미 설치돼 있나 싶어서. (Homebrew 업데이트를 좀 방치해두고 있었는데, 의외의 순간에 도움이 됐다.)

```bash
$ defaults read /Applications/Antigravity.app/Contents/Info.plist CFBundleShortVersionString
1.23.2
```

설치돼 있었다. 버전 1.23.2. 그래서 그냥 들여다봤다. 이 글은 그 과정에서 확인한 것들이다.

## Antigravity 2.0이 무엇인가 — 한 줄 요약부터

Google I/O 2026에서 발표된 Antigravity 2.0은 "에이전트 우선 개발 플랫폼"이다. 데스크탑 IDE, CLI(`agy`), SDK, Managed Agents API 티어, 기업용 배포 경로를 하나의 제품군으로 묶었다. 이전 Antigravity가 Cursor 클론에 가까운 AI 코딩 IDE였다면, 2.0부터는 멀티 에이전트 오케스트레이션을 플랫폼 수준으로 통합하려 한다.

그리고 Gemini CLI는 2026년 6월 18일에 종료된다. AI Pro, AI Ultra, 무료 사용자 모두 해당된다. Gemini Code Assist for GitHub를 통한 기업 사용자도 마찬가지다. Google은 "모두 Antigravity로 오라"고 선언한 셈이다. 오픈소스를 접고, 사용량 제한이 있는 클로즈드 제품으로 강제 이동이다.

### 내가 중요하다고 보는 이유

솔직히 처음엔 "또 다른 Cursor 클론"이라고 넘길 뻔했다. 그런데 세 가지가 눈에 걸렸다.

첫째, Gemini CLI 종료. Gemini CLI는 오픈소스였다. 수십만 개발자가 쓰던 도구를 닫힌 소프트웨어로 교체하는 건 전략적 선언이다. Google이 개발자 도구를 수익 모델에 본격 연결하겠다는 신호다.

둘째, `GEMINI.md`와 `.agents/` 디렉터리. Claude Code의 `CLAUDE.md`와 `.claude/agents/`를 본 적 있다면 익숙할 것이다. Antigravity도 같은 패턴을 쓴다. 에이전트 정의 파일이 프로젝트 내에 위치하고, 빌드 시스템처럼 동작한다. 이 컨벤션이 수렴되고 있다는 건 시장이 방향을 잡아가고 있다는 뜻이다.

셋째, Gemini 3.5 Flash. $1.50/MTok 입력, $9.00/MTok 출력. 1M 토큰 컨텍스트. 이 가격표가 Antigravity 제품군의 경쟁력을 결정한다.

## 직접 열어봤다: 확장 구조로 읽는 아키텍처

터미널에서 앱 내부를 열었다. Antigravity는 Electron 앱이고, VS Code 1.107 기반이다.

```bash
$ cat /Applications/Antigravity.app/Contents/Resources/app/product.json
# version: 1.107.0
# nameShort: Antigravity
```

확장 목록에서 눈에 들어온 것들:

```
/Extensions/antigravity/          ← 핵심 에이전트 확장 (v0.2.0)
/Extensions/antigravity-code-executor/   ← Cascade가 생성한 코드 실행
/Extensions/antigravity-dev-containers/  ← 원격 컨테이너 지원
/Extensions/antigravity-remote-openssh/  ← SSH 원격 작업
```

그리고 이게 흥미로웠다. `package.json`의 `jsonValidation` 항목:

```json
{
  "fileMatch": "**/mcp_config.json",
  "url": "./schemas/mcp_config.schema.json"
}
```

MCP 설정 파일 스키마가 내장돼 있다. Antigravity가 MCP 생태계를 지원한다는 의미다. 에이전트 도구를 MCP로 확장할 수 있는 구조다.

커맨드 목록에도 재미있는 항목들이 있었다:

```
antigravity.importCursorSettings      ← Cursor 설정 임포트
antigravity.importWindsurfSettings    ← Windsurf 설정 임포트
antigravity.importVSCodeSettings      ← VS Code 설정 임포트
antigravity.importCiderSettings       ← Cider (Google 내부 IDE) 설정 임포트
```

네 가지 경쟁 제품의 설정 임포트를 빌트인으로 지원한다. "마이그레이션 마찰을 없애겠다"는 의도가 명확하다. 내가 Cursor에서 Windsurf로 옮길 때 설정을 다시 세팅하는 게 얼마나 귀찮았는지 기억하면, 이건 생각보다 유효한 전략이다.

Cascade 패널 (`cascade-panel.html`)은 에이전트 인터페이스다. `antigravity-code-executor`가 Cascade가 생성한 코드를 실행하는 구조로 보인다. 이건 Windsurf의 Cascade와 이름이 같은 것이 우연이 아닐 것이다.

아직 설치된 버전은 `agy` CLI가 없다. 공개 패키지 매니저 어디에도 `@google/antigravity`는 없다:

```bash
$ npm install -g @google/antigravity
→ 404 Not Found

$ brew install antigravity
→ 패키지 없음 (Cask로는 IDE만 설치 가능)
```

2026-05-21 현재, Antigravity CLI(`agy`)는 공개 배포 전이다. Google I/O에서 발표만 됐고, 실제로 터미널에서 `agy new-agent`를 칠 수 없다. npm 레지스트리에도 `@google/antigravity` 패키지가 없다. Homebrew Cask로 설치할 수 있는 건 IDE 앱뿐이다. Source Review로 전환해서 이후 내용을 분석한다.

## Antigravity 2.0 발표 내용 — 문서와 공개 예제 기준

공식 발표 기준으로 Antigravity 2.0의 핵심 기능은 다음과 같다.

### 멀티 에이전트 병렬 실행

하나의 lead agent가 고수준 목표를 받아 여러 specialist subagent에 위임한다. 각 서브에이전트는 독립적인 컨텍스트 윈도우, 모델, 프롬프트, 도구 세트를 가진다. Google의 공개 예시에서 언급된 서브에이전트 유형:

- **Architect Agent**: 아키텍처와 설계 패턴
- **Coding Agent**: 구현 세부사항
- **Testing Agent**: 단위 테스트, 회귀 테스트
- **Documentation Agent**: 기술 문서 자동 업데이트

이건 [Claude Code에서 서브에이전트로 병렬 작업을 나누는 방식](/ko/blog/ko/claude-code-parallel-sessions-git-worktree)과 본질적으로 같은 패턴이다. 차이는 Google이 이걸 IDE 내에 GUI로 제공한다는 것.

### GEMINI.md와 .agents/ 디렉터리

프로젝트 루트에 `GEMINI.md`를 두면 모든 에이전트가 공통 규칙을 참조한다. `.agents/` 디렉터리에 `agents.md`와 `skills.md`를 놓으면 서브에이전트 정의와 재사용 가능한 스킬을 선언한다.

Claude Code를 쓰는 사람이라면 `CLAUDE.md`, `.claude/agents/`, `.claude/skills/` 구조가 떠오를 것이다. 구조가 사실상 동일하다. 이 컨벤션이 AI 에이전트 개발의 표준이 되어가고 있다는 걸 느낀다. [멀티 에이전트 오케스트레이션 라우팅 패턴](/ko/blog/ko/multi-agent-orchestration-routing)을 이미 다룬 적 있는데, 그때 정리한 개념들이 여기서도 그대로 적용된다.

### Antigravity CLI (agy) — 발표는 됐지만

Google은 `agy`라는 새 CLI를 발표했다. Gemini CLI에서 마이그레이션되는 개념으로, `agy` 명령으로 터미널에서 에이전트를 생성하고 실행할 수 있다고 한다. Gemini CLI가 갖고 있던 Agent Skills, Hooks, Subagents, Extensions 기능을 이어받는다.

문제는 아직 배포가 안 됐다. The Register는 이를 두고 "[개발자들이 Antigravity로 떠밀리는 상황](https://www.theregister.com/ai-ml/2026/05/20/bye-bye-gemini-cli-google-nudges-devs-toward-antigravity/5243605)"이라고 표현했다. 기능이 준비되기 전에 마이그레이션 데드라인부터 잡았다는 비판이다.

## Gemini 3.5 Flash API — 가격 분석

Antigravity 2.0의 엔진은 Gemini 3.5 Flash다. 2026년 5월 19일 GA.

| 항목 | 수치 |
|------|------|
| 입력 가격 | $1.50 / 1M 토큰 |
| 출력 가격 | $9.00 / 1M 토큰 |
| 컨텍스트 윈도우 | 1,048,576 토큰 (≈786K 단어) |
| 최대 출력 | 65,536 토큰 |
| 속도 | 비교 모델 대비 4x 빠름 |

[2026년 LLM API 가격 비교](/ko/blog/ko/llm-api-pricing-comparison-2026-gpt5-claude-gemini-deepseek)에서 다룬 Claude Opus 4.7($15/$75 per MTok)과 비교하면 입력 기준 10배 저렴하다. 물론 모델 성능 격차가 있지만, Gemini 3.5 Flash는 Gemini 3.1 Pro를 다섯 개 벤치마크에서 앞선다.

Terminal-Bench 2.1에서 76.2%, MCP Atlas 83.6%를 기록했다는 공개 수치를 보면, 코딩 에이전트용 모델로서는 경쟁력 있는 위치다. Antigravity 내부 최적화 버전은 공개 API 대비 12배 빠르다는 설명도 있었다.

나는 이 가격표가 Antigravity 생태계의 핵심 경쟁력이라고 본다. Gemini 3.5 Flash로 병렬 에이전트를 돌리면 Claude Opus급 모델로 같은 일을 하는 것보다 비용이 훨씬 낮다. 정확도를 조금 양보하고 속도와 비용을 얻는 트레이드오프다.

## GEMINI.md vs CLAUDE.md — 두 플랫폼의 유사한 접근

나는 Claude Code를 일상적으로 쓴다. `CLAUDE.md`에 프로젝트 규칙을 적고, `.claude/agents/`에 서브에이전트를 정의하고, `.claude/skills/`에 재사용 가능한 기술을 둔다. Antigravity가 `GEMINI.md`, `.agents/`, `skills.md`로 같은 구조를 따른다는 건, 이 컨벤션이 수렴되고 있다는 뜻이다.

두 플랫폼의 차이를 따지자면:

**실행 모델**: Claude Code는 터미널 중심의 CLI 도구다. GUI 없이 코드와 프롬프트로 에이전트를 조합한다. Antigravity는 GUI가 중심이다. 병렬 에이전트가 화면에 시각적으로 표시된다.

**생태계 결합도**: Claude Code는 Anthropic API 종속이 강하다. Antigravity는 MCP 지원을 내장해서 외부 도구 통합이 더 유연하다. 그 대신 Gemini 모델과의 결합도 강하다.

**투명도**: Claude Code는 비교적 내부 동작이 관찰 가능하다. Antigravity의 Cascade는 블랙박스에 가깝다. 에이전트가 무엇을 어떻게 결정했는지 추적하기 어렵다.

어떤 게 더 낫다고 단정하기 어렵다. 쓰는 사람과 작업 유형에 따라 다르다. 다만 이 두 플랫폼이 수렴하는 방향을 보면, 2026년 말쯤엔 "AI 에이전트 개발 플랫폼"의 표준 인터페이스가 어느 정도 정해질 것 같다.

## 비판: Gemini CLI 퇴역은 실수다

솔직히 이게 제일 걸린다.

Gemini CLI는 오픈소스였다. 개발자들이 기여하고, 포크하고, 커스터마이즈했다. 그것을 닫힌 소프트웨어로 교체하면서 6월 18일 데드라인을 준 건 신뢰 문제다.

더 심각한 건 사용량 제한이다. 커뮤니티 보고에 따르면 주간 할당량이 빠르게 소진된다. Gemini CLI로는 무제한에 가깝게 쓰던 사람들이 Antigravity CLI로 옮기면 이 벽에 부딪힌다. 기능 이전을 약속하면서 사용 규모는 줄이는 셈이다.

The Register의 헤드라인이 그냥 나온 게 아니다: "Bye-bye, Gemini CLI; Google nudges devs toward Antigravity."

그리고 하나 더. Antigravity CLI가 Go로 작성됐다는 발표는 좋다. 빠르고 가볍다. 그런데 오픈소스 기여물로 개선된 Gemini CLI를 클로즈드 소스 Go 바이너리로 대체한 건 커뮤니티 입장에서 납득하기 어렵다.

기술적으로 더 나은 제품을 만들더라도, 이 방식으로 전환하면 개발자 커뮤니티의 신뢰를 깎는다. Google은 이 비용을 과소평가하는 경향이 있다.

## 누가 써야 하나 — 내 정리

지금 당장 Antigravity 2.0으로 옮겨야 할 이유가 있는 사람:

- **Google Cloud 기반 인프라를 쓰는 팀**: Google AI Studio, Firebase, Cloud Run 통합이 One-click 수준이다. 기존 구글 생태계 안에 있다면 마찰이 적다.
- **비용 최적화가 중요한 팀**: Gemini 3.5 Flash API 가격은 Claude나 GPT 대비 입력 기준 5~10배 저렴하다. 대규모 코드 분석이나 문서 처리에 경제적이다.
- **VS Code 기반으로 Cursor나 Windsurf를 쓰던 사람**: 설정 임포트가 빌트인이라 마이그레이션 비용이 낮다.

지금 기다리는 게 나은 경우:

- **`agy` CLI가 필요한 사람**: 아직 배포 안 됐다. 터미널 중심 워크플로우면 시기상조다.
- **오픈소스 도구체인이 중요한 팀**: 정책이 바뀔 가능성을 감안해야 한다. Gemini CLI 선례가 불안하다.
- **Anthropic API와 깊이 통합된 경우**: Claude Code 생태계에 이미 익숙하고 기능에 만족하면, 굳이 옮길 이유가 없다.

## Windsurf와 이름이 같은 Cascade — 우연인가

Antigravity의 에이전트 패널 이름이 Cascade다. Windsurf의 AI 에이전트 기능 이름도 Cascade다. 공식 문서에서 직접 확인했다. 이게 우연일 리 없다.

Windsurf는 원래 Codeium이 만든 IDE로, Cascade를 통한 에이전트 코딩으로 Cursor와 차별화했다. Antigravity가 같은 이름을 쓴다는 건, Google이 Windsurf 사용자층을 직접 겨냥하고 있다는 신호다. 내가 확인한 설정 임포트 목록에 `antigravity.importWindsurfSettings`가 있는 것도 같은 맥락이다.

이 IDE 전쟁이 어디로 흘러갈지 예측하기 어렵지만, 경쟁 심화는 개발자에게 좋다. [Cursor, Claude Code, Windsurf 비교 분석](/ko/blog/ko/cursor-3-vs-claude-code-vs-windsurf-2026)을 작성했을 때는 세 경쟁자를 다뤘는데, 이제 Antigravity가 네 번째로 진입했다. 다음 비교 분석이 필요해진 것 같다.

## Gemini Code Assist 엔터프라이즈 사용자는 예외

한 가지 중요한 예외 조항이 있다. Gemini CLI 종료가 모든 사용자에게 적용되는 건 아니다.

Gemini Code Assist Standard나 Enterprise 라이선스를 통해 Gemini CLI를 사용하는 조직은 이번 변경에 영향을 받지 않는다. Google Cloud를 통한 Gemini Code Assist for GitHub도 마찬가지다. 기업 계약은 유지된다.

이게 의미하는 건 두 가지다. 첫째, Google은 엔터프라이즈 매출을 건드리지 않는다. 리스크가 큰 쪽은 피한다. 둘째, Antigravity로의 마이그레이션 압박은 개인 개발자와 소규모 팀에 집중된다. 무료 사용자와 AI Pro/Ultra 구독자가 타겟이다.

개인적으로 이게 더 문제라고 본다. 오픈소스 Gemini CLI를 가장 적극적으로 쓰던 층이 바로 개인 개발자와 스타트업이다. 이들에게 사용량 제한이 있는 클로즈드 소프트웨어를 강요하는 건, 커뮤니티 기반을 흔드는 선택이다.

## 내 최종 판단 — Google이 진지해진 건 맞다

Cursor 클론을 만들던 초기 Antigravity와 지금은 다르다. 멀티 에이전트 오케스트레이션을 IDE 수준으로 통합하고, Gemini 3.5 Flash라는 저비용 고성능 엔진을 달고, MCP로 외부 도구를 연결하는 구조는 제대로 된 방향이다.

그런데 실행의 문제가 있다. Gemini CLI를 대체 준비 없이 퇴역시키고, 사용량 제한을 걸고, CLI도 아직 배포하지 않은 채 데드라인을 박는 건 제품보다 전략이 앞선 상황이다.

나는 이걸 지금 당장 주력 도구로 전환하지 않는다. 대신 Gemini 3.5 Flash API는 당장 써볼 만하다. 입력 가격이 이 정도면 프로토타이핑 모델로 충분하다. Antigravity 2.0 자체는 `agy` CLI가 나오고, 사용량 정책이 안정되면 재평가할 생각이다.

Google이 에이전트 개발 플랫폼 경쟁에 진지하게 뛰어들었다는 건 확실하다. 이 경쟁이 Claude Code, Cursor, Windsurf 모두에게 압력이 되면 결국 개발자가 이익을 본다. 그 관점에서는 Antigravity 2.0의 등장을 환영한다. 하지만 오픈소스 정책 후퇴는 별개 문제다. 기술적으로 앞서도, 신뢰를 잃으면 개발자 생태계는 돌아서기 쉽다.

---

**실행 가능성 판단 (Source Review 기준):**

- Antigravity 2.0 데스크탑 앱: 설치 확인 (v1.23.2), 내부 구조 직접 분석
- `agy` CLI: 2026-05-21 현재 미배포, `npm`/`brew` 어디에도 없음
- Gemini 3.5 Flash API: Google AI Studio에서 접근 가능, 공식 가격 $1.50/$9.00 per MTok 확인
- 멀티 에이전트 기능: 공식 발표문 및 Google Codelabs 기반, 직접 실행 불가

---

**공개 소스:**
- [Google I/O 2026 Developer Highlights](https://blog.google/innovation-and-ai/technology/developers-tools/google-io-2026-developer-highlights/)
- [Gemini CLI → Antigravity 마이그레이션 공식 가이드](https://developers.googleblog.com/an-important-update-transitioning-gemini-cli-to-antigravity-cli/)
- [Gemini 3.5 Flash 공식 소개](https://deepmind.google/models/gemini/flash/)
- [Google Cloud Blog: I/O 2026 에이전트 개발자용](https://cloud.google.com/blog/topics/developers-practitioners/io26-news-for-agent-developers-on-google-cloud)
