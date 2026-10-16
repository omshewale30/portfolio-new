---
tier: essay
name: note002
title: "The Unreasonable Effectiveness of Boring Agent Infrastructure: Notes from AIE 2026"
summary: A recap of AIE NYC and my thoughts on where AI engineering in 2026 is headed, grounded in enterprise deployments at UNC and minus the hype cycle.
tags: ["ai engineering", "conference", "aie-nyc", "evals", "agents", "methodology"]
date: 2026-10-15
---


## What AIE NYC was

AI Engineer NYC was a technical conference held during 11-14th Oct 2026 with the main focus being agents in production: harnesses, managed agents, memory, evals, telemetry: all the fancy AI buzzwords you can imagine. And the venue being in NYC, the theme of the problem and solution space was finance.
The speakers were wide ranging from small startups to big financial giants like Vanguard to the frontier labs like Anthropic. 

The talks I liked were:
- Lance Martin from Anthropic gave an amazing talk on boring yet highly effective methodologies like prompt audits, caching, eval design and hill climbing.
- "The future of telemetry" (telemetry the agent can consume).
- the code review agent breakout (Firecracker sandbox, PR webhook, model inversion)
- And a talk that emphasized the importance of looking at any process you are trying to optimize as a directed acyclic graph.

This gathering of AI practioners, industry veterans and ruthlessly ambitious people was as close to the bleeding edge of agent ideation and execution as it gets. Much of it is frontier tech still being tested aka in beta review but, that what makes it exciting to come back to home base and selectively integrate a few of these "boring" yet "frontier" practices and tools into existing development workflows to improve efficiency, reduce operational drag and deliver more value per dollar. 

## The common thread: the AI engineering loop

Every conversation I had with speakers and fellow attendees revolved around how do we "standardize" or solidify a pipeline to take a repeatable, measurable process and build an AI first solution for it. The common conclusion was the AI engineering loop. The loop was mentioned in different flavors throughout the talks, for example, Langfuse's "AI engineering loop" workshop (trace → monitor → datasets → experiments → evaluate); Talk 2 "What does an AI engineer do?"; the Anthropic workshop's eval/hill-climb cycle.

As a good engineer I am, I never take anything at face value. The gap I see: the way we treat intermedate steps and steer the solution towards human readable output. It assumes the "redesigned" workflow already exists. In enterprise, decades of software were built with humans on both ends: forms, PDFs, email threads, spreadsheets.

Fun fact, Microsoft created this whole "knoweledge worker" identity so they could sell more software. Thesis: build the workflow around the agent, not the agent around the workflow.

I added my two cents and propose a more "boring" AI engineering loop: **Map → Re-encode → Prove → Trace → Evaluate → Experiment → Monitor → (back to Map)**.

This loops ties back to some pinciple of my previous note on RAD: it uses the same RAD economics (cheap exploration, prototype as baseline), but now the inputs and outputs are designed for the agent.

## Om's AI engineering lifecycle

### 1. Map: find the human handoffs

- **What it means:** draw the process and mark every node where a human reads or writes something. 
- **Industry proof:** keynote 1: a process is a DAG; people, process, technology; policy-driven workflows. "Stop talking to your spreadsheets." 
- **In practice:** PositionIQ started from the human artifacts: the official UNC position description Word form (one six-column table, label cell → value cell) and four PeopleSoft spreadsheet extracts. Quad maps one agent per department (HR, parking, housing, finance, cashier).

### 2. Re-encode: inputs and outputs for the agent

- **What it means:** replace documents with structured contracts; the contract is where the deterministic shell lives (schemas, limits, separation of duties).
- **Industry proof:** context = docs + tickets; RAG → memory systems (harness = memory + tools + security); knowledge plane / intelligence plane; Exa Snapshots.
- **In practice:** PositionIQ's Pydantic schema is the contract ("bugs here cascade"); HR domain rules encoded in code (SHRA/EHRA fork, "duties are the foundation"); export blocked until responsibility percentages total 100%. Quad's scope classifier returns a strict JSON schema with a single label.
- **Honest gap:** no write API into ConnectCarolina yet. Everything is read-only extracts or an export a human submits.

### 3. Prove: the proof of concept

- **What it means:** cheap exploration (RAD); separate read, draft and write from day one.
- **Industry proof:** managed agents in one API call; building blocks (harness, environment, tools, skills, credentials, schedule); code review agent build (Firecracker sandbox, PR webhook); Stagehand/Browserbase.
- **In practice:** PositionIQ's agent has read tools and *propose* tools only. The human applies, rejects or edits; HR classification fields can't be proposed at all. Quad runs against a mock of UNC production for safe prototyping.

### 4. Trace: telemetry the agent can read

- **What it means:** one user action = one end-to-end trace, with cost and latency on every call.
- **Industry proof:** Langfuse workshop; the future of telemetry is agent-consumable; telemetry signals as agent triggers.
- **In practice:** PositionIQ: OpenTelemetry spans for turn, LLM call, tool call, retrieval and gates, with cost, cached tokens and time-to-first-token on every call; no message bodies in production. Quad's decision log is keyed by a pseudonym and never stores message text, so traces double as privacy-safe audit events.

### 5. Evaluate: representative cases and good eval design

- **What it means:** a dataset of representative cases and a pass bar you trust.
- **Industry proof:** "collect representative cases"; "do we need human labeling for every row?"; good eval design; model inversion (different author and reviewer models). *(Code Quality session, notes TBD)*
- **In practice:** Quad ran its gate in shadow mode, sampled would-be blocks for hand labelling, and hit 89 of 91 correct; a label is enforced only once false blocks fall below 2%. PositionIQ runs each gate case five times because a small model isn't deterministic even at temperature 0.
- **My take:** answer the human-labelling question here. Label the decisions that block a person, not every row.

### 6. Experiment: improve against evidence

- **What it means:** change one thing, measure against the eval, keep or revert.
- **Industry proof:** prompt audits; prompt cache (strict prefix match = cost lever); hill climbing and overfitting; targeting specific bug types and skipping nitpicks.
- **In practice:** PositionIQ tiers models by job (large orchestrator, mini for rerank, nano for the gate) and keeps a stable prompt prefix for a 24h cache. Nimbus fixed AI cost reading $0.00 by pricing cached tokens separately. Cost per completed task is the scoreboard.

### 7. Monitor: closing the loop

- **What it means:** production signals tell you what to fix next, and the answer goes back to Map.
- **Industry proof:** telemetry signals as agent triggers; scheduled managed agents; managed-agents dashboard.
- **In practice:** PositionIQ's dev telemetry showed the classifier returned 0.9 confidence on every call, so its reject thresholds never filtered anything. Monitoring found a dead control. Shared CI/CD with health gates and auto-rollback; named owners on every repo; Quad's gate rolls out shadow → enforce.
- **Honest gap:** no scheduled agents yet. That's the next step.

## Where we're headed

- Agent-first intermediate steps: the steps between input and output get designed for the agent, and humans sit at the gates.
- Developers are moving from the code editor to coding agents in the CLI. Talking to the agent is more productive; it handles the nitty-gritty, you handle intent and review.
- Monitoring output is agent-readable, so the loop starts to run itself. The loop applies its own rule.
- Close: the advantage goes to organizations that redesign the workflow, not the ones that bolt an agent onto it. Experimentation stays cheap; responsibility stays non-optional.
