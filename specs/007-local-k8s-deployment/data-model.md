# Data Model: Local Kubernetes Deployment

**Feature**: 007-local-k8s-deployment
**Date**: 2026-02-04

This feature does not introduce new application data models. Instead, the "data model" is the set of Kubernetes resources created by the Helm chart.

## Kubernetes Resource Model

### Deployments

#### todo-frontend
| Field | Value |
|-------|-------|
| Name | `{{ .Release.Name }}-frontend` |
| Namespace | `{{ .Release.Namespace }}` (default: todo-app) |
| Replicas | `{{ .Values.frontend.replicaCount }}` (default: 1) |
| Image | `{{ .Values.frontend.image.repository }}:{{ .Values.frontend.image.tag }}` |
| Pull Policy | `IfNotPresent` |
| Container Port | 3000 |
| Liveness Probe | HTTP GET `/` port 3000, initialDelay 10s, period 15s |
| Readiness Probe | HTTP GET `/` port 3000, initialDelay 5s, period 10s |
| Resources | requests: 100m CPU / 128Mi mem; limits: 500m CPU / 512Mi mem |

#### todo-backend
| Field | Value |
|-------|-------|
| Name | `{{ .Release.Name }}-backend` |
| Namespace | `{{ .Release.Namespace }}` (default: todo-app) |
| Replicas | `{{ .Values.backend.replicaCount }}` (default: 1) |
| Image | `{{ .Values.backend.image.repository }}:{{ .Values.backend.image.tag }}` |
| Pull Policy | `IfNotPresent` |
| Container Port | 8000 |
| Liveness Probe | HTTP GET `/health` port 8000, initialDelay 10s, period 15s |
| Readiness Probe | HTTP GET `/health` port 8000, initialDelay 5s, period 10s |
| Resources | requests: 100m CPU / 128Mi mem; limits: 500m CPU / 512Mi mem |
| Env From | SecretRef: `{{ .Release.Name }}-secrets`, ConfigMapRef: `{{ .Release.Name }}-config` |

### Services

#### todo-frontend
| Field | Value |
|-------|-------|
| Name | `{{ .Release.Name }}-frontend` |
| Type | NodePort |
| Port | 3000 |
| Target Port | 3000 |
| Node Port | 30080 (configurable) |
| Selector | `app.kubernetes.io/name: todo-app, app.kubernetes.io/component: frontend` |

#### todo-backend
| Field | Value |
|-------|-------|
| Name | `{{ .Release.Name }}-backend` |
| Type | ClusterIP |
| Port | 8000 |
| Target Port | 8000 |
| Selector | `app.kubernetes.io/name: todo-app, app.kubernetes.io/component: backend` |

### Secret: `{{ .Release.Name }}-secrets`

| Key | Source | Required |
|-----|--------|----------|
| DATABASE_URL | `values.backend.secrets.databaseUrl` | Yes |
| BETTER_AUTH_SECRET | `values.backend.secrets.betterAuthSecret` | Yes |
| OPENAI_API_KEY | `values.backend.secrets.openaiApiKey` | Yes |
| JWT_SECRET | `values.backend.secrets.jwtSecret` | Yes |
| GROQ_API_KEY | `values.backend.secrets.groqApiKey` | No |

### ConfigMap: `{{ .Release.Name }}-config`

| Key | Default Value |
|-----|---------------|
| ENVIRONMENT | production |
| CORS_ORIGINS | * |
| OPENAI_MODEL | gpt-4o-mini |
| GROQ_MODEL | llama-3.3-70b-versatile |

### Ingress (optional, disabled by default)

| Field | Value |
|-------|-------|
| Enabled | `values.ingress.enabled` (default: false) |
| Class | nginx |
| Host | `todo.local` |
| Rules | `/` → frontend:3000, `/api` → backend:8000 |

## Resource Budget Summary

| Component | CPU Request | CPU Limit | Mem Request | Mem Limit |
|-----------|-----------|----------|------------|----------|
| frontend | 100m | 500m | 128Mi | 512Mi |
| backend | 100m | 500m | 128Mi | 512Mi |
| **Total** | **200m** | **1000m** | **256Mi** | **1024Mi** |

Leaves ~3 GB for Kubernetes system components and OS overhead on a 4 GB WSL2 allocation.

## Label Schema

All resources use standard Kubernetes labels:

```yaml
app.kubernetes.io/name: todo-app
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/version: {{ .Chart.AppVersion }}
app.kubernetes.io/component: frontend | backend
app.kubernetes.io/managed-by: Helm
helm.sh/chart: {{ .Chart.Name }}-{{ .Chart.Version }}
```

Selectors use only immutable labels: `app.kubernetes.io/name` + `app.kubernetes.io/component`.
