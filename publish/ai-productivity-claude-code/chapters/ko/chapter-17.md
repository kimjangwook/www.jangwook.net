# Chapter 17: 코드 리뷰 자동화

## 개요

코드 리뷰는 소프트웨어 개발에서 품질을 보장하는 핵심 프로세스입니다. 하지만 대부분의 팀에서 코드 리뷰는 시간이 오래 걸리고, 일관성이 부족하며, 병목 현상을 일으키는 주요 원인이 됩니다. AI 시대에도 이 문제는 여전히 존재합니다. Claude Code가 뛰어난 코드를 생성하더라도, 조직의 코딩 규칙, 보안 정책, 컴플라이언스 요구사항을 자동으로 검증할 방법이 필요합니다.

Claude Code의 Hook 시스템은 이 문제를 해결하는 강력한 솔루션입니다. Hook을 사용하면 코드 작성, 파일 저장, 커밋 등 워크플로우의 특정 시점에서 자동으로 검증 로직을 실행할 수 있습니다. 이를 통해 코드 리뷰 프로세스를 자동화하고, 품질을 일관되게 유지하며, 규정 준수를 보장할 수 있습니다.

이 장에서는 Hook 기반 코드 리뷰 파이프라인을 구축하는 실전 레시피를 제공합니다. 각 레시피는 독립적으로 읽을 수 있으며, 바로 프로젝트에 적용할 수 있는 실용적인 예제를 포함합니다.

### 이 장에서 다룰 내용

- **Recipe 17.1**: 리뷰 기준 정의 - 조직의 코딩 규칙을 명확하게 정의하고 자동화 가능한 형태로 변환
- **Recipe 17.2**: Hook 스크립트 작성 - 실행 가능한 검증 로직을 Hook으로 구현
- **Recipe 17.3**: GitHub Actions 통합 - CI/CD 파이프라인과 Hook 시스템 연동
- **Recipe 17.4**: 피드백 루프 구현 - 검증 결과를 팀에 전달하고 지속적으로 개선

---

## Recipe 17.1: 리뷰 기준 정의

### 문제 (Problem)

코드 리뷰를 자동화하려면 먼저 "무엇을 검증할 것인가"를 명확히 정의해야 합니다. 많은 조직이 암묵적인 코딩 규칙에 의존하거나, 리뷰어마다 다른 기준을 적용하여 일관성이 부족합니다. 또한 보안, 성능, 컴플라이언스 등 다양한 요구사항을 어떻게 체계적으로 관리할지가 불명확합니다.

자동화 가능한 리뷰 기준을 정의하려면 다음 질문에 답해야 합니다:

- 어떤 검증을 자동화할 수 있는가? (타입 체크, 린팅, 보안 스캔 등)
- 각 검증의 중요도는 어떻게 되는가? (블로킹, 경고, 정보 제공)
- 언제 검증을 실행해야 하는가? (파일 저장 시, 커밋 전, PR 생성 시)
- 예외 처리는 어떻게 할 것인가? (특정 파일/디렉토리 제외, 긴급 배포 시)

### 해결책 (Solution)

리뷰 기준을 3단계 프레임워크로 정의합니다:

**1단계: 검증 카테고리 분류**

모든 검증 항목을 다음 카테고리로 분류합니다:

- **필수 (Mandatory)**: 반드시 통과해야 하는 검증 (블로킹)
- **권장 (Recommended)**: 통과를 권장하지만 실패 시 경고만 표시
- **선택 (Optional)**: 정보 제공 목적, 실패해도 무방

**2단계: 검증 체크리스트 작성**

각 카테고리별로 구체적인 검증 항목을 정의합니다.

**3단계: 검증 매트릭스 생성**

파일 타입별, 워크플로우 단계별로 어떤 검증을 실행할지 매트릭스로 정리합니다.

### 코드/예시 (Code)

#### 검증 기준 정의 파일

`.claude/review-criteria.json` 파일로 리뷰 기준을 정의합니다:

```json
{
  "version": "1.0",
  "criteria": {
    "mandatory": {
      "security": {
        "description": "보안 취약점 스캔",
        "tools": ["semgrep", "snyk"],
        "severity": "error",
        "exit_code": 1
      },
      "type_safety": {
        "description": "타입 안전성 검증",
        "tools": ["tsc", "mypy", "rubocop"],
        "severity": "error",
        "exit_code": 1
      },
      "build": {
        "description": "빌드 성공 여부",
        "tools": ["npm run build", "gradle build"],
        "severity": "error",
        "exit_code": 1
      }
    },
    "recommended": {
      "linting": {
        "description": "코드 스타일 및 품질 검사",
        "tools": ["eslint", "pylint", "rubocop"],
        "severity": "warning",
        "exit_code": 2
      },
      "test_coverage": {
        "description": "테스트 커버리지 확인",
        "tools": ["jest --coverage", "pytest --cov"],
        "severity": "warning",
        "exit_code": 2,
        "threshold": 80
      },
      "documentation": {
        "description": "문서화 검증",
        "tools": ["jsdoc", "pydoc"],
        "severity": "warning",
        "exit_code": 2
      }
    },
    "optional": {
      "performance": {
        "description": "성능 프로파일링",
        "tools": ["lighthouse", "webpack-bundle-analyzer"],
        "severity": "info",
        "exit_code": 0
      },
      "accessibility": {
        "description": "접근성 검증",
        "tools": ["axe-core", "pa11y"],
        "severity": "info",
        "exit_code": 0
      }
    }
  },
  "file_type_mapping": {
    "*.ts": ["type_safety", "linting", "security"],
    "*.tsx": ["type_safety", "linting", "security", "accessibility"],
    "*.py": ["type_safety", "linting", "security", "test_coverage"],
    "*.js": ["linting", "security"],
    "*.jsx": ["linting", "security", "accessibility"],
    "*.go": ["build", "linting", "security"],
    "*.rs": ["build", "linting", "security"]
  },
  "workflow_stages": {
    "pre-file-write": ["type_safety", "linting"],
    "post-file-write": ["documentation"],
    "pre-commit": ["security", "build", "test_coverage"],
    "post-commit": ["performance", "accessibility"]
  },
  "exceptions": {
    "paths": [
      "node_modules/**",
      "dist/**",
      "build/**",
      "*.test.ts",
      "*.spec.ts"
    ],
    "emergency_bypass": {
      "enabled": true,
      "env_var": "EMERGENCY_DEPLOY",
      "skip_checks": ["test_coverage", "performance"]
    }
  }
}
```

#### 검증 매트릭스 시각화

검증 매트릭스를 Markdown 테이블로 문서화합니다:

`.claude/REVIEW_MATRIX.md`:

```markdown
# 코드 리뷰 검증 매트릭스

## 필수 검증 (Mandatory)

| 검증 항목 | 도구 | 파일 타입 | 워크플로우 단계 | 실패 시 동작 |
|---------|------|----------|----------------|-------------|
| 보안 스캔 | Semgrep | 모든 파일 | pre-commit | 커밋 중단 |
| 타입 체크 | TSC | *.ts, *.tsx | pre-file-write | 저장 중단 |
| 빌드 검증 | npm build | 모든 파일 | pre-commit | 커밋 중단 |

## 권장 검증 (Recommended)

| 검증 항목 | 도구 | 파일 타입 | 워크플로우 단계 | 실패 시 동작 |
|---------|------|----------|----------------|-------------|
| 린팅 | ESLint | *.js, *.ts | pre-file-write | 경고 표시 |
| 테스트 커버리지 | Jest | *.ts, *.js | pre-commit | 경고 표시 |
| 문서화 | JSDoc | *.ts, *.js | post-file-write | 경고 표시 |

## 선택 검증 (Optional)

| 검증 항목 | 도구 | 파일 타입 | 워크플로우 단계 | 실패 시 동작 |
|---------|------|----------|----------------|-------------|
| 성능 | Lighthouse | *.html | post-commit | 정보 제공 |
| 접근성 | axe-core | *.tsx, *.jsx | post-commit | 정보 제공 |

## 예외 규칙

- **제외 경로**: node_modules, dist, build
- **긴급 배포**: `EMERGENCY_DEPLOY=true` 설정 시 테스트 커버리지, 성능 검증 생략
- **테스트 파일**: `*.test.ts`, `*.spec.ts`는 문서화 검증 제외
```

#### 기준 검증 스크립트

정의한 기준이 올바른지 검증하는 스크립트:

`.claude/scripts/validate-criteria.py`:

```python
#!/usr/bin/env python3
"""리뷰 기준 정의 파일의 유효성을 검증하는 스크립트"""

import json
import sys
from pathlib import Path

def validate_criteria(criteria_path):
    """리뷰 기준 JSON 파일 검증"""

    try:
        with open(criteria_path) as f:
            criteria = json.load(f)
    except json.JSONDecodeError as e:
        print(f"❌ JSON 파싱 오류: {e}")
        return False
    except FileNotFoundError:
        print(f"❌ 파일을 찾을 수 없음: {criteria_path}")
        return False

    errors = []

    # 1. 필수 필드 확인
    required_fields = ['version', 'criteria', 'file_type_mapping',
                       'workflow_stages', 'exceptions']
    for field in required_fields:
        if field not in criteria:
            errors.append(f"필수 필드 누락: {field}")

    # 2. 검증 카테고리 확인
    if 'criteria' in criteria:
        required_categories = ['mandatory', 'recommended', 'optional']
        for category in required_categories:
            if category not in criteria['criteria']:
                errors.append(f"필수 카테고리 누락: {category}")

    # 3. 종료 코드 검증
    valid_exit_codes = [0, 1, 2]
    for category_name, category in criteria.get('criteria', {}).items():
        for check_name, check_config in category.items():
            exit_code = check_config.get('exit_code')
            if exit_code not in valid_exit_codes:
                errors.append(
                    f"{category_name}.{check_name}: "
                    f"잘못된 종료 코드 {exit_code} (유효: 0, 1, 2)"
                )

    # 4. 파일 타입 매핑 검증
    if 'file_type_mapping' in criteria:
        all_checks = set()
        for category in criteria['criteria'].values():
            all_checks.update(category.keys())

        for file_pattern, checks in criteria['file_type_mapping'].items():
            for check in checks:
                if check not in all_checks:
                    errors.append(
                        f"file_type_mapping: 정의되지 않은 검증 '{check}' "
                        f"(파일 패턴: {file_pattern})"
                    )

    # 5. 워크플로우 단계 검증
    valid_stages = ['pre-file-write', 'post-file-write',
                    'pre-commit', 'post-commit']
    if 'workflow_stages' in criteria:
        for stage in criteria['workflow_stages']:
            if stage not in valid_stages:
                errors.append(f"잘못된 워크플로우 단계: {stage}")

    # 결과 출력
    if errors:
        print("❌ 검증 실패:")
        for error in errors:
            print(f"  - {error}")
        return False

    print("✅ 리뷰 기준 검증 성공")

    # 통계 출력
    total_checks = sum(
        len(category)
        for category in criteria['criteria'].values()
    )
    print(f"\n📊 통계:")
    print(f"  - 총 검증 항목: {total_checks}개")
    print(f"  - 필수: {len(criteria['criteria']['mandatory'])}개")
    print(f"  - 권장: {len(criteria['criteria']['recommended'])}개")
    print(f"  - 선택: {len(criteria['criteria']['optional'])}개")
    print(f"  - 파일 타입 매핑: {len(criteria['file_type_mapping'])}개")
    print(f"  - 워크플로우 단계: {len(criteria['workflow_stages'])}개")

    return True

if __name__ == '__main__':
    criteria_path = Path('.claude/review-criteria.json')
    success = validate_criteria(criteria_path)
    sys.exit(0 if success else 1)
```

