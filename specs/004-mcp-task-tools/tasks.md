# Tasks: MCP Server & Task Tools

**Feature**: 004-mcp-task-tools
**Branch**: `004-mcp-task-tools`
**Date**: 2025-01-26
**Spec**: [spec.md](./spec.md)
**Plan**: [plan.md](./plan.md)

---

## Summary

32 tasks to implement the MCP Server and 5 task management tools. Tasks are ordered by dependency and grouped by phase.

---

## Task Progress

| Phase | Tasks | Status |
|-------|-------|--------|
| Phase 1: Server Setup | 4 | ✅ Complete |
| Phase 2: Tool Infrastructure | 6 | ✅ Complete |
| Phase 3: Individual Tools | 10 | ✅ Complete |
| Phase 4: Testing | 10 | ✅ Complete |
| Phase 5: Validation | 2 | ✅ Complete |
| **Total** | **32** | **✅ Complete** |

---

## Phase 1: Server Setup

- [x] **TASK-004-001**: Create MCP module directory structure
  - **Description**: Create the backend/mcp directory with subdirectories for tools, schemas, and crud. Add empty __init__.py files to each directory.
  - **Priority**: P1
  - **Time**: 15 min
  - **Dependencies**: None
  - **Acceptance Criteria**:
    - Directory backend/mcp/ exists with __init__.py
    - Directory backend/mcp/tools/ exists with __init__.py
    - Directory backend/mcp/schemas/ exists with __init__.py
    - Directory backend/mcp/crud/ exists with __init__.py
    - Directory backend/tests/mcp/ exists with __init__.py

- [x] **TASK-004-002**: Create ToolResponse and ToolError schemas
  - **Description**: Create backend/mcp/schemas/responses.py with Pydantic models for ToolError (code, message, details) and ToolResponse (success, data, error). Include factory methods ok() and fail().
  - **Priority**: P1
  - **Time**: 25 min
  - **Dependencies**: TASK-004-001
  - **Acceptance Criteria**:
    - ToolError has code (str), message (str), details (optional dict)
    - ToolResponse has success (bool), data (optional Any), error (optional ToolError)
    - ToolResponse.ok(data) returns success=True response
    - ToolResponse.fail(code, message) returns success=False response
    - Invariant: exactly one of data or error is present

- [x] **TASK-004-003**: Create TaskData response schemas
  - **Description**: Add TaskData, ListTasksData, and DeleteTaskData models to responses.py. TaskData serializes task with ISO timestamps. ListTasksData wraps tasks array with total count.
  - **Priority**: P1
  - **Time**: 20 min
  - **Dependencies**: TASK-004-002
  - **Acceptance Criteria**:
    - TaskData has all task fields with string timestamps
    - TaskData.from_task() class method converts Task model
    - ListTasksData has tasks (list) and total (int)
    - DeleteTaskData has deleted (bool) and task_id (str)

- [x] **TASK-004-004**: Create schemas module exports
  - **Description**: Update backend/mcp/schemas/__init__.py to export all response models.
  - **Priority**: P1
  - **Time**: 10 min
  - **Dependencies**: TASK-004-003
  - **Acceptance Criteria**:
    - All models importable via from backend.mcp.schemas import ...

---

## Phase 2: Tool Infrastructure

- [x] **TASK-004-005**: Create AddTaskParams schema with validators
  - **Description**: Create backend/mcp/schemas/params.py with AddTaskParams model. Include validators: user_id non-empty, title 1-255 chars non-whitespace, priority enum, due_date YYYY-MM-DD format.
  - **Priority**: P1
  - **Time**: 30 min
  - **Dependencies**: TASK-004-004
  - **Acceptance Criteria**:
    - user_id validated as non-empty string
    - title validated: min 1 char, max 255, not whitespace-only
    - priority validated: Low, Medium, High or None
    - due_date validated: YYYY-MM-DD regex pattern or None
    - ValidationError raised with descriptive messages

