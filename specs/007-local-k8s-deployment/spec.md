# Feature Specification: Local Kubernetes Deployment

**Feature Branch**: `007-local-k8s-deployment`
**Created**: 2026-02-04
**Status**: Draft
**Input**: User description: "Phase IV — Containerize and deploy Todo AI Chatbot on local Minikube with Helm, kubectl-ai, kagent, and Gordon on Windows 10 + WSL2"

## Assumptions

- The Phase III application is fully functional: FastAPI backend (`/backend`), Next.js frontend (`/frontend`), and MCP server (`/backend/mcp/`)
- The MCP server currently lives inside the backend directory and will be deployed as part of the backend container (not a separate service), since it shares the same database session and models. A separate container is created only if needed for isolation.
- The external Neon PostgreSQL database is already configured and will be used by default via `DATABASE_URL` environment variable. No in-cluster PostgreSQL is deployed unless the user explicitly opts in.
- Docker Desktop is installed and running on Windows with WSL2 integration enabled
- The user is on Windows 10/11 with WSL2 Ubuntu
- All images are built and consumed locally — no container registry push required

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Containerize the Application (Priority: P1)

As a developer, I want to build Docker images for the frontend and backend so that the application can run in any container runtime without depending on local Python/Node.js installations.

**Why this priority**: Without container images, nothing else in Phase IV is possible. This is the foundation for all subsequent Kubernetes deployment work.

**Independent Test**: Build both images locally with `docker build`, then run each with `docker run` and verify the application responds on its exposed port.

**Acceptance Scenarios**:

1. **Given** the Phase III frontend source in `/frontend`, **When** I run `docker build -t todo-frontend:local ./docker/frontend`, **Then** a multi-stage image is produced under 500 MB with no dev dependencies in the final layer
2. **Given** the Phase III backend source in `/backend`, **When** I run `docker build -t todo-backend:local ./docker/backend`, **Then** a multi-stage image is produced under 400 MB with no dev dependencies in the final layer
3. **Given** both images are built, **When** I run `docker run -p 3000:3000 todo-frontend:local`, **Then** the Next.js app responds at `http://localhost:3000`
4. **Given** both images are built, **When** I run `docker run -p 8000:8000 -e DATABASE_URL=... todo-backend:local`, **Then** the FastAPI app responds at `http://localhost:8000/health`
5. **Given** Gordon (Docker AI) is available, **When** I run `docker ai "What can you do?"`, **Then** Gordon responds with its capabilities

---

### User Story 2 - Start a Local Kubernetes Cluster (Priority: P2)

As a developer, I want a running Minikube cluster on my Windows + WSL2 machine so that I have a local Kubernetes environment to deploy the application into.

**Why this priority**: The cluster is required before any Helm chart can be installed. It must be stable and resource-tuned for the local machine.

**Independent Test**: Run `minikube start` and verify `kubectl get nodes` shows a Ready node.

**Acceptance Scenarios**:

1. **Given** Docker Desktop is running with WSL2 integration enabled, **When** I run `minikube start --driver=docker` from Windows PowerShell, **Then** the cluster starts without errors and `minikube status` shows host/kubelet/apiserver all Running
2. **Given** the cluster is running, **When** I run `kubectl get nodes`, **Then** the minikube node shows STATUS = Ready
3. **Given** the cluster is running, **When** I run `kubectl create namespace todo-app`, **Then** the namespace is created successfully
4. **Given** a machine with 8 GB RAM and the default `.wslconfig` causes OOM, **When** I update `.wslconfig` with `memory=4GB` and restart WSL, **Then** Minikube starts successfully on retry

---

### User Story 3 - Deploy with Helm Chart (Priority: P3)

As a developer, I want to install the entire Todo Chatbot stack using a single Helm chart so that all Kubernetes resources (deployments, services, secrets, configmaps) are created consistently and can be upgraded or uninstalled as a unit.

**Why this priority**: Helm is the standard packaging format for Kubernetes applications. A working Helm chart is the primary deliverable of Phase IV.

**Independent Test**: Run `helm install todo ./charts/todo-app -n todo-app` and verify all pods reach Running status.

