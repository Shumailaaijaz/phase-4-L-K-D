# Tasks: Local Kubernetes Deployment

**Input**: Design documents from `/specs/007-local-k8s-deployment/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/values-schema.md

**Tests**: Manual verification only (no automated tests — infrastructure feature per spec)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions
- **★**: Critical path task — blocks downstream work

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify existing application, prepare project structure for containerization and Helm packaging

- [ ] T001 ★ Verify Phase III application is functional (backend `uvicorn main:app` starts, frontend `npm run dev` starts, `/health` endpoint responds)
- [ ] T002 ★ Verify `output: 'standalone'` is set in `frontend/next.config.js` — add if missing (required by R1 for multi-stage Docker build)
- [ ] T003 [P] Create directory structure: `charts/todo-app/templates/`, `charts/todo-app/templates/tests/`
- [ ] T004 [P] Create `wslconfig-example` at repo root with recommended WSL2 resource settings (`memory=4GB`, `processors=2`, `swap=2GB`)

**Checkpoint**: Project structure ready, application verified, standalone output confirmed

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build Docker images — MUST be complete before any Kubernetes deployment work

**Warning**: No Helm or Minikube work can begin until images are built and verified

- [ ] T005 ★ [P] Create `frontend/.dockerignore` excluding `node_modules/`, `.next/`, `.env*`, `*.md`, `.git/`
- [ ] T006 ★ [P] Create `backend/.dockerignore` excluding `venv/`, `__pycache__/`, `.env*`, `tests/`, `*.md`, `.git/`
- [ ] T007 ★ Create `frontend/Dockerfile` — 3-stage multi-stage build per R1 (deps: node:20-alpine install deps → builder: copy source + `next build` → runner: node:20-alpine copy `.next/standalone`, `.next/static`, `public`; expose 3000; `NEXT_PUBLIC_API_URL` as build arg)
- [ ] T008 ★ Create `backend/Dockerfile` — 2-stage multi-stage build per R2 (builder: python:3.11-slim install deps into venv → runner: python:3.11-slim copy venv + source; expose 8000; CMD `uvicorn main:app --host 0.0.0.0 --port 8000`)
- [ ] T009 ★ Build and verify frontend image: `docker build -t todo-frontend:local ./frontend` — confirm image < 500 MB, `docker run -p 3000:3000 todo-frontend:local` serves the app
- [ ] T010 ★ Build and verify backend image: `docker build -t todo-backend:local ./backend` — confirm image < 400 MB, `docker run -p 8000:8000 -e DATABASE_URL=... todo-backend:local` responds at `/health`

**Checkpoint**: Both Docker images built, verified running standalone via `docker run`. Foundation ready.

---

## Phase 3: User Story 1 — Containerize the Application (Priority: P1) MVP

**Goal**: Docker images for frontend and backend are built, tagged, and verified running as standalone containers

**Independent Test**: `docker images | grep todo-` shows both images; `docker run` on each serves the app

### Implementation for User Story 1

> Note: T005–T010 in Phase 2 cover the core containerization work. This phase covers Gordon integration and final image validation.

- [ ] T011 [US1] Test Gordon (Docker AI) integration: run `docker ai "What can you do?"` — document output. If Gordon unavailable, document fallback in README-phase4.md
- [ ] T012 [US1] Verify image sizes: `docker images todo-frontend:local` < 500 MB, `docker images todo-backend:local` < 400 MB. If oversized, optimize Dockerfile layers
- [ ] T013 [US1] Test frontend container standalone: `docker run -d -p 3000:3000 todo-frontend:local` → verify `curl http://localhost:3000` returns HTML
- [ ] T014 [US1] Test backend container standalone: `docker run -d -p 8000:8000 -e DATABASE_URL=... -e JWT_SECRET=... todo-backend:local` → verify `curl http://localhost:8000/health` returns 200

**Checkpoint**: US1 complete — both images built, tagged `todo-frontend:local` and `todo-backend:local`, verified running

---

## Phase 4: User Story 2 — Start a Local Kubernetes Cluster (Priority: P2)

**Goal**: Minikube cluster running with Docker driver, images loaded, `todo-app` namespace created