- [x] **TASK-004-006**: Create ListTasksParams and CompleteTaskParams schemas
  - **Description**: Add ListTasksParams (user_id only) and CompleteTaskParams (task_id, user_id) to params.py. Include validators for task_id as positive integer string.
  - **Priority**: P1
  - **Time**: 20 min
  - **Dependencies**: TASK-004-005
  - **Acceptance Criteria**:
    - ListTasksParams requires user_id (non-empty)
    - CompleteTaskParams requires task_id and user_id
    - task_id validated as positive integer string

- [x] **TASK-004-007**: Create DeleteTaskParams and UpdateTaskParams schemas
  - **Description**: Add DeleteTaskParams (task_id, user_id) and UpdateTaskParams (task_id, user_id, plus optional update fields). UpdateTaskParams includes has_update_fields() method.
  - **Priority**: P1
  - **Time**: 25 min
  - **Dependencies**: TASK-004-006
  - **Acceptance Criteria**:
    - DeleteTaskParams mirrors CompleteTaskParams
    - UpdateTaskParams has optional: title, description, priority, due_date, completed
    - has_update_fields() returns True if any update field is set
    - All validators match AddTaskParams patterns

- [x] **TASK-004-008**: Create CRUD create_task function
  - **Description**: Create backend/mcp/crud/task.py with create_task(session, user_id, params) function. Creates Task with defaults, commits, and returns refreshed instance.
  - **Priority**: P1
  - **Time**: 25 min
  - **Dependencies**: TASK-004-007
  - **Acceptance Criteria**:
    - Creates Task with user_id, title, description, priority, due_date
    - Sets completed=False, created_at=now, updated_at=now
    - Defaults priority to "Medium" if not provided
    - Commits and refreshes task before returning

- [x] **TASK-004-009**: Create CRUD read functions
  - **Description**: Add get_tasks_for_user(session, user_id) and get_task_by_id_and_user(session, task_id, user_id) to crud/task.py. Both filter by user_id.
  - **Priority**: P1
  - **Time**: 20 min
  - **Dependencies**: TASK-004-008
  - **Acceptance Criteria**:
    - get_tasks_for_user returns List[Task] ordered by created_at DESC
    - get_task_by_id_and_user returns Task or None
    - Both functions include WHERE user_id = :user_id clause

- [x] **TASK-004-010**: Create CRUD update and delete functions
  - **Description**: Add update_task(session, task, params) and delete_task(session, task) to crud/task.py. Update applies only non-None fields and sets updated_at.
  - **Priority**: P1
  - **Time**: 20 min
  - **Dependencies**: TASK-004-009
  - **Acceptance Criteria**:
    - update_task applies only provided fields from params
    - update_task sets updated_at to current timestamp
    - delete_task removes task from database
    - Both commit changes

---

## Phase 3: Individual Tools

- [x] **TASK-004-011**: Implement add_task tool
  - **Description**: Create backend/mcp/tools/add_task.py with add_task(params, get_session, user_id_int) function. Validates params, creates task via CRUD, returns TaskData.
  - **Priority**: P1
  - **Time**: 30 min
  - **Dependencies**: TASK-004-010
  - **Acceptance Criteria**:
    - Accepts dict params and validates with AddTaskParams
    - Returns ToolResponse.ok(TaskData) on success
    - Returns invalid_input error for validation failures
    - Returns invalid_priority error for bad priority
    - Returns invalid_date error for bad date format
    - Logs tool invocation start and result

- [x] **TASK-004-012**: Implement list_tasks tool
  - **Description**: Create backend/mcp/tools/list_tasks.py with list_tasks(params, get_session, user_id_int) function. Queries user's tasks and returns ListTasksData.
  - **Priority**: P1
  - **Time**: 25 min
  - **Dependencies**: TASK-004-010
  - **Acceptance Criteria**:
    - Validates params with ListTasksParams
    - Returns ToolResponse.ok(ListTasksData) with tasks and total
    - Returns empty array when user has no tasks (not error)
    - Logs tool invocation

