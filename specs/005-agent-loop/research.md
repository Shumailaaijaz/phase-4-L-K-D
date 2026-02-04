# Research: AI Agent Loop (Reasoning Layer)

**Feature Branch**: `005-agent-loop`
**Date**: 2025-01-26
**Status**: Complete

---

## 1. OpenAI Agents SDK Integration

### 1.1 SDK Selection Rationale

**Decision**: Use OpenAI Agents SDK (Python) for agent orchestration.

**Rationale**:
- Constitution §8 mandates OpenAI Agents SDK as the agent framework
- Native function calling support with structured tool definitions
- Built-in conversation management and context tracking
- Handles multi-turn reasoning automatically
- Clean separation between agent logic and tool execution

### 1.2 SDK Key Concepts

| Concept | Purpose | Our Usage |
|---------|---------|-----------|
| Agent | Orchestrates reasoning and tool calls | Single TodoAgent with system prompt |
| Tools | Functions the agent can invoke | 5 MCP tools from Spec 004 |
| Runner | Executes agent with context | Per-request invocation |
| Context | Carries state through agent run | user_id, conversation history |

### 1.3 Agent Configuration

```python
# Agent will be configured with:
agent = Agent(
    name="TodoAssistant",
    instructions="<system_prompt>",  # Defines personality and behavior
    tools=[add_task, list_tasks, complete_task, delete_task, update_task],
    model="gpt-4o-mini"  # Cost-effective for task management
)
```

---

## 2. Intent Detection Strategy

### 2.1 Approach: LLM-Native Intent Recognition

**Decision**: Let the LLM handle intent classification naturally through the system prompt.

**Rejected Alternatives**:
- Keyword matching: Too brittle, misses natural variations
- Pre-classifier model: Adds latency and complexity
- Regex patterns: Cannot handle natural language variations

**Rationale**:
- Modern LLMs excel at understanding user intent
- System prompt provides clear guidance on when to use each tool
- No extra classification step = faster response time
- Handles ambiguity through clarification (per Constitution §2)

### 2.2 Intent Mapping

| User Intent | Trigger Phrases (Examples) | Tool to Invoke |
|-------------|---------------------------|----------------|
| Create task | "add", "create", "new task", "remind me" | add_task |
| View tasks | "show", "list", "what's on", "my tasks" | list_tasks |
| Complete task | "done", "finished", "completed", "mark" | complete_task |
| Update task | "change", "update", "rename", "modify" | update_task |
| Delete task | "delete", "remove", "cancel" | delete_task |
| General | greetings, thanks, help requests | No tool (direct response) |

### 2.3 Multi-Intent Handling

When a message contains multiple intents (e.g., "Add buy milk and show my list"):
1. Agent processes sequentially within single turn
2. Uses multiple tool calls in order
3. Combines results in single response

---

## 3. Task Matching Strategy

### 3.1 Challenge: No IDs in User Messages

Constitution §3.5 requires: "User MUST NEVER need to say 'task_id: 47'"

**Solution**: Agent matches tasks by title similarity.

### 3.2 Matching Algorithm

1. **Exact match**: User says exact task title
2. **Substring match**: Task title contains user's phrase
3. **Semantic match**: LLM determines most relevant task from list

**Implementation**:
```
User: "Mark the milk task as done"
Agent:
  1. Call list_tasks to get user's tasks
  2. Find task with "milk" in title
  3. Call complete_task with matched task_id
  4. Respond without exposing ID
```

### 3.3 Ambiguity Resolution

When multiple tasks match:
- Agent asks user to clarify: "I found multiple tasks about 'groceries'. Which one: 'Buy groceries' or 'Return groceries bags'?"
- Per Constitution §2: "Never assume - when a request is ambiguous, ask a clarifying question"

---

## 4. Tool Routing Decision Flow

### 4.1 Decision Flowchart

```
User Message Received
         │
         ▼
┌─────────────────────┐
│ Is it a greeting or │
│ general question?   │──── Yes ───► Direct response (no tool)
└─────────────────────┘
         │ No
         ▼
┌─────────────────────┐
│ Does it require     │
│ task information?   │──── Yes ───► Call list_tasks first
└─────────────────────┘
         │ No
         ▼
┌─────────────────────┐
│ Is the target task  │
│ clearly identified? │──── No ────► Ask for clarification
└─────────────────────┘
         │ Yes
         ▼
┌─────────────────────┐
│ Invoke appropriate  │
│ tool with params    │
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│ Format response for │
│ natural language    │
└─────────────────────┘
```

### 4.2 Pre-Tool Lookup Pattern

For operations requiring task identification (complete, update, delete):
1. First: list_tasks (get current tasks)
2. Then: identify target task from list
3. Finally: invoke operation tool

This pattern ensures:
- Agent has current task context
- Correct task_id is used internally
- User never sees or provides IDs

---

## 5. System Prompt Design

### 5.1 Prompt Structure

```
[Identity]        - Who the assistant is
[Capabilities]    - What it can do (task management)
[Tools]           - When to use each tool
[Behavior]        - Tone, error handling, clarification
[Constraints]     - What NOT to do (no IDs, no technical jargon)
[Examples]        - Few-shot demonstrations (optional)
```

### 5.2 Key Prompt Elements

**Identity** (per Constitution §2):
- "Kind, reliable, slightly warm but still professional"
- "Thoughtful friend who genuinely wants to help"

