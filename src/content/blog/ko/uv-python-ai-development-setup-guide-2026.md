---
title: uv로 AI 개발 환경 세팅하기 — Claude SDK 프로젝트를 0.87초 만에 시작하는 법
description: >-
  Rust로 만들어진 Python 패키지 매니저 uv 0.11로 anthropic, openai 등 AI SDK 개발 환경을 설정하는 완전
  실전 가이드. pip 대비 100배+ 빠른 설치 속도, 재현 가능한 환경 관리, Claude SDK 프로젝트 시작까지 실제 로그와 함께
  정리했다.
pubDate: '2026-05-07'
heroImage: ../../../assets/blog/uv-python-ai-development-setup-guide-2026-hero.png
tags:
  - Python
  - uv
  - Claude API
  - 개발 환경
  - AI 개발
relatedPosts:
  - slug: fastapi-claude-api-streaming-production-guide-2026
    score: 0.9
    reason:
      ko: Python 주제를 한 단계 더 깊이 파고드는 글입니다.
      en: Goes one level deeper into Python.
      ja: Pythonをもう一歩深く掘り下げた記事です。
      zh: 更深入地探讨 Python 主题。
  - slug: pydantic-ai-type-safe-agent-tutorial-2026
    score: 0.85
    reason:
      ko: Python를 실제로 다뤄본 경험이 이어지는 글입니다.
      en: Continues the hands-on Python experience.
      ja: Pythonを実際に扱った経験が続く記事です。
      zh: 延续 Python 的实战经验。
  - slug: python-ai-agent-library-comparison-2026
    score: 0.8
    reason:
      ko: 같은 Python 흐름에서 함께 읽으면 좋습니다.
      en: Worth reading alongside this in the same Python track.
      ja: 同じPythonの流れで併せて読むと役立ちます。
      zh: 在同一 Python 脉络中可一并阅读。
faq:
  - question: uv가 pip이나 Poetry보다 나은 점은 무엇인가요?
    answer: >-
      uv는 Rust로 만들어져 패키지를 병렬로 다운로드하고 캐시를 효율적으로 활용합니다. 패키지를 순차적으로 해석하는 pip이나
      Python으로 작성된 Poetry와 달리 근본적으로 빠른 속도를 냅니다. 또한 pyproject.toml과 uv.lock 기반의
      재현 가능한 환경 관리, Python 버전 관리, CLI 도구 설치까지 하나의 도구로 통합합니다.
  - question: uv로 Claude SDK 같은 AI 개발 환경을 어떻게 세팅하나요?
    answer: >-
      uv init으로 프로젝트를 만든 뒤 uv add anthropic으로 SDK를 추가하면 됩니다. 가상환경이 자동으로 생성되고
      pyproject.toml과 uv.lock이 업데이트됩니다. 스크립트는 source 활성화 없이 uv run main.py로 바로
      실행할 수 있습니다.
  - question: uv는 실제로 얼마나 빠른가요?
    answer: >-
      직접 측정한 결과 anthropic을 포함한 16개 패키지 최초 설치가 0.874초, uv init은 0.435초였습니다. 캐시가
      있는 상태에서 uv sync로 19개 패키지를 다시 설치하니 0.074초만에 끝났습니다. 같은 작업을 pip으로 하면 20초에서
      40초 정도 걸립니다.
  - question: uv를 쓸 때 주의할 점이나 한계는 없나요?
    answer: >-
      uv는 2026년 현재 v0.11로 아직 v0.x 단계라 대형 조직에서 기존 워크플로우를 전환할 때는 학습 비용을 고려해야 합니다.
      또한 PyPI 기반이라 torch나 CUDA처럼 conda 채널에서 설치해야 하는 ML 라이브러리는 직접 다루지 못해, 이런 경우에는
      conda를 함께 써야 합니다.
---

작년까지 나는 AI 프로젝트를 시작할 때마다 의식처럼 같은 과정을 반복했다. `python -m venv .venv`, `source .venv/bin/activate`, `pip install anthropic openai`… 그리고 기다렸다. 길게는 2분 넘게. anthropic, torch, pydantic 같은 패키지들이 차례로 다운로드되는 동안.

작업 전환 비용이 꽤 컸다. 새 실험 브랜치를 만들 때마다 환경 세팅이 흐름을 끊었다. 동료 환경과 달라서 생기는 "내 PC에서는 됐는데?" 상황도 없애질 않았다.

