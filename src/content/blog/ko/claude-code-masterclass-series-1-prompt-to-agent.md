---
title: "Claude Code 실전 마스터클래스 #1 — 슬래시 명령어·훅·서브에이전트 3단계로 워크플로우 자동화하기"
description: '슬래시 명령어(.claude/commands/)로 작업을 정의하고, settings.json 훅으로 이벤트에 연결하고, 서브에이전트(.claude/agents/)에게 위임하는 3단계 Claude Code 자동화 패턴을 실제 블로그 자동화 시스템으로 설명합니다.'
pubDate: '2026-05-10'
heroImage: '../../../assets/blog/claude-code-masterclass-series-1-prompt-to-agent-hero.jpg'
tags:
  - ClaudeCode
  - 자동화
  - 서브에이전트
  - 워크플로우
relatedPosts:
  - slug: "claude-code-hooks-workflow"
    score: 0.92
    reason:
      ko: "훅을 코드 리뷰 자동화에 적용한 구체적인 사례입니다. 이 글의 Step 2에서 다룬 PostToolUse·Stop 훅이 실제로 어떻게 쓰이는지 확인할 수 있습니다."
      ja: "フックをコードレビュー自動化に適用した具体的なケースです。Step 2で扱ったPostToolUse・Stopフックが実際にどう使われるか確認できます。"
      en: "A concrete example of applying hooks to code review automation. Shows how the PostToolUse and Stop hooks from Step 2 work in a real project."
      zh: "将Hook应用于代码审查自动化的具体案例，展示Step 2中PostToolUse和Stop Hook在实际项目中的应用。"
  - slug: "claude-agent-teams-guide"
    score: 0.88
    reason:
      ko: "서브에이전트를 5개 전문 팀으로 조직하는 방법입니다. Step 3에서 소개한 에이전트 위임 패턴을 팀 단위로 확장한 버전입니다."
      ja: "サブエージェントを5つの専門チームに組織する方法です。Step 3で紹介したエージェント委任パターンをチーム規模に拡張したバージョンです。"
      en: "Organizing subagents into 5 specialized teams — extends the agent delegation pattern from Step 3 to a team-scale structure."
      zh: "将子代理组织为5个专业团队，是Step 3中代理委托模式的团队级扩展版本。"
  - slug: "claude-code-agentic-workflow-patterns-5-types"
    score: 0.81
    reason:
      ko: "이 마스터클래스에서 만든 파이프라인이 5가지 에이전틱 패턴 중 어디에 속하는지 파악하는 데 도움이 됩니다."
      ja: "このマスタークラスで作ったパイプラインが5つのエージェントパターンのどれに当たるか把握するのに役立ちます。"
      en: "Helps identify where the pipeline built in this masterclass fits among the 5 agentic workflow patterns."
      zh: "帮助了解本教程构建的管道属于5种代理工作流模式中的哪种。"
  - slug: "claude-code-plugins-complete-guide"
    score: 0.76
    reason:
      ko: "슬래시 명령어와 에이전트를 플러그인 형태로 재사용하는 방법입니다. 이 글에서 다룬 `.claude/commands/` 구조를 외부 레포에서 공유하는 다음 단계입니다."
      ja: "スラッシュコマンドとエージェントをプラグイン形式で再利用する方法です。この記事で扱った`.claude/commands/`構造を外部リポジトリで共有する次のステップです。"
      en: "How to reuse slash commands and agents as plugins. The next step after mastering the .claude/commands/ structure covered here."
      zh: "以插件形式重用斜线命令和代理的方法，是本文.claude/commands/结构的外部共享进阶。"
---

이 글을 읽고 있는 지금, 이 포스트는 오늘 아침 11시 30분에 자동으로 실행된 launchd 작업이 Claude Code를 깨웠고, Claude Code가 `/daily-tech-blog` 슬래시 명령어를 실행하고, 서브에이전트들이 리서치와 번역을 분담하면서 만들어진 결과물이다.

나는 지난 몇 달 동안 이 자동화 파이프라인을 직접 만들고 운용해왔다. 완벽하지 않다. 가끔 타임아웃이 나고, 빌드가 실패하고, 한 언어 버전만 생성된 채 끝나는 날도 있다. 그래도 이 시스템이 없었다면 매일 4개 언어로 글을 발행하는 건 물리적으로 불가능했을 것이다.

