# MCP 서버 마이그레이션 가이드

## 개요

Claude Code의 `.mcp.json`을 Gemini CLI의 `settings.json`으로 변환하는 방법을 설명합니다.

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

### Gemini CLI (`~/.gemini/settings.json` 또는 `.gemini/settings.json`)

```json
{
  "mcpServers": {
    "server-name": {
      "command": "executable",
      "args": ["arg1", "arg2"],
      "env": {
        "VAR_NAME": "$VAR_NAME"
      }
    }
  }
}
```

## 주요 차이점

### 1. 환경 변수 참조 방식

**Claude Code**: `"${VAR_NAME}"`
**Gemini CLI**: `"$VAR_NAME"` (중괄호 없이)

### 2. 설정 파일 위치

**Claude Code**:
- 프로젝트 루트: `.mcp.json` (프로젝트별 설정)

**Gemini CLI**:
- 사용자 레벨: `~/.gemini/settings.json` (모든 프로젝트 공유)
- 프로젝트 레벨: `.gemini/settings.json` (프로젝트별, 우선순위 높음)
- 시스템 레벨: `/etc/gemini-cli/settings.json` (모든 사용자)

### 3. 추가 옵션

Gemini CLI는 더 많은 MCP 서버 옵션 지원:

```json
{
  "mcpServers": {
    "server-name": {
      "command": "executable",
      "args": ["arg1"],
      "env": {"KEY": "$VALUE"},

      // Gemini CLI 전용 옵션
      "cwd": "/path/to/working/directory",
      "timeout": 300000,              // 밀리초 (기본: 10분)
      "trust": true,                  // 도구 승인 자동화
      "includeTools": ["tool1"],      // 화이트리스트
      "excludeTools": ["tool2"]       // 블랙리스트
    }
  }
}
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

**Gemini CLI (`.gemini/settings.json`)**:
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

✅ **동일** - 변경 불필요

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

**Gemini CLI (`.gemini/settings.json`)**:
```json
{
  "mcpServers": {
    "notionApi": {
      "command": "npx",
      "args": ["-y", "@notionhq/notion-mcp-server"],
      "env": {
        "NOTION_TOKEN": "$NOTION_TOKEN"
      }
    }
  }
}
```

⚠️ **차이점**: `${NOTION_TOKEN}` → `$NOTION_TOKEN` (중괄호 제거)

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

**Gemini CLI (`.gemini/settings.json`)**:
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
        "BRAVE_API_KEY": "$BRAVE_API_KEY"
      }
    }
  }
}
```

⚠️ **차이점**: 환경 변수 참조 방식만 변경

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

**Gemini CLI (`.gemini/settings.json`)**:
```json
{
  "mcpServers": {
    "analytics-mcp": {
      "command": "pipx",
      "args": ["run", "analytics-mcp"],
      "env": {
        "GOOGLE_APPLICATION_CREDENTIALS": "$GOOGLE_APPLICATION_CREDENTIALS",
        "GOOGLE_PROJECT_ID": "$GOOGLE_PROJECT_ID"
      }
    }
  }
}
```

⚠️ **차이점**: 모든 환경 변수 참조 수정

---

### 예제 5: HTTP/SSE 트랜스포트 (원격 서버)

Claude Code는 명시적으로 HTTP/SSE 트랜스포트를 지원하지 않지만, Gemini CLI는 지원합니다.

**Gemini CLI 전용**:
```json
{
  "mcpServers": {
    "github": {
      "httpUrl": "https://api.githubcopilot.com/mcp/",
      "headers": {
        "Authorization": "Bearer $GITHUB_PAT"
      },
      "timeout": 5000
    }
  }
}
```

## 완전한 변환 스크립트

### 자동화 도구 (Python)

