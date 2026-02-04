# Tasks: Frontend Chat UI

**Input**: Design documents from `/specs/006-frontend-chat-ui/`
**Prerequisites**: plan.md (required), spec.md (required), data-model.md, contracts/api-client.md

**Tests**: Tests are NOT explicitly requested. Implementation tasks only.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1-US9)
- Include exact file paths in descriptions

## Path Conventions

- **Frontend**: `frontend/app/`, `frontend/components/`, `frontend/lib/`, `frontend/types/`, `frontend/hooks/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, types, and API client

- [x] T001 Create chat module directory structure: frontend/app/chat/, frontend/components/chat/, frontend/lib/api/, frontend/types/, frontend/hooks/
- [x] T002 [P] Create barrel export file in frontend/components/chat/index.ts
- [x] T003 Install required dependencies: react-markdown, remark-gfm via npm in frontend/

**Checkpoint**: Directory structure ready for implementation

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core types, API client, and context that ALL user stories depend on

**CRITICAL**: No user story work can begin until this phase is complete

### TypeScript Types

- [x] T004 Create Message interface in frontend/types/chat.ts with id, role, content, created_at, tool_calls fields
- [x] T005 [P] Create ToolCall interface in frontend/types/chat.ts with tool_name, status, summary, details fields
- [x] T006 [P] Create ConversationSummary interface in frontend/types/chat.ts with id, title, message_count, created_at, updated_at
- [x] T007 [P] Create ConversationDetail interface in frontend/types/chat.ts with id, title, created_at, updated_at, messages
- [x] T008 [P] Create ChatRequest and ChatResponse interfaces in frontend/types/chat.ts
- [x] T009 [P] Create ChatState and ChatActions interfaces in frontend/types/chat.ts
- [x] T010 [P] Create APIError interface and TOOL_DISPLAY_MAP constant in frontend/types/chat.ts

### API Client

- [x] T011 Create ChatAPIError class in frontend/lib/api/chat.ts with code, statusCode, userMessage fields
- [x] T012 Implement sendMessage function in frontend/lib/api/chat.ts calling POST /api/{user_id}/chat
- [x] T013 [P] Implement listConversations function in frontend/lib/api/chat.ts calling GET /api/{user_id}/conversations
- [x] T014 [P] Implement getConversation function in frontend/lib/api/chat.ts calling GET /api/{user_id}/conversations/{id}
- [x] T015 Add error mapping (HTTP status to user message) in frontend/lib/api/chat.ts
- [x] T016 Add retry logic for network and 5xx errors in frontend/lib/api/chat.ts

### Context Provider

- [x] T017 Create ChatContext with initial state in frontend/components/chat/ChatProvider.tsx
- [x] T018 Implement useChat hook in frontend/hooks/useChat.ts to access ChatContext
- [x] T019 Implement sendMessage action in ChatProvider dispatching optimistic update then API call
- [x] T020 Implement selectConversation action in ChatProvider saving scroll position and fetching messages
- [x] T021 Implement startNewConversation and clearError actions in ChatProvider
- [x] T022 Implement error handling in ChatProvider setting error state on API failures

**Checkpoint**: Foundation ready - types, API client, and context working

---

## Phase 3: User Story 1 - Send Message and View Response (Priority: P1) MVP

**Goal**: User sends message, sees response with Markdown rendered

**Independent Test**: Type "Add task buy milk", press Enter, see message appear, see typing indicator, see assistant response

### Implementation for User Story 1

- [x] T023 [US1] Create ChatPage client component shell in frontend/components/chat/ChatPage.tsx
- [x] T024 [US1] Create app/chat/page.tsx server component wrapping ChatProvider and ChatPage
- [x] T025 [US1] Create app/chat/layout.tsx with chat-specific styling
- [x] T026 [US1] Create MessageList component in frontend/components/chat/MessageList.tsx with messages prop
- [x] T027 [US1] Create MessageBubble component in frontend/components/chat/MessageBubble.tsx with role-based styling
- [x] T028 [US1] Add Markdown rendering to MessageBubble using react-markdown and remark-gfm
- [x] T029 [US1] Implement auto-scroll behavior in MessageList scrolling to bottom on new messages
- [x] T030 [US1] Create ChatInput component in frontend/components/chat/ChatInput.tsx with textarea
- [x] T031 [US1] Implement Enter to send, Shift+Enter for newline in ChatInput
- [x] T032 [US1] Connect ChatInput onSend to ChatProvider sendMessage action
- [x] T033 [US1] Create StreamingIndicator component in frontend/components/chat/StreamingIndicator.tsx
- [x] T034 [US1] Show StreamingIndicator in MessageList when isStreaming=true

**Checkpoint**: User Story 1 complete - can send messages and see responses

---

## Phase 4: User Story 2 - View Tool Actions (Priority: P1) MVP

**Goal**: Tool badges appear when assistant invokes tools, human-readable summaries

**Independent Test**: Say "Show my tasks", see "Listing Tasks" badge, see formatted list (no JSON)

### Implementation for User Story 2

- [x] T035 [US2] Create ToolBadge component in frontend/components/chat/ToolBadge.tsx with emoji + label
- [x] T036 [US2] Add expandable details to ToolBadge using useState for isExpanded
- [x] T037 [US2] Extract tool_calls from assistant messages in MessageBubble and render ToolBadge
- [x] T038 [US2] Implement tool name to display label mapping using TOOL_DISPLAY_MAP
- [x] T039 [US2] Style ToolBadge with non-intrusive design (small, inline, muted colors)

**Checkpoint**: User Story 2 complete - tool actions visible and understandable

---

## Phase 5: User Story 3 - Resume Conversation After Reload (Priority: P1) MVP

**Goal**: Conversations persist and resume from where user left off

**Independent Test**: Have conversation, reload page, see all messages, continue chatting

### Implementation for User Story 3

- [x] T040 [US3] Fetch conversation list on ChatProvider mount using listConversations
- [x] T041 [US3] Auto-select most recent conversation if exists on mount
- [x] T042 [US3] Fetch messages when activeConversationId changes using getConversation
- [x] T043 [US3] Store activeConversationId in URL query param for bookmarking
- [x] T044 [US3] Handle case when no conversations exist (new user)

**Checkpoint**: User Story 3 complete - conversations resume after reload

---

## Phase 6: User Story 4 - Handle Errors Gracefully (Priority: P2)

**Goal**: Errors shown inline with retry, UI never crashes

**Independent Test**: Disconnect network, send message, see error with retry button, click retry

### Implementation for User Story 4

- [x] T045 [US4] Create ErrorBanner component in frontend/components/chat/ErrorBanner.tsx with message, retry, dismiss
- [x] T046 [US4] Create ErrorMessage component in frontend/components/chat/ErrorMessage.tsx for error as chat bubble
- [x] T047 [US4] Show ErrorBanner in ChatPage when error state is set
- [x] T048 [US4] Implement retryLastMessage action in ChatProvider re-sending failed message
- [x] T049 [US4] Connect ErrorBanner retry button to retryLastMessage action
- [x] T050 [US4] Handle conversation fetch errors with friendly message

**Checkpoint**: User Story 4 complete - errors handled gracefully

---

## Phase 7: User Story 5 - Compose Messages Naturally (Priority: P2)

**Goal**: Comfortable input with multiline, disabled during response

**Independent Test**: Use Shift+Enter for newline, Enter sends, input disabled during streaming

### Implementation for User Story 5

- [x] T051 [US5] Add disabled state to ChatInput when isStreaming=true from context
- [x] T052 [US5] Style disabled ChatInput with visual feedback (opacity, cursor)
- [x] T053 [US5] Add auto-resize behavior to textarea in ChatInput as text grows
- [x] T054 [US5] Ensure ChatInput accepts any language (no input validation/restriction)

**Checkpoint**: User Story 5 complete - natural input experience

---

## Phase 8: User Story 6 - Navigate Multiple Conversations (Priority: P2)

**Goal**: Switch between conversations without page reload

**Independent Test**: See conversation list, click different conversation, messages load

### Implementation for User Story 6

- [x] T055 [US6] Create ConversationListPanel component in frontend/components/chat/ConversationListPanel.tsx
- [x] T056 [US6] Render list of conversations with title/preview and updated_at
- [x] T057 [US6] Highlight active conversation in list
- [x] T058 [US6] Handle onSelect callback to switch conversation via selectConversation action
- [x] T059 [US6] Create NewConversationButton in ConversationListPanel calling startNewConversation
- [x] T060 [US6] Create useScrollPosition hook in frontend/hooks/useScrollPosition.ts
- [x] T061 [US6] Implement saveScrollPosition in ChatProvider using scrollPositions map
- [x] T062 [US6] Restore scroll position on conversation switch

**Checkpoint**: User Story 6 complete - conversation navigation works

---

## Phase 9: User Story 7 - View Streaming Response (Priority: P2)

**Goal**: Responses appear incrementally token-by-token

**Independent Test**: Send message, see response word-by-word, typing indicator during stream

### Implementation for User Story 7

- [x] T063 [US7] Update API client sendMessage to handle streaming response if backend supports
- [x] T064 [US7] Create streamingBuffer state in ChatProvider for partial assistant message
- [x] T065 [US7] Append tokens to streamingBuffer as they arrive
- [x] T066 [US7] Display streamingBuffer in MessageList as temporary assistant message
- [x] T067 [US7] Commit streamingBuffer to messages on stream completion
- [x] T068 [US7] Preserve partial message if stream interrupted (set error, keep buffer)

**Checkpoint**: User Story 7 complete - streaming responses work

---

## Phase 10: User Story 8 - Use Chat on Mobile Device (Priority: P3)

**Goal**: Full functionality on mobile devices

**Independent Test**: Open on mobile, send message, switch conversations, all works

### Implementation for User Story 8

- [x] T069 [US8] Add responsive styles to ChatPage: single column on mobile (< md breakpoint)
- [x] T070 [US8] Create mobile drawer for ConversationListPanel using collapsible/sheet pattern
- [x] T071 [US8] Add hamburger menu button to toggle conversation drawer on mobile
- [x] T072 [US8] Ensure ChatInput stays visible above mobile keyboard
- [x] T073 [US8] Ensure tool badges don't overflow on narrow screens

**Checkpoint**: User Story 8 complete - mobile-friendly

---

## Phase 11: User Story 9 - Access Chat via Keyboard Only (Priority: P3)

**Goal**: Full keyboard navigation and screen reader support

**Independent Test**: Navigate with Tab/Enter only, screen reader announces messages correctly

### Implementation for User Story 9

- [x] T074 [US9] Add role="log" aria-live="polite" to MessageList in frontend/components/chat/MessageList.tsx
- [x] T075 [US9] Add role="article" aria-label to each MessageBubble indicating speaker
- [x] T076 [US9] Add aria-live="polite" aria-busy="true" to StreamingIndicator
- [x] T077 [US9] Add aria-label to ChatInput describing its purpose
- [x] T078 [US9] Ensure Tab order: ConversationList → MessageList → ChatInput
- [x] T079 [US9] Add focus management: focus input after send, focus retry after error

**Checkpoint**: User Story 9 complete - fully accessible

---

## Phase 12: User Story 10 - Select UI Language (Priority: P2)

**Goal**: User can select UI language (English, Urdu, Roman Urdu) without page reload

**Independent Test**: Click language selector, choose Urdu, all UI labels change to Urdu script, layout becomes RTL

### Implementation for User Story 10

- [x] T090 [US10] Create i18n directory and chat.ts file in frontend/i18n/chat.ts
- [x] T091 [US10] Add CHAT_UI_COPY dictionary (title, subtitle) in en/ur/ur-RM in frontend/i18n/chat.ts
- [x] T092 [P] [US10] Add CHAT_INPUT_COPY dictionary (placeholder, send, sending) in frontend/i18n/chat.ts
- [x] T093 [P] [US10] Add CHAT_SYSTEM_COPY dictionary (empty, loading) in frontend/i18n/chat.ts
- [x] T094 [P] [US10] Add CHAT_ERROR_COPY dictionary (generic, network) in frontend/i18n/chat.ts
- [x] T095 [P] [US10] Add TOOL_UI_COPY dictionary (add_task, update_task, delete_task, complete_task labels) in frontend/i18n/chat.ts
- [x] T096 [US10] Create LanguageContext and LanguageProvider in frontend/components/chat/LanguageProvider.tsx
- [x] T097 [US10] Create useLanguage hook in frontend/hooks/useLanguage.ts returning language, direction, setLanguage, t()
- [x] T098 [US10] Create LanguageSelector component in frontend/components/chat/LanguageSelector.tsx with dropdown
- [x] T099 [US10] Add language persistence to localStorage in LanguageProvider (key: chat_ui_language)
- [x] T100 [US10] Wrap ChatPage with LanguageProvider in app/chat/page.tsx
- [x] T101 [US10] Add dir={direction} attribute to ChatPage root element for RTL support
- [x] T102 [US10] Update ChatInput to use t(CHAT_INPUT_COPY) for placeholder and button text
- [x] T103 [US10] Update EmptyState to use t(CHAT_SYSTEM_COPY).empty
- [x] T104 [US10] Update StreamingIndicator to use t(CHAT_SYSTEM_COPY).loading
- [x] T105 [US10] Update ErrorBanner to use t(CHAT_ERROR_COPY) for error messages
- [x] T106 [US10] Update ToolBadge to use t(TOOL_UI_COPY) for tool action labels
- [x] T107 [US10] Add LanguageSelector to ChatPage header area
- [x] T108 [US10] Add RTL-specific Tailwind classes (rtl:) for Urdu layout adjustments
- [x] T109 [US10] Test language switch without page reload

**Checkpoint**: User Story 10 complete - UI fully localized with language selector

---

## Phase 13: Polish & Cross-Cutting Concerns

**Purpose**: Loading states, empty states, final validation

- [x] T110 [P] Create LoadingState component in frontend/components/chat/LoadingState.tsx with skeleton
- [x] T111 [P] Create EmptyState component in frontend/components/chat/EmptyState.tsx with onboarding message
- [x] T112 Show LoadingState in ChatPage while isLoading=true
- [x] T113 Show EmptyState in MessageList when messages is empty
- [x] T114 Add Tailwind responsive classes for tablet breakpoint (md)
- [x] T115 Ensure WCAG AA color contrast on all text elements
- [x] T116 Export all components from frontend/components/chat/index.ts
- [ ] T117 Manual E2E test: full chat flow (send → response → tool badge → switch conversation)
- [ ] T118 Manual E2E test: error recovery (disconnect → retry → success)
- [ ] T119 Manual E2E test: mobile responsive (resize → layout correct)
- [ ] T120 Manual E2E test: language switch (change to Urdu → RTL correct → back to English)

**Checkpoint**: Implementation complete and validated

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies - can start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 - BLOCKS all user stories
- **Phases 3-11 (User Stories)**: All depend on Phase 2 completion
  - US1, US2, US3 are P1/MVP - complete first
  - US4-US7 are P2 - complete after MVP
  - US8-US9 are P3 - complete last
- **Phase 12 (US10 - i18n)**: Best after core UI complete, updates all components
- **Phase 13 (Polish)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (Send/Response)**: Foundation only - no dependencies on other stories
- **US2 (Tool Badges)**: Foundation only - can parallel with US1
- **US3 (Resume)**: Foundation only - can parallel with US1/US2
- **US4 (Errors)**: Best after US1 (needs send flow)
- **US5 (Input)**: Best after US1 (needs ChatInput)
- **US6 (Navigation)**: Best after US3 (needs conversation list)
- **US7 (Streaming)**: Best after US1 (needs message flow)
- **US8 (Mobile)**: After core UI complete (US1-US6)
- **US9 (Accessibility)**: After core UI complete (US1-US6)
- **US10 (i18n)**: After core UI complete - updates all components with i18n

### Within Each User Story

- Create component file first
- Add functionality incrementally
- Connect to context/actions last
- Integration after core implementation

### Parallel Opportunities

**Phase 1**: T002, T003 can run in parallel

**Phase 2**: T005-T010 (types) can run in parallel, T013-T014 (API functions) can run in parallel

**User Stories**: Once Phase 2 completes:
- US1, US2, US3 can start in parallel (no dependencies between them)
- US4, US5 can parallel after US1 starts
- US6 can parallel after US3 starts
- US7 can parallel after US1 starts
- US8, US9 should follow core stories

---

## Parallel Example: Phase 2 Types

```text
# Launch all type definitions together:
Task: "Create Message interface in frontend/types/chat.ts"
Task: "Create ToolCall interface in frontend/types/chat.ts"
Task: "Create ConversationSummary interface in frontend/types/chat.ts"
Task: "Create ConversationDetail interface in frontend/types/chat.ts"
Task: "Create ChatRequest and ChatResponse interfaces in frontend/types/chat.ts"
Task: "Create ChatState and ChatActions interfaces in frontend/types/chat.ts"
```

---

## Implementation Strategy

### MVP First (User Stories 1-3)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Send/Response)
4. Complete Phase 4: User Story 2 (Tool Badges)
5. Complete Phase 5: User Story 3 (Resume)
6. **STOP and VALIDATE**: Test MVP independently
7. Deploy/demo if ready - users can chat and see responses

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 → Test independently → Basic chat works
3. Add US2 → Test independently → Tool badges visible
4. Add US3 → Test independently → Conversations persist (MVP COMPLETE)
5. Add US4-US7 → Test independently → Polish features
6. Add US8-US9 → Test independently → Accessibility and mobile

---

## Summary

| Category | Count |
|----------|-------|
| **Total Tasks** | 120 |
| **Phase 1 (Setup)** | 3 |
| **Phase 2 (Foundational)** | 19 |
| **US1 (Send/Response)** | 12 |
| **US2 (Tool Badges)** | 5 |
| **US3 (Resume)** | 5 |
| **US4 (Errors)** | 6 |
| **US5 (Input)** | 4 |
| **US6 (Navigation)** | 8 |
| **US7 (Streaming)** | 6 |
| **US8 (Mobile)** | 5 |
| **US9 (Accessibility)** | 6 |
| **US10 (i18n/Language)** | 20 |
| **Phase 13 (Polish)** | 11 |
| **Parallel Opportunities** | 30+ tasks marked [P] |
| **MVP Scope** | Phases 1-5 (US1, US2, US3) = 44 tasks |

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Exact file paths included for each task
- MVP is 44 tasks covering core chat functionality
- i18n (US10) adds 20 tasks for multi-language support
- Tests not included (not explicitly requested)
- Commit after each task or logical group
- UI language is separate from agent language (Spec-005)
