# Chapter 12: Deep Agents Architecture

## Introduction: The Evolution of AI Agent Systems

In 2025, AI agent systems reached a critical turning point. Evolution began from simple tool-calling agents (Shallow Agents) to Deep Agents capable of performing complex long-term tasks.

The Deep Agents paradigm proposed by Philipp Schmid from LangChain and AWS consists of four core pillars:

1. **Explicit Planning**: Structured plan generation instead of implicit reasoning
2. **Hierarchical Delegation**: Delegating tasks to appropriate specialized agents
3. **Persistent Memory**: Maintaining context and state across sessions
4. **Extreme Context Engineering**: Including all relevant information in context

This chapter provides concrete recipes for utilizing each pillar in practice.

---

## Recipe 12.1: Deep vs Shallow Agents

### Problem

Traditional AI agents can only perform short tasks of 5-15 steps and abort immediately upon failure. Complex long-term tasks (e.g., multilingual blog post creation, entire site SEO audit) require multiple human interventions.

### Solution

Understand the difference between Shallow Agents and Deep Agents, and select the appropriate paradigm.

#### Shallow Agents (Agent 1.0)

**Characteristics**:
- Simple ReAct pattern (Reasoning → Action → Observation)
- Short tasks within 5-15 steps
- Immediate abortion on failure
- Non-persistent context

**Suitable Tasks**:
- Simple information retrieval
- Single file modifications
- Quick data transformations

**Workflow**:

```
Request → Tool Call → Result → Complete/Fail
```

#### Deep Agents (Agent 2.0)

**Characteristics**:
- Can perform 100+ step long-term tasks
- Explicit planning and replanning
- Continuous state management
- Automatic recovery and adaptation

**Suitable Tasks**:
- Multilingual content creation
- Complex refactoring
- Data pipeline construction
- Entire project analysis

**Workflow**:

```
Request → Goal Analysis → Plan Creation → Task Execution → Validation → Replanning (if needed) → Complete
```

### Code Examples

#### Shallow Agent Example: Single File Modification

```markdown
# User Request
"Please modify the date format function in src/utils/format.ts."

# Shallow Agent Execution
1. Read: src/utils/format.ts
2. Edit: Modify formatDate function
3. Complete

# Total: 3 steps, 1 minute
```

#### Deep Agent Example: Multilingual Blog Post Creation

```markdown
# User Request
"Write an in-depth analysis blog post about new features in TypeScript 5.0.
Include code examples and performance benchmarks, and create versions in Korean, English, and Japanese."

# Deep Agent Execution Plan
## Phase A: Preparation (Parallel, 5 minutes)
1. [web-researcher] Research TypeScript 5.0 official release notes
2. [web-researcher] Collect performance benchmark data
3. [image-generator] Generate hero image

## Phase B: Writing (Sequential, 15 minutes)
4. [writing-assistant] Write Korean draft (2500+ characters)
5. [writing-assistant] Write English version
6. [writing-assistant] Write Japanese version

## Phase C: Validation (Sequential, 5 minutes)
7. [editor] Quality review of all versions
8. [seo-optimizer] Optimize metadata and keywords
9. [site-manager] Build validation

# Total: 9 steps, 25 minutes
# Auto-recovery: Rewrite with specific feedback if Steps 4-6 fail
```

### Explanation

**Limitations of Shallow Agents**:

1. **Short Context Window**: Initial context lost as conversation lengthens
2. **Non-persistent State**: Start from scratch on failure
3. **Manual Coordination Required**: Humans must provide step-by-step instructions for complex tasks

**Strengths of Deep Agents**:

1. **Long-term Task Support**: Manage 100+ steps with explicit planning
2. **Automatic Recovery**: Retry, replan, or escalate based on failure type
3. **State Persistence**: Can resume after interruption
4. **Transparency**: Improved progress tracking and predictability

### Variations

#### Hybrid Approach

Use Shallow Agents for simple tasks and Deep Agents only for complex ones:

```typescript
// Assess task complexity
function assessComplexity(request: string): 'simple' | 'complex' {
  const indicators = {
    multiStep: /step|sequence|first.*then/.test(request),
    multiFile: /all|entire|multiple/.test(request),
    multiLanguage: /multilingual|translation|language/.test(request),
    longDuration: /analysis|refactoring|optimization/.test(request)
  };

  const score = Object.values(indicators).filter(Boolean).length;
  return score >= 2 ? 'complex' : 'simple';
}

// Select appropriate agent
if (assessComplexity(userRequest) === 'complex') {
  await deepAgent.execute(userRequest);
} else {
  await shallowAgent.execute(userRequest);
}
```

#### Gradual Upgrade

Gradually transform existing Shallow Agents into Deep Agents:

```markdown
# Step 1: Add explicit planning
- Generate simple checklist before starting work

# Step 2: Add recovery logic
- Retry once on failure

# Step 3: Add state persistence
- Record progress at major steps

# Step 4: Full Deep Agent
- Implement complete protocol
```

