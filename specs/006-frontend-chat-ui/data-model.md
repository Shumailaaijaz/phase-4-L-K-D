# Data Model: Frontend Chat UI

**Feature**: 006-frontend-chat-ui
**Created**: 2026-01-27

## Overview

This document defines the TypeScript interfaces and types used by the frontend chat UI. These models represent data received from the Chat API (Spec-003) and local UI state.

---

## API Response Types

### Message

```typescript
/**
 * A single message in a conversation.
 * Received from: GET /api/{user_id}/conversations/{conversation_id}
 */
interface Message {
  /** Unique message identifier */
  id: string;

  /** Message author: "user" or "assistant" */
  role: "user" | "assistant";

  /** Message text content (may contain Markdown) */
  content: string;

  /** ISO 8601 timestamp when message was created */
  created_at: string;

  /** Optional tool calls made by assistant (parsed from API) */
  tool_calls?: ToolCall[];
}
```

### ToolCall

```typescript
/**
 * Represents a tool invocation by the assistant.
 * Extracted from assistant message for display as badge.
 */
interface ToolCall {
  /** Tool name: add_task, list_tasks, complete_task, delete_task, update_task */
  tool_name: string;

  /** Execution status */
  status: "pending" | "completed" | "error";

  /** Human-readable summary (e.g., "Task 'Buy milk' created") */
  summary: string;

  /** Optional expanded details (not shown by default) */
  details?: string;
}
```

### ConversationSummary

```typescript
/**
 * Summary of a conversation for list display.
 * Received from: GET /api/{user_id}/conversations
 */
interface ConversationSummary {
  /** Unique conversation identifier */
  id: string;

  /** Display title (auto-generated or null) */
  title: string | null;

  /** Number of messages in conversation */
  message_count: number;

  /** ISO 8601 timestamp when conversation started */
  created_at: string;

  /** ISO 8601 timestamp of last activity */
  updated_at: string;
}
```

### ConversationDetail

```typescript
/**
 * Full conversation with all messages.
 * Received from: GET /api/{user_id}/conversations/{conversation_id}
 */
interface ConversationDetail {
  /** Unique conversation identifier */
  id: string;

  /** Display title (auto-generated or null) */
  title: string | null;

  /** ISO 8601 timestamp when conversation started */
  created_at: string;

  /** ISO 8601 timestamp of last activity */
  updated_at: string;

  /** All messages in chronological order */
  messages: Message[];
}
```

### ConversationListResponse

```typescript
/**
 * Response from list conversations endpoint.
 * Received from: GET /api/{user_id}/conversations
 */
interface ConversationListResponse {
  /** Array of conversation summaries */
  conversations: ConversationSummary[];

  /** Total count for pagination */
  total: number;
}
```

### ChatRequest

```typescript
/**
 * Request body for sending a chat message.
 * Sent to: POST /api/{user_id}/chat
 */
interface ChatRequest {
  /** User's message text */
  message: string;

  /** Optional conversation ID to continue existing conversation */
  conversation_id?: string;
}
```

### ChatResponse

```typescript
/**
 * Response from chat endpoint.
 * Received from: POST /api/{user_id}/chat
 */
interface ChatResponse {
  /** Conversation ID (new or existing) */
  conversation_id: string;

  /** ID of persisted user message */
  user_message_id: string;

  /** ID of persisted assistant message */
  assistant_message_id: string;

  /** Assistant's text response */
  response: string;

  /** Optional tool calls made during response */
  tool_calls?: ToolCall[];
}
```

### APIError

```typescript
/**
 * Error response from API.
 * Received on 4xx/5xx responses.
 */
interface APIError {
  /** Error code for programmatic handling */
  error: string;

  /** User-friendly error message */
  message: string;
}
```

---

## UI State Types

### ChatState

```typescript
/**
 * Main chat application state.
 * Managed by ChatContext.
 */
interface ChatState {
  /** Currently active conversation ID, or null if new */
  activeConversationId: string | null;

  /** List of user's conversations for sidebar */
  conversationList: ConversationSummary[];

  /** Messages in the active conversation */
  messages: Message[];

  /** True while fetching conversations or messages */
  isLoading: boolean;

  /** True while waiting for assistant response */
  isStreaming: boolean;

  /** Current error message, or null */
  error: string | null;

  /** Scroll positions per conversation for restoration */
  scrollPositions: Record<string, number>;
}
```

### ChatActions

```typescript
/**
 * Actions available on chat state.
 * Dispatched through ChatContext.
 */
interface ChatActions {
  /** Send a new message */
  sendMessage: (content: string) => Promise<void>;

  /** Switch to a different conversation */
  selectConversation: (conversationId: string) => Promise<void>;

  /** Start a new conversation */
  startNewConversation: () => void;

  /** Retry last failed message */
  retryLastMessage: () => Promise<void>;

  /** Clear current error */
  clearError: () => void;

  /** Save scroll position for current conversation */
  saveScrollPosition: (position: number) => void;

  /** Refresh conversation list */
  refreshConversations: () => Promise<void>;
}
```

### InputState

```typescript
/**
 * State for the message input component.
 */
interface InputState {
  /** Current input text */
  value: string;

  /** Whether input is disabled (during streaming) */
  isDisabled: boolean;

  /** Reference to input element for focus management */
  inputRef: React.RefObject<HTMLTextAreaElement>;
}
```

### MessageDisplayState

```typescript
/**
 * State for individual message display.
 */
interface MessageDisplayState {
  /** Whether tool details are expanded */
  isToolExpanded: boolean;

  /** Animation state for new messages */
  isNew: boolean;
}
```

---

## Tool Badge Mapping

```typescript
/**
 * Mapping of tool names to display properties.
 */
const TOOL_DISPLAY_MAP: Record<string, { label: string; emoji: string }> = {
  add_task: { label: "Task Created", emoji: "✅" },
  list_tasks: { label: "Listing Tasks", emoji: "📋" },
  complete_task: { label: "Task Completed", emoji: "✓" },
  delete_task: { label: "Task Deleted", emoji: "🗑️" },
  update_task: { label: "Task Updated", emoji: "✏️" },
};
```

---

## Validation Rules

### Message Content

- Minimum length: 1 character (trimmed)
- Maximum length: 10,000 characters
- No restriction on language or character set

### Conversation ID

- Format: UUID string
- Must belong to authenticated user

---

## State Transitions

### Initial Load

```
INITIAL → LOADING → LOADED | ERROR
```

### Send Message

```
IDLE → SENDING → STREAMING → IDLE | ERROR
```

### Switch Conversation

```
IDLE → LOADING → LOADED | ERROR
```

### Error Recovery

```
ERROR → (user clicks retry) → SENDING → ...
```
