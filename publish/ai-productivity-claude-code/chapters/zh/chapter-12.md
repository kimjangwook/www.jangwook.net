# Chapter 12: Deep Agents 架构

## 引言:AI agent系统的演进

2025年,AI agent系统迎来了重要的转折点。从早期简单的工具调用agent(Shallow Agents),开始演进为能够执行复杂长期任务的Deep Agents。

LangChain和AWS的Philipp Schmid提出的Deep Agents范式由以下四个核心支柱构成:

1. **Explicit Planning (显式规划)**: 生成结构化计划而非隐式推理
2. **Hierarchical Delegation (分层委托)**: 将任务委托给合适的专业agent
3. **Persistent Memory (持久化内存)**: 跨会话维护上下文和状态
4. **Extreme Context Engineering (极致上下文工程)**: 在上下文中包含所有相关信息

本章将提供在实际应用中利用每个支柱的具体方案。

---

## Recipe 12.1: Deep vs Shallow Agents

### 问题 (Problem)

传统AI agent只能执行5〜15步以内的短任务,失败时立即中断。要执行复杂的长期任务(例如:多语言博客文章创作、全站SEO审计),需要人工多次介入。

### 解决方案 (Solution)

理解Shallow Agents和Deep Agents的区别,选择合适的范式。

#### Shallow Agents (Agent 1.0)

**特点**:
- 简单的ReAct模式 (Reasoning → Action → Observation)
- 5〜15步以内的短任务
- 失败时立即中断
- 上下文不持久

**适用任务**:
- 简单信息查询
- 单文件修改
- 快速数据转换

**工作流程**:

```
请求 → 工具调用 → 结果 → 完成/失败
```

#### Deep Agents (Agent 2.0)

**特点**:
- 可执行100+步的长期任务
- 显式计划和重新规划
- 持续状态管理
- 自动恢复和适应

**适用任务**:
- 多语言内容生成
- 复杂重构
- 数据pipeline构建
- 整体项目分析

**工作流程**:

```
请求 → 目标分析 → 制定计划 → 执行任务 → 验证 → 重新规划(如需) → 完成
```

### 代码/示例 (Code)

#### Shallow Agent示例:单文件修改

```markdown
# 用户请求
"请修改src/utils/format.ts文件中的日期格式函数。"

# Shallow Agent执行
1. Read: src/utils/format.ts
2. Edit: 修改formatDate函数
3. 完成

# 总计3步,1分钟
```

#### Deep Agent示例:多语言博客文章创作

```markdown
# 用户请求
"请撰写关于TypeScript 5.0新功能的深度分析博客文章。
包含代码示例和性能基准测试,并制作韩语、英语、日语版本。"

# Deep Agent执行计划
## Phase A: 准备 (并行, 5分钟)
1. [web-researcher] 调查TypeScript 5.0官方发布说明
2. [web-researcher] 收集性能基准测试数据
3. [image-generator] 生成hero图片

## Phase B: 撰写 (顺序, 15分钟)
4. [writing-assistant] 撰写韩语草稿 (2500字+)
5. [writing-assistant] 撰写英语版本
6. [writing-assistant] 撰写日语版本

## Phase C: 验证 (顺序, 5分钟)
7. [editor] 审核所有版本质量
8. [seo-optimizer] 优化元数据和关键词
9. [site-manager] 构建验证

# 总计9步,25分钟
# 自动恢复: Step 4-6失败时使用具体反馈重写
```

### 说明 (Explanation)

**Shallow Agents的局限**:

1. **短上下文窗口**: 对话变长时丢失初始上下文
2. **状态不持久**: 失败时需从头开始
3. **需要手动协调**: 复杂任务需要人工逐步指导

**Deep Agents的优势**:

1. **支持长期任务**: 通过显式计划管理100+步
2. **自动恢复**: 根据失败类型重试、重新规划或升级
3. **状态持久**: 中断后可恢复
4. **透明性**: 提升进度追踪和可预测性

### 变体 (Variations)

#### 混合方法

简单任务使用Shallow Agent,复杂任务才使用Deep Agent:

```typescript
// 评估任务复杂度
function assessComplexity(request: string): 'simple' | 'complex' {
  const indicators = {
    multiStep: /步骤|顺序|首先.*然后/.test(request),
    multiFile: /所有|全部|多个/.test(request),
    multiLanguage: /多语言|翻译|语言/.test(request),
    longDuration: /分析|重构|优化/.test(request)
  };

  const score = Object.values(indicators).filter(Boolean).length;
  return score >= 2 ? 'complex' : 'simple';
}

// 选择合适的agent
if (assessComplexity(userRequest) === 'complex') {
  await deepAgent.execute(userRequest);
} else {
  await shallowAgent.execute(userRequest);
}
```

#### 渐进式升级

将现有Shallow Agent逐步转换为Deep Agent:

```markdown
# Step 1: 添加显式计划
- 任务开始前生成简单清单

# Step 2: 添加恢复逻辑
- 失败时重试1次

# Step 3: 添加状态保存
- 每个主要阶段记录进度

# Step 4: 完整Deep Agent
- 实现完整protocol
```

---

## Recipe 12.2: Explicit Planning (显式规划)

### 问题 (Problem)

AI agent在执行复杂任务时即兴进行会产生以下问题:
- 执行重复工作
- 忽略依赖关系导致失败
- 错过并行执行机会
- 无法追踪进度

### 解决方案 (Solution)

对所有复杂任务首先生成显式且结构化的计划。

#### Planning Protocol组成要素

```markdown
## 任务计划模板

### 1. 明确目标
- 最终产出: [具体描述]
- 成功标准: [可测量的标准]
- 范围限制: [排除事项]

### 2. 步骤分解
- 每个步骤由一个agent执行
- 明确每个步骤的预计时间
- 清晰标明依赖关系

### 3. 资源分配
- 所需工具: [工具列表]
- 所需上下文: [文件、数据]
- 预计token使用量: [粗略估算]

### 4. 风险评估
- 潜在失败点: [已识别风险]
- 替代路径: [Plan B]
- 恢复策略: [失败时的应对]
```

### 代码/示例 (Code)

#### 示例1:多语言博客文章计划