이 시리즈는 그 과정에서 배운 것들을 정리한다. #1편인 오늘은 가장 핵심적인 3단계 — <strong>슬래시 명령어</strong>, <strong>훅</strong>, <strong>서브에이전트</strong> — 를 처음부터 만드는 법을 다룬다.

대상 독자는 Claude Code를 이미 써본 사람이다. 설치법이나 기본 사용법은 다루지 않는다. 대신 "어떻게 하면 반복 작업을 자동화하고, 여러 역할을 에이전트로 분리하고, 이벤트에 반응하는 파이프라인을 만들 수 있는가"에 집중한다.

## Step 1: 슬래시 명령어 — `.claude/commands/` 폴더가 전부다

Claude Code에서 `/commit`, `/review`, `/deploy` 같은 명령어를 만드는 방법은 놀랍도록 단순하다. `.claude/commands/` 디렉토리 안에 `.md` 파일 하나를 만들면 된다.

파일명이 곧 명령어 이름이다:

```
.claude/
└── commands/
    ├── commit.md          → /commit
    ├── daily-review.md    → /daily-review
    └── publish.md         → /publish
```

파일 내용은 자연어 지침이다. Markdown처럼 보이지만 코드처럼 동작한다:

```markdown
# Publish Command

Validate and publish the blog post to production.

## Usage
/publish <slug>

## Workflow
1. Run npm run validate:publishing
2. Run npm run build
3. Run git add and commit with the slug
4. Run git push origin main

Report errors clearly with the step number.
```

이게 전부다. Claude Code 세션에서 `/publish my-post-slug`를 입력하면, 위에 정의한 워크플로우가 그대로 실행된다. Claude가 각 단계를 해석해서 도구 호출로 변환한다.

내가 이 구조를 처음 봤을 때 놀란 점은 "프로그래밍 언어가 필요 없다"는 것이었다. 절차를 텍스트로 쓰면 Claude가 상황에 맞게 알아서 실행한다. 물론 의도와 다르게 해석될 때도 있다 — 이 부분은 솔직히 아직도 예측하기 어렵다.

명령어 파일의 또 다른 장점은 버전 관리다. git에서 변경 이력이 남기 때문에, 어떤 워크플로우 변경이 문제를 일으켰는지 추적하기 쉽다. 일반 쉘 스크립트를 관리하는 것보다 훨씬 투명하다.

### 명령어 작성 팁

"무엇을 해야 하는가"만 쓰는 것보다, "왜" 이 순서인지, "어떤 상황에서 다르게 동작해야 하는지"를 함께 쓰면 훨씬 정교해진다:

```markdown
# Daily Tech Blog

Research, write, validate, and publish one daily article.

## Context
- Today's date: use `date +%F`
- Blog repo: ~/Documents/workspace/www.jangwook.net
- Content types: how-to (Mon-Wed), news (Thu-Fri), series (Sat-Sun)

## Failure Handling
- If sandbox test fails: switch to Source Review lane
- If build fails 3 times: stop and report
- Never ask the user — this runs unattended
```

"Never ask the user" 줄 하나가 자율 실행 모드를 만드는 핵심이다. 이게 없으면 Claude는 불확실한 상황마다 확인 질문을 하며 멈춘다. 크론 작업에서는 치명적이다.

## Step 2: settings.json 훅 — 이벤트에 반응하는 자동화

슬래시 명령어가 "무엇을 해야 하는가"를 정의한다면, 훅은 "언제 자동으로 동작해야 하는가"를 정의한다.

