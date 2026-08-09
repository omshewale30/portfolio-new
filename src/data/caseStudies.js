export const caseStudies = [
  {
    slug: "charlotte",
    title: "Charlotte — Enterprise AI Platform",
    category: "Enterprise AI",
    year: "2025",
    summary:
      "A production RAG system that turns sprawling policy manuals, EDI reports, and transaction data into grounded answers for UNC operational teams.",
    before: {
      title: "Answers were buried in fragmented operational data",
      description:
        "Staff manually searched policy manuals, EDI reports, and transaction records to answer routine financial questions across the Cashier's Office, Campus Health, and Accounting.",
    },
    intervention: {
      title: "A governed retrieval workflow, not a generic chatbot",
      description:
        "Charlotte combines vector retrieval, Azure OpenAI, and source-grounded responses in a system designed around UNC's compliance, deployment, and data-governance requirements.",
    },
    after: {
      title: "Instant retrieval replaced recurring manual research",
      description:
        "The deployed workflow is projected to eliminate more than 200 hours of manual research each year while giving teams a consistent way to query operational knowledge.",
    },
    constraints: ["UNC ITS compliance review", "Data governance", "Azure deployment"],
    decisionsDefended: [
      "Ground answers in approved internal documents",
      "Keep retrieval and citations visible",
      "Design for multiple operational departments",
    ],
    whatIdDoDifferently: "",
    images: [
      {
        src: "/assets/case-studies/charlotte/Charlotte.png",
        alt: "Charlotte retrieval pipeline from a staff question through grounded source retrieval",
        label: "Architecture diagram",
      },
    ],
    stats: [
      { label: "Manual hours eliminated / yr", value: "200+" },
      { label: "Policy corpus", value: "~600 pages" },
    ],
    tags: ["RAG", "Azure OpenAI", "Python", "Data Governance"],
    externalLink: "https://charlotte-frontend.azurewebsites.net/",
  },
  {
    slug: "heelper",
    title: "Heelper — AI Email Assistant",
    category: "Agentic Workflow",
    year: "2025",
    summary:
      "An agentic email workflow for the UNC Cashier's Office that classifies, routes, and drafts contextual responses for high-volume inbound communication.",
    before: {
      title: "High-volume email required repetitive manual triage",
      description:
        "Cashier's Office staff repeatedly sorted inbound requests, identified the right workflow, and drafted responses before the underlying work could begin.",
    },
    intervention: {
      title: "The workflow was redesigned around intent",
      description:
        "Heelper uses a Python automation backend and LLM orchestration to classify messages, route work, and draft context-aware responses inside the department's operating process.",
    },
    after: {
      title: "Triage became a configurable AI-assisted workflow",
      description:
        "The system reduces manual triage and creates a repeatable foundation for department-specific automation rather than adding a standalone chat interface.",
    },
    constraints: ["Contextual accuracy", "Workflow integration", "Human review"],
    decisionsDefended: [
      "Automate the handoffs around the email, not just the reply",
      "Keep department-specific configuration explicit",
      "Preserve human review for consequential communication",
    ],
    whatIdDoDifferently: "",
    images: [
      {
        src: "/assets/case-studies/heelper/Heelper.png",
        alt: "Heelper workflow for classifying, routing, and drafting responses to incoming email",
        label: "Workflow diagram",
      },
    ],
    stats: [
      { label: "Workflow", value: "Email triage" },
      { label: "Operating model", value: "Human + AI" },
    ],
    tags: ["Agentic AI", "Python", "Automation", "Human in the Loop"],
    externalLink: "https://heelper-frontend.nicedesert-a13116bc.eastus.azurecontainerapps.io/",
  },
  {
    slug: "redesign-dont-redecorate",
    title: "Redesign, Don't Redecorate",
    category: "Systems Research",
    year: "2025",
    summary:
      "A systems research paper examining why enterprise AI creates value when it redesigns a workflow instead of decorating the existing process.",
    before: {
      title: "AI adoption was framed as a model-selection problem",
      description:
        "Enterprise teams often add an AI interface without changing the bottlenecks, handoffs, and cognitive load that make the underlying workflow expensive.",
    },
    intervention: {
      title: "Two production-grade systems became the evidence",
      description:
        "The paper evaluates Charlotte and Heelper through a human-in-the-loop lens and develops a quantitative framework connecting task elimination to organizational ROI.",
    },
    after: {
      title: "The evaluation moved from novelty to workflow impact",
      description:
        "The resulting framework centers domain grounding, human oversight, and measurable operational change as the standard for evaluating enterprise AI systems.",
    },
    constraints: ["High-stakes workflows", "Human oversight", "Measurable ROI"],
    decisionsDefended: [
      "Evaluate systems in their operating context",
      "Treat cognitive load as a design constraint",
      "Connect automation to measurable organizational value",
    ],
    whatIdDoDifferently: "",
    images: [
      {
        src: "/assets/case-studies/redesign-dont-redecorate/RDR.png",
        alt: "Research framework connecting workflow redesign, human oversight, and measurable impact",
        label: "Research framework",
      },
    ],
    stats: [
      { label: "Systems evaluated", value: "2" },
      { label: "Core lens", value: "HITL" },
    ],
    tags: ["Research", "HCI", "Agentic AI", "Enterprise Systems"],
    externalLink: null,
  },
];
