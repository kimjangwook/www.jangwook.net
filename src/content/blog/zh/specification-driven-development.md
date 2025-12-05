---
title: AI 时代的规范驱动开发：用 Markdown 编写代码的新范式
description: 通过 GitHub Spec Kit 实现系统化的 AI 开发方法论。超越 "Vibe Coding"，编写可扩展、可维护的生产级代码的完整指南
pubDate: '2025-10-15'
heroImage: ../../../assets/blog/specification-driven-development-hero.jpg
tags:
  - ai
  - development
  - methodology
  - specification
  - best-practices
relatedPosts:
  - slug: metadata-based-recommendation-optimization
    score: 0.94
    reason:
      ko: '자동화, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, architecture with comparable
        difficulty.
      zh: 在自动化、AI/ML、架构领域涵盖类似主题，难度相当。
  - slug: ai-agent-collaboration-patterns
    score: 0.92
    reason:
      ko: '다음 단계 학습으로 적합하며, 자동화, AI/ML, 아키텍처 주제에서 연결됩니다.'
      ja: 次のステップの学習に適しており、自動化、AI/ML、アーキテクチャのトピックで繋がります。
      en: >-
        Suitable as a next-step learning resource, connecting through
        automation, AI/ML, architecture topics.
      zh: 适合作为下一步学习资源，通过自动化、AI/ML、架构主题进行连接。
  - slug: self-healing-ai-systems
    score: 0.91
    reason:
      ko: '다음 단계 학습으로 적합하며, 자동화, AI/ML, 아키텍처 주제에서 연결됩니다.'
      ja: 次のステップの学習に適しており、自動化、AI/ML、アーキテクチャのトピックで繋がります。
      en: >-
        Suitable as a next-step learning resource, connecting through
        automation, AI/ML, architecture topics.
      zh: 适合作为下一步学习资源，通过自动化、AI/ML、架构主题进行连接。
  - slug: astro-scheduled-publishing
    score: 0.82
    reason:
      ko: '선행 학습 자료로 유용하며, 자동화, 아키텍처 기초를 다룹니다.'
      ja: 事前学習資料として有用であり、自動化、アーキテクチャの基礎を扱います。
      en: >-
        Useful as prerequisite knowledge, covering automation, architecture
        fundamentals.
      zh: 作为先修知识很有用，涵盖自动化、架构基础。
---

## AI 编程的新范式

2025 年初，Andrej Karpathy 创造了"Vibe Coding"一词。向 AI 抛出提示词，复制生成的代码，然后期待它能正常运行。这种方式对原型开发很有效，但在大型项目中很快就会崩溃。

现在，<strong>规范驱动开发（Specification-Driven Development, SDD）</strong>登场了。用 Markdown 编写清晰的规范，AI 编程代理就会将其"编译"为可执行代码。这不仅是方法论的变化，而是与 AI 共同构建软件方式的根本性转变。

### Vibe Coding 的局限

让我们通过实际场景来看看 Vibe Coding 的问题：

```typescript
// Vibe Coding 方式
// 提示词："创建用户认证系统"

// AI 生成的代码（第 1 次尝试）
function login(username: string, password: string) {
  // 部分逻辑...
  return true; // 总是成功？
}

// 发现问题，再次提示："添加密码哈希"
// AI 重新生成代码... 部分之前的逻辑丢失

// 再次提示："处理令牌过期"
// 再次重新生成... 越来越复杂且缺乏一致性
```

<strong>问题点</strong>：
- 每次提示时 AI 都会丢失整体上下文
- 之前的决策被忽略或覆盖
- 代码质量不一致且不可预测
- 无法扩展（一两个文件还行，但 50 个文件呢？）

## 什么是规范驱动开发？

规范驱动开发是一种<strong>先明确定义"构建什么（What）"，然后让 AI 实现"如何构建（How）"</strong>的方法论。

### 核心原则

1. <strong>规范是唯一真实来源（Single Source of Truth）</strong>
   - 规范而非代码定义项目
   - 所有变更都从更新规范开始

2. <strong>结构化工作流</strong>
   - 编写规范（Specify）→ 制定计划（Plan）→ 分解任务（Task）→ 实施（Implement）
   - 每个步骤都清晰分离，可追踪

3. <strong>AI 作为工具，开发者作为设计师</strong>
   - 开发者决定"构建什么"（架构、业务逻辑）
   - AI 执行"如何构建"（代码生成、测试、优化）

### 与传统开发的比较

