# Tasks: Chat API & Persistence Contract

**Input**: Design documents from `/specs/003-chat-api-persistence/`
**Prerequisites**: plan.md (required), spec.md (required), data-model.md, contracts/chat-api.md

---

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and models directory structure

- [x] T001 Create models directory structure in backend/models/__init__.py (existing)
- [x] T002 [P] Create schemas directory structure in backend/schemas/__init__.py (existing)
- [x] T003 [P] Create crud directory structure in backend/crud/__init__.py
- [x] T004 [P] Create services directory structure in backend/services/__init__.py

**Checkpoint**: Directory structure ready for model implementation

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Database Models

- [x] T005 [P] Create Conversation SQLModel in backend/models/conversation.py
  - Fields: id (UUID string), user_id (indexed), title (nullable), created_at, updated_at
  - Relationship: has_many Messages with cascade delete
  - Index on (user_id, updated_at) for sorted queries

- [x] T006 [P] Create Message SQLModel in backend/models/message.py
  - Fields: id (UUID), conversation_id (FK), user_id, role, content, tool_calls, tool_results, created_at
  - Validation: role in ("user", "assistant"), content max 10000 chars
  - Index on (conversation_id, created_at) for ordered retrieval

- [x] T007 Export models in backend/models/__init__.py

### Database Migration

- [x] T008 Create Alembic migration in backend/alembic/versions/003_create_conversations.py
  - Create conversations table with all columns and indexes
  - Create messages table with FK constraint and indexes
  - Include reversible downgrade() function

### Request/Response Schemas

- [x] T009 [P] Create ChatRequest schema in backend/schemas/chat.py
  - message: str (required, 1-10000 chars, not whitespace-only)
  - conversation_id: Optional[str]

- [x] T010 [P] Create ChatResponse schema in backend/schemas/chat.py
  - conversation_id, user_message_id, assistant_message_id, response

- [x] T011 [P] Create ConversationListResponse schema in backend/schemas/chat.py
  - conversations: List with id, title, message_count, created_at, updated_at
  - total: int

- [x] T012 [P] Create ConversationDetailResponse schema in backend/schemas/chat.py
  - id, title, created_at, updated_at, messages[]

- [x] T013 [P] Create ErrorResponse schema in backend/schemas/chat.py
  - error: str (code), message: str (user-friendly)

### Auth Dependency

- [x] T014 Create verify_user dependency in backend/api/deps.py
  - Verify JWT token is valid
  - Verify path {user_id} matches JWT user_id
  - Return 401 for invalid token, 403 for mismatch

### Agent Interface (Stub)

- [x] T015 Create AgentRunner protocol in backend/services/agent_interface.py
  - Define process(messages: List[dict]) → str method
  - Create StubAgentRunner that returns placeholder response
  - NOTE: Real implementation in Spec 3.3

### Error Handling

- [x] T016 [P] Create custom exceptions in backend/api/errors.py
  - ConversationNotFoundError
  - InvalidMessageError
  - MessageTooLongError

- [x] T017 [P] Create exception handlers in backend/api/errors.py
  - Return ErrorResponse format for each exception type
  - Log technical details, return friendly message

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Send Chat Message (Priority: P1) 🎯 MVP

**Goal**: User can send a natural language message and receive an AI response

**Independent Test**: Send "add task buy groceries" → receive confirmation with conversation_id

### CRUD Operations for US1

- [x] T018 [US1] Create create_conversation function in backend/crud/conversation.py
  - Parameters: user_id, title=None
  - Returns: Conversation with generated UUID
  - Auto-generate title from first 50 chars if not provided

- [x] T019 [US1] Create get_conversation function in backend/crud/conversation.py
  - Parameters: conversation_id, user_id
  - Returns: Conversation or None
  - MUST filter by user_id for isolation

- [x] T020 [US1] Create add_message function in backend/crud/conversation.py
  - Parameters: conversation_id, user_id, role, content, tool_calls=None, tool_results=None
  - Returns: Message with generated UUID
  - Validate role is "user" or "assistant"

- [x] T021 [US1] Create get_messages function in backend/crud/conversation.py
  - Parameters: conversation_id, user_id, limit=100
  - Returns: List[Message] ordered by created_at ASC
  - MUST filter by user_id for isolation

- [x] T022 [US1] Create update_conversation_timestamp function in backend/crud/conversation.py
  - Parameters: conversation_id, user_id
  - Updates: updated_at to current time

### Chat Endpoint for US1

- [x] T023 [US1] Create POST /api/{user_id}/chat endpoint in backend/api/chat.py
  - Validate auth via verify_user dependency
  - Validate request body (message not empty, length check)
  - If conversation_id provided → load or raise ConversationNotFoundError
  - If no conversation_id → create new conversation
  - Persist user message to database
  - Load conversation history
  - Call agent interface (stub)
  - Persist assistant response
  - Update conversation.updated_at
  - Return ChatResponse with all IDs

### Register Router for US1

- [x] T024 [US1] Create chat router in backend/api/chat.py
  - Define APIRouter with prefix
  - Export router for main.py inclusion

- [x] T025 [US1] Register chat router in backend/main.py
  - Include chat router
  - Register exception handlers from errors.py

**Checkpoint**: User Story 1 complete - can send messages and receive responses

---

## Phase 4: User Story 2 - Resume Conversation After Restart (Priority: P1)

**Goal**: User can continue an existing conversation after server restart

**Independent Test**: Create conversation → "restart" → send new message → verify context preserved

### CRUD Operations for US2

- [x] T026 [US2] Create get_conversation_with_messages function in backend/crud/conversation.py
  - Parameters: conversation_id, user_id
  - Returns: Conversation with messages loaded (eager)
  - MUST filter by user_id for isolation
  - Order messages by created_at ASC

