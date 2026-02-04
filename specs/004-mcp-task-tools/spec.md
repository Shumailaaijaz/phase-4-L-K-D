# Feature Specification: MCP Server & Task Tools (Control Plane)

**Feature Branch**: `004-mcp-task-tools`
**Created**: 2025-01-25
**Status**: Draft
**Input**: User description: "MCP Server & Task Tools specification for Phase III Todo AI Chatbot"

---

## Overview

This specification defines a stateless MCP (Model Context Protocol) server that exposes task management operations as tools. The MCP server acts as the control plane between AI agents and the task database, providing a well-defined contract for task operations.

**Key Principle**: The MCP server is a pure execution layer. It receives tool invocation requests, performs database operations, and returns structured results. It does NOT make decisions, reason about tasks, or maintain any in-memory state.

---

## User Scenarios & Testing

### User Story 1 - Add Task via AI Agent (Priority: P1)

An AI agent interprets a user's natural language request and invokes the `add_task` tool to create a new task in the database.

**Why this priority**: Creating tasks is the foundational operation. Without it, no other task management features are meaningful.

**Independent Test**: Invoke `add_task` tool with valid parameters and verify the task is persisted in the database with correct attributes.

**Acceptance Scenarios**:

1. **Given** a valid user_id and task title, **When** `add_task` is invoked, **Then** a new task is created with the provided attributes and a unique ID is returned.
2. **Given** a user_id and task title with optional fields (description, priority, due_date), **When** `add_task` is invoked, **Then** all provided fields are persisted correctly.
3. **Given** an empty or whitespace-only title, **When** `add_task` is invoked, **Then** an error response is returned indicating invalid input.

---

### User Story 2 - List Tasks via AI Agent (Priority: P1)

An AI agent retrieves the user's tasks to provide context for conversation or to answer user queries about their todo list.

**Why this priority**: Listing tasks enables the agent to provide accurate information about the user's current task state.

**Independent Test**: Invoke `list_tasks` tool with a valid user_id and verify all tasks for that user are returned in the correct format.

**Acceptance Scenarios**:

1. **Given** a user with existing tasks, **When** `list_tasks` is invoked, **Then** all tasks for that user are returned ordered by creation time.
2. **Given** a user with no tasks, **When** `list_tasks` is invoked, **Then** an empty list is returned (not an error).
3. **Given** two different users with tasks, **When** `list_tasks` is invoked for User A, **Then** only User A's tasks are returned (user isolation).

---

### User Story 3 - Complete Task via AI Agent (Priority: P1)

An AI agent marks a task as completed when the user indicates they've finished it.

**Why this priority**: Task completion is a core workflow that users expect from a todo application.

**Independent Test**: Invoke `complete_task` tool with valid task_id and user_id, verify the task's completed status changes to true.

**Acceptance Scenarios**:

1. **Given** an existing incomplete task, **When** `complete_task` is invoked, **Then** the task's completed status is set to true and updated_at is refreshed.
2. **Given** an already completed task, **When** `complete_task` is invoked, **Then** the task remains completed (idempotent).
3. **Given** a task_id that doesn't exist or belongs to another user, **When** `complete_task` is invoked, **Then** a not_found error is returned.

---

### User Story 4 - Update Task via AI Agent (Priority: P2)

An AI agent modifies task attributes when the user wants to change details like title, description, priority, or due date.

**Why this priority**: Updates are important but secondary to create/complete workflows.

**Independent Test**: Invoke `update_task` tool with partial updates and verify only specified fields are modified.

**Acceptance Scenarios**:

1. **Given** an existing task, **When** `update_task` is invoked with a new title, **Then** only the title is updated and other fields remain unchanged.
2. **Given** an existing task, **When** `update_task` is invoked with multiple fields, **Then** all specified fields are updated atomically.
3. **Given** invalid field values (empty title, invalid priority), **When** `update_task` is invoked, **Then** a validation error is returned.

---

### User Story 5 - Delete Task via AI Agent (Priority: P2)

An AI agent removes a task when the user wants to delete it from their list.

