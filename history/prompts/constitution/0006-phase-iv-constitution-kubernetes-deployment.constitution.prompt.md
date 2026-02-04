---
id: 0006
title: Phase IV Constitution — Kubernetes Deployment
stage: constitution
date: 2026-02-04
surface: agent
model: claude-opus-4-5-20251101
feature: none
branch: null
user: user
command: /sp.constitution
labels: ["constitution", "phase-4", "kubernetes", "minikube", "helm", "kubectl-ai", "kagent", "docker-desktop"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
  - CLAUDE.md
tests:
  - none
---

## Prompt

/sp.constitution — Phase IV · Local Kubernetes Deployment

User provided a complete 10-section constitution draft covering: Core Identity & Tone (DevOps friend in Karachi with Roman Urdu), Absolute Non-Negotiables (local-only, Windows+WSL2, AI tools as helpers, no destructive commands, resource awareness), Prioritization Ladder (cluster stability > WSL2 integration > AI tools > Helm > speed > polish), Strongly Preferred/Discouraged Patterns, Success Metrics (Minikube, Helm, kubectl-ai, kagent, Gordon), Failure Modes (Docker daemon, signal killed, PATH, stuck Minikube, API key errors, Helm template errors), Sacred Dependencies (Docker Desktop, Minikube v1.38.0+, Helm v3/v4, kubectl-ai, kagent, Phase III app), Personality & Language Style Guide (Roman Urdu warmth), and Evolution Rules.

## Response snapshot

Updated constitution from v2.0.0 (Phase III: AI Chatbot) to v3.0.0 (Phase IV: Local Kubernetes Deployment). MAJOR version bump due to complete phase change, new non-negotiables, new technology stack, and new success criteria.

Key changes:
- Section 2: Rewritten for DevOps playground personality with Roman Urdu warmth
- Section 3: Replaced 5 app-level non-negotiables (user isolation, stateless, auth boundary, no silent failures, natural language first) with 5 deployment-level non-negotiables (local-only, Windows+WSL2, AI tools as helpers, no destructive commands, resource awareness)
- Section 4: Prioritization ladder rewritten for deployment concerns
- Section 5: Preferred/discouraged patterns for Kubernetes workflow
- Section 6: Success metrics for Minikube/Helm/kubectl-ai/kagent/Gordon
- Section 7: Failure modes table for Docker/WSL2/Minikube/Helm
- Section 8: Technology stack split into Phase IV Infrastructure and Phase III Application Target
- Section 12: Enforcement now maps specific agents to specific non-negotiables

Propagation: Updated CLAUDE.md Active Technologies (added 5 Phase IV tools) and Recent Changes. Validated all 3 templates (plan, spec, tasks) — no changes needed (generic structure).

## Outcome

- ✅ Impact: Constitution v3.0.0 establishes Phase IV governance for local Kubernetes deployment
- 🧪 Tests: none (governance document)
- 📁 Files: 2 modified (.specify/memory/constitution.md, CLAUDE.md)
- 🔁 Next prompts: Create Phase IV feature specs, start Minikube setup, create Helm charts
- 🧠 Reflection: Phase III app-level principles (user isolation, stateless server) are still valid for the application but are now implicitly inherited rather than constitution-level for the deployment phase. If needed, they can be referenced from the Phase III constitution version.

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): N/A — manual validation of no unresolved placeholders passed
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Add a Section 8.3 for "Phase II Infrastructure" if deployment needs to reference auth/DB setup tools
