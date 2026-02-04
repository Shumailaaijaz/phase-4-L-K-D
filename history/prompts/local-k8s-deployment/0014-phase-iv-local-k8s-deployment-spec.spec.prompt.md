---
id: 0014
title: Phase IV Local K8s Deployment Spec
stage: spec
date: 2026-02-04
surface: agent
model: claude-opus-4-5-20251101
feature: local-k8s-deployment
branch: 007-local-k8s-deployment
user: user
command: /sp.specify
labels: ["spec", "phase-4", "kubernetes", "minikube", "helm", "docker", "containerization", "kubectl-ai", "kagent"]
links:
  spec: specs/007-local-k8s-deployment/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/007-local-k8s-deployment/spec.md
  - specs/007-local-k8s-deployment/checklists/requirements.md
tests:
  - none
---

## Prompt

/sp.specify — Phase IV: Local Kubernetes Deployment with Minikube & Helm

User provided a comprehensive Phase IV specification covering: containerization (multi-stage Docker images for frontend/backend/MCP), local Kubernetes cluster (Minikube with docker driver on Windows+WSL2), Helm chart packaging (umbrella chart with deployments, services, secrets, configmaps, ingress), AI DevOps integration (kubectl-ai, kagent, Gordon), access and verification (minikube service, browser testing), constraints (local-only, Windows+WSL2, resource-aware, idempotent), 8 success criteria, deliverables (charts/, docker/, README-phase4.md, .wslconfig), and acceptance tests.

## Response snapshot

Created feature branch `007-local-k8s-deployment` and wrote spec at `specs/007-local-k8s-deployment/spec.md` with:

- **5 user stories** (P1-P5): Containerize application, Start Minikube cluster, Deploy with Helm, Access and verify, AI DevOps tooling
- **16 functional requirements** (FR-001 through FR-016) covering Dockerfiles, Helm chart structure, secrets handling, probes, resource limits, namespace, setup guide, troubleshooting, linting, AI tool fallbacks
- **9 success criteria** (SC-001 through SC-009) all measurable and technology-agnostic
- **6 edge cases** covering Docker not running, WSL OOM, image not found, missing Helm values, AI tools unavailable, partial install recovery
- **6 assumptions** documented (MCP in backend container, external Neon DB, Docker Desktop running, Windows+WSL2, local images only)
- **8 out-of-scope items** explicitly excluded
- **6 key entities** defined (Docker Image, Helm Chart, Deployment, Service, Secret, ConfigMap)

Quality checklist: all 12 items pass. No NEEDS CLARIFICATION markers.

## Outcome

- ✅ Impact: Complete Phase IV spec ready for /sp.plan
- 🧪 Tests: none (specification document)
- 📁 Files: 2 created (spec.md, checklists/requirements.md)
- 🔁 Next prompts: /sp.plan to create implementation plan, /sp.tasks to break into tasks
- 🧠 Reflection: Decided to keep MCP server inside backend container since it shares models/session — avoids unnecessary third container complexity for local dev

## Evaluation notes (flywheel)

- Failure modes observed: create-new-feature.sh had Windows line endings (CR/LF) — fixed with sed
- Graders run and results (PASS/FAIL): Quality checklist PASS (12/12 items)
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Consider separating MCP into its own container if isolation becomes a requirement