실행:

```bash
chmod +x .claude/scripts/validate-criteria.py
python3 .claude/scripts/validate-criteria.py
```

### 설명 (Explanation)

#### 왜 JSON 형식인가?

리뷰 기준을 JSON 형식으로 정의하면 다음과 같은 장점이 있습니다:

1. **기계 판독 가능**: Hook 스크립트에서 쉽게 파싱하고 활용
2. **버전 관리**: Git으로 변경 이력 추적
3. **재사용성**: 여러 프로젝트에서 공유하고 확장 가능
4. **문서화**: JSON Schema로 구조를 명확히 정의

#### 종료 코드의 의미

Claude Code Hook은 종료 코드로 다음 동작을 제어합니다:

- **0**: 성공 - 작업 계속 진행, 메시지 출력 없음
- **1**: 실패 - 작업 중단, 에러 메시지 표시
- **2**: 경고 - 작업 계속하되 경고 메시지 표시

이 설계는 Git hook의 종료 코드 규칙과 유사하며, 직관적입니다.

#### 검증 매트릭스의 역할

검증 매트릭스는 "언제, 무엇을, 어떻게" 검증할지를 한눈에 보여줍니다. 이를 통해:

- 팀원들이 어떤 검증이 실행되는지 이해
- 새로운 검증 추가 시 중복 방지
- 성능 최적화 (불필요한 검증 제거)

### 변형 (Variations)

#### 변형 1: YAML 형식 사용

JSON 대신 YAML을 선호한다면:

`.claude/review-criteria.yaml`:

```yaml
version: "1.0"

criteria:
  mandatory:
    security:
      description: 보안 취약점 스캔
      tools:
        - semgrep
        - snyk
      severity: error
      exit_code: 1

    type_safety:
      description: 타입 안전성 검증
      tools:
        - tsc
        - mypy
      severity: error
      exit_code: 1

  recommended:
    linting:
      description: 코드 스타일 및 품질 검사
      tools:
        - eslint
        - pylint
      severity: warning
      exit_code: 2

  optional:
    performance:
      description: 성능 프로파일링
      tools:
        - lighthouse
      severity: info
      exit_code: 0

file_type_mapping:
  "*.ts":
    - type_safety
    - linting
    - security
  "*.tsx":
    - type_safety
    - linting
    - security
    - accessibility

workflow_stages:
  pre-file-write:
    - type_safety
    - linting
  pre-commit:
    - security
    - build

exceptions:
  paths:
    - node_modules/**
    - dist/**
  emergency_bypass:
    enabled: true
    env_var: EMERGENCY_DEPLOY
```

YAML 파싱 스크립트:

```python
import yaml

with open('.claude/review-criteria.yaml') as f:
    criteria = yaml.safe_load(f)
```

#### 변형 2: 동적 기준 생성

프로젝트 구조를 분석하여 자동으로 기준 생성:

```python
#!/usr/bin/env python3
"""프로젝트 구조를 분석하여 리뷰 기준을 자동 생성"""

import json
from pathlib import Path

def detect_project_type(root_path):
    """프로젝트 타입 자동 감지"""
    root = Path(root_path)

    if (root / 'package.json').exists():
        return 'node'
    elif (root / 'requirements.txt').exists():
        return 'python'
    elif (root / 'go.mod').exists():
        return 'go'
    elif (root / 'Cargo.toml').exists():
        return 'rust'
    else:
        return 'unknown'

def generate_criteria(project_type):
    """프로젝트 타입별 기본 기준 생성"""

    criteria = {
        'version': '1.0',
        'criteria': {},
        'file_type_mapping': {},
        'workflow_stages': {},
        'exceptions': {
            'paths': ['node_modules/**', 'dist/**', 'build/**']
        }
    }

    if project_type == 'node':
        criteria['criteria']['mandatory'] = {
            'type_safety': {
                'description': 'TypeScript 타입 체크',
                'tools': ['tsc'],
                'severity': 'error',
                'exit_code': 1
            },
            'build': {
                'description': '빌드 검증',
                'tools': ['npm run build'],
                'severity': 'error',
                'exit_code': 1
            }
        }
        criteria['file_type_mapping'] = {
            '*.ts': ['type_safety', 'linting'],
            '*.tsx': ['type_safety', 'linting', 'accessibility']
        }

    elif project_type == 'python':
        criteria['criteria']['mandatory'] = {
            'type_safety': {
                'description': 'Python 타입 체크',
                'tools': ['mypy'],
                'severity': 'error',
                'exit_code': 1
            }
        }
        criteria['file_type_mapping'] = {
            '*.py': ['type_safety', 'linting', 'test_coverage']
        }

    return criteria

# 실행
project_type = detect_project_type('.')
criteria = generate_criteria(project_type)

with open('.claude/review-criteria.json', 'w') as f:
    json.dump(criteria, f, indent=2)

print(f"✅ {project_type} 프로젝트용 기준 생성 완료")
```

#### 변형 3: 팀별 커스터마이징

조직 내 팀마다 다른 기준 적용:

```json
{
  "version": "1.0",
  "teams": {
    "frontend": {
      "criteria": {
        "mandatory": ["type_safety", "linting", "accessibility"],
        "recommended": ["performance"]
      }
    },
    "backend": {
      "criteria": {
        "mandatory": ["type_safety", "security", "test_coverage"],
        "recommended": ["performance"]
      }
    },
    "devops": {
      "criteria": {
        "mandatory": ["security", "build"],
        "recommended": ["documentation"]
      }
    }
  },
  "team_detection": {
    "method": "path",
    "rules": {
      "src/frontend/**": "frontend",
      "src/backend/**": "backend",
      "infrastructure/**": "devops"
    }
  }
}
```

---

## Recipe 17.2: Hook 스크립트 작성

### 문제 (Problem)

리뷰 기준을 정의했다면, 이제 실제로 검증을 수행하는 Hook 스크립트를 작성해야 합니다. Hook 스크립트는 다음 요구사항을 충족해야 합니다:

- **신뢰성**: 잘못된 입력이나 예외 상황에서도 안전하게 동작
- **성능**: 개발 워크플로우를 방해하지 않도록 빠르게 실행
- **명확성**: 검증 실패 시 원인과 해결 방법을 명확히 제시
- **유지보수성**: 코드를 읽기 쉽고 수정하기 쉽게 작성

하지만 많은 개발자가 Hook 스크립트 작성 시 다음과 같은 어려움을 겪습니다:

- Claude가 전달하는 JSON 데이터를 어떻게 파싱하는가?
- 여러 검증을 어떻게 조합하고 결과를 집계하는가?
- 오류 처리와 로깅을 어떻게 구현하는가?
- 성능 최적화는 어떻게 하는가?

### 해결책 (Solution)

Hook 스크립트를 다음 4단계로 작성합니다:

**1단계: 입력 데이터 파싱 및 검증**

Claude가 전달하는 JSON 데이터를 안전하게 파싱하고 유효성을 검증합니다.

**2단계: 검증 로직 구현**

Recipe 17.1에서 정의한 기준에 따라 실제 검증을 수행합니다.

**3단계: 결과 집계 및 보고**

여러 검증 결과를 종합하여 최종 판단을 내리고, 사용자에게 명확한 피드백을 제공합니다.

**4단계: 종료 코드 반환**

검증 결과에 따라 적절한 종료 코드(0, 1, 2)를 반환합니다.

### 코드/예시 (Code)

#### 기본 Hook 템플릿 (Bash)

`.claude/hooks/pre-file-write.sh`:

```bash
#!/bin/bash
# Claude Code Hook 템플릿
# 파일 저장 전 실행되는 기본 검증 Hook

set -euo pipefail  # 오류 발생 시 즉시 중단, 미정의 변수 사용 금지

# ============================================================================
# 설정
# ============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CRITERIA_FILE="$SCRIPT_DIR/../review-criteria.json"
LOG_DIR="$SCRIPT_DIR/../logs"
DEBUG=${HOOK_DEBUG:-false}

# 로그 디렉토리 생성
mkdir -p "$LOG_DIR"

# 디버그 모드
if [ "$DEBUG" = "true" ]; then
    set -x
    exec 2>> "$LOG_DIR/hook-debug.log"
fi

# ============================================================================
# 헬퍼 함수
# ============================================================================

log_info() {
    echo "ℹ️  $1"
}

log_success() {
    echo "✅ $1"
}

log_warning() {
    echo "⚠️  $1"
}

log_error() {
    echo "❌ $1" >&2
}

# jq 설치 확인
check_dependencies() {
    if ! command -v jq &> /dev/null; then
        log_error "jq가 설치되지 않음. 설치: brew install jq (macOS) 또는 apt-get install jq (Linux)"
        exit 1
    fi
}

# JSON 입력 파싱
parse_input() {
    local input="$1"

    # JSON 유효성 검증
    if ! echo "$input" | jq empty 2>/dev/null; then
        log_error "잘못된 JSON 입력"
        echo "$input" >> "$LOG_DIR/invalid-input.log"
        exit 1
    fi

    # 필드 추출
    FILE_PATH=$(echo "$input" | jq -r '.file_path // "unknown"')
    OPERATION=$(echo "$input" | jq -r '.operation // "unknown"')
    CONTENT=$(echo "$input" | jq -r '.content // ""')

    log_info "File: $FILE_PATH"
    log_info "Operation: $OPERATION"
}

# 파일이 예외 목록에 있는지 확인
is_excluded() {
    local file="$1"
    local excluded_paths=(
        "node_modules"
        "dist"
        "build"
        ".git"
        "*.test.ts"
        "*.spec.ts"
    )

    for pattern in "${excluded_paths[@]}"; do
        if [[ "$file" == *"$pattern"* ]]; then
            return 0  # true
        fi
    done

    return 1  # false
}

# 파일 타입 감지
get_file_type() {
    local file="$1"

    case "$file" in
        *.ts)   echo "typescript" ;;
        *.tsx)  echo "typescript-react" ;;
        *.js)   echo "javascript" ;;
        *.jsx)  echo "javascript-react" ;;
        *.py)   echo "python" ;;
        *.go)   echo "go" ;;
        *.rs)   echo "rust" ;;
        *)      echo "unknown" ;;
    esac
}

# ============================================================================
# 검증 함수
# ============================================================================

# TypeScript 타입 체크
check_typescript() {
    local file="$1"

    log_info "TypeScript 타입 체크 실행 중..."

    if ! command -v npx &> /dev/null; then
        log_warning "npx를 찾을 수 없음, 타입 체크 생략"
        return 0
    fi

    local output
    if output=$(npx tsc --noEmit "$file" 2>&1); then
        log_success "타입 체크 통과"
        return 0
    else
        log_error "타입 체크 실패:"
        echo "$output" | head -n 10  # 처음 10줄만 표시
        return 1
    fi
}

# ESLint 린팅
check_linting() {
    local file="$1"

    log_info "ESLint 린팅 실행 중..."

    if ! command -v npx &> /dev/null; then
        log_warning "npx를 찾을 수 없음, 린팅 생략"
        return 0
    fi

    local output
    if output=$(npx eslint "$file" --format compact 2>&1); then
        log_success "린팅 통과"
        return 0
    else
        log_warning "린팅 문제 발견:"
        echo "$output" | head -n 10
        return 2  # 경고 코드
    fi
}

# 민감한 데이터 검사
check_sensitive_data() {
    local file="$1"
    local content="$2"

    log_info "민감한 데이터 검사 중..."

    local patterns=(
        "password"
        "secret"
        "api_key"
        "private_key"
        "token"
        "credential"
    )

    for pattern in "${patterns[@]}"; do
        if echo "$content" | grep -qi "$pattern"; then
            log_error "민감한 데이터 패턴 감지: $pattern"
            return 1
        fi
    done

    log_success "민감한 데이터 검사 통과"
    return 0
}

# ============================================================================
# 메인 로직
# ============================================================================

main() {
    log_info "========================================="
    log_info "Claude Code Hook - Pre-File-Write"
    log_info "========================================="

    # 의존성 확인
    check_dependencies

    # 입력 데이터 읽기
    local input
    input=$(cat)

    # 디버그 로그
    if [ "$DEBUG" = "true" ]; then
        echo "$input" >> "$LOG_DIR/hook-input.log"
    fi

    # 입력 파싱
    parse_input "$input"

    # 예외 확인
    if is_excluded "$FILE_PATH"; then
        log_info "제외된 파일, 검증 생략"
        exit 0
    fi

    # 긴급 배포 모드
    if [ "${EMERGENCY_DEPLOY:-false}" = "true" ]; then
        log_warning "긴급 배포 모드: 일부 검증 생략"
        exit 0
    fi

    # 파일 타입 감지
    local file_type
    file_type=$(get_file_type "$FILE_PATH")
    log_info "파일 타입: $file_type"

    # 검증 실행
    local exit_code=0

    case "$file_type" in
        typescript|typescript-react)
            # 필수: 타입 체크
            if ! check_typescript "$FILE_PATH"; then
                exit_code=1
            fi

            # 권장: 린팅
            if ! check_linting "$FILE_PATH"; then
                # 린팅은 경고만, exit_code 유지
                :
            fi

            # 필수: 민감한 데이터 검사
            if ! check_sensitive_data "$FILE_PATH" "$CONTENT"; then
                exit_code=1
            fi
            ;;

        javascript|javascript-react)
            # 권장: 린팅
            check_linting "$FILE_PATH" || true

            # 필수: 민감한 데이터 검사
            if ! check_sensitive_data "$FILE_PATH" "$CONTENT"; then
                exit_code=1
            fi
            ;;

        python)
            log_info "Python 파일: 기본 검증만 수행"
            check_sensitive_data "$FILE_PATH" "$CONTENT" || exit_code=1
            ;;

        *)
            log_info "알 수 없는 파일 타입: 기본 검증만 수행"
            check_sensitive_data "$FILE_PATH" "$CONTENT" || exit_code=1
            ;;
    esac

    # 결과 요약
    echo ""
    log_info "========================================="
    if [ $exit_code -eq 0 ]; then
        log_success "모든 검증 통과"
    else
        log_error "검증 실패, 파일 저장 중단"
    fi
    log_info "========================================="

    exit $exit_code
}

# 에러 핸들러
trap 'log_error "예기치 않은 오류 발생 (라인: $LINENO)"; exit 1' ERR

# 실행
main
```

실행 권한 부여:

```bash
chmod +x .claude/hooks/pre-file-write.sh
```

#### 고급 Hook 템플릿 (Python)

`.claude/hooks/comprehensive-review.py`:

```python
#!/usr/bin/env python3
"""
Claude Code Hook - 종합 코드 리뷰
파일 저장 전 모든 검증을 수행하는 고급 Hook
"""

import sys
import json
import subprocess
import hashlib
import time
from pathlib import Path
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
from enum import Enum

# ============================================================================
# 설정 및 타입 정의
# ============================================================================

class Severity(Enum):
    ERROR = 1
    WARNING = 2
    INFO = 0

@dataclass
class CheckResult:
    """검증 결과"""
    name: str
    passed: bool
    severity: Severity
    message: str
    duration: float = 0.0
    details: Optional[str] = None

class Colors:
    """터미널 색상 코드"""
    RESET = '\033[0m'
    RED = '\033[91m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    BOLD = '\033[1m'

# ============================================================================
# 헬퍼 함수
# ============================================================================

def log_info(message: str):
    """정보 메시지"""
    print(f"{Colors.BLUE}ℹ️  {message}{Colors.RESET}")

def log_success(message: str):
    """성공 메시지"""
    print(f"{Colors.GREEN}✅ {message}{Colors.RESET}")

def log_warning(message: str):
    """경고 메시지"""
    print(f"{Colors.YELLOW}⚠️  {message}{Colors.RESET}")

def log_error(message: str):
    """에러 메시지"""
    print(f"{Colors.RED}❌ {message}{Colors.RESET}", file=sys.stderr)

def load_criteria() -> Dict:
    """리뷰 기준 로드"""
    criteria_path = Path(__file__).parent.parent / 'review-criteria.json'

    try:
        with open(criteria_path) as f:
            return json.load(f)
    except FileNotFoundError:
        log_warning(f"리뷰 기준 파일 없음: {criteria_path}")
        return {}
    except json.JSONDecodeError as e:
        log_error(f"리뷰 기준 JSON 파싱 오류: {e}")
        sys.exit(1)

def is_excluded(file_path: str, criteria: Dict) -> bool:
    """파일이 예외 목록에 있는지 확인"""
    excluded_paths = criteria.get('exceptions', {}).get('paths', [])

    for pattern in excluded_paths:
        # 간단한 glob 패턴 매칭
        pattern = pattern.replace('**/', '').replace('*', '')
        if pattern in file_path:
            return True

    return False

def get_file_checks(file_path: str, criteria: Dict, stage: str) -> List[str]:
    """파일에 적용할 검증 목록 반환"""
    file_type_mapping = criteria.get('file_type_mapping', {})
    workflow_stages = criteria.get('workflow_stages', {})

    # 파일 확장자 매칭
    checks = []
    for pattern, pattern_checks in file_type_mapping.items():
        if file_path.endswith(pattern.replace('*', '')):
            checks.extend(pattern_checks)

    # 워크플로우 단계별 필터링
    stage_checks = workflow_stages.get(stage, [])
    checks = [c for c in checks if c in stage_checks]

    return list(set(checks))  # 중복 제거

def run_command(cmd: List[str], cwd: Optional[str] = None,
                timeout: int = 30) -> Tuple[bool, str]:
    """
    명령어 실행

    Returns:
        (성공 여부, 출력)
    """
    try:
        result = subprocess.run(
            cmd,
            cwd=cwd,
            capture_output=True,
            text=True,
            timeout=timeout,
            check=False
        )
        return result.returncode == 0, result.stdout + result.stderr
    except subprocess.TimeoutExpired:
        return False, f"명령어 실행 시간 초과 ({timeout}초)"
    except Exception as e:
        return False, str(e)

# ============================================================================
# 검증 함수
# ============================================================================

def check_type_safety(file_path: str) -> CheckResult:
    """타입 안전성 검증"""
    start_time = time.time()

    if file_path.endswith('.ts') or file_path.endswith('.tsx'):
        # TypeScript 타입 체크
        success, output = run_command(['npx', 'tsc', '--noEmit', file_path])

        return CheckResult(
            name='type_safety',
            passed=success,
            severity=Severity.ERROR,
            message='TypeScript 타입 체크',
            duration=time.time() - start_time,
            details=output if not success else None
        )

    elif file_path.endswith('.py'):
        # Python 타입 체크 (mypy)
        success, output = run_command(['mypy', file_path])

        return CheckResult(
            name='type_safety',
            passed=success,
            severity=Severity.ERROR,
            message='Python 타입 체크 (mypy)',
            duration=time.time() - start_time,
            details=output if not success else None
        )

    else:
        # 타입 체크 불필요
        return CheckResult(
            name='type_safety',
            passed=True,
            severity=Severity.INFO,
            message='타입 체크 불필요',
            duration=time.time() - start_time
        )

def check_linting(file_path: str) -> CheckResult:
    """린팅 검증"""
    start_time = time.time()

    if file_path.endswith(('.ts', '.tsx', '.js', '.jsx')):
        # ESLint
        success, output = run_command(
            ['npx', 'eslint', file_path, '--format', 'compact']
        )

        return CheckResult(
            name='linting',
            passed=success,
            severity=Severity.WARNING,  # 린팅은 경고 수준
            message='ESLint 코드 품질 검사',
            duration=time.time() - start_time,
            details=output if not success else None
        )

    elif file_path.endswith('.py'):
        # Pylint
        success, output = run_command(['pylint', file_path])

        return CheckResult(
            name='linting',
            passed=success,
            severity=Severity.WARNING,
            message='Pylint 코드 품질 검사',
            duration=time.time() - start_time,
            details=output if not success else None
        )

    else:
        return CheckResult(
            name='linting',
            passed=True,
            severity=Severity.INFO,
            message='린팅 불필요',
            duration=time.time() - start_time
        )

def check_security(file_path: str) -> CheckResult:
    """보안 스캔"""
    start_time = time.time()

    # Semgrep 보안 스캔
    success, output = run_command(
        ['semgrep', '--config', 'auto', file_path, '--quiet']
    )

    return CheckResult(
        name='security',
        passed=success,
        severity=Severity.ERROR,
        message='Semgrep 보안 스캔',
        duration=time.time() - start_time,
        details=output if not success else None
    )

def check_documentation(file_path: str, content: str) -> CheckResult:
    """문서화 검증"""
    start_time = time.time()

    if file_path.endswith(('.ts', '.tsx', '.js', '.jsx')):
        # JSDoc 주석 확인
        has_jsdoc = '/**' in content

        return CheckResult(
            name='documentation',
            passed=has_jsdoc,
            severity=Severity.WARNING,
            message='JSDoc 주석 확인',
            duration=time.time() - start_time,
            details='JSDoc 주석이 없습니다' if not has_jsdoc else None
        )

    else:
        return CheckResult(
            name='documentation',
            passed=True,
            severity=Severity.INFO,
            message='문서화 검증 불필요',
            duration=time.time() - start_time
        )

# ============================================================================
# 메인 로직
# ============================================================================

def main():
    """메인 함수"""
    log_info("=" * 60)
    log_info("Claude Code Hook - 종합 코드 리뷰")
    log_info("=" * 60)

    # 입력 데이터 읽기
    try:
        input_data = json.loads(sys.stdin.read())
    except json.JSONDecodeError as e:
        log_error(f"JSON 파싱 오류: {e}")
        sys.exit(1)

    file_path = input_data.get('file_path', '')
    content = input_data.get('content', '')
    operation = input_data.get('operation', 'unknown')

    log_info(f"파일: {file_path}")
    log_info(f"작업: {operation}")

    # 리뷰 기준 로드
    criteria = load_criteria()

    # 예외 확인
    if is_excluded(file_path, criteria):
        log_info("제외된 파일, 검증 생략")
        sys.exit(0)

    # 적용할 검증 목록
    checks_to_run = get_file_checks(file_path, criteria, 'pre-file-write')

    if not checks_to_run:
        log_info("적용할 검증 없음")
        sys.exit(0)

    log_info(f"검증 항목: {', '.join(checks_to_run)}")
    print()

    # 검증 실행
    results: List[CheckResult] = []

    check_functions = {
        'type_safety': lambda: check_type_safety(file_path),
        'linting': lambda: check_linting(file_path),
        'security': lambda: check_security(file_path),
        'documentation': lambda: check_documentation(file_path, content)
    }

    for check_name in checks_to_run:
        if check_name in check_functions:
            log_info(f"실행 중: {check_name}...")
            result = check_functions[check_name]()
            results.append(result)

            # 결과 출력
            if result.passed:
                log_success(f"{result.message} ({result.duration:.2f}초)")
            elif result.severity == Severity.ERROR:
                log_error(f"{result.message} ({result.duration:.2f}초)")
                if result.details:
                    print(result.details[:500])  # 처음 500자만
            elif result.severity == Severity.WARNING:
                log_warning(f"{result.message} ({result.duration:.2f}초)")
                if result.details:
                    print(result.details[:500])

            print()

    # 결과 집계
    total_checks = len(results)
    passed_checks = sum(1 for r in results if r.passed)
    error_checks = [r for r in results if not r.passed and r.severity == Severity.ERROR]
    warning_checks = [r for r in results if not r.passed and r.severity == Severity.WARNING]

    total_duration = sum(r.duration for r in results)

    # 요약 출력
    print()
    log_info("=" * 60)
    log_info("검증 결과 요약")
    log_info("=" * 60)
    print(f"총 검증: {total_checks}개")
    print(f"통과: {passed_checks}개")
    print(f"실패(에러): {len(error_checks)}개")
    print(f"실패(경고): {len(warning_checks)}개")
    print(f"총 소요 시간: {total_duration:.2f}초")
    print()

    # 최종 판단
    if error_checks:
        log_error("필수 검증 실패, 파일 저장 중단")
        for check in error_checks:
            print(f"  - {check.message}")
        sys.exit(1)
    elif warning_checks:
        log_warning("일부 권장 검증 실패, 파일 저장 계속")
        for check in warning_checks:
            print(f"  - {check.message}")
        sys.exit(2)
    else:
        log_success("모든 검증 통과")
        sys.exit(0)

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print()
        log_warning("사용자가 중단함")
        sys.exit(1)
    except Exception as e:
        log_error(f"예기치 않은 오류: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
```

실행 권한 부여:

```bash
chmod +x .claude/hooks/comprehensive-review.py
```

#### Hook 테스트 스크립트

`.claude/scripts/test-hook.sh`:

```bash
#!/bin/bash
# Hook 스크립트를 안전하게 테스트

HOOK_NAME=${1:-pre-file-write}
TEST_FILE=${2:-src/test.ts}

echo "🧪 Hook 테스트 시작"
echo "Hook: $HOOK_NAME"
echo "테스트 파일: $TEST_FILE"
echo ""

# 테스트 입력 데이터 생성
TEST_INPUT=$(cat <<EOF
{
  "file_path": "$TEST_FILE",
  "operation": "write",
  "content": "// test content\nconst x: number = 42;",
  "metadata": {
    "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  }
}
EOF
)

# Hook 실행
HOOK_SCRIPT=".claude/hooks/$HOOK_NAME.sh"

if [ ! -f "$HOOK_SCRIPT" ]; then
    # Python 버전 시도
    HOOK_SCRIPT=".claude/hooks/$HOOK_NAME.py"
fi

if [ ! -f "$HOOK_SCRIPT" ]; then
    echo "❌ Hook 스크립트를 찾을 수 없음: $HOOK_NAME"
    exit 1
fi

echo "$TEST_INPUT" | "$HOOK_SCRIPT"
EXIT_CODE=$?

echo ""
echo "종료 코드: $EXIT_CODE"

case $EXIT_CODE in
    0)
        echo "✅ 검증 성공"
        ;;
    1)
        echo "❌ 검증 실패 (블로킹)"
        ;;
    2)
        echo "⚠️  검증 경고"
        ;;
    *)
        echo "❓ 알 수 없는 종료 코드"
        ;;
esac
```

실행:

```bash
chmod +x .claude/scripts/test-hook.sh
.claude/scripts/test-hook.sh pre-file-write src/app.ts
```

### 설명 (Explanation)

#### Bash vs Python: 어떤 것을 선택할까?

**Bash를 선택하는 경우:**

- 간단한 검증 로직
- 시스템 명령어 조합이 주된 작업
- 빠른 실행 속도 필요
- 외부 의존성 최소화

**Python을 선택하는 경우:**

- 복잡한 로직과 데이터 처리
- 타입 안전성과 가독성 중시
- 외부 라이브러리 활용 필요
- 테스트 및 유지보수 용이성 중시

실전에서는 간단한 Hook은 Bash로, 복잡한 종합 검증은 Python으로 작성하는 것을 권장합니다.

#### 종료 코드 전략

Hook의 종료 코드는 Claude의 동작을 직접 제어합니다:

```python
# 필수 검증 실패 → 작업 중단
if critical_check_failed:
    sys.exit(1)

# 권장 검증 실패 → 경고하되 계속
if recommended_check_failed:
    sys.exit(2)

# 모두 통과 → 정상 진행
sys.exit(0)
```

이 설계를 통해 개발자는 중요도에 따라 검증을 구분하고, 워크플로우를 유연하게 제어할 수 있습니다.

#### 성능 최적화 기법

Hook이 느리면 개발 경험이 저하됩니다. 다음 기법으로 성능을 최적화하세요:

1. **타임아웃 설정**: 검증이 너무 오래 걸리면 중단
2. **병렬 실행**: 독립적인 검증을 동시에 실행
3. **캐싱**: 동일한 콘텐츠는 재검증 생략
4. **조건부 실행**: 파일 타입에 따라 필요한 검증만 실행

### 변형 (Variations)

#### 변형 1: 병렬 검증 실행

```python
#!/usr/bin/env python3
"""병렬 검증으로 성능 향상"""

import concurrent.futures
import time

def parallel_checks(file_path: str, content: str) -> List[CheckResult]:
    """여러 검증을 병렬로 실행"""

    check_functions = [
        lambda: check_type_safety(file_path),
        lambda: check_linting(file_path),
        lambda: check_security(file_path),
        lambda: check_documentation(file_path, content)
    ]

    results = []

    # ThreadPoolExecutor로 병렬 실행
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
        futures = [executor.submit(func) for func in check_functions]

        for future in concurrent.futures.as_completed(futures):
            try:
                result = future.result(timeout=30)
                results.append(result)
            except concurrent.futures.TimeoutError:
                log_warning("검증 타임아웃")
            except Exception as e:
                log_error(f"검증 오류: {e}")

    return results
```

#### 변형 2: 캐싱을 활용한 최적화

