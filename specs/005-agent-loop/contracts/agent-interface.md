# Agent Interface Contract

**Feature**: 005-agent-loop
**Date**: 2025-01-26
**Status**: Draft

---

## Overview

This document defines the public interface for the AI Agent Loop module. The Chat API (Spec 003) uses these interfaces to invoke agent reasoning.

---

## Core Classes

### AgentContext

Per-request context container passed to the agent.

```python
from dataclasses import dataclass
from typing import List, Optional
from datetime import datetime

@dataclass
class MessageHistory:
    """Single message in conversation history."""
    role: str           # "user" | "assistant"
    content: str        # Message text
    timestamp: datetime # When message was sent
    tool_calls: Optional[List[dict]] = None  # Tool calls made (assistant only)

@dataclass
class AgentContext:
    """Immutable context for a single agent invocation."""
    user_id: str                         # Authenticated user identifier
    conversation_id: str                 # Current conversation UUID
    message_history: List[MessageHistory] # Previous messages (oldest first)

    @classmethod
    def from_request(
        cls,
        user_id: str,
        conversation_id: str,
        messages: List[dict]
    ) -> "AgentContext":
        """Create context from Chat API request data."""
        history = [
            MessageHistory(
                role=m["role"],
                content=m["content"],
                timestamp=m.get("timestamp", datetime.utcnow()),
                tool_calls=m.get("tool_calls")
            )
            for m in messages
        ]
        return cls(
            user_id=user_id,
            conversation_id=conversation_id,
            message_history=history
        )
```

---

### AgentResult

Response container returned by agent execution.

```python
from dataclasses import dataclass
from typing import List, Optional

@dataclass
class ToolCallRecord:
    """Record of a tool call made by the agent."""
    tool_name: str        # Name of tool invoked
    parameters: dict      # Parameters passed (user_id redacted in logs)
    result: dict          # ToolResponse from MCP tool
    duration_ms: int      # How long the tool call took

@dataclass
class AgentResult:
    """Result of agent execution."""
    success: bool                          # Whether agent completed successfully
    response: str                          # Natural language response for user
    tool_calls: List[ToolCallRecord]       # Tools invoked during execution
    error: Optional[str] = None            # Error message (user-friendly)

    @property
    def has_tool_calls(self) -> bool:
        """Check if agent made any tool calls."""
        return len(self.tool_calls) > 0
```

---

### AgentRunner

Main orchestrator for agent execution.

```python
from typing import Callable
from sqlmodel import Session

class AgentRunner:
    """Orchestrates AI agent reasoning and tool execution.

    Usage:
        runner = AgentRunner(session_factory, mcp_server)
        result = await runner.run(context, "Add task buy milk")
    """

    def __init__(
        self,
        session_factory: Callable[[], Session],
        mcp_server: "MCPToolServer"
    ):
        """Initialize agent runner.

        Args:
            session_factory: Factory to create fresh DB sessions
            mcp_server: MCP tool server for task operations
        """
        ...

    async def run(
        self,
        context: AgentContext,
        message: str
    ) -> AgentResult:
        """Execute agent with user message.

        This method:
        1. Builds agent with system prompt and tools
        2. Provides conversation history as context
        3. Processes user message
        4. Executes any tool calls via MCP server
        5. Returns formatted natural language response

        Args:
            context: Request context with user_id and history
            message: User's natural language input

        Returns:
            AgentResult with response and tool call records

        Raises:
            TimeoutError: If execution exceeds 30 seconds

        Guarantees:
            - user_id is passed to every tool call
            - Max 10 tool calls per invocation
            - Response is always user-friendly (no IDs, no technical jargon)
        """
        ...
```

---

## Integration Example

### Chat API Usage

```python
from backend.agent import AgentRunner, AgentContext
from backend.mcp import MCPToolServer
from backend.db import get_session

# Initialize (once at startup)
mcp_server = MCPToolServer(get_session)
agent_runner = AgentRunner(get_session, mcp_server)

# Per-request (in chat endpoint)
async def handle_chat(user_id: str, conversation_id: str, message: str):
    # 1. Load conversation history from database
    messages = await load_conversation_history(conversation_id)

    # 2. Create agent context
    context = AgentContext.from_request(
        user_id=user_id,
        conversation_id=conversation_id,
        messages=messages
    )

    # 3. Run agent
    result = await agent_runner.run(context, message)

    # 4. Persist messages
    await save_user_message(conversation_id, message)
    await save_assistant_message(
        conversation_id,
        result.response,
        tool_calls=result.tool_calls
    )

    # 5. Return response
    return {
        "response": result.response,
        "conversation_id": conversation_id
    }
```

---

## Response Format Contract

### Successful Tool Operations

| Operation | Response Format |
|-----------|----------------|
| Task created | "Got it! Added '[title]' to your list. Anything else?" |
| Task list | Numbered list with checkboxes (☐/✓) |
| Task completed | "Great! I've marked '[title]' as complete." |
| Task deleted | "I've removed '[title]' from your tasks." |
| Task updated | "Updated! '[title]' now has [changes]." |

### Error Responses

| Error Type | Response Format |
|------------|----------------|
| Task not found | "I couldn't find a task about '[query]' in your list." |
| Ambiguous task | "I found multiple tasks about '[query]'. Which one: [options]?" |
| Invalid input | "Could you provide more details about [what's missing]?" |
| System error | "I'm having a bit of trouble right now. Please try again." |

### Confirmation Prompts

| Operation | Confirmation Required |
|-----------|----------------------|
| Delete task | "Do you really want to delete '[title]'? Reply 'yes delete' to confirm." |
| Bulk operation | "That's a big action. Confirm with '[confirmation phrase]'." |

---

## Tool Call Recording

Each tool call is recorded for persistence (Spec 003):

```python
ToolCallRecord(
    tool_name="add_task",
    parameters={
        "title": "Buy milk",
        "priority": "Medium"
        # Note: user_id is injected but may be redacted in logs
    },
    result={
        "success": True,
        "data": {
            "id": 123,
            "title": "Buy milk",
            "completed": False,
            ...
        }
    },
    duration_ms=245
)
```

---

## Guarantees

### User Isolation

- `user_id` from `AgentContext` is injected into every MCP tool call
- Agent cannot access tasks belonging to other users
- Tool responses are already filtered by user_id (via Spec 004)

### Statelessness

- `AgentContext` is immutable
- No state persists between `run()` calls
- Conversation history comes from database each request

### Safety Limits

| Limit | Value | Purpose |
|-------|-------|---------|
| Max tool calls | 10 | Prevent infinite loops |
| Request timeout | 30s | Prevent runaway execution |
| Response length | ~500 chars | Keep responses concise |

### Response Quality

- Never contains task IDs
- Never contains technical jargon
- Always grammatically correct
- Uses emoji sparingly (positive confirmations only)

---

## Error Handling

All errors are converted to user-friendly messages before returning in `AgentResult`:

```python
# Internal
try:
    result = await agent.execute()
except ToolError as e:
    # Map to friendly message
    friendly_message = error_handler.to_friendly(e)
    return AgentResult(
        success=False,
        response=friendly_message,
        tool_calls=[],
        error=friendly_message
    )
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-01-26 | Initial contract |
