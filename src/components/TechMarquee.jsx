import PropTypes from "prop-types";

const defaultItems = [
  "Python",
  "LangChain",
  "Azure OpenAI",
  "Azure AI Foundry",
  "FastAPI",
  "React",
  "Next.js",
  "TypeScript",
  "Supabase",
  "RAG",
  "Agentic workflows",
  "Evaluation",
];

function TechMarquee({ items = defaultItems }) {
  const marqueeItems = [...items, ...items];

  return (
    <div className="tech-marquee-shell" role="marquee" aria-label={`Tools: ${items.join(", ")}`}>
      <div className="marquee-track font-mono text-xs uppercase tracking-[0.06em] text-[var(--color-text-subtle)]" aria-hidden="true">
        {marqueeItems.map((item, index) => (
          <span className="tech-marquee-item" key={`${item}-${index}`}>
            {item}
            <span className="marquee-separator">/</span>
          </span>
        ))}
      </div>
    </div>
  );
}

TechMarquee.propTypes = {
  items: PropTypes.arrayOf(PropTypes.string),
};

export default TechMarquee;