**Acceptance Scenarios**:

1. **Given** container images are loaded into Minikube and the Helm chart exists at `/charts/todo-app/`, **When** I run `helm install todo ./charts/todo-app -n todo-app --set backend.env.DATABASE_URL=... --set backend.env.BETTER_AUTH_SECRET=...`, **Then** all deployments, services, configmaps, and secrets are created in the `todo-app` namespace
2. **Given** the Helm chart is installed, **When** I run `kubectl get pods -n todo-app`, **Then** `todo-frontend` and `todo-backend` pods show STATUS = Running and READY = 1/1
3. **Given** the Helm chart is installed, **When** I run `helm upgrade todo ./charts/todo-app -n todo-app --set backend.replicaCount=2`, **Then** the upgrade succeeds and the backend scales to 2 replicas
4. **Given** the Helm chart is installed, **When** I run `helm uninstall todo -n todo-app`, **Then** all resources are cleanly removed
5. **Given** the chart source, **When** I run `helm lint ./charts/todo-app`, **Then** linting passes with no errors
6. **Given** the chart source, **When** I run `helm template todo ./charts/todo-app --debug`, **Then** all templates render without errors

---

### User Story 4 - Access the Running Application (Priority: P4)

As a developer, I want to open the Todo Chatbot in my browser and verify it works end-to-end so that I can confirm the Kubernetes deployment is functionally correct.

**Why this priority**: Deployment is meaningless without verification. The application must be accessible and functional from the browser.

**Independent Test**: Open the frontend URL in a browser, send a chat message like "add task buy milk", and verify the task appears.

**Acceptance Scenarios**:

1. **Given** the Helm chart is installed and pods are Running, **When** I run `minikube service todo-frontend -n todo-app`, **Then** the browser opens to the frontend and the login page loads
2. **Given** the frontend is accessible, **When** I log in and send a chat message "add task buy groceries", **Then** the chatbot confirms the task was added
3. **Given** I have added a task, **When** I send "show my tasks", **Then** the chatbot lists the task I just added
4. **Given** all pods are running, **When** I check `kubectl get pods -n todo-app`, **Then** no pods show CrashLoopBackOff, ImagePullBackOff, or OOMKilled status

---

### User Story 5 - AI DevOps Tooling (Priority: P5)

As a developer, I want to use kubectl-ai and kagent to interact with my cluster using natural language so that I can experience AI-assisted Kubernetes operations.

**Why this priority**: AI tools are a learning objective of Phase IV but not blocking for deployment. The application must work without them.

**Independent Test**: Run a kubectl-ai command to generate a resource YAML and a kagent command to analyze cluster health.

**Acceptance Scenarios**:

1. **Given** kubectl-ai is installed, **When** I run `kubectl-ai "create a service for todo-backend on port 8000"`, **Then** kubectl-ai generates valid Kubernetes YAML
2. **Given** kagent is installed in the cluster, **When** I run `kagent "summarize my pods"`, **Then** kagent returns a summary of pod statuses in the `todo-app` namespace
3. **Given** a pod is in CrashLoopBackOff, **When** I run `kagent "analyze why todo-backend is crashing"`, **Then** kagent provides a root-cause analysis with suggested fix
4. **Given** kubectl-ai is unavailable or errors, **When** the fallback is needed, **Then** the equivalent plain `kubectl` command is documented and works

---

### Edge Cases

