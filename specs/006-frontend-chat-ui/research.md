# Research: Frontend Chat UI

**Feature**: 006-frontend-chat-ui
**Created**: 2026-01-27

## Research Summary

All unknowns have been resolved. The user provided comprehensive architecture details in the `/sp.plan` command input.

---

## Decision 1: Frontend Framework

**Decision**: Next.js (App Router) with React Server Components where applicable

**Rationale**:
- Already established in constitution (Section 8) as sacred dependency
- App Router provides modern React patterns, server components for initial data fetching
- Consistent with existing Phase II frontend

**Alternatives Considered**:
- Plain React SPA - Rejected: No SSR, harder SEO (if needed), no RSC
- Remix - Rejected: Not in constitution, would require amendment

---

## Decision 2: UI Kit / Component Library

**Decision**: OpenAI ChatKit

**Rationale**:
- User specified in spec and plan input
- Purpose-built for chat interfaces
- Handles common chat patterns (message bubbles, streaming, etc.)

**Alternatives Considered**:
- Custom components - Rejected: More work, ChatKit is already purpose-built
- shadcn/ui chat components - Partial: May supplement ChatKit for non-chat UI

---

## Decision 3: State Management Strategy

**Decision**: React local state + Context for conversation state

**Rationale**:
- Stateless frontend per spec (NFR-001)
- No need for Redux/Zustand complexity
- State is reconstructed from API responses
- Context sufficient for sharing conversation state across components

**State Structure**:
```typescript
interface ChatState {
  activeConversationId: string | null;
  conversationList: ConversationSummary[];
  messages: Message[];
  isLoading: boolean;
  isStreaming: boolean;
  error: string | null;
}
```

**Alternatives Considered**:
- Redux - Rejected: Overkill for this use case
- Zustand - Acceptable but not required
- TanStack Query - Good for data fetching, may use for conversations list

---

## Decision 4: Streaming Implementation

**Decision**: Fetch API with ReadableStream / EventSource

**Rationale**:
- Backend (Spec-003) notes streaming as future enhancement but currently out of scope
- Frontend should be ready for streaming when backend supports it
- Fetch + ReadableStream is native browser API, no dependencies

**Implementation Approach**:
- Use standard POST initially (non-streaming per Spec-003)
- Structure code to easily add streaming via SSE when backend supports it
- Show typing indicator during fetch wait time

**Alternatives Considered**:
- WebSocket - Rejected: More complex, not needed for request-response pattern
- Third-party streaming libraries - Rejected: Native API sufficient

---

## Decision 5: Markdown Rendering

**Decision**: react-markdown with remark-gfm

**Rationale**:
- FR-004 requires Markdown rendering
- react-markdown is lightweight, secure (no dangerouslySetInnerHTML)
- remark-gfm adds GitHub Flavored Markdown (tables, strikethrough, task lists)

**Alternatives Considered**:
- marked + DOMPurify - More setup, same result
- Custom parser - Rejected: Reinventing the wheel

---

## Decision 6: Tool Badge Display Format

**Decision**: Inline badge component within assistant messages

**Rationale**:
- FR-020 to FR-024 specify non-intrusive, human-readable tool visibility
- Badges should be part of message flow, not separate panel
- Expandable on click for details

**Badge Mapping** (from Spec-005 agent responses):
| Tool Name | Badge Text | Emoji |
|-----------|------------|-------|
| add_task | "Task Created" | ✅ |
| list_tasks | "Listing Tasks" | 📋 |
| complete_task | "Task Completed" | ✓ |
| delete_task | "Task Deleted" | 🗑️ |
| update_task | "Task Updated" | ✏️ |

---

## Decision 7: Error Display Strategy

**Decision**: Inline error messages within chat flow + toast for transient errors

**Rationale**:
- FR-050 to FR-054 require inline errors with retry
- Chat flow errors (message failed) show as pseudo-messages
- Transient errors (network blip) show as dismissible toast
- Never modal/blocking

**Alternatives Considered**:
- Error boundary only - Rejected: Too coarse, loses context
- Separate error panel - Rejected: Takes user out of chat context

---

## Decision 8: Keyboard Navigation & Accessibility

**Decision**: Native HTML semantics + ARIA labels + focus management

**Rationale**:
- FR-070 to FR-073 require full keyboard nav, screen reader support
- Use semantic HTML (button, input, article) as base
- Add aria-live regions for streaming status announcements
- Manage focus: after send, focus stays on input

**Key ARIA Roles**:
- Message list: role="log" aria-live="polite"
- Messages: role="article" with aria-label for role
- Typing indicator: aria-live="polite" aria-busy="true"
- Input: proper label association

---

## Decision 9: Responsive Breakpoints

**Decision**: Mobile-first with Tailwind defaults

**Rationale**:
- FR-080 to FR-083 require desktop/tablet/mobile support
- Tailwind's default breakpoints align with common devices
- Single-column on mobile, optional sidebar on desktop

**Breakpoints**:
- `sm` (640px): Mobile landscape
- `md` (768px): Tablet
- `lg` (1024px): Desktop - show conversation sidebar

---

## Decision 10: API Integration Pattern

**Decision**: Centralized API client module with typed responses

**Rationale**:
- Deterministic rendering from API responses (NFR-002)
- Type safety prevents bugs
- Single place to handle auth headers, error mapping

**API Client Structure**:
```typescript
// frontend/lib/api/chat.ts
export async function sendMessage(userId: string, message: string, conversationId?: string): Promise<ChatResponse>
export async function listConversations(userId: string): Promise<ConversationList>
export async function getConversation(userId: string, conversationId: string): Promise<ConversationDetail>
```

---

## Open Questions Resolved

All technical decisions have been made. No NEEDS CLARIFICATION markers remain.

---

## Dependencies Confirmed

| Dependency | Version/Source | Purpose |
|------------|----------------|---------|
| Next.js | 14+ (App Router) | Framework |
| OpenAI ChatKit | Latest | Chat components |
| react-markdown | Latest | Markdown rendering |
| remark-gfm | Latest | GFM support |
| Tailwind CSS | 3.x | Styling |

---

## Next Steps

1. Create data-model.md with TypeScript interfaces
2. Create API client contract in contracts/
3. Write plan.md with component architecture
