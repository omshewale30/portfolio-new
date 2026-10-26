---
title: 'Recall from 71% to 90%, with 0 Real Questions Blocked: Three Gates on One Frozen Test Set'
category: AI Cost Engineering
year: '2026'
resultLine: An LLM gate that reads the conversation caught 90% of wasted messages against 71% for embedding thresholds, and blocked no real question.
tags:
  - LLM Evaluation
  - LLM Gating
  - Cost Engineering
  - Model Routing
  - Copilot Studio
  - Azure OpenAI
  - Python
stats:
  - label: Scored messages
    value: '129'
  - label: Real questions blocked
    value: 0 of 66
  - label: Recall, embeddings → Luna
    value: 71% → 90%
  - label: Disagreements won by Luna
    value: 14–2
images:
  - src: /assets/case-studies/quad-gate-eval/recall.png
    alt: 'Recall with 95% intervals for three gates: GPT-6 Luna 90%, Microsoft-Decision-1 86%, embedding gate 71%'
    label: Recall with 95% intervals
---

# Summary

Quad is UNC-Chapel Hill's chat portal for Copilot Studio assistants, and Copilot Studio bills per message. A gate in front of the agent decides whether each typed message is worth sending. I ran three versions of that gate on one frozen set of 129 labelled messages: embedding thresholds, GPT-6 Luna with the conversation history, and Microsoft-Decision-1. Only one gap held up statistically, Luna over the embedding gate. Decision-1 came within noise of Luna at a seventh of its latency.

# Context

## Every “thanks” reached a paid agent

Copilot Studio charges per message, not per token. A greeting, a keyboard mash or a parking question sent to the HR assistant costs the same as a question about dental coverage. My first gate used regex and text-embedding-3-small similarity against example lists, with four thresholds and two skip rules. It never blocked a real question, but I had no number for how much waste it let through, and no way to compare it fairly with a model-based gate.

# Constraints

- Fail open: a failed or slow call sends the message, so the gate can never cost a user a question
- A 2 s classifier limit inside the browser's 3 s budget
- Every gate sees the same messages, in the same order, with the same department list
- Cost at list price, from the tokens each call reports
- No message text in logs

## Out of scope

- The per-user daily quota, which runs before the classifier and was left out of the eval
- Direct Line and Copilot credits: no eval message was sent to an agent
- Departments other than HR benefits and Transportation and Parking

# What didn't work

## Embedding thresholds and skip rules

Similarity to example phrases catches acknowledgements well and off-topic requests badly. The old gate blocked 45 of 63 messages that should have been blocked (71%). It caught 1 of 4 unrelated requests (“write me a python script that sorts a list”), 0 of 2 prompt injections, 0 of 3 transport-adjacent questions and 8 of 10 keyboard mashes. Each model change meant tuning the thresholds again.

## A minimum length in place of a gibberish label

A length rule looks like a free way to catch keyboard mash. On this set, a 20-character minimum catches all 10 gibberish messages and refuses 16 real ones: “FMLA?”, “401k?”, “SHRA”, “7”, “carrboro”. Most of those are short replies to a question the bot asked, which only make sense with the conversation before them.

# Approach

## One frozen test set, three gates

I merged the old gate's own eval set (57 scored messages) and the set I wrote for the Luna and Decision-1 A/B test (61) with every HR and parking starter question (11): 129 scored messages, plus 9 two-sided ones left out of every rate. Each case has a fixed id and a fingerprint of what the gate is shown. The embedding gate no longer exists in the codebase, so I checked out its last commit, ran it once, and froze its output. Luna and Decision-1 then ran three times each through the same code path the classify route uses, with only the quota left out.

## Decisions defended

- Freeze the old gate's output from its last commit instead of rebuilding it on new code
- Make block-or-pass the headline and exact label the second number, because only the block decision costs or saves anything today
- Correct the three pairwise tests with Holm's method, since three comparisons are three chances to find a gap
- Report Set A apart from Set AB, because each was written with a different gate in mind
- Keep Decision-1's threshold at 0.7, the lowest tried with no false block, rather than the one with the best recall

## One frozen test set for three gates

A fair comparison needs identical inputs, and one of the three gates no longer existed in the code. Rebuilding it on today's code would have measured something that never ran in production, so I checked out its last commit, ran every message through it once, and saved each decision with a fingerprint of the message and its history. If a case changes after the freeze, the eval refuses to load the frozen results instead of joining them to the wrong message.

To check that the old gate was set up correctly, I compared it with its own history. On Set A it scored 54 of 57, with the same three misses as its original run: “who is the president”, “is this ChatGPT?” and “qwerty uiop”.

The set is deliberately heavy on waste, 63 of 129 messages, so that recall can be measured at all. A positive is a message that should be blocked. Recall is the share of those a gate blocks. A false block is a real question refused.

## Gate 2: one Luna call that reads the conversation

The second gate sends each typed message to GPT-6 Luna with up to ten turns of the conversation before it and a one-sentence description of every department. A strict JSON schema with one enum field limits the answer to four labels: in scope, small talk, gibberish, or another department's question. Reasoning is off, and the call times out at 2 s.

It raised recall from 71% to 90% and kept false blocks at zero. The price is latency: a 1,022 ms median against 173 ms for the embedding gate. It is also not fully repeatable: across three runs, 4 of 129 decisions changed. Its one failure was a prompt-injection message that Azure refused outright, and the gate sent it, as fail-open requires.

## Gate 3: a decision model that returns probabilities

Microsoft-Decision-1 does not generate text. It returns a probability for each of the same four labels, and the gate blocks when a blocking label reaches the threshold and leads in scope. Because every call returns all four probabilities, I could rescore the same run at other thresholds with no further calls.

At the default threshold of 0.7 it blocked 86% of waste with no false block, at a 149 ms median. Lowering the threshold to 0.5 matches Luna's 90% recall but refuses one real question. Its misses sit just under the line: “ok thank you” scored 0.59 for small talk, and “i lost my onecard how do i get a new one” 0.53.

![Decision-1 recall and real questions let through at thresholds 0.5 to 0.9](/assets/case-studies/quad-gate-eval/decision_threshold.png "Rescored from the same calls. Recall falls from 90% at 0.5 to 67% at 0.9; the one false block disappears at 0.7. I chose the threshold on this set, so it needs checking on new data.")

# How it shipped

The browser asks the gate before every typed message and treats any error, timeout or non-2xx answer as send. Suggested chips and retries skip the classifier.

HR benefits and Transportation and Parking enforce the gate: a blocked message gets the department's reply instead of a Copilot answer. Departments still being set up run it in shadow mode, where it only logs, until their labels have been reviewed.

Luna is the default classifier. One setting, AZURE_DECISION_ONE_DEPLOYMENT, switches the gate to Decision-1 on the same Azure resource, so the faster option is a configuration change, not a code change.

# Results

## 90% recall against 71%, and 0 false blocks for every gate

Luna blocked 57 of the 63 messages that should not reach the agent; the embedding gate blocked 45. Decision-1 blocked 54 at a 149 ms median, and gave the same decision on every message in all three runs. None of the three blocked any of the 66 real questions.

| Metric | GPT-6 Luna | Microsoft-Decision-1 | Embedding gate |
| --- | --- | --- | --- |
| Accuracy | 95% [90–98] | 93% [87–96] | 86% [79–91] |
| **Waste blocked (recall)** | 90% [81–96] | 86% [75–92] | 71% [59–81] |
| Real questions blocked | 0 of 66 | 0 of 66 | 0 of 66 |
| Waste let through | 6 | 9 | 18 |
| Latency p50 / p95 | 1,022 / 1,275 ms | 149 / 237 ms | 173 / 339 ms |
| Cost per 1,000 messages | $0.0604 | $0.0209 | $0.0002 |
| Decisions changed across 3 runs | 4 | 0 | n/a (one frozen run) |

Table: 129 scored messages: 63 that should be blocked, 66 real questions. Brackets are 95% Wilson intervals. Latency is from a laptop, not the production host. Luna and Decision-1 figures are from the first of three runs.

## Where it fell short

Luna did not beat Decision-1: of the 9 messages they decided differently, Luna was right on 6 and Decision-1 on 3 (p = 0.51). And the gap between the LLM gates and the embedding gate comes mostly from Set AB, which I wrote after reading Luna's prompt. On Set A, the embedding gate's own eval set, all three scored within 3 points (98%, 98%, 95%).

## Only one gap is real

Overall accuracy hides where the gates differ, because all three get every real question right. The useful comparison is the messages two gates decided differently. Where they disagree, exactly one of them is right, so an exact sign test says whether the split could be chance. With three gates there are three tests, and I corrected the p-values for that.

Only Luna against the embedding gate clears the bar. Decision-1 against the embedding gate leans the same way but could still be chance at this sample size, and Luna against Decision-1 is a coin toss.