- What happens when Docker Desktop is not running? The setup guide MUST detect this and provide the exact fix (start Docker Desktop, wait 60 seconds, retry)
- What happens when WSL2 runs out of memory during `minikube start`? The guide MUST provide `.wslconfig` tuning instructions and `wsl --shutdown` recovery
- What happens when a local image is not found by Minikube? The guide MUST document `eval $(minikube docker-env)` or `minikube image load` workflows
- What happens when `helm install` fails due to missing required values? The error message MUST clearly indicate which `--set` values are required
- What happens when kubectl-ai or kagent is not installed? All AI tool usage MUST have a documented manual fallback
- What happens when the user re-runs `helm install` after a partial failure? The chart MUST be idempotent — `helm upgrade --install` MUST work safely

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide a Dockerfile for the frontend that produces a multi-stage image tagged `todo-frontend:local`
- **FR-002**: The system MUST provide a Dockerfile for the backend (including MCP server) that produces a multi-stage image tagged `todo-backend:local`
- **FR-003**: The system MUST provide a Helm chart at `/charts/todo-app/` containing deployments, services, configmaps, and secrets for all application components
- **FR-004**: The Helm chart MUST support `helm install`, `helm upgrade`, and `helm uninstall` as idempotent operations
- **FR-005**: The Helm chart MUST use `values.yaml` for all configurable parameters (image tags, replica counts, resource limits, environment variables)
- **FR-006**: Sensitive values (API keys, database credentials, JWT secrets) MUST be stored in Kubernetes Secret resources, never hardcoded in templates or default values
- **FR-007**: Every container MUST include liveness and readiness probes
- **FR-008**: Every container MUST have resource requests and limits appropriate for a local Minikube environment (requests: 64Mi-128Mi memory, 50m-100m CPU; limits: 256Mi-512Mi memory, 200m-500m CPU)
- **FR-009**: All Kubernetes resources MUST be deployed in the `todo-app` namespace
- **FR-010**: The system MUST provide a step-by-step setup guide (`README-phase4.md`) covering prerequisites, image building, cluster setup, Helm installation, application access, and AI tool usage
- **FR-011**: The setup guide MUST include a troubleshooting section for common Windows + WSL2 errors (Docker daemon not responding, signal:killed, PATH issues, ImagePullBackOff)
- **FR-012**: The system MUST provide a `.wslconfig` example file with recommended memory and CPU settings
- **FR-013**: The Helm chart MUST pass `helm lint` with zero errors
- **FR-014**: The Helm chart MUST render cleanly with `helm template --debug`
- **FR-015**: The frontend MUST be accessible via `minikube service` or port-forwarding after Helm installation
- **FR-016**: Every AI tool command (kubectl-ai, kagent, Gordon) MUST have a documented plain kubectl/helm/docker fallback

### Key Entities

- **Docker Image**: A containerized application artifact with a tag, built from a Dockerfile. Key attributes: name, tag, size, base image, exposed ports
- **Helm Chart**: A packaged Kubernetes application with templates, values, and metadata. Key attributes: chart name, version, appVersion, values schema
- **Kubernetes Deployment**: A set of replicated pods running a container image. Key attributes: name, namespace, replicas, image, probes, resources
- **Kubernetes Service**: A network endpoint exposing a deployment. Key attributes: name, type (ClusterIP/NodePort), port, target port
- **Kubernetes Secret**: An encrypted store for sensitive configuration. Key attributes: name, data keys (base64-encoded values)
- **Kubernetes ConfigMap**: A store for non-sensitive configuration. Key attributes: name, data keys (plain-text values)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A developer following the setup guide can go from zero to a running application in the browser within a single session, following documented steps only
- **SC-002**: The Minikube cluster starts on the first attempt with the documented commands (given Docker Desktop is running and `.wslconfig` is applied)
- **SC-003**: All application pods reach Running status within 3 minutes of `helm install`
- **SC-004**: The frontend loads in the browser and the chatbot responds to at least 3 natural language commands (add task, list tasks, complete task)
- **SC-005**: `helm install` and `helm upgrade` are safe to run multiple times without errors or resource conflicts
- **SC-006**: kubectl-ai produces valid, applicable YAML for at least one Kubernetes resource
- **SC-007**: kagent returns meaningful output for at least one cluster health query
- **SC-008**: Total resource consumption of all application pods stays under 2 GB memory and 2 CPU cores combined
- **SC-009**: The troubleshooting guide covers at least 5 common Windows + WSL2 error scenarios with exact fix commands

## Out of Scope

- Cloud deployment (EKS, GKE, AKS)
- Advanced observability (Prometheus, Grafana, Jaeger)
- CI/CD pipelines or GitHub Actions for container builds
- Persistent volumes backed by cloud storage
- Multi-node Minikube clusters
- TLS/HTTPS for local development
- Production-grade ingress controllers or certificate managers
- Container registry push (all images consumed locally)
