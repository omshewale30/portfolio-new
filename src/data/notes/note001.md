---
tier: essay
name: note001
title: How a late 20th century software development methodoly is ever relevant in this age where the AI slop index is on a bull run?
summary: A short essay on the first principles and age old methodoly of software development that prioritizes speed, and iteration.
tags: ["software development", "methodology" ]
date: 2026-08-23
---


# RAD's ressurection: Why the 20th century methodolgy is ever relevant in this age where the AI slop index is on a bull run?

The methodoolgy being talked about throughout this essay is the Rapid Application Development (RAD) methodoly which was formalized by James Martin in his book Rapid Application Development in 1991. 

A small team can explore several implementations in parallel and discard weak options without treating the discarded code as a major sunk cost.




- lightweight initial planning, timeboxing, intensive user participation, evolutionary prototyping, component reuse, iterative construction, continuous testing, and a short transition to production.



### What is the lifecyle  of RAD?
1. **Requirements planning.** Define the business problem, intended users, essential capabilities, major constraints, integrations, and success criteria. Do enough analysis to start intelligently, but do not pretend every requirement can be known in advance.
2. **User design.** Users and builders work together through workshops, mockups, workflow simulations, and increasingly functional prototypes. Requirements are discovered by interaction rather than only by documentation.
3. **Construction.** A small, skilled team builds in short cycles using reusable components and automation. Testing and feedback occur throughout, not as a separate final event.
4. **Cutover.** The team completes production testing, data conversion, deployment, training, and transition to operations.


### Vibe coding and RAD
RAD is also not “vibe coding.” Vibe coding starts from the convenience of generating code. RAD starts from a disciplined feedback relationship with users and a business outcome. Fast code without users, timeboxes, prioritization, testing, or cutover discipline is not RAD.

## The most important consequence is not fewer keystrokes. It is a lower cost of **changing one’s mind after seeing evidence**. That is the economic heart of RAD.


### Bottleneck shift
But AI does not remove RAD’s historical constraints. It **moves the bottleneck** from code production toward problem selection, user attention, data access, architecture, validation, security, integration, and operational ownership. AI can also produce defects and technical debt faster than a team can review them. The right enterprise model is therefore **guardrailed RAD**
When construction becomes cheaper, the scarcest resources become:

- a well-framed problem;
- reliable access to users and process owners;
- authoritative data and integration contracts;
- decisions about competing requirements;
- human review and validation;
- security, privacy, accessibility, and records obligations;
- production ownership and support capacity; and
- trustworthy measurement of whether the application improved the work.


## How does that help in enterprise AI native Applications?

#### Using a deterministic shell around a probabilistic component
I am a big proposent of separation of implementation. As they say, if you have an AI hammer, every problem looks like a nail. Let the model interpret, summarize, classify, propose, and explain. Let deterministic code enforce permissions, dollar limits, schemas, calculations, separation of duties, and transaction state. 

For example, an agent may draft a journal-entry description and propose accounts based on policy and prior examples. A deterministic service validates that the period is open, accounts are valid, debits equal credits, required documentation exists, the user has authority, and the preparer is not the final approver. The system of record—not the model—commits the entry.

This separation ensures reliability, security and durability for an enterprise level impelmentation, because if users find the output untrustworthy or incorrect, the adoption takes a hit and the culture will suffer.


### Separate the agent from systems of record

A defensible architecture has these layers:

1. **User workflow:** the interface, case, task, and explanation.
2. **Policy and approval layer:** deterministic rules, thresholds, and human approvals.
3. **Agent orchestrator:** plans a bounded task and chooses from allowed tools.
4. **Model gateway:** approved providers/models, retention settings, rate limits, version control, and routing.
5. **Retrieval layer:** authoritative, access-filtered sources with citations and document versions.
6. **Tool layer:** typed, allowlisted operations using short-lived, task-scoped credentials.
7. **Systems of record:** ConnectCarolina or other authoritative enterprise services, reached through controlled APIs.
8. **Evaluation and observability:** end-to-end traces, audit events, cost, latency, quality, security signals, and outcome measures.

The model must never inherit the full authority of the human user by default. A read operation, a draft operation, and an irreversible write should use different tools and different credentials.

### How do we make sure the output of the product is accurate or translates to business value? 
Evaluation based loops, a adapter on the RAD lifecycle. I like to think of the last mile, the evaluation and feedback mechanism, as the final quality gate before we move pilots to prod so the product delivers results as intended and measurable outcomes. After all, its inputs and outputs.

#### three classes of metrics I think cover most of the bases, not generated lines of code. 
**Business outcome:** errors, dollars recovered or avoided, and user effort.

**Quality and operations:** defects, incidents, accessibility findings, security findings, uptime, support burden, and maintenance cost.

**AI behavior:** task success, groundedness/citation validity, tool-call correctness, overrides, escalations, policy violations, drift, latency, and cost per completed task.

Did you notice I have cost in each of the three classes of metrics? Because I view any AI project as a resource allocation and not a cost center, because if its a cost center, it does not make any business sense to let it run beyond a pilot.
