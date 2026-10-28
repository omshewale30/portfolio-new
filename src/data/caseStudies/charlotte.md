---
title: Charlotte — Enterprise AI Platform
category: Enterprise AI
date: '2025-11-11'
pinned: true
resultLine: Projected to eliminate 200+ hours of manual research a year.
tags:
  - RAG
  - Azure OpenAI
  - Python
  - Data Governance
stats:
  - label: Manual hours eliminated / yr
    value: 200+
  - label: Policy corpus
    value: ~600 pages
images:
  - src: /assets/case-studies/charlotte/Charlotte.png
    alt: Charlotte retrieval pipeline from a staff question through grounded source retrieval
    label: Architecture diagram
externalLink: https://charlotte-frontend.azurewebsites.net/
---

# Summary

Charlotte gives UNC operational teams a consistent way to query operational knowledge. It's a production RAG system that turns policy manuals (~600 pages), EDI reports, and transaction data into grounded answers.

# Context

## Answers were buried in fragmented operational data

Staff manually searched policy manuals, EDI reports, and transaction records to answer routine financial questions across the Cashier's Office, Campus Health, and Accounting.

# Constraints

- UNC ITS compliance review
- Data governance
- Azure deployment

# Approach

## A governed retrieval workflow, not a generic chatbot

Charlotte combines vector retrieval, Azure OpenAI, and source-grounded responses in a system designed around UNC's compliance, deployment, and data-governance requirements.

## Decisions defended

- Ground answers in approved internal documents
- Keep retrieval and citations visible
- Design for multiple operational departments

# Results

## Instant retrieval replaced recurring manual research

The deployed workflow is projected to eliminate more than 200 hours of manual research each year while giving teams a consistent way to query operational knowledge.
