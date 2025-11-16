# MCP 서버 마이그레이션 가이드

## 개요

Claude Code의 `.mcp.json`을 Codex CLI의 `config.toml`로 변환하는 방법을 설명합니다.

## 기본 구조 비교

### Claude Code (`.mcp.json`)

```json
{
  "mcpServers": {
    "server-name": {
      "command": "executable",
      "args": ["arg1", "arg2"],
      "env": {
        "VAR_NAME": "${VAR_NAME}"
      }
    }
  }
}
```

### Codex CLI (`~/.codex/config.toml`)

```toml
[mcp_servers.server-name]
command = "executable"
args = ["arg1", "arg2"]

[mcp_servers.server-name.env]
VAR_NAME = "value_from_env"
```

## 주요 차이점

### 1. 파일 형식 및 위치

**Claude Code**:
- 형식: JSON
- 위치: 프로젝트 루트 (`.mcp.json`)
- 스코프: 프로젝트별

**Codex CLI**:
- 형식: TOML
- 위치: `~/.codex/config.toml` (전역)
- 스코프: 모든 프로젝트 공유 (기본값)

### 2. 환경 변수 참조 방식

**Claude Code**: `"${VAR_NAME}"` (템플릿 문법)
**Codex CLI**: 직접 값 또는 환경 변수 설정

### 3. 섹션 구조

**Claude Code**:
```json
{
  "mcpServers": {
    "server1": {...},
    "server2": {...}
  }
}
```

**Codex CLI**:
```toml
[mcp_servers.server1]
...

[mcp_servers.server2]
...
```

## 실전 변환 예제

### 예제 1: NPX 기반 서버 (Context7)

**Claude Code (`.mcp.json`)**:
```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp"]
    }
  }
}
```

**Codex CLI (`~/.codex/config.toml`)**:
```toml
[mcp_servers.context7]
command = "npx"
args = ["-y", "@upstash/context7-mcp"]
```

✅ **거의 동일** - 형식만 JSON → TOML로 변경

---

### 예제 2: 환경 변수 사용 (Notion)

**Claude Code (`.mcp.json`)**:
```json
{
  "mcpServers": {
    "notionApi": {
      "command": "npx",
      "args": ["-y", "@notionhq/notion-mcp-server"],
      "env": {
        "NOTION_TOKEN": "${NOTION_TOKEN}"
      }
    }
  }
}
```

**Codex CLI (`~/.codex/config.toml`)**:
```toml
[mcp_servers.notionApi]
command = "npx"
args = ["-y", "@notionhq/notion-mcp-server"]

[mcp_servers.notionApi.env]
NOTION_TOKEN = "your_actual_token_or_env_var_value"
```

⚠️ **주의**:
- `${NOTION_TOKEN}` 템플릿 문법 없음
- 실제 값을 넣거나, 시스템 환경 변수에서 읽어옴

**환경 변수 처리 방법**:

**방법 1: 직접 값 입력** (권장하지 않음):
```toml
[mcp_servers.notionApi.env]
NOTION_TOKEN = "secret_token_here"
```

**방법 2: 시스템 환경 변수 사용** (권장):
```bash
# ~/.bashrc 또는 ~/.zshrc
export NOTION_TOKEN="secret_token_here"
```

```toml
# config.toml에서는 키만 정의
[mcp_servers.notionApi.env]
# Codex CLI가 자동으로 시스템 환경 변수에서 읽음
```

**방법 3: CLI 플래그 사용**:
```bash
codex mcp add notionApi \
  --command npx \
  --args "-y" --args "@notionhq/notion-mcp-server" \
  --env NOTION_TOKEN=$NOTION_TOKEN
```

---

### 예제 3: Docker 기반 서버 (Brave Search)

**Claude Code (`.mcp.json`)**:
```json
{
  "mcpServers": {
    "brave-search": {
      "command": "docker",
      "args": [
        "run", "-i", "--rm",
        "-e", "BRAVE_API_KEY",
        "docker.io/mcp/brave-search"
      ],
      "env": {
        "BRAVE_API_KEY": "${BRAVE_API_KEY}"
      }
    }
  }
}
```