```markdown
## 任务计划: TypeScript 5.0深度分析文章

### 1. 明确目标
- **最终产出**:
  - 韩语、英语、日语3个版本的博客文章
  - 每个版本2500字以上
  - 包含5个以上代码示例
  - 包含性能基准测试图表
- **成功标准**:
  - `npm run build` 成功
  - 遵守Frontmatter schema
  - SEO description 150-160字
- **范围限制**:
  - 不包含中文版本
  - 不包含视频教程

### 2. 步骤分解

#### Phase A: 准备 (可并行执行)
- **Step 1** [web-researcher, 3分钟]
  - 任务: 调查TypeScript 5.0官方发布说明
  - 输出: `.claude/memory/research/ts5-release-notes.md`
  - 依赖: 无

- **Step 2** [web-researcher, 3分钟]
  - 任务: 收集社区反应和用例
  - 输出: `.claude/memory/research/ts5-community.md`
  - 依赖: 无

- **Step 3** [image-generator, 2分钟]
  - 任务: 生成hero图片
  - 输出: `src/assets/blog/typescript-5-hero.jpg`
  - 依赖: 无

#### Phase B: 撰写 (顺序执行)
- **Step 4** [writing-assistant, 8分钟]
  - 任务: 撰写韩语草稿
  - 输入: Step 1, 2的结果
  - 输出: `src/content/blog/ko/typescript-5-deep-dive.md`
  - 依赖: Step 1, 2, 3完成

- **Step 5** [writing-assistant, 6分钟]
  - 任务: 撰写英语版本
  - 输入: 参考Step 4的结构
  - 输出: `src/content/blog/en/typescript-5-deep-dive.md`
  - 依赖: Step 4完成

- **Step 6** [writing-assistant, 6分钟]
  - 任务: 撰写日语版本
  - 输入: 参考Step 4的结构
  - 输出: `src/content/blog/ja/typescript-5-deep-dive.md`
  - 依赖: Step 4完成

#### Phase C: 验证 (顺序执行)
- **Step 7** [editor, 4分钟]
  - 任务: 审核所有版本质量
  - 验证: 语法、技术准确性、一致性
  - 依赖: Step 4, 5, 6完成

- **Step 8** [seo-optimizer, 2分钟]
  - 任务: 优化元数据
  - 验证: description长度、关键词密度
  - 依赖: Step 7完成

- **Step 9** [site-manager, 1分钟]
  - 任务: 构建验证
  - 验证: `npm run build` 成功
  - 依赖: Step 8完成

### 3. 资源分配
- **所需工具**:
  - WebSearch (Step 1, 2)
  - Image Generator API (Step 3)
  - File System (Step 4-9)
  - Bash (Step 9)
- **所需上下文**:
  - `CLAUDE.md` (博客撰写指南)
  - `src/content.config.ts` (schema定义)
  - 现有TypeScript相关文章2篇 (参考)
- **预计token使用量**:
  - Phase A: 15,000 tokens
  - Phase B: 45,000 tokens
  - Phase C: 10,000 tokens
  - 总计: 70,000 tokens

### 4. 风险评估
- **潜在失败点**:
  - Step 1-2: 网络搜索API限制
    - 替代: 使用Context7 MCP查询官方文档
  - Step 3: 图片生成API错误
    - 替代: 重用现有TypeScript图片
  - Step 4-6: 篇幅不足
    - 恢复: 使用具体反馈请求重写
  - Step 9: 构建失败
    - 恢复: 分析错误日志后修复

### 5. 预计耗时
- Phase A: 3分钟 (并行)
- Phase B: 8分钟 (Step 4) + 并行6分钟 (Step 5, 6)
- Phase C: 7分钟 (顺序)
- **总计: 24分钟**

### 6. 并行执行策略
- **Phase A**: 3个步骤并行执行
- **Phase B**: Step 5, 6并行执行 (参考Step 4)
- **Phase C**: 顺序执行 (保证质量)
```

#### 示例2:用TypeScript代码表示计划

```typescript
interface ExecutionPlan {
  goal: string;
  successCriteria: string[];
  scope: {
    included: string[];
    excluded: string[];
  };
  phases: Phase[];
  resources: {
    tools: string[];
    context: string[];
    estimatedTokens: number;
  };
  risks: Risk[];
}

interface Phase {
  name: string;
  parallelizable: boolean;
  steps: Step[];
}

interface Step {
  id: number;
  agent: string;
  task: string;
  estimatedDuration: number; // minutes
  dependencies: number[]; // step IDs
  inputs: string[];
  outputs: string[];
}

interface Risk {
  step: number;
  description: string;
  probability: 'low' | 'medium' | 'high';
  mitigation: string;
  alternative: string;
}

// 计划生成函数
async function createExecutionPlan(
  request: string
): Promise<ExecutionPlan> {
  const analysis = await analyzeRequest(request);
  const steps = await decomposeIntoSteps(analysis);
  const phases = await groupIntoPhases(steps);
  const risks = await identifyRisks(steps);

  return {
    goal: analysis.goal,
    successCriteria: analysis.criteria,
    scope: analysis.scope,
    phases,
    resources: {
      tools: steps.flatMap(s => s.requiredTools),
      context: analysis.requiredContext,
      estimatedTokens: estimateTokenUsage(steps)
    },
    risks
  };
}
```

### 说明 (Explanation)

#### 为什么需要显式计划?

1. **可预测性**: 可提前估算任务时间和资源
2. **并行化**: 通过依赖分析识别可同时执行的步骤
3. **可恢复性**: 预测失败点并准备替代方案
4. **透明性**: 用户和系统都能掌握进度

#### 计划生成原则

1. **SMART目标**:
   - Specific (具体): "撰写博客文章" → "2500字以上,包含5个代码示例"
   - Measurable (可测量): "质量审核" → "语法错误0个,技术准确性95%+"
   - Achievable (可实现): 使用当前工具和上下文可实现
   - Relevant (相关): 与用户请求直接相关
   - Time-bound (有时限): 明确每个步骤的预计时间

2. **依赖图**:
   - 明确每个步骤的前置条件
   - 防止循环依赖
   - 识别可并行执行的步骤

3. **基于风险的计划**:
   - 评估每个步骤的失败可能性
   - 提前准备替代路径
   - 包含恢复策略

### 变体 (Variations)

#### 动态计划调整

根据执行过程中的新信息修改计划:

```typescript
async function executePlanWithAdaptation(
  plan: ExecutionPlan
): Promise<void> {
  for (const phase of plan.phases) {
    const results = await executePhase(phase);

    // 根据结果调整后续步骤
    if (results.qualityScore < 0.8) {
      // 质量不达标时插入额外审核步骤
      const reviewStep = createReviewStep(phase);
      plan.phases.splice(
        plan.phases.indexOf(phase) + 1,
        0,
        { name: 'Additional Review', steps: [reviewStep] }
      );
    }

    // 比预期快完成时提前执行下一步
    if (results.duration < phase.estimatedDuration * 0.7) {
      await executePhase(plan.phases[plan.phases.indexOf(phase) + 1]);
    }
  }
}
```

#### 渐进式细化

最初只生成高层计划,执行前才细化:

```markdown
# 初始计划 (High-Level)
1. 研究 → 2. 撰写 → 3. 验证

# Step 1执行前细化
1. 研究
   1.1. 调查官方文档 (web-researcher, 3分钟)
   1.2. 收集社区反应 (web-researcher, 3分钟)
   1.3. 收集基准测试数据 (web-researcher, 2分钟)
```

---

## Recipe 12.3: Hierarchical Delegation (分层委托)

### 问题 (Problem)

如果一个agent处理所有任务会产生以下问题:
- 上下文过载 (责任太多)
- 缺乏专业性 (不可能精通所有领域)
- 无法并行执行 (单线程)

### 解决方案 (Solution)

通过层级结构将复杂任务委托给合适的专业agent。

