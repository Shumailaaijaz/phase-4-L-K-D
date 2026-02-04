# MCP Tool Contracts

**Feature**: 004-mcp-task-tools
**Date**: 2025-01-25

---

## Tool Registration

All tools are registered with the MCP SDK and exposed for agent invocation.

**Tool Namespace**: `todo_tasks`

---

## Tool: add_task

**Purpose**: Create a new task for a user

### Schema

```json
{
  "name": "add_task",
  "description": "Create a new task for the user. Returns the created task with its ID.",
  "parameters": {
    "type": "object",
    "properties": {
      "user_id": {
        "type": "string",
        "description": "ID of the user creating the task"
      },
      "title": {
        "type": "string",
        "description": "Task title (1-255 characters)",
        "minLength": 1,
        "maxLength": 255
      },
      "description": {
        "type": "string",
        "description": "Optional task description",
        "maxLength": 1000
      },
      "priority": {
        "type": "string",
        "enum": ["Low", "Medium", "High"],
        "description": "Priority level (default: Medium)"
      },
      "due_date": {
        "type": "string",
        "description": "Due date in YYYY-MM-DD format"
      }
    },
    "required": ["user_id", "title"]
  }
}
```

### Success Response

```json
{
  "success": true,
  "data": {
    "id": 123,
    "user_id": "user-abc-123",
    "title": "Buy groceries",
    "description": "Milk, eggs, bread",
    "completed": false,
    "priority": "Medium",
    "due_date": "2025-01-30",
    "created_at": "2025-01-25T10:30:00Z",
    "updated_at": "2025-01-25T10:30:00Z"
  }
}
```

### Error Responses

**Invalid title**:
```json
{
  "success": false,
  "error": {
    "code": "invalid_input",
    "message": "Title cannot be empty",
    "details": {"field": "title"}
  }
}
```

**Invalid priority**:
```json
{
  "success": false,
  "error": {
    "code": "invalid_priority",
    "message": "Priority must be one of: Low, Medium, High",
    "details": {"field": "priority", "value": "Urgent"}
  }
}
```

---

## Tool: list_tasks

**Purpose**: Retrieve all tasks for a user

### Schema

```json
{
  "name": "list_tasks",
  "description": "List all tasks for the user, ordered by creation time (newest first)",
  "parameters": {
    "type": "object",
    "properties": {
      "user_id": {
        "type": "string",
        "description": "ID of the user whose tasks to list"
      }
    },
    "required": ["user_id"]
  }
}
```

### Success Response

```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "id": 123,
        "title": "Buy groceries",
        "description": "Milk, eggs, bread",
        "completed": false,
        "priority": "Medium",
        "due_date": "2025-01-30",
        "created_at": "2025-01-25T10:30:00Z",
        "updated_at": "2025-01-25T10:30:00Z"
      },
      {
        "id": 122,
        "title": "Call dentist",
        "description": null,
        "completed": true,
        "priority": "High",
        "due_date": null,
        "created_at": "2025-01-24T09:00:00Z",
        "updated_at": "2025-01-25T08:00:00Z"
      }
    ],
    "total": 2
  }
}
```

### Empty List Response

```json
{
  "success": true,
  "data": {
    "tasks": [],
    "total": 0
  }
}
```

---

## Tool: complete_task

**Purpose**: Mark a task as completed

### Schema

```json
{
  "name": "complete_task",
  "description": "Mark a task as completed. Idempotent - completing an already-completed task succeeds.",
  "parameters": {
    "type": "object",
    "properties": {
      "task_id": {
        "type": "string",
        "description": "ID of the task to complete"
      },
      "user_id": {
        "type": "string",
        "description": "ID of the user (for ownership verification)"
      }
    },
    "required": ["task_id", "user_id"]
  }
}
```

### Success Response

