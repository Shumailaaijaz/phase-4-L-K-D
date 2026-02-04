# Feature Specification: Chat API & Persistence Contract

**Feature Branch**: `003-chat-api-persistence`
**Created**: 2025-01-24
**Status**: Draft
**Input**: SPEC 3.1 — Chat API & Persistence Contract (FOUNDATION)

---

## Purpose

Define the stateless chat lifecycle and database persistence rules for the AI-powered Todo assistant. This specification establishes the foundational contract for how conversations flow through the system, how messages are persisted, and how the chat endpoint operates without server-side session state.

---

## User Scenarios & Testing

### User Story 1 - Send Chat Message (Priority: P1)

A user sends a natural language message to manage their tasks and receives an intelligent response.

**Why this priority**: This is the core interaction loop — without message sending, the chatbot has no purpose.

**Independent Test**: User can send a message like "add task buy groceries" and receive a confirmation response with the task created.

**Acceptance Scenarios**:

1. **Given** an authenticated user with no prior conversation, **When** they send "add task buy groceries", **Then** a new conversation is created, the message is persisted, and a friendly confirmation response is returned within 4 seconds.

2. **Given** an authenticated user with an existing conversation, **When** they send a follow-up message in the same conversation, **Then** the message is added to the existing conversation history and the assistant responds with context awareness.

3. **Given** an authenticated user, **When** they send an empty or whitespace-only message, **Then** a friendly error message is returned asking them to provide a valid message.

---

### User Story 2 - Resume Conversation After Restart (Priority: P1)

A user returns to an existing conversation after server restart and continues seamlessly.

**Why this priority**: Stateless persistence is a core non-negotiable — data must survive restarts.

**Independent Test**: Create conversation, restart server (simulated), send new message with same conversation_id, verify context is preserved.

**Acceptance Scenarios**:

1. **Given** an authenticated user with a previous conversation containing 5 messages, **When** the server restarts and they send a new message to that conversation, **Then** all 5 previous messages are loaded and the assistant responds with full context.

2. **Given** an authenticated user, **When** they reference a conversation_id that doesn't exist or belongs to another user, **Then** a friendly "conversation not found" error is returned.

---

### User Story 3 - View Conversation History (Priority: P2)

A user retrieves their past conversations and messages.

**Why this priority**: Enables conversation resumption and audit trail for users.

**Independent Test**: Create 3 conversations with messages, retrieve list, verify all returned with correct metadata.

**Acceptance Scenarios**:

1. **Given** an authenticated user with 3 conversations, **When** they request their conversation list, **Then** all 3 conversations are returned sorted by most recent activity, with title and message count.

2. **Given** an authenticated user with a conversation containing 10 messages, **When** they request that conversation's details, **Then** all 10 messages are returned in chronological order with timestamps.

3. **Given** an authenticated user with no conversations, **When** they request their conversation list, **Then** an empty list is returned with a friendly message.

---

### Edge Cases

- What happens when a user sends a message while another request is still processing? → Each request is independent; no race condition due to stateless design.
- What happens if the database is temporarily unavailable? → Friendly error message returned; no silent failure.
- What happens if a conversation has 1000+ messages? → Pagination or truncation applied to prevent performance issues.
- What happens if user sends extremely long message (>10,000 characters)? → Message rejected with friendly length limit error.

---

## Requirements

### Functional Requirements

#### Chat Endpoint

- **FR-001**: System MUST expose a chat endpoint at `POST /api/{user_id}/chat` that accepts a message and optional conversation_id.
- **FR-002**: System MUST verify that the authenticated user matches the `{user_id}` path parameter before processing any request.
- **FR-003**: System MUST create a new conversation if no conversation_id is provided in the request.
- **FR-004**: System MUST load complete conversation history from database when a conversation_id is provided.
- **FR-005**: System MUST persist the user's message to the database before processing with the AI agent.
- **FR-006**: System MUST persist the assistant's response to the database after generation.
- **FR-007**: System MUST return the assistant's response along with conversation metadata (conversation_id, message_ids).

#### Conversation Management

- **FR-008**: System MUST expose a list endpoint at `GET /api/{user_id}/conversations` returning all conversations for that user.
- **FR-009**: System MUST expose a detail endpoint at `GET /api/{user_id}/conversations/{conversation_id}` returning conversation with all messages.
- **FR-010**: System MUST filter all conversation and message queries by authenticated user_id (no cross-user access).

#### Stateless Guarantees

- **FR-011**: System MUST NOT store any conversation state in server memory between requests.
- **FR-012**: System MUST reconstruct full conversation context from database on each request.
- **FR-013**: System MUST survive server restarts without losing any persisted data.

#### Error Handling

- **FR-014**: System MUST return user-friendly error messages for all failure scenarios.
- **FR-015**: System MUST NOT expose technical error details, stack traces, or internal IDs in error responses.
- **FR-016**: System MUST return appropriate status codes: 200 (success), 400 (bad request), 401 (unauthorized), 403 (forbidden), 404 (not found), 500 (server error).

---

### Key Entities