- [x] **TASK-004-013**: Implement complete_task tool
  - **Description**: Create backend/mcp/tools/complete_task.py with complete_task(params, get_session, user_id_int) function. Marks task as completed, handles idempotency.
  - **Priority**: P1
  - **Time**: 30 min
  - **Dependencies**: TASK-004-010
  - **Acceptance Criteria**:
    - Validates params with CompleteTaskParams
    - Returns not_found if task missing or wrong user
    - Sets completed=True and updated_at on first completion
    - Returns success if already completed (idempotent)
    - Returns partial TaskData (id, title, completed, updated_at)

- [x] **TASK-004-014**: Implement delete_task tool
  - **Description**: Create backend/mcp/tools/delete_task.py with delete_task(params, get_session, user_id_int) function. Removes task from database.
  - **Priority**: P2
  - **Time**: 25 min
  - **Dependencies**: TASK-004-010
  - **Acceptance Criteria**:
    - Validates params with DeleteTaskParams
    - Returns not_found if task missing or wrong user
    - Deletes task via CRUD
    - Returns DeleteTaskData(deleted=True, task_id)

- [x] **TASK-004-015**: Implement update_task tool
  - **Description**: Create backend/mcp/tools/update_task.py with update_task(params, get_session, user_id_int) function. Applies partial updates to task.
  - **Priority**: P2
  - **Time**: 35 min
  - **Dependencies**: TASK-004-010
  - **Acceptance Criteria**:
    - Validates params with UpdateTaskParams
    - Returns invalid_input if no update fields provided
    - Returns not_found if task missing or wrong user
    - Returns invalid_priority/invalid_date for bad values
    - Returns full TaskData after update

- [x] **TASK-004-016**: Create tools module exports
  - **Description**: Update backend/mcp/tools/__init__.py to export all five tool functions.
  - **Priority**: P1
  - **Time**: 10 min
  - **Dependencies**: TASK-004-011, TASK-004-012, TASK-004-013, TASK-004-014, TASK-004-015
  - **Acceptance Criteria**:
    - All tools importable via from backend.mcp.tools import ...

- [x] **TASK-004-017**: Create MCP server with tool definitions
  - **Description**: Create backend/mcp/server.py with TOOL_DEFINITIONS list (JSON schemas matching contracts) and TOOL_HANDLERS registry. Add invoke_tool function.
  - **Priority**: P1
  - **Time**: 35 min
  - **Dependencies**: TASK-004-016
  - **Acceptance Criteria**:
    - TOOL_DEFINITIONS matches contracts/mcp-tools.md schemas
    - TOOL_HANDLERS maps tool names to functions
    - invoke_tool(name, params, get_session, user_id) calls correct handler
    - get_tool_definitions() returns all definitions

- [x] **TASK-004-018**: Create MCPToolServer class
  - **Description**: Add MCPToolServer class to server.py with session factory injection. Exposes tools property and call() method.
  - **Priority**: P1
  - **Time**: 25 min
  - **Dependencies**: TASK-004-017
  - **Acceptance Criteria**:
    - Constructor accepts session_factory callable
    - tools property returns TOOL_DEFINITIONS
    - call(name, params, user_id) invokes tool with session factory

- [x] **TASK-004-019**: Create MCP module exports
  - **Description**: Update backend/mcp/__init__.py to export tools, schemas, and MCPToolServer for agent layer consumption.
  - **Priority**: P1
  - **Time**: 15 min
  - **Dependencies**: TASK-004-018
  - **Acceptance Criteria**:
    - All tools importable from backend.mcp
    - All schemas importable from backend.mcp
    - MCPToolServer importable from backend.mcp

- [x] **TASK-004-020**: Update CRUD module exports
  - **Description**: Update backend/mcp/crud/__init__.py to export all CRUD functions.
  - **Priority**: P1
  - **Time**: 10 min
  - **Dependencies**: TASK-004-010
  - **Acceptance Criteria**:
    - All CRUD functions importable via from backend.mcp.crud import ...

