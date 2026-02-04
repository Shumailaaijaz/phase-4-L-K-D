# Data Model: Chat API & Persistence Contract

**Feature**: 003-chat-api-persistence
**Date**: 2025-01-24

---

## Entity Relationship Diagram (Textual)

```
┌──────────────────────────────────────────────────────────────┐
│                         User                                  │
│  (from Phase II - Better Auth)                               │
│  ─────────────────────────────────────────────────────────   │
│  id: string (PK)                                             │
│  email: string                                               │
│  ...                                                         │
└──────────────────────────────────────────────────────────────┘
                              │
                              │ 1:N
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                      Conversation                             │
│  ─────────────────────────────────────────────────────────   │
│  id: string (PK, UUID)                                       │
│  user_id: string (FK → User, indexed)                        │
│  title: string | null                                        │
│  created_at: datetime (default: now)                         │
│  updated_at: datetime (default: now, indexed with user_id)   │
└──────────────────────────────────────────────────────────────┘
                              │
                              │ 1:N
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                        Message                                │
│  ─────────────────────────────────────────────────────────   │
│  id: string (PK, UUID)                                       │
│  conversation_id: string (FK → Conversation, indexed)        │
│  user_id: string (indexed, denormalized for query)           │
│  role: string ("user" | "assistant")                         │
│  content: text                                               │
│  tool_calls: text | null (JSON)                              │
│  tool_results: text | null (JSON)                            │
│  created_at: datetime (indexed with conversation_id)         │
└──────────────────────────────────────────────────────────────┘
```

---

## Entity: Conversation

Represents a chat session between a user and the AI assistant.

### Fields

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | string | PK, UUID | Unique conversation identifier |
| user_id | string | NOT NULL, INDEX | Owner of conversation (user isolation) |
| title | string | NULL, max 255 | Display title (auto-generated or null) |
| created_at | datetime | NOT NULL, default NOW | Conversation start time |
| updated_at | datetime | NOT NULL, default NOW | Last activity time |

### Indexes

| Index Name | Columns | Purpose |
|------------|---------|---------|
| ix_conversations_user_id | user_id | Fast lookup by user |
| ix_conversations_user_id_updated_at | (user_id, updated_at DESC) | Sorted list of user's conversations |

### Relationships

- **User** (1:N): One user has many conversations
- **Message** (1:N): One conversation has many messages (cascade delete)

### Validation Rules

- `user_id` MUST be a valid authenticated user
- `title` truncated to 255 characters if auto-generated

---

## Entity: Message

Represents a single message in a conversation.

### Fields

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | string | PK, UUID | Unique message identifier |
| conversation_id | string | FK, NOT NULL, INDEX | Parent conversation |
| user_id | string | NOT NULL, INDEX | Owner (denormalized for queries) |
| role | string | NOT NULL | "user" or "assistant" |
| content | text | NOT NULL | Message text content |
| tool_calls | text | NULL | JSON of tool invocations |
| tool_results | text | NULL | JSON of tool results |
| created_at | datetime | NOT NULL, default NOW | Message timestamp |

### Indexes

| Index Name | Columns | Purpose |
|------------|---------|---------|
| ix_messages_conversation_id | conversation_id | Fast message lookup |
| ix_messages_conversation_id_created_at | (conversation_id, created_at ASC) | Ordered message retrieval |
| ix_messages_user_id | user_id | User isolation queries |

### Relationships

- **Conversation** (N:1): Many messages belong to one conversation

### Validation Rules

- `role` MUST be exactly "user" or "assistant"
- `content` MUST NOT be empty or whitespace-only
- `content` max length: 10,000 characters
- `tool_calls` and `tool_results` MUST be valid JSON if present

### State Transitions

Messages are immutable after creation. No update or delete operations.

---

## Foreign Key Constraints

| From | To | On Delete |
|------|----|-----------|
| Conversation.user_id | User.id | RESTRICT (user cannot be deleted with conversations) |
| Message.conversation_id | Conversation.id | CASCADE (delete messages when conversation deleted) |

---

## Query Patterns

### Pattern 1: Get User's Conversations (List)

```
SELECT id, title, message_count, created_at, updated_at
FROM conversations
WHERE user_id = :authenticated_user_id
ORDER BY updated_at DESC
LIMIT :limit OFFSET :offset
```

**Index Used**: ix_conversations_user_id_updated_at

### Pattern 2: Get Conversation with Messages

```
SELECT c.*, m.*
FROM conversations c
LEFT JOIN messages m ON m.conversation_id = c.id
WHERE c.id = :conversation_id AND c.user_id = :authenticated_user_id
ORDER BY m.created_at ASC
```

**Index Used**: ix_messages_conversation_id_created_at

### Pattern 3: Insert Message

```
INSERT INTO messages (id, conversation_id, user_id, role, content, created_at)
VALUES (:uuid, :conversation_id, :user_id, :role, :content, NOW())
```

### Pattern 4: Update Conversation Timestamp

```
UPDATE conversations
SET updated_at = NOW()
WHERE id = :conversation_id AND user_id = :user_id
```

---

## Migration Strategy

### Up Migration

1. Create `conversations` table with all columns
2. Create indexes on `conversations`
3. Create `messages` table with all columns and foreign key
4. Create indexes on `messages`

### Down Migration

1. Drop indexes on `messages`
2. Drop `messages` table
3. Drop indexes on `conversations`
4. Drop `conversations` table

---

## Notes

- All queries MUST filter by `user_id` for isolation (Constitution §3.1)
- No in-memory caching of conversations (Constitution §3.2)
- Message `user_id` is denormalized to support direct message queries without join
- Tool calls/results stored as JSON text for flexibility