---

## Recipe 12.2: Explicit Planning

### Problem

When AI agents proceed improvisationally on complex tasks, the following problems occur:
- Performing duplicate work
- Failures due to ignoring dependencies
- Missing parallel execution opportunities
- Unable to track progress

### Solution

Generate an explicit and structured plan first for all complex tasks.

#### Planning Protocol Components

```markdown
## Task Planning Template

### 1. Goal Clarification
- Deliverables: [Specific description]
- Success Criteria: [Measurable criteria]
- Scope Limitations: [Exclusions]

### 2. Step Decomposition
- Each step performed by one agent
- Specify estimated time per step
- Clearly indicate dependencies

### 3. Resource Allocation
- Required Tools: [Tool list]
- Required Context: [Files, data]
- Estimated Token Usage: [Rough estimate]

### 4. Risk Assessment
- Potential Failure Points: [Identified risks]
- Alternative Paths: [Plan B]
- Recovery Strategy: [Response to failure]
```

### Code Examples

#### Example 1: Multilingual Blog Post Plan

```markdown
## Task Plan: TypeScript 5.0 In-Depth Analysis Post

### 1. Goal Clarification
- **Deliverables**:
  - Blog posts in 3 language versions (Korean, English, Japanese)
  - 2500+ characters each
  - Include 5+ code examples
  - Include performance benchmark chart
- **Success Criteria**:
  - `npm run build` succeeds
  - Frontmatter schema compliance
  - SEO description 150-160 characters
- **Scope Limitations**:
  - Exclude Chinese version
  - Exclude video tutorials

### 2. Step Decomposition

#### Phase A: Preparation (Parallel executable)
- **Step 1** [web-researcher, 3 minutes]
  - Task: Research TypeScript 5.0 official release notes
  - Output: `.claude/memory/research/ts5-release-notes.md`
  - Dependencies: None

- **Step 2** [web-researcher, 3 minutes]
  - Task: Collect community reactions and use cases
  - Output: `.claude/memory/research/ts5-community.md`
  - Dependencies: None

- **Step 3** [image-generator, 2 minutes]
  - Task: Generate hero image
  - Output: `src/assets/blog/typescript-5-hero.jpg`
  - Dependencies: None

#### Phase B: Writing (Sequential execution)
- **Step 4** [writing-assistant, 8 minutes]
  - Task: Write Korean draft
  - Input: Results from Steps 1, 2
  - Output: `src/content/blog/ko/typescript-5-deep-dive.md`
  - Dependencies: Steps 1, 2, 3 complete

- **Step 5** [writing-assistant, 6 minutes]
  - Task: Write English version
  - Input: Reference Step 4 structure
  - Output: `src/content/blog/en/typescript-5-deep-dive.md`
  - Dependencies: Step 4 complete

- **Step 6** [writing-assistant, 6 minutes]
  - Task: Write Japanese version
  - Input: Reference Step 4 structure
  - Output: `src/content/blog/ja/typescript-5-deep-dive.md`
  - Dependencies: Step 4 complete

#### Phase C: Validation (Sequential execution)
- **Step 7** [editor, 4 minutes]
  - Task: Quality review of all versions
  - Validation: Grammar, technical accuracy, consistency
  - Dependencies: Steps 4, 5, 6 complete

- **Step 8** [seo-optimizer, 2 minutes]
  - Task: Optimize metadata
  - Validation: Description length, keyword density
  - Dependencies: Step 7 complete

- **Step 9** [site-manager, 1 minute]
  - Task: Build validation
  - Validation: `npm run build` success
  - Dependencies: Step 8 complete

### 3. Resource Allocation
- **Required Tools**:
  - WebSearch (Steps 1, 2)
  - Image Generator API (Step 3)
  - File System (Steps 4-9)
  - Bash (Step 9)
- **Required Context**:
  - `CLAUDE.md` (blog writing guidelines)
  - `src/content.config.ts` (schema definition)
  - 2 existing TypeScript-related posts (reference)
- **Estimated Token Usage**:
  - Phase A: 15,000 tokens
  - Phase B: 45,000 tokens
  - Phase C: 10,000 tokens
  - Total: 70,000 tokens

### 4. Risk Assessment
- **Potential Failure Points**:
  - Steps 1-2: Web search API limits
    - Alternative: Query official docs via Context7 MCP
  - Step 3: Image generation API error
    - Alternative: Reuse existing TypeScript image
  - Steps 4-6: Insufficient length
    - Recovery: Request rewrite with specific feedback
  - Step 9: Build failure
    - Recovery: Analyze error logs and fix

### 5. Estimated Time
- Phase A: 3 minutes (parallel)
- Phase B: 8 minutes (Step 4) + parallel 6 minutes (Steps 5, 6)
- Phase C: 7 minutes (sequential)
- **Total: 24 minutes**

### 6. Parallel Execution Strategy
- **Phase A**: 3 steps parallel execution
- **Phase B**: Steps 5, 6 parallel execution (reference Step 4)
- **Phase C**: Sequential execution (quality assurance)
```