`.claude/settings.json`의 `hooks` 필드에 이벤트-커맨드 쌍을 등록한다:

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "bash ~/send-telegram.sh 'Claude가 작업을 완료했습니다'"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write",
        "hooks": [
          {
            "type": "command",
            "command": "echo \"[audit] $(date) — 파일 쓰기 발생\" >> ~/.claude/audit.log"
          }
        ]
      }
    ]
  }
}
```

### 4가지 훅 타입

| 타입 | 언제 실행되는가 | 대표 활용 |
|------|---------------|----------|
| `PreToolUse` | Claude가 도구를 호출하기 <strong>직전</strong> | 위험 명령어 차단, 감사 로그 |
| `PostToolUse` | 도구 호출이 <strong>완료된 직후</strong> | 파일 저장 후 lint, 커밋 후 알림 |
| `Stop` | Claude가 응답을 <strong>완전히 멈출 때</strong> | 완료 알림, 정리 작업 |
| `SessionStart` | Claude 세션이 <strong>시작될 때</strong> | 시간 컨텍스트 주입, 환경 세팅 |

내 설정에서 가장 유용했던 건 `Stop` 훅이다. 긴 자동화 작업(30분〜1시간)이 끝나면 Telegram으로 알림이 온다. 이걸 설정한 뒤로 "아직 끝났나?" 하고 터미널을 들여다보는 습관이 완전히 사라졌다. 집중력을 끊기지 않고 다른 작업을 할 수 있게 됐다는 점에서, 이 훅 하나가 생산성에 가장 큰 기여를 했다고 본다.

### permissions 설정 — 허용 목록 기반 보안

훅과 함께 반드시 설정해야 하는 게 `permissions`다. Claude Code는 기본적으로 모든 Bash 명령어 실행 전에 사용자 승인을 요청한다. 자동화 환경에서는 이 동작이 파이프라인을 멈춰버린다.

허용할 명령어를 미리 등록해두면 승인 프롬프트 없이 실행된다:

```json
{
  "permissions": {
    "allow": [
      "Bash(git log:*)",
      "Bash(git diff:*)",
      "Bash(git add:*)",
      "Bash(git commit:*)",
      "Bash(git push:*)",
      "Bash(npm run build:*)",
      "Bash(npm run validate:*)"
    ]
  }
}
```

<strong>주의</strong>: 허용 목록을 너무 넓게 잡으면(`Bash(*)`처럼) 의도치 않은 명령어가 실행될 수 있다. 실제로 필요한 명령어 패턴만 등록하는 게 안전하다.

훅을 코드 리뷰 파이프라인에 실제로 적용한 사례는 [Claude Code Hook으로 구축하는 자동화 코드 리뷰 시스템](/ko/blog/ko/claude-code-hooks-workflow)에서 볼 수 있다.

## Step 3: 서브에이전트 위임 — `.claude/agents/` 전문화된 AI

Claude 하나에게 리서치 + 글쓰기 + SEO 최적화 + 번역 + 빌드를 모두 맡기면, 각 분야의 집중도가 떨어진다. 토큰 컨텍스트도 낭비된다.

서브에이전트는 각 역할에 특화된 별도의 Claude 인스턴스를 만드는 개념이다. `.claude/agents/` 폴더에 frontmatter를 가진 Markdown 파일로 정의한다:

```markdown
---
name: writing-assistant
description: Technical blog post writer. Use when creating multilingual (ko/ja/en/zh) developer content.
tools: Read, Write, WebSearch
---

You are a technical writer specializing in developer-focused content.

Core rules:
- Write for developers who will actually run the code
- Include at least 3 first-person experience references
- Verify technical claims before writing
- Never fabricate benchmarks or logs
```

frontmatter의 `description` 필드가 중요하다. 오케스트레이터 Claude가 "어떤 에이전트를 언제 써야 하는가"를 판단할 때 이 필드를 참고한다. 모호하게 쓰면 엉뚱한 에이전트가 호출되거나 아예 무시된다.

`tools` 필드에는 해당 에이전트가 실제로 필요한 도구만 나열한다. `Write` 권한이 없는 리서치 에이전트는 실수로 파일을 수정할 수 없다. 역할 특화와 권한 제한을 동시에 달성하는 방법이다.

이 블로그에서는 현재 19개 에이전트가 운용 중이다:

- `writing-assistant` — 4개 언어 포스트 작성
- `seo-optimizer` — 메타태그, 내부링크 최적화
- `web-researcher` — 트렌드 리서치 및 팩트 체크
- `content-recommender` — relatedPosts 생성
- `image-generator` — 히어로 이미지 브리프 작성

에이전트 팀을 체계적으로 구성하는 더 복잡한 패턴은 [Claude Code Agent Teams 완벽 가이드](/ko/blog/ko/claude-agent-teams-guide)에서 다뤘다.

## 3단계 통합: 실제 자동화 파이프라인

이론보다 실제 동작하는 파이프라인을 보는 게 낫다. 이 블로그의 매일 자동화 흐름은 이렇다:

```
macOS launchd (매일 11:30)
    ↓
daily-tech-blog.sh
    ↓
claude --dangerously-skip-permissions "/daily-tech-blog"
    ↓
/daily-tech-blog 슬래시 명령어 실행
    ├── 트렌드 리서치 (서브에이전트: web-researcher)
    ├── 샌드박스 테스트 (mktemp)
    ├── 4개 언어 포스트 작성 (서브에이전트: writing-assistant)
    ├── npm run validate:publishing
    ├── npm run build
    └── git push origin main
    ↓
