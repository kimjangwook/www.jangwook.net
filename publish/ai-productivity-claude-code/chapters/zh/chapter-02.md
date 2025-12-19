# 第二章：环境配置

为了有效地使用 Claude Code，构建适当的开发环境至关重要。本章将逐步介绍从安装到初始配置，以及最大化生产力的推荐配置。

---

## Recipe 2.1：安装与认证

### 问题 (Problem)

首次使用 Claude Code 的开发者需要正确安装并完成 API 认证。错误的安装或认证错误会影响后续所有工作，因此从第一步开始就必须准确进行。

### 解决方案 (Solution)

Claude Code 的安装主要分为三个步骤：

1. **确认系统要求**
2. **安装 CLI 工具**
3. **API 密钥认证**

#### 步骤 1：确认系统要求

运行 Claude Code 的最低要求：

- **操作系统**：macOS、Linux、Windows（推荐 WSL2）
- **Node.js**：v18.0.0 或更高版本
- **npm**：v9.0.0 或更高版本
- **磁盘空间**：500MB 以上（包括缓存和模型数据）
- **网络**：稳定的互联网连接（用于 API 调用）

确认 Node.js 版本：

```bash
node --version
# 必须是 v18.0.0 或更高版本

npm --version
# 必须是 v9.0.0 或更高版本
```

