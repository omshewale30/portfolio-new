export default {
  title: "No Chain of Thought Required",
  category: "Systems Research",
  year: "2026",
  summary:
    "I benchmarked Jev, a “System One” model that returns decisions and probabilities instead of text, against GPT-6 Luna and Sol on 1,973 items spanning intent routing, email triage, and formal logic. With no reasoning step it matched a reasoning LLM on logic at a tenth of the latency, and it lost where the task demanded fine-grained distinctions.",
  before: {
    title: "Every classification paid for a text generator",
    description:
      "The default way to put a decision into software is to prompt a general-purpose LLM, parse one label out of its JSON, and trust a confidence number it wrote down. Every decision pays for a generator: seconds of latency with long tails, per-token billing, and a reasoning budget on anything harder than keyword matching. I wanted to know whether a model built only to decide can replace that stack, and exactly where it cannot.",
  },
  intervention: {
    title: "One harness, three levels of difficulty",
    description:
      "I built a dataset-agnostic Python harness that runs Jev 1.13 and GPT-6 Luna and Sol under an identical task spec. It reports accuracy and macro-F1 with bootstrap CIs, McNemar tests on paired predictions, cost per 1,000 items, latency percentiles, selective accuracy, and calibration (ECE). The three runs span the difficulty range: Banking77 (770 customer messages, 77 intents), 1,000 emails from my own inbox labelled by Gmail's categories, and FOLIO (203 first-order-logic problems), where the LLMs also ran with high reasoning effort.",
  },
  after: {
    title: "Reasoning-model accuracy on logic at ~10× the speed; beaten on 77-way intents",
    description:
      "Across 1,973 calls Jev never needed a retry, and its p99 latency stayed at or below 352 ms on every task, against 6.5–22 s for the LLMs. On FOLIO it tied GPT-6 Luna with high reasoning (0.837 each) at a sixth of the cost, and it led both LLMs on my inbox. It lost to GPT-6 Sol on Banking77's 77 fine-grained intents, and to prompt-cached Luna on cost there. The deployable answer is a router: Jev decides, and its calibrated probability decides what escalates.",
  },
  constraints: [
    "Identical instructions and label definitions for every model",
    "Pinned model versions; list prices verified on 2026-09-22",
    "Cost from API-reported token usage only, cache discounts included",
    "Paired significance tests, not just overlapping intervals",
  ],
  decisionsDefended: [
    "Bill prompt caching at its real rate, even where it flips the cost result against Jev",
    "Give the LLMs a reasoning budget on the logic task instead of only beating the cheap baseline",
    "Call LLM confidence what it is (verbalized) rather than claim a like-for-like calibration win",
    "Report where Jev loses with the same rigour as where it wins",
  ],
  whatIdDoDifferently:
    "Measure latency in the harness's interleaved latency mode instead of throughput mode; give Banking77 real label definitions and test Jev's hierarchical Choice on the 77-way taxonomy; derive LLM confidence from token logprobs so calibration is compared like-for-like; tune escalation thresholds on a held-out split instead of the evaluation set; cluster FOLIO's bootstrap by premise set; and repeat every run across seeds, since the OpenAI models sample at temperature 1.0.",
  images: [
    {
      src: "/assets/case-studies/no-chain-of-thought-required/folio/cost_vs_f1.png",
      alt: "FOLIO macro-F1 against cost per 1,000 items: Jev at the accuracy of the reasoning LLMs at the lowest price",
      label: "FOLIO cost vs macro-F1",
    },
  ],
  stats: [
    { label: "Test items, 3 tasks", value: "1,973" },
    { label: "FOLIO accuracy, zero reasoning tokens", value: "0.837" },
    { label: "Faster median than reasoning LLMs", value: "~10×" },
    { label: "Cheaper than GPT-6 Sol (high) on FOLIO", value: "102×" },
  ],
  tags: ["LLM Evaluation", "System One", "Calibration", "Benchmarking", "Python"],
  externalLink: null,
  sections: [
    {
      eyebrow: "Architecture",
      heading: "Two contracts: decide versus generate",
      paragraphs: [
        "Jev is TypeSafe's first “System One” model. Its API has no text output: you send a state and a set of options, and it “returns decisions and probabilities.” TypeSafe documents two properties that matter here. It is “trained with RLCD to return calibrated decisions,” and it “ingests the state once and evaluates every question against it in parallel.” The billing reflects that shape. Output tokens are free, and the reported output count scaled with the number of options (41 for FOLIO's 3 labels, 72 for Gmail's 7, 828 for Banking77's 77), consistent with scoring options rather than writing an answer.",
        "GPT-6 Luna and Sol are general-purpose generators. In the harness they receive byte-identical instructions and the same label list, and return JSON with a label and a confidence. That confidence is text the model writes, a verbalized number rather than a probability read off the network. Reasoning effort buys them a hidden scratchpad, billed as output tokens.",
        "Those contracts make testable predictions. Jev's cost and latency should not grow with task difficulty. Its probabilities should be more usable than verbalized ones. And it should struggle where TypeSafe's own notes say it does: “multiple hops of reasoning cost accuracy,” and it “answers the question you wrote, not the one you meant.” The runs below test each one.",
      ],
      table: {
        caption:
          "Accuracy on each full sample, cost per 1,000 items at list price, and median client-side latency. Luna and Sol ran with reasoning off; FOLIO's high-reasoning results are in the next section.",
        columns: ["Task", "Jev", "Luna", "Sol", "Jev $/1K", "Luna $/1K", "Sol $/1K", "Jev p50", "LLM p50"],
        columnGroups: [
          { label: "Accuracy", columns: ["Jev", "Luna", "Sol"] },
          { label: "Cost", columns: ["Jev $/1K", "Luna $/1K", "Sol $/1K"] },
          { label: "Latency", columns: ["Jev p50", "LLM p50"] },
        ],
        rows: [
          ["FOLIO logic · 3 labels", "0.837", "0.576", "0.754", "$0.020", "$0.037", "$0.747", "221 ms", "1.3–1.4 s"],
          ["My inbox · 7 categories", "0.693", "0.675", "0.662", "$0.048", "$0.101", "$2.03", "200 ms", "1.3–1.5 s"],
          ["Banking77 · 77 intents", "0.786", "0.805", "0.831", "$0.072", "$0.030", "$0.585", "202 ms", "1.2–1.5 s"],
        ],
      },
    },
    {
      eyebrow: "Axis 2 · FOLIO",
      heading: "No chain of thought required, up to a point",
      paragraphs: [
        "FOLIO asks whether a conclusion is True, False, or Uncertain given a set of first-order-logic premises. It is the task a System One model should lose. Denied a scratchpad, GPT-6 Luna scored 0.576, not far above the one-in-three baseline, because it retreated to the safe answer: it predicted “Uncertain” for 141 of 203 items. Jev, also with no reasoning step, scored 0.837.",
        "With high reasoning effort the LLMs caught up but did not pass it. Luna-high also scored 0.837, and the paired comparison is exactly 20 items each way (McNemar p = 1.0). Sol-high scored 0.823 (p = 0.76). Jev reached that accuracy for $0.020 per 1,000 items at a 221 ms median. Luna-high spent ~188 reasoning tokens per item to get there, at $0.132 (6.6×) and 2.25 s; Sol-high cost $2.04 (102×) at 2.15 s. Against the no-reasoning LLMs Jev's lead is significant: 68 items to 15 over Luna, and 30 to 13 over Sol (p = 0.014).",
        "The per-label breakdown shows what a single pass can and cannot do. Jev is decisive when the premises entail or contradict the conclusion (recall 0.90 on True, 0.89 on False). But it recognises only 0.72 of the Uncertain cases, where both reasoning LLMs reach 0.90. Establishing “Uncertain” means showing that neither the conclusion nor its negation follows, which is an exhaustive, multi-hop search and exactly the capability TypeSafe flags as Jev's weak spot. The finding is not that Jev reasons. It is that most of FOLIO's validation items can be settled in one calibrated read, and the rest are where a scratchpad earns its cost.",
        "Because the two architectures fail on different items, they compose. Jev and Luna-high are both right on 150 items, and at least one of them is right on 93.6%. All 67 of Jev's answers at 0.99 confidence or higher, a third of the set, are correct. Keeping Jev's answers above 0.8 confidence and escalating the other 29% to Luna-high scores 0.872, higher than any single model, for roughly $0.058 per 1,000 items. I picked that threshold on the evaluation set, so it is a ceiling to validate, not a result.",
      ],
      table: {
        caption:
          "All 203 FOLIO validation items. They come from 73 premise sets, so the 95% intervals are optimistic. Jev's output tokens are option scores, billed at $0.",
        columns: ["Model", "Accuracy [95% CI]", "Cost / 1K", "p50 latency", "Output tokens", "ECE"],
        rows: [
          ["Jev 1.13 · no reasoning", "0.837 [0.783–0.887]", "$0.020", "221 ms", "41", "0.036"],
          ["GPT-6 Luna · no reasoning", "0.576 [0.502–0.645]", "$0.037", "1.33 s", "20", "0.413"],
          ["GPT-6 Sol · no reasoning", "0.754 [0.690–0.813]", "$0.747", "1.44 s", "19", "0.236"],
          ["GPT-6 Luna · high reasoning", "0.837 [0.788–0.887]", "$0.132", "2.25 s", "209", "0.151"],
          ["GPT-6 Sol · high reasoning", "0.823 [0.773–0.872]", "$2.04", "2.15 s", "148", "0.165"],
        ],
        highlightRows: [0],
      },
      figures: [
        {
          src: "/assets/case-studies/no-chain-of-thought-required/folio/cost_vs_f1.png",
          alt: "FOLIO macro-F1 with 95% intervals against cost per 1,000 items on a log scale for five models",
          caption:
            "Macro-F1 against cost (log scale). Jev sits at the reasoning models' accuracy at the price floor; Luna without reasoning collapses.",
        },
        {
          src: "/assets/case-studies/no-chain-of-thought-required/folio/coverage_curves.png",
          alt: "FOLIO accuracy on the most-confident fraction of items for each model",
          caption:
            "Accuracy on each model's most confident items. Jev's curve is the highest across nearly the whole range; it is perfect on everything it rates 0.99 or higher.",
        },
        {
          src: "/assets/case-studies/no-chain-of-thought-required/folio/reliability.png",
          alt: "FOLIO reliability diagrams: Jev tracks the diagonal, GPT models collapse into the top confidence bin",
          caption:
            "The GPT panels are one or two dots because those models reported 0.9–1.0 confidence on essentially every item. Jev spreads across six bins that track the diagonal (ECE 0.036).",
        },
        {
          src: "/assets/case-studies/no-chain-of-thought-required/folio/latency_distribution.png",
          alt: "FOLIO per-request latency distributions on a log scale for five models",
          caption:
            "Reasoning adds 0.7–0.9 s to the LLM median and stretches the tail; Jev's distribution does not move with task difficulty.",
        },
      ],
    },
    {
      eyebrow: "Axis 1 · Email triage",
      heading: "My inbox: a small lead, a low ceiling, a real cost gap",
      paragraphs: [
        "The second run sorted 1,000 emails from my own inbox into Gmail's seven categories. The ground truth is the category Gmail itself assigned, so the run measures how well each model reproduces Gmail's sorting. Jev scored 0.693 against 0.675 for Luna (40 vs 22 discordant items, p = 0.03) and 0.662 for Sol (52 vs 21, p = 0.0004). Most of the gap sits on Gmail's hardest boundary: Jev recovered 43% of true “updates” emails, against 38% and 37%.",
        "The lead is modest, and I would not assign it a mechanism. All three models miss the same 280 emails, and on 296 emails Luna and Sol agree with each other but not with Gmail. The largest single pattern, about 130 errors per model, is automated mail Gmail filed as updates that the models read as promotions. That puts a practical ceiling near 0.7, set by the labels rather than the models.",
        "Cost is where architecture shows. Each email is roughly 1,500 characters of unique content, so the LLMs' prompt cache had almost nothing to reuse: about one cached token per call. Jev cost $0.048 per 1,000 emails against $0.101 for Luna and $2.03 for Sol, and its price could rise 2.1× before it matched Luna. Calibration improved but stayed poor in absolute terms: ECE 0.22 for Jev against 0.30 and 0.31, with the LLMs reporting 0.95+ confidence on 86–92% of their answers.",
      ],
      figures: [
        {
          src: "/assets/case-studies/no-chain-of-thought-required/gmail/cost_vs_f1.png",
          alt: "Inbox macro-F1 with 95% intervals against cost per 1,000 emails for three models",
          caption:
            "Macro-F1 intervals overlap because tiny classes (4 travel and 7 bills emails) dominate it; the paired accuracy tests are the stronger evidence. Jev is cheapest by 2×.",
        },
        {
          src: "/assets/case-studies/no-chain-of-thought-required/gmail/coverage_curves.png",
          alt: "Inbox accuracy on the most-confident fraction of emails for each model",
          caption:
            "No model's confidence separates easy from hard emails well, as expected when much of the error is label ambiguity that no confidence signal can see.",
        },
        {
          src: "/assets/case-studies/no-chain-of-thought-required/gmail/reliability.png",
          alt: "Inbox reliability diagrams for Jev and the GPT models",
          caption:
            "Jev is less overconfident than either LLM (ECE 0.22 vs 0.30 and 0.31), but none of the three is well calibrated on this task.",
        },
        {
          src: "/assets/case-studies/no-chain-of-thought-required/gmail/latency_distribution.png",
          alt: "Inbox per-request latency distributions on a log scale for three models",
          caption: "Jev: p50 200 ms, p95 295 ms. The LLM tails run past 20 s, and two emails were lost to timeouts.",
        },
      ],
    },
    {
      eyebrow: "Axis 1 · Banking77",
      heading: "Where Jev loses: 77 near-synonymous intents",
      paragraphs: [
        "Banking77 is short customer messages across 77 intents, many of them near-neighbours such as pending_transfer and transfer_timing. Here GPT-6 Sol was clearly better: 0.831 against Jev's 0.786, and 51 items to 16 in the paired comparison (p = 2×10⁻⁵). Jev and Luna were statistically tied (0.786 vs 0.805, p = 0.09).",
        "Two architectural facts line up with the loss. First, Jev reads literally, and in this run every label was defined only by its name (“Card arrival”). A 77-way boundary drawn from names alone rewards the broader prior of a large generalist. Second, Jev's errors were near-misses: its top-two accuracy is 0.879, so 43% of its mistakes ranked the right intent second. Those are fine distinctions that a single scoring pass blurs. TypeSafe recommends hierarchical Choice for large taxonomies. I tested neither that nor richer definitions, so they remain the open variables, not excuses.",
        "It also lost on cost. The 77-label prefix is identical on every call, so Luna served 96% of its input tokens from the prompt cache at $0.01 per million. Jev has no cached rate and encodes the task in more tokens (1,706 against 1,344 per item), so it cost $0.072 per 1,000 against Luna's $0.030, 2.4× more; its list price would need to fall 58% to match. Against Sol ($0.585) it was still 8× cheaper.",
        "The deployable design is again a router. Accept Jev's answer when it is at least 0.9 confident and escalate the other 31% to Sol. That scores 0.827, 99.5% of Sol's accuracy, for about $0.26 per 1,000 items (44% of Sol's cost), with most traffic answered in ~200 ms. As on FOLIO, the threshold was chosen in-sample.",
      ],
      figures: [
        {
          src: "/assets/case-studies/no-chain-of-thought-required/banking77/cost_vs_f1.png",
          alt: "Banking77 macro-F1 with 95% intervals against cost per 1,000 items for three models",
          caption: "Sol buys the best accuracy at 8× Jev's price; cached Luna is the cost floor.",
        },
        {
          src: "/assets/case-studies/no-chain-of-thought-required/banking77/coverage_curves.png",
          alt: "Banking77 accuracy on the most-confident fraction of items for each model",
          caption: "Sol leads at nearly every coverage level; Jev and Luna track each other closely.",
        },
        {
          src: "/assets/case-studies/no-chain-of-thought-required/banking77/reliability.png",
          alt: "Banking77 reliability diagrams for Jev and the GPT models",
          caption: "No calibration advantage here: Jev and Luna both score ECE 0.101, and Sol is best at 0.073.",
        },
        {
          src: "/assets/case-studies/no-chain-of-thought-required/banking77/latency_distribution.png",
          alt: "Banking77 per-request latency distributions on a log scale for three models",
          caption: "Jev p50 202 ms against 1.15 s (Luna) and 1.52 s (Sol); its p99 is 352 ms against 7.9 s and 8.9 s.",
        },
      ],
    },
    {
      eyebrow: "Synthesis",
      heading: "What the architecture predicted, and what held",
      paragraphs: [
        "Latency: flat and tail-free. Across 1,973 calls Jev's median stayed at 200–221 ms whether the input was 473 tokens or 1,706. Its p99 never exceeded 352 ms, and it needed zero retries. The LLMs' p99 ranged from 6.5 to 22 s, their slowest calls took 9 to 59 s, and they needed six retries and lost two emails to timeouts. Without reasoning the LLMs emit only ~20 tokens, so the gap is not decode length. It is the difference between a purpose-built decision service and general-purpose generative serving, and it shows most in the tail, which is what an inline decision in a request path has to budget for.",
        "Cost: decided by what the prompt is made of. Jev bills input only and makes output free, but on every run its request encoded 1.3–1.7× more input tokens than the equivalent LLM prompt. It wins when unique content dominates the prompt (emails, FOLIO premises) or when the alternative needs reasoning tokens billed as output (102× against Sol-high). It loses when a large fixed prefix can be cached, as with Banking77's label list.",
        "Calibration: useful, not magic. RLCD-trained probabilities beat verbalized confidence on FOLIO (ECE 0.036 against 0.15–0.41) and on my inbox (0.22 against 0.30), and tied on Banking77 (0.101). The comparison is against the confidence these APIs return as prompted, not against logprobs, so it measures the interface as much as the model. But the interface is what production code consumes, and Jev's probability is the signal both routers in this study were built on.",
        "The verdict: no chain of thought is required for decisions that one careful read can settle, and that covered more of FOLIO than I expected. When the boundary is subtle and the label set is large, or when proving a negative takes several hops, the generalist with a scratchpad still wins. The architecture that follows is a router: Jev in the request path, with its probability deciding what escalates.",
      ],
    },
    {
      eyebrow: "Threats to validity",
      heading: "What these numbers do not show",
      paragraphs: [
        "Latency was measured in throughput mode (six requests in flight, models run one after another) rather than the harness's interleaved latency mode. It is client-side wall time from one machine and includes network paths to different providers.",
        "The OpenAI models sampled at temperature 1.0, and every run used a single seed, so the close results (Jev against Luna on Banking77 and FOLIO) could move on a rerun.",
        "Label definitions were thin; Banking77 labels were described by name only. Both architectures would likely improve with real definitions, and which would improve more is untested.",
        "FOLIO's 203 items come from 73 premise sets, so its bootstrap intervals are too narrow. It is also a public benchmark, and contamination cannot be ruled out for any model.",
        "The inbox labels come from Gmail's own classifier on one person's mailbox, so that run measures agreement with Gmail, not correctness.",
      ],
    },
  ],
};