**Independent Test**: `minikube status` shows Running; `kubectl get nodes` shows Ready; images visible in Minikube

### Implementation for User Story 2

- [ ] T015 ★ [US2] Start Minikube cluster: `minikube start --driver=docker --memory=3072 --cpus=2` from PowerShell. Verify `minikube status` shows host/kubelet/apiserver Running
- [ ] T016 ★ [US2] Verify kubectl connectivity: `kubectl get nodes` shows minikube node with STATUS=Ready
- [ ] T017 [US2] Create `todo-app` namespace: `kubectl create namespace todo-app --dry-run=client -o yaml | kubectl apply -f -`
- [ ] T018 ★ [US2] Load local images into Minikube per R4: `minikube image load todo-frontend:local` and `minikube image load todo-backend:local`. Verify with `minikube image ls | grep todo-`

**Checkpoint**: US2 complete — Minikube running, namespace created, images loaded

---

## Phase 5: User Story 3 — Deploy with Helm Chart (Priority: P3) MVP

**Goal**: Complete Helm chart at `charts/todo-app/` that installs frontend + backend + services + secrets + configmap into `todo-app` namespace

**Independent Test**: `helm lint` passes, `helm template --debug` renders, `helm install` creates all pods in Running state

### Implementation for User Story 3

- [ ] T019 ★ [P] [US3] Create `charts/todo-app/Chart.yaml` — name: todo-app, version: 0.1.0, appVersion: 1.0.0, type: application, description per plan.md
- [ ] T020 ★ [P] [US3] Create `charts/todo-app/.helmignore` — exclude `.git`, `*.md`, `.DS_Store`, `*.swp`
- [ ] T021 ★ [US3] Create `charts/todo-app/values.yaml` per contracts/values-schema.md — `frontend.*`, `backend.*`, `ingress.*` sections with all defaults, empty secret values marked REQUIRED
- [ ] T022 ★ [US3] Create `charts/todo-app/templates/_helpers.tpl` — define `todo-app.name`, `todo-app.fullname`, `todo-app.chart`, `todo-app.labels`, `todo-app.selectorLabels` using standard `app.kubernetes.io/*` labels per data-model.md label schema
- [ ] T023 [P] [US3] Create `charts/todo-app/templates/secret.yaml` — Kubernetes Secret with keys: DATABASE_URL, BETTER_AUTH_SECRET, OPENAI_API_KEY, JWT_SECRET, GROQ_API_KEY (base64-encoded from values)
- [ ] T024 [P] [US3] Create `charts/todo-app/templates/configmap.yaml` — ConfigMap with keys: ENVIRONMENT, CORS_ORIGINS, OPENAI_MODEL, GROQ_MODEL from `backend.config.*` values
- [ ] T025 [US3] Create `charts/todo-app/templates/frontend-deployment.yaml` per data-model.md — 1 replica, image from values, container port 3000, liveness/readiness probes on `/`, resource requests/limits from values
- [ ] T026 [US3] Create `charts/todo-app/templates/frontend-service.yaml` per data-model.md — NodePort type, port 3000, nodePort 30080, selector using `app.kubernetes.io/component: frontend`
- [ ] T027 [US3] Create `charts/todo-app/templates/backend-deployment.yaml` per data-model.md — 1 replica, image from values, container port 8000, liveness/readiness probes on `/health`, envFrom secretRef + configMapRef, resource requests/limits
- [ ] T028 [US3] Create `charts/todo-app/templates/backend-service.yaml` per data-model.md — ClusterIP type, port 8000, selector using `app.kubernetes.io/component: backend`
- [ ] T029 [P] [US3] Create `charts/todo-app/templates/ingress.yaml` — optional (gated on `ingress.enabled`), nginx class, host `todo.local`, path rules: `/` → frontend, `/api` → backend
- [ ] T030 [P] [US3] Create `charts/todo-app/templates/NOTES.txt` — post-install instructions showing `minikube service` command and pod status check
- [ ] T031 [P] [US3] Create `charts/todo-app/templates/tests/test-connection.yaml` — Helm test pod that curls frontend:3000 and backend:8000/health
- [ ] T032 ★ [US3] Validate chart: run `helm lint ./charts/todo-app` — fix any errors until lint passes clean (FR-013)
- [ ] T033 ★ [US3] Dry-run render: run `helm template todo ./charts/todo-app --debug` — verify all templates render without errors (FR-014)
- [ ] T034 ★ [US3] Install chart: `helm install todo ./charts/todo-app -n todo-app --set backend.secrets.databaseUrl=... --set backend.secrets.betterAuthSecret=... --set backend.secrets.openaiApiKey=... --set backend.secrets.jwtSecret=...` — verify all pods reach Running within 3 minutes (SC-003)
- [ ] T035 [US3] Verify all resources: `kubectl get all -n todo-app` shows 2 deployments, 2 services, 2 pods Running. `kubectl get secrets -n todo-app` shows secrets. `kubectl get configmap -n todo-app` shows configmap.

