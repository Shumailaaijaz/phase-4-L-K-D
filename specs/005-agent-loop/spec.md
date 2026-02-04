# Feature Specification: AI Agent Loop (Reasoning Layer)

**Feature Branch**: `005-agent-loop`
**Created**: 2025-01-26
**Status**: Draft
**Input**: User description: "AI Agent Loop for Todo Chatbot using OpenAI Agents SDK - the reasoning layer that interprets user messages, decides which MCP tools to invoke, and generates natural language responses."

---

## Overview

This specification defines the AI Agent Loop - the reasoning layer that connects user conversations to task operations. The agent interprets natural language messages, determines user intent, invokes appropriate MCP tools (from Spec 004), and formats tool results into conversational responses.

**Key Principle**: The agent is the only component that "thinks." It receives user messages, decides what actions to take, executes those actions via MCP tools, and generates human-friendly responses. The Chat API (Spec 003) handles transport; the MCP tools (Spec 004) handle execution; the Agent handles reasoning.

---

## User Scenarios & Testing

### User Story 1 - Natural Language Task Creation (Priority: P1)

A user types a message like "Add a task to buy groceries" and the AI agent understands the intent, extracts task details, invokes the add_task tool, and responds with a confirmation in natural language.

**Why this priority**: Task creation is the foundational interaction. Users must be able to create tasks through conversation for the chatbot to have any utility.

**Independent Test**: Send a chat message requesting task creation. Verify the agent calls add_task tool and returns a user-friendly confirmation without exposing internal IDs or technical details.

**Acceptance Scenarios**:

1. **Given** a user message "Add a task to buy milk", **When** the agent processes it, **Then** it calls add_task with title "buy milk" and responds "I've added 'buy milk' to your tasks."
2. **Given** a user message "Create a high priority task to call mom by Friday", **When** the agent processes it, **Then** it extracts title, priority, and due_date and responds with all details confirmed.
3. **Given** a user message with no clear task title like "add something", **When** the agent processes it, **Then** it asks for clarification: "What would you like me to add to your tasks?"

---

### User Story 2 - View Tasks via Conversation (Priority: P1)

A user asks "What are my tasks?" or "Show me my todo list" and the agent retrieves and presents their tasks in a readable format.

**Why this priority**: Users need to see their tasks to manage them effectively. This is core to the chatbot experience.

**Independent Test**: Send a message asking to view tasks. Verify the agent calls list_tasks and presents results conversationally without raw JSON or IDs.

**Acceptance Scenarios**:

1. **Given** a user with 3 tasks asks "What's on my list?", **When** the agent processes it, **Then** it lists tasks in a readable format with titles, priorities, and due dates.
2. **Given** a user with no tasks asks "Show my tasks", **When** the agent processes it, **Then** it responds "You don't have any tasks yet. Would you like to add one?"
3. **Given** a user asks "What high priority tasks do I have?", **When** the agent processes it, **Then** it filters and shows only high priority tasks (or states none exist).

---

### User Story 3 - Mark Task Complete (Priority: P1)

A user says "I finished buying groceries" or "Mark the milk task as done" and the agent identifies the task and marks it complete.

**Why this priority**: Completing tasks is essential workflow. Users need to update task status through natural language.

**Independent Test**: Create a task, then send a completion message. Verify the agent identifies the correct task and calls complete_task.

**Acceptance Scenarios**:

1. **Given** a user with task "buy milk" says "I bought the milk", **When** the agent processes it, **Then** it marks that task complete and responds "Great! I've marked 'buy milk' as complete."
2. **Given** a user with multiple similar tasks says "done with the groceries", **When** the agent finds multiple matches, **Then** it asks for clarification: "I found multiple tasks about groceries. Which one did you complete?"
3. **Given** a user says "Mark my report task as done" but has no such task, **When** the agent processes it, **Then** it responds "I couldn't find a task about 'report' in your list."

---

### User Story 4 - Update Task Details (Priority: P2)

A user wants to change a task's title, priority, or due date through conversation.

**Why this priority**: Modifications are important but secondary to create/view/complete workflow.

**Independent Test**: Create a task, then send an update message. Verify the agent calls update_task with correct modifications.

**Acceptance Scenarios**:

1. **Given** a user with task "buy milk" says "Change the milk task to high priority", **When** the agent processes it, **Then** it updates priority and confirms.
2. **Given** a user says "Rename my grocery task to 'buy groceries and snacks'", **When** the agent processes it, **Then** it updates the title and confirms.
3. **Given** a user says "Move my report deadline to next Monday", **When** the agent processes it, **Then** it updates due_date and confirms with the new date.

---

### User Story 5 - Delete Task (Priority: P2)

A user wants to remove a task entirely from their list.

**Why this priority**: Deletion is a destructive operation that's needed but used less frequently.

