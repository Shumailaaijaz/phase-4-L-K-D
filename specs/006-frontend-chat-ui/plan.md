# Implementation Plan: Frontend Chat UI

**Feature Branch**: `006-frontend-chat-ui`
**Created**: 2026-01-27
**Status**: Ready for Implementation
**Dependencies**: Spec-003 (Chat API), Spec-004 (MCP Tools), Spec-005 (Agent Loop)

---

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| 3.1 User Isolation | ✅ PASS | All API calls include user_id in path, verified by backend |
| 3.2 Stateless Server | ✅ PASS | Frontend is stateless, reconstructs from API responses |
| 3.3 No Silent Failures | ✅ PASS | All errors displayed inline with retry options |
| 3.4 Auth Boundary | ✅ PASS | JWT passed in all requests, backend verifies |
| 3.5 Natural Language First | ✅ PASS | No IDs or technical syntax exposed to users |

---

## Technical Context

| Aspect | Decision | Source |
|--------|----------|--------|
| Framework | Next.js 14+ App Router | Constitution Section 8 |
| UI Kit | OpenAI ChatKit | Spec input |
| State | React Context + local state | research.md |
| Styling | Tailwind CSS | Constitution Section 8 |
| Markdown | react-markdown + remark-gfm | research.md |
| API | Fetch with typed client | contracts/api-client.md |

---

## Architectural Overview

### High-Level UI Flow

```
┌─────────────────────────────────────────────────────────┐
│                     ChatPage (Container)                 │
│  ┌──────────────────┐  ┌─────────────────────────────┐  │
│  │ ConversationList │  │        MessageArea           │  │
│  │    (Sidebar)     │  │  ┌───────────────────────┐  │  │
│  │                  │  │  │     MessageList       │  │  │
│  │  [Conv 1]        │  │  │                       │  │  │
│  │  [Conv 2] ←active│  │  │  [UserBubble]         │  │  │
│  │  [Conv 3]        │  │  │  [AssistantBubble]    │  │  │
│  │                  │  │  │  [ToolBadge]          │  │  │
│  │  [+ New Chat]    │  │  │  [StreamingIndicator] │  │  │
│  │                  │  │  │                       │  │  │
│  └──────────────────┘  │  └───────────────────────┘  │  │
│                        │  ┌───────────────────────┐  │  │
│                        │  │      ChatInput        │  │  │
│                        │  └───────────────────────┘  │  │
│                        └─────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Component Tree

```
app/chat/page.tsx
└── ChatProvider (Context)
    └── ChatPage
        ├── ConversationListPanel
        │   ├── ConversationItem (×N)
        │   └── NewConversationButton
        └── MessageArea
            ├── LoadingState | ErrorState | EmptyState
            ├── MessageList
            │   └── MessageBubble (×N)
            │       ├── UserMessage | AssistantMessage
            │       ├── ToolBadge (×N, optional)
            │       └── StreamingIndicator (optional)
            └── ChatInput
                └── ErrorRetryBanner (optional)