**Guardrails**:
- Never expose task IDs or technical details
- Always confirm destructive actions (delete)
- Ask for clarification when ambiguous
- Keep responses concise and friendly

### 5.3 Prompt Length Consideration

Constitution §5.2 warns: "Long system prompts full of examples → hurts reasoning & increases cost"

**Decision**: Keep prompt under 500 tokens, minimal examples.

---

## 6. Error Handling Strategy

### 6.1 Error Categories

| Error Type | Source | User-Facing Response |
|------------|--------|---------------------|
| not_found | Tool returns task not found | "I couldn't find a task about 'X' in your list." |
| validation | Invalid input parameters | "Could you provide more details about the task?" |
| database | Connection/query failure | "I'm having trouble right now. Please try again." |
| timeout | Agent reasoning took too long | "That took longer than expected. Let's try again." |

### 6.2 Error Response Pattern

Per Constitution §3.3: "Technical error details MUST NEVER reach the user."

```python
# Internal error
ToolError(code="database_error", message="Connection refused to host")

# User sees
"I'm having a bit of trouble accessing your tasks right now. Could you try again in a moment?"
```

### 6.3 Graceful Degradation

When agent encounters errors:
1. Log full error details internally
2. Return friendly message to user
3. Suggest alternative action if possible

---

## 7. Conversation Context

### 7.1 Context Scope

**Per-conversation context**:
- user_id (from JWT)
- conversation_id
- Message history (from database via Spec 003)

**Not stored in context** (stateless per §3.2):
- Task cache
- User preferences
- Session state

### 7.2 History Reconstruction

Agent receives conversation history from Chat API (Spec 003):
1. Chat endpoint fetches messages for conversation_id
2. Messages passed to agent as conversation context
3. Agent reasons with full history available

### 7.3 Context Truncation

For long conversations (>20 messages):
- Recent messages kept in full
- Older messages summarized or truncated
- Constitution §5.2 notes: "Keep huge conversation history wisely"

---

## 8. Response Generation

### 8.1 Response Format

Per Constitution §10 (Personality & Language Style Guide):

**Successful operations**:
- "Got it! Added 'Buy milk' to your list. Anything else?"
- "Great! I've marked 'Call dentist' as complete."

**Task lists**:
```
Here's what you have:
1. ☐ Buy groceries
2. ☐ Call dentist
3. ✓ Send email

Anything you'd like to update?
```

**Errors**:
- "I couldn't find a task about 'report' in your list."
- "Do you really want to delete 'Call mom'? Reply 'yes delete' to confirm."

### 8.2 Response Constraints

- No raw JSON
- No tool names
- No task IDs
- No stack traces
- Emojis sparingly (positive confirmations only)
- English primary, light Urdu okay for greetings

---

## 9. Performance Considerations

### 9.1 Latency Budget

Constitution §6.2: "Average turn latency < 4 seconds"

| Component | Budget |
|-----------|--------|
| JWT validation | 50ms |
| History fetch | 200ms |
| Agent reasoning + tool calls | 3000ms |
| Response persistence | 250ms |
| **Total** | **3500ms** |

### 9.2 Optimization Strategies

1. **Model selection**: gpt-4o-mini for fast responses
2. **Tool efficiency**: MCP tools designed for <500ms per call
3. **Parallel tools**: When possible, agent calls multiple tools concurrently
4. **Minimal history**: Only recent relevant messages in context

---

## 10. Safety & Guardrails

### 10.1 Agent Guardrails

| Protection | Implementation |
|------------|----------------|
| Max iterations | Limit agent to 10 tool calls per request |
| Timeout | 30 second maximum per request |
| User isolation | user_id passed to every tool call |
| Confirmation | Destructive ops require explicit user confirmation |

### 10.2 Tool Call Validation

Before invoking any tool:
1. Verify user_id matches authenticated user
2. Validate parameters against schema
3. Check rate limits (if implemented)

---

## 11. Logging & Observability

### 11.1 What to Log

| Event | Details Logged |
|-------|----------------|
| Request received | conversation_id, user_id, message (truncated) |
| Tool invoked | tool_name, params (sanitized), duration |
| Tool result | success/failure, error code if failed |
| Response sent | response length, total latency |

### 11.2 What NOT to Log

- Full user messages (PII concern)
- Task content (user data)
- Internal task IDs in user-visible logs
- Full error stack traces in user-facing responses

---

## 12. Technical Decisions Summary

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Agent framework | OpenAI Agents SDK | Constitution mandate, native tool support |
| Intent detection | LLM-native via prompt | Simple, accurate, no added latency |
| Task matching | Title similarity | Avoids exposing IDs per §3.5 |
| Model | gpt-4o-mini | Cost-effective, fast, sufficient for task management |
| Error handling | Friendly messages only | Per §3.3, no technical details |
| Context | Per-request stateless | Per §3.2, fresh from DB each time |

---

## 13. Integration Dependencies

| Dependency | Spec | Interface |
|------------|------|-----------|
| Chat API | 003 | Receives messages, returns responses |
| MCP Tools | 004 | Tool functions, ToolResponse format |
| JWT Auth | Better Auth | user_id extraction |
| Message Store | 003 | Conversation history persistence |

---

## Ready for Plan

This research establishes the technical foundation for the implementation plan.