```python
#!/usr/bin/env python3
"""콘텐츠 해시 기반 캐싱"""

import hashlib
import pickle
from pathlib import Path

CACHE_DIR = Path('.claude/cache')

def get_content_hash(content: str) -> str:
    """콘텐츠의 SHA256 해시 생성"""
    return hashlib.sha256(content.encode()).hexdigest()

def get_cached_result(content_hash: str, check_name: str) -> Optional[CheckResult]:
    """캐시된 검증 결과 조회"""
    cache_file = CACHE_DIR / f"{content_hash}_{check_name}.pkl"

    if cache_file.exists():
        # 캐시 유효 기간 확인 (1시간)
        cache_age = time.time() - cache_file.stat().st_mtime
        if cache_age < 3600:
            with open(cache_file, 'rb') as f:
                return pickle.load(f)

    return None

def save_cached_result(content_hash: str, check_name: str, result: CheckResult):
    """검증 결과 캐싱"""
    CACHE_DIR.mkdir(exist_ok=True)
    cache_file = CACHE_DIR / f"{content_hash}_{check_name}.pkl"

    with open(cache_file, 'wb') as f:
        pickle.dump(result, f)

def cached_check(check_func, content: str, check_name: str) -> CheckResult:
    """캐싱을 적용한 검증 실행"""
    content_hash = get_content_hash(content)

    # 캐시 확인
    cached = get_cached_result(content_hash, check_name)
    if cached:
        log_info(f"캐시 적중: {check_name}")
        return cached

    # 실제 검증 수행
    result = check_func()

    # 결과 캐싱
    save_cached_result(content_hash, check_name, result)

    return result
```

#### 변형 3: 점진적 Hook 도입

```bash
#!/bin/bash
# Phase별 점진적 Hook 활성화

PHASE=${HOOK_PHASE:-1}

echo "Hook Phase: $PHASE"

case $PHASE in
    1)
        # Phase 1: 비파괴적 Hook (정보만 제공)
        echo "ℹ️  코드 포맷팅 권장"
        echo "ℹ️  감사 로그 기록됨"
        exit 0
        ;;

    2)
        # Phase 2: 경고 수준 Hook
        npx eslint "$file_path" || true
        echo "⚠️  린팅 문제 발견 (계속 진행)"
        exit 2
        ;;

    3)
        # Phase 3: 블로킹 Hook
        npx tsc --noEmit "$file_path"

        if [ $? -ne 0 ]; then
            echo "❌ 타입 체크 실패, 작업 중단"
            exit 1
        fi

        exit 0
        ;;

    *)
        echo "❌ 잘못된 HOOK_PHASE 값: $PHASE"
        exit 1
        ;;
esac
```

사용:

```bash
# Phase 1 (비파괴적)
HOOK_PHASE=1 .claude/hooks/pre-file-write.sh

# Phase 2 (경고)
HOOK_PHASE=2 .claude/hooks/pre-file-write.sh

# Phase 3 (블로킹)
HOOK_PHASE=3 .claude/hooks/pre-file-write.sh
```

---

## Recipe 17.3: GitHub Actions 통합

### 문제 (Problem)

로컬 Hook만으로는 코드 품질을 완전히 보장할 수 없습니다. 개발자가 Hook을 비활성화하거나, 로컬 환경 설정이 다르거나, PR 리뷰 시점에 추가 검증이 필요할 수 있습니다. CI/CD 파이프라인에서도 동일한 검증을 실행하여 "이중 안전장치(double safety net)"를 구축해야 합니다.

하지만 GitHub Actions와 Claude Hook을 통합할 때 다음 문제가 발생합니다:

- Claude Hook은 stdin으로 JSON을 받는데, GitHub Actions에서 어떻게 호출하는가?
- 변경된 파일만 검증하려면 어떻게 하는가?
- 검증 실패 시 PR을 자동으로 차단하려면?
- 검증 결과를 PR 코멘트로 표시하려면?

### 해결책 (Solution)

GitHub Actions 워크플로우를 다음 단계로 구성합니다:

**1단계: 변경된 파일 감지**

PR의 변경 파일 목록을 추출합니다.

**2단계: Hook 실행**

각 파일에 대해 Hook 스크립트를 호출하고 결과를 수집합니다.

**3단계: 결과 리포팅**

검증 결과를 PR 코멘트로 게시하거나, GitHub Check API로 상태를 업데이트합니다.

**4단계: 실패 시 PR 차단**

필수 검증이 실패하면 PR 머지를 차단합니다.

### 코드/예시 (Code)

#### GitHub Actions 워크플로우

`.github/workflows/claude-hooks.yml`:

```yaml
name: Claude Code Hooks CI

on:
  pull_request:
    types: [opened, synchronize, reopened]
  push:
    branches:
      - main
      - develop

jobs:
  run-hooks:
    name: Run Claude Code Hooks
    runs-on: ubuntu-latest

    permissions:
      contents: read
      pull-requests: write  # PR 코멘트 작성 권한
      checks: write         # Check API 사용 권한

    steps:
      # 1. 체크아웃
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0  # 전체 히스토리 (git diff를 위해)

      # 2. Node.js 설정
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      # 3. Python 설정
      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'

      # 4. 의존성 설치
      - name: Install dependencies
        run: |
          npm ci
          pip install -r .claude/requirements.txt || true

      # 5. Hook 스크립트 실행 권한 부여
      - name: Make hooks executable
        run: |
          chmod +x .claude/hooks/*.sh || true
          chmod +x .claude/hooks/*.py || true
          chmod +x .claude/scripts/*.sh || true

      # 6. 변경된 파일 감지
      - name: Get changed files
        id: changed-files
        uses: tj-actions/changed-files@v41
        with:
          files: |
            src/**
            !src/**/*.test.ts
            !src/**/*.spec.ts

      # 7. Hook 실행
      - name: Run pre-commit hooks
        id: run-hooks
        run: |
          echo "Running hooks on changed files..."

          # 결과 저장 디렉토리
          mkdir -p .claude/ci-results

          # 전체 결과 초기화
          OVERALL_EXIT_CODE=0

          # 변경된 파일에 대해 Hook 실행
          for file in ${{ steps.changed-files.outputs.all_changed_files }}; do
            echo "Checking: $file"

            # JSON 입력 생성
            INPUT_JSON=$(cat <<EOF
          {
            "file_path": "$file",
            "operation": "write",
            "content": "$(cat $file | base64)",
            "metadata": {
              "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
              "ci": true,
              "pr_number": "${{ github.event.pull_request.number }}"
            }
          }
          EOF
          )

            # Hook 실행 (Python 버전)
            if [ -f ".claude/hooks/comprehensive-review.py" ]; then
              echo "$INPUT_JSON" | .claude/hooks/comprehensive-review.py > ".claude/ci-results/$file.log" 2>&1
              FILE_EXIT_CODE=$?
            elif [ -f ".claude/hooks/pre-file-write.sh" ]; then
              echo "$INPUT_JSON" | .claude/hooks/pre-file-write.sh > ".claude/ci-results/$file.log" 2>&1
              FILE_EXIT_CODE=$?
            else
              echo "No hook script found"
              FILE_EXIT_CODE=0
            fi

            echo "Exit code for $file: $FILE_EXIT_CODE"

            # 에러 발생 시 전체 실패 표시
            if [ $FILE_EXIT_CODE -eq 1 ]; then
              OVERALL_EXIT_CODE=1
            fi
          done

          # 전체 결과 출력
          echo "overall_exit_code=$OVERALL_EXIT_CODE" >> $GITHUB_OUTPUT

          exit $OVERALL_EXIT_CODE
        continue-on-error: true

      # 8. 결과 요약 생성
      - name: Generate summary
        if: always()
        run: |
          echo "# 🔍 Claude Code Hooks 검증 결과" >> $GITHUB_STEP_SUMMARY
          echo "" >> $GITHUB_STEP_SUMMARY

          if [ -d ".claude/ci-results" ]; then
            for log_file in .claude/ci-results/*.log; do
              if [ -f "$log_file" ]; then
                echo "## $(basename $log_file .log)" >> $GITHUB_STEP_SUMMARY
                echo '```' >> $GITHUB_STEP_SUMMARY
                tail -n 20 "$log_file" >> $GITHUB_STEP_SUMMARY
                echo '```' >> $GITHUB_STEP_SUMMARY
                echo "" >> $GITHUB_STEP_SUMMARY
              fi
            done
          fi

          if [ "${{ steps.run-hooks.outputs.overall_exit_code }}" -eq "0" ]; then
            echo "✅ **모든 검증 통과**" >> $GITHUB_STEP_SUMMARY
          else
            echo "❌ **일부 검증 실패**" >> $GITHUB_STEP_SUMMARY
          fi

      # 9. PR 코멘트 작성
      - name: Comment on PR
        if: github.event_name == 'pull_request' && always()
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const exitCode = '${{ steps.run-hooks.outputs.overall_exit_code }}';

            let comment = '## 🔍 Claude Code Hooks 검증 결과\n\n';

            if (exitCode === '0') {
              comment += '✅ **모든 검증 통과**\n\n';
            } else {
              comment += '❌ **일부 검증 실패**\n\n';
            }

            comment += '### 검증 로그\n\n';

            // 로그 파일 읽기
            const logDir = '.claude/ci-results';
            if (fs.existsSync(logDir)) {
              const logFiles = fs.readdirSync(logDir);

              for (const logFile of logFiles) {
                const logPath = `${logDir}/${logFile}`;
                const logContent = fs.readFileSync(logPath, 'utf8');

                comment += `<details>\n<summary>${logFile}</summary>\n\n`;
                comment += '```\n';
                comment += logContent.slice(-1000);  // 마지막 1000자만
                comment += '\n```\n</details>\n\n';
              }
            }

            // PR 코멘트 작성
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: comment
            });

      # 10. 실패 시 워크플로우 종료
      - name: Fail if hooks failed
        if: steps.run-hooks.outputs.overall_exit_code != '0'
        run: |
          echo "❌ Hook 검증 실패, PR 머지 차단"
          exit 1
```

#### 로컬 Hook과 CI Hook 동기화

`.claude/scripts/sync-ci-hooks.sh`:

```bash
#!/bin/bash
# 로컬 Hook과 CI Hook의 설정을 동기화

echo "🔄 Hook 설정 동기화 중..."

# 1. 리뷰 기준 검증
if [ -f ".claude/review-criteria.json" ]; then
    echo "✅ 리뷰 기준 파일 존재"

    # JSON 유효성 검증
    if jq empty .claude/review-criteria.json 2>/dev/null; then
        echo "✅ JSON 유효성 검증 통과"
    else
        echo "❌ JSON 유효성 검증 실패"
        exit 1
    fi
else
    echo "❌ 리뷰 기준 파일 없음"
    exit 1
fi

# 2. Hook 스크립트 존재 확인
REQUIRED_HOOKS=(
    ".claude/hooks/pre-file-write.sh"
    ".claude/hooks/comprehensive-review.py"
)

