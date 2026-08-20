# Chapter 17: 代码审查自动化

## 概述

代码审查是软件开发中保证质量的核心流程。但在大多数团队中,代码审查耗时长、缺乏一致性,并成为造成瓶颈的主要原因。即使在AI时代,这个问题依然存在。即使Claude Code生成了优秀的代码,也需要有方法自动验证组织的编码规则、安全策略和合规要求。

Claude Code的Hook系统是解决这个问题的强大方案。使用Hook可以在工作流程的特定时点(如代码编写、文件保存、commit等)自动执行验证逻辑。通过这种方式可以自动化代码审查流程,一致地维护质量,保证合规性。

本章提供构建基于Hook的代码审查pipeline的实践方案。每个方案都可以独立阅读,并包含可直接应用于项目的实用示例。

### 本章内容

- **Recipe 17.1**: 定义审查标准 - 明确定义组织的编码规则并转换为可自动化的形式
- **Recipe 17.2**: 编写Hook脚本 - 将可执行的验证逻辑实现为Hook
- **Recipe 17.3**: 集成GitHub Actions - 连接CI/CD pipeline和Hook系统
- **Recipe 17.4**: 实现反馈循环 - 向团队传达验证结果并持续改进

---

## Recipe 17.1: 定义审查标准

### 问题 (Problem)

要自动化代码审查,首先必须明确定义"验证什么"。许多组织依赖隐性的编码规则,或者每个审查者应用不同的标准,导致缺乏一致性。此外,如何系统地管理安全、性能、合规等各种要求也不明确。

要定义可自动化的审查标准,需要回答以下问题:

- 哪些验证可以自动化? (类型检查、linting、安全扫描等)
- 每个验证的重要性如何? (blocking、warning、informational)
- 何时应该执行验证? (文件保存时、commit前、创建PR时)
- 如何处理例外? (排除特定文件/目录、紧急部署时)

### 解决方案 (Solution)

使用3阶段框架定义审查标准:

**第1步:验证类别分类**

将所有验证项目分为以下类别:

- **必需 (Mandatory)**: 必须通过的验证 (blocking)
- **推荐 (Recommended)**: 建议通过,但失败时仅显示警告
- **可选 (Optional)**: 提供信息目的,失败也无妨

**第2步:编写验证清单**

为每个类别定义具体的验证项目。

**第3步:生成验证矩阵**

按文件类型、工作流程阶段整理应执行哪些验证的矩阵。

### 代码/示例 (Code)

#### 验证标准定义文件

使用`.claude/review-criteria.json`文件定义审查标准:

```json
{
  "version": "1.0",
  "criteria": {
    "mandatory": {
      "security": {
        "description": "安全漏洞扫描",
        "tools": ["semgrep", "snyk"],
        "severity": "error",
        "exit_code": 1
      },
      "type_safety": {
        "description": "类型安全性验证",
        "tools": ["tsc", "mypy", "rubocop"],
        "severity": "error",
        "exit_code": 1
      },
      "build": {
        "description": "构建成功与否",
        "tools": ["npm run build", "gradle build"],
        "severity": "error",
        "exit_code": 1
      }
    },
    "recommended": {
      "linting": {
        "description": "代码风格和质量检查",
        "tools": ["eslint", "pylint", "rubocop"],
        "severity": "warning",
        "exit_code": 2
      },
      "test_coverage": {
        "description": "测试覆盖率确认",
        "tools": ["jest --coverage", "pytest --cov"],
        "severity": "warning",
        "exit_code": 2,
        "threshold": 80
      },
      "documentation": {
        "description": "文档验证",
        "tools": ["jsdoc", "pydoc"],
        "severity": "warning",
        "exit_code": 2
      }
    },
    "optional": {
      "performance": {
        "description": "性能分析",
        "tools": ["lighthouse", "webpack-bundle-analyzer"],
        "severity": "info",
        "exit_code": 0
      },
      "accessibility": {
        "description": "无障碍验证",
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

#### 验证矩阵可视化

将验证矩阵记录为Markdown表格:

`.claude/REVIEW_MATRIX.md`:

```markdown
# 代码审查验证矩阵

## 必需验证 (Mandatory)

| 验证项目 | 工具 | 文件类型 | 工作流程阶段 | 失败时动作 |
|---------|------|----------|-------------|-----------|
| 安全扫描 | Semgrep | 所有文件 | pre-commit | 中断commit |
| 类型检查 | TSC | *.ts, *.tsx | pre-file-write | 中断保存 |
| 构建验证 | npm build | 所有文件 | pre-commit | 中断commit |

## 推荐验证 (Recommended)

