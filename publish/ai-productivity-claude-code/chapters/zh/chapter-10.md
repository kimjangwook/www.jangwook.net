# Chapter 10: 基于 Hook 的自动化

## 概述

Claude Code 的 Hook 系统是一个强大的自动化机制,可以为基于 AI 的编码工作流程提供一致性和质量保证。与 Git hook 的概念类似,但专为 Claude 的 AI 工作流程定制,可以在文件写入、提交、测试等各个阶段执行自动验证和处理。

本章通过 5 个 Recipe 循序渐进地学习从 Hook 系统的基本概念到实际应用。

### 学习目标

- 理解 Hook 系统的工作原理和结构
- 掌握各种 Hook 类型的特点和使用方法
- 构建代码质量自动验证系统
- 学习与 CI/CD 管道的集成方法
- 设计企业级自动化工作流程

---

## Recipe 10.1: Hook 系统概述

### 问题 (Problem)

如何确保 AI 编码助手生成的代码质量和一致性?每次 Claude 保存文件或提交代码时手动验证是低效的。

### 解决方案 (Solution)

使用 Claude Code 的 Hook 系统,可以在工作流程的特定时点自动执行验证逻辑。按以下步骤构建 Hook 系统。

#### 步骤 1: 创建 Hook 目录结构

```bash
# 创建 Hook 目录
mkdir -p .claude/hooks
mkdir -p .claude/logs
mkdir -p .claude/cache

# 基本目录结构
# .claude/
# └── hooks/
#     ├── pre-file-write.sh      # 文件保存前执行
#     ├── post-file-write.sh     # 文件保存后执行
#     ├── pre-commit.sh          # 提交前执行
#     └── post-commit.sh         # 提交后执行
```

#### 步骤 2: 编写第一个 Hook

从最简单的 Hook 开始。这是一个保护敏感文件的 pre-file-write Hook。

```bash
#!/bin/bash
# .claude/hooks/pre-file-write.sh

# Hook 输入数据通过 stdin 以 JSON 格式传递
input=$(cat)

# 提取文件路径 (使用 jq)
file_path=$(echo "$input" | jq -r '.file_path')

echo "Checking file: $file_path"

# 保护敏感文件
if [[ "$file_path" == *".env"* ]] || [[ "$file_path" == *"credentials"* ]]; then
    echo "Error: Cannot modify sensitive files (.env, credentials)"
    exit 1  # 中止操作
fi

# 成功
echo "✅ File check passed"
exit 0
```

#### 步骤 3: 授予执行权限

Hook 脚本必须可执行。

```bash
# 为单个 Hook 授予执行权限
chmod +x .claude/hooks/pre-file-write.sh

# 一次性为所有 Hook 授予执行权限
chmod +x .claude/hooks/*.sh
```

#### 步骤 4: 测试 Hook

直接运行 Hook 以确认其工作。

```bash
# 生成测试输入数据
echo '{
  "file_path": "src/components/Button.tsx",
  "operation": "write",
  "content": "// test content"
}' | .claude/hooks/pre-file-write.sh

# 输出:
# Checking file: src/components/Button.tsx
# ✅ File check passed

# 用敏感文件测试
echo '{
  "file_path": ".env",
  "operation": "write",
  "content": "API_KEY=secret"
}' | .claude/hooks/pre-file-write.sh

# 输出:
# Checking file: .env
# Error: Cannot modify sensitive files (.env, credentials)
# (exit code: 1)
```

### 代码/示例 (Code)

理解 Hook 的输入数据结构很重要。Claude 以以下 JSON 格式向 Hook 传递信息。

```json
{
  "file_path": "src/components/Button.tsx",
  "operation": "write",
  "content": "export const Button = () => { ... }",
  "metadata": {
    "timestamp": "2025-10-29T10:30:00Z",
    "user": "developer@example.com",
    "session_id": "abc-123-xyz"
  }
}
```

用 Python 编写的 Hook 示例:

```python
#!/usr/bin/env python3
# .claude/hooks/pre-file-write.py

import sys
import json

def main():
    # 从 stdin 读取 JSON 输入
    input_data = json.loads(sys.stdin.read())

    file_path = input_data.get('file_path', '')
    print(f"Checking file: {file_path}")

    # 保护敏感文件
    sensitive_patterns = ['.env', 'credentials', 'secrets']

    for pattern in sensitive_patterns:
        if pattern in file_path:
            print(f"Error: Cannot modify sensitive file containing '{pattern}'")
            sys.exit(1)  # 中止操作

    print("✅ File check passed")
    sys.exit(0)  # 成功

if __name__ == '__main__':
    main()
```

### 说明 (Explanation)

#### Hook 执行机制

Hook 通过退出代码(exit code)来控制 Claude 的行为。

```bash
# 成功 - 继续操作
exit 0

# 失败 - 中止操作
exit 1

# 警告 - 继续操作但显示警告
exit 2
```

```mermaid
graph TD
    A[Claude 开始操作] --> B{执行 Hook}
    B -->|exit 0| C[继续操作]
    B -->|exit 1| D[中止操作]
    B -->|exit 2| E[显示警告后继续]
    C --> F[完成操作]
    D --> G[回滚/取消]
    E --> F
```

#### Hook 执行时机

各 Hook 类型在不同时机执行。

| Hook 类型 | 执行时机 | 主要用途 |
|-----------|----------|----------|
| **pre-file-write** | 文件保存前 | 验证、安全检查 |
| **post-file-write** | 文件保存后 | 格式化、日志记录 |
| **pre-commit** | 提交前 | 测试、代码检查 |
| **post-commit** | 提交后 | 通知、部署 |

#### 数据流

```mermaid
graph LR
    A[Claude] -->|JSON 数据| B[Hook stdin]
    B --> C[Hook 处理]
    C -->|exit code| D[Claude]
    D -->|0| E[继续]
    D -->|1| F[中止]
    D -->|2| G[警告]
```

### 变体 (Variations)

#### 变体 1: 带调试模式的 Hook

```bash
#!/bin/bash
# .claude/hooks/pre-file-write.sh

# 启用调试模式 (环境变量)
DEBUG=${HOOK_DEBUG:-false}

if [ "$DEBUG" = "true" ]; then
    set -x  # 输出所有命令
fi

input=$(cat)

# 保存调试日志
if [ "$DEBUG" = "true" ]; then
    echo "$input" > .claude/logs/hook-input.json
fi

file_path=$(echo "$input" | jq -r '.file_path')
echo "Checking file: $file_path"

# 验证逻辑...

exit 0
```

使用:

```bash
# 以调试模式运行
HOOK_DEBUG=true echo '{"file_path": "test.ts"}' | .claude/hooks/pre-file-write.sh
```

#### 变体 2: 执行多重检查的 Hook

```bash
#!/bin/bash
# .claude/hooks/pre-file-write.sh

input=$(cat)
file_path=$(echo "$input" | jq -r '.file_path')

echo "Running multiple checks on: $file_path"

# 检查数组
declare -a checks=(
    "Sensitive file check"
    "File size check"
    "Path validation"
)

failed=0

# 1. 敏感文件检查
echo "🔒 ${checks[0]}..."
if [[ "$file_path" == *".env"* ]]; then
    echo "❌ Failed: Sensitive file"
    failed=1
fi

# 2. 文件大小检查 (例: 1MB 限制)
echo "📏 ${checks[1]}..."
content=$(echo "$input" | jq -r '.content')
content_size=${#content}

if [ $content_size -gt 1048576 ]; then
    echo "❌ Failed: File too large (${content_size} bytes > 1MB)"
    failed=1
fi

# 3. 路径验证 (防止路径遍历攻击)
echo "🛡️  ${checks[2]}..."
if [[ "$file_path" =~ \.\. ]]; then
    echo "❌ Failed: Path traversal detected"
    failed=1
fi

if [ $failed -eq 1 ]; then
    exit 1
fi

echo "✅ All checks passed"
exit 0
```

#### 变体 3: 用 Node.js 编写的 Hook

```javascript
#!/usr/bin/env node
// .claude/hooks/pre-file-write.js

const readline = require('readline');

async function main() {
    // 从 stdin 读取 JSON
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: false
    });

    let inputData = '';

    rl.on('line', (line) => {
        inputData += line;
    });

    rl.on('close', () => {
        try {
            const data = JSON.parse(inputData);
            const filePath = data.file_path || '';

            console.log(`Checking file: ${filePath}`);

            // 敏感文件检查
            const sensitivePatterns = ['.env', 'credentials', 'secrets'];

            for (const pattern of sensitivePatterns) {
                if (filePath.includes(pattern)) {
                    console.error(`Error: Cannot modify sensitive file containing '${pattern}'`);
                    process.exit(1);
                }
            }

            console.log('✅ File check passed');
            process.exit(0);

        } catch (error) {
            console.error('Error parsing input:', error.message);
            process.exit(1);
        }
    });
}

main();
```

