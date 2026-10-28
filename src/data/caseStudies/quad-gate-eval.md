---
title: 'Blocking 90% of Wasted Messages and 0 Real Questions: Gating a Pay-per-Message Agent'
category: AI Cost Engineering
date: '2026-10-29'
pinned: true
resultLine: On 129 scored test messages, Luna blocked 90% of wasted messages and the embedding gate blocked 71%. Decision-1 blocked 86% at 149 ms, within noise of Luna. No gate blocked a real question.
tags:
  - LLM Evaluation
  - LLM Gating
  - Cost Engineering
  - Model Routing
  - Copilot Studio
  - Azure OpenAI
  - Python
stats:
  - label: Scored test messages
    value: '129'
  - label: Real questions blocked
    value: '0 of 66'
  - label: Recall, embedding gate → Luna
    value: '71% → 90%'
  - label: Disagreements won by Luna over the embedding gate
    value: '14–2'
images:
  - src: /assets/case-studies/quad-gate-eval/recall.png
    alt: 'Recall with 95% intervals for three gates: Luna 90%, Decision-1 86%, embedding gate 71%'
    label: Recall with 95% intervals
---

# Summary

Quad is a platform in development that publishes Copilot Studio agents to the public. A gate in front of each agent decides if a typed message is worth sending to the agent. We compared three gates on one test set of synthetic, hand-labelled test messages: an embedding gate with thresholds, GPT-6 Luna (Luna), which reads the conversation history, and Microsoft-Decision-1 (Decision-1), a model that returns probabilities instead of text. Only one gap is statistically significant. The gate I would start with now is Decision-1, because it is cheap and it gives the same answer every time.

# Context

## Every “thanks” reached a paid agent

Copilot Studio charges per message, not per token. A greeting, a gibberish message or a question for a different department costs the same as a real question. All agents in the tenant use one prepaid pool of credits. When use reaches 125% of that capacity, Copilot Studio stops every custom agent in the tenant until the capacity resets. Previous standalone Copilot agents failed for this reason: without a gate, an agent used all the credits within days of publishing. Many public AI chatbots with limited resources have this problem, which is also known as the Chipotle bot problem. If you do not know about the Chipotle bot incident, read about it. To solve the cost problem, my team and I designed a lightweight gate. This case study covers only a subset of the full gate architecture. Later posts will cover the full gate.

# Constraints

- The gate must never make a message fail. If the gate has an error, a timeout or a non-2xx response, the message is sent. The classifier gets 2 s of the browser's 3 s budget.
- The gate must never block a real question. Short domain terms such as “FMLA?” and one-word replies to a question from the assistant must be sent.
- The classifier must cost a small fraction of the agent call that it protects. If it does not, the gate costs more than it saves.
- No real user messages are in this evaluation. All test messages and conversation histories are synthetic. Ayush Sagar, an intern on my team, and I labelled each test message by hand.

# What didn't work

## Gate 1: embedding thresholds and skip rules

My first gate used regex and text-embedding-3-small similarity to lists of example phrases. It had four thresholds and two skip rules. The gate is only as good as its example lists, and these lists need many hand-labelled phrases. Four thresholds are also too much tuning for a yes-or-no decision. Similarity to example phrases catches small talk well and unrelated requests badly. The embedding gate blocked 45 of 63 wasted messages (71% recall). It blocked 1 of 4 unrelated requests (“write me a python script that sorts a list”), 0 of 2 prompt injections, 0 of 3 transport-adjacent questions and 8 of 10 gibberish messages. After each model change, I had to tune the thresholds again.

## A minimum length instead of a gibberish label

A length rule looks like a free way to catch gibberish. On this test set, a 20-character minimum catches all 10 gibberish messages but blocks 16 real questions, such as “FMLA?”, “401k?”, “7” and “yes”. Most of those are short replies to a question from the assistant. They only make sense with the conversation history.

# Approach

## Decisions defended

- Fail open, not closed. If the gate sends a wasted message, it costs one message. If the gate blocks a real question, it costs a user an answer. Luna had one failure in this evaluation, a call that Azure rejected, and the gate sent that message.
- Classify on the server, before the browser sends the message. The API applies the quota and the classifier. The browser sends the message unless the API returns a clear block.
- Send the conversation history to the model as data, never as instructions. The conversation history and the message go in a separate JSON message. So the model labels an injected “ignore your instructions”, and does not obey it.
- Set the threshold to favour sending. Decision-1 blocks a message only when a blocking label reaches 0.7 and is higher than in scope. At 0.5, Decision-1 gets Luna's 90% recall but blocks 1 real question.
- Use shadow mode before enforcement. A new assistant logs every decision and blocks nothing until a person reviews its labels.
- Make the classifier a setting. Luna and Decision-1 use one interface, so a change of classifier is a config change, not a code change.