**Checkpoint**: US3 complete — Helm chart installed, all pods Running, `helm lint` and `helm template` pass

---

## Phase 6: User Story 4 — Access the Running Application (Priority: P4)

**Goal**: Application accessible in browser, chatbot responds to commands, no crash loops

**Independent Test**: Open frontend URL, log in, send chat commands, verify tasks persist

### Implementation for User Story 4

- [ ] T036 ★ [US4] Access frontend via Minikube: `minikube service todo-frontend -n todo-app` — verify browser opens and page loads (FR-015)
- [ ] T037 [US4] End-to-end test: log in to the app, send "add task buy groceries" → verify chatbot confirms task added (SC-004)
- [ ] T038 [US4] Verify task persistence: send "show my tasks" → verify the added task appears in the list
- [ ] T039 [US4] Health check: `kubectl get pods -n todo-app` — verify no CrashLoopBackOff, ImagePullBackOff, or OOMKilled statuses
- [ ] T040 [US4] Resource check: `kubectl top pods -n todo-app` (requires metrics-server) — verify combined resource usage < 2 GB memory, < 2 CPU (SC-008)

**Checkpoint**: US4 complete — application accessible and functional in browser

---

## Phase 7: User Story 5 — AI DevOps Tooling (Priority: P5)

**Goal**: kubectl-ai and kagent used for at least one operation each, with manual fallbacks documented

**Independent Test**: kubectl-ai generates valid YAML; kagent analyzes cluster health

### Implementation for User Story 5

- [ ] T041 [P] [US5] Install kubectl-ai: `go install github.com/GoogleCloudPlatform/kubectl-ai@latest` (or download binary from releases per R8). Verify: `kubectl-ai --version`
- [ ] T042 [P] [US5] Install kagent via Helm per R8: `helm install kagent kagent/kagent --set profile=demo` (or kubectl apply from release manifests). Verify kagent pod is Running.
- [ ] T043 [US5] kubectl-ai test: run `kubectl-ai "create a deployment for todo-backend with 2 replicas"` → verify valid YAML is generated (SC-006). Document plain kubectl fallback.
- [ ] T044 [US5] kagent test: run `kagent "summarize my pods in todo-app namespace"` → verify meaningful output (SC-007). Document plain kubectl fallback.
- [ ] T045 [US5] Document all AI tool commands with their plain kubectl/helm equivalents in README-phase4.md (FR-016)

**Checkpoint**: US5 complete — AI tools installed, tested, fallbacks documented

---

## Phase 8: Polish & Documentation

**Purpose**: Complete documentation, cleanup, and final validation

