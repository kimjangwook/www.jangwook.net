---
title: Claude Code 插件完全指南：从官方插件到社区市场
description: >-
  深入解析 Claude Code 13个官方插件和社区市场。涵盖 feature-dev 7阶段工作流、code-review 4个并行代理、hookify
  自然语言钩子等核心功能的详细介绍。
pubDate: '2026-01-11'
heroImage: ../../../assets/blog/claude-code-plugins-complete-guide-hero.jpg
tags:
  - claude-code
  - mcp
  - ai-tools
relatedPosts:
  - slug: anthropic-agent-skills-practical-guide
    score: 0.95
    reason:
      ko: '자동화, AI/ML, DevOps, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、DevOps、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, DevOps, architecture with
        comparable difficulty.
      zh: 在自动化、AI/ML、DevOps、架构领域涵盖类似主题，难度相当。
  - slug: claude-code-cli-migration-guide
    score: 0.95
    reason:
      ko: '자동화, AI/ML, DevOps, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、DevOps、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, DevOps, architecture with
        comparable difficulty.
      zh: 在自动化、AI/ML、DevOps、架构领域涵盖类似主题，难度相当。
  - slug: jules-autocoding
    score: 0.95
    reason:
      ko: '자동화, AI/ML, DevOps, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、DevOps、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, DevOps, architecture with
        comparable difficulty.
      zh: 在自动化、AI/ML、DevOps、架构领域涵盖类似主题，难度相当。
  - slug: notion-backlog-slack-claude-project-management
    score: 0.95
    reason:
      ko: '자동화, AI/ML, DevOps, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、DevOps、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, DevOps, architecture with
        comparable difficulty.
      zh: 在自动化、AI/ML、DevOps、架构领域涵盖类似主题，难度相当。
  - slug: anthropic-agent-skills-standard
    score: 0.94
    reason:
      ko: '자동화, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, architecture with comparable
        difficulty.
      zh: 在自动化、AI/ML、架构领域涵盖类似主题，难度相当。
---
## 概述