Stop 훅 → send-telegram.sh → Telegram 알림
```

가장 중요한 파일은 `daily-tech-blog.sh`다. Claude를 호출하는 핵심 부분:

```bash
run_with_timeout "$MAX_TIMEOUT" claude --dangerously-skip-permissions \
  "/daily-tech-blog" \
  < /dev/null >> "$LOG_FILE" 2>&1 || CLAUDE_EC=$?
```

`--dangerously-skip-permissions`는 모든 권한 프롬프트를 건너뛴다. 이름에서 알 수 있듯 위험하다. 허용 목록이 잘 정의된 상태에서만 써야 하고, 개인 자동화 프로젝트 외에는 사용을 권장하지 않는다.

`< /dev/null`은 stdin을 닫아서 Claude가 대화형 입력을 기다리며 멈추는 것을 방지한다. 크론 작업에서 이게 없으면 Claude가 무한정 대기한다.

실제 실행 로그는 이렇게 생겼다:

![daily-tech-blog 실제 실행 로그 캡처](../../../assets/blog/claude-code-masterclass-series-1-log-capture.jpg)

launchd plist 설정도 살펴볼 만하다:

```xml
<key>StartCalendarInterval</key>
<dict>
    <key>Hour</key>
    <integer>11</integer>
    <key>Minute</key>
    <integer>30</integer>
</dict>
<key>StandardOutPath</key>
<string>/Users/jangwook/logs/launchd-daily-tech-blog.log</string>
```

로그를 파일로 리다이렉트해두면 나중에 "왜 오늘 포스트가 안 나왔나"를 디버깅할 때 절대적으로 도움이 된다.

## 실제로 시작하는 법 — 최소 설정 5분

이 3단계를 처음 도입하는 사람을 위해 최소한의 작동 예제를 정리한다. 기존 프로젝트에 바로 적용할 수 있다.

**1. 폴더 구조 생성**

```bash
mkdir -p .claude/commands .claude/agents
```

**2. 첫 슬래시 명령어 작성** (`.claude/commands/review.md`)

```markdown
# Review Command

Review recent changes before committing.

## Steps
1. Run git diff --staged to see staged changes
2. Check for: hardcoded secrets, console.log, TODO comments
3. Suggest improvements or approve with "LGTM"

For detailed security analysis, delegate to @checker agent.
```

"For detailed security analysis, delegate to @checker agent." 한 줄이 핵심이다. 오케스트레이터가 에이전트를 쓸 시점을 명시적으로 지정하지 않으면, 스스로 판단하다가 에이전트를 건너뛰는 경우가 생긴다.

**3. 완료 알림 훅 설정** (`.claude/settings.json`)

```json
{
  "permissions": {
    "allow": ["Bash(git:*)", "Bash(npm:*)"]
  },
  "hooks": {
    "Stop": [{
      "hooks": [{
        "type": "command",
        "command": "say '클로드가 작업을 완료했습니다'"
      }]
    }]
  }
}
```

macOS의 `say` 명령어로 음성 알림을 주는 가장 단순한 Stop 훅이다. Telegram이나 Slack 연동은 이 다음 단계다.

**4. 첫 에이전트 정의** (`.claude/agents/checker.md`)

```markdown
---
name: checker
description: Code quality reviewer. Use when checking files for issues before commit.
tools: Read, Grep
---

Review the provided files for:
- Syntax errors and obvious bugs
- Security issues (hardcoded credentials, SQL injection patterns)