## One test set, three gates

The test set has 138 synthetic test messages, and Ayush and I labelled each one by hand. No real user message is in the test set. 9 test messages are ambiguous, so we did not score them. That leaves 129 scored test messages: 63 wasted messages and 66 real questions. A wasted message is a message that the gate must block. A real question is a message that the agent must answer. Recall is the percentage of wasted messages that a gate blocks. The test set has many wasted messages on purpose, so that recall is measurable. All three gates got the same test messages in the same order, with the same conversation history. I ran the embedding gate once and saved its answers. I ran Luna and Decision-1 three times each, to see if their answers change.

## Gate 2: one Luna call that reads the conversation history

The second gate sends each typed message to Luna with up to ten turns of conversation history and a one-sentence description of each department. A strict JSON schema with one enum field limits the answer to four labels: in scope, small talk, gibberish or another department's question. Reasoning is off, and the call times out at 2 s.

Luna increased recall from 71% to 90% and blocked no real questions. The cost is latency: Luna's median is 1,022 ms, and the embedding gate's median is 173 ms. Luna is also not fully repeatable: across three runs, 4 of 129 decisions changed. Its one failure was a prompt-injection message that Azure rejected. The gate sent that message, as fail-open requires.

## Gate 3: a decision model that returns probabilities

Decision-1 does not generate text. It returns a probability for each of the same four labels. The gate blocks a message when a blocking label reaches the threshold and is higher than in scope. Each call returns all four probabilities, so I could rescore the same run at other thresholds without more calls.

At the default threshold of 0.7, Decision-1 blocked 86% of wasted messages and no real questions, at a 149 ms median. At a threshold of 0.5, it gets Luna's 90% recall but blocks one real question. Its misses are just below the threshold: “ok thank you” got 0.59 for small talk, and a question about a lost ID card got 0.53.

![Decision-1 recall and real questions sent, at thresholds 0.5 to 0.9](/assets/case-studies/quad-gate-eval/decision_threshold.png "Rescored from the same calls. Recall decreases from 90% at 0.5 to 67% at 0.9. The one blocked real question goes away at 0.7. I chose the threshold on this test set, so it needs a check on new data.")

# How it shipped

The browser asks the gate before it sends each typed message. If the gate has an error, a timeout or a non-2xx response, the browser sends the message. Suggested questions and retries skip the classifier.

Two live assistants enforce the gate. When the gate blocks a message, the assistant gives its own reply instead of an agent answer. Each new assistant starts in shadow mode, where the gate only logs its decisions.

Luna is the default classifier. Decision-1 runs on the same Azure resource with the same interface, so a change to the faster gate is one setting.

# Results

## 90% recall against 71%, and 0 real questions blocked by any gate

Luna blocked 57 of the 63 wasted messages. The embedding gate blocked 45. Decision-1 blocked 54 at a 149 ms median, and changed 0 decisions across three runs. No gate blocked any of the 66 real questions.

| Metric | Luna | Decision-1 | Embedding gate |
| --- | --- | --- | --- |
| Accuracy | 95% [90–98] | 93% [87–96] | 86% [79–91] |
| **Recall (wasted messages blocked)** | 90% [81–96] | 86% [75–92] | 71% [59–81] |
| Real questions blocked | 0 of 66 | 0 of 66 | 0 of 66 |
| Wasted messages sent | 6 | 9 | 18 |
| Latency p50 / p95 | 1,022 / 1,275 ms | 149 / 237 ms | 173 / 339 ms |
| Cost per 1,000 messages | $0.0604 | $0.0209 | $0.0002 |
| Decisions changed across 3 runs | 4 | 0 | n/a (one saved run) |

Table: 129 scored test messages: 63 wasted messages and 66 real questions. Brackets are 95% Wilson intervals. Latency is from a laptop, not the production host. Luna and Decision-1 values are from the first of three runs.

## Where it fell short

Luna did not do better than Decision-1. On the 9 test messages where they disagreed, Luna was correct on 6 and Decision-1 on 3 (p = 0.51). Also, most of the gap between the embedding gate and the other two gates comes from the half of the test set that we made after we read Luna's prompt. On the 57 test messages that we first made for the embedding gate, all three gates scored within 3 points (98%, 98%, 95%). On the other 61, they scored 92%, 87% and 75%.

## Only one gap is statistically significant

