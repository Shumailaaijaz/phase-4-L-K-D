---
id: 0012
title: Create Helm Chart Generation Skill
stage: general
date: 2026-02-04
surface: agent
model: claude-opus-4-5-20251101
feature: none
branch: null
user: user
command: create skill
labels: ["helm", "kubernetes", "skill", "phase-4", "chart", "deployment"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .claude/skills/helm-chart-generation/SKILL.md
tests:
  - none
---

## Prompt

create skill Helm Chart Generation Skill # Skill: Helm Chart Generation for Todo Chatbot

## Purpose
Create standard Helm chart for Phase III Todo application (frontend, backend, MCP)

## Inputs
- Application components (frontend, backend, mcp-server)
- Container images & tags
- Exposed ports
- Environment variables needed
- Persistence requirements (PostgreSQL)

## Outputs
- Chart.yaml
- values.yaml (with sane defaults)
- templates/ folder (deployment, service, ingress, configmap)
- Installation & upgrade commands

## Quality Standards
- Follow Helm best practices 2024+
- Include probes (liveness/readiness)
- Resource requests/limits suitable for local
- Namespace support
- Easy to override via --set or values file

## Response snapshot

Created skill at `.claude/skills/helm-chart-generation/SKILL.md` with an 11-step procedure covering: input gathering, chart scaffolding, Chart.yaml, values.yaml (per-service keys with inline comments), _helpers.tpl named templates, per-service deployment/service templates, Secret and ConfigMap generation, NOTES.txt, helm lint/template validation, and full install/upgrade/uninstall commands. values.yaml includes three services (backend port 8000, frontend port 3000/NodePort 30080, MCP port 8001) with resource limits sized for Minikube (100m-500m CPU, 128Mi-512Mi memory). Complements the helm-chart-creator agent without duplicating its persona definition.

## Outcome

- ✅ Impact: New skill provides deterministic Helm chart generation procedure for Phase IV
- 🧪 Tests: none (skill definition, not code)
- 📁 Files: 1 created (.claude/skills/helm-chart-generation/SKILL.md)
- 🔁 Next prompts: Generate actual Helm chart files, create AI DevOps kubectl-ai skill, test chart with minikube
- 🧠 Reflection: Skill body focuses on procedural steps and values.yaml structure; agent file handles persona and edge-case handling

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Add bundled asset for values.yaml template to avoid regenerating boilerplate
