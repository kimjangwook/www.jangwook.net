# MCP 서버 마이그레이션 가이드

## 목차

1. [개요](#개요)
2. [설정 파일 구조](#설정-파일-구조)
3. [변환 가이드](#변환-가이드)
4. [실전 변환 예제](#실전-변환-예제)
5. [자동화 스크립트](#자동화-스크립트)
6. [트러블슈팅](#트러블슈팅)

## 개요

### MCP (Model Context Protocol)란?

AI 어시스턴트가 외부 도구 및 데이터 소스와 상호작용하기 위한 표준 프로토콜입니다.

### 마이그레이션 목표

Claude Code의 `.mcp.json` 설정을 GitHub Copilot CLI의 `mcp-config.json`으로 변환합니다.

**핵심 차이점**:
| 항목 | Claude Code | Copilot CLI |
|------|-------------|-------------|
| **파일 위치** | 프로젝트 루트 `.mcp.json` | `~/.copilot/mcp-config.json` |
| **범위** | 프로젝트 단위 | 사용자 전역 (모든 프로젝트) |
| **구조** | JSON | JSON (거의 동일) |
| **환경 변수** | `${VAR_NAME}` | 직접 환경 변수 또는 값 |

## 설정 파일 구조

### Claude Code (`.mcp.json`)

**위치**: `/project-root/.mcp.json`

**기본 구조**:
```json
{
  "mcpServers": {
    "server-name": {
      "command": "command",
      "args": ["arg1", "arg2"],
      "env": {
        "ENV_VAR": "${ENV_VAR}"
      }
    }
  }
}
```

**특징**:
- 프로젝트별 설정
- 환경 변수 템플릿 구문 (`${VAR}`)
- Git에 커밋 가능 (비밀 정보 제외)

### GitHub Copilot CLI (`mcp-config.json`)

**위치**: `~/.copilot/mcp-config.json`

**기본 구조**:
```json
{
  "mcpServers": {
    "server-name": {
      "command": "command",
      "args": ["arg1", "arg2"],
      "env": {
        "ENV_VAR": "actual-value"
      }
    }
  }
}
```

**특징**:
- 사용자 전역 설정 (모든 프로젝트에 적용)
- 환경 변수 직접 참조 또는 값 직접 입력
- 개인 설정 파일 (Git 제외)

**대안적 위치** (`~/.config/`):
- `XDG_CONFIG_HOME` 환경 변수 설정 시
- Linux 표준 규약 준수 시

## 변환 가이드

### 기본 변환 규칙

#### 1. 파일 위치 변경

**Before** (Claude Code):
```bash
/project/.mcp.json
```

**After** (Copilot CLI):
```bash
~/.copilot/mcp-config.json
```

#### 2. 구조는 거의 동일

대부분의 경우 복사-붙여넣기 가능:
```json
{
  "mcpServers": {
    "server-name": {
      "command": "npx",
      "args": ["-y", "package-name"]
    }
  }
}
```

→ **변경 없이 그대로 사용 가능**

#### 3. 환경 변수 처리

**Claude Code** (템플릿 구문):
```json
{
  "env": {
    "API_KEY": "${API_KEY}"
  }
}
```

**Copilot CLI** (옵션 1 - 실제 값):
```json
{
  "env": {
    "API_KEY": "sk-your-actual-key"
  }
}
```

**Copilot CLI** (옵션 2 - 셸 환경 변수):
환경 변수를 `~/.zshrc` 또는 `~/.bashrc`에 설정하고 런타임에 자동 주입:
```bash
# ~/.zshrc
export API_KEY="sk-your-actual-key"
```

```json
{
  "env": {
    "API_KEY": "$API_KEY"
  }
}
```

**권장**: 옵션 2 (보안 및 유지보수성)

#### 4. Docker 기반 서버

**Claude Code**:
```json
{
  "brave-search": {
    "command": "docker",
    "args": ["run", "-i", "--rm", "-e", "BRAVE_API_KEY", "docker.io/mcp/brave-search"],
    "env": {
      "BRAVE_API_KEY": "${BRAVE_API_KEY}"
    }
  }
}
```

**Copilot CLI** (동일):
```json
{
  "brave-search": {
    "command": "docker",
    "args": ["run", "-i", "--rm", "-e", "BRAVE_API_KEY", "docker.io/mcp/brave-search"],
    "env": {
      "BRAVE_API_KEY": "$BRAVE_API_KEY"
    }
  }
}
```

→ **환경 변수 구문만 변경** (`${VAR}` → `$VAR` 또는 실제 값)

## 실전 변환 예제

### 현재 프로젝트 `.mcp.json` (8개 서버)

```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp"]
    },
    "sequentialthinking": {
      "command": "docker",
      "args": ["run", "--rm", "-i", "mcp/sequentialthinking"],
      "type": "stdio"
    },
    "automatalabs-playwright-server": {
      "command": "npx",
      "args": ["-y", "@automatalabs/mcp-server-playwright"]
    },
    "notionApi": {
      "command": "npx",
      "args": ["-y", "@notionhq/notion-mcp-server"],
      "env": {
        "NOTION_TOKEN": "${NOTION_TOKEN}"
      }
    },
    "chrome-devtools": {
      "command": "npx",
      "args": ["chrome-devtools-mcp@latest"]
    },
    "analytics-mcp": {
      "command": "pipx",
      "args": ["run", "analytics-mcp"],
      "env": {
        "GOOGLE_APPLICATION_CREDENTIALS": "${GOOGLE_APPLICATION_CREDENTIALS}",
        "GOOGLE_PROJECT_ID": "${GOOGLE_PROJECT_ID}"
      }
    },
    "brave-search": {
      "command": "docker",
      "args": ["run", "-i", "--rm", "-e", "BRAVE_API_KEY", "docker.io/mcp/brave-search"],
      "env": {
        "BRAVE_API_KEY": "${BRAVE_API_KEY}"
      }
    },
    "browsermcp": {
      "command": "npx",
      "args": ["@browsermcp/mcp@latest"]
    }
  }
}
```

### 변환된 `~/.copilot/mcp-config.json`

```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp"]
    },
    "sequentialthinking": {
      "command": "docker",
      "args": ["run", "--rm", "-i", "mcp/sequentialthinking"],
      "type": "stdio"
    },
    "automatalabs-playwright-server": {
      "command": "npx",
      "args": ["-y", "@automatalabs/mcp-server-playwright"]
    },
    "notionApi": {
      "command": "npx",
      "args": ["-y", "@notionhq/notion-mcp-server"],
      "env": {
        "NOTION_TOKEN": "$NOTION_TOKEN"
      }
    },
    "chrome-devtools": {
      "command": "npx",
      "args": ["chrome-devtools-mcp@latest"]
    },
    "analytics-mcp": {
      "command": "pipx",
      "args": ["run", "analytics-mcp"],
      "env": {
        "GOOGLE_APPLICATION_CREDENTIALS": "$GOOGLE_APPLICATION_CREDENTIALS",
        "GOOGLE_PROJECT_ID": "$GOOGLE_PROJECT_ID"
      }
    },
    "brave-search": {
      "command": "docker",
      "args": ["run", "-i", "--rm", "-e", "BRAVE_API_KEY", "docker.io/mcp/brave-search"],
      "env": {
        "BRAVE_API_KEY": "$BRAVE_API_KEY"
      }
    },
    "browsermcp": {
      "command": "npx",
      "args": ["@browsermcp/mcp@latest"]
    }
  }
}
```

**변경 사항**:
- 환경 변수 구문: `${VAR}` → `$VAR`
- 파일 위치: 프로젝트 루트 → `~/.copilot/`

### 환경 변수 설정 (`~/.zshrc` 또는 `~/.bashrc`)

```bash
# Notion
export NOTION_TOKEN="secret_your_notion_token_here"

# Google Analytics
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/credentials.json"
export GOOGLE_PROJECT_ID="your-project-id"

# Brave Search
export BRAVE_API_KEY="BSA_your_api_key_here"
```

**적용**:
```bash
source ~/.zshrc
```

## 개별 서버 변환 예제

### 예제 1: Context7 (환경 변수 없음)

**Claude Code**:
```json
{
  "context7": {
    "command": "npx",
    "args": ["-y", "@upstash/context7-mcp"]
  }
}
```

**Copilot CLI**:
```json
{
  "context7": {
    "command": "npx",
    "args": ["-y", "@upstash/context7-mcp"]
  }
}
```

→ **변경 없음**

### 예제 2: Notion (환경 변수 있음)

**Claude Code**:
```json
{
  "notionApi": {
    "command": "npx",
    "args": ["-y", "@notionhq/notion-mcp-server"],
    "env": {
      "NOTION_TOKEN": "${NOTION_TOKEN}"
    }
  }
}
```

**Copilot CLI** (방법 1 - 환경 변수):
```json
{
  "notionApi": {
    "command": "npx",
    "args": ["-y", "@notionhq/notion-mcp-server"],
    "env": {
      "NOTION_TOKEN": "$NOTION_TOKEN"
    }
  }
}
```

`~/.zshrc`에 추가:
```bash
export NOTION_TOKEN="secret_..."
```

**Copilot CLI** (방법 2 - 직접 값):
```json
{
  "notionApi": {
    "command": "npx",
    "args": ["-y", "@notionhq/notion-mcp-server"],
    "env": {
      "NOTION_TOKEN": "secret_actual_token_here"
    }
  }
}
```

**권장**: 방법 1 (환경 변수) - 보안 및 유지보수성

### 예제 3: Docker 기반 서버 (Brave Search)

**Claude Code**:
```json
{
  "brave-search": {
    "command": "docker",
    "args": ["run", "-i", "--rm", "-e", "BRAVE_API_KEY", "docker.io/mcp/brave-search"],
    "env": {
      "BRAVE_API_KEY": "${BRAVE_API_KEY}"
    }
  }
}
```

**Copilot CLI**:
```json
{
  "brave-search": {
    "command": "docker",
    "args": ["run", "-i", "--rm", "-e", "BRAVE_API_KEY", "docker.io/mcp/brave-search"],
    "env": {
      "BRAVE_API_KEY": "$BRAVE_API_KEY"
    }
  }
}
```

`~/.zshrc`에 추가:
```bash
export BRAVE_API_KEY="BSA_..."
```

### 예제 4: Google Analytics (여러 환경 변수)

**Claude Code**:
```json
{
  "analytics-mcp": {
    "command": "pipx",
    "args": ["run", "analytics-mcp"],
    "env": {
      "GOOGLE_APPLICATION_CREDENTIALS": "${GOOGLE_APPLICATION_CREDENTIALS}",
      "GOOGLE_PROJECT_ID": "${GOOGLE_PROJECT_ID}"
    }
  }
}
```

**Copilot CLI**:
```json
{
  "analytics-mcp": {
    "command": "pipx",
    "args": ["run", "analytics-mcp"],
    "env": {
      "GOOGLE_APPLICATION_CREDENTIALS": "$GOOGLE_APPLICATION_CREDENTIALS",
      "GOOGLE_PROJECT_ID": "$GOOGLE_PROJECT_ID"
    }
  }
}
```

`~/.zshrc`에 추가:
```bash
export GOOGLE_APPLICATION_CREDENTIALS="$HOME/.config/gcloud/application_default_credentials.json"
export GOOGLE_PROJECT_ID="my-project-id"
```

## 자동화 스크립트

### Python 변환 스크립트

`scripts/convert_mcp_to_copilot.py`:

```python
#!/usr/bin/env python3
"""
Claude Code .mcp.json → Copilot CLI mcp-config.json 변환 스크립트
"""

import json
import re
import sys
from pathlib import Path


def convert_env_vars(obj):
    """
    환경 변수 참조 형식 변환: ${VAR} → $VAR
    """
    if isinstance(obj, str):
        # ${VAR_NAME} → $VAR_NAME
        return re.sub(r'\$\{([A-Za-z_][A-Za-z0-9_]*)\}', r'$\1', obj)
    elif isinstance(obj, dict):
        return {k: convert_env_vars(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [convert_env_vars(item) for item in obj]
    else:
        return obj


def migrate_mcp_config(claude_config_path, output_path=None):
    """
    .mcp.json을 Copilot CLI mcp-config.json으로 변환

    Args:
        claude_config_path: Claude Code .mcp.json 경로
        output_path: 출력 경로 (기본: ~/.copilot/mcp-config.json)
    """
    # 입력 파일 읽기
    with open(claude_config_path, 'r') as f:
        claude_config = json.load(f)

    # 환경 변수 구문 변환
    copilot_config = convert_env_vars(claude_config)

    # 출력 경로 결정
    if output_path is None:
        output_path = Path.home() / '.copilot' / 'mcp-config.json'
    else:
        output_path = Path(output_path)

    # 디렉토리 생성
    output_path.parent.mkdir(parents=True, exist_ok=True)

    # 기존 파일 백업
    if output_path.exists():
        backup_path = output_path.with_suffix('.json.backup')
        print(f"📦 기존 설정을 백업합니다: {backup_path}")
        output_path.rename(backup_path)

    # 새 설정 파일 작성
    with open(output_path, 'w') as f:
        json.dump(copilot_config, f, indent=2, ensure_ascii=False)

    print(f"✅ 변환 완료: {output_path}")
    print(f"\n📝 환경 변수 설정이 필요한 서버:")

    # 환경 변수 목록 추출
    env_vars = set()
    for server_name, server_config in copilot_config.get('mcpServers', {}).items():
        if 'env' in server_config:
            for env_key in server_config['env'].keys():
                env_vars.add(env_key)

    if env_vars:
        print("\n~/.zshrc 또는 ~/.bashrc에 추가:")
        for var in sorted(env_vars):
            print(f'export {var}="your-value-here"')
        print("\n적용: source ~/.zshrc")
    else:
        print("  (없음)")


def main():
    if len(sys.argv) < 2:
        print("사용법: python convert_mcp_to_copilot.py <.mcp.json 경로> [출력 경로]")
        print("\n예제:")
        print("  python convert_mcp_to_copilot.py .mcp.json")
        print("  python convert_mcp_to_copilot.py .mcp.json ~/.copilot/mcp-config.json")
        sys.exit(1)

    claude_config_path = sys.argv[1]
    output_path = sys.argv[2] if len(sys.argv) > 2 else None

    try:
        migrate_mcp_config(claude_config_path, output_path)
    except Exception as e:
        print(f"❌ 오류 발생: {e}")
        sys.exit(1)


if __name__ == '__main__':
    main()
```

### 사용법

```bash
# 실행 권한 부여
chmod +x scripts/convert_mcp_to_copilot.py

# 변환 실행 (기본 출력: ~/.copilot/mcp-config.json)
python scripts/convert_mcp_to_copilot.py .mcp.json

# 커스텀 출력 경로
python scripts/convert_mcp_to_copilot.py .mcp.json ~/custom/path/mcp-config.json
```

**출력 예시**:
```
📦 기존 설정을 백업합니다: /Users/username/.copilot/mcp-config.json.backup
✅ 변환 완료: /Users/username/.copilot/mcp-config.json

📝 환경 변수 설정이 필요한 서버:

~/.zshrc 또는 ~/.bashrc에 추가:
export BRAVE_API_KEY="your-value-here"
export GOOGLE_APPLICATION_CREDENTIALS="your-value-here"
export GOOGLE_PROJECT_ID="your-value-here"
export NOTION_TOKEN="your-value-here"

적용: source ~/.zshrc
```

## MCP 서버 관리

### CLI를 통한 MCP 서버 추가

Copilot CLI 대화형 모드에서:

```bash
copilot

# 프롬프트에서:
/mcp add
```

**대화형 설정 프로세스**:
1. 서버 이름 입력
2. 명령어 입력 (`npx`, `docker`, etc.)
3. 인자 입력
4. 환경 변수 설정 (선택)

→ 자동으로 `mcp-config.json`에 추가됨

### 수동 편집

```bash
# 설정 파일 편집
code ~/.copilot/mcp-config.json

# 또는
vim ~/.copilot/mcp-config.json
```

### 서버 목록 확인

Copilot CLI에서:
```
# MCP 서버 상태 확인
"List all available MCP servers"
```

## 검증 및 테스트

### 1. 파일 확인

```bash
# 설정 파일 존재 확인
ls -la ~/.copilot/mcp-config.json

# 내용 확인
cat ~/.copilot/mcp-config.json | jq .
```

### 2. 환경 변수 확인

```bash
# 환경 변수가 설정되었는지 확인
echo $NOTION_TOKEN
echo $BRAVE_API_KEY
echo $GOOGLE_APPLICATION_CREDENTIALS
echo $GOOGLE_PROJECT_ID
```

모두 값이 출력되어야 함.

### 3. Copilot CLI 테스트

```bash
# Copilot CLI 시작
copilot

# MCP 서버 테스트
"Use context7 to search for 'Astro 5.0 features'"
"Use brave-search to find latest TypeScript news"
"Use notionApi to list my databases"
```

각 서버가 정상적으로 응답하는지 확인.

### 4. 개별 서버 테스트

**Context7**:
```
"Search Context7 for Next.js 15 documentation"
```

**Brave Search**:
```
"Use Brave Search to find articles about GitHub Copilot CLI from last week"
```

**Notion**:
```
"List all pages in my Notion workspace using notionApi"
```

**Analytics**:
```
"Show me top 5 blog posts by traffic using analytics-mcp"
```

## 트러블슈팅

### 문제 1: MCP 서버가 시작되지 않음

**증상**:
```
Error: Failed to start MCP server 'context7'
```

**해결책**:

**1. 명령어 확인**:
```bash
# npx가 설치되어 있는지 확인
npx --version

# 패키지 수동 실행 테스트
npx -y @upstash/context7-mcp
```

**2. Docker 서버의 경우**:
```bash
# Docker 실행 확인
docker --version

# 이미지 존재 확인
docker images | grep mcp

# 수동 실행 테스트
docker run --rm -i mcp/sequentialthinking
```

**3. 설정 파일 문법 확인**:
```bash
# JSON 문법 검증
cat ~/.copilot/mcp-config.json | jq .
```

오류가 있으면 수정.

### 문제 2: 환경 변수가 인식되지 않음

**증상**:
```
Error: NOTION_TOKEN not found
```

**해결책**:

**1. 환경 변수 확인**:
```bash
echo $NOTION_TOKEN
```

값이 출력되지 않으면:

**2. 셸 설정 파일 확인**:
```bash
# Zsh 사용자
cat ~/.zshrc | grep NOTION_TOKEN

# Bash 사용자
cat ~/.bashrc | grep NOTION_TOKEN
```

없으면 추가:
```bash
export NOTION_TOKEN="secret_..."
```

**3. 설정 적용**:
```bash
source ~/.zshrc
# 또는
source ~/.bashrc
```

**4. 새 터미널에서 Copilot CLI 재시작**:
```bash
copilot
```

### 문제 3: 권한 오류 (pipx, docker)

**증상**:
```
Error: Permission denied when running analytics-mcp
```

**해결책**:

**pipx 설치 확인**:
```bash
pipx --version

# 없으면 설치
pip install --user pipx
pipx ensurepath
```

**Docker 권한 확인**:
```bash
# 현재 사용자를 docker 그룹에 추가
sudo usermod -aG docker $USER

# 로그아웃 후 재로그인
```

### 문제 4: 설정 파일이 인식되지 않음

**증상**:
Copilot CLI가 MCP 서버를 찾지 못함

**해결책**:

**1. 경로 확인**:
```bash
# 기본 경로
ls ~/.copilot/mcp-config.json

# XDG_CONFIG_HOME 설정된 경우
echo $XDG_CONFIG_HOME
ls $XDG_CONFIG_HOME/copilot/mcp-config.json
```

**2. 파일명 확인**:
- 올바름: `mcp-config.json`
- 틀림: `mcp_config.json`, `mcpconfig.json`

**3. Copilot CLI 재시작**:
```bash
# 터미널 종료 후 재시작
copilot
```

### 문제 5: 일부 서버만 작동함

**증상**:
Context7은 작동하지만 Notion은 작동하지 않음

**해결책**:

**1. 개별 서버 테스트**:
```bash
# npx 서버
npx -y @notionhq/notion-mcp-server

# docker 서버
docker run --rm -i -e BRAVE_API_KEY docker.io/mcp/brave-search
```

**2. 로그 확인**:
Copilot CLI 내에서:
```
# 로그 레벨 증가
/logging debug

# 서버 다시 시도
"Use notionApi to list databases"
```

**3. 환경 변수별 확인**:
```bash
# 각 환경 변수 개별 확인
echo $NOTION_TOKEN
echo $BRAVE_API_KEY
echo $GOOGLE_APPLICATION_CREDENTIALS
```

## 베스트 프랙티스

### 1. 환경 변수 관리

**권장 방식**:
```bash
# ~/.zshrc
export NOTION_TOKEN="secret_..."
export BRAVE_API_KEY="BSA_..."
```

**비권장**:
```json
{
  "env": {
    "NOTION_TOKEN": "secret_hardcoded_value"
  }
}
```

이유: 보안 및 유지보수성

### 2. 백업

```bash
# 설정 변경 전 백업
cp ~/.copilot/mcp-config.json ~/.copilot/mcp-config.json.backup
```

### 3. 버전 관리

프로젝트별 설정이 필요한 경우:

```bash
# 프로젝트 루트에 예제 파일 생성
.copilot/mcp-config.example.json
```

README에 설치 가이드 추가:
```markdown
## Copilot CLI Setup

1. Copy example MCP config:
   ```bash
   cp .copilot/mcp-config.example.json ~/.copilot/mcp-config.json
   ```
2. Edit with your credentials
3. Set environment variables in ~/.zshrc
```

### 4. 최소 권한 원칙

필요한 서버만 활성화:
```json
{
  "mcpServers": {
    "context7": {},  // 항상 유용
    "brave-search": {},  // 웹 리서치 필요 시만
    "notionApi": {}  // Notion 사용자만
  }
}
```

## 다음 단계

MCP 서버 마이그레이션이 완료되었습니다. 다음 가이드를 진행하세요:

1. **[프로젝트 지침 변환](./02-project-instructions.md)** - `CLAUDE.md` → `.github/copilot-instructions.md`
2. **[에이전트 시스템 재구성](./03-agent-system.md)** - `.claude/agents/` → `.github/agents/`
3. **[완전한 예제](./04-complete-example.md)** - 전체 마이그레이션 가이드

---

**마지막 업데이트**: 2025-11-13
**이전 문서**: [README.md](./README.md)
**다음 문서**: [02-project-instructions.md](./02-project-instructions.md)
