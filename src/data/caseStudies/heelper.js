export default {
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
};