**Codex CLI (`~/.codex/config.toml`)**:
```toml
[mcp_servers.brave-search]
command = "docker"
args = [
  "run", "-i", "--rm",
  "-e", "BRAVE_API_KEY",
  "docker.io/mcp/brave-search"
]

[mcp_servers.brave-search.env]
BRAVE_API_KEY = "your_api_key_or_from_system_env"
```

---

### 예제 4: Pipx 기반 서버 (Google Analytics)

**Claude Code (`.mcp.json`)**:
```json
{
  "mcpServers": {
    "analytics-mcp": {
      "command": "pipx",
      "args": ["run", "analytics-mcp"],
      "env": {
        "GOOGLE_APPLICATION_CREDENTIALS": "${GOOGLE_APPLICATION_CREDENTIALS}",
        "GOOGLE_PROJECT_ID": "${GOOGLE_PROJECT_ID}"
      }
    }
  }
}
```

**Codex CLI (`~/.codex/config.toml`)**:
```toml
[mcp_servers.analytics-mcp]
command = "pipx"
args = ["run", "analytics-mcp"]

[mcp_servers.analytics-mcp.env]
GOOGLE_APPLICATION_CREDENTIALS = "/path/to/credentials.json"
GOOGLE_PROJECT_ID = "your-project-id"
```

---

### 예제 5: HTTP/SSE 서버 (Streamable)

Claude Code는 HTTP 서버를 명시적으로 지원하지 않지만, Codex CLI는 지원합니다.

**Codex CLI 전용** (`~/.codex/config.toml`):
```toml
[mcp_servers.github]
url = "https://api.githubcopilot.com/mcp/"
bearer_token = "your_github_token"
startup_timeout_sec = 30
tool_timeout_sec = 60
```

**OAuth 지원** (RMCP 클라이언트 필요):
```toml
# 먼저 기능 활성화
[features]
rmcp_client = true

[mcp_servers.oauth-server]
url = "https://example.com/mcp/"
# OAuth 로그인 필요: codex mcp login oauth-server
```

## 완전한 변환 스크립트

### 자동화 도구 (Python)

```python
#!/usr/bin/env python3
"""
Claude Code .mcp.json → Codex CLI config.toml 변환기
"""
import json
import re
from pathlib import Path

def json_to_toml_mcp(json_config):
    """MCP 서버 설정을 TOML 형식으로 변환"""
    toml_lines = []

    for server_name, config in json_config.get("mcpServers", {}).items():
        toml_lines.append(f"[mcp_servers.{server_name}]")

        # command
        if "command" in config:
            toml_lines.append(f'command = "{config["command"]}"')

        # args
        if "args" in config:
            args_str = ", ".join(f'"{arg}"' for arg in config["args"])
            toml_lines.append(f"args = [{args_str}]")

        # url (HTTP server)
        if "url" in config:
            toml_lines.append(f'url = "{config["url"]}"')

        # bearer_token
        if "bearer_token" in config:
            toml_lines.append(f'bearer_token = "{config["bearer_token"]}"')

        # env
        if "env" in config:
            toml_lines.append(f"\n[mcp_servers.{server_name}.env]")
            for key, value in config["env"].items():
                # ${VAR} 템플릿 제거 경고
                if "${" in value and "}" in value:
                    var_name = re.search(r'\$\{([^}]+)\}', value).group(1)
                    toml_lines.append(f'# WARNING: Template ${{{var_name}}} detected!')
                    toml_lines.append(f'# Set {key} in system environment or replace with actual value')
                    toml_lines.append(f'{key} = "# TODO: Replace with actual value or set in env"')
                else:
                    toml_lines.append(f'{key} = "{value}"')

        toml_lines.append("")  # 빈 줄

    return "\n".join(toml_lines)

def migrate_mcp_config(claude_config_path, output_path=None):
    """
    .mcp.json을 Codex CLI config.toml로 변환

    Args:
        claude_config_path: .mcp.json 경로
        output_path: 출력 파일 경로 (기본: ~/.codex/config.toml)
    """
    # .mcp.json 읽기
    with open(claude_config_path, 'r') as f:
        claude_config = json.load(f)

    # TOML 변환
    toml_content = json_to_toml_mcp(claude_config)

    # 출력 경로 결정
    if output_path is None:
        home = Path.home()
        output_path = home / '.codex' / 'config.toml'

    output_path = Path(output_path)

    # 기존 파일 백업
    if output_path.exists():
        backup_path = output_path.with_suffix('.toml.backup')
        output_path.rename(backup_path)
        print(f"⚠️  Existing config backed up to: {backup_path}")

    # .codex 디렉토리 생성
    output_path.parent.mkdir(parents=True, exist_ok=True)

    # config.toml 쓰기
    with open(output_path, 'w') as f:
        f.write(toml_content)

    print(f"✅ 변환 완료: {output_path}")
    print(f"   서버 수: {len(claude_config.get('mcpServers', {}))}")
    print("\n⚠️  중요:")
    print("   1. 환경 변수 템플릿 (${VAR}) 제거됨")
    print("   2. 시스템 환경 변수 설정 또는 실제 값으로 교체 필요")
    print("   3. ~/.codex/config.toml 파일을 열어 TODO 항목 확인")

if __name__ == '__main__':
    import sys

    if len(sys.argv) < 2:
        print("사용법: python migrate_mcp.py <.mcp.json 경로> [출력 경로]")
        sys.exit(1)

    claude_path = sys.argv[1]
    output = sys.argv[2] if len(sys.argv) > 2 else None

    migrate_mcp_config(claude_path, output)
```

