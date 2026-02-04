# API Client Contract: Frontend Chat UI

**Feature**: 006-frontend-chat-ui
**Created**: 2026-01-27

## Overview

This document defines the contract for the frontend API client module that communicates with the Chat API (Spec-003).

---

## Module: `lib/api/chat.ts`

### Authentication

All requests MUST include the JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

The token is retrieved from the authentication system (Better Auth).

---

## Functions

### `sendMessage`

Send a chat message and receive assistant response.

```typescript
async function sendMessage(
  userId: string,
  message: string,
  conversationId?: string
): Promise<ChatResponse>
```

**Request**:
- Method: `POST`
- URL: `/api/${userId}/chat`
- Body: `{ message: string, conversation_id?: string }`
- Headers: `Authorization: Bearer <token>`, `Content-Type: application/json`

**Response (200)**:
```typescript
{
  conversation_id: string;
  user_message_id: string;
  assistant_message_id: string;
  response: string;
  tool_calls?: ToolCall[];
}
```

**Errors**:
- 400: Invalid message (empty or too long)
- 401: Missing or invalid token
- 403: User ID mismatch
- 404: Conversation not found
- 500: Server error

---

### `listConversations`

Get all conversations for a user.

```typescript
async function listConversations(
  userId: string,
  options?: { limit?: number; offset?: number }
): Promise<ConversationListResponse>
```

**Request**:
- Method: `GET`
- URL: `/api/${userId}/conversations?limit=${limit}&offset=${offset}`
- Headers: `Authorization: Bearer <token>`

**Response (200)**:
```typescript
{
  conversations: ConversationSummary[];
  total: number;
}
```

**Errors**:
- 401: Missing or invalid token
- 403: User ID mismatch

---

### `getConversation`

Get full conversation with all messages.

```typescript
async function getConversation(
  userId: string,
  conversationId: string
): Promise<ConversationDetail>
```

**Request**:
- Method: `GET`
- URL: `/api/${userId}/conversations/${conversationId}`
- Headers: `Authorization: Bearer <token>`

**Response (200)**:
```typescript
{
  id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
  messages: Message[];
}
```

**Errors**:
- 401: Missing or invalid token
- 403: User ID mismatch or conversation belongs to different user
- 404: Conversation not found

---

## Error Handling Contract

All API functions MUST:

1. Throw a typed `ChatAPIError` on non-2xx responses
2. Never throw raw network errors to callers
3. Transform technical errors to user-friendly messages

```typescript
class ChatAPIError extends Error {
  code: string;          // Error code from API
  statusCode: number;    // HTTP status code
  userMessage: string;   // User-friendly message
}
```

### Error Code Mapping

| HTTP Status | API Code | User Message |
|-------------|----------|--------------|
| 400 | invalid_message | "Please enter a valid message." |
| 400 | message_too_long | "Your message is too long. Please shorten it." |
| 401 | unauthorized | "Please sign in to continue." |
| 403 | forbidden | "You don't have access to this conversation." |
| 404 | conversation_not_found | "This conversation couldn't be found." |
| 500 | server_error | "Something went wrong. Please try again." |
| Network | network_error | "Couldn't connect. Please check your internet." |

---

## Retry Logic

The API client MUST implement automatic retry for:
- Network errors: Retry up to 3 times with exponential backoff (1s, 2s, 4s)
- 500 errors: Retry once after 1 second

The API client MUST NOT retry:
- 4xx errors (client errors)
- After user-initiated cancel

---

## Response Transformation

### Tool Call Extraction

Assistant responses may contain tool call information embedded in the response. The API client MUST:

1. Parse tool_calls from the response if present
2. Map tool names to display labels using TOOL_DISPLAY_MAP
3. Generate human-readable summaries

Example transformation:
```typescript
// API response tool_call
{
  tool_name: "add_task",
  parameters: { title: "Buy milk" },
  result: { success: true, task_id: "123" }
}

// Transformed for UI
{
  tool_name: "add_task",
  status: "completed",
  summary: "Task 'Buy milk' created",
  details: null
}
```

---

## Request Timeout

- Default timeout: 30 seconds
- Applies to all requests
- On timeout, throw `ChatAPIError` with code `timeout` and message "The request took too long. Please try again."

---

## Caching

- Conversation list: Cache for 30 seconds (stale-while-revalidate pattern)
- Conversation detail: Cache until new message sent
- Messages: Never cache independently (always part of conversation)

---

## Usage Example

```typescript
import { sendMessage, listConversations, getConversation } from '@/lib/api/chat';

// Send a message
try {
  const response = await sendMessage(userId, "Add task buy milk", conversationId);
  console.log(response.response); // "Got it! Added 'Buy milk' to your list 🛒"
} catch (error) {
  if (error instanceof ChatAPIError) {
    showError(error.userMessage);
  }
}

// List conversations
const { conversations, total } = await listConversations(userId, { limit: 20 });

// Get conversation details
const conversation = await getConversation(userId, conversationId);
```