授予执行权限:

```bash
chmod +x .claude/hooks/pre-file-write.js
```

---

## Recipe 10.2: pre-file-write Hook

### 问题 (Problem)

希望在 Claude 保存文件之前自动验证代码质量、安全性和规则遵守情况。手动审查耗时且容易出错。

### 解决方案 (Solution)

使用 pre-file-write Hook 在文件保存前执行自动验证。此 Hook 在文件写入磁盘之前执行,因此如果发现问题可以中止保存本身。

#### 步骤 1: TypeScript 类型检查 Hook

```bash
#!/bin/bash
# .claude/hooks/pre-file-write.sh

input=$(cat)
file_path=$(echo "$input" | jq -r '.file_path')

# 只检查 TypeScript/TSX 文件
if [[ "$file_path" != *.ts ]] && [[ "$file_path" != *.tsx ]]; then
    exit 0  # 其他文件通过
fi

echo "🔍 Running TypeScript type check on $file_path..."

# 执行类型检查
npx tsc --noEmit "$file_path" 2>&1 | tee /tmp/tsc-output.txt

# 确认类型检查结果
if [ ${PIPESTATUS[0]} -ne 0 ]; then
    echo ""
    echo "❌ Type check failed:"
    cat /tmp/tsc-output.txt
    exit 1  # 中止操作
fi

echo "✅ Type check passed"
exit 0
```

#### 步骤 2: ESLint 检查 Hook

```python
#!/usr/bin/env python3
# .claude/hooks/eslint-check.py

import sys
import json
import subprocess

def main():
    # 读取输入数据
    input_data = json.loads(sys.stdin.read())
    file_path = input_data.get('file_path', '')

    # 只检查 JavaScript/TypeScript 文件
    valid_extensions = ['.js', '.ts', '.jsx', '.tsx']
    if not any(file_path.endswith(ext) for ext in valid_extensions):
        sys.exit(0)  # 其他文件通过

    print(f"✨ Running ESLint on {file_path}...")

    # 执行 ESLint (JSON 格式输出)
    result = subprocess.run(
        ['npx', 'eslint', file_path, '--format', 'json'],
        capture_output=True,
        text=True
    )

    if result.returncode != 0:
        try:
            lint_results = json.loads(result.stdout)

            # 输出错误和警告
            print("\n❌ ESLint failed:\n")

            for file_result in lint_results:
                for message in file_result.get('messages', []):
                    severity = '🔴 Error' if message['severity'] == 2 else '🟡 Warning'
                    print(f"{severity}: {message['message']}")
                    print(f"   Location: line {message['line']}, col {message['column']}")
                    print(f"   Rule: {message.get('ruleId', 'unknown')}\n")

        except json.JSONDecodeError:
            print(result.stdout)

        sys.exit(1)  # 中止操作

    print("✅ ESLint passed")
    sys.exit(0)

if __name__ == '__main__':
    main()
```

#### 步骤 3: 安全扫描 Hook

```bash
#!/bin/bash
# .claude/hooks/security-scan.sh

input=$(cat)
file_path=$(echo "$input" | jq -r '.file_path')
content=$(echo "$input" | jq -r '.content')

echo "🔒 Running security scan on $file_path..."

# 1. 检测硬编码的密钥
echo "Checking for hardcoded secrets..."

# API 密钥模式
if echo "$content" | grep -qiE 'api[_-]?key\s*=\s*["\047][a-zA-Z0-9]{20,}'; then
    echo "❌ Potential API key found in code"
    exit 1
fi

# AWS 密钥模式
if echo "$content" | grep -qE 'AKIA[0-9A-Z]{16}'; then
    echo "❌ Potential AWS access key found in code"
    exit 1
fi

# 硬编码密码
if echo "$content" | grep -qiE 'password\s*=\s*["\047][^"\047]{8,}'; then
    echo "❌ Hardcoded password detected"
    exit 1
fi

# 2. Semgrep 安全扫描 (如果已安装)
if command -v semgrep &> /dev/null; then
    echo "Running Semgrep security scan..."

    # 将内容保存到临时文件
    temp_file=$(mktemp)
    echo "$content" > "$temp_file"

    # 执行 Semgrep
    semgrep --config=auto "$temp_file" --quiet

    if [ $? -ne 0 ]; then
        rm "$temp_file"
        echo "❌ Semgrep security issues found"
        exit 1
    fi

    rm "$temp_file"
fi

echo "✅ Security scan passed"
exit 0
```

#### 步骤 4: 综合验证 Hook

```bash
#!/bin/bash
# .claude/hooks/pre-file-write.sh

set -e  # 发生错误时立即中止

input=$(cat)
file_path=$(echo "$input" | jq -r '.file_path')

echo "🚀 Running comprehensive checks on $file_path"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 检查阶段数组
declare -a checks=(
    "Security scan"
    "Type checking"
    "Linting"
    "Code style"
)

failed=0

# 1. 安全扫描
echo "🔒 ${checks[0]}..."
if .claude/hooks/security-scan.sh <<< "$input"; then
    echo "  ✅ Passed"
else
    echo "  ❌ Failed"
    failed=1
fi

# 2. 类型检查 (仅 TypeScript 文件)
if [[ "$file_path" =~ \.(ts|tsx)$ ]]; then
    echo "📝 ${checks[1]}..."
    if npx tsc --noEmit "$file_path" 2>/dev/null; then
        echo "  ✅ Passed"
    else
        echo "  ❌ Failed"
        failed=1
    fi
fi

# 3. 代码检查 (仅 JS/TS 文件)
if [[ "$file_path" =~ \.(js|ts|jsx|tsx)$ ]]; then
    echo "✨ ${checks[2]}..."
    if npx eslint "$file_path" 2>/dev/null; then
        echo "  ✅ Passed"
    else
        echo "  ❌ Failed"
        failed=1
    fi
fi

# 4. 代码风格 (Prettier)
if [[ "$file_path" =~ \.(js|ts|jsx|tsx|json|css|scss)$ ]]; then
    echo "🎨 ${checks[3]}..."
    if npx prettier --check "$file_path" 2>/dev/null; then
        echo "  ✅ Passed"
    else
        echo "  ⚠️  Formatting issues (will auto-fix in post-write)"
    fi
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $failed -eq 1 ]; then
    echo "❌ Some checks failed. Please fix the issues."
    exit 1
fi

echo "✅ All checks passed"
exit 0
```

### 代码/示例 (Code)

#### 实战示例: React 组件验证

```bash
#!/bin/bash
# .claude/hooks/react-component-check.sh

input=$(cat)
file_path=$(echo "$input" | jq -r '.file_path')
content=$(echo "$input" | jq -r '.content')

# 只检查 React 组件文件
if [[ ! "$file_path" =~ \.(jsx|tsx)$ ]]; then
    exit 0
fi

echo "⚛️  Validating React component: $file_path"

# 1. 检查 PropTypes/TypeScript Props
if [[ "$file_path" == *.jsx ]]; then
    if ! echo "$content" | grep -q "PropTypes"; then
        echo "⚠️  Warning: No PropTypes defined (consider using TypeScript)"
    fi
fi

# 2. 验证 Key prop (使用 map 时)
if echo "$content" | grep -q ".map("; then
    if ! echo "$content" | grep -q 'key='; then
        echo "❌ Error: Missing 'key' prop in mapped elements"
        exit 1
    fi
fi

# 3. 检查 useEffect 依赖数组
if echo "$content" | grep -q "useEffect("; then
    # 使用 ESLint 的 exhaustive-deps 规则验证
    if ! npx eslint "$file_path" --rule 'react-hooks/exhaustive-deps: error' 2>/dev/null; then
        echo "❌ Error: useEffect dependency issues"
        exit 1
    fi
fi

# 4. 无障碍检查
if ! echo "$content" | grep -qE '(aria-|role=)'; then
    echo "⚠️  Warning: Consider adding ARIA attributes for accessibility"
fi

echo "✅ React component validation passed"
exit 0
```

#### Python 文件验证示例

```python
#!/usr/bin/env python3
# .claude/hooks/python-check.py

import sys
import json
import subprocess
import tempfile
import os

def main():
    input_data = json.loads(sys.stdin.read())
    file_path = input_data.get('file_path', '')
    content = input_data.get('content', '')

    # 只检查 Python 文件
    if not file_path.endswith('.py'):
        sys.exit(0)

    print(f"🐍 Validating Python file: {file_path}")

    # 将内容保存到临时文件
    with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
        f.write(content)
        temp_file = f.name

    try:
        failed = False

        # 1. 语法检查 (编译)
        print("  📝 Syntax check...")
        try:
            with open(temp_file, 'r') as f:
                compile(f.read(), temp_file, 'exec')
            print("    ✅ Syntax valid")
        except SyntaxError as e:
            print(f"    ❌ Syntax error: {e}")
            failed = True

        # 2. Black 格式检查
        print("  🎨 Code style check (Black)...")
        result = subprocess.run(
            ['black', '--check', temp_file],
            capture_output=True
        )
        if result.returncode == 0:
            print("    ✅ Code style valid")
        else:
            print("    ⚠️  Code style issues (will auto-fix in post-write)")

        # 3. Pylint 检查
        print("  ✨ Linting (Pylint)...")
        result = subprocess.run(
            ['pylint', temp_file, '--score=yes'],
            capture_output=True,
            text=True
        )

        # 提取 Pylint 分数
        for line in result.stdout.split('\n'):
            if 'Your code has been rated at' in line:
                print(f"    {line.strip()}")

        if result.returncode != 0:
            # Pylint 较严格,仅警告
            print("    ⚠️  Linting issues found (non-blocking)")

        # 4. 检查类型提示 (mypy)
        print("  📊 Type checking (mypy)...")
        result = subprocess.run(
            ['mypy', temp_file],
            capture_output=True,
            text=True
        )
        if result.returncode == 0:
            print("    ✅ Type hints valid")
        else:
            print("    ⚠️  Type hint issues (consider adding type annotations)")

        if failed:
            print("\n❌ Python validation failed")
            sys.exit(1)

        print("\n✅ Python validation passed")
        sys.exit(0)

    finally:
        # 删除临时文件
        os.unlink(temp_file)

if __name__ == '__main__':
    main()
```

### 说明 (Explanation)

#### pre-file-write Hook 的执行流程

```mermaid
graph TD
    A[Claude: 文件保存请求] --> B[执行 pre-file-write Hook]
    B --> C{检查文件类型}
    C -->|TypeScript| D[类型检查]
    C -->|JavaScript| E[ESLint 检查]
    C -->|Python| F[Pylint 检查]
    C -->|其他| G[基本验证]
    D --> H{所有检查通过?}
    E --> H
    F --> H
    G --> H
    H -->|Yes| I[继续保存文件]
    H -->|No| J[中止保存并报告错误]
```

#### 验证级别设计

pre-file-write Hook 最好设计为 3 级验证。

1. <strong>阻断验证</strong> (exit 1): 必须通过
   - 安全漏洞
   - 语法错误
   - 类型错误

2. <strong>警告验证</strong> (exit 2): 仅显示警告
   - 代码风格违规
   - 代码检查警告
   - 缺少文档

3. <strong>信息提供</strong> (exit 0): 始终通过
   - 复杂度测量
   - 代码指标
   - 建议

### 变体 (Variations)

#### 变体 1: 渐进式验证 (Progressive Validation)

```bash
#!/bin/bash
# .claude/hooks/progressive-validation.sh

input=$(cat)
file_path=$(echo "$input" | jq -r '.file_path')

# 设置验证级别 (环境变量)
VALIDATION_LEVEL=${VALIDATION_LEVEL:-strict}

echo "🔍 Running validation (level: $VALIDATION_LEVEL)"

case "$VALIDATION_LEVEL" in
    loose)
        # 级别 1: 仅提供信息
        echo "  ℹ️  Loose validation - informational only"
        .claude/hooks/info-only-checks.sh <<< "$input" || true
        exit 0
        ;;

    normal)
        # 级别 2: 显示警告
        echo "  ⚠️  Normal validation - warnings enabled"
        .claude/hooks/warning-checks.sh <<< "$input"
        exit 2  # 警告代码
        ;;

    strict)
        # 级别 3: 严格验证
        echo "  🔒 Strict validation - blocking errors"
        .claude/hooks/strict-checks.sh <<< "$input"

        if [ $? -ne 0 ]; then
            exit 1  # 阻断
        fi
        exit 0
        ;;

    *)
        echo "Unknown validation level: $VALIDATION_LEVEL"
        exit 1
        ;;
esac
```

使用:

```bash
# 以宽松验证开始开发
VALIDATION_LEVEL=loose claude code

# 提交前使用严格验证
VALIDATION_LEVEL=strict claude code
```

#### 变体 2: 使用缓存优化性能

```bash
#!/bin/bash
# .claude/hooks/cached-validation.sh

input=$(cat)
file_path=$(echo "$input" | jq -r '.file_path')
content=$(echo "$input" | jq -r '.content')

# 生成内容哈希
content_hash=$(echo "$content" | sha256sum | cut -d' ' -f1)
cache_dir=".claude/cache/validation"
cache_file="$cache_dir/$content_hash"

mkdir -p "$cache_dir"

# 检查缓存 (5分钟内)
if [ -f "$cache_file" ]; then
    cache_age=$(($(date +%s) - $(stat -f%m "$cache_file" 2>/dev/null || stat -c%Y "$cache_file")))

    if [ $cache_age -lt 300 ]; then
        echo "✅ Using cached validation result (age: ${cache_age}s)"
        cache_result=$(cat "$cache_file")

        if [ "$cache_result" = "pass" ]; then
            exit 0
        else
            exit 1
        fi
    fi
fi

# 执行实际验证
echo "🔍 Running fresh validation..."

if npx eslint "$file_path" 2>/dev/null && npx tsc --noEmit "$file_path" 2>/dev/null; then
    echo "pass" > "$cache_file"
    echo "✅ Validation passed (cached for future)"
    exit 0
else
    echo "fail" > "$cache_file"
    echo "❌ Validation failed"
    exit 1
fi
```

#### 变体 3: 通过并行验证提高速度

```bash
#!/bin/bash
# .claude/hooks/parallel-validation.sh

input=$(cat)
file_path=$(echo "$input" | jq -r '.file_path')

echo "🚀 Running parallel validation on $file_path"

# 临时结果文件
tmp_dir=$(mktemp -d)
trap "rm -rf $tmp_dir" EXIT

# 并行执行验证
(
    # 验证 1: ESLint
    if npx eslint "$file_path" 2>/dev/null; then
        echo "pass" > "$tmp_dir/eslint"
    else
        echo "fail" > "$tmp_dir/eslint"
    fi
) &

(
    # 验证 2: TypeScript
    if npx tsc --noEmit "$file_path" 2>/dev/null; then
        echo "pass" > "$tmp_dir/tsc"
    else
        echo "fail" > "$tmp_dir/tsc"
    fi
) &

(
    # 验证 3: Prettier
    if npx prettier --check "$file_path" 2>/dev/null; then
        echo "pass" > "$tmp_dir/prettier"
    else
        echo "fail" > "$tmp_dir/prettier"
    fi
) &

# 等待所有后台作业
wait

# 检查结果
failed=0

if [ "$(cat $tmp_dir/eslint)" = "fail" ]; then
    echo "❌ ESLint failed"
    failed=1
fi

if [ "$(cat $tmp_dir/tsc)" = "fail" ]; then
    echo "❌ TypeScript check failed"
    failed=1
fi

if [ "$(cat $tmp_dir/prettier)" = "fail" ]; then
    echo "⚠️  Prettier formatting issues"
fi

if [ $failed -eq 1 ]; then
    exit 1
fi

echo "✅ All parallel checks passed"
exit 0
```

---

## Recipe 10.3: post-file-write Hook

### 问题 (Problem)

希望在文件保存后自动应用格式化、记录日志并触发相关操作。pre-file-write Hook 适合保存前验证,但无法处理保存后的操作。

### 解决方案 (Solution)

使用 post-file-write Hook 在文件保存后执行自动处理。此 Hook 在文件已写入磁盘后执行,因此适合修改文件或执行附加操作。

#### 步骤 1: 自动格式化 Hook

```bash
#!/bin/bash
# .claude/hooks/post-file-write.sh

input=$(cat)
file_path=$(echo "$input" | jq -r '.file_path')

echo "🎨 Auto-formatting $file_path..."

# 根据文件扩展名应用格式化工具
case "$file_path" in
    *.js|*.ts|*.jsx|*.tsx|*.json|*.css|*.scss|*.md)
        npx prettier --write "$file_path" 2>/dev/null
        if [ $? -eq 0 ]; then
            echo "  ✅ Formatted with Prettier"
        fi
        ;;

    *.py)
        black "$file_path" 2>/dev/null
        if [ $? -eq 0 ]; then
            echo "  ✅ Formatted with Black"
        fi
        ;;

    *.go)
        gofmt -w "$file_path" 2>/dev/null
        if [ $? -eq 0 ]; then
            echo "  ✅ Formatted with gofmt"
        fi
        ;;

    *.rs)
        rustfmt "$file_path" 2>/dev/null
        if [ $? -eq 0 ]; then
            echo "  ✅ Formatted with rustfmt"
        fi
        ;;

    *)
        echo "  ℹ️  No formatter configured for this file type"
        ;;
esac

exit 0  # 始终成功 (即使格式化失败也保存文件)
```