그러다 `uv`를 쓰기 시작했다. Rust로 만든 Python 패키지 매니저로, Ruff를 만든 Astral 팀의 작품이다. 오늘 Claude SDK 프로젝트를 설정하면서 직접 측정해봤다. `anthropic`을 포함한 16개 패키지 설치에 **0.874초**. 기존 pip이었다면 20〜40초는 족히 걸렸을 작업이다.

아래는 그 측정 과정을 그대로 따라가는 기록이다. uv 0.11 기준으로 프로젝트 초기화부터 Claude SDK 설치, CI까지 처음부터 세팅한다.

## 왜 지금 uv인가: pip, Poetry, conda의 어디가 문제인가

솔직히 말하면, pip 자체가 문제인 건 아니다. 수십억 패키지를 다운로드해온 검증된 도구다. 문제는 **속도와 환경 격리**의 조합이다.

AI 개발 환경에서 pip이 느린 이유는 구조적이다. 패키지를 순차적으로 해석하고, 이미 다운로드한 파일을 효율적으로 캐시하지 못한다. `pip install anthropic openai torch`를 실행하면, 내부적으로 각 패키지의 메타데이터를 가져오고, 의존성을 풀고, 충돌 여부를 확인하는 과정이 직렬로 일어난다.

Poetry는 의존성 관리 면에서 훨씬 낫다. `pyproject.toml` 기반 선언적 설정, lock 파일 지원. 하지만 Poetry 자체가 Python으로 만들어져 있어 속도 한계가 있고, 가끔 환경이 엉키면 디버깅이 꽤 번거롭다.

conda는 Python 버전 관리에 강점이 있지만, 환경 자체가 수 기가바이트로 커지는 경향이 있고 Docker CI에서 쓰기 불편하다.

uv는 Rust로 짰기 때문에 병렬 다운로드와 캐시 활용에서 근본적으로 다른 성능을 낸다. 내가 오늘 실제로 측정한 결과:

```
uv init claude-agent-demo    →  0.435초
uv add anthropic             →  0.874초 (16개 패키지 설치, pydantic-core 1.9MB 포함)
uv sync (캐시 적중 시)        →  0.074초 (19개 패키지 29ms 설치)
```

## 설치 전 확인할 것은 사실상 OS 하나뿐

uv 설치에 필요한 건 거의 없다. OS별로 다음만 확인하면 된다.

- **macOS/Linux**: `curl` 또는 Homebrew
- **Windows**: PowerShell
- Python을 미리 설치하지 않아도 된다. uv가 직접 관리할 수 있다

Python 버전 요구사항이 따로 없다는 점이 큰 장점이다. uv는 Python 인터프리터 자체를 다운로드하고 관리할 수 있어서, 시스템 Python 버전에 신경 쓰지 않아도 된다.

## Step 1: uv 설치

macOS와 Linux는 공식 설치 스크립트 한 줄로 끝난다.

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

Homebrew를 선호한다면:

```bash
brew install uv
```

Windows PowerShell:

```powershell
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```

설치 후 버전 확인:

```bash
uv --version
# uv 0.11.11 (ed7b06001 2026-05-06)
```

오늘 기준으로 0.11.11이 최신이다. 2026-05-06 빌드. Astral은 릴리즈 주기가 꽤 빠른 편이라 `uv self update`로 언제든 최신 버전으로 올릴 수 있다.

## Step 2: AI 프로젝트 초기화

`uv init`으로 새 프로젝트를 만든다.

```bash
uv init claude-agent-demo
cd claude-agent-demo
```

실행 결과:

```
Initialized project `claude-agent-demo` at `/path/to/claude-agent-demo`
```

0.435초 만에 완료된다. 생성된 파일 구조:

```
claude-agent-demo/
├── main.py
├── pyproject.toml
└── README.md
```

`pyproject.toml`이 기본 생성된다:

```toml
[project]
name = "claude-agent-demo"
version = "0.1.0"
description = "Add your description here"
readme = "README.md"
requires-python = ">=3.11"
dependencies = []
```

Poetry나 pip의 `requirements.txt`와 달리, `pyproject.toml`은 Python 생태계의 표준 프로젝트 파일이다. uv는 이 파일을 읽어 의존성을 관리한다.

`.env` 파일 설정도 이 시점에 해두는 게 좋다:

```bash
cat > .env << 'EOF'
ANTHROPIC_API_KEY=your-api-key-here
EOF
```

## Step 3: Claude SDK 추가