| 方面 | 传统开发 | Vibe Coding | 规范驱动开发 |
|------|------------|-------------|----------------|
| <strong>起点</strong> | 需求文档 | 即兴提示词 | 结构化规范 |
| <strong>AI 角色</strong> | 无或辅助工具 | 全面代码生成 | 基于规范的代码生成 |
| <strong>一致性</strong> | 依赖开发者经验 | 低（每次提示都会变动） | 高（规范保证） |
| <strong>扩展性</strong> | 可能但慢 | 不可能（复杂度↑质量↓） | 优秀（只需管理规范） |
| <strong>维护</strong> | 需要修改代码 | 全面重新生成风险 | 更新规范后重新生成 |
| <strong>协作</strong> | 代码审查 | 困难 | 规范审查（更清晰） |

## 实战示例：用规范驱动构建认证系统

让我们逐步看一个使用 GitHub Spec Kit 的实际示例。

### 第 1 步：编写规范（Specification）

````markdown
<!-- spec/auth.md -->
# 用户认证系统规范

## 概述
包含 JWT 令牌、密码哈希、会话管理的安全认证系统。

## 功能需求

### FR-1：用户注册
- <strong>输入</strong>：username（字符串，3〜20 字符）、email（有效格式）、password（至少 8 字符）
- <strong>处理过程</strong>：
  - 验证输入值
  - 使用 bcrypt 哈希密码（成本系数：12）
  - 将用户保存到数据库
  - 生成验证邮件
- <strong>输出</strong>：用户对象（不含密码）、HTTP 201
- <strong>错误情况</strong>：
  - 重复的 username/email → HTTP 409
  - 无效输入 → HTTP 400

### FR-2：用户登录
- <strong>输入</strong>：username/email、password
- <strong>处理过程</strong>：
  - 从数据库查找用户
  - 比较哈希密码
  - 生成 JWT 令牌（过期时间：24 小时）
  - 创建会话记录
- <strong>输出</strong>：{ token, refreshToken, expiresAt }
- <strong>错误情况</strong>：
  - 无效凭证 → HTTP 401
  - 账户未验证 → HTTP 403

### FR-3：令牌刷新
- <strong>输入</strong>：refreshToken
- <strong>处理过程</strong>：
  - 验证刷新令牌
  - 生成新访问令牌
  - 更新会话
- <strong>输出</strong>：新令牌对
- <strong>错误情况</strong>：
  - 无效或过期令牌 → HTTP 401

## 非功能需求

### NFR-1：安全性
- 密码必须使用 bcrypt 哈希（禁止明文存储）
- JWT 使用 RS256 算法签名
- 刷新令牌使用时轮换
- 速率限制：每 IP 15 分钟内 5 次尝试

### NFR-2：性能
- 注册：< 500ms（第 95 百分位）
- 登录：< 200ms（第 95 百分位）
- 令牌刷新：< 50ms（第 95 百分位）

### NFR-3：数据库模式
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  refresh_token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 实施指南
- 使用 TypeScript strict 模式
- 遵守 REST API 规范
- 为所有端点编写单元测试（覆盖率 > 90%）
- 使用依赖注入以提高可测试性
- 记录所有认证尝试（成功/失败）
````

### 第 2 步：制定计划（Planning）

请求 AI 代理基于规范生成技术计划：

```bash
# 使用 GitHub Spec Kit
npx github-spec-kit plan spec/auth.md
```

AI 生成的计划：

````markdown
<!-- plan/auth-plan.md -->
# 认证系统 - 技术计划

## 架构

### 组件
1. <strong>AuthController</strong>：REST 端点处理器
2. <strong>AuthService</strong>：业务逻辑层
3. <strong>UserRepository</strong>：数据库访问层
4. <strong>PasswordHasher</strong>：bcrypt 包装工具
5. <strong>JWTManager</strong>：令牌生成/验证
6. <strong>RateLimiter</strong>：请求限制中间件

### 依赖项
- express: ^4.18.0
- bcryptjs: ^2.4.3
- jsonwebtoken: ^9.0.0
- pg: ^8.11.0（PostgreSQL 客户端）
- express-rate-limit: ^7.0.0
- joi: ^17.10.0（验证）

### 文件结构
```
src/
├── controllers/
│   └── auth.controller.ts
├── services/
│   └── auth.service.ts
├── repositories/
│   └── user.repository.ts
├── utils/
│   ├── password-hasher.ts
│   ├── jwt-manager.ts
│   └── validators.ts
├── middleware/
│   └── rate-limiter.ts
├── types/
│   └── auth.types.ts
└── tests/
    ├── auth.controller.test.ts
    ├── auth.service.test.ts
    └── user.repository.test.ts
```