| 验证项目 | 工具 | 文件类型 | 工作流程阶段 | 失败时动作 |
|---------|------|----------|-------------|-----------|
| Linting | ESLint | *.js, *.ts | pre-file-write | 显示警告 |
| 测试覆盖率 | Jest | *.ts, *.js | pre-commit | 显示警告 |
| 文档化 | JSDoc | *.ts, *.js | post-file-write | 显示警告 |

## 可选验证 (Optional)

| 验证项目 | 工具 | 文件类型 | 工作流程阶段 | 失败时动作 |
|---------|------|----------|-------------|-----------|
| 性能 | Lighthouse | *.html | post-commit | 提供信息 |
| 无障碍 | axe-core | *.tsx, *.jsx | post-commit | 提供信息 |

## 例外规则

- **排除路径**: node_modules, dist, build
- **紧急部署**: 设置`EMERGENCY_DEPLOY=true`时跳过测试覆盖率、性能验证
- **测试文件**: `*.test.ts`, `*.spec.ts`不进行文档化验证
```

#### 标准验证脚本

验证已定义标准是否正确的脚本:

`.claude/scripts/validate-criteria.py`:

```python
#!/usr/bin/env python3
"""验证审查标准定义文件有效性的脚本"""

import json
import sys
from pathlib import Path

def validate_criteria(criteria_path):
    """验证审查标准JSON文件"""

    try:
        with open(criteria_path) as f:
            criteria = json.load(f)
    except json.JSONDecodeError as e:
        print(f"❌ JSON解析错误: {e}")
        return False
    except FileNotFoundError:
        print(f"❌ 找不到文件: {criteria_path}")
        return False

    errors = []

    # 1. 检查必需字段
    required_fields = ['version', 'criteria', 'file_type_mapping',
                       'workflow_stages', 'exceptions']
    for field in required_fields:
        if field not in criteria:
            errors.append(f"缺少必需字段: {field}")

    # 2. 检查验证类别
    if 'criteria' in criteria:
        required_categories = ['mandatory', 'recommended', 'optional']
        for category in required_categories:
            if category not in criteria['criteria']:
                errors.append(f"缺少必需类别: {category}")

    # 3. 验证退出代码
    valid_exit_codes = [0, 1, 2]
    for category_name, category in criteria.get('criteria', {}).items():
        for check_name, check_config in category.items():
            exit_code = check_config.get('exit_code')
            if exit_code not in valid_exit_codes:
                errors.append(
                    f"{category_name}.{check_name}: "
                    f"无效的退出代码 {exit_code} (有效值: 0, 1, 2)"
                )

    # 4. 验证文件类型映射
    if 'file_type_mapping' in criteria:
        all_checks = set()
        for category in criteria['criteria'].values():
            all_checks.update(category.keys())

        for file_pattern, checks in criteria['file_type_mapping'].items():
            for check in checks:
                if check not in all_checks:
                    errors.append(
                        f"file_type_mapping: 未定义的验证 '{check}' "
                        f"(文件模式: {file_pattern})"
                    )

    # 5. 验证工作流程阶段
    valid_stages = ['pre-file-write', 'post-file-write',
                    'pre-commit', 'post-commit']
    if 'workflow_stages' in criteria:
        for stage in criteria['workflow_stages']:
            if stage not in valid_stages:
                errors.append(f"无效的工作流程阶段: {stage}")

    # 输出结果
    if errors:
        print("❌ 验证失败:")
        for error in errors:
            print(f"  - {error}")
        return False

    print("✅ 审查标准验证成功")

    # 输出统计
    total_checks = sum(
        len(category)
        for category in criteria['criteria'].values()
    )
    print(f"\n📊 统计:")
    print(f"  - 总验证项目: {total_checks}个")
    print(f"  - 必需: {len(criteria['criteria']['mandatory'])}个")
    print(f"  - 推荐: {len(criteria['criteria']['recommended'])}个")
    print(f"  - 可选: {len(criteria['criteria']['optional'])}个")
    print(f"  - 文件类型映射: {len(criteria['file_type_mapping'])}个")
    print(f"  - 工作流程阶段: {len(criteria['workflow_stages'])}个")

    return True

if __name__ == '__main__':
    criteria_path = Path('.claude/review-criteria.json')
    success = validate_criteria(criteria_path)
    sys.exit(0 if success else 1)