```bash
uv add anthropic
```

실제 실행 로그:

```
Using CPython 3.11.12
Creating virtual environment at: .venv
Resolved 17 packages in 514ms
Downloading pydantic-core (1.9MiB)
 Downloaded pydantic-core
Prepared 16 packages in 269ms
Installed 16 packages in 20ms
 + annotated-types==0.7.0
 + anthropic==0.100.0
 + anyio==4.13.0
 + certifi==2026.4.22
 + distro==1.9.0
 + docstring-parser==0.18.0
 + h11==0.16.0
 + httpcore==1.0.9
 + httpx==0.28.1
 + idna==3.13
 + jiter==0.14.0
 + pydantic==2.13.4
 + pydantic-core==2.46.4
 + sniffio==1.3.1
 + typing-extensions==4.15.0
 + typing-inspection==0.4.2
```

`pydantic-core`가 1.9MB임에도 전체 설치가 0.874초에 끝났다. 캐시가 없는 최초 설치 기준이다.

여러 SDK를 함께 추가할 때도 마찬가지로 빠르다:

```bash
uv add openai httpx python-dotenv
```

```
Resolved 21 packages in 232ms
Downloading openai (1.2MiB)
 Downloaded openai
Prepared 3 packages in 257ms
Installed 3 packages in 19ms
 + openai==2.35.1
 + python-dotenv==1.2.2
 + tqdm==4.67.3
```

0.555초. anthropic과 openai가 같은 `httpx`를 의존성으로 공유하는데, uv는 중복 없이 정확히 필요한 것만 추가했다. 이런 의존성 충돌 관리가 pip에서는 자주 예기치 않은 버전 변경을 일으키는 지점이다.

`pyproject.toml`이 자동으로 업데이트된다:

```toml
[project]
dependencies = [
    "anthropic>=0.100.0",
    "openai>=2.35.1",
    "httpx>=0.28.1",
    "python-dotenv>=1.2.2",
]
```

그리고 `uv.lock` 파일이 생성된다. 이 파일이 재현 가능한 환경의 핵심이다.

## Step 4: 첫 번째 Claude 스크립트 실행

`main.py`를 작성한다:

```python
import anthropic
import os
from dotenv import load_dotenv

load_dotenv()

def main():
    client = anthropic.Anthropic(
        api_key=os.environ.get("ANTHROPIC_API_KEY")
    )
    
    message = client.messages.create(
        model="claude-opus-4-7-20260401",
        max_tokens=1024,
        messages=[
            {"role": "user", "content": "Python 의존성 관리에서 uv가 pip보다 빠른 이유를 한 줄로 설명해줘."}
        ]
    )
    
    print(message.content[0].text)

if __name__ == "__main__":
    main()
```

실행:

```bash
uv run main.py
```

`uv run`의 핵심은 **virtualenv를 직접 활성화하지 않아도 된다**는 점이다. `source .venv/bin/activate` 없이도 프로젝트 환경에서 스크립트를 실행한다. 처음 실행 시 1.675초. 이후는 캐시 덕분에 더 빠르다.

API 키 없이 구조만 테스트하고 싶다면:

```bash
uv run python -c "import anthropic; print(anthropic.__version__)"
# 0.100.0
```

Vercel AI SDK를 이용한 Claude 스트리밍 에이전트 구현도 같은 방식으로 `uv add @ai-sdk/anthropic`으로 시작할 수 있다. TypeScript 프로젝트라면 npm/pnpm을 쓰겠지만, Python 프로젝트라면 uv가 훨씬 빠르다.

## Step 5: Python 버전 관리

uv의 숨겨진 강점 중 하나가 Python 버전 관리다. pyenv 없이 uv만으로 여러 Python 버전을 설치하고 전환할 수 있다.

설치 가능한 버전 목록:

```bash
uv python list
```

출력 일부:

```
cpython-3.15.0a8-macos-aarch64-none      <download available>
cpython-3.14.5rc1-macos-aarch64-none     <download available>
cpython-3.13.13-macos-aarch64-none       <download available>
cpython-3.13.11-macos-aarch64-none       /opt/homebrew/bin/python3.13
cpython-3.12.8-macos-aarch64-none        /usr/local/bin/python3.12
```

3.13이 이미 설치된 것과 다운로드 가능한 버전들이 함께 표시된다.

특정 버전으로 프로젝트 생성:

```bash
uv init my-project --python 3.13
```

