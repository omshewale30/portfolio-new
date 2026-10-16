---
tier: essay
name: note002
title: "The Unreasonable Effectiveness of Boring Agent Infrastructure: Notes from AIE NYC 2026"
summary: A recap of AIE NYC and my thoughts on where AI engineering in 2026 is headed, grounded in enterprise deployments at UNC and minus the hype cycle.
tags: ["ai engineering", "conference", "aie nyc", "evals", "agents", "methodology"]
date: 2026-10-15
---


## What AIE NYC was

AI Engineer NYC was a technical conference held October 12–14, 2026, focused on agents in production: harnesses, managed agents, memory, evals and telemetry (all the fancy AI buzzwords you can imagine). And since it was in NYC, the problem and solution space was finance.
The speakers ranged from small startups to financial giants like Vanguard to frontier labs like Anthropic. 

The talks I liked were:
- Lance Martin (Anthropic), "Unhobbling the Frontier": boring yet highly effective methodologies like prompt audits, caching, eval design and hill climbing.
- "State of the Agent: Reliability, Observability, and the Gap Between Them" (telemetry the agent can consume).
- Daksh Gupta (Greptile), "How to build an AI code review agent" (Firecracker sandbox, PR webhook, model inversion).
- Evan Kormos (Coinbase), "Trusting Agents in Policy-Driven Workflows": look at any process you are trying to optimize as a directed acyclic graph.

This gathering of AI practitioners, industry veterans and ruthlessly ambitious people was as close to the bleeding edge of agent ideation and execution as it gets. Much of it is frontier tech still in beta, but that's what makes it exciting to come back to home base and selectively integrate a few of these "boring" yet "frontier" practices and tools into existing development workflows to improve efficiency, reduce operational drag and deliver more value per dollar. 

## The common thread: the AI engineering loop

Every conversation I had with speakers and fellow attendees revolved around how to "standardize" or solidify a pipeline to take a repeatable, measurable process and build an AI-first solution for it. The common conclusion was the AI engineering loop. The loop was mentioned in different flavors throughout the talks, for example, Langfuse's "AI engineering loop" workshop (trace → monitor → datasets → experiments → evaluate); Aparna Dhinakaran's (Arize AI) keynote "What does an AI engineer do?"; Lance Martin's talk on the eval/hill-climb cycle.

Being the good engineer I am, I never take anything at face value. The gap I see is in how we treat intermediate steps: we keep steering them toward human-readable output. It assumes the "redesigned" workflow already exists. In enterprise, decades of software were built with humans on both ends: forms, PDFs, email threads, spreadsheets.

Fun fact: Peter Drucker coined "knowledge worker" back in 1959, but Perplexity's CEO recently argued that Microsoft built the whole identity to sell more software. Hot take, not entirely wrong. Thesis: build the workflow around the agent, not the agent around the workflow.

So here are my two cents, a more "boring" AI engineering loop: **Map → Re-encode → Prove → Trace → Evaluate → Experiment → Monitor → (back to Map)**.

```diagram
ai-engineering-loop
```

This loop ties back to a principle from [my previous note on RAD](/notes/note001): it uses the same RAD economics (cheap exploration, prototype as baseline), but now the inputs and outputs are designed for the agent.

## Om's AI engineering loop

The UNC Finance & Operations AI (FO-AI) projects mentioned below are in development and testing. Here's the key for each project. Exciting news about these projects coming soon. 
- PIQ: An AI project inside Human Resources.
- CHAT: An institution-wide centralized AI chat platform.
- NIM: A shared platform for AI literacy and AI product visibility across the institution.

### 1. Map: find the human handoffs

- **What it means:** draw the process and mark every node where a human reads or writes something. 
- **From the conference:** Evan Kormos's (Coinbase) keynote: a process is a DAG; people, process, technology; policy-driven workflows; the "Stop Chatting With Spreadsheets" workshop. 
- **In practice:** PIQ started from the human artifacts: the official UNC position description Word form (one six-column table, label cell → value cell) and four PeopleSoft spreadsheet extracts. CHAT maps the customer service workflow. 

### 2. Re-encode: inputs and outputs, and any intermediate data transfer for the agent

- **What it means:** replace documents with structured contracts; the contract is where the deterministic shell lives (schemas, limits, separation of duties).
- **From the conference:** context = docs + tickets; RAG → memory systems (harness = memory + tools + security); knowledge plane / intelligence plane.
- **In practice:** PIQ's Pydantic schema, query embeddings and AI Search index catalog are what make it easy for an agent to produce good-quality intermediate steps; HR domain rules encoded in code (SHRA/EHRA fork, "duties are the foundation"); CHAT's scope classifier returns a strict JSON schema with a single label.

### 3. Prove: the proof of concept

- **What it means:** cheap exploration (RAD); separate read, draft and write from day one.
- **From the conference:** Claude Managed Agents (create an agent, an environment and a session, and the harness is handled for you); building blocks (harness, environment, tools, skills, credentials, schedule); code review agent build (Firecracker sandbox, PR webhook); Stagehand/Browserbase.
- **In practice:** PIQ's agent has read tools and *propose* tools only. The human applies, rejects or edits; HR classification fields can't be proposed at all. CHAT runs against a mock of UNC production for safe prototyping.

### 4. Trace: telemetry the agent can read

- **What it means:** one user action = one end-to-end trace, with cost and latency on every call.
- **From the conference:** Langfuse's proposed AI engineering loop for tracing, monitoring and evaluation; the future of telemetry is agent-consumable; telemetry signals as agent triggers.
- **In practice:** PIQ: OpenTelemetry spans for turn, LLM call, tool call, retrieval and gates, with cost, cached tokens and time-to-first-token on every call; no message bodies in production. CHAT's decision log is keyed by a pseudonym and never stores message text, so traces double as privacy-safe audit events. 
- **Future state:** Make PIQ's and CHAT's telemetry agent-readable so incidents are autonomously handled. 

### 5. Evaluate: representative cases and good eval design

- **What it means:** a dataset of representative cases and a pass bar you trust. Make the sample labeling process as smooth as possible for the domain experts. Good agent output relies heavily on the quality of "reference" cases it has. 
- **From the conference:** collect representative cases; human labeling for those representative cases; good eval design; model inversion (different author and reviewer models); Exa Snapshot (point-in-time web search, so an eval run today and next month sees the same web). 
- **In practice:** CHAT ran its gate in shadow mode: it flags messages as `would_block` but lets them through, and we hand-label a sample. It hit 89 of 91 correct. A label moves to enforce mode, where the gate really blocks the message, only once false blocks fall below 2% of all messages. PIQ runs each gate case five times because a small model isn't deterministic even at temperature 0.

### 6. Experiment: improve against evidence

- **What it means:** change one thing, measure against the eval, keep or revert.
- **From the conference:** prompt audits; prompt cache (strict prefix match = cost lever); hill climbing and overfitting; targeting specific bug types and skipping nitpicks.
- **In practice:** PIQ tiers models by job (large orchestrator, mini for rerank, nano for the gate) and keeps a stable prompt prefix so the orchestrator gets extended (up to 24h) cache retention. NIM fixed AI cost reading $0.00 by pricing cached tokens separately. Cost per completed task is the scoreboard.

### 7. Monitor: closing the loop

- **What it means:** production signals tell you what to fix next, and the answer goes back to Map.
- **From the conference:** telemetry signals as agent triggers; Claude Managed Agents (scheduled deployments, dashboard).
- **In practice:** PIQ's dev telemetry showed the classifier returned 0.9 confidence on every call, so its reject thresholds never filtered anything. Monitoring found a dead control. Shared CI/CD with health gates and auto-rollback; CHAT's gate rolls out shadow → enforce.


## Interesting take on vibe coding

One of the keynote speakers made a great point about vibe coding. If the product you are building is disposable software like a UI, intermediate dashboards, anything whose maintenance is unimportant or nearly free, go ahead and let Claude handle the development end to end. 

However, if it's durable software, you simply cannot afford to let an agent handle it end to end. Here's what makes software durable:
- Depended on by more than 1,000 users
- Failure has major consequences
- Requires continuous maintenance

How to make durability dead simple:
1. Standardization.
2. Make testing easier.
3. Be super strict.
4. Make the monitoring-to-evaluation loop autonomous.

## Where we're headed

Last year, the hot topic was agents. This year and going forward the focus is going to be on building things that agents can consume and handle the downstream tasks in your DAG. The majority of the booths at the expo provided solutions for processing pre-agent data, agent performance data or agent output. 

The shift towards building powerful tools for the agents tells us one thing: the models themselves are a commodity. What really moves the needle is how you nestle that model into your own harness so the agent does what it's supposed to do and nothing that it's not. 

More and more developers are moving away from editors like VS Code and towards using the terminal as their primary interface for development. Personally, I shifted to the terminal a few months ago and the results are great. Interacting directly with a coding agent is more productive: you handle the intent and review, and the agent handles the nitty-gritty parts of the process. 

My prediction: last year everyone built agents. Next year everyone builds for them.

