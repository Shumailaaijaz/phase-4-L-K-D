# Research: MCP Server & Task Tools

**Feature**: 004-mcp-task-tools
**Date**: 2025-01-25

---

## Research Questions Resolved

### 1. MCP SDK Integration Pattern

**Decision**: Use Official MCP Python SDK with FastMCP for tool registration

**Rationale**:
- Official MCP SDK provides the canonical implementation for Model Context Protocol
- FastMCP is a lightweight wrapper that simplifies tool registration
- Both are maintained and compatible with OpenAI Agents SDK
- Provides typed tool definitions with automatic schema generation

**Alternatives Considered**:
- Raw HTTP endpoints: Rejected - doesn't follow MCP protocol
- Custom tool wrapper: Rejected - reinventing the wheel
- LangChain tools: Rejected - adds unnecessary dependency and complexity

---

### 2. Database Session Strategy for Stateless Tools

**Decision**: Create fresh database session per tool invocation using dependency injection

**Rationale**:
- Each tool invocation is independent (stateless requirement)
- Session created at tool call start, committed/rolled back at end
- No session sharing between tool calls
- Consistent with FastAPI dependency injection pattern used in Spec 003

**Alternatives Considered**:
- Global session pool: Rejected - risks state leakage
- Long-lived connections: Rejected - not suitable for serverless/stateless
- Connection per request middleware: Considered but tool-level is more granular

---

### 3. Tool Response Wrapper Pattern

**Decision**: Standardized ToolResponse wrapper with success/data/error structure

**Rationale**:
- Agents need predictable response format for parsing
- Separates success case (data) from error case (error object)
- Includes machine-readable error codes for agent decision-making
- Human-readable messages for debugging and user-facing errors

**Structure**:
```
{
  "success": bool,
  "data": {...} | null,
  "error": {"code": str, "message": str, "details": {...}} | null
}
```

---

### 4. User Isolation Implementation

**Decision**: All CRUD functions require user_id parameter, filter at SQL level

**Rationale**:
- Constitution §3.1 mandates user isolation on ALL queries
- user_id passed by caller (agent layer) - trusted input
- Every SELECT, UPDATE, DELETE includes WHERE user_id = :user_id
- No lookup by task_id alone - always paired with user_id

**Security Note**: This spec does NOT validate user_id authenticity. The agent layer (Spec 005) is responsible for extracting user_id from authenticated JWT. MCP tools trust the provided user_id.

---

### 5. Task ID Type

**Decision**: Use existing integer auto-increment ID (matches Phase II schema)

**Rationale**:
- Task table already uses integer primary key
- No benefit to migrating to UUID for this spec
- Spec 003 uses UUID for conversations (different concern)
- Maintaining consistency with existing Phase II implementation

**Note**: task_id is passed as string in tool parameters for JSON compatibility, converted to int internally.

---

### 6. Idempotency Implementation

**Decision**: Implement idempotency only where meaningful

**Tool Idempotency Matrix**:

| Tool | Idempotent | Implementation |
|------|------------|----------------|
| add_task | No | Each call creates new task |
| list_tasks | Yes | Read-only, same result for same state |
| complete_task | Yes | Check if already completed, return success |
| delete_task | Soft no | Returns not_found if already deleted |
| update_task | No | Timestamps change on each call |

**Rationale**: complete_task idempotency is important because agents may retry on failure. Returning success for already-completed tasks prevents duplicate "completed" messages.

---

### 7. Input Validation Strategy

**Decision**: Pydantic models for tool parameters with custom validators

**Rationale**:
- Pydantic integrates with FastMCP for automatic schema generation
- Field validators for: non-empty title, valid priority enum, ISO date format
- Returns structured validation errors with field-level details
- Consistent with FastAPI/SQLModel validation patterns

**Validation Rules**:
- title: Required, 1-255 chars, not whitespace-only
- description: Optional, max 1000 chars
- priority: Optional, enum ["Low", "Medium", "High"]
- due_date: Optional, ISO 8601 format (YYYY-MM-DD)
- task_id: Required for modify operations, positive integer as string
- user_id: Always required, string (matches Better Auth user ID format)

---

### 8. Error Handling Hierarchy

**Decision**: Three-tier error handling with standardized codes

**Tiers**:
1. **Validation errors**: Caught at Pydantic level, return `invalid_input`
2. **Business logic errors**: Task not found or user isolation, return `not_found`
3. **Infrastructure errors**: Database/connection failures, return `processing_error`

**Error Code Mapping**:
- `invalid_input` → 400-level equivalent
- `invalid_priority` → 400-level (specific validation)
- `invalid_date` → 400-level (specific validation)
- `not_found` → 404-level equivalent
- `processing_error` → 500-level equivalent

**Note**: HTTP status codes are conceptual mapping. MCP tools return structured errors, not HTTP responses.

---

### 9. Logging Strategy

**Decision**: Structured logging with Python logging module

**Log Points**:
- Tool invocation start (INFO): tool name, user_id, parameters (sanitized)
- Tool invocation end (INFO): tool name, success/failure, duration
- Validation errors (WARNING): field-level details
- Database errors (ERROR): operation, exception type (no stack in user response)
- User isolation failures (WARNING): attempted cross-user access

**Sensitive Data Handling**: Never log task content in production. Log IDs and metadata only.

---

### 10. MCP Server Deployment Model

**Decision**: MCP tools as FastAPI dependency, not separate server

**Rationale**:
- Tools can be imported and registered within existing FastAPI app
- Shares database configuration with other endpoints
- Simpler deployment (single process)
- Agent layer (Spec 005) will call tools directly via function calls

**Alternative Considered**: Separate MCP server process
- Rejected: Adds complexity without benefit for this use case
- May reconsider if scaling requires tool isolation

---

## Constitution Compliance Check

| Principle | Spec Compliance |
|-----------|-----------------|
| §3.1 User Isolation | All tools require user_id, all queries filter by user_id |
| §3.2 Stateless Server | Fresh DB session per tool, no in-memory state |
| §3.3 No Silent Failures | Structured error responses for all failure modes |
| §3.4 Auth Boundary | user_id trusted from caller (agent validates JWT) |
| §3.5 Natural Language | Tools return data, agent layer handles presentation |

**Result**: All constitution gates pass for MCP tool layer.

---

## Integration Points

### Spec 003: Chat API & Persistence
- MCP tools operate on same database (Neon PostgreSQL)
- Shares database session pattern
- No direct interaction with Chat API endpoints

### Spec 005: Agent Loop (Future)
- Agent will import and invoke MCP tools
- Agent responsible for user_id extraction from JWT
- Agent translates natural language to tool calls
- Agent formats tool responses for user

---

## Open Questions (Deferred)

1. **Rate limiting**: Not implemented in this spec. Future spec if needed.
2. **Batch operations**: Single-task tools only. Batch could be future enhancement.
3. **Task search/filter**: list_tasks returns all. Filter by status could be future enhancement.