```python
#!/usr/bin/env python3
"""
Claude Code .mcp.json → Gemini CLI settings.json 변환기
"""
import json
import re
from pathlib import Path

def convert_env_vars(obj):
    """환경 변수 참조 형식 변환: ${VAR} → $VAR"""
    if isinstance(obj, dict):
        return {k: convert_env_vars(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [convert_env_vars(item) for item in obj]
    elif isinstance(obj, str):
        # ${VAR_NAME} → $VAR_NAME
        return re.sub(r'\$\{([A-Za-z_][A-Za-z0-9_]*)\}', r'$\1', obj)
    return obj

def migrate_mcp_config(claude_config_path, output_path=None):
    """
    .mcp.json을 Gemini CLI settings.json으로 변환

    Args:
        claude_config_path: .mcp.json 경로
        output_path: 출력 파일 경로 (기본: .gemini/settings.json)
    """
    # .mcp.json 읽기
    with open(claude_config_path, 'r') as f:
        claude_config = json.load(f)

    # 환경 변수 참조 변환
    gemini_config = convert_env_vars(claude_config)

    # 출력 경로 결정
    if output_path is None:
        project_root = Path(claude_config_path).parent
        output_path = project_root / '.gemini' / 'settings.json'

    # .gemini 디렉토리 생성
    output_path.parent.mkdir(parents=True, exist_ok=True)

    # settings.json 쓰기
    with open(output_path, 'w') as f:
        json.dump(gemini_config, f, indent=2)

    print(f"✅ 변환 완료: {output_path}")
    print(f"   서버 수: {len(gemini_config.get('mcpServers', {}))}")

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
# 기본 변환 (.gemini/settings.json으로 출력)
python migrate_mcp.py .mcp.json

# 사용자 레벨 설정으로 변환
python migrate_mcp.py .mcp.json ~/.gemini/settings.json
```

## 변환 후 검증

### 1. Gemini CLI로 MCP 서버 확인

```bash
# Gemini CLI 시작
gemini-cli

# MCP 서버 목록 확인
/mcp
```

### 2. 특정 서버 테스트

```bash
# Notion 서버 사용 예제
> @notionApi search for "test page"

# Context7 서버 사용 예제
> @context7 get docs for "Astro"
```

### 3. 환경 변수 확인

```bash
# 환경 변수 설정 확인
echo $NOTION_TOKEN
echo $BRAVE_API_KEY

# 또는 .env 파일 사용
# ~/.gemini/.env 또는 .gemini/.env
NOTION_TOKEN=secret_token
BRAVE_API_KEY=api_key
```

## 프로젝트별 vs 사용자별 설정

### 전략 1: 프로젝트별 설정 (권장)

```bash
프로젝트/
└── .gemini/
    ├── settings.json    # 프로젝트 전용 MCP 서버
    └── .env             # 프로젝트 환경 변수
```

**장점**:
- 프로젝트 독립성
- 버전 관리 가능 (`.env`는 `.gitignore`)
- 팀 공유 용이

**단점**:
- 프로젝트마다 중복 설정 필요

---

### 전략 2: 사용자 레벨 설정

```bash
~/.gemini/
├── settings.json        # 모든 프로젝트 공유
└── .env                 # 전역 환경 변수
```

**장점**:
- 한 번 설정으로 모든 프로젝트에 적용
- 중복 없음

**단점**:
- 프로젝트별 커스터마이징 어려움
- 팀 공유 불가

---

### 전략 3: 하이브리드 (추천)

```bash
~/.gemini/
├── settings.json        # 공통 MCP 서버 (context7, brave-search 등)
└── .env                 # 개인 API 키

프로젝트/
└── .gemini/
    ├── settings.json    # 프로젝트 전용 MCP 서버 (notion, analytics)
    └── .env             # 프로젝트 API 키
```

**동작 방식**:
- 프로젝트 설정이 사용자 설정보다 우선
- 같은 이름의 서버는 프로젝트 설정이 덮어씀

## 트러블슈팅

### 문제 1: 환경 변수 인식 안 됨

**증상**:
```
Error: NOTION_TOKEN is not set
```

**해결**:
```bash
# .env 파일 확인
cat ~/.gemini/.env
cat .gemini/.env

# 또는 직접 export
export NOTION_TOKEN=your_token

# Gemini CLI 재시작
```

---

### 문제 2: MCP 서버 목록에 안 보임

**증상**:
```
/mcp
No MCP servers configured.
```

**해결**:
```bash
# settings.json 위치 확인
ls -la ~/.gemini/settings.json
ls -la .gemini/settings.json

# JSON 문법 오류 확인
cat .gemini/settings.json | jq .

# MCP 서버 새로고침
/mcp refresh
```

---

### 문제 3: Docker 기반 서버 실행 안 됨

**증상**:
```
Error: Cannot connect to Docker daemon
```

**해결**:
```bash
# Docker 실행 확인
docker ps

# Docker Desktop 시작 (macOS)
open -a Docker

# 권한 확인
docker run hello-world
```

## 참고 자료

- [Gemini CLI Settings Reference](https://www.philschmid.de/gemini-cli-cheatsheet)
- [MCP Server Integration Guide](https://developers.google.com/gemini-code-assist/docs/gemini-cli)
- [Hands-on Codelab](https://codelabs.developers.google.com/gemini-cli-hands-on)

---

**다음 단계**: [프로젝트 지침 변환 →](./02-project-instructions.md)
