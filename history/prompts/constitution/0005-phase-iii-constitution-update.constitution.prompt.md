---
id: 0005
title: Phase III Constitution Update
stage: constitution
date: 2025-01-24
surface: agent
model: claude-opus-4-5
feature: none
branch: main
user: shumaila
command: /sp.constitution
labels: ["constitution", "phase-iii", "ai-chatbot", "governance"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
tests:
  - null
---

## Prompt

Last significant update: January 2025
Phase owner: Shumaila
Current phase goal: production-grade natural-language Todo assistant integrated via MCP + OpenAI Agents SDK

## 1. Core Identity & Tone of Voice (all agents must obey)

We are building **a kind, reliable, slightly warm but still professional personal assistant** that helps busy people manage their daily tasks.

- Speak like a thoughtful friend who really wants to help — never cold/corporate
- Always confirm dangerous actions (delete, bulk update, archive…)
- Never assume — when ambiguous → ask clarifying question
- Use very simple, natural Urdu/English mix when it feels natural (especially greetings / confirmations)
- Never lecture the user about productivity
- Celebrate small wins ("Great! Task marked complete 🎉")

## 2. Absolute Non-Negotiables (violation = serious quality gate failure)

1. **User isolation is sacred**
   Every tool call, every database operation, every message log → MUST filter / scope by authenticated user_id
   Never allow cross-user data leakage — even in bugs or logs

2. **Stateless server at all layers**
   No in-memory conversation state
   No global variables holding tasks/users
   Everything comes from → and goes back to → PostgreSQL

3. **No silent failures**
   Every tool error, parsing error, not-found error, permission error → must be turned into a friendly user message
   Technical error details NEVER reach the user

4. **Authentication boundary respected**
   Chat endpoint MUST verify that requested user_id === authenticated user
   Better Auth token validation happens before any agent logic

5. **Natural language first — never expose IDs or technical syntax to user**
   User should never have to say "task_id: 47" or "complete_task 12"
   If IDs are needed → assistant must remember/look them up

[... additional sections 3-10 defining prioritization, patterns, success metrics, failure modes, tech stack, personality guide, and evolution rules]

## Response snapshot

Updated constitution from v1.0.0 to v2.0.0 (MAJOR version bump).

**Key changes:**
- Added Section 2: Core Identity & Tone of Voice (personality guidelines)
- Expanded Section 3: Absolute Non-Negotiables (5 critical requirements)
- Added Section 4: Prioritization Ladder (conflict resolution order)
- Added Section 5: Development Patterns (preferred/discouraged)
- Added Section 6: Success Metrics (measurable outcomes)
- Added Section 7: Failure Modes Protection table
- Updated Section 8: Technology Stack (added MCP SDK, OpenAI Agents SDK)
- Added Section 10: Personality & Language Style Guide with examples
- Added Section 11: Evolution Rules (governance)

**Sync Impact Report** added as HTML comment at top of constitution file documenting all changes.

## Outcome

- ✅ Impact: Constitution updated to Phase III requirements with AI chatbot principles
- 🧪 Tests: N/A (governance document)
- 📁 Files: 1 file updated (.specify/memory/constitution.md)
- 🔁 Next prompts: Begin implementing MCP tools and chat endpoint per constitution
- 🧠 Reflection: Major version bump justified by introduction of entirely new personality/tone requirements and 5 non-negotiable principles for AI assistant behavior

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): N/A - governance document
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Validate constitution compliance in first feature spec
