# API Contract: Chat Endpoints

**Feature**: 003-chat-api-persistence
**Date**: 2025-01-24
**Base Path**: `/api/{user_id}`

---

## Authentication

All endpoints require:
- `Authorization: Bearer <jwt_token>` header
- JWT must contain `user_id` claim
- Path `{user_id}` MUST match JWT `user_id`

### Error Responses (Auth)

| Status | Error Code | Condition |
|--------|------------|-----------|
| 401 | unauthorized | Missing or invalid JWT |
| 403 | user_id_mismatch | Path user_id ≠ JWT user_id |

---

## POST /api/{user_id}/chat

Send a message to the AI assistant and receive a response.

### Request

**Headers**:
```
Content-Type: application/json
Authorization: Bearer <jwt_token>
```

**Body**:
```json
{
  "message": "string (required, 1-10000 chars)",
  "conversation_id": "string (optional, UUID)"
}
```

### Response: 200 OK

```json
{
  "conversation_id": "uuid-string",
  "user_message_id": "uuid-string",
  "assistant_message_id": "uuid-string",
  "response": "Assistant's text response"
}
```

### Response: 400 Bad Request

```json
{
  "error": "invalid_message",
  "message": "Message cannot be empty. Please type something to send."
}
```

```json
{
  "error": "message_too_long",
  "message": "Your message is too long. Please keep it under 10,000 characters."
}
```

### Response: 404 Not Found

```json
{
  "error": "conversation_not_found",
  "message": "I couldn't find that conversation. Would you like to start a new one?"
}
```

### Response: 500 Internal Server Error

```json
{
  "error": "processing_error",
  "message": "I'm having trouble processing your request. Please try again."
}
```

### Behavior

1. If `conversation_id` is null/missing → create new conversation
2. If `conversation_id` provided → load existing (404 if not found or wrong user)
3. Persist user message to database
4. Load conversation history
5. Execute agent (interface call, implemented in Spec 3.3)
6. Persist assistant response
7. Update conversation `updated_at`
8. Return response with all IDs

---

## GET /api/{user_id}/conversations

List all conversations for the authenticated user.

### Request

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Query Parameters**:
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| limit | integer | 50 | Max conversations (1-100) |
| offset | integer | 0 | Pagination offset |

### Response: 200 OK

```json
{
  "conversations": [
    {
      "id": "uuid-string",
      "title": "Buy groceries",
      "message_count": 5,
      "created_at": "2025-01-24T10:30:00Z",
      "updated_at": "2025-01-24T11:45:00Z"
    }
  ],
  "total": 15
}
```

### Behavior

1. Filter by authenticated `user_id`
2. Order by `updated_at` DESC (most recent first)
3. Apply pagination (limit/offset)
4. Include message count for each conversation

---

## GET /api/{user_id}/conversations/{conversation_id}

Get a single conversation with all messages.

### Request

**Headers**:
```
Authorization: Bearer <jwt_token>
```

### Response: 200 OK

```json
{
  "id": "uuid-string",
  "title": "Buy groceries",
  "created_at": "2025-01-24T10:30:00Z",
  "updated_at": "2025-01-24T11:45:00Z",
  "messages": [
    {
      "id": "uuid-string",
      "role": "user",
      "content": "Add task buy groceries",
      "created_at": "2025-01-24T10:30:00Z"
    },
    {
      "id": "uuid-string",
      "role": "assistant",
      "content": "Got it! Added 'Buy groceries' to your list 🛒",
      "created_at": "2025-01-24T10:30:01Z"
    }
  ]
}
```

### Response: 404 Not Found

```json
{
  "error": "conversation_not_found",
  "message": "I couldn't find that conversation."
}
```

### Behavior

1. Verify conversation belongs to authenticated user
2. Load all messages ordered by `created_at` ASC
3. Limit to 100 most recent messages (pagination for more)

---

## DELETE /api/{user_id}/conversations/{conversation_id}

Delete a conversation and all its messages.

### Request

**Headers**:
```
Authorization: Bearer <jwt_token>
```

### Response: 200 OK

```json
{
  "deleted": true,
  "conversation_id": "uuid-string"
}
```

### Response: 404 Not Found

```json
{
  "error": "conversation_not_found",
  "message": "I couldn't find that conversation."
}
```

### Behavior

1. Verify conversation belongs to authenticated user
2. Delete conversation (cascade deletes messages)
3. Return confirmation

---

## Error Response Format (Standard)

All error responses follow this format:

```json
{
  "error": "error_code",
  "message": "User-friendly message"
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| unauthorized | 401 | Missing/invalid JWT |
| user_id_mismatch | 403 | Path user ≠ JWT user |
| invalid_message | 400 | Empty/whitespace message |
| message_too_long | 400 | Message > 10,000 chars |
| conversation_not_found | 404 | Conversation doesn't exist or wrong user |
| processing_error | 500 | Agent or database error |

---

## Rate Limiting (Future)

Not implemented in this spec. Will be added separately.

---

## CORS

Allow frontend origin with credentials for JWT cookie handling.
