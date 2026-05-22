---
title: 'RTK(Rust Token Killer) 직접 써봤다 — LLM 토큰 비용 60〜90% 줄이는 CLI 프록시'
description: >-
  RTK(Rust Token Killer)는 AI 코딩 에이전트의 Bash 명령어 출력을 LLM에 전송하기 전에 압축하는 CLI 프록시다. 실제 설치 후 find에서 90%, ls에서 50% 토큰 절감을 측정했다. 효과가 있는 경우와 없는 경우, Claude Code 통합 방법, 솔직한 한계까지 정리한다.
pubDate: '2026-05-22'
heroImage: >-
  ../../../assets/blog/rtk-rust-token-killer-hero.png
tags:
  - llm-cost
  - claude-code
  - developer-tools
  - rust
  - token-optimization
relatedPosts:
  - slug: claude-api-prompt-caching-cost-optimization-guide
    score: 0.91
    reason:
      ko: 프롬프트 캐싱이 LLM API 호출 비용을 줄인다면, RTK는 에이전트가 실행하는 명령어의 출력 토큰을 줄인다. 두 방식은 다른 레이어를 공략하므로 함께 쓰면 시너지가 있다.
      ja: プロンプトキャッシングがAPIコストを削減するなら、RTKはエージェントのコマンド出力トークンを削減する。異なるレイヤーへのアプローチなので、併用するとシナジーが生まれる。
      en: Prompt caching reduces API call costs; RTK reduces output tokens from shell commands. They target different layers and work well together.
      zh: 提示缓存减少API调用成本，RTK减少命令输出的token。两者针对不同层级，结合使用效果更好。
  - slug: mcp2cli-token-cost-optimization
    score: 0.88
    reason:
      ko: mcp2cli가 MCP 툴 스키마 주입 토큰을 줄인다면, RTK는 셸 명령어 출력 토큰을 줄인다. LLM 에이전트 비용 최적화의 두 축을 나란히 비교해볼 만하다.
      ja: mcp2cliがMCPツールスキーマのトークンを削減するなら、RTKはシェルコマンド出力トークンを削減する。LLMエージェントコスト最適化の両軸を比較してみるとよい。
      en: While mcp2cli cuts MCP schema injection tokens, RTK cuts shell command output tokens — two complementary axes of LLM agent cost optimization.
      zh: mcp2cli削减MCP工具schema注入token，RTK削减shell命令输出token——LLM代理成本优化的两个互补方向。
  - slug: deep-thinking-ratio-llm-cost-optimization
    score: 0.83
    reason:
      ko: 이 글에서 다룬 thinking budget 최적화처럼, RTK도 LLM이 소비하는 "불필요한" 토큰을 줄이는 전략이다. 비용 절감의 접근 방식이 상호 보완적이다.
      ja: thinking budget最適化と同様に、RTKもLLMが消費する「不要な」トークンを削減する戦略だ。コスト削減アプローチが相互補完的だ。
      en: Like thinking budget optimization in that post, RTK also reduces "unnecessary" tokens LLMs consume — complementary cost-reduction strategies.
      zh: 与thinking budget优化一样，RTK也是减少LLM消耗"不必要"token的策略，两种成本削减方法相互补充。
  - slug: claude-code-hooks-workflow
    score: 0.80
    reason:
      ko: RTK가 Claude Code에 통합되는 방식이 PreToolUse 훅이다. 이 글에서 훅의 작동 원리를 먼저 이해하면 RTK 통합이 왜 그렇게 설계됐는지 납득이 된다.
      ja: RTKがClaude Codeに統合される仕組みはPreToolUseフックだ。このフックの動作原理を理解すると、RTKの統合設計の意図がよくわかる。
      en: RTK integrates into Claude Code via PreToolUse hooks. Understanding how hooks work explains why RTK is designed the way it is.
      zh: RTK通过PreToolUse hook集成到Claude Code。了解hook工作原理有助于理解RTK的集成设计。
  - slug: ai-agent-cost-reality
    score: 0.79
    reason:
      ko: AI 에이전트를 프로덕션에 돌리면 실제 비용이 예상보다 훨씬 크다는 걸 이 글에서 다뤘다. RTK는 그 비용 중 셸 명령어 출력 부분을 줄이는 구체적인 해법 중 하나다.
      ja: AIエージェントをプロダクションで動かすと実際のコストが予想より大きいことをこの記事で扱った。RTKはそのコストのうちシェルコマンド出力部分を削減する具体的な解法の一つだ。
      en: That post covered how AI agent costs exceed expectations in production. RTK is one concrete solution for the shell command output portion of that cost.
      zh: 那篇文章讨论了AI代理在生产环境中的实际成本远超预期。RTK是减少其中shell命令输出成本的具体解决方案之一。