#### 3层架构

```
用户
  ↓
Orchestrator (协调者)
  ↓
Cluster Leader (领域专家)
  ↓
Individual Agents (具体任务执行者)
```

### 代码/示例 (Code)

#### Cluster定义

```yaml
# .claude/guidelines/agent-clusters.md

content-creation:
  leader: writing-assistant
  members:
    - content-planner
    - editor
    - image-generator
  capabilities:
    - 博客文章撰写
    - 内容策略制定
    - 语法/风格审核
    - hero图片生成
  communication: leader负责任务协调

research-analysis:
  leader: web-researcher
  members:
    - post-analyzer
    - analytics
    - analytics-reporter
  capabilities:
    - 网络研究
    - 内容分析
    - 流量分析
    - 数据报告生成

seo-marketing:
  leader: seo-optimizer
  members:
    - backlink-manager
    - social-media-manager
  capabilities:
    - sitemap优化
    - meta标签管理
    - 反向链接策略
    - 社交媒体分享

content-discovery:
  leader: content-recommender
  members: []
  capabilities:
    - 语义推荐
    - 相关内容发现

operations:
  leader: site-manager
  members:
    - portfolio-curator
    - learning-tracker
    - improvement-tracker
    - prompt-engineer
  capabilities:
    - 构建/部署
    - 作品集管理
    - 学习追踪
    - prompt优化
```

#### Orchestrator实现

```typescript
// 将.claude/agents/orchestrator.md用TypeScript表示

interface OrchestratorWorkflow {
  // Phase 1: 请求分析
  async analyze(request: string): Promise<TaskAnalysis> {
    return {
      goals: this.extractGoals(request),
      requirements: this.extractRequirements(request),
      successCriteria: this.defineSuccessCriteria(request),
      complexity: this.assessComplexity(request),
      primaryDomain: this.identifyDomain(request) // 哪个cluster?
    };
  }

  // Phase 2: 制定计划
  async plan(analysis: TaskAnalysis): Promise<ExecutionPlan> {
    const steps = this.decomposeIntoSteps(analysis);
    const agents = this.assignAgents(steps);
    const dependencies = this.identifyDependencies(steps);
    const parallel = this.findParallelOpportunities(dependencies);

    return { steps, agents, dependencies, parallel };
  }

  // Phase 3: 委托给cluster
  async execute(plan: ExecutionPlan): Promise<void> {
    for (const phase of plan.phases) {
      // 按cluster分组
      const clusterGroups = this.groupByCluster(phase.steps);

      // 委托给cluster leader
      const results = await Promise.all(
        Object.entries(clusterGroups).map(([cluster, steps]) =>
          this.delegateToClusterLeader(cluster, steps)
        )
      );

      await this.updateState(phase, results);
      await this.qualityCheck(phase, results);
    }
  }

  // 委托给cluster leader
  async delegateToClusterLeader(
    cluster: string,
    steps: Step[]
  ): Promise<StepResult[]> {
    const leader = this.getClusterLeader(cluster);

    // 创建委托上下文
    const context = {
      task: this.summarizeSteps(steps),
      guidelines: this.loadGuidelines(),
      resources: this.gatherResources(steps),
      qualityCriteria: this.defineQualityCriteria(steps)
    };

    return await leader.execute(context);
  }

  // Phase 4: 结果综合
  async synthesize(results: StepResult[]): Promise<FinalResult> {
    return {
      deliverables: this.collectDeliverables(results),
      summary: this.generateSummary(results),
      metrics: this.calculateMetrics(results),
      nextSteps: this.suggestNextSteps(results)
    };
  }
}
```

#### 委托上下文示例

```markdown
## Cluster Leader委托示例

### To: writing-assistant (content-creation leader)

#### 任务
撰写韩语、英语、日语博客文章

#### 传递信息
1. **项目规则**:
   - `CLAUDE.md`的博客撰写指南
   - Frontmatter schema (title, description, pubDate, heroImage, tags)
   - pubDate使用'YYYY-MM-DD'格式

2. **研究结果**:
   - TypeScript 5.0发布说明摘要 (1500字)
   - 社区反应 (500字)
   - 性能基准测试数据 (3个图表)

3. **参考文章**:
   - `src/content/blog/ko/typescript-4-9.md`
   - `src/content/blog/ko/typescript-best-practices.md`

4. **目标读者**:
   - 韩语: 中级以上开发者
   - 英语: 国际开发者
   - 日语: 日本企业开发者

5. **SEO要求**:
   - 关键词: "TypeScript 5.0", "타입스크립트", "装饰器"
   - description: 150-160字

6. **图片路径**:
   - heroImage: `../../../assets/blog/typescript-5-hero.jpg`

#### 质量标准
- Frontmatter完整性: 包含所有必需字段
- 篇幅: 每种语言2500字以上
- 代码示例: 5个以上
- 技术准确性: 基于官方文档
- SEO优化: 遵守description长度

#### 下级任务委托权限
writing-assistant可进一步委托给以下agent:
- **editor**: 审核草稿并提出修改建议
- **image-generator**: 需要额外图表时
- **content-planner**: 需要结构改进建议时

#### 预计耗时
- 韩语草稿: 8分钟
- 英语/日语翻译: 各6分钟 (并行)
- 总计: 14分钟
```

### 说明 (Explanation)

#### 分层委托的优势

1. **上下文聚焦**:
   - Orchestrator: 专注于整体计划和协调
   - Cluster Leader: 协调领域内任务
   - Individual Agent: 执行具体任务

2. **专业性**:
   - 每个agent在自己的领域发挥最佳性能
   - 工具和prompt专门化

3. **并行执行**:
   - 多个cluster可同时工作
   - cluster内部agent之间也可并行执行

4. **可扩展性**:
   - 易于添加新agent (添加到现有cluster)
   - 易于创建新cluster (独立领域)

#### 委托protocol

```typescript
interface DelegationProtocol {
  // 1. 选择委托对象
  selectAgent(task: Task): Agent {
    const domain = this.identifyDomain(task);
    const cluster = this.getCluster(domain);
    return cluster.leader;
  }

  // 2. 打包上下文
  packageContext(task: Task, agent: Agent): Context {
    return {
      task: this.formatTaskForAgent(task, agent),
      guidelines: this.loadRelevantGuidelines(agent),
      resources: this.gatherResources(task),
      examples: this.findSimilarExamples(task),
      qualityCriteria: this.defineQualityCriteria(task)
    };
  }

  // 3. 执行委托
  async delegate(agent: Agent, context: Context): Promise<Result> {
    const result = await agent.execute(context);
    await this.validateResult(result, context.qualityCriteria);
    return result;
  }

  // 4. 验证结果
  async validateResult(result: Result, criteria: Criteria): Promise<void> {
    if (!this.meetsQuality(result, criteria)) {
      throw new QualityError('Result does not meet criteria');
    }
  }
}
```

### 变体 (Variations)

#### 动态cluster构建

根据任务创建临时cluster:

```typescript
async function createAdHocCluster(task: Task): Promise<Cluster> {
  const requiredCapabilities = analyzeRequiredCapabilities(task);
  const agents = selectAgentsByCapabilities(requiredCapabilities);
  const leader = electLeader(agents); // 选择最合适的agent作为leader

  return {
    name: `adhoc-${task.id}`,
    leader,
    members: agents.filter(a => a !== leader),
    capabilities: requiredCapabilities
  };
}
```

#### Agent间直接通信

不经过leader的agent间直接协作:

```typescript
// editor直接向writing-assistant提供反馈
const feedback = await editor.review(draft);
const revised = await writingAssistant.revise(draft, feedback);

// 仅向orchestrator报告最终结果
return revised;
```

---

## Recipe 12.4: Persistent Memory (持久化内存)

### 问题 (Problem)

会话结束后所有上下文都会消失。长期任务中断后需从头开始,无法重用之前的工作结果。

### 解决方案 (Solution)

将任务状态、上下文、中间结果持续保存到文件系统。

### 代码/示例 (Code)

#### 状态管理目录结构

```
.claude/
└── memory/
    ├── task-state.json          # 当前任务状态
    ├── task-history.json        # 任务历史
    ├── context-cache/           # 上下文缓存
    │   ├── research/            # 研究结果
    │   ├── drafts/              # 草稿
    │   └── reviews/             # 审核结果
    └── recovery-points/         # 恢复点
        ├── checkpoint-001.json
        ├── checkpoint-002.json
        └── ...
```

#### task-state.json schema

```typescript
interface TaskState {
  current_task: {
    id: string;                  // "task_20251118_001"
    started_at: string;          // ISO 8601 timestamp
    updated_at: string;
    goal: string;
    status: 'planning' | 'in_progress' | 'paused' | 'completed' | 'failed';
    plan: ExecutionPlan;
    progress: {
      total_steps: number;
      completed_steps: number;
      current_step: number;
    };
    context: Record<string, any>;
  };
  recovery_points: RecoveryPoint[];
  metrics: {
    token_usage: number;
    elapsed_time: number;       // seconds
    retries: number;
  };
}

interface RecoveryPoint {
  id: string;
  step: number;
  timestamp: string;
  state_snapshot: string;       // JSON stringified state
  artifacts: string[];          // paths to saved files
}

// 示例数据
const exampleState: TaskState = {
  current_task: {
    id: "task_20251118_001",
    started_at: "2025-11-18T10:00:00Z",
    updated_at: "2025-11-18T10:15:00Z",
    goal: "TypeScript 5.0多语言博客文章撰写",
    status: "in_progress",
    plan: {
      phases: [
        {
          name: "Phase A: 准备",
          steps: [
            {
              id: 1,
              agent: "web-researcher",
              task: "调查TypeScript 5.0",
              status: "completed",
              output_path: ".claude/memory/context-cache/research/ts5-release-notes.md",
              completed_at: "2025-11-18T10:03:00Z"
            },
            {
              id: 2,
              agent: "web-researcher",
              task: "收集社区反应",
              status: "completed",
              output_path: ".claude/memory/context-cache/research/ts5-community.md",
              completed_at: "2025-11-18T10:05:00Z"
            },
            {
              id: 3,
              agent: "image-generator",
              task: "生成hero图片",
              status: "completed",
              output_path: "src/assets/blog/typescript-5-hero.jpg",
              completed_at: "2025-11-18T10:07:00Z"
            }
          ]
        },
        {
          name: "Phase B: 撰写",
          steps: [
            {
              id: 4,
              agent: "writing-assistant",
              task: "撰写韩语草稿",
              status: "in_progress",
              progress: 60,
              started_at: "2025-11-18T10:10:00Z"
            },
            {
              id: 5,
              agent: "writing-assistant",
              task: "撰写英语版本",
              status: "pending"
            },
            {
              id: 6,
              agent: "writing-assistant",
              task: "撰写日语版本",
              status: "pending"
            }
          ]
        }
      ]
    },
    progress: {
      total_steps: 9,
      completed_steps: 3,
      current_step: 4
    },
    context: {
      research_summary: "TypeScript 5.0引入装饰器标准化、const类型参数等...",
      target_audience: "中级以上开发者",
      keywords: ["TypeScript 5.0", "타입스크립트", "装饰器"]
    }
  },
  recovery_points: [
    {
      id: "checkpoint-001",
      step: 3,
      timestamp: "2025-11-18T10:07:00Z",
      state_snapshot: "{...}",
      artifacts: [
        ".claude/memory/context-cache/research/ts5-release-notes.md",
        ".claude/memory/context-cache/research/ts5-community.md",
        "src/assets/blog/typescript-5-hero.jpg"
      ]
    }
  ],
  metrics: {
    token_usage: 25000,
    elapsed_time: 900,  // 15 minutes
    retries: 0
  }
};
```

#### 状态管理函数

```typescript
// 读取状态
async function readTaskState(): Promise<TaskState | null> {
  const path = '.claude/memory/task-state.json';
  try {
    const content = await fs.readFile(path, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
}

// 更新状态
async function updateTaskState(
  updates: Partial<TaskState['current_task']>
): Promise<void> {
  const state = await readTaskState() || createNewState();

  state.current_task = {
    ...state.current_task,
    ...updates,
    updated_at: new Date().toISOString()
  };

  await fs.writeFile(
    '.claude/memory/task-state.json',
    JSON.stringify(state, null, 2)
  );
}

// 记录步骤完成
async function completeStep(
  stepId: number,
  output: any
): Promise<void> {
  const state = await readTaskState();

  // 找到对应步骤
  const step = findStepById(state.current_task.plan, stepId);

  step.status = 'completed';
  step.output = output;
  step.completed_at = new Date().toISOString();

  // 更新进度
  state.current_task.progress.completed_steps += 1;
  state.current_task.progress.current_step = stepId + 1;

  // 创建恢复点 (每5步)
  if (stepId % 5 === 0) {
    await createRecoveryPoint(state, stepId);
  }

  await saveTaskState(state);
}

// 创建恢复点
async function createRecoveryPoint(
  state: TaskState,
  stepId: number
): Promise<void> {
  const checkpoint: RecoveryPoint = {
    id: `checkpoint-${String(stepId).padStart(3, '0')}`,
    step: stepId,
    timestamp: new Date().toISOString(),
    state_snapshot: JSON.stringify(state.current_task),
    artifacts: collectArtifacts(state, stepId)
  };

  state.recovery_points.push(checkpoint);

  // 另外保存到单独文件 (安全性)
  await fs.writeFile(
    `.claude/memory/recovery-points/${checkpoint.id}.json`,
    JSON.stringify(checkpoint, null, 2)
  );
}

// 恢复任务
async function resumeTask(): Promise<void> {
  const state = await readTaskState();

  if (!state || state.current_task.status === 'completed') {
    console.log('没有可恢复的任务。');
    return;
  }

  console.log(`恢复任务: ${state.current_task.goal}`);
  console.log(`进度: ${state.current_task.progress.completed_steps}/${state.current_task.progress.total_steps}`);

  // 从当前步骤继续
  const currentStep = state.current_task.progress.current_step;
  const remainingSteps = getRemainingSteps(state.current_task.plan, currentStep);

  for (const step of remainingSteps) {
    await executeStep(step);
  }
}

// 回滚到之前的恢复点
async function rollbackToCheckpoint(checkpointId: string): Promise<void> {
  const state = await readTaskState();
  const checkpoint = state.recovery_points.find(cp => cp.id === checkpointId);

  if (!checkpoint) {
    throw new Error(`Checkpoint ${checkpointId} not found`);
  }

  // 恢复状态
  state.current_task = JSON.parse(checkpoint.state_snapshot);
  state.current_task.status = 'paused';

  console.log(`回滚到Checkpoint ${checkpointId} (Step ${checkpoint.step})`);

  await saveTaskState(state);
}
```