```

---

## Component Breakdown

### 1. ChatPage (Container)

**File**: `app/chat/page.tsx`

**Responsibilities**:
- Server component for initial data fetching
- Wraps content with ChatProvider
- Handles route parameters (if any)

**Data Flow**:
```
Route → Server Component → Fetch initial conversations → Pass to Provider
```

---

### 2. ChatProvider (Context)

**File**: `components/chat/ChatProvider.tsx`

**Responsibilities**:
- Manages global chat state
- Provides actions to children
- Handles API communication

**State Shape**:
```typescript
{
  activeConversationId: string | null,
  conversationList: ConversationSummary[],
  messages: Message[],
  isLoading: boolean,
  isStreaming: boolean,
  error: string | null,
  scrollPositions: Record<string, number>
}
```

**Actions**:
- `sendMessage(content: string)`
- `selectConversation(id: string)`
- `startNewConversation()`
- `retryLastMessage()`
- `clearError()`
- `saveScrollPosition(position: number)`

---

### 3. ConversationListPanel

**File**: `components/chat/ConversationListPanel.tsx`

**Responsibilities**:
- Display list of conversations
- Highlight active conversation
- Handle conversation switching
- Show "New Chat" button

**Props**:
```typescript
{
  conversations: ConversationSummary[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNewChat: () => void;
}
```

**Responsive Behavior**:
- Desktop (lg+): Visible sidebar
- Tablet/Mobile: Collapsible drawer or bottom sheet

---

### 4. MessageList

**File**: `components/chat/MessageList.tsx`

**Responsibilities**:
- Render messages in order
- Manage scroll position
- Auto-scroll on new messages
- Restore scroll on conversation switch

**Props**:
```typescript
{
  messages: Message[];
  isStreaming: boolean;
  onScrollPositionChange: (position: number) => void;
}
```

**Scroll Behavior**:
- New message from user: Scroll to bottom
- New message from assistant: Scroll to bottom
- User scrolls up: Preserve position
- Switch conversation: Restore saved position

---

### 5. MessageBubble

**File**: `components/chat/MessageBubble.tsx`

**Responsibilities**:
- Render single message with role-specific styling
- Render Markdown content
- Display tool badges if present
- Show streaming indicator if applicable

**Variants**:

| Role | Style | Features |
|------|-------|----------|
| user | Right-aligned, primary bg | Plain text or Markdown |
| assistant | Left-aligned, secondary bg | Markdown + tool badges |

**Props**:
```typescript
{
  message: Message;
  isStreaming?: boolean;
}
```

---

### 6. ToolBadge

**File**: `components/chat/ToolBadge.tsx`

**Responsibilities**:
- Display tool action summary
- Show emoji + label
- Expandable for details (click)

**Props**:
```typescript
{
  toolCall: ToolCall;
}
```

**Display**:
```
┌─────────────────────────┐
│ ✅ Task Created         │  ← Collapsed (default)
└─────────────────────────┘

┌─────────────────────────┐
│ ✅ Task Created     ▼   │  ← Expanded
│ "Buy milk" added to list│
└─────────────────────────┘
```

---

### 7. StreamingIndicator

**File**: `components/chat/StreamingIndicator.tsx`

**Responsibilities**:
- Show "Assistant is typing..." during response
- Animate dots or cursor
- Accessible via aria-live

**Implementation**:
```typescript
// Simple animated dots
<span aria-live="polite" aria-busy="true">
  Assistant is typing
  <span className="animate-pulse">...</span>
</span>
```

---

### 8. ChatInput

**File**: `components/chat/ChatInput.tsx`

**Responsibilities**:
- Multiline textarea
- Enter to send, Shift+Enter for newline
- Disabled during streaming
- Focus management

**Props**:
```typescript
{
  onSend: (content: string) => void;
  isDisabled: boolean;
}
```

**Keyboard Handling**:
```typescript
onKeyDown={(e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleSend();
  }
}}
```

---

### 9. ErrorDisplay Components

**Files**:
- `components/chat/ErrorBanner.tsx` - Inline retry banner
- `components/chat/ErrorMessage.tsx` - Error as pseudo-message

**ErrorBanner Props**:
```typescript
{
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}
```

**Display**:
```
┌──────────────────────────────────────┐
│ ⚠️ Something went wrong.            │
│ [Try again]  [Dismiss]              │
└──────────────────────────────────────┘
```

---

### 10. Loading & Empty States

**Files**:
- `components/chat/LoadingState.tsx` - Skeleton during fetch
- `components/chat/EmptyState.tsx` - Onboarding for new chat

**EmptyState Content**:
```
👋 Welcome to Todo Assistant!

You can say things like:
• "Add a task to buy groceries"
• "What's on my list?"
• "Mark 'call mom' as done"

Type a message below to get started.
```

---

## Data Flow

### 1. Initial Page Load

```
1. Server: Fetch conversation list
2. Server: Render ChatPage with initial data
3. Client: Hydrate ChatProvider
4. Client: If active conversation, fetch messages
5. Client: Render MessageList
```

### 2. Send Message Flow

```
1. User types message, presses Enter
2. ChatInput calls onSend(content)
3. ChatProvider:
   a. Optimistically add user message to state
   b. Set isStreaming = true
   c. Call API: sendMessage(userId, content, conversationId)
4. On success:
   a. Add assistant message to state
   b. Extract tool calls, add badges
   c. Set isStreaming = false
   d. Update conversationList (move to top)
5. On error:
   a. Set error state
   b. Show retry banner
   c. Set isStreaming = false
```

### 3. Switch Conversation Flow

```
1. User clicks conversation in list
2. ConversationListPanel calls onSelect(id)
3. ChatProvider:
   a. Save current scroll position
   b. Set activeConversationId = id
   c. Set isLoading = true
   d. Call API: getConversation(userId, id)
4. On success:
   a. Set messages from response
   b. Restore scroll position for this conversation
   c. Set isLoading = false
5. On error:
   a. Set error state
   b. Set isLoading = false
