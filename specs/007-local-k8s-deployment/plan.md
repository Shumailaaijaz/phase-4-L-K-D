# Implementation Plan: Local Kubernetes Deployment

**Branch**: `007-local-k8s-deployment` | **Date**: 2026-02-04 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/007-local-k8s-deployment/spec.md`

## Summary

Containerize the Phase III Todo AI Chatbot (Next.js frontend + FastAPI backend with MCP) into multi-stage Docker images, package as a Helm chart, and deploy to a local Minikube cluster on Windows 10 + WSL2. Integrate AI DevOps tools (kubectl-ai, kagent, Gordon) for Kubernetes operations. Produce a complete setup guide with troubleshooting for common Windows/WSL2 errors.

## Technical Context

**Language/Version**: Dockerfile (multi-stage), YAML (Helm templates, Kubernetes manifests), Bash/PowerShell (setup scripts)
**Primary Dependencies**: Docker Desktop (with Gordon), Minikube v1.38.0+, Helm v3/v4, kubectl, kubectl-ai, kagent
**Storage**: External Neon PostgreSQL (via DATABASE_URL env var — no in-cluster DB)
**Testing**: Manual verification via `helm lint`, `helm template --debug`, `kubectl get pods`, browser access
**Target Platform**: Windows 10/11 + WSL2 Ubuntu with Docker Desktop
**Project Type**: Infrastructure/DevOps (containerization + orchestration of existing web application)
**Performance Goals**: All pods Running within 3 minutes of helm install; total resource budget < 2 GB memory, < 2 CPU cores
**Constraints**: Local-only (no cloud), resource-aware (8-16 GB host RAM), single Minikube node, replicas=1
**Scale/Scope**: 2 containers (frontend, backend), 1 Helm chart, 1 Minikube cluster, 1 namespace (todo-app)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Constitution Section | Status | Evidence |
|------|---------------------|--------|----------|
| Local-only | 3.1 | PASS | No cloud references. All networking via minikube service / port-forward. No external LB. |
| Windows + WSL2 | 3.2 | PASS | All commands labeled with target shell. .wslconfig tuning included. PowerShell preferred for minikube start. |
| AI tools as helpers | 3.3 | PASS | Every kubectl-ai/kagent/Gordon command has plain kubectl/helm/docker fallback documented. |
| No destructive without warning | 3.4 | PASS | minikube delete documented with warning. All apply preceded by --dry-run. Backup commands included. |
| Resource awareness | 3.5 | PASS | Replicas=1, requests 100m/128Mi, limits 500m/512Mi. .wslconfig guidance included. Total budget < 2 GB. |
| Single namespace | 5.1 (preferred) | PASS | All resources in todo-app namespace. |
| No hardcoded secrets | 5.2 (anti-pattern) | PASS | All secrets via Kubernetes Secret resources + values.yaml override. Empty defaults with REQUIRED comments. |
| Idempotent operations | FR-004 | PASS | helm upgrade --install pattern supported. |

**Result**: All gates PASS. No violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/007-local-k8s-deployment/
├── plan.md              # This file
├── research.md          # Phase 0: technology research
├── data-model.md        # Phase 1: Kubernetes resource model
├── quickstart.md        # Phase 1: quick setup guide
├── contracts/           # Phase 1: Helm values schema
│   └── values-schema.md
└── tasks.md             # Phase 2 output (/sp.tasks)
```

### Source Code (repository root)

```text
frontend/
├── Dockerfile               # Multi-stage Next.js build
└── .dockerignore            # Exclude node_modules, .next, .env

backend/
├── Dockerfile               # Multi-stage FastAPI build
└── .dockerignore            # Exclude venv, __pycache__, .env, tests

charts/
└── todo-app/
    ├── Chart.yaml
    ├── values.yaml
    ├── .helmignore
    └── templates/
        ├── _helpers.tpl
        ├── frontend-deployment.yaml
        ├── frontend-service.yaml
        ├── backend-deployment.yaml
        ├── backend-service.yaml
        ├── configmap.yaml
        ├── secret.yaml
        ├── ingress.yaml
        ├── NOTES.txt
        └── tests/
            └── test-connection.yaml

wslconfig-example              # .wslconfig template
README-phase4.md               # Step-by-step setup guide
```

**Structure Decision**: Infrastructure-only feature. Dockerfiles placed in their respective app directories (`frontend/Dockerfile`, `backend/Dockerfile`) following common convention — simpler build commands (`docker build -t todo-frontend:local ./frontend`). New `charts/` directory for Helm chart. No application code changes except adding `output: 'standalone'` to Next.js config if not present.

## Complexity Tracking

No constitution violations to justify. All gates pass.