---

## Phase 4: Testing

- [x] **TASK-004-021**: Create MCP test fixtures
  - **Description**: Create backend/tests/mcp/conftest.py with pytest fixtures: in-memory SQLite engine, session, get_session factory, user_a, user_b, task_for_user_a, task_for_user_b.
  - **Priority**: P1
  - **Time**: 30 min
  - **Dependencies**: TASK-004-019
  - **Acceptance Criteria**:
    - engine fixture creates SQLite in-memory with StaticPool
    - session fixture provides isolated session per test
    - get_session fixture returns callable session factory
    - User fixtures create distinct test users
    - Task fixtures create sample tasks for isolation testing

- [x] **TASK-004-022**: Test add_task success cases
  - **Description**: Create backend/tests/mcp/test_add_task.py with tests: create with required fields, create with all fields, task has correct user_id.
  - **Priority**: P1
  - **Time**: 25 min
  - **Dependencies**: TASK-004-021
  - **Acceptance Criteria**:
    - Test passes for minimal params (user_id, title)
    - Test passes for all optional params provided
    - Test verifies returned task has correct user_id
    - Test verifies default priority is Medium

- [x] **TASK-004-023**: Test add_task error cases
  - **Description**: Add tests to test_add_task.py: empty title, whitespace title, invalid priority, invalid date format.
  - **Priority**: P1
  - **Time**: 20 min
  - **Dependencies**: TASK-004-022
  - **Acceptance Criteria**:
    - Empty title returns invalid_input
    - Whitespace title returns invalid_input
    - Invalid priority returns invalid_priority
    - Invalid date returns invalid_date

- [x] **TASK-004-024**: Test list_tasks behavior
  - **Description**: Create backend/tests/mcp/test_list_tasks.py with tests: returns user tasks, empty array for no tasks, user isolation, ordered by created_at DESC.
  - **Priority**: P1
  - **Time**: 25 min
  - **Dependencies**: TASK-004-021
  - **Acceptance Criteria**:
    - Returns tasks for user with tasks
    - Returns empty array (not error) for user without tasks
    - Does not return other user's tasks
    - Tasks ordered newest first

- [x] **TASK-004-025**: Test complete_task behavior
  - **Description**: Create backend/tests/mcp/test_complete_task.py with tests: complete existing, idempotent, not_found, user isolation.
  - **Priority**: P1
  - **Time**: 25 min
  - **Dependencies**: TASK-004-021
  - **Acceptance Criteria**:
    - Completing existing task sets completed=True
    - Completing already-completed task succeeds (idempotent)
    - Non-existent task returns not_found
    - Other user's task returns not_found

- [x] **TASK-004-026**: Test delete_task behavior
  - **Description**: Create backend/tests/mcp/test_delete_task.py with tests: delete existing, not_found, user isolation.
  - **Priority**: P2
  - **Time**: 20 min
  - **Dependencies**: TASK-004-021
  - **Acceptance Criteria**:
    - Deleting existing task returns deleted=True
    - Non-existent task returns not_found
    - Other user's task returns not_found

- [x] **TASK-004-027**: Test update_task success cases
  - **Description**: Create backend/tests/mcp/test_update_task.py with tests: update single field, update multiple fields, updated_at changes.
  - **Priority**: P2
  - **Time**: 25 min
  - **Dependencies**: TASK-004-021
  - **Acceptance Criteria**:
    - Single field update preserves other fields
    - Multiple field update applies all
    - updated_at timestamp changes after update

- [x] **TASK-004-028**: Test update_task error cases
  - **Description**: Add error tests to test_update_task.py: no update fields, invalid priority, not_found, user isolation.
  - **Priority**: P2
  - **Time**: 20 min
  - **Dependencies**: TASK-004-027
  - **Acceptance Criteria**:
    - No update fields returns invalid_input
    - Invalid priority returns invalid_priority
    - Non-existent task returns not_found
    - Other user's task returns not_found