```

---

## File Structure

```
frontend/
├── app/
│   └── chat/
│       ├── page.tsx           # Server component, data fetching
│       └── layout.tsx         # Chat-specific layout
├── components/
│   └── chat/
│       ├── ChatProvider.tsx   # Context provider
│       ├── ChatPage.tsx       # Main client component
│       ├── ConversationListPanel.tsx
│       ├── MessageList.tsx
│       ├── MessageBubble.tsx
│       ├── ToolBadge.tsx
│       ├── StreamingIndicator.tsx
│       ├── ChatInput.tsx
│       ├── ErrorBanner.tsx
│       ├── ErrorMessage.tsx
│       ├── LoadingState.tsx
│       ├── EmptyState.tsx
│       ├── LanguageSelector.tsx  # Language picker dropdown
│       └── index.ts           # Barrel export
├── i18n/
│   └── chat.ts                # All UI copy in en/ur/ur-RM
├── lib/
│   └── api/
│       └── chat.ts            # API client
├── types/
│   └── chat.ts                # TypeScript interfaces
└── hooks/
    ├── useChat.ts             # Hook to access ChatContext
    ├── useLanguage.ts         # Hook to access LanguageContext
    └── useScrollPosition.ts   # Scroll management hook
```

---

## Styling Strategy

### Tailwind Classes (Key Patterns)

**Message Bubbles**:
```css
/* User message */
.user-bubble: ml-auto max-w-[80%] bg-primary text-primary-foreground rounded-2xl rounded-br-sm px-4 py-2

/* Assistant message */
.assistant-bubble: mr-auto max-w-[80%] bg-muted rounded-2xl rounded-bl-sm px-4 py-2
```

**Tool Badge**:
```css
.tool-badge: inline-flex items-center gap-1 px-2 py-1 bg-secondary/50 rounded-full text-sm
```

**Input Area**:
```css
.chat-input: w-full resize-none rounded-xl border bg-background px-4 py-3 focus:ring-2
```

### Responsive Breakpoints

| Breakpoint | Behavior |
|------------|----------|
| < 768px (mobile) | Single column, conversation list in drawer |
| ≥ 768px (tablet) | Optional sidebar, can toggle |
| ≥ 1024px (desktop) | Fixed sidebar + message area |

---

## Accessibility Implementation

### ARIA Roles

| Element | Role/Attribute | Purpose |
|---------|----------------|---------|
| Message list | role="log" aria-live="polite" | Screen reader announces new messages |
| User message | role="article" aria-label="You said" | Identifies speaker |
| Assistant message | role="article" aria-label="Assistant said" | Identifies speaker |
| Streaming indicator | aria-live="polite" aria-busy="true" | Announces typing state |
| Tool badge | aria-expanded (if expandable) | Indicates expandability |
| Input | aria-label="Type a message" | Describes purpose |

### Focus Management

1. After sending message: Keep focus on input
2. After error: Focus retry button
3. After conversation switch: Focus message list (for scroll context)
4. Keyboard navigation: Tab through conversations, input, buttons

---

## Internationalization (i18n) Architecture

### Language Context

**File**: `components/chat/LanguageProvider.tsx`

```typescript
type Language = 'en' | 'ur' | 'ur-RM';

interface LanguageState {
  language: Language;
  direction: 'ltr' | 'rtl';
}

interface LanguageActions {
  setLanguage: (lang: Language) => void;
}
```

### i18n Copy Structure

**File**: `i18n/chat.ts`

All UI copy organized by category:

```typescript
// Header/Navigation
export const CHAT_UI_COPY = {
  en: { title: "Todo Assistant", subtitle: "Manage your tasks..." },
  ur: { title: "ٹوڈو اسسٹنٹ", subtitle: "..." },
  urRM: { title: "Todo Assistant", subtitle: "..." },
};

// Input
export const CHAT_INPUT_COPY = { ... };

// System states
export const CHAT_SYSTEM_COPY = { ... };

// Errors
export const CHAT_ERROR_COPY = { ... };

// Tool labels
export const TOOL_UI_COPY = { ... };
```

### Language Selector Component

**File**: `components/chat/LanguageSelector.tsx`

- Dropdown with three options: English, اردو, Roman Urdu
- On change: Updates LanguageContext, saves to localStorage
- Position: Header area of chat UI

### RTL Implementation

When `language === 'ur'`:
1. Set `dir="rtl"` on ChatPage root div
2. Tailwind classes auto-flip with `rtl:` prefix
3. Message alignment inverts (user messages go left)
4. Text alignment right for input area

```typescript
const { direction } = useLanguage();
return <div dir={direction}>{/* ... */}</div>;
```

### Hook Usage

```typescript
// In any component
const { t } = useLanguage();