### Endpoint Enhancement for US2

- [x] T027 [US2] Enhance POST /chat to load full history in backend/api/chat.py
  - When conversation_id provided, load all previous messages
  - Build complete message array for agent context
  - Verify stateless behavior (no caching)

**Checkpoint**: User Story 2 complete - conversations persist across restarts

---

## Phase 5: User Story 3 - View Conversation History (Priority: P2)

**Goal**: User can list conversations and view message details

**Independent Test**: Create 3 conversations → list → verify all returned sorted by updated_at

### CRUD Operations for US3

- [x] T028 [US3] Create list_conversations function in backend/crud/conversation.py
  - Parameters: user_id, limit=50, offset=0
  - Returns: List[Conversation] ordered by updated_at DESC
  - Include message_count for each conversation
  - MUST filter by user_id for isolation

- [x] T029 [US3] Create delete_conversation function in backend/crud/conversation.py
  - Parameters: conversation_id, user_id
  - Returns: bool (True if deleted)
  - Cascade deletes all messages
  - MUST verify user_id ownership before delete

### Endpoints for US3

- [x] T030 [US3] Create GET /api/{user_id}/conversations endpoint in backend/api/chat.py
  - Validate auth via verify_user dependency
  - Accept limit and offset query parameters
  - Return ConversationListResponse with total count

- [x] T031 [US3] Create GET /api/{user_id}/conversations/{conversation_id} endpoint in backend/api/chat.py
  - Validate auth via verify_user dependency
  - Load conversation with messages
  - Return ConversationDetailResponse or 404

- [x] T032 [US3] Create DELETE /api/{user_id}/conversations/{conversation_id} endpoint in backend/api/chat.py
  - Validate auth via verify_user dependency
  - Delete conversation (cascade messages)
  - Return success confirmation or 404

**Checkpoint**: User Story 3 complete - full conversation management

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Integration tests and final validation

### Integration Tests

- [x] T033 [P] Create test fixtures in backend/tests/integration/conftest.py
  - Test database session
  - Test client with auth mocking
  - Sample user IDs for isolation tests

- [x] T034 [P] Create chat endpoint tests in backend/tests/integration/test_chat.py
  - Test: Send message creates new conversation
  - Test: Send message to existing conversation
  - Test: Empty message returns 400
  - Test: Message too long returns 400
  - Test: Wrong user_id returns 403
  - Test: Invalid conversation_id returns 404

- [x] T035 [P] Create persistence tests in backend/tests/integration/test_persistence.py
  - Test: User A cannot see User B's conversations
  - Test: Message order preserved across sessions
  - Test: Cascade delete removes all messages
  - Test: Conversation persists after new session (stateless verification)

- [x] T036 [P] Create conversation management tests in backend/tests/integration/test_conversations.py
  - Test: List conversations returns correct data
  - Test: List conversations sorted by updated_at DESC
  - Test: Get conversation detail includes all messages
  - Test: Delete conversation removes it from list

### Final Validation

- [x] T037 Run Alembic migration and verify tables created
  - Migration file created: backend/alembic/versions/003_create_conversations.py
  - Run with: cd backend && alembic upgrade head

- [x] T038 Run full test suite and verify all tests pass
  - Test files created in backend/tests/integration/
  - Run with: cd backend && pytest tests/integration/ -v

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational - Core MVP
- **User Story 2 (Phase 4)**: Depends on US1 (builds on chat endpoint)
- **User Story 3 (Phase 5)**: Depends on Foundational only (parallel with US1/US2 possible)
- **Polish (Phase 6)**: Depends on all user stories being complete

### Task Dependencies (within phases)

```
Phase 2:
T005, T006 (parallel) → T007 → T008
T009-T013 (parallel)
T014 (standalone)
T015 (standalone)
T016, T017 (parallel)

Phase 3:
T018-T022 (sequential CRUD) → T023 → T024 → T025

Phase 4:
T026 → T027

Phase 5:
T028, T029 (parallel) → T030, T031, T032 (parallel)

Phase 6:
T033 → T034, T035, T036 (parallel) → T037 → T038
```

---

## Parallel Execution Examples

### Phase 2 Parallel Groups

```bash
# Group 1: Models (parallel)
T005: Create Conversation model
T006: Create Message model

# Group 2: Schemas (parallel)
T009: ChatRequest schema
T010: ChatResponse schema
T011: ConversationListResponse schema
T012: ConversationDetailResponse schema
T013: ErrorResponse schema

# Group 3: Infrastructure (parallel)
T014: Auth dependency
T015: Agent interface
T016: Custom exceptions
T017: Exception handlers
```

### Phase 6 Parallel Groups

```bash
# Test files (parallel after fixtures)
T034: Chat endpoint tests
T035: Persistence tests
T036: Conversation management tests
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test POST /chat independently
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → MVP!
3. Add User Story 2 → Test resume functionality
4. Add User Story 3 → Full conversation management
5. Polish phase → Production ready

---

## Summary

| Phase | Tasks | Focus |
|-------|-------|-------|
| Phase 1 | T001-T004 | Directory setup |
| Phase 2 | T005-T017 | Foundation (models, schemas, auth) |
| Phase 3 (US1) | T018-T025 | Send chat message (MVP) |
| Phase 4 (US2) | T026-T027 | Resume conversation |
| Phase 5 (US3) | T028-T032 | View history |
| Phase 6 | T033-T038 | Tests & validation |

**Total Tasks**: 38
**Parallel Opportunities**: 15 tasks can run in parallel within their phases
**MVP Scope**: Phases 1-3 (T001-T025 = 25 tasks)
