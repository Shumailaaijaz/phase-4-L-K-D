// Spec-006: Frontend Chat UI Types
// All TypeScript interfaces for the chat module

// ============================================================================
// API Response Types
// ============================================================================

/**
 * Represents a tool invocation by the assistant.
 * Extracted from assistant message for display as badge.
 */
export interface ToolCall {
  /** Tool name: add_task, list_tasks, complete_task, delete_task, update_task */
  tool_name: string;
  /** Execution status */
  status: 'pending' | 'completed' | 'error';
  /** Human-readable summary (e.g., "Task 'Buy milk' created") */
  summary: string;
  /** Optional expanded details (not shown by default) */
  details?: string;
}

/**
 * A single message in a conversation.
 * Received from: GET /api/{user_id}/conversations/{conversation_id}
 */
export interface Message {
  /** Unique message identifier */
  id: string;
  /** Message author: "user" or "assistant" */
  role: 'user' | 'assistant';
  /** Message text content (may contain Markdown) */
  content: string;
  /** ISO 8601 timestamp when message was created */
  created_at: string;
  /** Optional tool calls made by assistant (parsed from API) */
  tool_calls?: ToolCall[];
}

/**
 * Summary of a conversation for list display.
 * Received from: GET /api/{user_id}/conversations
 */
export interface ConversationSummary {
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

/**
 * Full conversation with all messages.
 * Received from: GET /api/{user_id}/conversations/{conversation_id}
 */
export interface ConversationDetail {
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

/**
 * Response from list conversations endpoint.
 * Received from: GET /api/{user_id}/conversations
 */
export interface ConversationListResponse {
  /** Array of conversation summaries */
  conversations: ConversationSummary[];
  /** Total count for pagination */
  total: number;
}

/**
 * Request body for sending a chat message.
 * Sent to: POST /api/{user_id}/chat
 */
export interface ChatRequest {
  /** User's message text */
  message: string;
  /** Optional conversation ID to continue existing conversation */
  conversation_id?: string;
}

/**
 * Response from chat endpoint.
 * Received from: POST /api/{user_id}/chat
 */
export interface ChatResponse {
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

/**
 * Error response from API.
 * Received on 4xx/5xx responses.
 */
export interface APIError {
  /** Error code for programmatic handling */
  error: string;
  /** User-friendly error message */
  message: string;
}

// ============================================================================
// UI State Types
// ============================================================================

/**
 * Main chat application state.
 * Managed by ChatContext.
 */
export interface ChatState {
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
  /** Buffer for streaming response */
  streamingBuffer: string;
  /** Last failed message for retry */
  lastFailedMessage: string | null;
}

/**
 * Actions available on chat state.
 * Dispatched through ChatContext.
 */
export interface ChatActions {
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

/**
 * State for the message input component.
 */
export interface InputState {
  /** Current input text */
  value: string;
  /** Whether input is disabled (during streaming) */
  isDisabled: boolean;
}

/**
 * State for individual message display.
 */
export interface MessageDisplayState {
  /** Whether tool details are expanded */
  isToolExpanded: boolean;
  /** Animation state for new messages */
  isNew: boolean;
}

// ============================================================================
// Tool Badge Mapping
// ============================================================================

/**
 * Mapping of tool names to display properties.
 */
export const TOOL_DISPLAY_MAP: Record<string, { label: string; emoji: string }> = {
  add_task: { label: 'Task Created', emoji: '✅' },
  list_tasks: { label: 'Listing Tasks', emoji: '📋' },
  complete_task: { label: 'Task Completed', emoji: '✓' },
  delete_task: { label: 'Task Deleted', emoji: '🗑️' },
  update_task: { label: 'Task Updated', emoji: '✏️' },
};

// ============================================================================
// Language Types (i18n)
// ============================================================================

export type Language = 'en' | 'ur' | 'ur-RM';

export interface LanguageState {
  language: Language;
  direction: 'ltr' | 'rtl';
}

export interface LanguageActions {
  setLanguage: (lang: Language) => void;
}
