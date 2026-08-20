# Chapter 11: Agent Collaboration Patterns

## Overview

The most critical aspect of multi-agent systems is designing effective collaboration between agents. As we've evolved from single agents handling all tasks to systems where multiple specialized agents collaborate, determining how to distribute and coordinate work among agents has become the central challenge.

This chapter presents four battle-tested collaboration patterns in cookbook style. Each recipe can be read independently and includes the problem it solves, the concrete solution, actual code examples, how it works, and application methods.

### What This Chapter Covers

- **Recipe 11.1: Sequential Execution Pattern** - How to chain tasks step by step
- **Recipe 11.2: Parallel Execution Pattern** - How to perform multiple tasks simultaneously
- **Recipe 11.3: Handoff Pattern** - How to transfer work to specialists based on context
- **Recipe 11.4: Orchestrator Pattern** - How to coordinate the entire flow from a central point

---

## Recipe 11.1: Sequential Execution Pattern

### Problem

When building a full-stack application, each stage often depends on the output of the previous stage. For example:

- The coding agent needs the architecture agent's design to implement
- The testing agent needs code to be written before writing tests
- The security agent needs complete code to scan for vulnerabilities
- The DevOps agent can only deploy after all verification is complete

You need to ensure each agent performs its role in the correct order.

### Solution

The sequential execution pattern connects agents in a **pipeline manner**. Each agent's output becomes the next agent's input, forming a linear chain throughout the entire flow.

#### Step-by-Step Implementation

**Step 1: Define the Workflow**

```
Requirements → Architecture → Coding → Testing → Security → DevOps → Deployment
```

**Step 2: Design Shared State**

Define a state object that all agents can read and write.

```typescript
// Shared state definition
interface AppState {
  requirements: string;           // Initial requirements
  architecture?: {                // Architecture Agent output
    stack: string[];
    database: string;
    components: Record<string, string[]>;
  };
  code?: {                        // Coding Agent output
    files: Map<string, string>;
    dependencies: string[];
  };
  tests?: {                       // Testing Agent output
    coverage: number;
    results: TestResult[];
  };
  securityReport?: {              // Security Agent output
    vulnerabilities: Vulnerability[];
    recommendations: string[];
  };
  deploymentConfig?: {            // DevOps Agent output
    target: string;
    healthCheckUrl: string;
  };
}
```

**Step 3: Implement Each Agent as a Function**

Each agent is a pure function that receives state and updates it.

```typescript
// Architecture Agent
async function architectureAgent(state: AppState): Promise<AppState> {
  const { requirements } = state;

  console.log('🏗️ Architecture Agent: Designing system...');

  const architecture = {
    stack: ['Node.js', 'TypeScript', 'PostgreSQL', 'Redis'],
    database: 'postgresql',
    components: {
      domain: ['User', 'Todo'],
      application: ['UserService', 'TodoService'],
      infrastructure: ['UserRepository', 'TodoRepository'],
      presentation: ['UserController', 'TodoController']
    }
  };

  return { ...state, architecture };
}

// Coding Agent
async function codingAgent(state: AppState): Promise<AppState> {
  const { architecture } = state;

  if (!architecture) {
    throw new Error('Architecture not defined');
  }

  console.log('💻 Coding Agent: Implementing components...');

  const files = new Map<string, string>();

  // Create domain layer
  files.set('src/domain/todo.entity.ts', `
export class Todo {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public title: string,
    public completed: boolean,
    public readonly createdAt: Date
  ) {}

  static create(userId: string, title: string): Todo {
    return new Todo(
      crypto.randomUUID(),
      userId,
      title,
      false,
      new Date()
    );
  }

  toggle(): void {
    this.completed = !this.completed;
  }
}
  `);

  // Create application layer
  files.set('src/application/todo.service.ts', `
export class TodoService {
  constructor(private repository: TodoRepository) {}

  async create(userId: string, title: string): Promise<Todo> {
    const todo = Todo.create(userId, title);
    await this.repository.save(todo);
    return todo;
  }

  async findByUserId(userId: string): Promise<Todo[]> {
    return this.repository.findByUserId(userId);
  }

  async toggle(id: string): Promise<Todo> {
    const todo = await this.repository.findById(id);
    if (!todo) throw new Error('Todo not found');
    todo.toggle();
    await this.repository.save(todo);
    return todo;
  }
}
  `);

  const code = {
    files,
    dependencies: ['express', 'pg', 'redis', 'joi']
  };

  return { ...state, code };
}

// Testing Agent
async function testingAgent(state: AppState): Promise<AppState> {
  const { code } = state;

  if (!code) {
    throw new Error('Code not generated');
  }

  console.log('🧪 Testing Agent: Writing tests...');

  // Create test file
  const testFile = `
