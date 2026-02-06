# Helm Values Schema: todo-app

**Feature**: 007-local-k8s-deployment
**Date**: 2026-02-04

This document defines the complete `values.yaml` contract for the todo-app Helm chart.

## Top-Level Structure

```yaml
global:           # Global settings
frontend:         # Frontend deployment configuration
backend:          # Backend deployment configuration
ingress:          # Ingress configuration (disabled by default)
```

## global

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `global.namespace` | string | `todo-app` | Target Kubernetes namespace |

## frontend

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `frontend.replicaCount` | int | `1` | Number of frontend pod replicas |
| `frontend.image.repository` | string | `todo-frontend` | Container image name |
| `frontend.image.tag` | string | `local` | Container image tag |
| `frontend.image.pullPolicy` | string | `IfNotPresent` | Image pull policy |
| `frontend.service.type` | string | `NodePort` | Service type |
| `frontend.service.port` | int | `3000` | Service port |
| `frontend.service.nodePort` | int | `30080` | NodePort (when type=NodePort) |
| `frontend.resources.requests.cpu` | string | `100m` | CPU request |
| `frontend.resources.requests.memory` | string | `128Mi` | Memory request |
| `frontend.resources.limits.cpu` | string | `500m` | CPU limit |
| `frontend.resources.limits.memory` | string | `512Mi` | Memory limit |
| `frontend.probes.liveness.path` | string | `/` | Liveness probe path |
| `frontend.probes.liveness.initialDelaySeconds` | int | `10` | Liveness initial delay |
| `frontend.probes.liveness.periodSeconds` | int | `15` | Liveness period |
| `frontend.probes.readiness.path` | string | `/` | Readiness probe path |
| `frontend.probes.readiness.initialDelaySeconds` | int | `5` | Readiness initial delay |
| `frontend.probes.readiness.periodSeconds` | int | `10` | Readiness period |

## backend

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `backend.replicaCount` | int | `1` | Number of backend pod replicas |
| `backend.image.repository` | string | `todo-backend` | Container image name |
| `backend.image.tag` | string | `local` | Container image tag |
| `backend.image.pullPolicy` | string | `IfNotPresent` | Image pull policy |
| `backend.service.type` | string | `ClusterIP` | Service type |
| `backend.service.port` | int | `8000` | Service port |
| `backend.resources.requests.cpu` | string | `100m` | CPU request |
| `backend.resources.requests.memory` | string | `128Mi` | Memory request |
| `backend.resources.limits.cpu` | string | `500m` | CPU limit |
| `backend.resources.limits.memory` | string | `512Mi` | Memory limit |
| `backend.probes.liveness.path` | string | `/health` | Liveness probe path |
| `backend.probes.liveness.initialDelaySeconds` | int | `10` | Liveness initial delay |
| `backend.probes.liveness.periodSeconds` | int | `15` | Liveness period |
| `backend.probes.readiness.path` | string | `/health` | Readiness probe path |
| `backend.probes.readiness.initialDelaySeconds` | int | `5` | Readiness initial delay |
| `backend.probes.readiness.periodSeconds` | int | `10` | Readiness period |
| `backend.secrets.databaseUrl` | string | `""` | **REQUIRED** — Neon PostgreSQL connection string |
| `backend.secrets.betterAuthSecret` | string | `""` | **REQUIRED** — JWT signing secret |
| `backend.secrets.openaiApiKey` | string | `""` | **REQUIRED** — OpenAI API key |
| `backend.secrets.jwtSecret` | string | `""` | **REQUIRED** — JWT secret |
| `backend.secrets.groqApiKey` | string | `""` | Optional — Groq API key |
| `backend.config.environment` | string | `production` | App environment |
| `backend.config.corsOrigins` | string | `*` | CORS allowed origins |
| `backend.config.openaiModel` | string | `gpt-4o-mini` | OpenAI model name |
| `backend.config.groqModel` | string | `llama-3.3-70b-versatile` | Groq model name |

## ingress

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `ingress.enabled` | bool | `false` | Enable ingress resource |
| `ingress.className` | string | `nginx` | Ingress class name |
| `ingress.hosts[0].host` | string | `todo.local` | Ingress hostname |
| `ingress.tls` | list | `[]` | TLS configuration (empty = no TLS) |

## Required Values for Installation

These values have empty defaults and MUST be provided via `--set` or a values override file:

```bash
helm install todo ./charts/todo-app -n todo-app \
  --set backend.secrets.databaseUrl="postgresql://..." \
  --set backend.secrets.betterAuthSecret="your-secret" \
  --set backend.secrets.openaiApiKey="sk-..." \
  --set backend.secrets.jwtSecret="your-jwt-secret"
```