```json
{
  "success": true,
  "data": {
    "id": 123,
    "title": "Buy groceries",
    "completed": true,
    "updated_at": "2025-01-25T14:00:00Z"
  }
}
```

### Error Response (Not Found)

```json
{
  "success": false,
  "error": {
    "code": "not_found",
    "message": "Task not found",
    "details": {"task_id": "999"}
  }
}
```

---

## Tool: delete_task

**Purpose**: Permanently remove a task

### Schema

```json
{
  "name": "delete_task",
  "description": "Permanently delete a task. Cannot be undone.",
  "parameters": {
    "type": "object",
    "properties": {
      "task_id": {
        "type": "string",
        "description": "ID of the task to delete"
      },
      "user_id": {
        "type": "string",
        "description": "ID of the user (for ownership verification)"
      }
    },
    "required": ["task_id", "user_id"]
  }
}
```

### Success Response

```json
{
  "success": true,
  "data": {
    "deleted": true,
    "task_id": "123"
  }
}
```

### Error Response (Not Found)

```json
{
  "success": false,
  "error": {
    "code": "not_found",
    "message": "Task not found",
    "details": {"task_id": "999"}
  }
}
```

---

## Tool: update_task

**Purpose**: Modify task attributes

### Schema

```json
{
  "name": "update_task",
  "description": "Update task attributes. Only provided fields are modified.",
  "parameters": {
    "type": "object",
    "properties": {
      "task_id": {
        "type": "string",
        "description": "ID of the task to update"
      },
      "user_id": {
        "type": "string",
        "description": "ID of the user (for ownership verification)"
      },
      "title": {
        "type": "string",
        "description": "New title (1-255 characters)",
        "minLength": 1,
        "maxLength": 255
      },
      "description": {
        "type": "string",
        "description": "New description",
        "maxLength": 1000
      },
      "priority": {
        "type": "string",
        "enum": ["Low", "Medium", "High"],
        "description": "New priority level"
      },
      "due_date": {
        "type": "string",
        "description": "New due date in YYYY-MM-DD format"
      },
      "completed": {
        "type": "boolean",
        "description": "New completion status"
      }
    },
    "required": ["task_id", "user_id"]
  }
}
```

### Success Response

```json
{
  "success": true,
  "data": {
    "id": 123,
    "user_id": "user-abc-123",
    "title": "Buy groceries and snacks",
    "description": "Milk, eggs, bread, chips",
    "completed": false,
    "priority": "High",
    "due_date": "2025-01-30",
    "created_at": "2025-01-25T10:30:00Z",
    "updated_at": "2025-01-25T15:00:00Z"
  }
}
```

### Error Response (No Fields)

```json
{
  "success": false,
  "error": {
    "code": "invalid_input",
    "message": "At least one field must be provided for update",
    "details": {}
  }
}
```

---

## Error Code Reference

| Code | HTTP Equiv | When Returned |
|------|------------|---------------|
| `invalid_input` | 400 | Required field missing, empty title, no update fields |
| `invalid_priority` | 400 | Priority not in [Low, Medium, High] |
| `invalid_date` | 400 | Date not in YYYY-MM-DD format |
| `not_found` | 404 | Task doesn't exist or belongs to different user |
| `processing_error` | 500 | Database connection failure, unexpected error |

---

## OpenAI Agents SDK Compatibility

All tool schemas are compatible with OpenAI function calling format. The agent layer can import these definitions directly for use with `openai.ChatCompletion.create(tools=[...])`.

**Function Calling Pattern**:
1. Agent receives user message
2. Agent decides which tool to call
3. Agent invokes tool with parameters
4. Tool returns ToolResponse
5. Agent formats response for user

---

## Versioning

**Current Version**: 1.0.0

Tool contracts follow semantic versioning:
- MAJOR: Breaking changes to parameters or response format
- MINOR: New optional parameters or response fields
- PATCH: Bug fixes, documentation updates

Changes to tool contracts require spec update and version bump.
