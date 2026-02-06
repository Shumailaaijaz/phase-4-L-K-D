# Research: Local Kubernetes Deployment

**Feature**: 007-local-k8s-deployment
**Date**: 2026-02-04

## R1: Multi-Stage Docker Build for Next.js

**Decision**: Use a 3-stage build: deps → builder → runner

**Rationale**: Next.js standalone output mode (`output: 'standalone'` in next.config.js) produces a minimal server bundle that doesn't need the full node_modules. This reduces the final image from ~1 GB to ~100-200 MB.

**Build stages**:
1. `deps` — Install node_modules from package.json + lockfile
2. `builder` — Copy source, run `next build` with standalone output
3. `runner` — Copy only `.next/standalone`, `.next/static`, and `public`

**Base image**: `node:20-alpine` (matches Next.js 14 requirements, Alpine for small size)

**Alternatives considered**:
- Single-stage build: ~800 MB image with dev deps — rejected for size
- Distroless base: Incompatible with Next.js server process — rejected
- `node:20-slim`: 50 MB larger than Alpine but more compatible — acceptable fallback

**Key finding**: Next.js config must include `output: 'standalone'` for the runner stage to work. Need to check/add this to `next.config.js`.

---

## R2: Multi-Stage Docker Build for FastAPI

**Decision**: Use a 2-stage build: builder → runner

**Rationale**: Python images are large (~900 MB for full). Using `python:3.11-slim` as final base and copying only installed packages reduces the image to ~200-300 MB.

**Build stages**:
1. `builder` — Install system deps + pip install into a virtual environment
2. `runner` — Copy only the virtual environment and application source

**Base image**: `python:3.11-slim` (matches requirements.txt constraints, slim for production)

**Key dependencies requiring system packages**:
- `psycopg2-binary` — no system deps needed (binary wheels included)
- `bcrypt` — no system deps needed (binary wheels)
- No native compilation required for any dependency

**Alternatives considered**:
- `python:3.11-alpine`: Requires compiling C extensions (psycopg2, bcrypt) — rejected for build time
- Single-stage with `--no-cache-dir`: ~500 MB — rejected for size
- Distroless Python: Limited debugging capability — rejected for Phase IV (learning phase)

**Exposed port**: 8000 (uvicorn default)
**CMD**: `uvicorn main:app --host 0.0.0.0 --port 8000`

---

## R3: Dockerfile Location Strategy

**Decision**: Place Dockerfiles in `docker/frontend/Dockerfile` and `docker/backend/Dockerfile`, with build context pointing to the respective app directories.

**Rationale**: Keeps Dockerfiles separate from application source code. Build commands use `-f` flag to specify Dockerfile and set context to the app directory:
```bash
docker build -f docker/frontend/Dockerfile -t todo-frontend:local ./frontend
docker build -f docker/backend/Dockerfile -t todo-backend:local ./backend
```

**Alternatives considered**:
- Dockerfiles in app directories (`frontend/Dockerfile`, `backend/Dockerfile`): Simpler build commands but mixes infrastructure with application code — acceptable alternative
- Root-level Dockerfiles: Requires copying entire repo as context — rejected
- `.dockerignore` in app dirs: Still needed regardless of Dockerfile location

**Decision**: Place Dockerfiles in app directories (`frontend/Dockerfile`, `backend/Dockerfile`) for simpler build commands. This is the more common convention and reduces the cognitive load of `-f` flags.

**Revised structure**:
```
frontend/Dockerfile        # Build: docker build -t todo-frontend:local ./frontend
backend/Dockerfile         # Build: docker build -t todo-backend:local ./backend
frontend/.dockerignore     # Exclude node_modules, .next, .env
backend/.dockerignore      # Exclude venv, __pycache__, .env, tests
```

---

## R4: Loading Local Images into Minikube

**Decision**: Use `minikube image load` to transfer locally-built images into Minikube's Docker daemon.

**Rationale**: Minikube runs its own Docker daemon inside the VM. Images built on the host Docker are not automatically visible. Two approaches exist:

1. **`eval $(minikube docker-env)`** — switches the host shell to Minikube's Docker daemon, then builds directly inside. Requires rebuilding images.
2. **`minikube image load <image>`** — copies an existing image from host Docker into Minikube. No rebuild needed.

Approach 2 is simpler for our workflow: build on host first (verifiable), then load into Minikube.

**Helm chart requirement**: Set `imagePullPolicy: IfNotPresent` (not `Always`) so Kubernetes uses the locally-loaded image instead of trying to pull from a registry.