describe('TodoService', () => {
  it('should create todo', async () => {
    const service = new TodoService(mockRepository);
    const todo = await service.create('user-1', 'Buy milk');
    expect(todo.title).toBe('Buy milk');
    expect(todo.completed).toBe(false);
  });

  it('should toggle todo completion', async () => {
    const service = new TodoService(mockRepository);
    const todo = await service.toggle('todo-1');
    expect(todo.completed).toBe(true);
  });
});
  `;

  code.files.set('src/application/todo.service.test.ts', testFile);

  const tests = {
    coverage: 92.5,
    results: [
      { suite: 'TodoService', passed: 2, failed: 0 }
    ]
  };

  return { ...state, tests };
}

// Security Agent
async function securityAgent(state: AppState): Promise<AppState> {
  const { code } = state;

  if (!code) {
    throw new Error('Code not generated');
  }

  console.log('🔒 Security Agent: Scanning for vulnerabilities...');

  const vulnerabilities: Vulnerability[] = [];
  const recommendations: string[] = [
    'Add input validation with Joi schemas',
    'Use parameterized queries to prevent SQL injection',
    'Implement rate limiting for API endpoints',
    'Add CORS whitelist configuration'
  ];

  const securityReport = {
    vulnerabilities,
    recommendations
  };

  return { ...state, securityReport };
}

// DevOps Agent
async function devopsAgent(state: AppState): Promise<AppState> {
  const { tests, securityReport } = state;

  if (!tests || !securityReport) {
    throw new Error('Prerequisites not met');
  }

  console.log('🚀 DevOps Agent: Preparing deployment...');

  const deploymentConfig = {
    target: 'AWS ECS Fargate',
    healthCheckUrl: 'https://api.example.com/health'
  };

  return { ...state, deploymentConfig };
}
```

**Step 4: Build Sequential Execution Pipeline**

```typescript
async function sequentialPipeline(requirements: string): Promise<AppState> {
  let state: AppState = { requirements };

  // Execute each agent sequentially
  state = await architectureAgent(state);
  state = await codingAgent(state);
  state = await testingAgent(state);
  state = await securityAgent(state);
  state = await devopsAgent(state);

  return state;
}

// Execute
const result = await sequentialPipeline(
  'Build a REST API for todo management with user authentication'
);

console.log('✅ Pipeline completed');
console.log(`Generated ${result.code?.files.size} files`);
console.log(`Test coverage: ${result.tests?.coverage}%`);
console.log(`Security recommendations: ${result.securityReport?.recommendations.length}`);
```

### Code Examples

Production-grade implementation using LangGraph:

```python
from langgraph.graph import StateGraph, END
from typing import TypedDict

# State definition
class AppState(TypedDict):
    requirements: str
    architecture: dict
    code: dict
    tests: dict
    security_report: dict
    deployment_config: dict

# Agent functions
def architecture_agent(state: AppState) -> AppState:
    print("🏗️ Architecture Agent: Designing system...")
    state["architecture"] = {
        "stack": ["Node.js", "TypeScript", "PostgreSQL"],
        "database": "postgresql",
        "components": ["domain", "application", "infrastructure", "presentation"]
    }
    return state

def coding_agent(state: AppState) -> AppState:
    print("💻 Coding Agent: Implementing components...")
    state["code"] = {
        "files": ["todo.entity.ts", "todo.service.ts", "todo.controller.ts"],
        "dependencies": ["express", "pg", "joi"]
    }
    return state

def testing_agent(state: AppState) -> AppState:
    print("🧪 Testing Agent: Writing tests...")
    state["tests"] = {
        "coverage": 92.5,
        "results": [{"suite": "TodoService", "passed": 2, "failed": 0}]
    }
    return state

def security_agent(state: AppState) -> AppState:
    print("🔒 Security Agent: Scanning...")
    state["security_report"] = {
        "vulnerabilities": [],
        "recommendations": ["Add input validation", "Use parameterized queries"]
    }
    return state

def devops_agent(state: AppState) -> AppState:
    print("🚀 DevOps Agent: Preparing deployment...")
    state["deployment_config"] = {
        "target": "AWS ECS",
        "health_check": "https://api.example.com/health"
    }
    return state

# Create graph
workflow = StateGraph(AppState)

# Add nodes (each node = agent)
workflow.add_node("architect", architecture_agent)
workflow.add_node("coder", coding_agent)
workflow.add_node("tester", testing_agent)
workflow.add_node("security", security_agent)
workflow.add_node("devops", devops_agent)

# Add sequential execution edges
workflow.add_edge("architect", "coder")
workflow.add_edge("coder", "tester")
workflow.add_edge("tester", "security")
workflow.add_edge("security", "devops")
workflow.add_edge("devops", END)

# Set entry point
workflow.set_entry_point("architect")

# Compile and execute
app = workflow.compile()
result = app.invoke({
    "requirements": "Build a REST API for todo management"
})

print(f"✅ Pipeline completed")
print(f"Generated files: {result['code']['files']}")
print(f"Test coverage: {result['tests']['coverage']}%")
```

