---
id: 0011
title: Create Minikube Local Cluster Setup Skill
stage: general
date: 2026-02-04
surface: agent
model: claude-opus-4-5-20251101
feature: none
branch: null
user: user
command: create skill
labels: ["minikube", "kubernetes", "skill", "phase-4", "docker", "wsl2"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .claude/skills/minikube-local-cluster-setup/SKILL.md
tests:
  - none
---

## Prompt

create skills MINIKUBE local cluster setup skill # Skill: Minikube Local Cluster Setup

## Purpose
Reliably start a Minikube cluster with docker driver on Windows + WSL2 + Docker Desktop

## Inputs
- Host OS (Windows 10/11)
- WSL version (2)
- Docker Desktop status (running or not)
- Available RAM

## Outputs
- Exact sequence of commands
- Troubleshooting path for common errors
- Verification commands

## Quality Standards
- Prefer Windows PowerShell execution first
- Include .wslconfig memory tuning
- Always clean old cluster with minikube delete --all --purge when needed
- Verify with minikube status & kubectl get nodes

## Response snapshot

Created skill at `.claude/skills/minikube-local-cluster-setup/SKILL.md` with a 5-phase procedure: prerequisite checks, WSL2 resource tuning (.wslconfig), clean old state, cluster start with `--driver=docker`, and full verification chain (minikube status, kubectl cluster-info, kubectl get nodes, kubectl get pods -A, docker-env). Includes troubleshooting table for 6 common errors and post-setup addon enablement (ingress, metrics-server, dashboard). Skill is referenced by minikube-docker-setup, helm-chart-creator, and ai-devops-k8s agents.

## Outcome

- ✅ Impact: New skill enables deterministic Minikube cluster setup for Phase IV
- 🧪 Tests: none (skill definition, not code)
- 📁 Files: 1 created (.claude/skills/minikube-local-cluster-setup/SKILL.md)
- 🔁 Next prompts: Test skill by running minikube setup, create Helm chart skill, create Dockerfile skills
- 🧠 Reflection: Skill follows existing format (deployment-extension pattern) and complements the minikube-docker-setup agent

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Add bundled scripts for automated prerequisite checking