for hook in "${REQUIRED_HOOKS[@]}"; do
    if [ -f "$hook" ]; then
        echo "✅ $hook 존재"

        # 실행 권한 확인
        if [ -x "$hook" ]; then
            echo "✅ $hook 실행 가능"
        else
            echo "⚠️  $hook 실행 권한 없음, 부여 중..."
            chmod +x "$hook"
        fi
    else
        echo "⚠️  $hook 없음 (선택 사항)"
    fi
done

# 3. GitHub Actions 워크플로우 검증
if [ -f ".github/workflows/claude-hooks.yml" ]; then
    echo "✅ GitHub Actions 워크플로우 존재"
else
    echo "⚠️  GitHub Actions 워크플로우 없음"
fi

# 4. 의존성 확인
echo ""
echo "의존성 확인:"

# jq
if command -v jq &> /dev/null; then
    echo "✅ jq 설치됨"
else
    echo "❌ jq 미설치 (설치: brew install jq)"
fi

# Node.js
if command -v node &> /dev/null; then
    echo "✅ Node.js $(node --version)"
else
    echo "❌ Node.js 미설치"
fi

# Python
if command -v python3 &> /dev/null; then
    echo "✅ Python $(python3 --version)"
else
    echo "❌ Python 미설치"
fi

echo ""
echo "✅ 동기화 완료"
```

실행:

```bash
chmod +x .claude/scripts/sync-ci-hooks.sh
.claude/scripts/sync-ci-hooks.sh
```

#### CI 전용 Hook 설정

`.claude/ci-config.json`:

```json
{
  "ci_mode": true,
  "strict": true,
  "timeout": 300,
  "parallel": true,
  "notifications": {
    "slack_webhook": "${SLACK_WEBHOOK_URL}",
    "email": "${NOTIFICATION_EMAIL}"
  },
  "overrides": {
    "test_coverage_threshold": 80,
    "performance_budget": {
      "bundle_size_kb": 500,
      "lighthouse_score": 90
    }
  },
  "exclude_paths": [
    "docs/**",
    "examples/**",
    "*.md"
  ]
}
```

CI 모드로 Hook 실행:

```python
#!/usr/bin/env python3
"""CI 전용 설정을 적용한 Hook"""

import os
import json

# CI 모드 감지
IS_CI = os.environ.get('CI', 'false') == 'true'

if IS_CI:
    # CI 설정 로드
    with open('.claude/ci-config.json') as f:
        ci_config = json.load(f)

    # Strict 모드: 모든 경고를 에러로 처리
    if ci_config.get('strict'):
        log_warning("CI Strict 모드: 모든 경고를 에러로 처리")
        # warning_checks를 error_checks로 변환
```

### 설명 (Explanation)

#### GitHub Actions의 장점

1. **일관된 환경**: 모든 PR에서 동일한 검증 환경 보장
2. **강제성**: 로컬 Hook을 우회해도 CI에서 검증
3. **투명성**: 모든 검증 결과가 PR에 공개적으로 표시
4. **자동화**: 수동 코드 리뷰 전에 자동으로 검증

#### changed-files 액션의 역할

`tj-actions/changed-files`는 PR의 변경 파일만 추출하여 검증 시간을 단축합니다:

```yaml
- name: Get changed files
  id: changed-files
  uses: tj-actions/changed-files@v41
  with:
    files: |
      src/**           # src 디렉토리만
      !src/**/*.test.ts  # 테스트 파일 제외
```

이를 통해 수천 개의 파일이 있는 모노레포에서도 빠르게 검증할 수 있습니다.

#### PR 코멘트 vs GitHub Check API

**PR 코멘트:**
- 장점: 간단하고 가시성이 높음
- 단점: PR이 코멘트로 가득 차면 노이즈

**GitHub Check API:**
- 장점: 깔끔하고 구조화된 UI
- 단점: 설정이 복잡함

실전에서는 두 방식을 병행하는 것을 권장합니다. 요약은 Check API로, 상세 내용은 필요 시 코멘트로 제공합니다.

### 변형 (Variations)

#### 변형 1: 병렬 실행으로 성능 향상

```yaml
jobs:
  run-hooks:
    strategy:
      matrix:
        file-group: [frontend, backend, infra]

    steps:
      - name: Run hooks for ${{ matrix.file-group }}
        run: |
          case "${{ matrix.file-group }}" in
            frontend)
              FILES="src/frontend/**"
              ;;
            backend)
              FILES="src/backend/**"
              ;;
            infra)
              FILES="infrastructure/**"
              ;;
          esac

          # 해당 그룹 파일만 검증
          for file in $FILES; do
            echo "$INPUT_JSON" | .claude/hooks/pre-commit.sh
          done
```

#### 변형 2: Slack 알림 통합

```yaml
- name: Notify Slack
  if: failure()
  uses: slackapi/slack-github-action@v1
  with:
    webhook-url: ${{ secrets.SLACK_WEBHOOK_URL }}
    payload: |
      {
        "text": "❌ PR #${{ github.event.pull_request.number }} 검증 실패",
        "blocks": [
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "*PR*: <${{ github.event.pull_request.html_url }}|#${{ github.event.pull_request.number }}>\n*Author*: ${{ github.event.pull_request.user.login }}"
            }
          }
        ]
      }
```

#### 변형 3: 자동 수정 제안

```yaml
- name: Auto-fix issues
  if: steps.run-hooks.outputs.overall_exit_code != '0'
  run: |
    # ESLint 자동 수정
    npx eslint --fix ${{ steps.changed-files.outputs.all_changed_files }}

    # Prettier 포맷팅
    npx prettier --write ${{ steps.changed-files.outputs.all_changed_files }}

    # 변경 사항 커밋
    git config user.name "Claude Code Bot"
    git config user.email "bot@claudecode.dev"
    git add .
    git commit -m "chore: auto-fix code issues"
    git push
```

---

## Recipe 17.4: 피드백 루프 구현

### 문제 (Problem)

Hook 시스템을 구축했다면, 이제 검증 결과를 효과적으로 팀에 전달하고 지속적으로 개선해야 합니다. 하지만 많은 팀이 다음 문제를 겪습니다:

- 검증 실패가 너무 자주 발생하여 개발자가 무시하게 됨
- 실패 원인과 해결 방법이 불명확하여 생산성 저하
- 검증 결과 데이터를 수집하지 않아 개선 근거 부족
- 팀원들이 Hook 시스템의 가치를 이해하지 못함

효과적인 피드백 루프를 구현하려면 다음이 필요합니다:

1. **명확한 오류 메시지**: 무엇이 잘못되었고 어떻게 고치는가?
2. **적절한 알림**: 팀에 과부하를 주지 않으면서 중요한 정보 전달
3. **데이터 기반 개선**: 검증 실패 통계를 추적하여 문제 패턴 파악
4. **문서화와 교육**: 팀원들이 Hook 시스템을 이해하고 활용

### 해결책 (Solution)

피드백 루프를 다음 4가지 요소로 구성합니다:

**1. 구조화된 오류 리포팅**

검증 실패 시 원인, 영향, 해결 방법을 명확히 제시합니다.

**2. 다채널 알림 시스템**

Slack, 이메일, PR 코멘트 등 다양한 채널로 결과를 전달합니다.

**3. 메트릭 수집 및 분석**

검증 실패율, 실행 시간, 자주 실패하는 규칙 등을 추적합니다.

**4. 지속적 개선 프로세스**

정기적으로 Hook 성능과 유효성을 검토하고 업데이트합니다.

### 코드/예시 (Code)

#### 구조화된 오류 리포팅

`.claude/hooks/error-reporter.py`:

```python
#!/usr/bin/env python3
"""구조화된 오류 리포팅 시스템"""

from dataclasses import dataclass
from typing import Optional, List
from enum import Enum

class ErrorSeverity(Enum):
    CRITICAL = "critical"  # 즉시 수정 필요
    HIGH = "high"          # 빠른 시일 내 수정
    MEDIUM = "medium"      # 다음 스프린트에 수정
    LOW = "low"            # 시간 날 때 수정

@dataclass
class ErrorReport:
    """구조화된 오류 보고서"""

    # 기본 정보
    check_name: str
    file_path: str
    severity: ErrorSeverity

    # 오류 설명
    summary: str
    details: str

    # 해결 방법
    fix_suggestion: str
    documentation_url: Optional[str] = None

    # 코드 위치
    line_number: Optional[int] = None
    column_number: Optional[int] = None
    code_snippet: Optional[str] = None

    # 메타데이터
    rule_id: Optional[str] = None
    tags: List[str] = None

    def to_markdown(self) -> str:
        """마크다운 형식으로 변환"""

        severity_emoji = {
            ErrorSeverity.CRITICAL: "🔴",
            ErrorSeverity.HIGH: "🟠",
            ErrorSeverity.MEDIUM: "🟡",
            ErrorSeverity.LOW: "🟢"
        }

        md = f"### {severity_emoji[self.severity]} {self.summary}\n\n"

        md += f"**파일**: `{self.file_path}`\n"

        if self.line_number:
            md += f"**위치**: 라인 {self.line_number}"
            if self.column_number:
                md += f", 컬럼 {self.column_number}"
            md += "\n"

        md += f"\n**문제**: {self.details}\n\n"

        if self.code_snippet:
            md += f"**코드**:\n```\n{self.code_snippet}\n```\n\n"

        md += f"**해결 방법**: {self.fix_suggestion}\n\n"

        if self.documentation_url:
            md += f"📚 [자세한 문서]({self.documentation_url})\n\n"

        if self.tags:
            md += f"🏷️ Tags: {', '.join(self.tags)}\n\n"

        return md

    def to_json(self) -> dict:
        """JSON 형식으로 변환 (메트릭 수집용)"""
        return {
            'check_name': self.check_name,
            'file_path': self.file_path,
            'severity': self.severity.value,
            'summary': self.summary,
            'details': self.details,
            'line_number': self.line_number,
            'column_number': self.column_number,
            'rule_id': self.rule_id,
            'tags': self.tags or []
        }

def create_type_error_report(file_path: str, error_output: str) -> ErrorReport:
    """TypeScript 타입 오류 보고서 생성"""

    # 에러 파싱 (간단한 예제)
    lines = error_output.split('\n')
    first_error = lines[0] if lines else ""

    return ErrorReport(
        check_name="type_safety",
        file_path=file_path,
        severity=ErrorSeverity.HIGH,
        summary="TypeScript 타입 오류",
        details=first_error,
        fix_suggestion="타입 정의를 확인하고 올바른 타입을 할당하세요. "
                      "`any` 타입 사용을 피하고 명시적 타입 어노테이션을 추가하세요.",
        documentation_url="https://www.typescriptlang.org/docs/handbook/2/everyday-types.html",
        rule_id="TS2322",
        tags=["typescript", "type-safety"]
    )

def create_linting_error_report(file_path: str, eslint_output: str) -> List[ErrorReport]:
    """ESLint 오류 보고서 생성"""

    reports = []

    # ESLint JSON 출력 파싱
    import json
    try:
        results = json.loads(eslint_output)

        for file_result in results:
            for message in file_result.get('messages', []):
                severity = (ErrorSeverity.HIGH if message['severity'] == 2
                           else ErrorSeverity.MEDIUM)

                report = ErrorReport(
                    check_name="linting",
                    file_path=file_result['filePath'],
                    severity=severity,
                    summary=message['message'],
                    details=f"규칙: {message['ruleId']}",
                    fix_suggestion=message.get('fix', {}).get('text', '자동 수정 불가'),
                    line_number=message['line'],
                    column_number=message['column'],
                    rule_id=message['ruleId'],
                    tags=["eslint", "code-quality"]
                )
                reports.append(report)

    except json.JSONDecodeError:
        # JSON 파싱 실패 시 기본 보고서
        reports.append(ErrorReport(
            check_name="linting",
            file_path=file_path,
            severity=ErrorSeverity.MEDIUM,
            summary="린팅 오류",
            details=eslint_output[:200],
            fix_suggestion="ESLint 규칙을 확인하고 코드를 수정하세요.",
            tags=["eslint"]
        ))

    return reports
```

#### 다채널 알림 시스템

`.claude/hooks/notifier.py`:

```python
#!/usr/bin/env python3
"""다채널 알림 시스템"""

import os
import json
import requests
from typing import List
from error_reporter import ErrorReport, ErrorSeverity

class Notifier:
    """통합 알림 시스템"""

    def __init__(self):
        self.slack_webhook = os.environ.get('SLACK_WEBHOOK_URL')
        self.email_api = os.environ.get('EMAIL_API_URL')
        self.telegram_token = os.environ.get('TELEGRAM_BOT_TOKEN')
        self.telegram_chat_id = os.environ.get('TELEGRAM_CHAT_ID')

    def notify_all(self, reports: List[ErrorReport], context: dict):
        """모든 채널로 알림 전송"""

        # 심각도 필터링
        critical_reports = [r for r in reports
                           if r.severity == ErrorSeverity.CRITICAL]

        if critical_reports:
            # 크리티컬 오류는 모든 채널로
            self.notify_slack(critical_reports, context)
            self.notify_telegram(critical_reports, context)
        elif reports:
            # 일반 오류는 Slack만
            self.notify_slack(reports, context)

    def notify_slack(self, reports: List[ErrorReport], context: dict):
        """Slack 알림"""

        if not self.slack_webhook:
            return

        # Slack 메시지 생성
        blocks = [
            {
                "type": "header",
                "text": {
                    "type": "plain_text",
                    "text": "🔍 Claude Code Hooks 검증 결과"
                }
            },
            {
                "type": "section",
                "fields": [
                    {
                        "type": "mrkdwn",
                        "text": f"*파일*:\n{context.get('file_path', 'N/A')}"
                    },
                    {
                        "type": "mrkdwn",
                        "text": f"*오류 수*:\n{len(reports)}개"
                    }
                ]
            },
            {
                "type": "divider"
            }
        ]

        # 각 오류를 섹션으로 추가
        for report in reports[:5]:  # 최대 5개만
            blocks.append({
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": f"*{report.summary}*\n{report.details}"
                }
            })

        if len(reports) > 5:
            blocks.append({
                "type": "context",
                "elements": [
                    {
                        "type": "mrkdwn",
                        "text": f"외 {len(reports) - 5}개 오류..."
                    }
                ]
            })

        # Slack 전송
        try:
            response = requests.post(
                self.slack_webhook,
                json={'blocks': blocks},
                timeout=10
            )
            response.raise_for_status()
        except Exception as e:
            print(f"Slack 알림 실패: {e}")

    def notify_telegram(self, reports: List[ErrorReport], context: dict):
        """Telegram 알림"""

        if not self.telegram_token or not self.telegram_chat_id:
            return

        # Telegram 메시지 생성
        message = "🔍 *Claude Code Hooks 크리티컬 오류*\n\n"
        message += f"파일: `{context.get('file_path', 'N/A')}`\n"
        message += f"오류 수: {len(reports)}개\n\n"

        for report in reports[:3]:
            message += f"❌ *{report.summary}*\n"
            message += f"{report.details[:100]}...\n\n"

        # Telegram 전송
        url = f"https://api.telegram.org/bot{self.telegram_token}/sendMessage"

        try:
            response = requests.post(
                url,
                json={
                    'chat_id': self.telegram_chat_id,
                    'text': message,
                    'parse_mode': 'Markdown'
                },
                timeout=10
            )
            response.raise_for_status()
        except Exception as e:
            print(f"Telegram 알림 실패: {e}")

    def notify_pr_comment(self, reports: List[ErrorReport], pr_number: int):
        """GitHub PR 코멘트 작성"""

        # GitHub API를 통한 코멘트 (별도 구현 필요)
        pass

# 사용 예제
if __name__ == '__main__':
    # 예제 오류 보고서
    report = ErrorReport(
        check_name="type_safety",
        file_path="src/app.ts",
        severity=ErrorSeverity.CRITICAL,
        summary="타입 불일치",
        details="number 타입에 string 할당 불가",
        fix_suggestion="타입을 number로 변경하세요"
    )

    notifier = Notifier()
    notifier.notify_all([report], {'file_path': 'src/app.ts'})
```

#### 메트릭 수집 및 분석

`.claude/hooks/metrics-collector.py`:

```python
#!/usr/bin/env python3
"""검증 메트릭 수집 및 분석"""

import json
import time
from pathlib import Path
from datetime import datetime, timedelta
from typing import Dict, List
from collections import defaultdict

METRICS_DIR = Path('.claude/metrics')
METRICS_DIR.mkdir(parents=True, exist_ok=True)

class MetricsCollector:
    """메트릭 수집기"""

    def __init__(self):
        self.metrics_file = METRICS_DIR / f"{datetime.now().strftime('%Y-%m')}.jsonl"

    def record_check(self, check_name: str, file_path: str,
                     passed: bool, duration: float,
                     severity: str, details: dict = None):
        """검증 결과 기록"""

        entry = {
            'timestamp': datetime.utcnow().isoformat(),
            'check_name': check_name,
            'file_path': file_path,
            'passed': passed,
            'duration': duration,
            'severity': severity,
            'details': details or {}
        }

        # JSONL 형식으로 추가
        with open(self.metrics_file, 'a') as f:
            f.write(json.dumps(entry) + '\n')

    def get_stats(self, days: int = 7) -> Dict:
        """최근 N일간 통계"""

        cutoff = datetime.utcnow() - timedelta(days=days)

        stats = {
            'total_checks': 0,
            'passed_checks': 0,
            'failed_checks': 0,
            'by_check_name': defaultdict(lambda: {'total': 0, 'passed': 0}),
            'by_file_type': defaultdict(lambda: {'total': 0, 'passed': 0}),
            'avg_duration': [],
            'failure_rate': 0.0
        }

        # 모든 메트릭 파일 읽기
        for metrics_file in METRICS_DIR.glob('*.jsonl'):
            with open(metrics_file) as f:
                for line in f:
                    entry = json.loads(line)

                    # 날짜 필터링
                    timestamp = datetime.fromisoformat(entry['timestamp'])
                    if timestamp < cutoff:
                        continue

                    # 통계 집계
                    stats['total_checks'] += 1

                    if entry['passed']:
                        stats['passed_checks'] += 1
                    else:
                        stats['failed_checks'] += 1

                    # 검증 타입별
                    check_name = entry['check_name']
                    stats['by_check_name'][check_name]['total'] += 1
                    if entry['passed']:
                        stats['by_check_name'][check_name]['passed'] += 1

                    # 파일 타입별
                    file_ext = Path(entry['file_path']).suffix
                    stats['by_file_type'][file_ext]['total'] += 1
                    if entry['passed']:
                        stats['by_file_type'][file_ext]['passed'] += 1

                    # 실행 시간
                    stats['avg_duration'].append(entry['duration'])

        # 실패율 계산
        if stats['total_checks'] > 0:
            stats['failure_rate'] = stats['failed_checks'] / stats['total_checks']

        # 평균 실행 시간
        if stats['avg_duration']:
            stats['avg_duration'] = sum(stats['avg_duration']) / len(stats['avg_duration'])
        else:
            stats['avg_duration'] = 0.0

        return stats

    def generate_report(self, days: int = 7) -> str:
        """통계 리포트 생성"""

        stats = self.get_stats(days)

        report = f"# Claude Code Hooks 메트릭 리포트 ({days}일간)\n\n"

        # 전체 통계
        report += "## 전체 통계\n\n"
        report += f"- 총 검증: {stats['total_checks']}회\n"
        report += f"- 통과: {stats['passed_checks']}회\n"
        report += f"- 실패: {stats['failed_checks']}회\n"
        report += f"- 실패율: {stats['failure_rate']:.1%}\n"
        report += f"- 평균 실행 시간: {stats['avg_duration']:.2f}초\n\n"

        # 검증 타입별 통계
        report += "## 검증 타입별 통계\n\n"
        report += "| 검증 | 총 실행 | 통과 | 실패율 |\n"
        report += "|------|---------|------|--------|\n"

        for check_name, check_stats in sorted(stats['by_check_name'].items()):
            total = check_stats['total']
            passed = check_stats['passed']
            failed = total - passed
            failure_rate = (failed / total) if total > 0 else 0

            report += f"| {check_name} | {total} | {passed} | {failure_rate:.1%} |\n"

        report += "\n"

        # 파일 타입별 통계
        report += "## 파일 타입별 통계\n\n"
        report += "| 확장자 | 총 검증 | 통과 | 실패율 |\n"
        report += "|--------|---------|------|--------|\n"

        for file_ext, file_stats in sorted(stats['by_file_type'].items()):
            total = file_stats['total']
            passed = file_stats['passed']
            failed = total - passed
            failure_rate = (failed / total) if total > 0 else 0

            report += f"| {file_ext or '(없음)'} | {total} | {passed} | {failure_rate:.1%} |\n"

        return report

# 사용 예제
if __name__ == '__main__':
    collector = MetricsCollector()

    # 통계 조회
    stats = collector.get_stats(days=30)
    print(json.dumps(stats, indent=2, default=str))

    # 리포트 생성
    report = collector.generate_report(days=30)
    print(report)
```

#### 대시보드 (HTML)

`.claude/scripts/generate-dashboard.py`:

```python
#!/usr/bin/env python3
"""메트릭 대시보드 생성"""

from metrics_collector import MetricsCollector

def generate_html_dashboard(days: int = 30) -> str:
    """HTML 대시보드 생성"""

    collector = MetricsCollector()
    stats = collector.get_stats(days)

    html = f"""
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Claude Code Hooks 대시보드</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
        }}
        .header {{
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }}
        .stats-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 20px;
        }}
        .stat-card {{
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }}
        .stat-value {{
            font-size: 32px;
            font-weight: bold;
            color: #333;
        }}
        .stat-label {{
            color: #666;
            margin-top: 8px;
        }}
        .chart-container {{
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            margin-bottom: 20px;
        }}
    </style>
</head>
<body>
    <div class="header">
        <h1>Claude Code Hooks 대시보드</h1>
        <p>최근 {days}일간 검증 통계</p>
    </div>

    <div class="stats-grid">
        <div class="stat-card">
            <div class="stat-value">{stats['total_checks']}</div>
            <div class="stat-label">총 검증</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">{stats['passed_checks']}</div>
            <div class="stat-label">통과</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">{stats['failed_checks']}</div>
            <div class="stat-label">실패</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">{stats['failure_rate']:.1%}</div>
            <div class="stat-label">실패율</div>
        </div>
    </div>

    <div class="chart-container">
        <canvas id="checkTypeChart"></canvas>
    </div>

    <div class="chart-container">
        <canvas id="fileTypeChart"></canvas>
    </div>

    <script>
        // 검증 타입별 차트
        const checkTypeCtx = document.getElementById('checkTypeChart').getContext('2d');
        new Chart(checkTypeCtx, {{
            type: 'bar',
            data: {{
                labels: {list(stats['by_check_name'].keys())},
                datasets: [{{
                    label: '통과',
                    data: {[v['passed'] for v in stats['by_check_name'].values()]},
                    backgroundColor: 'rgba(75, 192, 192, 0.6)'
                }}, {{
                    label: '실패',
                    data: {[v['total'] - v['passed'] for v in stats['by_check_name'].values()]},
                    backgroundColor: 'rgba(255, 99, 132, 0.6)'
                }}]
            }},
            options: {{
                responsive: true,
                plugins: {{
                    title: {{
                        display: true,
                        text: '검증 타입별 통계'
                    }}
                }}
            }}
        }});

        // 파일 타입별 차트
        const fileTypeCtx = document.getElementById('fileTypeChart').getContext('2d');
        new Chart(fileTypeCtx, {{
            type: 'pie',
            data: {{
                labels: {list(stats['by_file_type'].keys())},
                datasets: [{{
                    data: {[v['total'] for v in stats['by_file_type'].values()]},
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.6)',
                        'rgba(54, 162, 235, 0.6)',
                        'rgba(255, 206, 86, 0.6)',
                        'rgba(75, 192, 192, 0.6)',
                        'rgba(153, 102, 255, 0.6)'
                    ]
                }}]
            }},
            options: {{
                responsive: true,
                plugins: {{
                    title: {{
                        display: true,
                        text: '파일 타입별 검증 분포'
                    }}
                }}
            }}
        }});
    </script>
</body>
</html>
    """

    return html

if __name__ == '__main__':
    html = generate_html_dashboard(days=30)

    with open('.claude/metrics/dashboard.html', 'w') as f:
        f.write(html)

    print("✅ 대시보드 생성: .claude/metrics/dashboard.html")
```

실행:

```bash
python3 .claude/scripts/generate-dashboard.py
open .claude/metrics/dashboard.html  # macOS
```

### 설명 (Explanation)

#### 구조화된 오류 리포팅의 중요성

개발자가 검증 실패를 무시하는 주된 이유는 "무엇을 고쳐야 할지 모르기 때문"입니다. `ErrorReport` 클래스는 다음을 제공합니다:

1. **명확한 문제 설명**: 무엇이 잘못되었는가?
2. **구체적인 해결 방법**: 어떻게 고치는가?
3. **관련 문서**: 더 자세히 알고 싶다면?
4. **코드 위치**: 어디를 수정해야 하는가?

이를 통해 개발자는 검증 실패를 빠르게 이해하고 수정할 수 있습니다.

#### 알림 피로 방지

너무 많은 알림은 오히려 역효과를 냅니다. `Notifier` 클래스는 다음 전략을 사용합니다:

- **심각도 기반 필터링**: CRITICAL 오류만 모든 채널로 전송
- **배치 처리**: 여러 오류를 하나의 메시지로 묶음
- **요약 우선**: 상세 내용은 링크로 제공
- **채널 분리**: 개발자는 Slack, 관리자는 이메일

#### 메트릭의 활용

메트릭을 수집하면 다음을 할 수 있습니다:

1. **문제 패턴 파악**: 어떤 검증이 자주 실패하는가?
2. **성능 최적화**: 어떤 검증이 느린가?
3. **교육 자료 개선**: 어떤 오류가 반복되는가?
4. **ROI 증명**: Hook 시스템이 얼마나 많은 문제를 조기에 발견했는가?

### 변형 (Variations)

#### 변형 1: 자동 티켓 생성

```python
def create_jira_ticket(report: ErrorReport):
    """JIRA 티켓 자동 생성"""

    if report.severity != ErrorSeverity.CRITICAL:
        return  # CRITICAL만 티켓 생성

    jira_api = os.environ.get('JIRA_API_URL')
    jira_token = os.environ.get('JIRA_TOKEN')

    payload = {
        'fields': {
            'project': {'key': 'DEV'},
            'summary': f"[Hook] {report.summary}",
            'description': report.to_markdown(),
            'issuetype': {'name': 'Bug'},
            'priority': {'name': 'High'},
            'labels': report.tags or []
        }
    }

    requests.post(
        f"{jira_api}/rest/api/3/issue",
        headers={'Authorization': f'Bearer {jira_token}'},
        json=payload
    )
```

#### 변형 2: 주간 리포트 자동 발송

```python
#!/usr/bin/env python3
"""주간 메트릭 리포트를 Slack으로 발송"""

import schedule
import time

def send_weekly_report():
    """주간 리포트 생성 및 전송"""

    collector = MetricsCollector()
    report_md = collector.generate_report(days=7)

    # Slack으로 전송
    notifier = Notifier()
    notifier.notify_slack(
        [],
        {
            'title': '주간 Hook 메트릭 리포트',
            'content': report_md
        }
    )

# 매주 월요일 오전 9시 실행
schedule.every().monday.at("09:00").do(send_weekly_report)

while True:
    schedule.run_pending()
    time.sleep(3600)  # 1시간마다 체크
```

#### 변형 3: A/B 테스트

```python
def ab_test_check(file_path: str, variant: str = 'A'):
    """검증 방법 A/B 테스트"""

    if variant == 'A':
        # 기존 방법: 순차 실행
        results = []
        results.append(check_type_safety(file_path))
        results.append(check_linting(file_path))
    else:
        # 새 방법: 병렬 실행
        results = parallel_checks(file_path, "")

    # 실행 시간 기록
    collector = MetricsCollector()
    collector.record_check(
        check_name=f"ab_test_{variant}",
        file_path=file_path,
        passed=all(r.passed for r in results),
        duration=sum(r.duration for r in results),
        severity='info',
        details={'variant': variant}
    )

    return results
```

---

## 결론

이 장에서는 Hook 기반 코드 리뷰 파이프라인을 구축하는 4가지 핵심 레시피를 다루었습니다:

1. **Recipe 17.1 - 리뷰 기준 정의**: JSON으로 검증 규칙을 구조화하고, 파일 타입별/워크플로우 단계별 매트릭스를 생성하여 일관된 코드 품질 기준을 확립했습니다.

2. **Recipe 17.2 - Hook 스크립트 작성**: Bash와 Python으로 실행 가능한 Hook을 구현하고, 입력 파싱, 검증 로직, 오류 처리, 성능 최적화 기법을 적용했습니다.

3. **Recipe 17.3 - GitHub Actions 통합**: CI/CD 파이프라인과 Hook을 연동하여 로컬과 원격에서 동일한 검증을 실행하고, PR 코멘트와 Check API로 결과를 투명하게 공유했습니다.

4. **Recipe 17.4 - 피드백 루프 구현**: 구조화된 오류 리포팅, 다채널 알림, 메트릭 수집, 대시보드 생성을 통해 지속적으로 개선할 수 있는 시스템을 만들었습니다.

### 핵심 교훈

- **자동화는 일관성의 핵심**: 사람의 판단에 의존하지 않고 기계적으로 검증
- **점진적 도입**: 비파괴적 Hook → 경고 → 블로킹 순으로 천천히 적용
- **명확한 피드백**: 무엇이 잘못되었고 어떻게 고치는지 즉시 알려줌
- **데이터 기반 개선**: 메트릭을 수집하여 문제 패턴을 파악하고 최적화

### 다음 단계

Hook 시스템을 성공적으로 구축했다면:

1. **팀 교육**: Hook의 목적과 사용법을 팀원에게 설명
2. **모니터링**: 초기 몇 주간 메트릭을 면밀히 관찰
3. **피드백 수집**: 개발자의 불편 사항과 개선 요청 청취
4. **지속적 개선**: 정기적으로 Hook 규칙과 성능을 검토

코드 리뷰 자동화는 일회성 프로젝트가 아니라 지속적인 개선 과정입니다. Hook 시스템을 팀의 워크플로우에 자연스럽게 녹여내고, 개발자가 품질 향상의 가치를 체감할 수 있도록 만드세요. 그러면 코드 품질은 자동으로 향상되고, 팀은 더 중요한 문제에 집중할 수 있습니다.

### 참고 자료

- [Claude Code Hooks Implementation Guide](https://medium.com/@richardhightower/claude-code-hooks-implementation-guide-audit-system-03763748700f)
- [Complete Guide: Creating Claude Code Hooks](https://suiteinsider.com/complete-guide-creating-claude-code-hooks/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [ESLint Configuration](https://eslint.org/docs/latest/use/configure/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/)