Overall accuracy hides where the gates are different, because all three gates are correct on every real question. The useful comparison is the test messages that two gates decided differently. When two gates disagree, exactly one of them is correct. An exact sign test shows if the split can be chance. With three gates there are three tests, so I corrected the p-values for that.

Only Luna against the embedding gate is significant. Decision-1 against the embedding gate goes in the same direction, but at this sample size it can still be chance. Luna against Decision-1 is a coin toss.

| Pair | Disagreements | Correct: first | Correct: second | p |
| --- | --- | --- | --- | --- |
| **Luna vs embedding gate** | 16 | 14 | 2 | 0.013 |
| Decision-1 vs embedding gate | 17 | 13 | 4 | 0.10 |
| Luna vs Decision-1 | 9 | 6 | 3 | 0.51 |

Table: Scored test messages that each pair decided differently. Holm-corrected p-values from an exact two-sided sign test.

![Recall against median latency: Luna at 90% and 1,022 ms, Decision-1 at 86% and 149 ms, the embedding gate at 71% and 173 ms](/assets/case-studies/quad-gate-eval/recall_vs_latency.png "Decision-1 and the embedding gate have about the same latency. Luna gets four more points of recall for 873 ms more median latency and three times the cost of Decision-1.")

## Where every gate fails

By category, the embedding gate misses unrelated requests, prompt injections and transport-adjacent questions, such as a pothole on a city street. These messages are not small talk. Luna and Decision-1 miss short small talk after a real answer, such as “ok cool thanks”.

No gate handles questions just outside the assistant's scope: a tax form, a short paycheck, a job posting, a performance review. All four sound like they are for this assistant, but it does not answer them. Luna blocked 2 of the 4. The other gates blocked none. Two of the four have the label “another department's question”, so this category is the most arguable in the test set.

Every gate sent all 12 replies to a question from the assistant and all 12 follow-up questions. The embedding gate sends replies because a skip rule turns off its small-talk check after the assistant asks a question. It does not read the conversation history. So this test set cannot show if conversation history helps with replies.

| Category | Cases | Luna | Decision-1 | Embedding gate |
| --- | --- | --- | --- | --- |
| Small talk | 26 | 24 | 22 | 23 |
| Gibberish | 10 | 10 | 10 | 8 |
| Another department's question | 14 | 14 | 14 | 13 |
| Unrelated request | 4 | 4 | 4 | 1 |
| Prompt injection | 2 | 1 | 2 | 0 |
| Transport-adjacent | 3 | 2 | 2 | 0 |
| Just outside scope | 4 | 2 | 0 | 0 |

Table: Correct block-or-send decisions, for the categories where at least one gate made a mistake.

# Lessons

- **A gate that reads the message gets recall that thresholds cannot: 71% to 90%.** On the 16 test messages where Luna and the embedding gate disagreed, Luna was correct on 14 (p = 0.013 after Holm's correction). Most were requests that sound like a real question but are not for this assistant: “write me a python script”, a restaurant tip, a retirement question sent to the wrong assistant.
- **A blocked real question is the expensive error, and all three gates blocked 0 of 66.** A blocked real question costs a user an answer. A wasted message that the gate sends costs one message. Every gate sends the message when it is not sure. That is why the gates are different in recall and never in blocked real questions.
- **Decision-1 matched Luna within noise, at 149 ms against 1,022 ms.** Recall was 86% against 90%, with overlapping intervals and a 6 to 3 split on their disagreements (p = 0.51). Decision-1 also costs about a third as much per message. On this test set, text generation added 873 ms of median latency and no measurable accuracy.
- **Determinism is important in a gate: Decision-1 changed 0 decisions across three runs, and Luna changed 4.** If a gate blocks a message on one try and sends it on the next, it is hard to explain to users and hard to tune. Decision-1 also returns a probability for each label, so you can move its threshold without another model call. If I started today, I would put Decision-1 in front of the agent.

# Limits

## Threats to validity

The test set is small (129 scored test messages), has many wasted messages by design, and Ayush and I labelled it. We made half of the test set after we read Luna's prompt, so the test set can favour Luna and Decision-1. A person who has not read the prompts must label the next test set.

Latency is from a laptop, not from the production host. Luna's main results come from the first of three runs. I chose the Decision-1 threshold on the same test messages that I scored it on.

Nothing here measures production traffic. We do not know yet what percentage of real traffic is wasted messages, so we do not know how much money a gate saves.

# What I'd do differently

Score real shadow-mode traffic instead of synthetic test messages; have a person who has not read the prompts label the test set; run Luna and Decision-1 five or more times each and report the spread; measure latency from the production host; and tune the Decision-1 threshold on a held-out split.