#### 上下文缓存

```typescript
// 缓存研究结果
async function cacheResearchResult(
  topic: string,
  content: string
): Promise<string> {
  const filename = `${topic.replace(/\s+/g, '-').toLowerCase()}.md`;
  const path = `.claude/memory/context-cache/research/${filename}`;

  await fs.writeFile(path, content);

  return path;
}

// 重用缓存的研究结果
async function getRearchResult(topic: string): Promise<string | null> {
  const filename = `${topic.replace(/\s+/g, '-').toLowerCase()}.md`;
  const path = `.claude/memory/context-cache/research/${filename}`;

  try {
    return await fs.readFile(path, 'utf-8');
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
}

// 使用示例
const cachedResult = await getResearchResult('typescript-5-release-notes');
if (cachedResult) {
  console.log('使用缓存的研究结果 (节省token!)');
  return cachedResult;
} else {
  const newResult = await webResearcher.research('TypeScript 5.0发布说明');
  await cacheResearchResult('typescript-5-release-notes', newResult);
  return newResult;
}
```

### 说明 (Explanation)

#### 持久化内存的优势

1. **中断后恢复**:
   - 任务中出现错误或中断时无需从头开始
   - 重用已完成步骤的结果

2. **上下文重用**:
   - 在其他任务中重用之前的研究结果、草稿等
   - 节省token使用量

3. **历史管理**:
   - 任务完成后保留历史记录
   - 用于学习和改进

4. **透明性**:
   - 可追踪进度
   - 识别瓶颈

#### 内存设计原则

1. **分层存储**:
   - 热数据 (task-state.json): 频繁更新
   - 温数据 (context-cache/): 偶尔参考
   - 冷数据 (task-history.json): 存档用

2. **增量更新**:
   - 不要每次都保存整个状态,只保存变更部分
   - 恢复点是完整快照

3. **TTL (Time To Live)**:
   - 自动删除过期缓存
   - 完成的任务移到history

### 变体 (Variations)

#### 分布式内存

多个agent独立访问内存:

```typescript
// 按agent划分内存空间
.claude/memory/
├── agents/
│   ├── writing-assistant/
│   │   ├── drafts/
│   │   └── templates/
│   ├── web-researcher/
│   │   └── research-cache/
│   └── ...
└── shared/
    ├── task-state.json
    └── context-cache/
```

#### 外部存储集成

使用数据库代替文件系统:

```typescript
// 使用Redis进行内存存储
import Redis from 'ioredis';

const redis = new Redis();

async function saveTaskState(state: TaskState): Promise<void> {
  await redis.set(
    `task:${state.current_task.id}`,
    JSON.stringify(state),
    'EX',
    86400  // 24小时TTL
  );
}

async function readTaskState(taskId: string): Promise<TaskState | null> {
  const data = await redis.get(`task:${taskId}`);
  return data ? JSON.parse(data) : null;
}
```

---

## Recipe 12.5: Extreme Context Engineering (极致上下文工程)

### 问题 (Problem)

AI agent使用不完整信息工作时会产生以下问题:
- 错误假设导致错误
- 未达到质量标准
- 反复修改请求
- 上下文缺失导致一致性不足

### 解决方案 (Solution)

在上下文中包含执行任务所需的所有相关信息。

### 代码/示例 (Code)

#### 上下文清单

```markdown
## 委托上下文清单

### 必需项
- [ ] 任务目标 (明确且可测量)
- [ ] 成功标准 (质量标准、验证方法)
- [ ] 项目规则 (CLAUDE.md、风格指南)
- [ ] Schema/类型定义 (如需)
- [ ] 示例 (类似任务的成果)

### 按领域的附加项

#### 博客撰写
- [ ] 目标读者 (经验水平、兴趣)
- [ ] SEO要求 (关键词、description长度)
- [ ] 研究结果 (调查的信息)
- [ ] 参考文章 (现有相关文章)
- [ ] 图片路径 (heroImage位置)
- [ ] 多语言要求 (哪些语言?)

#### 代码重构
- [ ] 当前代码库结构
- [ ] 重构目标 (性能?可读性?)
- [ ] 测试覆盖率要求
- [ ] 是否允许breaking change
- [ ] 编码规范 (ESLint、Prettier设置)

#### SEO优化
- [ ] 目标关键词列表
- [ ] 竞争对手分析结果
- [ ] 当前SEO指标 (排名、流量)
- [ ] 技术约束 (框架、CDN)
- [ ] 地区/语言目标
```

#### 上下文打包函数

```typescript
interface TaskContext {
  task: {
    goal: string;
    successCriteria: string[];
    constraints: string[];
  };
  projectRules: {
    guidelines: string;      // CLAUDE.md内容
    schema: any;             // schema定义
    styleGuide: string;      // 编码/撰写风格
  };
  domainKnowledge: {
    research: string[];      // 研究结果路径
    examples: string[];      // 类似任务示例路径
    references: string[];    // 参考文档
  };
  qualityCriteria: {
    required: string[];      // 必需要求
    preferred: string[];     // 优先事项
    validation: string[];    // 验证方法
  };
  resources: {
    tools: string[];         // 可用工具
    apis: string[];          // API key/endpoint
    data: Record<string, any>; // 参考数据
  };
}

async function packageContextForAgent(
  task: Task,
  agent: Agent
): Promise<TaskContext> {
  return {
    task: {
      goal: task.goal,
      successCriteria: defineSuccessCriteria(task),
      constraints: identifyConstraints(task)
    },

    projectRules: {
      guidelines: await loadGuidelines(),
      schema: await loadSchema(task.domain),
      styleGuide: await loadStyleGuide(agent.domain)
    },

    domainKnowledge: {
      research: await gatherResearchResults(task),
      examples: await findSimilarExamples(task),
      references: await loadReferences(task.domain)
    },

    qualityCriteria: {
      required: defineRequiredCriteria(task),
      preferred: definePreferredCriteria(task),
      validation: defineValidationMethods(task)
    },

    resources: {
      tools: listAvailableTools(agent),
      apis: getApiConfiguration(agent),
      data: loadReferenceData(task)
    }
  };
}
```

#### 实践示例:博客撰写上下文