### 사용 방법

```bash
# 기본 변환 (~/.codex/config.toml로 출력)
python migrate_mcp.py .mcp.json

# 커스텀 경로로 변환
python migrate_mcp.py .mcp.json ./my-config.toml
```

## CLI 명령어로 MCP 서버 관리

### 서버 목록 확인

```bash
# 텍스트 형식
codex mcp list

# JSON 형식
codex mcp list --json
```

### 서버 추가

```bash
# STDIO 서버
codex mcp add context7 \
  --command npx \
  --args "-y" --args "@upstash/context7-mcp"

# 환경 변수 포함
codex mcp add notionApi \
  --command npx \
  --args "-y" --args "@notionhq/notion-mcp-server" \
  --env NOTION_TOKEN=$NOTION_TOKEN

# HTTP 서버
codex mcp add github \
  --url "https://api.githubcopilot.com/mcp/" \
  --bearer-token $GITHUB_TOKEN
```

### 서버 상세 정보

```bash
# 텍스트 형식
codex mcp get context7

# JSON 형식
codex mcp get context7 --json
```

### 서버 제거

```bash
codex mcp remove context7
```

### OAuth 로그인 (HTTP 서버)

```bash
# RMCP 클라이언트 활성화
codex --enable rmcp_client

# OAuth 로그인
codex mcp login github

# 로그아웃
codex mcp logout github
```

## 변환 후 검증

### 1. Codex CLI로 MCP 서버 확인

```bash
# Codex CLI 시작
codex

# MCP 서버 목록 확인 (CLI 내부)
/mcp list

# 특정 서버 사용
@context7 get docs for "Astro"
```

### 2. 설정 파일 직접 확인

```bash
# 설정 파일 열기
cat ~/.codex/config.toml

# 또는 편집
nano ~/.codex/config.toml
```

### 3. 환경 변수 확인

```bash
# 필요한 환경 변수 설정 확인
echo $NOTION_TOKEN
echo $BRAVE_API_KEY
echo $GOOGLE_PROJECT_ID

# 설정되지 않았다면 추가
export NOTION_TOKEN="your_token_here"

# 영구 설정 (bash)
echo 'export NOTION_TOKEN="your_token_here"' >> ~/.bashrc
source ~/.bashrc

# 영구 설정 (zsh)
echo 'export NOTION_TOKEN="your_token_here"' >> ~/.zshrc
source ~/.zshrc
```