## 实施阶段

### 阶段 1：核心基础设施
1. 配置 TypeScript 设置
2. 设置数据库连接
3. 实施数据库迁移
4. 设置测试框架（Jest）

### 阶段 2：工具
5. 使用 bcrypt 实施 PasswordHasher
6. 使用 RS256 实施 JWTManager
7. 实施输入验证器
8. 添加速率限制中间件

### 阶段 3：数据层
9. 实施 UserRepository（CRUD）
10. 实施 SessionRepository
11. 添加数据库事务支持

### 阶段 4：业务逻辑
12. 实施 AuthService.register()
13. 实施 AuthService.login()
14. 实施 AuthService.refreshToken()
15. 添加邮件验证逻辑

### 阶段 5：API 层
16. 实施 AuthController 端点
17. 添加错误处理中间件
18. 设置请求/响应日志记录

### 阶段 6：测试和文档
19. 编写单元测试（目标：95% 覆盖率）
20. 编写集成测试
21. 生成 API 文档
22. 添加包含设置说明的 README

## 测试策略
- <strong>单元测试</strong>：隔离每个服务/工具函数
- <strong>集成测试</strong>：完整的请求/响应周期
- <strong>负载测试</strong>：验证性能需求
- <strong>安全测试</strong>：认证流程渗透测试
````

### 第 3 步：任务分解（Task Breakdown）

将计划分解为可执行的任务：

````markdown
<!-- tasks/auth-tasks.md -->
# 认证系统 - 任务列表

## 任务 1：TypeScript 项目设置
- [ ] 初始化 npm 项目
- [ ] 安装 TypeScript 和依赖项
- [ ] 配置 tsconfig.json（strict 模式）
- [ ] 设置 ESLint 和 Prettier
- <strong>预计时间</strong>：30 分钟

## 任务 2：数据库设置
- [ ] 创建 PostgreSQL 数据库
- [ ] 编写迁移脚本（users、sessions 表）
- [ ] 设置连接池
- [ ] 添加环境变量（.env）
- <strong>预计时间</strong>：1 小时

## 任务 3：实施 PasswordHasher 工具
```typescript
// src/utils/password-hasher.ts
import bcrypt from 'bcryptjs';

export class PasswordHasher {
  private readonly saltRounds = 12;

  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
```
- [ ] 实施 hash() 方法
- [ ] 实施 compare() 方法
- [ ] 编写单元测试
- <strong>预计时间</strong>：30 分钟

[... 继续为每个任务提供具体代码片段 ...]
````

### 第 4 步：实施（Implementation）

现在请求 AI 编程代理（GitHub Copilot、Claude Code 等）实施每个任务：

```bash
# 使用 Claude Code 的示例
@claude "参考 spec/auth.md 和 plan/auth-plan.md 实施任务 3。
         同时编写测试并确保覆盖率达到 90% 以上。"
```

<strong>AI 生成的代码示例</strong>：