| Pair | Disagreements | Right: first | Right: second | p |
| --- | --- | --- | --- | --- |
| **Luna vs embedding gate** | 16 | 14 | 2 | 0.013 |
| Decision-1 vs embedding gate | 17 | 13 | 4 | 0.10 |
| Luna vs Decision-1 | 9 | 6 | 3 | 0.51 |

Table: Scored messages each pair decided differently. Holm-corrected p-values from an exact two-sided sign test.

![Recall against median latency: Luna at 90% and 1,022 ms, Decision-1 at 86% and 149 ms, the embedding gate at 71% and 173 ms](/assets/case-studies/quad-gate-eval/recall_vs_latency.png "Decision-1 and the embedding gate cost about the same time; Luna buys four more points of recall with a second of latency and three times Decision-1's cost.")

## Where every gate fails

Broken down by kind of message, the embedding gate's misses are requests that are off-topic rather than chatty: unrelated tasks, prompt injections, and transport-adjacent questions such as a pothole on Raleigh Road. The LLM gates miss short acknowledgements after a real answer, such as “ok cool thanks”.

No gate handles HR questions that are not about benefits well: a W-2, a short paycheck, a job posting, a performance review. All four read like HR questions, and the HR assistant only answers benefits. Luna caught 2 of them; the other gates caught none. I relabelled two of them myself, as questions for the finance assistant, so this row is the most arguable in the set.

Every gate passed all 12 replies to a bot question and all 12 follow-ups. The embedding gate passes replies because a skip rule never checks them, not because it reads the conversation, so this set cannot show whether context helps there.

| Category | Cases | Luna | Decision-1 | Embedding gate |
| --- | --- | --- | --- | --- |
| Small talk | 26 | 24 | 22 | 23 |
| Gibberish | 10 | 10 | 10 | 8 |
| Another department's question | 14 | 14 | 14 | 13 |
| Unrelated request | 4 | 4 | 4 | 1 |
| Prompt injection | 2 | 1 | 2 | 0 |
| Transport-adjacent | 3 | 2 | 2 | 0 |
| HR outside benefits | 4 | 2 | 0 | 0 |

Table: Correct block-or-pass decisions, for the categories where at least one gate made a mistake.

# Lessons

- **Reading the request, not matching it, buys recall that thresholds cannot: 71% to 90%.** Of the 16 messages where Luna and the embedding gate disagreed, Luna was right on 14 (p = 0.013 after Holm's correction). They were mostly requests that sound like a question but belong to no one here: “write me a python script”, “whats a good place to eat on franklin street”, a pension question sent to the parking assistant.
- **A false block is the expensive error, and all three gates held it at 0 of 66.** A real question refused costs a user an answer; a stray “thanks” let through costs a few cents. Every gate leans toward sending when unsure, which is why the differences show up in recall and never in false blocks.
- **Decision-1 matched Luna within noise at 149 ms against 1,022 ms.** 86% against 90% recall, with overlapping intervals and a 6 to 3 split on their disagreements (p = 0.51). It also costs about a third as much per message. On this set, the larger model buys latency, not accuracy.
- **Determinism is a feature in a gate: Decision-1 changed 0 decisions across three runs, Luna changed 4.** A gate that refuses a message on one try and sends it on the next is hard to explain to users and hard to tune. Decision-1 also returns a probability for every label, so its threshold can be moved without another model call.

# Limits

## Threats to validity

The set is small (129 scored messages), heavy on waste by design, and written and labelled by me. I wrote Set AB after reading Luna's prompt, and I relabelled three cases when a finance assistant was added. Someone who has not read the prompts should label the next set.

Latency was measured from a laptop, not from the container the gate runs in. Luna's headline numbers come from the first of three runs; I kept only the count of changed decisions across runs, not each run's accuracy. Decision-1's threshold was chosen on the same messages it was scored on.

Nothing here measures production traffic. The share of real messages that are waste, and so the money a gate saves, is still unknown.

## My two cents

Put a cheap decider at the door when the step behind it is billed per call and a lot of traffic is predictable waste. Thresholds on similarity work for messages that look like your examples. A model that reads the request catches the ones that do not.

Between the two model gates, I would now start with the one that returns probabilities. It was as accurate as the generator on this set, seven times faster, and gave the same answer every time.

# What I'd do differently

Score real shadow-mode traffic instead of messages I wrote; have someone who has not read the prompts label the set; write every call's latency, tokens and probabilities to a structured results file; run Luna five or more times and report the spread; measure latency from the container the gate runs in; give Prompt Shields refusals their own reason instead of a classifier error; and tune Decision-1's threshold on a held-out split.
