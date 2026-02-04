# Data Model: MCP Task Tools

**Feature**: 004-mcp-task-tools
**Date**: 2025-01-25

---

## Existing Entities (From Phase II)

### Task

**Source**: `backend/models/user.py`

The Task entity already exists from Phase II. MCP tools will operate on this existing table.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | int | PK, auto-increment | Unique task identifier |
| user_id | int | FK → User.id, NOT NULL, INDEX | Owner of the task |
| title | str | NOT NULL, min 1 char | Task title |
| description | str | NULL | Optional task description |
| completed | bool | NOT NULL, default false | Completion status |
| priority | str | NOT NULL, default "Medium" | Priority level |
| due_date | str | NULL | Due date (ISO format string) |
| created_at | datetime | NOT NULL, default NOW | Creation timestamp |
| updated_at | datetime | NOT NULL, default NOW | Last modification timestamp |

**Relationships**:
- Belongs to User via user_id foreign key

---

## New Entities (MCP Tool Layer)

### ToolResponse

**Purpose**: Standardized wrapper for all tool responses

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| success | bool | Yes | Whether the operation succeeded |
| data | dict | No | Tool-specific result payload (if success) |
| error | ToolError | No | Error details (if not success) |

**Invariant**: Exactly one of `data` or `error` is present (never both, never neither).

---

### ToolError

**Purpose**: Structured error information for failed tool calls

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| code | str | Yes | Machine-readable error code |
| message | str | Yes | Human-readable error message |
| details | dict | No | Optional field-specific error details |

**Error Codes**:
- `invalid_input`: Required parameter missing or validation failed
- `invalid_priority`: Priority not in [Low, Medium, High]
- `invalid_date`: Date not in ISO 8601 format
- `not_found`: Task doesn't exist or user isolation violation
- `processing_error`: Database or internal error

---

### Tool Parameter Models

#### AddTaskParams

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| user_id | str | Yes | Non-empty string |
| title | str | Yes | 1-255 chars, not whitespace-only |
| description | str | No | Max 1000 chars |
| priority | str | No | Enum: Low, Medium, High |
| due_date | str | No | ISO 8601 format (YYYY-MM-DD) |

---

#### ListTasksParams

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| user_id | str | Yes | Non-empty string |

---

#### CompleteTaskParams

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| task_id | str | Yes | Positive integer as string |
| user_id | str | Yes | Non-empty string |

---

#### DeleteTaskParams

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| task_id | str | Yes | Positive integer as string |
| user_id | str | Yes | Non-empty string |

---

#### UpdateTaskParams

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| task_id | str | Yes | Positive integer as string |
| user_id | str | Yes | Non-empty string |
| title | str | No | 1-255 chars if provided |
| description | str | No | Max 1000 chars if provided |
| priority | str | No | Enum: Low, Medium, High |
| due_date | str | No | ISO 8601 format if provided |
| completed | bool | No | Boolean if provided |

**Validation Rule**: At least one update field must be provided (title, description, priority, due_date, or completed).

---

## Tool Response Payloads

### TaskData (used in responses)

| Field | Type | Description |
|-------|------|-------------|
| id | int | Task ID |
| user_id | str | Owner user ID |
| title | str | Task title |
| description | str | Task description |
| completed | bool | Completion status |
| priority | str | Priority level |
| due_date | str | Due date |
| created_at | str | ISO timestamp |
| updated_at | str | ISO timestamp |

---

### ListTasksData

| Field | Type | Description |
|-------|------|-------------|
| tasks | list[TaskData] | Array of task objects |
| total | int | Total count of tasks |

---

### DeleteTaskData

| Field | Type | Description |
|-------|------|-------------|
| deleted | bool | Always true on success |
| task_id | str | ID of deleted task |

---

## State Transitions

### Task Lifecycle

```
Created (completed=false)
    │
    ├──[complete_task]──→ Completed (completed=true)
    │                           │
    │                           ├──[update_task completed=false]──→ Created
    │                           │
    │                           └──[delete_task]──→ Deleted (removed)
    │
    ├──[update_task]──→ Modified (same completed state)
    │
    └──[delete_task]──→ Deleted (removed)
```

**Note**: Deleted tasks are permanently removed. No soft delete.

---

## Validation Rules Summary

### Title Validation
- Cannot be null or empty
- Cannot be whitespace-only
- Maximum 255 characters
- Minimum 1 character after trimming

### Priority Validation
- Must be one of: "Low", "Medium", "High"
- Case-sensitive
- Default: "Medium"

### Due Date Validation
- Format: YYYY-MM-DD (ISO 8601 date only)
- No time component
- Past dates are allowed (for flexibility)

### User ID Validation
- Cannot be null or empty
- Treated as opaque string
- No format validation (trusts caller)

### Task ID Validation
- Must be a positive integer
- Passed as string in parameters
- Converted to int for database lookup