```markdown
## To: writing-assistant

### 任务目标
撰写TypeScript 5.0深度分析博客文章 (韩语、英语、日语)

### 成功标准
1. **篇幅**: 每种语言2500字以上
2. **结构**: 引言、正文(按功能)、实践示例、结论
3. **代码示例**: 5个以上,含语法高亮
4. **技术准确性**: 基于官方文档,仅使用已验证信息
5. **SEO**: description 150-160字,自然包含关键词
6. **构建**: `npm run build` 成功

### 约束条件
- 不包含中文版本
- 不包含视频教程
- 不包含实验性功能 (仅稳定功能)

---

### 项目规则

#### CLAUDE.md摘录
\```markdown
## 博客文章撰写工作流程

### 文件位置
- 韩语: `src/content/blog/ko/[slug].md`
- 英语: `src/content/blog/en/[slug].md`
- 日语: `src/content/blog/ja/[slug].md`

### Frontmatter必需字段
\```yaml
title: "明确简洁的标题 (60字以内)"
description: "考虑SEO的描述 (150-160字)"
pubDate: '2025-11-22'  # YYYY-MM-DD格式,使用单引号
heroImage: ../../../assets/blog/[filename].jpg
tags: ["tag1", "tag2", "tag3"]  # 最多5个
relatedPosts: [...]  # 相关文章 (另行提供)
\```

### Markdown撰写规则
1. **粗体文本**: 使用`<strong>文本</strong>` HTML标签
2. **范围表示**: 使用全角波浪号 (`〜`)
3. **代码块**: 必须指定语言
\```

#### Content Schema
\```typescript
// src/content.config.ts
{
  title: string,           // 必需
  description: string,     // 必需, 150-160字
  pubDate: Date,          // 必需, YYYY-MM-DD
  heroImage: ImageMetadata, // 可选
  tags: string[],         // 可选, 最多5个
  relatedPosts: Array<{   // 必需
    slug: string,
    score: number,
    reason: { ko, en, ja, zh }
  }>
}
\```

---

### 领域知识

#### 研究结果1: TypeScript 5.0发布说明摘要
\```markdown
# TypeScript 5.0主要功能

## 1. 装饰器标准化
- 支持Stage 3 ECMAScript装饰器
- 与现有实验性装饰器不兼容
- 正式支持`@decorator`语法

\```typescript
function logged(target: any, key: string) {
  const original = target[key];
  target[key] = function(...args: any[]) {
    console.log(`Calling ${key} with`, args);
    return original.apply(this, args);
  };
}

class Example {
  @logged
  greet(name: string) {
    return `Hello, ${name}!`;
  }
}
\```

## 2. const类型参数
- 可以将类型参数声明为`const`
- 改进类型推断

\```typescript
function identity<const T>(value: T): T {
  return value;
}

const arr = identity([1, 2, 3]); // type: readonly [1, 2, 3]
\```

## 3. 性能改进
- 构建速度提升10-20%
- 内存使用减少30%
- 在大型项目中效果显著

[... 再多1500字 ...]
\```

#### 研究结果2: 社区反应
\```markdown
# TypeScript 5.0社区反应

- Reddit r/typescript: 对装饰器标准化持积极态度
- HackerNews: 性能改进获得好评
- Twitter: Angular/NestJS开发者欢迎
- GitHub Issues: 许多迁移指南请求

主要关注点:
1. 现有装饰器代码的迁移方法
2. 框架支持时间表 (Angular, NestJS)
3. 详细的性能基准测试结果

[... 再多500字 ...]
\```

#### 参考文章1: `src/content/blog/ko/typescript-4-9.md`
\```markdown
---
title: TypeScript 4.9新功能完整指南
description: 从satisfies运算符到增强的类型检查,TypeScript 4.9的一切
pubDate: '2024-08-15'
heroImage: ../../../assets/blog/typescript-4-9-hero.jpg
tags: ["typescript", "javascript", "type-system"]
---

## 引言
TypeScript 4.9是大幅改进类型系统安全性和开发者体验的版本...

[结构参考]
\```

#### 参考文章2: `src/content/blog/ko/typescript-best-practices.md`
\```markdown
[语气和风格参考]
- 友好而专业的语气
- 代码示例 → 说明 → 实践技巧的顺序
- 偏好"可以这样做"而非"这样做就行"
\```

---

### 质量标准

#### 必需要求
1. ✅ Frontmatter完整性: 包含所有必需字段
2. ✅ 篇幅: 韩语/英语/日语各2500字以上
3. ✅ 代码示例: 5个以上,TypeScript语法高亮
4. ✅ 技术准确性: 基于研究结果,禁止猜测
5. ✅ 构建成功: `npm run build` 无错误

#### 优先事项
1. 💡 实践技巧: "注意事项"、"Best Practice"章节
2. 💡 对比表: 用表格整理与之前版本的差异
3. 💡 图表: 使用Mermaid可视化概念 (可选)
4. 💡 迁移指南: 现有代码升级方法

#### 验证方法
1. **自动验证**:
   - `npm run astro check` (类型检查)
   - `npm run build` (构建成功)
   - 遵守Frontmatter schema

2. **手动验证** (editor agent):
   - 语法错误0个
   - 技术准确性95%+
   - 代码示例可执行性

---

### 资源

#### 可用工具
- Read: 读取文件
- Write: 写入文件
- Edit: 修改文件
- WebSearch: 额外信息搜索 (如需)
- Bash: 执行npm run build

#### 图片路径
- heroImage: `../../../assets/blog/typescript-5-hero.jpg` (已生成)

#### 参考数据
\```json
{
  "targetAudience": {
    "ko": "中级以上TypeScript用户,3年+经验",
    "en": "Intermediate+ TypeScript developers",
    "ja": "中級以上のTypeScriptユーザー"
  },
  "keywords": ["TypeScript 5.0", "타입스크립트", "装饰器", "const类型参数"],
  "relatedPosts": [
    {
      "slug": "typescript-4-9",
      "score": 0.92,
      "reason": {
        "ko": "이전 버전인 TypeScript 4.9와 비교하여 변경사항을 이해할 수 있습니다",
        "en": "Helps understand changes by comparing with previous version TypeScript 4.9",
        "ja": "以前のバージョンTypeScript 4.9と比較して変更点を理解できます",
        "zh": "通过与之前的TypeScript 4.9版本对比理解变化"
      }
    }
  ]
}
\```

---

### 下级任务委托权限

writing-assistant可进一步委托给以下agent:

1. **editor** (审核草稿):
   - 撰写完成后请求质量审核
   - 基于反馈修改

2. **image-generator** (额外图表):
   - 需要可视化复杂概念时
   - 例如: 装饰器执行顺序图

3. **web-researcher** (额外调查):
   - 研究结果中没有的信息
   - 例如: 特定框架支持时间表

---

### 预计耗时
- 韩语草稿: 8分钟
- 英语翻译: 6分钟 (参考韩语结构)
- 日语翻译: 6分钟 (参考韩语结构)
- 总计: 20分钟 (并行执行时14分钟)

### 开始信号
准备就绪。请基于上述上下文开始工作。
```

