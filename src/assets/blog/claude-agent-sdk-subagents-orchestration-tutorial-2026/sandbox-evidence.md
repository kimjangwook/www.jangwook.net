# Sandbox Evidence — claude-agent-sdk 0.2.82

## Installation Log
```
$ pip3 install claude-agent-sdk
Installing collected packages: claude-agent-sdk
Successfully installed claude-agent-sdk-0.2.82
```

## AgentDefinition Validation
```python
agent_def = sdk.AgentDefinition(
    description="Code reviewer focused on Python best practices",
    prompt="You are a code review specialist...",
    tools=["Read"],
    model="sonnet",
    maxTurns=5,
)
# => AgentDefinition created: Code reviewer focused on Python best practices

opts = sdk.ClaudeAgentOptions(
    agents={
        "code-reviewer": agent_def,
        "security-scanner": AgentDefinition(...),
        "doc-writer": AgentDefinition(...),
    },
    task_budget=sdk.TaskBudget(total=50000),
    allowed_tools=["Agent", "Read", "Bash"],
)
# => ClaudeAgentOptions created with agents: ['code-reviewer', 'security-scanner', 'doc-writer']
# => task_budget total: 50000
# => allowed_tools: ['Agent', 'Read', 'Bash']
```

## SDK API Structure
- `AgentDefinition` fields: description, prompt, tools, disallowedTools, model, skills, memory, mcpServers, initialPrompt, maxTurns, background, effort, permissionMode
- `ClaudeAgentOptions.agents`: `dict[str, AgentDefinition] | None`
- `ClaudeAgentOptions.task_budget`: `TaskBudget(total: int) | None`
- `SubagentStartHookInput.agent_type`: str
- `list_subagents(session_id, directory)`: returns `list[str]`
- `get_subagent_messages(session_id, agent_id, limit, offset)`: returns `list[SessionMessage]`