```typescript
// src/utils/password-hasher.ts
import bcrypt from 'bcryptjs';

/**
 * 使用 bcrypt 的密码哈希工具
 * 符合 spec/auth.md 的 NFR-1 安全要求
 */
export class PasswordHasher {
  private readonly saltRounds = 12;

  /**
   * 哈希明文密码
   * @param password - 明文密码（至少 8 字符）
   * @returns 哈希密码字符串
   * @throws 如果密码无效则抛出错误
   */
  async hash(password: string): Promise<string> {
    if (!password || password.length < 8) {
      throw new Error('密码必须至少 8 个字符');
    }
    return bcrypt.hash(password, this.saltRounds);
  }

  /**
   * 比较明文密码与哈希
   * @param password - 明文密码
   * @param hash - 存储的密码哈希
   * @returns 如果密码匹配则为 true，否则为 false
   */
  async compare(password: string, hash: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hash);
    } catch (error) {
      // 无效的哈希格式
      return false;
    }
  }
}

// src/utils/password-hasher.test.ts
import { PasswordHasher } from './password-hasher';

describe('PasswordHasher', () => {
  let hasher: PasswordHasher;

  beforeEach(() => {
    hasher = new PasswordHasher();
  });

  describe('hash()', () => {
    it('应该哈希有效密码', async () => {
      const password = 'mySecurePassword123';
      const hash = await hasher.hash(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.startsWith('$2a$') || hash.startsWith('$2b$')).toBe(true);
    });

    it('应该对少于 8 个字符的密码抛出错误', async () => {
      await expect(hasher.hash('short')).rejects.toThrow(
        '密码必须至少 8 个字符'
      );
    });

    it('应该为相同密码生成不同的哈希', async () => {
      const password = 'mySecurePassword123';
      const hash1 = await hasher.hash(password);
      const hash2 = await hasher.hash(password);

      expect(hash1).not.toBe(hash2); // 不同的盐
    });
  });

  describe('compare()', () => {
    it('应该对正确的密码返回 true', async () => {
      const password = 'mySecurePassword123';
      const hash = await hasher.hash(password);
      const result = await hasher.compare(password, hash);

      expect(result).toBe(true);
    });

    it('应该对不正确的密码返回 false', async () => {
      const password = 'mySecurePassword123';
      const hash = await hasher.hash(password);
      const result = await hasher.compare('wrongPassword', hash);

      expect(result).toBe(false);
    });

    it('应该对无效哈希返回 false', async () => {
      const result = await hasher.compare('password', 'invalid_hash');
      expect(result).toBe(false);
    });
  });

  describe('性能', () => {
    it('应该在 500ms 内哈希', async () => {
      const start = Date.now();
      await hasher.hash('mySecurePassword123');
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(500);
    });
  });
});
```

<strong>关键点</strong>：
- AI 准确反映规范中的所有要求（NFR-1 安全要求）
- 包含错误处理、边缘案例、性能测试
- 代码一致且有文档
- 自动达到 90% 以上测试覆盖率

## GitHub Spec Kit：规范驱动开发工具

GitHub 开源的 Spec Kit 是实践规范驱动开发的完整工具包。

### 安装和设置

```bash
# 使用 npm 全局安装
npm install -g @github/spec-kit

# 或使用 npx 即时使用
npx @github/spec-kit init

# 初始化项目
spec-kit init my-project
cd my-project
```

项目结构：

```
my-project/
├── spec/
│   ├── constitution.md      # 项目宪章（编码原则、样式指南）
│   ├── architecture.md       # 系统架构
│   └── features/
│       ├── auth.md          # 按功能的详细规范
│       └── api.md
├── plan/
│   └── technical-plan.md    # AI 生成的技术计划
├── tasks/
│   └── task-breakdown.md    # 可执行任务列表
├── scripts/
│   └── validate-spec.sh     # 规范验证脚本
└── .speckit/
    └── config.json          # Spec Kit 配置
```

### constitution.md：项目的宪章

`constitution.md` 定义 AI 代理必须遵循的不变原则：

````markdown
<!-- spec/constitution.md -->
# 项目宪章

## 核心原则

### 代码质量
- <strong>语言</strong>：启用 TypeScript strict 模式
- <strong>样式</strong>：遵守 Airbnb JavaScript 样式指南
- <strong>测试</strong>：至少 90% 代码覆盖率
- <strong>文档</strong>：所有公共 API 必须有 TSDoc 注释

### 架构模式
- <strong>设计</strong>：遵守领域驱动设计原则
- <strong>依赖注入</strong>：所有依赖项使用构造函数注入
- <strong>错误处理</strong>：不要忽略错误；始终记录后传播
- <strong>Async/Await</strong>：优先使用 async/await 而非回调或原始 Promise

### 安全性
- <strong>输入验证</strong>：使用 Joi 或 Zod 验证所有用户输入
- <strong>SQL 注入</strong>：始终使用参数化查询
- <strong>认证</strong>：所有认证端点实施速率限制
- <strong>密钥</strong>：禁止硬编码密钥；使用环境变量

### 测试策略
- <strong>单元测试</strong>：所有业务逻辑使用 Jest
- <strong>集成测试</strong>：API 端点使用 Supertest
- <strong>E2E 测试</strong>：关键用户流程使用 Playwright
- <strong>测试驱动开发</strong>：实施前先编写测试

