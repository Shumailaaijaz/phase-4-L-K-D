# Phase IV: Local Kubernetes Deployment

Deploy the Todo AI Chatbot on a local Minikube cluster using Docker Desktop, Helm, and AI DevOps tools.

## Prerequisites

- Windows 10/11 with WSL2 Ubuntu
- Docker Desktop installed and running (WSL2 integration enabled)
- At least 8 GB RAM on host machine
- Tools: `minikube`, `helm`, `kubectl` (installed in WSL Ubuntu)

## Step 1: Tune WSL2 Resources

Create `C:\Users\<username>\.wslconfig`:

```ini
[wsl2]
memory=4GB
processors=2
swap=2GB
```

Restart WSL (PowerShell):

```powershell
wsl --shutdown
```

## Step 2: Install Tools

```bash
# WSL Ubuntu terminal

# Minikube
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube

# Helm
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# Verify
minikube version
helm version
kubectl version --client
```

## Step 3: Build Docker Images

```bash
# WSL Ubuntu terminal (from project root)

# Frontend (3-stage build, ~223 MB)
docker build -t todo-frontend:local ./frontend

# Backend (2-stage build, ~346 MB)
docker build -t todo-backend:local ./backend

# Verify
docker images | grep todo-
```

## Step 4: Start Minikube

```powershell
# Windows PowerShell (preferred)
minikube start --driver=docker --memory=3072 --cpus=2
```

```bash
# WSL Ubuntu: Load images into Minikube
minikube image load todo-frontend:local
minikube image load todo-backend:local

# Verify images loaded
minikube image ls | grep todo-
```

## Step 5: Deploy with Helm

```bash
# Create namespace
kubectl create namespace todo-app --dry-run=client -o yaml | kubectl apply -f -

# Install chart (replace with your actual credentials)
helm install todo ./charts/todo-app \
  --namespace todo-app \
  --set backend.secrets.databaseUrl="postgresql://user:pass@host/db" \
  --set backend.secrets.betterAuthSecret="your-secret" \
  --set backend.secrets.openaiApiKey="sk-your-key" \
  --set backend.secrets.jwtSecret="your-jwt-secret"

# Verify pods are running
kubectl get pods -n todo-app

# Upgrade (safe to run multiple times)
helm upgrade todo ./charts/todo-app \
  --namespace todo-app \
  --set backend.secrets.databaseUrl="postgresql://user:pass@host/db" \
  --set backend.secrets.betterAuthSecret="your-secret" \
  --set backend.secrets.openaiApiKey="sk-your-key" \
  --set backend.secrets.jwtSecret="your-jwt-secret"
```

## Step 6: Access the Application

```bash
minikube service todo-todo-app-frontend -n todo-app
```

This opens your browser to the Todo Chatbot frontend.

## Step 7: AI DevOps Tools

### Gordon (Docker AI)

```bash
docker ai "What can you do?"
docker ai version
```

### kubectl-ai

```bash
# Install
go install github.com/GoogleCloudPlatform/kubectl-ai@latest

# Generate resource YAML
kubectl-ai "create a deployment for todo-backend with 2 replicas"

# Plain kubectl fallback:
kubectl scale deployment todo-todo-app-backend --replicas=2 -n todo-app
```

### kagent

```bash
# Install via Helm
helm install kagent kagent/kagent --set profile=demo

# Analyze cluster
kagent "summarize my pods in todo-app namespace"

# Plain kubectl fallback:
kubectl get pods -n todo-app -o wide
kubectl describe pods -n todo-app
```

## Step 8: Cleanup

```bash
helm uninstall todo -n todo-app
minikube stop

# Full cleanup (removes cluster entirely)
# WARNING: This deletes all cluster data
minikube delete
```

## Troubleshooting

| # | Error | Cause | Fix |
|---|-------|-------|-----|
| 1 | Docker daemon not running | Docker Desktop not started | Start Docker Desktop from Windows Start menu, wait 60 seconds, then retry |
| 2 | `signal: killed` during minikube start | WSL2 running out of memory | Add `.wslconfig` with `memory=4GB`, then `wsl --shutdown` from PowerShell and retry |
| 3 | `ImagePullBackOff` on pods | Local images not loaded into Minikube | Run `minikube image load todo-frontend:local` and `minikube image load todo-backend:local` |
| 4 | `helm install` fails with missing values | Required secrets not provided | Add `--set` flags for all 4 required secrets (databaseUrl, betterAuthSecret, openaiApiKey, jwtSecret) |
| 5 | Pod `CrashLoopBackOff` | Application error (bad env vars, DB unreachable) | Check logs: `kubectl logs <pod-name> -n todo-app`. Verify DATABASE_URL is correct and accessible. |
| 6 | `exec format error` during docker pull | Docker credential helper mismatch in WSL | Edit `~/.docker/config.json`: set `"credsStore": ""` instead of `"desktop.exe"` |
| 7 | `PROVIDER_DOCKER_NOT_RUNNING` from minikube | Docker socket not available | Start Docker Desktop, wait for green icon, then retry `minikube start` |
| 8 | `NodePort 30080 already in use` | Another service using that port | Change `frontend.service.nodePort` in values.yaml or use `--set frontend.service.nodePort=30081` |

## Chart Structure

```
charts/todo-app/
├── Chart.yaml              # Chart metadata
├── values.yaml             # Default configuration
├── .helmignore             # Files to ignore during packaging
└── templates/
    ├── _helpers.tpl         # Template helper functions
    ├── frontend-deployment.yaml
    ├── frontend-service.yaml
    ├── backend-deployment.yaml
    ├── backend-service.yaml
    ├── configmap.yaml       # Non-sensitive config
    ├── secret.yaml          # Sensitive config (API keys, DB URL)
    ├── ingress.yaml         # Optional ingress (disabled by default)
    ├── NOTES.txt            # Post-install instructions
    └── tests/
        └── test-connection.yaml  # Helm test
```