Claude Code 插件系统是 Anthropic 推出的扩展机制，将`<strong>`斜杠命令、专业代理、技能和钩子打包成一个单元进行分发`</strong>`。研究 [anthropics/claude-code 仓库](https://github.com/anthropics/claude-code)的 plugins 目录后，确认官方提供了 `<strong>`13 个插件`</strong>`。

本文基于实际代码库分析，详细介绍各插件的`<strong>`内部结构、工作流和实际使用方法`</strong>`。

## 官方 13 个插件详解

根据 anthropics/claude-code 仓库的 plugins 目录分析，官方插件如下：

### 1. commit-commands：Git 工作流自动化

提供 Git 提交自动化的基础插件。

```bash
/plugin install commit-commands
```

`<strong>`提供的命令`</strong>`：

| 命令                | 功能                           |
| ------------------- | ------------------------------ |
| `/commit`         | 分析暂存区更改自动生成提交信息 |
| `/commit-push`    | 一次执行提交 + 推送            |
| `/commit-push-pr` | 自动执行提交 + 推送 + 创建 PR  |
| `/amend`          | 修改最近的提交                 |
| `/undo-commit`    | 撤销最近的提交                 |

`<strong>`使用场景`</strong>`：

- 需要保持 Conventional Commits 格式时
- 想要简化重复的 Git 操作时
- 团队需要统一提交信息风格时

---

### 2. feature-dev：7 阶段功能开发自动化

自动化整个功能开发生命周期的核心插件。通过`<strong>`7 阶段工作流和 3 个专业代理`</strong>`实现。

```bash
/plugin install feature-dev
```

`<strong>`7 阶段工作流`</strong>`：

```
阶段1: 需求分析
    ↓
阶段2: 代码库探索 (code-explorer 代理)
    ↓
阶段3: 架构设计 (code-architect 代理)
    ↓
阶段4: 实现
    ↓
阶段5: 测试编写
    ↓
阶段6: 代码审查 (code-reviewer 代理)
    ↓
阶段7: 提交准备
```

`<strong>`3 个专业代理`</strong>`：

| 代理               | 角色           | 职责                   |
| ------------------ | -------------- | ---------------------- |
| `code-explorer`  | 代码库分析专家 | 并行搜索相关文件和模式 |
| `code-architect` | 架构设计师     | 设计变更计划和组件结构 |
| `code-reviewer`  | 代码审查员     | 实现完成后自动审查     |

`<strong>`实际使用示例`</strong>`：

```bash
# 基于 GitHub issue 开发
/feature-dev "实现 GitHub issue #123"

# 使用自然语言描述功能
/feature-dev "在用户资料中添加头像上传功能"
```

---

### 3. code-review：4 个并行代理代码审查

同时使用 4 个专业代理进行代码审查的高级插件。

```bash
/plugin install code-review
```

`<strong>`4 个并行代理`</strong>`：

| 代理           | 检查内容                          |
| -------------- | --------------------------------- |
| 正确性审查员   | 逻辑错误、边界情况、竞态条件      |
| 安全审查员     | 注入攻击、认证绕过、敏感数据暴露  |
| 性能审查员     | O(n²) 复杂度、内存泄漏、N+1 查询 |
| 可维护性审查员 | 代码重复、命名规范、文档完整性    |

`<strong>`置信度评分系统`</strong>`：

每个审查员以 0〜100 分评估结果，`<strong>`默认只显示 80 分以上的指摘`</strong>`。这可以减少误报噪音。

```yaml
# .claude/review-config.yml
confidence_threshold: 80  # 默认值
parallel_agents: 4
output_format: "github-pr-comment"
```

---

### 4. hookify：自然语言钩子创建

无需编写代码即可创建钩子的创新插件。

```bash
/plugin install hookify
```

`<strong>`提供的命令`</strong>`：

| 命令                | 功能             |
| ------------------- | ---------------- |
| `/hookify create` | 交互式创建新钩子 |
| `/hookify list`   | 显示现有钩子列表 |
| `/hookify edit`   | 修改现有钩子     |
| `/hookify test`   | 测试钩子         |

`<strong>`钩子文件格式`</strong>`（YAML frontmatter + Markdown）：

```markdown
---
event: PostToolUse
tool: Edit
path_pattern: "src/**/*.ts"
---

当编辑 TypeScript 文件时，自动运行 ESLint 并
在发现错误时显示修复建议。
```

`<strong>`支持的事件类型`</strong>`：

| 事件             | 触发时机       |
| ---------------- | -------------- |
| `PreToolUse`   | 执行工具前     |
| `PostToolUse`  | 执行工具后     |
| `Notification` | 特定条件满足时 |
| `Stop`         | 任务完成时     |

---

### 5. plugin-dev：8 阶段插件开发向导

从零开始创建 Claude Code 插件的官方开发工具。

```bash
/plugin install plugin-dev
```

`<strong>`8 阶段开发工作流`</strong>`：

```
1. 启动 → 2. 需求收集 → 3. 架构设计 → 4. 脚手架
    ↓
8. 发布 ← 7. 测试 ← 6. 文档 ← 5. 组件实现
```

`<strong>`7 个核心技能`</strong>`：

| 技能                   | 功能             |
| ---------------------- | ---------------- |
| `scaffold-generator` | 自动生成项目结构 |
| `command-builder`    | 斜杠命令创建     |
| `agent-designer`     | 代理定义编写     |
| `skill-packager`     | 技能包创建       |
| `hook-configurator`  | 钩子设置         |
| `mcp-integrator`     | MCP 服务器集成   |
| `test-runner`        | 插件测试         |

---

### 6. frontend-design：UI/UX 专业开发

集成 UX 心理学原则的前端开发支援插件。

```bash
/plugin install frontend-design
```

`<strong>`特点`</strong>`：

- 应用 40+ UX 心理学原则（Fitt's Law、Hick's Law 等）
- 响应式设计自动生成
- 可访问性（a11y）检查
- 设计系统集成支持

---

### 7. pr-review-toolkit：PR 审查自动化

GitHub PR 审查自动化专用工具包。

```bash
/plugin install pr-review-toolkit
```

`<strong>`功能`</strong>`：

- PR 创建时自动审查
- 基于变更大小的审查策略调整
- 与 GitHub Checks API 集成
- 自定义审查规则定义

---

### 8. security-guidance：安全最佳实践

提供代码级安全指导的插件。

```bash
/plugin install security-guidance
```

`<strong>`检查领域`</strong>`：

- OWASP Top 10 漏洞
- 依赖安全（CVE 检查）
- 密钥/凭据泄露检测
- 安全编码模式建议

---

### 9. agent-sdk-dev：代理 SDK 开发

用于创建 Claude Code 自定义代理的 SDK。

```bash
/plugin install agent-sdk-dev
```

`<strong>`用途`</strong>`：

- 自定义代理开发
- 代理间通信模式实现
- 并行代理编排

---

### 10. claude-opus-4-5-migration：模型迁移指南

从旧版 Claude 模型迁移到 Claude Opus 4.5 的辅助插件。

```bash
/plugin install claude-opus-4-5-migration
```

---

### 11〜13. 输出风格插件

控制 Claude Code 响应风格的插件组：

| 插件                         | 特点                     |
| ---------------------------- | ------------------------ |
| `explanatory-output-style` | 详细说明风格             |
| `learning-output-style`    | 教育/学习辅助风格        |
| `ralph-wiggum`             | 轻松幽默风格（彩蛋插件） |

## 社区市场分析

除官方插件外，还有多个社区运营的市场：

### 主要社区市场

| 市场                                                                                           | 插件数量 | 特点             |
| ---------------------------------------------------------------------------------------------- | -------- | ---------------- |
| [ccplugins/awesome-claude-code-plugins](https://github.com/ccplugins/awesome-claude-code-plugins) | 100+     | 按 13 个类别分类 |
| [kivilaid/plugin-marketplace](https://github.com/kivilaid/plugin-marketplace)                     | 87+      | 详细描述         |
| [ananddtyagi/cc-marketplace](https://github.com/ananddtyagi/cc-marketplace)                       | 运营中   | 快速增长         |
| [ivan-magda/claude-code-marketplace](https://github.com/ivan-magda/claude-code-marketplace)       | 运营中   | 稳定更新         |

### 添加社区市场

```bash
# 添加市场
/plugin marketplace add ccplugins/awesome-claude-code-plugins

# 查看已添加的市场
/plugin marketplace list

# 从添加的市场安装插件
/plugin install <plugin-name>
```

### 类别丰富的社区插件

ccplugins/awesome-claude-code-plugins 按以下 `<strong>`13 个类别`</strong>`提供插件：

1. <strong>Git & Version Control</strong> - Git 扩展工作流
2. <strong>Code Quality</strong> - 代码检查、格式化
3. <strong>Testing</strong> - 测试自动化
4. <strong>Documentation</strong> - 文档生成
5. <strong>DevOps & CI/CD</strong> - 部署自动化
6. <strong>Database</strong> - 数据库工具
7. <strong>API Development</strong> - API 开发辅助
8. <strong>Frontend</strong> - 前端专用工具
9. <strong>Backend</strong> - 后端框架集成
10. <strong>Mobile</strong> - 移动应用开发
11. <strong>Security</strong> - 安全扫描
12. <strong>AI/ML</strong> - 机器学习工具
13. <strong>Productivity</strong> - 生产力提升

## 插件结构详解

根据 anthropics/claude-code 分析的标准插件结构：

```
my-plugin/
├── .claude-plugin/
│   └── plugin.json      # 插件元数据（必需）
├── commands/            # 斜杠命令
│   └── my-command.md
├── agents/              # 专业代理
│   └── my-agent.md
├── skills/              # 领域知识
│   └── my-skill/
│       └── SKILL.md
├── hooks/               # 事件钩子
│   └── on-edit.md
└── .mcp.json           # MCP 服务器配置
```

### plugin.json 示例

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "插件描述",
  "author": "作者名",
  "license": "MIT",
  "commands": ["commands/"],
  "agents": ["agents/"],
  "skills": ["skills/"],
  "hooks": ["hooks/"],
  "mcp": ".mcp.json"
}
```

### MCP 服务器集成

在 `.mcp.json` 中定义 MCP 服务器，可以实现`<strong>`外部 API 集成`</strong>`：

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_TOKEN}"
      }
    }
  }
}
```

`<strong>`支持的传输类型`</strong>`：

| 类型          | 用途                 |
| ------------- | -------------------- |
| `stdio`     | 本地进程通信（默认） |
| `sse`       | Server-Sent Events   |
| `http`      | HTTP 端点            |
| `websocket` | 实时双向通信         |

## 按场景推荐的插件组合

### 个人开发者（快速开发）

```bash
/plugin install commit-commands
/plugin install feature-dev
/plugin install code-review
```

<strong>工作流</strong>：

1. `feature-dev` - 从想法到实现自动化
2. `code-review` - 提交前自动审查
3. `commit-commands` - 保持规范提交

---

### 团队项目（协作重心）

```bash
/plugin install commit-commands
/plugin install pr-review-toolkit
/plugin install hookify
/plugin install security-guidance
```

<strong>工作流</strong>：

1. `hookify` - 标准化团队规则
2. `pr-review-toolkit` - PR 自动审查
3. `security-guidance` - 安全检查自动化
4. `commit-commands` - 统一提交风格

---

### 插件开发者

```bash
/plugin install plugin-dev
/plugin install agent-sdk-dev
/plugin install hookify
```

<strong>工作流</strong>：

1. `plugin-dev` - 根据 8 阶段向导开发插件
2. `agent-sdk-dev` - 创建自定义代理
3. `hookify` - 测试和调试钩子

---

### 前端专家

```bash
/plugin install frontend-design
/plugin install code-review
/plugin install commit-commands
```

<strong>工作流</strong>：

1. `frontend-design` - 应用 UX 心理学原则开发
2. `code-review` - 代码质量检查
3. `commit-commands` - 规范提交

## 安装和管理命令

### 基本命令

```bash
# 从官方市场安装
/plugin install <plugin-name>

# 从指定市场安装
/plugin install <plugin-name>@<marketplace>

# 查看已安装插件
/plugin list

# 卸载插件
/plugin uninstall <plugin-name>

# 更新插件
/plugin update <plugin-name>
/plugin update --all
```

### 市场管理

```bash
# 添加市场
/plugin marketplace add <owner/repo>

# 查看市场列表
/plugin marketplace list

# 删除市场
/plugin marketplace remove <name>
```

### 交互式菜单

```bash
# 打开交互式插件管理
/plugin
```

## 注意事项

### 安全

- 官方插件经 Anthropic 验证，相对安全
- 社区插件需要`<strong>`自行审查代码`</strong>`
- 插件可以访问本地文件系统，需谨慎

### 版本管理

```bash
# 固定版本安装（推荐团队使用）
/plugin install commit-commands@1.2.3
```

### 权限

- 某些插件需要外部服务 API 密钥
- 需要设置 GitHub、Slack 等服务的认证

## 总结

Claude Code 插件系统将开发工作流的`<strong>`自动化和标准化`</strong>`提升到新水平：

| 类别           | 推荐插件                    |
| -------------- | --------------------------- |
| Git 工作流     | commit-commands             |
| 功能开发自动化 | feature-dev（7 阶段工作流） |
| 代码审查       | code-review（4 个并行代理） |
| 钩子创建       | hookify（自然语言定义）     |
| 插件开发       | plugin-dev（8 阶段向导）    |
| 前端开发       | frontend-design             |
| 安全检查       | security-guidance           |

`<strong>`建议策略`</strong>`：

1. <strong>初学者</strong>：从 `commit-commands` 和 `feature-dev` 开始
2. <strong>团队</strong>：添加 `pr-review-toolkit` 和 `hookify`
3. <strong>高级用户</strong>：探索 `plugin-dev` 和社区市场

## 参考资料

- [anthropics/claude-code - 官方插件目录](https://github.com/anthropics/claude-code/tree/main/plugins)
- [ccplugins/awesome-claude-code-plugins](https://github.com/ccplugins/awesome-claude-code-plugins)
- [Claude Code 官方文档](https://docs.anthropic.com/claude-code)
- [Model Context Protocol 规范](https://modelcontextprotocol.io)