### 说明 (Explanation)

#### 极致上下文工程的核心

1. **完整性**: agent可以无需额外提问即可执行任务的水平
2. **结构化**: 清晰分为任务、规则、知识、质量、资源
3. **具体性**: "撰写博客" → "2500字以上,5个代码示例,SEO description 150-160字"
4. **以示例为中心**: 在上下文中包含类似任务的成果

#### 上下文优化原则

```typescript
// 不好的示例: 不完整的上下文
const badContext = {
  task: "撰写TypeScript博客"
  // ❌ 目标不明确
  // ❌ 没有成功标准
  // ❌ 没有参考资料
};

// 好的示例: 完整的上下文
const goodContext = {
  task: {
    goal: "撰写TypeScript 5.0深度分析文章 (韩语、英语、日语)",
    successCriteria: [
      "每种语言2500字以上",
      "5个以上代码示例",
      "npm run build成功"
    ],
    constraints: ["不包含中文", "不包含实验性功能"]
  },
  projectRules: {
    guidelines: "...",  // CLAUDE.md全文
    schema: {...},      // schema定义
    styleGuide: "..."   // 撰写风格
  },
  domainKnowledge: {
    research: ["研究结果1500字"],
    examples: ["参考文章2篇"],
    references: ["官方文档链接"]
  },
  qualityCriteria: {
    required: ["5个必需要求"],
    preferred: ["4个优先事项"],
    validation: ["明确验证方法"]
  }
};
```

#### 上下文大小 vs 质量权衡

| 上下文大小 | 优点 | 缺点 | 适用情况 |
|-----------|------|------|---------|
| 小 (< 1000 tokens) | 快、便宜 | 质量下降、反复修改 | 简单任务 |
| 中 (1000-5000) | 平衡 | - | 一般任务 |
| 大 (5000-20000) | 高质量、一次完成 | 慢、贵 | 复杂任务 |
| 极大 (20000+) | 完美质量 | 非常贵 | 重要任务 |

**推荐**: 对于复杂任务,使用大上下文一次完成比反复修改更经济

### 变体 (Variations)

#### 渐进式上下文扩展

最初使用最小上下文,agent提问时再添加:

```typescript
async function executeWithProgressiveContext(
  task: Task,
  agent: Agent
): Promise<Result> {
  let context = createMinimalContext(task);
  let attempt = 0;
  const MAX_ATTEMPTS = 3;

  while (attempt < MAX_ATTEMPTS) {
    const result = await agent.execute(context);

    if (result.status === 'success') {
      return result;
    }

    if (result.status === 'needs_more_context') {
      // 提供agent请求的额外信息
      context = await expandContext(context, result.questions);
      attempt++;
    } else {
      throw new Error(`Failed after ${attempt} attempts`);
    }
  }
}
```

#### 上下文模板

按任务类型使用预定义模板:

```typescript
const contextTemplates = {
  'blog-writing': {
    sections: [
      'task',
      'projectRules',
      'domainKnowledge',
      'qualityCriteria',
      'resources'
    ],
    requiredFields: [
      'task.goal',
      'task.successCriteria',
      'projectRules.guidelines',
      'domainKnowledge.research',
      'qualityCriteria.validation'
    ]
  },
  'code-refactoring': {
    sections: [
      'task',
      'codebaseStructure',
      'testRequirements',
      'constraints',
      'qualityCriteria'
    ],
    requiredFields: [
      'task.goal',
      'codebaseStructure.architecture',
      'testRequirements.coverage',
      'constraints.breakingChanges'
    ]
  }
};

function createContextFromTemplate(
  type: string,
  data: any
): TaskContext {
  const template = contextTemplates[type];
  const context = {};

  for (const section of template.sections) {
    context[section] = data[section];
  }

  // 验证必需字段
  for (const field of template.requiredFields) {
    if (!getNestedValue(context, field)) {
      throw new Error(`Missing required field: ${field}`);
    }
  }

  return context;
}
```

---

## 实践示例:综合应用

### 场景:全站SEO审计和优化

这个任务利用Deep Agents的所有4个支柱,是一个复杂的长期任务。

#### 用户请求

```
"请审计并优化博客网站的整体SEO。
检查并改进所有文章的meta标签、内部链接、sitemap。"
```

#### 第1步:显式规划 (Explicit Planning)

```markdown
## 任务计划: 全站SEO优化

### 目标
- 所有博客文章 (120篇)的SEO分数达到90+
- 更新sitemap
- 优化内部链接 (孤立页面0个)

### Phase A: 现状分析 (10分钟)
1. [seo-optimizer] 检查所有文章meta标签
2. [seo-optimizer] 分析内部链接图
3. [seo-optimizer] 验证sitemap

### Phase B: 确定优先级 (5分钟)
4. [seo-optimizer] 选出SEO分数低的20篇文章
5. [seo-optimizer] 识别孤立页面
6. [seo-optimizer] 检测重复meta标签

### Phase C: 执行优化 (60分钟, 并行)
7. [seo-optimizer] 批量修改meta标签 (20篇文章)
8. [seo-optimizer] 添加内部链接 (解决孤立页面)
9. [seo-optimizer] 重新生成sitemap

### Phase D: 验证 (10分钟)
10. [site-manager] 构建验证
11. [seo-optimizer] 测量最终SEO分数
12. [seo-optimizer] 生成报告

### 总预计时间: 85分钟
### 预计token: 150,000
```

#### 第2步:分层委托 (Hierarchical Delegation)

```typescript
// Orchestrator → SEO-Marketing Cluster
await orchestrator.delegateToCluster('seo-marketing', {
  task: '全站SEO审计和优化',
  plan: executionPlan,
  resources: {
    allPosts: await getCollection('blog'),
    sitemapConfig: await loadConfig('sitemap'),
    seoGuidelines: await loadGuidelines('seo')
  }
});

// SEO-Optimizer (Cluster Leader) → 下级agent
await seoOptimizer.delegateToTeam([
  {
    agent: 'seo-optimizer',
    task: 'meta标签检查',
    scope: 'all posts'
  },
  {
    agent: 'backlink-manager',
    task: '内部链接分析',
    scope: 'all posts'
  },
  {
    agent: 'social-media-manager',
    task: 'OG标签验证',
    scope: 'all posts'
  }
]);
```

#### 第3步:持久化内存 (Persistent Memory)

```json
// .claude/memory/task-state.json
{
  "current_task": {
    "id": "task_seo_audit_001",
    "started_at": "2025-11-18T14:00:00Z",
    "goal": "全站SEO优化",
    "status": "in_progress",
    "progress": {
      "total_steps": 12,
      "completed_steps": 7,
      "current_step": 8
    },
    "context": {
      "total_posts": 120,
      "low_score_posts": [
        "typescript-basics",
        "javascript-intro",
        // ... 再18篇
      ],
      "orphan_pages": ["old-tutorial", "draft-post"],
      "average_seo_score_before": 75,
      "average_seo_score_after": 88
    }
  },
  "recovery_points": [
    {
      "id": "checkpoint-005",
      "step": 5,
      "timestamp": "2025-11-18T14:25:00Z",
      "state_snapshot": "{...}",
      "artifacts": [
        ".claude/memory/seo-audit-report.md",
        ".claude/memory/low-score-posts.json"
      ]
    },
    {
      "id": "checkpoint-010",
      "step": 10,
      "timestamp": "2025-11-18T15:10:00Z",
      "state_snapshot": "{...}",
      "artifacts": [
        ".claude/memory/optimized-posts.json",
        ".claude/memory/internal-links-added.json"
      ]
    }
  ]
}
```

#### 第4步:极致上下文 (Extreme Context Engineering)

```markdown
## To: seo-optimizer (SEO-Marketing Cluster Leader)

### 任务目标
优化所有博客文章 (120篇)的SEO

### 现状分析结果
\```json
{
  "total_posts": 120,
  "average_seo_score": 75,
  "issues": {
    "missing_description": 15,
    "description_too_short": 23,
    "missing_og_tags": 8,
    "orphan_pages": 2,
    "broken_internal_links": 12
  },
  "low_score_posts": [
    {
      "slug": "typescript-basics",
      "score": 52,
      "issues": ["description短 (80字)", "内部链接0个", "无OG图片"]
    },
    // ... 再19篇
  ]
}
\```

### 项目SEO指南
\```markdown
## SEO优化标准

### Meta标签
- title: 50-60字 (超过会被截断)
- description: 150-160字 (必需)
- OG tags: title、description、image都要包含

### 内部链接
- 每篇文章至少3个以上内部链接
- 禁止孤立页面 (incoming link 0个)
- 利用相关文章自动推荐

### 图片
- heroImage必需
- alt文本必需
- OG图片推荐1200x630
\```

### 现有文章示例
\```markdown
---
title: TypeScript 5.0新功能完整指南
description: 从装饰器标准化到const类型参数,通过实践示例了解TypeScript 5.0的所有变化。 # 150字
heroImage: ../../../assets/blog/typescript-5-hero.jpg
tags: ["typescript", "javascript"]
---

正文中的内部链接示例:
- [TypeScript 4.9功能](./typescript-4-9)
- [TypeScript Best Practices](./typescript-best-practices)
\```

### 优化策略
1. **批量修改优先**:
   - description缺失/过短 → 自动生成 (利用正文首段)
   - OG标签缺失 → 从Frontmatter自动提取

2. **需要个别审核**:
   - SEO分数50以下文章 (5篇)
   - 孤立页面 (2篇) → 找相关文章添加链接

3. **自动化**:
   - 执行sitemap重新生成脚本
   - 执行内部链接验证脚本

### 质量标准
- SEO分数平均达到90+
- 孤立页面0个
- 所有文章description 150-160字
- 构建成功

### 可用工具
- Read, Edit, Write: 修改文章
- Bash: 执行脚本
- Grep: 模式搜索

### 下级agent委托权限
- backlink-manager: 内部链接策略
- social-media-manager: OG标签优化

### 开始!
```

#### 第5步:自动恢复

```typescript
// Step 8执行中发生错误
try {
  await seoOptimizer.optimizeMetaTags(lowScorePosts);
} catch (error) {
  if (error.type === 'ValidationError') {
    // 未达到质量标准 → 重试
    const feedback = analyzeError(error);
    await seoOptimizer.optimizeMetaTags(lowScorePosts, { feedback });
  } else if (error.type === 'FileNotFound') {
    // 文件缺失 → 跳过并继续
    await logWarning(`Skipped missing file: ${error.file}`);
    await continueToNextStep();
  } else {
    // 无法恢复 → 回滚到最后checkpoint
    await rollbackToCheckpoint('checkpoint-005');
    throw error;
  }
}
```

#### 最终结果

```markdown
## SEO优化完成报告

### 摘要
- 作业时间: 82分钟 (计划85分钟,缩短3分钟)
- Token使用: 148,000 (计划150,000,节省)
- 修改的文章: 38篇
- 添加的内部链接: 45个

### 成果
| 指标 | Before | After | 改进 |
|------|--------|-------|------|
| 平均SEO分数 | 75 | 92 | +23% |
| description缺失 | 15篇 | 0篇 | 100% |
| 孤立页面 | 2篇 | 0篇 | 100% |
| 平均内部链接数 | 1.8个 | 4.2个 | +133% |

### 自动恢复事件
- Step 7: 1篇文章description生成失败 → 重试成功
- Step 8: 2个图片文件缺失 → 跳过 (需手动确认)

### 后续步骤
1. 添加缺失的2张图片
2. 1个月后测量SEO成果
3. 新文章撰写时添加自动SEO验证
```

---

## 结语

Deep Agents范式将AI agent系统从简单的工具使用者演进为自主协作伙伴。

### 核心总结

| 支柱 | 核心概念 | 应用方法 |
|------|----------|----------|
| Explicit Planning | 显式结构化计划 | 任务开始前生成分步计划,明确依赖关系 |
| Hierarchical Delegation | 委托给专业agent | 以cluster结构组织,以leader为中心协调 |
| Persistent Memory | 跨会话维护状态 | task-state.json、恢复点、上下文缓存 |
| Extreme Context | 包含所有相关信息 | 基于清单的完整上下文打包 |

### 导入路线图

#### Phase 1: 基础构建 (1周)
- [ ] 编写orchestrator.md并实现基本委托
- [ ] 定义cluster (.claude/guidelines/agent-clusters.md)
- [ ] 向现有agent添加cluster信息

#### Phase 2: 计划protocol (1周)
- [ ] 编写planning-protocol.md
- [ ] 实现计划生成函数
- [ ] 用1个复杂任务测试

#### Phase 3: 内存系统 (2周)
- [ ] 创建.claude/memory/目录结构
- [ ] 编写state-management.md
- [ ] 定义并实现task-state.json schema
- [ ] 实现自动生成恢复点

#### Phase 4: 恢复protocol (1周)
- [ ] 编写recovery-protocol.md
- [ ] 实现按失败类型的应对逻辑
- [ ] 测试回滚和重试机制

#### Phase 5: 优化 (持续)
- [ ] 构建上下文模板库
- [ ] 监控和优化token使用量
- [ ] 追踪各agent的性能指标

### 预期效果

**定量**:
- 最大任务步数: 5〜15 → 100+
- 自动恢复率: 0% → 90%+
- 上下文重用: 0% → 80%+
- 并行执行效率: 10% → 60%+

**定性**:
- 支持长期任务 (多语言内容、整体重构)
- 自主问题解决 (重试、重新规划)
- 透明的进度 (显式计划)
- 中断后可恢复 (持久化内存)

Deep Agents不是理论,而是现实。现在就应用到`.claude/`目录,构建真正的自主AI系统。

---

**下一章预告**: Chapter 13将介绍Claude Code的性能优化和token节省策略。学习如何通过元数据架构、增量处理、3层缓存系统实现60-70%的成本节省。
