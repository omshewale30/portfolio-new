---
tier: essay
name: note001
title: "RAD's Resurrection: Why a 20th-Century Method Still Matters in the Age of AI Slop"
summary: A short essay on the first-principles software development methodology that prioritizes speed, evidence, and iteration.
tags: ["software development", "methodology" ]
date: 2026-08-23
---

## Context

In 1991, James Martin published a 788-page book promising the rapid construction of information-system applications “essential for large enterprises” using the development software already available.

The claim sounds as if it were written for today’s coding agents. Back to the future kind of stuff

Why does that late-20th-century development philosophy seem so relevant today?

It is tempting to say that we finally have tools Martin’s generation did not have, but that is only partly true. RAD already relied on CASE tools, fourth-generation languages, code generators, reusable components, and visual application builders. What we have today is a much more powerful combination: general-purpose coding agents, cloud infrastructure, mature open-source frameworks, APIs, automated testing, and continuous delivery.

That advantage is cheap exploration. A small team can explore several implementations in parallel—i.e., AI psychosis cranked up to the max, jk :)—and discard weak options without treating the discarded code as a major sunk cost. Until the advent of coding agents, the cost of producing code was high. Remember the days when you had to handwrite code and switch between vague Stack Overflow articles just to get a simple login flow working?

But today, the cost of producing code is trivial, which lets us implement RAD and embrace the speed and fast iteration which is core of this methodology (Generating code is cheap. Owning code is not — more on that in a bit.)

What are the core principles of RAD?

- lightweight initial planning
- timeboxing
- intensive user participation
- evolutionary prototyping
- iterative construction
- Using that prototype as the baseline for prod

That last one is the principle I keep chewing on. Once you have a satisfactory pilot, why not promote it to be the production baseline instead of starting fresh in another worktree? It needs hardening first, of course — your password-reset link shouldn't display the user's current password.

And here's the thesis of this whole essay: the most important consequence of coding agents is not fewer keystrokes. It is a lower cost of changing your mind after seeing evidence. That is the economic heart of RAD.

## What is the lifecycle of RAD?
1. **Requirements planning.** Define the business problem, intended users, essential capabilities, major constraints, integrations, and success criteria. Do enough analysis to start intelligently, but do not pretend every requirement can be known in advance.
2. **User design.** Users and builders work together through workshops, mockups, workflow simulations, and increasingly functional prototypes. Requirements are discovered by interaction rather than only by documentation.
3. **Construction.** A small, skilled team builds in short cycles using reusable components and automation. Testing and feedback occur throughout, not as a separate final event.
4. **Cutover.** The team completes production testing, data conversion, deployment, training, and transition to operations.


## RAD is also not “vibe coding.”
Vibe coding starts from the convenience of generating code. RAD starts from a disciplined feedback relationship with users and a business outcome. Fast code without users, timeboxes, prioritization, testing, or cutover discipline is not RAD.

You can build a state-of-the-art product with IP-hashed rate limiting and 23 subagents running in the background to deliver “data-driven insights.” But if it has zero users—or its insights have no effect on a real decision—you have built a technically impressive solution to an imaginary problem.

Business outcomes and user preferences must be baked into the design process, not added after the product is supposedly finished.

## Relentless speed from problem definition to MVP to Prod - my philosophy behind product and business implementation.

A mentor once told me, “Show, don’t tell.” The same principle applies to almost every fancy AI idea.

RAD pushes you to turn a rough PRD — or even just a starting point, since agentic systems lower the bar for how polished the upfront spec has to be — into an MVP that executives, leadership, and users can see and interact with.

AI ideas all sound like magic solutions. But if this magic solution never makes it out of the concept phase, the next AI idea — the one that really could have been magic — never makes it to a concept phase. Move fast enough, push out enough MVPs, and you learn what works and what doesn't; next time, that dead-end path is already pruned from your design space.

As Corita Kent put it:

> Nothing is a mistake. There is no win and no fail. There is only MAKE.

I would add one enterprise qualification: make, measure, and learn. Otherwise, relentless making can become an efficient way to accumulate abandoned applications.

## Bottleneck shift
AI does not remove RAD’s historical constraints. It **moves the bottleneck** from code production toward problem selection, user attention, data access, architecture, validation, security, integration, and operational ownership. AI can also produce defects and technical debt faster than a team can review them; I can tell you that technical debt is a real problem. The right enterprise model is therefore **guardrailed RAD**

When construction becomes cheaper, the scarcest resources become:

- a well-framed problem;
- authoritative data and integration contracts;
- human review and validation;
- security, privacy, accessibility, and records obligations;
- production ownership and support capacity; and
- trustworthy measurement of whether the application improved the work—the business-use-case cornerstone.

## Om's guardrailed RAD approach in enterprise AI native Applications

### Using a deterministic shell around a probabilistic component
I am a big proponent of separation of implementation. As they say, if you have an AI hammer, every problem looks like a nail. Let the model interpret, summarize, classify, propose, and explain. Let deterministic code enforce permissions, dollar limits, schemas, calculations, separation of duties, and transaction state.

For example, an agent may draft a journal-entry description and propose accounts based on policy and prior examples. A deterministic service validates that the period is open, accounts are valid, debits equal credits, required documentation exists, the user has authority, and the preparer is not the final approver. The system of record—not the model—commits the entry.

This separation is what buys reliability, security, and durability at enterprise scale. If users find the output untrustworthy, adoption takes a hit — and the cultural change the organization badly needs loses traction right along with it. No trust, no transformation.


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

## What "hardening the pilot" actually means
Promoting a pilot to the prod baseline is only honest if hardening is a checklist, not a vibe: authentication and authorization reviewed, error paths handled, secrets rotated out of the prototype, accessibility checked, observability wired in, data migration rehearsed, and a named owner on the hook for support. If the pilot can't clear that list, it's a demo, not a baseline.

## How do we know the output translates to business value?
Evaluation-based loops are an adapter on the RAD lifecycle. I think of them as the last mile: the evaluation-and-feedback mechanism is the final quality gate before a pilot moves to prod, so the product delivers the measurable outcomes it promised. After all, it's inputs and outputs.

### 3 classes of metrics I think cover most of the bases, not generated lines of code.

**Business outcome:** errors, dollars recovered or avoided, and user effort.

**Quality and operations:** defects, incidents, accessibility findings, security findings, uptime, support burden, and maintenance cost.

**AI behavior:** task success, groundedness/citation validity, tool-call correctness, overrides, escalations, policy violations, drift, latency, and cost per completed task.

Did you notice I have cost in each of the three classes of metrics? That's deliberate. I treat an AI project as a resource-allocation decision, not a cost center — and if it can't show a return against what it consumes, there's no business case for letting it run past the pilot.

## My two cents
The return of RAD is therefore not a return to speed for its own sake. It is a shift from treating code as the scarce asset to treating attention, evidence, and trust as scarce assets.

Coding agents can make a pilot finance application appear in days. Only users, stewards, engineers, and accountable owners can determine whether it is correct, lawful, accessible, supportable, and worth promoting to prod.

The enterprise advantage will belong to organizations that make experimentation cheap without making responsibility optional.