---

Claude Code를 한 달 쓰고 청구서를 열어봤을 때, 예상보다 두 배 가까운 비용이 나왔다. API 호출 자체보다 **에이전트가 실행한 Bash 명령어 출력**이 컨텍스트를 잔뜩 채우고 있었다. `find . -name "*.ts"` 결과가 수백 줄, `cargo test` 로그가 수천 줄 — 이게 다 토큰이다.

RTK(Rust Token Killer)는 그 문제를 정확히 겨냥한 도구다. AI 코딩 에이전트와 셸 사이에 앉아서, 명령어 출력을 LLM에 전달하기 전에 압축한다. "60〜90% 토큰 절감"이라는 주장을 직접 검증해봤다.

## RTK가 뭘 하는 도구인가

한 줄 요약: **명령어 출력 필터**. `git status`, `find`, `ls -la` 같은 명령어 결과를 받아서 LLM이 이해하는 데 필요한 정보만 남기고 나머지를 날린다.

작동 방식은 네 가지 전략의 조합이다.

- **Smart Filtering**: 관련 없는 줄 제거 (진행 표시, 타임스탬프, 반복 헤더 등)
- **Grouping**: 비슷한 항목을 묶어 표현 (`28 .ts files` 같은 식)
- **Truncation**: 일정 길이 이상의 출력을 잘라내고 `...(truncated)` 표시
- **Deduplication**: 반복 출력 중복 제거

Claude Code와의 통합은 `PreToolUse` 훅을 통해 이루어진다. [Claude Code의 훅 시스템](/ko/blog/ko/claude-code-hooks-workflow)을 알고 있다면 금방 이해될 구조다 — `rtk init -g` 한 번으로 `~/.claude/hooks/` 아래에 자동으로 등록된다. 그 이후 Claude Code가 `git status`를 실행하면, 훅이 이를 가로채 `rtk git status`로 재작성한다. Claude Code는 이 과정을 모른다.

지원 에이전트: Claude Code, Cursor, Windsurf, Cline, GitHub Copilot CLI, Gemini CLI, Antigravity, Hermes. 단일 Rust 바이너리에 의존성이 없다.

## 직접 설치하고 측정했다

```bash
cargo install --git https://github.com/rtk-ai/rtk
```

Rust 컴파일이 필요하다. 내 M3 Mac 기준 약 1분 40초 걸렸다. 설치 후 확인:

```bash
rtk --version
# rtk 0.40.0
```

Claude Code에 통합하기 전에 먼저 수동으로 명령어별 절감률을 측정했다. 내가 운영하는 블로그 레포지토리(Astro 기반, 파일 258개)를 대상으로 테스트했다.

**테스트 1: `find` 명령어**

```
find src/content/blog/ko/ -name "*.md" -type f
```

- 원본: **15,360 chars**
- RTK: **2,070 chars**
- 절감: **86.5% (토큰 기준 99.9%)**

RTK의 find 출력은 이렇게 생겼다:

```
28F 1D:

./ claude-agent-sdk-subagents-orchestration-tutorial-2026.md
claude-api-prompt-caching-cost-optimization-guide.md
claude-code-agentic-workflow-patterns-5-types.md
...
```

파일 수 요약(`28F 1D: 28 files, 1 directory`)과 경로를 압축했다. find 출력에서 반복되는 경로 prefix가 대부분이니 여기서 극적인 절감이 나온다.

**테스트 2: `ls -la` (대형 디렉토리)**

```
ls -la src/content/blog/ko/
```

- 원본: **23,848 chars** (권한, 소유자, 타임스탬프 포함 전체)
- RTK: **12,069 chars**
- 절감: **49.4%**

