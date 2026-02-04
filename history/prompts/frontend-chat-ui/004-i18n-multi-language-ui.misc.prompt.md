---
id: 004
title: Add Multi-Language UI Copy Support
stage: misc
date: 2026-01-27
surface: agent
model: claude-opus-4-5-20251101
feature: frontend-chat-ui
branch: 006-frontend-chat-ui
user: shumailaaijaz
command: manual
labels: ["frontend", "chat-ui", "i18n", "localization", "rtl", "urdu"]
links:
  spec: specs/006-frontend-chat-ui/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/006-frontend-chat-ui/spec.md
  - specs/006-frontend-chat-ui/plan.md
  - specs/006-frontend-chat-ui/tasks.md
tests:
  - null
---

## Prompt

Multi-Language UI Copy

1. Language Strategy (UI Layer Only)

UI language is user-selectable. This is UI-only and does NOT affect agent reasoning (handled separately in Spec-005).

Supported Languages:
| Code | Language | Direction |
|------|----------|-----------|
| en | English | LTR |
| ur | Urdu (script) | RTL |
| ur-RM | Roman Urdu | LTR |

Default: English (en)

2. UI Copy Dictionaries

All static UI text sourced from centralized i18n file (frontend/i18n/chat.ts):

CHAT_UI_COPY:
- title: "AI Assistant" / "AI معاون" / "AI Madad-gaar"
- subtitle: "Manage your tasks with natural language" / "...قدرتی زبان میں اپنے کام کا نظم کریں" / "Apne kaam ko natural language mein manage karein"

CHAT_INPUT_COPY:
- placeholder: "Type a message..." / "...پیغام لکھیں" / "Message likhein..."
- sendButton: "Send" / "بھیجیں" / "Bhejein"
- sending: "Sending..." / "...بھیج رہے ہیں" / "Bhej rahe hain..."

CHAT_SYSTEM_COPY:
- emptyState: "Start a conversation to manage your tasks" / "...اپنے کام کا نظم کرنے کے لیے بات شروع کریں" / "Apne tasks manage karne ke liye baat shuru karein"
- loadingConversation: "Loading..." / "...لوڈ ہو رہا ہے" / "Load ho raha hai..."
- assistantTyping: "Assistant is typing..." / "...معاون لکھ رہا ہے" / "Madad-gaar likh raha hai..."

CHAT_ERROR_COPY:
- genericError: "Something went wrong. Please try again." / "...کچھ غلط ہو گیا۔ دوبارہ کوشش کریں" / "Kuch ghalat ho gaya. Dobara koshish karein."
- networkError: "Unable to connect. Check your connection." / "...کنیکشن نہیں ہو سکا۔ اپنا کنیکشن چیک کریں" / "Connection nahi ho saka. Apna connection check karein."
- retryButton: "Retry" / "دوبارہ کوشش" / "Dobara koshish"

TOOL_UI_COPY:
- taskCreated: "Task Created" / "ٹاسک بنا دیا گیا" / "Task ban gaya"
- taskUpdated: "Task Updated" / "ٹاسک اپڈیٹ ہو گیا" / "Task update ho gaya"
- taskDeleted: "Task Deleted" / "ٹاسک حذف ہو گیا" / "Task delete ho gaya"
- taskCompleted: "Task Completed" / "ٹاسک مکمل ہو گیا" / "Task mukammal ho gaya"
- listingTasks: "Listing Tasks" / "ٹاسک دکھا رہے ہیں" / "Tasks dikha rahe hain"

3. RTL Handling

When language is ur (Urdu script):
- Set dir="rtl" on root chat container
- Message bubbles align accordingly (user messages left, assistant right)
- Input area text aligned right
- Conversation list aligned right

For en and ur-RM: Maintain LTR layout.

4. Completion Criteria:
- [ ] i18n file created with all copy in 3 languages
- [ ] LanguageSelector component renders 3 options
- [ ] Language switch does NOT reload page
- [ ] Urdu selection triggers RTL layout
- [ ] Preference persists in localStorage

## Response snapshot

Updated spec.md, plan.md, and tasks.md with comprehensive i18n support:

**spec.md updates**:
- Added User Story 10 - Select UI Language (Priority: P2)
- Added 8 new functional requirements (FR-090 to FR-097)
- Added Multi-Language UI Support section with language strategy
- Added RTL Handling documentation
- Added UI Copy Categories section

**plan.md updates**:
- Added i18n Architecture section
- Added LanguageContext/LanguageProvider design
- Added file structure for i18n directory
- Added LanguageSelector component to component tree
- Added useLanguage hook specification

**tasks.md updates**:
- Added Phase 12: US10 - Select UI Language with 20 new tasks (T090-T109)
- Tasks cover: i18n file creation, copy dictionaries, LanguageContext, LanguageSelector, localStorage persistence, component wiring, RTL support, testing
- Identified parallel opportunities: T091-T095 (copy dictionaries)
- Updated summary: 120 total tasks (previously 89)

## Outcome

- Impact: Extended Spec-006 with complete i18n/localization support for 3 languages
- Tests: N/A (spec update, no code changes)
- Files: 3 files modified (spec.md, plan.md, tasks.md)
- Next prompts: /sp.implement to begin implementation
- Reflection: User provided detailed i18n copy in all 3 languages, directly incorporated into spec artifacts

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): Format validation PASS (all tasks have checkbox, ID, proper structure)
- Prompt variant (if applicable): Manual spec enhancement (not a slash command)
- Next experiment (smallest change to try): None needed
