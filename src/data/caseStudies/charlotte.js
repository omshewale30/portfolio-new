export default {
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
};