// Access copy
<h1>{t(CHAT_UI_COPY).title}</h1>
<button>{t(CHAT_INPUT_COPY).send}</button>
```

### Persistence

- Language preference stored in `localStorage` key: `chat_ui_language`
- On mount: Read from localStorage, default to 'en' if not set
- On change: Write to localStorage immediately

---

## Error Handling Strategy

### Error Types & Display

| Error Type | Display Method | Recovery Action |
|------------|----------------|-----------------|
| Network error | Inline banner | "Try again" button |
| API 4xx | Inline banner | Message depends on code |
| API 5xx | Inline banner | "Try again" button |
| Conversation not found | Toast + redirect | Start new chat |
| Streaming interrupted | Preserve partial + banner | "Continue" button |

### Error Message Mapping

See `contracts/api-client.md` for full error code to message mapping.

---

## Testing Strategy

### Unit Tests

| Component | Test Cases |
|-----------|------------|
| MessageBubble | Renders user/assistant variants, Markdown, tool badges |
| ChatInput | Enter sends, Shift+Enter newlines, disabled state |
| ToolBadge | Displays label/emoji, expands on click |
| ErrorBanner | Shows message, retry/dismiss callbacks |

### Integration Tests

| Flow | Test Cases |
|------|------------|
| Send message | Optimistic update, API call, error recovery |
| Switch conversation | State update, scroll restore, loading state |
| Initial load | Fetch conversations, handle empty state |

### E2E Tests

| Scenario | Steps |
|----------|-------|
| Full chat flow | Load page → Send message → See response → Switch conversation |
| Error recovery | Disconnect network → Send fails → Retry → Success |
| Mobile responsive | Resize → Verify layout → Use drawer |

---

## Implementation Phases

### Phase 1: Core Infrastructure (P1 MVP)
1. Set up file structure
2. Create TypeScript types
3. Implement API client
4. Create ChatProvider with basic state

### Phase 2: Message Display (P1 MVP)
1. MessageList component
2. MessageBubble with role variants
3. Markdown rendering
4. Auto-scroll behavior

### Phase 3: Input & Send (P1 MVP)
1. ChatInput component
2. Send message flow
3. Optimistic updates
4. Basic error display

### Phase 4: Conversations (P1 MVP)
1. ConversationListPanel
2. Switch conversation flow
3. Scroll position preservation
4. New conversation button

### Phase 5: Tool Visibility (P1 MVP)
1. ToolBadge component
2. Tool extraction from responses
3. Expandable details

### Phase 6: Polish (P2)
1. StreamingIndicator
2. Loading states
3. Empty state onboarding
4. Error retry improvements

### Phase 7: Responsive & Accessibility (P2/P3)
1. Mobile layout
2. Conversation drawer
3. ARIA implementation
4. Keyboard navigation

### Phase 8: Internationalization (P2)
1. Create i18n/chat.ts with all UI copy
2. LanguageProvider context
3. LanguageSelector component
4. RTL support for Urdu
5. Persist language preference

### Phase 9: Testing & Validation
1. Unit tests
2. Integration tests
3. E2E tests
4. Accessibility audit

---

## Dependencies & Packages

### Required Dependencies

```json
{
  "dependencies": {
    "react-markdown": "^9.x",
    "remark-gfm": "^4.x"
  }
}
```

### Optional (if ChatKit doesn't provide)

```json
{
  "dependencies": {
    "@radix-ui/react-scroll-area": "^1.x",
    "@radix-ui/react-collapsible": "^1.x"
  }
}
```

---

## Validation Checklist

The implementation is complete when:

- [ ] Messages display correctly with role-based styling
- [ ] Markdown renders properly in assistant messages
- [ ] Tool badges appear for tool calls
- [ ] Streaming/typing indicator works during response wait
- [ ] Conversations list and switch work without reload
- [ ] Scroll position preserved per conversation
- [ ] Errors display inline with retry option
- [ ] Empty state shows onboarding message
- [ ] Mobile layout is usable
- [ ] Keyboard navigation works throughout
- [ ] UI supports EN / UR / Roman-UR language selection
- [ ] Language switch does not reload page
- [ ] Urdu renders RTL correctly
- [ ] All static UI copy is localized
- [ ] All unit tests pass
- [ ] E2E chat flow works reliably

---

## Notes for Implementation

1. **Start with types**: Define all interfaces in `types/chat.ts` first
2. **API client second**: Build `lib/api/chat.ts` with proper error handling
3. **Context third**: Get ChatProvider working with mock data
4. **Components last**: Build UI components once data flow is solid
5. **Test incrementally**: Add tests as you build, not after

---

## Related Documents

- [spec.md](./spec.md) - Feature specification
- [research.md](./research.md) - Technical research decisions
- [data-model.md](./data-model.md) - TypeScript interfaces
- [contracts/api-client.md](./contracts/api-client.md) - API client contract