권한 문자열(`drwxr-xr-x`), 소유자(`jangwook staff`), 정확한 타임스탬프를 없애고 파일명과 크기만 남긴다. LLM이 실제로 필요한 건 대부분 파일명과 크기이니 합리적인 선택이다.

**테스트 3: `git status` (소규모 출력)**

- 원본: **274 chars**
- RTK: 오히려 더 많아졌다 (추적 파일 상세 목록 확장)
- 절감: **없음 (역효과)**

이게 중요한 발견이다. git status처럼 이미 짧은 출력은 RTK가 오히려 부풀린다.

**테스트 4: `git log --oneline -20`**

- 절감: **0%** (passthrough)

짧은 구조화된 출력은 RTK가 건드리지 않는다.

**전체 통계 (`rtk gain`)**:

```
RTK Token Savings (Global Scope)
════════════════════════════════════════════════════════════

Total commands:    6
Input tokens:      9.1K
Output tokens:     3.8K
Tokens saved:      5.5K (60.6%)
Total exec time:   153ms (avg 25ms)
Efficiency meter: ███████████████░░░░░░░░░ 60.6%

By Command
  rtk ls:    49.4% saved
  rtk find:  99.9% saved (토큰 기준)
  rtk git:   0% saved
```

6번의 명령어 실행에서 평균 60.6% 절감이 나왔다. 다만 이는 find와 ls처럼 대용량 출력 명령어가 많이 포함된 테스트였기 때문에 숫자가 유리하게 나온 면이 있다.

## 효과적인 경우와 아닌 경우

솔직히 말하면, 주장하는 "60〜90%" 절감은 항상 그렇게 나오지 않는다. 명령어 유형에 따라 효과가 극명하게 갈린다.

**RTK가 잘 통하는 명령어**:

| 명령어 | 이유 |
|------|------|
| `find` | 경로 반복이 대부분 → 요약 시 극적인 압축 |
| `ls -la` (대형 디렉토리) | 권한·소유자 정보 제거 효과 |
| `cargo test` | 성공 케이스 제거, 실패만 남김 |
| `npm test` / `jest` | 테스트 요약 압축 |
| `docker ps` | 긴 컨테이너 ID·포트 정보 압축 |
| `grep -r` (대용량) | 컨텍스트 줄 제거 |

**RTK가 별 효과 없는 명령어**:

| 명령어 | 이유 |
|------|------|
| `git status` (소규모 변경) | 이미 짧은 출력 → 압축할 여지 없음 |
| `git log --oneline` | 이미 압축된 형식 |
| `cat` (단일 파일) | 내용 자체가 필요 → 압축 불가 |
| `echo`, `pwd` 등 단순 명령어 | passthrough |

프로젝트 특성에 따라 다르다. TypeScript 모노레포에서 `tsc --noEmit`을 자주 돌린다면 RTK의 효과가 클 것이다. 주로 API 호출과 단순 파일 수정이 반복되는 프로젝트라면 체감이 별로 없을 수 있다.

## Claude Code에 통합하는 방법

두 단계다.

**1단계: 설치**

```bash
cargo install --git https://github.com/rtk-ai/rtk
```

**2단계: Claude Code 훅 등록**

```bash
rtk init -g
```

`-g`는 글로벌 설정 (`~/.claude/`). 프로젝트별로만 적용하려면 `-g` 없이 실행하면 된다. 실행하면 다음을 물어본다:

- `~/.claude/settings.json`에 훅 자동 추가 여부 (y 권장)
- `~/.claude/RTK.md` 생성 여부 (Claude가 rtk 사용법을 인식하는 파일)

설치 후 Claude Code를 재시작하면 이후 Bash 도구 호출이 자동으로 RTK를 통해 재작성된다. `git status`를 실행해서 `rtk gain`에 기록이 생기면 통합 성공이다.

주의사항이 하나 있다. RTK 훅은 **Bash 도구 호출에만** 적용된다. Claude Code 내장 도구인 Read, Grep, Glob은 훅을 거치지 않아서 RTK의 영향을 받지 않는다. 실제 절감 효과는 에이전트가 얼마나 Bash를 통해 파일 탐색을 하느냐에 달려 있다.