如果版本过低，请从 [nodejs.org](https://nodejs.org) 下载并安装 LTS 版本。

#### 步骤 2：安装 Claude Code CLI

通过 npm 进行全局安装：

```bash
# 全局安装
npm install -g @anthropic-ai/claude-code

# 确认安装
claude --version
# 输出：claude-code/1.x.x
```

安装完成后，可以在终端的任何位置使用 `claude` 命令。

**安装问题解决**：

```bash
# 权限错误时（macOS/Linux）
sudo npm install -g @anthropic-ai/claude-code

# 清理 npm 缓存后重试
npm cache clean --force
npm install -g @anthropic-ai/claude-code
```

#### 步骤 3：API 密钥认证

获取 Anthropic API 密钥并设置为环境变量。

**API 密钥获取**：

1. 访问 [console.anthropic.com](https://console.anthropic.com)
2. 创建账户或登录
3. 进入 'API Keys' 菜单
4. 点击 'Create Key' 按钮
5. 输入密钥名称（例如："claude-code-dev"）
6. 复制生成的密钥（仅显示一次，请安全保管）

**设置环境变量**：

macOS/Linux 的情况，添加到 `.bashrc`、`.zshrc` 或 `.bash_profile`：

```bash
# ~/.zshrc 或 ~/.bashrc
export ANTHROPIC_API_KEY='sk-ant-api03-...'
```

应用更改：

```bash
source ~/.zshrc  # 或 ~/.bashrc
```

Windows（PowerShell）的情况：

```powershell
# 设置为系统环境变量
[System.Environment]::SetEnvironmentVariable('ANTHROPIC_API_KEY', 'sk-ant-api03-...', 'User')
```

**认证确认**：

```bash
# 使用简单命令测试认证
claude auth check

# 输出示例：
# ✓ API key is valid
# ✓ Connected to Anthropic API
# Model: claude-sonnet-4-5-20250929
```

### 代码/示例 (Code)

可以将整个安装过程自动化为一个脚本：

```bash
#!/bin/bash
# install-claude-code.sh

echo "Claude Code 安装脚本"
echo "======================================"

# 1. 确认 Node.js 版本
echo "\n[1/4] 确认 Node.js 版本..."
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ 需要 Node.js v18 或更高版本。当前：v$(node --version)"
    echo "请从 https://nodejs.org 安装最新 LTS 版本。"
    exit 1
fi
echo "✓ Node.js $(node --version)"

# 2. 安装 Claude Code
echo "\n[2/4] 正在安装 Claude Code..."
npm install -g @anthropic-ai/claude-code
if [ $? -ne 0 ]; then
    echo "❌ 安装失败。可能需要 sudo 权限。"
    exit 1
fi
echo "✓ Claude Code $(claude --version)"

# 3. 输入 API 密钥
echo "\n[3/4] 设置 API 密钥..."
echo "请输入 Anthropic API 密钥："
read -s API_KEY

# 4. 设置环境变量（基于 zsh）
echo "\n[4/4] 正在设置环境变量..."
echo "export ANTHROPIC_API_KEY='$API_KEY'" >> ~/.zshrc
source ~/.zshrc

# 5. 确认认证
echo "\n安装完成！正在确认认证..."
claude auth check

echo "\n======================================"
echo "Claude Code 安装完成！"
echo "使用以下命令开始：claude"
```

运行脚本：

```bash
chmod +x install-claude-code.sh
./install-claude-code.sh
```

### 说明 (Explanation)

**为什么使用全局安装？**

Claude Code 不是项目级工具，而是<strong>在整个系统中使用的 CLI 工具</strong>。因此，使用 `-g` 标志进行全局安装，以便在任何目录中都可以使用 `claude` 命令。

**使用环境变量的原因**：

- <strong>安全性</strong>：不在代码中硬编码 API 密钥
- <strong>可移植性</strong>：在不同环境（开发/预发布/生产）中轻松切换
- <strong>版本控制</strong>：将环境变量文件添加到 `.gitignore` 以防止密钥泄露

**API 密钥管理建议**：

1. <strong>绝不提交到公共仓库</strong>
2. 使用 `.env` 文件时添加到 `.gitignore`
3. 团队协作时提供 `.env.example` 文件作为模板
4. 在生产环境中使用 CI/CD 工具的秘密管理功能

### 变形 (Variations)

#### 变形 1：使用 .env 文件管理密钥

在项目根目录创建 `.env` 文件：

```bash
# .env
ANTHROPIC_API_KEY=sk-ant-api03-...
CLAUDE_MODEL=claude-sonnet-4-5-20250929
CLAUDE_TIMEOUT=120000
```

添加到 `.gitignore`：

```bash
# .gitignore
.env
.env.local
.env.*.local
```

提供 `.env.example` 模板：

```bash
# .env.example
ANTHROPIC_API_KEY=your_api_key_here
CLAUDE_MODEL=claude-sonnet-4-5-20250929
CLAUDE_TIMEOUT=120000
```

#### 变形 2：管理多个 API 密钥（开发/生产分离）

```bash
# ~/.zshrc
export ANTHROPIC_API_KEY_DEV='sk-ant-dev-...'
export ANTHROPIC_API_KEY_PROD='sk-ant-prod-...'

# 激活开发环境
alias claude-dev='ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY_DEV claude'

# 激活生产环境
alias claude-prod='ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY_PROD claude'
```

使用：

```bash
# 在开发环境中运行
claude-dev

# 在生产环境中运行
claude-prod
```

#### 变形 3：在 Docker 容器中安装

将项目容器化以提供一致的环境：

```dockerfile
# Dockerfile
FROM node:18-alpine

# 安装 Claude Code
RUN npm install -g @anthropic-ai/claude-code

# 设置环境变量（构建时注入）
ARG ANTHROPIC_API_KEY
ENV ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY

# 设置工作目录
WORKDIR /workspace

# 入口点
ENTRYPOINT ["claude"]
```

构建和运行：

```bash
# 构建镜像
docker build --build-arg ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY -t claude-code .

# 运行容器
docker run -it -v $(pwd):/workspace claude-code
```

---

## Recipe 2.2：项目初始化配置

### 问题 (Problem)

要在新项目中使用 Claude Code，需要正确配置项目结构和配置文件。仅使用默认配置在团队协作、安全性和性能优化方面可能不足。

### 解决方案 (Solution)

按以下结构初始化 Claude Code 项目：

```
my-project/
├── .claude/
│   ├── settings.json          # 项目配置
│   ├── settings.local.json    # 本地环境配置（git 排除）
│   ├── agents/                # 子代理(Sub-agents)定义
│   ├── commands/              # 斜杠命令(Slash Commands)
│   ├── skills/                # 自动发现技能(Skills)
│   └── guidelines/            # 指南文档
├── .gitignore
├── CLAUDE.md                  # 项目上下文文档
└── README.md
```

#### 步骤 1：项目初始化

```bash
# 创建项目目录并进入
mkdir my-project && cd my-project

# 初始化 Git 仓库
git init

# 创建 Claude Code 配置目录
mkdir -p .claude/{agents,commands,skills,guidelines}
```

#### 步骤 2：编写基本配置文件

**`.claude/settings.json`**（包含在版本控制中）：

```json
{
  "version": "1.0",
  "project": {
    "name": "my-project",
    "description": "项目描述"
  },
  "model": {
    "name": "claude-sonnet-4-5-20250929",
    "temperature": 0.7,
    "max_tokens": 4096
  },
  "safety": {
    "sandboxMode": true,
    "allowedCommands": [
      "npm",
      "node",
      "git",
      "ls",
      "cat",
      "grep"
    ],
    "blockedPaths": [
      ".env",
      "credentials.json",
      "secrets/"
    ]
  },
  "features": {
    "autoCommit": false,
    "codeReview": true,
    "typeCheck": true
  }
}
```

**`.claude/settings.local.json`**（本地环境，git 排除）：

```json
{
  "apiKey": "${ANTHROPIC_API_KEY}",
  "model": {
    "temperature": 0.5
  },
  "developer": {
    "debug": true,
    "verbose": true
  }
}
```

**`.gitignore`**：

```bash
# 环境变量
.env
.env.local
.env.*.local

# Claude Code 本地配置
.claude/settings.local.json
.claude/cache/
.claude/.history

# Node.js
node_modules/
npm-debug.log
yarn-error.log

# IDE
.vscode/
.idea/
*.swp
*.swo

# 构建结果
dist/
build/
.astro/
```

#### 步骤 3：编写 CLAUDE.md

提供项目上下文的核心文档：

```markdown
# CLAUDE.md

此文件供 Claude Code 用于理解项目。

## 项目概述

简要说明：这个项目是做什么的？

## 技术栈

- **语言**：TypeScript、JavaScript
- **框架**：Next.js 14
- **数据库**：PostgreSQL
- **部署**：Vercel

## 架构

- `src/app/` - Next.js App Router 页面
- `src/components/` - 可复用的 React 组件
- `src/lib/` - 工具和辅助函数
- `src/types/` - TypeScript 类型定义

## 命令

\```bash
# 运行开发服务器
npm run dev

# 生产构建
npm run build

# 类型检查
npm run type-check

# 测试
npm test
\```

## 代码风格

- 使用 ESLint + Prettier
- 启用 TypeScript strict 模式
- 优先使用函数式组件
- 使用 Tailwind CSS

## 工作流程

1. 创建功能分支（`git checkout -b feature/name`）
2. 编写代码并测试
3. 提交前运行类型检查和 lint
4. 创建 Pull Request
5. 代码审查后合并

## 注意事项

- 绝不提交 API 密钥
- 所有外部 API 调用必须包含错误处理
- 图片优化必须使用 next/image
```

### 代码/示例 (Code)

自动化整个初始化过程的脚本：

```bash
#!/bin/bash
# init-claude-project.sh

PROJECT_NAME=$1

if [ -z "$PROJECT_NAME" ]; then
    echo "用法：./init-claude-project.sh <项目名>"
    exit 1
fi

echo "初始化 Claude Code 项目：$PROJECT_NAME"
echo "======================================"

# 1. 创建项目目录
mkdir -p $PROJECT_NAME
cd $PROJECT_NAME

# 2. 初始化 Git
git init
echo "✓ Git 仓库已初始化"

# 3. 创建 Claude 目录结构
mkdir -p .claude/{agents,commands,skills,guidelines}
echo "✓ Claude 目录已创建"

# 4. 创建 settings.json
cat > .claude/settings.json << 'EOF'
{
  "version": "1.0",
  "project": {
    "name": "PROJECT_NAME_PLACEHOLDER",
    "description": "项目描述"
  },
  "model": {
    "name": "claude-sonnet-4-5-20250929",
    "temperature": 0.7,
    "max_tokens": 4096
  },
  "safety": {
    "sandboxMode": true,
    "allowedCommands": ["npm", "node", "git", "ls", "cat", "grep"],
    "blockedPaths": [".env", "credentials.json", "secrets/"]
  },
  "features": {
    "autoCommit": false,
    "codeReview": true,
    "typeCheck": true
  }
}
EOF
sed -i '' "s/PROJECT_NAME_PLACEHOLDER/$PROJECT_NAME/g" .claude/settings.json
echo "✓ settings.json 已创建"

# 5. 创建 settings.local.json
cat > .claude/settings.local.json << 'EOF'
{
  "apiKey": "${ANTHROPIC_API_KEY}",
  "developer": {
    "debug": true,
    "verbose": false
  }
}
EOF
echo "✓ settings.local.json 已创建"

# 6. 创建 .gitignore
cat > .gitignore << 'EOF'
.env
.env.local
.env.*.local
.claude/settings.local.json
.claude/cache/
.claude/.history
node_modules/
dist/
build/
.astro/
.vscode/
.idea/
*.swp
EOF
echo "✓ .gitignore 已创建"

# 7. 创建 CLAUDE.md
cat > CLAUDE.md << 'EOF'
# CLAUDE.md

## 项目概述

这个项目是...

## 技术栈

- 语言：TypeScript
- 框架：（需要添加）

## 命令

\```bash
npm run dev    # 开发服务器
npm run build  # 构建
\```

## 架构

（项目结构说明）

## 代码风格

- ESLint + Prettier
- TypeScript strict 模式
EOF
echo "✓ CLAUDE.md 已创建"

# 8. 创建 README.md
cat > README.md << EOF
# $PROJECT_NAME

项目描述

## 开始使用

\```bash
npm install
npm run dev
\```

## 使用 Claude Code

此项目使用 Claude Code。请参考 \`CLAUDE.md\`。
EOF
echo "✓ README.md 已创建"

# 9. 初始提交
git add .
git commit -m "chore: initial Claude Code project setup"
echo "✓ 初始提交完成"

echo "\n======================================"
echo "项目初始化完成！"
echo "cd $PROJECT_NAME && claude 命令开始使用。"
```

使用：

```bash
chmod +x init-claude-project.sh
./init-claude-project.sh my-awesome-project
```

### 说明 (Explanation)

**CLAUDE.md 的作用**：

Claude Code 会自动读取项目根目录的 `CLAUDE.md` 文件以理解<strong>项目的上下文</strong>。这提供了以下优势：

1. <strong>准确的代码生成</strong>：了解项目的代码风格、架构和技术栈
2. <strong>一致的结果</strong>：团队成员之间共享相同的上下文
3. <strong>节省 token</strong>：无需每次重复项目说明

**配置文件分离策略**：

- <strong>settings.json</strong>：整个团队共享的项目配置（包含在版本控制中）
- <strong>settings.local.json</strong>：个人开发者的本地配置（排除在版本控制外）

通过这种方式，API 密钥或调试配置等个人信息不会被共享，同时项目标准配置可以在所有团队成员之间保持一致。

**沙箱模式(Sandbox Mode)的重要性**：

`sandboxMode: true` 设置限制 Claude Code <strong>只执行允许的命令</strong>。这可以防止以下风险：

- 意外删除文件（`rm -rf`）
- 更改系统配置
- 访问敏感文件

### 变形 (Variations)

#### 变形 1：Monorepo 结构

对于管理多个包的 monorepo：

```
monorepo/
├── .claude/
│   ├── settings.json          # 全局配置
│   └── ...
├── packages/
│   ├── web/
│   │   ├── .claude/
│   │   │   └── settings.json  # web 包配置
│   │   └── CLAUDE.md
│   └── api/
│       ├── .claude/
│       │   └── settings.json  # api 包配置
│       └── CLAUDE.md
└── CLAUDE.md                  # 整个 monorepo 说明
```

根目录 `CLAUDE.md`：

```markdown
# Monorepo 项目

## 结构

- `packages/web/` - 前端（Next.js）
- `packages/api/` - 后端（NestJS）

## 包之间的依赖关系

web → api（API 调用）

## 通用命令

\```bash
npm run build:all      # 构建所有包
npm run test:all       # 测试所有包
npm run dev:web        # 仅运行 web 包
npm run dev:api        # 仅运行 api 包
\```
```

#### 变形 2：多语言项目

对于管理多语言内容的博客等项目：

```markdown
# CLAUDE.md

## 多语言支持

此项目支持 4 种语言：韩语(ko)、英语(en)、日语(ja)、中文(zh)

### 内容结构

\```
src/content/blog/
├── ko/post-name.md    # 韩语
├── en/post-name.md    # 英语
├── ja/post-name.md    # 日语
└── zh/post-name.md    # 中文
\```

### 博客文章编写规则

1. 同时编写所有语言版本
2. 保持文件名相同
3. pubDate 使用 'YYYY-MM-DD' 格式
4. heroImage 在所有语言版本中共享

### /write-post 命令

编写博客文章时必须编写所有 4 种语言版本。
```

---

## Recipe 2.3：推荐配置选项

### 问题 (Problem)

仅使用默认配置难以构建适合项目特性的优化开发环境。需要根据项目类型（Web 应用、CLI 工具、库等）和团队规模进行适当的配置调整。

### 解决方案 (Solution)

利用 Claude Code 的高级配置选项最大化生产力。

#### 1. 模型配置优化

根据项目特性选择模型：

```json
{
  "model": {
    "name": "claude-sonnet-4-5-20250929",
    "temperature": 0.7,
    "max_tokens": 4096,
    "top_p": 0.9
  }
}
```

<strong>各模型用途</strong>：

| 模型 | 用途 | temperature 推荐值 |
|------|------|-------------------|
| Claude Opus 4.5 | 复杂架构设计、重构 | 0.5〜0.7 |
| Claude Sonnet 4.5 | 一般代码生成、bug 修复 | 0.7〜0.9 |
| Claude Haiku | 简单任务、需要快速响应时 | 0.8〜1.0 |

<strong>temperature 指南</strong>：

- <strong>0.0〜0.3</strong>：确定性、一致输出（测试代码、文档生成）
- <strong>0.4〜0.7</strong>：平衡、创造性且稳定（一般代码编写）
- <strong>0.8〜1.0</strong>：创造性、探索各种解决方案（头脑风暴）

#### 2. 安全性和权限配置

**以安全为中心的配置**（.claude/settings.json）：

```json
{
  "safety": {
    "sandboxMode": true,
    "allowedCommands": [
      "npm",
      "node",
      "git status",
      "git diff",
      "git log",
      "ls",
      "cat",
      "grep",
      "find"
    ],
    "blockedCommands": [
      "rm -rf",
      "sudo",
      "chmod 777",
      "curl | sh"
    ],
    "blockedPaths": [
      ".env",
      ".env.local",
      "credentials.json",
      "secrets/",
      "private/",
      ".ssh/"
    ],
    "readOnlyPaths": [
      "node_modules/",
      "dist/",
      "build/"
    ],
    "maxFileSize": "10MB",
    "allowNetworkAccess": false
  }
}
```

**配置说明**：

- <strong>allowedCommands</strong>：仅执行允许的命令（白名单方式）
- <strong>blockedCommands</strong>：绝对不能执行的命令（黑名单）
- <strong>blockedPaths</strong>：禁止访问的路径（保护敏感信息）
- <strong>readOnlyPaths</strong>：仅可读的路径（依赖项文件夹等）
- <strong>allowNetworkAccess</strong>：是否允许外部网络访问

#### 3. 功能标志配置

根据项目工作流程激活功能：

```json
{
  "features": {
    "autoCommit": false,
    "codeReview": true,
    "typeCheck": true,
    "linting": true,
    "testing": true,
    "documentation": true,
    "i18n": {
      "enabled": true,
      "languages": ["ko", "en", "ja", "zh"],
      "defaultLanguage": "ko"
    },
    "mcp": {
      "enabled": true,
      "servers": ["context7", "brave-search", "playwright"]
    }
  }
}
```

<strong>各功能说明</strong>：

- <strong>autoCommit</strong>：自动提交更改（推荐 false，引导显式提交）
- <strong>codeReview</strong>：代码编写后自动审查建议
- <strong>typeCheck</strong>：TypeScript 项目自动运行类型检查
- <strong>linting</strong>：自动运行 ESLint
- <strong>testing</strong>：代码更改后自动运行相关测试
- <strong>documentation</strong>：自动生成 JSDoc/TSDoc 注释
- <strong>i18n</strong>：启用多语言支持
- <strong>mcp</strong>：Model Context Protocol 服务器集成

#### 4. 性能优化配置

```json
{
  "performance": {
    "caching": {
      "enabled": true,
      "ttl": 3600,
      "maxSize": "500MB"
    },
    "parallelization": {
      "enabled": true,
      "maxConcurrency": 4
    },
    "timeout": {
      "default": 120000,
      "read": 30000,
      "write": 60000,
      "bash": 120000
    }
  }
}
```

<strong>配置优化提示</strong>：

- <strong>caching.ttl</strong>：缓存有效时间（秒）。快速变化的项目设置较低值
- <strong>maxConcurrency</strong>：并行任务数。根据 CPU 核心数调整
- <strong>timeout</strong>：各任务超时时间。复杂构建设置更长时间

### 代码/示例 (Code)

各项目类型的推荐配置模板：

#### Web 应用程序（Next.js、Astro 等）

```json
{
  "version": "1.0",
  "project": {
    "name": "web-app",
    "type": "web-application",
    "framework": "nextjs"
  },
  "model": {
    "name": "claude-sonnet-4-5-20250929",
    "temperature": 0.7
  },
  "safety": {
    "sandboxMode": true,
    "allowedCommands": ["npm", "node", "git", "ls", "cat", "grep", "curl"],
    "blockedPaths": [".env", ".env.local", "credentials.json"]
  },
  "features": {
    "autoCommit": false,
    "codeReview": true,
    "typeCheck": true,
    "linting": true,
    "testing": true,
    "i18n": {
      "enabled": true,
      "languages": ["ko", "en"]
    },
    "mcp": {
      "enabled": true,
      "servers": ["playwright", "chrome-devtools"]
    }
  },
  "performance": {
    "timeout": {
      "default": 120000,
      "bash": 180000
    }
  }
}
```

#### CLI 工具 / 库

```json
{
  "version": "1.0",
  "project": {
    "name": "cli-tool",
    "type": "library",
    "language": "typescript"
  },
  "model": {
    "name": "claude-sonnet-4-5-20250929",
    "temperature": 0.5
  },
  "safety": {
    "sandboxMode": true,
    "allowedCommands": ["npm", "node", "git", "jest", "vitest"],
    "blockedPaths": [".npmrc", "secrets/"]
  },
  "features": {
    "autoCommit": false,
    "codeReview": true,
    "typeCheck": true,
    "testing": true,
    "documentation": true
  },
  "performance": {
    "caching": {
      "enabled": true,
      "ttl": 7200
    }
  }
}
```

#### 数据科学 / 机器学习

```json
{
  "version": "1.0",
  "project": {
    "name": "ml-project",
    "type": "data-science",
    "language": "python"
  },
  "model": {
    "name": "claude-opus-4-5-20251101",
    "temperature": 0.6
  },
  "safety": {
    "sandboxMode": true,
    "allowedCommands": ["python", "pip", "jupyter", "git", "ls"],
    "blockedPaths": ["data/raw/", "credentials/"]
  },
  "features": {
    "autoCommit": false,
    "codeReview": true,
    "documentation": true,
    "notebooks": {
      "enabled": true,
      "autosave": true
    }
  },
  "performance": {
    "timeout": {
      "default": 300000,
      "bash": 600000
    }
  }
}
```

### 说明 (Explanation)

**各项目类型的优化策略**：

1. <strong>Web 应用程序</strong>：
   - 使用 MCP 服务器（Playwright、Chrome DevTools）实现浏览器自动化
   - 启用 i18n 管理多语言内容
   - 设置较长超时时间（考虑构建时间）

2. <strong>CLI 工具/库</strong>：
   - 启用 documentation 功能（公共 API 文档化很重要）
   - 较低的 temperature（生成一致的代码）
   - 设置较长缓存 TTL（依赖项变化较少）

3. <strong>数据科学</strong>：
   - 使用 Opus 模型（复杂分析和算法）
   - 较长超时时间（考虑数据处理时间）
   - 支持 Jupyter notebook

**性能 vs 安全性平衡**：

- <strong>开发初期</strong>：放松沙箱、快速迭代
- <strong>生产准备</strong>：加强沙箱、彻底验证
- <strong>团队协作</strong>：中等级别、一致规则

### 变形 (Variations)

#### 变形 1：按环境分离配置

开发/预发布/生产环境的配置：

```bash
.claude/
├── settings.json                # 通用配置
├── settings.development.json    # 开发环境
├── settings.staging.json        # 预发布环境
└── settings.production.json     # 生产环境
```

环境切换：

```bash
# 开发环境
export CLAUDE_ENV=development
claude

# 生产环境
export CLAUDE_ENV=production
claude
```

`settings.development.json`：

```json
{
  "extends": "./settings.json",
  "model": {
    "temperature": 0.9
  },
  "safety": {
    "sandboxMode": false
  },
  "developer": {
    "debug": true,
    "verbose": true
  }
}
```

`settings.production.json`：

```json
{
  "extends": "./settings.json",
  "model": {
    "temperature": 0.5
  },
  "safety": {
    "sandboxMode": true,
    "allowedCommands": ["git status", "git diff", "ls", "cat"]
  },
  "features": {
    "autoCommit": false
  }
}
```

#### 变形 2：按团队规模配置

**小型团队（1〜3人）**：

```json
{
  "safety": {
    "sandboxMode": false
  },
  "features": {
    "autoCommit": true,
    "codeReview": false
  }
}
```

**中型团队（4〜10人）**：

```json
{
  "safety": {
    "sandboxMode": true,
    "allowedCommands": ["npm", "git", "ls", "cat", "grep"]
  },
  "features": {
    "autoCommit": false,
    "codeReview": true,
    "linting": true
  }
}
```

**大型团队（10人以上）**：

```json
{
  "safety": {
    "sandboxMode": true,
    "allowedCommands": ["git status", "git diff", "ls", "cat"],
    "requireApproval": true
  },
  "features": {
    "autoCommit": false,
    "codeReview": true,
    "linting": true,
    "testing": true,
    "ciIntegration": true
  },
  "workflow": {
    "requirePullRequest": true,
    "requireCodeReview": 2,
    "branchProtection": ["main", "develop"]
  }
}
```

---

## 总结

本章逐步介绍了如何完美构建 Claude Code 环境：

1. <strong>Recipe 2.1（安装与认证）</strong>：
   - 确认 Node.js 环境
   - 通过 npm 全局安装
   - 获取 API 密钥并设置环境变量
   - 确认认证

2. <strong>Recipe 2.2（项目初始化配置）</strong>：
   - 创建 `.claude/` 目录结构
   - 编写 `settings.json` 和 `settings.local.json`
   - 通过 `CLAUDE.md` 提供项目上下文
   - 使用 `.gitignore` 保护敏感信息

3. <strong>Recipe 2.3（推荐配置选项）</strong>：
   - 按项目类型优化模型和 temperature
   - 沙箱模式和权限设置
   - 激活功能标志
   - 性能优化（缓存、并行化、超时）

现在，在下一章中，我们将在这样构建的环境中学习<strong>基本用法</strong>，以及如何在实战中使用 Claude Code。

---

**下一章预览**：

第三章将实践 Claude Code 的核心功能：<strong>交互式编码</strong>、<strong>文件读/写</strong>、<strong>Git 集成</strong>。我们将从头到尾与 Claude Code 一起创建一个简单的 TODO 应用，掌握实战工作流程。