**Independent Test**: Create a task, then send a deletion message. Verify the agent calls delete_task and confirms removal.

**Acceptance Scenarios**:

1. **Given** a user with task "buy milk" says "Delete the milk task", **When** the agent processes it, **Then** it removes the task and responds "I've removed 'buy milk' from your tasks."
2. **Given** a user says "Remove all my completed tasks", **When** the agent processes it, **Then** it identifies completed tasks and asks for confirmation before deleting.
3. **Given** a user says "Delete my meeting task" but has no such task, **When** the agent processes it, **Then** it responds "I couldn't find a task about 'meeting' to delete."

---

### User Story 6 - General Conversation and Greetings (Priority: P3)

A user sends general messages like "Hello" or "Thanks" that don't require tool invocation.

**Why this priority**: Politeness and natural conversation improve user experience but aren't core functionality.

**Independent Test**: Send greetings and general messages. Verify the agent responds appropriately without calling any tools.

**Acceptance Scenarios**:

1. **Given** a user says "Hi!", **When** the agent processes it, **Then** it responds with a friendly greeting and offers help.
2. **Given** a user says "Thanks for your help", **When** the agent processes it, **Then** it responds politely without invoking any tools.
3. **Given** a user asks "What can you do?", **When** the agent processes it, **Then** it explains its capabilities (task management).

---

### Edge Cases

- What happens when the user's message is ambiguous and could mean multiple things?
- How does the agent handle requests for tasks that don't exist?
- What happens when the agent encounters a tool error (database down)?
- How does the agent handle very long or complex user messages?
- What happens when the user tries to access another user's tasks?
- How does the agent handle messages in different languages?
- What happens when multiple tool calls are needed for one request?

---

## Requirements

### Functional Requirements

#### Agent Core

- **FR-001**: Agent MUST use OpenAI Agents SDK for reasoning and tool invocation.
- **FR-002**: Agent MUST process user messages and determine intent (create, list, complete, update, delete, or general).
- **FR-003**: Agent MUST invoke appropriate MCP tools based on user intent.
- **FR-004**: Agent MUST format tool responses into natural language for the user.
- **FR-005**: Agent MUST maintain conversation context within a single session.

#### Intent Recognition

- **FR-010**: Agent MUST recognize task creation intents from natural language.
- **FR-011**: Agent MUST extract task attributes (title, priority, due date) from user messages.
- **FR-012**: Agent MUST recognize task listing/viewing intents.
- **FR-013**: Agent MUST recognize task completion intents and identify which task.
- **FR-014**: Agent MUST recognize task update intents and extract what to change.
- **FR-015**: Agent MUST recognize task deletion intents.
- **FR-016**: Agent MUST recognize when clarification is needed and ask appropriate questions.

#### Tool Integration

- **FR-020**: Agent MUST pass authenticated user_id to all MCP tool calls.
- **FR-021**: Agent MUST handle tool success responses and format for user.
- **FR-022**: Agent MUST handle tool error responses and provide user-friendly messages.
- **FR-023**: Agent MUST NOT expose internal task IDs to users in responses.
- **FR-024**: Agent MUST match user descriptions to tasks by title similarity, not by ID.

#### Response Generation

- **FR-030**: Agent MUST generate conversational, friendly responses.
- **FR-031**: Agent MUST confirm successful operations with relevant details.
- **FR-032**: Agent MUST provide helpful suggestions when tasks cannot be found.
- **FR-033**: Agent MUST handle general conversation without tool invocation.
- **FR-034**: Agent MUST explain errors in user-friendly terms (no stack traces or codes).

#### Language Mirroring

- **FR-050**: Agent MUST detect user input language (English, Urdu script, or Roman Urdu).
- **FR-051**: Agent MUST respond in the same language/script the user used.
- **FR-052**: Agent MUST use predefined confirmation templates for consistent responses.
- **FR-053**: If user message contains Urdu script (اردو), agent MUST respond in Urdu script.
- **FR-054**: If user message contains Roman Urdu keywords, agent MUST respond in Roman Urdu.
- **FR-055**: Otherwise, agent MUST respond in English (default).

#### Security

- **FR-040**: Agent MUST validate user_id from authenticated JWT before any tool call.
- **FR-041**: Agent MUST NOT allow operations on tasks belonging to other users.
- **FR-042**: Agent MUST NOT include sensitive information in responses.

---

### Key Entities

#### AgentRunner

- **What it represents**: The OpenAI Agents SDK runner that executes agent reasoning
- **Key attributes**: Model configuration, tool definitions, system prompt
- **Relationships**: Invokes MCP tools, processes user messages

#### AgentContext

- **What it represents**: Per-request context for agent execution
- **Key attributes**: user_id, conversation_id, message history
- **Relationships**: Passed to each agent invocation