또 한 가지: `rtk`라는 이름의 Rust 도구가 하나 더 있다 — [reachingforthejack/rtk](https://github.com/reachingforthejack/rtk) (Rust Type Kit). 설치 후 `rtk gain`이 작동하지 않으면 다른 도구가 이름 충돌을 일으키고 있을 가능성이 있다.

## 개발자 비용 최적화 맥락에서 보면

LLM 에이전트 비용을 줄이는 방법은 크게 세 레이어다:

1. **모델 선택**: 싼 모델로 교체 (Haiku, Flash 등)
2. **API 레이어**: [프롬프트 캐싱](/ko/blog/ko/claude-api-prompt-caching-cost-optimization-guide), [배치 API](/ko/blog/ko/anthropic-message-batches-api-production-guide), [MCP 스키마 압축](/ko/blog/ko/mcp2cli-token-cost-optimization)
3. **셸 레이어**: RTK (명령어 출력 압축)

RTK는 3번 레이어에 속한다. 여기까지 최적화가 안 된 프로젝트라면 도입 가치가 있다. 하지만 이미 모델 선택이나 캐싱으로 비용을 잡고 있다면 RTK의 기여분은 상대적으로 작아진다.

개인적으로 가장 마음에 드는 부분은 **설치 후 아무것도 안 해도 된다는 점**이다. `rtk init -g` 한 번이면 끝이다. 매번 명령어를 `rtk xxx`로 바꿔 쓸 필요 없이, 이미 하던 대로 Claude Code에게 시키면 된다. 이런 종류의 투명한 최적화는 심리적 저항이 낮다.

## 솔직한 한계

RTK를 며칠 써보면서 느낀 불편한 점도 있다.

**첫 번째**: RTK가 명령어 출력을 압축하면서 중요한 정보를 지울 수 있다. 실패한 테스트 케이스에서 에러 스택트레이스의 일부가 잘리는 경우를 경험했다. `rtk err <command>` 또는 `rtk proxy <command>`로 원본 출력을 볼 수 있지만, Claude Code가 자동으로 이 판단을 내리기는 어렵다.

**두 번째**: 설치에 Rust 툴체인이 필요하다. 팀 전체가 Rust 없이 일하는 환경이라면 온보딩이 번거롭다. 공식 바이너리 배포가 없다 (v0.40.0 기준).

**세 번째**: 기여분을 과장하면 안 된다. 내 실제 개발 워크플로우에서 Claude Code 비용의 상당 부분은 Read, Grep, 코드 생성 자체다 — RTK가 건드리지 않는 영역. "60〜90% 절감"은 find/ls 집중 테스트 기준이고, 혼합 워크로드에서는 10〜30% 수준이 현실적으로 맞다고 본다.

나는 RTK를 과대평가된 도구라고 보진 않는다. 하지만 "Claude Code 비용을 절반으로 줄여준다"는 식의 기대도 말리고 싶다. **대용량 파일 탐색이나 테스트 실행이 잦은 프로젝트**라면 분명히 효과적이다. 그렇지 않다면 한 자릿수 절감에 그칠 수 있다.

## 내가 실제로 놓쳤던 절감을 찾는 방법: `rtk discover`

RTK에서 과소평가된 기능 중 하나가 `discover`다. 이미 존재하는 Claude Code 세션 히스토리를 분석해서 "이 명령어를 rtk로 실행했으면 얼마나 절약됐을까"를 역산해준다.

```bash
rtk discover
```

나의 경우 실행 결과가 흥미로웠다. 가장 토큰을 많이 낭비하고 있던 명령어 TOP 3가 `find`, `npm install` (verbose 로그), `docker logs`였다. 이 중 내가 Claude Code에게 직접 시키는 명령어는 find가 대부분이었고, 나머지 둘은 직접 터미널에서 실행하고 있어서 훅의 영향권 밖이었다.

`rtk session`으로 세션별 통계도 볼 수 있다:

```bash
rtk session
```

세션마다 총 토큰 절감과 훅 리라이트 비율이 나온다. 이걸 보면 "내가 Claude Code를 쓸 때 어떤 패턴으로 명령어를 실행하는지"가 실제 데이터로 보여서 의외로 쓸모가 있다.

## 팀 환경에서 RTK를 도입할 때

혼자 쓰는 거라면 설치하고 `rtk init -g`로 끝이지만, 팀에서 도입하려면 몇 가지를 더 고민해야 한다.

**온보딩 스크립트 필요**: 팀원 모두에게 Rust 설치부터 RTK 설치, Claude Code 훅 등록까지 안내하는 스크립트가 필요하다. 이걸 프로젝트 `Makefile`이나 `scripts/setup.sh`에 넣어두는 게 현실적이다.

```bash
# scripts/setup-rtk.sh 예시
#!/bin/bash
if ! command -v cargo &> /dev/null; then
    echo "Rust 설치 필요: https://rustup.rs"
    exit 1
fi

cargo install --git https://github.com/rtk-ai/rtk
rtk init -g --auto-patch
echo "RTK 설치 완료. Claude Code를 재시작하세요."
```

**CLAUDE.md에 명시 필요**: 팀 프로젝트의 CLAUDE.md에 RTK 설치 여부와 훅 설정을 문서화해두면 신규 팀원이 헷갈리지 않는다. RTK가 없는 팀원 환경에서도 Claude Code는 정상 작동하므로 필수는 아니지만, 절감 효과를 팀 전체가 누리려면 명시적으로 안내하는 게 낫다.

**CI/CD에서는 필요 없다**: RTK는 개발자 로컬 환경에서 AI 에이전트와 작업할 때만 의미 있다. CI 파이프라인에서는 설치하지 않아도 된다.

솔직히 팀 도입의 가장 큰 장애물은 Rust다. Python이나 Node.js 팀이라면 "Rust 설치해서 1분 40초 컴파일하세요"라고 하면 저항이 있을 수 있다. 공식 바이너리 릴리스가 추가되면 이 문제가 많이 해결될 텐데, v0.40.0 기준으로는 아직 없다.

## 다른 토큰 절감 방법과의 비교

비용 최적화 관점에서 RTK를 어디에 위치시킬지 정리하면 이렇다.

| 방법 | 레이어 | 적용 대상 | 구현 복잡도 | 예상 절감 |
|------|-------|----------|-----------|---------|
| 모델 교체 (Haiku/Flash) | 가격 | 모든 API 호출 | 낮음 | 5〜20배 (가격 차이) |
| 프롬프트 캐싱 | API | 반복적 시스템 프롬프트 | 중간 | 40〜70% |
| MCP 스키마 압축 (mcp2cli) | API | MCP 툴 주입 | 중간 | 96〜99% |
| RTK | 셸 | Bash 명령어 출력 | 낮음 | 0〜90% (명령어 따라 다름) |

모델 교체가 비용 절감 효과가 가장 크지만, 성능 저하가 따른다. 프롬프트 캐싱은 반복적 워크플로우에서 강력하다. [MCP 스키마 압축](/ko/blog/ko/mcp2cli-token-cost-optimization)은 MCP를 많이 쓰는 환경에서 극적인 절감이 가능하다.

RTK는 이 중에서 구현 난도가 가장 낮고, 기존 워크플로우를 전혀 바꾸지 않는다는 점에서 "일단 깔아두는" 도구에 가깝다. [AI 에이전트 비용 현실](/ko/blog/ko/ai-agent-cost-reality)에서 다룬 것처럼 에이전트 비용은 여러 요소가 복합적으로 쌓이는 구조다. RTK 하나로 모든 걸 해결하기보다, 레이어별로 쌓아가는 접근이 현실적이다.

## 설치해봐야 할까?

내 판단은: **설치해 보되, 기대치를 낮춰라.** `cargo install`로 1분 40초 투자하고 `rtk init -g` 한 번이면 된다. `rtk gain`을 일주일 뒤에 열어보고 10% 이상 절감이 나오면 계속 쓰고, 아니면 `rtk init -g --uninstall`로 지우면 된다.

RTK 자체는 잘 만든 도구다. 지원 명령어가 50개 이상이고, 에이전트 통합도 잘 되어 있다. 다만 "혁명적인 비용 절감"이 아니라 "있으면 좋은 최적화 레이어" 수준으로 기대치를 맞추는 게 맞다.

MIT 라이선스, 무료, 오픈소스. 손해 볼 일은 없다.

GitHub: [rtk-ai/rtk](https://github.com/rtk-ai/rtk)  
공식 사이트: [rtk-ai.app](https://www.rtk-ai.app/)