### Explanation

Core principles of the sequential execution pattern:

1. **State-Centric Design**
   - All agents share the same state object
   - Each agent reads the state and adds its output to it
   - Maintains immutability (each step returns a new state object)

2. **Dependency Order Guarantee**
   - Each agent depends on the output of previous agents
   - Changing the order causes failures (e.g., cannot test without code)
   - Explicit dependency checks (`if (!code) throw Error`)

3. **Linear Data Flow**
   - Data flows in one direction only (A → B → C → D → E)
   - No backward feedback (simple but limited)
   - Easy debugging (can trace output at each step)

4. **Error Propagation**
   - One agent failure aborts the entire pipeline
   - Clear identification of failure point
   - Retry possible from the failed step

### Variations

#### Variation 1: Conditional Branching

Some steps can be skipped based on conditions.

```typescript
async function conditionalPipeline(requirements: string): Promise<AppState> {
  let state: AppState = { requirements };

  state = await architectureAgent(state);
  state = await codingAgent(state);
  state = await testingAgent(state);

  // Run security scan only if test coverage >= 90%
  if (state.tests && state.tests.coverage >= 90) {
    state = await securityAgent(state);
  } else {
    console.log('⚠️ Skipping security scan (low test coverage)');
  }

  state = await devopsAgent(state);

  return state;
}
```

[The rest of the chapter continues with similar patterns...]

---

## Best Practices

### 1. Clear Agent Boundaries

Clearly define the responsibility of each agent.

```typescript
// ✅ Good example: Single responsibility
const codingAgent = {
  name: 'Coding',
  responsibility: 'Code implementation only',
  canHandle: (req) => req.message.includes('code')
};

const testingAgent = {
  name: 'Testing',
  responsibility: 'Test writing and execution only',
  canHandle: (req) => req.message.includes('test')
};

// ❌ Bad example: Multiple responsibilities
const superAgent = {
  name: 'Super',
  responsibility: 'Code + Test + Deploy + Monitor',  // Too much!
  canHandle: (req) => true  // Handles everything
};
```

### 2. Maintain State Immutability

Each agent should return a new state object.

```typescript
// ✅ Good example: Maintain immutability
async function agent(state: AppState): Promise<AppState> {
  return { ...state, newField: 'value' };  // Return new object
}

// ❌ Bad example: Directly modify state
async function badAgent(state: AppState): Promise<AppState> {
  state.newField = 'value';  // Modify original (side effect)
  return state;
}
```

### 3. Error Handling Strategy

Implement consistent error handling across all agents.

```typescript
async function safeAgent(state: AppState): Promise<AppState> {
  try {
    const result = await performTask();
    return { ...state, result };
  } catch (error) {
    console.error(`Agent failed: ${error.message}`);

    // Add error info to state
    return {
      ...state,
      error: {
        agent: 'MyAgent',
        message: error.message,
        timestamp: new Date()
      }
    };
  }
}
```

---

## Summary

This chapter taught you 4 core agent collaboration patterns:

1. **Sequential Execution**: Simple and predictable. Suitable for pipelines where order matters.

2. **Parallel Execution**: Fast execution. Use when performing independent tasks simultaneously.

3. **Handoff**: Flexible routing. Use when domains are clearly separated and dynamic routing is needed.

4. **Orchestrator**: Complex workflow management. Manager Agent coordinates everything.

**Selection Guide**:
- Simple tasks: Sequential execution
- Performance critical: Parallel execution
- Dynamic routing: Handoff
- Complex systems: Orchestrator

**In practice, combine patterns** for optimal results. A hybrid approach where an orchestrator manages overall flow, parallel execution runs in some sections, and handoffs transfer to specialists when needed is most effective.

The next chapter covers deploying these patterns in actual production environments.