#### ToolCall

- **What it represents**: A decision by the agent to invoke an MCP tool
- **Key attributes**: tool_name, parameters, result
- **Relationships**: Recorded in message history for context

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: Users can create tasks through natural language 95% of the time without clarification needed.
- **SC-002**: Users receive a meaningful response within 3 seconds of sending a message.
- **SC-003**: Agent correctly identifies user intent (create/list/complete/update/delete) 90% of the time.
- **SC-004**: Task operations performed by the agent are identical to manual API calls (no data discrepancy).
- **SC-005**: Agent maintains user isolation - no cross-user data access possible.
- **SC-006**: Error messages are user-friendly with no technical jargon exposed.

---

## Integration Points

### Dependencies

- **Spec 003 (Chat API)**: Provides the HTTP endpoint for receiving user messages and returning responses
- **Spec 004 (MCP Tools)**: Provides the tool functions (add_task, list_tasks, complete_task, delete_task, update_task) that the agent invokes
- **OpenAI Agents SDK**: Provides the agent runtime for reasoning and tool execution
- **JWT Authentication**: User identity comes from validated JWT token

### Interface Contract

**Input** (from Chat API):
- user_id: Authenticated user identifier
- conversation_id: Current conversation UUID
- message: User's natural language input
- history: Previous messages in conversation

**Output** (to Chat API):
- response: Agent's natural language response
- tool_calls: Record of tools invoked (for persistence)
- tool_results: Results from tool invocations (for persistence)

---

## Confirmation Language Templates

### Language Selection Rule

The agent uses simple, rule-based language mirroring:

| User Input Language | Agent Response Language |
|---------------------|------------------------|
| English | English |
| Urdu script (اردو) | Urdu script |
| Roman Urdu | Roman Urdu |

### Template: Task Created (add_task)

| Language | Template |
|----------|----------|
| English | ✅ Got it! I've added the task "{title}" to your list. |
| Roman Urdu | ✅ Theek hai! Main ne "{title}" ka task add kar diya hai. |
| Urdu | ✅ ٹھیک ہے! میں نے "{title}" کا ٹاسک شامل کر دیا ہے۔ |

### Template: Task Listed (list_tasks)

| Language | Template |
|----------|----------|
| English | 📋 Here are your {status} tasks: {task_list} |
| Roman Urdu | 📋 Yeh aap ke {status} tasks hain: {task_list} |
| Urdu | 📋 یہ آپ کے {status} ٹاسکس ہیں: {task_list} |

### Template: Task Completed (complete_task)

| Language | Template |
|----------|----------|
| English | 🎉 Nice! The task "{title}" is now marked as complete. |
| Roman Urdu | 🎉 Zabardast! "{title}" wala task complete ho gaya hai. |
| Urdu | 🎉 بہت خوب! "{title}" والا ٹاسک مکمل ہو گیا ہے۔ |

### Template: Task Deleted (delete_task)

| Language | Template |
|----------|----------|
| English | 🗑️ Done. I've deleted the task "{title}". |
| Roman Urdu | 🗑️ Ho gaya. "{title}" wala task delete kar diya gaya hai. |
| Urdu | 🗑️ ہو گیا۔ "{title}" والا ٹاسک حذف کر دیا گیا ہے۔ |

### Template: Task Updated (update_task)

| Language | Template |
|----------|----------|
| English | ✏️ Updated! The task is now called "{title}". |
| Roman Urdu | ✏️ Update ho gaya! Task ab "{title}" ke naam se hai. |
| Urdu | ✏️ اپڈیٹ ہو گیا! اب ٹاسک کا نام "{title}" ہے۔ |

### Template: Task Not Found (Error)

| Language | Template |
|----------|----------|
| English | ⚠️ I couldn't find that task. Can you double-check the details? |
| Roman Urdu | ⚠️ Mujhe yeh task nahi mila. Zara details check kar lein. |
| Urdu | ⚠️ مجھے یہ ٹاسک نہیں ملا۔ براہِ کرم تفصیل چیک کریں۔ |

### Template: Ambiguous Request (Needs Clarification)

| Language | Template |
|----------|----------|
| English | 🤔 I see multiple matching tasks. Which one do you mean? |
| Roman Urdu | 🤔 Is naam ke kai tasks hain. Bata dein kaunsa? |
| Urdu | 🤔 اس نام کے کئی ٹاسکس ہیں۔ براہِ کرم واضح کریں۔ |

---

## Out of Scope

- Fine-tuning or training custom models
- Voice input/output processing
- Proactive notifications or reminders
- Complex task queries (e.g., "tasks due this week that are high priority")
- Bulk operations (e.g., "delete all completed tasks" without confirmation)
- Integration with external calendars or services
- Offline functionality
- Languages beyond English, Urdu script, and Roman Urdu