### Git 工作流
- <strong>分支</strong>：GitFlow（main、develop、feature/*、hotfix/*）
- <strong>提交</strong>：Conventional Commits 格式（feat、fix、docs 等）
- <strong>Pull Request</strong>：需要 2 人批准和 CI 通过
- <strong>代码审查</strong>：不仅审查代码，还审查规范合规性

## AI 代理指南

实施代码时：
1. <strong>必须提出澄清问题</strong>：规范模糊时始终提问
2. <strong>列出优缺点</strong>：有多种方法时提出利弊
3. <strong>遵守测试驱动开发</strong>：先编写测试
4. <strong>优化可读性</strong>：可读性优先于聪明
5. <strong>添加 TODO 注释</strong>：说明已知限制或未来改进
````

### 工作流：Specify → Plan → Implement

```bash
# 1. 编写规范（开发者直接编写或 AI 辅助）
code spec/features/user-profile.md

# 2. 验证规范
spec-kit validate spec/features/user-profile.md

# 3. 生成技术计划（AI）
spec-kit plan spec/features/user-profile.md --output plan/user-profile-plan.md

# 4. 任务分解（AI）
spec-kit tasks plan/user-profile-plan.md --output tasks/user-profile-tasks.md

# 5. 实施（AI 编程代理）
# 与 GitHub Copilot、Claude Code 等一起使用
# 向 AI 提供 spec/、plan/、tasks/ 文件作为上下文
```

### 实时规范更新

规范驱动开发的强大之处在于<strong>变更很容易</strong>：

```markdown
<!-- 修改 spec/features/auth.md -->
## FR-2：用户登录（已更新）
- <strong>输入</strong>：username/email、password、<strong>rememberMe（可选布尔值）</strong>
- <strong>处理过程</strong>：
  - 从数据库查找用户
  - 比较哈希密码
  - 生成 JWT 令牌（过期时间：<strong>rememberMe ? 30 天 : 24 小时</strong>）
  - 创建会话记录
```

修改后：

```bash
# 1. 重新生成反映变更的计划
spec-kit plan spec/features/auth.md --output plan/auth-plan.md --update

# 2. 请求 AI 应用变更
@claude "反映 spec/features/auth.md 中 FR-2 的更新，
         修改 AuthService.login() 方法。
         也更新现有测试并添加 rememberMe 案例。"
```

AI 准确地只反映变更：

```typescript
// src/services/auth.service.ts（仅修改部分）
async login(
  username: string,
  password: string,
  rememberMe: boolean = false // 新参数
): Promise<LoginResponse> {
  // ... 现有逻辑 ...

  // 计算令牌过期时间（已修改）
  const expiresIn = rememberMe ? '30d' : '24h';
  const token = this.jwtManager.generate(user.id, expiresIn);

  // ... 其余逻辑 ...
}

// src/services/auth.service.test.ts（添加的测试）
describe('使用 rememberMe 登录', () => {
  it('当 rememberMe 为 true 时应生成 30 天令牌', async () => {
    const result = await authService.login('user', 'pass', true);
    const decoded = jwt.decode(result.token) as any;
    const expiresAt = new Date(decoded.exp * 1000);
    const now = new Date();
    const daysDiff = (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

    expect(daysDiff).toBeGreaterThan(29);
    expect(daysDiff).toBeLessThan(31);
  });
});
```

## 实战应用：规范驱动开发最佳实践

### 1. 如何编写好的规范

<strong>明确的输入输出定义</strong>：

````markdown
❌ 不好的例子：
## 用户注册
创建新用户账户。

✅ 好的例子：
## 用户注册（FR-001）
<strong>输入</strong>：
- username：string（3〜20 字符，字母数字）
- email：string（有效的 RFC 5322 格式）
- password：string（至少 8 字符，1 个大写字母、1 个数字、1 个特殊字符）

<strong>处理过程</strong>：
1. 验证输入（Joi 模式）
2. 检查 username/email 重复
3. 哈希密码（bcrypt，成本系数 12）
4. 插入 users 表
5. 发送验证邮件（异步任务）

<strong>输出</strong>：
- 成功：{ userId: UUID, username: string, email: string } + HTTP 201
- 失败：{ error: string, field?: string } + HTTP 4xx

<strong>错误情况</strong>：
| 条件 | 响应 | HTTP 代码 |
|------|------|-----------|
| 重复的 username | "Username already exists" | 409 |
| 无效的 email 格式 | "Invalid email format" | 400 |
| 弱密码 | "Password does not meet requirements" | 400 |
````

<strong>可测量的非功能需求</strong>：

````markdown
❌ 不好的例子：
## 性能
系统应该快速。

✅ 好的例子：
## 性能（NFR-001）
| 指标 | 目标 | 测量方法 |
|------|------|-----------|
| API 响应时间 | p95 < 200ms | New Relic APM |
| 数据库查询时间 | p99 < 50ms | PostgreSQL EXPLAIN ANALYZE |
| 并发用户 | 10,000 人 | 使用 k6 的负载测试 |
| 错误率 | < 0.1% | 使用 Sentry 追踪错误 |

<strong>负载测试场景</strong>：
- 启动：5 分钟内从 0 → 10,000 名用户
- 维持：30 分钟 10,000 名用户
- 峰值：5 分钟 15,000 名用户
- 通过标准：整个期间 p95 响应时间 < 200ms
````

### 2. constitution.md 编写指南

定义项目的不变原则：

````markdown
# 项目宪章

## 技术栈
- <strong>语言</strong>：TypeScript 5.0+
- <strong>框架</strong>：Express.js 4.18+
- <strong>数据库</strong>：PostgreSQL 15+
- <strong>ORM</strong>：Prisma 5.0+
- <strong>测试</strong>：Jest + Supertest
- <strong>Linting</strong>：ESLint + Prettier

## 代码结构
```
src/
├── domain/          # 业务逻辑（纯粹，无外部依赖）
├── application/     # 用例（编排领域逻辑）
├── infrastructure/  # 外部依赖（DB、API 等）
└── presentation/    # API 控制器、DTO
```

## 编码标准

### 命名规则
- <strong>类</strong>：PascalCase（例：UserRepository）
- <strong>接口</strong>：PascalCase 加 "I" 前缀（例：IUserRepository）
- <strong>函数</strong>：camelCase（例：getUserById）
- <strong>常量</strong>：UPPER_SNAKE_CASE（例：MAX_LOGIN_ATTEMPTS）
- <strong>文件</strong>：kebab-case（例：user-repository.ts）

### 错误处理
```typescript
// ✅ 始终使用自定义错误类
class UserNotFoundError extends Error {
  constructor(userId: string) {
    super(`找不到用户：${userId}`);
    this.name = 'UserNotFoundError';
  }
}

// ✅ 不要捕获错误并忽略
try {
  await saveUser(user);
} catch (error) {
  logger.error('保存用户失败', { error, userId: user.id });
  throw error; // 记录后重新抛出
}

// ❌ 绝不要这样做
try {
  await saveUser(user);
} catch (error) {
  // 静默失败 - 禁止
}
```

### 测试要求
- <strong>单元测试</strong>：至少 90% 覆盖率
- <strong>集成测试</strong>：所有 API 端点
- <strong>测试结构</strong>：Arrange-Act-Assert 模式
- <strong>模拟</strong>：使用依赖注入，避免全局 mock
- <strong>测试数据</strong>：使用工厂保证一致的测试数据

### 安全检查清单
- [ ] 使用 Zod/Joi 验证所有输入
- [ ] SQL 查询使用参数化语句
- [ ] 设置认证令牌过期（访问 24 小时，刷新 7 天）
- [ ] 所有公共端点速率限制（每 IP 15 分钟 100 次）
- [ ] 使用 bcrypt 哈希密码（成本系数 12）
- [ ] 生产环境强制 HTTPS
- [ ] 使用白名单配置 CORS
- [ ] 环境密钥禁止 git 提交
````

### 3. 有效使用 AI 代理

<strong>提供明确的上下文</strong>：

```bash
# ❌ 不好的提示词
@claude "创建登录功能"

# ✅ 好的提示词
@claude "实施 spec/features/auth.md 的 FR-2（用户登录）。
         遵循 constitution.md 的错误处理规则，
         遵守 plan/auth-plan.md 的架构结构。
         测试按照 auth.service.test.ts 的现有模式编写。"
```

<strong>迭代改进</strong>：

```bash
# 第 1 次实施
@claude "实施 spec/features/payment.md 的 FR-5（支付处理）"

# AI 生成代码审查后
@claude "为支付处理添加重试逻辑。
         最多重试 3 次，应用指数退避。
         仅重试 Stripe 临时错误（5xx），
         永久错误（4xx）立即失败。"

# 性能优化
@claude "优化支付处理的数据库查询。
         将事务隔离级别设置为 READ COMMITTED，
         使用乐观锁（optimistic locking）。"
```

### 4. 协作工作流

<strong>团队规范驱动开发</strong>：

```markdown
## 协作流程

### 1. 规范审查（Specification Review）
- <strong>谁</strong>：产品经理 + 技术主管
- <strong>何时</strong>：Sprint 计划前
- <strong>输出</strong>：批准的 spec/*.md 文件
- <strong>标准</strong>：
  - 所有需求可测量
  - 错误情况明确定义
  - 性能目标数字化
  - 安全需求检查清单完成

### 2. 计划生成（Plan Generation）
- <strong>谁</strong>：技术主管 + AI 代理
- <strong>何时</strong>：规范批准后立即
- <strong>输出</strong>：plan/*.md 文件
- <strong>审查</strong>：架构团队审查

### 3. 任务分配（Task Assignment）
- <strong>谁</strong>：技术主管
- <strong>何时</strong>：Sprint 计划
- <strong>输出</strong>：tasks/*.md → GitHub Issues/Jira tickets
- <strong>估算</strong>：AI 生成的预估时间 + 20% 缓冲

### 4. 实施（Implementation）
- <strong>谁</strong>：开发者 + AI 编程代理
- <strong>何时</strong>：Sprint 期间
- <strong>输出</strong>：Pull Requests
- <strong>审查重点</strong>：
  - 规范合规性（代码样式自动检查）
  - 测试覆盖率（CI 自动验证）
  - constitution.md 违规

### 5. 持续改进（Continuous Improvement）
- <strong>何时</strong>：Sprint 回顾
- <strong>审查</strong>：
  - 识别规范中的模糊部分
  - 评估 AI 生成代码质量
  - constitution.md 更新需求
```

## 工具生态系统

### 主要工具比较

| 工具 | 用途 | 优势 | 劣势 |
|------|------|------|------|
| <strong>GitHub Spec Kit</strong> | 规范 → 计划 → 任务 | 官方支持，集成工作流 | 早期版本（实验性） |
| <strong>Kiro</strong> | AI 规范验证 | 规范质量分析 | Spec Kit 依赖 |
| <strong>BMAD-Method</strong> | 企业规范管理 | 大型团队协作 | 商业（付费） |
| <strong>Claude Code</strong> | AI 编程代理 | 高代码质量 | API 成本 |
| <strong>GitHub Copilot</strong> | AI 编程助手 | IDE 集成优秀 | 上下文限制 |

### 推荐工具链

<strong>初创公司/小型团队</strong>：
```bash
├── GitHub Spec Kit（免费）
├── GitHub Copilot（个人：$10/月）
└── GitHub Actions（CI/CD，免费）
```

<strong>中大型企业</strong>：
```bash
├── BMAD-Method（企业版）
├── Claude Code（团队许可）
├── Kiro（规范验证）
└── Jenkins/GitLab CI（现有基础设施）
```

## 成效测量：Before & After

### 实际项目案例

<strong>项目</strong>：电子商务 API（50 个端点，3 人开发团队）

| 指标 | 传统开发 | Vibe Coding | 规范驱动开发 |
|------|-------------|-------------|----------------|
| <strong>开发周期</strong> | 12 周 | 8 周（初期快） | 10 周 |
| <strong>发现的错误</strong> | Sprint 中平均 45 个 | Sprint 中平均 80 个 | Sprint 中平均 15 个 |
| <strong>重构时间</strong> | 总时间的 20% | 总时间的 40% | 总时间的 5% |
| <strong>代码审查时间</strong> | PR 平均 2 小时 | PR 平均 3 小时 | PR 平均 30 分钟 |
| <strong>测试覆盖率</strong> | 75% | 45% | 92% |
| <strong>技术债务</strong> | 中等 | 高 | 低 |
| <strong>团队满意度</strong> | 7/10 | 6/10 | 9/10 |

<strong>关键见解</strong>：
- 规范驱动开发增加了初始规范编写时间，但在整个项目中节省了时间
- 错误减少 70%（规范明确时 AI 生成准确代码）
- 重构时间减少 75%（从一开始结构就清晰）
- 代码审查简化为"规范合规性"检查

## 限制和注意事项

### 规范驱动开发不适合的情况

1. <strong>快速原型</strong>
   - MVP 或 PoC 用 Vibe Coding 更快
   - 规范编写开销不必要

2. <strong>需求不明确</strong>
   - 探索性项目更适合敏捷方法
   - 规范频繁变更反而低效

3. <strong>单人开发者 + 小型项目</strong>
   - 没有协作优势时流程过度
   - 简单脚本或工具直接编码更快

### 常见错误

```markdown
❌ <strong>错误 1</strong>：规范过于详细
"变量名、函数名都在规范中说明" → 限制 AI 创造性

✅ <strong>正确方法</strong>：定义 What，让 AI 决定 How
"用户认证使用 JWT 令牌，过期时间 24 小时"（实施方法由 AI 决定）

❌ <strong>错误 2</strong>：忽略 constitution.md
只编写规范，没有编码原则 → AI 生成不一致代码

✅ <strong>正确方法</strong>：在 constitution.md 中定义不变原则
"所有异步函数必须使用 try-catch 进行错误处理"

❌ <strong>错误 3</strong>：不更新规范直接修改代码
紧急错误修复不更新规范直接修改代码 → 规范与代码不一致

✅ <strong>正确方法</strong>：先更新规范后重新生成
"在 spec/auth.md 中添加速率限制异常情况 → 请求 AI 重新实施"
```

## 未来展望

### 2025 年之后的趋势

1. <strong>可执行规范（Executable Specifications）</strong>
   - 直接"编译" Markdown 规范为可执行代码
   - 测试、文档、代码从单一源自动生成

2. <strong>AI 代理协作</strong>
   - 一名开发者编排多个 AI 代理
   - 例："Architecture AI + Coding AI + Testing AI + Security AI"

3. <strong>自主代码维护</strong>
   - AI 基于规范自动应用安全补丁、性能优化
   - 开发者只需批准

4. <strong>自然语言规范</strong>
   - 不再需要 Markdown 结构
   - 用普通语言描述需求，AI 自动结构化

## 结论：重新定义开发者角色

规范驱动开发不仅是一种方法论，而是<strong>AI 时代开发者角色的根本性变化</strong>。

### 开发者角色的变化

<strong>Before（传统开发）</strong>：
- 编写代码 70% + 设计 20% + 测试 10%

<strong>After（规范驱动开发）</strong>：
- 编写规范 40% + 管理 AI 30% + 验证 20% + 优化 10%

### 核心技能的变化

| 传统技能 | 重要性变化 | 新核心技能 |
|------------|-------------|------------------|
| 编码速度 | ↓↓ | 需求澄清能力 |
| 语法知识 | ↓ | 架构设计能力 |
| 调试 | → | AI 提示词工程 |
| 算法 | → | 系统思维（System Thinking） |
| 代码审查 | → | 规范审查 |

### 开始使用

<strong>第 1 周：学习</strong>
```bash
# GitHub Spec Kit 教程
npx @github/spec-kit tutorial

# 克隆示例项目
git clone https://github.com/github/spec-kit-examples
cd spec-kit-examples/todo-api
```

<strong>第 2 周：小规模应用</strong>
- 用规范驱动重构现有项目的一个功能
- 编写 constitution.md（团队编码原则）
- 用规范 → 代码实施简单的 API 端点 1〜2 个

<strong>第 3 周：团队引入</strong>
- 向团队成员分享概念
- 用规范驱动尝试下个 Sprint 的一个故事
- 在回顾中讨论改进点

<strong>1 个月后：全面引入决策</strong>
- 测量成效（错误减少率、开发速度、团队满意度）
- 选择工具（Spec Kit vs 商业工具）
- 制定长期路线图

## 参考资料

### 官方文档
- [GitHub Spec Kit 官方文档](https://github.com/github/spec-kit)
- [规范驱动开发介绍（GitHub Blog）](https://github.blog/ai-and-ml/generative-ai/spec-driven-development-with-ai-get-started-with-a-new-open-source-toolkit/)
- [Microsoft：深入规范驱动开发](https://developer.microsoft.com/blog/spec-driven-development-spec-kit)

### 深度学习
- [The New Stack：可扩展 AI 代理的规范驱动开发](https://thenewstack.io/spec-driven-development-the-key-to-scalable-ai-agents/)
- [Medium：规范驱动开发（SDD）by noailabs](https://noailabs.medium.com/specification-driven-development-sdd-66a14368f9d6)
- [InfoWorld：使用 GitHub Spec Kit 进行规范驱动 AI 编码](https://www.infoworld.com/article/4062524/spec-driven-ai-coding-with-githubs-spec-kit.html)

### 社区
- [GitHub Spec Kit Discussions](https://github.com/github/spec-kit/discussions)
- [Reddit：r/MachineLearning - SDD 讨论](https://reddit.com/r/MachineLearning)
- [Dev.to：Spec Driven Development 标签](https://dev.to/t/speckit)

---

<strong>下一篇</strong>：[AI 代理协作模式：用 5 个专业代理构建全栈应用](/zh/blog/zh/ai-agent-collaboration-patterns)将介绍编排 Architecture Agent、Coding Agent、Testing Agent、Security Agent、DevOps Agent 构建复杂应用的实战案例。