- [x] **TASK-004-029**: Test user isolation across all tools
  - **Description**: Create backend/tests/mcp/test_user_isolation.py with comprehensive cross-user tests for all five tools.
  - **Priority**: P1
  - **Time**: 30 min
  - **Dependencies**: TASK-004-021
  - **Acceptance Criteria**:
    - User A cannot list User B's tasks
    - User A cannot complete User B's tasks
    - User A cannot delete User B's tasks
    - User A cannot update User B's tasks
    - No data leakage across users

- [x] **TASK-004-030**: Add completed_task fixture for idempotency tests
  - **Description**: Add completed_task_for_user_a fixture to conftest.py for testing idempotent completion.
  - **Priority**: P1
  - **Time**: 10 min
  - **Dependencies**: TASK-004-021
  - **Acceptance Criteria**:
    - Fixture creates task with completed=True
    - Fixture can be used in complete_task idempotency test

---

## Phase 5: Validation

- [x] **TASK-004-031**: Run full MCP test suite
  - **Description**: Execute pytest backend/tests/mcp/ -v and verify all tests pass. Document any failures.
  - **Priority**: P1
  - **Time**: 20 min
  - **Dependencies**: TASK-004-022 through TASK-004-030
  - **Acceptance Criteria**:
    - All tests pass (0 failures)
    - No deprecation warnings from core code
    - Test output captured for review

- [x] **TASK-004-032**: Validate stateless behavior
  - **Description**: Review all tool implementations to confirm no module-level state, no caching, fresh sessions per call. Document findings.
  - **Priority**: P1
  - **Time**: 20 min
  - **Dependencies**: TASK-004-031
  - **Acceptance Criteria**:
    - No global variables holding task/user data
    - Each tool creates fresh session via factory
    - No @lru_cache or memoization on data
    - Restart would not affect functionality

---

## Execution Order

```
TASK-004-001 → TASK-004-002 → TASK-004-003 → TASK-004-004
                                                   ↓
TASK-004-005 → TASK-004-006 → TASK-004-007 → TASK-004-008
                                                   ↓
TASK-004-009 → TASK-004-010 → TASK-004-020
                    ↓
    ┌───────────────┼───────────────┐
    ↓               ↓               ↓
TASK-004-011  TASK-004-012  TASK-004-013
    ↓               ↓               ↓
    │               │          TASK-004-014
    │               │               ↓
    │               │          TASK-004-015
    └───────────────┴───────────────┘
                    ↓
              TASK-004-016
                    ↓
              TASK-004-017
                    ↓
              TASK-004-018
                    ↓
              TASK-004-019
                    ↓
              TASK-004-021 → TASK-004-030
                    ↓
    ┌───────────────┼───────────────┐
    ↓               ↓               ↓
TASK-004-022  TASK-004-024  TASK-004-025
    ↓               ↓               ↓
TASK-004-023  TASK-004-026  TASK-004-027
                                    ↓
                              TASK-004-028
                                    ↓
                              TASK-004-029
                                    ↓
                              TASK-004-031
                                    ↓
                              TASK-004-032
```

---

## Parallel Execution Opportunities

**After TASK-004-010**:
- TASK-004-011, TASK-004-012, TASK-004-013 can run in parallel

**After TASK-004-021**:
- TASK-004-022, TASK-004-024, TASK-004-025, TASK-004-026, TASK-004-027 can run in parallel

---

## Constitution Compliance

| Principle | Tasks Implementing |
|-----------|-------------------|
| §3.1 User Isolation | TASK-004-008, 009, 010, 011-015, 029 |
| §3.2 Stateless Server | TASK-004-017, 018, 032 |
| §3.3 No Silent Failures | TASK-004-002, 005-007, 011-015 |

---

## Ready for Implementation

Run `/sp.implement` to execute these tasks.
