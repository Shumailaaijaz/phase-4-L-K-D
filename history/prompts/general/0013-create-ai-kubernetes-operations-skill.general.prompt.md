---
id: 0013
title: Create AI Kubernetes Operations Skill
stage: general
date: 2026-02-04
surface: agent
model: claude-opus-4-5-20251101
feature: none
branch: null
user: user
command: create skill
labels: ["kubectl-ai", "kagent", "kubernetes", "skill", "phase-4", "debugging", "minikube"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .claude/skills/ai-kubernetes-operations/SKILL.md
tests:
  - none
---

## Prompt

create skill AI Kubernetes Operation Skill # Skill: AI-assisted Kubernetes Operations (kubectl-ai / kagent)

## Purpose
Generate safe & effective kubectl-ai and kagent commands for local Minikube

## Inputs
- Desired action (deploy, scale, debug, analyze)
- Resource type (deployment, service, pod)
- Current cluster state

## Outputs
- Exact kubectl-ai prompt/command
- Expected YAML/result
- Plain kubectl equivalent
- Verification & debug steps

## Quality Standards
- Commands never destructive without confirmation
- Focus on observability (logs, describe, events)
- Use kagent for root cause analysis
- Keep resource usage low for local machine

## Response snapshot

Created skill at `.claude/skills/ai-kubernetes-operations/SKILL.md` with a 5-step procedure: classify action (deploy/scale/update/debug/analyze/delete with safety levels), generate kubectl-ai command (with prompt-engineering checklist), show expected annotated YAML, provide plain kubectl equivalent, and verification commands per category. Includes 4 debugging playbooks (CrashLoopBackOff, OOMKilled, ImagePullBackOff, Pending), kagent analysis command reference, Minikube resource budget table (300m/1500m CPU, 384Mi/1536Mi memory for 3 services), and safety guardrails table of forbidden commands. Complements the ai-devops-k8s agent persona without duplicating tone/style rules.

## Outcome

- ✅ Impact: New skill provides deterministic kubectl-ai/kagent command generation for Phase IV
- 🧪 Tests: none (skill definition, not code)
- 📁 Files: 1 created (.claude/skills/ai-kubernetes-operations/SKILL.md)
- 🔁 Next prompts: Test skill by running kubectl-ai against live Minikube cluster, integrate with helm-chart-generation skill
- 🧠 Reflection: Skill focuses on procedural steps, prompt engineering rules, and safety guardrails; agent file owns persona, tone, and communication style

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Add bundled reference file for kubectl-ai prompt templates by resource type