```

执行:

```bash
chmod +x .claude/scripts/validate-criteria.py
python3 .claude/scripts/validate-criteria.py
```

### 说明 (Explanation)

#### 为什么使用JSON格式?

以JSON格式定义审查标准有以下优点:

1. **机器可读**: Hook脚本中易于解析和利用
2. **版本管理**: 用Git追踪变更历史
3. **可重用性**: 可在多个项目中共享和扩展
4. **文档化**: 用JSON Schema明确定义结构

#### 退出代码的含义

Claude Code Hook通过退出代码直接控制下一步操作:

- **0**: 成功 - 继续操作,不输出消息
- **1**: 失败 - 中断操作,显示错误消息
- **2**: 警告 - 继续操作但显示警告消息

这个设计与Git hook的退出代码规则类似,很直观。

#### 验证矩阵的作用

验证矩阵一目了然地展示"何时、什么、如何"进行验证。通过这个:

- 团队成员了解执行哪些验证
- 添加新验证时防止重复
- 性能优化 (删除不必要的验证)

### 变体 (Variations)

#### 变体1:使用YAML格式

如果更喜欢YAML而非JSON:

`.claude/review-criteria.yaml`:

```yaml
version: "1.0"

criteria:
  mandatory:
    security:
      description: 安全漏洞扫描
      tools:
        - semgrep
        - snyk
      severity: error
      exit_code: 1

    type_safety:
      description: 类型安全性验证
      tools:
        - tsc
        - mypy
      severity: error
      exit_code: 1

  recommended:
    linting:
      description: 代码风格和质量检查
      tools:
        - eslint
        - pylint
      severity: warning
      exit_code: 2

  optional:
    performance:
      description: 性能分析
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

YAML解析脚本:

```python
import yaml

with open('.claude/review-criteria.yaml') as f:
    criteria = yaml.safe_load(f)
```

#### 变体2:动态生成标准

分析项目结构自动生成标准:

```python
#!/usr/bin/env python3
"""分析项目结构自动生成审查标准"""

import json
from pathlib import Path

def detect_project_type(root_path):
    """自动检测项目类型"""
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
    """按项目类型生成基本标准"""

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
                'description': 'TypeScript类型检查',
                'tools': ['tsc'],
                'severity': 'error',
                'exit_code': 1
            },
            'build': {
                'description': '构建验证',
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
                'description': 'Python类型检查',
                'tools': ['mypy'],
                'severity': 'error',
                'exit_code': 1
            }
        }
        criteria['file_type_mapping'] = {
            '*.py': ['type_safety', 'linting', 'test_coverage']
        }

    return criteria

# 执行
project_type = detect_project_type('.')
criteria = generate_criteria(project_type)

with open('.claude/review-criteria.json', 'w') as f:
    json.dump(criteria, f, indent=2)

print(f"✅ 为{project_type}项目生成标准完成")
```

#### 变体3:按团队自定义

组织内各团队应用不同标准:

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

## Recipe 17.2: 编写Hook脚本

### 问题 (Problem)

定义了审查标准后,现在需要编写实际执行验证的Hook脚本。Hook脚本需要满足以下要求:

- **可靠性**: 即使在错误输入或异常情况下也能安全运行
- **性能**: 快速执行,不妨碍开发工作流程
- **明确性**: 验证失败时明确指出原因和解决方法
- **可维护性**: 代码易读易修改

但许多开发者在编写Hook脚本时会遇到以下困难:

- 如何解析Claude传递的JSON数据?
- 如何组合多个验证并汇总结果?
- 如何实现错误处理和日志记录?
- 如何进行性能优化?

### 解决方案 (Solution)

按以下4个步骤编写Hook脚本:

**第1步:解析和验证输入数据**

安全地解析并验证Claude传递的JSON数据的有效性。

**第2步:实现验证逻辑**

根据Recipe 17.1中定义的标准执行实际验证。

**第3步:汇总和报告结果**

综合多个验证结果做出最终判断,并向用户提供明确的反馈。

**第4步:返回退出代码**

根据验证结果返回适当的退出代码(0, 1, 2)。

### 代码/示例 (Code)

#### 基本Hook模板 (Bash)

`.claude/hooks/pre-file-write.sh`:

```bash
#!/bin/bash
# Claude Code Hook模板
# 文件保存前执行的基本验证Hook

set -euo pipefail  # 发生错误时立即中断,禁止使用未定义变量

# ============================================================================
# 设置
# ============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CRITERIA_FILE="$SCRIPT_DIR/../review-criteria.json"
LOG_DIR="$SCRIPT_DIR/../logs"
DEBUG=${HOOK_DEBUG:-false}

# 创建日志目录
mkdir -p "$LOG_DIR"

# 调试模式
if [ "$DEBUG" = "true" ]; then
    set -x
    exec 2>> "$LOG_DIR/hook-debug.log"
fi

# ============================================================================
# 辅助函数
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

# 检查jq安装
check_dependencies() {
    if ! command -v jq &> /dev/null; then
        log_error "未安装jq。安装: brew install jq (macOS) 或 apt-get install jq (Linux)"
        exit 1
    fi
}

# 解析JSON输入
parse_input() {
    local input="$1"

    # JSON有效性验证
    if ! echo "$input" | jq empty 2>/dev/null; then
        log_error "无效的JSON输入"
        echo "$input" >> "$LOG_DIR/invalid-input.log"
        exit 1
    fi

    # 提取字段
    FILE_PATH=$(echo "$input" | jq -r '.file_path // "unknown"')
    OPERATION=$(echo "$input" | jq -r '.operation // "unknown"')
    CONTENT=$(echo "$input" | jq -r '.content // ""')

    log_info "File: $FILE_PATH"
    log_info "Operation: $OPERATION"
}

# 检查文件是否在例外列表中
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

# 检测文件类型
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
# 验证函数
# ============================================================================

# TypeScript类型检查
check_typescript() {
    local file="$1"

    log_info "正在执行TypeScript类型检查..."

    if ! command -v npx &> /dev/null; then
        log_warning "找不到npx,跳过类型检查"
        return 0
    fi

    local output
    if output=$(npx tsc --noEmit "$file" 2>&1); then
        log_success "类型检查通过"
        return 0
    else
        log_error "类型检查失败:"
        echo "$output" | head -n 10  # 仅显示前10行
        return 1
    fi
}

# ESLint linting
check_linting() {
    local file="$1"

    log_info "正在执行ESLint linting..."

    if ! command -v npx &> /dev/null; then
        log_warning "找不到npx,跳过linting"
        return 0
    fi

    local output
    if output=$(npx eslint "$file" --format compact 2>&1); then
        log_success "Linting通过"
        return 0
    else
        log_warning "发现linting问题:"
        echo "$output" | head -n 10
        return 2  # 警告代码
    fi
}

# 敏感数据检查
check_sensitive_data() {
    local file="$1"
    local content="$2"

    log_info "正在检查敏感数据..."

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
            log_error "检测到敏感数据模式: $pattern"
            return 1
        fi
    done

    log_success "敏感数据检查通过"
    return 0
}

# ============================================================================
# 主逻辑
# ============================================================================

main() {
    log_info "========================================="
    log_info "Claude Code Hook - Pre-File-Write"
    log_info "========================================="

    # 检查依赖
    check_dependencies

    # 读取输入数据
    local input
    input=$(cat)

    # 调试日志
    if [ "$DEBUG" = "true" ]; then
        echo "$input" >> "$LOG_DIR/hook-input.log"
    fi

    # 解析输入
    parse_input "$input"

    # 检查例外
    if is_excluded "$FILE_PATH"; then
        log_info "排除的文件,跳过验证"
        exit 0
    fi

    # 紧急部署模式
    if [ "${EMERGENCY_DEPLOY:-false}" = "true" ]; then
        log_warning "紧急部署模式: 跳过部分验证"
        exit 0
    fi

    # 检测文件类型
    local file_type
    file_type=$(get_file_type "$FILE_PATH")
    log_info "文件类型: $file_type"

    # 执行验证
    local exit_code=0

    case "$file_type" in
        typescript|typescript-react)
            # 必需: 类型检查
            if ! check_typescript "$FILE_PATH"; then
                exit_code=1
            fi

            # 推荐: linting
            if ! check_linting "$FILE_PATH"; then
                # linting仅警告,保持exit_code
                :
            fi

            # 必需: 敏感数据检查
            if ! check_sensitive_data "$FILE_PATH" "$CONTENT"; then
                exit_code=1
            fi
            ;;

        javascript|javascript-react)
            # 推荐: linting
            check_linting "$FILE_PATH" || true

            # 必需: 敏感数据检查
            if ! check_sensitive_data "$FILE_PATH" "$CONTENT"; then
                exit_code=1
            fi
            ;;

        python)
            log_info "Python文件: 仅执行基本验证"
            check_sensitive_data "$FILE_PATH" "$CONTENT" || exit_code=1
            ;;

        *)
            log_info "未知文件类型: 仅执行基本验证"
            check_sensitive_data "$FILE_PATH" "$CONTENT" || exit_code=1
            ;;
    esac

    # 结果摘要
    echo ""
    log_info "========================================="
    if [ $exit_code -eq 0 ]; then
        log_success "所有验证通过"
    else
        log_error "验证失败,中断文件保存"
    fi
    log_info "========================================="

    exit $exit_code
}

# 错误处理程序
trap 'log_error "发生意外错误 (行: $LINENO)"; exit 1' ERR

# 执行
main
```

授予执行权限:

```bash
chmod +x .claude/hooks/pre-file-write.sh
```

(继续下一部分的翻译...)

由于篇幅限制,我将继续完成剩余内容的翻译。让我继续:
