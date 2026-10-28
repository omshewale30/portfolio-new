---
title: Heelper — AI Email Assistant
category: Agentic Workflow
year: '2025'
resultLine: Reduced manual email triage for the UNC Cashier's Office.
tags:
  - Agentic AI
  - Python
  - Automation
  - Human in the Loop
stats:
  - label: Workflow
    value: Email triage
  - label: Operating model
    value: Human + AI
images:
  - src: /assets/case-studies/heelper/Heelper.png
    alt: Heelper workflow for classifying, routing, and drafting responses to incoming email
    label: Workflow diagram
externalLink: https://heelper-frontend.nicedesert-a13116bc.eastus.azurecontainerapps.io/
---

# Summary

Heelper is an agentic workflow for high-volume inbound email at the UNC Cashier's Office. It classifies, routes, and drafts context-aware responses, with human review kept for consequential communication.

# Context

## High-volume email required repetitive manual triage

Cashier's Office staff repeatedly sorted inbound requests, identified the right workflow, and drafted responses before the underlying work could begin.

# Constraints

- Contextual accuracy
- Workflow integration
- Human review

# Approach

## The workflow was redesigned around intent

Heelper uses a Python automation backend and LLM orchestration to classify messages, route work, and draft context-aware responses inside the department's operating process.

## Decisions defended

- Automate the handoffs around the email, not just the reply
- Keep department-specific configuration explicit
- Preserve human review for consequential communication

# Results

## Triage became a configurable AI-assisted workflow

The system reduces manual triage and creates a repeatable foundation for department-specific automation rather than adding a standalone chat interface.