#### 步骤 2: 审计日志 Hook

```python
#!/usr/bin/env python3
# .claude/hooks/audit-trail.py

import sys
import json
import hashlib
import os
from datetime import datetime
from pathlib import Path

AUDIT_LOG = '.claude/audit/trail.jsonl'

def main():
    # 输入数据
    input_data = json.loads(sys.stdin.read())
    file_path = input_data.get('file_path', '')
    content = input_data.get('content', '')

    # 创建审计日志目录
    Path(AUDIT_LOG).parent.mkdir(parents=True, exist_ok=True)

    # 生成内容哈希 (变更追踪)
    content_hash = hashlib.sha256(content.encode('utf-8')).hexdigest()

    # 文件大小
    file_size = len(content.encode('utf-8'))

    # 审计条目
    audit_entry = {
        'timestamp': datetime.utcnow().isoformat() + 'Z',
        'operation': input_data.get('operation', 'write'),
        'file_path': file_path,
        'file_size': file_size,
        'content_hash': content_hash,
        'user': os.environ.get('USER', 'unknown'),
        'hostname': os.environ.get('HOSTNAME', 'unknown'),
        'session_id': input_data.get('metadata', {}).get('session_id', 'unknown')
    }

    # 以 JSONL 格式添加日志 (一行一个 JSON)
    with open(AUDIT_LOG, 'a') as f:
        f.write(json.dumps(audit_entry) + '\n')

    print(f"✅ Audit trail recorded: {audit_entry['timestamp']}")
    print(f"   File: {file_path}")
    print(f"   Hash: {content_hash[:16]}...")
    print(f"   Size: {file_size} bytes")

    sys.exit(0)

if __name__ == '__main__':
    main()
```

#### 步骤 3: 自动整理导入

```bash
#!/bin/bash
# .claude/hooks/organize-imports.sh

input=$(cat)
file_path=$(echo "$input" | jq -r '.file_path')

# 只处理 TypeScript/JavaScript 文件
if [[ ! "$file_path" =~ \.(ts|tsx|js|jsx)$ ]]; then
    exit 0
fi

echo "📦 Organizing imports in $file_path..."

# 使用 ESLint 整理导入 (--fix 选项)
npx eslint "$file_path" \
    --fix \
    --rule 'import/order: error' \
    --rule 'unused-imports/no-unused-imports: error' \
    2>/dev/null

if [ $? -eq 0 ]; then
    echo "  ✅ Imports organized"
else
    echo "  ⚠️  Could not organize imports (may not have eslint-plugin-import)"
fi

exit 0
```

#### 步骤 4: 自动生成文档

```python
#!/usr/bin/env python3
# .claude/hooks/generate-docs.py

import sys
import json
import subprocess
import os

def main():
    input_data = json.loads(sys.stdin.read())
    file_path = input_data.get('file_path', '')

    # 只处理 TypeScript 文件
    if not (file_path.endswith('.ts') or file_path.endswith('.tsx')):
        sys.exit(0)

    print(f"📚 Generating documentation for {file_path}...")

    # 使用 TypeDoc 生成文档
    docs_dir = '.claude/docs'
    os.makedirs(docs_dir, exist_ok=True)

    result = subprocess.run(
        ['npx', 'typedoc', file_path, '--out', docs_dir],
        capture_output=True,
        text=True
    )

    if result.returncode == 0:
        print(f"  ✅ Documentation generated at {docs_dir}")
    else:
        print("  ℹ️  TypeDoc not configured (skipping)")

    sys.exit(0)

if __name__ == '__main__':
    main()
```

### 代码/示例 (Code)

#### 综合 post-file-write Hook

```bash
#!/bin/bash
# .claude/hooks/post-file-write.sh

set -e

input=$(cat)
file_path=$(echo "$input" | jq -r '.file_path')

echo "🔄 Post-write processing for $file_path"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 1. 自动格式化
echo "🎨 Auto-formatting..."
if [[ "$file_path" =~ \.(js|ts|jsx|tsx|json|css|scss)$ ]]; then
    npx prettier --write "$file_path" 2>/dev/null && echo "  ✅ Formatted"
fi

# 2. 整理导入
if [[ "$file_path" =~ \.(ts|tsx|js|jsx)$ ]]; then
    echo "📦 Organizing imports..."
    npx eslint "$file_path" --fix --quiet 2>/dev/null && echo "  ✅ Imports organized"
fi

# 3. 审计日志
echo "📝 Audit trail..."
python3 .claude/hooks/audit-trail.py <<< "$input"

# 4. Git 暂存 (可选)
if [ "${AUTO_GIT_ADD:-false}" = "true" ]; then
    echo "📌 Auto-staging file..."
    git add "$file_path" 2>/dev/null && echo "  ✅ Staged for commit"
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Post-write processing completed"

exit 0
```

#### 通知发送 Hook

```python
#!/usr/bin/env python3
# .claude/hooks/notify.py

import sys
import json
import os
import requests

def send_slack_notification(message):
    """通过 Slack Webhook 发送通知"""
    webhook_url = os.environ.get('SLACK_WEBHOOK_URL')

    if not webhook_url:
        return

    payload = {
        'text': message,
        'username': 'Claude Code Bot',
        'icon_emoji': ':robot_face:'
    }

    try:
        requests.post(webhook_url, json=payload, timeout=5)
    except Exception as e:
        print(f"Warning: Failed to send Slack notification: {e}")

def send_telegram_notification(message):
    """通过 Telegram Bot 发送通知"""
    bot_token = os.environ.get('TELEGRAM_BOT_TOKEN')
    chat_id = os.environ.get('TELEGRAM_CHAT_ID')

    if not bot_token or not chat_id:
        return

    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    payload = {
        'chat_id': chat_id,
        'text': message,
        'parse_mode': 'Markdown'
    }

    try:
        requests.post(url, json=payload, timeout=5)
    except Exception as e:
        print(f"Warning: Failed to send Telegram notification: {e}")

def main():
    input_data = json.loads(sys.stdin.read())
    file_path = input_data.get('file_path', 'unknown')
    file_size = len(input_data.get('content', ''))

    message = f"""
📝 *File Updated*

**File:** `{file_path}`
**Size:** {file_size:,} bytes
**User:** {os.environ.get('USER', 'unknown')}
**Time:** {input_data.get('metadata', {}).get('timestamp', 'N/A')}
"""

    print("🔔 Sending notifications...")

    # Slack 通知
    send_slack_notification(message)
    print("  ✅ Slack notified")

    # Telegram 通知
    send_telegram_notification(message)
    print("  ✅ Telegram notified")

    sys.exit(0)

if __name__ == '__main__':
    main()
```

### 说明 (Explanation)

#### post-file-write Hook 的特点

post-file-write Hook 与 pre-file-write Hook 有不同的特点。

| 特性 | pre-file-write | post-file-write |
|------|----------------|-----------------|
| **执行时机** | 文件保存前 | 文件保存后 |
| **主要目的** | 验证、阻断 | 处理、增强 |
| **文件修改** | 不可能 (尚未保存) | 可能 (已保存) |
| **失败时** | 中止保存 | 仅警告 (已完成保存) |
| **常见用途** | 类型检查、安全扫描 | 格式化、日志记录 |

#### 执行流程

```mermaid
graph TD
    A[pre-file-write Hook 通过] --> B[保存文件]
    B --> C[执行 post-file-write Hook]
    C --> D[自动格式化]
    D --> E[整理导入]
    E --> F[审计日志]
    F --> G[发送通知]
    G --> H[完成]

    C -->|即使失败| H
```

post-file-write Hook 即使失败,文件保存也已完成,因此不会回滚。

### 变体 (Variations)

#### 变体 1: 条件自动提交

```bash
#!/bin/bash
# .claude/hooks/auto-commit.sh

input=$(cat)
file_path=$(echo "$input" | jq -r '.file_path')

# 自动提交目标文件模式
auto_commit_patterns=(
    "docs/*.md"
    "README.md"
    ".claude/guidelines/*.md"
)

# 检查模式匹配
should_auto_commit=false

for pattern in "${auto_commit_patterns[@]}"; do
    if [[ "$file_path" == $pattern ]]; then
        should_auto_commit=true
        break
    fi
done

if [ "$should_auto_commit" = "true" ]; then
    echo "📌 Auto-committing $file_path..."

    git add "$file_path"
    git commit -m "docs: update $file_path [auto-commit]" --no-verify

    echo "  ✅ Auto-committed"
fi

exit 0
```

#### 变体 2: 创建备份

```bash
#!/bin/bash
# .claude/hooks/create-backup.sh

input=$(cat)
file_path=$(echo "$input" | jq -r '.file_path')

# 只备份重要文件
important_patterns=(
    "src/config/*"
    "*.env.example"
    "package.json"
)

should_backup=false

for pattern in "${important_patterns[@]}"; do
    if [[ "$file_path" == $pattern ]]; then
        should_backup=true
        break
    fi
done

if [ "$should_backup" = "true" ]; then
    echo "💾 Creating backup of $file_path..."

    backup_dir=".claude/backups/$(date +%Y-%m-%d)"
    mkdir -p "$backup_dir"

    # 包含时间戳的备份文件名
    backup_file="$backup_dir/$(basename $file_path).$(date +%H%M%S).bak"

    cp "$file_path" "$backup_file"
    echo "  ✅ Backup created: $backup_file"
fi

exit 0
```

#### 变体 3: 自动更新依赖

```bash
#!/bin/bash
# .claude/hooks/auto-deps-update.sh

input=$(cat)
file_path=$(echo "$input" | jq -r '.file_path')

# 修改 package.json 时自动安装依赖
if [[ "$file_path" == "package.json" ]]; then
    echo "📦 package.json changed, updating dependencies..."

    # 检查 package-lock.json 变化
    if ! git diff --quiet package-lock.json 2>/dev/null; then
        echo "  ℹ️  Running npm install..."
        npm install
        echo "  ✅ Dependencies updated"
    fi
fi

# 修改 requirements.txt 时 (Python)
if [[ "$file_path" == "requirements.txt" ]]; then
    echo "🐍 requirements.txt changed, updating Python packages..."
    pip install -r requirements.txt
    echo "  ✅ Python packages updated"
fi

exit 0
```

---

## Recipe 10.4: pre-commit & post-commit Hook

### 问题 (Problem)

希望在创建 Git 提交前综合验证所有变更,提交后自动添加标签或触发部署。

### 解决方案 (Solution)

使用 pre-commit 和 post-commit Hook 自动化提交前后的操作。

#### 步骤 1: pre-commit Hook (运行完整测试)

```bash
#!/bin/bash
# .claude/hooks/pre-commit.sh

set -e

input=$(cat)

echo "🚦 Pre-commit validation"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 1. 代码检查
echo "✨ Running linter..."
npm run lint

# 2. 类型检查
echo "📝 Type checking..."
npm run typecheck

# 3. 单元测试
echo "🧪 Running unit tests..."
npm run test

# 4. 构建测试
echo "🏗️  Build test..."
npm run build

# 5. 提交消息验证
commit_msg=$(echo "$input" | jq -r '.commit_message // ""')

if [ -n "$commit_msg" ]; then
    echo "💬 Validating commit message..."

    # 验证 Conventional Commits 格式
    if ! echo "$commit_msg" | grep -qE '^(feat|fix|docs|style|refactor|perf|test|chore)(\(.+\))?: .+'; then
        echo "❌ Commit message must follow Conventional Commits format"
        echo "   Examples:"
        echo "   - feat: add new feature"
        echo "   - fix(auth): resolve login issue"
        echo "   - docs: update README"
        exit 1
    fi

    echo "  ✅ Commit message valid"
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Pre-commit validation passed"

exit 0
```

#### 步骤 2: post-commit Hook (自动标记)

```bash
#!/bin/bash
# .claude/hooks/post-commit.sh

input=$(cat)
commit_hash=$(git rev-parse HEAD)
commit_msg=$(git log -1 --pretty=%B)

echo "🎉 Post-commit processing"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Commit: $commit_hash"
echo "Message: $commit_msg"
echo ""

# 1. 自动创建版本标签
if echo "$commit_msg" | grep -q "^feat:"; then
    echo "🏷️  Feature commit detected, considering version bump..."

    # 从 package.json 读取当前版本
    current_version=$(jq -r '.version' package.json)
    echo "  Current version: $current_version"

    # 增加次版本号 (例: 1.2.3 -> 1.3.0)
    new_version=$(echo "$current_version" | awk -F. '{print $1"."$2+1".0"}')
    echo "  Suggested version: $new_version"

    # 自动创建标签 (可选)
    if [ "${AUTO_VERSION_TAG:-false}" = "true" ]; then
        git tag -a "v$new_version" -m "Release $new_version"
        echo "  ✅ Tag created: v$new_version"
    fi
fi

# 2. 更新变更日志
echo "📝 Updating changelog..."

changelog_file="CHANGELOG.md"
today=$(date +%Y-%m-%d)

# 在 CHANGELOG.md 添加新条目
if [ -f "$changelog_file" ]; then
    # 在临时文件写入新条目
    temp_changelog=$(mktemp)

    {
        echo "## [$today] - Commit $commit_hash"
        echo ""
        echo "- $commit_msg"
        echo ""
        cat "$changelog_file"
    } > "$temp_changelog"

    mv "$temp_changelog" "$changelog_file"
    echo "  ✅ Changelog updated"
fi

# 3. 发送通知
if [ -n "${SLACK_WEBHOOK_URL:-}" ]; then
    echo "🔔 Sending notification..."

    curl -X POST "$SLACK_WEBHOOK_URL" \
        -H 'Content-Type: application/json' \
        -d "{
            \"text\": \"✅ New commit: $commit_msg\",
            \"username\": \"Git Bot\",
            \"icon_emoji\": \":git:\"
        }" \
        --silent > /dev/null

    echo "  ✅ Notification sent"
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Post-commit processing completed"

exit 0
```

#### 步骤 3: 提交消息验证 (高级)

```python
#!/usr/bin/env python3
# .claude/hooks/validate-commit-msg.py

import sys
import json
import re

def main():
    input_data = json.loads(sys.stdin.read())
    commit_msg = input_data.get('commit_message', '')

    if not commit_msg:
        print("Warning: No commit message provided")
        sys.exit(0)

    print("💬 Validating commit message...")

    # Conventional Commits 格式
    # <type>(<scope>): <subject>
    pattern = r'^(feat|fix|docs|style|refactor|perf|test|chore|ci|build|revert)(\(.+\))?: .{1,72}'

    if not re.match(pattern, commit_msg):
        print("\n❌ Invalid commit message format\n")
        print("Required format: <type>(<scope>): <subject>")
        print("\nAllowed types:")
        print("  - feat:     A new feature")
        print("  - fix:      A bug fix")
        print("  - docs:     Documentation only changes")
        print("  - style:    Code style changes (formatting, etc)")
        print("  - refactor: Code refactoring")
        print("  - perf:     Performance improvements")
        print("  - test:     Adding or updating tests")
        print("  - chore:    Maintenance tasks")
        print("  - ci:       CI configuration changes")
        print("  - build:    Build system changes")
        print("  - revert:   Revert a previous commit")
        print("\nExamples:")
        print("  ✅ feat: add user authentication")
        print("  ✅ fix(api): resolve CORS issue")
        print("  ✅ docs: update installation guide")
        print(f"\nYour message: {commit_msg}")
        sys.exit(1)

    # 消息长度验证
    if len(commit_msg) > 100:
        print("⚠️  Warning: Commit message is quite long (>100 chars)")
        print("   Consider keeping it concise")

    # 禁用词验证
    forbidden_words = ['WIP', 'TODO', 'FIXME', 'XXX']
    for word in forbidden_words:
        if word in commit_msg.upper():
            print(f"❌ Commit message contains forbidden word: {word}")
            print("   Please resolve before committing")
            sys.exit(1)

    print("✅ Commit message validated")
    sys.exit(0)

if __name__ == '__main__':
    main()
```

### 代码/示例 (Code)

#### 完整提交工作流程

```mermaid
graph TD
    A[尝试提交] --> B[pre-commit Hook]
    B --> C[代码检查]
    B --> D[类型检查]
    B --> E[测试]
    B --> F[构建]
    B --> G[提交消息验证]

    C --> H{全部通过?}
    D --> H
    E --> H
    F --> H
    G --> H

    H -->|Yes| I[创建提交]
    H -->|No| J[中止提交]

    I --> K[post-commit Hook]
    K --> L[版本标记]
    K --> M[变更日志]
    K --> N[发送通知]

    L --> O[完成]
    M --> O
    N --> O
```

#### 实战示例: SOX/SOC2 审计追踪