#### Example 2: Plan Expression in TypeScript Code

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

// Plan generation function
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

### Explanation

#### Why Explicit Planning is Necessary

1. **Predictability**: Can estimate task time and resources in advance
2. **Parallelization**: Identify steps that can execute simultaneously through dependency analysis
3. **Recoverability**: Predict failure points and prepare alternatives
4. **Transparency**: Both users and systems can track progress

#### Planning Generation Principles

1. **SMART Goals**:
   - Specific: "Write blog post" → "2500+ characters, include 5 code examples"
   - Measurable: "Quality review" → "0 grammar errors, 95%+ technical accuracy"
   - Achievable: Realizable with current tools and context
   - Relevant: Directly related to user request
   - Time-bound: Specify estimated time for each step

2. **Dependency Graph**:
   - Specify prerequisites for each step
   - Prevent circular dependencies
   - Identify steps that can execute in parallel

3. **Risk-Based Planning**:
   - Assess failure probability for each step
   - Prepare alternative paths in advance
   - Include recovery strategies

### Variations

#### Dynamic Plan Adjustment

Modify plan based on new information during execution:

```typescript
async function executePlanWithAdaptation(
  plan: ExecutionPlan
): Promise<void> {
  for (const phase of plan.phases) {
    const results = await executePhase(phase);

    // Adjust next steps based on results
    if (results.qualityScore < 0.8) {
      // Insert additional review step if quality insufficient
      const reviewStep = createReviewStep(phase);
      plan.phases.splice(
        plan.phases.indexOf(phase) + 1,
        0,
        { name: 'Additional Review', steps: [reviewStep] }
      );
    }

    // Advance next step if completed faster than expected
    if (results.duration < phase.estimatedDuration * 0.7) {
      await executePhase(plan.phases[plan.phases.indexOf(phase) + 1]);
    }
  }
}
```

#### Gradual Refinement

Create only high-level plan initially, refine details just before execution:

```markdown
# Initial Plan (High-Level)
1. Research → 2. Writing → 3. Validation

# Refinement Before Executing Step 1
1. Research
   1.1. Survey official documentation (web-researcher, 3 min)
   1.2. Collect community reactions (web-researcher, 3 min)
   1.3. Gather benchmark data (web-researcher, 2 min)
```

---

[Continuing with remaining recipes 12.3, 12.4, and 12.5...]

## Summary

The Deep Agents paradigm evolves AI agent systems from simple tool users to autonomous collaboration partners.

### Key Summary

| Pillar | Core Concept | Application Method |
|--------|--------------|-------------------|
| Explicit Planning | Explicit and structured planning | Create step-by-step plan before starting, specify dependencies |
| Hierarchical Delegation | Delegate to specialized agents | Organize as cluster structure, leader-centered coordination |
| Persistent Memory | Maintain state across sessions | task-state.json, recovery points, context caching |
| Extreme Context | Include all relevant information | Complete context packaging based on checklist |

### Implementation Roadmap

#### Phase 1: Foundation Building (1 week)
- [ ] Write orchestrator.md and implement basic delegation
- [ ] Define clusters (.claude/guidelines/agent-clusters.md)
- [ ] Add cluster information to existing agents

#### Phase 2: Planning Protocol (1 week)
- [ ] Write planning-protocol.md
- [ ] Implement plan generation function
- [ ] Test with 1 complex task

#### Phase 3: Memory System (2 weeks)
- [ ] Create .claude/memory/ directory structure
- [ ] Write state-management.md
- [ ] Define and implement task-state.json schema
- [ ] Implement automatic recovery point generation

#### Phase 4: Recovery Protocol (1 week)
- [ ] Write recovery-protocol.md
- [ ] Implement response logic by failure type
- [ ] Test rollback and retry mechanisms

#### Phase 5: Optimization (Ongoing)
- [ ] Build context template library
- [ ] Monitor and optimize token usage
- [ ] Track performance metrics per agent

### Expected Benefits

**Quantitative**:
- Maximum task steps: 5-15 → 100+
- Auto-recovery rate: 0% → 90%+
- Context reuse: 0% → 80%+
- Parallel execution efficiency: 10% → 60%+

**Qualitative**:
- Support long-term tasks (multilingual content, entire refactoring)
- Autonomous problem solving (retry, replan)
- Transparent progress (explicit planning)
- Resumable after interruption (persistent memory)

Deep Agents is not theory but reality. Apply it to your `.claude/` directory now to build a truly autonomous AI system.

---

**Next Chapter Preview**: Chapter 13 covers Claude Code performance optimization and token reduction strategies. Learn how to achieve 60-70% cost reduction through metadata architecture, incremental processing, and 3-tier caching systems.