**Alternatives considered**:
- Local registry (localhost:5000): Extra infrastructure — rejected for Phase IV simplicity
- `minikube docker-env` + rebuild: Works but forces rebuild — rejected as primary approach

---

## R5: Helm Chart Architecture

**Decision**: Single umbrella chart with per-service template files.

**Rationale**: The application has only 2 deployable components (frontend, backend). A single chart with separate template files per service is simpler than subchart architecture and sufficient for this scope.

**Chart structure**:
- Separate deployment + service templates per component: `frontend-deployment.yaml`, `backend-deployment.yaml`, etc.
- Shared helpers in `_helpers.tpl` for labels, names, selectors
- Single `values.yaml` with per-service sections (frontend.*, backend.*)
- Secret resource for sensitive env vars (DATABASE_URL, BETTER_AUTH_SECRET, OPENAI_API_KEY)
- ConfigMap for non-sensitive config (ENVIRONMENT, CORS_ORIGINS, OPENAI_MODEL)

**Alternatives considered**:
- Subchart per service: Overkill for 2 services — rejected
- Kustomize instead of Helm: Less ecosystem support, no templating — rejected
- Raw manifests: No parameterization, no upgrade/rollback — rejected

---

## R6: Environment Variables Mapping

**Decision**: Map all backend `Settings` fields to Kubernetes resources.

From `backend/core/config.py`, the following env vars are needed:

| Variable | Sensitivity | K8s Resource | Required |
|----------|-------------|-------------|----------|
| DATABASE_URL | Secret | Secret | Yes |
| BETTER_AUTH_SECRET | Secret | Secret | Yes |
| OPENAI_API_KEY | Secret | Secret | Yes |
| JWT_SECRET | Secret | Secret | Yes |
| CORS_ORIGINS | Config | ConfigMap | Yes (set to frontend service URL) |
| ENVIRONMENT | Config | ConfigMap | No (default: production) |
| OPENAI_MODEL | Config | ConfigMap | No (default: gpt-4o-mini) |
| GROQ_API_KEY | Secret | Secret | No (optional alternative) |
| GROQ_MODEL | Config | ConfigMap | No (optional) |

Frontend env vars (build-time):
| Variable | K8s Resource | Notes |
|----------|-------------|-------|
| NEXT_PUBLIC_API_URL | Build arg | Must be set at `docker build` time, not runtime |

**Key finding**: `NEXT_PUBLIC_*` variables are embedded at build time in Next.js. For local Minikube, this must point to the backend's Kubernetes service URL. Options:
1. Build with `--build-arg NEXT_PUBLIC_API_URL=http://todo-backend:8000` (internal service DNS)
2. Use runtime env injection via Next.js `publicRuntimeConfig` — requires code changes

**Decision**: Use build arg approach. The frontend image is local-only, so hardcoding the in-cluster backend URL is acceptable.

---

## R7: Service Networking in Minikube

**Decision**: Frontend uses NodePort for external access; backend uses ClusterIP for internal communication.

| Service | Type | Port | Access Method |
|---------|------|------|---------------|
| todo-frontend | NodePort | 3000 → 30080 | `minikube service todo-frontend -n todo-app` |
| todo-backend | ClusterIP | 8000 | Internal: `http://todo-backend:8000` from frontend pod |

**Rationale**: Only the frontend needs external access (browser). The backend is accessed internally by the frontend via Kubernetes service DNS.

**CORS consideration**: Backend CORS_ORIGINS must include the Minikube frontend URL. Since this URL is dynamic (assigned by Minikube), we set CORS_ORIGINS to `*` for local development.

**Alternatives considered**:
- Both NodePort: Unnecessary external exposure — rejected
- Ingress: Additional complexity for local dev — optional, disabled by default
- LoadBalancer + minikube tunnel: Works but requires tunnel process — acceptable alternative

---

## R8: AI Tool Installation

### kubectl-ai
- Install via Go: `go install github.com/GoogleCloudPlatform/kubectl-ai@latest`
- Or download binary from GitHub releases
- Requires `OPENAI_API_KEY` env var (same key used by the chatbot)

### kagent
- Install via Helm: `helm install kagent kagent/kagent --set profile=demo`
- Or kubectl apply from release manifests
- Runs as a pod inside the cluster
- Requires API key for LLM backend

### Gordon
- Built into Docker Desktop (recent versions)
- Invoke via: `docker ai "<prompt>"`
- No separate installation needed
- May not be available in all Docker Desktop versions — fallback documented

**All tools are optional** — manual fallbacks documented per constitution 3.3.