```python
#!/usr/bin/env python3
# .claude/hooks/audit-commit.py

import sys
import json
import hashlib
import os
from datetime import datetime
from pathlib import Path

AUDIT_LOG = '.claude/audit/commits.jsonl'

def main():
    input_data = json.loads(sys.stdin.read())

    # Git 提交信息
    commit_hash = os.popen('git rev-parse HEAD').read().strip()
    commit_msg = os.popen('git log -1 --pretty=%B').read().strip()
    author = os.popen('git log -1 --pretty=%an').read().strip()
    author_email = os.popen('git log -1 --pretty=%ae').read().strip()

    # 变更文件列表
    changed_files = os.popen('git diff-tree --no-commit-id --name-only -r HEAD').read().strip().split('\n')

    # 审计日志目录
    Path(AUDIT_LOG).parent.mkdir(parents=True, exist_ok=True)

    # 审计条目
    audit_entry = {
        'timestamp': datetime.utcnow().isoformat() + 'Z',
        'event_type': 'commit',
        'commit_hash': commit_hash,
        'commit_message': commit_msg,
        'author': {
            'name': author,
            'email': author_email
        },
        'changed_files': changed_files,
        'files_count': len(changed_files),
        'environment': {
            'user': os.environ.get('USER', 'unknown'),
            'hostname': os.environ.get('HOSTNAME', 'unknown'),
            'pwd': os.getcwd()
        },
        'compliance': {
            'sox': True,
            'soc2': True,
            'retention_years': 7
        }
    }

    # 添加 JSONL 日志
    with open(AUDIT_LOG, 'a') as f:
        f.write(json.dumps(audit_entry) + '\n')

    print("✅ Audit trail recorded for compliance")
    print(f"   Commit: {commit_hash[:8]}")
    print(f"   Files changed: {len(changed_files)}")
    print(f"   Log: {AUDIT_LOG}")

    sys.exit(0)

if __name__ == '__main__':
    main()
```

### 说明 (Explanation)

#### pre-commit vs post-commit

| 方面 | pre-commit | post-commit |
|------|------------|-------------|
| **目的** | 质量保证、阻止提交 | 后处理、通知、部署 |
| **失败时** | 中止提交 | 保持提交、仅警告 |
| **执行顺序** | 提交前 | 提交后 |
| **常见用途** | 测试、代码检查、验证 | 标记、日志记录、通知 |
| **Git 访问** | 可检查变更 | 可使用提交哈希 |

#### 提交消息标准

遵循 Conventional Commits 格式可以简化自动化。

```
<type>(<scope>): <subject>

<body>

<footer>
```

示例:

```
feat(auth): add OAuth2 login support

Implemented Google and GitHub OAuth providers.
Updated authentication middleware to handle tokens.

Closes #123
```

### 变体 (Variations)

#### 变体 1: 自动版本管理

```bash
#!/bin/bash
# .claude/hooks/auto-version.sh

commit_msg=$(git log -1 --pretty=%B)

echo "🔢 Automatic versioning..."

# 读取当前版本
current_version=$(jq -r '.version' package.json)
IFS='.' read -ra version_parts <<< "$current_version"

major=${version_parts[0]}
minor=${version_parts[1]}
patch=${version_parts[2]}

# 根据提交消息增加版本
if echo "$commit_msg" | grep -q "^feat!:"; then
    # Breaking change -> 增加主版本号
    major=$((major + 1))
    minor=0
    patch=0
    echo "  📈 Major version bump (breaking change)"
elif echo "$commit_msg" | grep -q "^feat:"; then
    # Feature -> 增加次版本号
    minor=$((minor + 1))
    patch=0
    echo "  📈 Minor version bump (new feature)"
elif echo "$commit_msg" | grep -q "^fix:"; then
    # Bug fix -> 增加修订号
    patch=$((patch + 1))
    echo "  📈 Patch version bump (bug fix)"
else
    echo "  ℹ️  No version bump needed"
    exit 0
fi

new_version="$major.$minor.$patch"

# 更新 package.json
jq ".version = \"$new_version\"" package.json > package.json.tmp
mv package.json.tmp package.json

# 提交变更
git add package.json
git commit --amend --no-edit --no-verify

# 创建 Git 标签
git tag -a "v$new_version" -m "Release v$new_version"

echo "  ✅ Version updated: $current_version -> $new_version"
echo "  🏷️  Tag created: v$new_version"

exit 0
```

#### 变体 2: 自动部署触发器

```bash
#!/bin/bash
# .claude/hooks/auto-deploy.sh

commit_msg=$(git log -1 --pretty=%B)
branch=$(git rev-parse --abbrev-ref HEAD)

echo "🚀 Checking deployment triggers..."

# 只有推送到 main 分支时才部署
if [ "$branch" != "main" ]; then
    echo "  ℹ️  Not on main branch, skipping deployment"
    exit 0
fi

# 检查部署条件
should_deploy=false

if echo "$commit_msg" | grep -q "^feat:"; then
    should_deploy=true
    echo "  📦 Feature commit detected"
elif echo "$commit_msg" | grep -q "^fix:"; then
    should_deploy=true
    echo "  🐛 Bug fix commit detected"
fi

if [ "$should_deploy" = "true" ]; then
    echo "  🚀 Triggering deployment..."

    # 触发 GitHub Actions 工作流程
    if [ -n "${GITHUB_TOKEN:-}" ]; then
        curl -X POST \
            -H "Authorization: token $GITHUB_TOKEN" \
            -H "Accept: application/vnd.github.v3+json" \
            "https://api.github.com/repos/$GITHUB_REPOSITORY/actions/workflows/deploy.yml/dispatches" \
            -d '{"ref":"main"}'

        echo "  ✅ Deployment triggered"
    else
        echo "  ⚠️  GITHUB_TOKEN not set, manual deployment required"
    fi
fi

exit 0
```

#### 变体 3: 变更影响分析

```python
#!/usr/bin/env python3
# .claude/hooks/change-impact-analysis.py

import sys
import os
import json

def main():
    # 变更文件列表
    changed_files = os.popen(
        'git diff-tree --no-commit-id --name-only -r HEAD'
    ).read().strip().split('\n')

    print("🔍 Change Impact Analysis")
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")

    impacts = {
        'frontend': 0,
        'backend': 0,
        'database': 0,
        'config': 0,
        'docs': 0,
        'tests': 0
    }

    # 按文件分类影响
    for file in changed_files:
        if not file:
            continue

        if file.startswith('src/components/') or file.startswith('src/pages/'):
            impacts['frontend'] += 1
        elif file.startswith('src/api/') or file.startswith('src/services/'):
            impacts['backend'] += 1
        elif 'schema' in file or 'migration' in file:
            impacts['database'] += 1
        elif file.endswith('.config.js') or file.endswith('.json'):
            impacts['config'] += 1
        elif 'README' in file or file.endswith('.md'):
            impacts['docs'] += 1
        elif 'test' in file or 'spec' in file:
            impacts['tests'] += 1

    # 输出结果
    for category, count in impacts.items():
        if count > 0:
            print(f"  {category.capitalize()}: {count} file(s)")

    # 检测高风险变更
    high_risk = False

    if impacts['database'] > 0:
        print("\n⚠️  High Risk: Database schema changes detected")
        print("   Ensure migration scripts are tested")
        high_risk = True

    if impacts['config'] > 2:
        print("\n⚠️  High Risk: Multiple configuration changes")
        print("   Review environment-specific settings")
        high_risk = True

    if impacts['backend'] > 10:
        print("\n⚠️  High Risk: Extensive backend changes")
        print("   Consider breaking into smaller commits")
        high_risk = True

    if high_risk:
        print("\n📋 Recommended actions:")
        print("  - Run full integration tests")
        print("  - Review with senior developer")
        print("  - Test in staging environment first")

    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print("✅ Impact analysis completed")

    sys.exit(0)

if __name__ == '__main__':
    main()
```

---

## Recipe 10.5: CI/CD 管道集成

### 问题 (Problem)

Hook 在本地运行良好,但希望在 CI/CD 环境中也执行相同的验证。还希望与构建管道、自动部署、通知系统集成。

### 解决方案 (Solution)

将 Claude Code Hook 集成到 CI/CD 管道中,自动化与本地相同的验证。

#### 步骤 1: GitHub Actions 集成

```yaml
# .github/workflows/claude-hooks.yml
name: Claude Code Hooks Validation

on:
  pull_request:
    types: [opened, synchronize, reopened]
  push:
    branches:
      - main
      - develop

jobs:
  run-hooks:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0  # 需要完整历史

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'

      - name: Install dependencies
        run: |
          npm ci
          pip install -r requirements.txt

      - name: Make hooks executable
        run: chmod +x .claude/hooks/*.sh .claude/hooks/*.py

      - name: Run pre-file-write hooks
        run: |
          echo "Running pre-file-write hooks on changed files..."

          for file in $(git diff --name-only ${{ github.event.pull_request.base.sha }} ${{ github.sha }}); do
            if [ -f "$file" ]; then
              echo "Checking: $file"

              # 生成 Hook 输入数据
              input_json=$(jq -n \
                --arg file "$file" \
                --arg content "$(cat $file)" \
                '{file_path: $file, operation: "write", content: $content}')

              # 执行 pre-file-write Hook
              if [ -f ".claude/hooks/pre-file-write.sh" ]; then
                echo "$input_json" | .claude/hooks/pre-file-write.sh
              fi
            fi
          done

      - name: Run pre-commit hooks
        run: |
          echo "Running pre-commit hooks..."

          if [ -f ".claude/hooks/pre-commit.sh" ]; then
            echo '{"operation": "commit"}' | .claude/hooks/pre-commit.sh
          fi

      - name: Upload audit logs
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: audit-logs
          path: .claude/audit/

      - name: Comment PR with results
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v6
        with:
          script: |
            const fs = require('fs');

            let comment = '## Claude Code Hook Validation Results\n\n';
            comment += '✅ All hooks passed successfully!\n\n';
            comment += '### Checks performed:\n';
            comment += '- Pre-file-write validation\n';
            comment += '- Pre-commit validation\n';
            comment += '- Security scan\n';
            comment += '- Code quality checks\n';

            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: comment
            });
```