Rate: SAFE / CAUTION / CRITICAL
```

이 4개 파일이 최소 작동 단위다. 이것만 있어도 `/review`를 입력하면 staged 변경사항을 분석하고, 작업이 끝나면 음성 알림을 받고, 세부 검토가 필요할 때 `checker` 에이전트에게 위임할 수 있다.

여기서 중요한 학습 포인트가 하나 있다. 이 구조는 "프로그래밍"이 아니라 "지시서 작성"에 가깝다. Claude는 파일을 실행하지 않고 읽어서 의도를 파악한다. 그래서 지시서가 모호하면 실행도 모호해진다. 구체적이고 명확한 지시가 복잡한 로직보다 더 중요하다.

## 솔직한 평가 — 뭐가 잘 안 되는가

이 시스템을 3개월 운용한 결과, 몇 가지 현실적인 제약을 만났다.

<strong>비용 문제</strong>: 4개 언어로 2,500단어 이상의 포스트를 매일 자동 생성하면 한 달 API 비용이 예상보다 빠르게 쌓인다. Anthropic Max 구독으로 어느 정도 관리하지만, 비용 감수 없이 이 규모의 자동화는 어렵다.

<strong>타임아웃 처리</strong>: 빌드가 느리거나 서브에이전트 체인이 길어지면 60분 타임아웃에 걸린다. 포스트가 절반만 생성된 채 중단되는 상황이다. 타임아웃 감지 후 정리 로직이 없으면 repo 상태가 꼬인다. 내 스크립트에서는 이렇게 처리했다:

```bash
# 타임아웃 발생 시 로그만 남기고 계속 진행
run_with_timeout "$MAX_TIMEOUT" claude ... || CLAUDE_EC=$?
if [[ "$CLAUDE_EC" -ne 0 ]]; then
  echo "⚠ Claude 실행 실패 (exit=$CLAUDE_EC)" | tee -a "$LOG_FILE"
  echo "▶ 포스트 생성 여부를 확인 후 계속 진행..." | tee -a "$LOG_FILE"
fi
```

타임아웃을 에러로 중단시키지 않고, 포스트가 실제로 생성됐는지 파일 수로 확인한 뒤 계속 진행한다. 실패를 우아하게 처리하는 가장 간단한 방법이다.

<strong>에이전트 품질의 비결정성</strong>: 같은 명령어를 두 번 실행해도 결과가 다를 수 있다. 글의 품질, 내부링크 위치, relatedPosts 선택 모두 그날그날 다르다. LLM의 특성상 피할 수 없고, QA 루프(validate:publishing, astro check, build)로 최소한의 품질 기준을 지키는 게 현실적이다.

<strong>에이전트 선택 실패</strong>: 오케스트레이터가 잘못된 에이전트를 선택하거나 에이전트를 무시할 때가 있다. `description` 필드를 명확하게 쓰면 줄어들지만 완전히 없애기는 어렵다. 에이전트를 호출하는 시점을 슬래시 명령어 파일에 명시적으로 써두는 게 도움이 됐다: `"For research tasks, delegate to @web-researcher agent."` 인퍼런스에 맡기지 말고 명시적으로 지시하는 것이다.

<strong>컨텍스트 누수</strong>: 서브에이전트가 오케스트레이터의 컨텍스트를 완전히 이어받지 못하는 경우가 있다. 에이전트를 호출할 때 필요한 컨텍스트를 명시적으로 전달하는 것이 좋다. "이 파일을 리뷰해줘"보다 "이 파일을 리뷰해줘. 이 파일은 Astro 기반 블로그의 컨텐츠 파일이고 frontmatter 스키마를 따라야 한다"처럼 배경 정보를 함께 주는 게 결과 품질에 차이를 만든다.

솔직히 말하면, 이 시스템을 "프로덕션 레디"라고 부르기는 이르다. 내 기준으로는 "개인 자동화에 충분히 안정적인 수준"이다. 팀 단위로 쓰려면 에러 복구, 상태 관리, 감사 로그를 더 견고하게 설계해야 한다.

에이전틱 워크플로우를 구조적으로 분류하는 시각이 필요하다면 [Claude Code 에이전틱 워크플로우 패턴 5가지](/ko/blog/ko/claude-code-agentic-workflow-patterns-5-types)가 도움이 된다.

## 다음 편: #2 MCP 서버 연동

이번 편에서는 `.claude/` 폴더 내부에서 완결되는 자동화를 다뤘다.

#2편에서는 한 단계 더 나간다 — <strong>MCP(Model Context Protocol) 서버를 직접 만들어서 Claude Code에 외부 도구를 연결하는 법</strong>. Notion 데이터베이스 읽기, Slack 메시지 전송, PostgreSQL 쿼리 같은 외부 시스템 연동이 슬래시 명령어 하나로 가능해지는 구조를 다룬다.

이미 MCP 서버를 구축해본 경험이 있다면 [MCP 서버 처음부터 만들기 가이드](/ko/blog/ko/mcp-server-build-practical-guide-2026)가 좋은 사전 읽기다.

---

*이 포스트의 `.claude/` 구조와 shell 스크립트 예제는 실제 jangwook.net 블로그 자동화 시스템에서 직접 가져온 것입니다.*
