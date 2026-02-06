# Quickstart: Local Kubernetes Deployment

**Feature**: 007-local-k8s-deployment
**Date**: 2026-02-04

## Prerequisites

- Windows 10/11 with WSL2 Ubuntu
- Docker Desktop installed and running (WSL2 integration enabled)
- At least 8 GB RAM on host machine

## Step 1: Tune WSL2 Resources

Create `C:\Users\<username>\.wslconfig`:
```ini
[wsl2]
memory=4GB
processors=2
swap=2GB
```

Restart WSL:
```powershell
# Windows PowerShell
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
# WSL Ubuntu terminal (Docker Desktop must be running)

# Frontend
docker build -t todo-frontend:local ./frontend

# Backend
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
# Load images into Minikube
minikube image load todo-frontend:local
minikube image load todo-backend:local
```

## Step 5: Deploy with Helm

```bash
# Create namespace
kubectl create namespace todo-app --dry-run=client -o yaml | kubectl apply -f -

# Install (replace values with your actual credentials)
helm install todo ./charts/todo-app \
  --namespace todo-app \
  --set backend.secrets.databaseUrl="postgresql://user:pass@host/db" \
  --set backend.secrets.betterAuthSecret="your-secret" \
  --set backend.secrets.openaiApiKey="sk-your-key" \
  --set backend.secrets.jwtSecret="your-jwt-secret"

# Verify
kubectl get pods -n todo-app
```

## Step 6: Access the App

```bash
minikube service todo-frontend -n todo-app
```

This opens your browser to the Todo Chatbot frontend.

## Step 7: Cleanup

```bash
helm uninstall todo -n todo-app
minikube stop
```

## Troubleshooting

| Error | Fix |
|-------|-----|
| Docker not running | Start Docker Desktop, wait 60s, retry |
| signal: killed | Increase .wslconfig memory, `wsl --shutdown`, retry |
| ImagePullBackOff | Run `minikube image load <image>` |
| Pods not starting | Check: `kubectl describe pod <name> -n todo-app` |
| Helm install fails | Run: `helm template todo ./charts/todo-app --debug` |
