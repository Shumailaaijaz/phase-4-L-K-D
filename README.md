# Phase IV – Local Kubernetes Deployment  
**Cloud-Native Todo AI Chatbot on Minikube**

https://youtube.com/shorts/rTgpD4lLWNk?si=Ox4Lz8p2XwoMzoTK

## Project Overview

Phase IV transforms the **Phase III Todo AI Chatbot** (natural language task manager using MCP + OpenAI Agents SDK) into a **cloud-native application** running locally on Kubernetes.

**Key Goals:**
- Containerize frontend (Next.js) and backend (FastAPI + MCP + Agent)
- Use **Docker Desktop + Gordon** (AI-assisted Docker) for building images
- Deploy using **Helm charts** (generated or written with AI help)
- Run a full local Kubernetes cluster with **Minikube**
- Leverage AI DevOps tools: **kubectl-ai** and **kagent** for intelligent operations
- Keep everything **stateless**, **reproducible**, and **easy to tear down**

This phase demonstrates modern cloud-native development practices — even in a local environment.

## Technology Stack – Phase IV

| Layer                | Technology                              | Purpose                                      |
|----------------------|-----------------------------------------|----------------------------------------------|
| Container Runtime    | Docker Desktop + Gordon (AI agent)      | Build & manage images intelligently          |
| Local Kubernetes     | Minikube (driver: docker)               | Single-node Kubernetes cluster               |
| Packaging            | Helm v3/v4                              | Package and deploy application as charts     |
| AI Kubernetes Ops    | kubectl-ai, kagent                      | Natural language → Kubernetes commands       |
| Application          | Phase III Todo Chatbot                  | Frontend (Next.js + ChatKit), Backend (FastAPI) |
| Database             | Neon PostgreSQL (or local Postgres)     | Persistent storage (via secrets/env)         |
| Authentication       | Better Auth                             | User sessions & email-based login            |

## Prerequisites

**Operating System:** Windows 10/11 with **WSL2 + Ubuntu** (recommended)

You must have:

- Windows 10/11 (with WSL2 enabled)
- Docker Desktop 4.53+ (with **Gordon** enabled if available in your region)
- WSL2 Ubuntu distro
- Git
- curl, wget, tar, unzip

## Quick Installation (WSL Ubuntu)

Run these commands inside your **WSL Ubuntu** terminal:

```bash
# 1. Update system & install basics
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git wget tar ca-certificates gnupg lsb-release

# 2. Minikube (latest stable)
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube

# 3. Helm (latest)
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# 4. kubectl-ai
curl -sSL https://raw.githubusercontent.com/GoogleCloudPlatform/kubectl-ai/main/install.sh | bash

# 5. kagent
curl -sSL https://raw.githubusercontent.com/kagent-dev/kagent/main/scripts/install.sh | bash

# 6. Set API keys (very important!)
export OPENAI_API_KEY=sk-........................................
# Optional: export GROK_API_KEY=... or GEMINI_API_KEY=...
Docker Desktop must be installed and running on Windows (not inside WSL).
Enable WSL integration in Docker Desktop → Settings → Resources → WSL Integration → Enable your Ubuntu distro.
Getting Started – Step by Step

Start local Kubernetes clusterBashminikube start --driver=docker --cpus=4 --memory=8192
# Recommended: 4 vCPUs + 8GB RAM for smooth experience
Enable useful addons (optional but helpful)Bashminikube addons enable ingress
minikube addons enable metrics-server
Build Docker images (using Gordon if available)Bash# With Gordon (AI-assisted)
docker ai "build a multi-stage Docker image for a Next.js frontend in ./frontend"
docker ai "build FastAPI backend image with uvicorn from ./backend"

# Or standard way
cd frontend && docker build -t todo-frontend:latest .
cd ../backend && docker build -t todo-backend:latest .
Load images into MinikubeBashminikube image load todo-frontend:latest
minikube image load todo-backend:latest
Deploy with HelmBash# If you have a Helm chart already
helm install todo-chatbot ./helm-chart/todo-chatbot \
  --set image.frontend.repository=todo-frontend \
  --set image.backend.repository=todo-backend \
  --set env.openaiApiKey=${OPENAI_API_KEY}Or use AI to generate/apply:Bashkubectl-ai "deploy a helm chart for todo chatbot frontend and backend with 1 replica each"
Access the applicationBashminikube service todo-chatbot-frontend --url
# or
minikube tunnel   # for ingress
Use AI tools to manageBash# Examples
kubectl-ai "scale the todo-backend deployment to 2 replicas"
kagent "analyze why pods might be crashing"
kagent "summarize cluster health and resource usage"

Project Structure (suggested)
textproject-root/
├── frontend/               # Next.js app + ChatKit
├── backend/                # FastAPI + MCP + Agent logic
├── helm-chart/             # Helm charts for deployment
│   └── todo-chatbot/
│       ├── Chart.yaml
│       ├── values.yaml
│       └── templates/
├── phase-iv/               # This README + docs
└── scripts/
    └── setup-minikube.sh
Useful Commands Cheat Sheet
Bash# Cluster management
minikube start --driver=docker
minikube stop
minikube delete   # nuclear option - start fresh

# Logs & debug
kubectl logs -f deployment/todo-backend
kubectl describe pod <pod-name>

# AI helpers
kubectl-ai "show me all pods in the todo namespace"
kagent "optimize resource requests and limits"
Teardown
Bashhelm uninstall todo-chatbot
minikube delete
Troubleshooting

Docker not found in WSL → Make sure Docker Desktop is running on Windows and WSL integration is enabled.
Minikube driver error → Use --driver=docker explicitly.
Gordon not available → Use normal docker build commands.
kubectl-ai / kagent errors → Check OPENAI_API_KEY is exported correctly.

Next Phase Ideas

Phase V: Cloud deployment (GKE / EKS / AKS)
GitHub Actions + ArgoCD for GitOps
Monitoring with Prometheus + Grafana
Real-time updates with WebSockets


Made with ❤️ in Karachi, Pakistan
Shumaila – February 2026