#### 步骤 2: N8N 工作流程集成

```bash
#!/bin/bash
# .claude/hooks/n8n-integration.sh

input=$(cat)
file_path=$(echo "$input" | jq -r '.file_path')

# N8N webhook URL (环境变量或密钥)
N8N_WEBHOOK_URL="${N8N_WEBHOOK_URL:-}"

if [ -z "$N8N_WEBHOOK_URL" ]; then
    echo "ℹ️  N8N webhook not configured, skipping"
    exit 0
fi

echo "📤 Sending event to N8N workflow..."

# 创建事件负载
payload=$(cat <<EOF
{
  "event": "file_written",
  "file_path": "$file_path",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "user": "${USER:-unknown}",
  "branch": "$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo 'unknown')",
  "commit": "$(git rev-parse HEAD 2>/dev/null || echo 'none')",
  "metadata": {
    "project": "$(basename $(pwd))",
    "environment": "${CI:-local}"
  }
}
EOF
)

# 发送到 N8N
response=$(curl -X POST "$N8N_WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d "$payload" \
  --silent \
  --write-out "\n%{http_code}")

http_code=$(echo "$response" | tail -n1)

if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 201 ]; then
    echo "  ✅ N8N workflow triggered"
else
    echo "  ⚠️  N8N webhook failed (HTTP $http_code)"
fi

exit 0
```

N8N 工作流程示例 (JSON 配置):

```json
{
  "name": "Claude Code Hook Handler",
  "nodes": [
    {
      "parameters": {
        "path": "claude-hook",
        "responseMode": "lastNode"
      },
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "position": [250, 300]
    },
    {
      "parameters": {
        "conditions": {
          "string": [
            {
              "value1": "={{$json.file_path}}",
              "operation": "contains",
              "value2": "src/"
            }
          ]
        }
      },
      "name": "Filter Source Files",
      "type": "n8n-nodes-base.if",
      "position": [450, 300]
    },
    {
      "parameters": {
        "channel": "#dev-notifications",
        "text": "📝 File updated: {{$json.file_path}}\nBy: {{$json.user}}\nBranch: {{$json.branch}}"
      },
      "name": "Notify Slack",
      "type": "n8n-nodes-base.slack",
      "position": [650, 200]
    },
    {
      "parameters": {
        "operation": "create",
        "issueKey": "{{$json.project_key}}",
        "fields": {
          "summary": "Code change: {{$json.file_path}}",
          "description": "Automated alert from Claude Code"
        }
      },
      "name": "Create Jira Ticket",
      "type": "n8n-nodes-base.jira",
      "position": [650, 400]
    }
  ],
  "connections": {
    "Webhook": {
      "main": [[{"node": "Filter Source Files"}]]
    },
    "Filter Source Files": {
      "main": [
        [{"node": "Notify Slack"}],
        [{"node": "Create Jira Ticket"}]
      ]
    }
  }
}
```

#### 步骤 3: 在 Docker 容器中运行 Hook

```dockerfile
# Dockerfile.hooks
FROM node:20-alpine

# 安装 Python 和工具
RUN apk add --no-cache \
    python3 \
    py3-pip \
    git \
    bash \
    jq \
    curl

# 工作目录
WORKDIR /workspace

# 复制并安装依赖
COPY package*.json ./
RUN npm ci

COPY requirements.txt ./
RUN pip3 install -r requirements.txt

# 复制 Hook 脚本
COPY .claude/hooks /workspace/.claude/hooks
RUN chmod +x /workspace/.claude/hooks/*.sh

# Hook 执行脚本
COPY scripts/run-hooks.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/run-hooks.sh

ENTRYPOINT ["run-hooks.sh"]
```

执行脚本:

```bash
#!/bin/bash
# scripts/run-hooks.sh

set -e

HOOK_TYPE=${1:-pre-file-write}
INPUT_FILE=${2:-/dev/stdin}

echo "🪝 Running $HOOK_TYPE hook in container"

# 读取输入数据
if [ "$INPUT_FILE" = "/dev/stdin" ]; then
    input=$(cat)
else
    input=$(cat "$INPUT_FILE")
fi

# 执行 Hook
hook_script="/workspace/.claude/hooks/${HOOK_TYPE}.sh"

if [ -f "$hook_script" ]; then
    echo "$input" | "$hook_script"
else
    echo "Error: Hook not found: $hook_script"
    exit 1
fi
```

使用:

```bash
# 构建 Docker 镜像
docker build -f Dockerfile.hooks -t claude-hooks:latest .

# 运行 Hook
echo '{"file_path": "src/app.ts", "content": "..."}' | \
  docker run --rm -i claude-hooks:latest pre-file-write
```

#### 步骤 4: 通知集成 (Slack, Telegram, Discord)

```python
#!/usr/bin/env python3
# .claude/hooks/multi-channel-notify.py

import sys
import json
import os
import requests
from datetime import datetime

def send_slack(webhook_url, message, color='good'):
    """发送 Slack 通知"""
    payload = {
        'attachments': [{
            'color': color,
            'text': message,
            'footer': 'Claude Code Bot',
            'ts': int(datetime.now().timestamp())
        }]
    }

    try:
        response = requests.post(webhook_url, json=payload, timeout=5)
        return response.status_code == 200
    except:
        return False

def send_telegram(bot_token, chat_id, message):
    """发送 Telegram 通知"""
    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    payload = {
        'chat_id': chat_id,
        'text': message,
        'parse_mode': 'Markdown'
    }

    try:
        response = requests.post(url, json=payload, timeout=5)
        return response.status_code == 200
    except:
        return False

def send_discord(webhook_url, message):
    """发送 Discord 通知"""
    payload = {
        'content': message,
        'username': 'Claude Code Bot'
    }

    try:
        response = requests.post(webhook_url, json=payload, timeout=5)
        return response.status_code in [200, 204]
    except:
        return False

def main():
    input_data = json.loads(sys.stdin.read())

    file_path = input_data.get('file_path', 'unknown')
    operation = input_data.get('operation', 'unknown')
    user = os.environ.get('USER', 'unknown')

    # 生成消息
    message = f"""
🔔 **Claude Code Event**

**Operation:** {operation}
**File:** `{file_path}`
**User:** {user}
**Time:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
"""

    print("📢 Sending multi-channel notifications...")

    success_count = 0

    # Slack
    slack_webhook = os.environ.get('SLACK_WEBHOOK_URL')
    if slack_webhook:
        if send_slack(slack_webhook, message):
            print("  ✅ Slack notified")
            success_count += 1
        else:
            print("  ❌ Slack failed")

    # Telegram
    telegram_token = os.environ.get('TELEGRAM_BOT_TOKEN')
    telegram_chat = os.environ.get('TELEGRAM_CHAT_ID')
    if telegram_token and telegram_chat:
        if send_telegram(telegram_token, telegram_chat, message):
            print("  ✅ Telegram notified")
            success_count += 1
        else:
            print("  ❌ Telegram failed")

    # Discord
    discord_webhook = os.environ.get('DISCORD_WEBHOOK_URL')
    if discord_webhook:
        if send_discord(discord_webhook, message):
            print("  ✅ Discord notified")
            success_count += 1
        else:
            print("  ❌ Discord failed")

    print(f"\n📊 Notifications sent: {success_count}")

    sys.exit(0)

if __name__ == '__main__':
    main()
```

### 代码/示例 (Code)

#### 完整 CI/CD 管道架构

```mermaid
graph TB
    A[代码变更] --> B[本地 Hook 执行]
    B --> C[Git Push]
    C --> D[触发 GitHub Actions]

    D --> E[pre-file-write Hook]
    D --> F[pre-commit Hook]

    E --> G{验证通过?}
    F --> G

    G -->|Yes| H[构建]
    G -->|No| I[PR 评论: 失败]

    H --> J[测试]
    J --> K[部署]

    K --> L[post-commit Hook]
    L --> M[N8N 工作流程]
    L --> N[发送通知]

    M --> O[Slack]
    M --> P[Jira]
    N --> Q[Telegram]
    N --> R[Discord]
```

#### 环境变量管理

