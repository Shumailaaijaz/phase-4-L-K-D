# Tasks: AI Agent Loop (Reasoning Layer)

**Input**: Design documents from `/specs/005-agent-loop/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, contracts/agent-interface.md

**Tests**: Tests are included to verify agent behavior per spec requirements.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1-US6)
- Include exact file paths in descriptions

## Path Conventions

- **Backend agent module**: `backend/agent/`
- **Test files**: `backend/tests/agent/`

---

## Phase 1: Setup (Agent Module Structure)

**Purpose**: Create directory structure and base configuration for agent module

- [ ] T001 Create agent module directory structure: backend/agent/, backend/agent/prompts/, backend/agent/tools/, backend/agent/handlers/, backend/agent/templates/
- [ ] T002 [P] Create backend/agent/__init__.py with module docstring
- [ ] T003 [P] Create backend/agent/prompts/__init__.py with module docstring
- [ ] T004 [P] Create backend/agent/tools/__init__.py with module docstring
- [ ] T005 [P] Create backend/agent/handlers/__init__.py with module docstring
- [ ] T005a [P] Create backend/agent/templates/__init__.py with module docstring
- [ ] T006 Create backend/tests/agent/ directory with __init__.py

**Checkpoint**: Agent module structure ready for implementation

---

## Phase 2: Foundational (Core Infrastructure)

**Purpose**: Core classes and utilities that ALL user stories depend on

**CRITICAL**: No user story work can begin until this phase is complete

### Agent Context

- [ ] T007 Create AgentContext dataclass in backend/agent/context.py with user_id, conversation_id, message_history attributes
- [ ] T008 Implement AgentContext.from_request() factory method in backend/agent/context.py
- [ ] T009 Create AgentResult dataclass in backend/agent/context.py with success, response, tool_calls, error attributes

### System Prompt

- [ ] T010 Create system prompt constant in backend/agent/prompts/system.py defining TodoAssistant identity per Constitution section 2
- [ ] T011 Add tool usage instructions to system prompt in backend/agent/prompts/system.py for add_task, list_tasks, complete_task, delete_task, update_task
- [ ] T012 Add guardrails to system prompt in backend/agent/prompts/system.py: no IDs exposed, friendly responses, confirm destructive actions

### Tool Registry

- [ ] T013 Create tool_definitions list in backend/agent/tools/registry.py converting MCP TOOL_DEFINITIONS to OpenAI function format
- [ ] T014 Create get_tools() function in backend/agent/tools/registry.py returning tool definitions for agent initialization
- [ ] T015 Create ToolCallRecord dataclass in backend/agent/tools/registry.py with tool_name, parameters, result, duration_ms

### Error Handling

- [ ] T016 Create error code mapping dictionary in backend/agent/errors.py mapping technical codes to user-friendly messages
- [ ] T017 Implement to_friendly_message(error_code, context) function in backend/agent/errors.py
- [ ] T018 Add error messages for: not_found, validation_error, database_error, timeout in backend/agent/errors.py

### Language Detection & Templates

- [ ] T019 Create detect_language(message) function in backend/agent/handlers/language.py returning "en", "ur", or "roman_ur"
- [ ] T019a Add Urdu script detection (Unicode range check) in backend/agent/handlers/language.py
- [ ] T019b Add Roman Urdu keyword detection in backend/agent/handlers/language.py
- [ ] T019c Create TASK_CREATED_TEMPLATES dict with English, Urdu, Roman Urdu variants in backend/agent/templates/confirmations.py
- [ ] T019d [P] Create TASK_LISTED_TEMPLATES dict in backend/agent/templates/confirmations.py
- [ ] T019e [P] Create TASK_COMPLETED_TEMPLATES dict in backend/agent/templates/confirmations.py
- [ ] T019f [P] Create TASK_DELETED_TEMPLATES dict in backend/agent/templates/confirmations.py
- [ ] T019g [P] Create TASK_UPDATED_TEMPLATES dict in backend/agent/templates/confirmations.py
- [ ] T019h [P] Create TASK_NOT_FOUND_TEMPLATES dict in backend/agent/templates/confirmations.py
- [ ] T019i [P] Create AMBIGUOUS_REQUEST_TEMPLATES dict in backend/agent/templates/confirmations.py
- [ ] T019j Create get_template(template_type, lang) function in backend/agent/templates/confirmations.py

### Response Formatting

- [ ] T020 Create format_task_created(task_data, lang) function in backend/agent/handlers/response.py using language templates
- [ ] T021 [P] Create format_task_list(tasks_data, lang) function in backend/agent/handlers/response.py with checkbox formatting
- [ ] T022 [P] Create format_task_completed(task_data, lang) function in backend/agent/handlers/response.py
- [ ] T023 [P] Create format_task_deleted(task_data, lang) function in backend/agent/handlers/response.py
- [ ] T024 [P] Create format_task_updated(task_data, changes, lang) function in backend/agent/handlers/response.py
- [ ] T025 Create format_error(error_code, context, lang) function in backend/agent/handlers/response.py

### Test Fixtures

- [ ] T026 Create backend/tests/agent/conftest.py with mock MCP server fixture returning predictable responses
- [ ] T027 Add mock_agent_context fixture in backend/tests/agent/conftest.py with sample user_id and conversation_id
- [ ] T028 Add sample_task_data fixture in backend/tests/agent/conftest.py with test task payloads

### Language Detection Tests

- [ ] T029 [P] Test detect_language returns "ur" for Urdu script input in backend/tests/agent/test_language.py
- [ ] T030 [P] Test detect_language returns "roman_ur" for Roman Urdu input in backend/tests/agent/test_language.py
- [ ] T031 [P] Test detect_language returns "en" for English input in backend/tests/agent/test_language.py
- [ ] T032 Test get_template returns correct language variant in backend/tests/agent/test_language.py

**Checkpoint**: Foundation ready - user story implementation can begin

---

## Phase 3: User Story 1 - Natural Language Task Creation (Priority: P1) MVP

**Goal**: User types "Add a task to buy groceries" and agent creates the task via add_task tool

**Independent Test**: Send message "Add task buy milk", verify add_task tool called with correct title, verify friendly confirmation response

### Tests for User Story 1

- [ ] T033 [P] [US1] Test agent calls add_task for "Add a task to buy milk" in backend/tests/agent/test_intent.py
- [ ] T034 [P] [US1] Test agent extracts title from "Create high priority task call mom" in backend/tests/agent/test_intent.py
- [ ] T035 [P] [US1] Test agent asks clarification for "add something" in backend/tests/agent/test_intent.py
- [ ] T036 [US1] Test add_task response formatted as friendly confirmation in backend/tests/agent/test_response.py
- [ ] T036a [US1] Test add_task response in Urdu when user input is Urdu in backend/tests/agent/test_response.py
- [ ] T036b [US1] Test add_task response in Roman Urdu when user input is Roman Urdu in backend/tests/agent/test_response.py

### Implementation for User Story 1

- [ ] T037 [US1] Create AgentRunner class skeleton in backend/agent/runner.py with __init__(session_factory, mcp_server)
- [ ] T038 [US1] Implement AgentRunner.run(context, message) async method in backend/agent/runner.py
- [ ] T039 [US1] Add language detection call at start of run() in backend/agent/runner.py
- [ ] T040 [US1] Add tool execution bridge in backend/agent/runner.py injecting user_id into tool parameters
- [ ] T041 [US1] Add max_iterations=10 guardrail in backend/agent/runner.py
- [ ] T042 [US1] Add 30-second timeout wrapper in backend/agent/runner.py
- [ ] T043 [US1] Add logging for tool invocations in backend/agent/runner.py

**Checkpoint**: User Story 1 complete - can create tasks via natural language

---

## Phase 4: User Story 2 - View Tasks via Conversation (Priority: P1)

**Goal**: User asks "What are my tasks?" and agent retrieves and formats task list

**Independent Test**: Send message "Show my tasks", verify list_tasks tool called, verify formatted list response

### Tests for User Story 2

- [ ] T044 [P] [US2] Test agent calls list_tasks for "What's on my list?" in backend/tests/agent/test_intent.py
- [ ] T045 [P] [US2] Test agent calls list_tasks for "Show me my tasks" in backend/tests/agent/test_intent.py
- [ ] T046 [US2] Test empty task list response in all 3 languages in backend/tests/agent/test_response.py
- [ ] T047 [US2] Test task list formatted with checkboxes in all 3 languages in backend/tests/agent/test_response.py

### Implementation for User Story 2

- [ ] T048 [US2] Add list_tasks tool handling in AgentRunner in backend/agent/runner.py
- [ ] T049 [US2] Update format_task_list to use language templates in backend/agent/handlers/response.py
- [ ] T050 [US2] Add empty list handling with helpful suggestion in all languages in backend/agent/handlers/response.py

**Checkpoint**: User Story 2 complete - can view tasks via natural language

---

## Phase 5: User Story 3 - Mark Task Complete (Priority: P1)

**Goal**: User says "I finished buying groceries" and agent marks the correct task complete

**Independent Test**: Create task, send "I bought the milk", verify complete_task called with correct task_id, verify confirmation

### Tests for User Story 3

- [ ] T051 [P] [US3] Test agent calls list_tasks then complete_task for "I bought the milk" in backend/tests/agent/test_intent.py
- [ ] T052 [P] [US3] Test agent asks clarification for ambiguous completion in backend/tests/agent/test_intent.py
- [ ] T053 [US3] Test task not found response in all 3 languages in backend/tests/agent/test_errors.py
- [ ] T054 [US3] Test completion confirmation format in all 3 languages in backend/tests/agent/test_response.py

### Implementation for User Story 3

- [ ] T055 [US3] Create task matching helper in backend/agent/handlers/intent.py for title similarity matching
- [ ] T056 [US3] Implement multi-step pattern: list_tasks -> identify task -> complete_task in backend/agent/runner.py
- [ ] T057 [US3] Add ambiguity detection when multiple tasks match in backend/agent/handlers/intent.py
- [ ] T058 [US3] Add clarification response generation using language templates in backend/agent/handlers/response.py

**Checkpoint**: User Story 3 complete - can complete tasks via natural language

---

## Phase 6: User Story 4 - Update Task Details (Priority: P2)

**Goal**: User wants to change task title, priority, or due date through conversation

**Independent Test**: Create task, send "Change milk task to high priority", verify update_task called, verify confirmation

### Tests for User Story 4

- [ ] T059 [P] [US4] Test agent calls update_task for "Change priority to high" in backend/tests/agent/test_intent.py
- [ ] T060 [P] [US4] Test agent extracts new title from "Rename task to X" in backend/tests/agent/test_intent.py
- [ ] T061 [US4] Test update confirmation shows what changed in all 3 languages in backend/tests/agent/test_response.py

### Implementation for User Story 4

- [ ] T062 [US4] Add update intent detection in system prompt in backend/agent/prompts/system.py
- [ ] T063 [US4] Implement update_task tool handling in backend/agent/runner.py
- [ ] T064 [US4] Add change description to update confirmation using language templates in backend/agent/handlers/response.py

**Checkpoint**: User Story 4 complete - can update tasks via natural language

---

## Phase 7: User Story 5 - Delete Task (Priority: P2)

**Goal**: User can remove a task with confirmation before deletion

**Independent Test**: Create task, send "Delete the milk task", verify confirmation prompt, send "yes delete", verify delete_task called

### Tests for User Story 5

- [ ] T065 [P] [US5] Test agent asks confirmation before delete for "Delete the milk task" in backend/tests/agent/test_intent.py
- [ ] T066 [P] [US5] Test agent calls delete_task after "yes delete" confirmation in backend/tests/agent/test_intent.py
- [ ] T067 [US5] Test delete confirmation prompt format in all 3 languages in backend/tests/agent/test_response.py
- [ ] T068 [US5] Test task not found for delete in all 3 languages in backend/tests/agent/test_errors.py

### Implementation for User Story 5

- [ ] T069 [US5] Add confirmation flow for destructive operations in backend/agent/runner.py
- [ ] T070 [US5] Create confirmation prompt generator using language templates in backend/agent/handlers/response.py
- [ ] T071 [US5] Add confirmation phrase detection ("yes delete", "haan delete", etc.) in backend/agent/handlers/intent.py
- [ ] T072 [US5] Implement delete_task tool handling after confirmation in backend/agent/runner.py

**Checkpoint**: User Story 5 complete - can delete tasks with confirmation

---

## Phase 8: User Story 6 - General Conversation (Priority: P3)

**Goal**: User sends greetings or general messages, agent responds appropriately without tools

**Independent Test**: Send "Hello", verify no tools called, verify friendly greeting response

### Tests for User Story 6

- [ ] T073 [P] [US6] Test no tool called for "Hi!" in backend/tests/agent/test_intent.py
- [ ] T074 [P] [US6] Test no tool called for "Shukriya" in backend/tests/agent/test_intent.py
- [ ] T075 [US6] Test greeting response includes help offer in all 3 languages in backend/tests/agent/test_response.py
- [ ] T076 [US6] Test "What can you do?" explains capabilities in backend/tests/agent/test_response.py

### Implementation for User Story 6

- [ ] T077 [US6] Add greeting/general conversation handling to system prompt in backend/agent/prompts/system.py
- [ ] T078 [US6] Add capability explanation to system prompt in backend/agent/prompts/system.py

**Checkpoint**: User Story 6 complete - handles general conversation gracefully

---

## Phase 9: Integration & Validation

**Purpose**: End-to-end validation and module exports

### User Isolation Tests

- [ ] T079 [P] Test user_id passed to every tool call in backend/tests/agent/test_integration.py
- [ ] T080 [P] Test user A cannot access user B tasks via agent in backend/tests/agent/test_integration.py

### Statelessness Tests

- [ ] T081 Test no state persists between run() calls in backend/tests/agent/test_integration.py
- [ ] T082 Test context is immutable in backend/tests/agent/test_integration.py

### Language Mirroring Integration Tests

- [ ] T083 [P] Test English input gets English response in backend/tests/agent/test_integration.py
- [ ] T084 [P] Test Urdu script input gets Urdu response in backend/tests/agent/test_integration.py
- [ ] T085 [P] Test Roman Urdu input gets Roman Urdu response in backend/tests/agent/test_integration.py

### Module Exports

- [ ] T086 Export AgentRunner, AgentContext, AgentResult from backend/agent/__init__.py
- [ ] T087 Export language detection and template utilities from backend/agent/__init__.py

### Final Validation

- [ ] T088 Run all agent tests and verify pass in backend/tests/agent/
- [ ] T089 Verify response format matches Constitution section 10 examples
- [ ] T090 Verify no task IDs appear in any response output
- [ ] T091 Verify language mirroring works for all operations
- [ ] T092 Document any deviations from spec in specs/005-agent-loop/notes.md

**Checkpoint**: Agent module complete and validated

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Logging, observability, documentation

- [ ] T093 [P] Add structured logging for agent decisions in backend/agent/runner.py
- [ ] T094 [P] Add request/response timing metrics in backend/agent/runner.py
- [ ] T095 Update contracts/agent-interface.md with final implementation details including language support
- [ ] T096 Create agent usage examples in specs/005-agent-loop/quickstart.md with multi-language examples

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies - can start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 - BLOCKS all user stories
- **Phases 3-8 (User Stories)**: All depend on Phase 2 completion
  - US1, US2, US3 are P1 priority - implement first
  - US4, US5 are P2 priority - implement after P1 stories
  - US6 is P3 priority - implement last
- **Phase 9 (Integration)**: Depends on all user stories
- **Phase 10 (Polish)**: Depends on Phase 9

### User Story Dependencies

- **US1 (Task Creation)**: Foundation only - no dependencies on other stories
- **US2 (View Tasks)**: Foundation only - no dependencies on other stories
- **US3 (Complete Task)**: Uses task matching from US1/US2 implementations
- **US4 (Update Task)**: Uses task matching pattern from US3
- **US5 (Delete Task)**: Uses task matching and confirmation patterns
- **US6 (General Chat)**: Foundation only - no dependencies on other stories

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- AgentRunner updates after response formatting utilities
- Integration tests after core implementation

### Parallel Opportunities

**Phase 1**: T002, T003, T004, T005 can run in parallel (different files)

**Phase 2**: T019, T020, T021, T022, T023 can run in parallel (different functions)

**User Stories**: Once Phase 2 completes:
- US1, US2, US6 can start in parallel (no dependencies between them)
- US3 should follow US1/US2 (uses their patterns)
- US4, US5 should follow US3 (uses task matching)

---

## Parallel Example: Phase 2 Language Templates

```text
# Launch all language template definitions together:
Task: "Create TASK_CREATED_TEMPLATES dict in backend/agent/templates/confirmations.py"
Task: "Create TASK_LISTED_TEMPLATES dict in backend/agent/templates/confirmations.py"
Task: "Create TASK_COMPLETED_TEMPLATES dict in backend/agent/templates/confirmations.py"
Task: "Create TASK_DELETED_TEMPLATES dict in backend/agent/templates/confirmations.py"
Task: "Create TASK_UPDATED_TEMPLATES dict in backend/agent/templates/confirmations.py"
Task: "Create TASK_NOT_FOUND_TEMPLATES dict in backend/agent/templates/confirmations.py"
Task: "Create AMBIGUOUS_REQUEST_TEMPLATES dict in backend/agent/templates/confirmations.py"
```

---

## Implementation Strategy

### MVP First (User Stories 1-3)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Create tasks)
4. Complete Phase 4: User Story 2 (View tasks)
5. Complete Phase 5: User Story 3 (Complete tasks)
6. **STOP and VALIDATE**: Test core workflow independently
7. Deploy/demo if ready - users can create, view, complete tasks

### Incremental Delivery

1. Setup + Foundational -> Foundation ready
2. Add US1 -> Test independently -> MVP with task creation
3. Add US2 -> Test independently -> Can view tasks
4. Add US3 -> Test independently -> Full core workflow
5. Add US4/US5 -> Test independently -> Full CRUD
6. Add US6 -> Test independently -> Polished experience

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- All tool invocations MUST go through MCP server (no direct DB access)
- Agent MUST NOT mutate state directly - all changes via tools
- Verify no task IDs appear in user-facing responses
- Keep system prompt under 500 tokens per Constitution section 5.2
- Language mirroring: Agent responds in same language user used (English, Urdu script, or Roman Urdu)
- Use predefined templates from backend/agent/templates/confirmations.py for all responses
- Commit after each task or logical group

---

## Summary

| Category | Count |
|----------|-------|
| **Total Tasks** | 96 |
| **Phase 1 (Setup)** | 7 |
| **Phase 2 (Foundational)** | 32 |
| - Language Detection & Templates | 11 |
| - Response Formatting | 6 |
| - Test Fixtures + Language Tests | 7 |
| **US1 (Create Task)** | 13 |
| **US2 (View Tasks)** | 7 |
| **US3 (Complete Task)** | 8 |
| **US4 (Update Task)** | 6 |
| **US5 (Delete Task)** | 8 |
| **US6 (General Chat)** | 6 |
| **Phase 9 (Integration)** | 14 |
| **Phase 10 (Polish)** | 4 |
| **Parallel Opportunities** | 30+ tasks marked [P] |
| **MVP Scope** | Phases 1-5 (US1, US2, US3) = 67 tasks |
| **Multi-Language Support** | English, Urdu script, Roman Urdu |