**Why this priority**: Deletion is a destructive operation that's needed but used less frequently than create/complete.

**Independent Test**: Invoke `delete_task` tool with valid task_id and user_id, verify the task is removed from the database.

**Acceptance Scenarios**:

1. **Given** an existing task, **When** `delete_task` is invoked, **Then** the task is permanently removed from the database.
2. **Given** a task_id that doesn't exist or belongs to another user, **When** `delete_task` is invoked, **Then** a not_found error is returned.
3. **Given** a task has already been deleted, **When** `delete_task` is invoked again, **Then** a not_found error is returned (idempotent from caller's perspective).

---

### Edge Cases

- What happens when tool receives malformed parameters (wrong types, missing required fields)?
- How does the system handle concurrent modifications to the same task?
- What happens when database connection fails during operation?
- How does the system handle very long task titles or descriptions?
- What happens when user_id doesn't exist in the user table?

---

## Requirements

### Functional Requirements

#### MCP Server Architecture

- **FR-001**: MCP server MUST be stateless, maintaining no in-memory task or user state between invocations.
- **FR-002**: MCP server MUST use the Official MCP SDK for tool registration and execution.
- **FR-003**: MCP server MUST be callable by OpenAI Agents SDK runners.
- **FR-004**: Each tool invocation MUST be atomic and self-contained.
- **FR-005**: All database reads and writes MUST go through SQLModel ORM.

#### Tool: add_task

- **FR-010**: Tool MUST accept user_id (required), title (required), description (optional), priority (optional), and due_date (optional).
- **FR-011**: Tool MUST validate that title is not empty or whitespace-only.
- **FR-012**: Tool MUST generate a unique task ID for each new task.
- **FR-013**: Tool MUST set created_at and updated_at timestamps automatically.
- **FR-014**: Tool MUST return the created task with its generated ID.
- **FR-015**: Tool MUST apply default priority of "Medium" if not specified.

#### Tool: list_tasks

- **FR-020**: Tool MUST accept user_id (required) and optional filter parameters.
- **FR-021**: Tool MUST return only tasks belonging to the specified user_id.
- **FR-022**: Tool MUST return tasks ordered by created_at descending (newest first).
- **FR-023**: Tool MUST return an empty array (not an error) when user has no tasks.
- **FR-024**: Tool MUST include all task fields in the response.

#### Tool: complete_task

- **FR-030**: Tool MUST accept task_id (required) and user_id (required).
- **FR-031**: Tool MUST verify task belongs to the specified user before modifying.
- **FR-032**: Tool MUST set completed field to true and update updated_at timestamp.
- **FR-033**: Tool MUST be idempotent (completing an already-completed task succeeds).
- **FR-034**: Tool MUST return the updated task after completion.

#### Tool: delete_task

- **FR-040**: Tool MUST accept task_id (required) and user_id (required).
- **FR-041**: Tool MUST verify task belongs to the specified user before deleting.
- **FR-042**: Tool MUST permanently remove the task from the database.
- **FR-043**: Tool MUST return a confirmation with the deleted task_id.

#### Tool: update_task

- **FR-050**: Tool MUST accept task_id (required), user_id (required), and optional update fields.
- **FR-051**: Tool MUST verify task belongs to the specified user before modifying.
- **FR-052**: Tool MUST apply only the fields that are explicitly provided (partial update).
- **FR-053**: Tool MUST validate any provided fields (non-empty title, valid priority).
- **FR-054**: Tool MUST update the updated_at timestamp on any change.
- **FR-055**: Tool MUST return the updated task with all current values.

#### Error Handling

- **FR-060**: All tools MUST return errors in a consistent, machine-readable format.
- **FR-061**: Error responses MUST include an error code and human-readable message.
- **FR-062**: Validation errors MUST specify which parameter failed and why.
- **FR-063**: Database errors MUST be caught and returned as processing errors (no stack traces).
- **FR-064**: Tool MUST return not_found error when task doesn't exist or user isolation fails.

---

### Key Entities

#### Task (existing from Phase II)

- **What it represents**: A single todo item belonging to a user
- **Key attributes**: id, user_id, title, description, completed, priority, due_date, created_at, updated_at
- **Relationships**: Belongs to a User via user_id foreign key

#### Tool Response

- **What it represents**: Structured result from any MCP tool invocation
- **Key attributes**: success (boolean), data (tool-specific payload), error (if failed)

#### Tool Error

- **What it represents**: Machine-readable error from tool execution
- **Key attributes**: code (error identifier), message (human-readable description), details (optional field-specific info)

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: All five tools (add_task, list_tasks, complete_task, delete_task, update_task) are operational and return structured responses.
- **SC-002**: User isolation is enforced - no tool can access or modify tasks belonging to other users.
- **SC-003**: Tool responses are deterministic - same input always produces same output (given same database state).
- **SC-004**: Server maintains zero in-memory state - restart does not affect functionality.
- **SC-005**: All tool operations complete successfully or return a structured error (no unhandled exceptions).
- **SC-006**: Tool contracts are stable and can be consumed by OpenAI Agents SDK without modification.

---

## Tool Specifications

### add_task

**Purpose**: Create a new task for a user.

| Parameter   | Type   | Required | Description                              |
| ----------- | ------ | -------- | ---------------------------------------- |
| user_id     | string | Yes      | ID of the user creating the task         |
| title       | string | Yes      | Task title (1-255 characters)            |
| description | string | No       | Task description (max 1000 characters)   |
| priority    | string | No       | Priority level: "Low", "Medium", "High"  |
| due_date    | string | No       | Due date in ISO 8601 format (YYYY-MM-DD) |

**Success Response**:
```
{
  "success": true,
  "data": {
    "id": <task_id>,
    "user_id": <user_id>,
    "title": <title>,
    "description": <description>,
    "completed": false,
    "priority": <priority>,
    "due_date": <due_date>,
    "created_at": <timestamp>,
    "updated_at": <timestamp>
  }
}
```

**Error Cases**:
- `invalid_input`: Title is empty, whitespace-only, or exceeds length limit
- `invalid_priority`: Priority value not in allowed set
- `invalid_date`: Due date is not valid ISO 8601 format
- `processing_error`: Database operation failed

---

### list_tasks

**Purpose**: Retrieve all tasks for a user.

| Parameter | Type   | Required | Description                      |
| --------- | ------ | -------- | -------------------------------- |
| user_id   | string | Yes      | ID of the user whose tasks to list |

**Success Response**:
```
{
  "success": true,
  "data": {
    "tasks": [
      {
        "id": <task_id>,
        "title": <title>,
        "description": <description>,
        "completed": <boolean>,
        "priority": <priority>,
        "due_date": <due_date>,
        "created_at": <timestamp>,
        "updated_at": <timestamp>
      }
    ],
    "total": <count>
  }
}
```

**Error Cases**:
- `processing_error`: Database operation failed

---

### complete_task

**Purpose**: Mark a task as completed.

| Parameter | Type   | Required | Description                      |
| --------- | ------ | -------- | -------------------------------- |
| task_id   | string | Yes      | ID of the task to complete       |
| user_id   | string | Yes      | ID of the user (for isolation)   |

**Success Response**:
```
{
  "success": true,
  "data": {
    "id": <task_id>,
    "title": <title>,
    "completed": true,
    "updated_at": <timestamp>
  }
}
```

**Error Cases**:
- `not_found`: Task doesn't exist or doesn't belong to user
- `processing_error`: Database operation failed

---

### delete_task

**Purpose**: Permanently remove a task.

| Parameter | Type   | Required | Description                      |
| --------- | ------ | -------- | -------------------------------- |
| task_id   | string | Yes      | ID of the task to delete         |
| user_id   | string | Yes      | ID of the user (for isolation)   |

**Success Response**:
```
{
  "success": true,
  "data": {
    "deleted": true,
    "task_id": <task_id>
  }
}
```

**Error Cases**:
- `not_found`: Task doesn't exist or doesn't belong to user
- `processing_error`: Database operation failed

---

### update_task

**Purpose**: Modify task attributes.

| Parameter   | Type    | Required | Description                              |
| ----------- | ------- | -------- | ---------------------------------------- |
| task_id     | string  | Yes      | ID of the task to update                 |
| user_id     | string  | Yes      | ID of the user (for isolation)           |
| title       | string  | No       | New title (1-255 characters)             |
| description | string  | No       | New description (max 1000 characters)    |
| priority    | string  | No       | New priority: "Low", "Medium", "High"    |
| due_date    | string  | No       | New due date in ISO 8601 format          |
| completed   | boolean | No       | Completion status                        |

**Success Response**:
```
{
  "success": true,
  "data": {
    "id": <task_id>,
    "title": <title>,
    "description": <description>,
    "completed": <boolean>,
    "priority": <priority>,
    "due_date": <due_date>,
    "created_at": <timestamp>,
    "updated_at": <timestamp>
  }
}
```

**Error Cases**:
- `not_found`: Task doesn't exist or doesn't belong to user
- `invalid_input`: No update fields provided, or field validation failed
- `invalid_priority`: Priority value not in allowed set
- `invalid_date`: Due date is not valid ISO 8601 format
- `processing_error`: Database operation failed

---

## Error Response Format

All tool errors follow this structure:

```
{
  "success": false,
  "error": {
    "code": "<error_code>",
    "message": "<human_readable_message>",
    "details": { ... }  // optional, field-specific info
  }
}
```

### Error Codes

| Code              | Description                                    |
| ----------------- | ---------------------------------------------- |
| invalid_input     | Required parameter missing or invalid          |
| invalid_priority  | Priority value not in [Low, Medium, High]      |
| invalid_date      | Date format is not valid ISO 8601              |
| not_found         | Task not found or user isolation violation     |
| processing_error  | Database or internal error                     |

---

## Statelessness & Idempotency Considerations

### Statelessness Guarantees

1. **No session state**: Each tool invocation is independent; server does not track invocation history.
2. **No caching**: All data is read fresh from the database on every invocation.
3. **No background processing**: Tool execution is synchronous and completes within the request.
4. **Restart survival**: Server can be restarted at any time without data loss or state corruption.

### Idempotency Notes

- **add_task**: NOT idempotent - each invocation creates a new task.
- **list_tasks**: Idempotent - same user_id returns same results (given unchanged database).
- **complete_task**: Idempotent - completing an already-completed task succeeds and returns current state.
- **delete_task**: Idempotent from error perspective - deleting non-existent task returns not_found.
- **update_task**: NOT idempotent - timestamps change on each update.

---

## Security & Authorization Assumptions

### Assumptions (Authorization NOT implemented in this spec)

1. **user_id is pre-validated**: The caller (agent layer) is responsible for ensuring user_id is authentic.
2. **No direct user access**: Tools are only invoked by the AI agent, never directly by end users.
3. **User isolation is enforced**: All operations filter by user_id at the database level.

### Security Boundaries

- This spec does NOT implement authentication or authorization.
- This spec DOES implement user isolation (every query filters by user_id).
- Database credentials are managed externally (environment variables).

---

## Dependencies & Assumptions

### Dependencies

- Neon PostgreSQL database with existing Task table (from Phase II)
- SQLModel ORM for database operations
- Official MCP SDK for tool registration
- OpenAI Agents SDK compatibility (caller)

### Assumptions

- Task table schema matches Phase II implementation (id, user_id, title, description, completed, priority, due_date, created_at, updated_at)
- Database connection is configured via DATABASE_URL environment variable
- MCP server runs as a separate process or module callable by the agent layer

---

## Out of Scope

- AI agent reasoning or decision-making logic
- Natural language understanding or intent parsing
- Chat API endpoints (covered in Spec 003)
- Frontend UI or ChatKit integration
- Prompt engineering or agent system prompts
- Authentication/authorization implementation
- Rate limiting (separate spec if needed)