#### Conversation

Represents a chat session between a user and the AI assistant.

- **id**: Unique identifier for the conversation
- **user_id**: Owner of the conversation (foreign key to user)
- **title**: Optional display title (auto-generated or user-provided)
- **created_at**: Timestamp when conversation started
- **updated_at**: Timestamp of last activity (for sorting)
- **Relationship**: Has many Messages

#### Message

Represents a single message in a conversation.

- **id**: Unique identifier for the message
- **conversation_id**: Parent conversation reference
- **user_id**: Owner of the message (denormalized for query efficiency)
- **role**: Either "user" or "assistant"
- **content**: The message text
- **tool_calls**: Optional JSON storing tool invocations made by assistant
- **tool_results**: Optional JSON storing results of tool executions
- **created_at**: Timestamp when message was created
- **Relationship**: Belongs to Conversation

---

## Request/Response Schema

### Chat Request

```
POST /api/{user_id}/chat

Request Body:
- message: string (required) - The user's natural language input
- conversation_id: string (optional) - Existing conversation to continue

Response Body (Success - 200):
- conversation_id: string - ID of the conversation (new or existing)
- user_message_id: string - ID of the persisted user message
- assistant_message_id: string - ID of the persisted assistant response
- response: string - The assistant's text response

Response Body (Error - 4xx/5xx):
- error: string - Error code (e.g., "invalid_message", "conversation_not_found")
- message: string - User-friendly error description
```

### List Conversations Request

```
GET /api/{user_id}/conversations

Query Parameters:
- limit: integer (optional, default 50) - Maximum conversations to return
- offset: integer (optional, default 0) - Pagination offset

Response Body (Success - 200):
- conversations: array of:
  - id: string
  - title: string or null
  - message_count: integer
  - created_at: ISO datetime string
  - updated_at: ISO datetime string
- total: integer - Total conversation count
```

### Get Conversation Detail Request

```
GET /api/{user_id}/conversations/{conversation_id}

Response Body (Success - 200):
- id: string
- title: string or null
- created_at: ISO datetime string
- updated_at: ISO datetime string
- messages: array of:
  - id: string
  - role: "user" | "assistant"
  - content: string
  - created_at: ISO datetime string
```

---

## Sequence Diagram (Textual)

### Chat Message Flow

```
User → Frontend: Types "add task buy groceries"
Frontend → Chat API: POST /api/{user_id}/chat { message: "add task buy groceries" }

Chat API → Auth: Verify JWT token
Auth → Chat API: user_id confirmed

Chat API → Database: Check conversation_id (if provided)
Database → Chat API: Conversation exists / Create new

Chat API → Database: INSERT user message
Database → Chat API: message_id returned

Chat API → Database: SELECT conversation history
Database → Chat API: Previous messages array

Chat API → Agent Runner: Process message with history
Agent Runner → MCP Tools: Invoke add_task tool
MCP Tools → Database: INSERT new task
Database → MCP Tools: task created
MCP Tools → Agent Runner: Tool result
Agent Runner → Chat API: Assistant response text

Chat API → Database: INSERT assistant message
Database → Chat API: assistant_message_id returned

Chat API → Database: UPDATE conversation.updated_at
Database → Chat API: Done

Chat API → Frontend: { conversation_id, response, message_ids }
Frontend → User: Display "Got it! Added 'Buy groceries' to your list 🛒"
```

### Stateless Persistence Guarantee

```
Request N arrives:
  1. Load ALL state from PostgreSQL
  2. Process request
  3. Persist ALL changes to PostgreSQL
  4. Return response
  5. Server holds ZERO state

Request N+1 arrives (could be different server instance):
  1. Load ALL state from PostgreSQL ← Same data as step 3 above
  2. Continue seamlessly
```

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: Users can send chat messages and receive responses within 4 seconds (p95 latency)
- **SC-002**: Conversations persist across server restarts with 100% data integrity
- **SC-003**: Users can resume any previous conversation with full context preservation
- **SC-004**: Zero cross-user data access possible (verified by security audit)
- **SC-005**: All error scenarios return user-friendly messages (no technical leakage)
- **SC-006**: System handles 100 concurrent chat requests without degradation
- **SC-007**: Conversation history loads in under 500ms for conversations with up to 100 messages

---

## Assumptions

1. **Authentication**: Better Auth with JWT is already implemented from Phase II; this spec assumes token verification is available.
2. **Database**: Neon PostgreSQL is provisioned and accessible via DATABASE_URL environment variable.
3. **Agent Processing**: The AI agent runner (OpenAI Agents SDK) exists as a separate component; this spec defines the persistence boundary around it.
4. **Message Limits**: Reasonable defaults applied: max message length 10,000 characters, max 1000 messages per conversation before pagination.
5. **Conversation Titles**: Auto-generated from first user message or left null; not user-editable in this scope.

---

## Out of Scope

- Real-time streaming of assistant responses (future enhancement)
- Message editing or deletion
- Conversation sharing between users
- Message search functionality
- Conversation export/import
- Rate limiting implementation (handled separately)