## 프로젝트별 vs 전역 설정

### 전략 1: 전역 설정 (기본, 권장)

```
~/.codex/config.toml       # 모든 프로젝트 공유
```

**장점**:
- 한 번 설정으로 모든 프로젝트에 적용
- 중복 없음
- 관리 용이

**단점**:
- 프로젝트별 커스터마이징 제한적

---

### 전략 2: 프로젝트별 오버라이드

```
~/.codex/config.toml       # 기본 설정

프로젝트/
└── .codex.toml            # 프로젝트 전용 설정 (오버라이드)
```

**프로젝트별 설정 예시** (`.codex.toml`):
```toml
# 이 프로젝트에만 적용되는 MCP 서버
[mcp_servers.project-specific-server]
command = "npx"
args = ["-y", "some-project-tool"]

# 전역 서버 오버라이드
[mcp_servers.notion]
# 이 프로젝트용 Notion 토큰
env.NOTION_TOKEN = "project_specific_token"
```

**장점**:
- 프로젝트별 커스터마이징
- 팀 공유 가능 (Git commit)

**단점**:
- 설정 분산
- 관리 복잡도 증가

---

### 전략 3: 하이브리드 (추천)

```
~/.codex/config.toml:
  ├─ 공통 MCP 서버 (context7, brave-search 등)
  └─ 개인 API 키

프로젝트/.codex.toml:
  └─ 프로젝트 전용 MCP 서버 (notion, analytics)
```

## 트러블슈팅

### 문제 1: 환경 변수 인식 안 됨

**증상**:
```
Error: NOTION_TOKEN is not set
```

**해결**:
```bash
# 환경 변수 확인
env | grep NOTION_TOKEN

# 없다면 설정
export NOTION_TOKEN="your_token"

# 또는 config.toml에 직접 입력
nano ~/.codex/config.toml
# [mcp_servers.notionApi.env]
# NOTION_TOKEN = "actual_token_value"
```

---

### 문제 2: MCP 서버 목록에 안 보임

**증상**:
```
$ codex mcp list
No MCP servers configured.
```

**해결**:
```bash
# 설정 파일 위치 확인
ls -la ~/.codex/config.toml

# TOML 문법 오류 확인 (Python toml 라이브러리)
python3 -c "import tomli; tomli.load(open('~/.codex/config.toml', 'rb'))"

# 재시작
codex
```

---

### 문제 3: TOML 문법 오류

**증상**:
```
Error: Failed to parse config.toml
```

**일반적인 오류**:
1. **문자열 따옴표 누락**:
   ```toml
   # ❌ 잘못됨
   command = npx

   # ✅ 올바름
   command = "npx"
   ```

2. **배열 문법 오류**:
   ```toml
   # ❌ 잘못됨
   args = ["-y" "@upstash/context7-mcp"]

   # ✅ 올바름
   args = ["-y", "@upstash/context7-mcp"]
   ```

3. **섹션 중복**:
   ```toml
   # ❌ 잘못됨
   [mcp_servers.context7]
   command = "npx"

   [mcp_servers.context7]  # 중복!
   args = ["-y"]

   # ✅ 올바름
   [mcp_servers.context7]
   command = "npx"
   args = ["-y"]
   ```

**검증 도구**:
```bash
# TOML 문법 체크 (Python)
pip install tomli
python3 -c "import tomli; print(tomli.load(open('~/.codex/config.toml', 'rb')))"

# 또는 온라인 검증
# https://www.toml-lint.com/
```

## 참고 자료

- [Codex MCP Documentation](https://developers.openai.com/codex/mcp/)
- [Codex CLI Reference](https://developers.openai.com/codex/cli/reference/)
- [TOML Specification](https://toml.io/en/)
- [Configuration Guide](https://developers.openai.com/codex/local-config#cli)

---

**다음 단계**: [프로젝트 지침 변환 →](./02-project-instructions.md)