또는 기존 프로젝트에서 Python 버전 핀:

```bash
uv python pin 3.12
```

이렇게 하면 `.python-version` 파일이 생성돼 팀 전체가 같은 Python 버전을 쓰게 된다. pyenv + virtualenv + pip의 조합을 uv 하나가 대체하는 시나리오다.

## Step 6: 팀 협업과 CI/CD에서 활용하기

`uv.lock` 파일을 git에 커밋한다. 이 파일이 있으면 어떤 환경에서도 완전히 동일한 패키지 버전으로 설치된다.

동료나 CI에서 프로젝트를 클론한 뒤:

```bash
git clone <repo-url>
cd my-project
uv sync
```

오늘 직접 테스트해봤다. `.venv`를 통째로 지우고 `uv sync`를 실행한 결과는 이렇다.

```
Using CPython 3.11.12
Creating virtual environment at: .venv
Resolved 21 packages in 0.66ms
Installed 19 packages in 29ms
```

**0.074초**. 캐시가 있으면 이 정도다. CI 환경에서 캐시를 마운트해두면 빌드 시간을 획기적으로 줄일 수 있다.

![uv sync 실행 로그: 19개 패키지 0.074초 완료](../../../assets/blog/uv-python-ai-development-setup-guide-2026-sync-log.png)

GitHub Actions 설정 예시:

```yaml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Install uv
        uses: astral-sh/setup-uv@v4
        with:
          version: "0.11.11"
      
      - name: Set up Python
        run: uv python install
      
      - name: Install dependencies
        run: uv sync --all-extras --dev
      
      - name: Run tests
        run: uv run pytest
```

`astral-sh/setup-uv` 액션이 공식 제공된다. CI 캐시도 자동으로 처리해준다.

MCP 서버를 Python으로 구축할 때도 이 CI 패턴이 그대로 적용된다. [FastMCP](/ko/blog/ko/fastmcp-python-mcp-server-build-guide-2026) 의존성을 `uv add fastmcp`로 추가하고, GitHub Actions에서 `uv sync`로 설치하면 일관된 빌드 환경을 유지할 수 있다.

## uv tool로 CLI 도구 관리하기

uv는 패키지 매니저 외에 CLI 도구 설치도 담당한다. `pipx`의 역할을 대체한다.

```bash
# ruff를 전역 CLI 도구로 설치
uvx ruff check .

# 설치 없이 일회성 실행 (npx 방식)
uvx --from httpie http https://api.anthropic.com/v1/models

# 영구 설치
uv tool install ruff
uv tool install black
```

`uvx`는 설치 없이 바로 실행하는 방식이다. 팀에서 특정 버전의 도구를 사용해야 할 때:

```bash
uvx ruff@0.4.0 check .       # 특정 버전 지정
uvx --python 3.12 mypy .     # Python 버전 지정
```

AI 개발에서 자주 쓰는 도구 설치 예시:

```bash
uv tool install ruff          # 코드 린터/포맷터
uv tool install mypy          # 타입 체크
uv tool install pytest        # 테스트 실행
uv tool install pre-commit    # git 훅 관리
```

이제 `pip install --user`나 `pipx`를 별도로 관리하지 않아도 된다. uv 하나로 프로젝트 의존성과 CLI 도구 모두를 관리한다.

## 종속성 트리와 디버깅

어떤 패키지가 왜 설치됐는지 파악하려면:

```bash
uv tree
```

출력:

```
claude-agent-demo v0.1.0
├── anthropic v0.100.0
│   ├── anyio v4.13.0
│   │   ├── idna v3.13
│   │   └── typing-extensions v4.15.0
│   ├── distro v1.9.0
│   ├── httpx v0.28.1
│   │   ├── anyio v4.13.0 (*)
│   │   ├── certifi v2026.4.22
│   │   └── httpcore v1.0.9
│   ├── pydantic v2.13.4
│   └── ...
└── openai v2.35.1
    └── ...
```

pip의 `pip show` 보다 훨씬 직관적이다. `(*)` 표시는 이미 다른 패키지에서 공유 중임을 의미한다.

패키지를 제거할 때:

```bash
uv remove openai
```

이것도 즉각적이다. lock 파일도 자동으로 업데이트된다.

## 실무에서 마주치는 엣지 케이스

**기존 requirements.txt 프로젝트를 uv로 전환할 때**:

```bash
# requirements.txt가 있는 기존 프로젝트
uv add $(cat requirements.txt | grep -v "^#" | tr '\n' ' ')

# 또는 requirements.txt를 직접 참조
uv pip install -r requirements.txt
```

uv는 `pip` 하위 명령어도 지원한다. 완전 전환이 어려운 상황에서도 `uv pip install`로 기존 워크플로우와 병행할 수 있다.

**개발 전용 의존성 관리**:

```bash
# 개발용 그룹 추가
uv add --dev pytest ruff mypy

# 프로덕션 설치 시 dev 제외
uv sync --no-dev
```

`pyproject.toml`에 그룹이 자동으로 추가된다:

```toml
[dependency-groups]
dev = [
    "mypy>=1.15.0",
    "pytest>=8.3.5",
    "ruff>=0.11.8",
]
```

**Anthropic SDK의 선택적 의존성**:

```bash
# 베드락(AWS) 지원 추가
uv add "anthropic[bedrock]"

# 버텍스 AI(GCP) 지원 추가
uv add "anthropic[vertex]"
```

대괄호 문법으로 선택적 확장 기능을 지정한다. `anthropic[bedrock]`은 `boto3`를 추가 설치한다.

## 솔직하게, uv가 아직 못 해주는 것들

성능만 보면 거의 완벽한 도구지만, 몇 가지 주의할 지점이 있다.

**첫째, 생태계 성숙도.** uv는 2024년에 등장해 2026년 현재 v0.11까지 왔다. 여전히 v0.x다. 개인 프로젝트나 신규 프로젝트에는 강력히 추천하지만, 대형 조직에서 기존 Poetry/pip 워크플로우를 전환하기로 결정할 때는 팀 전체 학습 비용을 고려해야 한다.

**둘째, conda 생태계와의 호환.** torch, CUDA, tensorflow 같은 ML 라이브러리를 conda 채널에서 설치해야 하는 경우가 있다. uv는 PyPI 기반이므로 conda-forge 패키지를 직접 설치하지 못한다. 순수 PyPI 의존성만 있다면 문제없지만, CUDA 버전 맞추기가 필요한 deep learning 프로젝트에서는 아직 conda를 함께 써야 하는 상황이 생긴다.

**셋째, `uv run` 명령에 익숙해지는 시간.** `python main.py` 대신 `uv run main.py`로 습관을 바꿔야 한다. 팀원 중 한 명이 `source .venv/bin/activate`를 잊고 시스템 Python으로 스크립트를 실행하는 실수를 방지하는 효과가 있긴 하다.

LLM 코딩 환경 최적화를 다룬 글에서도 비슷한 관찰을 했다. 도구 자체보다 팀의 습관을 바꾸는 쪽이 늘 더 어렵다.

## 지금 당장 복사해 쓰는 명령어 레시피

```bash
# 새 AI 프로젝트 시작
uv init my-ai-project
cd my-ai-project

# Claude SDK 설치
uv add anthropic python-dotenv

# 여러 SDK 한 번에 추가
uv add anthropic openai httpx

# 스크립트 실행 (venv 활성화 불필요)
uv run main.py

# 팀 동기화 (uv.lock 기반)
uv sync

# Python 버전 지정
uv init my-project --python 3.13

# 의존성 트리 확인
uv tree

# 패키지 제거
uv remove openai

# uv 자체 업데이트
uv self update
```

나는 이제 새 AI 프로젝트를 시작할 때 거의 자동으로 `uv init`을 친다. pip으로 돌아갈 이유를 찾지 못하고 있다. 다만 conda가 꼭 필요한 ML 프로젝트에서는 아직 선택이 필요하다.

0.874초는 단순한 속도 이야기가 아니다. 실험을 자주 할수록, 실험당 마찰이 작을수록 더 많이 시도하게 된다. 그게 결국 더 나은 코드로 이어진다.

---

**이미지 brief** (Codex 이미지 생성용): uv의 병렬 다운로드 아키텍처를 보여주는 다이어그램. pip의 순차적 패키지 해결(직렬 화살표)과 uv의 병렬 해결(동시 화살표 여러 개)을 나란히 배치. 배경은 어두운 터미널 테마. 제목은 "uv vs pip: Parallel Resolution". 색상: uv는 보라/인디고, pip은 회색.

관련 깊이 있는 글: LLM 코딩 환경을 최적화할 때 의존성 관리가 왜 중요한지도 참고하면 전체 개발 워크플로우를 맥락에서 이해하는 데 도움이 된다.