- [ ] T046 [P] Create `README-phase4.md` at repo root — step-by-step setup guide covering: prerequisites, WSL2 tuning, tool installation, image building, Minikube start, Helm install, app access, AI tools, cleanup (FR-010)
- [ ] T047 [P] Add troubleshooting section to `README-phase4.md` with at least 5 common Windows + WSL2 errors and fixes: Docker not running, signal:killed, ImagePullBackOff, Helm install failures, pod crash loops (FR-011, SC-009)
- [ ] T048 Validate quickstart.md against actual commands — update `specs/007-local-k8s-deployment/quickstart.md` if any commands changed during implementation
- [ ] T049 Run full end-to-end validation: `minikube delete` → fresh `minikube start` → build images → load images → `helm install` → access app → verify chatbot works (SC-001)
- [ ] T050 Final cleanup: `helm uninstall todo -n todo-app && minikube stop` — verify clean teardown

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 completion — BLOCKS all Kubernetes work
- **US1 - Containerize (Phase 3)**: Depends on Phase 2 (images must be built)
- **US2 - Minikube Cluster (Phase 4)**: Depends on Phase 2 (images needed for loading)
- **US3 - Helm Chart (Phase 5)**: Depends on Phase 4 (cluster must be running, images loaded)
- **US4 - Access & Verify (Phase 6)**: Depends on Phase 5 (chart must be installed)
- **US5 - AI Tools (Phase 7)**: Depends on Phase 4 (cluster must be running) — can run in parallel with Phase 5/6
- **Polish (Phase 8)**: Depends on Phases 3-7 completion

### Critical Path (★ tasks)

```
T001/T002 → T007/T008 → T009/T010 → T015 → T016 → T018 → T019/T021/T022 → T032 → T033 → T034 → T036
```

### User Story Dependencies

- **US1 (P1 Containerize)**: Can start after Phase 2 — no dependencies on other stories
- **US2 (P2 Minikube)**: Can start after Phase 2 — independent of US1 but needs images from Phase 2
- **US3 (P3 Helm Chart)**: Depends on US2 for cluster + images loaded — chart creation (T019-T031) can start in parallel with US2
- **US4 (P4 Access)**: Depends on US3 — chart must be installed
- **US5 (P5 AI Tools)**: Depends on US2 (cluster only) — can start in parallel with US3/US4

### Parallel Opportunities

- T003 + T004 (project structure + wslconfig): independent files
- T005 + T006 (dockerignore files): independent files
- T007 + T008 (Dockerfiles): independent files, different apps
- T019 + T020 (Chart.yaml + .helmignore): independent chart files
- T023 + T024 (secret + configmap templates): independent templates
- T029 + T030 + T031 (ingress + NOTES + test): independent templates
- T041 + T042 (install kubectl-ai + kagent): independent tools
- T046 + T047 (README sections): same file but independent sections
- US3 chart creation (T019-T031) can overlap with US2 cluster setup (T015-T018) — chart files don't need a running cluster
- US5 AI tools (T041-T045) can overlap with US3 Helm installation (T032-T035) — tools install independently

---

## Implementation Strategy

### MVP First (US1 + US3 = Containerize + Deploy)

1. Complete Phase 1: Setup (T001-T004)
2. Complete Phase 2: Foundational — build images (T005-T010)
3. Complete Phase 4: Start Minikube cluster (T015-T018)
4. Complete Phase 5: Create and install Helm chart (T019-T035)
5. **STOP and VALIDATE**: Pods Running? `kubectl get pods -n todo-app`
6. Complete Phase 6: Access and verify in browser (T036-T040)

### Add AI Tools After Core Works

7. Complete Phase 7: Install and test AI tools (T041-T045)
8. Complete Phase 8: Documentation and final validation (T046-T050)

### Agent Assignments (recommended)

| Task Range | Recommended Agent | Rationale |
|-----------|-------------------|-----------|
| T001-T014 | `minikube-docker-setup` | Docker/WSL2 expertise |
| T015-T018 | `minikube-docker-setup` | Minikube cluster management |
| T019-T035 | `helm-chart-creator` | Helm chart generation |
| T036-T040 | `integration-flow-tester` | End-to-end verification |
| T041-T045 | `ai-devops-k8s` | kubectl-ai/kagent operations |
| T046-T050 | General | Documentation and cleanup |

---

## Notes

- [P] tasks = different files, no dependencies
- [US*] label maps task to specific user story for traceability
- ★ = critical path task — blocks downstream work
- All AI tool tasks (T041-T045) have manual fallbacks per constitution 3.3
- `imagePullPolicy: IfNotPresent` is critical for local images per R4
- `NEXT_PUBLIC_API_URL` must be a build arg, not runtime env per R6
- Secrets MUST be passed via `--set` at install time, never committed to values.yaml per FR-006
- Total resource budget: 200m/1000m CPU, 256Mi/1024Mi memory per data-model.md
