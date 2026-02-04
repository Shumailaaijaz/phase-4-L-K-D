# Research: Chat API & Persistence Contract

**Feature**: 003-chat-api-persistence
**Date**: 2025-01-24
**Status**: Complete

---

## Research Questions Resolved

### RQ-001: SQLModel UUID vs Integer Primary Keys

**Decision**: Use UUID strings for primary keys (Conversation.id, Message.id)

**Rationale**:
- UUIDs allow client-side ID generation before database insert
- Enables idempotent message creation (retry-safe)
- Better for distributed systems / horizontal scaling
- Consistent with Phase II task IDs

**Alternatives Considered**:
- Auto-increment integers: Simpler but requires round-trip for ID, not retry-safe
- ULID: Good but less tooling support than UUID

---

### RQ-002: Message Ordering Strategy

**Decision**: Order by `created_at` timestamp, use composite index `(conversation_id, created_at)`

**Rationale**:
- Chronological ordering is natural for chat
- Composite index ensures efficient ordered retrieval per conversation
- Timestamp granularity (microseconds) handles concurrent messages

**Alternatives Considered**:
- Sequence numbers: More complex, requires conversation-level locking
- Client timestamps: Unreliable, could be manipulated

---

### RQ-003: Conversation History Loading Pattern

**Decision**: Load full conversation history on each request (up to limit)

**Rationale**:
- Stateless requirement mandates no server-side caching
- Most conversations under 100 messages fit easily in memory
- Pagination at 100 messages for large conversations
- Simple implementation, no cache invalidation complexity

**Alternatives Considered**:
- Redis caching: Violates stateless principle (shared state)
- Client-side history: Increases request size, client complexity

---

### RQ-004: Tool Calls and Results Storage

**Decision**: Store as JSON text fields in Message table

**Rationale**:
- Flexible schema for varying tool call structures
- Allows reconstruction of full agent reasoning on resume
- SQLModel/PostgreSQL handles JSON natively

**Alternatives Considered**:
- Separate ToolCall table: Over-engineered for this use case
- No storage: Loses audit trail, can't debug agent behavior

---

### RQ-005: Agent Execution Interface Boundary

**Decision**: Define abstract `AgentRunner` interface in this spec; implementation in Spec 3.3

**Rationale**:
- Clear separation of concerns (persistence vs. AI logic)
- Allows this spec to be implemented and tested independently
- Interface defines: `process(messages: List[Message]) → str`

**Alternatives Considered**:
- Inline agent logic: Violates single responsibility
- No interface: Creates tight coupling, harder to test

---

### RQ-006: Error Response Format

**Decision**: Standardized error response with `error` code and `message` text

**Rationale**:
- Consistent client-side error handling
- `error` code for programmatic handling (e.g., "conversation_not_found")
- `message` for user-friendly display
- Aligns with Constitution §3.3 (no silent failures, no technical details)

**Alternatives Considered**:
- RFC 7807 Problem Details: Overkill for this scope
- HTTP status only: Insufficient context for client

---

### RQ-007: Conversation Title Generation

**Decision**: Auto-generate from first user message (first 50 chars), allow null

**Rationale**:
- Reduces user friction (no required title input)
- Provides meaningful display in conversation list
- Null allowed for empty/whitespace-only first messages

**Alternatives Considered**:
- AI-generated summary: Adds latency, complexity
- User-provided: Extra friction, often skipped

---

## Technology Best Practices Applied

### SQLModel + FastAPI

- Use `Session` dependency injection for database access
- Async not required for Neon PostgreSQL (sync is fine)
- Relationship loading via `selectinload` to avoid N+1 queries

### Alembic Migrations

- Create migration for Conversation and Message tables
- Include all indexes in migration (not auto-generated)
- Reversible migrations with explicit `downgrade()`

### Better Auth Integration

- Reuse existing JWT verification middleware from Phase II
- Extract `user_id` from token payload
- Validate path `{user_id}` matches token `user_id`

---

## Integration Points for Later Specs

| Component | This Spec (3.1) | Later Spec |
|-----------|-----------------|------------|
| Agent Runner | Interface only | 3.3 - Agent Loop |
| MCP Tools | Not included | 3.2 - MCP Tools |
| Rate Limiting | Not included | Separate spec |
| Streaming | Not included | Future enhancement |

---

## Research Complete

All technical decisions resolved. Ready for Phase 1: Design & Contracts.
