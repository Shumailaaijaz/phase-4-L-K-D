---
id: 0015
title: Phase IV Implementation Plan
stage: plan
date: 2026-02-04
surface: agent
model: claude-opus-4-5-20251101
feature: local-k8s-deployment
branch: 007-local-k8s-deployment
user: user
command: /sp.plan
labels: ["plan", "phase-4", "kubernetes", "docker", "helm", "minikube", "architecture"]
links:
  spec: specs/007-local-k8s-deployment/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/007-local-k8s-deployment/plan.md
  - specs/007-local-k8s-deployment/research.md
  - specs/007-local-k8s-deployment/data-model.md
  - specs/007-local-k8s-deployment/quickstart.md
  - specs/007-local-k8s-deployment/contracts/values-schema.md
tests:
  - none
---

## Prompt

/sp.plan — Phase IV: Local Kubernetes Deployment. User provided 7 milestones with detailed task breakdown covering environment preparation, containerization, Minikube cluster setup, Helm chart creation, deployment & verification, AI DevOps integration, and documentation.

## Response snapshot

Created implementation plan with 5 artifacts:

1. **plan.md** — Technical context (Dockerfile/YAML/Bash, Docker Desktop + Minikube + Helm), constitution check (8 gates all PASS), project structure (Dockerfiles in app dirs, charts/todo-app/ for Helm chart)

2. **research.md** — 8 research decisions:
   - R1: 3-stage Next.js build (deps→builder→runner with standalone output)
   - R2: 2-stage FastAPI build (builder→runner on python:3.11-slim)
   - R3: Dockerfiles in app directories (revised from docker/ dir)
   - R4: `minikube image load` for local images (not docker-env rebuild)
   - R5: Single umbrella Helm chart (not subcharts)
   - R6: Env var mapping from backend/core/config.py (11 vars, 5 secrets + 4 config)
   - R7: Frontend NodePort:30080, backend ClusterIP, CORS=* for local
   - R8: AI tool installation (kubectl-ai via Go, kagent via Helm, Gordon built-in)

3. **data-model.md** — Kubernetes resource model (2 deployments, 2 services, 1 secret, 1 configmap, 1 optional ingress) with resource budget (200m/1000m CPU, 256Mi/1024Mi memory total)

4. **contracts/values-schema.md** — Complete values.yaml contract (frontend.*, backend.*, ingress.*) with types, defaults, and required values

5. **quickstart.md** — 7-step setup guide (WSL tuning → tools → images → Minikube → Helm → access → cleanup)

## Outcome

- ✅ Impact: Complete implementation plan ready for /sp.tasks
- 🧪 Tests: none (planning document)
- 📁 Files: 5 created (plan.md, research.md, data-model.md, quickstart.md, contracts/values-schema.md)
- 🔁 Next prompts: /sp.tasks to generate actionable task breakdown
- 🧠 Reflection: Key research decision — Dockerfiles in app dirs (not separate docker/ dir) is simpler. NEXT_PUBLIC_* vars must be build-time args, not runtime env.

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): Constitution check 8/8 PASS
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Verify next.config.js has output:'standalone' before implementing Dockerfile
