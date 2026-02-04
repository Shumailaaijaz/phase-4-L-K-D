# Phase 3 – Todo AI Chatbot 🤖📝

## 📌 Project Overview

This repository represents **Phase 3** of the **Todo Evolution Project**, developed as part of a hackathon. Each phase of this project is maintained in a **separate GitHub repository** to clearly demonstrate architectural and feature-wise evolution for judges and reviewers.

Phase 3 focuses on transforming a traditional Todo application into an **AI-powered conversational assistant**, allowing users to interact with their tasks using natural language.

---

## 🧠 Evolution Context

The project is intentionally split into phases:

* **Phase 1** – Core Todo functionality (CRUD)
* **Phase 2** – AI-powered task suggestions and smart enhancements
* **Phase 3** – 🟢 **AI Chatbot Interface for Todo Management (this repository)**
* Phase 4 – (Planned)
* Phase 5 – (Planned)

Each phase has its **own repository** to ensure:

* Clean commit history
* Clear evaluation per phase
* Easy comparison for judges

---

## 🚀 What’s New in Phase 3

### ✨ Key Features

* 💬 AI-powered chat interface
* 🧾 Natural language Todo creation
* 🔍 Query tasks via conversation
* 🤖 Context-aware responses
* ⚡ Built on top of Phase 2 logic

---

## 🛠 Tech Stack

* **Backend:** FastAPI
* **AI / LLM:** OpenAI / OpenRouter compatible models
* **Language:** Python
* **Containerization:** Docker
* **Version Control:** Git & GitHub

---

## 📂 Project Structure

```text
phase-3-Todo-AI-Chatbot/
│── app/
│   ├── main.py
│   ├── routes/
│   ├── services/
│   └── schemas/
│── Dockerfile
│── docker-compose.yml
│── requirements.txt
│── README.md
```

---

## ▶️ How to Run Locally

### 1️⃣ Clone Repository

```bash
git clone https://github.com/Shumailaaijaz/phase-3-Todo-AI-Chatbot.git
cd phase-3-Todo-AI-Chatbot
```

### 2️⃣ Environment Variables

Create a `.env` file:

```env
OPENAI_API_KEY=your_api_key_here
```

### 3️⃣ Run with Docker

```bash
docker-compose up --build
```

OR without Docker:

```bash
uvicorn app.main:app --reload
```

---

## 🧪 Evaluation Notes (For Judges)

* This repository **only contains Phase 3 work**
* Earlier phase commits are intentionally excluded
* AI chatbot functionality is the **core evaluation focus**
* Designed with scalability and future phases in mind

---

## 🔮 Next Phases (Planned)

* Phase 4: Multi-user collaboration & auth
* Phase 5: Analytics, memory & personalization

---

## 👩‍💻 Author

**Shumaila Aijaz**
Hackathon Participant | AI & Backend Developer

---

✅ *Thank you for reviewing Phase 3 of the Todo Evolution Project.*
"# phase-4-L-K-D" 