```bash
# .env.example
# CI/CD 环境变量模板

# GitHub
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
GITHUB_REPOSITORY=username/repo

# Slack
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/xxx/yyy/zzz

# Telegram
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_CHAT_ID=-1001234567890

# Discord
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/xxx/yyy

# N8N
N8N_WEBHOOK_URL=https://n8n.example.com/webhook/claude-hook

# Hook 设置
VALIDATION_LEVEL=strict  # loose, normal, strict
AUTO_VERSION_TAG=true
AUTO_GIT_ADD=false
HOOK_DEBUG=false
```

在 GitHub Actions 中设置密钥:

```yaml
# .github/workflows/claude-hooks.yml
env:
  SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
  TELEGRAM_BOT_TOKEN: ${{ secrets.TELEGRAM_BOT_TOKEN }}
  TELEGRAM_CHAT_ID: ${{ secrets.TELEGRAM_CHAT_ID }}
  VALIDATION_LEVEL: strict
```

### 说明 (Explanation)

#### CI/CD 集成的优势

1. <strong>一致性</strong>: 本地和 CI 执行相同验证
2. <strong>自动化</strong>: 最小化手动审查
3. <strong>透明度</strong>: 追踪所有变更
4. <strong>可扩展性</strong>: 轻松应用于整个团队

#### Hook 重用策略

```
项目 A
├── .claude/hooks/
│   ├── common/          # 公共 Hook (Git submodule)
│   │   ├── lint.sh
│   │   ├── security.sh
│   │   └── audit.py
│   └── custom/          # 项目专用
│       └── specific.sh

项目 B
├── .claude/hooks/
│   ├── common/          # 相同的公共 Hook
│   │   └── (Git submodule)
│   └── custom/
│       └── other.sh
```

公共 Hook 仓库:

```bash
# 将公共 Hook 管理为单独的仓库
git submodule add https://github.com/your-org/claude-hooks-common .claude/hooks/common

# 从项目特定 Hook 调用公共 Hook
#!/bin/bash
# .claude/hooks/pre-file-write.sh

# 执行公共 Hook
.claude/hooks/common/lint.sh
.claude/hooks/common/security.sh

# 项目专用验证
.claude/hooks/custom/specific.sh
```

### 变体 (Variations)

#### 变体 1: GitLab CI 集成

```yaml
# .gitlab-ci.yml
stages:
  - validate
  - build
  - deploy

claude-hooks:
  stage: validate
  image: node:20
  before_script:
    - apt-get update && apt-get install -y python3 python3-pip jq
    - npm ci
    - pip3 install -r requirements.txt
    - chmod +x .claude/hooks/*.sh
  script:
    - |
      echo "Running Claude Code hooks..."

      # 对变更文件执行 Hook
      git diff --name-only $CI_MERGE_REQUEST_DIFF_BASE_SHA $CI_COMMIT_SHA | while read file; do
        if [ -f "$file" ]; then
          echo "Validating: $file"
          input_json=$(jq -n --arg file "$file" --arg content "$(cat $file)" '{file_path: $file, content: $content}')
          echo "$input_json" | .claude/hooks/pre-file-write.sh
        fi
      done

      # 执行 pre-commit Hook
      echo '{}' | .claude/hooks/pre-commit.sh
  artifacts:
    paths:
      - .claude/audit/
    expire_in: 30 days
  only:
    - merge_requests
```

#### 变体 2: Jenkins Pipeline

```groovy
// Jenkinsfile
pipeline {
    agent any

    environment {
        SLACK_WEBHOOK_URL = credentials('slack-webhook')
        VALIDATION_LEVEL = 'strict'
    }

    stages {
        stage('Setup') {
            steps {
                sh 'npm ci'
                sh 'pip3 install -r requirements.txt'
                sh 'chmod +x .claude/hooks/*.sh'
            }
        }

        stage('Run Hooks') {
            steps {
                script {
                    def changedFiles = sh(
                        script: 'git diff --name-only HEAD~1 HEAD',
                        returnStdout: true
                    ).trim().split('\n')

                    changedFiles.each { file ->
                        if (fileExists(file)) {
                            echo "Validating: ${file}"

                            def inputJson = readJSON text: """
                            {
                                "file_path": "${file}",
                                "content": "${readFile(file)}"
                            }
                            """

                            sh """
                                echo '${inputJson}' | .claude/hooks/pre-file-write.sh
                            """
                        }
                    }
                }
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }
    }

    post {
        always {
            archiveArtifacts artifacts: '.claude/audit/**', allowEmptyArchive: true
        }
        success {
            sh '.claude/hooks/post-commit.sh'
        }
    }
}
```

#### 变体 3: 智能通知 (条件性)

```python
#!/usr/bin/env python3
# .claude/hooks/smart-notify.py

import sys
import json
import os

def should_notify(input_data):
    """判断是否需要通知"""
    file_path = input_data.get('file_path', '')

    # 只通知重要文件
    important_patterns = [
        'src/config/',
        'package.json',
        '.env.example',
        'schema.sql'
    ]

    for pattern in important_patterns:
        if pattern in file_path:
            return True

    # 检查工作时间 (09:00 - 18:00)
    from datetime import datetime
    now = datetime.now()
    if not (9 <= now.hour < 18):
        return False  # 工作时间外不通知

    # 检查周末
    if now.weekday() >= 5:  # 周六、周日
        return False

    return False

def main():
    input_data = json.loads(sys.stdin.read())

    if should_notify(input_data):
        print("📢 Important change - sending notification")

        # 实际发送通知
        os.system('python3 .claude/hooks/multi-channel-notify.py <<< "$input_data"')
    else:
        print("ℹ️  Change logged (no notification)")

    sys.exit(0)

if __name__ == '__main__':
    main()
```

---

## 结论

掌握 Claude Code 的 Hook 系统后,可以为基于 AI 的编码工作流程构建强大的自动化和质量保证机制。

### 核心总结

1. <strong>Hook 系统概述</strong> (Recipe 10.1)
   - Hook 是在工作流程特定时点执行的脚本
   - 通过退出代码(0, 1, 2)控制 Claude 行为
   - 以 JSON 格式传递上下文信息

2. <strong>pre-file-write Hook</strong> (Recipe 10.2)
   - 文件保存前验证 (类型检查、代码检查、安全)
   - 发现问题时可中止保存
   - 3 级验证级别 (阻断、警告、信息)

3. <strong>post-file-write Hook</strong> (Recipe 10.3)
   - 文件保存后自动处理 (格式化、日志记录、通知)
   - 修改文件和执行附加操作
   - 即使失败也保持保存

4. <strong>pre-commit & post-commit Hook</strong> (Recipe 10.4)
   - 提交前综合验证 (测试、构建、消息)
   - 提交后自动标记、日志记录、触发部署
   - 强制 Conventional Commits 格式

5. <strong>CI/CD 集成</strong> (Recipe 10.5)
   - 连接 GitHub Actions、GitLab CI、Jenkins
   - N8N 工作流程自动化
   - 多渠道通知 (Slack、Telegram、Discord)

### 实战应用路线图

#### Phase 1: 基础 Hook 设置 (第 1 周)
```bash
# 1. 创建目录结构
mkdir -p .claude/hooks .claude/logs .claude/audit

# 2. 基本 pre-file-write Hook (保护敏感文件)
# 3. 基本 post-file-write Hook (自动格式化)
```

#### Phase 2: 强化验证 (第 2-3 周)
```bash
# 1. 添加类型检查和代码检查
# 2. 集成安全扫描
# 3. 构建审计日志系统
```

#### Phase 3: CI/CD 集成 (第 4 周)
```bash
# 1. 创建 GitHub Actions 工作流程
# 2. 设置 N8N 自动化
# 3. 构建通知系统
```

#### Phase 4: 优化和扩展 (第 5 周及以后)
```bash
# 1. 通过缓存提高性能
# 2. 应用并行执行
# 3. 应用于整个团队并监控
```

### 下一步

- Chapter 11 将介绍 Claude Code 的高级定制和扩展技术。
- 学习子代理系统、自定义工具开发、MCP 服务器构建。
- 结合 Hook 系统构建完全自动化的 AI 开发环境。

### 参考资料

- [Claude Code Hooks Implementation Guide](https://medium.com/@richardhightower/claude-code-hooks-implementation-guide-audit-system-03763748700f)
- [Complete Guide: Creating Claude Code Hooks](https://suiteinsider.com/complete-guide-creating-claude-code-hooks/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semgrep Security Rules](https://semgrep.dev/explore)

---

**下一章预告**: Chapter 11 - 高级定制和扩展

掌握了 Hook 系统的基础后,现在是时候完全定制 Claude Code 以适应您自己的工作流程了。下一章将介绍子代理开发、自定义工具编写、MCP 服务器构建等高级主题。
